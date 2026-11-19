// notes/dataanalysis/da_pd_time.js — Time Series & Performance
Object.assign(TOPIC_CONTENT, {
  "da_pd_time": `<main>
<h1>Time Series &amp; Performance</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Time Series &amp; Performance</span></div>
  <p class="lead">Almost every business table has a time column, and the questions people ask about it are about time: what were sales per day, is the trend going up, how does this week compare with last week, how long do customers wait between orders. This note teaches the pandas tools for those questions: turning text into real dates, using time as the row index, time zones, grouping into time buckets with <code>resample</code>, sliding windows with <code>rolling</code>, <code>expanding</code> and <code>ewm</code>, comparing with the past using <code>shift</code>, <code>diff</code> and <code>pct_change</code>, and calendar arithmetic with date offsets. The second half asks a different question: will the same code still work on a year of data? We measure memory, shrink it with better dtypes, time loops against vectorised code, compare CSV with Parquet, read files in chunks, and finish with an honest look at when Polars or DuckDB are worth switching to. The running example is the one used across the pandas notes: Biteful, a small food-delivery business, with 11 orders from Monday 2 to Friday 6 March 2026, plus a generated table of a million orders for everything that needs size.</p>

  <h2 id="pdt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Time Series &amp; Performance</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Dates as data</div>
        <ul>
          <li><code>pd.to_datetime(s, format=...)</code>; <code>errors="coerce"</code> → NaT</li>
          <li><code>.dt.hour</code>, <code>.dt.day_name()</code>; Timestamp − Timestamp = Timedelta</li>
          <li><code>set_index(time).sort_index()</code> → DatetimeIndex, <code>loc["2026-03-03"]</code></li>
          <li>Time zones: <code>tz_localize</code> attaches, <code>tz_convert</code> converts; store UTC</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Buckets and windows</div>
        <ul>
          <li><b>resample</b>: groupby by time bucket, empty buckets included</li>
          <li><b>rolling</b>: last k rows or last "24h"; <b>expanding</b>: everything so far</li>
          <li><b>ewm</b>: weighted average, recent values count more</li>
          <li><code>shift</code> lag, <code>diff</code> change, <code>pct_change</code> growth; sort first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Calendar</div>
        <ul>
          <li><code>date_range</code> with <code>"D"</code>, <code>"B"</code>, <code>"W"</code>, <code>"ME"</code></li>
          <li>Timedelta = fixed duration; DateOffset = calendar rule</li>
          <li>Partial first/last buckets fake growth</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance</div>
        <ul>
          <li><code>memory_usage(deep=True)</code>; <code>category</code>, downcasting</li>
          <li>Vectorised ≫ itertuples &gt; apply &gt; iterrows</li>
          <li>Parquet: smaller, faster, keeps dtypes; <code>chunksize</code> for big CSVs</li>
          <li>Polars / DuckDB after vectorising, not instead of it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdt-parse"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Parsing Dates and the .dt Accessor</span><span class="rm-sub">turning text into real dates and asking them questions</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-index"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">DatetimeIndex</span><span class="rm-sub">time as the row label, selecting by date</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-tz"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Time Zones</span><span class="rm-sub">which 12:10 do you mean?</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-resample"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">resample</span><span class="rm-sub">totals per day, week or month</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-window"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">rolling, expanding and ewm</span><span class="rm-sub">smoothing a noisy series, running totals</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-shift"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">shift, diff and pct_change</span><span class="rm-sub">comparing each period with the one before</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-group"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Windows Inside Groups</span><span class="rm-sub">per-customer lags, running totals, ranks, top-N</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-offset"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Date Ranges and Offsets</span><span class="rm-sub">calendars, business days, month ends</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-mem"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Memory: Measuring and Shrinking</span><span class="rm-sub">memory_usage, downcasting, category</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-vec"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Vectorisation vs apply</span><span class="rm-sub">why row loops are slow, timed</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-files"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Big Files: Parquet vs CSV and Chunked Reading</span><span class="rm-sub">reading less, reading faster</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-beyond"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">When to Switch to Polars or DuckDB</span><span class="rm-sub">lazy engines, measured honestly</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">unsorted lags, date formats, partial periods</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, tables, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on time series and performance</span></div></div>
    </div>
  </div>

  <h2 id="pdt-parse"><span class="num">01</span>Parsing Dates and the .dt Accessor</h2>
  <p>Data usually arrives as a CSV file, and a CSV file is only text. When pandas reads a column like <code>2026-03-02 12:10</code> it has no reason to believe those characters are a moment in time, so it keeps them as text. Text looks right when printed, but it cannot answer any question about time. Here are Biteful's first three orders, read exactly as they would come from a file:</p>
  <div class="fx" data-lang="py">import io
import pandas as pd

csv_text = """order_id,customer,city,order_time,amount
101,Asha,Pune,2026-03-02 12:10,240
102,Ben,Mumbai,2026-03-02 13:05,450
103,Chen,Pune,2026-03-02 20:30,520
"""
raw = pd.read_csv(io.StringIO(csv_text))
print(raw["order_time"].dtype)
try:
    raw["order_time"].dt.hour
except AttributeError as e:
    print("AttributeError:", e)

raw["order_time"] = pd.to_datetime(raw["order_time"], format="%Y-%m-%d %H:%M")
print(raw["order_time"].dtype)
print(raw["order_time"].iloc[2] - raw["order_time"].iloc[0])</div>
  <div class="fx" data-lang="text">str
AttributeError: Can only use .dt accessor with datetimelike values
datetime64[us]
0 days 08:20:00</div>
  <p>The first line of output, <code>str</code>, is the problem: the column is pandas' string type. Asking for the hour with <code>.dt.hour</code> fails with "Can only use .dt accessor with datetimelike values", and if we tried to subtract two of these values Python would refuse, because subtracting one piece of text from another means nothing. After <code>pd.to_datetime</code> the column's type becomes <code>datetime64[us]</code>, and now subtracting order 101 (12:10) from order 103 (20:30) gives a sensible answer: 8 hours 20 minutes.</p>
  <p>This is what <strong>parsing</strong> means: reading text and converting it into a real value of the right type. A parsed date is stored as <strong><code>datetime64</code></strong>, pandas' date-time type, which internally is just a whole number counting time units since midnight on 1 January 1970. The <code>[us]</code> says the unit is microseconds. (pandas 2 always used nanoseconds; pandas 3 picks a unit that fits the input, which is why you see <code>us</code> here. For everyday work the difference does not matter.) Because every date is really a number, comparing, sorting and subtracting dates is as fast as doing the same with integers. Think of the difference between a photograph of a calendar page and the calendar itself: the photograph shows "2 March" but you cannot ask it what day comes next; the calendar knows.</p>
  <p>The <code>format="%Y-%m-%d %H:%M"</code> argument tells pandas exactly how the text is laid out: four-digit year, month, day, then hour and minute. Giving the format is faster and, more importantly, removes guessing. Real files are rarely clean, so two more arguments matter. <code>errors="coerce"</code> turns anything that cannot be parsed into <strong>NaT</strong> ("Not a Time", the date version of NaN) instead of stopping with an error, and the format decides whether <code>02/03/2026</code> means 2 March or 3 February:</p>
  <div class="fx" data-lang="py">import pandas as pd

messy = pd.Series(["02/03/2026 12:10", "02/03/2026 13:05", "31/02/2026 20:30", "unknown"])
print(pd.to_datetime(messy, format="%d/%m/%Y %H:%M", errors="coerce"))
print(pd.to_datetime("02/03/2026"), "&lt;- read month-first")
print(pd.to_datetime(1772453400, unit="s"), "&lt;- seconds since 1970")</div>
  <div class="fx" data-lang="text">0   2026-03-02 12:10:00
1   2026-03-02 13:05:00
2                   NaT
3                   NaT
dtype: datetime64[us]
2026-02-03 00:00:00 &lt;- read month-first
2026-03-02 12:10:00 &lt;- seconds since 1970</div>
  <p>With the Indian day-first format given, the first two strings become 2 March as intended. "31/02/2026" looks like a date but 31 February does not exist, and "unknown" is not a date at all; both become NaT, so you can count them with <code>isna()</code> and decide what to do. The next line is the warning: without a format, pandas read "02/03/2026" month-first, the American convention, and produced 3 February with no complaint. Whenever dates are written with slashes, give the format. The last line shows another common input, a <strong>Unix timestamp</strong>, which is a number of seconds since 1 January 1970 (UTC); <code>unit="s"</code> converts it. When reading a CSV you can parse while loading with <code>pd.read_csv(path, parse_dates=["order_time"], date_format="%Y-%m-%d %H:%M")</code>.</p>
  <p>Here is the full running example, already parsed. Order 107's amount is missing on purpose, and three delivery times are unknown:</p>
  <div class="fx" data-lang="py">print(orders[["order_id", "customer", "city", "order_time", "amount"]])</div>
  <div class="fx" data-lang="text">    order_id customer    city          order_time  amount
0        101     Asha    Pune 2026-03-02 12:10:00   240.0
1        102      Ben  Mumbai 2026-03-02 13:05:00   450.0
2        103     Chen    Pune 2026-03-02 20:30:00   520.0
3        104     Asha    Pune 2026-03-03 13:15:00   380.0
4        105      Dia  Mumbai 2026-03-03 19:45:00   310.0
5        106      Ben    Pune 2026-03-04 12:40:00   180.0
6        107     Esha  Mumbai 2026-03-04 21:10:00     NaN
7        108     Chen    Pune 2026-03-05 18:20:00   260.0
8        109    Farah  Mumbai 2026-03-05 20:05:00   600.0
9        110     Asha    Pune 2026-03-06 13:00:00   290.0
10       111      Dia  Mumbai 2026-03-06 20:50:00   700.0</div>
  <p>Once a column is <code>datetime64</code>, the <strong><code>.dt</code> accessor</strong> gives it date methods that run on every value at once, just as <code>.str</code> gives text methods to a text column. An accessor is simply a named group of methods attached to a Series:</p>
  <div class="fx" data-lang="py">t = orders["order_time"]
print(pd.DataFrame({"time": t, "day": t.dt.day_name(), "hour": t.dt.hour,
                    "dinner": t.dt.hour &gt;= 18}).head(4))
span = t.max() - t.min()
print(span, "|", span.total_seconds() / 3600, "hours")
print(t.iloc[0] + pd.Timedelta(minutes=45), "&lt;- promised delivery for order 101")</div>
  <div class="fx" data-lang="text">                 time      day  hour  dinner
0 2026-03-02 12:10:00   Monday    12   False
1 2026-03-02 13:05:00   Monday    13   False
2 2026-03-02 20:30:00   Monday    20    True
3 2026-03-03 13:15:00  Tuesday    13   False
4 days 08:40:00 | 104.66666666666667 hours
2026-03-02 12:55:00 &lt;- promised delivery for order 101</div>
  <p><code>t.dt.day_name()</code> turns each time into its weekday, <code>t.dt.hour</code> pulls out the hour as a number, and <code>t.dt.hour &gt;= 18</code> is an ordinary vectorised comparison that marks order 103, at 20:30, as a dinner order. Other useful parts are <code>.dt.date</code>, <code>.dt.month</code>, <code>.dt.dayofweek</code> (Monday = 0) and <code>.dt.is_month_end</code>. Subtracting the earliest time from the latest gives a <strong>Timedelta</strong>, pandas' type for a length of time: Monday 12:10 to Friday 20:50 is 4 days 8 hours 40 minutes, and <code>total_seconds() / 3600</code> expresses it as 104.67 hours. Adding a Timedelta to a time moves it forward, so order 101's 45-minute delivery promise falls at 12:55. A <strong>Timestamp</strong> is a single moment, a Timedelta is a duration, and the arithmetic between them works the way you would expect: moment − moment = duration, moment + duration = moment.</p>

  <h2 id="pdt-index"><span class="num">02</span>DatetimeIndex</h2>
  <p>With a parsed column we can already filter, for example <code>orders[orders["order_time"].dt.date == date(2026, 3, 3)]</code>. But every question about time then needs a filter written by hand, and pandas has no idea that the rows form a sequence in time. The earlier notes made <code>order_id</code> the index so that <code>loc</code> could find an order by its id. The same idea applied to time gives the most useful structure in this note: when the times themselves become the row labels, pandas can select by date, group by period and slide windows along the time axis.</p>
  <p>A <strong>DatetimeIndex</strong> is an index whose labels are timestamps. Think of a diary with the date printed at the top of every page: you open it straight at "3 March", or flip from "5 March" to "6 March", rather than reading every entry looking for dates. To build one, move the time column into the index and sort it:</p>
  <div class="fx" data-lang="py">ts = orders.set_index("order_time").sort_index()
print(type(ts.index).__name__)
print(ts.loc["2026-03-03", ["customer", "amount"]])                  # one whole day
print(ts.loc["2026-03-05":"2026-03-06", ["customer", "amount"]])     # a range, end included
print(ts.between_time("18:00", "23:59")["amount"].sum(), "&lt;- dinner revenue")</div>
  <div class="fx" data-lang="text">DatetimeIndex
                    customer  amount
order_time                          
2026-03-03 13:15:00     Asha   380.0
2026-03-03 19:45:00      Dia   310.0
                    customer  amount
order_time                          
2026-03-05 18:20:00     Chen   260.0
2026-03-05 20:05:00    Farah   600.0
2026-03-06 13:00:00     Asha   290.0
2026-03-06 20:50:00      Dia   700.0
2390.0 &lt;- dinner revenue</div>
  <p><code>set_index("order_time")</code> moves the times into the index and <code>sort_index()</code> puts them in time order; every time tool in this note assumes sorted times, so do both together. The index now understands dates written as partial strings. <code>ts.loc["2026-03-03"]</code> means "every row on 3 March", which returns Asha's and Dia's orders without us writing any comparison. <code>ts.loc["2026-03-05":"2026-03-06"]</code> is a label slice, and like all <code>loc</code> slices it includes both ends, so Thursday and Friday together give four orders. A partial string can be as coarse as a month (<code>loc["2026-03"]</code>) or a year. <code>between_time("18:00", "23:59")</code> selects by clock time on every day; summing those amounts gives Biteful's dinner revenue, 2390 (the missing amount is skipped).</p>
  <p>From now on we keep this table as <code>ts</code>. It is the starting point for resampling and windows, which both need a DatetimeIndex, or a datetime column named with <code>on=</code>.</p>

  <h2 id="pdt-tz"><span class="num">03</span>Time Zones</h2>
  <p>Our order times say "12:10" and nothing else. Inside one city that is enough, but the moment data comes from two places it is not. Biteful's phone app records local Indian time, its payment provider logs in UTC (the world reference time, which has no daylight saving), and if it opens in Dubai a third clock appears. The same instant has a different clock reading in each place, and mixing them shifts orders by hours, sometimes into a different day.</p>
  <p>pandas separates two kinds of timestamp. A <strong>naive</strong> timestamp has no time zone attached; it is just a clock reading. An <strong>aware</strong> timestamp carries a zone, so it identifies one exact instant. Think of a meeting invite that says "10 o'clock" with no city: useless to a team in two countries. Writing the city on the invite is <code>tz_localize</code>; telling each person what that is on their own clock is <code>tz_convert</code>.</p>
  <div class="fx" data-lang="py">local = orders["order_time"].head(3).dt.tz_localize("Asia/Kolkata")
print(pd.DataFrame({"local (IST)": local, "UTC": local.dt.tz_convert("UTC"),
                    "Dubai": local.dt.tz_convert("Asia/Dubai")}))
try:
    print(local.iloc[0] &lt; orders["order_time"].iloc[0])
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">                local (IST)                       UTC                     Dubai
0 2026-03-02 12:10:00+05:30 2026-03-02 06:40:00+00:00 2026-03-02 10:40:00+04:00
1 2026-03-02 13:05:00+05:30 2026-03-02 07:35:00+00:00 2026-03-02 11:35:00+04:00
2 2026-03-02 20:30:00+05:30 2026-03-02 15:00:00+00:00 2026-03-02 19:00:00+04:00
TypeError: Cannot compare tz-naive and tz-aware timestamps</div>
  <p><code>tz_localize("Asia/Kolkata")</code> says "these clock readings were Indian time". It attaches the zone, shown as <code>+05:30</code>, without changing the reading: 12:10 stays 12:10. <code>tz_convert</code> then expresses the same instants on other clocks: 12:10 in India is 06:40 in UTC and 10:40 in Dubai. Every row is still the same moment; only the way it is written changes. The last line shows the safety rule: comparing an aware time with a naive one raises <code>TypeError</code>, because pandas cannot know which zone the naive one meant.</p>
  <p>Zones matter most for daily totals, because the "day" itself depends on the zone, and some zones have clock readings that do not exist:</p>
  <div class="fx" data-lang="py">import pandas as pd
utc_log = pd.Series(pd.to_datetime(["2026-03-02 17:00", "2026-03-02 19:30"]))   # server log, UTC
ist = utc_log.dt.tz_localize("UTC").dt.tz_convert("Asia/Kolkata")
print(pd.DataFrame({"UTC": utc_log, "IST": ist, "UTC day": utc_log.dt.date, "IST day": ist.dt.date}))
try:
    pd.Series(pd.to_datetime(["2026-03-08 02:30"])).dt.tz_localize("America/New_York")
except Exception as e:
    print(type(e).__name__ + ":", e)</div>
  <div class="fx" data-lang="text">                  UTC                       IST     UTC day     IST day
0 2026-03-02 17:00:00 2026-03-02 22:30:00+05:30  2026-03-02  2026-03-02
1 2026-03-02 19:30:00 2026-03-03 01:00:00+05:30  2026-03-02  2026-03-03
ValueError: 2026-03-08 02:30:00 is a nonexistent time due to daylight savings time. Try using the 'nonexistent' argument.</div>
  <p>Two payments are logged at 17:00 and 19:30 UTC on 2 March. In India the second one happened at 01:00 on 3 March, so a daily revenue report in UTC and one in Indian time disagree about which day it belongs to. The error is daylight saving: in New York the clocks jumped from 02:00 to 03:00 on 8 March 2026, so 02:30 never happened that night, and pandas refuses to guess (the <code>nonexistent=</code> and <code>ambiguous=</code> arguments say what to do). India has no daylight saving, but any data from Europe or the US meets this twice a year. The usual practice is to store and compute in UTC, convert to local time only for display, and resample in the zone whose "day" the business means.</p>

  <h2 id="pdt-resample"><span class="num">04</span>resample</h2>
  <p>The owner's first real question is "what was revenue each day?". From the groupby note you already know one way: make a day column and group by it. That works, but it has two weaknesses. A day with no orders simply does not appear, so a chart would join Monday straight to Wednesday as if Tuesday never happened. And switching from days to weeks or months means building a new label column each time.</p>
  <p><strong><code>resample</code></strong> is groupby where the groups are consecutive time buckets of a fixed size. You give it a frequency, such as <code>"D"</code> for days, and it cuts the time axis into buckets from the first timestamp to the last, puts each row in its bucket, and then aggregates each bucket. Think of sorting a shop's receipts into envelopes labelled with each date, including empty envelopes for days the shop was quiet, and writing each envelope's total on the front.</p>
  <div class="fx" data-lang="py">daily = ts["amount"].resample("D").sum()
print(daily)</div>
  <div class="fx" data-lang="text">order_time
2026-03-02    1210.0
2026-03-03     690.0
2026-03-04     180.0
2026-03-05     860.0
2026-03-06     990.0
Freq: D, Name: amount, dtype: float64</div>
  <p>Checking by hand: Monday is 240 + 450 + 520 = 1210; Tuesday 380 + 310 = 690; Wednesday is only 180, because order 107's amount is missing and <code>sum</code> skips it; Thursday 260 + 600 = 860; Friday 290 + 700 = 990. The result has a DatetimeIndex with <code>Freq: D</code>, meaning pandas knows the rows are exactly one day apart. We keep this series as <code>daily</code>; the next three sections use it.</p>
  <p>Everything groupby can do after the split also works after <code>resample</code>, including named aggregations that build several columns at once:</p>
  <div class="fx" data-lang="py">print(ts.resample("D").agg(orders=("order_id", "size"), revenue=("amount", "sum"),
                           avg_minutes=("delivery_minutes", "mean")))</div>
  <div class="fx" data-lang="text">            orders  revenue  avg_minutes
order_time                              
2026-03-02       3   1210.0         37.0
2026-03-03       2    690.0         28.0
2026-03-04       2    180.0         35.0
2026-03-05       2    860.0         52.0
2026-03-06       2    990.0         35.0</div>
  <p>Wednesday has 2 orders but revenue of only 180. Showing the count next to the sum makes it obvious that something is missing that day rather than that business collapsed. This is a good habit for any report.</p>
  <p>Now the empty buckets. With 12-hour buckets, the midnight-to-noon halves have no orders at all:</p>
  <div class="fx" data-lang="py">print(ts["amount"].resample("12h").sum().head(5))
print(ts["amount"].resample("12h").sum(min_count=1).head(5))</div>
  <div class="fx" data-lang="text">order_time
2026-03-02 12:00:00    1210.0
2026-03-03 00:00:00       0.0
2026-03-03 12:00:00     690.0
2026-03-04 00:00:00       0.0
2026-03-04 12:00:00     180.0
Freq: 12h, Name: amount, dtype: float64
order_time
2026-03-02 12:00:00    1210.0
2026-03-03 00:00:00       NaN
2026-03-03 12:00:00     690.0
2026-03-04 00:00:00       NaN
2026-03-04 12:00:00     180.0
Freq: 12h, Name: amount, dtype: float64</div>
  <p>The first result shows 0.0 for each empty half-day: resample created the bucket, and the sum of nothing is 0. That is often correct (no orders means no revenue), but it can also hide a gap, such as a logging outage, as a believable-looking zero. Passing <code>min_count=1</code> says "a sum needs at least one value", so empty buckets become NaN instead, and you can decide how to treat them. Common frequency codes are <code>"h"</code> hour, <code>"D"</code> day, <code>"W"</code> week (ending Sunday), <code>"ME"</code> month end, <code>"QE"</code> quarter end and <code>"YE"</code> year end. (pandas 2 accepted <code>"M"</code> and <code>"H"</code>; pandas 3 wants <code>"ME"</code> and <code>"h"</code>.) To resample by a column instead of the index, use <code>df.resample("D", on="order_time")</code>.</p>
  <p>On five days everything is easy to check. On real data the main danger is the edge of the data. Here is weekly revenue on a million generated orders covering 1 January to 31 March 2026, using the same <code>make_orders</code> generator as the other pandas notes:</p>
  <div class="fx" data-lang="py">big = make_orders(1_000_000)
weekly = big.set_index("order_time").sort_index()["amount"].resample("W").agg(["size", "sum"])
weekly["wow_pct"] = (weekly["sum"].pct_change() * 100).round(1)
print(weekly.head(4))
print(weekly.tail(2))</div>
  <div class="fx" data-lang="text">             size         sum  wow_pct
order_time                            
2026-01-04  44502  17815382.0      NaN
2026-01-11  77452  30975484.0     73.9
2026-01-18  77694  30962306.0     -0.0
2026-01-25  77858  31081886.0      0.4
             size         sum  wow_pct
order_time                            
2026-03-29  77795  30994623.0     -0.0
2026-04-05  22301   8921965.0    -71.2</div>
  <p>The first bucket, labelled 4 January, has 44,502 orders while the others have about 77,500, and the week-over-week change into the second week is +73.9%. Nothing happened to the business: 1 January 2026 was a Thursday, so the first "week" only covers Thursday to Sunday. The last bucket has the same problem the other way round: it holds only Monday 30 and Tuesday 31 March, and shows a "fall" of 71.2%. A bucket that covers less time than the others is called a <strong>partial period</strong>. Before comparing periods, drop partial ones, label them, or divide by the number of days they cover. Dashboards that compare "this month so far" with full previous months make this mistake constantly.</p>

  <h2 id="pdt-window"><span class="num">05</span>rolling, expanding and ewm</h2>
  <p>Daily revenue went 1210, 690, 180, 860, 990. Is Biteful growing or shrinking? The daily numbers jump too much to say, because one bad day (Wednesday) dominates. What we need is a smoothed view that looks at several days at a time, plus a running total for "how much so far". resample cannot do either: it puts each row into exactly one bucket, and the buckets never overlap.</p>
  <p>A <strong>rolling window</strong> is a fixed-size window that slides along the rows one step at a time; at each row it looks at that row and the rows just before it, and computes something such as a mean. Think of a cricketer's "average over the last three innings": after each match the oldest innings drops out and the newest comes in, so one bad day stops mattering after three matches. An <strong>expanding window</strong> always starts at the first row and grows by one row each time, like the cricketer's career total. Both return one value per row, unlike resample, which returns one value per bucket.</p>
  <div class="fx" data-lang="py">print(pd.DataFrame({"revenue": daily,
                    "roll3_mean": daily.rolling(3).mean().round(1),
                    "roll3_min1": daily.rolling(3, min_periods=1).mean().round(1),
                    "expanding_sum": daily.expanding().sum(),
                    "expanding_mean": daily.expanding().mean().round(1)}))</div>
  <div class="fx" data-lang="text">            revenue  roll3_mean  roll3_min1  expanding_sum  expanding_mean
order_time                                                                
2026-03-02   1210.0         NaN      1210.0         1210.0          1210.0
2026-03-03    690.0         NaN       950.0         1900.0           950.0
2026-03-04    180.0       693.3       693.3         2080.0           693.3
2026-03-05    860.0       576.7       576.7         2940.0           735.0
2026-03-06    990.0       676.7       676.7         3930.0           786.0</div>
  <p>Follow <code>rolling(3).mean()</code> down the column. On Monday the window holds only one value and on Tuesday two, so the result is NaN: by default a window needs all 3 values. On Wednesday the window is Monday to Wednesday, (1210 + 690 + 180) / 3 = 693.3. On Thursday Monday drops out: (690 + 180 + 860) / 3 = 576.7. On Friday, (180 + 860 + 990) / 3 = 676.7. Wednesday's dip is now spread across three days instead of standing alone. <code>min_periods=1</code> allows a result with however many values are available, so Monday is 1210 and Tuesday is (1210 + 690) / 2 = 950. <code>expanding().sum()</code> is the running total, 1210, 1900, 2080, 2940, 3930 (the same as <code>cumsum()</code>), and <code>expanding().mean()</code> is the running average: 3930 / 5 = 786 by Friday.</p>
  <p>Counting rows only works when rows are evenly spaced, as daily totals are. Individual orders are not: three orders might span an hour or a week. For that, a window can be measured in time instead of rows, which needs a sorted DatetimeIndex:</p>
  <div class="fx" data-lang="py">per_order = ts["amount"].dropna()
print(pd.DataFrame({"amount": per_order,
                    "last_3_rows": per_order.rolling(3).sum(),
                    "last_24h": per_order.rolling("24h").sum()}).head(6))</div>
  <div class="fx" data-lang="text">                     amount  last_3_rows  last_24h
order_time                                        
2026-03-02 12:10:00   240.0          NaN     240.0
2026-03-02 13:05:00   450.0          NaN     690.0
2026-03-02 20:30:00   520.0       1210.0    1210.0
2026-03-03 13:15:00   380.0       1350.0     900.0
2026-03-03 19:45:00   310.0       1210.0    1210.0
2026-03-04 12:40:00   180.0        870.0     870.0</div>
  <p>Look at Tuesday 13:15. The last three rows are Monday 13:05, Monday 20:30 and Tuesday 13:15: 450 + 520 + 380 = 1350. The 24-hour window starts at Monday 13:15, so it contains only Monday 20:30 and Tuesday 13:15: 520 + 380 = 900. Monday's two lunchtime orders were more than 24 hours old and dropped out. A window like <code>"24h"</code> or <code>"7D"</code> means "everything in this much time before now", however many rows that is, and it is the right choice for irregular events.</p>
  <p>A plain rolling mean has a weakness: every day inside the window counts equally, and a day counts fully until the moment it falls out, when it suddenly counts for nothing. An <strong>exponentially weighted moving average</strong>, <code>ewm</code>, fixes this by giving every past value a weight that shrinks the older it gets. It is like a memory that fades: yesterday matters a lot, last week a little, last month almost nothing. The simplest form uses a smoothing factor α (alpha) between 0 and 1: new average = α × today + (1 − α) × previous average.</p>
  <div class="fx" data-lang="py">print(pd.DataFrame({"revenue": daily,
                    "ewm_a0.5": daily.ewm(alpha=0.5, adjust=False).mean().round(1),
                    "ewm_span3": daily.ewm(span=3).mean().round(1)}))</div>
  <div class="fx" data-lang="text">            revenue  ewm_a0.5  ewm_span3
order_time                              
2026-03-02   1210.0    1210.0     1210.0
2026-03-03    690.0     950.0      863.3
2026-03-04    180.0     565.0      472.9
2026-03-05    860.0     712.5      679.3
2026-03-06    990.0     851.2      839.7</div>
  <p>With α = 0.5 and <code>adjust=False</code>, each value is exactly half today plus half the previous average: Tuesday 0.5 × 690 + 0.5 × 1210 = 950, Wednesday 0.5 × 180 + 0.5 × 950 = 565, Thursday 0.5 × 860 + 0.5 × 565 = 712.5. Unlike <code>rolling(3)</code>, it has a value from the first day and never has a hard edge where a day suddenly drops out. <code>span=3</code> is another way of saying α = 2 / (3 + 1) = 0.5, chosen so that it is roughly comparable with a 3-row rolling window. Its numbers differ because of the default <code>adjust=True</code>, which divides by the sum of the weights actually used; that stops the very first value from dominating the early rows. With a long series the two settings converge. <code>ewm</code> is widely used for trend lines and in finance, because it reacts to a change faster than a rolling mean of similar smoothness.</p>
  <p>Five points are too few to see smoothing, so here are daily order counts for a smaller city over the whole quarter (3,000 generated orders, about 33 a day), with a 7-day rolling mean and a 7-day-span ewm:</p>
  <div class="fx" data-lang="py">import matplotlib.pyplot as plt
quarter = make_orders(3_000, seed=1)                  # a smaller city: about 33 orders a day
per_day = quarter.set_index("order_time").sort_index().resample("D").size()

fig, ax = plt.subplots(figsize=(7.5, 3.2))
ax.plot(per_day.index, per_day, color="#9aa5b1", lw=1, label="orders per day")
ax.plot(per_day.index, per_day.rolling(7).mean(), color="#2a78d6", lw=2.2, label="rolling(7).mean()")
ax.plot(per_day.index, per_day.ewm(span=7).mean(), color="#e8743b", lw=2, ls="--", label="ewm(span=7).mean()")
ax.set_ylabel("orders")
ax.legend(frameon=False, ncols=3, loc="upper center", bbox_to_anchor=(0.5, 1.15))
fig.autofmt_xdate()
fig.savefig("smoothing.svg", format="svg", transparent=True, bbox_inches="tight")
print(per_day.describe()[["mean", "std", "min", "max"]].round(1).to_dict())
print("std of rolling(7):", round(per_day.rolling(7).mean().std(), 1))</div>
  <div class="fx" data-lang="text">{'mean': 33.3, 'std': 5.9, 'min': 20.0, 'max': 46.0}
std of rolling(7): 2.2</div>
  <figure class="viz"><svg viewBox="0 0 468.768359 235.577932" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:640px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="smfigure_1">
  <g id="smpatch_1">
   <path d="M 0 235.577932 
L 468.768359 235.577932 
L 468.768359 -0 
L 0 -0 
L 0 235.577932 
z
" style="fill: none"/>
  </g>
  <g id="smaxes_1">
   <g id="smpatch_2">
    <path d="M 43.068359 182.3728 
L 461.568359 182.3728 
L 461.568359 25.7008 
L 43.068359 25.7008 
L 43.068359 182.3728 
z
" style="fill: none"/>
   </g>
   <g id="smmatplotlib.axis_1">
    <g id="smxtick_1">
     <g id="smline2d_1">
      <defs>
       <path id="smm705a7a0621" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#smm705a7a0621" x="62.091087" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(13.547271 225.09289) rotate(-30)">2026-01-01</text>
     </g>
    </g>
    <g id="smxtick_2">
     <g id="smline2d_2">
      <g>
       <use xlink:href="#smm705a7a0621" x="121.937869" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(73.592969 224.978046) rotate(-30)">2026-01-15</text>
     </g>
    </g>
    <g id="smxtick_3">
     <g id="smline2d_3">
      <g>
       <use xlink:href="#smm705a7a0621" x="194.608962" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(144.306033 226.108515) rotate(-30)">2026-02-01</text>
     </g>
    </g>
    <g id="smxtick_4">
     <g id="smline2d_4">
      <g>
       <use xlink:href="#smm705a7a0621" x="254.455744" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(204.35173 225.993671) rotate(-30)">2026-02-15</text>
     </g>
    </g>
    <g id="smxtick_5">
     <g id="smline2d_5">
      <g>
       <use xlink:href="#smm705a7a0621" x="314.302527" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(263.931939 226.147577) rotate(-30)">2026-03-01</text>
     </g>
    </g>
    <g id="smxtick_6">
     <g id="smline2d_6">
      <g>
       <use xlink:href="#smm705a7a0621" x="374.149309" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(323.977637 226.032734) rotate(-30)">2026-03-15</text>
     </g>
    </g>
    <g id="smxtick_7">
     <g id="smline2d_7">
      <g>
       <use xlink:href="#smm705a7a0621" x="446.820402" y="182.3728" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit" transform="translate(396.204892 226.288984) rotate(-30)">2026-04-01</text>
     </g>
    </g>
   </g>
   <g id="smmatplotlib.axis_2">
    <g id="smytick_1">
     <g id="smline2d_8">
      <defs>
       <path id="smmb4a98927d3" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#smmb4a98927d3" x="43.068359" y="175.251345" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="180.095095" transform="rotate(-0 36.068359 180.095095)">20</text>
     </g>
    </g>
    <g id="smytick_2">
     <g id="smline2d_9">
      <g>
       <use xlink:href="#smmb4a98927d3" x="43.068359" y="147.861136" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="152.704886" transform="rotate(-0 36.068359 152.704886)">25</text>
     </g>
    </g>
    <g id="smytick_3">
     <g id="smline2d_10">
      <g>
       <use xlink:href="#smmb4a98927d3" x="43.068359" y="120.470926" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="125.314676" transform="rotate(-0 36.068359 125.314676)">30</text>
     </g>
    </g>
    <g id="smytick_4">
     <g id="smline2d_11">
      <g>
       <use xlink:href="#smmb4a98927d3" x="43.068359" y="93.080716" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="97.924466" transform="rotate(-0 36.068359 97.924466)">35</text>
     </g>
    </g>
    <g id="smytick_5">
     <g id="smline2d_12">
      <g>
       <use xlink:href="#smmb4a98927d3" x="43.068359" y="65.690506" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="70.534256" transform="rotate(-0 36.068359 70.534256)">40</text>
     </g>
    </g>
    <g id="smytick_6">
     <g id="smline2d_13">
      <g>
       <use xlink:href="#smmb4a98927d3" x="43.068359" y="38.300297" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="smtext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="43.144047" transform="rotate(-0 36.068359 43.144047)">45</text>
     </g>
    </g>
    <g id="smtext_14">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="16.8875" y="104.0368" transform="rotate(-90 16.8875 104.0368)">orders</text>
    </g>
   </g>
   <g id="smline2d_14">
    <path d="M 62.091087 114.992884 
L 66.365857 87.602674 
L 70.640627 93.080716 
L 74.915397 71.168548 
L 79.190167 93.080716 
L 83.464938 120.470926 
L 87.739708 98.558758 
L 92.014478 114.992884 
L 96.289248 136.905052 
L 100.564018 131.42701 
L 104.838788 104.0368 
L 109.113559 131.42701 
L 113.388329 175.251345 
L 117.663099 109.514842 
L 121.937869 54.734422 
L 126.212639 131.42701 
L 130.487409 104.0368 
L 134.76218 87.602674 
L 139.03695 76.64659 
L 143.31172 76.64659 
L 147.58649 93.080716 
L 151.86126 147.861136 
L 156.13603 125.948968 
L 160.410801 54.734422 
L 164.685571 76.64659 
L 168.960341 142.383094 
L 173.235111 93.080716 
L 177.509881 76.64659 
L 181.784652 109.514842 
L 186.059422 131.42701 
L 190.334192 131.42701 
L 194.608962 71.168548 
L 198.883732 158.81722 
L 203.158502 82.124632 
L 207.433273 104.0368 
L 211.708043 98.558758 
L 215.982813 76.64659 
L 220.257583 142.383094 
L 224.532353 109.514842 
L 228.807123 109.514842 
L 233.081894 82.124632 
L 237.356664 104.0368 
L 241.631434 120.470926 
L 245.906204 104.0368 
L 250.180974 142.383094 
L 254.455744 125.948968 
L 258.730515 54.734422 
L 263.005285 109.514842 
L 267.280055 142.383094 
L 271.554825 49.25638 
L 275.829595 49.25638 
L 280.104366 109.514842 
L 284.379136 142.383094 
L 288.653906 82.124632 
L 292.928676 54.734422 
L 297.203446 87.602674 
L 301.478216 82.124632 
L 305.752987 32.822255 
L 310.027757 98.558758 
L 314.302527 71.168548 
L 318.577297 114.992884 
L 322.852067 120.470926 
L 327.126837 125.948968 
L 331.401608 114.992884 
L 335.676378 158.81722 
L 339.951148 43.778338 
L 344.225918 93.080716 
L 348.500688 175.251345 
L 352.775458 65.690506 
L 357.050229 120.470926 
L 361.324999 65.690506 
L 365.599769 71.168548 
L 369.874539 120.470926 
L 374.149309 98.558758 
L 378.424079 76.64659 
L 382.69885 125.948968 
L 386.97362 158.81722 
L 391.24839 104.0368 
L 395.52316 120.470926 
L 399.79793 120.470926 
L 404.072701 49.25638 
L 408.347471 49.25638 
L 412.622241 87.602674 
L 416.897011 120.470926 
L 421.171781 43.778338 
L 425.446551 60.212464 
L 429.721322 109.514842 
L 433.996092 109.514842 
L 438.270862 136.905052 
L 442.545632 142.383094 
" clip-path="url(#smp5ebee3ba2e)" style="fill: none; stroke: #9aa5b1; stroke-linecap: square"/>
   </g>
   <g id="smline2d_15">
    <path d="M 87.739708 96.993603 
L 92.014478 96.993603 
L 96.289248 104.0368 
L 100.564018 109.514842 
L 104.838788 114.210306 
L 109.113559 119.688348 
L 113.388329 127.514123 
L 117.663099 129.079278 
L 121.937869 120.470926 
L 126.212639 119.688348 
L 130.487409 115.775461 
L 134.76218 113.427729 
L 139.03695 105.601955 
L 143.31172 91.515561 
L 147.58649 89.167829 
L 151.86126 102.471645 
L 156.13603 101.689068 
L 160.410801 94.645871 
L 164.685571 93.080716 
L 168.960341 102.471645 
L 173.235111 104.819377 
L 177.509881 102.471645 
L 181.784652 96.993603 
L 186.059422 97.776181 
L 190.334192 108.732265 
L 194.608962 107.949687 
L 198.883732 110.297419 
L 203.158502 108.732265 
L 207.433273 112.645152 
L 211.708043 111.079997 
L 215.982813 103.254223 
L 220.257583 104.819377 
L 224.532353 110.297419 
L 228.807123 103.254223 
L 233.081894 103.254223 
L 237.356664 103.254223 
L 241.631434 106.384532 
L 245.906204 110.297419 
L 250.180974 110.297419 
L 254.455744 112.645152 
L 258.730515 104.819377 
L 263.005285 108.732265 
L 267.280055 114.210306 
L 271.554825 104.0368 
L 275.829595 96.211026 
L 280.104366 91.515561 
L 284.379136 93.863294 
L 288.653906 97.776181 
L 292.928676 89.950406 
L 297.203446 82.124632 
L 301.478216 86.820097 
L 305.752987 84.472364 
L 310.027757 82.90721 
L 314.302527 72.733703 
L 318.577297 77.429168 
L 322.852067 86.820097 
L 327.126837 92.298139 
L 331.401608 96.993603 
L 335.676378 114.992884 
L 339.951148 107.16711 
L 344.225918 110.297419 
L 348.500688 118.905771 
L 352.775458 111.079997 
L 357.050229 110.297419 
L 361.324999 103.254223 
L 365.599769 90.732984 
L 369.874539 101.689068 
L 374.149309 102.471645 
L 378.424079 88.385252 
L 382.69885 96.993603 
L 386.97362 102.471645 
L 391.24839 107.949687 
L 395.52316 114.992884 
L 399.79793 114.992884 
L 404.072701 107.949687 
L 408.347471 104.0368 
L 412.622241 98.558758 
L 416.897011 93.080716 
L 421.171781 84.472364 
L 425.446551 75.864013 
L 429.721322 74.298858 
L 433.996092 82.90721 
L 438.270862 95.428448 
L 442.545632 103.254223 
" clip-path="url(#smp5ebee3ba2e)" style="fill: none; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: square"/>
   </g>
   <g id="smline2d_16">
    <path d="M 62.091087 114.992884 
L 66.365857 99.341335 
L 70.640627 96.634041 
L 74.915397 87.320946 
L 79.190167 89.208912 
L 83.464938 98.716575 
L 87.739708 98.671043 
L 92.014478 103.205457 
L 96.289248 112.314289 
L 100.564018 117.377602 
L 104.838788 113.895327 
L 109.113559 118.421625 
L 113.388329 132.974798 
L 117.663099 127.003411 
L 121.937869 108.691453 
L 126.212639 114.432886 
L 130.487409 111.81418 
L 134.76218 105.726986 
L 139.03695 98.426016 
L 143.31172 92.963838 
L 147.58649 92.993127 
L 151.86126 106.734642 
L 156.13603 111.544658 
L 160.410801 97.327834 
L 164.685571 92.153629 
L 168.960341 104.718087 
L 173.235111 101.807512 
L 177.509881 95.515284 
L 181.784652 99.016007 
L 186.059422 107.120205 
L 190.334192 113.19772 
L 194.608962 102.689372 
L 198.883732 116.722391 
L 203.158502 108.072462 
L 207.433273 107.063504 
L 211.708043 104.93725 
L 215.982813 97.864416 
L 220.257583 108.994285 
L 224.532353 109.124426 
L 228.807123 109.222031 
L 233.081894 102.44763 
L 237.356664 102.844925 
L 241.631434 107.251444 
L 245.906204 106.44778 
L 250.180974 115.43163 
L 254.455744 118.060969 
L 258.730515 102.229311 
L 263.005285 104.050696 
L 267.280055 113.633802 
L 271.554825 97.539438 
L 275.829595 85.468668 
L 280.104366 91.480214 
L 284.379136 104.205937 
L 288.653906 98.68561 
L 292.928676 87.697811 
L 297.203446 87.674027 
L 301.478216 86.286678 
L 305.752987 72.920572 
L 310.027757 79.330118 
L 314.302527 77.289726 
L 318.577297 86.715516 
L 322.852067 95.154368 
L 327.126837 102.853018 
L 331.401608 105.887985 
L 335.676378 119.120294 
L 339.951148 100.284805 
L 344.225918 98.483783 
L 348.500688 117.675673 
L 352.775458 104.679382 
L 357.050229 108.627268 
L 361.324999 97.893077 
L 365.599769 91.211945 
L 369.874539 98.52669 
L 374.149309 98.534707 
L 378.424079 93.062678 
L 382.69885 101.28425 
L 386.97362 115.667493 
L 391.24839 112.75982 
L 395.52316 114.687596 
L 399.79793 116.133429 
L 404.072701 99.414167 
L 408.347471 86.87472 
L 412.622241 87.056709 
L 416.897011 95.410263 
L 421.171781 82.502282 
L 425.446551 76.929827 
L 429.721322 85.076081 
L 433.996092 91.185771 
L 438.270862 102.615591 
L 442.545632 112.557467 
" clip-path="url(#smp5ebee3ba2e)" style="fill: none; stroke-dasharray: 7.4,3.2; stroke-dashoffset: 0; stroke: #e8743b; stroke-width: 2"/>
   </g>
   <g id="smpatch_3">
    <path d="M 43.068359 182.3728 
L 43.068359 25.7008 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="smpatch_4">
    <path d="M 43.068359 182.3728 
L 461.568359 182.3728 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="smlegend_1">
    <g id="smline2d_17">
     <path d="M 65.840234 17.3875 
L 75.840234 17.3875 
L 85.840234 17.3875 
" style="fill: none; stroke: #9aa5b1; stroke-linecap: square"/>
    </g>
    <g id="smtext_15">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="93.840234" y="20.8875" transform="rotate(-0 93.840234 20.8875)">orders per day</text>
    </g>
    <g id="smline2d_18">
     <path d="M 182.985547 17.3875 
L 192.985547 17.3875 
L 202.985547 17.3875 
" style="fill: none; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: square"/>
    </g>
    <g id="smtext_16">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="210.985547" y="20.8875" transform="rotate(-0 210.985547 20.8875)">rolling(7).mean()</text>
    </g>
    <g id="smline2d_19">
     <path d="M 309.226172 17.3875 
L 319.226172 17.3875 
L 329.226172 17.3875 
" style="fill: none; stroke-dasharray: 7.4,3.2; stroke-dashoffset: 0; stroke: #e8743b; stroke-width: 2"/>
    </g>
    <g id="smtext_17">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="337.226172" y="20.8875" transform="rotate(-0 337.226172 20.8875)">ewm(span=7).mean()</text>
    </g>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="smp5ebee3ba2e">
   <rect x="43.068359" y="25.7008" width="418.5" height="156.672"/>
  </clipPath>
 </defs>
</svg><figcaption>Daily orders (grey) swing between 20 and 46. The 7-day rolling mean (blue) and the ewm with span 7 (orange, dashed) follow the same level with much less noise; the rolling line starts only on day 7, while ewm starts on day 1 and reacts a little faster to changes.</figcaption></figure>
  <p>The printed numbers confirm what the chart shows: daily counts have a standard deviation of 5.9 orders around a mean of 33.3, while the 7-day rolling mean varies with a standard deviation of only 2.2. The generator has no real trend, so the smoothed lines wander around a flat level, which is exactly what they should do. Two cautions apply to all windows. A row-count window on irregular data mixes different time spans, so resample to a regular frequency first or use a time-based window. And <code>rolling(..., center=True)</code> puts the window around each row, using future values: fine for a chart, but cheating if the result becomes a feature for predicting the future (see <a class="xref" data-note="ml_features">Feature Engineering</a>).</p>

  <h2 id="pdt-shift"><span class="num">06</span>shift, diff and pct_change</h2>
  <p>The owner's sharpest question is "how did today do compared with yesterday?". Every vectorised operation we have seen works on each row in isolation, so how does Tuesday's row see Monday's value? The answer is to move the whole column down by one row, so that each row has the previous value sitting next to it, and then use ordinary column arithmetic.</p>
  <p><strong><code>shift(1)</code></strong> moves every value down one row; the value that now sits on each row is called a <strong>lag</strong>, the value from one step earlier. Picture sliding a transparent copy of the sales sheet down one line, so each day's line shows yesterday's figure underneath. <code>diff()</code> is the value minus its lag, and <code>pct_change()</code> is that difference divided by the lag, the growth rate:</p>
  <div class="fx" data-lang="py">print(pd.DataFrame({"revenue": daily,
                    "yesterday": daily.shift(1),
                    "diff": daily.diff(),
                    "pct_change": (daily.pct_change() * 100).round(1)}))</div>
  <div class="fx" data-lang="text">            revenue  yesterday   diff  pct_change
order_time                                       
2026-03-02   1210.0        NaN    NaN         NaN
2026-03-03    690.0     1210.0 -520.0       -43.0
2026-03-04    180.0      690.0 -510.0       -73.9
2026-03-05    860.0      180.0  680.0       377.8
2026-03-06    990.0      860.0  130.0        15.1</div>
  <p>Monday has no previous day, so its lag is NaN and so are its change and growth. Tuesday's change is 690 − 1210 = −520, and its growth is −520 / 1210 = −0.430, shown as −43.0% after multiplying by 100. Thursday's change is 860 − 180 = +680, a growth of +377.8%. That last number is a lesson in reading percentages: a huge percentage on a small base usually means the base was unusual (Wednesday's 180 includes an unknown amount), not that the business nearly quadrupled. <code>shift(-1)</code> moves values up instead, giving the next value (a <strong>lead</strong>), and <code>diff(7)</code> or <code>pct_change(7)</code> compare with seven rows back, which on daily data means the same weekday last week.</p>
  <p>The important detail is that <code>shift</code> works on row positions, not on dates. It moves values to the row above or below, whatever dates those rows have:</p>
  <div class="fx" data-lang="py">shuffled = daily.sample(frac=1, random_state=1)
print(pd.DataFrame({"revenue": shuffled, "diff (wrong order)": shuffled.diff()}))</div>
  <div class="fx" data-lang="text">            revenue  diff (wrong order)
order_time                             
2026-03-04    180.0                 NaN
2026-03-03    690.0               510.0
2026-03-06    990.0               300.0
2026-03-02   1210.0               220.0
2026-03-05    860.0              -350.0</div>
  <p>The same five days in a shuffled order. <code>diff()</code> happily subtracts whatever row happens to be above, so Tuesday's "change" is 690 − 180 = 510, Tuesday minus Wednesday, which means nothing. There is no error and no warning. Every lag, difference, rolling window and cumulative sum follows row order, so sort by time before using any of them.</p>
  <p>When the index is a DatetimeIndex you can also shift by time instead of by rows, which moves the labels and leaves the values where they are:</p>
  <div class="fx" data-lang="py">print(daily.shift(1, freq="D").head(3))</div>
  <div class="fx" data-lang="text">order_time
2026-03-03    1210.0
2026-03-04     690.0
2026-03-05     180.0
Freq: D, Name: amount, dtype: float64</div>
  <p>With <code>freq="D"</code>, Monday's 1210 is relabelled as Tuesday, Tuesday's 690 as Wednesday, and so on. The difference matters when days are missing: shifting rows would pair a day with whatever row came before it, possibly three days earlier, while shifting by <code>freq</code> pairs it with the true previous date, and pandas lines up the labels when you subtract.</p>

  <h2 id="pdt-group"><span class="num">07</span>Windows Inside Groups</h2>
  <p>So far every window ran over the whole table. Many real questions need a window that restarts for each customer or each city: how many days pass between a customer's orders, what is each customer's running spend, which are the two biggest orders in each city. These all look at other rows in the same group but still return one value per row. In SQL they are called <strong>window functions</strong> (see <a class="xref" data-note="sql_windows">SQL Window Functions</a>); in pandas they are a <code>groupby</code> followed by <code>shift</code>, <code>diff</code>, <code>cumsum</code>, <code>cumcount</code>, <code>rank</code> or <code>rolling</code>. Think of a school sports day where each house keeps its own points tally: the tally grows through the day, but it never mixes with another house's points.</p>
  <div class="fx" data-lang="py">o = orders.sort_values("order_time")
o["nth_order"] = o.groupby("customer").cumcount() + 1
o["days_since_prev"] = o.groupby("customer")["order_time"].diff().dt.days
o["running_spend"] = o.groupby("customer")["amount"].cumsum()
print(o.loc[o["customer"].isin(["Asha", "Dia"]),
            ["customer", "order_time", "amount", "nth_order", "days_since_prev", "running_spend"]])</div>
  <div class="fx" data-lang="text">   customer          order_time  amount  nth_order  days_since_prev  running_spend
0      Asha 2026-03-02 12:10:00   240.0          1              NaN          240.0
3      Asha 2026-03-03 13:15:00   380.0          2              1.0          620.0
4       Dia 2026-03-03 19:45:00   310.0          1              NaN          310.0
9      Asha 2026-03-06 13:00:00   290.0          3              2.0          910.0
10      Dia 2026-03-06 20:50:00   700.0          2              3.0         1010.0</div>
  <p>After sorting by time, <code>groupby("customer").cumcount() + 1</code> numbers each customer's orders 1, 2, 3. <code>groupby("customer")["order_time"].diff()</code> subtracts each customer's previous order time from the current one, and <code>.dt.days</code> keeps the whole days: Asha ordered on Monday 12:10, Tuesday 13:15 (1 day and 65 minutes later, so 1) and Friday 13:00 (2 days 23 hours 45 minutes later, so 2; <code>.days</code> rounds down). Each customer's first order has nothing before it, so it is NaN. <code>groupby("customer")["amount"].cumsum()</code> is the running spend, restarting for each customer: Asha 240, 620, 910; Dia 310, 1010. Notice that all of these keep the original rows and index, the same shape as <code>transform</code> in the groupby note.</p>
  <p>Ranking works the same way, with one extra decision: what to do with ties.</p>
  <div class="fx" data-lang="py">o = orders.sort_values("order_time")
o["rank_in_city"] = o.groupby("city")["amount"].rank(method="dense", ascending=False)
print(o[o["rank_in_city"] &lt;= 2].sort_values(["city", "rank_in_city"])[["city", "order_id", "customer", "amount", "rank_in_city"]])
x = pd.Series([700, 600, 600, 450], index=["a", "b", "c", "d"])
print(pd.DataFrame({"amount": x, "first": x.rank(method="first", ascending=False),
                    "min": x.rank(method="min", ascending=False),
                    "dense": x.rank(method="dense", ascending=False)}))</div>
  <div class="fx" data-lang="text">      city  order_id customer  amount  rank_in_city
10  Mumbai       111      Dia   700.0           1.0
8   Mumbai       109    Farah   600.0           2.0
2     Pune       103     Chen   520.0           1.0
3     Pune       104     Asha   380.0           2.0
   amount  first  min  dense
a     700    1.0  1.0    1.0
b     600    2.0  2.0    2.0
c     600    3.0  2.0    2.0
d     450    4.0  4.0    3.0</div>
  <p><code>groupby("city")["amount"].rank(method="dense", ascending=False)</code> ranks amounts within each city, largest first, and filtering on <code>rank_in_city &lt;= 2</code> gives the top two orders per city: Mumbai's 700 and 600, Pune's 520 and 380. The small table shows the tie rules on two orders of 600. <code>first</code> breaks ties by row order (2 and 3), matching SQL's <code>ROW_NUMBER()</code>. <code>min</code> gives both the lower rank and skips the next number (2, 2, then 4), like <code>RANK()</code>. <code>dense</code> gives both 2 and continues with 3, like <code>DENSE_RANK()</code>. For "top N per group" choose deliberately: <code>dense</code> or <code>min</code> keeps both tied orders, while <code>sort_values(...).groupby(...).head(2)</code> cuts at exactly two rows. Unlike the others, <code>rank</code> sorts by value itself; <code>shift</code>, <code>diff</code>, <code>cumsum</code> and <code>cumcount</code> follow the current row order, so the table must be sorted by time first.</p>

  <h2 id="pdt-offset"><span class="num">08</span>Date Ranges and Offsets</h2>
  <p>Time series work constantly needs dates that are not in the data: a full calendar to compare against, "two business days after the order", "the end of this month". Adding a fixed number of hours does not always give the right answer, because the calendar is irregular: months have 28 to 31 days and weekends are not business days. pandas has two tools for this. <strong><code>pd.date_range</code></strong> builds a sequence of dates at a given frequency, and a <strong>date offset</strong> is a calendar rule, such as "one month later" or "next business day", that can be added to a date.</p>
  <div class="fx" data-lang="py">import pandas as pd
print(pd.date_range("2026-03-02", periods=5, freq="D").strftime("%a %d").tolist())
print(pd.date_range("2026-03-01", "2026-03-15", freq="B").strftime("%a %d").tolist())
print(pd.date_range("2026-01-01", periods=3, freq="ME").strftime("%Y-%m-%d").tolist())</div>
  <div class="fx" data-lang="text">['Mon 02', 'Tue 03', 'Wed 04', 'Thu 05', 'Fri 06']
['Mon 02', 'Tue 03', 'Wed 04', 'Thu 05', 'Fri 06', 'Mon 09', 'Tue 10', 'Wed 11', 'Thu 12', 'Fri 13']
['2026-01-31', '2026-02-28', '2026-03-31']</div>
  <p>The first range is five consecutive days starting Monday 2 March. The second uses <code>"B"</code>, business days, and skips both weekends (7–8 and 14–15 March) between 1 and 15 March; 1 March is a Sunday so it is not included. The third gives three month ends. The frequency codes are the same ones <code>resample</code> uses.</p>
  <p>The difference between a duration and a calendar rule is easiest to see on 31 January:</p>
  <div class="fx" data-lang="py">import pandas as pd
jan31 = pd.Timestamp("2026-01-31")
print(jan31 + pd.Timedelta(days=30), "&lt;- Timedelta: exactly 30 x 24 hours")
print(jan31 + pd.DateOffset(months=1), "&lt;- DateOffset: one calendar month")
print(pd.Timestamp("2026-03-06 20:50") + pd.offsets.BDay(2), "&lt;- 2 business days after Friday")
print(pd.Timestamp("2026-03-04") + pd.offsets.MonthEnd(0), "&lt;- roll forward to month end")
print(pd.Timestamp("2026-03-04") - pd.offsets.MonthBegin(1), "&lt;- back to month start")</div>
  <div class="fx" data-lang="text">2026-03-02 00:00:00 &lt;- Timedelta: exactly 30 x 24 hours
2026-02-28 00:00:00 &lt;- DateOffset: one calendar month
2026-03-10 20:50:00 &lt;- 2 business days after Friday
2026-03-31 00:00:00 &lt;- roll forward to month end
2026-03-01 00:00:00 &lt;- back to month start</div>
  <p>Adding <code>Timedelta(days=30)</code> adds exactly 30 × 24 hours and lands on 2 March, because February 2026 has 28 days. Adding <code>DateOffset(months=1)</code> follows the calendar: one month after 31 January is the last day of February, the 28th. So a Timedelta is like a stopwatch, always the same length, while a DateOffset is like a calendar on the wall that knows month lengths and weekends. <code>BDay(2)</code> counts two business days after Friday 6 March and lands on Tuesday 10 March, keeping the time of day. <code>MonthEnd(0)</code> rolls a date forward to the end of its month (31 March), and subtracting <code>MonthBegin(1)</code> goes back to the first. (Public holidays are not known by default; <code>CustomBusinessDay</code> accepts a holiday list.)</p>
  <p>A date range is also how you find and handle missing days. Suppose Wednesday's row was lost from a report. A row-based rolling window would not notice:</p>
  <div class="fx" data-lang="py">gappy = daily.drop(pd.Timestamp("2026-03-04"))          # a day missing from a report
full = pd.date_range(gappy.index.min(), gappy.index.max(), freq="D")
print(gappy.reindex(full).rolling(3, min_periods=1).mean().round(1).tolist(), "&lt;- with the gap as NaN")
print(gappy.rolling(3, min_periods=1).mean().round(1).tolist(), "&lt;- gap ignored: windows span 4 days")</div>
  <div class="fx" data-lang="text">[1210.0, 950.0, 950.0, 775.0, 925.0] &lt;- with the gap as NaN
[1210.0, 950.0, 920.0, 846.7] &lt;- gap ignored: windows span 4 days</div>
  <p>Reindexing onto a full daily range puts Wednesday back as NaN, so every 3-row window really covers 3 days: Thursday's window is Tuesday, (missing) and Thursday, giving (690 + 860) / 2 = 775. Without reindexing, the series has only four rows and Thursday's "3-day" window silently stretches over Monday, Tuesday and Thursday: (1210 + 690 + 860) / 3 = 920. <code>asfreq("D")</code> does the same as the reindex for a series with a DatetimeIndex, and a time-based window such as <code>rolling("3D")</code> avoids the problem altogether.</p>

  <h2 id="pdt-mem"><span class="num">09</span>Memory: Measuring and Shrinking</h2>
  <p>Everything so far ran on 11 rows. Real Biteful data for a year is tens of millions of orders, and pandas keeps the whole table in RAM, the computer's working memory, which is fast but limited (how RAM, caches and the stack and heap work is covered in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>). Operations also make temporary copies, so a rule of thumb is that pandas needs several times the table's own size to work comfortably. When memory runs out, the analysis does not slow down gracefully; it crashes or the machine starts swapping to disk and grinds to a halt. So the first performance skill is knowing where the memory goes.</p>
  <p><strong><code>memory_usage(deep=True)</code></strong> reports the bytes used by each column. "Deep" means it also counts the text inside string columns, not just the pointers to it:</p>
  <div class="fx" data-lang="py">big = make_orders(1_000_000)
def mb(df):
    return round(df.memory_usage(deep=True).sum() / 1e6, 1)
print((big.memory_usage(deep=True) / 1e6).round(1))
print("total MB:", mb(big))
city_obj = big["city"].astype(object)            # the pandas 2 way of storing text
print("object city  shallow:", round(city_obj.memory_usage() / 1e6, 1), "MB",
      "  deep:", round(city_obj.memory_usage(deep=True) / 1e6, 1), "MB")</div>
  <div class="fx" data-lang="text">Index                0.0
order_id             8.0
customer            12.4
restaurant          18.2
city                12.9
order_time           8.0
amount               8.0
delivery_minutes     8.0
dtype: float64
total MB: 75.5
object city  shallow: 8.0 MB   deep: 53.9 MB</div>
  <p>Every numeric and datetime column costs 8.0 MB per million rows, because <code>int64</code>, <code>float64</code> and <code>datetime64</code> use 8 bytes per value. The three text columns cost more: customer 12.4 MB, restaurant 18.2 MB (longer names) and city 12.9 MB, for 75.5 MB in total. The last line shows why <code>deep=True</code> matters. In pandas 3 text columns use the new <code>str</code> type, stored compactly by the pyarrow library, and pandas measures them correctly either way. In pandas 2 text was stored as <code>object</code>, a column of pointers to separate Python string objects; without <code>deep</code>, pandas counts only the 8-byte pointers (8.0 MB) and misses the 53.9 MB the strings really use. Old code and old files still produce object columns, so always measure with <code>deep=True</code>.</p>
  <p>The city column has a million values but only two distinct ones, "Pune" and "Mumbai". Storing the word a million times is wasteful. The <strong><code>category</code></strong> dtype stores each distinct value once, in a small list called the categories, and then stores one small integer code per row pointing into that list. It works like the contacts list on your phone: the name "Biryani Bros" is saved once, and every entry in the call log just points to it.</p>
  <div class="fx" data-lang="py">city = big["city"]
print("str      :", round(city.memory_usage(deep=True) / 1e6, 1), "MB")
print("object   :", round(city.astype(object).memory_usage(deep=True) / 1e6, 1), "MB")
cat = city.astype("category")
print("category :", round(cat.memory_usage(deep=True) / 1e6, 1), "MB")
print(cat.cat.categories.tolist(), cat.cat.codes.head(4).tolist(), cat.cat.codes.dtype)
print("order_id as category:", round(big["order_id"].astype("category").memory_usage(deep=True) / 1e6, 1), "MB",
      "vs int64:", round(big["order_id"].memory_usage(deep=True) / 1e6, 1), "MB")</div>
  <div class="fx" data-lang="text">str      : 12.9 MB
object   : 53.9 MB
category : 1.0 MB
['Mumbai', 'Pune'] [0, 0, 0, 0] int8
order_id as category: 12.0 MB vs int64: 8.0 MB</div>
  <p>The same city column takes 12.9 MB as <code>str</code>, 53.9 MB as the old <code>object</code> type, and 1.0 MB as <code>category</code>. The next line shows how: the categories are <code>['Mumbai', 'Pune']</code> and each row holds a code, 0 for Mumbai, stored as <code>int8</code>, one byte. The number of distinct values in a column is called its <strong>cardinality</strong>, and category pays off when cardinality is low compared with the number of rows. It is not magic: <code>order_id</code> has a million distinct values, so as a category it needs a million-entry list plus codes, 12.0 MB against 8.0 MB as plain integers.</p>
  <p>The other half of shrinking is <strong>downcasting</strong>: storing numbers in a smaller type that still holds every value. An <code>int64</code> can hold numbers up to about 9 × 10<sup>18</sup>, which is far more than an order id or a customer number needs.</p>
  <div class="fx" data-lang="py">def mb(df):
    return round(df.memory_usage(deep=True).sum() / 1e6, 1)
small = big.copy()
for col in ["restaurant", "city"]:
    small[col] = small[col].astype("category")                               # few distinct values
small["customer"] = pd.to_numeric(small["customer"], downcast="unsigned")   # "17013" -&gt; uint16
small["order_id"] = pd.to_numeric(small["order_id"], downcast="unsigned")   # -&gt; uint32
small["delivery_minutes"] = small["delivery_minutes"].astype("float32")
print(small.dtypes)
print("before:", mb(big), "MB   after:", mb(small), "MB")</div>
  <div class="fx" data-lang="text">order_id                    uint32
customer                    uint16
restaurant                category
city                      category
order_time          datetime64[us]
amount                     float64
delivery_minutes           float32
dtype: object
before: 75.5 MB   after: 28.0 MB</div>
  <p>Restaurant and city became categories. Customer ids "1" to "20000" were text; <code>pd.to_numeric(..., downcast="unsigned")</code> converted them to numbers and picked the smallest unsigned integer type that fits, <code>uint16</code> (0 to 65,535, 2 bytes per value). Order ids up to 1,000,000 became <code>uint32</code> (4 bytes). Delivery minutes became <code>float32</code> (4 bytes), which has plenty of precision for minutes. Amount stayed <code>float64</code> because it is money. The table went from 75.5 MB to 28.0 MB with the same information.</p>
  <p>Smaller types also make work faster, because there are fewer bytes to move through memory and the CPU can compare small integer codes instead of strings:</p>
  <div class="fx" data-lang="py">small = big.astype({"restaurant": "category", "city": "category"})
print("groupby city+restaurant   str:", best_ms(lambda: big.groupby(["city", "restaurant"])["amount"].sum()), "ms",
      "  category:", best_ms(lambda: small.groupby(["city", "restaurant"], observed=True)["amount"].sum()), "ms")</div>
  <div class="fx" data-lang="text">groupby city+restaurant   str: 60.0 ms   category: 27.8 ms</div>
  <p>Grouping by two category columns took about 28 ms against about 60 ms for the same grouping on text (timings are approximate and vary by machine; the direction does not). <code>observed=True</code> tells pandas to list only the city and restaurant combinations that actually occur, which is the default in pandas 3.</p>
  <p>The one dtype change that can hurt you is <code>float32</code>:</p>
  <div class="fx" data-lang="py">import numpy as np
print(np.float32(12_345_678.91), "vs", np.float64(12_345_678.91))
amounts = np.full(1_000_000, 0.1)
print(amounts.astype("float32").sum(dtype="float32"), "vs", amounts.sum())</div>
  <div class="fx" data-lang="text">1.2345679e+07 vs 12345678.91
100000.01 vs 100000.00000000003</div>
  <p>A <code>float32</code> keeps only about 7 significant digits, so ₹1,23,45,678.91 becomes 12,345,679 and the paise are gone. Worse, the errors add up: summing a million values of 0.1 in float32 gives 100000.01, while float64 gives 100000.00000000003, wrong only in the 17th digit. Keep money, and anything you will add up over many rows, in <code>float64</code> or as integer paise. The best place to apply all of this is at load time, by passing <code>dtype=</code> to <code>read_csv</code>, so the wide version never exists in memory; section 11 shows that.</p>

  <h2 id="pdt-vec"><span class="num">10</span>Vectorisation vs apply</h2>
  <p>The other cost is time. Suppose every order needs a delivery fee added: ₹30 in Pune, ₹40 in Mumbai. Someone coming from plain Python naturally writes a loop over the rows, and pandas offers several ways to do that. A <strong>vectorised</strong> operation instead works on a whole column at once: you write one expression, and pandas runs the loop inside compiled C code over the column's array, never returning to Python for each row. Here are all four approaches on 100,000 orders, each producing the same fees:</p>
  <div class="fx" data-lang="py">b = big.head(100_000)
def with_iterrows():
    return [r["amount"] + (30 if r["city"] == "Pune" else 40) for _, r in b.iterrows()]
def with_apply():
    return b.apply(lambda r: r["amount"] + (30 if r["city"] == "Pune" else 40), axis=1)
def with_itertuples():
    return [r.amount + (30 if r.city == "Pune" else 40) for r in b.itertuples()]
def vectorised():
    return b["amount"] + np.where(b["city"] == "Pune", 30, 40)
res = {f.__name__: best_ms(f, reps=1 if f in (with_iterrows, with_apply) else 5)
       for f in (with_iterrows, with_apply, with_itertuples, vectorised)}
for name, t_ms in res.items():
    print(f"{name:16} {t_ms:9.1f} ms   {res['with_iterrows'] / t_ms:7.0f}x faster than iterrows")
print("same answer:", np.allclose(with_itertuples(), vectorised()))
import json; json.dump(res, open("/tmp/claude-0/-home-user-Notes/9194a449-83bf-5a50-8c23-8ca2c91926cd/scratchpad/a4/times.json", "w"))</div>
  <div class="fx" data-lang="text">with_iterrows       1861.5 ms         1x faster than iterrows
with_apply           452.1 ms         4x faster than iterrows
with_itertuples      233.7 ms         8x faster than iterrows
vectorised             1.6 ms      1163x faster than iterrows
same answer: True</div>
  <p>The vectorised version took about 1.6 ms. <code>iterrows</code> took nearly two seconds, over a thousand times slower, for the same answer (<code>np.allclose</code> confirms they match). The reasons explain the ranking. <code>iterrows</code> is a Python loop that builds a complete pandas Series object for every row, with an index and a dtype, just so you can read two fields from it. <code>apply(axis=1)</code> hides the loop inside pandas but still builds a Series per row and makes one Python function call per row, so it is only about four times better. <code>itertuples</code> gives each row as a lightweight tuple, which is cheaper, but it is still Python code running 100,000 times. The vectorised line runs <code>city == "Pune"</code> once over the whole column, <code>np.where</code> once to build the fee array, and <code>+</code> once to add it; each of those is a tight compiled loop over values stored next to each other in memory, which is exactly what CPUs and their caches are built for. Think of a clerk who photocopies each customer's whole file before reading one field from it, against a machine that stamps the fee on every file in the drawer at once.</p>
  <div class="fx" data-lang="py">import json
import matplotlib.pyplot as plt
res = json.load(open("../times.json"))                # the timings measured above
fig, ax = plt.subplots(figsize=(7.5, 2.6))
names = list(res)[::-1]
bars = ax.barh(names, [res[n] for n in names], color=["#2a78d6", "#9aa5b1", "#9aa5b1", "#9aa5b1"])
ax.set_xscale("log")
ax.set_xlabel("milliseconds for 100,000 rows (log scale)")
ax.bar_label(bars, labels=[f"{res[n]:,.1f} ms" for n in names], padding=4)
ax.set_xlim(0.5, 20_000)
fig.savefig("timings.svg", format="svg", transparent=True, bbox_inches="tight")</div>
  <figure class="viz"><svg viewBox="0 0 508.773438 193.743219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:640px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="tmfigure_1">
  <g id="tmpatch_1">
   <path d="M 0 193.743219 
L 508.773438 193.743219 
L 508.773438 0 
L 0 0 
L 0 193.743219 
z
" style="fill: none"/>
  </g>
  <g id="tmaxes_1">
   <g id="tmpatch_2">
    <path d="M 83.073438 151.344 
L 501.573438 151.344 
L 501.573438 7.2 
L 83.073438 7.2 
L 83.073438 151.344 
z
" style="fill: none"/>
   </g>
   <g id="tmpatch_3">
    <path d="M -90827.088476 144.792 
L 129.010532 144.792 
L 129.010532 117.204632 
L -90827.088476 117.204632 
z
" clip-path="url(#tmp68d99a75f4)" style="fill: #2a78d6"/>
   </g>
   <g id="tmpatch_4">
    <path d="M -90827.088476 110.307789 
L 325.848353 110.307789 
L 325.848353 82.720421 
L -90827.088476 82.720421 
z
" clip-path="url(#tmp68d99a75f4)" style="fill: #9aa5b1"/>
   </g>
   <g id="tmpatch_5">
    <path d="M -90827.088476 75.823579 
L 351.90885 75.823579 
L 351.90885 48.236211 
L -90827.088476 48.236211 
z
" clip-path="url(#tmp68d99a75f4)" style="fill: #9aa5b1"/>
   </g>
   <g id="tmpatch_6">
    <path d="M -90827.088476 41.339368 
L 407.801655 41.339368 
L 407.801655 13.752 
L -90827.088476 13.752 
z
" clip-path="url(#tmp68d99a75f4)" style="fill: #9aa5b1"/>
   </g>
   <g id="tmmatplotlib.axis_1">
    <g id="tmxtick_1">
     <g id="tmline2d_1">
      <defs>
       <path id="tmm705a7a0621" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#tmm705a7a0621" x="110.448364" y="151.344" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_1">
      <!-- $\mathdefault{10^{0}}$ -->
      <g transform="translate(102.848364 168.0315)">
       <text>
        <tspan x="0" y="-0.7075" style="font-size: 10px; font-family: inherit">1</tspan>
        <tspan x="4.067383" y="-0.7075" style="font-size: 10px; font-family: inherit">0</tspan>
        <tspan x="10.47168" y="-4.8375" style="font-size: 7px; font-family: inherit">0</tspan>
       </text>
      </g>
     </g>
    </g>
    <g id="tmxtick_2">
     <g id="tmline2d_2">
      <g>
       <use xlink:href="#tmm705a7a0621" x="201.385901" y="151.344" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_2">
      <!-- $\mathdefault{10^{1}}$ -->
      <g transform="translate(194.585901 168.0315)">
       <text>
        <tspan x="0" y="-0.773125" style="font-size: 10px; font-family: inherit">1</tspan>
        <tspan x="4.067383" y="-0.773125" style="font-size: 10px; font-family: inherit">0</tspan>
        <tspan x="10.47168" y="-4.903125" style="font-size: 7px; font-family: inherit">1</tspan>
       </text>
      </g>
     </g>
    </g>
    <g id="tmxtick_3">
     <g id="tmline2d_3">
      <g>
       <use xlink:href="#tmm705a7a0621" x="292.323438" y="151.344" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_3">
      <!-- $\mathdefault{10^{2}}$ -->
      <g transform="translate(284.773438 168.0315)">
       <text>
        <tspan x="0" y="-0.7075" style="font-size: 10px; font-family: inherit">1</tspan>
        <tspan x="4.067383" y="-0.7075" style="font-size: 10px; font-family: inherit">0</tspan>
        <tspan x="10.47168" y="-4.8375" style="font-size: 7px; font-family: inherit">2</tspan>
       </text>
      </g>
     </g>
    </g>
    <g id="tmxtick_4">
     <g id="tmline2d_4">
      <g>
       <use xlink:href="#tmm705a7a0621" x="383.260974" y="151.344" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_4">
      <!-- $\mathdefault{10^{3}}$ -->
      <g transform="translate(375.710974 168.0315)">
       <text>
        <tspan x="0" y="-0.7075" style="font-size: 10px; font-family: inherit">1</tspan>
        <tspan x="4.067383" y="-0.7075" style="font-size: 10px; font-family: inherit">0</tspan>
        <tspan x="10.47168" y="-4.8375" style="font-size: 7px; font-family: inherit">3</tspan>
       </text>
      </g>
     </g>
    </g>
    <g id="tmxtick_5">
     <g id="tmline2d_5">
      <g>
       <use xlink:href="#tmm705a7a0621" x="474.198511" y="151.344" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_5">
      <!-- $\mathdefault{10^{4}}$ -->
      <g transform="translate(466.548511 168.0315)">
       <text>
        <tspan x="0" y="-0.773125" style="font-size: 10px; font-family: inherit">1</tspan>
        <tspan x="4.067383" y="-0.773125" style="font-size: 10px; font-family: inherit">0</tspan>
        <tspan x="10.47168" y="-4.903125" style="font-size: 7px; font-family: inherit">4</tspan>
       </text>
      </g>
     </g>
    </g>
    <g id="tmxtick_6">
     <g id="tmline2d_6">
      <defs>
       <path id="tmm9458c92f64" d="M 0 0 
L 0 2 
" style="stroke: currentColor; stroke-width: 0.6"/>
      </defs>
      <g>
       <use xlink:href="#tmm9458c92f64" x="83.073438" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_7">
     <g id="tmline2d_7">
      <g>
       <use xlink:href="#tmm9458c92f64" x="90.273985" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_8">
     <g id="tmline2d_8">
      <g>
       <use xlink:href="#tmm9458c92f64" x="96.361961" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_9">
     <g id="tmline2d_9">
      <g>
       <use xlink:href="#tmm9458c92f64" x="101.635606" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_10">
     <g id="tmline2d_10">
      <g>
       <use xlink:href="#tmm9458c92f64" x="106.28729" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_11">
     <g id="tmline2d_11">
      <g>
       <use xlink:href="#tmm9458c92f64" x="137.82329" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_12">
     <g id="tmline2d_12">
      <g>
       <use xlink:href="#tmm9458c92f64" x="153.836595" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_13">
     <g id="tmline2d_13">
      <g>
       <use xlink:href="#tmm9458c92f64" x="165.198216" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_14">
     <g id="tmline2d_14">
      <g>
       <use xlink:href="#tmm9458c92f64" x="174.010974" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_15">
     <g id="tmline2d_15">
      <g>
       <use xlink:href="#tmm9458c92f64" x="181.211522" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_16">
     <g id="tmline2d_16">
      <g>
       <use xlink:href="#tmm9458c92f64" x="187.299498" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_17">
     <g id="tmline2d_17">
      <g>
       <use xlink:href="#tmm9458c92f64" x="192.573143" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_18">
     <g id="tmline2d_18">
      <g>
       <use xlink:href="#tmm9458c92f64" x="197.224827" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_19">
     <g id="tmline2d_19">
      <g>
       <use xlink:href="#tmm9458c92f64" x="228.760827" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_20">
     <g id="tmline2d_20">
      <g>
       <use xlink:href="#tmm9458c92f64" x="244.774132" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_21">
     <g id="tmline2d_21">
      <g>
       <use xlink:href="#tmm9458c92f64" x="256.135753" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_22">
     <g id="tmline2d_22">
      <g>
       <use xlink:href="#tmm9458c92f64" x="264.948511" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_23">
     <g id="tmline2d_23">
      <g>
       <use xlink:href="#tmm9458c92f64" x="272.149059" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_24">
     <g id="tmline2d_24">
      <g>
       <use xlink:href="#tmm9458c92f64" x="278.237035" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_25">
     <g id="tmline2d_25">
      <g>
       <use xlink:href="#tmm9458c92f64" x="283.51068" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_26">
     <g id="tmline2d_26">
      <g>
       <use xlink:href="#tmm9458c92f64" x="288.162364" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_27">
     <g id="tmline2d_27">
      <g>
       <use xlink:href="#tmm9458c92f64" x="319.698364" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_28">
     <g id="tmline2d_28">
      <g>
       <use xlink:href="#tmm9458c92f64" x="335.711669" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_29">
     <g id="tmline2d_29">
      <g>
       <use xlink:href="#tmm9458c92f64" x="347.07329" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_30">
     <g id="tmline2d_30">
      <g>
       <use xlink:href="#tmm9458c92f64" x="355.886048" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_31">
     <g id="tmline2d_31">
      <g>
       <use xlink:href="#tmm9458c92f64" x="363.086595" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_32">
     <g id="tmline2d_32">
      <g>
       <use xlink:href="#tmm9458c92f64" x="369.174572" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_33">
     <g id="tmline2d_33">
      <g>
       <use xlink:href="#tmm9458c92f64" x="374.448216" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_34">
     <g id="tmline2d_34">
      <g>
       <use xlink:href="#tmm9458c92f64" x="379.099901" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_35">
     <g id="tmline2d_35">
      <g>
       <use xlink:href="#tmm9458c92f64" x="410.635901" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_36">
     <g id="tmline2d_36">
      <g>
       <use xlink:href="#tmm9458c92f64" x="426.649206" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_37">
     <g id="tmline2d_37">
      <g>
       <use xlink:href="#tmm9458c92f64" x="438.010827" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_38">
     <g id="tmline2d_38">
      <g>
       <use xlink:href="#tmm9458c92f64" x="446.823585" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_39">
     <g id="tmline2d_39">
      <g>
       <use xlink:href="#tmm9458c92f64" x="454.024132" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_40">
     <g id="tmline2d_40">
      <g>
       <use xlink:href="#tmm9458c92f64" x="460.112108" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_41">
     <g id="tmline2d_41">
      <g>
       <use xlink:href="#tmm9458c92f64" x="465.385753" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_42">
     <g id="tmline2d_42">
      <g>
       <use xlink:href="#tmm9458c92f64" x="470.037438" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmxtick_43">
     <g id="tmline2d_43">
      <g>
       <use xlink:href="#tmm9458c92f64" x="501.573438" y="151.344" style="stroke: currentColor; stroke-width: 0.6"/>
      </g>
     </g>
    </g>
    <g id="tmtext_6">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="292.323438" y="184.131109" transform="rotate(-0 292.323438 184.131109)">milliseconds for 100,000 rows (log scale)</text>
    </g>
   </g>
   <g id="tmmatplotlib.axis_2">
    <g id="tmytick_1">
     <g id="tmline2d_44">
      <defs>
       <path id="tmmb4a98927d3" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#tmmb4a98927d3" x="83.073438" y="130.998316" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="76.073438" y="135.842066" transform="rotate(-0 76.073438 135.842066)">vectorised</text>
     </g>
    </g>
    <g id="tmytick_2">
     <g id="tmline2d_45">
      <g>
       <use xlink:href="#tmmb4a98927d3" x="83.073438" y="96.514105" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="76.073438" y="101.357855" transform="rotate(-0 76.073438 101.357855)">with_itertuples</text>
     </g>
    </g>
    <g id="tmytick_3">
     <g id="tmline2d_46">
      <g>
       <use xlink:href="#tmmb4a98927d3" x="83.073438" y="62.029895" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="76.073438" y="66.873645" transform="rotate(-0 76.073438 66.873645)">with_apply</text>
     </g>
    </g>
    <g id="tmytick_4">
     <g id="tmline2d_47">
      <g>
       <use xlink:href="#tmmb4a98927d3" x="83.073438" y="27.545684" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="tmtext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="76.073438" y="32.389434" transform="rotate(-0 76.073438 32.389434)">with_iterrows</text>
     </g>
    </g>
   </g>
   <g id="tmpatch_7">
    <path d="M 83.073438 151.344 
L 83.073438 7.2 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="tmpatch_8">
    <path d="M 83.073438 151.344 
L 501.573438 151.344 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="tmtext_11">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="133.010532" y="134.636011" transform="rotate(-0 133.010532 134.636011)">1.6 ms</text>
   </g>
   <g id="tmtext_12">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="329.848353" y="100.151801" transform="rotate(-0 329.848353 100.151801)">233.7 ms</text>
   </g>
   <g id="tmtext_13">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="355.90885" y="65.66759" transform="rotate(-0 355.90885 65.66759)">452.1 ms</text>
   </g>
   <g id="tmtext_14">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="411.801655" y="31.18338" transform="rotate(-0 411.801655 31.18338)">1,861.5 ms</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="tmp68d99a75f4">
   <rect x="83.073438" y="7.2" width="418.5" height="144.144"/>
  </clipPath>
 </defs>
</svg><figcaption>The same 100,000 fees four ways, on a log scale where each grid line is ten times the previous one. The three row loops sit between a quarter of a second and two seconds; the vectorised version is three orders of magnitude to the left.</figcaption></figure>
  <p>Most per-row <code>if</code>/<code>else</code> logic has a vectorised form. A lookup is <code>map</code> with a dictionary, several conditions are <code>np.select</code>, and numeric ranges are <code>pd.cut</code>:</p>
  <div class="fx" data-lang="py">print(orders["city"].map({"Pune": 30, "Mumbai": 40}).tolist())
size = np.select([orders["amount"] &gt;= 500, orders["amount"] &gt;= 300], ["large", "medium"], default="small")
print(size.tolist())
print(pd.cut(orders["amount"], bins=[0, 300, 500, np.inf], labels=["small", "medium", "large"], right=False).tolist())</div>
  <div class="fx" data-lang="text">[30, 40, 30, 30, 40, 30, 40, 30, 40, 30, 40]
['small', 'medium', 'large', 'medium', 'medium', 'small', 'small', 'small', 'large', 'small', 'large']
['small', 'medium', 'large', 'medium', 'medium', 'small', nan, 'small', 'large', 'small', 'large']</div>
  <p><code>map({"Pune": 30, "Mumbai": 40})</code> looks up each city's fee. <code>np.select</code> takes a list of conditions and a list of choices and uses the first condition that is true, so 500 or more is "large", otherwise 300 or more is "medium", otherwise <code>default</code>. Look at the seventh value, order 107: its amount is NaN, every comparison with NaN is False, so <code>np.select</code> labelled it "small" without complaint. <code>pd.cut</code> with bins [0, 300), [300, 500) and [500, ∞) leaves it as NaN instead, which is honest. Missing values always need a deliberate decision.</p>
  <p>When is a loop or <code>apply</code> acceptable? When the logic really cannot be expressed with column operations (calling an external API per row, parsing a complicated string with a custom function) and the number of rows is small. The order of preference is: built-in vectorised operations, including <code>.str</code>, <code>.dt</code> and groupby aggregations; then <code>itertuples</code> if a loop is unavoidable; <code>apply</code> for a complicated function on few rows; <code>iterrows</code> almost never. Vectorised steps also chain together into readable pipelines, where each method returns a new DataFrame and the next method is called on it. <code>assign</code> adds columns, <code>query</code> filters, and <code>pipe</code> slots in your own function:</p>
  <div class="fx" data-lang="py">def add_fee(df, pune=30, mumbai=40):
    return df.assign(fee=np.where(df["city"] == "Pune", pune, mumbai))
report = (
    orders
    .dropna(subset=["amount"])
    .assign(dinner=lambda d: d["order_time"].dt.hour &gt;= 18)
    .query("dinner")
    .pipe(add_fee)
    .groupby("city")
    .agg(dinners=("order_id", "size"), revenue=("amount", "sum"), fees=("fee", "sum"))
)
print(report)</div>
  <div class="fx" data-lang="text">        dinners  revenue  fees
city                          
Mumbai        3   1610.0   120
Pune          2    780.0    60</div>
  <p>Read top to bottom: drop unknown amounts, mark dinners, keep them, add the fee with our own <code>add_fee</code> function, group by city and aggregate. Mumbai's dinners with known amounts are orders 105, 109 and 111: 310 + 600 + 700 = 1610 revenue and 3 × ₹40 = 120 in fees; Pune's are 103 and 108, 780 and 60. Wrapping the chain in parentheses lets it span lines, and no temporary variables like <code>df2</code> or <code>tmp</code> are left lying around. Copy-on-write, the default in pandas 3, keeps the intermediate results cheap.</p>

  <h2 id="pdt-files"><span class="num">11</span>Big Files: Parquet vs CSV and Chunked Reading</h2>
  <p>Before any analysis runs, the data has to come off the disk, and for large tables that step can take longer than the analysis. Disks are much slower than RAM, so the fastest read is the one that reads fewer bytes (how hard drives, SSDs and file systems work is covered in <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>). CSV is the most common format and also the least efficient: every number is stored as text characters, every row repeats the full width of every column, and nothing in the file says what type a column is, so pandas must read and convert every character and then guess types.</p>
  <p><strong>Parquet</strong> is a file format designed for tables. It is <strong>columnar</strong>, meaning all values of one column are stored together rather than row by row; it stores numbers in binary form; it compresses each column (a city column of "Pune" and "Mumbai" compresses extremely well); and it records the schema, each column's name and type, inside the file. Think of a CSV as a handwritten ledger that has to be read line by line, and Parquet as a filing cabinet with one labelled drawer per column: if you only need two columns, you only open two drawers. Here is the million-order table saved both ways:</p>
  <div class="fx" data-lang="py">import os
big.to_csv("orders.csv", index=False)
big.to_parquet("orders.parquet")
print("CSV    :", round(os.path.getsize("orders.csv") / 1e6, 1), "MB on disk")
print("Parquet:", round(os.path.getsize("orders.parquet") / 1e6, 1), "MB on disk")
print("read CSV        :", best_ms(lambda: pd.read_csv("orders.csv", parse_dates=["order_time"]), reps=3), "ms")
print("read Parquet    :", best_ms(lambda: pd.read_parquet("orders.parquet"), reps=3), "ms")
print("Parquet, 2 cols :", best_ms(lambda: pd.read_parquet("orders.parquet", columns=["city", "amount"]), reps=3), "ms")
print(pd.read_csv("orders.csv").dtypes["order_time"], "vs", pd.read_parquet("orders.parquet").dtypes["order_time"])</div>
  <div class="fx" data-lang="text">CSV    : 60.4 MB on disk
Parquet: 12.0 MB on disk
read CSV        : 212.2 ms
read Parquet    : 57.1 ms
Parquet, 2 cols : 21.3 ms
str vs datetime64[us]</div>
  <p>The CSV is 60.4 MB on disk, the Parquet file 12.0 MB, five times smaller. Reading the CSV, including parsing the dates, took about 210 ms, reading the Parquet file about 57 ms, and reading just two columns from Parquet about 21 ms, because the other five columns are never touched. The last line shows the quiet advantage: read back without <code>parse_dates</code>, the CSV's <code>order_time</code> is text again, while Parquet returns <code>datetime64[us]</code> exactly as it was saved, and the same is true of category and downcast types. For files you write and read yourself, Parquet is the better default; CSV remains the format for exchanging data with other people and tools. (Parquet support comes from the <code>pyarrow</code> package.)</p>
  <p>Sometimes you receive a CSV too big to load at once. <code>read_csv(..., chunksize=n)</code> does not return a DataFrame; it returns an iterator that hands you the file n rows at a time. You process each chunk, keep only a small summary, and combine the summaries at the end, so only one chunk is ever in memory. It is like counting a huge pile of receipts one box at a time and writing each box's subtotal on a notepad:</p>
  <div class="fx" data-lang="py">totals = None
for i, chunk in enumerate(pd.read_csv("orders.csv", usecols=["city", "amount"], chunksize=250_000)):
    part = chunk.groupby("city")["amount"].agg(["sum", "size"])
    totals = part if totals is None else totals.add(part, fill_value=0)
    print(f"chunk {i}: {len(chunk):,} rows, {chunk.memory_usage(deep=True).sum() / 1e6:.1f} MB in memory")
totals["mean"] = (totals["sum"] / totals["size"]).round(2)
print(totals)</div>
  <div class="fx" data-lang="text">chunk 0: 250,000 rows, 5.2 MB in memory
chunk 1: 250,000 rows, 5.2 MB in memory
chunk 2: 250,000 rows, 5.2 MB in memory
chunk 3: 250,000 rows, 5.2 MB in memory
                sum    size    mean
city                               
Mumbai  179917675.0  450408  399.45
Pune    219909322.0  549592  400.13</div>
  <p>The file is read in four chunks of 250,000 rows, each using only 5.2 MB because we also asked for just two columns with <code>usecols</code>. For each chunk we compute the sum and count per city, and add them to the running totals with <code>add(..., fill_value=0)</code>, which handles a city that might be missing from one chunk. The final sums match the full-table results we will see in the next section. Notice that we kept sums and counts, not means: the mean of chunk means is wrong when chunks differ in size, so the mean is computed at the end from the combined sum and count. Sums, counts, minimums and maximums combine safely this way; medians and distinct counts do not.</p>
  <p>Chunking is often unnecessary if you read only what you need, with the right types, from the start:</p>
  <div class="fx" data-lang="py">lean = pd.read_csv("orders.csv", usecols=["city", "restaurant", "order_time", "amount"],
                   dtype={"city": "category", "restaurant": "category", "amount": "float32"},
                   parse_dates=["order_time"])
print(lean.dtypes)
print(round(lean.memory_usage(deep=True).sum() / 1e6, 1), "MB")</div>
  <div class="fx" data-lang="text">restaurant          category
city                category
order_time    datetime64[us]
amount               float32
dtype: object
14.0 MB</div>
  <p>Reading four of the seven columns, with the two text columns loaded straight as categories and amount as float32, gives a 14.0 MB table instead of 75.5 MB, and the wide version never exists in memory at all. (Here float32 for amounts is fine for a quick look at averages; for accounting totals keep float64, as section 09 showed.)</p>

  <h2 id="pdt-beyond"><span class="num">12</span>When to Switch to Polars or DuckDB</h2>
  <p>Vectorised pandas on sensible dtypes handles tables of a few gigabytes comfortably. Beyond that, pandas' design starts to show its limits. Most of its operations use a single CPU core. It is <strong>eager</strong>: each line runs completely as soon as it is called, producing a full intermediate table, before pandas sees what you want next. And it needs the whole table in memory. Two newer tools are designed differently. <strong>DuckDB</strong> is a SQL database engine that runs inside your Python process, with no server to set up, and can query Parquet files, CSV files and pandas DataFrames directly. <strong>Polars</strong> is a DataFrame library, written in Rust, with its own expression-based API. Both are <strong>lazy</strong> when reading files: they first collect the whole query, optimise it as one plan, and only then run it, using all CPU cores. Here is the same question, revenue per city, on the million-order Parquet file, with each tool limited to one thread for a fair first comparison:</p>
  <div class="fx" data-lang="py">import os
os.environ["POLARS_MAX_THREADS"] = "1"          # one thread each, for a fair first comparison
import duckdb, polars as pl
duckdb.sql("SET threads = 1")

def with_pandas():
    return pd.read_parquet("orders.parquet", columns=["city", "amount"]).groupby("city")["amount"].sum()
def with_duckdb():
    return duckdb.sql("SELECT city, SUM(amount) AS revenue FROM 'orders.parquet' GROUP BY city ORDER BY city").df()
def with_polars():
    return (pl.scan_parquet("orders.parquet")
              .group_by("city").agg(pl.col("amount").sum().alias("revenue"))
              .sort("city").collect())
print(with_pandas())
print(with_duckdb())
print(with_polars())
for f in (with_pandas, with_duckdb, with_polars):
    print(f"{f.__name__:12} {best_ms(f):7.1f} ms")</div>
  <div class="fx" data-lang="text">city
Mumbai    179917675.0
Pune      219909322.0
Name: amount, dtype: float64
     city      revenue
0  Mumbai  179917675.0
1    Pune  219909322.0
shape: (2, 2)
┌────────┬──────────────┐
│ city   ┆ revenue      │
│ ---    ┆ ---          │
│ str    ┆ f64          │
╞════════╪══════════════╡
│ Mumbai ┆ 1.79917675e8 │
│ Pune   ┆ 2.19909322e8 │
└────────┴──────────────┘
with_pandas     55.3 ms
with_duckdb     10.3 ms
with_polars     16.0 ms</div>
  <p>All three agree on the answer: Mumbai 179,917,675 and Pune 219,909,322 (Polars prints them in scientific notation). With one thread each, pandas took about 55 ms, DuckDB about 10 ms and Polars about 16 ms. pandas reads the two columns into a DataFrame and then groups it as a separate step; DuckDB and Polars read and aggregate in one optimised pass, never building the intermediate table. These are timings from one machine on one query, so treat them as approximate.</p>
  <p>Laziness is easiest to understand by asking Polars to show its plan instead of running it:</p>
  <div class="fx" data-lang="py">import polars as pl
plan = (pl.scan_parquet("orders.parquet")
          .filter(pl.col("city") == "Pune")
          .group_by("restaurant").agg(pl.col("amount").mean()))
print(plan.explain())</div>
  <div class="fx" data-lang="text">AGGREGATE[maintain_order: false]
  [col("amount").mean()] BY [col("restaurant")]
  FROM
  simple π 2/2 ["restaurant", "amount"]
    Parquet SCAN [orders.parquet]
    PROJECT 3/7 COLUMNS
    SELECTION: col("city") == "Pune"
    ESTIMATED ROWS: 1000000</div>
  <p>The query asked for the average amount per restaurant in Pune. The plan, read from the bottom up, shows two optimisations that pandas cannot do because it runs each step separately. <code>PROJECT 3/7 COLUMNS</code> is <strong>projection pushdown</strong>: only city, restaurant and amount are read from the file. <code>SELECTION: col("city") == "Pune"</code> is <strong>predicate pushdown</strong>: the filter is applied while scanning, so non-Pune rows are dropped as early as possible (Parquet even stores per-block minimum and maximum values that let a reader skip blocks entirely). Only then does the aggregation run. On data larger than memory, Polars and DuckDB can also stream, processing the file in pieces automatically, which is what we did by hand with <code>chunksize</code>.</p>
  <p>DuckDB is especially convenient for anyone who already thinks in SQL, because it can query a pandas DataFrame just by naming the variable:</p>
  <div class="fx" data-lang="py">import duckdb
print(duckdb.sql("""
    SELECT city, date_trunc('week', order_time) AS week, SUM(amount) AS revenue
    FROM orders WHERE amount IS NOT NULL
    GROUP BY ALL ORDER BY city, week
""").df())</div>
  <div class="fx" data-lang="text">     city       week  revenue
0  Mumbai 2026-03-02   2060.0
1    Pune 2026-03-02   1870.0</div>
  <p>The SQL refers to <code>orders</code>, our 11-row DataFrame, as if it were a table, and <code>.df()</code> returns the result as a pandas DataFrame. Mumbai's week of 2 March is 450 + 310 + 600 + 700 = 2060, and Pune's is 1870. Moving between pandas and DuckDB costs one line in each direction, so you can use SQL for one heavy step and pandas for everything else.</p>
  <p>Finally, with their default settings (all 4 cores on this machine), a grouping by city and restaurant:</p>
  <div class="fx" data-lang="py">import duckdb, polars as pl
big = pd.read_parquet("orders.parquet")
def pandas_mem():
    return big.groupby(["city", "restaurant"])["amount"].mean()
def duckdb_file():
    return duckdb.sql("SELECT city, restaurant, AVG(amount) FROM 'orders.parquet' GROUP BY ALL").df()
def polars_file():
    return pl.scan_parquet("orders.parquet").group_by("city", "restaurant").agg(pl.col("amount").mean()).collect()
for f in (pandas_mem, duckdb_file, polars_file):
    print(f"{f.__name__:12} {best_ms(f):7.1f} ms   (all 4 cores allowed)")</div>
  <div class="fx" data-lang="text">pandas_mem      61.2 ms   (all 4 cores allowed)
duckdb_file     15.7 ms   (all 4 cores allowed)
polars_file     14.4 ms   (all 4 cores allowed)</div>
  <p>Even with the table already in memory, pandas took about 61 ms, while DuckDB and Polars, reading from the file, took about 16 and 14 ms. That is a real gain, but compare it with the previous section's loop timings: replacing <code>iterrows</code> with a vectorised line gained over a thousand times, while switching engines gained about four. The order of work is therefore: vectorise and use sensible dtypes first; read only needed columns, from Parquet; and switch when a well-written pandas pipeline is still too slow or the data does not fit in memory. DuckDB suits heavy aggregations and joins on big files, especially if you like SQL; Polars suits long DataFrame pipelines that need to be fast on one machine. pandas keeps the richest ecosystem (plotting, scikit-learn, statsmodels) and is usually where results end up. When data outgrows a single machine entirely, the next step is a cluster engine such as <a class="xref" data-note="de_spark">Apache Spark</a>.</p>

  <h2 id="pdt-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging time-series mistake produces numbers that look perfectly reasonable: computing a lag without grouping. Here the table is sorted by customer and then time, and we want the days between each customer's orders:</p>
  <div class="fx" data-lang="py">o = orders.sort_values(["customer", "order_time"])
o["wrong"] = o["order_time"].diff().dt.days                         # crosses customers
o["right"] = o.groupby("customer")["order_time"].diff().dt.days     # restarts per customer
print(o[["customer", "order_time", "wrong", "right"]].head(5))</div>
  <div class="fx" data-lang="text">  customer          order_time  wrong  right
0     Asha 2026-03-02 12:10:00    NaN    NaN
3     Asha 2026-03-03 13:15:00    1.0    1.0
9     Asha 2026-03-06 13:00:00    2.0    2.0
1      Ben 2026-03-02 13:05:00   -4.0    NaN
5      Ben 2026-03-04 12:40:00    1.0    1.0</div>
  <p>For Asha both columns agree. On Ben's first order, the "wrong" column shows −4: it subtracted Asha's last order (Friday 13:00) from Ben's first (Monday 13:05), mixing two customers. With <code>groupby("customer")</code> the difference restarts for each customer and Ben's first order correctly has nothing before it. Any lag, difference, running total or rolling window that should stay inside a customer, city or product must go through <code>groupby</code>, and the rows must be sorted by time first; the shuffled example in section 06 showed that sorting mistakes also give no warning.</p>
  <p>The second mistake is letting pandas guess date formats:</p>
  <div class="fx" data-lang="py">import pandas as pd
dates = pd.Series(["01/03/2026", "02/03/2026", "13/03/2026"])      # day/month, Indian style
try:
    print(pd.to_datetime(dates))
except ValueError as e:
    print("ValueError:", str(e).split(". You")[0] + ".")
print(pd.to_datetime(dates.head(2)).dt.strftime("%d %b").tolist(), "&lt;- silently month-first")
print(pd.to_datetime(dates, format="%d/%m/%Y").dt.strftime("%d %b").tolist())</div>
  <div class="fx" data-lang="text">ValueError: time data "13/03/2026" doesn't match format "%m/%d/%Y".
['03 Jan', '03 Feb'] &lt;- silently month-first
['01 Mar', '02 Mar', '13 Mar']</div>
  <p>The dates are Indian day/month style. pandas guessed the format from the first value, month-first, then hit "13/03/2026", where 13 cannot be a month, and stopped. That error is the lucky case. With only the first two values, nothing fails: 1 March and 2 March silently become 3 January and 3 February. Always pass <code>format=</code> for dates written with slashes, and check the minimum and maximum of a parsed date column against what you expect.</p>
  <p>Several other mistakes have appeared in earlier sections. Comparing partial first or last periods with full ones produced a fake +73.9% and −71.2% in section 04. Sums of empty resample buckets are 0, which can hide missing data; show counts or use <code>min_count=1</code>. A row-count rolling window over irregular data, or over a series with missing days, mixes different time spans, as section 08 showed. Mixing naive and aware times raises an error, and mixing zones silently moves orders to another day. On the performance side, using <code>apply</code> or <code>iterrows</code> for arithmetic costs a factor of hundreds or thousands; converting high-cardinality columns such as ids to <code>category</code> uses more memory, not less; storing money in <code>float32</code> loses paise; and switching to another engine before vectorising fixes the wrong problem.</p>

  <h2 id="pdt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Biteful, 11 orders, Mon 2 – Fri 6 March 2026, order 107's amount missing. Daily revenue: Mon 1210, Tue 690, Wed 180, Thu 860, Fri 990; total 3930. Asha: 240, 380, 290 (Mon, Tue, Fri). At scale: <code>make_orders(1_000_000)</code>, 1 Jan – 31 Mar 2026.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Parsing</b>: converting text into a typed value, e.g. <code>pd.to_datetime(s, format="%d/%m/%Y")</code>. <b>NaT</b>: missing time.</li>
    <li><b>datetime64</b>: pandas' date-time type, an integer count of time units since 1970. <b>Timestamp</b>: one moment. <b>Timedelta</b>: a duration.</li>
    <li><b>DatetimeIndex</b>: an index of timestamps; enables <code>loc["2026-03-03"]</code>, resample, time-based rolling.</li>
    <li><b>Naive / aware</b>: without / with a time zone. <code>tz_localize</code> attaches a zone; <code>tz_convert</code> changes the clock reading of the same instant.</li>
    <li><b>resample</b>: groupby by consecutive time buckets, including empty ones.</li>
    <li><b>rolling</b>: fixed window (k rows or a time span) sliding along rows. <b>expanding</b>: from the first row to the current one. <b>ewm</b>: weights shrinking with age, α = 2 / (span + 1).</li>
    <li><b>Lag</b>: the previous value, <code>shift(1)</code>. <b>Lead</b>: the next value, <code>shift(-1)</code>.</li>
    <li><b>Partial period</b>: a bucket covering less time than the others.</li>
    <li><b>DateOffset</b>: a calendar rule (month, business day, month end), unlike a fixed Timedelta.</li>
    <li><b>Cardinality</b>: number of distinct values. <b>Downcasting</b>: moving to a smaller type that still fits all values.</li>
    <li><b>Vectorised</b>: one operation over a whole column in compiled code.</li>
    <li><b>Columnar format</b> (Parquet): each column stored together, typed and compressed. <b>Lazy</b> execution: plan the whole query, then run it (projection and predicate pushdown).</li>
  </ul>
  <h3>Windows compared</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Rows out</th><th>Window</th><th>On daily revenue</th></tr>
    <tr><td><code>resample("W").sum()</code></td><td>one per bucket</td><td>non-overlapping buckets</td><td>one weekly total</td></tr>
    <tr><td><code>rolling(3).mean()</code></td><td>one per row</td><td>last 3 rows</td><td>NaN, NaN, 693.3, 576.7, 676.7</td></tr>
    <tr><td><code>rolling("24h").sum()</code></td><td>one per row</td><td>last 24 hours</td><td>for irregular events</td></tr>
    <tr><td><code>expanding().sum()</code></td><td>one per row</td><td>everything so far</td><td>1210, 1900, 2080, 2940, 3930</td></tr>
    <tr><td><code>ewm(alpha=0.5, adjust=False).mean()</code></td><td>one per row</td><td>all past, fading weights</td><td>1210, 950, 565, 712.5, 851.2</td></tr>
    <tr><td><code>diff()</code> / <code>pct_change()</code></td><td>one per row</td><td>this row vs previous</td><td>Tue −520 (−43.0%), Thu +680 (+377.8%)</td></tr>
  </table>
  <h3>Performance, measured (approximate)</h3>
  <table class="tbl">
    <tr><th>Change</th><th>Before</th><th>After</th></tr>
    <tr><td>category + downcast, 1M rows</td><td>75.5 MB</td><td>28.0 MB</td></tr>
    <tr><td>city as category</td><td>12.9 MB (str), 53.9 MB (object)</td><td>1.0 MB</td></tr>
    <tr><td>groupby on category vs str</td><td>~60 ms</td><td>~28 ms</td></tr>
    <tr><td>fee on 100k rows</td><td>iterrows ~1.9 s, apply ~0.45 s, itertuples ~0.23 s</td><td>vectorised ~1.6 ms</td></tr>
    <tr><td>CSV → Parquet, 1M rows</td><td>60.4 MB, ~210 ms read</td><td>12.0 MB, ~57 ms (~21 ms for 2 columns)</td></tr>
    <tr><td>pandas → DuckDB / Polars on Parquet</td><td>~55 ms</td><td>~10 / ~16 ms (one thread)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">df["t"] = pd.to_datetime(df["t"], format="%Y-%m-%d %H:%M", errors="coerce")
df["t"].dt.hour; df["t"].dt.day_name(); df["t"].max() - df["t"].min()
ts = df.set_index("t").sort_index(); ts.loc["2026-03-03"]; ts.loc["2026-03-05":"2026-03-06"]
ts.index.tz_localize("Asia/Kolkata").tz_convert("UTC")
ts["amount"].resample("D").sum(min_count=1)
ts.resample("W").agg(orders=("order_id", "size"), revenue=("amount", "sum"))
s.rolling(7, min_periods=1).mean(); s.rolling("24h").sum(); s.expanding().sum(); s.ewm(span=7).mean()
s.shift(1); s.diff(); s.pct_change(); s.shift(1, freq="D")
df.sort_values("t").groupby("customer")["t"].diff()
df.groupby("city")["amount"].rank(method="dense", ascending=False)
pd.date_range("2026-03-01", "2026-03-31", freq="B"); ts0 + pd.DateOffset(months=1); ts0 + pd.offsets.BDay(2)
df.memory_usage(deep=True); df.astype({"city": "category"}); pd.to_numeric(s, downcast="unsigned")
np.where(cond, a, b); np.select([c1, c2], [x1, x2], default=x3); s.map(d); pd.cut(s, bins)
df.to_parquet("f.parquet"); pd.read_parquet("f.parquet", columns=["city", "amount"])
for chunk in pd.read_csv("f.csv", usecols=[...], dtype={...}, chunksize=250_000): ...
duckdb.sql("SELECT city, SUM(amount) FROM 'f.parquet' GROUP BY city").df()
pl.scan_parquet("f.parquet").group_by("city").agg(pl.col("amount").sum()).collect()</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Slashed dates without <code>format=</code> are read month-first.</li>
    <li>shift, diff, rolling, cumsum follow row order: sort by time first; use <code>groupby</code> for per-entity lags.</li>
    <li>Partial first/last buckets fake growth or decline.</li>
    <li>Empty resample buckets sum to 0; use counts or <code>min_count=1</code>.</li>
    <li>Row-count windows on irregular or gappy data: use <code>"24h"</code>-style windows or reindex to a full range.</li>
    <li><code>center=True</code> and <code>shift(-1)</code> use the future; never as model features.</li>
    <li>Naive vs aware comparison raises TypeError; store UTC.</li>
    <li>category on ids grows memory; float32 on money loses precision.</li>
    <li>Mean of chunk means is wrong; combine sums and counts.</li>
    <li>Vectorise before switching engines.</li>
  </ul>

  <h2 id="pdt-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you convert a text column to dates, and what can go wrong?</summary><div class="qa-body">Use <code>pd.to_datetime(s, format=...)</code>, or <code>parse_dates</code> in <code>read_csv</code>. Without a format, pandas may read "02/03/2026" as 3 February instead of 2 March, so give the format explicitly. Use <code>errors="coerce"</code> to turn unparseable values into NaT, then count them with <code>isna()</code> rather than letting one bad row stop the load.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a Timestamp, a Timedelta and a DateOffset?</summary><div class="qa-body">A Timestamp is one moment; a Timedelta is a fixed duration, such as 30 days of 24 hours; a DateOffset is a calendar rule, such as "one month later" or "next business day". 31 January + Timedelta(days=30) is 2 March in 2026, while 31 January + DateOffset(months=1) is 28 February.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why set a DatetimeIndex?</summary><div class="qa-body">It lets you select by partial date strings (<code>loc["2026-03"]</code>), slice date ranges, resample, use time-based rolling windows like <code>rolling("7D")</code>, and shift by frequency. Sort it with <code>sort_index()</code>, because slicing and windows assume time order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between resample, rolling and expanding?</summary><div class="qa-body">resample groups rows into non-overlapping time buckets and returns one row per bucket; it is a groupby by time. rolling computes over a window of the last k rows or a time span that slides along the series, returning one value per row. expanding uses everything from the first row up to the current one, giving running totals or averages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is resample related to groupby?</summary><div class="qa-body">It is split-apply-combine where the key is the time bucket: <code>df.resample("D", on="t")</code> behaves like <code>df.groupby(pd.Grouper(key="t", freq="D"))</code>. The difference is that resample creates every bucket in the range, including empty ones, which matters for charts and for spotting gaps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ewm do, and why use it instead of rolling?</summary><div class="qa-body">An exponentially weighted mean gives each past value a weight that shrinks with age, so the newest values count most and old values fade rather than dropping out suddenly. It has a value from the first row and reacts faster to changes than a rolling mean of similar smoothness. The weight is set by <code>alpha</code>, or by <code>span</code>, where α = 2 / (span + 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute month-over-month growth?</summary><div class="qa-body"><code>m = df.set_index("t")["amount"].resample("ME").sum()</code>, then <code>m.pct_change() * 100</code>. Check that the first and last months are complete, because a partial month will show fake growth or decline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the number of days between each customer's consecutive orders?</summary><div class="qa-body"><code>df.sort_values("t").groupby("customer")["t"].diff().dt.days</code>. Sorting by time is essential, because diff uses row order, and the groupby stops one customer's dates being subtracted from another's. Each customer's first order gives NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get the top 2 orders per city, and how do RANK, DENSE_RANK and ROW_NUMBER map to pandas?</summary><div class="qa-body">Rank within each city, <code>df.groupby("city")["amount"].rank(method="dense", ascending=False)</code>, and filter rank ≤ 2; or <code>df.sort_values("amount", ascending=False).groupby("city").head(2)</code>. <code>method="min"</code> is RANK (ties share and skip), <code>"dense"</code> is DENSE_RANK (ties share, no gap), <code>"first"</code> is ROW_NUMBER.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between tz_localize and tz_convert?</summary><div class="qa-body">tz_localize attaches a time zone to naive timestamps without changing the clock reading; tz_convert changes an aware timestamp to another zone, keeping the same instant. 12:10 localized to Asia/Kolkata and converted to UTC is 06:40. A common practice is to store UTC and convert only for display.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is data leakage in time-series features, and how do windows cause it?</summary><div class="qa-body">Leakage means a feature uses information that would not have been available at prediction time. <code>shift(-1)</code>, <code>rolling(center=True)</code> and statistics computed over the whole period all look into the future. Features must use only past values: lags with positive shifts and trailing windows, ideally computed per entity with groupby.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you reduce a DataFrame's memory usage?</summary><div class="qa-body">Measure with <code>memory_usage(deep=True)</code>. Convert low-cardinality text columns to <code>category</code>, downcast integers with <code>pd.to_numeric(downcast="unsigned"/"integer")</code>, use float32 only where precision does not matter, and load only needed columns with explicit dtypes or from Parquet. On a million orders this took 75.5 MB down to 28.0 MB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the category dtype help, and when does it hurt?</summary><div class="qa-body">It helps when a column has few distinct values compared with its length, because each value is stored once and rows hold small integer codes; it also speeds up groupby. It hurts for high-cardinality columns such as ids or free text, where the category list is as large as the data plus the codes: order ids took 12.0 MB as category against 8.0 MB as int64.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is apply with axis=1 slow, and what do you use instead?</summary><div class="qa-body">It calls a Python function once per row and builds a Series for each row, so the work runs in the Python interpreter instead of compiled code. Use vectorised column operations: arithmetic, comparisons, <code>np.where</code>, <code>np.select</code>, <code>map</code>, <code>pd.cut</code>, <code>.str</code> and <code>.dt</code>. On 100,000 rows the vectorised version was over a thousand times faster than iterrows and a few hundred times faster than apply.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rank iterrows, itertuples, apply and vectorised code by speed, and explain why.</summary><div class="qa-body">Vectorised is fastest by far (one compiled loop per operation); then itertuples (a Python loop over light tuples); then apply(axis=1) (a Python call plus a Series per row); iterrows is slowest because it builds a full Series per row and can also change dtypes. Measured: about 1.6 ms, 0.23 s, 0.45 s and 1.9 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Parquet usually better than CSV for analysis?</summary><div class="qa-body">Parquet is columnar, binary and compressed, so files are smaller (12 MB against 60 MB here) and you can read only the columns you need. It stores each column's type, so dates and categories come back correctly without re-parsing. CSV is still the right choice for exchanging data with people and tools that cannot read Parquet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you process a CSV that does not fit in memory with pandas?</summary><div class="qa-body">Read it with <code>chunksize</code>, only the needed columns (<code>usecols</code>) and compact dtypes, compute a partial result per chunk and combine them. Combine sums, counts, minimums and maximums, not means; compute the mean at the end from total sum and count. Or let DuckDB or Polars stream the file for you.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you move from pandas to Polars or DuckDB?</summary><div class="qa-body">After vectorising and fixing dtypes, if a pipeline is still too slow or the data no longer fits comfortably in memory. Both are lazy and multi-threaded and push column selection and filters down into the file scan. DuckDB suits SQL-style aggregations and joins on big files; Polars suits fast DataFrame pipelines. For data beyond one machine, use Spark.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do projection pushdown and predicate pushdown mean?</summary><div class="qa-body">They are optimisations a lazy engine makes by looking at the whole query before running it. Projection pushdown reads only the columns the query uses; predicate pushdown applies filters during the file scan, so unwanted rows are never loaded, and Parquet's per-block statistics can let whole blocks be skipped. pandas runs each step eagerly, so it cannot do this across steps.</div></details>
</main>
`
});
