// notes/databases/db_types.js — Types of Databases
Object.assign(TOPIC_CONTENT, {
  "db_types": `<main>
  <h1>Types of Databases</h1>
  <div class="where"><span>Databases</span><span>Foundations</span><span>Types of Databases</span></div>
  <p class="lead">There is no single best database. Each family of databases stores data in a different shape, and that shape decides which questions are cheap to answer and which are painful. This page follows <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="db_intro">What is a Database</a>, as it grows: every new kind of data it collects (menus, shopping carts, rider GPS pings, referral chains, delivery metrics, a search box, "dishes like this", company-wide analytics) pushes it towards a different family, and we will see what each family makes easy and what it gives up. Then we look at the guarantees databases offer (ACID, BASE and the CAP theorem) and how to choose and combine them, which is the substance of the common interview question "which database would you use, and why?". PostgreSQL 16, Redis 7 and DuckDB were run for real for every block shown with output. MongoDB outputs come from mongomock, an in-memory stand-in for MongoDB; Cassandra, Neo4j and InfluxDB are not available here, so their commands are shown without output and their results are explained in prose.</p>

  <h2 id="dt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Types of Databases</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Storing the truth</div>
        <ul>
          <li><b>Relational</b>: tables + keys + JOIN, ACID (PostgreSQL)</li>
          <li><b>Document</b>: one nested JSON per record (MongoDB, JSONB)</li>
          <li><b>Key-value</b>: giant dictionary, often in RAM (Redis)</li>
          <li><b>Wide-column</b>: partition key + clustering key (Cassandra)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Specialists</div>
        <ul>
          <li><b>Graph</b>: nodes + edges, cheap multi-hop (Neo4j)</li>
          <li><b>Time-series</b>: appends, time buckets, retention</li>
          <li><b>Search</b>: inverted index word → documents (Elasticsearch)</li>
          <li><b>Vector</b>: embeddings + nearest neighbour (pgvector, Pinecone)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layout and guarantees</div>
        <ul>
          <li>Row store → OLTP; column store → OLAP warehouses</li>
          <li>Wide-column is NOT columnar</li>
          <li><b>ACID</b> vs <b>BASE</b>; <b>CAP</b>: during a partition, C or A</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li>Start from the queries, not the product</li>
          <li>Default PostgreSQL; add a specialist for a named need</li>
          <li>One source of truth; copies fed by CDC, never dual writes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dt-rel"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Relational Databases</span><span class="rm-sub">tables linked by keys, combined with JOIN</span></div></div>
      <div class="rm-item rm-done" data-target="dt-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Document Databases</span><span class="rm-sub">menus whose fields differ</span></div></div>
      <div class="rm-item rm-done" data-target="dt-kv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Key-Value Stores</span><span class="rm-sub">the cart in under a millisecond</span></div></div>
      <div class="rm-item rm-done" data-target="dt-wide"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Wide-Column Stores</span><span class="rm-sub">a firehose of rider GPS pings</span></div></div>
      <div class="rm-item rm-done" data-target="dt-graph"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Graph Databases</span><span class="rm-sub">following referral chains</span></div></div>
      <div class="rm-item rm-done" data-target="dt-ts"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Time-Series Databases</span><span class="rm-sub">metrics per time bucket</span></div></div>
      <div class="rm-item rm-done" data-target="dt-search"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Search Engines</span><span class="rm-sub">finding dishes by the words they contain</span></div></div>
      <div class="rm-item rm-done" data-target="dt-vector"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Vector Databases</span><span class="rm-sub">finding dishes similar in meaning</span></div></div>
      <div class="rm-item rm-done" data-target="dt-col"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Row Stores and Column Stores</span><span class="rm-sub">why warehouses scan so fast</span></div></div>
      <div class="rm-item rm-done" data-target="dt-acid"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ACID, BASE and CAP</span><span class="rm-sub">the guarantees each database makes</span></div></div>
      <div class="rm-item rm-done" data-target="dt-choose"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing and Combining Databases</span><span class="rm-sub">workload to family, polyglot, managed cloud</span></div></div>
      <div class="rm-item rm-done" data-target="dt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">averages of averages, KEYS, dual writes</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">every family in one table</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">"which database would you use, and why?"</span></div></div>
    </div>
  </div>

  <h2 id="dt-rel"><span class="num">01</span>Relational Databases</h2>
  <p>Biteful's core data is customers, restaurants and orders, and every order refers to one customer and one restaurant. The question every database family answers differently is: how do you store things that refer to each other? The naive answer is to copy: write "Farah, Mumbai" and "Biryani Bros" into every order. But then Farah's details live in many places, and the day she moves to Pune, some copies get updated and some do not.</p>
  <p>A school office solved this long ago. One register lists students (roll number, name, class); another lists fee payments (roll number, date, amount). The payment register never repeats a student's name; it writes only the roll number, and to answer "who paid on 5 June?" the clerk looks the roll number up in the student register. That is the <strong>relational model</strong>: data lives in <strong>tables</strong> with fixed columns, each fact is stored exactly once, tables refer to each other through identifying values called <strong>keys</strong>, and a <strong>JOIN</strong> combines tables at the moment you ask a question by matching those keys. Biteful's order 109 stores only <code>customer_id = 6</code> and <code>restaurant_id = 11</code>; to show it with names, the query joins three tables:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant, o.status, o.amount
FROM orders o
JOIN customers c   ON c.customer_id = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.order_id = 109;</div>
  <div class="fx" data-lang="text"> order_id | customer |  restaurant  |  status   | amount 
----------+----------+--------------+-----------+--------
      109 | Farah    | Biryani Bros | delivered | 600.00
(1 row)</div>
  <p>Read the query from the <code>FROM</code> line down: start with <code>orders</code> (nicknamed <code>o</code>), attach the row of <code>customers</code> whose id equals the order's <code>customer_id</code>, attach the row of <code>restaurants</code> whose id equals the order's <code>restaurant_id</code>, and keep only order 109. The result shows Farah and Biryani Bros even though the order row never contained those names. If Farah moves, one row in <code>customers</code> changes and every one of her orders shows the new city at once. The name "relational" comes from <em>relation</em>, the mathematical word for a table, not from "having relationships"; every database has relationships, but here they are expressed purely by matching values.</p>
  <p>Because the data is split into small, rule-checked tables, relational databases are excellent at the things <a class="xref" data-note="db_intro">What is a Database</a> showed: ad-hoc questions nobody planned for, joins across any tables, constraints that keep bad data out, and ACID transactions. Their weakness is scaling writes across many machines, since a join or a transaction that spans machines is slow and complicated, and data whose shape changes every week, since every change of shape needs a migration. Products include PostgreSQL, MySQL, SQLite, SQL Server and Oracle; "distributed SQL" systems such as CockroachDB and Google Spanner keep the relational model while spreading data over many machines.</p>
  <p>The same order looks very different in the other families, and the figure previews them. Keep it in mind: in each case the shape is what makes one kind of question cheap.</p>
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
    <circle cx="485" cy="52" r="20" style="fill:var(--bg)"/><circle cx="485" cy="52" r="20" class="fb"/><text x="485" y="56" text-anchor="middle">Farah</text>
    <circle cx="485" cy="145" r="20" style="fill:var(--bg)"/><circle cx="485" cy="145" r="20" class="fb"/><text x="485" y="149" text-anchor="middle">Ben</text>
    <circle cx="565" cy="100" r="24" style="fill:var(--bg)"/><circle cx="565" cy="100" r="24" class="fg"/><text x="565" y="104" text-anchor="middle" font-size="9">Biryani Bros</text>
    <text x="522" y="66" class="tm" font-size="9">ORDERED</text>
    <text x="75" y="190" text-anchor="middle" class="tm">JOIN on keys</text>
    <text x="232" y="190" text-anchor="middle" class="tm">whole object, 1 read</text>
    <text x="380" y="190" text-anchor="middle" class="tm">get by key only</text>
    <text x="527" y="190" text-anchor="middle" class="tm">follow edges</text>
    </g>
  </svg><figcaption>The same Biteful data in four shapes. Relational rows point at each other through ids; a document nests everything about one order; a key-value store maps a key to an opaque value; a graph links nodes with edges.</figcaption></figure>

  <h2 id="dt-doc"><span class="num">02</span>Document Databases</h2>
  <p>Fixed columns suit orders, but Biteful's restaurant menus do not fit them. A Masala Dosa has a spice level and a choice of chutneys; a pizza has sizes and crusts; a coffee has neither. To store menus in one table you would need a column for every option any restaurant has ever offered, and most rows would be empty in most columns. Every new kind of option would need a schema migration.</p>
  <p>A <strong>document database</strong> stores each record as a self-contained <strong>document</strong>, a JSON-like object with named fields (JSON being the text format with curly braces that web apps already speak). Two documents in the same <strong>collection</strong> (the document world's equivalent of a table) may have completely different fields, and a field can itself hold a list or another object, so related data can be <strong>nested</strong> inside the record instead of split into separate tables. Think of a filing cabinet with one folder per restaurant: everything about that menu sits in its folder, however different it is from the folder next to it. Here are two Biteful menus inserted into MongoDB and queried in its shell language:</p>
  <div class="fx" data-lang="mongo">db.menus.insertMany([
  { restaurant: "Dosa Hut",
    items: [ { name: "Masala Dosa", price: 120, spice: "medium",
               chutneys: ["coconut", "tomato"] },
             { name: "Filter Coffee", price: 70 } ] },
  { restaurant: "Pizza Point",
    items: [ { name: "Margherita", sizes: { regular: 280, large: 420 } } ] }
])

// one read returns the whole menu, nested lists and all
db.menus.findOne({ restaurant: "Dosa Hut" }, { _id: 0 })

// query INSIDE the nested items: which menus have a medium-spice dish?
db.menus.find({ "items.spice": "medium" }, { _id: 0, restaurant: 1 })

// which menus have a dish sold in sizes?
db.menus.find({ "items.sizes": { $exists: true } }, { _id: 0, restaurant: 1 })</div>
  <div class="fx" data-lang="text">insertMany: acknowledged, inserted 2 documents
{'restaurant': 'Dosa Hut', 'items': [{'name': 'Masala Dosa', 'price': 120, 'spice': 'medium', 'chutneys': ['coconut', 'tomato']}, {'name': 'Filter Coffee', 'price': 70}]}
{'restaurant': 'Dosa Hut'}
{'restaurant': 'Pizza Point'}</div>
  <p>The first output line confirms both documents were stored even though their dishes have different fields. <code>findOne</code> returns Dosa Hut's whole menu in a single read, with the list of dishes and the nested list of chutneys intact: no join was needed, because everything about the menu was stored together. The next query reaches inside the nested list: <code>"items.spice"</code> means "any dish in <code>items</code> whose <code>spice</code> field is medium", and it finds Dosa Hut. The last uses <code>$exists</code> to find menus where some dish has a <code>sizes</code> field, which only Pizza Point has. Fields a document does not have are simply absent rather than empty.</p>
  <p>Flexible fields alone are not a reason to leave PostgreSQL, though. It has a column type called <code>JSONB</code> (binary JSON) that stores whole documents inside a relational table. In the query below, <code>-&gt;</code> steps into a field, <code>-&gt;&gt;</code> pulls a value out as text, and <code>jsonb_array_elements</code> turns the <code>items</code> list into one row per dish:</p>
  <div class="fx" data-lang="sql">CREATE TABLE menus (restaurant_id INT REFERENCES restaurants, doc JSONB);
INSERT INTO menus VALUES
 (10, '{"restaurant": "Dosa Hut", "items": [
        {"name": "Masala Dosa", "price": 120, "spice": "medium", "chutneys": ["coconut", "tomato"]},
        {"name": "Filter Coffee", "price": 70}]}'),
 (12, '{"restaurant": "Pizza Point", "items": [
        {"name": "Margherita", "sizes": {"regular": 280, "large": 420}}]}');

SELECT m.doc -&gt;&gt; 'restaurant'        AS restaurant,
       item -&gt;&gt; 'name'               AS dish,
       item -&gt;&gt; 'spice'              AS spice,
       item -&gt; 'sizes' -&gt;&gt; 'large'   AS large_price
FROM menus m, jsonb_array_elements(m.doc -&gt; 'items') AS item;</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 2
 restaurant  |     dish      | spice  | large_price 
-------------+---------------+--------+-------------
 Dosa Hut    | Masala Dosa   | medium | NULL
 Dosa Hut    | Filter Coffee | NULL   | NULL
 Pizza Point | Margherita    | NULL   | 420
(3 rows)</div>
  <p>Each dish became a row, and a field the dish does not have comes back as NULL: Filter Coffee has no spice level and no sizes. So you can keep orders in tables and menus as documents in the same database, and still join them.</p>
  <p>Documents shine when an application reads and writes one whole object at a time: menus, product catalogues, user profiles, content management. They struggle with many-to-many relationships and with questions that cut across documents. If every order document embeds a copy of the customer's name and address, a change of address must find and update every copy, and copies that are missed go stale; and "average price of every dish across all menus" means opening every folder. Products include MongoDB, Couchbase, Firestore and Amazon DocumentDB; MongoDB is studied in depth in <a class="xref" data-note="mongo_basics">MongoDB: Documents &amp; CRUD</a>. Remember from the previous page that "schemaless" only means the database does not check the shape: if one menu says <code>price</code> and another says <code>Price</code>, every reader must cope.</p>

  <h2 id="dt-kv"><span class="num">03</span>Key-Value Stores</h2>
  <p>Some data is only ever fetched by one exact identifier, and fetched constantly. Every tap in the Biteful app asks "what is in this user's cart?" and "is this user logged in?", crores of times a day. We do not need joins, filters or constraints for this data, only raw speed, and even a fast PostgreSQL query, with its parsing, planning and disk pages, is more work than the job requires.</p>
  <p>A wedding-hall cloakroom shows the simplest possible design. You hand in your bag and receive token 42; later you show token 42 and get your bag back in seconds. The attendant never opens the bag and does not care what is inside. A <strong>key-value store</strong> works exactly like this: it is a giant dictionary that maps a unique <strong>key</strong> (the token) to a <strong>value</strong> (the bag), and its main operations are put, get and delete by key. Because the store never looks inside the value, the value can be anything: a number, a JSON string, a list. Redis, the most popular one, keeps everything <strong>in memory</strong> (in RAM rather than on disk), so lookups take microseconds. These commands ran against a real Redis 7 server: <code>SET</code> stores a value under a key, <code>EX 1800</code> makes it expire after 1,800 seconds (30 minutes), <code>GET</code> reads it, <code>TTL</code> shows the seconds left before it expires, and <code>INCR</code> adds one to a counter atomically:</p>
  <div class="fx" data-lang="text">&gt; SET cart:asha '{"restaurant": 10, "items": [["Masala Dosa", 2]]}' EX 1800
OK
&gt; GET cart:asha
"{\\"restaurant\\": 10, \\"items\\": [[\\"Masala Dosa\\", 2]]}"
&gt; TTL cart:asha
(integer) 1800
&gt; INCR views:restaurant:11
(integer) 1
&gt; INCR views:restaurant:11
(integer) 2
&gt; SET cart:ben '{"restaurant": 11, "items": [["Chicken Biryani", 1]]}' EX 1800
OK
&gt; GET cart:chen
(nil)</div>
  <p>Every answer came straight back by key. Asha's cart will disappear by itself after 30 minutes, which is exactly what an abandoned cart should do. The view counter went 1, 2, and because <code>INCR</code> is a single atomic command, two app servers incrementing it at the same moment can never lose a count (the lost-update problem from the previous page). Asking for a key that does not exist, <code>cart:chen</code>, returns <code>(nil)</code>, Redis's way of saying "nothing here". (<code>(integer)</code> simply marks a numeric reply, and the stored cart comes back as one quoted string, because Redis never looks inside it.)</p>
  <p>Now ask a question that is not "by key": which carts contain Masala Dosa? Redis has no WHERE clause and no index on the contents of values, so the only way is to list every cart key, fetch each value, and search inside the text in your own code, like asking the cloakroom attendant to find every red coat by checking every hook. That is the price of the speed: key-value stores are superb at caches, sessions, carts, rate limiters, counters, leaderboards and serving ML features in real time, and useless for filtering, ranges, joins or aggregates. Products include Redis, Memcached, Amazon DynamoDB and etcd.</p>
  <p>One more property needs care. "In-memory" describes where data lives, not a family, and memory is lost when a server restarts. Redis can save snapshots to disk or log every write to a file, but with common settings a crash can still lose the most recent writes. So Redis is normally used as a <strong>cache</strong>, a fast copy of data whose real home is elsewhere, or for data you can afford to lose. A lost cart annoys a customer; a lost paid order is a disaster, so orders go to PostgreSQL first.</p>

  <h2 id="dt-wide"><span class="num">04</span>Wide-Column Stores</h2>
  <p>Biteful's 10,000 riders each send a GPS point every few seconds, all day, every day. That is thousands of writes per second that never stop, more than one machine can absorb, and the data must be spread across many machines. Two questions follow: when a GPS point arrives, how does the system know which machine it belongs on, without looking anything up? And how can we still read one rider's trail for one day quickly and in order?</p>
  <p>A <strong>wide-column store</strong> answers both with a two-part key. The <strong>partition key</strong> decides which machine (and which storage bucket, called a partition) a row goes to: the database runs the partition key through a hash function, which turns it into a number that maps to one machine, so no lookup is needed. All rows with the same partition key live together. The <strong>clustering key</strong> then sorts the rows inside that partition. For rider pings, a good design is one partition per rider per day, with rows sorted by time. A post office sorting room works the same way: the pin code decides which bag a letter goes into, inside each bag the letters are stacked by date, and when mail volume grows you add more sorters and bags. This is the table in Cassandra's query language, CQL:</p>
  <div class="fx" data-lang="sql">-- Cassandra CQL (no Cassandra server in this environment, so no output)
CREATE TABLE rider_pings (
  rider_id text, day date, ts timestamp, lat double, lon double,
  PRIMARY KEY ((rider_id, day), ts)        -- (partition key), clustering key
) WITH CLUSTERING ORDER BY (ts DESC);

SELECT ts, lat, lon FROM rider_pings
WHERE rider_id = 'R7' AND day = '2026-03-02' LIMIT 20;</div>
  <p>The double brackets in <code>PRIMARY KEY ((rider_id, day), ts)</code> are the key idea: the inner pair is the partition key, and <code>ts</code> is the clustering key, stored newest first. The SELECT names the complete partition key, so Cassandra hashes it, goes straight to the one machine that owns rider R7's 2 March partition, and reads the latest 20 pings, which are already stored in order. Writing is just as direct: each incoming ping is hashed to its machine and appended there. A query such as "all pings near Pune station" names no partition key, so it would have to ask every machine; Cassandra refuses it unless you explicitly add <code>ALLOW FILTERING</code>.</p>
  <p>That refusal shows the design philosophy. Wide-column stores give up joins and ad-hoc queries in exchange for write throughput that grows almost linearly as you add machines, which suits event streams, IoT sensors, messaging and activity feeds. You design one table per query you need, often storing the same data several times in different layouts. The "wide" in the name refers to the fact that rows in the same table can have different, and very many, columns. Products include Apache Cassandra, ScyllaDB, HBase and Google Bigtable. Do not confuse "wide-column" with "columnar": a wide-column store keeps each row's values together, grouped by key, which is good for writes, while a columnar warehouse keeps each column's values together, which is good for scans (section 09). Interviewers like this question precisely because the names are so similar.</p>

  <h2 id="dt-graph"><span class="num">05</span>Graph Databases</h2>
  <p>Biteful pays a bonus for referrals, and bonuses attract fraud: one person creates fake accounts that refer each other in rings. To spot a ring, the fraud team needs to follow "referred" links hop after hop, without knowing in advance how many hops there are. The links already exist in the relational data: <code>customers.referred_by</code> holds the id of the customer who invited this one. Each hop is one more join of <code>customers</code> to itself, and for an unknown number of hops SQL needs a <strong>recursive query</strong>, one that repeats a step until no new rows appear (explained in <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>). Here is everyone in Asha's referral tree:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE tree AS (
  SELECT customer_id, name, 0 AS hops FROM customers WHERE name = 'Asha'
  UNION ALL
  SELECT c.customer_id, c.name, t.hops + 1
  FROM customers c JOIN tree t ON c.referred_by = t.customer_id
)
SELECT name, hops FROM tree ORDER BY hops, name;</div>
  <div class="fx" data-lang="text"> name  | hops 
-------+------
 Asha  |    0
 Ben   |    1
 Chen  |    1
 Farah |    2
(4 rows)</div>
  <p>The query works in rounds. It starts with Asha at 0 hops. Round one finds every customer whose <code>referred_by</code> is Asha's id: Ben and Chen. Round two finds everyone referred by Ben or Chen: Farah. Round three finds nobody, so it stops. The answer is correct, but notice the cost: every round is a join against the whole <code>customers</code> table (helped by indexes, but still a fresh lookup per hop). With crores of customers and questions five or six hops deep, asked constantly, this becomes slow and awkward to write.</p>
  <p>A <strong>graph database</strong> stores the shape of the question directly. Data is <strong>nodes</strong>, the things (Asha, Biryani Bros), and <strong>edges</strong>, the relationships between them (REFERRED, ORDERED_FROM), and both can carry properties such as a date. The important difference is physical: each node keeps direct references to its neighbours, so following an edge is a pointer hop rather than a search, and the cost of a traversal depends on how many hops you take, not on how big the whole dataset is. Think of a detective's corkboard of photos joined by string: finding friends of friends of a suspect means following string, not cross-checking lists. Neo4j's query language, Cypher, even draws the pattern with arrows:</p>
  <div class="fx" data-lang="text">// Cypher (no Neo4j server in this environment, so no output)
// everyone reachable from Asha in 1 to 5 REFERRED hops
MATCH (a:Customer {name: 'Asha'})-[:REFERRED*1..5]-&gt;(x:Customer)
RETURN x.name</div>
  <p>The pattern reads left to right: start at the Customer node named Asha, follow between one and five REFERRED edges, and return each customer reached. On Biteful's data it would return Ben, Chen and Farah, the same people as the recursive query, but by walking pointers outward from Asha rather than repeatedly searching the table. Graph databases suit fraud and referral rings, recommendations ("people who ordered from here also ordered from…"), social networks and knowledge graphs. They are poor at bulk aggregation such as monthly revenue and at very high write rates. Products include Neo4j, Amazon Neptune and TigerGraph. If your question needs only one or two hops, as Asha's small tree does, PostgreSQL's recursive query is fine; a graph database pays off when hops are deep, variable in number and asked all the time.</p>

  <h2 id="dt-ts"><span class="num">06</span>Time-Series Databases</h2>
  <p>Biteful's operations team wants live dashboards: average delivery minutes per hour, per city, for the last 30 days, with old raw data deleted automatically. This kind of data has a very particular pattern. Every record is a measurement with a timestamp; records arrive in time order; nobody ever edits an old one; and almost every question is "summarise per time bucket". A fitness band is the everyday example: it records your heart rate every second, never goes back to change yesterday's 10:03:17 reading, and you ask it for the average per minute over the last hour.</p>
  <p>A <strong>time-series database</strong> is built around exactly this pattern. Each record is (timestamp, tags, values): when, which thing it describes (city, restaurant), and the numbers measured. The core query is a time bucket, which you can already write in SQL. Here it is on Biteful's delivered orders, one bucket per day:</p>
  <div class="fx" data-lang="sql">SELECT date_trunc('day', ordered_at)::date AS day,
       COUNT(delivery_minutes)            AS measured,
       ROUND(AVG(delivery_minutes), 1)    AS avg_minutes
FROM orders
WHERE status = 'delivered'
GROUP BY 1
ORDER BY 1;</div>
  <div class="fx" data-lang="text">    day     | measured | avg_minutes 
------------+----------+-------------
 2026-03-02 |        3 |        37.0
 2026-03-03 |        0 |        NULL
 2026-03-04 |        1 |        25.0
 2026-03-05 |        2 |        40.5
(4 rows)</div>
  <p><code>date_trunc('day', ordered_at)</code> rounds each timestamp down to the start of its day, which puts every order into a daily bucket. <code>measured</code> counts how many orders in the bucket have a delivery time, and <code>avg_minutes</code> averages them. On 3 March the only delivered order, 104, has no recorded minutes, so the count is 0 and the average is NULL. Keeping the count next to the average is not decoration; section 12 shows why you need it.</p>
  <p>What a time-series database adds is making this fast and cheap at enormous volume. It stores data in chunks by time, so a query over the last hour touches only the newest chunk; it compresses consecutive readings, which are usually similar, very tightly; and it supports <strong>retention</strong> and <strong>downsampling</strong>: keep per-second data for a week, keep per-minute averages for a year, and delete the rest automatically. A train's logbook is a fair picture: every station and minute written in order and never corrected, and at month end summarised as "average delay per day" before the daily pages are archived. In InfluxDB, one measurement is written as a single line of text giving the measurement name, its tags, its value and a timestamp in nanoseconds:</p>
  <div class="fx" data-lang="text"># InfluxDB line protocol (no InfluxDB in this environment, so no output)
delivery,city=Pune,restaurant=DosaHut minutes=32 1772433600000000000</div>
  <p>Time-series databases are excellent at high-rate appends, time-bucket aggregates, retention and downsampling, and poor at updating records or relating many kinds of entity to each other. Products include TimescaleDB (an extension that adds these features to PostgreSQL), InfluxDB, Prometheus for monitoring, and QuestDB.</p>

  <h2 id="dt-search"><span class="num">07</span>Search Engines</h2>
  <p>Biteful's customers now type into a search box: "biryani", "paneer roll", even "chiken biryani" with a typo. They expect matching dishes, best match first, in milliseconds. The obvious SQL is a pattern match:</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT item FROM order_items WHERE item ILIKE '%biryani%';
SELECT DISTINCT item FROM order_items WHERE item ILIKE '%chiken%';</div>
  <div class="fx" data-lang="text">      item       
-----------------
 Chicken Biryani
 Veg Biryani
(2 rows)

 item 
------
(0 rows)</div>
  <p>The first query works on ten dishes, but it has three problems. <code>ILIKE '%biryani%'</code> (case-insensitive pattern match, where <code>%</code> means "anything") cannot use a normal index, because a B-tree is sorted by the beginning of each value and the word could be anywhere, so it reads every row. It cannot rank: all matches are equal. And the second query shows it has no tolerance for typos: "chiken" finds nothing.</p>
  <p>A search engine prepares for these questions in advance by building an <strong>inverted index</strong>: a map from each word to the list of documents that contain it. It is called "inverted" because a document normally lists its words, while this index lists, for each word, its documents. The index at the back of a textbook is exactly this: look up a word, get every page it appears on. Here is one built by hand from the dishes Biteful has sold:</p>
  <div class="fx" data-lang="py">from collections import defaultdict
import psycopg2

# DSN = connection string for the Biteful database
cur = psycopg2.connect(DSN).cursor()
cur.execute("SELECT DISTINCT item FROM order_items ORDER BY item")
dishes = [r[0] for r in cur.fetchall()]

index = defaultdict(set)                  # word -&gt; set of dishes containing it
for dish in dishes:
    for word in dish.lower().split():
        index[word].add(dish)

print(len(dishes), "dishes,", len(index), "distinct words")
for word in ["biryani", "pizza", "chicken"]:
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
'chicken'  -&gt; ['Chicken Biryani']
chicken biryani -&gt; [('Chicken Biryani', 2), ('Veg Biryani', 1)]</div>
  <p>The program reads the 10 distinct dish names, splits each into lower-case words, and records for every word the set of dishes containing it, 17 distinct words in all. Answering "biryani" is now a single dictionary lookup rather than a scan of every dish. For the two-word query "chicken biryani", each dish scores one point per matching word: Chicken Biryani matches both and ranks first with 2, Veg Biryani matches one word and ranks second with 1. Real engines rank with a formula called <strong>BM25</strong>, which gives more weight to rare words (matching "kebab" says more than matching "veg") and to short documents full of matches, and they add stemming (treating "pizzas" as "pizza"), typo tolerance and facets (counts such as "Biryani 3, Pizza 2" next to the results).</p>
  <p>PostgreSQL has a built-in version of the same idea called full-text search. <code>to_tsvector</code> turns text into a list of normalised words, <code>to_tsquery</code> turns the search into a query (<code>|</code> means OR), <code>@@</code> tests whether they match, and <code>ts_rank</code> scores the match:</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT item,
       ts_rank(to_tsvector('english', item),
               to_tsquery('english', 'chicken | biryani')) AS rank
FROM order_items
WHERE to_tsvector('english', item) @@ to_tsquery('english', 'chicken | biryani')
ORDER BY rank DESC, item;</div>
  <div class="fx" data-lang="text">      item       |    rank     
-----------------+-------------
 Chicken Biryani |  0.06079271
 Veg Biryani     | 0.030396355
(2 rows)</div>
  <p>The ranking agrees with our hand-built index: Chicken Biryani, which matches both words, scores twice as high as Veg Biryani. With a GIN index (PostgreSQL's inverted-index type) on the <code>to_tsvector</code> expression, this is enough for many small apps. Dedicated engines such as Elasticsearch, OpenSearch, Solr, Algolia and Typesense add better relevance, typo tolerance, facets, and log search at large scale. A search engine is almost never the source of truth: it is a copy fed from the main database, which can lag behind or lose writes, and if the two disagree the database wins and the index is rebuilt. And it matches words, not meaning: no inverted index will return "Hyderabadi pulao" for "biryani", although a hungry customer would happily accept it.</p>

  <h2 id="dt-vector"><span class="num">08</span>Vector Databases</h2>
  <p>"Show me dishes like this one" needs a notion of closeness in meaning. Someone who loves Chicken Biryani might like Veg Biryani, but also pulao or a kebab, which share no words with it. To let a computer measure that, we turn meaning into numbers. An <strong>embedding</strong> is a list of numbers (typically several hundred) produced by a machine-learning model, arranged so that items with similar meaning get lists that point in similar directions. A <strong>vector database</strong> stores these lists, called vectors, and given the vector of a query, finds the stored vectors closest to it.</p>
  <p>To see the idea with numbers small enough to check by hand, give each dish just three made-up numbers between 0 and 1: how spicy, how rice-based, and how cheesy it is. Closeness is measured with <strong>cosine similarity</strong>, which compares the directions of two vectors: 1 means they point the same way, 0 means they are unrelated. It is the dot product (multiply matching numbers and add them up) divided by the product of the two vectors' lengths:</p>
  <div class="fx" data-lang="py">import math

# toy 3-number "embeddings": (spicy, rice-based, cheesy).
# Real embeddings have hundreds of numbers produced by a model.
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
ranked = sorted(((cosine(q, v), name) for name, v in dishes.items()
                 if name != "Chicken Biryani"), reverse=True)
for score, name in ranked:
    print(f"{name:16} {score:.3f}")</div>
  <div class="fx" data-lang="text">Veg Biryani      0.990
Masala Dosa      0.879
Mutton Kebab     0.743
Farmhouse Pizza  0.233
Margherita       0.073</div>
  <p>Check the top result by hand. Chicken Biryani is (0.8, 0.9, 0) and Veg Biryani is (0.6, 0.9, 0). The dot product is 0.48 + 0.81 + 0 = 1.29. The lengths are √(0.64 + 0.81) = 1.204 and √(0.36 + 0.81) = 1.082. So the cosine is 1.29 / (1.204 × 1.082) = 0.990, almost identical in direction. The pizzas, with no rice and lots of cheese, score lowest. With a real model the numbers are learned from text or images rather than chosen by hand, and "pulao" would land close to "biryani" without sharing a single word. Imagine a city map on which similar shops are placed near each other: "something like this biryani place" becomes "what is nearest on the map".</p>
  <p>Comparing a query with every stored vector, as this loop does, is too slow for millions of items. Vector databases therefore build <strong>approximate nearest neighbour</strong> (ANN) indexes, such as HNSW (a layered graph of vectors that lets a search jump quickly towards the right region). They return <em>almost</em> the closest matches, occasionally missing a true neighbour, in exchange for answering in milliseconds instead of seconds. The usual uses are semantic search (search by meaning), retrieval for LLM chatbots (RAG: fetching the most relevant passages to show the model), "similar items" recommendations and de-duplication. They are weaker at exact filters and transactions. Products include Pinecone, Weaviate, Milvus, Qdrant and Chroma, and the <code>pgvector</code> extension adds vectors and HNSW indexes to PostgreSQL; under a few million vectors, pgvector in your existing database is usually enough. Embeddings are covered fully in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.</p>

  <h2 id="dt-col"><span class="num">09</span>Row Stores and Column Stores</h2>
  <p>Every family so far serves the app. Biteful's analysts have a different need: "revenue per restaurant per month for two years" across billions of rows. A warehouse such as BigQuery answers that in seconds while PostgreSQL takes minutes, even though both speak SQL. The reason is physical. A table has two dimensions, but a disk is one long line of bytes, so the database must choose how to lay the table out: row after row, or column after column.</p>
  <p>A small example makes the difference countable. Biteful's <code>orders</code> table has 10 rows and 7 columns, so 70 values. The query "count orders by status" needs only the <code>status</code> column, which is 10 values. The program lays the same table out both ways and counts what a scan must touch:</p>
  <div class="fx" data-lang="py">import psycopg2

# DSN = connection string for the Biteful database
cur = psycopg2.connect(DSN).cursor()
cur.execute("SELECT * FROM orders ORDER BY order_id")
cols = [d.name for d in cur.description]
rows = [tuple(str(v) for v in r) for r in cur.fetchall()]    # values as text

row_store = [v for r in rows for v in r]                     # row after row
column_store = {c: [r[i] for r in rows] for i, c in enumerate(cols)}   # column after column

print("row store, first 9 values :", row_store[:9])
print("column store, status block:", column_store["status"])
print("values a row-store scan touches   :", len(row_store))
print("values a column-store scan touches:", len(column_store["status"]))</div>
  <div class="fx" data-lang="text">row store, first 9 values : ['101', '1', '10', '2026-03-02 12:10:00+05:30', 'delivered', '240.00', '32', '102', '2']
column store, status block: ['delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'delivered', 'cancelled', 'delivered', 'delivered', 'pending']
values a row-store scan touches   : 70
values a column-store scan touches: 10</div>
  <p>In the <strong>row store</strong>, all of one order's values sit together (101, 1, 10, the timestamp, delivered, 240.00, 32), then the next order's, so the 10 status values are scattered, one inside each row, and reaching them means reading all 70 values. In the <strong>column store</strong>, all status values sit together in one block, and the scan reads exactly 10. On ten rows nobody notices. On two billion rows with 40 columns, a query that needs one column makes a row store read 40 times more data than necessary.</p>
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
  </svg><figcaption>Five rows and four columns. Each small box is one value; the green boxes are status values.</figcaption></figure>
  <p>In the figure, the top strip is the row store: to collect the five green status values, the scan must pass over every box, as the red bracket shows. The bottom strip is the column store: the green values sit together at the end, and the scan reads only that block. There is a second advantage hidden in the green block: neighbouring values in a column are usually similar ("delivered, delivered, delivered…"), so a column compresses extremely well, for example as "delivered × 4" instead of four copies, and less data on disk means even less to read. Think of a stack of filled-in forms versus one list per question: the forms are perfect for pulling out Asha's complete form, and the per-question lists are perfect for "average age of everyone".</p>
  <p>DuckDB is a column-store database you can run inside Python, which makes it easy to watch this happen. Its query plan shows which columns the scan actually reads:</p>
  <div class="fx" data-lang="py">import duckdb

con = duckdb.connect()                     # an in-memory column-store database
con.execute("""CREATE TABLE orders AS SELECT * FROM (VALUES
  (101,'delivered',240), (102,'delivered',450), (103,'delivered',520), (104,'delivered',380),
  (105,'cancelled',310), (106,'delivered',180), (107,'cancelled',260), (108,'delivered',260),
  (109,'delivered',600), (110,'pending',310)) AS t(order_id, status, amount)""")
print(con.execute("SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status").fetchall())
plan = con.execute("EXPLAIN SELECT status, COUNT(*) FROM orders GROUP BY status").fetchall()[0][1]
print(plan[plan.index("╭─ Seq Scan"):])   # the bottom step of the plan: the scan</div>
  <div class="fx" data-lang="text">[('cancelled', 2), ('delivered', 7), ('pending', 1)]
╭─ Seq Scan ─────────┴────────────────────╮
│ Table: memory.main.orders               │
│ Type: Sequential Scan                   │
│ Projections: status                     │
│ ~10 rows                                │
╰─────────────────────────────────────────╯</div>
  <p>The counts match what PostgreSQL would give (7 delivered, 2 cancelled, 1 pending), and the bottom step of the plan, the Seq Scan, lists <code>Projections: status</code>: of the table's three columns, it read only <code>status</code>. A row store must read every row in full to do the same job.</p>
  <table class="tbl">
    <tr><th></th><th>Row store</th><th>Column store</th></tr>
    <tr><td>Fast for</td><td>fetching or updating one whole row (OLTP)</td><td>aggregating a few columns over many rows (OLAP)</td></tr>
    <tr><td><code>SUM(amount)</code> over 1 billion rows</td><td>reads every column of every row</td><td>reads only <code>amount</code></td></tr>
    <tr><td>Compression</td><td>modest</td><td>high: similar values sit together</td></tr>
    <tr><td>Single-row insert or update</td><td>cheap</td><td>expensive; data is loaded in batches</td></tr>
    <tr><td>Examples</td><td>PostgreSQL, MySQL</td><td>BigQuery, Snowflake, Redshift, ClickHouse, DuckDB</td></tr>
  </table>
  <p>This is the physical reason behind the OLTP/OLAP split from <a class="xref" data-note="db_intro">What is a Database</a>. An <strong>analytical warehouse</strong> is a column store plus massively parallel execution: the table is split into slices and hundreds of machines each scan one slice at the same time. As a data scientist the warehouse is your main workplace, but it makes a poor app backend, because single-row writes are slow, each query has seconds of overhead, and many warehouses charge per query. One habit follows directly from the layout: on a column store, <code>SELECT *</code> reads every column, and on BigQuery, which bills by bytes scanned, it literally costs more; name only the columns you need.</p>

  <h2 id="dt-acid"><span class="num">10</span>ACID, BASE and CAP</h2>
  <p>Different families also make different promises about correctness, and the differences matter most when money is involved. Biteful refunds Dia's cancelled order: ₹310 must be added to Dia's wallet and taken from Biteful's refund wallet. These two changes must happen together; if the server crashed between them, money would appear from nowhere or vanish. A <strong>transaction</strong> groups both steps into one unit, and <strong>ACID</strong> is the list of promises a relational database makes about it. Below, Biteful's refund wallet holds only ₹200, so the second step breaks the rule that a balance may not go negative. Watch what happens to the first step, which had already succeeded:</p>
  <div class="fx" data-lang="sql">CREATE TABLE wallets (owner TEXT PRIMARY KEY,
                      balance NUMERIC(8,2) CHECK (balance &gt;= 0));
INSERT INTO wallets VALUES ('biteful', 200), ('Dia', 0);

BEGIN;
UPDATE wallets SET balance = balance + 310 WHERE owner = 'Dia';
UPDATE wallets SET balance = balance - 310 WHERE owner = 'biteful';
COMMIT;

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
  <p>Read the output from top to bottom. Dia's wallet was credited (<code>UPDATE 1</code>). Then the debit would have left Biteful at −110, which violates the CHECK constraint, so the database marked the whole transaction as failed. When we then asked for <code>COMMIT</code>, PostgreSQL answered <code>ROLLBACK</code>: a failed transaction cannot be committed, only undone. The final SELECT shows both wallets exactly as they started. Dia did not keep ₹310 that nobody paid; the first step was undone along with the second. That is <strong>atomicity</strong>, and the four promises together are:</p>
  <table class="tbl">
    <tr><th>Promise</th><th>Meaning</th><th>In the refund</th></tr>
    <tr><td><strong>Atomicity</strong></td><td>all steps of a transaction happen, or none do</td><td>credit and debit together, or neither</td></tr>
    <tr><td><strong>Consistency</strong></td><td>every commit leaves the data obeying its rules</td><td>no balance ever below zero</td></tr>
    <tr><td><strong>Isolation</strong></td><td>concurrent transactions do not see each other's unfinished work</td><td>a report never sees Dia credited but Biteful not yet debited</td></tr>
    <tr><td><strong>Durability</strong></td><td>once committed, a change survives a crash</td><td>a power cut cannot undo a completed refund (thanks to the WAL)</td></tr>
  </table>
  <p>Many large NoSQL systems keep several copies of each piece of data on different machines, called <strong>replicas</strong>, so that the system keeps working when a machine fails and can serve reads from whichever copy is nearest. Keeping every replica perfectly in step on every write is slow, so such systems often relax the ACID promises in a style called <strong>BASE</strong>: <strong>B</strong>asically <strong>A</strong>vailable (it always answers), <strong>S</strong>oft state (a value may be in the middle of changing), <strong>E</strong>ventually consistent (replicas may briefly disagree but converge once writes stop). The difference is easy to feel. A refund must be ACID: money must never vanish halfway. A "128 people ordered this today" counter can be BASE: if you see 127 and your friend sees 128 for a second, nobody is harmed.</p>
  <p>Replicas create one more unavoidable dilemma, captured by the <strong>CAP theorem</strong>. Suppose Green Bowl's stock count is kept on two replicas, A and B, which sync over the network, and one Buddha Bowl is left. The network link between them breaks; this is called a <strong>partition</strong>. A customer's request reaches replica A: "is a Buddha Bowl available?" Replica A cannot reach B to check, so it has exactly two options. It can say "I can't confirm right now, please try again" (correct, but not answering), or it can say "yes" from its last known count (answering, but possibly wrong, because B may have just sold the last one):</p>
  <figure class="viz"><svg viewBox="0 0 600 215" width="600">
    <defs><marker id="dt-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="300" y="16" text-anchor="middle" font-size="11" class="tm">A client asks Replica A: "is a Buddha Bowl available?"</text>
    <rect x="60" y="30" width="170" height="54" rx="8" class="fb sb"/>
    <text x="145" y="52" text-anchor="middle" font-weight="bold">Replica A</text><text x="145" y="70" text-anchor="middle" font-size="10" class="tm">thinks stock = 1</text>
    <rect x="370" y="30" width="170" height="54" rx="8" class="fb sb"/>
    <text x="455" y="52" text-anchor="middle" font-weight="bold">Replica B</text><text x="455" y="70" text-anchor="middle" font-size="10" class="tm">just sold it: stock = 0</text>
    <line x1="230" y1="57" x2="370" y2="57" stroke="currentColor" stroke-dasharray="5 4"/>
    <circle cx="300" cy="57" r="13" style="fill:var(--bg)"/><circle cx="300" cy="57" r="13" class="fr sr"/><text x="300" y="62" text-anchor="middle" font-weight="bold" class="tr">✗</text>
    <text x="300" y="98" text-anchor="middle" font-size="10" class="tr">network partition</text>
    <g stroke="currentColor" marker-end="url(#dt-ar2)"><line x1="120" y1="84" x2="120" y2="128"/><line x1="170" y1="84" x2="380" y2="128"/></g>
    <rect x="20" y="130" width="260" height="60" rx="8" class="fg sg"/>
    <text x="150" y="152" text-anchor="middle" font-weight="bold">Choose C: refuse</text>
    <text x="150" y="172" text-anchor="middle" font-size="10" class="tm">"try later": correct, unavailable</text>
    <rect x="320" y="130" width="260" height="60" rx="8" class="fv"/>
    <text x="450" y="152" text-anchor="middle" font-weight="bold">Choose A: answer "yes"</text>
    <text x="450" y="172" text-anchor="middle" font-size="10" class="tm">available, but stale (wrong)</text>
  </svg><figcaption>While the replicas are cut off from each other, replica A cannot be both correct and always answering.</figcaption></figure>
  <p>That is the whole theorem. In a system with replicas, when a network <strong>P</strong>artition happens, each replica must choose between <strong>C</strong>onsistency (every answer reflects the latest write, so refuse if unsure) and <strong>A</strong>vailability (every request gets an answer, even if it may be stale). Payments and stock usually choose consistency: refusing is better than selling the same bowl twice. Carts, feeds and like counters usually choose availability. Systems that lean towards consistency include HBase, etcd, ZooKeeper, Spanner and MongoDB with majority writes; systems that lean towards availability include Cassandra, DynamoDB with default reads, and CouchDB. A single PostgreSQL server has no replicas to disagree, so CAP does not apply to it.</p>
  <p>CAP is often misquoted as "pick any two of three", which is wrong in an important way. Partitions are not optional; networks do fail, so the real choice is only between C and A, and only <em>during</em> a partition. When the network is healthy a system can be both consistent and available. The everyday trade-off is a different one, captured by the <strong>PACELC</strong> extension: "if Partition, choose A or C; Else, choose Latency or Consistency", because waiting for every replica to confirm a write makes it slower. Many systems let you tune this per query: Cassandra and DynamoDB let you choose how many replicas must agree before a read or write counts. Isolation levels inside a single database are a related but separate topic, covered in <a class="xref" data-note="sql_transactions">Transactions</a>.</p>

  <h2 id="dt-choose"><span class="num">11</span>Choosing and Combining Databases</h2>
  <p>We now have eight families, two storage layouts and two styles of guarantee. Choosing among them is a matter of matching the <strong>workload</strong>, meaning what the data looks like and how it will be read and written, to the family whose shape makes that workload cheap. The questions to ask, in roughly this order, are: does this data need multi-row transactions? How will it be queried: by one key, by time range, by words, by similarity, or ad hoc? How many reads and writes per second? Is its shape fixed or varied? And what does the team already know how to run? The table collects the answers for Biteful:</p>
  <table class="tbl">
    <tr><th>Workload</th><th>Biteful example</th><th>Family</th><th>Why</th></tr>
    <tr><td>Orders, payments, users, inventory</td><td>orders, customers, restaurants</td><td>Relational (PostgreSQL)</td><td>transactions, constraints, joins</td></tr>
    <tr><td>Records with varied attributes</td><td>menus</td><td>Document (MongoDB) or JSONB</td><td>flexible shape, whole-object reads</td></tr>
    <tr><td>Cache, sessions, rate limits, online features</td><td>cart, login session</td><td>Key-value, in memory (Redis)</td><td>sub-millisecond lookups by key</td></tr>
    <tr><td>Huge event streams read by key and time</td><td>rider GPS pings</td><td>Wide-column (Cassandra)</td><td>write throughput grows with machines</td></tr>
    <tr><td>Deep, variable relationships</td><td>referral fraud rings</td><td>Graph (Neo4j)</td><td>cheap multi-hop traversal</td></tr>
    <tr><td>Metrics and monitoring</td><td>delivery minutes per hour</td><td>Time-series (TimescaleDB, InfluxDB)</td><td>time buckets, retention</td></tr>
    <tr><td>Search box, log search</td><td>"biryani" search</td><td>Search engine (Elasticsearch)</td><td>inverted index, ranking</td></tr>
    <tr><td>Semantic search, RAG, similar items</td><td>"dishes like this"</td><td>Vector DB or pgvector</td><td>nearest neighbour on embeddings</td></tr>
    <tr><td>Dashboards, analytics, training data</td><td>revenue per restaurant per month</td><td>Warehouse (BigQuery, Snowflake)</td><td>columnar, parallel scans</td></tr>
  </table>
  <p>The table names six different systems for one company, which is normal. Using several databases in one product, each for the job it does best, is called <strong>polyglot persistence</strong> ("polyglot" means speaking many languages). It raises a hard question: if an order lives in PostgreSQL and copies of it live in Redis, Elasticsearch and the warehouse, how do all of them stay in agreement? The tempting answer is for the app to write to each one itself, called <strong>dual writes</strong>. But writes fail independently: if the PostgreSQL write succeeds and the Elasticsearch write fails, the two now disagree, and nothing will ever notice or repair it.</p>
  <p>The reliable design is to choose one system as the <strong>source of truth</strong>, usually the relational database, write each change there once, and let every other store be fed from it. The feed is <strong>change data capture</strong> (CDC): a tool such as Debezium reads every committed change from PostgreSQL's write-ahead log, the same log that makes commits durable, and publishes it as a stream (often through Kafka) that the cache, search index, vector store and warehouse each consume. If a copy falls behind or breaks, it can be rebuilt from the source. A newspaper works this way: one newsroom writes each story once, and the printing press, website, app and archive all receive copies from it; no reporter types the same story into five systems.</p>
  <p>Finally, few companies run all of these servers themselves. A <strong>managed</strong> database is one a cloud provider installs, backs up, patches and scales for you, and job descriptions usually name these products rather than the families, so it helps to map them back:</p>
  <table class="tbl">
    <tr><th>Family</th><th>AWS</th><th>Google Cloud</th><th>Azure and others</th></tr>
    <tr><td>Relational</td><td>RDS (PostgreSQL, MySQL), Aurora</td><td>Cloud SQL, AlloyDB, Spanner</td><td>Azure Database for PostgreSQL, Azure SQL</td></tr>
    <tr><td>Key-value / document</td><td>DynamoDB, DocumentDB</td><td>Firestore, Bigtable (wide-column)</td><td>Cosmos DB, MongoDB Atlas</td></tr>
    <tr><td>Cache</td><td>ElastiCache (Redis)</td><td>Memorystore</td><td>Azure Cache for Redis</td></tr>
    <tr><td>Warehouse</td><td>Redshift</td><td>BigQuery</td><td>Snowflake, Databricks SQL, Synapse</td></tr>
    <tr><td>Search</td><td>OpenSearch Service</td><td>Vertex AI Search</td><td>Elastic Cloud</td></tr>
  </table>
  <p>Three of these come up often enough to know in a sentence. <strong>RDS</strong> runs standard PostgreSQL or MySQL for you, while <strong>Aurora</strong> is Amazon's re-engineered, PostgreSQL- and MySQL-compatible engine with storage shared across machines and faster failover. <strong>DynamoDB</strong> is a serverless key-value and document store with single-digit-millisecond latency at any scale, but you must design tables around your access patterns using a partition key and sort key, much like Cassandra. <strong>BigQuery</strong> is a serverless warehouse billed by the bytes each query scans, while <strong>Snowflake</strong> runs on any cloud and bills storage and compute separately. The sentence interviewers want to hear sums up this whole page: default to PostgreSQL, add a specialist only for a named workload it handles badly, and accept the cost of one more system to run, sync and secure.</p>

  <h2 id="dt-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>A classic time-series mistake is averaging averages. Suppose the dashboard stores only one average per day and later computes "average delivery time this week" by averaging those daily figures. That gives every day equal weight, however many deliveries it had:</p>
  <div class="fx" data-lang="sql">-- wrong: average the daily averages
SELECT ROUND(AVG(avg_minutes), 1) AS avg_of_daily_avgs
FROM (SELECT ordered_at::date, AVG(delivery_minutes) AS avg_minutes
      FROM orders WHERE delivery_minutes IS NOT NULL GROUP BY 1) d;
-- right: keep sums and counts per bucket, divide at the end
SELECT ROUND(SUM(total) / SUM(n), 1) AS true_avg
FROM (SELECT ordered_at::date, SUM(delivery_minutes) AS total, COUNT(delivery_minutes) AS n
      FROM orders WHERE delivery_minutes IS NOT NULL GROUP BY 1) d;</div>
  <div class="fx" data-lang="text"> avg_of_daily_avgs 
-------------------
              34.2
(1 row)

 true_avg 
----------
     36.2
(1 row)</div>
  <p>The average of the daily averages is 34.2 minutes, but the true average over all six measured deliveries is 36.2. The difference comes from 4 March, which had a single fast delivery of 25 minutes yet counted as much as 2 March with three deliveries. The fix is to store the sum and the count for each bucket, as the <code>measured</code> column in section 06 did, and divide only at the end; sums and counts roll up correctly over any period, averages do not.</p>
  <p>A key-value mistake is using <code>KEYS cart:*</code> on a busy production Redis to list carts. Redis runs commands one at a time, and <code>KEYS</code> walks the entire keyspace in one go, so with millions of keys every other request waits until it finishes. The safe alternative is <code>SCAN</code>, which returns a small batch plus a cursor to continue from:</p>
  <div class="fx" data-lang="text">&gt; SCAN 0 MATCH cart:* COUNT 100
1) "0"
2) 1) "cart:ben"
   2) "cart:asha"</div>
  <p>Item 1) of the reply is the cursor for the next call; <code>"0"</code> means the walk is complete, because this small database had only two carts. Item 2) is the list of keys found in this batch. On a large server you would call <code>SCAN</code> repeatedly with the returned cursor, and each call does only a little work. Even then, needing to list values by content is a sign the data belongs in a store that can query it.</p>
  <p>The other common mistakes were shown earlier on this page and need only a reminder. Confusing "wide-column" (Cassandra: rows grouped by key, for writes) with "columnar" (BigQuery: columns stored apart, for scans). Treating Redis as the source of truth for data you cannot afford to lose. Quoting CAP as "pick two of three" instead of "during a partition, choose consistency or availability". Keeping copies in sync with dual writes instead of one write to the source of truth plus CDC. Running <code>SELECT *</code> on a warehouse that bills per byte scanned. Reaching for a graph database for a one- or two-hop question that a recursive SQL query handles. Using <code>LIKE '%word%'</code> as a search engine. And, underneath all of them, choosing a database by popularity or a single benchmark instead of starting from the queries it must answer.</p>

  <h2 id="dt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The families</h3>
  <table class="tbl">
    <tr><th>Family</th><th>Shape</th><th>Cheap question</th><th>Expensive question</th><th>Products</th></tr>
    <tr><td>Relational</td><td>tables + keys, JOIN at query time</td><td>ad-hoc, joins, transactions</td><td>scaling writes over many machines</td><td>PostgreSQL, MySQL</td></tr>
    <tr><td>Document</td><td>nested JSON per record</td><td>read/write one whole object</td><td>many-to-many, cross-document reports</td><td>MongoDB, Firestore</td></tr>
    <tr><td>Key-value</td><td>dictionary, often in RAM</td><td>get by exact key</td><td>anything not by key</td><td>Redis, DynamoDB</td></tr>
    <tr><td>Wide-column</td><td>partition key + clustering key</td><td>huge write streams, read one partition</td><td>ad-hoc queries, joins</td><td>Cassandra, Bigtable</td></tr>
    <tr><td>Graph</td><td>nodes + edges as pointers</td><td>deep, variable hops</td><td>bulk aggregation</td><td>Neo4j, Neptune</td></tr>
    <tr><td>Time-series</td><td>(time, tags, values), time chunks</td><td>per-bucket metrics, retention</td><td>updates, entity relationships</td><td>TimescaleDB, InfluxDB</td></tr>
    <tr><td>Search</td><td>inverted index word → docs</td><td>which docs contain these words, ranked</td><td>being the source of truth</td><td>Elasticsearch</td></tr>
    <tr><td>Vector</td><td>embeddings + ANN index</td><td>similar in meaning</td><td>exact filters, transactions</td><td>pgvector, Pinecone</td></tr>
    <tr><td>Warehouse</td><td>column store + parallel scans</td><td>aggregate few columns over billions of rows</td><td>single-row writes, app serving</td><td>BigQuery, Snowflake</td></tr>
  </table>
  <h3>Key terms</h3>
  <ul>
    <li><b>Partition key</b>: hashed to choose the machine; <b>clustering key</b>: sort order inside the partition.</li>
    <li><b>Inverted index</b>: word → documents. <b>BM25</b>: relevance ranking favouring rare words.</li>
    <li><b>Embedding</b>: model-made vector of numbers; <b>cosine similarity</b> = (a · b) / (|a| |b|), 1 same direction, 0 unrelated.</li>
    <li><b>ANN / HNSW</b>: approximate nearest-neighbour index; trades a little recall for speed.</li>
    <li><b>Row store</b> vs <b>column store</b>: a row's values together vs a column's values together.</li>
    <li><b>ACID</b>: Atomicity, Consistency, Isolation, Durability. <b>BASE</b>: Basically Available, Soft state, Eventually consistent.</li>
    <li><b>CAP</b>: during a network partition, choose Consistency or Availability. <b>PACELC</b>: else, Latency or Consistency.</li>
    <li><b>Polyglot persistence</b>: several databases, one <b>source of truth</b>, copies fed by <b>CDC</b> from its WAL.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">-- PostgreSQL: documents, recursion, time buckets, full-text search
SELECT doc -&gt;&gt; 'restaurant', item -&gt;&gt; 'name'
FROM menus, jsonb_array_elements(doc -&gt; 'items') AS item;
WITH RECURSIVE tree AS (... UNION ALL ... JOIN tree ...) SELECT * FROM tree;
SELECT date_trunc('day', ordered_at), COUNT(x), SUM(x) FROM orders GROUP BY 1;
SELECT item FROM order_items
WHERE to_tsvector('english', item) @@ to_tsquery('english', 'chicken | biryani');

-- Cassandra: partition key (rider_id, day), clustering key ts
PRIMARY KEY ((rider_id, day), ts)

-- Redis
SET cart:asha '{...}' EX 1800     GET cart:asha     INCR views:11     SCAN 0 MATCH cart:*

-- MongoDB
db.menus.find({ "items.spice": "medium" })</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Wide-column is not columnar.</li>
    <li>"Schemaless" means the schema moved into application code.</li>
    <li>Redis is a cache, not the source of truth; use <code>SCAN</code>, never <code>KEYS</code>, in production.</li>
    <li>CAP is not "pick two"; it applies only during a partition.</li>
    <li>Store sums and counts per time bucket; never average averages.</li>
    <li>Dual writes drift; write once and propagate with CDC.</li>
    <li>No <code>SELECT *</code> on a pay-per-byte warehouse.</li>
  </ul>

  <h2 id="dt-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are the main types of databases? Give one use for each.</summary><div class="qa-body">Relational for linked data with transactions, such as orders and payments. Document for records with varying, nested fields, such as product catalogues. Key-value for fast lookups by key, such as sessions and caches. Wide-column for huge write streams read by key, such as IoT events. Graph for multi-hop relationships, such as fraud rings. Time-series for metrics, search engines for full-text search, vector databases for similarity search, and columnar warehouses for analytics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which database would you use for a shopping cart, a product search box and monthly revenue reports?</summary><div class="qa-body">The cart in a key-value store such as Redis, because it is read by user key on every request and can expire. The search box in a search engine such as Elasticsearch, because it needs an inverted index, ranking and typo tolerance. Monthly reports in a columnar warehouse such as BigQuery or Snowflake, because they scan a few columns over all of history.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose MongoDB over PostgreSQL?</summary><div class="qa-body">When the data is naturally a self-contained document with a varying shape that is read and written as a whole, such as a catalogue or user profile, and when you want MongoDB's built-in horizontal scaling. If the data is relational, needs multi-entity transactions or ad-hoc reporting, PostgreSQL fits better, and its JSONB type covers many flexible-field cases. "It's schemaless and faster" is not a reason by itself; ask faster at what.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a wide-column store and a columnar database?</summary><div class="qa-body">A wide-column store such as Cassandra groups rows by partition key and keeps each row's values together; it is built for fast writes and lookups by key. A columnar database such as BigQuery stores each column's values contiguously; it is built for scanning and aggregating a few columns over billions of rows. Similar names, opposite workloads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>SELECT SUM(amount) FROM orders</code> much faster in Snowflake than in PostgreSQL on two billion rows?</summary><div class="qa-body">Snowflake is a column store: it reads only the compressed <code>amount</code> column, skips blocks using stored minimum and maximum values, and spreads the scan across many machines. PostgreSQL is a row store, so it reads every full row to extract one field, mostly on one machine. In our toy example the column store touched 10 values instead of 70.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do partition keys and clustering keys do in Cassandra?</summary><div class="qa-body">The partition key is hashed to decide which node stores a row, and all rows with the same partition key are stored together. The clustering key sorts rows within the partition. Queries must name the partition key so they can go to one node; that is why Cassandra tables are designed one per query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a graph database instead of SQL?</summary><div class="qa-body">When the questions are about paths of deep or unknown length, asked often: accounts within three hops of a known fraudster, friends of friends, recommendation paths. In SQL each hop is another self-join or another round of a recursive query, which grows slow and awkward. A graph database stores neighbour references directly, so each hop costs a pointer lookup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an inverted index?</summary><div class="qa-body">A map from each word (term) to the list of documents that contain it, often with positions. Answering a word query becomes a lookup instead of a scan, and results are ranked with a relevance formula such as BM25. It is the core structure of search engines and of PostgreSQL's GIN-indexed full-text search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a vector database, and when is pgvector enough?</summary><div class="qa-body">A vector database stores embeddings and answers nearest-neighbour queries under a distance such as cosine, usually with an approximate index like HNSW that trades a little recall for large speed-ups. It powers semantic search and RAG. If you already run PostgreSQL and have up to a few million vectors, pgvector with an HNSW index is usually enough and keeps SQL filters, joins and transactions; dedicated systems pay off at much larger scale or query rates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Redis a database or a cache? Can it lose data?</summary><div class="qa-body">It is an in-memory key-value database, most often used as a cache. It can persist data with snapshots or an append-only file, but depending on settings a crash can lose recent writes, up to the last snapshot or about a second with the common append-only setting. Keep the source of truth elsewhere.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain ACID with an example.</summary><div class="qa-body">A refund that credits a customer and debits the company is one transaction. Atomicity: both changes happen or neither does (our refund was rolled back entirely when the debit broke a rule). Consistency: constraints such as "no negative balance" hold after every commit. Isolation: other transactions never see the half-done state. Durability: once committed, a crash cannot undo it, thanks to the write-ahead log.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ACID vs BASE: give one workload for each.</summary><div class="qa-body">ACID for payments, refunds and stock decrements at checkout, where a partial or conflicting result is unacceptable. BASE for like counts, view counters and social feeds, where replicas may disagree for a moment and staying available matters more than being instantly exact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the CAP theorem. Does every database pick two of three?</summary><div class="qa-body">In a replicated system, during a network partition each replica must either refuse requests it cannot confirm (consistency) or answer with possibly stale data (availability). Partitions cannot be ruled out, so the real choice is C or A during a partition; when the network is healthy a system can provide both. The everyday trade-off is latency versus consistency, described by PACELC.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is eventual consistency?</summary><div class="qa-body">A guarantee that if no new writes arrive, all replicas will converge to the same value, but a read in the meantime may return an older value. It lets replicas accept writes and serve reads without waiting for each other. It suits counters and feeds but not balances or stock levels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is polyglot persistence, and how do you keep the databases in sync?</summary><div class="qa-body">Using several specialised databases in one product, each for the workload it handles best. Keep one source of truth, usually the relational database, and feed the others through change data capture: a tool such as Debezium reads committed changes from the database's write-ahead log and streams them to the cache, search index and warehouse. Avoid dual writes from the application, which drift apart when one write fails.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't dashboards query the production PostgreSQL database?</summary><div class="qa-body">Large analytical scans compete with live transactions for CPU, memory and disk, slowing the app for customers, and row storage is inefficient for wide aggregates anyway. A read replica is a short-term relief; the proper fix is a columnar warehouse fed by ETL or CDC.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RDS vs Aurora vs DynamoDB in one line each.</summary><div class="qa-body">RDS is managed standard PostgreSQL or MySQL. Aurora is Amazon's PostgreSQL- and MySQL-compatible engine with distributed shared storage, faster replicas and failover. DynamoDB is a serverless key-value and document store with predictable millisecond latency, but queries must follow the partition and sort keys you designed, with no joins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you design the data layer for a food-delivery app?</summary><div class="qa-body">PostgreSQL as the source of truth for customers, restaurants, orders and payments, with ACID transactions. Redis for carts, sessions and live ETAs. Menus as JSONB or in a document store. A search engine for dish search, and pgvector for "similar dishes". Rider GPS in a wide-column or time-series store. A warehouse for dashboards and model training. Every copy is fed from PostgreSQL by CDC.</div></details>
</main>
`
});
