// notes/dataanalysis/da_pandas.js — How Pandas Works
Object.assign(TOPIC_CONTENT, {
  "da_pandas": `<main>
<h1>How Pandas Works</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>How Pandas Works</span></div>
  <p class="lead">Pandas is the Python library for working with tables: rows of records, columns of facts, the kind of data you would otherwise keep in a spreadsheet or a database. Almost every data-analysis job in Python starts by loading a file into pandas, and the habits you form with it decide whether your code is fast or slow, and whether your numbers are right or quietly wrong. This page explains how pandas is built and why it behaves the way it does: what a Series and a DataFrame really are, why every row carries a label, how column types work, why loops are slow, and what changed in pandas 3. The running example is one week of orders at Biteful, a small food-delivery company in Pune and Mumbai: a raw export of 12 orders with all the mess real exports have, plus a generated version with hundreds of thousands of rows when we need to measure speed. Every output on this page comes from a real run on pandas 3.1 with Python 3.13; the deeper notes in this group take each topic further.</p>

  <h2 id="pdm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How Pandas Works</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The objects</div>
        <ul>
          <li><b>Series</b>: one column = a typed array + an index of labels</li>
          <li><b>DataFrame</b>: several Series sharing one index</li>
          <li>Underneath: NumPy or Arrow arrays, so column maths runs in C</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Index and dtypes</div>
        <ul>
          <li>Operations match rows by <b>label</b>, not position; unmatched → NaN</li>
          <li>One <b>dtype</b> per column; one blank turns ints into float64</li>
          <li>pandas 3: text is <code>str</code> (was <code>object</code>); nullable <code>Int64</code>; <code>category</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Writing good pandas</div>
        <ul>
          <li>Vectorise: whole-column maths, not loops or <code>apply</code></li>
          <li><b>Copy-on-Write</b>: every subset behaves as a copy; use <code>.loc</code> in one step</li>
          <li>Method chains read top to bottom with no temporary variables</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Files and beyond</div>
        <ul>
          <li>CSV loses types; Parquet keeps them and reads only needed columns</li>
          <li>Pandas needs the data in RAM; Polars and DuckDB for bigger or faster</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdm-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Pandas Exists</span><span class="rm-sub">what lists, Excel and NumPy cannot do</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-objects"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Series and DataFrame</span><span class="rm-sub">labelled columns built on arrays</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-index"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Index and Alignment</span><span class="rm-sub">why adding two columns can give NaN</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-dtypes"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">dtypes</span><span class="rm-sub">one type per column, and the new ones in pandas 3</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-vector"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Vectorised Operations vs apply vs Loops</span><span class="rm-sub">the same answer at very different speeds</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-cow"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Copy-on-Write</span><span class="rm-sub">why your edit did nothing, and the end of a famous warning</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-chain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Method Chaining</span><span class="rm-sub">a pipeline you read top to bottom</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-io"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Reading and Writing Files</span><span class="rm-sub">CSV, Parquet and Excel at a glance</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-beyond"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">When to Reach for Polars or DuckDB</span><span class="rm-sub">what to use when pandas is too slow or too small</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">text numbers, inplace, accidental alignment</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, dtypes table, syntax</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the pandas questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="pdm-why"><span class="num">01</span>Why Pandas Exists</h2>
  <p>Biteful's app records every order: who ordered, from which restaurant, in which city, when, for how much, and how long the delivery took. The owner wants answers to ordinary business questions: how much did Pune earn, what is the average order in Mumbai, which restaurant is busiest, is revenue going up. Before reaching for any library, let us see how far plain Python gets. The natural way to hold records in Python is a list of dictionaries, one dictionary per order:</p>
  <div class="fx" data-lang="py"># Three orders as plain Python: a list of dicts
rows = [
    {"order_id": 101, "customer": "Asha", "city": "Pune",   "amount": 240},
    {"order_id": 102, "customer": "Ben",  "city": "Mumbai", "amount": 450},
    {"order_id": 103, "customer": "Chen", "city": "Pune",   "amount": 520},
]

# Question 1: Pune revenue -&gt; a loop
pune = 0
for r in rows:
    if r["city"] == "Pune":
        pune += r["amount"]

# Question 2: average order in Mumbai -&gt; another loop
total, n = 0, 0
for r in rows:
    if r["city"] == "Mumbai":
        total += r["amount"]
        n += 1
print("Pune revenue:", pune, "| Mumbai average:", total / n)</div>
  <div class="fx" data-lang="text">Pune revenue: 760 | Mumbai average: 450.0</div>
  <p>Both answers are correct: Pune earned 240 + 520 = 760 and the one Mumbai order was 450. But notice what each question cost. "Pune revenue" became a loop with an <code>if</code> inside it, and "Mumbai average" became a second, slightly different loop with two running variables. Every new question ("orders above ₹400", "revenue per restaurant", "busiest hour") is another hand-written loop, each one a fresh chance for a bug. And the loops are slow: Python runs the body once per row, interpreting each line every time, so on a million orders each question means a million trips through the interpreter.</p>
  <p>A spreadsheet such as Excel solves the "one question, one loop" problem with built-in sums, filters and pivot tables, and for a person looking at a few thousand rows it is excellent. It falls short for analysis as a job: it slows down badly past a few hundred thousand rows and stops at about a million, the steps you clicked are not recorded anywhere you can rerun next week, and there is no clean way to put it inside a larger program. NumPy, the Python library for fast arrays (see <a class="xref" data-note="da_numpy">NumPy</a>), solves the speed problem, because it stores numbers in one compact block of memory and runs loops in compiled C code. But a NumPy array must hold one type of value, and a business table never does:</p>
  <div class="fx" data-lang="py">import numpy as np
table = np.array([[101, "Asha", "Pune", 240],
                  [102, "Ben", "Mumbai", 450],
                  [103, "Chen", "Pune", 520]])
print(table.dtype)              # ONE type for the whole array
print(table[:, 3])              # the amounts have become text
try:
    table[:, 3].sum()
except TypeError as e:
    print("TypeError: cannot sum text")
print(table[:, 3].astype(int).sum())   # works only after converting by hand</div>
  <div class="fx" data-lang="text">&lt;U21
['240' '450' '520']
TypeError: cannot sum text
1210</div>
  <p>The array's dtype is <code>&lt;U21</code>, which means "Unicode text up to 21 characters". Because the table mixes ids, names, cities and amounts, NumPy picked the one type that can hold all of them, text, and turned every amount into a string. Summing the amount column fails until we convert it by hand. On top of that, NumPy rows and columns have no names: you must remember that column 3 is the amount and that row 0 is order 101.</p>
  <p><strong>Pandas</strong> is the library that combines the strengths of all three. It is a Python library for labelled tables whose columns can each hold a different type of value, built on top of fast arrays. Think of it as a ledger with ruled, labelled columns: each column holds one kind of fact (names in one, money in another, dates in a third), each line has a number down the side, and you can run your finger down a whole column and total it in one movement instead of reading line by line. Here are the same three orders in pandas:</p>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.DataFrame(rows)
print(df)
print("Pune revenue:", df.loc[df["city"] == "Pune", "amount"].sum())
print(df.groupby("city")["amount"].mean())</div>
  <div class="fx" data-lang="text">   order_id customer    city  amount
0       101     Asha    Pune     240
1       102      Ben  Mumbai     450
2       103     Chen    Pune     520
Pune revenue: 760
city
Mumbai    450.0
Pune      380.0
Name: amount, dtype: float64</div>
  <p><code>pd.DataFrame(rows)</code> turned the list of dicts into a table: the dictionary keys became column names, each dictionary became a row, and pandas numbered the rows 0, 1, 2 down the left side. The Pune question is now a single line that reads like the question itself: rows where the city is Pune, the amount column, summed. The average per city, which needed a loop and two variables before, is one <code>groupby</code> call that answers it for every city at once (grouping is taught fully in <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>). Each column keeps its own type, so the amounts are real numbers, and the work is done on whole columns in compiled code, so it stays fast on millions of rows. The rest of this page explains how pandas manages all of that, because almost every pandas surprise makes sense once you know what is underneath.</p>

  <h2 id="pdm-objects"><span class="num">02</span>Series and DataFrame</h2>
  <p>Pandas is built from two objects, and everything else is a method on one of them. The smaller one is the <strong>Series</strong>: a single column of values of one type, together with a label for each value. The labels are called the <strong>index</strong>. A Series is what you get when you take a NumPy array and attach a name tag to every element, so you can find a value either by where it is or by what it is called. A useful picture is a row of labelled jars on a shelf: you can ask for "the Pizza Point jar" or "the first jar", and you can pour 5% more into every jar in one go. Here is Monday's revenue per restaurant as a Series:</p>
  <div class="fx" data-lang="py">import pandas as pd
day2 = pd.Series([240, 450, 520],
                 index=["Dosa Hut", "Biryani Bros", "Pizza Point"],
                 name="revenue")
print(day2)
print("by label   :", day2["Pizza Point"])
print("by position:", day2.iloc[0])
print("underneath :", type(day2.to_numpy()), day2.to_numpy())
print((day2 * 1.05).round(1).to_dict())</div>
  <div class="fx" data-lang="text">Dosa Hut        240
Biryani Bros    450
Pizza Point     520
Name: revenue, dtype: int64
by label   : 520
by position: 240
underneath : &lt;class 'numpy.ndarray'&gt; [240 450 520]
{'Dosa Hut': 252.0, 'Biryani Bros': 472.5, 'Pizza Point': 546.0}</div>
  <p>The printout shows the index on the left and the values on the right, followed by the Series' name and its dtype, <code>int64</code> (64-bit whole numbers). <code>day2["Pizza Point"]</code> finds a value by its label, the way a dictionary would, and returns 520. <code>day2.iloc[0]</code> finds a value by position, the way a list would, and returns the first value, 240 (<code>iloc</code> stands for "integer location"). The <code>to_numpy()</code> line shows what is really underneath: an ordinary NumPy array, <code>[240 450 520]</code>, with the labels stored alongside it. That is why multiplying by 1.05 works on every value at once at NumPy speed, and the labels come along with the results.</p>
  <p>The bigger object is the <strong>DataFrame</strong>: a two-dimensional table made of several Series that all share the same index. Each column is one Series with its own type, and the shared index ties the columns together into rows, so the third value of every column belongs to the same order. Here is Biteful's full raw export, read from CSV text with <code>read_csv</code>. This is the table the rest of the page uses:</p>
  <div class="fx" data-lang="py">import io
import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)   # print every column
RAW = """order_id,customer,restaurant,city,order_time,amount,delivery_minutes
101,Asha,Dosa Hut,Pune,2026-03-02 12:10,240,32
102,Ben,Biryani Bros,Mumbai,2026-03-02 13:05,450,41
103,Chen,Pizza Point,Pune,2026-03-02 20:30,520,38
104,Asha,Biryani Bros, pune,2026-03-03 13:15,380,
105,Dia,Green Bowl,MUMBAI,2026-03-03 19:45,310,28 min
105,Dia,Green Bowl,MUMBAI,2026-03-03 19:45,310,28 min
106,Ben,Dosa Hut,Pune,2026-03-04 12:40,180,25
107,Esha,Pizza Point,Mumbai,2026-03-04 21:10,,45
108,Chen,Momo Magic,Pune,2026-03-05 18:20,260,240
109,Farah,Biryani Bros,Mumbai,2026-03-05 20:05,600,52
110,Asha,Green Bowl,Pune,2026-03-06 13:00,290,unknown
111,Dia,Pizza Point,Mumbai,2026-03-06 20:50,700,35
"""
orders = pd.read_csv(io.StringIO(RAW), parse_dates=["order_time"])
print(orders)
print(orders.shape, "| index:", orders.index)
print(type(orders["amount"]).__name__, "| shares the index:", orders["amount"].index.equals(orders.index))</div>
  <div class="fx" data-lang="text">    order_id customer    restaurant    city          order_time  amount delivery_minutes
0        101     Asha      Dosa Hut    Pune 2026-03-02 12:10:00   240.0               32
1        102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0               41
2        103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0               38
3        104     Asha  Biryani Bros    pune 2026-03-03 13:15:00   380.0              NaN
4        105      Dia    Green Bowl  MUMBAI 2026-03-03 19:45:00   310.0           28 min
5        105      Dia    Green Bowl  MUMBAI 2026-03-03 19:45:00   310.0           28 min
6        106      Ben      Dosa Hut    Pune 2026-03-04 12:40:00   180.0               25
7        107     Esha   Pizza Point  Mumbai 2026-03-04 21:10:00     NaN               45
8        108     Chen    Momo Magic    Pune 2026-03-05 18:20:00   260.0              240
9        109    Farah  Biryani Bros  Mumbai 2026-03-05 20:05:00   600.0               52
10       110     Asha    Green Bowl    Pune 2026-03-06 13:00:00   290.0          unknown
11       111      Dia   Pizza Point  Mumbai 2026-03-06 20:50:00   700.0               35
(12, 7) | index: RangeIndex(start=0, stop=12, step=1)
Series | shares the index: True</div>
  <p>Twelve rows and seven columns, and the mess is visible straight away: row 3's city is " pune" with a leading space, row 4 says MUMBAI in capitals and is repeated exactly as row 5, row 7 has no amount (shown as NaN, "not a number", pandas' marker for a missing value), row 8 claims a 240-minute delivery, and row 10's delivery time is the word "unknown". Fixing all of that is the job of <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>; here we care about structure. The index is a <code>RangeIndex</code> from 0 to 11, because the file had no column of row labels, so pandas numbered the rows itself. Taking one column out with <code>orders["amount"]</code> gives a Series, and its index is the very same index as the table's.</p>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640" style="max-width:100%">
    <rect x="10" y="34" width="50" height="104" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="14" y="26" class="tm" font-size="11">index</text>
    <text x="28" y="58" font-size="11">0</text><text x="28" y="84" font-size="11">1</text><text x="28" y="110" font-size="11">2</text><text x="26" y="132" class="tm" font-size="11">…</text>
    <rect x="60" y="34" width="90" height="104" class="fb sb"/><rect x="150" y="34" width="110" height="104" class="ft st"/><rect x="260" y="34" width="150" height="104" class="fg sg"/><rect x="410" y="34" width="80" height="104" class="fb sb"/>
    <text x="66" y="26" font-size="11">order_id</text><text x="156" y="26" font-size="11">city</text><text x="266" y="26" font-size="11">order_time</text><text x="416" y="26" font-size="11">amount</text>
    <text x="66" y="58" font-size="11">101</text><text x="156" y="58" font-size="11">Pune</text><text x="266" y="58" font-size="11">2026-03-02 12:10</text><text x="416" y="58" font-size="11">240.0</text>
    <text x="66" y="84" font-size="11">102</text><text x="156" y="84" font-size="11">Mumbai</text><text x="266" y="84" font-size="11">2026-03-02 13:05</text><text x="416" y="84" font-size="11">450.0</text>
    <text x="66" y="110" font-size="11">103</text><text x="156" y="110" font-size="11">Pune</text><text x="266" y="110" font-size="11">2026-03-02 20:30</text><text x="416" y="110" font-size="11">520.0</text>
    <text x="66" y="156" class="tm" font-size="10">int64</text><text x="156" y="156" class="tm" font-size="10">str</text><text x="266" y="156" class="tm" font-size="10">datetime64[us]</text><text x="416" y="156" class="tm" font-size="10">float64</text>
    <text x="505" y="66" font-size="11">each column</text><text x="505" y="82" font-size="11">= one Series</text><text x="505" y="98" font-size="11">= one typed array</text><text x="505" y="122" class="tm" font-size="10">all share the index</text>
  </svg><figcaption>A DataFrame is a set of columns that share one index. Each column is a separate array with a single dtype, which is what lets pandas run maths on a whole column at NumPy speed.</figcaption></figure>
  <p>The figure shows the layout that explains most of pandas' behaviour. Down the left is the index, shared by every column. Each coloured block is one column, stored as its own array in memory with one type, written underneath: whole numbers for <code>order_id</code>, text for <code>city</code>, date-times for <code>order_time</code>, decimals for <code>amount</code>. Because a table is stored column by column rather than row by row, operations on a column (sum the amounts, compare every city with "Pune") are fast, and operations that walk across a row (look at this order's city, then its amount) are slow. Keep that in mind; it is the reason for section 05.</p>
  <p>The arrays underneath are usually NumPy arrays, but in pandas 3 text columns are stored in Apache Arrow arrays when the <code>pyarrow</code> package is installed. Arrow is a standard memory format for columnar data shared by many tools (Parquet files, Polars, DuckDB, Spark), and pandas can use it for any column. You rarely need to care which engine holds a column; the Series behaves the same either way. Creating DataFrames in other ways, inspecting them and selecting parts of them is the subject of <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>.</p>

  <h2 id="pdm-index"><span class="num">03</span>The Index and Alignment</h2>
  <p>Labels look like a convenience for printing, but they change how arithmetic works, and this is the single most surprising thing about pandas for people who know lists or NumPy. Suppose Monday's revenue covered Dosa Hut, Biryani Bros and Pizza Point, while Tuesday's covered only Biryani Bros and Green Bowl. "Revenue over both days, per restaurant" means adding the two. With lists you would add the first value to the first value; but the first value on Monday is Dosa Hut and the first on Tuesday is Biryani Bros, so that would add numbers belonging to different restaurants.</p>
  <p>Pandas avoids this by <strong>automatic alignment</strong>: whenever two Series (or DataFrames) meet in an operation, pandas first matches their values by index label, and only then does the arithmetic. Think of adding up marks from two class registers written on different days: you match students by roll number, not by "the first line of each sheet", because the sheets list different students. Step by step, pandas takes the union of the two sets of labels, sorts them, lines each value up with its partner of the same label, and computes the result for each label. Where a label exists on only one side, there is nothing to add it to, so the honest answer is "unknown", written as NaN:</p>
  <div class="fx" data-lang="py">day2 = pd.Series([240, 450, 520], index=["Dosa Hut", "Biryani Bros", "Pizza Point"])
day3 = pd.Series([380, 310], index=["Biryani Bros", "Green Bowl"])
print(day2 + day3)                     # matched by LABEL
print(day2.add(day3, fill_value=0))    # a missing label counts as 0
print(np.array([240, 450]) + np.array([380, 310]))   # NumPy: by position</div>
  <div class="fx" data-lang="text">Biryani Bros    830.0
Dosa Hut          NaN
Green Bowl        NaN
Pizza Point       NaN
dtype: float64
Biryani Bros    830.0
Dosa Hut        240.0
Green Bowl      310.0
Pizza Point     520.0
dtype: float64
[620 760]</div>
  <p>Biryani Bros is the only restaurant present on both days, so it is the only one with a real total: 450 + 380 = 830. Dosa Hut, Pizza Point and Green Bowl each appear on one side only and come out as NaN. The result has four labels, the union of both sides, and its dtype has become <code>float64</code>, because NaN is a floating-point value and a column with NaN in it cannot stay integer. If you know that a missing label really means "zero revenue that day", you say so with the method form, <code>add(..., fill_value=0)</code>, and every restaurant gets a total. The last line shows what NumPy does with the same numbers: it adds by position, so 240 + 380 = 620 pairs Dosa Hut's Monday with Biryani Bros' Tuesday, which is meaningless and raises no error at all.</p>
  <p>Alignment is the reason pandas can never quietly pair a value with the wrong row, and it applies everywhere: in arithmetic, in comparisons, in joins, and when you put a Series into a DataFrame as a new column. That last case catches people out, because it looks like copying a list into a column:</p>
  <div class="fx" data-lang="py">small = orders[["order_id", "amount"]].head(4)
bonus = pd.Series([10, 20, 30], index=[2, 0, 9])     # labels 2, 0, 9
small = small.assign(bonus=bonus)                     # aligned by label, not position
print(small)</div>
  <div class="fx" data-lang="text">   order_id  amount  bonus
0       101   240.0   20.0
1       102   450.0    NaN
2       103   520.0   10.0
3       104   380.0    NaN</div>
  <p>The <code>bonus</code> Series has labels 2, 0 and 9, not positions. Pandas matched them against the table's index: row 0 got 20, row 2 got 10, rows 1 and 3 had no matching label and got NaN, and label 9 does not exist in this four-row table, so its 30 was silently dropped. This is correct behaviour (the values went to the rows they were labelled for), but if you expected the three values to fill the first three rows in order, it is a nasty surprise. When you genuinely want position-by-position copying, strip the labels first with <code>.to_numpy()</code>.</p>
  <p>Because the index matters this much, choosing a meaningful one is a real decision. Setting <code>order_id</code> as the index (<code>set_index("order_id")</code>) makes every row addressable by its order number, which is how <code>loc</code> selection works; <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a> covers <code>loc</code>, <code>iloc</code> and what happens to labels when you sort and filter. Grouping returns results indexed by the group key, and dates as an index unlock the time-series tools in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>.</p>

  <h2 id="pdm-dtypes"><span class="num">04</span>dtypes</h2>
  <p>Every column in a DataFrame has exactly one <strong>dtype</strong>, short for data type: the kind of value every cell in that column holds, such as whole numbers, decimals, text or date-times. The dtype is not a label for humans; it decides how the column is stored in memory and what operations mean on it. Adding two <code>int64</code> columns is arithmetic; "adding" two text columns joins strings; comparing text compares letter by letter. Getting dtypes right is therefore the first thing to check after loading any file. Here are the dtypes pandas chose when it read Biteful's export:</p>
  <div class="fx" data-lang="py">print(orders.dtypes)
print("city dtype:", orders["city"].dtype, "| backed by:", orders["city"].dtype.storage)
print("pandas 2 style:", pd.Series(["Pune", "Mumbai"], dtype=object).dtype)</div>
  <div class="fx" data-lang="text">order_id                     int64
customer                       str
restaurant                     str
city                           str
order_time          datetime64[us]
amount                     float64
delivery_minutes               str
dtype: object
city dtype: str | backed by: pyarrow
pandas 2 style: object</div>
  <p><code>read_csv</code> looks at the text in each column and picks the narrowest type that fits every value. <code>order_id</code> is all whole numbers, so it is <code>int64</code>. <code>order_time</code> is <code>datetime64[us]</code>, date-times stored to the microsecond, only because we passed <code>parse_dates</code>; without it, dates stay text. Two columns are surprising. <code>amount</code> is <code>float64</code> (decimals) even though every amount in the file is a whole number of rupees: one amount is blank, the blank becomes NaN, NaN is a float, and one float forces the whole column to float. <code>delivery_minutes</code> is <code>str</code>, text, because "28 min" and "unknown" are not numbers, so pandas cannot store the column as numbers and keeps all of it as text. You cannot average that column until it is cleaned. One bad value changes the type of an entire column, which is why <code>dtypes</code> or <code>info()</code> should be the first thing you look at.</p>
  <p>The <code>str</code> dtype is new in pandas 3. Up to pandas 2, text columns had the dtype <code>object</code>, which means "an array of pointers to arbitrary Python objects". An <code>object</code> column could hold strings, numbers, lists and <code>None</code> all mixed together, which made it slow, memory-hungry and impossible to reason about: "is this column text?" had no reliable answer. In pandas 3 text gets its own dtype, <code>str</code>, which guarantees every value is a string or missing, and when <code>pyarrow</code> is installed it is stored as one compact Arrow array, as the output shows. You can still ask for <code>object</code> explicitly, but you rarely should.</p>
  <p>The float-because-of-one-blank problem has its own solution: the <strong>nullable dtypes</strong>. These are versions of the basic types that can hold a missing value without changing type. They are written with a capital letter (<code>Int64</code>, <code>Float64</code>, <code>boolean</code>) and use a special missing marker, <code>pd.NA</code>, instead of NaN:</p>
  <div class="fx" data-lang="py">plain = pd.Series([240, None, 520])
nullable = pd.Series([240, None, 520], dtype="Int64")     # capital I: nullable integer
print(plain.dtype, plain.tolist())
print(nullable.dtype, nullable.tolist())
print("sum skips the gap:", nullable.sum(), "| comparison:", (nullable &gt; 300).tolist())</div>
  <div class="fx" data-lang="text">float64 [240.0, nan, 520.0]
Int64 [240, &lt;NA&gt;, 520]
sum skips the gap: 760 | comparison: [False, &lt;NA&gt;, True]</div>
  <p>The ordinary Series turned 240 and 520 into 240.0 and 520.0 because of the gap. The <code>Int64</code> Series kept them as integers and shows the gap as <code>&lt;NA&gt;</code>. Its sum, 760, skips the missing value just as a float sum skips NaN. The comparison line shows how <code>pd.NA</code> differs from NaN: asking whether a missing amount is greater than 300 gives <code>&lt;NA&gt;</code>, "unknown", rather than <code>False</code>. That is more honest (we really do not know), but it means a mask containing NA must be handled when you filter. Nullable types are most useful for ids and counts that must stay whole numbers despite gaps.</p>
  <p>The last dtype worth knowing from the start is <strong>category</strong>, for columns that repeat a small set of values over and over, like restaurant names or cities. Instead of storing the text "Biryani Bros" in every row, a category column stores the list of distinct values once and keeps a small integer code per row pointing into that list, the way a library stores "shelf 3" on every card instead of copying out the shelf's whole description. On 200,000 generated orders the saving is large (<code>make_orders(n)</code> is a small helper, shown in <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>, that builds a random table with the same seven columns as the Biteful export):</p>
  <div class="fx" data-lang="py">big = make_orders(200_000)            # same seven columns, 200,000 rows
as_str = big["restaurant"]
as_cat = big["restaurant"].astype("category")
as_obj = big["restaurant"].astype(object)     # how pandas 2 stored text
print("str     :", round(as_str.memory_usage(deep=True) / 1e6, 2), "MB")
print("object  :", round(as_obj.memory_usage(deep=True) / 1e6, 2), "MB")
print("category:", round(as_cat.memory_usage(deep=True) / 1e6, 2), "MB")
print(list(as_cat.cat.categories), as_cat.cat.codes.dtype)</div>
  <div class="fx" data-lang="text">str     : 3.64 MB
object  : 11.84 MB
category: 0.2 MB
['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Momo Magic', 'Pizza Point'] int8</div>
  <p>The restaurant column takes about 3.6 MB as pandas 3's Arrow-backed <code>str</code>, about 11.8 MB as the <code>object</code> dtype pandas 2 used for text, and about 0.2 MB as a category, because each row now holds a one-byte <code>int8</code> code into a list of five names. Grouping and comparing on categories is faster too. The trade-off is that a category is a closed list: assigning a value that is not one of its categories raises an error, and it is the wrong choice for columns where most values are different, such as customer names. Converting messy text columns into the right dtypes is taught in <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>, and memory tuning with smaller numeric types in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>.</p>

  <h2 id="pdm-vector"><span class="num">05</span>Vectorised Operations vs apply vs Loops</h2>
  <p>Biteful charges a delivery fee of ₹30 in Pune and ₹40 in Mumbai, and wants each order's total. There are three ways to write that in pandas, and they give identical answers at wildly different speeds. Understanding why is the key to writing pandas that scales. The first way is a Python loop over rows with <code>iterrows()</code>, which hands you each row as a small Series. The second is <code>apply(..., axis=1)</code>, which calls a Python function once per row for you (<code>axis=1</code> means "row by row"). The third is a <strong>vectorised operation</strong>: one expression that works on whole columns at once, here <code>np.where(condition, 30, 40)</code> to build the fee column and <code>+</code> to add it to all the amounts. We time each on 100,000 generated orders; timings are approximate and vary by machine, but the ratios are what matter. <code>ms(f, reps)</code> is a small helper that runs a function <code>reps</code> times and returns the fastest run in milliseconds:</p>
  <div class="fx" data-lang="py">big = make_orders(100_000)

def loop():                                    # 1. plain Python loop over rows
    out = []
    for _, row in big.iterrows():
        out.append(row["amount"] + (30 if row["city"] == "Pune" else 40))
    return pd.Series(out, index=big.index)

def with_apply():                              # 2. apply: a Python function per row
    return big.apply(lambda r: r["amount"] + (30 if r["city"] == "Pune" else 40), axis=1)

def vectorised():                              # 3. whole columns at once
    return big["amount"] + np.where(big["city"] == "Pune", 30, 40)

assert loop().equals(with_apply()) and with_apply().equals(vectorised())
for f, reps in [(loop, 1), (with_apply, 1), (vectorised, 5)]:
    print(f"{f.__name__:11} {ms(f, reps):9.1f} ms")</div>
  <div class="fx" data-lang="text">loop           1774.9 ms
with_apply      433.6 ms
vectorised        1.8 ms</div>
  <p>The <code>assert</code> line confirms that all three produced exactly the same totals. The loop took about two seconds, <code>apply</code> about four hundred milliseconds, and the vectorised version under two milliseconds: roughly a thousand times faster than the loop and a couple of hundred times faster than <code>apply</code>. The gap grows with the number of rows and with the complexity of the logic.</p>
  <p>The reason goes back to how the table is stored. Each column is one typed array in memory. A vectorised operation hands the whole array to compiled C code inside NumPy or Arrow, which runs a tight loop over raw numbers with no Python involved, the way a till adds the right fee to every bill in the queue at the press of one button. The loop and <code>apply</code> do the opposite: for every row, pandas has to build a new Series object holding that row's values (gathering them from seven separate column arrays), call your Python function, have the interpreter look up <code>row["city"]</code>, compare two strings, add two numbers, and store the result, then throw the row object away and start again. That is a cashier adding the fee to each bill by hand. <code>apply</code> is faster than the explicit loop only because it builds rows a little more cheaply; it is still a Python loop in disguise.</p>
  <p>So the rule is: express your logic in terms of whole columns. Arithmetic between columns is already vectorised (<code>df["a"] * df["b"]</code>). If/else becomes <code>np.where</code>, or <code>np.select</code> for several branches. Looking up a value per category becomes <code>map</code> with a dictionary. Text work goes through the <code>.str</code> methods and dates through <code>.dt</code>. Reach for <code>apply</code> only when a step genuinely has no vectorised form, such as calling a function from another library on each value, and then on as few rows as possible. Measured comparisons including <code>itertuples</code> are in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>, and the vectorised replacements for common per-row logic are listed in <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>.</p>

  <h2 id="pdm-cow"><span class="num">06</span>Copy-on-Write</h2>
  <p>When you take part of a table, a filtered set of rows or a single column, an important question is whether you have a <em>copy</em> (separate data, so editing it leaves the original alone) or a <em>view</em> (a window onto the same memory, so editing it changes the original). For most of pandas' history the answer was "it depends": some operations returned views, others copies, and the rules were too intricate for anyone to remember. Code that edited a subset might or might not change the parent table, and pandas warned about it with the infamous <code>SettingWithCopyWarning</code>, "A value is trying to be set on a copy of a slice from a DataFrame", which nearly every pandas user has seen and few could explain.</p>
  <p>Pandas 3 replaced all of that with one rule called <strong>Copy-on-Write</strong> (CoW): any DataFrame or Series you derive from another behaves exactly as if it were an independent copy. Under the hood pandas does not actually copy anything when you take the subset, which would be slow and waste memory; the two objects share the same memory until one of them is written to, and only at that moment does pandas make the real copy. It is like a library lending you "your own copy" of a book but only printing one the moment you pick up a pen to write in it. You can watch this happen:</p>
  <div class="fx" data-lang="py">amounts = orders["amount"]                     # a column taken out of the table
print("shares memory before write:", np.shares_memory(amounts.to_numpy(), orders["amount"].to_numpy()))
amounts.iloc[0] = 0                            # edit the extracted column
print("shares memory after write :", np.shares_memory(amounts.to_numpy(), orders["amount"].to_numpy()))
print("amounts[0] =", amounts.iloc[0], "| orders amount[0] =", orders.loc[0, "amount"])

orders[orders["city"] == "Pune"]["amount"] = 0           # chained assignment
print("Pune amounts after chained:", orders.loc[orders["city"] == "Pune", "amount"].tolist())
orders.loc[orders["city"] == "Pune", "amount"] = 0       # one step
print("Pune amounts after .loc   :", orders.loc[orders["city"] == "Pune", "amount"].tolist())</div>
  <div class="fx" data-lang="text">shares memory before write: True
shares memory after write : False
amounts[0] = 0.0 | orders amount[0] = 240.0
ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment.
Pune amounts after chained: [240.0, 520.0, 180.0, 260.0, 290.0]
Pune amounts after .loc   : [0.0, 0.0, 0.0, 0.0, 0.0]</div>
  <p>The first three lines take the amount column out as <code>amounts</code>. Right after extraction it shares memory with the table (<code>True</code>): nothing has been copied. Then we write 0 into <code>amounts</code>, and at that moment pandas makes the real copy, so the memory is no longer shared (<code>False</code>). The extracted column now starts with 0 while the table still has 240. In pandas 2 without CoW, this exact code would have changed the table as well, because a column taken out with <code>[]</code> was a view.</p>
  <p>The second half shows the consequence everyone meets. <code>orders[orders["city"] == "Pune"]["amount"] = 0</code> is <strong>chained assignment</strong>: two indexing steps in a row, then an assignment. The first step, <code>orders[mask]</code>, produces a new derived table; the second step writes into that derived table, which under Copy-on-Write is effectively a copy and is thrown away immediately. So the line can never change <code>orders</code>, and pandas 3 says so with a <code>ChainedAssignmentError</code> warning; the Pune amounts are untouched. The fix is to do the selection and the assignment in a single step on the real table with <code>.loc[rows, column] = value</code>, which sets all five Pune amounts to 0.</p>
  <p>The result is simpler, more predictable pandas: a subset never changes its parent, <code>SettingWithCopyWarning</code> no longer exists, and the defensive <code>.copy()</code> people used to sprinkle after every filter is unnecessary (it still works). The one habit to keep is the one that was always correct: modify a table with <code>df.loc[mask, "col"] = value</code>, or build a new one with <code>assign</code>. The same rule silently breaks <code>inplace=True</code> methods called on an extracted column, shown in Common Mistakes below; assigning through <code>loc</code> and the history of the warning are covered further in <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>.</p>

  <h2 id="pdm-chain"><span class="num">07</span>Method Chaining</h2>
  <p>A typical analysis is a sequence of steps: remove duplicates, fix a column, drop rows you cannot use, group, total. The obvious way to write it gives every intermediate table a name. That works, but it fills your program with variables like <code>step2</code> and <code>df_clean2</code> that you must keep track of, it is easy to accidentally use <code>step2</code> where you meant <code>step3</code>, and in a notebook the variables keep holding memory long after you are done with them.</p>
  <p>Most pandas methods do not modify the table they are called on; they return a new table. That makes <strong>method chaining</strong> possible: calling the next method directly on the result of the previous one, so the whole pipeline is a single expression with no temporary names. It reads like a recipe, one step per line from top to bottom. Here is the same Biteful summary written both ways:</p>
  <div class="fx" data-lang="py"># Step by step: a new variable for every intermediate table
step1 = orders.drop_duplicates()
step2 = step1.assign(city=step1["city"].str.strip().str.title())
step3 = step2[step2["amount"].notna()]
step4 = step3.groupby("city")["amount"].agg(["size", "sum"])
print(step4)

# The same pipeline as one chain, read top to bottom
summary = (
    orders
    .drop_duplicates()
    .assign(city=lambda d: d["city"].str.strip().str.title())
    .query("amount.notna()")
    .groupby("city")["amount"]
    .agg(["size", "sum"])
)
print(summary.equals(step4))</div>
  <div class="fx" data-lang="text">        size     sum
city                
Mumbai     4  2060.0
Pune       6  1870.0
True</div>
  <p>Both versions drop the duplicate order, trim and capitalise the city so " pune" and "MUMBAI" become Pune and Mumbai, remove the order with no amount, and total by city: Mumbai has 4 orders with known amounts worth ₹2,060, and Pune 6 orders worth ₹1,870. The <code>True</code> confirms the results are identical. The chained version wraps the expression in parentheses so it can span several lines, and starts each line with a dot. Two details make chains work. Inside <code>assign</code>, a <code>lambda d: ...</code> receives the table as it is at that point in the chain, which is why it can refer to the de-duplicated rows even though they have no variable name. And <code>query("amount.notna()")</code> filters with a condition written as a string, which also needs no reference to a named table.</p>
  <p>Chains are easier to read, easier to comment out a step from, and they free intermediate tables as soon as the next step has used them. Thanks to Copy-on-Write they are also cheap, because steps that do not change data do not copy it. When a step has no built-in method, <code>.pipe(my_function)</code> slots any function that takes and returns a DataFrame into the chain. The drawback is debugging: you cannot look at an intermediate table without breaking the chain, so build chains a step at a time and keep them to a screenful. Longer chains with grouping and time windows appear in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>.</p>

  <h2 id="pdm-io"><span class="num">08</span>Reading and Writing Files</h2>
  <p>Data reaches pandas from files, and the format you choose decides whether the table comes back exactly as you saved it. Pandas has a pair of functions for each format, <code>pd.read_xxx</code> to load and <code>df.to_xxx</code> to save. A <strong>CSV</strong> file is plain text with commas between values: readable by every tool and every person, but it stores only characters, not types. <strong>Parquet</strong> is a binary file format designed for analysis: it stores data column by column, compresses each column, and records each column's name and dtype (the <strong>schema</strong>) inside the file. Excel files store cell types but are slow to read and write. Here is the Biteful table saved in all three and read straight back:</p>
  <div class="fx" data-lang="py">import os
orders.to_csv("orders.csv", index=False)
orders.to_parquet("orders.parquet")            # needs pyarrow
orders.to_excel("orders.xlsx", index=False)    # needs openpyxl
for name, back in [("csv", pd.read_csv("orders.csv")),
                   ("parquet", pd.read_parquet("orders.parquet")),
                   ("excel", pd.read_excel("orders.xlsx"))]:
    print(f"{name:8} order_time -&gt; {str(back['order_time'].dtype):15} amount -&gt; {back['amount'].dtype}")</div>
  <div class="fx" data-lang="text">csv      order_time -&gt; str             amount -&gt; float64
parquet  order_time -&gt; datetime64[us]  amount -&gt; float64
excel    order_time -&gt; datetime64[us]  amount -&gt; float64</div>
  <p>Parquet and Excel both returned <code>order_time</code> as a date-time. The CSV round trip returned it as <code>str</code>: the file kept the characters "2026-03-02 12:10:00" but not the fact that they are a date, so unless you pass <code>parse_dates</code> again on every read, date maths will fail. The same happens to categories (they come back as text) and to ids with leading zeros ("007" comes back as the number 7). Writing Parquet needs the <code>pyarrow</code> package, and Excel needs <code>openpyxl</code>.</p>
  <p>The difference becomes dramatic at size, because of how each format is laid out. A CSV is like a register written as one long paragraph: to find the amounts you must read every character of every line. A Parquet file is like a register with each column on its own sheet: to read the amounts you pick up one sheet. Timed on 200,000 generated orders (approximate; each figure is the fastest of three runs):</p>
  <div class="fx" data-lang="py">import os
big = make_orders(200_000)
big.to_csv("big.csv", index=False)
big.to_parquet("big.parquet")
print("size MB    csv", round(os.path.getsize("big.csv") / 1e6, 1),
      "| parquet", round(os.path.getsize("big.parquet") / 1e6, 1))
print("read all   csv", round(ms(lambda: pd.read_csv("big.csv", parse_dates=["order_time"]))), "ms",
      "| parquet", round(ms(lambda: pd.read_parquet("big.parquet"))), "ms")
print("2 columns  csv", round(ms(lambda: pd.read_csv("big.csv", usecols=["city", "amount"]))), "ms",
      "| parquet", round(ms(lambda: pd.read_parquet("big.parquet", columns=["city", "amount"]))), "ms")</div>
  <div class="fx" data-lang="text">size MB    csv 12.0 | parquet 3.2
read all   csv 37 ms | parquet 10 ms
2 columns  csv 19 ms | parquet 6 ms</div>
  <p>The Parquet file is under a third of the CSV's size, reading the whole table is about three times faster because there is no text to parse into numbers and dates, and reading just two of the seven columns is faster still, since Parquet skips the other five entirely while CSV still has to scan every line. The usual practice is: CSV for exchanging small files with people and other tools, Parquet for storing tables between steps of your own work and for anything large, Excel only when a person will open the file. Useful <code>read_csv</code> options (<code>usecols</code>, <code>dtype</code>, <code>parse_dates</code>, <code>index_col</code>, <code>chunksize</code> for files bigger than memory) are covered in <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>.</p>

  <h2 id="pdm-beyond"><span class="num">09</span>When to Reach for Polars or DuckDB</h2>
  <p>Pandas has two built-in limits. First, it holds the whole table in memory, and operations often make temporary copies, so a comfortable rule is that you need several times the size of the data in RAM; a 10 GB file on a 16 GB laptop is trouble. Second, pandas runs each operation eagerly, as soon as you write it, mostly on one CPU core, so it cannot look at a whole pipeline and skip work that is not needed. For most analysis (up to a few gigabytes) neither limit matters, but it helps to know what to use when one does.</p>
  <p><strong>Polars</strong> is a DataFrame library written in Rust, built on Arrow, that uses all CPU cores and offers a <em>lazy</em> mode: you describe the whole pipeline first, Polars optimises the plan (for example reading only the columns and rows it needs), and only then runs it. <strong>DuckDB</strong> is an in-process analytical database: you write SQL, and it runs it directly on Parquet files, CSV files or even pandas DataFrames, again on all cores and able to work with data larger than memory. Think of pandas as a skilled analyst working through a pile of papers one instruction at a time; Polars and DuckDB are a team that first reads your whole plan, discards the papers it will never need, and splits the rest among themselves. Here is the same question, order count and average amount per city, asked of a 2,000,000-row Parquet file in all three:</p>
  <div class="fx" data-lang="py">import duckdb, polars as pl
big = make_orders(2_000_000)
big.to_parquet("big2m.parquet")

def with_pandas():
    return pd.read_parquet("big2m.parquet").groupby("city")["amount"].agg(["size", "mean"])

def with_polars():
    return (pl.scan_parquet("big2m.parquet")              # lazy: nothing read yet
              .group_by("city").agg(pl.len(), pl.col("amount").mean())
              .collect())                                 # plan optimised, then run

def with_duckdb():
    return duckdb.sql("SELECT city, count(*), avg(amount) FROM 'big2m.parquet' GROUP BY city").df()

print(with_pandas().round(2))
print(with_polars().sort("city"))
for f in (with_pandas, with_polars, with_duckdb):
    print(f"{f.__name__:12} {ms(f):7.0f} ms")</div>
  <div class="fx" data-lang="text">           size    mean
city                   
Mumbai   899207  399.92
Pune    1100793  399.85
shape: (2, 3)
┌────────┬─────────┬────────────┐
│ city   ┆ len     ┆ amount     │
│ ---    ┆ ---     ┆ ---        │
│ str    ┆ u32     ┆ f64        │
╞════════╪═════════╪════════════╡
│ Mumbai ┆ 899207  ┆ 399.924644 │
│ Pune   ┆ 1100793 ┆ 399.845204 │
└────────┴─────────┴────────────┘
with_pandas      114 ms
with_polars       17 ms
with_duckdb       12 ms</div>
  <p>All three give the same answer (899,207 Mumbai orders averaging ₹399.92, and 1,100,793 Pune orders averaging ₹399.85); Polars prints its own style of table with each column's type under the header. Pandas took about 140 ms, most of it reading every column of the file into memory, while Polars and DuckDB took 10 to 20 ms, because they read only the two columns the query needs and use every core. Timings are approximate, and on small tables the difference disappears.</p>
  <p>In practice: stay with pandas when the data fits comfortably in memory, which is most of the time; it has the largest ecosystem, and plotting, statistics and machine-learning libraries expect its DataFrames. Reach for DuckDB when the question is naturally SQL, or when the data sits in large Parquet files you want to filter and aggregate before bringing a small result into pandas (<code>.df()</code> does that, as above). Reach for Polars when a pandas pipeline is too slow and you are happy to learn a slightly different API. When even one machine is not enough, the same DataFrame ideas carry over to <a class="xref" data-note="de_spark">Apache Spark</a>. Scaling decisions are discussed further in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>.</p>

  <h2 id="pdm-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common pandas mistake is doing maths on a column that only looks numeric. A column read as <code>str</code> because of a few bad values still prints like numbers, but every operation on it is a text operation. Asking for the longest delivery on Biteful's raw column gives a word:</p>
  <div class="fx" data-lang="py">mins = orders["delivery_minutes"]                  # dtype str, not numbers
print(mins.max())                                  # text comparison: "5" &gt; "4" &gt; "3"...
print(pd.to_numeric(mins, errors="coerce").max())  # convert first, then it is maths</div>
  <div class="fx" data-lang="text">unknown
240.0</div>
  <p>The maximum of a text column is the value that comes last alphabetically, and "unknown" beats every digit. No error is raised, so the wrong answer can travel all the way into a report. Converting with <code>pd.to_numeric(..., errors="coerce")</code>, which turns unparseable values into NaN, gives the real numeric maximum, 240 (itself an impossible value, found during cleaning). Check <code>dtypes</code> before any calculation.</p>
  <p>A second mistake comes from Copy-on-Write. Many tutorials written for older pandas fill missing values with <code>inplace=True</code> on a column taken out with brackets. In pandas 3 the column is a derived object, so the method modifies that object and the table never sees the change:</p>
  <div class="fx" data-lang="py">orders["amount"].fillna(0, inplace=True)           # inplace on an extracted column
print("blank still there:", orders["amount"].isna().sum())
orders["amount"] = orders["amount"].fillna(0)      # assign the result back
print("blank still there:", orders["amount"].isna().sum())</div>
  <div class="fx" data-lang="text">ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment using an inplace method.
blank still there: 1
blank still there: 0</div>
  <p>The <code>inplace=True</code> line warns with <code>ChainedAssignmentError</code> and the blank amount is still there. Assigning the result back to the column, <code>df["col"] = df["col"].fillna(0)</code>, works. (Whether filling a missing amount with 0 is a good idea is a separate question, answered in <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>: here it would invent a free order.) In general, avoid <code>inplace=True</code>; it rarely saves memory and does not work with chains.</p>
  <p>The third mistake is forgetting alignment when putting a Series into a table. Here we want to record the top three amounts in a new column:</p>
  <div class="fx" data-lang="py">top3 = orders.nlargest(3, "amount")["amount"]          # labels 11, 9, 2
orders["top_amount"] = top3                             # aligned by label
print(orders[["order_id", "amount", "top_amount"]].tail(4))
print("values copied by position:", top3.to_numpy())   # .to_numpy() drops the labels</div>
  <div class="fx" data-lang="text">    order_id  amount  top_amount
8        108   260.0         NaN
9        109   600.0       600.0
10       110   290.0         NaN
11       111   700.0       700.0
values copied by position: [700. 600. 520.]</div>
  <p><code>nlargest(3, "amount")</code> keeps the original labels 11, 9 and 2, so assigning it as a column put 700 in row 11, 600 in row 9, 520 in row 2, and NaN everywhere else. That is right if you meant "mark the top orders"; it is wrong if you expected the first three rows to receive the three values. Decide which you mean, and use <code>.to_numpy()</code> when you intend positions. Beyond these, two habits cause most slow or wrong pandas: writing row loops or <code>apply</code> where a vectorised expression exists, and saving tables between steps as CSV, which silently turns dates and categories back into text.</p>

  <h2 id="pdm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Pandas</b>: Python library for labelled tables whose columns can each have a different type, built on NumPy/Arrow arrays.</li>
    <li><b>Series</b>: one column: a typed array + an index of labels + an optional name.</li>
    <li><b>DataFrame</b>: a table of Series (columns) that share one row index.</li>
    <li><b>Index</b>: the row labels; survives filtering and sorting; drives alignment and <code>loc</code>.</li>
    <li><b>Alignment</b>: operations between Series match values by label first; labels on one side only give NaN (or use <code>fill_value</code>).</li>
    <li><b>dtype</b>: the type of one column; decides storage and what operations mean.</li>
    <li><b>Vectorised</b>: one operation on a whole column, run in compiled code instead of a Python loop.</li>
    <li><b>Copy-on-Write</b>: in pandas 3 every derived object behaves as a copy; the real copy happens at the first write.</li>
    <li><b>Chained assignment</b>: <code>df[a][b] = v</code>; writes into a temporary object, never the original.</li>
    <li><b>Method chaining</b>: calling the next method on the previous result, as one expression.</li>
  </ul>
  <h3>dtypes</h3>
  <table class="tbl">
    <tr><th>dtype</th><th>Holds</th><th>Missing marker</th><th>Note</th></tr>
    <tr><td><code>int64</code></td><td>whole numbers</td><td>none: one blank turns the column into float64</td><td>use <code>Int64</code> to keep integers with gaps</td></tr>
    <tr><td><code>float64</code></td><td>decimals</td><td>NaN</td><td>the default for numbers with gaps</td></tr>
    <tr><td><code>str</code></td><td>text</td><td>NaN</td><td>new in pandas 3 (Arrow-backed with pyarrow); was <code>object</code></td></tr>
    <tr><td><code>object</code></td><td>any Python objects</td><td>None / NaN</td><td>pandas 2 text default; slow and large</td></tr>
    <tr><td><code>datetime64</code></td><td>date-times</td><td>NaT</td><td>needs <code>parse_dates</code> or <code>to_datetime</code></td></tr>
    <tr><td><code>category</code></td><td>few repeated values</td><td>NaN</td><td>codes + a list of categories; 3.6 → 0.2 MB here</td></tr>
    <tr><td><code>Int64</code>, <code>Float64</code>, <code>boolean</code></td><td>nullable versions</td><td><code>pd.NA</code></td><td>comparisons with NA give NA</td></tr>
  </table>
  <h3>Pandas 3 vs pandas 2</h3>
  <table class="tbl">
    <tr><th></th><th>pandas 2</th><th>pandas 3</th></tr>
    <tr><td>Text columns</td><td><code>object</code></td><td><code>str</code></td></tr>
    <tr><td>Subset / column taken out</td><td>sometimes a view, sometimes a copy</td><td>always behaves as a copy (CoW)</td></tr>
    <tr><td><code>df[mask]["c"] = v</code></td><td><code>SettingWithCopyWarning</code>, usually no effect</td><td><code>ChainedAssignmentError</code> warning, never an effect</td></tr>
    <tr><td><code>df["c"].fillna(0, inplace=True)</code></td><td>usually worked</td><td>warns, does nothing</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">s = pd.Series([240, 450], index=["Dosa Hut", "Biryani Bros"], name="revenue")
df = pd.DataFrame(list_of_dicts)                 # or a dict of lists
df = pd.read_csv("f.csv", parse_dates=["order_time"])
df.dtypes; df.info()                             # check types first
a.add(b, fill_value=0)                           # aligned add, gaps as 0
s.to_numpy()                                     # drop labels, positional
df["c"].astype("category"); df["c"].astype("Int64")
df["fee"] = np.where(df["city"] == "Pune", 30, 40)   # vectorised if/else
df.loc[mask, "amount"] = 0                       # one-step assignment
(df.drop_duplicates()
   .assign(city=lambda d: d["city"].str.strip())
   .groupby("city")["amount"].sum())             # method chain
df.to_parquet("f.parquet"); pd.read_parquet("f.parquet", columns=["city"])</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Adding Series with different indexes gives NaN, not position-wise sums.</li>
    <li>One blank makes an int column float; one bad value makes a number column <code>str</code>.</li>
    <li><code>max()</code> on a text column compares letters: "unknown" beats 52.</li>
    <li><code>iterrows</code> and <code>apply(axis=1)</code> are Python loops: hundreds to thousands of times slower.</li>
    <li>Chained assignment and <code>inplace=True</code> on a column never change the table in pandas 3.</li>
    <li>CSV loses dtypes; Parquet keeps them.</li>
  </ul>

  <h2 id="pdm-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is pandas, and why use it instead of lists of dicts or NumPy?</summary><div class="qa-body">Pandas is a library for labelled tables with a different type per column. Compared with a list of dicts, it answers questions with whole-column operations instead of a hand-written loop per question, and runs them in compiled code. Compared with NumPy, it allows mixed column types, gives rows and columns labels, handles missing values, and has built-in grouping, joining, reshaping and time-series tools.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a Series and a DataFrame?</summary><div class="qa-body">A Series is one-dimensional: a single typed array with an index of labels. A DataFrame is two-dimensional: a collection of Series (its columns) that share one row index. Selecting one column of a DataFrame with <code>df["col"]</code> returns a Series; selecting a list of columns returns a DataFrame.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the index for?</summary><div class="qa-body">The index holds the row labels. It lets you select rows by label with <code>loc</code>, keeps each row's identity when the table is filtered or sorted, and decides how operations between objects line up (alignment). Group-by results come back indexed by the group key, and a date-time index enables resampling and time-based selection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>s1 + s2</code> return when the two Series have different indexes?</summary><div class="qa-body">Pandas aligns them first: the result's index is the union of both indexes, values are added where labels match, and labels present on only one side give NaN. The result usually becomes float64 because of the NaN. Use <code>s1.add(s2, fill_value=0)</code> to treat a missing side as zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did an integer column become float64 after <code>read_csv</code>?</summary><div class="qa-body">It contained at least one blank. Blanks are read as NaN, NaN is a floating-point value, and a NumPy int64 array cannot hold it, so the whole column is stored as float64. To keep integers with missing values, use the nullable dtype: <code>dtype={"col": "Int64"}</code> or <code>.astype("Int64")</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the <code>object</code> dtype, and what replaced it for text in pandas 3?</summary><div class="qa-body"><code>object</code> is an array of pointers to arbitrary Python objects; pandas 2 used it for text, so a column could mix strings, numbers and None, and was slow and large. Pandas 3 gives text its own <code>str</code> dtype, which guarantees strings or missing values and is stored as a compact Arrow array when pyarrow is installed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the <code>category</code> dtype and when should you use it?</summary><div class="qa-body">A category column stores each distinct value once and keeps a small integer code per row. It suits low-cardinality columns such as city, restaurant or status: memory drops sharply (3.6 MB to 0.2 MB for 200,000 restaurant names here) and grouping gets faster. It is a poor fit for mostly-unique columns, and assigning a value outside the categories raises an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are nullable dtypes and how does <code>pd.NA</code> differ from NaN?</summary><div class="qa-body">Nullable dtypes (<code>Int64</code>, <code>Float64</code>, <code>boolean</code>, and <code>string</code>) can hold a missing value without changing type. They use <code>pd.NA</code>, which propagates as "unknown" through comparisons: <code>pd.NA &gt; 300</code> is NA, whereas <code>NaN &gt; 300</code> is False. That is more correct logically, but masks containing NA must be handled before filtering.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>apply(axis=1)</code> slow compared with vectorised code?</summary><div class="qa-body">Data is stored column by column in typed arrays. A vectorised expression hands whole arrays to compiled C code. <code>apply(axis=1)</code> builds a new Series for every row, calls a Python function on it and collects the results, so the interpreter runs per row. On 100,000 orders here it was about 400 ms against under 2 ms vectorised; <code>iterrows</code> was about 2 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you replace an if/else written with <code>apply</code>?</summary><div class="qa-body">Use <code>np.where(condition, value_if_true, value_if_false)</code> for two branches, <code>np.select([cond1, cond2], [val1, val2], default=...)</code> for several, <code>Series.map(dict)</code> for a lookup per category, and <code>pd.cut</code> for numeric ranges. All of these work on whole columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Copy-on-Write?</summary><div class="qa-body">It is the pandas 3 rule that any DataFrame or Series derived from another behaves as an independent copy. To stay fast, pandas shares memory between them until one is modified, and copies only then. As a result, editing a subset never changes the parent, and chained assignment never works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What was <code>SettingWithCopyWarning</code>, and what happens to it in pandas 3?</summary><div class="qa-body">In older pandas, a subset could be a view or a copy depending on how it was made, so writing into it might or might not change the original; pandas warned with SettingWithCopyWarning. The fix was to assign with <code>df.loc[rows, col] = value</code> in one step or to <code>.copy()</code> the subset. In pandas 3 the warning is gone: Copy-on-Write makes behaviour predictable, and chained assignment raises a <code>ChainedAssignmentError</code> warning instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this do in pandas 3: <code>df[df.city == "Pune"]["amount"] = 0</code>?</summary><div class="qa-body">Nothing to <code>df</code>. The first bracket creates a derived table, the assignment writes into it, and it is discarded. Pandas warns with ChainedAssignmentError. The correct line is <code>df.loc[df.city == "Pune", "amount"] = 0</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is method chaining and what are its pros and cons?</summary><div class="qa-body">Writing a pipeline as one expression where each method is called on the previous result, typically in parentheses with one step per line, using <code>assign</code> with lambdas, <code>query</code> and <code>pipe</code>. It avoids temporary variables, reads top to bottom and frees intermediates early. It is harder to inspect intermediate results, so build chains step by step and keep them short.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CSV or Parquet: which would you use, and why?</summary><div class="qa-body">Parquet for storing and reloading analysis data: it keeps dtypes, compresses (12 MB CSV vs 3.2 MB here) and is columnar, so reading a few columns reads only those. CSV for exchanging small files with people or tools that cannot read Parquet. A CSV round trip turns dates and categories back into text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your dataset is 30 GB and your laptop has 16 GB of RAM. What do you do?</summary><div class="qa-body">Avoid loading it whole into pandas. Options: read only the needed columns and rows (Parquet <code>columns=</code>, CSV <code>usecols</code> and <code>chunksize</code>), shrink dtypes (category, smaller ints), or push the filtering and aggregation into DuckDB or Polars' lazy streaming mode, which can process data larger than memory, and bring the small result into pandas. Beyond one machine, use Spark.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose Polars or DuckDB over pandas?</summary><div class="qa-body">When the data is large or the pipeline slow: both use all CPU cores and optimise the whole query (reading only needed columns), so on 2 million rows here they were roughly ten times faster. DuckDB suits SQL-shaped questions over Parquet files; Polars suits DataFrame-style code with a lazy API. Pandas remains the default for in-memory work because of its ecosystem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did <code>df["minutes"].max()</code> return "unknown"?</summary><div class="qa-body">The column's dtype is text, because some values are not numbers. The maximum of strings is the alphabetically last one, and letters sort after digits. Convert first with <code>pd.to_numeric(df["minutes"], errors="coerce")</code>, which turns unparseable values into NaN.</div></details>
</main>
`
});
