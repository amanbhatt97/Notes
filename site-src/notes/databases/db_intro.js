// notes/databases/db_intro.js — What is a Database
Object.assign(TOPIC_CONTENT, {
  "db_intro": `<main>
  <h1>What is a Database</h1>
  <div class="where"><span>Databases</span><span>Foundations</span><span>What is a Database</span></div>
  <p class="lead">A database is the place where an application keeps its information so that many people and programs can use it at the same time, safely, quickly, and without losing anything. Every app you use, from UPI payments to food delivery to train booking, is built on one, and as a data scientist you will pull almost all of your training data out of one. To see why databases are built the way they are, this page follows <strong>Biteful</strong>, a small food-delivery start-up in Pune and Mumbai that begins by keeping its orders in one shared spreadsheet. Each time the spreadsheet fails, we will meet the part of a database that was invented to fix that failure: the DBMS, constraints, transactions, the query planner, pages and indexes, the write-ahead log, the schema, and finally the split between the app's database and the analysts' warehouse. Every query on this page was run on PostgreSQL 16 against the Biteful data, and the output shown is the real output.</p>

  <h2 id="di-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">What is a Database</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why databases exist</div>
        <ul>
          <li>A shared file loses edits when two people save (lost update)</li>
          <li>It slows down as it grows; every question is manual</li>
          <li><b>DBMS</b>: software that holds data for everyone and answers SQL</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keeping data correct</div>
        <ul>
          <li><b>Types + constraints</b>: bad rows refused on every write</li>
          <li><b>Transaction</b>: steps that succeed or fail together</li>
          <li><b>Lock</b>: a second writer of the same row waits</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside the engine</div>
        <ul>
          <li>Parser → planner → executor; <code>EXPLAIN</code> shows the plan</li>
          <li>Data lives in 8 KB <b>pages</b>; hot pages stay in RAM</li>
          <li><b>Index</b>: find a row without reading every page</li>
          <li><b>WAL</b>: log the change and flush it before saying "saved"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shapes and workloads</div>
        <ul>
          <li><b>Schema</b>: the blueprint; checked on write (SQL) or on read</li>
          <li>Structured, semi-structured, unstructured data</li>
          <li>SQL vs NoSQL; <b>OLTP</b> (app) vs <b>OLAP</b> (warehouse)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="di-sheet"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Databases Exist</span><span class="rm-sub">a shared spreadsheet, and where it breaks</span></div></div>
      <div class="rm-item rm-done" data-target="di-core"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Data, Database and DBMS</span><span class="rm-sub">tables, rows, columns and your first SQL</span></div></div>
      <div class="rm-item rm-done" data-target="di-integrity"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Types and Constraints</span><span class="rm-sub">how the database refuses bad data</span></div></div>
      <div class="rm-item rm-done" data-target="di-concurrency"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Transactions and Locks</span><span class="rm-sub">many users changing the same thing</span></div></div>
      <div class="rm-item rm-done" data-target="di-inside"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">How a Query Runs</span><span class="rm-sub">parser, planner, executor and EXPLAIN</span></div></div>
      <div class="rm-item rm-done" data-target="di-storage"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pages, the Buffer Cache and Indexes</span><span class="rm-sub">reading as little as possible</span></div></div>
      <div class="rm-item rm-done" data-target="di-wal"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Write-Ahead Log</span><span class="rm-sub">never losing a confirmed write</span></div></div>
      <div class="rm-item rm-done" data-target="di-schema"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Schema and the Shapes of Data</span><span class="rm-sub">structured, semi-structured, unstructured</span></div></div>
      <div class="rm-item rm-done" data-target="di-sqlnosql"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">SQL and NoSQL</span><span class="rm-sub">the two big families</span></div></div>
      <div class="rm-item rm-done" data-target="di-stack"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">OLTP and OLAP</span><span class="rm-sub">the app database and the warehouse</span></div></div>
      <div class="rm-item rm-done" data-target="di-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">row order, Seq Scan panic, app-only checks</span></div></div>
      <div class="rm-item rm-done" data-target="di-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, commands, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="di-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask first</span></div></div>
    </div>
  </div>

  <h2 id="di-sheet"><span class="num">01</span>Why Databases Exist</h2>
  <p>In its first month, Biteful is three people and one shared spreadsheet. Every order is one row: who ordered, from which restaurant, when, its status and the amount. For twenty orders a day this is perfect. Everyone knows how to use a spreadsheet, and anyone can scroll to find an order. Here are the first few rows:</p>
  <table class="tbl"><caption>Biteful's shared order sheet (first 5 rows)</caption>
    <tr><th>order_id</th><th>customer</th><th>city</th><th>restaurant</th><th>ordered_at</th><th>status</th><th>amount</th></tr>
    <tr><td>101</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>2026-03-02 12:10</td><td>delivered</td><td>240</td></tr>
    <tr><td>102</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td><td>2026-03-02 13:05</td><td>delivered</td><td>450</td></tr>
    <tr><td>103</td><td>Chen</td><td>Pune</td><td>Pizza Point</td><td>2026-03-02 20:30</td><td>delivered</td><td>520</td></tr>
    <tr><td>104</td><td>Asha</td><td>Pune</td><td>Pizza Point</td><td>2026-03-03 13:15</td><td>delivered</td><td>380</td></tr>
    <tr><td>105</td><td>Dia</td><td>Mumbai</td><td>Green Bowl</td><td>2026-03-03 19:45</td><td>pending</td><td>310</td></tr>
  </table>
  <p>Then Biteful grows, and the sheet starts to fail. The first failure is the most important one to understand, because it is invisible. Support agent Ravi opens the sheet to mark Dia's order 105 as cancelled. One second later, accountant Meera opens the same file to correct the amount on Asha's order 101. Opening a file means loading the whole thing into your own program's memory, so each of them now holds a private copy. Ravi saves. Then Meera saves her copy, which was loaded before Ravi's change and still says "pending". The program below plays out exactly this sequence with a real CSV file, the plain-text format spreadsheets export to:</p>
  <div class="fx" data-lang="py">import csv

def read():                                   # "open the sheet": load the whole file
    with open("orders.csv") as f:
        return list(csv.DictReader(f))

def write(rows):                              # "save": replace the whole file
    with open("orders.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

with open("orders.csv", "w") as f:            # the shared sheet (2 rows shown)
    f.write("order_id,customer,restaurant,status,amount\\n"
            "101,Asha,Dosa Hut,delivered,240\\n"
            "105,Dia,Green Bowl,pending,310\\n")

ravi = read()                      # 10:00:00  Ravi opens the file
meera = read()                     # 10:00:01  Meera opens the same file
ravi[1]["status"] = "cancelled"    # Ravi: Dia cancelled order 105
write(ravi)                        # Ravi saves
meera[0]["amount"] = "250"         # Meera: fix Asha's amount
write(meera)                       # Meera saves HER copy, made before Ravi's save
for row in read():
    print(row)</div>
  <div class="fx" data-lang="text">{'order_id': '101', 'customer': 'Asha', 'restaurant': 'Dosa Hut', 'status': 'delivered', 'amount': '250'}
{'order_id': '105', 'customer': 'Dia', 'restaurant': 'Green Bowl', 'status': 'pending', 'amount': '310'}</div>
  <p>Look at order 105 in the output: it says <code>pending</code> again. Meera's save replaced the whole file with her copy, and her copy never contained Ravi's cancellation, so it silently vanished. Nobody saw an error, and a rider may now be sent to Dia with food she cancelled. This is called a <strong>lost update</strong>: two people read the same version of some data, both change it, and the second save overwrites the first without anyone noticing. Any system that works by "load everything, edit, save everything" has this problem, and it gets worse with every extra person, because it only needs two saves to land within the same few seconds.</p>
  <p>The other failures are less subtle. When Biteful reaches a lakh orders a day, the file becomes huge, and a spreadsheet must load all of it to show any of it (Excel stops completely at 1,048,576 rows). Finding one order means scanning from the top. And every business question, such as "revenue per restaurant from delivered orders" or "which customers ordered twice this week", becomes a manual filter or pivot table redone by hand every day. Nothing stops someone typing "abc" into the amount column, nothing protects the file if the laptop dies halfway through saving, and nothing stops an intern from seeing salary data they should not see.</p>
  <p>Think of a class of forty students who all keep their marks in one Excel file passed around a WhatsApp group. Someone's edit always gets lost, the file gets slower every term, and every question to the teacher means scrolling. What the class really needs is one trusted person who holds the only copy, hands out exactly the information each student asks for, writes changes in one at a time, and refuses obviously wrong entries. A <strong>database</strong> is that trusted person, turned into software. The rest of this page shows how it solves each of the failures above, one at a time.</p>

  <h2 id="di-core"><span class="num">02</span>Data, Database and DBMS</h2>
  <p>Three words come up constantly and sound alike, so it is worth separating them carefully. <strong>Data</strong> is raw facts: "Asha ordered two Masala Dosas from Dosa Hut for ₹240". A <strong>database</strong> is an organised collection of related data, arranged so it can be found and changed quickly. A <strong>DBMS</strong> (database management system) is the software that stores the database on disk and lets many users and programs read and change it safely. PostgreSQL, MySQL, SQLite and MongoDB are DBMSs. A library is a good picture: the books are the data, the shelves and catalogue are the database, and the librarian is the DBMS. You never walk into the stacks yourself; you ask the librarian, who finds the book, stops two people taking the last copy, and keeps the records straight if the lights go out.</p>
  <p>Most databases keep data in <strong>tables</strong>. A table looks like a sheet, but with stricter rules: each <strong>row</strong> is one thing (one customer, one order), and each <strong>column</strong> is one property that every row has (name, city). In the database, Biteful's single sheet becomes four tables: <code>customers</code>, <code>restaurants</code>, <code>orders</code>, and <code>order_items</code> for the dishes inside each order. Why four tables instead of one is the subject of <a class="xref" data-note="sql_relational">Relational Model</a>; for now, here are two of them as the database returns them:</p>
  <div class="fx" data-lang="sql">SELECT * FROM customers;
SELECT * FROM orders;</div>
  <div class="fx" data-lang="text"> customer_id | name  |  city  | signup_date | referred_by 
-------------+-------+--------+-------------+-------------
           1 | Asha  | Pune   | 2026-01-05  |        NULL
           2 | Ben   | Mumbai | 2026-01-12  |           1
           3 | Chen  | Pune   | 2026-02-03  |           1
           4 | Dia   | Mumbai | 2026-02-20  |        NULL
           5 | Esha  | NULL   | 2026-03-01  |        NULL
           6 | Farah | Mumbai | 2026-03-02  |           2
           7 | Gita  | Pune   | 2026-03-04  |        NULL
(7 rows)

 order_id | customer_id | restaurant_id |        ordered_at         |  status   | amount | delivery_minutes 
----------+-------------+---------------+---------------------------+-----------+--------+------------------
      101 |           1 |            10 | 2026-03-02 12:10:00+05:30 | delivered | 240.00 |               32
      102 |           2 |            11 | 2026-03-02 13:05:00+05:30 | delivered | 450.00 |               41
      103 |           3 |            12 | 2026-03-02 20:30:00+05:30 | delivered | 520.00 |               38
      104 |           1 |            12 | 2026-03-03 13:15:00+05:30 | delivered | 380.00 |             NULL
      105 |           4 |            13 | 2026-03-03 19:45:00+05:30 | cancelled | 310.00 |             NULL
      106 |           2 |            11 | 2026-03-04 12:40:00+05:30 | delivered | 180.00 |               25
      107 |           5 |            12 | 2026-03-04 21:10:00+05:30 | cancelled | 260.00 |             NULL
      108 |           3 |            10 | 2026-03-05 18:20:00+05:30 | delivered | 260.00 |               29
      109 |           6 |            11 | 2026-03-05 20:05:00+05:30 | delivered | 600.00 |               52
      110 |           1 |            10 | 2026-03-08 20:50:00+05:30 | pending   | 310.00 |             NULL
(10 rows)</div>
  <p>A few things changed compared with the sheet. An order row no longer says "Asha, Pune"; it stores <code>customer_id = 1</code>, and Asha's name and city are written once, in <code>customers</code>. If Asha moves to Mumbai, one row changes and every order follows. Esha's city shows <code>NULL</code>, which is the database's word for "unknown or missing", not an empty string or zero. Gita (customer 7) exists even though she has no orders yet. <code>ordered_at</code> stores the time zone too (+05:30 is Indian time), and <code>referred_by</code> records which customer invited this one: Ben and Chen were referred by Asha.</p>
  <p>You talk to the DBMS in a language called <strong>SQL</strong> (Structured Query Language). A request written in SQL is called a <strong>query</strong>. Here is the simplest useful question, "which customers live in Pune?":</p>
  <div class="fx" data-lang="sql">SELECT name, city FROM customers WHERE city = 'Pune';</div>
  <div class="fx" data-lang="text"> name | city 
------+------
 Asha | Pune
 Chen | Pune
 Gita | Pune
(3 rows)</div>
  <p>The query reads almost like English: <em>select</em> these columns, <em>from</em> this table, <em>where</em> this condition is true. Notice what it does not say. It does not say "open the file, loop through the rows, compare each city". You describe <em>what</em> you want and the DBMS works out <em>how</em> to get it. This style is called <strong>declarative</strong>, and it is the opposite of the Python loop you would write over a CSV. One of the failures from section 01, "revenue per restaurant from delivered orders", becomes a single statement instead of a daily pivot table:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | revenue 
---------------+---------
            10 |  500.00
            11 | 1230.00
            12 |  900.00
(3 rows)</div>
  <p>You can check it by hand against the orders table above. Dosa Hut (restaurant 10) delivered orders 101 and 108, worth 240 + 260 = 500. Biryani Bros (11) delivered 102, 106 and 109: 450 + 180 + 600 = 1230. Pizza Point (12) delivered 103 and 104: 900. Green Bowl's only order was cancelled, so it does not appear. (<code>GROUP BY</code> and <code>SUM</code> are explained in <a class="xref" data-note="sql_fundamentals">Querying Basics</a>.)</p>
  <p>The important change is not the syntax but the arrangement. In the spreadsheet world every person held a private copy of the data. In the database world there is one copy, held by the DBMS, and people send it requests. Each request gets back only the rows it asked for, and every change goes through the DBMS, which can check it, order it against other changes, and record it safely. The lost update from section 01 cannot happen in the same way, because nobody is saving a whole stale copy over everyone else's work. The next sections show what the DBMS does with each request to keep that promise.</p>

  <h2 id="di-integrity"><span class="num">03</span>Types and Constraints</h2>
  <p>Once all of Biteful trusts a single copy of the data, a mistake in that copy hurts everyone. A spreadsheet cell accepts anything you type, so a typo, a buggy script or a confused new employee can quietly poison the numbers every report depends on. A database prevents this with two tools. Every column has a <strong>data type</strong>, which limits what it can hold: <code>amount</code> is a decimal number, <code>ordered_at</code> is a timestamp. And a table can carry <strong>constraints</strong>: rules stored with the table that the DBMS checks on every insert and update, no matter which program sends the change.</p>
  <p>When Biteful's <code>orders</code> table was created, it was given these rules: the amount must be greater than zero, the status must be one of "delivered", "cancelled" or "pending", <code>order_id</code> must be unique (it is the table's <strong>primary key</strong>, the column that identifies each row), and <code>customer_id</code> must point at a customer who actually exists (a <strong>foreign key</strong>, a column whose value must match a key in another table). Here are five bad rows sent to the database, one after another:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 1, 10, now(), 'delivered', 'abc', 30);
INSERT INTO orders VALUES (111, 1, 10, now(), 'delivered', -5, 30);
INSERT INTO orders VALUES (101, 1, 10, now(), 'delivered', 240, 30);
INSERT INTO orders VALUES (111, 99, 10, now(), 'delivered', 240, 30);
INSERT INTO orders VALUES (111, 1, 10, now(), 'delivred', 240, 30);</div>
  <div class="fx" data-lang="text">ERROR:  invalid input syntax for type numeric: "abc"
LINE 1: ...TO orders VALUES (111, 1, 10, now(), 'delivered', 'abc', 30)...
                                                             ^
ERROR:  new row for relation "orders" violates check constraint "orders_amount_check"
DETAIL:  Failing row contains (111, 1, 10, 2026-11-04 10:41:57.983558+05:30, delivered, -5.00, 30).
ERROR:  duplicate key value violates unique constraint "orders_pkey"
DETAIL:  Key (order_id)=(101) already exists.
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".
ERROR:  new row for relation "orders" violates check constraint "orders_status_check"
DETAIL:  Failing row contains (111, 1, 10, 2026-11-04 10:41:57.985145+05:30, delivred, 240.00, 30).</div>
  <p>All five were refused, each with a precise reason. The first is a type error: "abc" is not a number, and PostgreSQL even points at the offending value. The second breaks the <code>CHECK</code> constraint <code>amount &gt; 0</code>. The third reuses order id 101, which violates the primary key. The fourth names customer 99, who does not exist, so the foreign key refuses it. The fifth misspells "delivered", and the status check catches it. A spreadsheet would have accepted all five, and you would have found out weeks later when a report looked strange.</p>
  <p>Think of an invigilator at the exam hall door who checks every answer sheet for a roll number before accepting it, rather than letting the teacher discover missing roll numbers after results are published. The database checks at the door. Data that obeys its rules is said to have <strong>integrity</strong>, and constraints are how a database guarantees it.</p>
  <p>Why not just check inputs in the app? Because the app is only one of the doors into the database. A one-off Python script, a data engineer's manual fix and a second service written by another team all skip the app's checks. Only rules stored in the database itself guard every door. The full set of constraints (NOT NULL, UNIQUE, CHECK, PRIMARY KEY, FOREIGN KEY, DEFAULT) is covered in <a class="xref" data-note="sql_relational">Relational Model</a>. Constraints judge one row at a time, though. They cannot help when two perfectly valid changes collide, which is the problem the next section solves.</p>

  <h2 id="di-concurrency"><span class="num">04</span>Transactions and Locks</h2>
  <p>Biteful runs a promotion with exactly one "free dessert" coupon left. Two customers, A and B, tap "Apply" at almost the same instant. Each request is a valid change on its own; the trouble is the timing. Here is the obvious way to write the coupon logic: read how many coupons are left, decide in Python, then write the new count. Two threads play the two customers, each on its own database connection:</p>
  <div class="fx" data-lang="py">import threading, time
import psycopg2

# DSN = connection string for the Biteful database
setup = psycopg2.connect(DSN); setup.autocommit = True
cur = setup.cursor()
cur.execute("CREATE TABLE coupons (code TEXT PRIMARY KEY, left_count INT)")
cur.execute("INSERT INTO coupons VALUES ('FREEDESSERT', 1)")

winners = []

def fan(who):
    conn = psycopg2.connect(DSN)              # each fan is a separate connection
    c = conn.cursor()
    c.execute("SELECT left_count FROM coupons WHERE code = 'FREEDESSERT'")
    left = c.fetchone()[0]
    print(f"{who} sees {left} left")
    time.sleep(0.2)                           # app thinks for a moment...
    if left &gt; 0:                              # ...and decides in Python
        c.execute("UPDATE coupons SET left_count = %s WHERE code = 'FREEDESSERT'", (left - 1,))
        conn.commit()
        winners.append(who)
        print(f"{who} got the coupon")
    conn.close()

threads = [threading.Thread(target=fan, args=(w,)) for w in ("A", "B")]
for t in threads: t.start()
for t in threads: t.join()
cur.execute("SELECT left_count FROM coupons")
print("coupons left:", cur.fetchone()[0], "| desserts given:", len(winners))</div>
  <div class="fx" data-lang="text">A sees 1 left
B sees 1 left
A got the coupon
B got the coupon
coupons left: 0 | desserts given: 2</div>
  <p>Both customers got a dessert from a single coupon. Both read "1 left" before either had written anything, both decided "yes", and both wrote <code>left_count = 0</code>. This is the lost update from section 01 again, now inside a database. The data ended up valid (0 coupons left, no constraint broken), but the business lost a dessert. The problem is that "read, decide, write" was three separate steps, and another customer's steps were allowed to slip in between them.</p>
  <p>The fix uses two ideas. A <strong>transaction</strong> is a group of database steps that the DBMS treats as one unit: either all of them take effect or none of them do. It starts with <code>BEGIN</code> and ends with <code>COMMIT</code> (make it permanent) or <code>ROLLBACK</code> (undo all of it). And while a transaction changes a row, it holds a <strong>lock</strong> on that row: any other transaction that wants to change the same row must wait until the first one commits or rolls back. Think of the single bathroom key at a petrol pump. Whoever holds the key goes in; the next person waits at the door until the key comes back. Nobody walks in on anybody.</p>
  <p>In the corrected version, the check and the change happen in one statement: "subtract one, but only if more than zero are left". To make the waiting visible, A deliberately keeps its transaction open for one second before committing, and B starts 0.2 seconds after A:</p>
  <div class="fx" data-lang="py">import threading, time
import psycopg2

# DSN = connection string for the Biteful database
setup = psycopg2.connect(DSN); setup.autocommit = True
cur = setup.cursor()
cur.execute("CREATE TABLE coupons (code TEXT PRIMARY KEY, left_count INT CHECK (left_count &gt;= 0))")
cur.execute("INSERT INTO coupons VALUES ('FREEDESSERT', 1)")

log = []
def say(who, msg):
    log.append(f"t={time.monotonic() - t0:.1f}s  {who}: {msg}")

def fan(who, start_after, hold_for):
    time.sleep(start_after)
    conn = psycopg2.connect(DSN)             # psycopg2 opens a transaction automatically
    c = conn.cursor()
    say(who, "BEGIN, try to take the coupon")
    c.execute("UPDATE coupons SET left_count = left_count - 1 "
              "WHERE code = 'FREEDESSERT' AND left_count &gt; 0")
    say(who, f"rows updated = {c.rowcount}")
    time.sleep(hold_for)                     # still inside the transaction
    conn.commit()
    say(who, "COMMIT")
    conn.close()

t0 = time.monotonic()
a = threading.Thread(target=fan, args=("A", 0.0, 1.0))
b = threading.Thread(target=fan, args=("B", 0.2, 0.0))
a.start(); b.start(); a.join(); b.join()
print("\\n".join(log))
cur.execute("SELECT left_count FROM coupons")
print("coupons left:", cur.fetchone()[0])</div>
  <div class="fx" data-lang="text">t=0.0s  A: BEGIN, try to take the coupon
t=0.0s  A: rows updated = 1
t=0.2s  B: BEGIN, try to take the coupon
t=1.0s  A: COMMIT
t=1.0s  B: rows updated = 0
t=1.0s  B: COMMIT
coupons left: 0</div>
  <p>Follow the timeline. At 0.0 s, A's UPDATE finds one coupon, takes it (1 row updated) and now holds the lock on that row. At 0.2 s, B sends the same UPDATE, but B's "rows updated" line does not appear until the same moment as A's COMMIT, about a second later: B spent that whole time waiting for A's lock. When A commits, B's statement re-checks the row, finds <code>left_count = 0</code>, the condition <code>left_count &gt; 0</code> is false, and B updates 0 rows. One coupon, one winner, and B's app can show a clean "sorry, all gone". (Exact timings vary slightly between runs; the order of events does not.) IRCTC's Tatkal booking at 10 AM is the same problem at scale: thousands of people, a few berths, and no berth may be sold twice.</p>
  <p>The DBMS makes four promises about transactions, known by the initials <strong>ACID</strong>: <strong>atomicity</strong> (all or nothing), <strong>consistency</strong> (every commit leaves the data obeying its rules), <strong>isolation</strong> (transactions running at the same time do not see each other's half-finished work) and <strong>durability</strong> (once committed, a change survives a crash). We just saw isolation at work. Atomicity is demonstrated with a refund in <a class="xref" data-note="db_types">Types of Databases</a>, durability is section 07 of this page, and the different levels of isolation are covered in <a class="xref" data-note="sql_transactions">Transactions</a>. The practical lesson for now: never read a value, decide in your application, and write it back as separate steps. Put the condition inside the statement, as above, or lock the row when you read it with <code>SELECT … FOR UPDATE</code>.</p>

  <h2 id="di-inside"><span class="num">05</span>How a Query Runs</h2>
  <p>So far we have sent the DBMS lines of text and received correct rows. Between the two, three parts of the DBMS do the work, each solving one problem. The first problem is that the text might be nonsense: misspelled, or naming a column that does not exist. The <strong>parser</strong> deals with this. It checks the grammar first, then looks up every table and column name in the database's own catalogue of what exists:</p>
  <div class="fx" data-lang="sql">SELEC name FROM customers;
SELECT nam FROM customers;</div>
  <div class="fx" data-lang="text">ERROR:  syntax error at or near "SELEC"
LINE 1: SELEC name FROM customers;
        ^
ERROR:  column "nam" does not exist
LINE 1: SELECT nam FROM customers;
               ^
HINT:  Perhaps you meant to reference the column "customers.name".</div>
  <p>The first statement fails the grammar check: there is no SQL word "SELEC". The second is grammatically fine, but <code>customers</code> has no column called <code>nam</code>, and PostgreSQL even suggests the column you probably meant. In both cases no data was read at all; the request was rejected before any work started.</p>
  <p>The second problem is that a valid query can be answered in many ways. "Pune customers" could be answered by reading every row and keeping the Pune ones, or by using an index if one exists; a query joining several tables could join them in many different orders. Some ways are thousands of times faster than others. The <strong>planner</strong> (also called the <strong>optimizer</strong>) estimates the cost of the possible ways and picks the cheapest one, called the <strong>plan</strong>. You can see the plan by putting <code>EXPLAIN</code> in front of a query:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT name FROM customers WHERE city = 'Pune';</div>
  <div class="fx" data-lang="text">                       QUERY PLAN                        
---------------------------------------------------------
 Seq Scan on customers  (cost=0.00..1.09 rows=3 width=4)
   Filter: (city = 'Pune'::text)
(2 rows)</div>
  <p><strong>Seq Scan</strong> (sequential scan) means "read every row of the table, one after another, and keep those that pass the filter", and the filter line shows the condition being tested. The numbers in brackets are the planner's estimates, not measurements: <code>cost=0.00..1.09</code> is an internal unit of work (the cost to produce the first row, then all rows), <code>rows=3</code> is how many rows it expects to match (correct here: Asha, Chen and Gita), and <code>width=4</code> is the expected size of each returned row in bytes. With only seven customers, reading them all is the cheapest possible plan. The planner bases its guesses on <strong>statistics</strong> it keeps about each table (row counts, common values), refreshed by the command <code>ANALYZE</code>; stale statistics are a classic cause of bad plans.</p>
  <p>The third part, the <strong>executor</strong>, follows the chosen plan step by step, fetches the data and passes the rows back to you. The picture shows the whole path, including where the executor gets its data from, which is the subject of the next section:</p>
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
      <line x1="522" y1="82" x2="522" y2="138"/><line x1="418" y1="168" x2="292" y2="168"/>
    </g>
    <rect x="420" y="140" width="165" height="56" rx="8" class="fg sg"/>
    <text x="502" y="163" text-anchor="middle" font-weight="bold">Buffer cache</text><text x="502" y="182" text-anchor="middle" font-size="10" class="tm">hot pages in RAM</text>
    <rect x="40" y="140" width="250" height="56" rx="8" class="fs"/>
    <text x="165" y="160" text-anchor="middle" font-weight="bold">Disk</text>
    <g class="fb"><rect x="70" y="170" width="30" height="16" rx="2"/><rect x="106" y="170" width="30" height="16" rx="2"/><rect x="142" y="170" width="30" height="16" rx="2"/><rect x="178" y="170" width="30" height="16" rx="2"/><rect x="214" y="170" width="30" height="16" rx="2"/></g>
    <text x="354" y="160" text-anchor="middle" font-size="10" class="tm">cache miss</text>
    <text x="165" y="218" text-anchor="middle" font-size="10" class="tm">8 KB pages: read whole, never one row</text>
    <text x="502" y="218" text-anchor="middle" font-size="10" class="tm">far faster than disk</text>
  </svg><figcaption>The parser checks the request, the planner picks a plan, and the executor runs it. The executor asks the buffer cache for pages; only on a cache miss does it go to disk.</figcaption></figure>
  <p>Read the figure left to right along the top: the query text goes through the parser, then the planner, then the executor. Then follow the arrow down: the executor asks the buffer cache in memory for the data it needs, and only if the data is not there (a "cache miss") does it go to the much slower disk. A restaurant works the same way. You place an order (the query); the waiter checks the dish is on the menu (parser); the chef decides which pans to use and in what order (planner); the kitchen staff cook it (executor); ingredients on the counter (cache) are quick to reach, while the store room (disk) is slow.</p>
  <p>This division of labour is the real benefit of SQL being declarative. Because you only describe the result, the planner is free to choose a better method when the data grows or an index is added, and the same query becomes faster without you rewriting it. The flip side is that the order in which you write SQL clauses is not the order in which the database does the work, so you should never assume how it will read the data. When a query is slow, read its plan with <code>EXPLAIN</code> before guessing; <code>EXPLAIN ANALYZE</code> goes further and actually runs the query, reporting what really happened. Plans are covered in depth in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.</p>

  <h2 id="di-storage"><span class="num">06</span>Pages, the Buffer Cache and Indexes</h2>
  <p>Every plan ends with the executor reading data, and where that data comes from matters enormously: fetching from disk is roughly a thousand times slower than fetching from memory. So the whole storage design of a database is about reading as little from disk as possible. The first fact to know is that disks and operating systems do not hand out single rows; they read and write fixed-size blocks. PostgreSQL therefore stores every table as a sequence of <strong>pages</strong>, each exactly 8 KB (8,192 bytes), and it always reads a whole page at a time. Fetching one row costs about the same as fetching all the rows that share its page. How big is Biteful's <code>orders</code> table, and where do its rows live?</p>
  <div class="fx" data-lang="sql">SELECT pg_relation_size('orders')        AS bytes,
       pg_relation_size('orders') / 8192 AS pages,
       current_setting('block_size')     AS page_size;
SELECT ctid, order_id, amount FROM orders WHERE order_id IN (101, 102, 110);</div>
  <div class="fx" data-lang="text"> bytes | pages | page_size 
-------+-------+-----------
  8192 |     1 | 8192
(1 row)

  ctid  | order_id | amount 
--------+----------+--------
 (0,1)  |      101 | 240.00
 (0,2)  |      102 | 450.00
 (0,10) |      110 | 310.00
(3 rows)</div>
  <p>The whole table is 8,192 bytes, which is one page. The second query shows a hidden column every PostgreSQL row has, <code>ctid</code>, which is the row's physical address written as (page number, slot within the page). Orders 101, 102 and 110 are in page 0, slots 1, 2 and 10: the entire table lives in page 0.</p>
  <p>The second idea is that the same pages are needed again and again. Today's orders, popular restaurants and the customers table are read thousands of times a minute. So the DBMS keeps recently used pages in RAM, in an area called the <strong>buffer cache</strong>, and checks there before touching the disk. <code>EXPLAIN (ANALYZE, BUFFERS)</code> runs a query and counts the pages it used: <code>shared hit</code> means the page was found in the cache, <code>read</code> means it had to be fetched from disk.</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM orders WHERE status = 'pending';</div>
  <div class="fx" data-lang="text">                 QUERY PLAN                 
--------------------------------------------
 Seq Scan on orders (actual rows=1 loops=1)
   Filter: (status = 'pending'::text)
   Rows Removed by Filter: 9
   Buffers: shared hit=1
 Planning:
   Buffers: shared hit=77
(6 rows)</div>
  <p>The scan used exactly one page of table data (<code>Buffers: shared hit=1</code>), found in memory, and threw away 9 of the 10 rows because only one order is pending. The separate "Planning" line counts pages the planner itself read from the system catalogue to understand the query; ignore it for now. On a one-page table, nothing could be cheaper than this. But Biteful will not stay at ten orders.</p>
  <p>To see what happens at scale, the next block builds a copy of the table with 200,000 synthetic orders using <code>generate_series</code> (a function that produces the numbers 1, 2, 3 … up to a limit), then looks up one order by id, first without and then with an index:</p>
  <div class="fx" data-lang="sql">-- 200,000 synthetic orders, same columns as orders
CREATE TABLE big_orders AS
SELECT g AS order_id, 1 + g % 7 AS customer_id, 10 + g % 5 AS restaurant_id,
       now() - g * interval '1 minute' AS ordered_at, 'delivered' AS status,
       100 + g % 500 AS amount, 20 + g % 40 AS delivery_minutes
FROM generate_series(1, 200000) AS g;
ANALYZE big_orders;
SELECT pg_relation_size('big_orders') / 8192 AS pages;

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM big_orders WHERE order_id = 177777;

CREATE INDEX big_orders_id_idx ON big_orders (order_id);

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM big_orders WHERE order_id = 177777;</div>
  <div class="fx" data-lang="text">SELECT 200000
ANALYZE
 pages 
-------
  1920
(1 row)

                   QUERY PLAN                   
------------------------------------------------
 Seq Scan on big_orders (actual rows=1 loops=1)
   Filter: (order_id = 177777)
   Rows Removed by Filter: 199999
   Buffers: shared hit=1920
 Planning:
   Buffers: shared hit=28
(6 rows)

CREATE INDEX
                                QUERY PLAN                                
--------------------------------------------------------------------------
 Index Scan using big_orders_id_idx on big_orders (actual rows=1 loops=1)
   Index Cond: (order_id = 177777)
   Buffers: shared hit=1 read=3
 Planning:
   Buffers: shared hit=17 read=1
(5 rows)</div>
  <p>The table now fills 1,920 pages. Without an index, the plan is a Seq Scan: it touched all 1,920 pages (<code>shared hit=1920</code>) and threw away 199,999 rows to find the one we wanted. After <code>CREATE INDEX</code>, the plan becomes an <strong>Index Scan</strong> that touched only 4 pages (<code>hit=1 read=3</code>; three of them came from disk because the index was brand new and not yet cached). That is the difference between reading the whole table and reading a few pages, and on a real table of a hundred million rows it is the difference between minutes and milliseconds.</p>
  <p>An <strong>index</strong> is a separate, sorted data structure that maps a column's values to the addresses of the rows that hold them. PostgreSQL's default kind is a <strong>B-tree</strong>, a shallow tree of sorted pages: the top page says which page below covers which range of ids, and after three or four steps you reach the row's address. It works exactly like the index at the back of a textbook: instead of reading all 500 pages to find "photosynthesis", you look it up and jump straight to page 212. Biteful's real <code>orders</code> table already has one, created automatically for its primary key.</p>
  <p>Indexes are not free. Each one takes disk space, and every insert, update and delete must update every index on the table as well as the table itself, so a table with ten indexes makes writes noticeably slower. And an index does not help when the table is tiny or when the query wants most of the rows anyway, because then reading everything in order is cheaper than jumping around. Choosing which indexes to build is a core skill covered in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.</p>

  <h2 id="di-wal"><span class="num">07</span>The Write-Ahead Log</h2>
  <p>Pages are changed in memory, in the buffer cache, and written back to their place on disk later. That raises a frightening question. When the app tells a customer "order placed", has the order actually reached the disk? If the power fails a second later, is it lost? Writing every changed 8 KB page to its home on disk before answering would be slow, because those pages are scattered all over the disk; worse, a power cut in the middle of writing a page could leave it half old and half new, which is corruption.</p>
  <p>The solution is to write a small description of the change somewhere fast and safe first, and update the table pages later. That somewhere is the <strong>write-ahead log</strong>, or <strong>WAL</strong>: an append-only file to which the DBMS adds a short record for every change. Appending a few hundred bytes to the end of one file is very fast, because the disk does not have to jump around. The rule that gives the log its name is that the log record must be safely on disk <em>before</em> the change is considered committed, and before the changed table page itself is written. This program measures how much log one new Biteful order produces:</p>
  <div class="fx" data-lang="py">import psycopg2

# DSN = connection string for the Biteful database
conn = psycopg2.connect(DSN); conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT pg_current_wal_lsn()"); before = cur.fetchone()[0]
cur.execute("INSERT INTO orders VALUES (111, 7, 14, now(), 'pending', 200, NULL)")
cur.execute("SELECT pg_current_wal_lsn()"); after = cur.fetchone()[0]
cur.execute("SELECT pg_wal_lsn_diff(%s, %s)", (after, before))
print("WAL position before:", before)
print("WAL position after :", after)
print("log bytes for one INSERT:", cur.fetchone()[0])
cur.execute("SHOW synchronous_commit")
print("synchronous_commit =", cur.fetchone()[0])</div>
  <div class="fx" data-lang="text">WAL position before: 1/A1DCB88
WAL position after : 1/A1DCD18
log bytes for one INSERT: 400
synchronous_commit = on</div>
  <p><code>pg_current_wal_lsn()</code> returns the current end of the log as an <strong>LSN</strong> (log sequence number), which is simply a byte position written in hexadecimal. Subtracting the position before the INSERT from the position after gives the size of everything logged for it: the new row, its entry in the primary-key index, and the commit record, a few hundred bytes in total (the exact number varies a little from run to run). <code>synchronous_commit = on</code> is the default setting that makes every commit wait until its log records are flushed to disk.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="di-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="25" width="120" height="50" rx="8" class="fs"/>
    <text x="70" y="46" text-anchor="middle" font-weight="bold">1. INSERT</text><text x="70" y="63" text-anchor="middle" font-size="10" class="tm">order 111 arrives</text>
    <rect x="170" y="25" width="150" height="50" rx="8" class="fv"/>
    <text x="245" y="46" text-anchor="middle" font-weight="bold">2. WAL</text><text x="245" y="63" text-anchor="middle" font-size="10" class="tm">append + flush</text>
    <rect x="360" y="25" width="110" height="50" rx="8" class="fg sg"/>
    <text x="415" y="46" text-anchor="middle" font-weight="bold">3. COMMIT</text><text x="415" y="63" text-anchor="middle" font-size="10" class="tm">"order placed"</text>
    <rect x="360" y="105" width="225" height="44" rx="8" class="ft"/>
    <text x="472" y="124" text-anchor="middle" font-weight="bold">4. Table pages</text><text x="472" y="140" text-anchor="middle" font-size="10" class="tm">written later, in batches</text>
    <g stroke="currentColor" marker-end="url(#di-ar2)">
      <line x1="130" y1="50" x2="168" y2="50"/><line x1="320" y1="50" x2="358" y2="50"/>
      <path d="M245,75 L245,127 L358,127" fill="none" stroke-dasharray="4 3"/>
    </g>
    <text x="20" y="115" font-size="11" class="tr">⚡ crash?</text>
    <text x="20" y="133" font-size="10" class="tm">replay WAL: redo committed,</text>
    <text x="20" y="148" font-size="10" class="tm">drop uncommitted</text>
  </svg><figcaption>The commit is confirmed once the log is on disk; the table pages catch up later. After a crash, the log is replayed.</figcaption></figure>
  <p>Read the figure by its numbers. The INSERT arrives (1); its log record is appended and flushed (2); only then is the commit confirmed and the customer told "order placed" (3); the actual table page is written to disk later, together with many other changes (4). If the server crashes after step 3, the change is safe in the log. When PostgreSQL restarts, it performs <strong>recovery</strong>: it reads the log from the last known good point and replays every committed change onto the table pages. A transaction that never reached its commit record is not replayed, so half-finished work simply disappears. That is how the D in ACID, durability, is actually achieved.</p>
  <p>A shopkeeper who writes every sale in a receipt book before moving any stock works the same way: if the shelves collapse, the book says exactly what they should hold. The log turns out to be useful for more than crashes. Because it is a complete, ordered record of every change, it is also what copies of the database (replicas) and data pipelines read to stay in sync, which we will meet in section 10. One warning: settings such as <code>synchronous_commit = off</code> or <code>fsync = off</code> make writes faster by not waiting for the log to reach disk. The first can lose the last fraction of a second of "committed" orders in a crash; the second can corrupt the whole database. Know exactly which one you changed and why.</p>

  <h2 id="di-schema"><span class="num">08</span>Schema and the Shapes of Data</h2>
  <p>Every safeguard so far relied on the database knowing each table's exact columns and types in advance: the type check needed to know <code>amount</code> is numeric, and the parser needed to know <code>nam</code> is not a column. That description has a name. A <strong>schema</strong> is the formal blueprint of the data: which tables exist, their columns, the type of each column, and the rules (keys and constraints). Think of an exam answer sheet with printed boxes for Roll No, Name and Subject Code: every student fills the same boxes, which is exactly what makes checking a thousand sheets easy. The database stores its own schema, and you can query it like any other table:</p>
  <div class="fx" data-lang="sql">SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;</div>
  <div class="fx" data-lang="text">   column_name    |        data_type         | is_nullable 
------------------+--------------------------+-------------
 order_id         | integer                  | NO
 customer_id      | integer                  | NO
 restaurant_id    | integer                  | NO
 ordered_at       | timestamp with time zone | NO
 status           | text                     | NO
 amount           | numeric                  | NO
 delivery_minutes | integer                  | YES
(7 rows)</div>
  <p>This is the blueprint that the parser checked names against in section 05 and that the integrity checks in section 03 enforced. <code>amount</code> is numeric and may not be NULL; <code>delivery_minutes</code> may be NULL, because an order that has not been delivered yet has no delivery time. Changing a schema later, for example adding a column, is done with a <strong>migration</strong>, a script that alters the tables in a controlled way.</p>
  <p>Not all data fits printed boxes, though. Data comes in roughly three shapes. <strong>Structured</strong> data has fixed columns and every record has the same shape: Biteful's orders, payments and customers. <strong>Semi-structured</strong> data has named fields, but the fields vary from record to record and can be nested inside each other: a Dosa Hut menu item has a spice level and a list of chutneys, while a Pizza Point item has sizes and crusts. It is usually stored as <strong>JSON</strong>, the text format with named fields in curly braces that web apps already use. <strong>Unstructured</strong> data has no fields at all: dish photos, recordings of support calls, free-text reviews. Photos and audio are kept in object storage such as Amazon S3, and for search, models turn them into lists of numbers called embeddings, which live in vector databases.</p>
  <p>There are two moments at which a shape can be enforced. <strong>Schema-on-write</strong> means the database checks every record against the schema as it is stored and refuses anything that does not fit; that is what PostgreSQL did with the five bad orders. <strong>Schema-on-read</strong> means raw records are stored as they come, and whoever reads them applies a structure and copes with missing or oddly named fields. The first gives clean, trustworthy data at the cost of planning ahead and running migrations; the second is flexible and quick to start, at the cost of every reader having to handle messy data. Schema-on-write is the invigilator rejecting a sheet without a roll number at the door; schema-on-read is collecting every sheet as it is and letting the teacher sort out the missing roll numbers later.</p>
  <p>This is why the popular phrase "NoSQL databases are schemaless" is misleading. The app still expects every menu item to have a name and a price; the schema still exists, it has simply moved out of the database and into application code, where nothing enforces it consistently. Different data shapes do, however, pull towards different kinds of database, which is the next topic.</p>

  <h2 id="di-sqlnosql"><span class="num">09</span>SQL and NoSQL</h2>
  <p>Databases fall into two broad families. <strong>SQL</strong> or <strong>relational</strong> databases store data in tables with a fixed schema, link tables through keys (like <code>orders.customer_id</code> pointing at <code>customers</code>), and combine them at query time with an operation called a <strong>JOIN</strong>. Everything we have done so far is relational. <strong>NoSQL</strong>, which is usually read as "not only SQL", is an umbrella for every other model: document databases that store one JSON document per record, key-value stores that work like a giant dictionary, wide-column stores built to spread enormous write volumes across many machines, and graph databases built to follow relationships. Each was designed for a data shape or a scale that tables handle badly.</p>
  <p>Two terms help explain the difference in how they grow. <strong>Scaling vertically</strong> (scaling up) means moving to a bigger machine with more CPU, memory and disk. <strong>Scaling horizontally</strong> (scaling out) means adding more machines and splitting the data between them. Traditional relational databases are easiest to scale vertically, plus extra read-only copies; many NoSQL systems were built from the start to scale horizontally, usually by giving up something such as joins or strict transactions.</p>
  <table class="tbl">
    <tr><th></th><th>SQL / relational</th><th>NoSQL</th></tr>
    <tr><td>Data model</td><td>Tables of rows, linked by keys</td><td>Documents, key-value pairs, wide columns, graphs</td></tr>
    <tr><td>Schema</td><td>Fixed, enforced on write</td><td>Flexible, usually interpreted on read</td></tr>
    <tr><td>Relationships</td><td>JOINs at query time</td><td>Usually embedded or duplicated inside records</td></tr>
    <tr><td>Guarantees</td><td>Strong ACID transactions</td><td>Varies; often relaxed for speed and availability</td></tr>
    <tr><td>Scaling</td><td>Mostly vertical, plus read replicas</td><td>Built to scale horizontally</td></tr>
    <tr><td>Biteful example</td><td>Orders, customers, restaurants, payments</td><td>Menus (document), carts (key-value), rider GPS pings (wide-column)</td></tr>
    <tr><td>Products</td><td>PostgreSQL, MySQL, SQLite, SQL Server</td><td>MongoDB, Redis, Cassandra, Neo4j</td></tr>
  </table>
  <p>A school office makes the contrast concrete. A relational database is a set of registers (students, fees, exam results) that never repeat a student's details and instead cross-reference each other by roll number; any question that combines registers can be answered. A document database is one thick folder per student with everything stuffed inside: grabbing one student's whole record is instant, but "how many students across all classes took Hindi?" means opening every folder.</p>
  <p>The sensible default, and the answer most interviewers want to hear, is to start with a relational database such as PostgreSQL and move a specific workload to a NoSQL system only when you can name the reason: write volume beyond one machine, a genuinely variable shape, sub-millisecond lookups by key, or deep relationship traversal. "NoSQL is faster" means nothing without "faster at what": a key-value store fetches one cart by its key far faster than PostgreSQL, and cannot express "revenue per restaurant" at all. Each family is examined on Biteful's own data in <a class="xref" data-note="db_types">Types of Databases</a>.</p>

  <h2 id="di-stack"><span class="num">10</span>OLTP and OLAP</h2>
  <p>Even if Biteful keeps everything relational, two groups use the data in opposite ways. The app places one order at a time, thousands of times a minute, and every request must finish in milliseconds. This kind of work is called <strong>OLTP</strong> (online transaction processing): many small reads and writes, each touching a handful of rows. Placing an order looks like this:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 7, 14, now(), 'pending', 200, NULL)
RETURNING order_id, customer_id, status, amount;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | status  | amount 
----------+-------------+---------+--------
      111 |           7 | pending | 200.00
(1 row)

INSERT 0 1</div>
  <p>One row inserted, one page touched, a few milliseconds of work. (<code>RETURNING</code> asks the INSERT to hand back the row it just created, so the app can show the order number.) The analysts' work is the opposite. It is called <strong>OLAP</strong> (online analytical processing): a few large queries that scan and aggregate a lot of history. "Revenue per restaurant per day" is typical:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, restaurant_id,
       COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY 1, 2
ORDER BY 1, 2;</div>
  <div class="fx" data-lang="text">    day     | restaurant_id | orders | revenue 
------------+---------------+--------+---------
 2026-03-02 |            10 |      1 |  240.00
 2026-03-02 |            11 |      1 |  450.00
 2026-03-02 |            12 |      1 |  520.00
 2026-03-03 |            12 |      1 |  380.00
 2026-03-04 |            11 |      1 |  180.00
 2026-03-05 |            10 |      1 |  260.00
 2026-03-05 |            11 |      1 |  600.00
(7 rows)</div>
  <p>On ten orders this is instant. On two years of a real company it reads hundreds of millions of rows, and while it runs it competes with the app for CPU, memory and disk, so customers placing orders feel the slowdown. The two workloads also want different physical layouts: OLTP wants all of a row's values stored together (a <strong>row store</strong>), so one order can be fetched or updated with one page read, while OLAP wants each column's values stored together (a <strong>column store</strong>), so summing <code>amount</code> reads only the amount column. Why the layout matters so much is explained in <a class="xref" data-note="db_types">Types of Databases</a>.</p>
  <p>So real companies keep the app's database for OLTP and copy its data into a separate system built for analysis, a <strong>data warehouse</strong>:</p>
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
    <rect x="150" y="145" width="130" height="40" rx="8" class="ft"/><text x="215" y="170" text-anchor="middle">Search index</text>
    <rect x="300" y="145" width="120" height="40" rx="8" class="ft"/><text x="360" y="170" text-anchor="middle">Vector DB</text>
    <rect x="440" y="145" width="145" height="40" rx="8" class="ft"/><text x="512" y="170" text-anchor="middle">Feature store</text>
  </svg><figcaption>The app database is the source of truth. Everything else is a copy shaped for one job.</figcaption></figure>
  <p>Read the top row from left to right. Orders are written to the app database. A copy process moves them onward: <strong>ETL</strong> (extract, transform, load) copies data in batches, often nightly, while <strong>CDC</strong> (change data capture) streams every change within seconds by reading the write-ahead log from section 07. The warehouse (BigQuery, Snowflake, Redshift, ClickHouse) stores the data in columns and spreads big scans across many machines, and dashboards and ML training jobs read from there. The bottom row shows other specialised copies fed the same way: a cache, a search index, a vector database, a feature store for models. The app database remains the <strong>source of truth</strong>, the one copy that is always right.</p>
  <p>Think of a supermarket. The billing counters handle many small, quick bills all day; that is OLTP. Head office adds up every bill of the year; that is OLAP. If head office did its adding at the billing counter, the queue would stop. As a data scientist you will mostly work in the warehouse, and two habits follow: do not run heavy analytical queries against the production app database, and always check how fresh the warehouse is, because it may lag the app by minutes or by a day.</p>

  <h2 id="di-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common beginner assumption is that a table has a natural order, so a query without <code>ORDER BY</code> returns rows in the order they were inserted. A table is a set of rows, and the database returns them in whatever order is cheapest at that moment. Here the first query happens to return 101, 102, 103; then one harmless UPDATE changes order 101, and the same query returns something different:</p>
  <div class="fx" data-lang="sql">SELECT order_id FROM orders LIMIT 3;
UPDATE orders SET delivery_minutes = 33 WHERE order_id = 101;
SELECT order_id FROM orders LIMIT 3;
SELECT order_id FROM orders ORDER BY order_id LIMIT 3;</div>
  <div class="fx" data-lang="text"> order_id 
----------
      101
      102
      103
(3 rows)

UPDATE 1
 order_id 
----------
      102
      103
      104
(3 rows)

 order_id 
----------
      101
      102
      103
(3 rows)</div>
  <p>PostgreSQL never overwrites a row in place: an UPDATE writes a new version of the row in free space at the end of the page, so after the update, order 101 is physically last and a plain scan reaches it last. Your code did not change, but its result did. Whenever order matters, including for "the first three" with <code>LIMIT</code>, say so with <code>ORDER BY</code>, as the last query does.</p>
  <p>A second mistake is panicking at "Seq Scan" in a plan. Beginners learn that indexes are fast and assume a sequential scan is always a problem. But look at a lookup by primary key on Biteful's real <code>orders</code> table, which has an index on <code>order_id</code>:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT * FROM orders WHERE order_id = 104;</div>
  <div class="fx" data-lang="text">                      QUERY PLAN                       
-------------------------------------------------------
 Seq Scan on orders  (cost=0.00..1.12 rows=1 width=38)
   Filter: (order_id = 104)
(2 rows)</div>
  <p>The planner had an index available and chose not to use it, correctly: the whole table is one page, so reading that page is cheaper than reading an index page and then the table page. A Seq Scan is a problem only on a large table when you want a few rows, as in the 200,000-row example in section 06; it is also the right choice when a query wants most of a table's rows.</p>
  <p>The remaining classic mistakes were each demonstrated earlier on this page, so a sentence each is enough. Validating data only in the application leaves every other door open (section 03); put rules in the database as constraints. "Read, decide in Python, write" recreates the coupon race even inside a database (section 04); put the condition in the UPDATE or lock the row with <code>SELECT … FOR UPDATE</code>. Testing concurrency with one user proves nothing, because races need two writers at the same moment. Turning off log flushing for speed trades away durability (section 07). Running heavy analytics on the production database slows the live app (section 10). And calling PostgreSQL "a database" is fine in conversation, but precisely it is a DBMS that manages many databases.</p>

  <h2 id="di-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why databases exist</h3>
  <ul>
    <li>A shared file is loaded whole, edited and saved whole, so two editors cause a <b>lost update</b>: the second save silently overwrites the first.</li>
    <li>Files also slow down with size, accept any value, need manual work for every question and are not crash-safe.</li>
    <li>A <b>DBMS</b> holds the single copy of the data and serves requests, so nobody saves a stale copy over others.</li>
  </ul>
  <h3>Definitions</h3>
  <ul>
    <li><b>Data</b>: raw facts. <b>Database</b>: organised collection of related data. <b>DBMS</b>: software that stores, protects and serves it (PostgreSQL, MySQL, MongoDB).</li>
    <li><b>Table / row / column</b>: set of same-shaped records / one record / one property. <b>NULL</b>: unknown or missing value.</li>
    <li><b>SQL</b>: the declarative query language; you say <i>what</i>, the planner decides <i>how</i>.</li>
    <li><b>Constraint</b>: rule stored with a table and checked on every write (NOT NULL, UNIQUE, CHECK, PRIMARY KEY, FOREIGN KEY).</li>
    <li><b>Transaction</b>: steps that succeed or fail together (BEGIN … COMMIT / ROLLBACK). <b>Lock</b>: makes a second writer of the same row wait.</li>
    <li><b>ACID</b>: Atomicity, Consistency, Isolation, Durability.</li>
    <li><b>Parser / planner / executor</b>: checks the SQL / picks the cheapest plan using statistics / runs it.</li>
    <li><b>Page</b>: 8 KB unit of storage and I/O. <b>Buffer cache</b>: recently used pages kept in RAM.</li>
    <li><b>Index</b>: sorted side structure (B-tree) mapping values to row addresses; speeds reads, slows writes.</li>
    <li><b>WAL</b>: append-only change log, flushed before a commit is confirmed; replayed in recovery; read by replicas and CDC.</li>
    <li><b>Schema</b>: the blueprint (tables, columns, types, rules). <b>Schema-on-write</b> vs <b>schema-on-read</b>.</li>
  </ul>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>SQL / relational</th><th>NoSQL</th></tr>
    <tr><td>Model</td><td>tables + keys + JOIN</td><td>documents, key-value, wide-column, graph</td></tr>
    <tr><td>Schema</td><td>fixed, on write</td><td>flexible, on read</td></tr>
    <tr><td>Scaling</td><td>vertical + read replicas</td><td>horizontal</td></tr>
  </table>
  <table class="tbl">
    <tr><th></th><th>OLTP</th><th>OLAP</th></tr>
    <tr><td>Work</td><td>many tiny reads/writes ("place order")</td><td>few huge scans ("revenue per day")</td></tr>
    <tr><td>Storage</td><td>row store</td><td>column store</td></tr>
    <tr><td>Products</td><td>PostgreSQL, MySQL</td><td>BigQuery, Snowflake, Redshift, ClickHouse</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Data shape</th><th>Example</th><th>Usual home</th></tr>
    <tr><td>Structured</td><td>orders, payments</td><td>relational tables</td></tr>
    <tr><td>Semi-structured</td><td>menus, click events (JSON)</td><td>document DB or JSONB column</td></tr>
    <tr><td>Unstructured</td><td>photos, audio</td><td>object storage; embeddings in a vector DB</td></tr>
  </table>
  <h3>Commands</h3>
  <div class="fx" data-lang="sql">EXPLAIN SELECT ...;                       -- the chosen plan, with estimates
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;    -- runs it: real rows, pages hit/read
SELECT pg_relation_size('orders');        -- table size in bytes (8192 = 1 page)
SELECT ctid, * FROM orders;               -- physical address (page, slot)
SELECT pg_current_wal_lsn();              -- current end of the write-ahead log
SELECT * FROM information_schema.columns WHERE table_name = 'orders';  -- the schema
CREATE INDEX big_orders_id_idx ON big_orders (order_id);
UPDATE coupons SET left_count = left_count - 1
WHERE code = 'FREEDESSERT' AND left_count &gt; 0;   -- check + change in one statement</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No <code>ORDER BY</code> means no guaranteed order, even with <code>LIMIT</code>.</li>
    <li>Seq Scan is fine on small tables or when most rows match; bad for a few rows from a big table.</li>
    <li>Checks only in the app are bypassed by scripts and other services.</li>
    <li>Read-then-write in application code races; do it in one statement or with <code>FOR UPDATE</code>.</li>
    <li><code>synchronous_commit = off</code> can lose recent commits; <code>fsync = off</code> can corrupt.</li>
    <li>"Schemaless" means the schema moved into code. Heavy analytics belong in the warehouse.</li>
  </ul>

  <h2 id="di-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a database, and what is a DBMS?</summary><div class="qa-body">A database is an organised collection of related data, arranged so it can be found and changed quickly. A DBMS is the software that stores that data, runs queries on it, enforces its rules, lets many users work at once and recovers it after crashes. PostgreSQL is a DBMS; Biteful's tables are one database inside it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team keeps sales data in a shared Excel file. Give concrete reasons to move it to a database.</summary><div class="qa-body">Simultaneous edits overwrite each other (a lost update), while a DBMS serialises changes with transactions and locks. Nothing stops a typo in an amount column, while types and constraints refuse bad rows. A file must be loaded whole and stops scaling around a million rows, while a database with indexes reads only the pages it needs. A database also gives crash recovery through its log, per-user permissions and ad-hoc questions in SQL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a lost update?</summary><div class="qa-body">Two users read the same version of some data, each changes it, and the second write overwrites the first without either noticing. It happens with files and also inside databases when code reads a value, decides in the application and writes it back. The fix is to make the check and the change one atomic statement, or to lock the row while reading it (<code>SELECT … FOR UPDATE</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "SQL is declarative" mean, and why is it useful?</summary><div class="qa-body">You describe the result you want, not the steps to compute it. The planner chooses the steps: whether to scan or use an index, in which order to join tables, which algorithm to use. Because of that, the same query keeps working and often gets faster when data grows or an index is added, without being rewritten.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are constraints, and why should they live in the database rather than only in the app?</summary><div class="qa-body">Constraints are rules stored with a table and checked on every write: NOT NULL, UNIQUE, CHECK, PRIMARY KEY and FOREIGN KEY. If they live only in the application, any other path into the data, such as a script, a manual fix or a second service, bypasses them. Rules inside the database protect every path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a transaction? What does ACID stand for?</summary><div class="qa-body">A transaction is a group of operations that succeed or fail as one unit, started with BEGIN and ended with COMMIT or ROLLBACK. ACID: Atomicity (all or nothing), Consistency (each commit leaves the data obeying its rules), Isolation (concurrent transactions do not see each other's partial work) and Durability (committed changes survive crashes).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two users try to buy the last item at the same moment. How does a database prevent both succeeding?</summary><div class="qa-body">The first transaction to update the row takes a row lock; the second must wait until the first commits or rolls back. If the update includes the condition, as in <code>UPDATE stock SET qty = qty - 1 WHERE id = 7 AND qty &gt; 0</code>, the second one re-checks the row after waiting, finds zero left and updates nothing. Alternatively, lock the row on read with <code>SELECT … FOR UPDATE</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through what happens when you send a SELECT to PostgreSQL.</summary><div class="qa-body">The parser checks the grammar and resolves table and column names against the catalogue. The planner considers possible plans, estimates their costs using table statistics and picks the cheapest. The executor runs the plan, asking the buffer cache for the pages it needs and reading from disk only on a cache miss, and streams the result rows back to the client.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>EXPLAIN</code> shows "Seq Scan". Is that bad?</summary><div class="qa-body">Not necessarily. A Seq Scan reads every row and keeps those that match. It is the best plan for small tables and for queries that return a large share of the rows. It is usually a problem only when a big table is scanned to find a few rows, which often means a useful index is missing or statistics are out of date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between EXPLAIN and EXPLAIN ANALYZE?</summary><div class="qa-body"><code>EXPLAIN</code> shows the plan the planner chose and its estimates, without running the query. <code>EXPLAIN ANALYZE</code> actually executes it and adds real row counts and timings, so you can see where estimates were wrong; with <code>BUFFERS</code> it also shows pages found in cache versus read from disk. Be careful with ANALYZE on INSERT, UPDATE or DELETE, because it really performs them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do databases read data in pages rather than individual rows?</summary><div class="qa-body">Disks and operating systems transfer data in fixed-size blocks, so fetching one row costs about the same as fetching the whole 8 KB page around it. Organising tables and indexes as pages, and caching whole pages in RAM, minimises the number of slow disk trips. This is also why indexes help: they reduce the number of pages a lookup must touch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an index, and what does it cost?</summary><div class="qa-body">An index is a separate sorted structure, usually a B-tree, that maps column values to row addresses, so a lookup touches a few pages instead of the whole table. Its costs are extra disk space and slower writes, because every insert, update and delete must also maintain each index on the table. Indexes pay off for columns used to filter or join large tables when few rows match.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a database avoid losing committed data if the server crashes?</summary><div class="qa-body">Through write-ahead logging. Every change is first appended to the WAL, and a commit is confirmed only after its log records are flushed to disk; the table pages are written later. After a crash, recovery replays committed changes from the log and ignores uncommitted ones, so the database returns to a consistent state with every confirmed commit present.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a schema? Explain schema-on-write versus schema-on-read.</summary><div class="qa-body">A schema is the formal description of the data: tables, columns, types, keys and constraints. Schema-on-write enforces it when data is stored, rejecting records that do not fit, which keeps data clean but requires migrations to change. Schema-on-read stores raw data and applies structure when reading, which is flexible but pushes the work of handling messy data onto every reader.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is MongoDB "schemaless"?</summary><div class="qa-body">Not really. MongoDB does not enforce a schema by default, but the application still expects fields with particular names and types, so the schema has moved into application code. MongoDB can also enforce one with JSON Schema validation on a collection (see <a class="xref" data-note="mongo_basics">MongoDB basics</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SQL vs NoSQL: how do you choose?</summary><div class="qa-body">Start from the data and the queries. Linked entities with rules, transactions and ad-hoc questions suit a relational database, which is the sensible default. Choose a NoSQL system for a named need: a truly variable document shape, sub-millisecond key lookups, write volumes beyond one machine, or deep graph traversals, accepting what it gives up, such as joins or strict transactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OLTP vs OLAP: what is the difference, and why keep them in separate systems?</summary><div class="qa-body">OLTP serves an application's many short transactions on current data, such as placing an order; OLAP serves large analytical queries over history, such as monthly revenue. They are separated so heavy scans do not slow the live app, and because each benefits from a different layout: row stores for OLTP, column stores for OLAP. Data flows from the OLTP database to the warehouse through ETL or CDC.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the databases you would expect in a typical ML product and what each does.</summary><div class="qa-body">A relational database such as PostgreSQL as the app's source of truth; a warehouse such as BigQuery or Snowflake for analytics and training data; Redis for caching, sessions and online features; a vector database or pgvector for embedding search in RAG; often a search engine such as Elasticsearch, and a feature store. All of the copies are fed from the source of truth.</div></details>
</main>
`
});
