// notes/databases/sql_transactions.js — Transactions & Concurrency
Object.assign(TOPIC_CONTENT, {
  "sql_transactions": `<main>
  <h1>Transactions &amp; Concurrency</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Transactions &amp; Concurrency</span></div>
  <p class="lead">What stops a database from selling the last samosa twice, losing money halfway through an order, or forgetting an order after a power cut, when thousands of people use it at once. The whole note follows ONE running example: <strong>Biteful</strong> (the food-delivery company from <a class="xref" data-note="sql_joins">JOINs</a> and <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>) plus three small tables for this story: a <code>menu</code> where Biryani Bros has exactly <strong>1 Samosa</strong> left, <code>wallets</code> for Ben (₹500) and Farah (₹300), and <code>riders</code> with Ravi and Sara on duty in Mumbai. Every two-person scene below was run with <strong>two real connections</strong> to PostgreSQL 16 driven from one Python script, and every step is printed in the order it really happened. Where another engine differs, it is said, and marked when it was not run here.</p>

  <h2 id="st-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="st-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">SQL queries</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">one user, right answer</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#st-a0)"/>
<rect x="150" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="210" y="41" text-anchor="middle" font-size="12">Indexes</text><text x="210" y="58" text-anchor="middle" class="tm" font-size="10">one user, fast</text>
<line x1="270" y1="45" x2="288" y2="45" stroke="currentColor" marker-end="url(#st-a0)"/>
<rect x="290" y="20" width="140" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="360" y="41" text-anchor="middle" font-size="12" font-weight="700">Transactions</text><text x="360" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="430" y1="45" x2="448" y2="45" stroke="currentColor" marker-end="url(#st-a0)"/>
<rect x="450" y="20" width="95" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="497" y="41" text-anchor="middle" font-size="12">Modeling</text><text x="497" y="58" text-anchor="middle" class="tm" font-size="10">table design</text>
<line x1="545" y1="45" x2="563" y2="45" stroke="currentColor" marker-end="url(#st-a0)"/>
<rect x="565" y="20" width="85" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="607" y="41" text-anchor="middle" font-size="12">NoSQL</text><text x="607" y="58" text-anchor="middle" class="tm" font-size="10">MongoDB</text>
<text x="10" y="105" class="tm" font-size="10.5">Earlier notes assumed one person at a time. Here many people read and write the same rows at the same moment,</text>
<text x="10" y="123" class="tm" font-size="10.5">machines crash, and one server stops being enough. Correctness under all three is what this note is about.</text>
</svg><figcaption>The SQL group of the Databases track. Queries were right and fast for one user; now they must stay right for thousands at once.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: one user at a time</b><span><a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> taught INSERT, UPDATE and constraints; <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> showed that an UPDATE writes a <em>new row version</em> and that VACUUM cleans the old ones. Nobody else was ever using the database at the same moment.</span></li>
    <li><b>This note adds: many users, failures and many machines</b><span>Transactions and ACID; the anomalies two concurrent sessions cause; isolation levels that prevent them; MVCC (why those row versions exist); locks and deadlocks; then replicas, sharding and when a NoSQL store is a better fit.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_modeling">Data Modeling</a></b><span>Good table design reduces how much transactions must protect (one fact in one place means one row to lock). The NoSQL trade-offs at the end continue in <a class="xref" data-note="db_types">Types of Databases</a> and <a class="xref" data-note="mongo_design">MongoDB Schema Design</a>.</span></li>
  </ol>

  <h2 id="st-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Running example: Ben and Farah both tap "order Samosa" at Biryani Bros, which has 1 left.</p>
  <ol class="story">
    <li><b>The last samosa</b><span>Q: what goes wrong when an order takes several statements and two people order at once? → a failure halfway leaves stock taken but no payment; two buyers both succeed for 1 samosa. We need "all or nothing"…</span></li>
    <li><b>Transaction</b><span>Q: how do we make 4 statements count as one? → BEGIN … COMMIT / ROLLBACK; after an error everything is undone. But what exactly does the database promise about a transaction?</span></li>
    <li><b>ACID</b><span>Q: what are the guarantees? → Atomicity (all or nothing), Consistency (constraints hold), Isolation (others don't see half-done work), Durability (survives a crash, shown with a real crash). Isolation is the slippery one: how isolated?</span></li>
    <li><b>Anomalies</b><span>Q: what can two concurrent sessions do to each other? → five named bugs reproduced: dirty read (impossible in PostgreSQL), non-repeatable read, phantom, lost update (two samosas sold), write skew (no rider left on duty). How do we choose which to prevent?</span></li>
    <li><b>Isolation levels</b><span>Q: which level prevents which bug? → a verified table: READ COMMITTED allows 4, REPEATABLE READ stops 3 more except write skew, SERIALIZABLE stops all by aborting one side. But how can a snapshot show old values while someone else changes them?</span></li>
    <li><b>MVCC</b><span>Q: how do readers see a stable picture without blocking writers? → every UPDATE writes a new version; xmin/xmax say which transactions can see which version. But two <em>writers</em> on the same row still can't both win…</span></li>
    <li><b>Locks and SELECT … FOR UPDATE</b><span>Q: how do we make the second buyer wait and re-check? → row locks; FOR UPDATE locks while reading; the samosa sells exactly once. But waiting can go in a circle…</span></li>
    <li><b>Deadlock</b><span>Q: what if A waits for B while B waits for A? → reproduced; PostgreSQL kills one after 1 s; prevent by locking in a fixed order. All this is one server. What if it dies, or can't keep up with reads?</span></li>
    <li><b>Replication and read replicas</b><span>Q: how do we get copies for safety and read traffic? → a real streaming standby; writes on the primary, reads anywhere, but replicas lag (shown by pausing replay). Writes still go to one machine…</span></li>
    <li><b>Sharding</b><span>Q: what if writes or data outgrow one machine? → split rows across servers by a key; a transfer across shards is no longer one transaction. Maybe a different kind of database fits better…</span></li>
    <li><b>SQL vs NoSQL</b><span>Q: when do we give up some of these guarantees on purpose? → trade-off table: schema, joins, transactions, scaling, consistency.</span></li>
  </ol>

  <h2 id="st-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Transactions &amp; Concurrency</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Transactions</div>
      <ul>
        <li><b>BEGIN … COMMIT / ROLLBACK</b> — many statements, one unit</li>
        <li><b>Error → aborted</b>; COMMIT then acts as ROLLBACK</li>
        <li><b>SAVEPOINT</b> — undo part of a transaction</li>
        <li>⚠ <b>Autocommit</b> — each statement alone</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">ACID</div>
      <ul>
        <li><b>A</b> all or nothing · <b>C</b> constraints hold</li>
        <li><b>I</b> no half-done work visible · <b>D</b> survives crash (WAL)</li>
        <li>💡 cart: pay for everything or put it all back</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Anomalies</div>
      <ul>
        <li><b>Dirty read</b> — never in PostgreSQL</li>
        <li><b>Non-repeatable</b> — same row, new value</li>
        <li><b>Phantom</b> — same filter, new rows</li>
        <li><b>Lost update</b> — read-compute-write overwrites</li>
        <li><b>Write skew</b> — different rows, broken rule</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Isolation levels</div>
      <ul>
        <li><b>READ COMMITTED</b> (default) — fresh snapshot per statement</li>
        <li><b>REPEATABLE READ</b> — one snapshot per transaction</li>
        <li><b>SERIALIZABLE</b> — aborts one side (40001) → retry</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">MVCC &amp; locks</div>
      <ul>
        <li><b>xmin / xmax</b> — creating / deleting transaction</li>
        <li>Readers never block writers; VACUUM removes dead versions</li>
        <li><b>FOR UPDATE</b> — lock while reading; <b>SKIP LOCKED</b> for queues</li>
        <li><b>Deadlock</b> — cycle → one killed; lock in fixed order</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Scaling</div>
      <ul>
        <li><b>Replica</b> — WAL stream; reads only; ⚠ lag</li>
        <li><b>Sharding</b> — rows split by key across servers; cross-shard = no single transaction</li>
        <li><b>NoSQL</b> — trade joins/transactions for flexible schema and scale-out</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="st-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="st-samosa"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Last Samosa</span><span class="rm-sub">Half-done work, double sale</span></div></div>
      <div class="rm-item rm-done" data-target="st-txn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Transactions</span><span class="rm-sub">BEGIN, COMMIT, ROLLBACK</span></div></div>
      <div class="rm-item rm-done" data-target="st-acid"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">ACID, Each Shown</span><span class="rm-sub">Including a real crash</span></div></div>
      <div class="rm-item rm-done" data-target="st-anom"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Anomalies</span><span class="rm-sub">Two real sessions</span></div></div>
      <div class="rm-item rm-done" data-target="st-iso"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Isolation Levels</span><span class="rm-sub">Verified table</span></div></div>
      <div class="rm-item rm-done" data-target="st-mvcc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">MVCC</span><span class="rm-sub">xmin, xmax, versions</span></div></div>
      <div class="rm-item rm-done" data-target="st-locks"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Locks &amp; FOR UPDATE</span><span class="rm-sub">One samosa, one sale</span></div></div>
      <div class="rm-item rm-done" data-target="st-dead"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Deadlock</span><span class="rm-sub">Reproduced and prevented</span></div></div>
      <div class="rm-item rm-done" data-target="st-repl"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Replication</span><span class="rm-sub">A real standby, real lag</span></div></div>
      <div class="rm-item rm-done" data-target="st-shard"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Sharding</span><span class="rm-sub">Splitting rows across servers</span></div></div>
      <div class="rm-item rm-done" data-target="st-nosql"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">SQL vs NoSQL</span><span class="rm-sub">Trade-offs</span></div></div>
      <div class="rm-item rm-done" data-target="st-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture</span></div></div>
      <div class="rm-item rm-done" data-target="st-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Checklist</span></div></div>
      <div class="rm-item rm-done" data-target="st-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="st-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="st-samosa"><span class="num">01</span>Two People Order the Last Samosa</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every earlier note ran one statement at a time for one user. But placing a Biteful order is <em>several</em> statements (take the stock, create the order, add its line, take the money), and at 8 pm hundreds of people place orders at the same moment. What can go wrong between those statements, and between those people?</p>
  </div>
  <p>The running example. Besides the usual Biteful tables, three small ones:</p>
  <div class="fx" data-lang="sql">SELECT * FROM menu ORDER BY restaurant_id, item;
SELECT w.customer_id, c.name, w.balance FROM wallets w JOIN customers c USING (customer_id);
SELECT * FROM riders ORDER BY rider_id;</div>
  <table class="tbl out"><caption>menu</caption><tr><th>restaurant_id</th><th>item</th><th>price</th><th>stock</th></tr><tr><td>11</td><td>Chicken Biryani</td><td>350.00</td><td>20</td></tr><tr><td>11</td><td>Samosa</td><td>40.00</td><td>1</td></tr><tr><td>13</td><td>Buddha Bowl</td><td>310.00</td><td>5</td></tr></table>
  <table class="tbl out"><caption>wallets</caption><tr><th>customer_id</th><th>name</th><th>balance</th></tr><tr><td>2</td><td>Ben</td><td>500.00</td></tr><tr><td>6</td><td>Farah</td><td>300.00</td></tr></table>
  <table class="tbl out"><caption>riders</caption><tr><th>rider_id</th><th>name</th><th>city</th><th>on_duty</th></tr><tr><td>1</td><td>Ravi</td><td>Mumbai</td><td>t</td></tr><tr><td>2</td><td>Sara</td><td>Mumbai</td><td>t</td></tr><tr><td>3</td><td>Imran</td><td>Pune</td><td>t</td></tr></table>
  <h3>Problem 1: a failure halfway</h3>
  <p>Farah (wallet ₹300) orders one Chicken Biryani (₹350). The app runs four statements, one after another, each saved immediately (that is the default <strong>autocommit</strong> mode: every statement is its own little unit):</p>
  <div class="fx" data-lang="sql">UPDATE menu SET stock = stock - 1 WHERE restaurant_id = 11 AND item = 'Chicken Biryani';
INSERT INTO orders VALUES (111, 6, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
UPDATE wallets SET balance = balance - 350 WHERE customer_id = 6;
SELECT item, stock FROM menu WHERE item = 'Chicken Biryani';
SELECT order_id, customer_id, amount, status FROM orders WHERE order_id = 111;
SELECT customer_id, balance FROM wallets WHERE customer_id = 6;</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <div class="fx" data-lang="text">INSERT 0 1</div>
  <div class="fx" data-lang="text">INSERT 0 1</div>
  <div class="fx" data-lang="text">ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (6, -50.00).</div>
  <table class="tbl out"><caption>After the four statements: stock taken</caption><tr><th>item</th><th>stock</th></tr><tr><td>Chicken Biryani</td><td>19</td></tr></table>
  <table class="tbl out"><caption>order created</caption><tr><th>order_id</th><th>customer_id</th><th>amount</th><th>status</th></tr><tr><td>111</td><td>6</td><td>350.00</td><td>pending</td></tr></table>
  <table class="tbl out"><caption>wallet untouched</caption><tr><th>customer_id</th><th>balance</th></tr><tr><td>6</td><td>300.00</td></tr></table>
  <p>Trace it: statements 1–3 succeeded and were saved. Statement 4 failed, because the <code>CHECK (balance &gt;= 0)</code> constraint refuses ₹300 − ₹350 = −₹50. Result: stock went 20 → 19, an order exists, and nobody paid. Biteful just gave away a biryani. The database did exactly what it was told, one statement at a time.</p>
  <h3>Problem 2: two people at once</h3>
  <p>Now Ben and Farah both tap "order Samosa" at the same second. The app logic is the obvious one: read the stock; if it is above 0, write stock − 1 and create the order. Two real connections, A (Ben) and B (Farah), each step printed in the order it ran (the helper <code>sessions.py</code> is shown in section 04):</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')          # A = Ben's request, B = Farah's request

A.run("SELECT stock FROM menu WHERE item = 'Samosa'")          # Ben's app sees 1
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")          # Farah's app sees 1
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")       # 1 - 1
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
B.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")       # 1 - 1
B.run("INSERT INTO orders VALUES (112, 6, 11, now(), 'pending', 40, NULL)")
A.run("SELECT count(*) FROM orders WHERE order_id IN (111, 112)")</div>
  <div class="fx" data-lang="text"> 1 A  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 2 B  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 3 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 4 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 5 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 6 B  INSERT INTO orders VALUES (112, 6, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 7 A  SELECT count(*) FROM orders WHERE order_id IN (111, 112)         → 2</div>
  <p>Both read 1 before either wrote, so both decided "there is one left". Two orders, one samosa. Neither statement was wrong on its own; the problem is the <em>gap</em> between reading and writing, and another person acting inside that gap.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two waiters each glance at the cake counter, see one slice, and each promise it to their table. Nobody lied; they just looked at the same moment.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Concurrency</strong>: several sessions (connections, each one user's or request's line to the database) running statements at overlapping times. <strong>Autocommit</strong>: the default mode where each statement is saved as soon as it finishes. Problem 1 needs a way to group statements; problem 2 needs rules for what one session may see of another's work.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"It works when I test it." Both bugs need bad timing: a failure at statement 4, or two requests within milliseconds. They pass every single-user test and appear on sale day.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: transactions.</b> For problem 1 we need to tell the database "these four statements belong together: all of them or none of them".</div>

  <h2 id="st-txn"><span class="num">02</span>Transactions: BEGIN, COMMIT, ROLLBACK</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Farah's order left stock taken and no payment, because each statement was saved on its own. How do we make the four statements succeed or fail as <em>one</em>?</p>
  </div>
  <p>A <strong>transaction</strong> is a group of statements the database treats as a single unit. <code>BEGIN</code> opens it; <code>COMMIT</code> saves all its changes at once; <code>ROLLBACK</code> throws all of them away. The same order, inside a transaction:</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE menu SET stock = stock - 1 WHERE restaurant_id = 11 AND item = 'Chicken Biryani';
INSERT INTO orders VALUES (111, 6, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
UPDATE wallets SET balance = balance - 350 WHERE customer_id = 6;
SELECT stock FROM menu WHERE item = 'Chicken Biryani';
ROLLBACK;
SELECT stock FROM menu WHERE item = 'Chicken Biryani';
SELECT count(*) AS order_111 FROM orders WHERE order_id = 111;</div>
  <div class="fx" data-lang="text">BEGIN
UPDATE 1
INSERT 0 1
INSERT 0 1
ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (6, -50.00).
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK
 stock 
-------
    20
(1 row)

 order_111 
-----------
         0
(1 row)</div>
  <p>Read the output top to bottom. The first three statements succeed. The wallet UPDATE fails. From that moment the transaction is <strong>aborted</strong>: PostgreSQL refuses every further command ("current transaction is aborted, commands ignored until end of transaction block") until you end it. <code>ROLLBACK</code> undoes the stock change and both inserts: stock is 20 again and order 111 doesn't exist. Nothing half-done remains. (If you type <code>COMMIT</code> on an aborted transaction, PostgreSQL performs a ROLLBACK and says so.)</p>
  <p>And the successful case, Ben (₹500) ordering the same biryani:</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE menu SET stock = stock - 1 WHERE restaurant_id = 11 AND item = 'Chicken Biryani';
INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
UPDATE wallets SET balance = balance - 350 WHERE customer_id = 2;
COMMIT;
SELECT (SELECT stock FROM menu WHERE item = 'Chicken Biryani') AS stock,
       (SELECT balance FROM wallets WHERE customer_id = 2) AS ben_wallet,
       (SELECT count(*) FROM order_items WHERE order_id = 111) AS lines;</div>
  <div class="fx" data-lang="text">BEGIN
UPDATE 1
INSERT 0 1
INSERT 0 1
UPDATE 1
COMMIT
 stock | ben_wallet | lines 
-------+------------+-------
    19 |     150.00 |     1
(1 row)</div>
  <p>All four changes became visible together at COMMIT: stock 19, Ben's wallet 150, one order line.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopping cart. You add items (statements), then either pay for everything (COMMIT) or walk away and every item goes back on the shelf (ROLLBACK). Nobody else sees your cart until you pay.</p>
  </div>
  <h3>SAVEPOINT: undo only part</h3>
  <p>A <strong>savepoint</strong> is a checkpoint inside a transaction. Ben's order should keep its biryani line even if an extra item he tapped no longer exists on the menu:</p>
  <div class="fx" data-lang="sql">BEGIN;
INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
SAVEPOINT extras;
INSERT INTO order_items VALUES (999, 'Raita', 1, 50);   -- typo: order 999 doesn't exist
ROLLBACK TO SAVEPOINT extras;
COMMIT;
SELECT order_id, item FROM order_items WHERE order_id = 111;</div>
  <div class="fx" data-lang="text">BEGIN
INSERT 0 1
INSERT 0 1
SAVEPOINT
ERROR:  insert or update on table "order_items" violates foreign key constraint "order_items_order_id_fkey"
DETAIL:  Key (order_id)=(999) is not present in table "orders".
ROLLBACK
COMMIT
 order_id |      item       
----------+-----------------
      111 | Chicken Biryani
(1 row)</div>
  <p>The foreign-key error aborted only the work after the savepoint; <code>ROLLBACK TO SAVEPOINT</code> rewound to it, and the order with its biryani line committed.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>transaction</strong> is a sequence of statements executed as one unit: <code>BEGIN</code> … <code>COMMIT</code> (make all changes permanent and visible) or <code>ROLLBACK</code> (discard all). After an error inside it, the transaction is <strong>aborted</strong> until ROLLBACK (or ROLLBACK TO a savepoint).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: autocommit in tools vs drivers</span>
    <p>In psql, without BEGIN, each statement is its own transaction, so two separate UPDATEs in a script are <em>not</em> atomic. Python's psycopg does the opposite by default: it opens a transaction for you and nothing is saved until <code>conn.commit()</code> (our demos pass <code>autocommit=True</code> and write BEGIN/COMMIT explicitly, so the SQL reads like psql).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ACID.</b> "All or nothing" fixed problem 1. But what exactly does a database promise about a transaction: that constraints hold, that others don't see it half-done, that it survives a crash? Those promises have names.</div>

  <h2 id="st-acid"><span class="num">03</span>ACID, Each Promise Shown</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A transaction is "a unit", but a unit of what, exactly? If the server crashes one millisecond after COMMIT, is Ben's order still there? While Ben's transaction is running, can Farah see its half-done stock change? We need the precise list of promises.</p>
  </div>
  <p>Databases describe the promises with four letters, <strong>ACID</strong>. Each one below is shown on Biteful, not just stated.</p>
  <table class="tbl">
    <tr><th>Letter</th><th>Promise</th><th>Failure it prevents</th><th>How PostgreSQL keeps it</th></tr>
    <tr><td><strong>Atomicity</strong></td><td>All statements apply, or none</td><td>Biryani taken, wallet not charged</td><td>Undo on ROLLBACK/abort; WAL on crash</td></tr>
    <tr><td><strong>Consistency</strong></td><td>Every commit leaves all constraints true</td><td>Negative wallet, order for a missing customer</td><td>CHECK, FOREIGN KEY, UNIQUE, NOT NULL</td></tr>
    <tr><td><strong>Isolation</strong></td><td>Concurrent transactions don't see each other's unfinished work</td><td>Farah sees stock 0 from Ben's order that later fails</td><td>MVCC snapshots and locks (sections 05–07)</td></tr>
    <tr><td><strong>Durability</strong></td><td>Once COMMIT returns, the change survives a crash</td><td>"Order placed!", then lost in a power cut</td><td>Write-ahead log (WAL) flushed to disk at COMMIT</td></tr>
  </table>
  <h3>A: atomicity, even if the app dies mid-transaction</h3>
  <p>Section 02 showed ROLLBACK after an error. Atomicity also covers the app simply disappearing: session A takes the samosa inside a transaction, then its connection drops (the app crashed) before COMMIT.</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
A.conn.close()                                    # the app crashes: no COMMIT, connection gone
print("   A  (connection closed without COMMIT)")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
   A  (connection closed without COMMIT)
 3 B  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1</div>
  <p>The uncommitted change vanished with the connection: stock is still 1.</p>
  <h3>C: consistency, enforced by constraints</h3>
  <div class="fx" data-lang="sql">UPDATE wallets SET balance = balance - 400 WHERE customer_id = 6;
INSERT INTO orders VALUES (111, 99, 11, now(), 'pending', 40, NULL);
SELECT customer_id, balance FROM wallets ORDER BY customer_id;</div>
  <div class="fx" data-lang="text">ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (6, -100.00).</div>
  <div class="fx" data-lang="text">ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".</div>
  <table class="tbl out"><caption>Nothing changed</caption><tr><th>customer_id</th><th>balance</th></tr><tr><td>2</td><td>500.00</td></tr><tr><td>6</td><td>300.00</td></tr></table>
  <p>Farah's ₹300 − ₹400 breaks the CHECK; customer 99 doesn't exist, so the foreign key refuses the order. The database will not commit a state that breaks a rule it knows. (It only knows the rules you declared: "at least one rider on duty" is not a constraint here, which section 04 exploits.)</p>
  <h3>I: isolation, unfinished work is invisible</h3>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")      # A has not committed
A.run("COMMIT")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 3 B  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 4 A  COMMIT                                                           → COMMIT
 5 B  SELECT stock FROM menu WHERE item = 'Samosa'                     → 0</div>
  <p>While A's transaction is open, B still sees 1; it sees 0 only after A commits. How strong this protection is (does B's <em>own</em> transaction keep seeing 1?) is the subject of sections 04–05.</p>
  <h3>D: durability, survive a real crash</h3>
  <p>Before COMMIT returns, PostgreSQL writes a description of the changes to the <strong>write-ahead log</strong> (WAL) and forces it to disk; the table pages themselves may be written later. After a crash, it replays the WAL. We test it for real on this note's own PostgreSQL server: commit an order, then kill the server with <code>-m immediate</code> (no clean shutdown, like pulling the plug on the database process), restart it, and look.</p>
  <div class="fx" data-lang="text">export PATH=/usr/lib/postgresql/16/bin:$PATH
DATA=/var/lib/postgresql/sqlnotes_adv          # this server's data directory
psql -X -c "INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)"   # committed
runuser -u postgres -- pg_ctl -D $DATA stop -m immediate                         # crash
runuser -u postgres -- pg_ctl -D $DATA -l $DATA.log -w start \\
  -o "-p 5491 -k $DATA-sock -c listen_addresses='' -c max_parallel_workers_per_gather=0 -c jit=off" &gt; /dev/null
tail -n 12 $DATA.log | grep -E "not properly shut down|redo starts|redo done|ready to accept" | sed 's/.*LOG: */LOG: /' 
psql -X -c "SELECT order_id, customer_id, amount, status FROM orders WHERE order_id = 111"</div>
  <div class="fx" data-lang="text">INSERT 0 1
waiting for server to shut down.... done
server stopped
LOG: database system was not properly shut down; automatic recovery in progress
LOG: redo starts at 0/C9365D90
LOG: redo done at 0/C97B3100 system usage: CPU: user: 0.00 s, system: 0.00 s, elapsed: 0.01 s
LOG: database system is ready to accept connections
 order_id | customer_id | amount | status  
----------+-------------+--------+---------
      111 |           2 |  40.00 | pending
(1 row)</div>
  <p>The server log shows the recovery: "not properly shut down; automatic recovery in progress", then <em>redo</em> (replaying the WAL from the last checkpoint), and order 111 is there. Because COMMIT waited for the WAL to reach disk, the order survives even though the server died before writing table pages normally.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper writes each sale in a bound register <em>before</em> handing over the goods. If the shop burns down mid-day, the register (WAL) says exactly which sales happened; the shelves (table pages) can be rebuilt from it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ACID</strong>: Atomicity (all or nothing), Consistency (declared constraints hold after every commit), Isolation (concurrent transactions don't interfere, to a configurable degree), Durability (committed data survives crashes; in PostgreSQL via the WAL flushed at COMMIT).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The C in ACID (constraints hold) is not the C in CAP (every replica returns the latest write, section 09). Same letter, different meaning. And durability can be traded away: <code>synchronous_commit = off</code> makes COMMIT return before the WAL flush, risking the last fraction of a second of commits on a crash.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: concurrency anomalies.</b> Isolation looked simple: B didn't see A's uncommitted 0. But the samosa double-sale from section 01 involved no uncommitted reads at all. What exactly can two sessions still do to each other?</div>

  <h2 id="st-anom"><span class="num">04</span>Concurrency Anomalies, Reproduced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Transactions keep half-done work private. Yet two well-behaved transactions running at the same time can still produce results that no one-at-a-time order would. Which kinds of interference exist, and which one sold the samosa twice?</p>
  </div>
  <p>Each kind of interference is called an <strong>anomaly</strong>. All five below were reproduced with two real connections at PostgreSQL's default level, READ COMMITTED, unless stated. The helper that drives the sessions:</p>
  <details><summary>sessions.py: two real connections, steps printed in time order</summary>
  <div class="fx" data-lang="text">"""Drive several real PostgreSQL connections and print every step in time order.

Each Session is its own connection (like two people with their own psql window).
Autocommit is on, so transactions are controlled with plain SQL: BEGIN / COMMIT / ROLLBACK.
A statement that has to wait for a lock is started in a background thread (start),
and its result is printed when it finishes (finish).
"""
import threading, time
import psycopg
from psycopg import sql

STEP = [0]

def show(rows):
    if isinstance(rows, str):
        return rows
    if len(rows) == 1 and len(rows[0]) == 1:
        return str(rows[0][0])
    return ', '.join('(' + ', '.join(str(v) for v in r) + ')' for r in rows)

def log(who, q, result):
    STEP[0] += 1
    q = ' '.join(q.split())
    print(f"{STEP[0]:&gt;2} {who:&lt;2} {q:&lt;64} → {result}")

class Session:
    def __init__(self, name, **conninfo):
        self.name = name
        self.conn = psycopg.connect(autocommit=True, **conninfo)
        self.conn.execute(sql.SQL("SET application_name = {}").format(sql.Literal(name)))

    def _exec(self, q):
        try:
            cur = self.conn.execute(q)
            return show(cur.fetchall()) if cur.description else cur.statusmessage
        except psycopg.Error as e:
            return 'ERROR: ' + e.diag.message_primary

    def run(self, q):
        result = self._exec(q)
        log(self.name, q, result)
        return result

    def start(self, q):
        """Run q in the background (it may block on a lock)."""
        box = {}
        t = threading.Thread(target=lambda: box.setdefault('r', self._exec(q)))
        t.start()
        time.sleep(0.3)
        state = 'still running: waiting for a lock' if t.is_alive() else 'finished'
        log(self.name, q, '... ' + state)
        return (t, box, q)

    def finish(self, job):
        t, box, q = job
        t.join()
        log(self.name, '(the waiting statement)', 'now returns: ' + box['r'])
        return box['r']</div>
  </details>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people editing the same shared spreadsheet. One reads a cell, the other changes it, the first still has the old number in their head. Every anomaly is a version of that.</p>
  </div>
  <h3>1. Dirty read: seeing uncommitted data (impossible in PostgreSQL)</h3>
  <p>A <strong>dirty read</strong> is reading another transaction's change before it commits, a change that may then be rolled back. The SQL standard allows it at READ UNCOMMITTED, so we ask for exactly that:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
B.run("BEGIN")
B.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")           # not committed
A.run("BEGIN ISOLATION LEVEL READ UNCOMMITTED")
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
B.run("ROLLBACK")
A.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 B  BEGIN                                                            → BEGIN
 2 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 3 A  BEGIN ISOLATION LEVEL READ UNCOMMITTED                           → BEGIN
 4 A  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 5 B  ROLLBACK                                                         → ROLLBACK
 6 A  COMMIT                                                           → COMMIT</div>
  <p>A saw 1, the committed value, even at READ UNCOMMITTED: PostgreSQL treats READ UNCOMMITTED as READ COMMITTED and never shows uncommitted data. (SQL Server and MySQL do allow dirty reads at READ UNCOMMITTED per their documentation; not run here.)</p>
  <h3>2. Non-repeatable read: same row, new value</h3>
  <p>The kitchen screen opens a transaction, reads the samosa stock to plan, and reads it again a moment later:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN")                                                     # READ COMMITTED (default)
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
B.run("UPDATE menu SET stock = 5 WHERE item = 'Samosa'")           # autocommit: committed now
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
A.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 A  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 3 B  UPDATE menu SET stock = 5 WHERE item = 'Samosa'                  → UPDATE 1
 4 A  SELECT stock FROM menu WHERE item = 'Samosa'                     → 5
 5 A  COMMIT                                                           → COMMIT</div>
  <p>Same question, same transaction, two answers (1, then 5): at READ COMMITTED each <em>statement</em> sees everything committed before it started. Fine for a quick lookup; wrong for a report whose numbers must add up.</p>
  <h3>3. Phantom read: same filter, new rows</h3>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN")
A.run("SELECT count(*) FROM orders WHERE status = 'pending'")
B.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
A.run("SELECT count(*) FROM orders WHERE status = 'pending'")
A.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 A  SELECT count(*) FROM orders WHERE status = 'pending'             → 1
 3 B  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 4 A  SELECT count(*) FROM orders WHERE status = 'pending'             → 2
 5 A  COMMIT                                                           → COMMIT</div>
  <p>No existing row changed; a <em>new</em> row matching the filter appeared (a "phantom"), so the count went 1 → 2. (Order 110 was the only pending order.)</p>
  <h3>4. Lost update: the samosa sold twice</h3>
  <p>Section 01 again, now with both requests inside transactions, and with the second writer forced to touch the row while the first holds it:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN"); B.run("BEGIN")
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")              # Ben's app: 1 left
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")              # Farah's app: 1 left
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")           # app computed 1 - 1
job = B.start("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")   # same row: must wait for A
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
A.run("COMMIT")
B.finish(job)
B.run("INSERT INTO orders VALUES (112, 6, 11, now(), 'pending', 40, NULL)")
B.run("COMMIT")
A.run("SELECT count(*) FROM orders WHERE order_id IN (111, 112)")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 B  BEGIN                                                            → BEGIN
 3 A  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 4 B  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 5 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 6 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → ... still running: waiting for a lock
 7 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 8 A  COMMIT                                                           → COMMIT
 9 B  (the waiting statement)                                          → now returns: UPDATE 1
10 B  INSERT INTO orders VALUES (112, 6, 11, now(), 'pending', 40, NULL) → INSERT 0 1
11 B  COMMIT                                                           → COMMIT
12 A  SELECT count(*) FROM orders WHERE order_id IN (111, 112)         → 2</div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="0" y="34" font-weight="bold">A</text><text x="0" y="94" font-weight="bold">B</text>
    <line x1="30" y1="30" x2="590" y2="30" stroke="currentColor" opacity=".3"/>
    <line x1="30" y1="90" x2="590" y2="90" stroke="currentColor" opacity=".3"/>
    <rect x="40" y="16" width="110" height="28" rx="5" class="fb sb"/><text x="95" y="35" text-anchor="middle">read → 1</text>
    <rect x="170" y="76" width="110" height="28" rx="5" class="fb sb"/><text x="225" y="95" text-anchor="middle">read → 1</text>
    <rect x="300" y="16" width="130" height="28" rx="5" class="ft st"/><text x="365" y="35" text-anchor="middle">write 0, commit</text>
    <rect x="450" y="76" width="130" height="28" rx="5" class="fr sr"/><text x="515" y="95" text-anchor="middle">write 0, commit</text>
    <text x="40" y="132" class="tm" font-size="11">samosas sold:</text>
    <text x="365" y="132" text-anchor="middle">1</text><text x="515" y="132" text-anchor="middle" class="tr">2 (only 1 existed)</text>
    <line x1="30" y1="150" x2="590" y2="150" stroke="currentColor" marker-end="url(#st-ar)"/><text x="590" y="166" text-anchor="end" font-size="10" class="tm">time</text>
  </svg><figcaption>Both read 1 before either wrote; B's write is based on a value that was already out of date.</figcaption></figure>
  <p>Step by step: both apps read 1. A writes 0. B tries to write the same row and <em>waits</em> (A holds the row's write lock until it finishes). A commits. B's UPDATE then goes ahead and writes 0, the value its app computed from a stale read. Two orders for one samosa. The database protected the row from simultaneous writes; it could not know B's "0" was computed from an old read. This is the <strong>lost update</strong>, the most common concurrency bug in real apps.</p>
  <h3>5. Write skew: two different rows, one broken rule</h3>
  <p>Biteful's rule: at least one rider must stay on duty in Mumbai. Ravi and Sara are both on duty and both want to go home. Each app checks "is someone else on duty?" and then updates only its own row:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')                                  # A = Ravi's app, B = Sara's app
A.run("BEGIN ISOLATION LEVEL REPEATABLE READ"); B.run("BEGIN ISOLATION LEVEL REPEATABLE READ")
A.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")   # 2: OK for Ravi to leave
B.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")   # 2: OK for Sara to leave
A.run("UPDATE riders SET on_duty = false WHERE name = 'Ravi'")
B.run("UPDATE riders SET on_duty = false WHERE name = 'Sara'")
A.run("COMMIT"); B.run("COMMIT")
A.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL REPEATABLE READ                            → BEGIN
 2 B  BEGIN ISOLATION LEVEL REPEATABLE READ                            → BEGIN
 3 A  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty    → 2
 4 B  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty    → 2
 5 A  UPDATE riders SET on_duty = false WHERE name = 'Ravi'            → UPDATE 1
 6 B  UPDATE riders SET on_duty = false WHERE name = 'Sara'            → UPDATE 1
 7 A  COMMIT                                                           → COMMIT
 8 B  COMMIT                                                           → COMMIT
 9 A  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty    → 0</div>
  <p>Nobody is on duty in Mumbai, even at REPEATABLE READ. No row was written twice, so no row lock conflicted; each transaction's check was true <em>in its snapshot</em>. Together they broke a rule neither broke alone.</p>
  <table class="tbl"><caption>The five anomalies on one page</caption>
    <tr><th>Anomaly</th><th>What happens</th><th>Biteful scene</th></tr>
    <tr><td>Dirty read</td><td>See another's uncommitted change</td><td>Never in PostgreSQL (A saw 1)</td></tr>
    <tr><td>Non-repeatable read</td><td>Same row read twice, different values</td><td>Samosa stock 1 then 5</td></tr>
    <tr><td>Phantom read</td><td>Same filter, different set of rows</td><td>Pending orders 1 then 2</td></tr>
    <tr><td>Lost update</td><td>Read-compute-write overwrites another's write</td><td>Two orders, one samosa</td></tr>
    <tr><td>Write skew</td><td>Two transactions write different rows based on the same read; a rule breaks</td><td>No rider on duty</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>concurrency anomaly</strong> is a result of concurrent transactions that no serial (one-after-another) order of the same transactions could produce. "Serial" is the gold standard: if Ben's and Farah's orders had run one after the other, the second would have seen stock 0 and refused.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thinking "I used a transaction, so I'm safe". All of 2–5 happened <em>inside</em> transactions. A transaction gives all-or-nothing; how much it is shielded from others is a separate setting.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: isolation levels.</b> We have five named bugs. Preventing all of them always would make sessions wait or fail more often. Which setting prevents which bug, and what does each cost?</div>

  <h2 id="st-iso"><span class="num">05</span>Isolation Levels: Which Level Prevents What (Verified)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Four of the five anomalies happened at the default level. The SQL standard defines stronger <strong>isolation levels</strong>. Which anomalies does each actually stop in PostgreSQL, and what does it do instead of letting the anomaly through?</p>
  </div>
  <p>Instead of copying a table from a book, we ran all five scenarios at all four levels, each with two real connections, and recorded what happened:</p>
  <div class="fx" data-lang="text">anomaly             READ UNCOMMITTED   READ COMMITTED     REPEATABLE READ    SERIALIZABLE       
dirty read          prevented          prevented          prevented          prevented          
non-repeatable read happens            happens            prevented          prevented          
phantom read        happens            happens            prevented          prevented          
lost update         happens            happens            prevented (error)  prevented (error)  
write skew          happens            happens            happens            prevented (error)  </div>
  <details><summary>matrix.py: the script that produced this table</summary>
  <div class="fx" data-lang="text">import psycopg

def conn():
    return psycopg.connect(autocommit=True)

admin, A, B = conn(), conn(), conn()
def q(c, sql):
    try:
        cur = c.execute(sql)
        return cur.fetchone()[0] if cur.description else 'ok'
    except psycopg.Error as e:
        return 'ERROR'

def reset():
    for c in (A, B):
        q(c, "ROLLBACK")
    admin.execute("UPDATE menu SET stock = 20 WHERE item = 'Chicken Biryani'")
    admin.execute("UPDATE riders SET on_duty = true")
    admin.execute("DELETE FROM orders WHERE order_id &gt; 110")

def dirty_read(level):
    reset()
    q(B, "BEGIN"); q(B, "UPDATE menu SET stock = 99 WHERE item = 'Chicken Biryani'")
    q(A, f"BEGIN ISOLATION LEVEL {level}")
    seen = q(A, "SELECT stock FROM menu WHERE item = 'Chicken Biryani'")
    q(B, "ROLLBACK"); q(A, "COMMIT")
    return 'happens' if seen == 99 else 'prevented'

def non_repeatable(level):
    reset()
    q(A, f"BEGIN ISOLATION LEVEL {level}")
    r1 = q(A, "SELECT stock FROM menu WHERE item = 'Chicken Biryani'")
    q(B, "UPDATE menu SET stock = 15 WHERE item = 'Chicken Biryani'")
    r2 = q(A, "SELECT stock FROM menu WHERE item = 'Chicken Biryani'")
    q(A, "COMMIT")
    return 'happens' if r1 != r2 else 'prevented'

def phantom(level):
    reset()
    q(A, f"BEGIN ISOLATION LEVEL {level}")
    r1 = q(A, "SELECT count(*) FROM orders WHERE status = 'pending'")
    q(B, "INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
    r2 = q(A, "SELECT count(*) FROM orders WHERE status = 'pending'")
    q(A, "COMMIT")
    return 'happens' if r1 != r2 else 'prevented'

def lost_update(level):
    reset()
    q(A, f"BEGIN ISOLATION LEVEL {level}"); q(B, f"BEGIN ISOLATION LEVEL {level}")
    a = q(A, "SELECT stock FROM menu WHERE item = 'Chicken Biryani'")
    b = q(B, "SELECT stock FROM menu WHERE item = 'Chicken Biryani'")
    q(A, f"UPDATE menu SET stock = {a - 1} WHERE item = 'Chicken Biryani'"); q(A, "COMMIT")
    w = q(B, f"UPDATE menu SET stock = {b - 1} WHERE item = 'Chicken Biryani'"); c = q(B, "COMMIT")
    final = q(admin, "SELECT stock FROM menu WHERE item = 'Chicken Biryani'")
    return 'happens' if final == 19 and w != 'ERROR' else ('prevented (error)' if w == 'ERROR' else 'prevented')

def write_skew(level):
    reset()
    q(A, f"BEGIN ISOLATION LEVEL {level}"); q(B, f"BEGIN ISOLATION LEVEL {level}")
    q(A, "SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
    q(B, "SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
    q(A, "UPDATE riders SET on_duty = false WHERE name = 'Ravi'")
    q(B, "UPDATE riders SET on_duty = false WHERE name = 'Sara'")
    ca = q(A, "COMMIT"); cb = q(B, "COMMIT")
    left = q(admin, "SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
    return 'happens' if left == 0 else 'prevented (error)'

tests = [('dirty read', dirty_read), ('non-repeatable read', non_repeatable), ('phantom read', phantom),
         ('lost update', lost_update), ('write skew', write_skew)]
levels = ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE']
print(f"{'anomaly':&lt;20}" + ''.join(f"{l:&lt;19}" for l in levels))
for name, fn in tests:
    print(f"{name:&lt;20}" + ''.join(f"{fn(l):&lt;19}" for l in levels))</div>
  </details>
  <p>"prevented (error)" means PostgreSQL did not let the anomaly through but also did not silently fix it: the second transaction got an error. At REPEATABLE READ, B's update in the lost-update scene fails like this:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN ISOLATION LEVEL REPEATABLE READ"); B.run("BEGIN ISOLATION LEVEL REPEATABLE READ")
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
job = B.start("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
A.run("COMMIT")
B.finish(job)
B.run("ROLLBACK")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL REPEATABLE READ                            → BEGIN
 2 B  BEGIN ISOLATION LEVEL REPEATABLE READ                            → BEGIN
 3 A  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 4 B  SELECT stock FROM menu WHERE item = 'Samosa'                     → 1
 5 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 6 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → ... still running: waiting for a lock
 7 A  COMMIT                                                           → COMMIT
 8 B  (the waiting statement)                                          → now returns: ERROR: could not serialize access due to concurrent update
 9 B  ROLLBACK                                                         → ROLLBACK</div>
  <p>and in the write-skew scene at SERIALIZABLE, the second COMMIT fails:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN ISOLATION LEVEL SERIALIZABLE"); B.run("BEGIN ISOLATION LEVEL SERIALIZABLE")
A.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
B.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
A.run("UPDATE riders SET on_duty = false WHERE name = 'Ravi'")
B.run("UPDATE riders SET on_duty = false WHERE name = 'Sara'")
A.run("COMMIT"); B.run("COMMIT")
A.run("SELECT name FROM riders WHERE city = 'Mumbai' AND on_duty")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL SERIALIZABLE                               → BEGIN
 2 B  BEGIN ISOLATION LEVEL SERIALIZABLE                               → BEGIN
 3 A  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty    → 2
 4 B  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty    → 2
 5 A  UPDATE riders SET on_duty = false WHERE name = 'Ravi'            → UPDATE 1
 6 B  UPDATE riders SET on_duty = false WHERE name = 'Sara'            → UPDATE 1
 7 A  COMMIT                                                           → COMMIT
 8 B  COMMIT                                                           → ERROR: could not serialize access due to read/write dependencies among transactions
 9 A  SELECT name FROM riders WHERE city = 'Mumbai' AND on_duty        → Sara</div>
  <p>Sara stays on duty. The application is expected to <strong>retry</strong> the failed transaction from the start (error code SQLSTATE <code>40001</code>, "serialization failure"); on retry, Sara's app sees only 1 rider on duty and refuses. A retry loop, run for real:</p>
  <div class="fx" data-lang="py">import psycopg
from psycopg import errors

def go_off_duty(conn, name, other):
    """One attempt; raises SerializationFailure if PostgreSQL aborts it."""
    with conn.transaction():
        conn.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        n = conn.execute("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty").fetchone()[0]
        if other: other()                                  # the other rider acts in the same moment
        if n &lt; 2:
            return f"{name}: only {n} on duty, staying"
        conn.execute("UPDATE riders SET on_duty = false WHERE name = %s", (name,))
        return f"{name}: went off duty"

ravi, sara = psycopg.connect(autocommit=True), psycopg.connect(autocommit=True)
for attempt in (1, 2, 3):
    try:
        # Sara's transaction starts, and Ravi's whole transaction runs and commits inside it
        print(go_off_duty(sara, 'Sara', other=(lambda: print(go_off_duty(ravi, 'Ravi', None))) if attempt == 1 else None))
        break
    except errors.SerializationFailure as e:
        print(f"Sara attempt {attempt}: {e.sqlstate} {e.diag.message_primary} -&gt; retry")
print(ravi.execute("SELECT name FROM riders WHERE city = 'Mumbai' AND on_duty").fetchall())</div>
  <div class="fx" data-lang="text">Ravi: went off duty
Sara attempt 1: 40001 could not serialize access due to read/write dependencies among transactions -&gt; retry
Sara: only 1 on duty, staying
[('Sara',)]</div>
  <table class="tbl"><caption>Summary of the verified table (PostgreSQL 16)</caption>
    <tr><th>Level</th><th>Snapshot taken</th><th>Dirty</th><th>Non-repeatable</th><th>Phantom</th><th>Lost update</th><th>Write skew</th></tr>
    <tr><td>READ UNCOMMITTED</td><td>behaves as READ COMMITTED</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td><strong>READ COMMITTED</strong> (default)</td><td>per statement</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>REPEATABLE READ</td><td>per transaction (first query)</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>Yes</td></tr>
    <tr><td>SERIALIZABLE</td><td>per transaction + dependency tracking</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>No (error)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Studying in a room. READ COMMITTED: the door is open and you notice every change as it happens. REPEATABLE READ: you work from a photo of the room taken when you came in. SERIALIZABLE: it looks as if only one person is ever in the room; if two people's work could not have happened one after the other, one of them is asked to start again.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>isolation level</strong> sets how much a transaction is shielded from concurrent ones (<code>BEGIN ISOLATION LEVEL …</code>). <strong>Snapshot isolation</strong> (PostgreSQL's REPEATABLE READ): the transaction reads one consistent snapshot. <strong>Serializable</strong>: the outcome equals some serial order; PostgreSQL achieves it by aborting a transaction that would break that (SSI), so the application must retry on 40001.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: engines differ</span>
    <p>PostgreSQL's REPEATABLE READ prevents phantoms (stricter than the SQL standard requires) and raises an error on lost updates. MySQL InnoDB's default is REPEATABLE READ and, per its documentation, a plain UPDATE there reads the latest committed row rather than failing; we did not run MySQL here. Never assume concurrency code is portable; test it on your engine.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MVCC.</b> At REPEATABLE READ, session A kept seeing stock 1 after B committed 5. There is only one samosa row. Where does A's old value come from, and how can that work without making B wait?</div>

  <h2 id="st-mvcc"><span class="num">06</span>MVCC: Many Versions of One Row</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A REPEATABLE READ transaction kept reading stock 1 while another session committed 5. If the table held only one copy of the samosa row, either the reader would have to wait for the writer, or it would see the new value. It did neither. How?</p>
  </div>
  <p>PostgreSQL never overwrites a row in place. An UPDATE writes a <strong>new version</strong> of the row and marks the old version as replaced; both stay in the table for a while (<a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> section 02 watched the ctid move). Each version carries two hidden numbers:</p>
  <ul>
    <li><code>xmin</code>: the id of the transaction that <em>created</em> this version.</li>
    <li><code>xmax</code>: the id of the transaction that <em>deleted or replaced</em> it (0 if none yet).</li>
  </ul>
  <p>Each transaction (or, at READ COMMITTED, each statement) takes a <strong>snapshot</strong>: the list of transactions that had committed when it started. A version is visible to you if its xmin committed before your snapshot and its xmax did not. Watch it on the Buddha Bowl row (stock 5), with B updating it while A has an open REPEATABLE READ transaction:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN ISOLATION LEVEL REPEATABLE READ")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
B.run("BEGIN")
B.run("SELECT pg_current_xact_id()")                                    # B's transaction id
B.run("UPDATE menu SET stock = 4 WHERE item = 'Buddha Bowl'")
B.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
B.run("COMMIT")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
A.run("COMMIT")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL REPEATABLE READ                            → BEGIN
 2 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (1404, 0, (0,3), 5)
 3 B  BEGIN                                                            → BEGIN
 4 B  SELECT pg_current_xact_id()                                      → 1912
 5 B  UPDATE menu SET stock = 4 WHERE item = 'Buddha Bowl'             → UPDATE 1
 6 B  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (1912, 0, (0,4), 4)
 7 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (1404, 1912, (0,3), 5)
 8 B  COMMIT                                                           → COMMIT
 9 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (1404, 1912, (0,3), 5)
10 A  COMMIT                                                           → COMMIT
11 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (1912, 0, (0,4), 4)</div>
  <p>Trace the numbers. The original version sits at ctid (0,3), created by the transaction that loaded the data (its xmin). B's UPDATE creates a new version at a new ctid with <code>xmin</code> = B's id and stock 4, and stamps B's id into the old version's <code>xmax</code>. A, whose snapshot was taken before B started, keeps reading the old version (stock 5, xmax = B's id) even after B commits, because B is not in A's snapshot. Once A finishes, a fresh statement sees the new version (stock 4, xmax 0). Nobody waited. Both versions are physically in the page:</p>
  <div class="fx" data-lang="py">import psycopg
c = psycopg.connect(autocommit=True)
c.execute("CREATE EXTENSION IF NOT EXISTS pageinspect")
q = """SELECT lp AS slot, t_xmin AS xmin, t_xmax AS xmax, t_ctid AS points_to
       FROM heap_page_items(get_raw_page('menu', 0)) WHERE lp_flags = 1"""
print("before VACUUM:", c.execute(q).fetchall())
c.execute("VACUUM menu")
print("after VACUUM: ", c.execute(q).fetchall())</div>
  <div class="fx" data-lang="text">before VACUUM: [(1, '1404', '0', '(0,1)'), (2, '1404', '0', '(0,2)'), (3, '1404', '1912', '(0,4)'), (4, '1912', '0', '(0,4)')]
after VACUUM:  [(1, '1404', '0', '(0,1)'), (2, '1404', '0', '(0,2)'), (4, '1912', '0', '(0,4)')]</div>
  <p>Before VACUUM: slot 3 is the old Buddha Bowl version (xmax = B's id, its <code>t_ctid</code> pointing at its replacement), alongside the live versions. After VACUUM: the old version is gone, because no running transaction could still need it.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="158" y="10" width="236" height="56" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity=".5"/>
    <text x="276" y="30" text-anchor="middle">v1 · Buddha Bowl stock 5</text>
    <text x="276" y="48" text-anchor="middle" font-size="10" class="tm">ctid (0,3) · xmin = loader · xmax = B</text>
    <text x="276" y="61" text-anchor="middle" font-size="10" class="tr">dead once B commits and A ends</text>
    <rect x="158" y="98" width="236" height="56" rx="6" class="fg sg"/>
    <text x="276" y="118" text-anchor="middle">v2 · stock 4</text>
    <text x="276" y="136" text-anchor="middle" font-size="10" class="tm">new ctid · xmin = B · xmax 0</text>
    <line x1="276" y1="66" x2="276" y2="96" stroke="currentColor" marker-end="url(#st-ar2)"/><text x="284" y="86" font-size="10" class="tm">UPDATE by B</text>
    <rect x="0" y="22" width="130" height="34" rx="6" class="fb sb"/><text x="65" y="36" text-anchor="middle" font-size="11">A's snapshot</text><text x="65" y="50" text-anchor="middle" font-size="10" class="tm">taken before B</text>
    <line x1="130" y1="39" x2="156" y2="39" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <rect x="0" y="110" width="130" height="34" rx="6" class="fb sb"/><text x="65" y="124" text-anchor="middle" font-size="11">new snapshots</text><text x="65" y="138" text-anchor="middle" font-size="10" class="tm">after B commits</text>
    <line x1="130" y1="127" x2="156" y2="127" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <rect x="432" y="22" width="160" height="34" rx="6" class="fv"/><text x="512" y="43" text-anchor="middle" font-size="11">VACUUM removes v1</text>
    <line x1="430" y1="39" x2="396" y2="39" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <text x="512" y="74" text-anchor="middle" font-size="10" class="tm">only when no snapshot</text><text x="512" y="87" text-anchor="middle" font-size="10" class="tm">can still see it</text>
  </svg><figcaption>One logical row, two physical versions. Each snapshot reads the version that was committed when it was taken.</figcaption></figure>
  <h3>The cost: a long transaction blocks clean-up</h3>
  <p>VACUUM may only remove a dead version when <em>no</em> snapshot could still see it. One forgotten open transaction (a notebook that ran BEGIN and went to lunch) pins every version created after it:</p>
  <div class="fx" data-lang="py">import psycopg
lunch = psycopg.connect(autocommit=True)
lunch.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
lunch.execute("SELECT count(*) FROM menu")                     # snapshot taken, then left open

app = psycopg.connect(autocommit=True)
for s in (19, 18, 17):
    app.execute("UPDATE menu SET stock = %s WHERE item = 'Chicken Biryani'", (s,))

msgs = []
app.add_notice_handler(lambda d: msgs.append(d.message_primary))
app.execute("VACUUM (VERBOSE) menu")
def tuples_line():
    return [line for m in msgs for line in m.split('\\n') if line.startswith('tuples:')][0]
print("lunch transaction open:", tuples_line())
lunch.execute("COMMIT")
msgs.clear(); app.execute("VACUUM (VERBOSE) menu")
print("after it commits:      ", tuples_line())</div>
  <div class="fx" data-lang="text">lunch transaction open: tuples: 0 removed, 6 remain, 3 are dead but not yet removable
after it commits:       tuples: 3 removed, 3 remain, 0 are dead but not yet removable</div>
  <p>With the idle transaction open: 3 dead versions "not yet removable". After it ends: removed. On a busy table, an open transaction left for hours means millions of unremovable versions (<strong>bloat</strong>): bigger tables, slower scans.</p>
  <div class="cards">
    <div><b>Readers vs writers</b><p>Never block each other: each reads its snapshot's version.</p></div>
    <div><b>Writer vs writer</b><p>Same row still waits: there can be only one next version (section 07).</p></div>
    <div><b>VACUUM</b><p>Removes versions no snapshot can see; blocked by long transactions.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Wikipedia page history. An edit creates a new revision; someone reading the old revision is not interrupted. Old revisions are cleared out only when nobody is reading them.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MVCC</strong> (multi-version concurrency control): writes create new row versions stamped with <code>xmin</code>/<code>xmax</code> transaction ids; every transaction reads the versions visible to its <strong>snapshot</strong>. Isolation levels differ only in <em>when</em> the snapshot is taken (per statement or per transaction). VACUUM reclaims dead versions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sessions sitting "idle in transaction" (check <code>pg_stat_activity.state</code>). They hold back VACUUM for the whole database. Set <code>idle_in_transaction_session_timeout</code>, and never keep a transaction open while waiting for a user or an API call.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: locks and SELECT … FOR UPDATE.</b> MVCC lets readers and writers ignore each other. But two writers on the samosa row cannot both create "the next version", and a reader that is about to write (read stock, then decide) needs to stop others from writing in between. That is what locks are for.</div>

  <h2 id="st-locks"><span class="num">07</span>Locks and SELECT … FOR UPDATE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The lost update happened because Farah's app read the stock, then Ben's order took the samosa, then Farah's app wrote a value computed from its stale read. At READ COMMITTED nothing stopped the read from going stale. How do we make the second buyer <em>wait</em> until the first is done, and then see the truth?</p>
  </div>
  <p>Every UPDATE or DELETE takes a <strong>row lock</strong> on the rows it changes, held until COMMIT or ROLLBACK; a second writer on the same row waits (we saw B wait in section 04). <code>SELECT … FOR UPDATE</code> takes that same lock while <em>reading</em>: "I'm reading this because I'm about to change it". Ben and Farah again, now with FOR UPDATE, and a third connection C watching who is waiting:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B, C = Session('A'), Session('B'), Session('C')
A.run("BEGIN"); B.run("BEGIN")
A.run("SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE")          # Ben locks the row: 1 left
job = B.start("SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE")  # Farah must wait
C.run("SELECT application_name, wait_event_type FROM pg_stat_activity WHERE application_name IN ('A','B') ORDER BY 1")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
A.run("COMMIT")
B.finish(job)                                                             # Farah's read returns now
B.run("ROLLBACK")                                                         # her app sees 0: "sold out"
C.run("SELECT count(*) FROM orders WHERE order_id IN (111, 112)")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 B  BEGIN                                                            → BEGIN
 3 A  SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE          → 1
 4 B  SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE          → ... still running: waiting for a lock
 5 C  SELECT application_name, wait_event_type FROM pg_stat_activity WHERE application_name IN ('A','B') ORDER BY 1 → (A, Client), (B, Lock)
 6 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                  → UPDATE 1
 7 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 8 A  COMMIT                                                           → COMMIT
 9 B  (the waiting statement)                                          → now returns: 0
10 B  ROLLBACK                                                         → ROLLBACK
11 C  SELECT count(*) FROM orders WHERE order_id IN (111, 112)         → 1</div>
  <p>Trace it: A's FOR UPDATE locks the row. B's FOR UPDATE on the same row waits (C sees <code>wait_event_type = Lock</code> for B). A sells the samosa and commits, releasing the lock. B's read then returns the <em>new</em> committed stock, 0, so Farah's app says "sold out". One samosa, one order. (At READ COMMITTED, a statement that waited on a lock re-reads the latest committed version of the row before continuing.)</p>
  <h3>Even simpler: let one UPDATE check and change</h3>
  <p>When the decision is just "only if stock is above 0", put the check inside the UPDATE. The row lock plus re-check happen inside one statement:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("BEGIN"); B.run("BEGIN")
A.run("UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0")
job = B.start("UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0")
A.run("COMMIT")
B.finish(job)                       # UPDATE 0: no row matched any more, so the app says "sold out"
B.run("ROLLBACK")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 B  BEGIN                                                            → BEGIN
 3 A  UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0 → UPDATE 1
 4 B  UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0 → ... still running: waiting for a lock
 5 A  COMMIT                                                           → COMMIT
 6 B  (the waiting statement)                                          → now returns: UPDATE 0
 7 B  ROLLBACK                                                         → ROLLBACK</div>
  <p><code>UPDATE 1</code> for Ben, <code>UPDATE 0</code> for Farah: after waiting, B re-evaluated <code>stock &gt; 0</code> on the committed row (stock 0) and changed nothing. The app checks the row count. This is the standard fix for counters, stock and seat bookings.</p>
  <h3>SKIP LOCKED: a dispatch queue</h3>
  <p>Biteful's dispatchers pull pending orders to assign riders. With plain FOR UPDATE, every dispatcher would queue behind the same first row. <code>SKIP LOCKED</code> makes each one skip rows another holds and take the next free one:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL), (112, 6, 11, now(), 'pending', 40, NULL)")
A.run("BEGIN"); B.run("BEGIN")
A.run("SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED")
B.run("SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED")
A.run("COMMIT"); B.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL), (112, 6, 11, now(), 'pending', 40, NULL) → INSERT 0 2
 2 A  BEGIN                                                            → BEGIN
 3 B  BEGIN                                                            → BEGIN
 4 A  SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED → 110
 5 B  SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED → 111
 6 A  COMMIT                                                           → COMMIT
 7 B  COMMIT                                                           → COMMIT</div>
  <p>A got 110, B got 111, nobody waited, nobody got the same order.</p>
  <h3>Optimistic locking: no lock while a human is typing</h3>
  <p>Two admins open Biteful's menu editor and change the samosa price. A database lock can't be held across minutes of typing and two web requests. Instead, each row carries a <code>version</code>; the save only succeeds if the version is still the one the admin loaded. Both admins loaded price 40, version 1; the first saves 45, the second saves 50:</p>
  <div class="fx" data-lang="sql">ALTER TABLE menu ADD COLUMN version INT NOT NULL DEFAULT 1;
UPDATE menu SET price = 45, version = version + 1 WHERE item = 'Samosa' AND version = 1;
UPDATE menu SET price = 50, version = version + 1 WHERE item = 'Samosa' AND version = 1;
SELECT item, price, version FROM menu WHERE item = 'Samosa';</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <div class="fx" data-lang="text">UPDATE 0</div>
  <table class="tbl out"><caption>Final row</caption><tr><th>item</th><th>price</th><th>version</th></tr><tr><td>Samosa</td><td>45.00</td><td>2</td></tr></table>
  <p>The first save matched version 1 and bumped it to 2 (<code>UPDATE 1</code>). The second looked for version 1, found 2, and changed nothing (<code>UPDATE 0</code>): the app tells that admin "someone changed this; reload". No lock was held while anyone typed.</p>
  <table class="tbl">
    <tr><th></th><th>Pessimistic (FOR UPDATE)</th><th>Optimistic (version column)</th></tr>
    <tr><td>Assumes</td><td>Conflicts are likely</td><td>Conflicts are rare</td></tr>
    <tr><td>Best for</td><td>Hot rows: last samosa, seat booking</td><td>Edit forms, profiles</td></tr>
    <tr><td>Cost</td><td>Waiting; deadlock risk</td><td>Retries when a conflict happens</td></tr>
    <tr><td>Across HTTP requests?</td><td>No</td><td>Yes: the version travels with the form</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A trial room: you lock the door while changing (FOR UPDATE); others wait outside. Optimistic locking is a shared document that warns "this file changed since you opened it" when you save.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>row lock</strong> is taken by UPDATE, DELETE and <code>SELECT … FOR UPDATE</code> (also <code>FOR SHARE</code> and weaker modes) and held until the transaction ends; conflicting lockers wait. <strong>SKIP LOCKED</strong> skips locked rows; <strong>NOWAIT</strong> errors instead of waiting. <strong>Optimistic concurrency control</strong> detects conflicts at write time with a version check instead of locking.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>FOR UPDATE locks only rows that exist and match. It does not stop write skew on "count of riders on duty" unless you lock the rows you counted (both riders), and it cannot lock rows that don't exist yet (a phantom insert). For those: SERIALIZABLE, or a constraint.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: deadlock.</b> Locks make sessions wait. A session waiting for a lock may itself hold locks. What if two sessions end up waiting for each other?</div>

  <h2 id="st-dead"><span class="num">08</span>Deadlock, Reproduced and Prevented</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben sends Farah ₹50 for her share of a shared order while, at the same moment, Farah sends Ben ₹30. Each transfer locks the payer's wallet first, then the receiver's. What happens when each holds the lock the other needs next?</p>
  </div>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')                  # A: Ben pays Farah 50, B: Farah pays Ben 30
A.run("BEGIN"); B.run("BEGIN")
A.run("UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2")    # A locks Ben
B.run("UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6")    # B locks Farah
job = A.start("UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6")  # A waits for Farah
B.run("UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2")    # B waits for Ben: cycle!
A.finish(job)
A.run("ROLLBACK"); B.run("COMMIT")
A.run("SELECT customer_id, balance FROM wallets ORDER BY customer_id")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 B  BEGIN                                                            → BEGIN
 3 A  UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2  → UPDATE 1
 4 B  UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6  → UPDATE 1
 5 A  UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6  → ... still running: waiting for a lock
 6 B  UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2  → UPDATE 1
 7 A  (the waiting statement)                                          → now returns: ERROR: deadlock detected
 8 A  ROLLBACK                                                         → ROLLBACK
 9 B  COMMIT                                                           → COMMIT
10 A  SELECT customer_id, balance FROM wallets ORDER BY customer_id    → (2, 530.00), (6, 270.00)</div>
  <p>Trace it. A holds Ben's row and waits for Farah's. B holds Farah's row and asks for Ben's: a cycle, neither can ever proceed. After <code>deadlock_timeout</code> (1 second by default) PostgreSQL's deadlock detector found the cycle and aborted one transaction (here A, with "deadlock detected"); that released Ben's row, so B's statement (which had been waiting) completed and B committed: Farah 270, Ben 530. A's transfer must be retried.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="40" y="60" width="130" height="44" rx="8" class="fb sb"/><text x="105" y="80" text-anchor="middle" font-weight="bold">A</text><text x="105" y="95" text-anchor="middle" font-size="10" class="tm">Ben pays Farah</text>
    <rect x="430" y="60" width="130" height="44" rx="8" class="fb sb"/><text x="495" y="80" text-anchor="middle" font-weight="bold">B</text><text x="495" y="95" text-anchor="middle" font-size="10" class="tm">Farah pays Ben</text>
    <rect x="240" y="8" width="120" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="300" y="31" text-anchor="middle">Ben's wallet</text>
    <rect x="240" y="122" width="120" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="300" y="145" text-anchor="middle">Farah's wallet</text>
    <line x1="170" y1="66" x2="238" y2="30" class="sg" stroke-width="2.5"/><text x="150" y="40" font-size="11" class="tg">holds</text>
    <line x1="170" y1="98" x2="238" y2="136" class="sr" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#st-ar3)"/><text x="150" y="134" font-size="11" class="tr">waits</text>
    <line x1="430" y1="98" x2="362" y2="136" class="sg" stroke-width="2.5"/><text x="420" y="134" font-size="11" class="tg">holds</text>
    <line x1="430" y1="66" x2="362" y2="30" class="sr" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#st-ar3)"/><text x="420" y="40" font-size="11" class="tr">waits</text>
    <text x="300" y="87" text-anchor="middle" font-size="11" class="tr">cycle → one is killed</text>
  </svg><figcaption>A wait-for cycle. Locking wallets in one fixed order (lower customer_id first) makes the cycle impossible.</figcaption></figure>
  <p>The fix: every transfer locks the two wallets in the <strong>same order</strong>, lower customer_id first, whichever direction the money goes. Same two transfers:</p>
  <div class="fx" data-lang="py">from sessions import Session
A, B = Session('A'), Session('B')
lock_both = "SELECT customer_id FROM wallets WHERE customer_id IN (2, 6) ORDER BY customer_id FOR UPDATE"
A.run("BEGIN"); B.run("BEGIN")
A.run(lock_both)                                   # A locks Ben (2), then Farah (6)
job = B.start(lock_both)                           # B wants Ben (2) first: waits, holding nothing
A.run("UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2")
A.run("UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6")
A.run("COMMIT")
B.finish(job)
B.run("UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6")
B.run("UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2")
B.run("COMMIT")
A.run("SELECT customer_id, balance FROM wallets ORDER BY customer_id")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                            → BEGIN
 2 B  BEGIN                                                            → BEGIN
 3 A  SELECT customer_id FROM wallets WHERE customer_id IN (2, 6) ORDER BY customer_id FOR UPDATE → (2), (6)
 4 B  SELECT customer_id FROM wallets WHERE customer_id IN (2, 6) ORDER BY customer_id FOR UPDATE → ... still running: waiting for a lock
 5 A  UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2  → UPDATE 1
 6 A  UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6  → UPDATE 1
 7 A  COMMIT                                                           → COMMIT
 8 B  (the waiting statement)                                          → now returns: (2), (6)
 9 B  UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6  → UPDATE 1
10 B  UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2  → UPDATE 1
11 B  COMMIT                                                           → COMMIT
12 A  SELECT customer_id, balance FROM wallets ORDER BY customer_id    → (2, 480.00), (6, 320.00)</div>
  <p>B waited while holding nothing, so no cycle could form. Both transfers succeeded: Ben 500 − 50 + 30 = 480, Farah 300 + 50 − 30 = 320.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two cars meet on a one-lane bridge from opposite ends; each waits for the other to reverse. A traffic rule "always enter from the east end first" means they never meet head-on.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>deadlock</strong> is a cycle of transactions each waiting for a lock another holds. PostgreSQL checks for cycles after <code>deadlock_timeout</code> and aborts one with SQLSTATE <code>40P01</code>. Prevent by acquiring locks in a consistent order and keeping transactions short; still catch the error and retry.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deadlocks are not bugs in the database; they are a property of your locking order. Retrying blindly without fixing the order turns them into a steady stream of 1-second stalls under load.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: replication and read replicas.</b> Everything so far protects data on one server. If that server's disk dies, or a million users' reads exceed what it can serve, one machine is not enough. How do we keep copies, and what do the copies cost in correctness?</div>

  <h2 id="st-repl"><span class="num">09</span>Replication and Read Replicas</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Durability survives a crash of the process, not the loss of the machine. And Biteful's "My orders" screen is read a hundred times for every order placed. Can we keep a live copy of the database on another server, and send reads there?</p>
  </div>
  <p>Section 03's WAL is a complete, ordered log of every change. <strong>Streaming replication</strong> ships that log to another server, a <strong>standby</strong> (replica), which replays it and so holds the same data a moment later. The original is the <strong>primary</strong>; only it accepts writes. We built a real standby of this note's server (on the same machine, port 5492, standing in for a second server):</p>
  <div class="fx" data-lang="text">export PATH=/usr/lib/postgresql/16/bin:$PATH
SOCK=/var/lib/postgresql/sqlnotes_adv-sock
REPLICA=/var/lib/postgresql/sqlnotes_adv_replica
# 1. copy the primary's files; -R writes the "I am a standby of 5491" settings
runuser -u postgres -- pg_basebackup -h $SOCK -p 5491 -D $REPLICA -R -X stream -c fast
# 2. start the copy as a standby on port 5492
runuser -u postgres -- pg_ctl -D $REPLICA -l $REPLICA.log -w start -o "-p 5492 -k $SOCK" &gt; /dev/null
psql -X -p 5492 -c "SELECT pg_is_in_recovery() AS is_standby"
psql -X -p 5491 -c "SELECT application_name, state, sync_state FROM pg_stat_replication"</div>
  <div class="fx" data-lang="text"> is_standby 
------------
 t
(1 row)

 application_name |   state   | sync_state 
------------------+-----------+------------
 walreceiver      | streaming | async
(1 row)</div>
  <p>The standby says it is "in recovery" (continuously replaying WAL); the primary lists one streaming replica, asynchronous. Now the behaviour that matters, with P = a connection to the primary and R = a connection to the replica:</p>
  <div class="fx" data-lang="py">import time
from sessions import Session
P, R = Session('P', port=5491), Session('R', port=5492)
P.run("UPDATE menu SET stock = 15 WHERE item = 'Chicken Biryani'")
time.sleep(0.5)
R.run("SELECT stock FROM menu WHERE item = 'Chicken Biryani'")          # the change arrived
R.run("UPDATE menu SET stock = 14 WHERE item = 'Chicken Biryani'")      # replicas are read-only
# make lag visible: pause WAL replay on the replica, as a slow or busy replica would be
R.run("SELECT pg_wal_replay_pause()")
P.run("UPDATE menu SET stock = 10 WHERE item = 'Chicken Biryani'")      # Ben's order on the primary
time.sleep(0.5)
R.run("SELECT stock FROM menu WHERE item = 'Chicken Biryani'")          # stale read!
R.run("SELECT pg_last_wal_receive_lsn() &gt; pg_last_wal_replay_lsn() AS behind")
R.run("SELECT pg_wal_replay_resume()")
time.sleep(0.5)
R.run("SELECT stock FROM menu WHERE item = 'Chicken Biryani'")</div>
  <div class="fx" data-lang="text"> 1 P  UPDATE menu SET stock = 15 WHERE item = 'Chicken Biryani'        → UPDATE 1
 2 R  SELECT stock FROM menu WHERE item = 'Chicken Biryani'            → 15
 3 R  UPDATE menu SET stock = 14 WHERE item = 'Chicken Biryani'        → ERROR: cannot execute UPDATE in a read-only transaction
 4 R  SELECT pg_wal_replay_pause()                                     → 
 5 P  UPDATE menu SET stock = 10 WHERE item = 'Chicken Biryani'        → UPDATE 1
 6 R  SELECT stock FROM menu WHERE item = 'Chicken Biryani'            → 15
 7 R  SELECT pg_last_wal_receive_lsn() &gt; pg_last_wal_replay_lsn() AS behind → True
 8 R  SELECT pg_wal_replay_resume()                                    → 
 9 R  SELECT stock FROM menu WHERE item = 'Chicken Biryani'            → 10</div>
  <p>Trace it: the replica received the change to 15 within half a second; it refused a write ("read-only transaction"). With replay paused (standing in for a replica that is busy or far away), the primary committed 10 while the replica still answered 15: it had <em>received</em> the WAL but not yet <em>replayed</em> it. After resuming, 10. That gap is <strong>replication lag</strong>. A user who places an order (primary) and immediately opens "My orders" (replica) may not see it.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="st-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="56" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="50" y="75" text-anchor="middle">app servers</text><text x="50" y="91" text-anchor="middle" font-size="10" class="tm">many clients</text>
    <line x1="100" y1="78" x2="138" y2="78" stroke="currentColor" marker-end="url(#st-ar4)"/>
    <rect x="140" y="56" width="110" height="44" rx="6" class="fv"/><text x="195" y="75" text-anchor="middle">pooler</text><text x="195" y="91" text-anchor="middle" font-size="10" class="tm">few real conns</text>
    <line x1="250" y1="70" x2="308" y2="34" stroke="currentColor" marker-end="url(#st-ar4)"/><text x="262" y="40" font-size="10" class="tm">writes</text>
    <line x1="250" y1="88" x2="308" y2="122" stroke="currentColor" marker-end="url(#st-ar4)"/><text x="262" y="124" font-size="10" class="tm">reads</text>
    <rect x="310" y="12" width="120" height="44" rx="6" class="fb sb"/><text x="370" y="38" text-anchor="middle" font-weight="bold">Primary 5491</text>
    <rect x="310" y="100" width="120" height="44" rx="6" class="ft st"/><text x="370" y="126" text-anchor="middle">Replica 5492</text>
    <rect x="470" y="100" width="120" height="44" rx="6" class="ft st" stroke-dasharray="4 3"/><text x="530" y="126" text-anchor="middle">more replicas…</text>
    <line x1="370" y1="56" x2="370" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-ar4)"/>
    <line x1="420" y1="56" x2="500" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-ar4)"/>
    <text x="445" y="32" font-size="10" class="tm">WAL stream (async)</text><text x="445" y="46" font-size="10" class="tr">lag: ms … s</text>
  </svg><figcaption>Replicas scale reads and give a standby for failover. Every write still lands on one primary.</figcaption></figure>
  <ul>
    <li><strong>Read-your-writes</strong>: after a user writes, send that user's reads to the primary for a few seconds (or wait until the replica has replayed past the write's WAL position).</li>
    <li><strong>Synchronous replication</strong> (<code>synchronous_standby_names</code>) makes COMMIT wait until a standby has the WAL: no committed data lost if the primary dies, at the cost of slower commits.</li>
    <li><strong>Failover</strong>: if the primary dies, a standby is promoted (<code>pg_ctl promote</code>) to become the new primary.</li>
    <li><strong>Connection pooling</strong> (PgBouncer): each PostgreSQL connection is a separate server process, so thousands of app connections are funnelled into a few dozen real ones.</li>
  </ul>
  <div class="fx" data-lang="text"># clean up: stop and delete the standby
export PATH=/usr/lib/postgresql/16/bin:$PATH
runuser -u postgres -- pg_ctl -D /var/lib/postgresql/sqlnotes_adv_replica -m fast stop
rm -rf /var/lib/postgresql/sqlnotes_adv_replica</div>
  <div class="fx" data-lang="text">waiting for server to shut down.... done
server stopped</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A head office (primary) and branch notice boards (replicas). Changes are decided at head office and then posted to the branches by courier. Branches answer most questions, but for a few minutes after a change a branch can still show yesterday's notice.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Replication</strong> keeps copies of a database on other servers by streaming the WAL. A <strong>read replica</strong> (hot standby) serves read-only queries. <strong>Replication lag</strong> is how far a replica's replayed state is behind the primary. Asynchronous replication can lose the last commits on failover; synchronous cannot, but slows commits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sending every read to replicas, including "read then decide then write" logic. Checking samosa stock on a lagging replica and then ordering on the primary reintroduces the lost update across machines. Reads that feed a write belong on the primary, inside the transaction.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sharding.</b> Replicas multiply read capacity, but every write still goes to the one primary, and every replica stores the whole database. When the writes or the data itself outgrow one machine, the data must be split.</div>

  <h2 id="st-shard"><span class="num">10</span>Sharding: Splitting Rows Across Servers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful goes national: 50 million customers, orders pouring in all day. One primary can't take all the writes, and the data no longer fits on one machine. How do we split it, and which guarantees from sections 02–08 survive the split?</p>
  </div>
  <p><strong>Sharding</strong> splits the rows of a table across several independent database servers (<strong>shards</strong>), each owning part of the data, chosen by a <strong>shard key</strong>. Biteful shards by <code>customer_id</code>: even ids on shard 0, odd ids on shard 1. Traced on the 7 customers: shard 0 gets Ben (2), Dia (4), Farah (6); shard 1 gets Asha (1), Chen (3), Esha (5), Gita (7). Each customer's orders live on that customer's shard. We simulate two servers with two separate databases (two connections that share no transactions), and the application does the routing:</p>
  <div class="fx" data-lang="py">import psycopg
admin = psycopg.connect(dbname='postgres', autocommit=True)
for s in (0, 1):
    admin.execute(f"DROP DATABASE IF EXISTS shard_{s}")
    admin.execute(f"CREATE DATABASE shard_{s}")
shards = [psycopg.connect(dbname=f'shard_{s}', autocommit=True) for s in (0, 1)]
for db in shards:
    db.execute("CREATE TABLE wallets (customer_id INT PRIMARY KEY, balance NUMERIC CHECK (balance &gt;= 0))")

def shard_for(customer_id):          # the routing rule lives in the app (or a proxy)
    return shards[customer_id % 2]

shard_for(2).execute("INSERT INTO wallets VALUES (2, 500)")    # Ben  -&gt; shard 0
shard_for(1).execute("INSERT INTO wallets VALUES (1, 400)")    # Asha -&gt; shard 1

# a single-customer query goes to one shard
print("Ben's wallet:", shard_for(2).execute("SELECT balance FROM wallets WHERE customer_id = 2").fetchone()[0])
# a query across customers must ask every shard and combine the answers in the app
total = sum(db.execute("SELECT coalesce(sum(balance), 0) FROM wallets").fetchone()[0] for db in shards)
print("total of all wallets (asked both shards):", total)

# Ben pays Asha 100: two shards = two separate transactions
shard_for(2).execute("UPDATE wallets SET balance = balance - 100 WHERE customer_id = 2")   # commits on shard 0
try:
    raise ConnectionError("app crashed before crediting Asha on shard 1")
except ConnectionError as e:
    print("!", e)
total = sum(db.execute("SELECT coalesce(sum(balance), 0) FROM wallets").fetchone()[0] for db in shards)
print("total after the crash:", total, "(100 vanished: no transaction spans both shards)")</div>
  <div class="fx" data-lang="text">Ben's wallet: 500
total of all wallets (asked both shards): 900
! app crashed before crediting Asha on shard 1
total after the crash: 800 (100 vanished: no transaction spans both shards)</div>
  <p>Single-shard work (Ben's wallet) stays simple and fast. Cross-shard reads need a fan-out to every shard. And the transfer from Ben (shard 0) to Asha (shard 1) is two separate transactions: the crash in between lost ₹100, exactly the atomicity failure transactions solved on one server. Real systems use two-phase commit, sagas with compensating steps, or choose the shard key so that things that change together live together.</p>
  <table class="tbl">
    <tr><th></th><th>Partitioning (<a class="xref" data-note="sql_optimization">Indexes</a> §11)</th><th>Replication (§09)</th><th>Sharding</th></tr>
    <tr><td>What</td><td>Split a table inside one server</td><td>Full copies on several servers</td><td>Split rows across servers</td></tr>
    <tr><td>Scales</td><td>Big-table maintenance, pruning</td><td>Reads, availability</td><td>Writes and data size</td></tr>
    <tr><td>Costs</td><td>Little: still one database</td><td>Lag; writes still on one primary</td><td>Cross-shard joins/transactions, rebalancing, routing</td></tr>
  </table>
  <div class="callout intu"><span class="label">Choosing a shard key</span>
    <p>Pick the key most queries filter on and that spreads load evenly: <code>customer_id</code> keeps each customer's orders on one shard. <code>city</code> would put all of Mumbai's 8 pm rush on one shard (a hot shard); <code>ordered_at</code> would send every new order to the newest shard.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sharding</strong> (horizontal partitioning across servers) assigns each row to one shard by a shard key (range or hash). It scales writes and storage, but transactions, joins, unique constraints and foreign keys no longer work across shards without extra machinery (Citus, Vitess, distributed SQL databases).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sharding too early. It is the most expensive step on the scaling ladder (tune queries and indexes → bigger machine → pooling → read replicas → partitioning → sharding). Most apps never need it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SQL vs NoSQL.</b> Once data is spread over many machines, some relational guarantees become expensive anyway. Some databases are designed around that from the start. When is giving up joins or multi-row transactions the right trade?</div>

  <h2 id="st-nosql"><span class="num">11</span>SQL vs NoSQL: The Trade-offs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have seen what ACID transactions, joins and constraints give us, and what they cost when the data is split across machines. Document stores, key-value stores and wide-column stores make different choices. Which problems are they better at, and what do you give up?</p>
  </div>
  <p><strong>NoSQL</strong> is an umbrella for non-relational databases: document stores (MongoDB), key-value stores (Redis, DynamoDB), wide-column stores (Cassandra) and graph databases (Neo4j). <a class="xref" data-note="db_types">Types of Databases</a> introduces each; here we compare them on the axes this note built.</p>
  <table class="tbl">
    <tr><th>Axis</th><th>Relational (PostgreSQL, MySQL)</th><th>Typical NoSQL</th></tr>
    <tr><td>Data shape</td><td>Fixed schema; one fact in one place; joins reassemble</td><td>Flexible documents or key → value; data stored the way it is read (often duplicated)</td></tr>
    <tr><td>Transactions</td><td>Multi-row, multi-table ACID by default</td><td>Often single-document/single-key atomicity; multi-document transactions exist in some (MongoDB 4.0+) but cost more</td></tr>
    <tr><td>Consistency across copies</td><td>Primary + replicas; strong on the primary</td><td>Often tunable or eventual consistency across replicas</td></tr>
    <tr><td>Scaling writes</td><td>One primary; sharding is add-on work (§10)</td><td>Many are built to shard by key from day one</td></tr>
    <tr><td>Queries</td><td>Ad-hoc SQL, joins, aggregates over anything</td><td>Fast for access patterns designed in advance; ad-hoc joins limited</td></tr>
    <tr><td>Biteful fit</td><td>Orders, wallets, stock: money and counts that must add up</td><td>Session cache (key-value), menu documents, event logs, recommendations</td></tr>
  </table>
  <div class="callout intu"><span class="label">CAP in one paragraph</span>
    <p>When a network failure splits replicas apart (a <em>partition</em>), a distributed database must choose: refuse some requests until the copies can agree (consistency) or answer from whatever copy is reachable, possibly stale (availability). The stale replica read in section 09 is the "A" choice in miniature. Relational primaries choose consistency for writes; many NoSQL systems let you choose per request.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank ledger vs a notice board. The ledger (SQL) has strict columns and every entry must balance; slow to reorganise, never wrong. The notice board (NoSQL) takes any sheet in any format and copies go up in every branch quickly; great for announcements, risky for account balances.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>Choose <strong>relational</strong> when correctness across rows matters (money, stock, bookings) and queries are varied. Choose a <strong>NoSQL</strong> store when the access pattern is known and simple (by key, by document), the schema varies, and horizontal scale or availability outweighs multi-row transactions. Many systems use both. (<a class="xref" data-note="mongo_design">MongoDB Schema Design</a> shows modelling for access patterns.)</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NoSQL scales, SQL doesn't" as a slogan. A well-indexed PostgreSQL primary with replicas serves very large apps; the samosa and wallet problems of this note don't disappear in a NoSQL store, they become the application's job.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Twelve ideas: are they a list, or one story?</div>

  <h2 id="st-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Transactions, ACID, five anomalies, four levels, MVCC, locks, deadlocks, replicas, shards, NoSQL: how does each one follow from the one before?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="st-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="150" height="50" rx="8" class="fr sr"/><text x="85" y="40" text-anchor="middle" font-weight="700">failure halfway</text><text x="85" y="57" text-anchor="middle" class="tm">biryani, no payment</text>
<line x1="160" y1="45" x2="193" y2="45" stroke="currentColor" marker-end="url(#st-a9)"/>
<rect x="195" y="20" width="150" height="50" rx="8" class="fb sb"/><text x="270" y="40" text-anchor="middle" font-weight="700">transaction · A, C, D</text><text x="270" y="57" text-anchor="middle" class="tm">undo + constraints + WAL</text>
<rect x="10" y="105" width="150" height="50" rx="8" class="fr sr"/><text x="85" y="125" text-anchor="middle" font-weight="700">two at once</text><text x="85" y="142" text-anchor="middle" class="tm">2 orders, 1 samosa</text>
<line x1="160" y1="130" x2="193" y2="130" stroke="currentColor" marker-end="url(#st-a9)"/>
<rect x="195" y="105" width="150" height="50" rx="8" class="fb sb"/><text x="270" y="125" text-anchor="middle" font-weight="700">I: isolation levels</text><text x="270" y="142" text-anchor="middle" class="tm">which anomalies allowed</text>
<line x1="345" y1="120" x2="378" y2="100" stroke="currentColor" marker-end="url(#st-a9)"/>
<line x1="345" y1="140" x2="378" y2="160" stroke="currentColor" marker-end="url(#st-a9)"/>
<rect x="380" y="70" width="150" height="50" rx="8" class="fg sg"/><text x="455" y="90" text-anchor="middle" font-weight="700">MVCC (readers)</text><text x="455" y="107" text-anchor="middle" class="tm">snapshots, xmin/xmax</text>
<rect x="380" y="140" width="150" height="50" rx="8" class="fg sg"/><text x="455" y="160" text-anchor="middle" font-weight="700">locks (writers)</text><text x="455" y="177" text-anchor="middle" class="tm">FOR UPDATE → deadlock</text>
<line x1="530" y1="95" x2="563" y2="95" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-a9)"/>
<rect x="565" y="70" width="145" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="637" y="90" text-anchor="middle">VACUUM / bloat</text><text x="637" y="107" text-anchor="middle" class="tm">cost of versions</text>
<line x1="270" y1="70" x2="270" y2="103" stroke="currentColor" stroke-dasharray="4 3"/>
<rect x="10" y="215" width="200" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="235" text-anchor="middle" font-weight="700">WAL → replicas</text><text x="110" y="252" text-anchor="middle" class="tm">reads scale, lag appears</text>
<line x1="210" y1="240" x2="243" y2="240" stroke="currentColor" marker-end="url(#st-a9)"/>
<rect x="245" y="215" width="200" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="345" y="235" text-anchor="middle" font-weight="700">sharding</text><text x="345" y="252" text-anchor="middle" class="tm">writes scale, transactions split</text>
<line x1="445" y1="240" x2="478" y2="240" stroke="currentColor" marker-end="url(#st-a9)"/>
<rect x="480" y="215" width="230" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="235" text-anchor="middle" font-weight="700">NoSQL trade-offs</text><text x="595" y="252" text-anchor="middle" class="tm">give up joins/multi-row ACID by design</text>
<text x="10" y="290" class="tm">Top: guarantees on one server. Bottom: what happens to those guarantees when there is more than one server.</text>
</g>
</svg><figcaption>Two problems (failure halfway, two at once) drive everything: transactions fix the first; isolation (built from MVCC for readers and locks for writers) fixes the second; the WAL that gives durability also feeds replicas; splitting data across machines weakens the guarantees again.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>Transaction</td><td>BEGIN/COMMIT/ROLLBACK</td><td>several statements as one?</td><td>Farah's failed biryani order fully undone (stock back to 20)</td><td>any multi-statement change</td></tr>
    <tr><td>Atomicity</td><td>undo + aborted state</td><td>all or nothing, even if the app dies?</td><td>closed connection → samosa stock still 1</td><td>always (automatic)</td></tr>
    <tr><td>Consistency</td><td>constraints</td><td>can bad data commit?</td><td>wallet −₹100 and customer 99 refused</td><td>declare every rule you can</td></tr>
    <tr><td>Isolation</td><td>snapshots + locks</td><td>do others see half-done work?</td><td>B saw 1 until A committed 0</td><td>pick a level per transaction</td></tr>
    <tr><td>Durability</td><td>WAL flushed at COMMIT</td><td>survive a crash?</td><td>order 111 there after an immediate stop</td><td>always (don't disable lightly)</td></tr>
    <tr><td>Anomalies</td><td>interleaved transactions</td><td>what can go wrong concurrently?</td><td>stock 1→5; pending 1→2; 2 samosas; 0 riders</td><td>to reason about any concurrent code</td></tr>
    <tr><td>Isolation levels</td><td>when snapshots are taken + SSI</td><td>which anomalies to prevent?</td><td>verified 5 × 4 table</td><td>RC default; RR for reports; SERIALIZABLE for rules across rows</td></tr>
    <tr><td>MVCC</td><td>row versions, xmin/xmax</td><td>how do readers see a stable past?</td><td>A read stock 5 (old version) after B committed 4</td><td>understand bloat, long transactions</td></tr>
    <tr><td>Row locks / FOR UPDATE</td><td>lock on write or read-for-write</td><td>how does the second buyer wait?</td><td>Farah waits, then sees 0; UPDATE … stock &gt; 0 → UPDATE 0</td><td>read-then-write on hot rows</td></tr>
    <tr><td>Optimistic locking</td><td>version column</td><td>conflicts across web requests?</td><td>second admin: UPDATE 0</td><td>rare conflicts, edit forms</td></tr>
    <tr><td>Deadlock</td><td>locks + waiting cycles</td><td>what if waits form a circle?</td><td>"deadlock detected" vs fixed order: 480 / 320</td><td>lock in a consistent order</td></tr>
    <tr><td>Replication</td><td>WAL shipped and replayed</td><td>copies for reads and failover?</td><td>replica 15 while primary 10 (paused replay)</td><td>read scaling, HA</td></tr>
    <tr><td>Sharding</td><td>rows split by key</td><td>writes beyond one server?</td><td>₹100 lost across shards</td><td>last resort for write scale</td></tr>
    <tr><td>NoSQL</td><td>different data/consistency models</td><td>when to trade guarantees?</td><td>cache, documents vs wallets</td><td>known access patterns, flexible schema</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence: <strong>a transaction makes several changes one unit (atomic, constrained, durable via the WAL); isolation decides how much concurrent units can see of each other, built from MVCC snapshots for readers and locks for writers; and every step beyond one server (replicas, shards) trades some of these guarantees for scale.</strong> When a concurrency bug appears, ask: what did each session read, when was its snapshot taken, and what lock (if any) protected the gap between read and write?</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Which slips cause real incidents?</div>

  <h2 id="st-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Concurrency bugs pass every test and appear under load. Which ones should you look for in code review?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: read in the app, write a computed value</span><p><code>SELECT stock</code> then <code>UPDATE … SET stock = :computed</code> sold two samosas. Use <code>SET stock = stock - 1 WHERE stock &gt; 0</code> or FOR UPDATE.</p></div>
  <div class="callout trap"><span class="label">Trap: separate statements without BEGIN</span><p>Autocommit saved the stock change and the order but not the payment.</p></div>
  <div class="callout trap"><span class="label">Trap: assuming REPEATABLE READ prevents everything</span><p>Write skew sent both riders home at REPEATABLE READ. Use SERIALIZABLE (with retries), lock the rows you read, or a constraint.</p></div>
  <div class="callout trap"><span class="label">Trap: SERIALIZABLE without a retry loop</span><p>40001 errors are expected behaviour; without retries users see failures.</p></div>
  <div class="callout trap"><span class="label">Trap: idle in transaction</span><p>An open snapshot blocked VACUUM ("3 are dead but not yet removable"). Never hold a transaction open across user input or API calls.</p></div>
  <div class="callout trap"><span class="label">Trap: locking in different orders</span><p>Ben→Farah and Farah→Ben deadlocked. Lock by ascending id.</p></div>
  <div class="callout trap"><span class="label">Trap: deciding on a replica, writing on the primary</span><p>The replica said 15 while the primary had 10. Reads that feed writes go to the primary.</p></div>
  <div class="callout trap"><span class="label">Trap: cross-shard "transactions" as two commits</span><p>₹100 vanished between shards. Co-locate related data or use sagas / two-phase commit.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above on one page.</div>

  <h2 id="st-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful plus <code>menu</code> (Biryani Bros: Samosa 1 left at ₹40, Chicken Biryani 20 at ₹350; Green Bowl: Buddha Bowl 5), <code>wallets</code> (Ben ₹500, Farah ₹300) and <code>riders</code> (Ravi and Sara on duty in Mumbai; rule: at least one must stay). Sessions A and B are two real connections.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On the running example</th><th>Weakness → next</th></tr>
    <tr><td>Last samosa</td><td>what goes wrong?</td><td>stock taken, no payment; 2 orders for 1 samosa</td><td>need all-or-nothing → transaction</td></tr>
    <tr><td>Transaction</td><td>group statements</td><td>error → aborted → ROLLBACK, stock back to 20</td><td>what exactly is promised? → ACID</td></tr>
    <tr><td>ACID</td><td>the four promises</td><td>closed conn undone; CHECK refuses; B sees 1; order survives crash</td><td>how isolated? → anomalies</td></tr>
    <tr><td>Anomalies</td><td>what concurrency breaks</td><td>1→5; 1→2 rows; 2 samosas; 0 riders</td><td>which to stop? → levels</td></tr>
    <tr><td>Isolation levels</td><td>which level stops which</td><td>RC 4 allowed; RR stops 3 (lost update = error); SER stops all</td><td>how do snapshots work? → MVCC</td></tr>
    <tr><td>MVCC</td><td>stable reads without blocking</td><td>old version (stock 5, xmax = B) still read by A</td><td>writers still conflict → locks</td></tr>
    <tr><td>Locks, FOR UPDATE</td><td>make the 2nd writer wait and re-check</td><td>Farah waits, sees 0; UPDATE 0</td><td>waiting in circles → deadlock</td></tr>
    <tr><td>Deadlock</td><td>cyclic waits</td><td>Ben↔Farah transfers; fixed order → 480 / 320</td><td>one server only → replicas</td></tr>
    <tr><td>Replication</td><td>copies for reads, failover</td><td>replica read-only; 15 vs 10 while paused</td><td>writes on one box → sharding</td></tr>
    <tr><td>Sharding</td><td>split rows across servers</td><td>₹100 lost between two shards</td><td>maybe different model → NoSQL</td></tr>
    <tr><td>SQL vs NoSQL</td><td>when to trade guarantees</td><td>wallets in SQL; cache/documents in NoSQL</td><td>→ <a class="xref" data-note="sql_modeling">Data Modeling</a></td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Transaction</td><td>BEGIN … COMMIT/ROLLBACK; one unit; aborted after an error until ROLLBACK</td></tr>
    <tr><td>ACID</td><td>Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions shielded), Durability (WAL on disk at COMMIT)</td></tr>
    <tr><td>Dirty / non-repeatable / phantom</td><td>see uncommitted data / same row different value / same filter different rows</td></tr>
    <tr><td>Lost update / write skew</td><td>a write based on a stale read overwrites another / two writes to different rows break a rule</td></tr>
    <tr><td>READ COMMITTED / REPEATABLE READ / SERIALIZABLE</td><td>snapshot per statement / per transaction / per transaction + abort on dangerous dependency (retry on 40001)</td></tr>
    <tr><td>MVCC, xmin, xmax</td><td>row versions; creating / replacing transaction id; visibility by snapshot; VACUUM removes dead versions</td></tr>
    <tr><td>Row lock, FOR UPDATE, SKIP LOCKED</td><td>held to transaction end; lock while reading; skip rows others hold</td></tr>
    <tr><td>Deadlock</td><td>cycle of waits; one aborted (40P01) after deadlock_timeout; prevent with a fixed lock order</td></tr>
    <tr><td>Replica, lag</td><td>read-only copy fed by WAL; how far behind it is</td></tr>
    <tr><td>Shard, shard key</td><td>a server holding part of the rows; the column that decides which</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Atomic UPDATE … WHERE</b><p>Counters, stock, seats: check and change in one statement.</p><small>Check the row count (UPDATE 0 = refused)</small></div>
    <div><b>FOR UPDATE</b><p>Read a row, decide in code, then write it, in one short transaction.</p><small>Not across user think-time</small></div>
    <div><b>Version column</b><p>Edit forms across HTTP requests; rare conflicts.</p><small>Not for hot rows (endless retries)</small></div>
    <div><b>REPEATABLE READ</b><p>Reports needing one consistent picture.</p><small>Does not stop write skew</small></div>
    <div><b>SERIALIZABLE</b><p>Rules spanning several rows (on-duty riders).</p><small>Needs a retry loop</small></div>
    <div><b>Replicas</b><p>Read-heavy screens, failover.</p><small>Not for reads that feed writes</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Read-compute-write in the app; statements without BEGIN; trusting REPEATABLE READ against write skew; no retry on 40001/40P01; idle-in-transaction sessions; inconsistent lock order; deciding on a lagging replica; cross-shard "transactions"; engine differences (PostgreSQL never dirty-reads; MySQL defaults to REPEATABLE READ).</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>BEGIN; INSERT …; SELECT 1/0; INSERT …; COMMIT;</code>: how many rows saved?</td><td>None: after the error COMMIT performs ROLLBACK</td></tr>
    <tr><td>Can a PostgreSQL session ever see uncommitted data?</td><td>No, not even at READ UNCOMMITTED</td></tr>
    <tr><td>Lowest PostgreSQL level that stops the lost update?</td><td>REPEATABLE READ (second writer gets a serialization error)</td></tr>
    <tr><td>Lowest level that stops write skew?</td><td>SERIALIZABLE</td></tr>
    <tr><td>What does xmax ≠ 0 on a visible row version mean?</td><td>Some transaction replaced/deleted it, but that transaction isn't visible to your snapshot (not committed, or committed after it)</td></tr>
  </table>

  <h2 id="st-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, out loud and without notes, why each mechanism exists and what goes wrong without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: what do BEGIN, COMMIT and ROLLBACK do?</summary><div class="qa-body"><code>BEGIN</code> starts a transaction (statements treated as one unit). <code>COMMIT</code> makes all its changes permanent and visible together. <code>ROLLBACK</code> discards all of them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain ACID with a Biteful order.</summary><div class="qa-body">Atomicity: stock, order, line and payment all happen or none (Farah's failed order left nothing). Consistency: <code>CHECK (balance &gt;= 0)</code> and foreign keys hold after commit. Isolation: Farah never sees Ben's half-finished order. Durability: once "order placed" is returned, a crash can't lose it (the WAL is on disk; order 111 survived an immediate stop).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>BEGIN; INSERT INTO t VALUES (1); SELECT 1/0; INSERT INTO t VALUES (2); COMMIT;</code> then <code>SELECT count(*) FROM t</code> (t was empty).</summary><div class="qa-body">0. After the error the transaction is aborted; the second INSERT is rejected, and COMMIT on an aborted transaction performs a ROLLBACK, undoing row 1 too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Non-repeatable read vs phantom read?</summary><div class="qa-body">Non-repeatable: the same row has a new value on the second read (samosa stock 1 → 5, an UPDATE committed in between). Phantom: the same filter returns a different set of rows (pending orders 1 → 2, an INSERT committed in between).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two users click "Buy" on the last item and both succeed. Fix it.</summary><div class="qa-body">Make check and change one statement: <code>UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0</code>; the second buyer waits for the first's row lock, re-checks, and gets UPDATE 0 → "sold out". Alternatives: <code>SELECT … FOR UPDATE</code> then decide, or REPEATABLE READ / SERIALIZABLE with retries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is write skew, and which isolation level prevents it?</summary><div class="qa-body">Two transactions read overlapping data, then write different rows, together breaking a rule (Ravi and Sara both left duty). No row is written twice, so REPEATABLE READ allows it. SERIALIZABLE prevents it by aborting one (40001); alternatively lock the rows you counted (FOR UPDATE) or encode the rule as a constraint.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your service uses SERIALIZABLE and sometimes gets "could not serialize access". Is that a bug?</summary><div class="qa-body">No, it's the design: PostgreSQL aborted a transaction that would have broken serializability. Retry the whole transaction (our loop: Sara's attempt 1 failed, attempt 2 saw only one rider and stayed).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain MVCC with xmin and xmax. Why does a long-running transaction hurt PostgreSQL?</summary><div class="qa-body">An UPDATE writes a new version (xmin = updater) and stamps the old one's xmax; each snapshot sees the version committed when it was taken, so readers don't block writers. A long-open transaction keeps an old snapshot alive, so VACUUM can't remove newer dead versions ("dead but not yet removable"): bloat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query for several dispatchers to pull pending orders without double-assigning.</summary><div class="qa-body"><code>SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED</code> inside a transaction, then mark it assigned and COMMIT. In our run A got 110 and B got 111 without waiting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do deadlocks happen in a wallet-transfer service, and how do you prevent them?</summary><div class="qa-body">Ben→Farah locks Ben then Farah; Farah→Ben locks Farah then Ben; each waits for the other. PostgreSQL aborts one after deadlock_timeout. Prevent by locking both wallets in ascending id order (our fixed run finished with 480 / 320), keep transactions short, retry on 40P01.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Optimistic or pessimistic locking for (a) editing a menu description in an admin form, (b) the last samosa?</summary><div class="qa-body">(a) Optimistic: rare conflicts and a human is typing; a version column turns a conflict into UPDATE 0 → reload. (b) Pessimistic or an atomic conditional UPDATE: conflicts are constant, optimistic would retry endlessly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user places an order, refreshes "My orders", and it's missing. What happened?</summary><div class="qa-body">Replication lag: the write went to the primary, the read to an async replica that hadn't replayed it yet (our paused replica said 15 while the primary had 10). Fix with read-your-writes routing or waiting for the replica's replay position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Partitioning vs replication vs sharding?</summary><div class="qa-body">Partitioning splits a table inside one server (pruning, cheap retention). Replication copies the whole database to more servers (reads, failover; lag). Sharding splits rows across servers (write and storage scale; lose easy cross-shard joins and transactions).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does REPEATABLE READ need MVCC?</summary><div class="qa-body">REPEATABLE READ promises the same answers for the whole transaction while others keep committing. Without old versions, the only way would be to block every writer until the reader finishes. MVCC keeps the old version (stock 5, xmax = B) so the reader sees its snapshot and the writer proceeds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: MVCC means readers don't block writers. Why do we still need locks?</summary><div class="qa-body">Two writers to the same row can't both create "the next version", and a read that will feed a write (samosa stock) must not go stale before the write. Row locks (implicit in UPDATE, explicit with FOR UPDATE) serialize writers and make the second one re-read the committed row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does the WAL link durability and replication?</summary><div class="qa-body">The WAL is written and flushed before COMMIT returns, which is what let order 111 survive the crash (redo). The same log, streamed to another server and replayed, is exactly what a replica is. One mechanism, two uses.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip transactions once you shard?</summary><div class="qa-body">You can't skip them by choice, that's the point: a transfer between customers on different shards is two independent commits, so a crash in between broke atomicity (₹100 vanished). Everything section 02 gave for free must be rebuilt (two-phase commit, sagas) or avoided by choosing a shard key that keeps related rows together.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_modeling">Data Modeling</a>.</b> Transactions protect whatever tables we have. But if Biteful kept everything in one giant spreadsheet-like table, a customer's city would be stored in every order, and one change would mean many rows to update and lock. How should the tables be designed in the first place?</div>
</main>`
});
