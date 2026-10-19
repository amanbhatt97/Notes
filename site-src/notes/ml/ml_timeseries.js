// notes/ml/ml_timeseries.js — Time Series Basics
Object.assign(TOPIC_CONTENT, {
  "ml_timeseries": `<main>
  <h1>Time Series Basics</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>Time Series Basics</span></div>
  <p class="lead">A time series is one quantity measured again and again at regular steps: sales every month, orders every day, temperature every hour. Its rows come in an order that cannot be shuffled, and each value leans on the ones before it. This note builds everything a forecaster needs before choosing a model, all on one running example, five years of monthly sales of a small chai shop: autocorrelation, resampling and rolling windows in pandas, trend, seasonality, cycles and noise, classical decomposition by hand (additive and multiplicative), STL, stationarity and the ADF and KPSS tests, differencing, log and Box-Cox transforms, the ACF and PACF computed by hand and how to read them, and leakage-safe lag features. It also opens the Time Series group and shows how its four notes connect.</p>

  <h2 id="ts-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a>, <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a> and <a class="xref" data-note="st_correlation">Correlation</a></b><span>Everything so far assumed the rows were independent draws: one house, one customer, one email, in any order. Regression learnt y from other columns; cross-validation shuffled rows into folds; correlation measured how two columns move together. The open problem: what if there is only one column, measured over time, and the thing that predicts tomorrow is today?</span></li>
    <li><b>This note adds: the language and tools of time-ordered data</b><span>How to see the structure in a series (trend, seasonality, noise), how to split it into parts, how to check whether its behaviour is stable (stationarity), how to make it stable (differencing, transforms), and how to measure its memory (ACF, PACF). No forecasting model yet: this is the toolkit every forecasting model stands on.</span></li>
    <li><b>Leads to: the three ways to forecast</b><span><a class="xref" data-note="ml_arima">ARIMA Family</a> turns the ACF/PACF memory into an equation; <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a> models the trend and seasonal components directly; <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> turns the lag features of section 11 into a supervised learning problem for gradient boosting.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="ts-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="640" height="280" rx="12" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/>
<text x="34" y="28" class="tm" font-size="11.5">TIME SERIES GROUP</text>
<rect x="40" y="40" width="130" height="40" rx="8" class="fs" stroke="currentColor"/><text x="105" y="58" text-anchor="middle" font-size="11.5">Regression</text><text x="105" y="72" text-anchor="middle" class="tm" font-size="10">y from columns</text>
<rect x="40" y="90" width="130" height="40" rx="8" class="fs" stroke="currentColor"/><text x="105" y="108" text-anchor="middle" font-size="11.5">Splits &amp; CV</text><text x="105" y="122" text-anchor="middle" class="tm" font-size="10">honest testing</text>
<rect x="40" y="140" width="130" height="40" rx="8" class="fs" stroke="currentColor"/><text x="105" y="158" text-anchor="middle" font-size="11.5">Correlation</text><text x="105" y="172" text-anchor="middle" class="tm" font-size="10">co-movement</text>
<line x1="170" y1="60" x2="228" y2="100" stroke="currentColor" marker-end="url(#ts-fa)"/><line x1="170" y1="110" x2="228" y2="110" stroke="currentColor" marker-end="url(#ts-fa)"/><line x1="170" y1="160" x2="228" y2="122" stroke="currentColor" marker-end="url(#ts-fa)"/>
<rect x="230" y="80" width="190" height="62" rx="8" class="fb sb" stroke-width="3"/>
<text x="325" y="102" text-anchor="middle" font-size="14" font-weight="700">Time Series Basics</text>
<text x="325" y="119" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE</text>
<text x="325" y="134" text-anchor="middle" class="tm" font-size="10">components · stationarity · ACF</text>
<line x1="420" y1="96" x2="478" y2="62" stroke="currentColor" marker-end="url(#ts-fa)"/>
<line x1="420" y1="111" x2="478" y2="136" stroke="currentColor" marker-end="url(#ts-fa)"/>
<line x1="325" y1="142" x2="325" y2="208" stroke="currentColor" marker-end="url(#ts-fa)"/>
<rect x="480" y="36" width="165" height="50" rx="8" class="ft st"/><text x="562" y="57" text-anchor="middle" font-size="12.5">ARIMA Family</text><text x="562" y="74" text-anchor="middle" class="tm" font-size="10">memory → equation</text>
<rect x="480" y="112" width="165" height="50" rx="8" class="ft st"/><text x="562" y="133" text-anchor="middle" font-size="12.5">ETS &amp; Prophet</text><text x="562" y="150" text-anchor="middle" class="tm" font-size="10">components → model</text>
<rect x="240" y="210" width="170" height="50" rx="8" class="ft st"/><text x="325" y="231" text-anchor="middle" font-size="12.5">ML Forecasting</text><text x="325" y="248" text-anchor="middle" class="tm" font-size="10">lag features → GBM</text>
<line x1="562" y1="86" x2="562" y2="110" stroke="currentColor" stroke-dasharray="3 3"/>
<text x="572" y="102" class="tm" font-size="9.5">both classical</text>
<line x1="410" y1="235" x2="500" y2="165" stroke="currentColor" stroke-dasharray="3 3"/>
<text x="470" y="215" class="tm" font-size="9.5">compared against</text>
<text x="340" y="282" text-anchor="middle" class="tm" font-size="10.5">reading order: Basics → ARIMA → ETS &amp; Prophet → ML Forecasting</text>
</svg><figcaption>The Time Series group. This note is the trunk: ARIMA uses its stationarity and ACF/PACF, ETS and Prophet use its components, and ML forecasting uses its lag features and its warnings about leakage. The two classical families are siblings; the ML approach is judged against them.</figcaption></figure>
  <table class="tbl"><caption>The four notes of the Time Series group</caption>
    <tr><th>Note</th><th>Question it answers</th><th>Uses from this note</th></tr>
    <tr><td><strong>Time Series Basics</strong> (here)</td><td>What is in my series, is it stable, how far back does its memory reach?</td><td>–</td></tr>
    <tr><td><a class="xref" data-note="ml_arima">ARIMA Family</a></td><td>How do I write the memory as an equation and forecast with intervals?</td><td>Stationarity, differencing, ACF/PACF, seasonal period</td></tr>
    <tr><td><a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a></td><td>How do I forecast level, trend and season directly, with holidays?</td><td>Components, additive vs multiplicative, decomposition</td></tr>
    <tr><td><a class="xref" data-note="ml_ts_ml">ML Forecasting</a></td><td>How do I use gradient boosting and many series at once?</td><td>Lag and rolling features, leakage, rolling windows</td></tr>
  </table>

  <h2 id="ts-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>One running example carries the whole note: <strong>Meera's chai shop</strong>, five years (January 2020 to December 2024) of monthly sales in ₹ thousand, sixty numbers, plus a flag for the months when she ran a discount offer. Every concept below is computed on these same sixty numbers. Each concept answers the question the previous one left open.</p>
  <ol class="story">
    <li><b>Time series and autocorrelation</b><span>Q: can we treat the 60 months like 60 independent rows? → no: this month and last month correlate at 0.916; shuffle the months and it drops to −0.04. The order carries the information. But the till records days, not months, and daily numbers are noisy.</span></li>
    <li><b>Resampling and rolling windows</b><span>Q: how do we get the right time step and see the shape through the noise? → <code>resample</code> sums days into months; a rolling 12-month mean (106.75 → 143.25 over five Decembers) shows the slow climb. But a smoothed line hides what kinds of movement are mixed in the raw one.</span></li>
    <li><b>Components</b><span>Q: what is the series made of? → a trend (about +9 per year), a yearly season (October–November high, May low), slower cycles, and noise. But eyeballing cannot tell us how big each part is month by month.</span></li>
    <li><b>Classical decomposition</b><span>Q: how do we measure each part? → a centred 2×12 moving average gives the trend (July 2020: 107.29), averaging what is left by calendar month gives the season (November +10.60), the rest is residual (+2.61 in November 2020). But should the parts be added or multiplied?</span></li>
    <li><b>Additive vs multiplicative</b><span>Q: does the seasonal swing grow with the level? → the shop's yearly swing stays near 24–37 while sales rise 34%: additive fits (residual spread 2.15 vs 2.48). But the moving average loses six months at each end and lets odd months bend the season.</span></li>
    <li><b>STL</b><span>Q: can the season evolve, the edges be filled, and outliers be ignored? → loess-based STL: no missing values, a November effect that fades 14.3 → 10.2, and the biggest residuals point at months with a missing promotion. But all this describes the past; can a model learnt on the past apply to the future?</span></li>
    <li><b>Stationarity</b><span>Q: is the series' behaviour stable over time? → no: the mean jumps from 108.8 to 133.4 between halves. A model with fixed rules needs a stable target. But "looks unstable" is an opinion.</span></li>
    <li><b>ADF and KPSS tests</b><span>Q: how do we decide formally? → two tests with opposite null hypotheses; raw sales fail both (ADF p = 1.00, KPSS p = 0.01). But how do we make the series stable?</span></li>
    <li><b>Differencing and transforms</b><span>Q: how do we remove the trend and season? → subtract last month (d = 1) and last year's month (D = 1): both tests pass (ADF p = 0.000, KPSS p = 0.10). Logs or Box-Cox first if the swing grows. But how far back does the remaining memory reach?</span></li>
    <li><b>ACF</b><span>Q: how strongly is a month linked to 1, 2, …, 13 months before? → the autocorrelation function: −0.41 at lag 1, −0.31 at lag 12, the rest inside the ±0.286 noise band. But the lag-2 link may just be lag 1 passed along twice.</span></li>
    <li><b>PACF</b><span>Q: which lags matter directly, once the shorter lags are accounted for? → the partial autocorrelation: −0.41, then −0.13 at lag 2 (by hand from r₁ and r₂). Together the two plots identify the model shape. But how do we hand this memory to a model?</span></li>
    <li><b>Lag features</b><span>Q: how do we turn memory into input columns without cheating? → <code>shift</code> and shifted rolling means; a three-feature regression gets MAE 4.44 on 2024, while a leaky rolling mean fakes 2.62. Next: write the memory as an equation, the <a class="xref" data-note="ml_arima">ARIMA Family</a>.</span></li>
  </ol>

  <h2 id="ts-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Time Series Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What makes it different</div>
        <ul>
          <li>Values at regular steps; <b>order is information</b></li>
          <li><b>Autocorrelation</b>: corr(y<sub>t</sub>, y<sub>t−1</sub>) = 0.916; shuffled −0.04</li>
          <li>Rows not i.i.d. → no random splits, no shuffled CV</li>
          <li>Horizon h = steps ahead; only the past is available</li>
          <li>⚠ Leakage: any value not known at forecast time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">pandas tools</div>
        <ul>
          <li>DatetimeIndex, <code>freq="MS"</code>; daily log 1,827 rows</li>
          <li><b>resample</b>: days → months (sum), weeks <code>W-SUN</code></li>
          <li><b>rolling(k)</b>: trailing mean; <code>center=True</code> for analysis only</li>
          <li>12-month mean per December: 106.75 … 143.25</li>
          <li>expanding, <code>shift</code>, <code>diff</code>, <code>pct_change</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Components &amp; decomposition</div>
        <ul>
          <li>Trend · season (fixed period s = 12) · cycle (no fixed period) · noise</li>
          <li>Trend = 2×12 centred MA: Jul 2020 = 107.29</li>
          <li>Season = mean detrended value per month, centred to sum 0: Nov +10.60</li>
          <li><b>Additive</b> y = T + S + R (swing constant) vs <b>multiplicative</b> T × S × R</li>
          <li><b>STL</b>: loess, robust, no NaN edges, season may evolve</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stationarity</div>
        <ul>
          <li>Constant mean, variance, autocorrelation over time</li>
          <li>Needed because models learn fixed rules</li>
          <li><b>ADF</b> H₀: unit root (non-stationary) → small p = stationary</li>
          <li><b>KPSS</b> H₀: stationary → small p = non-stationary</li>
          <li>Sales: ADF p 1.00, KPSS p 0.01 → difference</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Making it stationary</div>
        <ul>
          <li>diff(1) removes trend (d); diff(12) removes season (D)</li>
          <li>Feb 2021: (105 − 112) − (94 − 99) = −2</li>
          <li>Undo: y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w<sub>t</sub></li>
          <li>log / Box-Cox (λ) if the swing grows with the level</li>
          <li>⚠ Over-differencing adds noise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory: ACF, PACF, lags</div>
        <ul>
          <li>r<sub>k</sub> = Σ(y<sub>t</sub> − ȳ)(y<sub>t−k</sub> − ȳ) / Σ(y<sub>t</sub> − ȳ)²; band ±1.96/√n</li>
          <li>PACF(2) = (r₂ − r₁²)/(1 − r₁²) = −0.13</li>
          <li>AR: PACF cuts off · MA: ACF cuts off · spike at 12: seasonal</li>
          <li>Lag features: <code>shift(1)</code>, <code>shift(12)</code>, <code>shift(1).rolling(3)</code></li>
          <li>Honest MAE 4.44 vs leaky 2.62</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ts-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole story in one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ts-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Makes Time Series Different</span><span class="rm-sub">Order, autocorrelation, leakage</span></div></div>
      <div class="rm-item rm-done" data-target="ts-pandas"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Resampling &amp; Rolling Windows</span><span class="rm-sub">pandas time tools by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ts-comp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Components</span><span class="rm-sub">Trend, season, cycle, noise</span></div></div>
      <div class="rm-item rm-done" data-target="ts-decomp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Classical Decomposition</span><span class="rm-sub">By hand; additive vs multiplicative</span></div></div>
      <div class="rm-item rm-done" data-target="ts-stl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">STL</span><span class="rm-sub">Loess, robust, evolving season</span></div></div>
      <div class="rm-item rm-done" data-target="ts-stat"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Stationarity</span><span class="rm-sub">What it is and why it matters</span></div></div>
      <div class="rm-item rm-done" data-target="ts-tests"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">ADF &amp; KPSS Tests</span><span class="rm-sub">Two opposite null hypotheses</span></div></div>
      <div class="rm-item rm-done" data-target="ts-diff"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Differencing &amp; Transforms</span><span class="rm-sub">d, D, log, Box-Cox, undoing</span></div></div>
      <div class="rm-item rm-done" data-target="ts-acf"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ACF</span><span class="rm-sub">Autocorrelation by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ts-pacf"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">PACF</span><span class="rm-sub">Direct links; reading the plots</span></div></div>
      <div class="rm-item rm-done" data-target="ts-lags"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Lag Features</span><span class="rm-sub">Memory as columns, without leaks</span></div></div>
      <div class="rm-item rm-done" data-target="ts-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs tabular ML; method tables</span></div></div>
      <div class="rm-item rm-done" data-target="ts-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each concept built from the last</span></div></div>
      <div class="rm-item rm-done" data-target="ts-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="ts-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ts-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ts-what"><span class="num">01</span>What Makes Time Series Different</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Every model so far treated rows as independent: shuffle them, split them at random, nothing changes. Meera hands us sixty monthly sales figures and asks what next month will be. Can we treat her sixty months like sixty independent rows?</p>
  <h3>The running example</h3>
  <p>Meera runs a small chai and snacks shop. Her books give one number per month: total sales in ₹ thousand. She also notes the months when she ran a discount offer (a spring "chai festival" week in some years and a Diwali offer in most Octobers). These sixty numbers are used in every section of this note and of the <a class="xref" data-note="ml_arima">ARIMA</a> note.</p>
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
y = shop["sales"]                                   # the running series, Rs thousand per month
table = pd.DataFrame(y.values.reshape(5, 12), index=range(2020, 2025),
                     columns=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])
print(table)
lagged = pd.DataFrame({"y_t": y, "y_t-1": y.shift(1)})
print(lagged.head(4))
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
  <figure class="viz"><svg viewBox="0 0 680 262" width="680"><line x1="60" y1="207.5" x2="660" y2="207.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="211.5" text-anchor="end" class="tm" font-size="10.5">90</text><line x1="60" y1="157.5" x2="660" y2="157.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="161.5" text-anchor="end" class="tm" font-size="10.5">110</text><line x1="60" y1="107.5" x2="660" y2="107.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="111.5" text-anchor="end" class="tm" font-size="10.5">130</text><line x1="60" y1="57.5" x2="660" y2="57.5" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="61.5" text-anchor="end" class="tm" font-size="10.5">150</text><line x1="60.0" y1="20" x2="60.0" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="110.0" y="238" text-anchor="middle" class="tm" font-size="11">2020</text><line x1="182.0" y1="20" x2="182.0" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="232.0" y="238" text-anchor="middle" class="tm" font-size="11">2021</text><line x1="304.1" y1="20" x2="304.1" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="354.1" y="238" text-anchor="middle" class="tm" font-size="11">2022</text><line x1="426.1" y1="20" x2="426.1" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="476.1" y="238" text-anchor="middle" class="tm" font-size="11">2023</text><line x1="548.1" y1="20" x2="548.1" y2="220" stroke="currentColor" stroke-opacity="0.12"/><text x="598.1" y="238" text-anchor="middle" class="tm" font-size="11">2024</text><polyline points="60.0,185.0 70.2,197.5 80.3,180.0 90.5,180.0 100.7,210.0 110.8,190.0 121.0,167.5 131.2,152.5 141.4,147.5 151.5,117.5 161.7,122.5 171.9,137.5 182.0,152.5 192.2,170.0 202.4,155.0 212.5,155.0 222.7,187.5 232.9,170.0 243.1,145.0 253.2,135.0 263.4,140.0 273.6,130.0 283.7,122.5 293.9,145.0 304.1,157.5 314.2,172.5 324.4,147.5 334.6,182.5 344.7,187.5 354.9,172.5 365.1,147.5 375.3,130.0 385.4,132.5 395.6,102.5 405.8,110.0 415.9,117.5 426.1,120.0 436.3,132.5 446.4,120.0 456.6,137.5 466.8,135.0 476.9,132.5 487.1,112.5 497.3,97.5 507.5,102.5 517.6,77.5 527.8,80.0 538.0,87.5 548.1,100.0 558.3,112.5 568.5,92.5 578.6,92.5 588.8,110.0 599.0,92.5 609.2,72.5 619.3,57.5 629.5,65.0 639.7,32.5 649.8,32.5 660.0,32.5" fill="none" class="sb" stroke-width="1.8"/><polyline points="121.0,164.3 131.2,161.8 141.4,159.6 151.5,157.5 161.7,155.5 171.9,153.8 182.0,152.0 192.2,150.3 202.4,149.3 212.5,149.5 222.7,150.0 232.9,150.3 243.1,150.8 253.2,151.1 263.4,150.9 273.6,151.8 283.7,152.9 293.9,153.0 304.1,153.2 314.2,153.1 324.4,152.6 334.6,151.1 344.7,149.5 354.9,147.8 365.1,145.1 375.3,141.9 385.4,139.1 395.6,136.0 405.8,132.0 415.9,128.1 426.1,125.0 436.3,122.2 446.4,119.6 456.6,117.3 466.8,115.0 476.9,112.5 487.1,110.4 497.3,108.8 507.5,106.8 517.6,103.8 527.8,100.8 538.0,98.1 548.1,94.8 558.3,91.5 568.5,88.2 578.6,84.8 588.8,80.9 599.0,76.7" fill="none" class="sr" stroke-width="2.2" stroke-dasharray="6 4"/><circle cx="90.5" cy="180.0" r="4" class="fg sg" stroke-width="1.5"/><circle cx="151.5" cy="117.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="212.5" cy="155.0" r="4" class="fg sg" stroke-width="1.5"/><circle cx="324.4" cy="147.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="395.6" cy="102.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="466.8" cy="135.0" r="4" class="fg sg" stroke-width="1.5"/><circle cx="517.6" cy="77.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="578.6" cy="92.5" r="4" class="fg sg" stroke-width="1.5"/><circle cx="639.7" cy="32.5" r="4" class="fg sg" stroke-width="1.5"/><line x1="70" y1="252" x2="96" y2="252" class="sb" stroke-width="2"/><text x="102" y="256" font-size="11">monthly sales</text><line x1="220" y1="252" x2="246" y2="252" class="sr" stroke-width="2.2" stroke-dasharray="6 4"/><text x="252" y="256" font-size="11">trend (2x12 moving average)</text><circle cx="470" cy="252" r="4" class="fg sg"/><text x="480" y="256" font-size="11">promotion month</text></svg><figcaption>Meera's monthly sales (₹ thousand) with the trend (dashed) and the promotion months (dots). Sales climb, rise every autumn and dip every early summer.</figcaption></figure>
  <h3>Reading the code and output</h3>
  <ul>
    <li><code>pd.date_range("2020-01-01", periods=60, freq="MS")</code> builds a <strong>DatetimeIndex</strong>: sixty month-start dates. With a date index, pandas knows the time step and can shift, resample and roll by time.</li>
    <li>The table reshapes the 60 values into 5 years × 12 months. Two things jump out without any maths: each row is higher than the one above (growth), and inside every row October and November are high and May is low (a yearly pattern).</li>
    <li><code>y.shift(1)</code> slides the column down one row, so each month sits next to the month before it. February 2020 (94) sits next to January's 99.</li>
    <li><code>y.corr(y.shift(1))</code> is the ordinary Pearson correlation between "this month" and "last month": <strong>0.916</strong>. A strong link. After a random shuffle of the same sixty numbers it is <strong>−0.04</strong>: no link. Same values, different order, the information is gone.</li>
  </ul>
  <h3>By hand: what a lag-1 correlation means</h3>
  <p>Take the first four rows of the lagged table: (94, 99), (101, 94), (101, 101). In each pair the first number is this month, the second is last month. If big months tend to follow big months and small follow small, the pairs line up along a rising diagonal and the correlation is near +1. In the shuffled data, any month can follow any month, so the pairs form a shapeless cloud. The correlation of a series with its own past is called <strong>autocorrelation</strong> ("self-correlation"); section 09 computes it exactly.</p>
  <table class="tbl"><caption>Ordinary tabular data vs a time series</caption>
    <tr><th></th><th>Tabular ML (houses, customers)</th><th>Time series (Meera's months)</th></tr>
    <tr><td>Row order</td><td>Irrelevant; shuffle freely</td><td>The order is the information</td></tr>
    <tr><td>Rows independent?</td><td>Assumed i.i.d. (independent, identically distributed)</td><td>No: autocorrelation 0.916</td></tr>
    <tr><td>Main input</td><td>Other columns</td><td>The series' own past (plus calendar, promotions)</td></tr>
    <tr><td>Validation</td><td>Random k-fold</td><td>Train on the past, test on the future only (<a class="xref" data-note="ml_splits">time-series CV</a>)</td></tr>
    <tr><td>Biggest danger</td><td>Overfitting</td><td><strong>Leakage</strong> of future information</td></tr>
  </table>
  <h3>Words we will use</h3>
  <ul>
    <li><strong>y<sub>t</sub></strong>: the value at time step t. <strong>y<sub>t−k</sub></strong>: the value k steps earlier, called <strong>lag k</strong>.</li>
    <li><strong>Frequency</strong>: the time step (monthly here). <strong>Seasonal period s</strong>: steps per repeating cycle (12 for monthly data with a yearly pattern, 7 for daily data with a weekly pattern, 24 for hourly data with a daily pattern).</li>
    <li><strong>Forecast horizon h</strong>: how many steps ahead we predict. "Next month" is h = 1; "all of next year" is h = 1 … 12.</li>
    <li><strong>Univariate</strong>: only the series itself. <strong>Exogenous variables</strong>: outside inputs such as the promotion flag (they return in SARIMAX in the <a class="xref" data-note="ml_arima">ARIMA</a> note).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket batter's scores. Shuffle a season's innings and you can still compute the average, but you lose "she is in form": a run of good scores tends to continue. Forecasting is about form, and form lives in the order.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>time series</strong> is a sequence y<sub>1</sub>, y<sub>2</sub>, …, y<sub>n</sub> observed at equally spaced times. <strong>Autocorrelation at lag k</strong> is the correlation between y<sub>t</sub> and y<sub>t−k</sub>. <strong>Leakage</strong> is any information in training or features that would not be available at the moment the real forecast is made.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random train/test splits and shuffled k-fold on a time series. The model trains on March 2024 and is tested on February 2024, interpolating between known neighbours, which it can never do live. Scores look great and collapse in production. Always split by time (<a class="xref" data-note="ml_splits">TimeSeriesSplit</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Resampling &amp; Rolling Windows.</b> We started from tidy monthly totals. Meera's till actually records every day, and daily numbers jump around with weekends. How do we get from days to months, and how do we see the slow shape through short-term noise?</div>

  <h2 id="ts-pandas"><span class="num">02</span>Resampling &amp; Rolling Windows</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Raw data rarely arrives at the step we want: the till logs days, the business plans in months. And even at the right step, the line wiggles. How do we change the time step, and how do we smooth a series to see its shape?</p>
  <h3>Resampling: changing the time step</h3>
  <p><strong>Down-sampling</strong> goes from a fine step to a coarse one (days → months) and needs an aggregation rule: sum for sales, mean for temperature, last for a stock price at month end. <strong>Up-sampling</strong> goes the other way (months → days) and needs a fill rule (forward fill, interpolation). In pandas both are <code>series.resample(rule).agg()</code>, which works like a <code>groupby</code> on time buckets.</p>
  <p><strong>By hand.</strong> January 2020 has 31 days, starting on a Wednesday, so it has 8 weekend days (4, 5, 11, 12, 18, 19, 25, 26) and 23 weekdays. If a weekend day sells 1.4 times a weekday, the month has 23 × 1 + 8 × 1.4 = 34.2 "weekday units". January's 99 thousand split this way gives 99 / 34.2 = <strong>2.895</strong> per weekday and 2.895 × 1.4 = <strong>4.053</strong> per weekend day. The first week (Wed 1 to Sun 5 January) sums to 3 × 2.895 + 2 × 4.053 = <strong>16.79</strong>.</p>
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
  <h3>Reading the code and output</h3>
  <ul>
    <li><code>days.dayofweek &gt;= 5</code> is True for Saturday (5) and Sunday (6). <code>groupby(days.to_period("M")).transform("sum")</code> gives each day its month's total weight, so <code>share</code> is the day's fraction of its month. Multiplying by the month's sales (<code>reindex(..., method="ffill")</code> copies each month's value onto its days) gives the daily log: <strong>1,827 days</strong> (2020 and 2024 are leap years).</li>
    <li>The first rows match the hand numbers: 2.895 on weekdays, 4.053 on the weekend.</li>
    <li><code>daily.resample("MS").sum()</code> buckets the days by month start and adds them up, giving back exactly 99.0, 94.0, 101.0. <code>"W-SUN"</code> makes weeks that end on Sunday: 16.79 for the short first week (hand value) and 22.58 for 6–12 January (5 × 2.895 + 2 × 4.053).</li>
  </ul>
  <h3>Rolling windows: smoothing by hand</h3>
  <p>A <strong>rolling mean</strong> of width k replaces each value by the average of a window of k values. The <strong>trailing</strong> window uses this value and the k − 1 before it, so it only uses the past. The <strong>centred</strong> window uses values on both sides.</p>
  <table class="tbl"><caption>3-month windows on the first months of 2020 (sales 99, 94, 101, 101)</caption>
    <tr><th>month</th><th>sales</th><th>trailing 3 (this + 2 before)</th><th>centred 3 (before, this, after)</th></tr>
    <tr><td>Jan</td><td>99</td><td>not enough history: NaN</td><td>no month before: NaN</td></tr>
    <tr><td>Feb</td><td>94</td><td>NaN</td><td>(99 + 94 + 101)/3 = 98.00</td></tr>
    <tr><td>Mar</td><td>101</td><td>(99 + 94 + 101)/3 = 98.00</td><td>(94 + 101 + 101)/3 = 98.67</td></tr>
    <tr><td>Apr</td><td>101</td><td>(94 + 101 + 101)/3 = 98.67</td><td>(101 + 101 + 89)/3 = 97.00</td></tr>
  </table>
  <p>The same number, 98.00, appears for February (centred) and March (trailing): it is the same window, labelled at its middle or at its end. That label is the whole difference between "describing the past" and "something you could know at the time".</p>
  <ul>
    <li><strong>A 12-month window</strong> covers exactly one full season, so the October peak and the May dip cancel and only the level is left. Its value each December: 106.75, 112.75, 114.33, 128.50, 143.25. These are the yearly means, and they show the trend: slow growth in 2021–2022, faster from 2023.</li>
    <li><strong>Rolling std</strong> (11.96, 7.42, 11.46, 8.74, 12.06 for the five years) measures the spread inside each window. It does not grow with the level; remember this for section 04.</li>
    <li><strong>Expanding</strong> windows use all history so far (the expanding mean in December 2020 equals the 12-month mean because only 12 months exist). <code>ewm</code> (exponentially weighted) gives recent months more weight; it is the seed of <a class="xref" data-note="ml_ets_prophet">exponential smoothing</a>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A batter's "average over the last 10 innings" is a trailing rolling window: it is known after every innings and follows form. "Average of the 5 innings before and 5 after this one" is a centred window: a fine way for a commentator to describe a season afterwards, useless for picking tomorrow's team.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Resampling</strong>: re-indexing a series to a new frequency with an aggregation (down) or fill rule (up). <strong>Rolling mean of width k</strong> (trailing): m<sub>t</sub> = (y<sub>t</sub> + y<sub>t−1</sub> + … + y<sub>t−k+1</sub>)/k. Useful pandas pieces: <code>resample</code>, <code>asfreq</code> (change step without aggregating, exposing missing dates as NaN), <code>rolling(k, center=…)</code>, <code>expanding</code>, <code>ewm</code>, <code>shift</code>, <code>diff</code>, <code>pct_change</code> (see <a class="xref" data-note="da_pandas">Pandas</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two classic slips. (1) Centred windows (and <code>rolling(k)</code> that includes the current value) used as model inputs: they contain the value being predicted or later ones. (2) Resampling with the wrong rule: <code>mean</code> instead of <code>sum</code> for sales makes February look 10% weaker than January just because it has fewer days. Also check for missing dates first: <code>asfreq("D")</code> shows gaps as NaN, while <code>resample(...).sum()</code> silently turns an empty month into 0.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Components.</b> The 12-month mean showed a smooth climb, but smoothing threw away the autumn peaks and May dips. What different kinds of movement are mixed in the raw line, and how big is each?</div>

  <h2 id="ts-comp"><span class="num">03</span>Components: Trend, Season, Cycle, Noise</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The sales line rises, peaks every autumn and wobbles. If we model it as one wiggly thing we mix several stories. What separate movements is it made of?</p>
  <div class="cards">
    <div><b>Trend</b><p>The slow, long-run direction of the level.</p><small>Meera: about +9 a year, slower in 2021–22</small></div>
    <div><b>Seasonality</b><p>A pattern that repeats with a <em>fixed, known</em> period.</p><small>Oct–Nov high (Diwali, cool weather), May low (summer heat)</small></div>
    <div><b>Cycle</b><p>Rises and falls with <em>no</em> fixed period, usually over years.</p><small>The 2021–22 slowdown; business cycles</small></div>
    <div><b>Noise (irregular)</b><p>What is left: unpredictable month-to-month surprises.</p><small>A rainy week, a road closure</small></div>
  </div>
  <h3>A first look by hand: subtract each year's mean</h3>
  <p>A crude way to see the season: take each year's mean (the level) and look at how far each month sits above or below it. If the same months are always high, that is seasonality.</p>
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
  <p>Every row has the same shape: April–May lowest (−9.5 to −17.8), October to December highest (up to +19.2). That repetition is seasonality. The yearly means rise 6.0, 1.6, 14.2, 14.8: a trend whose speed changes, which is the "cycle" part (a slowdown in 2021–22 that has no fixed period). The year-to-year wobble of the same month (October 2021 +8.2 against +19.2 a year earlier) is noise, or something we have not modelled yet (October 2021 is the only October without a Diwali offer).</p>
  <p>This crude method has a flaw that the next section fixes: the trend also rises <em>within</em> each year (about 1 a month), so January, at the start of the year, looks about 5.5 below its year's mean partly just because the year has not grown yet. The average shape says January is −5.3; the proper method will say −0.5.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your body weight over five years: a slow gain (trend), a bump every Diwali season and a dip every summer (season), a year of fitness obsession and then a relapse (cycle, no fixed period), and the scale reading a bit differently each morning (noise).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Trend</strong> T<sub>t</sub>: long-run level. <strong>Seasonal component</strong> S<sub>t</sub>: a pattern with fixed period s, S<sub>t</sub> = S<sub>t−s</sub> (exactly or nearly). <strong>Cycle</strong>: fluctuations without a fixed period, usually merged into the trend ("trend-cycle") by decomposition methods. <strong>Remainder</strong> R<sub>t</sub>: everything else.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling any wave "seasonal". Seasonality has a fixed calendar period you can name in advance (12 months, 7 days, 24 hours). A three-year business cycle is not seasonal; a model that treats it as fixed will forecast a dip that never comes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Classical Decomposition.</b> We know the parts exist and roughly how big they are, but the yearly-mean method is biased by the trend within each year. How do we measure trend, season and remainder for every single month?</div>

  <h2 id="ts-decomp"><span class="num">04</span>Classical Decomposition by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Subtracting each calendar year's mean mixed the within-year trend into the season. We need, for every month, three numbers that add back to the sales figure: how much is trend, how much is season, how much is left over. How do we compute them?</p>
  <h3>The idea in plain words</h3>
  <p>Average over exactly one full season and the seasonal ups and downs cancel, leaving the level. So a moving average of width 12, centred on a month, estimates the trend at that month. Subtract it and what remains is season plus noise. Average that remainder over all Novembers and the noise mostly cancels, leaving November's seasonal effect. Whatever is still left is the residual.</p>
  <h3>Step 1: the trend, a 2×12 centred moving average</h3>
  <p>Twelve is even, so a 12-month window has no middle month: its centre falls between June and July. The fix is to average two neighbouring 12-month windows (January–December and February–January), which is the same as one 13-month window where the two end months count half. For July 2020:</p>
  <p style="text-align:center"><strong>T(Jul 2020) = (½·99 + 94 + 101 + 101 + 89 + 97 + 106 + 112 + 114 + 126 + 124 + 118 + ½·112) / 12 = (49.5 + 1182 + 56) / 12 = 107.292</strong></p>
  <p>The first month that has six months on each side is July 2020 and the last is June 2024, so the trend is missing for the first six and last six months (12 values).</p>
  <h3>Step 2–4: detrend, average by month, centre</h3>
  <ul>
    <li><strong>Detrend</strong>: November 2020 sits 124 − 110.792 = 13.208 above its trend. The four Novembers that have a trend give 13.208, 12.167, 8.792, 8.333.</li>
    <li><strong>Average by calendar month</strong>: November's raw index is (13.208 + 12.167 + 8.792 + 8.333)/4 = <strong>10.625</strong>. The same for the other eleven months.</li>
    <li><strong>Centre</strong>: seasonal effects should add to zero over a year (otherwise part of the level is hiding in the season). The twelve raw indices add to 0.354, so subtract 0.354/12 = 0.03 from each: November becomes <strong>10.60</strong>.</li>
    <li><strong>Residual</strong> = sales − trend − seasonal. November 2020: 124 − 110.79 − 10.60 = <strong>+2.61</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">from statsmodels.tsa.seasonal import seasonal_decompose
v = y.values
# Step 1, trend for July 2020 (position 6): a 2x12 centred moving average
trend_jul = (v[0] / 2 + v[1:12].sum() + v[12] / 2) / 12
print(f"trend Jul 2020 = ({v[0]}/2 + {v[1:12].sum()} + {v[12]}/2) / 12 = {trend_jul:.3f}")
trend = y.rolling(12, center=True).mean().rolling(2).mean().shift(-1)   # same 2x12 MA for every month
print("first trend values:", trend.dropna().head(3).round(3).tolist(), " missing at ends:", int(trend.isna().sum()))
# Step 2, detrend; Step 3, average each calendar month; Step 4, centre so the 12 indices add to 0
detr = y - trend
nov = detr[detr.index.month == 11].dropna()
print("Nov detrended:", nov.round(3).tolist(), " mean:", round(nov.mean(), 3))
raw_idx = detr.groupby(detr.index.month).mean()
season = raw_idx - raw_idx.mean()
print("sum of raw indices:", round(raw_idx.sum(), 3), " -&gt; subtract", round(raw_idx.mean(), 3), "from each")
print("seasonal indices:", season.round(2).tolist())
# Step 5, residual = y - trend - seasonal
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
  <p>The code repeats every hand step and then checks against statsmodels' <code>seasonal_decompose</code>: both the seasonal indices and the trend match (<code>True True</code>). <code>y.rolling(12, center=True).mean().rolling(2).mean().shift(-1)</code> is the 2×12 average: a 12-wide window, then the mean of two neighbouring windows, shifted to line up with the centre month. The seasonal indices read like a calendar of the shop: May −12.49 (summer heat), February −7.07 (short month), October +12.13 and November +10.60 (Diwali, cool evenings). January is −0.53, not the −5.3 of the crude method, because the trend now moves inside the year.</p>
  <figure class="viz"><svg viewBox="0 0 680 362" width="680"><rect x="90" y="10" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="49" text-anchor="end" font-size="11.5">observed</text><text x="664" y="20" class="tm" font-size="9.5">165</text><text x="664" y="80" class="tm" font-size="9.5">85</text><polyline points="90.0,67.8 99.7,72.1 109.3,66.0 119.0,66.0 128.6,76.5 138.3,69.5 148.0,61.6 157.6,56.4 167.3,54.6 176.9,44.1 186.6,45.9 196.3,51.1 205.9,56.4 215.6,62.5 225.3,57.2 234.9,57.2 244.6,68.6 254.2,62.5 263.9,53.8 273.6,50.2 283.2,52.0 292.9,48.5 302.5,45.9 312.2,53.8 321.9,58.1 331.5,63.4 341.2,54.6 350.8,66.9 360.5,68.6 370.2,63.4 379.8,54.6 389.5,48.5 399.2,49.4 408.8,38.9 418.5,41.5 428.1,44.1 437.8,45.0 447.5,49.4 457.1,45.0 466.8,51.1 476.4,50.2 486.1,49.4 495.8,42.4 505.4,37.1 515.1,38.9 524.7,30.1 534.4,31.0 544.1,33.6 553.7,38.0 563.4,42.4 573.1,35.4 582.7,35.4 592.4,41.5 602.0,35.4 611.7,28.4 621.4,23.1 631.0,25.8 640.7,14.4 650.3,14.4 660.0,14.4" fill="none" class="sb" stroke-width="1.7"/><rect x="90" y="98" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="137" text-anchor="end" font-size="11.5">trend</text><text x="664" y="108" class="tm" font-size="9.5">165</text><text x="664" y="168" class="tm" font-size="9.5">85</text><polyline points="148.0,148.5 157.6,147.6 167.3,146.9 176.9,146.1 186.6,145.4 196.3,144.8 205.9,144.2 215.6,143.6 225.3,143.2 234.9,143.3 244.6,143.5 254.2,143.6 263.9,143.8 273.6,143.9 283.2,143.8 292.9,144.1 302.5,144.5 312.2,144.6 321.9,144.6 331.5,144.6 341.2,144.4 350.8,143.9 360.5,143.3 370.2,142.7 379.8,141.8 389.5,140.7 399.2,139.7 408.8,138.6 418.5,137.2 428.1,135.8 437.8,134.8 447.5,133.8 457.1,132.9 466.8,132.1 476.4,131.2 486.1,130.4 495.8,129.6 505.4,129.1 515.1,128.4 524.7,127.3 534.4,126.3 544.1,125.3 553.7,124.2 563.4,123.0 573.1,121.9 582.7,120.7 592.4,119.3 602.0,117.8" fill="none" class="sr" stroke-width="1.7"/><rect x="90" y="186" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="225" text-anchor="end" font-size="11.5">seasonal</text><line x1="90" y1="221.0" x2="660" y2="221.0" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="3 3"/><text x="664" y="196" class="tm" font-size="9.5">15</text><text x="664" y="256" class="tm" font-size="9.5">-15</text><polyline points="90.0,222.2 99.7,237.5 109.3,222.3 119.0,236.2 128.6,250.1 138.3,239.8 148.0,221.5 157.6,209.7 167.3,213.2 176.9,192.7 186.6,196.3 196.3,210.4 205.9,222.2 215.6,237.5 225.3,222.3 234.9,236.2 244.6,250.1 254.2,239.8 263.9,221.5 273.6,209.7 283.2,213.2 292.9,192.7 302.5,196.3 312.2,210.4 321.9,222.2 331.5,237.5 341.2,222.3 350.8,236.2 360.5,250.1 370.2,239.8 379.8,221.5 389.5,209.7 399.2,213.2 408.8,192.7 418.5,196.3 428.1,210.4 437.8,222.2 447.5,237.5 457.1,222.3 466.8,236.2 476.4,250.1 486.1,239.8 495.8,221.5 505.4,209.7 515.1,213.2 524.7,192.7 534.4,196.3 544.1,210.4 553.7,222.2 563.4,237.5 573.1,222.3 582.7,236.2 592.4,250.1 602.0,239.8 611.7,221.5 621.4,209.7 631.0,213.2 640.7,192.7 650.3,196.3 660.0,210.4" fill="none" class="sg" stroke-width="1.7"/><rect x="90" y="274" width="570" height="70" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="82" y="313" text-anchor="end" font-size="11.5">residual</text><line x1="90" y1="309.0" x2="660" y2="309.0" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="3 3"/><text x="664" y="284" class="tm" font-size="9.5">8</text><text x="664" y="344" class="tm" font-size="9.5">-8</text><polyline points="148.0,313.7 157.6,313.9 167.3,302.5 176.9,292.1 186.6,297.6 196.3,300.3 205.9,307.6 215.6,312.5 225.3,316.6 234.9,290.2 244.6,320.0 254.2,308.2 263.9,297.8 273.6,301.9 283.2,304.5 292.9,324.0 302.5,302.1 312.2,314.7 321.9,314.2 331.5,312.0 341.2,297.6 350.8,335.4 360.5,320.9 370.2,317.0 379.8,312.2 389.5,309.3 399.2,312.2 408.8,303.4 418.5,316.9 428.1,310.2 437.8,297.9 447.5,296.1 457.1,307.3 466.8,315.9 476.4,289.4 486.1,308.8 495.8,311.7 505.4,310.4 515.1,316.2 524.7,316.1 534.4,318.9 544.1,310.2 553.7,315.8 563.4,314.9 573.1,314.0 582.7,294.0 592.4,305.2 602.0,301.5" fill="none" class="st" stroke-width="1.7"/></svg><figcaption>Classical additive decomposition of Meera's sales: observed = trend + seasonal + residual. The trend is missing for six months at each end; the seasonal row repeats exactly every year; the residual has no visible pattern.</figcaption></figure>
  <h3>Additive or multiplicative?</h3>
  <p>The additive model says November adds the same ₹10.6 thousand every year: y = T + S + R. The multiplicative model says November adds the same <em>percentage</em>: y = T × S × R, with seasonal factors around 1 (1.09 = 9% above trend). Which is right depends on one question: <strong>does the seasonal swing grow as the level grows?</strong> For a shop whose festival rush scales with its customer base it would; for Meera it does not: the yearly peak-to-trough swing was 37, 26, 34, 24, 32 while yearly sales rose 34%.</p>
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
  <ul>
    <li>Multiplicative November 2020: 110.79 × 1.0898 × 1.0270 = 124. The 1.0898 means "November is 9% above trend".</li>
    <li>In ₹, the multiplicative November effect grows with the trend: 9.95 in 2020, 11.91 in 2023. The additive effect is 10.60 in every year.</li>
    <li>Converting both residuals to ₹, the additive version leaves less unexplained (std 2.147 vs 2.477). The data agree with the swing check: <strong>additive</strong>.</li>
  </ul>
  <table class="tbl"><caption>Choosing the form</caption>
    <tr><th></th><th>Additive y = T + S + R</th><th>Multiplicative y = T × S × R</th></tr>
    <tr><td>Seasonal effect</td><td>Fixed amount (₹ +10.6 in November)</td><td>Fixed percentage (+9% in November)</td></tr>
    <tr><td>Use when</td><td>Swing roughly constant as the level changes</td><td>Swing grows with the level (airline passengers, e-commerce)</td></tr>
    <tr><td>Seasonal values</td><td>Add to 0 over a year</td><td>Average 1 over a year</td></tr>
    <tr><td>Trick</td><td>–</td><td>log y = log T + log S + log R: multiplicative becomes additive</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Additive: "every Diwali we sell 10 extra boxes of sweets". Multiplicative: "every Diwali we sell 10% more". When the shop doubles in size, the first rule still says 10 boxes, the second now says twice as many.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Classical decomposition</strong> (period s): T<sub>t</sub> = centred moving average of order s (2×s if s is even); S = mean of y − T (or y/T) for each season position, normalised to sum 0 (or average 1); R = y − T − S (or y/(T·S)).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The centred trend at July 2020 uses sales up to January 2021, six months in the future. Decomposition is for <em>understanding</em> a series and choosing a model, never a source of input features: at forecast time those future months do not exist. The edges are also unreliable: the trend is simply missing for the last six months, exactly the months a forecaster cares about most.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: STL.</b> Classical decomposition forces one fixed seasonal shape for all five years, loses six months at each end, and lets one odd month (an October without the Diwali offer) bend the averages. Can we decompose more flexibly and robustly?</div>

  <h2 id="ts-stl"><span class="num">05</span>STL: Robust, Flexible Decomposition</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The classical method has missing ends, a season that can never change, and no defence against unusual months. Is there a decomposition that fixes all three?</p>
  <h3>Plain words</h3>
  <p><strong>STL</strong> (Seasonal-Trend decomposition using Loess) replaces the moving averages with <strong>loess</strong>: local regression, which fits a small weighted straight line around each point, with nearby points weighted most. Because a local line can be fitted near the edges too, there are no missing values at the ends. STL alternates: estimate the season (smoothing all Januaries together, all Februaries together, …), remove it, estimate the trend, remove it, repeat. Smoothing each calendar month across years lets the seasonal shape drift slowly. With <code>robust=True</code>, months with huge residuals get lower weights in the next round, so they cannot drag the trend and season.</p>
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
  <ul>
    <li>Rows: every month has all three parts, including January 2020 and the last months of 2024 (<strong>0 missing</strong>).</li>
    <li>The November effect is allowed to change: 14.3 in 2020 falling to 10.24 in 2024. Classical decomposition averaged these into one 10.60.</li>
    <li><strong>Seasonally adjusted</strong> sales (sales − seasonal) show the underlying level month by month: 147.3 → 151.1 at the end of 2024. Government statistics and company reports publish "seasonally adjusted" numbers exactly this way.</li>
    <li><strong>Strength</strong> of each component (Hyndman's measure): 1 − var(R)/var(component + R). Trend 0.95 and season 0.84: both strong, so a forecast must handle both.</li>
    <li>The largest residuals are worth reading. April 2022 (−11.1): April usually has the spring offer (2020, 2021, 2024), but in 2022 it ran in March instead, so April looks weak against an "April season" that secretly includes promotions. October 2021 (−8.1) is the only October without the Diwali offer. The residuals are telling us the promotion flag matters; the <a class="xref" data-note="ml_arima">ARIMA</a> note will feed it in as an exogenous variable.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Classical decomposition is a fixed school timetable printed once for five years. STL is a timetable that is re-planned each term from the previous terms, and that ignores the one week the school was shut for floods.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>STL</strong> (Cleveland et al., 1990): additive decomposition y = T + S + R estimated by iterated loess smoothing. Main settings: <code>period</code> (s), <code>seasonal</code> (odd window for smoothing each cycle-subseries; larger = more stable season, default 7), <code>trend</code> window, <code>robust</code>. For multiplicative data, apply STL to log y.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>STL is additive only. Running it on a series whose swing grows with the level spreads the growing swing into the residual. Take logs (or Box-Cox, section 08) first, decompose, then exponentiate the parts.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Stationarity.</b> Decomposition describes what happened. A forecaster needs a rule learnt from the past that still holds in the future. When is a series stable enough for that?</div>

  <h2 id="ts-stat"><span class="num">06</span>Stationarity</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> A forecasting model learns fixed numbers from the past ("next month ≈ 0.6 × this month + …"). That only works if the past and future behave alike. Do Meera's first and last years behave alike?</p>
  <h3>The need</h3>
  <p>Sales averaged 108.8 in the first half of the data and 133.4 in the second. A model that learnt "a typical month is about 109" from the early years is simply wrong later. Estimates of averages, correlations and variances from the past only describe the future if those quantities do not change. That stability is called <strong>stationarity</strong>.</p>
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
  <p>The function <code>halves</code> compares the mean and standard deviation of the first and second half of a series. Raw sales: the mean jumps by 24.6, clearly not stable. Subtracting last month (diff(1)) removes most of the level change, but the halves still differ (0.17 vs 1.87: growth sped up), and the std is large because the seasonal ups and downs are still inside. Subtracting last year's same month (diff(12)) removes the season but keeps the growth (3.79 vs 14.46). Doing both leaves a series whose halves are close (−0.09 vs 0.46). For reference, white noise (independent random numbers) has stable halves, while a <strong>random walk</strong>, the running total of that same noise, wanders (2.63 → −3.98) although every step is pure noise.</p>
  <h3>Two kinds of non-stationarity</h3>
  <table class="tbl">
    <tr><th></th><th>Trend-stationary</th><th>Difference-stationary (unit root)</th></tr>
    <tr><td>Model</td><td>y<sub>t</sub> = a + b·t + stationary noise</td><td>y<sub>t</sub> = y<sub>t−1</sub> + c + stationary noise (random walk with drift)</td></tr>
    <tr><td>After a shock</td><td>Returns to the trend line</td><td>Shock is permanent: the level moves for good</td></tr>
    <tr><td>Fix</td><td>Subtract the fitted trend</td><td>Difference</td></tr>
    <tr><td>Forecast intervals</td><td>Stay roughly constant</td><td>Keep widening with the horizon</td></tr>
  </table>
  <p>The random walk above is the classic difference-stationary series: its value is the sum of all past shocks, so every shock stays forever. Most business series behave more like this than like a fixed line; that is why differencing, not trend-subtraction, is the default fix.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The total runs in a T20 innings keep climbing, so "120" means nothing without knowing the over. Runs <em>per over</em> wobble around a steady 8. The total is non-stationary; the per-over runs (its difference) are stationary, and that is what a commentator can forecast.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A series is <strong>(weakly) stationary</strong> if its mean E[y<sub>t</sub>] = μ is the same for all t, its variance Var(y<sub>t</sub>) = σ² is the same for all t, and its covariance Cov(y<sub>t</sub>, y<sub>t−k</sub>) depends only on the gap k, not on t. (Strict stationarity asks that the whole joint distribution be shift-invariant.) Trend and seasonality both break the first condition. <strong>White noise</strong>: mean 0, constant variance, zero autocorrelation at every lag.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Stationary" does not mean "flat" or "random". A stationary series can have strong memory (lag-1 autocorrelation 0.9) and visible ups and downs; what it cannot have is a mean, spread or correlation structure that drifts over time. Conversely, a series can look calm over a short window and still contain a unit root.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ADF &amp; KPSS Tests.</b> Comparing halves is a judgment call: how big a difference is "not stable"? We need a formal test that gives a yes/no answer with a known error rate.</div>

  <h2 id="ts-tests"><span class="num">07</span>Testing Stationarity: ADF and KPSS</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Eyeballing halves cannot tell a slow random walk from a stationary series with a long memory. How do we decide, with a stated error rate, whether a series needs differencing?</p>
  <h3>The Dickey-Fuller idea</h3>
  <p>If a series is a random walk, this month's level tells you nothing about next month's <em>change</em>: the change is pure noise. If it is stationary, a high level tends to be followed by a fall back toward the mean. So regress the change on last month's level:</p>
  <p style="text-align:center"><strong>Δy<sub>t</sub> = α + β·y<sub>t−1</sub> + error</strong></p>
  <p>β = 0 means "no pull back": a unit root (random walk). β &lt; 0 means a pull back toward the mean: stationary. The test checks whether β is significantly below 0 using its t-statistic, but compared with special <strong>Dickey-Fuller critical values</strong> (about −2.86 to −2.91 at 5% here), not the usual −1.65, because under the null the t-statistic does not follow a t-distribution.</p>
  <p>The <strong>Augmented</strong> DF test (ADF) adds lagged changes Δy<sub>t−1</sub>, …, Δy<sub>t−p</sub> to the regression to soak up short-term memory, so the error is close to white noise; <code>adfuller</code> picks p by AIC.</p>
  <h3>KPSS: the mirror test</h3>
  <p><strong>KPSS</strong> (Kwiatkowski-Phillips-Schmidt-Shin) flips the hypotheses: its null is "stationary", and it rejects if the running sum of deviations from the mean wanders too far. Because the two tests have opposite nulls, using both protects against the weakness of each (ADF is known to have low power: it often fails to reject a unit root on short series).</p>
  <div class="fx" data-lang="py">import warnings; warnings.simplefilter("ignore")      # KPSS warns when p is beyond its table
from statsmodels.tsa.stattools import adfuller, kpss
# Dickey-Fuller by hand: regress the change on last month's level
dy = y.diff().dropna(); ylag = y.shift(1).dropna()
X = np.column_stack([np.ones(len(ylag)), ylag.values])
coef, *_ = np.linalg.lstsq(X, dy.values, rcond=None)
res = dy.values - X @ coef
se = np.sqrt(res @ res / (len(dy) - 2) * np.linalg.inv(X.T @ X)[1, 1])
print(f"change_t = {coef[0]:.3f} + ({coef[1]:.4f}) * level_t-1   t = {coef[1] / se:.2f}")
print("DF test, no extra lags:", round(adfuller(y, maxlag=0, autolag=None)[0], 2),
      " 5% critical value:", round(adfuller(y, maxlag=0, autolag=None)[4]["5%"], 2))
rows = []
for name, s in [("raw", y), ("diff(1)", y.diff()), ("diff(12)", y.diff(12)), ("diff(1)+diff(12)", y.diff().diff(12))]:
    s = s.dropna()
    a_stat, a_p, a_lags, *_ = adfuller(s)              # H0: unit root (NOT stationary)
    k_stat, k_p, *_ = kpss(s, regression="c", nlags="auto")   # H0: stationary
    rows.append([name, len(s), round(a_stat, 2), a_lags, round(a_p, 3), round(k_stat, 3), round(k_p, 3)])
print(pd.DataFrame(rows, columns=["series", "n", "ADF stat", "lags", "ADF p", "KPSS stat", "KPSS p"]).to_string(index=False))</div>
  <div class="fx" data-lang="text">change_t = 7.342 + (-0.0524) * level_t-1   t = -0.95
DF test, no extra lags: -0.95  5% critical value: -2.91
          series  n  ADF stat  lags  ADF p  KPSS stat  KPSS p
             raw 60      2.96    11  1.000      1.063   0.010
         diff(1) 59     -1.27    11  0.643      0.075   0.100
        diff(12) 48     -1.14     4  0.697      0.542   0.032
diff(1)+diff(12) 47     -6.25     1  0.000      0.230   0.100</div>
  <h3>Reading the code and output</h3>
  <ul>
    <li><strong>By hand</strong>: <code>np.linalg.lstsq</code> fits the DF regression. β = −0.0524 (a tiny pull-back), standard error from the usual OLS formula, t = −0.95. The 5% critical value is −2.91: −0.95 is not below it, so we cannot reject the unit root. <code>adfuller(y, maxlag=0, autolag=None)</code> reproduces −0.95 exactly.</li>
    <li><strong>Raw sales</strong>: ADF p = 1.000 (cannot reject unit root) and KPSS p = 0.010 (reject stationarity). Both say: not stationary.</li>
    <li><strong>diff(1)</strong>: ADF p = 0.643 says non-stationary, but KPSS p = 0.100 says stationary. They disagree: the season is still inside (the yearly pattern repeats in the differences), which ADF's 11 lags struggle with on 59 points.</li>
    <li><strong>diff(12)</strong>: both lean non-stationary (ADF p 0.697, KPSS p 0.032): the growth is still there.</li>
    <li><strong>diff(1) + diff(12)</strong>: ADF p = 0.000 and KPSS p = 0.100. Both agree: stationary. So for Meera, <strong>d = 1</strong> and <strong>D = 1</strong>.</li>
    <li>KPSS reports p only between 0.01 and 0.10 (its lookup table), so 0.010 means "0.01 or smaller" and 0.100 means "0.10 or larger".</li>
  </ul>
  <table class="tbl"><caption>The four outcomes</caption>
    <tr><th>ADF (H₀: unit root)</th><th>KPSS (H₀: stationary)</th><th>Conclusion</th><th>Action</th></tr>
    <tr><td>reject (p &lt; 0.05)</td><td>do not reject</td><td>Stationary</td><td>Model as is</td></tr>
    <tr><td>do not reject</td><td>reject</td><td>Non-stationary (unit root)</td><td>Difference</td></tr>
    <tr><td>reject</td><td>reject</td><td>Difference-stationary-ish or structural break</td><td>Difference, check for breaks</td></tr>
    <tr><td>do not reject</td><td>do not reject</td><td>Not enough data to tell (our diff(1))</td><td>Look at the ACF and the plot; consider seasonal differencing</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two judges with opposite starting assumptions. The ADF judge assumes "guilty of wandering" until proven otherwise; the KPSS judge assumes "innocent" until proven otherwise. When both reach the same verdict, you can trust it. When neither can convict, the evidence is thin, not the defendant innocent.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ADF test</strong>: regression Δy<sub>t</sub> = α (+ γt) + β·y<sub>t−1</sub> + Σ<sub>i=1..p</sub> δ<sub>i</sub>Δy<sub>t−i</sub> + ε<sub>t</sub>; H₀: β = 0 (unit root); reject if the t-statistic of β is below the Dickey-Fuller critical value. <strong>KPSS test</strong>: H₀: the series is (level- or trend-) stationary; statistic built from partial sums of residuals; reject for large values. Both are <a class="xref" data-note="st_hypothesis">hypothesis tests</a>: "do not reject" is not proof of the null.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading ADF's p-value backwards. Small ADF p means <em>stationary</em>; small KPSS p means <em>not</em> stationary. Also, both tests are about unit roots and level stability; neither checks seasonality directly, which is why diff(1) passed KPSS while still carrying the yearly pattern. Use the plot and the ACF too.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Differencing &amp; Transforms.</b> The tests told us raw sales need both an ordinary and a seasonal difference. What exactly do these operations do to the numbers, how do we undo them after forecasting, and what if the swing had grown with the level?</div>

  <h2 id="ts-diff"><span class="num">08</span>Differencing and Transforms by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We know Meera's sales must be differenced once ordinarily and once seasonally. What do the differenced numbers look like, how do we get back to sales afterwards, and when do we need a log or Box-Cox transform first?</p>
  <h3>By hand: the first rows</h3>
  <table class="tbl"><caption>Ordinary, seasonal and double differences</caption>
    <tr><th>month</th><th>sales</th><th>d1 = y<sub>t</sub> − y<sub>t−1</sub></th><th>d12 = y<sub>t</sub> − y<sub>t−12</sub></th><th>w = d1 then d12</th></tr>
    <tr><td>Jan 2020</td><td>99</td><td>NaN</td><td>NaN</td><td>NaN</td></tr>
    <tr><td>Feb 2020</td><td>94</td><td>94 − 99 = −5</td><td>NaN</td><td>NaN</td></tr>
    <tr><td>Jan 2021</td><td>112</td><td>112 − 118 = −6</td><td>112 − 99 = 13</td><td>NaN (needs Jan 2020's d1)</td></tr>
    <tr><td>Feb 2021</td><td>105</td><td>105 − 112 = −7</td><td>105 − 94 = 11</td><td>(−7) − (−5) = −2</td></tr>
    <tr><td>Mar 2021</td><td>111</td><td>111 − 105 = 6</td><td>111 − 101 = 10</td><td>6 − 7 = −1</td></tr>
  </table>
  <p>d1 is "change since last month"; d12 is "change since the same month last year" (year-on-year growth in ₹). The double difference w asks: "did this month's change differ from the same change a year ago?" February 2021 fell 7 from January; February 2020 fell 5 from January; so w = −2: this year's January-to-February drop was 2 bigger than last year's. The order does not matter: d12 of d1 equals d1 of d12 (11 − 13 = −2 too).</p>
  <div class="fx" data-lang="py">from scipy import stats
diffs = pd.DataFrame({"sales": y, "d1": y.diff(), "d12": y.diff(12), "d1_d12": y.diff().diff(12)})
print(diffs.iloc[[0, 1, 12, 13, 14]])
w = y.diff().diff(12).dropna()                         # the stationary series, 47 values
# undo the two differences for Feb 2021: y_t = y_t-1 + y_t-12 - y_t-13 + w_t
print("rebuild Feb 2021:", v[12], "+", v[1], "-", v[0], "+", w.iloc[0], "=", v[12] + v[1] - v[0] + w.iloc[0])
d1 = y.diff()
print("undo diff(1) with cumsum:", (v[0] + d1.fillna(0).cumsum()).head(4).tolist())
logy = np.log(y)
print("log-diff Jan-&gt;Feb 2020:", round(logy.iloc[1] - logy.iloc[0], 4), " pct change:", round(y.pct_change().iloc[1], 4))
for lam in [1, 0.5, 0]:
    bc = stats.boxcox(np.array([99., 160.]), lmbda=lam)
    print(f"Box-Cox lambda={lam}: 99 -&gt; {bc[0]:.3f}, 160 -&gt; {bc[1]:.3f}")
bc_y, lam_hat = stats.boxcox(y.values.astype(float))
print("lambda chosen by maximum likelihood:", round(lam_hat, 2))</div>
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
  <figure class="viz"><svg viewBox="0 0 680 250" width="680"><rect x="130" y="10" width="530" height="64" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="122" y="46" text-anchor="end" font-size="11.5">raw sales</text><polyline points="130.0,62.8 139.0,66.8 148.0,61.2 156.9,61.2 165.9,70.8 174.9,64.4 183.9,57.2 192.9,52.4 201.9,50.8 210.8,41.2 219.8,42.8 228.8,47.6 237.8,52.4 246.8,58.0 255.8,53.2 264.7,53.2 273.7,63.6 282.7,58.0 291.7,50.0 300.7,46.8 309.7,48.4 318.6,45.2 327.6,42.8 336.6,50.0 345.6,54.0 354.6,58.8 363.6,50.8 372.5,62.0 381.5,63.6 390.5,58.8 399.5,50.8 408.5,45.2 417.5,46.0 426.4,36.4 435.4,38.8 444.4,41.2 453.4,42.0 462.4,46.0 471.4,42.0 480.3,47.6 489.3,46.8 498.3,46.0 507.3,39.6 516.3,34.8 525.3,36.4 534.2,28.4 543.2,29.2 552.2,31.6 561.2,35.6 570.2,39.6 579.2,33.2 588.1,33.2 597.1,38.8 606.1,33.2 615.1,26.8 624.1,22.0 633.1,24.4 642.0,14.0 651.0,14.0 660.0,14.0" fill="none" class="sb" stroke-width="1.7"/><rect x="130" y="90" width="530" height="64" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="122" y="126" text-anchor="end" font-size="11.5">diff(1)</text><line x1="130" y1="122.0" x2="660" y2="122.0" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/><polyline points="139.0,130.0 148.0,110.8 156.9,122.0 165.9,141.2 174.9,109.2 183.9,107.6 192.9,112.4 201.9,118.8 210.8,102.8 219.8,125.2 228.8,131.6 237.8,131.6 246.8,133.2 255.8,112.4 264.7,122.0 273.7,142.8 282.7,110.8 291.7,106.0 300.7,115.6 309.7,125.2 318.6,115.6 327.6,117.2 336.6,136.4 345.6,130.0 354.6,131.6 363.6,106.0 372.5,144.4 381.5,125.2 390.5,112.4 399.5,106.0 408.5,110.8 417.5,123.6 426.4,102.8 435.4,126.8 444.4,126.8 453.4,123.6 462.4,130.0 471.4,114.0 480.3,133.2 489.3,120.4 498.3,120.4 507.3,109.2 516.3,112.4 525.3,125.2 534.2,106.0 543.2,123.6 552.2,126.8 561.2,130.0 570.2,130.0 579.2,109.2 588.1,122.0 597.1,133.2 606.1,110.8 615.1,109.2 624.1,112.4 633.1,126.8 642.0,101.2 651.0,122.0 660.0,122.0" fill="none" class="st" stroke-width="1.7"/><rect x="130" y="170" width="530" height="64" fill="none" stroke="currentColor" stroke-opacity="0.2"/><text x="122" y="206" text-anchor="end" font-size="11.5">diff(1)+diff(12)</text><line x1="130" y1="202.0" x2="660" y2="202.0" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="3 3"/><polyline points="246.8,207.3 255.8,204.7 264.7,202.0 273.7,204.7 282.7,204.7 291.7,199.3 300.7,207.3 309.7,212.7 318.6,223.3 327.6,188.7 336.6,210.0 345.6,199.3 354.6,199.3 363.6,191.3 372.5,239.3 381.5,172.7 390.5,204.7 399.5,202.0 408.5,194.0 417.5,199.3 426.4,180.7 435.4,218.0 444.4,186.0 453.4,191.3 462.4,199.3 471.4,215.3 480.3,183.3 489.3,194.0 498.3,215.3 507.3,207.3 516.3,204.7 525.3,204.7 534.2,207.3 543.2,196.7 552.2,202.0 561.2,212.7 570.2,202.0 579.2,194.0 588.1,183.3 597.1,223.3 606.1,186.0 615.1,202.0 624.1,202.0 633.1,204.7 642.0,194.0 651.0,199.3 660.0,194.0" fill="none" class="sg" stroke-width="1.7"/></svg><figcaption>Raw sales (trend and season), after diff(1) (level gone, yearly pattern still visible), after diff(1) + diff(12) (a stationary wobble around 0). Each difference costs observations: 60 → 59 → 47.</figcaption></figure>
  <h3>Undoing differences</h3>
  <p>A model will forecast w, but Meera needs sales. Rearranging w<sub>t</sub> = (y<sub>t</sub> − y<sub>t−1</sub>) − (y<sub>t−12</sub> − y<sub>t−13</sub>):</p>
  <p style="text-align:center"><strong>y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w<sub>t</sub></strong></p>
  <p>February 2021 = 112 + 94 − 99 + (−2) = 105, matching the code. For a single difference, undoing is a running sum: 99, then 99 − 5 = 94, then 94 + 7 = 101, which is <code>cumsum</code>. This "integrating back" is the I in ARIMA.</p>
  <h3>Transforms: when the swing grows</h3>
  <ul>
    <li><strong>Log</strong>: turns multiplicative effects into additive ones and makes differences into growth rates: log(94) − log(99) = −0.0518, close to the percentage change −0.0505 (−5.05%). Use when the seasonal swing or the noise grows with the level.</li>
    <li><strong>Box-Cox</strong> with parameter λ: (y<sup>λ</sup> − 1)/λ, and log y when λ = 0. λ = 1 only shifts the series by 1 (no real change: 99 → 98); λ = 0.5 is a square-root-type squeeze (99 → 2(√99 − 1) = 17.900, 160 → 23.298); λ = 0 is the log (4.595, 5.075). Smaller λ squeezes large values harder. Yeo-Johnson extends this to zero and negative values (<a class="xref" data-note="ml_features">Feature Engineering</a>).</li>
    <li>scipy's <code>boxcox</code> chose λ = −0.28. That λ makes the <em>histogram</em> of all 60 values look most normal, which is not the goal for a time series (the goal is a stable variance over time). Meera's swing is already stable, so no transform is needed. For time series, choose λ by checking whether the swing is stable (Guerrero's method automates this).</li>
  </ul>
  <h3>Over-differencing</h3>
  <p>Each difference removes structure; one too many adds structure. Differencing white noise e<sub>t</sub> gives e<sub>t</sub> − e<sub>t−1</sub>, whose lag-1 autocorrelation is exactly −0.5 and whose variance has doubled. Signs of over-differencing: lag-1 ACF near or below −0.5, the variance going <em>up</em> after a difference, or (in the <a class="xref" data-note="ml_arima">ARIMA</a> note) a fitted MA coefficient near −1. Rule of thumb: seasonal difference first if the season is strong, then an ordinary one only if still needed; d + D rarely exceeds 2.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking "how much did prices rise since last month?" instead of "what is the price?". The price level drifts forever; the monthly rise hovers around a steady inflation rate. Asking "how did this month's rise compare with the same month last year?" also removes the festival effect.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Backshift operator</strong> B: B·y<sub>t</sub> = y<sub>t−1</sub>, B<sup>k</sup>y<sub>t</sub> = y<sub>t−k</sub>. <strong>Ordinary difference</strong>: (1 − B)y<sub>t</sub> = y<sub>t</sub> − y<sub>t−1</sub>; applied d times: (1 − B)<sup>d</sup>. <strong>Seasonal difference</strong>: (1 − B<sup>s</sup>)y<sub>t</sub> = y<sub>t</sub> − y<sub>t−s</sub>; applied D times. Meera's stationary series: w<sub>t</sub> = (1 − B)(1 − B<sup>12</sup>)y<sub>t</sub>. <strong>Box-Cox</strong>: y<sup>(λ)</sup> = (y<sup>λ</sup> − 1)/λ for λ ≠ 0, ln y for λ = 0 (y &gt; 0).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to undo the transform, or undoing it naively. Forecasts of w must be integrated back with the formula above. Forecasts made on the log scale, exponentiated, give the <em>median</em> forecast, not the mean (multiply by about e<sup>σ²/2</sup> for the mean). And a difference loses the first value(s): keep them, you need them to rebuild the levels.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ACF.</b> We now have a stable series w. A stable series can still have memory: this month's w may be linked to last month's or to the same month last year. How strong is the link at each lag?</div>

  <h2 id="ts-acf"><span class="num">09</span>The ACF: Autocorrelation by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> In section 01 we saw that raw sales correlate 0.916 with last month, but that was mostly the shared trend. Now that w is stationary, how much memory is left, and at which lags: last month, two months back, the same month last year?</p>
  <h3>The formula in plain words</h3>
  <p>For lag k: centre the series (subtract its mean), multiply each centred value by the centred value k steps earlier, add up those products, and divide by the sum of squares of the centred values. The top measures "do values k apart move together?"; the bottom scales it into −1 … +1.</p>
  <p style="text-align:center"><strong>r<sub>k</sub> = Σ<sub>t=k+1..n</sub> (y<sub>t</sub> − ȳ)(y<sub>t−k</sub> − ȳ) / Σ<sub>t=1..n</sub> (y<sub>t</sub> − ȳ)²</strong></p>
  <h3>By hand on eight values of w</h3>
  <p>The first eight values of w (February to September 2021) are −2, −1, 0, −1, −1, 1, −2, −4. Mean = −10/8 = −1.25. Centred: −0.75, 0.25, 1.25, 0.25, 0.25, 2.25, −0.75, −2.75.</p>
  <table class="tbl">
    <tr><th>quantity</th><th>products</th><th>sum</th></tr>
    <tr><td>denominator Σc²</td><td>0.5625 + 0.0625 + 1.5625 + 0.0625 + 0.0625 + 5.0625 + 0.5625 + 7.5625</td><td>15.5</td></tr>
    <tr><td>lag 1: c<sub>t</sub>·c<sub>t−1</sub></td><td>(0.25)(−0.75) + (1.25)(0.25) + (0.25)(1.25) + (0.25)(0.25) + (2.25)(0.25) + (−0.75)(2.25) + (−2.75)(−0.75) = −0.1875 + 0.3125 + 0.3125 + 0.0625 + 0.5625 − 1.6875 + 2.0625</td><td>1.4375</td></tr>
    <tr><td>lag 2: c<sub>t</sub>·c<sub>t−2</sub></td><td>(1.25)(−0.75) + (0.25)(0.25) + (0.25)(1.25) + (2.25)(0.25) + (−0.75)(0.25) + (−2.75)(2.25)</td><td>−6.375</td></tr>
  </table>
  <p>r₁ = 1.4375/15.5 = <strong>0.0927</strong> and r₂ = −6.375/15.5 = <strong>−0.4113</strong>. Note the denominator always uses all n values while the numerator has only n − k products; this keeps the ACF well behaved for large k.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf, pacf
small = w.iloc[:8]                                     # Feb-Sep 2021 of the stationary series
print("8 values:", small.tolist(), " mean:", small.mean())
c = small - small.mean()                               # centre
print("centred :", c.tolist())
den = (c ** 2).sum()
num1 = (c.values[1:] * c.values[:-1]).sum()
num2 = (c.values[2:] * c.values[:-2]).sum()
print(f"r1 = {num1:.4f} / {den:.4f} = {num1 / den:.4f};  r2 = {num2:.4f} / {den:.4f} = {num2 / den:.4f}")
print("statsmodels:", acf(small, nlags=2).round(4).tolist())
r = acf(w, nlags=13)
print("ACF of w, lags 1-13:", r[1:].round(2).tolist())
print("95% band: +/-", round(1.96 / np.sqrt(len(w)), 3))
print("ACF of raw sales, lags 1-13:", acf(y, nlags=13)[1:].round(2).tolist())</div>
  <div class="fx" data-lang="text">8 values: [-2.0, -1.0, 0.0, -1.0, -1.0, 1.0, -2.0, -4.0]  mean: -1.25
centred : [-0.75, 0.25, 1.25, 0.25, 0.25, 2.25, -0.75, -2.75]
r1 = 1.4375 / 15.5000 = 0.0927;  r2 = -6.3750 / 15.5000 = -0.4113
statsmodels: [1.0, 0.0927, -0.4113]
ACF of w, lags 1-13: [-0.41, 0.06, 0.03, 0.24, -0.19, -0.02, 0.25, -0.1, -0.13, -0.11, 0.28, -0.31, -0.12]
95% band: +/- 0.286
ACF of raw sales, lags 1-13: [0.86, 0.71, 0.59, 0.49, 0.34, 0.25, 0.26, 0.29, 0.32, 0.35, 0.42, 0.45, 0.36]</div>
  <h3>Reading the output</h3>
  <ul>
    <li>statsmodels' <code>acf</code> matches the hand values exactly (it returns lag 0, always 1, first). But eight values are far too few to mean anything: with all 47 values of w, r₁ is <strong>−0.41</strong>, not +0.09.</li>
    <li>The <strong>noise band</strong> ±1.96/√n = ±0.286 is how large an autocorrelation pure white noise produces by chance 95% of the time. Only bars outside it count as evidence. Here: lag 1 (−0.41) and lag 12 (−0.31). Lag 11 (0.28) is just inside.</li>
    <li>For contrast, the raw sales ACF starts at 0.86 and fades slowly (0.71, 0.59, …) and rises again near lag 12: the signature of a trend plus a season. A slowly decaying ACF is itself a sign that differencing is needed.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680"><text x="20" y="18" class="tm" font-size="11">ACF of w = diff(1)+diff(12) of sales, lags 1-13 (shaded: 95% noise band +/-0.286)</text><rect x="20" y="55.4" width="400" height="57.2" class="fs"/><line x1="20" y1="84.0" x2="420" y2="84.0" stroke="currentColor"/><rect x="28" y="84.0" width="14" height="40.8" class="fr sr"/><text x="35" y="156" text-anchor="middle" class="tm" font-size="10">1</text><text x="35" y="135.8" text-anchor="middle" class="tr" font-size="10">-0.41</text><rect x="58" y="78.1" width="14" height="5.9" class="fb sb"/><text x="65" y="156" text-anchor="middle" class="tm" font-size="10">2</text><rect x="88" y="80.7" width="14" height="3.3" class="fb sb"/><text x="95" y="156" text-anchor="middle" class="tm" font-size="10">3</text><rect x="118" y="59.9" width="14" height="24.1" class="fb sb"/><text x="125" y="156" text-anchor="middle" class="tm" font-size="10">4</text><rect x="148" y="84.0" width="14" height="19.1" class="fb sb"/><text x="155" y="156" text-anchor="middle" class="tm" font-size="10">5</text><rect x="178" y="84.0" width="14" height="2.4" class="fb sb"/><text x="185" y="156" text-anchor="middle" class="tm" font-size="10">6</text><rect x="208" y="58.6" width="14" height="25.4" class="fb sb"/><text x="215" y="156" text-anchor="middle" class="tm" font-size="10">7</text><rect x="238" y="84.0" width="14" height="9.6" class="fb sb"/><text x="245" y="156" text-anchor="middle" class="tm" font-size="10">8</text><rect x="268" y="84.0" width="14" height="13.4" class="fb sb"/><text x="275" y="156" text-anchor="middle" class="tm" font-size="10">9</text><rect x="298" y="84.0" width="14" height="10.8" class="fb sb"/><text x="305" y="156" text-anchor="middle" class="tm" font-size="10">10</text><rect x="328" y="55.9" width="14" height="28.1" class="fb sb"/><text x="335" y="156" text-anchor="middle" class="tm" font-size="10">11</text><rect x="358" y="84.0" width="14" height="30.6" class="fr sr"/><text x="365" y="156" text-anchor="middle" class="tm" font-size="10">12</text><text x="365" y="125.6" text-anchor="middle" class="tr" font-size="10">-0.31</text><rect x="388" y="84.0" width="14" height="12.0" class="fb sb"/><text x="395" y="156" text-anchor="middle" class="tm" font-size="10">13</text><text x="20" y="184" class="tm" font-size="11">PACF of w, lags 1-13</text><rect x="20" y="221.4" width="400" height="57.2" class="fs"/><line x1="20" y1="250.0" x2="420" y2="250.0" stroke="currentColor"/><rect x="28" y="250.0" width="14" height="40.8" class="fr sr"/><text x="35" y="322" text-anchor="middle" class="tm" font-size="10">1</text><text x="35" y="301.8" text-anchor="middle" class="tr" font-size="10">-0.41</text><rect x="58" y="250.0" width="14" height="12.9" class="fb sb"/><text x="65" y="322" text-anchor="middle" class="tm" font-size="10">2</text><rect x="88" y="249.1" width="14" height="0.9" class="fb sb"/><text x="95" y="322" text-anchor="middle" class="tm" font-size="10">3</text><rect x="118" y="217.4" width="14" height="32.6" class="fr sr"/><text x="125" y="322" text-anchor="middle" class="tm" font-size="10">4</text><text x="125" y="213.4" text-anchor="middle" class="tr" font-size="10">0.33</text><rect x="148" y="243.6" width="14" height="6.4" class="fb sb"/><text x="155" y="322" text-anchor="middle" class="tm" font-size="10">5</text><rect x="178" y="250.0" width="14" height="12.9" class="fb sb"/><text x="185" y="322" text-anchor="middle" class="tm" font-size="10">6</text><rect x="208" y="232.7" width="14" height="17.3" class="fb sb"/><text x="215" y="322" text-anchor="middle" class="tm" font-size="10">7</text><rect x="238" y="244.3" width="14" height="5.7" class="fb sb"/><text x="245" y="322" text-anchor="middle" class="tm" font-size="10">8</text><rect x="268" y="250.0" width="14" height="13.6" class="fb sb"/><text x="275" y="322" text-anchor="middle" class="tm" font-size="10">9</text><rect x="298" y="250.0" width="14" height="35.5" class="fr sr"/><text x="305" y="322" text-anchor="middle" class="tm" font-size="10">10</text><text x="305" y="296.5" text-anchor="middle" class="tr" font-size="10">-0.35</text><rect x="328" y="249.7" width="14" height="0.8" class="fb sb"/><text x="335" y="322" text-anchor="middle" class="tm" font-size="10">11</text><rect x="358" y="250.0" width="14" height="8.0" class="fb sb"/><text x="365" y="322" text-anchor="middle" class="tm" font-size="10">12</text><rect x="388" y="250.0" width="14" height="27.3" class="fb sb"/><text x="395" y="322" text-anchor="middle" class="tm" font-size="10">13</text></svg><figcaption>The correlogram (ACF) and partial correlogram (PACF) of Meera's stationary series w. Red bars cross the 95% noise band. ACF: lag 1 and lag 12. PACF: lag 1, plus isolated lags 4 and 10 (by chance, 1 bar in 20 crosses).</figcaption></figure>
  <h3>What the two significant bars mean for the shop</h3>
  <ul>
    <li><strong>Lag 1, negative (−0.41)</strong>: when this month's change is unusually high compared with last year's, next month's tends to be unusually low. A good month is partly "given back". One cause we already suspect: a one-month promotion lifts sales once, so the change goes up then down.</li>
    <li><strong>Lag 12, negative (−0.31)</strong>: a surprise in one month is partly reversed in the same month next year. The seasonal pattern is not perfectly fixed, and seasonal differencing over-corrects a little.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An echo test in a hall: clap and listen at 1 second, 2 seconds, 12 seconds. The ACF is the loudness of the echo at each delay. Bars inside the band are the background hum of the hall; only louder echoes are real.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Autocorrelation function</strong>: ρ<sub>k</sub> = Cov(y<sub>t</sub>, y<sub>t−k</sub>)/Var(y<sub>t</sub>) for a stationary series, estimated by r<sub>k</sub> above. The plot of r<sub>k</sub> against k is the <strong>correlogram</strong>; under white noise, r<sub>k</sub> ≈ Normal(0, 1/n), giving the ±1.96/√n band (statsmodels' <code>plot_acf</code> draws a slightly wider, Bartlett band that grows with k).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading the ACF of a non-stationary series. A trend makes every value correlate with every other, so all bars are large and fade slowly, hiding the real short-term memory. Make the series stationary first, then read the ACF. And with 20 bars, expect about one to cross the band by pure chance.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: PACF.</b> If this month depends on last month, and last month on the month before, then this month will also correlate with two months back, through the chain, even if there is no direct link. The ACF cannot tell direct links from passed-along ones.</div>

  <h2 id="ts-pacf"><span class="num">10</span>The PACF: Direct Links Only</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> r₂ mixes the direct effect of two months ago with the indirect one that travels through last month. Once we already know last month, does two months ago add anything?</p>
  <h3>Plain words</h3>
  <p>The <strong>partial autocorrelation</strong> at lag k is the correlation between y<sub>t</sub> and y<sub>t−k</sub> after removing what the in-between lags 1 … k − 1 explain. Equivalently: regress y<sub>t</sub> on y<sub>t−1</sub>, …, y<sub>t−k</sub>; the coefficient on y<sub>t−k</sub> is PACF(k). At lag 1 there is nothing in between, so PACF(1) = r₁.</p>
  <h3>By hand: PACF(2) from r₁ and r₂</h3>
  <p>If only lag 1 mattered, the chain alone would make r₂ = r₁·r₁ = r₁². So the part of r₂ <em>not</em> explained by the chain is r₂ − r₁², rescaled by how much variation is left after using lag 1 (1 − r₁²):</p>
  <p style="text-align:center"><strong>PACF(2) = (r₂ − r₁²) / (1 − r₁²) = (0.0590 − 0.1668) / 0.8332 = −0.1294</strong></p>
  <p>with r₁ = −0.4084 and r₂ = 0.0590 on all 47 values of w. The chain would predict r₂ = 0.167; the actual 0.059 is a bit less, so the direct lag-2 link is small and negative, and inside the band: lag 2 adds little once lag 1 is known.</p>
  <div class="fx" data-lang="py">r1, r2 = acf(w, nlags=2)[1:]
phi22 = (r2 - r1 ** 2) / (1 - r1 ** 2)
print(f"r1 = {r1:.4f}, r2 = {r2:.4f}")
print(f"PACF(2) = (r2 - r1^2) / (1 - r1^2) = ({r2:.4f} - {r1 ** 2:.4f}) / {1 - r1 ** 2:.4f} = {phi22:.4f}")
print("statsmodels pacf (ywm):", pacf(w, nlags=2, method="ywm")[1:].round(4).tolist())
# the regression view: coefficient on lag 2 when lag 1 is also in the model
lagdf = pd.DataFrame({"w": w, "l1": w.shift(1), "l2": w.shift(2)}).dropna()
A = np.column_stack([np.ones(len(lagdf)), lagdf.l1, lagdf.l2])
print("OLS coef on lag 2:", round(np.linalg.lstsq(A, lagdf.w, rcond=None)[0][2], 4),
      "  pacf(method='ols'):", round(pacf(w, nlags=2, method="ols")[2], 4))
print("PACF of w, lags 1-13:", pacf(w, nlags=13, method="ywm")[1:].round(2).tolist())
# signatures on long simulated series: AR(1) with phi = 0.7, MA(1) with theta = 0.7
e = np.random.default_rng(7).normal(size=500)
ar = np.zeros(500)
for t in range(1, 500):
    ar[t] = 0.7 * ar[t - 1] + e[t]
ma = e[1:] + 0.7 * e[:-1]
for name, s in [("AR(1)", ar), ("MA(1)", ma)]:
    print(f"{name}  ACF {acf(s, nlags=4)[1:].round(2).tolist()}  PACF {pacf(s, nlags=4, method='ywm')[1:].round(2).tolist()}")</div>
  <div class="fx" data-lang="text">r1 = -0.4084, r2 = 0.0590
PACF(2) = (r2 - r1^2) / (1 - r1^2) = (0.0590 - 0.1668) / 0.8332 = -0.1294
statsmodels pacf (ywm): [-0.4084, -0.1294]
OLS coef on lag 2: -0.1366   pacf(method='ols'): -0.1366
PACF of w, lags 1-13: [-0.41, -0.13, 0.01, 0.33, 0.06, -0.13, 0.17, 0.06, -0.14, -0.35, 0.0, -0.08, -0.27]
AR(1)  ACF [0.68, 0.47, 0.33, 0.25]  PACF [0.68, 0.01, 0.02, 0.04]
MA(1)  ACF [0.44, -0.04, -0.03, -0.02]  PACF [0.44, -0.3, 0.18, -0.14]</div>
  <ul>
    <li>The hand formula equals statsmodels' Yule-Walker PACF (<code>method="ywm"</code>) to four decimals. The regression version (<code>method="ols"</code>) literally fits w<sub>t</sub> on w<sub>t−1</sub> and w<sub>t−2</sub> and reads the lag-2 coefficient: −0.1366. The two estimates differ slightly on short series; both say "small".</li>
    <li>The full PACF of w: −0.41 at lag 1, then small, with chance crossings at lags 4 (0.33) and 10 (−0.35). At lag 12 the PACF is only −0.08, while the ACF had −0.31.</li>
    <li>The simulated series show the classic signatures on 500 points. <strong>AR(1)</strong> ("this value = 0.7 × last value + noise"): ACF fades geometrically 0.68, 0.47, 0.33, 0.25; PACF cuts off after lag 1 (0.68, then ≈ 0). <strong>MA(1)</strong> ("this value = noise + 0.7 × last noise"): ACF cuts off after lag 1 (0.44, then ≈ 0); PACF fades with alternating signs (0.44, −0.30, 0.18, −0.14).</li>
  </ul>
  <h3>Reading ACF and PACF together</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>ACF</th><th>PACF</th><th>Suggests</th></tr>
    <tr><td>Autoregressive AR(p)</td><td>Tails off (geometric or wave)</td><td><strong>Cuts off</strong> after lag p</td><td>p = last significant PACF lag</td></tr>
    <tr><td>Moving average MA(q)</td><td><strong>Cuts off</strong> after lag q</td><td>Tails off</td><td>q = last significant ACF lag</td></tr>
    <tr><td>ARMA(p, q)</td><td>Tails off</td><td>Tails off</td><td>Try small p and q, compare by AIC</td></tr>
    <tr><td>Spike at lag s (12) in ACF only</td><td colspan="2">Seasonal MA at lag 12</td><td>Q = 1</td></tr>
    <tr><td>Spike at lag s in PACF only</td><td colspan="2">Seasonal AR at lag 12</td><td>P = 1</td></tr>
    <tr><td>ACF barely decays</td><td colspan="2">Still non-stationary</td><td>Difference (again)</td></tr>
  </table>
  <p>Meera's w: ACF has a spike at lag 1 then nothing (cut-off) plus a spike at 12; PACF has a spike at lag 1 and a small lag 2. Read one way: MA(1) plus seasonal MA(1). Read the other way: PACF also cuts after lag 1, so AR(1) is just as plausible. Short series often leave this ambiguity; the <a class="xref" data-note="ml_arima">ARIMA</a> note settles it with AIC and residual checks.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Rumours in a village. Your grandmother's opinion correlates with yours partly because it reached you through your mother. The ACF counts both routes. The PACF asks: if we already know what your mother said, does your grandmother still add anything? Only a direct line of influence survives.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partial autocorrelation</strong> φ<sub>kk</sub>: the last coefficient in the best linear prediction of y<sub>t</sub> from y<sub>t−1</sub>, …, y<sub>t−k</sub>. φ<sub>11</sub> = ρ<sub>1</sub>; φ<sub>22</sub> = (ρ<sub>2</sub> − ρ<sub>1</sub>²)/(1 − ρ<sub>1</sub>²); higher lags via the Durbin-Levinson recursion on the Yule-Walker equations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating the cut-off rules as exact. On 47 points the bars are noisy (lags 4 and 10 crossed the band by chance), the patterns blur, and real data are often mixtures. Use ACF/PACF to propose a few small candidate models, not to pick one; then compare them with information criteria and residual checks.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Lag Features.</b> ACF and PACF told us which past values carry information (lag 1, lag 12). How do we give those past values to a model as input columns, and how do we avoid sneaking in the future?</div>

  <h2 id="ts-lags"><span class="num">11</span>Lag Features: Memory as Columns</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> A regression or a gradient boosting model needs a table: one row per month, input columns, a target. How do we turn "last month and the same month last year matter" into columns, without letting any column contain information from the month being predicted or later?</p>
  <h3>By hand</h3>
  <p>For the row of February 2021 (target 105):</p>
  <ul>
    <li><strong>lag_1</strong> = January 2021 = 112 (<code>shift(1)</code>).</li>
    <li><strong>lag_12</strong> = February 2020 = 94 (<code>shift(12)</code>): the seasonal lag the ACF pointed to.</li>
    <li><strong>roll_3</strong> = mean of November 2020, December 2020, January 2021 = (124 + 118 + 112)/3 = 118.00: <code>shift(1).rolling(3).mean()</code>, a rolling window that ends <em>before</em> the target month.</li>
    <li><strong>leaky_roll_3</strong> = mean of December, January, February = (118 + 112 + 105)/3 = 111.67: <code>rolling(3).mean()</code> without the shift. It contains the target 105 itself.</li>
  </ul>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error as mae
feat = pd.DataFrame({"sales": y,
                     "lag_1": y.shift(1),                         # last month
                     "lag_12": y.shift(12),                       # same month last year
                     "roll_3": y.shift(1).rolling(3).mean(),      # mean of the 3 months BEFORE this one
                     "month": y.index.month,
                     "promo": shop.promo})
feat["leaky_roll_3"] = y.rolling(3).mean()                        # WRONG: includes this month's sales
print(feat.iloc[12:15].round(2))
data = feat.dropna()
train, test = data[:"2023"], data["2024":]
for cols in [["lag_1", "lag_12", "promo"], ["lag_1", "lag_12", "promo", "leaky_roll_3"]]:
    m = LinearRegression().fit(train[cols], train.sales)
    print(f"{' + '.join(cols):40s} test MAE = {mae(test.sales, m.predict(test[cols])):.2f}")
print(f"{'seasonal naive (= lag_12)':40s} test MAE = {mae(test.sales, test.lag_12):.2f}")
print(f"{'naive (= lag_1)':40s} test MAE = {mae(test.sales, test.lag_1):.2f}")</div>
  <div class="fx" data-lang="text">            sales  lag_1  lag_12  roll_3  month  promo  leaky_roll_3
2021-01-01    112  118.0    99.0  122.67      1      0        118.00
2021-02-01    105  112.0    94.0  118.00      2      0        111.67
2021-03-01    111  105.0   101.0  111.67      3      0        109.33
lag_1 + lag_12 + promo                   test MAE = 4.44
lag_1 + lag_12 + promo + leaky_roll_3    test MAE = 2.62
seasonal naive (= lag_12)                test MAE = 14.75
naive (= lag_1)                          test MAE = 5.17</div>
  <h3>Reading the output</h3>
  <ul>
    <li>The printed rows match the hand values (February 2021: lag_1 112, lag_12 94, roll_3 118.00, leaky 111.67). Rows with NaN (the first 12 months, which have no lag_12) are dropped; we train on 2021–2023 and test on 2024, split by time.</li>
    <li>The honest model (lag_1, lag_12, promo) gets <strong>MAE 4.44</strong> on 2024, one month ahead at a time. Adding the leaky column "improves" it to <strong>2.62</strong>, an improvement that cannot exist live, because in real life February's sales are unknown when February's forecast is made.</li>
    <li>Baselines: naive (repeat last month) 5.17; seasonal naive (same month last year) 14.75, poor here because 2024 grew 14.75 over 2023 and seasonal naive ignores growth. Always compute baselines; any model must beat them to be worth keeping.</li>
  </ul>
  <p>These features forecast one step ahead. To forecast 12 months ahead, lag_1 for December 2024 is not known in January 2024; you either feed predictions back in (recursive) or train one model per horizon using only lags ≥ h (direct). Those strategies, time-series cross-validation and global models live in <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Predicting a student's final exam from her mid-term and last year's final is fair. "Predicting" it from the class average that already includes her final mark is cheating, and a model will happily cheat if the column is there.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lag feature</strong>: x<sub>t</sub> = y<sub>t−k</sub>. <strong>Rolling feature</strong> (leakage-safe): a statistic over y<sub>t−k</sub> … y<sub>t−k−w+1</sub> with k ≥ the forecast horizon. <strong>Calendar features</strong>: month, day of week, holiday flags (known in advance). <strong>Known-future exogenous</strong> inputs: planned promotions, prices; <strong>unknown-future</strong> inputs (weather, competitor prices) must themselves be forecast or lagged.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Any feature computed on the full series before splitting: rolling means without a shift, scalers or target encodings fitted on all dates, "month's total" columns that are only final after the month ends. Ask of every column: "at 9 a.m. on the day I make this forecast, would I really have this number?" (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the forecasting models.</b> Lag columns plus a regression are a start, but we have not yet written down a model of how the series generates itself, nor produced honest multi-step forecasts with intervals. That is the <a class="xref" data-note="ml_arima">ARIMA Family</a>. First, the comparisons and the whole chain at a glance.</div>

  <h2 id="ts-compare"><span class="num">12</span>Comparisons</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have met several tools that do similar jobs: two decompositions, two tests, two correlation plots, several ways to remove trend. When do we use which?</p>
  <table class="tbl"><caption>Decomposition methods</caption>
    <tr><th></th><th>Yearly-mean subtraction</th><th>Classical (moving average)</th><th>STL</th></tr>
    <tr><td>Trend</td><td>One level per year</td><td>2×12 centred MA</td><td>Loess</td></tr>
    <tr><td>Season</td><td>Biased by within-year trend (Jan −5.3)</td><td>Fixed every year (Jan −0.53, Nov 10.60)</td><td>May evolve (Nov 14.3 → 10.2)</td></tr>
    <tr><td>Ends</td><td>Fine</td><td>6 months missing each end</td><td>Complete</td></tr>
    <tr><td>Outliers</td><td>Not robust</td><td>Not robust</td><td>Robust option</td></tr>
    <tr><td>Multiplicative</td><td>Ratios</td><td><code>model="multiplicative"</code></td><td>Only via log</td></tr>
    <tr><td>Use for</td><td>A first glance</td><td>Teaching, quick look</td><td>Real analysis, seasonal adjustment</td></tr>
  </table>
  <table class="tbl"><caption>Removing non-stationarity</caption>
    <tr><th>Problem</th><th>Fix</th><th>Meera</th></tr>
    <tr><td>Stochastic trend (unit root)</td><td>diff(1), d = 1</td><td>Yes</td></tr>
    <tr><td>Deterministic trend</td><td>Subtract fitted trend (or include a trend term)</td><td>Partly; differencing handles it too</td></tr>
    <tr><td>Season</td><td>diff(s), D = 1, or seasonal dummies / Fourier terms</td><td>Yes, D = 1</td></tr>
    <tr><td>Variance grows with level</td><td>log or Box-Cox</td><td>No (swing stable)</td></tr>
    <tr><td>Structural break</td><td>Dummy for the break, or model only after it</td><td>None</td></tr>
  </table>
  <table class="tbl"><caption>Time-series tools vs their ordinary-ML cousins</caption>
    <tr><th>Time-series tool</th><th>Ordinary cousin</th><th>What changes</th></tr>
    <tr><td>ACF</td><td><a class="xref" data-note="st_correlation">Pearson correlation</a></td><td>Correlates a column with its own shifted copy</td></tr>
    <tr><td>PACF</td><td>Regression coefficient holding others fixed</td><td>The "others" are the in-between lags</td></tr>
    <tr><td>Lag features</td><td><a class="xref" data-note="ml_features">Feature engineering</a></td><td>Every feature must respect time</td></tr>
    <tr><td>TimeSeriesSplit</td><td><a class="xref" data-note="ml_splits">k-fold CV</a></td><td>Folds respect time; no shuffling</td></tr>
    <tr><td>Decomposition</td><td>Residual analysis in <a class="xref" data-note="ml_reg_diag">regression diagnostics</a></td><td>Parts are defined by time scale</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> The tables compare tools side by side; next, the chain that links every concept to the one before it, on Meera's numbers.</div>

  <h2 id="ts-connect"><span class="num">13</span>How It All Connects</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have built twelve concepts one after another. How exactly is each one computed from the ones before it, which question does each answer, and which are fragile?</p>
  <figure class="viz"><svg viewBox="0 0 700 400" width="700">
<defs><marker id="ts-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="14" width="150" height="50" rx="8" class="fs" stroke="currentColor"/><text x="85" y="35" text-anchor="middle" font-size="12">daily till log</text><text x="85" y="52" text-anchor="middle" class="tm" font-size="10.5">1,827 days</text>
<line x1="160" y1="39" x2="188" y2="39" stroke="currentColor" marker-end="url(#ts-ca)"/><text x="174" y="30" text-anchor="middle" class="tm" font-size="9">resample</text>
<rect x="190" y="14" width="160" height="50" rx="8" class="fb sb"/><text x="270" y="35" text-anchor="middle" font-size="12">monthly sales y</text><text x="270" y="52" text-anchor="middle" class="tm" font-size="10.5">r(lag 1) = 0.916</text>
<line x1="350" y1="39" x2="378" y2="39" stroke="currentColor" marker-end="url(#ts-ca)"/><text x="364" y="30" text-anchor="middle" class="tm" font-size="9">rolling</text>
<rect x="380" y="14" width="150" height="50" rx="8" class="fb sb"/><text x="455" y="35" text-anchor="middle" font-size="12">12-month mean</text><text x="455" y="52" text-anchor="middle" class="tm" font-size="10.5">106.75 → 143.25</text>
<line x1="530" y1="39" x2="558" y2="39" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="560" y="14" width="130" height="50" rx="8" class="fb sb"/><text x="625" y="35" text-anchor="middle" font-size="12">2×12 MA trend</text><text x="625" y="52" text-anchor="middle" class="tm" font-size="10.5">Jul 2020 107.29</text>
<line x1="625" y1="64" x2="625" y2="92" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="430" y="94" width="260" height="50" rx="8" class="ft st"/><text x="560" y="115" text-anchor="middle" font-size="12">y − T → average by month → S</text><text x="560" y="132" text-anchor="middle" class="tm" font-size="10.5">Nov +10.60, resid +2.61 (additive)</text>
<line x1="430" y1="119" x2="372" y2="119" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="210" y="94" width="160" height="50" rx="8" class="ft st"/><text x="290" y="115" text-anchor="middle" font-size="12">STL (loess, robust)</text><text x="290" y="132" text-anchor="middle" class="tm" font-size="10.5">Nov 14.3 → 10.2</text>
<line x1="210" y1="119" x2="168" y2="119" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="10" y="94" width="156" height="50" rx="8" class="fr sr"/><text x="88" y="115" text-anchor="middle" font-size="12">trend + season ⇒</text><text x="88" y="132" text-anchor="middle" class="tm" font-size="10.5">not stationary</text>
<line x1="88" y1="144" x2="88" y2="172" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="10" y="174" width="200" height="50" rx="8" class="fv" stroke="currentColor"/><text x="110" y="195" text-anchor="middle" font-size="12">ADF + KPSS</text><text x="110" y="212" text-anchor="middle" class="tm" font-size="10.5">raw p 1.00 / 0.01</text>
<line x1="210" y1="199" x2="248" y2="199" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="250" y="174" width="220" height="50" rx="8" class="fv" stroke="currentColor"/><text x="360" y="195" text-anchor="middle" font-size="12">w = (1 − B)(1 − B¹²) y</text><text x="360" y="212" text-anchor="middle" class="tm" font-size="10.5">p 0.000 / 0.10: stationary</text>
<line x1="470" y1="199" x2="508" y2="199" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="510" y="174" width="180" height="50" rx="8" class="fg sg"/><text x="600" y="195" text-anchor="middle" font-size="12">ACF r_k of w</text><text x="600" y="212" text-anchor="middle" class="tm" font-size="10.5">−0.41 (1), −0.31 (12)</text>
<line x1="600" y1="224" x2="600" y2="252" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="470" y="254" width="220" height="50" rx="8" class="fg sg"/><text x="580" y="275" text-anchor="middle" font-size="12">PACF = (r₂ − r₁²)/(1 − r₁²)</text><text x="580" y="292" text-anchor="middle" class="tm" font-size="10.5">−0.41, −0.13</text>
<line x1="470" y1="279" x2="398" y2="279" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="200" y="254" width="196" height="50" rx="8" class="fg sg"/><text x="298" y="275" text-anchor="middle" font-size="12">lag features</text><text x="298" y="292" text-anchor="middle" class="tm" font-size="10.5">lag_1, lag_12: MAE 4.44</text>
<line x1="298" y1="304" x2="298" y2="332" stroke="currentColor" marker-end="url(#ts-ca)"/>
<line x1="580" y1="304" x2="580" y2="332" stroke="currentColor" marker-end="url(#ts-ca)"/>
<rect x="200" y="334" width="196" height="46" rx="8" class="fs" stroke="currentColor"/><text x="298" y="362" text-anchor="middle" font-size="12">→ ML Forecasting</text>
<rect x="470" y="334" width="220" height="46" rx="8" class="fs" stroke="currentColor"/><text x="580" y="362" text-anchor="middle" font-size="12">→ ARIMA (p, d, q)(P, D, Q)₁₂</text>
<line x1="88" y1="224" x2="88" y2="334" stroke="currentColor" stroke-dasharray="3 3"/>
<rect x="10" y="334" width="156" height="46" rx="8" class="fs" stroke="currentColor"/><text x="88" y="355" text-anchor="middle" font-size="11.5">components →</text><text x="88" y="370" text-anchor="middle" font-size="11.5">ETS &amp; Prophet</text>
</svg><figcaption>Daily data are resampled to months; rolling means reveal the trend; the 2×12 average gives the trend for decomposition, whose leftovers give the season and residual; trend and season make the series non-stationary, which the tests confirm; two differences make it stationary; its ACF and PACF measure its memory; that memory becomes lag features or an ARIMA equation.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Meera's sales</caption>
    <tr><th>Concept</th><th>Built from</th><th>Formula</th><th>Question it answers</th><th>Meera's value</th><th>Robust / sensitive · use when</th></tr>
    <tr><td>Autocorrelation (raw)</td><td>Pearson correlation, <code>shift</code></td><td>corr(y<sub>t</sub>, y<sub>t−1</sub>)</td><td>Does order matter?</td><td>0.916 (shuffled −0.04)</td><td>Inflated by trend; a first check only</td></tr>
    <tr><td>Resample</td><td>time buckets + aggregation</td><td>Σ daily in month</td><td>Right time step?</td><td>Jan 2020: 99.0</td><td>Wrong rule (mean vs sum) distorts</td></tr>
    <tr><td>Rolling mean</td><td>window average</td><td>(y<sub>t</sub> + … + y<sub>t−k+1</sub>)/k</td><td>Shape through noise?</td><td>12-mo: 106.75 → 143.25</td><td>Trailing for features; centred for analysis</td></tr>
    <tr><td>Trend T</td><td>rolling mean, centred, 2×12</td><td>(½y<sub>t−6</sub> + y<sub>t−5..t+5</sub> + ½y<sub>t+6</sub>)/12</td><td>Long-run level?</td><td>Jul 2020: 107.29</td><td>Missing 6 at each end; sensitive to outliers</td></tr>
    <tr><td>Season S</td><td>y − T, averaged per month, centred</td><td>mean(y − T | month) − mean of the 12</td><td>Calendar effect?</td><td>Nov +10.60, May −12.49</td><td>Fixed shape; absorbs regular promotions</td></tr>
    <tr><td>Residual R</td><td>y, T, S</td><td>y − T − S</td><td>What is left?</td><td>Nov 2020: +2.61; std 2.15</td><td>Should look like noise</td></tr>
    <tr><td>Multiplicative form</td><td>ratios instead of differences</td><td>y = T × S × R</td><td>Swing grows with level?</td><td>Nov ×1.0898; resid std 2.48</td><td>Use when swing grows; else additive</td></tr>
    <tr><td>STL</td><td>loess smoothing, iterated</td><td>y = T + S + R</td><td>Flexible, robust parts?</td><td>Nov 14.3 → 10.2; strengths 0.95/0.84</td><td>Robust; additive only (log first)</td></tr>
    <tr><td>Stationarity</td><td>mean, variance, autocovariance</td><td>constant over t</td><td>Can past rules apply to the future?</td><td>halves 108.8 vs 133.4: no</td><td>Required by ARIMA</td></tr>
    <tr><td>ADF</td><td>regression Δy on y<sub>t−1</sub></td><td>t of β vs DF critical value</td><td>Unit root?</td><td>raw t −0.95 &gt; −2.91; w: p 0.000</td><td>Low power on short series</td></tr>
    <tr><td>KPSS</td><td>partial sums of deviations</td><td>H₀ stationary</td><td>Confirm ADF</td><td>raw p 0.01; w: p 0.10</td><td>Opposite null to ADF</td></tr>
    <tr><td>Differencing</td><td>backshift B</td><td>(1 − B)(1 − B<sup>12</sup>)y</td><td>Make it stationary</td><td>Feb 2021 w = −2</td><td>Over-differencing adds noise</td></tr>
    <tr><td>Box-Cox / log</td><td>power transform</td><td>(y<sup>λ</sup> − 1)/λ; ln y</td><td>Stabilise growing swing</td><td>not needed (λ = 1)</td><td>Undo carefully (median vs mean)</td></tr>
    <tr><td>ACF</td><td>centred products / sum of squares</td><td>r<sub>k</sub> = Σc<sub>t</sub>c<sub>t−k</sub>/Σc<sub>t</sub>²</td><td>Memory at each lag?</td><td>−0.41 (1), −0.31 (12); band ±0.286</td><td>Only on stationary data</td></tr>
    <tr><td>PACF</td><td>r₁, r₂, … (Yule-Walker)</td><td>(r₂ − r₁²)/(1 − r₁²)</td><td>Direct link only?</td><td>−0.41, −0.13</td><td>Noisy at high lags</td></tr>
    <tr><td>Lag features</td><td>ACF/PACF choice of lags, <code>shift</code></td><td>x = y<sub>t−k</sub>, k ≥ h</td><td>Memory as inputs</td><td>MAE 4.44 (leaky 2.62)</td><td>Leakage if not shifted</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The chain shows the correct use; next, the ways each link is most often broken in practice and in interviews.</div>

  <h2 id="ts-traps"><span class="num">14</span>Common Mistakes</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We know how the tools work. Where do practitioners, and interview answers, most often go wrong?</p>
  <div class="callout trap"><span class="label">Trap: random splits and shuffled CV</span>
    <p>The model sees the future of every test month. Split by time; use TimeSeriesSplit or a rolling origin.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: features that peek</span>
    <p>Centred or unshifted rolling means, decomposition parts, scalers fitted on all dates. The leaky rolling mean faked MAE 2.62 against an honest 4.44.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: resampling with the wrong aggregation</span>
    <p>Sales are summed, levels are averaged or taken at period end. Check for gaps with <code>asfreq</code> before resampling.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: additive decomposition on a growing swing</span>
    <p>Check whether the yearly swing grows with the level (Meera's: 37, 26, 34, 24, 32, so no); if it does, use multiplicative or log first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading ADF backwards</span>
    <p>ADF: small p = stationary. KPSS: small p = non-stationary. Use both; "cannot reject" is not proof.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the season when testing</span>
    <p>diff(1) passed KPSS while the yearly pattern was still inside. Look at the plot and the ACF at lag s.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: over-differencing</span>
    <p>Lag-1 ACF near −0.5 or rising variance after a difference means one difference too many.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading ACF/PACF on raw data or too literally</span>
    <p>Trend makes every bar large. On short series, chance crossings happen (lags 4 and 10 here); propose candidates, then compare them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Box-Cox λ from the histogram</span>
    <p>scipy's λ (−0.28 here) normalises the distribution of values, not the variance over time. Choose λ to stabilise the swing, or skip it when the swing is stable.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything is covered; next comes the whole note condensed for revision.</div>

  <h2 id="ts-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>A time series is one quantity measured at equal time steps, where each value depends on earlier ones (autocorrelation), so order matters and only the past may be used. Before modelling we look at its parts (trend, season, cycle, noise), check whether its behaviour is stable (stationarity), make it stable by differencing or transforming, and measure its memory with the ACF and PACF. Running example: Meera's chai shop, monthly sales Jan 2020 – Dec 2024 (₹ thousand), 99 → 160, with discount-offer months flagged.</p>
  <h3>The story in one line per step</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer on Meera's data</th><th>Weakness that forces the next step</th></tr>
    <tr><td>Autocorrelation</td><td>Are months independent rows?</td><td>No: corr with last month 0.916 (shuffled −0.04)</td><td>Data come daily and noisy</td></tr>
    <tr><td>Resample, rolling</td><td>Right step? Shape?</td><td>Days → months; 12-mo mean 106.75 → 143.25</td><td>Smoothing hides the parts</td></tr>
    <tr><td>Components</td><td>What is it made of?</td><td>Trend, yearly season, cycle, noise</td><td>Not measured per month</td></tr>
    <tr><td>Classical decomposition</td><td>How big is each part?</td><td>T Jul 2020 107.29; S Nov +10.60; R +2.61</td><td>Add or multiply?</td></tr>
    <tr><td>Additive vs multiplicative</td><td>Does the swing grow?</td><td>No (37, 26, 34, 24, 32): additive</td><td>Missing ends, fixed season, not robust</td></tr>
    <tr><td>STL</td><td>Flexible, robust parts?</td><td>No NaN; Nov 14.3 → 10.2</td><td>Describes, does not forecast</td></tr>
    <tr><td>Stationarity</td><td>Is behaviour stable?</td><td>Mean 108.8 vs 133.4: no</td><td>Eyeballing is subjective</td></tr>
    <tr><td>ADF, KPSS</td><td>Formal decision?</td><td>Raw p 1.00 / 0.01: non-stationary</td><td>How to fix?</td></tr>
    <tr><td>Differencing</td><td>Make it stable?</td><td>d = 1, D = 1: p 0.000 / 0.10</td><td>How much memory is left?</td></tr>
    <tr><td>ACF</td><td>Link at each lag?</td><td>−0.41 (lag 1), −0.31 (lag 12)</td><td>Direct vs passed along?</td></tr>
    <tr><td>PACF</td><td>Direct link?</td><td>−0.41, −0.13</td><td>How to feed a model?</td></tr>
    <tr><td>Lag features</td><td>Memory as inputs?</td><td>lag_1, lag_12, promo: MAE 4.44 (leaky 2.62)</td><td>→ ARIMA for a full model with intervals</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <div class="cards">
    <div><b>Autocorrelation</b><p>r<sub>k</sub> = Σ<sub>t&gt;k</sub>(y<sub>t</sub> − ȳ)(y<sub>t−k</sub> − ȳ) / Σ(y<sub>t</sub> − ȳ)²: correlation of the series with itself k steps back. Noise band ±1.96/√n.</p><small>w: r₁ = −0.41, band ±0.286 (n = 47)</small></div>
    <div><b>Partial autocorrelation</b><p>Coefficient of y<sub>t−k</sub> when y<sub>t</sub> is regressed on lags 1 … k. PACF(1) = r₁; PACF(2) = (r₂ − r₁²)/(1 − r₁²).</p><small>(0.059 − 0.167)/0.833 = −0.129</small></div>
    <div><b>Decomposition</b><p>Additive y = T + S + R; multiplicative y = T × S × R. T = 2×s centred moving average; S = mean of (y − T) per season position, centred to sum 0; R = remainder. STL uses loess instead.</p><small>124 = 110.79 + 10.60 + 2.61</small></div>
    <div><b>Stationarity</b><p>Mean, variance and autocovariance Cov(y<sub>t</sub>, y<sub>t−k</sub>) do not depend on t. White noise: mean 0, constant variance, no autocorrelation. Random walk: y<sub>t</sub> = y<sub>t−1</sub> + e<sub>t</sub>, non-stationary.</p><small>Needed for fixed-coefficient models</small></div>
    <div><b>ADF and KPSS</b><p>ADF: Δy<sub>t</sub> = α + βy<sub>t−1</sub> + Σδ<sub>i</sub>Δy<sub>t−i</sub> + ε; H₀ β = 0 (unit root); reject when t is below the DF critical value (≈ −2.9). KPSS: H₀ stationary.</p><small>Raw: t = −0.95; ADF p 1.00, KPSS p 0.01</small></div>
    <div><b>Differencing and transforms</b><p>B y<sub>t</sub> = y<sub>t−1</sub>; (1 − B)<sup>d</sup> ordinary, (1 − B<sup>s</sup>)<sup>D</sup> seasonal. Undo: y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w<sub>t</sub>. Box-Cox (y<sup>λ</sup> − 1)/λ, log at λ = 0.</p><small>Feb 2021: 112 + 94 − 99 − 2 = 105</small></div>
  </div>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Sales 2020 … 2024 (yearly means)</td><td>106.75, 112.75, 114.33, 128.50, 143.25; yearly swing 37, 26, 34, 24, 32</td></tr>
    <tr><td>Lag-1 correlation raw / shuffled</td><td>0.916 / −0.04</td></tr>
    <tr><td>Daily split, January 2020</td><td>weekday 2.895, weekend 4.053 (99 / 34.2 units)</td></tr>
    <tr><td>Trend July 2020</td><td>(49.5 + 1182 + 56)/12 = 107.292</td></tr>
    <tr><td>Seasonal indices (Jan … Dec)</td><td>−0.53, −7.07, −0.56, −6.51, −12.49, −8.05, −0.22, 4.82, 3.36, 12.13, 10.60, 4.52</td></tr>
    <tr><td>Residual std additive / multiplicative</td><td>2.147 / 2.477 → additive</td></tr>
    <tr><td>STL strengths trend / season</td><td>0.95 / 0.84</td></tr>
    <tr><td>ADF p / KPSS p: raw, d1, d12, d1+d12</td><td>1.000/0.01, 0.643/0.10, 0.697/0.03, 0.000/0.10</td></tr>
    <tr><td>ACF of w (lags 1, 2, 12)</td><td>−0.41, 0.06, −0.31; PACF −0.41, −0.13, −0.08</td></tr>
    <tr><td>2024 one-step MAE</td><td>lags + promo 4.44; leaky 2.62; naive 5.17; seasonal naive 14.75</td></tr>
  </table>
  <h3>When to use what</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Use</th><th>Avoid / caution</th></tr>
    <tr><td>Rolling mean</td><td>See the trend; trailing version as a feature</td><td>Centred version as a feature (leak)</td></tr>
    <tr><td>Classical decomposition</td><td>Quick look, teaching</td><td>Edges, evolving seasons, outliers</td></tr>
    <tr><td>STL</td><td>Real decomposition, seasonal adjustment</td><td>Multiplicative data without a log</td></tr>
    <tr><td>ADF + KPSS</td><td>Deciding d (and checking D)</td><td>Short series (low power); seasonality not tested directly</td></tr>
    <tr><td>Differencing</td><td>Unit roots, seasons</td><td>Over-differencing (lag-1 ACF ≈ −0.5)</td></tr>
    <tr><td>ACF / PACF</td><td>Proposing AR/MA orders, choosing lags</td><td>Non-stationary data; reading single chance spikes</td></tr>
  </table>
  <h3>Key traps</h3>
  <ul>
    <li>Never shuffle or split a time series randomly; validate on later dates only.</li>
    <li>Every feature must be computable at forecast time: shift before rolling.</li>
    <li>ADF small p = stationary; KPSS small p = non-stationary.</li>
    <li>Decomposition and centred smoothing use the future: analysis only.</li>
    <li>Make the series stationary before reading ACF/PACF; treat the cut-off rules as hints.</li>
  </ul>
  <h3>Rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Monthly data with a yearly pattern: seasonal period?</td><td>s = 12 (weekly pattern in daily data: 7).</td></tr>
    <tr><td>This month 112, last month 118, same month last year 99, the month before that 100. What is w = (1 − B)(1 − B¹²)y?</td><td>(112 − 118) − (99 − 100) = −6 + 1 = −5.</td></tr>
    <tr><td>r₁ = 0.5, r₂ = 0.25: PACF(2)?</td><td>(0.25 − 0.25)/(1 − 0.25) = 0: lag 2 adds nothing beyond lag 1 (an AR(1) pattern).</td></tr>
    <tr><td>ADF p = 0.40, KPSS p = 0.01: conclusion?</td><td>Both say non-stationary: difference.</td></tr>
    <tr><td>n = 100: 95% noise band of the ACF?</td><td>±1.96/√100 = ±0.196.</td></tr>
  </table>

  <h2 id="ts-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use random k-fold cross-validation on a time series?</summary><div class="qa-body">Rows are autocorrelated and the order carries information. Random folds put future months in training and past months in testing, so the model interpolates between known neighbours, which it can never do live; scores are optimistic. Use time-ordered splits (TimeSeriesSplit, rolling origin), training only on data before each test window.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the components of a time series and give an example of each.</summary><div class="qa-body">Trend (Meera's sales rising about 9 a year), seasonality (October–November peak, May dip, fixed 12-month period), cycle (the 2021–22 slowdown, no fixed period), and noise (month-to-month surprises). Decomposition usually merges trend and cycle into a "trend-cycle".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through classical additive decomposition.</summary><div class="qa-body">(1) Trend = centred moving average of length s (2×12 for monthly data, end months half-weighted): July 2020 = (49.5 + 1182 + 56)/12 = 107.29. (2) Detrend: y − T. (3) Average the detrended values for each calendar month (Nov 10.625). (4) Centre the indices to sum to 0 (Nov 10.60). (5) Residual = y − T − S (Nov 2020 +2.61). The trend is missing s/2 values at each end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Additive or multiplicative: how do you decide?</summary><div class="qa-body">Check whether the seasonal swing grows with the level. Constant swing (Meera: 37, 26, 34, 24, 32 while the level rose 34%) → additive. Swing proportional to level → multiplicative, or take logs and use additive. You can also compare residual sizes (2.15 vs 2.48 here).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does STL improve over classical decomposition?</summary><div class="qa-body">Loess smoothing gives values at the ends (no NaN), the seasonal shape may evolve over years (Nov 14.3 → 10.2), a robust option down-weights outliers, and window sizes are tunable. It is additive only, so log multiplicative data first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stationarity and why do classical models need it?</summary><div class="qa-body">A (weakly) stationary series has constant mean and variance and an autocovariance that depends only on the lag. Models such as ARIMA learn fixed coefficients from the past; they only describe the future if the series' statistical behaviour does not change. Trend and seasonality violate the constant-mean condition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the ADF test and how it differs from KPSS.</summary><div class="qa-body">ADF regresses Δy<sub>t</sub> on y<sub>t−1</sub> (plus lagged differences); H₀ is a unit root (β = 0, non-stationary); a t-statistic below the Dickey-Fuller critical value (≈ −2.9) rejects it, so small p = stationary. KPSS has the opposite null (stationary), so small p = non-stationary. Using both guards against ADF's low power; when they disagree (Meera's diff(1)), look at the plot and ACF.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a unit root, and why does it matter for forecasts?</summary><div class="qa-body">A unit root means y<sub>t</sub> = y<sub>t−1</sub> + stationary noise (β = 0 in the DF regression, a root of 1 in the AR polynomial). Shocks are permanent, the variance grows with time, and forecast intervals keep widening. It is removed by differencing, unlike a deterministic trend which is removed by subtracting a fitted line.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute w for February 2021 and rebuild the sales from it.</summary><div class="qa-body">w = (105 − 112) − (94 − 99) = −7 + 5 = −2. Rebuild: y = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + w = 112 + 94 − 99 − 2 = 105.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you spot over-differencing?</summary><div class="qa-body">Lag-1 autocorrelation near or below −0.5 (differencing white noise gives exactly −0.5), the variance rising after a difference, or a fitted MA(1) coefficient near −1. Difference only as much as the tests and plots require; d + D rarely exceeds 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ACF vs PACF: what does each measure, and how do they identify AR and MA?</summary><div class="qa-body">ACF: total correlation with lag k, direct plus passed-along. PACF: only the direct part, after controlling for lags 1 … k − 1; PACF(2) = (r₂ − r₁²)/(1 − r₁²). AR(p): PACF cuts off after p, ACF tails off. MA(q): ACF cuts off after q, PACF tails off. Seasonal spikes at lag 12 suggest seasonal terms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do Meera's ACF and PACF suggest?</summary><div class="qa-body">After d = 1 and D = 1: ACF significant at lag 1 (−0.41) and lag 12 (−0.31); PACF significant at lag 1 (−0.41), small at lag 2 (−0.13), small at 12 (−0.08). Candidates: MA(1) with a seasonal MA(1) (the "airline" model), or AR(1) with a seasonal term. The ARIMA note compares them with AIC and residual checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build lag features without leakage?</summary><div class="qa-body">Use <code>shift(k)</code> with k ≥ forecast horizon; compute rolling statistics on the shifted series (<code>shift(1).rolling(3)</code>); fit any scaler or encoder on training dates only; use only exogenous values known at forecast time. An unshifted rolling mean includes the target and faked MAE 2.62 against an honest 4.44.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does each later note in the group use this one?</summary><div class="qa-body"><a class="xref" data-note="ml_arima">ARIMA</a> uses stationarity, d and D from the tests, and p, q, P, Q proposed by the ACF/PACF. <a class="xref" data-note="ml_ets_prophet">ETS and Prophet</a> model level, trend and season directly, choosing additive vs multiplicative as here. <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> turns lags, rolling windows and calendar fields into a supervised table, with the leakage rules of section 11.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How are the ACF and the Pearson correlation related?</summary><div class="qa-body">The lag-k ACF is the Pearson correlation between the series and its own copy shifted by k, with two conventions: one overall mean and the full-series sum of squares in the denominator (<a class="xref" data-note="st_correlation">Correlation</a>). The PACF is the time-series version of a partial regression coefficient: the effect of lag k holding the shorter lags fixed.</div></details>
</main>
`
});
