// notes/dataeng/de_kafka.js — Kafka & Streaming
Object.assign(TOPIC_CONTENT, {
  "de_kafka": `<main>
  <h1>Kafka &amp; Streaming</h1>
  <p class="lead">Kafka is the pipe that moves events (clicks, payments, DB changes) between systems in real time. For ML it powers fresh features, fraud scoring and CDC into the warehouse. Builds on ETL: same ideas, but data never stops arriving.</p>

  <h2 id="kf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Kafka &amp; Streaming</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Batch vs Streaming</div>
        <ul>
          <li><b>Batch</b> — bounded data, run on a schedule; minutes–hours latency; simpler</li>
          <li><b>Streaming</b> — unbounded events processed continuously; ms–seconds latency</li>
          <li><b>Use streaming for</b> — fraud, real-time features, alerts, CDC</li>
          <li><b>Event time vs processing time</b> — when it happened vs when we saw it</li>
          <li>⚠ <b>Late / out-of-order events</b> — need windows + watermarks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The Log</div>
        <ul>
          <li><b>Log</b> — append-only, ordered sequence of records; never edited</li>
          <li><b>Offset</b> — position of a record in a partition (0, 1, 2…)</li>
          <li><b>Consumers don't delete</b> — each tracks its own offset; many readers, replay possible</li>
          <li><b>Retention</b> — delete by time (<code>retention.ms</code>, default 7 days) or size; or <b>compaction</b> = keep latest per key</li>
          <li>💡 like a shared diary: writers append, readers keep their own bookmark</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Topics &amp; Partitions</div>
        <ul>
          <li><b>Topic</b> — named stream (e.g. <code>clicks</code>), split into partitions</li>
          <li><b>Partition</b> — unit of parallelism and ordering; lives on a broker, replicated</li>
          <li><b>Key → partition</b> — <code>hash(key) % partitions</code>; same key, same partition</li>
          <li><b>Ordering</b> — guaranteed within a partition only, not across a topic</li>
          <li><b>Replication</b> — leader + followers; ISR = in-sync replicas; <code>acks=all</code> waits for ISR</li>
          <li>⚠ <b>Adding partitions</b> remaps keys → breaks per-key ordering</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Consumer Groups</div>
        <ul>
          <li><b>Group</b> — consumers sharing <code>group.id</code> split partitions; each partition → one consumer</li>
          <li><b>Scale</b> — max useful consumers = partitions; extras sit idle</li>
          <li><b>Different groups</b> — each gets every message (fan-out)</li>
          <li><b>Rebalance</b> — join/leave/crash → partitions reassigned; brief pause</li>
          <li><b>Lag</b> — log-end offset − committed offset; key health metric</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Offsets &amp; Semantics</div>
        <ul>
          <li><b>Commit</b> — save "processed up to here" to <code>__consumer_offsets</code></li>
          <li><b>At-most-once</b> — commit before processing; crash → message lost</li>
          <li><b>At-least-once</b> — process then commit; crash → reprocessed (default; make sinks idempotent)</li>
          <li><b>Exactly-once</b> — idempotent producer + transactions (read-process-write in Kafka), or idempotent sink</li>
          <li><b>auto.offset.reset</b> — <code>earliest</code> / <code>latest</code> when group has no offset</li>
          <li>⚠ <b>Auto-commit</b> can commit before you finish → silent loss</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ecosystem</div>
        <ul>
          <li><b>Kafka Connect</b> — config-only source/sink connectors (Debezium CDC, S3, JDBC, Snowflake)</li>
          <li><b>Kafka Streams</b> — Java library, Kafka → Kafka, no cluster</li>
          <li><b>Flink</b> — true streaming engine; event time, big state, lowest latency</li>
          <li><b>Spark Structured Streaming</b> — micro-batches, DataFrame API, Python-friendly</li>
          <li><b>Schema Registry</b> — Avro/Protobuf schemas, compatibility checks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Streaming ML Features</div>
        <ul>
          <li><b>Flow</b> — events → Kafka → windowed aggregates → online store (Redis) → model</li>
          <li><b>Also write offline</b> → lake for training: same logic avoids training/serving skew</li>
          <li><b>Windows</b> — tumbling (fixed), sliding/hopping (overlap), session (gap-based)</li>
          <li>⚠ <b>Key by entity</b> (user_id) so a user's events stay ordered in one partition</li>
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
      <div class="rm-item rm-done" data-target="kf-group"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Consumer Groups</span><span class="rm-sub">Scaling and rebalancing</span></div></div>
      <div class="rm-item rm-done" data-target="kf-sem"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Offsets &amp; Delivery Semantics</span><span class="rm-sub">At-most, at-least, exactly once</span></div></div>
      <div class="rm-item rm-done" data-target="kf-eco"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Connect &amp; Stream Processors</span><span class="rm-sub">Streams vs Flink vs Spark</span></div></div>
      <div class="rm-item rm-done" data-target="kf-ml"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Build It: Streaming Features</span><span class="rm-sub">Clicks → features, real broker</span></div></div>
      <div class="rm-item rm-done" data-target="kf-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="kf-why"><span class="num">01</span>Batch vs Streaming</h2>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Streaming</th></tr>
    <tr><td>Data</td><td>Bounded: "yesterday's orders"</td><td>Unbounded: events keep coming</td></tr>
    <tr><td>Latency</td><td>Minutes to hours</td><td>Milliseconds to seconds</td></tr>
    <tr><td>Tools</td><td>Airflow + Spark/SQL</td><td>Kafka + Flink / Spark Streaming</td></tr>
    <tr><td>ML use</td><td>Nightly training, daily scores</td><td>Fraud checks, "clicks in last 5 min" features</td></tr>
    <tr><td>Cost</td><td>Simple, cheap, easy to rerun</td><td>Always-on, harder to debug and backfill</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Batch is the postman delivering once a day. Streaming is a phone call: each word arrives as it's spoken.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Real-time" is often not needed. If the business acts on a dashboard each morning, an hourly batch is cheaper and simpler. Ask what latency the decision really needs.</p>
  </div>

  <h2 id="kf-log"><span class="num">02</span>The Log</h2>
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
  <ul>
    <li><strong>Immutable + ordered</strong>: a record at offset 3 never changes.</li>
    <li><strong>Reading doesn't delete</strong>: unlike a queue (RabbitMQ, SQS). Any number of groups read the same data; you can rewind to replay.</li>
    <li><strong>Retention</strong>: records expire by age (<code>retention.ms</code>, default 7 days) or size. <strong>Compacted</strong> topics keep only the latest value per key, like a changelog table.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A ship's logbook. The crew only add lines at the end. Each reader keeps a bookmark. Tearing out pages happens only when they're old enough (retention).</p>
  </div>

  <h2 id="kf-part"><span class="num">03</span>Producers, Topics, Partitions</h2>
  <p>A topic is split into partitions spread across brokers (Kafka servers). The <strong>key</strong> picks the partition: <code>hash(key) % num_partitions</code>.</p>
  <div class="fx" data-lang="text">$ kafka-topics.sh --create --topic clicks --partitions 3 --replication-factor 1
Created topic clicks.</div>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Producer

p = Producer({"bootstrap.servers": "localhost:9092",
              "acks": "all", "enable.idempotence": True})

def report(err, msg):
    if err is None:
        print(f"key={msg.key().decode()} -&gt; partition {msg.partition()} offset {msg.offset()}")

events = [("u1", "home"), ("u2", "cart"), ("u1", "product"),
          ("u3", "home"), ("u1", "checkout"), ("u2", "home")]
for user, page in events:
    p.produce("clicks", key=user, value=json.dumps({"user": user, "page": page}),
              callback=report)
p.flush()                                  # block until all are acknowledged</div>
  <div class="fx" data-lang="text">key=u2 -&gt; partition 0 offset 0
key=u2 -&gt; partition 0 offset 1
key=u1 -&gt; partition 2 offset 0
key=u1 -&gt; partition 2 offset 1
key=u3 -&gt; partition 2 offset 2
key=u1 -&gt; partition 2 offset 3</div>
  <p>Real run (Kafka 3.9.1 in Docker). Every <code>u1</code> event landed in partition 2, in send order: home → product → checkout. Partition 1 got nothing: 3 keys is too few to spread.</p>
  <table class="tbl">
    <tr><th>Producer setting</th><th>Meaning</th></tr>
    <tr><td><code>acks=0 / 1 / all</code></td><td>Don't wait / wait for leader / wait for all in-sync replicas (safest)</td></tr>
    <tr><td><code>enable.idempotence=true</code></td><td>Broker drops duplicates from producer retries (per partition)</td></tr>
    <tr><td><code>linger.ms</code>, <code>batch.size</code></td><td>Wait a bit to batch messages: more throughput, a little latency</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ordering is per <em>partition</em>, never per topic. Need a user's events in order? Key by <code>user_id</code>. No key = spread for throughput, but no ordering. Hot keys (one celebrity user) overload one partition.</p>
  </div>

  <h2 id="kf-group"><span class="num">04</span>Consumer Groups</h2>
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
      <line x1="120" y1="146" x2="263" y2="62"/>
      <line x1="120" y1="46" x2="263" y2="128"/>
      <line x1="120" y1="96" x2="263" y2="136"/>
    </g>
    <rect x="450" y="70" width="130" height="36" rx="6" class="fv"/><text x="515" y="93" text-anchor="middle">group "analytics"</text>
    <text x="515" y="125" text-anchor="middle" font-size="11" class="tm">separate group:</text>
    <text x="515" y="140" text-anchor="middle" font-size="11" class="tm">gets ALL partitions too</text>
  </svg><figcaption>Within a group, each partition goes to exactly one consumer. Across groups, everyone gets everything.</figcaption></figure>
  <div class="fx" data-lang="py">c = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "demo-group",
              "auto.offset.reset": "earliest"})
c.subscribe(["clicks"], on_assign=lambda c, ps: print(name, "assigned", sorted(p.partition for p in ps)))
# start A; 6 s later start B (lives 10 s); A keeps running</div>
  <div class="fx" data-lang="text">A assigned [0, 1, 2]      # A alone: all partitions
A assigned [2]            # B joins -&gt; rebalance
B assigned [0, 1]
A assigned [0, 1, 2]      # B leaves -&gt; rebalance again</div>
  <ul>
    <li><strong>Scale out</strong> by adding consumers, up to the partition count. A 4th consumer on 3 partitions sits idle.</li>
    <li><strong>Rebalance</strong>: triggered by join, leave, crash or a missed heartbeat. Processing pauses briefly; cooperative rebalancing reduces the pause.</li>
    <li><strong>Lag</strong> = log-end offset − committed offset. Growing lag = consumers too slow.</li>
  </ul>
  <div class="fx" data-lang="text">$ kafka-consumer-groups.sh --describe --group feature-builder     # after 6 more events
TOPIC    PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
clicks   2          4               8               4
clicks   0          2               4               2</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Slow processing per batch (e.g. a 2-minute model call) can exceed <code>max.poll.interval.ms</code>. Kafka assumes the consumer died, rebalances, and another consumer reprocesses the same records: a rebalance storm.</p>
  </div>

  <h2 id="kf-sem"><span class="num">05</span>Offsets &amp; Delivery Semantics</h2>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <g font-size="12">
      <text x="10" y="30" font-weight="bold">At-most-once</text>
      <rect x="150" y="14" width="90" height="26" rx="4" class="fv"/><text x="195" y="32" text-anchor="middle">commit</text>
      <rect x="250" y="14" width="90" height="26" rx="4" class="fb"/><text x="295" y="32" text-anchor="middle">process</text>
      <text x="355" y="32" class="tr">crash here → message lost</text>
      <text x="10" y="80" font-weight="bold">At-least-once</text>
      <rect x="150" y="64" width="90" height="26" rx="4" class="fb"/><text x="195" y="82" text-anchor="middle">process</text>
      <rect x="250" y="64" width="90" height="26" rx="4" class="fv"/><text x="295" y="82" text-anchor="middle">commit</text>
      <text x="355" y="82" class="tg">crash before commit → redo (duplicate)</text>
      <text x="10" y="130" font-weight="bold">Exactly-once</text>
      <rect x="150" y="114" width="190" height="26" rx="4" class="ft"/><text x="245" y="132" text-anchor="middle">process + commit atomically</text>
      <text x="355" y="132">transaction, or idempotent sink</text>
    </g>
  </svg><figcaption>The order of "process" and "commit" decides what a crash costs you.</figcaption></figure>
  <table class="tbl">
    <tr><th>Semantics</th><th>How</th><th>Use when</th></tr>
    <tr><td>At-most-once</td><td>Commit first (or auto-commit)</td><td>Losing some metrics/logs is fine</td></tr>
    <tr><td><strong>At-least-once</strong></td><td><code>enable.auto.commit=false</code>; process, then commit</td><td>Default choice; make the sink idempotent (upsert by event id)</td></tr>
    <tr><td>Exactly-once</td><td>Idempotent producer + <code>transactional.id</code> + consumers with <code>isolation.level=read_committed</code>; works Kafka → Kafka. To external DBs: at-least-once + idempotent writes</td><td>Payments, billing counters</td></tr>
  </table>
  <div class="fx" data-lang="py"># exactly-once read-process-write inside Kafka (not run here)
p = Producer({"bootstrap.servers": "...", "transactional.id": "scorer-1"})
p.init_transactions()
p.begin_transaction()
p.produce("scores", key=k, value=v)
p.send_offsets_to_transaction(c.position(c.assignment()), c.consumer_group_metadata())
p.commit_transaction()       # output + input offsets commit together, or neither</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading a book with a bookmark. Move the bookmark before reading the page (at-most-once): fall asleep, skip a page. Move it after (at-least-once): fall asleep, reread a page. Rereading is usually the cheaper mistake.</p>
  </div>

  <h2 id="kf-eco"><span class="num">06</span>Connect &amp; Stream Processors</h2>
  <div class="flow"><span>Postgres WAL</span><span>Debezium source connector</span><span>Kafka topic</span><span>S3 / Snowflake sink connector</span><span>Warehouse</span></div>
  <p><strong>Kafka Connect</strong> moves data in and out of Kafka with config, no code. It handles offsets, retries and scaling for you.</p>
  <div class="fx" data-lang="text">{ "name": "shop-cdc",                                   (example config, not run here)
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db", "database.dbname": "shop",
    "topic.prefix": "shop", "table.include.list": "public.orders" } }</div>
  <table class="tbl">
    <tr><th></th><th>Kafka Streams</th><th>Apache Flink</th><th>Spark Structured Streaming</th></tr>
    <tr><td>What</td><td>Java library inside your app</td><td>Distributed stream engine</td><td>Spark's streaming DataFrame API</td></tr>
    <tr><td>Model</td><td>Record at a time</td><td>Record at a time, event-time native</td><td>Micro-batches (100 ms+)</td></tr>
    <tr><td>Latency</td><td>ms</td><td>ms</td><td>~0.1–few s</td></tr>
    <tr><td>State &amp; windows</td><td>Local RocksDB, backed up to Kafka</td><td>Large state, checkpoints, best watermark support</td><td>Good; state store, watermarks</td></tr>
    <tr><td>Sources</td><td>Kafka only</td><td>Many</td><td>Many; same code as batch</td></tr>
    <tr><td>Pick when</td><td>JVM microservice, Kafka in &amp; out</td><td>Low latency, complex event-time logic at scale</td><td>Team already on Spark/Databricks, Python</td></tr>
  </table>
  <div class="fx" data-lang="py"># Spark Structured Streaming: clicks per user per 5-min window (not run here: needs the
# spark-sql-kafka package and a broker)
from pyspark.sql import functions as F
clicks = (spark.readStream.format("kafka")
          .option("kafka.bootstrap.servers", "localhost:9092").option("subscribe", "clicks").load()
          .select(F.from_json(F.col("value").cast("string"), "user STRING, page STRING").alias("e"),
                  "timestamp").select("e.*", "timestamp"))
feats = (clicks.withWatermark("timestamp", "10 minutes")        # accept events up to 10 min late
               .groupBy(F.window("timestamp", "5 minutes"), "user").count())
feats.writeStream.outputMode("update").format("console") \\
     .option("checkpointLocation", "/tmp/ckpt").start()</div>
  <div class="cards">
    <div><b>Tumbling</b><p>Fixed, non-overlapping: 12:00–12:05, 12:05–12:10.</p><small>Counts per 5 min</small></div>
    <div><b>Sliding / hopping</b><p>5-min windows every 1 min; overlap.</p><small>"Last 5 minutes", updated each minute</small></div>
    <div><b>Session</b><p>Closes after a gap of inactivity.</p><small>User sessions</small></div>
  </div>
  <p><strong>Watermark</strong>: how late an event may arrive (by event time) and still count. Older ones are dropped, so state doesn't grow forever.</p>

  <h2 id="kf-ml"><span class="num">07</span>Build It: Streaming Features</h2>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="kf-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="11" text-anchor="middle">
      <rect x="5" y="40" width="80" height="40" rx="6" class="fs"/><text x="45" y="64">App events</text>
      <rect x="115" y="40" width="80" height="40" rx="6" class="fb"/><text x="155" y="64">Kafka clicks</text>
      <rect x="225" y="40" width="110" height="40" rx="6" class="fv"/><text x="280" y="58">feature job</text><text x="280" y="72">windows per user</text>
      <rect x="370" y="10" width="110" height="36" rx="6" class="fg"/><text x="425" y="32">Online store (Redis)</text>
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
  <p>A toy version: consume <code>clicks</code>, keep a per-user click count, commit after processing (at-least-once).</p>
  <div class="fx" data-lang="py">import json
from confluent_kafka import Consumer

c = Consumer({"bootstrap.servers": "localhost:9092",
              "group.id": "feature-builder",
              "auto.offset.reset": "earliest",   # no committed offset -&gt; start at beginning
              "enable.auto.commit": False})      # we commit ourselves
c.subscribe(["clicks"])

features = {}                                     # user -&gt; click count (toy feature store)
empty = 0
while empty &lt; 5:
    msg = c.poll(1.0)
    if msg is None:
        empty += 1; continue
    e = json.loads(msg.value())
    features[e["user"]] = features.get(e["user"], 0) + 1   # 1. process
    c.commit(message=msg, asynchronous=False)              # 2. then commit -&gt; at-least-once
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
  <p>Notice: partitions are read independently (all of p2, then p0), but each user's events are in order.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>This feature dict lives in memory: a restart loses it, and a reprocessed message double-counts. Real jobs keep state in Flink/Spark checkpoints or Redis, and dedupe by event id.</p>
  </div>
  <p>Exercise: turn the count into "clicks in the last 5 minutes" using event timestamps, and write it to a dict keyed by <code>(user, window_start)</code>.</p>

  <h2 id="kf-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How is Kafka different from a traditional message queue like RabbitMQ or SQS?</summary><div class="qa-body">Kafka is a durable, partitioned log: reading doesn't delete, so many consumer groups read the same data independently and can replay from any offset until retention expires. Queues typically delete a message once acknowledged and deliver each to one consumer. Kafka also has much higher throughput through sequential disk writes and batching.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Kafka guarantee ordering?</summary><div class="qa-body">Only within a partition. Messages with the same key go to the same partition, so per-key order is preserved. There is no order across partitions. With retries, keep order using the idempotent producer (or <code>max.in.flight.requests.per.connection=1</code> on old clients).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A topic has 6 partitions; your group has 8 consumers. What happens?</summary><div class="qa-body">6 consumers get one partition each; 2 sit idle as hot standbys. To use more consumers, increase partitions, but that remaps keys to new partitions and breaks per-key ordering for in-flight data, so plan partition counts up front.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain at-most-once, at-least-once and exactly-once.</summary><div class="qa-body">At-most-once: commit the offset before processing; a crash loses the message. At-least-once: process then commit; a crash means reprocessing (duplicates). Exactly-once: the output and the offset commit happen atomically (Kafka transactions for Kafka → Kafka), or at-least-once plus an idempotent sink (upsert by event id).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your consumer lag keeps growing. What do you check?</summary><div class="qa-body">Is processing per message too slow (model calls, sync DB writes)? Batch or parallelise. Are there more partitions than consumers? Add consumers. Is one partition hot (skewed key)? Fix the key. Are frequent rebalances happening (<code>max.poll.interval.ms</code> exceeded)? Check consumer logs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's a consumer rebalance and why is it painful?</summary><div class="qa-body">Reassigning partitions when a consumer joins, leaves or misses heartbeats. During an eager rebalance every consumer stops; uncommitted work gets reprocessed by the new owner. Mitigate with cooperative-sticky assignment, static membership, and committing before partitions are revoked.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Retention vs log compaction?</summary><div class="qa-body">Retention deletes segments older than a time or size limit, regardless of key. Compaction keeps at least the latest record for each key and drops older ones, so the topic acts as a changelog of current state (e.g. latest profile per user). A null value (tombstone) deletes a key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Kafka Streams vs Flink vs Spark Structured Streaming: how do you choose?</summary><div class="qa-body">Kafka Streams: a library for JVM apps reading and writing Kafka, no cluster. Flink: lowest latency, true per-record processing, the best event-time and large-state handling. Spark Structured Streaming: micro-batches, same DataFrame API as batch, good when the team already uses Spark/Databricks and Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a real-time "number of transactions in the last 10 minutes" feature for a fraud model.</summary><div class="qa-body">Produce transactions to Kafka keyed by card_id. A Flink or Spark job computes a sliding 10-minute count per card with event-time windows and a watermark for late events. It writes to an online store (Redis) for the scoring API and to the lake for training, so both use the same definition. Make the sink idempotent and monitor lag.</div></details>
</main>`
});
