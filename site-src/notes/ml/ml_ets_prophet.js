// notes/ml/ml_ets_prophet.js — Exponential Smoothing & Prophet
Object.assign(TOPIC_CONTENT, {
  "ml_ets_prophet": `<main>
  <h1>Exponential Smoothing &amp; Prophet</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>Exponential Smoothing &amp; Prophet</span></div>
  <p class="lead">This note covers two families of forecasting models that work directly on the raw series, with no stationarity tests and no lag-picking. Exponential smoothing keeps a running summary of the series (its current level, its slope, its seasonal pattern) and nudges that summary a little after every new observation; it grows from simple exponential smoothing, through Holt's trend method and Holt-Winters seasonality, into the ETS framework that gives all of them likelihoods and prediction intervals. Prophet, released by Facebook in 2017, takes the opposite route: it fits a smooth curve to the calendar, trend plus seasons plus holidays, with a trend that is allowed to bend at changepoints. Both are widely used because they are fast, readable and hard to get badly wrong. Our running example is Pine View, a 12-room homestay in Manali, whose owner Mrs Thakur records the number of guests every night; we will forecast her 2018 from 2014 to 2017, first quarter by quarter and then day by day.</p>

  <h2 id="ep-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Exponential Smoothing &amp; Prophet</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Exponential smoothing</div>
        <ul>
          <li>SES: ℓ ← ℓ + α·(y − ℓ); flat forecast</li>
          <li>Holt: + slope b (β); damped: slope fades by φ</li>
          <li>Holt-Winters: + one seasonal index per position (γ)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ETS framework</div>
        <ul>
          <li>ETS(Error, Trend, Season): methods as probability models</li>
          <li>Likelihood → AICc and prediction intervals</li>
          <li>SES = ARIMA(0,1,1), α = 1 + θ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prophet</div>
        <ul>
          <li>y = trend g(t) + seasons s(t) + holidays h(t) + ε</li>
          <li>Seasons: Fourier sin/cos columns; holidays: 0/1 columns</li>
          <li>Changepoints: sparse (Laplace ≈ L1) slope changes</li>
          <li>No lags: copes with gaps, but no short-term memory</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pine View 2018</div>
        <ul>
          <li>Naive 3.75 · SES 5.46 · Holt 4.02 · Holt-Winters 0.77 (quarterly MAE)</li>
          <li>Prophet-style regression 0.28 quarterly, 1.70 daily</li>
          <li>Carnival days: 9.74 without the holiday table, 1.08 with it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ep-base"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Homestay and the Baselines</span><span class="rm-sub">what would a forecaster say with no model?</span></div></div>
      <div class="rm-item rm-done" data-target="ep-ses"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Simple Exponential Smoothing</span><span class="rm-sub">a level nudged toward each new value</span></div></div>
      <div class="rm-item rm-done" data-target="ep-holt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Holt's Linear Trend</span><span class="rm-sub">adding a slope, and damping it</span></div></div>
      <div class="rm-item rm-done" data-target="ep-hw"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Holt-Winters Seasonality</span><span class="rm-sub">one index per quarter, additive or multiplicative</span></div></div>
      <div class="rm-item rm-done" data-target="ep-ets"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The ETS Framework</span><span class="rm-sub">likelihoods, AICc, intervals, the link to ARIMA</span></div></div>
      <div class="rm-item rm-done" data-target="ep-sm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">statsmodels in Practice</span><span class="rm-sub">arguments, outputs, and where it breaks</span></div></div>
      <div class="rm-item rm-done" data-target="ep-prophet"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Prophet's Model</span><span class="rm-sub">a regression on the calendar</span></div></div>
      <div class="rm-item rm-done" data-target="ep-cp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Changepoints</span><span class="rm-sub">letting the trend bend, but rarely</span></div></div>
      <div class="rm-item rm-done" data-target="ep-code"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Prophet in Code</span><span class="rm-sub">the API and honest back-testing</span></div></div>
      <div class="rm-item rm-done" data-target="ep-choose"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing: Classical, Prophet or ML</span><span class="rm-sub">the scoreboard and a decision guide</span></div></div>
      <div class="rm-item rm-done" data-target="ep-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">no baseline, gaps, unlisted holidays</span></div></div>
      <div class="rm-item rm-done" data-target="ep-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">every formula and number on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ep-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about ETS and Prophet</span></div></div>
    </div>
  </div>

  <h2 id="ep-base"><span class="num">01</span>The Homestay and the Baselines</h2>
  <p>Pine View is a 12-room homestay in Manali. Every night its owner, Mrs Thakur, writes the number of guests in a register, and her accountant summarises the register as the average number of guests per night in each quarter. She wants to know how many guests to expect in 2018, to plan staff, groceries and a loan for two new rooms. We will learn from 2014 to 2017 (16 quarters) and keep 2018 hidden as the test. The register is a simulation with a known recipe, so we can check what each model discovers: a trend whose growth jumps when a new road opens in January 2016, a yearly pattern, a weekend pattern, a five-day Snow Carnival held only in 2015, 2017 and 2018, and twenty days in June 2015 when a page of the register was lost. A small module, <code>homestay</code>, builds the daily register (<code>daily</code>), the carnival dates (<code>carnival</code>) and the quarterly averages (<code>quarterly</code>, made with <code>resample("QS").mean()</code>, "group by quarter, label each group by its start date").</p>
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
  <p>Two things are visible by eye: the series grows, faster after 2016, and every year has the same shape, with Q2 (summer holidays) high and Q3 (monsoon and landslides) low. Before fitting any model, we need a yardstick. If a model says "24.8 guests next quarter", is that good? The honest way to answer is to compare it with forecasts a sensible person would make with no model at all. These are called <strong>baselines</strong>: forecasts produced by a fixed rule with no learned parameters. The three classic ones are <strong>naive</strong> (next value = last value), <strong>mean</strong> (next value = the average of all history) and <strong>seasonal naive</strong> (next Q1 = last Q1, and so on). We score them with the <strong>mean absolute error</strong> (MAE), the average size of a miss in guests per night.</p>
  <div class="fx" data-lang="py">y = quarterly                                    # average guests per night, one value per quarter
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
  <p><code>y[:"2017"]</code> selects every quarter up to the end of 2017 by date, and <code>np.repeat(x, 4)</code> copies one number four times, because naive and mean give the same forecast for every future quarter. Think of three people guessing tomorrow's crowd at a dhaba. The new waiter says "same as today". The old cook says "the average of the last four years". The owner says "same as this day last year". Each is right about something and none about everything. Naive remembers only the last quarter (28, a Q4), so it misses busy Q2 by 7. Mean remembers everything with equal weight, including 2014's 11 and 16, so it is stuck far below today's level: MAE 9.81, the worst. Seasonal naive remembers the shape of the year but copies 2017 exactly, so it misses a full year of growth.</p>
  <p>Notice that plain naive (3.75) beats seasonal naive (4.25) here, because growth is strong. A model with an MAE of 4 sounds fine until you see that "same as last quarter" already gets 3.75. Every model in this note must beat these numbers to be worth its complexity. The rest of the note can be read as an answer to one question: naive uses only the newest value and the mean weighs all values equally; is there something sensible in between?</p>

  <h2 id="ep-ses"><span class="num">02</span>Simple Exponential Smoothing</h2>
  <p>Naive gives the last quarter 100% of the weight; the mean gives each of the 16 quarters 6.25%. We want recent quarters to have more say than old ones, smoothly, without choosing 16 separate weights by hand. <strong>Simple exponential smoothing</strong> (SES) does this with a single running number, the <strong>level</strong> ℓ: your current best guess of "the normal value right now". When a new quarter arrives, you neither throw the old guess away nor ignore the news; you move the guess a fixed fraction α (alpha) of the way toward the new value.</p>
  <p>Think of a chai stall owner deciding how much milk to buy. He does not buy exactly what he sold yesterday (too jumpy), nor the average of the whole year (too slow). He takes his usual amount and nudges it: "I ran short yesterday, so a bit more today". The size of the nudge is α.</p>
  <p>The formula can be written two ways that are the same algebra. As a weighted average: ℓ<sub>t</sub> = α·y<sub>t</sub> + (1 − α)·ℓ<sub>t−1</sub>, "α parts new value, 1 − α parts old level". As an error correction: ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + α·(y<sub>t</sub> − ℓ<sub>t−1</sub>) = ℓ<sub>t−1</sub> + α·e<sub>t</sub>, "add a fraction α of the surprise e<sub>t</sub>", where the surprise is the actual value minus what we forecast. The second form is easier to remember and is how ETS writes it later. The forecast for every future quarter is the latest level, ŷ<sub>t+h</sub> = ℓ<sub>t</sub>: SES has no idea of slope or season, so its forecast is a flat line.</p>
  <p>Let us run it by hand with α = 0.5, starting from a level of 16 (the first value). 2014 Q1: forecast 16, actual 16, error 0, level stays 16. Q2: forecast 16, actual 21, error +5, new level 16 + 0.5 × 5 = 18.5. Q3: forecast 18.5, actual 11, error −7.5, new level 18.5 − 3.75 = 14.75. Q4: forecast 14.75, actual 18, error +3.25, new level 16.375. The code is the same loop, and statsmodels agrees with it when given the same α and starting level.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import SimpleExpSmoothing
train = quarterly[:"2017"]
def ses(y, alpha, level0):
    """Simple exponential smoothing. Returns one-step forecasts and the final level."""
    level, fc = level0, []
    for value in y:
        fc.append(level)                              # forecast for this quarter = level so far
        level = level + alpha * (value - level)       # move a fraction alpha toward the new value
    return np.array(fc), level

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
  <p>In <code>ses()</code> the forecast is recorded before the level is updated, so each forecast uses only the past: a genuine one-step-ahead forecast. In statsmodels, <code>initialization_method="known", initial_level=16</code> sets the starting level, <code>fit(smoothing_level=0.5, optimized=False)</code> uses our α instead of searching for one, <code>fittedvalues</code> are the one-step forecasts, and <code>forecast(4)</code> extends the flat line at 25.956 over 2018.</p>
  <p>Why "exponential"? Substitute the formula into itself: ℓ<sub>t</sub> = αy<sub>t</sub> + (1 − α)[αy<sub>t−1</sub> + (1 − α)ℓ<sub>t−2</sub>], and so on, giving ℓ<sub>t</sub> = αy<sub>t</sub> + α(1 − α)y<sub>t−1</sub> + α(1 − α)²y<sub>t−2</sub> + … + (1 − α)<sup>t</sup>ℓ₀. The level is a weighted average of every past value, with weights that shrink by the factor (1 − α) for each step back. Shrinking by a fixed factor per step is geometric decay, the step-by-step version of exponential decay, hence the name. With α = 0.5 the weights are 0.5, 0.25, 0.125, 0.0625, …, and they add up to 1 (the leftover sits on ℓ₀), so the level is a proper average. The two baselines are the ends of this dial: α = 1 is exactly naive, and α close to 0 barely moves from the starting level, which behaves like the mean if the start is the average.</p>
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
  <p>How is α chosen? Like any parameter: pick the value whose one-step forecasts had the smallest sum of squared errors (SSE) on the training data.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import SimpleExpSmoothing
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
  <p>Training SSE is smallest near α = 0.3, and statsmodels finds 0.304 (it also estimates the starting level as 17.27 instead of our 16). But look at the last column: on 2018 the larger α values do better. Why the disagreement? The one-step errors in training are dominated by the seasonal zig-zag, which no α can follow, so the optimiser settles for a calm level. Meanwhile the real problem for 2018 is growth, and a calm level lags further behind growth. No α fixes the actual issue: SES has no slope and no season, and it should be used only for series with neither. A small optimised α is often a hint that the model is fighting a pattern it cannot represent, not that the series is calm.</p>

  <h2 id="ep-holt"><span class="num">03</span>Holt's Linear Trend</h2>
  <p>SES gave 2018 a flat 24.8 while Pine View keeps growing: the yearly averages went 16.5, 18, 21.25, 26. Its single running number knows where we are, not how fast we are moving. Charles Holt (1957) added a second running number, the <strong>trend</strong> or slope b: how many guests per quarter the level rises. Both numbers are smoothed the same way SES smooths the level, and to forecast h quarters ahead you start at the level and walk h steps along the slope. Think of estimating when a train will reach the next station: knowing only where it is now is not enough; you also need its speed, and you update both from each station sign, smoothly, so that one slow stretch does not mean the train has stopped.</p>
  <table class="tbl">
    <tr><th>Part</th><th>Equation</th><th>In words</th></tr>
    <tr><td>Forecast</td><td>ŷ<sub>t+h</sub> = ℓ<sub>t</sub> + h·b<sub>t</sub></td><td>level plus h steps of slope</td></tr>
    <tr><td>Level</td><td>ℓ<sub>t</sub> = α·y<sub>t</sub> + (1 − α)·(ℓ<sub>t−1</sub> + b<sub>t−1</sub>)</td><td>blend the new value with where we expected to be</td></tr>
    <tr><td>Trend</td><td>b<sub>t</sub> = β·(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1 − β)·b<sub>t−1</sub></td><td>blend the latest step in level with the old slope</td></tr>
  </table>
  <p>α smooths the level as in SES and β (beta) smooths the slope; a small β means "the growth rate changes slowly". By hand with α = 0.5, β = 0.3, a starting level of 16 and a starting slope of 0.5: 2014 Q1 forecast 16 + 0.5 = 16.5, actual 16, new level 0.5 × 16 + 0.5 × 16.5 = 16.25, new trend 0.3 × (16.25 − 16) + 0.7 × 0.5 = 0.425. Q2: forecast 16.675, actual 21, new level 18.838, new trend 0.3 × 2.588 + 0.7 × 0.425 = 1.074. Q3: forecast 19.911, actual 11, new level 15.456, new trend −0.263. Look at that trend column: +0.425, then +1.074 after the busy Q2, then −0.263 after the empty Q3. Holt reads the seasonal zig-zag as the growth rate speeding up and reversing, a weakness the next section fixes.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import Holt
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
print("damped (phi=0.9): end level", round(LD, 3), " trend", round(BD, 3), " forecasts", np.round(damped, 2))
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
damped (phi=0.9): end level 26.684  trend 0.754  forecasts [27.36 27.97 28.52 29.02]
Holt         test MAE 3.31
damped Holt  test MAE 3.79</div>
  <p>At the end of 2017 the level is 26.959 and the slope 0.965 per quarter, so the 2018 forecasts are 26.959 + 1 × 0.965 = 27.92, then 28.89, 29.85, 30.82; statsmodels' <code>Holt</code> with the same fixed values gives identical numbers. With the same hand-picked α, the 2018 MAE falls from 4.77 for SES to 3.31: learning the slope helped, and Holt now beats both naive and seasonal naive.</p>
  <p>A straight line extrapolated forever is a bold claim: in ten years Holt would predict a full homestay plus a queue on the road. Gardner and McKenzie (1985) added a <strong>damping factor</strong> φ (phi, between 0 and 1) that shrinks each future step of slope: ŷ<sub>t+h</sub> = ℓ<sub>t</sub> + (φ + φ² + … + φ<sup>h</sup>)·b<sub>t</sub>, and the old slope is also multiplied by φ inside the updates. By hand with the damped run's end values ℓ = 26.684, b = 0.754 and φ = 0.9: h = 1 gives 26.684 + 0.9 × 0.754 = 27.36; h = 2 gives 26.684 + (0.9 + 0.81) × 0.754 = 27.97. As h grows, φ + φ² + … approaches φ/(1 − φ) = 9, so the forecast levels off near 26.684 + 9 × 0.754 = 33.5 instead of climbing forever. Here damping costs a little (3.79 against 3.31) because Pine View really is still growing in 2018. But over long horizons and across many series, damped trend is one of the most reliable forecasting methods ever tested; it did very well in the M3 forecasting competition, because most growth slows down eventually. Typical values of φ are 0.8 to 0.98.</p>

  <h2 id="ep-hw"><span class="num">04</span>Holt-Winters Seasonality</h2>
  <p>Holt's straight line goes through the middle of a zig-zag: 27.9, 28.9, 29.9, 30.8, while 2018 really is 29, 35, 25, 32. Every Q2 sits about 5 above the trend and every Q3 about 5 below, and Holt cannot represent that. Peter Winters (1960) added a third set of running numbers, one <strong>seasonal index</strong> per position in the season (4 for quarters, 12 for months, 7 for days of the week). Each says "this quarter usually sits this far above or below the level". When a new Q2 arrives, only Q2's index is updated, and the level is computed from the <em>deseasonalised</em> value (y minus its usual seasonal offset), so the zig-zag no longer confuses the slope. Think of a sweet-shop owner who knows "Diwali month is well above normal". When this Diwali's sales come in, she first removes the usual Diwali bump to see whether the business itself has grown, and separately updates her idea of how big the Diwali bump is.</p>
  <table class="tbl">
    <tr><th>Part</th><th>Additive equation (m = season length)</th><th>In words</th></tr>
    <tr><td>Forecast</td><td>ŷ<sub>t+h</sub> = ℓ<sub>t</sub> + h·b<sub>t</sub> + s<sub>t+h−m</sub></td><td>trend line plus that quarter's latest index</td></tr>
    <tr><td>Level</td><td>ℓ<sub>t</sub> = α·(y<sub>t</sub> − s<sub>t−m</sub>) + (1 − α)·(ℓ<sub>t−1</sub> + b<sub>t−1</sub>)</td><td>blend the deseasonalised value with the expected level</td></tr>
    <tr><td>Trend</td><td>b<sub>t</sub> = β·(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1 − β)·b<sub>t−1</sub></td><td>unchanged from Holt</td></tr>
    <tr><td>Season</td><td>s<sub>t</sub> = γ·(y<sub>t</sub> − ℓ<sub>t−1</sub> − b<sub>t−1</sub>) + (1 − γ)·s<sub>t−m</sub></td><td>blend today's gap from the expected level with last year's index</td></tr>
  </table>
  <p>γ (gamma) is the third smoothing parameter. We need starting values, and a classic recipe uses the first full year. The starting level is the mean of 2014, (16 + 21 + 11 + 18)/4 = 16.5. The starting slope is the change in yearly means spread over four quarters, (18 − 16.5)/4 = 0.375. The starting indices are the 2014 values minus their mean: −0.5, +4.5, −5.5, +1.5, which add to zero as additive indices should. Now one update by hand for 2015 Q1 (y = 18, last year's Q1 index −0.5), with α = 0.5, β = 0.2, γ = 0.3. Forecast = 16.5 + 0.375 − 0.5 = 16.375, error +1.625. Level = 0.5 × (18 + 0.5) + 0.5 × (16.5 + 0.375) = 17.6875. Trend = 0.2 × (17.6875 − 16.5) + 0.8 × 0.375 = 0.5375. Q1 index = 0.3 × (18 − 16.5 − 0.375) + 0.7 × (−0.5) = −0.0125. The code repeats this for all twelve quarters of 2015 to 2017 and checks itself against two statsmodels classes.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.exponential_smoothing.ets import ETSModel
train, test = quarterly[:"2017"], quarterly["2018":]
y14, y15 = train["2014"].values, train["2015"].values       # starting values from the first year
level0 = y14.mean()                                  # 16.5
trend0 = (y15.mean() - y14.mean()) / 4               # change per quarter
season0 = y14 - level0                               # how far each quarter sits from the year's mean
print("level0", level0, " trend0", trend0, " seasonal Q1..Q4", season0)

def holt_winters_add(y, alpha, beta, gamma, level, trend, season):
    season, rows = list(season), []                  # season[-4] = same quarter one year ago
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

ets = ETSModel(y, error="add", trend="add", seasonal="add", seasonal_periods=4, initialization_method="known",
               initial_level=level0, initial_trend=trend0, initial_seasonal=season0)
with ets.fix_params({"smoothing_level": 0.5, "smoothing_trend": 0.5 * 0.2,   # ETS writes beta as alpha*beta
                     "smoothing_seasonal": 0.3}):
    r = ets.fit(disp=False)
print("ETSModel:             fitted agree", np.allclose(r.fittedvalues.values, tbl.forecast.values),
      " forecast", np.round(r.forecast(4).values, 2))
res = ExponentialSmoothing(y, trend="add", seasonal="add", seasonal_periods=4, initialization_method="known",
                           initial_level=level0, initial_trend=trend0, initial_seasonal=season0).fit(
    smoothing_level=0.5, smoothing_trend=0.2, smoothing_seasonal=0.3, optimized=False)
print("ExponentialSmoothing: fitted agree", np.allclose(res.fittedvalues.values, tbl.forecast.values),
      " forecast", np.round(res.forecast(4).values, 2))</div>
  <div class="fx" data-lang="text">level0 16.5  trend0 0.375  seasonal Q1..Q4 [-0.5  4.5 -5.5  1.5]
         y  forecast  error   level  trend  season
2015Q1  18    16.375  1.625  17.688  0.538  -0.013
2015Q2  22    22.725 -0.725  17.862  0.465   4.282
2015Q3  13    12.828  0.172  18.414  0.482  -5.448
2015Q4  19    20.396 -1.396  18.198  0.343   1.081
2016Q1  19    18.528  0.472  18.777  0.390   0.129
end of 2017: level 27.071  trend 0.987  seasons [ 0.405  5.567 -5.049  0.914]
2018 forecast: [28.46 34.61 24.98 31.93]  actual: [29 35 25 32]  MAE 0.25
ETSModel:             fitted agree True  forecast [28.46 34.61 24.98 31.93]
ExponentialSmoothing: fitted agree True  forecast [28.46 34.61 24.98 31.91]</div>
  <p><code>season</code> is a growing list, so <code>season[-4]</code> is always "the same quarter one year ago". The first rows match the hand calculation, and in 2015 Q2 the busy quarter no longer pushes the trend up (0.5375 → 0.465), because the level first subtracted the expected +4.5. At the end of 2017 the level is 27.071, the trend 0.987 and the indices 0.405, 5.567, −5.049, 0.914, so the 2018 Q1 forecast is 27.071 + 0.987 + 0.405 = 28.46, Q2 is 27.071 + 2 × 0.987 + 5.567 = 34.61, and so on. Against the real 29, 35, 25, 32 the MAE is 0.25, fifteen times better than naive.</p>
  <p>The two library checks hide a lesson. <code>ETSModel</code> reproduces all four forecasts, but it writes the slope update in a different form, so its <code>smoothing_trend</code> is α × β (0.5 × 0.2 = 0.1), not β: same model, different number in a different API. And <code>ExponentialSmoothing</code> (statsmodels 0.15) gives 31.91 instead of 31.93 for Q4: when h equals the season length its forecast code uses the previous year's Q4 index (0.892) instead of the newest (0.914). The fitted values agree exactly and the difference is tiny, but it is a reminder to check a library against a hand calculation at least once.</p>
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
  <p>If the seasonal swing grows as the business grows (Q2 is +20% rather than +5 guests), the indices should be ratios, not differences. The <strong>multiplicative</strong> version replaces every "− s" by "÷ s" and every "+ s" by "× s": the forecast becomes (ℓ<sub>t</sub> + h·b<sub>t</sub>) × s<sub>t+h−m</sub>, the level uses y<sub>t</sub>/s<sub>t−m</sub>, and the season update uses y<sub>t</sub>/(ℓ<sub>t−1</sub> + b<sub>t−1</sub>). By hand, the starting indices become 2014 / 16.5: 0.970, 1.273, 0.667, 1.091, averaging 1. For 2015 Q1 the forecast is (16.5 + 0.375) × 0.970 = 16.364.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import ExponentialSmoothing
train, test = quarterly[:"2017"], quarterly["2018":]
y14 = train["2014"].values
level0 = y14.mean()
s0 = y14 / level0                                  # multiplicative: a ratio, not a difference
print("multiplicative seasonal indices (y / level):", np.round(s0, 3))
l, b, y = level0, 0.375, 18                        # one update by hand: 2015 Q1
fc = (l + b) * s0[0]
new_l = 0.5 * (y / s0[0]) + 0.5 * (l + b)
new_b = 0.2 * (new_l - l) + 0.8 * b
new_s = 0.3 * y / (l + b) + 0.7 * s0[0]
print(f"forecast {fc:.3f}  level {new_l:.3f}  trend {new_b:.3f}  Q1 index {new_s:.3f}")
for seasonal in ["add", "mul"]:
    res = ExponentialSmoothing(train, trend="add", seasonal=seasonal, seasonal_periods=4,
                               initialization_method="estimated").fit()
    p, fc = res.params, res.forecast(4).values
    print(f"{seasonal}: alpha {p['smoothing_level']:.2f} beta {p['smoothing_trend']:.2f} "
          f"gamma {p['smoothing_seasonal']:.2f} | 2018 {np.round(fc, 1)} | "
          f"MAE {np.abs(test.values - fc).mean():.2f} | AICc {res.aicc:.1f}")</div>
  <div class="fx" data-lang="text">multiplicative seasonal indices (y / level): [0.97  1.273 0.667 1.091]
forecast 16.364  level 17.719  trend 0.544  Q1 index 0.999
add: alpha 0.87 beta 0.00 gamma 0.00 | 2018 [28.3 34.  24.5 31. ] | MAE 0.77 | AICc 51.3
mul: alpha 0.53 beta 0.00 gamma 0.00 | 2018 [28.3 36.3 22.5 31.3] | MAE 1.30 | AICc 59.7</div>
  <p>With every parameter estimated by statsmodels, the additive model wins (MAE 0.77 against 1.30, AICc 51.3 against 59.7). That matches the picture: Pine View's swing from Q2 to Q3 is about 10 guests in 2014 and still about 10 in 2017; it does not grow with the level. The estimated β = γ = 0 mean "keep the starting slope and pattern fixed", while α = 0.87 lets the level chase the 2016 speed-up. Notice also that the hand-chosen parameters (MAE 0.25) beat the estimated ones (0.77) on this one test year: four numbers are a small exam, and luck matters. Use additive when the swing stays about the same size, multiplicative (or a log, then additive) when it grows in proportion to the level, and avoid multiplicative near zero values, where ratios blow up. And always set <code>seasonal_periods</code> correctly: 4 for quarterly data with a yearly cycle, 12 for monthly, 7 for daily data with a weekly cycle, 24 for hourly data with a daily cycle. Holt-Winters needs at least two full seasons to estimate the pattern reliably.</p>

  <h2 id="ep-ets"><span class="num">05</span>The ETS Framework</h2>
  <p>We now have six variants (trend or not, damped or not, additive or multiplicative season) and only point forecasts. The smoothing methods are recipes: they give a forecast but no probability model, so there is no likelihood to compare variants fairly and no principled interval. Hyndman, Koehler, Snyder and Grose (2002) showed that each smoothing method is the forecast of a simple statistical model. Write SES in its error form, but treat the one-step error ε<sub>t</sub> as random noise with variance σ²:</p>
  <p>y<sub>t</sub> = ℓ<sub>t−1</sub> + ε<sub>t</sub>   (what we see = the level so far + a random surprise)<br>ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + α·ε<sub>t</sub>   (the surprise moves the level by a fraction α)</p>
  <p>These two lines give exactly the SES forecasts, but they also describe how y varies around them. That gives a <strong>likelihood</strong> (how probable the observed data are for given α, ℓ₀ and σ), and from it three things the recipes lacked: estimation by maximum likelihood, model choice by information criteria, and prediction intervals. Such a model is called an <strong>innovations state-space model</strong>: one source of randomness, the "innovation" ε, drives both what we observe and how the hidden states (level, trend, season) move.</p>
  <p>Each model gets a three-letter name, <strong>ETS(Error, Trend, Season)</strong>. Error is A (additive) or M (multiplicative); Trend is N (none), A (additive) or Ad (additive damped); Season is N, A or M. ETS(A,N,N) is simple exponential smoothing, ETS(A,A,N) is Holt, ETS(A,Ad,N) is damped Holt, ETS(A,A,A) is additive Holt-Winters, and ETS(M,A,M) is multiplicative Holt-Winters with noise that grows with the level. Additive and multiplicative errors give the same point forecasts; they differ in the intervals and in the likelihood, so the information criterion can tell them apart. To choose, we use <strong>AICc</strong>: AIC = −2 log-likelihood + 2k (k = number of estimated parameters: smoothing parameters, starting states and σ), plus a small-sample correction, which matters a lot with only 16 quarters. Lower is better. The code ranks eight models, with the 2018 MAE alongside (which, in real life, you would not have).</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.exponential_smoothing.ets import ETSModel
train, test = quarterly[:"2017"].astype(float), quarterly["2018":]
configs = [("add", None, False, None), ("add", "add", False, None), ("add", "add", True, None),
           ("add", None, False, "add"), ("add", "add", False, "add"), ("add", "add", True, "add"),
           ("mul", "add", False, "add"), ("mul", "add", False, "mul")]
rows = []
for err, trend, damped, seas in configs:
    r = ETSModel(train, error=err, trend=trend, damped_trend=damped, seasonal=seas,
                 seasonal_periods=4 if seas else None).fit(disp=False)
    name = f"ETS({err[0].upper()},{'N' if trend is None else 'Ad' if damped else 'A'},{'N' if seas is None else seas[0].upper()})"
    rows.append((name, len(r.params), round(r.aicc, 1), round(np.abs(test.values - r.forecast(4).values).mean(), 2)))
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
  <p>Two lessons. First, seasonality is clearly needed: every model without it sits at AICc 103 or worse. Second, AICc picks ETS(A,N,A), with no trend, and that model's 2018 MAE is 2.75 against 0.73 for ETS(A,A,A). With only 16 points, the small-sample penalty for two more parameters (the trend and its starting value) outweighed the improvement in fit. AICc is a guide, not an oracle; with short series, check the top few candidates on a holdout or by back-testing.</p>
  <p>Prediction intervals come straight from the model. For ETS(A,N,N) the forecast error h steps ahead has variance σ²·[1 + (h − 1)α²]: one step ahead it is just σ², and each further step adds α²σ², because every future surprise will move the level by α·ε. A 95% interval is the forecast ± 1.96 standard deviations.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.exponential_smoothing.ets import ETSModel
train, test = quarterly[:"2017"].astype(float), quarterly["2018":]
r = ETSModel(train, error="add").fit(disp=False)                  # ETS(A,N,N) = SES with a likelihood
p = dict(zip(r.param_names, r.params))
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
  <p>With α = 0.304 and σ = 4.76, the one-step interval is 24.79 ± 1.96 × 4.76 = ± 9.33, from 15.46 to 34.12, and at h = 4 the variance is 22.64 × (1 + 3 × 0.304²) = 28.92, giving ± 10.54. <code>get_prediction(start, end).summary_frame(alpha=0.05)</code> returns the same numbers. Notice how much a better model helps: SES's interval is 19 guests wide because the seasonal zig-zag is counted as "noise", while ETS(A,A,A)'s interval for Q1 is 3 guests wide (26.83 to 29.84) and contains the actual 29. All four 2018 actuals fall inside their ETS(A,A,A) intervals.</p>
  <p>Some ETS models are ARIMA models in disguise. Take SES and difference it: y<sub>t</sub> − y<sub>t−1</sub> = (ℓ<sub>t−1</sub> + ε<sub>t</sub>) − (ℓ<sub>t−2</sub> + ε<sub>t−1</sub>) = αε<sub>t−1</sub> + ε<sub>t</sub> − ε<sub>t−1</sub> = ε<sub>t</sub> − (1 − α)ε<sub>t−1</sub>. That is an MA(1) on the first difference, ARIMA(0,1,1) with θ = α − 1 (see <a class="xref" data-note="ml_arima">ARIMA Family</a>).</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.arima.model import ARIMA
train = quarterly[:"2017"].astype(float)
arima = ARIMA(train, order=(0, 1, 1)).fit()
theta = arima.params["ma.L1"]
print(f"ARIMA(0,1,1): theta = {theta:.3f}  -&gt;  1 + theta = {1 + theta:.3f}")
fc_ses, level = ses(train.values, alpha=1 + theta, level0=train.iloc[0])
print(f"SES with alpha = 1 + theta: next forecast {level:.3f};  ARIMA forecast {arima.forecast(1).iloc[0]:.3f}")</div>
  <div class="fx" data-lang="text">ARIMA(0,1,1): theta = -0.667  -&gt;  1 + theta = 0.333
SES with alpha = 1 + theta: next forecast 25.034;  ARIMA forecast 25.036</div>
  <p>ARIMA estimates θ = −0.667, so α = 1 + θ = 0.333, and SES with that α gives the same next forecast (25.03 against 25.04; the tiny gap comes from how each method starts). Likewise Holt's method is ARIMA(0,2,2). The two families overlap, but neither contains the other: multiplicative ETS models have no ARIMA twin, and ARIMA models with several AR terms have no ETS twin. One last caution: compare AIC only between models fitted by the same code on the same data. <code>ExponentialSmoothing</code> reported AICc 51.3 and <code>ETSModel</code> 100.9 for the same additive Holt-Winters, because the two libraries use different likelihood constants.</p>

  <h2 id="ep-sm"><span class="num">06</span>statsmodels in Practice</h2>
  <p>So far we used statsmodels mainly to confirm hand calculations. In normal use there are four classes: <code>SimpleExpSmoothing(y)</code> for SES; <code>Holt(y, damped_trend=…)</code> for Holt and damped Holt; <code>ExponentialSmoothing(y, trend=…, damped_trend=…, seasonal=…, seasonal_periods=…)</code>, which covers everything up to Holt-Winters; and <code>ETSModel(y, error=…, …)</code>, the statistical model with AICc and intervals. <code>.fit()</code> estimates every smoothing parameter and the starting states, by minimising the SSE (<code>ExponentialSmoothing</code>) or maximising the likelihood (<code>ETSModel</code>); passing a value such as <code>fit(smoothing_level=0.3)</code> fixes that one and estimates the rest. The <code>initialization_method</code> argument sets how the starting states are found: <code>"estimated"</code> optimises them along with the smoothing parameters (the usual choice), <code>"heuristic"</code> uses a decomposition of the first few seasons, and <code>"known"</code> uses values you pass.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.stats.diagnostic import acorr_ljungbox
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
  <p>Read the output line by line. α = 0.867, β = 0 and γ = 0: the slope (0.775 per quarter) and the seasonal pattern (−0.08, +4.9, −5.37, +0.35) stay fixed at their starting values, and only the level moves, quickly. That is how this model absorbs the 2016 speed-up: the level jumps to catch up while the slope stays put. The state table shows the running numbers after each quarter, with <code>fitted</code> the one-step forecast made before seeing that quarter and <code>resid</code> = actual − fitted. An SSE of 9.3 over 16 quarters means a typical one-step error of about √(9.3/16) ≈ 0.76 guests, against an SSE of 362 for SES. The Ljung-Box p-value of 0.23 says there is no evidence of leftover pattern in the residuals, which is what we want. Finally, fixing α at 0.3 makes the optimiser use the slope instead (β = 0.3), with similar 2018 forecasts: several parameter combinations can describe the same data, so β = 0 should not be read as "no trend". Remember also that fitted values are one-step forecasts and therefore look far better than real forecasts made several steps ahead from a fixed date.</p>
  <p>The quarterly averages hide what the register really looks like. Let us peek at the daily data.</p>
  <div class="fx" data-lang="py">week = daily["2017-01-12":"2017-01-21"]                               # the days around the 2017 carnival
print(" ".join(f"{d:%a %d}:{v:.0f}" for d, v in week.items()))
print("days in register:", len(daily), " missing days:",
      len(pd.date_range("2014-01-01", "2018-12-31")) - len(daily))
by_day = daily[:"2017"].groupby(daily[:"2017"].index.day_name().str[:3]).mean()
print("average by weekday:", by_day[["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]].round(1).to_dict())
q1 = daily["2017-01":"2017-03"]
print("2017 Q1 average with carnival:", round(q1.mean(), 2),
      " without the 5 carnival days:", round(q1.drop(pd.date_range("2017-01-15", "2017-01-19")).mean(), 2))</div>
  <div class="fx" data-lang="text">Thu 12:21 Fri 13:29 Sat 14:29 Sun 15:36 Mon 16:32 Tue 17:34 Wed 18:32 Thu 19:34 Fri 20:30 Sat 21:30
days in register: 1806  missing days: 20
average by weekday: {'Mon': 17.9, 'Tue': 18.2, 'Wed': 18.1, 'Thu': 18.2, 'Fri': 23.6, 'Sat': 25.5, 'Sun': 21.0}
2017 Q1 average with carnival: 24.12  without the 5 carnival days: 23.56</div>
  <p>The daily register has a weekly rhythm (Friday and Saturday nights full of weekend visitors from Chandigarh, weekdays around 18, Saturdays 25.5), the yearly rhythm, a carnival that lifts ordinary weekdays from about 21 to 32 to 34 guests, and twenty lost days. Yet the carnival moves the whole quarter's average by only 0.56: quarterly data simply cannot see it. What happens if we give the daily register to Holt-Winters?</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import ExponentialSmoothing
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
  <p><code>asfreq("D")</code> makes the gap explicit as 20 missing (NaN) rows, and statsmodels then returns NaN forecasts without raising any error, because the recursions pass the NaN through every state. You must fill the gap yourself, here with <code>interpolate()</code>, which draws straight lines between neighbours. Even then, Holt-Winters takes a single season length: with m = 7 it learns the weekly rhythm but not the yearly one (m = 365 would need hundreds of seasonal states and still miss the week). Its 2018 daily MAE is 4.04, and there is no way to tell it "the carnival is on 15 to 19 January 2018". Exponential smoothing needs complete, equally spaced data with one season length and cannot be told about special days. That is the gap Prophet fills.</p>

  <h2 id="ep-prophet"><span class="num">07</span>Prophet's Model</h2>
  <p>Holt-Winters walks through the series one row at a time, which is why it needs every row present, equally spaced, and one season length. <strong>Prophet</strong> (Taylor and Letham, "Forecasting at Scale", released by Facebook, now Meta, in 2017) does not walk through the series at all. It treats forecasting as curve fitting against the calendar: build columns that describe each date (how far along the trend, where in the year, which weekday, whether it is a carnival day), fit one regression of y on those columns, and to forecast, compute the same columns for future dates and add up. Its model is a sum of four pieces:</p>
  <p>y(t) = g(t) + s(t) + h(t) + ε<sub>t</sub></p>
  <p>g(t) is the <strong>trend</strong>, a piecewise straight line (or a logistic curve with a ceiling) that may bend at changepoints. s(t) is the <strong>seasonality</strong>, any number of repeating patterns (weekly, yearly, custom). h(t) is the <strong>holiday</strong> effect, extra amounts on specific listed dates. ε is noise. Think of an experienced hotel manager's mental model: "We are on a growth path since the road opened (trend). Weekends are busier and May to June is peak (seasons). Carnival week is special (holiday). Anything else is luck." Prophet writes exactly that sentence as an equation. Because no lags are used, a missing day is just a missing row and nothing needs filling; dates need not be equally spaced; and any number of seasonal periods can be added. The price is that Prophet has no short-term memory: if yesterday was unusually busy, that does not raise tomorrow's forecast.</p>
  <p>Prophet itself is not installed in the environment used to build these notes, so its code appears later shown but not run. That is no obstacle to understanding it, because, as we are about to see, Prophet is at heart a regression we can build ourselves with numpy and scikit-learn, and every output below is real.</p>
  <p>The first question is how to write "a smooth yearly shape of any form" as regression columns. The answer is a <strong>Fourier series</strong>: any smooth repeating curve can be built by adding up sine and cosine waves whose periods divide the cycle evenly:</p>
  <p>s(t) = Σ<sub>n=1..N</sub> [a<sub>n</sub>·cos(2πnt/P) + b<sub>n</sub>·sin(2πnt/P)]</p>
  <p>P is the period in days (365.25 for yearly, 7 for weekly), t is the date in days since 1 January 1970 (Prophet's clock), and N, the <strong>Fourier order</strong>, controls how wiggly the shape may be. Each n gives two columns, a sine and a cosine, and the a's and b's are ordinary regression weights. Think of building any tune on a keyboard from a few pure notes: one slow wave gives a single summer hump, adding faster waves lets the shape have a sharp peak, a monsoon dip and a New Year bump. Prophet's defaults are N = 10 for yearly seasonality (20 columns) and N = 3 for weekly (6 columns). By hand for 15 January 2018: t = 17,546 days since 1970, and 17,546 / 365.25 = 48.0383 years, so the date is 0.0383 of the way through a year. The first yearly pair is sin(2π × 0.0383) = sin(0.2407) = 0.2385 and cos(0.2407) = 0.9711; the second pair uses twice the angle: sin(0.4813) = 0.4633 and cos = 0.8862.</p>
  <div class="fx" data-lang="py">def fourier(dates, period, order):
    """sin/cos pairs that repeat every period days: the building blocks of a smooth cycle."""
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
print("weekly pair 1:", fourier(day, 7, 1).round(4).values.tolist())</div>
  <div class="fx" data-lang="text">days since 1970: 17546  years: 48.0383  position in year: 0.0383
              sin1    cos1    sin2    cos2
2018-01-15  0.2385  0.9711  0.4633  0.8862
weekly pair 1: [[-0.4339, -0.901]]</div>
  <p>Holidays are simpler still. A holiday table lists event names and dates plus a window: <code>lower_window=0, upper_window=4</code> means "the date and the 4 days after it". Prophet creates one 0/1 column per window day, each with its own weight. Because the carnival is listed for 2015 and 2017 in the training data, the regression can learn its size; because 2018 is listed too, it can apply it to the future; years without a carnival simply have zeros. A seasonal pattern could never do this, because it repeats every year. Now let us assemble a small Prophet-style model: a straight-line trend column, 20 yearly and 6 weekly Fourier columns, and 5 carnival-day columns, fitted by ordinary least squares on the 1,441 daily rows of 2014 to 2017 (the lost days are simply absent).</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
train = daily[:"2017"]                                   # missing days are simply absent rows
start, span = train.index[0], (train.index[-1] - train.index[0]).days

def columns(dates):
    t = (dates - start).days.values / span                          # trend: time rescaled to 0..1
    parts = {"trend":    pd.DataFrame({"t": t}, index=dates),
             "yearly":   fourier(dates, 365.25, 10).add_prefix("y_"),   # 20 columns
             "weekly":   fourier(dates, 7, 3).add_prefix("w_"),         # 6 columns
             "carnival": pd.DataFrame({f"day+{k}": dates.isin(CARNIVAL_DAYS[k::5]).astype(float)
                                       for k in range(5)}, index=dates)}   # 5 columns, one per festival day
    return parts

P = columns(train.index)
X = pd.concat(P.values(), axis=1)
reg = LinearRegression().fit(X, train.values)
print("rows:", len(X), " columns:", {k: v.shape[1] for k, v in P.items()})

days = pd.date_range("2018-01-13", "2018-01-20")
Q, coef, i = columns(days), reg.coef_, 0
out = pd.DataFrame(index=days)
for name, block in Q.items():                            # each component = its columns x its weights
    out[name] = block.values @ coef[i:i + block.shape[1]]
    i += block.shape[1]
out["trend"] += reg.intercept_
out["yhat"] = out.sum(axis=1)
out["actual"] = daily[days].values
print(out.round(2).to_string())
f2018 = reg.predict(pd.concat(columns(daily["2018"].index).values(), axis=1))
print("2018 daily MAE:", round(np.abs(daily["2018"].values - f2018).mean(), 2))</div>
  <div class="fx" data-lang="text">rows: 1441  columns: {'trend': 1, 'yearly': 20, 'weekly': 6, 'carnival': 5}
            trend  yearly  weekly  carnival   yhat  actual
2018-01-13  26.61    1.15    5.15      0.00  32.91    37.0
2018-01-14  26.62    1.09    0.57      0.00  28.28    27.0
2018-01-15  26.63    1.02   -2.46     11.33  36.52    40.0
2018-01-16  26.64    0.95   -2.10     10.66  36.14    39.0
2018-01-17  26.65    0.86   -2.20     10.62  35.93    36.0
2018-01-18  26.66    0.77   -2.23     11.05  36.24    38.0
2018-01-19  26.67    0.67    3.29     11.16  41.79    43.0
2018-01-20  26.67    0.57    5.15      0.00  32.38    33.0
2018 daily MAE: 2.43</div>
  <p>The table shows a week in January 2018, each component computed as its own columns times its own learned weights. Monday 15 January, the carnival's first day, adds up as trend 26.63 + yearly 1.02 + weekly (a Monday) −2.46 + carnival 11.33 = 36.52, against an actual 40. Every row is such a sum, and that is the whole idea of Prophet: a linear regression on calendar columns plus a trend, whose components you can read and explain to anyone. The weekly component is high on Friday 19th (+3.29) and Saturday 13th and 20th (+5.15), and the carnival column lifts 15 to 19 January by about 11 guests.</p>
  <p>But the trend is the weak part. A single straight line through 2014 to 2017 must compromise between the slow growth before the road and the fast growth after it, so in January 2018 it sits at 26.6, too low, and most forecasts in the table are a few guests short. The 2018 daily MAE is 2.43. Real Prophet fixes this with changepoints, and so will we. Real Prophet also differs in a few details: it divides y by its maximum and rescales time to run from 0 to 1 so that default settings work for any units; it puts a prior on every weight (seasonal and holiday weights ~ Normal(0, 10), controlled by <code>seasonality_prior_scale</code> and <code>holidays_prior_scale</code>), which shrinks them like ridge regression; and it finds the most probable weights with the Stan library's optimiser in about a second. <code>seasonality_mode="multiplicative"</code> makes seasons and holidays a percentage of the trend, like multiplicative Holt-Winters.</p>

  <h2 id="ep-cp"><span class="num">08</span>Changepoints</h2>
  <p>A trend with one fixed slope either lags behind the post-road growth or overshoots the early years. A trend allowed to bend anywhere would chase every bump of noise. We want "bend only where the growth rate really changed". Prophet's answer has two parts.</p>
  <p>First, a <strong>piecewise-linear trend</strong>. Prophet places S candidate <strong>changepoints</strong> s₁ &lt; … &lt; s<sub>S</sub> (by default 25, evenly spaced over the first 80% of the history; settings <code>n_changepoints</code> and <code>changepoint_range</code>). At each, the slope may change by an amount δ<sub>j</sub>. The slope at time t is the starting rate k plus all the changes so far, slope(t) = k + Σ<sub>s<sub>j</sub> ≤ t</sub> δ<sub>j</sub>, and offsets keep the line continuous, so it has kinks but no jumps. In regression terms each changepoint is just one more column, a "hinge" max(0, t − s<sub>j</sub>), which is zero before the changepoint and rises steadily after it; its weight is δ<sub>j</sub>.</p>
  <p>Second, a penalty that keeps most of those changes at zero. Prophet gives each δ<sub>j</sub> a <strong>Laplace prior</strong> with scale τ = <code>changepoint_prior_scale</code> (default 0.05). A Laplace prior is the Bayesian twin of the L1 penalty in Lasso regression (<a class="xref" data-note="ml_ridge_lasso">Ridge &amp; Lasso</a>): it pushes most coefficients to exactly or nearly zero and lets only a few large ones through, so 25 candidates become a handful of real bends. Think of a cricket commentator describing a run chase: "steady at 6 an over, then they accelerated after the 30th over". He does not announce a new run rate after every boundary; the L1 penalty is his reluctance to announce a change unless it lasts.</p>
  <p>That means we can reproduce the mechanism exactly with scikit-learn's <code>Lasso</code>: add 25 hinge columns to the table from section 07 and fit with an L1 penalty. We only want the penalty on the slope changes, so the other columns are multiplied by 100, which makes their weights 100 times smaller and their penalty negligible. A larger Lasso <code>alpha</code> plays the role of a smaller <code>changepoint_prior_scale</code>.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Lasso
train, test = daily[:"2017"], daily["2018"]
start, span = train.index[0], (train.index[-1] - train.index[0]).days
cps = pd.date_range(start, start + pd.Timedelta(days=int(0.8 * span)), periods=27)[1:26]   # 25 candidates
print("candidate changepoints:", len(cps), "from", cps[0].date(), "to", cps[-1].date())

def table(dates):
    t = (dates - start).days.values / span
    hinge = np.clip(t[:, None] - ((cps - start).days.values / span)[None, :], 0, None)  # (t - s_j) after s_j
    others = pd.concat(columns(dates).values(), axis=1)     # trend, yearly, weekly, carnival (section 07)
    return np.hstack([hinge, 100 * others.values])          # x100: makes their L1 penalty negligible

years = span / 365.25
print("penalty  | changepoints used | growth start -&gt; end (guests/yr) | 2018 daily MAE")
for alpha in [0.3, 0.003, 0.00003]:
    m = Lasso(alpha=alpha, max_iter=200000).fit(table(train.index), train.values)
    delta = m.coef_[:25] / years                            # slope changes, per year
    k = m.coef_[25] * 100 / years                           # starting slope, per year
    used = np.abs(delta) &gt; 0.05
    mae = np.abs(test.values - m.predict(table(test.index))).mean()
    print(f"{alpha:&lt;8} | {used.sum():17d} | {k:5.2f} -&gt; {k + delta.sum():5.2f}{'':17s} | {mae:.2f}")
    if alpha == 0.003:                                      # the middle setting, in detail
        kept = [(d.date(), round(float(v), 2)) for d, v in zip(cps[used], delta[used])]
print("bends kept at penalty 0.003:", kept)</div>
  <div class="fx" data-lang="text">candidate changepoints: 25 from 2014-02-14 to 2017-01-28
penalty  | changepoints used | growth start -&gt; end (guests/yr) | 2018 daily MAE
0.3      |                 0 |  3.07 -&gt;  3.07                  | 2.45
0.003    |                 3 |  1.58 -&gt;  4.42                  | 1.70
3e-05    |                17 |  7.66 -&gt;  4.45                  | 1.72
bends kept at penalty 0.003: [(datetime.date(2015, 6, 24), 0.43), (datetime.date(2015, 12, 20), 1.67), (datetime.date(2016, 2, 3), 0.74)]</div>
  <p>The helper converts slopes into guests per night per year. Read the three rows as three settings of the prior. With a heavy penalty (0.3) no changepoint survives: one straight line with growth 3.07 a year, a compromise between the true 1.5 and 4.5, and a 2018 daily MAE of 2.45, no better than section 07. With a moderate penalty (0.003) exactly three bends survive, all in the half-year around the road opening (June 2015, December 2015, February 2016), and growth goes from 1.58 to 4.42 guests per year, very close to the recipe's 1.5 and 4.5. The 2018 MAE falls to 1.70. The true change was one sharp kink in January 2016; the fit spreads it over a few nearby candidates because the yearly season and the noise make the exact date uncertain, but the total is right. With almost no penalty (0.00003), 17 changepoints are used, the starting slope becomes an implausible 7.66 that later bends back, and the error does not improve: the trend is chasing noise. Too flexible a trend is dangerous for forecasting because the model extrapolates whatever the last wiggle happened to be.</p>
  <p>Prophet also uses the changepoints to build its uncertainty. It assumes the future may contain slope changes as often, and as large, as the past did; to make <code>yhat_lower</code> and <code>yhat_upper</code> it simulates many future trend paths with random changepoints drawn at that rate, adds noise, and takes quantiles (80% by default, <code>interval_width</code>). So intervals widen with the horizon, and a series with a wiggly past gets wide future intervals. Other trend options are worth knowing: <code>changepoints=["2016-01-01"]</code> if you know the date of a break, <code>growth="logistic"</code> with a <code>cap</code> column so the trend bends toward a ceiling (Pine View can hold at most 48 guests), and <code>growth="flat"</code> for no trend. One trap: by default changepoints are placed only in the first 80% of the history, so a real break in the last few months is invisible until <code>changepoint_range</code> is raised (for example to 0.95), and even then the newest slope rests on very few points. Always look at the trend near the end.</p>

  <h2 id="ep-code"><span class="num">09</span>Prophet in Code</h2>
  <p>Here is the same model written with the real Prophet library. As explained above, Prophet is not installed where these notes were built, so this block was checked for correct Python syntax but not run, and no output is shown. Prophet needs a DataFrame with exactly two columns, <code>ds</code> (dates) and <code>y</code>; the holiday table has the columns <code>holiday</code>, <code>ds</code>, <code>lower_window</code> and <code>upper_window</code>.</p>
  <div class="fx" data-lang="py">from prophet import Prophet
from homestay import daily, carnival            # the same register and festival table

df = daily[:"2017"].reset_index()               # Prophet wants a table, not an indexed series
df.columns = ["ds", "y"]                        # ds = date stamp, y = value: fixed names
# carnival: columns holiday, ds, lower_window=0, upper_window=4 (the date and the 4 days after)
m = Prophet(holidays=carnival,                  # weekly + yearly seasonality are on by default
            changepoint_prior_scale=0.05)       # how freely the trend may bend (the default)
m.fit(df)                                       # missing days need no special handling
future = m.make_future_dataframe(periods=365)   # every training date + 365 new days
fc = m.predict(future)                          # yhat, yhat_lower, yhat_upper, trend, yearly, weekly, ...
print(fc.loc[fc.ds.between("2018-01-13", "2018-01-20"),
             ["ds", "trend", "yearly", "weekly", "snow_carnival", "yhat", "yhat_lower", "yhat_upper"]])
m.plot_components(fc)                           # one panel per component</div>
  <p><code>make_future_dataframe(periods=365)</code> lists every training date plus 365 new ones. <code>predict</code> returns one column per component (<code>trend</code>, <code>yearly</code>, <code>weekly</code>, one per holiday such as <code>snow_carnival</code>), their sum <code>yhat</code>, and an 80% interval <code>yhat_lower</code> to <code>yhat_upper</code> simulated as described in section 08 (seed numpy if you need repeatable intervals). Each row of the result is the same kind of sum we built by hand in section 07: trend + yearly + weekly + holiday. <code>plot_components</code> draws one panel per component. A few more calls cover most real projects:</p>
  <div class="fx" data-lang="py">m = Prophet(growth="logistic")                  # bend toward a ceiling instead of a straight line
m.add_seasonality(name="monthly", period=30.5, fourier_order=5)   # any extra cycle
m.add_country_holidays(country_name="IN")       # built-in national holidays
m.add_regressor("price")                        # an extra column, needed for future dates too
df["cap"] = 48                                  # 12 rooms x 4 guests: the logistic ceiling
m.fit(df)</div>
  <p><code>add_seasonality</code> adds any extra cycle as more Fourier columns (all <code>add_*</code> calls must come before <code>fit</code>); <code>add_country_holidays</code> brings in national holidays such as Diwali and Holi; <code>add_regressor</code> adds an ordinary extra column, which must then also be filled in for every future date; and the logistic trend needs a <code>cap</code> column in both the training and future frames. The seasonality flags (<code>yearly_seasonality</code>, <code>weekly_seasonality</code>, <code>daily_seasonality</code>) accept True, False, "auto" or a Fourier order.</p>
  <p>One fit and one test year is one exam. Prophet ships a back-testing helper that pretends to be the forecaster on several past dates. This is called <strong>rolling-origin evaluation</strong> (or simulated historical forecasts): choose several cut-off dates, fit on the data before each, forecast a fixed horizon after it, and pool the errors by how far ahead they were. It measures exactly what you will experience in use: the accuracy h days after the last data you had. Again, shown but not run:</p>
  <div class="fx" data-lang="py">from prophet.diagnostics import cross_validation, performance_metrics

cv = cross_validation(m, initial="730 days",    # train on at least two years
                      period="180 days",        # move the cut-off every six months
                      horizon="90 days")        # forecast 90 days after each cut-off
pm = performance_metrics(cv)                    # rmse, mae, mape, coverage ... by horizon
print(pm[["horizon", "mae", "coverage"]])</div>
  <p>With <code>initial="730 days"</code>, <code>period="180 days"</code> and <code>horizon="90 days"</code>, the cut-offs are counted back from the end of the data every six months, each refit from scratch, each forecasting the next 90 days. <code>performance_metrics</code> groups the errors by horizon and reports RMSE, MAE, MAPE and <strong>coverage</strong>, the share of actual values that fell inside the interval. Check coverage carefully: Prophet's intervals are often too narrow, because by default they ignore uncertainty in the seasonal and holiday weights (full posterior sampling with <code>mcmc_samples</code> adds it, slowly). If the nominal 80% interval covers noticeably less than 80% of actuals in the back-test, widen <code>interval_width</code> or calibrate before using it for planning. The same idea without Prophet is a simple loop over cut-off dates, which <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> builds with scikit-learn's <code>TimeSeriesSplit</code>.</p>
  <p>The commonest Prophet mistakes in code are all about the future frame. Columns must be named <code>ds</code> and <code>y</code> exactly, with no duplicate dates and no time zones. Every regressor needs its future values, which means you must forecast or plan them. And every holiday must be listed for future years: if 2018's carnival were missing from the table, the model would forecast an ordinary week, as the next section measures.</p>

  <h2 id="ep-choose"><span class="num">10</span>Choosing: Classical, Prophet or ML</h2>
  <p>Each section beat the one before on its own terms. Put side by side on the same hidden year, which family wins on Pine View, why, and how do we decide for a new problem where we cannot peek? Every quarterly model below is fitted on 2014 to 2017 with statsmodels' estimated parameters. The Prophet-style model is our regression from sections 07 and 08 (trend with changepoints, Fourier seasons, carnival days), fitted on the daily register, with its daily 2018 forecasts averaged per quarter. Then the daily view, which the quarterly numbers cannot show.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.holtwinters import SimpleExpSmoothing, Holt, ExponentialSmoothing
train, test = quarterly[:"2017"].astype(float), quarterly["2018":].values
mae = lambda f: np.abs(test - np.asarray(f)).mean()
fits = {"SES": SimpleExpSmoothing(train, initialization_method="estimated"),
        "Holt": Holt(train, initialization_method="estimated"),
        "Holt damped": Holt(train, damped_trend=True, initialization_method="estimated"),
        "Holt-Winters add": ExponentialSmoothing(train, trend="add", seasonal="add",
                              seasonal_periods=4, initialization_method="estimated"),
        "Holt-Winters mul": ExponentialSmoothing(train, trend="add", seasonal="mul",
                              seasonal_periods=4, initialization_method="estimated")}
board = {"naive": np.repeat(train.iloc[-1], 4), "seasonal naive": train.iloc[-4:].values}
board.update({name: model.fit().forecast(4).values for name, model in fits.items()})
days2018 = pd.date_range("2018-01-01", "2018-12-31")
with_c = mini_prophet(holidays=True)(days2018)       # sections 07-08: trend + bends + waves + carnival
no_c = mini_prophet(holidays=False)(days2018)
board["Prophet-style (daily-&gt;qtr)"] = with_c.resample("QS").mean().values
board["  ... without carnival"] = no_c.resample("QS").mean().values
for name, f in board.items():
    print(f"{name:27s} {np.round(f, 1)}  MAE {mae(f):.2f}")
print("actual 2018                ", test)

real = daily["2018"]                                 # the daily view the quarters cannot show
snaive7 = np.resize(daily["2017-12-25":"2017-12-31"].values, len(real))   # repeat the last week
fest = real.index.isin(pd.date_range("2018-01-15", "2018-01-19"))
for name, f in [("seasonal naive (last week)", snaive7),
                ("Prophet-style, no carnival", no_c[real.index].values),
                ("Prophet-style + carnival", with_c[real.index].values)]:
    e = np.abs(real.values - f)
    print(f"{name:27s} daily MAE {e.mean():5.2f} | carnival days MAE {e[fest].mean():5.2f}")</div>
  <div class="fx" data-lang="text">naive                       [28. 28. 28. 28.]  MAE 3.75
seasonal naive              [24. 31. 21. 28.]  MAE 4.25
SES                         [24.8 24.8 24.8 24.8]  MAE 5.46
Holt                        [26.7 27.5 28.2 28.9]  MAE 4.02
Holt damped                 [26.6 27.3 28.  28.7]  MAE 4.09
Holt-Winters add            [28.3 34.  24.5 31. ]  MAE 0.77
Holt-Winters mul            [28.3 36.3 22.5 31.3]  MAE 1.30
Prophet-style (daily-&gt;qtr)  [28.6 34.8 25.3 32.2]  MAE 0.28
  ... without carnival      [28.5 34.9 25.5 32.3]  MAE 0.35
actual 2018                 [29 35 25 32]
seasonal naive (last week)  daily MAE  4.73 | carnival days MAE 10.40
Prophet-style, no carnival  daily MAE  1.85 | carnival days MAE  9.74
Prophet-style + carnival    daily MAE  1.70 | carnival days MAE  1.08</div>
  <p>Quarterly, the ladder of this note pays off rung by rung. SES (5.46) loses even to naive; Holt (4.02) learns growth but not the season; Holt-Winters (0.77) learns both, and additive beats multiplicative because the swing does not grow. The Prophet-style regression is best (0.28), because it learns from 1,441 daily rows instead of 16 quarterly ones and because its changepoints found the post-road growth rate. A fair warning: Pine View was simulated from exactly the pieces Prophet assumes (a trend with a kink, smooth seasons, a holiday, independent noise), so this is Prophet's home ground. Independent benchmarks have found Prophet beaten by ETS, ARIMA or even seasonal naive on many real datasets.</p>
  <p>Holidays barely matter quarterly (0.28 against 0.35) but matter hugely on the days themselves. On the five carnival days, seasonal naive (repeat last week) misses by 10.40 guests, the model without the holiday table by 9.74, and the model with it by 1.08. If you plan staff by the day, that is the number that counts.</p>
  <table class="tbl">
    <tr><th></th><th>Exponential smoothing / ETS</th><th>ARIMA</th><th>Prophet</th><th>ML (LightGBM on lag features)</th></tr>
    <tr><td>Core idea</td><td>Smoothed level, slope, season</td><td>Past values and errors of the differenced series</td><td>Regression on time: trend + Fourier + holidays</td><td>Supervised table: lags, rolling stats, calendar, drivers</td></tr>
    <tr><td>Data it likes</td><td>One regular series, even short (2+ seasons)</td><td>One regular series</td><td>Daily or weekly business data, 1+ years</td><td>Many related series, long history, many drivers</td></tr>
    <tr><td>Gaps, uneven spacing</td><td>Must fill</td><td>Must fill</td><td>Fine</td><td>Fine if features are built carefully</td></tr>
    <tr><td>Several seasons</td><td>One (TBATS, MSTL for more)</td><td>One seasonal part</td><td>Any number</td><td>Any, via features</td></tr>
    <tr><td>Holidays, events</td><td>No</td><td>Through exogenous columns (SARIMAX)</td><td>Built in, with windows</td><td>Via flag features</td></tr>
    <tr><td>Short-term memory</td><td>Yes (level updates)</td><td>Yes (AR terms)</td><td>No</td><td>Yes (lag features)</td></tr>
    <tr><td>Intervals</td><td>Yes</td><td>Yes</td><td>Yes (often too narrow)</td><td>Needs quantile models</td></tr>
  </table>
  <p>A practical decision guide follows from this table. Always compute naive and seasonal naive first. For one or a few regular series (monthly sales, quarterly averages) with little history, use ETS with automatic selection by AICc, or ARIMA; damped trend is a safe default. For daily or weekly business data with several seasons, holidays, gaps and trend breaks, especially when analysts who are not statisticians must read and adjust the model, use Prophet, and check its intervals. For hundreds or thousands of related series, or demand driven by prices, promotions and weather, use a global machine-learning model (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>), with careful leakage control. And consider combining: the average of an ETS, an ARIMA and an ML forecast is often better than any one of them, one of the most reliable findings in forecasting research. Whatever you choose, back-test every candidate on several cut-offs against seasonal naive and keep the simplest that wins; never choose a family by reputation.</p>

  <h2 id="ep-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Most mistakes with these models have already appeared in passing, and each was measured on Pine View. The first is skipping the baselines: an MAE of 4 looks fine until naive gets 3.75. The second is using SES on a trending or seasonal series: it forecasts a flat line and stays permanently behind, and a small fitted α is a symptom of that, not evidence of calm data. The third is extrapolating an undamped trend far ahead; for long horizons prefer damped trend with φ around 0.9. The fourth is a wrong <code>seasonal_periods</code> (12 on quarterly data, 7 on monthly), which makes the model fit a nonsense pattern without complaint; m is the number of observations per cycle. The fifth is choosing multiplicative seasonality by habit: use it only when the swing grows with the level, and never near zero values.</p>
  <p>Model selection has its own traps. On 16 points AICc dropped the real trend (MAE 2.75 against 0.73), so back-test the top few candidates instead of trusting the single best AICc. Parameter conventions differ between APIs (<code>ETSModel</code>'s <code>smoothing_trend</code> is α × β of the classic form) and AIC constants differ between libraries, so compare only like with like. And evaluating on the training period flatters every smoothing model, because fitted values are one-step forecasts (SSE 9.3 here); always hold out the end of the series or back-test from several cut-offs.</p>
  <p>Data problems are quieter. A gap in the series makes statsmodels return NaN forecasts with no error, so always <code>asfreq()</code>, check <code>isna().sum()</code>, and fill on purpose. With Prophet, the columns must be <code>ds</code> and <code>y</code>; holidays must be listed for future years (an unlisted 2018 carnival raised the carnival-day error from 1.08 to 9.74); a too-large <code>changepoint_prior_scale</code> lets the trend chase noise; breaks in the last 20% of the history are invisible by default; its intervals tend to be too narrow; and it forgets yesterday, so for short horizons on "sticky" series ETS, ARIMA or lag-based ML often wins.</p>

  <h2 id="ep-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <table class="tbl">
    <tr><th>Year</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Mean</th></tr>
    <tr><td>2014</td><td>16</td><td>21</td><td>11</td><td>18</td><td>16.5</td></tr>
    <tr><td>2015</td><td>18</td><td>22</td><td>13</td><td>19</td><td>18</td></tr>
    <tr><td>2016</td><td>19</td><td>26</td><td>17</td><td>23</td><td>21.25</td></tr>
    <tr><td>2017</td><td>24</td><td>31</td><td>21</td><td>28</td><td>26</td></tr>
    <tr><td>2018 (test)</td><td>29</td><td>35</td><td>25</td><td>32</td><td>30.25</td></tr>
  </table>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Level ℓ</b>: the smoothed "normal value now"; <b>trend b</b>: smoothed change per period; <b>seasonal index s</b>: usual offset (additive) or ratio (multiplicative) of a position in the season; <b>m</b>: season length.</li>
    <li><b>α, β, γ</b>: how strongly level, trend and season react to new data; <b>φ</b>: how fast the slope fades in the forecast.</li>
    <li><b>ETS(E,T,S)</b>: the state-space model behind a smoothing method; it has a likelihood, AICc and intervals.</li>
    <li><b>Prophet</b>: y = g(t) + s(t) + h(t) + ε fitted as a regression on the date; <b>Fourier order</b>: number of sin/cos pairs per season; <b>holiday window</b>: days around an event, each with its own effect.</li>
    <li><b>Changepoint</b>: a date where the trend's slope may change; <b>changepoint_prior_scale</b>: how freely (Laplace prior ≈ L1).</li>
    <li><b>Rolling-origin evaluation</b>: fit before several cut-offs, forecast after each, pool errors by horizon.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Formula</th><th>Pine View</th></tr>
    <tr><td>SES</td><td>ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + α(y<sub>t</sub> − ℓ<sub>t−1</sub>); ŷ = ℓ</td><td>α 0.5: 16 → 18.5 → 14.75 → 16.375</td></tr>
    <tr><td>SES weights</td><td>α(1 − α)<sup>k</sup> for k steps back</td><td>0.5, 0.25, 0.125, 0.0625</td></tr>
    <tr><td>Holt</td><td>ℓ = αy + (1 − α)(ℓ + b); b = β(Δℓ) + (1 − β)b; ŷ = ℓ + hb</td><td>27.92, 28.89, 29.85, 30.82</td></tr>
    <tr><td>Damped</td><td>ŷ = ℓ + (φ + … + φ<sup>h</sup>)b → ℓ + φb/(1 − φ)</td><td>27.36, 27.97; limit 33.5</td></tr>
    <tr><td>Holt-Winters add</td><td>ℓ = α(y − s<sub>t−m</sub>) + (1 − α)(ℓ + b); s = γ(y − ℓ − b) + (1 − γ)s<sub>t−m</sub>; ŷ = ℓ + hb + s</td><td>28.46, 34.61, 24.98, 31.93</td></tr>
    <tr><td>Holt-Winters mul</td><td>ŷ = (ℓ + hb) × s</td><td>indices 0.970, 1.273, 0.667, 1.091</td></tr>
    <tr><td>ETS(A,N,N) interval</td><td>ŷ ± 1.96σ√(1 + (h − 1)α²)</td><td>24.79 ± 9.33</td></tr>
    <tr><td>SES as ARIMA</td><td>ARIMA(0,1,1), α = 1 + θ</td><td>θ −0.667 → α 0.333</td></tr>
    <tr><td>Fourier season</td><td>Σ[a<sub>n</sub>cos(2πnt/P) + b<sub>n</sub>sin(2πnt/P)]</td><td>15 Jan 2018: sin 0.2385, cos 0.9711</td></tr>
    <tr><td>Prophet sum</td><td>yhat = trend + seasons + holidays</td><td>26.63 + 1.02 − 2.46 + 11.33 = 36.52</td></tr>
    <tr><td>Changepoint trend</td><td>slope = k + Σδ<sub>j</sub>, δ sparse (L1)</td><td>1.58 → 4.42 guests/year</td></tr>
  </table>
  <h3>Scoreboard (2018)</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Quarterly MAE</th></tr>
    <tr><td>naive / seasonal naive / mean</td><td>3.75 / 4.25 / 9.81</td></tr>
    <tr><td>SES / Holt / damped Holt</td><td>5.46 / 4.02 / 4.09</td></tr>
    <tr><td>Holt-Winters additive / multiplicative</td><td>0.77 / 1.30</td></tr>
    <tr><td>Prophet-style regression (daily → quarter)</td><td>0.28 (daily MAE 1.70; carnival days 1.08)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">ExponentialSmoothing(y, trend="add", damped_trend=True, seasonal="add",
                     seasonal_periods=4, initialization_method="estimated").fit().forecast(4)
r = ETSModel(y, error="add", trend="add", seasonal="add", seasonal_periods=4).fit(disp=False)
r.aicc; r.get_prediction(start, end).summary_frame(alpha=0.05)
m = Prophet(holidays=carnival, changepoint_prior_scale=0.05).fit(df)   # df: ds, y
fc = m.predict(m.make_future_dataframe(periods=365))                  # yhat, components
cross_validation(m, initial="730 days", period="180 days", horizon="90 days")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Beat naive and seasonal naive first; with strong growth naive can win (3.75 vs 4.25).</li>
    <li>Fitted values are one-step forecasts and look better than real h-step forecasts.</li>
    <li>AICc on short series can drop a real trend; conventions for β and AIC differ by library.</li>
    <li>statsmodels returns NaN silently on gaps; Holt-Winters has one season length.</li>
    <li>Prophet: list future holidays, check interval coverage, watch the trend at the end; it has no memory of yesterday.</li>
  </ul>

  <h2 id="ep-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain simple exponential smoothing and compute two steps: start level 16, α = 0.5, values 21 then 11.</summary><div class="qa-body">The level is a running weighted average: new level = old level + α × (actual − old level). The forecast for the 21 is 16, error +5, new level 18.5. The forecast for the 11 is 18.5, error −7.5, new level 14.75. The forecast for every future period is the latest level, a flat line.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is it called "exponential", and what do small and large α mean?</summary><div class="qa-body">Unrolling the recursion gives ℓ<sub>t</sub> = Σα(1 − α)<sup>k</sup>y<sub>t−k</sub>: the weights decay geometrically, the discrete form of exponential decay. A large α (near 1) puts almost all weight on the last value, so it is reactive and noisy, close to naive. A small α spreads weight over a long history, so it is smooth and slow, close to the mean.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is α chosen, and why might the training-optimal α forecast worse?</summary><div class="qa-body">By minimising the sum of squared one-step errors on the training data, or maximising the ETS likelihood. If the series has a trend or season that SES cannot model, those errors are dominated by the pattern, and the optimiser picks a value that suits the training errors rather than the real problem (on Pine View α 0.3 was optimal in training but α 0.9 did better on a growing test year). The real fix is a model with trend and season.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write Holt's equations and explain why damping is recommended.</summary><div class="qa-body">ℓ<sub>t</sub> = αy<sub>t</sub> + (1 − α)(ℓ<sub>t−1</sub> + b<sub>t−1</sub>); b<sub>t</sub> = β(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1 − β)b<sub>t−1</sub>; ŷ<sub>t+h</sub> = ℓ<sub>t</sub> + h·b<sub>t</sub>. An undamped trend extrapolates a straight line forever, which is rarely true over long horizons. Damping multiplies the slope by φ, φ², …, so the forecast levels off at ℓ + φb/(1 − φ); empirically it is one of the most accurate and robust methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Holt-Winters handle seasonality, and why does it compute the level from the deseasonalised value?</summary><div class="qa-body">It keeps one seasonal index per position in the cycle, updated by γ only when that position comes round, and forecasts ℓ + hb + s. The level is updated from y minus its usual seasonal offset, so a busy season is not mistaken for a jump in the level or the slope. Without that, as in plain Holt, the seasonal zig-zag makes the slope swing up and down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Additive or multiplicative seasonality: how do you decide?</summary><div class="qa-body">Plot the series. If the seasonal swing stays about the same size as the level grows, use additive; if it grows in proportion, use multiplicative or take logs and use additive. Avoid multiplicative near zero. Confirm with AICc and a back-test: on Pine View the swing stayed about 10 guests and additive won (MAE 0.77 vs 1.30).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ETS add to the smoothing methods? What is ETS(M,Ad,M)?</summary><div class="qa-body">An explicit random error term, which turns each method into a statistical model with a likelihood: parameters by maximum likelihood, model selection by AIC/AICc, and prediction intervals. Point forecasts are unchanged. ETS(M,Ad,M) has multiplicative errors, an additive damped trend and multiplicative seasonality: damped multiplicative Holt-Winters whose noise grows with the level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show why SES is ARIMA(0,1,1).</summary><div class="qa-body">From y<sub>t</sub> = ℓ<sub>t−1</sub> + ε<sub>t</sub> and ℓ<sub>t</sub> = ℓ<sub>t−1</sub> + αε<sub>t</sub>, the difference is y<sub>t</sub> − y<sub>t−1</sub> = αε<sub>t−1</sub> + ε<sub>t</sub> − ε<sub>t−1</sub> = ε<sub>t</sub> − (1 − α)ε<sub>t−1</sub>: an MA(1) on the first difference with θ = α − 1. On Pine View ARIMA estimated θ = −0.667 (α = 0.333) and gave the same next forecast as SES with that α.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do SES prediction intervals widen with the horizon?</summary><div class="qa-body">In ETS(A,N,N) each future surprise moves the level by αε, so the h-step error contains the next shock plus α times each of the h − 1 shocks before it: variance σ²[1 + (h − 1)α²]. A model that leaves a seasonal pattern in its "noise" also has much wider intervals (19 guests for SES against 3 for Holt-Winters on Pine View).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write Prophet's model and explain each part.</summary><div class="qa-body">y(t) = g(t) + s(t) + h(t) + ε. g is a piecewise-linear (or logistic) trend whose slope can change at changepoints; s is a sum of Fourier sine/cosine pairs for each seasonal period (yearly order 10, weekly order 3 by default); h is a set of indicator columns for listed events and the days around them; ε is noise. It is fitted as a regression on these functions of time, with priors on the weights.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Prophet represent seasonality, and what does the Fourier order control?</summary><div class="qa-body">As regression columns sin(2πnt/P) and cos(2πnt/P) for n = 1 to N, with learned weights, which can build any smooth repeating shape. The Fourier order N controls how wiggly the shape may be: a higher order can follow sharper peaks but can also overfit. Each extra seasonality (monthly, quarterly) is just another set of columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Prophet choose changepoints, and what does changepoint_prior_scale do?</summary><div class="qa-body">It places 25 evenly spaced candidate changepoints in the first 80% of the history and puts a Laplace(0, τ) prior on each slope change, which acts like an L1 (Lasso) penalty and shrinks most changes to about zero. τ = changepoint_prior_scale controls flexibility: too small gives one straight line that misses real breaks, too large lets the trend chase noise and extrapolate the last wiggle. On Pine View a moderate L1 penalty kept 3 bends around the road opening and found growth 1.58 → 4.42 a year.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Prophet handle that Holt-Winters cannot, and what does it lose?</summary><div class="qa-body">It handles missing days and uneven spacing (no lags), several seasonal periods at once, listed holidays with windows, trend changes, extra regressors and readable components. It loses short-term memory: yesterday's surprise does not change tomorrow's forecast. Its intervals are also often too narrow, so coverage must be checked.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do holidays need to be listed for the future, and how much does it matter?</summary><div class="qa-body">Holidays are indicator columns; the model can only apply a holiday effect on dates where the column is 1, so a future event missing from the table is forecast as an ordinary day. On Pine View, quarterly accuracy barely changed (0.28 vs 0.35), but on the carnival days the error was 1.08 guests with the holiday listed and 9.74 without it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you validate an ETS or Prophet model before deploying it?</summary><div class="qa-body">With rolling-origin back-testing: several cut-off dates, fit on data before each, forecast the business horizon after it, pool errors by horizon, and compare with seasonal naive (MASE is a convenient scale-free score). Check the coverage of the intervals too. Prophet's cross_validation and performance_metrics automate this; for ETS, loop over cut-offs or use TimeSeriesSplit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do exponential smoothing, ARIMA and Prophet each represent trend and seasonality?</summary><div class="qa-body">Exponential smoothing keeps them as running states (level, slope, seasonal indices) updated after each observation. ARIMA removes them by differencing (d for trend, D for season) and models what is left with AR and MA terms. Prophet writes them as explicit functions of the date (a piecewise line and Fourier series) fitted by regression. ML forecasting represents them as features such as lags, rolling means and calendar columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A retailer has 20,000 store × product series with prices and promotions. Would you use ETS, Prophet or something else?</summary><div class="qa-body">Most likely a global ML model (LightGBM on lag, rolling, calendar, price and promotion features) trained across all series: it shares patterns between series and uses the drivers. ETS per series is a strong, cheap baseline and a good fallback for short or sparse series; Prophet per series is slow at that scale and ignores cross-series information. Back-test all of them against seasonal naive, and consider combining.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your statsmodels Holt-Winters returns NaN forecasts with no error. What happened?</summary><div class="qa-body">The series contains NaN, for example after asfreq("D") exposed missing days. The recursions pass the NaN through every state, so every forecast becomes NaN. Fill the gap deliberately (interpolation or a seasonal fill), or use a model that tolerates gaps, such as Prophet or a state-space model with missing-data handling.</div></details>
</main>
`
});
