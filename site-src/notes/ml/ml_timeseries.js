// ml/ml_timeseries.js — Time Series Forecasting
Object.assign(TOPIC_CONTENT, {
  "ml_timeseries": `<main>
  <h1>Time Series Forecasting</h1>
  <p class="lead">How to predict the next values of something measured over time: demand, traffic, revenue, sensor readings. It builds on regression and cross-validation, with two new rules: order matters, and the future must never leak into training.</p>

  <h2 id="ts-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Time Series Forecasting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why it's different</div>
        <ul>
          <li><b>Order matters</b> — rows are in time order; never shuffle</li>
          <li><b>Autocorrelation</b> — today is linked to yesterday; rows are not independent</li>
          <li><b>Leakage</b> — future info gets into training; scores look great, live fails</li>
          <li>⚠ <b>Quiet leaks</b> — rolling mean that includes today, scaler fit on all data, late-arriving features</li>
          <li>💡 Grading a weather forecaster who already has tomorrow's paper</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Components</div>
        <ul>
          <li><b>Trend</b> — long-run direction (up/down)</li>
          <li><b>Seasonality</b> — repeats on a fixed period (12 for monthly data, 7 for daily data)</li>
          <li><b>Cycle</b> — ups and downs with no fixed period</li>
          <li><b>Noise</b> — leftover randomness</li>
          <li><b>Additive</b> y = T+S+R (same-size swing) vs <b>multiplicative</b> T×S×R (swing grows) → take log</li>
          <li><b>Tools</b> — <code>seasonal_decompose</code>, <b>STL</b> (handles outliers, preferred)</li>
          <li>⚠ Centred trend uses future values: use it to understand, not as a feature</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stationarity</div>
        <ul>
          <li><b>Stationary</b> — mean, spread and autocorrelation stay the same over time</li>
          <li><b>Why</b> — ARIMA learns fixed rules; those rules must not change</li>
          <li><b>ADF</b> — H₀ = non-stationary; p &lt; 0.05 → stationary</li>
          <li><b>KPSS</b> — opposite H₀ (stationary); use both if unsure</li>
          <li><b>Differencing</b> — <code>y.diff()</code> removes trend (d); <code>diff(12)</code> removes season (D)</li>
          <li>Example: raw p=0.92 → after diff(1) p=0.000</li>
          <li>⚠ <b>Over-differencing</b> — MA coefficient ≈ −1 is the hint</li>
          <li>💡 Cricket: compare run rate per over, not the total score, which keeps rising</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ACF / PACF</div>
        <ul>
          <li><b>ACF</b> — correlation of the series with itself k steps back</li>
          <li><b>PACF</b> — same, after removing the steps in between</li>
          <li><b>AR(p)</b> — PACF stops after p, ACF fades slowly</li>
          <li><b>MA(q)</b> — ACF stops after q, PACF fades slowly</li>
          <li><b>Spike at s, 2s</b> — seasonal term; ACF fades very slowly → difference more</li>
          <li>Example: ACF spikes at 1 and 12 → SARIMA(0,1,1)(0,1,1,12), the "airline model"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classical models</div>
        <ul>
          <li><b>Baselines</b> — naive (last value), seasonal naive (same month last year), moving average; must beat these</li>
          <li><b>ARIMA(p,d,q)</b> — p past values, d differences, q past errors</li>
          <li><b>SARIMA</b> — + (P,D,Q,s) seasonal part · <b>SARIMAX</b> — + outside inputs (price, holidays)</li>
          <li><b>Choosing orders</b> — read ACF/PACF or take lowest AIC (<code>auto_arima</code>)</li>
          <li><b>Prophet</b> — fits trend + seasonality + holidays as a curve over time; needs <code>ds</code>, <code>y</code></li>
          <li>Prophet good: daily business data, holidays, gaps · weak: short-term ups and downs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ML approach</div>
        <ul>
          <li><b>Features</b> — lags, shifted rolling stats, calendar, inputs known in advance</li>
          <li><b>Rule</b> — lag ≥ horizon, or forecast step by step</li>
          <li><b>Strategies</b> — recursive (errors pile up), direct (one model per step ahead), lags ≥ horizon</li>
          <li>⚠ <b>Trees can't extrapolate</b> — predict y − lag (or a ratio), then add back</li>
          <li><b>Global model</b> — one LightGBM over many series wins at scale (M5)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Validation</div>
        <ul>
          <li><b>Expanding window</b> — <code>TimeSeriesSplit(n_splits, test_size)</code>; train always before test</li>
          <li><b>Sliding window</b> — <code>max_train_size</code> when old data is out of date</li>
          <li><b>Gap</b> — <code>gap=</code> when features arrive late</li>
          <li>⚠ Random K-fold = training on the future</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics</div>
        <ul>
          <li><b>MAE</b> — mean |e|, same units · <b>RMSE</b> — punishes big misses</li>
          <li><b>MAPE</b> — mean |e/actual|; ⚠ blows up near 0, favours low forecasts</li>
          <li><b>sMAPE</b> — 0–200% · <b>WAPE</b> — Σ|e| / Σ|a|</li>
          <li><b>MASE</b> — MAE ÷ seasonal-naive MAE; &lt; 1 beats the baseline; no units</li>
          <li><b>Uneven costs</b> — quantile (pinball) loss, forecast P90</li>
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
      <div class="rm-item rm-done" data-target="ts-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ts-diff"><span class="num">01</span>Why Time Series Is Different</h2>
  <table class="tbl">
    <tr><th></th><th>Ordinary tabular ML</th><th>Time series</th></tr>
    <tr><td>Row order</td><td>Doesn't matter; shuffle freely</td><td>The order <em>is</em> the information</td></tr>
    <tr><td>Rows independent?</td><td>Assumed (i.i.d.)</td><td>No: today depends on yesterday (<strong>autocorrelation</strong>)</td></tr>
    <tr><td>Validation</td><td>Random K-fold</td><td>Train on past, test on future only</td></tr>
    <tr><td>Biggest risk</td><td>Overfitting</td><td><strong>Leakage</strong>: future info sneaks into training</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Grading a weather forecaster who has tomorrow's newspaper on the desk. Any score they get is fake.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: quiet leakage</span>
    <p>Random splits are not the only leak. A rolling mean that includes today, a scaler fit on the whole series, or a feature known only later (final monthly revenue) all leak too.</p>
  </div>
  <p>Example used on this page: 10 years of made-up monthly sales (grows 0.8/month, yearly wave ±15, noise σ=4).</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
rng = np.random.default_rng(42)
t = np.arange(120)
idx = pd.date_range("2015-01-01", periods=120, freq="MS")   # month starts
y = pd.Series(100 + 0.8*t + 15*np.sin(2*np.pi*t/12) + rng.normal(0, 4, 120),
              index=idx, name="sales")
print(y.head(3).round(1))</div>
  <div class="fx" data-lang="text">2015-01-01    101.2
2015-02-01    104.1
2015-03-01    117.6
Freq: MS, Name: sales, dtype: float64</div>

  <h2 id="ts-decomp"><span class="num">02</span>Components &amp; Decomposition</h2>
  <p><strong>Decomposition</strong> splits a series into a slow trend, a repeating season, and leftover noise. Seeing the parts tells you which model and which features you need.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An ice-cream shop's sales. Trend: the town grows every year. Season: every summer is high, every winter low. Noise: a random rainy Sunday.</p>
  </div>
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
</svg><figcaption>First 6 years of the series split into its parts. Observed = trend + seasonal + residual.</figcaption></figure>
  <div class="cards">
    <div><b>Trend</b><p>Long-run direction.</p><small>Growing user base</small></div>
    <div><b>Seasonality</b><p>Repeats on a fixed period.</p><small>Diwali spike, weekend dip</small></div>
    <div><b>Cycle</b><p>Rises and falls with <em>no</em> fixed period.</p><small>Business cycles, recessions</small></div>
    <div><b>Noise</b><p>What's left; can't be predicted.</p><small>Should look like random scatter</small></div>
  </div>
  <div class="fx" data-lang="py">from statsmodels.tsa.seasonal import seasonal_decompose
dec = seasonal_decompose(y, model="additive", period=12)
pd.DataFrame({"trend": dec.trend, "seasonal": dec.seasonal,
              "resid": dec.resid}).iloc[6:9].round(1)</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th></th><th>trend</th><th>seasonal</th><th>resid</th></tr>
    <tr><td>2015-07-01</td><td>104.2</td><td>1.4</td><td>-0.3</td></tr>
    <tr><td>2015-08-01</td><td>105.3</td><td>-7.9</td><td>-0.6</td></tr>
    <tr><td>2015-09-01</td><td>106.4</td><td>-13.2</td><td>0.1</td></tr>
  </table>
  <ul>
    <li><strong>Additive</strong> (y = T + S + R): the seasonal swing stays the same size.</li>
    <li><strong>Multiplicative</strong> (y = T × S × R): the swing grows as the level grows. Taking log makes it additive.</li>
    <li><strong>STL</strong> (<code>statsmodels.tsa.seasonal.STL</code>): handles outliers and lets seasonality slowly change. Prefer it in practice.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The centred moving-average trend uses 6 future months, so its first and last 6 values are NaN. Use decomposition to <em>understand</em> the data, not as a feature.</p>
  </div>

  <h2 id="ts-stat"><span class="num">03</span>Stationarity &amp; Differencing</h2>
  <div class="cards">
    <div><b>Stationary</b><p>Mean, spread and autocorrelation don't change over time.</p><small>White noise, daily returns</small></div>
    <div><b>Non-stationary</b><p>Has trend, seasonality or changing spread.</p><small>Prices, sales, population</small></div>
  </div>
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
  <p>ARIMA-type models assume stationarity: the past can teach the future only if the rules stay the same. <strong>Differencing</strong> (today − yesterday) is the usual fix.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>In a T20 match the total score always climbs, so "120" means nothing alone. Runs per over moves up and down around a steady level. Differencing turns the total into runs per over.</p>
  </div>
  <div class="flow"><span>Raw series</span><span>Log (fix growing variance)</span><span>diff(1) (remove trend)</span><span>diff(12) (remove season)</span><span>ADF test</span></div>
  <p><strong>ADF test</strong> (Augmented Dickey-Fuller): H₀ = "series has a unit root", meaning non-stationary. Small p-value → reject H₀ → stationary.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import adfuller
for name, s in [("raw", y), ("diff(1)", y.diff().dropna()),
                ("diff(1)+diff(12)", y.diff().diff(12).dropna())]:
    stat, p, *_ = adfuller(s)
    print(f"{name:18s} ADF={stat:7.2f}  p={p:.4f}")</div>
  <div class="fx" data-lang="text">raw                ADF=  -0.31  p=0.9248
diff(1)            ADF=  -7.54  p=0.0000
diff(1)+diff(12)   ADF=  -5.03  p=0.0000</div>
  <p>Raw: p=0.92, can't reject, so non-stationary. One difference fixes it. The number of differences is <code>d</code>; seasonal differences are <code>D</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Differencing too many times adds noise. Hint: an MA coefficient near −1 (we get −0.985 below). The KPSS test has the opposite H₀ (stationary); use both when unsure.</p>
  </div>

  <h2 id="ts-acf"><span class="num">04</span>ACF &amp; PACF</h2>
  <ul>
    <li><strong>ACF</strong> (autocorrelation function): correlation of the series with itself k steps back.</li>
    <li><strong>PACF</strong> (partial ACF): the same, after removing the effect of the steps in between.</li>
  </ul>
  <p>They tell you how far back the memory goes, which sets the p and q of ARIMA.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your mood today is linked to yesterday's and, through yesterday, to the day before. ACF counts both links. PACF asks: does the day before yesterday matter <em>directly</em>, once yesterday is known?</p>
  </div>
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
  <table class="tbl">
    <tr><th>Pattern</th><th>ACF</th><th>PACF</th><th>Suggests</th></tr>
    <tr><td>AR(p)</td><td>Decays slowly</td><td><strong>Cuts off</strong> after lag p</td><td>p = last PACF spike</td></tr>
    <tr><td>MA(q)</td><td><strong>Cuts off</strong> after lag q</td><td>Decays slowly</td><td>q = last ACF spike</td></tr>
    <tr><td>Spike at lag 12, 24…</td><td colspan="2">Seasonal term (monthly data)</td><td>P or Q = 1</td></tr>
    <tr><td>ACF barely decays</td><td colspan="2">Still non-stationary</td><td>Difference again</td></tr>
  </table>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf, pacf
d = y.diff().diff(12).dropna()
print("ACF ", np.round(acf(d, nlags=13)[1:], 2))
print("PACF", np.round(pacf(d, nlags=13)[1:], 2))</div>
  <div class="fx" data-lang="text">ACF  [-0.52  0.05 -0.01 -0.09  0.14 -0.04 -0.13  0.12 -0.09  0.1   0.15 -0.37
  0.19]
PACF [-0.53 -0.31 -0.21 -0.3  -0.13 -0.05 -0.26 -0.21 -0.29 -0.25  0.19 -0.22
 -0.33]</div>
  <p>ACF stops after lag 1, plus a spike at 12; PACF fades slowly. Reading: MA(1) and seasonal MA(1), so SARIMA(0,1,1)(0,1,1,12), the classic "airline model". Plot with <code>plot_acf</code> / <code>plot_pacf</code> from <code>statsmodels.graphics.tsaplots</code>.</p>

  <h2 id="ts-models"><span class="num">05</span>Baselines, ARIMA, Prophet</h2>
  <h3>Baselines first, always</h3>
  <div class="cards">
    <div><b>Naive</b><p>Forecast = last value.</p><small>Strong for random walks (stock prices)</small></div>
    <div><b>Seasonal naive</b><p>Forecast = value one season ago.</p><small>"Same month last year"</small></div>
    <div><b>Moving average</b><p>Forecast = mean of last k values.</p><small>Smooths noise, slow to follow trends</small></div>
  </div>
  <p>A fancy model that can't beat seasonal naive is not worth shipping.</p>
  <h3>ARIMA(p, d, q) and SARIMA</h3>
  <p><strong>ARIMA</strong> predicts the next value from recent values and recent mistakes, after differencing. Example: "next month = this month + 0.6 × last month's change − 0.3 × last month's error".</p>
  <table class="tbl">
    <tr><th>Letter</th><th>Part</th><th>Meaning</th></tr>
    <tr><td><strong>p</strong></td><td>AR (autoregressive)</td><td>How many past <em>values</em> feed the prediction</td></tr>
    <tr><td><strong>d</strong></td><td>I (integrated)</td><td>How many times to difference</td></tr>
    <tr><td><strong>q</strong></td><td>MA (moving average)</td><td>How many past <em>forecast errors</em> feed the prediction</td></tr>
    <tr><td><strong>(P,D,Q,s)</strong></td><td>Seasonal part</td><td>Same three, at lags of s (12 = monthly-yearly)</td></tr>
  </table>
  <div class="fx" data-lang="py">from statsmodels.tsa.statespace.sarimax import SARIMAX
train, test = y[:-12], y[-12:]                      # hold out the last year
m = SARIMAX(train, order=(0,1,1), seasonal_order=(0,1,1,12)).fit(disp=False)
print(m.params.round(3))
print(m.get_forecast(12).conf_int().iloc[:3].round(1))</div>
  <div class="fx" data-lang="text">ma.L1       -0.985
ma.S.L12    -0.617
sigma2      11.427
dtype: float64
            lower sales  upper sales
2024-01-01        175.1        188.4
2024-02-01        186.6        199.8
2024-03-01        194.2        207.5</div>
  <p>You get prediction intervals for free. Pick orders from ACF/PACF, or by lowest AIC (<code>pmdarima.auto_arima</code> does this). Add outside inputs (price, holidays) through <code>exog</code>: that is the X in SARIMAX.</p>
  <h3>Prophet</h3>
  <p>Meta's library. It fits y = trend + yearly/weekly seasonality + holidays as a smooth curve over the calendar. It does not use lags.</p>
  <div class="fx" data-lang="py">from prophet import Prophet
df = train.reset_index(); df.columns = ["ds", "y"]     # Prophet needs these names
p = Prophet(yearly_seasonality=True, weekly_seasonality=False,
            daily_seasonality=False).fit(df)
future = p.make_future_dataframe(periods=12, freq="MS")
fc = p.predict(future)[["ds", "yhat", "yhat_lower", "yhat_upper"]]</div>
  <ul>
    <li><strong>Good at</strong>: daily business data, several seasonalities, holidays, missing days, sudden changes in trend. Easy for analysts.</li>
    <li><strong>Weak at</strong>: short-term ups and downs (no lags), noisy data. Often beaten by a tuned GBM or even seasonal naive.</li>
  </ul>

  <h2 id="ts-ml"><span class="num">06</span>ML with Lag Features</h2>
  <p>Turn the series into a normal table: each row is a time point; columns are things known <em>before</em> that time. Then any regressor (LightGBM, XGBoost) can learn it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana owner ordering milk for next Monday looks at last Monday, the Monday before, and whether there is a festival. Those are lag and calendar features.</p>
  </div>
  <table class="tbl">
    <tr><th>Feature type</th><th>Example</th><th>Leak check</th></tr>
    <tr><td>Lags</td><td><code>y.shift(12)</code>, <code>y.shift(13)</code></td><td>Lag ≥ forecast horizon</td></tr>
    <tr><td>Rolling stats</td><td><code>y.shift(12).rolling(3).mean()</code></td><td>Shift <em>before</em> rolling</td></tr>
    <tr><td>Calendar</td><td>month, day-of-week, holiday flag</td><td>Always safe</td></tr>
    <tr><td>Known-future exog</td><td>planned promo, price</td><td>Only if known at forecast time</td></tr>
  </table>
  <div class="fx" data-lang="py">import lightgbm as lgb
X = pd.DataFrame({"lag12": y.shift(12), "lag13": y.shift(13), "lag24": y.shift(24),
                  "roll3_lag12": y.shift(12).rolling(3).mean(),
                  "month": y.index.month})
Xtr, Xte = X[:-12].dropna(), X[-12:]
g = lgb.LGBMRegressor(n_estimators=200, learning_rate=0.05, min_child_samples=5,
                      verbose=-1, random_state=0)
# Trees can't extrapolate a trend, so predict the year-over-year change instead
g.fit(Xtr, (y - y.shift(12)).loc[Xtr.index])
pred = g.predict(Xte) + Xte["lag12"].values</div>
  <p>On the holdout (full table in Build It): predicting raw y gives MAE 6.06; predicting the change gives 4.42.</p>
  <div class="callout trap"><span class="label">Trap: trees can't extrapolate</span>
    <p>A tree predicts averages of training rows, so it never goes above the highest y it has seen. With a trend, predict the change or ratio, then add it back.</p>
  </div>
  <div class="cards">
    <div><b>Recursive</b><p>One 1-step model; feed its predictions back as lags.</p><small>Errors pile up</small></div>
    <div><b>Direct</b><p>One model per step ahead h.</p><small>More models, errors don't pile up</small></div>
    <div><b>Lags ≥ horizon</b><p>One model, only lags you'll have.</p><small>What we did above</small></div>
  </div>
  <div class="callout intu"><span class="label">Industry note</span>
    <p>For many related series (sales per store × item), one shared LightGBM across all series usually wins. That is how the M5 forecasting competition was won.</p>
  </div>

  <h2 id="ts-cv"><span class="num">07</span>Time-Series Cross-Validation</h2>
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
  <div class="fx" data-lang="py">from sklearn.model_selection import TimeSeriesSplit
for i, (tr, te) in enumerate(TimeSeriesSplit(n_splits=4, test_size=12).split(y)):
    print(f"fold {i}: train 0-{tr[-1]}  ({len(tr)})   test {te[0]}-{te[-1]}")</div>
  <div class="fx" data-lang="text">fold 0: train 0-71  (72)   test 72-83
fold 1: train 0-83  (84)   test 84-95
fold 2: train 0-95  (96)   test 96-107
fold 3: train 0-107  (108)   test 108-119</div>
  <ul>
    <li><strong>Expanding window</strong>: train grows. Default choice.</li>
    <li><strong>Sliding window</strong> (<code>max_train_size=</code>): train length fixed. Use when old data no longer looks like today.</li>
    <li><strong>Gap</strong> (<code>gap=</code>): skip rows between train and test when features take time to arrive.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: shuffled K-fold</span>
    <p>Shuffled KFold put row 2 in the test set while training on rows up to 118. The model has seen the future, so CV scores look great and production fails.</p>
  </div>

  <h2 id="ts-metrics"><span class="num">08</span>Forecast Metrics</h2>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula idea</th><th>Use when</th><th>Watch out</th></tr>
    <tr><td><strong>MAE</strong></td><td>mean |error|</td><td>Same units as y, easy to explain</td><td>Can't compare series of different size</td></tr>
    <tr><td><strong>RMSE</strong></td><td>√ mean error²</td><td>Big misses are costly</td><td>Outliers dominate</td></tr>
    <tr><td><strong>MAPE</strong></td><td>mean |error / actual| × 100</td><td>Business wants "% off"</td><td>Blows up near 0; favours low forecasts</td></tr>
    <tr><td><strong>sMAPE</strong></td><td>|error| / mean(|actual|, |forecast|)</td><td>% capped at 0–200</td><td>Still odd near 0</td></tr>
    <tr><td><strong>MASE</strong></td><td>MAE ÷ MAE of seasonal naive (on train)</td><td>Comparing across series</td><td>&lt; 1 means you beat the baseline</td></tr>
  </table>
  <div class="fx" data-lang="py">a = np.array([100, 2, 50]); f = np.array([90, 6, 55])
print("abs errors:", np.abs(a-f), " APE%:", np.round(100*np.abs(a-f)/a, 1),
      " MAPE:", round(100*np.mean(np.abs(a-f)/a), 1))
print("sMAPE:", round(100*np.mean(2*np.abs(a-f)/(np.abs(a)+np.abs(f))), 1))</div>
  <div class="fx" data-lang="text">abs errors: [10  4  5]  APE%: [ 10. 200.  10.]  MAPE: 73.3
sMAPE: 40.0</div>
  <div class="callout trap"><span class="label">Trap: MAPE</span>
    <p>Being 4 units off on a day that sold 2 swamps the score. Also, a low forecast can be at most 100% off, but a high one has no limit, so chasing low MAPE pushes forecasts down.</p>
  </div>
  <div class="callout intu"><span class="label">Pick the metric from the cost</span>
    <p>Running out of stock costs more than extra stock? Use a quantile (pinball) loss and forecast the 90th percentile, not the mean.</p>
  </div>

  <h2 id="ts-build"><span class="num">09</span>Build It: The Leaderboard</h2>
  <p>Every model above, trained on 108 months, scored on the last 12 months kept aside.</p>
  <div class="fx" data-lang="py">def mae(a, f):  return np.mean(np.abs(a - f))
def rmse(a, f): return np.sqrt(np.mean((a - f)**2))
def mape(a, f): return 100*np.mean(np.abs((a - f)/a))
def mase(a, f, tr, m=12):           # scale = in-sample seasonal-naive MAE
    return mae(a, f) / np.mean(np.abs(tr.values[m:] - tr.values[:-m]))

res = {"naive (last value)": np.repeat(train.iloc[-1], 12),
       "seasonal naive":     train.iloc[-12:].values,
       "moving avg (3)":     np.repeat(train.iloc[-3:].mean(), 12)}
# + SARIMA, Prophet and LightGBM forecasts from sections 05 and 06</div>
  <table class="tbl out"><caption>Result (12-month holdout)</caption>
    <tr><th>model</th><th>MAE</th><th>RMSE</th><th>MAPE%</th><th>MASE</th></tr>
    <tr><td>naive (last value)</td><td>13.69</td><td>15.89</td><td>7.03</td><td>1.44</td></tr>
    <tr><td>seasonal naive</td><td>10.78</td><td>11.92</td><td>5.67</td><td>1.13</td></tr>
    <tr><td>moving avg (3)</td><td>19.46</td><td>21.06</td><td>10.06</td><td>2.04</td></tr>
    <tr><td>SARIMA(0,1,1)(0,1,1,12)</td><td>3.79</td><td>4.96</td><td>2.00</td><td>0.40</td></tr>
    <tr><td>Prophet</td><td>3.29</td><td>3.94</td><td>1.73</td><td>0.35</td></tr>
    <tr><td>LightGBM (predict y)</td><td>6.06</td><td>7.71</td><td>3.13</td><td>0.64</td></tr>
    <tr><td>LightGBM (predict y − lag12)</td><td>4.42</td><td>6.02</td><td>2.32</td><td>0.46</td></tr>
  </table>
  <ul>
    <li>Seasonal naive misses one year of growth (≈ 9.6), so MASE &gt; 1 on the holdout.</li>
    <li>Prophet and SARIMA win here because the data <em>is</em> a smooth trend + sine wave. Real, messy, many-series data often flips this.</li>
  </ul>

  <h2 id="ts-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use random K-fold cross-validation on time series?</summary><div class="qa-body">Rows are linked in time, so a shuffled split trains on points just after (and before) each test point. The model sees the future, so scores look great and fall apart in production. Use expanding-window splits where training always ends before testing starts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stationarity and why does ARIMA need it?</summary><div class="qa-body">A stationary series keeps the same mean, spread and autocorrelation over time. ARIMA learns fixed coefficients linking past to present; that only works on the future if the link doesn't change. The "I" in ARIMA handles non-stationary data by differencing first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain p, d and q in ARIMA(2,1,0).</summary><div class="qa-body">d = 1: difference once. p = 2: predict the differenced value from its previous two values (AR terms). q = 0: no past forecast errors (MA terms) used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The PACF has significant spikes at lags 1 and 2 then drops to zero; the ACF decays slowly. Which model?</summary><div class="qa-body">AR(2). PACF cutting off after lag p is the AR signature; the slowly decaying ACF confirms it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your LightGBM forecast flatlines below recent values on a growing series. Why, and the fix?</summary><div class="qa-body">Trees can't predict outside the range of y they were trained on, so they can't follow a trend upward. Predict the change (y − lag, or a ratio) or remove the trend first, then add it back. Or blend with a linear/statistical model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You forecast 7 days ahead. Can you use lag_1 as a feature?</summary><div class="qa-body">Only with recursive forecasting (feeding your own predictions back in), where errors pile up. Otherwise use lags ≥ 7, or train a separate direct model per step ahead. Using the true lag_1 when scoring day 7 is leakage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Actuals = [100, 2, 50], forecast = [90, 6, 55]. What's the MAPE, and what's wrong with it?</summary><div class="qa-body">Percentage errors are 10%, 200%, 10%, so MAPE = 73.3%. One tiny day swamps it even though it was only 4 units off. Use MAE, WAPE (sum|e| / sum|a|), or MASE instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does MASE = 1.13 mean?</summary><div class="qa-body">The model's MAE is 13% worse than the seasonal-naive forecast's in-sample MAE. Under 1 beats the baseline. It has no units, so you can average it across thousands of series.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three ways a time-series feature pipeline can leak, other than random splits.</summary><div class="qa-body">(1) Rolling features not shifted, so they include today's target. (2) Scaler or imputer fit on the full series, including the test period. (3) Features revised or published after prediction time (final revenue, late data). Also target encoding computed over all time.</div></details>
</main>`
});
