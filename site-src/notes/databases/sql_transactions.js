// notes/databases/sql_transactions.js — Transactions & Concurrency
Object.assign(TOPIC_CONTENT, {
  "sql_transactions": `<main>
  <h1>Transactions &amp; Concurrency</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Transactions &amp; Concurrency</span></div>
  <p class="lead">Every earlier note ran one statement at a time for one user. Real databases are used by thousands of people at the same moment, real operations take several statements, and real servers crash. This page explains how a database keeps data correct under all three: <strong>transactions</strong> that make several changes succeed or fail together, the <strong>ACID</strong> guarantees, the bugs that appear when two sessions work at once, the <strong>isolation levels</strong> and <strong>locks</strong> that prevent them, and what changes when the data is copied or split across several servers. These are the mechanisms behind every payment, booking and stock counter you will ever build, and a favourite interview topic. The running example is <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="sql_joins">JOINs</a>, with three small extra tables: a <code>menu</code> where Biryani Bros has exactly one Samosa left, <code>wallets</code> holding ₹500 for Ben and ₹300 for Farah, and <code>riders</code> with Ravi and Sara on duty in Mumbai. Every two-person scene below was run on PostgreSQL 16 with two real connections driven from one Python script, and the steps are printed in the order they really happened.</p>

  <h2 id="st-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Transactions &amp; Concurrency</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Transactions and ACID</div>
        <ul>
          <li><b>BEGIN … COMMIT / ROLLBACK</b>: many statements, one unit</li>
          <li><b>Atomicity</b> all or nothing · <b>Consistency</b> constraints hold</li>
          <li><b>Isolation</b> others don't see half-done work · <b>Durability</b> survives a crash (WAL)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Anomalies</div>
        <ul>
          <li><b>Dirty read</b>: see uncommitted data (never in PostgreSQL)</li>
          <li><b>Non-repeatable read</b>: same row, new value</li>
          <li><b>Phantom</b>: same filter, new rows</li>
          <li><b>Lost update</b> and <b>write skew</b>: decisions on stale reads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Isolation and MVCC</div>
        <ul>
          <li><b>READ COMMITTED</b> (default): snapshot per statement</li>
          <li><b>REPEATABLE READ</b>: one snapshot per transaction</li>
          <li><b>SERIALIZABLE</b>: aborts one side → retry on 40001</li>
          <li><b>MVCC</b>: row versions with xmin/xmax; VACUUM cleans up</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Locks</div>
        <ul>
          <li><b>FOR UPDATE</b>: lock while reading; second writer waits and re-reads</li>
          <li><b>UPDATE … WHERE stock &gt; 0</b>: check and change in one step</li>
          <li><b>Optimistic</b>: version column, no lock held</li>
          <li><b>Deadlock</b>: wait cycle → one aborted; lock in a fixed order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">More than one server</div>
        <ul>
          <li><b>Replica</b>: WAL streamed and replayed; read-only; lag</li>
          <li><b>Sharding</b>: rows split by key; no single transaction across shards</li>
          <li><b>CAP</b>: during a network split choose consistency or availability</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="st-txn"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Transactions</span><span class="rm-sub">making several statements succeed or fail together</span></div></div>
      <div class="rm-item rm-done" data-target="st-acid"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">ACID</span><span class="rm-sub">the four promises, each shown, including a real crash</span></div></div>
      <div class="rm-item rm-done" data-target="st-anom"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Concurrency Anomalies</span><span class="rm-sub">what two sessions at once can do to each other</span></div></div>
      <div class="rm-item rm-done" data-target="st-iso"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Isolation Levels</span><span class="rm-sub">which level prevents which anomaly</span></div></div>
      <div class="rm-item rm-done" data-target="st-mvcc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">MVCC</span><span class="rm-sub">many versions of one row</span></div></div>
      <div class="rm-item rm-done" data-target="st-locks"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Locks and FOR UPDATE</span><span class="rm-sub">making the second buyer wait</span></div></div>
      <div class="rm-item rm-done" data-target="st-optim"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Optimistic Locking</span><span class="rm-sub">detecting conflicts instead of preventing them</span></div></div>
      <div class="rm-item rm-done" data-target="st-dead"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Deadlocks</span><span class="rm-sub">two sessions waiting for each other</span></div></div>
      <div class="rm-item rm-done" data-target="st-repl"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Replication</span><span class="rm-sub">copies of the database, and replication lag</span></div></div>
      <div class="rm-item rm-done" data-target="st-shard"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Sharding and Distributed Data</span><span class="rm-sub">splitting rows across servers, CAP, NoSQL</span></div></div>
      <div class="rm-item rm-done" data-target="st-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the concurrency bugs found in real code</span></div></div>
      <div class="rm-item rm-done" data-target="st-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, levels table, lock tools</span></div></div>
      <div class="rm-item rm-done" data-target="st-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on transactions</span></div></div>
    </div>
  </div>

  <h2 id="st-txn"><span class="num">01</span>Transactions: All or Nothing</h2>
  <p>Placing a Biteful order is not one statement but several: take one item from the menu's stock, create the order, add its order line, and take the money from the customer's wallet. Normally each statement is saved the moment it finishes. This default behaviour is called <strong>autocommit</strong>: every statement is its own little unit of work. Let us see what that means when something goes wrong halfway. Farah, who has ₹300, orders a Chicken Biryani costing ₹350:</p>
  <div class="fx" data-lang="sql">UPDATE menu SET stock = stock - 1 WHERE restaurant_id = 11 AND item = 'Chicken Biryani';
INSERT INTO orders VALUES (111, 6, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
UPDATE wallets SET balance = balance - 350 WHERE customer_id = 6;
SELECT item, stock FROM menu WHERE item = 'Chicken Biryani';
SELECT order_id, customer_id, amount, status FROM orders WHERE order_id = 111;
SELECT customer_id, balance FROM wallets WHERE customer_id = 6;</div>
  <div class="fx" data-lang="text">UPDATE 1
INSERT 0 1
INSERT 0 1
ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (6, -50.00).
      item       | stock
-----------------+-------
 Chicken Biryani |    19
(1 row)

 order_id | customer_id | amount | status
----------+-------------+--------+---------
      111 |           6 | 350.00 | pending
(1 row)

 customer_id | balance
-------------+---------
           6 |  300.00
(1 row)</div>
  <p>The first three statements succeeded and were saved. The fourth failed, because the wallets table has the rule <code>CHECK (balance &gt;= 0)</code> and ₹300 − ₹350 would be −₹50. Look at the result: the stock went from 20 to 19, an order exists, and nobody paid. Biteful has just given away a biryani. The database did exactly what it was told, one statement at a time; the problem is that these four statements only make sense <em>together</em>, and nothing told the database so.</p>
  <p>A <strong>transaction</strong> is a group of statements that the database treats as one indivisible unit: either all of them take effect, or none of them do. <code>BEGIN</code> starts a transaction, <code>COMMIT</code> makes all of its changes permanent at once, and <code>ROLLBACK</code> throws all of them away. Think of a shopping cart. You add items one by one, then either pay for everything (COMMIT) or walk away, and every item goes back on the shelf (ROLLBACK); nobody else sees what is in your cart until you pay. Here is the same order inside a transaction:</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE menu SET stock = stock - 1 WHERE restaurant_id = 11 AND item = 'Chicken Biryani';
INSERT INTO orders VALUES (111, 6, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
UPDATE wallets SET balance = balance - 350 WHERE customer_id = 6;
SELECT stock FROM menu WHERE item = 'Chicken Biryani';
COMMIT;
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
  <p>Read the output from the top. The first three statements succeed and the wallet update fails, exactly as before. But from that moment the transaction is <strong>aborted</strong>: PostgreSQL refuses every further statement in it ("current transaction is aborted, commands ignored until end of transaction block") until the transaction ends, so the SELECT is not even run. Then something important happens: we typed <code>COMMIT</code>, but PostgreSQL answered <code>ROLLBACK</code>. A failed transaction cannot be committed, so ending it always undoes it. Afterwards the stock is back to 20 and order 111 does not exist. Nothing half-done remains. And here is the successful case, Ben with ₹500 ordering the same biryani:</p>
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
  <p>All four changes became visible together at COMMIT: stock 19, Ben's wallet ₹150, one order line.</p>
  <p>Sometimes you want to undo only part of a transaction. A <strong>savepoint</strong> is a named checkpoint inside a transaction that you can roll back to without abandoning the whole thing. Suppose Ben's app adds an optional extra item, and that insert fails because of a bug; the main order should still go through:</p>
  <div class="fx" data-lang="sql">BEGIN;
INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 350, NULL);
INSERT INTO order_items VALUES (111, 'Chicken Biryani', 1, 350);
SAVEPOINT extras;
INSERT INTO order_items VALUES (999, 'Raita', 1, 50);   -- typo: there is no order 999
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
  <p>The foreign-key error aborted only the work after the savepoint. <code>ROLLBACK TO SAVEPOINT extras</code> rewound the transaction to that point and made it usable again, and COMMIT saved the order with its biryani line.</p>
  <p>One practical detail trips many people up: tools differ in their default. In psql, a statement without BEGIN is committed immediately, so two UPDATEs in a script are <em>not</em> atomic unless you wrap them in BEGIN and COMMIT. Python's database drivers (psycopg2, psycopg) do the opposite: they open a transaction automatically, and nothing is saved until you call <code>conn.commit()</code>, which is why forgetting the commit "loses" data. (The scripts on this page switch the driver to autocommit and write BEGIN and COMMIT explicitly, so the SQL reads the same as in psql.)</p>

  <h2 id="st-acid"><span class="num">02</span>ACID</h2>
  <p>"A unit of work" sounds simple, but a database actually makes four separate promises about every transaction, and they are known by their initials, <strong>ACID</strong>. <strong>Atomicity</strong> means all of the transaction's changes happen, or none do. <strong>Consistency</strong> means every committed transaction leaves the data obeying all the rules the database knows about, such as CHECK, FOREIGN KEY, UNIQUE and NOT NULL constraints. <strong>Isolation</strong> means transactions running at the same time do not see each other's unfinished work. <strong>Durability</strong> means that once COMMIT has returned, the change survives a crash. Each one is worth seeing on Biteful rather than just memorising.</p>
  <p>Atomicity covers more than errors. If the application itself crashes in the middle of a transaction, the database must undo whatever it had done so far. Here session A takes the last samosa inside a transaction, and then its connection disappears before COMMIT, as if the app server had crashed:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
A.conn.close()                                   # the app crashes: no COMMIT, connection gone
print("    A  (connection closed without COMMIT)")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → UPDATE 1
    A  (connection closed without COMMIT)
 3 B  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1</div>
  <p>The uncommitted change vanished with the connection: the samosa stock is still 1. Consistency is enforced by constraints. Farah tries to pay ₹400 out of ₹300, and an order is created for customer 99, who does not exist:</p>
  <div class="fx" data-lang="sql">UPDATE wallets SET balance = balance - 400 WHERE customer_id = 6;
INSERT INTO orders VALUES (111, 99, 11, now(), 'pending', 40, NULL);
SELECT customer_id, balance FROM wallets ORDER BY customer_id;</div>
  <div class="fx" data-lang="text">ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (6, -100.00).
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".
 customer_id | balance
-------------+---------
           2 |  500.00
           6 |  300.00
(2 rows)</div>
  <p>The CHECK constraint refuses the negative balance, the foreign key refuses the order for a missing customer, and the wallets are unchanged. Note that the database can only enforce rules you have declared. A business rule like "at least one rider must stay on duty in Mumbai" is not a constraint here, and section 03 shows two transactions breaking it. Isolation means unfinished work is invisible to others:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")         # A has not committed yet
A.run("COMMIT")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → UPDATE 1
 3 B  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 4 A  COMMIT                                                         → COMMIT
 5 B  SELECT stock FROM menu WHERE item = 'Samosa'                   → 0</div>
  <p>While A's transaction is open, B still sees stock 1. Only after A commits does B see 0. How strong this protection is, for example whether B's own transaction would keep seeing 1, is what isolation levels decide, and it is the subject of sections 03 and 04.</p>
  <p>Durability needs a mechanism, because writing every changed table page to disk at every commit would be very slow. PostgreSQL instead uses a <strong>write-ahead log</strong> (WAL): before COMMIT returns, it appends a compact description of the changes to the log and forces that log onto the disk. The table pages themselves are written later, in the background. If the server crashes, it replays the log on restart and redoes any change whose pages were not yet written. Think of a shopkeeper who writes each sale in a bound register before handing over the goods: if the shop is flooded at midday, the register says exactly which sales happened, and the shelves can be put right from it. We can test this for real on a private test server: commit an order, kill the server with <code>-m immediate</code> (no clean shutdown, the closest thing to pulling the plug), start it again, and look.</p>
  <div class="fx" data-lang="text">export PATH=/usr/lib/postgresql/16/bin:$PATH
DATA=/var/lib/postgresql/notes_b4_pg            # data directory of a private test server
SOCK=/var/lib/postgresql/notes_b4_sock
OPTS="-p 5494 -k $SOCK -c listen_addresses=''"
export PGHOST=$SOCK PGPORT=5494 PGUSER=postgres PGDATABASE=notes_b4
psql -X -c "INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)"   # committed
runuser -u postgres -- pg_ctl -D $DATA stop -m immediate                          # crash: no clean shutdown
runuser -u postgres -- pg_ctl -D $DATA -l $DATA.log -w start -o "$OPTS" &gt; /dev/null
grep -E "not properly shut down|redo starts|redo done|ready to accept" $DATA.log | tail -n 4 | sed 's/.*LOG: */LOG: /'
psql -X -c "SELECT order_id, customer_id, amount, status FROM orders WHERE order_id = 111"</div>
  <div class="fx" data-lang="text">INSERT 0 1
waiting for server to shut down.... done
server stopped
LOG: database system was not properly shut down; automatic recovery in progress
LOG: redo starts at 0/14EF3E0
LOG: redo done at 0/1951B60 system usage: CPU: user: 0.01 s, system: 0.00 s, elapsed: 0.01 s
LOG: database system is ready to accept connections
 order_id | customer_id | amount | status
----------+-------------+--------+---------
      111 |           2 |  40.00 | pending
(1 row)</div>
  <p>The server log shows the recovery: "not properly shut down; automatic recovery in progress", then "redo", which is the replay of the WAL, and order 111 is there. Because COMMIT waited for the log to reach the disk, the order survived even though the server died before writing its table pages normally. (Durability can be traded for speed: with <code>synchronous_commit = off</code>, COMMIT returns before the log is flushed, and a crash can lose the last fraction of a second of commits. That is acceptable for, say, analytics events, never for payments.)</p>
  <p>One more warning about the letters: the C in ACID (constraints hold) has nothing to do with the C in the CAP theorem (all copies of the data agree), which appears in section 10. Interviewers sometimes check whether you know the difference.</p>

  <h2 id="st-anom"><span class="num">03</span>Concurrency Anomalies</h2>
  <p>Transactions keep half-done work private. But now consider two well-behaved transactions running at the same moment. Ben and Farah both tap "order Samosa" at Biryani Bros in the same second, and only one samosa is left. Each app reads the stock, sees 1, and writes the stock as 0 and creates an order. Can both succeed? Problems like this, where transactions running at the same time produce a result that would be impossible if they had run one after the other, are called <strong>concurrency anomalies</strong>. "One after the other" is the gold standard and is called a <strong>serial</strong> order: if Ben's order had run first and Farah's second, Farah's app would have seen stock 0 and refused. There are five classic anomalies, and all five can be reproduced with two real sessions. Unless stated otherwise, these run at PostgreSQL's default isolation level, READ COMMITTED. Think of two people editing the same shared spreadsheet: one reads a cell, the other changes it, and the first still has the old number in their head. Every anomaly is a version of that.</p>
  <p>A <strong>dirty read</strong> is reading another transaction's change before it has committed, a change that might still be rolled back, so you could act on data that never officially existed. The SQL standard permits it at its weakest level, READ UNCOMMITTED, so we ask for exactly that:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
B.run("BEGIN")
B.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")       # not committed
A.run("BEGIN ISOLATION LEVEL READ UNCOMMITTED")
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
B.run("ROLLBACK")
A.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 B  BEGIN                                                          → BEGIN
 2 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → UPDATE 1
 3 A  BEGIN ISOLATION LEVEL READ UNCOMMITTED                         → BEGIN
 4 A  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 5 B  ROLLBACK                                                       → ROLLBACK
 6 A  COMMIT                                                         → COMMIT</div>
  <p>A saw 1, the committed value, even at READ UNCOMMITTED. PostgreSQL never shows uncommitted data at any level; it quietly treats READ UNCOMMITTED as READ COMMITTED. (SQL Server and MySQL do allow dirty reads at READ UNCOMMITTED, according to their documentation; that was not run here.)</p>
  <p>A <strong>non-repeatable read</strong> is reading the same row twice in one transaction and getting different values, because another transaction committed a change in between. The kitchen screen opens a transaction, reads the samosa stock, and reads it again a moment later:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN")                                                 # READ COMMITTED, the default
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
B.run("UPDATE menu SET stock = 5 WHERE item = 'Samosa'")       # autocommit: committed at once
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
A.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 A  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 3 B  UPDATE menu SET stock = 5 WHERE item = 'Samosa'                → UPDATE 1
 4 A  SELECT stock FROM menu WHERE item = 'Samosa'                   → 5
 5 A  COMMIT                                                         → COMMIT</div>
  <p>Same question, same transaction, two answers: 1, then 5. At READ COMMITTED each <em>statement</em> sees everything committed before that statement started, so a later statement can see newer data. That is fine for a quick lookup, and wrong for a report whose numbers must add up across several queries.</p>
  <p>A <strong>phantom read</strong> is similar, but instead of an existing row changing, a <em>new</em> row appears that matches the same filter:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN")
A.run("SELECT count(*) FROM orders WHERE status = 'pending'")
B.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
A.run("SELECT count(*) FROM orders WHERE status = 'pending'")
A.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 A  SELECT count(*) FROM orders WHERE status = 'pending'           → 1
 3 B  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 4 A  SELECT count(*) FROM orders WHERE status = 'pending'           → 2
 5 A  COMMIT                                                         → COMMIT</div>
  <p>No existing row changed, but the count of pending orders went from 1 to 2 because B inserted a matching row (a "phantom") and committed. Now the samosa. A <strong>lost update</strong> happens when two transactions read the same value, each computes a new value from what it read, and the second write overwrites the first without taking it into account:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')                              # A = Ben's request, B = Farah's
A.run("BEGIN"); B.run("BEGIN")
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")          # Ben's app sees 1 left
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")          # Farah's app sees 1 left
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")       # app computed 1 - 1
job = B.start("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")   # same row: waits for A
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
A.run("COMMIT")
B.finish(job)
B.run("INSERT INTO orders VALUES (112, 6, 11, now(), 'pending', 40, NULL)")
B.run("COMMIT")
A.run("SELECT count(*) FROM orders WHERE order_id IN (111, 112)")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 B  BEGIN                                                          → BEGIN
 3 A  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 4 B  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 5 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → UPDATE 1
 6 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → ... waiting
 7 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 8 A  COMMIT                                                         → COMMIT
 9 B  (the waiting statement)                                        → now returns: UPDATE 1
10 B  INSERT INTO orders VALUES (112, 6, 11, now(), 'pending', 40, NULL) → INSERT 0 1
11 B  COMMIT                                                         → COMMIT
12 A  SELECT count(*) FROM orders WHERE order_id IN (111, 112)       → 2</div>
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
  <p>Follow the steps. Both apps read 1. A writes 0. B tries to write the same row and has to <em>wait</em>, because A holds that row's write lock until it finishes (locks are section 06). A commits, B's UPDATE goes ahead and writes 0, the value its app calculated from its earlier, now stale, read. Two orders exist for one samosa. The database did protect the row from two simultaneous writes, but it had no way to know that B's "0" was computed from an old value. The lost update is the most common concurrency bug in real applications, because "read a value into the app, compute, write it back" is the most natural way to write code.</p>
  <p>The last anomaly is the subtlest. Biteful's rule is that at least one rider must stay on duty in Mumbai. Ravi and Sara are both on duty and both want to go home. Each app checks "is someone else on duty?" and, if so, updates only its own row. This time even REPEATABLE READ, a stronger level, is used:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')                              # A = Ravi's app, B = Sara's app
A.run("BEGIN ISOLATION LEVEL REPEATABLE READ"); B.run("BEGIN ISOLATION LEVEL REPEATABLE READ")
A.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")   # 2, so Ravi may leave
B.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")   # 2, so Sara may leave
A.run("UPDATE riders SET on_duty = false WHERE name = 'Ravi'")
B.run("UPDATE riders SET on_duty = false WHERE name = 'Sara'")
A.run("COMMIT"); B.run("COMMIT")
A.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL REPEATABLE READ                          → BEGIN
 2 B  BEGIN ISOLATION LEVEL REPEATABLE READ                          → BEGIN
 3 A  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty  → 2
 4 B  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty  → 2
 5 A  UPDATE riders SET on_duty = false WHERE name = 'Ravi'          → UPDATE 1
 6 B  UPDATE riders SET on_duty = false WHERE name = 'Sara'          → UPDATE 1
 7 A  COMMIT                                                         → COMMIT
 8 B  COMMIT                                                         → COMMIT
 9 A  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty  → 0</div>
  <p>Nobody is on duty in Mumbai. No row was written twice, so no lock conflict occurred; each transaction's check was true in the data it saw, and each changed a <em>different</em> row. Together they broke a rule that neither broke alone. This is <strong>write skew</strong>: two transactions read overlapping data, make decisions from it, and write different rows. Notice that every anomaly from non-repeatable read onwards happened <em>inside</em> transactions. A transaction gives you all-or-nothing; how far it is shielded from other transactions is a separate setting, the isolation level.</p>
  <table class="tbl">
    <tr><th>Anomaly</th><th>What happens</th><th>Biteful scene</th></tr>
    <tr><td>Dirty read</td><td>See another transaction's uncommitted change</td><td>Never in PostgreSQL (A saw 1)</td></tr>
    <tr><td>Non-repeatable read</td><td>Same row read twice, different values</td><td>Samosa stock 1, then 5</td></tr>
    <tr><td>Phantom read</td><td>Same filter, different set of rows</td><td>Pending orders 1, then 2</td></tr>
    <tr><td>Lost update</td><td>A write based on a stale read overwrites another write</td><td>Two orders, one samosa</td></tr>
    <tr><td>Write skew</td><td>Two transactions write different rows based on the same read; a rule breaks</td><td>No rider left on duty</td></tr>
  </table>

  <h2 id="st-iso"><span class="num">04</span>Isolation Levels</h2>
  <p>Preventing every anomaly all the time would make transactions wait for each other, or fail, much more often, so databases let you choose how much protection each transaction gets. That choice is the <strong>isolation level</strong>, set with <code>BEGIN ISOLATION LEVEL …</code>. The SQL standard defines four: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ and SERIALIZABLE, from weakest to strongest. Rather than copy a table from a textbook, the script below runs all five anomaly scenarios at all four levels in PostgreSQL, each time with two fresh connections and fresh tables, and records what happened:</p>
  <div class="fx" data-lang="py">import psycopg2

def connect():
    c = psycopg2.connect(dbname="notes_b4"); c.autocommit = True
    return c

A, B = connect(), connect()

def q(conn, sql):
    """Run one statement; return its single value, 'ok', or 'ERROR'."""
    cur = conn.cursor()
    try:
        cur.execute(sql)
        return cur.fetchone()[0] if cur.description else 'ok'
    except psycopg2.Error:
        return 'ERROR'

STOCK = "SELECT stock FROM menu WHERE item = 'Chicken Biryani'"

def dirty_read(level):
    q(B, "BEGIN"); q(B, "UPDATE menu SET stock = 99 WHERE item = 'Chicken Biryani'")
    q(A, f"BEGIN ISOLATION LEVEL {level}"); seen = q(A, STOCK)
    q(B, "ROLLBACK"); q(A, "COMMIT")
    return 'happens' if seen == 99 else 'prevented'

def non_repeatable(level):
    q(A, f"BEGIN ISOLATION LEVEL {level}"); first = q(A, STOCK)
    q(B, "UPDATE menu SET stock = 15 WHERE item = 'Chicken Biryani'")
    second = q(A, STOCK); q(A, "COMMIT")
    return 'happens' if first != second else 'prevented'

def phantom(level):
    count = "SELECT count(*) FROM orders WHERE status = 'pending'"
    q(A, f"BEGIN ISOLATION LEVEL {level}"); first = q(A, count)
    q(B, "INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
    second = q(A, count); q(A, "COMMIT")
    return 'happens' if first != second else 'prevented'

def lost_update(level):
    q(A, f"BEGIN ISOLATION LEVEL {level}"); q(B, f"BEGIN ISOLATION LEVEL {level}")
    a, b = q(A, STOCK), q(B, STOCK)                      # both read 20
    q(A, f"UPDATE menu SET stock = {a - 1} WHERE item = 'Chicken Biryani'"); q(A, "COMMIT")
    w = q(B, f"UPDATE menu SET stock = {b - 1} WHERE item = 'Chicken Biryani'"); q(B, "COMMIT")
    return 'prevented (error)' if w == 'ERROR' else 'happens'

def write_skew(level):
    on_duty = "SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty"
    q(A, f"BEGIN ISOLATION LEVEL {level}"); q(B, f"BEGIN ISOLATION LEVEL {level}")
    q(A, on_duty); q(B, on_duty)
    q(A, "UPDATE riders SET on_duty = false WHERE name = 'Ravi'")
    q(B, "UPDATE riders SET on_duty = false WHERE name = 'Sara'")
    q(A, "COMMIT"); q(B, "COMMIT")
    return 'happens' if q(A, on_duty) == 0 else 'prevented (error)'

tests = [('dirty read', dirty_read), ('non-repeatable read', non_repeatable),
         ('phantom read', phantom), ('lost update', lost_update), ('write skew', write_skew)]
levels = ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE']
print(f"{'':20}" + ''.join(f"{l:&lt;19}" for l in levels))
for name, test in tests:
    cells = []
    for level in levels:
        reset()                                          # fresh tables for every cell
        cells.append(test(level))
    print(f"{name:&lt;20}" + ''.join(f"{c:&lt;19}" for c in cells))</div>
  <div class="fx" data-lang="text">                    READ UNCOMMITTED   READ COMMITTED     REPEATABLE READ    SERIALIZABLE
dirty read          prevented          prevented          prevented          prevented
non-repeatable read happens            happens            prevented          prevented
phantom read        happens            happens            prevented          prevented
lost update         happens            happens            prevented (error)  prevented (error)
write skew          happens            happens            happens            prevented (error)</div>
  <p>"prevented (error)" means PostgreSQL did not let the anomaly through, but it did not silently fix it either: one transaction received an error instead. At REPEATABLE READ, the second writer in the samosa scene fails like this:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN ISOLATION LEVEL REPEATABLE READ"); B.run("BEGIN ISOLATION LEVEL REPEATABLE READ")
A.run("SELECT stock FROM menu WHERE item = 'Samosa'")
B.run("SELECT stock FROM menu WHERE item = 'Samosa'")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
job = B.start("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
A.run("COMMIT")
B.finish(job)
B.run("ROLLBACK")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL REPEATABLE READ                          → BEGIN
 2 B  BEGIN ISOLATION LEVEL REPEATABLE READ                          → BEGIN
 3 A  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 4 B  SELECT stock FROM menu WHERE item = 'Samosa'                   → 1
 5 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → UPDATE 1
 6 B  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → ... waiting
 7 A  COMMIT                                                         → COMMIT
 8 B  (the waiting statement)                                        → now returns: ERROR: could not serialize access due to concurrent update
 9 B  ROLLBACK                                                       → ROLLBACK</div>
  <p>B waited for A's lock as before, but when A committed, B did not go ahead with its stale write. Its transaction is working from a snapshot taken before A's change, and writing over a row that someone else changed since that snapshot would be a lost update, so PostgreSQL raises "could not serialize access due to concurrent update". Write skew needs the strongest level. At SERIALIZABLE, the second rider's COMMIT is refused:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN ISOLATION LEVEL SERIALIZABLE"); B.run("BEGIN ISOLATION LEVEL SERIALIZABLE")
A.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
B.run("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
A.run("UPDATE riders SET on_duty = false WHERE name = 'Ravi'")
B.run("UPDATE riders SET on_duty = false WHERE name = 'Sara'")
A.run("COMMIT"); B.run("COMMIT")
A.run("SELECT name FROM riders WHERE city = 'Mumbai' AND on_duty")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL SERIALIZABLE                             → BEGIN
 2 B  BEGIN ISOLATION LEVEL SERIALIZABLE                             → BEGIN
 3 A  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty  → 2
 4 B  SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty  → 2
 5 A  UPDATE riders SET on_duty = false WHERE name = 'Ravi'          → UPDATE 1
 6 B  UPDATE riders SET on_duty = false WHERE name = 'Sara'          → UPDATE 1
 7 A  COMMIT                                                         → COMMIT
 8 B  COMMIT                                                         → ERROR: could not serialize access due to read/write dependencies among transactions
 9 A  SELECT name FROM riders WHERE city = 'Mumbai' AND on_duty      → Sara</div>
  <p>Sara stays on duty. PostgreSQL implements SERIALIZABLE with a technique called <strong>Serializable Snapshot Isolation</strong> (SSI): it tracks which data each transaction read and wrote, and if the combination could not have happened in any serial order, it aborts one of the transactions. The application is expected to catch this error, which has the code SQLSTATE <code>40001</code> ("serialization failure"), and <strong>retry</strong> the whole transaction from the beginning. On the retry, the transaction sees the new data and makes a different decision. Here is a real retry loop:</p>
  <div class="fx" data-lang="py">import psycopg2
from psycopg2 import errors

def connect():
    c = psycopg2.connect(dbname="notes_b4"); c.autocommit = True
    return c

def go_off_duty(conn, name, meanwhile=None):
    """One attempt at the whole transaction. Raises SerializationFailure if PostgreSQL aborts it."""
    cur = conn.cursor()
    cur.execute("BEGIN ISOLATION LEVEL SERIALIZABLE")
    try:
        cur.execute("SELECT count(*) FROM riders WHERE city = 'Mumbai' AND on_duty")
        n = cur.fetchone()[0]
        if meanwhile:
            meanwhile()                      # the other rider acts at this very moment
        if n &lt; 2:
            cur.execute("COMMIT")
            return f"{name}: only {n} on duty, staying"
        cur.execute("UPDATE riders SET on_duty = false WHERE name = %s", (name,))
        cur.execute("COMMIT")
        return f"{name}: went off duty"
    except errors.SerializationFailure:
        cur.execute("ROLLBACK")
        raise

ravi, sara = connect(), connect()
for attempt in (1, 2, 3):
    try:
        # on the first attempt, Ravi's whole transaction runs inside Sara's
        other = (lambda: print(go_off_duty(ravi, "Ravi"))) if attempt == 1 else None
        print(go_off_duty(sara, "Sara", other))
        break
    except errors.SerializationFailure as e:
        print(f"Sara attempt {attempt}: {e.pgcode} {e.diag.message_primary} -&gt; retry")

cur = ravi.cursor()
cur.execute("SELECT name FROM riders WHERE city = 'Mumbai' AND on_duty")
print("on duty now:", cur.fetchall())</div>
  <div class="fx" data-lang="text">Ravi: went off duty
Sara attempt 1: 40001 could not serialize access due to read/write dependencies among transactions -&gt; retry
Sara: only 1 on duty, staying
on duty now: [('Sara',)]</div>
  <p>On Sara's first attempt, Ravi's entire transaction ran and committed in the middle of hers, so her COMMIT failed with 40001. The loop retried; this time her transaction saw only one rider on duty and she stayed. A retry loop is not optional at SERIALIZABLE: serialization failures are expected behaviour, and without retries users simply see errors.</p>
  <p>The levels differ in one basic way, which section 05 explains: when the transaction takes its <strong>snapshot</strong>, its frozen picture of the committed data. At <strong>READ COMMITTED</strong>, the default in PostgreSQL, SQL Server and Oracle, every statement takes a fresh snapshot, so each statement sees everything committed before it began. At <strong>REPEATABLE READ</strong>, the transaction takes one snapshot at its first query and reads from it until the end, so repeated reads always agree; in PostgreSQL this is called <strong>snapshot isolation</strong>. At <strong>SERIALIZABLE</strong>, the transaction also has one snapshot, plus SSI's dependency tracking. Think of studying in a room. At READ COMMITTED the door is open and you notice every change as it happens. At REPEATABLE READ you work from a photograph of the room taken when you came in. At SERIALIZABLE it looks as if only one person is ever in the room, and if two people's work could not have happened one after the other, one of them is asked to start again.</p>
  <table class="tbl">
    <tr><th>Level (PostgreSQL)</th><th>Snapshot</th><th>Dirty</th><th>Non-repeatable</th><th>Phantom</th><th>Lost update</th><th>Write skew</th></tr>
    <tr><td>READ UNCOMMITTED</td><td>behaves as READ COMMITTED</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>READ COMMITTED (default)</td><td>per statement</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>REPEATABLE READ</td><td>per transaction</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>Yes</td></tr>
    <tr><td>SERIALIZABLE</td><td>per transaction + SSI</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>No (error)</td></tr>
  </table>
  <p>Two cautions. First, engines differ. The SQL standard only says which anomalies each level must prevent at minimum; PostgreSQL's REPEATABLE READ is stricter than required (it prevents phantoms) and raises an error on lost updates. MySQL's InnoDB uses REPEATABLE READ as its default, and according to its documentation a plain UPDATE there reads the latest committed row instead of failing, so the samosa scene behaves differently; that was not run here. Never assume concurrency code is portable between databases. Second, in practice most applications stay at READ COMMITTED and protect the few places that need it with the locking techniques of the next sections; REPEATABLE READ is common for reports that must see one consistent picture, and SERIALIZABLE for rules that span several rows, provided the code retries.</p>

  <h2 id="st-mvcc"><span class="num">05</span>MVCC: Many Versions of One Row</h2>
  <p>At REPEATABLE READ, session A kept reading the old samosa stock after B had committed a new one, and B did not have to wait for A. If the table held only one copy of each row, that would be impossible: either the reader would have to wait for the writer, or it would see the new value. PostgreSQL, like Oracle, MySQL's InnoDB and most modern databases, solves this with <strong>MVCC</strong>, multi-version concurrency control: an UPDATE never overwrites a row in place. It writes a <strong>new version</strong> of the row and marks the old version as replaced, and both versions stay in the table for a while (the <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> note watched a row's address change on UPDATE). Think of the page history of a Wikipedia article: an edit creates a new revision, and someone already reading the old revision is not interrupted.</p>
  <p>To know which version each transaction should see, every row version carries two hidden numbers. <code>xmin</code> is the id of the transaction that created this version, and <code>xmax</code> is the id of the transaction that deleted or replaced it (0 if nobody has). Each transaction, or each statement at READ COMMITTED, takes a <strong>snapshot</strong>, which records which transactions had committed when it was taken. A version is visible to you if the transaction that created it had committed before your snapshot, and the transaction that replaced it (if any) had not. Watch this on the Buddha Bowl row, which has stock 5, while B updates it and A has an open REPEATABLE READ transaction:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN ISOLATION LEVEL REPEATABLE READ")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
B.run("BEGIN")
B.run("SELECT pg_current_xact_id()")                                 # B's transaction id
B.run("UPDATE menu SET stock = 4 WHERE item = 'Buddha Bowl'")
B.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
B.run("COMMIT")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")
A.run("COMMIT")
A.run("SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl'")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN ISOLATION LEVEL REPEATABLE READ                          → BEGIN
 2 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (19866, 0, (0,3), 5)
 3 B  BEGIN                                                          → BEGIN
 4 B  SELECT pg_current_xact_id()                                    → 19878
 5 B  UPDATE menu SET stock = 4 WHERE item = 'Buddha Bowl'           → UPDATE 1
 6 B  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (19878, 0, (0,4), 4)
 7 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (19866, 19878, (0,3), 5)
 8 B  COMMIT                                                         → COMMIT
 9 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (19866, 19878, (0,3), 5)
10 A  COMMIT                                                         → COMMIT
11 A  SELECT xmin, xmax, ctid, stock FROM menu WHERE item = 'Buddha Bowl' → (19878, 0, (0,4), 4)</div>
  <p>Follow the numbers. At step 2 the row's only version sits at address (0,3), created by the transaction that loaded the data, with xmax 0. At step 5 B updates it. B now sees a new version at (0,4) with <code>xmin</code> equal to B's own transaction id and stock 4. At step 7, A still sees the old version with stock 5, but its <code>xmax</code> now holds B's id: the old version has been marked as replaced by B. Even after B commits (step 9), A keeps reading the old version, because B was not committed when A's snapshot was taken. Only once A finishes does a fresh statement see the new version, with stock 4. Nobody waited for anybody. Both versions are physically in the table page, as the raw page shows:</p>
  <div class="fx" data-lang="py">import psycopg2
c = psycopg2.connect(dbname="notes_b4"); c.autocommit = True
cur = c.cursor()
look = """SELECT lp AS slot, t_xmin AS xmin, t_xmax AS xmax, t_ctid AS points_to
          FROM heap_page_items(get_raw_page('menu', 0)) WHERE lp_flags = 1"""
cur.execute(look); print("before VACUUM:", cur.fetchall())
cur.execute("VACUUM menu")
cur.execute(look); print("after VACUUM: ", cur.fetchall())</div>
  <div class="fx" data-lang="text">before VACUUM: [(1, '19866', '0', '(0,1)'), (2, '19866', '0', '(0,2)'), (3, '19866', '19878', '(0,4)'), (4, '19878', '0', '(0,4)')]
after VACUUM:  [(1, '19866', '0', '(0,1)'), (2, '19866', '0', '(0,2)'), (4, '19878', '0', '(0,4)')]</div>
  <p>Before VACUUM, slot 3 holds the old Buddha Bowl version with B's id as xmax, and its <code>points_to</code> leads to its replacement in slot 4. After VACUUM, the old version is gone, because no running transaction could still need it.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="158" y="10" width="236" height="56" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity=".5"/>
    <text x="276" y="30" text-anchor="middle">v1 · Buddha Bowl stock 5</text>
    <text x="276" y="48" text-anchor="middle" font-size="10" class="tm">ctid (0,3) · xmin = loader · xmax = B</text>
    <text x="276" y="61" text-anchor="middle" font-size="10" class="tr">dead once B commits and A ends</text>
    <rect x="158" y="98" width="236" height="56" rx="6" class="fg sg"/>
    <text x="276" y="118" text-anchor="middle">v2 · stock 4</text>
    <text x="276" y="136" text-anchor="middle" font-size="10" class="tm">ctid (0,4) · xmin = B · xmax 0</text>
    <line x1="276" y1="66" x2="276" y2="96" stroke="currentColor" marker-end="url(#st-ar2)"/><text x="284" y="86" font-size="10" class="tm">UPDATE by B</text>
    <rect x="0" y="22" width="130" height="34" rx="6" class="fb sb"/><text x="65" y="36" text-anchor="middle" font-size="11">A's snapshot</text><text x="65" y="50" text-anchor="middle" font-size="10" class="tm">taken before B</text>
    <line x1="130" y1="39" x2="156" y2="39" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <rect x="0" y="110" width="130" height="34" rx="6" class="fb sb"/><text x="65" y="124" text-anchor="middle" font-size="11">new snapshots</text><text x="65" y="138" text-anchor="middle" font-size="10" class="tm">after B commits</text>
    <line x1="130" y1="127" x2="156" y2="127" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <rect x="432" y="22" width="160" height="34" rx="6" class="fv"/><text x="512" y="43" text-anchor="middle" font-size="11">VACUUM removes v1</text>
    <line x1="430" y1="39" x2="396" y2="39" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <text x="512" y="74" text-anchor="middle" font-size="10" class="tm">only when no snapshot</text><text x="512" y="87" text-anchor="middle" font-size="10" class="tm">can still see it</text>
  </svg><figcaption>One logical row, two physical versions. Each snapshot reads the version that was committed when it was taken.</figcaption></figure>
  <p>The figure sums it up: one logical row, two physical versions, and each snapshot pointed at the version that was committed when the snapshot was taken. This also explains the isolation levels: they differ mainly in <em>when</em> the snapshot is taken, per statement or per transaction. The famous consequence of MVCC is that <strong>readers never block writers and writers never block readers</strong>. Two writers on the same row still conflict, though, because there can only be one "next version" of a row; that is what locks handle (section 06).</p>
  <p>MVCC has a cost: dead versions pile up until VACUUM removes them, and VACUUM may only remove a version when <em>no</em> snapshot could still see it. So one forgotten open transaction, for example a notebook that ran BEGIN and then the user went to lunch, prevents the clean-up of every version that became dead after its snapshot was taken:</p>
  <div class="fx" data-lang="py">import psycopg2

def connect():
    c = psycopg2.connect(dbname="notes_b4"); c.autocommit = True
    return c

lunch = connect().cursor()
lunch.execute("BEGIN ISOLATION LEVEL REPEATABLE READ")
lunch.execute("SELECT count(*) FROM menu")          # snapshot taken... and left open

app_conn = connect(); app = app_conn.cursor()
for s in (19, 18, 17):                              # three ordinary updates = three dead versions
    app.execute("UPDATE menu SET stock = %s WHERE item = 'Chicken Biryani'", (s,))

def vacuum_report():
    app_conn.notices.clear()
    app.execute("VACUUM (VERBOSE) menu")
    return [l.strip() for n in app_conn.notices for l in n.splitlines() if l.strip().startswith('tuples:')][0]

print("lunch transaction open:", vacuum_report())
lunch.execute("COMMIT")
print("after it commits:      ", vacuum_report())</div>
  <div class="fx" data-lang="text">lunch transaction open: tuples: 0 removed, 6 remain, 3 are dead but not yet removable
after it commits:       tuples: 3 removed, 3 remain, 0 are dead but not yet removable</div>
  <p>With the idle transaction open, VACUUM reports three dead versions that are "not yet removable". As soon as it ends, they are removed. On a busy table, a transaction left open for hours means millions of unremovable versions, which is called <strong>bloat</strong>: tables grow, scans read more pages, and everything slows down. You can spot such sessions in <code>pg_stat_activity</code> with the state "idle in transaction", and the setting <code>idle_in_transaction_session_timeout</code> kills them automatically. The lesson for application code is: never keep a transaction open while waiting for a user, a network call or anything slow.</p>

  <h2 id="st-locks"><span class="num">06</span>Locks and SELECT … FOR UPDATE</h2>
  <p>The lost update happened because Farah's app read the stock, then Ben's order took the samosa, and then Farah's app wrote a value computed from its stale read. At READ COMMITTED nothing stopped her read from going stale. What we want is for the second buyer to <em>wait</em> until the first has finished, and then see the truth. That is the job of a <strong>lock</strong>, a marker that gives one transaction temporary exclusive rights over something, so that others who want conflicting rights must wait.</p>
  <p>Every UPDATE or DELETE automatically takes a <strong>row lock</strong> on each row it changes, and holds it until the transaction commits or rolls back; we saw B wait on it in section 03. The statement <code>SELECT … FOR UPDATE</code> takes that same lock while <em>reading</em>, which tells the database "I am reading this row because I am about to change it". Think of a trial room in a shop: you lock the door while you are inside, and everyone else waits outside until you come out. Here are Ben and Farah again, now using FOR UPDATE, with a third connection C looking at what each session is doing:</p>
  <div class="fx" data-lang="py">A, B, C = Session('A'), Session('B'), Session('C')
A.run("BEGIN"); B.run("BEGIN")
A.run("SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE")          # Ben locks the row: 1 left
job = B.start("SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE")  # Farah must wait
C.run("SELECT application_name, wait_event_type FROM pg_stat_activity WHERE application_name IN ('A', 'B') ORDER BY 1")
A.run("UPDATE menu SET stock = 0 WHERE item = 'Samosa'")
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL)")
A.run("COMMIT")
B.finish(job)                                                             # Farah's read returns now
B.run("ROLLBACK")                                                         # her app sees 0: sold out
C.run("SELECT count(*) FROM orders WHERE order_id IN (111, 112)")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 B  BEGIN                                                          → BEGIN
 3 A  SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE        → 1
 4 B  SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE        → ... waiting
 5 C  SELECT application_name, wait_event_type FROM pg_stat_activity WHERE application_name IN ('A', 'B') ORDER BY 1 → (A, Client), (B, Lock)
 6 A  UPDATE menu SET stock = 0 WHERE item = 'Samosa'                → UPDATE 1
 7 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL) → INSERT 0 1
 8 A  COMMIT                                                         → COMMIT
 9 B  (the waiting statement)                                        → now returns: 0
10 B  ROLLBACK                                                       → ROLLBACK
11 C  SELECT count(*) FROM orders WHERE order_id IN (111, 112)       → 1</div>
  <p>A's FOR UPDATE locks the samosa row and returns 1. B's FOR UPDATE on the same row has to wait, and C can see it: B's <code>wait_event_type</code> is <code>Lock</code>. A sells the samosa and commits, which releases the lock. B's read then returns, and it returns the <em>new</em> committed stock, 0, so Farah's app says "sold out". One samosa, one order. The key detail is that at READ COMMITTED, a statement that had to wait for a row lock re-reads the latest committed version of that row before continuing, so B never works with stale data.</p>
  <p>When the decision is as simple as "only if there is stock left", there is an even simpler and very common pattern: put the check inside the UPDATE itself, so that checking and changing happen in one statement under one row lock:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
A.run("BEGIN"); B.run("BEGIN")
A.run("UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0")
job = B.start("UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0")
A.run("COMMIT")
B.finish(job)                       # UPDATE 0: no row matched any more, so the app says "sold out"
B.run("ROLLBACK")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 B  BEGIN                                                          → BEGIN
 3 A  UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0 → UPDATE 1
 4 B  UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0 → ... waiting
 5 A  COMMIT                                                         → COMMIT
 6 B  (the waiting statement)                                        → now returns: UPDATE 0
 7 B  ROLLBACK                                                       → ROLLBACK</div>
  <p>Ben's statement reports <code>UPDATE 1</code>: one row changed. Farah's waited, then re-evaluated <code>stock &gt; 0</code> on the committed row, found stock 0, and changed nothing: <code>UPDATE 0</code>. The application checks the number of rows changed and tells Farah the samosa is sold out. This "conditional atomic update" is the standard fix for counters, stock levels, seat bookings and wallet balances, and it needs no special isolation level.</p>
  <p>Locks are also useful for work queues. Biteful's dispatchers each pick the next pending order and assign a rider. With plain FOR UPDATE, every dispatcher would queue up behind whoever locked the first pending order. Adding <code>SKIP LOCKED</code> makes each one skip rows already locked by someone else and take the next free one:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')                  # two dispatchers
A.run("INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL), (112, 6, 11, now(), 'pending', 40, NULL)")
A.run("BEGIN"); B.run("BEGIN")
A.run("SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED")
B.run("SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED")
A.run("COMMIT"); B.run("COMMIT")</div>
  <div class="fx" data-lang="text"> 1 A  INSERT INTO orders VALUES (111, 2, 11, now(), 'pending', 40, NULL), (112, 6, 11, now(), 'pending', 40, NULL) → INSERT 0 2
 2 A  BEGIN                                                          → BEGIN
 3 B  BEGIN                                                          → BEGIN
 4 A  SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED → 110
 5 B  SELECT order_id FROM orders WHERE status = 'pending' ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED → 111
 6 A  COMMIT                                                         → COMMIT
 7 B  COMMIT                                                         → COMMIT</div>
  <p>A got order 110 and B got 111; nobody waited and nobody took the same order. (The related option <code>NOWAIT</code> raises an error immediately instead of waiting, useful when waiting is pointless.)</p>
  <p>Rows are not the only things that get locked. Every statement also takes a <strong>table lock</strong> in some mode. Ordinary SELECTs, INSERTs and UPDATEs take weak modes that do not conflict with each other, which is why thousands of sessions can use one table at once. But most ALTER TABLE commands need an ACCESS EXCLUSIVE lock, which conflicts with everything, even plain reads. This creates a classic production incident:</p>
  <div class="fx" data-lang="py">A, B, C = Session('A'), Session('B'), Session('C')
A.run("BEGIN")
A.run("SELECT count(*) FROM menu")                               # a report, still open
job_b = B.start("ALTER TABLE menu ADD COLUMN spicy boolean")     # needs an exclusive table lock
job_c = C.start("SELECT stock FROM menu WHERE item = 'Samosa'")  # an ordinary customer read
A.run("COMMIT")
B.finish(job_b)
C.finish(job_c)</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 A  SELECT count(*) FROM menu                                      → 3
 3 B  ALTER TABLE menu ADD COLUMN spicy boolean                      → ... waiting
 4 C  SELECT stock FROM menu WHERE item = 'Samosa'                   → ... waiting
 5 A  COMMIT                                                         → COMMIT
 6 B  (the waiting statement)                                        → now returns: ALTER TABLE
 7 C  (the waiting statement)                                        → now returns: 1</div>
  <p>A is a long report holding an ordinary read lock on menu. B's ALTER TABLE needs the exclusive lock, so it waits for A. Then C, a simple customer read that does not conflict with A at all, also waits, because it is queued behind B's pending exclusive request. Until A finishes, every new query on the table piles up behind the ALTER TABLE. On a busy website this looks like a sudden outage caused by a "harmless" schema change. The usual protection is to run schema changes with a short <code>lock_timeout</code>, so the ALTER gives up and retries later instead of blocking everyone.</p>
  <p>Locks have limits, too. FOR UPDATE can only lock rows that exist and that the query reads. It does not stop write skew unless you lock all the rows the decision was based on (for the riders, both Ravi's and Sara's rows), and it cannot lock rows that do not exist yet, so it cannot prevent a phantom insert. For those cases the answers are SERIALIZABLE with retries, or a constraint that makes the rule part of the schema.</p>

  <h2 id="st-optim"><span class="num">07</span>Optimistic Locking</h2>
  <p>Row locks work well when transactions are short. But consider two Biteful admins who both open the menu editor at the same time to change the samosa's price. Each loads the form, thinks for a minute, and clicks Save. A database lock cannot be held across minutes of human thinking and two separate web requests; the lock would block other users the whole time, and the web request that took it has long finished. Yet without protection, the second admin's save silently overwrites the first one's: a lost update spread over minutes.</p>
  <p><strong>Optimistic locking</strong> (or optimistic concurrency control) handles this by detecting conflicts instead of preventing them. Each row carries a <code>version</code> number. The form remembers the version it loaded, and the save only succeeds if the row still has that version, bumping it at the same time. Both admins loaded price 40 at version 1; the first saves 45, then the second saves 50:</p>
  <div class="fx" data-lang="sql">ALTER TABLE menu ADD COLUMN version INT NOT NULL DEFAULT 1;
-- both admins loaded: price 40, version 1
UPDATE menu SET price = 45, version = version + 1 WHERE item = 'Samosa' AND version = 1;
UPDATE menu SET price = 50, version = version + 1 WHERE item = 'Samosa' AND version = 1;
SELECT item, price, version FROM menu WHERE item = 'Samosa';</div>
  <div class="fx" data-lang="text">ALTER TABLE
UPDATE 1
UPDATE 0
  item  | price | version
--------+-------+---------
 Samosa | 45.00 |       2
(1 row)</div>
  <p>The first save found version 1, changed the price and bumped the version to 2 (<code>UPDATE 1</code>). The second save looked for version 1, found 2, and changed nothing (<code>UPDATE 0</code>), so the application tells that admin "someone else changed this item; please reload". No lock was held while anyone was typing. Think of a shared document editor that warns "this file has changed since you opened it" when you try to save. The name comes from the assumption: <em>optimistic</em> locking assumes conflicts are rare and pays only when one happens (with a retry), while <em>pessimistic</em> locking, FOR UPDATE, assumes conflicts are likely and makes everyone wait in turn. Many ORMs support a version column out of the box.</p>
  <table class="tbl">
    <tr><th></th><th>Pessimistic (FOR UPDATE, conditional UPDATE)</th><th>Optimistic (version column)</th></tr>
    <tr><td>Assumes</td><td>conflicts are likely</td><td>conflicts are rare</td></tr>
    <tr><td>Best for</td><td>hot rows: last samosa, seat booking, wallet</td><td>edit forms, profiles, settings</td></tr>
    <tr><td>Cost</td><td>waiting; risk of deadlocks</td><td>a retry when a conflict happens</td></tr>
    <tr><td>Works across web requests</td><td>no</td><td>yes: the version travels with the form</td></tr>
  </table>

  <h2 id="st-dead"><span class="num">08</span>Deadlocks</h2>
  <p>Locks make sessions wait, and a session that is waiting may itself be holding locks. That opens the door to a circle of waiting. Ben sends Farah ₹50 for her share of a group order while, at the same moment, Farah sends Ben ₹30. Each transfer subtracts from the payer's wallet first and then adds to the receiver's:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')                  # A: Ben pays Farah 50, B: Farah pays Ben 30
A.run("BEGIN"); B.run("BEGIN")
A.run("UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2")         # A locks Ben
B.run("UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6")         # B locks Farah
job = A.start("UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6") # A waits for Farah
B.run("UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2")         # B waits for Ben: a cycle
A.finish(job)
A.run("ROLLBACK"); B.run("COMMIT")
A.run("SELECT customer_id, balance FROM wallets ORDER BY customer_id")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 B  BEGIN                                                          → BEGIN
 3 A  UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2 → UPDATE 1
 4 B  UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6 → UPDATE 1
 5 A  UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6 → ... waiting
 6 B  UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2 → UPDATE 1
 7 A  (the waiting statement)                                        → now returns: ERROR: deadlock detected
 8 A  ROLLBACK                                                       → ROLLBACK
 9 B  COMMIT                                                         → COMMIT
10 A  SELECT customer_id, balance FROM wallets ORDER BY customer_id  → (2, 530.00), (6, 270.00)</div>
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
    <text x="300" y="87" text-anchor="middle" font-size="11" class="tr">cycle → one is aborted</text>
  </svg><figcaption>A wait-for cycle: each transaction holds the lock the other needs next.</figcaption></figure>
  <p>Trace it with the figure. A holds the lock on Ben's wallet and waits for Farah's. B holds the lock on Farah's wallet and then asks for Ben's. Now each is waiting for the other, and neither can ever continue. This is a <strong>deadlock</strong>: a cycle of transactions, each waiting for a lock that another in the cycle holds. Think of two cars meeting head-on on a one-lane bridge, each waiting for the other to reverse. PostgreSQL does not wait forever: when a session has waited longer than <code>deadlock_timeout</code> (1 second by default), it checks for cycles, and if it finds one it aborts one of the transactions with "deadlock detected" (SQLSTATE <code>40P01</code>). Here it chose A. That released Ben's wallet, so B's waiting statement completed and B committed: Farah ends with ₹270 and Ben with ₹530. A's transfer must be retried by the application.</p>
  <p>Deadlocks are not bugs in the database; they come from the order in which your code takes locks. The cure is to make every transaction take its locks in the <strong>same order</strong>. If every transfer locks the two wallets in ascending customer_id order, whichever direction the money flows, a cycle becomes impossible, just as a rule "always enter the bridge from the east end" means cars never meet head-on:</p>
  <div class="fx" data-lang="py">A, B = Session('A'), Session('B')
lock_both = "SELECT customer_id FROM wallets WHERE customer_id IN (2, 6) ORDER BY customer_id FOR UPDATE"
A.run("BEGIN"); B.run("BEGIN")
A.run(lock_both)                                   # A locks Ben (2), then Farah (6)
job = B.start(lock_both)                           # B also wants Ben first: waits, holding nothing
A.run("UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2")
A.run("UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6")
A.run("COMMIT")
B.finish(job)
B.run("UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6")
B.run("UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2")
B.run("COMMIT")
A.run("SELECT customer_id, balance FROM wallets ORDER BY customer_id")</div>
  <div class="fx" data-lang="text"> 1 A  BEGIN                                                          → BEGIN
 2 B  BEGIN                                                          → BEGIN
 3 A  SELECT customer_id FROM wallets WHERE customer_id IN (2, 6) ORDER BY customer_id FOR UPDATE → (2), (6)
 4 B  SELECT customer_id FROM wallets WHERE customer_id IN (2, 6) ORDER BY customer_id FOR UPDATE → ... waiting
 5 A  UPDATE wallets SET balance = balance - 50 WHERE customer_id = 2 → UPDATE 1
 6 A  UPDATE wallets SET balance = balance + 50 WHERE customer_id = 6 → UPDATE 1
 7 A  COMMIT                                                         → COMMIT
 8 B  (the waiting statement)                                        → now returns: (2), (6)
 9 B  UPDATE wallets SET balance = balance - 30 WHERE customer_id = 6 → UPDATE 1
10 B  UPDATE wallets SET balance = balance + 30 WHERE customer_id = 2 → UPDATE 1
11 B  COMMIT                                                         → COMMIT
12 A  SELECT customer_id, balance FROM wallets ORDER BY customer_id  → (2, 480.00), (6, 320.00)</div>
  <p>B asked for Ben's wallet first, just like A, so it waited <em>while holding nothing</em>, and no cycle could form. When A committed, B got both locks and finished. Both transfers succeeded: Ben has 500 − 50 + 30 = ₹480 and Farah 300 + 50 − 30 = ₹320. Alongside a consistent lock order, keep transactions short (fewer locks held for less time) and still catch 40P01 and retry, because deadlocks can arise in ways that are hard to foresee, for example through foreign-key checks.</p>

  <h2 id="st-repl"><span class="num">09</span>Replication and Read Replicas</h2>
  <p>Everything so far protects data on one server. Durability survives a crash of the database process, but not the loss of the machine itself. And Biteful's "My orders" screen is read a hundred times for every order placed, so one server may not be able to answer all the reads. Both problems are solved by keeping live copies of the database on other servers. <strong>Replication</strong> does exactly this, and PostgreSQL builds it on the WAL from section 02: the log is already a complete, ordered record of every change, so <strong>streaming replication</strong> sends it to another server, called a <strong>standby</strong> or <strong>replica</strong>, which replays it and so holds the same data a moment later. The original server is the <strong>primary</strong>, and only it accepts writes. Here a real standby of the private test server is created on another port, standing in for a second machine:</p>
  <div class="fx" data-lang="text">export PATH=/usr/lib/postgresql/16/bin:$PATH
SOCK=/var/lib/postgresql/notes_b4_sock
REPLICA=/var/lib/postgresql/notes_b4_replica
# 1. copy the primary's files; -R writes the settings that say "I am a standby of port 5494"
runuser -u postgres -- pg_basebackup -h $SOCK -p 5494 -U postgres -D $REPLICA -R -X stream -c fast
# 2. start the copy as a standby on port 5495
runuser -u postgres -- pg_ctl -D $REPLICA -l $REPLICA.log -w start -o "-p 5495 -k $SOCK -c listen_addresses=''" &gt; /dev/null
psql -X -h $SOCK -p 5495 -U postgres -d notes_b4 -c "SELECT pg_is_in_recovery() AS is_standby"
psql -X -h $SOCK -p 5494 -U postgres -d notes_b4 -c "SELECT application_name, state, sync_state FROM pg_stat_replication"</div>
  <div class="fx" data-lang="text"> is_standby
------------
 t
(1 row)

 application_name |   state   | sync_state
------------------+-----------+------------
 walreceiver      | streaming | async
(1 row)</div>
  <p>The standby reports that it is "in recovery", meaning it is continuously replaying WAL, and the primary lists one streaming replica in asynchronous mode. Now the behaviour that matters, with P connected to the primary and R to the replica:</p>
  <div class="fx" data-lang="py">import time
from sessions import Session
sock = "/var/lib/postgresql/notes_b4_sock"
P = Session('P', host=sock, port=5494, user="postgres")         # the primary
R = Session('R', host=sock, port=5495, user="postgres")         # the replica
P.run("UPDATE menu SET stock = 15 WHERE item = 'Chicken Biryani'")
time.sleep(0.5)
R.run("SELECT stock FROM menu WHERE item = 'Chicken Biryani'")           # the change arrived
R.run("UPDATE menu SET stock = 14 WHERE item = 'Chicken Biryani'")       # replicas are read-only
R.run("SELECT pg_wal_replay_pause()")              # make lag visible: the replica stops applying WAL
P.run("UPDATE menu SET stock = 10 WHERE item = 'Chicken Biryani'")       # Ben's order on the primary
time.sleep(0.5)
R.run("SELECT stock FROM menu WHERE item = 'Chicken Biryani'")           # stale read!
R.run("SELECT pg_last_wal_receive_lsn() &gt; pg_last_wal_replay_lsn() AS behind")
R.run("SELECT pg_wal_replay_resume()")
time.sleep(0.5)
R.run("SELECT stock FROM menu WHERE item = 'Chicken Biryani'")</div>
  <div class="fx" data-lang="text"> 1 P  UPDATE menu SET stock = 15 WHERE item = 'Chicken Biryani'      → UPDATE 1
 2 R  SELECT stock FROM menu WHERE item = 'Chicken Biryani'          → 15
 3 R  UPDATE menu SET stock = 14 WHERE item = 'Chicken Biryani'      → ERROR: cannot execute UPDATE in a read-only transaction
 4 R  SELECT pg_wal_replay_pause()                                   →
 5 P  UPDATE menu SET stock = 10 WHERE item = 'Chicken Biryani'      → UPDATE 1
 6 R  SELECT stock FROM menu WHERE item = 'Chicken Biryani'          → 15
 7 R  SELECT pg_last_wal_receive_lsn() &gt; pg_last_wal_replay_lsn() AS behind → True
 8 R  SELECT pg_wal_replay_resume()                                  →
 9 R  SELECT stock FROM menu WHERE item = 'Chicken Biryani'          → 10</div>
  <p>Trace it. The replica received the change to 15 within half a second, and it refused a write ("read-only transaction"). Then we paused the replica's replay of the WAL, standing in for a replica that is overloaded or far away. The primary committed 10, but the replica still answered 15: it had received the log but not yet applied it. After resuming, it answered 10. That delay is <strong>replication lag</strong>, and it has a very visible consequence: a user who places an order (written on the primary) and immediately opens "My orders" (read from a replica) may not see the order they just placed. Think of a head office and its branch notice boards: decisions are made at head office and then posted to the branches by courier, so for a while after a change a branch can still show yesterday's notice.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="st-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="56" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="50" y="75" text-anchor="middle">app servers</text><text x="50" y="91" text-anchor="middle" font-size="10" class="tm">many clients</text>
    <line x1="100" y1="78" x2="138" y2="78" stroke="currentColor" marker-end="url(#st-ar4)"/>
    <rect x="140" y="56" width="110" height="44" rx="6" class="fv"/><text x="195" y="75" text-anchor="middle">pooler</text><text x="195" y="91" text-anchor="middle" font-size="10" class="tm">few real connections</text>
    <line x1="250" y1="70" x2="308" y2="34" stroke="currentColor" marker-end="url(#st-ar4)"/><text x="262" y="40" font-size="10" class="tm">writes</text>
    <line x1="250" y1="88" x2="308" y2="122" stroke="currentColor" marker-end="url(#st-ar4)"/><text x="262" y="124" font-size="10" class="tm">reads</text>
    <rect x="310" y="12" width="120" height="44" rx="6" class="fb sb"/><text x="370" y="38" text-anchor="middle" font-weight="bold">Primary</text>
    <rect x="310" y="100" width="120" height="44" rx="6" class="ft st"/><text x="370" y="126" text-anchor="middle">Replica</text>
    <rect x="470" y="100" width="120" height="44" rx="6" class="ft st" stroke-dasharray="4 3"/><text x="530" y="126" text-anchor="middle">more replicas…</text>
    <line x1="370" y1="56" x2="370" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-ar4)"/>
    <line x1="420" y1="56" x2="500" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-ar4)"/>
    <text x="445" y="32" font-size="10" class="tm">WAL stream (async)</text><text x="445" y="46" font-size="10" class="tr">lag: ms … s</text>
  </svg><figcaption>Replicas scale reads and provide a standby for failover. Every write still lands on one primary.</figcaption></figure>
  <p>The figure shows the usual layout. Writes go to the primary; reads can go to any replica; the WAL flows from the primary to every replica. Each design decision around it follows from lag. A common fix for the "my order is missing" problem is <strong>read-your-writes</strong> routing: after a user writes, send that user's reads to the primary for a few seconds. <strong>Synchronous replication</strong> makes COMMIT wait until at least one standby has the WAL, so no committed data is lost if the primary dies, at the cost of slower commits; the default asynchronous mode is faster but can lose the last few commits on failover. <strong>Failover</strong> means promoting a standby to become the new primary when the old one dies. And because each PostgreSQL connection is a separate server process, large applications put a <strong>connection pooler</strong> such as PgBouncer in front, funnelling thousands of app connections into a few dozen real ones.</p>
  <p>The most important rule is about correctness: never make a decision on a replica and then write on the primary. Checking samosa stock on a lagging replica and then ordering on the primary reintroduces the lost update, this time across machines. Reads that feed a write belong on the primary, inside the same transaction as the write.</p>


  <h2 id="st-shard"><span class="num">10</span>Sharding and Distributed Data</h2>
  <p>Replicas multiply read capacity, but every write still goes to one primary, and every replica stores the whole database. When Biteful grows to tens of millions of customers with orders pouring in all day, one primary may not keep up with the writes, or the data may not fit on one machine. The data then has to be split. <strong>Sharding</strong> divides the rows of a table across several independent database servers, called <strong>shards</strong>, each owning part of the data. Which shard a row lives on is decided by a <strong>shard key</strong>. Biteful shards by <code>customer_id</code>: even ids on shard 0 and odd ids on shard 1, so each customer's wallet and orders live together on one shard. Two separate databases stand in for two servers here, and the application does the routing:</p>
  <div class="fx" data-lang="py">import psycopg2

admin = psycopg2.connect(dbname="postgres"); admin.autocommit = True
for s in (0, 1):                                    # two databases stand in for two servers
    admin.cursor().execute(f"DROP DATABASE IF EXISTS notes_b4_shard{s}")
    admin.cursor().execute(f"CREATE DATABASE notes_b4_shard{s}")
shards = [psycopg2.connect(dbname=f"notes_b4_shard{s}") for s in (0, 1)]
for db in shards:
    db.autocommit = True
    db.cursor().execute("CREATE TABLE wallets (customer_id INT PRIMARY KEY, balance NUMERIC CHECK (balance &gt;= 0))")

def shard_for(customer_id):                         # the routing rule lives in the app (or a proxy)
    return shards[customer_id % 2].cursor()

def total():                                        # a query across customers must ask every shard
    s = 0
    for db in shards:
        cur = db.cursor(); cur.execute("SELECT coalesce(sum(balance), 0) FROM wallets"); s += cur.fetchone()[0]
    return s

shard_for(2).execute("INSERT INTO wallets VALUES (2, 500)")    # Ben  -&gt; shard 0
shard_for(1).execute("INSERT INTO wallets VALUES (1, 400)")    # Asha -&gt; shard 1
cur = shard_for(2); cur.execute("SELECT balance FROM wallets WHERE customer_id = 2")
print("Ben's wallet (one shard):", cur.fetchone()[0])
print("total of all wallets (both shards):", total())

# Ben pays Asha 100: two shards means two separate transactions
shard_for(2).execute("UPDATE wallets SET balance = balance - 100 WHERE customer_id = 2")   # commits on shard 0
print("! the app crashes before crediting Asha on shard 1")
print("total after the crash:", total())</div>
  <div class="fx" data-lang="text">Ben's wallet (one shard): 500
total of all wallets (both shards): 900
! the app crashes before crediting Asha on shard 1
total after the crash: 800</div>
  <p>Work on one customer stays simple and fast: Ben's wallet is read from one shard. Work across customers needs a "fan-out": the total of all wallets had to ask every shard and add the answers in the application. And the transfer from Ben (shard 0) to Asha (shard 1) became two separate transactions on two separate servers, so the crash between them made ₹100 disappear. That is precisely the atomicity failure transactions solved on one server, back again. Real systems handle cross-shard changes with <strong>two-phase commit</strong> (a coordinator first asks every shard to prepare, and only tells them all to commit once every shard has promised it can), with <strong>sagas</strong> (a chain of local transactions, each with a compensating action that undoes it if a later step fails), or, best of all, by choosing a shard key so that data that changes together lives together.</p>
  <p>Choosing the shard key is the most important sharding decision. A good key is one that most queries filter on and that spreads the load evenly. <code>customer_id</code> keeps each customer's data on one shard. <code>city</code> would put all of Mumbai's 8 pm rush on one shard, creating a <strong>hot shard</strong>, and <code>ordered_at</code> would send every new order to the newest shard. Sharding also gives up things that one database provides for free: joins, UNIQUE constraints and foreign keys across shards, and moving data when shards are added (rebalancing). Tools like Citus and Vitess, and distributed SQL databases like CockroachDB, take on much of this work. Even so, sharding is the most expensive step on the scaling ladder, which usually goes: tune queries and indexes, use a bigger machine, add a connection pooler, add read replicas, partition big tables, and only then shard. Most applications never need it. Note the difference from <strong>partitioning</strong> (<a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>), which splits a table into pieces inside one server, and from replication, which copies everything.</p>
  <p>Once data lives on several machines connected by a network, a deeper trade-off appears, described by the <strong>CAP theorem</strong>. If the network breaks and the machines cannot talk to each other (a <em>partition</em>), the system must choose: refuse some requests until the copies can agree again (<strong>consistency</strong>), or keep answering from whatever copy is reachable, even if its data may be stale (<strong>availability</strong>). The stale replica read in section 09 is the availability choice in miniature. A relational primary chooses consistency for writes. Many NoSQL databases, which are non-relational stores such as MongoDB, Cassandra and DynamoDB, were designed from the start to shard by key and stay available, and in exchange they offer weaker guarantees: often atomicity only within one document or key, and <em>eventual consistency</em> between copies. That is a good trade for a session cache, an activity feed or event logs, and a risky one for wallets and stock, where the samosa and wallet problems of this page do not disappear; they become the application's job. <a class="xref" data-note="db_types">Types of Databases</a> compares the families in detail.</p>

  <h2 id="st-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Concurrency bugs pass every single-user test and appear only under load, so they are worth recognising on sight. The most common one is reading a value into the application, computing a new value, and writing it back: <code>SELECT stock</code>, then <code>UPDATE … SET stock = :computed</code>. That is exactly what sold two samosas in section 03. The fix is to let the database do the arithmetic and the check in one statement, <code>SET stock = stock - 1 WHERE … AND stock &gt; 0</code>, and look at the row count, or to read with FOR UPDATE.</p>
  <p>The second is running related statements without a transaction. In autocommit mode Farah's order saved the stock change and the order but not the payment (section 01). Any change that spans more than one statement belongs between BEGIN and COMMIT. The opposite slip, in Python drivers, is forgetting <code>conn.commit()</code>, so the work is silently rolled back when the connection closes.</p>
  <p>The third is assuming a stronger isolation level fixes everything. REPEATABLE READ still let both riders go home (write skew). And SERIALIZABLE without a retry loop just turns anomalies into errors that users see; 40001 and 40P01 errors are normal and must be retried.</p>
  <p>The fourth is holding transactions open too long: across user input, across a slow API call, or in an idle notebook. An open snapshot blocked VACUUM in section 05, and held locks make everyone else wait. Related to this, a schema change on a busy table without <code>lock_timeout</code> can queue every query behind it (section 06).</p>
  <p>The fifth is taking locks in different orders in different code paths, which is what made the two wallet transfers deadlock; always lock rows in one consistent order, such as ascending id. And finally, two distributed mistakes: deciding on a replica and writing on the primary (the replica said 15 while the primary had 10), and treating two commits on two shards as one transaction (₹100 vanished).</p>

  <h2 id="st-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Transaction</b>: statements executed as one unit; <code>BEGIN</code> … <code>COMMIT</code> (keep all) or <code>ROLLBACK</code> (discard all). After an error it is aborted; COMMIT then performs ROLLBACK.</li>
    <li><b>Autocommit</b>: each statement is its own transaction (psql default). Python drivers open a transaction implicitly; call <code>commit()</code>.</li>
    <li><b>Savepoint</b>: checkpoint inside a transaction; <code>ROLLBACK TO SAVEPOINT</code> undoes only the work after it.</li>
    <li><b>ACID</b>: Atomicity (all or nothing), Consistency (declared constraints hold), Isolation (concurrent transactions don't see unfinished work), Durability (committed data survives crashes, via the WAL flushed at COMMIT).</li>
    <li><b>WAL</b>: write-ahead log; changes logged and flushed before COMMIT returns; replayed after a crash; streamed to replicas.</li>
    <li><b>MVCC</b>: UPDATE writes a new row version; <code>xmin</code> = creating transaction, <code>xmax</code> = replacing one; each snapshot sees the versions committed when it was taken; VACUUM removes dead versions.</li>
    <li><b>Row lock</b>: taken by UPDATE, DELETE, <code>SELECT … FOR UPDATE</code>; held to transaction end. <b>SKIP LOCKED</b> skips locked rows; <b>NOWAIT</b> errors instead of waiting.</li>
    <li><b>Deadlock</b>: cycle of waits; one transaction aborted (40P01) after <code>deadlock_timeout</code>.</li>
    <li><b>Replica</b>: read-only copy fed by WAL. <b>Lag</b>: how far behind it is. <b>Shard</b>: server holding part of the rows, chosen by the <b>shard key</b>.</li>
  </ul>
  <h3>Anomalies and isolation levels (PostgreSQL, verified)</h3>
  <table class="tbl">
    <tr><th>Level</th><th>Snapshot</th><th>Dirty</th><th>Non-repeatable</th><th>Phantom</th><th>Lost update</th><th>Write skew</th></tr>
    <tr><td>READ UNCOMMITTED</td><td>= READ COMMITTED</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>READ COMMITTED (default)</td><td>per statement</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>REPEATABLE READ</td><td>per transaction</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>Yes</td></tr>
    <tr><td>SERIALIZABLE</td><td>per transaction + SSI</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>No (error)</td></tr>
  </table>
  <ul>
    <li><b>Dirty read</b>: see uncommitted data. <b>Non-repeatable</b>: same row, new value. <b>Phantom</b>: same filter, new rows.</li>
    <li><b>Lost update</b>: write based on a stale read overwrites another write. <b>Write skew</b>: two transactions write different rows from the same read and break a rule.</li>
    <li>Serialization failure = SQLSTATE 40001 → retry the whole transaction.</li>
  </ul>
  <h3>Choosing a tool</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Tool</th></tr>
    <tr><td>Counter, stock, seats, balance</td><td><code>UPDATE … SET x = x - 1 WHERE … AND x &gt; 0</code>, check row count</td></tr>
    <tr><td>Read a row, decide in code, write it</td><td><code>SELECT … FOR UPDATE</code> in a short transaction</td></tr>
    <tr><td>Edit form across web requests</td><td>optimistic locking with a version column</td></tr>
    <tr><td>Rule across several rows</td><td>SERIALIZABLE + retry, lock all rows read, or a constraint</td></tr>
    <tr><td>Report that must add up</td><td>REPEATABLE READ</td></tr>
    <tr><td>Work queue with many workers</td><td><code>FOR UPDATE SKIP LOCKED</code></td></tr>
    <tr><td>Transfers between two rows</td><td>lock in a fixed order (ascending id); retry on 40P01</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">BEGIN ISOLATION LEVEL REPEATABLE READ;      -- or READ COMMITTED / SERIALIZABLE
SAVEPOINT s1;  ROLLBACK TO SAVEPOINT s1;
SELECT stock FROM menu WHERE item = 'Samosa' FOR UPDATE;          -- lock while reading
SELECT order_id FROM orders WHERE status = 'pending'
  ORDER BY order_id LIMIT 1 FOR UPDATE SKIP LOCKED;               -- queue
UPDATE menu SET stock = stock - 1 WHERE item = 'Samosa' AND stock &gt; 0;   -- atomic check
UPDATE menu SET price = 45, version = version + 1
  WHERE item = 'Samosa' AND version = 1;                          -- optimistic
SET lock_timeout = '2s';                                          -- before risky DDL
COMMIT;</div>
  <h3>Gotchas</h3>
  <ul>
    <li>PostgreSQL never dirty-reads; MySQL InnoDB defaults to REPEATABLE READ and behaves differently on updates.</li>
    <li>REPEATABLE READ does not stop write skew.</li>
    <li>Idle-in-transaction sessions block VACUUM → bloat.</li>
    <li>ALTER TABLE waits for an exclusive lock and queues every query behind it.</li>
    <li>FOR UPDATE cannot lock rows that don't exist yet.</li>
    <li>ACID's C (constraints) ≠ CAP's C (copies agree).</li>
    <li>Replicas lag: reads that feed writes go to the primary.</li>
  </ul>

  <h2 id="st-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a transaction?</summary><div class="qa-body">A transaction is a group of statements that the database executes as one unit: either all of their changes are made permanent with COMMIT, or none are, with ROLLBACK. It exists because real operations, like placing an order and charging a wallet, take several statements that only make sense together. If anything fails in the middle, the database undoes the whole group.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain ACID with an example.</summary><div class="qa-body">For a food order: Atomicity means taking stock, creating the order and charging the wallet all happen or none do. Consistency means constraints such as "balance can't go negative" and foreign keys hold after every commit. Isolation means another customer never sees the half-finished order. Durability means once "order placed" is confirmed, a crash cannot lose it, because the change is in the write-ahead log on disk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this leave in table t (initially empty)? <code>BEGIN; INSERT INTO t VALUES (1); SELECT 1/0; INSERT INTO t VALUES (2); COMMIT;</code></summary><div class="qa-body">Nothing. The division by zero aborts the transaction, the second INSERT is rejected, and COMMIT on an aborted transaction performs a ROLLBACK, which also undoes the first row. PostgreSQL even replies "ROLLBACK" to the COMMIT.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a dirty read, a non-repeatable read and a phantom read?</summary><div class="qa-body">A dirty read sees another transaction's uncommitted change. A non-repeatable read reads the same row twice in one transaction and gets different values because someone committed an update in between. A phantom read runs the same filter twice and gets a different set of rows because someone inserted or deleted matching rows in between.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the four SQL isolation levels and what each prevents.</summary><div class="qa-body">READ UNCOMMITTED allows dirty reads (except in PostgreSQL, where it acts as READ COMMITTED). READ COMMITTED prevents dirty reads; each statement sees data committed before it started. REPEATABLE READ also prevents non-repeatable reads (and in PostgreSQL phantoms and lost updates too), by using one snapshot for the whole transaction. SERIALIZABLE prevents all anomalies, making the result equal to some one-at-a-time order, by aborting a transaction when necessary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a lost update? How do you prevent it?</summary><div class="qa-body">Two transactions read the same value, each computes a new value from it, and the second write overwrites the first, so one change is lost; two buyers both get the last item. Prevent it with an atomic conditional update (<code>SET stock = stock - 1 WHERE stock &gt; 0</code>), with <code>SELECT … FOR UPDATE</code> before deciding, with optimistic locking via a version column, or with REPEATABLE READ or SERIALIZABLE, where PostgreSQL raises an error you retry.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is write skew, and which level prevents it?</summary><div class="qa-body">Two transactions read overlapping data, each decides based on it, and each writes a different row, so together they break a rule neither broke alone, such as both on-duty riders going home. No row is written twice, so REPEATABLE READ allows it. SERIALIZABLE prevents it by aborting one transaction; alternatives are locking all the rows the decision read, or expressing the rule as a constraint.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your application gets "could not serialize access" errors at SERIALIZABLE. Is that a bug?</summary><div class="qa-body">No. It is how serializable isolation works in PostgreSQL: rather than make transactions wait, it lets them run and aborts one when their combination could not have happened serially. The application must catch SQLSTATE 40001 and retry the whole transaction from the start; on retry it sees the new data and decides correctly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is MVCC, and why does it mean readers don't block writers?</summary><div class="qa-body">Multi-version concurrency control keeps several versions of a row: an UPDATE writes a new version stamped with its transaction id (xmin) and marks the old one as replaced (xmax). Each transaction reads the versions that were committed when its snapshot was taken. So a reader keeps reading the old version while a writer creates the new one, and neither waits for the other; only two writers on the same row conflict.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a long-running or idle transaction harmful in PostgreSQL?</summary><div class="qa-body">Its snapshot might still need old row versions, so VACUUM cannot remove any version that died after the snapshot was taken, anywhere in the database. Dead versions accumulate (bloat), tables and indexes grow, and queries slow down. It may also hold locks that block others. Keep transactions short and use idle_in_transaction_session_timeout.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does SELECT … FOR UPDATE do? When would you use SKIP LOCKED?</summary><div class="qa-body">It reads rows and locks them as if they were being updated, so other transactions that try to lock or modify them wait until this transaction ends; at READ COMMITTED the waiter then re-reads the latest committed row. SKIP LOCKED makes a query skip rows other transactions have locked, which is ideal for job queues where several workers each grab the next free job without waiting or double-processing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Optimistic vs pessimistic locking: which and when?</summary><div class="qa-body">Pessimistic locking (FOR UPDATE, conditional updates) prevents conflicts by making others wait; it suits hot rows with frequent conflicts, like stock or seat bookings, inside short transactions. Optimistic locking detects conflicts at save time with a version column (UPDATE … WHERE version = :loaded, then check the row count); it suits rare conflicts and edits that span user think-time and several web requests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock, how does the database handle it, and how do you prevent it?</summary><div class="qa-body">A deadlock is a cycle of transactions each waiting for a lock another holds, such as two opposite wallet transfers each holding one wallet. PostgreSQL detects the cycle after deadlock_timeout and aborts one transaction with SQLSTATE 40P01 so the others can continue. Prevent it by taking locks in a consistent order (for example ascending id), keeping transactions short, and retrying when it still happens.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Row locks vs table locks: why can an ALTER TABLE take a site down?</summary><div class="qa-body">Ordinary reads and writes take weak table locks that don't conflict with each other, plus row locks on the rows they change. Most ALTER TABLE commands need an ACCESS EXCLUSIVE table lock, so they wait for any open transaction on the table, and every new query then queues behind the waiting ALTER. Use a short lock_timeout for schema changes and avoid long transactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the database guarantee durability?</summary><div class="qa-body">Through write-ahead logging: before COMMIT returns, the change is appended to the WAL and the log is flushed to disk; data pages are written later. After a crash the database replays the WAL from the last checkpoint and redoes committed changes, as the order surviving an immediate shutdown showed. Turning off synchronous_commit trades a small window of possible loss for speed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is replication lag, and how do you deal with it?</summary><div class="qa-body">It is the delay between a commit on the primary and its appearance on an asynchronous replica. A user may write and then not see their own change if the read goes to a replica. Handle it with read-your-writes routing (send that user's reads to the primary for a while), waiting for the replica to catch up to a WAL position, or synchronous replication where it matters; and never base writes on replica reads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Replication vs partitioning vs sharding?</summary><div class="qa-body">Replication copies the whole database to other servers, which scales reads and provides failover, but writes still go to one primary. Partitioning splits a large table into pieces inside one server, which helps pruning and data retention. Sharding splits rows across several servers by a shard key, which scales writes and storage but loses easy cross-shard joins, constraints and transactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you keep a money transfer correct when the two accounts are on different shards?</summary><div class="qa-body">A single local transaction can't span two servers, so a crash between the two updates breaks atomicity. Options are two-phase commit, where a coordinator gets every shard to prepare before telling all of them to commit; a saga, a sequence of local transactions with compensating actions to undo earlier steps on failure; or avoiding the problem by choosing a shard key that keeps data that changes together on the same shard.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the CAP theorem say, and how does it relate to choosing SQL or NoSQL?</summary><div class="qa-body">When a network partition separates the nodes of a distributed database, it must choose between consistency (refusing requests until copies agree) and availability (answering, possibly with stale data). Relational databases with a single primary favour consistency and offer multi-row ACID transactions. Many NoSQL stores are built to shard and stay available, offering per-document atomicity and eventual consistency, which suits caches, feeds and logs better than money or stock.</div></details>
</main>
`
});
