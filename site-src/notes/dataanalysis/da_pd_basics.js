// notes/dataanalysis/da_pd_basics.js — Series, DataFrames & Selection
Object.assign(TOPIC_CONTENT, {
  "da_pd_basics": `<main>
<h1>Series, DataFrames &amp; Selection</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Series, DataFrames &amp; Selection</span></div>
  <p class="lead">Before you can answer any question with pandas, you need three everyday skills: getting your data into a DataFrame, finding out what is in it, and pointing at exactly the rows and columns you want. Selection sounds simple, but it is where most pandas confusion lives: square brackets mean different things in different places, <code>loc</code> and <code>iloc</code> disagree about where a slice ends, and an assignment that looks correct can silently change nothing. This note builds those skills one at a time: creating tables, inspecting them, selecting columns, selecting rows by label and by position, filtering by condition, adding, removing and sorting, and finally how Copy-on-Write decides whether an assignment reaches your table. The running example is the raw export of Biteful, a food-delivery company in Pune and Mumbai: 12 orders from 2 to 6 March 2026, complete with a duplicate row, inconsistent city names and a missing amount. If Series, the index and dtypes are new to you, read <a class="xref" data-note="da_pandas">How Pandas Works</a> first; every output here comes from a real run on pandas 3.1 with Python 3.13.</p>

  <h2 id="pdb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Series, DataFrames &amp; Selection</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Getting data in and looking</div>
        <ul>
          <li><code>pd.DataFrame</code> from a list of dicts (rows) or dict of lists (columns)</li>
          <li><code>read_csv(parse_dates=, index_col=, usecols=, dtype=)</code></li>
          <li><code>shape</code>, <code>head</code>, <code>info</code>, <code>describe</code>, <code>value_counts</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Selecting</div>
        <ul>
          <li><code>df["c"]</code> Series · <code>df[["a","b"]]</code> DataFrame · <code>df[1:3]</code> rows</li>
          <li><b>loc</b>: labels, slice end included · <b>iloc</b>: positions, end excluded</li>
          <li>Masks with <code>&amp;</code> <code>|</code> <code>~</code> and brackets; <code>isin</code>, <code>between</code>, <code>query</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Changing the table</div>
        <ul>
          <li><code>df["new"] = …</code>, <code>assign</code> (returns a new table)</li>
          <li><code>drop</code>, <code>rename</code>, <code>pop</code>; <code>sort_values</code>, <code>nlargest</code>, <code>reset_index</code></li>
          <li>Most methods return a new table: keep the result</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Copy-on-Write</div>
        <ul>
          <li>✔ <code>df.loc[mask, "c"] = v</code>: one step, changes df</li>
          <li>✘ <code>df[mask]["c"] = v</code>: chained, never changes df</li>
          <li>A subset in a variable is independent of its parent</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdb-create"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Creating a DataFrame</span><span class="rm-sub">from Python data and from a CSV file</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-look"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Inspecting a Table</span><span class="rm-sub">head, info, describe, value_counts</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-cols"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Selecting Columns</span><span class="rm-sub">square brackets and their one surprise</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-loc"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">loc and iloc</span><span class="rm-sub">rows by label or by position</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-mask"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Boolean Filtering</span><span class="rm-sub">rows that pass a test</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-query"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">query</span><span class="rm-sub">filters written as readable strings</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-add"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Adding Columns</span><span class="rm-sub">direct assignment and assign</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-drop"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Removing and Renaming</span><span class="rm-sub">drop, rename, pop</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-sort"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Sorting</span><span class="rm-sub">by values, by index, top n</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-cow"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Copy-on-Write When Assigning</span><span class="rm-sub">why an edit can vanish</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lost results, shifted labels, and/or</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">selectors table, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">loc vs iloc, filtering, CoW and more</span></div></div>
    </div>
  </div>

  <h2 id="pdb-create"><span class="num">01</span>Creating a DataFrame</h2>
  <p>A DataFrame is a table of columns that share one row index (<a class="xref" data-note="da_pandas">How Pandas Works</a> explains the structure). There are two everyday ways to make one: build it from data you already have in Python, or read it from a file. In Python, data usually arrives in one of two shapes. Records from an API or a database driver come as a list of dictionaries, one dictionary per row. Data you collected column by column comes as a dictionary of lists, one list per column. Pandas accepts both, and it is worth noticing which way round each one is:</p>
  <div class="fx" data-lang="py">import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)

by_rows = pd.DataFrame([                        # list of dicts: one dict per ROW
    {"order_id": 101, "city": "Pune",   "amount": 240},
    {"order_id": 102, "city": "Mumbai", "amount": 450},
])
by_cols = pd.DataFrame({                        # dict of lists: one list per COLUMN
    "order_id": [101, 102],
    "city":     ["Pune", "Mumbai"],
    "amount":   [240, 450],
})
print(by_rows)
print(by_rows.equals(by_cols))
labelled = pd.DataFrame({"amount": [240, 450]}, index=[101, 102])   # choose the index
print(labelled)</div>
  <div class="fx" data-lang="text">   order_id    city  amount
0       101    Pune     240
1       102  Mumbai     450
True
     amount
101     240
102     450</div>
  <p>The list of dicts was read row by row: each dictionary became one row, and its keys became the column names. The dict of lists was read column by column: each key became a column and its list became that column's values. The two tables are identical, as <code>equals</code> confirms. In both cases pandas invented an index of 0, 1, because we did not give one. The last example passes <code>index=[101, 102]</code>, so the rows are labelled by order number instead. Labels matter because <code>loc</code> selects by them (section 04), so when your data has a natural identifier, it is often the right index.</p>
  <p>Real data usually arrives as a file. Biteful's app exports a CSV, plain text with one line per order and commas between the values. <code>pd.read_csv</code> reads it, guesses a dtype for each column, and builds the table. We save the export to disk first so it is a real file. <code>parse_dates=["order_time"]</code> tells pandas to turn that column into date-times rather than leaving it as text:</p>
  <div class="fx" data-lang="py">from pathlib import Path
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
Path("orders_raw.csv").write_text(RAW)                 # save it as a real file
orders = pd.read_csv("orders_raw.csv", parse_dates=["order_time"])
print(orders)</div>
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
11       111      Dia   Pizza Point  Mumbai 2026-03-06 20:50:00   700.0               35</div>
  <p>This is the running example. Twelve rows and seven columns, with the mess real exports have: row 3's city is " pune" with a leading space, row 4 says MUMBAI and is repeated exactly as row 5, row 7's amount is missing (NaN), and the delivery times include "28 min", "unknown" and an impossible 240. We will not fix any of that here; that is the job of <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>. Selection is how we will find these problems.</p>
  <p><code>read_csv</code> has many options, and a few are worth knowing from the start. <code>index_col</code> makes a column the index as the file is read; <code>usecols</code> loads only the columns you name, which saves memory and time on wide files; <code>dtype={...}</code> sets column types yourself instead of letting pandas guess; and <code>chunksize</code> reads a file too big for memory in pieces. Here we read just four columns with <code>order_id</code> as the index:</p>
  <div class="fx" data-lang="py">by_id = pd.read_csv("orders_raw.csv", index_col="order_id",
                    usecols=["order_id", "customer", "city", "amount"])
print(by_id.head(3))
print("index unique?", by_id.index.is_unique)
print(by_id.loc[105])                                  # label 105 appears twice</div>
  <div class="fx" data-lang="text">         customer    city  amount
order_id                         
101          Asha    Pune   240.0
102           Ben  Mumbai   450.0
103          Chen    Pune   520.0
index unique? False
         customer    city  amount
order_id                         
105           Dia  MUMBAI   310.0
105           Dia  MUMBAI   310.0</div>
  <p>The table now has <code>order_id</code> down the left as its index, and only the three other columns we asked for. But <code>is_unique</code> is <code>False</code>: pandas does not require index labels to be unique, and because order 105 appears twice in the file, label 105 does too. Asking for <code>loc[105]</code> therefore returns two rows, not one. A duplicated index is legal but makes selection ambiguous, which is why later sections drop the duplicate row before setting <code>order_id</code> as the index.</p>
  <p>Finally, some examples in this group need a large table to measure speed. This helper generates a random table with the same seven columns as the Biteful export, any number of rows long; the other notes reuse it as "the same idea at scale":</p>
  <div class="fx" data-lang="py">def make_orders(n, seed=0):
    """A random table with the same seven columns as the Biteful export, n rows long."""
    rng = np.random.default_rng(seed)
    rest = np.array(["Dosa Hut", "Biryani Bros", "Pizza Point", "Green Bowl", "Momo Magic"])
    return pd.DataFrame({
        "order_id": np.arange(1, n + 1),
        "customer": rng.integers(1, 20_001, n).astype(str),
        "restaurant": rest[rng.integers(0, 5, n)],
        "city": np.where(rng.random(n) &lt; 0.55, "Pune", "Mumbai"),
        "order_time": pd.Timestamp("2026-01-01") + pd.to_timedelta(rng.integers(0, 90 * 24 * 60, n), unit="min"),
        "amount": rng.gamma(4, 100, n).round(0),
        "delivery_minutes": rng.normal(35, 8, n).round(0),
    })
big = make_orders(200_000)
print(big.shape)
print(big.head(3))</div>
  <div class="fx" data-lang="text">(200000, 7)
   order_id customer    restaurant    city          order_time  amount  delivery_minutes
0         1    17013  Biryani Bros    Pune 2026-01-09 08:57:00   120.0              20.0
1         2    12740    Green Bowl    Pune 2026-02-08 21:14:00   330.0              36.0
2         3    10223    Green Bowl  Mumbai 2026-01-14 09:21:00   600.0              34.0</div>
  <p>The columns match the real export, but the values are random: customer ids from 1 to 20,000, one of five restaurants, Pune about 55% of the time, a time within the first 90 days of 2026, and amounts drawn from a skewed (gamma) distribution, like real order values. Creating a 200,000-row table this way takes a fraction of a second because every column is generated as a whole array, never row by row. Other formats (Parquet, Excel) and why CSV loses types are compared in <a class="xref" data-note="da_pandas">How Pandas Works</a>.</p>

  <h2 id="pdb-look"><span class="num">02</span>Inspecting a Table</h2>
  <p>We spotted the problems in the export by reading all twelve rows, but a real export has hundreds of thousands, and nobody can read those by eye. Before asking any question of a new table, you need to know its size, what a row looks like, what type each column has, where the gaps are, and roughly what range the numbers cover. Pandas has a small set of commands for exactly that, and running them should become a reflex, like a doctor checking pulse, temperature and blood pressure before deciding anything.</p>
  <div class="fx" data-lang="py">print(orders.shape)
print(orders.head(3))
orders.info()</div>
  <div class="fx" data-lang="text">(12, 7)
   order_id customer    restaurant    city          order_time  amount delivery_minutes
0       101     Asha      Dosa Hut    Pune 2026-03-02 12:10:00   240.0               32
1       102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0               41
2       103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0               38
&lt;class 'pandas.DataFrame'&gt;
RangeIndex: 12 entries, 0 to 11
Data columns (total 7 columns):
 #   Column            Non-Null Count  Dtype         
---  ------            --------------  -----         
 0   order_id          12 non-null     int64         
 1   customer          12 non-null     str           
 2   restaurant        12 non-null     str           
 3   city              12 non-null     str           
 4   order_time        12 non-null     datetime64[us]
 5   amount            11 non-null     float64       
 6   delivery_minutes  11 non-null     str           
dtypes: datetime64[us](1), float64(1), int64(1), str(4)
memory usage: 1.0 KB</div>
  <p><code>shape</code> gives (rows, columns): 12 by 7. <code>head(3)</code> prints the first three rows (five by default; <code>tail</code> prints the last ones), which is how you see what real values look like. <code>info()</code> is the most useful of all: one line per column with its position, its name, how many cells are filled ("non-null") and its dtype, then the memory used. Reading it against the 12 entries tells us a lot without looking at any data: <code>amount</code> has 11 non-null values, so one is missing, and it is <code>float64</code> because of that gap. <code>delivery_minutes</code> also has a gap, and its dtype is <code>str</code>, text, which means some values are not numbers and the column cannot be averaged yet. A number column showing <code>str</code> is always a cleaning job.</p>
  <div class="fx" data-lang="py">print(orders.describe().round(1))</div>
  <div class="fx" data-lang="text">       order_id           order_time  amount
count      12.0                   12    11.0
mean      105.9  2026-03-04 11:02:55   385.5
min       101.0  2026-03-02 12:10:00   180.0
25%       103.8  2026-03-03 09:03:45   275.0
50%       105.5  2026-03-04 04:12:30   310.0
75%       108.2  2026-03-05 18:46:15   485.0
max       111.0  2026-03-06 20:50:00   700.0
std         3.2                  NaN   163.4</div>
  <p><code>describe()</code> summarises the numeric and date columns: the count of filled values, the mean, the minimum, the 25th, 50th and 75th percentiles (the 50% row is the median), the maximum and the standard deviation (these statistics are explained in <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>). It is worth checking one by hand: the 11 known amounts are 240, 450, 520, 380, 310, 310, 180, 260, 600, 290 and 700, which add to 4240, and 4240 / 11 = 385.5, the mean shown. But 310 appears twice because the duplicate order is still in the table, so this is not Biteful's true average order. <code>describe</code> also silently left out <code>delivery_minutes</code>, because it is text, and it computed statistics for <code>order_id</code>, which are meaningless since an id is a label, not a quantity. Inspection is for finding problems, not for reporting results.</p>
  <p>For text columns the best inspection tool is <code>value_counts()</code>, which counts how often each distinct value appears:</p>
  <div class="fx" data-lang="py">print(orders["city"].value_counts())
print("distinct restaurants:", orders["restaurant"].nunique())
print("duplicated rows     :", orders.duplicated().sum())</div>
  <div class="fx" data-lang="text">city
Pune      5
Mumbai    4
MUMBAI    2
 pune     1
Name: count, dtype: int64
distinct restaurants: 5
duplicated rows     : 1</div>
  <p>This one line exposes the city problem completely. The column should have two values, but it has four spellings: "Pune" five times, "Mumbai" four times, "MUMBAI" twice (the duplicated order), and " pune" once. Any filter or total on <code>city == "Pune"</code> will miss that last order. <code>nunique()</code> counts distinct values (five restaurants, as expected), and <code>duplicated().sum()</code> counts rows that are exact copies of an earlier row: one. Three short commands have found three of the cleaning problems.</p>

  <h2 id="pdb-cols"><span class="num">03</span>Selecting Columns</h2>
  <p>Most questions only need a few of a table's columns: "who ordered, and how much?" needs two of seven. The shortest way to pick columns is square brackets after the table's name, and what comes back depends on what you put inside:</p>
  <div class="fx" data-lang="py">print(orders["amount"].head(3))                  # one name  -&gt; Series
print(orders[["customer", "amount"]].head(3))    # a list    -&gt; DataFrame
print(orders[1:3])                               # a slice   -&gt; ROWS by position!</div>
  <div class="fx" data-lang="text">0    240.0
1    450.0
2    520.0
Name: amount, dtype: float64
  customer  amount
0     Asha   240.0
1      Ben   450.0
2     Chen   520.0
   order_id customer    restaurant    city          order_time  amount delivery_minutes
1       102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0               41
2       103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0               38</div>
  <p>One column name in brackets returns that column as a <strong>Series</strong>: one-dimensional, printed with its index and with its name and dtype underneath. A <em>list</em> of names returns a smaller <strong>DataFrame</strong> with just those columns in the order you listed them. The double brackets in <code>orders[["customer", "amount"]]</code> are not special syntax: the outer pair means "select", and the inner pair is an ordinary Python list. Asking for a list of one, <code>orders[["amount"]]</code>, gives a one-column DataFrame rather than a Series, which matters when a later step expects a table.</p>
  <p>The third line is the surprise. A <em>slice</em> inside plain brackets selects <strong>rows</strong>, by position, not columns: <code>orders[1:3]</code> returns rows 1 and 2. And, as section 05 shows, a True/False Series inside brackets also selects rows. So plain <code>[]</code> means three different things depending on what you give it: a name or list of names picks columns, a slice picks rows by position, and a boolean Series picks rows by condition. That flexibility is convenient for quick work, but it is exactly why pandas also offers the two explicit selectors in the next section, which always mean the same thing.</p>
  <div class="fx" data-lang="py">print(orders.amount.sum())                       # attribute access works...
print(orders.size)                               # ...but this is a method, not a column
try:
    orders["customer", "amount"]                 # forgot the inner list
except KeyError as e:
    print("KeyError:", e)</div>
  <div class="fx" data-lang="text">4240.0
84
KeyError: ('customer', 'amount')</div>
  <p>You can also reach a column as an attribute, <code>orders.amount</code>, and it works for simple names: the sum of the known amounts is 4240. But it fails for names with spaces or other symbols, and it is ambiguous when a column name clashes with a DataFrame method or property. <code>orders.size</code> is not a column called "size" but the number of cells in the table, 12 × 7 = 84; a column named <code>size</code> could only be reached with brackets. Attribute access also cannot create a new column. Brackets always work, so this note uses them. The last line shows a classic slip: <code>orders["customer", "amount"]</code>, with single brackets and two names, asks for one column whose name is the pair <code>("customer", "amount")</code>, which does not exist, so it raises <code>KeyError</code>. Two columns need the inner list.</p>

  <h2 id="pdb-loc"><span class="num">04</span>loc and iloc</h2>
  <p>To select rows unambiguously, you have to say what kind of address you are giving. "Show me order 103" is a question about a <em>label</em>: the row's name, whatever position it is in. "Show me the top row" is a question about a <em>position</em>: whatever row happens to be first. Pandas has one selector for each. <strong><code>loc</code></strong> selects by label, and <strong><code>iloc</code></strong> ("integer location") selects by position, counting from 0 like a Python list. Think of seats on a train: <code>loc</code> is the seat number printed on your ticket, which stays with that seat wherever the coach ends up in the train; <code>iloc</code> is "the third seat from the door", which points somewhere else as soon as the coaches are rearranged.</p>
  <p>Both take the same form: <code>df.loc[rows, columns]</code> and <code>df.iloc[rows, columns]</code>, with the column part optional. Each part can be a single item, a list or a slice. In a freshly read table the labels are 0, 1, 2 and so are the positions, so the difference is invisible. To make it visible, we drop the duplicate row (so every order id is unique) and make <code>order_id</code> the index:</p>
  <div class="fx" data-lang="py">o = orders.drop_duplicates().set_index("order_id")   # each order once, labelled by id
print(o.loc[103, "customer"], "|", o.iloc[2, 0])    # one cell, by label and by position
print(o.loc[102:104, ["customer", "amount"]])       # labels 102..104, end INCLUDED
print(o.iloc[1:3, [0, 4]])                          # positions 1, 2, end EXCLUDED</div>
  <div class="fx" data-lang="text">Chen | Chen
         customer  amount
order_id                 
102           Ben   450.0
103          Chen   520.0
104          Asha   380.0
         customer  amount
order_id                 
102           Ben   450.0
103          Chen   520.0</div>
  <p>The first line asks for the same cell two ways. <code>o.loc[103, "customer"]</code> means "the row labelled 103, the column named customer". <code>o.iloc[2, 0]</code> means "the row at position 2 (the third row), the column at position 0 (the first column, now that <code>order_id</code> has become the index)". Both give Chen, because nothing has moved yet.</p>
  <p>The two slices show the rule that trips everybody up. <code>o.loc[102:104]</code> slices by label and <strong>includes</strong> the end label, returning orders 102, 103 and 104: three rows. <code>o.iloc[1:3]</code> slices by position like a Python list and <strong>excludes</strong> the end, returning positions 1 and 2: two rows. The difference is deliberate. Positions are numbers, and "up to but not including 3" is the standard Python convention. Labels are names, and there is no sensible "label just before 104" to stop at (the labels could be words, or dates), so the only rule that makes sense for labels is "from this one to that one, both included". The column part follows the same rules: <code>["customer", "amount"]</code> is a list of names for <code>loc</code>, and <code>[0, 4]</code> a list of positions for <code>iloc</code>.</p>
  <p>Labels and positions part ways as soon as the rows are reordered or filtered:</p>
  <div class="fx" data-lang="py">by_amount = o.sort_values("amount", ascending=False)
print(by_amount[["customer", "amount"]].head(3))
print("loc[103] -&gt;", by_amount.loc[103, "amount"], "| iloc[0] -&gt;", by_amount.iloc[0]["amount"])</div>
  <div class="fx" data-lang="text">         customer  amount
order_id                 
111           Dia   700.0
109         Farah   600.0
103          Chen   520.0
loc[103] -&gt; 520.0 | iloc[0] -&gt; 700.0</div>
  <p>After sorting by amount from highest to lowest, order 111 (₹700) sits at position 0. <code>loc[103]</code> still finds order 103 and its ₹520, because the label travelled with its row; <code>iloc[0]</code> now gives order 111's ₹700. Filtering has the same effect: kept rows keep their labels, and positions are recounted from 0. So choose by meaning. If you mean a specific record, use <code>loc</code>; if you mean "the first n rows of whatever order the table is in now", such as the top three after a sort, use <code>iloc</code> or <code>head</code>.</p>
  <p>The same distinction applies to a single Series, with one pandas 3 detail worth knowing:</p>
  <div class="fx" data-lang="py">amounts = o["amount"]                  # a Series whose labels are order ids
print(amounts[103], amounts.iloc[0])   # [] on a Series means LABEL
try:
    amounts[0]                         # there is no order 0
except KeyError as e:
    print("KeyError:", e)
print(o.at[103, "city"], o.iat[0, 2])  # fast single-cell access</div>
  <div class="fx" data-lang="text">520.0 240.0
KeyError: 0
Pune Pune</div>
  <p>Taking the amount column gives a Series whose labels are order ids. Plain brackets on a Series select by <em>label</em>, so <code>amounts[103]</code> is 520, while <code>amounts.iloc[0]</code> is the first value, 240. <code>amounts[0]</code> raises <code>KeyError</code>, because there is no order labelled 0. With integer labels like these, plain brackets have always meant labels. With non-integer labels, such as restaurant names, older pandas quietly fell back to treating <code>s[0]</code> as "position 0", so the same code meant different things depending on the index; pandas 3 removed that fallback and raises <code>KeyError</code> there too. Say what you mean with <code>.loc</code> or <code>.iloc</code>. The last line shows <code>at</code> and <code>iat</code>, the single-cell versions of <code>loc</code> and <code>iloc</code>: they accept exactly one row and one column and are faster when you need one value.</p>

  <h2 id="pdb-mask"><span class="num">05</span>Boolean Filtering</h2>
  <p>Most real questions do not name a label or a position. "Which orders were above ₹400?" names a <em>condition</em> that every row either passes or fails. Pandas answers it in two steps. First, a comparison on a column, such as <code>o["amount"] &gt; 400</code>, is applied to every value at once and returns a Series of True and False with the same index as the table. This True/False Series is called a <strong>boolean mask</strong>. Second, putting the mask inside the table's brackets keeps the rows where it is True. Picture a stencil laid over the register, with holes cut where the condition is true: whatever shows through the holes is your selection.</p>
  <div class="fx" data-lang="py">mask = o["amount"] &gt; 400
print(mask.tolist())
print(o[mask][["customer", "city", "amount"]])</div>
  <div class="fx" data-lang="text">[False, True, True, False, False, False, False, False, True, False, True]
         customer    city  amount
order_id                         
102           Ben  Mumbai   450.0
103          Chen    Pune   520.0
109         Farah  Mumbai   600.0
111           Dia  Mumbai   700.0</div>
  <p>The first line prints the mask. Check it by hand against the 11 amounts in order, 240, 450, 520, 380, 310, 180, NaN, 260, 600, 290, 700: False, True, True, False, False, False, then <strong>False</strong> for the missing amount, False, True, False, True. A missing value is never "greater than" anything, because we do not know what it is, so comparisons with NaN are always False. The selection keeps the four True rows: orders 102, 103, 109 and 111, still carrying their own labels. <code>o.loc[mask, columns]</code> does the same thing and lets you pick the columns in the same step.</p>
  <p>Conditions are combined with <code>&amp;</code> for "and", <code>|</code> for "or" and <code>~</code> for "not", and each comparison must be wrapped in parentheses:</p>
  <div class="fx" data-lang="py">pune_big = o[(o["amount"] &gt; 200) &amp; (o["city"] == "Pune")]
print(pune_big[["customer", "city", "amount"]])
print("not Pune:", o[~(o["city"] == "Pune")].index.tolist())
try:
    o[o["amount"] &gt; 200 and o["city"] == "Pune"]
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">         customer  city  amount
order_id                       
101          Asha  Pune   240.0
103          Chen  Pune   520.0
108          Chen  Pune   260.0
110          Asha  Pune   290.0
not Pune: [102, 104, 105, 107, 109, 111]
ValueError: The truth value of a Series is ambiguous. Use a.empty, a.item(), a.any() or a.all().</div>
  <p>Pune orders above ₹200 are 101, 103, 108 and 110. Look closely and something is missing: order 104 was a ₹380 order in Pune, but its city is stored as " pune", which is not equal to "Pune", so it fails the test. The filter did exactly what we asked; the data is wrong, and only cleaning can fix that. The <code>~</code> line inverts a mask, listing every order whose city is not exactly "Pune", which shows the same problem from the other side: 104 and the MUMBAI order 105 appear among the "not Pune" orders.</p>
  <p>The last line shows why we cannot write the natural Python <code>and</code>. Python's <code>and</code> needs a single True or False on each side, but <code>o["amount"] &gt; 200</code> is a whole column of them, and pandas refuses to guess whether you mean "all true" or "any true", raising "The truth value of a Series is ambiguous". The operators <code>&amp;</code>, <code>|</code> and <code>~</code> work element by element instead, which is what a filter needs. The parentheses are needed because in Python <code>&amp;</code> binds more tightly than <code>&gt;</code> or <code>==</code>; without them, <code>o["amount"] &gt; 200 &amp; o["city"]</code> would try to compute <code>200 &amp; o["city"]</code> first.</p>
  <p>A few helper methods make common masks shorter and clearer:</p>
  <div class="fx" data-lang="py">print(o[o["restaurant"].isin(["Dosa Hut", "Green Bowl"])].index.tolist())
print(o[o["amount"].between(250, 400)].index.tolist())
print(o[o["amount"].isna()].index.tolist())
print(o.loc[o["amount"] &gt; 500, "customer"].tolist())   # mask + column in one loc</div>
  <div class="fx" data-lang="text">[101, 105, 106, 110]
[104, 105, 108, 110]
[107]
['Chen', 'Farah', 'Dia']</div>
  <p><code>isin([...])</code> tests whether each value is one of a list, replacing a chain of <code>==</code> joined by <code>|</code>: orders from Dosa Hut or Green Bowl are 101, 105, 106 and 110. <code>between(250, 400)</code> tests a range with both ends included: 104 (₹380), 105 (₹310), 108 (₹260) and 110 (₹290). <code>isna()</code> builds a mask of missing values, the reliable way to find them since <code>== np.nan</code> is always False: order 107 has no amount. The last line uses a mask inside <code>loc</code> together with a column name, the idiomatic way to say "these rows, this column" in one step: the customers who spent over ₹500 were Chen, Farah and Dia.</p>

  <h2 id="pdb-query"><span class="num">06</span>query</h2>
  <p>Bracket filters get hard to read as conditions pile up: every column needs the table's name in front of it, every comparison needs its own parentheses, and the operators are symbols rather than words. <code>query</code> is an alternative where you write the condition as a string, using column names directly and the words <code>and</code>, <code>or</code> and <code>not</code>. Pandas parses the string and evaluates it against the table's columns, producing the same mask you would have built by hand.</p>
  <div class="fx" data-lang="py">limit = 400
print(o.query("amount &gt; @limit and restaurant == 'Pizza Point'")[["customer", "amount"]])
print(o.query("city in ['Pune', 'Mumbai'] and delivery_minutes.notna()").shape)
wide = o.rename(columns={"amount": "amount inr"})
print(wide.query("&#96;amount inr&#96; &gt;= 600").index.tolist())   # backticks for spaces</div>
  <div class="fx" data-lang="text">         customer  amount
order_id                 
103          Chen   520.0
111           Dia   700.0
(9, 6)
[109, 111]</div>
  <p>The first query reads almost like English: amount above the limit and restaurant equal to Pizza Point, giving orders 103 and 111. The <code>@</code> in front of <code>limit</code> tells <code>query</code> that this name is a Python variable, not a column. The second line uses <code>in</code> with a list and a method call, <code>delivery_minutes.notna()</code>, and returns 9 rows: the two badly spelt city rows (" pune" and MUMBAI) fail the <code>in</code> test, leaving the 5 clean Pune orders and the 4 clean Mumbai ones. The last example shows how to use a column whose name contains a space: wrap it in backticks inside the query string, as in <code>&#96;amount inr&#96; &gt;= 600</code>.</p>
  <p>Whether to use <code>query</code> or brackets is mostly a matter of readability. <code>query</code> is shorter and clearer for long, hand-written filters and fits neatly into method chains (<a class="xref" data-note="da_pandas">How Pandas Works</a>). Bracket masks are better when the condition is built up in code, for example combining a list of masks in a loop, or when you already have a mask stored in a variable. The two give identical results; on large tables <code>query</code> can also be slightly faster if the optional <code>numexpr</code> package is installed.</p>

  <h2 id="pdb-add"><span class="num">07</span>Adding Columns</h2>
  <p>Analysis constantly creates new columns from existing ones: a total including the delivery fee, a flag for large orders, a cuisine looked up from the restaurant. The direct way is to assign to a new column name with square brackets, and pandas computes the right-hand side for every row at once:</p>
  <div class="fx" data-lang="py">o["total"] = o["amount"] + 30                                 # new column from a column
o["fee"] = np.where(o["city"] == "Pune", 30, 40)              # if/else, vectorised
o["cuisine"] = o["restaurant"].map({"Dosa Hut": "South Indian", "Pizza Point": "Pizza"})
o.loc[o["amount"] &gt; 500, "big"] = True                        # set only some rows
print(o[["city", "amount", "total", "fee", "cuisine", "big"]].head(5))</div>
  <div class="fx" data-lang="text">            city  amount  total  fee       cuisine   big
order_id                                                
101         Pune   240.0  270.0   30  South Indian   NaN
102       Mumbai   450.0  480.0   40           NaN   NaN
103         Pune   520.0  550.0   30         Pizza  True
104         pune   380.0  410.0   40           NaN   NaN
105       MUMBAI   310.0  340.0   40           NaN   NaN</div>
  <p>Each line shows a different common pattern. <code>o["total"] = o["amount"] + 30</code> computes a column from another column; the missing amount gives a missing total. <code>np.where(condition, 30, 40)</code> is a vectorised if/else that picks 30 for every Pune row and 40 for every other row; notice that order 104, stored as " pune", gets the Mumbai fee, another symptom of dirty data. <code>map</code> with a dictionary looks up each value: Dosa Hut becomes South Indian and Pizza Point becomes Pizza, and restaurants not in the dictionary get NaN. The last line uses <code>loc</code> with a mask to set a value only in some rows; the column did not exist, so pandas created it, putting <code>True</code> in rows where the amount is over ₹500 and NaN in every other row.</p>
  <p>Direct assignment changes the table in place. Often you would rather leave the original alone, for example so the same starting table can be reused for several questions, or because you are writing a method chain. <code>assign</code> does that: it returns a <em>new</em> DataFrame with the extra columns and leaves the original untouched. Think of it as photocopying the register and writing the new column on the photocopy:</p>
  <div class="fx" data-lang="py">with_total = o.assign(
    total=o["amount"] + 30,
    big_order=lambda d: d["total"] &gt; 400,          # can use 'total' from the line above
)
print(with_total[["amount", "total", "big_order"]].head(4))
print("original columns unchanged:", list(o.columns))</div>
  <div class="fx" data-lang="text">          amount  total  big_order
order_id                          
101        240.0  270.0      False
102        450.0  480.0       True
103        520.0  550.0       True
104        380.0  410.0       True
original columns unchanged: ['customer', 'restaurant', 'city', 'order_time', 'amount', 'delivery_minutes']</div>
  <p>Each keyword argument to <code>assign</code> becomes a column. A plain expression, like <code>o["amount"] + 30</code>, is computed from the original table. A <code>lambda d: ...</code> is a function that receives the table being built, including the columns created earlier in the same call, so <code>big_order</code> can refer to <code>total</code>, which did not exist in <code>o</code>. By hand: 240 + 30 = 270, not over 400; 450 + 30 = 480, over 400; 380 + 30 = 410, just over. The last line confirms that <code>o</code> still has its original six columns. Because <code>assign</code> returns its result, you must keep it in a variable (here <code>with_total</code>) or chain the next step onto it; calling it on its own line achieves nothing.</p>

  <h2 id="pdb-drop"><span class="num">08</span>Removing and Renaming</h2>
  <p>Tables often carry columns you do not need, rows you want to exclude and column names that are awkward to type. <code>drop</code> removes columns or rows by name, <code>rename</code> changes names, and <code>pop</code> takes a column out and hands it to you. Like most pandas methods, <code>drop</code> and <code>rename</code> return a new table and leave the original as it was:</p>
  <div class="fx" data-lang="py">slim = o.drop(columns=["order_time", "delivery_minutes"])    # remove columns
print(list(slim.columns))
print(slim.drop(index=[101, 102]).index.tolist())             # remove rows by label
print(slim[slim["city"] != "MUMBAI"].index.tolist())          # remove rows by condition
renamed = slim.rename(columns={"amount": "amount_inr"})
print(list(renamed.columns))
cities = slim.pop("city")                                     # remove AND return
print(list(slim.columns), "| popped:", cities.name)</div>
  <div class="fx" data-lang="text">['customer', 'restaurant', 'city', 'amount']
[103, 104, 105, 106, 107, 108, 109, 110, 111]
[101, 102, 103, 104, 106, 107, 108, 109, 110, 111]
['customer', 'restaurant', 'city', 'amount_inr']
['customer', 'restaurant', 'amount'] | popped: city</div>
  <p><code>drop(columns=[...])</code> removed the two time-related columns, leaving four. <code>drop(index=[101, 102])</code> removed two rows by label; the remaining labels start at 103. Dropping rows by a condition is just filtering with the opposite condition: keeping rows where the city is not "MUMBAI" removes order 105. <code>rename(columns={old: new})</code> renamed one column and left the others alone. Finally, <code>pop("city")</code> is the exception to "returns a new table": it removes the column from <code>slim</code> itself and returns it as a Series, which is handy when you want to separate one column, such as a target to predict, from the rest. If you ask <code>drop</code> to remove a name that does not exist it raises <code>KeyError</code>; passing <code>errors="ignore"</code> makes it skip missing names silently.</p>
  <p>You may also see <code>del df["col"]</code>, which deletes a column in place, and <code>inplace=True</code> on <code>drop</code> and <code>rename</code>. Both still work on a whole DataFrame, but <code>inplace=True</code> rarely saves memory and cannot be part of a chain, so the usual style is to assign the result: <code>o = o.drop(columns=[...])</code>.</p>

  <h2 id="pdb-sort"><span class="num">09</span>Sorting</h2>
  <p>"Biggest orders first", "restaurants in alphabetical order", "latest orders at the top": many questions are really requests to sort. <code>sort_values</code> sorts the rows by the values in one or more columns, and the index labels travel with their rows, so every row keeps its identity:</p>
  <div class="fx" data-lang="py">print(o.sort_values("amount", ascending=False)[["restaurant", "amount"]].head(4))
print(o.sort_values("amount")[["amount"]].tail(2))                  # NaN goes last
two = o.sort_values(["restaurant", "amount"], ascending=[True, False])
print(two[["restaurant", "amount"]].head(4))</div>
  <div class="fx" data-lang="text">            restaurant  amount
order_id                      
111        Pizza Point   700.0
109       Biryani Bros   600.0
103        Pizza Point   520.0
102       Biryani Bros   450.0
          amount
order_id        
111        700.0
107          NaN
            restaurant  amount
order_id                      
109       Biryani Bros   600.0
102       Biryani Bros   450.0
104       Biryani Bros   380.0
101           Dosa Hut   240.0</div>
  <p>The first table sorts by amount with <code>ascending=False</code> to put the largest first: 111, 109, 103, 102, each still labelled by its order id. The second sorts in the default ascending order and shows the last two rows: the highest amount, 700, and then the missing amount. Missing values go to the end by default whichever direction you sort; <code>na_position="first"</code> puts them at the start. The third table sorts by two columns: rows are ordered by restaurant name first, and within each restaurant by amount. The <code>ascending</code> list gives one direction per column, so restaurants run A to Z while amounts within each run from high to low: Biryani Bros' 600, 450 and 380, then Dosa Hut.</p>
  <div class="fx" data-lang="py">print(o.nlargest(3, "amount")[["customer", "amount"]])
top = o.sort_values("amount", ascending=False).head(3)
print(top.sort_index().index.tolist())                  # back to label order
print(top.reset_index()[["order_id", "amount"]])        # labels become a column again</div>
  <div class="fx" data-lang="text">         customer  amount
order_id                 
111           Dia   700.0
109         Farah   600.0
103          Chen   520.0
[103, 109, 111]
   order_id  amount
0       111   700.0
1       109   600.0
2       103   520.0</div>
  <p>For the common "top n" question, <code>nlargest(3, "amount")</code> (and <code>nsmallest</code>) gives the same rows as sorting and taking the head, but it is shorter and faster on big tables because it does not need to sort everything. <code>sort_index()</code> sorts by the index labels instead of a column, returning the top three to order-id order: 103, 109, 111. <code>reset_index()</code> moves the index back into an ordinary column and gives the table a fresh 0, 1, 2 index. This matters after sorting or filtering if you need positions and labels to agree again; <code>reset_index(drop=True)</code> throws the old labels away instead of keeping them as a column. Like <code>drop</code>, <code>sort_values</code> returns a new table; a sort you do not store is lost, as Common Mistakes shows.</p>

  <h2 id="pdb-cow"><span class="num">10</span>Copy-on-Write When Assigning</h2>
  <p>Changing values in an existing table is where pandas used to be most confusing. Suppose Biteful refunds every Pizza Point order and wants those amounts set to 0. A natural way to write that is to select the Pizza Point rows, then the amount column, then assign: <code>o2[mask]["amount"] = 0</code>. It looks right, and it runs. We try it on a copy, <code>o2</code>, so the running example stays intact:</p>
  <div class="fx" data-lang="py">o2 = o.copy()
o2[o2["restaurant"] == "Pizza Point"]["amount"] = 0       # chained: two steps
print("after chained:", o2.loc[[103, 107, 111], "amount"].tolist())
o2.loc[o2["restaurant"] == "Pizza Point", "amount"] = 0   # one step
print("after loc    :", o2.loc[[103, 107, 111], "amount"].tolist())</div>
  <div class="fx" data-lang="text">ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment.
after chained: [520.0, nan, 700.0]
after loc    : [0.0, 0.0, 0.0]</div>
  <p>The chained line printed a <code>ChainedAssignmentError</code> warning and changed nothing: the three Pizza Point orders still have 520, NaN and 700. The <code>loc</code> line changed all three to 0. To see why, count the operations. <code>o2[mask]["amount"] = 0</code> is <strong>chained assignment</strong>: two indexing operations in a row, followed by an assignment. The first, <code>o2[mask]</code>, creates a new, temporary table holding just the Pizza Point rows. The second, <code>["amount"] = 0</code>, writes into that temporary table. Nothing keeps a reference to the temporary table, so it is thrown away, and <code>o2</code> was never touched. <code>o2.loc[mask, "amount"] = 0</code> is a single operation on <code>o2</code> itself: "in this table, in these rows, in this column, put 0".</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600" style="max-width:100%">
    <defs><marker id="pdb-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="90" height="34" class="fb sb"/><text x="40" y="42" font-size="12">o2</text>
    <path d="M100 37 L170 37" stroke="currentColor" marker-end="url(#pdb-ar3)"/><text x="104" y="30" class="tm" font-size="10">[mask]</text>
    <rect x="172" y="20" width="140" height="34" class="fr sr"/><text x="180" y="42" font-size="12">temporary copy</text>
    <path d="M312 37 L380 37" stroke="currentColor" marker-end="url(#pdb-ar3)"/><text x="316" y="30" class="tm" font-size="10">["amount"]=0</text>
    <text x="386" y="42" font-size="12">edits the copy, then it is discarded</text>
    <rect x="10" y="66" width="90" height="34" class="fg sg"/><text x="40" y="88" font-size="12">o2</text>
    <path d="M100 83 L170 83" stroke="currentColor" marker-end="url(#pdb-ar3)"/><text x="178" y="88" font-size="12">.loc[mask, "amount"] = 0 → one step, edits o2</text>
  </svg><figcaption>Two brackets in a row are two operations, and the write lands on the temporary object in the middle. One <code>.loc</code> call is one operation on the real table.</figcaption></figure>
  <p>The figure traces both lines. In the top path, <code>[mask]</code> produces the red temporary table, and the assignment lands on it, not on <code>o2</code>. In the bottom path there is no intermediate object: <code>.loc</code> receives the rows and the column together and writes straight into <code>o2</code>. The rule to remember is simple: when you want to change values in a table, use one <code>.loc[rows, column] = value</code> on that table.</p>
  <p>What about saving a subset in its own variable and editing that? Should the original change too?</p>
  <div class="fx" data-lang="py">pp = o[o["restaurant"] == "Pizza Point"]      # a subset in its own variable
pp["amount"] = 999                             # edit the subset
print("subset  :", pp["amount"].tolist())
print("original:", o.loc[[103, 107, 111], "amount"].tolist())
print("pandas", pd.__version__)</div>
  <div class="fx" data-lang="text">subset  : [999, 999, 999]
original: [520.0, nan, 700.0]
pandas 3.1.0</div>
  <p>Editing <code>pp</code>, the Pizza Point subset, changed only <code>pp</code>; the original <code>o</code> still has 520, NaN and 700. This is <strong>Copy-on-Write</strong>, always on in pandas 3: any table or column derived from another (a filter, a selection, a column taken out) behaves as an independent copy. To keep subsets cheap, pandas does not copy any data when the subset is made; both objects share memory until one of them is written to, and only then is a real copy made (<a class="xref" data-note="da_pandas">How Pandas Works</a> shows the shared memory being split at the moment of writing). The result is a single, predictable rule: a subset never changes its parent, and the parent never changes the subset.</p>
  <p>Older pandas was much less predictable, and you will meet its traces in tutorials, Stack Overflow answers and interviews. Before pandas 3 (and in pandas 2 unless Copy-on-Write was switched on), a subset was sometimes a <em>view</em> sharing memory with its parent and sometimes a copy, depending on exactly how it was created. Writing into one raised <code>SettingWithCopyWarning</code>, "A value is trying to be set on a copy of a slice from a DataFrame", and the parent might or might not change. The standard advice was to assign through <code>.loc</code> in one step, or to call <code>.copy()</code> on any subset you intended to modify. That advice still works in pandas 3; the defensive <code>.copy()</code> is simply no longer needed.</p>
  <table class="tbl">
    <tr><th></th><th>pandas 2 (without CoW)</th><th>pandas 3 (CoW always on)</th></tr>
    <tr><td><code>df[mask]["c"] = v</code></td><td>SettingWithCopyWarning; usually no effect</td><td>ChainedAssignmentError warning; never has an effect</td></tr>
    <tr><td><code>sub = df[mask]; sub["c"] = v</code></td><td>warning; parent may or may not change</td><td>only <code>sub</code> changes; no warning</td></tr>
    <tr><td><code>col = df["c"]; col.iloc[0] = v</code></td><td>usually changed <code>df</code> too (a view)</td><td>only <code>col</code> changes</td></tr>
    <tr><td><code>df.loc[mask, "c"] = v</code></td><td>works</td><td>works</td></tr>
  </table>
  <p>The table summarises the differences. The only row that behaves the same in both versions is the last one, which is why <code>.loc</code> in a single step is the habit to build.</p>

  <h2 id="pdb-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most frequent mistake with this note's methods is forgetting that they return a new table. <code>sort_values</code>, <code>drop</code>, <code>rename</code>, <code>assign</code> and <code>reset_index</code> all leave the original alone, so calling one on its own line computes a result and throws it away:</p>
  <div class="fx" data-lang="py">o.sort_values("amount")                     # result thrown away
o.drop(columns=["delivery_minutes"])        # result thrown away
print(o.index[:3].tolist(), o.shape)        # o is unchanged
o = o.sort_values("amount").drop(columns=["delivery_minutes"])   # keep the result
print(o.index[:3].tolist(), o.shape)</div>
  <div class="fx" data-lang="text">[101, 102, 103] (11, 6)
[106, 101, 108] (11, 5)</div>
  <p>After the first two lines, <code>o</code> still starts with orders 101, 102, 103 and still has six columns: the sorted, slimmer table was computed and discarded. Assigning the result back, or chaining the next step onto it, keeps it: the table now starts with the cheapest orders and has five columns. No error warns you about this, so if a change "did not happen", check whether you kept the result.</p>
  <p>The second mistake is using <code>loc</code> and <code>iloc</code> interchangeably because they gave the same answer on a fresh table:</p>
  <div class="fx" data-lang="py">print(len(orders.loc[0:2]), len(orders.iloc[0:2]))     # fresh RangeIndex: 3 vs 2
f = orders[orders["amount"] &gt; 300]                     # labels now 1, 2, 3, 4, 5, ...
print(f.index[:4].tolist())
print(f.loc[2, "customer"], "|", f.iloc[2]["customer"])</div>
  <div class="fx" data-lang="text">3 2
[1, 2, 3, 4]
Chen | Asha</div>
  <p>On the freshly read table, <code>loc[0:2]</code> returns 3 rows (labels 0 to 2, end included) while <code>iloc[0:2]</code> returns 2 (positions 0 and 1). After filtering to amounts above ₹300, the kept rows keep their old labels 1, 2, 3, 4 and so on, so label 2 and position 2 are now different rows: <code>f.loc[2]</code> is Chen's order and <code>f.iloc[2]</code> is Asha's. Code that "worked" before a filter quietly returns the wrong row after it. Decide each time whether you mean a record (<code>loc</code>) or a place (<code>iloc</code>).</p>
  <p>Three more mistakes were shown in earlier sections. Writing <code>and</code> or <code>or</code> between column conditions raises "The truth value of a Series is ambiguous"; use <code>&amp;</code>, <code>|</code> and <code>~</code> with parentheses around each comparison (section 05). Selecting two columns with single brackets, <code>df["a", "b"]</code>, raises <code>KeyError</code>; use <code>df[["a", "b"]]</code> (section 03). And chained assignment, <code>df[mask]["c"] = v</code>, never changes <code>df</code> in pandas 3; use <code>df.loc[mask, "c"] = v</code> (section 10). Finally, remember that a correct filter on dirty data gives a wrong answer: " pune" escapes every <code>== "Pune"</code> test until the column is cleaned.</p>

  <h2 id="pdb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>DataFrame</b>: a table of columns (Series) sharing one row index; one dtype per column.</li>
    <li><b>Index</b>: row labels; need not be unique (a duplicated label returns several rows).</li>
    <li><b><code>loc</code></b>: select by label (or mask); slices include the end.</li>
    <li><b><code>iloc</code></b>: select by integer position; slices exclude the end.</li>
    <li><b>Boolean mask</b>: a True/False Series aligned to the index; <code>df[mask]</code> keeps the True rows.</li>
    <li><b>Chained assignment</b>: <code>df[a][b] = v</code>; writes into a temporary object.</li>
    <li><b>Copy-on-Write</b>: derived objects behave as copies; real copy made at the first write.</li>
  </ul>
  <h3>What square brackets mean</h3>
  <table class="tbl">
    <tr><th>Expression</th><th>Returns</th></tr>
    <tr><td><code>df["c"]</code></td><td>column c as a Series</td></tr>
    <tr><td><code>df[["a", "b"]]</code></td><td>DataFrame with columns a, b</td></tr>
    <tr><td><code>df[1:3]</code></td><td>rows at positions 1, 2</td></tr>
    <tr><td><code>df[mask]</code></td><td>rows where mask is True</td></tr>
    <tr><td><code>s[label]</code> (Series)</td><td>value by label only (pandas 3)</td></tr>
  </table>
  <h3>loc vs iloc</h3>
  <table class="tbl">
    <tr><th></th><th><code>loc</code></th><th><code>iloc</code></th></tr>
    <tr><td>Selects by</td><td>label, list of labels, mask</td><td>position, list of positions</td></tr>
    <tr><td>Slice end</td><td>included: <code>loc[102:104]</code> = 3 rows</td><td>excluded: <code>iloc[1:3]</code> = 2 rows</td></tr>
    <tr><td>After sort/filter</td><td>still finds the same record</td><td>points at whatever is now there</td></tr>
    <tr><td>Single cell</td><td><code>at[row, col]</code></td><td><code>iat[i, j]</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">df = pd.DataFrame(list_of_dicts)                # or dict of lists, index=[...]
df = pd.read_csv("f.csv", parse_dates=["order_time"], index_col="order_id",
                 usecols=[...], dtype={...})
df.shape; df.head(); df.info(); df.describe(); df["city"].value_counts()
df.loc[103, "customer"]; df.loc[102:104, ["customer", "amount"]]
df.iloc[0]; df.iloc[1:3, [0, 4]]
df[(df["amount"] &gt; 200) &amp; (df["city"] == "Pune")]
df[df["restaurant"].isin([...])]; df[df["amount"].between(250, 400)]
df.query("amount &gt; @limit and restaurant == 'Pizza Point'")
df["fee"] = np.where(df["city"] == "Pune", 30, 40)
df = df.assign(total=lambda d: d["amount"] + 30)
df = df.drop(columns=[...]).rename(columns={"old": "new"})
df = df.sort_values(["restaurant", "amount"], ascending=[True, False])
df.nlargest(3, "amount"); df.sort_index(); df.reset_index(drop=True)
df.loc[mask, "amount"] = 0                       # the one safe way to change values</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A slice in plain <code>[]</code> selects rows, not columns.</li>
    <li><code>df["a", "b"]</code> is a KeyError; use <code>df[["a", "b"]]</code>.</li>
    <li><code>loc</code> includes the slice end; <code>iloc</code> excludes it; they diverge after sort/filter.</li>
    <li><code>s[0]</code> on a Series means label 0; with no such label it is a KeyError (pandas 3 dropped the positional fallback).</li>
    <li><code>and</code>/<code>or</code> on columns fail; use <code>&amp;</code> <code>|</code> <code>~</code> with parentheses.</li>
    <li>Comparisons with NaN are False; find gaps with <code>isna()</code>.</li>
    <li><code>sort_values</code>, <code>drop</code>, <code>assign</code> return new tables: keep the result.</li>
    <li>Chained assignment never writes; use one <code>.loc</code>.</li>
  </ul>

  <h2 id="pdb-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you create a DataFrame from Python data?</summary><div class="qa-body">From a list of dicts, where each dict becomes a row and the keys become columns, or from a dict of lists, where each key is a column and its list holds the values. You can pass <code>index=</code> to choose the row labels; otherwise pandas uses 0, 1, 2… DataFrames can also be built from NumPy arrays or read from files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the first things you run on a newly loaded DataFrame?</summary><div class="qa-body"><code>shape</code> for size, <code>head()</code> to see real values, <code>info()</code> for dtypes and non-null counts (gaps, and numbers stored as text), <code>describe()</code> for numeric ranges, and <code>value_counts()</code> on key text columns to spot inconsistent spellings. Also <code>duplicated().sum()</code> to check for repeated rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>df["a"]</code> and <code>df[["a"]]</code>?</summary><div class="qa-body"><code>df["a"]</code> returns a Series, one-dimensional. <code>df[["a"]]</code> passes a list containing one name and returns a DataFrame with one column. The distinction matters when the next step expects a table, such as a model's feature matrix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>loc</code> and <code>iloc</code>?</summary><div class="qa-body"><code>loc</code> selects by label (and accepts boolean masks); <code>iloc</code> selects by integer position. <code>loc</code> slices include the end label, while <code>iloc</code> slices exclude the end position like Python lists. After sorting or filtering, labels stay with their rows but positions are recounted, so the two can return different rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>loc</code> include the end of a slice when <code>iloc</code> does not?</summary><div class="qa-body">Positions are integers, so "up to but not including" follows the Python convention. Labels can be any values, such as words or dates, with no natural "next label" to stop before, so the only sensible rule is to include both named ends: <code>loc["2026-03-02":"2026-03-04"]</code> means those dates inclusive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On a default RangeIndex, how many rows do <code>df.loc[0:2]</code> and <code>df.iloc[0:2]</code> return?</summary><div class="qa-body"><code>loc[0:2]</code> returns 3 rows (labels 0, 1, 2) and <code>iloc[0:2]</code> returns 2 (positions 0, 1). This is a classic trick question.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you filter rows on two conditions, and why can't you use <code>and</code>?</summary><div class="qa-body"><code>df[(df["amount"] &gt; 200) &amp; (df["city"] == "Pune")]</code>, with <code>|</code> for or and <code>~</code> for not. Python's <code>and</code> needs one boolean per side, but each comparison is a Series of booleans, so pandas raises "truth value of a Series is ambiguous". The parentheses are required because <code>&amp;</code> binds more tightly than comparison operators.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to NaN in a filter like <code>df["amount"] &gt; 400</code>?</summary><div class="qa-body">Any comparison with NaN is False, so rows with a missing amount are excluded from both <code>&gt; 400</code> and <code>&lt;= 400</code>. To find or keep missing values explicitly, use <code>isna()</code> or <code>notna()</code>; <code>== np.nan</code> is always False.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use <code>query</code> instead of a boolean mask?</summary><div class="qa-body"><code>query</code> is more readable for long hand-written filters: column names appear directly, conditions use <code>and</code>/<code>or</code>, Python variables are referenced with <code>@</code>, and names with spaces go in backticks. It also fits method chains. Masks are better when conditions are built programmatically or already stored in variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>isin</code> do, and what does <code>between</code> do?</summary><div class="qa-body"><code>isin(list)</code> returns True where a value is in the list, replacing several <code>==</code> conditions joined by <code>|</code>. <code>between(a, b)</code> returns True where a value lies in the range, inclusive of both ends by default (<code>inclusive=</code> can change that).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>df["new"] = ...</code> and <code>df.assign(new=...)</code>?</summary><div class="qa-body">Direct assignment modifies <code>df</code> in place. <code>assign</code> returns a new DataFrame and leaves <code>df</code> unchanged, which suits method chains. Inside <code>assign</code>, a lambda receives the frame being built, so later columns can use earlier ones from the same call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove columns and rows?</summary><div class="qa-body"><code>df.drop(columns=[...])</code> for columns and <code>df.drop(index=[...])</code> for rows by label; to drop rows by condition, filter with the opposite mask, <code>df[~mask]</code>. <code>pop("c")</code> removes a column in place and returns it. All but <code>pop</code> return a new table, so assign the result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you sort by several columns in different directions?</summary><div class="qa-body"><code>df.sort_values(["restaurant", "amount"], ascending=[True, False])</code> sorts by restaurant A to Z, and by amount high to low within each restaurant. Missing values go last by default (<code>na_position</code>). For the top n rows, <code>nlargest(n, col)</code> is shorter and avoids a full sort.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>reset_index</code> do and when do you need it?</summary><div class="qa-body">It moves the current index into a regular column and replaces it with a fresh 0…n−1 RangeIndex; <code>drop=True</code> discards the old labels instead. Use it after filtering, sorting or grouping when you want positions and labels to agree again, or to turn a group key index back into a column.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df[df.x &gt; 0]["y"] = 1</code> not change <code>df</code>?</summary><div class="qa-body">It is chained assignment: <code>df[df.x &gt; 0]</code> creates a new temporary DataFrame and the assignment writes into it, then it is discarded. Pandas 3 warns with ChainedAssignmentError; older pandas raised SettingWithCopyWarning. Write <code>df.loc[df.x &gt; 0, "y"] = 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What was <code>SettingWithCopyWarning</code> and how do you avoid it?</summary><div class="qa-body">In pandas before 3 it warned that you might be writing into a copy of a slice, because a subset could be either a view or a copy and the parent might not change. Avoid it by assigning with <code>.loc[rows, col] = value</code> on the original in one step, or by calling <code>.copy()</code> on a subset you mean to modify. Pandas 3's Copy-on-Write removes the warning: subsets always behave as copies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In pandas 3, if you take <code>col = df["amount"]</code> and set <code>col.iloc[0] = 0</code>, does <code>df</code> change?</summary><div class="qa-body">No. Under Copy-on-Write <code>col</code> shares memory with <code>df</code> only until it is written to; the write triggers a real copy, so only <code>col</code> changes. In pandas 2 without CoW, a column taken with <code>[]</code> was usually a view, so <code>df</code> would have changed too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>at</code>/<code>iat</code> and <code>loc</code>/<code>iloc</code>?</summary><div class="qa-body"><code>at</code> and <code>iat</code> access exactly one cell, by label or by position, and are faster for that because they skip the general indexing machinery. <code>loc</code> and <code>iloc</code> can select single cells too, but also lists, slices and masks.</div></details>
</main>
`
});
