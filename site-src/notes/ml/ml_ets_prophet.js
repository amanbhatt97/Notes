// notes/ml/ml_ets_prophet.js — Exponential Smoothing & Prophet
Object.assign(TOPIC_CONTENT, {
  "ml_ets_prophet": `<main>
  <h1>Exponential Smoothing &amp; Prophet</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>Exponential Smoothing &amp; Prophet</span></div>
  <p class="lead">Two families of forecasting models that need no lag-picking and no stationarity tests. Exponential smoothing keeps a running summary of the series (a level, a slope, a seasonal pattern) and nudges it a little after every new observation: simple exponential smoothing, Holt's trend method, Holt-Winters seasonality and the ETS framework that unites them. Prophet takes the opposite route and fits a smooth curve to the calendar: trend + seasonality + holidays, with a trend that is allowed to bend at changepoints. Every formula is worked by hand on one small homestay's guest numbers, then reproduced with statsmodels and Prophet, and the note ends with a clear rule for when to use classical models, Prophet or machine learning.</p>

  <h2 id="ep-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_timeseries">Time Series Basics</a> and <a class="xref" data-note="ml_arima">ARIMA Family</a></b><span>Basics taught you to see a series as trend + seasonality + noise, to decompose it, and to test for stationarity. ARIMA then forecast the next value from a weighted sum of past values and past errors, but only after you made the series stationary (differencing) and chose p, d, q from ACF/PACF plots. Left open: is there a simpler way that works straight on the raw series, and a way that copes with daily data, several seasons, holidays and gaps?</span></li>
    <li><b>This note: Exponential Smoothing &amp; Prophet</b><span>Exponential smoothing forecasts with a weighted average whose weights fade the further back you go, and extends it with a slope (Holt) and a seasonal pattern (Holt-Winters). ETS puts all these variants into one statistical framework with likelihoods, AIC and prediction intervals. Prophet fits trend + seasonality + holidays as a regression on time, with changepoints where the trend bends.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_ts_ml">ML Forecasting</a></b><span>Both families model one series at a time and use only its own past (plus a few regressors). When you have thousands of related series and many outside signals (prices, promotions, weather), you turn forecasting into a supervised learning table and train one gradient-boosted model across all series. That is the next note.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="ep-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Time Series</text>
<rect x="245" y="28" width="170" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="47" text-anchor="middle" font-size="13">Time Series Basics</text><text x="330" y="63" text-anchor="middle" class="tm" font-size="10.5">trend, season, ACF, stationarity</text>
<line x1="300" y1="72" x2="120" y2="108" stroke="currentColor" marker-end="url(#ep-a0)"/>
<line x1="330" y1="72" x2="330" y2="108" stroke="currentColor" marker-end="url(#ep-a0)"/>
<line x1="360" y1="72" x2="540" y2="108" stroke="currentColor" marker-end="url(#ep-a0)"/>
<rect x="30" y="110" width="180" height="48" rx="8" class="fb sb"/><text x="120" y="130" text-anchor="middle" font-size="13">ARIMA Family</text><text x="120" y="148" text-anchor="middle" class="tm" font-size="10.5">past values + errors</text>
<rect x="235" y="104" width="190" height="60" rx="8" class="ft st" stroke-width="3"/><text x="330" y="125" text-anchor="middle" font-size="13" font-weight="700">Exp. Smoothing &amp; Prophet</text><text x="330" y="141" text-anchor="middle" class="tm" font-size="10.5">states · curve on time</text><text x="330" y="157" text-anchor="middle" class="tb" font-size="10">YOU ARE HERE</text>
<rect x="450" y="110" width="180" height="48" rx="8" class="fg sg"/><text x="540" y="130" text-anchor="middle" font-size="13">ML Forecasting</text><text x="540" y="148" text-anchor="middle" class="tm" font-size="10.5">lag features + LightGBM</text>
<line x1="210" y1="134" x2="233" y2="134" stroke="currentColor" stroke-dasharray="3 3"/><line x1="425" y1="134" x2="448" y2="134" stroke="currentColor" marker-end="url(#ep-a0)"/>
<text x="330" y="182" text-anchor="middle" class="tm" font-size="10.5">dashed: SES = ARIMA(0,1,1), see section 05</text>
</svg><figcaption>The Time Series group. This note is the "classical, but friendly" branch: models that work on the raw series and are hard to get badly wrong.</figcaption></figure>

  <h2 id="ep-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>Every idea in this note exists because the idea before it could not answer some question. Read the ladder once now; each rung is then worked by hand on the same homestay numbers.</p>
  <ol class="story">
    <li><b>Baselines (naive, mean, seasonal naive)</b><span>Q: what will next quarter look like, using no model at all? → "same as last quarter" (28), "the average of everything" (20.4), "same quarter last year". Naive trusts only the newest value, the mean trusts all values equally. Is there something in between?…</span></li>
    <li><b>Simple exponential smoothing (SES)</b><span>Q: how do we trust recent quarters more, but not only the last one? → a weighted average whose weights fade by a factor (1 − α) per step back: ℓ = α·y + (1 − α)·ℓ. It forecasts 24.8 for every quarter of 2018. But the homestay is growing, and a flat line always lags behind growth…</span></li>
    <li><b>Holt's linear trend (and damping)</b><span>Q: how do we also learn the speed of growth? → keep a second running number, the slope b, and forecast ℓ + h·b: 27.9, 28.9, 29.9, 30.8. Damping bends the line flat for far horizons. But Q2 is always busy and Q3 always empty, and a straight line misses that up-and-down…</span></li>
    <li><b>Holt-Winters seasonality (additive and multiplicative)</b><span>Q: how do we learn the yearly pattern too? → a third running set, one seasonal number per quarter: forecast ℓ + h·b + s. 2018 forecast 28.5, 34.6, 25.0, 31.9 against the real 29, 35, 25, 32. But which variant (trend or not, damped or not, add or multiply) is right, and how sure are we?…</span></li>
    <li><b>The ETS framework</b><span>Q: how do we choose between the variants and get honest error bars? → write each method as a statistical model (Error, Trend, Seasonal), so it has a likelihood: pick by AICc, get prediction intervals (24.8 ± 9.3 for SES). But all of this needs equally spaced, complete data with one season length…</span></li>
    <li><b>statsmodels in practice</b><span>Q: how do we run all of this reliably in code? → <code>ExponentialSmoothing</code> and <code>ETSModel</code>, their arguments, outputs and one quirk. But the owner's real register is daily: busy weekends, a yearly cycle, a Snow Carnival in some years only, and 20 lost days…</span></li>
    <li><b>Prophet's decomposable model</b><span>Q: how do we model several seasons, irregular events and gaps at once? → fit y(t) = g(t) + s(t) + h(t) + ε as a regression on the date: Fourier waves for seasons, indicator columns for holidays. On 15 Jan 2018: 28.09 + 0.97 − 2.46 + 11.46 = 38.06. But a growth rate that never changes is wrong: a new road in 2016 tripled the growth…</span></li>
    <li><b>Changepoints</b><span>Q: how does the trend learn where to bend, without bending everywhere? → 25 candidate kinks with a shrinking prior; six survive, all around the road opening, and growth goes from 1.5 to 4.5 guests per year. But how do we run, inspect and validate Prophet in practice?…</span></li>
    <li><b>Prophet in code</b><span>Q: what does the code look like, what comes out, and how do we back-test it? → <code>ds</code>/<code>y</code>, <code>make_future_dataframe</code>, components, <code>cross_validation</code>. But which family should you actually use?…</span></li>
    <li><b>Classical vs Prophet vs ML</b><span>Q: when does each win? → a scoreboard on 2018 (Holt-Winters 0.77, Prophet 0.30 quarterly; carnival days 10.4 → 1.05 daily) and a decision guide. Then: how all of these pieces are built from one another.</span></li>
  </ol>
  <div class="bridge"><b>What this still can't tell us.</b> The ladder is the plot; every rung is computed by hand below. <b>→ next: the Mind Map, then 01 The Homestay and the Baselines</b></div>

  <h2 id="ep-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Exponential Smoothing &amp; Prophet</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Baselines &amp; SES</div>
        <ul>
          <li><b>Naive</b> — last value; <b>mean</b> — all values equally; <b>seasonal naive</b> — same quarter last year</li>
          <li><b>SES</b>: ℓₜ = α·yₜ + (1 − α)·ℓₜ₋₁; forecast = ℓ for every horizon (flat)</li>
          <li>Error form: ℓₜ = ℓₜ₋₁ + α·eₜ — move a fraction α toward the surprise</li>
          <li>Weights α, α(1−α), α(1−α)², … fade geometrically and sum to 1</li>
          <li>α near 1: jumpy, follows the last value; near 0: slow, close to the mean</li>
          <li>α chosen by minimising one-step squared errors (SSE)</li>
          <li>💡 A chai seller adjusting milk: "yesterday's guess, nudged toward today"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Holt &amp; Holt-Winters</div>
        <ul>
          <li><b>Holt</b>: level + slope; ŷ = ℓ + h·b; slope smoothed by β</li>
          <li><b>Damped</b>: ŷ = ℓ + (φ + φ² + … + φʰ)·b → levels off at ℓ + φb/(1 − φ)</li>
          <li><b>Holt-Winters additive</b>: ŷ = ℓ + h·b + s (season of that quarter); s smoothed by γ</li>
          <li><b>Multiplicative</b>: ŷ = (ℓ + h·b)·s when the swing grows with the level</li>
          <li>Starting values: level = first-year mean, slope = change in yearly means ÷ m, season = first year − mean</li>
          <li>Homestay 2018 (α .5, β .2, γ .3): 28.5, 34.6, 25.0, 31.9 vs 29, 35, 25, 32</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ETS framework</div>
        <ul>
          <li><b>E</b>rror (A/M) · <b>T</b>rend (N/A/Ad) · <b>S</b>eason (N/A/M): ETS(A,A,A) = additive Holt-Winters</li>
          <li>Same point forecasts as the methods, plus a <b>likelihood</b></li>
          <li>Likelihood → <b>AICc</b> to choose the variant, and <b>prediction intervals</b></li>
          <li>SES interval: ŷ ± 1.96·σ·√(1 + (h − 1)α²): 24.8 ± 9.3 at h = 1</li>
          <li>SES = ARIMA(0,1,1) with θ = α − 1; Holt = ARIMA(0,2,2)</li>
          <li>⚠ AICc on 16 points dropped the trend; the test year disagreed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">statsmodels</div>
        <ul>
          <li><code>SimpleExpSmoothing</code>, <code>Holt</code>, <code>ExponentialSmoothing(trend, damped_trend, seasonal, seasonal_periods)</code></li>
          <li><code>.fit()</code> estimates α, β, γ, φ; <code>.forecast(h)</code>, <code>.fittedvalues</code>, <code>.level/.trend/.season</code></li>
          <li><code>ETSModel(error=…)</code> for AICc and <code>get_prediction().summary_frame()</code> intervals</li>
          <li>⚠ NaN in the series → NaN forecasts, no error</li>
          <li>⚠ 0.15 <code>ExponentialSmoothing</code> uses last year's seasonal at h = m (ETSModel does not)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prophet</div>
        <ul>
          <li>y(t) = <b>g(t)</b> trend + <b>s(t)</b> seasons + <b>h(t)</b> holidays + ε: a regression on the date</li>
          <li>Seasons = Fourier pairs sin/cos(2πkt/P): yearly 10 pairs, weekly 3 pairs</li>
          <li>Holidays = 0/1 columns per day of the event window (5 for the carnival)</li>
          <li><b>Changepoints</b>: 25 candidates in the first 80%; Laplace prior (scale 0.05) keeps most at 0</li>
          <li>Homestay: growth 1.53 → 4.49 per year, bends in 2015-16 (the road)</li>
          <li>No lags: handles gaps, any spacing, many seasons; weak at short-term memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li><b>Classical (ETS/ARIMA)</b>: one regular series, few points, fast, intervals</li>
          <li><b>Prophet</b>: daily business data, several seasons, holidays, gaps, trend breaks; analysts</li>
          <li><b>ML (LightGBM)</b>: many series, many outside drivers, lots of data</li>
          <li>Always beat <b>seasonal naive</b> first; back-test on several cut-offs</li>
          <li>2018: HW 0.77 · Prophet 0.30 (quarterly); carnival days: 10.4 → 1.05</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ep-data"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Homestay &amp; Baselines</span><span class="rm-sub">Naive, mean, seasonal naive</span></div></div>
      <div class="rm-item rm-done" data-target="ep-ses"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Simple Exponential Smoothing</span><span class="rm-sub">α by hand, weights, choosing α</span></div></div>
      <div class="rm-item rm-done" data-target="ep-holt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Holt's Linear Trend</span><span class="rm-sub">Level + slope, damping</span></div></div>
      <div class="rm-item rm-done" data-target="ep-hw"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Holt-Winters Seasonality</span><span class="rm-sub">Additive and multiplicative by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ep-ets"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The ETS Framework</span><span class="rm-sub">Taxonomy, AICc, intervals, ARIMA link</span></div></div>
      <div class="rm-item rm-done" data-target="ep-sm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">statsmodels in Practice</span><span class="rm-sub">API, outputs, quirks</span></div></div>
      <div class="rm-item rm-done" data-target="ep-prophet"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Prophet's Decomposable Model</span><span class="rm-sub">Trend + Fourier seasons + holidays</span></div></div>
      <div class="rm-item rm-done" data-target="ep-cp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Changepoints</span><span class="rm-sub">Where the trend bends</span></div></div>
      <div class="rm-item rm-done" data-target="ep-code"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Prophet in Code</span><span class="rm-sub">Fit, components, cross-validation</span></div></div>
      <div class="rm-item rm-done" data-target="ep-when"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Classical vs Prophet vs ML</span><span class="rm-sub">Scoreboard and decision guide</span></div></div>
      <div class="rm-item rm-done" data-target="ep-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each piece built from the last</span></div></div>
      <div class="rm-item rm-done" data-target="ep-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="ep-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ep-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ep-data"><span class="num">01</span>The Homestay and the Baselines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The previous notes told us what a time series is made of. We have not yet forecast anything with this note's tools, and we have no yardstick: if a model says "24.8 guests next quarter", is that good? Before any model, we need the data and the forecasts a person would make with no model at all.</p></div>
  <h3>The story</h3>
  <p>Pine View is a 12-room homestay in Manali. Its owner, Mrs Thakur, writes the number of guests staying each night in a register. Her accountant summarises the register as <strong>the average number of guests per night in each quarter</strong>. She wants to know how many guests to expect in 2018, to plan staff, groceries and a loan for two new rooms. These 20 numbers are our running example for the whole note: we learn from 2014–2017 (16 quarters) and keep 2018 hidden as the test.</p>
  <figure class="viz"><svg viewBox="0 0 660 260" width="660">
<line x1="60" y1="220" x2="620" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="60" y="234" text-anchor="middle" class="tm" font-size="10.5">2014</text>
<line x1="60" y1="220" x2="60" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="172" y="234" text-anchor="middle" class="tm" font-size="10.5">2015</text>
<line x1="172" y1="220" x2="172" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="284" y="234" text-anchor="middle" class="tm" font-size="10.5">2016</text>
<line x1="284" y1="220" x2="284" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="396" y="234" text-anchor="middle" class="tm" font-size="10.5">2017</text>
<line x1="396" y1="220" x2="396" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="508" y="234" text-anchor="middle" class="tm" font-size="10.5">2018</text>
<line x1="508" y1="220" x2="508" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="620" y="234" text-anchor="middle" class="tm" font-size="10.5">2019</text>
<line x1="620" y1="220" x2="620" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="55" y="196.4" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="57" y1="192.9" x2="60" y2="192.9" stroke="currentColor" opacity="0.5"/>
<text x="55" y="142.1" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="138.6" x2="60" y2="138.6" stroke="currentColor" opacity="0.5"/>
<text x="55" y="87.8" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="84.3" x2="60" y2="84.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="33.5" text-anchor="end" class="tm" font-size="10.5">40</text>
<line x1="57" y1="30" x2="60" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="508" y1="30" x2="508" y2="220" stroke-dasharray="3 3" class="sr"/>
<text x="512" y="40" class="tm" font-size="10.5">test: 2018</text>
<polyline points="74,160.3 102,133.1 130,187.4 158,149.4 186,149.4 214,127.7 242,176.6 270,144 298,144 326,106 354,154.9 382,122.3 410,116.9 438,78.9 466,133.1 494,95.1" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="74" cy="160.3" r="3" class="fb sb"/>
<circle cx="102" cy="133.1" r="3" class="fb sb"/>
<circle cx="130" cy="187.4" r="3" class="fb sb"/>
<circle cx="158" cy="149.4" r="3" class="fb sb"/>
<circle cx="186" cy="149.4" r="3" class="fb sb"/>
<circle cx="214" cy="127.7" r="3" class="fb sb"/>
<circle cx="242" cy="176.6" r="3" class="fb sb"/>
<circle cx="270" cy="144" r="3" class="fb sb"/>
<circle cx="298" cy="144" r="3" class="fb sb"/>
<circle cx="326" cy="106" r="3" class="fb sb"/>
<circle cx="354" cy="154.9" r="3" class="fb sb"/>
<circle cx="382" cy="122.3" r="3" class="fb sb"/>
<circle cx="410" cy="116.9" r="3" class="fb sb"/>
<circle cx="438" cy="78.9" r="3" class="fb sb"/>
<circle cx="466" cy="133.1" r="3" class="fb sb"/>
<circle cx="494" cy="95.1" r="3" class="fb sb"/>
<polyline points="494,95.1 522,89.7 550,57.1 578,111.4 606,73.4" fill="none" class="sr" stroke-width="2.5" stroke-dasharray="5 3"/>
<circle cx="522" cy="89.7" r="3" class="fr sr"/>
<circle cx="550" cy="57.1" r="3" class="fr sr"/>
<circle cx="578" cy="111.4" r="3" class="fr sr"/>
<circle cx="606" cy="73.4" r="3" class="fr sr"/>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">guests per night</text>
<text x="74" y="151.3" text-anchor="middle" font-size="10">16</text>
<text x="102" y="124.1" text-anchor="middle" font-size="10">21</text>
<text x="130" y="178.4" text-anchor="middle" font-size="10">11</text>
<text x="158" y="140.4" text-anchor="middle" font-size="10">18</text>
<text x="186" y="140.4" text-anchor="middle" font-size="10">18</text>
<text x="214" y="118.7" text-anchor="middle" font-size="10">22</text>
<text x="242" y="167.6" text-anchor="middle" font-size="10">13</text>
<text x="270" y="135" text-anchor="middle" font-size="10">19</text>
<text x="298" y="135" text-anchor="middle" font-size="10">19</text>
<text x="326" y="97" text-anchor="middle" font-size="10">26</text>
<text x="354" y="145.9" text-anchor="middle" font-size="10">17</text>
<text x="382" y="113.3" text-anchor="middle" font-size="10">23</text>
<text x="410" y="107.9" text-anchor="middle" font-size="10">24</text>
<text x="438" y="69.9" text-anchor="middle" font-size="10">31</text>
<text x="466" y="124.1" text-anchor="middle" font-size="10">21</text>
<text x="494" y="86.1" text-anchor="middle" font-size="10">28</text>
<text x="522" y="80.7" text-anchor="middle" font-size="10">29</text>
<text x="550" y="48.1" text-anchor="middle" font-size="10">35</text>
<text x="578" y="102.4" text-anchor="middle" font-size="10">25</text>
<text x="606" y="64.4" text-anchor="middle" font-size="10">32</text>
<text x="70" y="22" class="tb" font-size="11">train: 2014–2017 (16 quarters)</text>
</svg><figcaption>Pine View's average guests per night, by quarter. Two things are visible by eye: the series grows (faster after 2016), and every year has the same shape: Q2 (summer holidays) high, Q3 (monsoon, landslides) low.</figcaption></figure>
  <p>The data come from a small Python module that builds the daily register (we need the daily numbers from section 07 on) and averages it per quarter. It is a simulation with a known recipe, so we can check what each model discovers: a trend whose growth jumps when a new road opens in January 2016, a yearly pattern, a weekend pattern, a five-day Snow Carnival held only in 2015, 2017 and 2018, and twenty days in June 2015 when a page of the register was lost.</p>
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
  <p>You do not need to follow every line. What matters: <code>daily</code> is a pandas Series of guests per night with dates as the index, <code>carnival</code> is a small table of festival dates, and <code>quarterly</code> is <code>daily</code> averaged per quarter (<code>resample("QS")</code> means "group by quarter, label each group by its start date") and rounded to whole guests.</p>
  <h3>Three forecasts with no model</h3>
  <p>Before fitting anything, write down what a sensible person would say. These are the <strong>baselines</strong>: free forecasts that every model must beat, or it is not worth its complexity.</p>
  <table class="tbl">
    <tr><th>Baseline</th><th>Rule</th><th>By hand for 2018 Q1–Q4</th><th>2018 actual</th><th>Absolute errors</th><th>MAE</th></tr>
    <tr><td><strong>Naive</strong></td><td>next = last value</td><td>28, 28, 28, 28</td><td>29, 35, 25, 32</td><td>1, 7, 3, 4</td><td>15/4 = 3.75</td></tr>
    <tr><td><strong>Mean</strong></td><td>next = average of all history</td><td>327/16 = 20.44 each</td><td>29, 35, 25, 32</td><td>8.56, 14.56, 4.56, 11.56</td><td>39.25/4 = 9.81</td></tr>
    <tr><td><strong>Seasonal naive</strong></td><td>next Q1 = last Q1, etc.</td><td>24, 31, 21, 28</td><td>29, 35, 25, 32</td><td>5, 4, 4, 4</td><td>17/4 = 4.25</td></tr>
  </table>
  <p>MAE (mean absolute error) is the average size of a miss, in guests per night; it is the score we use throughout (see <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> for the full family). The code confirms the hand numbers:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from homestay import quarterly

y = quarterly                                    # average guests per night, one value per quarter
train, test = y[:"2017"], y["2018":]             # 16 quarters to learn from, 4 to check against
print(pd.DataFrame(y.values.reshape(5, 4), index=range(2014, 2019),
                   columns=["Q1 Jan-Mar", "Q2 Apr-Jun", "Q3 Jul-Sep", "Q4 Oct-Dec"]))

naive  = np.repeat(train.iloc[-1], 4)            # "next quarter = last quarter"
mean   = np.repeat(train.mean(), 4)              # "next quarter = the average of everything"
snaive = train.iloc[-4:].values                  # "next Q1 = last Q1", etc.
for name, f in [("naive", naive), ("mean", mean), ("seasonal naive", snaive)]:
    err = test.values - f
    print(f"{name:15s} forecast {np.round(f, 2)}  errors {np.round(err, 2)}  MAE {np.abs(err).mean():.2f}")</div>
  <div class="fx" data-lang="text">      Q1 Jan-Mar  Q2 Apr-Jun  Q3 Jul-Sep  Q4 Oct-Dec
2014          16          21          11          18
2015          18          22          13          19
2016          19          26          17          23
2017          24          31          21          28
2018          29          35          25          32
naive           forecast [28 28 28 28]  errors [ 1  7 -3  4]  MAE 3.75
mean            forecast [20.44 20.44 20.44 20.44]  errors [ 8.56 14.56  4.56 11.56]  MAE 9.81
seasonal naive  forecast [24 31 21 28]  errors [5 4 4 4]  MAE 4.25</div>
  <p><code>y[:"2017"]</code> selects every row up to the end of 2017 by date; <code>np.repeat(x, 4)</code> copies one number four times, because naive and mean give the same forecast for every future quarter. Read the three rows as three opinions about memory:</p>
  <ul>
    <li><strong>Naive</strong> remembers only the last quarter (28, a Q4). It ignores everything older, including that Q2 is always busy, so it misses Q2 by 7.</li>
    <li><strong>Mean</strong> remembers everything with equal weight, including 2014's 11 and 16, so it is stuck far below today's level: MAE 9.81, the worst.</li>
    <li><strong>Seasonal naive</strong> remembers the shape of the year, but copies 2017 exactly and so misses one full year of growth (about +4 to +5 per quarter).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Three people guessing tomorrow's crowd at a dhaba. The new waiter says "same as today". The old cook says "the same as the average of the last four years". The owner says "same as this day last year". Each is right about something; none is right about everything.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>baseline forecast</strong> is a forecast produced by a fixed rule with no learned parameters: naive ŷ<sub>T+h</sub> = y<sub>T</sub>; mean ŷ<sub>T+h</sub> = (1/T)Σy<sub>t</sub>; seasonal naive ŷ<sub>T+h</sub> = y<sub>T+h−m</sub> (for h ≤ m), where T is the last observed time, h the horizon and m the season length (4 for quarters).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Skipping the baselines. Here plain naive (3.75) even beats seasonal naive (4.25), because growth is strong. A model with MAE 4 sounds fine until you see that "same as last quarter" already gets 3.75.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Naive uses one value, the mean uses all values equally. We want a rule in between: lean on recent quarters, but not only the last one. <b>→ next: 02 Simple Exponential Smoothing</b></div>

  <h2 id="ep-ses"><span class="num">02</span>Simple Exponential Smoothing (SES)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Naive gives the last quarter 100% of the weight; the mean gives each of 16 quarters 6.25%. How do we give recent quarters more say than old ones, smoothly, without choosing 16 separate weights by hand?</p></div>
  <h3>The idea in plain words</h3>
  <p>Keep one running number, the <strong>level</strong> ℓ: your current best guess of "the normal value right now". When a new quarter arrives, do not throw the old guess away and do not ignore the news. Move the guess a fixed fraction α of the way toward the new value.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chai stall owner deciding how much milk to buy. He does not buy exactly what he sold yesterday (too jumpy), nor the average of the whole year (too slow). He takes his usual amount and nudges it: "I ran short yesterday, so a bit more today". How big the nudge is, is α.</p>
  </div>
  <h3>The formula, two ways</h3>
  <p><strong>Weighted-average form</strong>: ℓ<sub>t</sub> = α·y<sub>t</sub> + (1 − α)·ℓ<sub>t−1</sub>. New level = α parts new value + (1 − α) parts old level.</p>
  <p><strong>Error-correction form</strong>: ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + α·(y<sub>t</sub> − ℓ<sub>t−1</sub>) = ℓ<sub>t−1</sub> + α·e<sub>t</sub>. Take the old level and add a fraction α of the surprise e<sub>t</sub> (actual minus what we forecast). The two forms are the same algebra; the second is easier to remember and is how ETS writes it later.</p>
  <p><strong>Forecast</strong>: ŷ<sub>t+h</sub> = ℓ<sub>t</sub> for every h. SES has no notion of slope or season, so its forecast is a flat line at the latest level.</p>
  <h3>By hand: α = 0.5 on the homestay</h3>
  <p>We need a starting level ℓ<sub>0</sub> (the guess before any data); take the first value, 16. Then each row: forecast = current level, error = actual − forecast, new level = level + 0.5 × error.</p>
  <table class="tbl">
    <tr><th>Quarter</th><th>y</th><th>forecast (= old ℓ)</th><th>error e = y − forecast</th><th>new ℓ = old ℓ + 0.5·e</th></tr>
    <tr><td>2014 Q1</td><td>16</td><td>16</td><td>0</td><td>16 + 0 = 16</td></tr>
    <tr><td>2014 Q2</td><td>21</td><td>16</td><td>+5</td><td>16 + 2.5 = 18.5</td></tr>
    <tr><td>2014 Q3</td><td>11</td><td>18.5</td><td>−7.5</td><td>18.5 − 3.75 = 14.75</td></tr>
    <tr><td>2014 Q4</td><td>18</td><td>14.75</td><td>+3.25</td><td>14.75 + 1.625 = 16.375</td></tr>
    <tr><td>2015 Q1</td><td>18</td><td>16.375</td><td>+1.625</td><td>16.375 + 0.8125 = 17.1875</td></tr>
    <tr><td>2015 Q2</td><td>22</td><td>17.1875</td><td>+4.8125</td><td>17.1875 + 2.406 = 19.594</td></tr>
  </table>
  <p>Continue to the end of 2017 and the final level is 25.956. That is the forecast for every quarter of 2018. The code is the same loop, and statsmodels agrees with it to the last decimal when we give it the same α and starting level:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
from homestay import quarterly
train = quarterly[:"2017"]

def ses(y, alpha, level0):
    """Simple exponential smoothing. Returns one-step forecasts and the final level."""
    level, fc = level0, []
    for value in y:
        fc.append(level)                              # forecast for this quarter = level so far
        level = level + alpha * (value - level)       # move a fraction alpha toward the new value
    return np.array(fc), level

if __name__ == "__main__":
    fc, last_level = ses(train.values, alpha=0.5, level0=16)
    tbl = pd.DataFrame({"y": train.values, "forecast": fc, "error": train.values - fc,
                        "new level": np.r_[fc[1:], last_level]}, index=train.index.to_period("Q"))
    print(tbl.head(6).round(3))
    print("final level (forecast for every 2018 quarter):", round(last_level, 3))

    sm = SimpleExpSmoothing(train, initialization_method="known", initial_level=16)
    res = sm.fit(smoothing_level=0.5, optimized=False)
    print("statsmodels fitted equal to ours:", np.allclose(res.fittedvalues.values, fc))
    print("statsmodels forecast:", res.forecast(4).round(3).values)</div>
  <div class="fx" data-lang="text">         y  forecast  error  new level
2014Q1  16    16.000  0.000     16.000
2014Q2  21    16.000  5.000     18.500
2014Q3  11    18.500 -7.500     14.750
2014Q4  18    14.750  3.250     16.375
2015Q1  18    16.375  1.625     17.188
2015Q2  22    17.188  4.812     19.594
final level (forecast for every 2018 quarter): 25.956
statsmodels fitted equal to ours: True
statsmodels forecast: [25.956 25.956 25.956 25.956]</div>
  <p>In <code>ses()</code> the forecast is appended <em>before</em> the level is updated, so each forecast uses only the past: this is a genuine one-step-ahead forecast. In statsmodels, <code>initialization_method="known", initial_level=16</code> sets ℓ<sub>0</sub>; <code>fit(smoothing_level=0.5, optimized=False)</code> uses our α instead of searching for one; <code>fittedvalues</code> are the one-step forecasts; <code>forecast(4)</code> extends the flat line four quarters.</p>
  <h3>Why "exponential": unrolling the recursion</h3>
  <p>Substitute the formula into itself: ℓ<sub>t</sub> = αy<sub>t</sub> + (1−α)[αy<sub>t−1</sub> + (1−α)ℓ<sub>t−2</sub>] = αy<sub>t</sub> + α(1−α)y<sub>t−1</sub> + (1−α)²ℓ<sub>t−2</sub>, and so on:</p>
  <p style="text-align:center"><strong>ℓ<sub>t</sub> = αy<sub>t</sub> + α(1−α)y<sub>t−1</sub> + α(1−α)²y<sub>t−2</sub> + … + (1−α)<sup>t</sup>ℓ<sub>0</sub></strong></p>
  <p>So the level is a weighted average of every past value, with weights that shrink by the factor (1 − α) per step back: geometrically, which is the discrete version of exponential decay. With α = 0.5 the weights are 0.5, 0.25, 0.125, 0.0625, …; they add up to 1 (with the leftover on ℓ<sub>0</sub>), so the level is a proper average.</p>
  <table class="tbl">
    <tr><th>α</th><th>weight on last quarter</th><th>1 back</th><th>2 back</th><th>3 back</th><th>Behaves like</th></tr>
    <tr><td>0.1</td><td>0.100</td><td>0.090</td><td>0.081</td><td>0.073</td><td>close to the long-run mean</td></tr>
    <tr><td>0.5</td><td>0.500</td><td>0.250</td><td>0.125</td><td>0.062</td><td>in between</td></tr>
    <tr><td>0.9</td><td>0.900</td><td>0.090</td><td>0.009</td><td>0.001</td><td>almost naive</td></tr>
  </table>
  <p>The two baselines are the ends of this dial: α = 1 is exactly naive; α → 0 freezes the starting level, and with a starting level equal to the average it behaves like the mean.</p>
  <figure class="viz"><svg viewBox="0 0 660 260" width="660">
<line x1="60" y1="220" x2="620" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="60" y="234" text-anchor="middle" class="tm" font-size="10.5">2014</text>
<line x1="60" y1="220" x2="60" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="191.8" y="234" text-anchor="middle" class="tm" font-size="10.5">2015</text>
<line x1="191.8" y1="220" x2="191.8" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="323.5" y="234" text-anchor="middle" class="tm" font-size="10.5">2016</text>
<line x1="323.5" y1="220" x2="323.5" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="455.3" y="234" text-anchor="middle" class="tm" font-size="10.5">2017</text>
<line x1="455.3" y1="220" x2="455.3" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="587.1" y="234" text-anchor="middle" class="tm" font-size="10.5">2018</text>
<line x1="587.1" y1="220" x2="587.1" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="55" y="191.8" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="57" y1="188.3" x2="60" y2="188.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="128.5" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="125" x2="60" y2="125" stroke="currentColor" opacity="0.5"/>
<text x="55" y="65.2" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="61.7" x2="60" y2="61.7" stroke="currentColor" opacity="0.5"/>
<polyline points="76.5,150.3 109.4,118.7 142.4,182 175.3,137.7 208.2,137.7 241.2,112.3 274.1,169.3 307.1,131.3 340,131.3 372.9,87 405.9,144 438.8,106 471.8,99.7 504.7,55.3 537.6,118.7 570.6,74.3" fill="none" stroke="currentColor" stroke-width="1.2"/>
<circle cx="76.5" cy="150.3" r="3" class="fs"/>
<circle cx="109.4" cy="118.7" r="3" class="fs"/>
<circle cx="142.4" cy="182" r="3" class="fs"/>
<circle cx="175.3" cy="137.7" r="3" class="fs"/>
<circle cx="208.2" cy="137.7" r="3" class="fs"/>
<circle cx="241.2" cy="112.3" r="3" class="fs"/>
<circle cx="274.1" cy="169.3" r="3" class="fs"/>
<circle cx="307.1" cy="131.3" r="3" class="fs"/>
<circle cx="340" cy="131.3" r="3" class="fs"/>
<circle cx="372.9" cy="87" r="3" class="fs"/>
<circle cx="405.9" cy="144" r="3" class="fs"/>
<circle cx="438.8" cy="106" r="3" class="fs"/>
<circle cx="471.8" cy="99.7" r="3" class="fs"/>
<circle cx="504.7" cy="55.3" r="3" class="fs"/>
<circle cx="537.6" cy="118.7" r="3" class="fs"/>
<circle cx="570.6" cy="74.3" r="3" class="fs"/>
<polyline points="76.5,150.3 109.4,150.3 142.4,147.2 175.3,150.7 208.2,149.4 241.2,148.2 274.1,144.6 307.1,147.1 340,145.5 372.9,144.1 405.9,138.4 438.8,138.9 471.8,135.6 504.7,132 537.6,124.4 570.6,123.8 603.5,118.9" fill="none" class="st" stroke-width="2"/>
<polyline points="76.5,150.3 109.4,150.3 142.4,134.5 175.3,158.2 208.2,148 241.2,142.8 274.1,127.6 307.1,148.5 340,139.9 372.9,135.6 405.9,111.3 438.8,127.7 471.8,116.8 504.7,108.2 537.6,81.8 570.6,100.2 603.5,87.3" fill="none" class="sg" stroke-width="2"/>
<polyline points="76.5,150.3 109.4,150.3 142.4,121.8 175.3,176 208.2,141.5 241.2,138 274.1,114.9 307.1,163.9 340,134.6 372.9,131.7 405.9,91.5 438.8,138.7 471.8,109.3 504.7,100.6 537.6,59.9 570.6,112.8 603.5,78.2" fill="none" class="sr" stroke-width="2"/>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">guests per night</text>
<text x="80" y="20" font-size="11">grey dots: actual</text><text x="215" y="20" font-size="11" style="fill:var(--teal)">α = 0.1 (slow)</text><text x="340" y="20" font-size="11" class="tg">α = 0.5</text><text x="420" y="20" font-size="11" class="tr">α = 0.9 (jumpy)</text>
</svg><figcaption>One-step SES forecasts with three values of α. α = 0.1 crawls and falls far behind the growth; α = 0.9 copies the last quarter, so it is always one step late on the seasonal zig-zag.</figcaption></figure>
  <h3>Choosing α</h3>
  <p>α is chosen like any parameter: pick the value whose one-step forecasts had the smallest squared errors on the training data (SSE, sum of squared errors). The code tries five values and then lets statsmodels search. (The <code>ses</code> function from the previous block was saved as <code>e02_ses_hand.py</code>, so it is imported from there; every script in this note also imports the data from <code>homestay.py</code>.)</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
from homestay import quarterly
from e02_ses_hand import ses
train, test = quarterly[:"2017"], quarterly["2018":]

print("alpha  weights on the last 4 quarters        SSE(train)  forecast  test MAE")
for a in [0.1, 0.3, 0.5, 0.7, 0.9]:
    fc, last = ses(train.values, a, level0=16)
    sse = np.sum((train.values - fc) ** 2)
    w = [a * (1 - a) ** k for k in range(4)]
    print(f"{a:.1f}    {np.round(w, 3)}   {sse:9.1f}   {last:7.2f}   {np.abs(test.values - last).mean():6.2f}")

res = SimpleExpSmoothing(train, initialization_method="estimated").fit()   # let statsmodels choose
print("chosen alpha:", round(res.params["smoothing_level"], 3),
      " initial level:", round(res.params["initial_level"], 2),
      " SSE:", round(res.sse, 1), " forecast:", round(res.forecast(1).iloc[0], 2))</div>
  <div class="fx" data-lang="text">alpha  weights on the last 4 quarters        SSE(train)  forecast  test MAE
0.1    [0.1   0.09  0.081 0.073]       471.2     20.97     9.28
0.3    [0.3   0.21  0.147 0.103]       365.5     24.74     5.51
0.5    [0.5   0.25  0.125 0.062]       395.2     25.96     4.77
0.7    [0.7   0.21  0.063 0.019]       472.5     26.59     4.45
0.9    [0.9   0.09  0.009 0.001]       591.0     27.39     4.05
chosen alpha: 0.304  initial level: 17.27  SSE: 362.2  forecast: 24.79</div>
  <p>Training SSE is smallest near α = 0.3 (statsmodels finds 0.304, and also estimates the starting level as 17.27 instead of our 16). But look at the last column: on 2018 the <em>larger</em> α values do better. Why the disagreement? The one-step errors on training are dominated by the seasonal zig-zag, which no α can follow, so the optimiser settles for a calm level. Meanwhile the real problem for 2018 is growth, and a calm level lags further behind growth. Neither α fixes the actual issue: SES has no slope and no season.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Simple exponential smoothing</strong>: ℓ<sub>t</sub> = αy<sub>t</sub> + (1 − α)ℓ<sub>t−1</sub>, 0 &lt; α ≤ 1, with forecast ŷ<sub>t+h|t</sub> = ℓ<sub>t</sub>. The parameters α and ℓ<sub>0</sub> are estimated by minimising Σ(y<sub>t</sub> − ℓ<sub>t−1</sub>)². Suitable for series with no trend and no seasonality.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using SES on a trending or seasonal series. It will always forecast a flat line and lag behind growth (2018 forecast 24.8 while reality is 25–35). A small optimised α is a hint that the model is fighting a pattern it cannot represent, not that the series is "calm".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> SES knows "where we are", not "how fast we are moving". The yearly averages went 16.5 → 18 → 21.25 → 26: growth of about 0.4, then 0.8, then 1.2 guests per quarter, and a flat forecast cannot follow any of it. <b>→ next: 03 Holt's Linear Trend</b></div>

  <h2 id="ep-holt"><span class="num">03</span>Holt's Linear Trend</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>SES gave 2018 a flat 24.8 while Pine View keeps growing. Its single running number knows "where we are", not "how fast we are going". How do we learn the speed of growth and carry it into the future?</p></div>
  <h3>The idea in plain words</h3>
  <p>Charles Holt (1957) added a second running number, the <strong>trend</strong> (slope) b: how many guests per quarter the level rises. Both numbers are smoothed the same way SES smooths the level. To forecast h quarters ahead, start at the level and walk h steps along the slope.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Estimating when a train will reach the next station. Knowing only where it is now (level) is not enough; you also need its speed (trend). You update both from each new station sign, but smoothly: one slow stretch does not mean the train has stopped.</p>
  </div>
  <h3>The equations</h3>
  <table class="tbl">
    <tr><th>Part</th><th>Equation</th><th>In words</th></tr>
    <tr><td>Forecast</td><td>ŷ<sub>t+h|t</sub> = ℓ<sub>t</sub> + h·b<sub>t</sub></td><td>level plus h steps of slope</td></tr>
    <tr><td>Level</td><td>ℓ<sub>t</sub> = α·y<sub>t</sub> + (1 − α)·(ℓ<sub>t−1</sub> + b<sub>t−1</sub>)</td><td>blend the new value with what we expected (old level moved one step)</td></tr>
    <tr><td>Trend</td><td>b<sub>t</sub> = β·(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1 − β)·b<sub>t−1</sub></td><td>blend the latest step in level with the old slope</td></tr>
  </table>
  <p>α smooths the level (as in SES); β smooths the slope. A small β means "the growth rate changes slowly".</p>
  <h3>By hand: α = 0.5, β = 0.3</h3>
  <p>Start values: ℓ<sub>0</sub> = 16 (level just before 2014 Q1) and b<sub>0</sub> = 0.5 (a guess: the yearly averages rose about 1.5 per year, roughly 0.4–0.5 per quarter).</p>
  <table class="tbl">
    <tr><th>Quarter</th><th>y</th><th>forecast ℓ + b</th><th>error</th><th>new level</th><th>new trend</th></tr>
    <tr><td>2014 Q1</td><td>16</td><td>16 + 0.5 = 16.5</td><td>−0.5</td><td>0.5·16 + 0.5·16.5 = 16.25</td><td>0.3·(16.25 − 16) + 0.7·0.5 = 0.425</td></tr>
    <tr><td>2014 Q2</td><td>21</td><td>16.25 + 0.425 = 16.675</td><td>+4.325</td><td>0.5·21 + 0.5·16.675 = 18.838</td><td>0.3·(18.838 − 16.25) + 0.7·0.425 = 1.074</td></tr>
    <tr><td>2014 Q3</td><td>11</td><td>18.838 + 1.074 = 19.911</td><td>−8.911</td><td>0.5·11 + 0.5·19.911 = 15.456</td><td>0.3·(15.456 − 18.838) + 0.7·1.074 = −0.263</td></tr>
  </table>
  <p>Look at the trend column: +0.425, then +1.074 after the busy Q2, then −0.263 after the empty Q3. Holt reads the seasonal zig-zag as the growth rate speeding up and reversing. Keep that in mind; it is the weakness the next section fixes.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from statsmodels.tsa.holtwinters import Holt
from homestay import quarterly
train, test = quarterly[:"2017"], quarterly["2018":]

def holt(y, alpha, beta, level0, trend0, phi=1.0):
    level, trend, rows = level0, trend0, []
    for value in y:
        fc = level + phi * trend                                   # one-step forecast
        new_level = alpha * value + (1 - alpha) * fc               # blend new value with the forecast
        trend = beta * (new_level - level) + (1 - beta) * phi * trend   # blend the newest step with old slope
        level = new_level
        rows.append((value, fc, value - fc, level, trend))
    return pd.DataFrame(rows, columns=["y", "forecast", "error", "level", "trend"]), level, trend

tbl, L, B = holt(train.values, alpha=0.5, beta=0.3, level0=16, trend0=0.5)
tbl.index = train.index.to_period("Q")
print(tbl.head(5).round(3))
print("end of 2017: level", round(L, 3), " trend", round(B, 3))
h = np.arange(1, 5)
print("Holt forecasts 2018 (level + h*trend):", np.round(L + h * B, 2))

res = Holt(train, initialization_method="known", initial_level=16, initial_trend=0.5).fit(
    smoothing_level=0.5, smoothing_trend=0.3, optimized=False)
print("statsmodels agrees:", np.allclose(res.fittedvalues.values, tbl.forecast.values),
      np.round(res.forecast(4).values, 2))

tblD, LD, BD = holt(train.values, 0.5, 0.3, 16, 0.5, phi=0.9)
damped = [LD + sum(0.9 ** j for j in range(1, k + 1)) * BD for k in h]
resD = Holt(train, damped_trend=True, initialization_method="known", initial_level=16,
            initial_trend=0.5).fit(smoothing_level=0.5, smoothing_trend=0.3, damping_trend=0.9, optimized=False)
print("damped (phi=0.9) forecasts:", np.round(damped, 2), " statsmodels:", np.round(resD.forecast(4).values, 2))
for name, f in [("Holt", L + h * B), ("damped Holt", damped)]:
    print(f"{name:12s} test MAE {np.abs(test.values - f).mean():.2f}")</div>
  <div class="fx" data-lang="text">         y  forecast  error   level  trend
2014Q1  16    16.500 -0.500  16.250  0.425
2014Q2  21    16.675  4.325  18.838  1.074
2014Q3  11    19.911 -8.911  15.456 -0.263
2014Q4  18    15.193  2.807  16.596  0.158
2015Q1  18    16.755  1.245  17.377  0.345
end of 2017: level 26.959  trend 0.965
Holt forecasts 2018 (level + h*trend): [27.92 28.89 29.85 30.82]
statsmodels agrees: True [27.92 28.89 29.85 30.82]
damped (phi=0.9) forecasts: [27.36 27.97 28.52 29.02]  statsmodels: [27.36 27.97 28.52 29.02]
Holt         test MAE 3.31
damped Holt  test MAE 3.79</div>
  <p>At the end of 2017 the level is 26.959 and the slope 0.965 per quarter, so the forecasts are 26.959 + 1×0.965 = 27.92, + 2×0.965 = 28.89, and so on. statsmodels' <code>Holt</code> with the same fixed values gives identical numbers. With the same hand-picked α = 0.5, the 2018 MAE falls from 4.77 (SES) to 3.31 (Holt): learning the slope helped, and Holt now beats both naive (3.75) and seasonal naive (4.25).</p>
  <h3>Damped trend</h3>
  <p>A straight line extrapolated forever is a bold claim: in ten years Holt would predict a full homestay plus a queue on the road. Gardner and McKenzie (1985) added a <strong>damping factor</strong> φ (0 &lt; φ &lt; 1) that shrinks each future step of slope:</p>
  <p style="text-align:center"><strong>ŷ<sub>t+h|t</sub> = ℓ<sub>t</sub> + (φ + φ² + … + φ<sup>h</sup>)·b<sub>t</sub></strong></p>
  <p>The level and trend updates also multiply the old slope by φ. By hand with the damped run's end values ℓ = 26.684, b = 0.754 and φ = 0.9: h = 1 gives 26.684 + 0.9×0.754 = 27.36; h = 2 gives 26.684 + (0.9 + 0.81)×0.754 = 27.97. As h grows, φ + φ² + … approaches φ/(1 − φ) = 9, so the forecast levels off at about 26.684 + 9×0.754 = 33.5 instead of climbing forever.</p>
  <p>Here damping costs a little (MAE 3.79 vs 3.31), because the homestay really is still growing in 2018. Over long horizons and across many series, damped trend is one of the most reliable forecasting methods ever tested (it did very well in the M3 forecasting competition): most growth slows down eventually.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Holt's linear trend method</strong>: ℓ<sub>t</sub> = αy<sub>t</sub> + (1 − α)(ℓ<sub>t−1</sub> + φb<sub>t−1</sub>), b<sub>t</sub> = β(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1 − β)φb<sub>t−1</sub>, ŷ<sub>t+h|t</sub> = ℓ<sub>t</sub> + (φ + … + φ<sup>h</sup>)b<sub>t</sub>. φ = 1 gives the undamped method; 0.8 ≤ φ ≤ 0.98 is the usual damped range.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two different "betas". statsmodels' <code>Holt</code>/<code>ExponentialSmoothing</code> call the β above <code>smoothing_trend</code>. In the ETS (error-correction) form, the slope update is b<sub>t</sub> = b<sub>t−1</sub> + αβ·e<sub>t</sub>, and <code>ETSModel</code>'s <code>smoothing_trend</code> is that product αβ. Same model, different number: 0.2 in one API is 0.1 in the other when α = 0.5.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Holt's straight line goes through the middle of a zig-zag: 27.9, 28.9, 29.9, 30.8, while 2018 is really 29, 35, 25, 32. The yearly pattern (busy Q2, empty Q3) is still missing, and it even confuses the slope. <b>→ next: 04 Holt-Winters Seasonality</b></div>

  <h2 id="ep-hw"><span class="num">04</span>Holt-Winters Seasonality</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Holt knows the level and the speed, but every Q2 is about +5 above the trend and every Q3 about −5 below it, and Holt cannot represent that. How do we learn one adjustment per quarter, and keep it up to date?</p></div>
  <h3>The idea in plain words</h3>
  <p>Peter Winters (1960) added a third set of running numbers: one <strong>seasonal index</strong> per position in the season (4 for quarters, 12 for months, 7 for days of the week). Each says "this quarter usually sits this far above or below the level". When a new Q2 arrives, only Q2's index is updated. The level is now computed from the <em>deseasonalised</em> value (y minus its season), so the zig-zag no longer confuses the slope.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sweet shop owner who knows "Diwali month is +40% over normal". When this Diwali's sales come in, she first removes the usual Diwali bump to see whether the business itself has grown, and separately updates her idea of how big the Diwali bump is.</p>
  </div>
  <h3>The additive equations (m = season length)</h3>
  <table class="tbl">
    <tr><th>Part</th><th>Equation</th><th>In words</th></tr>
    <tr><td>Forecast</td><td>ŷ<sub>t+h|t</sub> = ℓ<sub>t</sub> + h·b<sub>t</sub> + s<sub>t+h−m</sub></td><td>trend line plus the latest index for that quarter (for h ≤ m)</td></tr>
    <tr><td>Level</td><td>ℓ<sub>t</sub> = α·(y<sub>t</sub> − s<sub>t−m</sub>) + (1 − α)·(ℓ<sub>t−1</sub> + b<sub>t−1</sub>)</td><td>blend the deseasonalised value with the expected level</td></tr>
    <tr><td>Trend</td><td>b<sub>t</sub> = β·(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1 − β)·b<sub>t−1</sub></td><td>unchanged from Holt</td></tr>
    <tr><td>Season</td><td>s<sub>t</sub> = γ·(y<sub>t</sub> − ℓ<sub>t−1</sub> − b<sub>t−1</sub>) + (1 − γ)·s<sub>t−m</sub></td><td>blend today's gap from the expected level with last year's index</td></tr>
  </table>
  <p>For h &gt; m, use the index from the most recent full season: s<sub>t+h−m(k+1)</sub> with k = ⌊(h − 1)/m⌋. γ is the third smoothing parameter.</p>
  <h3>Step 1 by hand: starting values from 2014</h3>
  <p>A classic recipe uses the first full year to start, and the remaining years to learn:</p>
  <ul>
    <li><strong>Level</strong> ℓ<sub>0</sub> = mean of 2014 = (16 + 21 + 11 + 18)/4 = 66/4 = <strong>16.5</strong>.</li>
    <li><strong>Trend</strong> b<sub>0</sub> = (mean of 2015 − mean of 2014)/4 = (18 − 16.5)/4 = <strong>0.375</strong> per quarter.</li>
    <li><strong>Seasons</strong> = 2014 values minus their mean: 16 − 16.5 = <strong>−0.5</strong>, 21 − 16.5 = <strong>+4.5</strong>, 11 − 16.5 = <strong>−5.5</strong>, 18 − 16.5 = <strong>+1.5</strong>. They add to 0, as additive indices should.</li>
  </ul>
  <h3>Step 2 by hand: two updates (α = 0.5, β = 0.2, γ = 0.3)</h3>
  <p><strong>2015 Q1</strong>, y = 18, last year's Q1 index −0.5:</p>
  <ul>
    <li>Forecast = 16.5 + 0.375 + (−0.5) = <strong>16.375</strong>; error = 18 − 16.375 = +1.625.</li>
    <li>Level = 0.5·(18 − (−0.5)) + 0.5·(16.5 + 0.375) = 9.25 + 8.4375 = <strong>17.6875</strong>.</li>
    <li>Trend = 0.2·(17.6875 − 16.5) + 0.8·0.375 = 0.2375 + 0.3 = <strong>0.5375</strong>.</li>
    <li>Q1 index = 0.3·(18 − 16.5 − 0.375) + 0.7·(−0.5) = 0.3375 − 0.35 = <strong>−0.0125</strong>.</li>
  </ul>
  <p><strong>2015 Q2</strong>, y = 22, last year's Q2 index +4.5:</p>
  <ul>
    <li>Forecast = 17.6875 + 0.5375 + 4.5 = <strong>22.725</strong>; error = −0.725.</li>
    <li>Level = 0.5·(22 − 4.5) + 0.5·(17.6875 + 0.5375) = 8.75 + 9.1125 = <strong>17.8625</strong>.</li>
    <li>Trend = 0.2·(17.8625 − 17.6875) + 0.8·0.5375 = 0.035 + 0.43 = <strong>0.465</strong>.</li>
    <li>Q2 index = 0.3·(22 − 17.6875 − 0.5375) + 0.7·4.5 = 1.1325 + 3.15 = <strong>4.2825</strong>.</li>
  </ul>
  <p>Compare with Holt: the busy Q2 no longer pushes the trend up (0.5375 → 0.465, a small move), because the level first subtracted the expected +4.5. The code repeats this for all twelve quarters of 2015–2017 and checks itself against two statsmodels classes:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from homestay import quarterly
train, test = quarterly[:"2017"], quarterly["2018":]

# 1. starting values from the first year (2014), the classic textbook recipe
y14, y15 = train["2014"].values, train["2015"].values
level0 = y14.mean()                                  # 16.5
trend0 = (y15.mean() - y14.mean()) / 4               # change per quarter
season0 = y14 - level0                               # how far each quarter sits from the year's mean
print("level0", level0, " trend0", trend0, " seasonal Q1..Q4", season0)

def holt_winters_add(y, alpha, beta, gamma, level, trend, season):
    season = list(season)                            # season[-4] = same quarter one year ago
    rows = []
    for value in y:
        s_old = season[-4]
        fc = level + trend + s_old                   # one-step forecast
        new_level = alpha * (value - s_old) + (1 - alpha) * (level + trend)
        new_trend = beta * (new_level - level) + (1 - beta) * trend
        new_s = gamma * (value - level - trend) + (1 - gamma) * s_old
        rows.append((value, fc, value - fc, new_level, new_trend, new_s))
        level, trend = new_level, new_trend
        season.append(new_s)
    cols = ["y", "forecast", "error", "level", "trend", "season"]
    return pd.DataFrame(rows, columns=cols), level, trend, season

y = train["2015":]                                   # learn from 2015 on; 2014 was used to start
tbl, L, B, S = holt_winters_add(y.values, 0.5, 0.2, 0.3, level0, trend0, season0)
tbl.index = y.index.to_period("Q")
print(tbl.head(5).round(3))
h = np.arange(1, 5)
fc = L + h * B + np.array(S[-4:])                    # next Q1 uses the latest Q1 season, etc.
print("end of 2017: level", round(L, 3), " trend", round(B, 3), " seasons", np.round(S[-4:], 3))
print("2018 forecast:", np.round(fc, 2), " actual:", test.values, " MAE", round(np.abs(test.values - fc).mean(), 2))

res = ExponentialSmoothing(y, trend="add", seasonal="add", seasonal_periods=4,
                           initialization_method="known", initial_level=level0,
                           initial_trend=trend0, initial_seasonal=season0).fit(
    smoothing_level=0.5, smoothing_trend=0.2, smoothing_seasonal=0.3, optimized=False)
print("ExponentialSmoothing: fitted agree", np.allclose(res.fittedvalues.values, tbl.forecast.values),
      " forecast", np.round(res.forecast(4).values, 2))

from statsmodels.tsa.exponential_smoothing.ets import ETSModel
ets = ETSModel(y, error="add", trend="add", seasonal="add", seasonal_periods=4,
               initialization_method="known", initial_level=level0,
               initial_trend=trend0, initial_seasonal=season0)
with ets.fix_params({"smoothing_level": 0.5, "smoothing_trend": 0.5 * 0.2,   # ETS writes beta as alpha*beta
                     "smoothing_seasonal": 0.3}):
    r = ets.fit(disp=False)
print("ETSModel:             fitted agree", np.allclose(r.fittedvalues.values, tbl.forecast.values),
      " forecast", np.round(r.forecast(4).values, 2))</div>
  <div class="fx" data-lang="text">level0 16.5  trend0 0.375  seasonal Q1..Q4 [-0.5  4.5 -5.5  1.5]
         y  forecast  error   level  trend  season
2015Q1  18    16.375  1.625  17.688  0.538  -0.013
2015Q2  22    22.725 -0.725  17.862  0.465   4.282
2015Q3  13    12.828  0.172  18.414  0.482  -5.448
2015Q4  19    20.396 -1.396  18.198  0.343   1.081
2016Q1  19    18.528  0.472  18.777  0.390   0.129
end of 2017: level 27.071  trend 0.987  seasons [ 0.405  5.567 -5.049  0.914]
2018 forecast: [28.46 34.61 24.98 31.93]  actual: [29 35 25 32]  MAE 0.25
ExponentialSmoothing: fitted agree True  forecast [28.46 34.61 24.98 31.91]
ETSModel:             fitted agree True  forecast [28.46 34.61 24.98 31.93]</div>
  <p><code>season</code> is a growing list, so <code>season[-4]</code> is always "the same quarter one year ago". The first rows match the hand calculation. At the end of 2017: level 27.071, trend 0.987, indices 0.405, 5.567, −5.049, 0.914. So the 2018 Q1 forecast is 27.071 + 1×0.987 + 0.405 = <strong>28.46</strong>, Q2 is 27.071 + 2×0.987 + 5.567 = 34.61, and so on. Against the real 29, 35, 25, 32 the MAE is 0.25, fifteen times better than naive.</p>
  <p>One honest detail in the output. <code>ETSModel</code> reproduces all four forecasts. <code>ExponentialSmoothing</code> (statsmodels 0.15) gives 31.91 instead of 31.93 for Q4: its forecast code overwrites the newest Q4 index (0.914) with the previous year's (0.892) when h = m. The fitted values agree exactly, and the difference is tiny here, but it is a reminder to check a library against a hand calculation at least once.</p>
  <figure class="viz"><svg viewBox="0 0 660 260" width="660">
<line x1="60" y1="220" x2="620" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="60" y="234" text-anchor="middle" class="tm" font-size="10.5">2017</text>
<line x1="60" y1="220" x2="60" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="340" y="234" text-anchor="middle" class="tm" font-size="10.5">2018</text>
<line x1="340" y1="220" x2="340" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="620" y="234" text-anchor="middle" class="tm" font-size="10.5">2019</text>
<line x1="620" y1="220" x2="620" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="55" y="223.5" text-anchor="end" class="tm" font-size="10.5">15</text>
<line x1="57" y1="220" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="55" y="185.5" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="182" x2="60" y2="182" stroke="currentColor" opacity="0.5"/>
<text x="55" y="147.5" text-anchor="end" class="tm" font-size="10.5">25</text>
<line x1="57" y1="144" x2="60" y2="144" stroke="currentColor" opacity="0.5"/>
<text x="55" y="109.5" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="106" x2="60" y2="106" stroke="currentColor" opacity="0.5"/>
<text x="55" y="71.5" text-anchor="end" class="tm" font-size="10.5">35</text>
<line x1="57" y1="68" x2="60" y2="68" stroke="currentColor" opacity="0.5"/>
<text x="55" y="33.5" text-anchor="end" class="tm" font-size="10.5">40</text>
<line x1="57" y1="30" x2="60" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="340" y1="30" x2="340" y2="220" stroke-dasharray="3 3" class="sr"/>
<polyline points="95,151.6 165,98.4 235,174.4 305,121.2 375,113.6 445,68 515,144 585,90.8" fill="none" stroke="currentColor" stroke-width="2.5"/>
<circle cx="95" cy="151.6" r="3" class="fs"/>
<circle cx="165" cy="98.4" r="3" class="fs"/>
<circle cx="235" cy="174.4" r="3" class="fs"/>
<circle cx="305" cy="121.2" r="3" class="fs"/>
<circle cx="375" cy="113.6" r="3" class="fs"/>
<circle cx="445" cy="68" r="3" class="fs"/>
<circle cx="515" cy="144" r="3" class="fs"/>
<circle cx="585" cy="90.8" r="3" class="fs"/>
<polyline points="375,145.6 445,145.6 515,145.6 585,145.6" fill="none" class="st" stroke-width="2" stroke-dasharray="5 3"/>
<polyline points="375,130.9 445,125.3 515,119.6 585,114" fill="none" class="sb" stroke-width="2" stroke-dasharray="5 3"/>
<polyline points="375,119 445,75.3 515,147.5 585,98.1" fill="none" class="sg" stroke-width="2.5"/>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">guests per night</text>
<text x="70" y="20" font-size="11">actual</text><text x="128" y="20" font-size="11" style="fill:var(--teal)">SES: flat 24.8 (MAE 5.46)</text><text x="308" y="20" font-size="11" class="tb">Holt: a line (4.02)</text><text x="450" y="20" font-size="11" class="tg">Holt-Winters (0.77)</text>
</svg><figcaption>The three methods on the test year, all with statsmodels-estimated parameters. SES draws a flat line, Holt a rising line through the middle, Holt-Winters follows the yearly shape.</figcaption></figure>
  <h3>The multiplicative version</h3>
  <p>If the seasonal swing grows as the business grows (Q2 is +20% rather than +5 guests), the indices should be <strong>ratios</strong>, not differences. Replace every "− s" by "÷ s" and every "+ s" by "× s":</p>
  <table class="tbl">
    <tr><th>Part</th><th>Multiplicative equation</th></tr>
    <tr><td>Forecast</td><td>ŷ<sub>t+h|t</sub> = (ℓ<sub>t</sub> + h·b<sub>t</sub>) × s<sub>t+h−m</sub></td></tr>
    <tr><td>Level</td><td>ℓ<sub>t</sub> = α·(y<sub>t</sub> / s<sub>t−m</sub>) + (1 − α)·(ℓ<sub>t−1</sub> + b<sub>t−1</sub>)</td></tr>
    <tr><td>Season</td><td>s<sub>t</sub> = γ·y<sub>t</sub> / (ℓ<sub>t−1</sub> + b<sub>t−1</sub>) + (1 − γ)·s<sub>t−m</sub></td></tr>
  </table>
  <p>By hand: the starting indices are 2014 / 16.5 = 16/16.5 = 0.970, 21/16.5 = 1.273, 0.667, 1.091 (they average to 1). For 2015 Q1: forecast = (16.5 + 0.375) × 0.970 = 16.364; level = 0.5·(18 / 0.970) + 0.5·16.875 = 9.281 + 8.4375 = 17.719; the Q1 index becomes 0.3·18/16.875 + 0.7·0.970 = 0.320 + 0.679 = 0.999.</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from homestay import quarterly
train, test = quarterly[:"2017"], quarterly["2018":]

y14 = train["2014"].values
level0 = y14.mean()
s0 = y14 / level0                                  # multiplicative: a ratio, not a difference
print("multiplicative seasonal indices (y / level):", np.round(s0, 3))

# one update by hand, 2015 Q1 (y = 18), alpha 0.5, beta 0.2, gamma 0.3, trend0 0.375
l, b, y = level0, 0.375, 18
fc = (l + b) * s0[0]
new_l = 0.5 * (y / s0[0]) + 0.5 * (l + b)
new_b = 0.2 * (new_l - l) + 0.8 * b
new_s = 0.3 * y / (l + b) + 0.7 * s0[0]
print(f"forecast {fc:.3f}  level {new_l:.3f}  trend {new_b:.3f}  Q1 index {new_s:.3f}")

for seasonal in ["add", "mul"]:
    res = ExponentialSmoothing(train, trend="add", seasonal=seasonal, seasonal_periods=4,
                               initialization_method="estimated").fit()
    p = res.params
    fc = res.forecast(4).values
    print(f"{seasonal}: alpha {p['smoothing_level']:.2f} beta {p['smoothing_trend']:.2f} "
          f"gamma {p['smoothing_seasonal']:.2f} | 2018 {np.round(fc, 1)} | "
          f"MAE {np.abs(test.values - fc).mean():.2f} | AICc {res.aicc:.1f}")
    print("   seasonal states for 2017 Q1..Q4:", np.round(res.season.values[-4:], 3))</div>
  <div class="fx" data-lang="text">multiplicative seasonal indices (y / level): [0.97  1.273 0.667 1.091]
forecast 16.364  level 17.719  trend 0.544  Q1 index 0.999
add: alpha 0.87 beta 0.00 gamma 0.00 | 2018 [28.3 34.  24.5 31. ] | MAE 0.77 | AICc 51.3
   seasonal states for 2017 Q1..Q4: [-0.075  4.9   -5.375  0.351]
mul: alpha 0.53 beta 0.00 gamma 0.00 | 2018 [28.3 36.3 22.5 31.3] | MAE 1.30 | AICc 59.7
   seasonal states for 2017 Q1..Q4: [0.974 1.215 0.732 0.991]</div>
  <p>With all parameters estimated, the additive model wins (MAE 0.77 vs 1.30, AICc 51.3 vs 59.7). That matches the plot: Pine View's swing between Q2 and Q3 is about 10 guests in 2014 and still about 10 in 2017, not growing with the level. The estimated β = γ = 0 says "keep the starting slope and pattern fixed"; α = 0.87 lets the level chase the 2016 speed-up. Note that the hand-chosen parameters (MAE 0.25) beat the estimated ones (0.77) on this one test year: one year of four numbers is a small exam, and luck matters.</p>
  <table class="tbl">
    <tr><th>Look at the data</th><th>Choose</th><th>Example</th></tr>
    <tr><td>Seasonal swing about the same size every year</td><td>Additive</td><td>Pine View: ±5 guests every year</td></tr>
    <tr><td>Swing grows in proportion to the level</td><td>Multiplicative (or log, then additive)</td><td>Online sales: Diwali +40% of an ever-larger base</td></tr>
    <tr><td>Values near zero</td><td>Additive</td><td>Multiplicative indices blow up when ℓ ≈ 0</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Holt-Winters method</strong>: exponential smoothing with level, trend and m seasonal indices, updated by α, β, γ. Additive: ŷ = ℓ + hb + s; multiplicative: ŷ = (ℓ + hb)·s. Needs at least two full seasons of data to estimate the pattern reliably.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting <code>seasonal_periods</code>, or setting it to the wrong number (12 on quarterly data, 7 on monthly data). The model will happily fit a nonsense pattern. m is the number of observations per cycle: 4 for quarterly-yearly, 12 for monthly-yearly, 7 for daily-weekly, 24 for hourly-daily.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We now have six variants (trend or not, damped or not, additive or multiplicative season) and only point forecasts. Which variant is right for a given series, chosen without peeking at 2018? And how wide should the error bars be? <b>→ next: 05 The ETS Framework</b></div>

  <h2 id="ep-ets"><span class="num">05</span>The ETS Framework</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The smoothing methods are recipes: they give a forecast but no probability model, so there is no likelihood to compare variants and no principled interval. How do we choose among SES, Holt, damped Holt and Holt-Winters fairly, and say "between 15 and 34 guests, with 95% confidence"?</p></div>
  <h3>The idea: every method is a state-space model</h3>
  <p>Hyndman, Koehler, Snyder and Grose (2002) showed that each smoothing method is the forecast of a simple statistical model. Write SES in error form, but now treat the one-step error ε<sub>t</sub> as random noise with variance σ²:</p>
  <ul>
    <li><strong>Observation</strong>: y<sub>t</sub> = ℓ<sub>t−1</sub> + ε<sub>t</sub> (what we see = the level so far + a random surprise)</li>
    <li><strong>State</strong>: ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + α·ε<sub>t</sub> (the surprise moves the level by a fraction α)</li>
  </ul>
  <p>These give exactly the SES forecasts, but they also describe how y <em>varies</em>. That gives a likelihood (how probable the observed data are under given α, ℓ<sub>0</sub>, σ), and from it: estimation by maximum likelihood, model choice by AIC, and simulation-based or formula-based prediction intervals.</p>
  <h3>The taxonomy: ETS(Error, Trend, Season)</h3>
  <p>Each model gets a three-letter name. <strong>E</strong>rror: A (additive) or M (multiplicative). <strong>T</strong>rend: N (none), A (additive), Ad (additive damped). <strong>S</strong>eason: N, A or M. That gives 2 × 3 × 3 = 18 models (some texts also list multiplicative trends, giving 30).</p>
  <table class="tbl">
    <tr><th>ETS name</th><th>Classic method</th><th>Forecast shape</th></tr>
    <tr><td>ETS(A,N,N)</td><td>Simple exponential smoothing</td><td>flat</td></tr>
    <tr><td>ETS(A,A,N)</td><td>Holt's linear trend</td><td>straight line</td></tr>
    <tr><td>ETS(A,Ad,N)</td><td>Damped trend</td><td>line that levels off</td></tr>
    <tr><td>ETS(A,A,A)</td><td>Additive Holt-Winters</td><td>line + fixed-size seasonal wave</td></tr>
    <tr><td>ETS(M,A,M)</td><td>Multiplicative Holt-Winters</td><td>line × seasonal ratios, errors proportional to level</td></tr>
  </table>
  <p>Additive and multiplicative <em>error</em> give the same point forecasts; they differ in the intervals (multiplicative error: the noise grows with the level) and in the likelihood, so AIC can tell them apart.</p>
  <h3>Choosing by AICc</h3>
  <p>AIC = −2·log-likelihood + 2k, where k is the number of estimated parameters (smoothing parameters, starting states, σ). Lower is better: reward fit, charge for complexity. AICc adds a correction for small samples, which matters a lot with 16 quarters. The code fits eight ETS models on 2014–2017 and ranks them by AICc, with the 2018 MAE alongside (which, in real life, you would not have):</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from statsmodels.tsa.exponential_smoothing.ets import ETSModel
from homestay import quarterly
train, test = quarterly[:"2017"].astype(float), quarterly["2018":]

configs = [("add", None, False, None), ("add", "add", False, None), ("add", "add", True, None),
           ("add", None, False, "add"), ("add", "add", False, "add"), ("add", "add", True, "add"),
           ("mul", "add", False, "add"), ("mul", "add", False, "mul")]
rows = []
for err, trend, damped, seas in configs:
    m = ETSModel(train, error=err, trend=trend, damped_trend=damped, seasonal=seas,
                 seasonal_periods=4 if seas else None)
    r = m.fit(disp=False)
    name = f"ETS({err[0].upper()},{'N' if trend is None else 'Ad' if damped else 'A'},{'N' if seas is None else seas[0].upper()})"
    fc = r.forecast(4).values
    rows.append((name, len(r.params), round(r.aicc, 1), round(np.abs(test.values - fc).mean(), 2)))
print(pd.DataFrame(rows, columns=["model", "params", "AICc", "2018 MAE"]).sort_values("AICc").to_string(index=False))</div>
  <div class="fx" data-lang="text">      model  params  AICc  2018 MAE
 ETS(A,N,A)       7  84.0      2.75
 ETS(M,A,A)       9  97.1      1.00
 ETS(A,A,A)       9 100.9      0.73
 ETS(A,N,N)       2 103.3      5.46
 ETS(A,A,N)       4 103.9      4.02
ETS(A,Ad,N)       5 109.5      4.31
 ETS(M,A,M)       9 116.0      1.09
ETS(A,Ad,A)      10 126.1      1.14</div>
  <p>Two lessons. First, seasonality is clearly needed: every model without it sits at AICc 103 or worse. Second, AICc picks ETS(A,N,A), with no trend, and that model has a 2018 MAE of 2.75 against 0.73 for ETS(A,A,A). With only 16 points, the small-sample penalty for two more parameters (trend and its starting value) outweighed the improvement in fit. AICc is a guide, not an oracle; with short series, check the top few candidates on a holdout or by back-testing.</p>
  <h3>Prediction intervals by hand (SES)</h3>
  <p>For ETS(A,N,N), the forecast error h steps ahead has variance σ²·[1 + (h − 1)α²]: one step ahead it is just σ²; each further step adds α²σ², because every future surprise will move the level by α·ε. A 95% interval is the forecast ± 1.96 standard deviations.</p>
  <ul>
    <li>Estimated α = 0.304, σ² = 22.64 (σ = 4.76), forecast 24.79.</li>
    <li>h = 1: 24.79 ± 1.96·4.76 = 24.79 ± 9.33 → <strong>15.46 to 34.12</strong>.</li>
    <li>h = 4: variance = 22.64·(1 + 3·0.304²) = 22.64·1.277 = 28.92; ± 1.96·5.38 = ± 10.54.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.tsa.exponential_smoothing.ets import ETSModel
from homestay import quarterly
train, test = quarterly[:"2017"].astype(float), quarterly["2018":]

r = ETSModel(train, error="add").fit(disp=False)                  # ETS(A,N,N) = SES with a likelihood
p = dict(zip(r.param_names, r.params))                         # e.g. smoothing_level, initial_level
alpha, sigma2 = p["smoothing_level"], r.mse                       # mse = mean squared one-step error
print(f"alpha {alpha:.3f}  sigma^2 {sigma2:.2f}  sigma {np.sqrt(sigma2):.2f}  level {r.forecast(1).iloc[0]:.2f}")
for h in [1, 2, 4]:
    half = 1.96 * np.sqrt(sigma2 * (1 + (h - 1) * alpha ** 2))    # width grows with h
    print(f"h={h}: {r.forecast(1).iloc[0]:.2f} +/- {half:.2f}")
print(r.get_prediction(start=16, end=19).summary_frame(alpha=0.05).round(2))

r2 = ETSModel(train, error="add", trend="add", seasonal="add", seasonal_periods=4).fit(disp=False)
pf = r2.get_prediction(start=16, end=19).summary_frame(alpha=0.05)
pf["actual"] = test.values
print(pf[["mean", "pi_lower", "pi_upper", "actual"]].round(2))</div>
  <div class="fx" data-lang="text">alpha 0.304  sigma^2 22.64  sigma 4.76  level 24.79
h=1: 24.79 +/- 9.33
h=2: 24.79 +/- 9.75
h=4: 24.79 +/- 10.54
             mean  pi_lower  pi_upper
2018-01-01  24.79     15.46     34.11
2018-04-01  24.79     15.04     34.53
2018-07-01  24.79     14.63     34.94
2018-10-01  24.79     14.25     35.33
             mean  pi_lower  pi_upper  actual
2018-01-01  28.33     26.83     29.84      29
2018-04-01  34.08     31.96     36.21      35
2018-07-01  24.58     21.98     27.19      25
2018-10-01  31.08     28.08     34.09      32</div>
  <p><code>r.param_names</code> lists what was estimated; <code>r.mse</code> is the mean squared one-step error, used as σ². <code>get_prediction(start, end).summary_frame(alpha=0.05)</code> gives the mean forecast and 95% interval; the SES rows match the hand formula. Notice how much the better model helps: SES's interval is 19 guests wide because the seasonal zig-zag is counted as "noise"; ETS(A,A,A)'s interval for Q1 is 3 guests wide (26.83 to 29.84) and contains the actual 29. All four 2018 actuals fall inside their ETS(A,A,A) intervals.</p>
  <h3>The bridge to ARIMA</h3>
  <p>Some ETS models are ARIMA models in disguise. Take SES and difference it: y<sub>t</sub> − y<sub>t−1</sub> = (ℓ<sub>t−1</sub> + ε<sub>t</sub>) − (ℓ<sub>t−2</sub> + ε<sub>t−1</sub>) = αε<sub>t−1</sub> + ε<sub>t</sub> − ε<sub>t−1</sub> = ε<sub>t</sub> − (1 − α)ε<sub>t−1</sub>. That is an MA(1) model for the differenced series, i.e. <strong>ARIMA(0,1,1) with θ = α − 1</strong>. Likewise Holt's method is ARIMA(0,2,2). See <a class="xref" data-note="ml_arima">ARIMA Family</a> for the MA notation. The check below fits ARIMA(0,1,1) and reuses our hand-written <code>ses()</code> from section 02.</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from e02_ses_hand import ses
from homestay import quarterly
train = quarterly[:"2017"].astype(float)

theta = ARIMA(train, order=(0, 1, 1)).fit().params["ma.L1"]
print(f"ARIMA(0,1,1): theta = {theta:.3f}  -&gt;  1 + theta = {1 + theta:.3f}")
fc_ses, level = ses(train.values, alpha=1 + theta, level0=train.iloc[0])
fc_arima = ARIMA(train, order=(0, 1, 1)).fit().forecast(1).iloc[0]
print(f"SES with alpha = 1 + theta: next forecast {level:.3f};  ARIMA forecast {fc_arima:.3f}")</div>
  <div class="fx" data-lang="text">ARIMA(0,1,1): theta = -0.667  -&gt;  1 + theta = 0.333
SES with alpha = 1 + theta: next forecast 25.034;  ARIMA forecast 25.036</div>
  <p>ARIMA estimates θ = −0.667, so α = 1 + θ = 0.333, and SES with that α gives the same next forecast (25.03 vs 25.04; the tiny gap comes from how each method starts). The two families overlap, but neither contains the other: multiplicative ETS models have no ARIMA twin, and ARIMA models with several AR terms have no ETS twin.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ETS model</strong>: an innovations state-space model with one source of randomness ε<sub>t</sub> ~ N(0, σ²) driving both the observation and the state updates (level, trend, season). Named ETS(E,T,S) by its error, trend and seasonal types. Its point forecasts equal those of the matching exponential smoothing method; it adds a likelihood for estimation, AIC/AICc model selection and prediction intervals.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing AIC across libraries or across differently transformed data. <code>ExponentialSmoothing</code> reported AICc 51.3 and <code>ETSModel</code> 100.9 for the same additive Holt-Winters: different likelihood constants. Compare AIC only between models fitted by the same code on the same y.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We know the theory and have run the models with hand-picked settings. In practice: which arguments matter, what the fitted object contains, how to check residuals, and what goes wrong silently? <b>→ next: 06 statsmodels in Practice</b></div>

  <h2 id="ep-sm"><span class="num">06</span>statsmodels in Practice</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We have used statsmodels only to confirm hand calculations with fixed parameters. How does a normal fit look, what does it estimate, how do we inspect it, and where does it break?</p></div>
  <h3>The three classes and their arguments</h3>
  <table class="tbl">
    <tr><th>Class</th><th>What it is</th><th>Key arguments</th></tr>
    <tr><td><code>SimpleExpSmoothing(y)</code></td><td>SES</td><td><code>initialization_method</code></td></tr>
    <tr><td><code>Holt(y, damped_trend=…)</code></td><td>Holt / damped</td><td><code>exponential=True</code> for a multiplicative trend</td></tr>
    <tr><td><code>ExponentialSmoothing(y, …)</code></td><td>All of the above and Holt-Winters</td><td><code>trend</code> ("add"/"mul"/None), <code>damped_trend</code>, <code>seasonal</code> ("add"/"mul"/None), <code>seasonal_periods</code>, <code>initialization_method</code> ("estimated", "heuristic", "known"), <code>use_boxcox</code></td></tr>
    <tr><td><code>ETSModel(y, error=…)</code></td><td>The statistical ETS model</td><td>same, plus <code>error</code> ("add"/"mul"); gives AICc and intervals</td></tr>
  </table>
  <p><code>.fit()</code> estimates every smoothing parameter and the starting states by minimising the SSE (ExponentialSmoothing) or maximising the likelihood (ETSModel). Pass a value, such as <code>fit(smoothing_level=0.3)</code>, to fix it and estimate the rest.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.stats.diagnostic import acorr_ljungbox
from homestay import quarterly
train, test = quarterly[:"2017"].astype(float), quarterly["2018":]

model = ExponentialSmoothing(train, trend="add", damped_trend=False, seasonal="add",
                             seasonal_periods=4, initialization_method="estimated")
res = model.fit()                                    # optimises alpha, beta, gamma and the start values
print(pd.Series(res.params)[["smoothing_level", "smoothing_trend", "smoothing_seasonal",
                             "initial_level", "initial_trend"]].round(3).to_string())
print("initial seasons:", np.round(res.params["initial_seasons"], 2))
states = pd.DataFrame({"level": res.level, "trend": res.trend, "season": res.season,
                       "fitted": res.fittedvalues, "resid": res.resid}).round(2)
print(states.tail(4))
print("SSE", round(res.sse, 2), " AICc", round(res.aicc, 1))
print("Ljung-Box p-value (lag 4):", round(acorr_ljungbox(res.resid, lags=[4]).lb_pvalue.iloc[0], 3))

res_fixed = model.fit(smoothing_level=0.3, optimized=True)   # fix alpha, estimate the rest
print("alpha fixed at 0.3 -&gt; beta", round(res_fixed.params["smoothing_trend"], 3),
      " 2018:", np.round(res_fixed.forecast(4).values, 1))</div>
  <div class="fx" data-lang="text">smoothing_level        0.867
smoothing_trend          0.0
smoothing_seasonal       0.0
initial_level         15.193
initial_trend          0.775
initial seasons: [-0.08  4.9  -5.37  0.35]
            level  trend  season  fitted  resid
2017-01-01  24.00   0.77   -0.08   23.40   0.60
2017-04-01  25.92   0.77    4.90   29.67   1.33
2017-07-01  26.42   0.77   -5.37   21.32  -0.32
2017-10-01  27.59   0.77    0.35   27.54   0.46
SSE 9.3  AICc 51.3
Ljung-Box p-value (lag 4): 0.23
alpha fixed at 0.3 -&gt; beta 0.3  2018: [28.3 35.2 25.3 31.6]</div>
  <p>Reading the output line by line:</p>
  <ul>
    <li><strong>α = 0.867, β = 0, γ = 0</strong>: the slope (0.775 per quarter) and seasonal pattern (−0.08, +4.9, −5.37, +0.35) are kept fixed at their starting values; only the level moves, and it moves fast. That is how this model absorbs the 2016 speed-up: the level jumps to catch up while the slope stays put.</li>
    <li><strong>The state table</strong>: <code>level</code>, <code>trend</code>, <code>season</code> are the running numbers after each quarter; <code>fitted</code> is the one-step forecast made before seeing that quarter; <code>resid</code> = actual − fitted.</li>
    <li><strong>SSE 9.3</strong> over 16 quarters: a typical one-step error of √(9.3/16) ≈ 0.76 guests, versus an SSE of 362 for SES.</li>
    <li><strong>Ljung-Box p = 0.23</strong>: the test asks "are the residuals still autocorrelated?" A large p-value means no evidence of leftover pattern, which is what we want (<a class="xref" data-note="ml_arima">ARIMA Family</a> explains the test).</li>
    <li>Fixing α = 0.3 makes the optimiser use the slope instead (β = 0.3), with similar 2018 forecasts. Several parameter combinations can describe the same data; that is why β = 0 should not be read as "no trend".</li>
  </ul>
  <h3>Where it breaks: daily data with gaps</h3>
  <p>The quarterly averages hide what the register really looks like. Mrs Thakur's daily register has a weekly rhythm (Friday and Saturday nights full of weekend visitors from Chandigarh), the yearly rhythm, a five-day carnival in some years, and twenty lost days. Here is a peek:</p>
  <div class="fx" data-lang="py">import pandas as pd
from homestay import daily

week = daily["2017-01-12":"2017-01-21"]                               # the days around the 2017 carnival
print(" ".join(f"{d:%a %d}:{v:.0f}" for d, v in week.items()))
print("days in register:", len(daily), " missing days:",
      len(pd.date_range("2014-01-01", "2018-12-31")) - len(daily))
by_day = daily[:"2017"].groupby(daily[:"2017"].index.day_name().str[:3]).mean()
print("average by weekday:", by_day[["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]].round(1).to_dict())
q = daily[:"2017"].resample("QS").mean()
print("2017 Q1 average with carnival:", round(q["2017-01-01"], 2),
      " without the 5 carnival days:", round(daily["2017-01":"2017-03"].drop(
          pd.date_range("2017-01-15", "2017-01-19")).mean(), 2))</div>
  <div class="fx" data-lang="text">Thu 12:21 Fri 13:29 Sat 14:29 Sun 15:36 Mon 16:32 Tue 17:34 Wed 18:32 Thu 19:34 Fri 20:30 Sat 21:30
days in register: 1806  missing days: 20
average by weekday: {'Mon': 17.9, 'Tue': 18.2, 'Wed': 18.1, 'Thu': 18.2, 'Fri': 23.6, 'Sat': 25.5, 'Sun': 21.0}
2017 Q1 average with carnival: 24.12  without the 5 carnival days: 23.56</div>
  <p>The carnival (Sun 15 to Thu 19 January 2017) lifts ordinary weekdays from about 21 to 32–34 guests, yet the whole quarter's average moves by only 0.56. Quarterly data simply cannot see it. Weekdays average about 18, Saturdays 25.5. What happens if we give this to Holt-Winters?</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from homestay import daily

y = daily[:"2017"].asfreq("D")                      # put the 20 lost days back, as NaN
print("NaN days:", y.isna().sum())
bad = ExponentialSmoothing(y, trend="add", seasonal="add", seasonal_periods=7).fit()
print("with the gap left in, forecast:", bad.forecast(3).values)      # no error, just NaN

y = y.interpolate()                                  # patch the gap by drawing straight lines
r = ExponentialSmoothing(y, trend="add", seasonal="add", seasonal_periods=7,
                         initialization_method="estimated").fit()
f = r.forecast(365).values
real = daily["2018"]
e = np.abs(real.values - f[(real.index - real.index[0]).days])
print(f"Holt-Winters, weekly season: daily MAE 2018 = {e.mean():.2f}")
print("forecast for 1, 2 Jan and 30, 31 Dec 2018:", np.round(f[[0, 1, 363, 364]], 1),
      " actual:", real.iloc[[0, 1, -2, -1]].values)</div>
  <div class="fx" data-lang="text">NaN days: 20
with the gap left in, forecast: [nan nan nan]
Holt-Winters, weekly season: daily MAE 2018 = 4.04
forecast for 1, 2 Jan and 30, 31 Dec 2018: [27.6 27.9 33.8 30.8]  actual: [28. 24. 33. 31.]</div>
  <ul>
    <li><code>asfreq("D")</code> makes the gap explicit as 20 NaN rows. statsmodels then returns <strong>NaN forecasts without raising an error</strong>. You must fill the gap yourself (here with <code>interpolate()</code>, straight lines between neighbours).</li>
    <li>Holt-Winters takes <strong>one</strong> season length. With m = 7 it learns the weekly rhythm but not the yearly one (m = 365 would need hundreds of seasonal states and still miss the week). Its 2018 daily MAE is 4.04 guests.</li>
    <li>It has no way to be told "the carnival is on 15–19 January 2018".</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>initialization_method</strong>: how the starting level, trend and seasons are set. "estimated" optimises them with the smoothing parameters (the default to use); "heuristic" uses a decomposition of the first few seasons (needs ≥ 2 full seasons, ideally 10); "known" uses values you pass.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Feeding a series with a missing period, or with no fixed frequency. Gaps give silent NaN forecasts; an index without a frequency gives a warning and treats rows as equally spaced even when they are not. Always <code>asfreq()</code>, look at <code>isna().sum()</code>, and fill on purpose.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Exponential smoothing needs complete, equally spaced data and one season length, and cannot be told about special days. The daily register has two seasons, irregular festival days and missing days. <b>→ next: 07 Prophet's Decomposable Model</b></div>

  <h2 id="ep-prophet"><span class="num">07</span>Prophet's Decomposable Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Holt-Winters updates its states one row at a time, so it needs every row present, equally spaced, and one season length. The daily register has a weekly and a yearly rhythm, festival days in some years only, and a gap. How do we forecast it without forcing it into that shape?</p></div>
  <h3>The idea in plain words</h3>
  <p>Prophet (released by Facebook, now Meta, in 2017; Taylor and Letham, "Forecasting at Scale") does not walk through the series step by step at all. It treats forecasting as <strong>curve fitting against the calendar</strong>: build columns that describe each date (how far along the trend, where in the year, which weekday, is it a carnival day), and fit one regression of y on those columns. To forecast, compute the same columns for future dates and add up.</p>
  <p style="text-align:center"><strong>y(t) = g(t) + s(t) + h(t) + ε<sub>t</sub></strong></p>
  <table class="tbl">
    <tr><th>Piece</th><th>Meaning</th><th>Built from</th></tr>
    <tr><td><strong>g(t)</strong> trend</td><td>slow, non-repeating change</td><td>a piecewise straight line (or a logistic curve with a ceiling) that can bend at changepoints</td></tr>
    <tr><td><strong>s(t)</strong> seasonality</td><td>repeating patterns: weekly, yearly, any custom period</td><td>Fourier series: sums of sine and cosine waves</td></tr>
    <tr><td><strong>h(t)</strong> holidays/events</td><td>effects on specific, listed dates</td><td>one 0/1 column per day of each event's window</td></tr>
    <tr><td><strong>ε<sub>t</sub></strong></td><td>everything else</td><td>assumed independent normal noise</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An experienced hotel manager's mental model: "We are on a growth path since the road opened (trend). Weekends are busier than weekdays and May–June is peak (seasons). Carnival week is special (holiday). Anything else is luck." Prophet writes exactly this sentence as an equation.</p>
  </div>
  <p>Because no lags are used, a missing day is simply a missing row: nothing needs to be filled in. Dates need not be equally spaced. Any number of seasonal periods can be added. The price: Prophet has no short-term memory. If yesterday was unusually busy, it does not raise tomorrow's forecast.</p>
  <h3>Seasonality as Fourier waves, by hand</h3>
  <p>How do you write "a smooth yearly shape of any form" as regression columns? Any smooth repeating curve can be built from sine and cosine waves whose periods divide the cycle (a Fourier series):</p>
  <p style="text-align:center"><strong>s(t) = Σ<sub>n=1..N</sub> [a<sub>n</sub>·cos(2πnt/P) + b<sub>n</sub>·sin(2πnt/P)]</strong></p>
  <p>P is the period in days (365.25 for yearly, 7 for weekly), t is the date in days since 1 January 1970, and N (the <em>Fourier order</em>) controls how wiggly the shape may be. Each n gives two columns (sin, cos), and the a's and b's are ordinary regression weights. Prophet's defaults: yearly N = 10 (20 columns), weekly N = 3 (6 columns).</p>
  <p>By hand for 15 January 2018: t = 17,546 days since 1970. 17,546 / 365.25 = 48.0383 years, so the date is 0.0383 of the way through a year. The first yearly pair is sin(2π × 0.0383) = sin(0.2407) = <strong>0.2385</strong> and cos(0.2407) = <strong>0.9711</strong>; the second pair uses 2 × 0.0383: sin(0.4813) = 0.4633, cos = 0.8862.</p>
  <div class="fx" data-lang="py">import logging, numpy as np, pandas as pd
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
from prophet import Prophet
from homestay import daily, carnival

def fourier(dates, period, order):
    """sin/cos pairs that repeat every \`period\` days: the building blocks of a smooth cycle."""
    t = (dates - pd.Timestamp("1970-01-01")).days.values          # days since 1970, Prophet's clock
    cols = {}
    for k in range(1, order + 1):
        cols[f"sin{k}"] = np.sin(2 * np.pi * k * t / period)
        cols[f"cos{k}"] = np.cos(2 * np.pi * k * t / period)
    return pd.DataFrame(cols, index=dates)

day = pd.DatetimeIndex(["2018-01-15"])
t = (day - pd.Timestamp("1970-01-01")).days[0]
print("days since 1970:", t, " years:", round(t / 365.25, 4), " position in year:", round(t / 365.25 % 1, 4))
print(fourier(day, 365.25, 2).round(4).to_string())
print("matches Prophet's own:", np.allclose(fourier(day, 365.25, 10).values,
                                            Prophet.fourier_series(pd.Series(day), 365.25, 10)))

df = daily[:"2017"].reset_index(); df.columns = ["ds", "y"]
m = Prophet(holidays=carnival).fit(df)
feats, _, comp, _ = m.make_all_seasonality_features(m.setup_dataframe(pd.DataFrame({"ds": day})))
beta = m.params["beta"][0]                                         # one learned weight per column
print("feature columns:", feats.shape[1], "=", (comp[["yearly", "weekly", "holidays"]].sum()).to_dict())
for part in ["yearly", "weekly", "snow_carnival"]:
    value = feats.values[0] @ (comp[part].values * beta) * m.y_scale  # sum of weight x feature
    print(f"{part:14s} {value:6.2f}")</div>
  <div class="fx" data-lang="text">days since 1970: 17546  years: 48.0383  position in year: 0.0383
              sin1    cos1    sin2    cos2
2018-01-15  0.2385  0.9711  0.4633  0.8862
matches Prophet's own: True
feature columns: 31 = {'yearly': 20, 'weekly': 6, 'holidays': 5}
yearly           0.97
weekly          -2.46
snow_carnival   11.46</div>
  <p>Our <code>fourier()</code> matches Prophet's own <code>fourier_series</code>. After fitting, Prophet has 31 seasonal/holiday columns: 20 yearly, 6 weekly, 5 holiday (one per carnival day). <code>make_all_seasonality_features</code> builds the columns for any date, <code>m.params["beta"]</code> holds one weight per column (on the scaled y), and multiplying back by <code>m.y_scale</code> (Prophet divides y by its maximum before fitting) gives the components in guests: yearly +0.97, weekly −2.46 (a Monday), carnival +11.46. Prophet is, literally, a linear regression on calendar columns plus a trend.</p>
  <h3>Holidays as indicator columns</h3>
  <p>A holiday table lists event names and dates, plus a window: <code>lower_window=0, upper_window=4</code> means "the date and the 4 days after it". Prophet creates one 0/1 column per window day (snow_carnival_+0 … snow_carnival_+4), each with its own weight. Because the carnival is listed for 2015 and 2017 in training, Prophet can learn its size, and because 2018 is listed too, it can apply it to the future. Years without a carnival (2014, 2016) simply have zeros. A seasonal pattern could never do this: it repeats every year.</p>
  <h3>The fit, and one forecast added up by hand</h3>
  <div class="fx" data-lang="py">import logging, numpy as np, pandas as pd
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
from prophet import Prophet
from homestay import daily, carnival

df = daily[:"2017"].reset_index()                 # Prophet wants a table, not an indexed series
df.columns = ["ds", "y"]                          # ds = date stamp, y = value: fixed names
print(df.tail(3).to_string(index=False), "| rows:", len(df))
print(carnival.to_string(index=False))

m = Prophet(holidays=carnival)                    # weekly + yearly seasonality are on by default
m.fit(df)                                         # missing days need no special handling
future = m.make_future_dataframe(periods=365)     # every training date + 365 new days
np.random.seed(0)                                 # the intervals are simulated: fix the dice
fc = m.predict(future)
print(len(future), "rows to predict;", len(fc.columns), "columns, e.g.:",
      [c for c in fc.columns if not c.endswith(("_lower", "_upper"))])
cols = ["ds", "trend", "yearly", "weekly", "snow_carnival", "yhat", "yhat_lower", "yhat_upper"]
print(fc.loc[fc.ds.between("2018-01-13", "2018-01-20"), cols].round(2).to_string(index=False))</div>
  <div class="fx" data-lang="text">        ds    y
2017-12-29 31.0
2017-12-30 35.0
2017-12-31 30.0 | rows: 1441
      holiday         ds  lower_window  upper_window
snow_carnival 2015-01-15             0             4
snow_carnival 2017-01-15             0             4
snow_carnival 2018-01-15             0             4
1806 rows to predict; 25 columns, e.g.: ['ds', 'trend', 'additive_terms', 'holidays', 'snow_carnival', 'weekly', 'yearly', 'multiplicative_terms', 'yhat']
        ds  trend  yearly  weekly  snow_carnival  yhat  yhat_lower  yhat_upper
2018-01-13  28.07    1.09    5.14           0.00 34.31       31.69       36.73
2018-01-14  28.08    1.03    0.57           0.00 29.68       27.12       32.31
2018-01-15  28.09    0.97   -2.46          11.46 38.06       35.42       40.76
2018-01-16  28.10    0.89   -2.10          10.77 37.67       34.88       40.26
2018-01-17  28.12    0.81   -2.21          10.74 37.46       34.77       39.93
2018-01-18  28.13    0.72   -2.23          11.17 37.78       35.24       40.26
2018-01-19  28.14    0.62    3.28          11.28 43.33       40.87       45.86
2018-01-20  28.15    0.52    5.14           0.00 33.82       31.49       36.38</div>
  <p>Prophet requires a DataFrame with exactly two columns, <code>ds</code> (dates) and <code>y</code>. <code>make_future_dataframe(periods=365)</code> lists every training date plus 365 new ones (1,441 + 365 = 1,806 rows). <code>predict</code> returns one column per component plus <code>yhat</code> and an 80% interval (<code>yhat_lower</code>, <code>yhat_upper</code>). The interval is simulated, so we seed numpy to make it repeatable.</p>
  <p>Monday 15 January 2018, the carnival's first day, added up by hand: trend 28.09 + yearly 0.97 + weekly (Monday) −2.46 + carnival 11.46 = <strong>38.06</strong>. Every row is such a sum. Against the register:</p>
  <table class="tbl">
    <tr><th>Day (2018)</th><th>Sat 13</th><th>Sun 14</th><th>Mon 15</th><th>Tue 16</th><th>Wed 17</th><th>Thu 18</th><th>Fri 19</th><th>Sat 20</th></tr>
    <tr><td>Prophet yhat</td><td>34.31</td><td>29.68</td><td>38.06</td><td>37.67</td><td>37.46</td><td>37.78</td><td>43.33</td><td>33.82</td></tr>
    <tr><td>actual</td><td>37</td><td>27</td><td>40</td><td>39</td><td>36</td><td>38</td><td>43</td><td>33</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 680 410" width="680">
<line x1="60" y1="180" x2="320" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="60" y="194" text-anchor="middle" class="tm" font-size="10.5">2014</text>
<line x1="60" y1="180" x2="60" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="112" y="194" text-anchor="middle" class="tm" font-size="10.5">2015</text>
<line x1="112" y1="180" x2="112" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="164" y="194" text-anchor="middle" class="tm" font-size="10.5">2016</text>
<line x1="164" y1="180" x2="164" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="216" y="194" text-anchor="middle" class="tm" font-size="10.5">2017</text>
<line x1="216" y1="180" x2="216" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="268" y="194" text-anchor="middle" class="tm" font-size="10.5">2018</text>
<line x1="268" y1="180" x2="268" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="320" y="194" text-anchor="middle" class="tm" font-size="10.5">2019</text>
<line x1="320" y1="180" x2="320" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="55" y="183.5" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="57" y1="180" x2="60" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="55" y="123.5" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="120" x2="60" y2="120" stroke="currentColor" opacity="0.5"/>
<text x="55" y="63.5" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="60" x2="60" y2="60" stroke="currentColor" opacity="0.5"/>
<line x1="164" y1="30" x2="164" y2="180" stroke-dasharray="3 3" class="sr"/>
<text x="168" y="40" class="tm" font-size="10.5">road opens</text>
<polyline points="60,145.8 61.4,145.6 62.8,145.3 64.3,145.1 65.7,144.8 67.1,144.6 68.5,144.3 70,144.1 71.4,143.8 72.8,143.6 74.2,143.3 75.7,143.1 77.1,142.8 78.5,142.6 79.9,142.3 81.4,142.1 82.8,141.8 84.2,141.5 85.6,141.3 87,141 88.5,140.8 89.9,140.5 91.3,140.3 92.7,140 94.2,139.8 95.6,139.5 97,139.3 98.4,139 99.9,138.8 101.3,138.5 102.7,138.3 104.1,138 105.6,137.8 107,137.5 108.4,137.3 109.8,137 111.3,136.8 112.7,136.5 114.1,136.3 115.5,136 116.9,135.8 118.4,135.5 119.8,135.3 121.2,135 122.6,134.8 124.1,134.5 125.5,134.2 126.9,134 128.3,133.7 129.8,133.5 131.2,133.2 132.6,133 136.9,132.2 138.3,132 139.7,131.7 141.1,131.5 142.6,131.2 144,130.8 145.4,130.5 146.8,130.2 148.3,129.9 149.7,129.5 151.1,129.1 152.5,128.8 154,128.4 155.4,128 156.8,127.6 158.2,127.2 159.7,126.8 161.1,126.4 162.5,125.9 163.9,125.4 165.4,124.9 166.8,124.3 168.2,123.8 169.6,123.1 171,122.5 172.5,121.8 173.9,121.2 175.3,120.5 176.7,119.7 178.2,119 179.6,118.3 181,117.5 182.4,116.8 183.9,116 185.3,115.3 186.7,114.6 188.1,113.8 189.6,113.1 191,112.4 192.4,111.6 193.8,110.9 195.2,110.1 196.7,109.4 198.1,108.7 199.5,107.9 200.9,107.2 202.4,106.5 203.8,105.7 205.2,105 206.6,104.2 208.1,103.5 209.5,102.8 210.9,102 212.3,101.3 213.8,100.6 215.2,99.8 216.6,99.1 218,98.3 219.5,97.6 220.9,96.9 222.3,96.1 223.7,95.4 225.1,94.7 226.6,93.9 228,93.2 229.4,92.5 230.8,91.7 232.3,91 233.7,90.2 235.1,89.5 236.5,88.8 238,88 239.4,87.3 240.8,86.6 242.2,85.8 243.7,85.1 245.1,84.3 246.5,83.6 247.9,82.9 249.3,82.1 250.8,81.4 252.2,80.7 253.6,79.9 255,79.2 256.5,78.4 257.9,77.7 259.3,77 260.7,76.2 262.2,75.5 263.6,74.8 265,74 266.4,73.3 267.9,72.5 269.3,71.8 270.7,71.1 272.1,70.3 273.6,69.6 275,68.9 276.4,68.1 277.8,67.4 279.2,66.7 280.7,65.9 282.1,65.2 283.5,64.4 284.9,63.7 286.4,63 287.8,62.2 289.2,61.5 290.6,60.8 292.1,60 293.5,59.3 294.9,58.5 296.3,57.8 297.8,57.1 299.2,56.3 300.6,55.6 302,54.9 303.4,54.1 304.9,53.4 306.3,52.6 307.7,51.9 309.1,51.2 310.6,50.4 312,49.7 313.4,49 314.8,48.2 316.3,47.5 317.7,46.7 319.1,46" fill="none" class="sb" stroke-width="2.5"/>
<text x="190" y="22" text-anchor="middle" font-size="12.5" font-weight="700">trend g(t)</text><line x1="380" y1="180" x2="640" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="380" y1="30" x2="380" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="380.7" y="194" text-anchor="middle" class="tm" font-size="10.5">Jan</text>
<line x1="380.7" y1="180" x2="380.7" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="444.8" y="194" text-anchor="middle" class="tm" font-size="10.5">Apr</text>
<line x1="444.8" y1="180" x2="444.8" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="509.6" y="194" text-anchor="middle" class="tm" font-size="10.5">Jul</text>
<line x1="509.6" y1="180" x2="509.6" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="575.2" y="194" text-anchor="middle" class="tm" font-size="10.5">Oct</text>
<line x1="575.2" y1="180" x2="575.2" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="640" y="194" text-anchor="middle" class="tm" font-size="10.5"></text>
<line x1="640" y1="180" x2="640" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="375" y="183.5" text-anchor="end" class="tm" font-size="10.5">-8</text>
<line x1="377" y1="180" x2="380" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="375" y="146" text-anchor="end" class="tm" font-size="10.5">-4</text>
<line x1="377" y1="142.5" x2="380" y2="142.5" stroke="currentColor" opacity="0.5"/>
<text x="375" y="108.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="377" y1="105" x2="380" y2="105" stroke="currentColor" opacity="0.5"/>
<text x="375" y="71" text-anchor="end" class="tm" font-size="10.5">4</text>
<line x1="377" y1="67.5" x2="380" y2="67.5" stroke="currentColor" opacity="0.5"/>
<text x="375" y="33.5" text-anchor="end" class="tm" font-size="10.5">8</text>
<line x1="377" y1="30" x2="380" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="380" y1="105" x2="640" y2="105" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<polyline points="380.7,90.8 382.8,91.7 385,92.5 387.1,93.5 389.3,94.9 391.4,96.8 393.5,99.4 395.7,102.4 397.8,105.7 399.9,108.7 402.1,111.4 404.2,113.3 406.4,114.3 408.5,114.7 410.6,114.4 412.8,114 414.9,113.8 417,113.9 419.2,114.7 421.3,116.1 423.5,117.8 425.6,119.5 427.7,120.7 429.9,121 432,120.1 434.1,117.9 436.3,114.5 438.4,109.9 440.5,104.7 442.7,99.3 444.8,94 447,89.2 449.1,85 451.2,81.2 453.4,77.9 455.5,74.6 457.6,71.2 459.8,67.4 461.9,63.1 464.1,58.4 466.2,53.4 468.3,48.5 470.5,43.9 472.6,39.9 474.7,36.8 476.9,34.5 479,33.2 481.2,32.6 483.3,32.6 485.4,33 487.6,33.9 489.7,35.1 491.8,36.9 494,39.4 496.1,43 498.2,47.9 500.4,54.3 502.5,62.2 504.7,71.7 506.8,82.5 508.9,94.2 511.1,106.4 513.2,118.5 515.3,130.1 517.5,140.6 519.6,149.9 521.8,157.6 523.9,163.8 526,168.4 528.2,171.8 530.3,174 532.4,175.3 534.6,176.1 536.7,176.4 538.8,176.5 541,176.3 543.1,175.8 545.3,175 547.4,173.8 549.5,171.9 551.7,169.4 553.8,166.1 555.9,162.2 558.1,157.7 560.2,152.7 562.4,147.5 564.5,142.3 566.6,137.2 568.8,132.2 570.9,127.5 573,123.1 575.2,118.9 577.3,114.9 579.5,111.1 581.6,107.6 583.7,104.4 585.9,101.9 588,100.1 590.1,99.4 592.3,99.9 594.4,101.5 596.5,104 598.7,107.2 600.8,110.5 603,113.3 605.1,115.2 607.2,115.7 609.4,114.5 611.5,111.7 613.6,107.4 615.8,102.2 617.9,96.6 620.1,91.4 622.2,87 624.3,83.9 626.5,82.2 628.6,81.9 630.7,82.8 632.9,84.5 635,86.4 637.2,88.3 639.3,89.8" fill="none" class="sg" stroke-width="2.5"/>
<text x="510" y="22" text-anchor="middle" font-size="12.5" font-weight="700">yearly s(t)</text><line x1="60" y1="370" x2="320" y2="370" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="240" x2="60" y2="370" stroke="currentColor" opacity="0.5"/>
<text x="78.6" y="384" text-anchor="middle" class="tm" font-size="10.5">Mon</text>
<line x1="78.6" y1="370" x2="78.6" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="115.7" y="384" text-anchor="middle" class="tm" font-size="10.5">Tue</text>
<line x1="115.7" y1="370" x2="115.7" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="152.9" y="384" text-anchor="middle" class="tm" font-size="10.5">Wed</text>
<line x1="152.9" y1="370" x2="152.9" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="190" y="384" text-anchor="middle" class="tm" font-size="10.5">Thu</text>
<line x1="190" y1="370" x2="190" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="227.1" y="384" text-anchor="middle" class="tm" font-size="10.5">Fri</text>
<line x1="227.1" y1="370" x2="227.1" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="264.3" y="384" text-anchor="middle" class="tm" font-size="10.5">Sat</text>
<line x1="264.3" y1="370" x2="264.3" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="301.4" y="384" text-anchor="middle" class="tm" font-size="10.5">Sun</text>
<line x1="301.4" y1="370" x2="301.4" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="55" y="373.5" text-anchor="end" class="tm" font-size="10.5">-4</text>
<line x1="57" y1="370" x2="60" y2="370" stroke="currentColor" opacity="0.5"/>
<text x="55" y="321.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="318" x2="60" y2="318" stroke="currentColor" opacity="0.5"/>
<text x="55" y="282.5" text-anchor="end" class="tm" font-size="10.5">3</text>
<line x1="57" y1="279" x2="60" y2="279" stroke="currentColor" opacity="0.5"/>
<text x="55" y="243.5" text-anchor="end" class="tm" font-size="10.5">6</text>
<line x1="57" y1="240" x2="60" y2="240" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="318" x2="320" y2="318" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<polyline points="78.6,350 115.7,345.3 152.9,346.7 190,347 227.1,275.3 264.3,251.1 301.4,310.6" fill="none" class="st" stroke-width="2.5"/>
<circle cx="78.6" cy="350" r="3" class="ft st"/>
<circle cx="115.7" cy="345.3" r="3" class="ft st"/>
<circle cx="152.9" cy="346.7" r="3" class="ft st"/>
<circle cx="190" cy="347" r="3" class="ft st"/>
<circle cx="227.1" cy="275.3" r="3" class="ft st"/>
<circle cx="264.3" cy="251.1" r="3" class="ft st"/>
<circle cx="301.4" cy="310.6" r="3" class="ft st"/>
<text x="190" y="232" text-anchor="middle" font-size="12.5" font-weight="700">weekly s(t)</text><line x1="380" y1="370" x2="640" y2="370" stroke="currentColor" opacity="0.5"/>
<line x1="380" y1="240" x2="380" y2="370" stroke="currentColor" opacity="0.5"/>
<text x="380" y="384" text-anchor="middle" class="tm" font-size="10.5">8 Jan</text>
<line x1="380" y1="370" x2="380" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="475.8" y="384" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="475.8" y1="370" x2="475.8" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="530.5" y="384" text-anchor="middle" class="tm" font-size="10.5">19</text>
<line x1="530.5" y1="370" x2="530.5" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="640" y="384" text-anchor="middle" class="tm" font-size="10.5">27</text>
<line x1="640" y1="370" x2="640" y2="373" stroke="currentColor" opacity="0.5"/>
<text x="375" y="364.2" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="377" y1="360.7" x2="380" y2="360.7" stroke="currentColor" opacity="0.5"/>
<text x="375" y="308.5" text-anchor="end" class="tm" font-size="10.5">6</text>
<line x1="377" y1="305" x2="380" y2="305" stroke="currentColor" opacity="0.5"/>
<text x="375" y="252.8" text-anchor="end" class="tm" font-size="10.5">12</text>
<line x1="377" y1="249.3" x2="380" y2="249.3" stroke="currentColor" opacity="0.5"/>
<polyline points="380,360.7 393.7,360.7 407.4,360.7 421.1,360.7 434.7,360.7 448.4,360.7 462.1,360.7 475.8,254.3 489.5,260.7 503.2,261 516.8,257 530.5,255.9 544.2,360.7 557.9,360.7 571.6,360.7 585.3,360.7 598.9,360.7 612.6,360.7 626.3,360.7 640,360.7" fill="none" class="sr" stroke-width="2.5"/>
<text x="510" y="232" text-anchor="middle" font-size="12.5" font-weight="700">holiday h(t): carnival 2018</text>
</svg><figcaption>Prophet's four components for Pine View. Trend: bends upward around the road opening. Yearly: summer peak, monsoon trough, small New Year bump. Weekly: Friday and Saturday high. Holiday: the carnival's five days, each with its own weight.</figcaption></figure>
  <h3>How Prophet fits, briefly</h3>
  <ul>
    <li>y is divided by its maximum and time is rescaled to run from 0 to 1 over the training span, so default priors work for any units.</li>
    <li>Each weight has a prior: seasonal and holiday weights ~ Normal(0, 10) (<code>seasonality_prior_scale</code>, <code>holidays_prior_scale</code>); changepoint slopes ~ Laplace(0, 0.05) (section 08). Smaller scales shrink the component, like ridge regression.</li>
    <li>The fit finds the most probable weights (MAP) with the Stan library's L-BFGS optimiser: about a second here. <code>mcmc_samples=300</code> would sample full posteriors instead (slower; gives uncertainty for seasons too).</li>
    <li><code>seasonality_mode="multiplicative"</code> makes seasons and holidays a percentage of the trend, like multiplicative Holt-Winters.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Prophet</strong>: a decomposable time series model y(t) = g(t) + s(t) + h(t) + ε<sub>t</sub>, where g is piecewise-linear (or logistic) with automatically selected changepoints, s is a sum of Fourier series for each seasonal period, and h is a sum of holiday indicator effects; fitted as a Bayesian regression on functions of time (MAP by default).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Expecting Prophet to react to recent surprises. It uses no lags: a sudden 3-day booking surge, a closed road last week, a viral review yesterday: none of it changes tomorrow's forecast unless it is in a regressor or moves the trend. For short horizons on "sticky" series, ETS/ARIMA or lag-based ML often wins.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> The trend in the component plot bends. A single straight line could not: growth was about 1.5 guests per year before 2016 and 4.5 after. How does Prophet decide where to bend, without bending at every bump? <b>→ next: 08 Changepoints</b></div>

  <h2 id="ep-cp"><span class="num">08</span>Changepoints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>A trend with one fixed slope would either lag behind the post-road growth or overshoot the early years. A trend allowed to bend anywhere would chase noise. How do we get "bend only where the growth rate really changed"?</p></div>
  <h3>The piecewise-linear trend</h3>
  <p>Prophet places S <strong>candidate changepoints</strong> s<sub>1</sub> &lt; … &lt; s<sub>S</sub> (default 25, evenly spaced over the first 80% of the history: <code>n_changepoints</code>, <code>changepoint_range</code>). At each, the slope may change by δ<sub>j</sub>. The slope at time t is the starting rate plus all changes so far:</p>
  <p style="text-align:center"><strong>slope(t) = k + Σ<sub>j: s<sub>j</sub> ≤ t</sub> δ<sub>j</sub></strong>, &nbsp; g(t) = (k + a(t)ᵀδ)·t + (m + a(t)ᵀγ)</p>
  <p>where a(t) is a 0/1 vector marking which changepoints are already past, and the offsets γ<sub>j</sub> = −s<sub>j</sub>δ<sub>j</sub> keep the line continuous (no jumps, only kinks).</p>
  <h3>The prior that keeps most changes at zero</h3>
  <p>Each δ<sub>j</sub> gets a Laplace(0, τ) prior with τ = <code>changepoint_prior_scale</code> = 0.05. A Laplace prior is the Bayesian twin of the L1 penalty in <a class="xref" data-note="ml_ridge_lasso">Lasso</a>: it pushes most δ's to exactly (or nearly) zero and lets only a few large ones through. So 25 candidates become a handful of real bends.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket commentator describing a run chase: "steady at 6 an over, then they accelerated after the 30th over". He does not announce a new run rate after every boundary. The Laplace prior is his reluctance to announce a change unless it lasts.</p>
  </div>
  <h3>By hand: Pine View's trend</h3>
  <div class="fx" data-lang="py">import logging, numpy as np, pandas as pd
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
from prophet import Prophet
from homestay import daily, carnival

df = daily[:"2017"].reset_index(); df.columns = ["ds", "y"]
test = daily["2018"]
span_years = (df.ds.max() - df.ds.min()).days / 365.25            # Prophet rescales time to 0..1

def per_year(rate, m):                                             # scaled slope -&gt; guests per night per year
    return rate * m.y_scale / span_years

m = Prophet(holidays=carnival).fit(df)
k, delta = m.params["k"][0, 0], m.params["delta"][0]
print("potential changepoints:", len(m.changepoints),
      "from", m.changepoints.iloc[0].date(), "to", m.changepoints.iloc[-1].date())
print(f"starting growth: {per_year(k, m):.2f} guests/night per year")
big = np.abs(delta) &gt; 0.01
for d, dl in zip(m.changepoints[big], delta[big]):
    print(f"  {d.date()}  slope change {per_year(dl, m):+.2f}")
print(f"growth after the last changepoint: {per_year(k + delta.sum(), m):.2f} per year")

print("\\nprior scale | used changepoints | final growth | 2018 daily MAE")
for scale in [0.001, 0.05, 0.5]:
    mm = Prophet(holidays=carnival, changepoint_prior_scale=scale).fit(df)
    d = mm.params["delta"][0]
    fc = mm.predict(pd.DataFrame({"ds": test.index}))
    mae = np.abs(test.values - fc.yhat.values).mean()
    print(f"{scale:11} | {np.sum(np.abs(d) &gt; 0.01):17d} | "
          f"{per_year(mm.params['k'][0, 0] + d.sum(), mm):12.2f} | {mae:.2f}")</div>
  <div class="fx" data-lang="text">potential changepoints: 25 from 2014-02-16 to 2017-03-17
starting growth: 1.53 guests/night per year
  2015-07-27  slope change +0.44
  2015-09-12  slope change +0.18
  2015-10-28  slope change +0.33
  2015-12-13  slope change +0.66
  2016-01-28  slope change +0.81
  2016-03-14  slope change +0.52
growth after the last changepoint: 4.49 per year

prior scale | used changepoints | final growth | 2018 daily MAE
      0.001 |                 0 |         3.23 | 2.34
       0.05 |                 6 |         4.49 | 1.70
        0.5 |                12 |         4.53 | 1.71</div>
  <p>The helper <code>per_year</code> converts Prophet's scaled slopes back into guests per night per year (multiply by <code>y_scale</code>, divide by the span in years). Read the result as an addition:</p>
  <ul>
    <li>Starting growth k = <strong>1.53</strong> per year (the recipe used 1.5).</li>
    <li>Six changepoints, from July 2015 to March 2016, add 0.44 + 0.18 + 0.33 + 0.66 + 0.81 + 0.52 = <strong>2.94</strong>; the other 19 add only about 0.02 together.</li>
    <li>Final growth = 1.53 + 2.94 + 0.02 = <strong>4.49</strong> per year (the recipe: 4.5 after January 2016).</li>
  </ul>
  <p>The true change was one sharp kink in January 2016; Prophet spreads it over several nearby candidates, half a year either side, because the yearly season and noise make the exact date uncertain. The total is right.</p>
  <h3>Tuning changepoint_prior_scale</h3>
  <p>The bottom table refits with three prior scales. At 0.001 the prior forbids bending: one straight line, final growth 3.23 (a compromise between 1.5 and 4.5), and the 2018 daily MAE rises to 2.34. At 0.05 and 0.5 the fit finds the speed-up; 0.5 uses twelve changepoints instead of six for no gain. Too large a value makes the trend wiggle with noise and then extrapolate the last wiggle.</p>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<line x1="60" y1="230" x2="620" y2="230" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="60" y="244" text-anchor="middle" class="tm" font-size="10.5">2014</text>
<line x1="60" y1="230" x2="60" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="172" y="244" text-anchor="middle" class="tm" font-size="10.5">2015</text>
<line x1="172" y1="230" x2="172" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="284" y="244" text-anchor="middle" class="tm" font-size="10.5">2016</text>
<line x1="284" y1="230" x2="284" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="396" y="244" text-anchor="middle" class="tm" font-size="10.5">2017</text>
<line x1="396" y1="230" x2="396" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="508" y="244" text-anchor="middle" class="tm" font-size="10.5">2018</text>
<line x1="508" y1="230" x2="508" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="620" y="244" text-anchor="middle" class="tm" font-size="10.5">2019</text>
<line x1="620" y1="230" x2="620" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="55" y="233.5" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="57" y1="230" x2="60" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="55" y="153.5" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="150" x2="60" y2="150" stroke="currentColor" opacity="0.5"/>
<text x="55" y="73.5" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="70" x2="60" y2="70" stroke="currentColor" opacity="0.5"/>
<line x1="508" y1="30" x2="508" y2="230" stroke-dasharray="3 3" class="sr"/>
<text x="512" y="40" class="tm" font-size="10.5">forecast</text>
<polyline points="60,198.4 63.1,197.7 66.1,197 69.2,196.3 72.3,195.6 75.3,194.8 78.4,194.1 81.5,193.4 84.5,192.7 87.6,192 90.7,191.3 93.7,190.6 96.8,189.9 99.9,189.2 102.9,188.5 106,187.8 109.1,187.1 112.1,186.4 115.2,185.7 118.3,184.9 121.3,184.2 124.4,183.5 127.5,182.8 130.5,182.1 133.6,181.4 136.7,180.7 139.7,180 142.8,179.3 145.9,178.6 148.9,177.9 152,177.2 155.1,176.5 158.1,175.8 161.2,175 164.3,174.3 167.3,173.6 170.4,172.9 173.5,172.2 176.5,171.5 179.6,170.8 182.7,170.1 185.7,169.4 188.8,168.7 191.9,168 194.9,167.3 198,166.6 201.1,165.9 204.1,165.2 207.2,164.4 210.3,163.7 213.3,163 216.4,162.3 225.6,160.2 228.7,159.5 231.7,158.8 234.8,158.1 237.9,157.4 240.9,156.7 244,156 247,155.3 250.1,154.5 253.2,153.8 256.2,153.1 259.3,152.4 262.4,151.7 265.4,151 268.5,150.3 271.6,149.6 274.6,148.9 277.7,148.2 280.8,147.5 283.8,146.8 286.9,146.1 290,145.4 293,144.6 296.1,143.9 299.2,143.2 302.2,142.5 305.3,141.8 308.4,141.1 311.4,140.4 314.5,139.7 317.6,139 320.6,138.3 323.7,137.6 326.8,136.9 329.8,136.2 332.9,135.5 336,134.7 339,134 342.1,133.3 345.2,132.6 348.2,131.9 351.3,131.2 354.4,130.5 357.4,129.8 360.5,129.1 363.6,128.4 366.6,127.7 369.7,127 372.8,126.3 375.8,125.6 378.9,124.8 382,124.1 385,123.4 388.1,122.7 391.2,122 394.2,121.3 397.3,120.6 400.4,119.9 403.4,119.2 406.5,118.5 409.6,117.8 412.6,117.1 415.7,116.4 418.8,115.7 421.8,114.9 424.9,114.2 428,113.5 431,112.8 434.1,112.1 437.2,111.4 440.2,110.7 443.3,110 446.4,109.3 449.4,108.6 452.5,107.9 455.6,107.2 458.6,106.5 461.7,105.8 464.8,105 467.8,104.3 470.9,103.6 474,102.9 477,102.2 480.1,101.5 483.2,100.8 486.2,100.1 489.3,99.4 492.4,98.7 495.4,98 498.5,97.3 501.6,96.6 504.6,95.9 507.7,95.1 510.8,94.4 513.8,93.7 516.9,93 520,92.3 523,91.6 526.1,90.9 529.2,90.2 532.2,89.5 535.3,88.8 538.4,88.1 541.4,87.4 544.5,86.7 547.6,86 550.6,85.2 553.7,84.5 556.8,83.8 559.8,83.1 562.9,82.4 566,81.7 569,81 572.1,80.3 575.2,79.6 578.2,78.9 581.3,78.2 584.4,77.5 587.4,76.8 590.5,76.1 593.6,75.3 596.6,74.6 599.7,73.9 602.8,73.2 605.8,72.5 608.9,71.8 612,71.1 615,70.4 618.1,69.7" fill="none" class="sr" stroke-width="2.2"/>
<polyline points="60,184.4 63.1,184.1 66.1,183.8 69.2,183.4 72.3,183.1 75.3,182.8 78.4,182.4 81.5,182.1 84.5,181.8 87.6,181.4 90.7,181.1 93.7,180.7 96.8,180.4 99.9,180.1 102.9,179.7 106,179.4 109.1,179.1 112.1,178.7 115.2,178.4 118.3,178.1 121.3,177.7 124.4,177.4 127.5,177.1 130.5,176.7 133.6,176.4 136.7,176 139.7,175.7 142.8,175.4 145.9,175 148.9,174.7 152,174.4 155.1,174 158.1,173.7 161.2,173.4 164.3,173 167.3,172.7 170.4,172.4 173.5,172 176.5,171.7 179.6,171.3 182.7,171 185.7,170.7 188.8,170.3 191.9,170 194.9,169.7 198,169.3 201.1,169 204.1,168.7 207.2,168.3 210.3,168 213.3,167.7 216.4,167.3 225.6,166.3 228.7,166 231.7,165.6 234.8,165.3 237.9,164.9 240.9,164.4 244,164 247,163.6 250.1,163.1 253.2,162.7 256.2,162.2 259.3,161.7 262.4,161.2 265.4,160.7 268.5,160.2 271.6,159.6 274.6,159.1 277.7,158.5 280.8,157.9 283.8,157.2 286.9,156.5 290,155.8 293,155 296.1,154.2 299.2,153.3 302.2,152.4 305.3,151.6 308.4,150.6 311.4,149.6 314.5,148.7 317.6,147.7 320.6,146.7 323.7,145.7 326.8,144.7 329.8,143.7 332.9,142.8 336,141.8 339,140.8 342.1,139.8 345.2,138.8 348.2,137.8 351.3,136.9 354.4,135.9 357.4,134.9 360.5,133.9 363.6,132.9 366.6,131.9 369.7,131 372.8,130 375.8,129 378.9,128 382,127 385,126 388.1,125.1 391.2,124.1 394.2,123.1 397.3,122.1 400.4,121.1 403.4,120.2 406.5,119.2 409.6,118.2 412.6,117.2 415.7,116.2 418.8,115.2 421.8,114.3 424.9,113.3 428,112.3 431,111.3 434.1,110.3 437.2,109.3 440.2,108.4 443.3,107.4 446.4,106.4 449.4,105.4 452.5,104.4 455.6,103.4 458.6,102.5 461.7,101.5 464.8,100.5 467.8,99.5 470.9,98.5 474,97.5 477,96.6 480.1,95.6 483.2,94.6 486.2,93.6 489.3,92.6 492.4,91.6 495.4,90.7 498.5,89.7 501.6,88.7 504.6,87.7 507.7,86.7 510.8,85.7 513.8,84.8 516.9,83.8 520,82.8 523,81.8 526.1,80.8 529.2,79.9 532.2,78.9 535.3,77.9 538.4,76.9 541.4,75.9 544.5,74.9 547.6,74 550.6,73 553.7,72 556.8,71 559.8,70 562.9,69 566,68.1 569,67.1 572.1,66.1 575.2,65.1 578.2,64.1 581.3,63.1 584.4,62.2 587.4,61.2 590.5,60.2 593.6,59.2 596.6,58.2 599.7,57.2 602.8,56.3 605.8,55.3 608.9,54.3 612,53.3 615,52.3 618.1,51.3" fill="none" class="sb" stroke-width="2.2"/>
<polyline points="60,186.1 63.1,185.5 66.1,184.9 69.2,184.3 72.3,183.7 75.3,183.2 78.4,182.7 81.5,182.2 84.5,181.8 87.6,181.3 90.7,181 93.7,180.7 96.8,180.4 99.9,180.2 102.9,179.9 106,179.6 109.1,179.4 112.1,179.1 115.2,178.8 118.3,178.6 121.3,178.3 124.4,178 127.5,177.8 130.5,177.5 133.6,176.8 136.7,176.1 139.7,175.4 142.8,174.7 145.9,174 148.9,173.2 152,172.5 155.1,171.8 158.1,171.1 161.2,170.7 164.3,170.4 167.3,170.1 170.4,169.8 173.5,169.6 176.5,169.7 179.6,169.8 182.7,170 185.7,170.1 188.8,170.2 191.9,170.3 194.9,170.4 198,170.6 201.1,170.7 204.1,170.8 207.2,170.9 210.3,171 213.3,171.2 216.4,170.9 225.6,168.7 228.7,168 231.7,167.3 234.8,166.5 237.9,165.8 240.9,165.1 244,164.4 247,163.6 250.1,162.9 253.2,162.3 256.2,161.7 259.3,161.1 262.4,160.5 265.4,160 268.5,159.5 271.6,159 274.6,158.4 277.7,157.9 280.8,157.4 283.8,156.9 286.9,156.4 290,155.9 293,155.3 296.1,154.6 299.2,153.8 302.2,153.1 305.3,152.4 308.4,151.4 311.4,150.3 314.5,149.1 317.6,148 320.6,146.9 323.7,145.8 326.8,144.7 329.8,143.6 332.9,142.5 336,141.4 339,140.5 342.1,139.5 345.2,138.6 348.2,137.6 351.3,136.6 354.4,135.7 357.4,134.7 360.5,133.8 363.6,132.8 366.6,131.9 369.7,130.9 372.8,129.9 375.8,129 378.9,128 382,127 385,126 388.1,125 391.2,124 394.2,123 397.3,122.1 400.4,121.1 403.4,120.1 406.5,119.1 409.6,118.1 412.6,117.1 415.7,116.1 418.8,115.1 421.8,114.1 424.9,113.1 428,112.1 431,111.1 434.1,110.1 437.2,109.2 440.2,108.2 443.3,107.2 446.4,106.2 449.4,105.2 452.5,104.2 455.6,103.2 458.6,102.2 461.7,101.2 464.8,100.2 467.8,99.2 470.9,98.2 474,97.2 477,96.3 480.1,95.3 483.2,94.3 486.2,93.3 489.3,92.3 492.4,91.3 495.4,90.3 498.5,89.3 501.6,88.3 504.6,87.3 507.7,86.3 510.8,85.3 513.8,84.3 516.9,83.4 520,82.4 523,81.4 526.1,80.4 529.2,79.4 532.2,78.4 535.3,77.4 538.4,76.4 541.4,75.4 544.5,74.4 547.6,73.4 550.6,72.4 553.7,71.4 556.8,70.5 559.8,69.5 562.9,68.5 566,67.5 569,66.5 572.1,65.5 575.2,64.5 578.2,63.5 581.3,62.5 584.4,61.5 587.4,60.5 590.5,59.5 593.6,58.5 596.6,57.6 599.7,56.6 602.8,55.6 605.8,54.6 608.9,53.6 612,52.6 615,51.6 618.1,50.6" fill="none" class="sg" stroke-width="2.2"/>
<text x="26" y="130" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 130)">guests per night</text>
<text x="70" y="20" font-size="11" class="tr">0.001: one straight line</text><text x="265" y="20" font-size="11" class="tb">0.05 (default)</text><text x="385" y="20" font-size="11" class="tg">0.5: bends a little more</text>
</svg><figcaption>Trend g(t) with three prior scales. A tiny scale forces one straight line: below the data at both ends and above it in the middle, so its 2018 forecast starts too low. The default bends once, around the road opening; 0.5 adds small wiggles but the same future.</figcaption></figure>
  <h3>Uncertainty about the future trend</h3>
  <p>Prophet assumes the future may contain changepoints as often, and as large, as the past did. To build <code>yhat_lower</code>/<code>yhat_upper</code> it simulates many future trend paths with random changepoints drawn at that rate, adds noise, and takes quantiles (80% by default: <code>interval_width</code>). So intervals widen with the horizon, and a series with a wiggly past gets wide future intervals.</p>
  <h3>Other trend options</h3>
  <ul>
    <li><strong>Manual changepoints</strong>: <code>Prophet(changepoints=["2016-01-01"])</code> if you know the date of the road opening.</li>
    <li><strong>Logistic growth</strong>: <code>growth="logistic"</code> with a <code>cap</code> column (Pine View has 12 rooms of up to 4 guests, so at most 48): g(t) = C / (1 + exp(−k(t − m))) bends toward the ceiling instead of crossing it.</li>
    <li><strong>Flat</strong>: <code>growth="flat"</code> for a series with no trend at all.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Changepoint</strong>: a time where the trend's growth rate may change by δ<sub>j</sub>. Prophet proposes many candidates and shrinks their δ's with a sparse Laplace(0, τ) prior; τ = <code>changepoint_prior_scale</code> controls trend flexibility (default 0.05; typical search range 0.001–0.5).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Changepoints are only placed in the first 80% of the history by default. A real break in the last few months is invisible until <code>changepoint_range</code> is raised (e.g. 0.95), and even then the newest slope is estimated from very few points. Always look at the trend component near the end.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We understand every component. What does a full working Prophet session look like (custom seasons, regressors, country holidays), and how do we test it honestly on the past? <b>→ next: 09 Prophet in Code</b></div>

  <h2 id="ep-code"><span class="num">09</span>Prophet in Code</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>One fit and one test year is one exam. How do we use the rest of Prophet's API, and how do we check, on several past cut-off dates, how accurate it is at each horizon and whether its intervals are honest?</p></div>
  <h3>The API you will use</h3>
  <table class="tbl">
    <tr><th>Call</th><th>What it does</th></tr>
    <tr><td><code>Prophet(growth, changepoints, n_changepoints, changepoint_range, changepoint_prior_scale, yearly_seasonality, weekly_seasonality, daily_seasonality, holidays, seasonality_mode, seasonality_prior_scale, holidays_prior_scale, interval_width, mcmc_samples)</code></td><td>Create the model. Seasonality flags take True/False/"auto" or a Fourier order.</td></tr>
    <tr><td><code>m.add_seasonality(name="monthly", period=30.5, fourier_order=5)</code></td><td>Any extra cycle, e.g. salary-day effects</td></tr>
    <tr><td><code>m.add_country_holidays(country_name="IN")</code></td><td>Built-in national holidays (Diwali, Holi, Independence Day…)</td></tr>
    <tr><td><code>m.add_regressor("rain_mm")</code></td><td>An extra column; must also be filled for future dates</td></tr>
    <tr><td><code>m.fit(df)</code></td><td>df with <code>ds</code>, <code>y</code> (and <code>cap</code>, regressors); call add_* before fit</td></tr>
    <tr><td><code>m.make_future_dataframe(periods, freq="D")</code></td><td>History dates + future dates</td></tr>
    <tr><td><code>m.predict(future)</code></td><td><code>yhat</code>, interval, every component</td></tr>
    <tr><td><code>m.plot(fc)</code>, <code>m.plot_components(fc)</code></td><td>Forecast plot and the four component panels</td></tr>
    <tr><td><code>cross_validation(m, initial, period, horizon)</code>, <code>performance_metrics(cv)</code></td><td>Rolling-origin back-test and metrics by horizon</td></tr>
  </table>
  <h3>Back-testing with cross_validation</h3>
  <p>Prophet's <code>cross_validation</code> pretends to be the forecaster on several past dates. Here: train on at least 730 days (<code>initial</code>), forecast 90 days ahead (<code>horizon</code>), and move the cut-off every 180 days (<code>period</code>). Cut-offs are counted back from the end of the data, so the last forecast ends on the last day.</p>
  <div class="fx" data-lang="py">import logging, numpy as np, pandas as pd
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
logging.getLogger("prophet").setLevel(logging.ERROR)
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from homestay import daily, carnival

df = daily[:"2017"].reset_index(); df.columns = ["ds", "y"]
m = Prophet(holidays=carnival).fit(df)
np.random.seed(0)
cv = cross_validation(m, initial="730 days", period="180 days", horizon="90 days",
                      disable_tqdm=True)                       # refit at each cutoff, forecast 90 days
print("cutoffs:", [str(c.date()) for c in cv.cutoff.unique()])
print(cv.head(3).round(2).to_string(index=False))
pm = performance_metrics(cv, rolling_window=0.25)
print(pm.iloc[[0, len(pm) // 2, -1]][["horizon", "rmse", "mae", "mape", "coverage"]].round(3).to_string(index=False))</div>
  <div class="fx" data-lang="text">cutoffs: ['2016-04-10', '2016-10-07', '2017-04-05', '2017-10-02']
        ds  yhat  yhat_lower  yhat_upper    y     cutoff
2016-04-11 19.89       17.50       22.21 19.0 2016-04-10
2016-04-12 20.28       17.90       22.84 23.0 2016-04-10
2016-04-13 20.42       17.96       22.76 19.0 2016-04-10
horizon  rmse   mae  mape  coverage
23 days 2.297 1.791 0.075     0.678
57 days 2.329 1.930 0.072     0.661
90 days 2.520 1.954 0.074     0.656</div>
  <p>Four cut-offs, each refit from scratch on the data up to that date, each forecasting the next 90 days. <code>performance_metrics</code> groups the errors by horizon (with a rolling window of 25% of the horizons) and reports RMSE, MAE, MAPE and <strong>coverage</strong>, the share of actual values inside the 80% interval. MAE rises slowly from 1.79 to 1.95 guests as the horizon grows from 3 weeks to 3 months. Coverage is only 66–68%, not 80%: Prophet's intervals are too narrow here (they ignore uncertainty in the seasonal weights unless <code>mcmc_samples</code> is used, and the noise has a weekend pattern). Report it; widen <code>interval_width</code> or calibrate if planning depends on the interval.</p>
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
<polyline points="69,142.1 87.1,139.6 105.2,139.7 123.2,138.8 141.3,103.6 159.4,91.1 177.4,119 195.5,137.5 213.5,135 231.6,135.1 249.7,134.5 267.7,99.6 285.8,87.6 303.9,116.1 321.9,135.4 340,133.7 358.1,134.8 376.1,135.1 394.2,101.2 412.3,90.3 430.3,119.9 448.4,140.1 466.5,139.4 484.5,141.3 502.6,142.5 520.6,109.3 538.7,98.9 556.8,128.9 574.8,149.4 592.9,148.8 611,150.7" fill="none" class="st" stroke-width="2" stroke-dasharray="5 3"/>
<polyline points="69,144.1 87.1,141.9 105.2,142.8 123.2,143.1 141.3,108.2 159.4,96.5 177.4,125.6 195.5,144.9 213.5,142.8 231.6,143.6 249.7,144 267.7,109.2 285.8,97.7 303.9,127 321.9,73.9 340,76.4 358.1,77.8 376.1,75.7 394.2,40.6 412.3,100.8 430.3,130.4 448.4,150.2 466.5,148.5 484.5,149.9 502.6,150.7 520.6,116.4 538.7,105.3 556.8,134.8 574.8,154.6 592.9,152.8 611,154" fill="none" class="sg" stroke-width="2.2"/>
<text x="340" y="250" text-anchor="middle" class="tm" font-size="11">January 2018</text>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">guests</text>
<text x="70" y="20" font-size="11">actual</text><text x="130" y="20" font-size="11" style="fill:var(--teal)">Prophet without holidays</text><text x="320" y="20" font-size="11" class="tg">Prophet with the carnival listed</text>
</svg><figcaption>January 2018, day by day. Without the holiday table Prophet sees an ordinary January week; with the carnival listed it lifts 15–19 January by about 11 guests and tracks the register closely.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rolling-origin (simulated historical) forecast evaluation</strong>: choose several cut-off dates; for each, fit on data before it and forecast a fixed horizon after it; pool the errors by horizon. It measures exactly what you will experience in use: accuracy h days after the last data you had.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting that regressors and holidays must exist for the future. A regressor (rain, price) needs its future values in the <code>future</code> frame, which means you must forecast or plan them; a holiday must be listed for future years. If 2018's carnival had not been in the table, Prophet would forecast an ordinary week (carnival-day MAE 9.68 instead of 1.05, section 10).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Every model has now been fitted. On the same test year, who actually wins, by how much, and what does that tell us about when to choose classical methods, Prophet or machine learning? <b>→ next: 10 Classical vs Prophet vs ML</b></div>

  <h2 id="ep-when"><span class="num">10</span>Classical vs Prophet vs ML</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Each section beat the one before on its own terms. Put side by side on the same hidden year, which family wins on Pine View, why, and how do we decide for a new problem where we cannot peek?</p></div>
  <h3>The scoreboard on 2018</h3>
  <p>Every quarterly model is fitted on 2014–2017 with statsmodels' estimated parameters; Prophet is fitted on the daily register and its daily 2018 forecasts are averaged per quarter. Then the daily view, which the quarterly numbers cannot show:</p>
  <div class="fx" data-lang="py">import logging, numpy as np, pandas as pd
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
from prophet import Prophet
from statsmodels.tsa.holtwinters import SimpleExpSmoothing, Holt, ExponentialSmoothing
from homestay import daily, quarterly, carnival
train, test = quarterly[:"2017"].astype(float), quarterly["2018":].values
mae = lambda f: np.abs(test - np.asarray(f)).mean()

# --- quarterly: every method from this note, scored on the 4 quarters of 2018 ---
fits = {"SES": SimpleExpSmoothing(train, initialization_method="estimated"),
        "Holt": Holt(train, initialization_method="estimated"),
        "Holt damped": Holt(train, damped_trend=True, initialization_method="estimated"),
        "Holt-Winters add": ExponentialSmoothing(train, trend="add", seasonal="add",
                              seasonal_periods=4, initialization_method="estimated"),
        "Holt-Winters mul": ExponentialSmoothing(train, trend="add", seasonal="mul",
                              seasonal_periods=4, initialization_method="estimated")}
board = {"naive": np.repeat(train.iloc[-1], 4), "seasonal naive": train.iloc[-4:].values}
board.update({name: model.fit().forecast(4).values for name, model in fits.items()})

df = daily[:"2017"].reset_index(); df.columns = ["ds", "y"]
days2018 = pd.DataFrame({"ds": pd.date_range("2018-01-01", "2018-12-31")})
for name, kw in [("Prophet (daily -&gt; quarter)", dict(holidays=carnival)),
                 ("Prophet, no carnival", {})]:
    p = Prophet(**kw).fit(df).predict(days2018).set_index("ds").yhat
    board[name] = p.resample("QS").mean().values
    if name.startswith("Prophet (d"):
        prophet_daily = p
    else:
        plain_daily = p
for name, f in board.items():
    print(f"{name:27s} {np.round(f, 1)}  MAE {mae(f):.2f}")
print("actual 2018                ", test)

# --- daily: what the quarterly view cannot show ---
real = daily["2018"]
snaive7 = np.resize(daily["2017-12-25":"2017-12-31"].values, len(real))   # repeat the last week
fest = real.index.isin(pd.date_range("2018-01-15", "2018-01-19"))
for name, f in [("seasonal naive (last week)", snaive7),
                ("Prophet, no carnival", plain_daily.loc[real.index].values),
                ("Prophet + carnival", prophet_daily.loc[real.index].values)]:
    e = np.abs(real.values - f)
    print(f"{name:27s} daily MAE {e.mean():5.2f} | carnival days MAE {e[fest].mean():5.2f}")</div>
  <div class="fx" data-lang="text">naive                       [28. 28. 28. 28.]  MAE 3.75
seasonal naive              [24. 31. 21. 28.]  MAE 4.25
SES                         [24.8 24.8 24.8 24.8]  MAE 5.46
Holt                        [26.7 27.5 28.2 28.9]  MAE 4.02
Holt damped                 [26.6 27.3 28.  28.7]  MAE 4.09
Holt-Winters add            [28.3 34.  24.5 31. ]  MAE 0.77
Holt-Winters mul            [28.3 36.3 22.5 31.3]  MAE 1.30
Prophet (daily -&gt; quarter)  [28.7 34.8 25.4 32.3]  MAE 0.30
Prophet, no carnival        [28.5 35.  25.5 32.4]  MAE 0.35
actual 2018                 [29 35 25 32]
seasonal naive (last week)  daily MAE  4.73 | carnival days MAE 10.40
Prophet, no carnival        daily MAE  1.86 | carnival days MAE  9.68
Prophet + carnival          daily MAE  1.70 | carnival days MAE  1.05</div>
  <ul>
    <li><strong>Quarterly</strong>: the ladder pays off rung by rung. SES (5.46) loses even to naive; Holt (4.02) learns growth but not the season; Holt-Winters (0.77) learns both. Additive beats multiplicative because the swing does not grow.</li>
    <li><strong>Prophet</strong> is best (0.30), because it learns from 1,441 daily rows instead of 16 quarterly ones and because its trend found the post-road growth rate. Fair warning: Pine View was simulated from exactly the pieces Prophet assumes (trend with a kink + smooth seasons + holiday), so this is Prophet's home ground.</li>
    <li><strong>Holidays</strong> barely matter quarterly (0.30 vs 0.35) but matter hugely on the days themselves: carnival-day MAE 10.40 for seasonal naive, 9.68 for Prophet without the holiday table, 1.05 with it. If you plan staff by the day, that is the number that counts.</li>
  </ul>
  <h3>Strengths and weaknesses</h3>
  <table class="tbl">
    <tr><th></th><th>Exponential smoothing / ETS</th><th>ARIMA</th><th>Prophet</th><th>ML (LightGBM on lag features)</th></tr>
    <tr><td>Core idea</td><td>Smoothed level, slope, season</td><td>Past values and errors of the differenced series</td><td>Regression on time: trend + Fourier + holidays</td><td>Supervised table: lags, rolling stats, calendar, drivers</td></tr>
    <tr><td>Data it likes</td><td>One regular series, even short (2+ seasons)</td><td>One regular, stationary-after-differencing series</td><td>Daily/weekly business data, 1+ years, several seasons</td><td>Many related series, long history, many drivers</td></tr>
    <tr><td>Gaps / uneven spacing</td><td>Must fill</td><td>Must fill</td><td>Fine</td><td>Fine if features are built carefully</td></tr>
    <tr><td>Several seasons</td><td>One (TBATS/MSTL for more)</td><td>One seasonal part</td><td>Any number</td><td>Any, via features</td></tr>
    <tr><td>Holidays / events</td><td>No</td><td>Through exogenous columns (SARIMAX)</td><td>Built in, with windows</td><td>Via flag features</td></tr>
    <tr><td>Short-term memory (yesterday matters)</td><td>Yes (level updates)</td><td>Yes (AR terms)</td><td>No</td><td>Yes (lag features)</td></tr>
    <tr><td>Intervals</td><td>Yes (ETS)</td><td>Yes</td><td>Yes (often too narrow)</td><td>Needs quantile models</td></tr>
    <tr><td>Speed, effort</td><td>Instant, almost automatic</td><td>Fast; order selection needs care</td><td>About a second; few, readable knobs</td><td>Feature engineering and validation work</td></tr>
    <tr><td>Pine View 2018 quarterly MAE</td><td>0.77 (HW additive)</td><td>see <a class="xref" data-note="ml_arima">ARIMA Family</a></td><td>0.30</td><td>see <a class="xref" data-note="ml_ts_ml">ML Forecasting</a></td></tr>
  </table>
  <h3>A decision guide</h3>
  <div class="flow"><span>Compute seasonal naive and naive first</span><span>One series, regular spacing, short history? → ETS (auto-select by AICc) or ARIMA</span><span>Daily/weekly data, several seasons, holidays, gaps, trend breaks, analysts in the loop? → Prophet</span><span>Hundreds of related series or strong outside drivers (price, promotions, weather)? → ML global model</span><span>Back-test every candidate on several cut-offs; keep the simplest that wins</span></div>
  <div class="cards">
    <div><b>Choose ETS when</b><p>You have one or a few regular series (monthly sales, quarterly averages), little history, and need fast, robust forecasts with intervals.</p><small>Damped trend is a safe default</small></div>
    <div><b>Choose Prophet when</b><p>The data is daily or weekly with human calendar effects, there are gaps, and people who are not statisticians must read and adjust the model.</p><small>Check its intervals; it has no memory</small></div>
    <div><b>Choose ML when</b><p>You forecast thousands of store × item series, or demand depends on prices, promotions, weather, competitors' actions.</p><small>Needs careful leakage control</small></div>
    <div><b>Combine</b><p>An average of ETS, ARIMA and an ML model is often better than any one of them; forecast combination is one of the most reliable findings in forecasting research.</p><small>Weights from back-tests</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Classical (statistical) forecasting models</strong> such as ETS and ARIMA describe one series with a few interpretable parameters and a probability model. <strong>Prophet</strong> is a structural curve-fitting model on calendar features. <strong>ML forecasting</strong> treats the problem as supervised regression on engineered features, usually across many series at once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing a family by reputation ("Prophet is what everyone uses", "deep learning is best"). Independent benchmarks have found Prophet beaten by ETS, ARIMA or even seasonal naive on many real datasets, and ML winning only when there are many series and good features. Decide by back-testing against seasonal naive, on your data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We used each piece on its own. To remember the note, we need to see how every quantity is built from the previous one, in one picture and one table. <b>→ next: 11 How It All Connects</b></div>

  <h2 id="ep-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>SES, Holt, Holt-Winters, ETS and Prophet were introduced one at a time. How are they built from one another, and where does each number we computed on the homestay come from?</p></div>
  <figure class="viz"><svg viewBox="0 0 680 400" width="680">
<defs><marker id="ep-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="170" y="18" text-anchor="middle" font-size="12.5" font-weight="700">Exponential smoothing: add running states</text>
<text x="520" y="18" text-anchor="middle" font-size="12.5" font-weight="700">Prophet: add calendar columns</text>
<rect x="40" y="30" width="260" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="170" y="49" text-anchor="middle" font-size="12">Baselines: naive · mean · seasonal naive</text><text x="170" y="66" text-anchor="middle" class="tm" font-size="10.5">MAE 3.75 · 9.81 · 4.25</text>
<line x1="170" y1="76" x2="170" y2="96" stroke="currentColor" marker-end="url(#ep-a1)"/><text x="178" y="90" class="tm" font-size="10">weights fading by (1 − α)</text>
<rect x="40" y="98" width="260" height="46" rx="8" class="fb sb"/><text x="170" y="117" text-anchor="middle" font-size="12">SES: level ℓ</text><text x="170" y="134" text-anchor="middle" class="tm" font-size="10.5">ℓ = ℓ + α·e · flat 24.8 · MAE 5.46</text>
<line x1="170" y1="144" x2="170" y2="164" stroke="currentColor" marker-end="url(#ep-a1)"/><text x="178" y="158" class="tm" font-size="10">+ slope b (β), damping φ</text>
<rect x="40" y="166" width="260" height="46" rx="8" class="fb sb"/><text x="170" y="185" text-anchor="middle" font-size="12">Holt: ℓ + h·b</text><text x="170" y="202" text-anchor="middle" class="tm" font-size="10.5">27.9 → 30.8 (by hand) · MAE 3.31</text>
<line x1="170" y1="212" x2="170" y2="232" stroke="currentColor" marker-end="url(#ep-a1)"/><text x="178" y="226" class="tm" font-size="10">+ m seasonal indices (γ)</text>
<rect x="40" y="234" width="260" height="46" rx="8" class="fg sg"/><text x="170" y="253" text-anchor="middle" font-size="12">Holt-Winters: ℓ + h·b + s</text><text x="170" y="270" text-anchor="middle" class="tm" font-size="10.5">MAE 0.25 (hand) / 0.77</text>
<line x1="170" y1="280" x2="170" y2="300" stroke="currentColor" marker-end="url(#ep-a1)"/><text x="178" y="294" class="tm" font-size="10">+ random error ε ~ N(0, σ²)</text>
<rect x="40" y="302" width="260" height="46" rx="8" class="ft st"/><text x="170" y="321" text-anchor="middle" font-size="12">ETS(E,T,S): likelihood</text><text x="170" y="338" text-anchor="middle" class="tm" font-size="10.5">AICc · interval 24.8 ± 9.3</text>
<line x1="40" y1="325" x2="20" y2="325" stroke="currentColor" stroke-dasharray="3 3"/><line x1="20" y1="325" x2="20" y2="380" stroke="currentColor" stroke-dasharray="3 3"/><line x1="20" y1="380" x2="40" y2="380" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ep-a1)"/>
<rect x="42" y="362" width="200" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="142" y="384" text-anchor="middle" font-size="11">SES = ARIMA(0,1,1), θ = α − 1</text>
<rect x="390" y="30" width="260" height="46" rx="8" class="fb sb"/><text x="520" y="49" text-anchor="middle" font-size="12">g(t): piecewise-linear trend</text><text x="520" y="66" text-anchor="middle" class="tm" font-size="10.5">slope k + Σδ: 1.53 → 4.49 per year</text>
<rect x="390" y="98" width="260" height="46" rx="8" class="fg sg"/><text x="520" y="117" text-anchor="middle" font-size="12">s(t): Fourier waves</text><text x="520" y="134" text-anchor="middle" class="tm" font-size="10.5">yearly 20 + weekly 6 columns</text>
<rect x="390" y="166" width="260" height="46" rx="8" class="fr sr"/><text x="520" y="185" text-anchor="middle" font-size="12">h(t): holiday indicators</text><text x="520" y="202" text-anchor="middle" class="tm" font-size="10.5">5 carnival-day columns</text>
<line x1="520" y1="76" x2="520" y2="96" stroke="currentColor" opacity="0.4"/><line x1="520" y1="144" x2="520" y2="164" stroke="currentColor" opacity="0.4"/>
<line x1="520" y1="212" x2="520" y2="232" stroke="currentColor" marker-end="url(#ep-a1)"/><text x="528" y="226" class="tm" font-size="10">add up</text>
<rect x="390" y="234" width="260" height="46" rx="8" class="ft st"/><text x="520" y="253" text-anchor="middle" font-size="12">yhat = g + s + h</text><text x="520" y="270" text-anchor="middle" class="tm" font-size="10.5">15 Jan: 28.09+0.97−2.46+11.46</text>
<line x1="520" y1="280" x2="520" y2="300" stroke="currentColor" marker-end="url(#ep-a1)"/><text x="528" y="294" class="tm" font-size="10">sparse kinks</text>
<rect x="390" y="302" width="260" height="46" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="520" y="321" text-anchor="middle" font-size="12">Prophet forecast</text><text x="520" y="338" text-anchor="middle" class="tm" font-size="10.5">MAE 0.30 · carnival 1.05</text>
<line x1="300" y1="257" x2="388" y2="257" stroke="currentColor" stroke-dasharray="4 3"/><text x="344" y="250" text-anchor="middle" class="tm" font-size="10">same</text><text x="344" y="272" text-anchor="middle" class="tm" font-size="10">pieces</text>
<text x="520" y="384" text-anchor="middle" class="tm" font-size="10.5">next note: many series → ML</text>
</svg><figcaption>Left: each exponential smoothing method adds one running state (or a probability model) to the one above. Right: Prophet builds the same three pieces (trend, season, special days) as regression columns on the calendar instead of running states.</figcaption></figure>
  <h3>One table on the running example</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Built from</th><th>Homestay number</th><th>Question it answers</th><th>Weakness → next</th><th>Use when</th></tr>
    <tr><td>Naive / mean / seasonal naive</td><td>a fixed rule on past y</td><td>MAE 3.75 / 9.81 / 4.25</td><td>What would no model say?</td><td>all-or-nothing memory</td><td>always, as the bar</td></tr>
    <tr><td>SES</td><td>weighted average of past y, weights α(1−α)ᵏ</td><td>α = 0.5: level 25.96; est. α 0.304 → 24.8</td><td>Where is the series now?</td><td>flat: lags growth</td><td>no trend, no season</td></tr>
    <tr><td>Holt</td><td>SES + smoothed slope b</td><td>ℓ 26.96, b 0.965 → 27.9, 28.9, 29.9, 30.8</td><td>How fast is it moving?</td><td>reads the season as slope</td><td>trend, no season</td></tr>
    <tr><td>Damped Holt</td><td>Holt × φʰ on the slope</td><td>φ 0.9: 27.4 … limit 33.5</td><td>Will the growth slow?</td><td>still no season</td><td>long horizons, safe default</td></tr>
    <tr><td>Holt-Winters add / mul</td><td>Holt + m seasonal indices</td><td>28.46, 34.61, 24.98, 31.93 (MAE 0.25)</td><td>What is each quarter's usual offset?</td><td>which variant? no intervals</td><td>trend + one season</td></tr>
    <tr><td>ETS</td><td>the methods + error ε ~ N(0, σ²)</td><td>AICc table; SES ± 9.33</td><td>Which variant, how sure?</td><td>regular, complete data, one season</td><td>automatic selection, intervals</td></tr>
    <tr><td>Prophet g + s + h</td><td>regression on trend, Fourier, holiday columns</td><td>28.09 + 0.97 − 2.46 + 11.46 = 38.06</td><td>Many seasons, events, gaps?</td><td>no short-term memory</td><td>daily business data</td></tr>
    <tr><td>Changepoints</td><td>slope k + Σδ, Laplace prior</td><td>1.53 → 4.49 per year</td><td>Where did growth change?</td><td>last 20% unseen by default</td><td>trend breaks</td></tr>
  </table>
  <h3>Identities worth remembering</h3>
  <ul>
    <li>SES with α = 1 is naive; Holt with β = 0 keeps the starting slope; Holt-Winters with γ = 0 keeps the starting seasonal pattern.</li>
    <li>SES weights α(1 − α)ᵏ sum to 1 − (1 − α)ᵗ, the rest sits on ℓ₀.</li>
    <li>Damped Holt's long-run forecast = ℓ + φb/(1 − φ).</li>
    <li>ETS point forecasts = smoothing method forecasts; SES = ARIMA(0,1,1) with θ = α − 1; Holt = ARIMA(0,2,2).</li>
    <li>Prophet yhat = trend + every seasonal component + every holiday component (additive mode).</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us.</b> Knowing how the pieces fit does not stop the classic mistakes when using them. <b>→ next: 12 Common Mistakes</b></div>

  <h2 id="ep-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Which errors with exponential smoothing and Prophet show up again and again in projects and interviews?</p></div>
  <div class="cards">
    <div><b>No baseline</b><p>An MAE of 4 looks fine until naive gets 3.75. Always show naive and seasonal naive.</p><small>Section 01</small></div>
    <div><b>SES on a trending series</b><p>Flat forecast, permanently behind; a small fitted α is a symptom, not calm data.</p><small>Section 02</small></div>
    <div><b>Undamped trend far ahead</b><p>A straight line forever; for long horizons prefer damped (φ ≈ 0.9).</p><small>Section 03</small></div>
    <div><b>Wrong seasonal_periods</b><p>m is observations per cycle: 4 quarterly, 12 monthly, 7 daily-weekly.</p><small>Section 04</small></div>
    <div><b>Multiplicative by habit</b><p>Use it only when the swing grows with the level; never near zero values.</p><small>Section 04</small></div>
    <div><b>Trusting AICc blindly</b><p>On 16 points AICc dropped the trend (MAE 2.75 vs 0.73). Back-test the top few.</p><small>Section 05</small></div>
    <div><b>Mixing parameter conventions</b><p>ETS's smoothing_trend is αβ of the classic form; AIC differs between libraries.</p><small>Sections 03, 05</small></div>
    <div><b>Gaps in statsmodels</b><p>NaN rows give NaN forecasts with no error; fill on purpose.</p><small>Section 06</small></div>
    <div><b>Wrong Prophet columns</b><p>Must be <code>ds</code> and <code>y</code>; timezone-aware dates and duplicate dates fail.</p><small>Section 07</small></div>
    <div><b>Holidays not listed for the future</b><p>Unlisted 2018 carnival: day MAE 9.68 instead of 1.05.</p><small>Sections 07, 10</small></div>
    <div><b>Over-flexible trend</b><p>A large changepoint_prior_scale chases noise and extrapolates the last wiggle.</p><small>Section 08</small></div>
    <div><b>Trusting Prophet's interval</b><p>80% interval covered only 66–68% in back-tests.</p><small>Section 09</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap: evaluating on the training period</span>
    <p>Fitted values of a smoothing model are one-step forecasts, so they look excellent (SSE 9.3). The question you care about is h steps ahead from a fixed date. Always hold out the end of the series, or back-test with several cut-offs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> To revise everything above in ten minutes, use the sheet below. <b>→ next: Revision Sheet, then 13 Questions &amp; Answers</b></div>

  <h2 id="ep-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: Pine View homestay, average guests per night per quarter. Train 2014–2017, test 2018.</p>
  <table class="tbl">
    <tr><th>Year</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Mean</th></tr>
    <tr><td>2014</td><td>16</td><td>21</td><td>11</td><td>18</td><td>16.5</td></tr>
    <tr><td>2015</td><td>18</td><td>22</td><td>13</td><td>19</td><td>18</td></tr>
    <tr><td>2016</td><td>19</td><td>26</td><td>17</td><td>23</td><td>21.25</td></tr>
    <tr><td>2017</td><td>24</td><td>31</td><td>21</td><td>28</td><td>26</td></tr>
    <tr><td>2018 (test)</td><td>29</td><td>35</td><td>25</td><td>32</td><td>30.25</td></tr>
  </table>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Baselines</strong>: what would no model say? Naive 28 (MAE 3.75), mean 20.44 (9.81), seasonal naive 24, 31, 21, 28 (4.25).</li>
    <li><strong>SES</strong>: trust recent values more, smoothly: ℓ = ℓ + α·e; flat forecast 24.8 (est. α 0.304).</li>
    <li><strong>Holt</strong>: also learn the speed: ŷ = ℓ + h·b; 27.9 … 30.8 with α 0.5, β 0.3. Damped: levels off.</li>
    <li><strong>Holt-Winters</strong>: also learn each quarter's offset: ŷ = ℓ + h·b + s; 28.46, 34.61, 24.98, 31.93.</li>
    <li><strong>ETS</strong>: which variant, how sure? Likelihood → AICc and intervals (SES: 24.8 ± 9.3).</li>
    <li><strong>statsmodels</strong>: <code>ExponentialSmoothing</code> / <code>ETSModel</code>; watch NaN and conventions.</li>
    <li><strong>Prophet</strong>: many seasons, events, gaps: y = g + s + h, a regression on the calendar.</li>
    <li><strong>Changepoints</strong>: where did growth change? Sparse kinks: 1.53 → 4.49 guests per year.</li>
    <li><strong>Prophet in code</strong>: ds/y, future frame, components, cross_validation (MAE ≈ 1.8–2.0, coverage 66–68%).</li>
    <li><strong>Choosing</strong>: ETS for one short regular series, Prophet for calendar-driven daily data, ML for many series with drivers.</li>
  </ol>
  <h3>Key definitions</h3>
  <ul>
    <li><strong>Level</strong> ℓ: the smoothed "normal value now"; <strong>trend</strong> b: smoothed change per period; <strong>seasonal index</strong> s: the usual offset (additive) or ratio (multiplicative) of a position in the season; m = season length.</li>
    <li><strong>Smoothing parameters</strong> α, β, γ ∈ (0, 1]: how strongly each state reacts to new data; <strong>damping</strong> φ ∈ (0, 1): how fast the slope fades in the forecast.</li>
    <li><strong>ETS(E,T,S)</strong>: the state-space model behind a smoothing method, with a random error, so it has a likelihood, AICc and prediction intervals.</li>
    <li><strong>Prophet</strong>: y = g(t) + s(t) + h(t) + ε fitted as a regression on the date; <strong>Fourier order</strong>: number of sin/cos pairs per season; <strong>holiday window</strong>: days around an event with their own effects.</li>
    <li><strong>Changepoint</strong>: a date where the trend's slope may change; <strong>changepoint_prior_scale</strong>: how freely it may.</li>
    <li><strong>Rolling-origin evaluation</strong>: fit before several cut-offs, forecast after each, pool errors by horizon.</li>
  </ul>
  <h3>Every formula</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Formula</th><th>Symbols</th><th>Homestay by hand</th></tr>
    <tr><td>SES</td><td>ℓₜ = αyₜ + (1 − α)ℓₜ₋₁ = ℓₜ₋₁ + αeₜ; ŷₜ₊ₕ = ℓₜ</td><td>α ∈ (0, 1]: share given to the newest value; eₜ = yₜ − ℓₜ₋₁</td><td>ℓ₀ 16, α 0.5: 16 → 18.5 → 14.75 → 16.375</td></tr>
    <tr><td>SES weights</td><td>ℓₜ = Σ α(1 − α)ᵏ yₜ₋ₖ + (1 − α)ᵗℓ₀</td><td>k = steps back</td><td>α 0.5: 0.5, 0.25, 0.125, 0.0625</td></tr>
    <tr><td>Holt</td><td>ℓₜ = αyₜ + (1 − α)(ℓₜ₋₁ + bₜ₋₁); bₜ = β(ℓₜ − ℓₜ₋₁) + (1 − β)bₜ₋₁; ŷ = ℓ + hb</td><td>b slope per period, β its smoothing</td><td>2014 Q1: ŷ 16.5, ℓ 16.25, b 0.425</td></tr>
    <tr><td>Damped</td><td>ŷ = ℓ + (φ + φ² + … + φʰ)b</td><td>φ ∈ (0, 1) damping</td><td>26.684 + 0.9·0.754 = 27.36; limit ℓ + 9b = 33.5</td></tr>
    <tr><td>Holt-Winters add</td><td>ℓₜ = α(yₜ − sₜ₋ₘ) + (1 − α)(ℓₜ₋₁ + bₜ₋₁); sₜ = γ(yₜ − ℓₜ₋₁ − bₜ₋₁) + (1 − γ)sₜ₋ₘ; ŷ = ℓ + hb + sₜ₊ₕ₋ₘ</td><td>m season length, γ season smoothing</td><td>start 16.5, 0.375, (−0.5, 4.5, −5.5, 1.5); 2015 Q1: ŷ 16.375, ℓ 17.6875</td></tr>
    <tr><td>Holt-Winters mul</td><td>ℓₜ = α(yₜ/sₜ₋ₘ) + …; ŷ = (ℓ + hb)·s</td><td>s are ratios (mean 1)</td><td>indices 0.970, 1.273, 0.667, 1.091; ŷ 16.364</td></tr>
    <tr><td>ETS(A,N,N)</td><td>yₜ = ℓₜ₋₁ + εₜ; ℓₜ = ℓₜ₋₁ + αεₜ; var(h) = σ²[1 + (h − 1)α²]</td><td>ε ~ N(0, σ²)</td><td>24.79 ± 1.96·4.76 = 15.46 to 34.12</td></tr>
    <tr><td>AIC</td><td>−2 log L + 2k (AICc adds a small-sample term)</td><td>k = number of parameters</td><td>ETS(A,N,A) 84.0 chosen</td></tr>
    <tr><td>Prophet</td><td>y(t) = g(t) + s(t) + h(t) + εₜ</td><td>trend, seasons, holidays</td><td>28.09 + 0.97 − 2.46 + 11.46 = 38.06</td></tr>
    <tr><td>Fourier season</td><td>Σ [aₙcos(2πnt/P) + bₙsin(2πnt/P)]</td><td>P period (days), n = 1..N order</td><td>15 Jan 2018: sin 0.2385, cos 0.9711</td></tr>
    <tr><td>Trend slope</td><td>k + Σ<sub>sⱼ ≤ t</sub> δⱼ, δⱼ ~ Laplace(0, τ)</td><td>τ = changepoint_prior_scale</td><td>1.53 + 2.94 + 0.02 = 4.49 per year</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>SES</b><p>Level-only series (spare parts demand with no trend). Not for growth or seasons.</p><small>ETS(A,N,N)</small></div>
    <div><b>Holt / damped</b><p>Trending, non-seasonal series; damped for long horizons.</p><small>ETS(A,A,N), (A,Ad,N)</small></div>
    <div><b>Holt-Winters</b><p>Trend plus one regular season with complete data; additive if the swing is constant.</p><small>ETS(A,A,A), (M,A,M)</small></div>
    <div><b>ETSModel</b><p>When you need AICc selection and prediction intervals.</p><small>Back-test the top AICc models</small></div>
    <div><b>Prophet</b><p>Daily/weekly data, several seasons, holidays, gaps, trend breaks. Not for short-term dynamics.</p><small>List future holidays</small></div>
    <div><b>Neither</b><p>Hundreds of related series with outside drivers: go to ML forecasting.</p><small>Next note</small></div>
  </div>
  <h3>The traps to remember</h3>
  <ul>
    <li>Always beat naive and seasonal naive; with strong growth naive can beat seasonal naive (3.75 vs 4.25).</li>
    <li>Fitted values are one-step forecasts and look better than real h-step forecasts.</li>
    <li>AICc on short series can drop a real trend; library conventions differ for β and AIC.</li>
    <li>statsmodels returns NaN silently on gaps; Prophet's intervals tend to be too narrow; Prophet forgets yesterday.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <details class="qa"><summary><span class="qmark">Q</span>Level 20, α = 0.4, new value 25. New level?</summary><div class="qa-body">20 + 0.4 × (25 − 20) = 22.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Holt: ℓ = 30, b = 2. Forecast 3 steps ahead? With φ = 0.5?</summary><div class="qa-body">30 + 3 × 2 = 36. Damped: 30 + (0.5 + 0.25 + 0.125) × 2 = 31.75.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Additive HW: ℓ = 27, b = 1, Q2 index +5.5. Forecast for Q2, two steps ahead?</summary><div class="qa-body">27 + 2 × 1 + 5.5 = 34.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ETS(A,Ad,N) mean?</summary><div class="qa-body">Additive errors, additive damped trend, no seasonality: damped Holt with a likelihood.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prophet: trend 30, yearly −4, weekly +5, holiday 0. yhat?</summary><div class="qa-body">31 (additive mode: just add the components).</div></details>

  <h2 id="ep-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Can you now answer, with numbers, the questions an interviewer asks about exponential smoothing and Prophet, and say how they connect to ARIMA and ML forecasting?</p></div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain simple exponential smoothing and compute two steps: start level 16, α = 0.5, values 21 then 11.</summary><div class="qa-body">The level is a running weighted average: new level = old level + α × (actual − old level). Forecast for the 21 is 16, error +5, new level 18.5. Forecast for the 11 is 18.5, error −7.5, new level 14.75. The forecast for all future periods is the last level (flat line).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is it called "exponential", and what do small and large α mean?</summary><div class="qa-body">Unrolling the recursion gives ℓₜ = Σ α(1 − α)ᵏ yₜ₋ₖ: weights decay geometrically (exponentially) with age. Large α (near 1) puts almost all weight on the last value: reactive, noisy, close to naive. Small α spreads weight over a long history: smooth, slow to react, close to the mean.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is α chosen, and why did the training-optimal α (0.3) do worse on 2018 than α = 0.9?</summary><div class="qa-body">By minimising the sum of squared one-step errors on the training data (or maximising the ETS likelihood). On Pine View those errors are dominated by the seasonal zig-zag that SES cannot model, so the optimiser chose a calm level; but the test year's main problem was growth, which a calm level lags further behind. The real fix is a better model (trend + season), not a different α.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write Holt's equations and explain why damping is often recommended.</summary><div class="qa-body">ℓₜ = αyₜ + (1 − α)(ℓₜ₋₁ + bₜ₋₁); bₜ = β(ℓₜ − ℓₜ₋₁) + (1 − β)bₜ₋₁; ŷₜ₊ₕ = ℓₜ + h·bₜ. An undamped trend extrapolates a straight line forever, which is rarely true for long horizons. Damping multiplies the slope by φ, φ², …, so the forecast levels off at ℓ + φb/(1 − φ). Empirically (M3 competition), damped trend is among the most accurate and robust methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the first Holt-Winters additive update for 2015 Q1 (y = 18) from ℓ = 16.5, b = 0.375, s(Q1) = −0.5, with α = 0.5, β = 0.2, γ = 0.3.</summary><div class="qa-body">Forecast 16.5 + 0.375 − 0.5 = 16.375. Level 0.5(18 + 0.5) + 0.5(16.875) = 17.6875. Trend 0.2(17.6875 − 16.5) + 0.8(0.375) = 0.5375. Q1 index 0.3(18 − 16.5 − 0.375) + 0.7(−0.5) = −0.0125.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Additive or multiplicative seasonality: how do you decide?</summary><div class="qa-body">Plot the series. If the seasonal swing stays about the same size as the level grows (Pine View: about ±5 every year), use additive. If it grows in proportion (a Diwali bump of +40% of an ever larger base), use multiplicative, or take logs and use additive. Avoid multiplicative near zero. Confirm with AICc and a back-test: on Pine View additive won (MAE 0.77 vs 1.30).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ETS add to the smoothing methods? Explain ETS(M,Ad,M).</summary><div class="qa-body">A statistical model with an explicit error term, so there is a likelihood: parameters by maximum likelihood, model selection by AIC/AICc, and prediction intervals. Point forecasts are unchanged. ETS(M,Ad,M) = multiplicative errors, additive damped trend, multiplicative seasonality: damped multiplicative Holt-Winters where the noise grows with the level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive why SES is ARIMA(0,1,1).</summary><div class="qa-body">yₜ = ℓₜ₋₁ + εₜ and ℓₜ = ℓₜ₋₁ + αεₜ. Then yₜ − yₜ₋₁ = ℓₜ₋₁ − ℓₜ₋₂ + εₜ − εₜ₋₁ = αεₜ₋₁ + εₜ − εₜ₋₁ = εₜ − (1 − α)εₜ₋₁: an MA(1) on the first difference with θ = α − 1. On Pine View ARIMA estimated θ = −0.667, i.e. α = 0.333, and gave the same next forecast as SES with that α (25.03).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prophet's model: write it and explain each part in one sentence.</summary><div class="qa-body">y(t) = g(t) + s(t) + h(t) + ε. g: piecewise-linear (or logistic) trend whose slope can change at changepoints. s: sums of Fourier sine/cosine pairs for each period (yearly order 10, weekly order 3). h: indicator columns for listed events and the days around them. ε: noise. It is fitted as a regression on these functions of time with priors (MAP via Stan).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Prophet pick changepoints, and what does changepoint_prior_scale do?</summary><div class="qa-body">It places 25 evenly spaced candidates in the first 80% of the history and gives each slope change δ a Laplace(0, τ) prior, which (like L1/Lasso) shrinks most δ to about zero. τ = changepoint_prior_scale: small values give a stiff trend (0.001: one straight line, growth 3.23, MAE 2.34), the default 0.05 found the road-opening bend (1.53 → 4.49), large values let the trend chase noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Prophet handle that Holt-Winters cannot, and what does it lose?</summary><div class="qa-body">Handles: missing days and uneven spacing (no lags), several seasonal periods at once, listed holidays/events with windows, trend changes, extra regressors, readable components. Loses: short-term memory (yesterday's surprise does not move tomorrow's forecast), and its intervals are often too narrow (66–68% coverage for a nominal 80% on Pine View).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you validate a Prophet or ETS model before deploying it?</summary><div class="qa-body">Rolling-origin back-testing: several cut-off dates, fit on data before each, forecast the business horizon after it, pool errors by horizon, and compare against seasonal naive (and MASE). Check interval coverage. Prophet's <code>cross_validation(initial, period, horizon)</code> + <code>performance_metrics</code> automate it; for ETS loop over cut-offs yourself or use <code>TimeSeriesSplit</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do exponential smoothing, ARIMA and Prophet each represent "trend" and "seasonality"?</summary><div class="qa-body">Exponential smoothing: as running states (level, slope b, seasonal indices s) updated after each observation. ARIMA: implicitly, by differencing (d removes trend, seasonal D removes the season) and modelling what is left with AR/MA terms. Prophet: as explicit functions of the date (piecewise line, Fourier series) fitted by regression. ML forecasting (next note) represents them as features: lags, rolling means, calendar columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: a retailer has 20,000 store × product series with prices and promotions. Would you use ETS, Prophet or something else?</summary><div class="qa-body">Probably a global ML model (LightGBM on lag, rolling, calendar, price and promo features) trained across all series, as in <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>: it shares patterns across series and uses the drivers. ETS per series is a strong, cheap baseline (and good for short, sparse series); Prophet per series is slow at that scale and ignores cross-series information. Compare all against seasonal naive with a back-test, and consider combining.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your statsmodels Holt-Winters returns NaN forecasts with no error. What happened?</summary><div class="qa-body">The series contains NaN (for example after <code>asfreq("D")</code> exposed missing days). The recursions propagate NaN through every state. Fill the gap deliberately (interpolate, or seasonal fill), or use a model that tolerates gaps such as Prophet or a state-space model with missing-data handling.</div></details>
</main>
`
});
