// notes/dataeng/de_kafka.js — Kafka & Streaming
Object.assign(TOPIC_CONTENT, {
  "de_kafka": `<main>
  <h1>Kafka &amp; Streaming</h1>
  <div class="where"><span>Data Engineering</span><span>Kafka &amp; Streaming</span></div>
  <p class="lead">The nightly ETL and Spark jobs tell Biteful what happened <em>yesterday</em>, but when Asha orders a dosa the restaurant has to start cooking now, a rider has to be assigned now, and the operations screen has to change now. That needs data that moves as <strong>events</strong>, small facts sent seconds after they happen, and <strong>Apache Kafka</strong> is the system most companies use to carry those events from the app to every service that needs them, keep them, and let each service read at its own pace. Throughout this page we use one running example: Biteful's ten orders from the SQL, ETL and Spark notes, replayed as the 19 events the app emits (each order is <code>placed</code>, then <code>delivered</code> or <code>cancelled</code>), sent to a topic called <code>order-events</code> and keyed by order id. Kafka is a server, and no Kafka server runs in these notes, so the real <code>confluent_kafka</code> client code is shown exactly as you would write it but without output, and every mechanism (partitioning, offsets, rebalancing, retries, compaction, watermarks) is demonstrated with a small plain-Python simulation that really runs and is labelled <code>SIMULATION</code>. The one exception is the windows section, where a real Spark Structured Streaming job runs on a laptop and its output is real.</p>

  <h2 id="kf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Kafka &amp; Streaming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why streaming</div>
        <ul>
          <li>Batch: bounded data on a schedule, hours late</li>
          <li>Streaming: unbounded events, handled in seconds</li>
          <li>Event time (when it happened) vs processing time (when we saw it)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The log</div>
        <ul>
          <li>Topic → partitions → append-only logs with <b>offsets</b></li>
          <li><code>hash(key) % partitions</code>: same key, same partition, kept in order</li>
          <li>Reading never deletes; retention or compaction does</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Writing safely</div>
        <ul>
          <li><b>acks</b> 0 / 1 / all; replicas and the ISR</li>
          <li><b>Idempotent producer</b>: retries never duplicate</li>
          <li><code>produce()</code> buffers; <code>flush()</code> waits</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading safely</div>
        <ul>
          <li><b>Consumer group</b>: one owner per partition; rebalance on change</li>
          <li>Commit after processing = <b>at-least-once</b>; make the sink idempotent</li>
          <li>Transactions = exactly-once inside Kafka; <b>lag</b> = end − committed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Computing on streams</div>
        <ul>
          <li><b>Windows</b>: tumbling, hopping, session (by event time)</li>
          <li><b>Watermark</b> = newest event time − allowed lateness</li>
          <li>Spark, Flink, Kafka Streams; Connect moves data in and out</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="kf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch vs Streaming</span><span class="rm-sub">why tomorrow's answer is too late</span></div></div>
      <div class="rm-item rm-done" data-target="kf-log"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Log</span><span class="rm-sub">Kafka's one big idea: append, never consume away</span></div></div>
      <div class="rm-item rm-done" data-target="kf-part"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Topics, Partitions and Keys</span><span class="rm-sub">how events are split and what stays in order</span></div></div>
      <div class="rm-item rm-done" data-target="kf-prod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Producers: acks, Replication, Idempotence</span><span class="rm-sub">when an event is safely stored, exactly once</span></div></div>
      <div class="rm-item rm-done" data-target="kf-group"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Consumer Groups and Rebalancing</span><span class="rm-sub">sharing the reading work</span></div></div>
      <div class="rm-item rm-done" data-target="kf-sem"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Offsets and Delivery Semantics</span><span class="rm-sub">what a crash costs: lost, repeated or once</span></div></div>
      <div class="rm-item rm-done" data-target="kf-ret"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Retention and Compaction</span><span class="rm-sub">how long Kafka keeps events, and which ones</span></div></div>
      <div class="rm-item rm-done" data-target="kf-stream"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Windows and Watermarks</span><span class="rm-sub">totals over endless, late data, in real Spark</span></div></div>
      <div class="rm-item rm-done" data-target="kf-eco"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Kafka Connect and Stream Processors</span><span class="rm-sub">configuration instead of code; Flink, Kafka Streams</span></div></div>
      <div class="rm-item rm-done" data-target="kf-vs"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Kafka vs Message Queues</span><span class="rm-sub">a diary or a to-do list</span></div></div>
      <div class="rm-item rm-done" data-target="kf-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Putting It Together: The Live Board</span><span class="rm-sub">a correct live view under at-least-once delivery</span></div></div>
      <div class="rm-item rm-done" data-target="kf-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">missing keys, wrong clocks, auto-commit, hot keys</span></div></div>
      <div class="rm-item rm-done" data-target="kf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, settings, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="kf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the streaming questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="kf-why"><span class="num">01</span>Batch vs Streaming</h2>
  <p>Everything in the earlier Data Engineering notes was <strong>batch processing</strong>: collect data for a period, then process all of it on a schedule, such as "every night at midnight, load yesterday's orders". The data a batch job reads is <strong>bounded</strong>, meaning it has a clear start and end, and that is what makes batch simple: you can rerun it, test it on a file, and know when it is finished. The cost is delay. Let us first write down Biteful's orders as the app actually produces them, one event each time an order changes:</p>
  <div class="fx" data-lang="py">"""Biteful's 10 orders as the stream of events the app emits."""
from datetime import datetime, timedelta

ORDERS = [  # order_id, restaurant, city, placed at, final status, amount, delivery minutes
    (101, "Dosa Hut", "Pune", "2026-03-02 12:10", "delivered", 240, 32),
    (102, "Biryani Bros", "Mumbai", "2026-03-02 13:05", "delivered", 450, 41),
    (103, "Pizza Point", "Pune", "2026-03-02 20:30", "delivered", 520, 38),
    (104, "Pizza Point", "Pune", "2026-03-03 13:15", "delivered", 380, 45),
    (105, "Green Bowl", "Mumbai", "2026-03-03 19:45", "cancelled", 310, None),
    (106, "Biryani Bros", "Mumbai", "2026-03-04 12:40", "delivered", 180, 25),
    (107, "Pizza Point", "Pune", "2026-03-04 21:10", "cancelled", 260, None),
    (108, "Dosa Hut", "Pune", "2026-03-05 18:20", "delivered", 260, 29),
    (109, "Biryani Bros", "Mumbai", "2026-03-05 20:05", "delivered", 600, 52),
    (110, "Dosa Hut", "Pune", "2026-03-08 20:50", "pending", 310, None),
]

def events():
    out = []
    for oid, rest, city, ts, status, amount, mins in ORDERS:
        t = datetime.fromisoformat(ts)
        base = {"order_id": oid, "restaurant": rest, "city": city, "amount": amount}
        out.append({**base, "event": "placed", "ts": t})
        if status == "delivered":
            out.append({**base, "event": "delivered", "ts": t + timedelta(minutes=mins)})
        elif status == "cancelled":
            out.append({**base, "event": "cancelled", "ts": t + timedelta(minutes=10)})
    out.sort(key=lambda e: e["ts"])
    for e in out:
        e["ts"] = e["ts"].strftime("%Y-%m-%d %H:%M")
    return out


for e in events():
    print(e["ts"], e["order_id"], e["event"], e["restaurant"])</div>
  <div class="fx" data-lang="text">2026-03-02 12:10 101 placed Dosa Hut
2026-03-02 12:42 101 delivered Dosa Hut
2026-03-02 13:05 102 placed Biryani Bros
2026-03-02 13:46 102 delivered Biryani Bros
2026-03-02 20:30 103 placed Pizza Point
2026-03-02 21:08 103 delivered Pizza Point
2026-03-03 13:15 104 placed Pizza Point
2026-03-03 14:00 104 delivered Pizza Point
2026-03-03 19:45 105 placed Green Bowl
2026-03-03 19:55 105 cancelled Green Bowl
2026-03-04 12:40 106 placed Biryani Bros
2026-03-04 13:05 106 delivered Biryani Bros
2026-03-04 21:10 107 placed Pizza Point
2026-03-04 21:20 107 cancelled Pizza Point
2026-03-05 18:20 108 placed Dosa Hut
2026-03-05 18:49 108 delivered Dosa Hut
2026-03-05 20:05 109 placed Biryani Bros
2026-03-05 20:57 109 delivered Biryani Bros
2026-03-08 20:50 110 placed Dosa Hut</div>
  <p>This is our running example for the whole page: 19 events in time order, 10 <code>placed</code>, 7 <code>delivered</code> and 2 <code>cancelled</code>, with order 110 still waiting. Each line is an <strong>event</strong>, one small fact about something that happened at a specific time ("order 101 was placed at Dosa Hut at 12:10"). Now ask a simple question: when does each system first find out about a new order? The nightly batch can only see an order after the next midnight run:</p>
  <div class="fx" data-lang="py">from datetime import datetime, timedelta

# When does each system first KNOW about a new order?
for e in events():
    if e["event"] != "placed":
        continue
    placed = datetime.fromisoformat(e["ts"])
    nightly_run = datetime.combine(placed.date() + timedelta(days=1), datetime.min.time())  # next 00:00
    print(f"order {e['order_id']} placed {e['ts'][5:]}: nightly batch learns of it {nightly_run - placed} later")</div>
  <div class="fx" data-lang="text">order 101 placed 03-02 12:10: nightly batch learns of it 11:50:00 later
order 102 placed 03-02 13:05: nightly batch learns of it 10:55:00 later
order 103 placed 03-02 20:30: nightly batch learns of it 3:30:00 later
order 104 placed 03-03 13:15: nightly batch learns of it 10:45:00 later
order 105 placed 03-03 19:45: nightly batch learns of it 4:15:00 later
order 106 placed 03-04 12:40: nightly batch learns of it 11:20:00 later
order 107 placed 03-04 21:10: nightly batch learns of it 2:50:00 later
order 108 placed 03-05 18:20: nightly batch learns of it 5:40:00 later
order 109 placed 03-05 20:05: nightly batch learns of it 3:55:00 later
order 110 placed 03-08 20:50: nightly batch learns of it 3:10:00 later</div>
  <p>The batch was never wrong, only late: order 107, placed at 21:10, reached it 2 h 50 min later, and order 101, placed at lunch, nearly 12 hours later. For the monthly revenue report that is perfectly fine. For "tell the kitchen", "assign a rider" or "show the customer an ETA" it is useless, because the decision has to be made within seconds. The logic would not change at all; only <em>when</em> it runs.</p>
  <p><strong>Stream processing</strong> is the other way of working: handle each event as soon as it arrives, continuously, forever. The data is <strong>unbounded</strong>: there is no "end of the file", only "everything so far". Think of the difference between the morning newspaper and the live cricket score on your phone. The newspaper is complete, cheap and easy to read, but it tells you yesterday's result. The live score updates within seconds of every ball. You only need the live score if you are going to act on it right now, and the same is true of streaming: it is more expensive to run (it is always on), harder to test and harder to fix after a bug, so the first question in any design is "how quickly does someone really need to act on this?"</p>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Streaming</th></tr>
    <tr><td>Data</td><td>bounded: "yesterday's orders"</td><td>unbounded: events keep coming</td></tr>
    <tr><td>Latency</td><td>minutes to hours</td><td>milliseconds to seconds</td></tr>
    <tr><td>Typical tools</td><td>Airflow + SQL / pandas / Spark</td><td>Kafka + Flink / Spark Structured Streaming / Kafka Streams</td></tr>
    <tr><td>Biteful uses</td><td>daily revenue, model training data</td><td>kitchen tickets, rider dispatch, live dashboards, fresh model features</td></tr>
    <tr><td>Operating cost</td><td>simple, cheap, easy to rerun</td><td>always running, harder to test and backfill</td></tr>
  </table>
  <p>Streaming also introduces a distinction batch could mostly ignore. The <strong>event time</strong> is when something really happened (the rider tapped "delivered" at 14:00). The <strong>processing time</strong> is when our system received it (the rider's phone had no signal, so the event arrived two days later). In a nightly batch both are long in the past by the time the job runs, so the difference rarely matters. In a stream, events arrive late and out of order all the time, and any calculation of the form "revenue per day" has to decide which clock it means. We will come back to this in the windows section; for now, remember that the events carry their own timestamp, the <code>ts</code> field above, and that is the event time.</p>
  <p>So the app must publish each event the moment it happens. The next question is where those events go, because the kitchen notifier, the rider dispatcher, the ETA service and the warehouse loader all need the same events, at different speeds.</p>

  <h2 id="kf-log"><span class="num">02</span>The Log</h2>
  <p>The obvious design is for the app to call each service directly: after saving an order, call the kitchen service, then the rider service, then the warehouse. This breaks quickly. If the warehouse loader is slow, the app waits for it while the customer stares at a spinner. If the kitchen service is down for a minute, its events are simply lost. And when a new ETA service is added next month, it has no history to learn from, and the app has to be changed to call it. The app and its readers are tied together too tightly.</p>
  <p>Kafka's answer is a single, very simple data structure: the <strong>log</strong>. A log here does not mean a debug log file; it means an ordered list of records that is only ever added to at the end. Nothing in it is edited, and, crucially, <em>reading a record does not remove it</em>. Each record gets a position number called its <strong>offset</strong>: the first record is offset 0, the next 1, and so on. The app, called a <strong>producer</strong>, appends events to the log and moves on. Each reader, called a <strong>consumer</strong>, keeps its own bookmark, the offset of the next record it needs, and reads forward from there at its own speed.</p>
  <p>Think of the visitor register at the gate of a housing society. The guard only ever writes new lines at the bottom. The secretary reads it once a week, the police read it after a theft, and each of them keeps a slip saying "I have read up to line 212". Reading never tears out a page, so any number of people can read the same register, and someone who arrives later can start from the first page. Old pages are thrown away only when they become too old, which is Kafka's retention, covered later.</p>
  <p>Here is that idea as a toy log in plain Python. <code>append</code> adds a record and returns its offset, <code>poll</code> returns records starting from a reader's bookmark, and <code>commit</code> moves the bookmark. We feed it Biteful's first events of 2 March:</p>
  <div class="fx" data-lang="py"># A toy log in plain Python (not Kafka): an append-only list plus one bookmark per reader

class Log:
    def __init__(self):
        self.records = []          # the log itself: only ever appended to
        self.committed = {}        # reader group -&gt; next offset it needs

    def append(self, value):
        self.records.append(value)
        return len(self.records) - 1          # the new record's offset

    def poll(self, group, max_n=10):
        start = self.committed.get(group, 0)  # a new group starts at the beginning
        return list(enumerate(self.records))[start:start + max_n]

    def commit(self, group, next_offset):
        self.committed[group] = next_offset

log = Log()
evs = events()
for e in evs[:4]:                                       # 2 March, lunchtime: 4 events
    print("appended at offset", log.append(f"{e['order_id']} {e['event']}"))

batch = log.poll("kitchen-notifier")                    # fast reader
print("kitchen-notifier got:", batch)
log.commit("kitchen-notifier", batch[-1][0] + 1)

batch = log.poll("warehouse-loader", max_n=2)           # slow reader
print("warehouse-loader got:", batch)
log.commit("warehouse-loader", batch[-1][0] + 1)

log.append(f"{evs[4]['order_id']} {evs[4]['event']}")  # 20:30, order 103 is placed
print("bookmarks:", log.committed, "| records in log:", len(log.records))
print("kitchen-notifier next:", log.poll("kitchen-notifier"))
print("warehouse-loader next:", log.poll("warehouse-loader"))
print("new eta-service starts at 0:", log.poll("eta-service")[:2])</div>
  <div class="fx" data-lang="text">appended at offset 0
appended at offset 1
appended at offset 2
appended at offset 3
kitchen-notifier got: [(0, '101 placed'), (1, '101 delivered'), (2, '102 placed'), (3, '102 delivered')]
warehouse-loader got: [(0, '101 placed'), (1, '101 delivered')]
bookmarks: {'kitchen-notifier': 4, 'warehouse-loader': 2} | records in log: 5
kitchen-notifier next: [(4, '103 placed')]
warehouse-loader next: [(2, '102 placed'), (3, '102 delivered'), (4, '103 placed')]
new eta-service starts at 0: [(0, '101 placed'), (1, '101 delivered')]</div>
  <p>Follow the bookmarks. The kitchen notifier read all four records and committed 4, meaning "next time, start at offset 4". The slower warehouse loader read only two and committed 2. When order 103 was placed and appended at offset 4, the kitchen notifier received just that one record, while the warehouse loader still had three to catch up on, and neither reader slowed the other down. Finally, a brand-new ETA service with no bookmark started at offset 0 and read the history from the beginning; this is called <strong>replay</strong>, and it is something a system that deletes messages after reading cannot do.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="kf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="11" text-anchor="middle">
      <rect x="20" y="50" width="70" height="36" class="fs" stroke="currentColor"/><text x="55" y="66">0</text><text x="55" y="80" font-size="9">101 placed</text>
      <rect x="90" y="50" width="70" height="36" class="fs" stroke="currentColor"/><text x="125" y="66">1</text><text x="125" y="80" font-size="9">101 deliv.</text>
      <rect x="160" y="50" width="70" height="36" class="fs" stroke="currentColor"/><text x="195" y="66">2</text><text x="195" y="80" font-size="9">102 placed</text>
      <rect x="230" y="50" width="70" height="36" class="fs" stroke="currentColor"/><text x="265" y="66">3</text><text x="265" y="80" font-size="9">102 deliv.</text>
      <rect x="300" y="50" width="70" height="36" class="fb" stroke="currentColor"/><text x="335" y="66">4 new</text><text x="335" y="80" font-size="9">103 placed</text>
    </g>
    <line x1="470" y1="68" x2="374" y2="68" stroke="currentColor" marker-end="url(#kf-ar)"/>
    <text x="440" y="58" text-anchor="middle" font-size="11">app appends</text>
    <line x1="195" y1="125" x2="195" y2="90" class="sg" stroke-width="2" marker-end="url(#kf-ar)"/>
    <text x="195" y="142" text-anchor="middle" font-size="11" class="tg">warehouse-loader @ 2</text>
    <line x1="335" y1="125" x2="335" y2="90" class="sb" stroke-width="2" marker-end="url(#kf-ar)"/>
    <text x="370" y="142" text-anchor="middle" font-size="11" class="tb">kitchen-notifier @ 4</text>
    <text x="300" y="20" text-anchor="middle" font-size="12" font-weight="bold">one log: records are only appended</text>
  </svg><figcaption>The state after the code above: one log, two bookmarks. Each reader's offset points at the next record it needs.</figcaption></figure>
  <p>The figure shows the moment after order 103 arrived. The records sit in one row and never move; the only things that change are the arrows. That is the whole design of Kafka in one picture, and it is why it is called <strong>log-based messaging</strong>: producers append, consumers read from their own committed offset, reading never deletes, so many independent readers can share one stream and any reader can rewind. Real Kafka keeps the log as files on disk and stores each reader's committed offset in a special internal topic called <code>__consumer_offsets</code>. The most common wrong answer in interviews is "Kafka is a queue"; a queue deletes a message once it has been handled, and Kafka does not, which is the difference the rest of this page builds on.</p>
  <p>One log file on one disk on one machine cannot hold a whole country's orders, though, and one reader cannot keep up with a lunchtime rush. The log has to be split, and the split must not break the order of each order's events: "delivered" must never be read before "placed".</p>

  <h2 id="kf-part"><span class="num">03</span>Topics, Partitions and Keys</h2>
  <p>In Kafka, a named stream of related events is called a <strong>topic</strong>; Biteful's is <code>order-events</code>. A topic is split into a fixed number of <strong>partitions</strong>, and each partition is a separate log exactly like the toy above, with its own offsets starting at 0. Different partitions can live on different <strong>brokers</strong> (a broker is one Kafka server; a group of brokers is a <strong>cluster</strong>), so a topic can grow beyond one machine, and different consumers can read different partitions in parallel.</p>
  <p>Splitting raises the obvious question: which partition does each event go to? If events were scattered at random, order 101's "placed" could land in partition 0 and its "delivered" in partition 1, and a consumer reading partition 1 first would see the delivery of an order that does not exist yet. Kafka solves this with a <strong>key</strong>. Every event can carry a key, and Biteful uses the order id. The producer turns the key into a number with a <strong>hash function</strong> (a function that always gives the same number for the same input, but spreads different inputs evenly), and takes the remainder after dividing by the number of partitions: <code>partition = hash(key) % number_of_partitions</code>. Same key, same number, same partition, every time, so all events of one order land in one log, in the order they were sent.</p>
  <p>A bank with three counters works the same way if it sends customers to a counter by their account number. All of Mr Sharma's deposits go to counter 3, so his passbook entries are always in order. But nobody can say whether counter 1's 10:05 entry came before counter 3's 10:05 entry, because nothing orders the counters against each other. Order exists per counter, not across the bank, and in Kafka order exists per partition, not across the topic.</p>
  <p>The Python client <code>confluent_kafka</code> is built on a C library called librdkafka, whose default partitioner hashes keys with CRC32. Python's <code>zlib.crc32</code> is the same function, so we can work out by hand where each of Biteful's orders will go:</p>
  <div class="fx" data-lang="py">import zlib

def pick_partition(key, num_partitions):
    return zlib.crc32(key.encode()) % num_partitions   # same key -&gt; same number, every time

for order_id in range(101, 111):
    h = zlib.crc32(str(order_id).encode())
    print(f"key '{order_id}': crc32 = {h:&gt;10}   % 3 = {h % 3}   -&gt; partition {pick_partition(str(order_id), 3)}")</div>
  <div class="fx" data-lang="text">key '101': crc32 = 1416650876   % 3 = 2   -&gt; partition 2
key '102': crc32 = 3447271878   % 3 = 0   -&gt; partition 0
key '103': crc32 = 3128820048   % 3 = 0   -&gt; partition 0
key '104': crc32 =  605721843   % 3 = 0   -&gt; partition 0
key '105': crc32 = 1394451557   % 3 = 2   -&gt; partition 2
key '106': crc32 = 3390371295   % 3 = 0   -&gt; partition 0
key '107': crc32 = 3172189513   % 3 = 1   -&gt; partition 1
key '108': crc32 =  766302424   % 3 = 1   -&gt; partition 1
key '109': crc32 = 1521215566   % 3 = 1   -&gt; partition 1
key '110': crc32 =  980181419   % 3 = 2   -&gt; partition 2</div>
  <p>You can check one line yourself: 1,416,650,876 divided by 3 is 472,216,958 with remainder 2, so key 101 goes to partition 2. Partition 0 should therefore receive orders 102, 103, 104 and 106, partition 1 should receive 107, 108 and 109, and partition 2 should receive 101, 105 and 110. Here is a simulated topic that uses exactly this rule, with all 19 events produced in time order:</p>
  <div class="fx" data-lang="py"># SIMULATION: a toy topic in plain Python (no Kafka broker is running here)
import zlib

class Topic:
    def __init__(self, name, num_partitions):
        self.name = name
        self.partitions = [[] for _ in range(num_partitions)]   # one append-only log each

    def produce(self, key, value):
        p = zlib.crc32(key.encode()) % len(self.partitions)      # librdkafka's default rule for keyed messages
        self.partitions[p].append((key, value))
        return p, len(self.partitions[p]) - 1                     # (partition, offset)

topic = Topic("order-events", 3)
for e in events():                                                # in time order, as the app sends them
    topic.produce(str(e["order_id"]), e)

for p, records in enumerate(topic.partitions):
    print(f"partition {p}:")
    print("   " + "  ".join(f"[{off}] {key} {e['event']}" for off, (key, e) in enumerate(records)))</div>
  <div class="fx" data-lang="text">partition 0:
   [0] 102 placed  [1] 102 delivered  [2] 103 placed  [3] 103 delivered  [4] 104 placed  [5] 104 delivered  [6] 106 placed  [7] 106 delivered
partition 1:
   [0] 107 placed  [1] 107 cancelled  [2] 108 placed  [3] 108 delivered  [4] 109 placed  [5] 109 delivered
partition 2:
   [0] 101 placed  [1] 101 delivered  [2] 105 placed  [3] 105 cancelled  [4] 110 placed</div>
  <p>Look at partition 0. Its records are 102 placed (offset 0), 102 delivered (offset 1), 103 placed (offset 2), and so on: every order's events are together and in the right order, which is all the kitchen and the board need. Now compare across partitions. Order 106 was placed on 4 March and sits at offset 6 of partition 0, while order 107, placed later the same evening, sits at offset 0 of partition 1. Offsets in different partitions mean nothing relative to each other, and there is no "global order" of the topic at all. This is the central trade-off of Kafka: a <strong>partition</strong> is both the unit of ordering and the unit of parallelism, and you buy parallelism by giving up any order between keys.</p>
  <p>In the real client, producing an event with a key looks like this. It is shown without output because no broker runs here; against a real cluster each delivery report would print the partition and offset, matching the simulation above:</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Producer
from biteful_events import events

p = Producer({"bootstrap.servers": "broker1:9092,broker2:9092"})

def report(err, msg):                      # called once per message, when the broker has answered
    if err is not None:
        print("FAILED:", err)
    else:
        print(f"key={msg.key().decode()} -&gt; partition {msg.partition()} offset {msg.offset()}")

for e in events():
    p.produce("order-events", key=str(e["order_id"]), value=json.dumps(e), callback=report)
    p.poll(0)                              # serve delivery reports that have arrived
p.flush()                                  # wait until every message is acknowledged</div>
  <p>Two details matter. Messages without a key (<code>key=None</code>) are spread across partitions for throughput, so they have no ordering at all. And the Java client uses a different hash function, murmur2, so if a Java service and a Python service both produce to the same topic, they must agree on one partitioner or the same key will land in different partitions.</p>
  <p>The partition count also matters more than it first appears. Suppose Biteful's traffic grows and someone raises <code>order-events</code> from 3 to 5 partitions:</p>
  <div class="fx" data-lang="py">import zlib

moved = []
for order_id in range(101, 112):
    h = zlib.crc32(str(order_id).encode())
    if h % 3 != h % 5:
        moved.append(f"{order_id}: {h % 3}-&gt;{h % 5}")
print("growing 3 -&gt; 5 partitions moves", len(moved), "of 11 keys:")
print(moved)</div>
  <div class="fx" data-lang="text">growing 3 -&gt; 5 partitions moves 8 of 11 keys:
['101: 2-&gt;1', '102: 0-&gt;3', '103: 0-&gt;3', '104: 0-&gt;3', '107: 1-&gt;3', '108: 1-&gt;4', '110: 2-&gt;4', '111: 2-&gt;1']</div>
  <p>Because the remainder is taken modulo a different number, 8 of 11 keys would now map to a different partition. An order placed just before the change and delivered just after it would have its two events in two different partitions, read by two different consumers in no particular order. For this reason teams choose a partition count with room to grow when they create a topic. A related problem is a <strong>hot key</strong>: if one key carries a huge share of the traffic (a restaurant running a mega-sale, or a default key like <code>"unknown"</code>), its single partition and the single consumer reading it become the bottleneck, which is Kafka's version of the data skew you met in the Spark note.</p>
  <p>The events now land in a predictable place. But the network between the app and the broker can lose a request or a reply, and the broker machine itself can fail. When is it safe for the app to treat an event as stored, and if it retries, can "101 delivered" end up in the log twice?</p>

  <h2 id="kf-prod"><span class="num">04</span>Producers: acks, Replication and Idempotence</h2>
  <p>The first surprise when you use a Kafka producer is that <code>produce()</code> does not send anything. It puts the message into a buffer in your own process and returns immediately; a background thread groups buffered messages into batches and sends them, and later, when the broker answers, the client calls your <strong>delivery report</strong> callback with either the offset or an error. This is what makes producers fast, but it also means "I called produce" is not the same as "the event is stored". We can see this with the real client and no broker at all: nothing is listening on <code>localhost:1</code>, so every message will eventually fail, and we can watch the client honestly report it.</p>
  <div class="fx" data-lang="py"># REAL client, NO broker: nothing listens on localhost:1, so we can watch the client on its own
from confluent_kafka import Producer

p = Producer({"bootstrap.servers": "localhost:1",
              "message.timeout.ms": 1500,         # give up on undelivered messages after 1.5 s
              "log_level": 0})                    # keep librdkafka's connection warnings quiet

results = []
def report(err, msg):
    results.append((msg.key().decode(), err.name() if err else f"offset {msg.offset()}"))

for order_id in (101, 102, 103):
    p.produce("order-events", key=str(order_id), value="placed", callback=report)
print("produce() returned; messages waiting in the local buffer:", len(p))
print("delivery reports so far:", results)

left = p.flush(5)                                 # wait (up to 5 s) for every message to be settled
print("after flush: still buffered =", left)
print("delivery reports:", results)</div>
  <div class="fx" data-lang="text">produce() returned; messages waiting in the local buffer: 3
delivery reports so far: []
after flush: still buffered = 0
delivery reports: [('101', '_MSG_TIMED_OUT'), ('102', '_MSG_TIMED_OUT'), ('103', '_MSG_TIMED_OUT')]</div>
  <p>Right after the three <code>produce()</code> calls, all three messages are still sitting in the local buffer and no delivery report has arrived. <code>flush()</code> waits until every buffered message has been settled one way or the other; here, after the 1.5-second timeout, each one is reported as <code>_MSG_TIMED_OUT</code>. Two lessons follow. A script that exits without calling <code>flush()</code> silently throws away whatever is still in its buffer, and only the delivery report tells you whether an event really reached Kafka. (This output is from the real client library; there was no broker, so it shows the client's behaviour, not a broker's.)</p>
  <p>When a broker does receive a message, when should it reply "stored"? That depends on <strong>replication</strong>. Each partition is copied to several brokers, typically three (the <strong>replication factor</strong>). One copy is the <strong>leader</strong>: producers write to it and consumers read from it. The others are <strong>followers</strong> that continuously copy the leader. The followers that are fully caught up form the <strong>in-sync replica set</strong>, or <strong>ISR</strong>. If the leader's broker dies, one of the in-sync followers becomes the new leader. The producer setting <strong>acks</strong> decides how much of this must happen before the producer is told "done": with <code>acks=0</code> the broker does not reply at all, with <code>acks=1</code> it replies as soon as the leader has written the record, and with <code>acks=all</code> it replies only after every in-sync replica has it.</p>
  <p>Sending a parcel is a good comparison. <code>acks=0</code> is dropping it in a post box with no proof of posting. <code>acks=1</code> is getting a receipt from the counter clerk. <code>acks=all</code> is getting a receipt only after copies of the paperwork are filed in every branch. The difference shows up only when something fails at the wrong moment, as in this sequence:</p>
  <table class="tbl">
    <tr><th>Step</th><th>With acks=1</th><th>With acks=all</th></tr>
    <tr><td>1. Leader writes "101 delivered"</td><td>broker replies "stored" immediately</td><td>broker waits for the followers</td></tr>
    <tr><td>2. Leader's broker crashes before followers copy it</td><td>producer already believes it is stored</td><td>no reply yet, so producer retries</td></tr>
    <tr><td>3. A follower becomes the new leader</td><td>it never had the record: <strong>silently lost</strong></td><td>the retry is written to the new leader</td></tr>
  </table>
  <p>So <code>acks=all</code> is the safe choice and is the default in current clients. It is usually combined with the topic setting <code>min.insync.replicas=2</code>, which makes the broker refuse writes when fewer than two copies are in sync; with three replicas, an acknowledged event then survives the loss of any one broker. The price is latency, because the slowest in-sync follower decides when the reply comes.</p>
  <p>Look again at step 3 of the <code>acks=all</code> column: the producer retried because no reply came. But "no reply" does not always mean "not stored". Sometimes the broker stored the record perfectly and only the reply was lost on the network. A naive retry then writes the same event a second time. This simulation shows the broker's side, with the acknowledgement for "101 delivered" lost once:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): the broker's side of a retry after a lost acknowledgement
def send(batch, idempotent):
    partition, seen = [], set()                  # seen = (producer id, sequence) already written
    for seq, event in enumerate(batch):
        attempts = 2 if seq == 1 else 1          # the ack for message #1 is lost, so it is sent again
        for attempt in range(attempts):
            if idempotent and ("producer-7", seq) in seen:
                print(f"   broker: seq {seq} from producer-7 already written -&gt; drop the retry")
                continue
            partition.append(event)
            seen.add(("producer-7", seq))
    return partition

batch = ["101 placed", "101 delivered", "105 placed"]
for idem in (False, True):
    print(f"enable.idempotence={idem}")
    print("   partition 2 now holds:", send(batch, idem))</div>
  <div class="fx" data-lang="text">enable.idempotence=False
   partition 2 now holds: ['101 placed', '101 delivered', '101 delivered', '105 placed']
enable.idempotence=True
   broker: seq 1 from producer-7 already written -&gt; drop the retry
   partition 2 now holds: ['101 placed', '101 delivered', '105 placed']</div>
  <p>Without protection, the retry put "101 delivered" into the partition twice, and every consumer would see the order delivered twice; a revenue counter would add Dosa Hut's ₹240 twice. The fix is the <strong>idempotent producer</strong>. "Idempotent" means that doing something twice has the same effect as doing it once. When <code>enable.idempotence</code> is on, the broker gives the producer an id, the producer numbers every message it sends to each partition with a <strong>sequence number</strong>, and the broker remembers the last sequence numbers it has written for that producer. A retry carries the same (producer id, sequence) pair, so the broker recognises it and drops the copy, as in the second run. Sequence numbers also stop retries from reordering messages within a partition. A production producer's configuration usually looks like this (shown without output):</p>
  <div class="fx" data-lang="py">from confluent_kafka import Producer

p = Producer({
    "bootstrap.servers": "broker1:9092,broker2:9092,broker3:9092",
    "acks": "all",                   # reply only when every in-sync replica has the record
    "enable.idempotence": True,      # producer id + sequence numbers: retries never duplicate
    "delivery.timeout.ms": 120000,   # keep retrying for up to 2 minutes, then report failure
    "linger.ms": 5,                  # wait up to 5 ms to fill a batch: fewer, bigger requests
    "compression.type": "lz4",       # compress each batch
})</div>
  <p><code>linger.ms</code> and <code>compression.type</code> are throughput settings: waiting a few milliseconds lets the client fill bigger batches, which costs a little latency and saves a lot of network and disk. <code>delivery.timeout.ms</code> is the overall deadline after which a message that still could not be stored is reported as failed in the delivery report, which is where your code must log it or stop.</p>
  <p>Events are now stored safely and exactly once in the log. The reading side has its own problem: one kitchen-notifier process cannot keep up with a national lunch rush, but if we start three copies, how do they split the events without sending the same kitchen ticket three times?</p>

  <h2 id="kf-group"><span class="num">05</span>Consumer Groups and Rebalancing</h2>
  <p>Kafka handles this with a <strong>consumer group</strong>: a set of consumers that share the same <code>group.id</code> and divide a topic's partitions between them, with each partition owned by exactly one member at a time. Because a partition has one owner, no event is handled twice within the group, and because that owner reads the partition in offset order, each order's events are still processed in order. Different groups are completely independent: the <code>kitchen-notifier</code> group and the <code>warehouse-loader</code> group each receive every event, each with its own committed offsets, which is the "many readers" property of the log at work.</p>
  <p>Picture an exam with answer sheets from three classrooms, and a team of examiners. Each classroom's bundle goes to exactly one examiner, so no sheet is marked twice. When a second examiner arrives, the head examiner hands one bundle over. If an examiner goes home sick, their bundles are given to the others. The moderation board is a separate team: it sees every sheet too, without disturbing the examiners. And a fourth examiner, with only three bundles to go round, has nothing to do.</p>
  <p>Redistributing partitions when the group changes is called a <strong>rebalance</strong>. It happens when a consumer joins, when one leaves cleanly, and when one is presumed dead because it stopped sending <strong>heartbeats</strong> (regular "I'm alive" signals). One broker acts as the group's <strong>coordinator</strong> and tracks membership; one member computes the new assignment using an <strong>assignment strategy</strong>. The simplest is "range": sort the members, and give each a consecutive block of partitions, with the first members getting one extra if the numbers do not divide evenly. Here it is by hand, applied to the life of a kitchen-notifier group on our 3-partition topic:</p>
  <div class="fx" data-lang="py"># The "range" rule by hand: sort the members, give each a consecutive block of partitions
def range_assign(partitions, members):
    members = sorted(members)
    per, extra = divmod(len(partitions), len(members))
    out, start = {}, 0
    for i, m in enumerate(members):
        n = per + (1 if i &lt; extra else 0)          # the first "extra" members get one more
        out[m] = partitions[start:start + n]
        start += n
    return out

# SIMULATION of a group's life: who owns which partition of order-events after each change
timeline = [("A starts", ["A"]), ("B joins", ["A", "B"]), ("C joins", ["A", "B", "C"]),
            ("D joins", ["A", "B", "C", "D"]), ("B crashes", ["A", "C", "D"])]
for what, members in timeline:
    print(f"{what:10} -&gt; {range_assign([0, 1, 2], members)}")</div>
  <div class="fx" data-lang="text">A starts   -&gt; {'A': [0, 1, 2]}
B joins    -&gt; {'A': [0, 1], 'B': [2]}
C joins    -&gt; {'A': [0], 'B': [1], 'C': [2]}
D joins    -&gt; {'A': [0], 'B': [1], 'C': [2], 'D': []}
B crashes  -&gt; {'A': [0], 'C': [1], 'D': [2]}</div>
  <p>Read it line by line. Alone, A owns all three partitions. When B joins, the partitions are split 2 + 1, and when C joins each member owns one. When D joins, there is no partition left for it, so D sits idle: <em>the useful size of a group is at most the number of partitions</em>, which is another reason the partition count is chosen with care. When B crashes, its partition is not lost; the next rebalance gives it to someone else, and the idle D finally gets work. In the real system, the new owner of B's partition starts reading from B's last <em>committed</em> offset, which is the subject of the next section.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="kf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="70" y="18" text-anchor="middle" font-weight="bold">order-events</text>
    <rect x="20" y="30" width="100" height="32" rx="4" class="fs"/><text x="70" y="51" text-anchor="middle">P0</text>
    <rect x="20" y="80" width="100" height="32" rx="4" class="fs"/><text x="70" y="101" text-anchor="middle">P1</text>
    <rect x="20" y="130" width="100" height="32" rx="4" class="fs"/><text x="70" y="151" text-anchor="middle">P2</text>
    <rect x="240" y="22" width="150" height="150" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <text x="315" y="190" text-anchor="middle" font-size="11">group "kitchen-notifier"</text>
    <rect x="265" y="40" width="100" height="36" rx="6" class="fb"/><text x="315" y="63" text-anchor="middle">consumer A</text>
    <rect x="265" y="115" width="100" height="36" rx="6" class="ft"/><text x="315" y="138" text-anchor="middle">consumer B</text>
    <g stroke="currentColor" marker-end="url(#kf-ar2)">
      <line x1="120" y1="46" x2="263" y2="56"/>
      <line x1="120" y1="96" x2="263" y2="64"/>
      <line x1="120" y1="146" x2="263" y2="134"/>
    </g>
    <rect x="440" y="70" width="150" height="36" rx="6" class="fv"/><text x="515" y="93" text-anchor="middle">"warehouse-loader"</text>
    <text x="515" y="125" text-anchor="middle" font-size="11" class="tm">separate group:</text>
    <text x="515" y="140" text-anchor="middle" font-size="11" class="tm">gets ALL partitions too</text>
  </svg><figcaption>The "B joins" line above: A owns P0 and P1, B owns P2. Another group reads every partition independently.</figcaption></figure>
  <p>The figure is the second line of the output. Each partition has exactly one arrow into the kitchen-notifier group, while the warehouse-loader group, drawn separately, has its own arrows to all three partitions (not drawn) and its own bookmarks. In real code you never compute assignments yourself; you call <code>subscribe()</code> and Kafka tells you what you own through callbacks. This is a real consumer, shown without output:</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "broker1:9092",
              "group.id": "kitchen-notifier",        # same group id = share the partitions
              "auto.offset.reset": "earliest"})      # no committed offset yet? start at the beginning

def on_assign(consumer, partitions):
    print("now own", [p.partition for p in partitions])

def on_revoke(consumer, partitions):
    print("giving up", [p.partition for p in partitions])   # last chance to commit finished work

c.subscribe(["order-events"], on_assign=on_assign, on_revoke=on_revoke)
try:
    while True:
        msg = c.poll(1.0)                            # fetch AND tell the group "I'm alive"
        if msg is None or msg.error():
            continue
        e = json.loads(msg.value())
        if e["event"] == "placed":
            print(f"ticket for {e['restaurant']}: order {e['order_id']}")
finally:
    c.close()                                        # leave the group cleanly: fast rebalance</div>
  <p><code>on_assign</code> is called after each rebalance with the partitions this process now owns, and <code>on_revoke</code> just before it loses some, which is the right moment to commit work that is finished. Notice that <code>poll()</code> does two jobs: it fetches records and it keeps the consumer's membership alive. If one call to your processing code takes longer than <code>max.poll.interval.ms</code> (five minutes by default), for example because it calls a slow model for every event, the group decides the consumer is dead and rebalances; the partition goes to another member, which re-reads the same uncommitted events, is just as slow, and the group can loop like this indefinitely, a so-called <strong>rebalance storm</strong>. Keep the work per poll small, or raise the limit deliberately.</p>
  <p>The range strategy is "eager": every member gives up all its partitions during a rebalance, so the whole group pauses briefly. Newer strategies such as <strong>cooperative-sticky</strong> move only the partitions that must change hands and let everyone keep reading the rest. Either way, a new owner must know exactly where the previous owner stopped, and if the old owner had sent order 103's ticket but not yet saved its bookmark, the question becomes: is 103 sent twice, or lost?</p>

  <h2 id="kf-sem"><span class="num">06</span>Offsets and Delivery Semantics</h2>
  <p>For every event, a consumer does two separate things: it <strong>processes</strong> the event (sends the kitchen ticket, writes to the warehouse) and it <strong>commits</strong> the offset (saves its bookmark in Kafka). A <strong>committed offset</strong> is the offset of the next record the group needs from that partition. A crash can happen between those two steps, and what happens to that one event depends entirely on which step came first. Think of reading a textbook with a bookmark: if you move the bookmark first and then fall asleep, you wake up past a page you never read; if you read first and fall asleep before moving the bookmark, you read one page again. This simulation crashes the kitchen notifier once, between its two steps, at order 103, and restarts it from the committed offset exactly as a real consumer would:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): the kitchen-notifier crashes once, between its two steps, at offset 2
def run(steps):
    log = ["101 placed", "102 placed", "103 placed", "104 placed", "105 placed"]
    committed, tickets, crashed = 0, [], False
    while committed &lt; len(log):
        offset = committed                     # (re)start from the committed offset
        for i, step in enumerate(steps):
            if step == "commit":
                committed = offset + 1
            else:                              # "process": send the kitchen ticket
                tickets.append(log[offset][:3])
            if offset == 2 and i == 0 and not crashed:
                crashed = True                 # crash after the FIRST step for order 103
                break
    return tickets

print("commit, then process -&gt; tickets sent:", run(["commit", "process"]))
print("process, then commit -&gt; tickets sent:", run(["process", "commit"]))</div>
  <div class="fx" data-lang="text">commit, then process -&gt; tickets sent: ['101', '102', '104', '105']
process, then commit -&gt; tickets sent: ['101', '102', '103', '103', '104', '105']</div>
  <p>With "commit, then process", the bookmark had already moved past 103 when the crash happened, so after the restart the consumer began at 104 and order 103's ticket was <em>never sent</em>. This is called <strong>at-most-once</strong> delivery: each event is processed once or not at all. With "process, then commit", the ticket for 103 had been sent but the bookmark had not moved, so after the restart the consumer read 103 again and sent the ticket <em>twice</em>. This is <strong>at-least-once</strong> delivery: nothing is lost, but some events are processed more than once. These names, plus a third, <strong>exactly-once</strong>, are called <strong>delivery semantics</strong>, and they describe what a failure costs.</p>
  <p>At-least-once is the normal choice, because a lost order is much worse than a repeated one, and repeats can be made harmless. A repeated ticket is harmless if the kitchen system ignores a ticket it has already received; a repeated warehouse row is harmless if the load is an <strong>upsert</strong> (insert or update by a key) rather than a plain insert. This is exactly the idempotency idea from the <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a> note, applied to one event instead of one batch. In real code, at-least-once means turning off automatic commits and committing after processing (shown without output):</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "broker1:9092",
              "group.id": "warehouse-loader",
              "auto.offset.reset": "earliest",
              "enable.auto.commit": False})          # WE decide when the bookmark moves
c.subscribe(["order-events"])

def load_into_warehouse(event):                     # must be idempotent: upsert by (order_id, event)
    ...

while True:
    msg = c.poll(1.0)
    if msg is None or msg.error():
        continue
    load_into_warehouse(json.loads(msg.value()))    # 1. process
    c.commit(message=msg, asynchronous=False)       # 2. then commit: at-least-once</div>
  <p>The setting <code>enable.auto.commit</code> deserves a warning. When it is true (the default), the client commits the offsets of whatever <code>poll()</code> has returned on a timer, every five seconds, whether or not your code has finished with those records. If your code hands records to another thread or writes them in batches, a crash after the timer fired and before the write completed loses those events: at-most-once by accident. Committing explicitly, after the work is done, removes that surprise.</p>
  <p>Committed offsets also tell you whether a group is keeping up. The <strong>log-end offset</strong> of a partition is the offset the next new record will get, and the <strong>lag</strong> is the log-end offset minus the group's committed offset: the number of records written but not yet processed. Here the warehouse loader has processed everything, and then Gita places her first order, 111, at Momo Magic:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): lag = log-end offset - committed offset, per partition

topic = Topic("order-events", 3)                    # the toy topic from the partitions section
for e in events():
    topic.produce(str(e["order_id"]), e)

# warehouse-loader has processed and committed everything so far
committed = {p: len(records) for p, records in enumerate(topic.partitions)}

# Gita places order 111 at Momo Magic: two new events
for event in ("placed", "delivered"):
    p, off = topic.produce("111", {"order_id": 111, "event": event})
    print(f"order 111 {event:9} -&gt; partition {p}, offset {off}")

print("partition  committed  log-end  lag")
for p, records in enumerate(topic.partitions):
    print(f"{p:&gt;9}  {committed[p]:&gt;9}  {len(records):&gt;7}  {len(records) - committed[p]:&gt;3}")</div>
  <div class="fx" data-lang="text">order 111 placed    -&gt; partition 2, offset 5
order 111 delivered -&gt; partition 2, offset 6
partition  committed  log-end  lag
        0          8        8    0
        1          6        6    0
        2          5        7    2</div>
  <p>Key 111 hashes to partition 2, which now ends at offset 7, while the group's committed offset there is still 5, so the lag is 2: exactly the two new events. On a real cluster the same numbers come from <code>kafka-consumer-groups.sh --describe --group warehouse-loader</code> or a monitoring dashboard. Lag that rises and falls is healthy. Lag that keeps growing means the consumers are slower than the producers, and lag growing on just one partition usually means a hot key.</p>
  <p>Can we avoid both loss and duplicates entirely? Within Kafka, yes, using <strong>transactions</strong>. Consider a ticket printer that reads <code>order-events</code> and writes a ticket for each <code>placed</code> event to another topic, <code>kitchen-tickets</code>. Its output is a Kafka write, and its progress (the committed offset) is also a Kafka write. A transaction makes both one all-or-nothing step: the tickets and the new offsets become visible together, or, if the process crashes before committing the transaction, neither does, and the restarted process redoes the batch from the old offsets. Consumers downstream set <code>isolation.level=read_committed</code> so they never see records from a transaction that was aborted. The real code looks like this (shown without output):</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer, Producer

c = Consumer({"bootstrap.servers": "broker1:9092", "group.id": "ticket-printer",
              "enable.auto.commit": False,
              "isolation.level": "read_committed"})       # never read aborted transactions
p = Producer({"bootstrap.servers": "broker1:9092",
              "transactional.id": "ticket-printer-1"})   # stable identity across restarts
p.init_transactions()                                    # register; fences any old "zombie" copy
c.subscribe(["order-events"])

while True:
    msgs = c.consume(num_messages=100, timeout=1.0)
    if not msgs:
        continue
    p.begin_transaction()
    for m in msgs:
        e = json.loads(m.value())
        if e["event"] == "placed":                       # every new order becomes a kitchen ticket
            p.produce("kitchen-tickets", key=m.key(),
                      value=json.dumps({"order_id": e["order_id"], "restaurant": e["restaurant"]}))
    # the consumer's new offsets are written INSIDE the same transaction
    p.send_offsets_to_transaction(c.position(c.assignment()), c.consumer_group_metadata())
    p.commit_transaction()                               # tickets + offsets visible together, or neither</div>
  <p>The <code>transactional.id</code> gives the producer a stable identity. If a frozen old copy of the program wakes up after a new copy has taken over, the broker sees the same id with an older "epoch" and rejects its writes; this is called <strong>fencing</strong>, and it stops "zombie" processes from adding duplicates. This combination, idempotent producer plus transactions plus <code>read_committed</code>, is what Kafka calls <strong>exactly-once semantics</strong>. Its limit is important: it covers only reads and writes to Kafka itself. If the consumer writes to Postgres or sends an SMS, Kafka cannot roll that back, so for external systems "exactly-once" in practice means at-least-once delivery plus an idempotent write (upsert by event id), which gives an <em>effectively once</em> result.</p>
  <table class="tbl">
    <tr><th>Semantics</th><th>How you get it</th><th>A crash causes</th><th>Use when</th></tr>
    <tr><td>At-most-once</td><td>commit before processing (or careless auto-commit)</td><td>lost events</td><td>losing a few metrics or logs is acceptable</td></tr>
    <tr><td><strong>At-least-once</strong></td><td>auto-commit off; process, then commit</td><td>repeated events</td><td>the usual default; make the sink idempotent</td></tr>
    <tr><td>Exactly-once</td><td>Kafka → Kafka: transactions; to an external system: at-least-once + idempotent writes</td><td>nothing visible</td><td>billing, payments, counters</td></tr>
  </table>
  <p>Since reading never deletes anything, the log only grows. How long does Kafka keep events, and could a topic hold just the current status of each order instead of its whole history?</p>

  <h2 id="kf-ret"><span class="num">07</span>Retention and Compaction</h2>
  <p>A log that keeps every event forever will eventually fill every disk, so each topic has a <strong>cleanup policy</strong> that decides what may be thrown away. The default policy, <code>cleanup.policy=delete</code>, is called <strong>retention</strong>: events are kept for a set time (<code>retention.ms</code>, seven days by default) or until the partition reaches a set size (<code>retention.bytes</code>), and older data is deleted. Retention is like a CCTV recorder that overwrites footage older than a week: it does not care what is in the footage, only how old it is.</p>
  <p>To delete efficiently, Kafka stores each partition not as one file but as a series of files called <strong>segments</strong>. New records are written to the newest, <strong>active</strong> segment; when it reaches a size or age limit it is closed and a new one begins. Retention deletes whole closed segments, never single records, and a segment is deleted only when even its newest record is past the limit. This simulation applies a five-day retention to our 19 events, stored in segments of four records:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): retention deletes whole old segments, never single records
from datetime import datetime, timedelta

SEGMENT_SIZE = 4                                 # real segments are files of ~1 GB; 4 records here
records = [(off, e["ts"], f"{e['order_id']} {e['event']}") for off, e in enumerate(events())]
segments = [records[i:i + SEGMENT_SIZE] for i in range(0, len(records), SEGMENT_SIZE)]

now = datetime(2026, 3, 10, 12, 0)
cutoff = (now - timedelta(days=5)).strftime("%Y-%m-%d %H:%M")    # retention.ms = 5 days here
print("cutoff:", cutoff)
for seg in segments:
    newest = seg[-1][1]                          # a segment goes only when its NEWEST record is too old
    verdict = "DELETE" if newest &lt; cutoff else "keep  "
    print(f"{verdict} segment offsets {seg[0][0]:&gt;2}-{seg[-1][0]:&gt;2}   oldest {seg[0][1]}   newest {newest}")</div>
  <div class="fx" data-lang="text">cutoff: 2026-03-05 12:00
DELETE segment offsets  0- 3   oldest 2026-03-02 12:10   newest 2026-03-02 13:46
DELETE segment offsets  4- 7   oldest 2026-03-02 20:30   newest 2026-03-03 14:00
DELETE segment offsets  8-11   oldest 2026-03-03 19:45   newest 2026-03-04 13:05
keep   segment offsets 12-15   oldest 2026-03-04 21:10   newest 2026-03-05 18:49
keep   segment offsets 16-18   oldest 2026-03-05 20:05   newest 2026-03-08 20:50</div>
  <p>The first three segments contain only records older than the cutoff of 5 March 12:00, so they are deleted whole. The fourth segment starts with order 107's events from the evening of 4 March, which are older than the cutoff, but it is kept because its newest record (5 March 18:49) is not, so retention is "at least this long", never "exactly this long". The consequence for consumers is serious: a consumer group that falls further behind than the retention period finds that the records at its committed offset no longer exist, and it has to jump forward (losing data) or back to the earliest available record, as decided by <code>auto.offset.reset</code>.</p>
  <p>Some topics should not be cleaned by age at all. The rider app does not need the full history of each order, only its <em>current</em> status, and an order whose status has not changed for a week must not disappear. For this Kafka offers <code>cleanup.policy=compact</code>, called <strong>log compaction</strong>: a background process, the <strong>log cleaner</strong>, keeps at least the most recent record for every key and removes older records with the same key. The topic then behaves like a table of "latest value per key". To delete a key completely, a producer writes a record with that key and an empty (null) value, called a <strong>tombstone</strong>. A school's contact register is a good picture: when a parent's phone number changes, the old line is struck out and only the newest number remains, and when a student leaves, a "left school" line is added, after which that student's lines are removed. This simulation compacts a topic <code>order-status</code> holding every status change, plus a tombstone for cancelled order 105:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): what the log cleaner does to a compacted topic "order-status"

log = [(off, str(e["order_id"]), e["event"]) for off, e in enumerate(events())]
log.append((len(log), "105", None))              # tombstone (value None): "forget order 105"

def compact(log, drop_tombstones=False):
    newest = {}                                  # key -&gt; offset of its newest record
    for off, key, value in log:
        newest[key] = off
    kept = [(off, k, v) for off, k, v in log if newest[k] == off]   # offsets are NOT renumbered
    if drop_tombstones:                          # once delete.retention.ms has passed
        kept = [(off, k, v) for off, k, v in kept if v is not None]
    return kept

first = compact(log)
print(f"before: {len(log)} records   after cleaning: {len(first)} records")
for off, key, value in first:
    print(f"  offset {off:&gt;2}  key {key}  {value}")
print("later, tombstones removed too:", [k for _, k, _ in compact(log, drop_tombstones=True)])</div>
  <div class="fx" data-lang="text">before: 20 records   after cleaning: 10 records
  offset  1  key 101  delivered
  offset  3  key 102  delivered
  offset  5  key 103  delivered
  offset  7  key 104  delivered
  offset 11  key 106  delivered
  offset 13  key 107  cancelled
  offset 15  key 108  delivered
  offset 17  key 109  delivered
  offset 18  key 110  placed
  offset 19  key 105  None
later, tombstones removed too: ['101', '102', '103', '104', '106', '107', '108', '109', '110']</div>
  <p>Before cleaning there were 20 records; afterwards there are 10. Each order kept only its last status: order 101 is now just "delivered" at offset 1, and its "placed" record at offset 0 is gone. The offsets did not change. Compaction leaves gaps; it never renumbers, so a consumer's committed offset still means the same thing. Order 105's "placed" and "cancelled" records were removed because a newer record for key 105 exists, the tombstone. The tombstone itself is kept for a while (<code>delete.retention.ms</code>, one day by default) so that consumers reading the topic learn that 105 was deleted; after that it is removed too, as the last line shows. In real Kafka the active segment is never cleaned, so a reader can still see several versions of a recently updated key, and consumers must always treat a compacted topic as "the latest record per key wins".</p>
  <p>Compacted topics are how Kafka stores state. Kafka's own <code>__consumer_offsets</code> topic is compacted (only the latest committed offset per group and partition matters), and stream processors back up their state to compacted topics. A new rider app can rebuild "current status of every order" by reading a compacted topic from the start, which is far quicker than replaying the full history. The opposite mistake is also common: a consumer that needs every event, like the warehouse loader, must never read a compacted topic, because the history it needs has been cleaned away.</p>
  <table class="tbl">
    <tr><th></th><th>Retention (<code>delete</code>)</th><th>Compaction (<code>compact</code>)</th></tr>
    <tr><td>What is removed</td><td>whole old segments, by age or size</td><td>older records that have a newer record with the same key</td></tr>
    <tr><td>What the topic represents</td><td>a history of events</td><td>the current state per key</td></tr>
    <tr><td>Delete a key</td><td>not possible; wait for retention</td><td>write a tombstone (null value)</td></tr>
    <tr><td>Biteful example</td><td><code>order-events</code> for the warehouse and replays</td><td><code>order-status</code> for the rider app</td></tr>
  </table>
  <p>Events are now stored, shared, de-duplicated and kept for the right time. The next step is to compute answers on the stream itself, such as delivered revenue per city per day, updated as deliveries happen. But the stream never ends and some events arrive days late. When is "3 March's revenue" finished?</p>

  <h2 id="kf-stream"><span class="num">08</span>Windows and Watermarks</h2>
  <p>A batch job can compute "total delivered revenue" because it knows where the data ends. On a stream there is no end, so a plain total never becomes final, and you cannot group "all events of 3 March" without knowing whether more are still coming. Stream processors solve this with two ideas that work together.</p>
  <p>A <strong>window</strong> cuts the endless stream into finite pieces by event time, so that each piece can have a finished answer. The three common kinds are easiest to see on a single timestamp. A <strong>tumbling window</strong> is a fixed, non-overlapping slot, like "each hour" or "each calendar day"; every event belongs to exactly one. A <strong>hopping window</strong> (also called a sliding window in some tools) has a fixed size but starts at regular steps that are shorter than its size, like "the last 60 minutes, recomputed every 15 minutes"; windows overlap, so one event belongs to several. A <strong>session window</strong> has no fixed size: it groups events that are close together and closes after a gap with no activity, which suits user behaviour like app sessions.</p>
  <div class="fx" data-lang="py"># Which windows does an event belong to? (plain Python)
from datetime import datetime, timedelta

def tumbling(t, size):
    start = datetime.min + ((t - datetime.min) // size) * size
    return [(start, start + size)]

def hopping(t, size, hop):
    first = datetime.min + ((t - datetime.min) // hop) * hop    # the latest window starting at or before t
    out, start = [], first
    while start + size &gt; t:
        out.insert(0, (start, start + size))
        start -= hop
    return out

t = datetime(2026, 3, 2, 12, 42)                                # 101 delivered
fmt = lambda ws: ", ".join(f"{a:%H:%M}-{b:%H:%M}" for a, b in ws)
print("tumbling 1 h          :", fmt(tumbling(t, timedelta(hours=1))))
print("hopping 1 h every 15 m:", fmt(hopping(t, timedelta(hours=1), timedelta(minutes=15))))

# session windows: a gap of more than 30 minutes with no events closes the session
taps = ["12:10", "12:12", "12:20", "13:30", "13:31"]             # one user's app taps
sessions, current = [], [taps[0]]
for prev, nxt in zip(taps, taps[1:]):
    gap = datetime.strptime(nxt, "%H:%M") - datetime.strptime(prev, "%H:%M")
    if gap &gt; timedelta(minutes=30):
        sessions.append(current); current = []
    current.append(nxt)
sessions.append(current)
print("session, 30 m gap     :", sessions)</div>
  <div class="fx" data-lang="text">tumbling 1 h          : 12:00-13:00
hopping 1 h every 15 m: 11:45-12:45, 12:00-13:00, 12:15-13:15, 12:30-13:30
session, 30 m gap     : [['12:10', '12:12', '12:20'], ['13:30', '13:31']]</div>
  <p>Order 101's delivery at 12:42 falls in one tumbling hour, 12:00–13:00, but in four overlapping hopping windows, because every window that started within the hour before 12:42 still contains it. The session example groups one user's taps into two sessions because the 70-minute gap between 12:20 and 13:30 is longer than the 30-minute limit.</p>
  <p>The second idea answers "how long do we wait for stragglers?". A <strong>watermark</strong> is the stream processor's estimate of how far event time has progressed: the newest event time seen so far, minus an <strong>allowed lateness</strong> you choose. Any window that ends before the watermark is considered complete; its result is final, its memory can be freed, and an event that arrives later for it is dropped. Think of a teacher who accepts Monday's homework until Wednesday evening. Monday is the window, "up to two days late is fine" is the allowed lateness, and once Wednesday evening passes, Monday's marks are final and a sheet handed in on Thursday is not counted.</p>
  <p>Here is the idea in plain Python, before any framework is involved. We take the seven delivered events and sum them into one-day tumbling windows per city, but order 104's delivery event is stuck on a rider's phone without signal and arrives last, after the 5 March events. We run it with two different allowed latenesses:</p>
  <div class="fx" data-lang="py"># SIMULATION in plain Python: one-day tumbling windows per city, with a watermark
from datetime import datetime, timedelta

delivered = [e for e in events() if e["event"] == "delivered"]
late = next(e for e in delivered if e["order_id"] == 104)      # stuck on an offline phone...
arrivals = [e for e in delivered if e is not late] + [late]     # ...so it arrives last

def run(allowed_lateness):
    max_seen, revenue = None, {}
    for e in arrivals:
        t = datetime.fromisoformat(e["ts"])                     # EVENT time, from the event itself
        max_seen = t if max_seen is None else max(max_seen, t)
        watermark = max_seen - allowed_lateness                 # "nothing older should still come"
        day = t.date()                                          # its tumbling window: one calendar day
        window_end = datetime.combine(day + timedelta(days=1), datetime.min.time())
        if window_end &lt;= watermark:
            print(f"  order {e['order_id']} (event time {e['ts']}) arrives; watermark is"
                  f" {watermark:%m-%d %H:%M}; window {day:%m-%d} is closed -&gt; DROPPED")
            continue
        key = (f"{day:%m-%d}", e["city"])
        revenue[key] = revenue.get(key, 0) + e["amount"]
    return dict(sorted(revenue.items()))

for lateness in (timedelta(days=1), timedelta(days=3)):
    print(f"allowed lateness {lateness.days} day(s):")
    print("  ", run(lateness))</div>
  <div class="fx" data-lang="text">allowed lateness 1 day(s):
  order 104 (event time 2026-03-03 14:00) arrives; watermark is 03-04 20:57; window 03-03 is closed -&gt; DROPPED
   {('03-02', 'Mumbai'): 450, ('03-02', 'Pune'): 760, ('03-04', 'Mumbai'): 180, ('03-05', 'Mumbai'): 600, ('03-05', 'Pune'): 260}
allowed lateness 3 day(s):
   {('03-02', 'Mumbai'): 450, ('03-02', 'Pune'): 760, ('03-03', 'Pune'): 380, ('03-04', 'Mumbai'): 180, ('03-05', 'Mumbai'): 600, ('03-05', 'Pune'): 260}</div>
  <p>Trace the drop. When 104's event (event time 3 March 14:00) finally arrives, the newest event time seen is 109's delivery at 5 March 20:57. With one day of allowed lateness the watermark is therefore 4 March 20:57, which is already past the end of the 3 March window (midnight at the start of 4 March), so the window was closed and Pune's ₹380 for 3 March is dropped. With three days of lateness the watermark is 2 March 20:57, the 3 March window is still open, 104 is counted, and the result is exactly the gold table from the ETL note: 2 March Pune 760 and Mumbai 450, 3 March Pune 380, 4 March Mumbai 180, 5 March Pune 260 and Mumbai 600. The trade-off is clear: more allowed lateness gives more correct results but keeps more windows open in memory for longer and delays the moment a result is final.</p>
  <p>Stream processors do this for you, and keep the state safe across restarts. The next program is a <strong>real</strong> Spark Structured Streaming job, run in local mode on two cores. Because there is no Kafka broker here, its source is a folder that receives the delivered events as three files, read one file per <strong>micro-batch</strong> (Spark processes a stream as a series of small batches); the late 104 event is in the last file. Everything after the source, the event-time column, the watermark and the window, is exactly what you would write against Kafka. It takes about 20 seconds to run, mostly Spark starting up:</p>
  <div class="fx" data-lang="py">import json, os, sys, tempfile
from pyspark.sql import SparkSession, functions as F
os.environ["PYSPARK_PYTHON"] = sys.executable

spark = (SparkSession.builder.master("local[2]")
         .config("spark.sql.shuffle.partitions", "2")
         .config("spark.sql.session.timeZone", "UTC")      # keep Biteful's wall-clock times as written
         .config("spark.ui.showConsoleProgress", "false")
         .getOrCreate())
spark.sparkContext.setLogLevel("ERROR")

# Delivered events reach an inbox folder as three files, one micro-batch each.
# 104's delivery (3 March) is stuck on an offline phone and arrives last.
delivered = [e for e in events() if e["event"] == "delivered"]
arrivals = [[e for e in delivered if e["order_id"] not in (104, 109)],   # batch 0
            [e for e in delivered if e["order_id"] == 109],              # batch 1: 5 March 20:57
            [e for e in delivered if e["order_id"] == 104]]              # batch 2: the late one
inbox = tempfile.mkdtemp()
for i, batch in enumerate(arrivals):
    with open(os.path.join(inbox, f"part{i}.json"), "w") as f:
        f.write("\n".join(json.dumps(e) for e in batch))
    os.utime(f.name, (1_000_000 + i, 1_000_000 + i))     # Spark picks files oldest first

schema = "order_id INT, restaurant STRING, city STRING, amount INT, event STRING, ts STRING"

def daily_revenue(lateness):
    ev = (spark.readStream.schema(schema)
          .option("maxFilesPerTrigger", 1)                   # one file per micro-batch
          .json(inbox)
          .withColumn("ts", F.to_timestamp("ts", "yyyy-MM-dd HH:mm")))   # event time
    revenue = (ev.withWatermark("ts", lateness)              # how late is too late
                 .groupBy(F.window("ts", "1 day"), "city")   # tumbling one-day windows
                 .agg(F.sum("amount").alias("revenue")))
    name = "rev_" + lateness.replace(" ", "_")
    q = (revenue.writeStream.outputMode("update").format("memory").queryName(name)
         .option("checkpointLocation", tempfile.mkdtemp())
         .trigger(availableNow=True)                         # process what is there, then stop
         .start())
    q.awaitTermination()
    print(f"allowed lateness = {lateness}")
    for p in q.recentProgress:
        print(f"  batch {p['batchId']}: {p['numInputRows']} row(s), watermark {p['eventTime']['watermark'][:16]},"
              f" dropped as late: {p['stateOperators'][0]['numRowsDroppedByWatermark']}")
    spark.sql(f"""SELECT date_format(window.start, 'yyyy-MM-dd') AS day, city, max(revenue) AS revenue
                  FROM {name} GROUP BY 1, 2 ORDER BY 1, 2""").show()

daily_revenue("1 day")
daily_revenue("3 days")</div>
  <div class="fx" data-lang="text">allowed lateness = 1 day
  batch 0: 5 row(s), watermark 1970-01-01T00:00, dropped as late: 0
  batch 1: 1 row(s), watermark 2026-03-04T18:49, dropped as late: 0
  batch 2: 1 row(s), watermark 2026-03-04T20:57, dropped as late: 1
+----------+------+-------+
|       day|  city|revenue|
+----------+------+-------+
|2026-03-02|Mumbai|    450|
|2026-03-02|  Pune|    760|
|2026-03-04|Mumbai|    180|
|2026-03-05|Mumbai|    600|
|2026-03-05|  Pune|    260|
+----------+------+-------+

allowed lateness = 3 days
  batch 0: 5 row(s), watermark 1970-01-01T00:00, dropped as late: 0
  batch 1: 1 row(s), watermark 2026-03-02T18:49, dropped as late: 0
  batch 2: 1 row(s), watermark 2026-03-02T20:57, dropped as late: 0
+----------+------+-------+
|       day|  city|revenue|
+----------+------+-------+
|2026-03-02|Mumbai|    450|
|2026-03-02|  Pune|    760|
|2026-03-03|  Pune|    380|
|2026-03-04|Mumbai|    180|
|2026-03-05|Mumbai|    600|
|2026-03-05|  Pune|    260|
+----------+------+-------+</div>
  <p>The progress lines are Spark's own metrics for each micro-batch, and they show the watermark moving. Spark updates the watermark <em>between</em> micro-batches, from the newest event time seen so far: batch 0 runs with no watermark yet, batch 1 runs with 4 March 18:49 (the newest event of batch 0, 108's delivery, minus one day), and batch 2 runs with 4 March 20:57, after 109's delivery arrived in batch 1. When 104's event arrives in batch 2, its 3 March window ended before that watermark, so Spark drops it and counts it in <code>numRowsDroppedByWatermark</code>, and the 3 March row is missing from the table. With three days of lateness the watermark in batch 2 is only 2 March 20:57, nothing is dropped, and the table matches the ETL's gold table row for row. The plain-Python version and Spark agree.</p>
  <p>A few lines of the job deserve explanation. <code>withWatermark("ts", "1 day")</code> names the event-time column and the allowed lateness; <code>groupBy(F.window("ts", "1 day"), "city")</code> is a one-day tumbling window per city (<code>F.window(ts, "1 hour", "15 minutes")</code> would be hopping, and <code>F.session_window</code> gives session windows). <code>outputMode("update")</code> writes each window's new total whenever it changes, while <code>"append"</code> would write each window only once, when the watermark closes it. The <code>checkpointLocation</code> is where Spark saves its progress (source offsets) and its window state, so that a restarted job carries on where it stopped; with a Kafka source plus checkpoints and an idempotent sink, Spark gives exactly-once results. To read from the real topic instead of a folder, only the source changes (shown without output, since there is no broker):</p>
  <div class="fx" data-lang="py">from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.getOrCreate()   # needs the spark-sql-kafka package on the classpath
raw = (spark.readStream.format("kafka")
       .option("kafka.bootstrap.servers", "broker1:9092")
       .option("subscribe", "order-events")
       .option("startingOffsets", "earliest")
       .load())                              # columns: key, value (bytes), topic, partition, offset, timestamp
schema = "order_id INT, restaurant STRING, city STRING, amount INT, event STRING, ts STRING"
ev = (raw.select(F.from_json(F.col("value").cast("string"), schema).alias("e")).select("e.*")
         .withColumn("ts", F.to_timestamp("ts", "yyyy-MM-dd HH:mm")))
# ...then exactly the same filter / withWatermark / groupBy(window) as above</div>
  <p>The most damaging mistake in this area is windowing by processing time, the moment an event reached you, instead of the event's own timestamp. Then 104's delivery would be counted on the day the phone uploaded it, and the revenue for both days would be wrong without any error. Always window by event time and choose the allowed lateness by measuring how late your events really arrive.</p>

  <h2 id="kf-eco"><span class="num">09</span>Kafka Connect and Stream Processors</h2>
  <p>Every pipeline so far has been code we wrote by hand: a producer, consumers, a Spark job. Two jobs come up in every company again and again. The first is copying data between Kafka and other systems: from the app's Postgres database into Kafka, and from Kafka into S3, Snowflake or Elasticsearch. Writing that by hand means solving batching, retries, offset tracking and restarts every single time. The second is computing on streams inside ordinary services, which should not always require running a Spark cluster.</p>
  <p><strong>Kafka Connect</strong> handles the first job with configuration instead of code. It is a runtime that runs <strong>connectors</strong>: a <strong>source connector</strong> reads from an external system and writes to Kafka, and a <strong>sink connector</strong> reads from Kafka and writes to an external system. Connect tracks the connectors' offsets, retries failures, spreads work over several worker machines and restarts tasks that die. Think of a courier company with standard routes: you fill in a form saying what goes where, and they handle the vans, the drivers and the lost parcels. A sink that copies <code>order-events</code> into S3 looks roughly like this (example configuration, not run here):</p>
  <div class="fx" data-lang="text">{ "name": "order-events-to-s3",
  "config": {
    "connector.class": "io.confluent.connect.s3.S3SinkConnector",
    "topics": "order-events",
    "s3.bucket.name": "biteful-lake",
    "format.class": "io.confluent.connect.s3.format.parquet.ParquetFormat",
    "flush.size": "1000",
    "tasks.max": "3" } }</div>
  <p>The most important source connector in data engineering is <strong>change data capture</strong>, or <strong>CDC</strong>. The ETL note extracted changed rows with a watermark column like <code>updated_at</code>, which cannot see deleted rows and can miss updates made within the same second. A CDC connector such as <strong>Debezium</strong> instead reads the database's own <strong>write-ahead log</strong> (the internal journal in which Postgres records every insert, update and delete before applying it) and publishes each change as an event, so nothing is missed and the database is not queried at all. For Biteful's app database it would look like this (example configuration, not run here):</p>
  <div class="fx" data-lang="text">{ "name": "biteful-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "app-db-replica",
    "database.dbname": "biteful",
    "topic.prefix": "biteful",
    "table.include.list": "public.orders" } }</div>
  <p>Connectors still need the discipline of the ETL note. A sink into a database receives events at least once, so it should upsert by key. And when the producer changes the shape of its events (renames a field, changes a type), every consumer can break. Teams prevent that with a <strong>schema registry</strong>: producers register the schema of their events (in Avro, Protobuf or JSON Schema), the registry refuses changes that would break existing readers, and each message carries a small schema id so readers know how to decode it.</p>
  <p>For the second job, computing on streams, there are three main choices. <strong>Kafka Streams</strong> is a Java library, not a cluster: it runs inside your own service, reads topics, computes, and writes topics, keeping its state in a local database (RocksDB) that is backed up to compacted topics. Spark Structured Streaming is the engine used in the previous section. <strong>Apache Flink</strong> is a dedicated distributed stream engine that processes each record as it arrives, with very low latency and the most complete event-time support. Section 08's daily revenue job would look like this in Kafka Streams (Java, not run here; setup omitted):</p>
  <div class="fx" data-lang="text">StreamsBuilder b = new StreamsBuilder();
KStream&lt;String, OrderEvent&gt; events = b.stream("order-events");
events.filter((orderId, e) -&gt; e.event.equals("delivered"))
      .groupBy((orderId, e) -&gt; e.city)                       // re-key by city
      .windowedBy(TimeWindows.ofSizeAndGrace(Duration.ofDays(1), Duration.ofDays(3)))
      .aggregate(() -&gt; 0L, (city, e, total) -&gt; total + e.amount)
      .toStream()
      .to("daily-city-revenue");</div>
  <p>Read it against the Spark job and the pieces line up: the filter, the one-day tumbling window, the three-day "grace" (Kafka Streams' name for allowed lateness) and the sum. <code>groupBy</code> changes the key from order id to city, and since all events for one city must reach the same task, Kafka Streams writes them to an internal "repartition" topic keyed by city, which is its version of a Spark shuffle.</p>
  <table class="tbl">
    <tr><th></th><th>Kafka Streams</th><th>Apache Flink</th><th>Spark Structured Streaming</th></tr>
    <tr><td>What it is</td><td>Java library inside your service</td><td>distributed stream engine</td><td>Spark's DataFrame API on streams</td></tr>
    <tr><td>Processing model</td><td>record at a time</td><td>record at a time</td><td>micro-batches</td></tr>
    <tr><td>Typical latency</td><td>milliseconds</td><td>milliseconds</td><td>about 0.1 s to a few seconds</td></tr>
    <tr><td>State</td><td>local RocksDB, backed up to Kafka</td><td>large state, checkpoints</td><td>state store, checkpoints</td></tr>
    <tr><td>Pick it when</td><td>JVM microservice, Kafka in and out</td><td>low latency, complex event-time logic at scale</td><td>the team already uses Spark and Python</td></tr>
  </table>

  <h2 id="kf-vs"><span class="num">10</span>Kafka vs Message Queues</h2>
  <p>RabbitMQ and Amazon SQS also move messages between services, and interviewers often ask when to use them instead of Kafka. The difference is what happens after a message is read. A <strong>message queue</strong> is a to-do list for workers: each message is delivered to <em>one</em> worker, the worker acknowledges it when done, and the queue deletes it. A log, as we have seen, keeps every message, and every group reads all of them. This simulation sends the same three events through each and lets two services read:</p>
  <div class="fx" data-lang="py"># SIMULATION: the same three events, read by two services, through a queue and through a log
from collections import deque

events = ["101 placed", "102 placed", "103 placed"]

queue = deque(events)                       # a queue: receiving + acknowledging removes the message
got = {"kitchen": [], "warehouse": []}
while queue:
    for service in got:                     # both services pull from the same queue
        if queue:
            got[service].append(queue.popleft())
print("queue:", got)

log = list(events)                          # a log: reading moves only the reader's own bookmark
bookmark = {"kitchen": 0, "warehouse": 0}
got = {service: log[start:] for service, start in bookmark.items()}
print("log:  ", got)</div>
  <div class="fx" data-lang="text">queue: {'kitchen': ['101 placed', '103 placed'], 'warehouse': ['102 placed']}
log:   {'kitchen': ['101 placed', '102 placed', '103 placed'], 'warehouse': ['101 placed', '102 placed', '103 placed']}</div>
  <p>With the queue, the kitchen and the warehouse competed for messages: the kitchen got 101 and 103, the warehouse got only 102, and each event was handled once by someone. That is exactly right for a <em>task</em>, such as "send this customer one SMS" or "resize this photo", where you want the work done once by whichever worker is free. It is exactly wrong for <em>events</em> that several teams need: the warehouse missed two orders. With the log, both services received all three events, because each just moved its own bookmark.</p>
  <p>A restaurant has both. Its ticket rail is a queue: a cook takes a ticket, cooks the dish, and the ticket is gone. Its order book is a log: the kitchen, billing and inventory all read every line at their own pace, and last month's pages are still there for the accountant. Queues have real strengths of their own: they track each message individually, so one failing message can be retried or delayed or moved to a <strong>dead-letter queue</strong> (a side queue for messages that keep failing) without holding up the others, and you can add as many workers as you like, with no partition limit.</p>
  <table class="tbl">
    <tr><th></th><th>Kafka (log)</th><th>RabbitMQ / SQS (queue)</th></tr>
    <tr><td>After a message is read</td><td>stays until retention</td><td>deleted when acknowledged</td></tr>
    <tr><td>Many independent readers</td><td>yes, one consumer group each</td><td>needs a copy per reader (fan-out exchange, SNS)</td></tr>
    <tr><td>Replay history</td><td>yes, reset the offsets</td><td>no</td></tr>
    <tr><td>Ordering</td><td>per partition, so per key</td><td>per queue, weakened by parallel workers and redelivery</td></tr>
    <tr><td>Per-message control</td><td>coarse: one offset per partition</td><td>fine: per-message ack, delay, priority, dead-letter</td></tr>
    <tr><td>Scaling consumers</td><td>up to the partition count</td><td>any number of workers</td></tr>
  </table>
  <p>Using Kafka as a job queue hurts because of <strong>head-of-line blocking</strong>: one slow or failing message holds up every message behind it in that partition, since the bookmark cannot move past it. Using a queue as an event bus hurts the other way round: there is no replay, and a service added later has no history. The rule of thumb: queues for task distribution, Kafka for event distribution.</p>

  <h2 id="kf-build"><span class="num">11</span>Putting It Together: The Live Restaurant Board</h2>
  <p>Biteful's operations team wants a live board showing, for each restaurant, how many orders are open right now and the average delivery time in minutes. The same numbers are exactly the "fresh features" an ETA model would read when a customer places an order (see <a class="xref" data-note="sd_serving">feature pipelines and serving</a>). The board is a consumer in its own group, <code>restaurant-board</code>, so it reads every event without disturbing the kitchen or the warehouse. It relies on almost everything above: events keyed by order id, so that each order's "placed" arrives before its "delivered"; at-least-once commits, so nothing is lost; and therefore an idempotent update, because some events will arrive twice.</p>
  <p>The simulation reads the toy topic from section 03 partition by partition, as a consumer does, and replays the at-least-once crash from section 06: the board processed the first three records of partition 0 (102 placed, 102 delivered, 103 placed), crashed before committing, and received them again after the restart. We build the board twice, once naively and once remembering which (order, event) pairs it has already applied:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): the live restaurant board, reading the toy topic like a consumer
from datetime import datetime

topic = Topic("order-events", 3)
for e in events():
    topic.produce(str(e["order_id"]), e)

def build_board(deliveries, dedupe):
    open_orders, placed_at, minutes, seen = {}, {}, {}, set()
    for e in deliveries:
        if dedupe:
            if (e["order_id"], e["event"]) in seen:        # already applied: a repeat changes nothing
                continue
            seen.add((e["order_id"], e["event"]))
        r, t = e["restaurant"], datetime.fromisoformat(e["ts"])
        if e["event"] == "placed":
            open_orders[r] = open_orders.get(r, 0) + 1
            placed_at[e["order_id"]] = t
        else:
            open_orders[r] -= 1
            if e["event"] == "delivered":
                minutes.setdefault(r, []).append((t - placed_at[e["order_id"]]).seconds // 60)
    return ({r: n for r, n in open_orders.items() if n},
            {r: round(sum(v) / len(v), 1) for r, v in sorted(minutes.items())})

# At-least-once: the consumer crashed after processing partition 0's first 3 records but
# before committing, so after the restart those 3 records are delivered a second time.
p0, p1, p2 = ([e for _, e in records] for records in topic.partitions)
deliveries = p0[:3] + p0 + p1 + p2

for dedupe in (False, True):
    open_now, avg_mins = build_board(deliveries, dedupe)
    print(f"dedupe={dedupe}:  open orders {open_now}")
    print(f"              avg delivery minutes {avg_mins}")</div>
  <div class="fx" data-lang="text">dedupe=False:  open orders {'Pizza Point': 1, 'Dosa Hut': 1}
              avg delivery minutes {'Biryani Bros': 39.8, 'Dosa Hut': 30.5, 'Pizza Point': 41.5}
dedupe=True:  open orders {'Dosa Hut': 1}
              avg delivery minutes {'Biryani Bros': 39.3, 'Dosa Hut': 30.5, 'Pizza Point': 41.5}</div>
  <p>The naive board is wrong in two ways that would never raise an error. Pizza Point shows an open order that does not exist, because "103 placed" was counted twice but "103 delivered" only once. And Biryani Bros' average is 39.8 minutes instead of 39.3, because order 102's 41 minutes was counted twice: (41 + 41 + 25 + 52) / 4 = 39.75. With de-duplication the repeats change nothing, and the numbers are right: Dosa Hut has one open order (110, still pending), Biryani Bros averages (41 + 25 + 52) / 3 = 39.3 minutes, Dosa Hut (32 + 29) / 2 = 30.5, and Pizza Point (38 + 45) / 2 = 41.5. The real consumer is the same logic inside a poll loop (shown without output):</p>
  <div class="fx" data-lang="py">import json
from datetime import datetime
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "broker1:9092",
              "group.id": "restaurant-board",
              "auto.offset.reset": "earliest",
              "enable.auto.commit": False})
c.subscribe(["order-events"])

open_orders, placed_at, minutes, seen = {}, {}, {}, set()
while True:
    m = c.poll(1.0)
    if m is None or m.error():
        continue
    e = json.loads(m.value())
    if (e["order_id"], e["event"]) not in seen:          # dedupe: re-deliveries change nothing
        seen.add((e["order_id"], e["event"]))
        r, t = e["restaurant"], datetime.fromisoformat(e["ts"])
        if e["event"] == "placed":
            open_orders[r] = open_orders.get(r, 0) + 1
            placed_at[e["order_id"]] = t
        else:
            open_orders[r] -= 1
            if e["event"] == "delivered":
                minutes.setdefault(r, []).append((t - placed_at[e["order_id"]]).seconds // 60)
        # in production: write open_orders[r] and the average to Redis here
    c.commit(message=m, asynchronous=False)              # process, then commit: at-least-once</div>
  <p>Two simplifications would not survive production. The board lives in memory, so a restart has to rebuild it by replaying the topic from the beginning, which is fine for 19 events and far too slow for a year; real jobs keep state in a stream processor's checkpoints or in an external store such as Redis, and the ETA model reads that store in milliseconds. And the <code>seen</code> set grows forever; in practice it is kept only for a limited time (a time-to-live), long enough to catch redeliveries after a crash or rebalance.</p>

  <h2 id="kf-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common streaming bug is expecting order where Kafka does not promise it. Kafka orders records within a partition only, so events that must be processed in order need the same key. Send them without a key, and they are spread across partitions for throughput:</p>
  <div class="fx" data-lang="py"># SIMULATION: what happens to one order's events when they are sent WITHOUT a key
from itertools import cycle

partitions = [[], [], []]
next_partition = cycle([0, 1, 2])                    # no key: messages are spread for throughput
for event in ["101 placed", "101 delivered", "102 placed", "102 delivered"]:
    partitions[next(next_partition)].append(event)
print("partitions:", partitions)

# two consumers read partitions 0 and 1 at different speeds; the board sees partition 1 first
for event in partitions[1] + partitions[0]:
    print("board receives:", event)</div>
  <div class="fx" data-lang="text">partitions: [['101 placed', '102 delivered'], ['101 delivered'], ['102 placed']]
board receives: 101 delivered
board receives: 101 placed
board receives: 102 delivered</div>
  <p>Order 101's "placed" landed in partition 0 and its "delivered" in partition 1. A consumer that happens to read partition 1 first receives "101 delivered" for an order it has never seen, and the board's <code>open_orders[r] -= 1</code> would fail or go negative. The fix is to key every event by the entity whose order matters, here <code>order_id</code>.</p>
  <p>The second is grouping by the wrong clock. If a job buckets events by when they arrived instead of when they happened, late events silently move to the wrong day:</p>
  <div class="fx" data-lang="py"># SIMULATION: windowing by processing time (arrival) instead of event time

delivered = [e for e in events() if e["event"] == "delivered" and e["city"] == "Pune"]
arrived = {e["order_id"]: e["ts"][:10] for e in delivered}
arrived[104] = "2026-03-05"                          # 104's phone was offline; uploaded two days later

by_event_time, by_arrival = {}, {}
for e in delivered:
    by_event_time[e["ts"][:10]] = by_event_time.get(e["ts"][:10], 0) + e["amount"]
    day = arrived[e["order_id"]]
    by_arrival[day] = by_arrival.get(day, 0) + e["amount"]
print("Pune revenue by event time:", by_event_time)
print("Pune revenue by arrival   :", by_arrival)</div>
  <div class="fx" data-lang="text">Pune revenue by event time: {'2026-03-02': 760, '2026-03-03': 380, '2026-03-05': 260}
Pune revenue by arrival   : {'2026-03-02': 760, '2026-03-05': 640}</div>
  <p>By event time, Pune earned ₹380 on 3 March; by arrival, 3 March shows nothing and 5 March shows ₹640, because 104's delivery was uploaded two days late. No error appears, only wrong numbers. Use the event's own timestamp and a watermark.</p>
  <p>Several other mistakes come up again and again. Leaving <code>enable.auto.commit</code> on while processing asynchronously commits offsets for work that has not finished, so a crash loses events. Writing to a database with a plain insert or "add 1" under at-least-once delivery double-counts during every crash and rebalance; use upserts keyed by event id. Starting more consumers than partitions leaves the extra ones idle, and adding partitions later to fix it remaps keys. A single hot key overloads one partition and one consumer, which shows up as lag on that partition only. Forgetting <code>flush()</code> before a producer script exits loses its last events with no error. Slow work inside the poll loop beyond <code>max.poll.interval.ms</code> causes rebalance storms. Using a compacted topic for a consumer that needs full history, or Kafka as a job queue, picks the wrong tool. And building a streaming pipeline when nobody acts on the result within minutes adds an always-on system, harder testing and on-call duty where an hourly batch would do.</p>

  <h2 id="kf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core terms</h3>
  <ul>
    <li><b>Event</b>: a small fact that happened at a time. <b>Batch</b>: bounded data on a schedule. <b>Streaming</b>: unbounded data, handled as it arrives.</li>
    <li><b>Event time</b>: when it happened. <b>Processing time</b>: when the system saw it.</li>
    <li><b>Broker</b>: one Kafka server; <b>cluster</b>: several brokers.</li>
    <li><b>Topic</b>: a named stream. <b>Partition</b>: one ordered, append-only log inside a topic; the unit of ordering and parallelism.</li>
    <li><b>Offset</b>: a record's position in its partition (0, 1, 2…); never renumbered.</li>
    <li><b>Key → partition</b>: <code>hash(key) % partitions</code> (CRC32 in librdkafka, murmur2 in Java). Same key, same partition, in order.</li>
    <li><b>Replication factor</b>: copies per partition; <b>leader</b> takes writes; <b>ISR</b>: followers fully caught up.</li>
    <li><b>Consumer group</b>: consumers sharing a <code>group.id</code>; one owner per partition. <b>Rebalance</b>: reassignment on join, leave or missed heartbeats.</li>
    <li><b>Committed offset</b>: the next record a group needs. <b>Lag</b> = log-end offset − committed offset.</li>
    <li><b>Retention</b>: delete old segments by time or size. <b>Compaction</b>: keep the latest record per key; <b>tombstone</b> (null value) deletes a key.</li>
    <li><b>Window</b>: tumbling (fixed, no overlap), hopping (fixed, overlapping), session (closes after a gap). <b>Watermark</b> = newest event time − allowed lateness.</li>
    <li><b>Kafka Connect</b>: config-only source and sink connectors. <b>CDC</b>: publishing a database's changes from its write-ahead log (Debezium).</li>
  </ul>
  <h3>Delivery semantics</h3>
  <table class="tbl">
    <tr><th>Semantics</th><th>Order of steps</th><th>Crash causes</th><th>Notes</th></tr>
    <tr><td>At-most-once</td><td>commit → process</td><td>loss</td><td>also what careless auto-commit gives</td></tr>
    <tr><td>At-least-once</td><td>process → commit</td><td>repeats</td><td>default; pair with an idempotent sink</td></tr>
    <tr><td>Exactly-once</td><td>output + offsets in one transaction</td><td>nothing visible</td><td>Kafka → Kafka only; external sinks need idempotent writes</td></tr>
  </table>
  <h3>Settings that matter</h3>
  <table class="tbl">
    <tr><th>Setting</th><th>Meaning</th></tr>
    <tr><td><code>acks=0 / 1 / all</code></td><td>no reply / leader wrote it / every in-sync replica wrote it</td></tr>
    <tr><td><code>enable.idempotence</code></td><td>producer id + sequence numbers; broker drops retried duplicates</td></tr>
    <tr><td><code>min.insync.replicas</code></td><td>with acks=all, refuse writes unless this many copies are in sync</td></tr>
    <tr><td><code>linger.ms</code>, <code>compression.type</code></td><td>bigger, compressed batches: more throughput, slightly more latency</td></tr>
    <tr><td><code>enable.auto.commit</code></td><td>commit on a timer (default true); turn off and commit after processing</td></tr>
    <tr><td><code>auto.offset.reset</code></td><td>where to start with no committed offset: <code>earliest</code> or <code>latest</code></td></tr>
    <tr><td><code>max.poll.interval.ms</code></td><td>max time between polls before the consumer is presumed dead (5 min)</td></tr>
    <tr><td><code>isolation.level=read_committed</code></td><td>never read records from aborted transactions</td></tr>
    <tr><td><code>cleanup.policy</code>, <code>retention.ms</code></td><td><code>delete</code> (default, 7 days) or <code>compact</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from confluent_kafka import Producer, Consumer

p = Producer({"bootstrap.servers": "b1:9092", "acks": "all", "enable.idempotence": True})
p.produce("order-events", key="101", value=payload, callback=report)   # buffers only
p.poll(0); p.flush()                                                    # reports; wait for all

c = Consumer({"bootstrap.servers": "b1:9092", "group.id": "warehouse-loader",
              "auto.offset.reset": "earliest", "enable.auto.commit": False})
c.subscribe(["order-events"])
msg = c.poll(1.0)                        # fetch + heartbeat
process(msg); c.commit(message=msg)      # at-least-once

# Spark: event-time windows with a watermark
df.withWatermark("ts", "3 days").groupBy(F.window("ts", "1 day"), "city").agg(F.sum("amount"))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Order is per partition only; key by the entity whose order matters.</li>
    <li>Adding partitions remaps keys (3 → 5 moved 8 of 11 Biteful keys).</li>
    <li>Consumers in a group beyond the partition count sit idle.</li>
    <li><code>produce()</code> only buffers; without <code>flush()</code> the last events are lost.</li>
    <li>At-least-once repeats events: upsert or dedupe by event id.</li>
    <li>Transactions do not cover databases or emails.</li>
    <li>Window by event time, never processing time; size the watermark to real lateness.</li>
    <li>Slow processing per poll → rebalance storm; hot keys → lag on one partition.</li>
    <li>Kafka is not a queue: reading never deletes.</li>
  </ul>

  <h2 id="kf-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between batch and stream processing, and how do you choose?</summary><div class="qa-body">Batch processes bounded data on a schedule, so results are minutes to hours old but the jobs are simple, cheap and easy to rerun. Streaming processes unbounded events continuously, with latency of milliseconds to seconds, at the cost of always-on infrastructure and harder testing. Choose by asking how quickly someone must act on the result: kitchen tickets and fraud checks need streaming; a daily revenue report does not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Kafka, in one or two sentences?</summary><div class="qa-body">Kafka is a distributed, replicated, append-only log. Producers append events to partitioned topics, and any number of consumer groups read them independently from their own offsets, because reading never deletes; events are kept until retention or compaction removes them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is Kafka different from a message queue like RabbitMQ or SQS?</summary><div class="qa-body">A queue gives each message to one worker and deletes it once acknowledged, with fine per-message control such as retries, delays and dead-letter queues. Kafka keeps messages after they are read, so many groups each get every message and can replay history, and ordering is guaranteed per partition. Queues suit tasks done once by any worker; Kafka suits events many systems need.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are topics, partitions and offsets?</summary><div class="qa-body">A topic is a named stream of events. It is split into partitions, each an ordered append-only log that can live on a different broker, which is how Kafka scales. An offset is a record's position within its partition, starting at 0; it never changes, and a consumer group's committed offset is its bookmark in each partition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Kafka guarantee message ordering?</summary><div class="qa-body">Only within a single partition. Records with the same key go to the same partition, so per-key order is preserved, which is why Biteful keys events by order id. There is no ordering across partitions. The idempotent producer preserves order within a partition even when it retries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a producer decide which partition a record goes to, and what happens if you add partitions?</summary><div class="qa-body">With a key, the partitioner computes <code>hash(key) % number_of_partitions</code> (CRC32 in librdkafka, murmur2 in the Java client); without a key, records are spread for throughput. Adding partitions changes the modulus, so most keys map to a new partition, and an entity's old and new events can end up in different partitions and be processed out of order. Choose partition counts with headroom up front.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>acks=all</code> mean, and what is the ISR?</summary><div class="qa-body">With <code>acks=all</code> the leader replies only after every in-sync replica has the record. The ISR is the set of followers that are fully caught up with the leader. Combined with replication factor 3 and <code>min.insync.replicas=2</code>, an acknowledged write survives the loss of one broker; <code>acks=1</code> can lose data if the leader dies before followers copy it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an idempotent producer and what problem does it solve?</summary><div class="qa-body">When a reply is lost, the producer retries, and the broker may store the same record twice. With idempotence enabled, the producer has an id and numbers its messages per partition; the broker remembers the latest sequence numbers and drops a retry it has already written. This removes duplicates and reordering caused by retries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a consumer group, and what happens if a group has more consumers than partitions?</summary><div class="qa-body">A consumer group is a set of consumers with the same <code>group.id</code> that share a topic's partitions, each partition owned by exactly one member, while other groups read the same data independently. With more consumers than partitions, the extra consumers are idle standbys. To scale further you need more partitions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a rebalance, and what is a rebalance storm?</summary><div class="qa-body">A rebalance reassigns partitions when a consumer joins, leaves, or misses heartbeats or polls. A storm happens when processing between polls exceeds <code>max.poll.interval.ms</code>: the consumer is kicked out, its partition goes to another member that re-reads the same slow batch and is kicked out too, and the group never makes progress. Fix it with smaller batches, faster processing, or a deliberately higher limit; cooperative-sticky assignment reduces the pause each rebalance causes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain at-most-once, at-least-once and exactly-once delivery.</summary><div class="qa-body">At-most-once commits the offset before processing, so a crash loses the event. At-least-once processes first and commits after, so a crash repeats the event; this is the usual default. Exactly-once makes output and offset commit atomic with Kafka transactions for Kafka-to-Kafka pipelines, or uses at-least-once plus idempotent writes for external systems.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is auto-commit dangerous?</summary><div class="qa-body">With <code>enable.auto.commit=true</code>, the client commits the offsets of records returned by <code>poll()</code> on a timer, whether or not your code has finished with them. If processing is asynchronous or batched and the process crashes after a commit but before the work completes, those events are lost. Turn it off and commit after the work is done.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is consumer lag, and what would you check if it keeps growing?</summary><div class="qa-body">Lag is the log-end offset minus the group's committed offset: records written but not yet processed. If it grows, check whether per-record work is too slow (synchronous database writes, model calls), whether there are fewer consumers than partitions, whether one partition is hot because of a skewed key, and whether frequent rebalances are interrupting the group.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between retention and log compaction?</summary><div class="qa-body">Retention deletes whole old segments once they pass an age or size limit, regardless of key, so the topic is a history window. Compaction keeps at least the latest record for each key and removes older ones, so the topic acts as a table of current state; a tombstone (null value) deletes a key. Kafka's own <code>__consumer_offsets</code> is compacted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Event time vs processing time: why does it matter in streaming?</summary><div class="qa-body">Event time is when something happened; processing time is when the system received it. Events arrive late and out of order because of offline devices, retries and network delays. Aggregating by processing time puts late events in the wrong window silently, so correct pipelines group by event time and use a watermark to decide how long to wait.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are tumbling, hopping and session windows, and what is a watermark?</summary><div class="qa-body">Tumbling windows are fixed, non-overlapping slots; hopping windows are fixed-size but overlapping, starting every step; session windows group events separated by less than a gap. A watermark is the newest event time seen minus an allowed lateness: windows that end before it are finalised and their state freed, and later events for them are dropped. More lateness means more correct results but more state and later final answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Kafka Connect, and what is CDC?</summary><div class="qa-body">Kafka Connect is a runtime for source and sink connectors configured declaratively, with offset tracking, retries and scaling handled for you, used for moving data between Kafka and databases, S3 or warehouses. CDC (change data capture) publishes every insert, update and delete from a database's write-ahead log as events, for example with Debezium; unlike watermark-based extraction it captures deletes and never misses updates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Kafka Streams vs Flink vs Spark Structured Streaming: how do you choose?</summary><div class="qa-body">Kafka Streams is a Java library inside your service, ideal for Kafka-in, Kafka-out microservices with no extra cluster. Flink is a distributed engine with per-record processing, millisecond latency and the strongest event-time and state handling. Spark Structured Streaming uses micro-batches with the same DataFrame API as batch Spark, which suits teams already on Spark and Python who can accept sub-second to second latency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a real-time "open orders per restaurant" feature for an ETA model.</summary><div class="qa-body">The app produces order events keyed by order id with <code>acks=all</code> and idempotence. A stream job (Flink, Spark or a consumer group) reads them with at-least-once commits, deduplicates by event id, keeps open orders and recent delivery times per restaurant in checkpointed state, and writes the results to an online store such as Redis for the model to read in milliseconds, and to the lake for training so both use the same definition. Monitor consumer lag and alert when it grows.</div></details>
</main>
`
});
