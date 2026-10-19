// notes/ml/ml_ts_ml.js — ML Forecasting
Object.assign(TOPIC_CONTENT, {
  "ml_ts_ml": `<main>
  <h1>ML Forecasting</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>ML Forecasting</span></div>
  <p class="lead">How to forecast with ordinary machine learning models such as LightGBM: turn the series into a table of past values (lags), rolling averages and calendar facts, keep every feature honest about what is known at forecast time, validate with time-ordered folds, choose between recursive and direct multi-step forecasting, train one global model across many related series, and produce quantile forecasts scored by pinball loss. Every step is worked by hand on one week of a homestay's register, then run on five years of data and five homestays, and compared fairly with seasonal naive, Holt-Winters, SARIMAX and Prophet.</p>

  <h2 id="tm-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_arima">ARIMA Family</a> and <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a></b><span>Those notes model one series at a time with a handful of parameters: ARIMA from its past values and errors, ETS from smoothed level, slope and season, Prophet from a curve on the calendar. Left open: what if you have many related series (a chain of homestays, 10,000 products), outside drivers (events, prices, weather), and plenty of data? A dozen parameters per series cannot share what one series teaches about another.</span></li>
    <li><b>This note: ML Forecasting</b><span>Reframe forecasting as supervised regression. Each row is one (series, day); the target is that day's value; the features are things already known when the forecast is made. Then any regression model from <a class="xref" data-note="ml_trees">Tree-Based Models</a> applies, as long as you avoid leakage, validate in time order, and handle the multi-step horizon.</span></li>
    <li><b>Leads to: production forecasting systems and deep learning</b><span>The same table feeds sequence models (<a class="xref" data-note="dl_rnns">RNNs &amp; LSTMs</a>, <a class="xref" data-note="transformers">Transformers</a>) and the forecasting system design in <a class="xref" data-note="sd_framework">ML System Design</a>: feature stores, back-testing, retraining and monitoring. This is the last note of the Time Series group.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 660 180" width="660">
<defs><marker id="tm-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Time Series</text>
<rect x="20" y="30" width="140" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="50" text-anchor="middle" font-size="12.5">Basics</text><text x="90" y="66" text-anchor="middle" class="tm" font-size="10.5">lags, ACF, seasons</text>
<rect x="180" y="30" width="140" height="46" rx="8" class="fb sb"/><text x="250" y="50" text-anchor="middle" font-size="12.5">ARIMA Family</text><text x="250" y="66" text-anchor="middle" class="tm" font-size="10.5">AR + MA</text>
<rect x="340" y="30" width="140" height="46" rx="8" class="fb sb"/><text x="410" y="50" text-anchor="middle" font-size="12.5">ETS &amp; Prophet</text><text x="410" y="66" text-anchor="middle" class="tm" font-size="10.5">states / curve</text>
<rect x="500" y="24" width="145" height="58" rx="8" class="fg sg" stroke-width="3"/><text x="572" y="46" text-anchor="middle" font-size="12.5" font-weight="700">ML Forecasting</text><text x="572" y="62" text-anchor="middle" class="tm" font-size="10.5">many series, a table</text><text x="572" y="76" text-anchor="middle" class="tb" font-size="10">YOU ARE HERE</text>
<line x1="160" y1="53" x2="178" y2="53" stroke="currentColor" marker-end="url(#tm-a0)"/><line x1="320" y1="53" x2="338" y2="53" stroke="currentColor" marker-end="url(#tm-a0)"/><line x1="480" y1="53" x2="498" y2="53" stroke="currentColor" marker-end="url(#tm-a0)"/>
<rect x="120" y="112" width="200" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="220" y="131" text-anchor="middle" font-size="12">Tree-Based Models</text><text x="220" y="147" text-anchor="middle" class="tm" font-size="10.5">LightGBM, the workhorse</text>
<rect x="360" y="112" width="200" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="460" y="131" text-anchor="middle" font-size="12">Train/Val/Test &amp; CV</text><text x="460" y="147" text-anchor="middle" class="tm" font-size="10.5">here: in time order</text>
<line x1="300" y1="112" x2="540" y2="84" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#tm-a0)"/><line x1="480" y1="112" x2="560" y2="84" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#tm-a0)"/>
<text x="330" y="174" text-anchor="middle" class="tm" font-size="10.5">dashed: tools borrowed from the rest of the ML track</text>
</svg><figcaption>ML forecasting closes the Time Series group. It reuses the trees from the tree family and the validation ideas from the foundations, adapted to the arrow of time.</figcaption></figure>

  <h2 id="tm-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>Each idea below answers the question the previous idea left open. Read it once now; each rung is then computed by hand on the same homestay week (Mon 5 – Sun 11 March 2018).</p>
  <ol class="story">
    <li><b>Baselines</b><span>Q: what would a lazy forecaster say for next week? → "same as last Sunday" (MAE 4.00), "same weekday last week" (2.43), "average of the last two same weekdays" (1.86). But which of these is "good", and good by what measure?…</span></li>
    <li><b>Forecast metrics</b><span>Q: how do we score a week of forecasts fairly? → MAE 2.43, RMSE 3.32, MAPE 8.55%, WAPE 8.37%, MASE 0.98. But baselines and metrics only judge; they cannot use the carnival calendar, the season or five years of patterns…</span></li>
    <li><b>Forecasting as supervised learning</b><span>Q: how do we let a regression model learn from history? → one row per day, the target y, features lag7, lag14, roll7, weekday, carnival flag: a table LightGBM can fit. 2018 MAE 2.57 vs 2.77. But the model under-forecasts a growing year, and which features matter?…</span></li>
    <li><b>Feature engineering</b><span>Q: what should the table contain? → calendar gaps made explicit, cyclic day-of-year, yearly lag, and a trend-free target y − roll7: 2.57 → 2.16. But a single wrong feature can make the score look far better than reality…</span></li>
    <li><b>Leakage traps</b><span>Q: how do we know a score is honest? → five traps measured: unshifted rolling mean, lag1 for a 7-day horizon, this month's mean, random split: each "improves" 2.57 to 2.08–2.35, falsely. But one honest test year is still one exam…</span></li>
    <li><b>Time-series cross-validation</b><span>Q: how do we validate on many periods without peeking at the future? → expanding and sliding windows with gaps: six 8-week folds, LightGBM 2.32 ± 0.29 vs seasonal naive 2.56 ± 0.30. But each forecast covers seven days, and day 7's features are not all known on day 0…</span></li>
    <li><b>Recursive vs direct multi-step</b><span>Q: how do we forecast h = 1…7 days ahead? → recursive (feed forecasts back, one model): 2.25; direct (one model per h): 2.32. But we are still training on one homestay, and Mrs Thakur has five…</span></li>
    <li><b>Global models</b><span>Q: can one model learn from all homestays at once? → scale each series, add the home as a feature: global beats local everywhere, and rescues the new Ooty homestay (1.18 → 0.96). But a single number per day hides risk: how many staff for a busy Saturday?…</span></li>
    <li><b>Quantile forecasts and pinball loss</b><span>Q: how do we forecast a range, and score it? → pinball loss with q = 0.9 charges 9× more for being short; LightGBM predicts P10, P50, P90. But is all this better than the classical models?…</span></li>
    <li><b>ML vs ARIMA, ETS and Prophet</b><span>Q: when does ML win? → on one clean series, Prophet 1.71 and SARIMAX 1.89 beat LightGBM 2.15 (it saw only two carnivals); with many series, drivers and data, ML wins. Then: how all the pieces connect.</span></li>
  </ol>
  <div class="bridge"><b>What this still can't tell us.</b> The ladder is the plot; every rung is computed below. <b>→ next: the Mind Map, then 01 The Task and the Baselines</b></div>

  <h2 id="tm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Forecasting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Task, baselines, metrics</div>
        <ul>
          <li><b>Origin</b> T (Sunday night), <b>horizon</b> h = 1…7 days</li>
          <li><b>Naive</b> y<sub>T</sub>; <b>seasonal naive</b> y<sub>T+h−7</sub>; <b>mean of k seasons</b></li>
          <li>MAE, RMSE, MAPE (breaks near 0), <b>WAPE</b> = Σ|e|/Σy</li>
          <li><b>MASE</b> = MAE ÷ in-sample seasonal-naive MAE (&lt; 1 beats it)</li>
          <li><b>Pinball</b> loss for quantile q: q·under + (1 − q)·over</li>
          <li>Week of 5 March: snaive MAE 2.43, MASE 0.98</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The table</div>
        <ul>
          <li>Row = (series, day); target y; features known at T</li>
          <li><b>Lags</b> y<sub>t−k</sub> with k ≥ horizon (7, 14, 364)</li>
          <li><b>Rolling</b>: shift first, then roll: <code>y.shift(7).rolling(7).mean()</code></li>
          <li><b>Calendar</b>: weekday, month, sin/cos of day-of-year, event flags</li>
          <li><b>Known-future</b> drivers OK (planned events, prices); unknown ones need their own forecast</li>
          <li><b>Target transform</b>: y − roll7 or y / level, because trees can't extrapolate</li>
          <li>⚠ <code>asfreq("D")</code> first: shift counts rows, not days</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Leakage</div>
        <ul>
          <li>Rolling without shift (includes today): 2.57 → 2.08 fake</li>
          <li>Lag shorter than horizon (lag1 for day 7): 2.35 fake</li>
          <li>Group stats over future days (this month's mean): 2.29 fake</li>
          <li>Random split / shuffled KFold: 2.08 fake</li>
          <li>Actuals of drivers you will only have as forecasts (weather)</li>
          <li>Rule: "would I have this number on Sunday night?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Validation</div>
        <ul>
          <li><b>Expanding</b> window: train grows, test = next block</li>
          <li><b>Sliding</b>: fixed-length train (<code>max_train_size</code>) when old data is stale</li>
          <li><b>Gap</b>: skip days between train and test for data delays</li>
          <li><code>TimeSeriesSplit(n_splits, test_size, gap, max_train_size)</code></li>
          <li>Back-test: LightGBM 2.32 ± 0.29 vs snaive 2.56 ± 0.30</li>
          <li>⚠ <code>cv=5</code> = plain KFold: it trains on the future to test the past</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multi-step &amp; global</div>
        <ul>
          <li><b>Recursive</b>: 1 model, feed forecasts back; errors can pile up</li>
          <li><b>Direct</b>: H models, one per h; no feedback, more training</li>
          <li><b>Lags ≥ H</b>: one model, every feature known for all h</li>
          <li>Pine View 2018: recursive 2.25, direct 2.32, snaive 2.77</li>
          <li><b>Global</b>: one model, all series, scaled target + series id</li>
          <li>Global wins on 4 of 5 homes; Ooty (164 rows): local 1.18 → global 0.96</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Quantiles &amp; choosing</div>
        <ul>
          <li>LightGBM <code>objective="quantile", alpha=q</code> → P10, P50, P90</li>
          <li>Check coverage: P10–P90 held 69% (nominal 80%); watch quantile crossing</li>
          <li>One clean series: Prophet 1.71, SARIMAX 1.89, LightGBM 2.15</li>
          <li>Trees need many examples of an event (2 carnivals → 5.33 on carnival week)</li>
          <li>ML wins with many series, drivers and long histories (M5)</li>
          <li>💡 A kirana owner ordering milk: last Monday, last year, festival? = lags + calendar</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tm-base"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Task &amp; Baselines</span><span class="rm-sub">Origin, horizon, naive, seasonal naive</span></div></div>
      <div class="rm-item rm-done" data-target="tm-metrics"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Forecast Metrics</span><span class="rm-sub">MAE, RMSE, MAPE, WAPE, MASE</span></div></div>
      <div class="rm-item rm-done" data-target="tm-frame"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Forecasting as Supervised Learning</span><span class="rm-sub">The sliding-window table</span></div></div>
      <div class="rm-item rm-done" data-target="tm-feat"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Feature Engineering</span><span class="rm-sub">Lags, rolling, calendar, target transforms</span></div></div>
      <div class="rm-item rm-done" data-target="tm-leak"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leakage Traps</span><span class="rm-sub">Five fake improvements, measured</span></div></div>
      <div class="rm-item rm-done" data-target="tm-cv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Time-Series Cross-Validation</span><span class="rm-sub">Expanding, sliding, gaps</span></div></div>
      <div class="rm-item rm-done" data-target="tm-multi"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Recursive vs Direct</span><span class="rm-sub">Forecasting 7 days ahead</span></div></div>
      <div class="rm-item rm-done" data-target="tm-global"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Global Models</span><span class="rm-sub">One LightGBM for five homestays</span></div></div>
      <div class="rm-item rm-done" data-target="tm-quant"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quantiles &amp; Pinball Loss</span><span class="rm-sub">P10, P50, P90 by hand and in LightGBM</span></div></div>
      <div class="rm-item rm-done" data-target="tm-arima"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ML vs ARIMA, ETS, Prophet</span><span class="rm-sub">A fair weekly back-test</span></div></div>
      <div class="rm-item rm-done" data-target="tm-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each piece built from the last</span></div></div>
      <div class="rm-item rm-done" data-target="tm-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="tm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="tm-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="tm-base"><span class="num">01</span>The Task and the Baselines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Before building any model we need the exact forecasting question (forecast what, when, how far ahead) and a free answer to beat. Without them we cannot say whether a model's 2.5-guest error is impressive or embarrassing.</p></div>
  <h3>The story and the question</h3>
  <p>Mrs Thakur runs Pine View, a 12-room homestay in Manali (the same register as in <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>: daily guests from 2014 to 2018, a weekend rhythm, a yearly rhythm, a five-day Snow Carnival in 2015, 2017 and 2018, faster growth after a new road in 2016, and 20 lost days in June 2015). Every <strong>Sunday night</strong> she plans the next week's staff and groceries. So the question is precise:</p>
  <ul>
    <li><strong>Forecast origin</strong> T: the last day whose value we know (a Sunday).</li>
    <li><strong>Horizon</strong> h = 1…7: Monday to Sunday of the coming week.</li>
    <li><strong>Target</strong>: guests on each of those nights.</li>
  </ul>
  <p>Our hand-worked week throughout the note: origin <strong>Sunday 4 March 2018</strong>, forecasting <strong>Mon 5 – Sun 11 March</strong>. Here is what she knew and what then happened:</p>
  <table class="tbl">
    <tr><th></th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr>
    <tr><td>19–25 Feb</td><td>27</td><td>29</td><td>26</td><td>27</td><td>33</td><td>31</td><td>29</td></tr>
    <tr><td>26 Feb – 4 Mar (last known week)</td><td>23</td><td>24</td><td>24</td><td>25</td><td>31</td><td>34</td><td>25</td></tr>
    <tr><td><strong>5–11 Mar (to forecast)</strong></td><td><strong>29</strong></td><td><strong>28</strong></td><td><strong>27</strong></td><td><strong>25</strong></td><td><strong>31</strong></td><td><strong>34</strong></td><td><strong>29</strong></td></tr>
  </table>
  <h3>Three baselines by hand</h3>
  <table class="tbl">
    <tr><th>Baseline</th><th>Rule</th><th>Forecast Mon…Sun</th><th>|error|</th><th>MAE</th></tr>
    <tr><td><strong>Naive</strong></td><td>every day = last known day (Sun 25)</td><td>25 25 25 25 25 25 25</td><td>4 3 2 0 6 9 4</td><td>28/7 = 4.00</td></tr>
    <tr><td><strong>Seasonal naive</strong></td><td>each day = same weekday last week</td><td>23 24 24 25 31 34 25</td><td>6 4 3 0 0 0 4</td><td>17/7 = 2.43</td></tr>
    <tr><td><strong>Mean of 2 seasons</strong></td><td>average of the last two same weekdays</td><td>25 26.5 25 26 32 32.5 27</td><td>4 1.5 2 1 1 1.5 2</td><td>13/7 = 1.86</td></tr>
  </table>
  <div class="fx" data-lang="py">"""The running example: Pine View homestay, Manali. Daily guests 2014-2018 and quarterly averages."""
import numpy as np, pandas as pd
_rng = np.random.default_rng(7)
_days = pd.date_range("2014-01-01", "2018-12-31", freq="D")
_t = (_days - _days[0]).days.values / 365.25                       # years since start
_trend = 14 + 1.5 * _t + 3.0 * np.clip(_t - 2.0, 0, None)          # road opens Jan 2016: growth 1.5 -&gt; 4.5 per year
_doy = _days.dayofyear.values / 365.25
_mid = (np.arange(12) + 0.5) / 12                                   # month effects, smoothed between mid-months
_eff = np.array([2, 0, 0, 5, 9, 8, -5, -7, -3, 2, 0, 4], float)
_season = np.interp(_doy, np.r_[_mid - 1, _mid, _mid + 1], np.r_[_eff, _eff, _eff])
_week = np.select([_days.dayofweek == 4, _days.dayofweek == 5, _days.dayofweek == 6], [4, 6, 1], -1.5)
_fest = np.zeros(len(_days))
for start in ["2015-01-15", "2017-01-15", "2018-01-15"]:          # Snow Carnival: only some years
    _fest[(_days &gt;= start) &amp; (_days &lt; pd.Timestamp(start) + pd.Timedelta(days=5))] = 12
_y = np.clip(np.round(_trend + _season + _week + _fest + _rng.normal(0, 2.0, len(_days))), 0, None)
daily = pd.Series(_y, index=_days, name="guests")
daily = daily.drop(pd.date_range("2015-06-01", "2015-06-20"))      # a lost page of the register
carnival = pd.DataFrame({"holiday": "snow_carnival",
                         "ds": pd.to_datetime(["2015-01-15", "2017-01-15", "2018-01-15"]),
                         "lower_window": 0, "upper_window": 4})
quarterly = daily.resample("QS").mean().round().astype(int)
quarterly.name = "guests"</div>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from homestay import daily

y = daily.asfreq("D")                                  # one row per calendar day (gaps become NaN)
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
  <p>The first block is the shared data module (the same one the previous note used); every script imports <code>daily</code> from it. <code>asfreq("D")</code> turns the register into one row per calendar day, so the lost days become visible NaNs instead of silently missing rows (section 04 shows why that matters). <code>history[-7:]</code> is the last known week. Naive ignores the weekend rhythm and loses 9 guests on Saturday. Seasonal naive gets the weekend right but copies last Monday's unusually quiet 23. Averaging two weeks smooths that one-off dip: 1.86.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop owner ordering milk for next week. "Same as yesterday" forgets that Sunday is different. "Same as last week, day by day" remembers the weekly rhythm. "Average of the last two weeks" also forgets one strange day. None of them knows a festival is coming; that is what a model with a calendar can add.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>With origin T, horizon h and season length m: <strong>naive</strong> ŷ<sub>T+h</sub> = y<sub>T</sub>; <strong>seasonal naive</strong> ŷ<sub>T+h</sub> = y<sub>T+h−m</sub> (for h ≤ m); <strong>seasonal mean of k seasons</strong> ŷ<sub>T+h</sub> = (1/k)Σ<sub>j=1..k</sub> y<sub>T+h−jm</sub>. Here m = 7.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing a model against plain naive only. On weekly-patterned data naive is a weak bar (4.00); seasonal naive (2.43) is the honest one. A model that "beats naive by 35%" may still lose to seasonal naive.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We used MAE without asking whether it is the right yardstick. Are big misses worse? Should errors be in guests or percent? How do we compare Pine View with a bigger homestay? <b>→ next: 02 Forecast Metrics</b></div>

  <h2 id="tm-metrics"><span class="num">02</span>Forecast Metrics</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>"MAE 2.43" is in guests. Is that good for a homestay of 30 guests? How do we compare it with Shimla, which is twice as big? Do we care more about one awful day than several slightly-off days? We need the standard forecast metrics, and to know what each one rewards.</p></div>
  <h3>All of them by hand on one week</h3>
  <p>Seasonal naive's errors (actual − forecast) for 5–11 March: <strong>6, 4, 3, 0, 0, 0, 4</strong>; actuals 29, 28, 27, 25, 31, 34, 29 (total 203).</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>By hand</th><th>Reads as</th></tr>
    <tr><td><strong>MAE</strong></td><td>mean |e|</td><td>17/7 = <strong>2.43</strong></td><td>a typical night is off by 2.4 guests</td></tr>
    <tr><td><strong>RMSE</strong></td><td>√ mean e²</td><td>√((36 + 16 + 9 + 16)/7) = √11 = <strong>3.32</strong></td><td>like MAE but big misses weigh more (the 6 dominates)</td></tr>
    <tr><td><strong>MAPE</strong></td><td>mean |e|/y × 100</td><td>(6/29 + 4/28 + 3/27 + 4/29)/7 = 0.599/7 = <strong>8.55%</strong></td><td>average percentage miss; explodes when y is near 0</td></tr>
    <tr><td><strong>WAPE</strong></td><td>Σ|e| / Σy × 100</td><td>17/203 = <strong>8.37%</strong></td><td>total miss as a share of total guests; safe with small days</td></tr>
    <tr><td><strong>MASE</strong></td><td>MAE / (in-sample seasonal-naive MAE)</td><td>2.43 / 2.48 = <strong>0.98</strong></td><td>&lt; 1 beats seasonal naive's usual error; scale-free</td></tr>
  </table>
  <p>MASE needs one number from training: how wrong seasonal naive (lag 7) has been on 2014–2017 on average. That is computed in the code: 2.481 guests.</p>
  <div class="fx" data-lang="py">import numpy as np
from homestay import daily

y = daily.asfreq("D")
actual = y["2018-03-05":"2018-03-11"].values
f = y["2018-02-26":"2018-03-04"].values                 # seasonal naive forecast from section 01
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
  <p><code>train.values[7:] - train.values[:-7]</code> subtracts each day's value from the value seven days later: the error seasonal naive would have made on every training day. <code>np.nanmean</code> skips the NaNs around the lost days. MASE 0.98 says: this week, seasonal naive was about as good as it usually is. A model with MASE 0.7 removes 30% of seasonal naive's typical error, on any series of any size.</p>
  <h3>Which metric when</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Use when</th><th>Avoid when</th></tr>
    <tr><td>MAE</td><td>one series, cost proportional to the miss, explaining to managers</td><td>comparing series of different size</td></tr>
    <tr><td>RMSE</td><td>big misses are disproportionately costly; the model is trained on squared error</td><td>a few outliers should not dominate</td></tr>
    <tr><td>MAPE</td><td>never-small series and a percentage is demanded</td><td>any zeros or small values; it also rewards under-forecasting</td></tr>
    <tr><td>WAPE</td><td>retail and demand across many items: weights big sellers more</td><td>every item matters equally regardless of size</td></tr>
    <tr><td>MASE</td><td>comparing accuracy across many series; answering "did we beat seasonal naive?"</td><td>non-technical audiences (explain it first)</td></tr>
    <tr><td>Pinball (section 09)</td><td>quantile forecasts, uneven costs of under and over</td><td>point forecasts</td></tr>
  </table>
  <p>The full family, including R², sMAPE and RMSLE, is in <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MASE</strong> = (1/H)Σ|y<sub>T+h</sub> − ŷ<sub>T+h</sub>| ÷ [1/(n − m)]Σ<sub>t=m+1..n</sub>|y<sub>t</sub> − y<sub>t−m</sub>|, the forecast MAE divided by the in-sample MAE of the seasonal naive method with season m. <strong>WAPE</strong> = Σ|e| / Σ|y|.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Averaging MAPE over many series with small values (a homestay with 0–3 guests on winter weekdays). One night with 1 actual and 3 forecast is a 200% error and swamps everything. Use WAPE or MASE.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We can now score forecasts, but the forecasters so far are fixed rules. They cannot learn that the carnival adds 11 guests, that summer is busier, or that a quiet Monday is noise. How do we let a learning algorithm use all of that? <b>→ next: 03 Forecasting as Supervised Learning</b></div>

  <h2 id="tm-frame"><span class="num">03</span>Forecasting as Supervised Learning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>LightGBM, random forests and linear regression all need a table: rows of examples, columns of features, one target column. A time series is one long column of numbers. How do we turn it into examples a regression model can learn from, without cheating?</p></div>
  <h3>The idea: the sliding window</h3>
  <p>Make <strong>one row per day</strong>. The target is that day's guests. The features are facts that were <strong>already known on the forecast origin</strong>: the same weekday last week, the week before, last week's average, which weekday it is, whether the carnival is on. Slide this window along five years and you get about 1,800 examples of "situation → outcome". Because our horizon is up to 7 days, every value-based feature must be at least 7 days old; then every feature of every day Mon–Sun is known on Sunday night.</p>
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
  <h3>By hand: the week of 5 March as rows</h3>
  <table class="tbl">
    <tr><th>Target day</th><th>lag7</th><th>lag14</th><th>roll7 (mean of y<sub>t−7</sub>…y<sub>t−13</sub>)</th><th>dow</th><th>carnival</th><th>y (target)</th></tr>
    <tr><td>Mon 5 Mar</td><td>23 (26 Feb)</td><td>27 (19 Feb)</td><td>(29+26+27+33+31+29+23)/7 = 198/7 = 28.29</td><td>0</td><td>0</td><td>29</td></tr>
    <tr><td>Tue 6 Mar</td><td>24</td><td>29</td><td>27.57</td><td>1</td><td>0</td><td>28</td></tr>
    <tr><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td></tr>
    <tr><td>Sun 11 Mar</td><td>25 (4 Mar)</td><td>29</td><td>(23+24+24+25+31+34+25)/7 = 186/7 = 26.57</td><td>6</td><td>0</td><td>29</td></tr>
  </table>
  <p>Notice "lag7" of Sunday 11 March is Sunday 4 March itself: the latest possible value, and still known at the origin. That is why 7 is the smallest safe lag for a 7-day horizon.</p>
  <div class="fx" data-lang="py">import pandas as pd
from homestay import carnival

CARNIVAL_DAYS = pd.DatetimeIndex([d + pd.Timedelta(days=k) for d in carnival.ds for k in range(5)])

def make_table(y):
    """One row per day. Every feature uses only values at least 7 days old,
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
    return X</div>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from homestay import daily
from feats import make_table

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
  <p><code>make_table</code> builds every feature with <code>shift(k)</code>, which moves the column down k days, so row t sees y<sub>t−k</sub>. <code>shift(7).rolling(7, min_periods=5).mean()</code> first moves back a week, then averages 7 values (allowing up to 2 missing). The printed rows match the hand table. The model is trained on 1,441 rows from 2014–2017 and predicts all 365 days of 2018; since every feature is at least 7 days old, this equals 52 honest "Sunday-night" forecasts. LightGBM gets 2.57 against seasonal naive's 2.77 on the whole year. For our week it forecasts 25.8, 24.3, 24.9, 24.7, 29.5, 30.0, 26.0: the right shape, but every day is too low (the actuals are 29, 28, 27, 25, 31, 34, 29).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket analyst predicting tomorrow's score from a spreadsheet: each past match is a row; the columns are the pitch report, the team's average in its last five matches, home or away. The analyst never puts the match's own final score in a column, and never uses information released after the toss if predicting before it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Forecasting as supervised learning</strong>: construct a dataset {(x<sub>t</sub>, y<sub>t</sub>)} where x<sub>t</sub> contains only information available at the forecast origin for y<sub>t</sub> (lags y<sub>t−k</sub> with k ≥ h, functions of them, calendar and known-future variables), then fit any regression model f so that ŷ<sub>t</sub> = f(x<sub>t</sub>). A <strong>lag feature</strong> is y<sub>t−k</sub>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Splitting the table randomly because "it is just a table now". The rows are still ordered in time, and neighbouring rows share information (y<sub>t</sub> is lag7 of y<sub>t+7</sub>). Train on the past, test on the future, always (section 05 measures the damage).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> The model forecasts every day of the test week too low. 2018 is busier than anything in training (up to 43 guests vs 39), and trees cannot predict beyond what they have seen. Which features and target fix that, and what else belongs in the table? <b>→ next: 04 Feature Engineering</b></div>

  <h2 id="tm-feat"><span class="num">04</span>Feature Engineering for Forecasting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Our first table had five features and forecast the busy 2018 too low. Which columns does a forecasting table need, how is each built correctly, and how do we stop a tree from being capped at the largest value it has seen?</p></div>
  <h3>First, make the calendar explicit</h3>
  <p><code>shift(7)</code> moves values down 7 <em>rows</em>. If a day is missing from the index, 7 rows is no longer 7 days. Pine View's register has no rows for 1–20 June 2015:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from homestay import daily
from feats import make_table

# 1. a gap in the dates: shift() counts rows, not days
wrong = daily.shift(7)                                  # the raw register skips 1-20 June 2015
right = daily.asfreq("D").shift(7)
d = pd.Timestamp("2015-06-22")
print(f"lag7 for {d.date()}: rows-shift -&gt; {wrong[d]:.0f} (that is {daily.index[daily.index.get_loc(d) - 7].date()}),"
      f" calendar-shift -&gt; {right[d]}")

# 2. cyclic encoding: 31 Dec and 1 Jan should be neighbours
for day in ["2017-12-31", "2018-01-01", "2018-07-02"]:
    k = pd.Timestamp(day).dayofyear
    print(f"{day}: day-of-year {k:3d}  sin {np.sin(2 * np.pi * k / 365.25):+.3f}  cos {np.cos(2 * np.pi * k / 365.25):+.3f}")

# 3. more features and a trend-free target
tbl = make_table(daily)
tbl["lag364"] = tbl.y.shift(364)                        # same weekday, 52 weeks ago
tbl["roll28"] = tbl.y.shift(7).rolling(28, min_periods=20).mean()
tbl["doy_sin"] = np.sin(2 * np.pi * tbl.index.dayofyear / 365.25)
tbl["doy_cos"] = np.cos(2 * np.pi * tbl.index.dayofyear / 365.25)
train, test = tbl.loc[:"2017"].dropna(subset=["y"]), tbl.loc["2018"]

def mae_2018(features, target_minus_roll7):
    m = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15,
                          min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)
    offset_tr = train.roll7 if target_minus_roll7 else 0
    offset_te = test.roll7 if target_minus_roll7 else 0
    m.fit(train[features], train.y - offset_tr)
    return np.mean(np.abs(test.y - (m.predict(test[features]) + offset_te)))

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
  <p>The first line shows the trap: on 22 June 2015, a plain <code>shift(7)</code> returned the value from 26 May, 27 days earlier, and called it "last week". After <code>asfreq("D")</code> the missing days exist as NaN, and lag7 is correctly NaN (LightGBM handles NaN features natively). With many series, do this per series (<code>groupby("home")</code> then shift), or a lag will leak across series boundaries.</p>
  <h3>Lags: which ones</h3>
  <ul>
    <li><strong>Horizon rule</strong>: a lag k is usable only if k ≥ h for the farthest step you forecast with that model. For a 7-day horizon with one model: lags 7, 14, 21, … (section 07 relaxes this).</li>
    <li><strong>Seasonal lags</strong>: multiples of the season: 7 and 14 for the weekly rhythm, 364 (52 weeks, same weekday) for the yearly one.</li>
    <li><strong>Guided by the ACF</strong>: the autocorrelation function (see <a class="xref" data-note="ml_timeseries">Time Series Basics</a>) shows which past days are most related to today.</li>
  </ul>
  <h3>Rolling and expanding windows</h3>
  <p>A single lag is noisy (last Monday's quiet 23). An average of several lags is steadier. Always <strong>shift first, then roll</strong>: <code>y.shift(7).rolling(28).mean()</code> averages days t−7…t−34, all known on Sunday. Useful window statistics: mean (level), std (volatility), min/max, and the same-weekday mean of the last k weeks. An <strong>expanding</strong> mean averages all history so far. An exponentially weighted mean, <code>y.shift(7).ewm(alpha=0.3).mean()</code>, is exactly the simple exponential smoothing level from <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>, used as a feature.</p>
  <h3>Calendar features and cyclic encoding by hand</h3>
  <p>Weekday, month, day-of-year, week-of-year, holiday flags, "days until the carnival": all known in advance, so always safe. But day-of-year as a plain number puts 31 December (365) and 1 January (1) at opposite ends, although they are neighbours. Map it onto a circle: x = sin(2π·d/365.25), y = cos(2π·d/365.25).</p>
  <ul>
    <li>31 Dec, d = 365: sin(2π·0.9993) = −0.004, cos = 1.000.</li>
    <li>1 Jan, d = 1: sin(2π·0.0027) = +0.017, cos = 1.000. Neighbours again: distance 0.02 instead of 364.</li>
    <li>2 Jul, d = 183: sin ≈ −0.006, cos = −1.000: the opposite side of the circle.</li>
  </ul>
  <p>Trees can split on raw day-of-year fine; the circle matters more for linear models and neural nets, but it also helps trees by giving smooth "season position" columns (and it is what Prophet's Fourier terms do).</p>
  <h3>Known-future vs unknown drivers</h3>
  <table class="tbl">
    <tr><th>Driver</th><th>Known on Sunday for next week?</th><th>How to use</th></tr>
    <tr><td>Carnival dates, public holidays, school vacations</td><td>Yes (planned)</td><td>Flag, days-to/after-event</td></tr>
    <tr><td>Room price Mrs Thakur sets</td><td>Yes (she decides it)</td><td>Use the planned price</td></tr>
    <tr><td>Bookings already made for next week</td><td>Yes, as of Sunday</td><td>Use bookings "as of the origin", never final bookings</td></tr>
    <tr><td>Rain, landslide road closures</td><td>No</td><td>Use a weather <em>forecast</em> in training too, or leave out</td></tr>
  </table>
  <h3>The target: trees cannot extrapolate</h3>
  <p>A tree predicts the average of training rows in a leaf, so it can never predict above the highest training values it has seen, and LightGBM is a sum of trees with the same limit. Pine View keeps growing: the training maximum is 39, 2018 reaches 43. The fix is to predict something without the trend: <strong>y − roll7</strong> (how far today sits from last known week's average), then add roll7 back. The model learns shapes ("Saturday is +6 over the weekly average"), and the level comes from the data.</p>
  <table class="tbl">
    <tr><th>Feature set</th><th>Target y</th><th>Target y − roll7</th></tr>
    <tr><td>Base: lag7, lag14, roll7, dow, month, carnival</td><td>2.573</td><td>2.451</td></tr>
    <tr><td>+ doy sin/cos, lag364, roll28</td><td>2.229</td><td><strong>2.155</strong></td></tr>
  </table>
  <p>Both changes help, and they add up: 2.57 → 2.16, now 22% below seasonal naive (2.77). Other common target transforms: y / level (ratio; used for the global model in section 08), log(1 + y) for multiplicative growth, and first differences.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature at time t</strong> must be a function of information available at the forecast origin T ≤ t − h<sub>max</sub> for value-based features, or of the calendar and planned (known-future) variables. <strong>Target transform</strong>: model z<sub>t</sub> = g(y<sub>t</sub>, known quantities) and invert after predicting, e.g. z = y − roll7, ŷ = ẑ + roll7.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A forecast that flatlines just below recent values on a growing series is the signature of a tree hitting its ceiling. Do not add more trees; change the target (difference or ratio), or add a linear component.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Every feature so far was checked by hand to be known on Sunday. One careless column can make a model look brilliant offline and fail on Monday. How do we recognise leakage, and how big is the fake gain? <b>→ next: 05 Leakage Traps</b></div>

  <h2 id="tm-leak"><span class="num">05</span>Leakage Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Our honest model scores 2.57 (base features). If a colleague reports 2.08 with "just one more feature", is it a better model or a leak? We need to see what each common leak does to the score, on the same data.</p></div>
  <h3>The one question that catches all of them</h3>
  <p><strong>"On Sunday night, would I have this number?"</strong> Leakage is any feature (or split, or preprocessing step) that uses information from after the forecast origin. In forecasting it is easy, because the future sits in the same column as the past, one row down. The code adds one leaky feature at a time to the honest base model:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from sklearn.model_selection import train_test_split
from homestay import daily
from feats import make_table

tbl = make_table(daily)
y = tbl.y
tbl["roll7_leaky"] = y.rolling(7).mean()                 # includes today's own value
tbl["lag1"] = y.shift(1)                                 # yesterday: unknown 2..7 days ahead
month_mean_all = y.groupby(y.index.to_period("M")).transform("mean")
tbl["month_mean_leaky"] = month_mean_all                 # this month's average, incl. future days
tbl = tbl.dropna(subset=["y"])
base = ["lag7", "lag14", "roll7", "dow", "month", "carnival"]

def score(features, train, test):
    m = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15,
                          min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)
    m.fit(train[features], train.y)
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
  <table class="tbl">
    <tr><th>Leak</th><th>Why it is unavailable on Sunday</th><th>Fake MAE</th><th>Fix</th></tr>
    <tr><td>Rolling mean without shift</td><td><code>y.rolling(7)</code> on Monday averages Mon…Tue of last week <em>including Monday itself</em>: the answer is 1/7 of the feature</td><td>2.08</td><td><code>y.shift(h).rolling(k)</code></td></tr>
    <tr><td>lag1 with a 7-day horizon</td><td>For Sunday's forecast you would need Saturday's actual, six days in the future</td><td>2.35</td><td>lags ≥ h, recursive or direct (section 07)</td></tr>
    <tr><td>Group statistic over future days</td><td>"This month's mean" for 5 March includes 6–31 March</td><td>2.29</td><td>compute group stats on the training period only, or from lagged data</td></tr>
    <tr><td>Random split</td><td>Training rows from the days around each test day; lag7 of a test day is in training as a target</td><td>2.08</td><td>split by time; <code>TimeSeriesSplit</code></td></tr>
    <tr><td>Scaler or encoder fit on all data</td><td>The 2018 mean and spread enter training</td><td>small here, large with strong trends</td><td>fit inside a <a class="xref" data-note="ml_pipelines">Pipeline</a> on training rows only</td></tr>
    <tr><td>Actual values of uncertain drivers</td><td>Next week's real rainfall is not known on Sunday</td><td>looks great offline, fails live</td><td>train on the forecasts you will have (archived weather forecasts)</td></tr>
    <tr><td>Revised data</td><td>Final booking counts are corrected days later</td><td>subtle</td><td>store data "as known at" each date (point-in-time)</td></tr>
  </table>
  <p>Every leak "improves" the honest 2.57, by 0.2 to 0.5 guests. The improvement is fake: in production, those inputs do not exist yet, and the model falls back to worse than honest, because it learned to depend on them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student practising with question papers that have the answer key printed faintly on the back. Mock scores soar; the board exam has no answer key on the back. Leakage is the answer key.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Temporal leakage</strong>: using, during training or evaluation, any information that would not be available at the forecast origin when the model is used, through features, preprocessing, the train/test split, or revised data. The safe practice is <strong>point-in-time correctness</strong>: every feature value is reconstructed as it was known at the origin.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The leak hidden in a library default: <code>cross_val_score(model, X, y, cv=5)</code> uses plain KFold. Fold 1 tests on 2014 while training on 2015–2018. Always pass a time-ordered splitter.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> All our numbers come from one test year. Was 2018 typical? Is LightGBM better than seasonal naive in every season, or only on average? We need many honest test periods. <b>→ next: 06 Time-Series Cross-Validation</b></div>

  <h2 id="tm-cv"><span class="num">06</span>Time-Series Cross-Validation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Ordinary k-fold puts future rows in training. A single train/test split gives one score that may be luck. How do we get many test scores, each computed only from the past, to choose features and hyperparameters and to know the spread?</p></div>
  <h3>Three window schemes, by hand on 28 days</h3>
  <p>Number four weeks of days 0–27. Each fold trains on a block of the past and tests on the block right after it.</p>
  <table class="tbl">
    <tr><th>Scheme</th><th>Fold 0</th><th>Fold 1</th><th>Fold 2</th><th>Use when</th></tr>
    <tr><td><strong>Expanding</strong></td><td>train 0–6, test 7–13</td><td>train 0–13, test 14–20</td><td>train 0–20, test 21–27</td><td>default; old data still relevant</td></tr>
    <tr><td><strong>Sliding</strong> (train length 7)</td><td>train 0–6, test 7–13</td><td>train 7–13, test 14–20</td><td>train 14–20, test 21–27</td><td>old data is stale (pre-road, pre-COVID)</td></tr>
    <tr><td><strong>Expanding + gap 2</strong> (test 5)</td><td>train 0–10, test 13–17</td><td>train 0–15, test 18–22</td><td>train 0–20, test 23–27</td><td>data arrives late, or features need a buffer</td></tr>
  </table>
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
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from homestay import daily
from feats import make_table

days = np.arange(28)                                     # four weeks, row numbers 0..27
for title, cv in [("expanding", TimeSeriesSplit(n_splits=3, test_size=7)),
                  ("sliding (max_train_size=7)", TimeSeriesSplit(n_splits=3, test_size=7, max_train_size=7)),
                  ("expanding with gap=2", TimeSeriesSplit(n_splits=3, test_size=5, gap=2))]:
    print(title)
    for k, (tr, te) in enumerate(cv.split(days)):
        print(f"  fold {k}: train {tr[0]:2d}-{tr[-1]:2d} ({len(tr):2d} rows)  test {te[0]:2d}-{te[-1]:2d}")

# a real back-test: 6 folds of 8 weeks each, all inside 2014-2017
tbl = make_table(daily).loc[:"2017"].dropna(subset=["y"])
features = ["lag7", "lag14", "roll7", "dow", "month", "carnival"]
model = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15,
                          min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)
rows = []
for tr, te in TimeSeriesSplit(n_splits=6, test_size=56).split(tbl):
    a, b = tbl.iloc[tr], tbl.iloc[te]
    model.fit(a[features], a.y)
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
  <p><code>TimeSeriesSplit(n_splits, test_size)</code> produces the expanding folds; <code>max_train_size</code> turns them into sliding windows; <code>gap</code> drops rows between train and test. The printed row numbers match the hand table. The real back-test uses six folds of 8 weeks across 2017, retraining LightGBM each time on everything before the fold (1,105 to 1,385 rows).</p>
  <p>Read the fold table, not just the mean. LightGBM wins 5 of 6 folds, loses the fold starting 30 January 2017 (2.30 vs 2.04), and is clearly better in early summer (1.85 vs 2.71). Mean ± standard deviation: 2.32 ± 0.29 vs 2.56 ± 0.30. The difference (0.24) is real but not huge compared with the fold-to-fold spread, which is exactly what one test year cannot tell you.</p>
  <h3>Practical rules</h3>
  <ul>
    <li>Make each test block as long as the business horizon (here, at least a week), and use several, covering different seasons.</li>
    <li>Use the folds for <em>everything</em> you choose: features, hyperparameters (<code>GridSearchCV(cv=TimeSeriesSplit(...))</code>), the model family. Keep a final untouched period (2018 here) for the last check.</li>
    <li>With rolling features, the first rows of the training block have NaN features; that is fine for LightGBM, or drop them.</li>
    <li>For many series, split by <strong>date</strong> across all series at once (all homes train up to the same cut-off), never by series.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Time-series cross-validation</strong> (rolling-origin evaluation, walk-forward validation): a sequence of folds k = 1…K, each training on observations before a cut-off T<sub>k</sub> (all of them: expanding; the last L: sliding) and testing on observations in (T<sub>k</sub> + gap, T<sub>k</sub> + gap + H], with T<sub>1</sub> &lt; T<sub>2</sub> &lt; … &lt; T<sub>K</sub>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a test block shorter than the horizon, or overlapping folds whose lag features were built from the test block. Build features on the full timeline first (they only look backwards), then split rows by date; never rebuild rolling features inside the test block from test targets.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> So far one model with lags ≥ 7 forecast all seven days. But Monday's forecast could use Sunday (1 day old), not just last Monday (7 days old). How do we use fresh information for near days without leaking for far days? <b>→ next: 07 Recursive vs Direct Multi-Step Forecasting</b></div>

  <h2 id="tm-multi"><span class="num">07</span>Recursive vs Direct Multi-Step Forecasting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>With "lags ≥ 7" every day of the week ignores the most recent six days. Sunday night we do know Sunday, Saturday, Friday… How do we use them for Monday (1 day ahead) and still produce honest forecasts for Sunday (7 days ahead)?</p></div>
  <h3>The three strategies</h3>
  <div class="cards">
    <div><b>Recursive (iterated)</b><p>Train one 1-day-ahead model. Forecast Monday, then pretend that forecast is Monday's value and forecast Tuesday, and so on.</p><small>1 model · errors can pile up</small></div>
    <div><b>Direct</b><p>Train a separate model for each h = 1…7. Model h uses the values known at the origin and predicts exactly h days ahead.</p><small>7 models · no feedback of errors</small></div>
    <div><b>Lags ≥ horizon</b><p>One model whose features are all at least H days old (sections 03–05).</p><small>1 model · ignores the freshest days</small></div>
  </div>
  <p>Variants exist: <strong>DirRec</strong> (direct models that also take the previous steps' forecasts as inputs) and <strong>MIMO</strong> (one model that outputs all 7 values at once, common in neural networks).</p>
  <h3>Recursive by hand</h3>
  <p>Take a toy 1-step rule: ŷ<sub>t</sub> = 0.5·y<sub>t−1</sub> + 0.5·y<sub>t−7</sub> ("half yesterday, half the same day last week"). Origin Sunday 4 March (y = 25):</p>
  <table class="tbl">
    <tr><th>Day</th><th>"yesterday" used</th><th>same day last week</th><th>forecast</th><th>actual</th><th>|error|</th></tr>
    <tr><td>Mon 5</td><td>25 (real Sunday)</td><td>23</td><td>24</td><td>29</td><td>5</td></tr>
    <tr><td>Tue 6</td><td><strong>24 (our forecast)</strong></td><td>24</td><td>24</td><td>28</td><td>4</td></tr>
    <tr><td>Wed 7</td><td>24 (forecast)</td><td>24</td><td>24</td><td>27</td><td>3</td></tr>
    <tr><td>Thu 8</td><td>24 (forecast)</td><td>25</td><td>24.5</td><td>25</td><td>0.5</td></tr>
    <tr><td>Fri 9</td><td>24.5 (forecast)</td><td>31</td><td>27.75</td><td>31</td><td>3.25</td></tr>
    <tr><td>Sat 10</td><td>27.75 (forecast)</td><td>34</td><td>30.875</td><td>34</td><td>3.125</td></tr>
    <tr><td>Sun 11</td><td>30.875 (forecast)</td><td>25</td><td>27.94</td><td>29</td><td>1.06</td></tr>
  </table>
  <p>MAE 19.94/7 = 2.85. From Tuesday on, "yesterday" is our own forecast. The quiet Sunday (25) dragged Monday's forecast down, and that low forecast then fed Tuesday's, and Tuesday's fed Wednesday's: one error propagates. That is the risk of recursion. A direct strategy would instead train, for example, a "Wednesday-from-Sunday" model whose inputs are only real values (y on Sunday, Saturday, …), so no forecast is ever fed back, at the cost of fitting seven models.</p>
  <h3>The real comparison on 52 Sunday origins</h3>
  <p>Both strategies get the same inputs: the last 14 days of the register at the origin (y<sub>T</sub>, y<sub>T−1</sub>, …, y<sub>T−13</sub>), plus the target day's weekday, carnival flag and position in the year.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from homestay import daily
from feats import CARNIVAL_DAYS

y = daily.asfreq("D")
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
    m = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15,
                          min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)
    return m.fit(window_rows(y, origins[keep], h), target[keep])

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
        pred = one_step.predict(window_rows(s, [s.index[-1]], 1))[0]
        s.loc[T + h * DAY] = pred                        # the forecast becomes "history"
    err["recursive"].append(actual - s[T + DAY:].values)

print("MAE by days ahead:  h=1   h=2   h=3   h=4   h=5   h=6   h=7  | all")
for name, e in err.items():
    e = np.abs(np.array(e))
    print(f"{name:16s}", " ".join(f"{v:5.2f}" for v in e.mean(0)), f"| {e.mean():.2f}")</div>
  <div class="fx" data-lang="text">MAE by days ahead:  h=1   h=2   h=3   h=4   h=5   h=6   h=7  | all
seasonal naive    3.08  2.56  2.98  2.90  2.63  2.52  2.71 | 2.77
recursive         2.48  1.88  2.30  1.95  2.19  2.80  2.17 | 2.25
direct            2.48  1.87  2.32  1.94  2.31  3.08  2.26 | 2.32</div>
  <p><code>window_rows</code> builds one row per origin: the 14 latest values, newest first, plus calendar facts about day T + h. <code>fit(h)</code> trains on every day of 2014–2017 as an origin, with the value h days later as target. For the recursive forecast, <code>s</code> starts as the known history and each prediction is appended to it, so the next row's "y_T-0" is our own forecast.</p>
  <ul>
    <li>At h = 1 the two are the same model (2.48), and both use Sunday's value, which "lags ≥ 7" cannot.</li>
    <li>Recursive (2.25) slightly beats direct (2.32) here. With little short-term autocorrelation in this series (it is mostly weekly pattern + noise), errors do not snowball much, and the single model is trained on more relevant 1-step examples.</li>
    <li>Saturday (h = 6) is hardest for both: the busiest, most variable night.</li>
    <li>Both beat seasonal naive at every horizon except Saturday (h = 6), where both lose (2.80 and 3.08 vs 2.52).</li>
  </ul>
  <table class="tbl">
    <tr><th></th><th>Recursive</th><th>Direct</th><th>Lags ≥ H</th></tr>
    <tr><td>Models</td><td>1</td><td>H</td><td>1</td></tr>
    <tr><td>Uses freshest values</td><td>Yes</td><td>Yes</td><td>No</td></tr>
    <tr><td>Error propagation</td><td>Yes: forecasts fed back</td><td>No</td><td>No</td></tr>
    <tr><td>Features of future steps</td><td>Must be rebuilt from forecasts (rolling means of forecasts…)</td><td>Simple</td><td>Simple</td></tr>
    <tr><td>Consistency across h</td><td>Smooth path</td><td>Each h separate; can zig-zag</td><td>Smooth</td></tr>
    <tr><td>Cost</td><td>Cheap to train, sequential to predict</td><td>H× training</td><td>Cheapest</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Recursive strategy</strong>: fit f with ŷ<sub>t+1</sub> = f(y<sub>t</sub>, …, y<sub>t−p+1</sub>) and iterate, replacing unknown y's by forecasts. <strong>Direct strategy</strong>: fit separate f<sub>h</sub> with ŷ<sub>t+h</sub> = f<sub>h</sub>(y<sub>t</sub>, …, y<sub>t−p+1</sub>) for h = 1…H, using only values known at t.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Evaluating a recursive model with real lag values instead of fed-back forecasts. The "lag1" row in section 05 (fake 2.35) is exactly that mistake. In back-tests, run the full recursion from the origin, as the code does.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Every model so far learned from Pine View alone. Mrs Thakur now runs five homestays, one of them (Ooty) opened only in July 2017 with too little history to learn a yearly pattern. Can the homestays learn from each other? <b>→ next: 08 Global Models</b></div>

  <h2 id="tm-global"><span class="num">08</span>Global Models Across Many Series</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>A model per homestay learns each one's patterns from its own few years. Ooty opened in July 2017 and has only 164 usable training days: no full year, no summer, no Diwali season. The other four homestays have seen those many times. How do we let one series learn from the others?</p></div>
  <h3>Local vs global</h3>
  <p>A <strong>local</strong> model is fitted per series (ARIMA, ETS and Prophet are always local). A <strong>global</strong> model is one model fitted on the stacked rows of all series. Weekend peaks, summer rush and monsoon dips look alike across hill-station homestays; a global model learns them from five times the data, and a short series borrows the shapes learned from long ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new branch manager at a restaurant chain. A local approach: wait two years to learn your own branch's festival rush. A global approach: read the chain's records from all branches on day one, then adjust for your branch's size. The new manager is useful immediately.</p>
  </div>
  <h3>Making series comparable: scale by hand</h3>
  <p>The homes have different sizes: Shimla averages 33 guests, Mussoorie 14. If the target is raw guests, the model mostly learns "which home is it" and the big homes dominate the loss. Divide each home's target and lag features by its own <strong>level</strong>, the last known 4-week average (also at least 7 days old), and the shapes line up. Saturday 10 March 2018:</p>
  <table class="tbl">
    <tr><th>Home</th><th>guests y</th><th>level (mean of y<sub>t−7</sub>…y<sub>t−34</sub>)</th><th>target y / level</th><th>lag7 / level</th></tr>
    <tr><td>Manali</td><td>34</td><td>28.18</td><td>34/28.18 = 1.21</td><td>34/28.18 = 1.21</td></tr>
    <tr><td>Mussoorie</td><td>17</td><td>12.68</td><td>17/12.68 = 1.34</td><td>1.26</td></tr>
  </table>
  <p>In guests the two Saturdays differ by 17; in level units they are both "a Saturday about 1.2–1.3× the usual level". The model learns that once, from all homes, and the prediction is turned back into guests by multiplying by the level. The home name is also given as a categorical feature, so the model can still learn home-specific quirks (the carnival exists only in Manali).</p>
  <div class="fx" data-lang="py">"""Mrs Thakur's chain: Pine View (Manali) plus four more homestays, daily guests in long format."""
import numpy as np, pandas as pd
from homestay import daily as pine_view, carnival

def _make(name, seed, base, growth, summer, weekend, start="2014-01-01"):
    rng = np.random.default_rng(seed)
    days = pd.date_range(start, "2018-12-31", freq="D")
    t = (days - pd.Timestamp("2014-01-01")).days.values / 365.25
    doy = days.dayofyear.values / 365.25
    season = summer * np.sin(2 * np.pi * (doy - 0.25)) + 0.4 * summer * np.cos(4 * np.pi * doy)
    week = np.where(days.dayofweek &gt;= 4, weekend, -0.4 * weekend)
    y = np.clip(np.round(base + growth * t + season + week + rng.normal(0, 0.08 * base, len(days))), 0, None)
    return pd.Series(y, index=days, name=name)

_others = [_make("Shimla", 1, 30, 1.0, 6, 3), _make("Mussoorie", 2, 12, 0.5, 3, 4),
           _make("Nainital", 3, 18, 1.5, 7, 2), _make("Ooty", 4, 10, 2.0, -3, 2, start="2017-07-01")]
_all = [pine_view.rename("Manali")] + _others
chain = pd.concat([s.rename_axis("date").reset_index(name="guests").assign(home=s.name) for s in _all],
                  ignore_index=True)[["home", "date", "guests"]]</div>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from chain import chain
from feats import CARNIVAL_DAYS

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

data = pd.concat([home_table(g) for _, g in chain.groupby("home")])
data["home"] = data["home"].astype("category")
feats = ["lag7", "lag14", "lag364", "roll7", "dow", "doy_sin", "doy_cos", "carnival"]
train, test = data[data.index.year &lt;= 2017], data[data.index.year == 2018]
print(data.groupby("home", observed=True).size().to_dict(), " training rows:", len(train))

def model():
    return lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15,
                             min_child_samples=20, n_jobs=1, verbose=-1, random_state=0)

glob = model().fit(train[feats + ["home"]], train.y / train.level)   # ONE model, all homes
test = test.assign(global_=glob.predict(test[feats + ["home"]]) * test.level)
test["local"] = np.nan
for home, tr in train.groupby("home", observed=True):                 # one model PER home
    rows = test.home == home
    test.loc[rows, "local"] = model().fit(tr[feats], tr.y / tr.level).predict(
        test.loc[rows, feats]) * test.loc[rows, "level"]
test["snaive"] = test.lag7 * test.level                               # undo the scaling

print(f"{'home':10s} train rows  seasonal naive   local   global")
for home, te in test.groupby("home", observed=True):
    n = (train.home == home).sum()
    mae = lambda c: np.mean(np.abs(te.y - te[c]))
    print(f"{home:10s} {n:10d} {mae('snaive'):15.2f} {mae('local'):7.2f} {mae('global_'):8.2f}")</div>
  <div class="fx" data-lang="text">{'Manali': 1767, 'Mussoorie': 1806, 'Nainital': 1806, 'Ooty': 529, 'Shimla': 1806}  training rows: 5889
home       train rows  seasonal naive   local   global
Manali           1402            2.77    2.12     2.13
Mussoorie        1441            1.11    0.84     0.82
Nainital         1441            1.70    1.40     1.36
Ooty              164            0.98    1.18     0.96
Shimla           1441            2.77    2.20     2.13</div>
  <p><code>chain.py</code> adds four simulated homestays to Pine View (each with its own size, growth, season and weekend strength; Ooty starts in July 2017) and stacks them in <strong>long format</strong>: one row per (home, date). <code>home_table</code> builds the features per home, so no lag ever crosses from one home into another, and <code>div(level, axis=0)</code> scales them. The global model is fitted once on 5,889 rows with <code>home</code> as a pandas category (LightGBM splits on categories directly); the local models are fitted per home on the same features.</p>
  <ul>
    <li>Global is as good as or better than local on every home (Manali 2.13 vs 2.12 is a tie).</li>
    <li>The big win is <strong>Ooty</strong>: with only 164 training rows the local model (1.18) is worse than seasonal naive (0.98); the global model (0.96) recovers by borrowing the seasonal shape from the other four homes.</li>
    <li>Every learned model beats seasonal naive on the four established homes.</li>
  </ul>
  <p>This is how large forecasting competitions have been won: in the M5 competition (Walmart, 42,840 series), most top solutions were global LightGBM models on lag, rolling, price and calendar features, often one model per store or per department.</p>
  <table class="tbl">
    <tr><th></th><th>Local (one per series)</th><th>Global (one for all)</th></tr>
    <tr><td>Data per model</td><td>one series' history</td><td>all series' histories</td></tr>
    <tr><td>Short / new series</td><td>weak (Ooty 1.18)</td><td>borrows patterns (0.96)</td></tr>
    <tr><td>Series-specific quirks</td><td>learned directly</td><td>needs id feature or segmentation</td></tr>
    <tr><td>Models to maintain</td><td>N</td><td>1 (or one per group)</td></tr>
    <tr><td>Scaling</td><td>not needed</td><td>essential: divide by level or use log</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Global forecasting model</strong>: a single function f, shared by all series i, with ŷ<sub>i,t</sub> = f(x<sub>i,t</sub>), fitted on the pooled rows of all series. x<sub>i,t</sub> includes the series' own lags (scaled), calendar features, drivers, and optionally series attributes or an identifier.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Building lags on the stacked table without grouping: <code>df.guests.shift(7)</code> on long data takes the first rows of Mussoorie's lag from the last rows of Manali. Always <code>df.groupby("home").guests.shift(7)</code> (or build per series, as here), and sort by date within each series first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Every forecast so far is one number per night. Staffing is decided by the busy nights: being short of beds and cooks costs much more than one spare cook. How do we forecast "a number we will exceed only 1 night in 10", and how do we score it? <b>→ next: 09 Quantile Forecasts and Pinball Loss</b></div>

  <h2 id="tm-quant"><span class="num">09</span>Quantile Forecasts and Pinball Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>MAE-trained models aim at the median; RMSE-trained models at the mean. If running short of staff costs 9 times more than one idle cook, neither is the number to plan with. How do we forecast a chosen quantile, and what loss rewards it?</p></div>
  <h3>Pinball loss by hand</h3>
  <p>For a target quantile q (0 &lt; q &lt; 1), each error e = actual − forecast costs:</p>
  <p style="text-align:center"><strong>L<sub>q</sub>(e) = q·e if e ≥ 0 (forecast too low); (1 − q)·(−e) if e &lt; 0 (forecast too high)</strong></p>
  <p>With q = 0.9: being 1 guest short costs 0.9; being 1 guest over costs 0.1. The forecast that minimises the average pinball loss is the q-th quantile of the outcome. At q = 0.5 both sides cost 0.5, so pinball = MAE / 2.</p>
  <table class="tbl">
    <tr><th>Forecast for 5–11 Mar</th><th>errors</th><th>q = 0.9 pinball</th><th>MAE</th></tr>
    <tr><td>Seasonal naive 23 24 24 25 31 34 25</td><td>6 4 3 0 0 0 4 (all short)</td><td>0.9 × 17 / 7 = <strong>2.19</strong></td><td>2.43</td></tr>
    <tr><td>Seasonal naive + 5</td><td>1 −1 −2 −5 −5 −5 −1</td><td>(0.9×1 + 0.1×19)/7 = 2.8/7 = <strong>0.40</strong></td><td>2.86</td></tr>
  </table>
  <p>The +5 forecast is worse by MAE but much better by q = 0.9 pinball: it is rarely short, which is what a P90 should be.</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from homestay import daily
from feats import make_table

def pinball(y, f, q):
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
    preds[0.1][68], preds[0.5][68], preds[0.9][68], test.y.iloc[68]))</div>
  <div class="fx" data-lang="text">seasonal naive      MAE 2.43  pinball q=0.5 1.21  q=0.9 2.19
seasonal naive + 5  MAE 2.86  pinball q=0.5 1.43  q=0.9 0.40
P10  share of 2018 days at or below it: 0.13   pinball 0.458
P50  share of 2018 days at or below it: 0.41   pinball 1.164
P90  share of 2018 days at or below it: 0.82   pinball 0.498
P10-P90 band holds 69% of days; average width 5.7 guests
Sat 10 March 2018: P10 30.3  P50 30.9  P90 33.7  actual 34</div>
  <p><code>np.maximum(q*e, (q-1)*e)</code> picks the right branch: for e &gt; 0 it is q·e, for e &lt; 0 it is (q − 1)·e, which is positive. LightGBM trains on exactly this loss with <code>objective="quantile", alpha=q</code>; one model per quantile.</p>
  <h3>Checking the quantiles: calibration</h3>
  <p>A P90 should be at or above the actual on 90% of days. On 2018: P10 13%, P50 41%, P90 82%. All three are a bit low, for the same reason as section 03: 2018 is busier than anything seen, so every quantile lags a little. The P10–P90 band should hold 80% of days and holds 69%, with an average width of 5.7 guests. So for planning, Mrs Thakur should widen the band or recalibrate it on a back-test (for example, add the 90th percentile of past P90 misses).</p>
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
  <p>Quantile crossing (a P50 below the P10 on some days) happens because each quantile model is trained separately. The usual fix is to sort the predicted quantiles for each day, or to use a method that predicts all quantiles jointly. Other ways to get intervals: residual quantiles from a back-test (empirical intervals), conformal prediction, or a model with a probability distribution (ETS, ARIMA, Prophet).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pinball (quantile) loss</strong>: L<sub>q</sub>(y, ŷ) = max(q·(y − ŷ), (q − 1)·(y − ŷ)). Its expected value is minimised by the q-quantile of y. A <strong>quantile forecast</strong> P<sub>q</sub> is a forecast trained or chosen to minimise it; <strong>coverage</strong> is the observed share of actuals at or below P<sub>q</sub>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing q by habit (P90 "because it sounds safe"). Pick it from costs: if being short costs c<sub>u</sub> per guest and over-preparing costs c<sub>o</sub>, the best quantile is q = c<sub>u</sub> / (c<sub>u</sub> + c<sub>o</sub>). Short costs ₹900, over costs ₹100: q = 0.9.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We have built a full ML forecasting toolkit. Is it actually better than the classical models from the previous notes on the same homestay, and when should you not use it? <b>→ next: 10 ML vs ARIMA, ETS and Prophet</b></div>

  <h2 id="tm-arima"><span class="num">10</span>ML vs ARIMA, ETS and Prophet</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Each note claimed its models were good. On the same 52 Sunday-night forecasts of 2018, with the same information, how do LightGBM, SARIMAX, Holt-Winters and Prophet compare, and what explains the order?</p></div>
  <h3>A fair weekly back-test</h3>
  <p>Every model is trained on 2014–2017 and then forecasts Monday–Sunday from each of the 52 Sundays of 2018, using only data up to that Sunday:</p>
  <ul>
    <li><strong>SARIMAX</strong>: ARIMA(0,1,1)(0,1,1)<sub>7</sub> (the "airline" structure with a weekly season, see <a class="xref" data-note="ml_arima">ARIMA Family</a>) plus two pairs of yearly Fourier waves and the carnival flag as exogenous regressors. Parameters estimated once; <code>apply</code> runs the same model through 2018 so each Sunday's forecast uses the latest data.</li>
    <li><strong>Holt-Winters</strong>: damped trend, weekly season, refitted every Sunday (gaps interpolated).</li>
    <li><strong>Prophet</strong>: fitted once with the carnival as a holiday (it has no lags, so nothing to update).</li>
    <li><strong>LightGBM</strong>: the section 04 model (lags ≥ 7, season, trend-free target).</li>
  </ul>
  <div class="fx" data-lang="py">import logging, time, numpy as np, pandas as pd, lightgbm as lgb
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from prophet import Prophet
from homestay import daily, carnival
from feats import make_table, CARNIVAL_DAYS

y = daily.asfreq("D")
DAY = pd.Timedelta(days=1)
sundays = pd.date_range("2017-12-31", "2018-12-23", freq="W-SUN")
days = y.index
calendar = pd.DataFrame({"s1": np.sin(2 * np.pi * days.dayofyear / 365.25),
                         "c1": np.cos(2 * np.pi * days.dayofyear / 365.25),
                         "s2": np.sin(4 * np.pi * days.dayofyear / 365.25),
                         "c2": np.cos(4 * np.pi * days.dayofyear / 365.25),
                         "carnival": days.isin(CARNIVAL_DAYS).astype(float)}, index=days)
fc = {}

t0 = time.time()                       # SARIMA(0,1,1)(0,1,1)_7 + yearly waves + carnival as regressors
sar = SARIMAX(y[:"2017"], exog=calendar[:"2017"], order=(0, 1, 1),
              seasonal_order=(0, 1, 1, 7)).fit(disp=False)
full = sar.apply(y, exog=calendar)     # same parameters, run the filter through 2018
fc["SARIMAX"] = [full.get_prediction(start=T + DAY, end=T + 7 * DAY, dynamic=True).predicted_mean.values
                 for T in sundays]
secs = {"SARIMAX": time.time() - t0}

t0 = time.time()                       # Holt-Winters, weekly season, refit every Sunday
yi = y.interpolate()
fc["Holt-Winters (m=7)"] = [ExponentialSmoothing(yi[:T], trend="add", damped_trend=True, seasonal="add",
                            seasonal_periods=7).fit().forecast(7).values for T in sundays]
secs["Holt-Winters (m=7)"] = time.time() - t0

t0 = time.time()                       # Prophet, fitted once (it has no memory to update)
df = daily[:"2017"].reset_index(); df.columns = ["ds", "y"]
p = Prophet(holidays=carnival).fit(df).predict(pd.DataFrame({"ds": y["2018"].index})).set_index("ds").yhat
fc["Prophet"] = [p[T + DAY:T + 7 * DAY].values for T in sundays]
secs["Prophet"] = time.time() - t0

t0 = time.time()                       # LightGBM: lags &gt;= 7, season, trend-free target (section 04)
tbl = make_table(daily)
tbl["lag364"] = tbl.y.shift(364); tbl["roll28"] = tbl.y.shift(7).rolling(28, min_periods=20).mean()
tbl["doy_sin"], tbl["doy_cos"] = calendar.s1, calendar.c1
feats = ["lag7", "lag14", "roll7", "dow", "month", "carnival", "doy_sin", "doy_cos", "lag364", "roll28"]
tr = tbl.loc[:"2017"].dropna(subset=["y"])
g = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, num_leaves=15, min_child_samples=20,
                      n_jobs=1, verbose=-1, random_state=0).fit(tr[feats], tr.y - tr.roll7)
lg = pd.Series(g.predict(tbl[feats]) + tbl.roll7.values, index=tbl.index)
fc["LightGBM"] = [lg[T + DAY:T + 7 * DAY].values for T in sundays]
secs["LightGBM"] = time.time() - t0

fc["seasonal naive"] = [y[T - 6 * DAY:T].values for T in sundays]
actual = np.array([y[T + DAY:T + 7 * DAY].values for T in sundays])
scale = np.nanmean(np.abs(y[:"2017"].values[7:] - y[:"2017"].values[:-7]))
print(f"{'model':20s}  MAE   RMSE  MASE  carnival-week MAE")
carn = np.array([(T + DAY) &lt;= pd.Timestamp("2018-01-19") &lt;= (T + 7 * DAY) for T in sundays])
for name in ["seasonal naive", "Holt-Winters (m=7)", "SARIMAX", "Prophet", "LightGBM"]:
    e = actual - np.array(fc[name])
    print(f"{name:20s} {np.abs(e).mean():5.2f} {np.sqrt((e ** 2).mean()):5.2f} "
          f"{np.abs(e).mean() / scale:5.2f} {np.abs(e[carn]).mean():8.2f}")
print("SARIMAX params:", sar.params[["ma.L1", "ma.S.L7", "carnival"]].round(2).to_dict())</div>
  <div class="fx" data-lang="text">model                 MAE   RMSE  MASE  carnival-week MAE
seasonal naive        2.77  3.71  1.12     9.29
Holt-Winters (m=7)    2.16  2.88  0.87     8.75
SARIMAX               1.89  2.32  0.76     1.44
Prophet               1.71  2.10  0.69     0.99
LightGBM              2.15  2.73  0.87     5.33
SARIMAX params: {'ma.L1': -0.81, 'ma.S.L7': -1.0, 'carnival': 10.85}</div>
  <p>The last column is the MAE over the week containing the 2018 carnival. MASE divides each MAE by seasonal naive's in-sample error (2.48), so 0.69 means Prophet removed 31% of it.</p>
  <h3>Reading the result honestly</h3>
  <ul>
    <li><strong>Prophet wins (1.71)</strong>, then SARIMAX (1.89). This series was simulated as smooth trend + smooth seasons + weekly pattern + holiday + independent noise: exactly Prophet's model, and close to SARIMAX-with-Fourier. On such one-series, structure-dominated data, classical models are hard to beat.</li>
    <li><strong>LightGBM (2.15) ties Holt-Winters (2.16).</strong> It beats seasonal naive comfortably but not the structural models.</li>
    <li><strong>The carnival week shows why.</strong> Prophet (0.99) and SARIMAX (1.44) treat the carnival as one additive coefficient learned from two past carnivals. LightGBM (5.33) must learn it from tree splits on 10 carnival rows out of 1,441, with <code>min_child_samples=20</code>: it cannot isolate them. Trees need many examples of an event; linear terms need few.</li>
    <li><strong>The echo.</strong> In January, lag7 of the week after the carnival contains carnival days, so seasonal naive repeats the spike a week late, and LightGBM partly does too (figure below).</li>
    <li>Fixes on the ML side: a "days since carnival" feature (or setting lag features to NaN on event days), a linear booster/hybrid (LightGBM's <code>linear_tree=True</code>), or residual modelling: fit Prophet, then LightGBM on its residuals.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<line x1="60" y1="220" x2="620" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="69" y="234" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="69" y1="220" x2="69" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="195.5" y="234" text-anchor="middle" class="tm" font-size="10.5">8</text>
<line x1="195.5" y1="220" x2="195.5" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="321.9" y="234" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="321.9" y1="220" x2="321.9" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="394.2" y="234" text-anchor="middle" class="tm" font-size="10.5">19</text>
<line x1="394.2" y1="220" x2="394.2" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="448.4" y="234" text-anchor="middle" class="tm" font-size="10.5">22</text>
<line x1="448.4" y1="220" x2="448.4" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="574.8" y="234" text-anchor="middle" class="tm" font-size="10.5">29</text>
<line x1="574.8" y1="220" x2="574.8" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="55" y="223.5" text-anchor="end" class="tm" font-size="10.5">15</text>
<line x1="57" y1="220" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="55" y="160.2" text-anchor="end" class="tm" font-size="10.5">25</text>
<line x1="57" y1="156.7" x2="60" y2="156.7" stroke="currentColor" opacity="0.5"/>
<text x="55" y="96.8" text-anchor="end" class="tm" font-size="10.5">35</text>
<line x1="57" y1="93.3" x2="60" y2="93.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="33.5" text-anchor="end" class="tm" font-size="10.5">45</text>
<line x1="57" y1="30" x2="60" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="69,137.7 87.1,163 105.2,150.3 123.2,137.7 141.3,106 159.4,80.7 177.4,125 195.5,112.3 213.5,150.3 231.6,144 249.7,169.3 267.7,125 285.8,80.7 303.9,144 321.9,61.7 340,68 358.1,87 376.1,74.3 394.2,42.7 412.3,106 430.3,125 448.4,137.7 466.5,156.7 484.5,163 502.6,144 520.6,118.7 538.7,87 556.8,99.7 574.8,137.7 592.9,150.3 611,156.7" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="69" cy="137.7" r="3" class="fs"/>
<circle cx="87.1" cy="163" r="3" class="fs"/>
<circle cx="105.2" cy="150.3" r="3" class="fs"/>
<circle cx="123.2" cy="137.7" r="3" class="fs"/>
<circle cx="141.3" cy="106" r="3" class="fs"/>
<circle cx="159.4" cy="80.7" r="3" class="fs"/>
<circle cx="177.4" cy="125" r="3" class="fs"/>
<circle cx="195.5" cy="112.3" r="3" class="fs"/>
<circle cx="213.5" cy="150.3" r="3" class="fs"/>
<circle cx="231.6" cy="144" r="3" class="fs"/>
<circle cx="249.7" cy="169.3" r="3" class="fs"/>
<circle cx="267.7" cy="125" r="3" class="fs"/>
<circle cx="285.8" cy="80.7" r="3" class="fs"/>
<circle cx="303.9" cy="144" r="3" class="fs"/>
<circle cx="321.9" cy="61.7" r="3" class="fs"/>
<circle cx="340" cy="68" r="3" class="fs"/>
<circle cx="358.1" cy="87" r="3" class="fs"/>
<circle cx="376.1" cy="74.3" r="3" class="fs"/>
<circle cx="394.2" cy="42.7" r="3" class="fs"/>
<circle cx="412.3" cy="106" r="3" class="fs"/>
<circle cx="430.3" cy="125" r="3" class="fs"/>
<circle cx="448.4" cy="137.7" r="3" class="fs"/>
<circle cx="466.5" cy="156.7" r="3" class="fs"/>
<circle cx="484.5" cy="163" r="3" class="fs"/>
<circle cx="502.6" cy="144" r="3" class="fs"/>
<circle cx="520.6" cy="118.7" r="3" class="fs"/>
<circle cx="538.7" cy="87" r="3" class="fs"/>
<circle cx="556.8" cy="99.7" r="3" class="fs"/>
<circle cx="574.8" cy="137.7" r="3" class="fs"/>
<circle cx="592.9" cy="150.3" r="3" class="fs"/>
<circle cx="611" cy="156.7" r="3" class="fs"/>
<polyline points="69,144 87.1,175.7 105.2,106 123.2,118.7 141.3,118.7 159.4,93.3 177.4,125 195.5,137.7 213.5,163 231.6,150.3 249.7,137.7 267.7,106 285.8,80.7 303.9,125 321.9,112.3 340,150.3 358.1,144 376.1,169.3 394.2,125 412.3,80.7 430.3,144 448.4,61.7 466.5,68 484.5,87 502.6,74.3 520.6,42.7 538.7,106 556.8,125 574.8,137.7 592.9,156.7 611,163" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="3 3"/>
<polyline points="69,133.9 87.1,140.5 105.2,145 123.2,135.9 141.3,115.5 159.4,106.6 177.4,117.5 195.5,137.2 213.5,140.7 231.6,142.3 249.7,138.1 267.7,117.6 285.8,110.6 303.9,125.5 321.9,115.4 340,114.2 358.1,113.3 376.1,117.3 394.2,107.2 412.3,107.5 430.3,126.1 448.4,159.7 466.5,151.6 484.5,149.1 502.6,139.6 520.6,92.9 538.7,83.9 556.8,93.2 574.8,136.6 592.9,150.4 611,156.5" fill="none" class="sb" stroke-width="2.2"/>
<polyline points="69,144.1 87.1,141.9 105.2,142.8 123.2,143.1 141.3,108.2 159.4,96.5 177.4,125.6 195.5,144.9 213.5,142.8 231.6,143.6 249.7,144 267.7,109.2 285.8,97.7 303.9,127 321.9,73.9 340,76.4 358.1,77.8 376.1,75.7 394.2,40.6 412.3,100.8 430.3,130.4 448.4,150.2 466.5,148.5 484.5,149.9 502.6,150.7 520.6,116.4 538.7,105.3 556.8,134.8 574.8,154.6 592.9,152.8 611,154" fill="none" class="sg" stroke-width="2.2"/>
<text x="340" y="250" text-anchor="middle" class="tm" font-size="11">January 2018 (carnival 15–19)</text>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">guests</text>
<text x="70" y="20" font-size="11">actual</text><text x="125" y="20" font-size="11" class="tr">seasonal naive</text><text x="250" y="20" font-size="11" class="tb">LightGBM</text><text x="330" y="20" font-size="11" class="tg">Prophet</text>
</svg><figcaption>January 2018 day by day. Prophet lifts the carnival days (15–19). Seasonal naive copies the previous week, so it misses the carnival and then echoes it one week late (22–25); LightGBM barely reacts to the carnival and shows a smaller echo on 26–28.</figcaption></figure>
  <h3>So when does ML win?</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Usually best</th><th>Why</th></tr>
    <tr><td>One or a few series, strong regular structure, little data</td><td>ETS, SARIMA(X), Prophet</td><td>few parameters, structure built in, intervals</td></tr>
    <tr><td>Rare but known events (a few per series)</td><td>Classical with regressors, or hybrid</td><td>one coefficient per event needs few examples</td></tr>
    <tr><td>Hundreds or thousands of related series</td><td>Global ML</td><td>shares patterns; one model to maintain</td></tr>
    <tr><td>Many drivers with non-linear effects (price × promotion × weather)</td><td>ML</td><td>trees learn interactions automatically</td></tr>
    <tr><td>Short or new series inside a big catalogue</td><td>Global ML</td><td>borrows from neighbours (Ooty)</td></tr>
    <tr><td>Long horizon extrapolation of a trend</td><td>Classical, or ML on a detrended target</td><td>trees cannot extrapolate</td></tr>
  </table>
  <p>In practice teams often <strong>combine</strong>: the average of an ETS/ARIMA forecast and an ML forecast is frequently better than either, and the ML model can use classical forecasts as features.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SARIMAX</strong>: seasonal ARIMA with eXogenous regressors: y<sub>t</sub> = β·x<sub>t</sub> + u<sub>t</sub>, where the regression error u<sub>t</sub> follows a SARIMA process. With Fourier terms as x it is also called dynamic harmonic regression.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Declaring "ML beats statistics" (or the opposite) from one dataset. The ranking flips with the number of series, the amount of history, the drivers and the events. Back-test every family against seasonal naive on your own data before choosing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We have used many pieces: baselines, metrics, tables, features, validation, strategies, global models, quantiles. How is each built from the previous one? <b>→ next: 11 How It All Connects</b></div>

  <h2 id="tm-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Ten ideas were introduced one at a time. How does each one depend on the ones before it, and where does every homestay number come from?</p></div>
  <figure class="viz"><svg viewBox="0 0 680 420" width="680">
<defs><marker id="tm-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="14" width="200" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="120" y="33" text-anchor="middle" font-size="12">Origin T, horizon h, baselines</text><text x="120" y="50" text-anchor="middle" class="tm" font-size="10.5">snaive 2.43 · 2.77</text>
<rect x="240" y="14" width="200" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="33" text-anchor="middle" font-size="12">Metrics</text><text x="340" y="50" text-anchor="middle" class="tm" font-size="10.5">MAE · WAPE · MASE</text>
<line x1="220" y1="37" x2="238" y2="37" stroke="currentColor" marker-end="url(#tm-a2)"/>
<line x1="340" y1="60" x2="340" y2="84" stroke="currentColor" marker-end="url(#tm-a2)"/><text x="348" y="77" class="tm" font-size="10">judge everything below</text>
<rect x="240" y="86" width="200" height="46" rx="8" class="fb sb"/><text x="340" y="105" text-anchor="middle" font-size="12">Sliding-window table</text><text x="340" y="122" text-anchor="middle" class="tm" font-size="10.5">row = day, known at T</text>
<line x1="340" y1="132" x2="340" y2="156" stroke="currentColor" marker-end="url(#tm-a2)"/>
<rect x="240" y="158" width="200" height="46" rx="8" class="fb sb"/><text x="340" y="177" text-anchor="middle" font-size="12">Features + target transform</text><text x="340" y="194" text-anchor="middle" class="tm" font-size="10.5">lags ≥ h · y − roll7: 2.16</text>
<line x1="440" y1="181" x2="478" y2="181" stroke="currentColor" marker-end="url(#tm-a2)"/>
<rect x="480" y="158" width="185" height="46" rx="8" class="fr sr"/><text x="572" y="177" text-anchor="middle" font-size="12">Leakage check</text><text x="572" y="194" text-anchor="middle" class="tm" font-size="10.5">"known on Sunday?"</text>
<line x1="572" y1="204" x2="572" y2="228" stroke="currentColor" marker-end="url(#tm-a2)"/>
<rect x="480" y="230" width="185" height="46" rx="8" class="fr sr"/><text x="572" y="249" text-anchor="middle" font-size="12">Time-series CV</text><text x="572" y="266" text-anchor="middle" class="tm" font-size="10.5">2.32 vs 2.56 (6 folds)</text>
<line x1="340" y1="204" x2="340" y2="228" stroke="currentColor" marker-end="url(#tm-a2)"/><text x="348" y="221" class="tm" font-size="10">relax "lags ≥ h"</text>
<rect x="240" y="230" width="200" height="46" rx="8" class="fg sg"/><text x="340" y="249" text-anchor="middle" font-size="12">Recursive / direct</text><text x="340" y="266" text-anchor="middle" class="tm" font-size="10.5">2.25 / 2.32</text>
<line x1="340" y1="276" x2="340" y2="300" stroke="currentColor" marker-end="url(#tm-a2)"/><text x="348" y="293" class="tm" font-size="10">stack, scale</text>
<rect x="240" y="302" width="200" height="46" rx="8" class="fg sg"/><text x="340" y="321" text-anchor="middle" font-size="12">Global model</text><text x="340" y="338" text-anchor="middle" class="tm" font-size="10.5">Ooty 1.18 → 0.96</text>
<line x1="340" y1="348" x2="340" y2="372" stroke="currentColor" marker-end="url(#tm-a2)"/><text x="348" y="365" class="tm" font-size="10">change the loss</text>
<rect x="240" y="374" width="200" height="40" rx="8" class="ft st"/><text x="340" y="393" text-anchor="middle" font-size="12">Quantiles (pinball)</text><text x="340" y="408" text-anchor="middle" class="tm" font-size="10.5">P10/P50/P90 · 69%</text>
<rect x="20" y="230" width="200" height="118" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="120" y="252" text-anchor="middle" font-size="12">Classical models</text><text x="120" y="272" text-anchor="middle" class="tm" font-size="10.5">Prophet 1.71 · SARIMAX 1.89</text><text x="120" y="290" text-anchor="middle" class="tm" font-size="10.5">Holt-Winters 2.16</text><text x="120" y="310" text-anchor="middle" class="tm" font-size="10.5">same back-test, same MASE</text><text x="120" y="330" text-anchor="middle" class="tm" font-size="10.5">LightGBM 2.15</text>
<line x1="220" y1="289" x2="238" y2="260" stroke="currentColor" stroke-dasharray="3 3"/>
<line x1="480" y1="253" x2="442" y2="253" stroke="currentColor" stroke-dasharray="3 3"/>

</svg><figcaption>The chain of the note. The task and metrics define success; the table makes ML possible; features, leakage checks and time-ordered validation keep it honest; multi-step strategies, global models and quantile losses extend it; the classical models are the benchmark on the same back-test.</figcaption></figure>
  <h3>One table on the running example</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Built from</th><th>Homestay number</th><th>Question it answers</th><th>Weakness → next</th></tr>
    <tr><td>Baselines</td><td>past values by a fixed rule</td><td>week: 4.00 / 2.43 / 1.86</td><td>What is the bar?</td><td>no learning</td></tr>
    <tr><td>MAE, RMSE, MAPE, WAPE, MASE</td><td>errors actual − forecast</td><td>2.43, 3.32, 8.55%, 8.37%, 0.98</td><td>How good, on what scale?</td><td>only judge</td></tr>
    <tr><td>Sliding-window table</td><td>shifted copies of y + calendar</td><td>lag7 23, roll7 28.29 for 5 Mar; 2018 MAE 2.57</td><td>How can a regressor learn?</td><td>under-forecasts growth</td></tr>
    <tr><td>Feature engineering</td><td>the table + more lags, cycles, target transform</td><td>2.57 → 2.16</td><td>What should the table contain?</td><td>easy to leak</td></tr>
    <tr><td>Leakage checks</td><td>"known at T?" for every column and step</td><td>fake 2.08–2.35</td><td>Is the score honest?</td><td>one test period</td></tr>
    <tr><td>Time-series CV</td><td>cut-offs moving forward</td><td>2.32 ± 0.29 vs 2.56 ± 0.30</td><td>Is it reliably better?</td><td>ignores freshest days</td></tr>
    <tr><td>Recursive / direct</td><td>1-step model iterated / one model per h</td><td>2.25 / 2.32 (toy recursion 2.85)</td><td>How to use recent days for h = 1…7?</td><td>one series only</td></tr>
    <tr><td>Global model</td><td>stacked, level-scaled tables + home id</td><td>Ooty 0.96 vs 1.18</td><td>Can series learn from each other?</td><td>point forecasts only</td></tr>
    <tr><td>Quantiles</td><td>pinball loss on the same table</td><td>P90 covers 82%; band 69%</td><td>How much risk?</td><td>calibrate, crossing</td></tr>
    <tr><td>vs classical</td><td>same back-test, same metrics</td><td>Prophet 1.71 · SARIMAX 1.89 · LGBM 2.15</td><td>When does ML pay off?</td><td>choose per problem</td></tr>
  </table>
  <h3>Identities worth remembering</h3>
  <ul>
    <li>Seasonal naive forecast = lag7 feature; MASE's denominator = seasonal naive's in-sample MAE.</li>
    <li>WAPE = MAE / mean(y) (here 2.43 / 29 = 8.37%). Pinball at q = 0.5 = MAE / 2.</li>
    <li><code>y.shift(7).ewm(alpha).mean()</code> = the SES level of the previous note, as a feature.</li>
    <li>Recursive at h = 1 = direct at h = 1 (the same model).</li>
    <li>Best quantile for asymmetric costs: q = c<sub>under</sub> / (c<sub>under</sub> + c<sub>over</sub>).</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us.</b> Knowing the chain does not stop the classic slips. <b>→ next: 12 Common Mistakes</b></div>

  <h2 id="tm-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Which mistakes in ML forecasting appear again and again in projects and interviews?</p></div>
  <div class="cards">
    <div><b>No seasonal-naive baseline</b><p>"Beats naive by 35%" can still lose to seasonal naive.</p><small>Section 01</small></div>
    <div><b>MAPE on small values</b><p>A 1-guest night forecast at 3 is 200%; use WAPE or MASE.</p><small>Section 02</small></div>
    <div><b>Random split</b><p>Neighbouring days leak; fake 2.08 vs honest 2.57.</p><small>Sections 03, 05</small></div>
    <div><b>Rolling without shift</b><p>Includes today's target; always shift by the horizon first.</p><small>Section 05</small></div>
    <div><b>Lags shorter than the horizon</b><p>lag1 for a 7-day forecast is unavailable; use lags ≥ h, recursive or direct.</p><small>Sections 05, 07</small></div>
    <div><b>shift() on a gappy index</b><p>Counts rows, not days: "last week" became 27 days ago. <code>asfreq</code> first.</p><small>Section 04</small></div>
    <div><b>Trees on a trend</b><p>Capped at the training maximum; predict y − level or y / level.</p><small>Section 04</small></div>
    <div><b>Lags across series</b><p>shift on stacked data mixes homes; group by series.</p><small>Section 08</small></div>
    <div><b>Unscaled global model</b><p>Big series dominate; divide by level or use logs.</p><small>Section 08</small></div>
    <div><b>Back-test with real lags</b><p>A recursive model must be evaluated with its own fed-back forecasts.</p><small>Section 07</small></div>
    <div><b>Trusting quantiles blindly</b><p>P10–P90 held 69%, not 80%; check coverage and crossing.</p><small>Section 09</small></div>
    <div><b>Rare events in trees</b><p>Two carnivals: LightGBM 5.33 vs Prophet 0.99 on that week.</p><small>Section 10</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap: train/serve skew</span>
    <p>Features computed one way in the notebook (from clean, final data) and another way in production (from what the database holds at 11 pm on Sunday, with late bookings missing). Build features with the same code in both places, from point-in-time data, and monitor the live error against the back-test error.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> To revise everything above in ten minutes, use the sheet below. <b>→ next: Revision Sheet, then 13 Questions &amp; Answers</b></div>

  <h2 id="tm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: Pine View homestay, Manali, daily guests 2014–2018; every Sunday night (origin T) forecast Mon–Sun (h = 1…7). Hand week: origin Sun 4 March 2018.</p>
  <table class="tbl">
    <tr><th></th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr>
    <tr><td>19–25 Feb</td><td>27</td><td>29</td><td>26</td><td>27</td><td>33</td><td>31</td><td>29</td></tr>
    <tr><td>26 Feb – 4 Mar = seasonal naive</td><td>23</td><td>24</td><td>24</td><td>25</td><td>31</td><td>34</td><td>25</td></tr>
    <tr><td>5–11 Mar actual</td><td>29</td><td>28</td><td>27</td><td>25</td><td>31</td><td>34</td><td>29</td></tr>
    <tr><td>error (snaive)</td><td>6</td><td>4</td><td>3</td><td>0</td><td>0</td><td>0</td><td>4</td></tr>
  </table>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Baselines</strong>: what would no model say? Naive 4.00, seasonal naive 2.43, mean of 2 weeks 1.86 (MAE, that week).</li>
    <li><strong>Metrics</strong>: how good, on what scale? MAE 2.43, RMSE 3.32, MAPE 8.55%, WAPE 8.37%, MASE 0.98.</li>
    <li><strong>Supervised framing</strong>: how can a regressor learn? One row per day, features known at T: 2018 MAE 2.57 vs 2.77.</li>
    <li><strong>Features</strong>: what goes in the table? asfreq, lags ≥ h, shift→roll, cycles, y − roll7: 2.16.</li>
    <li><strong>Leakage</strong>: is the score honest? Four leaks faked 2.08–2.35.</li>
    <li><strong>Time-series CV</strong>: reliably better? 2.32 ± 0.29 vs 2.56 ± 0.30 over six 8-week folds.</li>
    <li><strong>Multi-step</strong>: use fresh days for near horizons: recursive 2.25, direct 2.32.</li>
    <li><strong>Global</strong>: learn across homes: Ooty 1.18 → 0.96.</li>
    <li><strong>Quantiles</strong>: plan for risk: pinball loss, P10/P50/P90, coverage check.</li>
    <li><strong>vs classical</strong>: Prophet 1.71, SARIMAX 1.89, LightGBM 2.15, Holt-Winters 2.16, snaive 2.77 on this one clean series.</li>
  </ol>
  <h3>Key definitions</h3>
  <ul>
    <li><strong>Forecast origin</strong> T: the last time whose value is known when forecasting; <strong>horizon</strong> h: how many steps after T.</li>
    <li><strong>Lag feature</strong>: y<sub>t−k</sub> used to predict y<sub>t</sub>; legal only if k ≥ h. <strong>Rolling feature</strong>: a statistic of a shifted window.</li>
    <li><strong>Known-future variable</strong>: a driver whose future values are known at T (planned events, set prices).</li>
    <li><strong>Temporal leakage</strong>: any use of information not available at T, through features, preprocessing, splits or revised data.</li>
    <li><strong>Time-series CV</strong>: folds with training strictly before testing (expanding or sliding windows, optional gap).</li>
    <li><strong>Recursive</strong> strategy: one 1-step model iterated on its own forecasts. <strong>Direct</strong>: one model per horizon.</li>
    <li><strong>Global model</strong>: one model fitted on the pooled rows of many series. <strong>Local</strong>: one per series.</li>
    <li><strong>Pinball loss</strong>: the loss minimised by the q-quantile; <strong>coverage</strong>: observed share of actuals at or below a quantile forecast.</li>
  </ul>
  <h3>Every formula</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Formula</th><th>Symbols</th><th>By hand</th></tr>
    <tr><td>Seasonal naive</td><td>ŷ<sub>T+h</sub> = y<sub>T+h−m</sub></td><td>m = 7</td><td>Mon 5 Mar = 23</td></tr>
    <tr><td>MAE / RMSE</td><td>mean|e| / √mean e²</td><td>e = y − ŷ</td><td>17/7 = 2.43 / √11 = 3.32</td></tr>
    <tr><td>MAPE / WAPE</td><td>mean(|e|/y) / Σ|e|/Σy</td><td></td><td>8.55% / 17/203 = 8.37%</td></tr>
    <tr><td>MASE</td><td>MAE / mean<sub>train</sub>|y<sub>t</sub> − y<sub>t−m</sub>|</td><td>in-sample scale</td><td>2.43/2.48 = 0.98</td></tr>
    <tr><td>Lag / rolling</td><td>y<sub>t−k</sub>, k ≥ h; mean(y<sub>t−h</sub>…y<sub>t−h−w+1</sub>)</td><td>w = window</td><td>roll7(5 Mar) = 198/7 = 28.29</td></tr>
    <tr><td>Cyclic encoding</td><td>sin(2πd/365.25), cos(2πd/365.25)</td><td>d = day of year</td><td>31 Dec (−0.004, 1.000), 1 Jan (0.017, 1.000)</td></tr>
    <tr><td>Trend-free target</td><td>z = y − roll7; ŷ = ẑ + roll7</td><td></td><td>2.57 → 2.45 (base features)</td></tr>
    <tr><td>Recursive</td><td>ŷ<sub>t+1</sub> = f(y<sub>t</sub>, …), fed back</td><td>one f</td><td>toy 0.5·yesterday + 0.5·last week: 24, 24, 24, 24.5, 27.75, 30.875, 27.94</td></tr>
    <tr><td>Direct</td><td>ŷ<sub>t+h</sub> = f<sub>h</sub>(y<sub>t</sub>, …)</td><td>H models</td><td>2.32 over 52 Sundays</td></tr>
    <tr><td>Global scaling</td><td>target y/level, level = mean(y<sub>t−7</sub>…y<sub>t−34</sub>)</td><td></td><td>Manali 34/28.18 = 1.21; Mussoorie 17/12.68 = 1.34</td></tr>
    <tr><td>Pinball</td><td>max(q·e, (q − 1)·e)</td><td>q = quantile</td><td>q 0.9: snaive 2.19, snaive + 5 0.40</td></tr>
    <tr><td>Best quantile</td><td>q = c<sub>u</sub> / (c<sub>u</sub> + c<sub>o</sub>)</td><td>costs of under / over</td><td>900/(900 + 100) = 0.9</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Lags ≥ H, one model</b><p>Simplest honest setup; good when the horizon is short relative to the season.</p><small>Ignores the freshest days</small></div>
    <div><b>Recursive</b><p>Series with short-term memory; one model to maintain.</p><small>Errors propagate; rebuild features from forecasts</small></div>
    <div><b>Direct</b><p>When errors snowball recursively, or features are hard to rebuild.</p><small>H models</small></div>
    <div><b>Global LightGBM</b><p>Many related series, new or short series, rich drivers.</p><small>Scale; group lags by series</small></div>
    <div><b>Quantile models</b><p>Decisions with uneven costs: staffing, stock, capacity.</p><small>Check coverage</small></div>
    <div><b>Classical instead</b><p>One clean series, few rare events, need intervals quickly.</p><small>Previous notes</small></div>
  </div>
  <h3>The traps to remember</h3>
  <ul>
    <li>Ask of every feature: "would I have this number at the origin?" Shift before rolling; lags ≥ horizon; no group stats over future days.</li>
    <li>Split by time; <code>cv=TimeSeriesSplit(...)</code> everywhere; never shuffle.</li>
    <li><code>asfreq</code> before <code>shift</code>; group by series before <code>shift</code>.</li>
    <li>Trees cannot extrapolate: transform the target. Trees need many examples of an event.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <details class="qa"><summary><span class="qmark">Q</span>Actuals 10, 20; forecasts 12, 15. MAE, RMSE, WAPE?</summary><div class="qa-body">Errors −2, 5. MAE 3.5; RMSE √((4 + 25)/2) = 3.81; WAPE 7/30 = 23.3%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Horizon 14 days, one model. Smallest allowed lag?</summary><div class="qa-body">14 (and rolling features must be shifted by at least 14).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Model MAE 3.0, in-sample seasonal-naive MAE 2.5. MASE, and verdict?</summary><div class="qa-body">1.2: worse than seasonal naive's usual error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>q = 0.8, actual 10, forecast 12. Pinball loss?</summary><div class="qa-body">Over-forecast by 2: (1 − 0.8) × 2 = 0.4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recursive or direct: which uses its own forecasts as inputs?</summary><div class="qa-body">Recursive.</div></details>

  <h2 id="tm-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Can you answer, with numbers, the forecasting questions an interviewer asks, and connect them to the classical models and the rest of the ML track?</p></div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you turn a time series into a supervised learning problem?</summary><div class="qa-body">One row per time step (per series); target = the value at that step; features = information available at the forecast origin: lags y<sub>t−k</sub> with k ≥ horizon, shifted rolling statistics, calendar features, known-future drivers (planned events, prices), series attributes. Then fit any regressor, split by time, and back-test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Build by hand the lag7 and roll7 features for Monday 5 March given last two weeks 27 29 26 27 33 31 29 / 23 24 24 25 31 34 25.</summary><div class="qa-body">lag7 = last Monday = 23. roll7 = mean of y<sub>t−7</sub>…y<sub>t−13</sub> = Tue 20 Feb … Mon 26 Feb = (29 + 26 + 27 + 33 + 31 + 29 + 23)/7 = 198/7 = 28.29. Both are at least 7 days old, so they are known on Sunday 4 March.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name four ways leakage enters a forecasting model and the fix for each.</summary><div class="qa-body">(1) Rolling features without a shift (fix: shift by the horizon first). (2) Lags shorter than the horizon (fix: lags ≥ h, recursive or direct). (3) Statistics over periods that include the future, e.g. this month's mean or a scaler fit on all data (fix: compute on training data / lagged data, inside a pipeline). (4) Random or KFold splits (fix: time-ordered splits). Also: actual values of drivers you will only have as forecasts, and revised data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain expanding vs sliding windows and the gap parameter in TimeSeriesSplit.</summary><div class="qa-body">Expanding: each fold trains on everything before its cut-off, so training grows. Sliding (<code>max_train_size</code>): only the most recent L rows, when old data is no longer representative. <code>gap</code> leaves rows unused between training and test, for data that arrives late or features that need a buffer. In all cases test rows come strictly after training rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recursive vs direct multi-step forecasting: trade-offs, and which won on Pine View?</summary><div class="qa-body">Recursive: one 1-step model, iterated by feeding forecasts back; simple, coherent paths, but errors propagate and future features must be rebuilt from forecasts. Direct: one model per step; no propagation, more models and training, possibly inconsistent across h. On 52 Sundays of 2018: recursive 2.25, direct 2.32, seasonal naive 2.77; equal at h = 1 (same model).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a LightGBM model forecast beyond its training range, and how do you fix it?</summary><div class="qa-body">Each tree predicts constants learned from training rows in a leaf, so the sum of trees is bounded by what was seen; on a growing series the forecast flattens below the new level (Pine View 2018 reached 43 vs a training max of 39). Fix: model a trend-free target (y − rolling mean, y / level, differences, log ratio) and add the level back, or use a linear component (<code>linear_tree</code>) or a hybrid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a global model, why does it often beat local models, and what must you do to make it work?</summary><div class="qa-body">One model trained on all series' rows. It sees far more data, learns shared patterns (weekends, seasons, price effects) and lets short series borrow them: Ooty with 164 rows went from 1.18 (local) to 0.96 (global). Requirements: scale each series (divide by its level or use logs), build lags per series, include a series identifier or attributes, split all series by the same date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define MASE and WAPE. Why prefer them over MAPE for a retail chain?</summary><div class="qa-body">MASE = MAE / in-sample MAE of seasonal naive: scale-free, &lt; 1 beats the baseline, works with zeros. WAPE = Σ|e|/Σy: total error as a share of total volume, weights big sellers more, robust to small values. MAPE divides each error by its own actual, so small or zero sales explode it, and it rewards under-forecasting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the q = 0.9 pinball loss for actuals 29, 28 and forecasts 30, 25. What quantile should you forecast if a stock-out costs ₹400 and waste ₹100?</summary><div class="qa-body">Errors −1 (over) and +3 (under): 0.1 × 1 = 0.1 and 0.9 × 3 = 2.7; mean 1.4. Best quantile q = 400/(400 + 100) = 0.8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your quantile model's P90 is above the actual on only 82% of test days. What does that mean and what can you do?</summary><div class="qa-body">The P90 is too low (miscalibrated), here because the test year is busier than training. Options: recalibrate with back-test residuals (shift the quantile by the needed amount), use a trend-free target, conformal prediction for guaranteed coverage, or retrain more often. Also sort quantiles to remove crossing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: on Pine View, Prophet (1.71) and SARIMAX (1.89) beat LightGBM (2.15). Why, and when would the order flip?</summary><div class="qa-body">One series whose structure (smooth trend, smooth seasons, weekly pattern, a rare event, independent noise) matches the classical models' assumptions; the carnival happened only twice in training, which a linear coefficient learns but trees cannot (carnival-week MAE 5.33 vs 0.99). The order flips with many related series (global learning), rich non-linear drivers (price × promotion × weather), many event examples, and long histories: the M5 setting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are lag features related to ARIMA, and an EWM feature to exponential smoothing?</summary><div class="qa-body">An AR(p) model is a linear regression of y<sub>t</sub> on lags y<sub>t−1</sub>…y<sub>t−p</sub>; a lag-feature model is the same idea with a flexible learner and extra features. <code>y.shift(h).ewm(alpha).mean()</code> is the simple exponential smoothing level computed h steps back, so an ML model with EWM features contains SES as an input (see <a class="xref" data-note="ml_arima">ARIMA Family</a> and <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does time-series CV differ from the cross-validation in the foundations notes?</summary><div class="qa-body">Ordinary k-fold (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>) assumes rows are exchangeable and shuffles or rotates them. Time series rows are ordered and correlated, so folds must respect time: train strictly before test, expanding or sliding windows, optional gap. Hyperparameter search must use the same splitter, and a final untouched period gives the last check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design: you must forecast daily demand for 5,000 products in 200 stores, 28 days ahead. Outline the approach.</summary><div class="qa-body">Baselines first (seasonal naive, moving averages) with WAPE and MASE. Long table (store, item, date) with per-series lags ≥ 28 (or direct models for h buckets), shifted rolling means/stds, calendar, events, planned prices and promotions, item/store attributes; target scaled per series. Global LightGBM (one per store or category if large), tuned with rolling-origin CV by date. Quantile models or empirical intervals for safety stock. Point-in-time features, monitoring of live vs back-test error, regular retraining, and an ETS fallback for new or very sparse series.</div></details>
</main>
`
});
