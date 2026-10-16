// notes/databases/sql_transactions.js — Transactions & Concurrency
Object.assign(TOPIC_CONTENT, {
  "sql_transactions": `<main>
  <h1>Transactions &amp; Concurrency</h1>
  <p class="lead">How a database keeps data correct when things fail halfway and when many users change it at once. Every timeline below was run with two real PostgreSQL 16 sessions.</p>

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
      <div class="rm-item rm-done" data-target="st-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="st-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="st-what"><span class="num">01</span>What a Transaction Is</h2>
  <p>A <strong>transaction</strong> is a group of statements that succeed or fail as one unit. Classic case: moving ₹200 from Asha to Ben is <em>two</em> updates. If only the debit happens, ₹200 vanishes.</p>
  <div class="fx" data-lang="sql">CREATE TABLE accounts (acct_id int PRIMARY KEY, owner text,
                       balance numeric CHECK (balance &gt;= 0));
INSERT INTO accounts VALUES (1, 'Asha', 1000), (2, 'Ben', 500);

BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE acct_id = 1;
UPDATE accounts SET balance = balance + 200 WHERE acct_id = 2;
COMMIT;                                   -- both changes become permanent together</div>
  <table class="tbl out"><caption>Result</caption><tr><th>acct_id</th><th>owner</th><th>balance</th></tr><tr><td>1</td><td>Asha</td><td>800</td></tr><tr><td>2</td><td>Ben</td><td>700</td></tr></table>
  <p>Now a transfer of ₹5000, which Asha can't afford:</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE accounts SET balance = balance + 5000 WHERE acct_id = 2;   -- UPDATE 1 (Ben credited!)
UPDATE accounts SET balance = balance - 5000 WHERE acct_id = 1;
-- ERROR:  new row for relation "accounts" violates check constraint "accounts_balance_check"
SELECT * FROM accounts;
-- ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK;                                 -- Ben's credit is undone: still 800 / 700</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopping cart. You add items (statements), then either pay for everything (<code>COMMIT</code>) or walk away and every item goes back on the shelf (<code>ROLLBACK</code>). Nobody else sees your cart's contents until you pay.</p>
  </div>
  <p><strong>SAVEPOINT</strong> is a checkpoint inside a transaction: undo back to it without losing earlier work.</p>
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
  <table class="tbl">
    <tr><th>Letter</th><th>Meaning</th><th>Failure it prevents</th><th>Analogy</th></tr>
    <tr><td><strong>Atomicity</strong></td><td>All statements apply, or none do</td><td>Debit happens, server crashes, credit never does</td><td>A vending machine: no snack, coin returned</td></tr>
    <tr><td><strong>Consistency</strong></td><td>Every commit leaves all constraints true</td><td>A negative balance or an order for a missing product</td><td>A referee who voids any move that breaks the rules</td></tr>
    <tr><td><strong>Isolation</strong></td><td>Concurrent transactions don't see each other's half-done work</td><td>A report counts money mid-transfer, in neither account</td><td>Changing rooms: others see you before or after, never mid-change</td></tr>
    <tr><td><strong>Durability</strong></td><td>Once committed, it survives crashes</td><td>"Payment successful" shown, then lost in a power cut</td><td>A signed receipt: the shop can't later claim you didn't pay</td></tr>
  </table>
  <ul>
    <li><strong>How</strong>: atomicity and durability come from the <strong>WAL</strong> (write-ahead log: changes logged and flushed before commit returns). Consistency comes from constraints. Isolation comes from MVCC and locks (below).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The "C" in ACID (constraints hold) is not the "C" in CAP (every replica returns the latest write). Interviewers like to check you know the difference.</p>
  </div>

  <h2 id="st-anom"><span class="num">03</span>Concurrency Anomalies</h2>
  <p>Running transactions one at a time would be safe but slow. Running them in parallel without isolation causes these bugs. Session B was a real second connection (via <code>dblink</code>).</p>

  <p><strong>1. Dirty read</strong>: reading another transaction's <em>uncommitted</em> change, which may be rolled back.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN ISOLATION LEVEL READ UNCOMMITTED;</code></td><td></td></tr>
    <tr><td>2</td><td></td><td><code>BEGIN; UPDATE accounts SET balance = 0 WHERE acct_id = 1;</code></td></tr>
    <tr><td>3</td><td><code>SELECT balance … acct_id = 1</code> → <strong>800</strong></td><td></td></tr>
    <tr><td>4</td><td></td><td><code>ROLLBACK;</code></td></tr>
  </table>
  <p>Postgres never shows uncommitted data, even at READ UNCOMMITTED. A DB that allowed dirty reads would have returned 0, a value that never officially existed.</p>

  <p><strong>2. Non-repeatable read</strong>: the same row read twice in one transaction gives different values.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A (READ COMMITTED)</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN; SELECT balance … acct_id = 1</code> → <strong>800</strong></td><td></td></tr>
    <tr><td>2</td><td></td><td><code>UPDATE accounts SET balance = balance - 100 WHERE acct_id = 1;</code> (commits)</td></tr>
    <tr><td>3</td><td><code>SELECT balance … acct_id = 1</code> → <strong>700</strong></td><td></td></tr>
  </table>
  <p>At REPEATABLE READ, the same steps gave 700 then 700: A keeps its snapshot.</p>

  <p><strong>3. Phantom read</strong>: the same <em>filter</em> returns a different set of rows because another transaction inserted or deleted matching rows.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A (READ COMMITTED)</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN; SELECT count(*) FROM orders WHERE status = 'pending'</code> → <strong>2</strong></td><td></td></tr>
    <tr><td>2</td><td></td><td><code>INSERT INTO orders VALUES (106, 2, '2024-08-02', 'pending');</code></td></tr>
    <tr><td>3</td><td>same count → <strong>3</strong></td><td></td></tr>
  </table>
  <p>At REPEATABLE READ: 3 then 3. (Orders 104 and 105 were pending at the start.)</p>

  <p><strong>4. Lost update</strong>: two transactions read, compute, and write the same row; one write silently overwrites the other.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>SELECT stock … product_id = 13</code> → 10</td><td></td></tr>
    <tr><td>2</td><td></td><td><code>SELECT stock …</code> → 10</td></tr>
    <tr><td>3</td><td><code>UPDATE products SET stock = 9 …; COMMIT;</code></td><td></td></tr>
    <tr><td>4</td><td></td><td><code>UPDATE products SET stock = 9 …; COMMIT;</code></td></tr>
    <tr><td>5</td><td colspan="2">Two Lamps sold, final stock <strong>9</strong> (should be 8)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Fixes</span>
    <p>(1) Do the math in SQL: <code>SET stock = stock - 1</code>, an atomic read-modify-write. (2) Lock first: <code>SELECT … FOR UPDATE</code>. (3) Version column (section 07). (4) REPEATABLE READ: B's write failed with <code>ERROR: could not serialize access due to concurrent update</code>.</p>
  </div>

  <p><strong>5. Write skew</strong>: two transactions read the same data, then update <em>different</em> rows, together breaking a rule neither broke alone. Rule: at least one doctor on call.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A (REPEATABLE READ)</th><th>Session B (REPEATABLE READ)</th></tr>
    <tr><td>1</td><td><code>SELECT count(*) FROM on_call WHERE on_call</code> → 2</td><td><code>SELECT count(*) …</code> → 2</td></tr>
    <tr><td>2</td><td>2 ≥ 2, so <code>UPDATE on_call SET on_call = false WHERE doctor = 'Ravi'</code></td><td>2 ≥ 2, so <code>UPDATE … WHERE doctor = 'Sara'</code></td></tr>
    <tr><td>3</td><td><code>COMMIT;</code> ✓</td><td><code>COMMIT;</code> ✓</td></tr>
    <tr><td>4</td><td colspan="2">Nobody on call. No row was written twice, so row-level checks see nothing wrong.</td></tr>
  </table>
  <p>Same steps at SERIALIZABLE: B's <code>COMMIT</code> failed with <code>could not serialize access due to read/write dependencies among transactions … HINT: The transaction might succeed if retried.</code> Sara stayed on call.</p>

  <h2 id="st-iso"><span class="num">04</span>Isolation Levels</h2>
  <p>An <strong>isolation level</strong> is how much a transaction is shielded from concurrent ones. Higher = fewer anomalies, more blocking or retries.</p>
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
    <li><strong>SERIALIZABLE</strong>: result equals <em>some</em> one-at-a-time order. Postgres doesn't block more; it watches for dangerous patterns and aborts one transaction. <strong>Your code must retry</strong> on SQLSTATE <code>40001</code>.</li>
  </ul>
  <div class="fx" data-lang="sql">BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... reads and writes ...
COMMIT;   -- may fail with 40001: catch it and rerun the whole transaction</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Defaults differ: Postgres, Oracle and SQL Server use READ COMMITTED; MySQL InnoDB uses REPEATABLE READ, and by default doesn't raise the lost-update error Postgres does. Never assume code is safe across engines.</p>
  </div>

  <h2 id="st-mvcc"><span class="num">05</span>MVCC</h2>
  <p><strong>MVCC</strong> (multi-version concurrency control): an UPDATE doesn't overwrite a row; it writes a <strong>new version</strong> and marks the old one expired. Each transaction sees the versions that match its snapshot.</p>
  <div class="fx" data-lang="sql">SELECT ctid, xmin, acct_id, balance FROM accounts WHERE acct_id = 1;
UPDATE accounts SET balance = balance - 100 WHERE acct_id = 1;
SELECT ctid, xmin, acct_id, balance FROM accounts WHERE acct_id = 1;</div>
  <table class="tbl out"><caption>Result (before → after)</caption><tr><th>ctid (physical spot)</th><th>xmin (creating txn)</th><th>acct_id</th><th>balance</th></tr><tr><td>(0,14)</td><td>881</td><td>1</td><td>800</td></tr><tr><td>(0,3)</td><td>882</td><td>1</td><td>700</td></tr></table>
  <p>Same logical row, new physical location, new creating transaction. The old version stays until no snapshot needs it.</p>
  <ul>
    <li><strong>Readers don't block writers, writers don't block readers.</strong> A long report reads old versions while updates continue.</li>
    <li><strong>Writers still block writers</strong> on the same row (section 06).</li>
    <li><strong>VACUUM</strong> removes dead versions (autovacuum does it in the background). Without it, tables bloat.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Wikipedia page history. Editing creates a new revision; someone reading an old revision isn't interrupted. Old revisions are eventually archived (VACUUM).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A transaction left open for hours (an idle notebook connection after <code>BEGIN</code>) keeps an old snapshot alive, so VACUUM can't clean anything newer. Tables bloat and slow down. Watch <code>idle in transaction</code> in <code>pg_stat_activity</code>.</p>
  </div>

  <h2 id="st-locks"><span class="num">06</span>Locks &amp; Deadlocks</h2>
  <p>Every UPDATE/DELETE takes a <strong>row lock</strong>, held until commit or rollback. A second writer on the same row waits. <code>SELECT … FOR UPDATE</code> takes that lock while reading, to reserve the row before deciding.</p>
  <table class="tbl">
    <tr><th>#</th><th>Session A</th><th>Session B</th></tr>
    <tr><td>1</td><td><code>BEGIN; SELECT balance FROM accounts WHERE acct_id = 1 FOR UPDATE;</code> → 800</td><td></td></tr>
    <tr><td>2</td><td></td><td><code>UPDATE accounts SET balance = balance - 50 WHERE acct_id = 1;</code> <em>waits</em> (<code>wait_event_type = Lock</code>)</td></tr>
    <tr><td>3</td><td><code>UPDATE … balance + 100 …; COMMIT;</code></td><td></td></tr>
    <tr><td>4</td><td></td><td>unblocks → <code>UPDATE 1</code>. Final: 850 (both changes kept)</td></tr>
  </table>

  <h3>SKIP LOCKED: job queues</h3>
  <p>Many workers pulling from one <code>jobs</code> table would all wait on the same first row. <code>SKIP LOCKED</code> tells each to skip rows someone else holds.</p>
  <div class="fx" data-lang="sql">BEGIN;
SELECT job_id FROM jobs WHERE status = 'queued'
ORDER BY job_id LIMIT 2
FOR UPDATE SKIP LOCKED;          -- worker A got 1, 2; worker B (same query) got 3, 4
UPDATE jobs SET status = 'running' WHERE job_id IN (1, 2);
COMMIT;</div>

  <h3>Deadlocks</h3>
  <p>A <strong>deadlock</strong>: A holds lock 1 and waits for lock 2; B holds lock 2 and waits for lock 1. Neither can move. Postgres checks after <code>deadlock_timeout</code> (1 s) and kills one.</p>
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
  <ul>
    <li><strong>Pessimistic</strong>: assume conflict; lock first (<code>FOR UPDATE</code>), others wait.</li>
    <li><strong>Optimistic</strong>: assume no conflict; don't lock. At write time, check nothing changed since you read, using a <code>version</code> column.</li>
  </ul>
  <div class="fx" data-lang="sql">SELECT product_id, price, version FROM products WHERE product_id = 12;   -- 150.00, version 1
-- Two admins both loaded version 1 and edit the price:
UPDATE products SET price = 140, version = version + 1 WHERE product_id = 12 AND version = 1;  -- UPDATE 1
UPDATE products SET price = 160, version = version + 1 WHERE product_id = 12 AND version = 1;  -- UPDATE 0</div>
  <p><code>UPDATE 0</code> tells the second admin "someone changed this; reload and retry". Final row: price 140, version 2.</p>
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
  <div class="flow"><span>Tune queries &amp; indexes</span><span>Bigger machine</span><span>Connection pooling</span><span>Read replicas</span><span>Partitioning</span><span>Sharding</span></div>
  <p>Go left to right: each step adds more complexity than the last.</p>
  <ul>
    <li><strong>Vertical scaling</strong>: more CPU, RAM, faster disk. Zero code changes, but there's a ceiling and one machine is still a single point of failure.</li>
    <li><strong>Connection pooling</strong> (PgBouncer): each Postgres connection is a process using several MB. A pooler lets 2,000 app clients share ~50 real connections.</li>
    <li><strong>Read replicas</strong>: copies that receive the primary's WAL and serve reads. Writes still go to one primary.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: replication lag</span>
    <p>Replicas are usually async, milliseconds to seconds behind. A user saves their profile (primary), refreshes (replica), and sees the old value. Fix: read-your-writes, i.e. route that user's reads to the primary for a few seconds after a write, or for that page.</p>
  </div>
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

  <h2 id="st-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Transaction</strong>: all-or-nothing unit; <code>BEGIN / COMMIT / ROLLBACK / SAVEPOINT</code>.</li>
    <li><strong>ACID</strong>: atomic (WAL), consistent (constraints), isolated (MVCC + locks), durable (WAL flush).</li>
    <li>After an error, Postgres ignores everything until <code>ROLLBACK</code>.</li>
    <li>Anomalies: <strong>dirty, non-repeatable, phantom, lost update, write skew</strong>.</li>
    <li>Postgres default <strong>READ COMMITTED</strong>; never dirty reads.</li>
    <li><strong>REPEATABLE READ</strong> = snapshot isolation; stops lost updates with an error, not write skew.</li>
    <li><strong>SERIALIZABLE</strong> stops everything but aborts some transactions: <strong>retry on 40001</strong>.</li>
    <li><strong>MVCC</strong>: new row versions; readers and writers don't block; VACUUM cleans up.</li>
    <li><code>FOR UPDATE</code> locks rows; <code>SKIP LOCKED</code> for queues; consistent lock order prevents deadlocks.</li>
    <li>Scale: tune → bigger box → PgBouncer → replicas (lag!) → partition → shard.</li>
  </ol></div>

  <h2 id="st-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
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
