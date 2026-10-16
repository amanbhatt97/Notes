// notes/dataeng/de_etl.js — ETL & Orchestration
Object.assign(TOPIC_CONTENT, {
  "de_etl": `<main>
  <h1>ETL &amp; Orchestration</h1>
  <p class="lead">How raw data from apps, APIs and files becomes clean tables you can train models on, every day, without breaking. The ideas that matter in interviews: idempotency, backfills, data quality and Airflow DAGs. Builds on SQL and pandas.</p>

  <h2 id="et-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ETL &amp; Orchestration</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">ETL vs ELT</div>
        <ul>
          <li><b>ETL</b> — transform before loading; old-school, fixed schema, compute outside warehouse</li>
          <li><b>ELT</b> — load raw first, transform inside warehouse with SQL (dbt)</li>
          <li><b>Why ELT won</b> — cheap cloud storage + elastic warehouse compute; raw data kept for replays</li>
          <li><b>Still ETL</b> — PII must be masked before landing; heavy non-SQL work (images, NLP)</li>
          <li>💡 ETL = cook then deliver; ELT = deliver groceries, cook in the client's kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extract</div>
        <ul>
          <li><b>APIs</b> — paginate, respect rate limits, retry 429/5xx with backoff</li>
          <li><b>DB full dump</b> — simple, heavy; fine for small tables</li>
          <li><b>Incremental</b> — <code>WHERE updated_at &gt; last_watermark</code>; misses hard deletes</li>
          <li><b>CDC</b> — read the DB's change log (WAL/binlog) via Debezium; catches inserts, updates, deletes</li>
          <li><b>Files</b> — CSV/JSON/Parquet dropped in S3/SFTP; wait with a sensor</li>
          <li>⚠ <b>Never</b> run heavy extracts on the prod primary; use a replica</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transform &amp; Load</div>
        <ul>
          <li><b>Clean</b> — dedupe, fix types, trim/case strings, handle NULLs, quarantine bad rows</li>
          <li><b>Enrich</b> — join reference data (FX rates, geo, user attributes)</li>
          <li><b>Normalize</b> — consistent units, currencies, time zones (store UTC)</li>
          <li><b>Targets</b> — warehouse (BigQuery/Snowflake), lake (S3 Parquet), OLTP DB, feature store</li>
          <li><b>Layers</b> — raw/bronze → cleaned/silver → business/gold</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Idempotency</div>
        <ul>
          <li><b>Definition</b> — running the same job twice gives the same result as once</li>
          <li><b>Why</b> — retries, crashes, manual reruns and backfills all re-run jobs</li>
          <li><b>Partition overwrite</b> — <code>DELETE WHERE date = ds; INSERT …</code> in one transaction</li>
          <li><b>Upsert</b> — <code>INSERT … ON CONFLICT (key) DO UPDATE</code> / <code>MERGE</code></li>
          <li><b>Parameterise by logical date</b> (<code>ds</code>), never <code>now()</code></li>
          <li>⚠ <b>Plain append</b> doubles rows on rerun (we saw revenue 165.6 → 331.2)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reliability</div>
        <ul>
          <li><b>Backfill</b> — rerun past dates after a bug fix or new column; needs idempotent, date-parameterised jobs</li>
          <li><b>Retries</b> — for transient errors (network, 429); exponential backoff; not for bad data</li>
          <li><b>Fail loudly</b> — alerts on failure/SLA miss; dead-letter bad records</li>
          <li><b>DQ checks</b> — row count, nulls, uniqueness, ranges, freshness, schema</li>
          <li><b>Tools</b> — Great Expectations, dbt tests, Soda; block the load if checks fail</li>
          <li>⚠ <b>Silent failure</b> — job "succeeds" with 0 rows; check counts</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Airflow</div>
        <ul>
          <li><b>DAG</b> — Python file defining tasks + dependencies, no cycles</li>
          <li><b>Operator</b> — task template (Python, Bash, SQL, S3…); <b>task</b> = instance in a DAG</li>
          <li><b>Schedule</b> — cron / <code>@daily</code>; run for date D starts after D ends</li>
          <li><b>catchup</b> — auto-run all missed intervals since <code>start_date</code></li>
          <li><b>XCom</b> — small values between tasks (paths, counts), not dataframes</li>
          <li><b>Sensor</b> — waits for a condition (file, partition, other DAG); <code>mode="reschedule"</code> frees the slot</li>
          <li><b>Alternatives</b> — Prefect (pythonic), Dagster (assets), Luigi (legacy)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="et-elt"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">ETL vs ELT</span><span class="rm-sub">Where the transform runs</span></div></div>
      <div class="rm-item rm-done" data-target="et-ext"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Extract, Transform, Load</span><span class="rm-sub">Sources, cleaning, targets</span></div></div>
      <div class="rm-item rm-done" data-target="et-idem"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Idempotency</span><span class="rm-sub">Re-running must be safe</span></div></div>
      <div class="rm-item rm-done" data-target="et-rel"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Backfills, Retries, Quality</span><span class="rm-sub">Pipelines that don't lie</span></div></div>
      <div class="rm-item rm-done" data-target="et-air"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Airflow</span><span class="rm-sub">DAGs, operators, XCom, sensors</span></div></div>
      <div class="rm-item rm-done" data-target="et-tools"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Orchestrator Comparison</span><span class="rm-sub">Airflow, Prefect, Dagster, Luigi</span></div></div>
      <div class="rm-item rm-done" data-target="et-build"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Build It: Local ETL</span><span class="rm-sub">CSV → pandas → Postgres</span></div></div>
      <div class="rm-item rm-done" data-target="et-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="et-elt"><span class="num">01</span>ETL vs ELT</h2>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="et-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="45" font-weight="bold">ETL</text>
    <rect x="60" y="22" width="110" height="38" rx="6" class="fs"/><text x="115" y="46" text-anchor="middle">Sources</text>
    <rect x="230" y="22" width="140" height="38" rx="6" class="fv"/><text x="300" y="40" text-anchor="middle">Transform</text><text x="300" y="54" text-anchor="middle" font-size="10">Spark / Python server</text>
    <rect x="430" y="22" width="150" height="38" rx="6" class="fb"/><text x="505" y="46" text-anchor="middle">Warehouse (clean)</text>
    <line x1="170" y1="41" x2="228" y2="41" stroke="currentColor" marker-end="url(#et-ar)"/>
    <line x1="370" y1="41" x2="428" y2="41" stroke="currentColor" marker-end="url(#et-ar)"/>
    <text x="10" y="125" font-weight="bold">ELT</text>
    <rect x="60" y="102" width="110" height="38" rx="6" class="fs"/><text x="115" y="126" text-anchor="middle">Sources</text>
    <rect x="230" y="92" width="350" height="62" rx="8" class="fb"/>
    <text x="405" y="108" text-anchor="middle" font-size="11">Warehouse</text>
    <rect x="245" y="115" width="90" height="30" rx="5" class="fs"/><text x="290" y="134" text-anchor="middle" font-size="11">raw</text>
    <rect x="370" y="115" width="80" height="30" rx="5" class="fv"/><text x="410" y="134" text-anchor="middle" font-size="11">SQL / dbt</text>
    <rect x="480" y="115" width="85" height="30" rx="5" class="fg"/><text x="522" y="134" text-anchor="middle" font-size="11">clean</text>
    <line x1="170" y1="121" x2="243" y2="128" stroke="currentColor" marker-end="url(#et-ar)"/>
    <line x1="335" y1="130" x2="368" y2="130" stroke="currentColor" marker-end="url(#et-ar)"/>
    <line x1="450" y1="130" x2="478" y2="130" stroke="currentColor" marker-end="url(#et-ar)"/>
  </svg><figcaption>Same three steps, different order. ELT keeps the raw copy inside the warehouse.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>ETL is a meal-kit company that cooks before delivering. ELT delivers raw groceries and cooks in your (huge) kitchen, so you can cook a different dish later.</p>
  </div>

  <h2 id="et-ext"><span class="num">02</span>Extract, Transform, Load</h2>
  <h3>Extract</h3>
  <table class="tbl">
    <tr><th>Method</th><th>How</th><th>Catch</th></tr>
    <tr><td>Full snapshot</td><td><code>SELECT *</code> every run</td><td>Simple; too heavy for big tables</td></tr>
    <tr><td>Incremental</td><td><code>WHERE updated_at &gt; :watermark</code></td><td>Misses hard deletes; needs a reliable timestamp</td></tr>
    <tr><td><strong>CDC</strong> (change data capture)</td><td>Stream the DB's write-ahead log (Debezium → Kafka)</td><td>Catches every insert/update/delete, near real time; more infra</td></tr>
    <tr><td>API</td><td>Paginated HTTP calls</td><td>Rate limits (429), retries, schema drift</td></tr>
    <tr><td>Files</td><td>CSV/JSON/Parquet land in S3 or SFTP</td><td>Need a sensor to know when they've arrived</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pulling a huge extract from the production primary DB slows the live app. Read from a replica or use CDC.</p>
  </div>
  <h3>Transform</h3>
  <div class="flow"><span>Dedupe</span><span>Fix types</span><span>Normalize (case, units, UTC)</span><span>Enrich (joins)</span><span>Validate</span></div>
  <h3>Load</h3>
  <div class="cards">
    <div><b>Warehouse</b><p>BigQuery, Snowflake, Redshift. SQL analytics, BI.</p><small>Bulk load (COPY), not row-by-row INSERT</small></div>
    <div><b>Data lake</b><p>Parquet files on S3/GCS, partitioned by date.</p><small>Cheap; Delta/Iceberg add ACID</small></div>
    <div><b>Database</b><p>Postgres for serving results to apps.</p><small>Upserts on a key</small></div>
  </div>
  <div class="flow"><span>bronze: raw as landed</span><span>silver: cleaned, typed</span><span>gold: business tables, features</span></div>

  <h2 id="et-idem"><span class="num">03</span>Idempotency</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A job is <strong>idempotent</strong> if running it twice leaves the same result as running it once.</p>
  </div>
  <p>Jobs <em>will</em> re-run: retries, crashes halfway, backfills. Non-idempotent jobs then double-count.</p>
  <div class="fx" data-lang="sql">-- naive: plain INSERT of the 2024-05-01 batch, run twice
INSERT INTO naive SELECT order_id, amount_usd FROM fact_orders WHERE order_date = '2024-05-01';
INSERT INTO naive SELECT order_id, amount_usd FROM fact_orders WHERE order_date = '2024-05-01';
SELECT count(*) AS rows, sum(amount_usd) AS revenue FROM naive;</div>
  <table class="tbl out"><caption>Result: revenue doubled</caption><tr><th>rows</th><th>revenue</th></tr><tr><td>6</td><td>331.2</td></tr></table>
  <table class="tbl out"><caption>Idempotent table after 2 runs (partition overwrite)</caption><tr><th>rows</th><th>revenue</th></tr><tr><td>3</td><td>165.6</td></tr></table>
  <div class="cards">
    <div><b>Partition overwrite</b><p>Delete the day, insert the day, one transaction.</p><small><code>DELETE … WHERE date = :ds; INSERT …</code> · Spark: dynamic partition overwrite</small></div>
    <div><b>Upsert / MERGE</b><p>Insert new keys, update existing ones.</p><small><code>INSERT … ON CONFLICT (id) DO UPDATE</code></small></div>
    <div><b>Deterministic inputs</b><p>Use the run's logical date, not the clock.</p><small><code>ds</code>, not <code>now()</code></small></div>
  </div>
  <div class="fx" data-lang="sql">INSERT INTO dim_city VALUES ('Mumbai', 1) ON CONFLICT (city) DO UPDATE SET orders = EXCLUDED.orders;
INSERT INTO dim_city VALUES ('Mumbai', 2) ON CONFLICT (city) DO UPDATE SET orders = EXCLUDED.orders;
SELECT * FROM dim_city;</div>
  <table class="tbl out"><caption>Result: one row, latest value</caption><tr><th>city</th><th>orders</th></tr><tr><td>Mumbai</td><td>2</td></tr></table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A light switch set to "ON" is idempotent: pressing ON twice still means on. A "toggle" button is not. Write jobs like the ON button.</p>
  </div>

  <h2 id="et-rel"><span class="num">04</span>Backfills, Retries, Quality</h2>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <text x="10" y="18" font-size="12" class="tm">Daily partitions of fact_orders</text>
    <g font-size="11" text-anchor="middle">
      <rect x="10" y="30" width="80" height="34" rx="4" class="fg"/><text x="50" y="52">05-01</text>
      <rect x="100" y="30" width="80" height="34" rx="4" class="fr"/><text x="140" y="52">05-02 bug</text>
      <rect x="190" y="30" width="80" height="34" rx="4" class="fr"/><text x="230" y="52">05-03 bug</text>
      <rect x="280" y="30" width="80" height="34" rx="4" class="fr"/><text x="320" y="52">05-04 bug</text>
      <rect x="370" y="30" width="80" height="34" rx="4" class="fg"/><text x="410" y="52">05-05 fixed</text>
      <rect x="460" y="30" width="80" height="34" rx="4" class="fg"/><text x="500" y="52">05-06</text>
    </g>
    <path d="M100,74 L100,84 L360,84 L360,74" fill="none" stroke="currentColor"/>
    <text x="230" y="104" text-anchor="middle" font-size="12" class="tb">backfill 05-02 → 05-04: rerun each date; overwrite its partition</text>
  </svg><figcaption>A backfill is only safe because each run overwrites exactly its own partition.</figcaption></figure>
  <div class="fx" data-lang="text">airflow backfill create --dag-id daily_orders --from-date 2024-05-02 --to-date 2024-05-04   # flags checked vs Airflow 3.3.2 --help</div>
  <table class="tbl">
    <tr><th>Failure type</th><th>Example</th><th>Response</th></tr>
    <tr><td>Transient</td><td>Timeout, HTTP 429/503, DB failover</td><td>Retry with exponential backoff (e.g. 3× at 5, 10, 20 min)</td></tr>
    <tr><td>Bad data</td><td>Price "abc", 40% nulls</td><td>Quarantine rows; fail if over a threshold; alert</td></tr>
    <tr><td>Logic bug</td><td>Wrong join, wrong currency</td><td>Fix, then backfill affected dates</td></tr>
  </table>
  <h3>Data quality checks</h3>
  <table class="tbl">
    <tr><th>Check</th><th>Catches</th></tr>
    <tr><td>Row count vs yesterday (±%)</td><td>Missing source file, broken join (fan-out)</td></tr>
    <tr><td>Unique key</td><td>Duplicates from a re-delivered file</td></tr>
    <tr><td>Not-null / range</td><td>Negative prices, missing IDs</td></tr>
    <tr><td>Freshness (<code>max(updated_at)</code>)</td><td>Upstream stopped sending</td></tr>
    <tr><td>Schema</td><td>Renamed / retyped column upstream</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The worst failure is silent: the job is green, but loaded 0 rows or doubled them. A model then trains on garbage. Check counts and uniqueness <em>before</em> publishing the table.</p>
  </div>

  <h2 id="et-air"><span class="num">05</span>Airflow</h2>
  <figure class="viz"><svg viewBox="0 0 600 90" width="600">
    <defs><marker id="et-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="11" text-anchor="middle">
      <rect x="5" y="25" width="100" height="36" rx="18" class="fv"/><text x="55" y="47">wait_for_file</text>
      <rect x="125" y="25" width="80" height="36" rx="6" class="fb"/><text x="165" y="47">extract</text>
      <rect x="225" y="25" width="90" height="36" rx="6" class="fb"/><text x="270" y="47">transform</text>
      <rect x="335" y="25" width="110" height="36" rx="6" class="ft"/><text x="390" y="47">quality_check</text>
      <rect x="465" y="25" width="70" height="36" rx="6" class="fg"/><text x="500" y="47">load</text>
    </g>
    <g stroke="currentColor" marker-end="url(#et-ar2)"><line x1="105" y1="43" x2="123" y2="43"/><line x1="205" y1="43" x2="223" y2="43"/><line x1="315" y1="43" x2="333" y2="43"/><line x1="445" y1="43" x2="463" y2="43"/></g>
    <text x="300" y="82" text-anchor="middle" font-size="11" class="tm">sensor → tasks; return values pass along as XCom; any failure stops downstream</text>
  </svg><figcaption>The DAG below, as Airflow sees it: a directed acyclic graph of tasks.</figcaption></figure>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td><strong>DAG</strong></td><td>Workflow: tasks + dependencies, no cycles. One Python file.</td></tr>
    <tr><td><strong>Operator / task</strong></td><td>Template for a unit of work (PythonOperator, BashOperator, SQL…). A task is an operator placed in a DAG.</td></tr>
    <tr><td><strong>DAG run / logical date</strong></td><td>One execution for one data interval. <code>ds</code> = that date as <code>YYYY-MM-DD</code>.</td></tr>
    <tr><td><strong>Scheduler / executor / workers</strong></td><td>Scheduler decides what's due; executor (Local, Celery, Kubernetes) runs it on workers.</td></tr>
    <tr><td><strong>XCom</strong></td><td>"Cross-communication": small values passed between tasks, stored in the metadata DB.</td></tr>
    <tr><td><strong>Sensor</strong></td><td>Task that waits for a condition (file, table partition, other DAG).</td></tr>
  </table>
  <div class="fx" data-lang="py">from datetime import datetime, timedelta
from airflow.sdk import dag, task
from airflow.providers.standard.sensors.filesystem import FileSensor

DATA = "/opt/data"                          # path shortened

@dag(
    schedule="@daily",                      # one run per day
    start_date=datetime(2024, 5, 1),
    catchup=False,                          # don't auto-run every missed day
    max_active_runs=1,
    default_args={"retries": 3, "retry_delay": timedelta(minutes=5),
                  "retry_exponential_backoff": True},
    tags=["etl"],
)
def daily_orders():
    wait = FileSensor(                       # sensor: wait until the file lands
        task_id="wait_for_file",
        filepath=DATA + "/orders_{{ ds }}.csv",
        poke_interval=60, timeout=60 * 60, mode="reschedule")

    @task
    def extract(ds=None) -&gt; str:             # ds = logical date, e.g. 2024-05-01
        return f"{DATA}/orders_{ds}.csv"     # return value -&gt; XCom (keep it small!)

    @task
    def transform(path: str) -&gt; dict:
        import pandas as pd
        df = pd.read_csv(path, dtype=str).drop_duplicates("order_id")
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        good = df.dropna(subset=["amount"])
        out = path.replace(".csv", ".clean.parquet")
        good.to_parquet(out, index=False)
        return {"path": out, "rows": len(good), "rejected": len(df) - len(good)}

    @task
    def quality_check(stats: dict) -&gt; dict:
        if stats["rows"] == 0:
            raise ValueError("empty batch")                 # fails -&gt; retries -&gt; alert
        if stats["rejected"] / (stats["rows"] + stats["rejected"]) &gt; 0.2:
            raise ValueError(f"too many bad rows: {stats}")
        return stats

    @task
    def load(stats: dict, ds=None):
        # real pipeline: DELETE partition ds + INSERT, in one transaction (idempotent)
        print(f"overwrite partition {ds} with {stats['rows']} rows from {stats['path']}")

    path = extract()
    wait &gt;&gt; path                            # explicit dependency for the sensor
    load(quality_check(transform(path)))

daily_orders()</div>
  <div class="fx" data-lang="text">$ export AIRFLOW_CONN_FS_DEFAULT='fs://'          # FileSensor needs this connection
$ airflow dags test daily_orders 2024-05-01        # Airflow 3.3.2, real run (log trimmed)
Poking for file /opt/data/orders_2024-05-01.csv
[DAG TEST] end task task_id=wait_for_file           new_state=success
Done. Returned value was: /opt/data/orders_2024-05-01.csv
[DAG TEST] end task task_id=extract                 new_state=success
Done. Returned value was: {'path': '/opt/data/orders_2024-05-01.clean.parquet', 'rows': 4, 'rejected': 1}
[DAG TEST] end task task_id=transform               new_state=success
[DAG TEST] end task task_id=quality_check           new_state=success
overwrite partition 2024-05-01 with 4 rows from /opt/data/orders_2024-05-01.clean.parquet
[DAG TEST] end task task_id=load                    new_state=success
Marking run &lt;DagRun daily_orders @ 2024-05-01 00:00:00+00:00 ...&gt; successful</div>
  <p>First attempt failed: <code>The conn_id fs_default isn't defined</code>, and the sensor went to <code>up_for_retry</code>. Connections are config, not code.</p>
  <ul>
    <li><strong>TaskFlow</strong> (<code>@task</code>): calling <code>transform(path)</code> wires the dependency <em>and</em> the XCom.</li>
    <li><strong>Scheduling</strong>: the run for 2024-05-01 starts <em>after</em> that day ends, since its data is complete only then.</li>
    <li><strong>catchup=True</strong> would create a run for every day since <code>start_date</code>. Handy for backfills, dangerous by accident.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Passing a DataFrame through XCom bloats the metadata DB. Pass a file path or table name; keep data in S3/warehouse. Also: top-level code in a DAG file (API calls, DB queries) runs on every parse, every few seconds.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Airflow is a conductor. It doesn't play the instruments (heavy compute runs in Spark, the warehouse, dbt); it tells each one when to start and what to do if it fails.</p>
  </div>

  <h2 id="et-tools"><span class="num">06</span>Orchestrator Comparison</h2>
  <table class="tbl">
    <tr><th></th><th>Airflow</th><th>Prefect</th><th>Dagster</th><th>Luigi</th></tr>
    <tr><td>Core idea</td><td>Tasks in a scheduled DAG</td><td>Plain Python functions as flows</td><td><strong>Assets</strong> (tables, models) and their lineage</td><td>Tasks with targets (outputs)</td></tr>
    <tr><td>Strength</td><td>Industry standard, huge operator library, managed (MWAA, Composer, Astronomer)</td><td>Little boilerplate, dynamic flows, easy local runs</td><td>Typed I/O, testing, data lineage, built-in partitions/backfills</td><td>Simple, no scheduler service</td></tr>
    <tr><td>Weakness</td><td>Heavier to run; task-centric, not data-centric</td><td>Smaller ecosystem</td><td>New concepts to learn</td><td>Legacy; little active development</td></tr>
    <tr><td>Pick when</td><td>Default in most companies</td><td>Small team, Python-heavy ML</td><td>Asset-centric data/ML platforms</td><td>Maintaining an old stack</td></tr>
  </table>

  <h2 id="et-build"><span class="num">07</span>Build It: Local ETL</h2>
  <p>Messy CSV → pandas → Postgres, with a quality gate and partition overwrite. Run against a throwaway DB (<code>createdb etl_demo</code>).</p>
  <div class="fx" data-lang="text">order_id,order_date,city,amount,currency
1,2024-05-01,mumbai,800,INR
2,2024-05-01, Delhi ,500,INR
2,2024-05-01, Delhi ,500,INR          &lt;- duplicate
3,2024-05-01,MUMBAI,abc,INR           &lt;- bad amount
4,2024-05-01,,150,USD                 &lt;- missing city
5,2024-05-02,Pune,40,USD</div>
  <div class="fx" data-lang="py">import sys, pandas as pd
from sqlalchemy import create_engine, text

RATES = {"INR": 0.012, "USD": 1.0}   # stand-in for an FX-rate API response

def extract(path):
    return pd.read_csv(path, dtype=str)

def transform(df):
    df = df.drop_duplicates("order_id")                         # dedupe
    df["city"] = df["city"].str.strip().str.title()             # normalize
    df["city"] = df["city"].fillna("Unknown")
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")  # 'abc' -&gt; NaN
    bad = df[df["amount"].isna()]
    df = df.dropna(subset=["amount"])
    df["amount_usd"] = (df["amount"] * df["currency"].map(RATES)).round(2)  # enrich
    df["order_id"] = df["order_id"].astype(int)
    return df, bad

def check(df):                                                  # data-quality gate
    assert df["order_id"].is_unique, "duplicate order_id"
    assert (df["amount_usd"] &gt; 0).all(), "non-positive amount"
    assert len(df) &gt; 0, "empty batch"

def load(df, run_date, engine):                                 # partition overwrite
    part = df[df["order_date"] == run_date]
    with engine.begin() as con:                                 # one transaction
        con.execute(text("""CREATE TABLE IF NOT EXISTS fact_orders(
            order_id int PRIMARY KEY, order_date date, city text,
            amount numeric, currency text, amount_usd numeric)"""))
        con.execute(text("DELETE FROM fact_orders WHERE order_date = :d"), {"d": run_date})
        part.to_sql("fact_orders", con, if_exists="append", index=False)
    return len(part)

if __name__ == "__main__":
    run_date = sys.argv[1]
    engine = create_engine("postgresql+psycopg2:///etl_demo")
    df, bad = transform(extract("raw_orders.csv"))
    check(df)
    n = load(df, run_date, engine)
    print(f"run_date={run_date} loaded={n} rejected={len(bad)}")</div>
  <div class="fx" data-lang="text">$ python etl.py 2024-05-01
run_date=2024-05-01 loaded=3 rejected=1
$ python etl.py 2024-05-01          # rerun: same result, no duplicates
run_date=2024-05-01 loaded=3 rejected=1
$ python etl.py 2024-05-02
run_date=2024-05-02 loaded=1 rejected=1</div>
  <table class="tbl out"><caption>SELECT * FROM fact_orders ORDER BY order_id;</caption>
    <tr><th>order_id</th><th>order_date</th><th>city</th><th>amount</th><th>currency</th><th>amount_usd</th></tr>
    <tr><td>1</td><td>2024-05-01</td><td>Mumbai</td><td>800.0</td><td>INR</td><td>9.6</td></tr>
    <tr><td>2</td><td>2024-05-01</td><td>Delhi</td><td>500.0</td><td>INR</td><td>6.0</td></tr>
    <tr><td>4</td><td>2024-05-01</td><td>Unknown</td><td>150.0</td><td>USD</td><td>150.0</td></tr>
    <tr><td>5</td><td>2024-05-02</td><td>Pune</td><td>40.0</td><td>USD</td><td>40.0</td></tr>
  </table>
  <p>Notice: duplicate removed, "mumbai"/" Delhi " normalised, row 3 rejected, rerun safe. Exercise: write rejected rows to a <code>quarantine</code> table and fail if they exceed 20%.</p>

  <h2 id="et-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>ETL vs ELT: which is more common today, and why?</summary><div class="qa-body">ELT. Cloud warehouses have cheap storage and elastic compute, so you land raw data and transform it with SQL/dbt inside. Raw data stays available for reprocessing. ETL remains for sensitive data that must be masked before landing, or heavy non-SQL transforms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does idempotent mean for a pipeline? Give two ways to achieve it.</summary><div class="qa-body">Running it N times gives the same result as once. (1) Partition overwrite: delete the run's date partition and insert, in one transaction. (2) Upsert/MERGE on a natural key. Also parameterise by the logical date, not <code>now()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A daily job does <code>INSERT INTO sales SELECT … WHERE date = yesterday</code>. It failed after inserting, and Airflow retried. What's wrong?</summary><div class="qa-body">The retry inserts the same rows again, so revenue doubles. Also "yesterday" from the clock breaks backfills. Fix: <code>DELETE WHERE date = '{{ ds }}'</code> + <code>INSERT</code> in one transaction, using the logical date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a backfill and what must be true for it to be safe?</summary><div class="qa-body">Re-running a pipeline for past dates, e.g. after fixing a bug or adding a column. Safe only if each run is idempotent and reads/writes only its own date partition, using the logical date. Otherwise reruns duplicate or overwrite the wrong data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Incremental extract by <code>updated_at</code> vs CDC?</summary><div class="qa-body">Watermark queries are simple but miss hard deletes, need a reliable <code>updated_at</code>, and load the source DB. CDC reads the database's change log (WAL/binlog, e.g. Debezium), captures every insert/update/delete in order, near real time, with little source load. It needs more infrastructure (Kafka, connectors).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which errors should be retried and which shouldn't?</summary><div class="qa-body">Retry transient ones: timeouts, 429/503, connection resets, with exponential backoff. Don't retry deterministic ones: bad data, schema mismatch, code bugs. Retrying them wastes time and delays the alert. Quarantine bad rows and fail loudly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name five data-quality checks you'd put before publishing a training table.</summary><div class="qa-body">Row count within ±X% of the usual; primary key unique; key columns not null; value ranges (price &gt; 0, age 0–120); freshness (latest timestamp is today); schema unchanged; label distribution not shifted sharply. Use dbt tests or Great Expectations, and block the load on failure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is XCom, and what should you not put in it?</summary><div class="qa-body">Airflow's mechanism for passing small values between tasks, stored in the metadata DB (TaskFlow return values go there automatically). Don't pass DataFrames or large files; pass a path or table name and keep data in object storage or the warehouse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a sensor do, and why use <code>mode="reschedule"</code>?</summary><div class="qa-body">It waits until a condition is true: a file exists, a partition lands, another DAG finishes. In the default "poke" mode it holds a worker slot while sleeping. "reschedule" releases the slot between checks, so 100 waiting sensors don't block real work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A DAG has <code>start_date=2023-01-01</code>, <code>schedule="@daily"</code>, <code>catchup=True</code> and is deployed today. What happens?</summary><div class="qa-body">The scheduler creates a run for every day from 2023-01-01 until now, hundreds of runs, possibly hammering sources. Set <code>catchup=False</code> unless you want that, and run backfills deliberately with <code>max_active_runs</code> limits.</div></details>
</main>`
});
