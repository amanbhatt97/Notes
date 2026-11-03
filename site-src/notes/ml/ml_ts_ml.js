// notes/ml/ml_ts_ml.js — ML Forecasting
Object.assign(TOPIC_CONTENT, {
  "ml_ts_ml": `<main>
  <h1>ML Forecasting</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>ML Forecasting</span></div>
  <p class="lead">This note shows how to forecast with ordinary machine-learning models such as LightGBM instead of ARIMA or exponential smoothing. The idea is to turn the series into a table, one row per day, with the past values, rolling averages and calendar facts that were known at the moment of forecasting as columns, and then fit any regression model. That simple reframing is how most large-scale forecasting is done today (in the M5 competition on Walmart's 42,840 series, most top solutions were LightGBM models), but it is also full of traps: features that secretly contain the future, validation that shuffles time, horizons whose inputs do not exist yet, and trees that cannot predict beyond what they have seen. We will use the same running example as <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>: Pine View, a homestay in Manali whose owner, Mrs Thakur, records the number of guests every night from 2014 to 2018. Every Sunday night she plans the coming week, so our job is always to forecast Monday to Sunday, and we will work one week by hand, then five years of data, then a chain of five homestays, and end with a fair comparison against the classical models.</p>

  <h2 id="tm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Forecasting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Task and scores</div>
        <ul>
          <li>Origin T (Sunday night), horizon h = 1…7</li>
          <li>Baselines: naive, seasonal naive (= lag7)</li>
          <li>MAE, RMSE, MAPE, WAPE, MASE; pinball for quantiles</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The table</div>
        <ul>
          <li>Row = (series, day); features known at T</li>
          <li>Lags k ≥ h; shift first, then roll</li>
          <li>Calendar, cyclic sin/cos, planned events</li>
          <li>Trees cannot extrapolate: predict y − level</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Honesty</div>
        <ul>
          <li>Leaks faked 2.08–2.35 against an honest 2.57</li>
          <li>TimeSeriesSplit: expanding, sliding, gap</li>
          <li>"Would I have this number on Sunday night?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Going further</div>
        <ul>
          <li>Recursive (1 model, fed back) vs direct (1 per h)</li>
          <li>Global model across series: Ooty 1.18 → 0.96</li>
          <li>Quantile LightGBM: P10, P50, P90</li>
          <li>One clean series: Prophet-style 1.70 beats LightGBM 2.15</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tm-task"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Task and the Baselines</span><span class="rm-sub">origin, horizon, and free forecasts to beat</span></div></div>
      <div class="rm-item rm-done" data-target="tm-metrics"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Forecast Metrics</span><span class="rm-sub">MAE, RMSE, MAPE, WAPE, MASE by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tm-table"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Forecasting as Supervised Learning</span><span class="rm-sub">the sliding-window table</span></div></div>
      <div class="rm-item rm-done" data-target="tm-feat"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Feature Engineering</span><span class="rm-sub">lags, windows, calendar, target transforms</span></div></div>
      <div class="rm-item rm-done" data-target="tm-leak"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leakage Traps</span><span class="rm-sub">four fake improvements, measured</span></div></div>
      <div class="rm-item rm-done" data-target="tm-cv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Time-Series Cross-Validation</span><span class="rm-sub">expanding and sliding windows, gaps</span></div></div>
      <div class="rm-item rm-done" data-target="tm-multi"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Recursive vs Direct Forecasting</span><span class="rm-sub">seven days ahead from one Sunday</span></div></div>
      <div class="rm-item rm-done" data-target="tm-global"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Global Models</span><span class="rm-sub">one LightGBM for five homestays</span></div></div>
      <div class="rm-item rm-done" data-target="tm-quant"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quantile Forecasts and Pinball Loss</span><span class="rm-sub">planning for the busy nights</span></div></div>
      <div class="rm-item rm-done" data-target="tm-vs"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ML vs ARIMA, ETS and Prophet</span><span class="rm-sub">a fair weekly back-test</span></div></div>
      <div class="rm-item rm-done" data-target="tm-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">gappy shifts, mixed series, train/serve skew</span></div></div>
      <div class="rm-item rm-done" data-target="tm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, rules and the homestay's numbers</span></div></div>
      <div class="rm-item rm-done" data-target="tm-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about ML forecasting</span></div></div>
    </div>
  </div>

  <h2 id="tm-task"><span class="num">01</span>The Task and the Baselines</h2>
  <p>Before building any model we need two things: the exact forecasting question, and a free answer to beat. Without them we cannot say whether a model's error of 2.5 guests is impressive or embarrassing. Mrs Thakur runs Pine View, a 12-room homestay in Manali (the same register as in the previous note: daily guests from 2014 to 2018, a weekend rhythm, a yearly rhythm, a five-day Snow Carnival in 2015, 2017 and 2018, faster growth after a new road in 2016, and 20 lost days in June 2015). Every Sunday night she plans the next week's staff and groceries. So the <strong>forecast origin</strong> T, the last day whose value we know, is a Sunday; the <strong>horizon</strong> h runs from 1 (Monday) to 7 (Sunday); and the target is the number of guests on each of those nights. Our hand-worked week throughout the note has its origin on Sunday 4 March 2018 and forecasts Monday 5 to Sunday 11 March.</p>
  <p>As in every forecasting note, we start with <strong>baselines</strong>, forecasts produced by a fixed rule with no learning. <strong>Naive</strong> repeats the last known day. <strong>Seasonal naive</strong> repeats the same weekday last week (the season here is the week, m = 7). A gentler version averages the last two same weekdays. By hand: naive says 25 every day (last Sunday) and misses Saturday's 34 by 9; seasonal naive copies 23, 24, 24, 25, 31, 34, 25 and gets the weekend right; the two-week average is (23 + 27)/2 = 25 for Monday, and so on.</p>
  <div class="fx" data-lang="py">y = daily.asfreq("D")                                  # one row per calendar day (gaps become NaN)
origin = pd.Timestamp("2018-03-04")                    # Sunday night: forecast Mon 5 - Sun 11 March
history, actual = y[:origin], y[origin + pd.Timedelta(days=1):][:7]
print("last 2 weeks:", history[-14:].astype(int).tolist())
print("next week   :", actual.astype(int).tolist(), " total", int(actual.sum()))
naive  = np.repeat(history.iloc[-1], 7)                # every day = last Sunday
snaive = history[-7:].values                           # each day = same weekday last week
avg2   = (history[-7:].values + history[-14:-7].values) / 2    # mean of the last 2 same weekdays
for name, f in [("naive", naive), ("seasonal naive", snaive), ("mean of 2 weeks", avg2)]:
    err = actual.values - f
    print(f"{name:16s} {np.round(f, 1).tolist()}  |err| {np.abs(err).tolist()}  MAE {np.abs(err).mean():.2f}")</div>
  <div class="fx" data-lang="text">last 2 weeks: [27, 29, 26, 27, 33, 31, 29, 23, 24, 24, 25, 31, 34, 25]
next week   : [29, 28, 27, 25, 31, 34, 29]  total 203
naive            [25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0]  |err| [4.0, 3.0, 2.0, 0.0, 6.0, 9.0, 4.0]  MAE 4.00
seasonal naive   [23.0, 24.0, 24.0, 25.0, 31.0, 34.0, 25.0]  |err| [6.0, 4.0, 3.0, 0.0, 0.0, 0.0, 4.0]  MAE 2.43
mean of 2 weeks  [25.0, 26.5, 25.0, 26.0, 32.0, 32.5, 27.0]  |err| [4.0, 1.5, 2.0, 1.0, 1.0, 1.5, 2.0]  MAE 1.86</div>
  <p><code>daily.asfreq("D")</code> turns the register into one row per calendar day, so the lost days become visible NaNs instead of silently missing rows (section 04 shows why that matters), and <code>history[-7:]</code> is the last known week. Naive ignores the weekend rhythm (MAE 4.00). Seasonal naive gets the weekend right but copies last Monday's unusually quiet 23 (MAE 2.43). Averaging two weeks smooths that one-off dip (1.86). Think of a kirana shop owner ordering milk for next week: "same as yesterday" forgets that Sunday is different, "same as last week, day by day" remembers the weekly rhythm, "average of the last two weeks" also forgets one strange day. None of them knows a festival is coming; that is what a model with a calendar can add. Note which baseline matters: on weekly-patterned data naive is a weak bar, so a model that "beats naive by 35%" may still lose to seasonal naive, the honest bar.</p>

  <h2 id="tm-metrics"><span class="num">02</span>Forecast Metrics</h2>
  <p>"MAE 2.43" is in guests. Is that good for a homestay of 30 guests? How would we compare it with a homestay twice as big? Do we care more about one awful night than several slightly-off nights? Each standard forecast metric answers a different version of "how wrong were we?", so it is worth knowing what each one rewards. We compute all of them on seasonal naive's errors (actual − forecast) for 5 to 11 March: 6, 4, 3, 0, 0, 0, 4, with actuals 29, 28, 27, 25, 31, 34, 29 (total 203).</p>
  <p>The <strong>MAE</strong> (mean absolute error) is the average size of a miss: 17/7 = 2.43, "a typical night is off by 2.4 guests". The <strong>RMSE</strong> (root mean squared error) squares the errors before averaging and takes the square root at the end: √((36 + 16 + 9 + 16)/7) = √11 = 3.32. Squaring makes big misses weigh more, so the single error of 6 dominates. The <strong>MAPE</strong> (mean absolute percentage error) divides each error by its own actual: (6/29 + 4/28 + 3/27 + 4/29)/7 = 8.55%. It is easy to explain but explodes when actuals are near zero and quietly rewards under-forecasting. The <strong>WAPE</strong> (weighted absolute percentage error) divides the total error by the total volume, 17/203 = 8.37%, which is safe with small days and weights big days more. The <strong>MASE</strong> (mean absolute scaled error) divides the MAE by how wrong seasonal naive has usually been on the training data, so it has no units: below 1 means "better than seasonal naive's usual error", on any series of any size.</p>
  <div class="fx" data-lang="py">y = daily.asfreq("D")
actual = y["2018-03-05":"2018-03-11"].values
f = y["2018-02-26":"2018-03-04"].values                 # the seasonal naive forecast
e = actual - f                                          # error = actual - forecast
train = y[:"2017"]
scale = np.nanmean(np.abs(train.values[7:] - train.values[:-7]))   # in-sample seasonal-naive MAE
print("errors:", e.astype(int).tolist())
print(f"MAE  {np.mean(np.abs(e)):.3f}")
print(f"RMSE {np.sqrt(np.mean(e ** 2)):.3f}")
print(f"MAPE {100 * np.mean(np.abs(e) / actual):.2f}%")
print(f"WAPE {100 * np.abs(e).sum() / actual.sum():.2f}%")
print(f"MASE scale (train, lag 7) {scale:.3f}  -&gt;  MASE {np.mean(np.abs(e)) / scale:.3f}")</div>
  <div class="fx" data-lang="text">errors: [6, 4, 3, 0, 0, 0, 4]
MAE  2.429
RMSE 3.317
MAPE 8.55%
WAPE 8.37%
MASE scale (train, lag 7) 2.481  -&gt;  MASE 0.979</div>
  <p><code>train.values[7:] - train.values[:-7]</code> subtracts each day's value from the value seven days later, which is exactly the error seasonal naive would have made on every training day; <code>np.nanmean</code> skips the NaNs around the lost days. That gives the MASE scale, 2.481, and a MASE of 0.98: this week, seasonal naive was about as good as it usually is. A model with MASE 0.7 removes 30% of seasonal naive's typical error.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Use when</th><th>Avoid when</th></tr>
    <tr><td>MAE</td><td>one series; cost proportional to the miss; explaining to managers</td><td>comparing series of different size</td></tr>
    <tr><td>RMSE</td><td>big misses are disproportionately costly</td><td>a few outliers should not dominate</td></tr>
    <tr><td>MAPE</td><td>never-small series and a percentage is demanded</td><td>zeros or small values; it rewards under-forecasting</td></tr>
    <tr><td>WAPE</td><td>demand across many items, weighting big sellers more</td><td>every item must count equally</td></tr>
    <tr><td>MASE</td><td>comparing many series; "did we beat seasonal naive?"</td><td>non-technical audiences, unless explained</td></tr>
    <tr><td>Pinball (section 09)</td><td>quantile forecasts, uneven costs</td><td>point forecasts</td></tr>
  </table>
  <p>A practical warning about MAPE: averaged over many series with small values (a homestay with 0 to 3 guests on winter weekdays), one night with 1 actual and 3 forecast is a 200% error and swamps everything. Use WAPE or MASE instead. The full family of regression metrics is in <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>.</p>

  <h2 id="tm-table"><span class="num">03</span>Forecasting as Supervised Learning</h2>
  <p>The baselines are fixed rules: they cannot learn that the carnival adds 11 guests, that summer is busier, or that a quiet Monday was noise. LightGBM, random forests and linear regression can learn all of that, but they need a table: rows of examples, columns of features, one target column. A time series is one long column of numbers. How do we turn it into examples, without cheating?</p>
  <p>The answer is the <strong>sliding window</strong>: make one row per day; the target is that day's guests; the features are facts that were already known at the forecast origin, such as the same weekday last week, the week before, the average of the latest known week, which weekday it is, and whether the carnival is on. Slide this window along five years and you get about 1,800 examples of "situation → outcome". A past value used as a feature is called a <strong>lag feature</strong>, y<sub>t−k</sub>. Because our horizon reaches 7 days, every value-based feature must be at least 7 days old; then every feature of every day from Monday to Sunday is known on Sunday night. Think of a cricket analyst predicting tomorrow's score from a spreadsheet: each past match is a row, the columns are the pitch report, the team's average over its last five matches and home or away. The analyst never puts the match's own final score in a column, and never uses information released after the toss if predicting before it.</p>
  <figure class="viz"><svg viewBox="0 0 660 230" width="660">
<defs><marker id="tm-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="20" y="20" font-size="12" font-weight="700">the series (one column)</text>
<g font-size="11" text-anchor="middle">
<rect x="20" y="30" width="38" height="26" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="39" y="47">27</text>
<rect x="58" y="30" width="38" height="26" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="77" y="47">29</text>
<rect x="96" y="30" width="38" height="26" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="115" y="47">…</text>
<rect x="134" y="30" width="38" height="26" class="fb sb"/><text x="153" y="47">23</text>
<rect x="172" y="30" width="38" height="26" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="191" y="47">24</text>
<rect x="210" y="30" width="38" height="26" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="229" y="47">…</text>
<rect x="248" y="30" width="38" height="26" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="267" y="47">25</text>
<rect x="286" y="30" width="38" height="26" class="fg sg"/><text x="305" y="47">29</text>
<text x="39" y="72" class="tm">19 Feb</text><text x="153" y="72" class="tm">26 Feb</text><text x="262" y="72" class="tm">4 Mar</text><text x="312" y="86" class="tm">5 Mar</text>
</g>
<line x1="153" y1="80" x2="440" y2="134" stroke="currentColor" stroke-dasharray="3 3" class="sb"/>
<line x1="39" y1="80" x2="500" y2="134" stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"/>
<line x1="305" y1="80" x2="620" y2="134" stroke="currentColor" stroke-dasharray="3 3" class="sg"/>
<text x="350" y="100" class="tm" font-size="10.5">one row per target day</text>
<g font-size="11" text-anchor="middle">
<rect x="380" y="112" width="60" height="22" class="fs"/><text x="410" y="127" font-weight="700">date</text>
<rect x="440" y="112" width="45" height="22" class="fb"/><text x="462" y="127" font-weight="700">lag7</text>
<rect x="485" y="112" width="50" height="22" class="fs"/><text x="510" y="127" font-weight="700">lag14</text>
<rect x="535" y="112" width="35" height="22" class="fs"/><text x="552" y="127" font-weight="700">dow</text>
<rect x="570" y="112" width="30" height="22" class="fs"/><text x="585" y="127" font-weight="700">ev</text>
<rect x="600" y="112" width="40" height="22" class="fg"/><text x="620" y="127" font-weight="700">y</text>
<text x="410" y="150">5 Mar</text><text x="462" y="150">23</text><text x="510" y="150">27</text><text x="552" y="150">0</text><text x="585" y="150">0</text><text x="620" y="150">29</text>
<text x="410" y="170">6 Mar</text><text x="462" y="170">24</text><text x="510" y="170">29</text><text x="552" y="170">1</text><text x="585" y="170">0</text><text x="620" y="170">28</text>
<text x="410" y="190">…</text><text x="462" y="190">…</text><text x="510" y="190">…</text><text x="552" y="190">…</text><text x="585" y="190">…</text><text x="620" y="190">…</text>
</g>
<text x="20" y="120" font-size="11" class="tb">blue: features, all ≥ 7 days old</text>
<text x="20" y="140" font-size="11" class="tg">green: the target</text>
<text x="20" y="160" font-size="11" class="tm">ev = planned event flag (carnival)</text>
<text x="330" y="222" text-anchor="middle" class="tm" font-size="10.5">lag7 of 5 Mar = value of 26 Feb, known on 4 Mar</text>
</svg><figcaption>The sliding window turns one column into a table. Each row asks: given what was known a week earlier, and the calendar, how many guests on this day?</figcaption></figure>
  <p>Let us build the row for Monday 5 March by hand. lag7 is last Monday, 26 February: 23. lag14 is the Monday before: 27. roll7 is the mean of y<sub>t−7</sub> back to y<sub>t−13</sub>, that is Tuesday 20 February to Monday 26 February: (29 + 26 + 27 + 33 + 31 + 29 + 23)/7 = 198/7 = 28.29. dow (day of week) is 0 for Monday, and the carnival flag is 0. For Sunday 11 March, lag7 is Sunday 4 March itself: the latest possible value, and still known at the origin, which is why 7 is the smallest safe lag for a 7-day horizon.</p>
  <div class="fx" data-lang="py">def make_table(y):
    """One row per day. Every value-based feature is at least 7 days old,
    so all of them are known on the Sunday night when next week is forecast."""
    y = y.asfreq("D")                                   # explicit calendar: a gap is a NaN, not a skipped row
    X = pd.DataFrame(index=y.index)
    X["lag7"] = y.shift(7)                              # same weekday last week
    X["lag14"] = y.shift(14)                            # same weekday two weeks ago
    X["roll7"] = y.shift(7).rolling(7, min_periods=5).mean()   # average of the latest known full week
    X["dow"] = y.index.dayofweek                        # 0 = Monday ... 6 = Sunday
    X["month"] = y.index.month
    X["carnival"] = y.index.isin(CARNIVAL_DAYS).astype(int)    # planned event: known in advance
    X["y"] = y
    return X

tbl = make_table(daily)
print(tbl.loc["2018-03-05":"2018-03-11"].round(2).to_string())
train = tbl.loc[:"2017"].dropna(subset=["y"])              # rows with a known target
test = tbl.loc["2018"]
features = ["lag7", "lag14", "roll7", "dow", "month", "carnival"]
model = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15,
                          min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)
model.fit(train[features], train["y"])
pred = model.predict(test[features])
print("training rows:", len(train), " test rows:", len(test))
print("2018 MAE  seasonal naive:", round(np.mean(np.abs(test.y - test.lag7)), 3),
      "  LightGBM:", round(np.mean(np.abs(test.y - pred)), 3))
print("5-11 March forecast:", np.round(pred[63:70], 1).tolist())</div>
  <div class="fx" data-lang="text">            lag7  lag14  roll7  dow  month  carnival     y
2018-03-05  23.0   27.0  28.29    0      3         0  29.0
2018-03-06  24.0   29.0  27.57    1      3         0  28.0
2018-03-07  24.0   26.0  27.29    2      3         0  27.0
2018-03-08  25.0   27.0  27.00    3      3         0  25.0
2018-03-09  31.0   33.0  26.71    4      3         0  31.0
2018-03-10  34.0   31.0  27.14    5      3         0  34.0
2018-03-11  25.0   29.0  26.57    6      3         0  29.0
training rows: 1441  test rows: 365
2018 MAE  seasonal naive: 2.767   LightGBM: 2.573
5-11 March forecast: [25.8, 24.3, 24.9, 24.7, 29.5, 30.0, 26.0]</div>
  <p><code>make_table</code> builds every feature with <code>shift(k)</code>, which moves the column down k days, so row t sees y<sub>t−k</sub>. <code>shift(7).rolling(7, min_periods=5).mean()</code> first moves back a week, then averages 7 values, allowing up to 2 missing. The printed rows match the hand values. The model is trained on 1,441 rows from 2014 to 2017 and predicts all 365 days of 2018; since every feature is at least 7 days old, this equals 52 honest "Sunday-night" forecasts. LightGBM scores 2.57 on the whole year against seasonal naive's 2.77. For our week it forecasts 25.8, 24.3, 24.9, 24.7, 29.5, 30.0, 26.0: the right shape, but every day too low (the actuals are 29, 28, 27, 25, 31, 34, 29). Hold on to that clue; section 04 explains it. And remember that a table made from a time series is still a time series: its rows are ordered and neighbouring rows share information (y<sub>t</sub> is the lag7 of y<sub>t+7</sub>), so we always train on the past and test on the future.</p>

  <h2 id="tm-feat"><span class="num">04</span>Feature Engineering</h2>
  <p>Our first table had six features and forecast the busy 2018 too low. Which columns does a forecasting table need, how is each built correctly, and why is the model stuck below the new level? We take the pieces one at a time and measure them together at the end.</p>
  <p>First, make the calendar explicit. <code>shift(7)</code> moves values down 7 <em>rows</em>; if a day is missing from the index, 7 rows is no longer 7 days. Pine View's raw register has no rows at all for 1 to 20 June 2015. Second, encode cyclic calendar values on a circle. Day-of-year as a plain number puts 31 December (365) and 1 January (1) at opposite ends of the scale although they are neighbours. Mapping it to sin(2π·d/365.25) and cos(2π·d/365.25) puts them side by side again; by hand, 31 December gives (−0.004, 1.000), 1 January (+0.017, 1.000), and 2 July (−0.006, −1.000), the opposite side of the circle. This is the same idea as Prophet's Fourier terms.</p>
  <div class="fx" data-lang="py">wrong = daily.shift(7)                                  # the raw register skips 1-20 June 2015
right = daily.asfreq("D").shift(7)
d = pd.Timestamp("2015-06-22")
print(f"lag7 for {d.date()}: rows-shift -&gt; {wrong[d]:.0f} (that is {daily.index[daily.index.get_loc(d) - 7].date()}),"
      f" calendar-shift -&gt; {right[d]}")
for day in ["2017-12-31", "2018-01-01", "2018-07-02"]:   # cyclic encoding of the day of the year
    k = pd.Timestamp(day).dayofyear
    print(f"{day}: day-of-year {k:3d}  sin {np.sin(2 * np.pi * k / 365.25):+.3f}  cos {np.cos(2 * np.pi * k / 365.25):+.3f}")

tbl = make_table(daily)
tbl["lag364"] = tbl.y.shift(364)                        # same weekday, 52 weeks ago
tbl["roll28"] = tbl.y.shift(7).rolling(28, min_periods=20).mean()
tbl["doy_sin"] = np.sin(2 * np.pi * tbl.index.dayofyear / 365.25)
tbl["doy_cos"] = np.cos(2 * np.pi * tbl.index.dayofyear / 365.25)
train, test = tbl.loc[:"2017"].dropna(subset=["y"]), tbl.loc["2018"]
def mae_2018(features, minus_roll7):
    off_tr = train.roll7 if minus_roll7 else 0          # predict y - roll7, then add roll7 back
    off_te = test.roll7 if minus_roll7 else 0
    m = lgbm().fit(train[features], train.y - off_tr)
    return np.mean(np.abs(test.y - (m.predict(test[features]) + off_te)))
base = ["lag7", "lag14", "roll7", "dow", "month", "carnival"]
more = base + ["doy_sin", "doy_cos", "lag364", "roll28"]
print("max y in training:", train.y.max(), " max y in 2018:", test.y.max())
for name, f in [("base features", base), ("+ season &amp; long lags", more)]:
    print(f"{name:22s} target y: {mae_2018(f, False):.3f}   target y - roll7: {mae_2018(f, True):.3f}")</div>
  <div class="fx" data-lang="text">lag7 for 2015-06-22: rows-shift -&gt; 23 (that is 2015-05-26), calendar-shift -&gt; nan
2017-12-31: day-of-year 365  sin -0.004  cos +1.000
2018-01-01: day-of-year   1  sin +0.017  cos +1.000
2018-07-02: day-of-year 183  sin -0.006  cos -1.000
max y in training: 39.0  max y in 2018: 43.0
base features          target y: 2.573   target y - roll7: 2.451
+ season &amp; long lags   target y: 2.229   target y - roll7: 2.155</div>
  <p>The first line shows the gap trap: on 22 June 2015, a plain <code>shift(7)</code> on the raw register returned the value from 26 May, 27 days earlier, and called it "last week". After <code>asfreq("D")</code> the missing days exist as NaN, and lag7 is correctly NaN (LightGBM handles missing feature values natively). With many series, do this per series, or a lag will leak across series boundaries (section 08).</p>
  <p>Which lags? The <strong>horizon rule</strong> says a lag k is usable only if k ≥ h for the farthest step that model forecasts; for one model covering 7 days, that means lags 7, 14, 21 and so on (section 07 relaxes this). Within that rule, use <strong>seasonal lags</strong>, multiples of the season: 7 and 14 for the weekly rhythm, 364 (52 weeks, so the same weekday) for the yearly one. The ACF from <a class="xref" data-note="ml_timeseries">Time Series Basics</a> shows which past days are most related to today. A single lag is noisy (last Monday's quiet 23), so add <strong>rolling features</strong>, statistics of a window of lags, and always shift first, then roll: <code>y.shift(7).rolling(28).mean()</code> averages days t−7 to t−34, all known on Sunday. Useful window statistics are the mean (level), standard deviation (volatility), minimum and maximum. An <strong>expanding</strong> mean uses all history so far, and an exponentially weighted mean, <code>y.shift(7).ewm(alpha=0.3).mean()</code>, is exactly the simple exponential smoothing level of the previous note, used as a feature.</p>
  <p>Calendar features (weekday, month, day-of-year, holiday flags, "days until the carnival") are known in advance and therefore always safe. Other drivers need one question: is its value known on Sunday for next week? The carnival dates and public holidays are planned, so yes. The room price Mrs Thakur sets is her decision, so yes. Bookings already made for next week are known as of Sunday, so use the count <em>as of the origin</em>, never the final count. Rain and landslide road closures are not known; either use a weather forecast in training too, so the model learns from the same imperfect input it will have, or leave them out.</p>
  <p>Now the clue from section 03. A decision tree predicts the average of the training rows in a leaf, so it can never predict above the highest values it has seen, and LightGBM, a sum of trees, has the same ceiling. In other words, trees cannot <strong>extrapolate</strong>. Pine View keeps growing: the training maximum is 39, and 2018 reaches 43. The fix is a <strong>target transform</strong>: predict something without the trend, y − roll7 ("how far today sits from last week's average"), then add roll7 back. The model learns shapes ("Saturday is +6 over the weekly average") and the level comes from the data. In the table printed above, both changes help and they add up: the richer features (cyclic day-of-year, lag364, roll28) take the MAE from 2.573 to 2.229, the trend-free target from 2.573 to 2.451, and both together to 2.155, now 22% below seasonal naive. Other common target transforms are y / level (a ratio, used for the global model in section 08), log(1 + y) for multiplicative growth, and first differences. A forecast that flatlines just below recent values on a growing series is the signature of a tree hitting its ceiling: do not add more trees; change the target, or add a linear component.</p>

  <h2 id="tm-leak"><span class="num">05</span>Leakage Traps</h2>
  <p>Our honest model with the base features scores 2.57. If a colleague reports 2.08 with "just one more feature", is it a better model or a leak? <strong>Temporal leakage</strong> is any use, in features, preprocessing, the train/test split or revised data, of information that would not be available at the forecast origin when the model is really used. In forecasting it is easy to commit, because the future sits in the same column as the past, one row down. Think of a student practising with question papers that have the answer key printed faintly on the back: mock scores soar, and the board exam has no answer key. One question catches every leak: "On Sunday night, would I have this number?" The code adds one leaky feature at a time to the honest base model, then tries a random split.</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import train_test_split
tbl = make_table(daily)
y = tbl.y
tbl["roll7_leaky"] = y.rolling(7).mean()                 # includes today's own value
tbl["lag1"] = y.shift(1)                                 # yesterday: unknown 2..7 days ahead
tbl["month_mean_leaky"] = y.groupby(y.index.to_period("M")).transform("mean")   # incl. future days
tbl = tbl.dropna(subset=["y"])
base = ["lag7", "lag14", "roll7", "dow", "month", "carnival"]
def score(features, train, test):
    m = lgbm().fit(train[features], train.y)
    return np.mean(np.abs(test.y - m.predict(test[features])))
tr, te = tbl.loc[:"2017"], tbl.loc["2018"]
print(f"honest (time split, lags &gt;= 7)        MAE {score(base, tr, te):.2f}")
print(f"+ rolling mean without shift          MAE {score(base + ['roll7_leaky'], tr, te):.2f}")
print(f"+ lag1 (needs tomorrow's data)        MAE {score(base + ['lag1'], tr, te):.2f}")
print(f"+ this month's mean (future days)     MAE {score(base + ['month_mean_leaky'], tr, te):.2f}")
rtr, rte = train_test_split(tbl, test_size=365, shuffle=True, random_state=0)
print(f"random split instead of time split    MAE {score(base, rtr, rte):.2f}")</div>
  <div class="fx" data-lang="text">honest (time split, lags &gt;= 7)        MAE 2.57
+ rolling mean without shift          MAE 2.08
+ lag1 (needs tomorrow's data)        MAE 2.35
+ this month's mean (future days)     MAE 2.29
random split instead of time split    MAE 2.08</div>
  <p>Every leak "improves" the honest 2.57, by 0.2 to 0.5 guests, and every improvement is fake. A rolling mean without the shift (2.08) averages the last 7 days including today, so the answer is one seventh of the feature; the fix is <code>y.shift(h).rolling(k)</code>. <code>lag1</code> (2.35) is yesterday's value: fine for Monday, but for Sunday's forecast you would need Saturday's actual, six days in the future; the fix is lags of at least h, or the recursive and direct strategies of section 07. "This month's mean" (2.29) for 5 March includes 6 to 31 March; group statistics must be computed on the training period only, or from lagged data. And a random split (2.08) puts the days around each test day into training, so lag7 of a test day is a training target; split by time instead.</p>
  <p>Three more leaks do not show up in this code but are just as real. A scaler or encoder fitted on all dates lets the 2018 mean and spread enter training; fit it inside a pipeline on training rows only (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). Actual values of uncertain drivers, such as next week's real rainfall, look great offline and fail live; train on the forecasts you will actually have. And revised data, such as booking counts corrected days later, must be stored "as known at" each date; this practice is called <strong>point-in-time correctness</strong>. In production, a model trained with leaky inputs does worse than an honest one, because it learned to depend on numbers that no longer exist.</p>

  <h2 id="tm-cv"><span class="num">06</span>Time-Series Cross-Validation</h2>
  <p>All our numbers so far come from one test year. Was 2018 typical? Is LightGBM better than seasonal naive in every season or only on average? Ordinary k-fold cross-validation would put future rows in training, and one train/test split gives a single score that may be luck. <strong>Time-series cross-validation</strong> (also called rolling-origin or walk-forward validation) gives many honest test scores: a sequence of folds, each training only on data before a cut-off and testing on the block right after it, with the cut-off moving forward each time.</p>
  <p>There are three common window schemes. With an <strong>expanding</strong> window each fold trains on everything before its cut-off, so training grows; this is the default when old data is still relevant. With a <strong>sliding</strong> window each fold trains on only the most recent block of fixed length, for when old data is stale (before the road, before COVID). And a <strong>gap</strong> leaves some days unused between training and test, for when data arrives late or features need a buffer. By hand on four weeks numbered 0 to 27, an expanding scheme trains on 0–6 and tests on 7–13, then trains on 0–13 and tests on 14–20, and so on; a sliding scheme of length 7 trains on 0–6, then 7–13, then 14–20.</p>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<text x="10" y="18" font-size="11" class="tm">days 0 … 27 →</text>
<g font-size="11">
<text x="10" y="44">expanding</text>
<rect x="130" y="32" width="120" height="14" class="fb sb"/><rect x="250" y="32" width="120" height="14" class="fr sr"/>
<rect x="130" y="50" width="240" height="14" class="fb sb"/><rect x="370" y="50" width="120" height="14" class="fr sr"/>
<rect x="130" y="68" width="360" height="14" class="fb sb"/><rect x="490" y="68" width="120" height="14" class="fr sr"/>
<text x="10" y="112">sliding</text>
<rect x="130" y="100" width="120" height="14" class="fb sb"/><rect x="250" y="100" width="120" height="14" class="fr sr"/>
<rect x="250" y="118" width="120" height="14" class="fb sb"/><rect x="370" y="118" width="120" height="14" class="fr sr"/>
<rect x="370" y="136" width="120" height="14" class="fb sb"/><rect x="490" y="136" width="120" height="14" class="fr sr"/>
<text x="10" y="176">with gap</text>
<rect x="130" y="164" width="189" height="14" class="fb sb"/><rect x="319" y="164" width="34" height="14" class="fs"/><rect x="353" y="164" width="86" height="14" class="fr sr"/>
<rect x="130" y="182" width="360" height="14" class="fb sb"/><rect x="490" y="182" width="34" height="14" class="fs"/><rect x="524" y="182" width="86" height="14" class="fr sr"/>
</g>
<rect x="520" y="8" width="12" height="10" class="fb sb"/><text x="537" y="17" font-size="10.5">train</text>
<rect x="580" y="8" width="12" height="10" class="fr sr"/><text x="597" y="17" font-size="10.5">test</text>
</svg><figcaption>Training (blue) always ends before testing (red) begins. Sliding windows drop old data; a gap (grey) leaves unused days between them. The "with gap" rows show folds 0 and 2.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.model_selection import TimeSeriesSplit
days = np.arange(28)                                     # four weeks, row numbers 0..27
for title, cv in [("expanding", TimeSeriesSplit(n_splits=3, test_size=7)),
                  ("sliding (max_train_size=7)", TimeSeriesSplit(n_splits=3, test_size=7, max_train_size=7)),
                  ("expanding with gap=2", TimeSeriesSplit(n_splits=3, test_size=5, gap=2))]:
    print(title)
    for k, (tr, te) in enumerate(cv.split(days)):
        print(f"  fold {k}: train {tr[0]:2d}-{tr[-1]:2d} ({len(tr):2d} rows)  test {te[0]:2d}-{te[-1]:2d}")

tbl = make_table(daily).loc[:"2017"].dropna(subset=["y"])    # a real back-test inside 2014-2017
features = ["lag7", "lag14", "roll7", "dow", "month", "carnival"]
rows = []
for tr, te in TimeSeriesSplit(n_splits=6, test_size=56).split(tbl):   # 6 folds of 8 weeks
    a, b = tbl.iloc[tr], tbl.iloc[te]
    model = lgbm().fit(a[features], a.y)
    rows.append((b.index[0].date(), len(a), np.mean(np.abs(b.y - b.lag7)),
                 np.mean(np.abs(b.y - model.predict(b[features])))))
for start, n, s, m in rows:
    print(f"test from {start}  train rows {n:4d}  seasonal naive {s:.2f}  LightGBM {m:.2f}")
s, m = np.array([r[2] for r in rows]), np.array([r[3] for r in rows])
print(f"mean ± std   seasonal naive {s.mean():.2f} ± {s.std():.2f}   LightGBM {m.mean():.2f} ± {m.std():.2f}")</div>
  <div class="fx" data-lang="text">expanding
  fold 0: train  0- 6 ( 7 rows)  test  7-13
  fold 1: train  0-13 (14 rows)  test 14-20
  fold 2: train  0-20 (21 rows)  test 21-27
sliding (max_train_size=7)
  fold 0: train  0- 6 ( 7 rows)  test  7-13
  fold 1: train  7-13 ( 7 rows)  test 14-20
  fold 2: train 14-20 ( 7 rows)  test 21-27
expanding with gap=2
  fold 0: train  0-10 (11 rows)  test 13-17
  fold 1: train  0-15 (16 rows)  test 18-22
  fold 2: train  0-20 (21 rows)  test 23-27
test from 2017-01-30  train rows 1105  seasonal naive 2.04  LightGBM 2.30
test from 2017-03-27  train rows 1161  seasonal naive 2.50  LightGBM 2.45
test from 2017-05-22  train rows 1217  seasonal naive 2.71  LightGBM 1.85
test from 2017-07-17  train rows 1273  seasonal naive 2.39  LightGBM 2.07
test from 2017-09-11  train rows 1329  seasonal naive 2.96  LightGBM 2.75
test from 2017-11-06  train rows 1385  seasonal naive 2.75  LightGBM 2.49
mean ± std   seasonal naive 2.56 ± 0.30   LightGBM 2.32 ± 0.29</div>
  <p>scikit-learn's <code>TimeSeriesSplit(n_splits, test_size)</code> produces the expanding folds, <code>max_train_size</code> turns them into sliding windows, and <code>gap</code> drops rows between train and test; the printed row numbers match the hand scheme. The real back-test then uses six folds of 8 weeks across 2017, retraining LightGBM each time on everything before the fold (1,105 to 1,385 rows). Read the fold table, not just the mean. LightGBM wins 5 of 6 folds, loses the fold starting 30 January 2017 (2.30 against 2.04), and is clearly better in early summer (1.85 against 2.71). The means are 2.32 ± 0.29 against 2.56 ± 0.30: the gain (0.24) is real but not large compared with the fold-to-fold spread, which is exactly what one test year cannot tell you.</p>
  <p>Some practical rules. Make each test block at least as long as the business horizon (here a week), and use several, covering different seasons. Use the folds for every choice you make, including features, hyperparameters (<code>GridSearchCV(cv=TimeSeriesSplit(...))</code>) and model family, and keep a final untouched period (2018 here) for the last check. With many series, split all of them by the same date. Build lag and rolling features on the full timeline first (they only look backwards), then split rows by date; never rebuild rolling features inside the test block from test targets. And beware the library default: <code>cross_val_score(model, X, y, cv=5)</code> uses plain KFold, which tests on 2014 while training on 2015 to 2018, so always pass a time-ordered splitter.</p>

  <h2 id="tm-multi"><span class="num">07</span>Recursive vs Direct Forecasting</h2>
  <p>With "lags ≥ 7" every day of the coming week ignores the most recent six days. On Sunday night we do know Sunday, Saturday, Friday and so on. Monday's forecast could use Sunday's value (1 day old), but Sunday's forecast (7 days ahead) cannot use Saturday's, which does not exist yet. How do we use fresh information for near days without leaking for far days? There are three strategies.</p>
  <p>The <strong>recursive</strong> (or iterated) strategy trains a single one-day-ahead model, forecasts Monday, then pretends that forecast is Monday's real value and forecasts Tuesday from it, and so on for seven days. It needs one model, but its errors can pile up. The <strong>direct</strong> strategy trains a separate model for each h from 1 to 7, each using only values known at the origin to predict exactly h days ahead; no forecast is ever fed back, at the cost of seven models. The third is what we did so far: one model whose features are all at least H days old, the simplest but blind to the freshest days. (Hybrids exist too: DirRec, direct models that also take earlier steps' forecasts as inputs, and MIMO, one model that outputs all seven values at once, common in neural networks.)</p>
  <p>Think of a relay of guesses. In the recursive strategy each runner starts from where the previous runner fell, so one stumble affects everyone after. In the direct strategy each runner starts from the same real starting line. To see the recursive risk by hand, take a toy one-step rule, ŷ<sub>t</sub> = 0.5·y<sub>t−1</sub> + 0.5·y<sub>t−7</sub> ("half yesterday, half the same day last week"), from origin Sunday 4 March (y = 25). Monday: 0.5 × 25 (real Sunday) + 0.5 × 23 = 24, actual 29. Tuesday: 0.5 × 24 (our own forecast) + 0.5 × 24 = 24, actual 28. Wednesday: 24 again, actual 27. Thursday: 0.5 × 24 + 0.5 × 25 = 24.5. Friday: 0.5 × 24.5 + 0.5 × 31 = 27.75. Saturday: 30.875. Sunday: 27.94. The MAE is 19.94/7 = 2.85. From Tuesday on, "yesterday" is our own forecast: the quiet Sunday dragged Monday down, and that low forecast then fed Tuesday's, which fed Wednesday's. One error propagates.</p>
  <p>Now the real comparison. Both strategies get the same inputs, the last 14 days of the register at the origin (y<sub>T</sub>, y<sub>T−1</sub>, …, y<sub>T−13</sub>) plus the target day's weekday, carnival flag and position in the year, and both forecast Monday to Sunday from each of the 52 Sundays of 2018.</p>
  <div class="fx" data-lang="py">y = daily.asfreq("D")
W, DAY = 14, pd.Timedelta(days=1)                        # look-back window: the last 14 days
def window_rows(series, origins, h):
    """One row per forecast origin T: the 14 values up to T, plus calendar facts about day T+h."""
    rows = []
    for T in origins:
        past = series[T - (W - 1) * DAY:T].values        # y[T-13] ... y[T]
        day = T + h * DAY
        rows.append(list(past[::-1]) + [day.dayofweek, int(day in CARNIVAL_DAYS),
                                         np.sin(2 * np.pi * day.dayofyear / 365.25),
                                         np.cos(2 * np.pi * day.dayofyear / 365.25)])
    cols = [f"y_T-{k}" for k in range(W)] + ["dow", "carnival", "doy_sin", "doy_cos"]
    return pd.DataFrame(rows, columns=cols)
def fit(h):                                              # a model that looks exactly h days ahead
    origins = pd.date_range("2014-01-14", pd.Timestamp("2017-12-31") - h * DAY)
    target = y.reindex(origins + h * DAY).values
    keep = ~np.isnan(target)
    return lgbm().fit(window_rows(y, origins[keep], h), target[keep])

direct = {h: fit(h) for h in range(1, 8)}               # DIRECT: 7 models, one per step ahead
one_step = direct[1]                                     # RECURSIVE: reuse the 1-step model 7 times
sundays = pd.date_range("2017-12-31", "2018-12-23", freq="W-SUN")   # 52 forecast origins
err = {"seasonal naive": [], "recursive": [], "direct": []}
for T in sundays:
    actual = y[T + DAY:T + 7 * DAY].values
    err["seasonal naive"].append(actual - y[T - 6 * DAY:T].values)
    err["direct"].append(actual - [direct[h].predict(window_rows(y, [T], h))[0] for h in range(1, 8)])
    s = y[:T].copy()                                     # known history only
    for h in range(1, 8):
        s.loc[T + h * DAY] = one_step.predict(window_rows(s, [s.index[-1]], 1))[0]   # forecast becomes "history"
    err["recursive"].append(actual - s[T + DAY:].values)
print("MAE by days ahead:  h=1   h=2   h=3   h=4   h=5   h=6   h=7  | all")
for name, e in err.items():
    e = np.abs(np.array(e))
    print(f"{name:16s}", " ".join(f"{v:5.2f}" for v in e.mean(0)), f"| {e.mean():.2f}")</div>
  <div class="fx" data-lang="text">MAE by days ahead:  h=1   h=2   h=3   h=4   h=5   h=6   h=7  | all
seasonal naive    3.08  2.56  2.98  2.90  2.63  2.52  2.71 | 2.77
recursive         2.48  1.88  2.30  1.95  2.19  2.80  2.17 | 2.25
direct            2.48  1.87  2.32  1.94  2.31  3.08  2.26 | 2.32</div>
  <p><code>window_rows</code> builds one row per origin: the 14 latest values, newest first, plus calendar facts about day T + h. <code>fit(h)</code> trains on every day of 2014 to 2017 as an origin, with the value h days later as the target. For the recursive forecast, <code>s</code> starts as the known history and each prediction is appended to it, so the next row's newest value is our own forecast; that is the honest way to evaluate a recursive model, rather than feeding it the real values it would not have had (which is exactly the <code>lag1</code> leak of section 05). At h = 1 the two strategies are the same model (2.48), and both use Sunday's value, which "lags ≥ 7" cannot. Over the whole week recursive (2.25) slightly beats direct (2.32). This series has little short-term autocorrelation (it is mostly weekly pattern plus noise), so errors do not snowball much, and the single model is trained on more relevant one-step examples. Saturday (h = 6) is the hardest night for both, and the only one where both lose to seasonal naive.</p>
  <table class="tbl">
    <tr><th></th><th>Recursive</th><th>Direct</th><th>Lags ≥ H</th></tr>
    <tr><td>Models</td><td>1</td><td>H</td><td>1</td></tr>
    <tr><td>Uses the freshest values</td><td>Yes</td><td>Yes</td><td>No</td></tr>
    <tr><td>Error propagation</td><td>Yes: forecasts fed back</td><td>No</td><td>No</td></tr>
    <tr><td>Features of future steps</td><td>Rebuilt from forecasts</td><td>Simple</td><td>Simple</td></tr>
    <tr><td>Consistency across h</td><td>Smooth path</td><td>Each h separate; can zig-zag</td><td>Smooth</td></tr>
    <tr><td>Cost</td><td>Cheap to train, sequential to predict</td><td>H × training</td><td>Cheapest</td></tr>
  </table>

  <h2 id="tm-global"><span class="num">08</span>Global Models</h2>
  <p>Every model so far learned from Pine View alone. Mrs Thakur now runs five homestays (Manali, Shimla, Mussoorie, Nainital and Ooty), and Ooty opened only in July 2017: 164 usable training days, no full year, no summer, no festival season. The other four have seen those many times. Can the homestays learn from each other?</p>
  <p>A <strong>local</strong> model is fitted separately for each series; ARIMA, ETS and Prophet are always local. A <strong>global</strong> model is one model fitted on the stacked rows of all series. Weekend peaks, summer rushes and monsoon dips look alike across hill-station homestays, so a global model learns them from five times the data, and a short series borrows the shapes learned from long ones. Think of a new branch manager at a restaurant chain: the local approach waits two years to learn the branch's own festival rush; the global approach reads the chain's records from every branch on day one and then adjusts for this branch's size, so the new manager is useful immediately.</p>
  <p>The homes differ in size (Shimla averages 33 guests, Mussoorie 14). If the target is raw guests, the model mostly learns "which home is it" and the big homes dominate the loss. So we divide each home's target and lag features by its own <strong>level</strong>, the last known 4-week average (itself at least 7 days old), and the shapes line up. On Saturday 10 March 2018 Manali had 34 guests on a level of 28.18, a ratio of 34/28.18 = 1.21; Mussoorie had 17 on a level of 12.68, a ratio of 1.34. In guests the two Saturdays differ by 17; in level units both are "a Saturday about 1.2 to 1.3 times the usual level". The model learns that once, from all homes, and each prediction is turned back into guests by multiplying by the level. The home's name is also a categorical feature, so the model can still learn home-specific quirks (only Manali has the carnival).</p>
  <div class="fx" data-lang="py">print(chain.groupby("home").guests.agg(["count", "mean"]).round(1).T.to_string())
def home_table(g):
    """Features for one homestay, all at least 7 days old, divided by the home's recent level."""
    y = g.set_index("date").guests.asfreq("D")
    level = y.shift(7).rolling(28, min_periods=14).mean()          # last known 4-week average
    X = pd.DataFrame({"lag7": y.shift(7), "lag14": y.shift(14), "lag364": y.shift(364),
                      "roll7": y.shift(7).rolling(7, min_periods=5).mean()}).div(level, axis=0)
    X["dow"] = y.index.dayofweek
    X["doy_sin"] = np.sin(2 * np.pi * y.index.dayofyear / 365.25)
    X["doy_cos"] = np.cos(2 * np.pi * y.index.dayofyear / 365.25)
    X["carnival"] = (y.index.isin(CARNIVAL_DAYS) &amp; (g.home.iloc[0] == "Manali")).astype(int)
    X["level"], X["y"], X["home"] = level, y, g.home.iloc[0]
    return X.dropna(subset=["y", "level"])

data = pd.concat([home_table(g) for _, g in chain.groupby("home")])   # lags built per home
data["home"] = data["home"].astype("category")
feats = ["lag7", "lag14", "lag364", "roll7", "dow", "doy_sin", "doy_cos", "carnival"]
train, test = data[data.index.year &lt;= 2017], data[data.index.year == 2018]
glob = lgbm().fit(train[feats + ["home"]], train.y / train.level)    # ONE model, all homes
test = test.assign(global_=glob.predict(test[feats + ["home"]]) * test.level)
test["local"] = np.nan
for home, tr in train.groupby("home", observed=True):                 # one model PER home
    rows = test.home == home
    test.loc[rows, "local"] = lgbm().fit(tr[feats], tr.y / tr.level).predict(
        test.loc[rows, feats]) * test.loc[rows, "level"]
test["snaive"] = test.lag7 * test.level                               # undo the scaling
print(f"{'home':10s} train rows  seasonal naive   local   global")
for home, te in test.groupby("home", observed=True):
    n = (train.home == home).sum()
    mae = lambda c: np.mean(np.abs(te.y - te[c]))
    print(f"{home:10s} {n:10d} {mae('snaive'):15.2f} {mae('local'):7.2f} {mae('global_'):8.2f}")</div>
  <div class="fx" data-lang="text">home   Manali  Mussoorie  Nainital   Ooty  Shimla
count  1806.0     1826.0    1826.0  549.0  1826.0
mean     22.4       14.0      22.2   18.9    33.0
home       train rows  seasonal naive   local   global
Manali           1402            2.77    2.12     2.13
Mussoorie        1441            1.11    0.84     0.82
Nainital         1441            1.70    1.40     1.36
Ooty              164            0.98    1.18     0.96
Shimla           1441            2.77    2.20     2.13</div>
  <p>The chain is stored in <strong>long format</strong>: one row per (home, date). <code>home_table</code> builds the features per home, so no lag ever crosses from one home into another, and <code>div(level, axis=0)</code> scales them. The global model is fitted once on all training rows with <code>home</code> as a pandas category (LightGBM splits on categories directly); the local models are fitted per home on the same features. The global model is as good as or better than the local ones on every home (Manali 2.13 against 2.12 is a tie). The big win is Ooty: with only 164 training rows, the local model (1.18) is worse than seasonal naive (0.98), while the global model (0.96) recovers by borrowing the seasonal shape from the other four homes. Every learned model beats seasonal naive on the four established homes. This is how large forecasting competitions have been won: one global LightGBM per store or department, on lag, rolling, price and calendar features.</p>
  <table class="tbl">
    <tr><th></th><th>Local (one per series)</th><th>Global (one for all)</th></tr>
    <tr><td>Data per model</td><td>one series' history</td><td>all series' histories</td></tr>
    <tr><td>Short or new series</td><td>weak (Ooty 1.18)</td><td>borrows patterns (0.96)</td></tr>
    <tr><td>Series-specific quirks</td><td>learned directly</td><td>needs an id feature or segmentation</td></tr>
    <tr><td>Models to maintain</td><td>N</td><td>1 (or one per group)</td></tr>
    <tr><td>Scaling</td><td>not needed</td><td>essential: divide by level or use logs</td></tr>
  </table>

  <h2 id="tm-quant"><span class="num">09</span>Quantile Forecasts and Pinball Loss</h2>
  <p>Every forecast so far is one number per night. But staffing is decided by the busy nights: running short of beds and cooks costs much more than one idle cook. A model trained on absolute error aims at the median; one trained on squared error aims at the mean. If being short costs nine times more than being over-prepared, neither is the number to plan with. We want a <strong>quantile forecast</strong>: for example a P90, a number the actual should exceed only 1 night in 10.</p>
  <p>The loss that rewards this is the <strong>pinball loss</strong> (or quantile loss). For a chosen quantile q between 0 and 1, an error e = actual − forecast costs q·e if the forecast was too low (e ≥ 0), and (1 − q)·(−e) if it was too high. With q = 0.9, being 1 guest short costs 0.9 and being 1 guest over costs 0.1, so the forecast that minimises the average loss is pushed up until only about 10% of actuals lie above it: it is the 0.9 quantile. At q = 0.5 both sides cost 0.5, so the pinball loss is just MAE / 2. Think of packing for a trek: if being cold is far worse than carrying an extra jacket, you pack for a colder night than the average one.</p>
  <p>By hand for our week: seasonal naive's errors are 6, 4, 3, 0, 0, 0, 4, all on the short side, so its q = 0.9 pinball is 0.9 × 17/7 = 2.19. Seasonal naive plus 5 has errors 1, −1, −2, −5, −5, −5, −1; its pinball is (0.9 × 1 + 0.1 × 19)/7 = 2.8/7 = 0.40. The +5 forecast is worse by MAE (2.86 against 2.43) but far better by q = 0.9 pinball, because it is rarely short, which is what a P90 should be.</p>
  <div class="fx" data-lang="py">def pinball(y, f, q):
    e = y - f                                            # positive = forecast too low
    return np.mean(np.maximum(q * e, (q - 1) * e))       # too low costs q per guest, too high 1 - q
actual = np.array([29, 28, 27, 25, 31, 34, 29])
snaive = np.array([23, 24, 24, 25, 31, 34, 25])
for name, f in [("seasonal naive", snaive), ("seasonal naive + 5", snaive + 5)]:
    print(f"{name:19s} MAE {np.mean(np.abs(actual - f)):.2f}  pinball q=0.5 {pinball(actual, f, 0.5):.2f}"
          f"  q=0.9 {pinball(actual, f, 0.9):.2f}")
tbl = make_table(daily)
tbl["doy_sin"] = np.sin(2 * np.pi * tbl.index.dayofyear / 365.25)
tbl["doy_cos"] = np.cos(2 * np.pi * tbl.index.dayofyear / 365.25)
features = ["lag7", "lag14", "roll7", "dow", "month", "carnival", "doy_sin", "doy_cos"]
train, test = tbl.loc[:"2017"].dropna(subset=["y"]), tbl.loc["2018"]
preds = {}
for q in [0.1, 0.5, 0.9]:
    m = lgb.LGBMRegressor(objective="quantile", alpha=q, n_estimators=300, learning_rate=0.05,
                          num_leaves=15, min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)
    m.fit(train[features], train.y - train.roll7)        # trend-free target, as in section 04
    preds[q] = m.predict(test[features]) + test.roll7.values
    below = np.mean(test.y.values &lt;= preds[q])
    print(f"P{int(q * 100):&lt;3d} share of 2018 days at or below it: {below:.2f}   pinball {pinball(test.y.values, preds[q], q):.3f}")
inside = np.mean((test.y.values &gt;= preds[0.1]) &amp; (test.y.values &lt;= preds[0.9]))
print(f"P10-P90 band holds {inside:.0%} of days; average width {np.mean(preds[0.9] - preds[0.1]):.1f} guests")
print("Sat 10 March 2018: P10 %.1f  P50 %.1f  P90 %.1f  actual %d" % (
    preds[0.1][68], preds[0.5][68], preds[0.9][68], test.y.iloc[68]))
crossed = np.mean((preds[0.5] &lt; preds[0.1]) | (preds[0.9] &lt; preds[0.5]))
print(f"days where the quantiles cross: {crossed:.0%}")</div>
  <div class="fx" data-lang="text">seasonal naive      MAE 2.43  pinball q=0.5 1.21  q=0.9 2.19
seasonal naive + 5  MAE 2.86  pinball q=0.5 1.43  q=0.9 0.40
P10  share of 2018 days at or below it: 0.13   pinball 0.458
P50  share of 2018 days at or below it: 0.41   pinball 1.164
P90  share of 2018 days at or below it: 0.82   pinball 0.498
P10-P90 band holds 69% of days; average width 5.7 guests
Sat 10 March 2018: P10 30.3  P50 30.9  P90 33.7  actual 34
days where the quantiles cross: 7%</div>
  <p><code>np.maximum(q*e, (q-1)*e)</code> picks the right branch: for e &gt; 0 it is q·e, and for e &lt; 0 it is (q − 1)·e, which is positive. LightGBM trains on exactly this loss with <code>objective="quantile", alpha=q</code>, one model per quantile, here on the trend-free target of section 04. Now check <strong>calibration</strong>: a P90 should be at or above the actual on 90% of days. On 2018 the shares are P10 13%, P50 41% and P90 82%; all three are a bit low, for the same reason as in section 03 (2018 is busier than anything seen, so every quantile lags a little). The P10–P90 band should hold 80% of days and holds 69%, with an average width of 5.7 guests. For Saturday 10 March the band is 30.3 to 33.7 and the actual, 34, sits just above it. For planning, Mrs Thakur should widen the band or recalibrate it on a back-test (for example, shift each quantile by the amount it missed in past folds).</p>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<polygon points="69,128.4 87.1,96 105.2,94 123.2,110.4 141.3,134.6 159.4,137.9 177.4,138.8 195.5,141.1 213.5,115.4 231.6,101.3 249.7,123.9 267.7,137.9 285.8,133.4 303.9,132.7 321.9,133.6 340,102.2 358.1,95.7 376.1,107.7 394.2,135.4 412.3,133.6 430.3,124.4 448.4,131.7 466.5,96.1 484.5,85.6 502.6,109.3 520.6,125.3 538.7,128 556.8,134.8 574.8,126.7 592.9,92.9 611,84.6 611,110.3 592.9,115.4 574.8,153.4 556.8,156.8 538.7,153.4 520.6,156.1 502.6,134.9 484.5,113.1 466.5,122 448.4,161.6 430.3,155.7 412.3,160.5 394.2,160.4 376.1,129.9 358.1,112.4 340,121.2 321.9,161.9 303.9,166 285.8,173 267.7,173.1 249.7,147.8 231.6,123.3 213.5,132.1 195.5,174.5 177.4,172.8 159.4,168.5 141.3,165.1 123.2,132.9 105.2,115 87.1,121.5 69,163" class="fb" opacity="0.8"/>
<line x1="60" y1="220" x2="620" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="69" y="234" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="69" y1="220" x2="69" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="141.3" y="234" text-anchor="middle" class="tm" font-size="10.5">5</text>
<line x1="141.3" y1="220" x2="141.3" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="231.6" y="234" text-anchor="middle" class="tm" font-size="10.5">10</text>
<line x1="231.6" y1="220" x2="231.6" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="321.9" y="234" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="321.9" y1="220" x2="321.9" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="412.3" y="234" text-anchor="middle" class="tm" font-size="10.5">20</text>
<line x1="412.3" y1="220" x2="412.3" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="502.6" y="234" text-anchor="middle" class="tm" font-size="10.5">25</text>
<line x1="502.6" y1="220" x2="502.6" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="611" y="234" text-anchor="middle" class="tm" font-size="10.5">31</text>
<line x1="611" y1="220" x2="611" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="55" y="223.5" text-anchor="end" class="tm" font-size="10.5">15</text>
<line x1="57" y1="220" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="55" y="160.2" text-anchor="end" class="tm" font-size="10.5">25</text>
<line x1="57" y1="156.7" x2="60" y2="156.7" stroke="currentColor" opacity="0.5"/>
<text x="55" y="96.8" text-anchor="end" class="tm" font-size="10.5">35</text>
<line x1="57" y1="93.3" x2="60" y2="93.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="33.5" text-anchor="end" class="tm" font-size="10.5">45</text>
<line x1="57" y1="30" x2="60" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="69,165.9 87.1,137 105.2,110.1 123.2,143 141.3,166.9 159.4,168.3 177.4,166.9 195.5,169.4 213.5,135.7 231.6,119.6 249.7,149.3 267.7,164.4 285.8,169.2 303.9,165.3 321.9,163.2 340,122.3 358.1,109.8 376.1,138.1 394.2,165.6 412.3,163.7 430.3,157.1 448.4,156.9 466.5,108.9 484.5,95 502.6,124.3 520.6,146.6 538.7,147.6 556.8,149.1 574.8,143.1 592.9,105.8 611,95.8" fill="none" class="sb" stroke-width="2"/>
<polyline points="69,156.7 87.1,118.7 105.2,99.7 123.2,156.7 141.3,131.3 159.4,137.7 177.4,144 195.5,156.7 213.5,118.7 231.6,99.7 249.7,131.3 267.7,175.7 285.8,144 303.9,118.7 321.9,175.7 340,106 358.1,99.7 376.1,137.7 394.2,131.3 412.3,163 430.3,150.3 448.4,131.3 466.5,112.3 484.5,106 502.6,125 520.6,150.3 538.7,125 556.8,156.7 574.8,131.3 592.9,118.7 611,80.7" fill="none" stroke="currentColor" stroke-width="1.2"/>
<circle cx="69" cy="156.7" r="3" class="fs"/>
<circle cx="87.1" cy="118.7" r="3" class="fs"/>
<circle cx="105.2" cy="99.7" r="3" class="fs"/>
<circle cx="123.2" cy="156.7" r="3" class="fs"/>
<circle cx="141.3" cy="131.3" r="3" class="fs"/>
<circle cx="159.4" cy="137.7" r="3" class="fs"/>
<circle cx="177.4" cy="144" r="3" class="fs"/>
<circle cx="195.5" cy="156.7" r="3" class="fs"/>
<circle cx="213.5" cy="118.7" r="3" class="fs"/>
<circle cx="231.6" cy="99.7" r="3" class="fs"/>
<circle cx="249.7" cy="131.3" r="3" class="fs"/>
<circle cx="267.7" cy="175.7" r="3" class="fs"/>
<circle cx="285.8" cy="144" r="3" class="fs"/>
<circle cx="303.9" cy="118.7" r="3" class="fs"/>
<circle cx="321.9" cy="175.7" r="3" class="fs"/>
<circle cx="340" cy="106" r="3" class="fs"/>
<circle cx="358.1" cy="99.7" r="3" class="fs"/>
<circle cx="376.1" cy="137.7" r="3" class="fs"/>
<circle cx="394.2" cy="131.3" r="3" class="fs"/>
<circle cx="412.3" cy="163" r="3" class="fs"/>
<circle cx="430.3" cy="150.3" r="3" class="fs"/>
<circle cx="448.4" cy="131.3" r="3" class="fs"/>
<circle cx="466.5" cy="112.3" r="3" class="fs"/>
<circle cx="484.5" cy="106" r="3" class="fs"/>
<circle cx="502.6" cy="125" r="3" class="fs"/>
<circle cx="520.6" cy="150.3" r="3" class="fs"/>
<circle cx="538.7" cy="125" r="3" class="fs"/>
<circle cx="556.8" cy="156.7" r="3" class="fs"/>
<circle cx="574.8" cy="131.3" r="3" class="fs"/>
<circle cx="592.9" cy="118.7" r="3" class="fs"/>
<circle cx="611" cy="80.7" r="3" class="fs"/>
<text x="340" y="250" text-anchor="middle" class="tm" font-size="11">March 2018</text>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">guests</text>
<text x="70" y="20" font-size="11">actual</text><text x="130" y="20" font-size="11" class="tb">P50 line, P10–P90 band (shaded)</text>
</svg><figcaption>March 2018: the P50 line and the P10–P90 band from three LightGBM quantile models. Most nights fall inside the band. On some days the P50 line dips below the band's lower edge: separately trained quantile models can cross.</figcaption></figure>
  <p>On 7% of days the quantiles cross (a P50 below the P10, or a P90 below the P50), because each quantile model is trained separately. The usual fix is to sort the predicted quantiles for each day, or to use a method that predicts all quantiles jointly. Other ways to get intervals are residual quantiles from a back-test (empirical intervals), conformal prediction, or a model with a probability distribution such as ETS, ARIMA or Prophet. Finally, choose q from costs rather than habit: if being short costs c<sub>u</sub> per guest and over-preparing costs c<sub>o</sub>, the best quantile is q = c<sub>u</sub>/(c<sub>u</sub> + c<sub>o</sub>). Short costs ₹900 and over costs ₹100: q = 900/1000 = 0.9.</p>

  <h2 id="tm-vs"><span class="num">10</span>ML vs ARIMA, ETS and Prophet</h2>
  <p>Each note claimed its models were good. On the same 52 Sunday-night forecasts of 2018, with the same information, how do they compare, and what explains the order? Every model is trained on 2014 to 2017 and then forecasts Monday to Sunday from each Sunday of 2018, using only data up to that Sunday. SARIMAX is ARIMA(0,1,1)(0,1,1)<sub>7</sub> (the airline structure with a weekly season, see <a class="xref" data-note="ml_arima">ARIMA Family</a>) with two pairs of yearly Fourier waves and the carnival flag as exogenous regressors; its parameters are estimated once, and <code>apply</code> runs the same model through 2018 so each Sunday's forecast uses the latest data. Holt-Winters has a damped trend and a weekly season, with parameters estimated once and its states updated every Sunday (gaps interpolated). The Prophet-style model is the regression built in the previous note (piecewise-linear trend with L1-penalised changepoints, Fourier seasons, carnival days), fitted once; Prophet itself is not installed in the environment that built these notes, and this regression reproduces its mechanism. LightGBM is the section 04 model.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
y = daily.asfreq("D")
DAY = pd.Timedelta(days=1)
sundays = pd.date_range("2017-12-31", "2018-12-23", freq="W-SUN")
doy = y.index.dayofyear
calendar = pd.DataFrame({"s1": np.sin(2 * np.pi * doy / 365.25), "c1": np.cos(2 * np.pi * doy / 365.25),
                         "s2": np.sin(4 * np.pi * doy / 365.25), "c2": np.cos(4 * np.pi * doy / 365.25),
                         "carnival": y.index.isin(CARNIVAL_DAYS).astype(float)}, index=y.index)
fc = {"seasonal naive": [y[T - 6 * DAY:T].values for T in sundays]}

# SARIMA(0,1,1)(0,1,1)_7 + two yearly wave pairs + carnival flag as regressors
sar = SARIMAX(y[:"2017"], exog=calendar[:"2017"], order=(0, 1, 1), seasonal_order=(0, 1, 1, 7)).fit(disp=False)
full = sar.apply(y, exog=calendar)         # same parameters, run the filter through 2018
fc["SARIMAX"] = [full.get_prediction(start=T + DAY, end=T + 7 * DAY, dynamic=True).predicted_mean.values
                 for T in sundays]

# Holt-Winters, damped trend, weekly season: parameters estimated once, states updated every Sunday
yi = y.interpolate()
hw = ExponentialSmoothing(yi[:"2017"], trend="add", damped_trend=True, seasonal="add", seasonal_periods=7).fit()
fc["Holt-Winters (m=7)"] = [ExponentialSmoothing(yi[:T], trend="add", damped_trend=True, seasonal="add",
                            seasonal_periods=7).fit(**{k: hw.params[k] for k in
                            ["smoothing_level", "smoothing_trend", "smoothing_seasonal", "damping_trend"]},
                            optimized=False).forecast(7).values for T in sundays]

# Prophet-style regression from the previous note (trend + changepoints + Fourier + carnival), fitted once
p = mini_prophet()(y["2018"].index)
fc["Prophet-style"] = [p[T + DAY:T + 7 * DAY].values for T in sundays]

# LightGBM: lags &gt;= 7, season, trend-free target (section 04)
tbl = rich_table()
feats = ["lag7", "lag14", "roll7", "dow", "month", "carnival", "doy_sin", "doy_cos", "lag364", "roll28"]
tr = tbl.loc[:"2017"].dropna(subset=["y"])
g = lgbm().fit(tr[feats], tr.y - tr.roll7)
lg = pd.Series(g.predict(tbl[feats]) + tbl.roll7.values, index=tbl.index)
fc["LightGBM"] = [lg[T + DAY:T + 7 * DAY].values for T in sundays]

actual = np.array([y[T + DAY:T + 7 * DAY].values for T in sundays])
scale = np.nanmean(np.abs(y[:"2017"].values[7:] - y[:"2017"].values[:-7]))
carn = np.array([(T + DAY) &lt;= pd.Timestamp("2018-01-19") &lt;= (T + 7 * DAY) for T in sundays])
print(f"{'model':20s}  MAE   RMSE  MASE  carnival-week MAE")
for name in ["seasonal naive", "Holt-Winters (m=7)", "SARIMAX", "Prophet-style", "LightGBM"]:
    e = actual - np.array(fc[name])
    print(f"{name:20s} {np.abs(e).mean():5.2f} {np.sqrt((e ** 2).mean()):5.2f} "
          f"{np.abs(e).mean() / scale:5.2f} {np.abs(e[carn]).mean():8.2f}")
print("SARIMAX params:", sar.params[["ma.L1", "ma.S.L7", "carnival"]].round(2).to_dict())</div>
  <div class="fx" data-lang="text">model                 MAE   RMSE  MASE  carnival-week MAE
seasonal naive        2.77  3.71  1.12     9.29
Holt-Winters (m=7)    2.33  3.07  0.94     8.93
SARIMAX               1.89  2.32  0.76     1.44
Prophet-style         1.70  2.10  0.69     1.01
LightGBM              2.15  2.73  0.87     5.33
SARIMAX params: {'ma.L1': -0.81, 'ma.S.L7': -1.0, 'carnival': 10.85}</div>
  <p>The last column is the MAE over the week containing the 2018 carnival, and MASE divides each MAE by seasonal naive's in-sample error (2.48), so 0.69 means the Prophet-style model removed 31% of it. The Prophet-style model wins (1.70), then SARIMAX (1.89). This series was simulated as a smooth trend plus smooth seasons, a weekly pattern, a holiday and independent noise: exactly the structure those models assume. On one series dominated by such structure, classical models are hard to beat. LightGBM (2.15) beats seasonal naive comfortably and edges out Holt-Winters (2.33), but not the structural models.</p>
  <p>The carnival week shows why. The Prophet-style model (1.01) and SARIMAX (1.44) treat the carnival as one additive coefficient learned from two past carnivals. LightGBM (5.33) must learn it from tree splits on 10 carnival rows out of 1,441, with <code>min_child_samples=20</code>, so it cannot isolate them: trees need many examples of an event; a linear term needs few. Seasonal naive (9.29) and Holt-Winters (8.93) have no way to know about the carnival at all, and in the week after it, seasonal naive repeats the spike a week late, because lag7 of those days contains carnival days. Fixes on the ML side include a "days since the event" feature or setting lags to NaN on event days, a linear component (LightGBM's <code>linear_tree=True</code>), or residual modelling: fit the structural model, then fit LightGBM on its residuals.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Usually best</th><th>Why</th></tr>
    <tr><td>One or a few series, strong regular structure, little data</td><td>ETS, SARIMA(X), Prophet</td><td>few parameters, structure built in, intervals</td></tr>
    <tr><td>Rare but known events (a few per series)</td><td>Classical with regressors, or a hybrid</td><td>one coefficient per event needs few examples</td></tr>
    <tr><td>Hundreds or thousands of related series</td><td>Global ML</td><td>shares patterns; one model to maintain</td></tr>
    <tr><td>Many drivers with nonlinear effects (price × promotion × weather)</td><td>ML</td><td>trees learn interactions automatically</td></tr>
    <tr><td>Short or new series inside a big catalogue</td><td>Global ML</td><td>borrows from neighbours (Ooty)</td></tr>
    <tr><td>Long-horizon extrapolation of a trend</td><td>Classical, or ML on a detrended target</td><td>trees cannot extrapolate</td></tr>
  </table>
  <p>In practice teams often combine: the average of an ETS or ARIMA forecast and an ML forecast is frequently better than either, and an ML model can take classical forecasts as features. Never declare "ML beats statistics" (or the opposite) from one dataset; the ranking flips with the number of series, the history length, the drivers and the events. Back-test every family against seasonal naive on your own data. The same tables also feed sequence models (<a class="xref" data-note="dl_rnns">RNNs &amp; LSTMs</a>) and the production concerns of feature stores, retraining and monitoring covered in <a class="xref" data-note="sd_framework">ML System Design</a>.</p>

  <h2 id="tm-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Two mistakes come from the shape of the data rather than the model. The first is shifting a series whose index has gaps: <code>shift()</code> counts rows, not days, so after the lost June 2015 pages "last week" was really 27 days earlier (section 04). Always <code>asfreq("D")</code> before shifting. The second is building lags on stacked data without grouping: on a long table of five homes, <code>df.guests.shift(7)</code> takes the first rows of Mussoorie's lag from the last rows of Manali. Sort by date within each series and use <code>df.groupby("home").guests.shift(7)</code>, or build features per series as section 08 did. A global model without scaling is the related mistake: the big series dominate the loss, so divide by the level or use logs.</p>
  <p>Most other mistakes were measured in this note. Comparing only against naive, when seasonal naive is the honest bar. Using MAPE on series with small values. Random splits or plain KFold (a fake 2.08 against an honest 2.57). Rolling features without a shift (2.08), lags shorter than the horizon (2.35), and group statistics over future days (2.29). Back-testing a recursive model with real lag values instead of its own fed-back forecasts. Training trees on a trending target, which caps them at the training maximum. Trusting quantile forecasts without checking coverage (the P10–P90 band held 69%, not 80%) and crossing. And expecting trees to learn a rare event from two occurrences (5.33 against 1.01 on carnival week).</p>
  <p>The last mistake appears only after deployment: <strong>train/serve skew</strong>. Features are computed one way in the notebook, from clean final data, and another way in production, from whatever the database holds at 11 pm on Sunday, with late bookings missing. Build features with the same code in both places, from point-in-time data, and monitor the live error against the back-test error.</p>

  <h2 id="tm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The hand-worked week (origin Sunday 4 March 2018)</h3>
  <table class="tbl">
    <tr><th></th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr>
    <tr><td>19–25 Feb</td><td>27</td><td>29</td><td>26</td><td>27</td><td>33</td><td>31</td><td>29</td></tr>
    <tr><td>26 Feb – 4 Mar (= seasonal naive)</td><td>23</td><td>24</td><td>24</td><td>25</td><td>31</td><td>34</td><td>25</td></tr>
    <tr><td>5–11 Mar actual</td><td>29</td><td>28</td><td>27</td><td>25</td><td>31</td><td>34</td><td>29</td></tr>
  </table>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Forecast origin T</b>: the last time whose value is known; <b>horizon h</b>: steps after T.</li>
    <li><b>Lag feature</b>: y<sub>t−k</sub>, legal only if k ≥ h. <b>Rolling feature</b>: a statistic of a shifted window.</li>
    <li><b>Known-future variable</b>: a driver whose future values are known at T (planned events, set prices).</li>
    <li><b>Temporal leakage</b>: any use of information not available at T, via features, preprocessing, splits or revised data.</li>
    <li><b>Time-series CV</b>: folds with training strictly before testing (expanding or sliding windows, optional gap).</li>
    <li><b>Recursive</b>: one 1-step model iterated on its own forecasts. <b>Direct</b>: one model per horizon.</li>
    <li><b>Global model</b>: one model on the pooled rows of many series. <b>Local</b>: one per series.</li>
    <li><b>Pinball loss</b>: the loss minimised by the q-quantile; <b>coverage</b>: share of actuals at or below a quantile.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Formula</th><th>By hand</th></tr>
    <tr><td>Seasonal naive</td><td>ŷ<sub>T+h</sub> = y<sub>T+h−m</sub></td><td>Mon 5 Mar = 23</td></tr>
    <tr><td>MAE / RMSE</td><td>mean|e| / √mean e²</td><td>17/7 = 2.43 / √11 = 3.32</td></tr>
    <tr><td>MAPE / WAPE</td><td>mean(|e|/y) / Σ|e|/Σy</td><td>8.55% / 17/203 = 8.37%</td></tr>
    <tr><td>MASE</td><td>MAE / mean<sub>train</sub>|y<sub>t</sub> − y<sub>t−m</sub>|</td><td>2.43/2.48 = 0.98</td></tr>
    <tr><td>Rolling feature</td><td>mean(y<sub>t−h</sub> … y<sub>t−h−w+1</sub>)</td><td>roll7(5 Mar) = 198/7 = 28.29</td></tr>
    <tr><td>Cyclic encoding</td><td>sin, cos(2πd/365.25)</td><td>31 Dec (−0.004, 1.000), 1 Jan (0.017, 1.000)</td></tr>
    <tr><td>Trend-free target</td><td>z = y − roll7; ŷ = ẑ + roll7</td><td>2.57 → 2.45 (base), 2.16 (rich)</td></tr>
    <tr><td>Global scaling</td><td>y / level, level = mean(y<sub>t−7</sub> … y<sub>t−34</sub>)</td><td>34/28.18 = 1.21; 17/12.68 = 1.34</td></tr>
    <tr><td>Pinball</td><td>max(q·e, (q − 1)·e)</td><td>q 0.9: snaive 2.19, snaive + 5 0.40</td></tr>
    <tr><td>Best quantile</td><td>q = c<sub>u</sub>/(c<sub>u</sub> + c<sub>o</sub>)</td><td>900/(900 + 100) = 0.9</td></tr>
  </table>
  <h3>Pine View results</h3>
  <table class="tbl">
    <tr><th>Experiment</th><th>Result (MAE, guests)</th></tr>
    <tr><td>2018, lags ≥ 7</td><td>snaive 2.77 · LightGBM 2.57 · + features and y − roll7 2.16</td></tr>
    <tr><td>Leaks (fake)</td><td>unshifted roll 2.08 · lag1 2.35 · month mean 2.29 · random split 2.08</td></tr>
    <tr><td>Time-series CV, 6 folds</td><td>snaive 2.56 ± 0.30 · LightGBM 2.32 ± 0.29</td></tr>
    <tr><td>52 Sundays</td><td>recursive 2.25 · direct 2.32 · snaive 2.77</td></tr>
    <tr><td>Global vs local</td><td>Ooty 0.96 vs 1.18 (snaive 0.98)</td></tr>
    <tr><td>Quantiles</td><td>P90 covers 82%; P10–P90 band 69%</td></tr>
    <tr><td>Fair back-test</td><td>Prophet-style 1.70 · SARIMAX 1.89 · LightGBM 2.15 · HW 2.33 · snaive 2.77</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">y = series.asfreq("D")                                  # calendar first
X["lag7"] = y.shift(7)                                  # lag >= horizon
X["roll7"] = y.shift(7).rolling(7, min_periods=5).mean()   # shift, then roll
X["doy_sin"] = np.sin(2 * np.pi * X.index.dayofyear / 365.25)
df["lag7"] = df.groupby("home").guests.shift(7)         # many series: group first
TimeSeriesSplit(n_splits=6, test_size=56, gap=0, max_train_size=None)
lgb.LGBMRegressor(objective="quantile", alpha=0.9)      # a P90 model</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Ask of every feature: "would I have this number at the origin?"</li>
    <li>Split by time; pass a time-ordered splitter everywhere; never shuffle.</li>
    <li><code>asfreq</code> before <code>shift</code>; group by series before <code>shift</code>.</li>
    <li>Trees cannot extrapolate: transform the target. Trees need many examples of an event.</li>
    <li>Evaluate recursive models with their own fed-back forecasts; check quantile coverage.</li>
  </ul>

  <h2 id="tm-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you turn a time series into a supervised learning problem?</summary><div class="qa-body">Make one row per time step (per series); the target is the value at that step; the features are only information available at the forecast origin: lags y<sub>t−k</sub> with k at least the horizon, shifted rolling statistics, calendar features, known-future drivers such as planned events and prices, and series attributes. Then fit any regressor, split by time and back-test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Build the lag7 and roll7 features for Monday 5 March, given the last two weeks 27 29 26 27 33 31 29 / 23 24 24 25 31 34 25.</summary><div class="qa-body">lag7 is last Monday, 23. roll7 is the mean of y<sub>t−7</sub> to y<sub>t−13</sub>, Tuesday 20 February to Monday 26 February: (29 + 26 + 27 + 33 + 31 + 29 + 23)/7 = 198/7 = 28.29. Both are at least 7 days old, so they are known on Sunday 4 March.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name four ways leakage enters a forecasting model, with the fix for each.</summary><div class="qa-body">Rolling features without a shift (shift by the horizon first). Lags shorter than the horizon (lags of at least h, or recursive/direct strategies). Statistics over periods that include the future, such as this month's mean or a scaler fitted on all data (compute on training or lagged data, inside a pipeline). Random or KFold splits (time-ordered splits). Also: actual values of drivers you will only have as forecasts, and revised data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use ordinary k-fold cross-validation for forecasting?</summary><div class="qa-body">It shuffles or rotates rows, so models train on the future to predict the past, and neighbouring days share information through lags, which inflates scores (a random split gave a fake 2.08 against an honest 2.57 on Pine View). Time-series cross-validation keeps training strictly before testing, with expanding or sliding windows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain expanding vs sliding windows and the gap parameter in TimeSeriesSplit.</summary><div class="qa-body">An expanding window trains each fold on everything before its cut-off, so training grows. A sliding window (max_train_size) keeps only the most recent L rows, for when old data is no longer representative. gap leaves rows unused between training and test, for data that arrives late or features that need a buffer. In all cases test rows come strictly after training rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recursive vs direct multi-step forecasting: what are the trade-offs?</summary><div class="qa-body">Recursive uses one one-step model and feeds its forecasts back as inputs: simple and coherent, but errors propagate and future features must be rebuilt from forecasts. Direct trains one model per step ahead using only values known at the origin: no propagation, but more models and possibly inconsistent paths. On Pine View's 52 Sundays recursive scored 2.25 and direct 2.32; they are identical at h = 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a tree-based model forecast beyond its training range, and how do you fix it?</summary><div class="qa-body">Each tree predicts averages of training rows in its leaves, so a sum of trees is bounded by what was seen; on a growing series the forecast flattens below the new level (Pine View 2018 reached 43 against a training maximum of 39). Model a trend-free target (y − rolling mean, y / level, differences or log ratios) and add the level back, or add a linear component (linear_tree) or a hybrid with a classical model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why encode day-of-year or hour-of-day with sine and cosine?</summary><div class="qa-body">Cyclic values wrap around: 31 December and 1 January, or 23:00 and 00:00, are neighbours but far apart as plain numbers. Mapping them to (sin, cos) of the angle puts them on a circle, so nearby times have nearby features. It matters most for linear models and neural networks, and gives trees smooth "position in the season" columns; it is the same idea as Fourier terms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a global model, why does it often beat local models, and what does it need?</summary><div class="qa-body">One model trained on the pooled rows of all series. It sees far more data, learns shared patterns (weekends, seasons, price effects) and lets short series borrow them: Ooty with 164 rows went from 1.18 (local) to 0.96 (global). It needs each series scaled (by its level or with logs), lags built per series, a series identifier or attributes, and all series split by the same date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define MASE and WAPE. Why prefer them over MAPE for a retail chain?</summary><div class="qa-body">MASE is the forecast MAE divided by the in-sample MAE of seasonal naive: scale-free, below 1 means better than the baseline, and safe with zeros. WAPE is Σ|e| / Σy: total error as a share of total volume, weighting big sellers more and robust to small values. MAPE divides each error by its own actual, so small or zero sales explode it, and it rewards under-forecasting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the q = 0.9 pinball loss for actuals 29, 28 and forecasts 30, 25. Which quantile should you forecast if a stock-out costs ₹400 and waste ₹100?</summary><div class="qa-body">Errors are −1 (over) and +3 (under): 0.1 × 1 = 0.1 and 0.9 × 3 = 2.7, mean 1.4. The best quantile is q = c<sub>u</sub>/(c<sub>u</sub> + c<sub>o</sub>) = 400/500 = 0.8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your P90 forecast is above the actual on only 82% of test days. What does that mean and what can you do?</summary><div class="qa-body">The P90 is too low, i.e. miscalibrated; on Pine View the test year was busier than anything in training. Options: recalibrate with back-test residuals (shift the quantile by the amount needed), use a trend-free target, use conformal prediction for guaranteed coverage, or retrain more often. Also sort the quantiles to remove crossing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On one clean series, a Prophet-style model (1.70) and SARIMAX (1.89) beat LightGBM (2.15). Why, and when would the order flip?</summary><div class="qa-body">The series' structure (smooth trend, smooth seasons, weekly pattern, a rare event, independent noise) matches the classical models' assumptions, and the carnival happened only twice in training, which a linear coefficient learns but trees cannot (carnival-week MAE 5.33 against 1.01). The order flips with many related series, rich nonlinear drivers, many examples of each event and long histories, the M5 setting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are lag features related to ARIMA, and an EWM feature to exponential smoothing?</summary><div class="qa-body">An AR(p) model is a linear regression of y<sub>t</sub> on its lags y<sub>t−1</sub> … y<sub>t−p</sub>; a lag-feature model is the same idea with a flexible learner and extra features. y.shift(h).ewm(alpha).mean() is the simple exponential smoothing level computed h steps back, so an ML model with EWM features contains SES as an input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is train/serve skew in forecasting and how do you prevent it?</summary><div class="qa-body">Features computed differently in training (from clean, final, revised data) and in production (from whatever is available at forecast time, with late records missing). The model then sees inputs at serving time that it never saw in training. Prevent it by building features with the same code in both places from point-in-time data, and by monitoring live error against back-test error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design: forecast daily demand for 5,000 products in 200 stores, 28 days ahead.</summary><div class="qa-body">Start with baselines (seasonal naive, moving averages) scored by WAPE and MASE. Build a long table (store, item, date) with per-series lags of at least 28 (or direct models for horizon buckets), shifted rolling means and standard deviations, calendar and event features, planned prices and promotions, item and store attributes, and a target scaled per series. Train global LightGBM (one per store or category if large), tuned with rolling-origin CV by date. Add quantile models or empirical intervals for safety stock, keep features point-in-time, monitor live error, retrain regularly, and keep an ETS fallback for new or very sparse series.</div></details>
</main>
`
});
