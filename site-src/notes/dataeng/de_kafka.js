// notes/dataeng/de_kafka.js — Kafka & Streaming
Object.assign(TOPIC_CONTENT, {
  "de_kafka": `<main>
  <h1>Kafka &amp; Streaming</h1>
  <p class="lead">Kafka is the pipe that carries events (clicks, payments, database changes) from the systems that create them to the systems that need them, within milliseconds. For ML it powers fresh features, live fraud scoring and copying database changes into the warehouse. This note starts from "why not just run a nightly job?" and builds up to a working streaming feature pipeline. Every Kafka output below is from a real run on a local Kafka 3.9.1 broker with the <code>confluent-kafka</code> Python client. Builds on ETL: same ideas, but the data never stops arriving.</p>

  <h2 id="kf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Kafka &amp; Streaming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Batch vs Streaming</div>
        <ul>
          <li><b>Batch</b> — bounded data ("yesterday's orders"), run on a schedule; minutes–hours late; simple, cheap</li>
          <li><b>Streaming</b> — unbounded events, handled as they arrive; milliseconds–seconds</li>
          <li><b>Use streaming for</b> — fraud, real-time features, alerts, CDC (copying DB changes)</li>
          <li><b>Event time vs processing time</b> — when it happened vs when we saw it</li>
          <li>💡 newspaper (batch) vs live cricket score (stream)</li>
          <li>⚠ "real-time" is often not needed; ask what latency the decision needs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The Log</div>
        <ul>
          <li><b>Log</b> — append-only, ordered list of records; never edited</li>
          <li><b>Offset</b> — a record's position in a partition: 0, 1, 2 …</li>
          <li><b>Reading doesn't delete</b> — each group keeps its own bookmark; replay possible</li>
          <li><b>Retention</b> — delete by age (<code>retention.ms</code>, default 7 days) or size</li>
          <li><b>Compaction</b> — keep only the latest record per key (a changelog)</li>
          <li>💡 a society visitor register: guards add lines, readers keep their own bookmark</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Topics &amp; Partitions</div>
        <ul>
          <li><b>Broker</b> — one Kafka server; a cluster has several</li>
          <li><b>Topic</b> — named stream (<code>clicks</code>), split into <b>partitions</b></li>
          <li><b>Key → partition</b> — <code>hash(key) % partitions</code>; same key, same partition</li>
          <li><b>Ordering</b> — only within one partition, never across a topic</li>
          <li><b>Replication</b> — leader + followers; ISR = in-sync replicas; <code>acks=all</code> waits for ISR</li>
          <li><b>Producer safety</b> — <code>acks=all</code> + <code>enable.idempotence=true</code></li>
          <li>⚠ adding partitions remaps keys → per-key order breaks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Consumer Groups</div>
        <ul>
          <li><b>Group</b> — consumers sharing a <code>group.id</code> split the partitions</li>
          <li><b>Rule</b> — each partition → exactly one consumer in the group</li>
          <li><b>Scale</b> — useful consumers ≤ partitions; extras sit idle</li>
          <li><b>Different groups</b> — each gets every message (fan-out)</li>
          <li><b>Rebalance</b> — join / leave / crash → partitions reshuffled; brief pause</li>
          <li><b>Lag</b> — log-end offset − committed offset; the key health number</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Offsets &amp; Semantics</div>
        <ul>
          <li><b>Commit</b> — save "done up to here" in <code>__consumer_offsets</code></li>
          <li><b>At-most-once</b> — commit, then process; crash → message lost</li>
          <li><b>At-least-once</b> — process, then commit; crash → duplicate (usual default)</li>
          <li><b>Exactly-once</b> — Kafka transactions (Kafka → Kafka) or at-least-once + idempotent sink</li>
          <li><b>auto.offset.reset</b> — <code>earliest</code> / <code>latest</code> when the group has no offset</li>
          <li>⚠ auto-commit can commit before you finish → silent loss</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ecosystem &amp; Windows</div>
        <ul>
          <li><b>Kafka Connect</b> — config-only connectors (Debezium CDC, S3, JDBC, Snowflake)</li>
          <li><b>Kafka Streams</b> — Java library, Kafka in and out, no cluster</li>
          <li><b>Flink</b> — record-at-a-time engine; best event-time + big state</li>
          <li><b>Spark Structured Streaming</b> — micro-batches, DataFrame API, Python-friendly</li>
          <li><b>Windows</b> — tumbling (fixed), hopping (overlap), session (gap-based)</li>
          <li><b>Watermark</b> — how late an event may be and still count</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streaming ML Features</div>
        <ul>
          <li><b>Flow</b> — events → Kafka → windowed aggregates → online store (Redis) → model</li>
          <li><b>Also write offline</b> → lake for training; same logic avoids training/serving skew</li>
          <li><b>Key by entity</b> (user_id, card_id) so one entity's events stay in order</li>
          <li>⚠ in-memory state dies on restart; dedupe by event id</li>
          <li>⚠ slow processing &gt; <code>max.poll.interval.ms</code> → rebalance storm</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="kf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch vs Streaming</span><span class="rm-sub">When latency matters</span></div></div>
      <div class="rm-item rm-done" data-target="kf-log"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Log</span><span class="rm-sub">Kafka's one big idea</span></div></div>
      <div class="rm-item rm-done" data-target="kf-part"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Producers, Topics, Partitions</span><span class="rm-sub">Keys decide ordering</span></div></div>
      <div class="rm-item rm-done" data-target="kf-group"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Consumer Groups</span><span class="rm-sub">Scaling, rebalancing, lag</span></div></div>
      <div class="rm-item rm-done" data-target="kf-sem"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Offsets &amp; Delivery Semantics</span><span class="rm-sub">At-most, at-least, exactly once</span></div></div>
      <div class="rm-item rm-done" data-target="kf-eco"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Connect, Processors &amp; Windows</span><span class="rm-sub">Streams vs Flink vs Spark</span></div></div>
      <div class="rm-item rm-done" data-target="kf-ml"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Build It: Streaming Features</span><span class="rm-sub">Clicks → features, real broker</span></div></div>
      <div class="rm-item rm-done" data-target="kf-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Ordering, commits, hot keys</span></div></div>
      <div class="rm-item rm-done" data-target="kf-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="kf-why"><span class="num">01</span>Batch vs Streaming</h2>
  <p>Start with a problem. A UPI payments company runs a fraud check every night at midnight. At 9:01 a stolen card starts making large payments: ₹9,000, then ₹9,500, then ₹9,900. The nightly job finds it the next morning. By then the money is gone. The check was correct; it was just <em>too late</em>.</p>
  <p>There are two ways to process data. <strong>Batch</strong> means: collect data for a period, then process all of it at once on a schedule ("every night, look at yesterday"). The data is <strong>bounded</strong>: it has a clear start and end. <strong>Streaming</strong> means: process each event as soon as it arrives, and keep going forever. The data is <strong>unbounded</strong>: it never ends. An <strong>event</strong> is one small fact that happened: "card7 paid ₹9,000 at 09:01".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Batch is the morning newspaper: complete, cheap, but it tells you yesterday's score. Streaming is the live cricket score on your phone: every ball updates it within seconds. You need the live score only if you are going to act on it right now, like a bookie or a fraud system.</p>
  </div>
  <p>The tiny program below runs the same fraud rule ("alert if a card's total crosses ₹15,000") both ways. The batch function waits for the whole day's list. The stream function looks at one payment at a time and keeps a running total.</p>
  <div class="fx" data-lang="py">payments = [("09:00", "card7", 500), ("09:01", "card7", 9000), ("09:02", "card7", 9500),
            ("09:03", "card2", 200), ("09:04", "card7", 9900)]

# Batch: wait for the whole day, then look at everything at once
def nightly_batch(rows):
    total = {}
    for _, card, amt in rows:
        total[card] = total.get(card, 0) + amt
    return {c: t for c, t in total.items() if t &gt; 15000}

# Streaming: look at each payment the moment it arrives, keep a running total
def stream(rows):
    total = {}
    for time, card, amt in rows:
        total[card] = total.get(card, 0) + amt
        if total[card] &gt; 15000:
            print(f"{time} ALERT {card} running total {total[card]}")
            return

print("batch (runs at midnight):", nightly_batch(payments))
stream(payments)</div>
  <div class="fx" data-lang="text">batch (runs at midnight): {'card7': 28900}
09:02 ALERT card7 running total 19000</div>
  <p>Both find card7. The batch answer arrives at midnight and includes the ₹9,900 payment that streaming would have blocked. The stream answer arrives at 09:02, after only the third payment. The logic is identical; only <em>when</em> it runs differs. In real life the list is not in memory: events flow in forever, and Kafka is the system that carries them.</p>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Streaming</th></tr>
    <tr><td>Data</td><td>Bounded: "yesterday's orders"</td><td>Unbounded: events keep coming</td></tr>
    <tr><td>Latency</td><td>Minutes to hours</td><td>Milliseconds to seconds</td></tr>
    <tr><td>Tools</td><td>Airflow + Spark / SQL</td><td>Kafka + Flink / Spark Streaming</td></tr>
    <tr><td>ML use</td><td>Nightly training, daily scores</td><td>Fraud checks, "clicks in last 5 min" features</td></tr>
    <tr><td>Cost</td><td>Simple, cheap, easy to rerun</td><td>Always on, harder to debug and backfill</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Event time</strong> is when the event really happened (the phone recorded the tap at 09:01). <strong>Processing time</strong> is when our system saw it (the phone was offline and sent it at 09:07). Streams arrive late and out of order, so serious streaming code groups by event time. Section 06 shows how.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Real-time" is often not needed. If the business looks at a dashboard once each morning, an hourly batch is cheaper and simpler. In interviews and design reviews, first ask: "what latency does the decision really need?"</p>
  </div>

  <h2 id="kf-log"><span class="num">02</span>The Log</h2>
  <p>Say three teams want the same click events: fraud, analytics and recommendations. With a normal <strong>queue</strong> (RabbitMQ, AWS SQS) a message is deleted once one reader takes it, so you would need three copies of every event, one per team. A slow team would hold everyone back, and once a message is gone you can never re-read it to fix a bug.</p>
  <p>Kafka's one big idea fixes this: store events in a <strong>log</strong>. A log is just a list that you only ever add to at the end. Nothing in it is edited or removed by reading. Each record gets a position number called its <strong>offset</strong>: 0, 1, 2 and so on. Each reader keeps its own bookmark, "I have read up to offset 4". Reading moves your bookmark, not the data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The visitor register at a housing society gate. The guard only adds new lines at the bottom. The secretary reads it weekly, the police read it after a theft, and each keeps a slip of paper saying "I read up to line 212". Reading never tears out a page. Old pages are thrown away only when they get too old (that is <strong>retention</strong>).</p>
  </div>
  <p>Let's build a toy log in plain Python to watch the bookmarks move. <code>append</code> adds at the end and returns the offset. <code>poll</code> returns records starting at a group's bookmark. <code>commit</code> moves the bookmark.</p>
  <div class="fx" data-lang="py">class Log:
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
for page in ["home", "cart", "product", "checkout"]:
    print("appended at offset", log.append(page))

batch = log.poll("fraud")                     # fraud reads everything
print("fraud got:", batch)
log.commit("fraud", batch[-1][0] + 1)

batch = log.poll("analytics", max_n=2)        # analytics is slower
print("analytics got:", batch)
log.commit("analytics", batch[-1][0] + 1)

log.append("payment")
print("bookmarks:", log.committed, "| log length:", len(log.records))
print("fraud next:", log.poll("fraud"))
print("analytics next:", log.poll("analytics"))
print("replay from 0:", log.poll("new-team")[:2])</div>
  <div class="fx" data-lang="text">appended at offset 0
appended at offset 1
appended at offset 2
appended at offset 3
fraud got: [(0, 'home'), (1, 'cart'), (2, 'product'), (3, 'checkout')]
analytics got: [(0, 'home'), (1, 'cart')]
bookmarks: {'fraud': 4, 'analytics': 2} | log length: 5
fraud next: [(4, 'payment')]
analytics next: [(2, 'product'), (3, 'checkout'), (4, 'payment')]
replay from 0: [(0, 'home'), (1, 'cart')]</div>
  <p>Trace it. Fraud read all four records and committed 4, meaning "next time start at 4". Analytics read only two and committed 2. When "payment" arrived at offset 4, fraud got just that one, while analytics still had three to catch up on. Neither slowed the other. A brand-new team with no bookmark started from offset 0 and could <strong>replay</strong> history. The real Kafka works the same way, only the log is a file on disk and the bookmarks are stored in a special internal topic.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="kf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="12" text-anchor="middle">
      <rect x="20" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="48" y="73">0</text>
      <rect x="76" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="104" y="73">1</text>
      <rect x="132" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="160" y="73">2</text>
      <rect x="188" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="216" y="73">3</text>
      <rect x="244" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="272" y="73">4</text>
      <rect x="300" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="328" y="73">5</text>
      <rect x="356" y="50" width="56" height="36" class="fs" stroke="currentColor"/><text x="384" y="73">6</text>
      <rect x="412" y="50" width="56" height="36" class="fb" stroke="currentColor"/><text x="440" y="73">7 new</text>
    </g>
    <line x1="560" y1="68" x2="472" y2="68" stroke="currentColor" marker-end="url(#kf-ar)"/>
    <text x="520" y="58" text-anchor="middle" font-size="11">producer appends</text>
    <line x1="160" y1="125" x2="160" y2="90" class="sg" stroke-width="2" marker-end="url(#kf-ar)"/>
    <text x="160" y="142" text-anchor="middle" font-size="11" class="tg">analytics group @ 2</text>
    <line x1="384" y1="125" x2="384" y2="90" class="sb" stroke-width="2" marker-end="url(#kf-ar)"/>
    <text x="384" y="142" text-anchor="middle" font-size="11" class="tb">fraud group @ 6</text>
    <text x="20" y="35" font-size="11" class="tm">oldest (deleted after retention)</text>
    <text x="300" y="20" text-anchor="middle" font-size="12" font-weight="bold">partition 0 of topic "clicks"</text>
  </svg><figcaption>Records are only appended. Each consumer group keeps its own offset, so slow and fast readers don't interfere.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A Kafka <strong>log</strong> is an immutable (never changed), ordered, append-only sequence of records. <strong>Retention</strong> deletes old records by age (<code>retention.ms</code>, default 7 days) or total size. A <strong>compacted</strong> topic instead keeps at least the latest record for each key, like a table of "current value per user"; a record with a null value (a <strong>tombstone</strong>) deletes that key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Kafka is a queue" is the most common wrong answer. Kafka never deletes a message because someone read it. That is why many teams can read the same data and why you can rewind and reprocess after fixing a bug, as long as retention hasn't expired.</p>
  </div>

  <h2 id="kf-part"><span class="num">03</span>Producers, Topics, Partitions</h2>
  <p>One log on one machine has limits: one disk, one network card. Flipkart's sale day produces millions of clicks per second. Kafka spreads the load by splitting each named stream, a <strong>topic</strong> (for example <code>clicks</code>), into several <strong>partitions</strong>. Each partition is its own log and can live on a different <strong>broker</strong> (one Kafka server). A program that writes events is a <strong>producer</strong>; one that reads is a <strong>consumer</strong>.</p>
  <p>Which partition does an event go to? Each event can carry a <strong>key</strong>, for example the user id. Kafka hashes the key (turns it into a number) and takes the remainder: <code>hash(key) % number_of_partitions</code>. Same key, same number, same partition, every time. That is how all of one user's events stay together and in order.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank with three counters and a rule "surnames A–H go to counter 1, I–P to counter 2, Q–Z to counter 3". All of Mr Sharma's deposits go to counter 3, so his passbook entries are in order. But nobody can say whether counter 1's 10:05 entry came before counter 3's 10:05 entry. Order exists per counter, not across the bank.</p>
  </div>
  <p>A toy version first, using <code>zlib.crc32</code> as the hash (Python's built-in <code>hash()</code> changes every run, so it's no good here). This is the same CRC32 hash that the <code>confluent-kafka</code> client uses by default, so the toy predicts the real run below.</p>
  <div class="fx" data-lang="py">import zlib

def pick_partition(key, num_partitions):
    return zlib.crc32(key.encode()) % num_partitions   # same key -&gt; same number, every time

events = [("u1", "home"), ("u2", "cart"), ("u1", "product"),
          ("u3", "home"), ("u1", "checkout"), ("u2", "home")]
partitions = {0: [], 1: [], 2: []}
for user, page in events:
    p = pick_partition(user, 3)
    partitions[p].append(f"{user}:{page}")
for p, recs in partitions.items():
    print(f"partition {p}: {recs}")</div>
  <div class="fx" data-lang="text">partition 0: ['u2:cart', 'u2:home']
partition 1: []
partition 2: ['u1:home', 'u1:product', 'u3:home', 'u1:checkout']</div>
  <p>u1 and u3 both hash to partition 2, and partition 1 gets nothing: with only 3 keys, collisions are likely. With thousands of users it evens out. Now the real thing. First create the topic with the Kafka command-line tool, then produce the same six events.</p>
  <div class="fx" data-lang="text">$ kafka-topics.sh --bootstrap-server localhost:9092 --create --topic clicks --partitions 3 --replication-factor 1
Created topic clicks.</div>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Producer

p = Producer({"bootstrap.servers": "localhost:9092",
              "acks": "all",                    # wait until the write is safely stored
              "enable.idempotence": True})      # retries never create duplicates

def report(err, msg):                           # called once per message, after the broker answers
    if err is not None:
        print("FAILED:", err)
    else:
        print(f"key={msg.key().decode()} -&gt; partition {msg.partition()} offset {msg.offset()}")

events = [("u1", "home"), ("u2", "cart"), ("u1", "product"),
          ("u3", "home"), ("u1", "checkout"), ("u2", "home")]
for user, page in events:
    p.produce("clicks", key=user, value=json.dumps({"user": user, "page": page}),
              callback=report)
p.flush()                                       # block until every message is acknowledged</div>
  <div class="fx" data-lang="text">key=u1 -&gt; partition 2 offset 0
key=u1 -&gt; partition 2 offset 1
key=u3 -&gt; partition 2 offset 2
key=u1 -&gt; partition 2 offset 3
key=u2 -&gt; partition 0 offset 0
key=u2 -&gt; partition 0 offset 1</div>
  <p>What happened: <code>produce</code> does not send immediately; it puts the message in a local buffer and returns. The client sends buffered messages in batches in the background. <code>flush()</code> waits until the broker has confirmed all of them, and for each confirmation it calls <code>report</code>. Exactly as the toy predicted, every u1 event landed in partition 2 in send order (home → product → checkout, offsets 0, 1, 3). The confirmations print grouped by partition because each partition's batch is acknowledged separately.</p>
  <p><strong>Replication</strong> keeps data safe when a broker dies. Each partition has one <strong>leader</strong> (takes all reads and writes) and some <strong>followers</strong> (copy the leader). Followers that are fully caught up form the <strong>ISR</strong>, the in-sync replicas. If the leader dies, an ISR member takes over.</p>
  <table class="tbl">
    <tr><th>Producer setting</th><th>Meaning</th></tr>
    <tr><td><code>acks=0 / 1 / all</code></td><td>Don't wait / wait for the leader / wait for all in-sync replicas (safest, default in new clients)</td></tr>
    <tr><td><code>enable.idempotence=true</code></td><td>Broker drops duplicates caused by producer retries, per partition</td></tr>
    <tr><td><code>linger.ms</code>, <code>batch.size</code></td><td>Wait a little to fill bigger batches: more throughput, slightly more latency</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>partition</strong> is the unit of both parallelism and ordering in Kafka. Kafka guarantees order <em>within</em> a partition only. Records with the same key go to the same partition (as long as the partition count doesn't change).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adding partitions later changes the <code>% n</code>. With the same hash, going from 3 to 5 partitions moves u2 from partition 0 to 4 and u3 from 2 to 1, so new events for a user land somewhere else and per-key order breaks during the switch. Pick the partition count up front, with room to grow. Also: no key means events are spread for throughput with no ordering, and one huge key (a celebrity account) overloads one partition — a <strong>hot key</strong>.</p>
  </div>

  <h2 id="kf-group"><span class="num">04</span>Consumer Groups</h2>
  <p>One consumer reading a busy topic falls behind. You want to start five copies of your program and have them share the work, without two copies handling the same event. You also want a separate team to read the same events without disturbing you. Kafka solves both with <strong>consumer groups</strong>.</p>
  <p>The rule is simple. Consumers that use the same <code>group.id</code> form a group and split the partitions between them: each partition is given to exactly one consumer in the group. Different groups are independent: each group gets every message. When a consumer joins, leaves or crashes, Kafka redistributes the partitions. That redistribution is called a <strong>rebalance</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Exam answer sheets from three classrooms (partitions) and a team of examiners (one group). Each classroom's bundle goes to exactly one examiner, so no sheet is marked twice. If a second examiner arrives, the head examiner takes one bundle away from the first and hands it over (rebalance). The moderation board is a different group: it gets its own look at every sheet. A fourth examiner with only three bundles has nothing to do.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="kf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="70" y="18" text-anchor="middle" font-weight="bold">topic clicks</text>
    <rect x="20" y="30" width="100" height="32" rx="4" class="fs"/><text x="70" y="51" text-anchor="middle">P0</text>
    <rect x="20" y="80" width="100" height="32" rx="4" class="fs"/><text x="70" y="101" text-anchor="middle">P1</text>
    <rect x="20" y="130" width="100" height="32" rx="4" class="fs"/><text x="70" y="151" text-anchor="middle">P2</text>
    <rect x="240" y="22" width="150" height="150" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <text x="315" y="190" text-anchor="middle" font-size="11">group "demo-group"</text>
    <rect x="265" y="40" width="100" height="36" rx="6" class="fb"/><text x="315" y="63" text-anchor="middle">consumer A</text>
    <rect x="265" y="115" width="100" height="36" rx="6" class="ft"/><text x="315" y="138" text-anchor="middle">consumer B</text>
    <g stroke="currentColor" marker-end="url(#kf-ar2)">
      <line x1="120" y1="46" x2="263" y2="56"/>
      <line x1="120" y1="96" x2="263" y2="64"/>
      <line x1="120" y1="146" x2="263" y2="134"/>
    </g>
    <rect x="450" y="70" width="130" height="36" rx="6" class="fv"/><text x="515" y="93" text-anchor="middle">group "analytics"</text>
    <text x="515" y="125" text-anchor="middle" font-size="11" class="tm">separate group:</text>
    <text x="515" y="140" text-anchor="middle" font-size="11" class="tm">gets ALL partitions too</text>
  </svg><figcaption>Within a group, each partition goes to exactly one consumer (here A has P0 and P1, B has P2). Across groups, everyone gets everything.</figcaption></figure>
  <p>The script below is one consumer. It takes a name and a lifetime in seconds, joins <code>demo-group</code>, and prints whenever Kafka assigns it partitions (the <code>on_assign</code> callback). We start A for 30 seconds, start B 8 seconds later for 10 seconds, and watch.</p>
  <div class="fx" data-lang="py">import sys, time
from confluent_kafka import Consumer

name, lifetime = sys.argv[1], float(sys.argv[2])     # e.g. "A" 25  -&gt; run for 25 seconds
c = Consumer({"bootstrap.servers": "localhost:9092",
              "group.id": "demo-group",                # same group id = share the work
              "auto.offset.reset": "earliest"})

def on_assign(consumer, partitions):
    print(f"{time.strftime('%H:%M:%S')} {name} assigned {sorted(p.partition for p in partitions)}", flush=True)

c.subscribe(["clicks"], on_assign=on_assign)
end = time.time() + lifetime
while time.time() &lt; end:
    c.poll(0.5)                                        # polling also sends heartbeats
c.close()                                              # leave the group cleanly
print(f"{time.strftime('%H:%M:%S')} {name} left", flush=True)

# shell: python group.py A 30 &amp;  sleep 8;  python group.py B 10</div>
  <div class="fx" data-lang="text">04:18:29 A assigned [0, 1, 2]
04:18:32 B assigned [2]
04:18:32 A assigned [0, 1]
04:18:41 B left
04:18:41 A assigned [0, 1, 2]
04:18:53 A left</div>
  <p>Read the timeline. Alone, A owned all three partitions. When B joined, a rebalance gave B partition 2 and left A with 0 and 1. When B called <code>close()</code>, another rebalance gave everything back to A, within the same second. No event was read by both. Note that <code>poll()</code> is more than "fetch": it is also how the consumer tells the group "I'm alive" (a <strong>heartbeat</strong>).</p>
  <p>How do you know consumers are keeping up? <strong>Lag</strong>: how far a group's bookmark is behind the end of the log. Below, a group called <code>feature-builder</code> had read everything (Section 07), then 6 more events were produced.</p>
  <div class="fx" data-lang="text">$ kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group feature-builder
GROUP           TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
feature-builder clicks  2          4               8               4
feature-builder clicks  0          2               4               2</div>
  <p>(Output trimmed: the empty CONSUMER-ID/HOST columns are cut.) Partition 2 has 8 records, the group has committed up to 4: lag 4. Lag that stays small is healthy; lag that keeps growing means consumers are too slow.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>consumer group</strong> is a set of consumers sharing a <code>group.id</code>; Kafka assigns each partition to exactly one member. <strong>Lag</strong> = log-end offset − committed offset, per partition. The useful number of consumers in a group is at most the number of partitions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If handling one batch takes longer than <code>max.poll.interval.ms</code> (default 5 minutes), for example a slow model call, Kafka assumes the consumer is dead and rebalances. Another consumer re-reads the uncommitted records, also takes too long, and the group loops: a <strong>rebalance storm</strong>. Keep per-poll work small or raise the limit.</p>
  </div>

  <h2 id="kf-sem"><span class="num">05</span>Offsets &amp; Delivery Semantics</h2>
  <p>A consumer does two things per message: <strong>process</strong> it (update a feature, write to a DB) and <strong>commit</strong> its offset (save the bookmark so a restart continues from there). Machines crash. The question every interviewer asks is: if the crash happens between those two steps, what do you lose? The answer depends only on which step comes first.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading a textbook with a bookmark before an exam. Move the bookmark first, then read (commit first): if you fall asleep, you wake up past a page you never read. Read first, then move the bookmark: if you fall asleep, you re-read one page. Re-reading is usually the cheaper mistake.</p>
  </div>
  <p>The simulation below processes five messages. The consumer crashes once, at message m2, right after its first step. After a crash it restarts from the last committed offset, exactly like a real consumer.</p>
  <div class="fx" data-lang="py">def run(order, crash_at):
    """Process messages 0..4; the consumer crashes once, right after step crash_at of message 2."""
    log = ["m0", "m1", "m2", "m3", "m4"]
    committed, done, crashed = 0, [], False
    while committed &lt; len(log):
        off = committed
        for step in order:
            if step == "commit":
                committed = off + 1
            else:
                done.append(log[off])
            if off == 2 and step == crash_at and not crashed:
                crashed = True
                break                       # crash! restart from the committed offset
        else:
            continue
    return done

print("commit then process:", run(["commit", "process"], "commit"))
print("process then commit:", run(["process", "commit"], "process"))</div>
  <div class="fx" data-lang="text">commit then process: ['m0', 'm1', 'm3', 'm4']
process then commit: ['m0', 'm1', 'm2', 'm2', 'm3', 'm4']</div>
  <table class="tbl out"><caption>Trace of the crash at m2</caption>
    <tr><th>Order</th><th>Before crash</th><th>Committed offset at crash</th><th>After restart</th><th>Result</th></tr>
    <tr><td>commit → process</td><td>committed 3, not yet processed m2</td><td>3</td><td>starts at m3</td><td>m2 <strong>lost</strong> (at-most-once)</td></tr>
    <tr><td>process → commit</td><td>processed m2, not yet committed</td><td>2</td><td>starts at m2 again</td><td>m2 <strong>twice</strong> (at-least-once)</td></tr>
  </table>
  <p>The third option, <strong>exactly-once</strong>, means the processing result and the commit happen together as one all-or-nothing step. Inside Kafka this is done with <strong>transactions</strong>. The real run below reads clicks, writes a score per click to a <code>scores</code> topic, and puts the consumer's offsets inside the same transaction. Either the scores and the new offsets both become visible, or neither does.</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer, Producer

c = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "scorer",
              "auto.offset.reset": "earliest", "enable.auto.commit": False,
              "isolation.level": "read_committed"})
p = Producer({"bootstrap.servers": "localhost:9092", "transactional.id": "scorer-1"})
p.init_transactions()                       # register with the broker; fences old zombies
c.subscribe(["clicks"])

batch = []
while len(batch) &lt; 12:
    m = c.poll(2.0)
    if m is not None and not m.error():
        batch.append(m)

p.begin_transaction()
for m in batch:
    e = json.loads(m.value())
    score = 0.9 if e["page"] == "checkout" else 0.1          # a pretend model
    p.produce("scores", key=m.key(), value=json.dumps({"user": e["user"], "score": score}))
# the consumer's progress is written INSIDE the same transaction
p.send_offsets_to_transaction(c.position(c.assignment()), c.consumer_group_metadata())
p.commit_transaction()                      # scores + offsets become visible together, or neither
print("committed", len(batch), "scores; next offsets:",
      sorted((tp.partition, tp.offset) for tp in c.committed(c.assignment()) if tp.offset &gt;= 0))
c.close()</div>
  <div class="fx" data-lang="text">committed 12 scores; next offsets: [(0, 4), (2, 8)]</div>
  <p>Key lines: <code>transactional.id</code> gives the producer a stable identity, so if an old copy of this program comes back from the dead, the broker rejects it (<strong>fencing</strong>). <code>send_offsets_to_transaction</code> is the trick: the consumer's bookmark is committed by the producer, inside the transaction. Readers with <code>isolation.level=read_committed</code> never see scores from a transaction that was aborted. Partition 1 is empty, so it has no offset to show.</p>
  <table class="tbl">
    <tr><th>Semantics</th><th>How</th><th>Use when</th></tr>
    <tr><td>At-most-once</td><td>Commit first (or careless auto-commit)</td><td>Losing a few metrics or logs is fine</td></tr>
    <tr><td><strong>At-least-once</strong></td><td><code>enable.auto.commit=false</code>; process, then commit</td><td>The usual default; make the sink idempotent</td></tr>
    <tr><td>Exactly-once</td><td>Transactions for Kafka → Kafka. To external DBs: at-least-once + idempotent writes</td><td>Payments, billing counters</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>idempotent</strong> operation gives the same result if repeated: "set balance of order 42 to PAID" is idempotent; "add ₹100" is not. At-least-once delivery plus an idempotent sink (upsert by event id) gives exactly-once <em>results</em> in any database, which is how most real pipelines do it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Kafka transactions only cover Kafka. If your consumer writes to Postgres and then commits the offset, a crash between them still duplicates the Postgres write. Don't claim "we use exactly-once" without saying where the boundary is.</p>
  </div>

  <h2 id="kf-eco"><span class="num">06</span>Connect, Processors &amp; Windows</h2>
  <p>So far we wrote producers and consumers by hand. Two jobs come up so often that tools exist for them. First, moving data between Kafka and other systems (a database, S3, Snowflake). Second, computing things over streams, like "clicks per user per 5 minutes", that need memory (<strong>state</strong>), late-event handling and crash recovery. Writing those by hand is how bugs are born.</p>
  <p><strong>Kafka Connect</strong> handles the first job with configuration instead of code. A <strong>source connector</strong> pulls data in; a <strong>sink connector</strong> pushes it out. The classic example is <strong>CDC</strong> (change data capture): Debezium reads the Postgres write-ahead log (the DB's own record of every change) and publishes each insert/update/delete as an event.</p>
  <div class="flow"><span>Postgres WAL</span><span>Debezium source connector</span><span>Kafka topic</span><span>S3 / Snowflake sink connector</span><span>Warehouse</span></div>
  <div class="fx" data-lang="text">{ "name": "shop-cdc",                                   (example config, not run here)
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db", "database.dbname": "shop",
    "topic.prefix": "shop", "table.include.list": "public.orders" } }</div>
  <p>For the second job you use a <strong>stream processor</strong>. The central idea is the <strong>window</strong>: a stream never ends, so "count clicks" has no answer until you say "count clicks <em>per 5 minutes</em>".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A toll plaza reports traffic. Tumbling window: a report for 9:00–9:05, then 9:05–9:10, no overlap. Hopping window: every minute, a report on "the last 5 minutes", so windows overlap. Session window: one report per car convoy, closed when no car has come for 4 minutes.</p>
  </div>
  <p>The code computes all three kinds on six clicks with event times in minutes after 12:00. The hopping function adds an event to every 5-minute window (starting each minute) that contains it.</p>
  <div class="fx" data-lang="py">from collections import defaultdict

# (event_time in minutes after 12:00, user)
clicks = [(1, "u1"), (3, "u1"), (4, "u2"), (6, "u1"), (12, "u1"), (13, "u1")]

def tumbling(events, size):
    counts = defaultdict(int)
    for t, user in events:
        start = (t // size) * size                    # the one window this event falls in
        counts[(user, start)] += 1
    return dict(sorted(counts.items()))

def hopping(events, size, hop):
    counts = defaultdict(int)
    for t, user in events:
        start = (t // hop) * hop                      # latest window that contains t
        while start &gt; t - size:                       # walk back over every window holding t
            if start &gt;= 0:
                counts[(user, start)] += 1
            start -= hop
    return dict(sorted(counts.items()))

def sessions(events, gap):
    out, last = defaultdict(list), {}
    for t, user in sorted(events):
        if user not in last or t - last[user] &gt; gap:  # quiet too long -&gt; new session
            out[user].append([t, t, 0])
        s = out[user][-1]
        s[1], s[2] = t, s[2] + 1
        last[user] = t
    return dict(out)

print("tumbling 5 min :", tumbling(clicks, 5))
print("hopping 5/1 u1 :", {k[1]: v for k, v in hopping(clicks, 5, 1).items() if k[0] == "u1" and k[1] &lt;= 6})
print("sessions gap 4 :", sessions(clicks, 4))</div>
  <div class="fx" data-lang="text">tumbling 5 min : {('u1', 0): 2, ('u1', 5): 1, ('u1', 10): 2, ('u2', 0): 1}
hopping 5/1 u1 : {0: 2, 1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1}
sessions gap 4 : {'u1': [[1, 6, 3], [12, 13, 2]], 'u2': [[4, 4, 1]]}</div>
  <p>Tumbling: u1's clicks at 1 and 3 fall in window 0–5, the click at 6 in 5–10, 12 and 13 in 10–15. Hopping: the window starting at 2 (2–7) holds the clicks at 3 and 6, so it counts 2; each event is counted in up to 5 windows. Sessions: u1 was busy from 1 to 6 (3 clicks), went quiet for 6 minutes (more than the gap of 4), then started a new session at 12.</p>
  <h3>Late events and the watermark</h3>
  <p>Events arrive late. When can we finalise window 0–5 and forget it? Never, if we wait for every possible straggler, and then memory grows forever. A <strong>watermark</strong> is the compromise: "the newest event time seen, minus an allowed delay". Windows that end before the watermark are closed; events for them are dropped.</p>
  <div class="fx" data-lang="py"># events arrive in this order; numbers are event times (minutes after 12:00)
arrivals = [1, 2, 7, 3, 11, 4, 16, 9]
WATERMARK_DELAY = 5
max_seen, counts = 0, {}
for t in arrivals:
    max_seen = max(max_seen, t)
    watermark = max_seen - WATERMARK_DELAY          # "nothing older than this should still come"
    start = (t // 5) * 5
    if start + 5 &lt;= watermark:                      # its window already closed
        print(f"t={t:2}  watermark={watermark:2}  window {start:2}-{start+5:&lt;2} closed -&gt; DROPPED")
        continue
    counts[start] = counts.get(start, 0) + 1
    print(f"t={t:2}  watermark={watermark:2}  window {start:2}-{start+5:&lt;2} count={counts[start]}")</div>
  <div class="fx" data-lang="text">t= 1  watermark=-4  window  0-5  count=1
t= 2  watermark=-3  window  0-5  count=2
t= 7  watermark= 2  window  5-10 count=1
t= 3  watermark= 2  window  0-5  count=3
t=11  watermark= 6  window 10-15 count=1
t= 4  watermark= 6  window  0-5  closed -&gt; DROPPED
t=16  watermark=11  window 15-20 count=1
t= 9  watermark=11  window  5-10 closed -&gt; DROPPED</div>
  <p>The event at 3 arrived after 7 but was still accepted: the watermark was only 2, so window 0–5 was open. The event at 4 arrived after 11 had pushed the watermark to 6, past the end of window 0–5, so it was dropped. A bigger delay accepts later events but keeps more windows in memory.</p>
  <h3>The same thing in Spark Structured Streaming (real run)</h3>
  <p>Real processors do this for you. This Spark job reads the <code>clicks</code> topic, parses the JSON, and counts clicks per user per 5-minute window, using Kafka's record timestamp as event time and a 10-minute watermark. <code>trigger(availableNow=True)</code> processes what's there now and stops, which is handy for a demo; a production job runs forever.</p>
  <div class="fx" data-lang="py">from pyspark.sql import SparkSession, functions as F
spark = (SparkSession.builder.master("local[2]")
         .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.13:4.2.0")
         .config("spark.sql.shuffle.partitions", "2")
         .getOrCreate())

raw = (spark.readStream.format("kafka")
       .option("kafka.bootstrap.servers", "localhost:9092")
       .option("subscribe", "clicks")
       .option("startingOffsets", "earliest")
       .load())                                   # columns: key, value (bytes), partition, offset, timestamp...
clicks = raw.select(
    F.from_json(F.col("value").cast("string"), "user STRING, page STRING").alias("e"),
    "timestamp").select("e.*", "timestamp")

feats = (clicks.withWatermark("timestamp", "10 minutes")         # wait up to 10 min for late events
               .groupBy(F.window("timestamp", "5 minutes"), "user")
               .count())

q = (feats.writeStream.outputMode("update").format("memory").queryName("feats")
     .option("checkpointLocation", "/tmp/ckpt")
     .trigger(availableNow=True)                  # process what is there now, then stop (good for demos)
     .start())
q.awaitTermination()
spark.sql("""SELECT date_format(window.start, "HH:mm") AS win_start,
                 date_format(window.end, "HH:mm") AS win_end, user, count
          FROM feats ORDER BY win_start, user""").show()</div>
  <div class="fx" data-lang="text">+---------+-------+----+-----+
|win_start|win_end|user|count|
+---------+-------+----+-----+
|    04:15|  04:20|  u1|    6|
|    04:15|  04:20|  u2|    4|
|    04:15|  04:20|  u3|    2|
+---------+-------+----+-----+</div>
  <p>The topic held 12 clicks by then (two rounds of the 6 events), all produced within one 5-minute window, so u1 has 6. <code>checkpointLocation</code> is where Spark saves its offsets and window state, so a restarted job continues instead of starting over.</p>
  <table class="tbl">
    <tr><th></th><th>Kafka Streams</th><th>Apache Flink</th><th>Spark Structured Streaming</th></tr>
    <tr><td>What</td><td>Java library inside your app</td><td>Distributed stream engine</td><td>Spark's streaming DataFrame API</td></tr>
    <tr><td>Model</td><td>Record at a time</td><td>Record at a time, event-time native</td><td>Micro-batches (100 ms+)</td></tr>
    <tr><td>Latency</td><td>ms</td><td>ms</td><td>~0.1 to a few s</td></tr>
    <tr><td>State &amp; windows</td><td>Local RocksDB, backed up to Kafka</td><td>Large state, checkpoints, best watermark support</td><td>Good; state store, watermarks</td></tr>
    <tr><td>Pick when</td><td>JVM microservice, Kafka in and out</td><td>Low latency, complex event-time logic at scale</td><td>Team already on Spark/Databricks, Python</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Windowing by processing time (when the event reached you) instead of event time makes results depend on network delays: a phone that reconnects after 10 minutes dumps its clicks into the wrong window. Use the event's own timestamp plus a watermark.</p>
  </div>

  <h2 id="kf-ml"><span class="num">07</span>Build It: Streaming Features</h2>
  <p>Now put it together for ML. A fraud or recommendation model needs features like "how many times did this user click in the last few minutes". A nightly batch can't give that. A stream job can: it reads events from Kafka, keeps per-user counts, and writes them to an <strong>online store</strong> (a fast key-value database like Redis) where the model API reads them in milliseconds. The same job also writes to the <strong>offline store</strong> (the data lake), so training uses exactly the same feature definition. If training and serving compute a feature differently, the model sees different numbers in production than in training: <strong>training/serving skew</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket scorer at the ground. Every ball, they update the scoreboard (online store) for the crowd and also write the ball in the scorebook (offline store) for later analysis. Both come from the same pencil, so the scoreboard never disagrees with the book.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="kf-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="11" text-anchor="middle">
      <rect x="5" y="40" width="80" height="40" rx="6" class="fs"/><text x="45" y="64">App events</text>
      <rect x="115" y="40" width="80" height="40" rx="6" class="fb"/><text x="155" y="58">Kafka</text><text x="155" y="72">clicks</text>
      <rect x="225" y="40" width="110" height="40" rx="6" class="fv"/><text x="280" y="58">feature job</text><text x="280" y="72">windows per user</text>
      <rect x="370" y="10" width="110" height="36" rx="6" class="fg"/><text x="425" y="25">Online store</text><text x="425" y="39">(Redis)</text>
      <rect x="370" y="78" width="110" height="36" rx="6" class="ft"/><text x="425" y="100">Offline (lake)</text>
      <rect x="510" y="10" width="80" height="36" rx="6" class="fr"/><text x="550" y="32">Model API</text>
      <rect x="510" y="78" width="80" height="36" rx="6" class="fs"/><text x="550" y="100">Training</text>
    </g>
    <g stroke="currentColor" marker-end="url(#kf-ar3)">
      <line x1="85" y1="60" x2="113" y2="60"/><line x1="195" y1="60" x2="223" y2="60"/>
      <line x1="335" y1="55" x2="368" y2="30"/><line x1="335" y1="65" x2="368" y2="94"/>
      <line x1="480" y1="28" x2="508" y2="28"/><line x1="480" y1="96" x2="508" y2="96"/>
    </g>
  </svg><figcaption>One feature computation feeds both serving (fresh, low latency) and training (history), so they match.</figcaption></figure>
  <p>A toy version against the real broker: consume <code>clicks</code>, keep a per-user click count in a dict (our pretend online store), and commit after processing each message (at-least-once). It stops after 5 seconds with no new messages, only so the demo ends.</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "localhost:9092",
              "group.id": "feature-builder",
              "auto.offset.reset": "earliest",    # no saved offset yet -&gt; start at the beginning
              "enable.auto.commit": False})       # we decide when to commit
c.subscribe(["clicks"])

features = {}                                      # user -&gt; click count (a toy feature store)
empty_polls = 0
while empty_polls &lt; 5:                             # stop after 5 quiet seconds (demo only)
    msg = c.poll(1.0)
    if msg is None:
        empty_polls += 1
        continue
    if msg.error():
        print("error:", msg.error()); continue
    e = json.loads(msg.value())
    features[e["user"]] = features.get(e["user"], 0) + 1    # 1. process
    c.commit(message=msg, asynchronous=False)               # 2. then commit -&gt; at-least-once
    print(f"p{msg.partition()} off={msg.offset()} {e['user']:&gt;2} {e['page']:&lt;8} clicks={features[e['user']]}")
c.close()
print("features:", features)</div>
  <div class="fx" data-lang="text">p2 off=0 u1 home     clicks=1
p2 off=1 u1 product  clicks=2
p2 off=2 u3 home     clicks=1
p2 off=3 u1 checkout clicks=3
p0 off=0 u2 cart     clicks=1
p0 off=1 u2 home     clicks=2
features: {'u1': 3, 'u3': 1, 'u2': 2}</div>
  <p>What happened: <code>poll(1.0)</code> waits up to one second for a message. Each message's value is JSON bytes, so <code>json.loads</code> turns it back into a dict. The count is updated first and the offset committed second, the at-least-once order from Section 05. Notice partitions are read independently (all of p2, then p0), so events from different users are not in global order, but each user's own events are: u1 went home → product → checkout. That's the only ordering a feature like "clicks per user" needs.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>This feature dict lives in memory: a restart loses it, and a re-delivered message (at-least-once) counts twice. Real jobs keep state in Flink/Spark checkpoints or Redis, and dedupe by an event id carried in every message.</p>
  </div>
  <p>Exercise: turn the count into "clicks in the last 5 minutes" using the record timestamp (<code>msg.timestamp()[1]</code>, in milliseconds), keyed by <code>(user, window_start)</code>, and drop windows older than a 10-minute watermark.</p>

  <h2 id="kf-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: expecting order across a topic</span>
    <p>Kafka orders records within a partition only. If two events must stay in order, they need the same key. Keying by <code>user_id</code> keeps one user's events ordered; nothing orders user A against user B.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: auto-commit with slow processing</span>
    <p>With <code>enable.auto.commit=true</code> the client commits offsets on a timer (every 5 s by default), whether or not you finished. Crash after the timer fired and before your DB write: the message is silently lost. For anything that matters, turn it off and commit after processing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: more consumers than partitions</span>
    <p>A topic with 6 partitions can keep at most 6 consumers in one group busy. The 7th sits idle. To scale further you need more partitions, which remaps keys (Section 03), so plan the count early.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: non-idempotent sinks</span>
    <p>At-least-once means duplicates will happen during crashes and rebalances. "INSERT a row" or "add 1" double-counts; "UPSERT by event id" or "SET value" doesn't. Design the write to be safe to repeat.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hot keys</span>
    <p>One giant key (a celebrity account, a default value like <code>"unknown"</code>, a null) sends a big share of traffic to one partition and one consumer. Lag grows on that partition only. Fix the key, split the hot entity (append a small suffix), or filter the junk value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting <code>flush()</code></span>
    <p><code>produce()</code> only buffers. A script that exits without <code>flush()</code> can lose its last messages with no error. Long-running producers should also call <code>poll(0)</code> regularly so delivery callbacks run.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: streaming when batch would do</span>
    <p>Streaming jobs run 24×7, are harder to test and backfill, and need on-call. If nobody acts within minutes, schedule a batch job instead.</p>
  </div>

  <h2 id="kf-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How is Kafka different from a traditional message queue like RabbitMQ or SQS?</summary><div class="qa-body">Kafka is a durable, partitioned log: reading doesn't delete, so many consumer groups read the same data independently and can replay from any offset until retention expires. Queues typically delete a message once acknowledged and deliver each to one consumer. Kafka also has very high throughput thanks to sequential disk writes and batching.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an offset?</summary><div class="qa-body">The position number of a record inside one partition: 0, 1, 2 … It never changes. A consumer group's committed offset is its bookmark: "the next record I need is at offset N".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Kafka guarantee ordering?</summary><div class="qa-body">Only within a partition. Records with the same key go to the same partition, so per-key order is kept. There is no order across partitions. With retries, the idempotent producer keeps order (old clients needed <code>max.in.flight.requests.per.connection=1</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A topic has 6 partitions; your group has 8 consumers. What happens?</summary><div class="qa-body">6 consumers get one partition each; 2 sit idle as standbys. To use more consumers, add partitions, but that remaps keys and breaks per-key ordering during the change, so plan partition counts up front.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain at-most-once, at-least-once and exactly-once.</summary><div class="qa-body">At-most-once: commit before processing; a crash loses the message. At-least-once: process then commit; a crash means reprocessing (duplicates). Exactly-once: output and offset commit happen atomically (Kafka transactions for Kafka → Kafka), or at-least-once plus an idempotent sink (upsert by event id).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your consumer lag keeps growing. What do you check?</summary><div class="qa-body">Is per-message work too slow (model calls, sync DB writes)? Batch or parallelise. Are there fewer consumers than partitions? Add consumers. Is one partition hot (skewed key)? Fix the key. Are rebalances happening often (<code>max.poll.interval.ms</code> exceeded)? Check consumer logs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's a consumer rebalance and why is it painful?</summary><div class="qa-body">Reassigning partitions when a consumer joins, leaves or misses heartbeats. In an eager rebalance every consumer stops; uncommitted work is reprocessed by the new owner. Mitigate with cooperative-sticky assignment, static membership, and committing before partitions are revoked.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Retention vs log compaction?</summary><div class="qa-body">Retention deletes old segments by time or size, regardless of key. Compaction keeps at least the latest record for each key and drops older ones, so the topic acts as a changelog of current state (latest profile per user). A null value (tombstone) deletes a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>acks=all</code> mean, and what is the ISR?</summary><div class="qa-body">The producer waits until the leader and all in-sync replicas (followers that are fully caught up) have the record. Combined with <code>min.insync.replicas=2</code>, an acknowledged write survives one broker dying. <code>acks=1</code> waits only for the leader and can lose data if it dies before followers copy it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Event time vs processing time — why does it matter?</summary><div class="qa-body">Event time is when it happened; processing time is when you saw it. Events arrive late and out of order (offline phones, retries). Windows by processing time put events in the wrong bucket. Use event time plus a watermark that says how late an event may be before its window is closed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Kafka Streams vs Flink vs Spark Structured Streaming: how do you choose?</summary><div class="qa-body">Kafka Streams: a library for JVM apps reading and writing Kafka, no cluster. Flink: lowest latency, true per-record processing, best event-time and large-state handling. Spark Structured Streaming: micro-batches, same DataFrame API as batch, good when the team already uses Spark/Databricks and Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a real-time "number of transactions in the last 10 minutes" feature for a fraud model.</summary><div class="qa-body">Produce transactions to Kafka keyed by card_id. A Flink or Spark job computes a sliding 10-minute count per card with event-time windows and a watermark for late events. It writes to an online store (Redis) for the scoring API and to the lake for training, so both use the same definition. Make the sink idempotent and monitor lag.</div></details>
</main>`
});
