// notes/dataeng/de_spark.js — Apache Spark
Object.assign(TOPIC_CONTENT, {
  "de_spark": `<main>
  <h1>Apache Spark</h1>
  <p class="lead">Spark runs pandas-style DataFrame code across many machines. You need it when data stops fitting on one box, and interviewers love asking about shuffles, joins and skew. Builds on SQL and pandas.</p>

  <h2 id="sp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Apache Spark</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When &amp; Why</div>
        <ul>
          <li><b>Spark</b> — distributed engine running DataFrame/SQL code across a cluster</li>
          <li><b>Use when</b> — 100 GB+ or data already in a lakehouse (Databricks, EMR)</li>
          <li><b>Don't</b> — &lt; ~5 GB: pandas/Polars/DuckDB are faster (no JVM/scheduling overhead)</li>
          <li>💡 one clerk counts a village; Spark splits a country's ballots across clerks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Architecture</div>
        <ul>
          <li><b>Driver</b> — runs your script, builds plan, schedules tasks; single machine</li>
          <li><b>Executors</b> — worker JVMs; run tasks, hold cache</li>
          <li><b>Cluster manager</b> — YARN / Kubernetes / standalone; allocates resources</li>
          <li><b>Partition = task = core</b> — the unit of parallelism</li>
          <li><b>Job → stages → tasks</b> — one action = one job; shuffles split stages</li>
          <li>⚠ <b>Driver OOM</b> — <code>collect()</code>/<code>toPandas()</code> on big data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lazy Evaluation</div>
        <ul>
          <li><b>Transformations</b> — lazy: <code>select, filter, join, groupBy, withColumn</code></li>
          <li><b>Actions</b> — trigger a job: <code>count, show, collect, write, take</code></li>
          <li><b>Why lazy</b> — Catalyst optimizer sees the whole plan: filter pushdown, column pruning, join choice</li>
          <li>⚠ <b>Each action recomputes lineage</b> — cache if reused</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shuffles &amp; Plans</div>
        <ul>
          <li><b>Narrow</b> — 1 input partition → 1 output (filter, select); no network</li>
          <li><b>Wide</b> — needs all rows of a key together (groupBy, join, distinct, orderBy) → <b>shuffle</b></li>
          <li><b>Shuffle</b> — disk + network + serialisation; the main cost; new stage</li>
          <li><b>explain()</b> — read bottom-up; <code>Exchange</code> = shuffle; <code>partial_sum</code> = map-side pre-aggregation</li>
          <li><b>AQE</b> — adaptive query execution: re-plans at runtime, merges tiny partitions, splits skewed ones</li>
          <li><b>Spark SQL</b> = DataFrame API — same optimizer, same plan</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Joins &amp; Skew</div>
        <ul>
          <li><b>Broadcast hash join</b> — small side (&lt; 10 MB default) copied to all executors; big side not shuffled; <code>F.broadcast(df)</code></li>
          <li><b>Sort-merge join</b> — big ⋈ big; shuffle + sort both sides</li>
          <li><b>Skew</b> — one key holds most rows → one straggler task</li>
          <li><b>Fixes</b> — broadcast, salting (random suffix + replicate small side), AQE skewJoin, handle NULL keys</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Partitions, Cache, Files</div>
        <ul>
          <li><b>repartition(n)</b> — full shuffle, up/down, even</li>
          <li><b>coalesce(n)</b> — down only, no shuffle, may be uneven; use before writing</li>
          <li><b>Size</b> — ~100–200 MB per partition; ≥ 2–3× cores</li>
          <li><b>cache()</b> — lazy; for DataFrames used 2+ times; <code>unpersist()</code> after</li>
          <li><b>Parquet</b> — columnar, compressed, schema + min/max stats → column pruning, predicate pushdown</li>
          <li><b>partitionBy("date")</b> — folder per value → partition pruning; ⚠ never on high-cardinality columns</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance Traps</div>
        <ul>
          <li>⚠ <b>Python UDF</b> — row-by-row JVM↔Python; ~11× slower in our run → built-ins or <code>pandas_udf</code></li>
          <li>⚠ <b>Small files</b> — thousands of tiny files; coalesce before write, compact</li>
          <li>⚠ <b>collect()</b> — pulls everything to the driver; use <code>take</code>/aggregate/write</li>
          <li>⚠ <b>Bad partition count</b> — idle cores or scheduler overhead; tune <code>spark.sql.shuffle.partitions</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sp-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When You Need Spark</span><span class="rm-sub">One machine is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="sp-arch"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Architecture</span><span class="rm-sub">Driver, executors, cluster manager</span></div></div>
      <div class="rm-item rm-done" data-target="sp-lazy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">DataFrames &amp; Laziness</span><span class="rm-sub">Transformations vs actions</span></div></div>
      <div class="rm-item rm-done" data-target="sp-shuffle"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Narrow, Wide &amp; Stages</span><span class="rm-sub">The shuffle is the cost</span></div></div>
      <div class="rm-item rm-done" data-target="sp-sql"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Spark SQL &amp; explain()</span><span class="rm-sub">Read a physical plan</span></div></div>
      <div class="rm-item rm-done" data-target="sp-join"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Joins at Scale</span><span class="rm-sub">Broadcast, sort-merge, skew</span></div></div>
      <div class="rm-item rm-done" data-target="sp-part"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Partitions, Cache, Parquet</span><span class="rm-sub">Layout decides speed</span></div></div>
      <div class="rm-item rm-done" data-target="sp-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Performance Traps</span><span class="rm-sub">collect, UDFs, small files</span></div></div>
      <div class="rm-item rm-done" data-target="sp-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sp-when"><span class="num">01</span>When You Need Spark</h2>
  <table class="tbl">
    <tr><th>Data size</th><th>Tool</th><th>Why</th></tr>
    <tr><td>&lt; ~5 GB</td><td>pandas / Polars</td><td>Fits in RAM; no cluster overhead</td></tr>
    <tr><td>5–100 GB</td><td>DuckDB, Polars, one big VM</td><td>Out-of-core on a single machine is often enough</td></tr>
    <tr><td>100 GB → PB</td><td><strong>Spark</strong> (Databricks, EMR, Dataproc)</td><td>Splits data and work across many machines</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Counting votes for a country. One clerk (pandas) is fastest for a village. For a country, you split ballots across thousands of clerks and add up their tallies. Spark is the system that hands out ballots and collects tallies.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spark on 50 MB is <em>slower</em> than pandas: JVM start-up, scheduling and serialisation dominate. Pick Spark for a named reason (size, an existing lakehouse), not prestige.</p>
  </div>

  <h2 id="sp-arch"><span class="num">02</span>Architecture</h2>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600">
    <defs><marker id="sp-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="85" width="140" height="60" rx="8" class="fb sb"/>
    <text x="90" y="110" text-anchor="middle" font-weight="bold">Driver</text>
    <text x="90" y="128" text-anchor="middle" font-size="11">plans DAG, schedules</text>
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
  </svg><figcaption>The driver plans; executors (JVM processes on worker machines) run one task per partition per core.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Driver = head chef writing the plan. Cluster manager = restaurant manager assigning cooks. Executors = cooks, each with a few burners (cores) and a fridge (cache).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The driver is a single machine. Anything that pulls all data to it (<code>collect()</code>, <code>toPandas()</code>) can crash it with out-of-memory.</p>
  </div>

  <h2 id="sp-lazy"><span class="num">03</span>DataFrames &amp; Laziness</h2>
  <div class="flow"><span>filter</span><span>join</span><span>groupBy</span><span>(nothing runs)</span><span>show() = action</span><span>plan optimised + executed</span></div>
  <p>A Spark DataFrame is a distributed table with a schema. <strong>Transformations</strong> only record a recipe; an <strong>action</strong> triggers the work.</p>
  <div class="fx" data-lang="py">from pyspark.sql import SparkSession, functions as F
spark = SparkSession.builder.master("local[4]").getOrCreate()

q = (orders.filter(F.col("status") == "delivered")     # transformation
           .join(customers, "customer_id")              # transformation
           .groupBy("city").agg(F.sum("amount").alias("revenue"),
                                F.count("*").alias("n")))
print(type(q).__name__, "- nothing has run yet")
q.show()                                                # action</div>
  <div class="fx" data-lang="text">DataFrame - nothing has run yet
+------+-------+---+
|  city|revenue|  n|
+------+-------+---+
|Mumbai| 2530.0|  3|
+------+-------+---+</div>
  <table class="tbl">
    <tr><th>Transformations (lazy)</th><th>Actions (run the job)</th></tr>
    <tr><td><code>select, filter, withColumn, join, groupBy, orderBy, repartition</code></td><td><code>show, count, collect, take, toPandas, write</code></td></tr>
  </table>
  <div class="callout intu"><span class="label">Why lazy?</span>
    <p>Seeing the whole recipe first lets the optimizer (Catalyst) push filters down, drop unused columns and pick join strategies before touching data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Each action re-runs the whole lineage from the source. Calling <code>count()</code> then <code>show()</code> then <code>write</code> = three full jobs, unless you cache.</p>
  </div>

  <h2 id="sp-shuffle"><span class="num">04</span>Narrow, Wide &amp; Stages</h2>
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
  <ul>
    <li><strong>Shuffle</strong>: redistributing rows across the network by key. Writes to disk, sends over network, reads back. The most expensive thing Spark does.</li>
    <li><strong>Stage</strong>: a chain of narrow steps between shuffles. Each shuffle starts a new stage.</li>
    <li><strong>Job → stages → tasks</strong>: one action = one job; tasks per stage = partitions.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting mail. Stamping each letter (narrow) happens at each desk. Sorting by city (wide) means everyone walks letters to the right city's desk: that walking is the shuffle.</p>
  </div>

  <h2 id="sp-sql"><span class="num">05</span>Spark SQL &amp; explain()</h2>
  <p>SQL and DataFrame code compile to the <em>same</em> plan. Use whichever reads better.</p>
  <div class="fx" data-lang="py">orders.createOrReplaceTempView("orders")
customers.createOrReplaceTempView("customers")
spark.sql("""SELECT c.city, SUM(o.amount) AS revenue
             FROM orders o JOIN customers c USING (customer_id)
             WHERE o.status = 'delivered' GROUP BY c.city""").show()
q.explain()     # physical plan of the DataFrame query above</div>
  <div class="fx" data-lang="text">== Physical Plan ==
AdaptiveSparkPlan isFinalPlan=false
+- HashAggregate(keys=[city#7], functions=[sum(amount#4), count(1)])
   +- Exchange hashpartitioning(city#7, 8)                         &lt;- shuffle 2
      +- HashAggregate(keys=[city#7], functions=[partial_sum(amount#4), partial_count(1)])
         +- Project [amount#4, city#7]
            +- SortMergeJoin [customer_id#1], [customer_id#5], Inner
               :- Sort [customer_id#1 ASC NULLS FIRST]
               :  +- Exchange hashpartitioning(customer_id#1, 8)   &lt;- shuffle 1
               :     +- Project [customer_id#1, amount#4]
               :        +- Filter ((isnotnull(status#3) AND (status#3 = delivered)) ...
               +- Sort [customer_id#5 ASC NULLS FIRST]
                  +- Exchange hashpartitioning(customer_id#5, 8)
                     +- Project [customer_id#5, city#7]</div>
  <p>Read bottom-up. What to notice (arrows added by hand, plan trimmed):</p>
  <ul>
    <li><strong>Filter pushed down</strong> below the join; <strong>Project</strong> keeps only needed columns.</li>
    <li><strong>Exchange</strong> = shuffle = stage boundary. Fewer Exchanges, faster job.</li>
    <li><strong>partial_sum → Exchange → sum</strong>: Spark pre-aggregates per partition before shuffling (like a combiner), so less data moves.</li>
    <li><strong>AdaptiveSparkPlan</strong>: AQE can change the plan at runtime using real sizes.</li>
  </ul>

  <h2 id="sp-join"><span class="num">06</span>Joins at Scale</h2>
  <div class="cards">
    <div><b>Broadcast hash join</b><p>Copy the small table to every executor. The big table never moves.</p><small>Small side &lt; ~10 MB default (<code>autoBroadcastJoinThreshold</code>); force with <code>F.broadcast()</code></small></div>
    <div><b>Sort-merge join</b><p>Shuffle both sides by key, sort, then merge.</p><small>Default for big ⋈ big. Two shuffles.</small></div>
    <div><b>Shuffle hash join</b><p>Shuffle both, build a hash table on the smaller side per partition.</p><small>When one side is medium-sized</small></div>
  </div>
  <div class="fx" data-lang="py">big.join(F.broadcast(cust), "customer_id").groupBy("city").sum("amount").explain()</div>
  <div class="fx" data-lang="text">+- BroadcastHashJoin [customer_id#1], [customer_id#3], Inner, BuildRight
   :- Filter isnotnull(customer_id#1)
   :  +- Range (0, 5000000, step=1, splits=4)          &lt;- 5M rows: no Exchange
   +- BroadcastExchange HashedRelationBroadcastMode(...)  &lt;- 4-row table copied</div>
  <p>Compare with section 05: the 5M-row side has <strong>no shuffle</strong> at all.</p>
  <h3>Skew: one key with most of the rows</h3>
  <div class="fx" data-lang="py">skewed = spark.range(2_000_000).withColumn(
    "k", F.when(F.col("id") % 10 &lt; 9, 1).otherwise(F.col("id") % 8))   # 90% of rows: k = 1
skewed.repartition(8, "k").groupBy(F.spark_partition_id()).count().show()

salted = skewed.withColumn("salt", (F.rand(1) * 8).cast("int"))         # add random 0..7
salted.repartition(8, "k", "salt").groupBy(F.spark_partition_id()).count().show()</div>
  <table class="tbl out"><caption>Rows per shuffle partition (real run)</caption>
    <tr><th>partition</th><th>hash on k</th><th>hash on (k, salt)</th></tr>
    <tr><td>0</td><td>0</td><td>24,937</td></tr><tr><td>1</td><td>0</td><td>730,156</td></tr>
    <tr><td>2</td><td>0</td><td>6,183</td></tr><tr><td>3</td><td>100,000</td><td>243,199</td></tr>
    <tr><td>4</td><td>50,000</td><td>12,511</td></tr><tr><td>5</td><td><strong>1,850,000</strong></td><td>482,235</td></tr>
    <tr><td>6</td><td>0</td><td>231,439</td></tr><tr><td>7</td><td>0</td><td>269,340</td></tr>
  </table>
  <p>One task did 92% of the work; salting cut the biggest partition 2.5×. (Uneven still: 8 salts hashed into 8 buckets collide. Real jobs use more partitions.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Skew is one supermarket checkout with 90 customers while 7 sit empty. Salting gives the giant queue several tills. The job ends only when the slowest till does.</p>
  </div>
  <ul>
    <li><strong>Fixes</strong>: broadcast the other side; salt the key (and replicate the small side ×N salts for joins); AQE <code>spark.sql.adaptive.skewJoin.enabled</code> splits big partitions automatically; filter NULL keys (a classic hidden hot key).</li>
  </ul>

  <h2 id="sp-part"><span class="num">07</span>Partitions, Cache, Parquet</h2>
  <div class="fx" data-lang="py">print(big.rdd.getNumPartitions())                                   # 4  (local[4])
print(big.repartition(16).rdd.getNumPartitions())                   # 16 (full shuffle)
print(big.coalesce(2).rdd.getNumPartitions())                       # 2  (merge, no shuffle)
print(big.groupBy("customer_id").count().rdd.getNumPartitions())    # 1  (AQE shrank 8 tiny ones)</div>
  <table class="tbl">
    <tr><th></th><th><code>repartition(n)</code></th><th><code>coalesce(n)</code></th></tr>
    <tr><td>Direction</td><td>Up or down</td><td>Down only</td></tr>
    <tr><td>Shuffle?</td><td>Yes, full; evenly balanced</td><td>No; merges neighbours, can be uneven</td></tr>
    <tr><td>Use for</td><td>More parallelism, partition by a key before a join/write</td><td>Fewer output files at the end</td></tr>
  </table>
  <p>Rule of thumb: partitions of ~100–200 MB; at least 2–3× total cores.</p>
  <h3>Cache</h3>
  <div class="fx" data-lang="py">df = spark.read.parquet("out/many").groupBy("customer_id", F.col("id") % 1000).agg(F.avg("amount"))
df.count(); df.count()          # each re-reads + re-aggregates
df.cache(); df.count()          # materialise into executor memory
df.count()                      # served from cache
df.unpersist()</div>
  <div class="fx" data-lang="text">run 1 (no cache)  2.97s
run 2 (no cache)  0.76s      (JVM warm, OS file cache)
run 3 (cached)    0.12s</div>
  <p>Cache only a DataFrame reused 2+ times (e.g. an ML training set across iterations). <code>cache()</code> is itself lazy.</p>
  <h3>Parquet &amp; partitionBy</h3>
  <div class="fx" data-lang="py">sales.coalesce(1).write.mode("overwrite").partitionBy("city").parquet("out/bycity")
spark.read.parquet("out/bycity").filter("city = 'Pune'").explain()</div>
  <div class="fx" data-lang="text">out/bycity/city=Delhi/  city=Mumbai/  city=Pune/
FileScan parquet [...] PartitionFilters: [isnotnull(city#223), (city#223 = Pune)] ...
Pune rows: 1250000</div>
  <ul>
    <li><strong>Parquet</strong>: columnar, compressed, stores schema and min/max stats. Reads only needed columns (projection) and skips row groups (predicate pushdown).</li>
    <li><strong>partitionBy</strong> writes one folder per value. <em>PartitionFilters</em> means Spark only opened the <code>city=Pune</code> folder.</li>
  </ul>

  <h2 id="sp-traps"><span class="num">08</span>Performance Traps</h2>
  <div class="fx" data-lang="py">to_usd = F.udf(lambda x: x * 0.012, DoubleType())         # Python UDF
big.select(F.sum(to_usd("amount"))).collect()             # 5M rows
big.select(F.sum(F.col("amount") * 0.012)).collect()      # built-in</div>
  <table class="tbl out"><caption>Real timing, 5M rows, local[4]</caption>
    <tr><th>method</th><th>time</th></tr><tr><td>Python UDF</td><td>5.53 s</td></tr><tr><td>built-in column expression</td><td><strong>0.48 s</strong></td></tr>
  </table>
  <p>A Python UDF ships every row JVM → Python → JVM and blinds the optimizer. ~11× slower here.</p>
  <table class="tbl">
    <tr><th>Trap</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td><code>collect()</code> / <code>toPandas()</code> on big data</td><td>Driver OOM</td><td><code>take(n)</code>, aggregate first, or <code>write</code></td></tr>
    <tr><td>Python UDFs</td><td>Slow, no pushdown</td><td>Built-in <code>F.*</code> functions; else <code>pandas_udf</code> (vectorised via Arrow)</td></tr>
    <tr><td>Small files</td><td>Thousands of KB-sized files; slow listing and reads</td><td><code>coalesce</code>/<code>repartition</code> before write; compaction (Delta <code>OPTIMIZE</code>)</td></tr>
    <tr><td>Skewed key</td><td>One task runs for hours, rest idle</td><td>Broadcast, salt, AQE skew join</td></tr>
    <tr><td>Too few / too many partitions</td><td>Idle cores / scheduler overhead</td><td>~100–200 MB each; tune <code>spark.sql.shuffle.partitions</code> or rely on AQE</td></tr>
    <tr><td>Re-computing lineage</td><td>Same expensive step runs per action</td><td><code>cache()</code> reused DataFrames</td></tr>
  </table>
  <p>Small files, real run: <code>sales.repartition(200).write.parquet(...)</code> produced <strong>200 files</strong> for 5M rows. <code>coalesce(1)</code> per city produced 3.</p>

  <h2 id="sp-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a transformation and an action? Give two of each.</summary><div class="qa-body">Transformations (<code>filter</code>, <code>groupBy</code>) return a new DataFrame and only add to the plan. Actions (<code>count</code>, <code>write</code>) make Spark optimise the plan and run a job. Laziness lets Catalyst optimise the whole pipeline at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a shuffle, and which operations cause one?</summary><div class="qa-body">Moving rows across the network so all rows with the same key land in the same partition. Caused by wide ops: <code>groupBy</code>, non-broadcast <code>join</code>, <code>distinct</code>, <code>orderBy</code>, <code>repartition</code>, window <code>partitionBy</code>. It costs disk writes, network and serialisation, and starts a new stage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You join a 2 TB events table with a 5 MB country table. What does Spark do, and how do you make sure?</summary><div class="qa-body">It should use a broadcast hash join: copy the 5 MB table to every executor, so the 2 TB side is never shuffled. Spark does this automatically under <code>autoBroadcastJoinThreshold</code> (10 MB) if it knows the size. Force it with <code>F.broadcast(countries)</code> and confirm <code>BroadcastHashJoin</code> in <code>explain()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A job's 199 tasks finish in 2 minutes; the last one takes 2 hours. Diagnose and fix.</summary><div class="qa-body">Data skew: one key (often NULL or a default like "unknown") holds most rows, so one partition is huge. Check key counts with <code>groupBy(key).count()</code>. Fix: broadcast the other side if small; enable AQE skew join; salt the hot key (append random 0..N-1, replicate the other side N times, join on (key, salt)); drop or handle NULL keys separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>repartition vs coalesce?</summary><div class="qa-body"><code>repartition(n)</code> does a full shuffle, can increase or decrease, and gives even partitions (optionally by a column). <code>coalesce(n)</code> only decreases, merges existing partitions without a shuffle, and can be uneven. Use coalesce to cut output files at the end; repartition to raise parallelism or co-locate keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a Python UDF slow, and what do you use instead?</summary><div class="qa-body">Every row is serialised from the JVM to a Python worker and back, row by row, and the optimizer can't see inside it (no pushdown, no codegen). Use built-in <code>pyspark.sql.functions</code>; if you must use Python, a <code>pandas_udf</code> processes Arrow batches and is much faster. In our run the UDF was ~11× slower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output: <code>df = spark.read.parquet(p); df2 = df.filter("x &gt; 0"); print("done")</code> on a 1 TB path. How long does it take?</summary><div class="qa-body">Near-instant. <code>filter</code> is lazy, and reading Parquet only fetches the schema from metadata. No job processes the data until an action like <code>count()</code> or <code>write</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you cache, and when is it harmful?</summary><div class="qa-body">Cache a DataFrame used by 2+ actions, such as features reused across training iterations or a cleaned table feeding several reports. Harmful when used once (wasted memory and time), when it's bigger than memory (spills, evicts other data), or when you forget <code>unpersist()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the "small files problem" and how do you avoid it?</summary><div class="qa-body">Writing thousands of tiny files (e.g. 200 shuffle partitions × 365 date folders). Listing and opening each file costs more than reading it, and metadata in S3/HDFS explodes. Avoid with <code>coalesce</code>/<code>repartition(col)</code> before writing, aiming for ~128 MB–1 GB files, and periodic compaction (Delta <code>OPTIMIZE</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does partitionBy("date") on write give you, and what's the danger?</summary><div class="qa-body">One folder per date, so queries filtering on date read only matching folders (partition pruning). Danger: partitioning on a high-cardinality column like <code>user_id</code> creates millions of folders and tiny files. Choose a low-cardinality column that queries filter on.</div></details>
</main>`
});
