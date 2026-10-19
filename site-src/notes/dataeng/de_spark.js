// notes/dataeng/de_spark.js — Apache Spark
Object.assign(TOPIC_CONTENT, {
  "de_spark": `<main>
  <h1>Apache Spark</h1>
  <p class="lead">Spark runs pandas-style table code across many machines at once. You need it when the data stops fitting on one computer, and interviewers love asking about lazy evaluation, shuffles, joins and skew. This note starts from "pandas ran out of memory" and builds up, one idea at a time, to reading a query plan and fixing a skewed join. Every output below is from a real run of PySpark 4.2 in local mode (4 cores on one laptop), which behaves like a tiny cluster. Builds on SQL and pandas.</p>

  <h2 id="sp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Apache Spark</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When &amp; Why</div>
        <ul>
          <li><b>Spark</b> — engine that runs DataFrame / SQL code across a cluster</li>
          <li><b>Use when</b> — 100 GB+, or data already in a lakehouse (Databricks, EMR)</li>
          <li><b>Don't</b> — under ~5 GB: pandas / Polars / DuckDB are faster (no JVM or scheduling cost)</li>
          <li><b>Scale out</b> — many normal machines, not one giant one</li>
          <li>💡 election counting: one clerk per booth, totals added at the end</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Architecture</div>
        <ul>
          <li><b>Driver</b> — runs your script, builds the plan, hands out tasks; one machine</li>
          <li><b>Executors</b> — worker processes; run tasks, hold cached data</li>
          <li><b>Cluster manager</b> — YARN / Kubernetes / standalone; gives out machines</li>
          <li><b>Partition</b> — one chunk of rows; <b>1 partition = 1 task = 1 core</b> at a time</li>
          <li><b>Job → stages → tasks</b> — one action = one job; each shuffle starts a new stage</li>
          <li>⚠ <b>Driver OOM</b> — <code>collect()</code> / <code>toPandas()</code> on big data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lazy Evaluation</div>
        <ul>
          <li><b>Transformations</b> — lazy, only add to the plan: <code>select, filter, join, groupBy, withColumn</code></li>
          <li><b>Actions</b> — run a job: <code>show, count, collect, take, write</code></li>
          <li><b>Why lazy</b> — Catalyst optimizer sees the whole plan: filter pushdown, column pruning, join choice</li>
          <li>⚠ every action recomputes from the source — cache if reused</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shuffles &amp; Plans</div>
        <ul>
          <li><b>Narrow</b> — each output partition needs one input partition (filter, select); no network</li>
          <li><b>Wide</b> — rows with the same key must meet (groupBy, join, distinct, orderBy) → <b>shuffle</b></li>
          <li><b>Shuffle</b> — disk + network + serialisation; the main cost; new stage</li>
          <li><b>explain()</b> — read bottom-up; <code>Exchange</code> = shuffle; <code>partial_sum</code> = pre-aggregation</li>
          <li><b>Spark SQL = DataFrame API</b> — same optimizer, same plan</li>
          <li><b>AQE</b> — re-plans at runtime: merges tiny partitions, splits skewed ones</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Joins &amp; Skew</div>
        <ul>
          <li><b>Broadcast hash join</b> — small side (&lt; 10 MB default) copied to every executor; big side never moves; <code>F.broadcast(df)</code></li>
          <li><b>Sort-merge join</b> — big ⋈ big; shuffle + sort both sides</li>
          <li><b>Skew</b> — one key holds most rows → one slow task holds up the job</li>
          <li><b>Fixes</b> — broadcast, salting (random suffix), AQE skew join, handle NULL keys</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Partitions, Cache, Files</div>
        <ul>
          <li><b>repartition(n)</b> — full shuffle, up or down, even sizes</li>
          <li><b>coalesce(n)</b> — down only, no shuffle, may be uneven; use before writing</li>
          <li><b>Size</b> — ~100–200 MB per partition; at least 2–3× the cores</li>
          <li><b>cache()</b> — lazy; for DataFrames used 2+ times; <code>unpersist()</code> after</li>
          <li><b>Parquet</b> — columnar, compressed, min/max stats → read fewer columns and row groups</li>
          <li><b>partitionBy("date")</b> — one folder per value → partition pruning; ⚠ never on high-cardinality columns</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Common Mistakes</div>
        <ul>
          <li>⚠ <b>Python UDF</b> — rows travel JVM ↔ Python; ~10× slower than built-ins in our run</li>
          <li>⚠ <b>Small files</b> — thousands of tiny files; coalesce before write, compact</li>
          <li>⚠ <b>collect()</b> on big data — use <code>take</code>, aggregate first, or <code>write</code></li>
          <li>⚠ <b>Bad partition count</b> — idle cores or scheduler overhead; <code>spark.sql.shuffle.partitions</code></li>
          <li>⚠ <b>Spark for tiny data</b> — slower than pandas</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sp-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When You Need Spark</span><span class="rm-sub">One machine is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="sp-arch"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Architecture</span><span class="rm-sub">Driver, executors, partitions</span></div></div>
      <div class="rm-item rm-done" data-target="sp-lazy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">DataFrames &amp; Laziness</span><span class="rm-sub">Transformations vs actions</span></div></div>
      <div class="rm-item rm-done" data-target="sp-shuffle"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Narrow, Wide &amp; Stages</span><span class="rm-sub">The shuffle is the cost</span></div></div>
      <div class="rm-item rm-done" data-target="sp-sql"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Spark SQL &amp; explain()</span><span class="rm-sub">Read a physical plan</span></div></div>
      <div class="rm-item rm-done" data-target="sp-join"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Joins at Scale</span><span class="rm-sub">Broadcast, sort-merge, skew</span></div></div>
      <div class="rm-item rm-done" data-target="sp-part"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Partitions, Cache, Parquet</span><span class="rm-sub">Layout decides speed</span></div></div>
      <div class="rm-item rm-done" data-target="sp-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">UDFs, collect, small files</span></div></div>
      <div class="rm-item rm-done" data-target="sp-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sp-when"><span class="num">01</span>When You Need Spark</h2>
  <p>You have a year of orders from an online shop and want revenue per city. In pandas that is one line: <code>df.groupby("city")["amount"].sum()</code>. It works on your laptop with last month's file. Then you load the full year and Python dies with <code>MemoryError</code>, or the laptop freezes while it swaps to disk. pandas needs the whole table in RAM on one machine, and one machine has limits.</p>
  <p>How big is "too big"? Measure a small sample and multiply. The code builds a 1-million-row orders table in pandas and asks how much RAM it uses.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

n = 1_000_000
df = pd.DataFrame({"order_id": np.arange(n),
                   "customer_id": np.random.default_rng(0).integers(1, 50_000, n),
                   "amount": np.random.default_rng(1).random(n) * 1000,
                   "city": np.random.default_rng(2).choice(["Mumbai", "Pune", "Delhi"], n)})
mb = df.memory_usage(deep=True).sum() / 1e6
print(f"1 million rows  : {mb:,.0f} MB in RAM")
print(f"2 billion rows  : {mb * 2000 / 1000:,.0f} GB in RAM  (a year of orders)")</div>
  <div class="fx" data-lang="text">1 million rows  : 37 MB in RAM
2 billion rows  : 74 GB in RAM  (a year of orders)</div>
  <p><code>memory_usage(deep=True)</code> counts the real bytes, including the strings. Four small columns cost 37 MB per million rows, so 2 billion rows need about 74 GB just to sit in memory, before any groupby makes copies. A normal laptop has 16 GB.</p>
  <p>There are two ways out. <strong>Scale up</strong>: buy one bigger machine. That works up to a point and gets very expensive. <strong>Scale out</strong>: split the data across many ordinary machines, let each one work on its piece, and combine the small results. Spark is a system for scaling out. You write code that looks like pandas or SQL; Spark splits the data, sends work to the machines, survives a machine dying, and combines the answers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Counting votes in a general election. One clerk could count a village's votes alone (pandas). For the whole country, every booth counts its own ballots, each constituency adds up its booths, and the Election Commission adds up constituencies. Nobody ever holds all the ballots. Spark is the Election Commission's system for handing out ballot boxes and collecting tallies.</p>
  </div>
  <table class="tbl">
    <tr><th>Data size</th><th>Tool</th><th>Why</th></tr>
    <tr><td>&lt; ~5 GB</td><td>pandas / Polars</td><td>Fits in RAM; no cluster overhead</td></tr>
    <tr><td>5–100 GB</td><td>DuckDB, Polars, one big VM</td><td>Out-of-core on one machine is often enough</td></tr>
    <tr><td>100 GB → PB</td><td><strong>Spark</strong> (Databricks, EMR, Dataproc)</td><td>Splits data and work across many machines</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Apache Spark</strong> is a distributed data-processing engine: it runs DataFrame and SQL code in parallel across a cluster (a group of machines working together). It is written in Scala on the JVM (Java Virtual Machine); <strong>PySpark</strong> is its Python interface.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spark on 50 MB is <em>slower</em> than pandas: starting the JVM, planning and scheduling tasks cost seconds before any work happens. Pick Spark for a reason you can name (size, an existing lakehouse, the team's platform), not because it sounds impressive. Interviewers like candidates who say "I'd try DuckDB first".</p>
  </div>

  <h2 id="sp-arch"><span class="num">02</span>Architecture</h2>
  <p>To scale out, someone must decide who works on what. If ten machines each grab rows at random, some rows get counted twice and others never. Spark solves this with a fixed division of roles and a fixed unit of work.</p>
  <p>The unit of work is the <strong>partition</strong>: a chunk of rows. A 2-billion-row table might be 2,000 partitions of a million rows each. One <strong>task</strong> processes one partition on one CPU core. The <strong>driver</strong> is the process running your Python script: it turns your code into a plan, splits the plan into tasks, and hands them out. <strong>Executors</strong> are worker processes on the cluster's machines: they run tasks and can keep data in memory (the cache). The <strong>cluster manager</strong> (YARN, Kubernetes, or Spark's own standalone mode) decides which machines the executors run on.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600">
    <defs><marker id="sp-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="85" width="140" height="60" rx="8" class="fb sb"/>
    <text x="90" y="110" text-anchor="middle" font-weight="bold">Driver</text>
    <text x="90" y="128" text-anchor="middle" font-size="11">plans, schedules</text>
    <rect x="220" y="10" width="140" height="44" rx="8" class="fv"/>
    <text x="290" y="37" text-anchor="middle">Cluster manager</text>
    <text x="290" y="70" text-anchor="middle" font-size="10" class="tm">YARN / Kubernetes / standalone</text>
    <g>
      <rect x="420" y="20" width="160" height="56" rx="8" class="ft st"/>
      <text x="500" y="40" text-anchor="middle" font-weight="bold">Executor 1</text>
      <rect x="432" y="50" width="40" height="18" rx="3" class="fs"/><text x="452" y="63" text-anchor="middle" font-size="10">task</text>
      <rect x="480" y="50" width="40" height="18" rx="3" class="fs"/><text x="500" y="63" text-anchor="middle" font-size="10">task</text>
      <rect x="528" y="50" width="40" height="18" rx="3" class="fg"/><text x="548" y="63" text-anchor="middle" font-size="10">cache</text>
    </g>
    <g>
      <rect x="420" y="90" width="160" height="56" rx="8" class="ft st"/>
      <text x="500" y="110" text-anchor="middle" font-weight="bold">Executor 2</text>
      <rect x="432" y="120" width="40" height="18" rx="3" class="fs"/><text x="452" y="133" text-anchor="middle" font-size="10">task</text>
      <rect x="480" y="120" width="40" height="18" rx="3" class="fs"/><text x="500" y="133" text-anchor="middle" font-size="10">task</text>
      <rect x="528" y="120" width="40" height="18" rx="3" class="fg"/><text x="548" y="133" text-anchor="middle" font-size="10">cache</text>
    </g>
    <g>
      <rect x="420" y="160" width="160" height="56" rx="8" class="ft st"/>
      <text x="500" y="180" text-anchor="middle" font-weight="bold">Executor 3</text>
      <rect x="432" y="190" width="40" height="18" rx="3" class="fs"/><text x="452" y="203" text-anchor="middle" font-size="10">task</text>
      <rect x="480" y="190" width="40" height="18" rx="3" class="fs"/><text x="500" y="203" text-anchor="middle" font-size="10">task</text>
      <rect x="528" y="190" width="40" height="18" rx="3" class="fg"/><text x="548" y="203" text-anchor="middle" font-size="10">cache</text>
    </g>
    <line x1="160" y1="100" x2="218" y2="40" stroke="currentColor" marker-end="url(#sp-ar)"/>
    <text x="40" y="72" font-size="10" class="tm">1. ask for resources</text>
    <line x1="360" y1="32" x2="418" y2="40" stroke="currentColor" marker-end="url(#sp-ar)"/>
    <line x1="160" y1="115" x2="418" y2="115" stroke="currentColor" marker-end="url(#sp-ar)"/>
    <line x1="160" y1="125" x2="418" y2="185" stroke="currentColor" marker-end="url(#sp-ar)"/>
    <text x="230" y="108" font-size="10" class="tm">2. send tasks directly</text>
  </svg><figcaption>The driver plans; executors (processes on worker machines) run one task per partition per core.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding kitchen. The head cook (driver) reads the menu and writes a plan. The caterer's manager (cluster manager) decides which cooks are hired today. Each cook (executor) has a few burners (cores) and a small fridge (cache). A big pot of rice split into portions is the partitions; one burner cooks one portion at a time (a task).</p>
  </div>
  <p>Now see it. <code>local[4]</code> means "pretend cluster on this laptop with 4 cores": the driver and one executor share the machine. We build a 20-row DataFrame and ask Spark which partition each row lives in, using <code>spark_partition_id()</code>.</p>
  <div class="fx" data-lang="py">from pyspark.sql import SparkSession, functions as F
spark = (SparkSession.builder.master("local[4]").appName("notes")
         .config("spark.sql.shuffle.partitions", "8").getOrCreate())

print("cores:", spark.sparkContext.defaultParallelism)
nums = spark.range(0, 20)                       # a DataFrame with one column "id": 0..19
print("partitions:", nums.rdd.getNumPartitions())
nums.groupBy(F.spark_partition_id().alias("partition")).agg(
    F.count("*").alias("rows"), F.min("id").alias("first"), F.max("id").alias("last")
).orderBy("partition").show()</div>
  <div class="fx" data-lang="text">cores: 4
partitions: 4
+---------+----+-----+----+
|partition|rows|first|last|
+---------+----+-----+----+
|        0|   5|    0|   4|
|        1|   5|    5|   9|
|        2|   5|   10|  14|
|        3|   5|   15|  19|
+---------+----+-----+----+</div>
  <p>What happened: <code>SparkSession</code> is your entry point, the "connection" to Spark. With 4 cores, Spark split the 20 rows into 4 partitions of 5, so all 4 cores can work at once. On a real cluster with 200 cores, you'd want at least 200 partitions, or some cores sit idle. <code>spark.sql.shuffle.partitions</code> (set to 8 here, default 200) is how many partitions Spark creates after a shuffle; Section 04 explains shuffles.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Driver</strong>: the process that runs your program and schedules work. <strong>Executor</strong>: a worker process that runs tasks and stores cached data. <strong>Partition</strong>: a chunk of a dataset; the unit of parallelism. <strong>Task</strong>: one unit of work on one partition, run by one core.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The driver is a single machine with normal memory. Anything that pulls all the data back to it (<code>collect()</code>, <code>toPandas()</code>) can crash it with out-of-memory, even though the cluster had plenty. Bring back only small results.</p>
  </div>

  <h2 id="sp-lazy"><span class="num">03</span>DataFrames &amp; Laziness</h2>
  <p>In pandas, every line runs immediately: <code>df[df.status == "delivered"]</code> builds a new filtered table right away. On a cluster that would be wasteful. Imagine filtering 2 billion rows, then joining, then discovering you only needed two columns and one city. Each step would have read and moved far more data than needed.</p>
  <p>Spark waits instead. Operations that build a new DataFrame, like <code>filter</code>, <code>join</code> and <code>groupBy</code>, are <strong>transformations</strong>: they only write down a step in a recipe and return instantly. Only when you ask for a result, with an <strong>action</strong> like <code>show()</code>, <code>count()</code> or <code>write</code>, does Spark look at the whole recipe, optimise it, and run it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ordering at a dhaba with friends. The waiter writes everyone's order on a pad (transformations) and goes to the kitchen only when you say "that's all" (action). Because the cook sees the whole list, four plates of paneer are made in one pan instead of four trips. A waiter who ran to the kitchen after every single item would be pandas on a cluster.</p>
  </div>
  <div class="flow"><span>filter</span><span>join</span><span>groupBy</span><span>(nothing runs)</span><span>show() = action</span><span>plan optimised + executed</span></div>
  <p>The code builds a small orders table and a customers table, then chains three transformations and times them. Then one action.</p>
  <div class="fx" data-lang="py">import time
orders = spark.createDataFrame(
    [(1, 101, "delivered", 1200.0), (2, 102, "cancelled", 300.0), (3, 101, "delivered", 450.0),
     (4, 103, "delivered", 880.0), (5, 104, "delivered", 999.0), (6, 102, "delivered", 150.0)],
    ["order_id", "customer_id", "status", "amount"])
customers = spark.createDataFrame(
    [(101, "Asha", "Mumbai"), (102, "Ravi", "Pune"), (103, "Neha", "Mumbai"), (104, "Arjun", "Delhi")],
    ["customer_id", "name", "city"])
t0 = time.time()
q = (orders.filter(F.col("status") == "delivered")            # transformation
           .join(customers, "customer_id")                    # transformation
           .groupBy("city")                                   # transformation
           .agg(F.sum("amount").alias("revenue"), F.count("*").alias("orders")))
print(f"built q in {time.time()-t0:.3f}s; type = {type(q).__name__}; nothing has run yet")
q.orderBy("city").show()                                      # action</div>
  <div class="fx" data-lang="text">built q in 0.138s; type = DataFrame; nothing has run yet
+------+-------+------+
|  city|revenue|orders|
+------+-------+------+
| Delhi|  999.0|     1|
|Mumbai| 2530.0|     3|
|  Pune|  150.0|     1|
+------+-------+------+</div>
  <p>Read it. <code>q</code> is a DataFrame, but it holds no rows yet, only a plan; building it took a fraction of a second and would take the same on 2 billion rows. <code>F.col("status")</code> refers to a column, like <code>df["status"]</code> in pandas. <code>show()</code> is the action that made Spark actually filter, join and add. Check one number by hand: Mumbai has Asha (1200 + 450) and Neha (880) = 2530 over 3 orders. Ravi's ₹300 order was cancelled, so Pune shows only ₹150.</p>
  <table class="tbl">
    <tr><th>Transformations (lazy)</th><th>Actions (run a job)</th></tr>
    <tr><td><code>select, filter, withColumn, join, groupBy, orderBy, repartition</code></td><td><code>show, count, collect, take, toPandas, write</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A Spark <strong>DataFrame</strong> is a distributed table with named, typed columns (a <strong>schema</strong>). <strong>Lazy evaluation</strong>: transformations build a logical plan (the <strong>lineage</strong>); an action makes the <strong>Catalyst optimizer</strong> rewrite it (push filters down, drop unused columns, pick join methods) and execute it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every action re-runs the whole lineage from the source. <code>q.count()</code>, then <code>q.show()</code>, then <code>q.write...</code> is three full jobs, each re-reading and re-joining. If you reuse a result, cache it (Section 07). Also, errors in a transformation (a typo in a column name inside a UDF, a bad cast) often only appear when an action runs, far from the line that caused them.</p>
  </div>

  <h2 id="sp-shuffle"><span class="num">04</span>Narrow, Wide &amp; Stages</h2>
  <p>Some steps are easy to split. To keep only delivered orders, each partition can filter its own rows without talking to anyone. Other steps are not. To total revenue per city, every Mumbai row in the whole dataset must end up in the same place, but Mumbai rows are scattered across every partition. Rows must physically move between machines. That moving is the most expensive thing Spark does.</p>
  <p>Spark names the two kinds. A <strong>narrow</strong> transformation needs only one input partition to make each output partition: <code>filter</code>, <code>select</code>, <code>withColumn</code>. A <strong>wide</strong> transformation needs rows from many partitions: <code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>. A wide step triggers a <strong>shuffle</strong>: every task writes its rows to local disk sorted into buckets by key, and tasks in the next step fetch their bucket from every machine over the network.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A post office sorting room. Stamping letters is narrow: each clerk stamps the pile on their own desk. Sorting by city is wide: every clerk walks every Mumbai letter to the Mumbai bin, every Pune letter to the Pune bin. The walking is the shuffle. Which bin a city goes to is decided by a rule (a hash of the city name), not by who holds the letter.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="sp-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="130" y="18" text-anchor="middle" font-weight="bold" class="tg">Narrow (filter, select)</text>
    <rect x="40" y="35" width="60" height="30" rx="4" class="fb"/><rect x="40" y="85" width="60" height="30" rx="4" class="fb"/><rect x="40" y="135" width="60" height="30" rx="4" class="fb"/>
    <rect x="170" y="35" width="60" height="30" rx="4" class="fg"/><rect x="170" y="85" width="60" height="30" rx="4" class="fg"/><rect x="170" y="135" width="60" height="30" rx="4" class="fg"/>
    <line x1="100" y1="50" x2="168" y2="50" stroke="currentColor" marker-end="url(#sp-ar2)"/>
    <line x1="100" y1="100" x2="168" y2="100" stroke="currentColor" marker-end="url(#sp-ar2)"/>
    <line x1="100" y1="150" x2="168" y2="150" stroke="currentColor" marker-end="url(#sp-ar2)"/>
    <text x="130" y="185" text-anchor="middle" font-size="11" class="tm">1 → 1, no network, same stage</text>
    <text x="450" y="18" text-anchor="middle" font-weight="bold" class="tr">Wide (groupBy, join)</text>
    <rect x="360" y="35" width="60" height="30" rx="4" class="fb"/><rect x="360" y="85" width="60" height="30" rx="4" class="fb"/><rect x="360" y="135" width="60" height="30" rx="4" class="fb"/>
    <rect x="490" y="35" width="60" height="30" rx="4" class="fr"/><rect x="490" y="85" width="60" height="30" rx="4" class="fr"/><rect x="490" y="135" width="60" height="30" rx="4" class="fr"/>
    <g stroke="currentColor" marker-end="url(#sp-ar2)">
      <line x1="420" y1="50" x2="488" y2="50"/><line x1="420" y1="50" x2="488" y2="98"/><line x1="420" y1="50" x2="488" y2="146"/>
      <line x1="420" y1="100" x2="488" y2="54"/><line x1="420" y1="100" x2="488" y2="146"/>
      <line x1="420" y1="150" x2="488" y2="56"/><line x1="420" y1="150" x2="488" y2="104"/><line x1="420" y1="150" x2="488" y2="150"/>
    </g>
    <text x="450" y="185" text-anchor="middle" font-size="11" class="tm">many → many, network shuffle, new stage</text>
  </svg><figcaption>Narrow: each output partition needs one input partition. Wide: rows with the same key must travel to the same partition.</figcaption></figure>
  <p>Watch rows move. The code puts 8 sales rows into 2 partitions with cities mixed, then calls <code>repartition(3, "city")</code>, which shuffles rows so each city lands in the partition chosen by hashing its name. The helper <code>where</code> prints which cities each partition holds.</p>
  <div class="fx" data-lang="py">sales = spark.createDataFrame(
    [("Mumbai", 100), ("Pune", 40), ("Delhi", 70), ("Mumbai", 20),
     ("Delhi", 10), ("Pune", 60), ("Mumbai", 30), ("Delhi", 50)],
    ["city", "amount"]).repartition(2)          # start: 2 partitions, cities mixed
def where(df, label):
    rows = df.withColumn("p", F.spark_partition_id()).groupBy("p").agg(
        F.sort_array(F.collect_list("city")).alias("cities")).orderBy("p").collect()
    print(label, {r.p: r.cities for r in rows})
where(sales, "before:")
where(sales.repartition(3, "city"), "after :")</div>
  <div class="fx" data-lang="text">before: {0: ['Delhi', 'Mumbai', 'Mumbai', 'Pune'], 1: ['Delhi', 'Delhi', 'Mumbai', 'Pune']}
after : {0: ['Delhi', 'Delhi', 'Delhi', 'Mumbai', 'Mumbai', 'Mumbai'], 2: ['Pune', 'Pune']}</div>
  <p>Before, every partition had a mix, so no single task could total Mumbai. After the shuffle, all three Mumbai rows sit together in partition 0 and both Pune rows in partition 2, so a per-city sum needs no more movement. Two more things to notice. Delhi and Mumbai hashed to the same partition, and partition 1 got nothing: hashing doesn't promise even sizes, which is the root of <strong>skew</strong> (Section 06). And every row crossed partition boundaries: on a real cluster that is disk writes plus network transfer.</p>
  <p>Spark groups work around shuffles. A chain of narrow steps runs as one <strong>stage</strong>: each task filters, selects and computes in one pass over its partition, without stopping. A shuffle ends a stage; the next stage starts when the shuffle data is ready. One action is one <strong>job</strong>, made of stages, made of tasks (one per partition).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shuffle</strong>: redistributing rows across partitions (and machines) by key, through disk and network. <strong>Stage</strong>: a set of tasks that run narrow steps back-to-back; stage boundaries are shuffles. <strong>Job → stages → tasks</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Not every shuffle is visible in your code. <code>distinct()</code>, <code>orderBy()</code>, <code>repartition()</code>, a window function with <code>partitionBy</code>, and a non-broadcast join all shuffle. When a job is slow, count the shuffles first (next section shows how).</p>
  </div>

  <h2 id="sp-sql"><span class="num">05</span>Spark SQL &amp; explain()</h2>
  <p>Half your team writes SQL, the other half writes DataFrame code. Do they get different performance? And when a job is slow, how do you see what Spark decided to do? Both answers come from one tool: the <strong>query plan</strong>.</p>
  <p>Spark SQL lets you register a DataFrame as a temporary table (a <strong>view</strong>) and query it with normal SQL. Both SQL and DataFrame code go into the same optimizer and come out as the same <strong>physical plan</strong>: the exact list of operations Spark will run. <code>explain()</code> prints that plan. You read it from the bottom (where data is read) to the top (the final result).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Google Maps. You can type the destination in Hindi or English (SQL or DataFrame); the route it computes is the same. <code>explain()</code> is the "show route" button: it tells you which roads (operations) and how many toll booths (shuffles) are on the way before you drive.</p>
  </div>
  <p>The code runs the same revenue-per-city query as SQL, then prints the plan of the DataFrame version <code>q</code> from Section 03.</p>
  <div class="fx" data-lang="py">orders.createOrReplaceTempView("orders")
customers.createOrReplaceTempView("customers")
spark.sql("""SELECT c.city, SUM(o.amount) AS revenue, COUNT(*) AS orders
             FROM orders o JOIN customers c ON o.customer_id = c.customer_id
             WHERE o.status = 'delivered'
             GROUP BY c.city ORDER BY c.city""").show()
q.explain()     # physical plan of the DataFrame query</div>
  <div class="fx" data-lang="text">+------+-------+------+
|  city|revenue|orders|
+------+-------+------+
| Delhi|  999.0|     1|
|Mumbai| 2530.0|     3|
|  Pune|  150.0|     1|
+------+-------+------+

== Physical Plan ==
AdaptiveSparkPlan isFinalPlan=false
+- HashAggregate(keys=[city#39], functions=[sum(amount#36), count(1)])
   +- Exchange hashpartitioning(city#39, 8), ENSURE_REQUIREMENTS, [plan_id=404]
      +- HashAggregate(keys=[city#39], functions=[partial_sum(amount#36), partial_count(1)])
         +- Project [amount#36, city#39]
            +- SortMergeJoin [customer_id#34L], [customer_id#37L], Inner
               :- Sort [customer_id#34L ASC NULLS FIRST], false, 0
               :  +- Exchange hashpartitioning(customer_id#34L, 8), ENSURE_REQUIREMENTS, [plan_id=396]
               :     +- Project [customer_id#34L, amount#36]
               :        +- Filter ((isnotnull(status#35) AND (status#35 = delivered)) AND isnotnull(customer_id#34L))
               :           +- Scan ExistingRDD[order_id#33L,customer_id#34L,status#35,amount#36]
               +- Sort [customer_id#37L ASC NULLS FIRST], false, 0
                  +- Exchange hashpartitioning(customer_id#37L, 8), ENSURE_REQUIREMENTS, [plan_id=397]
                     +- Project [customer_id#37L, city#39]
                        +- Filter isnotnull(customer_id#37L)
                           +- Scan ExistingRDD[customer_id#37L,name#38,city#39]</div>
  <p>Same numbers from SQL. Now walk the plan bottom-up (the <code>#36</code>-style suffixes are internal column ids; ignore them):</p>
  <ol>
    <li><strong>Scan</strong> reads both tables. <strong>Filter</strong> keeps delivered orders. Spark put the filter <em>before</em> the join even though we could have written it after: this is <strong>predicate pushdown</strong>.</li>
    <li><strong>Project</strong> keeps only the columns needed later (<code>customer_id, amount</code>; <code>order_id</code> and <code>name</code> are dropped). That is <strong>column pruning</strong>.</li>
    <li><strong>Exchange hashpartitioning(customer_id, 8)</strong> on both sides: two shuffles, so matching customer ids meet. <strong>Sort</strong> + <strong>SortMergeJoin</strong> then join them.</li>
    <li><strong>HashAggregate … partial_sum</strong>: each partition first totals its own rows per city, so only one row per city per partition moves in the next <strong>Exchange</strong> (shuffle 3). The top <strong>HashAggregate</strong> adds the partial totals.</li>
    <li><strong>AdaptiveSparkPlan</strong>: AQE (adaptive query execution) may still change this plan at runtime once it sees real data sizes.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Exchange</strong> in a plan = a shuffle = a stage boundary. Fewer Exchanges usually means a faster job. <strong>Partial aggregation</strong> (<code>partial_sum</code> → Exchange → <code>sum</code>) is Spark's version of a "combiner": pre-aggregate locally, then shuffle the small result.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Here a 4-row customers table caused a full sort-merge join with two shuffles, because Spark couldn't estimate the size of an in-memory table. On real data you'd want a broadcast join (next section). Always check the plan rather than assuming Spark picked the cheap option.</p>
  </div>

  <h2 id="sp-join"><span class="num">06</span>Joins at Scale</h2>
  <p>Joins are where Spark jobs usually get slow. A join needs matching keys in the same place, and in the plan above that meant shuffling <em>both</em> tables. Shuffling a 2 TB events table to match it with a 5 MB country list is absurd. And even when the method is right, one very common key can make one task do almost all the work.</p>
  <div class="cards">
    <div><b>Broadcast hash join</b><p>Copy the small table to every executor. The big table never moves.</p><small>Small side &lt; ~10 MB default (<code>spark.sql.autoBroadcastJoinThreshold</code>); force with <code>F.broadcast()</code></small></div>
    <div><b>Sort-merge join</b><p>Shuffle both sides by key, sort, then walk both in order.</p><small>Default for big ⋈ big. Two shuffles.</small></div>
    <div><b>Shuffle hash join</b><p>Shuffle both, build a hash table on the smaller side per partition.</p><small>When one side is medium-sized</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A broadcast join is photocopying the one-page price list and giving a copy to every billing counter, instead of making all customers queue at one desk that holds the list. It only works when the list is small enough to copy.</p>
  </div>
  <p>The code joins a 5-million-row orders table to the 4-row customers table, forcing broadcast with <code>F.broadcast(cust)</code>, then prints the plan and the result.</p>
  <div class="fx" data-lang="py">big = (spark.range(5_000_000)
       .withColumn("customer_id", F.col("id") % 4 + 101)
       .withColumn("amount", (F.col("id") % 1000).cast("double")))
cust = spark.createDataFrame([(101, "Mumbai"), (102, "Pune"), (103, "Mumbai"), (104, "Delhi")],
                             ["customer_id", "city"])
j = big.join(F.broadcast(cust), "customer_id").groupBy("city").agg(F.sum("amount").alias("revenue"))
j.explain()
j.orderBy("city").show()</div>
  <div class="fx" data-lang="text">== Physical Plan ==
AdaptiveSparkPlan isFinalPlan=false
+- HashAggregate(keys=[city#4], functions=[sum(amount#2)])
   +- Exchange hashpartitioning(city#4, 8), ENSURE_REQUIREMENTS, [plan_id=40]
      +- HashAggregate(keys=[city#4], functions=[partial_sum(amount#2)])
         +- Project [amount#2, city#4]
            +- BroadcastHashJoin [customer_id#1L], [customer_id#3L], Inner, BuildRight, false, false
               :- Project [((id#0L % 4) + 101) AS customer_id#1L, cast((id#0L % 1000) as double) AS amount#2]
               :  +- Filter isnotnull(((id#0L % 4) + 101))
               :     +- Range (0, 5000000, step=1, splits=4)
               +- BroadcastExchange HashedRelationBroadcastMode(List(input[0, bigint, false]),false), [plan_id=35]
                  +- Filter isnotnull(customer_id#3L)
                     +- Scan ExistingRDD[customer_id#3L,city#4]

+------+--------+
|  city| revenue|
+------+--------+
| Delhi|6.2625E8|
|Mumbai|1.2475E9|
|  Pune|6.2375E8|
+------+--------+</div>
  <p>Compare with Section 05. The 5M-row side (<code>Range</code>) goes straight into <strong>BroadcastHashJoin</strong> with <strong>no Exchange</strong>: it never moves. Only the tiny table travels, via <strong>BroadcastExchange</strong>. The one remaining Exchange shuffles the already-aggregated partial sums: a handful of rows. Mumbai is twice the others because two customers live there. (Spark prints big doubles in scientific form: 1.2475E9 = 1,247,500,000.)</p>
  <h3>Skew: one key with most of the rows</h3>
  <p>Hashing sends all rows of a key to one partition. If 90% of rows share one key, one task gets 90% of the work while the others finish early and wait. This is <strong>skew</strong>. The common fix is <strong>salting</strong>: add a random number (the salt, here 0–7) to the hot key so its rows spread over several partitions, then combine the pieces afterwards.</p>
  <div class="fx" data-lang="py">skewed = spark.range(2_000_000).withColumn(
    "k", F.when(F.col("id") % 10 &lt; 9, 1).otherwise(F.col("id") % 8))   # 90% of rows: k = 1
print("key counts:", sorted((r.k, r["count"]) for r in skewed.groupBy("k").count().collect()))
a = {r.p: r["count"] for r in skewed.repartition(8, "k")
         .groupBy(F.spark_partition_id().alias("p")).count().collect()}
salted = skewed.withColumn("salt", (F.rand(1) * 8).cast("int"))         # add random 0..7
b = {r.p: r["count"] for r in salted.repartition(8, "k", "salt")
         .groupBy(F.spark_partition_id().alias("p")).count().collect()}
for p in range(8):
    print(p, a.get(p, 0), b.get(p, 0))</div>
  <div class="fx" data-lang="text">key counts: [(1, 1850000), (3, 50000), (5, 50000), (7, 50000)]
0 0 24937
1 0 730156
2 0 6183
3 100000 243199
4 50000 12511
5 1850000 482235
6 0 231439
7 0 269340</div>
  <table class="tbl out"><caption>Rows per partition, 8 partitions (from the run above)</caption>
    <tr><th></th><th>hash on k</th><th>hash on (k, salt)</th></tr>
    <tr><td>Biggest partition</td><td><strong>1,850,000</strong> (92%)</td><td>730,156 (37%)</td></tr>
    <tr><td>Empty partitions</td><td>5 of 8</td><td>0 of 8</td></tr>
  </table>
  <p>Without salt, partition 5 holds 1.85 million rows and five partitions are empty: one core does almost everything. With salt, key 1 is split into 8 sub-keys and the biggest partition is 2.5× smaller. It is still uneven, because 8 salts hashed into 8 buckets collide; real jobs use more partitions and more salt values. For a <em>join</em>, salt the big side and copy each row of the small side once per salt value, then join on (key, salt).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Skew is one supermarket checkout with 90 customers while seven tills sit empty. The shop closes only when the last customer is billed. Salting tells the long queue "tokens 0–7, go to the till on your token".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Data skew</strong>: an uneven distribution of rows across keys, making some tasks far bigger than others. Fixes: broadcast the other side; salting; AQE's <code>spark.sql.adaptive.skewJoin.enabled</code> (splits oversized partitions automatically); handle NULL or default keys separately.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The hidden hot key is often NULL or a placeholder like <code>"unknown"</code> or <code>0</code>. Before tuning anything, run <code>df.groupBy(key).count().orderBy(F.desc("count")).show(5)</code>.</p>
  </div>

  <h2 id="sp-part"><span class="num">07</span>Partitions, Cache, Parquet</h2>
  <p>Three layout decisions control most of a job's speed: how many partitions the data is in, whether a reused result is kept in memory, and how files are stored on disk. Getting them wrong doesn't break anything; it just makes jobs ten times slower or creates a hundred thousand tiny files.</p>
  <h3>repartition vs coalesce</h3>
  <p>Too few partitions: idle cores. Too many: each task is so small that scheduling overhead dominates. <code>repartition(n)</code> reshuffles everything into n even partitions. <code>coalesce(n)</code> only reduces the count by gluing neighbouring partitions together, with no shuffle.</p>
  <div class="fx" data-lang="py">print(big.rdd.getNumPartitions())                                   # local[4] default
print(big.repartition(16).rdd.getNumPartitions())                   # full shuffle
print(big.coalesce(2).rdd.getNumPartitions())                       # merge, no shuffle
print(big.groupBy("customer_id").count().rdd.getNumPartitions())    # after a shuffle</div>
  <div class="fx" data-lang="text">4
16
2
1</div>
  <p>The last line surprises people: <code>spark.sql.shuffle.partitions</code> is 8, yet the result has 1 partition. AQE saw that the grouped result was only 4 rows and merged the 8 tiny shuffle partitions into one.</p>
  <table class="tbl">
    <tr><th></th><th><code>repartition(n)</code></th><th><code>coalesce(n)</code></th></tr>
    <tr><td>Direction</td><td>Up or down</td><td>Down only</td></tr>
    <tr><td>Shuffle?</td><td>Yes, full; evenly balanced</td><td>No; merges neighbours, can be uneven</td></tr>
    <tr><td>Use for</td><td>More parallelism; co-locate a key before a join or write</td><td>Fewer output files at the end</td></tr>
  </table>
  <h3>Cache</h3>
  <p>Remember: every action re-runs the lineage. If a cleaned table feeds five reports, it gets cleaned five times. <code>cache()</code> tells Spark to keep the result in executor memory after the next action computes it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Making masala for a week of cooking. Grinding fresh every day (no cache) costs time each day. Grinding once and keeping a jar in the fridge (cache) costs a little extra effort the first day, then every day is quick. If you cook only once, the jar is a waste of fridge space.</p>
  </div>
  <div class="fx" data-lang="py">big.write.parquet("out/big")
df = (spark.read.parquet("out/big")
      .groupBy("customer_id", (F.col("id") % 1000).alias("bucket")).agg(F.avg("amount")))
for label in ["run 1 (no cache)", "run 2 (no cache)"]:
    t = time.time(); df.count(); print(f"{label}  {time.time()-t:.2f}s")
df.cache()
t = time.time(); df.count(); print(f"run 3 (fills cache) {time.time()-t:.2f}s")
t = time.time(); df.count(); print(f"run 4 (from cache)  {time.time()-t:.2f}s")
df.unpersist()</div>
  <div class="fx" data-lang="text">run 1 (no cache)  0.88s
run 2 (no cache)  0.64s
run 3 (fills cache) 1.53s
run 4 (from cache)  0.14s</div>
  <p>Runs 1 and 2 each read the files and re-aggregated. <code>cache()</code> itself did nothing (it is lazy); run 3 computed the result <em>and</em> stored it, so it was the slowest. Run 4 read from memory: about 5× faster than run 2. Cache pays off only from the second use onward. <code>unpersist()</code> frees the memory.</p>
  <h3>Parquet &amp; partitionBy</h3>
  <p><strong>Parquet</strong> is the standard file format for big tables. It stores data column by column, compressed, with the schema and min/max statistics per block. So a query that needs 2 of 50 columns reads only those 2 (<strong>column pruning</strong>), and a filter like <code>amount &gt; 900</code> can skip blocks whose max is below 900 (<strong>predicate pushdown</strong>). <code>partitionBy("city")</code> on write goes further: one folder per city.</p>
  <div class="fx" data-lang="py">import os
sales = big.join(F.broadcast(cust), "customer_id")
sales.coalesce(1).write.mode("overwrite").partitionBy("city").parquet("out/bycity")
print(sorted(os.listdir("out/bycity")))
pune = spark.read.parquet("out/bycity").filter("city = 'Pune'")
pune.explain()
print("Pune rows:", pune.count())</div>
  <div class="fx" data-lang="text">['._SUCCESS.crc', '_SUCCESS', 'city=Delhi', 'city=Mumbai', 'city=Pune']
== Physical Plan ==
*(1) ColumnarToRow
+- FileScan parquet [customer_id#271L,id#272L,amount#273,city#274] Batched: true, DataFilters: [],
   Format: Parquet, Location: InMemoryFileIndex(1 paths)[file:/.../out/bycity, PartitionFilters:
   [isnotnull(city#274), (city#274 = Pune)], PushedFilters: [], ReadSchema: struct&lt;...&gt;
Pune rows: 1250000</div>
  <p>(Plan line wrapped and path shortened.) Spark wrote one folder per city. <strong>PartitionFilters</strong> shows that the Pune filter was applied to folder names: Spark opened only <code>city=Pune/</code> and never touched the Delhi and Mumbai files. This is <strong>partition pruning</strong>, and it is why big tables are almost always partitioned by date.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Rule of thumb: partitions of about 100–200 MB in memory, and at least 2–3× the total cores. Output files of roughly 128 MB–1 GB. Partition folders on a low-cardinality column (few distinct values) that queries filter on, such as date or country.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>partitionBy("user_id")</code> on a table with 10 million users makes 10 million folders of tiny files; listing them alone can take longer than the query. Never partition folders by a high-cardinality column.</p>
  </div>

  <h2 id="sp-traps"><span class="num">08</span>Common Mistakes</h2>
  <p>Most slow Spark jobs come from a short list of habits carried over from pandas. The biggest one: writing a plain Python function and applying it row by row.</p>
  <h3>Python UDFs</h3>
  <p>A <strong>UDF</strong> (user-defined function) lets you run your own Python code on each row. The problem: Spark's engine runs in the JVM, not in Python. For a plain Python UDF, every row is converted, sent to a separate Python process, computed, and sent back. The optimizer also can't see inside your function. A <strong>pandas UDF</strong> sends whole batches of rows as pandas Series via Apache Arrow (a fast in-memory column format), which cuts the per-row cost. Recent Spark versions can also send plain UDFs through Arrow (<code>spark.sql.execution.pythonUDF.arrow.enabled</code>). A <strong>built-in</strong> column expression (<code>F.col("amount") * 0.012</code>) never leaves the JVM.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Python UDF is sending every single letter through a translator in another building. A pandas UDF sends the translator a full sack at a time. A built-in function is a clerk who already speaks the language.</p>
  </div>
  <p>The benchmark converts 5 million rupee amounts to dollars four ways and sums them, taking the best of 3 runs each after a warm-up.</p>
  <div class="fx" data-lang="py">import pandas as pd
from pyspark.sql.types import DoubleType
big = spark.range(5_000_000).withColumn("amount", (F.col("id") % 1000).cast("double"))

to_usd = F.udf(lambda x: x * 0.012, DoubleType())          # plain Python UDF: one row at a time

@F.pandas_udf(DoubleType())                                 # pandas UDF: a whole batch at a time
def to_usd_vec(x: pd.Series) -&gt; pd.Series:
    return x * 0.012

def timed(label, expr):
    best = 1e9
    for _ in range(3):                                      # best of 3 runs
        t = time.time()
        total = big.select(F.sum(expr)).collect()[0][0]
        best = min(best, time.time() - t)
    print(f"{label:12} {best:5.2f}s  total={total:,.0f}")

big.select(F.sum(to_usd("amount"))).collect()               # warm-up: start Python workers once
spark.conf.set("spark.sql.execution.pythonUDF.arrow.enabled", "false")
timed("python udf", to_usd("amount"))
spark.conf.set("spark.sql.execution.pythonUDF.arrow.enabled", "true")
timed("arrow udf", to_usd("amount"))
timed("pandas_udf", to_usd_vec("amount"))
timed("built-in", F.col("amount") * 0.012)</div>
  <div class="fx" data-lang="text">python udf    1.42s  total=29,970,000
arrow udf     1.78s  total=29,970,000
pandas_udf    1.24s  total=29,970,000
built-in      0.15s  total=29,970,000</div>
  <p>All four give the same total. The built-in expression was about 8–12× faster than any Python version. The three Python variants were close to each other here because the function is trivial; with heavier per-row Python work, the batch (pandas) version pulls ahead. Timings on a shared laptop vary from run to run; the gap to built-ins is what stays. Lesson: search <code>pyspark.sql.functions</code> before writing a UDF.</p>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td><code>collect()</code> / <code>toPandas()</code> on big data</td><td>Driver out-of-memory</td><td><code>take(n)</code>, aggregate first, or <code>write</code></td></tr>
    <tr><td>Python UDFs</td><td>Slow, no pushdown</td><td>Built-in <code>F.*</code> functions; else <code>pandas_udf</code></td></tr>
    <tr><td>Small files</td><td>Thousands of KB-sized files; slow listing and reads</td><td><code>coalesce</code>/<code>repartition</code> before write; compaction (Delta <code>OPTIMIZE</code>)</td></tr>
    <tr><td>Skewed key</td><td>One task runs for hours, the rest idle</td><td>Broadcast, salt, AQE skew join</td></tr>
    <tr><td>Too few / too many partitions</td><td>Idle cores / scheduler overhead</td><td>~100–200 MB each; tune <code>spark.sql.shuffle.partitions</code> or rely on AQE</td></tr>
    <tr><td>Re-computing lineage</td><td>Same expensive step runs per action</td><td><code>cache()</code> reused DataFrames</td></tr>
    <tr><td>Spark for tiny data</td><td>Seconds of overhead for a 50 MB file</td><td>pandas, Polars or DuckDB</td></tr>
  </table>
  <h3>Small files, measured</h3>
  <p>Each shuffle partition writes its own file. Writing straight after a 200-partition shuffle gives 200 files, however little data there is.</p>
  <div class="fx" data-lang="py">sales.repartition(200).write.mode("overwrite").parquet("out/many")
print("files:", len([f for f in os.listdir("out/many") if f.endswith(".parquet")]))
sales.coalesce(4).write.mode("overwrite").parquet("out/few")
print("files:", len([f for f in os.listdir("out/few") if f.endswith(".parquet")]))</div>
  <div class="fx" data-lang="text">files: 200
files: 4</div>
  <p>Same 5 million rows, 200 files versus 4. Multiply by 365 daily folders and the "many" version has 73,000 files, each one an extra request to S3 on every read.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>coalesce(1)</code> to get "one nice file" forces the last stage onto a single task. On big data that one task becomes the bottleneck, or runs out of memory. Aim for a sensible number of ~128 MB–1 GB files, not one.</p>
  </div>

  <h2 id="sp-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a transformation and an action? Give two of each.</summary><div class="qa-body">Transformations (<code>filter</code>, <code>groupBy</code>) return a new DataFrame and only add to the plan. Actions (<code>count</code>, <code>write</code>) make Spark optimise the plan and run a job. Laziness lets Catalyst optimise the whole pipeline at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain driver, executor, partition and task.</summary><div class="qa-body">The driver runs your program, builds the plan and schedules tasks. Executors are worker processes that run tasks and cache data. A partition is a chunk of rows. A task processes one partition on one core. So parallelism is limited by both partitions and cores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a shuffle, and which operations cause one?</summary><div class="qa-body">Moving rows across the network so all rows with the same key land in the same partition. Caused by wide operations: <code>groupBy</code>, non-broadcast <code>join</code>, <code>distinct</code>, <code>orderBy</code>, <code>repartition</code>, window <code>partitionBy</code>. It costs disk writes, network and serialisation, and starts a new stage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a physical plan, and what does Exchange mean?</summary><div class="qa-body">Read bottom-up: scans, filters, projects, joins, aggregates. <code>Exchange</code> is a shuffle and a stage boundary. Look for filters pushed below joins, <code>BroadcastHashJoin</code> vs <code>SortMergeJoin</code>, and <code>partial_sum</code> before an Exchange (pre-aggregation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You join a 2 TB events table with a 5 MB country table. What does Spark do, and how do you make sure?</summary><div class="qa-body">It should use a broadcast hash join: copy the 5 MB table to every executor, so the 2 TB side is never shuffled. Spark does this automatically under <code>autoBroadcastJoinThreshold</code> (10 MB) if it knows the size. Force it with <code>F.broadcast(countries)</code> and confirm <code>BroadcastHashJoin</code> in <code>explain()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A job's 199 tasks finish in 2 minutes; the last one takes 2 hours. Diagnose and fix.</summary><div class="qa-body">Data skew: one key (often NULL or a default like "unknown") holds most rows, so one partition is huge. Check key counts with <code>groupBy(key).count()</code>. Fix: broadcast the other side if small; enable AQE skew join; salt the hot key (random 0..N-1, replicate the other side N times, join on (key, salt)); handle NULL keys separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>repartition vs coalesce?</summary><div class="qa-body"><code>repartition(n)</code> does a full shuffle, can increase or decrease, and gives even partitions (optionally by a column). <code>coalesce(n)</code> only decreases, merges existing partitions without a shuffle, and can be uneven. Use coalesce to cut output files at the end; repartition to raise parallelism or co-locate keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a Python UDF slow, and what do you use instead?</summary><div class="qa-body">Rows are serialised from the JVM to a Python worker and back, and the optimizer can't see inside the function (no pushdown, no code generation). Use built-in <code>pyspark.sql.functions</code>; if you must use Python, a <code>pandas_udf</code> processes Arrow batches. In our run built-ins were about 10× faster than any Python UDF.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output: <code>df = spark.read.parquet(p); df2 = df.filter("x &gt; 0"); print("done")</code> on a 1 TB path. How long does it take?</summary><div class="qa-body">Near-instant. <code>filter</code> is lazy, and reading Parquet only fetches the schema from metadata. No job processes the data until an action like <code>count()</code> or <code>write</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you cache, and when is it harmful?</summary><div class="qa-body">Cache a DataFrame used by 2+ actions, such as features reused across training iterations or a cleaned table feeding several reports. Harmful when used once (the first run is slower, as our run showed), when it's bigger than memory (spills, evicts other data), or when you forget <code>unpersist()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the "small files problem" and how do you avoid it?</summary><div class="qa-body">Writing thousands of tiny files (e.g. 200 shuffle partitions × 365 date folders). Listing and opening each file costs more than reading it, and metadata in S3/HDFS explodes. Avoid with <code>coalesce</code>/<code>repartition(col)</code> before writing, aiming for ~128 MB–1 GB files, and periodic compaction (Delta <code>OPTIMIZE</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does partitionBy("date") on write give you, and what's the danger?</summary><div class="qa-body">One folder per date, so queries filtering on date read only matching folders (partition pruning, shown as <code>PartitionFilters</code> in the plan). Danger: partitioning on a high-cardinality column like <code>user_id</code> creates millions of folders and tiny files. Choose a low-cardinality column that queries filter on.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you NOT use Spark?</summary><div class="qa-body">When the data fits on one machine (under tens of GB): pandas, Polars or DuckDB will be faster and simpler, with no JVM start-up, cluster or scheduling overhead. Use Spark when data is too big for one box or already lives in a Spark-based lakehouse.</div></details>
</main>`
});
