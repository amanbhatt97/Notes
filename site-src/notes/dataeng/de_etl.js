// notes/dataeng/de_etl.js — ETL & Orchestration
Object.assign(TOPIC_CONTENT, {
  "de_etl": `<main>
  <h1>ETL &amp; Orchestration</h1>
  <div class="where"><span>Data Engineering</span><span>ETL &amp; Orchestration</span></div>
  <p class="lead">A <strong>data pipeline</strong> is a program that collects data from the systems where it is created, cleans and combines it, and stores the result where analysts, dashboards and models can use it, every day, without anyone pressing a button. ETL (extract, transform, load) is the name for those three steps, and an <strong>orchestrator</strong> such as Airflow or Prefect is the program that runs them on time, in the right order, and again when something fails. Almost every number a company looks at in the morning was produced overnight by a pipeline like this, so knowing how to make one correct, safe to re-run and loud when it breaks is the core of data engineering. Our running example is Biteful, the small food-delivery company from the SQL and pandas notes: we will start from an analyst doing the job by hand in Excel, write a naive script, watch it fail, and then add one idea at a time until we have a scheduled, self-checking pipeline. Every output on this page comes from a real run (pandas, DuckDB, Spark, Airflow 3.1.8 and Prefect 3.9.3); the only stand-ins are SQLite playing the app's PostgreSQL database and a 25-line local web server playing the delivery partner's API.</p>

  <h2 id="et-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ETL &amp; Orchestration</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Moving the data</div>
        <ul>
          <li><b>Extract</b>: query the DB, read the file, page through the API</li>
          <li><b>Transform</b>: clean, normalise, enrich (joins)</li>
          <li><b>Load</b>: Parquet day-folders, bronze → silver → gold</li>
          <li><b>ELT</b>: load raw first, transform with SQL in the warehouse</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Safe to repeat</div>
        <ul>
          <li><b>Idempotent</b>: running twice = running once</li>
          <li>Partition overwrite or upsert, never plain append</li>
          <li>Every run takes its <b>logical date</b>, not the clock</li>
          <li><b>Watermark</b>: load only rows changed since last time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trust</div>
        <ul>
          <li>Quality gate between transform and load</li>
          <li>Reconcile with the source; test invariants</li>
          <li>Failed run publishes nothing; previous data stays</li>
          <li>Alert names the pipeline, day and task</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Orchestration</div>
        <ul>
          <li><b>DAG</b>: tasks + dependencies, no cycles</li>
          <li>Schedule: the run for day D starts after D ends</li>
          <li>Retry transient errors only, with backoff</li>
          <li><b>Backfill</b>: re-run past days (needs idempotency)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tools</div>
        <ul>
          <li><b>Airflow</b>: operators, tasks, XCom, sensors, scheduler, executor</li>
          <li><b>Prefect</b>: <code>@flow</code> and <code>@task</code> on plain functions</li>
          <li>dbt for SQL transforms in ELT</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="et-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Pipelines Exist</span><span class="rm-sub">the morning Excel job, and a script that gets it wrong</span></div></div>
      <div class="rm-item rm-done" data-target="et-ext"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Extract</span><span class="rm-sub">getting data out of a database, a file and an API</span></div></div>
      <div class="rm-item rm-done" data-target="et-tr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Transform</span><span class="rm-sub">cleaning, normalising and enriching into one table</span></div></div>
      <div class="rm-item rm-done" data-target="et-load"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Load</span><span class="rm-sub">storing the result as Parquet, one folder per day</span></div></div>
      <div class="rm-item rm-done" data-target="et-elt"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">ETL vs ELT</span><span class="rm-sub">transform before storing, or after</span></div></div>
      <div class="rm-item rm-done" data-target="et-idem"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Idempotency</span><span class="rm-sub">why a re-run must not double the numbers</span></div></div>
      <div class="rm-item rm-done" data-target="et-incr"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Incremental Loads and Watermarks</span><span class="rm-sub">loading only what changed since last time</span></div></div>
      <div class="rm-item rm-done" data-target="et-dq"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Data Quality Checks</span><span class="rm-sub">stopping bad data before anyone sees it</span></div></div>
      <div class="rm-item rm-done" data-target="et-dag"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">DAGs and Retries</span><span class="rm-sub">running steps in order and healing temporary failures</span></div></div>
      <div class="rm-item rm-done" data-target="et-sched"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Schedules, Logical Dates and Backfills</span><span class="rm-sub">which day a run is for, and re-running the past</span></div></div>
      <div class="rm-item rm-done" data-target="et-air"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Airflow and Prefect</span><span class="rm-sub">the real tools and their vocabulary</span></div></div>
      <div class="rm-item rm-done" data-target="et-err"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Error Handling and Alerting</span><span class="rm-sub">failing loudly without publishing anything wrong</span></div></div>
      <div class="rm-item rm-done" data-target="et-build"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">The Whole Pipeline</span><span class="rm-sub">Biteful's first week, end to end</span></div></div>
      <div class="rm-item rm-done" data-target="et-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">bugs that pass silently</span></div></div>
      <div class="rm-item rm-done" data-target="et-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, tables, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="et-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about pipelines</span></div></div>
    </div>
  </div>

  <h2 id="et-need"><span class="num">01</span>Why Pipelines Exist</h2>
  <p>Biteful delivers food in Pune and Mumbai. Its data is the same as in the SQL notes: a handful of customers, five restaurants, and ten orders placed between 2 and 8 March 2026. Here are the orders as the app stores them, with times in India Standard Time (IST):</p>
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
  <p>Nobody ordered on 6 and 7 March. That is not a mistake in the data, and it will matter when we write data quality checks.</p>
  <p>Every morning Priya, the operations analyst, produces one small table: yesterday's delivered revenue per city. To do it she downloads yesterday's orders from the admin panel, opens the restaurant sheet that the partner team keeps by hand (restaurant, city, cuisine, rating), looks up delivery times in the logistics partner's web portal, uses VLOOKUP to give each order its restaurant's city, fixes the spellings by eye, keeps only delivered orders, totals them per city and e-mails the result. It takes about an hour. It works, until Priya is on leave, or makes a typo, or the business asks for the same table for the last two years.</p>
  <p>The difficulty is that the data lives in three different places, each with its own way of getting it out. The orders are in the app's database (PostgreSQL in production; SQLite plays it here, with the same SQL). The restaurant details are in a CSV file, <code>inbox/restaurants_sheet.csv</code>, which is messy because people type into it: Dosa Hut's city is written <code>' pune '</code> with spaces, Biryani Bros is in <code>MUMBAI</code>, Green Bowl has been pasted in twice, and Momo Magic has no rating yet. The delivery times come from the logistics partner's web API, which hands them out two rows at a time and is sometimes slow or down.</p>
  <p>The obvious first step is to copy Priya's routine into a quick script for 2 March. <code>pd.read_sql</code> runs a SQL query and returns a pandas DataFrame, and <code>merge</code> plays the part of VLOOKUP:</p>
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
  <p>The script runs without any error, and the answer is wrong. Order 101 is at Dosa Hut, whose city the sheet spells <code>' pune '</code>; order 103 is at Pizza Point, spelled <code>'Pune'</code>. To a computer those are two different words, so Pune's real revenue of ₹760 is split into 240 and 520, and Mumbai appears in capitals. Priya fixes this by eye every morning without thinking about it; a script has to be told. And the problem is bigger than spelling. This script mixes everything into one block: if the sheet arrives late, if the API is down, or if someone runs it twice, nothing tells us, and when the number is wrong there is no way to see which part went wrong.</p>
  <p>Think of a restaurant kitchen. Nobody cooks a dish from field to plate in one movement. Suppliers deliver the ingredients, cooks wash, chop and season them, and the dish is plated and served. A head chef decides the order of the work and checks each plate before it leaves. Because each station has one job, a bad dish can be traced to the station that caused it.</p>
  <p>A data pipeline is organised the same way, and the three stations have standard names. <strong>Extract</strong> means reading the data from each source system. <strong>Transform</strong> means cleaning, combining and reshaping it. <strong>Load</strong> means writing the result to the place where people query it. Together they are called <strong>ETL</strong>. The program that plays head chef, running the steps every night in the right order, retrying them when they fail and telling someone when they cannot be fixed, is the <strong>orchestrator</strong>. The rest of this note builds each step as a separate Python function in a module called <code>biteful_etl.py</code>, then makes the whole thing safe to repeat, checks its output, and hands it to an orchestrator.</p>

  <h2 id="et-ext"><span class="num">02</span>Extract</h2>
  <p>Extracting means asking each source for the data one run needs and getting it, unchanged, into the pipeline (here, into a pandas DataFrame). The word "unchanged" matters: extract's only job is to bring the data in faithfully. Fixing it is the next step's job, and keeping the two apart means that when a number is wrong you can check whether the raw data was already wrong or whether your cleaning broke it.</p>
  <p>Each kind of source is asked in a different way. A database is asked with a SQL query, and you should ask only for the day you need, not the whole table. A file is read from a folder; with a hand-kept sheet it is safest to read every column as text, because a person may have typed anything into it, and to convert types later. A web API (a service that answers HTTP requests with JSON) usually does not return everything at once. It returns one <strong>page</strong> of results plus a pointer to the next page, and the client keeps asking until there is no next page. This is called <strong>pagination</strong>. It is like collecting vegetables from a market stall that will only hand you two bags at a time: you keep going back until the stall-holder says that was the last one.</p>
  <p>Here are the three extract functions, one per source. They are the first part of <code>biteful_etl.py</code>, and every later section adds to the same module:</p>
  <div class="fx" data-lang="py">import json, os, shutil, sqlite3
from urllib.request import urlopen
import pandas as pd

APP_DB = "src/biteful_app.db"                 # the app's database (SQLite stand-in for Postgres)
SHEET = "inbox/restaurants_sheet.csv"         # the partner team's hand-kept sheet
API = "http://127.0.0.1:18947"                # the logistics partner's delivery API
WH = "warehouse"                              # our Parquet "warehouse" (a folder of files)
STATE = "state/watermark.json"                # where the incremental load keeps its bookmark

def extract_orders(ds):                       # source 1: a database
    con = sqlite3.connect(APP_DB)
    df = pd.read_sql("SELECT * FROM orders WHERE substr(ordered_at, 1, 10) = ?", con, params=(ds,))
    con.close()
    return df

def extract_restaurants():                    # source 2: a file
    return pd.read_csv(SHEET, dtype=str)      # read everything as text; fix types later

def extract_deliveries(ds):                   # source 3: an API, 2 rows per page
    rows, page = [], 1
    while page:                               # keep asking until there is no next page
        with urlopen(f"{API}/deliveries?date={ds}&amp;page={page}", timeout=5) as r:
            body = json.load(r)
        rows += body["rows"]
        page = body["next_page"]
    return pd.DataFrame(rows, columns=["order_id", "delivery_minutes"])</div>
  <p>A few details are worth pointing at. Each function that depends on the day takes a parameter <code>ds</code> (short for "date stamp", the name Airflow uses) instead of working out the date itself; section 06 explains why that is essential. <code>params=(ds,)</code> passes the date to the database separately from the SQL text; pasting values into SQL strings is how SQL injection happens. <code>substr(ordered_at, 1, 10)</code> takes the date part of a timestamp like <code>2026-03-02T12:10:00+05:30</code>. The API loop starts at page 1, adds that page's rows, moves to <code>next_page</code>, and stops when the API answers <code>None</code>. Now run all three for 2 March, and also print what the API actually sent, page by page:</p>
  <div class="fx" data-lang="py">import json
from urllib.request import urlopen
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries
import pandas as pd
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

for page in (1, 2):                       # what the API actually sent, page by page
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
  <p>The database returned the three orders of 2 March with all seven columns, including <code>updated_at</code>, the time each row last changed, which section 07 will need. The sheet came back with six rows for five restaurants, still messy, and that is correct for an extract. The last two lines show pagination at work: three deliveries on 2 March, two per page, so page 1 carried orders 101 and 102 and said <code>next_page: 2</code>, and page 2 carried order 103 and said <code>next_page: None</code>, which ended the loop.</p>
  <p>Asking for one day is fine here, but real tables have crores of rows, so "how much do I extract each run?" becomes an important design question. There are three standard answers. A <strong>full snapshot</strong> copies the whole table every run, which is simple and fine for the five-row restaurant sheet but far too heavy for orders. An <strong>incremental</strong> extract asks only for rows that changed since the last run, using a column like <code>updated_at</code>; section 07 builds this. <strong>Change data capture</strong> (CDC) reads the database's own internal change log (the write-ahead log in PostgreSQL, the binlog in MySQL) with a tool like Debezium, which sees every insert, update and delete within seconds but needs streaming infrastructure such as <a class="xref" data-note="de_kafka">Kafka</a>. Files and APIs have their own catches: you must wait for a file to actually arrive before reading it (an Airflow <em>sensor</em> does this, section 11), and APIs impose rate limits (HTTP 429, "too many requests"), go down (HTTP 503, "service unavailable") and rename fields without warning.</p>
  <p>One operational rule belongs here too. A big extract run against the app's <em>primary</em> database competes with live customers for the same machine, and the app slows down because your job is hogging it. Production pipelines read from a <strong>replica</strong> (a read-only copy kept in sync with the primary) or use CDC, and they never fire API requests in a tight loop.</p>

  <h2 id="et-tr"><span class="num">03</span>Transform</h2>
  <p>We now hold three separate DataFrames for 2 March, and section 01 already showed what happens if we total them as they are. Transforming means changing the data until it can be trusted and used. The work falls into three kinds, usually done in this order. <strong>Cleaning</strong> fixes errors: removing the duplicate Green Bowl row, turning the text <code>'4.5'</code> into the number 4.5, turning an empty rating into a proper missing value. <strong>Normalising</strong> makes things that mean the same look the same: <code>' pune '</code>, <code>'Pune'</code> and <code>'PUNE'</code> all become <code>Pune</code>, and all times are converted to one time zone (UTC, Coordinated Universal Time) so that data from different places lines up. <strong>Enriching</strong> adds columns from other tables, usually with a join: each order gets its restaurant's name, city and cuisine from the sheet, and its delivery minutes from the API.</p>
  <p>Back in the kitchen, this is the work between delivery and cooking: throw out the duplicate bag of onions (clean), cut everything to the same size (normalise), and add the spices that turn vegetables into a dish (enrich). The result of a transform should have a clear <strong>grain</strong>, meaning a clear answer to "what does one row represent?". For Biteful's main table the grain is one row per order.</p>
  <p>The code is ordinary pandas (each method is covered in <a class="xref" data-note="da_pandas">Pandas</a> and <a class="xref" data-note="da_pd_cleaning">Data Cleaning</a>). The one new piece is the <code>validate=</code> argument to <code>merge</code>:</p>
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
    df["delivery_minutes"] = df["delivery_minutes"].astype("Int64")   # whole minutes or &lt;NA&gt;
    cols = ["order_id", "order_date", "ordered_at_utc", "customer_id", "restaurant",
            "city", "cuisine", "status", "amount", "delivery_minutes"]
    return df[cols].sort_values("order_id").reset_index(drop=True)</div>
  <p>Walk through it once. <code>drop_duplicates("restaurant_id")</code> keeps the first Green Bowl row and drops the second. <code>.str.strip().str.title()</code> removes the spaces around <code>' pune '</code> and fixes the capitals of <code>MUMBAI</code>. <code>pd.to_datetime(..., utc=True)</code> reads <code>2026-03-02T12:10:00+05:30</code> and converts it to UTC. At the same time <code>order_date = ds</code> keeps the <em>business</em> day, because "2 March's revenue" means 2 March in India, not in UTC. <code>how="left"</code> keeps every order even if its lookup fails, so a missing restaurant shows up as an empty city instead of silently removing the order. <code>astype("Int64")</code>, with a capital I, is pandas' nullable integer type: whole numbers that may be missing (<code>&lt;NA&gt;</code>); section 04 shows what goes wrong without it. Finally, <code>validate="many_to_one"</code> tells pandas "many orders may point at the same restaurant, but each restaurant must appear only once in the right-hand table; if not, stop". Here is the transform on 2 March:</p>
  <div class="fx" data-lang="py">import pandas as pd
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, clean_restaurants, transform
pd.set_option("display.width", 200); pd.set_option("display.max_columns", None)

rest = extract_restaurants()
print(clean_restaurants(rest))

ds = "2026-03-02"
clean = transform(extract_orders(ds), rest, extract_deliveries(ds), ds)
print(clean)
print(clean[clean["status"] == "delivered"].groupby("city")["amount"].sum())</div>
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
Name: amount, dtype: float64</div>
  <p>The cleaned sheet has five restaurants (the duplicate at index 4 is gone), every city is spelled one way, and Momo Magic's missing rating is a real <code>NaN</code> instead of an empty string. Trace one order by hand to be sure the transform is right. Order 101 was placed at 12:10 IST, and IST is UTC plus 5 hours 30 minutes, so in UTC it is 06:40, which is what the table shows. Its restaurant id is 10, which the clean sheet maps to Dosa Hut in Pune, and the API said 32 minutes. The totals at the bottom are Pune = 240 + 520 = 760 and Mumbai = 450: the number Priya e-mails, now produced by code.</p>
  <p>Why bother with <code>validate</code>? Because every enrichment join can quietly change the number of rows. On 3 March, order 105 is at Green Bowl, which the <em>raw</em> sheet lists twice. Watch what a plain merge does with it, and what <code>validate</code> does instead:</p>
  <div class="fx" data-lang="py">import pandas as pd
from biteful_etl import extract_orders, extract_restaurants

ds = "2026-03-03"                        # order 105 is at Green Bowl, listed twice in the raw sheet
o = extract_orders(ds)
raw = extract_restaurants().astype({"restaurant_id": int})
print("orders:", len(o), "-&gt; after a plain merge:", len(o.merge(raw, on="restaurant_id")))
try:
    o.merge(raw, on="restaurant_id", validate="many_to_one")
except pd.errors.MergeError as e:
    print("MergeError:", e)</div>
  <div class="fx" data-lang="text">orders: 2 -&gt; after a plain merge: 3
MergeError: Merge keys are not unique in right dataset; not a many-to-one merge</div>
  <p>The plain merge matched order 105 to both Green Bowl rows, so two orders became three, and 105's ₹310 would be counted twice in any total. This is the same <strong>fan-out</strong> described in <a class="xref" data-note="sql_joins">JOINs</a>: if the join key repeats on the side that should have one row per key, every match multiplies rows. With <code>validate="many_to_one"</code>, pandas refused the merge with a <code>MergeError</code> instead of silently doubling the money. The opposite danger is an inner join that drops orders whose restaurant is missing from the sheet. The habits that protect you are the ones in our transform: left joins, <code>validate=</code>, and comparing row counts before and after (section 08 turns that last habit into an automatic check).</p>

  <h2 id="et-load"><span class="num">04</span>Load</h2>
  <p>The clean table exists, but only in the memory of one Python process. When the script ends, it is gone, and nobody else can query a variable in someone's script. Loading means writing the result into the place where people and programs read it. Which place depends on who reads it: a <strong>data warehouse</strong> (BigQuery, Snowflake, Redshift) is a database built for large analytical SQL queries; a <strong>data lake</strong> is a cheap store of files, usually in cloud storage like S3; and sometimes an ordinary operational database such as PostgreSQL receives a result because an app needs it. Whatever the target, data is loaded in bulk (a COPY command, or a whole file at a time), never row by row.</p>
  <p>Biteful's warehouse is a folder of <strong>Parquet</strong> files, which is how real data lakes work. Parquet (introduced in <a class="xref" data-note="py_files">Files &amp; Data Formats</a>) stores a table column by column, with each column's type saved inside the file and each column compressed separately. A reader that needs three of nine columns reads only those three. We also give each day its own folder, named like <code>order_date=2026-03-02</code>. A <strong>partition</strong> is exactly this: the slice of a table for one value of a column, stored separately so that a job can read or replace one day without touching the others. The <code>column=value</code> folder naming is called <strong>Hive-style partitioning</strong>, and pandas, Spark and DuckDB all understand it: when they read the table, the folder name becomes a column again.</p>
  <p>A school office filing attendance registers is a good picture. It keeps one drawer per month with the month written on the front, so answering "how many absences in March?" means opening one drawer, not searching the whole cabinet; the drawers are the date partitions. And it keeps one register per subject, so the maths teacher never flips through the art register; that is column-by-column storage.</p>
  <div class="fx" data-lang="py">def part_dir(table, ds):
    return f"{WH}/{table}/order_date={ds}"

def load_overwrite(df, ds, table="fact_orders"):     # replace the day's folder
    d = part_dir(table, ds)
    tmp = d + ".tmp"
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    df.drop(columns="order_date").to_parquet(f"{tmp}/part-0.parquet", index=False)
    shutil.rmtree(d, ignore_errors=True)              # swap: old folder out, new folder in
    os.rename(tmp, d)

def read_table(table="fact_orders"):                  # all day-folders back as one table
    df = pd.read_parquet(f"{WH}/{table}")
    df["order_date"] = df["order_date"].astype(str)   # folder name becomes a column
    return df.sort_values("order_id").reset_index(drop=True)</div>
  <p><code>load_overwrite</code> writes the day's file into a temporary folder ending in <code>.tmp</code>, and only when the file is completely written does it delete the old day-folder and rename the temporary one into its place. The reason is crashes. If the job wrote straight into the final folder and died half-way, readers would see a half-written day. With the write-then-swap pattern, readers see either the old complete day or the new complete day, never something in between. (Warehouses and table formats like Delta Lake and Iceberg give the same guarantee with transactions.) <code>read_table</code> reads every day-folder back as one DataFrame. Load 2 March and look at what landed on disk:</p>
  <div class="fx" data-lang="py">import pandas as pd, pyarrow.parquet as pq
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, transform, load_overwrite

ds = "2026-03-02"
clean = transform(extract_orders(ds), extract_restaurants(), extract_deliveries(ds), ds)
load_overwrite(clean, ds)

for root, dirs, files in os.walk("warehouse"):
    for f in files:
        print(os.path.join(root, f), os.path.getsize(os.path.join(root, f)), "bytes")
print(pq.read_schema("warehouse/fact_orders/order_date=2026-03-02/part-0.parquet").remove_metadata())
print(pd.read_parquet("warehouse/fact_orders", columns=["order_id", "city", "amount", "order_date"]))</div>
  <div class="fx" data-lang="text">warehouse/fact_orders/order_date=2026-03-02/part-0.parquet 5844 bytes
order_id: int64
ordered_at_utc: string
customer_id: int64
restaurant: string
city: string
cuisine: string
status: string
amount: double
delivery_minutes: int64
   order_id    city  amount  order_date
0       101    Pune   240.0  2026-03-02
1       102  Mumbai   450.0  2026-03-02
2       103    Pune   520.0  2026-03-02</div>
  <p>There is one file in one day-folder. The schema printed from inside the file says <code>order_id: int64</code> and <code>amount: double</code>: the types travel with the data, whereas a CSV would hand back text that every reader must parse again. Reading with <code>columns=[...]</code> loaded only the columns asked for, and <code>order_date</code> came back as a column even though it is not stored in the file at all; it came from the folder name. Notice the size, too: about 5.8 KB for three rows is much bigger than a CSV would be, because every Parquet file carries a schema and statistics. That overhead pays off with millions of rows, and it is why thousands of tiny Parquet files are a well-known performance problem (see <a class="xref" data-note="de_spark">Spark</a>).</p>
  <p>Storing many days side by side brings a new rule: every partition of a table must have the same schema. The <code>astype("Int64")</code> line in the transform exists because this rule was broken while these notes were being written. On 2 March every order has a delivery time; on 4 March cancelled order 107 has none, and pandas turns an integer column with a gap into floating-point numbers. Here is what happens when two days are loaded without that line and Spark (the engine of the next note) reads the folder:</p>
  <div class="fx" data-lang="py">from biteful_etl import extract_orders, extract_deliveries
from pyspark.sql import SparkSession

for ds in ["2026-03-02", "2026-03-04"]:          # load WITHOUT pinning the type
    df = extract_orders(ds).merge(extract_deliveries(ds), on="order_id", how="left")
    print(ds, df["delivery_minutes"].tolist(), df["delivery_minutes"].dtype)
    os.makedirs(f"drift/order_date={ds}")
    df.to_parquet(f"drift/order_date={ds}/part-0.parquet", index=False)

spark = SparkSession.builder.master("local[2]").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")
try:
    spark.read.parquet("drift").select("order_id", "delivery_minutes").show()
except Exception as e:
    print([line.strip() for line in str(e).splitlines() if "Data type" in line][0])</div>
  <div class="fx" data-lang="text">2026-03-02 [32, 41, 38] int64
2026-03-04 [25.0, nan] float64
: org.apache.spark.SparkException: [FAILED_READ_FILE.PARQUET_COLUMN_DATA_TYPE_MISMATCH] Encountered error while reading file file:///tmp/claude-0/-home-user-Notes/9194a449-83bf-5a50-8c23-8ca2c91926cd/scratchpad/e1/work/drift/order_date=2026-03-04/part-0.parquet. Data type mismatches when reading Parquet column [delivery_minutes]. Expected Spark type bigint, actual Parquet type DOUBLE. SQLSTATE: KD001</div>
  <p>2 March was stored as <code>int64</code> and 4 March as <code>float64</code>, purely because of one missing value. pandas would read this folder without complaint, but Spark refused, because one column cannot be two types. This kind of slow, accidental change in a table's shape is called <strong>schema drift</strong>, and the fix is to set the output types explicitly in the transform, as ours now does.</p>
  <p>Teams usually keep the data in three <strong>layers</strong>, so that a bug in cleaning never destroys the original. <strong>Bronze</strong> holds the raw data exactly as extracted. <strong>Silver</strong> holds cleaned tables at a clear grain; our <code>fact_orders</code> table is silver. <strong>Gold</strong> holds business-level tables such as revenue per city per day. In the vocabulary of <a class="xref" data-note="sql_modeling">Data Modeling</a>, <code>fact_orders</code> is a <strong>fact table</strong> (one row per event, with measures like amount and minutes), and the cleaned restaurant sheet is a <strong>dimension</strong> (descriptive attributes of something the facts point at).</p>

  <h2 id="et-elt"><span class="num">05</span>ETL vs ELT</h2>
  <p>Our pipeline cleans the data in Python first and stores only the clean result. That raises an uncomfortable question. If the business changes its mind next month ("also count cancelled orders", "we need the customer's phone area"), or a cleaning rule turns out to be wrong, the raw data has not been kept anywhere, and we must extract everything again from the sources, which may no longer have it. Could we store first and clean later?</p>
  <p>We can, and the swap has a name. In <strong>ETL</strong> the transform happens on a separate machine (our Python script, or a Spark cluster) and only the clean result is loaded. In <strong>ELT</strong> (extract, load, transform) the raw data is loaded as it is into the warehouse first, into the bronze layer, and the transform then runs <em>inside</em> the warehouse, usually as SQL. The three steps are the same; only the order and the place of the transform change. <strong>dbt</strong> (data build tool) is the popular tool for organising those in-warehouse SQL transforms as version-controlled, tested models.</p>
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
  <p>Read the figure row by row. In the top row the data passes through a transform machine on its way to the warehouse, so what arrives is already clean and the raw form is left behind. In the bottom row the raw data goes straight into the warehouse's bronze area, and the transform is an arrow <em>inside</em> the warehouse, from bronze to silver. A meal-kit company that cooks before delivering is ETL: you get the dish, never the ingredients. ELT delivers raw groceries into a huge kitchen and cooks there, so tomorrow you can cook a different dish from the same groceries.</p>
  <p>Here is Biteful done the ELT way. The three raw extracts are landed untouched as bronze Parquet files, and the transform is written as SQL. DuckDB, an in-process SQL engine that reads Parquet files directly, plays the warehouse. The last line compares the SQL result with our pandas transform:</p>
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
  <p>Map the SQL back to section 03: <code>SELECT DISTINCT</code> is the dedupe, <code>upper(left(trim(city), 1)) || lower(...)</code> is the city normalisation, and the two <code>LEFT JOIN</code>s are the enrichment. The result is the same three rows with the same values, and the comparison prints <code>True</code>. What differs is where the work ran and what was kept: the raw files in <code>warehouse/bronze/</code> are still there, so a new rule next month is just a new SQL query over data we already have.</p>
  <p>ELT became the default with cloud warehouses for two reasons: storage became very cheap, and a warehouse can throw hundreds of machines at one SQL query, so there is little reason to transform elsewhere. ETL still wins in two situations. When personal data (<strong>PII</strong>, personally identifiable information, such as phone numbers) must be masked <em>before</em> it lands anywhere, the transform has to come first. And when the transform is not SQL-shaped (resizing images, running a model over text), it runs better in Python or Spark. One misunderstanding to avoid: ELT moves the cleaning, it does not remove it. If analysts query raw bronze tables directly, the company soon has ten slightly different versions of "revenue"; the silver and gold layers are still needed.</p>

  <h2 id="et-idem"><span class="num">06</span>Idempotency</h2>
  <p>ETL or ELT, a pipeline will run more than once for the same day. The orchestrator retries a task it thinks failed, a job crashes half-way and is started again, a colleague clicks "rerun", or a bug fix means last week must be processed again. So we have to ask what a second run of 2 March does to our table. The first load function many people write simply adds the day's rows to the table. Here it is, added to <code>biteful_etl.py</code>, next to the <code>load_overwrite</code> we already have:</p>
  <div class="fx" data-lang="py">def load_append(df, ds, table="fact_orders"):        # NOT idempotent: adds a new file each run
    d = part_dir(table, ds)
    os.makedirs(d, exist_ok=True)
    n = len(os.listdir(d))
    df.drop(columns="order_date").to_parquet(f"{d}/part-{n}.parquet", index=False)</div>
  <p>Now load 2 March with each function and then run it again, as a retry would:</p>
  <div class="fx" data-lang="py">import os, shutil
from biteful_etl import extract_orders, extract_restaurants, extract_deliveries, transform
from biteful_etl import load_append, load_overwrite, read_table, part_dir

ds = "2026-03-02"
clean = transform(extract_orders(ds), extract_restaurants(), extract_deliveries(ds), ds)
for load in (load_append, load_overwrite):
    shutil.rmtree("warehouse/fact_orders", ignore_errors=True)   # start from an empty table
    for run in (1, 2):                                           # run 2 = the retry
        load(clean, ds)
        f = read_table()
        print(f"{load.__name__:14} run {run}: rows={len(f)} revenue={f['amount'].sum():.0f} "
              f"files={sorted(os.listdir(part_dir('fact_orders', ds)))}")</div>
  <div class="fx" data-lang="text">load_append    run 1: rows=3 revenue=1210 files=['part-0.parquet']
load_append    run 2: rows=6 revenue=2420 files=['part-0.parquet', 'part-1.parquet']
load_overwrite run 1: rows=3 revenue=1210 files=['part-0.parquet']
load_overwrite run 2: rows=3 revenue=1210 files=['part-0.parquet']</div>
  <table class="tbl"><caption>What each run did to the 2 March folder</caption>
    <tr><th>Load</th><th>After run 1</th><th>After run 2 (the retry)</th><th>Revenue</th></tr>
    <tr><td>append</td><td>part-0 (101, 102, 103)</td><td>part-0 + part-1 (101, 102, 103 twice)</td><td>1210 → <strong>2420</strong> ✗</td></tr>
    <tr><td>overwrite</td><td>part-0 (101, 102, 103)</td><td>folder replaced: part-0 (101, 102, 103)</td><td>1210 → 1210 ✓</td></tr>
  </table>
  <p>With append, the retry added a second file holding the same three orders, and 2 March's revenue doubled from 1210 to 2420. No error was raised; the dashboard would simply show twice the money. With overwrite, the second run replaced the folder with an identical one, and the revenue stayed 1210 however many times it ran.</p>
  <p>The property overwrite has is called <strong>idempotency</strong>: a job is idempotent if running it once or many times with the same input leaves the target in the same state. A light switch with a fixed ON position is idempotent; pressing ON twice still means the light is on. A toggle button is not; press it twice and the light is off again. Load steps should be written like the ON switch, because a pipeline that is safe only when it runs exactly once will eventually be run twice. The dangerous part is that a non-idempotent load passes every test, because tests run it once; the first production retry doubles the numbers, and nobody may notice for a week.</p>
  <p>Our <code>load_overwrite</code> uses <strong>partition overwrite</strong>: each run replaces exactly the slice of the table it is responsible for, here one day-folder. In a SQL warehouse the same idea is <code>DELETE FROM fact_orders WHERE order_date = :ds</code> followed by <code>INSERT</code>, inside one transaction; Spark calls it dynamic partition overwrite. Sometimes, though, the unit of work is a row rather than a day. Biteful keeps a restaurant dimension table, and Momo Magic receives its first rating on Tuesday. For this we use an <strong>upsert</strong> (update if the key exists, insert if it does not), which is idempotent per key. SQLite and PostgreSQL share this syntax:</p>
  <div class="fx" data-lang="py">import sqlite3
wh = sqlite3.connect(":memory:")       # the same SQL works in PostgreSQL
wh.execute("CREATE TABLE dim_restaurant (restaurant_id INT PRIMARY KEY, name TEXT, rating REAL)")
upsert = """INSERT INTO dim_restaurant VALUES (?, ?, ?)
            ON CONFLICT (restaurant_id) DO UPDATE SET rating = excluded.rating"""
wh.execute(upsert, (14, "Momo Magic", None))   # Monday's run: not rated yet
wh.execute(upsert, (14, "Momo Magic", None))   # Monday's run again (a retry)
print(wh.execute("SELECT * FROM dim_restaurant").fetchall())
wh.execute(upsert, (14, "Momo Magic", 4.0))    # Tuesday's run: the first rating arrived
print(wh.execute("SELECT * FROM dim_restaurant").fetchall())</div>
  <div class="fx" data-lang="text">[(14, 'Momo Magic', None)]
[(14, 'Momo Magic', 4.0)]</div>
  <p>Monday's run executed twice and the table still has one row for restaurant 14, because the second insert hit the existing primary key and turned into an update. On Tuesday the same statement updated the rating to 4.0. <code>excluded.rating</code> means "the value I tried to insert". Warehouses spell the same idea <code>MERGE INTO ... WHEN MATCHED THEN UPDATE WHEN NOT MATCHED THEN INSERT</code>.</p>
  <p>There is a third, less obvious rule. A job is idempotent only if it processes the same input each time it runs for the same day, and a job that works out "yesterday" from the clock does not:</p>
  <div class="fx" data-lang="py">from datetime import date, timedelta

def job_with_clock():                  # "load yesterday", worked out from the clock
    return str(date.today() - timedelta(days=1))

def job_with_ds(ds):                   # the day the run is FOR, passed in
    return ds

# re-running 2 March's job (say, after a bug fix), today:
print("today              :", date.today())
print("clock version loads:", job_with_clock())
print("ds version loads   :", job_with_ds("2026-03-02"))</div>
  <div class="fx" data-lang="text">today              : 2026-11-19
clock version loads: 2026-11-18
ds version loads   : 2026-03-02</div>
  <p>This was run on the date shown in the first line, so the clock version would have loaded the day before that into what was supposed to be a re-run of 2 March. The version that receives the date as a parameter loads 2 March whenever it runs. Orchestrators call this parameter the <strong>logical date</strong>: the day a run is <em>for</em>, as opposed to the day it happens to execute. That is why every function in <code>biteful_etl.py</code> takes <code>ds</code>. Put together, the three tools of idempotency are partition overwrite for daily facts, upsert for dimensions and late changes, and the logical date as an input rather than <code>now()</code>.</p>

  <h2 id="et-incr"><span class="num">07</span>Incremental Loads and Watermarks</h2>
  <p>Overwriting whole days works for the day we just extracted, but rows change after the day they were created. Order 110 was <em>pending</em> on 8 March and was delivered later that evening. A daily extract that selects by <code>ordered_at</code> never looks back, so 110 would stay "pending" in the warehouse forever. Re-extracting every past day every night would catch the change, but on a table with years of orders that is enormously wasteful. We want to pick up exactly the rows that are new <em>or changed</em> since the last run, without reading the whole table.</p>
  <p>The tool is the <code>updated_at</code> column, which the app sets to the current time whenever it inserts or changes a row. If we remember the largest <code>updated_at</code> we have already loaded, the next run only needs rows with a later one. That remembered value is the <strong>watermark</strong>: the stored high point of an always-increasing column, up to which data has been loaded. Loading only the rows beyond it is an <strong>incremental load</strong>, and applying those rows to the warehouse by key (replace the old version if present, insert if new) is a <strong>merge</strong>. Think of reading a busy WhatsApp group: you do not reread the whole chat every evening; you scroll to the "unread messages" line and read from there. An old message that someone edits shows up again, because its time changed. The "last read" line is the watermark.</p>
  <p>Here is the incremental part of <code>biteful_etl.py</code>. The watermark lives in a small JSON file, <code>state/watermark.json</code>:</p>
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
  <p>Follow <code>incremental_run</code> from the top. It reads the watermark (on the very first run there is none, so it uses 1970 and everything counts as new), asks the database for every row whose <code>updated_at</code> is later, and hands those rows to <code>merge_into_fact</code>. The merge groups the changed rows by the day each order belongs to, transforms them, reads that day's existing folder, throws away the old versions of the changed orders, adds the new versions, and overwrites the folder with <code>load_overwrite</code>. Because the merge overwrites whole day-folders, it is idempotent too. Only after the merge succeeds does <code>save_watermark</code> move the bookmark forward.</p>
  <p>Between the first and second runs, Biteful's app does two things, written here as a script so we can replay them: order 110 is delivered, and Gita, who had never ordered before, orders from Momo Magic on 9 March.</p>
  <div class="fx" data-lang="py">import json, sqlite3
# what Biteful's app did after our last run (the pipeline doesn't know any of this yet)
con = sqlite3.connect("src/biteful_app.db")
con.execute("""UPDATE orders SET status = 'delivered', updated_at = '2026-03-08T21:28:00+05:30'
               WHERE order_id = 110""")                         # Asha's pending order arrived
con.execute("""INSERT INTO orders VALUES (111, 7, 14, '2026-03-09T13:00:00+05:30',
               'delivered', 220, '2026-03-09T13:35:00+05:30')""")   # Gita's first order
con.commit()
api = json.load(open("src/delivery_api_data.json"))                 # the partner API learns too
api["2026-03-08"] = [{"order_id": 110, "delivery_minutes": 38}]
api["2026-03-09"] = [{"order_id": 111, "delivery_minutes": 35}]
json.dump(api, open("src/delivery_api_data.json", "w"))</div>
  <p>Now run the incremental load four times: once to start, once after the app changes, once with nothing new, and once after the app hard-deletes cancelled order 107:</p>
  <div class="fx" data-lang="py">import shutil, sqlite3, subprocess, sys
from biteful_etl import incremental_run, read_table
shutil.rmtree("warehouse/fact_orders", ignore_errors=True)

incremental_run("run 1")                          # first run: the initial full load
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
  <table class="tbl"><caption>The watermark, run by run</caption>
    <tr><th>Run</th><th>Watermark before</th><th>Rows with a later updated_at</th><th>Merged into</th><th>Watermark after</th></tr>
    <tr><td>1</td><td>1970-01-01 (nothing loaded)</td><td>all 10</td><td>5 day-folders (2, 3, 4, 5, 8 Mar)</td><td>03-08 20:50 (110, still pending)</td></tr>
    <tr><td>2</td><td>03-08 20:50</td><td>110 (updated 21:28), 111 (13:35 on 9 Mar)</td><td>order_date=2026-03-08 and 2026-03-09</td><td>03-09 13:35</td></tr>
    <tr><td>3</td><td>03-09 13:35</td><td>none</td><td>nothing</td><td>unchanged</td></tr>
    <tr><td>4</td><td>03-09 13:35</td><td>none: 107 was deleted, so there is no row to be "later"</td><td>nothing</td><td>unchanged</td></tr>
  </table>
  <p>Three things are worth noticing. First, run 2 read two rows, not eleven; on a real table that is the difference between seconds and hours. Second, order 110 was <em>replaced</em> inside the 8 March folder, changing from pending to delivered and gaining its 38 delivery minutes, rather than appearing twice. Third, the watermark was saved only after the merge finished. If the merge had crashed, the watermark would still be at 20:50 and the next run would simply ask for 110 and 111 again. That is safe precisely because the merge is idempotent: seeing a row twice does no harm. The opposite order, saving the watermark first, would make a crash skip those rows forever.</p>
  <p>Run 4 shows the blind spot of watermarks. The app deleted order 107 outright, and a deleted row has no <code>updated_at</code>, so no query of the form "rows changed after X" can ever see it; the warehouse still has 107. There are three standard fixes: have the app mark rows as deleted instead of removing them (a <strong>soft delete</strong>, usually a <code>deleted_at</code> column, which does change <code>updated_at</code>); read the database's change log with CDC, which records deletes; or run a periodic full comparison between source and warehouse. Two smaller cautions apply as well. Comparing timestamps as text, as we do, only works because every value has exactly the same format and the same <code>+05:30</code> offset; mixed time zones would break it. And when two rows share the same <code>updated_at</code>, a watermark on time alone can skip one of them, a problem shown in Common Mistakes.</p>

  <h2 id="et-dq"><span class="num">08</span>Data Quality Checks</h2>
  <p>The pipeline is now correct for correct input, safe to re-run and cheap to keep up to date. But it trusts its input completely. If the partner sheet loses a restaurant, or a hurried "quick fix" removes the dedupe, the pipeline will load wrong numbers quickly, quietly and every night. A job that crashes is annoying; a job that runs green while loading doubled or missing rows is far worse, because the dashboard and the models believe it.</p>
  <p>A <strong>data quality check</strong> is an automatic test on the data itself, not on the code, run after the transform and before the load. If any check fails, the load does not happen. A set of such checks placed in the pipeline is often called a <strong>quality gate</strong>. Think of a pharmacy's final check before handing over medicine: right patient, right number of tablets, not expired. The pharmacist does not rewrite the prescription; they compare the bag with what must be true and hold it back if anything is off.</p>
  <p>The useful checks compare the batch with things we <em>know</em> must be true, either by <strong>reconciling</strong> it with the source (the number of orders out must equal the number extracted) or by testing an <strong>invariant</strong>, a rule that always holds (<code>order_id</code> is unique, amounts are positive, status is one of a known set, every order found its restaurant's city). Other common checks are freshness (is the newest <code>updated_at</code> recent, or did the source stop sending?) and schema (are the expected columns and types present?). Here is Biteful's gate:</p>
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
  <p>Now feed it two good days and three realistic bad batches. Each bad batch is something that really happens in companies: a code change that drops a cleaning step, a new restaurant that the partner team has not added to the sheet yet, and the app starting to send refunds in a new format:</p>
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
  <p>Read the output line by line. On 3 March, two orders went in and two valid rows came out, so the gate passed. On 6 March, zero orders went in and zero came out, and the gate also passed, because nobody ordered that day. The forgotten dedupe produced three rows from a source of two and a repeated <code>order_id</code>: two separate checks caught the fan-out from section 03. The new restaurant 15 left an order with no city. The refund broke two value rules at once. In each case the error message says exactly what was wrong, which is what the person woken by the alert needs.</p>
  <p>The last line is a lesson about checks themselves. "The batch must have more than zero rows" sounds sensible, but it fails on 6 March, a genuinely empty day. A check that cries wolf teaches the team to ignore alerts, which is worse than having no check. That is why our gate compares with the source rather than with a guess. When bad rows should not stop the whole batch, the right move is not to filter them out silently (that hides the problem and changes the totals) but to write them to a <strong>quarantine</strong> table with the reason, fail if there are too many, and tell someone. Libraries package these ideas, including Great Expectations, dbt tests, Soda and Pandera, but they all do what our fifteen-line function does.</p>

  <h2 id="et-dag"><span class="num">09</span>DAGs and Retries</h2>
  <p>We now have seven steps: three extracts, transform, quality check, load, and the gold table. They must run in a particular order (the transform needs all three extracts), every night, and failures must be handled sensibly. The traditional Unix scheduler, cron, can start a script at midnight, but it knows nothing about which steps depend on which, cannot retry one step, and cannot re-run last Tuesday. This is the job of an orchestrator, and the first thing it needs is a description of the dependencies.</p>
  <p>If you write down, for each task, which tasks must finish before it can start, and draw it as boxes and arrows, you get a <strong>DAG</strong>, a <em>directed acyclic graph</em>. "Directed" means each arrow points one way, from "first" to "then". "Acyclic" means that following the arrows never brings you back to where you started; a loop such as "load needs gold, gold needs load" could never begin, so it is not allowed.</p>
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
  <p>In Biteful's DAG the three extracts on the left have no arrows coming into them, so nothing has to happen before them. All three arrows converge on <code>transform</code>, which therefore waits for the slowest extract. After that the tasks form a single chain. An orchestrator turns such a graph into an order of execution with a simple loop: find every task whose prerequisites are all done, run those, mark them done, repeat. This is a <strong>topological sort</strong>, and Python's standard library has it in <code>graphlib</code>:</p>
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
  <p>In wave 1 the three extracts need nothing, so all of them are ready at once and could run in parallel. Once they are marked done, all of transform's needs are met, so it forms wave 2, followed by the check, the load and the gold table one per wave. The attempt to schedule a two-task loop was refused immediately, with the cycle spelled out. The waves also explain why expressing a pipeline as a DAG makes it faster: anything not connected by an arrow can run at the same time.</p>
  <p>The second thing an orchestrator does is retry failed tasks, and here a distinction matters. Some failures heal by themselves: a network timeout, an HTTP 503 from an overloaded server, a 429 telling you to slow down, a database failing over to its standby. These are called <strong>transient</strong> failures, and trying again in a moment will probably work. Other failures are permanent for this input: bad data, a schema mismatch, a bug in the code. Retrying those fails the same way every time and only delays the alert. A good retry policy also waits longer after each failure, for example 0.5 seconds, then 1, then 2, so that a struggling server is not hammered by clients that all retry at once. This is <strong>exponential backoff</strong>.</p>
  <p>Here is a 30-line orchestrator, <code>mini_orchestrator.py</code>, that runs Biteful's tasks in DAG order with exactly these rules. Only network errors are caught and retried; anything else propagates immediately, and the quality check gets no retries at all:</p>
  <div class="fx" data-lang="py">import time
from urllib.error import URLError
from biteful_etl import (extract_orders, extract_restaurants, extract_deliveries, transform,
                         check, load_overwrite)

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
  <p>To see a retry happen, the stand-in API can be told to answer the next request with a 503:</p>
  <div class="fx" data-lang="py">from mini_orchestrator import run_pipeline

open("state/fail_once", "w").close()          # the API will answer 503 once
print("run for ds=2026-03-02")
run_pipeline("2026-03-02")</div>
  <div class="fx" data-lang="text">run for ds=2026-03-02
  extract_orders       ok (attempt 1)
  extract_restaurants  ok (attempt 1)
  extract_deliveries   failed: HTTP Error 503: Service Unavailable -&gt; retry in 0.5s
  extract_deliveries   ok (attempt 2)
  transform            ok (attempt 1)
  quality_check        ok (attempt 1)
  load_fact            ok (attempt 1)</div>
  <p>The first call to the API failed with "503 Service Unavailable", the orchestrator waited half a second and tried again, and attempt 2 succeeded. Every other task succeeded on its first attempt, and the run completed without any human noticing the hiccup. That is what retries are for.</p>

  <h2 id="et-sched"><span class="num">10</span>Schedules, Logical Dates and Backfills</h2>
  <p>A pipeline also needs a timetable, and getting it right takes a little care. Biteful wants "yesterday's revenue" every morning, so the run that processes 2 March must not start until 2 March is over, that is, at midnight going into 3 March. Orchestrators describe this with three linked ideas. The <strong>schedule</strong> says when runs happen. Each run processes a <strong>data interval</strong>, the period of data it is responsible for (here, 2 March 00:00 to 3 March 00:00). And the run is labelled with a <strong>logical date</strong>, normally the start of that interval, which is the <code>ds</code> passed to every task. A school attendance clerk files Monday's register on Tuesday morning and labels it "Monday": the label is the logical date and the filing time is the run time. If the register has to be re-filed a month later, it is still labelled "Monday".</p>
  <p>Airflow 3 has two daily timetables, and they differ in exactly this respect. Asking Airflow's own timetable classes for their first run, with India's time zone, shows the difference:</p>
  <div class="fx" data-lang="py">import pendulum
from airflow.timetables.trigger import CronTriggerTimetable          # what "@daily" means in Airflow 3
from airflow.timetables.interval import CronDataIntervalTimetable    # the Airflow 2 style
from airflow.timetables.base import TimeRestriction

start = pendulum.datetime(2026, 3, 2, tz="Asia/Kolkata")
f = lambda t: t.in_tz("Asia/Kolkata").format("MM-DD HH:mm")
for tt in [CronTriggerTimetable("0 0 * * *", timezone="Asia/Kolkata"),
           CronDataIntervalTimetable("0 0 * * *", timezone="Asia/Kolkata")]:
    run = tt.next_dagrun_info(last_automated_data_interval=None,
                              restriction=TimeRestriction(earliest=start, latest=None, catchup=True))
    print(type(tt).__name__)
    print(f"   starts at {f(run.run_after)} | logical date {f(run.logical_date)}"
          f" | data interval {f(run.data_interval.start)} -&gt; {f(run.data_interval.end)}"
          f" | ds (UTC) {run.logical_date.in_tz('UTC').to_date_string()}")</div>
  <div class="fx" data-lang="text">CronTriggerTimetable
   starts at 03-02 00:00 | logical date 03-02 00:00 | data interval 03-02 00:00 -&gt; 03-02 00:00 | ds (UTC) 2026-03-01
CronDataIntervalTimetable
   starts at 03-03 00:00 | logical date 03-02 00:00 | data interval 03-02 00:00 -&gt; 03-03 00:00 | ds (UTC) 2026-03-01</div>
  <p><code>CronTriggerTimetable</code>, which is what a plain <code>schedule="@daily"</code> means in Airflow 3, fires <em>at</em> 2 March 00:00 and has an empty data interval: it describes something that happens at midnight, with no notion of "the day just finished". <code>CronDataIntervalTimetable</code>, Airflow 2's behaviour, starts on 3 March at 00:00 and covers 2 March 00:00 to 3 March 00:00, which is the right shape for a nightly ETL. Look also at the last column. Airflow's <code>ds</code> is the logical date's <em>UTC</em> date, and 2 March 00:00 in India is 1 March 18:30 in UTC, so <code>ds</code> says 2026-03-01. For a business outside UTC the business day must be derived from the data interval in the local time zone, which is what Biteful's Airflow DAG does in the next section.</p>
  <p>Because every run is labelled with the day it is for, the orchestrator can also run the pipeline for days in the past. This is a <strong>backfill</strong>: running the pipeline again for a range of past logical dates, after a bug fix, after adding a new column, or on the first deployment of a new pipeline. Mechanically it is just a loop over dates. It is <em>safe</em> only because of section 06: each run touches only its own day's partition and overwrites it, so re-running a day that was already loaded replaces it instead of doubling it. The script below backfills 2 to 5 March, which includes 2 March, already loaded by the retry demonstration above, and then builds the gold table from <code>fact_orders</code>:</p>
  <div class="fx" data-lang="py">def build_daily_city_revenue():                       # gold: delivered revenue per city per day
    f = read_table("fact_orders")
    d = f[f["status"] == "delivered"]
    return (d.groupby(["order_date", "city"], as_index=False)
              .agg(orders=("order_id", "count"), revenue=("amount", "sum")))</div>
  <div class="fx" data-lang="py">import pandas as pd
from mini_orchestrator import run_pipeline
from biteful_etl import build_daily_city_revenue

print("backfill 2026-03-02 .. 2026-03-05")      # 2 March was already loaded above
for ds in pd.date_range("2026-03-02", "2026-03-05").strftime("%Y-%m-%d"):
    print(f"  {ds}: loaded {run_pipeline(ds, verbose=False)} orders")
print(build_daily_city_revenue())</div>
  <div class="fx" data-lang="text">backfill 2026-03-02 .. 2026-03-05
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
  <p>The backfill loaded each day, and the gold table still says Pune 760 and Mumbai 450 for 2 March, not double, even though 2 March was loaded twice. Check another row by hand: on 5 March, order 108 at Dosa Hut (Pune, 260) and order 109 at Biryani Bros (Mumbai, 600), which is exactly what the last two rows say. A backfill of a non-idempotent job, by contrast, would be a disaster multiplied by the number of days in the range. Orchestrators can also backfill automatically: when a DAG is deployed with a start date in the past and <code>catchup=True</code>, Airflow creates one run for every missed interval at once. That is occasionally what you want, but usually you set <code>catchup=False</code> and run backfills deliberately.</p>

  <h2 id="et-air"><span class="num">11</span>Airflow and Prefect</h2>
  <p>Our mini orchestrator runs one pipeline in one terminal. It has no calendar, no record of which days ran or failed, no web page, no way to wait for a file, and it dies when the terminal closes. Real teams use a dedicated orchestrator, and the most widely used one is <strong>Apache Airflow</strong>. Think of Airflow as the conductor of an orchestra: it does not play any instrument itself (pandas, Spark and the warehouse do the heavy work), but it tells each player when to start, waits for the ones who are late, and notices who stopped playing.</p>
  <p>In Airflow you describe a pipeline in a Python file as a <strong>DAG</strong>. Each step in it is a <strong>task</strong>, made from an <strong>operator</strong>, which is a reusable template for one kind of work (run a Python function, run a shell command, run SQL, copy a file to S3). One task in one particular run is called a <strong>task instance</strong>, and Airflow records the state of each one (queued, running, success, failed, up_for_retry, upstream_failed) in its <strong>metadata database</strong>. The <strong>scheduler</strong> is the long-running process that reads the DAG files, decides which runs and tasks are due, and creates a <strong>DAG run</strong> for each data interval. The <strong>executor</strong> decides where tasks actually run: the LocalExecutor runs them as processes on one machine, the CeleryExecutor sends them through a queue to a pool of worker machines, and the KubernetesExecutor starts one container (pod) per task. Small values passed from one task to the next, such as a file path or a row count, travel through <strong>XCom</strong> ("cross-communication"), which is stored in the metadata database. A <strong>sensor</strong> is a special task that waits until something is true, such as a file existing or another DAG finishing. A <strong>connection</strong> stores where an external system lives and how to log in to it, as configuration rather than code.</p>
  <p>Here is Biteful's real DAG file. In Airflow's TaskFlow style, each function decorated with <code>@task</code> becomes one task, and calling one task function with another's result does two things at once: it draws the arrow between them and passes the return value through XCom. Each task returns a <em>path</em> to a Parquet file, not a DataFrame, so the XComs stay small:</p>
  <div class="fx" data-lang="py">import os, sys
from datetime import datetime, timedelta
from airflow.sdk import dag, task
from airflow.providers.standard.sensors.filesystem import FileSensor
from airflow.timetables.interval import CronDataIntervalTimetable

BASE = "/opt/biteful"                         # where the project and biteful_etl.py live
sys.path.insert(0, BASE)

def etl():                                    # run inside the project folder, import the ETL code
    os.chdir(BASE)
    import biteful_etl
    return biteful_etl

def ist_day(data_interval_start):            # the business day this run is FOR, in India time
    return data_interval_start.in_timezone("Asia/Kolkata").to_date_string()

def alert(context):                           # on_failure_callback: page a human
    print(f"ALERT biteful_daily day={ist_day(context['data_interval_start'])} "
          f"task={context['task_instance'].task_id} failed")

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
  <p>Read the top of the file first. <code>CronDataIntervalTimetable</code> in India's time zone gives "the run for day D starts after D ends", as in section 10. <code>catchup=False</code> stops Airflow from creating a run for every day since <code>start_date</code> the moment the DAG is deployed, and <code>max_active_runs=1</code> keeps runs from overlapping. <code>default_args</code> gives every task two retries with growing delays and calls <code>alert</code> when a task finally fails; <code>quality_check</code> overrides this with <code>retries=0</code>, because bad data will not fix itself. <code>ist_day</code> turns the data interval into Biteful's business day, avoiding the UTC <code>ds</code> trap. The <code>FileSensor</code> waits for the partner sheet to exist, checking every 30 seconds for up to an hour; <code>mode="reschedule"</code> makes it give back its worker slot between checks instead of occupying it while it sleeps. At the bottom, the last two lines wire the DAG: the sensor must finish before the restaurant extract, and the nested calls draw every other arrow.</p>
  <p><code>airflow dags test</code> runs one complete DAG run in a single process, without the scheduler, which makes it ideal for trying a DAG out. (The sensor uses Airflow's default file-system connection, provided here through the environment variable <code>AIRFLOW_CONN_FS_DEFAULT='fs://'</code>.) For a run at 3 March 00:00 India time, this timetable processes the day that just ended, 2 March:</p>
  <div class="fx" data-lang="text">$ airflow dags test biteful_daily 2026-03-03T00:00:00+05:30     # Airflow 3.1.8, log trimmed
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
  <p>The first line is printed by the <code>extract_orders</code> task and shows all three dates side by side: <code>ds</code> is 2026-03-02 here because this manually triggered run's logical date is 2 March 18:30 UTC; the data interval starts on 1 March at 18:30 UTC, which is 2 March 00:00 in India; and the business day computed by <code>ist_day</code> is 2026-03-02. The three extracts and the sensor ran in whatever order the executor picked, since nothing connects them. Each "Returned value" line is a value being stored as an XCom: three file paths, then a small dictionary from <code>transform</code> that <code>quality_check</code> passes on. Finally <code>load_fact</code> overwrote the 2 March partition with three rows and the DAG run finished in state success. It is the same result as our mini orchestrator, but now with a scheduler, a web UI and a permanent history of runs behind it.</p>
  <p>Two habits matter when writing Airflow DAGs. First, keep XComs small: passing a DataFrame through XCom bloats the metadata database and slows every task, so pass paths, table names and counts. Second, keep work inside tasks: the scheduler re-parses every DAG file every few seconds, so code at the top level of the file (an API call, a database query) runs far more often than you expect.</p>
  <p><strong>Prefect</strong> takes a lighter approach. A pipeline is just a Python function decorated with <code>@flow</code>, its steps are functions decorated with <code>@task</code>, and the order comes from normal function calls rather than a separate DAG object. Retries are an argument to the decorator. Here is Biteful's pipeline in Prefect, run with the API forced to fail once:</p>
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
  <div class="fx" data-lang="text">$ python prefect_flow.py        # Prefect 3.9.3, log trimmed (timestamps removed)
Flow run 'cobalt-mongoose' - Beginning flow run 'cobalt-mongoose' for flow 'biteful-daily'
Task run 'extract-a5d' - Task run failed with exception: &lt;HTTPError 503: 'Service Unavailable'&gt; - Retry 1/2 will start 1 second(s) from now
Task run 'extract-a5d' - Finished in state Completed()
Task run 'transform-342' - Finished in state Completed()
Task run 'check_and_load-c36' - Finished in state Completed()
Flow run 'cobalt-mongoose' - loaded 2 orders for 2026-03-05
Flow run 'cobalt-mongoose' - Finished in state Completed()</div>
  <p>The extract task hit the 503, Prefect scheduled "Retry 1/2" one second later, and the second attempt completed; the flow then loaded the two orders of 5 March. To record the run, Prefect started a temporary local server for the length of the script; in production you run a Prefect server (or use Prefect Cloud) and deploy flows with schedules.</p>
  <p>Airflow and Prefect are not the only choices. <strong>Dagster</strong> organises pipelines around <em>assets</em> (the tables and models a pipeline produces) and their lineage, with built-in partitions and backfills, and suits teams who think in terms of data products. <strong>Luigi</strong> is an older, simpler task runner that is mostly found in legacy stacks. Airflow is the default in most companies because of its huge library of operators and its managed versions (Amazon MWAA, Google Cloud Composer, Astronomer); Prefect appeals to small, Python-heavy teams because it needs so little boilerplate.</p>

  <h2 id="et-err"><span class="num">12</span>Error Handling and Alerting</h2>
  <p>Retries fix the failures that heal by themselves. Some never will: the partner sheet loses a restaurant, or the API is down all night. When that happens, two questions matter. What state is the warehouse left in? And how does a human find out before the business does?</p>
  <p>Good pipelines follow three rules. The first is to <strong>classify</strong> the failure, because each kind needs a different response. A transient failure (API 503, timeout) should be retried with backoff, and someone alerted only if the retries run out. A bad-data failure (the sheet lost Green Bowl, refund rows) should not be retried at all; the load is blocked, bad rows go to quarantine, and the data owner is told. A logic bug (a wrong join, a wrong time zone) needs a code fix followed by a backfill of the affected days. The second rule is to <strong>publish nothing wrong</strong>: a failed run must leave the previous good data in place, never a half-written day. The third is to <strong>fail loudly</strong>, with an alert that names the pipeline, the day and the failing step and reaches a person through chat, e-mail or an on-call pager. A smoke alarm is useful because it is loud, says which room, and does not go off for toast; pipeline alerts should be the same, and rare enough that people still read them.</p>
  <p>Here is the mini orchestrator again, wrapped with an alert, through three nights: a normal one, one where the partner sheet has lost Green Bowl's row, and one where the API is down all night (we point the API address at a port where nothing listens):</p>
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
  <p>Night 1 published 3 March normally. Night 2 failed at the quality gate with no retries, because bad data will not fix itself in half a second, and the alert says exactly why. Most importantly, the 3 March partition still holds the good data from night 1: <code>load_overwrite</code> never ran, and even if it had crashed, it writes to a <code>.tmp</code> folder first. Night 3 retried twice, waiting 0.5 seconds and then 1 second, and then gave up and alerted with the underlying network error.</p>
  <p>Airflow does the same with real state tracking. Here is the Biteful DAG on a night when the sheet has lost Green Bowl, followed by the state of every task in that run:</p>
  <div class="fx" data-lang="text">$ airflow dags test biteful_daily 2026-03-04T00:00:00+05:30     # processes 3 March; log trimmed
ds=2026-03-03  data_interval_start=2026-03-02 18:30:00+00:00  business day=2026-03-03
Done. Returned value was: warehouse/bronze/orders_2026-03-03.parquet
[DAG TEST] end task task_id=extract_orders
Done. Returned value was: warehouse/bronze/deliveries_2026-03-03.parquet
[DAG TEST] end task task_id=extract_deliveries
[DAG TEST] end task task_id=wait_for_sheet
Done. Returned value was: warehouse/bronze/restaurants.parquet
[DAG TEST] end task task_id=extract_restaurants
Done. Returned value was: {'path': 'warehouse/silver/orders_2026-03-03.parquet', 'day': '2026-03-03', 'rows': 2, 'source_rows': 2}
[DAG TEST] end task task_id=transform
biteful_etl.DataQualityError: order with no restaurant city (enrich failed)
ALERT biteful_daily day=2026-03-03 task=quality_check failed
[DAG TEST] end task task_id=quality_check
DagRun Finished: logical_date=2026-03-03 18:30:00+00:00 state=failed
$ airflow tasks states-for-dag-run biteful_daily &lt;run_id&gt;     # columns trimmed
task_id              state
wait_for_sheet       success
extract_restaurants  success
extract_orders       success
extract_deliveries   success
transform            success
quality_check        failed
load_fact            upstream_failed</div>
  <p><code>quality_check</code> raised the <code>DataQualityError</code>, the <code>on_failure_callback</code> printed the alert with the business day and the task name, and the run finished as failed. The task states tell the rest of the story: every task before the check succeeded, the check failed, and <code>load_fact</code> is in state <strong>upstream_failed</strong>, meaning Airflow never started it because something it depends on failed. Nothing wrong was published. In production the callback posts to Slack or PagerDuty, and Airflow can also alert when a run is late rather than failed (a deadline or SLA alert), which catches the pipeline that is stuck.</p>
  <p>Two mistakes undo all of this. One is alerting on every retry attempt: if every flaky network call pages someone, people mute the channel and miss the real failure, so alert on final failure and on lateness only. The other is writing <code>except Exception: pass</code> inside a task: a swallowed error turns a loud failure into a silent wrong number.</p>

  <h2 id="et-build"><span class="num">13</span>The Whole Pipeline: Biteful's First Week</h2>
  <p>Each section ran one piece on one day. Now put everything together the way it runs after the pipeline's first deployment. The first deployment is itself a backfill: run every day from 2 to 8 March through the mini orchestrator (three extracts, transform, quality gate, overwrite load), then build the gold table <code>daily_city_revenue</code> and store it with the same overwrite rule:</p>
  <div class="fx" data-lang="py">import pandas as pd
from mini_orchestrator import run_pipeline
from biteful_etl import read_table, build_daily_city_revenue, load_overwrite
pd.set_option("display.width", 200); pd.set_option("display.max_columns", None)

for ds in pd.date_range("2026-03-02", "2026-03-08").strftime("%Y-%m-%d"):   # first deployment = backfill
    print(ds, "loaded", run_pipeline(ds, verbose=False))
gold = build_daily_city_revenue()
for ds in gold["order_date"].unique():            # gold table: same overwrite rule
    load_overwrite(gold[gold["order_date"] == ds], ds, table="daily_city_revenue")
print(read_table()[["order_id", "order_date", "restaurant", "city", "status", "amount", "delivery_minutes"]])
print(gold)
print("total delivered revenue:", gold["revenue"].sum())</div>
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
  <p>Check it against the table in section 01. 6 and 7 March loaded zero orders and passed the gate, because empty days are real. Order 104 has no delivery time, because the partner never recorded one; it is kept as missing (<code>&lt;NA&gt;</code>) rather than invented, and thanks to <code>Int64</code> the column has the same type on every day. Orders 105 and 107 are in the fact table but not in the revenue, because they were cancelled, and 110 is still pending. Total delivered revenue is 240 + 450 + 520 + 380 + 180 + 260 + 600 = 2,630, which matches the output.</p>
  <p>Look back at how the pieces depend on each other. Extract, transform and load move the data. Idempotency and the logical date make it safe to run any day any number of times, and that is what makes retries, backfills and the incremental merge possible. The watermark makes daily runs cheap. The quality gate turns bad data into an error, which is the only kind of problem retries and alerts can respond to. And the orchestrator supplies the repetition: on schedule, in DAG order, with a record of every run. The gold table is built from silver, so it must be rebuilt whenever silver changes; in a real orchestrator that means <code>build_gold</code> sits downstream of <code>load_fact</code> in the same DAG, never on a separate clock. Priya's morning e-mail is now one gold table that rebuilds itself every night, and a rerun of any day cannot change it. When a night's orders no longer fit in pandas, the transform moves to <a class="xref" data-note="de_spark">Apache Spark</a> with the same design; when "tomorrow morning" is too late, the same order events flow through <a class="xref" data-note="de_kafka">Kafka</a> within seconds.</p>

  <h2 id="et-traps"><span class="num">14</span>Common Mistakes</h2>
  <p>Pipeline bugs rarely crash. The job is green, the dashboard fills up, and the number is wrong. The most common is a load that is not idempotent: a plain append or a bare <code>INSERT</code> with no delete and no key. It passes every test, because tests run it once, and the first retry doubles the day, as Biteful's 2 March went from 1210 to 2420. Overwrite the run's partition or upsert by key. Close behind it is computing "yesterday" from the clock instead of taking the logical date as a parameter, which makes every rerun and backfill load the wrong day.</p>
  <p>Enrichment joins that change the row count are the next family. A duplicate row in a lookup sheet fans out orders (105 counted twice), and an inner join silently drops orders whose key is missing. Use left joins and <code>validate=</code>, and reconcile counts in the quality gate. Related to this is dropping bad rows "to keep the job green": it hides the problem and changes the totals, so quarantine them and alert instead.</p>
  <p>Watermarks have their own traps. Saving the watermark before the load finishes loses rows when the load then fails; save it after. Hard deletes never appear. And a watermark on time alone can skip rows that share a timestamp, because the next run asks for rows strictly later than the last one it saw. Here the extract takes at most two rows per run, oldest first, and orders 202 and 203 were both updated at 10:05:</p>
  <div class="fx" data-lang="py">import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (order_id INT, updated_at TEXT)")
db.executemany("INSERT INTO orders VALUES (?, ?)",
               [(201, "10:00"), (202, "10:05"), (203, "10:05"), (204, "10:09"), (205, "10:12")])

def run_time_only(wm):               # watermark = updated_at alone, 2 rows per run
    rows = db.execute("""SELECT order_id, updated_at FROM orders WHERE updated_at &gt; ?
                         ORDER BY updated_at, order_id LIMIT 2""", (wm,)).fetchall()
    return rows, (rows[-1][1] if rows else wm)

def run_pair(wm):                    # watermark = (updated_at, order_id): no two rows share it
    rows = db.execute("""SELECT order_id, updated_at FROM orders WHERE (updated_at, order_id) &gt; (?, ?)
                         ORDER BY updated_at, order_id LIMIT 2""", wm).fetchall()
    return rows, ((rows[-1][1], rows[-1][0]) if rows else wm)

for name, run, wm in [("time only", run_time_only, "00:00"), ("pair", run_pair, ("00:00", 0))]:
    loaded = []
    for _ in range(3):
        rows, wm = run(wm)
        loaded += [r[0] for r in rows]
    print(f"{name:9}: loaded {loaded}")</div>
  <div class="fx" data-lang="text">time only: loaded [201, 202, 204, 205]
pair     : loaded [201, 202, 203, 204, 205]</div>
  <p>With a time-only watermark, the first run loaded 201 and 202 and saved 10:05; the second run asked for rows after 10:05 and never saw 203, which shares that timestamp. Using the pair <code>(updated_at, order_id)</code> as the watermark makes every position unique, so the next run resumes exactly after 202 and all five orders arrive. The same problem appears without a batch limit when a row with the same timestamp is committed just after the extract read the table; the usual remedies are the pair watermark, or re-reading a small overlap window and relying on the idempotent merge to absorb duplicates.</p>
  <p>Checks can be wrong too. "Rows &gt; 0" fails on genuinely empty days and teaches people to ignore alerts; compare with the source instead. Retrying bad data, as in giving a quality check three retries, only delays the alert by however long the retries take; retry transient errors only. In Airflow, passing DataFrames through XCom and doing work at the top level of a DAG file both slow the whole system down. Using the UTC <code>ds</code> for a business in India puts every run one day off, because midnight in India is 18:30 UTC the day before. And deploying a DAG with an old <code>start_date</code> and <code>catchup=True</code> by accident creates a run for every missed day at once, hammering the sources; set <code>catchup=False</code> and run backfills on purpose. Finally, writing straight into the final partition folder means a crash leaves a half-written day that readers will see; write to a temporary location and swap it in.</p>

  <h2 id="et-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Data pipeline</b>: a program that moves data from where it is created to where it is used, changing it on the way, on a schedule.</li>
    <li><b>ETL</b>: Extract → Transform → Load; clean outside the target, store only the result. <b>ELT</b>: Extract → Load → Transform; store raw in the warehouse, transform there with SQL (dbt).</li>
    <li><b>Clean / normalise / enrich</b>: fix errors (dupes, types, missing) / one form per meaning (spelling, UTC, currency) / add columns by joining reference data.</li>
    <li><b>Grain</b>: what one row represents (fact_orders: one order).</li>
    <li><b>Partition</b>: the slice of a table for one value (one day), stored as its own folder <code>order_date=…</code>.</li>
    <li><b>Bronze / silver / gold</b>: raw as extracted / cleaned at a clear grain / business aggregates.</li>
    <li><b>Idempotent</b>: running once or N times leaves the target in the same state.</li>
    <li><b>Partition overwrite</b>: replace the run's slice. <b>Upsert / MERGE</b>: insert new keys, update existing ones.</li>
    <li><b>Logical date / data interval</b>: the label of a run / the time range it processes. The run for day D starts after D ends.</li>
    <li><b>Watermark</b>: stored high point of an increasing column (updated_at) already loaded; next extract asks for rows after it.</li>
    <li><b>CDC</b>: change data capture; reads the DB's change log and sees inserts, updates and deletes.</li>
    <li><b>Quality gate</b>: checks between transform and load; failure blocks the load. Reconcile with the source, test invariants.</li>
    <li><b>DAG</b>: directed acyclic graph of tasks; run in topological order, independent tasks in parallel.</li>
    <li><b>Transient failure</b>: heals by waiting (timeout, 429, 503). <b>Exponential backoff</b>: waits that double between retries.</li>
    <li><b>Backfill</b>: run the pipeline for past logical dates; safe only if each run is idempotent.</li>
  </ul>
  <h3>Choosing an approach</h3>
  <table class="tbl">
    <tr><th>Choice</th><th>Use when</th><th>Avoid when / catch</th></tr>
    <tr><td>Full extract</td><td>small reference tables (5 restaurants)</td><td>big, growing tables</td></tr>
    <tr><td>Incremental (watermark)</td><td>big tables with a reliable <code>updated_at</code></td><td>misses hard deletes; ties on the timestamp</td></tr>
    <tr><td>CDC</td><td>deletes matter, need low latency</td><td>needs Kafka/Debezium infrastructure</td></tr>
    <tr><td>ETL</td><td>PII must be masked before landing; non-SQL transforms</td><td>raw data lost unless a bronze copy is kept</td></tr>
    <tr><td>ELT</td><td>cloud warehouse; keep raw for replays</td><td>still needs silver/gold layers and tests</td></tr>
    <tr><td>Partition overwrite</td><td>daily facts</td><td>needs the run's slice to be well defined</td></tr>
    <tr><td>Upsert / MERGE</td><td>dimensions, late-changing rows</td><td>needs a reliable key</td></tr>
    <tr><td>Retry</td><td>timeouts, 429, 503, failovers</td><td>never for bad data or bugs</td></tr>
  </table>
  <h3>Failure types</h3>
  <table class="tbl">
    <tr><th>Type</th><th>Biteful example</th><th>Response</th></tr>
    <tr><td>Transient</td><td>API 503, timeout</td><td>retry with backoff; alert only if retries run out</td></tr>
    <tr><td>Bad data</td><td>sheet lost Green Bowl, refund rows</td><td>no retries; block the load; quarantine; alert</td></tr>
    <tr><td>Logic bug</td><td>wrong join, wrong time zone</td><td>fix the code, then backfill the affected days</td></tr>
  </table>
  <h3>Airflow vocabulary</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Operator / task / task instance</td><td>template for a kind of work / its use in a DAG / one task in one run</td></tr>
    <tr><td>XCom</td><td>small value passed between tasks (paths, counts), stored in the metadata DB</td></tr>
    <tr><td>Sensor</td><td>task that waits for a condition; <code>mode="reschedule"</code> frees the worker slot</td></tr>
    <tr><td>Scheduler / executor</td><td>decides what is due / decides where it runs (Local, Celery, Kubernetes)</td></tr>
    <tr><td>Task states</td><td>queued, running, success, failed, up_for_retry, upstream_failed</td></tr>
    <tr><td>catchup</td><td><code>True</code>: create runs for every missed interval since start_date</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py"># idempotent loads
DELETE FROM fact_orders WHERE order_date = :ds;  INSERT INTO fact_orders ...   -- one transaction
INSERT INTO dim VALUES (...) ON CONFLICT (id) DO UPDATE SET rating = excluded.rating
MERGE INTO t USING s ON t.id = s.id WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...

# incremental extract
SELECT * FROM orders WHERE updated_at &gt; :watermark ORDER BY updated_at   # save max AFTER the load

# pandas: protect joins
df.merge(rest, on="restaurant_id", how="left", validate="many_to_one")

# Airflow (TaskFlow)
@dag(schedule=CronDataIntervalTimetable("0 0 * * *", timezone="Asia/Kolkata"),
     start_date=datetime(2026, 3, 2), catchup=False,
     default_args={"retries": 2, "retry_exponential_backoff": True, "on_failure_callback": alert})
def biteful_daily():
    @task(retries=0)
    def quality_check(stats: dict) -&gt; dict: ...
    load_fact(quality_check(transform(extract_orders(), r, extract_deliveries())))

# Prefect
@task(retries=2, retry_delay_seconds=1)
def extract(ds): ...
@flow
def biteful_daily(ds: str): ...</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Plain append doubles on retry (1210 → 2420); overwrite or upsert.</li>
    <li>"Yesterday" from the clock breaks reruns; pass the logical date.</li>
    <li>Duplicate lookup keys fan out rows; inner joins drop rows.</li>
    <li>Save the watermark after the load; deletes are invisible to it; ties need <code>(updated_at, id)</code>.</li>
    <li>"rows &gt; 0" fails on empty days; reconcile with the source.</li>
    <li>Never retry bad data; never <code>except Exception: pass</code>.</li>
    <li>Airflow <code>ds</code> is a UTC date; derive the local business day from the data interval.</li>
    <li>No DataFrames in XCom; no work at DAG top level; beware accidental <code>catchup=True</code>.</li>
    <li>Pin output types (<code>Int64</code>) so every partition has the same schema.</li>
    <li>Write to temp, then swap, so a crash never leaves a half-written partition.</li>
  </ul>

  <h2 id="et-qa"><span class="num">15</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is ETL, and what does each step do?</summary><div class="qa-body">ETL stands for extract, transform, load. Extract reads the data a run needs from each source (databases, files, APIs) without changing it. Transform cleans it (duplicates, types), normalises it (one spelling, one time zone) and enriches it (joins reference data) into a table with a clear grain. Load writes the result in bulk to the warehouse or lake where people query it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ETL vs ELT: what is the difference, and which is more common today?</summary><div class="qa-body">In ETL the transform runs outside the target and only clean data is stored; in ELT raw data is loaded into the warehouse first and transformed there, usually with SQL and dbt. ELT is more common with cloud warehouses because storage is cheap, compute is elastic, and keeping the raw copy allows reprocessing. ETL remains the right choice when PII must be masked before it lands, or when the transform is not SQL-shaped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does idempotent mean for a pipeline, and how do you achieve it?</summary><div class="qa-body">A job is idempotent if running it once or many times with the same input leaves the target in the same state. You achieve it with partition overwrite (replace the run's day, e.g. DELETE + INSERT in one transaction), with upsert/MERGE on a key, and by passing the logical date as a parameter instead of computing it from the clock. It matters because retries, reruns and backfills are guaranteed to happen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A daily job runs <code>INSERT INTO sales SELECT ... WHERE date = current_date - 1</code>. It failed after inserting and was retried. What is wrong, and how do you fix it?</summary><div class="qa-body">The retry inserts the same rows again, so the day's revenue doubles. Also, <code>current_date - 1</code> depends on when the job runs, so a rerun next week loads the wrong day. Fix both: take the date as a parameter from the orchestrator and do <code>DELETE WHERE date = :ds</code> followed by the <code>INSERT</code> inside one transaction (or a MERGE).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a watermark in an incremental load, and when should it be saved?</summary><div class="qa-body">A watermark is the stored high point of an always-increasing column, usually <code>updated_at</code> or an id, up to which data has been loaded; the next run extracts only rows beyond it. It must be saved only after the load succeeds, so a crash causes rows to be fetched again rather than skipped. That in turn requires the load to be idempotent (a merge by key), so re-seeing rows is harmless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Incremental loads by <code>updated_at</code> vs CDC: what are the trade-offs?</summary><div class="qa-body">Watermark queries are simple, but they miss hard deletes, need a reliable <code>updated_at</code>, can skip rows that share a timestamp, and put query load on the source. CDC reads the database's change log (WAL, binlog) with a tool like Debezium, capturing every insert, update and delete in order within seconds with little load on the source. The cost is more infrastructure, usually Kafka and connectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do joins during enrichment deserve special care?</summary><div class="qa-body">A join can silently change the row count. If the lookup table has a duplicate key, each matching row is multiplied (fan-out), so amounts are counted twice; an inner join drops rows whose key is missing from the lookup. Use left joins, assert the expected cardinality (pandas <code>validate="many_to_one"</code>), and reconcile row counts before loading.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which data quality checks would you put before publishing an orders table?</summary><div class="qa-body">Row count equals the source count; <code>order_id</code> is unique; amounts are positive and status is in the known set; every order found its restaurant (enrichment succeeded); the newest <code>updated_at</code> is recent (freshness); the schema has the expected columns and types. A failure blocks the load and alerts; bad rows can go to a quarantine table. Prefer reconciliation and invariants over guesses like "more than zero rows".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a DAG, and why must it be acyclic?</summary><div class="qa-body">A DAG is a directed acyclic graph: tasks as nodes and "must run before" relationships as arrows. The orchestrator runs it in topological order, starting every task whose prerequisites are done, so independent tasks run in parallel. A cycle would mean a task indirectly waits for itself, so no valid starting point exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which errors should be retried, and which should not?</summary><div class="qa-body">Retry transient errors such as timeouts, HTTP 429 and 503, connection resets and database failovers, with exponential backoff so the struggling system is not hammered. Do not retry deterministic failures such as bad data, schema mismatches or code bugs: they fail identically and retries only delay the alert. Those should fail fast, quarantine bad rows where relevant, and alert a person.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a backfill, and what must be true for it to be safe?</summary><div class="qa-body">A backfill re-runs a pipeline for past logical dates, for example after a bug fix, when adding a column, or on first deployment. It is safe only if each run is idempotent and reads and writes only its own date's data, using the logical date passed in. Otherwise every backfilled day is duplicated or the wrong days are loaded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain logical date and data interval in Airflow. What is the timezone trap with <code>ds</code>?</summary><div class="qa-body">The data interval is the period of data a run processes, and the logical date labels the run (normally the interval's start); for a daily ETL the run for day D starts after D ends. <code>ds</code> is the logical date's UTC date. For a business in India, midnight local time is 18:30 UTC the previous day, so <code>ds</code> is one day off; derive the business day from the data interval in the local time zone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is XCom, and what should you not put in it?</summary><div class="qa-body">XCom is Airflow's mechanism for passing small values between tasks; it is stored in the metadata database, and TaskFlow return values become XComs automatically. Pass paths, table names, counts and small dictionaries. Never pass DataFrames or files: they bloat the database and slow every task; write the data to storage and pass its location.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a sensor do, and why use <code>mode="reschedule"</code>?</summary><div class="qa-body">A sensor is a task that waits until a condition is true, such as a file arriving, a partition landing or another DAG finishing. In the default "poke" mode it holds a worker slot while it sleeps between checks. In "reschedule" mode it releases the slot between checks, so many waiting sensors do not block real work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the main Airflow executors and when you would use each.</summary><div class="qa-body">The LocalExecutor runs tasks as processes on the scheduler's machine, which suits small deployments. The CeleryExecutor sends tasks through a message queue to a fixed pool of worker machines, good for steady, high volume. The KubernetesExecutor starts one pod per task, giving isolation and per-task dependencies and scaling to zero, good for bursty or varied workloads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A DAG with <code>start_date=2025-01-01</code>, a daily schedule and <code>catchup=True</code> is deployed today. What happens?</summary><div class="qa-body">The scheduler creates a run for every missed daily interval since 1 January 2025, hundreds of runs, which may hammer the sources and the warehouse. Usually you set <code>catchup=False</code> and run backfills deliberately, limited by <code>max_active_runs</code>. If the job is not idempotent, the damage is even worse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make sure a failed run never publishes partial data?</summary><div class="qa-body">Put a quality gate before the load so bad batches never reach it, and make the load atomic: write to a temporary location and swap it in with one rename, or use a transaction (DELETE + INSERT, MERGE) or a table format like Delta Lake or Iceberg. Downstream tasks such as the gold table must depend on the load in the DAG, so a failure marks them upstream_failed instead of running them on stale or partial data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Airflow vs Prefect vs Dagster: how would you choose?</summary><div class="qa-body">Airflow is the industry default: task-centric DAGs, a huge operator library and managed offerings, at the cost of heavier operation. Prefect turns plain Python functions into flows and tasks with little boilerplate and easy local runs, suiting small Python-heavy teams. Dagster centres on assets and lineage with built-in partitions, typing and testing, suiting teams that think in data products.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks if you keep retries, idempotency and alerts but skip the quality gate?</summary><div class="qa-body">The pipeline becomes very good at publishing wrong numbers: on schedule, retried until it succeeds, idempotently. A duplicated lookup row would double an order every night, and a missing restaurant would produce rows with no city, yet nothing crashes, so nobody is alerted. Retries and alerts only respond to errors; the gate is what turns bad data into an error.</div></details>
</main>
`
});
