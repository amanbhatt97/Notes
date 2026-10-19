// ml/ml_timeseries.js — Time Series Forecasting
Object.assign(TOPIC_CONTENT, {
  "ml_timeseries": `<main>
  <h1>Time Series Forecasting</h1>
  <p class="lead">How to predict the next values of something measured over time: daily orders, website traffic, monthly revenue, electricity load, sensor readings. It builds on regression and cross-validation, and adds two new rules that change everything: the order of rows is the information, and nothing from the future may leak into training.</p>

  <h2 id="ts-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Time Series Forecasting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why it's different</div>
        <ul>
          <li><b>Order matters</b> — rows are in time order; never shuffle</li>
          <li><b>Autocorrelation</b> — today is linked to yesterday; corr(y, y.shift(1)) = 0.97 here, 0.0 after shuffling</li>
          <li><b>Horizon</b> — how far ahead you predict; decides which inputs you will really have</li>
          <li><b>Leakage</b> — future info gets into training; scores look great, live fails</li>
          <li>⚠ <b>Quiet leaks</b> — rolling mean that includes today, scaler fit on all data, late-arriving features</li>
          <li>💡 Grading a weather forecaster who already has tomorrow's paper</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Components</div>
        <ul>
          <li><b>Trend</b> — long-run direction · <b>Seasonality</b> — repeats every fixed period (12 monthly, 7 daily)</li>
          <li><b>Cycle</b> — ups and downs with no fixed period · <b>Noise</b> — leftover randomness</li>
          <li><b>Additive</b> y = T+S+R (same-size swing) vs <b>multiplicative</b> T×S×R (swing grows) → take log</li>
          <li><b>Trend by hand</b> — centred moving average over one full season</li>
          <li><b>Tools</b> — <code>seasonal_decompose</code>; <b>STL</b> (robust, no NaN edges, preferred)</li>
          <li>⚠ Centred trend uses future values: use to understand, not as a feature</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stationarity</div>
        <ul>
          <li><b>Stationary</b> — mean, spread and autocorrelation stay the same over time</li>
          <li><b>Why</b> — ARIMA learns fixed rules; the rules must not drift</li>
          <li><b>Differencing</b> — <code>y.diff()</code> removes trend (d); <code>diff(12)</code> removes season (D)</li>
          <li><b>ADF</b> — H₀ = non-stationary; p &lt; 0.05 → stationary. Raw p=0.92 → diff p=0.000</li>
          <li><b>KPSS</b> — opposite H₀ (stationary); small p → NOT stationary</li>
          <li>⚠ <b>Over-differencing</b> — MA coefficient ≈ −1 is the hint</li>
          <li>💡 Cricket: run rate per over, not the total score</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ACF / PACF</div>
        <ul>
          <li><b>ACF</b> — correlation of the series with itself k steps back</li>
          <li><b>PACF</b> — same, after removing the steps in between</li>
          <li><b>Noise band</b> — ±1.96/√n; bars outside it are real</li>
          <li><b>AR(p)</b> — PACF stops after p · <b>MA(q)</b> — ACF stops after q</li>
          <li><b>Spike at s, 2s</b> — seasonal term · ACF fades very slowly → difference more</li>
          <li>Example: ACF spikes at 1 and 12 → SARIMA(0,1,1)(0,1,1,12), the "airline model"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classical models</div>
        <ul>
          <li><b>Baselines</b> — naive (last value), seasonal naive (same month last year), moving average</li>
          <li><b>ARIMA(p,d,q)</b> — p past values, d differences, q past errors</li>
          <li><b>SARIMA</b> — + (P,D,Q,s) seasonal part · <b>SARIMAX</b> — + outside inputs (price, holidays)</li>
          <li><b>Choosing orders</b> — ACF/PACF or lowest <b>AIC</b> (517.5 beat 548.6)</li>
          <li><b>Prophet</b> — trend + seasonality + holidays as a curve over the calendar; needs <code>ds</code>, <code>y</code></li>
          <li>Prophet good: daily business data, holidays, gaps · weak: short-term wiggles (no lags)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ML approach</div>
        <ul>
          <li><b>Features</b> — lags, shifted rolling stats, calendar, inputs known in advance</li>
          <li><b>Rule</b> — lag ≥ horizon; shift <em>before</em> rolling</li>
          <li><b>Strategies</b> — recursive (errors pile up), direct (one model per step), lags ≥ horizon</li>
          <li>⚠ <b>Trees can't extrapolate</b> — y = 2t fit to t ≤ 99 predicts 193 forever; predict y − lag12 and add back</li>
          <li><b>Global model</b> — one LightGBM over many series wins at scale (M5)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Validation</div>
        <ul>
          <li><b>Expanding window</b> — <code>TimeSeriesSplit(n_splits, test_size)</code>; train always before test</li>
          <li><b>Sliding window</b> — <code>max_train_size</code> when old data is out of date</li>
          <li><b>Gap</b> — <code>gap=</code> when features arrive late</li>
          <li>⚠ Shuffled K-fold MAE 4.40 vs honest time split 9.11: the shuffle lies</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics</div>
        <ul>
          <li><b>MAE</b> — mean |e|, same units · <b>RMSE</b> — punishes big misses</li>
          <li><b>MAPE</b> — mean |e/actual|; ⚠ blows up near 0, favours low forecasts</li>
          <li><b>sMAPE</b> — 0–200% · <b>WAPE</b> — Σ|e| / Σ|a|</li>
          <li><b>MASE</b> — MAE ÷ naive MAE on train; &lt; 1 beats the baseline; no units</li>
          <li><b>Uneven costs</b> — pinball loss, forecast P90</li>
          <li>Demo: SARIMA MASE 0.40, Prophet 0.35, seasonal naive 1.13</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ts-diff"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Time Series Is Different</span><span class="rm-sub">Order, autocorrelation, leakage</span></div></div>
      <div class="rm-item rm-done" data-target="ts-decomp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Components &amp; Decomposition</span><span class="rm-sub">Trend + season + noise</span></div></div>
      <div class="rm-item rm-done" data-target="ts-stat"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Stationarity &amp; Differencing</span><span class="rm-sub">ADF test, d and D</span></div></div>
      <div class="rm-item rm-done" data-target="ts-acf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ACF &amp; PACF</span><span class="rm-sub">Reading the correlograms</span></div></div>
      <div class="rm-item rm-done" data-target="ts-models"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Baselines, ARIMA, Prophet</span><span class="rm-sub">Classical forecasters</span></div></div>
      <div class="rm-item rm-done" data-target="ts-ml"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ML with Lag Features</span><span class="rm-sub">Gradient boosting for forecasting</span></div></div>
      <div class="rm-item rm-done" data-target="ts-cv"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Time-Series Cross-Validation</span><span class="rm-sub">Expanding window, never shuffle</span></div></div>
      <div class="rm-item rm-done" data-target="ts-metrics"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Forecast Metrics</span><span class="rm-sub">MAE, RMSE, MAPE trap, MASE</span></div></div>
      <div class="rm-item rm-done" data-target="ts-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It: The Leaderboard</span><span class="rm-sub">Seven models, one holdout</span></div></div>
      <div class="rm-item rm-done" data-target="ts-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leaks, shuffles, wrong metric</span></div></div>
      <div class="rm-item rm-done" data-target="ts-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ts-diff"><span class="num">01</span>Why Time Series Is Different</h2>
  <p>In ordinary machine learning each row is a separate thing: one house, one loan applicant, one email. You can shuffle the rows, split them randomly into train and test, and nothing breaks. Nobody cares if house number 7 comes before house number 3.</p>
  <p>Now think of a dairy that wants to know how many litres of milk to send to a shop tomorrow. Its data is one number per day: litres sold. Here the order <em>is</em> the information. Yesterday's sales tell you a lot about today. If you shuffle the days, you destroy the pattern you wanted to learn. And you can only ever use the past to predict the future, because on the day you forecast, the future has not happened yet.</p>
  <p>A <strong>time series</strong> is just that: values measured at regular steps in time (every day, every month, every second). <strong>Forecasting</strong> means predicting the next values. The <strong>horizon</strong> is how far ahead you predict: "tomorrow" is horizon 1, "next 12 months" is horizon 12.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Grading a weather forecaster who has tomorrow's newspaper hidden on the desk. Every forecast looks perfect, and every score is fake. In time series, a careless train/test split puts tomorrow's newspaper on the model's desk.</p>
  </div>
  <p>Let's prove "today is linked to yesterday" with numbers. First we build the example used on this whole page: 10 years of made-up monthly sales. It grows by 0.8 per month (trend), has a yearly wave of ±15 (season, say a festival peak), and random noise with standard deviation 4.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
rng = np.random.default_rng(42)
t = np.arange(120)                                           # month number 0..119
idx = pd.date_range("2015-01-01", periods=120, freq="MS")   # MS = month start
y = pd.Series(100 + 0.8*t + 15*np.sin(2*np.pi*t/12) + rng.normal(0, 4, 120),
              index=idx, name="sales")
print(y.head(3).round(1))
print("corr with yesterday:", round(y.corr(y.shift(1)), 2))
shuf = pd.Series(rng.permutation(y.values), index=y.index)   # same values, random order
print("after shuffling   :", round(shuf.corr(shuf.shift(1)), 2))</div>
  <div class="fx" data-lang="text">2015-01-01    101.2
2015-02-01    104.1
2015-03-01    117.6
Freq: MS, Name: sales, dtype: float64
corr with yesterday: 0.97
after shuffling   : -0.0</div>
  <p>The first three lines are the series: a date index and a sales number. <code>y.shift(1)</code> slides every value down one row, so each month sits next to the month before it. <code>y.corr(...)</code> then measures how closely the two move together: 0.97 is almost perfect. After <code>rng.permutation</code> shuffles the same 120 numbers, the link drops to 0. Same data, different order, the pattern is gone. That link between a value and its own past is called <strong>autocorrelation</strong>, and it is why rows in a time series are not independent.</p>
  <table class="tbl">
    <tr><th></th><th>Ordinary tabular ML</th><th>Time series</th></tr>
    <tr><td>Row order</td><td>Doesn't matter; shuffle freely</td><td>The order <em>is</em> the information</td></tr>
    <tr><td>Rows independent?</td><td>Assumed (i.i.d. = independent and identically distributed)</td><td>No: today depends on yesterday (<strong>autocorrelation</strong>)</td></tr>
    <tr><td>Validation</td><td>Random K-fold</td><td>Train on past, test on future only</td></tr>
    <tr><td>Biggest risk</td><td>Overfitting</td><td><strong>Leakage</strong>: future info sneaks into training</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leakage</strong>: any information in training or features that would not be available at the moment the real forecast is made. It makes offline scores look better than the model can ever do live.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: quiet leakage</span>
    <p>Random splits are not the only leak. A rolling mean that includes today, a scaler fit on the whole series (including the test months), or a feature known only later (final monthly revenue, published on the 10th of next month) all leak too. Ask of every column: "at 9 a.m. on forecast day, would I really have this number?"</p>
  </div>
  <p>Where you meet this: demand planning at Flipkart or BigBasket, Swiggy delivery-partner staffing, server capacity planning, cash forecasting in fintech, electricity load for a state grid. In interviews, "why can't you use random K-fold here?" is asked almost every time a time series comes up.</p>

  <h2 id="ts-decomp"><span class="num">02</span>Components &amp; Decomposition</h2>
  <p>Look at a sales chart and you see one wiggly line. But that line is several different stories added together. Sales slowly climb because the business grows. They jump every October because of Diwali. And they jump around a bit for no reason. If you try to model the wiggly line as one thing, you will mix these stories up. If you pull them apart first, each one is simple.</p>
  <p><strong>Decomposition</strong> splits a series into parts:</p>
  <div class="cards">
    <div><b>Trend</b><p>The slow, long-run direction.</p><small>Growing user base</small></div>
    <div><b>Seasonality</b><p>A pattern that repeats every fixed period.</p><small>Diwali spike, weekend dip</small></div>
    <div><b>Cycle</b><p>Rises and falls with <em>no</em> fixed period.</p><small>Business cycles, recessions</small></div>
    <div><b>Noise (residual)</b><p>What's left; can't be predicted.</p><small>Should look like random scatter</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An ice-cream shop in Jaipur. Trend: the city grows, so every year is a bit busier. Season: every May is high, every December low. Noise: one Sunday it rained and sales fell. The owner already thinks in these three parts without naming them.</p>
  </div>
  <h3>A tiny worked example by hand</h3>
  <p>Eight quarters of sales, with a season length of 4 (one year = 4 quarters): <code>20, 30, 50, 40, 24, 34, 54, 44</code>. Q3 is always the peak.</p>
  <ol>
    <li><strong>Trend</strong> = the average over one full season, centred on the point. For 2022-Q3 we average the four quarters around it. Because 4 is even, the two end quarters count half: (20/2 + 30 + 50 + 40 + 24/2) / 4 = 142 / 4 = <strong>35.5</strong>. One full season averages out the seasonal ups and downs, leaving only the level.</li>
    <li><strong>Detrend</strong>: 50 − 35.5 = 14.5. So Q3 sits 14.5 above trend.</li>
    <li><strong>Seasonal</strong> = the average detrended value for each quarter across years. Q3 → +14.5, Q4 → 40 − 36.5 = +3.5, Q1 → 24 − 37.5 = −13.5, Q2 → 34 − 38.5 = −4.5. They add to 0.</li>
    <li><strong>Residual</strong> = y − trend − seasonal. Here 0, because the toy data has no noise.</li>
  </ol>
  <p>The code does exactly these steps with <code>seasonal_decompose</code> from statsmodels (a statistics library for Python):</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.seasonal import seasonal_decompose
q = pd.Series([20, 30, 50, 40, 24, 34, 54, 44],
              index=pd.period_range("2022Q1", periods=8, freq="Q"))
dq = seasonal_decompose(q, model="additive", period=4)
print(pd.DataFrame({"y": q, "trend": dq.trend, "seasonal": dq.seasonal,
                    "resid": dq.resid}).round(2))</div>
  <div class="fx" data-lang="text">         y  trend  seasonal  resid
2022Q1  20    NaN     -13.5    NaN
2022Q2  30    NaN      -4.5    NaN
2022Q3  50   35.5      14.5    0.0
2022Q4  40   36.5       3.5    0.0
2023Q1  24   37.5     -13.5    0.0
2023Q2  34   38.5      -4.5    0.0
2023Q3  54    NaN      14.5    NaN
2023Q4  44    NaN       3.5    NaN</div>
  <p>The numbers match the hand calculation. Notice the <code>NaN</code> (missing) values at both ends: the centred average needs two quarters before <em>and</em> two after, and the edges do not have them. <code>period=4</code> tells it the season length; <code>model="additive"</code> means y = trend + seasonal + residual.</p>
  <p>Now the real 10-year monthly series, with <code>period=12</code>:</p>
  <figure class="viz"><svg viewBox="0 0 560 300" width="560">
<text x="4" y="40">observed</text>
<line x1="90" y1="70" x2="550" y2="70" stroke="currentColor" opacity=".2"/>
<polyline points="90,56 96,54 103,45 109,42 116,51 122,53 129,53 135,59 142,62 148,65 155,58 161,54 168,50 174,42 181,39 187,41 194,38 200,45 207,45 213,52 220,56 226,58 233,51 239,50 245,45 252,39 258,32 265,31 271,31 278,35 284,35 291,46 297,50 304,52 310,46 317,40 323,37 330,34 336,29 343,23 349,24 356,28 362,36 369,38 375,41 382,42 388,38 395,36 401,29 407,24 414,19 420,17 427,23 433,23 440,28 446,34 453,36 459,32 466,36 472,27 479,28 485,19 492,13 498,10 505,10 511,14 518,21 524,26 531,26 537,30 544,31 550,26" fill="none" class="sb" stroke-width="1.6"/>
<text x="4" y="112">trend</text>
<line x1="90" y1="142" x2="550" y2="142" stroke="currentColor" opacity=".2"/>
<polyline points="129,137 135,136 142,135 148,134 155,133 161,132 168,131 174,130 181,129 187,128 194,127 200,126 207,126 213,125 220,125 226,124 233,123 239,121 245,120 252,119 258,118 265,118 271,117 278,116 284,115 291,114 297,114 304,113 310,112 317,111 323,111 330,110 336,109 343,108 349,107 356,106 362,105 369,104 375,103 382,102 388,101 395,101 401,100 407,100 414,99 420,98 427,97 433,97 440,96 446,96 453,95 459,94 466,93 472,91 479,90 485,90 492,88 498,88 505,87 511,87 518,86 524,85 531,84 537,83 544,83 550,82" fill="none" class="st" stroke-width="1.6"/>
<text x="4" y="184">seasonal</text>
<line x1="90" y1="214" x2="550" y2="214" stroke="currentColor" opacity=".2"/>
<polyline points="90,185 96,170 103,158 109,154 116,159 122,168 129,179 135,196 142,205 148,209 155,205 161,195 168,185 174,170 181,158 187,154 194,159 200,168 207,179 213,196 220,205 226,209 233,205 239,195 245,185 252,170 258,158 265,154 271,159 278,168 284,179 291,196 297,205 304,209 310,205 317,195 323,185 330,170 336,158 343,154 349,159 356,168 362,179 369,196 375,205 382,209 388,205 395,195 401,185 407,170 414,158 420,154 427,159 433,168 440,179 446,196 453,205 459,209 466,205 472,195 479,185 485,170 492,158 498,154 505,159 511,168 518,179 524,196 531,205 537,209 544,205 550,195" fill="none" class="sg" stroke-width="1.6"/>
<text x="4" y="256">residual</text>
<line x1="90" y1="286" x2="550" y2="286" stroke="currentColor" opacity=".2"/>
<polyline points="129,257 135,259 142,256 148,267 155,239 161,245 168,250 174,237 181,254 187,276 194,254 200,277 207,249 213,256 220,258 226,265 233,235 239,261 245,260 252,264 258,254 265,257 271,253 278,255 284,231 291,266 297,267 304,270 310,247 317,241 323,253 330,267 336,273 343,251 349,247 356,252 362,275 369,254 375,258 382,256 388,244 395,255 401,240 407,253 414,255 420,250 427,281 433,264 440,268 446,262 453,257 459,226 466,266 472,241 479,278 485,260 492,259 498,252 505,245 511,244 518,265 524,261 531,241 537,256 544,274 550,272" fill="none" class="sr" stroke-width="1.6"/>
</svg><figcaption>First 6 years of the series split into its parts. Observed = trend + seasonal + residual. The trend line starts late because of the NaN edge.</figcaption></figure>
  <div class="fx" data-lang="py">from statsmodels.tsa.seasonal import STL
dec = seasonal_decompose(y, model="additive", period=12)
print(pd.DataFrame({"trend": dec.trend, "seasonal": dec.seasonal,
                    "resid": dec.resid}).iloc[6:9].round(1))
print("NaN in trend:", int(dec.trend.isna().sum()))
stl = STL(y, period=12, robust=True).fit()          # robust = outliers get less weight
print(pd.DataFrame({"trend": stl.trend, "seasonal": stl.seasonal,
                    "resid": stl.resid}).iloc[6:9].round(1))
print("NaN in STL trend:", int(stl.trend.isna().sum()))</div>
  <div class="fx" data-lang="text">            trend  seasonal  resid
2015-07-01  104.2       1.4   -0.3
2015-08-01  105.3      -7.9   -0.6
2015-09-01  106.4     -13.2    0.1
NaN in trend: 12
            trend  seasonal  resid
2015-07-01  104.3       1.9   -1.0
2015-08-01  105.2      -8.3   -0.1
2015-09-01  106.1     -13.7    0.9
NaN in STL trend: 0</div>
  <p>In these rows the trend climbs about 1.1 per month (the true slope is 0.8; noise bends short stretches of it), and September sits about 13 below trend every year. <code>seasonal_decompose</code> loses 6 months at each end (12 NaN). <strong>STL</strong> (Seasonal-Trend decomposition using Loess, a local smoothing method) gives nearly the same parts, fills the edges, lets the seasonal shape change slowly over years, and with <code>robust=True</code> stops one crazy month from bending everything. Prefer STL in practice.</p>
  <ul>
    <li><strong>Additive</strong> (y = T + S + R): the seasonal swing stays the same size as the series grows. Our series is additive: always ±15.</li>
    <li><strong>Multiplicative</strong> (y = T × S × R): the swing grows with the level. Diwali adds 20% to sales, and 20% of a bigger business is a bigger jump. Take <code>np.log(y)</code> and it becomes additive, because log turns × into +.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Seasonal period</strong> (s or m): the number of steps after which the pattern repeats. Monthly data with a yearly pattern: 12. Daily data with a weekly pattern: 7. Hourly with a daily pattern: 24.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The centred trend at month t uses 6 months <em>after</em> t. Use decomposition to <em>understand</em> the data and pick a model, never as a feature for forecasting: at forecast time those future months do not exist.</p>
  </div>

  <h2 id="ts-stat"><span class="num">03</span>Stationarity &amp; Differencing</h2>
  <p>Classical models like ARIMA learn fixed rules such as "next month ≈ this month + 0.6 × last change". A fixed rule can only work on the future if the series keeps behaving the same way. But our sales average 124 in the first five years and 171 in the next five. A model fit on "typical level ≈ 124" is lost when the level is 171. The old data describes a different world.</p>
  <p>The fix is to stop modelling the level and model the <em>change</em> instead. "How much did sales move from last month?" is about the same size in year 1 and year 10.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>In a T20 match the total score keeps climbing, so "120" means nothing alone: is it the 10th over or the 20th? Runs per over moves up and down around a steady level of about 8. Differencing turns the total score into runs per over.</p>
  </div>
  <p><strong>Worked example.</strong> A running total of 100, 103, 105, 109, 112, 114. Subtract each value from the one before:</p>
  <table class="tbl out"><caption>Differencing step by step</caption>
    <tr><th>step</th><th>total</th><th>diff(1) = total − previous</th></tr>
    <tr><td>0</td><td>100</td><td>(nothing before it) NaN</td></tr>
    <tr><td>1</td><td>103</td><td>103 − 100 = 3</td></tr>
    <tr><td>2</td><td>105</td><td>105 − 103 = 2</td></tr>
    <tr><td>3</td><td>109</td><td>4</td></tr>
    <tr><td>4</td><td>112</td><td>3</td></tr>
    <tr><td>5</td><td>114</td><td>2</td></tr>
  </table>
  <p>The totals climb without limit. The differences wobble around 3. That wobbling-around-a-fixed-level shape is what <strong>stationary</strong> means.</p>
  <figure class="viz"><svg viewBox="0 0 520 120" width="520">
    <text x="10" y="14">non-stationary (trend)</text>
    <line x1="10" y1="100" x2="240" y2="100" stroke="currentColor" opacity="0.4"/>
    <polyline points="10,92 30,88 50,90 70,80 90,82 110,70 130,72 150,60 170,62 190,48 210,50 230,36" fill="none" class="sr" stroke-width="2"/>
    <line x1="10" y1="96" x2="230" y2="40" class="sr" stroke-dasharray="4 3" opacity="0.6"/>
    <text x="270" y="14">after diff(1): stationary</text>
    <line x1="270" y1="64" x2="500" y2="64" class="sg" stroke-dasharray="4 3"/>
    <polyline points="270,62 290,70 310,56 330,72 350,58 370,66 390,54 410,70 430,60 450,68 470,56 490,66" fill="none" class="sg" stroke-width="2"/>
    <text x="385" y="100" text-anchor="middle" class="tm">mean stays flat, swing same size</text>
  </svg><figcaption>Left: the average keeps rising, so old data describes a different level. Right: the month-to-month change wobbles around one fixed mean.</figcaption></figure>
  <p>The code checks this on our 10-year series in two ways: by eye (compare the mean of the first and second half) and with a formal test.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import adfuller, kpss
d1 = y.diff()                                   # this month minus last month
print("raw   : mean 1st half", round(y[:60].mean(), 1), " 2nd half", round(y[60:].mean(), 1))
print("diff 1: mean 1st half", round(d1[1:60].mean(), 2), " 2nd half", round(d1[60:].mean(), 2))
for name, s in [("raw", y), ("diff(1)", y.diff().dropna()),
                ("diff(1)+diff(12)", y.diff().diff(12).dropna())]:
    stat, p, *_ = adfuller(s)
    print(f"{name:18s} ADF={stat:7.2f}  p={p:.4f}")</div>
  <div class="fx" data-lang="text">raw   : mean 1st half 123.9  2nd half 170.9
diff 1: mean 1st half 0.72  2nd half 0.72
raw                ADF=  -0.31  p=0.9248
diff(1)            ADF=  -7.54  p=0.0000
diff(1)+diff(12)   ADF=  -5.03  p=0.0000</div>
  <p>The raw halves differ by 47; the differenced halves are both 0.72 (the monthly growth, close to the true 0.8). <code>y.diff()</code> subtracts the previous value; <code>dropna()</code> removes the first NaN. <code>adfuller</code> runs the <strong>ADF test</strong> (Augmented Dickey-Fuller). Its starting assumption, the null hypothesis H₀, is "this series is non-stationary". A small p-value (below 0.05) means "that assumption is very unlikely", so we call it stationary. Raw: p = 0.92, we cannot reject, non-stationary. After one difference: p ≈ 0, stationary.</p>
  <p><code>diff(12)</code> subtracts the value 12 months ago, which removes the yearly pattern. The number of ordinary differences is called <strong>d</strong>; the number of seasonal differences is <strong>D</strong>. They become letters in the ARIMA model below.</p>
  <div class="flow"><span>Raw series</span><span>Log (if swing grows)</span><span>diff(1) (remove trend)</span><span>diff(12) (remove season)</span><span>ADF / KPSS check</span></div>
  <div class="fx" data-lang="py">import warnings; warnings.filterwarnings("ignore")   # KPSS warns when p is off its table
for name, s in [("raw", y), ("diff(1)", y.diff().dropna())]:
    stat, p, *_ = kpss(s, regression="c", nlags="auto")
    print(f"{name:8s} KPSS p={p:.3f}")</div>
  <div class="fx" data-lang="text">raw      KPSS p=0.010
diff(1)  KPSS p=0.100</div>
  <p><strong>KPSS</strong> is the mirror test: its H₀ is "stationary". So here a <em>small</em> p means NOT stationary. Raw: p = 0.01, rejected, non-stationary. Differenced: p = 0.10, fine. (KPSS reports p only between 0.01 and 0.10, so these are the table limits.) When ADF and KPSS agree, you can trust the answer.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stationary series</strong>: its mean, its spread (variance) and its autocorrelation do not change over time. <strong>Differencing</strong>: replacing y<sub>t</sub> by y<sub>t</sub> − y<sub>t−1</sub> (or y<sub>t</sub> − y<sub>t−s</sub> for seasonal).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Differencing too many times does not help; it adds noise and makes the model chase it. A hint: the fitted MA coefficient is near −1 (we will get −0.985 below, a sign our d+D is on the edge). Difference only until the tests pass, and check the ACF.</p>
  </div>

  <h2 id="ts-acf"><span class="num">04</span>ACF &amp; PACF</h2>
  <p>After differencing, the next question is: how far back does the memory go? Does this month depend only on last month, or also on 2 months ago, or on the same month last year? You need this to choose a model. Guessing wastes time; plotting correlations answers it.</p>
  <ul>
    <li><strong>ACF</strong> (autocorrelation function): the correlation of the series with itself k steps back, for k = 1, 2, 3, …</li>
    <li><strong>PACF</strong> (partial ACF): the same, but after removing what the steps in between already explain.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your mood today is linked to yesterday's, and through yesterday to the day before. ACF counts both the direct and the indirect link. PACF asks a sharper question: once I know yesterday, does the day before yesterday still matter <em>directly</em>?</p>
  </div>
  <p><strong>Worked example of lag-1 ACF.</strong> Series 1, 2, 3, 4, 5, 6. Mean = 3.5.</p>
  <ol>
    <li>Centre it (subtract the mean): −2.5, −1.5, −0.5, 0.5, 1.5, 2.5.</li>
    <li>Multiply each value by the one before and add: (−1.5)(−2.5) + (−0.5)(−1.5) + (0.5)(−0.5) + (1.5)(0.5) + (2.5)(1.5) = 3.75 + 0.75 − 0.25 + 0.75 + 3.75 = 8.75.</li>
    <li>Divide by the sum of squares: 6.25 + 2.25 + 0.25 + 0.25 + 2.25 + 6.25 = 17.5. So r₁ = 8.75 / 17.5 = <strong>0.5</strong>.</li>
  </ol>
  <p>A rising series has strong positive lag-1 correlation: big values follow big values. That is also why a slowly fading ACF means "trend still there, difference more".</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf, pacf
z = np.array([1., 2., 3., 4., 5., 6.])
print("lag-1 ACF of 1..6:", round(acf(z, nlags=1)[1], 3))
d = y.diff().diff(12).dropna()                       # the stationary version
print("ACF ", np.round(acf(d, nlags=13)[1:], 2))
print("PACF", np.round(pacf(d, nlags=13)[1:], 2))
print("noise band: ±", round(1.96 / np.sqrt(len(d)), 2))</div>
  <div class="fx" data-lang="text">lag-1 ACF of 1..6: 0.5
ACF  [-0.52  0.05 -0.01 -0.09  0.14 -0.04 -0.13  0.12 -0.09  0.1   0.15 -0.37
  0.19]
PACF [-0.53 -0.31 -0.21 -0.3  -0.13 -0.05 -0.26 -0.21 -0.29 -0.25  0.19 -0.22
 -0.33]
noise band: ± 0.19</div>
  <p>The first line confirms the hand calculation. <code>acf(d, nlags=13)</code> returns lags 0 to 13; lag 0 is always 1, so <code>[1:]</code> drops it. The <strong>noise band</strong> 1.96/√n (here ±0.19) is how big a correlation pure random noise could produce by luck 95% of the time. Only bars outside it mean something.</p>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<rect x="40" y="67" width="510" height="27" class="fs"/>
<line x1="40" y1="80" x2="550" y2="80" stroke="currentColor"/>
<rect x="69" y="80" width="14" height="37" class="fr sr"/>
<text x="76" y="165" text-anchor="middle" class="tm">1</text>
<rect x="105" y="76" width="14" height="4" class="fb sb"/>
<text x="112" y="165" text-anchor="middle" class="tm">2</text>
<rect x="141" y="80" width="14" height="1" class="fb sb"/>
<text x="148" y="165" text-anchor="middle" class="tm">3</text>
<rect x="177" y="80" width="14" height="6" class="fb sb"/>
<text x="184" y="165" text-anchor="middle" class="tm">4</text>
<rect x="213" y="70" width="14" height="10" class="fb sb"/>
<text x="220" y="165" text-anchor="middle" class="tm">5</text>
<rect x="249" y="80" width="14" height="3" class="fb sb"/>
<text x="256" y="165" text-anchor="middle" class="tm">6</text>
<rect x="285" y="80" width="14" height="9" class="fb sb"/>
<text x="292" y="165" text-anchor="middle" class="tm">7</text>
<rect x="321" y="72" width="14" height="8" class="fb sb"/>
<text x="328" y="165" text-anchor="middle" class="tm">8</text>
<rect x="357" y="80" width="14" height="6" class="fb sb"/>
<text x="364" y="165" text-anchor="middle" class="tm">9</text>
<rect x="393" y="73" width="14" height="7" class="fb sb"/>
<text x="400" y="165" text-anchor="middle" class="tm">10</text>
<rect x="429" y="69" width="14" height="11" class="fb sb"/>
<text x="436" y="165" text-anchor="middle" class="tm">11</text>
<rect x="465" y="80" width="14" height="26" class="fr sr"/>
<text x="472" y="165" text-anchor="middle" class="tm">12</text>
<rect x="501" y="67" width="14" height="13" class="fr sr"/>
<text x="508" y="165" text-anchor="middle" class="tm">13</text>
<text x="40" y="14" class="tm">ACF of the differenced series (shaded = 95% noise band)</text>
<text x="76" y="150" class="tr">lag 1: -0.52</text><text x="430" y="150" class="tr">lag 12: -0.37</text>
</svg><figcaption>Real ACF of y.diff().diff(12). Spikes outside the band are significant: lag 1 and lag 12.</figcaption></figure>
  <p>Reading it: the ACF has a big spike at lag 1 (−0.52), then nothing until a spike at lag 12 (−0.37). The PACF fades slowly instead of stopping. The rules of thumb:</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>ACF</th><th>PACF</th><th>Suggests</th></tr>
    <tr><td>AR(p)</td><td>Decays slowly</td><td><strong>Cuts off</strong> after lag p</td><td>p = last PACF spike</td></tr>
    <tr><td>MA(q)</td><td><strong>Cuts off</strong> after lag q</td><td>Decays slowly</td><td>q = last ACF spike</td></tr>
    <tr><td>Spike at lag 12, 24…</td><td colspan="2">Seasonal term (monthly data)</td><td>P or Q = 1</td></tr>
    <tr><td>ACF barely decays</td><td colspan="2">Still non-stationary</td><td>Difference again</td></tr>
  </table>
  <p>ACF cuts off after lag 1 → MA(1). Spike at 12 → seasonal MA(1). Together with d = 1 and D = 1 from the last section, that is SARIMA(0,1,1)(0,1,1,12), the famous "airline model" (first fit to airline passenger data). To draw these charts use <code>plot_acf</code> / <code>plot_pacf</code> from <code>statsmodels.graphics.tsaplots</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lag k</strong>: the value k steps in the past, y<sub>t−k</sub>. <strong>ACF(k)</strong> = corr(y<sub>t</sub>, y<sub>t−k</sub>). <strong>PACF(k)</strong> = the coefficient on y<sub>t−k</sub> in a regression of y<sub>t</sub> on y<sub>t−1</sub> … y<sub>t−k</sub>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading ACF/PACF on the raw, trending series. Everything looks significant and slowly fading, because the trend links every point to every other. Make it stationary first, then read the plots.</p>
  </div>

  <h2 id="ts-models"><span class="num">05</span>Baselines, ARIMA, Prophet</h2>
  <h3>Baselines first, always</h3>
  <p>Teams often spend weeks on a deep model and then find that "same as last year" was just as good. A <strong>baseline</strong> is a dumb, free forecast. You compute it first so you know what "good" means. If a fancy model cannot beat it, it is not worth shipping.</p>
  <div class="cards">
    <div><b>Naive</b><p>Forecast = last value, repeated.</p><small>Strong for random walks (stock prices)</small></div>
    <div><b>Seasonal naive</b><p>Forecast = value one season ago.</p><small>"Same month last year"</small></div>
    <div><b>Moving average</b><p>Forecast = mean of last k values.</p><small>Smooths noise, slow to follow trends</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sweet shop owner ordering khoya for Diwali week. Naive: "order what I sold last week". Seasonal naive: "order what I sold in Diwali week last year". The second is much better, and it took no maths at all.</p>
  </div>
  <p>We hold out the last 12 months as a test set and compute the three baselines:</p>
  <div class="fx" data-lang="py">train, test = y[:-12], y[-12:]                       # last year = holdout
naive  = pd.Series(train.iloc[-1], index=test.index)            # last value
snaive = pd.Series(train.iloc[-12:].values, index=test.index)    # same month last year
ma3    = pd.Series(train.iloc[-3:].mean(), index=test.index)     # mean of last 3
print(pd.DataFrame({"actual": test, "naive": naive,
                    "seasonal_naive": snaive, "ma3": ma3}).head(4).round(1))</div>
  <div class="fx" data-lang="text">            actual  naive  seasonal_naive    ma3
2024-01-01   189.8  176.7           171.5  171.0
2024-02-01   187.8  176.7           181.1  171.0
2024-03-01   202.7  176.7           193.0  171.0
2024-04-01   204.8  176.7           190.6  171.0</div>
  <p><code>y[:-12]</code> takes everything except the last 12 rows, <code>y[-12:]</code> takes the last 12. Note we split by position in time, not randomly. Naive repeats December's 176.7 flat. Seasonal naive copies last January, February, … so it follows the season shape but sits about 10 too low, because it misses one year of growth. These numbers are the bar to beat.</p>

  <h3>ARIMA(p, d, q) and SARIMA</h3>
  <p><strong>ARIMA</strong> (AutoRegressive Integrated Moving Average) predicts the next value of the differenced series from its recent values and its recent mistakes. In plain words: "next month's change = a bit of last month's change + a correction for how wrong I was last month". The three letters say how much of each to use.</p>
  <table class="tbl">
    <tr><th>Letter</th><th>Part</th><th>Meaning</th></tr>
    <tr><td><strong>p</strong></td><td>AR (autoregressive)</td><td>How many past <em>values</em> feed the prediction</td></tr>
    <tr><td><strong>d</strong></td><td>I (integrated)</td><td>How many times to difference</td></tr>
    <tr><td><strong>q</strong></td><td>MA (moving average)</td><td>How many past <em>forecast errors</em> feed the prediction</td></tr>
    <tr><td><strong>(P,D,Q,s)</strong></td><td>Seasonal part</td><td>The same three, at lags of s (12 = yearly for monthly data)</td></tr>
  </table>
  <p><strong>Tiny worked example, MA(1) with d = 1.</strong> Suppose the model is: change<sub>t</sub> = error<sub>t</sub> + θ·error<sub>t−1</sub> with θ = −0.5. Last month we forecast 100 and the actual was 104, so the error was +4. This month's forecast change = −0.5 × 4 = −2, so forecast = 104 − 2 = 102. The MA term partly "takes back" last month's surprise. With θ near −1 it takes back almost all of it, which is the over-differencing hint.</p>
  <p>Now fit the airline model chosen from the ACF:</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.statespace.sarimax import SARIMAX
m = SARIMAX(train, order=(0,1,1), seasonal_order=(0,1,1,12)).fit(disp=False)
print(m.params.round(3))
fc = m.get_forecast(12)
print(pd.DataFrame({"actual": test, "forecast": fc.predicted_mean}).head(3).round(1))
print(fc.conf_int().iloc[:3].round(1))
for order in [(1,1,0), (0,1,1), (1,1,1)]:
    aic = SARIMAX(train, order=order, seasonal_order=(0,1,1,12)).fit(disp=False).aic
    print(order, "AIC", round(aic, 1))</div>
  <div class="fx" data-lang="text">ma.L1       -0.985
ma.S.L12    -0.617
sigma2      11.427
dtype: float64
            actual  forecast
2024-01-01   189.8     181.7
2024-02-01   187.8     193.2
2024-03-01   202.7     200.9
            lower sales  upper sales
2024-01-01        175.1        188.4
2024-02-01        186.6        199.8
2024-03-01        194.2        207.5
(1, 1, 0) AIC 548.6
(0, 1, 1) AIC 517.5
(1, 1, 1) AIC 519.5</div>
  <p><code>order=(0,1,1)</code> is (p, d, q); <code>seasonal_order=(0,1,1,12)</code> is (P, D, Q, s). <code>fit(disp=False)</code> trains silently. The <code>params</code> are the learned θ values: <code>ma.L1</code> for lag 1, <code>ma.S.L12</code> for the seasonal lag, <code>sigma2</code> the noise variance. <code>get_forecast(12)</code> forecasts 12 steps; <code>conf_int()</code> gives a 95% <strong>prediction interval</strong>, a range the true value should fall in 95% of the time. That comes free with ARIMA and is very useful for planning stock.</p>
  <p>The last loop compares orders by <strong>AIC</strong> (Akaike Information Criterion): a score that rewards fitting the training data well but charges a penalty per extra parameter. Lower is better. (0,1,1) wins at 517.5, agreeing with our ACF reading. <code>pmdarima.auto_arima</code> automates this search. Outside inputs such as price or a holiday flag go in through <code>exog=</code>; that is the X in SARIMAX.</p>

  <h3>Prophet</h3>
  <p>ARIMA needs stationarity checks and order picking, which business analysts find hard. <strong>Prophet</strong> (from Meta) takes a different route: it fits y = trend + yearly/weekly seasonality + holiday effects as a smooth curve over the calendar, like fitting a regression on the date itself. It does not use lags at all.</p>
  <div class="fx" data-lang="py">from prophet import Prophet
df = train.reset_index(); df.columns = ["ds", "y"]     # Prophet needs these names
p = Prophet(yearly_seasonality=True, weekly_seasonality=False,
            daily_seasonality=False).fit(df)
future = p.make_future_dataframe(periods=12, freq="MS")  # train dates + 12 new months
pf = p.predict(future)
prophet_fc = pf["yhat"].values[-12:]
print(pd.DataFrame({"yhat": prophet_fc[:3], "actual": test.values[:3]},
                   index=test.index[:3]).round(1))</div>
  <div class="fx" data-lang="text">             yhat  actual
2024-01-01  182.3   189.8
2024-02-01  192.2   187.8
2024-03-01  199.9   202.7</div>
  <p><code>reset_index()</code> turns the date index into a column, and Prophet insists the columns are named <code>ds</code> (date stamp) and <code>y</code>. <code>make_future_dataframe</code> builds the list of dates to predict, including the training dates, so we keep only the last 12. <code>yhat</code> is the forecast; <code>yhat_lower</code>/<code>yhat_upper</code> (also in <code>pf</code>) give an interval.</p>
  <ul>
    <li><strong>Good at</strong>: daily business data with several seasonalities, holiday lists (Diwali, Eid, Christmas), missing days, sudden changes in trend. Easy for analysts.</li>
    <li><strong>Weak at</strong>: short-term ups and downs (no lags), very noisy data. Often beaten by a tuned GBM or even seasonal naive on real data.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing ARIMA orders by looking at the test set, or fitting the model on <code>y</code> instead of <code>train</code>. Both quietly use the future. Every choice (orders, AIC comparison) must be made on training data only.</p>
  </div>

  <h2 id="ts-ml"><span class="num">06</span>ML with Lag Features</h2>
  <p>ARIMA handles one series with clean patterns. Real companies have 10,000 products in 500 stores, plus prices, promotions and holidays. You want a model like LightGBM (a fast gradient-boosted tree library) that eats many columns. But LightGBM expects a normal table, not a series. So we <em>turn the series into a table</em>.</p>
  <p>The idea: each row is one time point. The target is that day's value. The columns are things known <em>before</em> that day: the value 1 day ago, 7 days ago, the day of the week, "is there a festival".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana owner ordering milk for next Monday looks at last Monday, the Monday before, and whether there is a festival. Those are lag features and calendar features. He never looks at next Monday's sales, because he can't.</p>
  </div>
  <p>A 7-day toy shows how the table is built:</p>
  <div class="fx" data-lang="py">s = pd.Series([10, 12, 15, 11, 13, 16, 12],
              index=pd.date_range("2024-03-04", periods=7, freq="D"), name="y")
tbl = pd.DataFrame({"y": s, "lag1": s.shift(1), "lag2": s.shift(2),
                    "roll2_leaky": s.rolling(2).mean(),
                    "roll2_safe": s.shift(1).rolling(2).mean(),
                    "dow": s.index.day_name().str[:3]})
print(tbl)</div>
  <div class="fx" data-lang="text">             y  lag1  lag2  roll2_leaky  roll2_safe  dow
2024-03-04  10   NaN   NaN          NaN         NaN  Mon
2024-03-05  12  10.0   NaN         11.0         NaN  Tue
2024-03-06  15  12.0  10.0         13.5        11.0  Wed
2024-03-07  11  15.0  12.0         13.0        13.5  Thu
2024-03-08  13  11.0  15.0         12.0        13.0  Fri
2024-03-09  16  13.0  11.0         14.5        12.0  Sat
2024-03-10  12  16.0  13.0         14.0        14.5  Sun</div>
  <p>Trace Wednesday (y = 15). <code>lag1</code> = Tuesday's 12, <code>lag2</code> = Monday's 10. Now the two rolling means. <code>roll2_leaky</code> = mean(12, <strong>15</strong>) = 13.5: it includes Wednesday's own answer. The model would learn "the target is roughly twice this minus lag1" and look brilliant offline. <code>roll2_safe</code> shifts first, so it averages Monday and Tuesday: (10 + 12)/2 = 11. Rule: <strong>shift before rolling</strong>. The NaN rows at the top have no history; drop them before training.</p>
  <table class="tbl">
    <tr><th>Feature type</th><th>Example</th><th>Leak check</th></tr>
    <tr><td>Lags</td><td><code>y.shift(12)</code>, <code>y.shift(13)</code></td><td>Lag ≥ forecast horizon</td></tr>
    <tr><td>Rolling stats</td><td><code>y.shift(12).rolling(3).mean()</code></td><td>Shift <em>before</em> rolling</td></tr>
    <tr><td>Calendar</td><td>month, day-of-week, holiday flag</td><td>Always safe (known in advance)</td></tr>
    <tr><td>Known-future exog</td><td>planned promo, price</td><td>Only if known at forecast time</td></tr>
  </table>
  <h3>Why "lag ≥ horizon"</h3>
  <p>We forecast all 12 months of 2024 on 31 Dec 2023. For December 2024, <code>lag1</code> would be November 2024, which we do not have yet. The smallest lag we will truly know for every target month is 12. So this model uses only lags 12, 13 and 24.</p>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<rect x="20" y="40" width="300" height="30" class="fb sb"/><text x="170" y="60" text-anchor="middle">known history (up to Dec 2023)</text>
<rect x="320" y="40" width="220" height="30" class="fr sr"/><text x="430" y="60" text-anchor="middle">to forecast: Jan–Dec 2024</text>
<line x1="320" y1="28" x2="320" y2="84" stroke="currentColor" stroke-dasharray="4 3"/><text x="320" y="20" text-anchor="middle" class="tm">forecast day</text>
<text x="20" y="102" class="tg">lag12 of Dec 2024 = Dec 2023 → known ✓</text>
<text x="20" y="116" class="tr">lag1 of Dec 2024 = Nov 2024 → not known ✗</text>
</svg><figcaption>On forecast day, everything right of the dashed line is unknown. Any feature that points into the red zone is a leak.</figcaption></figure>
  <div class="cards">
    <div><b>Recursive</b><p>Train one 1-step model; predict tomorrow, feed it back as lag1, predict the day after, and so on.</p><small>Simple; errors pile up</small></div>
    <div><b>Direct</b><p>Train a separate model for each step ahead h = 1 … H.</p><small>More models, errors don't pile up</small></div>
    <div><b>Lags ≥ horizon</b><p>One model, using only lags you will really have.</p><small>What we do below</small></div>
  </div>
  <h3>Trees can't extrapolate</h3>
  <p>A decision tree predicts the average of training rows that land in a leaf. So it can never predict a value bigger than anything it saw in training. A growing series breaks it. A one-line check:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
tt = np.arange(100).reshape(-1, 1); yy = 2.0 * tt.ravel()       # a perfect line y = 2t
g = lgb.LGBMRegressor(n_estimators=100, min_child_samples=5, verbose=-1,
                      random_state=0).fit(tt, yy)
print("true at t=99,120,150:", [198.0, 240.0, 300.0])
print("tree predicts       :", g.predict(np.array([[99], [120], [150]])).round(1))</div>
  <div class="fx" data-lang="text">true at t=99,120,150: [198.0, 240.0, 300.0]
tree predicts       : [193. 193. 193.]</div>
  <p>Past the training range, the tree is stuck at its last leaf value of 193 forever. The fix: make the target something with no trend. Predict the <em>change</em> y − lag12 (the year-over-year growth), which looks the same every year, then add lag12 back.</p>
  <div class="fx" data-lang="py">X = pd.DataFrame({"lag12": y.shift(12), "lag13": y.shift(13), "lag24": y.shift(24),
                  "roll3_lag12": y.shift(12).rolling(3).mean(),
                  "month": y.index.month})
Xtr, Xte = X[:-12].dropna(), X[-12:]
g = lgb.LGBMRegressor(n_estimators=200, learning_rate=0.05, min_child_samples=5,
                      verbose=-1, random_state=0)
g.fit(Xtr, y.loc[Xtr.index])
pred_raw = g.predict(Xte)                                      # predict y directly
g.fit(Xtr, (y - y.shift(12)).loc[Xtr.index])                   # predict the yearly change
pred_diff = g.predict(Xte) + Xte["lag12"].values               # add lag12 back
print("training rows:", len(Xtr), " train max y:", round(train.max(), 1),
      " test max y:", round(test.max(), 1))
print("MAE raw target :", round(np.mean(np.abs(test.values - pred_raw)), 2))
print("MAE diff target:", round(np.mean(np.abs(test.values - pred_diff)), 2))</div>
  <div class="fx" data-lang="text">training rows: 84  train max y: 193.5  test max y: 204.8
MAE raw target : 6.06
MAE diff target: 4.42</div>
  <p>Only 84 rows survive: the first 24 months have no <code>lag24</code> and the last 12 are the test. The test year goes up to 204.8, above anything in training, so the raw-target model must fall short; MAE (mean absolute error) is 6.06. Predicting the change cuts it to 4.42.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lag feature</strong>: y<sub>t−k</sub> used as an input for predicting y<sub>t</sub>. <strong>Exogenous variable</strong> (exog): an outside input, such as price or weather, not the series itself.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trees can't extrapolate</span>
    <p>A forecast that flatlines just under recent values on a growing series is the symptom. Predict the change or ratio, or detrend first, or blend with a linear model.</p>
  </div>
  <div class="callout intu"><span class="label">Industry note</span>
    <p>For many related series (sales per store × item), one shared "global" LightGBM across all series usually wins, because it learns patterns from thousands of series at once. That is how the M5 forecasting competition (Walmart data) was won.</p>
  </div>

  <h2 id="ts-cv"><span class="num">07</span>Time-Series Cross-Validation</h2>
  <p>One holdout year gives one score. That score might be lucky. In normal ML we fix this with K-fold cross-validation: split into 5 parts, test on each in turn. But normal K-fold shuffles rows, and shuffling puts future months into training while testing on past months. The model gets to peek.</p>
  <p>The time-series version keeps the arrow of time. Fold 0 trains on years 1–6 and tests on year 7. Fold 1 trains on years 1–7 and tests on year 8. And so on. It is like pretending to be the forecaster on several past dates, each time with only what you knew then.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Mock board exams. A fair mock uses papers you have not seen. Shuffled K-fold is like practising with next week's actual board paper mixed into your study material: great mock marks, useless for the real exam.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="0" y="14" class="tm">time →</text>
<rect x="60" y="24" width="240" height="20" class="fb sb"/><rect x="300" y="24" width="40" height="20" class="fr sr"/>
<rect x="60" y="52" width="280" height="20" class="fb sb"/><rect x="340" y="52" width="40" height="20" class="fr sr"/>
<rect x="60" y="80" width="320" height="20" class="fb sb"/><rect x="380" y="80" width="40" height="20" class="fr sr"/>
<rect x="60" y="108" width="360" height="20" class="fb sb"/><rect x="420" y="108" width="40" height="20" class="fr sr"/>
<text x="0" y="38">fold 0</text><text x="0" y="66">fold 1</text><text x="0" y="94">fold 2</text><text x="0" y="122">fold 3</text>
<rect x="60" y="136" width="12" height="10" class="fb sb"/><text x="78" y="145" class="tm">train</text>
<rect x="130" y="136" width="12" height="10" class="fr sr"/><text x="148" y="145" class="tm">test (12 months)</text>
</svg><figcaption>Expanding window: training always ends before the test block starts. Each fold moves the cut-off forward, like re-running last year's forecast every month.</figcaption></figure>
  <p>scikit-learn's <code>TimeSeriesSplit</code> produces these folds. The code prints which row numbers go where, first for the default expanding window, then for a sliding window with a gap:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import TimeSeriesSplit, KFold, cross_val_score
for i, (tr, te) in enumerate(TimeSeriesSplit(n_splits=4, test_size=12).split(y)):
    print(f"fold {i}: train 0-{tr[-1]}  ({len(tr)})   test {te[0]}-{te[-1]}")
for i, (tr, te) in enumerate(TimeSeriesSplit(n_splits=3, test_size=12, gap=2,
                                             max_train_size=48).split(y)):
    print(f"fold {i}: train {tr[0]}-{tr[-1]}  ({len(tr)})   test {te[0]}-{te[-1]}")</div>
  <div class="fx" data-lang="text">fold 0: train 0-71  (72)   test 72-83
fold 1: train 0-83  (84)   test 84-95
fold 2: train 0-95  (96)   test 96-107
fold 3: train 0-107  (108)   test 108-119
fold 0: train 34-81  (48)   test 84-95
fold 1: train 46-93  (48)   test 96-107
fold 2: train 58-105  (48)   test 108-119</div>
  <p>In the first four folds the training block always starts at 0 and grows by 12; the test block is always the next 12 rows. In the second set, <code>max_train_size=48</code> keeps only the latest 48 months (a <strong>sliding window</strong>), and <code>gap=2</code> leaves 2 unused months between train and test (rows 82–83 in fold 0), for when your data arrives 2 months late.</p>
  <p>Now the proof that shuffling lies. Same model, same features (just the month number <code>t</code> and the calendar month), two ways of splitting:</p>
  <div class="fx" data-lang="py">Xt = pd.DataFrame({"t": np.arange(len(y)), "month": y.index.month}, index=y.index)
g = lgb.LGBMRegressor(n_estimators=200, learning_rate=0.05, min_child_samples=5,
                      verbose=-1, random_state=0)
for name, cv in [("shuffled KFold ", KFold(5, shuffle=True, random_state=0)),
                 ("TimeSeriesSplit", TimeSeriesSplit(5, test_size=12))]:
    sc = -cross_val_score(g, Xt, y, cv=cv, scoring="neg_mean_absolute_error")
    print(f"{name}  MAE per fold {sc.round(1)}  mean {sc.mean():.2f}")</div>
  <div class="fx" data-lang="text">shuffled KFold   MAE per fold [4.2 4.9 5.2 3.8 3.8]  mean 4.40
TimeSeriesSplit  MAE per fold [9.6 9.  8.6 9.  9.3]  mean 9.11</div>
  <p>Shuffled K-fold says MAE 4.40. The honest split says 9.11, twice as bad. Why? With shuffling, to predict month 50 the model has seen months 49 and 51 in training, so it just fills in the gap. In real life you never have month 51. <code>cross_val_score</code> returns negative MAE (scikit-learn always maximises scores), so we flip the sign.</p>
  <ul>
    <li><strong>Expanding window</strong>: train grows. Default choice.</li>
    <li><strong>Sliding window</strong> (<code>max_train_size=</code>): train length fixed. Use when old data no longer looks like today (after COVID, after a price change).</li>
    <li><strong>Gap</strong> (<code>gap=</code>): skip rows between train and test when features take time to arrive.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Walk-forward (rolling-origin) validation</strong>: repeatedly train on data up to a cut-off date and test on the period right after it, moving the cut-off forward each fold.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shuffled K-fold</span>
    <p>Also hidden inside tools: <code>GridSearchCV(cv=5)</code> and <code>cross_val_score(cv=5)</code> default to plain K-fold. Always pass <code>cv=TimeSeriesSplit(...)</code> explicitly.</p>
  </div>

  <h2 id="ts-metrics"><span class="num">08</span>Forecast Metrics</h2>
  <p>"The forecast was 10% off" sounds clear, but it can hide disasters. A metric is a choice about which mistakes hurt most. A shop running out of milk loses a customer; a shop with a few extra packets loses a little money. Pick the wrong metric and your model will happily optimise the wrong thing.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a dabbawala. "Average minutes late" (MAE) is fair. "Worst lateness counts extra" (RMSE) fits if one very late lunch gets you fired. "Percent late" (MAPE) breaks if a delivery is due in 1 minute: 2 minutes late is 200%.</p>
  </div>
  <p><strong>Worked example.</strong> Three days. Actual 100, 2, 50. Forecast 90, 6, 55.</p>
  <table class="tbl out"><caption>Error per day</caption>
    <tr><th>day</th><th>actual</th><th>forecast</th><th>|error|</th><th>|error| / actual</th></tr>
    <tr><td>1</td><td>100</td><td>90</td><td>10</td><td>10%</td></tr>
    <tr><td>2</td><td>2</td><td>6</td><td>4</td><td><strong>200%</strong></td></tr>
    <tr><td>3</td><td>50</td><td>55</td><td>5</td><td>10%</td></tr>
  </table>
  <ul>
    <li><strong>MAE</strong> = (10 + 4 + 5) / 3 = 6.33 units.</li>
    <li><strong>MAPE</strong> = (10 + 200 + 10) / 3 = 73.3%. One tiny day ruins it, though it was only 4 units off.</li>
    <li><strong>WAPE</strong> = total error / total actual = 19 / 152 = 12.5%. Big days weigh more. Retailers prefer it.</li>
  </ul>
  <div class="fx" data-lang="py">a = np.array([100, 2, 50]); f = np.array([90, 6, 55])
print("abs errors:", np.abs(a-f), " APE%:", np.round(100*np.abs(a-f)/a, 1),
      " MAPE:", round(100*np.mean(np.abs(a-f)/a), 1))
print("sMAPE:", round(100*np.mean(2*np.abs(a-f)/(np.abs(a)+np.abs(f))), 1))
print("MAE:", round(np.mean(np.abs(a-f)), 2), " RMSE:", round(np.sqrt(np.mean((a-f)**2)), 2),
      " WAPE%:", round(100*np.abs(a-f).sum()/np.abs(a).sum(), 1))</div>
  <div class="fx" data-lang="text">abs errors: [10  4  5]  APE%: [ 10. 200.  10.]  MAPE: 73.3
sMAPE: 40.0
MAE: 6.33  RMSE: 6.86  WAPE%: 12.5</div>
  <p>The code matches the hand numbers. <strong>RMSE</strong> (root mean squared error) squares each error before averaging, so the 10-unit miss counts more: 6.86 &gt; 6.33. <strong>sMAPE</strong> divides by the average of actual and forecast instead of the actual alone, which caps it at 200% and calms day 2 down.</p>
  <h3>MASE: "did I beat the dumb forecast?"</h3>
  <p>MAE is in units, so "MAE 5" is great for a series around 1,000 and terrible around 10. You can't average it across products. <strong>MASE</strong> (mean absolute scaled error) divides your MAE by the MAE a naive forecast gets on the training data. Worked example with m = 1 (naive = last value): train 10, 12, 11, 13, 12, 14. Naive errors: |12−10|, |11−12|, |13−11|, |12−13|, |14−12| = 2, 1, 2, 1, 2, mean 1.6. Your model forecasts 14, 14 for actuals 15, 13: MAE 1.0. MASE = 1.0 / 1.6 = <strong>0.62</strong>. Below 1 means you beat naive. For seasonal data use m = 12 (seasonal naive).</p>
  <h3>Uneven costs: pinball loss</h3>
  <p>If running out costs far more than overstocking, you do not want the average forecast; you want a high one, like the 90th percentile (P90). The <strong>pinball (quantile) loss</strong> for q = 0.9 charges 0.9 per unit when you forecast too low and only 0.1 per unit when too high.</p>
  <div class="fx" data-lang="py">def pinball(a, f, q):
    e = a - f                                    # positive = forecast too low
    return np.mean(np.maximum(q*e, (q-1)*e))
demand = np.array([20, 25, 30, 22, 40])
for fc_value in [25, 35]:
    print(f"forecast {fc_value}  MAE {np.mean(np.abs(demand-fc_value))}"
          f"  pinball q=0.9 {pinball(demand, fc_value, 0.9):.2f}")</div>
  <div class="fx" data-lang="text">forecast 25  MAE 5.6  pinball q=0.9 3.76
forecast 35  MAE 9.6  pinball q=0.9 1.76</div>
  <p>MAE prefers 25 (close to the middle). Pinball prefers 35, because 25 is short on the 30 and 40 days, and those shortfalls cost 0.9 each. <code>np.maximum(q*e, (q-1)*e)</code> picks the right charge: for e &gt; 0 (too low) it is q·e, for e &lt; 0 (too high) it is (q−1)·e, which is positive. LightGBM trains on this directly with <code>objective="quantile", alpha=0.9</code>.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula idea</th><th>Use when</th><th>Watch out</th></tr>
    <tr><td><strong>MAE</strong></td><td>mean |error|</td><td>Same units as y, easy to explain</td><td>Can't compare series of different size</td></tr>
    <tr><td><strong>RMSE</strong></td><td>√ mean error²</td><td>Big misses are costly</td><td>Outliers dominate</td></tr>
    <tr><td><strong>MAPE</strong></td><td>mean |error / actual| × 100</td><td>Business wants "% off"</td><td>Blows up near 0; favours low forecasts</td></tr>
    <tr><td><strong>sMAPE</strong></td><td>|error| / mean(|actual|, |forecast|)</td><td>% capped at 0–200</td><td>Still odd near 0</td></tr>
    <tr><td><strong>WAPE</strong></td><td>Σ|error| / Σ|actual|</td><td>Retail, many items</td><td>Dominated by big sellers</td></tr>
    <tr><td><strong>MASE</strong></td><td>MAE ÷ naive MAE (on train)</td><td>Comparing across series</td><td>&lt; 1 means you beat the baseline</td></tr>
    <tr><td><strong>Pinball</strong></td><td>q·under + (1−q)·over</td><td>Stock-outs cost more</td><td>Pick q from the real cost ratio</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: MAPE</span>
    <p>Near-zero days swamp it. And it is lopsided: if actual is 100, forecasting 0 is at most 100% off, but forecasting 300 is 200% off. So a model tuned for low MAPE learns to forecast too low, and shelves go empty.</p>
  </div>

  <h2 id="ts-build"><span class="num">09</span>Build It: The Leaderboard</h2>
  <p>Now put every model from this page on one table, trained on the first 108 months and scored on the 12 held-out months. This is what a real forecasting project report looks like: baselines on top, every candidate scored the same way, and a scale-free column (MASE) to say who truly beat the baseline.</p>
  <p>The code defines the four metrics, then collects each model's 12 forecasts into a dict and prints one row per model. It reuses <code>naive</code>, <code>snaive</code>, <code>ma3</code>, the SARIMA model <code>m</code>, <code>prophet_fc</code>, <code>pred_raw</code> and <code>pred_diff</code> from the sections above.</p>
  <div class="fx" data-lang="py">def mae(a, f):  return np.mean(np.abs(a - f))
def rmse(a, f): return np.sqrt(np.mean((a - f)**2))
def mape(a, f): return 100*np.mean(np.abs((a - f)/a))
def mase(a, f, tr, m=12):           # scale = in-sample seasonal-naive MAE
    return mae(a, f) / np.mean(np.abs(tr.values[m:] - tr.values[:-m]))

res = {"naive (last value)":          naive.values,
       "seasonal naive":              snaive.values,
       "moving avg (3)":              ma3.values,
       "SARIMA(0,1,1)(0,1,1,12)":     m.forecast(12).values,
       "Prophet":                     prophet_fc,
       "LightGBM (predict y)":        pred_raw,
       "LightGBM (predict y - lag12)": pred_diff}
a = test.values
for name, f in res.items():
    print(f"{name:29s} MAE {mae(a,f):5.2f}  RMSE {rmse(a,f):5.2f}  "
          f"MAPE {mape(a,f):5.2f}  MASE {mase(a,f,train):.2f}")</div>
  <div class="fx" data-lang="text">naive (last value)            MAE 13.69  RMSE 15.89  MAPE  7.03  MASE 1.44
seasonal naive                MAE 10.78  RMSE 11.92  MAPE  5.67  MASE 1.13
moving avg (3)                MAE 19.46  RMSE 21.06  MAPE 10.06  MASE 2.04
SARIMA(0,1,1)(0,1,1,12)       MAE  3.79  RMSE  4.96  MAPE  2.00  MASE 0.40
Prophet                       MAE  3.30  RMSE  3.94  MAPE  1.74  MASE 0.35
LightGBM (predict y)          MAE  6.06  RMSE  7.71  MAPE  3.13  MASE 0.64
LightGBM (predict y - lag12)  MAE  4.42  RMSE  6.02  MAPE  2.32  MASE 0.46</div>
  <p>How to read it:</p>
  <ul>
    <li><code>mase</code> uses <code>tr.values[m:] - tr.values[:-m]</code>: each training month minus the same month a year earlier, i.e. the seasonal-naive error on the training data. Dividing by it makes every row scale-free.</li>
    <li>Seasonal naive has MASE 1.13 on the holdout: it misses one year of growth (12 × 0.8 ≈ 9.6), which is most of its 10.78 MAE.</li>
    <li>The moving average is the worst: it ignores both season and trend.</li>
    <li>Prophet and SARIMA win here because this data <em>is</em> a smooth trend plus a sine wave, exactly what they assume. On real, messy, many-series data (promotions, stock-outs, thousands of SKUs) LightGBM with good features often flips this order.</li>
    <li>The two LightGBM rows show the extrapolation fix is worth 27% of the error.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One holdout year is one exam. Before trusting a winner, re-run the leaderboard on several walk-forward folds (section 07) and look at the average and the spread.</p>
  </div>

  <h2 id="ts-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: random split or shuffled K-fold</span>
    <p>Trains on the future. Our demo: shuffled MAE 4.40 vs honest 9.11. Always split by time and pass <code>cv=TimeSeriesSplit(...)</code> to every search and score function.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: rolling without shifting</span>
    <p><code>y.rolling(7).mean()</code> includes today's target. Use <code>y.shift(h).rolling(7).mean()</code> with h ≥ horizon.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: lags smaller than the horizon</span>
    <p>Using <code>lag1</code> to forecast 7 days ahead with true values is leakage. Use lags ≥ 7, recursive forecasting, or one direct model per step.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: preprocessing fit on everything</span>
    <p>A scaler, imputer or target encoding fit on the whole series lets test-period statistics into training. Fit inside each training fold only (a scikit-learn <code>Pipeline</code> does this for you).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no baseline</span>
    <p>Reporting "MAPE 6%" without seasonal naive next to it means nothing. Always show the baseline and MASE.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trees on a trend</span>
    <p>Forecast flatlines below recent values. Predict the change or ratio, then add back.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: MAPE near zero</span>
    <p>Slow-moving items with days of 0 or 1 sales make MAPE explode or divide by zero. Use WAPE, MAE or MASE.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: decomposition as a feature</span>
    <p>The centred trend and STL components use future points. Use them to explore, not as model inputs.</p>
  </div>

  <h2 id="ts-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use random K-fold cross-validation on time series?</summary><div class="qa-body">Rows are linked in time, so a shuffled split trains on points just after (and before) each test point. The model sees the future, so scores look great and fall apart in production. In our demo, shuffled K-fold gave MAE 4.40 while an honest time split gave 9.11. Use expanding-window splits where training always ends before testing starts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stationarity and why does ARIMA need it?</summary><div class="qa-body">A stationary series keeps the same mean, spread and autocorrelation over time. ARIMA learns fixed coefficients linking past to present; that only works on the future if the link doesn't change. The "I" in ARIMA handles non-stationary data by differencing first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ADF gives p = 0.92 and KPSS gives p = 0.01 on the raw series. What do you conclude?</summary><div class="qa-body">Both say non-stationary. ADF's null is "non-stationary" and we cannot reject it (p large). KPSS's null is "stationary" and we reject it (p small). Difference once and test again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain p, d and q in ARIMA(2,1,0).</summary><div class="qa-body">d = 1: difference once. p = 2: predict the differenced value from its previous two values (AR terms). q = 0: no past forecast errors (MA terms) used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The PACF has significant spikes at lags 1 and 2 then drops to zero; the ACF decays slowly. Which model?</summary><div class="qa-body">AR(2). PACF cutting off after lag p is the AR signature; the slowly decaying ACF confirms it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose between several ARIMA orders?</summary><div class="qa-body">Start from the ACF/PACF reading, then compare a few nearby orders by AIC on the training data (lower is better; it penalises extra parameters), and confirm with walk-forward validation. <code>auto_arima</code> automates the AIC search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your LightGBM forecast flatlines below recent values on a growing series. Why, and the fix?</summary><div class="qa-body">Trees predict averages of training rows, so they can't go above the highest y they were trained on. Predict the change (y − lag, or a ratio) or remove the trend first, then add it back. Or blend with a linear/statistical model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You forecast 7 days ahead. Can you use lag_1 as a feature?</summary><div class="qa-body">Only with recursive forecasting (feeding your own predictions back in), where errors pile up. Otherwise use lags ≥ 7, or train a separate direct model per step ahead. Using the true lag_1 when scoring day 7 is leakage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Actuals = [100, 2, 50], forecast = [90, 6, 55]. What's the MAPE, and what's wrong with it?</summary><div class="qa-body">Percentage errors are 10%, 200%, 10%, so MAPE = 73.3%. One tiny day swamps it even though it was only 4 units off. Use MAE, WAPE (Σ|e| / Σ|a| = 12.5% here), or MASE instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does MASE = 1.13 mean?</summary><div class="qa-body">The model's MAE is 13% worse than the seasonal-naive forecast's in-sample MAE. Under 1 beats the baseline. It has no units, so you can average it across thousands of series.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Stock-outs cost 9 times more than overstock. What do you forecast and how do you train it?</summary><div class="qa-body">Forecast the 90th percentile, not the mean (q = 9/(9+1) = 0.9). Train with pinball/quantile loss, e.g. LightGBM <code>objective="quantile", alpha=0.9</code>, and evaluate with the same loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three ways a time-series feature pipeline can leak, other than random splits.</summary><div class="qa-body">(1) Rolling features not shifted, so they include today's target. (2) Scaler or imputer fit on the full series, including the test period. (3) Features revised or published after prediction time (final revenue, late data). Also target encoding computed over all time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you pick Prophet, SARIMA, or LightGBM?</summary><div class="qa-body">SARIMA: one or a few series with clear, stable patterns, when you want intervals and interpretability. Prophet: daily business series with holidays, missing days and trend changes, when analysts must maintain it. LightGBM: many related series with lots of outside features (price, promo, weather), with lag features and a global model.</div></details>
</main>`
});
