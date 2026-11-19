// notes/dataanalysis/da_pd_groupby.js — GroupBy, Merge & Reshape
Object.assign(TOPIC_CONTENT, {
  "da_pd_groupby": `<main>
<h1>GroupBy, Merge &amp; Reshape</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>GroupBy, Merge &amp; Reshape</span></div>
  <p class="lead">Once a table is clean, almost every business question asks for one of three things. Some questions are about groups: which city earns more, which restaurant is slowest. Some need facts kept in another table: which cuisine sells best, which plan our best customers are on. And some are about layout: the manager wants days down the side and cities across the top. Pandas answers these with three families of tools: <code>groupby</code> for summarising rows by group, <code>merge</code>, <code>join</code> and <code>concat</code> for combining tables, and <code>pivot_table</code>, <code>melt</code>, <code>stack</code> and <code>unstack</code> for reshaping. This page uses Biteful's eleven cleaned orders from <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>, plus two small lookup tables, so every result can be checked by hand, and then runs the same code on a million generated orders. The code runs on pandas 3.1.</p>

  <h2 id="pdg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">GroupBy, Merge &amp; Reshape</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">GroupBy</div>
        <ul>
          <li>Split rows by key, apply a function, combine the results</li>
          <li><code>size</code> counts rows, <code>count</code> counts known values</li>
          <li>Named aggregation: <code>agg(new=(col, func))</code></li>
          <li>NaN keys are dropped unless <code>dropna=False</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four ways to apply</div>
        <ul>
          <li><b>agg</b>: one row per group (SQL GROUP BY)</li>
          <li><b>transform</b>: group value on every row (window function)</li>
          <li><b>filter</b>: keep or drop whole groups (HAVING)</li>
          <li><b>apply</b>: any function, but slow; vectorise instead</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Combining tables</div>
        <ul>
          <li><code>merge(on, how)</code>: inner, left, right, outer</li>
          <li>Duplicate keys multiply rows (fan-out)</li>
          <li>Guard with <code>validate=</code> and row-count checks</li>
          <li><code>join</code> on the index; <code>concat</code> stacks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reshaping</div>
        <ul>
          <li>Long: one row per fact; wide: one column per category</li>
          <li><code>pivot_table</code> aggregates (default mean!); <code>pivot</code> cannot</li>
          <li><code>melt</code> and <code>stack</code> go back to long</li>
          <li><code>crosstab</code> counts combinations</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdg-data"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Three Tables</span><span class="rm-sub">orders, restaurants, customers, and keys</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-sac"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Split-Apply-Combine</span><span class="rm-sub">how groupby works, size vs count, several keys</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-named"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Named Aggregation</span><span class="rm-sub">several summaries with readable names</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-atf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">agg, transform and filter</span><span class="rm-sub">three different output shapes</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-apply"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GroupBy.apply and Its Cost</span><span class="rm-sub">the flexible tool, and why to avoid it</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-merge"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Merge and Join Types</span><span class="rm-sub">who survives inner, left, right and outer</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-fan"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Row-Count Checks and validate=</span><span class="rm-sub">fan-out, key types, guards at scale</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-concat"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">join and concat</span><span class="rm-sub">combining by index, and stacking</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pivot"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">pivot_table, pivot and melt</span><span class="rm-sub">long to wide and back</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-stack"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">stack, unstack and crosstab</span><span class="rm-sub">moving keys, counting combinations</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong totals that look right</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">shapes, join types, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">groupby, joins and reshaping questions</span></div></div>
    </div>
  </div>

  <h2 id="pdg-data"><span class="num">01</span>The Three Tables</h2>
  <p>We start where the cleaning page finished: Biteful's eleven orders from 2–6 March, with the duplicate removed, cities spelt one way, delivery minutes numeric (the impossible 240 and the "unknown" are now NaN) and order 107's amount honestly missing. Alongside them sit two small lookup tables: one row per restaurant with its cuisine and rating, and one row per customer with their subscription plan. They are typed out here so the page runs on its own:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)
orders = pd.DataFrame({
    "order_id":   [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111],
    "customer":   ["Asha", "Ben", "Chen", "Asha", "Dia", "Ben", "Esha", "Chen", "Farah", "Asha", "Dia"],
    "restaurant": ["Dosa Hut", "Biryani Bros", "Pizza Point", "Biryani Bros", "Green Bowl", "Dosa Hut",
                   "Pizza Point", "Momo Magic", "Biryani Bros", "Green Bowl", "Pizza Point"],
    "city":       ["Pune", "Mumbai", "Pune", "Pune", "Mumbai", "Pune", "Mumbai", "Pune", "Mumbai", "Pune", "Mumbai"],
    "order_time": pd.to_datetime(["2026-03-02 12:10", "2026-03-02 13:05", "2026-03-02 20:30", "2026-03-03 13:15",
                                  "2026-03-03 19:45", "2026-03-04 12:40", "2026-03-04 21:10", "2026-03-05 18:20",
                                  "2026-03-05 20:05", "2026-03-06 13:00", "2026-03-06 20:50"]),
    "amount":     [240, 450, 520, 380, 310, 180, np.nan, 260, 600, 290, 700],
    "delivery_minutes": [32, 41, 38, np.nan, 28, 25, 45, np.nan, 52, np.nan, 35],
})
restaurants = pd.DataFrame({
    "restaurant": ["Dosa Hut", "Biryani Bros", "Pizza Point", "Green Bowl", "Tandoor Tales"],
    "cuisine":    ["South Indian", "Biryani", "Pizza", "Salads", "North Indian"],
    "rating":     [4.4, 4.1, 3.9, 4.6, 4.2],
})
customers = pd.DataFrame({
    "customer": ["Asha", "Ben", "Chen", "Dia", "Esha", "Gita"],
    "plan":     ["gold", "free", "gold", "free", "free", "gold"],
})
print(orders[["order_id", "customer", "restaurant", "city", "amount", "delivery_minutes"]])</div>
  <div class="fx" data-lang="text">    order_id customer    restaurant    city  amount  delivery_minutes
0        101     Asha      Dosa Hut    Pune   240.0              32.0
1        102      Ben  Biryani Bros  Mumbai   450.0              41.0
2        103     Chen   Pizza Point    Pune   520.0              38.0
3        104     Asha  Biryani Bros    Pune   380.0               NaN
4        105      Dia    Green Bowl  Mumbai   310.0              28.0
5        106      Ben      Dosa Hut    Pune   180.0              25.0
6        107     Esha   Pizza Point  Mumbai     NaN              45.0
7        108     Chen    Momo Magic    Pune   260.0               NaN
8        109    Farah  Biryani Bros  Mumbai   600.0              52.0
9        110     Asha    Green Bowl    Pune   290.0               NaN
10       111      Dia   Pizza Point  Mumbai   700.0              35.0</div>
  <p>The two lookup tables have deliberate gaps, because real ones always do, and these gaps are what will make the different join types behave differently later. Momo Magic, which received order 108, is missing from the restaurants table, while Tandoor Tales is listed but has no orders. Gita has a customer profile but never ordered, while Farah placed order 109 but has no profile.</p>
  <p>Combining tables depends on <strong>keys</strong>. A key is a column whose values identify the thing a row is about: <code>restaurant</code> identifies a restaurant, <code>customer</code> a customer. The orders table is a <strong>fact table</strong>: it records events, so the same restaurant appears on many rows. The restaurants and customers tables are <strong>lookup tables</strong> (also called dimension tables): they describe things, so each key <em>should</em> appear exactly once. Think of a shop with three ledgers: the daily sales book, the supplier register and the loyalty-card list. Each ledger answers some questions by itself, but the interesting questions need two of them side by side, matched by name. Keep the word "should" in mind; section 07 shows what happens when a lookup table breaks that promise.</p>

  <h2 id="pdg-sac"><span class="num">02</span>Split-Apply-Combine</h2>
  <p>Our first question is "how much revenue did each city bring in?" With the selection tools from <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>, the natural approach is a loop: for each city, select that city's rows with a mask and sum their amounts.</p>
  <div class="fx" data-lang="py">totals = {}
for city in orders["city"].unique():                 # one pass over the table per city
    totals[city] = float(orders.loc[orders["city"] == city, "amount"].sum())
print(totals)</div>
  <div class="fx" data-lang="text">{'Pune': 1870.0, 'Mumbai': 2060.0}</div>
  <p>The answer is right: Pune 1870, Mumbai 2060. But look at what the loop does. For every city it compares the whole city column against that city's name, so with 50 cities it scans the table 50 times, and the result is a plain dictionary that we would have to turn back into a table. If we then wanted the mean as well, or the revenue per restaurant, we would write another loop each time. This pattern, "for each group, compute something, collect the results", is so common in data analysis that pandas has a single operation for it.</p>
  <p>That operation is called <strong>split-apply-combine</strong>, a name coined by Hadley Wickham, and pandas implements it with <code>groupby</code>. It has three steps. <em>Split</em>: divide the rows into groups, one per distinct value of the key. <em>Apply</em>: run a function on each group independently. <em>Combine</em>: put the per-group results together into a new table indexed by the key. Think of counting a day's receipts by branch: you sort the receipts into one pile per branch, add up each pile, and write the totals on one summary sheet. A groupby object lets you watch the split step directly, because looping over it gives each group's key and its sub-table:</p>
  <div class="fx" data-lang="py">for city, pile in orders.groupby("city"):
    print(f"{city}: orders {pile['order_id'].tolist()}  amounts {pile['amount'].tolist()}")</div>
  <div class="fx" data-lang="text">Mumbai: orders [102, 105, 107, 109, 111]  amounts [450.0, 310.0, nan, 600.0, 700.0]
Pune: orders [101, 103, 104, 106, 108, 110]  amounts [240.0, 520.0, 380.0, 180.0, 260.0, 290.0]</div>
  <p>The Mumbai pile holds orders 102, 105, 107, 109 and 111; the Pune pile holds the other six. Pandas builds these piles in a single pass over the data. For each row it looks up the key in a <strong>hash table</strong>, the same structure behind Python dictionaries (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>), which finds "the pile for Mumbai" in constant time, so the cost grows with the number of rows, not with rows × groups like the loop. By default the groups come out sorted by key, which is why Mumbai is printed before Pune. In practice you rarely loop over piles; you just say what to apply:</p>
  <div class="fx" data-lang="py">print(orders.groupby("city")["amount"].sum())</div>
  <div class="fx" data-lang="text">city
Mumbai    2060.0
Pune      1870.0
Name: amount, dtype: float64</div>
  <p>Read the line from left to right. <code>orders.groupby("city")</code> splits; <code>["amount"]</code> chooses which column to summarise; <code>.sum()</code> is the function applied to each pile; and the combined result is a Series whose index is the group key. Mumbai is 450 + 310 + 600 + 700 = 2060 (order 107's NaN is skipped, as sums always do), and Pune is 240 + 520 + 380 + 180 + 260 + 290 = 1870.</p>
  <p>That Mumbai total hides something, though: one of its five orders has no amount. Two built-in counts tell the difference:</p>
  <div class="fx" data-lang="py">g = orders.groupby("city")["amount"]
print(pd.DataFrame({"size": g.size(), "count": g.count(), "sum": g.sum(), "mean": g.mean().round(1)}))</div>
  <div class="fx" data-lang="text">        size  count     sum   mean
city                              
Mumbai     5      4  2060.0  515.0
Pune       6      6  1870.0  311.7</div>
  <p><code>size()</code> counts the rows in each group, so Mumbai has 5. <code>count()</code> counts the non-missing values, so Mumbai has 4. The mean divides by the count, not the size: Mumbai's 2060 / 4 = 515.0, Pune's 1870 / 6 = 311.7. A report that says "Mumbai: 5 orders, ₹2,060" without the 4 hides an unknown amount, so put both counts beside any sum or mean.</p>
  <p>Missing values in the <em>key</em> column behave differently, and more dangerously. Suppose order 111's city had not been recorded:</p>
  <div class="fx" data-lang="py">o2 = orders.copy()
o2.loc[o2["order_id"] == 111, "city"] = np.nan        # pretend 111's city was not recorded
print(o2.groupby("city")["amount"].sum().to_dict())
print(o2.groupby("city", dropna=False)["amount"].sum().to_dict())</div>
  <div class="fx" data-lang="text">{'Mumbai': 1360.0, 'Pune': 1870.0}
{'Mumbai': 1360.0, 'Pune': 1870.0, nan: 700.0}</div>
  <p>By default, groupby drops rows whose key is NaN, so order 111's ₹700 vanishes: Mumbai falls to 1360 and the grand total no longer matches the table. Passing <code>dropna=False</code> keeps the missing key as its own group, and the ₹700 reappears under <code>nan</code>. If a key column can have gaps, use <code>dropna=False</code> or check that the group totals add up to the table total.</p>
  <p>You can also group by several keys at once by passing a list. Each distinct combination becomes one group:</p>
  <div class="fx" data-lang="py">s = orders.groupby(["city", "restaurant"])["amount"].sum()
print(s)
print(s.loc["Mumbai"].to_dict())
print(orders.groupby(["city", "restaurant"], as_index=False)["amount"].sum().head(3))</div>
  <div class="fx" data-lang="text">city    restaurant  
Mumbai  Biryani Bros    1050.0
        Green Bowl       310.0
        Pizza Point      700.0
Pune    Biryani Bros     380.0
        Dosa Hut         420.0
        Green Bowl       290.0
        Momo Magic       260.0
        Pizza Point      520.0
Name: amount, dtype: float64
{'Biryani Bros': 1050.0, 'Green Bowl': 310.0, 'Pizza Point': 700.0}
     city    restaurant  amount
0  Mumbai  Biryani Bros  1050.0
1  Mumbai    Green Bowl   310.0
2  Mumbai   Pizza Point   700.0</div>
  <p>The result has one row per (city, restaurant) pair that actually occurs: Mumbai's Biryani Bros orders are 450 + 600 = 1050, Pune's is 380. Pairs with no orders, such as Mumbai and Dosa Hut, simply do not appear. The index now has two levels, a structure called a <strong>MultiIndex</strong>, and you can select from it level by level: <code>s.loc["Mumbai"]</code> returns Mumbai's three restaurants. MultiIndexes are compact but awkward for further work, so it is common to turn the keys back into ordinary columns, either afterwards with <code>reset_index()</code> or up front with <code>as_index=False</code>, as in the last result.</p>

  <h2 id="pdg-named"><span class="num">03</span>Named Aggregation</h2>
  <p>One number per group is rarely enough. A restaurant manager wants, per restaurant, the number of orders, the revenue, the average delivery time and how many different customers ordered, all in one readable table. Running four separate groupbys and lining up the results by hand is tedious and error-prone. <code>agg</code> (short for aggregate) computes several summaries in one pass, and its <strong>named aggregation</strong> form lets you name each output column. Each keyword argument has the shape <code>new_name=(input_column, function)</code>:</p>
  <div class="fx" data-lang="py">per_rest = (orders.groupby("restaurant")
            .agg(orders=("order_id", "size"),
                 revenue=("amount", "sum"),
                 avg_minutes=("delivery_minutes", "mean"),
                 customers=("customer", "nunique"))
            .sort_values("revenue", ascending=False)
            .round(1))
print(per_rest)</div>
  <div class="fx" data-lang="text">              orders  revenue  avg_minutes  customers
restaurant                                           
Biryani Bros       3   1430.0         46.5          3
Pizza Point        3   1220.0         39.3          3
Green Bowl         2    600.0         28.0          2
Dosa Hut           2    420.0         28.5          2
Momo Magic         1    260.0          NaN          1</div>
  <p>Each keyword became one column, with exactly the name we chose. Check Biryani Bros by hand: orders 102, 104 and 109 give 3 orders and 450 + 380 + 600 = 1430 revenue; their delivery times 41, NaN and 52 average to (41 + 52) / 2 = 46.5; and three different people ordered. Momo Magic's only delivery time was the removed 240, so its average is NaN. The functions are given as names (<code>"size"</code>, <code>"sum"</code>, <code>"mean"</code>, <code>"nunique"</code>, which counts distinct values), and <code>sort_values</code> and <code>round</code> then tidy the result like any other table. Think of a school report card per class, with the number of students, the average mark and the top mark each in its own labelled column, instead of three lists you have to line up yourself.</p>
  <p>On a single column you can name the outputs directly, and you can mix built-in names with your own functions:</p>
  <div class="fx" data-lang="py">print(orders.groupby("city")["amount"].agg(cheapest="min", dearest="max", middle="median",
                                           spread=lambda s: s.max() - s.min()))
old = orders.groupby("city").agg({"amount": ["sum", "mean"], "delivery_minutes": "mean"})
print(old.columns.tolist())</div>
  <div class="fx" data-lang="text">        cheapest  dearest  middle  spread
city                                     
Mumbai     310.0    700.0   525.0   390.0
Pune       180.0    520.0   275.0   340.0
[('amount', 'sum'), ('amount', 'mean'), ('delivery_minutes', 'mean')]</div>
  <p>The first result has four named columns per city; Mumbai's spread, computed by our lambda, is 700 − 310 = 390. The difference between the two kinds of function matters for speed: a name such as <code>"min"</code> runs pandas' compiled code for all groups at once, while a <code>lambda</code> is ordinary Python called once per group. That is fine for two cities, but section 05 shows what it costs with thousands of groups. The second line shows the older dictionary style, <code>agg({"amount": ["sum", "mean"], ...})</code>. It still works, but it produces two-level column names such as <code>('amount', 'sum')</code>, which are clumsy to select and rename; named aggregation gives flat names you chose yourself.</p>

  <h2 id="pdg-atf"><span class="num">04</span>agg, transform and filter</h2>
  <p>Every result so far has had one row per group: the individual orders disappeared. Some questions need the orders to stay. "What share of its city's revenue is each order?" needs every order and its city's total on the same row. The obvious attempt is to compute the city totals and assign them as a new column:</p>
  <div class="fx" data-lang="py">o2 = orders.copy()
city_sum = o2.groupby("city")["amount"].sum()
print(city_sum.index.tolist(), "vs row labels", o2.index.tolist()[:4], "...")
o2["city_total"] = city_sum                              # labels don't match
print(o2["city_total"].tolist())</div>
  <div class="fx" data-lang="text">['Mumbai', 'Pune'] vs row labels [0, 1, 2, 3] ...
[nan, nan, nan, nan, nan, nan, nan, nan, nan, nan, nan]</div>
  <p>Every value is NaN. The reason is <strong>index alignment</strong>, which you met in <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>: when you assign a Series to a column, pandas matches rows by index label, not by position. The totals are labelled "Mumbai" and "Pune", the orders are labelled 0 to 10, no label matches, and every row gets NaN. What we need is a version of the group result that is indexed like the original rows. That is exactly what <strong><code>transform</code></strong> produces: it computes the same per-group value as <code>agg</code> and then writes it back onto every row of that group.</p>
  <div class="fx" data-lang="py">orders["city_total"] = orders.groupby("city")["amount"].transform("sum")
orders["share"] = (orders["amount"] / orders["city_total"]).round(2)
print(orders[["order_id", "city", "amount", "city_total", "share"]])</div>
  <div class="fx" data-lang="text">    order_id    city  amount  city_total  share
0        101    Pune   240.0      1870.0   0.13
1        102  Mumbai   450.0      2060.0   0.22
2        103    Pune   520.0      1870.0   0.28
3        104    Pune   380.0      1870.0   0.20
4        105  Mumbai   310.0      2060.0   0.15
5        106    Pune   180.0      1870.0   0.10
6        107  Mumbai     NaN      2060.0    NaN
7        108    Pune   260.0      1870.0   0.14
8        109  Mumbai   600.0      2060.0   0.29
9        110    Pune   290.0      1870.0   0.16
10       111  Mumbai   700.0      2060.0   0.34</div>
  <p>The <code>city_total</code> column holds 1870 on every Pune row and 2060 on every Mumbai row, and because it has the same 11 rows and index as <code>orders</code>, the share is an ordinary column division: order 101 is 240 / 1870 = 0.13, order 111 is 700 / 2060 = 0.34. Order 107's share is NaN, which is honest: an unknown amount has an unknown share. Think of exam results: <code>agg</code> produces the notice board with one average per class, while <code>transform</code> stamps each student's own sheet with their class average so they can compare. In SQL terms, <code>transform</code> is a window function, <code>SUM(amount) OVER (PARTITION BY city)</code> (see <a class="xref" data-note="sql_windows">Window Functions</a>).</p>
  <p>Because it keeps the rows, transform is the tool for any "compare each row with its group" question. Two more common uses: how much slower than its restaurant's usual time was each delivery, and where does each order rank within its city?</p>
  <div class="fx" data-lang="py">rest_avg = orders.groupby("restaurant")["delivery_minutes"].transform("mean")
orders["minutes_vs_rest"] = (orders["delivery_minutes"] - rest_avg).round(1)     # slower than usual?
orders["rank_in_city"] = orders.groupby("city")["amount"].rank(ascending=False)
print(orders[["order_id", "restaurant", "delivery_minutes", "minutes_vs_rest", "city", "amount", "rank_in_city"]].head(6))</div>
  <div class="fx" data-lang="text">   order_id    restaurant  delivery_minutes  minutes_vs_rest    city  amount  rank_in_city
0       101      Dosa Hut              32.0              3.5    Pune   240.0           5.0
1       102  Biryani Bros              41.0             -5.5  Mumbai   450.0           3.0
2       103   Pizza Point              38.0             -1.3    Pune   520.0           1.0
3       104  Biryani Bros               NaN              NaN    Pune   380.0           2.0
4       105    Green Bowl              28.0              0.0  Mumbai   310.0           4.0
5       106      Dosa Hut              25.0             -3.5    Pune   180.0           6.0</div>
  <p>Order 101 took 32 minutes against Dosa Hut's average of 28.5, so it was 3.5 minutes slower than usual; order 102 was 5.5 minutes faster than Biryani Bros' average. The rank uses <code>groupby(...).rank()</code>, a group-wise method that, like transform, returns one value per row: order 103 is Pune's biggest (rank 1) and 106 its smallest (rank 6). The same pattern fills gaps with a group statistic, as the cleaning page did with <code>fillna(df.groupby("restaurant")["amount"].transform("median"))</code>.</p>
  <p>The third shape keeps or drops whole groups. "Show me all orders from restaurants with at least two orders" is a condition on the group, not on any single row. <strong><code>filter</code></strong> calls your function once per group with that group's sub-table, and keeps all of the group's original rows when the function returns True:</p>
  <div class="fx" data-lang="py">regular = orders.groupby("restaurant").filter(lambda pile: len(pile) &gt;= 2)
print(sorted(regular["restaurant"].unique()), len(regular), "rows")</div>
  <div class="fx" data-lang="text">['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Pizza Point'] 10 rows</div>
  <p>Momo Magic has only one order, so its group fails the test and its row disappears; every other restaurant keeps all its rows, leaving 10. In SQL this is the <code>HAVING</code> clause, except that pandas returns the original rows rather than one summary row per group. Comparing the shapes side by side makes the difference between the three methods concrete:</p>
  <div class="fx" data-lang="py">gb = orders.groupby("restaurant")["amount"]
print("orders   :", orders.shape)
print("agg      :", gb.agg("sum").shape)
print("transform:", gb.transform("sum").shape)
print("filter   :", orders.groupby("restaurant").filter(lambda p: len(p) &gt;= 2).shape)</div>
  <div class="fx" data-lang="text">orders   : (11, 8)
agg      : (5,)
transform: (11,)
filter   : (10, 8)</div>
  <table class="tbl"><caption>Three output shapes</caption>
    <tr><th>Method</th><th>Returns</th><th>On our data</th><th>SQL equivalent</th></tr>
    <tr><td><code>agg</code></td><td>one row per group</td><td>5 restaurants</td><td><code>GROUP BY</code></td></tr>
    <tr><td><code>transform</code></td><td>same rows and index as the input</td><td>11 orders, group value repeated</td><td><code>SUM(...) OVER (PARTITION BY ...)</code></td></tr>
    <tr><td><code>filter</code></td><td>original rows of the groups that pass</td><td>10 orders, Momo Magic gone</td><td><code>HAVING</code>, then back to rows</td></tr>
  </table>

  <h2 id="pdg-apply"><span class="num">05</span>GroupBy.apply and Its Cost</h2>
  <p>Sometimes the per-group computation fits none of the shapes above. "The two biggest orders in each city" returns several rows per group; a weighted average needs two columns at once. <strong><code>apply</code></strong> is the general-purpose tool: it calls any Python function on each group's sub-table and glues the results together, whatever shape they have.</p>
  <div class="fx" data-lang="py">def top2(pile):
    return pile.nlargest(2, "amount")[["order_id", "amount"]]
print(orders.groupby("city").apply(top2))</div>
  <div class="fx" data-lang="text">           order_id  amount
city                       
Mumbai 10       111   700.0
       8        109   600.0
Pune   2        103   520.0
       3        104   380.0</div>
  <p>Our <code>top2</code> function receives one city's orders at a time and returns that city's two largest by amount, using <code>nlargest</code>. <code>apply</code> stacks the returned tables and adds the city as an outer index level, so we get Mumbai's 111 and 109 and Pune's 103 and 104. (In pandas 3, the grouping column itself is no longer passed into your function; pandas 2 included it and warned about it.) This flexibility has a price. <code>apply</code> runs your Python function once per group, and it cannot use pandas' compiled group routines, so it is often possible, and much faster, to express the same thing with built-in operations. Top-N per group, for example, is just a sort followed by <code>head</code> within groups:</p>
  <div class="fx" data-lang="py">print(orders.sort_values("amount", ascending=False).groupby("city").head(2)[["city", "order_id", "amount"]])</div>
  <div class="fx" data-lang="text">      city  order_id  amount
10  Mumbai       111   700.0
8   Mumbai       109   600.0
2     Pune       103   520.0
3     Pune       104   380.0</div>
  <p>Same four orders, no custom function: sort all orders by amount once, then <code>groupby("city").head(2)</code> keeps the first two rows of each city. The cost of <code>apply</code> only becomes visible with many groups, so here is a million generated orders from about 20,000 customers, computing each customer's average delivery time weighted by order amount, first with <code>apply</code> and then with plain column arithmetic:</p>
  <div class="fx" data-lang="py">big = make_orders(1_000_000)                      # 1M orders from about 20,000 customers
def timed(label, f):
    t = time.perf_counter(); r = f(); print(f"{label:36} {time.perf_counter() - t:6.2f} s"); return r

# each customer's average delivery time, weighted by order amount
a = timed("apply: Python function per customer", lambda: big.groupby("customer").apply(
        lambda g: (g["delivery_minutes"] * g["amount"]).sum() / g["amount"].sum()))
b = timed("vectorised: two group sums, divide", lambda: (
        big.assign(w=big["delivery_minutes"] * big["amount"])
           .groupby("customer")[["w", "amount"]].sum()
           .pipe(lambda t: t["w"] / t["amount"])))
print("same answer:", np.allclose(a, b), "| groups:", len(b))
timed("agg(lambda s: s.sum())", lambda: big.groupby("customer")["amount"].agg(lambda s: s.sum()))
timed("built-in .sum()", lambda: big.groupby("customer")["amount"].sum())</div>
  <div class="fx" data-lang="text">apply: Python function per customer    2.63 s
vectorised: two group sums, divide     0.10 s
same answer: True | groups: 20000
agg(lambda s: s.sum())                 0.36 s
built-in .sum()                        0.09 s</div>
  <p>Both approaches give the same 20,000 answers, but <code>apply</code> took about 2.5 seconds while the vectorised version took about a tenth of a second (timings are approximate). The trick is that a weighted mean is just "sum of minutes × amount, divided by sum of amount": compute the product as a new column for all rows at once, take two fast built-in group sums, and divide. The last two lines show the same effect in a milder form: summing with a lambda inside <code>agg</code> is about four times slower than the built-in <code>.sum()</code>, because the lambda is still a Python call per group. The rule of thumb: reach for built-in aggregations and <code>transform</code> first, rewrite custom logic as column arithmetic where you can, and use <code>apply</code> when nothing else fits and the number of groups is modest. Vectorisation in general is covered in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>.</p>

  <h2 id="pdg-merge"><span class="num">06</span>Merge and Join Types</h2>
  <p>So far every question used columns already in the orders table. "Revenue per cuisine" is different: the cuisine lives in the restaurants table. We need to bring each order's restaurant details onto the order's row. Combining two tables by matching key values is called a <strong>join</strong>, and in pandas it is done with <code>merge</code>, which works like SQL's <code>JOIN</code> (<a class="xref" data-note="sql_joins">SQL JOINs</a>). For every order (the <em>left</em> table), pandas looks up the order's restaurant in <code>restaurants</code> (the <em>right</em> table) and copies the matching row's columns across. Like the groupby, it uses a hash table: it builds a lookup from one table's keys and probes it with the other's, so it is fast even on millions of rows.</p>
  <div class="fx" data-lang="py">m = orders.merge(restaurants, on="restaurant", how="left")
print(m[["order_id", "restaurant", "amount", "cuisine", "rating"]])</div>
  <div class="fx" data-lang="text">    order_id    restaurant  amount       cuisine  rating
0        101      Dosa Hut   240.0  South Indian     4.4
1        102  Biryani Bros   450.0       Biryani     4.1
2        103   Pizza Point   520.0         Pizza     3.9
3        104  Biryani Bros   380.0       Biryani     4.1
4        105    Green Bowl   310.0        Salads     4.6
5        106      Dosa Hut   180.0  South Indian     4.4
6        107   Pizza Point     NaN         Pizza     3.9
7        108    Momo Magic   260.0           NaN     NaN
8        109  Biryani Bros   600.0       Biryani     4.1
9        110    Green Bowl   290.0        Salads     4.6
10       111   Pizza Point   700.0         Pizza     3.9</div>
  <p>All 11 orders are still here, in their original order, each with its restaurant's cuisine and rating. Order 108 has NaN in both, because Momo Magic has no row in the restaurants table. Tandoor Tales does not appear at all, because no order points to it. That behaviour comes from <code>how="left"</code>: keep every row of the left table, whether or not it found a partner.</p>
  <p>The <code>how</code> argument decides what happens to rows without a partner, and there are four standard choices. Think of matching a class attendance list against the fee-paid list by roll number. An <strong>inner join</strong> keeps only students on both lists. A <strong>left join</strong> keeps everyone who attended, with a blank where there is no fee record. A <strong>right join</strong> keeps everyone who paid, with a blank where they never attended. An <strong>outer join</strong> (full outer) keeps everybody on either list. Here are all four on our tables, with their row counts:</p>
  <div class="fx" data-lang="py">for how in ["inner", "left", "right", "outer"]:
    r = orders.merge(restaurants, on="restaurant", how=how)
    print(f"{how:6} -&gt; {len(r):2} rows   {sorted(r['restaurant'].unique())}")</div>
  <div class="fx" data-lang="text">inner  -&gt; 10 rows   ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Pizza Point']
left   -&gt; 11 rows   ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Momo Magic', 'Pizza Point']
right  -&gt; 11 rows   ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Pizza Point', 'Tandoor Tales']
outer  -&gt; 12 rows   ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Momo Magic', 'Pizza Point', 'Tandoor Tales']</div>
  <p>The row counts can be predicted by hand, and you should always do so before trusting a merge. Ten orders have a partner. Inner keeps just those: 11 − 1 = 10 (Momo Magic's order lost). Left keeps all 11 orders. Right keeps the 10 matched orders plus a row for Tandoor Tales with empty order columns: 11. Outer keeps everything: 10 + 1 + 1 = 12.</p>
  <figure class="viz"><svg viewBox="0 0 640 124" style="max-width:640px;width:100%;height:auto">
    <circle cx="70" cy="60" r="38" class="fb sb" fill-opacity="0.35"/><circle cx="110" cy="60" r="38" class="ft st" fill-opacity="0.35"/><path d="M90 28 A38 38 0 0 1 90 92 A38 38 0 0 1 90 28" class="fg sg"/><text x="90" y="116" text-anchor="middle" font-size="11" fill="currentColor">inner: 10 rows</text>
    <circle cx="230" cy="60" r="38" class="fg sg"/><circle cx="270" cy="60" r="38" class="ft st" fill-opacity="0.35"/><text x="250" y="116" text-anchor="middle" font-size="11" fill="currentColor">left: 11 rows</text>
    <circle cx="390" cy="60" r="38" class="fb sb" fill-opacity="0.35"/><circle cx="430" cy="60" r="38" class="fg sg"/><text x="410" y="116" text-anchor="middle" font-size="11" fill="currentColor">right: 11 rows</text>
    <circle cx="550" cy="60" r="38" class="fg sg"/><circle cx="590" cy="60" r="38" class="fg sg"/><text x="570" y="116" text-anchor="middle" font-size="11" fill="currentColor">outer: 12 rows</text>
    <text x="30" y="14" font-size="10" fill="currentColor" opacity="0.7">orders</text><text x="112" y="14" font-size="10" fill="currentColor" opacity="0.7">restaurants</text>
  </svg><figcaption>Join types as overlapping sets of keys, orders on the left and restaurants on the right. The highlighted part is what each join keeps. The overlap holds the four restaurants in both tables; Momo Magic sits only in the left circle and Tandoor Tales only in the right. Unmatched rows that are kept get NaN in the other table's columns.</figcaption></figure>
  <p>The unmatched rows are often the most interesting part of a merge, so pandas can label them. <code>indicator=True</code> adds a column called <code>_merge</code> that says where each row came from:</p>
  <div class="fx" data-lang="py">full = orders.merge(restaurants, on="restaurant", how="outer", indicator=True)
print(full["_merge"].value_counts())
print(full.loc[full["_merge"] != "both", ["order_id", "restaurant", "cuisine", "_merge"]])</div>
  <div class="fx" data-lang="text">_merge
both          10
left_only      1
right_only     1
Name: count, dtype: int64
    order_id     restaurant       cuisine      _merge
7      108.0     Momo Magic           NaN   left_only
11       NaN  Tandoor Tales  North Indian  right_only</div>
  <p>Ten rows matched (<code>both</code>), one came only from the left table and one only from the right. The two kinds of unmatched row mean different things. Momo Magic (<code>left_only</code>) is an order whose restaurant is missing from the register, a data-quality problem to report. Tandoor Tales (<code>right_only</code>) is a listed restaurant with no orders, a business question for the sales team. Notice also that <code>order_id</code> became a float (108.0): the outer join had to put NaN into Tandoor Tales' order id, and NaN forces the column to float, just as the cleaning page described.</p>
  <p>Finding rows <em>without</em> a partner is common enough to have a name: an <strong>anti-join</strong>. "Customers who never ordered" and "orders from people without a profile" are both anti-joins, and there are two ways to write them:</p>
  <div class="fx" data-lang="py">print(customers[~customers["customer"].isin(orders["customer"])])           # never ordered
no_profile = orders.merge(customers, on="customer", how="left", indicator=True)
print(no_profile.loc[no_profile["_merge"] == "left_only", ["order_id", "customer", "plan"]])</div>
  <div class="fx" data-lang="text">  customer  plan
5     Gita  gold
   order_id customer plan
8       109    Farah  NaN</div>
  <p>The first uses <code>isin</code>: keep customers whose name is <em>not</em> (<code>~</code>) among the orders' customers, which finds Gita. The second does a left merge with an indicator and keeps the <code>left_only</code> rows, which finds Farah's order 109 with no plan. The <code>isin</code> version is shorter for a single key; the merge version keeps all columns and works with several key columns.</p>
  <p>Two practical details come up in almost every real merge. If the key columns have different names in the two tables, pass <code>left_on=</code> and <code>right_on=</code> instead of <code>on=</code>. And if both tables have a non-key column with the same name, pandas keeps both and adds suffixes:</p>
  <div class="fx" data-lang="py">targets = pd.DataFrame({"city": ["Pune", "Mumbai"], "amount": [2000, 2500]})   # weekly targets
by_city = orders.groupby("city", as_index=False)["amount"].sum()
print(by_city.merge(targets, on="city"))
print(by_city.merge(targets, on="city", suffixes=("", "_target")))</div>
  <div class="fx" data-lang="text">     city  amount_x  amount_y
0  Mumbai    2060.0      2500
1    Pune    1870.0      2000
     city  amount  amount_target
0  Mumbai  2060.0           2500
1    Pune  1870.0           2000</div>
  <p>Both the per-city revenue and the weekly targets have a column called <code>amount</code>, so the default result has <code>amount_x</code> and <code>amount_y</code>, which tells a reader nothing. Passing <code>suffixes=("", "_target")</code> keeps the left name unchanged and labels the right one, so it is clear that Mumbai earned 2060 against a target of 2500.</p>

  <h2 id="pdg-fan"><span class="num">07</span>Row-Count Checks and validate=</h2>
  <p>Every restaurant appeared once in the lookup table, so each order matched at most one row. That was the "should" from section 01. Now suppose a careless import added Pizza Point a second time, labelled "Italian" with a rating of 4.0. No error appears anywhere. Watch what the same left merge does:</p>
  <div class="fx" data-lang="py">restaurants_bad = pd.concat([restaurants,
                             pd.DataFrame({"restaurant": ["Pizza Point"], "cuisine": ["Italian"], "rating": [4.0]})],
                            ignore_index=True)        # Pizza Point now listed TWICE
fan = orders.merge(restaurants_bad, on="restaurant", how="left")
print(len(orders), "-&gt;", len(fan), "rows")
print("revenue", orders["amount"].sum(), "-&gt;", fan["amount"].sum())
print(fan.loc[fan["restaurant"] == "Pizza Point", ["order_id", "amount", "cuisine"]])</div>
  <div class="fx" data-lang="text">11 -&gt; 14 rows
revenue 3930.0 -&gt; 5150.0
    order_id  amount  cuisine
2        103   520.0    Pizza
3        103   520.0  Italian
7        107     NaN    Pizza
8        107     NaN  Italian
12       111   700.0    Pizza
13       111   700.0  Italian</div>
  <p>The table grew from 11 rows to 14, and revenue grew from 3930 to 5150, although nobody sold anything. The reason is the rule a merge always follows: each left row is paired with <em>every</em> matching right row. Each of the three Pizza Point orders now finds two restaurant rows, so it comes out twice. Three orders become six rows, the table grows by three, and the Pizza Point amounts are counted a second time: 3930 + 520 + 700 = 5150 (order 107's NaN adds nothing). This is called <strong>fan-out</strong>, or row multiplication, and it is the most common cause of "revenue doubled overnight" in real reporting. The general formula is that, for each key, the merge produces (left rows with that key) × (right rows with that key) output rows: here 3 × 2 = 6 for Pizza Point.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" style="max-width:600px;width:100%;height:auto">
    <defs><marker id="pdg-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="170" height="26" class="fb sb"/><text x="16" y="48" font-size="11" fill="currentColor">103 Pizza Point ₹520</text>
    <rect x="230" y="14" width="160" height="26" class="ft st"/><text x="236" y="32" font-size="11" fill="currentColor">Pizza Point · Pizza</text>
    <rect x="230" y="46" width="160" height="26" class="ft st"/><text x="236" y="64" font-size="11" fill="currentColor">Pizza Point · Italian</text>
    <path d="M180 40 L228 28" stroke="currentColor" marker-end="url(#pdg-ar)"/><path d="M180 46 L228 58" stroke="currentColor" marker-end="url(#pdg-ar)"/>
    <rect x="420" y="14" width="170" height="26" class="fr sr"/><text x="428" y="32" font-size="11" fill="currentColor">103 ₹520 Pizza</text>
    <rect x="420" y="46" width="170" height="26" class="fr sr"/><text x="428" y="64" font-size="11" fill="currentColor">103 ₹520 Italian</text>
    <path d="M390 27 L418 27" stroke="currentColor" marker-end="url(#pdg-ar)"/><path d="M390 59 L418 59" stroke="currentColor" marker-end="url(#pdg-ar)"/>
    <text x="10" y="100" font-size="11" fill="currentColor">1 order × 2 matching lookup rows = 2 output rows, so ₹520 is counted twice</text>
    <text x="10" y="120" font-size="10" fill="currentColor" opacity="0.7">11 rows in, 14 rows out; revenue 3930 becomes 5150</text>
  </svg><figcaption>Fan-out: order 103 meets two Pizza Point rows in the lookup table and leaves the merge as two rows. Every sum computed afterwards counts its ₹520 twice.</figcaption></figure>
  <p>Think of two students sharing a roll number in the fee register. When attendance is matched to fees, that student's attendance is copied onto both fee rows, and the class appears to have more attendance than students. Nothing about the result looks broken; the numbers are simply too big. That is why you need guards that check the shape of a merge automatically. The first is <code>validate=</code>, which declares the relationship you expect between the tables and makes pandas check it before merging:</p>
  <div class="fx" data-lang="py">try:
    orders.merge(restaurants_bad, on="restaurant", how="left", validate="many_to_one")
except pd.errors.MergeError as e:
    print("MergeError:", str(e).splitlines()[0])
print(restaurants_bad[restaurants_bad["restaurant"].duplicated(keep=False)])
ok = orders.merge(restaurants, on="restaurant", how="left", validate="many_to_one")
assert len(ok) == len(orders), "left merge changed the row count"
print("clean lookup passes:", len(ok), "rows")</div>
  <div class="fx" data-lang="text">MergeError: Merge keys are not unique in right dataset; not a many-to-one merge
    restaurant  cuisine  rating
2  Pizza Point    Pizza     3.9
5  Pizza Point  Italian     4.0
clean lookup passes: 11 rows</div>
  <p><code>validate="many_to_one"</code> says "many orders may share a restaurant, but each restaurant appears at most once on the right". Pandas checked the keys, found Pizza Point twice, and raised a <code>MergeError</code> instead of quietly doubling rows. To see which keys are at fault, <code>duplicated(keep=False)</code> marks every copy, so both Pizza Point rows are shown and someone can decide which is correct. The clean lookup table passes, and the <code>assert</code> adds the second guard: a left many-to-one merge must keep exactly as many rows as the left table had. The other options are <code>"one_to_one"</code>, <code>"one_to_many"</code> and <code>"many_to_many"</code> (which checks nothing), with short forms such as <code>"m:1"</code>.</p>
  <p>The opposite failure, a merge that matches too <em>little</em>, usually comes from keys that look equal to a person but not to the computer:</p>
  <div class="fx" data-lang="py">riders = pd.DataFrame({"order_id": ["101", "102"], "rider": ["Ravi", "Meena"]})   # ids stored as text
try:
    orders.merge(riders, on="order_id")
except ValueError as e:
    print("ValueError:", e)
print(orders.merge(riders.astype({"order_id": "int64"}), on="order_id")[["order_id", "rider"]])
spaced = restaurants.assign(restaurant=restaurants["restaurant"] + " ")         # trailing spaces
print("matches with trailing spaces:", orders.merge(spaced, on="restaurant").shape[0])</div>
  <div class="fx" data-lang="text">ValueError: You are trying to merge on int64 and str columns for key 'order_id'. If you wish to proceed you should use pd.concat
   order_id  rider
0       101   Ravi
1       102  Meena
matches with trailing spaces: 0</div>
  <p>A rider-assignment file stored order ids as text ("101"). Pandas refuses to merge an integer key with a text key, and the fix is to convert one side, after which both orders match their riders. Text keys with different spacing or spelling are worse, because they are the same type, so the merge runs happily and matches nothing: with a trailing space added to every restaurant name, an inner merge returns 0 rows. This is why keys are cleaned before merging, and why checking row counts and NaN counts after every merge matters.</p>
  <p>At scale nobody looks at individual rows, so these guards belong in the code. Here is a complete enrichment-and-summary pipeline on a million generated orders over five restaurants, including Momo Magic:</p>
  <div class="fx" data-lang="py">big = make_orders(1_000_000)           # generator from Basics: 5 restaurants incl. Momo Magic
t = time.perf_counter()
enriched = big.merge(restaurants, on="restaurant", how="left", validate="many_to_one")
assert len(enriched) == len(big)
summary = (enriched.groupby(["city", "cuisine"], dropna=False)
                   .agg(orders=("order_id", "size"), revenue=("amount", "sum")))
print(summary)
print(f"rows add up: {summary['orders'].sum():,} | {time.perf_counter() - t:.2f} s")</div>
  <div class="fx" data-lang="text">                     orders     revenue
city   cuisine                         
Mumbai Biryani        90419  36095006.0
       Pizza          90272  36048651.0
       Salads         89833  35843110.0
       South Indian   89797  35893389.0
       NaN            90087  36037519.0
Pune   Biryani       109632  43953921.0
       Pizza         109948  43882476.0
       Salads        109607  43906094.0
       South Indian  110227  44135437.0
       NaN           110178  44031394.0
rows add up: 1,000,000 | 0.25 s</div>
  <p>The merge declares <code>validate="many_to_one"</code>, the assertion confirms the row count did not change, and the groupby uses <code>dropna=False</code> so Momo Magic's orders appear under a NaN cuisine instead of silently vanishing from the totals. The group sizes add up to exactly 1,000,000, the check that proves nothing was lost or duplicated, and the whole pipeline takes about a quarter of a second. (The generated amounts all come from one distribution, so revenues are similar everywhere; the point here is the structure.)</p>

  <h2 id="pdg-concat"><span class="num">08</span>join and concat</h2>
  <p>Two common situations do not fit <code>merge</code> neatly. In the first, the key is already the index of both tables. <code>DataFrame.join</code> is a shortcut for merging on the index: <code>a.join(b)</code> matches <code>a</code>'s index labels with <code>b</code>'s and, by default, keeps every row of <code>a</code> (a left join).</p>
  <div class="fx" data-lang="py">plans = customers.set_index("customer")
print(orders.set_index("customer")[["order_id", "amount"]].join(plans).head(5))</div>
  <div class="fx" data-lang="text">          order_id  amount  plan
customer                        
Asha           101   240.0  gold
Ben            102   450.0  free
Chen           103   520.0  gold
Asha           104   380.0  gold
Dia            105   310.0  free</div>
  <p>With customer names as the index of both tables, each order picks up its customer's plan, and Asha's two orders both get "gold". It is equivalent to <code>merge(left_index=True, right_index=True, how="left")</code>, and it is really the index alignment from <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a> applied to whole tables. Use <code>join</code> when your tables are already indexed by the key; otherwise <code>merge</code> on columns is clearer.</p>
  <p>In the second situation the tables do not need matching at all, because one simply continues the other. Two late orders arrived on Saturday in a separate file with the same columns. <strong><code>pd.concat</code></strong> (concatenate) stacks tables on top of each other, lining up columns by name:</p>
  <div class="fx" data-lang="py">late = pd.DataFrame({"order_id": [112, 113], "customer": ["Gita", "Ben"],
                     "restaurant": ["Tandoor Tales", "Dosa Hut"], "city": ["Mumbai", "Pune"],
                     "amount": [430, 210]})
cols = ["order_id", "customer", "restaurant", "city", "amount"]
week = pd.concat([orders[cols], late], ignore_index=True)
print(week.tail(3))
print("rows:", len(week))
print("without ignore_index, labels:", pd.concat([orders[cols], late]).index[-3:].tolist())</div>
  <div class="fx" data-lang="text">    order_id customer     restaurant    city  amount
10       111      Dia    Pizza Point  Mumbai   700.0
11       112     Gita  Tandoor Tales  Mumbai   430.0
12       113      Ben       Dosa Hut    Pune   210.0
rows: 13
without ignore_index, labels: [10, 0, 1]</div>
  <p>11 + 2 = 13 rows, and Gita finally placed an order. <code>ignore_index=True</code> renumbers the rows 0 to 12; without it, each piece keeps its own labels, and the last line shows the result: labels 10, 0, 1, so two rows share label 0 and later <code>.loc</code> lookups become ambiguous. Columns present in only one of the pieces would be filled with NaN for the other's rows. Think of stapling Saturday's sales sheet under Friday's: nothing is matched, the pages are just put together. In SQL terms this is <code>UNION ALL</code>, which also keeps duplicates.</p>
  <p>With <code>axis=1</code>, <code>concat</code> places objects side by side instead, aligning them on the index. That is a neat way to assemble several group results into one table:</p>
  <div class="fx" data-lang="py">g = orders.groupby("city")
side = pd.concat([g.size().rename("orders"), g["amount"].sum().rename("revenue")], axis=1)
print(side)</div>
  <div class="fx" data-lang="text">        orders  revenue
city                   
Mumbai       5   2060.0
Pune         6   1870.0</div>
  <p>The order counts and the revenue were computed separately, but both are indexed by city, so <code>concat(axis=1)</code> lines them up row by row. Two cautions apply to <code>concat</code>. It never removes duplicates, so if Saturday's file repeated a Friday order, that order would now be counted twice (section 11 shows this). And never call <code>concat</code> inside a loop to add one piece at a time: each call copies everything accumulated so far, so the total work grows with the square of the number of pieces. Collect the pieces in a list and concatenate once at the end.</p>

  <h2 id="pdg-pivot"><span class="num">09</span>pivot_table, pivot and melt</h2>
  <p>All our answers so far are long lists, with one row per city or per (city, restaurant) pair. The manager wants a grid: one row per day, one column per city, revenue in the cells. These are two different shapes of the same data. In <strong>long</strong> format (also called tidy format) each row is one fact: (day, city, revenue). In <strong>wide</strong> format one variable is spread across the columns: a Mumbai column and a Pune column. Long is easier to compute with, filter and plot; wide is easier for people to read. Think of a long list of exam results, one line per (student, subject, mark), against the printed mark sheet with subjects as columns.</p>
  <p><strong><code>pivot_table</code></strong> goes from long to wide, grouping and aggregating along the way. You tell it what goes down the side (<code>index</code>), what goes across the top (<code>columns</code>), what fills the cells (<code>values</code>) and how to combine several rows that land in the same cell (<code>aggfunc</code>):</p>
  <div class="fx" data-lang="py">orders["day"] = orders["order_time"].dt.strftime("%m-%d %a")       # "03-02 Mon" sorts by date
wide = orders.pivot_table(index="day", columns="city", values="amount", aggfunc="sum")
print(wide)</div>
  <div class="fx" data-lang="text">city       Mumbai   Pune
day                     
03-02 Mon   450.0  760.0
03-03 Tue   310.0  380.0
03-04 Wed     0.0  180.0
03-05 Thu   600.0  260.0
03-06 Fri   700.0  290.0</div>
  <p>First we give each order a day label such as "03-02 Mon" (month and day first, so the labels sort in date order; day names alone would sort alphabetically as Fri, Mon, Thu, Tue, Wed). Then pivot_table groups by (day, city) and sums. Check Monday in Pune: orders 101 and 103, so 240 + 520 = 760. Wednesday in Mumbai shows 0.0, and this deserves a second look: Esha did order on Wednesday (107), but her amount is unknown, and the sum of only-missing values is 0. A cell with no orders at all would show NaN, or 0 if you passed <code>fill_value=0</code>, and then the two situations would look identical. A grid cannot show that difference, so report counts beside it.</p>
  <p>The single most common pivot_table mistake is forgetting <code>aggfunc</code>:</p>
  <div class="fx" data-lang="py">print(orders.pivot_table(index="city", values="amount"))           # no aggfunc -&gt; MEAN
print(orders.pivot_table(index="city", values="amount", aggfunc=["sum", "count"], margins=True))</div>
  <div class="fx" data-lang="text">            amount
city              
Mumbai  515.000000
Pune    311.666667
           sum  count
        amount amount
city                 
Mumbai  2060.0      4
Pune    1870.0      6
All     3930.0     10</div>
  <p>Without <code>aggfunc</code>, pivot_table computes the <em>mean</em>, so the first table shows Mumbai's average order, 2060 / 4 = 515.0, where you probably expected a total. Nothing warns you. The second call asks for both the sum and the count and adds <code>margins=True</code>, which appends an "All" row with the grand totals: 3930 revenue from 10 known amounts. Giving the count beside the sum is the habit that would have caught the Wednesday zero.</p>
  <p><strong><code>pivot</code></strong> (without "_table") also goes from long to wide, but it only rearranges values; it cannot combine them:</p>
  <div class="fx" data-lang="py">try:
    orders.pivot(index="day", columns="city", values="amount")
except ValueError as e:
    print("ValueError:", e)
daily = orders.groupby(["day", "city"], as_index=False)["amount"].sum()     # one row per pair
print(daily.pivot(index="day", columns="city", values="amount"))</div>
  <div class="fx" data-lang="text">ValueError: Index contains duplicate entries, cannot reshape
city       Mumbai   Pune
day                     
03-02 Mon   450.0  760.0
03-03 Tue   310.0  380.0
03-04 Wed     0.0  180.0
03-05 Thu   600.0  260.0
03-06 Fri   700.0  290.0</div>
  <p>On the raw orders, Monday/Pune has two orders, so the cell would need two values, and <code>pivot</code> refuses with "Index contains duplicate entries". Once we first group to one row per (day, city) pair, <code>pivot</code> works and gives the same grid as before. So use <code>pivot</code> when each (index, column) pair occurs exactly once, and <code>pivot_table</code> otherwise; in fact pivot_table is essentially a groupby, an aggregation and a pivot in one call.</p>
  <p>Going back from wide to long is <strong><code>melt</code></strong>:</p>
  <div class="fx" data-lang="py">wide = orders.pivot_table(index="day", columns="city", values="amount", aggfunc="sum")
long = wide.reset_index().melt(id_vars="day", var_name="city", value_name="revenue")
print(long)</div>
  <div class="fx" data-lang="text">         day    city  revenue
0  03-02 Mon  Mumbai    450.0
1  03-03 Tue  Mumbai    310.0
2  03-04 Wed  Mumbai      0.0
3  03-05 Thu  Mumbai    600.0
4  03-06 Fri  Mumbai    700.0
5  03-02 Mon    Pune    760.0
6  03-03 Tue    Pune    380.0
7  03-04 Wed    Pune    180.0
8  03-05 Thu    Pune    260.0
9  03-06 Fri    Pune    290.0</div>
  <p><code>melt</code> keeps the <code>id_vars</code> columns (here the day) as they are and turns every other column into rows of (<code>var_name</code>, <code>value_name</code>) pairs: 5 days × 2 cities = 10 rows. This long shape is what groupby wants, and what plotting libraries such as Seaborn and Plotly expect (<a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a>). The wide shape, on the other hand, maps directly onto a grouped bar chart in pandas' own plotting, where each column becomes one colour of bar:</p>
  <div class="fx" data-lang="py">import matplotlib.pyplot as plt
wide = orders.pivot_table(index="day", columns="city", values="amount", aggfunc="sum")
ax = wide.plot.bar(figsize=(6.4, 2.8), rot=0, color=["#4e79a7", "#f28e2b"])
ax.set_xlabel("")
ax.set_ylabel("revenue (₹)")
ax.legend(title=None, frameon=False)
for side in ("top", "right"):
    ax.spines[side].set_visible(False)
plt.tight_layout()</div>
  <figure class="viz"><svg fill="currentColor" style="max-width:640px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 460.8 201.6" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="figure_1">
<g id="patch_1">
<path d="M 0 201.6 
L 460.8 201.6 
L 460.8 0 
L 0 0 
L 0 201.6 
z
" style="fill: none"/>
</g>
<g id="axes_1">
<g id="patch_2">
<path d="M 52.979609 171.700391 
L 450 171.700391 
L 450 10.8 
L 52.979609 10.8 
L 52.979609 171.700391 
z
" style="fill: none"/>
</g>
<g id="patch_3">
<path d="M 72.830629 171.700391 
L 92.681648 171.700391 
L 92.681648 80.967088 
L 72.830629 80.967088 
z
" clip-path="url(#p77f8679a87)" style="fill: #4e79a7"/>
</g>
<g id="patch_4">
<path d="M 152.234707 171.700391 
L 172.085727 171.700391 
L 172.085727 109.195226 
L 152.234707 109.195226 
z
" clip-path="url(#p77f8679a87)" style="fill: #4e79a7"/>
</g>
<g id="patch_5">
<path d="M 231.638785 171.700391 
L 251.489805 171.700391 
L 251.489805 171.700391 
L 231.638785 171.700391 
z
" clip-path="url(#p77f8679a87)" style="fill: #4e79a7"/>
</g>
<g id="patch_6">
<path d="M 311.042863 171.700391 
L 330.893883 171.700391 
L 330.893883 50.722653 
L 311.042863 50.722653 
z
" clip-path="url(#p77f8679a87)" style="fill: #4e79a7"/>
</g>
<g id="patch_7">
<path d="M 390.446941 171.700391 
L 410.297961 171.700391 
L 410.297961 30.559697 
L 390.446941 30.559697 
z
" clip-path="url(#p77f8679a87)" style="fill: #4e79a7"/>
</g>
<g id="patch_8">
<path d="M 92.681648 171.700391 
L 112.532668 171.700391 
L 112.532668 18.461923 
L 92.681648 18.461923 
z
" clip-path="url(#p77f8679a87)" style="fill: #f28e2b"/>
</g>
<g id="patch_9">
<path d="M 172.085727 171.700391 
L 191.936746 171.700391 
L 191.936746 95.081157 
L 172.085727 95.081157 
z
" clip-path="url(#p77f8679a87)" style="fill: #f28e2b"/>
</g>
<g id="patch_10">
<path d="M 251.489805 171.700391 
L 271.340824 171.700391 
L 271.340824 135.407069 
L 251.489805 135.407069 
z
" clip-path="url(#p77f8679a87)" style="fill: #f28e2b"/>
</g>
<g id="patch_11">
<path d="M 330.893883 171.700391 
L 350.744902 171.700391 
L 350.744902 119.276704 
L 330.893883 119.276704 
z
" clip-path="url(#p77f8679a87)" style="fill: #f28e2b"/>
</g>
<g id="patch_12">
<path d="M 410.297961 171.700391 
L 430.14898 171.700391 
L 430.14898 113.227818 
L 410.297961 113.227818 
z
" clip-path="url(#p77f8679a87)" style="fill: #f28e2b"/>
</g>
<g id="matplotlib.axis_1">
<g id="xtick_1">
<g id="line2d_1">
<defs>
<path id="mbe7fc9fcbf" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#mbe7fc9fcbf" x="92.681648" y="171.700391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_1">
<text style="font-size: 10px; text-anchor: middle" x="92.681648" y="188.387891" transform="rotate(-0 92.681648 188.387891)">03-02 Mon</text>
</g>
</g>
<g id="xtick_2">
<g id="line2d_2">
<g>
<use xlink:href="#mbe7fc9fcbf" x="172.085727" y="171.700391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_2">
<text style="font-size: 10px; text-anchor: middle" x="172.085727" y="188.387891" transform="rotate(-0 172.085727 188.387891)">03-03 Tue</text>
</g>
</g>
<g id="xtick_3">
<g id="line2d_3">
<g>
<use xlink:href="#mbe7fc9fcbf" x="251.489805" y="171.700391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_3">
<text style="font-size: 10px; text-anchor: middle" x="251.489805" y="188.387891" transform="rotate(-0 251.489805 188.387891)">03-04 Wed</text>
</g>
</g>
<g id="xtick_4">
<g id="line2d_4">
<g>
<use xlink:href="#mbe7fc9fcbf" x="330.893883" y="171.700391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_4">
<text style="font-size: 10px; text-anchor: middle" x="330.893883" y="188.387891" transform="rotate(-0 330.893883 188.387891)">03-05 Thu</text>
</g>
</g>
<g id="xtick_5">
<g id="line2d_5">
<g>
<use xlink:href="#mbe7fc9fcbf" x="410.297961" y="171.700391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_5">
<text style="font-size: 10px; text-anchor: middle" x="410.297961" y="188.387891" transform="rotate(-0 410.297961 188.387891)">03-06 Fri</text>
</g>
</g>
</g>
<g id="matplotlib.axis_2">
<g id="ytick_1">
<g id="line2d_6">
<defs>
<path id="m3dc800bb52" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="171.700391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_6">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="176.544141" transform="rotate(-0 45.979609 176.544141)">0</text>
</g>
</g>
<g id="ytick_2">
<g id="line2d_7">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="151.537434" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_7">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="156.381184" transform="rotate(-0 45.979609 156.381184)">100</text>
</g>
</g>
<g id="ytick_3">
<g id="line2d_8">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="131.374478" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_8">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="136.218228" transform="rotate(-0 45.979609 136.218228)">200</text>
</g>
</g>
<g id="ytick_4">
<g id="line2d_9">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="111.211522" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_9">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="116.055272" transform="rotate(-0 45.979609 116.055272)">300</text>
</g>
</g>
<g id="ytick_5">
<g id="line2d_10">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="91.048566" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_10">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="95.892316" transform="rotate(-0 45.979609 95.892316)">400</text>
</g>
</g>
<g id="ytick_6">
<g id="line2d_11">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="70.88561" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_11">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="75.72936" transform="rotate(-0 45.979609 75.72936)">500</text>
</g>
</g>
<g id="ytick_7">
<g id="line2d_12">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="50.722653" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_12">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="55.566403" transform="rotate(-0 45.979609 55.566403)">600</text>
</g>
</g>
<g id="ytick_8">
<g id="line2d_13">
<g>
<use xlink:href="#m3dc800bb52" x="52.979609" y="30.559697" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="text_13">
<text style="font-size: 10px; text-anchor: end" x="45.979609" y="35.403447" transform="rotate(-0 45.979609 35.403447)">700</text>
</g>
</g>
<g id="text_14">
<text style="font-size: 10px; text-anchor: middle" x="20.489375" y="91.250195" transform="rotate(-90 20.489375 91.250195)">revenue (₹)</text>
</g>
</g>
<g id="patch_13">
<path d="M 52.979609 171.700391 
L 52.979609 10.8 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="patch_14">
<path d="M 52.979609 171.700391 
L 450 171.700391 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="legend_1">
<g id="patch_15">
<path d="M 218.507773 29.4875 
L 238.507773 29.4875 
L 238.507773 22.4875 
L 218.507773 22.4875 
z
" style="fill: #4e79a7"/>
</g>
<g id="text_15">
<text style="font-size: 10px; text-anchor: start" x="246.507773" y="29.4875" transform="rotate(-0 246.507773 29.4875)">Mumbai</text>
</g>
<g id="patch_16">
<path d="M 218.507773 46.587109 
L 238.507773 46.587109 
L 238.507773 39.587109 
L 218.507773 39.587109 
z
" style="fill: #f28e2b"/>
</g>
<g id="text_16">
<text style="font-size: 10px; text-anchor: start" x="246.507773" y="46.587109" transform="rotate(-0 246.507773 46.587109)">Pune</text>
</g>
</g>
</g>
</g>
<defs>
<clipPath id="p77f8679a87">
<rect x="52.979609" y="10.8" width="397.020391" height="160.900391"/>
</clipPath>
</defs>
</svg><figcaption>The wide day × city table plotted directly: one group of bars per row (day), one colour per column (city). Monday's tall Pune bar is orders 101 and 103 (760); Wednesday's missing Mumbai bar is the 0 produced by order 107's unknown amount.</figcaption></figure>
  <figure class="viz"><svg viewBox="0 0 600 120" font-family="ui-monospace, Menlo, Consolas, monospace" style="max-width:600px;width:100%;height:auto;white-space:pre">
    <defs><marker id="pdg-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" font-size="10" fill="currentColor" opacity="0.7">long: one row per fact</text>
    <rect x="10" y="24" width="190" height="84" class="fb sb"/>
    <text x="18" y="42" font-size="11" fill="currentColor">day        city    revenue</text><text x="18" y="62" font-size="11" fill="currentColor">03-02 Mon  Mumbai  450</text><text x="18" y="82" font-size="11" fill="currentColor">03-02 Mon  Pune    760</text><text x="18" y="102" font-size="11" fill="currentColor">03-03 Tue  Mumbai  310</text>
    <path d="M210 50 L300 50" stroke="currentColor" marker-end="url(#pdg-ar2)"/><text x="216" y="42" font-size="11" fill="currentColor">pivot_table</text>
    <path d="M300 84 L210 84" stroke="currentColor" marker-end="url(#pdg-ar2)"/><text x="240" y="102" font-size="11" fill="currentColor">melt</text>
    <text x="310" y="16" font-size="10" fill="currentColor" opacity="0.7">wide: one column per city</text>
    <rect x="310" y="24" width="270" height="64" class="ft st"/>
    <text x="318" y="42" font-size="11" fill="currentColor">day        Mumbai  Pune</text><text x="318" y="62" font-size="11" fill="currentColor">03-02 Mon  450     760</text><text x="318" y="82" font-size="11" fill="currentColor">03-03 Tue  310     380</text>
  </svg><figcaption>The two shapes and the functions that move between them. pivot_table takes the long rows and spreads the city values across columns, aggregating where several rows share a cell; melt reads the grid back out into one row per (day, city).</figcaption></figure>

  <h2 id="pdg-stack"><span class="num">10</span>stack, unstack and crosstab</h2>
  <p>pivot_table builds a grid from raw rows. Often you already have a grouped result with a two-level index, like the (city, restaurant) revenue from section 02, and you just want one of its index levels to become columns. That is what <strong><code>unstack</code></strong> does, and <strong><code>stack</code></strong> is its reverse:</p>
  <div class="fx" data-lang="py">s = orders.groupby(["city", "restaurant"])["amount"].sum()
grid = s.unstack(fill_value=0)
print(grid)
print(grid.stack().head(4))</div>
  <div class="fx" data-lang="text">restaurant  Biryani Bros  Dosa Hut  Green Bowl  Momo Magic  Pizza Point
city                                                                   
Mumbai            1050.0       0.0       310.0         0.0        700.0
Pune               380.0     420.0       290.0       260.0        520.0
city    restaurant  
Mumbai  Biryani Bros    1050.0
        Dosa Hut           0.0
        Green Bowl       310.0
        Momo Magic         0.0
dtype: float64</div>
  <p><code>unstack()</code> takes the innermost index level (restaurant) and turns its values into column headers, leaving one row per city. Pairs that never occurred, such as Mumbai and Dosa Hut, would be NaN; <code>fill_value=0</code> writes 0 instead. <code>stack()</code> moves the columns back into the inner index level. Notice that the round trip is not exact: the stacked result now contains Mumbai/Dosa Hut 0.0, a row that did not exist in the original grouped result. A filled zero is now indistinguishable from real data, so decide before reshaping whether "no orders" should read as 0 or stay missing. Seen this way, <code>pivot_table</code> is simply groupby + aggregate + unstack in one call, and <code>melt</code> and <code>stack</code> both go from wide to long (melt works on columns, stack on the index).</p>
  <p>The simplest grid of all counts how often each combination occurs. <strong><code>pd.crosstab</code></strong> builds such a frequency table directly from two columns:</p>
  <div class="fx" data-lang="py">print(pd.crosstab(orders["city"], orders["restaurant"], margins=True))
print(pd.crosstab(orders["city"], orders["restaurant"], normalize="index").round(2))</div>
  <div class="fx" data-lang="text">restaurant  Biryani Bros  Dosa Hut  Green Bowl  Momo Magic  Pizza Point  All
city                                                                        
Mumbai                 2         0           1           0            2    5
Pune                   1         2           1           1            1    6
All                    3         2           2           1            3   11
restaurant  Biryani Bros  Dosa Hut  Green Bowl  Momo Magic  Pizza Point
city                                                                   
Mumbai              0.40      0.00        0.20        0.00         0.40
Pune                0.17      0.33        0.17        0.17         0.17</div>
  <p>Each cell counts the orders for one (city, restaurant) pair: Mumbai and Biryani Bros has 2 (orders 102 and 109). <code>margins=True</code> adds row and column totals, so Mumbai has 5 orders, Pune 6, and 11 in all. Order 107 is counted even though its amount is unknown, because crosstab counts rows, not amounts. <code>normalize="index"</code> divides each row by its total, giving shares within each city: 40% of Mumbai's orders went to Biryani Bros (2 of 5). Think of a surveyor's tally sheet, one tick per person in the right (area, answer) box. A crosstab is the same as <code>groupby([a, b]).size().unstack(fill_value=0)</code>, just shorter, and it can also aggregate a value column if you pass <code>values=</code> and <code>aggfunc=</code>.</p>

  <h2 id="pdg-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The mistakes in this topic share a dangerous property: they produce numbers that look perfectly reasonable. The first is relying on <code>merge</code>'s default. If you do not pass <code>how</code>, pandas performs an inner join:</p>
  <div class="fx" data-lang="py">print("default merge:", len(orders.merge(restaurants, on="restaurant")), "rows of", len(orders))
print("revenue lost:", orders["amount"].sum() - orders.merge(restaurants, on="restaurant")["amount"].sum())</div>
  <div class="fx" data-lang="text">default merge: 10 rows of 11
revenue lost: 260.0</div>
  <p>Momo Magic's order has no partner in the restaurants table, so the default merge drops it, and ₹260 disappears from every total computed afterwards. Choose <code>how</code> deliberately (usually <code>"left"</code> when enriching a fact table) and compare row counts before and after.</p>
  <p>The second is assuming that <code>concat</code> cleans up after you. If the same file is loaded twice, for example Friday's batch re-sent by the app, concat happily stacks it again:</p>
  <div class="fx" data-lang="py">friday = orders[orders["day"].str.startswith("03-06")]
again = pd.concat([orders, friday], ignore_index=True)           # Friday's file loaded twice
print(len(again), "rows | duplicated order ids:", again["order_id"].duplicated().sum())
print(len(again.drop_duplicates(subset=["order_id"])), "rows after de-duplicating")</div>
  <div class="fx" data-lang="text">13 rows | duplicated order ids: 2
11 rows after de-duplicating</div>
  <p>Friday's two orders now appear twice, giving 13 rows and two repeated order ids. Checking <code>duplicated()</code> on the id after every append, and removing repeats with <code>drop_duplicates(subset=["order_id"])</code>, brings the table back to 11 rows.</p>
  <p>The other mistakes have all appeared earlier on this page. Reporting a group mean or sum without its count hides missing values: Mumbai's 515.0 is an average of four orders, not five, and <code>count</code> and <code>size</code> differ for exactly that reason. Grouping by a key with gaps silently drops those rows unless you pass <code>dropna=False</code>. Assigning an <code>agg</code> result as a column gives all NaN because of index alignment; <code>transform</code> is the tool for that. A duplicate key in a lookup table multiplies rows and inflates sums (11 rows became 14, ₹3,930 became ₹5,150), which <code>validate=</code> and a row-count assertion catch. Keys of different types refuse to merge, and keys with different spacing silently match nothing. <code>pivot_table</code> without <code>aggfunc</code> averages instead of summing. A sum over only-missing values shows as 0, so a grid cell can claim zero revenue where an order really happened. And <code>apply</code> with a Python function on many groups can be twenty times slower than the equivalent built-in operations.</p>

  <h2 id="pdg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>Split-apply-combine</b>: split rows into groups by key, apply a function to each group, combine the results indexed by key. <code>df.groupby(key)[col].func()</code>.</li>
    <li><b>Key</b>: column identifying what a row is about. <b>Fact table</b>: many rows per key (orders). <b>Lookup table</b>: one row per key (restaurants).</li>
    <li><b>MultiIndex</b>: an index with several levels, produced by grouping on several keys.</li>
    <li><b>Named aggregation</b>: <code>agg(new_name=(column, function))</code>, one output column per keyword.</li>
    <li><b>Join</b>: combining two tables by matching key values (<code>merge</code>). <b>Anti-join</b>: rows with no partner.</li>
    <li><b>Fan-out</b>: a duplicate key on the side assumed unique multiplies rows; per key, rows out = left matches × right matches.</li>
    <li><b>Long / wide</b>: one row per fact / one column per category value.</li>
  </ul>
  <h3>agg, transform, filter, apply</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Output</th><th>Typical use</th><th>SQL</th></tr>
    <tr><td><code>agg</code></td><td>one row per group</td><td>summary tables</td><td><code>GROUP BY</code></td></tr>
    <tr><td><code>transform</code></td><td>same rows as input</td><td>shares, deviations from group mean, group fills</td><td>window function</td></tr>
    <tr><td><code>filter</code></td><td>rows of passing groups</td><td>keep groups meeting a condition</td><td><code>HAVING</code></td></tr>
    <tr><td><code>apply</code></td><td>whatever the function returns</td><td>last resort for custom logic; slow with many groups</td><td>none</td></tr>
  </table>
  <h3>Join types (orders 11 rows, 10 matched)</h3>
  <table class="tbl">
    <tr><th><code>how</code></th><th>Keeps</th><th>Rows</th></tr>
    <tr><td><code>inner</code> (default)</td><td>keys in both tables</td><td>10</td></tr>
    <tr><td><code>left</code></td><td>every left row; NaN where no partner</td><td>11</td></tr>
    <tr><td><code>right</code></td><td>every right row</td><td>11</td></tr>
    <tr><td><code>outer</code></td><td>every row of both</td><td>12</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">df.groupby("city")["amount"].sum()                 # Series indexed by city
df.groupby("city")["amount"].agg(["size", "count"])
df.groupby(["city", "rest"], as_index=False, dropna=False)["amount"].sum()
df.groupby("rest").agg(orders=("order_id", "size"), revenue=("amount", "sum"))
df["city_total"] = df.groupby("city")["amount"].transform("sum")
df.groupby("rest").filter(lambda g: len(g) &gt;= 2)
df.sort_values("amount", ascending=False).groupby("city").head(2)   # top-N

a.merge(b, on="key", how="left", validate="many_to_one", indicator=True)
a.merge(b, left_on="k1", right_on="k2", suffixes=("", "_b"))
a[~a["key"].isin(b["key"])]                        # anti-join
a.join(b)                                           # on the index, left
pd.concat([a, b], ignore_index=True)                # stack rows
pd.concat([s1, s2], axis=1)                         # side by side

df.pivot_table(index="day", columns="city", values="amount", aggfunc="sum", margins=True)
df.pivot(index="day", columns="city", values="amount")     # unique pairs only
wide.reset_index().melt(id_vars="day", var_name="city", value_name="revenue")
s.unstack(fill_value=0); grid.stack()
pd.crosstab(df["city"], df["rest"], margins=True, normalize="index")</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>count</code> skips NaN values, <code>size</code> counts rows; the mean divides by the count.</li>
    <li>groupby drops NaN keys unless <code>dropna=False</code>.</li>
    <li>Assigning an <code>agg</code> result as a column aligns on labels and gives NaN; use <code>transform</code>.</li>
    <li><code>merge</code> defaults to <code>how="inner"</code> and silently drops unmatched rows.</li>
    <li>Duplicate lookup keys fan out rows; use <code>validate=</code> and assert the row count.</li>
    <li>Key dtypes must match; spacing differences match nothing.</li>
    <li><code>pivot_table</code> defaults to the mean; <code>pivot</code> fails on duplicate pairs.</li>
    <li>A sum of only-NaN values is 0; show counts beside grids.</li>
    <li><code>concat</code> keeps duplicates and overlapping labels; use <code>ignore_index=True</code> and check ids.</li>
    <li>Prefer built-in aggregations and column arithmetic to <code>apply</code> and lambdas.</li>
  </ul>

  <h2 id="pdg-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain split-apply-combine.</summary><div class="qa-body">It is the pattern behind <code>groupby</code>: split the rows into groups by the values of one or more key columns, apply a function such as sum or mean to each group independently, and combine the results into a new table indexed by the key. For revenue per city, the 11 orders are split into a Mumbai and a Pune group, each is summed, and the result is a Series with Mumbai 2060 and Pune 1870.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>size()</code> and <code>count()</code> on a groupby?</summary><div class="qa-body"><code>size()</code> counts the rows in each group, including rows with missing values. <code>count()</code> counts the non-missing values in each column. Mumbai has 5 orders but only 4 known amounts, so size is 5 and count is 4, and the mean amount is 2060 / 4, not 2060 / 5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between agg, transform and filter?</summary><div class="qa-body"><code>agg</code> reduces each group to one row, like SQL GROUP BY. <code>transform</code> returns a result with the same rows and index as the input, each row carrying its group's value, like a window function. <code>filter</code> returns the original rows of only those groups for which a condition is true, like HAVING.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you add a column with each order's share of its city's revenue?</summary><div class="qa-body"><code>df["share"] = df["amount"] / df.groupby("city")["amount"].transform("sum")</code>. Transform puts the city total on every row with the original index, so the division lines up. Assigning <code>df.groupby("city")["amount"].sum()</code> directly would give NaN, because its index is the city names, not the row labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you avoid <code>groupby().apply()</code> where possible?</summary><div class="qa-body"><code>apply</code> calls a Python function once per group and cannot use pandas' compiled group routines, so it becomes slow with many groups: a weighted mean over 20,000 customers took about 2.5 s with apply and about 0.1 s rewritten as two built-in group sums and a division. Use built-in aggregations, <code>transform</code> and column arithmetic first, and apply only when the logic truly needs a whole sub-table.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get the top 2 orders by amount in each city?</summary><div class="qa-body"><code>df.sort_values("amount", ascending=False).groupby("city").head(2)</code>. Alternatively, rank within groups with <code>df.groupby("city")["amount"].rank(ascending=False)</code> and keep ranks up to 2, or use <code>nlargest</code> inside <code>apply</code>, which is slower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to rows with a missing key in groupby?</summary><div class="qa-body">By default they are dropped, so their values disappear from every group total and the totals no longer add up to the table total. Pass <code>dropna=False</code> to keep missing keys as their own group, or check that group sizes sum to the number of rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between merge, join and concat?</summary><div class="qa-body"><code>merge</code> is a SQL-style join that matches rows of two tables on key columns (or indexes), with <code>how</code> choosing inner, left, right or outer. <code>join</code> is a shortcut that joins on the index, left by default. <code>concat</code> does not match keys at all: it stacks tables along rows (like UNION ALL) or places them side by side along columns, aligning on labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain inner, left, right and outer joins and how many rows each returns.</summary><div class="qa-body">Inner keeps only keys present in both tables; left keeps all left rows with NaN where there is no match; right keeps all right rows; outer keeps all rows from both. With 11 orders of which 10 match the restaurants table, and one restaurant without orders: inner 10, left 11, right 11, outer 12, as long as the lookup keys are unique.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After a left merge your table has more rows than before. What happened and how do you prevent it?</summary><div class="qa-body">The right table has duplicate keys, so each matching left row is repeated once per duplicate (fan-out), inflating every sum. Find the culprits with <code>right[right["key"].duplicated(keep=False)]</code>, fix or de-duplicate the lookup table, and add <code>validate="many_to_one"</code> plus an assertion that the row count is unchanged, so the merge fails loudly next time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>validate=</code> do in merge?</summary><div class="qa-body">It checks the uniqueness of the keys before merging, according to the relationship you declare: <code>"one_to_one"</code>, <code>"one_to_many"</code>, <code>"many_to_one"</code> or <code>"many_to_many"</code>. If the data breaks the declared relationship, pandas raises <code>MergeError</code> instead of silently multiplying rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find customers who never placed an order?</summary><div class="qa-body">An anti-join: <code>customers[~customers["customer"].isin(orders["customer"])]</code>, or <code>customers.merge(orders, on="customer", how="left", indicator=True)</code> followed by keeping rows where <code>_merge == "left_only"</code>. The merge version keeps all columns and supports multi-column keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A merge returns far fewer rows than expected. What would you check?</summary><div class="qa-body">Whether the join type is inner by default and should be left; whether the key dtypes match (int vs str, which pandas refuses to merge); and whether text keys differ in spacing, case or spelling, which silently match nothing. Use <code>indicator=True</code> to see the unmatched rows and inspect their keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between pivot and pivot_table?</summary><div class="qa-body"><code>pivot</code> only reshapes and raises an error if any (index, column) pair occurs more than once. <code>pivot_table</code> groups and aggregates, so it handles repeated pairs, and supports <code>fill_value</code> and <code>margins</code>. Its default aggregation is the mean, so pass <code>aggfunc="sum"</code> when you want totals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are long and wide formats, and how do you convert between them?</summary><div class="qa-body">Long format has one row per observation, such as (day, city, revenue); wide format spreads one variable across columns, such as one column per city. Long is better for grouping, filtering and most plotting libraries; wide is better for reading. Use <code>pivot_table</code> or <code>pivot</code> (or <code>unstack</code>) for long to wide, and <code>melt</code> (or <code>stack</code>) for wide to long.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do stack and unstack do?</summary><div class="qa-body"><code>unstack</code> moves an index level (by default the innermost) into the columns, turning a long MultiIndex Series into a grid. <code>stack</code> moves the columns back into the innermost index level. pivot_table is essentially groupby, aggregate, then unstack.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a crosstab and when would you use it?</summary><div class="qa-body"><code>pd.crosstab(a, b)</code> counts how many rows fall into each combination of two categorical columns, such as orders per city and restaurant. <code>margins=True</code> adds totals and <code>normalize="index"</code> turns counts into shares within each row. It is the quick way to build frequency tables and contingency tables for tests such as chi-square.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do these pandas operations map to SQL?</summary><div class="qa-body">groupby with agg is <code>GROUP BY</code>; filter is <code>HAVING</code>; transform is a window function such as <code>SUM(x) OVER (PARTITION BY k)</code>; merge is <code>JOIN</code>; concat along rows is <code>UNION ALL</code>; pivot_table is conditional aggregation or <code>PIVOT</code>. The same pitfalls, such as fan-out on duplicate join keys, exist in both.</div></details>
</main>
`
});
