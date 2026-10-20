// notes/dataeng/de_etl.js — ETL & Orchestration
Object.assign(TOPIC_CONTENT, {
  "de_etl": `<main>
  <h1>ETL &amp; Orchestration</h1>
  <div class="where"><span>Data Engineering</span><span>ETL &amp; Orchestration</span></div>
  <p class="lead">Every morning at Biteful, the small food-delivery company from the SQL and pandas notes, someone downloads yesterday's orders, pastes them into Excel, fixes the city spellings, looks up each restaurant, totals the revenue per city and e-mails the result. This note turns that chore into a pipeline that runs by itself every night: <strong>extract</strong> the data from where it lives, <strong>transform</strong> it into one clean table, <strong>load</strong> it into a Parquet "warehouse", then make it safe to re-run, cheap to update, checked for bad data, and scheduled with retries and alerts by an <strong>orchestrator</strong> (Airflow or Prefect). Each idea is introduced because the previous one left a problem. ONE running example is used throughout: Biteful's 10 orders from 2 to 8 March 2026 (the same rows as the SQL notes) coming from three sources. Every output on this page comes from a real run: Python 3.13 with pandas 3.0, pyarrow and DuckDB, plus a real <strong>Airflow 3.1.8</strong> and a real <strong>Prefect 3.8</strong>. The only stand-ins are named where they appear: SQLite plays the app's PostgreSQL database, and a 25-line local web server plays the delivery partner's API.</p>

  <h2 id="et-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="et-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">pandas · SQL</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">clean one table, once</text>
<line x1="130" y1="45" x2="158" y2="45" stroke="currentColor" marker-end="url(#et-a0)"/>
<rect x="160" y="20" width="130" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="225" y="41" text-anchor="middle" font-size="12" font-weight="700">ETL &amp; Orchestration</text><text x="225" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="290" y1="45" x2="318" y2="45" stroke="currentColor" marker-end="url(#et-a0)"/>
<rect x="320" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="395" y="41" text-anchor="middle" font-size="12">Apache Spark</text><text x="395" y="58" text-anchor="middle" class="tm" font-size="10">same pipeline, 50 GB+</text>
<line x1="470" y1="45" x2="498" y2="45" stroke="currentColor" marker-end="url(#et-a0)"/>
<rect x="500" y="20" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="41" text-anchor="middle" font-size="12">Kafka &amp; Streaming</text><text x="575" y="58" text-anchor="middle" class="tm" font-size="10">same data, seconds old</text>
<line x1="225" y1="70" x2="225" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#et-a0)"/>
<rect x="140" y="110" width="170" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="225" y="130" text-anchor="middle" font-size="12">MLOps · feature pipelines</text><text x="225" y="147" text-anchor="middle" class="tm" font-size="10">training data, every night</text>
<text x="340" y="130" class="tm" font-size="10.5">pandas cleans a table once, by hand;</text><text x="340" y="146" class="tm" font-size="10.5">ETL cleans it every night, by itself</text>
</svg><figcaption>The Data Engineering track, in reading order: ETL → Spark → Kafka. All three use the same Biteful orders.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: cleaning a table once</b><span><a class="xref" data-note="da_pandas">Pandas</a> taught you to read, clean and merge a DataFrame; <a class="xref" data-note="da_pd_groupby">GroupBy</a> to total it; <a class="xref" data-note="sql_joins">JOINs</a> why a join can double your rows; <a class="xref" data-note="sql_modeling">Data Modeling</a> what a fact table is; <a class="xref" data-note="py_files">File Handling</a> what CSV, JSON and Parquet are. All of that was done once, by you, in a notebook.</span></li>
    <li><b>This note adds: doing it every night, safely, with nobody watching</b><span>Extract from a database, a file and an API; transform with pandas; load Parquet partitions; ELT; idempotency (so a re-run cannot double revenue); incremental loads with watermarks; data-quality gates; DAGs, schedules, retries and backfills; Airflow and Prefect; alerts.</span></li>
    <li><b>Leads to: <a class="xref" data-note="de_spark">Apache Spark</a> and <a class="xref" data-note="de_kafka">Kafka</a></b><span>When a night's orders no longer fit in pandas, the transform step moves to Spark (same steps, many machines). When "tomorrow morning" is too late, the same order events flow through Kafka within seconds. Pipelines like this one also feed models: see <a class="xref" data-note="mlops_lifecycle">the ML lifecycle</a> and <a class="xref" data-note="sd_serving">feature pipelines and serving</a>. Airflow itself usually runs in containers (<a class="xref" data-note="se_docker">Docker</a>).</span></li>
  </ol>

  <h2 id="et-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. All numbers come from Biteful's orders of 2–8 March 2026.</p>
  <ol class="story">
    <li><b>The manual ritual</b><span>Q: why not keep doing it in Excel? → it takes an hour, depends on one person, and a quick script that copies the steps gives three cities for two (<code>' pune '</code>, <code>'Pune'</code>, <code>'MUMBAI'</code>). We need repeatable steps, each with one job: get the data, fix it, store it.</span></li>
    <li><b>Extract</b><span>Q: how do we get the data out of where it lives? → a SQL query for the app DB (3 orders on 2 March), a CSV read for the partner sheet (6 rows), a page-by-page loop for the API (2 pages). But the raw data is messy and spread over three tables…</span></li>
    <li><b>Transform</b><span>Q: how do three messy sources become one clean table? → clean (dedupe the sheet, fix types), normalise (<code>' pune '</code> → <code>Pune</code>, IST → UTC), enrich (join restaurant and delivery time): Pune 760, Mumbai 450. A forgotten dedupe would fan order 105 out into 2 rows. Now the table exists only in memory…</span></li>
    <li><b>Load</b><span>Q: where do we keep the result so others can query it? → a Parquet file per day: <code>warehouse/fact_orders/order_date=2026-03-02/</code>, types kept, columns readable one at a time. But we cleaned in Python <em>before</em> storing; is that the only order?</span></li>
    <li><b>ETL vs ELT</b><span>Q: should we transform before or after loading? → ELT lands the raw data first and transforms with SQL in the warehouse (DuckDB gave the identical 3 rows). Either way the job will be re-run one day, by a retry or by you…</span></li>
    <li><b>Idempotency</b><span>Q: what happens if the same day runs twice? → plain append: 6 rows, revenue 2420 instead of 1210. Partition overwrite and upsert make a re-run harmless. But re-loading whole days misses changes to <em>old</em> orders (order 110 was delivered later)…</span></li>
    <li><b>Incremental loads &amp; watermarks</b><span>Q: how do we pick up only what changed since last time? → remember the newest <code>updated_at</code> seen (the watermark) and ask for rows after it: run 1 gets 10 rows, run 2 gets just 110 and 111, run 3 gets 0. Then merge by <code>order_id</code>. But a job can now load bad data quickly and silently…</span></li>
    <li><b>Data quality checks</b><span>Q: how do we stop bad data before anyone sees it? → checks between transform and load: row count = source count, unique keys, valid amounts and statuses, enrich succeeded. 3 bad batches caught, the empty 6 March correctly passed. Now we have 7 steps that must run in order, every night…</span></li>
    <li><b>Orchestration: DAGs, schedules, retries, backfills</b><span>Q: who runs the steps in the right order, at the right time, and again when they fail? → a DAG (3 extracts in parallel, then transform → check → load), a schedule tied to the day the run is FOR, retries with backoff (the 503 healed on attempt 2), backfills that re-run past days safely. Writing that runner ourselves is fragile…</span></li>
    <li><b>Airflow (and Prefect)</b><span>Q: what do real teams use? → Airflow: operators/tasks, XComs for small values, sensors that wait for files, a scheduler and executors; ran the Biteful DAG for real. Prefect: the same with plain decorated functions. Retries cover temporary errors; what about the failures retries can't fix?</span></li>
    <li><b>Error handling &amp; alerting</b><span>Q: what happens when it fails anyway? → bad data fails at once (no retries), transient errors retry then alert, nothing half-loaded is published (the 3 March partition stayed correct), and a human is paged with the day and the task.</span></li>
  </ol>

  <h2 id="et-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ETL &amp; Orchestration</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Extract</div>
        <ul>
          <li><b>Database</b> — a SQL query for one day: <code>WHERE ordered_at</code> on 2 March → 3 rows</li>
          <li><b>File</b> — read as text first (<code>dtype=str</code>); types are fixed later</li>
          <li><b>API</b> — loop over pages until <code>next_page</code> is empty; retry 429/5xx</li>
          <li><b>Full vs incremental vs CDC</b> — copy all / rows after a watermark / read the DB's change log</li>
          <li>⚠ never run heavy extracts on the production primary; use a replica</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transform</div>
        <ul>
          <li><b>Clean</b> — dedupe, fix types, handle missing values</li>
          <li><b>Normalise</b> — <code>' pune '</code> → <code>Pune</code>; times in UTC; one currency</li>
          <li><b>Enrich</b> — join reference data (restaurant city, delivery minutes)</li>
          <li>⚠ joining a sheet with a duplicate key fans out rows → <code>validate="many_to_one"</code></li>
          <li>💡 washing, chopping and seasoning before cooking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Load &amp; ELT</div>
        <ul>
          <li><b>Targets</b> — warehouse (BigQuery, Snowflake), lake (Parquet on S3), Postgres</li>
          <li><b>Parquet</b> — columnar, typed, compressed; one folder per day</li>
          <li><b>Layers</b> — bronze (raw) → silver (clean) → gold (business tables)</li>
          <li><b>ELT</b> — load raw, transform with SQL inside the warehouse (dbt)</li>
          <li>💡 ETL = cook then deliver; ELT = deliver groceries, cook in a big kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Idempotency</div>
        <ul>
          <li><b>Definition</b> — running twice leaves the same result as once</li>
          <li><b>Partition overwrite</b> — replace the day's folder (Biteful: 1210 stays 1210)</li>
          <li><b>Upsert / MERGE</b> — <code>INSERT … ON CONFLICT (key) DO UPDATE</code></li>
          <li><b>Logical date</b> — pass the day the run is FOR; never compute it from the clock</li>
          <li>⚠ plain append: 1210 → 2420 on a retry</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Incremental &amp; Quality</div>
        <ul>
          <li><b>Watermark</b> — newest <code>updated_at</code> loaded; next run asks for rows after it</li>
          <li><b>Merge</b> — upsert changed rows by key (110: pending → delivered)</li>
          <li>⚠ hard deletes are invisible to a watermark (107 stayed)</li>
          <li><b>Checks</b> — counts reconcile, unique keys, valid values, enrich succeeded, freshness</li>
          <li>⚠ a green run with 0 or doubled rows is the worst failure</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Orchestration</div>
        <ul>
          <li><b>DAG</b> — tasks + dependencies, no cycles; independent tasks run in parallel</li>
          <li><b>Schedule</b> — the run for day D starts after D ends; parameterised by D</li>
          <li><b>Retries</b> — transient errors only, with exponential backoff</li>
          <li><b>Backfill</b> — re-run past days; safe only if each run is idempotent</li>
          <li><b>Alert</b> — tell a human which day and which task failed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Airflow &amp; Prefect</div>
        <ul>
          <li><b>Operator / task</b> — a template / its use in a DAG</li>
          <li><b>XCom</b> — small values between tasks (paths, counts), not DataFrames</li>
          <li><b>Sensor</b> — waits for a file or partition; <code>mode="reschedule"</code></li>
          <li><b>Scheduler + executor</b> — decides what is due / where it runs (Local, Celery, Kubernetes)</li>
          <li><b>Prefect</b> — <code>@flow</code> / <code>@task(retries=2)</code> on plain functions</li>
          <li>⚠ <code>ds</code> is the UTC date: in India, use the IST data interval</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="et-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="et-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Morning Excel Ritual</span><span class="rm-sub">Why pipelines exist</span></div></div>
      <div class="rm-item rm-done" data-target="et-ext"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Extract</span><span class="rm-sub">DB, file, API</span></div></div>
      <div class="rm-item rm-done" data-target="et-tr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Transform</span><span class="rm-sub">Clean, normalise, enrich</span></div></div>
      <div class="rm-item rm-done" data-target="et-load"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Load</span><span class="rm-sub">Parquet warehouse, layers</span></div></div>
      <div class="rm-item rm-done" data-target="et-elt"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">ETL vs ELT</span><span class="rm-sub">Where the transform runs</span></div></div>
      <div class="rm-item rm-done" data-target="et-idem"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Idempotency</span><span class="rm-sub">1210 became 2420</span></div></div>
      <div class="rm-item rm-done" data-target="et-incr"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Incremental Loads</span><span class="rm-sub">Watermarks and merges</span></div></div>
      <div class="rm-item rm-done" data-target="et-dq"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Data Quality Checks</span><span class="rm-sub">Stop bad data at the gate</span></div></div>
      <div class="rm-item rm-done" data-target="et-dag"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Orchestration</span><span class="rm-sub">DAGs, schedules, retries, backfills</span></div></div>
      <div class="rm-item rm-done" data-target="et-air"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Airflow &amp; Prefect</span><span class="rm-sub">Operators, XComs, sensors, executors</span></div></div>
      <div class="rm-item rm-done" data-target="et-err"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Error Handling &amp; Alerting</span><span class="rm-sub">Fail loudly, publish nothing wrong</span></div></div>
      <div class="rm-item rm-done" data-target="et-build"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Build It: Biteful's Week</span><span class="rm-sub">The whole pipeline, one run</span></div></div>
      <div class="rm-item rm-done" data-target="et-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One pipeline, many guards</span></div></div>
      <div class="rm-item rm-done" data-target="et-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Bugs that pass silently</span></div></div>
      <div class="rm-item rm-done" data-target="et-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="et-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="et-need"><span class="num">01</span>The Morning Excel Ritual: Why Pipelines Exist</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the pandas and SQL notes, the data was already sitting in one tidy table and you cleaned it once. In a real company nobody hands you that table. The orders are in the app's database, the restaurant details are in a sheet another team keeps, and delivery times are in a partner's system. Who builds the tidy table, every day, without mistakes?</p>
  </div>
  <h3>The running example: Biteful</h3>
  <p>Biteful delivers food in Pune and Mumbai. Its data is the same as in the SQL notes: 7 customers, 5 restaurants, 10 orders between 2 and 8 March 2026. Here are the orders as the app stores them (times in India Standard Time, IST):</p>
  <table class="tbl">
    <tr><th>order</th><th>day</th><th>restaurant</th><th>status</th><th>amount ₹</th><th>delivery min</th></tr>
    <tr><td>101</td><td>02 Mar</td><td>10 Dosa Hut</td><td>delivered</td><td>240</td><td>32</td></tr>
    <tr><td>102</td><td>02 Mar</td><td>11 Biryani Bros</td><td>delivered</td><td>450</td><td>41</td></tr>
    <tr><td>103</td><td>02 Mar</td><td>12 Pizza Point</td><td>delivered</td><td>520</td><td>38</td></tr>
    <tr><td>104</td><td>03 Mar</td><td>12 Pizza Point</td><td>delivered</td><td>380</td><td>not recorded</td></tr>
    <tr><td>105</td><td>03 Mar</td><td>13 Green Bowl</td><td>cancelled</td><td>310</td><td>—</td></tr>
    <tr><td>106</td><td>04 Mar</td><td>11 Biryani Bros</td><td>delivered</td><td>180</td><td>25</td></tr>
    <tr><td>107</td><td>04 Mar</td><td>12 Pizza Point</td><td>cancelled</td><td>260</td><td>—</td></tr>
    <tr><td>108</td><td>05 Mar</td><td>10 Dosa Hut</td><td>delivered</td><td>260</td><td>29</td></tr>
    <tr><td>109</td><td>05 Mar</td><td>11 Biryani Bros</td><td>delivered</td><td>600</td><td>52</td></tr>
    <tr><td>110</td><td>08 Mar</td><td>10 Dosa Hut</td><td>pending</td><td>310</td><td>—</td></tr>
  </table>
  <p>Nobody ordered on 6 and 7 March. That is not a mistake, and it will matter in section 08.</p>
  <p>Every morning Priya, the operations analyst, produces "yesterday's delivered revenue per city". Her steps:</p>
  <ol>
    <li>Download yesterday's orders from the admin panel as a CSV.</li>
    <li>Open the restaurant sheet the partner team keeps (restaurant → city, cuisine).</li>
    <li>Look up delivery times in the logistics partner's portal.</li>
    <li>VLOOKUP each order's restaurant to get its city; fix the spellings by eye.</li>
    <li>Keep only delivered orders, total per city, e-mail the table.</li>
  </ol>
  <p>It works, until Priya is on leave, or makes a typo, or the business asks for two years of history. The data lives in three places, with three ways of getting it out:</p>
  <div class="cards">
    <div><b>App database</b><p>The <code>orders</code> table (PostgreSQL in production; SQLite here, same SQL).</p><small>Typed, reliable, always up to date</small></div>
    <div><b>Partner sheet</b><p><code>inbox/restaurants_sheet.csv</code>, kept by hand.</p><small>Messy: <code>' pune '</code>, <code>MUMBAI</code>, Green Bowl pasted twice, Momo Magic has no rating</small></div>
    <div><b>Delivery API</b><p>The logistics partner's web API, 2 rows per page.</p><small>Can be slow or down</small></div>
  </div>
  <p>A first attempt: copy Priya's steps into one quick script for 2 March. <code>pd.read_sql</code> runs a SQL query and returns a DataFrame; <code>merge</code> is the VLOOKUP.</p>
  <div class="fx" data-lang="py">import sqlite3, pandas as pd
pd.set_option("display.width", 120)

con = sqlite3.connect("src/biteful_app.db")
orders = pd.read_sql("SELECT * FROM orders WHERE ordered_at LIKE '2026-03-02%'", con)
sheet = pd.read_csv("inbox/restaurants_sheet.csv")
df = orders.merge(sheet, on="restaurant_id")              # the VLOOKUP step
print(df[["order_id", "status", "amount", "name", "city"]])
print(df[df["status"] == "delivered"].groupby("city")["amount"].sum())</div>
  <div class="fx" data-lang="text">   order_id     status  amount          name    city
0       101  delivered     240      Dosa Hut   pune 
1       102  delivered     450  Biryani Bros  MUMBAI
2       103  delivered     520   Pizza Point    Pune
city
 pune     240
MUMBAI    450
Pune      520
Name: amount, dtype: int64</div>
  <p>Trace it. Order 101 is at Dosa Hut, whose city the sheet spells <code>' pune '</code> (with spaces). Order 103 is at Pizza Point, spelled <code>'Pune'</code>. To a computer these are different words, so Pune's ₹760 is split into 240 and 520, and Mumbai is shouted as <code>MUMBAI</code>. Priya fixes this by eye every morning. A script must be told. And this script mixes everything in one place: if the sheet is late, if the API is down, if it runs twice, nothing tells us.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant kitchen does not cook a dish from field to plate in one movement. Suppliers deliver (extract), cooks wash, chop and season (transform), and the dish is plated and served (load). A head chef decides the order and checks each plate (orchestration). Each station has one job, so when a dish is wrong you know which station to look at.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>data pipeline</strong> is a program that moves data from where it is created to where it is used, changing it on the way, and runs by itself on a schedule. <strong>ETL</strong> names its three steps: <strong>Extract</strong> (read from the sources), <strong>Transform</strong> (clean, combine, reshape), <strong>Load</strong> (write to the place people query). An <strong>orchestrator</strong> is the program that runs pipelines on time, in order, with retries and alerts.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"It's just a quick script" is how most broken pipelines start. One script that reads, fixes and writes in one go cannot be re-run safely, tested step by step, or told apart when it fails. Keep the three steps as separate functions from day one; the rest of this note builds on that.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Extract.</b> We know the three steps. The first one is not trivial: a database, a file and an API each hand over data differently, and each can fail differently.</div>

  <h2 id="et-ext"><span class="num">02</span>Extract: Database, File, API</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's data lives in three systems that speak different languages: SQL, a CSV file, and HTTP. How do we get one day's data out of each, in a form the next step can use, without hurting the systems we read from?</p>
  </div>
  <p>In plain words: extracting means <em>asking each source for the data and getting it into memory</em> (here, a pandas DataFrame). Three kinds of source, three ways of asking:</p>
  <ul>
    <li><strong>Database</strong>: send a SQL query and read the rows back. Ask only for the day you need.</li>
    <li><strong>File</strong>: read it from a folder. Read every column as text first, because a hand-kept sheet may contain anything; fix types in the transform step.</li>
    <li><strong>API</strong> (a web service that answers HTTP requests with JSON): APIs rarely return everything at once. They return a <strong>page</strong> (here 2 rows) plus a pointer to the next page, and you keep asking until there is none. This is <strong>pagination</strong>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Collecting ingredients for one day's cooking: you phone the wholesaler for exactly today's order (a query), pick up the list a friend left on your door (a file), and collect vegetables from a market stall that hands them over two bags at a time (pages).</p>
  </div>
  <p>The three extract functions, one per source. They live in <code>biteful_etl.py</code>, the module the whole note builds up:</p>
  <div class="fx" data-lang="py">import json, os, shutil, sqlite3
from urllib.request import urlopen
import pandas as pd

APP_DB = "src/biteful_app.db"                 # the app's database (SQLite stand-in for Postgres)
SHEET = "inbox/restaurants_sheet.csv"         # the partner team's hand-kept sheet
API = "http://127.0.0.1:18947"                 # the logistics partner's delivery API
WH = "warehouse"                              # our Parquet "warehouse" (a folder of files)

def extract_orders(ds):                       # source 1: a database
    con = sqlite3.connect(APP_DB)
    df = pd.read_sql("SELECT * FROM orders WHERE substr(ordered_at, 1, 10) = ?", con, params=(ds,))
    con.close()
    return df

def extract_restaurants():                    # source 2: a file
    return pd.read_csv(SHEET, dtype=str)      # read everything as text; types are fixed in transform

def extract_deliveries(ds):                   # source 3: an API, 2 rows per page
    rows, page = [], 1
    while page:                               # keep asking until there is no next page
        with urlopen(f"{API}/deliveries?date={ds}&amp;page={page}", timeout=5) as r:
            body = json.load(r)
        rows += body["rows"]
        page = body["next_page"]
    return pd.DataFrame(rows, columns=["order_id", "delivery_minutes"])</div>
  <p>Line by line: <code>params=(ds,)</code> passes the date separately from the SQL text (never paste values into SQL strings; that is how SQL injection happens). <code>substr(ordered_at, 1, 10)</code> takes the date part of the IST timestamp. The API loop asks for page 1, adds its rows, and moves to <code>next_page</code> until the API says <code>None</code>. Now run all three for 2 March:</p>
  <div class="fx" data-lang="py">import pandas as pd
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries
pd.set_option("display.width", 120)

ds = "2026-03-02"
orders = extract_orders(ds)
rest = extract_restaurants()
deliv = extract_deliveries(ds)
print("orders     :", orders.shape, "| columns:", list(orders.columns))
print("restaurants:", rest.shape)
print("deliveries :", deliv.shape)
print(orders[["order_id", "restaurant_id", "ordered_at", "status", "amount"]])
print(deliv)

# what the API actually sent, page by page
import json
from urllib.request import urlopen
for page in (1, 2):
    with urlopen(f"http://127.0.0.1:18947/deliveries?date={ds}&amp;page={page}") as r:
        print("page", page, "-&gt;", json.load(r))</div>
  <div class="fx" data-lang="text">orders     : (3, 7) | columns: ['order_id', 'customer_id', 'restaurant_id', 'ordered_at', 'status', 'amount', 'updated_at']
restaurants: (6, 5)
deliveries : (3, 2)
   order_id  restaurant_id                 ordered_at     status  amount
0       101             10  2026-03-02T12:10:00+05:30  delivered     240
1       102             11  2026-03-02T13:05:00+05:30  delivered     450
2       103             12  2026-03-02T20:30:00+05:30  delivered     520
   order_id  delivery_minutes
0       101                32
1       102                41
2       103                38
page 1 -&gt; {'rows': [{'order_id': 101, 'delivery_minutes': 32}, {'order_id': 102, 'delivery_minutes': 41}], 'next_page': 2}
page 2 -&gt; {'rows': [{'order_id': 103, 'delivery_minutes': 38}], 'next_page': None}</div>
  <p>Trace the API part: 3 deliveries on 2 March, 2 per page. Page 1 returned orders 101 and 102 with <code>next_page: 2</code>; page 2 returned 103 with <code>next_page: None</code>, so the loop stopped. The sheet came back with 6 rows for 5 restaurants (Green Bowl twice), still messy. That is fine: extract's only job is to bring the data in faithfully.</p>
  <h3>How much to extract: full, incremental, CDC</h3>
  <p>Here we asked for one day. Real tables are huge (crores of orders), so the question "how do I get only what changed?" has three standard answers. Section 07 builds the middle one.</p>
  <table class="tbl">
    <tr><th>Method</th><th>How</th><th>Catch</th></tr>
    <tr><td>Full snapshot</td><td><code>SELECT *</code> every run</td><td>Simple; fine for the 5-row restaurant sheet, too heavy for orders</td></tr>
    <tr><td>Incremental</td><td><code>WHERE updated_at &gt; :watermark</code></td><td>Cheap; misses hard deletes; needs a reliable <code>updated_at</code></td></tr>
    <tr><td><strong>CDC</strong> (change data capture)</td><td>Read the database's own change log (Postgres WAL, MySQL binlog) with a tool like Debezium</td><td>Sees every insert, update and delete within seconds; needs Kafka-style infrastructure (see <a class="xref" data-note="de_kafka">Kafka</a>)</td></tr>
    <tr><td>API</td><td>Paginated HTTP calls</td><td>Rate limits (HTTP 429 = "too many requests"), outages (503), fields renamed without warning</td></tr>
    <tr><td>Files</td><td>CSV/JSON/Parquet dropped in a folder or S3</td><td>You must wait until the file has arrived (a <em>sensor</em>, section 10)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Extract</strong>: read the data needed for one run from each source system, unchanged, into the pipeline. <strong>Pagination</strong>: an API returns results in pages; the client requests page after page until none is left.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A big extract from the app's <em>primary</em> database competes with live customers: the app slows down because your job is hogging the database. Read from a <strong>replica</strong> (a read-only copy) or use CDC. With APIs, never fire requests in a tight loop: respect rate limits and back off on 429.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Transform.</b> We now hold three DataFrames for 2 March: 3 orders, 6 sheet rows (one duplicate, three spellings of two cities), 3 delivery times. They are still separate and still messy. Nothing can be totalled yet.</div>

  <h2 id="et-tr"><span class="num">03</span>Transform: Clean, Normalise, Enrich</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 showed what happens if we total the raw data: Pune is split in two. How do three messy inputs become one table where each row is one order, every city is spelled one way, and each order carries its restaurant's city and its delivery time?</p>
  </div>
  <p>In plain words: transforming means <em>changing the data until it can be trusted and used</em>. The work falls into three kinds, usually in this order:</p>
  <div class="flow"><span>Clean: dedupe, fix types</span><span>Normalise: one spelling, one time zone</span><span>Enrich: join the extra facts</span></div>
  <ul>
    <li><strong>Clean</strong>: remove duplicates (Green Bowl pasted twice), turn text into proper types (<code>'4.5'</code> → 4.5, an empty rating → missing).</li>
    <li><strong>Normalise</strong>: make equal things look equal. <code>' pune '</code>, <code>'Pune'</code> and <code>'PUNE'</code> become <code>Pune</code>. Times are converted to one time zone (UTC), so data from different countries lines up.</li>
    <li><strong>Enrich</strong>: add columns from other tables. Each order gets its restaurant's name, city and cuisine, and its delivery minutes from the API.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Before cooking: throw out the duplicate bag of onions (clean), cut everything to the same size (normalise), and add the spices that turn vegetables into a dish (enrich).</p>
  </div>
  <p>The code is plain pandas (<a class="xref" data-note="da_pandas">Pandas</a> covers each method). <code>validate=</code> in <code>merge</code> is the important new piece:</p>
  <div class="fx" data-lang="py">def clean_restaurants(rest):
    rest = rest.drop_duplicates("restaurant_id").copy()               # clean: dedupe
    rest["restaurant_id"] = rest["restaurant_id"].astype(int)          # clean: fix types
    rest["city"] = rest["city"].str.strip().str.title()                # normalise: ' pune ' -&gt; 'Pune'
    rest["rating"] = pd.to_numeric(rest["rating"])                     # '' -&gt; NaN
    return rest.rename(columns={"name": "restaurant"})

def transform(orders, rest, deliv, ds):
    df = orders.copy()
    df["ordered_at_utc"] = (pd.to_datetime(df["ordered_at"], format="ISO8601", utc=True)
                              .dt.strftime("%Y-%m-%d %H:%M"))           # normalise: one time zone
    df["amount"] = df["amount"].astype(float)
    df["order_date"] = ds                                              # the business day (IST)
    df = df.merge(clean_restaurants(rest)[["restaurant_id", "restaurant", "city", "cuisine"]],
                  on="restaurant_id", how="left", validate="many_to_one")   # enrich
    df = df.merge(deliv, on="order_id", how="left", validate="one_to_one")  # enrich
    df["delivery_minutes"] = df["delivery_minutes"].astype("Int64")   # pin the type: whole minutes or &lt;NA&gt;
    cols = ["order_id", "order_date", "ordered_at_utc", "customer_id", "restaurant",
            "city", "cuisine", "status", "amount", "delivery_minutes"]
    return df[cols].sort_values("order_id").reset_index(drop=True)</div>
  <p>Walk through it. <code>drop_duplicates("restaurant_id")</code> keeps the first Green Bowl row. <code>.str.strip().str.title()</code> removes the spaces and fixes the capitals. <code>pd.to_datetime(..., utc=True)</code> reads <code>2026-03-02T12:10:00+05:30</code> and converts it to UTC. <code>order_date = ds</code> keeps the <em>business</em> day in India, because "2 March's revenue" means 2 March in IST. <code>how="left"</code> keeps every order even if a lookup fails. <code>astype("Int64")</code> (capital I: pandas' nullable integer) pins <code>delivery_minutes</code> to whole numbers that may be missing (<code>&lt;NA&gt;</code>); without it the column is an integer on days where every time is known and a float on days with a gap, and section 04 shows what that does. <code>validate="many_to_one"</code> tells pandas: "many orders may point at one restaurant, but each restaurant must appear only once on the right; otherwise stop." Run it:</p>
  <div class="fx" data-lang="py">import pandas as pd
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, clean_restaurants, transform
pd.set_option("display.width", 200); pd.set_option("display.max_columns", None)

rest = extract_restaurants()
print(clean_restaurants(rest))

ds = "2026-03-02"
clean = transform(extract_orders(ds), rest, extract_deliveries(ds), ds)
print(clean)
print(clean[clean["status"] == "delivered"].groupby("city")["amount"].sum())

# the trap: enrich with the raw sheet (Green Bowl is in it twice) on 3 March
ds = "2026-03-03"
o = extract_orders(ds)
print("orders:", len(o), "-&gt; after a plain merge:", len(o.merge(rest.astype({"restaurant_id": int}), on="restaurant_id")))
try:
    o.merge(rest.astype({"restaurant_id": int}), on="restaurant_id", validate="many_to_one")
except pd.errors.MergeError as e:
    print("MergeError:", str(e).splitlines()[0])</div>
  <div class="fx" data-lang="text">   restaurant_id    restaurant    city       cuisine  rating
0             10      Dosa Hut    Pune  South Indian     4.5
1             11  Biryani Bros  Mumbai       Biryani     4.2
2             12   Pizza Point    Pune         Pizza     3.9
3             13    Green Bowl  Mumbai       Healthy     4.2
5             14    Momo Magic    Pune       Tibetan     NaN
   order_id  order_date    ordered_at_utc  customer_id    restaurant    city       cuisine     status  amount  delivery_minutes
0       101  2026-03-02  2026-03-02 06:40            1      Dosa Hut    Pune  South Indian  delivered   240.0                32
1       102  2026-03-02  2026-03-02 07:35            2  Biryani Bros  Mumbai       Biryani  delivered   450.0                41
2       103  2026-03-02  2026-03-02 15:00            3   Pizza Point    Pune         Pizza  delivered   520.0                38
city
Mumbai    450.0
Pune      760.0
Name: amount, dtype: float64
orders: 2 -&gt; after a plain merge: 3
MergeError: Merge keys are not unique in right dataset; not a many-to-one merge</div>
  <p>Trace one order by hand. Order 101 was placed at 12:10 IST; IST is UTC + 5:30, so 12:10 − 5:30 = 06:40 UTC ✓. Its restaurant id is 10; the clean sheet says 10 is Dosa Hut, city <code>' pune '</code> → <code>Pune</code>; the API says 32 minutes. Totals: Pune = 240 (101) + 520 (103) = 760, Mumbai = 450 (102). That is the number Priya e-mails, now produced by code.</p>
  <p>The last lines show why <code>validate</code> matters. On 3 March, order 105 is at Green Bowl, which the raw sheet lists twice. A plain merge matched 105 to <em>both</em> rows: 2 orders became 3, and 105's ₹310 would be counted twice. This is the same <strong>fan-out</strong> as in <a class="xref" data-note="sql_joins">JOINs</a>: a join key that repeats on the "one" side multiplies rows. With <code>validate="many_to_one"</code>, pandas refused the merge with a MergeError instead of silently doubling.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Transform</strong>: turn extracted data into the target shape. <strong>Clean</strong> = fix errors (duplicates, types, missing values). <strong>Normalise</strong> = one representation for one meaning (spelling, units, time zone, currency). <strong>Enrich</strong> = add attributes from reference data, usually by a join. The output has a clear <strong>grain</strong>: here, one row per order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every enrichment join can change the row count: a duplicate on the lookup side multiplies rows (fan-out), and an inner join silently drops orders whose restaurant is missing from the sheet. Use <code>how="left"</code>, <code>validate=</code>, and count rows before and after. The quality checks in section 08 catch whatever slips through.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Load.</b> The clean table exists, but only in this Python process's memory. When the script ends it is gone, and the analyst, the dashboard and the ML model can't query a variable in someone's script.</div>

  <h2 id="et-load"><span class="num">04</span>Load: A Parquet Warehouse</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have a correct table for 2 March in memory. Where do we put it so that anyone can query it tomorrow, next to the tables for every other day, with its types intact and cheap to read?</p>
  </div>
  <p>In plain words: loading means <em>writing the result into the place where people and programs read it</em>. The place depends on who reads it:</p>
  <div class="cards">
    <div><b>Warehouse</b><p>BigQuery, Snowflake, Redshift: a database built for big analytical SQL.</p><small>Load in bulk (COPY), never row by row</small></div>
    <div><b>Data lake</b><p>Files (usually Parquet) in S3 or a folder, one folder per day.</p><small>Cheap; Delta Lake and Iceberg add transactions on top</small></div>
    <div><b>Operational DB</b><p>Postgres, when an app needs the result (e.g. today's ETA per restaurant).</p><small>Upsert on a key (section 06)</small></div>
  </div>
  <p>Biteful's "warehouse" is a folder of <strong>Parquet</strong> files, which is how real data lakes work. Parquet (from <a class="xref" data-note="py_files">File Handling</a>) stores a table <em>column by column</em>, with the column types saved inside the file and each column compressed. A reader that needs 3 of 9 columns reads only those 3. We also give each day its own folder, named <code>order_date=2026-03-02</code>. That name style is called <strong>Hive partitioning</strong>, and pandas, Spark and DuckDB all understand it: the folder name becomes a column.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school office files attendance sheets in one drawer per month, with the month written on the drawer. To answer "how many absences in March?" you open one drawer, not the whole cabinet. The drawers are the date partitions; filing column by column is like keeping one register per subject, so the maths teacher never has to flip through the art register.</p>
  </div>
  <div class="fx" data-lang="py">def part_dir(table, ds):
    return f"{WH}/{table}/order_date={ds}"

def load_overwrite(df, ds, table="fact_orders"):     # idempotent: replace the day's folder
    d = part_dir(table, ds)
    tmp = d + ".tmp"
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    df.drop(columns="order_date").to_parquet(f"{tmp}/part-0.parquet", index=False)
    shutil.rmtree(d, ignore_errors=True)              # swap: old folder out, new folder in
    os.rename(tmp, d)</div>
  <p>(Why write to a <code>.tmp</code> folder and then rename it: section 06.) Load 2 March and look at what landed:</p>
  <div class="fx" data-lang="py">import os, pandas as pd, pyarrow.parquet as pq
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, transform, load_overwrite, read_table

ds = "2026-03-02"
clean = transform(extract_orders(ds), extract_restaurants(), extract_deliveries(ds), ds)
load_overwrite(clean, ds)

for root, dirs, files in os.walk("warehouse"):
    for f in files:
        print(os.path.join(root, f), os.path.getsize(os.path.join(root, f)), "bytes")
print(pq.read_schema("warehouse/fact_orders/order_date=2026-03-02/part-0.parquet").remove_metadata())
print(pd.read_parquet("warehouse/fact_orders", columns=["order_id", "city", "amount"]))</div>
  <div class="fx" data-lang="text">warehouse/fact_orders/order_date=2026-03-02/part-0.parquet 5800 bytes
order_id: int64
ordered_at_utc: large_string
customer_id: int64
restaurant: large_string
city: large_string
cuisine: large_string
status: large_string
amount: double
delivery_minutes: int64
   order_id    city  amount
0       101    Pune   240.0
1       102  Mumbai   450.0
2       103    Pune   520.0</div>
  <p>Read the output. One file in one day-folder. The schema printed from inside the file says <code>order_id: int64</code>, <code>amount: double</code>: a CSV would have given back text that we would have to parse again. Reading with <code>columns=[...]</code> loaded only 3 columns. Notice also: 5,800 bytes for 3 rows is far bigger than a CSV would be, because Parquet stores a schema and statistics in every file. It pays off with millions of rows, not three; that is also why thousands of tiny Parquet files are a known problem (see <a class="xref" data-note="de_spark">Spark</a>).</p>
  <p>Teams usually keep three <strong>layers</strong>, so a bug in cleaning never destroys the raw copy. The names are a convention:</p>
  <div class="flow"><span>bronze: raw, as extracted</span><span>silver: cleaned, one row per order (our fact_orders)</span><span>gold: business tables (revenue per city per day)</span></div>
  <p><code>fact_orders</code> is a <strong>fact table</strong> in the sense of <a class="xref" data-note="sql_modeling">Data Modeling</a>: one row per event (an order), with measures (amount, minutes) and keys/attributes describing it. The restaurant sheet, once cleaned, is a <strong>dimension</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Load</strong>: write transformed data into the target store. <strong>Partition</strong>: the slice of a table for one value of a column (here one day), stored as its own folder, so a job can replace or read one day without touching the others.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing straight into the final folder means a crash half-way leaves a half-written day that readers will see. Write somewhere temporary, then swap it in with one rename (or use a table format/warehouse with transactions).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: schema drift between partitions</span>
    <p>This really happened while building these notes. Before <code>transform</code> pinned the type, the 2 March file stored <code>delivery_minutes</code> as int64 (all three times known) and the 3 March file as double (order 104's time is missing, and pandas turns an integer column with a gap into floats). pandas read the folder happily. Spark, pointed at the same warehouse in the next note, refused: <code>Data type mismatches when reading Parquet column [delivery_minutes]. Expected Spark type bigint, actual Parquet type DOUBLE.</code> Every partition of a table must have the same schema; set the output types explicitly in the transform.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ETL vs ELT.</b> We cleaned in Python <em>before</em> storing. If the business changes its mind next month ("also count cancelled orders"), the raw data is gone, and we must extract it all again. Is transforming first the only order?</div>

  <h2 id="et-elt"><span class="num">05</span>ETL vs ELT: Where the Transform Runs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our pipeline transforms first and stores only the clean result. If a cleaning rule turns out wrong, or a new question needs a column we dropped, the raw data is not kept anywhere. Could we store first and clean later?</p>
  </div>
  <p>Yes, and that swap has a name. Both use the same three steps; only the order differs:</p>
  <ul>
    <li><strong>ETL</strong>: transform first, on a separate machine (our Python script, a Spark cluster), then load only the clean result.</li>
    <li><strong>ELT</strong>: load the raw data as-is into the warehouse first (bronze), then transform it there with SQL. <strong>dbt</strong> is the popular tool for organising those SQL transforms.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="et-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="45" font-weight="bold">ETL</text>
    <rect x="60" y="22" width="110" height="38" rx="6" class="fs"/><text x="115" y="46" text-anchor="middle">Sources</text>
    <rect x="230" y="22" width="140" height="38" rx="6" class="fv"/><text x="300" y="40" text-anchor="middle">Transform</text><text x="300" y="54" text-anchor="middle" font-size="10">pandas / Spark</text>
    <rect x="430" y="22" width="150" height="38" rx="6" class="fb"/><text x="505" y="46" text-anchor="middle">Warehouse (clean)</text>
    <line x1="170" y1="41" x2="228" y2="41" stroke="currentColor" marker-end="url(#et-ar)"/>
    <line x1="370" y1="41" x2="428" y2="41" stroke="currentColor" marker-end="url(#et-ar)"/>
    <text x="10" y="125" font-weight="bold">ELT</text>
    <rect x="60" y="102" width="110" height="38" rx="6" class="fs"/><text x="115" y="126" text-anchor="middle">Sources</text>
    <rect x="230" y="92" width="350" height="62" rx="8" class="fb"/>
    <text x="405" y="108" text-anchor="middle" font-size="11">Warehouse</text>
    <rect x="245" y="115" width="90" height="30" rx="5" class="fs"/><text x="290" y="134" text-anchor="middle" font-size="11">bronze (raw)</text>
    <rect x="370" y="115" width="80" height="30" rx="5" class="fv"/><text x="410" y="134" text-anchor="middle" font-size="11">SQL / dbt</text>
    <rect x="480" y="115" width="85" height="30" rx="5" class="fg"/><text x="522" y="134" text-anchor="middle" font-size="11">silver</text>
    <line x1="170" y1="121" x2="243" y2="128" stroke="currentColor" marker-end="url(#et-ar)"/>
    <line x1="335" y1="130" x2="368" y2="130" stroke="currentColor" marker-end="url(#et-ar)"/>
    <line x1="450" y1="130" x2="478" y2="130" stroke="currentColor" marker-end="url(#et-ar)"/>
  </svg><figcaption>Same three steps, different order. ELT keeps the raw copy inside the warehouse.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>ETL is a meal-kit company that cooks before delivering: you get the dish, never the ingredients. ELT delivers raw groceries into a huge kitchen and cooks there, so tomorrow you can cook a different dish from the same groceries.</p>
  </div>
  <p>Here is Biteful done the ELT way: land the three raw extracts as bronze Parquet files, then write the transform as SQL. DuckDB (an in-process SQL engine that reads Parquet files directly) plays the warehouse. The last line checks the SQL result against our pandas transform.</p>
  <div class="fx" data-lang="py">import os, duckdb
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, transform

ds = "2026-03-02"
# ELT step 1 (E + L): land the raw data untouched in a "bronze" area
os.makedirs("warehouse/bronze", exist_ok=True)
extract_orders(ds).to_parquet(f"warehouse/bronze/orders_{ds}.parquet", index=False)
extract_restaurants().to_parquet("warehouse/bronze/restaurants.parquet", index=False)
extract_deliveries(ds).to_parquet(f"warehouse/bronze/deliveries_{ds}.parquet", index=False)

# ELT step 2 (T): transform with SQL inside the warehouse engine (DuckDB here)
sql = f"""
WITH r AS (
  SELECT DISTINCT CAST(restaurant_id AS INT) AS restaurant_id, name AS restaurant,
         upper(left(trim(city), 1)) || lower(substr(trim(city), 2)) AS city, cuisine
  FROM 'warehouse/bronze/restaurants.parquet')
SELECT o.order_id, o.status, CAST(o.amount AS DOUBLE) AS amount, r.restaurant, r.city, d.delivery_minutes
FROM 'warehouse/bronze/orders_{ds}.parquet' o
LEFT JOIN r USING (restaurant_id)
LEFT JOIN 'warehouse/bronze/deliveries_{ds}.parquet' d USING (order_id)
ORDER BY o.order_id"""
silver = duckdb.sql(sql).df()
print(silver)

etl = transform(extract_orders(ds), extract_restaurants(), extract_deliveries(ds), ds)
cols = ["order_id", "status", "amount", "restaurant", "city", "delivery_minutes"]
print("same result as the pandas (ETL) transform:",
      silver[cols].astype(str).equals(etl[cols].astype(str)))</div>
  <div class="fx" data-lang="text">   order_id     status  amount    restaurant    city  delivery_minutes
0       101  delivered   240.0      Dosa Hut    Pune                32
1       102  delivered   450.0  Biryani Bros  Mumbai                41
2       103  delivered   520.0   Pizza Point    Pune                38
same result as the pandas (ETL) transform: True</div>
  <p>Map the SQL to section 03: <code>SELECT DISTINCT</code> is the dedupe, <code>upper(left(trim(city), 1)) || lower(...)</code> is the normalise, the two <code>LEFT JOIN</code>s are the enrichment. Same 3 rows, same values. The difference is where the work ran and what was kept: the raw files in <code>warehouse/bronze/</code> are still there, so a new rule is just a new SQL query.</p>
  <p>Why ELT took over in the cloud: storage became very cheap, and warehouses can throw hundreds of machines at one SQL query. ETL still wins when personal data (<strong>PII</strong>, like phone numbers) must be masked <em>before</em> it lands anywhere, and when the transform is not SQL-shaped (resizing images, running a model on text).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ETL</strong> = Extract → Transform → Load: clean outside the target, store only the result. <strong>ELT</strong> = Extract → Load → Transform: store raw data in the target first, transform inside it (usually SQL).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"ELT, so we don't need to clean" is wrong: ELT moves the cleaning, it doesn't remove it. Raw tables that analysts query directly become ten slightly different versions of "revenue". Keep the bronze → silver → gold layers and let people query silver and gold.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: idempotency.</b> ETL or ELT, the pipeline will be run more than once for the same day: a network blip and a retry, a colleague clicking "rerun", a fix applied to last week. What does a second run of 2 March do to our table?</div>

  <h2 id="et-idem"><span class="num">06</span>Idempotency: Re-running Must Be Safe</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The load for 2 March succeeds, then the job is retried (the orchestrator thought it had failed). Is 2 March now in the warehouse once or twice? Does the revenue dashboard still say ₹1,210?</p>
  </div>
  <p>Jobs <em>will</em> run more than once: automatic retries, crashes half-way, a manual rerun, a backfill (section 09). So we want a job that can run any number of times and leave the same result as running once.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A light switch with an "ON" position is idempotent: pressing ON twice still means on. A toggle button is not: press it twice and the light is back off. Write load steps like the ON switch.</p>
  </div>
  <p>The tiny version first, then the real Parquet warehouse. The first <code>load_append</code> adds a new file every time; <code>load_overwrite</code> replaces the day's folder (both were defined in <code>biteful_etl.py</code>):</p>
  <div class="fx" data-lang="py">def load_append(df, ds, table="fact_orders"):        # NOT idempotent
    d = part_dir(table, ds)
    os.makedirs(d, exist_ok=True)
    n = len(os.listdir(d))
    df.drop(columns="order_date").to_parquet(f"{d}/part-{n}.parquet", index=False)</div>
  <div class="fx" data-lang="py">import os, shutil, sqlite3
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, transform
from biteful_etl import load_append, load_overwrite, read_table, part_dir

# 1. toy version: the 2 March batch, and the job runs twice (a retry)
batch = [(101, 240), (102, 450), (103, 520)]
table = []
table.extend(batch)
table.extend(batch)                                   # the retry
print("toy append   :", len(table), "rows, revenue", sum(a for _, a in table))
parts = {}
parts["2026-03-02"] = list(batch)
parts["2026-03-02"] = list(batch)                     # the retry
rows = [r for day in parts.values() for r in day]
print("toy overwrite:", len(rows), "rows, revenue", sum(a for _, a in rows))

# 2. the real thing: Parquet files in the warehouse
ds = "2026-03-02"
clean = transform(extract_orders(ds), extract_restaurants(), extract_deliveries(ds), ds)
for load in (load_append, load_overwrite):
    shutil.rmtree("warehouse/fact_orders", ignore_errors=True)
    for run in (1, 2):
        load(clean, ds)
        f = read_table()
        print(f"{load.__name__:14} run {run}: rows={len(f)} revenue={f['amount'].sum():.0f} "
              f"files={sorted(os.listdir(part_dir('fact_orders', ds)))}")</div>
  <div class="fx" data-lang="text">toy append   : 6 rows, revenue 2420
toy overwrite: 3 rows, revenue 1210
load_append    run 1: rows=3 revenue=1210 files=['part-0.parquet']
load_append    run 2: rows=6 revenue=2420 files=['part-0.parquet', 'part-1.parquet']
load_overwrite run 1: rows=3 revenue=1210 files=['part-0.parquet']
load_overwrite run 2: rows=3 revenue=1210 files=['part-0.parquet']</div>
  <table class="tbl out"><caption>Trace: what each run did to the 2 March folder</caption>
    <tr><th>Load</th><th>After run 1</th><th>After run 2 (the retry)</th><th>Revenue</th></tr>
    <tr><td>append</td><td>part-0 (101, 102, 103)</td><td>part-0 + part-1 (101, 102, 103 twice)</td><td>1210 → <strong>2420</strong> ✗</td></tr>
    <tr><td>overwrite</td><td>part-0 (101, 102, 103)</td><td>folder replaced: part-0 (101, 102, 103)</td><td>1210 → 1210 ✓</td></tr>
  </table>
  <p>Append is the toggle button: every run adds. Overwrite is the ON switch: every run produces "2 March = these 3 orders", no matter what was there. This is <strong>partition overwrite</strong>: replace exactly the slice this run is responsible for. In a SQL warehouse it is <code>DELETE FROM fact_orders WHERE order_date = :ds; INSERT …</code> inside one transaction; in Spark it is "dynamic partition overwrite".</p>
  <h3>Upsert: idempotent at the row level</h3>
  <p>Sometimes the unit is a row, not a day. Biteful keeps a restaurant dimension table, and Momo Magic gets its first rating on Tuesday. An <strong>upsert</strong> ("update if the key exists, insert if not") is idempotent by key. SQLite and PostgreSQL share this syntax:</p>
  <div class="fx" data-lang="py">import sqlite3
wh = sqlite3.connect(":memory:")       # same SQL works in PostgreSQL
wh.execute("CREATE TABLE dim_restaurant (restaurant_id INT PRIMARY KEY, name TEXT, rating REAL)")
upsert = """INSERT INTO dim_restaurant VALUES (?, ?, ?)
            ON CONFLICT (restaurant_id) DO UPDATE SET rating = excluded.rating"""
wh.execute(upsert, (14, "Momo Magic", None))   # Monday's run: not rated yet
wh.execute(upsert, (14, "Momo Magic", None))   # Monday's run again (retry)
print(wh.execute("SELECT * FROM dim_restaurant").fetchall())
wh.execute(upsert, (14, "Momo Magic", 4.0))    # Tuesday's run: first rating arrived
print(wh.execute("SELECT * FROM dim_restaurant").fetchall())</div>
  <div class="fx" data-lang="text">[(14, 'Momo Magic', None)]
[(14, 'Momo Magic', 4.0)]</div>
  <p>Monday's run twice: still one row. Tuesday's run: the same row now holds 4.0. <code>excluded.rating</code> means "the value I tried to insert". Warehouses spell the same idea <code>MERGE INTO … WHEN MATCHED THEN UPDATE WHEN NOT MATCHED THEN INSERT</code>.</p>
  <h3>The third rule: the run must know which day it is for</h3>
  <p>A job that computes "yesterday" from the clock is not idempotent across time: rerun it next week and it loads a different day.</p>
  <div class="fx" data-lang="py">from datetime import date, timedelta

def job_with_clock():                  # "load yesterday", computed from the clock
    return str(date.today() - timedelta(days=1))

def job_with_ds(ds):                   # the date the run is FOR, passed in
    return ds

# re-running 2 March's job (for a backfill), today:
print("clock version loads:", job_with_clock())
print("ds version loads   :", job_with_ds("2026-03-02"))</div>
  <div class="fx" data-lang="text">clock version loads: 2026-10-19
ds version loads   : 2026-03-02</div>
  <p>This was run on 20 October 2026, so the clock version loaded 19 October into what should have been 2 March's re-run. The fix is to pass the day the run is <em>for</em> as a parameter. Orchestrators call it the <strong>logical date</strong> (Airflow's <code>ds</code>), and every function in <code>biteful_etl.py</code> takes it as <code>ds</code>.</p>
  <div class="cards">
    <div><b>Partition overwrite</b><p>Replace the run's day-folder (or DELETE + INSERT the day in one transaction).</p><small>Use for daily facts: fact_orders</small></div>
    <div><b>Upsert / MERGE</b><p>Insert new keys, update existing ones.</p><small>Use for dimensions and late changes</small></div>
    <div><b>Logical date</b><p>The run's day is an input, never <code>now()</code>.</p><small>Makes reruns and backfills load the right day</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A job is <strong>idempotent</strong> if running it once or many times with the same input leaves the target in the same state.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A plain <code>INSERT</code> (or append) with no delete and no key is the most common non-idempotent job. It passes every test, because tests run it once. The first retry in production doubles the numbers, and nobody notices for a week.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: incremental loads.</b> Overwriting whole days works for the day we just extracted. But order 110 was <em>pending</em> on 8 March and was delivered later. Re-extracting every past day every night to catch such changes is wasteful; not re-extracting means 110 stays "pending" in the warehouse forever.</div>

  <h2 id="et-incr"><span class="num">07</span>Incremental Loads &amp; Watermarks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Rows change after the day they were created: an order is delivered, refunded, corrected. A daily extract by <code>ordered_at</code> never looks back. How do we pick up exactly the rows that are new <em>or changed</em> since the last run, without reading the whole table?</p>
  </div>
  <p>The idea: the app's <code>orders</code> table also carries <code>updated_at</code>, the time the row last changed (the SQL notes left this column out to stay small). If we remember the largest <code>updated_at</code> we have loaded, next time we only ask for rows with a later one. That remembered value is the <strong>watermark</strong>. Changed rows are then <strong>merged</strong> into the warehouse by key: an upsert, done one affected day-folder at a time.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading a busy WhatsApp group: you don't reread the whole chat every evening; you scroll to "unread messages" and read from there. The watermark is the "last read" line. An edited old message shows up again as "edited", because its time changed.</p>
  </div>
  <div class="fx" data-lang="py">def get_watermark():
    if not os.path.exists(STATE):
        return "1970-01-01"                            # first run: everything is "new"
    return json.load(open(STATE))["orders"]

def save_watermark(wm):
    json.dump({"orders": wm}, open(STATE, "w"))

def extract_changed(since):                            # rows inserted OR updated after the watermark
    con = sqlite3.connect(APP_DB)
    df = pd.read_sql("SELECT * FROM orders WHERE updated_at &gt; ? ORDER BY updated_at",
                     con, params=(since,))
    con.close()
    return df

def read_partition(ds, table="fact_orders"):
    d = part_dir(table, ds)
    if not os.path.exists(d):
        return pd.DataFrame()
    return pd.read_parquet(d).assign(order_date=ds)

def merge_into_fact(changed):                          # upsert by order_id, one day-folder at a time
    rest = extract_restaurants()
    for ds, rows in changed.groupby(changed["ordered_at"].str[:10]):
        new = transform(rows, rest, extract_deliveries(ds), ds)
        old = read_partition(ds)
        if len(old):
            old = old[~old["order_id"].isin(new["order_id"])]     # drop old versions
        load_overwrite(pd.concat([old, new], ignore_index=True), ds)

def incremental_run(label):
    wm = get_watermark()
    changed = extract_changed(wm)
    print(f"{label}: watermark {wm} -&gt; {len(changed)} changed: {changed['order_id'].tolist()}")
    if len(changed):
        merge_into_fact(changed)
        save_watermark(changed["updated_at"].max())     # move the bookmark only after the load</div>
  <p>Between runs 1 and 2, the app does two things (written as a script so we can replay it): order 110 is delivered, and Gita, who had never ordered, orders from Momo Magic.</p>
  <div class="fx" data-lang="py">import json, sqlite3
# what Biteful's app did after our last run (the ETL doesn't know any of this yet)
con = sqlite3.connect("src/biteful_app.db")
con.execute("""UPDATE orders SET status = 'delivered', updated_at = '2026-03-08T21:28:00+05:30'
               WHERE order_id = 110""")                         # Asha's pending order arrived
con.execute("""INSERT INTO orders VALUES (111, 7, 14, '2026-03-09T13:00:00+05:30',
               'delivered', 220, '2026-03-09T13:35:00+05:30')""")   # Gita's first order!
con.commit()
api = json.load(open("src/delivery_api_data.json"))                 # the partner API learns too
api.setdefault("2026-03-08", []).append({"order_id": 110, "delivery_minutes": 38})
api["2026-03-09"] = [{"order_id": 111, "delivery_minutes": 35}]
json.dump(api, open("src/delivery_api_data.json", "w"))</div>
  <div class="fx" data-lang="py">import shutil, sqlite3, subprocess, sys
from biteful_etl import incremental_run, read_table
shutil.rmtree("warehouse/fact_orders", ignore_errors=True)

incremental_run("run 1")                          # first run: initial full load
f = read_table()
print("   warehouse:", len(f), "orders; order 110 is", f.loc[f.order_id == 110, "status"].item())

subprocess.run([sys.executable, "s07_app_changes.py"], check=True)    # the app moves on
incremental_run("run 2")
f = read_table()
print(f[f.order_id &gt;= 109][["order_id", "order_date", "status", "amount", "city", "delivery_minutes"]])

incremental_run("run 3")                          # nothing changed since run 2

con = sqlite3.connect("src/biteful_app.db")       # the app HARD-deletes cancelled order 107
con.execute("DELETE FROM orders WHERE order_id = 107"); con.commit()
incremental_run("run 4")
print("   107 still in warehouse?", 107 in read_table()["order_id"].values)</div>
  <div class="fx" data-lang="text">run 1: watermark 1970-01-01 -&gt; 10 changed: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110]
   warehouse: 10 orders; order 110 is pending
run 2: watermark 2026-03-08T20:50:00+05:30 -&gt; 2 changed: [110, 111]
    order_id  order_date     status  amount    city  delivery_minutes
8        109  2026-03-05  delivered   600.0  Mumbai                52
9        110  2026-03-08  delivered   310.0    Pune                38
10       111  2026-03-09  delivered   220.0    Pune                35
run 3: watermark 2026-03-09T13:35:00+05:30 -&gt; 0 changed: []
run 4: watermark 2026-03-09T13:35:00+05:30 -&gt; 0 changed: []
   107 still in warehouse? True</div>
  <table class="tbl out"><caption>Trace: the watermark run by run</caption>
    <tr><th>Run</th><th>Watermark before</th><th>Rows with updated_at after it</th><th>Merged into</th><th>Watermark after</th></tr>
    <tr><td>1</td><td>1970-01-01 (nothing loaded)</td><td>all 10</td><td>5 day-folders (2, 3, 4, 5, 8 Mar)</td><td>03-08 20:50 (110, still pending)</td></tr>
    <tr><td>2</td><td>03-08 20:50</td><td>110 (updated 21:28), 111 (13:35 on 9 Mar)</td><td>order_date=2026-03-08 and 2026-03-09</td><td>03-09 13:35</td></tr>
    <tr><td>3</td><td>03-09 13:35</td><td>none</td><td>—</td><td>unchanged</td></tr>
    <tr><td>4</td><td>03-09 13:35</td><td>none (107 was deleted, so it has no row to be "after" anything)</td><td>—</td><td>unchanged</td></tr>
  </table>
  <p>Three things to notice. Run 2 read 2 rows, not 11: that is the saving. Order 110 was <em>replaced</em> inside the 8 March folder (pending → delivered, delivery minutes 38), because <code>merge_into_fact</code> dropped the old version and wrote the new one, and the 8 March folder was overwritten as a whole, so the merge is idempotent too. And the watermark was saved only <em>after</em> the merge succeeded: if the merge had crashed, the next run would ask for the same rows again instead of skipping them.</p>
  <p>Run 4 shows the blind spot. The app hard-deleted order 107; a deleted row has no <code>updated_at</code>, so the watermark query can never see it, and the warehouse still has 107. Fixes: the app marks rows as deleted instead (<strong>soft delete</strong>, a <code>deleted_at</code> column), or the pipeline reads the database's change log (<strong>CDC</strong>, which sees deletes), or a periodic full reconciliation.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Incremental load</strong>: extract only rows inserted or changed since the last successful run. <strong>Watermark</strong>: the stored high point of a monotonically increasing column (<code>updated_at</code>, an id) up to which data has been loaded. <strong>Merge</strong>: apply the changed rows to the target by key (update if present, insert if new).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saving the watermark before the load finishes loses rows on a crash. Using <code>&gt;</code> when two rows share the same <code>updated_at</code> and only one was loaded skips the other (load with <code>&gt;=</code> and dedupe by key, or watermark on a unique increasing id). Comparing timestamps as text, as we did, only works because every value has the same format and offset (<code>+05:30</code>); mixed time zones break it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: data quality checks.</b> The pipeline is now correct for correct input, safe to re-run and cheap. But it trusts its input completely. If the partner sheet loses a restaurant, or a "quick fix" removes the dedupe, it will load wrong numbers quickly, quietly and every night.</div>

  <h2 id="et-dq"><span class="num">08</span>Data Quality Checks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A job that runs green while loading 0 rows, or doubled rows, is worse than a job that crashes: the dashboard and the model trust it. How do we notice bad data <em>before</em> it is published, and what counts as "bad"?</p>
  </div>
  <p>In plain words: a <strong>data quality check</strong> is an automatic test on the data itself (not on the code), run between transform and load. If any check fails, the load does not happen. The useful checks compare the data with what we <em>know</em> must be true:</p>
  <table class="tbl">
    <tr><th>Check</th><th>What it compares</th><th>Catches</th></tr>
    <tr><td>Reconcile row count</td><td>rows out = rows extracted from the source</td><td>Fan-out from a join, dropped rows</td></tr>
    <tr><td>Unique key</td><td><code>order_id</code> appears once</td><td>Duplicates from a join or a re-delivered file</td></tr>
    <tr><td>Valid values</td><td>amount &gt; 0; status in a known set</td><td>New, unexpected kinds of data</td></tr>
    <tr><td>Enrichment succeeded</td><td>every order found a city</td><td>Missing reference data</td></tr>
    <tr><td>Freshness</td><td>newest <code>updated_at</code> is recent</td><td>The source stopped sending</td></tr>
    <tr><td>Schema</td><td>expected columns and types</td><td>A column renamed upstream</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A pharmacy's final check before handing over medicine: right patient, right count of tablets, not expired. It does not re-do the prescription; it compares the bag against what must be true, and holds the bag back if anything is off.</p>
  </div>
  <div class="fx" data-lang="py">class DataQualityError(Exception):
    pass

def check(df, source_rows):
    problems = []
    if len(df) != source_rows:
        problems.append(f"row count {len(df)} != source {source_rows}")
    if not df["order_id"].is_unique:
        problems.append("duplicate order_id")
    if (df["amount"] &lt;= 0).any():
        problems.append("amount &lt;= 0")
    if not df["status"].isin(["delivered", "cancelled", "pending"]).all():
        problems.append("unknown status")
    if df["city"].isna().any():
        problems.append("order with no restaurant city (enrich failed)")
    if problems:
        raise DataQualityError("; ".join(problems))
    return "ok"</div>
  <p>Now feed it two good days and three realistic bad batches:</p>
  <div class="fx" data-lang="py">from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, transform
from biteful_etl import check, DataQualityError

def run_checks(label, df, source_rows):
    try:
        print(f"{label:34} -&gt; {check(df, source_rows)}")
    except DataQualityError as e:
        print(f"{label:34} -&gt; FAIL: {e}")

rest = extract_restaurants()
for ds in ["2026-03-03", "2026-03-06"]:                      # 6 March: nobody ordered
    o = extract_orders(ds)
    run_checks(f"good batch {ds} ({len(o)} orders)", transform(o, rest, extract_deliveries(ds), ds), len(o))

ds = "2026-03-03"
o = extract_orders(ds)

# bad 1: a "quick fix" skipped clean_restaurants, so Green Bowl's duplicate row fans out
bad = o.merge(rest.astype({"restaurant_id": int}), on="restaurant_id")
bad["amount"] = bad["amount"].astype(float)
run_checks("bad: forgot the dedupe", bad, len(o))

# bad 2: a new restaurant (id 15) is not in the partner sheet yet
o2 = o.copy(); o2.loc[0, "restaurant_id"] = 15
run_checks("bad: restaurant missing from sheet", transform(o2, rest, extract_deliveries(ds), ds), len(o2))

# bad 3: the app starts sending refunds as negative amounts with a new status
o3 = o.copy(); o3.loc[1, ["amount", "status"]] = [-310, "refunded"]
run_checks("bad: refund rows", transform(o3, rest, extract_deliveries(ds), ds), len(o3))

# a naive check would cry wolf on a genuinely empty day
o6 = extract_orders("2026-03-06")
print("naive 'rows &gt; 0' check on 2026-03-06:", "pass" if len(o6) &gt; 0 else "FAIL (but the day really was empty)")</div>
  <div class="fx" data-lang="text">good batch 2026-03-03 (2 orders)   -&gt; ok
good batch 2026-03-06 (0 orders)   -&gt; ok
bad: forgot the dedupe             -&gt; FAIL: row count 3 != source 2; duplicate order_id
bad: restaurant missing from sheet -&gt; FAIL: order with no restaurant city (enrich failed)
bad: refund rows                   -&gt; FAIL: amount &lt;= 0; unknown status
naive 'rows &gt; 0' check on 2026-03-06: FAIL (but the day really was empty)</div>
  <p>Read each line. 3 March: 2 orders in, 2 out, all valid → ok. 6 March: 0 orders in, 0 out → ok, because nobody ordered. The forgotten dedupe gave 3 rows from a source of 2 and a repeated <code>order_id</code>: two checks caught the fan-out from section 03. The new restaurant 15 left an order with no city. The refund row broke two value rules. The last line is a lesson about checks themselves: "rows &gt; 0" sounds sensible but fails on a genuinely empty day. Compare with the <em>source</em>, not with a guess, or the team learns to ignore alerts.</p>
  <p>Libraries package these checks: Great Expectations, dbt tests, Soda, Pandera. The idea is the same as our ten-line function.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>data quality gate</strong> is a set of assertions on a batch, run after transform and before load; any failure stops the load. Good checks <strong>reconcile</strong> against the source (counts, sums) and test <strong>invariants</strong> (unique keys, valid ranges) rather than fixed guesses.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Dropping bad rows silently ("just filter them out") hides the problem and changes the totals. Write rejected rows to a <strong>quarantine</strong> table with the reason, fail if there are too many, and tell someone.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: orchestration.</b> We now have seven steps: three extracts, transform, check, load, gold. They must run in the right order, every night after the day ends, retry when the API hiccups, and re-run for past days when we fix a bug. Who does all that?</div>

  <h2 id="et-dag"><span class="num">09</span>Orchestration: DAGs, Schedules, Retries, Backfills</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A pipeline is a set of steps with an order ("transform needs all three extracts"), a timetable ("every night, for yesterday"), and failures ("the API answered 503"). Cron can start a script at midnight, but it can't say which steps depend on which, retry one step, or re-run last Tuesday. What do we need?</p>
  </div>
  <h3>The DAG: dependencies, traced</h3>
  <p>Write down, for each task, which tasks must finish first. Drawn as boxes and arrows, that is a <strong>DAG</strong>: a <em>directed acyclic graph</em>. Directed: arrows point from "first" to "then". Acyclic: no arrow path leads back to where it started, because "load needs build_gold needs load" could never begin.</p>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="et-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="11" text-anchor="middle">
      <rect x="5" y="10" width="125" height="32" rx="6" class="fb"/><text x="67" y="30">extract_orders</text>
      <rect x="5" y="58" width="125" height="32" rx="6" class="fb"/><text x="67" y="78">extract_restaurants</text>
      <rect x="5" y="106" width="125" height="32" rx="6" class="fb"/><text x="67" y="126">extract_deliveries</text>
      <rect x="175" y="58" width="90" height="32" rx="6" class="fv"/><text x="220" y="78">transform</text>
      <rect x="295" y="58" width="105" height="32" rx="6" class="ft"/><text x="347" y="78">quality_check</text>
      <rect x="430" y="58" width="85" height="32" rx="6" class="fg"/><text x="472" y="78">load_fact</text>
      <rect x="545" y="58" width="90" height="32" rx="6" class="fg"/><text x="590" y="78">build_gold</text>
    </g>
    <g stroke="currentColor" marker-end="url(#et-ar2)"><line x1="130" y1="26" x2="173" y2="68"/><line x1="130" y1="74" x2="173" y2="74"/><line x1="130" y1="122" x2="173" y2="80"/><line x1="265" y1="74" x2="293" y2="74"/><line x1="400" y1="74" x2="428" y2="74"/><line x1="515" y1="74" x2="543" y2="74"/></g>
    <text x="67" y="148" font-size="10" text-anchor="middle" class="tm">wave 1: run in parallel</text>
  </svg><figcaption>Biteful's nightly DAG. The three extracts don't depend on each other, so they can run at the same time.</figcaption></figure>
  <p>An orchestrator turns this graph into an order of execution: run every task whose needs are all done, mark it done, repeat. Python's standard library has exactly this algorithm (<code>graphlib</code>, a topological sort):</p>
  <div class="fx" data-lang="py">from graphlib import TopologicalSorter, CycleError

needs = {                                   # task -&gt; the tasks that must finish first
    "extract_orders": set(),
    "extract_restaurants": set(),
    "extract_deliveries": set(),
    "transform": {"extract_orders", "extract_restaurants", "extract_deliveries"},
    "quality_check": {"transform"},
    "load_fact": {"quality_check"},
    "build_gold": {"load_fact"},
}
ts = TopologicalSorter(needs)
ts.prepare()
wave = 1
while ts.is_active():
    ready = sorted(ts.get_ready())          # every task whose needs are all done
    print(f"wave {wave}: {ready}")
    ts.done(*ready)
    wave += 1

try:                                        # a loop can never be scheduled
    TopologicalSorter({"load_fact": {"build_gold"}, "build_gold": {"load_fact"}}).prepare()
except CycleError as e:
    print("CycleError:", e.args[1])</div>
  <div class="fx" data-lang="text">wave 1: ['extract_deliveries', 'extract_orders', 'extract_restaurants']
wave 2: ['transform']
wave 3: ['quality_check']
wave 4: ['load_fact']
wave 5: ['build_gold']
CycleError: ['load_fact', 'build_gold', 'load_fact']</div>
  <p>Trace it. Wave 1: the three extracts need nothing, so all are ready at once. Once they are marked done, transform's three needs are met: wave 2. Then check, load, gold, one per wave. A loop was refused immediately with the cycle spelled out. This "waves" view is also why a DAG is fast: independent tasks run in parallel.</p>
  <h3>Retries: for temporary failures only</h3>
  <p>A failed task can be retried automatically, but only some failures heal by waiting. A <strong>transient</strong> failure (a timeout, HTTP 503 "service unavailable", 429 "slow down") will probably work in a minute. A bad-data failure fails the same way a hundred times, so retrying just delays the alert. <strong>Exponential backoff</strong> waits longer after each failure (0.5 s, then 1 s, then 2 s), so a struggling server is not hammered. Here is a 30-line orchestrator that runs Biteful's tasks in DAG order with exactly these rules:</p>
  <div class="fx" data-lang="py">import time
from urllib.error import URLError
from biteful_etl import (extract_orders, extract_restaurants, extract_deliveries, transform,
                         check, load_overwrite, build_daily_city_revenue)

RETRYABLE = (URLError, TimeoutError, ConnectionError)    # transient: worth another try

def run_task(name, fn, retries=2, delay=0.5, verbose=True):
    for attempt in range(1, retries + 2):
        try:
            out = fn()
            if verbose:
                print(f"  {name:20} ok (attempt {attempt})")
            return out
        except RETRYABLE as e:
            if attempt &gt; retries:
                raise                                       # out of retries: fail the run
            print(f"  {name:20} failed: {e} -&gt; retry in {delay}s")
            time.sleep(delay)
            delay *= 2                                      # exponential backoff
        # any other exception (bad data, a bug) is NOT caught: it fails at once

def run_pipeline(ds, verbose=True):
    o = run_task("extract_orders", lambda: extract_orders(ds), verbose=verbose)
    r = run_task("extract_restaurants", extract_restaurants, verbose=verbose)
    d = run_task("extract_deliveries", lambda: extract_deliveries(ds), verbose=verbose)
    df = run_task("transform", lambda: transform(o, r, d, ds), verbose=verbose)
    run_task("quality_check", lambda: check(df, len(o)), retries=0, verbose=verbose)
    run_task("load_fact", lambda: load_overwrite(df, ds), verbose=verbose)
    return len(df)</div>
  <h3>Backfills: re-running past days</h3>
  <p>A <strong>backfill</strong> is running the pipeline again for past days: after fixing a bug, adding a column, or on the first deployment. It is just a loop over logical dates, and it is safe only because each run is idempotent (section 06) and parameterised by its day. The script below makes the API fail once, runs 2 March, then backfills 2–5 March (re-running 2 March on purpose):</p>
  <div class="fx" data-lang="py">import pandas as pd
from mini_orchestrator import run_pipeline
from biteful_etl import build_daily_city_revenue

open("state/fail_once", "w").close()          # the API will answer 503 once
print("run for ds=2026-03-02")
run_pipeline("2026-03-02")

print("backfill 2026-03-02 .. 2026-03-05")
for ds in pd.date_range("2026-03-02", "2026-03-05").strftime("%Y-%m-%d"):
    print(f"  {ds}: loaded {run_pipeline(ds, verbose=False)} orders")
print(build_daily_city_revenue())</div>
  <div class="fx" data-lang="text">run for ds=2026-03-02
  extract_orders       ok (attempt 1)
  extract_restaurants  ok (attempt 1)
  extract_deliveries   failed: HTTP Error 503: Service Unavailable -&gt; retry in 0.5s
  extract_deliveries   ok (attempt 2)
  transform            ok (attempt 1)
  quality_check        ok (attempt 1)
  load_fact            ok (attempt 1)
backfill 2026-03-02 .. 2026-03-05
  2026-03-02: loaded 3 orders
  2026-03-03: loaded 2 orders
  2026-03-04: loaded 2 orders
  2026-03-05: loaded 2 orders
   order_date    city  orders  revenue
0  2026-03-02  Mumbai       1    450.0
1  2026-03-02    Pune       2    760.0
2  2026-03-03    Pune       1    380.0
3  2026-03-04  Mumbai       1    180.0
4  2026-03-05  Mumbai       1    600.0
5  2026-03-05    Pune       1    260.0</div>
  <p>The API's 503 was retried after 0.5 s and worked on attempt 2: the run healed itself. The backfill re-ran 2 March, and the gold table still says Pune 760, Mumbai 450, not double. Check one more number by hand: 5 March = 108 at Dosa Hut (Pune, 260) + 109 at Biryani Bros (Mumbai, 600) ✓.</p>
  <h3>Schedules: the run for a day starts after the day ends</h3>
  <p>A <strong>schedule</strong> says when runs happen; each run is <em>for</em> a <strong>data interval</strong> (the period of data it processes), identified by its <strong>logical date</strong>. For a nightly load of "yesterday", the run for 2 March can only start once 2 March is over, at midnight going into 3 March. Airflow 3 has two daily timetables, and they differ exactly here. This is real output from Airflow 3.1.8's own timetable classes, with India time:</p>
  <div class="fx" data-lang="py">import pendulum
from airflow.timetables.trigger import CronTriggerTimetable          # what "@daily" means in Airflow 3
from airflow.timetables.interval import CronDataIntervalTimetable    # the Airflow 2 style
from airflow.timetables.base import TimeRestriction

start = pendulum.datetime(2026, 3, 2, tz="Asia/Kolkata")
for tt in [CronTriggerTimetable("0 0 * * *", timezone="Asia/Kolkata"),
           CronDataIntervalTimetable("0 0 * * *", timezone="Asia/Kolkata")]:
    run = tt.next_dagrun_info(last_automated_data_interval=None,
                              restriction=TimeRestriction(earliest=start, latest=None, catchup=True))
    f = lambda t: t.in_tz("Asia/Kolkata").format("MM-DD HH:mm")
    print(f"{type(tt).__name__:25} starts at {f(run.run_after)} | logical date {f(run.logical_date)}"
          f" | data interval {f(run.data_interval.start)} -&gt; {f(run.data_interval.end)}"
          f" | ds (UTC) {run.logical_date.in_tz('UTC').to_date_string()}")</div>
  <div class="fx" data-lang="text">CronTriggerTimetable      starts at 03-02 00:00 | logical date 03-02 00:00 | data interval 03-02 00:00 -&gt; 03-02 00:00 | ds (UTC) 2026-03-01
CronDataIntervalTimetable starts at 03-03 00:00 | logical date 03-02 00:00 | data interval 03-02 00:00 -&gt; 03-03 00:00 | ds (UTC) 2026-03-01</div>
  <p>Read the two lines. <code>CronTriggerTimetable</code> (what a plain <code>schedule="@daily"</code> means in Airflow 3) fires <em>at</em> 2 March 00:00 with an empty interval: a run that "happens at midnight", with no notion of yesterday. <code>CronDataIntervalTimetable</code> (Airflow 2's behaviour) starts on 3 March at 00:00 and covers 2 March 00:00 → 3 March 00:00: the right shape for a nightly ETL. Also look at the last column: Airflow's <code>ds</code> is the logical date's <em>UTC</em> date, and 2 March 00:00 IST is 1 March 18:30 UTC, so <code>ds</code> says 2026-03-01. Biteful's business day must come from the data interval in IST, which is what our DAG does in the next section.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school's attendance clerk files Monday's register on Tuesday morning, labelled "Monday". The label is the logical date; the filing time is the run time. Re-filing Monday's register in a month still says "Monday".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>DAG</strong>: tasks plus "must run before" edges, with no cycles. <strong>Schedule / data interval / logical date</strong>: when runs happen / the slice of time a run processes / the label of that slice. <strong>Retry</strong>: re-run a failed task after a delay, for transient errors. <strong>Backfill</strong>: run the pipeline for past logical dates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Retrying everything (including bad data and bugs) wastes hours and hides the real error under "attempt 3 of 3". Retry only errors that can heal by themselves; fail fast on the rest. And a backfill of a non-idempotent job is a disaster multiplied by the number of days.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Airflow and Prefect.</b> Our 30-line orchestrator runs one pipeline in one terminal. It has no calendar, no record of which days ran, no web page showing failures, no way to wait for a file, and it dies with the terminal. Real teams use a dedicated orchestrator.</div>

  <h2 id="et-air"><span class="num">10</span>Airflow &amp; Prefect</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what an orchestrator must do: run a DAG in order, on a schedule tied to a logical date, with retries, backfills and alerts, and remember every run. How do the real tools express that, and what are their pieces called?</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Apache Airflow</strong> is the most widely used open-source orchestrator. You describe a pipeline in a Python file as a <strong>DAG</strong>; Airflow's <strong>scheduler</strong> creates a <strong>DAG run</strong> for each data interval, and an <strong>executor</strong> runs each <strong>task</strong>, recording its state (queued, running, success, failed, up_for_retry, upstream_failed) in a metadata database.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Airflow is a conductor. It doesn't play the instruments (pandas, Spark, the warehouse do the heavy work); it tells each player when to start, waits for the ones who are late, and notices who stopped playing.</p>
  </div>
  <table class="tbl">
    <tr><th>Airflow piece</th><th>Meaning</th><th>In Biteful's DAG</th></tr>
    <tr><td><strong>Operator</strong></td><td>A template for one kind of work (PythonOperator, BashOperator, SQL operators, S3 operators…)</td><td><code>FileSensor</code>; each <code>@task</code> function is a Python operator</td></tr>
    <tr><td><strong>Task</strong></td><td>An operator placed in a DAG with an id; a <strong>task instance</strong> is one task in one run</td><td><code>extract_orders</code>, <code>transform</code>, …</td></tr>
    <tr><td><strong>XCom</strong></td><td>"Cross-communication": small values passed between tasks, stored in the metadata DB</td><td>A file path, a dict of counts</td></tr>
    <tr><td><strong>Sensor</strong></td><td>A task that waits until something is true (file exists, partition landed, other DAG done)</td><td><code>wait_for_sheet</code></td></tr>
    <tr><td><strong>Scheduler</strong></td><td>Decides which runs and tasks are due</td><td>Creates the run for 2 March on 3 March 00:00 IST</td></tr>
    <tr><td><strong>Executor</strong></td><td>Decides where tasks run: Local (processes on one machine), Celery (a pool of worker machines fed by a queue), Kubernetes (one pod per task)</td><td><code>dags test</code> runs tasks in-process</td></tr>
    <tr><td><strong>Connection</strong></td><td>Where a system lives and how to log in, kept as config, not code</td><td><code>fs_default</code> for the sensor</td></tr>
    <tr><td><strong>TaskGroup</strong></td><td>A visual folder of tasks in the UI (e.g. "extracts")</td><td>Not used; 7 tasks are readable flat</td></tr>
  </table>
  <p>Biteful's real DAG file. Each <code>@task</code> function becomes one task. Calling <code>transform(extract_orders(), r, extract_deliveries())</code> does two things at once: it draws the arrows (extracts → transform) <em>and</em> passes each return value into the next task through XCom. Returning a <em>path</em>, not a DataFrame, keeps XComs small.</p>
  <div class="fx" data-lang="py">import os, sys
from datetime import datetime, timedelta
from airflow.sdk import dag, task
from airflow.providers.standard.sensors.filesystem import FileSensor
from airflow.timetables.interval import CronDataIntervalTimetable

BASE = "/opt/biteful"
sys.path.insert(0, BASE)

def etl():                                    # run inside the project folder, import the ETL code
    os.chdir(BASE)
    import biteful_etl
    return biteful_etl

def ist_day(data_interval_start):            # the business day this run is FOR, in India time
    return data_interval_start.in_timezone("Asia/Kolkata").to_date_string()

def alert(context):                           # on_failure_callback: page a human
    print(f"ALERT biteful_daily day={ist_day(context['data_interval_start'])} task={context['task_instance'].task_id} failed")

@dag(
    schedule=CronDataIntervalTimetable("0 0 * * *", timezone="Asia/Kolkata"),  # run for day D starts after D ends
    start_date=datetime(2026, 3, 2),
    catchup=False,                            # don't auto-create runs for missed past days
    max_active_runs=1,
    default_args={"retries": 2, "retry_delay": timedelta(seconds=5),
                  "retry_exponential_backoff": True, "on_failure_callback": alert},
    tags=["biteful", "etl"],
)
def biteful_daily():
    wait_for_sheet = FileSensor(              # sensor: wait until the partner sheet exists
        task_id="wait_for_sheet", filepath=f"{BASE}/inbox/restaurants_sheet.csv",
        poke_interval=30, timeout=60 * 60, mode="reschedule")

    @task
    def extract_orders(ds=None, data_interval_start=None) -&gt; str:
        day = ist_day(data_interval_start)
        print(f"ds={ds}  data_interval_start={data_interval_start}  business day={day}")
        e = etl(); os.makedirs("warehouse/bronze", exist_ok=True)
        path = f"warehouse/bronze/orders_{day}.parquet"
        e.extract_orders(day).to_parquet(path, index=False)
        return path                           # return value -&gt; XCom (a small string)

    @task
    def extract_restaurants() -&gt; str:
        e = etl(); os.makedirs("warehouse/bronze", exist_ok=True)
        e.extract_restaurants().to_parquet("warehouse/bronze/restaurants.parquet", index=False)
        return "warehouse/bronze/restaurants.parquet"

    @task
    def extract_deliveries(data_interval_start=None) -&gt; str:
        day = ist_day(data_interval_start)
        e = etl(); os.makedirs("warehouse/bronze", exist_ok=True)
        path = f"warehouse/bronze/deliveries_{day}.parquet"
        e.extract_deliveries(day).to_parquet(path, index=False)
        return path

    @task
    def transform(o_path: str, r_path: str, d_path: str, data_interval_start=None) -&gt; dict:
        import pandas as pd
        day = ist_day(data_interval_start)
        e = etl(); os.makedirs("warehouse/silver", exist_ok=True)
        o = pd.read_parquet(o_path)
        df = e.transform(o, pd.read_parquet(r_path), pd.read_parquet(d_path), day)
        path = f"warehouse/silver/orders_{day}.parquet"
        df.to_parquet(path, index=False)
        return {"path": path, "day": day, "rows": len(df), "source_rows": len(o)}

    @task(retries=0)                          # bad data won't fix itself: no retries
    def quality_check(stats: dict) -&gt; dict:
        import pandas as pd
        etl().check(pd.read_parquet(stats["path"]), stats["source_rows"])
        return stats

    @task
    def load_fact(stats: dict):
        import pandas as pd
        etl().load_overwrite(pd.read_parquet(stats["path"]), stats["day"])
        print(f"overwrote partition order_date={stats['day']} with {stats['rows']} rows")

    r = extract_restaurants()
    wait_for_sheet &gt;&gt; r                       # explicit arrow for the sensor
    load_fact(quality_check(transform(extract_orders(), r, extract_deliveries())))

biteful_daily()</div>
  <p>(The real <code>BASE</code> path is shortened to <code>/opt/biteful</code> here.) Reading the top: <code>CronDataIntervalTimetable</code> gives "the run for day D starts after D ends" in India time (section 09). <code>catchup=False</code> stops Airflow from creating a run for every day since <code>start_date</code> the moment the DAG is deployed. <code>default_args</code> gives every task 2 retries with growing delays and an alert on failure; <code>quality_check</code> overrides retries to 0. <code>ist_day</code> turns the data interval into Biteful's business day, avoiding the UTC <code>ds</code>. <code>mode="reschedule"</code> makes the sensor give back its worker slot between checks instead of sleeping on it.</p>
  <p>A real test run. <code>airflow dags test</code> runs one DAG run in a single process; for a manual run at a given time, this timetable processes the day that just ended, so 3 March 00:00 IST processes 2 March:</p>
  <div class="fx" data-lang="text">$ export AIRFLOW_CONN_FS_DEFAULT='fs://'        # the connection FileSensor uses
$ airflow dags test biteful_daily 2026-03-03T00:00:00+05:30        # Airflow 3.1.8, log trimmed
ds=2026-03-02  data_interval_start=2026-03-01 18:30:00+00:00  business day=2026-03-02
Done. Returned value was: warehouse/bronze/orders_2026-03-02.parquet
[DAG TEST] end task task_id=extract_orders
[DAG TEST] end task task_id=wait_for_sheet
Done. Returned value was: warehouse/bronze/deliveries_2026-03-02.parquet
[DAG TEST] end task task_id=extract_deliveries
Done. Returned value was: warehouse/bronze/restaurants.parquet
[DAG TEST] end task task_id=extract_restaurants
Done. Returned value was: {'path': 'warehouse/silver/orders_2026-03-02.parquet', 'day': '2026-03-02', 'rows': 3, 'source_rows': 3}
[DAG TEST] end task task_id=transform
Done. Returned value was: {'path': 'warehouse/silver/orders_2026-03-02.parquet', 'day': '2026-03-02', 'rows': 3, 'source_rows': 3}
[DAG TEST] end task task_id=quality_check
overwrote partition order_date=2026-03-02 with 3 rows
Done. Returned value was: None
[DAG TEST] end task task_id=load_fact
DagRun Finished: logical_date=2026-03-02 18:30:00+00:00 state=success</div>
  <p>Follow it. The <code>ds=…</code> line shows the three dates: <code>ds</code> 2026-03-02 (the UTC date of the logical date, 2 March 18:30 UTC), the interval start 1 March 18:30 UTC (= 2 March 00:00 IST), and the business day 2026-03-02. Extract tasks ran in parallel waves, in whatever order the executor picked; each "Returned value" is an XCom; transform received the three paths and returned a small dict; quality_check passed it on; load_fact overwrote the 2 March partition with 3 rows. Same result as our 30-line orchestrator, now with a scheduler, a UI and a history of runs behind it.</p>
  <h3>Prefect: the same pipeline, lighter</h3>
  <p><strong>Prefect</strong> takes a different style: a pipeline is just a Python function marked <code>@flow</code>, and steps are functions marked <code>@task</code>. No DAG object: the order comes from normal function calls. Retries are a decorator argument. This is Biteful's pipeline in Prefect 3.8, with the API forced to fail once:</p>
  <div class="fx" data-lang="py">from prefect import flow, task
import biteful_etl as etl

@task(retries=2, retry_delay_seconds=1)          # transient errors: try again
def extract(ds):
    return etl.extract_orders(ds), etl.extract_restaurants(), etl.extract_deliveries(ds)

@task
def transform(raw, ds):
    o, r, d = raw
    return etl.transform(o, r, d, ds), len(o)

@task(retries=0)                                  # bad data: fail at once
def check_and_load(result, ds):
    df, source_rows = result
    etl.check(df, source_rows)
    etl.load_overwrite(df, ds)
    return len(df)

@flow(name="biteful-daily", log_prints=True)
def biteful_daily(ds: str):
    raw = extract(ds)
    n = check_and_load(transform(raw, ds), ds)
    print(f"loaded {n} orders for {ds}")

if __name__ == "__main__":
    open("state/fail_once", "w").close()          # the API will answer 503 once
    biteful_daily("2026-03-05")</div>
  <div class="fx" data-lang="text">$ python prefect_flow.py        # Prefect 3.8.8, log trimmed (timestamps removed)
Flow run 'hopping-ibex' - Beginning flow run 'hopping-ibex' for flow 'biteful-daily'
Task run 'extract-e9f' - Task run failed with exception: &lt;HTTPError 503: 'Service Unavailable'&gt; - Retry 1/2 will start 1 second(s) from now
Task run 'extract-e9f' - Finished in state Completed()
Task run 'transform-de9' - Finished in state Completed()
Task run 'check_and_load-553' - Finished in state Completed()
Flow run 'hopping-ibex' - loaded 2 orders for 2026-03-05
Flow run 'hopping-ibex' - Finished in state Completed()</div>
  <p>The extract task hit the 503, Prefect scheduled "Retry 1/2" after 1 second, and the second attempt completed; 5 March loaded 2 orders. Prefect started a temporary local server to record the run; in production you run a Prefect server (or Prefect Cloud) and deploy flows with schedules.</p>
  <table class="tbl">
    <tr><th></th><th>Airflow</th><th>Prefect</th><th>Dagster</th><th>Luigi</th></tr>
    <tr><td>Core idea</td><td>Tasks in a scheduled DAG</td><td>Plain Python functions as flows</td><td><strong>Assets</strong> (tables, models) and their lineage</td><td>Tasks with target outputs</td></tr>
    <tr><td>Strength</td><td>Industry standard, huge operator library, managed versions (MWAA, Cloud Composer, Astronomer)</td><td>Little boilerplate, dynamic flows, easy local runs</td><td>Typed I/O, testing, built-in partitions and backfills</td><td>Simple, no scheduler service</td></tr>
    <tr><td>Weakness</td><td>Heavier to run; task-centric, not data-centric</td><td>Smaller ecosystem</td><td>New concepts to learn</td><td>Legacy; little development</td></tr>
    <tr><td>Pick when</td><td>Default in most companies</td><td>Small team, Python-heavy ML</td><td>Asset-centric data/ML platforms</td><td>Maintaining an old stack</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Passing a DataFrame through XCom bloats the metadata database and slows every task; pass a path or table name. Code at the top level of a DAG file (API calls, database queries) runs every time the scheduler parses the file, every few seconds; keep it inside tasks. And <code>ds</code> is a UTC date: for a business outside UTC, derive the day from the data interval in the local time zone.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: error handling and alerting.</b> Retries fix the failures that heal by themselves. Some never will: the partner sheet loses a restaurant, the API is down all night. What should the pipeline do then, and who finds out?</div>

  <h2 id="et-err"><span class="num">11</span>Error Handling &amp; Alerting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Some failures survive every retry. When that happens, what must be true of the warehouse (did half a day get published?), and how does a human find out before the business does?</p>
  </div>
  <p>Three rules, in plain words. <strong>Classify</strong> the failure: transient (retry, then alert), bad data (don't retry, quarantine, alert), bug (don't retry, fix, then backfill). <strong>Publish nothing wrong</strong>: a failed run must leave the previous good data in place, never a half-written day. <strong>Fail loudly</strong>: an alert that names the pipeline, the day and the failing step, sent to a person (chat, e-mail, on-call pager).</p>
  <table class="tbl">
    <tr><th>Failure type</th><th>Biteful example</th><th>Response</th></tr>
    <tr><td>Transient</td><td>API 503, timeout, DB failover</td><td>Retry with exponential backoff; alert only if retries run out</td></tr>
    <tr><td>Bad data</td><td>Sheet lost Green Bowl, refund rows</td><td>No retries; block the load; quarantine; alert the data owner</td></tr>
    <tr><td>Logic bug</td><td>Wrong join, wrong time zone</td><td>Fix the code, then backfill the affected days</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A smoke alarm is useful because it is loud, specific to a room, and does not go off for toast. A pipeline alert should be the same: loud, specific (which day, which task), and rare enough that people still read it.</p>
  </div>
  <p>The mini orchestrator again, wrapped with an alert, through three nights: a normal one, a bad partner sheet, and the API down all night (we point the API address at a port where nothing listens):</p>
  <div class="fx" data-lang="py">import shutil
from mini_orchestrator import run_pipeline
from biteful_etl import read_partition

def alert(ds, err):                         # real life: Slack / PagerDuty / e-mail
    print(f"  ALERT biteful_daily ds={ds}: {type(err).__name__}: {err}")

def nightly(ds):
    try:
        print(f"  published {run_pipeline(ds, verbose=False)} orders for {ds}")
    except Exception as e:
        alert(ds, e)

print("1. normal night");              nightly("2026-03-03")
before = read_partition("2026-03-03")["amount"].sum()

print("2. partner sheet lost Green Bowl's row")
shutil.copy("inbox/restaurants_sheet.csv", "state/sheet_backup.csv")
lines = open("inbox/restaurants_sheet.csv").read().splitlines()
open("inbox/restaurants_sheet.csv", "w").write("\\n".join(l for l in lines if "Green Bowl" not in l) + "\\n")
nightly("2026-03-03")
shutil.copy("state/sheet_backup.csv", "inbox/restaurants_sheet.csv")
print("  partition 2026-03-03 untouched:", read_partition("2026-03-03")["amount"].sum() == before)

print("3. delivery API is down all night")
import biteful_etl
biteful_etl.API = "http://127.0.0.1:9"      # a port where nothing answers
nightly("2026-03-04")</div>
  <div class="fx" data-lang="text">1. normal night
  published 2 orders for 2026-03-03
2. partner sheet lost Green Bowl's row
  ALERT biteful_daily ds=2026-03-03: DataQualityError: order with no restaurant city (enrich failed)
  partition 2026-03-03 untouched: True
3. delivery API is down all night
  extract_deliveries   failed: &lt;urlopen error [Errno 111] Connection refused&gt; -&gt; retry in 0.5s
  extract_deliveries   failed: &lt;urlopen error [Errno 111] Connection refused&gt; -&gt; retry in 1.0s
  ALERT biteful_daily ds=2026-03-04: URLError: &lt;urlopen error [Errno 111] Connection refused&gt;</div>
  <p>Night 2 failed at the quality gate with no retries (bad data won't fix itself in 0.5 s), and the 3 March partition still holds the good data from night 1: <code>load_overwrite</code> never ran, and even if it had crashed it writes to a <code>.tmp</code> folder first. Night 3 retried twice with growing delays, then gave up and alerted. Airflow does the same with real state tracking. Here is the Biteful DAG on a night when the sheet lost Green Bowl:</p>
  <div class="fx" data-lang="text">$ airflow dags test biteful_daily 2026-03-04T00:00:00+05:30        # processes 3 March; log trimmed
Done. Returned value was: warehouse/bronze/deliveries_2026-03-03.parquet
[DAG TEST] end task task_id=extract_deliveries
ds=2026-03-03  data_interval_start=2026-03-02 18:30:00+00:00  business day=2026-03-03
Done. Returned value was: warehouse/bronze/orders_2026-03-03.parquet
[DAG TEST] end task task_id=extract_orders
[DAG TEST] end task task_id=wait_for_sheet
Done. Returned value was: warehouse/bronze/restaurants.parquet
[DAG TEST] end task task_id=extract_restaurants
Done. Returned value was: {'path': 'warehouse/silver/orders_2026-03-03.parquet', 'day': '2026-03-03', 'rows': 2, 'source_rows': 2}
[DAG TEST] end task task_id=transform
biteful_etl.DataQualityError: order with no restaurant city (enrich failed)
ALERT biteful_daily day=2026-03-03 task=quality_check failed
[DAG TEST] end task task_id=quality_check
DagRun Finished: logical_date=2026-03-03 18:30:00+00:00 state=failed
$ airflow tasks states-for-dag-run biteful_daily &lt;run_id&gt;        # columns trimmed
task_id              state
wait_for_sheet       success
extract_restaurants  success
extract_orders       success
extract_deliveries   success
transform            success
quality_check        failed
load_fact            upstream_failed</div>
  <p><code>quality_check</code> raised the DataQualityError, the <code>on_failure_callback</code> printed the alert with the business day, and <code>load_fact</code> became <strong>upstream_failed</strong>: it never ran, so nothing wrong was published. In production the callback posts to Slack or PagerDuty, and Airflow can also alert when a run is late (an SLA or deadline alert), which catches the pipeline that is stuck rather than failed.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Error handling</strong> in a pipeline means: classify failures (transient / data / bug), retry only the transient ones, keep the target unchanged on failure (atomic loads), and quarantine bad records. <strong>Alerting</strong> means notifying a human with enough context (pipeline, logical date, task, error) to act.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Too many alerts are as bad as none: if every flaky retry pages someone, people mute the channel and miss the real one. Alert on final failure and on lateness, not on every attempt. And never <code>except Exception: pass</code> inside a task: a swallowed error turns a loud failure into a silent wrong number.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: build it.</b> Every piece exists. Let's run the whole pipeline over Biteful's first week, the way it would run after its first deployment.</div>

  <h2 id="et-build"><span class="num">12</span>Build It: Biteful's First Week</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section ran one piece on one day. Does the whole pipeline (three extracts, transform, check, overwrite-load, gold table) produce the right warehouse for a whole week, including the empty days?</p>
  </div>
  <p>The first deployment is itself a backfill: run every day from 2 to 8 March, then build the gold table <code>daily_city_revenue</code> with the same overwrite rule.</p>
  <div class="fx" data-lang="py">import pandas as pd
from mini_orchestrator import run_pipeline
from biteful_etl import read_table, build_daily_city_revenue, load_overwrite
pd.set_option("display.width", 200); pd.set_option("display.max_columns", None)

days = pd.date_range("2026-03-02", "2026-03-08").strftime("%Y-%m-%d")
for ds in days:                                   # the first week, as a backfill
    print(ds, "loaded", run_pipeline(ds, verbose=False))
gold = build_daily_city_revenue()
for ds in gold["order_date"].unique():            # gold table: same overwrite rule
    load_overwrite(gold[gold["order_date"] == ds], ds, table="daily_city_revenue")
print(read_table()[["order_id", "order_date", "restaurant", "city", "status", "amount", "delivery_minutes"]])
print(gold)
print("total delivered revenue:", gold["revenue"].sum())</div>
  <div class="fx" data-lang="py">def build_daily_city_revenue():
    f = read_table("fact_orders")
    d = f[f["status"] == "delivered"]
    g = (d.groupby(["order_date", "city"], as_index=False)
           .agg(orders=("order_id", "count"), revenue=("amount", "sum")))
    return g</div>
  <div class="fx" data-lang="text">2026-03-02 loaded 3
2026-03-03 loaded 2
2026-03-04 loaded 2
2026-03-05 loaded 2
2026-03-06 loaded 0
2026-03-07 loaded 0
2026-03-08 loaded 1
   order_id  order_date    restaurant    city     status  amount  delivery_minutes
0       101  2026-03-02      Dosa Hut    Pune  delivered   240.0                32
1       102  2026-03-02  Biryani Bros  Mumbai  delivered   450.0                41
2       103  2026-03-02   Pizza Point    Pune  delivered   520.0                38
3       104  2026-03-03   Pizza Point    Pune  delivered   380.0              &lt;NA&gt;
4       105  2026-03-03    Green Bowl  Mumbai  cancelled   310.0              &lt;NA&gt;
5       106  2026-03-04  Biryani Bros  Mumbai  delivered   180.0                25
6       107  2026-03-04   Pizza Point    Pune  cancelled   260.0              &lt;NA&gt;
7       108  2026-03-05      Dosa Hut    Pune  delivered   260.0                29
8       109  2026-03-05  Biryani Bros  Mumbai  delivered   600.0                52
9       110  2026-03-08      Dosa Hut    Pune    pending   310.0              &lt;NA&gt;
   order_date    city  orders  revenue
0  2026-03-02  Mumbai       1    450.0
1  2026-03-02    Pune       2    760.0
2  2026-03-03    Pune       1    380.0
3  2026-03-04  Mumbai       1    180.0
4  2026-03-05  Mumbai       1    600.0
5  2026-03-05    Pune       1    260.0
total delivered revenue: 2630.0</div>
  <p>Check it against the table in section 01. 6 and 7 March loaded 0 orders and passed the checks (empty days are real). 104 has no delivery time (the partner never recorded it): kept as missing (<code>&lt;NA&gt;</code>), not invented, and the column stays an integer column on every day. 105 and 107 are in the fact table but not in revenue (cancelled), and 110 is still pending. Total delivered revenue: 240 + 450 + 520 + 380 + 180 + 260 + 600 = 2,630 ✓. Priya's morning e-mail is now one gold table that rebuilds itself every night, and a rerun of any day cannot change it.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The gold table is built from silver, so it must be rebuilt whenever silver changes (a backfill, an incremental merge like order 110's). In an orchestrator that means <code>build_gold</code> is downstream of <code>load_fact</code> in the DAG, never a separate cron job on its own clock.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We added one idea per section. Seen together, what does each one guard against, and what is built on what?</div>

  <h2 id="et-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Extract, transform, load, ELT, idempotency, watermarks, checks, DAGs, retries, backfills, Airflow, alerts: twelve separate topics, or one design?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="et-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="130" height="50" rx="8" class="fb sb"/><text x="75" y="40" text-anchor="middle" font-weight="700">Extract</text><text x="75" y="57" text-anchor="middle" class="tm">DB · file · API</text>
<line x1="140" y1="45" x2="173" y2="45" stroke="currentColor" marker-end="url(#et-a9)"/>
<rect x="175" y="20" width="130" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="240" y="40" text-anchor="middle" font-weight="700">Transform</text><text x="240" y="57" text-anchor="middle" class="tm">Pune 760 · Mumbai 450</text>
<line x1="305" y1="45" x2="338" y2="45" stroke="currentColor" marker-end="url(#et-a9)"/>
<rect x="340" y="20" width="130" height="50" rx="8" class="fr sr"/><text x="405" y="40" text-anchor="middle" font-weight="700">Quality gate</text><text x="405" y="57" text-anchor="middle" class="tm">3 bad batches stopped</text>
<line x1="470" y1="45" x2="503" y2="45" stroke="currentColor" marker-end="url(#et-a9)"/>
<rect x="505" y="20" width="205" height="50" rx="8" class="fg sg"/><text x="607" y="40" text-anchor="middle" font-weight="700">Load (overwrite / merge)</text><text x="607" y="57" text-anchor="middle" class="tm">Parquet day-folders → gold</text>
<line x1="75" y1="70" x2="75" y2="113" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#et-a9)"/>
<rect x="10" y="115" width="150" height="44" rx="8" class="fb sb"/><text x="85" y="133" text-anchor="middle">watermark: what changed?</text><text x="85" y="149" text-anchor="middle" class="tm">run 2: only 110, 111</text>
<line x1="607" y1="70" x2="607" y2="113" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#et-a9)"/>
<rect x="520" y="115" width="190" height="44" rx="8" class="fg sg"/><text x="615" y="133" text-anchor="middle">idempotent: rerun-safe</text><text x="615" y="149" text-anchor="middle" class="tm">1210 stays 1210 (append: 2420)</text>
<line x1="240" y1="70" x2="240" y2="113" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#et-a9)"/>
<rect x="175" y="115" width="150" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="250" y="133" text-anchor="middle">ELT: same T, in SQL</text><text x="250" y="149" text-anchor="middle" class="tm">DuckDB: identical rows</text>
<rect x="10" y="190" width="700" height="56" rx="10" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="360" y="210" text-anchor="middle" font-weight="700">Orchestrator (our 30 lines · Airflow · Prefect): DAG order · schedule per logical day · retries · backfills · alerts</text>
<text x="360" y="230" text-anchor="middle" class="tm">waves: 3 extracts ∥ → transform → check → load → gold · 503 healed on attempt 2 · bad sheet → upstream_failed + ALERT</text>
<line x1="360" y1="190" x2="360" y2="75" stroke="currentColor" stroke-dasharray="2 4"/>
<text x="10" y="275" class="tm">Top row = what the data goes through. Middle = the guards that make each step safe to repeat and cheap to run.</text>
<text x="10" y="292" class="tm">Bottom = the program that runs it all, by date, again and again. Backfills are only safe because of the middle row.</text>
</g>
</svg><figcaption>One pipeline. E, T and L move the data; idempotency, watermarks and the quality gate make repetition safe; the orchestrator supplies the repetition.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Extract</td><td>SQL, file reads, HTTP</td><td>how do we get the data out?</td><td>3 orders, 6 sheet rows, 2 API pages for 2 Mar</td><td>always; read replicas, not the primary</td></tr>
    <tr><td>Transform</td><td>pandas: dedupe, strip/title, to_datetime, merge</td><td>how do messy inputs become one table?</td><td>Pune 760, Mumbai 450; 12:10 IST = 06:40 UTC</td><td>always; validate every join</td></tr>
    <tr><td>Load (Parquet partitions)</td><td>one folder per day</td><td>where do results live?</td><td><code>order_date=2026-03-02/part-0.parquet</code>, 5,800 bytes</td><td>analytics; bulk loads</td></tr>
    <tr><td>ELT</td><td>load raw, then SQL</td><td>transform before or after storing?</td><td>DuckDB result = pandas result (True)</td><td>cloud warehouses; keep raw for replays</td></tr>
    <tr><td>Idempotency</td><td>partition overwrite, upsert, logical date</td><td>is a re-run safe?</td><td>append 2420 vs overwrite 1210</td><td>every load, always</td></tr>
    <tr><td>Incremental + watermark</td><td>idempotent merge + stored max <code>updated_at</code></td><td>what changed since last time?</td><td>10 → 2 (110, 111) → 0 rows; 107's delete missed</td><td>big tables that change; CDC if deletes matter</td></tr>
    <tr><td>Quality gate</td><td>assertions vs source and invariants</td><td>is this batch fit to publish?</td><td>3 bad batches failed; empty 6 Mar passed</td><td>between transform and load, every run</td></tr>
    <tr><td>DAG</td><td>tasks + dependencies, topological order</td><td>in which order, what in parallel?</td><td>5 waves; 3 extracts in parallel</td><td>any multi-step pipeline</td></tr>
    <tr><td>Retries + backoff</td><td>error classification</td><td>which failures heal by waiting?</td><td>503 → ok on attempt 2</td><td>transient errors only</td></tr>
    <tr><td>Backfill</td><td>loop over logical dates + idempotency</td><td>how do we fix past days?</td><td>2–5 Mar re-run, gold unchanged</td><td>after bug fixes, first deployment</td></tr>
    <tr><td>Airflow / Prefect</td><td>all of the above, as a service</td><td>who runs it every night and remembers?</td><td>real run: 7 tasks success; bad night: load upstream_failed</td><td>production pipelines</td></tr>
    <tr><td>Alerting</td><td>failure callbacks</td><td>who finds out, with what context?</td><td><code>ALERT biteful_daily day=2026-03-03 task=quality_check</code></td><td>final failures and lateness</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a pipeline will be run again and again, by machines, on data you have not seen, so every step must be safe to repeat and must refuse to publish what it cannot trust.</strong> Extract/transform/load move the data. Idempotency and watermarks make repetition harmless and cheap. Quality gates and alerts make failure loud instead of silent. The orchestrator is what does the repeating; backfills are just repetition you ask for on purpose.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Knowing the design, which slips still turn up in real pipelines and code reviews?</div>

  <h2 id="et-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pipeline bugs rarely crash. The job is green, the dashboard fills, and the number is wrong. Which ones should you look for first?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: plain append as the load</span>
    <p>The first retry doubles the day (1210 → 2420). Overwrite the run's partition or upsert by key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "yesterday" from the clock</span>
    <p>A rerun or backfill loads the wrong day (our clock version loaded 19 October for 2 March). Parameterise every step by the logical date.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: enrichment joins that change the row count</span>
    <p>A duplicate row in a lookup sheet fans out orders; an inner join drops orders with unknown keys. Left join, <code>validate=</code>, reconcile counts.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: saving the watermark too early</span>
    <p>If the load then fails, the next run skips the rows. Save it only after a successful load. And remember hard deletes never appear.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: checks that guess instead of reconcile</span>
    <p>"rows &gt; 0" fails on genuinely empty days and teaches people to ignore alerts. Compare with the source.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: retrying bad data</span>
    <p>Three retries of a DataQualityError only delay the alert. Retry transient errors only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: DataFrames in XCom, work at DAG top level</span>
    <p>XCom is for paths and counts; top-level code runs on every parse.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: UTC <code>ds</code> for a non-UTC business</span>
    <p>Midnight in India is 18:30 UTC the day before, so <code>ds</code> is off by a day. Use the data interval in the business time zone.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: <code>catchup=True</code> by accident</span>
    <p>Deploying a DAG with an old <code>start_date</code> creates a run for every missed day at once. Use <code>catchup=False</code> and run backfills on purpose.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="et-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful</strong>'s orders 101–110 (2–8 March 2026, IST). Delivered: 101 (Dosa Hut, Pune, 240), 102 (Biryani Bros, Mumbai, 450), 103 (Pizza Point, Pune, 520), 104 (Pizza Point, 380), 106 (Biryani Bros, 180), 108 (Dosa Hut, 260), 109 (Biryani Bros, 600); cancelled 105 (Green Bowl), 107; pending 110; no orders on 6–7 March. Sources: the app DB (orders), a hand-kept restaurant sheet (<code>' pune '</code>, <code>MUMBAI</code>, Green Bowl twice), and a delivery API (2 rows per page).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Manual ritual / naive script</td><td>why a pipeline?</td><td>Pune split into 240 + 520</td><td>no separate steps → E, T, L</td></tr>
    <tr><td>Extract</td><td>how to get data out?</td><td>3 orders, 6 sheet rows, 2 API pages</td><td>raw, messy, separate → transform</td></tr>
    <tr><td>Transform</td><td>one clean table?</td><td>Pune 760, Mumbai 450; plain merge fans 105 out</td><td>only in memory → load</td></tr>
    <tr><td>Load</td><td>where does it live?</td><td><code>order_date=2026-03-02/part-0.parquet</code></td><td>raw is lost → ELT</td></tr>
    <tr><td>ETL vs ELT</td><td>transform before or after storing?</td><td>DuckDB SQL = pandas (True)</td><td>reruns happen → idempotency</td></tr>
    <tr><td>Idempotency</td><td>is a rerun safe?</td><td>append 2420 vs overwrite 1210</td><td>old rows change → incremental</td></tr>
    <tr><td>Incremental + watermark</td><td>what changed?</td><td>10 → [110, 111] → 0; 107 delete missed</td><td>trusts input → quality checks</td></tr>
    <tr><td>Quality checks</td><td>publish this batch?</td><td>fan-out, missing city, refund caught</td><td>7 steps to run in order → orchestration</td></tr>
    <tr><td>DAG, schedule, retries, backfills</td><td>order, timing, healing, history</td><td>5 waves; 503 ok on attempt 2; backfill 2–5 Mar</td><td>DIY runner is fragile → Airflow/Prefect</td></tr>
    <tr><td>Airflow / Prefect</td><td>run it as a service</td><td>7 tasks success; XCom = paths, counts</td><td>some failures never heal → alerting</td></tr>
    <tr><td>Error handling &amp; alerting</td><td>what when it fails anyway?</td><td>load upstream_failed; ALERT day=2026-03-03</td><td>→ <a class="xref" data-note="de_spark">Spark</a> (bigger), <a class="xref" data-note="de_kafka">Kafka</a> (faster)</td></tr>
  </table>
  <h3>Definitions and rules</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>ETL / ELT</td><td>Extract → Transform → Load (clean outside, store result) / Extract → Load → Transform (store raw, clean inside with SQL)</td></tr>
    <tr><td>Clean / normalise / enrich</td><td>fix errors (dupes, types) / one form per meaning (spelling, UTC, currency) / add columns by joining reference data</td></tr>
    <tr><td>Partition</td><td>the slice of a table for one value (one day), stored as its own folder <code>order_date=…</code></td></tr>
    <tr><td>Bronze / silver / gold</td><td>raw as extracted / cleaned, one row per entity / business aggregates</td></tr>
    <tr><td>Idempotent</td><td>running once or N times leaves the same target state</td></tr>
    <tr><td>Partition overwrite / upsert</td><td>replace the run's slice / insert new keys, update existing (<code>ON CONFLICT … DO UPDATE</code>, <code>MERGE</code>)</td></tr>
    <tr><td>Watermark</td><td>stored max of an increasing column (updated_at) already loaded; next extract: <code>updated_at &gt; watermark</code></td></tr>
    <tr><td>CDC</td><td>change data capture: read the DB's change log; sees deletes</td></tr>
    <tr><td>Quality gate</td><td>assertions between transform and load; failure blocks the load</td></tr>
    <tr><td>DAG</td><td>directed acyclic graph of tasks; run in topological order, independent tasks in parallel</td></tr>
    <tr><td>Logical date / data interval</td><td>the label / the time range a run processes; the run for day D starts after D ends</td></tr>
    <tr><td>Retry + exponential backoff</td><td>re-run after waits that double (0.5 s, 1 s, 2 s…); transient errors only</td></tr>
    <tr><td>Backfill</td><td>run the pipeline for past logical dates</td></tr>
    <tr><td>Operator / task / XCom / sensor / executor</td><td>work template / its use in a DAG / small value passed between tasks / task that waits for a condition / where tasks run (Local, Celery, Kubernetes)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Full extract</b><p>Use for small reference tables (the 5 restaurants).</p><small>Avoid for big, growing tables: use incremental or CDC</small></div>
    <div><b>Incremental (watermark)</b><p>Use for big tables with a reliable <code>updated_at</code>.</p><small>Not if hard deletes matter: use CDC or soft deletes</small></div>
    <div><b>ETL</b><p>Use when data must be masked before landing, or the transform is not SQL.</p><small>Loses raw data unless you keep a bronze copy</small></div>
    <div><b>ELT</b><p>Use with a cloud warehouse; keep raw, transform with SQL/dbt.</p><small>Still needs silver/gold layers and tests</small></div>
    <div><b>Retries</b><p>Use for timeouts, 429, 503, failovers.</p><small>Never for bad data or bugs</small></div>
    <div><b>Airflow</b><p>Use as the team's standard scheduler with a big operator library.</p><small>Heavy for one small script; Prefect is lighter</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Append loads double on retry (1210 → 2420); clock-based dates break reruns; lookup duplicates fan out rows; watermark saved before the load loses rows, and deletes are invisible to it; "rows &gt; 0" fails on empty days; retrying bad data; DataFrames in XCom; UTC <code>ds</code> vs IST business day; accidental <code>catchup=True</code>; half-written partitions (write to temp, then swap).</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>2 March is loaded with append, then retried. Revenue?</td><td>2420 (each of 240, 450, 520 twice). With partition overwrite: 1210.</td></tr>
    <tr><td>Watermark is 03-08 20:50; 110 updated at 21:28 and 111 inserted. What does the next run extract?</td><td>Exactly 110 and 111; then it saves 03-09 13:35 as the new watermark.</td></tr>
    <tr><td>Order 107 is hard-deleted. Does the watermark extract notice?</td><td>No. A deleted row has no updated_at. Use soft deletes or CDC.</td></tr>
    <tr><td>In Biteful's DAG, which tasks can run in parallel?</td><td>The three extracts (wave 1); everything after depends on transform.</td></tr>
    <tr><td>The API returns 503; the sheet is missing a restaurant. Retry which?</td><td>The 503 (transient). The missing restaurant is bad data: fail at once, alert.</td></tr>
  </table>

  <h2 id="et-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, out loud and without notes, why each piece of a pipeline exists and what breaks without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>ETL vs ELT: which is more common today, and why?</summary><div class="qa-body">ELT. Cloud warehouses have cheap storage and elastic compute, so you land raw data and transform it with SQL/dbt inside; the raw copy stays available for reprocessing. ETL remains for data that must be masked before landing (PII) and for non-SQL transforms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does idempotent mean for a pipeline? Give two ways to achieve it.</summary><div class="qa-body">Running it N times leaves the same result as once. (1) Partition overwrite: replace the run's day (DELETE + INSERT in one transaction, or swap the day-folder). (2) Upsert/MERGE on a key. Both need the run to be parameterised by its logical date, not <code>now()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A daily job does <code>INSERT INTO sales SELECT … WHERE date = current_date - 1</code>. It failed after inserting, and was retried. What's wrong?</summary><div class="qa-body">The retry inserts the same rows again, so revenue doubles (Biteful: 1210 → 2420). And "current_date − 1" from the clock means a rerun next week loads the wrong day. Fix: <code>DELETE WHERE date = :ds</code> + <code>INSERT</code> in one transaction, with <code>ds</code> passed by the orchestrator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a backfill and what must be true for it to be safe?</summary><div class="qa-body">Re-running a pipeline for past logical dates, e.g. after fixing a bug or on first deployment. Safe only if each run is idempotent and reads/writes only its own date's data, using the logical date. Our backfill re-ran 2 March and the gold table stayed Pune 760, Mumbai 450.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Incremental extract by <code>updated_at</code> vs CDC?</summary><div class="qa-body">Watermark queries are simple but miss hard deletes (107 stayed in our warehouse), need a reliable <code>updated_at</code>, and query the source. CDC reads the database's change log (WAL/binlog, e.g. Debezium), captures every insert/update/delete in order within seconds, with little load on the source; it needs more infrastructure (Kafka, connectors).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which errors should be retried and which shouldn't?</summary><div class="qa-body">Retry transient ones (timeouts, 429, 503, connection resets) with exponential backoff. Don't retry deterministic ones (bad data, schema mismatch, code bugs): they fail the same way and the retries only delay the alert. Quarantine bad rows and fail loudly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name five data-quality checks you'd put before publishing an orders table.</summary><div class="qa-body">Row count equals the source count (reconcile); order_id unique; amount &gt; 0 and status in the known set; every order found its restaurant (enrichment succeeded); freshness (newest updated_at is recent); schema unchanged. Block the load on failure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is XCom, and what should you not put in it?</summary><div class="qa-body">Airflow's way of passing small values between tasks, stored in the metadata DB; TaskFlow return values become XComs automatically. Pass paths, table names, counts; never DataFrames or files. Our DAG passed <code>warehouse/bronze/orders_2026-03-02.parquet</code> and a dict of counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a sensor do, and why use <code>mode="reschedule"</code>?</summary><div class="qa-body">It waits until a condition is true: a file exists, a partition lands, another DAG finishes. In "poke" mode it holds a worker slot while sleeping; "reschedule" gives the slot back between checks, so many waiting sensors don't block real work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A DAG has <code>start_date=2025-01-01</code>, a daily schedule and <code>catchup=True</code>, and is deployed today. What happens?</summary><div class="qa-body">The scheduler creates a run for every missed day since 2025-01-01, hundreds of runs, possibly hammering the sources. Use <code>catchup=False</code> and run backfills deliberately, with <code>max_active_runs</code> limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the Airflow executors and when you'd use each.</summary><div class="qa-body">LocalExecutor: tasks as processes on the scheduler's machine; small teams. CeleryExecutor: a fixed pool of worker machines fed through a message queue; steady, high volume. KubernetesExecutor: one pod per task, scaled to zero when idle, isolated dependencies per task; bursty or heterogeneous workloads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a backfill need idempotency?</summary><div class="qa-body">A backfill re-runs days that were already loaded. If the load appends, every backfilled day is doubled (and for N re-runs, multiplied). With partition overwrite or upsert, re-running a day replaces it with the same or corrected rows, so the backfill can run any number of times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does an incremental load need a merge (upsert) rather than an append?</summary><div class="qa-body">The changed rows include rows already in the warehouse with an old version (110 was there as "pending"). Appending would keep both versions: 110 twice, once pending and once delivered. A merge by <code>order_id</code> replaces the old version; doing it by overwriting the affected day-folders keeps it idempotent too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the quality gate but keep everything else?</summary><div class="qa-body">The pipeline becomes very good at publishing wrong numbers: on schedule, retried until "successful", idempotently. The duplicate Green Bowl row would double order 105 every night; a missing restaurant would produce orders with no city. Nothing crashes, so nobody is alerted. Retries and alerts only help with failures that raise errors; the gate turns bad data into an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must the watermark be saved after the load, and what does that require of the load?</summary><div class="qa-body">Saving it first means a crash between saving and loading skips those rows forever. Saving it after means a crash makes the next run fetch the same rows again, so the load must tolerate seeing rows twice: it must be idempotent (merge by key). The watermark gives "at least once"; idempotency turns that into "exactly once" results, the same idea you'll meet in <a class="xref" data-note="de_kafka">Kafka</a>.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="de_spark">Apache Spark</a>.</b> Every step here ran in pandas on one machine, because Biteful's week fits in a few kilobytes. A year of a real delivery company's orders is 50 GB or more, and <code>pd.read_parquet</code> runs out of memory. The pipeline's design stays; the transform needs many machines.</div>
</main>
`
});
