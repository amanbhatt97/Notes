// notes/databases/sql_transactions.js — Transactions & Concurrency
Object.assign(TOPIC_CONTENT, {
  "sql_transactions": `<main>
  <h1>Transactions &amp; Concurrency</h1>
  <p class="lead">How a database keeps data correct when things fail halfway and when many users change it at once. Every timeline below was run with two real PostgreSQL 16 sessions.</p>

  <h2 id="st-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Transactions &amp; Concurrency</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Transaction</div>
      <ul>
        <li><b>Transaction</b> — statements that succeed or fail as one unit</li>
        <li><b>Syntax</b> — <code>BEGIN; … COMMIT;</code> or <code>ROLLBACK;</code></li>
        <li><b>SAVEPOINT</b> — <code>ROLLBACK TO SAVEPOINT s</code> undoes back to it, keeps earlier work</li>
        <li>⚠ <b>Aborted state</b> — after an error Postgres ignores all until ROLLBACK; COMMIT then rolls back</li>
        <li>⚠ <b>Autocommit</b> — no BEGIN = each statement alone; psycopg is the reverse: needs <code>conn.commit()</code></li>
        <li>💡 shopping cart: pay for all or put everything back</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">ACID</div>
      <ul>
        <li><b>Atomicity</b> — all or none; via WAL. 💡 vending machine returns the coin</li>
        <li><b>Consistency</b> — constraints true after every commit (CHECK, FK)</li>
        <li><b>Isolation</b> — no one sees half-done work; via MVCC + locks</li>
        <li><b>Durability</b> — committed survives crash; WAL flushed before COMMIT returns</li>
        <li>⚠ <b>ACID "C" ≠ CAP "C"</b> — constraints vs latest-write on every replica</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Anomalies</div>
      <ul>
        <li><b>Dirty read</b> — see uncommitted data (never in Postgres)</li>
        <li><b>Non-repeatable read</b> — same <em>row</em> read twice, new value (UPDATE between)</li>
        <li><b>Phantom</b> — same <em>filter</em>, new set of rows (INSERT/DELETE between)</li>
        <li><b>Lost update</b> — read-compute-write races; one write overwrites the other
          <ul><li>fix: <code>SET stock = stock - 1</code>, FOR UPDATE, version column</li></ul></li>
        <li><b>Write skew</b> — both read, write <em>different</em> rows, rule broken (no doctor on call)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Isolation levels</div>
      <ul>
        <li><b>READ COMMITTED</b> — PG default; each <em>statement</em> sees latest commits</li>
        <li><b>REPEATABLE READ</b> — snapshot for whole txn; blocks phantoms (PG) and lost update (error); allows write skew</li>
        <li><b>SERIALIZABLE</b> — as if one at a time; aborts a txn on danger</li>
        <li>⚠ <b>Retry on 40001</b> — serialization failure is by design</li>
        <li><b>READ UNCOMMITTED</b> — PG treats as READ COMMITTED</li>
        <li>⚠ <b>Defaults differ</b> — MySQL InnoDB = REPEATABLE READ</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">MVCC</div>
      <ul>
        <li><b>MVCC</b> — UPDATE writes a new row version; old one expires</li>
        <li><b>xmin / ctid</b> — creating txn / physical spot; both change on UPDATE</li>
        <li><b>Benefit</b> — readers never block writers, writers never block readers</li>
        <li><b>Writers still block writers</b> on the same row</li>
        <li><b>VACUUM</b> — removes dead versions; autovacuum in background</li>
        <li>⚠ <b>Idle in transaction</b> — old snapshot stops VACUUM → bloat</li>
        <li>💡 Wikipedia page history</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Locks &amp; deadlocks</div>
      <ul>
        <li><b>Row lock</b> — taken by UPDATE/DELETE, held until commit</li>
        <li><b>SELECT … FOR UPDATE</b> — lock while reading, decide, then write</li>
        <li><b>SKIP LOCKED</b> — job queues: each worker grabs different rows</li>
        <li><b>Deadlock</b> — A waits for B, B waits for A; PG kills one after 1 s</li>
        <li><b>Prevent</b> — lock in a fixed order (lower id first), short txns, retry</li>
        <li>💡 two cars on a one-lane bridge</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Optimistic vs pessimistic</div>
      <ul>
        <li><b>Pessimistic</b> — lock first (<code>FOR UPDATE</code>); for frequent conflicts (stock, seats)</li>
        <li><b>Optimistic</b> — no lock; <code>UPDATE … WHERE version = :v</code></li>
        <li><b>UPDATE 0</b> — someone changed it: reload and retry</li>
        <li><b>Across HTTP requests</b> — only optimistic works (can't hold a lock while user types)</li>
        <li>💡 library book taken home vs Google Docs "file changed"</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Scaling</div>
      <ul>
        <li><b>Order</b> — tune → bigger box → pooling → replicas → partition → shard</li>
        <li><b>PgBouncer</b> — 2,000 clients share ~50 real connections</li>
        <li><b>Read replicas</b> — stream WAL, serve reads; writes stay on primary</li>
        <li>⚠ <b>Replication lag</b> — stale read after write → read-your-writes from primary</li>
        <li><b>Partitioning</b> — split table on one server</li>
        <li><b>Sharding</b> — split across servers; loses cross-shard joins/txns/FKs
          <ul><li>shard key: in most queries, spreads load (customer_id, not date)</li></ul></li>
      </ul>
    </div>
  </div>
</div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="st-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Transaction Is</span><span class="rm-sub">All or nothing</span></div></div>
      <div class="rm-item rm-done" data-target="st-acid"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">ACID</span><span class="rm-sub">Four guarantees, four failures</span></div></div>
      <div class="rm-item rm-done" data-target="st-anom"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Concurrency Anomalies</span><span class="rm-sub">Five ways sessions collide</span></div></div>
      <div class="rm-item rm-done" data-target="st-iso"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Isolation Levels</span><span class="rm-sub">Which anomaly each blocks</span></div></div>
      <div class="rm-item rm-done" data-target="st-mvcc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">MVCC</span><span class="rm-sub">Readers never block writers</span></div></div>
      <div class="rm-item rm-done" data-target="st-locks"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Locks &amp; Deadlocks</span><span class="rm-sub">FOR UPDATE, SKIP LOCKED</span></div></div>
      <div class="rm-item rm-done" data-target="st-optim"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Optimistic vs Pessimistic</span><span class="rm-sub">Check later or lock now</span></div></div>
      <div class="rm-item rm-done" data-target="st-scale"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Scaling a SQL Database</span><span class="rm-sub">Replicas, pooling, sharding</span></div></div>
      <div class="rm-item rm-done" data-target="st-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="st-what"><span class="num">01</span>What a Transaction Is</h2>
  <p>You send ₹200 to a friend on UPI. Your balance drops. Then the network dies before the friend's balance rises. Where did the ₹200 go? Every payment app, every ticket booking, every shop that lets many people buy at once has this problem. This note is about the two tools a database uses to stop it: <strong>transactions</strong> (a group of changes treated as one) and <strong>concurrency control</strong> (rules for many users changing data at the same time).</p>
  <p>You will meet this in real jobs (double-booked seats, stock going negative, a report showing wrong totals) and in interviews ("explain ACID", "what is a deadlock?").</p>
  <p>Why the problem exists: a transfer is <em>two</em> updates in the database. Subtract from Asha. Add to Ben. If only the first one happens, ₹200 vanishes. The fix: tell the database "these statements belong together; do all of them or none of them". That group is a <strong>transaction</strong>. You open it with <code>BEGIN</code>, and close it with <code>COMMIT</code> (keep everything) or <code>ROLLBACK</code> (undo everything).</p>
  <div class="fx" data-lang="sql">CREATE TABLE accounts (acct_id int PRIMARY KEY, owner text,
                       balance numeric CHECK (balance &gt;= 0));
INSERT INTO accounts VALUES (1, 'Asha', 1000), (2, 'Ben', 500);

BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE acct_id = 1;
UPDATE accounts SET balance = balance + 200 WHERE acct_id = 2;
COMMIT;                                   -- both changes become permanent together</div>
  <table class="tbl out"><caption>Result</caption><tr><th>acct_id</th><th>owner</th><th>balance</th></tr><tr><td>1</td><td>Asha</td><td>800</td></tr><tr><td>2</td><td>Ben</td><td>700</td></tr></table>
  <p>Step by step: Asha had 1000, Ben 500. Inside the transaction Asha becomes 800 and Ben 700. At <code>COMMIT</code> both new values are saved at once. Nobody could ever see "Asha 800, Ben 500".</p>
  <p>Now a transfer of ₹5000, which Asha can't afford. The <code>CHECK (balance &gt;= 0)</code> rule on the table stops her balance going negative:</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE accounts SET balance = balance + 5000 WHERE acct_id = 2;   -- UPDATE 1 (Ben credited!)
UPDATE accounts SET balance = balance - 5000 WHERE acct_id = 1;
-- ERROR:  new row for relation "accounts" violates check constraint "accounts_balance_check"
SELECT * FROM accounts;
-- ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK;                                 -- Ben's credit is undone: still 800 / 700</div>
  <p>Notice two things. Ben was credited first and that worked. Then Asha's update failed. From that moment the transaction is in an <strong>aborted</strong> state: Postgres refuses every further command until you say <code>ROLLBACK</code>. After the rollback, Ben's +5000 is gone too. Nothing half-done remains.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopping cart. You add items (statements), then either pay for everything (<code>COMMIT</code>) or walk away and every item goes back on the shelf (<code>ROLLBACK</code>). Nobody else sees your cart's contents until you pay.</p>
  </div>
  <p>Sometimes you want to undo only the last step, not the whole cart. A <strong>SAVEPOINT</strong> is a checkpoint inside a transaction, like a save point in a video game: after a mistake you go back to it, not to the start. Below, the order row is kept while a bad item line is thrown away:</p>
  <div class="fx" data-lang="sql">BEGIN;
INSERT INTO orders VALUES (105, 4, '2024-08-01', 'pending');   -- Dia's first order
SAVEPOINT before_items;
INSERT INTO order_items VALUES (105, 99, 1, 10);
-- ERROR:  ... violates foreign key constraint "order_items_product_id_fkey"
ROLLBACK TO SAVEPOINT before_items;        -- order 105 survives
INSERT INTO order_items VALUES (105, 13, 1, 40);
COMMIT;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>product_id</th><th>qty</th></tr><tr><td>105</td><td>4</td><td>13</td><td>1</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Without <code>BEGIN</code>, each statement is its own transaction (<strong>autocommit</strong>). Two separate UPDATEs in a script are <em>not</em> atomic. In Python drivers it's the reverse: psycopg opens a transaction for you and nothing is saved until <code>conn.commit()</code>.</p>
  </div>

  <h2 id="st-acid"><span class="num">02</span>ACID</h2>
  <p>What exactly does a database promise about a transaction? Four things. Together they are called <strong>ACID</strong>, one letter per promise. Every interviewer asks this, so learn it with the money transfer:</p>
  <table class="tbl">
    <tr><th>Letter</th><th>Meaning</th><th>Failure it prevents</th><th>Analogy</th></tr>
    <tr><td><strong>Atomicity</strong></td><td>All statements apply, or none do</td><td>Debit happens, server crashes, credit never does</td><td>A vending machine: no snack, coin returned</td></tr>
    <tr><td><strong>Consistency</strong></td><td>Every commit leaves all constraints true</td><td>A negative balance or an order for a missing product</td><td>A referee who voids any move that breaks the rules</td></tr>
    <tr><td><strong>Isolation</strong></td><td>Concurrent transactions don't see each other's half-done work</td><td>A report counts money mid-transfer, in neither account</td><td>Changing rooms: others see you before or after, never mid-change</td></tr>
    <tr><td><strong>Durability</strong></td><td>Once committed, it survives crashes</td><td>"Payment successful" shown, then lost in a power cut</td><td>A signed receipt: the shop can't later claim you didn't pay</td></tr>
  </table>
  <p>How the database keeps these promises:</p>
  <ul>
    <li><strong>Atomicity and Durability</strong> come from the <strong>WAL</strong> (write-ahead log). Before changing the real table, Postgres first writes "I am about to change X to Y" into a log file on disk. Only when that log is safely on disk does <code>COMMIT</code> return. After a crash it reads the log: finished transactions are redone, unfinished ones are undone. Like a shopkeeper who writes a sale in the register <em>before</em> handing over the goods.</li>
    <li><strong>Consistency</strong> comes from constraints (<code>CHECK</code>, <code>FOREIGN KEY</code>, <code>UNIQUE</code>): rules the database checks before letting a change in.</li>
    <li><strong>Isolation</strong> comes from MVCC and locks, explained in sections 05 and 06.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The "C" in ACID (constraints hold) is not the "C" in CAP (every replica returns the latest write). CAP is a theorem about databases spread over many machines; same letter, different meaning. Interviewers like to check you know the difference.</p>
  </div>

  <h2 id="st-anom"><span class="num">03</span>Concurrency Anomalies</h2>
  <p>So far one user. Now picture a shop at 8 pm on sale day: hundreds of people reading and changing the same tables at the same moment. A <strong>session</strong> is one user's connection to the database. When two sessions touch the same data at the same time, strange things can happen. Each strange thing has a name. These names are called <strong>anomalies</strong> (anomaly = something that should not happen).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people editing the same Google Sheet. One reads a cell, the other changes it, the first one still has the old number in their head. Every anomaly below is a version of that.</p>
  </div>
  <p>The tables below show two sessions, A and B, in time order (row 1 first). Session B was a real second connection (via <code>dblink</code>). Five bugs:</p>

  <p><strong>1. Dirty read</strong>: reading another transaction's <em>uncommitted</em> change, which may be rolled back.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN ISOLATION LEVEL READ UNCOMMITTED;</code></td><td></td></tr>
    <tr><td>2</td><td></td><td><code>BEGIN; UPDATE accounts SET balance = 0 WHERE acct_id = 1;</code></td></tr>
    <tr><td>3</td><td><code>SELECT balance … acct_id = 1</code> → <strong>800</strong></td><td></td></tr>
    <tr><td>4</td><td></td><td><code>ROLLBACK;</code></td></tr>
  </table>
  <p>Walk through it. B sets Asha's balance to 0 but has not committed. A reads at step 3 and sees 800, the real committed value. Then B changes its mind and rolls back. Postgres never shows uncommitted data, even at READ UNCOMMITTED. A DB that allowed dirty reads would have returned 0 at step 3, a value that never officially existed, like reading a draft message that was later deleted.</p>

  <p><strong>2. Non-repeatable read</strong>: the same row read twice in one transaction gives different values.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A (READ COMMITTED)</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN; SELECT balance … acct_id = 1</code> → <strong>800</strong></td><td></td></tr>
    <tr><td>2</td><td></td><td><code>UPDATE accounts SET balance = balance - 100 WHERE acct_id = 1;</code> (commits)</td></tr>
    <tr><td>3</td><td><code>SELECT balance … acct_id = 1</code> → <strong>700</strong></td><td></td></tr>
  </table>
  <p>A asked the same question twice inside one transaction and got two answers, because B's change was committed in between. That is fine for a quick lookup, but wrong for a report that must add up. At REPEATABLE READ, the same steps gave 700 then 700: A keeps its <strong>snapshot</strong> (a frozen picture of the data as it was when A started).</p>

  <p><strong>3. Phantom read</strong>: the same <em>filter</em> returns a different set of rows because another transaction inserted or deleted matching rows.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A (READ COMMITTED)</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN; SELECT count(*) FROM orders WHERE status = 'pending'</code> → <strong>2</strong></td><td></td></tr>
    <tr><td>2</td><td></td><td><code>INSERT INTO orders VALUES (106, 2, '2024-08-02', 'pending');</code></td></tr>
    <tr><td>3</td><td>same count → <strong>3</strong></td><td></td></tr>
  </table>
  <p>The difference from bug 2: no existing row changed. A <em>new</em> row appeared, like a ghost ("phantom"), so the count went from 2 to 3. At REPEATABLE READ: 3 then 3. (Orders 104 and 105 were pending at the start.)</p>

  <p><strong>4. Lost update</strong>: two transactions read, compute, and write the same row; one write silently overwrites the other. This is the most common real-world bug. Picture 10 lamps in stock and two customers buying at the same second. Each app server reads "10", calculates 10 − 1 = 9, and writes 9. Two lamps sold, stock says 9.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="0" y="34" font-weight="bold">A</text><text x="0" y="94" font-weight="bold">B</text>
    <line x1="30" y1="30" x2="590" y2="30" stroke="currentColor" opacity=".3"/>
    <line x1="30" y1="90" x2="590" y2="90" stroke="currentColor" opacity=".3"/>
    <rect x="40" y="16" width="110" height="28" rx="5" class="fb sb"/><text x="95" y="35" text-anchor="middle">read → 10</text>
    <rect x="170" y="76" width="110" height="28" rx="5" class="fb sb"/><text x="225" y="95" text-anchor="middle">read → 10</text>
    <rect x="300" y="16" width="130" height="28" rx="5" class="ft st"/><text x="365" y="35" text-anchor="middle">write 9 ✓</text>
    <rect x="450" y="76" width="130" height="28" rx="5" class="fr sr"/><text x="515" y="95" text-anchor="middle">write 9 ✓</text>
    <text x="40" y="132" class="tm" font-size="11">stock in table:</text>
    <text x="150" y="132">10</text><text x="365" y="132" text-anchor="middle">9</text><text x="515" y="132" text-anchor="middle" class="tr">9 (should be 8)</text>
    <line x1="30" y1="150" x2="590" y2="150" stroke="currentColor" marker-end="url(#st-ar)"/><text x="590" y="166" text-anchor="end" font-size="10" class="tm">time</text>
  </svg><figcaption>Both read 10 before either wrote, so B's write silently erases A's sale.</figcaption></figure>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>SELECT stock … product_id = 13</code> → 10</td><td></td></tr>
    <tr><td>2</td><td></td><td><code>SELECT stock …</code> → 10</td></tr>
    <tr><td>3</td><td><code>UPDATE products SET stock = 9 …; COMMIT;</code></td><td></td></tr>
    <tr><td>4</td><td></td><td><code>UPDATE products SET stock = 9 …; COMMIT;</code></td></tr>
    <tr><td>5</td><td colspan="2">Two Lamps sold, final stock <strong>9</strong> (should be 8)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Fixes</span>
    <p>(1) Do the math in SQL: <code>SET stock = stock - 1</code>. Now the database reads and subtracts in one step, and the second UPDATE waits for the first, so 10 → 9 → 8. (2) Lock first: <code>SELECT … FOR UPDATE</code> (section 06). (3) Version column (section 07). (4) REPEATABLE READ: B's write failed with <code>ERROR: could not serialize access due to concurrent update</code>, so the app knows to retry.</p>
  </div>

  <p><strong>5. Write skew</strong>: two transactions read the same data, then update <em>different</em> rows, together breaking a rule neither broke alone. The hospital rule: at least one doctor must be on call. Ravi and Sara are both on call. Both check "is there another doctor on call? yes", and both go off duty at the same time.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A (REPEATABLE READ)</th><th>Session B (REPEATABLE READ)</th></tr>
    <tr><td>1</td><td><code>SELECT count(*) FROM on_call WHERE on_call</code> → 2</td><td><code>SELECT count(*) …</code> → 2</td></tr>
    <tr><td>2</td><td>2 ≥ 2, so <code>UPDATE on_call SET on_call = false WHERE doctor = 'Ravi'</code></td><td>2 ≥ 2, so <code>UPDATE … WHERE doctor = 'Sara'</code></td></tr>
    <tr><td>3</td><td><code>COMMIT;</code> ✓</td><td><code>COMMIT;</code> ✓</td></tr>
    <tr><td>4</td><td colspan="2">Nobody on call. No row was written twice, so row-level checks see nothing wrong.</td></tr>
  </table>
  <p>Same steps at SERIALIZABLE: B's <code>COMMIT</code> failed with <code>could not serialize access due to read/write dependencies among transactions … HINT: The transaction might succeed if retried.</code> Sara stayed on call.</p>

  <h2 id="st-iso"><span class="num">04</span>Isolation Levels</h2>
  <p>Stopping every anomaly costs speed: sessions must wait for each other or get cancelled and retried. So the database lets you choose how much protection each transaction gets. That setting is the <strong>isolation level</strong>. Higher level = fewer anomalies, but more waiting or retries.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Studying in a room. READ COMMITTED: the door is open, people walk through, you notice changes. REPEATABLE READ: you shut the door and work from the photo you took when you entered. SERIALIZABLE: only one person is allowed in the room at a time (or it looks that way).</p>
  </div>
  <p>Read the table row by row: which bugs from section 03 can still happen at each level?</p>
  <table class="tbl">
    <tr><th>Level (PostgreSQL)</th><th>Dirty read</th><th>Non-repeatable</th><th>Phantom</th><th>Lost update</th><th>Write skew</th></tr>
    <tr><td>READ UNCOMMITTED*</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td><strong>READ COMMITTED</strong> (default)</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>REPEATABLE READ</td><td>No</td><td>No</td><td>No</td><td>No (error)</td><td>Yes</td></tr>
    <tr><td>SERIALIZABLE</td><td>No</td><td>No</td><td>No</td><td>No</td><td>No (error)</td></tr>
  </table>
  <ul>
    <li>*Postgres treats READ UNCOMMITTED as READ COMMITTED: <strong>no dirty reads, ever</strong>.</li>
    <li><strong>READ COMMITTED</strong>: each <em>statement</em> sees data committed before it started.</li>
    <li><strong>REPEATABLE READ</strong> = <strong>snapshot isolation</strong>: the whole <em>transaction</em> sees one snapshot from its first query. Stricter than the SQL standard, which allows phantoms here.</li>
    <li><strong>SERIALIZABLE</strong>: the result is the same as if the transactions had run one after another in <em>some</em> order. Postgres doesn't make sessions wait more; it watches for dangerous patterns and aborts one transaction. <strong>Your code must retry</strong> on SQLSTATE <code>40001</code> (the error code for "serialization failure").</li>
  </ul>
  <div class="fx" data-lang="sql">BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... reads and writes ...
COMMIT;   -- may fail with 40001: catch it and rerun the whole transaction</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Defaults differ: Postgres, Oracle and SQL Server use READ COMMITTED; MySQL InnoDB uses REPEATABLE READ, and by default doesn't raise the lost-update error Postgres does. Never assume code is safe across engines.</p>
  </div>

  <h2 id="st-mvcc"><span class="num">05</span>MVCC</h2>
  <p>How can session A keep seeing balance 800 while B has already changed it to 700? If there were only one copy of the row, that would be impossible. The trick: Postgres keeps <em>both</em> copies for a while.</p>
  <p>An UPDATE doesn't overwrite a row. It writes a <strong>new version</strong> of the row and marks the old one as expired. Each transaction sees the versions that match its snapshot. This is <strong>MVCC</strong> (multi-version concurrency control: "many versions, so nobody has to wait").</p>
  <p>You can see the versions yourself. Every row has two hidden columns: <code>ctid</code> (where the row physically sits: page, slot) and <code>xmin</code> (the id of the transaction that created this version). Both change after an UPDATE, which proves a new copy was written:</p>
  <div class="fx" data-lang="sql">SELECT ctid, xmin, acct_id, balance FROM accounts WHERE acct_id = 1;
UPDATE accounts SET balance = balance - 100 WHERE acct_id = 1;
SELECT ctid, xmin, acct_id, balance FROM accounts WHERE acct_id = 1;</div>
  <table class="tbl out"><caption>Result (before → after)</caption><tr><th>ctid (physical spot)</th><th>xmin (creating txn)</th><th>acct_id</th><th>balance</th></tr><tr><td>(0,14)</td><td>881</td><td>1</td><td>800</td></tr><tr><td>(0,3)</td><td>882</td><td>1</td><td>700</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="158" y="10" width="236" height="56" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity=".5"/>
    <text x="276" y="30" text-anchor="middle">v1 · balance 800</text>
    <text x="276" y="48" text-anchor="middle" font-size="10" class="tm">ctid (0,14) · xmin 881 · xmax 882</text>
    <text x="276" y="61" text-anchor="middle" font-size="10" class="tr">dead after 882 commits</text>
    <rect x="158" y="98" width="236" height="56" rx="6" class="fg sg"/>
    <text x="276" y="118" text-anchor="middle">v2 · balance 700</text>
    <text x="276" y="136" text-anchor="middle" font-size="10" class="tm">ctid (0,3) · xmin 882 · live</text>
    <line x1="276" y1="66" x2="276" y2="96" stroke="currentColor" marker-end="url(#st-ar2)"/><text x="284" y="86" font-size="10" class="tm">UPDATE (txn 882)</text>
    <rect x="0" y="22" width="130" height="34" rx="6" class="fb sb"/><text x="65" y="36" text-anchor="middle" font-size="11">old snapshot</text><text x="65" y="50" text-anchor="middle" font-size="10" class="tm">long report</text>
    <line x1="130" y1="39" x2="156" y2="39" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <rect x="0" y="110" width="130" height="34" rx="6" class="fb sb"/><text x="65" y="124" text-anchor="middle" font-size="11">new snapshot</text><text x="65" y="138" text-anchor="middle" font-size="10" class="tm">started after 882</text>
    <line x1="130" y1="127" x2="156" y2="127" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <rect x="432" y="22" width="160" height="34" rx="6" class="fv"/><text x="512" y="43" text-anchor="middle" font-size="11">VACUUM removes v1</text>
    <line x1="430" y1="39" x2="396" y2="39" stroke="currentColor" marker-end="url(#st-ar2)"/>
    <text x="512" y="74" text-anchor="middle" font-size="10" class="tm">only once no snapshot</text><text x="512" y="87" text-anchor="middle" font-size="10" class="tm">can still see it</text>
  </svg><figcaption>One logical row, two physical versions. Each transaction reads the version its snapshot allows, so nobody waits.</figcaption></figure>
  <div class="cards">
    <div><b>Readers ↔ writers</b><p>Never block each other.</p></div>
    <div><b>Writer ↔ writer</b><p>Same row still waits (next section).</p></div>
    <div><b>VACUUM</b><p>Clears dead versions; without it, bloat.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Wikipedia page history. Editing creates a new revision; someone reading an old revision isn't interrupted. Old revisions are eventually archived (VACUUM).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A transaction left open for hours (an idle notebook connection after <code>BEGIN</code>) keeps an old snapshot alive, so VACUUM can't clean anything newer. Tables bloat and slow down. Watch <code>idle in transaction</code> in <code>pg_stat_activity</code>.</p>
  </div>

  <h2 id="st-locks"><span class="num">06</span>Locks &amp; Deadlocks</h2>
  <p>MVCC lets readers and writers ignore each other. But two <em>writers</em> on the same row cannot both win. Someone has to wait. The waiting is done with a <strong>lock</strong>: a "this row is mine until I finish" flag.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A trial room in a clothes shop. You lock the door while changing. Others wait outside. When you leave (COMMIT or ROLLBACK), the next person goes in.</p>
  </div>
  <p>Every UPDATE/DELETE takes a <strong>row lock</strong>, held until commit or rollback. A second writer on the same row waits. Sometimes you want the lock <em>before</em> writing: read the stock, think, then update. <code>SELECT … FOR UPDATE</code> takes the lock while reading, to reserve the row before deciding. Watch session B wait at step 2:</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN; SELECT balance FROM accounts WHERE acct_id = 1 FOR UPDATE;</code> → 800</td><td></td></tr>
    <tr><td>2</td><td></td><td><code>UPDATE accounts SET balance = balance - 50 WHERE acct_id = 1;</code> <em>waits</em> (<code>wait_event_type = Lock</code>)</td></tr>
    <tr><td>3</td><td><code>UPDATE … balance + 100 …; COMMIT;</code></td><td></td></tr>
    <tr><td>4</td><td></td><td>unblocks → <code>UPDATE 1</code>. Final: 850 (both changes kept)</td></tr>
  </table>

  <h3>SKIP LOCKED: job queues</h3>
  <p>A <strong>job queue</strong> is a table of tasks to do (send this email, resize this image). Many worker programs pull from it. With plain <code>FOR UPDATE</code> they would all wait on the same first row, one behind the other. <code>SKIP LOCKED</code> tells each worker to skip rows someone else holds and take the next free ones, like people at a buffet skipping the dish someone is already serving from.</p>
  <div class="fx" data-lang="sql">BEGIN;
SELECT job_id FROM jobs WHERE status = 'queued'
ORDER BY job_id LIMIT 2
FOR UPDATE SKIP LOCKED;          -- worker A got 1, 2; worker B (same query) got 3, 4
UPDATE jobs SET status = 'running' WHERE job_id IN (1, 2);
COMMIT;</div>

  <h3>Deadlocks</h3>
  <p>Locks create a new danger. A transfers money from account 1 to 2, so it locks row 1 first. At the same moment B transfers from 2 to 1 and locks row 2 first. Now A wants row 2 (B has it) and B wants row 1 (A has it). Both wait forever. That is a <strong>deadlock</strong>: each session holds a lock the other needs. Postgres checks after <code>deadlock_timeout</code> (1 s) and kills one so the other can finish.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="st-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="40" y="60" width="130" height="44" rx="8" class="fb sb"/><text x="105" y="87" text-anchor="middle" font-weight="bold">Session A</text>
    <rect x="430" y="60" width="130" height="44" rx="8" class="fb sb"/><text x="495" y="87" text-anchor="middle" font-weight="bold">Session B</text>
    <rect x="240" y="8" width="120" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="300" y="31" text-anchor="middle">acct 1</text>
    <rect x="240" y="122" width="120" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="300" y="145" text-anchor="middle">acct 2</text>
    <line x1="170" y1="66" x2="238" y2="30" class="sg" stroke-width="2.5"/><text x="150" y="40" font-size="11" class="tg">holds</text>
    <line x1="170" y1="98" x2="238" y2="136" class="sr" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#st-ar3)"/><text x="150" y="134" font-size="11" class="tr">waits</text>
    <line x1="430" y1="98" x2="362" y2="136" class="sg" stroke-width="2.5"/><text x="420" y="134" font-size="11" class="tg">holds</text>
    <line x1="430" y1="66" x2="362" y2="30" class="sr" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#st-ar3)"/><text x="420" y="40" font-size="11" class="tr">waits</text>
    <text x="300" y="87" text-anchor="middle" font-size="11" class="tr">cycle → PG kills one</text>
  </svg><figcaption>A wait-for cycle. Locking rows in one fixed order (acct 1 before acct 2) makes the cycle impossible.</figcaption></figure>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>UPDATE accounts … WHERE acct_id = 1;</code></td><td><code>UPDATE accounts … WHERE acct_id = 2;</code></td></tr>
    <tr><td>2</td><td></td><td><code>UPDATE … WHERE acct_id = 1;</code> waits for A</td></tr>
    <tr><td>3</td><td><code>UPDATE … WHERE acct_id = 2;</code> waits for B</td><td><code>ERROR: deadlock detected</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two cars on a one-lane bridge from opposite ends. Each waits for the other to reverse. Someone (the deadlock detector) has to make one back out.</p>
  </div>
  <ul>
    <li><strong>Prevent</strong>: lock rows in a <strong>consistent order</strong> (e.g. lower <code>acct_id</code> first, whichever direction the transfer goes).</li>
    <li>Keep transactions short; no user input or API calls while holding locks.</li>
    <li>Still handle it: catch the error and retry the transaction.</li>
  </ul>

  <h2 id="st-optim"><span class="num">07</span>Optimistic vs Pessimistic Locking</h2>
  <p>Two admins open the same product in an edit form. Both change the price. Both click Save. Whose price wins, and does the other one even find out? There are two ways to handle "someone else may be editing this too":</p>
  <ul>
    <li><strong>Pessimistic</strong>: assume conflict; lock first (<code>FOR UPDATE</code>), others wait.</li>
    <li><strong>Optimistic</strong>: assume no conflict; don't lock. At write time, check nothing changed since you read, using a <code>version</code> column.</li>
  </ul>
  <div class="fx" data-lang="sql">SELECT product_id, price, version FROM products WHERE product_id = 12;   -- 150.00, version 1
-- Two admins both loaded version 1 and edit the price:
UPDATE products SET price = 140, version = version + 1 WHERE product_id = 12 AND version = 1;  -- UPDATE 1
UPDATE products SET price = 160, version = version + 1 WHERE product_id = 12 AND version = 1;  -- UPDATE 0</div>
  <p>Walk through it. Both admins loaded the row when <code>version</code> was 1. The first UPDATE finds version 1, changes the price to 140 and bumps the version to 2. The second UPDATE looks for version 1, finds version 2, and matches nothing: <code>UPDATE 0</code>. That tells the second admin "someone changed this; reload and retry". Final row: price 140, version 2. No lock was ever held while the admins were typing.</p>
  <table class="tbl">
    <tr><th></th><th>Pessimistic</th><th>Optimistic</th></tr>
    <tr><td>Best when</td><td>Conflicts are frequent (hot inventory row, seat booking)</td><td>Conflicts are rare (profile edits, admin forms)</td></tr>
    <tr><td>Cost</td><td>Waiting, deadlock risk</td><td>Retries when a conflict does happen</td></tr>
    <tr><td>Works across HTTP requests?</td><td>No: can't hold a lock while a user thinks</td><td>Yes: version travels with the form</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Pessimistic: taking a library book home so nobody else can edit it. Optimistic: Google Docs version check: "This file changed since you opened it."</p>
  </div>

  <h2 id="st-scale"><span class="num">08</span>Scaling a SQL Database</h2>
  <p>Your app grows from 100 users to 10 million. One database server starts to struggle. <strong>Scaling</strong> means handling more load. The options, from cheapest to hardest:</p>
  <div class="flow"><span>Tune queries &amp; indexes</span><span>Bigger machine</span><span>Connection pooling</span><span>Read replicas</span><span>Partitioning</span><span>Sharding</span></div>
  <p>Left to right, each step adds complexity. <strong>Vertical scaling</strong> (bigger box) needs no code changes but has a ceiling and stays a single point of failure.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="st-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="56" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="50" y="75" text-anchor="middle">2,000</text><text x="50" y="91" text-anchor="middle" font-size="10" class="tm">app clients</text>
    <line x1="100" y1="78" x2="138" y2="78" stroke="currentColor" marker-end="url(#st-ar4)"/>
    <rect x="140" y="56" width="110" height="44" rx="6" class="fv"/><text x="195" y="75" text-anchor="middle">PgBouncer</text><text x="195" y="91" text-anchor="middle" font-size="10" class="tm">~50 real conns</text>
    <line x1="250" y1="70" x2="308" y2="34" stroke="currentColor" marker-end="url(#st-ar4)"/><text x="262" y="40" font-size="10" class="tm">writes</text>
    <line x1="250" y1="88" x2="308" y2="122" stroke="currentColor" marker-end="url(#st-ar4)"/><text x="262" y="124" font-size="10" class="tm">reads</text>
    <rect x="310" y="12" width="120" height="44" rx="6" class="fb sb"/><text x="370" y="38" text-anchor="middle" font-weight="bold">Primary</text>
    <rect x="310" y="100" width="120" height="44" rx="6" class="ft st"/><text x="370" y="126" text-anchor="middle">Replica 1</text>
    <rect x="470" y="100" width="120" height="44" rx="6" class="ft st"/><text x="530" y="126" text-anchor="middle">Replica 2</text>
    <line x1="370" y1="56" x2="370" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-ar4)"/>
    <line x1="420" y1="56" x2="500" y2="98" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#st-ar4)"/>
    <text x="445" y="32" font-size="10" class="tm">WAL stream (async)</text><text x="445" y="46" font-size="10" class="tr">lag: ms … s</text>
  </svg><figcaption>Pooling caps connections; replicas scale reads only. Every write still lands on one primary.</figcaption></figure>
  <ul>
    <li><strong>Connection pooling</strong>: each Postgres connection is a separate process using several MB of memory, so 2,000 app connections would crush the server. A <strong>pooler</strong> (like PgBouncer) sits in front and lets the 2,000 clients share ~50 real connections, like a few counters serving a long queue.</li>
    <li><strong>Read replicas</strong>: extra copies of the database. They receive the primary's WAL (the change log from section 02) and replay it, so they hold the same data a moment later. They serve reads only; every write still goes to the one <strong>primary</strong>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: replication lag</span>
    <p>Replicas are usually async, milliseconds to seconds behind. A user saves their profile (primary), refreshes (replica), and sees the old value. Fix: read-your-writes, i.e. route that user's reads to the primary for a few seconds after a write, or for that page.</p>
  </div>
  <p>When even the writes are too many for one machine, the data itself must be split:</p>
  <table class="tbl">
    <tr><th></th><th>Partitioning</th><th>Sharding</th></tr>
    <tr><td>What</td><td>Split a table into pieces <em>on one server</em></td><td>Split data across <em>many servers</em>, each owning a key range or hash</td></tr>
    <tr><td>Solves</td><td>Huge tables: pruning, cheap retention</td><td>Write volume or data size beyond one machine</td></tr>
    <tr><td>Cost</td><td>Small: still one database</td><td>Large: cross-shard joins and transactions are hard; rebalancing; app must route by key</td></tr>
    <tr><td>Example</td><td><code>orders</code> by month</td><td>Users 0–1M on shard A, 1M–2M on shard B (or hash of <code>user_id</code>)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Choosing a shard key</span>
    <p>Pick the key most queries filter on and that spreads load evenly, e.g. <code>customer_id</code>. A bad key (e.g. <code>country</code>, or the date for new writes) creates a hot shard. Tools like Citus or Vitess handle routing.</p>
  </div>

  <h2 id="st-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: what do BEGIN, COMMIT and ROLLBACK do?</summary><div class="qa-body"><code>BEGIN</code> starts a transaction (a group of statements treated as one). <code>COMMIT</code> makes all its changes permanent together. <code>ROLLBACK</code> undoes all of them as if they never happened.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain ACID with a money transfer.</summary><div class="qa-body">Atomicity: debit and credit both happen or neither. Consistency: <code>CHECK (balance &gt;= 0)</code> and FKs hold after commit. Isolation: a concurrent report never sees money in neither account. Durability: once "transfer complete" is returned, a crash can't undo it (WAL flushed to disk).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>BEGIN; INSERT INTO t VALUES (1); SELECT 1/0; INSERT INTO t VALUES (2); COMMIT;</code> then <code>SELECT count(*) FROM t</code> (t was empty).</summary><div class="qa-body">0. After the division-by-zero error the transaction is aborted: the second INSERT is rejected ("current transaction is aborted"), and <code>COMMIT</code> on an aborted transaction performs a <code>ROLLBACK</code>. Row 1 is undone too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Non-repeatable read vs phantom read?</summary><div class="qa-body">Non-repeatable: the <em>same row</em> changes value between two reads (an UPDATE committed in between). Phantom: the <em>same filter</em> returns different rows (an INSERT/DELETE committed in between). Row locks can stop the first; the second needs predicate or snapshot protection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two users click "Buy" on the last item and both succeed. Fix it.</summary><div class="qa-body">Make the check and decrement one atomic statement:<div class="fx" data-lang="sql">UPDATE products SET stock = stock - 1
WHERE product_id = 13 AND stock &gt; 0;   -- UPDATE 0 means sold out</div>The second buyer's UPDATE waits for the first's row lock, re-checks <code>stock &gt; 0</code>, and updates 0 rows. Alternatives: <code>SELECT … FOR UPDATE</code> then decide, or a version column.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is write skew, and which isolation level prevents it?</summary><div class="qa-body">Two transactions read overlapping data, then write <em>different</em> rows, together violating a rule (both doctors go off call). No row is written twice, so REPEATABLE READ allows it. Only SERIALIZABLE prevents it (one aborts), or explicitly locking the rows read (<code>FOR UPDATE</code>), or a constraint.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your service uses SERIALIZABLE and sometimes gets "could not serialize access". Is that a bug?</summary><div class="qa-body">No, it's the design. Postgres detected that committing would break serializability and aborted one transaction (SQLSTATE 40001). The application must retry the whole transaction, usually with a small backoff and a retry limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain MVCC. Why does a long-running transaction hurt Postgres?</summary><div class="qa-body">Updates create new row versions; each transaction reads the versions visible to its snapshot, so readers and writers don't block each other. A long-open transaction keeps an old snapshot alive, so VACUUM can't remove dead versions created after it: tables and indexes bloat and queries slow down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query for several workers to pull jobs without double-processing.</summary><div class="qa-body"><div class="fx" data-lang="sql">BEGIN;
SELECT job_id FROM jobs WHERE status = 'queued'
ORDER BY job_id LIMIT 1 FOR UPDATE SKIP LOCKED;
UPDATE jobs SET status = 'running' WHERE job_id = :id;
COMMIT;</div>Each worker locks a different row; locked rows are skipped, not waited on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do deadlocks happen in a transfer service, and how do you prevent them?</summary><div class="qa-body">Transfer A→B locks A then B; simultaneous B→A locks B then A. Each waits for the other. Prevent by always locking accounts in a fixed order (lower id first), keeping transactions short, and retrying when Postgres kills one with "deadlock detected".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Optimistic or pessimistic locking for (a) editing a product description in an admin form, (b) decrementing stock of a flash-sale item?</summary><div class="qa-body">(a) Optimistic: conflicts are rare, and a user can't hold a DB lock while typing. Use a version column; <code>UPDATE 0</code> means reload. (b) Pessimistic or an atomic <code>UPDATE … stock = stock - 1 WHERE stock &gt; 0</code>: conflicts are constant, so optimistic would retry endlessly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user updates their profile, refreshes, and sees the old value. What happened?</summary><div class="qa-body">Replication lag: the write went to the primary, the read hit an async replica that hadn't caught up. Fix with read-your-writes: send that user's reads to the primary briefly after a write, or wait for the replica to reach the write's WAL position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Partitioning vs sharding: what's the difference, and what do you lose with sharding?</summary><div class="qa-body">Partitioning splits a table within one server; sharding spreads data across servers. Sharding loses easy cross-shard joins, foreign keys and ACID transactions across shards; adds routing and rebalancing work. Pick a shard key that most queries filter on and that spreads load evenly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your app opens a new Postgres connection per request and falls over at 1,000 concurrent users. Why, and what's the fix?</summary><div class="qa-body">Each Postgres connection is a separate process with its own memory, and setting one up is slow, so thousands exhaust RAM and <code>max_connections</code>. Put a pooler like PgBouncer in front (or an app-side pool) so many clients share a small set of real connections.</div></details>
</main>`
});
