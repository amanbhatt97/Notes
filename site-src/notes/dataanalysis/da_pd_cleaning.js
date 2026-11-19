// notes/dataanalysis/da_pd_cleaning.js — Cleaning & Missing Data
Object.assign(TOPIC_CONTENT, {
  "da_pd_cleaning": `<main>
<h1>Cleaning &amp; Missing Data</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Cleaning &amp; Missing Data</span></div>
  <p class="lead">Data cleaning is the work of turning a table that merely loads into a table you can trust. Real exports are never tidy: some cells are blank, some rows appear twice, the same city is spelt three ways, numbers arrive as text such as "28 min", and now and then a value is simply impossible. None of this raises an error, so every total, average and chart built on the raw table comes out quietly wrong. This page follows one small, deliberately messy export from Biteful, a food-delivery start-up: twelve orders from 2–6 March 2026. We will find every problem in it, learn what pandas offers for each one, ask what each fix does to the numbers, and finish with one function that cleans and checks the table the same way every day. The code runs on pandas 3.1, and where pandas 2 behaved differently the page says so.</p>

  <h2 id="pdc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Cleaning &amp; Missing Data</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Find the problems</div>
        <ul>
          <li><code>info()</code>, <code>isna().sum()</code>, <code>duplicated().sum()</code></li>
          <li><code>value_counts()</code> and <code>unique()</code> expose spellings and junk</li>
          <li>"unknown" is text, not missing, until you say so</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Missing values</div>
        <ul>
          <li>NaN (floats, str), <code>pd.NA</code> (nullable), <code>NaT</code> (dates)</li>
          <li>NaN == NaN is False: use <code>isna()</code></li>
          <li>Sums and means skip missing; report <code>count</code></li>
          <li>Leave, drop, fill or interpolate, decided by meaning</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fix values</div>
        <ul>
          <li><code>drop_duplicates(subset, keep)</code></li>
          <li><code>.str.strip/.title/.extract</code> for text</li>
          <li><code>to_numeric(errors="coerce")</code> after extracting</li>
          <li><code>to_datetime(format=...)</code>, <code>astype("category")</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trust the result</div>
        <ul>
          <li>IQR fences flag outliers; domain rules decide</li>
          <li>One cleaning function, same order every run</li>
          <li>Assertions and checks state the rules</li>
          <li>Keep the raw data; never edit by hand</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdc-scan"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Meet the Mess</span><span class="rm-sub">the raw export and how to scan it</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-na"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How Pandas Marks Missing Values</span><span class="rm-sub">NaN, None, NA, NaT and how they count</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-decide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Dropping, Filling and Interpolating</span><span class="rm-sub">what each choice does to the totals</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-impute"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Hidden Cost of Imputation</span><span class="rm-sub">shrunken spread, biased means, leakage</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-dups"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Duplicates</span><span class="rm-sub">rows counted twice</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-str"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Cleaning Text with .str</span><span class="rm-sub">string methods for a whole column</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-types"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Fixing Types</span><span class="rm-sub">text into numbers and dates, safely</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-cat"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Categoricals</span><span class="rm-sub">few distinct values, or a natural order</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-out"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Outliers</span><span class="rm-sub">the IQR rule and what to do after</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-check"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Repeatable Cleaning Function</span><span class="rm-sub">every fix, in order, at any size</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-valid"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Validating the Result</span><span class="rm-sub">turning "looks clean" into checked rules</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">fixes that make data worse</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">markers, decisions, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about dirty data</span></div></div>
    </div>
  </div>

  <h2 id="pdc-scan"><span class="num">01</span>Meet the Mess</h2>
  <p>Biteful's app exports the week's orders as a CSV file every morning. Each row should be one order: who ordered, from which restaurant, in which city, when, how much they paid and how many minutes the delivery took. Here is the file for 2–6 March exactly as it arrived. To keep the page self-contained, the CSV text sits in a Python string, and <code>io.StringIO</code> wraps that string so that <code>read_csv</code> can read it as if it were a file on disk.</p>
  <div class="fx" data-lang="py">import io
import numpy as np
import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)

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
  <p>Nothing went wrong while loading: no error, no warning, twelve neat rows. That is exactly the danger. If you look closely you can already spot trouble: order 105 appears twice, row 3 says " pune" with a leading space while others say "Pune" or "MUMBAI", row 7 has no amount, and the delivery column contains "28 min", "unknown" and a 240-minute delivery. A table can be perfectly readable and still be wrong in ways that will distort every number computed from it.</p>
  <p><strong>Data cleaning</strong> is the process of making a table fit for its purpose: every real thing appears exactly once, every column has the right type, every value is either valid or clearly marked as missing, and every category is spelt one way. Think of a mechanic who plugs in the diagnostic tool and writes down every fault code before touching a single bolt. If you fix the first problem you happen to notice, you can easily hide the others, or fix them in the wrong order. So the first step is always to scan the whole table and make a list.</p>
  <p>The first scan is <code>info()</code>, which prints one line per column with how many values are present and what type pandas chose for it:</p>
  <div class="fx" data-lang="py">orders.info()</div>
  <div class="fx" data-lang="text">&lt;class 'pandas.DataFrame'&gt;
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
memory usage: 804.0 bytes</div>
  <p>Two lines matter here. The <code>amount</code> column has 11 non-null values out of 12 rows, so one amount is missing. And <code>delivery_minutes</code> has the type <code>str</code>, meaning pandas stored it as text, because "28 min" and "unknown" are not numbers and a column can only have one type. As long as it is text, you cannot average delivery times at all. (<code>str</code> is pandas 3's dedicated text type; pandas 2 showed such columns as <code>object</code>.)</p>
  <p>Four more one-line scans complete the list:</p>
  <div class="fx" data-lang="py">print(orders.isna().sum())
print("duplicate rows:", orders.duplicated().sum())
print(orders["city"].value_counts())
print(orders["delivery_minutes"].unique())</div>
  <div class="fx" data-lang="text">order_id            0
customer            0
restaurant          0
city                0
order_time          0
amount              1
delivery_minutes    1
dtype: int64
duplicate rows: 1
city
Pune      5
Mumbai    4
MUMBAI    2
 pune     1
Name: count, dtype: int64
&lt;StringArray&gt;
['32', '41', '38', nan, '28 min', '25', '45', '240', '52', 'unknown', '35']
Length: 11, dtype: str</div>
  <p>Each of these answers a different question. <code>isna()</code> returns True for every missing cell, and summing True/False values counts the Trues, so <code>isna().sum()</code> gives the number of missing values per column: one amount and one delivery time. <code>duplicated()</code> marks each row that is identical to an earlier row, and there is one. <code>value_counts()</code> on the city column reveals four spellings of what should be two cities. And <code>unique()</code> on the delivery column lists its distinct values, which exposes "28 min", "unknown" and the suspicious "240" that none of the other scans could see. Our problem list is now complete: a blank amount (order 107), blank or unusable delivery times (104 and 110), a duplicated row (105), a city spelt four ways, minutes stored as text, and one impossible value (108). The rest of this page fixes them one at a time, starting with the blanks, because we first need to understand how pandas represents "missing".</p>

  <h2 id="pdc-na"><span class="num">02</span>How Pandas Marks Missing Values</h2>
  <p>A <strong>missing value</strong> is a cell where the true value is unknown: the customer's payment was never logged, the rider's app did not record the arrival time. Before we decide what to do with such cells, we need to know how pandas stores them, because "missing" is not a single thing in pandas, and the different markers behave differently in calculations.</p>
  <p>Pandas inherited its main marker from NumPy: <strong>NaN</strong>, short for "not a number". NaN is a special floating-point value defined by the IEEE standard that every computer uses for decimals, and it is the standard way of saying "no value here" in a numeric column. Python itself has a different null value, <code>None</code>. On top of these, pandas added <strong><code>pd.NA</code></strong> for its newer "nullable" column types, and <strong><code>NaT</code></strong> ("not a time") for missing dates. Let us put a <code>None</code> into four different kinds of column and see what pandas turns it into:</p>
  <div class="fx" data-lang="py">a = pd.Series([240, None, 520])                  # numbers + None
b = pd.Series([240, None, 520], dtype="Int64")   # nullable integer dtype
c = pd.Series(["Pune", None, "Mumbai"])          # text + None
d = pd.to_datetime(pd.Series(["2026-03-02", None]))
for s in (a, b, c, d):
    print(s.tolist(), s.dtype)
print("NaN == NaN:", np.nan == np.nan)
print("found with == :", (a == np.nan).sum(), "  found with isna():", a.isna().sum())</div>
  <div class="fx" data-lang="text">[240.0, nan, 520.0] float64
[240, &lt;NA&gt;, 520] Int64
['Pune', nan, 'Mumbai'] str
[Timestamp('2026-03-02 00:00:00'), NaT] datetime64[us]
NaN == NaN: False
found with == : 0   found with isna(): 1</div>
  <p>In the first column, a list of integers with one <code>None</code>, pandas stored the gap as NaN. Because NaN is a floating-point value and a NumPy column can only hold one type, the whole column became <code>float64</code>, so 240 turned into 240.0. This is why a column of whole numbers with a single blank shows up as decimals. The second column asked for the type <code>Int64</code> with a capital I, a <strong>nullable integer</strong> type that keeps a separate record of which cells are missing; the gap is shown as <code>&lt;NA&gt;</code> and the numbers stay integers. The text column (pandas 3's <code>str</code> type) marks the gap as NaN, and the date column marks it as <code>NaT</code>. So the marker depends on the column's type, and you will meet all of them.</p>
  <p>The last two lines show the single most important fact about NaN. <code>np.nan == np.nan</code> is <code>False</code>. The floating-point standard defines NaN as unequal to everything, itself included, and the reasoning is sensible: if two values are both unknown, you cannot claim they are equal. The consequence is that you can never find missing values with <code>==</code>: comparing the column to <code>np.nan</code> found 0 matches, while <code>isna()</code> found the one gap. <code>isna()</code> (and its opposite <code>notna()</code>) recognises every marker, NaN, None, NA and NaT alike, so it is the only test you should use.</p>
  <p>The next question is what happens when we calculate with missing values. Think of a teacher averaging test marks when one student was absent: she divides the total by the number of students who actually sat the test, not by the whole class, because treating the absent student as scoring zero would be unfair. Pandas does the same by default:</p>
  <div class="fx" data-lang="py">amt = orders.drop_duplicates()["amount"]
print("values:", amt.tolist())
print("len:", len(amt), " count:", amt.count())
print("sum:", amt.sum(), " mean:", round(amt.mean(), 1))
print("mean with skipna=False:", amt.mean(skipna=False))
empty = pd.Series([np.nan, np.nan])
print("sum of all-missing:", empty.sum(), "  with min_count=1:", empty.sum(min_count=1))</div>
  <div class="fx" data-lang="text">values: [240.0, 450.0, 520.0, 380.0, 310.0, 180.0, nan, 260.0, 600.0, 290.0, 700.0]
len: 11  count: 10
sum: 3930.0  mean: 393.0
mean with skipna=False: nan
sum of all-missing: 0.0   with min_count=1: nan</div>
  <p>After removing the duplicate row there are 11 orders. <code>len</code> counts rows (11), while <code>count()</code> counts known values (10). <code>sum()</code> adds the ten known amounts to get 3930, and <code>mean()</code> divides by the number of known values, 3930 / 10 = 393.0, not by 11. This behaviour is controlled by a parameter called <code>skipna</code>, which is <code>True</code> by default; with <code>skipna=False</code> the mean becomes NaN, because one unknown value makes the true average unknown. The last line shows a quirk worth remembering: the sum of a column that is entirely missing is 0.0, which makes "we know nothing" look like "the total was zero". Passing <code>min_count=1</code> tells pandas to return NaN unless at least one real value exists.</p>
  <p>Skipping is convenient, but it is a silent decision. "Revenue ₹3,930" sounds complete; "₹3,930 from 10 of 11 orders" is honest. Whenever you report a sum or mean from a column with gaps, report the count beside it.</p>
  <p>There is one more trap, and it is the reason scanning with <code>unique()</code> mattered. <code>isna()</code> only finds what pandas recognised as missing when it read the file. Asking for the rows with any missing cell (<code>axis=1</code> means "look across the columns of each row") finds only two of them:</p>
  <div class="fx" data-lang="py">print(orders[orders.isna().any(axis=1)][["order_id", "amount", "delivery_minutes"]])
again = pd.read_csv(io.StringIO(RAW), na_values=["unknown"])
print("missing minutes with na_values:", again["delivery_minutes"].isna().sum())</div>
  <div class="fx" data-lang="text">   order_id  amount delivery_minutes
3       104   380.0              NaN
7       107     NaN               45
missing minutes with na_values: 2</div>
  <p>Orders 104 and 107 appear, but order 110, whose delivery time is "unknown", does not, because to pandas "unknown" is just a five-letter word. The same goes for "n/a", "-", "?" or a single space. If you know which placeholders a source uses, tell <code>read_csv</code> with <code>na_values=</code>: reading the file again with <code>na_values=["unknown"]</code> gives two missing delivery times instead of one. Otherwise, the <code>unique()</code> and <code>value_counts()</code> scans are how you discover them.</p>

  <h2 id="pdc-decide"><span class="num">03</span>Dropping, Filling and Interpolating</h2>
  <p>Now that we can find missing values, we must decide what to do with them, and this is a decision about meaning, not about code. Pandas gives you three families of tools: remove the rows (<code>dropna</code>), put a value in the gap (<code>fillna</code>), or estimate the gap from its neighbours (<code>interpolate</code> and friends). Each one makes a different claim about the world, and each changes your numbers differently.</p>
  <p><strong><code>dropna()</code></strong> removes rows (or, with <code>axis=1</code>, columns) that contain missing values. Its options control how aggressive it is:</p>
  <div class="fx" data-lang="py">d = orders.drop_duplicates()
print("rows:                  ", len(d))
print("dropna():              ", len(d.dropna()))
print("dropna(subset=amount): ", len(d.dropna(subset=["amount"])))
print("dropna(how='all'):     ", len(d.dropna(how="all")))
print("dropna(axis=1) columns:", d.dropna(axis=1).columns.tolist())</div>
  <div class="fx" data-lang="text">rows:                   11
dropna():               9
dropna(subset=amount):  10
dropna(how='all'):      11
dropna(axis=1) columns: ['order_id', 'customer', 'restaurant', 'city', 'order_time']</div>
  <p>A plain <code>dropna()</code> removes any row with a gap anywhere, so orders 104 and 107 both go and 9 rows remain (order 110's "unknown" is not missing as far as pandas knows, so it stays). <code>subset=["amount"]</code> only looks at the amount column and keeps 10 rows. <code>how="all"</code> only removes rows where every cell is missing, which none are. And <code>dropna(axis=1)</code> removes whole columns, so the two columns with a single gap each vanish, which is almost never what you want. The danger with dropping is that a row is usually still a real event even when one of its values is unknown. Order 107 happened; Esha ate her pizza. Dropping her row makes Biteful's order count wrong, just to make the amount column tidy.</p>
  <p><strong><code>fillna(value)</code></strong> replaces missing values with something: a constant, or a Series of values aligned by index. Let us compare five ways of handling order 107's missing amount and see what each does to the revenue report:</p>
  <div class="fx" data-lang="py">d = orders.drop_duplicates()
rest_median = d.groupby("restaurant")["amount"].transform("median")
options = {
    "leave NaN":              d["amount"],
    "dropna":                 d["amount"].dropna(),
    "fillna(0)":              d["amount"].fillna(0),
    "fillna(overall mean)":   d["amount"].fillna(d["amount"].mean()),
    "fillna(restaurant med)": d["amount"].fillna(rest_median),
}
for name, s in options.items():
    print(f"{name:23} rows={len(s):2}  total={s.sum():5.0f}  mean={s.mean():5.1f}")
print("Pizza Point amounts:", d.loc[d["restaurant"] == "Pizza Point", "amount"].tolist())</div>
  <div class="fx" data-lang="text">leave NaN               rows=11  total= 3930  mean=393.0
dropna                  rows=10  total= 3930  mean=393.0
fillna(0)               rows=11  total= 3930  mean=357.3
fillna(overall mean)    rows=11  total= 4323  mean=393.0
fillna(restaurant med)  rows=11  total= 4540  mean=412.7
Pizza Point amounts: [520.0, nan, 700.0]</div>
  <p>Read each row as a claim. Leaving NaN says "we don't know order 107's amount", and pandas skips it: total 3930, mean 393.0. Dropping gives the same money figures but claims the order did not happen, since only 10 rows remain. <code>fillna(0)</code> claims the order was free; the total is unchanged but the mean falls to 3930 / 11 = 357.3, so the average order looks ₹36 cheaper than it is. Filling with the overall mean keeps the mean at 393.0 but adds ₹393 of revenue that the bank account will never see. The restaurant-median fill is the most "sophisticated" and the most dangerous: Pizza Point's known amounts are 520 and 700, so their median 610 is written into the gap, and total revenue jumps to 4540. That line uses <code>groupby(...).transform("median")</code>, which puts each restaurant's median next to each of its rows; it is explained properly in <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>.</p>
  <p>So which is right? For a revenue report, the honest answer is the first: keep the order, keep its amount unknown, and say "10 of 11 amounts known". Filling is right when you actually know the true value. If a "tip" column is blank because the customer gave no tip, the true value really is 0, and <code>fillna(0)</code> is correct. Filling with a typical value is also normal when a machine-learning model needs a number in every cell, but that comes with costs that the next section examines.</p>
  <p>The third family estimates a gap from the values around it, and it only makes sense when the rows have a meaningful order, usually time, and the quantity changes smoothly. Suppose we compute Pune's average delivery time per day from the cleaned table (Monday's two orders took 32 and 38 minutes, so 35; Tuesday's only order has no time; Wednesday's order took 25; Thursday's 240 will be removed as impossible; Friday's was "unknown"). We get a short daily series with gaps:</p>
  <div class="fx" data-lang="py">pune_daily = pd.Series([35.0, np.nan, 25.0, np.nan, np.nan],
                       index=pd.date_range("2026-03-02", periods=5, freq="D"))
print(pd.DataFrame({"raw": pune_daily,
                    "ffill": pune_daily.ffill(),
                    "bfill": pune_daily.bfill(),
                    "interpolate": pune_daily.interpolate(),
                    "interp_inside": pune_daily.interpolate(limit_area="inside")}))</div>
  <div class="fx" data-lang="text">             raw  ffill  bfill  interpolate  interp_inside
2026-03-02  35.0   35.0   35.0         35.0           35.0
2026-03-03   NaN   35.0   25.0         30.0           30.0
2026-03-04  25.0   25.0   25.0         25.0           25.0
2026-03-05   NaN   25.0    NaN         25.0            NaN
2026-03-06   NaN   25.0    NaN         25.0            NaN</div>
  <p><strong><code>ffill()</code></strong> (forward fill) copies the last known value forward, so Tuesday becomes 35, which suits values that stay the same until they change, such as a price or a status. <strong><code>bfill()</code></strong> copies the next known value backwards. <strong><code>interpolate()</code></strong> draws a straight line between the known neighbours, so Tuesday becomes the midpoint (35 + 25) / 2 = 30. Look at Thursday and Friday, though. There is no known value after Wednesday, so <code>ffill</code> and <code>interpolate</code> both just repeat 25; they know nothing about those days, yet the column looks complete. Passing <code>limit_area="inside"</code> restricts filling to gaps that have known values on both sides, which is usually the honest choice. Think of a torn page in a diary: if it was the middle of a temperature log, you can estimate it from the days either side, but you cannot invent the entries after the last surviving page, and if it was a receipt, you cannot invent the amount at all.</p>
  <table class="tbl"><caption>Choosing by meaning</caption>
    <tr><th>Situation</th><th>Tool</th><th>Example</th></tr>
    <tr><td>Value unknown, row still a real event</td><td>leave NaN, report the count</td><td>order 107's amount</td></tr>
    <tr><td>Row is useless without the value</td><td><code>dropna(subset=[col])</code></td><td>an order with no order id</td></tr>
    <tr><td>You know the true value</td><td><code>fillna(value)</code></td><td>blank tip means no tip, so 0</td></tr>
    <tr><td>A model needs a number</td><td><code>fillna(typical value)</code> plus a "was missing" flag</td><td>delivery time as a model input</td></tr>
    <tr><td>Ordered, smoothly changing measurements</td><td><code>interpolate()</code>, <code>ffill()</code></td><td>sensor readings, daily averages, prices</td></tr>
  </table>

  <h2 id="pdc-impute"><span class="num">04</span>The Hidden Cost of Imputation</h2>
  <p>Filling missing values with estimated ones is called <strong>imputation</strong>. It is common, it is often necessary (most machine-learning models refuse NaN), and it has costs that are invisible once the fill is done. Nobody looking at a total of 4540 can tell that ₹610 of it was invented. To see the costs clearly we need more than eleven rows, so let us generate 10,000 order amounts where we know every true value, then hide some and see what the usual fixes do.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
true = pd.Series(rng.gamma(4, 100, 10_000).round(0))      # 10,000 order amounts, all known

# Case 1: 30% lost completely at random (a sync bug)
mcar = true.mask(rng.random(10_000) &lt; 0.30)
filled = mcar.fillna(mcar.mean())
print(f"true         mean={true.mean():6.1f}  std={true.std():6.1f}")
print(f"random gaps  mean={mcar.mean():6.1f}  std={mcar.std():6.1f}  (known values only)")
print(f"mean-filled  mean={filled.mean():6.1f}  std={filled.std():6.1f}")

# Case 2: big orders are more often missing (e.g. paid by a card that fails to log)
lost = (true &gt; 600) &amp; (rng.random(10_000) &lt; 0.6)
mnar = true.mask(lost)
print(f"big ones lost mean={mnar.mean():6.1f}  (true {true.mean():.1f})")</div>
  <div class="fx" data-lang="text">true         mean= 397.9  std= 199.7
random gaps  mean= 398.5  std= 198.2  (known values only)
mean-filled  mean= 398.5  std= 166.0
big ones lost mean= 362.1  (true 397.9)</div>
  <p>In the first case, 30% of the amounts were lost <em>completely at random</em>, as if a sync bug dropped every third record regardless of its value. The known values still have almost the right mean (398.5 against a true 397.9) and the right spread: the standard deviation, a measure of how far values typically sit from the mean, is 198.2 against 199.7. Then we fill the gaps with the mean, and the mean stays right but the standard deviation drops to 166.0. Of course it does: 3,000 values now sit exactly on the mean, so the data looks far less varied than it really is. Any later analysis that depends on spread, such as a confidence interval, a statistical test or a model's sense of how uncertain it is, will be overconfident.</p>
  <p>The second case is worse. Here the large orders (above ₹600) went missing 60% of the time, perhaps because they were paid with a card type whose logging fails. Now the missing values are not a random sample, so the known values themselves are biased: their mean is 362.1 against a true 397.9. No amount of clever filling can repair this from the data alone, because the information about the big orders is simply gone, and filling with the known mean would cement the wrong figure. Statisticians name these situations: <strong>missing completely at random</strong> (MCAR, the first case), <strong>missing at random</strong> (MAR, where missingness depends on other columns you have, such as city), and <strong>missing not at random</strong> (MNAR, where it depends on the missing value itself, the second case). The practical lesson is to ask <em>why</em> values are missing before choosing a fix, for example by comparing rows with and without gaps on the other columns.</p>
  <p>When you do impute, two habits limit the damage. First, record which cells were filled, in a separate True/False column created <em>before</em> filling, so the information "this was unknown" survives:</p>
  <div class="fx" data-lang="py">d = orders.drop_duplicates().copy()
d["amount_missing"] = d["amount"].isna()            # remember BEFORE filling
d["amount_filled"] = d["amount"].fillna(d["amount"].median())
print(d.loc[d["order_id"].between(106, 108), ["order_id", "amount", "amount_missing", "amount_filled"]])</div>
  <div class="fx" data-lang="text">   order_id  amount  amount_missing  amount_filled
6       106   180.0           False          180.0
7       107     NaN            True          345.0
8       108   260.0           False          260.0</div>
  <p>Order 107 now has an amount of 345.0 (the median of the ten known amounts), but the <code>amount_missing</code> column still says True, so a report can exclude it and a model can learn whether "missing" itself carries a signal. Second, in machine learning, compute the fill value from the training data only. If you fill using a median computed on all the data, information from the test rows leaks into the training process, and the model's test score becomes optimistic. This is called <strong>data leakage</strong>, and it is covered with pipelines in <a class="xref" data-note="ml_features">Feature Engineering</a>.</p>

  <h2 id="pdc-dups"><span class="num">05</span>Duplicates</h2>
  <p>The opposite of a missing row is a row that is there twice. Exports duplicate rows when a sync job retries after a timeout, when two files with overlapping dates are combined, or when a user taps "order" twice. A duplicated order inflates the order count and the revenue, and nothing about the table looks wrong. Think of a wedding guest list assembled from two relatives' lists: the same cousin appears on both, and unless someone strikes the second entry, the caterer cooks for one extra person.</p>
  <p>A <strong>duplicate</strong> is a row whose values, in the columns you choose to compare, equal those of another row. Pandas finds them with <code>duplicated()</code> and removes them with <code>drop_duplicates()</code>:</p>
  <div class="fx" data-lang="py">print(orders.duplicated().tolist())
print(orders[orders.duplicated(keep=False)][["order_id", "customer", "amount"]])
print("order_id repeats:", orders["order_id"].duplicated().sum())
o = orders.drop_duplicates()
print(len(orders), "-&gt;", len(o), "rows")</div>
  <div class="fx" data-lang="text">[False, False, False, False, False, True, False, False, False, False, False, False]
   order_id customer  amount
4       105      Dia   310.0
5       105      Dia   310.0
order_id repeats: 1
12 -&gt; 11 rows</div>
  <p><code>duplicated()</code> returns one True/False per row, and it is True only for position 5: by default (<code>keep="first"</code>) the first copy is treated as the original and every later copy as the duplicate. To look at <em>all</em> copies side by side before deleting anything, use <code>keep=False</code>, which marks every member of a duplicated group; here that shows both rows of order 105. Checking the <code>order_id</code> column alone asks a stricter question, "does any order id repeat, even if other columns differ?", and the answer is also 1. Finally <code>drop_duplicates()</code> keeps the first copy of each row: 12 rows become 11. From here on, <code>o</code> is the de-duplicated table.</p>
  <p>Deciding what "the same row" means is the real work. Comparing every column is safe only when the table has no reliable id, and even then two genuinely different orders could coincide. Comparing on an id is usually right, but then the copies may differ in other columns, and you must choose which one to keep. A common case is a log of status updates, where the same order appears once per change:</p>
  <div class="fx" data-lang="py">updates = pd.DataFrame({"order_id": [105, 105], "status": ["placed", "delivered"],
                        "updated": pd.to_datetime(["2026-03-03 19:45", "2026-03-03 20:15"])})
print(updates.duplicated().sum(), "exact duplicates")
print(updates.sort_values("updated").drop_duplicates(subset=["order_id"], keep="last"))</div>
  <div class="fx" data-lang="text">0 exact duplicates
   order_id     status             updated
1       105  delivered 2026-03-03 20:15:00</div>
  <p>These two rows are not exact duplicates (0 found), because the status and time differ. But for a table of "current order status" we want one row per order, the latest one. Sorting by the update time and then dropping duplicates on <code>order_id</code> with <code>keep="last"</code> keeps the "delivered" row. One more warning: exact-duplicate checks are defeated by untidy text. If one copy said "MUMBAI" and the other "Mumbai", they would not match, which is one reason text cleaning, the next topic, matters.</p>

  <h2 id="pdc-str"><span class="num">06</span>Cleaning Text with .str</h2>
  <p>The city column has four spellings of two cities, and the delivery column has numbers trapped inside text. Python strings already have the methods we need, <code>strip()</code>, <code>title()</code>, <code>split()</code> (see <a class="xref" data-note="py_strings">Strings</a>), but a column holds many strings, and some of its cells may be missing. The obvious approach is a loop:</p>
  <div class="fx" data-lang="py">cities = pd.Series([" pune", "MUMBAI", None])
try:
    print([c.strip().title() for c in cities])        # plain Python loop
except AttributeError as e:
    print("AttributeError:", e)
print(cities.str.strip().str.title().tolist())        # .str: whole column, NaN passes through</div>
  <div class="fx" data-lang="text">AttributeError: 'float' object has no attribute 'strip'
['Pune', 'Mumbai', nan]</div>
  <p>The loop fails as soon as it reaches the missing value, because NaN is a float, and floats have no <code>strip</code> method. You would need an <code>if</code> inside the loop for every gap, and the loop also runs slowly in Python on large columns. Pandas solves both problems with the <strong><code>.str</code> accessor</strong>: an attribute of every text Series that offers the familiar string methods and applies them to every value in the column, letting missing values pass through untouched. The second line does in one expression what the loop could not. Think of a rubber stamp: instead of correcting a stack of name cards one by one with a pen, you set up the stamp once ("trim and capitalise") and press it on the whole stack.</p>
  <p>Applied to Biteful's cities:</p>
  <div class="fx" data-lang="py">print(o["city"].tolist())
city = o["city"].str.strip().str.title()
print(city.value_counts())</div>
  <div class="fx" data-lang="text">['Pune', 'Mumbai', 'Pune', ' pune', 'MUMBAI', 'Pune', 'Mumbai', 'Pune', 'Mumbai', 'Pune', 'Mumbai']
city
Pune      6
Mumbai    5
Name: count, dtype: int64</div>
  <p><code>.str.strip()</code> removes spaces from the start and end of each value, so " pune" becomes "pune". <code>.str.title()</code> capitalises the first letter of each word and lowercases the rest, so "pune" becomes "Pune" and "MUMBAI" becomes "Mumbai". Each method returns a new Series, so they chain naturally. Four spellings collapse into two cities, Pune 6 and Mumbai 5, and order 104 is now correctly counted as a Pune order.</p>
  <p>The accessor has most of Python's string methods and a few pandas extras. Here are the ones you will use most, on the restaurant column:</p>
  <div class="fx" data-lang="py">r = o["restaurant"]
print(r.str.contains("pizza", case=False).sum(), "Pizza Point orders")
print(r.str.split(" ").str[0].unique().tolist())
print(r.str.replace("Bros", "Brothers").unique().tolist())
print(pd.Series(["a.b", "ab"]).str.contains(".").tolist(),
      pd.Series(["a.b", "ab"]).str.contains(".", regex=False).tolist())</div>
  <div class="fx" data-lang="text">3 Pizza Point orders
['Dosa', 'Biryani', 'Pizza', 'Green', 'Momo']
['Dosa Hut', 'Biryani Brothers', 'Pizza Point', 'Green Bowl', 'Momo Magic']
[True, True] [True, False]</div>
  <p><code>.str.contains("pizza", case=False)</code> returns True wherever the text contains "pizza" in any capitalisation, so summing it counts the three Pizza Point orders. <code>.str.split(" ")</code> turns each name into a list of words, and <code>.str[0]</code> then takes the first element of every list. <code>.str.replace</code> substitutes text. The last line is a classic surprise: <code>.str.contains</code> treats its argument as a <strong>regular expression</strong> (a small pattern language for text) by default, and in that language "." means "any character", so it matches "ab" too. Pass <code>regex=False</code> when you mean the literal text. (<code>.str.replace</code> is the other way round: literal by default since pandas 2, regex only with <code>regex=True</code>.)</p>
  <p>Regular expressions are exactly what we need for the delivery column, though. <code>.str.extract</code> keeps the part of each value that matches a pattern. The pattern <code>r"(\\d+)"</code> means "one or more digits", and the brackets mark the part to keep:</p>
  <div class="fx" data-lang="py">digits = o["delivery_minutes"].str.extract(r"(\\d+)", expand=False)
print(o["delivery_minutes"].tolist())
print(digits.tolist())</div>
  <div class="fx" data-lang="text">['32', '41', '38', nan, '28 min', '25', '45', '240', '52', 'unknown', '35']
['32', '41', '38', nan, '28', '25', '45', '240', '52', nan, '35']</div>
  <p>"28 min" became "28", plain numbers stayed as they were, and "unknown", which has no digits, became NaN, which is honest because it really is unknown. Notice the quotes, though: the result is still text. "28" is a string of two characters, not the number twenty-eight. Turning text into real numbers is the next step.</p>

  <h2 id="pdc-types"><span class="num">07</span>Fixing Types</h2>
  <p>Every column in pandas has a <strong>dtype</strong> (data type), and the dtype decides what you can do with it. A <code>float64</code> column can be summed and compared numerically; a <code>str</code> column can only be treated as text, and comparing text compares letters, so "240" sorts before "28". Converting a text column into numbers sounds simple, but some values will not convert, and the important question is what happens to them. There are three ways to try:</p>
  <div class="fx" data-lang="py">raw_min = o["delivery_minutes"]
for attempt in ("astype", "to_numeric"):
    try:
        raw_min.astype(float) if attempt == "astype" else pd.to_numeric(raw_min)
    except ValueError as e:
        print(f"{attempt}: ValueError: {e}")
blind = pd.to_numeric(raw_min, errors="coerce")
print("coerce directly:   ", blind.tolist())</div>
  <div class="fx" data-lang="text">astype: ValueError: could not convert string to float: '28 min'
to_numeric: ValueError: Unable to parse string '28 min' at position 4
coerce directly:    [32.0, 41.0, 38.0, nan, nan, 25.0, 45.0, 240.0, 52.0, nan, 35.0]</div>
  <p>Both <code>astype(float)</code> and <code>pd.to_numeric</code> stop at the first value they cannot parse, and <code>to_numeric</code> even says where: "28 min" at position 4. This default behaviour, <code>errors="raise"</code>, is safe because nothing is silently lost. The third attempt uses <code>errors="coerce"</code>, which converts what it can and turns everything else into NaN. Look at position 4: "28 min" became NaN, even though the 28 in it was perfectly good information. Coercing blindly throws data away without telling you.</p>
  <p>Think of a cashier counting a pile of banknotes. <code>raise</code> stops and calls the manager at the first odd note; <code>coerce</code> quietly drops every odd note in a bin. The sensible cashier first checks whether the odd note is just a normal one in a plastic sleeve. For us that means extracting the digits first, then coercing what is left, and then checking exactly what coerce discarded:</p>
  <div class="fx" data-lang="py">raw_min = o["delivery_minutes"]
blind = pd.to_numeric(raw_min, errors="coerce")
mins = pd.to_numeric(raw_min.str.extract(r"(\\d+)", expand=False), errors="coerce")
print("extract then coerce:", mins.tolist(), mins.dtype)
lost = raw_min[blind.isna() &amp; raw_min.notna()]
print("values coerce turned into NaN:", lost.tolist())
print("values still NaN after extract:", raw_min[mins.isna() &amp; raw_min.notna()].tolist())</div>
  <div class="fx" data-lang="text">extract then coerce: [32.0, 41.0, 38.0, nan, 28.0, 25.0, 45.0, 240.0, 52.0, nan, 35.0] float64
values coerce turned into NaN: ['28 min', 'unknown']
values still NaN after extract: ['unknown']</div>
  <p>Now "28 min" is kept as 28.0, and the column is <code>float64</code>, so it can be averaged. The two diagnostic lines are the habit worth copying: compare the values that were present before conversion but are NaN after it. Blind coercion would have destroyed '28 min' and 'unknown'; extracting first leaves only 'unknown', which truly had no number. Any time you use <code>errors="coerce"</code>, run this check and read the list.</p>
  <p>The column is float because it contains NaN, as we saw in section 02. If you want whole numbers with gaps, use the nullable integer type:</p>
  <div class="fx" data-lang="py">whole = mins.astype("Int64")             # nullable integer: whole minutes, gaps as &lt;NA&gt;
print(whole.tolist(), whole.dtype)
print("mean:", round(whole.mean(), 1), "| plain int64 would fail:", end=" ")
try:
    mins.astype("int64")
except Exception as e:
    print(type(e).__name__)</div>
  <div class="fx" data-lang="text">[32, 41, 38, &lt;NA&gt;, 28, 25, 45, 240, 52, &lt;NA&gt;, 35] Int64
mean: 59.6 | plain int64 would fail: IntCastingNaNError</div>
  <p><code>astype("Int64")</code> keeps the minutes as integers with <code>&lt;NA&gt;</code> for the gaps, and calculations skip the gaps as usual. Asking for the ordinary NumPy <code>int64</code> fails with <code>IntCastingNaNError</code>, because NumPy integers have no way to represent "missing".</p>
  <p>Dates need even more care, because the same text can mean two different dates. Biteful's customer table stores sign-up dates exactly as typed into an Indian sign-up form, day first:</p>
  <div class="fx" data-lang="py">guess = pd.to_datetime(customers["signup_date"], errors="coerce")
right = pd.to_datetime(customers["signup_date"], format="%d/%m/%Y", errors="coerce")
print(pd.DataFrame({"text": customers["signup_date"], "guessed": guess, "format=": right}))</div>
  <div class="fx" data-lang="text">         text    guessed    format=
0  04/01/2025 2025-04-01 2025-01-04
1  13/06/2025        NaT 2025-06-13
2  22/11/2024        NaT 2024-11-22
3     unknown        NaT        NaT
4  09/02/2026 2026-09-02 2026-02-09
5  30/12/2025        NaT 2025-12-30</div>
  <p>Without a format, pandas looks at the first value, "04/01/2025", guesses the American month-first pattern, and applies that guess to the whole column. Asha's 4 January became <strong>1 April</strong>, Esha's 9 February became 2 September, and every date whose day is above 12 (13/06, 22/11, 30/12) could not fit the guessed pattern and became <code>NaT</code>. Nothing raised an error; half the column is wrong and the other half is missing. With <code>format="%d/%m/%Y"</code> (day, month, four-digit year) every date is right and only "unknown" becomes <code>NaT</code>. The rule is simple: whenever dates are not in the unambiguous ISO form <code>YYYY-MM-DD</code>, pass <code>format=</code> (or at least <code>dayfirst=True</code>). Working with the converted dates is covered in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>.</p>

  <h2 id="pdc-cat"><span class="num">08</span>Categoricals</h2>
  <p>After tidying, the city column holds just two distinct words repeated on every row. Storing the full word each time wastes memory, and nothing stops tomorrow's export from introducing a third spelling. Some columns also have a natural order that text sorting gets wrong: "small", "medium", "large" sort alphabetically as large, medium, small. Pandas has a type for "one of a fixed set of values": the <strong>categorical</strong>. A categorical column stores the list of distinct values once (the <em>categories</em>) and then, for each row, just a small integer <em>code</em> pointing into that list. Think of your phone's call log: it does not store "Biryani Bros, Pune" in full for every call; it stores a pointer to the saved contact.</p>
  <div class="fx" data-lang="py">city_cat = city.astype("category")
print(city_cat.cat.categories.tolist(), city_cat.cat.codes.tolist())
size = pd.cut(o["amount"], bins=[0, 300, 500, np.inf], labels=["small", "medium", "large"])
print(pd.DataFrame({"amount": o["amount"], "size": size}).head(4))
print("ordered:", size.cat.ordered, "| medium or bigger:", (size &gt;= "medium").sum())
print("as plain text, sorted:", sorted(["small", "medium", "large"]))</div>
  <div class="fx" data-lang="text">['Mumbai', 'Pune'] [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0]
   amount    size
0   240.0   small
1   450.0  medium
2   520.0   large
3   380.0  medium
ordered: True | medium or bigger: 6
as plain text, sorted: ['large', 'medium', 'small']</div>
  <p><code>astype("category")</code> found the two categories, sorted them (Mumbai, Pune), and replaced each row with a code: 0 for Mumbai, 1 for Pune. The table still prints and filters exactly as before; the change is in how it is stored. <code>pd.cut</code> creates an <strong>ordered</strong> categorical from numbers by putting them into labelled bins: up to 300 is small, above 300 up to 500 is medium, above 500 is large (each bin includes its right edge). Because the categories are ordered, comparisons follow your order rather than the alphabet: <code>size &gt;= "medium"</code> counts 6 orders, while plain text would sort the labels as large, medium, small.</p>
  <p>The memory saving only shows at scale, so here is a million-row city column, and, for contrast, a million unique ids:</p>
  <div class="fx" data-lang="py">big_city = pd.Series(np.where(np.random.default_rng(0).random(1_000_000) &lt; 0.55, "Pune", "Mumbai"))
as_cat = big_city.astype("category")
ids = pd.Series(np.arange(1_000_000).astype(str))
mb = lambda s: s.memory_usage(deep=True) / 1e6
print(f"city as str:      {mb(big_city):5.1f} MB")
print(f"city as category: {mb(as_cat):5.1f} MB")
print(f"ids as str:       {mb(ids):5.1f} MB   as category: {mb(ids.astype('category')):5.1f} MB")</div>
  <div class="fx" data-lang="text">city as str:       53.9 MB
city as category:   1.0 MB
ids as str:        54.9 MB   as category:  58.9 MB</div>
  <p>A million city names take about 54 MB as text and about 1 MB as a category, because each row now needs a single byte for its code. The ids tell the opposite story: every value is different, so the category list is as long as the data, and the categorical version is <em>larger</em>. The number of distinct values in a column is called its <strong>cardinality</strong>, and categoricals help only for low-cardinality columns such as city, status, plan or weekday. One behaviour changed between versions: when you group by a categorical, pandas 3 shows only the categories that actually occur (<code>observed=True</code> is now the default), whereas pandas 2 listed every category, even empty ones, unless told otherwise.</p>

  <h2 id="pdc-out"><span class="num">09</span>Outliers</h2>
  <p>The delivery column is numeric at last, and one value stands out: order 108 took 240 minutes, four hours for a plate of momos. An <strong>outlier</strong> is a value that is unusually far from the rest of the data. It might be an error (a rider forgot to tap "delivered") or a rare but real event (a flood closed the roads). Statistics can tell you that a value is unusual; only knowledge of the business can tell you whether it is wrong. We need a rule for "unusually far" that is not itself distorted by the extreme value we are trying to catch.</p>
  <p>The standard rule is the <strong>IQR rule</strong>, built on quartiles. Sort the values; the <strong>first quartile</strong> (Q1) is the value a quarter of the way up, and the <strong>third quartile</strong> (Q3) is the value three quarters of the way up. The <strong>inter-quartile range</strong>, IQR = Q3 − Q1, is the width of the middle half of the data. Anything more than 1.5 × IQR below Q1 or above Q3 is flagged. Because quartiles depend only on the middle of the sorted data, one huge value hardly moves them.</p>
  <div class="fx" data-lang="py">m = mins.dropna()
q1, q3 = m.quantile(0.25), m.quantile(0.75)
iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print("sorted:", sorted(m.tolist()))
print(f"Q1={q1}  Q3={q3}  IQR={iqr}  fences=({lo}, {hi})")
print("outside fences:", m[(m &lt; lo) | (m &gt; hi)].tolist())
print(f"mean with 240: {m.mean():.1f}   without: {m[m &lt; hi].mean():.1f}   median: {m.median()}")</div>
  <div class="fx" data-lang="text">sorted: [25.0, 28.0, 32.0, 35.0, 38.0, 41.0, 45.0, 52.0, 240.0]
Q1=32.0  Q3=45.0  IQR=13.0  fences=(12.5, 64.5)
outside fences: [240.0]
mean with 240: 59.6   without: 37.0   median: 38.0</div>
  <p>The nine known times sorted are 25, 28, 32, 35, 38, 41, 45, 52, 240. Q1 is 32 and Q3 is 45 (with nine values these land exactly on the 3rd and 7th), so the IQR is 13 and the fences are 32 − 19.5 = 12.5 and 45 + 19.5 = 64.5. Only 240 lies outside. The last line shows why a robust rule matters: the single 240 drags the mean from 37.0 up to 59.6, a figure that describes no real delivery, while the median stays at 38.0. The usual picture of the IQR rule is a <strong>box plot</strong>, where the box spans Q1 to Q3, the line inside is the median, the whiskers reach the furthest values inside the fences, and anything beyond is drawn as a separate point:</p>
  <div class="fx" data-lang="py">import matplotlib.pyplot as plt

m = mins.dropna()
fig, ax = plt.subplots(figsize=(6.4, 1.9))
ax.boxplot(m, orientation="horizontal", widths=0.5, whis=1.5)
ax.set_xlabel("delivery minutes (9 known orders)")
ax.set_yticks([])
ax.annotate("order 108: 240", xy=(240, 1), xytext=(175, 1.32),
            arrowprops=dict(arrowstyle="-&gt;"))
fig.tight_layout()</div>
  <figure class="viz"><svg fill="currentColor" style="max-width:640px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 460.8 136.8" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="figure_1">
<g id="patch_1">
<path d="M 0 136.8 
L 460.8 136.8 
L 460.8 0 
L 0 0 
L 0 136.8 
z
" style="fill: none"/>
</g>
<g id="axes_1">
<g id="patch_2">
<path d="M 10.8 90.800781 
L 441.890641 90.800781 
L 441.890641 10.8 
L 10.8 10.8 
L 10.8 90.800781 
z
" style="fill: none"/>
</g>
<g id="matplotlib.axis_1">
<g id="xtick_1">
<g id="line2d_1">
<defs>
<path id="md51722dfee" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#md51722dfee" x="75.964864" y="90.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_1">
<text style="font-size: 10px; text-anchor: middle" x="75.964864" y="107.488281" transform="rotate(-0 75.964864 107.488281)">50</text>
</g>
</g>
<g id="xtick_2">
<g id="line2d_2">
<g>
<use xlink:href="#md51722dfee" x="167.104535" y="90.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_2">
<text style="font-size: 10px; text-anchor: middle" x="167.104535" y="107.488281" transform="rotate(-0 167.104535 107.488281)">100</text>
</g>
</g>
<g id="xtick_3">
<g id="line2d_3">
<g>
<use xlink:href="#md51722dfee" x="258.244205" y="90.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_3">
<text style="font-size: 10px; text-anchor: middle" x="258.244205" y="107.488281" transform="rotate(-0 258.244205 107.488281)">150</text>
</g>
</g>
<g id="xtick_4">
<g id="line2d_4">
<g>
<use xlink:href="#md51722dfee" x="349.383875" y="90.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_4">
<text style="font-size: 10px; text-anchor: middle" x="349.383875" y="107.488281" transform="rotate(-0 349.383875 107.488281)">200</text>
</g>
</g>
<g id="xtick_5">
<g id="line2d_5">
<g>
<use xlink:href="#md51722dfee" x="440.523546" y="90.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_5">
<text style="font-size: 10px; text-anchor: middle" x="440.523546" y="107.488281" transform="rotate(-0 440.523546 107.488281)">250</text>
</g>
</g>
<g id="text_6">
<text style="font-size: 10px; text-anchor: middle" x="226.34532" y="123.587891" transform="rotate(-0 226.34532 123.587891)">delivery minutes (9 known orders)</text>
</g>
</g>
<g id="matplotlib.axis_2"/>
<g id="line2d_6">
<path d="M 43.154583 70.800586 
L 43.154583 30.800195 
L 66.850897 30.800195 
L 66.850897 70.800586 
L 43.154583 70.800586 
" clip-path="url(#pabe525e23f)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
</g>
<g id="line2d_7">
<path d="M 43.154583 50.800391 
L 30.395029 50.800391 
" clip-path="url(#pabe525e23f)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
</g>
<g id="line2d_8">
<path d="M 66.850897 50.800391 
L 79.610451 50.800391 
" clip-path="url(#pabe525e23f)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
</g>
<g id="line2d_9">
<path d="M 30.395029 60.800488 
L 30.395029 40.800293 
" clip-path="url(#pabe525e23f)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
</g>
<g id="line2d_10">
<path d="M 79.610451 60.800488 
L 79.610451 40.800293 
" clip-path="url(#pabe525e23f)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
</g>
<g id="line2d_11">
<defs>
<path id="mef67a9de76" d="M 0 3 
C 0.795609 3 1.55874 2.683901 2.12132 2.12132 
C 2.683901 1.55874 3 0.795609 3 0 
C 3 -0.795609 2.683901 -1.55874 2.12132 -2.12132 
C 1.55874 -2.683901 0.795609 -3 0 -3 
C -0.795609 -3 -1.55874 -2.683901 -2.12132 -2.12132 
C -2.683901 -1.55874 -3 -0.795609 -3 0 
C -3 0.795609 -2.683901 1.55874 -2.12132 2.12132 
C -1.55874 2.683901 -0.795609 3 0 3 
z
" style="stroke: currentColor"/>
</defs>
<g clip-path="url(#pabe525e23f)">
<use xlink:href="#mef67a9de76" x="422.295612" y="50.800391" style="fill-opacity: 0; stroke: currentColor"/>
</g>
</g>
<g id="line2d_12">
<path d="M 54.091343 70.800586 
L 54.091343 30.800195 
" clip-path="url(#pabe525e23f)" style="fill: none; stroke: #ff7f0e"/>
</g>
<g id="patch_3">
<path d="M 10.8 90.800781 
L 10.8 10.8 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="patch_4">
<path d="M 441.890641 90.800781 
L 441.890641 10.8 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="patch_5">
<path d="M 10.8 90.800781 
L 441.890641 90.800781 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="patch_6">
<path d="M 10.8 10.8 
L 441.890641 10.8 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="patch_7">
<path d="M 363.357234 30.269894 
Q 391.882128 40.206208 419.351211 49.774743 
" style="fill: none; stroke: currentColor; stroke-linecap: round"/>
<path d="M 416.231729 46.570241 
L 419.351211 49.774743 
L 414.91592 50.347628 
" style="fill: none; stroke: currentColor; stroke-linecap: round"/>
</g>
<g id="text_7">
<text style="font-size: 10px; text-anchor: start" x="303.81404" y="25.200141" transform="rotate(-0 303.81404 25.200141)">order 108: 240</text>
</g>
</g>
</g>
<defs>
<clipPath id="pabe525e23f">
<rect x="10.8" y="10.8" width="431.090641" height="80.000781"/>
</clipPath>
</defs>
</svg><figcaption>Box plot of the nine known delivery times. The box (Q1 = 32 to Q3 = 45) and whiskers cover everything from 25 to 52; order 108's 240 sits alone far to the right, beyond the upper fence of 64.5.</figcaption></figure>
  <p>The picture makes the decision feel obvious, but notice what the more familiar "z-score" rule would have said. A <strong>z-score</strong> measures how many standard deviations a value is from the mean, and a common rule flags values with z above 3:</p>
  <div class="fx" data-lang="py">m = mins.dropna()
z = (m - m.mean()) / m.std()
print("z-score of 240:", round(z.max(), 2), "-&gt; the 'z &gt; 3' rule misses it")</div>
  <div class="fx" data-lang="text">z-score of 240: 2.65 -&gt; the 'z &gt; 3' rule misses it</div>
  <p>The 240 scores only 2.65, so the z-rule misses it. The outlier inflates the very mean and standard deviation that are used to judge it, a problem called <strong>masking</strong>. On small samples it is even mathematically impossible to reach z = 3 (with 9 values the largest possible z is about 2.67). This is why the IQR rule, or the median, is preferred for spotting outliers in messy data.</p>
  <p>Once a value is flagged, there are a few options, and the choice depends on what the value means:</p>
  <div class="fx" data-lang="py">fixed = mins.mask(mins &gt; 120)                 # domain rule: app cancels after 2 hours
capped = mins.clip(upper=64.5)                # winsorise: pull extremes to the fence
print("domain rule:", fixed.tolist())
print("capped:     ", capped.tolist())</div>
  <div class="fx" data-lang="text">domain rule: [32.0, 41.0, 38.0, nan, 28.0, 25.0, 45.0, nan, 52.0, nan, 35.0]
capped:      [32.0, 41.0, 38.0, nan, 28.0, 25.0, 45.0, 64.5, 52.0, nan, 35.0]</div>
  <p>Biteful's app cancels any delivery that is still open after two hours, so 240 minutes is impossible: a logging error. The right fix is a domain rule, "anything above 120 minutes is not a real delivery time", applied with <code>mask</code>, which replaces values where the condition is True with NaN. That is different from <strong>capping</strong> (also called winsorising), shown second: <code>clip(upper=64.5)</code> pulls extreme values in to the fence but keeps the row's information that the delivery was slow. Capping suits rare but real values when you want to stop them dominating a chart or a model. Deleting every flagged value automatically is the mistake to avoid: the biggest orders and the slowest deliveries are often exactly what the business needs to see. Flag with statistics, decide with domain knowledge, and record what you changed. Quartiles, spread and robust statistics are covered in depth in <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>.</p>

  <h2 id="pdc-check"><span class="num">10</span>A Repeatable Cleaning Function</h2>
  <p>Every problem on our list now has a fix. But fixes scattered across a notebook, run by hand in whatever order you remember, will be applied differently tomorrow, or forgotten when the new export arrives. And order matters: text must be tidied before de-duplicating (or "MUMBAI" and "Mumbai" copies will not match), digits must be extracted before coercing (or "28 min" is lost), and minutes must be numeric before an outlier rule can compare them. Think of a pilot's pre-flight checklist: the same items, in the same order, every flight, however experienced the pilot. In code, the checklist is a function that takes the raw table and returns a clean one, without changing its input:</p>
  <div class="fx" data-lang="py">def clean_orders(raw: pd.DataFrame) -&gt; pd.DataFrame:
    df = raw.drop_duplicates().copy()                                   # 1 duplicates
    df["city"] = df["city"].str.strip().str.title().astype("category")  # 2 text, category
    df["restaurant"] = df["restaurant"].str.strip()
    df["customer"] = df["customer"].str.strip()
    digits = df["delivery_minutes"].astype("str").str.extract(r"(\\d+)", expand=False)
    df["delivery_minutes"] = pd.to_numeric(digits, errors="coerce")     # 3 types
    df.loc[df["delivery_minutes"] &gt; 120, "delivery_minutes"] = np.nan   # 4 impossible values
    df["order_time"] = pd.to_datetime(df["order_time"])                 # 5 dates
    return df.reset_index(drop=True)                                    # amount NaN kept on purpose

clean = clean_orders(orders)
print(clean)
clean.info()</div>
  <div class="fx" data-lang="text">    order_id customer    restaurant    city          order_time  amount  delivery_minutes
0        101     Asha      Dosa Hut    Pune 2026-03-02 12:10:00   240.0              32.0
1        102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0              41.0
2        103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0              38.0
3        104     Asha  Biryani Bros    Pune 2026-03-03 13:15:00   380.0               NaN
4        105      Dia    Green Bowl  Mumbai 2026-03-03 19:45:00   310.0              28.0
5        106      Ben      Dosa Hut    Pune 2026-03-04 12:40:00   180.0              25.0
6        107     Esha   Pizza Point  Mumbai 2026-03-04 21:10:00     NaN              45.0
7        108     Chen    Momo Magic    Pune 2026-03-05 18:20:00   260.0               NaN
8        109    Farah  Biryani Bros  Mumbai 2026-03-05 20:05:00   600.0              52.0
9        110     Asha    Green Bowl    Pune 2026-03-06 13:00:00   290.0               NaN
10       111      Dia   Pizza Point  Mumbai 2026-03-06 20:50:00   700.0              35.0
&lt;class 'pandas.DataFrame'&gt;
RangeIndex: 11 entries, 0 to 10
Data columns (total 7 columns):
 #   Column            Non-Null Count  Dtype         
---  ------            --------------  -----         
 0   order_id          11 non-null     int64         
 1   customer          11 non-null     str           
 2   restaurant        11 non-null     str           
 3   city              11 non-null     category      
 4   order_time        11 non-null     datetime64[us]
 5   amount            10 non-null     float64       
 6   delivery_minutes  8 non-null      float64       
dtypes: category(1), datetime64[us](1), float64(2), int64(1), str(2)
memory usage: 687.0 bytes</div>
  <p>Read it step by step. <code>drop_duplicates()</code> removes the repeated order, and <code>.copy()</code> makes it explicit that we are building a new table, so later assignments never touch the raw data. The city is stripped, title-cased and stored as a category. The delivery column is converted with <code>astype("str")</code> first, so the function also works on days when that column arrives as numbers, then digits are extracted and coerced. The impossible values are set to NaN with a single <code>.loc[mask, column] = value</code> assignment, which selects rows and column in one step. Dates are parsed (a no-op when they already are dates). The amount gap is deliberately left alone, because we decided in section 03 that unknown revenue stays unknown. The result has 11 rows, two cities stored as a category, and numeric minutes with 8 known values, and <code>info()</code> confirms every dtype.</p>
  <p>A good test of a cleaning function is whether it works on data it has never seen. Here we take the order generator from <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>, make 200,000 orders, sprinkle the same kinds of mess over them at random ("min" suffixes, "unknown", impossible 240s, lower-case cities with spaces, blank amounts) and duplicate 1% of the rows:</p>
  <div class="fx" data-lang="py">messy = make_messy(200_000)          # generator from Basics + random mess, 1% duplicated rows
print("messy:", messy.shape, "| city spellings:", messy["city"].nunique(),
      "| duplicate rows:", messy.duplicated().sum())
t = time.perf_counter()
big_clean = clean_orders(messy)
print("clean:", big_clean.shape, "| cities:", big_clean["city"].cat.categories.tolist(),
      f"| {time.perf_counter() - t:.2f} s")
print("missing:", big_clean.isna().sum()[lambda s: s &gt; 0].to_dict())</div>
  <div class="fx" data-lang="text">messy: (202000, 7) | city spellings: 4 | duplicate rows: 2000
clean: (200000, 7) | cities: ['Mumbai', 'Pune'] | 0.26 s
missing: {'amount': 1950, 'delivery_minutes': 2986}</div>
  <p>202,000 messy rows with four city spellings and 2,000 duplicates go in; 200,000 rows with two cities come out in about a quarter of a second (timings are approximate and depend on the machine). It is fast because every step is a whole-column operation; there is no Python loop over rows anywhere. The remaining missing values are exactly the ones we chose to keep: unknown amounts, and delivery times that were "unknown" or impossible.</p>
  <p>Two working habits go with the function. Keep the raw file untouched and write the clean result somewhere else, so a wrong cleaning decision can always be undone by fixing the function and re-running it. And never clean by editing cells by hand: a manual fix cannot be repeated tomorrow, reviewed by a colleague, or applied to next month's data.</p>

  <h2 id="pdc-valid"><span class="num">11</span>Validating the Result</h2>
  <p>A cleaning function encodes what you <em>did</em>. Validation states what must be <em>true</em> afterwards, and checks it. Without it, "the data is clean" is a feeling; with it, it is a set of rules that fail loudly on the day the app starts exporting "Bengaluru" or a new bug creates negative amounts. <strong>Data validation</strong> means checking a table against explicit rules about its contents: uniqueness of ids, allowed values, plausible ranges, acceptable levels of missing data.</p>
  <p>The simplest tool is Python's <code>assert</code> statement, which does nothing when its condition is true and stops the program with an <code>AssertionError</code> when it is false:</p>
  <div class="fx" data-lang="py">assert clean["order_id"].is_unique
assert set(clean["city"].cat.categories) == {"Mumbai", "Pune"}
assert clean["delivery_minutes"].dropna().between(5, 120).all()
print("all checks passed")
try:
    assert orders["order_id"].is_unique, "duplicate order ids"
except AssertionError as e:
    print("AssertionError on the raw table:", e)</div>
  <div class="fx" data-lang="text">all checks passed
AssertionError on the raw table: duplicate order ids</div>
  <p>Three rules pass on the clean table: order ids are unique, the only cities are Mumbai and Pune, and every known delivery time is between 5 and 120 minutes. The same uniqueness rule on the raw table fails immediately with the message we attached. Assertions placed at the end of a cleaning step act like the ticks on the pilot's checklist.</p>
  <p>Assertions stop at the first failure, which is fine inside a pipeline but not very informative. For a report on a new data source it is more useful to check every rule and list all the problems at once:</p>
  <div class="fx" data-lang="py">def check_orders(df):
    """Return a list of broken rules (empty list = clean)."""
    problems = []
    if not df["order_id"].is_unique:
        problems.append(f"{df['order_id'].duplicated().sum()} repeated order_id")
    bad_city = set(df["city"].dropna().astype(str)) - {"Mumbai", "Pune"}
    if bad_city:
        problems.append(f"unknown cities {sorted(bad_city)}")
    m = pd.to_numeric(df["delivery_minutes"], errors="coerce")
    if (m &gt; 120).any():
        problems.append(f"deliveries over 120 min: {(m &gt; 120).sum()}")
    if (df["amount"] &lt; 0).any():
        problems.append("negative amounts")
    share = df["amount"].isna().mean()
    if share &gt; 0.10:
        problems.append(f"{share:.0%} of amounts missing")
    return problems

print("raw:  ", check_orders(orders))
print("clean:", check_orders(clean))</div>
  <div class="fx" data-lang="text">raw:   ['1 repeated order_id', "unknown cities [' pune', 'MUMBAI']", 'deliveries over 120 min: 1']
clean: []</div>
  <p>On the raw export, the function finds three broken rules at once: a repeated order id, two unknown city spellings, and an impossible delivery time. On the clean table the list is empty. The missing-amount rule allows up to 10% gaps, which both tables meet (one amount in eleven or twelve), but if a broken export suddenly lost half its amounts, the check would say so rather than letting a halved revenue figure reach a dashboard. In production, teams often express such rules with libraries such as pandera or Great Expectations, which add readable schemas and reports, but the idea is exactly this function: write the rules down, run them on every load, and treat a failure as a stop sign. With a trustworthy table, the next step is to summarise it by group and combine it with other tables, which is the subject of <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>.</p>

  <h2 id="pdc-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake with missing data is testing for it with <code>==</code>. Because NaN is not equal to anything, the comparison is always False, and the code silently finds nothing:</p>
  <div class="fx" data-lang="py">d = clean.copy()
print("== np.nan finds:", (d["amount"] == np.nan).sum(), "| isna finds:", d["amount"].isna().sum())</div>
  <div class="fx" data-lang="text">== np.nan finds: 0 | isna finds: 1</div>
  <p>The equality test finds 0 missing amounts; <code>isna()</code> finds the one that is really there. Always use <code>isna()</code> or <code>notna()</code>.</p>
  <p>A second mistake catches people who learned pandas before version 3. Under <strong>copy-on-write</strong>, the default since pandas 3, any object you get by selecting from a DataFrame behaves as an independent copy. So the two classic one-liners below, which modify a selection of a column rather than the DataFrame itself, change nothing in <code>d</code>:</p>
  <div class="fx" data-lang="py">d = clean.copy()
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    d["amount"].fillna(0, inplace=True)                     # chained: works on a copy
    d[d["city"] == "Pune"]["delivery_minutes"] = 0          # chained: works on a copy
print([x.category.__name__ for x in w])
print("amount still missing:", d["amount"].isna().sum())

d["amount"] = d["amount"].fillna(0)                         # assign the result back
d.loc[d["city"] == "Pune", "delivery_minutes"] = 0          # one-step .loc
print("amount still missing:", d["amount"].isna().sum(),
      "| Pune minutes:", d.loc[d["city"] == "Pune", "delivery_minutes"].unique().tolist())</div>
  <div class="fx" data-lang="text">['ChainedAssignmentError', 'ChainedAssignmentError']
amount still missing: 1
amount still missing: 0 | Pune minutes: [0.0]</div>
  <p>Both lines raise a <code>ChainedAssignmentError</code> warning, and the amount is still missing afterwards. <code>d["amount"].fillna(0, inplace=True)</code> fills a temporary copy of the column, and <code>d[mask]["col"] = 0</code> writes into a temporary filtered copy. (In pandas 2 the first sometimes worked and the second gave the famous <code>SettingWithCopyWarning</code>.) The fixes are to assign the result back to the column, and to use a single <code>.loc[rows, column] = value</code> step, after which the gap is filled and Pune's minutes are 0.</p>
  <p>The remaining mistakes have all appeared earlier, and they share one cause: treating cleaning as a sequence of functions rather than a sequence of decisions. Filling with 0 by reflex turned an unknown amount into a free order and dragged the mean from 393.0 to 357.3. Filling money with a median invented ₹610 of revenue. Coercing to numbers before extracting digits destroyed the 28 in "28 min". Letting <code>to_datetime</code> guess turned 4 January into 1 April. Placeholders such as "unknown" hid from <code>isna()</code> until we told <code>read_csv</code> about them. De-duplicating before tidying text misses copies that differ only in capitalisation. Deleting every outlier removes real events along with errors. And cleaning by hand, or overwriting the raw file, makes every one of these decisions impossible to review or undo.</p>

  <h2 id="pdc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Data cleaning</b>: making a table fit for purpose: each thing once, right types, valid or explicitly missing values, one spelling per category.</li>
    <li><b>NaN</b>: floating-point "not a number", the missing marker in float and <code>str</code> columns. <b><code>pd.NA</code></b>: marker in nullable types (<code>Int64</code>, <code>boolean</code>). <b><code>NaT</code></b>: missing date. <code>None</code> is converted to one of these.</li>
    <li><b>Imputation</b>: filling missing values with estimates. <b>MCAR / MAR / MNAR</b>: missing completely at random / depending on other known columns / depending on the missing value itself.</li>
    <li><b>Duplicate</b>: a row equal to another in the chosen columns.</li>
    <li><b><code>.str</code> accessor</b>: string methods applied to every value of a text Series; NaN passes through.</li>
    <li><b>Categorical</b>: categories stored once plus an integer code per row; can be ordered. <b>Cardinality</b>: number of distinct values.</li>
    <li><b>IQR rule</b>: flag values below Q1 − 1.5·IQR or above Q3 + 1.5·IQR, where IQR = Q3 − Q1.</li>
    <li><b>Validation</b>: checking a table against explicit rules (unique ids, allowed values, ranges, missing share).</li>
  </ul>
  <h3>Missing-value decisions</h3>
  <table class="tbl">
    <tr><th>Choice</th><th>Claims</th><th>Order 107's amount</th><th>Use when</th></tr>
    <tr><td>Leave NaN</td><td>"unknown"</td><td>total 3930, mean 393.0 (of 10)</td><td>row is real, value unknown</td></tr>
    <tr><td><code>dropna</code></td><td>"row didn't happen"</td><td>10 rows</td><td>row useless without the value</td></tr>
    <tr><td><code>fillna(0)</code></td><td>"value was zero"</td><td>mean 357.3</td><td>you know it is zero (no tip)</td></tr>
    <tr><td><code>fillna(median)</code></td><td>"value was typical"</td><td>total 4540 (group median)</td><td>model input, with a missing flag, fitted on train only</td></tr>
    <tr><td><code>interpolate</code> / <code>ffill</code></td><td>"between its neighbours"</td><td>n/a</td><td>ordered, smooth measurements; <code>limit_area="inside"</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">df.info(); df.isna().sum(); df.duplicated().sum()
df["col"].value_counts(); df["col"].unique()
pd.read_csv(path, na_values=["unknown", "n/a"])

df.dropna(subset=["amount"])                 # how="all", thresh=n, axis=1
df["amount"].fillna(0)                       # or a value / aligned Series
df["flag"] = df["amount"].isna()             # record before filling
s.ffill(); s.bfill(); s.interpolate(limit_area="inside")
s.sum(min_count=1); s.mean(skipna=False)

df.drop_duplicates(subset=["order_id"], keep="last")   # keep="first" | False
df["city"].str.strip().str.title()
df["col"].str.contains("x", case=False, regex=False)
df["col"].str.extract(r"(\\d+)", expand=False)

pd.to_numeric(s, errors="coerce")            # check s[conv.isna() &amp; s.notna()]
s.astype("Int64")                            # integers with &lt;NA&gt;
pd.to_datetime(s, format="%d/%m/%Y", errors="coerce")
s.astype("category"); pd.cut(s, bins=[0, 300, 500, np.inf], labels=[...])

q1, q3 = s.quantile([0.25, 0.75]); iqr = q3 - q1
s.mask(s &gt; 120); s.clip(upper=q3 + 1.5 * iqr)
df.loc[mask, "col"] = value                  # one-step assignment
assert df["order_id"].is_unique</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>x == np.nan</code> is always False; use <code>isna()</code>.</li>
    <li>One NaN turns an integer column into float; use <code>Int64</code> to keep integers.</li>
    <li>Sums skip NaN silently, and an all-NaN sum is 0; report counts.</li>
    <li>"unknown", "n/a", "-" are text until you pass <code>na_values</code>.</li>
    <li>Mean-filling keeps the mean but shrinks the spread; MNAR gaps bias even the known values.</li>
    <li>Extract before <code>errors="coerce"</code>, then list what became NaN.</li>
    <li>Pass <code>format=</code> to <code>to_datetime</code> for non-ISO dates.</li>
    <li><code>.str.contains</code> is regex by default; <code>.str.replace</code> is literal by default.</li>
    <li>Category helps only for low cardinality.</li>
    <li>z-scores miss outliers that inflate the standard deviation; prefer IQR.</li>
    <li>pandas 3 copy-on-write: chained assignment and <code>df[col].method(inplace=True)</code> do nothing; assign back or use <code>.loc</code>.</li>
  </ul>

  <h2 id="pdc-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the first thing you do with a new dataset before analysing it?</summary><div class="qa-body">Scan it for problems before changing anything: <code>info()</code> for types and non-null counts, <code>isna().sum()</code> for gaps, <code>duplicated().sum()</code> for repeated rows, <code>value_counts()</code> and <code>unique()</code> on categorical and suspicious columns, and <code>describe()</code> for impossible ranges. Then make a list of problems and decide on each one, rather than fixing whatever you notice first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between NaN, None and pd.NA?</summary><div class="qa-body">NaN is a floating-point "not a number" value used as the missing marker in float columns (and in pandas 3's <code>str</code> columns). None is Python's null object; pandas converts it to NaN or NA depending on the column's type. <code>pd.NA</code> is the marker for pandas' nullable types such as <code>Int64</code> and <code>boolean</code>, which keep integers as integers. <code>isna()</code> detects all of them, plus <code>NaT</code> for dates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>np.nan == np.nan</code> False, and how do you find missing values?</summary><div class="qa-body">The IEEE floating-point standard defines NaN as unequal to every value, including itself, because two unknowns cannot be claimed equal. So comparisons with <code>==</code> never find missing values. Use <code>isna()</code> / <code>notna()</code>, and <code>df.isna().any(axis=1)</code> for rows with any gap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does an integer column become float when it has a missing value?</summary><div class="qa-body">The default missing marker, NaN, is a floating-point value, and a NumPy-backed column holds a single type, so pandas upcasts the whole column to <code>float64</code>. To keep integers, use the nullable <code>Int64</code> dtype (<code>astype("Int64")</code> or <code>convert_dtypes()</code>), which stores missing values as <code>pd.NA</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does pandas treat missing values in sum, mean and count?</summary><div class="qa-body">By default (<code>skipna=True</code>) they are skipped: sum adds the known values, mean divides by the number of known values, and count returns that number, while <code>len</code> and <code>size</code> count rows. The sum of an all-missing column is 0 unless you pass <code>min_count=1</code>. Report counts alongside sums so skipped gaps are visible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decide whether to drop or fill missing values?</summary><div class="qa-body">By what the gap means. Drop rows only when they are useless without the value. Fill with a constant when you know the true value (a blank tip is 0). Impute a typical value when a model needs numbers, adding a missing-indicator column and fitting the fill on training data. Interpolate only ordered, smoothly varying measurements. Otherwise leave the value missing and report how many are missing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the risks of mean or median imputation?</summary><div class="qa-body">It makes the data look less varied than it is, because many values now sit exactly on the centre, so standard deviations, confidence intervals and tests become overconfident. It weakens correlations with other columns. If values are missing not at random, the known values are already biased and imputation cements the bias. And computing the fill on all data before a train/test split leaks test information into training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are MCAR, MAR and MNAR?</summary><div class="qa-body">Missing completely at random: missingness is unrelated to anything, so the known values are a fair sample. Missing at random: missingness depends on other observed columns (more gaps in one city), which you can adjust for using those columns. Missing not at random: it depends on the missing value itself (big orders fail to log), which biases the known values and cannot be fixed from the data alone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you remove duplicate customer records, keeping the most recent one?</summary><div class="qa-body">First inspect with <code>df[df["customer_id"].duplicated(keep=False)]</code> to see the copies. Then <code>df.sort_values("updated_at").drop_duplicates(subset=["customer_id"], keep="last")</code>. If the key is text, tidy it first (strip, case), or copies that differ only in spacing or capitalisation will not be detected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A column contains values like "28 min", "41" and "unknown". How do you make it numeric?</summary><div class="qa-body"><code>pd.to_numeric(s.str.extract(r"(\\d+)", expand=False), errors="coerce")</code> gives 28, 41 and NaN. Coercing directly would also turn "28 min" into NaN. Afterwards, check what was lost with <code>s[converted.isna() &amp; s.notna()]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>errors="raise"</code> and <code>errors="coerce"</code>?</summary><div class="qa-body"><code>raise</code> (the default) stops at the first value that cannot be converted and says which one, so nothing is lost silently. <code>coerce</code> converts what it can and turns the rest into NaN (or NaT for dates). Coerce is convenient for known junk such as "unknown", but it hides problems, so always count and inspect the values it turned into missing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you pass <code>format=</code> to <code>pd.to_datetime</code>?</summary><div class="qa-body">Without it, pandas infers a pattern from the first value. For day-first data such as "04/01/2025" it may assume month-first, turning 4 January into 1 April and making every date with a day above 12 fail to NaT, with no error. An explicit format such as <code>"%d/%m/%Y"</code> (or <code>dayfirst=True</code>) removes the guess.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the category dtype help, and when does it hurt?</summary><div class="qa-body">It helps for low-cardinality columns such as city, status or weekday: a million city names drop from about 54 MB to about 1 MB, groupby gets faster, and ordered categories sort and compare correctly. It hurts for high-cardinality columns such as ids, where the category list is as large as the data and the column gets bigger.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect outliers, and what do you do with them?</summary><div class="qa-body">A robust method is the IQR rule: flag values below Q1 − 1.5·IQR or above Q3 + 1.5·IQR. Z-scores are less reliable because the outlier inflates the mean and standard deviation used to judge it (masking). Then decide with domain knowledge: correct or set impossible values to NaN, cap rare but real values for charts or models, and keep real extremes in the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>df["amount"].fillna(0, inplace=True)</code> not change <code>df</code> in pandas 3?</summary><div class="qa-body">Since pandas 3, copy-on-write is always on: <code>df["amount"]</code> behaves as a separate copy, so the in-place fill modifies that copy and pandas warns with <code>ChainedAssignmentError</code>. Write <code>df["amount"] = df["amount"].fillna(0)</code>, or use <code>df.loc[mask, "col"] = value</code> for conditional updates. The same applies to <code>df[mask]["col"] = value</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make a cleaning process reliable in production?</summary><div class="qa-body">Put every step in one function that takes raw data and returns clean data without modifying its input, so it runs identically on every new file. Keep the raw data unchanged. Add validation after cleaning: assertions or a rule-checking function (or a library such as pandera or Great Expectations) for unique ids, allowed values, ranges and acceptable missing rates, and stop the pipeline when a rule fails.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does the order of cleaning steps matter?</summary><div class="qa-body">Each fix enables the next. Text must be tidied before de-duplicating, or "MUMBAI" and "Mumbai" copies look different. Digits must be extracted before numeric conversion, or "28 min" is lost. Values must be numeric before outlier rules can compare them, and flagged values then feed back into the missing-value decision.</div></details>
</main>
`
});
