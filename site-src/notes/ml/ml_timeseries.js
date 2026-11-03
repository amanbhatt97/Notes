// notes/ml/ml_timeseries.js — Time Series Basics
Object.assign(TOPIC_CONTENT, {
  "ml_timeseries": `<main>
  <h1>Time Series Basics</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>Time Series Basics</span></div>
  <p class="lead">A time series is one quantity measured again and again at regular steps: a shop's sales every month, a website's orders every day, a city's temperature every hour. Unlike the rows of an ordinary table, its values come in an order that cannot be shuffled, and each value depends on the ones before it. That single fact changes how we look at the data, how we prepare it and how we test any model built on it, and every forecasting method (ARIMA, exponential smoothing, Prophet, gradient boosting) stands on the tools in this page. We will use one running example throughout: five years of monthly sales of Meera's small chai shop, sixty numbers in ₹ thousand, together with a flag for the months when she ran a discount offer. We will pull those sixty numbers apart into trend, season and noise, check whether their behaviour is stable, make them stable, measure how far back their memory reaches, and finally turn that memory into honest input columns for a model.</p>

  <h2 id="ts-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Time Series Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Order matters</div>
        <ul>
          <li>Autocorrelation: this month vs last month 0.916; shuffled −0.04</li>
          <li>Rows are not independent: split by time, never at random</li>
          <li>Leakage: any number not known when the forecast is made</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Seeing the parts</div>
        <ul>
          <li><b>resample</b> changes the time step; <b>rolling</b> smooths</li>
          <li>y = trend + season + remainder (or ×)</li>
          <li>Classical: 2×12 moving average; STL: loess, robust, no gaps</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stationarity</div>
        <ul>
          <li>Constant mean, variance and autocorrelation over time</li>
          <li>ADF: H₀ unit root (small p = stationary); KPSS: the reverse</li>
          <li>Fix: diff(1) for trend, diff(12) for season, log/Box-Cox for growing swing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory</div>
        <ul>
          <li>ACF: correlation with lag k; noise band ±1.96/√n</li>
          <li>PACF: direct link only; PACF(2) = (r₂ − r₁²)/(1 − r₁²)</li>
          <li>Lag features: shift first, then roll</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ts-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Makes Time Series Different</span><span class="rm-sub">order, autocorrelation and leakage</span></div></div>
      <div class="rm-item rm-done" data-target="ts-resample"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Resampling and Rolling Windows</span><span class="rm-sub">changing the time step, smoothing the noise</span></div></div>
      <div class="rm-item rm-done" data-target="ts-components"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Trend, Season, Cycle and Noise</span><span class="rm-sub">the four kinds of movement in a series</span></div></div>
      <div class="rm-item rm-done" data-target="ts-decomp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Classical Decomposition</span><span class="rm-sub">measuring each part by hand; add or multiply</span></div></div>
      <div class="rm-item rm-done" data-target="ts-stl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">STL Decomposition</span><span class="rm-sub">a flexible, robust version</span></div></div>
      <div class="rm-item rm-done" data-target="ts-stationarity"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Stationarity</span><span class="rm-sub">when can the past teach us about the future?</span></div></div>
      <div class="rm-item rm-done" data-target="ts-tests"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The ADF and KPSS Tests</span><span class="rm-sub">deciding stationarity with a number</span></div></div>
      <div class="rm-item rm-done" data-target="ts-diff"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Differencing and Transforms</span><span class="rm-sub">making a series stable, and undoing it</span></div></div>
      <div class="rm-item rm-done" data-target="ts-acf"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The ACF</span><span class="rm-sub">how strongly a month is linked to each past month</span></div></div>
      <div class="rm-item rm-done" data-target="ts-pacf"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The PACF</span><span class="rm-sub">direct links only, and reading the two plots</span></div></div>
      <div class="rm-item rm-done" data-target="ts-lags"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Lag Features</span><span class="rm-sub">memory as input columns, without cheating</span></div></div>
      <div class="rm-item rm-done" data-target="ts-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">random splits, wrong aggregation, backwards tests</span></div></div>
      <div class="rm-item rm-done" data-target="ts-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, the shop's numbers</span></div></div>
      <div class="rm-item rm-done" data-target="ts-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about time series</span></div></div>
    </div>
  </div>

  <h2 id="ts-what"><span class="num">01</span>What Makes Time Series Different</h2>
  <p>Almost every model you have met so far treated its rows as independent examples: one house, one customer, one email. You could shuffle the rows, split them into training and test sets at random, and nothing would change. Meera, who runs a small chai and snacks shop, now hands us something different. Her books give one number per month, total sales in ₹ thousand, for January 2020 to December 2024, and she has also noted the months when she ran a discount offer (a spring "chai festival" in some years and a Diwali offer in most Octobers). She wants to know what next month will look like. Can we treat her sixty months like sixty independent rows?</p>
  <p>Let us load the numbers and look. A <strong>time series</strong> is exactly this kind of data: a sequence of values of one quantity, y₁, y₂, …, yₙ, observed at equally spaced times. In pandas we store it as a Series whose index is a list of dates, so that pandas knows the time step and can shift, group and smooth by time.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
sales = [ 99,  94, 101, 101,  89,  97, 106, 112, 114, 126, 124, 118,   # 2020
         112, 105, 111, 111,  98, 105, 115, 119, 117, 121, 124, 115,   # 2021
         110, 104, 114, 100,  98, 104, 114, 121, 120, 132, 129, 126,   # 2022
         125, 120, 125, 118, 119, 120, 128, 134, 132, 142, 141, 138,   # 2023
         133, 128, 136, 136, 129, 136, 144, 150, 147, 160, 160, 160]   # 2024
promo = [0,0,0,1,0,0,0,0,0,1,0,0,  0,0,0,1,0,0,0,0,0,0,0,0,  0,0,1,0,0,0,0,0,0,1,0,0,
         0,0,0,0,1,0,0,0,0,1,0,0,  0,0,0,1,0,0,0,0,0,1,0,0]
shop = pd.DataFrame({"sales": sales, "promo": promo},
                    index=pd.date_range("2020-01-01", periods=60, freq="MS"))  # MS = month start
y = shop["sales"]                                    # Rs thousand per month

table = pd.DataFrame(y.values.reshape(5, 12), index=range(2020, 2025),
                     columns=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])
print(table)
print(pd.DataFrame({"y_t": y, "y_t-1": y.shift(1)}).head(4))
print("corr(this month, last month) =", round(y.corr(y.shift(1)), 3))
shuffled = pd.Series(np.random.default_rng(0).permutation(y.values), index=y.index)
print("same 60 numbers, shuffled   =", round(shuffled.corr(shuffled.shift(1)), 3))</div>
  <div class="fx" data-lang="text">      Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
2020   99   94  101  101   89   97  106  112  114  126  124  118
2021  112  105  111  111   98  105  115  119  117  121  124  115
2022  110  104  114  100   98  104  114  121  120  132  129  126
2023  125  120  125  118  119  120  128  134  132  142  141  138
2024  133  128  136  136  129  136  144  150  147  160  160  160
            y_t  y_t-1
2020-01-01   99    NaN
2020-02-01   94   99.0
2020-03-01  101   94.0
2020-04-01  101  101.0
corr(this month, last month) = 0.916
same 60 numbers, shuffled   = -0.04</div>
  <p><code>pd.date_range("2020-01-01", periods=60, freq="MS")</code> builds sixty month-start dates, a <strong>DatetimeIndex</strong>. Reshaping the values into a 5 × 12 table makes two patterns visible without any maths: every row is higher than the one above it (the shop is growing), and inside every row October and November are high while May is low (a pattern that repeats each year). <code>y.shift(1)</code> slides the column down by one row, so each month sits next to the month before it: February's 94 now sits beside January's 99.</p>
  <p>The last two lines answer our question. The ordinary Pearson correlation between "this month" and "last month" is 0.916, a very strong link: big months follow big months. After shuffling the same sixty numbers into a random order, the correlation drops to −0.04, no link at all. The values are identical; only the order changed, and the information vanished with it. The correlation of a series with its own past is called <strong>autocorrelation</strong> ("self-correlation"), and the past value k steps back, y<sub>t−k</sub>, is called <strong>lag k</strong>. Think of a batter's scores over a cricket season. Shuffle the innings and you can still compute her average, but you lose the fact that she is "in form": a run of good scores tends to continue. Forecasting is about form, and form lives in the order.</p>
  <figure class="viz"><svg viewBox="0 0 680 262" width="680"><line x1="60" y1="207.5" x2="660" y2="207.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="211.5" text-anchor="end" class="tm" font-size="10.5">90</text><line x1="60" y1="157.5" x2="660" y2="157.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="161.5" text-anchor="end" class="tm" font-size="10.5">110</text><line x1="60" y1="107.5" x2="660" y2="107.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="111.5" text-anchor="end" class="tm" font-size="10.5">130</text><line x1="60" y1="57.5" x2="660" y2="57.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="61.5" text-anchor="end" class="tm" font-size="10.5">150</text><line x1="60.0" y1="20" x2="60.0" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="110.0" y="238" text-anchor="middle" class="tm" font-size="11">2020</text><line x1="182.0" y1="20" x2="182.0" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="232.0" y="238" text-anchor="middle" class="tm" font-size="11">2021</text><line x1="304.1" y1="20" x2="304.1" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="354.1" y="238" text-anchor="middle" class="tm" font-size="11">2022</text><line x1="426.1" y1="20" x2="426.1" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="476.1" y="238" text-anchor="middle" class="tm" font-size="11">2023</text><line x1="548.1" y1="20" x2="548.1" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="598.1" y="238" text-anchor="middle" class="tm" font-size="11">2024</text><polyline points="60.0,185.0 70.2,197.5 80.3,180.0 90.5,180.0 100.7,210.0 110.8,190.0 121.0,167.5 131.2,152.5 141.4,147.5 151.5,117.5 161.7,122.5 171.9,137.5 182.0,152.5 192.2,170.0 202.4,155.0 212.5,155.0 222.7,187.5 232.9,170.0 243.1,145.0 253.2,135.0 263.4,140.0 273.6,130.0 283.7,122.5 293.9,145.0 304.1,157.5 314.2,172.5 324.4,147.5 334.6,182.5 344.7,187.5 354.9,172.5 365.1,147.5 375.3,130.0 385.4,132.5 395.6,102.5 405.8,110.0 415.9,117.5 426.1,120.0 436.3,132.5 446.4,120.0 456.6,137.5 466.8,135.0 476.9,132.5 487.1,112.5 497.3,97.5 507.5,102.5 517.6,77.5 527.8,80.0 538.0,87.5 548.1,100.0 558.3,112.5 568.5,92.5 578.6,92.5 588.8,110.0 599.0,92.5 609.2,72.5 619.3,57.5 629.5,65.0 639.7,32.5 649.8,32.5 660.0,32.5" fill="none" class="sb" stroke-width="1.8"/><polyline points="121.0,164.3 131.2,161.8 141.4,159.6 151.5,157.5 161.7,155.5 171.9,153.8 182.0,152.0 192.2,150.3 202.4,149.3 212.5,149.5 222.7,150.0 232.9,150.3 243.1,150.8 253.2,151.1 263.4,150.9 273.6,151.8 283.7,152.9 293.9,153.0 304.1,153.2 314.2,153.1 324.4,152.6 334.6,151.1 344.7,149.5 354.9,147.8 365.1,145.1 375.3,141.9 385.4,139.1 395.6,136.0 405.8,132.0 415.9,128.1 426.1,125.0 436.3,122.2 446.4,119.6 456.6,117.3 466.8,115.0 476.9,112.5 487.1,110.4 497.3,108.8 507.5,106.8 517.6,103.8 527.8,100.8 538.0,98.1 548.1,94.8 558.3,91.5 568.5,88.2 578.6,84.8 588.8,80.9 599.0,76.7" fill="none" class="sr" stroke-width="2.2" stroke-dasharray="6 4"/><circle cx="90.5" cy="180.0" r="4" class="fg sg" stroke-width="1.5"/><circle cx="151.5" cy="117.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="212.5" cy="155.0" r="4" class="fg sg" stroke-width="1.5"/><circle cx="324.4" cy="147.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="395.6" cy="102.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="466.8" cy="135.0" r="4" class="fg sg" stroke-width="1.5"/><circle cx="517.6" cy="77.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="578.6" cy="92.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="639.7" cy="32.5" r="4" class="fg sg" stroke-width="1.5"/><line x1="70" y1="252" x2="96" y2="252" class="sb" stroke-width="2"/><text x="102" y="256" font-size="11">monthly sales</text><line x1="220" y1="252" x2="246" y2="252" class="sr" stroke-width="2.2" stroke-dasharray="6 4"/><text x="252" y="256" font-size="11">trend (2x12 moving average)</text><circle cx="470" cy="252" r="4" class="fg sg"/><text x="480" y="256" font-size="11">promotion month</text></svg><figcaption>Meera's monthly sales (₹ thousand) with the trend (dashed) and the promotion months (dots). Sales climb, rise every autumn and dip every early summer.</figcaption></figure>
  <p>Because the rows are linked, the usual habits break. In ordinary machine learning the rows are assumed <strong>i.i.d.</strong> (independent and identically distributed), so a random train/test split is fair. With a time series, a random split would let a model train on March 2024 and be tested on February 2024. It would be filling a gap between two known neighbours, something it can never do in real life, where only the past is available. Its score would look excellent and then collapse once the model is used for real. So with time series we always train on the past and test on the later future. The general name for this kind of cheating is <strong>leakage</strong>: any information used in training or in the features that would not be available at the moment the real forecast is made. Leakage is the biggest danger in time series work, far more common than ordinary overfitting.</p>
  <table class="tbl">
    <tr><th></th><th>Tabular ML (houses, customers)</th><th>Time series (Meera's months)</th></tr>
    <tr><td>Row order</td><td>Irrelevant; shuffle freely</td><td>The order is the information</td></tr>
    <tr><td>Rows independent?</td><td>Assumed i.i.d.</td><td>No: autocorrelation 0.916</td></tr>
    <tr><td>Main input</td><td>Other columns</td><td>The series' own past, plus calendar and promotions</td></tr>
    <tr><td>Validation</td><td>Random k-fold</td><td>Train on the past, test on the future</td></tr>
    <tr><td>Biggest danger</td><td>Overfitting</td><td>Leakage of future information</td></tr>
  </table>
  <p>A few words will come up constantly, so it is worth fixing them now. The <strong>frequency</strong> is the time step (monthly here). The <strong>seasonal period</strong> s is the number of steps in one repeating cycle: 12 for monthly data with a yearly pattern, 7 for daily data with a weekly pattern, 24 for hourly data with a daily pattern. The <strong>forecast horizon</strong> h is how many steps ahead we predict: "next month" is h = 1, "all of next year" is h = 1 to 12. A <strong>univariate</strong> series is the series alone; outside inputs that help predict it, such as Meera's promotion flag, are called <strong>exogenous variables</strong>.</p>

  <h2 id="ts-resample"><span class="num">02</span>Resampling and Rolling Windows</h2>
  <p>Data rarely arrives at the time step we want. Meera's till records every day, but she plans in months, so the first job is to change the time step. And even at the right step, the line wiggles; to see its shape we need to smooth it. These are the two everyday pandas tools for time series.</p>
  <p><strong>Resampling</strong> means re-indexing a series to a new frequency. Going from a fine step to a coarse one (days to months) is called down-sampling and needs an aggregation rule: sum for sales, mean for temperature, the last value for a month-end stock price. Going the other way (months to days) is up-sampling and needs a fill rule such as forward fill or interpolation. In pandas both are written <code>series.resample(rule).agg()</code>, which behaves like a <code>groupby</code> on time buckets.</p>
  <p>To have a daily till log to work with, we rebuild one from the monthly books, assuming a weekend day sells 1.4 times a weekday. Let us check one month by hand first. January 2020 starts on a Wednesday and has 31 days, of which 8 are weekend days (the 4th, 5th, 11th, 12th, 18th, 19th, 25th and 26th) and 23 are weekdays. That is 23 × 1 + 8 × 1.4 = 34.2 "weekday units", so one weekday unit is 99 / 34.2 = 2.895 thousand and a weekend day is 2.895 × 1.4 = 4.053. The first, short week (Wednesday 1 to Sunday 5 January) adds up to 3 × 2.895 + 2 × 4.053 = 16.79.</p>
  <div class="fx" data-lang="py"># Rebuild the till's DAILY log from the monthly books: weekends sell 1.4x a weekday
days = pd.date_range("2020-01-01", "2024-12-31", freq="D")
weight = pd.Series(np.where(days.dayofweek &gt;= 5, 1.4, 1.0), index=days)   # 5, 6 = Sat, Sun
share = weight / weight.groupby(days.to_period("M")).transform("sum")       # each day's share of its month
daily = share * y.reindex(days, method="ffill")                             # Rs thousand per day
print(daily["2020-01-01":"2020-01-07"].round(3).to_frame("daily").assign(day=lambda d: d.index.day_name()))
print("days in log:", len(daily))

monthly = daily.resample("MS").sum().round(1)          # down-sample: days -&gt; months
weekly = daily.resample("W-SUN").sum().round(2)        # weeks ending Sunday
print("monthly from daily:", monthly.head(3).tolist(), " weekly:", weekly.head(2).tolist())

roll = pd.DataFrame({"sales": y,
                     "trail_3": y.rolling(3).mean().round(2),              # this month and the 2 before
                     "centre_3": y.rolling(3, center=True).mean().round(2),
                     "trail_12": y.rolling(12).mean().round(2),
                     "expanding": y.expanding().mean().round(2)})
print(roll.iloc[[0, 1, 2, 3, 11, 12]])
print("12-month rolling mean, each December:", y.rolling(12).mean()[11::12].round(2).tolist())
print("12-month rolling std,  each December:", y.rolling(12).std()[11::12].round(2).tolist())</div>
  <div class="fx" data-lang="text">            daily        day
2020-01-01  2.895  Wednesday
2020-01-02  2.895   Thursday
2020-01-03  2.895     Friday
2020-01-04  4.053   Saturday
2020-01-05  4.053     Sunday
2020-01-06  2.895     Monday
2020-01-07  2.895    Tuesday
days in log: 1827
monthly from daily: [99.0, 94.0, 101.0]  weekly: [16.79, 22.58]
            sales  trail_3  centre_3  trail_12  expanding
2020-01-01     99      NaN       NaN       NaN      99.00
2020-02-01     94      NaN     98.00       NaN      96.50
2020-03-01    101    98.00     98.67       NaN      98.00
2020-04-01    101    98.67     97.00       NaN      98.75
2020-12-01    118   122.67    118.00    106.75     106.75
2021-01-01    112   118.00    111.67    107.83     107.15
12-month rolling mean, each December: [106.75, 112.75, 114.33, 128.5, 143.25]
12-month rolling std,  each December: [11.96, 7.42, 11.46, 8.74, 12.06]</div>
  <p><code>days.dayofweek &gt;= 5</code> is True for Saturday and Sunday. <code>groupby(days.to_period("M")).transform("sum")</code> gives each day its month's total weight, so <code>share</code> is the day's fraction of its month, and multiplying by the month's sales gives 1,827 daily values (2020 and 2024 are leap years). The first rows match our hand numbers: 2.895 on weekdays and 4.053 at the weekend. Down-sampling with <code>resample("MS").sum()</code> buckets the days by month start and adds them up, returning exactly 99, 94 and 101. <code>"W-SUN"</code> makes weeks that end on Sunday: 16.79 for the short first week, as computed by hand.</p>
  <p>Now the smoothing. A <strong>rolling mean</strong> of width k replaces each value by the average of a window of k values. A <strong>trailing</strong> window uses the current value and the k − 1 before it, so it only looks at the past; a <strong>centred</strong> window (<code>center=True</code>) uses values on both sides. Look at the table for the first months of 2020. The trailing 3-month mean is missing for January and February (not enough history) and is (99 + 94 + 101)/3 = 98.00 in March. The centred 3-month mean is 98.00 in February: it is the same window, only labelled at its middle instead of its end. That label is the whole difference between "describing the past afterwards" and "something you could have known at the time". Think of a batter's average over her last 10 innings: it is known after every innings and is fair to use when picking tomorrow's team. Her average over the 5 innings before and 5 after a match is a fine way for a commentator to describe the season later, and useless for picking tomorrow's team.</p>
  <p>A 12-month window covers exactly one full season, so the October peak and the May dip cancel out inside it and only the level is left. Its value each December (106.75, 112.75, 114.33, 128.50, 143.25) is simply each year's mean, and it shows the trend clearly: slow growth in 2021 and 2022, faster from 2023. The rolling standard deviation (11.96, 7.42, 11.46, 8.74, 12.06) measures the spread inside each year; notice that it does not grow as sales grow, a fact we will use in section 04. Two relatives are worth knowing. An <strong>expanding</strong> mean uses all history so far (in December 2020 it equals the 12-month mean, since only 12 months exist). An <strong>exponentially weighted</strong> mean, <code>ewm</code>, gives recent months more weight than old ones; it is the seed of exponential smoothing in <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>.</p>

  <h2 id="ts-components"><span class="num">03</span>Trend, Season, Cycle and Noise</h2>
  <p>The 12-month mean showed a smooth climb, but smoothing threw away the autumn peaks and the May dips. If we try to model the raw sales line as one wiggly thing, we mix several different stories. It is far easier to understand a series as a sum of simpler movements, each with its own cause. Time series analysts usually name four.</p>
  <p>The <strong>trend</strong> is the slow, long-run direction of the level: Meera's sales rise by roughly ₹9 thousand a year. <strong>Seasonality</strong> is a pattern that repeats with a fixed, known period: October and November are high (Diwali and cool evenings), May is low (summer heat), every year. A <strong>cycle</strong> is a rise and fall with no fixed period, usually over several years, such as the slowdown of 2021 and 2022. <strong>Noise</strong> (also called the irregular or remainder part) is whatever is left: month-to-month surprises like a rainy week or a road closure. Think of your own body weight over five years: a slow gain (trend), a bump every festive season and a dip every summer (season), a year of fitness enthusiasm followed by a relapse (cycle, no fixed period), and the bathroom scale reading a little differently each morning (noise).</p>
  <p>A crude first way to see the season is to take each year's mean as its level, and look at how far each month sits above or below it. If the same months are always high, that is seasonality.</p>
  <div class="fx" data-lang="py">year_mean = table.mean(axis=1)                       # level of each year
print("yearly mean:", year_mean.round(2).tolist())
print("growth per year:", year_mean.diff().round(2).tolist()[1:])
dev = table.sub(year_mean, axis=0)                   # each month minus its own year's mean
print(dev.round(1))
print("average shape:", dev.mean().round(1).tolist())
print("peak-to-trough swing per year:", (table.max(axis=1) - table.min(axis=1)).tolist())</div>
  <div class="fx" data-lang="text">yearly mean: [106.75, 112.75, 114.33, 128.5, 143.25]
growth per year: [6.0, 1.58, 14.17, 14.75]
       Jan   Feb  Mar   Apr   May   Jun  Jul  Aug  Sep   Oct   Nov   Dec
2020  -7.8 -12.8 -5.8  -5.8 -17.8  -9.8 -0.8  5.2  7.2  19.2  17.2  11.2
2021  -0.8  -7.8 -1.8  -1.8 -14.8  -7.8  2.2  6.2  4.2   8.2  11.2   2.2
2022  -4.3 -10.3 -0.3 -14.3 -16.3 -10.3 -0.3  6.7  5.7  17.7  14.7  11.7
2023  -3.5  -8.5 -3.5 -10.5  -9.5  -8.5 -0.5  5.5  3.5  13.5  12.5   9.5
2024 -10.2 -15.2 -7.2  -7.2 -14.2  -7.2  0.8  6.8  3.8  16.8  16.8  16.8
average shape: [-5.3, -10.9, -3.7, -7.9, -14.5, -8.7, 0.3, 6.1, 4.9, 15.1, 14.5, 10.3]
peak-to-trough swing per year: [37, 26, 34, 24, 32]</div>
  <p>Every row has the same shape: April and May are lowest (−9.5 to −17.8), October to December highest (up to +19.2). That repetition is the seasonality. The yearly means rise by 6.0, 1.6, 14.2 and 14.8: a trend whose speed changes, which is the "cycle" part, a slowdown in 2021 and 2022 with no fixed period. The year-to-year wobble of the same month, such as October 2021 at +8.2 against +19.2 a year earlier, is noise or something we have not modelled yet (October 2021 is the only October without a Diwali offer). The yearly swing from lowest to highest month is 37, 26, 34, 24, 32: it does not grow as the shop grows.</p>
  <p>This crude method has a flaw. The trend also rises <em>within</em> each year, about ₹1 thousand a month, so January, sitting at the start of the year, looks low partly just because the year has not grown yet. The average shape says January is −5.3; the proper method in the next section will say −0.5. One more point of vocabulary: a pattern is seasonal only if its period is fixed and can be named in advance (12 months, 7 days, 24 hours). A three-year business cycle is not seasonal, and a model that treats it as a fixed season will forecast a dip that never comes. Decomposition methods usually merge the cycle into the trend and call it the "trend-cycle".</p>

  <h2 id="ts-decomp"><span class="num">04</span>Classical Decomposition</h2>
  <p>We now want, for every single month, three numbers that add back to the sales figure: how much of it is trend, how much is season, and how much is left over. Splitting a series this way is called <strong>decomposition</strong>. The additive version writes y<sub>t</sub> = T<sub>t</sub> + S<sub>t</sub> + R<sub>t</sub>: trend plus seasonal plus remainder (also called the residual).</p>
  <p>The idea behind the classical method is simple. If you average over exactly one full season, the seasonal ups and downs cancel and only the level is left. So a moving average of width 12, centred on a month, estimates the trend at that month. Subtract it and what remains is season plus noise. Average that remainder over all the Novembers and the noise mostly cancels too, leaving November's seasonal effect. Whatever is still left after removing both is the residual.</p>
  <p>There is one technical wrinkle. Twelve is an even number, so a 12-month window has no middle month: its centre falls between June and July. The fix is to average two neighbouring 12-month windows (January to December, and February to the next January). That is the same as one 13-month window in which the two end months count half, and it is called a <strong>2×12 moving average</strong>. For July 2020:</p>
  <p>T(July 2020) = (½·99 + 94 + 101 + 101 + 89 + 97 + 106 + 112 + 114 + 126 + 124 + 118 + ½·112) / 12 = (49.5 + 1182 + 56) / 12 = 107.292.</p>
  <p>The first month with six months on each side is July 2020 and the last is June 2024, so the trend is simply missing for the first six and the last six months. Next we detrend: November 2020 sits 124 − 110.792 = 13.208 above its trend, and the four Novembers that have a trend give 13.208, 12.167, 8.792 and 8.333. Their average, 10.625, is November's raw seasonal index. We then centre the twelve indices so that they add to zero over a year (otherwise part of the level would be hiding inside the season): the raw indices add to 0.354, so we subtract 0.354/12 = 0.03 from each, and November becomes 10.60. Finally the residual: November 2020 is 124 − 110.79 − 10.60 = +2.61. The code repeats every hand step and then checks against statsmodels' <code>seasonal_decompose</code>.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.seasonal import seasonal_decompose
v = y.values
# Step 1: trend for July 2020 (position 6) = 2x12 centred moving average
trend_jul = (v[0] / 2 + v[1:12].sum() + v[12] / 2) / 12
print(f"trend Jul 2020 = ({v[0]}/2 + {v[1:12].sum()} + {v[12]}/2) / 12 = {trend_jul:.3f}")
trend = y.rolling(12, center=True).mean().rolling(2).mean().shift(-1)   # same 2x12 MA for every month
print("first trend values:", trend.dropna().head(3).round(3).tolist(), " missing at ends:", int(trend.isna().sum()))

# Steps 2-4: detrend, average each calendar month, centre so the 12 indices add to 0
detr = y - trend
nov = detr[detr.index.month == 11].dropna()
print("Nov detrended:", nov.round(3).tolist(), " mean:", round(nov.mean(), 3))
raw_idx = detr.groupby(detr.index.month).mean()
season = raw_idx - raw_idx.mean()
print("sum of raw indices:", round(raw_idx.sum(), 3), " -&gt; subtract", round(raw_idx.mean(), 3), "from each")
print("seasonal indices:", season.round(2).tolist())

# Step 5: residual = y - trend - seasonal
resid = y - trend - season.reindex(y.index.month).values
print(f"Nov 2020: {v[10]} = trend {trend.iloc[10]:.2f} + seasonal {season[11]:.2f} + resid {resid.iloc[10]:.2f}")
dec = seasonal_decompose(y, model="additive", period=12)
print("matches statsmodels:", np.allclose(dec.seasonal[:12].values, season.values),
      np.allclose(dec.trend.dropna(), trend.dropna()))</div>
  <div class="fx" data-lang="text">trend Jul 2020 = (99/2 + 1182 + 112/2) / 12 = 107.292
first trend values: [107.292, 108.292, 109.167]  missing at ends: 12
Nov detrended: [13.208, 12.167, 8.792, 8.333]  mean: 10.625
sum of raw indices: 0.354  -&gt; subtract 0.03 from each
seasonal indices: [-0.53, -7.07, -0.56, -6.51, -12.49, -8.05, -0.22, 4.82, 3.36, 12.13, 10.6, 4.52]
Nov 2020: 124 = trend 110.79 + seasonal 10.60 + resid 2.61
matches statsmodels: True True</div>
  <p><code>y.rolling(12, center=True).mean().rolling(2).mean().shift(-1)</code> is the 2×12 average for every month at once: a 12-wide window, then the mean of two neighbouring windows, shifted to line up with the centre month. Both the trend and the twelve seasonal indices match statsmodels (True True). The indices read like a calendar of the shop: May −12.49 (summer heat), February −7.07 (a short month), October +12.13 and November +10.60 (Diwali and cool evenings). January is now −0.53, not the −5.3 of the crude method, because the trend is allowed to move within the year.</p>
  <figure class="viz"><svg viewBox="0 0 680 362" width="680"><rect x="90" y="10" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="49" text-anchor="end" font-size="11.5">observed</text><text x="664" y="20" class="tm" font-size="9.5">165</text><text x="664" y="80" class="tm" font-size="9.5">85</text><polyline points="90.0,67.8 99.7,72.1 109.3,66.0 119.0,66.0 128.6,76.5 138.3,69.5 148.0,61.6 157.6,56.4 167.3,54.6 176.9,44.1 186.6,45.9 196.3,51.1 205.9,56.4 215.6,62.5 225.3,57.2 234.9,57.2 244.6,68.6 254.2,62.5 263.9,53.8 273.6,50.2 283.2,52.0 292.9,48.5 302.5,45.9 312.2,53.8 321.9,58.1 331.5,63.4 341.2,54.6 350.8,66.9 360.5,68.6 370.2,63.4 379.8,54.6 389.5,48.5 399.2,49.4 408.8,38.9 418.5,41.5 428.1,44.1 437.8,45.0 447.5,49.4 457.1,45.0 466.8,51.1 476.4,50.2 486.1,49.4 495.8,42.4 505.4,37.1 515.1,38.9 524.7,30.1 534.4,31.0 544.1,33.6 553.7,38.0 563.4,42.4 573.1,35.4 582.7,35.4 592.4,41.5 602.0,35.4 611.7,28.4 621.4,23.1 631.0,25.8 640.7,14.4 650.3,14.4 660.0,14.4" fill="none" class="sb" stroke-width="1.7"/><rect x="90" y="98" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="137" text-anchor="end" font-size="11.5">trend</text><text x="664" y="108" class="tm" font-size="9.5">165</text><text x="664" y="168" class="tm" font-size="9.5">85</text><polyline points="148.0,148.5 157.6,147.6 167.3,146.9 176.9,146.1 186.6,145.4 196.3,144.8 205.9,144.2 215.6,143.6 225.3,143.2 234.9,143.3 244.6,143.5 254.2,143.6 263.9,143.8 273.6,143.9 283.2,143.8 292.9,144.1 302.5,144.5 312.2,144.6 321.9,144.6 331.5,144.6 341.2,144.4 350.8,143.9 360.5,143.3 370.2,142.7 379.8,141.8 389.5,140.7 399.2,139.7 408.8,138.6 418.5,137.2 428.1,135.8 437.8,134.8 447.5,133.8 457.1,132.9 466.8,132.1 476.4,131.2 486.1,130.4 495.8,129.6 505.4,129.1 515.1,128.4 524.7,127.3 534.4,126.3 544.1,125.3 553.7,124.2 563.4,123.0 573.1,121.9 582.7,120.7 592.4,119.3 602.0,117.8" fill="none" class="sr" stroke-width="1.7"/><rect x="90" y="186" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="225" text-anchor="end" font-size="11.5">seasonal</text><line x1="90" y1="221.0" x2="660" y2="221.0" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="3 3"/><text x="664" y="196" class="tm" font-size="9.5">15</text><text x="664" y="256" class="tm" font-size="9.5">-15</text><polyline points="90.0,222.2 99.7,237.5 109.3,222.3 119.0,236.2 128.6,250.1 138.3,239.8 148.0,221.5 157.6,209.7 167.3,213.2 176.9,192.7 186.6,196.3 196.3,210.4 205.9,222.2 215.6,237.5 225.3,222.3 234.9,236.2 244.6,250.1 254.2,239.8 263.9,221.5 273.6,209.7 283.2,213.2 292.9,192.7 302.5,196.3 312.2,210.4 321.9,222.2 331.5,237.5 341.2,222.3 350.8,236.2 360.5,250.1 370.2,239.8 379.8,221.5 389.5,209.7 399.2,213.2 408.8,192.7 418.5,196.3 428.1,210.4 437.8,222.2 447.5,237.5 457.1,222.3 466.8,236.2 476.4,250.1 486.1,239.8 495.8,221.5 505.4,209.7 515.1,213.2 524.7,192.7 534.4,196.3 544.1,210.4 553.7,222.2 563.4,237.5 573.1,222.3 582.7,236.2 592.4,250.1 602.0,239.8 611.7,221.5 621.4,209.7 631.0,213.2 640.7,192.7 650.3,196.3 660.0,210.4" fill="none" class="sg" stroke-width="1.7"/><rect x="90" y="274" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="313" text-anchor="end" font-size="11.5">residual</text><line x1="90" y1="309.0" x2="660" y2="309.0" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="3 3"/><text x="664" y="284" class="tm" font-size="9.5">8</text><text x="664" y="344" class="tm" font-size="9.5">-8</text><polyline points="148.0,313.7 157.6,313.9 167.3,302.5 176.9,292.1 186.6,297.6 196.3,300.3 205.9,307.6 215.6,312.5 225.3,316.6 234.9,290.2 244.6,320.0 254.2,308.2 263.9,297.8 273.6,301.9 283.2,304.5 292.9,324.0 302.5,302.1 312.2,314.7 321.9,314.2 331.5,312.0 341.2,297.6 350.8,335.4 360.5,320.9 370.2,317.0 379.8,312.2 389.5,309.3 399.2,312.2 408.8,303.4 418.5,316.9 428.1,310.2 437.8,297.9 447.5,296.1 457.1,307.3 466.8,315.9 476.4,289.4 486.1,308.8 495.8,311.7 505.4,310.4 515.1,316.2 524.7,316.1 534.4,318.9 544.1,310.2 553.7,315.8 563.4,314.9 573.1,314.0 582.7,294.0 592.4,305.2 602.0,301.5" fill="none" class="st" stroke-width="1.7"/></svg><figcaption>Classical additive decomposition of Meera's sales: observed = trend + seasonal + residual. The trend is missing for six months at each end; the seasonal row repeats exactly every year; the residual has no visible pattern.</figcaption></figure>
  <p>So far we have <em>added</em> the parts. That assumes November adds the same ₹10.6 thousand every year, whatever the size of the shop. The alternative is a <strong>multiplicative</strong> decomposition, y = T × S × R, in which seasonal factors sit around 1 and a factor of 1.09 means "9% above trend". Think of a sweet shop: "every Diwali we sell 10 extra boxes" is additive, "every Diwali we sell 10% more" is multiplicative. When the shop doubles in size, the first rule still says 10 boxes and the second now says twice as many. Which one is right depends on a single question: does the seasonal swing grow as the level grows? For Meera it does not. The yearly swing was 37, 26, 34, 24, 32 while yearly sales rose 34%. Let us confirm it with numbers.</p>
  <div class="fx" data-lang="py">mult = seasonal_decompose(y, model="multiplicative", period=12)
print(f"multiplicative Nov 2020: {v[10]} = {mult.trend.iloc[10]:.2f} x {mult.seasonal.iloc[10]:.4f} x {mult.resid.iloc[10]:.4f}")
print("Nov effect in Rs thousand -&gt; additive: always", round(dec.seasonal.iloc[10], 2),
      "| multiplicative: 2020", round(mult.trend.iloc[10] * (mult.seasonal.iloc[10] - 1), 2),
      " 2023", round(mult.trend.iloc[46] * (mult.seasonal.iloc[46] - 1), 2))
err_add = dec.resid.dropna()
err_mul = (mult.trend * mult.seasonal * (mult.resid - 1)).dropna()   # multiplicative error in Rs thousand
print("residual std  additive:", round(err_add.std(), 3), " multiplicative:", round(err_mul.std(), 3))</div>
  <div class="fx" data-lang="text">multiplicative Nov 2020: 124 = 110.79 x 1.0898 x 1.0270
Nov effect in Rs thousand -&gt; additive: always 10.6 | multiplicative: 2020 9.95  2023 11.91
residual std  additive: 2.147  multiplicative: 2.477</div>
  <p>The multiplicative version explains November 2020 as 110.79 × 1.0898 × 1.0270 = 124. Turned into rupees, its November effect grows with the trend, from 9.95 in 2020 to 11.91 in 2023, while the additive effect is 10.60 every year. Converting both residuals into rupees, the additive version leaves less unexplained (standard deviation 2.147 against 2.477), which agrees with the swing check: additive fits this shop. A series whose swing does grow with the level, such as airline passengers or online sales, is multiplicative. A useful trick links the two: taking logs turns a product into a sum, log y = log T + log S + log R, so a multiplicative series becomes additive after a log.</p>
  <p>Decomposition is a tool for understanding a series and choosing a model, not a source of input features. The centred trend at July 2020 used sales up to January 2021, six months in the future, and at the end of the data the trend is missing for exactly the months a forecaster cares about most. Classical decomposition also has three other weaknesses: it forces one fixed seasonal shape on all five years, it loses six months at each end, and a single unusual month (an October without the Diwali offer) bends the averages for every year.</p>

  <h2 id="ts-stl"><span class="num">05</span>STL Decomposition</h2>
  <p>Those three weaknesses are fixed by <strong>STL</strong>, short for Seasonal-Trend decomposition using Loess (Cleveland and colleagues, 1990). It replaces the moving averages with <strong>loess</strong>, local regression: around each point it fits a small straight line, giving nearby points the most weight. Because a local line can be fitted near the edges too, there are no missing values at the ends. STL alternates between two steps: estimate the season (smoothing all Januaries together, all Februaries together, and so on), remove it and estimate the trend, then repeat. Because each calendar month is smoothed across the years rather than averaged into one number, the seasonal shape is allowed to drift slowly. And with <code>robust=True</code>, months with very large residuals receive lower weights in the next round, so they cannot drag the trend and season around.</p>
  <p>Think of classical decomposition as a school timetable printed once for five years. STL is a timetable re-planned each term from the previous terms, which also ignores the one week the school was shut by floods.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.seasonal import STL
stl = STL(y, period=12, robust=True).fit()          # robust: big outliers get down-weighted
parts = pd.DataFrame({"sales": y, "trend": stl.trend, "seasonal": stl.seasonal, "resid": stl.resid}).round(2)
print(parts.iloc[[0, 10, 46, 58]])
print("STL Nov seasonal by year:", stl.seasonal[y.index.month == 11].round(2).tolist())
print("missing values in STL trend:", int(stl.trend.isna().sum()))
adjusted = y - stl.seasonal                          # seasonally adjusted sales
print("seasonally adjusted, Sep-Dec 2024:", adjusted[-4:].round(1).tolist())
strength_season = max(0, 1 - stl.resid.var() / (stl.seasonal + stl.resid).var())
strength_trend = max(0, 1 - stl.resid.var() / (stl.trend + stl.resid).var())
print(f"strength of trend {strength_trend:.2f}, of seasonality {strength_season:.2f}")
big = stl.resid.abs().sort_values(ascending=False).head(5)
print(pd.DataFrame({"resid": stl.resid[big.index].round(2), "promo": shop.promo[big.index]}))</div>
  <div class="fx" data-lang="text">            sales   trend  seasonal  resid
2020-01-01     99  103.45     -4.63   0.18
2020-11-01    124  109.68     14.30   0.02
2023-11-01    141  133.90     11.32  -4.22
2024-11-01    160  149.82     10.24  -0.06
STL Nov seasonal by year: [14.3, 13.35, 12.37, 11.32, 10.24]
missing values in STL trend: 0
seasonally adjusted, Sep-Dec 2024: [147.3, 148.6, 149.8, 151.1]
strength of trend 0.95, of seasonality 0.84
            resid  promo
2022-04-01 -11.08      0
2021-10-01  -8.06      0
2021-12-01  -7.35      0
2023-02-01   6.93      0
2023-01-01   6.76      0</div>
  <p>Every month now has all three parts, including January 2020 and the last months of 2024 (zero missing values). The November effect is allowed to change, from 14.3 in 2020 to 10.24 in 2024, whereas the classical method averaged these into a single 10.60. Subtracting the seasonal part gives the <strong>seasonally adjusted</strong> series, the underlying level month by month (147.3 rising to 151.1 at the end of 2024); government statistics and company reports publish "seasonally adjusted" figures in exactly this way. The two strengths use Hyndman's measure, 1 − var(R)/var(component + R): a trend strength of 0.95 and a seasonal strength of 0.84 mean both parts are strong, so any forecast must handle both.</p>
  <p>The largest residuals are the most interesting lines. April 2022 (−11.1): April usually has the spring offer (2020, 2021 and 2024), but in 2022 it ran in March instead, so April looks weak against an "April season" that secretly includes promotions. October 2021 (−8.1) is the only October without the Diwali offer. The residuals are telling us that the promotion flag matters, and the ARIMA note will feed it in as an exogenous variable. The main settings of <code>STL</code> are <code>period</code>, <code>seasonal</code> (the window for smoothing each calendar month across years: larger means a more stable season) and <code>robust</code>. One limit: STL is additive only. On a series whose swing grows with the level, take logs first, decompose, then turn the parts back with exp.</p>

  <h2 id="ts-stationarity"><span class="num">06</span>Stationarity</h2>
  <p>Decomposition describes what happened. A forecasting model has a harder job: it learns fixed numbers from the past ("next month ≈ 0.6 × this month + …") and applies them to the future. That only works if the past and the future behave alike. Sales averaged 108.8 in the first half of Meera's data and 133.4 in the second. A model that learnt "a typical month is about 109" from the early years would simply be wrong later.</p>
  <p>A series whose behaviour does not change over time is called <strong>stationary</strong>. More precisely, a series is (weakly) stationary when its mean is the same at every time, its variance is the same at every time, and the correlation between any two values depends only on how far apart they are, not on when they occur. Trend breaks the first condition (the mean keeps rising), and so does seasonality (the mean is higher every November). The simplest stationary series is <strong>white noise</strong>: independent random numbers with mean 0, constant variance and zero autocorrelation at every lag. Think of a T20 innings. The running total keeps climbing, so "120" means nothing without knowing the over; that total is non-stationary. The runs scored per over wobble around a steady 8; they are stationary, and they are what a commentator can actually forecast.</p>
  <p>A quick, informal check is to compare the first and second halves of a series. If the mean or spread changes a lot between the halves, the series is not stationary.</p>
  <div class="fx" data-lang="py">def halves(s):
    s = s.dropna(); h = len(s) // 2
    return f"mean {s[:h].mean():7.2f} -&gt; {s[h:].mean():7.2f}   std {s[:h].std():5.2f} -&gt; {s[h:].std():5.2f}"
print("raw sales          ", halves(y))
print("diff(1)            ", halves(y.diff()))
print("diff(12)           ", halves(y.diff(12)))
print("diff(1) + diff(12) ", halves(y.diff().diff(12)))
rng = np.random.default_rng(1)
noise = pd.Series(rng.normal(0, 3, 60))                 # white noise: stationary
walk = noise.cumsum()                                  # random walk: running total of the noise
print("white noise        ", halves(noise))
print("random walk        ", halves(walk))</div>
  <div class="fx" data-lang="text">raw sales           mean  108.80 -&gt;  133.43   std  9.63 -&gt; 12.70
diff(1)             mean    0.17 -&gt;    1.87   std  7.44 -&gt;  5.91
diff(12)            mean    3.79 -&gt;   14.46   std  6.19 -&gt;  3.83
diff(1) + diff(12)  mean   -0.09 -&gt;    0.46   std  5.26 -&gt;  3.78
white noise         mean   -0.20 -&gt;   -0.09   std  2.53 -&gt;  2.74
random walk         mean    2.63 -&gt;   -3.98   std  4.55 -&gt;  4.31</div>
  <p>Raw sales: the mean jumps by 24.6 between halves, clearly not stable. Subtracting last month (<code>diff(1)</code>, explained in section 08) removes most of the level change, but the halves still differ (0.17 against 1.87, because growth sped up), and the spread is large because the seasonal ups and downs are still inside. Subtracting the same month last year (<code>diff(12)</code>) removes the season but keeps the growth (3.79 against 14.46). Doing both leaves a series whose halves are close (−0.09 against 0.46). For reference, white noise has stable halves, while a <strong>random walk</strong>, the running total of that same noise, wanders from 2.63 to −3.98 even though every single step is pure noise.</p>
  <p>That random walk deserves attention, because it shows two different ways a series can fail to be stationary. A <strong>trend-stationary</strong> series is a fixed line plus stationary noise, y<sub>t</sub> = a + b·t + noise: after a shock it returns to its line, and the fix is to subtract the fitted line. A <strong>difference-stationary</strong> series, also said to have a <strong>unit root</strong>, behaves like a random walk, y<sub>t</sub> = y<sub>t−1</sub> + c + noise: every shock is added to the level for good, so the series never returns to any line, and the fix is to difference it. Forecast intervals for a trend-stationary series stay roughly constant in width; for a unit-root series they keep widening with the horizon. Most business series behave more like the random walk, which is why differencing, not subtracting a trend line, is the default fix.</p>
  <p>Two misunderstandings are common enough to name. "Stationary" does not mean "flat" or "random": a stationary series can have strong memory (a lag-1 autocorrelation of 0.9) and visible ups and downs; what it cannot have is a mean, spread or correlation pattern that drifts over time. And a series can look calm over a short window while still containing a unit root. Comparing halves is a judgment call, so we need a formal test.</p>

  <h2 id="ts-tests"><span class="num">07</span>The ADF and KPSS Tests</h2>
  <p>The question "does this series need differencing?" has a standard statistical answer. The <strong>Dickey-Fuller test</strong> starts from a simple observation. If a series is a random walk, this month's level tells you nothing about next month's change: the change is pure noise. If the series is stationary, a high level tends to be followed by a fall back toward the mean. So regress the change on last month's level:</p>
  <p>Δy<sub>t</sub> = α + β·y<sub>t−1</sub> + error</p>
  <p>β = 0 means "no pull back toward a mean", which is the unit root (random walk). β &lt; 0 means a pull back, which is stationary. The test checks whether β is significantly below zero using its t-statistic, just as in regression, but compares it with special Dickey-Fuller critical values (about −2.9 at the 5% level here) instead of the usual −1.65, because under the null hypothesis the t-statistic does not follow a t-distribution. The <strong>Augmented Dickey-Fuller (ADF)</strong> test adds a few lagged changes Δy<sub>t−1</sub>, …, Δy<sub>t−p</sub> to the regression to soak up short-term memory, so that the error is close to white noise. Its null hypothesis is "unit root, not stationary", so a small p-value means stationary.</p>
  <p>The <strong>KPSS test</strong> (Kwiatkowski-Phillips-Schmidt-Shin) is its mirror image. Its null hypothesis is "stationary", and it rejects when the running sum of the series' deviations from its mean wanders too far. So a small KPSS p-value means <em>not</em> stationary. Think of two judges with opposite starting assumptions: the ADF judge assumes "guilty of wandering" until proven otherwise, the KPSS judge assumes "innocent". When both reach the same verdict you can trust it; when neither can convict, the evidence is thin rather than the defendant innocent. Using both protects against the main weakness of ADF, which is low power: on short series it often fails to reject a unit root even when the series is stationary.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import adfuller, kpss
# Dickey-Fuller by hand: regress this month's change on last month's level
dy = y.diff().dropna(); ylag = y.shift(1).dropna()
X = np.column_stack([np.ones(len(ylag)), ylag.values])
coef, *_ = np.linalg.lstsq(X, dy.values, rcond=None)
res = dy.values - X @ coef
se = np.sqrt(res @ res / (len(dy) - 2) * np.linalg.inv(X.T @ X)[1, 1])
print(f"change_t = {coef[0]:.3f} + ({coef[1]:.4f}) * level_t-1   t = {coef[1] / se:.2f}")
df0 = adfuller(y, maxlag=0, autolag=None)
print("DF test, no extra lags:", round(df0[0], 2), " 5% critical value:", round(df0[4]["5%"], 2))

rows = []
for name, s in [("raw", y), ("diff(1)", y.diff()), ("diff(12)", y.diff(12)), ("diff(1)+diff(12)", y.diff().diff(12))]:
    s = s.dropna()
    a_stat, a_p, a_lags, *_ = adfuller(s)                    # H0: unit root (NOT stationary)
    k_stat, k_p, *_ = kpss(s, regression="c", nlags="auto")  # H0: stationary
    rows.append([name, len(s), round(a_stat, 2), a_lags, round(a_p, 3), round(k_stat, 3), round(k_p, 3)])
print(pd.DataFrame(rows, columns=["series", "n", "ADF stat", "lags", "ADF p", "KPSS stat", "KPSS p"]).to_string(index=False))</div>
  <div class="fx" data-lang="text">change_t = 7.342 + (-0.0524) * level_t-1   t = -0.95
DF test, no extra lags: -0.95  5% critical value: -2.91
          series  n  ADF stat  lags  ADF p  KPSS stat  KPSS p
             raw 60      2.96    11  1.000      1.063   0.010
         diff(1) 59     -1.27    11  0.643      0.075   0.100
        diff(12) 48     -1.14     4  0.697      0.542   0.032
diff(1)+diff(12) 47     -6.25     1  0.000      0.230   0.100</div>
  <p>The first two lines do the Dickey-Fuller regression by hand with <code>np.linalg.lstsq</code>: β = −0.0524, a tiny pull-back, with t = −0.95. The 5% critical value is −2.91, and −0.95 is not below it, so we cannot reject the unit root. <code>adfuller(y, maxlag=0, autolag=None)</code> reproduces −0.95 exactly. In the table, the full <code>adfuller</code> picks the number of lagged changes itself (the "lags" column).</p>
  <p>Read the table row by row. Raw sales: ADF p = 1.000 (cannot reject a unit root) and KPSS p = 0.010 (reject stationarity), so both say non-stationary. <code>diff(1)</code>: ADF p = 0.643 says non-stationary, but KPSS p = 0.100 says stationary. They disagree because the yearly pattern is still inside the monthly changes, which ADF's 11 lags struggle with on 59 points. <code>diff(12)</code>: both lean non-stationary (ADF p 0.697, KPSS p 0.032), because the growth is still there. <code>diff(1)</code> followed by <code>diff(12)</code>: ADF p = 0.000 and KPSS p = 0.100, so both agree the result is stationary. For Meera we will therefore take one ordinary difference (d = 1) and one seasonal difference (D = 1). One detail: KPSS only reports p-values between 0.01 and 0.10 from its lookup table, so 0.010 means "0.01 or smaller" and 0.100 means "0.10 or larger".</p>
  <table class="tbl">
    <tr><th>ADF (H₀: unit root)</th><th>KPSS (H₀: stationary)</th><th>Conclusion</th><th>Action</th></tr>
    <tr><td>reject (p &lt; 0.05)</td><td>do not reject</td><td>Stationary</td><td>Model as it is</td></tr>
    <tr><td>do not reject</td><td>reject</td><td>Non-stationary (unit root)</td><td>Difference</td></tr>
    <tr><td>reject</td><td>reject</td><td>Mixed: often a structural break or trend-stationarity</td><td>Difference, check for breaks</td></tr>
    <tr><td>do not reject</td><td>do not reject</td><td>Not enough evidence (our diff(1))</td><td>Look at the plot and the ACF; consider a seasonal difference</td></tr>
  </table>
  <p>Remember that both are hypothesis tests: "do not reject" is not proof of the null. Both tests are also about unit roots and level stability; neither checks seasonality directly, which is why <code>diff(1)</code> passed KPSS while still carrying the yearly pattern. Always look at the plot and the ACF as well.</p>

  <h2 id="ts-diff"><span class="num">08</span>Differencing and Transforms</h2>
  <p>The tests told us what to do; now let us see exactly what it does to the numbers, how to get back to sales after forecasting, and what to do when the seasonal swing grows with the level.</p>
  <p><strong>Differencing</strong> replaces each value by its change from an earlier value. The <strong>ordinary difference</strong> d1 = y<sub>t</sub> − y<sub>t−1</sub> asks "how much did sales change since last month?" and removes the trend. The <strong>seasonal difference</strong> d12 = y<sub>t</sub> − y<sub>t−12</sub> asks "how much did sales change since the same month last year?" and removes the season. Think of prices: the price level drifts upward forever, but "how much did prices rise since last month?" hovers around a steady inflation rate, and "how did this month's rise compare with the same month last year?" also removes the festival effect. Doing both gives Meera's stationary series, which we call w. Let us compute the first rows by hand. February 2021 fell 7 from January (105 − 112), February 2020 fell 5 from January (94 − 99), so w = (−7) − (−5) = −2: this year's January-to-February drop was 2 bigger than last year's. The order does not matter; the seasonal difference of February minus that of January gives 11 − 13 = −2 too.</p>
  <div class="fx" data-lang="py">from scipy import stats
diffs = pd.DataFrame({"sales": y, "d1": y.diff(), "d12": y.diff(12), "d1_d12": y.diff().diff(12)})
print(diffs.iloc[[0, 1, 12, 13, 14]])
w = y.diff().diff(12).dropna()                         # the stationary series, 47 values
# undo both differences for Feb 2021: y_t = y_t-1 + y_t-12 - y_t-13 + w_t
print("rebuild Feb 2021:", v[12], "+", v[1], "-", v[0], "+", w.iloc[0], "=", v[12] + v[1] - v[0] + w.iloc[0])
print("undo diff(1) with cumsum:", (v[0] + y.diff().fillna(0).cumsum()).head(4).tolist())

logy = np.log(y)
print("log-diff Jan-&gt;Feb 2020:", round(logy.iloc[1] - logy.iloc[0], 4), " pct change:", round(y.pct_change().iloc[1], 4))
for lam in [1, 0.5, 0]:
    bc = stats.boxcox(np.array([99., 160.]), lmbda=lam)
    print(f"Box-Cox lambda={lam}: 99 -&gt; {bc[0]:.3f}, 160 -&gt; {bc[1]:.3f}")
print("lambda chosen by maximum likelihood:", round(stats.boxcox(y.values.astype(float))[1], 2))</div>
  <div class="fx" data-lang="text">            sales   d1   d12  d1_d12
2020-01-01     99  NaN   NaN     NaN
2020-02-01     94 -5.0   NaN     NaN
2021-01-01    112 -6.0  13.0     NaN
2021-02-01    105 -7.0  11.0    -2.0
2021-03-01    111  6.0  10.0    -1.0
rebuild Feb 2021: 112 + 94 - 99 + -2.0 = 105.0
undo diff(1) with cumsum: [99.0, 94.0, 101.0, 101.0]
log-diff Jan-&gt;Feb 2020: -0.0518  pct change: -0.0505
Box-Cox lambda=1: 99 -&gt; 98.000, 160 -&gt; 159.000
Box-Cox lambda=0.5: 99 -&gt; 17.900, 160 -&gt; 23.298
Box-Cox lambda=0: 99 -&gt; 4.595, 160 -&gt; 5.075
lambda chosen by maximum likelihood: -0.28</div>
  <p>The table matches the hand values. Each difference costs observations at the start: 60 values become 59 after <code>diff(1)</code> and 47 after both. Keep the original first values, because you need them to rebuild the levels.</p>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680"><rect x="130" y="10" width="530" height="64" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="122" y="46" text-anchor="end" font-size="11.5">raw sales</text><polyline points="130.0,62.8 139.0,66.8 148.0,61.2 156.9,61.2 165.9,70.8 174.9,64.4 183.9,57.2 192.9,52.4 201.9,50.8 210.8,41.2 219.8,42.8 228.8,47.6 237.8,52.4 246.8,58.0 255.8,53.2 264.7,53.2 273.7,63.6 282.7,58.0 291.7,50.0 300.7,46.8 309.7,48.4 318.6,45.2 327.6,42.8 336.6,50.0 345.6,54.0 354.6,58.8 363.6,50.8 372.5,62.0 381.5,63.6 390.5,58.8 399.5,50.8 408.5,45.2 417.5,46.0 426.4,36.4 435.4,38.8 444.4,41.2 453.4,42.0 462.4,46.0 471.4,42.0 480.3,47.6 489.3,46.8 498.3,46.0 507.3,39.6 516.3,34.8 525.3,36.4 534.2,28.4 543.2,29.2 552.2,31.6 561.2,35.6 570.2,39.6 579.2,33.2 588.1,33.2 597.1,38.8 606.1,33.2 615.1,26.8 624.1,22.0 633.1,24.4 642.0,14.0 651.0,14.0 660.0,14.0" fill="none" class="sb" stroke-width="1.7"/><rect x="130" y="90" width="530" height="64" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="122" y="126" text-anchor="end" font-size="11.5">diff(1)</text><line x1="130" y1="122.0" x2="660" y2="122.0" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/><polyline points="139.0,130.0 148.0,110.8 156.9,122.0 165.9,141.2 174.9,109.2 183.9,107.6 192.9,112.4 201.9,118.8 210.8,102.8 219.8,125.2 228.8,131.6 237.8,131.6 246.8,133.2 255.8,112.4 264.7,122.0 273.7,142.8 282.7,110.8 291.7,106.0 300.7,115.6 309.7,125.2 318.6,115.6 327.6,117.2 336.6,136.4 345.6,130.0 354.6,131.6 363.6,106.0 372.5,144.4 381.5,125.2 390.5,112.4 399.5,106.0 408.5,110.8 417.5,123.6 426.4,102.8 435.4,126.8 444.4,126.8 453.4,123.6 462.4,130.0 471.4,114.0 480.3,133.2 489.3,120.4 498.3,120.4 507.3,109.2 516.3,112.4 525.3,125.2 534.2,106.0 543.2,123.6 552.2,126.8 561.2,130.0 570.2,130.0 579.2,109.2 588.1,122.0 597.1,133.2 606.1,110.8 615.1,109.2 624.1,112.4 633.1,126.8 642.0,101.2 651.0,122.0 660.0,122.0" fill="none" class="st" stroke-width="1.7"/><rect x="130" y="170" width="530" height="64" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="122" y="206" text-anchor="end" font-size="11.5">diff(1)+diff(12)</text><line x1="130" y1="202.0" x2="660" y2="202.0" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/><polyline points="246.8,207.3 255.8,204.7 264.7,202.0 273.7,204.7 282.7,204.7 291.7,199.3 300.7,207.3 309.7,212.7 318.6,223.3 327.6,188.7 336.6,210.0 345.6,199.3 354.6,199.3 363.6,191.3 372.5,239.3 381.5,172.7 390.5,204.7 399.5,202.0 408.5,194.0 417.5,199.3 426.4,180.7 435.4,218.0 444.4,186.0 453.4,191.3 462.4,199.3 471.4,215.3 480.3,183.3 489.3,194.0 498.3,215.3 507.3,207.3 516.3,204.7 525.3,204.7 534.2,207.3 543.2,196.7 552.2,202.0 561.2,212.7 570.2,202.0 579.2,194.0 588.1,183.3 597.1,223.3 606.1,186.0 615.1,202.0 624.1,202.0 633.1,204.7 642.0,194.0 651.0,199.3 660.0,194.0" fill="none" class="sg" stroke-width="1.7"/></svg><figcaption>Raw sales (trend and season), after diff(1) (level gone, yearly pattern still visible), after diff(1) + diff(12) (a stationary wobble around 0). Each difference costs observations: 60 → 59 → 47.</figcaption></figure>
  <p>A model will forecast w, but Meera needs sales, so we must undo the differences. Rearranging w<sub>t</sub> = (y<sub>t</sub> − y<sub>t−1</sub>) − (y<sub>t−12</sub> − y<sub>t−13</sub>) gives y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w<sub>t</sub>: February 2021 = 112 + 94 − 99 + (−2) = 105, exactly as the code printed. For a single ordinary difference, undoing is a running sum: start at 99, then 99 − 5 = 94, then 94 + 7 = 101, which is what <code>cumsum</code> does. This "adding back up" is called <strong>integration</strong>, and it is the I in ARIMA.</p>
  <p>Differencing removes trend and season, but not a swing that grows with the level. For that we transform the values first. The <strong>log</strong> turns multiplicative effects into additive ones, and turns differences into growth rates: log(94) − log(99) = −0.0518, very close to the percentage change −5.05%. The <strong>Box-Cox</strong> family generalises this with a parameter λ: y<sup>(λ)</sup> = (y<sup>λ</sup> − 1)/λ, and log y when λ = 0. λ = 1 only shifts the series down by 1 (99 becomes 98, no real change); λ = 0.5 is a square-root-like squeeze (99 → 17.900, 160 → 23.298); λ = 0 is the log (4.595 and 5.075). Smaller λ squeezes large values harder. Note what scipy's <code>boxcox</code> chose: λ = −0.28. It picks the λ that makes the histogram of all values look most normal, which is not the goal for a time series; the goal is a variance that is stable over time. Meera's swing is already stable, so she needs no transform at all. (Yeo-Johnson extends Box-Cox to zero and negative values; see <a class="xref" data-note="ml_features">Feature Engineering</a>.) When you transform before modelling, remember to undo it after forecasting, and note that exponentiating a forecast made on the log scale gives the median, not the mean.</p>
  <p>Each difference removes structure, but one difference too many adds structure back. Differencing white noise e<sub>t</sub> gives e<sub>t</sub> − e<sub>t−1</sub>, whose lag-1 autocorrelation is exactly −0.5 and whose variance doubles. This is called <strong>over-differencing</strong>, and you can see it happen:</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf
e = pd.Series(np.random.default_rng(0).normal(0, 1, 2000))      # white noise: already stationary
d = e.diff().dropna()                                           # one difference too many
print("white noise:      var", round(e.var(), 2), "  lag-1 ACF", round(acf(e, nlags=1)[1], 2))
print("its difference:   var", round(d.var(), 2), "  lag-1 ACF", round(acf(d, nlags=1)[1], 2))
w = y.diff().diff(12).dropna()
ww = w.diff().dropna()                                          # a third difference on the shop
print("shop w:           var", round(w.var(), 1), "  lag-1 ACF", round(acf(w, nlags=1)[1], 2))
print("w differenced:    var", round(ww.var(), 1), "  lag-1 ACF", round(acf(ww, nlags=1)[1], 2))</div>
  <div class="fx" data-lang="text">white noise:      var 1.0   lag-1 ACF -0.01
its difference:   var 2.02   lag-1 ACF -0.5
shop w:           var 20.4   lag-1 ACF -0.41
w differenced:    var 58.5   lag-1 ACF -0.67</div>
  <p>The white noise had variance 1.0 and no autocorrelation; after one unnecessary difference the variance doubled to 2.02 and the lag-1 autocorrelation became −0.5. The same thing happens to the shop: w is already stationary, and differencing it once more nearly triples the variance (20.4 → 58.5) and pushes the lag-1 autocorrelation from −0.41 to −0.67. So the signs of over-differencing are a lag-1 autocorrelation near or below −0.5 and a variance that goes up after a difference. A good rule of thumb: take the seasonal difference first if the season is strong, then an ordinary one only if still needed; d + D rarely exceeds 2.</p>

  <h2 id="ts-acf"><span class="num">09</span>The ACF</h2>
  <p>We now have a stable series w. A stable series can still have memory: this month's w may be linked to last month's, or to the same month last year. In section 01 raw sales correlated 0.916 with last month, but that was mostly the shared trend. How much memory is left once the trend and season are removed, and at which lags?</p>
  <p>The <strong>autocorrelation function (ACF)</strong> answers this by computing the autocorrelation at every lag k = 1, 2, 3, …. The recipe for lag k: centre the series (subtract its mean), multiply each centred value by the centred value k steps earlier, add up those products, and divide by the sum of squares of the centred values. The top measures whether values k apart move together; the bottom scales the answer into the range −1 to +1:</p>
  <p>r<sub>k</sub> = Σ<sub>t=k+1..n</sub> (y<sub>t</sub> − ȳ)(y<sub>t−k</sub> − ȳ) / Σ<sub>t=1..n</sub> (y<sub>t</sub> − ȳ)²</p>
  <p>Think of an echo test in a hall: clap, then listen at 1 second, 2 seconds, 12 seconds. The ACF is the loudness of the echo at each delay. Let us compute two echoes by hand on just eight values of w (February to September 2021): −2, −1, 0, −1, −1, 1, −2, −4. Their mean is −10/8 = −1.25, so the centred values are −0.75, 0.25, 1.25, 0.25, 0.25, 2.25, −0.75, −2.75.</p>
  <table class="tbl">
    <tr><th>quantity</th><th>products</th><th>sum</th></tr>
    <tr><td>denominator Σc²</td><td>0.5625 + 0.0625 + 1.5625 + 0.0625 + 0.0625 + 5.0625 + 0.5625 + 7.5625</td><td>15.5</td></tr>
    <tr><td>lag 1: c<sub>t</sub>·c<sub>t−1</sub></td><td>−0.1875 + 0.3125 + 0.3125 + 0.0625 + 0.5625 − 1.6875 + 2.0625</td><td>1.4375</td></tr>
    <tr><td>lag 2: c<sub>t</sub>·c<sub>t−2</sub></td><td>(1.25)(−0.75) + (0.25)(0.25) + (0.25)(1.25) + (2.25)(0.25) + (−0.75)(0.25) + (−2.75)(2.25)</td><td>−6.375</td></tr>
  </table>
  <p>So r₁ = 1.4375/15.5 = 0.0927 and r₂ = −6.375/15.5 = −0.4113. Notice that the denominator always uses all n values while the numerator has only n − k products; this convention keeps the ACF well behaved at large lags.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf
small = w.iloc[:8]                                     # Feb-Sep 2021 of the stationary series
c = small - small.mean()                               # centre
print("8 values:", small.tolist(), " mean:", small.mean())
print("centred :", c.tolist())
den = (c ** 2).sum()
num1 = (c.values[1:] * c.values[:-1]).sum()
num2 = (c.values[2:] * c.values[:-2]).sum()
print(f"r1 = {num1:.4f} / {den:.4f} = {num1 / den:.4f};  r2 = {num2:.4f} / {den:.4f} = {num2 / den:.4f}")
print("statsmodels:", acf(small, nlags=2).round(4).tolist())

print("ACF of w, lags 1-13:", acf(w, nlags=13)[1:].round(2).tolist())
print("95% band: +/-", round(1.96 / np.sqrt(len(w)), 3))
print("ACF of raw sales, lags 1-13:", acf(y, nlags=13)[1:].round(2).tolist())</div>
  <div class="fx" data-lang="text">8 values: [-2.0, -1.0, 0.0, -1.0, -1.0, 1.0, -2.0, -4.0]  mean: -1.25
centred : [-0.75, 0.25, 1.25, 0.25, 0.25, 2.25, -0.75, -2.75]
r1 = 1.4375 / 15.5000 = 0.0927;  r2 = -6.3750 / 15.5000 = -0.4113
statsmodels: [1.0, 0.0927, -0.4113]
ACF of w, lags 1-13: [-0.41, 0.06, 0.03, 0.24, -0.19, -0.02, 0.25, -0.1, -0.13, -0.11, 0.28, -0.31, -0.12]
95% band: +/- 0.286
ACF of raw sales, lags 1-13: [0.86, 0.71, 0.59, 0.49, 0.34, 0.25, 0.26, 0.29, 0.32, 0.35, 0.42, 0.45, 0.36]</div>
  <p>statsmodels' <code>acf</code> matches the hand values exactly (it returns lag 0, which is always 1, first). But eight values are far too few to mean anything: with all 47 values of w, r₁ is −0.41, not +0.09. To judge which bars are real we need a yardstick. If w were pure white noise, each r<sub>k</sub> would still not be exactly zero; it would wobble around zero with a standard deviation of about 1/√n. So the <strong>95% noise band</strong> is ±1.96/√n = ±1.96/√47 = ±0.286: bars inside it are what chance alone produces, and only bars outside it count as evidence of memory. Here two bars cross: lag 1 (−0.41) and lag 12 (−0.31). Lag 11 (0.28) is just inside.</p>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680"><text x="20" y="18" class="tm" font-size="11">ACF of w = diff(1)+diff(12) of sales, lags 1-13 (shaded: 95% noise band +/-0.286)</text><rect x="20" y="55.4" width="400" height="57.2" class="fs"/><line x1="20" y1="84.0" x2="420" y2="84.0" stroke="currentColor"/><rect x="28" y="84.0" width="14" height="40.8" class="fr sr"/><text x="35" y="156" text-anchor="middle" class="tm" font-size="10">1</text><text x="35" y="135.8" text-anchor="middle" class="tr" font-size="10">-0.41</text><rect x="58" y="78.1" width="14" height="5.9" class="fb sb"/><text x="65" y="156" text-anchor="middle" class="tm" font-size="10">2</text><rect x="88" y="80.7" width="14" height="3.3" class="fb sb"/><text x="95" y="156" text-anchor="middle" class="tm" font-size="10">3</text><rect x="118" y="59.9" width="14" height="24.1" class="fb sb"/><text x="125" y="156" text-anchor="middle" class="tm" font-size="10">4</text><rect x="148" y="84.0" width="14" height="19.1" class="fb sb"/><text x="155" y="156" text-anchor="middle" class="tm" font-size="10">5</text><rect x="178" y="84.0" width="14" height="2.4" class="fb sb"/><text x="185" y="156" text-anchor="middle" class="tm" font-size="10">6</text><rect x="208" y="58.6" width="14" height="25.4" class="fb sb"/><text x="215" y="156" text-anchor="middle" class="tm" font-size="10">7</text><rect x="238" y="84.0" width="14" height="9.6" class="fb sb"/><text x="245" y="156" text-anchor="middle" class="tm" font-size="10">8</text><rect x="268" y="84.0" width="14" height="13.4" class="fb sb"/><text x="275" y="156" text-anchor="middle" class="tm" font-size="10">9</text><rect x="298" y="84.0" width="14" height="10.8" class="fb sb"/><text x="305" y="156" text-anchor="middle" class="tm" font-size="10">10</text><rect x="328" y="55.9" width="14" height="28.1" class="fb sb"/><text x="335" y="156" text-anchor="middle" class="tm" font-size="10">11</text><rect x="358" y="84.0" width="14" height="30.6" class="fr sr"/><text x="365" y="156" text-anchor="middle" class="tm" font-size="10">12</text><text x="365" y="125.6" text-anchor="middle" class="tr" font-size="10">-0.31</text><rect x="388" y="84.0" width="14" height="12.0" class="fb sb"/><text x="395" y="156" text-anchor="middle" class="tm" font-size="10">13</text><text x="20" y="184" class="tm" font-size="11">PACF of w, lags 1-13</text><rect x="20" y="221.4" width="400" height="57.2" class="fs"/><line x1="20" y1="250.0" x2="420" y2="250.0" stroke="currentColor"/><rect x="28" y="250.0" width="14" height="40.8" class="fr sr"/><text x="35" y="322" text-anchor="middle" class="tm" font-size="10">1</text><text x="35" y="301.8" text-anchor="middle" class="tr" font-size="10">-0.41</text><rect x="58" y="250.0" width="14" height="12.9" class="fb sb"/><text x="65" y="322" text-anchor="middle" class="tm" font-size="10">2</text><rect x="88" y="249.1" width="14" height="0.9" class="fb sb"/><text x="95" y="322" text-anchor="middle" class="tm" font-size="10">3</text><rect x="118" y="217.4" width="14" height="32.6" class="fr sr"/><text x="125" y="322" text-anchor="middle" class="tm" font-size="10">4</text><text x="125" y="213.4" text-anchor="middle" class="tr" font-size="10">0.33</text><rect x="148" y="243.6" width="14" height="6.4" class="fb sb"/><text x="155" y="322" text-anchor="middle" class="tm" font-size="10">5</text><rect x="178" y="250.0" width="14" height="12.9" class="fb sb"/><text x="185" y="322" text-anchor="middle" class="tm" font-size="10">6</text><rect x="208" y="232.7" width="14" height="17.3" class="fb sb"/><text x="215" y="322" text-anchor="middle" class="tm" font-size="10">7</text><rect x="238" y="244.3" width="14" height="5.7" class="fb sb"/><text x="245" y="322" text-anchor="middle" class="tm" font-size="10">8</text><rect x="268" y="250.0" width="14" height="13.6" class="fb sb"/><text x="275" y="322" text-anchor="middle" class="tm" font-size="10">9</text><rect x="298" y="250.0" width="14" height="35.5" class="fr sr"/><text x="305" y="322" text-anchor="middle" class="tm" font-size="10">10</text><text x="305" y="296.5" text-anchor="middle" class="tr" font-size="10">-0.35</text><rect x="328" y="249.7" width="14" height="0.8" class="fb sb"/><text x="335" y="322" text-anchor="middle" class="tm" font-size="10">11</text><rect x="358" y="250.0" width="14" height="8.0" class="fb sb"/><text x="365" y="322" text-anchor="middle" class="tm" font-size="10">12</text><rect x="388" y="250.0" width="14" height="27.3" class="fb sb"/><text x="395" y="322" text-anchor="middle" class="tm" font-size="10">13</text></svg><figcaption>The correlogram (ACF) and partial correlogram (PACF) of Meera's stationary series w. Red bars cross the 95% noise band. ACF: lag 1 and lag 12. PACF: lag 1, plus isolated lags 4 and 10 (by chance, 1 bar in 20 crosses).</figcaption></figure>
  <p>What do the two significant bars mean for the shop? The lag-1 bar is negative: when this month's change is unusually high compared with last year's, next month's tends to be unusually low, so a good month is partly "given back". We already suspect one cause: a one-month promotion lifts sales once, so the change goes up and then down. The lag-12 bar is also negative: a surprise in one month is partly reversed in the same month next year, because the seasonal pattern is not perfectly fixed and seasonal differencing over-corrects a little. For contrast, the ACF of the raw sales starts at 0.86 and fades slowly (0.71, 0.59, …), rising again near lag 12. That slow decay is the signature of a trend plus a season: when everything is trending, every value correlates with every other, and the real short-term memory is hidden. A slowly decaying ACF is itself a sign that differencing is needed, which is why we always read the ACF of the stationary series. And with 20 bars, expect about one to cross the band by pure chance.</p>

  <h2 id="ts-pacf"><span class="num">10</span>The PACF</h2>
  <p>The ACF has a blind spot. If this month depends on last month, and last month depends on the month before, then this month will also correlate with two months back, through the chain, even if there is no direct link at all. The ACF cannot tell a direct link from one passed along. Think of rumours in a village: your grandmother's opinion correlates with yours partly because it reached you through your mother. The ACF counts both routes. The question we want is: if we already know what your mother said, does your grandmother still add anything?</p>
  <p>That question is answered by the <strong>partial autocorrelation function (PACF)</strong>. The partial autocorrelation at lag k is the correlation between y<sub>t</sub> and y<sub>t−k</sub> after removing what the in-between lags 1 to k − 1 explain. Equivalently: regress y<sub>t</sub> on y<sub>t−1</sub>, …, y<sub>t−k</sub>; the coefficient on y<sub>t−k</sub> is PACF(k). At lag 1 there is nothing in between, so PACF(1) = r₁.</p>
  <p>For lag 2 there is a neat formula. If only lag 1 mattered, the chain alone would make r₂ equal to r₁ × r₁ = r₁². So the part of r₂ not explained by the chain is r₂ − r₁², rescaled by how much variation is left after using lag 1, which is 1 − r₁²:</p>
  <p>PACF(2) = (r₂ − r₁²) / (1 − r₁²)</p>
  <p>On all 47 values of w, r₁ = −0.4084 and r₂ = 0.0590. The chain alone would predict r₂ = 0.167; the actual 0.059 is a bit less, so the direct lag-2 link is small and negative.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf, pacf
r1, r2 = acf(w, nlags=2)[1:]
phi22 = (r2 - r1 ** 2) / (1 - r1 ** 2)
print(f"PACF(2) = (r2 - r1^2) / (1 - r1^2) = ({r2:.4f} - {r1 ** 2:.4f}) / {1 - r1 ** 2:.4f} = {phi22:.4f}")
print("statsmodels pacf (ywm):", pacf(w, nlags=2, method="ywm")[1:].round(4).tolist())
lagdf = pd.DataFrame({"w": w, "l1": w.shift(1), "l2": w.shift(2)}).dropna()   # the regression view
A = np.column_stack([np.ones(len(lagdf)), lagdf.l1, lagdf.l2])
print("OLS coef on lag 2:", round(np.linalg.lstsq(A, lagdf.w, rcond=None)[0][2], 4),
      "  pacf(method='ols'):", round(pacf(w, nlags=2, method="ols")[2], 4))
print("PACF of w, lags 1-13:", pacf(w, nlags=13, method="ywm")[1:].round(2).tolist())

# the two textbook signatures, on 500 simulated points
e = np.random.default_rng(7).normal(size=500)
ar = np.zeros(500)
for t in range(1, 500):
    ar[t] = 0.7 * ar[t - 1] + e[t]                     # AR(1): this value = 0.7 x last value + noise
ma = e[1:] + 0.7 * e[:-1]                              # MA(1): this value = noise + 0.7 x last noise
for name, s in [("AR(1)", ar), ("MA(1)", ma)]:
    print(f"{name}  ACF {acf(s, nlags=4)[1:].round(2).tolist()}  PACF {pacf(s, nlags=4, method='ywm')[1:].round(2).tolist()}")</div>
  <div class="fx" data-lang="text">PACF(2) = (r2 - r1^2) / (1 - r1^2) = (0.0590 - 0.1668) / 0.8332 = -0.1294
statsmodels pacf (ywm): [-0.4084, -0.1294]
OLS coef on lag 2: -0.1366   pacf(method='ols'): -0.1366
PACF of w, lags 1-13: [-0.41, -0.13, 0.01, 0.33, 0.06, -0.13, 0.17, 0.06, -0.14, -0.35, 0.0, -0.08, -0.27]
AR(1)  ACF [0.68, 0.47, 0.33, 0.25]  PACF [0.68, 0.01, 0.02, 0.04]
MA(1)  ACF [0.44, -0.04, -0.03, -0.02]  PACF [0.44, -0.3, 0.18, -0.14]</div>
  <p>The hand formula gives −0.1294, equal to statsmodels' Yule-Walker PACF (<code>method="ywm"</code>) to four decimals. The regression version (<code>method="ols"</code>) literally fits w<sub>t</sub> on w<sub>t−1</sub> and w<sub>t−2</sub> and reads the lag-2 coefficient, −0.1366; the two estimates differ slightly on short series, and both say "small, inside the band". The full PACF of w is −0.41 at lag 1, then small, with chance crossings at lags 4 (0.33) and 10 (−0.35). At lag 12 the PACF is only −0.08, while the ACF had −0.31.</p>
  <p>The last two lines show why the two plots are always read together. On 500 simulated points, an <strong>AR(1)</strong> series ("this value = 0.7 × last value + noise") has an ACF that fades geometrically (0.68, 0.47, 0.33, 0.25), because the effect is passed along the chain, while its PACF cuts off after lag 1 (0.68, then about 0), because only lag 1 acts directly. An <strong>MA(1)</strong> series ("this value = noise + 0.7 × last month's noise") is the mirror image: the ACF cuts off after lag 1 (0.44, then about 0), because a shock affects exactly one later value, while the PACF fades with alternating signs. These two models are built properly in the <a class="xref" data-note="ml_arima">ARIMA Family</a> note; here they give us rules for reading the plots.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>ACF</th><th>PACF</th><th>Suggests</th></tr>
    <tr><td>Autoregressive AR(p)</td><td>Tails off</td><td>Cuts off after lag p</td><td>p = last significant PACF lag</td></tr>
    <tr><td>Moving average MA(q)</td><td>Cuts off after lag q</td><td>Tails off</td><td>q = last significant ACF lag</td></tr>
    <tr><td>ARMA(p, q)</td><td>Tails off</td><td>Tails off</td><td>Try small p and q, compare</td></tr>
    <tr><td>Spike at lag 12 in the ACF only</td><td>spike</td><td>small</td><td>Seasonal MA term</td></tr>
    <tr><td>Spike at lag 12 in the PACF only</td><td>small</td><td>spike</td><td>Seasonal AR term</td></tr>
    <tr><td>Barely decays at all</td><td>slow fade</td><td>—</td><td>Still non-stationary: difference</td></tr>
  </table>
  <p>Meera's w has an ACF spike at lag 1 then nothing, plus a spike at lag 12; its PACF has a spike at lag 1 and a small lag 2. Read one way, that is an MA(1) with a seasonal MA term. Read the other way, the PACF also cuts off after lag 1, so an AR(1) is just as plausible. Short series often leave this ambiguity. The cut-off rules are hints for proposing a few small candidate models, not exact laws; the ARIMA note settles the choice with information criteria and residual checks.</p>

  <h2 id="ts-lags"><span class="num">11</span>Lag Features</h2>
  <p>A regression or gradient-boosting model needs a table: one row per month, input columns, and a target. The ACF told us which past values carry information (last month, and the same month last year). How do we turn that memory into columns without letting any column contain information from the month being predicted, or later?</p>
  <p>A <strong>lag feature</strong> is simply a past value of the series used as an input: x<sub>t</sub> = y<sub>t−k</sub>. In pandas, <code>y.shift(k)</code> builds it. A <strong>rolling feature</strong> summarises a window of past values, and it must end before the target month: shift first, then roll. Let us build the row for February 2021 (target 105) by hand. lag_1 is January 2021 = 112. lag_12 is February 2020 = 94, the seasonal lag the ACF pointed to. roll_3, built as <code>y.shift(1).rolling(3).mean()</code>, is the mean of November 2020, December 2020 and January 2021 = (124 + 118 + 112)/3 = 118.00. A careless <code>y.rolling(3).mean()</code> without the shift would average December, January and February = (118 + 112 + 105)/3 = 111.67, which contains the target 105 itself. Think of predicting a student's final exam: using her mid-term mark and last year's final is fair, but using the class average that already includes her own final mark is cheating, and a model will happily cheat if the column is there.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error as mae
feat = pd.DataFrame({"sales": y,
                     "lag_1": y.shift(1),                         # last month
                     "lag_12": y.shift(12),                       # same month last year
                     "roll_3": y.shift(1).rolling(3).mean(),      # mean of the 3 months BEFORE this one
                     "promo": shop.promo})                        # planned in advance
feat["leaky_roll_3"] = y.rolling(3).mean()                        # WRONG: includes this month's sales
print(feat.iloc[12:15].round(2))

data = feat.dropna()
train, test = data[:"2023"], data["2024":]                        # split by time
for cols in [["lag_1", "lag_12", "promo"], ["lag_1", "lag_12", "promo", "leaky_roll_3"]]:
    m = LinearRegression().fit(train[cols], train.sales)
    print(f"{' + '.join(cols):40s} test MAE = {mae(test.sales, m.predict(test[cols])):.2f}")
print(f"{'seasonal naive (= lag_12)':40s} test MAE = {mae(test.sales, test.lag_12):.2f}")
print(f"{'naive (= lag_1)':40s} test MAE = {mae(test.sales, test.lag_1):.2f}")</div>
  <div class="fx" data-lang="text">            sales  lag_1  lag_12  roll_3  promo  leaky_roll_3
2021-01-01    112  118.0    99.0  122.67      0        118.00
2021-02-01    105  112.0    94.0  118.00      0        111.67
2021-03-01    111  105.0   101.0  111.67      0        109.33
lag_1 + lag_12 + promo                   test MAE = 4.44
lag_1 + lag_12 + promo + leaky_roll_3    test MAE = 2.62
seasonal naive (= lag_12)                test MAE = 14.75
naive (= lag_1)                          test MAE = 5.17</div>
  <p>The printed rows match the hand values. Rows with missing values (the first 12 months, which have no lag_12) are dropped, and the split is by time: train on 2021 to 2023, test on 2024. The honest model (lag_1, lag_12 and the promotion flag, which Meera plans in advance and so knows at forecast time) gets a mean absolute error of 4.44 on 2024. Adding the leaky column "improves" it to 2.62, an improvement that cannot exist in real use, because February's sales are unknown when February's forecast is made.</p>
  <p>The two baselines matter just as much. <strong>Naive</strong> (repeat last month) scores 5.17; <strong>seasonal naive</strong> (repeat the same month last year) scores 14.75, poor here because 2024 grew by about 15 over 2023 and seasonal naive ignores growth. Always compute baselines: any model must beat them to be worth keeping. Finally, note that these features forecast one step ahead. To forecast 12 months ahead, lag_1 for December 2024 is not known in January 2024; you either feed predictions back in (recursive forecasting) or train separate models that use only lags of at least h (direct forecasting). Those strategies, together with time-series cross-validation and models across many series, are the subject of <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>. Before that, <a class="xref" data-note="ml_arima">ARIMA Family</a> writes the memory we measured here as an equation.</p>

  <h2 id="ts-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most damaging mistake is validating a time-series model with shuffled folds. The model then trains on months on both sides of each test month and only has to fill in a gap. Compare the same lag regression scored two ways:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score
data = pd.DataFrame({"sales": y, "lag_1": y.shift(1), "lag_12": y.shift(12), "promo": shop.promo}).dropna()
X, t = data[["lag_1", "lag_12", "promo"]], data.sales
for name, cv in [("shuffled KFold", KFold(5, shuffle=True, random_state=0)),
                 ("TimeSeriesSplit", TimeSeriesSplit(5))]:
    s = -cross_val_score(LinearRegression(), X, t, cv=cv, scoring="neg_mean_absolute_error")
    print(f"{name:16s} MAE per fold {s.round(2).tolist()}  mean {s.mean():.2f}")</div>
  <div class="fx" data-lang="text">shuffled KFold   MAE per fold [3.57, 4.89, 4.07, 3.34, 2.42]  mean 3.66
TimeSeriesSplit  MAE per fold [10.78, 6.37, 7.66, 2.05, 5.22]  mean 6.41</div>
  <p>Shuffled <code>KFold</code> reports a mean error of 3.66; time-ordered <code>TimeSeriesSplit</code>, which always trains on earlier months and tests on later ones, reports 6.41. The honest number is almost twice as large, and it is the one Meera would experience. Always pass a time-ordered splitter, and never shuffle.</p>
  <p>A second quiet mistake is resampling with the wrong rule, or without checking for gaps. Suppose the till log has lost the February pages:</p>
  <div class="fx" data-lang="py">days = pd.date_range("2024-01-01", "2024-03-31", freq="D")
till = pd.Series(4.0, index=days)                  # a steady Rs 4 thousand every day
till = till.drop(pd.date_range("2024-02-01", "2024-02-29"))   # the February pages are lost
print("mean per month:", till.resample("MS").mean().round(2).tolist())
print("sum per month: ", till.resample("MS").sum().tolist())
print("days present:  ", till.resample("MS").count().tolist())</div>
  <div class="fx" data-lang="text">mean per month: [4.0, nan, 4.0]
sum per month:  [124.0, 0.0, 124.0]
days present:   [31, 0, 31]</div>
  <p><code>resample("MS").sum()</code> silently turns the missing month into 0, which looks like a month with no sales at all, while <code>mean</code> correctly shows it as missing. Choose the aggregation that matches the quantity (sum for sales, mean or last for levels), and check for gaps first with <code>asfreq</code> and <code>count</code>.</p>
  <p>Several mistakes need no code to remember. Using centred or unshifted rolling means, decomposition parts, or scalers fitted on all dates as model inputs leaks the future (the leaky rolling mean faked 2.62 against an honest 4.44). Reading the tests backwards is common: a small ADF p-value means stationary, a small KPSS p-value means non-stationary. Forgetting the season when testing is another: <code>diff(1)</code> passed KPSS while the yearly pattern was still inside, so always look at the plot and the ACF at lag s. Over-differencing shows up as a lag-1 autocorrelation near −0.5 and a rising variance. Reading the ACF of a trending series hides the real memory under one long slow fade. Using an additive decomposition when the swing grows with the level spreads the growth into the residuals. And choosing a Box-Cox λ from scipy's default fit normalises the histogram of values rather than stabilising the variance over time.</p>

  <h2 id="ts-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Time series</b>: values y₁ … yₙ of one quantity at equally spaced times; order carries information.</li>
    <li><b>Lag k</b>: y<sub>t−k</sub>. <b>Autocorrelation</b> at lag k: correlation between y<sub>t</sub> and y<sub>t−k</sub>.</li>
    <li><b>Seasonal period s</b>: steps per cycle (12 monthly-yearly, 7 daily-weekly, 24 hourly-daily). <b>Horizon h</b>: steps ahead.</li>
    <li><b>Leakage</b>: using any information not available when the forecast is made.</li>
    <li><b>Trend</b>: long-run level; <b>season</b>: fixed-period pattern; <b>cycle</b>: no fixed period; <b>noise</b>: the rest.</li>
    <li><b>Stationary</b>: constant mean, constant variance, autocorrelation depending only on the lag.</li>
    <li><b>Unit root / random walk</b>: y<sub>t</sub> = y<sub>t−1</sub> + noise; shocks are permanent; fix by differencing.</li>
    <li><b>ACF</b>: autocorrelation at each lag. <b>PACF</b>: the direct part only, after the shorter lags.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Formula</th><th>Meera</th></tr>
    <tr><td>2×12 trend</td><td>(½y<sub>t−6</sub> + y<sub>t−5</sub> + … + y<sub>t+5</sub> + ½y<sub>t+6</sub>)/12</td><td>July 2020: 107.29</td></tr>
    <tr><td>Additive / multiplicative</td><td>y = T + S + R / y = T × S × R</td><td>124 = 110.79 + 10.60 + 2.61</td></tr>
    <tr><td>Dickey-Fuller</td><td>Δy<sub>t</sub> = α + βy<sub>t−1</sub> (+ lagged Δy); H₀: β = 0</td><td>t = −0.95 &gt; −2.91: unit root</td></tr>
    <tr><td>Double difference</td><td>w<sub>t</sub> = (1 − B)(1 − B¹²)y<sub>t</sub></td><td>Feb 2021: −7 − (−5) = −2</td></tr>
    <tr><td>Undo</td><td>y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w<sub>t</sub></td><td>112 + 94 − 99 − 2 = 105</td></tr>
    <tr><td>Box-Cox</td><td>(y<sup>λ</sup> − 1)/λ; log y at λ = 0</td><td>not needed (stable swing)</td></tr>
    <tr><td>ACF</td><td>r<sub>k</sub> = Σc<sub>t</sub>c<sub>t−k</sub> / Σc<sub>t</sub>²; band ±1.96/√n</td><td>r₁ −0.41, r₁₂ −0.31; band ±0.286</td></tr>
    <tr><td>PACF(2)</td><td>(r₂ − r₁²)/(1 − r₁²)</td><td>(0.059 − 0.167)/0.833 = −0.13</td></tr>
  </table>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>Classical decomposition</th><th>STL</th></tr>
    <tr><td>Trend</td><td>2×12 centred moving average</td><td>Loess</td></tr>
    <tr><td>Season</td><td>Fixed every year</td><td>May drift (Nov 14.3 → 10.2)</td></tr>
    <tr><td>Ends</td><td>6 months missing each end</td><td>Complete</td></tr>
    <tr><td>Outliers</td><td>Not robust</td><td><code>robust=True</code></td></tr>
    <tr><td>Multiplicative</td><td><code>model="multiplicative"</code></td><td>Only via log</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Test</th><th>Null hypothesis</th><th>Small p means</th><th>Meera raw / w</th></tr>
    <tr><td>ADF</td><td>unit root (non-stationary)</td><td>stationary</td><td>1.000 / 0.000</td></tr>
    <tr><td>KPSS</td><td>stationary</td><td>non-stationary</td><td>0.010 / 0.100</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">y.resample("MS").sum()                    # days -> months
y.rolling(12).mean()                      # trailing window (centre=True: analysis only)
seasonal_decompose(y, model="additive", period=12)
STL(y, period=12, robust=True).fit()      # .trend .seasonal .resid
adfuller(y)[1]; kpss(y, regression="c")[1]
w = y.diff().diff(12).dropna()            # d = 1, D = 1
acf(w, nlags=13); pacf(w, nlags=13, method="ywm")
X["lag_12"] = y.shift(12)                 # lag feature
X["roll_3"] = y.shift(1).rolling(3).mean()   # shift first, then roll</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Never shuffle or split randomly; validate on later dates only (KFold 3.66 vs honest 6.41).</li>
    <li>Every feature must be known at forecast time: shift before rolling (leaky 2.62 vs honest 4.44).</li>
    <li>ADF small p = stationary; KPSS small p = non-stationary; neither tests seasonality.</li>
    <li>Decomposition and centred windows use the future: analysis only.</li>
    <li>Make the series stationary before reading ACF/PACF; treat cut-off rules as hints.</li>
    <li>Over-differencing: lag-1 ACF near −0.5, variance goes up.</li>
  </ul>

  <h2 id="ts-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a time series, and how is it different from ordinary tabular data?</summary><div class="qa-body">A time series is a sequence of values of one quantity measured at equally spaced times. Unlike tabular rows, its values are not independent: each depends on earlier ones (autocorrelation), so the order carries information. That means you cannot shuffle the rows or split them randomly, and the main inputs are the series' own past values plus calendar information.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use random k-fold cross-validation on a time series?</summary><div class="qa-body">Random folds put future months in training and past months in testing, so the model only has to interpolate between known neighbours, which it can never do in real use. Scores come out optimistic; on Meera's shop shuffled KFold reported MAE 3.66 against 6.41 for time-ordered folds. Use TimeSeriesSplit or a rolling origin, always training on data before each test window.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the components of a time series with an example of each.</summary><div class="qa-body">Trend: the long-run direction (sales rising about ₹9 thousand a year). Seasonality: a pattern with a fixed known period (an October–November peak every year). Cycle: rises and falls with no fixed period (a two-year slowdown). Noise: unpredictable month-to-month surprises. Decomposition methods usually merge trend and cycle into a "trend-cycle".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through classical additive decomposition.</summary><div class="qa-body">Estimate the trend with a centred moving average over one full season (a 2×12 average for monthly data, end months weighted half). Subtract it to get season plus noise. Average the detrended values for each calendar month to get raw seasonal indices, then centre them so they sum to zero. The residual is what is left: y − trend − season. The trend is missing s/2 values at each end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Additive or multiplicative seasonality: how do you decide?</summary><div class="qa-body">Check whether the seasonal swing grows with the level. If the swing stays roughly constant while the level rises (Meera's yearly swing 37, 26, 34, 24, 32 while sales rose 34%), use additive. If it grows in proportion, use multiplicative, or take logs and use additive. Comparing residual sizes of the two fits is a useful confirmation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does STL improve over classical decomposition?</summary><div class="qa-body">It uses loess (local regression) instead of moving averages, so it has values at the ends; it smooths each calendar month across years, so the seasonal shape can evolve; and its robust option down-weights outliers. Its windows are tunable. It is additive only, so multiplicative data should be logged first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stationarity, and why do classical models need it?</summary><div class="qa-body">A weakly stationary series has a constant mean, a constant variance, and an autocovariance that depends only on the lag, not on time. Models like ARIMA learn fixed coefficients from the past, and those coefficients only describe the future if the series' statistical behaviour does not change. Trend and seasonality violate the constant-mean condition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a unit root, and how does it differ from a deterministic trend?</summary><div class="qa-body">A unit root means the series behaves like a random walk, y<sub>t</sub> = y<sub>t−1</sub> + noise: every shock is permanent, the variance grows with time, and forecast intervals keep widening. A deterministic trend is a fixed line plus stationary noise; shocks fade and the series returns to the line. A unit root is removed by differencing, a deterministic trend by subtracting the fitted line.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the ADF test and how KPSS differs.</summary><div class="qa-body">ADF regresses the change Δy<sub>t</sub> on the previous level y<sub>t−1</sub> plus lagged changes; its null is a unit root (β = 0). A t-statistic below the Dickey-Fuller critical value (about −2.9) rejects it, so a small p-value means stationary. KPSS has the opposite null (stationary), so a small p-value means non-stationary. Using both guards against ADF's low power on short series.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ADF and KPSS disagree. What do you do?</summary><div class="qa-body">If ADF cannot reject and KPSS cannot reject either, the data are too few to decide; look at the plot and the ACF, and check for seasonality (Meera's diff(1) still carried the yearly pattern, so a seasonal difference was needed). If both reject, the series may be trend-stationary or have a structural break; difference and check for breaks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do ordinary and seasonal differencing remove, and how do you undo them?</summary><div class="qa-body">diff(1) = y<sub>t</sub> − y<sub>t−1</sub> removes a trend (unit root); diff(12) = y<sub>t</sub> − y<sub>t−12</sub> removes a yearly season. To undo both, rebuild y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w<sub>t</sub>; a single ordinary difference is undone by a cumulative sum from the first value. This integration is the I in ARIMA.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you spot over-differencing?</summary><div class="qa-body">A lag-1 autocorrelation near or below −0.5 (differencing white noise gives exactly −0.5), a variance that rises after the difference, or later a fitted MA(1) coefficient close to −1. Difference only as much as the tests and plots require; d + D rarely exceeds 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you apply a log or Box-Cox transform?</summary><div class="qa-body">When the variance or seasonal swing grows with the level. The log turns multiplicative effects into additive ones and differences into growth rates. Choose λ so that the variance is stable over time, not so the histogram looks normal, and remember to invert the transform after forecasting (exponentiating a log forecast gives the median, not the mean).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ACF vs PACF: what does each measure?</summary><div class="qa-body">The ACF at lag k is the total correlation between y<sub>t</sub> and y<sub>t−k</sub>, including influence passed along through the in-between lags. The PACF keeps only the direct part, after controlling for lags 1 to k − 1; it equals the last coefficient when y<sub>t</sub> is regressed on its first k lags. PACF(2) = (r₂ − r₁²)/(1 − r₁²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do the ACF and PACF identify AR and MA models?</summary><div class="qa-body">An AR(p) process has a PACF that cuts off after lag p and an ACF that tails off. An MA(q) process has an ACF that cuts off after lag q and a PACF that tails off. If both tail off, it is ARMA. A spike at lag 12 suggests a seasonal term. On short series these are hints for candidates, to be compared by AIC and residual checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the significance band on an ACF plot?</summary><div class="qa-body">For white noise each sample autocorrelation is roughly normal with mean 0 and variance 1/n, so ±1.96/√n marks where 95% of chance values fall (±0.286 for n = 47). Bars outside it are evidence of memory. With 20 bars, about one will cross by chance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build lag and rolling features without leakage?</summary><div class="qa-body">Use shift(k) with k at least the forecast horizon, and compute rolling statistics on the shifted series (y.shift(1).rolling(3).mean()), never on the raw one. Fit scalers and encoders on training dates only, and use only exogenous values that are known at forecast time, such as planned promotions. On Meera's data an unshifted rolling mean faked MAE 2.62 against an honest 4.44.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should every forecasting model be compared against naive and seasonal naive?</summary><div class="qa-body">They are free forecasts that need no learning: repeat the last value, or repeat the value one season ago. A model that cannot beat them is not worth its complexity. Which baseline is strong depends on the data: on Meera's growing shop naive (5.17) beat seasonal naive (14.75) because seasonal naive ignores a year of growth.</div></details>
</main>
`
});
