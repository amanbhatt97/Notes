// notes/dataeng/de_spark.js — Apache Spark
Object.assign(TOPIC_CONTENT, {
  "de_spark": `<main>
  <h1>Apache Spark</h1>
  <div class="where"><span>Data Engineering</span><span>Apache Spark</span></div>
  <p class="lead">Spark runs pandas-style table code across many machines at once. You need it when a night's data no longer fits in one computer's memory. This note continues <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a> with the same running example: <strong>Biteful</strong>'s food orders. Spark reads the very Parquet warehouse that note built (10 orders, 2–8 March 2026), so every number can be checked by hand: delivered revenue Pune ₹1,400, Mumbai ₹1,230. When an idea only shows at scale, the same orders are scaled to 2 million rows ("Biteful at scale", with a Biryani Bros mega sale). Each idea is introduced because the previous one leaves a problem, starting from "pandas runs out of memory" and ending at reading a query plan and fixing a skewed join. Every output is from a real run of <strong>PySpark 4.2</strong> in local mode (<code>local[4]</code>: one machine, 4 cores, which behaves like a tiny cluster).</p>

  <h2 id="sp-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sp-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">pandas · SQL</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">one machine</text>
<line x1="130" y1="45" x2="158" y2="45" stroke="currentColor" marker-end="url(#sp-a0)"/>
<rect x="160" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="230" y="41" text-anchor="middle" font-size="12">ETL &amp; Orchestration</text><text x="230" y="58" text-anchor="middle" class="tm" font-size="10">nightly, in pandas</text>
<line x1="300" y1="45" x2="328" y2="45" stroke="currentColor" marker-end="url(#sp-a0)"/>
<rect x="330" y="20" width="140" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="400" y="41" text-anchor="middle" font-size="12" font-weight="700">Apache Spark</text><text x="400" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="470" y1="45" x2="498" y2="45" stroke="currentColor" marker-end="url(#sp-a0)"/>
<rect x="500" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="41" text-anchor="middle" font-size="12">Kafka &amp; Streaming</text><text x="575" y="58" text-anchor="middle" class="tm" font-size="10">same data, seconds old</text>
<line x1="400" y1="70" x2="400" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sp-a0)"/>
<rect x="315" y="110" width="170" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="400" y="130" text-anchor="middle" font-size="12">Indexes &amp; plans</text><text x="400" y="147" text-anchor="middle" class="tm" font-size="10">same join ideas, one DB</text>
<text x="20" y="130" class="tm" font-size="10.5">the ETL design stays the same;</text><text x="20" y="146" class="tm" font-size="10.5">only the transform step moves to many machines</text>
</svg><figcaption>Data Engineering, in reading order: ETL → Spark → Kafka, all on Biteful's orders.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: a nightly pipeline in pandas</b><span><a class="xref" data-note="de_etl">ETL &amp; Orchestration</a> built Biteful's pipeline: extract, transform with <a class="xref" data-note="da_pandas">pandas</a>, load Parquet day-folders, run nightly by Airflow. <a class="xref" data-note="da_pd_groupby">GroupBy</a> and <a class="xref" data-note="sql_joins">JOINs</a> supplied the "total per city" and "add the restaurant's city" steps; <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> showed how one database plans a join (hash, merge, nested loop).</span></li>
    <li><b>This note adds: the same work on many machines</b><span>Why one machine fails; splitting data and moving code to it; driver, executors, cluster manager; DataFrames and partitions; lazy transformations vs actions; narrow vs wide steps and the shuffle; Spark SQL; broadcast vs sort-merge joins and skew; partitioned file layout; caching; and the habits that make Spark slow.</span></li>
    <li><b>Leads to: <a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a></b><span>Spark makes a big batch fast, but it is still a batch: tonight's job answers for yesterday. When Biteful's app must react to an order the second it is placed, the data has to flow as events. Spark's Structured Streaming reappears there as one way to process them. At serving time, these tables feed <a class="xref" data-note="sd_serving">feature pipelines</a>.</span></li>
  </ol>

  <h2 id="sp-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Small numbers are Biteful's 10 orders; "at scale" numbers are the 2-million-order version.</p>
  <ol class="story">
    <li><b>When one machine is not enough</b><span>Q: why can't pandas just do it? → one Biteful order costs 88 bytes in pandas memory, so 50 GB is about 571 million orders, roughly 9 months for a big delivery company; pandas needs all of it in one machine's RAM, plus copies. We need many machines…</span></li>
    <li><b>The distributed idea</b><span>Q: how can many machines compute one answer? → split the rows, send the same small function to each piece, combine small partial results: machines A, B, C give partial city totals that add to Pune 1400, Mumbai 1230, shipping 113 bytes instead of 470. But who splits, sends and collects, and what if a machine dies?</span></li>
    <li><b>Driver, executors, cluster manager</b><span>Q: who does what? → the driver plans and hands out tasks; executors run one task per partition per core; the cluster manager hands out machines. Our 4 partitions ran in 4 separate worker processes. Now, what does the code we write look like?</span></li>
    <li><b>DataFrames &amp; partitions</b><span>Q: how do we describe the table and its pieces? → a DataFrame: a table with a schema, split into partitions (Biteful's 7 day-files became 4 read partitions). If each step ran immediately on every partition, Spark couldn't plan the whole job…</span></li>
    <li><b>Lazy transformations vs actions</b><span>Q: when does work actually happen? → transformations only write a plan: after filter and groupBy, 0 rows had been touched; <code>.count()</code> ran it (10 rows seen) and <code>.show()</code> ran it again (20). Some steps in that plan are cheap, some are not…</span></li>
    <li><b>Narrow vs wide &amp; shuffles</b><span>Q: which steps are expensive, and why? → narrow steps (filter, select) stay inside a partition: 1 stage. Wide steps (groupBy, join) must bring equal keys together: an <code>Exchange</code> (shuffle) in the plan and a second stage. Half the team writes SQL instead…</span></li>
    <li><b>Spark SQL</b><span>Q: does SQL run differently from DataFrame code? → no: same optimizer, same physical plan (checked: True). The most expensive SQL step is usually the join…</span></li>
    <li><b>Joins at scale</b><span>Q: how do you join 2 million orders to 5 restaurants without shuffling both? → broadcast the small side (no shuffle of the big side; 0.41 s vs 0.95 s for sort-merge). But one hot key (Biryani Bros, 92% of rows) puts most work on one task; salting cut the biggest partition to 26%. Every job also starts by reading files…</span></li>
    <li><b>Partitioning &amp; file layout</b><span>Q: how should data be split in memory and on disk? → repartition vs coalesce; one folder per day lets Spark read only 2 March (<code>PartitionFilters</code>); 200 tiny files vs 4. Several reports reuse the same expensive result…</span></li>
    <li><b>Caching</b><span>Q: how do we avoid recomputing a result used many times? → <code>cache()</code>: report 2 took 0.84 s, reports 4–5 0.12 s from memory. What other habits quietly make Spark slow?</span></li>
    <li><b>Common performance traps</b><span>Q: what else costs us? → Python UDFs (built-in 0.08 s vs 0.28–0.45 s, and no filter pushdown), <code>collect()</code> on big data, small files, wrong partition counts, Spark for tiny data.</span></li>
  </ol>

  <h2 id="sp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Apache Spark</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When &amp; Why</div>
        <ul>
          <li><b>Spark</b> — engine that runs DataFrame / SQL code across a cluster</li>
          <li><b>Use when</b> — 50–100 GB+, or data already in a lakehouse (Databricks, EMR)</li>
          <li><b>Don't</b> — small data: pandas / Polars / DuckDB are faster</li>
          <li><b>Idea</b> — split data, move code to data, combine partial results</li>
          <li>💡 election counting: each booth counts its own ballots</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Architecture</div>
        <ul>
          <li><b>Driver</b> — runs your script, plans, hands out tasks</li>
          <li><b>Executors</b> — worker processes; run tasks, hold cached data</li>
          <li><b>Cluster manager</b> — YARN / Kubernetes / standalone</li>
          <li><b>1 partition = 1 task = 1 core</b> at a time</li>
          <li><b>Job → stages → tasks</b>; each shuffle starts a new stage</li>
          <li>⚠ <code>collect()</code> / <code>toPandas()</code> on big data → driver out of memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lazy Evaluation</div>
        <ul>
          <li><b>Transformations</b> — lazy: <code>select, filter, join, groupBy, withColumn</code></li>
          <li><b>Actions</b> — run a job: <code>show, count, collect, take, write</code></li>
          <li><b>Why lazy</b> — the optimizer sees the whole plan: pushdown, pruning, join choice</li>
          <li>⚠ every action recomputes from the source (Biteful: 10 → 20 rows seen)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shuffles &amp; Plans</div>
        <ul>
          <li><b>Narrow</b> — filter, select: no data moves; 1 stage</li>
          <li><b>Wide</b> — groupBy, join, distinct, orderBy → <b>shuffle</b></li>
          <li><b>explain()</b> — read bottom-up; <code>Exchange</code> = shuffle</li>
          <li><b>partial_sum</b> — pre-aggregate before the shuffle</li>
          <li><b>Spark SQL = DataFrame API</b> — same plan</li>
          <li><b>AQE</b> — re-plans at runtime: merges tiny partitions, splits skewed ones</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Joins &amp; Skew</div>
        <ul>
          <li><b>Broadcast hash join</b> — copy the small side everywhere; big side never moves</li>
          <li><b>Sort-merge join</b> — big ⋈ big; shuffle + sort both sides</li>
          <li><b>Skew</b> — one key holds most rows (Biryani Bros 92%) → one slow task</li>
          <li><b>Fixes</b> — broadcast, salting, AQE skew join, handle NULL keys</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Layout &amp; Cache</div>
        <ul>
          <li><b>repartition(n)</b> — full shuffle, even sizes; <b>coalesce(n)</b> — merge, no shuffle</li>
          <li><b>partitionBy("order_date")</b> — folder per day → partition pruning</li>
          <li><b>Parquet</b> — columnar, typed, min/max stats</li>
          <li><b>cache()</b> — lazy; for results used 2+ times; <code>unpersist()</code></li>
          <li>⚠ partition folders on a high-cardinality column; thousands of tiny files</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Common Mistakes</div>
        <ul>
          <li>⚠ <b>Python UDF</b> — slower than built-ins and blocks filter pushdown</li>
          <li>⚠ <b>Small files</b> — coalesce before writing; compact</li>
          <li>⚠ <b>Bad partition count</b> — idle cores or scheduling overhead</li>
          <li>⚠ <b>Schema drift</b> — int on one day, double on another → read fails</li>
          <li>⚠ <b>Spark for tiny data</b> — seconds of overhead</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sp-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sp-when"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When pandas Runs Out</span><span class="rm-sub">50 GB on one machine</span></div></div>
      <div class="rm-item rm-done" data-target="sp-dist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Distributed Idea</span><span class="rm-sub">Split data, move code</span></div></div>
      <div class="rm-item rm-done" data-target="sp-arch"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Driver &amp; Executors</span><span class="rm-sub">Who does what</span></div></div>
      <div class="rm-item rm-done" data-target="sp-df"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">DataFrames &amp; Partitions</span><span class="rm-sub">The table and its pieces</span></div></div>
      <div class="rm-item rm-done" data-target="sp-lazy"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Lazy vs Actions</span><span class="rm-sub">Nothing runs until count()</span></div></div>
      <div class="rm-item rm-done" data-target="sp-shuffle"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Narrow, Wide &amp; Shuffles</span><span class="rm-sub">Exchange in the plan</span></div></div>
      <div class="rm-item rm-done" data-target="sp-sql"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Spark SQL</span><span class="rm-sub">Same plan as the API</span></div></div>
      <div class="rm-item rm-done" data-target="sp-join"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Joins at Scale</span><span class="rm-sub">Broadcast, sort-merge, skew</span></div></div>
      <div class="rm-item rm-done" data-target="sp-part"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Partitioning &amp; Files</span><span class="rm-sub">Layout decides speed</span></div></div>
      <div class="rm-item rm-done" data-target="sp-cache"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">Compute once, reuse</span></div></div>
      <div class="rm-item rm-done" data-target="sp-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Performance Traps</span><span class="rm-sub">UDFs, collect, small files</span></div></div>
      <div class="rm-item rm-done" data-target="sp-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One job, many pieces</span></div></div>
      <div class="rm-item rm-done" data-target="sp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sp-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sp-when"><span class="num">01</span>When pandas Runs Out of Memory</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's nightly ETL runs in pandas, and a week of its orders is a few kilobytes. Biteful grows. One day the transform step is asked to total revenue per city for a year of orders, 50 GB of them, and the machine freezes. Why does pandas fail there, and what is the way out?</p>
  </div>
  <p>pandas keeps the whole table in the RAM of one machine, and most operations make copies. How big is a year? Measure one million Biteful-shaped orders (same columns as the warehouse's <code>fact_orders</code>) and multiply:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

# Biteful's orders table, but a million rows of it (same columns as fact_orders)
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
mb = df.memory_usage(deep=True).sum() / 1e6
print(f"bytes per order      : {mb * 1e6 / n:.0f}")
print(f"1 million orders     : {mb:,.0f} MB in RAM")
rows_50gb = 50e9 / (mb * 1e6 / n)
print(f"50 GB holds          : {rows_50gb / 1e6:,.0f} million orders")
print(f"at 20 lakh orders/day: {rows_50gb / 2e6:,.0f} days of orders")</div>
  <div class="fx" data-lang="text">bytes per order      : 88
1 million orders     : 88 MB in RAM
50 GB holds          : 571 million orders
at 20 lakh orders/day: 286 days of orders</div>
  <p><code>memory_usage(deep=True)</code> counts the real bytes, strings included. One order costs about 88 bytes, so 50 GB is about 571 million orders, roughly 9 months of a company taking 20 lakh orders a day. Just <em>holding</em> it needs 50 GB of RAM; a groupby or merge makes temporary copies, so plan on 2–3× that. A normal laptop has 16 GB.</p>
  <p>There are two ways out. <strong>Scale up</strong>: buy one bigger machine. It works up to a point and gets very expensive. <strong>Scale out</strong>: split the data across many ordinary machines, let each work on its piece, and combine the small results. Spark is a system for scaling out: you write code that looks like pandas or SQL, and Spark splits the data, sends the work out, survives a machine dying, and combines the answers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Counting votes in a general election. One clerk could count a village's votes alone (pandas). For the whole country, every booth counts its own ballots, each constituency adds up its booths, and the Election Commission adds up the constituencies. Nobody ever holds all the ballots.</p>
  </div>
  <table class="tbl">
    <tr><th>Data size</th><th>Tool</th><th>Why</th></tr>
    <tr><td>&lt; ~5 GB</td><td>pandas / Polars</td><td>Fits in RAM; no cluster overhead</td></tr>
    <tr><td>5–100 GB</td><td>DuckDB, Polars, one big VM</td><td>Out-of-core on one machine is often enough</td></tr>
    <tr><td>100 GB → PB</td><td><strong>Spark</strong> (Databricks, EMR, Dataproc)</td><td>Splits data and work across many machines</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Apache Spark</strong> is a distributed data-processing engine: it runs DataFrame and SQL code in parallel across a <strong>cluster</strong> (a group of machines working together). It is written in Scala on the JVM (Java Virtual Machine); <strong>PySpark</strong> is its Python interface.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spark on Biteful's 10 orders is far <em>slower</em> than pandas: starting the JVM, planning and scheduling cost seconds before any work happens (in our runs, a script that only started Spark and counted a file took about 12 seconds end to end). Pick Spark for a reason you can name: size, an existing lakehouse, the team's platform. "I'd try DuckDB first" is a good interview answer for 20 GB.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the distributed idea.</b> "Use many machines" is easy to say. How can ten machines produce one correct total when each sees only some of the orders?</div>

  <h2 id="sp-dist"><span class="num">02</span>The Distributed Idea: Split the Data, Move the Code</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the orders are spread over several machines, none of them can see "all Pune orders". How do we still get Pune's total, and what should travel over the network: the data or the program?</p>
  </div>
  <p>Two ideas, in plain words. <strong>Split the data</strong>: each machine stores and reads only its own share of the rows. <strong>Move the code to the data</strong>: a program is a few kilobytes and the data is gigabytes, so send the small function to every machine instead of sending every row to one machine. Each machine produces a small <em>partial result</em>; only those travel, and one place adds them up.</p>
  <p>The whole idea in plain Python, on Biteful's 10 orders and three pretend machines:</p>
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

print("bytes if we shipped every row to one place:", len(pickle.dumps(orders)))
print("bytes actually shipped (3 partial results):", len(pickle.dumps(list(partials.values()))))</div>
  <div class="fx" data-lang="text">machine A holds [101, 102, 103, 104] -&gt; {'Pune': 1140.0, 'Mumbai': 450.0}
machine B holds [105, 106, 107] -&gt; {'Mumbai': 180.0}
machine C holds [108, 109, 110] -&gt; {'Pune': 260.0, 'Mumbai': 600.0}
combined: {'Pune': 1400.0, 'Mumbai': 1230.0}
bytes if we shipped every row to one place: 470
bytes actually shipped (3 partial results): 113</div>
  <table class="tbl out"><caption>Trace: partial results, by hand</caption>
    <tr><th>Machine</th><th>Delivered orders it holds</th><th>Pune</th><th>Mumbai</th></tr>
    <tr><td>A (101–104)</td><td>101 Pune 240, 102 Mumbai 450, 103 Pune 520, 104 Pune 380</td><td>1140</td><td>450</td></tr>
    <tr><td>B (105–107)</td><td>106 Mumbai 180 (105, 107 cancelled)</td><td>—</td><td>180</td></tr>
    <tr><td>C (108–110)</td><td>108 Pune 260, 109 Mumbai 600 (110 pending)</td><td>260</td><td>600</td></tr>
    <tr><td><b>Combined</b></td><td></td><td><b>1400</b></td><td><b>1230</b></td></tr>
  </table>
  <p>The combined answer equals the ETL note's gold table (total 2,630). Only three small dictionaries crossed the "network": 113 bytes instead of 470. With 571 million orders the rows would be 50 GB and the partial results would still be a few bytes per city. This is why sums, counts and averages scale so well: they can be computed in pieces and combined. (A median cannot simply be combined like this, which is why it is expensive at scale.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher wants the class average for 5 sections. She doesn't collect 200 answer sheets; each section teacher sends "total marks and number of students", and she adds the five pairs. The marking happens where the sheets are.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Data parallelism</strong>: the same function runs on different pieces of the data at the same time. <strong>Data locality</strong> ("move code to data"): run the function on the machine that already stores the piece. <strong>Partial aggregation</strong>: each piece computes a small summary; summaries are combined afterwards.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Not every question splits nicely. "Total per city" combines from partial sums, but "the median order value" or "distinct customers" can't be added from per-machine answers (two machines may count the same customer). Those need the data regrouped by key, which is the expensive <em>shuffle</em> of section 06, or an approximate algorithm.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: driver, executors and the cluster manager.</b> Our loop played every role itself. On a real cluster someone must decide how to split the data, ship the function, collect the partial results, and redo the work of a machine that crashes.</div>

  <h2 id="sp-arch"><span class="num">03</span>Driver, Executors, Cluster Manager</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 02 needs a coordinator (split, ship, combine) and workers (run the function on their piece). If ten machines each grabbed rows at random, some orders would be counted twice and others never. Who is in charge, and what is the unit of work?</p>
  </div>
  <p>The unit of work is the <strong>partition</strong>: a chunk of rows (machine A's four orders were one partition). One <strong>task</strong> processes one partition on one CPU core. The <strong>driver</strong> is the process running your Python script: it turns your code into a plan, splits the plan into tasks, and hands them out. <strong>Executors</strong> are worker processes on the cluster's machines: they run tasks and can keep data in memory (the cache). The <strong>cluster manager</strong> (YARN, Kubernetes, or Spark's own standalone mode) decides which machines the executors run on.</p>
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
    <p>A wedding kitchen. The head cook (driver) reads the menu and writes the plan. The caterer's manager (cluster manager) decides which cooks are hired today. Each cook (executor) has a few burners (cores) and a small fridge (cache). The rice split into portions is the partitions; one burner cooks one portion at a time (a task). If a cook faints, the head cook hands that portion to someone else.</p>
  </div>
  <p>Every script in this note starts its Spark session from one small file. <code>local[4]</code> means "a pretend cluster on this machine with 4 cores": the driver and one executor share the machine.</p>
  <div class="fx" data-lang="py">import os, sys
from pyspark.sql import SparkSession, functions as F

os.environ["PYSPARK_PYTHON"] = sys.executable                # workers use the same Python as the driver

spark = (SparkSession.builder
         .master("local[4]")                               # a pretend cluster: 4 cores on this machine
         .appName("biteful")
         .config("spark.sql.shuffle.partitions", "8")      # partitions after a shuffle (default 200)
         .config("spark.ui.enabled", "false")
         .config("spark.ui.showConsoleProgress", "false")
         .getOrCreate())
spark.sparkContext.setLogLevel("ERROR")

ORDERS = "data/fact_orders"                                # the Parquet warehouse built in de_etl
RESTAURANTS = "data/restaurants.parquet"</div>
  <p>Now watch the code move to the data. We split Biteful's 10 order ids into 4 partitions and ask each task which operating-system process it ran in:</p>
  <div class="fx" data-lang="py">import os
from common import spark, F

sc = spark.sparkContext
print("master          :", sc.master)                 # local[4]: driver + one executor, 4 cores
print("cores (slots)   :", sc.defaultParallelism)
print("driver python   : pid", os.getpid())

# Which process runs each partition's task?  Ask every task for its process id.
def who_am_i(index, rows):
    yield (index, os.getpid(), len(list(rows)))

nums = sc.parallelize(range(101, 111), 4)         # Biteful's 10 order ids in 4 partitions
for part, pid, n in nums.mapPartitionsWithIndex(who_am_i).collect():
    print(f"partition {part}: {n} orders, processed in python worker pid {pid}")</div>
  <div class="fx" data-lang="text">master          : local[4]
cores (slots)   : 4
driver python   : pid 30214
partition 0: 2 orders, processed in python worker pid 30335
partition 1: 3 orders, processed in python worker pid 30336
partition 2: 2 orders, processed in python worker pid 30338
partition 3: 3 orders, processed in python worker pid 30341</div>
  <p>Read it. The driver is one Python process. The function <code>who_am_i</code> did not run there: Spark serialised it, shipped it, and ran it in four separate Python worker processes, one per partition, all at once on 4 cores. 10 ids in 4 partitions became 2, 3, 2 and 3 rows. On a real cluster those workers would be on different machines, each reading its own partition from local disk. <code>spark.sql.shuffle.partitions</code> (8 here, default 200) is how many partitions Spark creates after a shuffle (section 06).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Driver</strong>: the process that runs your program and schedules work. <strong>Executor</strong>: a worker process that runs tasks and stores cached data. <strong>Cluster manager</strong>: allocates machines/containers to executors. <strong>Partition</strong>: a chunk of a dataset, the unit of parallelism. <strong>Task</strong>: one unit of work on one partition, run by one core. If a task fails, the driver re-runs it elsewhere: that is how Spark survives a dead machine.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The driver is a single machine with normal memory. Anything that pulls all the data back to it (<code>collect()</code>, <code>toPandas()</code>) can crash it with out-of-memory, even though the cluster had plenty. Bring back only small results (like the 2-row city totals).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: DataFrames and partitions.</b> We used raw ids and a hand-written function. Real work is tables: Biteful's warehouse has 10 typed columns in 7 day-files. How do we tell Spark "this is a table", and how does it cut a table into partitions?</div>

  <h2 id="sp-df"><span class="num">04</span>DataFrames &amp; Partitions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want to write "filter delivered orders, total per city", as in pandas, not "ship this function to partition 3". What object describes a distributed table, and how do its rows end up in partitions?</p>
  </div>
  <p>In plain words: a Spark <strong>DataFrame</strong> is a table with named, typed columns (its <strong>schema</strong>), whose rows are spread over partitions on the cluster. You write table operations; Spark turns them into tasks. Reading files decides the first split: Spark packs files (or pieces of big files) into partitions of up to 128 MB each, aiming to keep every core busy.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class register kept as loose pages in several folders. The DataFrame is "the register": you say "count the absent students". The folders are partitions: each helper takes one folder. Who gets which pages is a filing decision, and it can be changed by re-sorting the pages.</p>
  </div>
  <p>Read the warehouse that <a class="xref" data-note="de_etl">de_etl</a> built, see its schema, see how its 7 day-files became partitions, then re-split it into 4:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS

orders = spark.read.parquet(ORDERS)                # the warehouse built in de_etl
orders.printSchema()
print("rows:", orders.count(), "| partitions after reading:", orders.rdd.getNumPartitions())

(orders.withColumn("partition", F.spark_partition_id())   # which day-files went into which partition?
   .groupBy("partition")
   .agg(F.sort_array(F.collect_set("order_date")).cast("array&lt;string&gt;").alias("days"),
        F.sort_array(F.collect_list("order_id")).alias("orders"))
   .orderBy("partition").show(truncate=False))

o4 = orders.repartition(4)                          # spread the rows over 4 partitions
(o4.withColumn("partition", F.spark_partition_id())
   .groupBy("partition")
   .agg(F.sort_array(F.collect_list("order_id")).alias("orders"), F.count("*").alias("rows"))
   .orderBy("partition").show(truncate=False))</div>
  <div class="fx" data-lang="text">root
 |-- order_id: long (nullable = true)
 |-- ordered_at_utc: string (nullable = true)
 |-- customer_id: long (nullable = true)
 |-- restaurant: string (nullable = true)
 |-- city: string (nullable = true)
 |-- cuisine: string (nullable = true)
 |-- status: string (nullable = true)
 |-- amount: double (nullable = true)
 |-- delivery_minutes: long (nullable = true)
 |-- order_date: date (nullable = true)

rows: 10 | partitions after reading: 4
+---------+------------------------+-------------------------+
|partition|days                    |orders                   |
+---------+------------------------+-------------------------+
|0        |[2026-03-02, 2026-03-05]|[101, 102, 103, 108, 109]|
|1        |[2026-03-03, 2026-03-04]|[104, 105, 106, 107]     |
|2        |[2026-03-08]            |[110]                    |
+---------+------------------------+-------------------------+

+---------+---------------+----+
|partition|orders         |rows|
+---------+---------------+----+
|0        |[107, 109, 110]|3   |
|1        |[102, 104, 108]|3   |
|2        |[101, 105]     |2   |
|3        |[103, 106]     |2   |
+---------+---------------+----+</div>
  <p>Trace it. The schema came from inside the Parquet files: <code>amount</code> is a double, <code>delivery_minutes</code> a long (64-bit integer). <code>order_date</code> came from the folder names (<code>order_date=2026-03-02</code>) and was read as a date. Reading 7 tiny day-files gave 4 partitions; Spark packed 2 and 5 March into partition 0, 3 and 4 March into partition 1, 8 March into partition 2, and the two empty days (6, 7 March) into partition 3, which therefore has no rows to show. <code>repartition(4)</code> then dealt the 10 rows out evenly (3, 3, 2, 2). Partitions are a property of the data in memory, not of the files.</p>
  <h3>Trap seen for real: every partition must have the same schema</h3>
  <p>When we first pointed Spark at the ETL warehouse, the read failed. pandas had written <code>delivery_minutes</code> as int64 on days where every time was known and as double on days with a gap. Here is that situation rebuilt in two files:</p>
  <div class="fx" data-lang="py">import os, pandas as pd
from common import spark

# two day-files written by pandas WITHOUT a pinned type (what de_etl did at first)
os.makedirs("out/drift/order_date=2026-03-02", exist_ok=True)
os.makedirs("out/drift/order_date=2026-03-03", exist_ok=True)
pd.DataFrame({"order_id": [101, 102, 103], "delivery_minutes": [32, 41, 38]}) \\
  .to_parquet("out/drift/order_date=2026-03-02/part-0.parquet")          # all known  -&gt; int64
pd.DataFrame({"order_id": [104, 105], "delivery_minutes": [None, None]}).astype({"delivery_minutes": float}) \\
  .to_parquet("out/drift/order_date=2026-03-03/part-0.parquet")          # gaps -&gt; float64
print(pd.read_parquet("out/drift").shape, "&lt;- pandas reads the folder without complaint")
try:
    spark.read.parquet("out/drift").show()
except Exception as e:
    msg = str(e)
    print("Spark:", msg[msg.find("Data type mismatches"):].split(". SQLSTATE")[0])</div>
  <div class="fx" data-lang="text">(5, 3) &lt;- pandas reads the folder without complaint
Spark: Data type mismatches when reading Parquet column [delivery_minutes]. Expected Spark type bigint, actual Parquet type DOUBLE</div>
  <p>Spark takes the schema from one file and expects every file to match. The fix belongs in the ETL (it now pins the column with <code>astype("Int64")</code>), not in the reader.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Spark DataFrame</strong> is an immutable, distributed table with a schema. <strong>Immutable</strong>: operations never change it; they return a new DataFrame. Its rows live in partitions; <code>df.rdd.getNumPartitions()</code> tells how many, and <code>F.spark_partition_id()</code> tells which partition a row is in.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A Spark DataFrame is not a pandas DataFrame: no row index, no <code>df.loc[5]</code>, no in-place changes, and row order is not guaranteed unless you <code>orderBy</code>. Code that relies on "the first row" gives different answers on different runs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: lazy transformations vs actions.</b> In pandas each line runs at once. If Spark did that, it would filter all partitions, then join, then discover we needed two columns and one city. When does Spark actually do the work?</div>

  <h2 id="sp-lazy"><span class="num">05</span>Lazy Transformations vs Actions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On a cluster, every unnecessary pass over the data costs minutes. If each line ran immediately, Spark could never combine steps, skip unused columns, or move a filter earlier. So when does a line of Spark code actually touch the data?</p>
  </div>
  <p>Spark waits. Operations that build a new DataFrame, like <code>filter</code>, <code>join</code> and <code>groupBy</code>, are <strong>transformations</strong>: they only add a step to a plan and return at once. Only when you ask for a result, with an <strong>action</strong> like <code>show()</code>, <code>count()</code> or <code>write</code>, does Spark look at the whole plan, optimise it, and run it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ordering at a dhaba with friends. The waiter writes everyone's order on a pad (transformations) and goes to the kitchen only when you say "that's all" (action). Because the cook sees the whole list, four plates of paneer are made in one pan. A waiter who ran to the kitchen after every item would be pandas on a cluster.</p>
  </div>
  <p>To <em>see</em> laziness, we make the filter a Python function that adds 1 to a shared counter (a Spark <strong>accumulator</strong>) for every row it looks at, and we count Spark jobs with the status tracker:</p>
  <div class="fx" data-lang="py">from pyspark.sql.types import BooleanType
from common import spark, F, ORDERS

sc = spark.sparkContext
rows_seen = sc.accumulator(0)                    # a counter the tasks add to; the driver reads it

def is_delivered(status):                        # a Python function that counts every row it sees
    rows_seen.add(1)
    return status == "delivered"
is_delivered_udf = F.udf(is_delivered, BooleanType())

def jobs():                                      # how many Spark jobs have run so far
    return len(sc.statusTracker().getJobIdsForGroup())

orders = spark.read.parquet(ORDERS)
print(f"after read        : rows seen {rows_seen.value:2}, jobs so far {jobs()}")
d = orders.filter(is_delivered_udf("status"))                    # transformation
print(f"after filter      : rows seen {rows_seen.value:2}, jobs so far {jobs()}")
g = d.groupBy("city").agg(F.sum("amount").alias("revenue"))       # transformation
print(f"after groupBy/agg : rows seen {rows_seen.value:2}, jobs so far {jobs()}   type: {type(g).__name__}")

print("g.count() =", g.count())                                   # ACTION
print(f"after count()     : rows seen {rows_seen.value:2}, jobs so far {jobs()}")
g.orderBy("city").show()                                          # another ACTION
print(f"after show()      : rows seen {rows_seen.value:2}, jobs so far {jobs()}")</div>
  <div class="fx" data-lang="text">after read        : rows seen  0, jobs so far 1
after filter      : rows seen  0, jobs so far 1
after groupBy/agg : rows seen  0, jobs so far 1   type: DataFrame
g.count() = 2
after count()     : rows seen 10, jobs so far 4
+------+-------+
|  city|revenue|
+------+-------+
|Mumbai| 1230.0|
|  Pune| 1400.0|
+------+-------+

after show()      : rows seen 20, jobs so far 6</div>
  <table class="tbl out"><caption>Trace: what happened at each line</caption>
    <tr><th>Line</th><th>Kind</th><th>Rows looked at</th><th>Jobs</th><th>Why</th></tr>
    <tr><td><code>spark.read.parquet</code></td><td>(setup)</td><td>0</td><td>1</td><td>one small job read the files' footers to learn the schema; no rows</td></tr>
    <tr><td><code>filter</code></td><td>transformation</td><td>0</td><td>1</td><td>only added "keep delivered" to the plan</td></tr>
    <tr><td><code>groupBy().agg()</code></td><td>transformation</td><td>0</td><td>1</td><td>only added "total per city"; <code>g</code> is a plan, not data</td></tr>
    <tr><td><code>g.count()</code></td><td><b>action</b></td><td>10</td><td>4</td><td>ran the plan: every order passed the filter once; answer 2 cities</td></tr>
    <tr><td><code>g.show()</code></td><td><b>action</b></td><td>20</td><td>6</td><td>ran the <em>whole</em> plan again from the files</td></tr>
  </table>
  <p>Check the result by hand: Pune 240 + 520 + 380 + 260 = 1400, Mumbai 450 + 180 + 600 = 1230, the same as section 02. The last row is the important surprise: the second action re-read the files and re-ran the filter on all 10 rows. Spark keeps the <em>recipe</em> (the plan, also called the <strong>lineage</strong>), not the cooked result. (Each action showed up as more than one job: with adaptive query execution, Spark runs a query's shuffle stage and its final stage as separate small jobs.)</p>
  <table class="tbl">
    <tr><th>Transformations (lazy)</th><th>Actions (run a job)</th></tr>
    <tr><td><code>select, filter, withColumn, join, groupBy, orderBy, repartition</code></td><td><code>show, count, collect, take, toPandas, write</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lazy evaluation</strong>: transformations build a logical plan (the lineage); an action makes the <strong>Catalyst optimizer</strong> rewrite it (push filters down, drop unused columns, pick join methods) and execute it as a <strong>job</strong>. The lineage is also how Spark recovers: a lost partition is recomputed from its recipe.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every action re-runs the lineage from the source: <code>count()</code>, then <code>show()</code>, then <code>write</code> is three full computations (we saw 10 → 20 rows). Reuse needs caching (section 10). Also, an error in a transformation (a bad column name inside a UDF, a bad cast) often appears only at the action, many lines later.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: narrow vs wide transformations.</b> The plan for <code>g</code> had two kinds of steps: filtering (each partition alone) and totalling per city (Pune rows are in every partition). Are they equally expensive?</div>

  <h2 id="sp-shuffle"><span class="num">06</span>Narrow vs Wide Transformations &amp; Shuffles</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To keep only delivered orders, each partition can work alone. To total Pune's revenue, every Pune row, wherever it sits, must end up in the same place. Rows have to physically move between machines. How does Spark do that, and how do we see it?</p>
  </div>
  <p>Spark names the two kinds. A <strong>narrow</strong> transformation makes each output partition from one input partition: <code>filter</code>, <code>select</code>, <code>withColumn</code>. A <strong>wide</strong> transformation needs rows from many partitions: <code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>. A wide step causes a <strong>shuffle</strong>: every task writes its rows to local disk, sorted into buckets by key (bucket = hash of the key), and tasks in the next step fetch their bucket from every machine over the network.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A post office sorting room. Stamping letters is narrow: each clerk stamps the pile on their own desk. Sorting by city is wide: every clerk walks every Pune letter to the Pune bin. The walking is the shuffle. Which bin a city goes to is decided by a rule (a hash of the name), not by who holds the letter.</p>
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
  <p>The script prints the physical plan of a narrow chain and of the same chain plus a <code>groupBy</code>, counts the tasks in each stage that ran, and then shows Biteful's rows moving during a shuffle by city:</p>
  <div class="fx" data-lang="py">from common import spark, F, ORDERS

sc = spark.sparkContext
orders = spark.read.parquet(ORDERS)

def stages_used(df):                       # run df (writing to nowhere): tasks per stage that ran
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
print("tasks per stage: narrow =", stages_used(narrow), "| wide =", stages_used(wide))

# watch rows move: 3 partitions with cities mixed, then shuffle by city
mixed = orders.select("order_id", "city").repartition(3)
def where(df, label):
    rows = (df.withColumn("p", F.spark_partition_id()).groupBy("p")
              .agg(F.sort_array(F.collect_list(F.concat_ws(":", "order_id", "city"))).alias("rows"))
              .orderBy("p").collect())
    for r in rows:
        print(label, "partition", r.p, r.rows)
where(mixed, "before")
where(mixed.repartition(2, "city"), "after ")</div>
  <div class="fx" data-lang="text">NARROW plan:
== Physical Plan ==
*(1) Project [order_id#0L, city#4, amount#7, round((amount#7 * 0.012), 2) AS amount_usd#11]
+- *(1) Filter (isnotnull(status#6) AND (status#6 = delivered))
   +- *(1) ColumnarToRow
      +- FileScan parquet [order_id#0L,city#4,status#6,amount#7,order_date#9] Batched: true,
         DataFilters: [isnotnull(status#6), (status#6 = delivered)],
         Format: Parquet,
         Location: InMemoryFileIndex(1 paths)[file:/…,
         PartitionFilters: [],
         PushedFilters: [IsNotNull(status), EqualTo(status,delivered)],
         ReadSchema: struct&lt;order_id:bigint,city:string,status:string,amount:double&gt;


WIDE plan:
== Physical Plan ==
AdaptiveSparkPlan isFinalPlan=false
+- HashAggregate(keys=[city#4], functions=[sum(amount#7)])
   +- Exchange hashpartitioning(city#4, 8), ENSURE_REQUIREMENTS, [plan_id=30]
      +- HashAggregate(keys=[city#4], functions=[partial_sum(amount#7)])
         +- Project [city#4, amount#7]
            +- Filter (isnotnull(status#6) AND (status#6 = delivered))
               +- FileScan parquet [city#4,status#6,amount#7,order_date#9] Batched: true,
                  DataFilters: [isnotnull(status#6), (status#6 = delivered)],
                  Format: Parquet,
                  Location: InMemoryFileIndex(1 paths)[file:/…,
                  PartitionFilters: [],
                  PushedFilters: [IsNotNull(status), EqualTo(status,delivered)],
                  ReadSchema: struct&lt;city:string,status:string,amount:double&gt;


tasks per stage: narrow = [4] | wide = [4, 1]
before partition 0 ['103:Pune', '106:Mumbai', '109:Mumbai']
before partition 1 ['101:Pune', '102:Mumbai', '104:Pune', '107:Pune']
before partition 2 ['105:Mumbai', '108:Pune', '110:Pune']
after  partition 0 ['101:Pune', '103:Pune', '104:Pune', '107:Pune', '108:Pune', '110:Pune']
after  partition 1 ['102:Mumbai', '105:Mumbai', '106:Mumbai', '109:Mumbai']</div>
  <p>(Long plan lines wrapped and the path shortened; the <code>#4</code>-style suffixes are internal column ids, ignore them.) Read the two plans <em>bottom-up</em>, from the file to the result.</p>
  <ol>
    <li><strong>Narrow plan</strong>: FileScan → Filter → Project, all marked <code>*(1)</code>, meaning they are fused into one piece of generated code that runs in one pass over each partition. No <code>Exchange</code> anywhere. It ran as <strong>1 stage of 4 tasks</strong>.</li>
    <li><strong>Wide plan</strong>: same bottom, then <code>HashAggregate … partial_sum</code> (each partition totals its own rows per city first: section 02's partial results), then <strong><code>Exchange hashpartitioning(city, 8)</code></strong>: the shuffle, sending each city's partial totals to one of 8 buckets, then the final <code>HashAggregate … sum</code>. It ran as <strong>2 stages: 4 tasks, then 1 task</strong> (adaptive execution merged the 8 nearly empty buckets into one).</li>
    <li>Both plans show <code>PushedFilters: [… EqualTo(status,delivered)]</code>: the filter was handed to the Parquet reader, so rows can be skipped while reading. And <code>ReadSchema</code> lists only the columns used: <strong>column pruning</strong>. That is laziness paying off.</li>
  </ol>
  <p>The last lines show the shuffle itself. Before, every partition mixed Pune and Mumbai, so no single task could total Pune. After <code>repartition(2, "city")</code>, all 6 Pune orders sat in partition 0 and all 4 Mumbai orders in partition 1. Every row crossed a partition boundary: on a real cluster, that is disk writes plus network transfer.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shuffle</strong>: redistributing rows across partitions (and machines) by key, through disk and network. <strong>Stage</strong>: a set of tasks running narrow steps back to back; a shuffle ends a stage. One action = one or more <strong>jobs</strong> → <strong>stages</strong> → <strong>tasks</strong> (one per partition). In a plan, <code>Exchange</code> = shuffle = stage boundary.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Not every shuffle is visible in your code: <code>distinct()</code>, <code>orderBy()</code>, <code>repartition()</code>, a window function with <code>partitionBy</code>, and a non-broadcast join all shuffle. When a job is slow, count the <code>Exchange</code> lines in <code>explain()</code> first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Spark SQL.</b> We wrote everything with the DataFrame API. Half of Biteful's analysts only write SQL. Do they get a different, slower plan?</div>

  <h2 id="sp-sql"><span class="num">07</span>Spark SQL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The SQL notes taught Biteful's queries in SQL. Can the same SQL run on Spark, and is it a second-class citizen compared with the DataFrame API?</p>
  </div>
  <p>Spark SQL lets you give a DataFrame a table name (a temporary <strong>view</strong>) and query it with ordinary SQL. Both SQL and DataFrame code go into the same optimizer and come out as the same <strong>physical plan</strong>, the exact list of operations Spark will run. So the choice is about readability, not speed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Google Maps: type the destination in Hindi or in English (SQL or DataFrame); the route is the same. <code>explain()</code> is the "show route" button: which roads (operations) and how many toll booths (shuffles) are on the way.</p>
  </div>
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
  <p>Same numbers both ways (Pune 4 delivered orders, ₹1,400; Mumbai 3, ₹1,230), and after removing the internal ids the two physical plans are character-for-character identical. Use whichever reads better; many teams write SQL for transformations (often through dbt, as in the ELT section of <a class="xref" data-note="de_etl">de_etl</a>) and the DataFrame API for logic that is easier in Python.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Spark SQL</strong>: Spark's SQL engine. <code>df.createOrReplaceTempView("name")</code> registers a DataFrame for SQL in this session; <code>spark.sql("…")</code> returns a DataFrame (also lazy). SQL and the DataFrame API share the Catalyst optimizer and produce the same plans.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A temp view is a name for a <em>plan</em>, not a stored copy: querying it twice computes it twice (like any DataFrame). And it lives only in the current Spark session; another job can't see it. Persist shared tables as Parquet/Delta tables.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: joins at scale.</b> Biteful's warehouse already had the city in each row. The raw orders at scale only carry a <code>restaurant_id</code>; the city comes from a join with the 5-row restaurants table, as in the ETL's enrich step. A join is a wide step: does that mean shuffling 2 million orders to meet 5 restaurants?</div>

  <h2 id="sp-join"><span class="num">08</span>Joins at Scale: Broadcast, Sort-Merge, Skew</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A join needs matching keys in the same place. The obvious way is to shuffle <em>both</em> tables by key. Shuffling 2 million orders to meet a 5-row restaurant list is absurd. And even with the right method, what if one restaurant has most of the orders?</p>
  </div>
  <p>Now Biteful at scale: 2,000,000 raw orders for 2–8 March during a Biryani Bros mega sale (90% of orders go to restaurant 11), joined to the 5 restaurants:</p>
  <div class="fx" data-lang="py">from common import spark, F

# Biteful at scale: 2 million raw orders for the week of 2-8 March, during a Biryani Bros mega sale
big = (spark.range(2_000_000).withColumnRenamed("id", "order_id")
       .withColumn("restaurant_id", F.when(F.col("order_id") % 10 &lt; 9, 11)       # 90% at Biryani Bros
                                     .otherwise(10 + (F.col("order_id") / 10).cast("long") % 5))
       .withColumn("amount", (F.col("order_id") % 800 + 100).cast("double"))
       .withColumn("status", F.when(F.col("order_id") % 20 == 0, "cancelled").otherwise("delivered"))
       .withColumn("order_date", F.date_add(F.lit("2026-03-02").cast("date"), (F.col("order_id") % 7).cast("int"))))
big.write.mode("overwrite").parquet("data/big_orders")
print(spark.read.parquet("data/big_orders").groupBy("restaurant_id").count().orderBy("restaurant_id").collect())</div>
  <div class="fx" data-lang="text">[Row(restaurant_id=10, count=40000), Row(restaurant_id=11, count=1840000), Row(restaurant_id=12, count=40000), Row(restaurant_id=13, count=40000), Row(restaurant_id=14, count=40000)]</div>
  <p>Spark has three ways to join (the same family as the database join algorithms in <a class="xref" data-note="sql_joins">JOINs</a>, now spread over machines):</p>
  <div class="cards">
    <div><b>Broadcast hash join</b><p>Copy the small table to every executor; each task joins its own partition of the big table locally. The big table never moves.</p><small>Small side under ~10 MB (<code>spark.sql.autoBroadcastJoinThreshold</code>); force with <code>F.broadcast(df)</code></small></div>
    <div><b>Sort-merge join</b><p>Shuffle both sides by key, sort each partition, walk both in order.</p><small>Default for big ⋈ big. Two shuffles.</small></div>
    <div><b>Shuffle hash join</b><p>Shuffle both, build a hash table on the smaller side in each partition.</p><small>When one side is medium-sized</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A broadcast join is photocopying the one-page price list and giving a copy to every billing counter, instead of making all customers queue at the one desk that holds the list. It only works because the list is small enough to copy.</p>
  </div>
  <p>The script runs the ETL's "enrich then total per city" on the big orders, first as Spark chooses, then with broadcasting forbidden, and prints only the join and Exchange lines of each plan:</p>
  <div class="fx" data-lang="py">import time
from common import spark, F, RESTAURANTS

big = spark.read.parquet("data/big_orders")                     # 2,000,000 orders
rest = spark.read.parquet(RESTAURANTS)                          # 5 restaurants
print("orders:", big.count(), "| restaurants:", rest.count())

def revenue_by_city():                                          # the ETL's enrich + gold step, at scale
    return (big.filter(F.col("status") == "delivered")
               .join(rest, "restaurant_id")                     # restaurant_id -&gt; city
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

show_join("default: Spark knows the restaurants file is tiny")
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")   # forbid broadcasting
q = show_join("broadcast switched off")
q.orderBy("city").show()</div>
  <div class="fx" data-lang="text">orders: 2000000 | restaurants: 5
--- default: Spark knows the restaurants file is tiny ---
+- Exchange hashpartitioning(city#7, 8), ENSURE_REQUIREMENTS, [plan_id=112]
+- BroadcastHashJoin [restaurant_id#1L], [restaurant_id#5L], Inner, BuildRight, false, false
+- BroadcastExchange HashedRelationBroadcastMode(List(input[0, bigint, false]),false), [plan_id=107]
best of 3: 0.41s
--- broadcast switched off ---
+- Exchange hashpartitioning(city#7, 8), ENSURE_REQUIREMENTS, [plan_id=617]
+- SortMergeJoin [restaurant_id#1L], [restaurant_id#5L], Inner
:  +- Exchange hashpartitioning(restaurant_id#1L, 8), ENSURE_REQUIREMENTS, [plan_id=609]
+- Exchange hashpartitioning(restaurant_id#5L, 8), ENSURE_REQUIREMENTS, [plan_id=610]
best of 3: 0.95s
+------+---------+
|  city|  revenue|
+------+---------+
|Mumbai|889520000|
|  Pune| 60480000|
+------+---------+</div>
  <p>Compare the two plans. With broadcast there is <em>one</em> Exchange, by city, after the join (on already-aggregated partial sums: a few rows); the 2 million orders never moved, and only the 5-row table travelled (<code>BroadcastExchange</code>). Spark chose this by itself because it knew the restaurants file is tiny. With broadcast forbidden, Spark used <code>SortMergeJoin</code> with two extra Exchanges, by <code>restaurant_id</code>, one for each side: every order crossed the shuffle. It took 0.95 s against 0.41 s here; on a real cluster with 2 TB of orders, the gap is minutes vs hours. Check the scale numbers' shape by hand: Mumbai (Biryani Bros, Green Bowl) dominates because of the mega sale.</p>
  <h3>Skew: one key with most of the rows</h3>
  <p>A shuffle sends all rows of a key to one partition. Biryani Bros has 1,840,000 of 2,000,000 orders, so in a sort-merge join (or any groupBy by restaurant) one task gets 92% of the work while the others finish early and wait. This is <strong>skew</strong>. The common fix is <strong>salting</strong>: add a small number (the salt, 0–7) to the key so the hot key's rows spread over several partitions, copy the small side once per salt value, and join on (key, salt).</p>
  <div class="fx" data-lang="py">from common import spark, F, RESTAURANTS

big = spark.read.parquet("data/big_orders")
rest = spark.read.parquet(RESTAURANTS)

def rows_per_partition(df, *keys):           # hash rows into 8 partitions by keys: how big is each?
    sizes = dict(df.repartition(8, *keys).groupBy(F.spark_partition_id().alias("p")).count().collect())
    return [sizes.get(p, 0) for p in range(8)]

print("rows per restaurant  :", dict(sorted(big.groupBy("restaurant_id").count().collect())))
print("by restaurant_id     :", rows_per_partition(big, "restaurant_id"))

SALTS = 8
salted = big.withColumn("salt", (F.col("order_id") % SALTS).cast("int"))      # spread each key 8 ways
print("by (restaurant, salt):", rows_per_partition(salted, "restaurant_id", "salt"))

# a salted JOIN: copy each restaurant row once per salt value, join on (restaurant_id, salt)
rest_salted = rest.withColumn("salt", F.explode(F.sequence(F.lit(0), F.lit(SALTS - 1))))
print("restaurants after copying:", rest_salted.count(), "rows")
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")
joined = (salted.filter(F.col("status") == "delivered")
                .join(rest_salted, ["restaurant_id", "salt"])
                .groupBy("city").agg(F.sum("amount").cast("long").alias("revenue")))
joined.orderBy("city").show()</div>
  <div class="fx" data-lang="text">rows per restaurant  : {10: 40000, 11: 1840000, 12: 40000, 13: 40000, 14: 40000}
by restaurant_id     : [40000, 1840000, 40000, 0, 0, 40000, 0, 40000]
by (restaurant, salt): [40000, 470000, 520000, 430000, 10000, 20000, 490000, 20000]
restaurants after copying: 40 rows
+------+---------+
|  city|  revenue|
+------+---------+
|Mumbai|889520000|
|  Pune| 60480000|
+------+---------+</div>
  <table class="tbl out"><caption>Rows per partition, 8 partitions (from the run above)</caption>
    <tr><th></th><th>hash on restaurant_id</th><th>hash on (restaurant_id, salt)</th></tr>
    <tr><td>Biggest partition</td><td><strong>1,840,000</strong> (92%)</td><td>520,000 (26%)</td></tr>
    <tr><td>Empty partitions</td><td>3 of 8</td><td>0 of 8</td></tr>
  </table>
  <p>Without salt, one partition holds all of Biryani Bros and three are empty: one core does almost everything. With 8 salts, restaurant 11 became 8 sub-keys and the biggest partition shrank 3.5×. It is still uneven because 8 salted keys hashed into 8 buckets collide; real jobs use more partitions and salts. The restaurants table grew from 5 to 40 rows (one copy per salt), and the salted join gave exactly the same revenue as before: salting changes where the work happens, not the answer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Skew is one supermarket checkout with 90 customers while seven tills sit empty; the shop closes only when the last customer is billed. Salting hands the long queue tokens 0–7: "go to the till on your token".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Data skew</strong>: an uneven distribution of rows across keys, making some tasks far bigger than others. Fixes: broadcast the other side (no shuffle by key at all); salting; adaptive query execution's skew join (<code>spark.sql.adaptive.skewJoin.enabled</code>, which splits oversized partitions automatically once they pass a size threshold); handle NULL or default keys separately.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The hidden hot key is often NULL or a placeholder like <code>"unknown"</code> or <code>0</code>, not a famous restaurant. Before tuning anything, run <code>df.groupBy(key).count().orderBy(F.desc("count")).show(5)</code>, as the first line of our skew script did.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: partitioning and file layout.</b> Every job so far started by reading every file. If a report only needs 2 March, why read the other six days? And how many partitions and output files should a job have?</div>

  <h2 id="sp-part"><span class="num">09</span>Partitioning &amp; File Layout</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How the data is split, in memory and on disk, decides how much each job must read, how many cores can work at once, and how many files the next job must open. Getting it wrong doesn't break anything; it just makes jobs ten times slower. What are the knobs?</p>
  </div>
  <p>Three knobs. <strong>In memory</strong>: <code>repartition(n)</code> reshuffles everything into n even partitions (up or down); <code>coalesce(n)</code> only reduces the count by gluing neighbouring partitions together, with no shuffle. <strong>Output files</strong>: each task writes its own file, so the partition count at write time is the file count. <strong>Folders</strong>: <code>partitionBy("order_date")</code> writes one folder per day, exactly the layout of the ETL warehouse, so a query for one day opens one folder (<strong>partition pruning</strong>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school office files attendance in one drawer per month. "Absences in March?" opens one drawer. Splitting each drawer into 200 thin folders makes every search slower; one giant folder makes it impossible to share the work between clerks.</p>
  </div>
  <div class="fx" data-lang="py">import os
from common import spark, F

big = spark.read.parquet("data/big_orders")
print("partitions in memory:", big.rdd.getNumPartitions())
print("repartition(16):", big.repartition(16).rdd.getNumPartitions(),
      "| coalesce(2):", big.coalesce(2).rdd.getNumPartitions())

def files(path):                                  # count the data files Spark wrote
    return sum(f.endswith(".parquet") for _, _, fs in os.walk(path) for f in fs)

big.repartition(200).write.mode("overwrite").parquet("out/many")
big.coalesce(4).write.mode("overwrite").parquet("out/few")
print("files: repartition(200) -&gt;", files("out/many"), "| coalesce(4) -&gt;", files("out/few"))

# file layout for queries: one folder per day
big.write.mode("overwrite").partitionBy("order_date").parquet("out/by_day")
print(sorted(os.listdir("out/by_day"))[:3], "...", len(os.listdir("out/by_day")), "entries,",
      files("out/by_day"), "files")
one_day = spark.read.parquet("out/by_day").filter(F.col("order_date") == "2026-03-02")
one_day.explain()
print("orders on 2 March:", one_day.count())</div>
  <div class="fx" data-lang="text">partitions in memory: 4
repartition(16): 16 | coalesce(2): 2
files: repartition(200) -&gt; 200 | coalesce(4) -&gt; 4
['._SUCCESS.crc', '_SUCCESS', 'order_date=2026-03-02'] ... 9 entries, 28 files
== Physical Plan ==
*(1) ColumnarToRow
+- FileScan parquet [order_id#6L,restaurant_id#7L,amount#8,status#9,order_date#10] Batched: true,
   DataFilters: [],
   Format: Parquet,
   Location: InMemoryFileIndex(1 paths)[file:/…,
   PartitionFilters: [isnotnull(order_date#10), (order_date#10 = 2026-03-02)],
   PushedFilters: [],
   ReadSchema: struct&lt;order_id:bigint,restaurant_id:bigint,amount:double,status:string&gt;


orders on 2 March: 285715</div>
  <p>Read it. The same 2 million orders became 200 files or 4 files depending only on the partition count at write time. With <code>partitionBy("order_date")</code>, Spark wrote 7 day-folders (plus <code>_SUCCESS</code> markers), and 28 files: each of the 4 tasks wrote one file into every day it had rows for, 7 × 4. The read for 2 March shows <code>PartitionFilters: [… (order_date = 2026-03-02)]</code>: the filter was applied to <em>folder names</em>, so Spark opened only <code>order_date=2026-03-02/</code> and never touched the other six days. 285,715 orders = 2,000,000 / 7, rounded up, since order ids 0, 7, 14, … fall on 2 March.</p>
  <table class="tbl">
    <tr><th></th><th><code>repartition(n)</code></th><th><code>coalesce(n)</code></th></tr>
    <tr><td>Direction</td><td>Up or down</td><td>Down only</td></tr>
    <tr><td>Shuffle?</td><td>Yes, full; evenly balanced</td><td>No; merges neighbours, can be uneven</td></tr>
    <tr><td>Use for</td><td>More parallelism; co-locate a key before a join or write</td><td>Fewer output files at the end of a job</td></tr>
  </table>
  <p>Parquet adds two more savings inside each file: a query that needs 2 of 50 columns reads only those 2 (<strong>column pruning</strong>), and min/max statistics per block let a filter like <code>amount &gt; 900</code> skip blocks whose maximum is below 900 (<strong>predicate pushdown</strong>; the <code>PushedFilters</code> line in section 06).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Rules of thumb: in-memory partitions of about 100–200 MB, and at least 2–3× the total cores. Output files of roughly 128 MB–1 GB. Partition folders on a low-cardinality column (few distinct values) that queries filter on: date, country.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>partitionBy("customer_id")</code> on a table with 10 million customers makes 10 million folders of tiny files; listing them takes longer than the query. Never partition folders by a high-cardinality column. And <code>coalesce(1)</code> to get "one nice file" forces the last stage onto one task, which becomes the bottleneck or runs out of memory.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: caching.</b> A daily revenue table is computed once and then used by three reports. Section 05 showed that each action re-runs the whole plan from the files. Three reports, three full computations?</div>

  <h2 id="sp-cache"><span class="num">10</span>Caching</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Laziness means Spark keeps the recipe, not the result: every action recomputes from the source (10 → 20 rows seen in section 05). When an expensive result feeds several reports, how do we compute it once?</p>
  </div>
  <p><code>cache()</code> tells Spark: "the next time you compute this DataFrame, keep its partitions in the executors' memory (spilling to disk if needed), and reuse them for later actions". It is itself lazy: nothing is stored until an action computes the DataFrame.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Making masala for a week of cooking. Grinding fresh every day (no cache) costs time each day. Grinding once and keeping a jar in the fridge (cache) costs a little extra the first day, then every day is quick. If you cook only once, the jar just takes fridge space.</p>
  </div>
  <p>The gold table: delivered revenue and orders per day per restaurant, built from the 2 million orders with a join and a groupBy, then used by five "reports":</p>
  <div class="fx" data-lang="py">import time
from common import spark, F, RESTAURANTS

big = spark.read.parquet("data/big_orders")
rest = spark.read.parquet(RESTAURANTS)
daily = (big.filter(F.col("status") == "delivered")              # silver -&gt; a gold table that
            .join(rest, "restaurant_id")                         # three reports will reuse
            .groupBy("order_date", "restaurant", "city")
            .agg(F.sum("amount").alias("revenue"), F.count("*").alias("orders")))

def run(label):
    t = time.time(); n = daily.count(); print(f"{label:22} {time.time() - t:5.2f}s  ({n} rows)")

run("report 1 (no cache)")
run("report 2 (no cache)")
daily.cache()                                                    # lazy: only marks it
print("cached yet?", daily.is_cached, "| storage:", daily.storageLevel)
run("report 3 (fills cache)")
run("report 4 (from cache)")
run("report 5 (from cache)")
daily.unpersist()</div>
  <div class="fx" data-lang="text">report 1 (no cache)     2.53s  (35 rows)
report 2 (no cache)     0.84s  (35 rows)
cached yet? True | storage: Disk Memory Deserialized 1x Replicated
report 3 (fills cache)  0.99s  (35 rows)
report 4 (from cache)   0.12s  (35 rows)
report 5 (from cache)   0.12s  (35 rows)</div>
  <p>Trace it. Report 1 was slowest (JVM warm-up plus reading and joining). Report 2 recomputed everything again (0.84 s). <code>cache()</code> only <em>marked</em> the DataFrame (<code>is_cached</code> is True, but nothing is stored yet). Report 3 computed the result <em>and</em> stored it. Reports 4 and 5 read the 35 cached rows from memory: about 7× faster than report 2. Cache pays off only from the second use onward; <code>unpersist()</code> frees the memory.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>cache()</code> = <code>persist()</code> with the default storage level (memory, spilling to disk for DataFrames). <code>persist(level)</code> chooses memory only, disk only, or serialised. Cached partitions live in executors; if one is lost, Spark recomputes it from the lineage.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Caching a DataFrame used once makes that job slower (report 3 vs report 2). Caching something bigger than memory spills to disk and evicts other cached data. And forgetting <code>unpersist()</code> in a long job slowly fills the executors.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common performance traps.</b> We now control shuffles, joins, layout and reuse. Most slow Spark jobs, though, come from a short list of habits carried over from pandas, the biggest being "just write a Python function and apply it".</div>

  <h2 id="sp-traps"><span class="num">11</span>Common Performance Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The plan looks fine, the joins broadcast, the files are partitioned, and the job is still slow. What habits quietly cost the most?</p>
  </div>
  <h3>Python UDFs</h3>
  <p>A <strong>UDF</strong> (user-defined function) runs your own Python code on each row. The cost: Spark's engine runs in the JVM, not in Python. For a plain Python UDF, rows are converted, sent to a Python worker process (the PIDs of section 03), computed, and sent back. A <strong>pandas UDF</strong> sends whole batches as pandas Series via Apache Arrow (a fast column format). In Spark 4, plain UDFs also go through Arrow by default (<code>spark.sql.execution.pythonUDF.arrow.enabled</code>, which printed <code>true</code> in our runs). A <strong>built-in</strong> expression like <code>F.col("amount") * 0.012</code> never leaves the JVM, and the optimizer can see inside it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Python UDF is sending every letter through a translator in another building. A pandas UDF sends the translator a full sack at a time. A built-in function is a clerk who already speaks the language.</p>
  </div>
  <p>The benchmark converts Biteful's 2 million order amounts from rupees to dollars four ways (best of 3 each), then asks what the Parquet reader receives when the "delivered" filter is a UDF:</p>
  <div class="fx" data-lang="py">import time
import pandas as pd
from pyspark.sql.types import DoubleType, BooleanType
from common import spark, F

# the same 2,000,000 amounts as data/big_orders (order_id % 800 + 100), generated in memory
big = spark.range(2_000_000).withColumn("amount", (F.col("id") % 800 + 100).cast("double"))

to_usd = F.udf(lambda x: x * 0.012, DoubleType())             # plain Python UDF: row by row

@F.pandas_udf(DoubleType())                                    # pandas UDF: a batch at a time
def to_usd_vec(x: pd.Series) -&gt; pd.Series:
    return x * 0.012

def timed(label, expr):
    best = 1e9
    for _ in range(3):                                         # best of 3 runs
        t = time.time()
        total = big.select(F.sum(expr)).collect()[0][0]
        best = min(best, time.time() - t)
    print(f"{label:11} {best:5.2f}s  total=\${total:,.0f}")

big.select(F.sum(to_usd("amount"))).collect()                  # warm-up: start the Python workers
spark.conf.set("spark.sql.execution.pythonUDF.arrow.enabled", "false")
timed("python udf", to_usd("amount"))
spark.conf.set("spark.sql.execution.pythonUDF.arrow.enabled", "true")
timed("arrow udf", to_usd("amount"))
timed("pandas_udf", to_usd_vec("amount"))
timed("built-in", F.col("amount") * 0.012)

# the optimizer can't see inside a UDF: compare what reaches the Parquet reader
is_delivered = F.udf(lambda s: s == "delivered", BooleanType())
for label, cond in [("built-in", F.col("status") == "delivered"), ("udf", is_delivered("status"))]:
    plan = spark.read.parquet("data/big_orders").filter(cond)._jdf.queryExecution().executedPlan().toString()
    print(f"{label:9} PushedFilters:", plan.split("PushedFilters: ")[1].split("]")[0] + "]")</div>
  <div class="fx" data-lang="text">python udf   0.45s  total=$11,988,000
arrow udf    0.38s  total=$11,988,000
pandas_udf   0.28s  total=$11,988,000
built-in     0.08s  total=$11,988,000
built-in  PushedFilters: [IsNotNull(status), EqualTo(status,delivered)]
udf       PushedFilters: []</div>
  <p>All four give the same total. The built-in expression was 3.5–5.6× faster than any Python version; the three Python variants were close because the function is trivial (with heavier per-row Python work, batches pull ahead). The second part matters even more: with the built-in condition, the filter reached the Parquet reader (<code>PushedFilters</code>), so non-matching rows can be skipped while reading; with the UDF, <code>PushedFilters: []</code>: every row is read and shipped to Python first. (A note on how this was run: the amounts are generated in memory with the same formula as <code>data/big_orders</code>, because on this machine the non-Arrow UDF over the 4-partition Parquet read hung with idle workers; the in-memory version ran normally. Timings on a shared machine vary; the gap to built-ins is what stays.)</p>
  <h3>The short list</h3>
  <table class="tbl">
    <tr><th>Mistake</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>Python UDFs</td><td>Slow; no filter pushdown</td><td>Built-in <code>F.*</code> functions; else <code>pandas_udf</code></td></tr>
    <tr><td><code>collect()</code> / <code>toPandas()</code> on big data</td><td>Driver out of memory</td><td><code>take(n)</code>, aggregate first, or <code>write</code></td></tr>
    <tr><td>Small files</td><td>Thousands of KB-sized files; slow listing and reads (200 vs 4 in section 09)</td><td><code>coalesce</code>/<code>repartition</code> before write; compaction (Delta <code>OPTIMIZE</code>)</td></tr>
    <tr><td>Skewed key</td><td>One task runs for hours, the rest idle</td><td>Broadcast, salt, AQE skew join</td></tr>
    <tr><td>Too few / too many partitions</td><td>Idle cores / scheduling overhead</td><td>~100–200 MB each; tune <code>spark.sql.shuffle.partitions</code> or rely on AQE</td></tr>
    <tr><td>Re-computing lineage</td><td>Same expensive step per action</td><td><code>cache()</code> reused DataFrames</td></tr>
    <tr><td>Schema drift between files</td><td>Read fails (<code>Data type mismatches…</code>)</td><td>Pin types when writing</td></tr>
    <tr><td>Spark for tiny data</td><td>Seconds of overhead for 50 MB</td><td>pandas, Polars or DuckDB</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>UDF</strong>: a user-defined function applied per row (Python UDF) or per batch (pandas UDF). <strong>Arrow</strong>: a columnar in-memory format that lets the JVM and Python exchange batches cheaply. Built-in functions in <code>pyspark.sql.functions</code> run inside the JVM with code generation and are visible to the optimizer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Search <code>pyspark.sql.functions</code> before writing a UDF: string cleaning (<code>trim</code>, <code>initcap</code>, <code>regexp_replace</code>), dates, <code>when</code>/<code>otherwise</code>, arrays and JSON are all built in. Most UDFs in real code bases re-implement one of them, slowly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built Spark one idea at a time. Seen as one picture, which idea produces which, and which knob fixes which problem?</div>

  <h2 id="sp-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Partitions, tasks, stages, laziness, shuffles, broadcast, skew, layout, caching: eleven separate topics, or one machine with a few levers?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 310" width="720">
<defs><marker id="sp-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="75" y="40" text-anchor="middle" font-weight="700">Files on disk</text><text x="75" y="57" text-anchor="middle" class="tm">day-folders, Parquet</text>
<line x1="140" y1="45" x2="173" y2="45" stroke="currentColor" marker-end="url(#sp-a9)"/>
<rect x="175" y="20" width="140" height="50" rx="8" class="fb sb"/><text x="245" y="40" text-anchor="middle" font-weight="700">Partitions</text><text x="245" y="57" text-anchor="middle" class="tm">1 partition = 1 task = 1 core</text>
<line x1="315" y1="45" x2="348" y2="45" stroke="currentColor" marker-end="url(#sp-a9)"/>
<rect x="350" y="20" width="160" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="430" y="40" text-anchor="middle" font-weight="700">Lazy plan (DataFrame/SQL)</text><text x="430" y="57" text-anchor="middle" class="tm">0 rows until an action</text>
<line x1="510" y1="45" x2="543" y2="45" stroke="currentColor" marker-end="url(#sp-a9)"/>
<rect x="545" y="20" width="165" height="50" rx="8" class="fg sg"/><text x="627" y="40" text-anchor="middle" font-weight="700">Action → job</text><text x="627" y="57" text-anchor="middle" class="tm">stages of tasks on executors</text>
<line x1="430" y1="70" x2="430" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sp-a9)"/>
<rect x="300" y="110" width="260" height="50" rx="8" class="fr sr"/><text x="430" y="130" text-anchor="middle" font-weight="700">Wide step → Exchange (shuffle) → new stage</text><text x="430" y="147" text-anchor="middle" class="tm">groupBy city: stages of 4 tasks, then 1</text>
<line x1="350" y1="160" x2="230" y2="198" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sp-a9)"/>
<rect x="10" y="200" width="230" height="50" rx="8" class="fg sg"/><text x="125" y="220" text-anchor="middle">avoid it: broadcast small side</text><text x="125" y="237" text-anchor="middle" class="tm">0.41 s vs sort-merge 0.95 s</text>
<line x1="430" y1="160" x2="430" y2="198" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sp-a9)"/>
<rect x="250" y="200" width="220" height="50" rx="8" class="fr sr"/><text x="360" y="220" text-anchor="middle">hot key → skew</text><text x="360" y="237" text-anchor="middle" class="tm">92% → 26% with salting</text>
<line x1="510" y1="160" x2="590" y2="198" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sp-a9)"/>
<rect x="480" y="200" width="230" height="50" rx="8" class="fb sb"/><text x="595" y="220" text-anchor="middle">reuse it: cache()</text><text x="595" y="237" text-anchor="middle" class="tm">0.84 s → 0.12 s</text>
<text x="10" y="280" class="tm">Read left to right: files become partitions, code becomes a lazy plan, an action turns the plan into stages of tasks.</text>
<text x="10" y="298" class="tm">Almost every tuning knob is about one thing: how many rows cross a shuffle, and how evenly they land.</text>
</g>
</svg><figcaption>Spark in one picture. The shuffle is the expensive centre; broadcast avoids it, salting evens it, caching avoids repeating it, file layout shrinks what enters it.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Scale out</td><td>memory per row × rows</td><td>why not pandas?</td><td>88 B/order; 50 GB ≈ 571 M orders</td><td>data beyond one machine</td></tr>
    <tr><td>Split + partial results</td><td>data parallelism, locality</td><td>how do many machines make one answer?</td><td>A, B, C → Pune 1400, Mumbai 1230; 113 B shipped</td><td>sums, counts, averages</td></tr>
    <tr><td>Driver / executors / cluster manager</td><td>roles around partitions</td><td>who plans, who works?</td><td>4 partitions in 4 worker PIDs</td><td>always; size the driver for results only</td></tr>
    <tr><td>DataFrame &amp; partitions</td><td>schema + chunks</td><td>how do we describe the table?</td><td>7 day-files → 4 partitions</td><td>always</td></tr>
    <tr><td>Lazy vs action</td><td>plan (lineage) vs execution</td><td>when does work happen?</td><td>0 rows → 10 at count() → 20 at show()</td><td>build the whole plan, then one action</td></tr>
    <tr><td>Narrow / wide, shuffle</td><td>partition dependencies</td><td>which steps are expensive?</td><td>narrow 1 stage [4]; groupBy 2 stages [4, 1]</td><td>count Exchanges when slow</td></tr>
    <tr><td>Spark SQL</td><td>same optimizer</td><td>is SQL different?</td><td>same plan: True</td><td>whichever reads better</td></tr>
    <tr><td>Broadcast join</td><td>copy the small side</td><td>join without shuffling the big side?</td><td>2 M ⋈ 5: 0.41 s vs 0.95 s</td><td>one side under ~10 MB to a few hundred MB</td></tr>
    <tr><td>Skew &amp; salting</td><td>hash partitioning by key</td><td>why is one task slow?</td><td>1,840,000 rows (92%) → 520,000 (26%)</td><td>hot keys, NULL keys</td></tr>
    <tr><td>Partitioning &amp; layout</td><td>repartition/coalesce/partitionBy</td><td>how should data be split on disk?</td><td>200 vs 4 files; 2 Mar read alone (285,715 rows)</td><td>date folders; ~128 MB–1 GB files</td></tr>
    <tr><td>Cache</td><td>keep a computed result in executors</td><td>how not to recompute?</td><td>0.84 s → 0.12 s</td><td>results used 2+ times</td></tr>
    <tr><td>Built-ins vs UDFs</td><td>JVM vs Python workers</td><td>why is my function slow?</td><td>0.08 s vs 0.28–0.45 s; UDF: no pushdown</td><td>built-ins first</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>Spark splits a table into partitions, turns your code into a lazy plan, and runs it as stages of tasks; the stages are cut by shuffles, and almost all performance work is about shuffling fewer rows, more evenly, fewer times.</strong> Broadcast removes a shuffle, salting evens one, caching avoids repeating one, partition pruning and column pruning shrink what goes into one, and built-in functions keep the work inside the optimizer's view.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sp-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's warehouse from <a class="xref" data-note="de_etl">de_etl</a>: 10 orders, 2–8 March 2026; delivered revenue Pune 1400 (101: 240, 103: 520, 104: 380, 108: 260), Mumbai 1230 (102: 450, 106: 180, 109: 600). At scale: 2,000,000 orders, 1,840,000 at Biryani Bros (restaurant 11), joined to 5 restaurants.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Scale out</td><td>why not pandas?</td><td>50 GB ≈ 571 M orders in one RAM</td><td>need many machines → distributed idea</td></tr>
    <tr><td>Split data, move code</td><td>one answer from many machines?</td><td>A 1140/450, B 180, C 260/600 → 1400/1230</td><td>who coordinates? → architecture</td></tr>
    <tr><td>Driver / executors</td><td>who plans, who works?</td><td>4 partitions, 4 worker PIDs</td><td>how to write table code? → DataFrames</td></tr>
    <tr><td>DataFrames &amp; partitions</td><td>a distributed table</td><td>7 files → 4 partitions</td><td>when does it run? → laziness</td></tr>
    <tr><td>Lazy vs actions</td><td>when does work happen?</td><td>0 → 10 → 20 rows seen</td><td>which steps cost? → narrow/wide</td></tr>
    <tr><td>Narrow/wide, shuffle</td><td>what is expensive?</td><td>Exchange by city; [4] vs [4, 1] tasks</td><td>SQL too? → Spark SQL</td></tr>
    <tr><td>Spark SQL</td><td>is SQL different?</td><td>same plan: True</td><td>joins are the big shuffles → joins</td></tr>
    <tr><td>Joins &amp; skew</td><td>join big to small; one hot key</td><td>broadcast 0.41 s vs 0.95 s; salting 92% → 26%</td><td>reading everything → layout</td></tr>
    <tr><td>Partitioning &amp; layout</td><td>split in memory and on disk</td><td>200 vs 4 files; PartitionFilters on 2 Mar</td><td>recompute per action → cache</td></tr>
    <tr><td>Cache</td><td>compute once, reuse</td><td>0.84 s → 0.12 s</td><td>other slow habits → traps</td></tr>
    <tr><td>Traps</td><td>what else is slow?</td><td>built-in 0.08 s vs UDF 0.45 s, no pushdown</td><td>→ <a class="xref" data-note="de_kafka">Kafka</a>: data that never stops</td></tr>
  </table>
  <h3>Definitions and rules</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Driver / executor / cluster manager</td><td>plans and schedules / runs tasks and caches data / allocates machines (YARN, Kubernetes, standalone)</td></tr>
    <tr><td>Partition / task</td><td>a chunk of rows / one partition processed by one core</td></tr>
    <tr><td>Job → stage → task</td><td>an action → groups of tasks between shuffles → one per partition</td></tr>
    <tr><td>Transformation / action</td><td>lazy step added to the plan / runs the plan (show, count, collect, write)</td></tr>
    <tr><td>Lineage</td><td>the recipe of transformations; re-run by every action and used to recompute lost partitions</td></tr>
    <tr><td>Narrow / wide</td><td>output partition needs one input partition / needs many → shuffle</td></tr>
    <tr><td>Shuffle (Exchange)</td><td>redistribute rows by key via disk + network; stage boundary</td></tr>
    <tr><td>Partial aggregation</td><td><code>partial_sum</code> per partition before the shuffle, final <code>sum</code> after</td></tr>
    <tr><td>Broadcast hash join</td><td>small side copied to every executor; big side not shuffled</td></tr>
    <tr><td>Sort-merge join</td><td>both sides shuffled by key and sorted; big ⋈ big</td></tr>
    <tr><td>Skew / salting</td><td>one key holds most rows / add a random 0..N−1 to spread it; copy the small side N times</td></tr>
    <tr><td>repartition / coalesce</td><td>full shuffle, any count, even / merge only, fewer, no shuffle</td></tr>
    <tr><td>Partition pruning</td><td>read only the folders matching a filter (<code>PartitionFilters</code>)</td></tr>
    <tr><td>Cache</td><td>keep a computed DataFrame in executor memory; lazy; <code>unpersist()</code></td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Spark</b><p>Use for 50–100 GB+ or a lakehouse platform.</p><small>Avoid for small data: pandas/DuckDB win</small></div>
    <div><b>Broadcast join</b><p>Use when one side is small (dimension tables).</p><small>Avoid when the "small" side is many GB: executor memory</small></div>
    <div><b>Salting</b><p>Use when one key dominates a shuffle.</p><small>Costs copying the small side N times; try AQE skew join first</small></div>
    <div><b>partitionBy(date)</b><p>Use on low-cardinality columns that queries filter on.</p><small>Never on ids: millions of tiny folders</small></div>
    <div><b>cache()</b><p>Use for results reused 2+ times.</p><small>Not for one-off results; unpersist after</small></div>
    <div><b>UDF</b><p>Use only when no built-in exists; prefer pandas_udf.</p><small>Blocks pushdown; slower</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>collect()/toPandas() on big data (driver OOM); every action recomputes (10 → 20 rows); hidden shuffles (distinct, orderBy, windows); 5-row table joined with sort-merge when broadcast is possible; hot keys including NULL; partitionBy on high-cardinality columns; 200 tiny files; coalesce(1); caching single-use results; Python UDFs (no pushdown); schema drift between files; Spark for tiny data.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>After <code>filter</code> and <code>groupBy</code> on Biteful's orders, how many rows has Spark read?</td><td>0. Transformations only build the plan; <code>count()</code> read all 10.</td></tr>
    <tr><td>Which line in a plan means "shuffle"?</td><td><code>Exchange</code> (e.g. <code>Exchange hashpartitioning(city, 8)</code>).</td></tr>
    <tr><td>2 M orders ⋈ 5 restaurants: which join, and which side moves?</td><td>Broadcast hash join; only the 5-row table is copied, the orders never move.</td></tr>
    <tr><td>One partition holds 92% of rows after a shuffle by restaurant_id. Name it and one fix.</td><td>Skew; salt the key (or broadcast the other side, or AQE skew join).</td></tr>
    <tr><td>You need fewer output files at the end of a job, without a shuffle. Which call?</td><td><code>coalesce(n)</code>.</td></tr>
  </table>

  <h2 id="sp-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, out loud and without notes, why each Spark idea exists and what goes wrong without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a transformation and an action? Give two of each.</summary><div class="qa-body">Transformations (<code>filter</code>, <code>groupBy</code>) return a new DataFrame and only add to the plan. Actions (<code>count</code>, <code>write</code>) make Spark optimise the plan and run a job. On Biteful, filter + groupBy touched 0 rows; <code>count()</code> read 10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain driver, executor, partition and task.</summary><div class="qa-body">The driver runs your program, builds the plan and schedules tasks. Executors are worker processes that run tasks and cache data. A partition is a chunk of rows. A task processes one partition on one core. Parallelism is limited by both the number of partitions and the number of cores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a shuffle, and which operations cause one?</summary><div class="qa-body">Moving rows across the network so all rows with the same key land in the same partition. Caused by wide operations: <code>groupBy</code>, non-broadcast <code>join</code>, <code>distinct</code>, <code>orderBy</code>, <code>repartition</code>, window <code>partitionBy</code>. It costs disk writes, network and serialisation, and starts a new stage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a physical plan, and what does Exchange mean?</summary><div class="qa-body">Bottom-up: scan, filter, project, join, aggregate. <code>Exchange</code> is a shuffle and a stage boundary. Look for filters pushed into the scan (<code>PushedFilters</code>, <code>PartitionFilters</code>), <code>BroadcastHashJoin</code> vs <code>SortMergeJoin</code>, and <code>partial_sum</code> before an Exchange.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You join a 2 TB events table with a 5 MB country table. What does Spark do, and how do you make sure?</summary><div class="qa-body">It should use a broadcast hash join: copy the 5 MB table to every executor so the 2 TB side never shuffles. Spark does it automatically under <code>autoBroadcastJoinThreshold</code> (10 MB) when it knows the size (it knew our restaurants file was tiny). Force it with <code>F.broadcast(countries)</code> and confirm <code>BroadcastHashJoin</code> in <code>explain()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A job's 199 tasks finish in 2 minutes; the last one takes 2 hours. Diagnose and fix.</summary><div class="qa-body">Data skew: one key (often NULL or "unknown", or a mega-sale restaurant) holds most rows. Check with <code>groupBy(key).count()</code>. Fix: broadcast the other side if small; enable AQE skew join; salt the hot key (random 0..N−1, copy the other side N times, join on (key, salt)); handle NULL keys separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>repartition vs coalesce?</summary><div class="qa-body"><code>repartition(n)</code>: full shuffle, up or down, even sizes, optionally by a column. <code>coalesce(n)</code>: down only, merges existing partitions without a shuffle, can be uneven. Coalesce to cut output files at the end; repartition to raise parallelism or co-locate keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a Python UDF slow, and what do you use instead?</summary><div class="qa-body">Rows are serialised from the JVM to a Python worker and back, and the optimizer can't see inside the function: no code generation, no filter pushdown (our UDF filter showed <code>PushedFilters: []</code>). Use built-in <code>pyspark.sql.functions</code>; if Python is unavoidable, a <code>pandas_udf</code> processes Arrow batches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>df = spark.read.parquet(p); df2 = df.filter("x &gt; 0"); print("done")</code> cost on a 1 TB path?</summary><div class="qa-body">Almost nothing. <code>filter</code> is lazy, and reading Parquet only runs a small job to fetch the schema from file footers (we saw exactly 1 job after <code>read</code>). No data is processed until an action.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you cache, and when is it harmful?</summary><div class="qa-body">Cache a DataFrame used by 2+ actions (a gold table feeding several reports: 0.84 s → 0.12 s). Harmful when used once (the filling run is slower), when bigger than memory (spills, evicts other data), or when never unpersisted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does partitionBy("order_date") on write give you, and what's the danger?</summary><div class="qa-body">One folder per day, so a query for one day reads only that folder (partition pruning, shown as <code>PartitionFilters</code>). Danger: on a high-cardinality column like <code>customer_id</code> it creates millions of tiny files. Also files per folder = tasks writing to it (our 7 days × 4 tasks = 28 files).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does laziness make broadcast joins and pushdown possible?</summary><div class="qa-body">Because nothing runs until the action, the optimizer sees the whole plan at once: it can move the "delivered" filter into the Parquet scan, read only the needed columns, and notice that one join side is a 5-row file before choosing the join method. An eager engine would already have read and joined everything by the time it learned what you wanted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a groupBy by city ship so little data even though it is a wide step?</summary><div class="qa-body">Partial aggregation, the idea of section 02: each partition first computes <code>partial_sum</code> per city (one row per city per partition), and only those rows cross the Exchange. Totals combine from partial totals. A median or a distinct count of customers cannot be combined that way, so those shuffle far more.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what do skew and the small-files problem have in common?</summary><div class="qa-body">Both are about partitions of the wrong size. Skew is one partition far too big (one task does 92% of the work); small files are far too many tiny partitions (scheduling and file-opening overhead dominate). The fixes act on partitioning: salt or split the big one; coalesce or compact the tiny ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: the ETL note's pipeline was idempotent by overwriting day-folders. How does that layout help Spark?</summary><div class="qa-body">The same <code>order_date=…</code> folders that make reruns safe also give partition pruning: a job for 2 March opens one folder. And because each day's files are replaced as a whole, Spark (with dynamic partition overwrite) can rewrite just the days a job touched. One layout serves both safety and speed, provided every folder has the same schema.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you NOT use Spark?</summary><div class="qa-body">When the data fits on one machine (up to tens of GB): pandas, Polars or DuckDB are faster and simpler, with no JVM start-up, cluster or scheduling overhead. Use Spark when data is too big for one box or already lives on a Spark-based platform.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a>.</b> Spark made tonight's batch fast, but it is still tonight's batch. When Biteful's restaurant must see an order the second it is placed, and the ETA service must react when it is picked up, waiting for midnight is not an option. The data has to flow as a stream of events.</div>
</main>
`
});
