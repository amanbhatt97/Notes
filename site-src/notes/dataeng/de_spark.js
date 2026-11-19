// notes/dataeng/de_spark.js — Apache Spark
Object.assign(TOPIC_CONTENT, {
  "de_spark": `<main>
  <h1>Apache Spark</h1>
  <div class="where"><span>Data Engineering</span><span>Apache Spark</span></div>
  <p class="lead">Apache Spark is an engine that runs table code, written much like pandas or SQL, across many machines at the same time. Data engineers reach for it when a job's data no longer fits in one computer's memory: a year of orders, a month of app clicks, a warehouse measured in terabytes. Spark is also the engine underneath most "lakehouse" platforms such as Databricks, EMR and Dataproc, so even teams with medium-sized data meet it every day. This note continues <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a> with the same running example, <strong>Biteful</strong>'s food orders. We first read the small Parquet warehouse that note built (10 orders between 2 and 8 March 2026, with delivered revenue Pune ₹1,400 and Mumbai ₹1,230), so every number can be checked by hand; when an idea only shows itself at scale, we use the same orders grown to 2 million rows during a Biryani Bros mega sale. Every output on this page comes from a real run of PySpark 4.3 in local mode, where one machine with 2 cores pretends to be a small cluster.</p>

  <h2 id="sp-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Apache Spark</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Too big for one machine: split the rows, move the code to them</li>
          <li>Each piece computes a small partial result; partials are combined</li>
          <li><b>Driver</b> plans; <b>executors</b> run one task per partition per core</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How a job runs</div>
        <ul>
          <li><b>DataFrame</b>: a table with a schema, split into partitions</li>
          <li><b>Transformations</b> are lazy; <b>actions</b> run the plan</li>
          <li><b>Narrow</b> steps stay in a partition; <b>wide</b> steps shuffle</li>
          <li><code>Exchange</code> in <code>explain()</code> = shuffle = new stage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Making it fast</div>
        <ul>
          <li><b>Broadcast</b> the small side of a join; sort-merge for big ⋈ big</li>
          <li><b>Skew</b>: one hot key, one slow task; fix with salting or AQE</li>
          <li><code>partitionBy(date)</code> folders give partition pruning</li>
          <li><code>cache()</code> results used more than once</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Habits to avoid</div>
        <ul>
          <li>Python UDFs where a built-in exists (slow, no pushdown)</li>
          <li><code>collect()</code> / <code>toPandas()</code> on big data</li>
          <li>Thousands of tiny files; <code>coalesce(1)</code> on big output</li>
          <li>Spark for data that fits on a laptop</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sp-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When One Machine Is Not Enough</span><span class="rm-sub">why pandas runs out, scale up vs scale out</span></div></div>
      <div class="rm-item rm-done" data-target="sp-dist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Distributed Idea</span><span class="rm-sub">split the data, move the code, combine partial results</span></div></div>
      <div class="rm-item rm-done" data-target="sp-arch"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Driver, Executors and the Cluster Manager</span><span class="rm-sub">who plans, who works, what a task is</span></div></div>
      <div class="rm-item rm-done" data-target="sp-df"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">DataFrames and Partitions</span><span class="rm-sub">a distributed table and how it is cut into pieces</span></div></div>
      <div class="rm-item rm-done" data-target="sp-lazy"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Lazy Evaluation</span><span class="rm-sub">transformations build a plan, actions run it</span></div></div>
      <div class="rm-item rm-done" data-target="sp-shuffle"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Narrow and Wide Transformations</span><span class="rm-sub">the shuffle, stages, reading explain()</span></div></div>
      <div class="rm-item rm-done" data-target="sp-sql"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Spark SQL and the Catalyst Optimizer</span><span class="rm-sub">same plan from SQL or Python, and how it is improved</span></div></div>
      <div class="rm-item rm-done" data-target="sp-join"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Joins: Broadcast and Sort-Merge</span><span class="rm-sub">joining 2 million orders to 5 restaurants</span></div></div>
      <div class="rm-item rm-done" data-target="sp-skew"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Data Skew and Salting</span><span class="rm-sub">when one key holds most of the rows</span></div></div>
      <div class="rm-item rm-done" data-target="sp-part"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Partitioning and File Layout</span><span class="rm-sub">repartition, coalesce, folders per day</span></div></div>
      <div class="rm-item rm-done" data-target="sp-cache"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Caching and Persistence</span><span class="rm-sub">compute once, reuse many times</span></div></div>
      <div class="rm-item rm-done" data-target="sp-udf"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Built-in Functions vs Python UDFs</span><span class="rm-sub">why your own Python function is slow</span></div></div>
      <div class="rm-item rm-done" data-target="sp-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">None comparisons, brackets, collect, tiny files</span></div></div>
      <div class="rm-item rm-done" data-target="sp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, plans, joins, layout in five minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sp-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the Spark questions data engineering interviews ask</span></div></div>
    </div>
  </div>

  <h2 id="sp-why"><span class="num">01</span>When One Machine Is Not Enough</h2>
  <p>Biteful's nightly pipeline from the ETL note runs in pandas, and a week of its orders is a few kilobytes. Then Biteful grows. One day the transform step is asked to total revenue per city for a whole year of orders, and the machine freezes. To see why, we need to know how pandas works: it keeps the entire table in the memory (RAM) of one computer, and most operations, such as a groupby or a merge, build new tables alongside the old one, so the memory needed is a multiple of the data's size. The quickest way to judge whether a job will fit is to measure the cost of one row and multiply. Here we build a million Biteful-shaped orders and ask pandas how many bytes they really use:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

# one million Biteful-shaped orders, built in pandas
n = 1_000_000
rng = np.random.default_rng(0)
df = pd.DataFrame({
    "order_id": np.arange(n),
    "customer_id": rng.integers(1, 2_000_000, n),
    "restaurant": rng.choice(["Dosa Hut", "Biryani Bros", "Pizza Point", "Green Bowl", "Momo Magic"], n),
    "city": rng.choice(["Pune", "Mumbai"], n),
    "status": rng.choice(["delivered", "cancelled", "pending"], n),
    "amount": rng.integers(100, 900, n).astype(float),
    "delivery_minutes": rng.integers(15, 60, n),
    "ordered_at": pd.Timestamp("2026-03-02") + pd.to_timedelta(rng.integers(0, 86_400, n), unit="s"),
})
per_row = df.memory_usage(deep=True).sum() / n           # real bytes, strings included
print(f"bytes per order       : {per_row:.0f}")
print(f"1 million orders      : {per_row * n / 1e6:,.0f} MB in RAM")
rows_50gb = 50e9 / per_row
print(f"50 GB holds           : {rows_50gb / 1e6:,.0f} million orders")
print(f"at 20 lakh orders/day : {rows_50gb / 2e6:,.0f} days of orders")</div>
  <div class="fx" data-lang="text">bytes per order       : 211
1 million orders      : 211 MB in RAM
50 GB holds           : 237 million orders
at 20 lakh orders/day : 119 days of orders</div>
  <p><code>memory_usage(deep=True)</code> counts the real bytes, including the text in string columns, and it says one order costs about 211 bytes. A million orders is therefore about 211 MB, which is nothing for a laptop. But 50 GB holds about 237 million orders, roughly four months for a delivery company taking 20 lakh orders a day, and that is just to <em>hold</em> the table. A groupby or merge needs working copies on top, so a realistic job needs two or three times that much RAM, while an ordinary laptop has 16 GB. The job does not get slow; it simply cannot run.</p>
  <p>There are two ways out of this. The first is to <strong>scale up</strong>: rent one much bigger machine with hundreds of gigabytes of memory. That works for a while, but large machines get expensive quickly, there is always a biggest machine you can buy, and if that one machine fails, the whole job fails with it. The second is to <strong>scale out</strong>: spread the data over many ordinary machines, let each one work on its own share, and combine their small answers. Scaling out has no fixed ceiling, because you add machines as data grows, but it raises hard questions: who decides which machine gets which rows, how does the work get to them, and what happens when one of them crashes halfway through?</p>
  <p>Think of counting votes in a national election. A single clerk could count one village's ballots alone, which is pandas. For a whole country, nobody tries to bring every ballot to one room; each polling booth counts its own ballots, each constituency adds up its booths, and the election commission adds up the constituencies. Nobody ever holds all the ballots at once, yet the final result is exact.</p>
  <p><strong>Apache Spark</strong> is a distributed data-processing engine: software that runs your DataFrame or SQL code in parallel across a <strong>cluster</strong>, which is simply a group of machines working together on one job. You write code that looks like pandas or SQL, and Spark handles the hard parts of scaling out: splitting the data, sending work to the machines, recovering from failures and combining results. Spark itself is written in Scala and runs on the JVM (the Java Virtual Machine, the runtime that Java programs use); <strong>PySpark</strong> is its Python interface, and it is what this note uses.</p>
  <p>It is just as important to know when <em>not</em> to use Spark. Starting the JVM, planning a job and scheduling its pieces costs seconds before any real work begins, so on Biteful's 10 orders Spark is far slower than pandas. Between a few gigabytes and roughly a hundred, single-machine tools such as DuckDB and Polars, which process data in chunks without needing it all in memory, are often faster and much simpler. A sensible rule of thumb:</p>
  <table class="tbl">
    <tr><th>Data size</th><th>Good tool</th><th>Why</th></tr>
    <tr><td>under ~5 GB</td><td>pandas, Polars</td><td>fits in RAM; no cluster overhead</td></tr>
    <tr><td>~5–100 GB</td><td>DuckDB, Polars, one big VM</td><td>out-of-core processing on one machine is usually enough</td></tr>
    <tr><td>100 GB and up, or data already in a lakehouse</td><td>Spark (Databricks, EMR, Dataproc)</td><td>splits data and work across many machines</td></tr>
  </table>
  <p>So the decision is not "Spark is for big data" but "Spark is for data that is too big for one machine, or for teams whose platform already runs on it". The rest of this note explains how Spark actually pulls off scaling out, starting with the one idea everything else is built on.</p>

  <h2 id="sp-dist"><span class="num">02</span>The Distributed Idea: Split the Data, Move the Code</h2>
  <p>Suppose Biteful's orders are spread across several machines. No single machine can see "all the Pune orders", so how can we still get Pune's total revenue? And what should travel over the network between machines: the data, or the program that works on it?</p>
  <p>The answer rests on two ideas. The first is <strong>splitting the data</strong>: each machine stores and reads only its own share of the rows. The second is <strong>moving the code to the data</strong>, also called <strong>data locality</strong>: a program is a few kilobytes while the data can be gigabytes, so instead of sending every row to one machine, we send the small function to every machine and run it where the rows already live. Each machine then produces a small <strong>partial result</strong>, and only those partial results travel to one place, where they are combined. Running the same function on different pieces of data at the same time is called <strong>data parallelism</strong>.</p>
  <p>A teacher who wants the average mark for five sections of a class works the same way. She does not collect two hundred answer sheets; each section teacher sends back two numbers, "total marks and number of students", and she adds up five pairs. The marking happens where the sheets are, and only tiny summaries move.</p>
  <p>Before we let Spark do this, here is the whole idea in plain Python on Biteful's 10 orders, with three pretend machines:</p>
  <div class="fx" data-lang="py">import pickle
import pandas as pd

orders = pd.read_parquet("data/fact_orders")[["order_id", "city", "status", "amount"]]
orders = orders.sort_values("order_id").to_dict("records")

# 1. split the data: three "machines" each hold some of the rows
machines = {"A": orders[0:4], "B": orders[4:7], "C": orders[7:10]}

# 2. move the code to the data: the same small function runs on every machine
def partial_revenue(rows):
    out = {}
    for r in rows:
        if r["status"] == "delivered":
            out[r["city"]] = out.get(r["city"], 0) + r["amount"]
    return out

partials = {}
for name, rows in machines.items():
    partials[name] = partial_revenue(rows)
    print(f"machine {name} holds {[r['order_id'] for r in rows]} -&gt; {partials[name]}")

# 3. combine the small results in one place
total = {}
for p in partials.values():
    for city, amt in p.items():
        total[city] = total.get(city, 0) + amt
print("combined:", total)

print("bytes if every row travelled :", len(pickle.dumps(orders)))
print("bytes that actually travelled:", len(pickle.dumps(list(partials.values()))))</div>
  <div class="fx" data-lang="text">machine A holds [101, 102, 103, 104] -&gt; {'Pune': 1140.0, 'Mumbai': 450.0}
machine B holds [105, 106, 107] -&gt; {'Mumbai': 180.0}
machine C holds [108, 109, 110] -&gt; {'Pune': 260.0, 'Mumbai': 600.0}
combined: {'Pune': 1400.0, 'Mumbai': 1230.0}
bytes if every row travelled : 354
bytes that actually travelled: 94</div>
  <p>Machine A holds orders 101 to 104 and finds Pune 1140 and Mumbai 450 among its delivered orders. Machine B holds 105 to 107; two of those were cancelled, so it reports only Mumbai 180. Machine C holds 108 to 110 and reports Pune 260 and Mumbai 600, ignoring the pending order 110. Adding the three small dictionaries gives Pune 1400 and Mumbai 1230, exactly the delivered revenue from the ETL note. Notice the last two lines: shipping every row would have moved 354 bytes, while the three partial results were only 94 bytes. With 237 million orders the rows would be 50 GB, but the partial results would still be one small number per city per machine.</p>
  <p>This is why sums, counts, minimums, maximums and averages (sent as a sum and a count) scale so well: they can be computed in pieces and combined afterwards, which is called <strong>partial aggregation</strong>. Not every question splits so nicely. A median cannot be built from per-machine medians, and "how many distinct customers" cannot be added up from per-machine counts, because the same customer may appear on two machines. Questions like those need all rows with the same key brought together in one place first, which is the expensive operation called a <em>shuffle</em> that we will meet in section 06. Our loop also cheated in an important way: it played every role itself. On a real cluster something has to decide how to split the data, ship the function, collect the partial results and redo the work of a machine that crashes. That is the job of Spark's architecture.</p>

  <h2 id="sp-arch"><span class="num">03</span>Driver, Executors and the Cluster Manager</h2>
  <p>If ten machines each grabbed rows as they pleased, some orders would be counted twice and others never. A distributed system needs a clear division of labour: one coordinator that makes the plan, and many workers that follow it. Spark has exactly that, with three roles and two units of work.</p>
  <p>The unit of data is the <strong>partition</strong>: a chunk of rows that is processed as one piece (machine A's four orders in the last section were one partition). The unit of work is the <strong>task</strong>: one task processes one partition on one CPU core. The <strong>driver</strong> is the process that runs your Python script; it turns your code into a plan, cuts the plan into tasks and hands them out. <strong>Executors</strong> are worker processes running on the cluster's machines; they run tasks and can keep data in memory for later reuse. The <strong>cluster manager</strong> (YARN, Kubernetes, or Spark's own "standalone" manager) owns the machines and decides where executors start. A program submitted to a real cluster with <code>spark-submit</code> can run its driver on your own computer ("client mode") or on a machine inside the cluster ("cluster mode"); either way the roles are the same.</p>
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
  </svg><figcaption>The driver asks the cluster manager for executors, then sends tasks to them directly; each executor runs one task per core and can cache data.</figcaption></figure>
  <p>Follow the picture from left to right. When your script starts, the driver first asks the cluster manager for resources ("three executors, each with two cores and 8 GB of memory"). The cluster manager starts those executor processes on whichever machines have room. From then on the cluster manager steps aside: the driver talks to the executors directly, sending each one tasks, and each executor runs as many tasks at once as it has cores. The small "cache" box in each executor is memory where it can keep partitions for reuse, which section 11 uses. If an executor dies, the driver notices that its tasks never finished and simply runs them again on another executor. That is how Spark survives machine failures without you writing any recovery code.</p>
  <p>A wedding kitchen is a good picture of this. The head cook (the driver) reads the menu and writes the plan. The catering manager (the cluster manager) decides which cooks are hired today. Each cook (an executor) has a few burners (cores) and a small fridge (the cache). The rice has been split into portions (partitions), and one burner cooks one portion at a time (a task). If a cook faints, the head cook simply hands that portion to someone else.</p>
  <p>In PySpark everything starts with a <strong>SparkSession</strong>, the object your script uses to talk to Spark. Setting the master to <code>local[2]</code> means "no real cluster: run the driver and one executor on this machine, with 2 cores", which behaves like a tiny cluster and is how every example on this page runs. To watch the code travel to the data, we cut Biteful's 10 order ids into 4 partitions and ask each task which operating-system process it ran in (a process id, or pid, is the number the operating system gives each running program):</p>
  <div class="fx" data-lang="py">import os, sys
from pyspark.sql import SparkSession

os.environ["PYSPARK_PYTHON"] = sys.executable          # Python workers use the same Python as the driver

spark = (SparkSession.builder
         .master("local[2]")                           # a pretend cluster: 2 cores on this machine
         .appName("biteful")
         .config("spark.sql.shuffle.partitions", "8")  # partitions after a shuffle (default 200)
         .config("spark.ui.enabled", "false")
         .config("spark.ui.showConsoleProgress", "false")
         .getOrCreate())
spark.sparkContext.setLogLevel("ERROR")

sc = spark.sparkContext
print("master        :", sc.master)
print("cores (slots) :", sc.defaultParallelism)
print("driver        : python pid", os.getpid())

def who_am_i(index, rows):                    # runs inside a task, on a worker
    yield (index, os.getpid(), list(rows))

ids = sc.parallelize(range(101, 111), 4)      # Biteful's 10 order ids, cut into 4 partitions
for part, pid, rows in ids.mapPartitionsWithIndex(who_am_i).collect():
    print(f"partition {part}: orders {rows} ran in python worker pid {pid}")</div>
  <div class="fx" data-lang="text">master        : local[2]
cores (slots) : 2
driver        : python pid 15015
partition 0: orders [101, 102] ran in python worker pid 15137
partition 1: orders [103, 104, 105] ran in python worker pid 15136
partition 2: orders [106, 107] ran in python worker pid 15136
partition 3: orders [108, 109, 110] ran in python worker pid 15137</div>
  <p>The driver is one Python process. The function <code>who_am_i</code> did not run there: Spark serialised it (turned it into bytes), shipped it to the executor, and ran it in separate Python worker processes. Four partitions became four tasks, but there are only 2 cores, so only two tasks can run at a time; that is why only two worker pids appear, each one handling two partitions one after the other. The 10 ids were split 2, 3, 2 and 3. On a real cluster those workers would sit on different machines, each reading its own partition from nearby storage. The setting <code>spark.sql.shuffle.partitions</code> (8 here, 200 by default) controls how many partitions Spark creates after a shuffle; it will make sense in section 06.</p>
  <p>Every later script on this page starts with <code>from common import spark, F, ...</code>, where <code>common.py</code> holds exactly the session-building lines above, plus <code>F</code> (the <code>pyspark.sql.functions</code> module, the usual short name) and two paths: <code>ORDERS</code> for the warehouse folder and <code>RESTAURANTS</code> for the 5-row restaurants table.</p>
  <p>One consequence of this design matters in practice: the driver is a single process with ordinary memory. Anything that pulls the whole dataset back to it, such as <code>collect()</code> or <code>toPandas()</code>, can crash it with an out-of-memory error, even when the cluster has terabytes of memory to spare. Results that come back to the driver should be small, like a two-row table of city totals.</p>

  <h2 id="sp-df"><span class="num">04</span>DataFrames and Partitions</h2>
  <p>The last example used raw ids and a hand-written function, which is how Spark was programmed in its early days through an API called the <strong>RDD</strong> (Resilient Distributed Dataset): a distributed collection of arbitrary Python or Java objects, with no column names or types that Spark understands. Real work is about tables, though. We want to say "keep the delivered orders and total them per city", as we would in pandas or SQL, not "ship this function to partition 3", and we want Spark to understand the columns so it can plan the work cleverly.</p>
  <p>That is what a Spark <strong>DataFrame</strong> is: a table with named, typed columns, whose rows are spread over partitions across the cluster. The list of column names and types is its <strong>schema</strong>. You write table operations; Spark turns them into tasks. A DataFrame is also <strong>immutable</strong>, meaning operations never change it in place; each one returns a new DataFrame. Under the hood a DataFrame still runs on RDDs, which is why <code>df.rdd</code> exists, but because Spark knows the schema it can choose efficient memory layouts and optimise the plan, something it cannot do with opaque Python objects. (In Scala and Java there is also a typed variant called a Dataset; Python only has DataFrames.)</p>
  <p>Think of a class register kept as loose pages in several folders. The DataFrame is "the register": you say "count the absent students" without caring where the pages are. The folders are the partitions: each helper takes one folder. Which pages went into which folder is a filing decision, and it can be changed by re-sorting the pages.</p>
  <p>The first split happens when Spark reads files. It packs files (or slices of large files) into partitions of up to 128 MB each, while also trying to create enough partitions to keep every core busy. Let us read the warehouse the ETL note built, one Parquet file per day in folders named <code>order_date=2026-03-02</code> and so on, and look at its schema and partitions:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS

orders = spark.read.parquet(ORDERS)                     # the warehouse built in de_etl
orders.printSchema()
print("rows:", orders.count(), "| partitions after reading:", orders.rdd.getNumPartitions())

def show_partitions(df):                                # which rows sit in which partition?
    (df.withColumn("partition", F.spark_partition_id())
       .groupBy("partition")
       .agg(F.sort_array(F.collect_set(F.date_format("order_date", "d MMM"))).alias("days"),
            F.sort_array(F.collect_list("order_id")).alias("orders"))
       .orderBy("partition").show(truncate=False))

show_partitions(orders)
show_partitions(orders.repartition(4))                  # deal the rows out into 4 partitions</div>
  <div class="fx" data-lang="text">root
 |-- order_id: long (nullable = true)
 |-- ordered_at_utc: string (nullable = true)
 |-- customer_id: long (nullable = true)
 |-- restaurant_id: long (nullable = true)
 |-- restaurant: string (nullable = true)
 |-- city: string (nullable = true)
 |-- cuisine: string (nullable = true)
 |-- status: string (nullable = true)
 |-- amount: double (nullable = true)
 |-- delivery_minutes: long (nullable = true)
 |-- order_date: date (nullable = true)

rows: 10 | partitions after reading: 2
+---------+---------------------+-----------------------------------+
|partition|days                 |orders                             |
+---------+---------------------+-----------------------------------+
|0        |[2 Mar, 4 Mar, 5 Mar]|[101, 102, 103, 106, 107, 108, 109]|
|1        |[3 Mar, 8 Mar]       |[104, 105, 110]                    |
+---------+---------------------+-----------------------------------+

+---------+---------------------+---------------+
|partition|days                 |orders         |
+---------+---------------------+---------------+
|0        |[2 Mar]              |[101]          |
|1        |[2 Mar, 4 Mar, 8 Mar]|[103, 106, 110]|
|2        |[2 Mar, 3 Mar, 5 Mar]|[102, 105, 108]|
|3        |[3 Mar, 4 Mar, 5 Mar]|[104, 107, 109]|
+---------+---------------------+---------------+</div>
  <p>The schema came from inside the Parquet files: <code>amount</code> is a double (a decimal number), <code>delivery_minutes</code> is a long (a 64-bit integer), and so on. The <code>order_date</code> column is not stored inside any file at all; Spark read it from the folder names and recognised it as a date. The 5 day-files became 2 partitions: because the files are tiny, Spark packed the files for 2, 4 and 5 March into partition 0 (7 orders) and those for 3 and 8 March into partition 1 (3 orders), one partition per core. The helper <code>F.spark_partition_id()</code> tells us which partition each row lives in, and <code>df.rdd.getNumPartitions()</code> tells us how many there are.</p>
  <p>The second table shows that partitions belong to the data in memory, not to the files. <code>repartition(4)</code> dealt the 10 rows out into 4 new partitions (1, 3, 3 and 3 rows), mixing the days together. We will see later that this re-dealing has a real cost, and when it is worth paying.</p>
  <p>Because Spark takes the schema from the files and expects them all to agree, it is stricter than pandas about one thing that bites real pipelines. When the ETL note first wrote its warehouse, pandas stored <code>delivery_minutes</code> as an integer on days when every delivery time was known, and as a decimal on days with a missing value (pandas uses a float NaN for "missing"). Here is that situation rebuilt with two files:</p>
  <div class="fx" data-lang="py">import os, pandas as pd
from common import spark

# two day-files written by pandas WITHOUT a pinned type
os.makedirs("out/drift/order_date=2026-03-02", exist_ok=True)
os.makedirs("out/drift/order_date=2026-03-03", exist_ok=True)
pd.DataFrame({"order_id": [101, 102, 103], "delivery_minutes": [32, 41, 38]}) \\
  .to_parquet("out/drift/order_date=2026-03-02/part-0.parquet")      # all known -&gt; int64
pd.DataFrame({"order_id": [104, 105], "delivery_minutes": [None, None]}).astype({"delivery_minutes": float}) \\
  .to_parquet("out/drift/order_date=2026-03-03/part-0.parquet")      # gaps -&gt; float64

print(pd.read_parquet("out/drift").shape, "&lt;- pandas reads the folder")
try:
    spark.read.parquet("out/drift").show()
except Exception as e:
    msg = str(e)
    print("Spark:", msg[msg.find("Data type mismatches"):].split(". SQLSTATE")[0])</div>
  <div class="fx" data-lang="text">(5, 3) &lt;- pandas reads the folder
Spark: Data type mismatches when reading Parquet column [delivery_minutes]. Expected Spark type bigint, actual Parquet type DOUBLE</div>
  <p>pandas happily reads the folder and converts as needed. Spark refuses: it expected a <code>bigint</code> from the first file and found a <code>DOUBLE</code> in the second. Files whose types change from day to day are said to suffer <strong>schema drift</strong>, and the fix belongs in the job that writes the files (the ETL note now pins the column with <code>astype("Int64")</code>), not in every reader. Two more differences from pandas are worth remembering: a Spark DataFrame has no row index, so there is no <code>df.loc[5]</code>, and row order is not guaranteed unless you sort with <code>orderBy</code>, so code that relies on "the first row" can give different answers on different runs.</p>

  <h2 id="sp-lazy"><span class="num">05</span>Lazy Evaluation: Transformations and Actions</h2>
  <p>In pandas each line runs the moment you execute it. On a cluster that habit would be very expensive. Imagine Spark filtering every partition, then joining, then discovering on the next line that you only needed two columns and one city: it would have read and moved far more data than necessary, and every unnecessary pass over terabytes costs minutes. To avoid this, Spark waits until it has seen what you actually want.</p>
  <p>Spark divides DataFrame operations into two kinds. A <strong>transformation</strong> is an operation that describes a new DataFrame, such as <code>filter</code>, <code>select</code>, <code>join</code> or <code>groupBy</code>; it does no work, it only adds a step to a plan and returns immediately. An <strong>action</strong> is an operation that asks for a result, such as <code>show()</code>, <code>count()</code>, <code>collect()</code> or <code>write</code>; only then does Spark look at the whole plan, optimise it and run it. This style is called <strong>lazy evaluation</strong>.</p>
  <p>Think of ordering at a dhaba with friends. The waiter writes everyone's order on a pad (transformations) and only goes to the kitchen when you say "that's all" (the action). Because the cook sees the whole list at once, four plates of paneer are made in one pan. A waiter who ran to the kitchen after every single item would be pandas on a cluster.</p>
  <p>To <em>see</em> laziness we need a way to count how many rows Spark has actually looked at. We write the "delivered" filter as a Python function that adds 1 to a shared counter every time it is called. The counter is a Spark <strong>accumulator</strong>: a variable that tasks on the executors can add to and the driver can read. We also count how many Spark jobs (runs of work on the cluster) have happened so far:</p>
  <div class="fx" data-lang="py">from pyspark.sql.types import BooleanType
from common import spark, F, ORDERS

sc = spark.sparkContext
rows_seen = sc.accumulator(0)                    # a counter tasks add to; the driver reads it

def is_delivered(status):                        # a Python filter that counts every row it sees
    rows_seen.add(1)
    return status == "delivered"
is_delivered_udf = F.udf(is_delivered, BooleanType())

def jobs():                                      # how many Spark jobs have run so far
    return len(sc.statusTracker().getJobIdsForGroup())

orders = spark.read.parquet(ORDERS)
print(f"after read        : rows seen {rows_seen.value:2}, jobs {jobs()}")
d = orders.filter(is_delivered_udf("status"))                     # transformation
print(f"after filter      : rows seen {rows_seen.value:2}, jobs {jobs()}")
g = d.groupBy("city").agg(F.sum("amount").alias("revenue"))       # transformation
print(f"after groupBy/agg : rows seen {rows_seen.value:2}, jobs {jobs()}  ({type(g).__name__})")

print("g.count() =", g.count())                                   # ACTION
print(f"after count()     : rows seen {rows_seen.value:2}, jobs {jobs()}")
g.orderBy("city").show()                                          # another ACTION
print(f"after show()      : rows seen {rows_seen.value:2}, jobs {jobs()}")</div>
  <div class="fx" data-lang="text">after read        : rows seen  0, jobs 1
after filter      : rows seen  0, jobs 1
after groupBy/agg : rows seen  0, jobs 1  (DataFrame)
g.count() = 2
after count()     : rows seen 10, jobs 4
+------+-------+
|  city|revenue|
+------+-------+
|Mumbai| 1230.0|
|  Pune| 1400.0|
+------+-------+

after show()      : rows seen 20, jobs 6</div>
  <p>Walk through it line by line:</p>
  <table class="tbl">
    <tr><th>Line</th><th>Kind</th><th>Rows looked at</th><th>Jobs</th><th>What happened</th></tr>
    <tr><td><code>spark.read.parquet</code></td><td>setup</td><td>0</td><td>1</td><td>one small job read the file footers to learn the schema; no rows were read</td></tr>
    <tr><td><code>filter</code></td><td>transformation</td><td>0</td><td>1</td><td>only added "keep delivered" to the plan</td></tr>
    <tr><td><code>groupBy().agg()</code></td><td>transformation</td><td>0</td><td>1</td><td>only added "total per city"; <code>g</code> is a plan, not data</td></tr>
    <tr><td><code>g.count()</code></td><td><b>action</b></td><td>10</td><td>4</td><td>ran the plan: every order passed through the filter once; the answer is 2 cities</td></tr>
    <tr><td><code>g.show()</code></td><td><b>action</b></td><td>20</td><td>6</td><td>ran the <em>whole</em> plan again, from the files</td></tr>
  </table>
  <p>The filter and groupBy lines returned instantly with 0 rows touched, and <code>g</code> is just a DataFrame object holding a plan. The totals are right (Pune 240 + 520 + 380 + 260 = 1400, Mumbai 450 + 180 + 600 = 1230). The last row is the surprise that catches everyone: the second action re-read the files and ran the filter over all 10 rows again, taking the counter from 10 to 20. Spark keeps the <em>recipe</em> for a DataFrame, not the cooked result. That recipe, the chain of transformations that produces a DataFrame, is called its <strong>lineage</strong>. (Each action shows up as more than one job because Spark runs a query's stages as separate small jobs when adaptive execution is on; the exact job count is not important.)</p>
  <p>Laziness is not just a quirk; it buys three things. First, because Spark sees the whole plan before running anything, its optimizer can rearrange it, for example moving filters closer to the files and reading only the columns that are used; section 07 shows this happening. Second, it lets Spark combine many steps into one pass over each partition. Third, the lineage doubles as a recovery mechanism: if an executor dies and a partition is lost, Spark recomputes just that partition from its recipe. The price is the one we just saw: every action recomputes from the source unless you ask Spark to keep a result (section 11), and an error inside a transformation, such as a bad cast, often appears only when an action finally runs, many lines later.</p>
  <table class="tbl">
    <tr><th>Transformations (lazy, return a DataFrame)</th><th>Actions (run a job, return a result or write)</th></tr>
    <tr><td><code>select, filter, withColumn, join, groupBy().agg, orderBy, distinct, repartition</code></td><td><code>show, count, collect, take, first, toPandas, write</code></td></tr>
  </table>

  <h2 id="sp-shuffle"><span class="num">06</span>Narrow and Wide Transformations: The Shuffle</h2>
  <p>The plan for <code>g</code> in the last section had two very different kinds of step. Keeping only delivered orders can be done by each partition on its own: a partition just looks at its own rows. Totalling Pune's revenue cannot: Pune orders sit in every partition, and somehow all of them (or at least their partial totals) must end up in the same place. That means rows physically moving between machines, and it is by far the most expensive thing Spark does.</p>
  <p>Spark names the two kinds. A <strong>narrow transformation</strong> is one where each output partition is built from exactly one input partition, so no data moves: <code>filter</code>, <code>select</code> and <code>withColumn</code> are narrow. A <strong>wide transformation</strong> is one where an output partition needs rows from many input partitions: <code>groupBy</code>, <code>join</code>, <code>distinct</code> and <code>orderBy</code> are wide. A wide transformation causes a <strong>shuffle</strong>, the redistribution of rows across partitions by key. During a shuffle every task writes its rows to local disk, sorted into buckets by key (the bucket number is a hash of the key, a number computed from it, modulo the number of buckets), and each task of the next step then fetches its bucket from every machine over the network.</p>
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
  </svg><figcaption>Narrow: each output partition needs one input partition. Wide: rows with the same key must travel to the same output partition.</figcaption></figure>
  <p>In the left half of the picture, each blue input partition feeds exactly one green output partition with a single straight arrow: a filter on partition 0 produces filtered partition 0, on the same machine, with nothing sent anywhere. In the right half, every input partition sends arrows to several output partitions, because each one contains rows for several keys and each key has a single destination. Those crossing arrows are the shuffle: disk writes, network transfer and, on the receiving side, reading and merging.</p>
  <p>A post office sorting room makes this concrete. Stamping letters is narrow: each clerk stamps the pile on their own desk. Sorting letters by destination city is wide: every clerk has to walk every Pune letter over to the Pune bin. The walking is the shuffle, and which bin a city goes to is decided by a fixed rule, not by who happens to hold the letter.</p>
  <p>The shuffle also decides how Spark organises a job. A <strong>stage</strong> is a group of tasks that run narrow steps back to back on the same partitions without moving data; every shuffle ends one stage and starts the next, because the next step cannot begin until all the data has been redistributed. So one action becomes one or more <strong>jobs</strong>, each job is split into stages at the shuffles, and each stage runs one task per partition. We can see all of this through <code>explain()</code>, which prints the <strong>physical plan</strong>: the exact list of operations Spark will run. The script prints the plan for a narrow chain and for the same chain followed by a <code>groupBy</code>, then counts the tasks in each stage that actually ran:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS

sc = spark.sparkContext
orders = spark.read.parquet(ORDERS)

def tasks_per_stage(df):                   # run df, writing nowhere; list the tasks of each stage
    t = sc.statusTracker()
    before = set(t.getJobIdsForGroup())
    df.write.format("noop").mode("overwrite").save()
    new = sorted(set(t.getJobIdsForGroup()) - before)
    stages = sorted({s for j in new for s in t.getJobInfo(j).stageIds})
    return [t.getStageInfo(s).numCompletedTasks for s in stages if t.getStageInfo(s).numCompletedTasks]

narrow = (orders.filter(F.col("status") == "delivered")
                .select("order_id", "city", "amount")
                .withColumn("amount_usd", F.round(F.col("amount") * 0.012, 2)))
wide = narrow.groupBy("city").agg(F.sum("amount").alias("revenue"))

print("NARROW plan:"); narrow.explain()
print("WIDE plan:");   wide.explain()
print("tasks per stage: narrow =", tasks_per_stage(narrow), "| wide =", tasks_per_stage(wide))</div>
  <div class="fx" data-lang="text">NARROW plan:
== Physical Plan ==
*(1) Project [order_id, city, amount, round((amount * 0.012), 2) AS amount_usd]
+- *(1) Filter (isnotnull(status) AND (status = delivered))
   +- *(1) ColumnarToRow
      +- FileScan parquet [order_id,city,status,amount,order_date] Batched: true,
            DataFilters: [isnotnull(status), (status = delivered)],
            Format: Parquet,
            Location: InMemoryFileIndex(1 paths)[file:/…,
            PartitionFilters: [],
            PushedFilters: [IsNotNull(status), EqualTo(status,delivered)],
            ReadSchema: struct&lt;order_id:bigint,city:string,status:string,amount:double&gt;


WIDE plan:
== Physical Plan ==
AdaptiveSparkPlan isFinalPlan=false
+- HashAggregate(keys=[city], functions=[sum(amount)])
   +- Exchange hashpartitioning(city, 8), ENSURE_REQUIREMENTS
      +- HashAggregate(keys=[city], functions=[partial_sum(amount)])
         +- Project [city, amount]
            +- Filter (isnotnull(status) AND (status = delivered))
               +- FileScan parquet [city,status,amount,order_date] Batched: true,
                     DataFilters: [isnotnull(status), (status = delivered)],
                     Format: Parquet,
                     Location: InMemoryFileIndex(1 paths)[file:/…,
                     PartitionFilters: [],
                     PushedFilters: [IsNotNull(status), EqualTo(status,delivered)],
                     ReadSchema: struct&lt;city:string,status:string,amount:double&gt;


tasks per stage: narrow = [2] | wide = [2, 1]</div>
  <p>(Here and below, the internal column ids that Spark prints after each name, like <code>city#5</code>, have been removed, long scan lines are wrapped, and the file path is shortened; nothing else is changed.) A plan is a tree, read from the <em>bottom up</em>: the bottom line is where data enters, from the file scan, and each line above takes the output of the line below it.</p>
  <p>In the narrow plan, the <code>FileScan</code> reads the files, <code>ColumnarToRow</code> converts Parquet's column-by-column format into rows, <code>Filter</code> keeps delivered orders and <code>Project</code> (the plan's word for choosing and computing columns) builds the output columns. Every line carries <code>*(1)</code>, which means Spark fused these steps into a single piece of generated code that makes one pass over each partition. There is no <code>Exchange</code> anywhere, and the job ran as <strong>one stage of 2 tasks</strong>, one per partition.</p>
  <p>The wide plan has the same bottom, and then three new lines. First, <code>HashAggregate(... partial_sum(amount))</code>: each partition totals its own rows per city before anything moves, which is exactly the partial-result idea of section 02 done automatically. Then <code>Exchange hashpartitioning(city, 8)</code>: this is the shuffle, sending each city's partial totals to one of 8 buckets chosen by hashing the city name. Finally, the top <code>HashAggregate(... sum(amount))</code> adds up the partials that arrived in each bucket. The run shows <strong>two stages: 2 tasks, then 1 task</strong>. The second stage has 1 task rather than 8 because of <strong>Adaptive Query Execution (AQE)</strong>, a Spark feature that re-plans a query while it runs, using the real sizes of the shuffled data; it saw that 8 buckets holding two small rows were pointless and merged them into one. That is also why the plan begins with <code>AdaptiveSparkPlan isFinalPlan=false</code>: what we printed is the plan before AQE's adjustments.</p>
  <p>Two lines in both scans show laziness paying off. <code>PushedFilters: [IsNotNull(status), EqualTo(status,delivered)]</code> means the filter was handed to the Parquet reader itself, which can skip whole blocks of rows that cannot match while reading. And <code>ReadSchema</code> lists only the columns the query uses; the other columns are never read from disk, which is called <strong>column pruning</strong>.</p>
  <p>The plan tells us a shuffle happens; to see rows actually move, we put the 10 orders into 3 partitions with the cities mixed together, then shuffle them by city:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS

orders = spark.read.parquet(ORDERS).select("order_id", "city")

def where(df, label):                      # print the rows of each partition as id:city
    rows = (df.withColumn("p", F.spark_partition_id()).groupBy("p")
              .agg(F.sort_array(F.collect_list(F.concat_ws(":", "order_id", "city"))).alias("rows"))
              .orderBy("p").collect())
    for r in rows:
        print(label, "partition", r.p, r.rows)

mixed = orders.repartition(3)              # 3 partitions, cities mixed together
where(mixed, "before")
where(mixed.repartition(2, "city"), "after ")   # shuffle: hash(city) decides the partition</div>
  <div class="fx" data-lang="text">before partition 0 ['102:Mumbai', '104:Pune', '106:Mumbai', '107:Pune']
before partition 1 ['103:Pune', '108:Pune', '110:Pune']
before partition 2 ['101:Pune', '105:Mumbai', '109:Mumbai']
after  partition 0 ['101:Pune', '103:Pune', '104:Pune', '107:Pune', '108:Pune', '110:Pune']
after  partition 1 ['102:Mumbai', '105:Mumbai', '106:Mumbai', '109:Mumbai']</div>
  <p>Before the shuffle, every partition held a mix of Pune and Mumbai, so no single task could produce Pune's total. After <code>repartition(2, "city")</code>, all six Pune orders landed in partition 0 and all four Mumbai orders in partition 1, because the hash of "Pune" picked bucket 0 and the hash of "Mumbai" picked bucket 1. Step by step, a shuffle looks like this:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Where</th><th>What happens to Biteful's rows</th></tr>
    <tr><td>1. map side</td><td>each task, on its own machine</td><td>partition 0 computes hash(city) for 102, 104, 106, 107 and writes them into bucket files: Pune rows to bucket 0, Mumbai rows to bucket 1</td></tr>
    <tr><td>2. stage boundary</td><td>driver</td><td>waits until every map task has finished writing</td></tr>
    <tr><td>3. reduce side</td><td>each next-stage task</td><td>the task for bucket 0 fetches bucket 0's file from every map task over the network: all six Pune rows</td></tr>
    <tr><td>4. continue</td><td>same task</td><td>runs the next narrow steps (sum, count, ...) on rows that are now together</td></tr>
  </table>
  <p>Not every shuffle is obvious in your code. Besides <code>groupBy</code> and <code>join</code>, <code>distinct()</code>, <code>orderBy()</code>, <code>repartition()</code> and window functions with <code>partitionBy</code> all shuffle. When a job is slow, the first thing to do is count the <code>Exchange</code> lines in <code>explain()</code>; almost every Spark performance technique in the rest of this note is a way of shuffling fewer rows, more evenly, or fewer times.</p>

  <h2 id="sp-sql"><span class="num">07</span>Spark SQL and the Catalyst Optimizer</h2>
  <p>Half of Biteful's analysts write only SQL. Can they use Spark, and do they get a slower, second-class version of it? Neither worry is justified. <strong>Spark SQL</strong> is Spark's SQL engine: you give a DataFrame a table name with <code>createOrReplaceTempView</code>, which registers a temporary <strong>view</strong> (a name for the DataFrame's plan, visible only in this Spark session), and then query it with ordinary SQL through <code>spark.sql(...)</code>, which returns another lazy DataFrame. Both SQL text and DataFrame code are translated into the same internal plan and handed to the same optimizer. Here is Biteful's revenue report written both ways:</p>
  <div class="fx" data-lang="py">import re
from common import spark, F, ORDERS

orders = spark.read.parquet(ORDERS)
orders.createOrReplaceTempView("fact_orders")          # give the DataFrame a table name for SQL

by_sql = spark.sql("""
    SELECT city, SUM(amount) AS revenue, COUNT(*) AS orders
    FROM fact_orders
    WHERE status = 'delivered'
    GROUP BY city
    ORDER BY city""")
by_api = (orders.filter(F.col("status") == "delivered")
                .groupBy("city")
                .agg(F.sum("amount").alias("revenue"), F.count("*").alias("orders"))
                .orderBy("city"))
by_sql.show()
by_api.show()

def plan(df):                                           # physical plan text without the #ids
    text = df._jdf.queryExecution().executedPlan().toString()
    return re.sub(r"#\\d+L?|plan_id=\\d+", "", text)
print("same physical plan:", plan(by_sql) == plan(by_api))</div>
  <div class="fx" data-lang="text">+------+-------+------+
|  city|revenue|orders|
+------+-------+------+
|Mumbai| 1230.0|     3|
|  Pune| 1400.0|     4|
+------+-------+------+

+------+-------+------+
|  city|revenue|orders|
+------+-------+------+
|Mumbai| 1230.0|     3|
|  Pune| 1400.0|     4|
+------+-------+------+

same physical plan: True</div>
  <p>Both give Pune 4 delivered orders worth ₹1,400 and Mumbai 3 worth ₹1,230, and after removing the internal ids the two physical plans are identical, character for character. Like typing a destination into a maps app in Hindi or in English, the language you use to ask does not change the route. So the choice between SQL and the DataFrame API is about readability and team habits, not speed. Many teams write their transformations in SQL, often through dbt (see the ELT section of <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a>), and use the DataFrame API where Python logic, loops or reusable functions make the code clearer.</p>
  <p>The component that both paths feed into is the <strong>Catalyst optimizer</strong>, Spark's query optimizer: a program that rewrites your plan into a cheaper plan that gives the same answer. It works in steps. Your code first becomes a <em>logical plan</em> that says what result you want; Catalyst checks the column names against the schemas (the "analyzed" plan), then applies rewriting rules to produce an "optimized" logical plan, then chooses concrete algorithms (which join method, which aggregation) to produce the physical plan we saw with <code>explain()</code>. The best way to understand what the rules do is to write a query badly on purpose. Below, the raw orders carry only a <code>restaurant_id</code>, and we join every order to every column of the restaurants table first, and only then filter for Pune and pick three columns:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS, RESTAURANTS

orders = spark.read.parquet(ORDERS).drop("restaurant", "city", "cuisine")   # raw orders: only restaurant_id
rest = spark.read.parquet(RESTAURANTS)

# written "badly": join everything first, filter and pick columns at the end
q = (orders.join(rest, "restaurant_id")
           .filter((F.col("city") == "Pune") &amp; (F.col("status") == "delivered"))
           .select("order_id", "restaurant", "amount"))

qe = q._jdf.queryExecution()
print("== What we wrote (analyzed logical plan) ==")
print(qe.analyzed().toString())
print("== What Catalyst made of it (optimized logical plan) ==")
print(qe.optimizedPlan().toString())
q.orderBy("order_id").show()</div>
  <div class="fx" data-lang="text">== What we wrote (analyzed logical plan) ==
Project [order_id, restaurant, amount]
+- Filter ((city = Pune) AND (status = delivered))
   +- Project [restaurant_id, order_id, ordered_at_utc, customer_id, status, amount, delivery_minutes, order_date, restaurant, city, cuisine]
      +- Join Inner, (restaurant_id = restaurant_id)
         :- Project [order_id, ordered_at_utc, customer_id, restaurant_id, status, amount, delivery_minutes, order_date]
         :  +- Relation [order_id,ordered_at_utc,customer_id,restaurant_id,restaurant,city,cuisine,status,amount,delivery_minutes,order_date] parquet
         +- Relation [restaurant_id,restaurant,city,cuisine] parquet

== What Catalyst made of it (optimized logical plan) ==
Project [order_id, restaurant, amount]
+- Join Inner, (restaurant_id = restaurant_id)
   :- Project [order_id, restaurant_id, amount]
   :  +- Filter ((isnotnull(status) AND (status = delivered)) AND isnotnull(restaurant_id))
   :     +- Relation [order_id,ordered_at_utc,customer_id,restaurant_id,restaurant,city,cuisine,status,amount,delivery_minutes,order_date] parquet
   +- Project [restaurant_id, restaurant]
      +- Filter ((isnotnull(city) AND (city = Pune)) AND isnotnull(restaurant_id))
         +- Relation [restaurant_id,restaurant,city,cuisine] parquet

+--------+-----------+------+
|order_id| restaurant|amount|
+--------+-----------+------+
|     101|   Dosa Hut| 240.0|
|     103|Pizza Point| 520.0|
|     104|Pizza Point| 380.0|
|     108|   Dosa Hut| 260.0|
+--------+-----------+------+</div>
  <p>Compare the two plans, reading each from the bottom up. The analyzed plan is exactly what we wrote: read both tables with all their columns, join them, then filter on <code>city = Pune</code> and <code>status = delivered</code>, then keep three columns. The optimized plan is very different. The filter has been split in two and pushed <em>below</em> the join: <code>status = delivered</code> now runs on the orders before joining, and <code>city = Pune</code> runs on the restaurants table before joining. Catalyst also added <code>isnotnull(restaurant_id)</code> on both sides, because rows with a null key can never match an inner join, and inserted <code>Project</code> steps so that only <code>order_id, restaurant_id, amount</code> and <code>restaurant_id, restaurant</code> enter the join. Fewer rows and fewer columns go into the join, so less data has to be compared and, on a cluster, shuffled. The answer is unchanged: orders 101, 103, 104 and 108, the four delivered Pune orders.</p>
  <p>These rewrites are called <strong>predicate pushdown</strong> (moving filters as early as possible, ideally into the file reader) and <strong>column pruning</strong> (dropping unused columns as early as possible). Catalyst applies dozens of other rules too, such as folding constant expressions and simplifying conditions, and at run time AQE continues the work with real data sizes, as we saw in the last section. All of this is only possible because of lazy evaluation: an engine that ran each line immediately would already have joined everything by the time it learned that we only wanted Pune. One thing to keep in mind: a temporary view is a name for a plan, not a stored copy, so querying it twice computes it twice, and it disappears when the Spark session ends. Tables that other jobs need should be written out as Parquet or Delta tables.</p>

  <h2 id="sp-join"><span class="num">08</span>Joins: Broadcast and Sort-Merge</h2>
  <p>A join needs rows with matching keys in the same place, so it is a wide operation. The obvious way to do it on a cluster is to shuffle <em>both</em> tables by the join key, so that every order for restaurant 11 and the row for restaurant 11 end up in the same partition. That is fine when both tables are big, but Biteful's real enrich step joins millions of orders to a restaurants table with 5 rows. Shuffling millions of orders just to meet 5 rows is absurd. To see the difference properly we now switch to Biteful at scale: 2,000,000 raw orders for 2 to 8 March, during a Biryani Bros mega sale in which 90% of orders go to restaurant 11.</p>
  <div class="fx" data-lang="py">from common import spark, F

# Biteful at scale: 2 million raw orders for 2-8 March, during a Biryani Bros mega sale
big = (spark.range(2_000_000).withColumnRenamed("id", "order_id")
       .withColumn("restaurant_id", F.when(F.col("order_id") % 10 &lt; 9, 11)        # 90% Biryani Bros
                                     .otherwise(10 + (F.col("order_id") / 10).cast("long") % 5))
       .withColumn("amount", (F.col("order_id") % 800 + 100).cast("double"))
       .withColumn("status", F.when(F.col("order_id") % 20 == 0, "cancelled").otherwise("delivered"))
       .withColumn("order_date", F.date_add(F.lit("2026-03-02").cast("date"), (F.col("order_id") % 7).cast("int"))))
big.write.mode("overwrite").parquet("data/big_orders")

counts = spark.read.parquet("data/big_orders").groupBy("restaurant_id").count().orderBy("restaurant_id")
print({r.restaurant_id: r["count"] for r in counts.collect()})</div>
  <div class="fx" data-lang="text">{10: 40000, 11: 1840000, 12: 40000, 13: 40000, 14: 40000}</div>
  <p>Restaurant 11 has 1,840,000 orders and each of the other four has 40,000 (the extra 40,000 at Biryani Bros come from the formula's remaining 10%). Keep that lopsided count in mind; it will matter in the next section.</p>
  <p>Spark has three main ways to perform a join, the same family as the database join algorithms in <a class="xref" data-note="sql_joins">JOINs</a>, now spread across machines. In a <strong>broadcast hash join</strong>, Spark copies the whole small table to every executor, where it is held as a hash table (a lookup structure keyed by the join key); then each task joins its own partition of the big table locally, and the big table never moves. It is like photocopying a one-page price list and giving a copy to every billing counter, instead of making every customer queue at the one desk that holds the list; it only works because the list is small enough to copy. In a <strong>sort-merge join</strong>, Spark shuffles both tables by the key, sorts each partition, and walks through the two sorted sides together like merging two sorted lists; it is the default for joining two big tables and costs two shuffles plus sorting. A <strong>shuffle hash join</strong> also shuffles both sides but builds a hash table from the smaller side in each partition instead of sorting; Spark uses it in some medium-sized cases.</p>
  <p>Spark picks a broadcast join by itself when it knows one side is smaller than <code>spark.sql.autoBroadcastJoinThreshold</code>, which is 10 MB by default. The script runs the "enrich with city, then total per city" step on the 2 million orders twice, once as Spark chooses and once with automatic broadcasting switched off, printing only the join and exchange lines of each plan and the best of three timings. At the end it shows the explicit way to ask for a broadcast, the <code>F.broadcast()</code> hint:</p>
  <div class="fx" data-lang="py">import time
from common import spark, F, RESTAURANTS

big = spark.read.parquet("data/big_orders")                     # 2,000,000 orders
rest = spark.read.parquet(RESTAURANTS)                          # 5 restaurants

def revenue_by_city():                                          # enrich with city, then total per city
    return (big.filter(F.col("status") == "delivered")
               .join(rest, "restaurant_id")
               .groupBy("city").agg(F.sum("amount").cast("long").alias("revenue")))

def show_join(label):
    q = revenue_by_city()
    plan = q._jdf.queryExecution().executedPlan().toString().splitlines()
    print(f"--- {label} ---")
    print("\\n".join(l.strip() for l in plan if "Join" in l or "Exchange" in l))
    best = 1e9
    for _ in range(3):                                          # best of 3 runs
        t = time.time(); q.write.format("noop").mode("overwrite").save(); best = min(best, time.time() - t)
    print(f"best of 3: {best:.2f}s")
    return q

show_join("default: Spark sees the restaurants file is tiny")
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")   # forbid automatic broadcasting
q = show_join("broadcast switched off")
q.orderBy("city").show()

# a hint overrides the threshold: F.broadcast() marks the small side explicitly
hinted = big.join(F.broadcast(rest), "restaurant_id")
print([l.strip() for l in hinted._jdf.queryExecution().executedPlan().toString().splitlines() if "Join" in l])</div>
  <div class="fx" data-lang="text">--- default: Spark sees the restaurants file is tiny ---
+- Exchange hashpartitioning(city, 8), ENSURE_REQUIREMENTS
+- BroadcastHashJoin [restaurant_id], [restaurant_id], Inner, BuildRight, false, false
+- BroadcastExchange HashedRelationBroadcastMode(List(input[0, bigint, false]),false)
best of 3: 0.45s
--- broadcast switched off ---
+- Exchange hashpartitioning(city, 8), ENSURE_REQUIREMENTS
+- SortMergeJoin [restaurant_id], [restaurant_id], Inner
:  +- Exchange hashpartitioning(restaurant_id, 8), ENSURE_REQUIREMENTS
+- Exchange hashpartitioning(restaurant_id, 8), ENSURE_REQUIREMENTS
best of 3: 0.84s
+------+---------+
|  city|  revenue|
+------+---------+
|Mumbai|889520000|
|  Pune| 60480000|
+------+---------+

['+- BroadcastHashJoin [restaurant_id], [restaurant_id], Inner, BuildRight, false, false']</div>
  <p>With the default settings the plan has a <code>BroadcastHashJoin</code> with <code>BuildRight</code> (the right side, the restaurants, is the one turned into a hash table), fed by a <code>BroadcastExchange</code>: that is the 5-row table being copied to the executors. The only shuffle is the <code>Exchange hashpartitioning(city, 8)</code> for the final groupBy, and that moves only partial sums per city. The 2 million orders never crossed the network. With broadcasting switched off, Spark falls back to a <code>SortMergeJoin</code>, and two extra <code>Exchange hashpartitioning(restaurant_id, 8)</code> lines appear, one for each side: every one of the 2 million orders was shuffled. On this single small machine that cost about 0.84 s against about 0.45 s for the broadcast version (timings are approximate and vary from run to run); on a real cluster with terabytes of orders, the difference is often minutes against hours. Both versions give the same answer, Mumbai ₹889,520,000 and Pune ₹60,480,000, with Mumbai far ahead because Biryani Bros is a Mumbai restaurant. The last line shows that wrapping the small side in <code>F.broadcast()</code> brings the <code>BroadcastHashJoin</code> back even though the automatic threshold is still switched off; use the hint when Spark cannot know a table is small, for example because it is the result of a filter.</p>
  <p>Broadcasting has a limit. The broadcast table is collected through the driver and then held in full in every executor's memory, so a "small" side of several gigabytes can crash executors or the driver. Broadcast joins are ideal for dimension tables such as restaurants, cities or products joined to large fact tables; for two genuinely large tables, a sort-merge join with its two shuffles is the correct choice, and the work then goes into making those shuffles cheap and even.</p>

  <h2 id="sp-skew"><span class="num">09</span>Data Skew and Salting</h2>
  <p>A shuffle sends all rows with the same key to the same partition. That is the whole point, but it has an awkward consequence when the keys are lopsided. Biryani Bros has 1,840,000 of the 2,000,000 orders, so in a sort-merge join on <code>restaurant_id</code>, or a groupBy by restaurant, one task receives 92% of all the rows while the other tasks finish quickly and sit idle. A stage only finishes when its slowest task finishes, so the whole job runs at the speed of that one overloaded task. An uneven distribution of rows across keys that makes some tasks far bigger than others is called <strong>data skew</strong>.</p>
  <p>Picture a supermarket with eight checkouts where ninety customers queue at one till and the other seven are empty; the shop closes only when the last customer in the long queue has paid. The fix is obvious in the supermarket: hand the long queue numbered tokens and send each customer to "the till on your token". In Spark that trick is called <strong>salting</strong>. You add a small extra number, the <em>salt</em> (for example 0 to 7), to every row of the big table, so that the hot key's rows split into eight sub-keys that hash to different partitions. Because the other table must still match, you copy each of its rows once per salt value, and then join on the pair (key, salt). The script below first finds the hot key, then measures how many rows land in each of 8 partitions when hashing by <code>restaurant_id</code> alone and by (<code>restaurant_id</code>, salt), and finally runs the salted join:</p>
  <div class="fx" data-lang="py">from common import spark, F, RESTAURANTS

big = spark.read.parquet("data/big_orders")
rest = spark.read.parquet(RESTAURANTS)

def rows_per_partition(df, *keys):           # hash rows into 8 partitions by keys: how big is each?
    sizes = dict(df.repartition(8, *keys).groupBy(F.spark_partition_id().alias("p")).count().collect())
    return [sizes.get(p, 0) for p in range(8)]

hot = big.groupBy("restaurant_id").count().orderBy(F.desc("count"))   # step 1: find the hot key
hot.show()
print("by restaurant_id     :", rows_per_partition(big, "restaurant_id"))

SALTS = 8
salted = big.withColumn("salt", (F.col("order_id") % SALTS).cast("int"))     # spread each key 8 ways
print("by (restaurant, salt):", rows_per_partition(salted, "restaurant_id", "salt"))

# the salted join: copy each restaurant once per salt value, join on (restaurant_id, salt)
rest_salted = rest.withColumn("salt", F.explode(F.sequence(F.lit(0), F.lit(SALTS - 1))))
print("restaurants after copying:", rest_salted.count(), "rows")
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")
joined = (salted.filter(F.col("status") == "delivered")
                .join(rest_salted, ["restaurant_id", "salt"])
                .groupBy("city").agg(F.sum("amount").cast("long").alias("revenue")))
joined.orderBy("city").show()</div>
  <div class="fx" data-lang="text">+-------------+-------+
|restaurant_id|  count|
+-------------+-------+
|           11|1840000|
|           12|  40000|
|           14|  40000|
|           10|  40000|
|           13|  40000|
+-------------+-------+

by restaurant_id     : [40000, 1840000, 40000, 0, 0, 40000, 0, 40000]
by (restaurant, salt): [40000, 470000, 520000, 430000, 10000, 20000, 490000, 20000]
restaurants after copying: 40 rows
+------+---------+
|  city|  revenue|
+------+---------+
|Mumbai|889520000|
|  Pune| 60480000|
+------+---------+</div>
  <p>The first table is always the right first step: a simple <code>groupBy(key).count()</code> sorted by count shows restaurant 11 holding 1,840,000 rows. Hashing by <code>restaurant_id</code> alone puts all of them into one partition, while three of the eight partitions are empty and the rest hold 40,000 each. After salting, restaurant 11 has become eight sub-keys, and the biggest partition holds 520,000 rows instead of 1,840,000. It is still not perfectly even, because hashing 8 sub-keys into 8 partitions causes some collisions; real jobs use more partitions and more salt values. The restaurants table grew from 5 rows to 40 (one copy per salt), and the salted join returns exactly the same revenue as before. Salting changes where the work happens, never the answer.</p>
  <table class="tbl">
    <tr><th>Rows per partition (8 partitions)</th><th>hash on restaurant_id</th><th>hash on (restaurant_id, salt)</th></tr>
    <tr><td>biggest partition</td><td><strong>1,840,000</strong> (92%)</td><td>520,000 (26%)</td></tr>
    <tr><td>empty partitions</td><td>3 of 8</td><td>0 of 8</td></tr>
  </table>
  <p>Salting is a manual technique, and it costs something: the other side is copied once per salt value, and the code becomes harder to read. So try the simpler fixes first. If the other side is small, a broadcast join avoids shuffling by key at all, so skew cannot hurt it. In Spark 3 and later, AQE has a <strong>skew join</strong> feature (<code>spark.sql.adaptive.skewJoin.enabled</code>, on by default) that notices, during a sort-merge join, a partition much larger than the median and splits it into smaller pieces automatically. Salting is for the cases those do not cover, such as a skewed groupBy or a skewed join between two large tables. Finally, the hot key is very often not a famous restaurant at all but <code>NULL</code> or a placeholder like <code>"unknown"</code> or <code>0</code>, produced by missing data upstream; those rows are usually best filtered out or handled separately before the join.</p>

  <h2 id="sp-part"><span class="num">10</span>Partitioning and File Layout</h2>
  <p>So far every job has read every file and kept whatever partitions it was given. But how data is split, both in memory and on disk, decides how much each job has to read, how many cores can work at once, and how many files the next job has to open. Getting it wrong never produces an error; it just makes jobs many times slower. There are three knobs to understand.</p>
  <p>The first knob is the number of partitions in memory. <code>repartition(n)</code> performs a full shuffle and deals the rows out into <code>n</code> partitions of even size; it can raise or lower the count, and <code>repartition(n, "col")</code> also groups rows by a column. <code>coalesce(n)</code> can only <em>lower</em> the count, and it does so without a shuffle, by gluing neighbouring partitions together on the machines where they already are; that makes it cheap, but the resulting partitions can be uneven. The second knob is the number of output files: when Spark writes, each task writes its own file, so the number of partitions at write time is the number of files you get. The third knob is folders: <code>write.partitionBy("order_date")</code> writes one folder per distinct value, exactly the <code>order_date=...</code> layout of the ETL warehouse, so that a query for one day can open a single folder. Skipping the folders a query does not need is called <strong>partition pruning</strong>.</p>
  <p>A school office that files attendance in one drawer per month works the same way. "Who was absent in March?" means opening one drawer. Splitting each drawer into two hundred thin folders makes every search slower, while one giant folder makes it impossible to share the work between several clerks.</p>
  <div class="fx" data-lang="py">import os
from common import spark, F

big = spark.read.parquet("data/big_orders")
print("partitions in memory:", big.rdd.getNumPartitions())
print("repartition(16):", big.repartition(16).rdd.getNumPartitions(),
      "| coalesce(1):", big.coalesce(1).rdd.getNumPartitions())

def files(path):                                  # count the data files Spark wrote
    return sum(f.endswith(".parquet") for _, _, fs in os.walk(path) for f in fs)

big.repartition(200).write.mode("overwrite").parquet("out/many")
big.coalesce(1).write.mode("overwrite").parquet("out/one")
print("files: repartition(200) -&gt;", files("out/many"), "| coalesce(1) -&gt;", files("out/one"))

# a layout for queries: one folder per day
big.write.mode("overwrite").partitionBy("order_date").parquet("out/by_day")
days = sorted(d for d in os.listdir("out/by_day") if d.startswith("order_date"))
print(days[0], "...", days[-1], "|", len(days), "folders,", files("out/by_day"), "files")

one_day = spark.read.parquet("out/by_day").filter(F.col("order_date") == "2026-03-02")
one_day.explain()
print("orders on 2 March:", one_day.count())</div>
  <div class="fx" data-lang="text">partitions in memory: 2
repartition(16): 16 | coalesce(1): 1
files: repartition(200) -&gt; 200 | coalesce(1) -&gt; 1
order_date=2026-03-02 ... order_date=2026-03-08 | 7 folders, 14 files
== Physical Plan ==
*(1) ColumnarToRow
+- FileScan parquet [order_id,restaurant_id,amount,status,order_date] Batched: true,
      DataFilters: [],
      Format: Parquet,
      Location: InMemoryFileIndex(1 paths)[file:/…,
      PartitionFilters: [isnotnull(order_date), (order_date = 2026-03-02)],
      PushedFilters: [],
      ReadSchema: struct&lt;order_id:bigint,restaurant_id:bigint,amount:double,status:string&gt;


orders on 2 March: 285715</div>
  <p>The 2 million orders were read as 2 partitions (one per core). <code>repartition(16)</code> and <code>coalesce(1)</code> changed that count as asked, and writing the same data after <code>repartition(200)</code> produced 200 files while <code>coalesce(1)</code> produced a single file: the file count followed the partition count exactly. With <code>partitionBy("order_date")</code>, Spark wrote 7 day-folders containing 14 files, because each of the 2 tasks wrote one file into every day it had rows for (7 days × 2 tasks).</p>
  <p>The plan for the one-day read is the important part. The filter on <code>order_date</code> appears as <code>PartitionFilters: [isnotnull(order_date), (order_date = 2026-03-02)]</code>, which means it was applied to the <em>folder names</em> before any file was opened: Spark listed the folders, kept only <code>order_date=2026-03-02</code> and never touched the other six days. The count, 285,715 orders, is 2,000,000 / 7 rounded up, because order ids 0, 7, 14 and so on fall on 2 March. Compare this with the <code>PushedFilters</code> we saw for <code>status</code> in section 06: those are applied inside each Parquet file, where min and max statistics stored for each block of rows let the reader skip blocks that cannot match (for example, a filter <code>amount &gt; 900</code> skips any block whose maximum is 899). Partition filters skip whole folders; pushed filters skip blocks inside the files that remain.</p>
  <table class="tbl">
    <tr><th></th><th><code>repartition(n)</code></th><th><code>coalesce(n)</code></th></tr>
    <tr><td>Direction</td><td>up or down</td><td>down only</td></tr>
    <tr><td>Shuffle?</td><td>yes, full shuffle; even sizes</td><td>no; merges neighbours, can be uneven</td></tr>
    <tr><td>Use for</td><td>more parallelism; grouping by a key before a write or join</td><td>fewer output files at the end of a job</td></tr>
  </table>
  <p>Some rules of thumb follow from all this. In-memory partitions work best at roughly 100–200 MB each, with at least two to three times as many partitions as there are cores, so that no core sits idle and one slow task does not hold up the stage. Output files should be fairly large, roughly 128 MB to 1 GB, because every file costs a listing call and an open, and thousands of tiny files (the <strong>small files problem</strong>) can make reading slower than the actual processing. Partition folders belong on a low-cardinality column (one with few distinct values) that queries actually filter on, such as a date or a country. Partitioning by <code>customer_id</code> on a table with ten million customers creates ten million folders of tiny files, and merely listing them takes longer than the query. Finally, <code>coalesce(1)</code> "to get one nice file" forces the last stage of a big job onto a single task, which becomes the bottleneck or runs out of memory; it is only reasonable for small outputs.</p>

  <h2 id="sp-cache"><span class="num">11</span>Caching and Persistence</h2>
  <p>Section 05 showed that Spark keeps the recipe, not the result: every action recomputes the DataFrame from the source files. That is fine for a job with one action, but a common pattern is to build one expensive table and then use it several times. Biteful's daily gold table, delivered revenue and order count per day per restaurant, is built from the 2 million orders with a filter, a join and a groupBy, and then several reports each run an action on it. Without help, each report repeats the whole computation.</p>
  <p><code>cache()</code> is the help. It tells Spark: "the next time you compute this DataFrame, keep its partitions in the executors' memory, and use them for later actions instead of recomputing". It is itself lazy: calling it only marks the DataFrame, and nothing is stored until an action computes it. Grinding masala is a good comparison. Grinding fresh spices every day (no cache) costs time every day. Grinding a week's worth once and keeping a jar in the fridge (cache) costs a little more on the first day, and every day after that is quick. If you only cook once, the jar just takes up fridge space.</p>
  <div class="fx" data-lang="py">import time
from common import spark, F, RESTAURANTS

big = spark.read.parquet("data/big_orders")
rest = spark.read.parquet(RESTAURANTS)
daily = (big.filter(F.col("status") == "delivered")             # a gold table that
            .join(rest, "restaurant_id")                        # several reports reuse
            .groupBy("order_date", "restaurant", "city")
            .agg(F.sum("amount").alias("revenue"), F.count("*").alias("orders")))

def report(label):
    t = time.time(); n = daily.count(); print(f"{label:24} {time.time() - t:5.2f}s  ({n} rows)")

report("report 1 (no cache)")
report("report 2 (no cache)")
daily.cache()                                                   # lazy: only marks it
print("is_cached:", daily.is_cached, "| level:", daily.storageLevel)
report("report 3 (fills cache)")
report("report 4 (from cache)")
report("report 5 (from cache)")
daily.unpersist()</div>
  <div class="fx" data-lang="text">report 1 (no cache)       2.50s  (35 rows)
report 2 (no cache)       0.66s  (35 rows)
is_cached: True | level: Disk Memory Deserialized 1x Replicated
report 3 (fills cache)    1.09s  (35 rows)
report 4 (from cache)     0.16s  (35 rows)
report 5 (from cache)     0.14s  (35 rows)</div>
  <p>Report 1 was the slowest because it also paid for warming up the JVM. Report 2 recomputed everything from the files (0.66 s). Calling <code>cache()</code> returned immediately; <code>is_cached</code> says True, but that only means "marked", and nothing was stored yet. Report 3 computed the table <em>and</em> stored it, so it was no faster than report 2, and slightly slower because of the extra work of storing. Reports 4 and 5 read the 35 cached rows from memory in about 0.15 s, several times faster than report 2 (timings are approximate). The storage level printed, "Disk Memory Deserialized 1x Replicated", is the default for DataFrames: keep partitions in memory, spill to disk if they do not fit, store them as ready-to-use objects, and keep one copy. <code>unpersist()</code> at the end releases that memory.</p>
  <p><code>cache()</code> is simply <code>persist()</code> with that default level; <code>persist(StorageLevel.DISK_ONLY)</code> or <code>MEMORY_ONLY</code> choose otherwise, for example disk-only for a very large result you would rather not keep in memory. Cached partitions live in the executors, and if an executor is lost, Spark recomputes its cached partitions from the lineage, so caching never risks wrong answers. It does have costs. Caching a DataFrame that is used only once makes the job slower, as report 3 showed. Caching something bigger than the available memory spills to disk and can push out other cached data. And a long job that caches several tables without ever calling <code>unpersist()</code> slowly fills its executors. Cache when a result is reused two or more times and is noticeably expensive to recompute; otherwise leave it alone.</p>

  <h2 id="sp-udf"><span class="num">12</span>Built-in Functions vs Python UDFs</h2>
  <p>People coming from pandas often reach for a familiar tool: write a small Python function and apply it to every row. In Spark that is called a <strong>UDF</strong>, a user-defined function, and it is one of the most common reasons a Spark job is slow. To see why, remember where the work happens. Spark's engine runs inside the JVM on the executors, not in Python. A plain Python UDF forces every row to be converted out of the JVM's format, sent to a separate Python worker process (the worker pids we saw in section 03), passed through your function, and sent back. A <strong>pandas UDF</strong> (<code>@F.pandas_udf</code>) improves on this by sending whole batches of rows as pandas Series using Apache Arrow, a column-oriented memory format that both the JVM and Python can read without row-by-row conversion; in Spark 4 even plain UDFs can use Arrow (<code>spark.sql.execution.pythonUDF.arrow.enabled</code>). A <strong>built-in function</strong>, such as <code>F.col("amount") * 0.012</code>, <code>F.when</code>, <code>F.upper</code> or <code>F.to_date</code>, never leaves the JVM at all, is compiled into the fused code we saw marked <code>*(1)</code> in plans, and is fully visible to the optimizer.</p>
  <p>A Python UDF is like sending every letter to a translator in another building and waiting for it to come back. A pandas UDF sends the translator a full sack at a time. A built-in function is a clerk at your own desk who already speaks the language. The benchmark converts 2 million order amounts from rupees to dollars four ways, taking the best of three runs each, and then asks what the Parquet reader receives when the "delivered" filter is written as a UDF:</p>
  <div class="fx" data-lang="py">import time
import pandas as pd
from pyspark.sql.types import DoubleType, BooleanType
from common import spark, F

# the same 2,000,000 amounts as data/big_orders (order_id % 800 + 100), generated in memory
big = spark.range(2_000_000).withColumn("amount", (F.col("id") % 800 + 100).cast("double"))

to_usd = F.udf(lambda x: x * 0.012, DoubleType())             # Python UDF: one row at a time

@F.pandas_udf(DoubleType())                                    # pandas UDF: a whole batch at a time
def to_usd_vec(x: pd.Series) -&gt; pd.Series:
    return x * 0.012

def timed(label, expr):
    best = 1e9
    for _ in range(3):                                         # best of 3 runs
        t = time.time()
        total = big.select(F.sum(expr)).collect()[0][0]
        best = min(best, time.time() - t)
    print(f"{label:11} {best:5.2f}s  total=USD {total:,.0f}")

big.select(F.sum(to_usd("amount"))).collect()                  # warm-up: start the Python workers
spark.conf.set("spark.sql.execution.pythonUDF.arrow.enabled", "false")
timed("python udf", to_usd("amount"))
spark.conf.set("spark.sql.execution.pythonUDF.arrow.enabled", "true")
timed("arrow udf", to_usd("amount"))
timed("pandas_udf", to_usd_vec("amount"))
timed("built-in", F.col("amount") * 0.012)

# the optimizer cannot see inside a UDF: compare what reaches the Parquet reader
is_delivered = F.udf(lambda s: s == "delivered", BooleanType())
for label, cond in [("built-in", F.col("status") == "delivered"), ("udf", is_delivered("status"))]:
    plan = spark.read.parquet("data/big_orders").filter(cond)._jdf.queryExecution().executedPlan().toString()
    print(f"{label:9} PushedFilters:", plan.split("PushedFilters: ")[1].split("]")[0] + "]")</div>
  <div class="fx" data-lang="text">python udf   0.40s  total=USD 11,988,000
arrow udf    0.41s  total=USD 11,988,000
pandas_udf   0.32s  total=USD 11,988,000
built-in     0.11s  total=USD 11,988,000
built-in  PushedFilters: [IsNotNull(status), EqualTo(status,delivered)]
udf       PushedFilters: []</div>
  <p>All four versions produce the same total, USD 11,988,000. The built-in expression took about 0.11 s, several times faster than any Python version (0.40 s for the plain UDF, 0.32 s for the pandas UDF). The three Python variants are close to each other here because the function is trivial; when the per-row Python work is heavier, the batch-based versions pull further ahead. These are approximate timings on a small shared machine; the gap to built-ins is what stays constant.</p>
  <p>The last two lines matter even more than the timings. With the built-in condition, the filter reached the Parquet reader as <code>PushedFilters: [IsNotNull(status), EqualTo(status,delivered)]</code>, so the reader can skip blocks that cannot match. With the UDF, <code>PushedFilters: []</code> is empty: Catalyst cannot look inside a Python function, so it cannot push it down, and every row must be read and shipped to Python before the filter can run. The practical rule is to search <code>pyspark.sql.functions</code> before writing any UDF. String cleaning (<code>trim</code>, <code>initcap</code>, <code>regexp_replace</code>), date handling, <code>when</code>/<code>otherwise</code>, arrays, maps and JSON parsing are all built in, and most UDFs in real code bases re-implement one of them, slowly. When Python really is required, for example to call a library such as a tokenizer or a model, prefer a pandas UDF.</p>

  <h2 id="sp-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Two mistakes in DataFrame code fail in confusing ways, and both come from writing Python habits into Spark expressions. The first is comparing a column with <code>None</code> to find missing values. Spark follows SQL's rules for <code>NULL</code>: any comparison with NULL gives "unknown" rather than true, so <code>== None</code> matches nothing, silently. The second is combining conditions without brackets. Spark uses <code>&amp;</code> and <code>|</code> for "and" and "or" (Python's <code>and</code>/<code>or</code> cannot be overloaded), and in Python <code>&amp;</code> binds more tightly than <code>==</code> and <code>&gt;</code>, so without brackets the expression means something quite different from what you wrote:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS

orders = spark.read.parquet(ORDERS)

# mistake 1: comparing with None. In SQL, NULL = NULL is unknown, so no row matches
print("== None :", orders.filter(F.col("delivery_minutes") == None).count())
print("isNull():", orders.filter(F.col("delivery_minutes").isNull()).count())

# mistake 2: no brackets. Python applies &amp; before == and &gt;, so this is not
# "(status is delivered) and (amount &gt; 300)" at all
try:
    orders.filter(F.col("status") == "delivered" &amp; F.col("amount") &gt; 300).count()
except Exception as e:
    print(type(e).__name__ + ":", str(e).split(" (offending")[0])
ok = orders.filter((F.col("status") == "delivered") &amp; (F.col("amount") &gt; 300))
print("with brackets:", sorted(r.order_id for r in ok.collect()))</div>
  <div class="fx" data-lang="text">== None : 0
isNull(): 4
PySparkValueError: [CANNOT_CONVERT_COLUMN_INTO_BOOL] Cannot convert column into bool
with brackets: [102, 103, 104, 109]</div>
  <p>Biteful has four orders with no delivery time (104, 105, 107 and 110), yet <code>== None</code> found 0 of them, without any error or warning; <code>isNull()</code> found all 4. Without brackets, Python first computed <code>"delivered" &amp; F.col("amount")</code> and then treated the rest as a chained comparison, which needs to turn a Column into True or False, which Spark refuses with <code>CANNOT_CONVERT_COLUMN_INTO_BOOL</code>. With each condition wrapped in brackets, the filter returns the four delivered orders above ₹300: 102, 103, 104 and 109.</p>
  <p>The other common mistakes are about scale rather than syntax, and each was met earlier in the note. Calling <code>collect()</code> or <code>toPandas()</code> on a large DataFrame pulls everything into the driver and crashes it; aggregate first, use <code>take(n)</code> to look at a few rows, or <code>write</code> the result. Running several actions on an expensive DataFrame recomputes it each time; cache it if it is reused. Writing with far too many partitions creates thousands of tiny files, and <code>coalesce(1)</code> on a big output funnels everything through one task; aim for files of roughly 128 MB to 1 GB. Partitioning folders by a high-cardinality column such as <code>customer_id</code> creates millions of folders. Joining a big table to a small one without a broadcast shuffles the big table for nothing; check for <code>BroadcastHashJoin</code> in the plan. Letting column types drift between files makes Spark refuse to read them. And using Spark at all for data that fits comfortably on one machine adds seconds of overhead and a cluster's worth of complexity for no gain.</p>

  <h2 id="sp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core terms</h3>
  <ul>
    <li><b>Spark</b>: distributed engine that runs DataFrame/SQL code in parallel across a cluster; <b>PySpark</b> is its Python API.</li>
    <li><b>Scale up</b> = one bigger machine; <b>scale out</b> = many machines, each with a share of the data.</li>
    <li><b>Partition</b>: a chunk of rows. <b>Task</b>: one partition processed by one core.</li>
    <li><b>Driver</b>: runs your script, plans, schedules tasks. <b>Executor</b>: worker process that runs tasks and caches data. <b>Cluster manager</b>: YARN, Kubernetes or standalone; allocates executors.</li>
    <li><b>DataFrame</b>: immutable, distributed table with a schema. <b>RDD</b>: the older, untyped distributed collection underneath.</li>
    <li><b>Transformation</b>: lazy, adds a step to the plan. <b>Action</b>: runs the plan (show, count, collect, write).</li>
    <li><b>Lineage</b>: the recipe of transformations; re-run by every action, used to rebuild lost partitions.</li>
    <li><b>Narrow</b>: output partition from one input partition. <b>Wide</b>: needs many → <b>shuffle</b>.</li>
    <li><b>Job → stages → tasks</b>: an action becomes jobs; shuffles cut jobs into stages; each stage runs one task per partition.</li>
    <li><b>Catalyst</b>: optimizer (predicate pushdown, column pruning, join choice). <b>AQE</b>: re-plans at run time (merges small partitions, splits skewed ones).</li>
  </ul>
  <h3>Reading explain()</h3>
  <table class="tbl">
    <tr><th>In the plan</th><th>Meaning</th></tr>
    <tr><td>read bottom-up</td><td>scan at the bottom, result at the top</td></tr>
    <tr><td><code>Exchange hashpartitioning(key, n)</code></td><td>a shuffle into n partitions; a stage boundary</td></tr>
    <tr><td><code>partial_sum</code> … <code>sum</code></td><td>per-partition totals before the shuffle, final totals after</td></tr>
    <tr><td><code>*(1)</code></td><td>steps fused into one generated-code pass</td></tr>
    <tr><td><code>PushedFilters</code></td><td>filter handed to the Parquet reader (skips blocks)</td></tr>
    <tr><td><code>PartitionFilters</code></td><td>filter on folder names (skips whole folders)</td></tr>
    <tr><td><code>ReadSchema</code></td><td>columns actually read (column pruning)</td></tr>
    <tr><td><code>BroadcastHashJoin</code> / <code>SortMergeJoin</code></td><td>small side copied everywhere / both sides shuffled and sorted</td></tr>
  </table>
  <h3>Joins and skew</h3>
  <table class="tbl">
    <tr><th>Join</th><th>How</th><th>Shuffles</th><th>Use when</th></tr>
    <tr><td>Broadcast hash</td><td>copy small side to every executor</td><td>none for the big side</td><td>one side small (default threshold 10 MB; <code>F.broadcast()</code> to force)</td></tr>
    <tr><td>Sort-merge</td><td>shuffle both by key, sort, merge</td><td>two</td><td>big ⋈ big (default)</td></tr>
    <tr><td>Shuffle hash</td><td>shuffle both, hash the smaller per partition</td><td>two</td><td>one side medium-sized</td></tr>
  </table>
  <ul>
    <li><b>Skew</b>: one key holds most rows → one huge task. Find it with <code>groupBy(key).count()</code>.</li>
    <li>Fixes, in order: broadcast the other side; AQE skew join; <b>salting</b> (add salt 0..N−1 to the big side, copy the small side N times, join on key + salt); handle NULL keys separately.</li>
  </ul>
  <h3>Layout and caching</h3>
  <table class="tbl">
    <tr><th></th><th><code>repartition(n)</code></th><th><code>coalesce(n)</code></th></tr>
    <tr><td>count</td><td>up or down</td><td>down only</td></tr>
    <tr><td>shuffle</td><td>yes, even sizes</td><td>no, can be uneven</td></tr>
  </table>
  <ul>
    <li>Files written = partitions at write time. Aim for ~128 MB–1 GB files, ~100–200 MB partitions, partitions ≥ 2–3 × cores.</li>
    <li><code>partitionBy("order_date")</code>: one folder per value → partition pruning. Only on low-cardinality columns.</li>
    <li><code>cache()</code> = <code>persist()</code> with memory-and-disk; lazy; for results reused 2+ times; <code>unpersist()</code> after.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from pyspark.sql import SparkSession, functions as F
spark = SparkSession.builder.master("local[2]").appName("biteful").getOrCreate()

orders = spark.read.parquet("data/fact_orders")            # lazy read (schema only)
rest = spark.read.parquet("data/restaurants.parquet")

gold = (orders.filter(F.col("status") == "delivered")       # narrow
              .join(F.broadcast(rest), "restaurant_id")     # broadcast join
              .groupBy("city")                              # wide: shuffle
              .agg(F.sum("amount").alias("revenue")))
gold.explain()                                              # physical plan
gold.cache()                                                # reuse across actions
gold.show()                                                 # action

orders.createOrReplaceTempView("fact_orders")
spark.sql("SELECT city, SUM(amount) FROM fact_orders GROUP BY city")

orders.rdd.getNumPartitions()
orders.repartition(8, "city")      # full shuffle by key
orders.coalesce(1)                 # merge, no shuffle
gold.write.mode("overwrite").partitionBy("city").parquet("out/gold")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Every action recomputes from the source (10 → 20 rows seen) unless cached.</li>
    <li><code>collect()</code> / <code>toPandas()</code> on big data → driver out of memory.</li>
    <li>Hidden shuffles: <code>distinct</code>, <code>orderBy</code>, <code>repartition</code>, windows, non-broadcast joins.</li>
    <li>Python UDFs: slow and block filter pushdown (<code>PushedFilters: []</code>).</li>
    <li><code>col == None</code> matches nothing; use <code>isNull()</code>. Wrap every condition in brackets with <code>&amp;</code> / <code>|</code>.</li>
    <li>Schema drift between files → <code>Data type mismatches</code> on read.</li>
    <li>No row order without <code>orderBy</code>; no index.</li>
  </ul>

  <h2 id="sp-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is Apache Spark, and when would you choose it over pandas?</summary><div class="qa-body">Spark is a distributed data-processing engine that runs DataFrame and SQL code in parallel across a cluster of machines. Choose it when the data is too big for one machine's memory (roughly 100 GB and up) or when the platform already runs on Spark, such as Databricks. For data that fits on one machine, pandas, Polars or DuckDB are faster and simpler, because Spark spends seconds on JVM start-up, planning and scheduling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the driver, executors and cluster manager.</summary><div class="qa-body">The driver runs your program, builds and optimises the plan, splits it into tasks and schedules them. Executors are worker processes on the cluster's machines that run tasks and can cache data. The cluster manager (YARN, Kubernetes or standalone) allocates machines and starts executors; after that the driver talks to executors directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are partitions and tasks, and how do they relate to parallelism?</summary><div class="qa-body">A partition is a chunk of a dataset's rows; a task processes one partition on one core. The number of tasks that can run at once is limited by the total number of cores, and the useful parallelism is limited by the number of partitions. Too few partitions leave cores idle; far too many add scheduling overhead and tiny files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a transformation and an action? Why is Spark lazy?</summary><div class="qa-body">Transformations (<code>filter</code>, <code>join</code>, <code>groupBy</code>) return a new DataFrame and only add a step to the plan; actions (<code>count</code>, <code>show</code>, <code>write</code>) make Spark optimise and run the plan. Laziness lets the optimizer see the whole query before running it, so it can push filters down, drop unused columns and pick join strategies. It also gives fault tolerance, since lost partitions are rebuilt from the lineage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between narrow and wide transformations?</summary><div class="qa-body">In a narrow transformation each output partition depends on a single input partition, so no data moves (<code>filter</code>, <code>select</code>, <code>withColumn</code>). In a wide transformation an output partition needs rows from many input partitions, so Spark must shuffle (<code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>). Wide transformations end a stage and are where most of a job's cost usually is.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a shuffle, and why is it expensive?</summary><div class="qa-body">A shuffle redistributes rows across partitions so that rows with the same key end up together. Each map task writes its rows to local disk in buckets by hash of the key, and each reduce task fetches its bucket from every machine over the network. It costs serialisation, disk I/O and network transfer, and nothing in the next stage can start until all map tasks have finished.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are jobs, stages and tasks?</summary><div class="qa-body">An action triggers one or more jobs. Each job is split into stages at shuffle boundaries; within a stage, narrow steps run back to back without moving data. Each stage runs one task per partition. In <code>explain()</code>, every <code>Exchange</code> marks a stage boundary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Spark physical plan?</summary><div class="qa-body">Bottom-up: the file scan is at the bottom and the final result at the top. Look for <code>Exchange</code> (shuffles), the join type (<code>BroadcastHashJoin</code> or <code>SortMergeJoin</code>), <code>partial_sum</code> before an exchange (partial aggregation), and in the scan, <code>PushedFilters</code>, <code>PartitionFilters</code> and <code>ReadSchema</code> to check that filters and column pruning reached the files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Spark SQL slower or faster than the DataFrame API?</summary><div class="qa-body">Neither. SQL text and DataFrame code are translated into the same logical plan, optimised by the same Catalyst optimizer, and produce the same physical plan. The choice is about readability. What does make a real difference, in either syntax, is using Python UDFs instead of built-in functions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Catalyst optimizer do? Give examples.</summary><div class="qa-body">Catalyst rewrites the logical plan into a cheaper equivalent and then chooses physical operators. Examples: predicate pushdown (moving a filter below a join and into the Parquet reader), column pruning (reading only used columns), constant folding, adding null filters on join keys, and choosing a broadcast join when one side is small. AQE continues this at run time using actual data sizes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a broadcast join, and when should you use it?</summary><div class="qa-body">The small table is copied to every executor and held as a hash table, so each task joins its own partition of the big table locally and the big table is never shuffled. Use it when one side is small, typically a dimension table; Spark does it automatically under <code>spark.sql.autoBroadcastJoinThreshold</code> (10 MB by default) and you can force it with <code>F.broadcast(df)</code>. Do not broadcast tables of several gigabytes: they must fit in driver and executor memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a sort-merge join work?</summary><div class="qa-body">Both sides are shuffled by the join key so matching keys land in the same partition, each partition is sorted by the key, and then the two sorted streams are walked together like merging sorted lists. It handles two large tables without needing either to fit in memory, at the cost of two shuffles and sorting. It is Spark's default for big-to-big equi-joins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A stage has 199 tasks that finish in 2 minutes and one that takes 2 hours. What is happening, and how do you fix it?</summary><div class="qa-body">That is data skew: one key (often NULL, a placeholder, or a very popular entity) holds a large share of the rows, so the task for that key's partition does most of the work. Confirm with <code>groupBy(key).count()</code>. Fixes: broadcast the other side if it is small, rely on AQE skew join, salt the hot key (add a random 0..N−1 and replicate the other side N times), or filter and process NULL keys separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between repartition and coalesce?</summary><div class="qa-body"><code>repartition(n)</code> does a full shuffle, can increase or decrease the number of partitions, produces even sizes and can partition by a column. <code>coalesce(n)</code> only reduces the number of partitions by merging existing ones without a shuffle, so it is cheap but can be uneven. Use coalesce to reduce output files at the end of a job, and repartition to increase parallelism or co-locate keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is partition pruning, and what is the danger of partitionBy?</summary><div class="qa-body">Writing with <code>partitionBy("order_date")</code> creates one folder per date, so a query filtering on the date reads only the matching folders; the plan shows this as <code>PartitionFilters</code>. The danger is partitioning on a high-cardinality column such as a customer id, which creates huge numbers of folders and tiny files, so listing and opening files costs more than the query itself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you cache a DataFrame, and when does it hurt?</summary><div class="qa-body">Cache when a DataFrame is expensive to compute and used by two or more actions, such as a gold table feeding several reports. <code>cache()</code> is lazy, so the first action fills it and later actions read from memory. It hurts when the DataFrame is used only once (storing adds cost), when it is bigger than memory (spills and evicts other data), or when it is never unpersisted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are Python UDFs slow, and what should you use instead?</summary><div class="qa-body">Spark's engine runs in the JVM, so a Python UDF requires rows to be serialised to a Python worker and back, and the optimizer cannot see inside the function, which blocks filter pushdown and code generation. Use built-in functions from <code>pyspark.sql.functions</code> whenever possible; if Python is unavoidable, use a pandas UDF, which exchanges whole Arrow batches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Spark recover when an executor dies in the middle of a job?</summary><div class="qa-body">The driver notices that the executor's tasks did not complete and reschedules them on other executors. Because every DataFrame carries its lineage, lost partitions, including cached ones, can be recomputed from the source. If shuffle files written by the dead executor are lost, the stage that produced them is re-run for the missing parts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Adaptive Query Execution?</summary><div class="qa-body">AQE re-optimises a query while it runs, using statistics from completed shuffle stages. It merges many small shuffle partitions into fewer, switches a sort-merge join to a broadcast join when one side turns out to be small, and splits skewed partitions in joins. It is on by default since Spark 3.2 and reduces the need to hand-tune <code>spark.sql.shuffle.partitions</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a groupBy by city ship very little data even though it is a wide transformation?</summary><div class="qa-body">Because of partial aggregation: each partition first computes a <code>partial_sum</code> per city, so only one row per city per partition crosses the shuffle, and the final sum adds the partials. This works for sums, counts, min, max and averages. Exact medians and distinct counts cannot be combined from partials, so they move much more data (or use approximate algorithms).</div></details>
</main>
`
});
