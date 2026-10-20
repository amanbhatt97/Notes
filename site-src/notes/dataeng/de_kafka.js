// notes/dataeng/de_kafka.js — Kafka & Streaming
Object.assign(TOPIC_CONTENT, {
  "de_kafka": `<main>
  <h1>Kafka &amp; Streaming</h1>
  <div class="where"><span>Data Engineering</span><span>Kafka &amp; Streaming</span></div>
  <p class="lead">The nightly ETL and Spark jobs tell Biteful what happened <em>yesterday</em>. But when Asha places an order, the restaurant must start cooking now, the rider must be assigned now, and the "open orders" screen must change now. That needs data that flows as <strong>events</strong>, seconds after they happen. Kafka is the system that carries those events from the app to everyone who needs them, keeps them, and lets each reader go at its own pace. This note builds Kafka one need at a time on ONE running example: <strong>Biteful's 10 orders from the SQL, ETL and Spark notes, replayed as the stream the app emits</strong>: 19 events (<code>placed</code>, then <code>delivered</code> or <code>cancelled</code>), keyed by order id. Every Kafka output comes from a real run on a single-node <strong>Kafka 3.9.1</strong> broker (KRaft mode, no ZooKeeper) with the <code>confluent-kafka</code> Python client, plus a real Kafka Connect run and a real Spark Structured Streaming job. Two short demos are plain-Python <strong>simulations</strong> (a lost acknowledgement, a consumer crash), because those failures can't be produced on cue; they are labelled where they appear. The Kafka Streams example is Java and was <strong>not run</strong>.</p>

  <h2 id="kf-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="kf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="41" text-anchor="middle" font-size="12">ETL &amp; Orchestration</text><text x="85" y="58" text-anchor="middle" class="tm" font-size="10">nightly batch</text>
<line x1="160" y1="45" x2="188" y2="45" stroke="currentColor" marker-end="url(#kf-a0)"/>
<rect x="190" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="260" y="41" text-anchor="middle" font-size="12">Apache Spark</text><text x="260" y="58" text-anchor="middle" class="tm" font-size="10">big batch, many machines</text>
<line x1="330" y1="45" x2="358" y2="45" stroke="currentColor" marker-end="url(#kf-a0)"/>
<rect x="360" y="20" width="150" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="435" y="41" text-anchor="middle" font-size="12" font-weight="700">Kafka &amp; Streaming</text><text x="435" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="510" y1="45" x2="538" y2="45" stroke="currentColor" marker-end="url(#kf-a0)"/>
<rect x="540" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="41" text-anchor="middle" font-size="12">Serving</text><text x="595" y="58" text-anchor="middle" class="tm" font-size="10">fresh features</text>
<line x1="435" y1="70" x2="435" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#kf-a0)"/>
<rect x="350" y="110" width="170" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="435" y="130" text-anchor="middle" font-size="12">asyncio · queues</text><text x="435" y="147" text-anchor="middle" class="tm" font-size="10">waiting on many things</text>
<text x="20" y="130" class="tm" font-size="10.5">batch answers "what happened yesterday?";</text><text x="20" y="146" class="tm" font-size="10.5">streaming answers "what is happening now?"</text>
</svg><figcaption>Data Engineering, in reading order: ETL → Spark → Kafka, all on Biteful's orders.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: batch pipelines</b><span><a class="xref" data-note="de_etl">ETL &amp; Orchestration</a> loaded Biteful's orders every night, idempotently, with watermarks for changed rows; <a class="xref" data-note="de_spark">Apache Spark</a> did the same on many machines. Both run on a schedule, so the freshest answer is hours old. The ETL note also named CDC (reading a database's change log) as the better extract, which needs a log like Kafka.</span></li>
    <li><b>This note adds: events, seconds after they happen</b><span>Log-based messaging; topics and partitions with key hashing; producers (acks, retries, idempotence); consumer groups and rebalancing; offsets and at-most/at-least/exactly-once; retention and compaction; streaming pipelines with event-time windows and watermarks; Kafka Connect and Kafka Streams; when a plain queue is better.</span></li>
    <li><b>Leads to: serving and system design</b><span>The live numbers built here (open orders per restaurant, average delivery minutes) are exactly the "fresh features" a model reads at request time: see <a class="xref" data-note="sd_serving">feature pipelines and serving</a> and <a class="xref" data-note="mlops_lifecycle">the ML lifecycle</a>. Writing consumers that wait on many things at once uses <a class="xref" data-note="py_asyncio">asyncio</a>; brokers and connectors usually run in <a class="xref" data-note="se_docker">Docker</a>.</span></li>
  </ol>

  <h2 id="kf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. All numbers come from Biteful's 19 order events (plus Gita's order 111 where noted).</p>
  <ol class="story">
    <li><b>Batch vs streaming</b><span>Q: why isn't tomorrow's batch good enough? → order 101 was placed at 12:10; the nightly ETL learns of it 11 h 50 min later. The restaurant needed it in a second. So the app must publish each event as it happens, but to whom, and how?</span></li>
    <li><b>Log-based messaging</b><span>Q: how do several services get the same events at their own pace? → an append-only log with numbered records (offsets); each reader keeps its own bookmark: the kitchen notifier is at 4, the slow warehouse loader at 2, a new ETA service replays from 0. One log on one machine can't take a whole country's orders, though…</span></li>
    <li><b>Topics &amp; partitions</b><span>Q: how does the log scale while each order's events stay in order? → split the topic into partitions; <code>crc32(key) % 3</code> sends every event of an order to the same partition (101 → 2, 102 → 0, 107 → 1, traced by hand and confirmed by the broker). Order exists only within a partition. And sending over a network can fail…</span></li>
    <li><b>Producers: acks, retries, idempotence</b><span>Q: when is an event safely stored, and does retrying duplicate it? → <code>acks=0</code> never learns the offset, <code>acks=all</code> waits for every in-sync copy; a retry after a lost ack writes "101 delivered" twice unless the producer is idempotent. Now the events are stored; how do many readers share them?</span></li>
    <li><b>Consumers &amp; consumer groups</b><span>Q: how do several copies of a service split the work without double-handling? → a group shares partitions, one owner each: alone, A had [0, 1, 2]; when B joined, a rebalance split them; when B left, A took all back. But a crash in the middle loses track of what was done…</span></li>
    <li><b>Offsets &amp; delivery semantics</b><span>Q: after a crash, what is lost or repeated? → commit before processing: 103 is never sent to the kitchen (at-most-once); process before commit: 103 twice (at-least-once); a transaction: 11 tickets and the offsets together (exactly-once, inside Kafka). Meanwhile the log grows forever…</span></li>
    <li><b>Retention &amp; compaction</b><span>Q: how long are events kept, and can a topic hold "the latest status per order"? → retention deletes by age or size; compaction kept 11 of 21 records, one per order, and a tombstone deleted 105. Now we have reliable streams; how do we compute on them?</span></li>
    <li><b>Streaming pipelines</b><span>Q: how do you total revenue over data that never ends, arriving late? → event-time windows plus a watermark: with 1 day of lateness, 104's late event is dropped; with 3 days, the result equals the ETL's gold table, and a real Spark streaming job reading the topic produced it. Must every pipeline be hand-written?</span></li>
    <li><b>Kafka Connect &amp; Kafka Streams</b><span>Q: what do teams use instead of writing consumers by hand? → Connect moves data in and out with configuration only (all 21 events copied to a file, no code); Kafka Streams is a Java library for windows and joins. Is Kafka always the right tool?</span></li>
    <li><b>Kafka vs queues</b><span>Q: when is a plain message queue better? → a queue deletes a message once one worker has done it: right for "send this SMS once", wrong for "five teams need every order and a replay". Then we build the live restaurant board on the real topic.</span></li>
  </ol>

  <h2 id="kf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Kafka &amp; Streaming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Batch vs Streaming</div>
        <ul>
          <li><b>Batch</b> — bounded data, on a schedule; hours late (101 seen after 11 h 50 min)</li>
          <li><b>Streaming</b> — unbounded events, handled as they arrive; seconds</li>
          <li><b>Event time vs processing time</b> — when it happened vs when we saw it</li>
          <li>💡 newspaper (batch) vs live cricket score (stream)</li>
          <li>⚠ ask what latency the decision really needs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The Log</div>
        <ul>
          <li><b>Log</b> — append-only, ordered records; reading doesn't delete</li>
          <li><b>Offset</b> — a record's position in a partition: 0, 1, 2 …</li>
          <li><b>Each group</b> keeps its own bookmark; replay is possible</li>
          <li>💡 a society visitor register</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Topics &amp; Producers</div>
        <ul>
          <li><b>Topic</b> → <b>partitions</b>; broker = one Kafka server</li>
          <li><b>Key → partition</b> — <code>crc32(key) % n</code> (Java client: murmur2)</li>
          <li><b>Ordering</b> — per partition only; key by order_id</li>
          <li><b>acks</b> — 0 / 1 / all; <b>idempotence</b> drops retry duplicates</li>
          <li>⚠ adding partitions remaps keys (3 → 5 moved 8 of 11)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Consumer Groups</div>
        <ul>
          <li><b>Group</b> — members share a <code>group.id</code>; one owner per partition</li>
          <li><b>Scale</b> — useful consumers ≤ partitions</li>
          <li><b>Different groups</b> — each gets every event</li>
          <li><b>Rebalance</b> — on join / leave / crash</li>
          <li><b>Lag</b> — log-end offset − committed offset</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Offsets &amp; Semantics</div>
        <ul>
          <li><b>At-most-once</b> — commit, then process; crash loses</li>
          <li><b>At-least-once</b> — process, then commit; crash repeats (usual)</li>
          <li><b>Exactly-once</b> — transactions (Kafka → Kafka) or idempotent sink</li>
          <li>⚠ auto-commit can commit before you finish</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retention &amp; Streams</div>
        <ul>
          <li><b>Retention</b> — delete old segments by age/size (default 7 days)</li>
          <li><b>Compaction</b> — keep the latest record per key; null value = tombstone</li>
          <li><b>Windows</b> — tumbling, hopping, session; <b>watermark</b> = how late is too late</li>
          <li><b>Connect</b> — config-only connectors (Debezium CDC, S3, JDBC)</li>
          <li><b>Kafka Streams / Flink / Spark</b> — stream processors</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kafka vs Queues</div>
        <ul>
          <li><b>Queue</b> (RabbitMQ, SQS) — a message goes to one worker, then is gone</li>
          <li><b>Kafka</b> — every group reads everything; replay; high throughput</li>
          <li>💡 a to-do list vs a diary</li>
          <li>⚠ "Kafka is a queue" is the classic wrong answer</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="kf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="kf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">React As It Happens</span><span class="rm-sub">Batch vs streaming</span></div></div>
      <div class="rm-item rm-done" data-target="kf-log"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Log</span><span class="rm-sub">Kafka's one big idea</span></div></div>
      <div class="rm-item rm-done" data-target="kf-part"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Topics &amp; Partitions</span><span class="rm-sub">Key hashing traced</span></div></div>
      <div class="rm-item rm-done" data-target="kf-prod"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Producers</span><span class="rm-sub">acks, retries, idempotence</span></div></div>
      <div class="rm-item rm-done" data-target="kf-group"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Consumer Groups</span><span class="rm-sub">Assignment and rebalancing</span></div></div>
      <div class="rm-item rm-done" data-target="kf-sem"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Offsets &amp; Semantics</span><span class="rm-sub">At-most, at-least, exactly once</span></div></div>
      <div class="rm-item rm-done" data-target="kf-ret"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Retention &amp; Compaction</span><span class="rm-sub">How long, which records</span></div></div>
      <div class="rm-item rm-done" data-target="kf-stream"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Streaming Pipelines</span><span class="rm-sub">Windows, watermarks, Spark</span></div></div>
      <div class="rm-item rm-done" data-target="kf-eco"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Connect &amp; Streams</span><span class="rm-sub">Config and libraries</span></div></div>
      <div class="rm-item rm-done" data-target="kf-vs"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Kafka vs Queues</span><span class="rm-sub">Diary or to-do list</span></div></div>
      <div class="rm-item rm-done" data-target="kf-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Build It: Restaurant Board</span><span class="rm-sub">Live numbers, real broker</span></div></div>
      <div class="rm-item rm-done" data-target="kf-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Ordering, commits, hot keys</span></div></div>
      <div class="rm-item rm-done" data-target="kf-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One log, many readers</span></div></div>
      <div class="rm-item rm-done" data-target="kf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="kf-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="kf-why"><span class="num">01</span>React As It Happens: Batch vs Streaming</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ETL note produced a correct revenue table every night, and Spark made it fast at any size. But the restaurant can't wait until midnight to learn that Asha ordered a dosa. What is wrong with batch here, and what has to change?</p>
  </div>
  <p>There are two ways to process data. <strong>Batch</strong>: collect data for a period, then process all of it on a schedule ("every night, yesterday's orders"). The data is <strong>bounded</strong>: it has a start and an end. <strong>Streaming</strong>: handle each event as soon as it arrives, forever. The data is <strong>unbounded</strong>. An <strong>event</strong> is one small fact that happened: "order 101 was placed at Dosa Hut at 12:10".</p>
  <p>Biteful's app emits an event every time an order changes. Our running example is Biteful's 10 orders as that stream: 10 <code>placed</code>, 7 <code>delivered</code> and 2 <code>cancelled</code> events (110 is still pending), in time order:</p>
  <div class="fx" data-lang="py">"""Biteful's 10 orders as the stream of events the app emits (same rows as the SQL and ETL notes)."""
from datetime import datetime, timedelta

ORDERS = [  # order_id, restaurant, city, placed at (IST), final status, amount, delivery minutes
    (101, "Dosa Hut", "Pune", "2026-03-02 12:10", "delivered", 240, 32),
    (102, "Biryani Bros", "Mumbai", "2026-03-02 13:05", "delivered", 450, 41),
    (103, "Pizza Point", "Pune", "2026-03-02 20:30", "delivered", 520, 38),
    (104, "Pizza Point", "Pune", "2026-03-03 13:15", "delivered", 380, None),
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
        if status == "delivered":       # 104's time wasn't recorded; the app logged delivery at +45 min
            out.append({**base, "event": "delivered", "ts": t + timedelta(minutes=mins or 45)})
        elif status == "cancelled":
            out.append({**base, "event": "cancelled", "ts": t + timedelta(minutes=10)})
    out.sort(key=lambda e: e["ts"])
    for e in out:
        e["ts"] = e["ts"].strftime("%Y-%m-%d %H:%M")
    return out

if __name__ == "__main__":
    for e in events():
        print(e["ts"], e["order_id"], e["event"])</div>
  <p>When does each system first <em>know</em> about a new order? The nightly ETL runs at midnight after the day; a stream sees the event as it is published:</p>
  <div class="fx" data-lang="py">from datetime import datetime, timedelta
from biteful_events import events

# When does each system first KNOW about a new order?
for e in events():
    if e["event"] != "placed":
        continue
    t = datetime.fromisoformat(e["ts"])
    nightly = datetime.combine(t.date() + timedelta(days=1), datetime.min.time())   # next 00:00 run
    print(f"order {e['order_id']} placed {e['ts'][5:]}  nightly ETL sees it after {nightly - t}"
          f"  | a stream sees it within a second")</div>
  <div class="fx" data-lang="text">order 101 placed 03-02 12:10  nightly ETL sees it after 11:50:00  | a stream sees it within a second
order 102 placed 03-02 13:05  nightly ETL sees it after 10:55:00  | a stream sees it within a second
order 103 placed 03-02 20:30  nightly ETL sees it after 3:30:00  | a stream sees it within a second
order 104 placed 03-03 13:15  nightly ETL sees it after 10:45:00  | a stream sees it within a second
order 105 placed 03-03 19:45  nightly ETL sees it after 4:15:00  | a stream sees it within a second
order 106 placed 03-04 12:40  nightly ETL sees it after 11:20:00  | a stream sees it within a second
order 107 placed 03-04 21:10  nightly ETL sees it after 2:50:00  | a stream sees it within a second
order 108 placed 03-05 18:20  nightly ETL sees it after 5:40:00  | a stream sees it within a second
order 109 placed 03-05 20:05  nightly ETL sees it after 3:55:00  | a stream sees it within a second
order 110 placed 03-08 20:50  nightly ETL sees it after 3:10:00  | a stream sees it within a second</div>
  <p>The batch was correct, just too late: from 2 h 50 min (107, placed at 21:10) up to 11 h 50 min (101, placed at lunch). For the monthly revenue report that is fine. For "tell the kitchen", "assign a rider", "show the customer an ETA" it is useless. The logic doesn't change; only <em>when</em> it runs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Batch is the morning newspaper: complete, cheap, but it tells you yesterday's score. Streaming is the live cricket score on your phone: every ball updates it within seconds. You need the live score only if you will act on it right now.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Streaming</th></tr>
    <tr><td>Data</td><td>Bounded: "yesterday's orders"</td><td>Unbounded: events keep coming</td></tr>
    <tr><td>Latency</td><td>Minutes to hours</td><td>Milliseconds to seconds</td></tr>
    <tr><td>Tools</td><td>Airflow + pandas / Spark / SQL</td><td>Kafka + Flink / Spark Streaming / Kafka Streams</td></tr>
    <tr><td>Biteful use</td><td>Daily revenue, training data</td><td>Kitchen tickets, rider dispatch, live dashboards, fresh features</td></tr>
    <tr><td>Cost</td><td>Simple, cheap, easy to rerun</td><td>Always on, harder to test and backfill</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Event time</strong>: when the event really happened (the rider tapped "delivered" at 14:00). <strong>Processing time</strong>: when our system saw it (the phone was offline and sent it two days later). Streams arrive late and out of order, so streaming code groups by event time; section 08 shows how.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Real-time" is often not needed. If people look at a dashboard once each morning, an hourly batch is cheaper and simpler. First ask: "what latency does the decision really need?"</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the log.</b> The app must publish each event as it happens. But the kitchen notifier, the rider dispatcher, the ETA service and the warehouse loader all need the <em>same</em> events, at different speeds, and a new service next month will want the history too. Where do the events go?</div>

  <h2 id="kf-log"><span class="num">02</span>The Log: Log-Based Messaging</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Four services need every order event. If the app calls each of them directly, a slow or crashed service blocks the app or misses events, and a service added later has no history. How can one stream of events feed many readers independently?</p>
  </div>
  <p>Kafka's one big idea: store events in a <strong>log</strong>, a list that is only ever added to at the end. Nothing is edited, and reading removes nothing. Each record gets a position number, its <strong>offset</strong>: 0, 1, 2… Each reader keeps its own bookmark ("I have read up to offset 4"). Reading moves your bookmark, not the data. The app (a <strong>producer</strong>) writes once; every reader (a <strong>consumer</strong>) reads at its own pace.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The visitor register at a housing society gate. The guard only adds lines at the bottom. The secretary reads it weekly, the police read it after a theft, and each keeps a slip saying "I read up to line 212". Reading never tears out a page; old pages are thrown away only when they are too old (retention, section 07).</p>
  </div>
  <p>A toy log in plain Python, fed with Biteful's first events of 2 March. <code>append</code> adds at the end and returns the offset; <code>poll</code> returns records from a group's bookmark; <code>commit</code> moves the bookmark.</p>
  <div class="fx" data-lang="py">from biteful_events import events

class Log:
    """A toy Kafka partition: an append-only list plus one bookmark per reader group."""
    def __init__(self):
        self.records = []          # the log itself
        self.committed = {}        # group name -&gt; next offset to read

    def append(self, value):
        self.records.append(value)
        return len(self.records) - 1          # the new record's offset

    def poll(self, group, max_n=10):
        start = self.committed.get(group, 0)
        return list(enumerate(self.records))[start:start + max_n]

    def commit(self, group, next_offset):
        self.committed[group] = next_offset

log = Log()
evs = events()
for e in evs[:4]:                                       # 2 March, lunchtime: 4 events
    print("appended at offset", log.append(f"{e['order_id']} {e['event']}"))

batch = log.poll("kitchen-notifier")                    # tells restaurants about new orders
print("kitchen-notifier got:", batch)
log.commit("kitchen-notifier", batch[-1][0] + 1)

batch = log.poll("warehouse-loader", max_n=2)           # slower: loads events into the warehouse
print("warehouse-loader got:", batch)
log.commit("warehouse-loader", batch[-1][0] + 1)

log.append(f"{evs[4]['order_id']} {evs[4]['event']}")  # 20:30, order 103 is placed
print("bookmarks:", log.committed, "| log length:", len(log.records))
print("kitchen-notifier next:", log.poll("kitchen-notifier"))
print("warehouse-loader next:", log.poll("warehouse-loader"))
print("new eta-service replays from 0:", log.poll("eta-service")[:2])</div>
  <div class="fx" data-lang="text">appended at offset 0
appended at offset 1
appended at offset 2
appended at offset 3
kitchen-notifier got: [(0, '101 placed'), (1, '101 delivered'), (2, '102 placed'), (3, '102 delivered')]
warehouse-loader got: [(0, '101 placed'), (1, '101 delivered')]
bookmarks: {'kitchen-notifier': 4, 'warehouse-loader': 2} | log length: 5
kitchen-notifier next: [(4, '103 placed')]
warehouse-loader next: [(2, '102 placed'), (3, '102 delivered'), (4, '103 placed')]
new eta-service replays from 0: [(0, '101 placed'), (1, '101 delivered')]</div>
  <p>Trace it. The kitchen notifier read all four records and committed 4 ("next time start at 4"). The warehouse loader read two and committed 2. When order 103 was placed (offset 4), the kitchen got just that one, while the loader still had three to catch up on; neither slowed the other. A brand-new ETA service with no bookmark started at 0 and <strong>replayed</strong> history. Real Kafka works the same way: the log is a file on disk, and bookmarks are stored in an internal topic, <code>__consumer_offsets</code>.</p>
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
    <text x="300" y="20" text-anchor="middle" font-size="12" font-weight="bold">one partition of topic "order-events"</text>
  </svg><figcaption>Records are only appended. Each consumer group keeps its own offset, so slow and fast readers don't interfere.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A Kafka <strong>log</strong> is an immutable, ordered, append-only sequence of records. An <strong>offset</strong> is a record's position in it. <strong>Log-based messaging</strong>: producers append; consumers read from their own committed offset; reading never deletes, so any number of readers can read the same data, and any reader can rewind.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Kafka is a queue" is the most common wrong answer. Kafka never deletes a message because someone read it. That is why many teams can read the same events and why you can reprocess after fixing a bug, as long as retention hasn't expired (section 10 compares with real queues).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: topics and partitions.</b> One log is one file on one disk on one machine. A national delivery app emits thousands of events a second, and many consumers must read in parallel. But splitting the log must not break the order of one order's events: "delivered" must never come before "placed".</div>

  <h2 id="kf-part"><span class="num">03</span>Topics &amp; Partitions: Key Hashing Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need to split the log across machines for capacity and parallel reading, yet keep each order's events in order. Which event goes to which piece, and what ordering survives the split?</p>
  </div>
  <p>Kafka splits each named stream, a <strong>topic</strong> (here <code>order-events</code>), into <strong>partitions</strong>. Each partition is its own log with its own offsets, and can live on a different <strong>broker</strong> (one Kafka server). Each event carries a <strong>key</strong>; Biteful uses the order id. The producer hashes the key into a number and takes the remainder: <code>partition = hash(key) % number_of_partitions</code>. Same key → same number → same partition, every time, so all of one order's events land in one log, in the order they were sent.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank with three counters and a rule based on account number. All of Mr Sharma's deposits go to counter 3, so his passbook entries are in order. But nobody can say whether counter 1's 10:05 entry came before counter 3's 10:05 entry. Order exists per counter, not across the bank.</p>
  </div>
  <p>The hash, traced. <code>confluent-kafka</code> (librdkafka) hashes keys with CRC32 by default; Python's <code>zlib.crc32</code> is the same function, so we can predict the broker:</p>
  <div class="fx" data-lang="py">import zlib

def pick_partition(key, num_partitions):
    return zlib.crc32(key.encode()) % num_partitions   # same key -&gt; same number, every time

for order_id in range(101, 111):
    h = zlib.crc32(str(order_id).encode())
    print(f"key '{order_id}': crc32 = {h:&gt;10}  % 3 = {h % 3}  -&gt; partition {pick_partition(str(order_id), 3)}")</div>
  <div class="fx" data-lang="text">key '101': crc32 = 1416650876  % 3 = 2  -&gt; partition 2
key '102': crc32 = 3447271878  % 3 = 0  -&gt; partition 0
key '103': crc32 = 3128820048  % 3 = 0  -&gt; partition 0
key '104': crc32 =  605721843  % 3 = 0  -&gt; partition 0
key '105': crc32 = 1394451557  % 3 = 2  -&gt; partition 2
key '106': crc32 = 3390371295  % 3 = 0  -&gt; partition 0
key '107': crc32 = 3172189513  % 3 = 1  -&gt; partition 1
key '108': crc32 =  766302424  % 3 = 1  -&gt; partition 1
key '109': crc32 = 1521215566  % 3 = 1  -&gt; partition 1
key '110': crc32 =  980181419  % 3 = 2  -&gt; partition 2</div>
  <p>Check one by hand: 1,416,650,876 ÷ 3 = 472,216,958 remainder 2, so key 101 → partition 2. Prediction: partition 0 gets 102, 103, 104, 106; partition 1 gets 107, 108, 109; partition 2 gets 101, 105, 110. Now the real thing: create the topic with 3 partitions, then produce all 19 events in time order.</p>
  <div class="fx" data-lang="text">$ kafka-topics.sh --bootstrap-server localhost:19092 --create --topic order-events --partitions 3 --replication-factor 1
Created topic order-events.</div>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Producer
from biteful_events import events

p = Producer({"bootstrap.servers": "localhost:19092",
              "acks": "all",                    # wait until the write is safely stored
              "enable.idempotence": True})      # retries never create duplicates

def report(err, msg):                           # called once per message, after the broker answers
    if err is not None:
        print("FAILED:", err)
    else:
        e = json.loads(msg.value())
        print(f"key={msg.key().decode()} {e['event']:&lt;9} -&gt; partition {msg.partition()} offset {msg.offset()}")

for e in events():                              # in time order, as the app would send them
    p.produce("order-events", key=str(e["order_id"]), value=json.dumps(e), callback=report)
p.flush()                                       # block until every message is acknowledged</div>
  <div class="fx" data-lang="text">key=101 placed    -&gt; partition 2 offset 0
key=101 delivered -&gt; partition 2 offset 1
key=105 placed    -&gt; partition 2 offset 2
key=105 cancelled -&gt; partition 2 offset 3
key=110 placed    -&gt; partition 2 offset 4
key=102 placed    -&gt; partition 0 offset 0
key=102 delivered -&gt; partition 0 offset 1
key=103 placed    -&gt; partition 0 offset 2
key=103 delivered -&gt; partition 0 offset 3
key=104 placed    -&gt; partition 0 offset 4
key=104 delivered -&gt; partition 0 offset 5
key=106 placed    -&gt; partition 0 offset 6
key=106 delivered -&gt; partition 0 offset 7
key=107 placed    -&gt; partition 1 offset 0
key=107 cancelled -&gt; partition 1 offset 1
key=108 placed    -&gt; partition 1 offset 2
key=108 delivered -&gt; partition 1 offset 3
key=109 placed    -&gt; partition 1 offset 4
key=109 delivered -&gt; partition 1 offset 5</div>
  <p>Exactly as predicted. <code>produce</code> doesn't send at once: it puts the event in a local buffer and returns; the client sends batches in the background, and <code>flush()</code> waits until the broker has confirmed all of them, calling <code>report</code> for each. Look at partition 0: 102 placed (0), 102 delivered (1), 103 placed (2) … each order's events are in order. Across partitions there is no order: the reports came back partition by partition, and 107 (placed on 4 March) has offset 0 in its partition while 106 (also 4 March) has offset 6 in another. Nobody needs a global order here; the kitchen only needs each order's own events in order.</p>
  <p>What if Biteful later grows the topic to 5 partitions?</p>
  <div class="fx" data-lang="py">import zlib
moved = []
for order_id in range(101, 112):
    h = zlib.crc32(str(order_id).encode())
    if h % 3 != h % 5:
        moved.append(f"{order_id}: {h % 3}-&gt;{h % 5}")
print("3 -&gt; 5 partitions moves", len(moved), "of 11 keys:", moved)</div>
  <div class="fx" data-lang="text">3 -&gt; 5 partitions moves 8 of 11 keys: ['101: 2-&gt;1', '102: 0-&gt;3', '103: 0-&gt;3', '104: 0-&gt;3', '107: 1-&gt;3', '108: 1-&gt;4', '110: 2-&gt;4', '111: 2-&gt;1']</div>
  <p>8 of 11 keys would now hash to a different partition. An order placed before the change and delivered after it would have its two events in two partitions, read by different consumers in either order.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>partition</strong> is the unit of both parallelism and ordering in Kafka: order is guaranteed only within one partition. Records with the same key go to the same partition while the partition count stays the same. The Java client uses the murmur2 hash instead of CRC32, so mixed-language producers should agree on a partitioner.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choose the partition count up front with room to grow; adding partitions later remaps keys. Events with no key are spread for throughput, with no ordering at all. One huge key (a mega-sale restaurant, or <code>"unknown"</code>) overloads one partition: a <strong>hot key</strong>, the Kafka cousin of Spark's skew.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: producers.</b> The events landed where we predicted. But the network between the app and the broker can drop a request or a reply. When can the app treat an event as stored, and if it retries, could "101 delivered" end up in the log twice?</div>

  <h2 id="kf-prod"><span class="num">04</span>Producers: acks, Retries, Idempotence</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The app hands an event to the broker. If the reply never arrives, the app doesn't know whether the event was stored. Retry, and it may be stored twice; don't retry, and it may be lost. How do producers get "stored exactly once"?</p>
  </div>
  <p>Three settings answer it. <strong>acks</strong> says when the broker should reply: <code>0</code> = don't reply (fire and forget), <code>1</code> = after the partition's <strong>leader</strong> wrote it, <code>all</code> = after every <strong>in-sync replica</strong> (ISR: the follower copies that are fully caught up) wrote it. <strong>Retries</strong>: if no reply arrives, send again. <strong>Idempotence</strong>: the producer gets an id from the broker and numbers every message per partition (a <em>sequence number</em>); the broker drops any message whose (producer id, sequence) it already has, so a retry can't create a duplicate.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sending a parcel. acks=0 is dropping it in a letterbox: no proof. acks=1 is the counter clerk's receipt. acks=all is a receipt signed after copies are filed in two branches. Idempotence is the tracking number: if you send the same parcel again because the receipt got lost, the post office sees the number and says "already have it".</p>
  </div>
  <p>First, real runs of the three acks levels, one event each (Gita's order 111) to a fresh topic:</p>
  <div class="fx" data-lang="py">import json, time
from confluent_kafka import Producer

event = {"order_id": 111, "event": "placed", "restaurant": "Momo Magic", "city": "Pune",
         "amount": 220, "ts": "2026-03-09 13:00"}
for acks in ["0", "1", "all"]:
    p = Producer({"bootstrap.servers": "localhost:19092", "acks": acks})
    got = {}
    def report(err, msg):
        got["offset"] = msg.offset()
    t = time.time()
    p.produce("acks-demo", key="111", value=json.dumps(event), callback=report)
    p.flush()
    print(f"acks={acks:&lt;3}  delivery report offset = {str(got['offset']):&gt;4}   ({(time.time() - t) * 1000:.1f} ms)")</div>
  <div class="fx" data-lang="text">acks=0    delivery report offset = None   (5.9 ms)
acks=1    delivery report offset =    1   (5.1 ms)
acks=all  delivery report offset =    2   (4.8 ms)</div>
  <p>With <code>acks=0</code> the broker sent no reply, so the producer never learned the offset (<code>None</code>), even though the event was in fact stored at offset 0: the next two landed at 1 and 2. On one local broker all three take about 5 ms; on a real cluster <code>all</code> waits for the slowest in-sync copy, the price of safety.</p>
  <p>The duplicate problem can't be produced on cue (it needs a reply lost on the network at the right moment), so here is a <strong>simulation</strong> in plain Python of what the broker does, with the acknowledgement for "101 delivered" lost once:</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): what a lost acknowledgement does to a producer's retry
def send(partition_log, batch, idempotent, lose_first_ack):
    seen = set()                                 # broker side: (producer_id, sequence) already written
    for seq, event in enumerate(batch):
        attempts = 2 if (lose_first_ack and seq == 1) else 1   # the ack for event #1 is lost -&gt; resend
        for _ in range(attempts):
            if idempotent and ("producer-7", seq) in seen:
                continue                         # broker: "already have seq 1 from producer-7", drops it
            partition_log.append(event)
            seen.add(("producer-7", seq))

batch = ["101 placed", "101 delivered", "105 placed"]
for idem in (False, True):
    log = []
    send(log, batch, idempotent=idem, lose_first_ack=True)
    print(f"enable.idempotence={idem!s:5} -&gt; partition 2 holds {log}")</div>
  <div class="fx" data-lang="text">enable.idempotence=False -&gt; partition 2 holds ['101 placed', '101 delivered', '101 delivered', '105 placed']
enable.idempotence=True  -&gt; partition 2 holds ['101 placed', '101 delivered', '105 placed']</div>
  <p>Without idempotence the retry wrote "101 delivered" twice, and every consumer would see the order delivered twice (a revenue counter would count ₹240 twice). With it, the broker recognised sequence 1 from the same producer and dropped the copy. In the real run of section 03 you can see the first step of this: librdkafka logged <code>Failed to acquire idempotence PID from broker … Coordinator load in progress: retrying</code> while the freshly started broker was still loading, then got its producer id and sent all 19 events.</p>
  <table class="tbl">
    <tr><th>Producer setting</th><th>Meaning</th></tr>
    <tr><td><code>acks=0 / 1 / all</code></td><td>No reply / leader wrote it / all in-sync replicas wrote it (safest; default in current clients)</td></tr>
    <tr><td><code>enable.idempotence=true</code></td><td>Producer id + per-partition sequence numbers; broker drops retry duplicates and keeps order</td></tr>
    <tr><td><code>retries</code>, <code>delivery.timeout.ms</code></td><td>Keep retrying until this overall deadline (default 2 minutes), then report failure</td></tr>
    <tr><td><code>min.insync.replicas</code> (topic)</td><td>With acks=all, refuse writes unless at least this many copies are in sync (e.g. 2 of 3)</td></tr>
    <tr><td><code>linger.ms</code>, <code>batch.size</code></td><td>Wait a little to fill bigger batches: more throughput, slightly more latency</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>idempotent producer</strong> guarantees that retries never write duplicates or reorder messages within a partition. Combined with <code>acks=all</code> and replication, an acknowledged event survives a broker failure.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>produce()</code> only buffers. A script that exits without <code>flush()</code> silently loses its last events. Long-running producers must also call <code>poll(0)</code> regularly so delivery reports (and errors) are handled.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: consumers and consumer groups.</b> The events are stored safely and once. On the reading side, one kitchen-notifier process can't keep up with a national lunch rush. Start three copies, and how do they split the events without sending the same ticket twice?</div>

  <h2 id="kf-group"><span class="num">05</span>Consumers &amp; Consumer Groups</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want several copies of the kitchen notifier to share the work, never handling the same event twice, while the warehouse loader reads the very same events independently. And when a copy crashes, someone must take over its share. Who decides?</p>
  </div>
  <p>The rule. Consumers with the same <code>group.id</code> form a <strong>consumer group</strong>, and Kafka gives each partition to exactly one member of the group. Different groups are independent: each group gets every event. When a member joins, leaves or stops sending heartbeats, the group redistributes partitions: a <strong>rebalance</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Exam answer sheets from three classrooms (partitions) and a team of examiners (one group). Each classroom's bundle goes to exactly one examiner, so no sheet is marked twice. When a second examiner arrives, the head examiner moves a bundle over (rebalance). The moderation board is a different group: it sees every sheet too. A fourth examiner with only three bundles has nothing to do.</p>
  </div>
  <p>How are partitions shared? The default "range" rule, by hand: sort the partitions and the members, give each member a consecutive block, the first members one extra if it doesn't divide evenly:</p>
  <div class="fx" data-lang="py"># The "range" rule, by hand: sort partitions and members, give each member a consecutive block
def range_assign(partitions, members):
    members = sorted(members)
    per, extra = divmod(len(partitions), len(members))
    out, start = {}, 0
    for i, m in enumerate(members):
        n = per + (1 if i &lt; extra else 0)          # the first \`extra\` members get one more
        out[m] = partitions[start:start + n]
        start += n
    return out

for members in (["A"], ["A", "B"], ["A", "B", "C"], ["A", "B", "C", "D"]):
    print(f"{len(members)} consumer(s):", range_assign([0, 1, 2], members))</div>
  <div class="fx" data-lang="text">1 consumer(s): {'A': [0, 1, 2]}
2 consumer(s): {'A': [0, 1], 'B': [2]}
3 consumer(s): {'A': [0], 'B': [1], 'C': [2]}
4 consumer(s): {'A': [0], 'B': [1], 'C': [2], 'D': []}</div>
  <p>With 3 partitions, the fourth consumer gets nothing: useful consumers in a group ≤ partitions. Now a real group. The script is one kitchen-notifier process; it prints whenever Kafka assigns it partitions. We start A for 30 seconds, and B 8 seconds later for 10 seconds:</p>
  <div class="fx" data-lang="py">import sys, time
from confluent_kafka import Consumer

name, lifetime = sys.argv[1], float(sys.argv[2])     # e.g. "A" 30  -&gt; run for 30 seconds
c = Consumer({"bootstrap.servers": "localhost:19092",
              "group.id": "kitchen-notifier",          # same group id = share the work
              "auto.offset.reset": "earliest"})

def on_assign(consumer, partitions):
    print(f"{time.strftime('%H:%M:%S')} {name} assigned {sorted(p.partition for p in partitions)}", flush=True)

c.subscribe(["order-events"], on_assign=on_assign)
end = time.time() + lifetime
while time.time() &lt; end:
    c.poll(0.5)                                        # polling also sends heartbeats
c.close()                                              # leave the group cleanly
print(f"{time.strftime('%H:%M:%S')} {name} left", flush=True)</div>
  <div class="fx" data-lang="text">$ python k05_group.py A 30 &amp;  sleep 8;  python k05_group.py B 10
04:54:08 A assigned [0, 1, 2]
04:54:12 B assigned [0, 1]
04:54:12 A assigned [2]
04:54:20 B left
04:54:21 A assigned [0, 1, 2]
04:54:32 A left</div>
  <p>Read the timeline. Alone, A owned all three partitions. When B joined, a rebalance split them 2 + 1, as the range rule says, but B got [0, 1] and A got [2]: members are sorted by their generated member ids, not by the names we print, so the trace above predicts the shape, not who gets which block. When B closed, another rebalance gave everything back to A within a second. No partition ever had two owners. <code>poll()</code> is more than "fetch": it is also how a consumer tells the group "I'm alive".</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="kf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="70" y="18" text-anchor="middle" font-weight="bold">order-events</text>
    <rect x="20" y="30" width="100" height="32" rx="4" class="fs"/><text x="70" y="51" text-anchor="middle">P0</text>
    <rect x="20" y="80" width="100" height="32" rx="4" class="fs"/><text x="70" y="101" text-anchor="middle">P1</text>
    <rect x="20" y="130" width="100" height="32" rx="4" class="fs"/><text x="70" y="151" text-anchor="middle">P2</text>
    <rect x="240" y="22" width="150" height="150" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <text x="315" y="190" text-anchor="middle" font-size="11">group "kitchen-notifier"</text>
    <rect x="265" y="40" width="100" height="36" rx="6" class="fb"/><text x="315" y="63" text-anchor="middle">consumer B</text>
    <rect x="265" y="115" width="100" height="36" rx="6" class="ft"/><text x="315" y="138" text-anchor="middle">consumer A</text>
    <g stroke="currentColor" marker-end="url(#kf-ar2)">
      <line x1="120" y1="46" x2="263" y2="56"/>
      <line x1="120" y1="96" x2="263" y2="64"/>
      <line x1="120" y1="146" x2="263" y2="134"/>
    </g>
    <rect x="440" y="70" width="150" height="36" rx="6" class="fv"/><text x="515" y="93" text-anchor="middle">"warehouse-loader"</text>
    <text x="515" y="125" text-anchor="middle" font-size="11" class="tm">separate group:</text>
    <text x="515" y="140" text-anchor="middle" font-size="11" class="tm">gets ALL partitions too</text>
  </svg><figcaption>The real split while B was in the group: B had P0 and P1, A had P2. Another group reads everything independently.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>consumer group</strong> is a set of consumers sharing a <code>group.id</code>; each partition is assigned to exactly one member. A <strong>rebalance</strong> reassigns partitions when membership changes. Assignment strategies: range, round-robin, (cooperative-)sticky, which moves as few partitions as possible.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If handling one batch takes longer than <code>max.poll.interval.ms</code> (default 5 minutes), for example a slow model call, the group assumes the consumer is dead and rebalances; another member re-reads the uncommitted events, is also too slow, and the group loops: a <strong>rebalance storm</strong>. Keep per-poll work small or raise the limit.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: offsets and delivery semantics.</b> A new owner after a rebalance or a crash must know where the previous owner stopped. If the old owner had sent order 103 to the kitchen but not yet saved its bookmark, is 103 sent twice? Or lost?</div>

  <h2 id="kf-sem"><span class="num">06</span>Offsets &amp; Delivery Semantics</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>For each event a consumer does two things: <strong>process</strong> it (send the kitchen ticket) and <strong>commit</strong> its offset (save the bookmark). A crash can happen between the two. What happens to that event depends only on which step comes first. Which order do we want, and can we have neither loss nor duplicates?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading a textbook with a bookmark. Move the bookmark first, then read: if you fall asleep, you wake up past a page you never read. Read first, then move it: if you fall asleep, you re-read one page. Re-reading is usually the cheaper mistake.</p>
  </div>
  <p>A <strong>simulation</strong> (crashes can't be scheduled on a real broker): the kitchen notifier handles the five "placed" events of 2–3 March and crashes once at offset 2 (order 103), right after its first step, then restarts from the last committed offset, exactly as a real consumer does.</p>
  <div class="fx" data-lang="py"># SIMULATION (no broker): the kitchen-notifier crashes once, right after the first step for offset 2
def run(order, crash_at):
    log = ["101 placed", "102 placed", "103 placed", "104 placed", "105 placed"]
    committed, sent_to_kitchen, crashed = 0, [], False
    while committed &lt; len(log):
        off = committed
        for step in order:
            if step == "commit":
                committed = off + 1
            else:
                sent_to_kitchen.append(log[off][:3])
            if off == 2 and step == crash_at and not crashed:
                crashed = True
                break                       # crash! restart from the committed offset
    return sent_to_kitchen

print("commit then process:", run(["commit", "process"], "commit"))
print("process then commit:", run(["process", "commit"], "process"))</div>
  <div class="fx" data-lang="text">commit then process: ['101', '102', '104', '105']
process then commit: ['101', '102', '103', '103', '104', '105']</div>
  <table class="tbl out"><caption>Trace of the crash at order 103 (offset 2)</caption>
    <tr><th>Order of steps</th><th>Before the crash</th><th>Committed offset</th><th>After restart</th><th>Result</th></tr>
    <tr><td>commit → process</td><td>committed 3; ticket for 103 not sent</td><td>3</td><td>starts at 104</td><td>103 <strong>lost</strong>: at-most-once</td></tr>
    <tr><td>process → commit</td><td>ticket for 103 sent; not committed</td><td>2</td><td>starts at 103 again</td><td>103 <strong>twice</strong>: at-least-once</td></tr>
  </table>
  <h3>Lag: is the group keeping up?</h3>
  <p>A real group, <code>warehouse-loader</code>, reads all 19 events and commits after each (process, then commit). Then Gita places her first order (111, two more events), and we ask Kafka how far behind the group is:</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "localhost:19092", "group.id": "warehouse-loader",
              "auto.offset.reset": "earliest", "enable.auto.commit": False})
c.subscribe(["order-events"])
n, empty = 0, 0
while empty &lt; 5:                                   # stop after 5 quiet seconds (demo only)
    m = c.poll(1.0)
    if m is None:
        empty += 1; continue
    n += 1                                         # 1. process (here: just count)
    c.commit(message=m, asynchronous=False)        # 2. then commit -&gt; at-least-once
c.close()
print("warehouse-loader processed", n, "events")</div>
  <div class="fx" data-lang="text">warehouse-loader processed 19 events
produced 2 events for order 111
$ kafka-consumer-groups.sh --bootstrap-server localhost:19092 --describe --group warehouse-loader   # columns trimmed
GROUP             TOPIC         PARTITION CURRENT-OFFSET LOG-END-OFFSET LAG
warehouse-loader  order-events  2         5              7              2
warehouse-loader  order-events  1         6              6              0
warehouse-loader  order-events  0         8              8              0</div>
  <p>Key 111 hashes to partition 2 (CRC32 % 3 = 2), which now ends at offset 7 while the group's committed offset is 5: <strong>lag</strong> 2, exactly the two new events. Lag that stays small is healthy; lag that keeps growing means the consumers are too slow.</p>
  <h3>Exactly-once inside Kafka: transactions</h3>
  <p>The third option makes the result and the commit one all-or-nothing step. The ticket printer reads <code>order-events</code>, writes a kitchen ticket for every <code>placed</code> event to a <code>kitchen-tickets</code> topic, and puts its own consumer offsets in the <em>same</em> transaction. Real run:</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer, Producer

c = Consumer({"bootstrap.servers": "localhost:19092", "group.id": "ticket-printer",
              "auto.offset.reset": "earliest", "enable.auto.commit": False,
              "isolation.level": "read_committed"})
p = Producer({"bootstrap.servers": "localhost:19092", "transactional.id": "ticket-printer-1"})
p.init_transactions()                       # register with the broker; fences old "zombie" copies
c.subscribe(["order-events"])

batch, empty = [], 0
while empty &lt; 5:                            # read what is there now (demo only)
    m = c.poll(1.0)
    if m is None:
        empty += 1; continue
    batch.append(m)

p.begin_transaction()
tickets = 0
for m in batch:
    e = json.loads(m.value())
    if e["event"] == "placed":              # every new order becomes a kitchen ticket
        p.produce("kitchen-tickets", key=m.key(),
                  value=json.dumps({"order_id": e["order_id"], "restaurant": e["restaurant"]}))
        tickets += 1
# the consumer's progress is written INSIDE the same transaction
p.send_offsets_to_transaction(c.position(c.assignment()), c.consumer_group_metadata())
p.commit_transaction()                      # tickets + offsets become visible together, or neither
print(f"read {len(batch)} events, wrote {tickets} tickets; committed offsets:",
      sorted((tp.partition, tp.offset) for tp in c.committed(c.assignment())))
c.close()</div>
  <div class="fx" data-lang="text">read 21 events, wrote 11 tickets; committed offsets: [(0, 8), (1, 6), (2, 7)]</div>
  <p>21 events read, 11 tickets written (orders 101–111 each placed once), and the committed offsets equal the ends of the partitions (8, 6, 7). Either all 11 tickets and those offsets became visible, or none did: a crash before <code>commit_transaction</code> aborts both, and the restart redoes the batch with no duplicate tickets visible to <code>read_committed</code> readers. <code>transactional.id</code> gives the producer a stable identity, so if an old copy of the program comes back from the dead, the broker rejects it (<strong>fencing</strong>).</p>
  <table class="tbl">
    <tr><th>Semantics</th><th>How</th><th>Use when</th></tr>
    <tr><td>At-most-once</td><td>Commit first (or careless auto-commit)</td><td>Losing a few metrics or logs is fine</td></tr>
    <tr><td><strong>At-least-once</strong></td><td><code>enable.auto.commit=false</code>; process, then commit</td><td>The usual default; make the sink idempotent</td></tr>
    <tr><td>Exactly-once</td><td>Transactions for Kafka → Kafka; to an external DB: at-least-once + idempotent writes (upsert by event id)</td><td>Payments, billing, counters</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>committed offset</strong> is a group's bookmark per partition: the next offset to read. <strong>Delivery semantics</strong> describe what a crash does: at-most-once (may lose), at-least-once (may repeat), exactly-once (effects happen once). <strong>Lag</strong> = log-end offset − committed offset.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Kafka transactions only cover Kafka. If the consumer writes to Postgres and then commits the offset, a crash between them still repeats the Postgres write. The fix is the ETL note's idempotency: upsert by a key, so a repeat changes nothing. And <code>enable.auto.commit=true</code> commits on a timer (every 5 s), whether or not you finished: crash after the timer and before your write, and the event is silently lost.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: retention and compaction.</b> Reading never deletes, so the log only grows. How long does Kafka keep events? And the rider app only needs each order's <em>current</em> status, not its whole history: can a topic hold just that?</div>

  <h2 id="kf-ret"><span class="num">07</span>Retention &amp; Compaction</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A log that keeps everything forever fills every disk. But deleting by age alone also deletes the only record of an order's current status if it hasn't changed in a while. How does Kafka decide what to throw away?</p>
  </div>
  <p>Two policies, set per topic. <strong>Retention</strong> (<code>cleanup.policy=delete</code>, the default): Kafka stores each partition as a series of files called <strong>segments</strong>, and deletes whole old segments when they pass an age (<code>retention.ms</code>, default 7 days) or the partition passes a size (<code>retention.bytes</code>). Consumers that fall further behind than that lose data. <strong>Compaction</strong> (<code>cleanup.policy=compact</code>): instead of deleting by age, a background cleaner keeps at least the <em>latest</em> record for every key and removes older ones. The topic becomes a table: "current status of each order". A record with a null value, a <strong>tombstone</strong>, means "delete this key"; after a while the tombstone itself is removed too.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Retention is a CCTV recorder that overwrites footage older than a week. Compaction is a school's contact register: when a parent's phone number changes, the old line is struck out and only the newest number per student remains; a student who leaves gets a "left school" entry, and later their line goes too.</p>
  </div>
  <p>A real compacted topic, <code>order-status</code>, with cleaning made aggressive so it happens within seconds (segments roll after 1 s, the cleaner runs as soon as 1% of the log is old versions). Every status change of Biteful's orders is written with key = order id, then a tombstone for cancelled order 105:</p>
  <div class="fx" data-lang="text">$ kafka-topics.sh --bootstrap-server localhost:19092 --create --topic order-status --partitions 1 \\
    --replication-factor 1 --config cleanup.policy=compact --config segment.ms=1000 \\
    --config min.cleanable.dirty.ratio=0.01 --config delete.retention.ms=100
Created topic order-status.</div>
  <div class="fx" data-lang="py">import time
from confluent_kafka import Consumer, Producer
from biteful_events import events

p = Producer({"bootstrap.servers": "localhost:19092"})
for e in events():                                        # every status change, keyed by order
    p.produce("order-status", key=str(e["order_id"]), value=e["event"])
p.produce("order-status", key="105", value=None)          # tombstone: forget cancelled order 105
p.flush()

def read_all(label):
    c = Consumer({"bootstrap.servers": "localhost:19092", "group.id": f"reader-{time.time()}",
                  "auto.offset.reset": "earliest"})
    c.subscribe(["order-status"])
    rows, empty = [], 0
    while empty &lt; 3:
        m = c.poll(1.0)
        if m is None:
            empty += 1; continue
        rows.append((m.offset(), m.key().decode(), m.value().decode() if m.value() else None))
    c.close()
    print(f"{label}: {len(rows)} records")
    for r in rows:
        print("  offset %2d  key %s  %s" % r)

read_all("before compaction")
time.sleep(3)
p.produce("order-status", key="111", value="placed")      # a new record rolls the old segment
p.flush()
time.sleep(20)                                            # give the log cleaner time to run
read_all("after compaction")</div>
  <div class="fx" data-lang="text">before compaction: 20 records
  offset  0  key 101  placed
  offset  1  key 101  delivered
  offset  2  key 102  placed
  offset  3  key 102  delivered
  offset  4  key 103  placed
  offset  5  key 103  delivered
  offset  6  key 104  placed
  offset  7  key 104  delivered
  offset  8  key 105  placed
  offset  9  key 105  cancelled
  offset 10  key 106  placed
  offset 11  key 106  delivered
  offset 12  key 107  placed
  offset 13  key 107  cancelled
  offset 14  key 108  placed
  offset 15  key 108  delivered
  offset 16  key 109  placed
  offset 17  key 109  delivered
  offset 18  key 110  placed
  offset 19  key 105  None
after compaction: 11 records
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
  offset 20  key 111  placed</div>
  <p>Trace it. Before cleaning: 20 records, two per finished order. After: 11. Each order kept only its last status (101 delivered at offset 1; the "placed" at offset 0 is gone). Offsets did not change: compaction leaves gaps, it never renumbers. Order 105's "placed" and "cancelled" were removed because of the tombstone at offset 19, which is itself kept for <code>delete.retention.ms</code> so that readers can learn about the deletion. The newest records (110, the tombstone, 111) sat in recent segments; the cleaner never touches the active segment. A new rider app reading this topic from the start rebuilds "current status of every order" from 11 records instead of the full history.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Retention</strong>: delete old segments by time or size, regardless of key. <strong>Log compaction</strong>: keep at least the latest record per key; a <strong>tombstone</strong> (null value) deletes a key. Compacted topics act as changelogs for state; Kafka's own <code>__consumer_offsets</code> is compacted.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Compaction is not instant and not exact: a reader may still see older versions of a key (the active segment is never cleaned), so consumers must treat the topic as "latest wins". And on a compacted topic, a consumer that needs the full history (the warehouse loader) is reading the wrong topic.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: streaming pipelines.</b> Events are stored, shared, deduplicated and kept for the right time. Now Biteful wants answers computed on the stream: delivered revenue per city per day, updated as deliveries happen. But the stream never ends and some events arrive late. When is "2 March's revenue" finished?</div>

  <h2 id="kf-stream"><span class="num">08</span>Streaming Pipelines: Windows &amp; Watermarks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Total delivered revenue" has no final answer on an endless stream. And a rider's phone that was offline sends 104's "delivered" event two days late. How do we compute the ETL's daily revenue table continuously, and how long do we wait for stragglers?</p>
  </div>
  <p>Two ideas. A <strong>window</strong> cuts the endless stream into finite pieces by <em>event time</em>: a <strong>tumbling</strong> window is a fixed, non-overlapping slot (one calendar day); a <strong>hopping</strong> window is fixed-size but overlapping ("last 60 minutes, every 5 minutes"); a <strong>session</strong> window closes after a gap with no events. A <strong>watermark</strong> answers "how late is too late": it is the newest event time seen minus an allowed lateness; a window whose end is before the watermark is closed and forgotten, and later events for it are dropped.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school accepts homework for "Monday" until Wednesday evening. Monday is the window; "two days late is fine" is the allowed lateness; once Wednesday evening passes, Monday's marks are final and a sheet that turns up on Thursday is not counted.</p>
  </div>
  <p>By hand first: the 7 delivered events, with 104's arriving last (after the 5 March events), summed into one-day windows per city, with two lateness settings:</p>
  <div class="fx" data-lang="py">from datetime import datetime, timedelta
from biteful_events import events

delivered = [e for e in events() if e["event"] == "delivered"]
# arrival order: 104's "delivered" event is stuck on a rider's offline phone and arrives last
late = next(e for e in delivered if e["order_id"] == 104)
arrivals = [e for e in delivered if e is not late] + [late]

def run(allowed_lateness):
    max_seen, revenue = None, {}
    for e in arrivals:
        t = datetime.fromisoformat(e["ts"])
        max_seen = t if max_seen is None or t &gt; max_seen else max_seen
        watermark = max_seen - allowed_lateness       # "nothing older than this should still come"
        window = t.date()                             # tumbling window: one calendar day
        window_end = datetime.combine(window + timedelta(days=1), datetime.min.time())
        if window_end &lt;= watermark:
            print(f"  {e['order_id']} ({e['ts']}) arrives, watermark {watermark:%m-%d %H:%M}"
                  f" -&gt; window {window:%m-%d} already closed: DROPPED")
            continue
        key = (str(window), e["city"])
        revenue[key] = revenue.get(key, 0) + e["amount"]
    return revenue

for lateness in (timedelta(hours=24), timedelta(days=3)):
    print(f"allowed lateness {lateness}:")
    print("  ", run(lateness))</div>
  <div class="fx" data-lang="text">allowed lateness 1 day, 0:00:00:
  104 (2026-03-03 14:00) arrives, watermark 03-04 20:57 -&gt; window 03-03 already closed: DROPPED
   {('2026-03-02', 'Pune'): 760, ('2026-03-02', 'Mumbai'): 450, ('2026-03-04', 'Mumbai'): 180, ('2026-03-05', 'Pune'): 260, ('2026-03-05', 'Mumbai'): 600}
allowed lateness 3 days, 0:00:00:
   {('2026-03-02', 'Pune'): 760, ('2026-03-02', 'Mumbai'): 450, ('2026-03-04', 'Mumbai'): 180, ('2026-03-05', 'Pune'): 260, ('2026-03-05', 'Mumbai'): 600, ('2026-03-03', 'Pune'): 380}</div>
  <p>Trace the drop. When 104 (event time 3 March 14:00) arrives, the newest event seen is 109's delivery at 5 March 20:57. With 1 day of lateness the watermark is 4 March 20:57, already past the end of the 3 March window (4 March 00:00), so Pune's ₹380 for 3 March is dropped. With 3 days the watermark is 2 March 20:57, the window is still open, and the result is exactly the ETL's gold table: 2 Mar Pune 760 / Mumbai 450, 3 Mar Pune 380, 4 Mar Mumbai 180, 5 Mar Pune 260 / Mumbai 600. More lateness = more correct, but more windows held in memory for longer.</p>
  <h3>The same pipeline on the real topic, in Spark Structured Streaming</h3>
  <p>Stream processors do this for you, with state that survives restarts. This Spark job reads <code>order-events</code> (now 21 events, including order 111), parses the JSON, uses the event's own <code>ts</code> as event time, and keeps one-day windows per city with a 3-day watermark. <code>trigger(availableNow=True)</code> processes what is in the topic now and stops, which suits a demo; a production job runs forever.</p>
  <div class="fx" data-lang="py">import os, sys
from pyspark.sql import SparkSession, functions as F
os.environ["PYSPARK_PYTHON"] = sys.executable

spark = (SparkSession.builder.master("local[2]")
         .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.13:4.2.0")
         .config("spark.sql.shuffle.partitions", "2")
         .config("spark.sql.session.timeZone", "UTC")    # keep Biteful's IST wall-clock times as they are
         .config("spark.ui.showConsoleProgress", "false")
         .getOrCreate())
spark.sparkContext.setLogLevel("ERROR")

raw = (spark.readStream.format("kafka")
       .option("kafka.bootstrap.servers", "localhost:19092")
       .option("subscribe", "order-events")
       .option("startingOffsets", "earliest")
       .load())                                 # columns: key, value (bytes), partition, offset, timestamp…
schema = "order_id INT, restaurant STRING, city STRING, amount INT, event STRING, ts STRING"
ev = (raw.select(F.from_json(F.col("value").cast("string"), schema).alias("e")).select("e.*")
         .withColumn("ts", F.to_timestamp("ts", "yyyy-MM-dd HH:mm")))   # event time from the event

revenue = (ev.filter(F.col("event") == "delivered")
             .withWatermark("ts", "3 days")                      # accept events up to 3 days late
             .groupBy(F.window("ts", "1 day"), "city")           # tumbling window: one day
             .agg(F.sum("amount").alias("revenue"), F.count("*").alias("orders")))

q = (revenue.writeStream.outputMode("update").format("memory").queryName("daily_city_revenue")
     .option("checkpointLocation", "ckpt/daily_city_revenue")
     .trigger(availableNow=True)                 # process what is there now, then stop (demo)
     .start())
q.awaitTermination()
spark.sql("""SELECT date_format(window.start, 'yyyy-MM-dd') AS day, city, revenue, orders
             FROM daily_city_revenue ORDER BY day, city""").show()</div>
  <div class="fx" data-lang="text">+----------+------+-------+------+
|       day|  city|revenue|orders|
+----------+------+-------+------+
|2026-03-02|Mumbai|    450|     1|
|2026-03-02|  Pune|    760|     2|
|2026-03-03|  Pune|    380|     1|
|2026-03-04|Mumbai|    180|     1|
|2026-03-05|Mumbai|    600|     1|
|2026-03-05|  Pune|    260|     1|
|2026-03-09|  Pune|    220|     1|
+----------+------+-------+------+</div>
  <p>Day for day, the same numbers as the nightly ETL and the Spark batch, plus Gita's 9 March order, but each row was ready as soon as its delivery event arrived. <code>checkpointLocation</code> is where Spark saves its Kafka offsets and window state, so a restarted job continues instead of starting over (at-least-once reading plus checkpointed state: exactly-once results inside Spark). The session time zone is UTC so that one-day windows are Biteful's IST calendar days as written in the events.</p>
  <table class="tbl">
    <tr><th></th><th>Kafka Streams</th><th>Apache Flink</th><th>Spark Structured Streaming</th></tr>
    <tr><td>What</td><td>Java library inside your app</td><td>Distributed stream engine</td><td>Spark's streaming DataFrame API</td></tr>
    <tr><td>Model</td><td>Record at a time</td><td>Record at a time, event-time native</td><td>Micro-batches (100 ms+)</td></tr>
    <tr><td>Latency</td><td>ms</td><td>ms</td><td>~0.1 to a few s</td></tr>
    <tr><td>State &amp; windows</td><td>Local RocksDB, backed up to Kafka (compacted topics)</td><td>Large state, checkpoints, best watermark support</td><td>State store, watermarks, checkpoints</td></tr>
    <tr><td>Pick when</td><td>JVM microservice, Kafka in and out</td><td>Low latency, complex event-time logic at scale</td><td>Team already on Spark/Databricks, Python</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>streaming pipeline</strong> continuously reads events, keeps state (counts, sums, windows), and writes results. <strong>Tumbling / hopping / session windows</strong> group events by event time. A <strong>watermark</strong> = max event time seen − allowed lateness; windows ending before it are finalised.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Windowing by processing time (when the event reached you) instead of event time makes results depend on network delays: the offline rider's "delivered" would count on the day it was <em>uploaded</em>. Use the event's own timestamp plus a watermark.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Kafka Connect and Kafka Streams.</b> Every pipeline so far was code we wrote: a producer, consumers, a Spark job. Two jobs come up in every company: copying data between Kafka and other systems (databases, S3, the warehouse), and computing on streams inside ordinary services. Must everyone write those by hand?</div>

  <h2 id="kf-eco"><span class="num">09</span>Kafka Connect &amp; Kafka Streams</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Moving events from Kafka into S3 or a warehouse, or from a database into Kafka, means handling offsets, retries, batching and restarts every time. And a Java service that wants "revenue per city per day" shouldn't need a Spark cluster. What does the Kafka ecosystem offer?</p>
  </div>
  <p><strong>Kafka Connect</strong> moves data in and out with configuration instead of code. A <strong>source connector</strong> pulls data into Kafka; a <strong>sink connector</strong> pushes it out. Connect runs the connectors as workers, tracks their offsets and restarts them. The classic source is <strong>CDC</strong>: Debezium reads the Postgres write-ahead log and publishes every insert, update and delete as an event, which is the extract method the ETL note said a watermark can't match (it sees deletes).</p>
  <div class="flow"><span>Postgres WAL</span><span>Debezium source</span><span>Kafka topic</span><span>S3 / Snowflake sink</span><span>Warehouse</span></div>
  <p>A real Connect run, using the file sink connector that ships with Kafka: copy every event of <code>order-events</code> into a file, with no code. The worker config says where Kafka is and how to (de)serialise; the connector config says what to copy where:</p>
  <div class="fx" data-lang="text">name=order-events-to-file
connector.class=org.apache.kafka.connect.file.FileStreamSinkConnector
tasks.max=1
topics=order-events
file=/opt/de/kafka/connect/order_events.jsonl</div>
  <div class="fx" data-lang="text">$ connect-standalone.sh worker.properties order-events-to-file.properties     # stopped after 45 s
$ wc -l order_events.jsonl; head -2 order_events.jsonl
lines in order_events.jsonl: 21
{"order_id": 101, "restaurant": "Dosa Hut", "city": "Pune", "amount": 240, "event": "placed", "ts": "2026-03-02 12:10"}
{"order_id": 101, "restaurant": "Dosa Hut", "city": "Pune", "amount": 240, "event": "delivered", "ts": "2026-03-02 12:42"}</div>
  <p>All 21 events arrived in the file. Swap the class for an S3, JDBC or Snowflake sink and the same 5 lines land Biteful's events in the warehouse; the ETL's "load" step becomes continuous. For Biteful's app database, a Debezium source would look like this (<strong>example config, not run here</strong>):</p>
  <div class="fx" data-lang="text">{ "name": "biteful-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "app-db-replica", "database.dbname": "biteful",
    "topic.prefix": "biteful", "table.include.list": "public.orders" } }</div>
  <p><strong>Kafka Streams</strong> is a Java library (no cluster): your service reads topics, computes, and writes topics, with state kept in local RocksDB and backed up to compacted topics. The daily revenue pipeline of section 08 would look like this in Kafka Streams (<strong>Java, not run here</strong>; serde and timestamp-extractor setup omitted):</p>
  <div class="fx" data-lang="text">StreamsBuilder b = new StreamsBuilder();
KStream&lt;String, OrderEvent&gt; events = b.stream("order-events");
events.filter((orderId, e) -&gt; e.event.equals("delivered"))
      .groupBy((orderId, e) -&gt; e.city)                                   // re-key by city (a shuffle via a topic)
      .windowedBy(TimeWindows.ofSizeAndGrace(Duration.ofDays(1), Duration.ofDays(3)))
      .aggregate(() -&gt; 0L, (city, e, total) -&gt; total + e.amount)       // state in RocksDB
      .toStream()
      .to("daily-city-revenue");</div>
  <p>Read it against section 08: the filter, the one-day tumbling window, the 3-day grace (Kafka Streams' name for allowed lateness), the sum. <code>groupBy</code> re-keys by city, which Kafka Streams implements by writing to an internal "repartition" topic, its version of Spark's shuffle.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Connect is a courier service with standard routes: you fill in a form (config), they move the parcels. Kafka Streams is a kitchen gadget you install in your own kitchen (your service), instead of sending food to a central factory (a Spark or Flink cluster).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Kafka Connect</strong>: a framework and runtime for source/sink connectors configured declaratively, with offset tracking and fault tolerance. <strong>Kafka Streams</strong>: a client library for stateful stream processing (filters, joins, windows, aggregations) whose input and output are Kafka topics.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Connectors still need the ETL's discipline: a sink into a database should upsert by key (at-least-once delivery will repeat records), and a schema change upstream breaks sinks unless you use a schema registry (Avro/Protobuf/JSON Schema) and compatible changes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Kafka vs queues.</b> Kafka now carries Biteful's orders, feeds the warehouse, and computes live revenue. Is it the right tool for every message? Sending each customer exactly one "your order is on the way" SMS feels like a different job.</div>

  <h2 id="kf-vs"><span class="num">10</span>Kafka vs Queues</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>RabbitMQ and AWS SQS also move messages between services. When is a message queue the better choice, and what does Kafka's log give that a queue can't?</p>
  </div>
  <p>A <strong>message queue</strong> is a to-do list for workers: a message is delivered to <em>one</em> worker, acknowledged, and then deleted. Queues track each message individually (retry this one, delay that one, send failures to a dead-letter queue) and scale workers freely, with no partition limit. A <strong>log</strong> is a diary: messages stay; every group reads all of them in order per partition; you can replay; throughput is very high because reading and writing are sequential disk operations in batches.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A queue is a restaurant's ticket rail: a cook takes a ticket, cooks it, and the ticket is gone. A log is the restaurant's order book: every department (kitchen, billing, inventory) reads every line, at its own pace, and last month's pages are still there.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Kafka (log)</th><th>RabbitMQ / SQS (queue)</th></tr>
    <tr><td>After a message is read</td><td>Stays until retention</td><td>Deleted when acknowledged</td></tr>
    <tr><td>Many independent readers</td><td>Yes: one group each, all get everything</td><td>Needs a copy per reader (fan-out exchange / SNS)</td></tr>
    <tr><td>Replay history</td><td>Yes, reset offsets</td><td>No</td></tr>
    <tr><td>Ordering</td><td>Per partition (per key)</td><td>Per queue, weakened by parallel workers and redelivery</td></tr>
    <tr><td>Per-message control</td><td>Coarse (an offset per partition)</td><td>Fine: per-message ack, delay, priority, dead-letter</td></tr>
    <tr><td>Scaling consumers</td><td>Up to the partition count</td><td>Any number of workers</td></tr>
    <tr><td>Biteful example</td><td>order-events for kitchen, ETA, warehouse, analytics</td><td>"send this SMS once", "resize this photo"</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Use a <strong>queue</strong> for <em>task distribution</em>: each job done once by some worker, with per-job retries. Use a <strong>log</strong> (Kafka) for <em>event distribution</em>: facts that many systems need, in order per key, with history and replay.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using Kafka as a job queue hurts: one slow job blocks every event behind it in that partition (head-of-line blocking), and you can't retry one message without stopping the partition. Using a queue as an event bus hurts the other way: no replay, and a new consumer misses all history.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: build it.</b> We have every piece. Let's build the live restaurant board Biteful's operations team asked for, on the real topic: open orders per restaurant and average delivery minutes, always current.</div>

  <h2 id="kf-build"><span class="num">11</span>Build It: The Live Restaurant Board</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can the pieces (keyed events, a consumer group, at-least-once commits, idempotent processing) produce a correct live view, the kind of fresh feature an ETA model reads at request time?</p>
  </div>
  <p>The board is a consumer in its own group, <code>restaurant-board</code>. For each event it updates two numbers per restaurant, then commits (at-least-once). Because events can be re-delivered after a crash, it remembers which (order, event) pairs it has applied, so a repeat changes nothing: the idempotency idea from the ETL note, inside a consumer.</p>
  <div class="fx" data-lang="py">import json
from datetime import datetime
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "localhost:19092",
              "group.id": "restaurant-board",
              "auto.offset.reset": "earliest",      # no saved offset yet -&gt; start at the beginning
              "enable.auto.commit": False})         # we decide when to commit
c.subscribe(["order-events"])

open_orders, placed_at, minutes = {}, {}, {}        # the live board (a toy online store)
seen = set()                                        # (order_id, event) already applied: dedupe
empty = 0
while empty &lt; 5:                                    # stop after 5 quiet seconds (demo only)
    m = c.poll(1.0)
    if m is None:
        empty += 1; continue
    e = json.loads(m.value())
    if (e["order_id"], e["event"]) not in seen:     # a re-delivered event changes nothing
        seen.add((e["order_id"], e["event"]))
        r, t = e["restaurant"], datetime.fromisoformat(e["ts"])
        if e["event"] == "placed":
            open_orders[r] = open_orders.get(r, 0) + 1
            placed_at[e["order_id"]] = t
        else:
            open_orders[r] -= 1
            if e["event"] == "delivered":
                mins = (t - placed_at[e["order_id"]]).seconds // 60
                minutes.setdefault(r, []).append(mins)
    c.commit(message=m, asynchronous=False)         # process first, then commit: at-least-once
c.close()
print("open orders now  :", {r: n for r, n in open_orders.items() if n})
print("avg delivery mins:", {r: round(sum(v) / len(v), 1) for r, v in sorted(minutes.items())})</div>
  <div class="fx" data-lang="text">open orders now  : {'Dosa Hut': 1}
avg delivery mins: {'Biryani Bros': 39.3, 'Dosa Hut': 30.5, 'Momo Magic': 35.0, 'Pizza Point': 41.5}</div>
  <p>Check by hand. Open orders: every order was placed and later delivered or cancelled except 110 (Dosa Hut, pending): {Dosa Hut: 1} ✓. Average minutes: Biryani Bros (41 + 25 + 52) / 3 = 39.3; Dosa Hut (32 + 29) / 2 = 30.5; Pizza Point (38 + 45) / 2 = 41.5 (104's time comes from the event times, since the partner never recorded it); Momo Magic 35 (Gita's order 111) ✓. The board works only because each order's "placed" and "delivered" are in the same partition, in order: keyed by <code>order_id</code>, "delivered" can never arrive before "placed" and fail the subtraction. In production the dicts would be Redis (an <strong>online store</strong> the ETA model reads in milliseconds), the same numbers would also be written to the lake for training (see <a class="xref" data-note="sd_serving">serving</a>), and the <code>seen</code> set would be bounded state with a TTL.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>This board lives in memory: a restart rebuilds it by replaying the topic from the beginning (fine for 21 events, slow for a year). Real jobs keep state in a stream processor's checkpoints or in Redis, and snapshot it, so a restart resumes from the committed offset.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> The board is right. Which mistakes make real streaming systems wrong in ways nobody notices?</div>

  <h2 id="kf-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Streaming bugs show up as a number that is slightly off, a lag that slowly grows, or an event that silently vanished. Which ones should you check first?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting order across a topic</span>
    <p>Kafka orders records within a partition only. Events that must stay in order need the same key (order_id); nothing orders order 101 against order 107.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: auto-commit with slow processing</span>
    <p>The client commits on a timer whether or not you finished. Crash after the commit, before the write: silent loss. Turn it off and commit after processing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: more consumers than partitions</span>
    <p>With 3 partitions the 4th consumer of a group gets nothing. Scaling further needs more partitions, which remaps keys (8 of 11 moved for 3 → 5).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: non-idempotent sinks</span>
    <p>At-least-once repeats events during crashes and rebalances. "INSERT a row" or "add 1" double-counts; "UPSERT by event id" or "SET value" doesn't.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hot keys</span>
    <p>One giant key (a mega-sale restaurant, <code>"unknown"</code>, null) sends a big share of traffic to one partition and one consumer; lag grows on that partition only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting <code>flush()</code></span>
    <p><code>produce()</code> only buffers; a script that exits without <code>flush()</code> loses its last events with no error.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: processing-time windows</span>
    <p>A late event lands in the wrong window. Use event time and a watermark sized to how late events really arrive.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: streaming when batch would do</span>
    <p>Streaming jobs run 24×7, are harder to test and backfill, and need on-call. If nobody acts within minutes, schedule a batch job.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Ten ideas, one system. How does each build on the one before?</div>

  <h2 id="kf-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Log, partitions, keys, acks, idempotence, groups, offsets, semantics, retention, compaction, windows, watermarks, Connect, Streams: a list of features, or one design?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="kf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="140" height="50" rx="8" class="fb sb"/><text x="80" y="40" text-anchor="middle" font-weight="700">Producer</text><text x="80" y="57" text-anchor="middle" class="tm">acks=all · idempotent</text>
<line x1="150" y1="45" x2="183" y2="45" stroke="currentColor" marker-end="url(#kf-a9)"/>
<rect x="185" y="20" width="190" height="50" rx="8" class="fg sg"/><text x="280" y="40" text-anchor="middle" font-weight="700">Topic = partitioned logs</text><text x="280" y="57" text-anchor="middle" class="tm">crc32(order_id) % 3 · offsets</text>
<line x1="375" y1="45" x2="408" y2="45" stroke="currentColor" marker-end="url(#kf-a9)"/>
<rect x="410" y="20" width="150" height="50" rx="8" class="ft st"/><text x="485" y="40" text-anchor="middle" font-weight="700">Consumer groups</text><text x="485" y="57" text-anchor="middle" class="tm">1 owner per partition</text>
<line x1="560" y1="45" x2="593" y2="45" stroke="currentColor" marker-end="url(#kf-a9)"/>
<rect x="595" y="20" width="115" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="652" y="40" text-anchor="middle" font-weight="700">Results</text><text x="652" y="57" text-anchor="middle" class="tm">tickets · board · revenue</text>
<line x1="280" y1="70" x2="280" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#kf-a9)"/>
<rect x="185" y="110" width="190" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="280" y="128" text-anchor="middle">retention / compaction</text><text x="280" y="144" text-anchor="middle" class="tm">20 → 11 records, latest per key</text>
<line x1="485" y1="70" x2="485" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#kf-a9)"/>
<rect x="400" y="110" width="170" height="46" rx="8" class="fr sr"/><text x="485" y="128" text-anchor="middle">committed offsets</text><text x="485" y="144" text-anchor="middle" class="tm">lag 2 · at-least / exactly-once</text>
<line x1="652" y1="70" x2="652" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#kf-a9)"/>
<rect x="585" y="110" width="125" height="46" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="647" y="128" text-anchor="middle">windows + watermark</text><text x="647" y="144" text-anchor="middle" class="tm">= ETL gold table</text>
<rect x="10" y="190" width="700" height="50" rx="10" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="360" y="210" text-anchor="middle" font-weight="700">Ecosystem: Connect (config-only in/out: 21 events → file; Debezium CDC) · Kafka Streams / Flink / Spark (stateful processing)</text>
<text x="360" y="228" text-anchor="middle" class="tm">Queue instead when each task must be done once by one worker</text>
<text x="10" y="268" class="tm">Write side: keys decide partitions, partitions decide order and parallelism. Read side: offsets decide what a crash costs.</text>
<text x="10" y="286" class="tm">Everything else (compaction, windows, connectors) is built on "an ordered log per partition that readers never consume away".</text>
</g>
</svg><figcaption>One log, many readers. Producers append by key; groups read by offset; retention/compaction and stream processing are built on the same log.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's order events</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Streaming</td><td>events instead of nightly tables</td><td>why not tomorrow's batch?</td><td>101 known 11 h 50 min sooner</td><td>someone must act within seconds/minutes</td></tr>
    <tr><td>Log + offsets</td><td>append-only list, bookmarks</td><td>many readers, own pace, replay?</td><td>kitchen @4, loader @2, ETA replays from 0</td><td>always (it is Kafka)</td></tr>
    <tr><td>Partitions + keys</td><td>log split by <code>crc32(key) % n</code></td><td>scale while keeping per-order order?</td><td>101 → 2, 102 → 0, 107 → 1</td><td>key by the entity whose order matters</td></tr>
    <tr><td>acks / idempotence</td><td>replicas, producer id + sequence</td><td>stored? duplicated by retries?</td><td>acks=0: offset None; sim: duplicate dropped</td><td>acks=all + idempotence by default</td></tr>
    <tr><td>Consumer groups</td><td>partition ownership</td><td>share work without double-handling?</td><td>A [0,1,2] → B [0,1] + A [2] → A [0,1,2]</td><td>scale a service up to the partition count</td></tr>
    <tr><td>Delivery semantics</td><td>order of process vs commit; transactions</td><td>what does a crash cost?</td><td>at-most: 103 lost; at-least: 103 twice; EOS: 11 tickets + offsets</td><td>at-least-once + idempotent sink</td></tr>
    <tr><td>Lag</td><td>log-end − committed offset</td><td>are we keeping up?</td><td>partition 2: 7 − 5 = 2</td><td>monitor always</td></tr>
    <tr><td>Retention / compaction</td><td>segments; latest per key</td><td>how long, which records?</td><td>20 → 11 records; tombstone removed 105</td><td>delete for event history; compact for current state</td></tr>
    <tr><td>Windows + watermark</td><td>event time, allowed lateness</td><td>totals on endless, late data?</td><td>1 day: 104 dropped; 3 days: = ETL gold</td><td>any streaming aggregate</td></tr>
    <tr><td>Connect / Streams</td><td>connectors; Java library</td><td>avoid hand-written plumbing?</td><td>21 events → file, config only</td><td>moving data in/out; JVM services</td></tr>
    <tr><td>Kafka vs queue</td><td>log vs delete-on-ack</td><td>which tool?</td><td>order-events (log) vs "send SMS once" (queue)</td><td>events vs tasks</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>Kafka is an ordered log per partition that readers never consume away; keys decide where an event goes and therefore what stays in order, and offsets decide where each reader is and therefore what a crash costs.</strong> Idempotent producers and idempotent sinks turn "at least once" into "effectively once", exactly like the ETL note's idempotent loads; windows and watermarks turn the endless log into the same tables the batch pipeline builds, just sooner.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="kf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's orders 101–110 as 19 events (10 placed, 7 delivered, 2 cancelled; 110 pending) in topic <code>order-events</code> with 3 partitions, key = order id: partition 0 ← 102, 103, 104, 106; partition 1 ← 107, 108, 109; partition 2 ← 101, 105, 110 (and later 111, Gita's order).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Batch vs streaming</td><td>why not tomorrow?</td><td>101 seen 11 h 50 min late by batch</td><td>many readers → log</td></tr>
    <tr><td>Log</td><td>same events, own pace</td><td>bookmarks 4 and 2; replay from 0</td><td>one machine → partitions</td></tr>
    <tr><td>Partitions &amp; keys</td><td>scale + per-key order</td><td>crc32 % 3: 101 → 2</td><td>network failures → producers</td></tr>
    <tr><td>Producers</td><td>stored? duplicated?</td><td>acks=0 → None; idempotence drops repeat</td><td>share reading → groups</td></tr>
    <tr><td>Consumer groups</td><td>split work</td><td>[0,1,2] → [0,1]+[2] → [0,1,2]</td><td>crashes → offsets</td></tr>
    <tr><td>Offsets &amp; semantics</td><td>what a crash costs</td><td>103 lost / twice; 11 tickets in a transaction; lag 2</td><td>log grows → retention</td></tr>
    <tr><td>Retention &amp; compaction</td><td>keep what, how long</td><td>20 → 11 records</td><td>compute on streams → windows</td></tr>
    <tr><td>Windows &amp; watermarks</td><td>totals on endless, late data</td><td>3-day lateness = ETL gold</td><td>plumbing by hand → Connect/Streams</td></tr>
    <tr><td>Connect &amp; Streams</td><td>config-only movement; library processing</td><td>21 events → file</td><td>right tool? → queues</td></tr>
    <tr><td>Kafka vs queues</td><td>events vs tasks</td><td>order-events vs SMS jobs</td><td>→ <a class="xref" data-note="sd_serving">serving fresh features</a></td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Broker / topic / partition</td><td>one Kafka server / a named stream / one ordered log inside a topic</td></tr>
    <tr><td>Offset</td><td>a record's position in a partition: 0, 1, 2…; never changes (compaction leaves gaps)</td></tr>
    <tr><td>Partition of a key</td><td><code>hash(key) % n</code>: hash = CRC32 (librdkafka) or murmur2 (Java); n = partition count</td></tr>
    <tr><td>acks</td><td>0: no reply; 1: leader wrote it; all: all in-sync replicas (ISR) wrote it</td></tr>
    <tr><td>Idempotent producer</td><td>producer id + per-partition sequence number; broker drops duplicates</td></tr>
    <tr><td>Consumer group / rebalance</td><td>members sharing a group.id, one owner per partition / reassignment on join, leave, crash</td></tr>
    <tr><td>Committed offset / lag</td><td>next offset a group will read / lag = log-end offset − committed offset</td></tr>
    <tr><td>At-most / at-least / exactly-once</td><td>commit then process / process then commit / atomic output + offsets (transactions) or idempotent sink</td></tr>
    <tr><td>Retention / compaction / tombstone</td><td>delete old segments by age/size / keep latest per key / null value deletes a key</td></tr>
    <tr><td>Window / watermark</td><td>a slice of event time (tumbling, hopping, session) / max event time − allowed lateness</td></tr>
    <tr><td>Connect / Kafka Streams</td><td>config-only source/sink connectors / Java library for stateful processing</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Streaming</b><p>Use when someone acts within seconds: kitchens, riders, fraud, live features.</p><small>Not for a once-a-day report</small></div>
    <div><b>Key by entity</b><p>Use the id whose events must stay in order (order_id).</p><small>No key = no order; hot keys overload one partition</small></div>
    <div><b>At-least-once + idempotent sink</b><p>The default for writes to databases.</p><small>Never "add 1" or plain INSERT in the sink</small></div>
    <div><b>Transactions (EOS)</b><p>Kafka → Kafka processing where duplicates are unacceptable.</p><small>Don't cover external databases</small></div>
    <div><b>Compacted topic</b><p>Current state per key (order status, user profile).</p><small>Not for full history</small></div>
    <div><b>Queue instead</b><p>Tasks done once by any worker, per-message retry/delay.</p><small>No replay, no many-reader fan-out</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Expecting order across partitions; adding partitions remaps keys; auto-commit before processing; more consumers than partitions; non-idempotent sinks under at-least-once; hot keys; no <code>flush()</code>; processing-time windows; slow processing beyond <code>max.poll.interval.ms</code> → rebalance storm; using Kafka as a job queue; streaming where batch would do.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>crc32("101") = 1,416,650,876. Which of 3 partitions?</td><td>1,416,650,876 % 3 = 2 → partition 2.</td></tr>
    <tr><td>A group of 4 consumers reads a 3-partition topic. How many are busy?</td><td>3; the fourth is idle.</td></tr>
    <tr><td>Committed offset 5, log-end offset 7. Lag?</td><td>2.</td></tr>
    <tr><td>Commit, then process; crash between. Lost or repeated?</td><td>Lost (at-most-once).</td></tr>
    <tr><td>A compacted topic has "101 placed" then "101 delivered". What survives?</td><td>"101 delivered" (latest per key), at its original offset.</td></tr>
  </table>

  <h2 id="kf-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, out loud and without notes, why each Kafka idea exists and what breaks without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How is Kafka different from a traditional message queue like RabbitMQ or SQS?</summary><div class="qa-body">Kafka is a durable, partitioned log: reading doesn't delete, so many consumer groups read the same events independently and can replay from any offset until retention expires. Queues usually delete a message once acknowledged and give each message to one worker, with fine per-message control. Kafka also has very high throughput thanks to sequential disk I/O and batching.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an offset?</summary><div class="qa-body">The position of a record inside one partition: 0, 1, 2 … It never changes. A group's committed offset is its bookmark: "the next record I need is at offset N".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Kafka guarantee ordering?</summary><div class="qa-body">Only within a partition. Records with the same key go to the same partition, so per-key order is kept (each Biteful order's placed → delivered). There is no order across partitions. The idempotent producer keeps order even with retries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A topic has 6 partitions; your group has 8 consumers. What happens?</summary><div class="qa-body">6 consumers get one partition each; 2 sit idle as standbys. To use more, add partitions, which remaps keys and breaks per-key ordering during the change, so plan partition counts up front.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain at-most-once, at-least-once and exactly-once.</summary><div class="qa-body">At-most-once: commit before processing; a crash loses the event. At-least-once: process, then commit; a crash repeats it. Exactly-once: output and offset commit happen atomically (Kafka transactions, for Kafka → Kafka), or at-least-once plus an idempotent sink (upsert by event id) for external systems.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>acks=all</code> mean, and what is the ISR?</summary><div class="qa-body">The producer waits until the leader and all in-sync replicas (followers fully caught up) have the record. With <code>min.insync.replicas=2</code> and replication factor 3, an acknowledged write survives one broker dying. <code>acks=1</code> can lose data if the leader dies before followers copy it; <code>acks=0</code> doesn't even learn the offset.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your consumer lag keeps growing. What do you check?</summary><div class="qa-body">Is per-event work too slow (model calls, sync DB writes)? Batch or parallelise. Fewer consumers than partitions? Add consumers. One partition hot (skewed key)? Fix the key. Frequent rebalances (<code>max.poll.interval.ms</code> exceeded)? Check consumer logs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Retention vs log compaction?</summary><div class="qa-body">Retention deletes old segments by time or size, regardless of key. Compaction keeps at least the latest record per key and drops older ones, so the topic acts as current state (Biteful's order-status went 20 → 11 records). A null value (tombstone) deletes a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Event time vs processing time: why does it matter?</summary><div class="qa-body">Event time is when it happened; processing time is when you saw it. Events arrive late and out of order (offline phones, retries). Windows by processing time put events in the wrong bucket. Use event time plus a watermark (104's late delivery was dropped with 1 day of lateness, kept with 3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Kafka Streams vs Flink vs Spark Structured Streaming: how do you choose?</summary><div class="qa-body">Kafka Streams: a library inside JVM services, Kafka in and out, no cluster. Flink: lowest latency, true per-record processing, best event-time and large-state handling. Spark Structured Streaming: micro-batches with the same DataFrame API as batch; good when the team already uses Spark and Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does at-least-once delivery need the ETL note's idempotency?</summary><div class="qa-body">At-least-once means some events are processed twice (after a crash, 103's ticket was sent again). If the sink adds or appends, the effect is doubled, like the ETL's 1210 → 2420. If the sink upserts by key or dedupes by event id (the board's <code>seen</code> set), a repeat changes nothing, so the result is effectively exactly once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must the key be order_id rather than restaurant or random?</summary><div class="qa-body">The key decides the partition, and only a partition is ordered. With order_id, each order's placed and delivered events are in one partition in order, so the board can compute minutes from placed to delivered. With random keys, "delivered" could be read before "placed". Keying by restaurant would also keep order, but a mega-sale restaurant would become a hot key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if consumers commit offsets but the producer is not idempotent?</summary><div class="qa-body">Duplicates enter the log itself: a retried "101 delivered" is stored twice at two offsets. Consumer-side semantics can't help, because these are two real records; every reader sees the order delivered twice. Duplicates must be prevented at each hop: idempotent producer into Kafka, offsets or transactions out of it, idempotent sink at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does the streaming revenue table relate to the ETL's gold table?</summary><div class="qa-body">Same question, same answer, different timing. The ETL computed delivered revenue per city per day once a night from the warehouse; the streaming job computed it from events with one-day tumbling windows and a 3-day watermark, and produced identical rows as soon as each delivery arrived. The watermark plays the role of the ETL's "wait until the day is over"; late events play the role of the incremental watermark's changed rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a real-time "open orders per restaurant" feature for an ETA model.</summary><div class="qa-body">The app produces order events keyed by order_id with acks=all and idempotence. A stream job (Flink, Spark, Kafka Streams, or a consumer group) keeps open orders and recent delivery minutes per restaurant, deduplicating by event id, checkpointing state. It writes to an online store (Redis) for the model API and to the lake for training, so both use the same definition. Monitor lag and alert when it grows.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sd_serving">serving and feature pipelines</a>.</b> Kafka gives Biteful fresh, ordered, replayable events, and the board turns them into live numbers. How a model reads those numbers at request time, keeps them consistent with training, and is monitored in production is the subject of ML system design.</div>
</main>
`
});
