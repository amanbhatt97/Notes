// notes/ml/ml_arima.js — ARIMA Family
Object.assign(TOPIC_CONTENT, {
  "ml_arima": `<main>
  <h1>ARIMA Family</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>ARIMA Family</span></div>
  <p class="lead">ARIMA writes a series' memory as an equation: this month's value is built from recent values (AR), recent surprises (MA), after differencing away trend and season (I). This note builds the family piece by piece on the same running example as <a class="xref" data-note="ml_timeseries">Time Series Basics</a>, Meera's chai shop: AR(1) and AR(p) with Yule-Walker by hand, MA(q) with the error recursion by hand, ARMA, integration and the random walk, ARIMA notation and the backshift operator, seasonal SARIMA terms, choosing orders from ACF/PACF and AIC, fitting with statsmodels and reading every line of the summary, residual diagnostics with the Ljung-Box test computed by hand, forecasts and prediction intervals by hand, the auto_arima search idea, and exogenous variables with SARIMAX, which turns out to explain the shop's biggest puzzle.</p>

  <h2 id="ar-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_timeseries">Time Series Basics</a></b><span>Basics gave us the toolkit: Meera's sales need one ordinary and one seasonal difference to become stationary (the series w), and w's ACF and PACF show memory at lag 1 (−0.41) and lag 12 (−0.31). A regression on lag columns forecast one month ahead. The open problem: a model that describes how the series generates itself, forecasts any number of months ahead, and says how uncertain each forecast is.</span></li>
    <li><b>This note adds: the Box-Jenkins model family</b><span>AR, MA, ARMA, ARIMA, SARIMA and SARIMAX: linear equations in past values and past errors, fitted by maximum likelihood, chosen by ACF/PACF and AIC, checked by residual tests, and producing forecasts with prediction intervals.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a> and <a class="xref" data-note="ml_ts_ml">ML Forecasting</a></b><span>Exponential smoothing reaches similar forecasts from the components side (level, trend, season) and some ETS models are exactly ARIMA models in disguise; Prophet fits the calendar directly. ML forecasting trades the equation for gradient boosting on lag features and is benchmarked against ARIMA.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 680 220" width="680">
<defs><marker id="ar-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="640" height="200" rx="12" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/>
<text x="34" y="28" class="tm" font-size="11.5">TIME SERIES GROUP</text>
<rect x="250" y="24" width="180" height="46" rx="8" class="ft st"/>
<text x="340" y="43" text-anchor="middle" font-size="12.5">Time Series Basics</text><text x="340" y="60" text-anchor="middle" class="tm" font-size="10.5">stationarity · ACF/PACF</text>
<line x1="300" y1="70" x2="130" y2="118" stroke="currentColor" marker-end="url(#ar-fa)"/>
<line x1="340" y1="70" x2="340" y2="118" stroke="currentColor" marker-end="url(#ar-fa)"/>
<line x1="380" y1="70" x2="550" y2="118" stroke="currentColor" marker-end="url(#ar-fa)"/>
<rect x="40" y="120" width="180" height="56" rx="8" class="fb sb" stroke-width="3"/>
<text x="130" y="141" text-anchor="middle" font-size="14" font-weight="700">ARIMA Family</text><text x="130" y="160" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE · memory → equation</text>
<rect x="250" y="120" width="180" height="56" rx="8" class="ft st"/>
<text x="340" y="141" text-anchor="middle" font-size="12.5">ETS &amp; Prophet</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="10.5">components → model</text>
<rect x="460" y="120" width="180" height="56" rx="8" class="ft st"/>
<text x="550" y="141" text-anchor="middle" font-size="12.5">ML Forecasting</text><text x="550" y="160" text-anchor="middle" class="tm" font-size="10.5">lag features → GBM</text>
<line x1="220" y1="148" x2="248" y2="148" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ar-fa)"/>
<text x="340" y="198" text-anchor="middle" class="tm" font-size="10.5">ARIMA is the classical benchmark the other two are compared with</text>
</svg><figcaption>ARIMA is the first forecasting family after the Basics. Its sibling ETS models the components instead of the autocorrelation; ML forecasting is judged against both. Read next: Exponential Smoothing &amp; Prophet.</figcaption></figure>

  <h2 id="ar-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>One running example carries the whole note: <strong>Meera's chai shop</strong>, monthly sales in ₹ thousand from January 2020 to December 2024, the same sixty numbers as in <a class="xref" data-note="ml_timeseries">Time Series Basics</a>, with the discount-offer months flagged. We fit on 2020–2023 (48 months) and judge forecasts on 2024 (12 months). Each concept answers the question the previous one left open.</p>
  <ol class="story">
    <li><b>AR(1)</b><span>Q: can we predict this month's value from last month's? → w<sub>t</sub> = φw<sub>t−1</sub> + ε<sub>t</sub>, φ = −0.40: November 2023 forecast 139.8 (actual 141). But one lag may not be enough memory.</span></li>
    <li><b>AR(p)</b><span>Q: what if two or more past values matter? → add lags; Yule-Walker by hand gives φ₁ = −0.45, φ₂ = −0.11. But AR models remember every shock forever (fading slowly); some shocks vanish after one month.</span></li>
    <li><b>MA(q)</b><span>Q: how do we model a surprise that matters for only a month or two? → use past errors: w<sub>t</sub> = ε<sub>t</sub> + θε<sub>t−1</sub>, errors computed by hand. But some series have both kinds of memory.</span></li>
    <li><b>ARMA(p, q)</b><span>Q: how do we combine both? → AR and MA terms together, few parameters for rich memory. But ARMA needs a stationary series and sales are not.</span></li>
    <li><b>I(d): integration</b><span>Q: how do we use ARMA on a trending series? → model the differences, then add them back up; ARIMA(0,1,0) is the random walk (forecast flat at 138). But writing these equations by hand gets messy.</span></li>
    <li><b>ARIMA(p, d, q) notation</b><span>Q: how do we write the whole model compactly? → the backshift operator: φ(B)(1 − B)<sup>d</sup>y<sub>t</sub> = θ(B)ε<sub>t</sub>. But the shop's strongest memory is at lag 12, which would need twelve AR terms.</span></li>
    <li><b>SARIMA</b><span>Q: how do we model memory at the seasonal lag cheaply? → seasonal terms (P, D, Q)<sub>12</sub> multiplied in: the airline model (0,1,1)(0,1,1)<sub>12</sub>, ACF spikes at 1, 11, 12, 13. But which orders fit the shop?</span></li>
    <li><b>Identification by ACF/PACF</b><span>Q: which p, q, P, Q should we try? → ACF spike at 1 and (borderline) 12 → MA(1) and seasonal MA(1), or AR(1) and seasonal AR(1). But the plots allow several readings.</span></li>
    <li><b>AIC and BIC</b><span>Q: how do we choose between candidates fairly? → −2·log-likelihood + penalty: four models within 0.2 AIC (201.2–201.4), all clearly better than no seasonal term (204+). But a chosen model may still be wrong.</span></li>
    <li><b>Fitting and the summary</b><span>Q: what did the model learn and how sure is it? → θ = −0.41 (p = 0.005), Θ = −0.47 (p = 0.10), σ² = 14.2; plus diagnostic tests in the footer. But are the leftovers really noise?</span></li>
    <li><b>Residual diagnostics</b><span>Q: has the model used all the memory? → Ljung-Box Q(3) = 1.006 by hand, p = 0.80: residuals look like white noise; but they are not normal (JB p = 0.01), with the biggest errors in promotion-related months. Still, can we forecast?</span></li>
    <li><b>Forecasts and intervals</b><span>Q: what will 2024 look like and how sure are we? → January 2024 by hand ≈ 134 (actual 133), ±7.4, widening to ±16 by December; MAE 5.76 vs 14.75 for seasonal naive. But we chose orders by hand; can a computer search them?</span></li>
    <li><b>auto_arima</b><span>Q: how do we search orders automatically? → stepwise or grid search on AIC: 36 models, the same four-way tie at the top. But every model still ignores what we know about promotions.</span></li>
    <li><b>SARIMAX: exogenous variables</b><span>Q: how do we add the promotion flag? → regression with SARIMA errors: +6.64 per promotion, σ² 14.2 → 2.7, AIC 201 → 153, MAE 4.70, intervals half as wide. The negative lag-1 memory was largely the promotions in disguise.</span></li>
  </ol>

  <h2 id="ar-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ARIMA Family</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">AR(p): past values</div>
        <ul>
          <li>w<sub>t</sub> = c + φ₁w<sub>t−1</sub> + … + φ<sub>p</sub>w<sub>t−p</sub> + ε<sub>t</sub></li>
          <li>AR(1): ACF = φ<sup>k</sup> (tails off), PACF cuts after p</li>
          <li>Stationary if |φ| &lt; 1 (roots outside unit circle)</li>
          <li>Shop: φ = −0.40; Nov 2023 → 139.8 (actual 141)</li>
          <li>Yule-Walker: φ₂ = (r₂ − r₁²)/(1 − r₁²) = −0.11</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MA(q): past errors</div>
        <ul>
          <li>w<sub>t</sub> = μ + ε<sub>t</sub> + θ₁ε<sub>t−1</sub> + … + θ<sub>q</sub>ε<sub>t−q</sub></li>
          <li>ACF cuts after q; r₁ = θ/(1 + θ²) = −0.351 for θ = −0.41</li>
          <li>Errors by recursion: e<sub>t</sub> = w<sub>t</sub> − θe<sub>t−1</sub></li>
          <li>Invertible if |θ| &lt; 1</li>
          <li>Shock lasts exactly q steps</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">I, ARIMA, SARIMA</div>
        <ul>
          <li>d differences, then ARMA; integrate back (cumsum)</li>
          <li>ARIMA(0,1,0) = random walk: forecast = last value (138)</li>
          <li>φ(B)Φ(B<sup>s</sup>)(1 − B)<sup>d</sup>(1 − B<sup>s</sup>)<sup>D</sup>y = θ(B)Θ(B<sup>s</sup>)ε</li>
          <li><b>Airline</b> (0,1,1)(0,1,1)<sub>12</sub>: ACF spikes 1, 11, 12, 13</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing orders</div>
        <ul>
          <li>d, D from tests and ACF of diff(1) (0.61 at lag 12)</li>
          <li>p, q, P, Q from PACF/ACF cut-offs</li>
          <li><b>AIC</b> = −2 log L + 2k = 201.41; BIC = −2 log L + k ln n</li>
          <li>Differences &lt; 2 AIC = a tie; compare only same d, D</li>
          <li>auto_arima: stepwise search (Hyndman-Khandakar)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fit, check, forecast</div>
        <ul>
          <li>MLE via Kalman filter (statsmodels SARIMAX)</li>
          <li>θ −0.41, Θ −0.47, σ² 14.2</li>
          <li><b>Ljung-Box</b> Q = n(n+2)Σr<sub>k</sub>²/(n−k): Q(3) = 1.006, p 0.80</li>
          <li>Forecast Jan 2024 ≈ 134 ± 7.4; var<sub>h</sub> = σ²Σψ<sub>j</sub>²</li>
          <li>MAE 2024: 5.76 (seasonal naive 14.75)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SARIMAX</div>
        <ul>
          <li>y<sub>t</sub> = βx<sub>t</sub> + u<sub>t</sub>, u<sub>t</sub> ~ SARIMA</li>
          <li>Promo β = +6.64; σ² 14.2 → 2.7; AIC 201 → 153</li>
          <li>θ flips −0.41 → +0.37: spikes caused the negative lag 1</li>
          <li>Future x must be known (planned promos)</li>
          <li>MAE 4.70; interval ±3.4 instead of ±7.4</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ar-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole story in one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ar-ar1"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">AR(1)</span><span class="rm-sub">Last month's value</span></div></div>
      <div class="rm-item rm-done" data-target="ar-arp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">AR(p)</span><span class="rm-sub">Yule-Walker by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ar-ma"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">MA(q)</span><span class="rm-sub">Past errors by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ar-arma"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ARMA</span><span class="rm-sub">Both memories</span></div></div>
      <div class="rm-item rm-done" data-target="ar-int"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Integration I(d)</span><span class="rm-sub">Random walk, drift</span></div></div>
      <div class="rm-item rm-done" data-target="ar-notation"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ARIMA Notation</span><span class="rm-sub">Backshift operator</span></div></div>
      <div class="rm-item rm-done" data-target="ar-sarima"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SARIMA</span><span class="rm-sub">Seasonal terms, airline model</span></div></div>
      <div class="rm-item rm-done" data-target="ar-ident"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Identification</span><span class="rm-sub">d, D, p, q from tests and plots</span></div></div>
      <div class="rm-item rm-done" data-target="ar-aic"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">AIC &amp; BIC</span><span class="rm-sub">By hand from the likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="ar-summary"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Fitting &amp; the Summary</span><span class="rm-sub">Every line explained</span></div></div>
      <div class="rm-item rm-done" data-target="ar-diag"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Residual Diagnostics</span><span class="rm-sub">Ljung-Box by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ar-forecast"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Forecasts &amp; Intervals</span><span class="rm-sub">By hand, then 2024</span></div></div>
      <div class="rm-item rm-done" data-target="ar-auto"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">auto_arima</span><span class="rm-sub">Automatic order search</span></div></div>
      <div class="rm-item rm-done" data-target="ar-sarimax"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">SARIMAX</span><span class="rm-sub">Exogenous variables</span></div></div>
      <div class="rm-item rm-done" data-target="ar-compare"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Family table, vs ETS and ML</span></div></div>
      <div class="rm-item rm-done" data-target="ar-connect"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each concept built from the last</span></div></div>
      <div class="rm-item rm-done" data-target="ar-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="ar-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ar-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ar-ar1"><span class="num">01</span>AR(1): Predicting from Last Month's Value</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The Basics note left us a stationary series w (Meera's sales after an ordinary and a seasonal difference) whose lag-1 autocorrelation is clearly non-zero. The simplest possible model of memory: can this month's w be predicted from last month's w alone?</p>
  <h3>The running example</h3>
  <p>We keep 2024 aside as a test year and work only with 2020–2023. The stationary series w is computed from the training months only, so nothing from 2024 leaks into any choice we make.</p>
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
y = shop["sales"]                                   # Meera's chai shop, Rs thousand per month
import warnings; warnings.simplefilter("ignore")          # silence statsmodels start-up notices
train, test = y[:"2023"], y["2024":]                    # fit on 2020-2023, judge on 2024
w = train.diff().diff(12).dropna()                      # stationary version of the training data
print("train:", len(train), "months   test:", len(test), "months   w:", len(w), "values")
print("last 13 training months:", train[-13:].tolist())
print("last 3 values of w:", w[-3:].tolist())</div>
  <div class="fx" data-lang="text">train: 48 months   test: 12 months   w: 35 values
last 13 training months: [126, 125, 120, 125, 118, 119, 120, 128, 134, 132, 142, 141, 138]
last 3 values of w: [-2.0, 2.0, 0.0]</div>
  <h3>Plain words and the equation</h3>
  <p>An <strong>autoregressive</strong> model of order 1 says: this value is a fixed fraction φ of last value, plus a fresh unpredictable shock.</p>
  <p style="text-align:center"><strong>w<sub>t</sub> = c + φ·w<sub>t−1</sub> + ε<sub>t</sub></strong>, with ε<sub>t</sub> white noise of variance σ²</p>
  <p>"Auto-regressive" = a regression of the series on itself. If φ is positive, good months follow good months (momentum); if negative, a high value tends to be followed by a low one (give-back). w has mean about 0, so we drop c.</p>
  <h3>By hand: estimating φ and forecasting</h3>
  <p>Least squares for a line through the origin: φ = Σ w<sub>t</sub>w<sub>t−1</sub> / Σ w<sub>t−1</sub>². For a stationary series this is essentially the lag-1 autocorrelation r₁, which is <strong>−0.4043</strong> for w. A give-back pattern.</p>
  <ul>
    <li>October 2023: w = −2 (this October's rise was 2 smaller than last October's).</li>
    <li>Forecast for November 2023: ŵ = −0.4043 × (−2) = <strong>+0.809</strong>.</li>
    <li>Undo the two differences (Basics, section 08): ŷ<sub>Nov 2023</sub> = y<sub>Oct 2023</sub> + y<sub>Nov 2022</sub> − y<sub>Oct 2022</sub> + ŵ = 142 + 129 − 132 + 0.809 = <strong>139.81</strong>. Actual: 141.</li>
  </ul>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf, pacf
# AR(1) on w: regress w_t on w_t-1 (no constant: w has mean ~0)
X1, Y1 = w.shift(1).dropna().values, w[1:].values
phi = (X1 @ Y1) / (X1 @ X1)
print(f"phi (least squares) = {phi:.4f}   lag-1 autocorrelation r1 = {acf(w, nlags=1)[1]:.4f}")
# one step inside the data: predict Nov 2023 from Oct 2023
w_oct = w["2023-10"].iloc[0]
w_nov_hat = phi * w_oct
y_nov_hat = y["2023-10"].iloc[0] + y["2022-11"].iloc[0] - y["2022-10"].iloc[0] + w_nov_hat
print(f"w Oct 2023 = {w_oct}  -&gt;  w_hat Nov = {phi:.4f} x {w_oct} = {w_nov_hat:.3f}")
print(f"sales_hat Nov 2023 = {y['2023-10'].iloc[0]} + {y['2022-11'].iloc[0]} - {y['2022-10'].iloc[0]} + {w_nov_hat:.3f} = {y_nov_hat:.2f}   actual {y['2023-11'].iloc[0]}")
# what an AR(1) process looks like: theoretical ACF is phi^k, PACF stops after lag 1
from statsmodels.tsa.arima_process import ArmaProcess
for ph in [0.7, -0.4]:
    p = ArmaProcess(ar=[1, -ph], ma=[1])               # statsmodels writes AR as 1 - phi*B
    print(f"AR(1) phi={ph:+}: ACF {p.acf(5)[1:].round(3).tolist()}  PACF {p.pacf(5)[1:].round(3).tolist()}")
rng = np.random.default_rng(3)
sim = ArmaProcess(ar=[1, -0.7], ma=[1]).generate_sample(300, distrvs=rng.standard_normal)
print("simulated AR(1), n=300: ACF", acf(sim, nlags=4)[1:].round(2).tolist(),
      " PACF", pacf(sim, nlags=4, method="ywm")[1:].round(2).tolist())
print("theory: variance 1/(1-0.7^2) =", round(1 / (1 - 0.49), 3), "  sample variance:", round(sim.var(), 3))</div>
  <div class="fx" data-lang="text">phi (least squares) = -0.4043   lag-1 autocorrelation r1 = -0.4043
w Oct 2023 = -2.0  -&gt;  w_hat Nov = -0.4043 x -2.0 = 0.809
sales_hat Nov 2023 = 142 + 129 - 132 + 0.809 = 139.81   actual 141
AR(1) phi=+0.7: ACF [0.7, 0.49, 0.343, 0.24]  PACF [0.7, 0.0, -0.0, 0.0]
AR(1) phi=-0.4: ACF [-0.4, 0.16, -0.064, 0.026]  PACF [-0.4, -0.0, 0.0, 0.0]
simulated AR(1), n=300: ACF [0.67, 0.47, 0.32, 0.26]  PACF [0.67, 0.06, -0.02, 0.07]
theory: variance 1/(1-0.7^2) = 1.961   sample variance: 1.841</div>
  <h3>Reading the output</h3>
  <ul>
    <li>The hand estimate equals r₁ here (both −0.4043) and the November forecast 139.81 matches the hand arithmetic.</li>
    <li><code>ArmaProcess(ar=[1, -φ])</code>: statsmodels writes the AR side as the polynomial 1 − φB, so φ = 0.7 is passed as −0.7. Its <code>acf</code> and <code>pacf</code> give the theoretical (infinite-data) values.</li>
    <li><strong>ACF of AR(1) = φ<sup>k</sup></strong>: 0.7, 0.49, 0.343, 0.24 (each bar 0.7 times the previous). With φ = −0.4 the bars alternate in sign: −0.4, 0.16, −0.064. <strong>PACF</strong>: φ at lag 1, then exactly 0: once you know last month, earlier months add nothing directly.</li>
    <li>A simulated AR(1) path of 300 points shows the same shape with sampling noise (ACF 0.67, 0.47, 0.32; PACF 0.67 then near 0). Its variance (1.84) is near the theoretical σ²/(1 − φ²) = 1/0.51 = 1.96.</li>
  </ul>
  <h3>Why |φ| &lt; 1</h3>
  <p>Substitute the equation into itself: w<sub>t</sub> = ε<sub>t</sub> + φε<sub>t−1</sub> + φ²ε<sub>t−2</sub> + … . A shock from k months ago still contributes φ<sup>k</sup>. If |φ| &lt; 1 the influence fades and the series has a stable mean c/(1 − φ) and variance σ²/(1 − φ²). If φ = 1 the shocks never fade: that is the random walk, a unit root, and the variance grows without bound (section 05). If |φ| &gt; 1 the series explodes.</p>
  <figure class="viz"><svg viewBox="0 0 680 230" width="680"><text x="120" y="18" text-anchor="middle" font-size="11.5">AR(1), φ = 0.7</text><line x1="20" y1="180" x2="220" y2="180" stroke="currentColor"/><rect x="26" y="50.0" width="13" height="130.0" class="fb sb"/><text x="32.5" y="195" text-anchor="middle" class="tm" font-size="9.5">0</text><text x="32.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="47" y="89.0" width="13" height="91.0" class="fb sb"/><text x="53.5" y="195" text-anchor="middle" class="tm" font-size="9.5">1</text><text x="53.5" y="85.0" text-anchor="middle" class="tm" font-size="9">0.70</text><rect x="68" y="116.3" width="13" height="63.7" class="fb sb"/><text x="74.5" y="195" text-anchor="middle" class="tm" font-size="9.5">2</text><text x="74.5" y="112.3" text-anchor="middle" class="tm" font-size="9">0.49</text><rect x="89" y="135.4" width="13" height="44.6" class="fb sb"/><text x="95.5" y="195" text-anchor="middle" class="tm" font-size="9.5">3</text><text x="95.5" y="131.4" text-anchor="middle" class="tm" font-size="9">0.34</text><rect x="110" y="148.8" width="13" height="31.2" class="fb sb"/><text x="116.5" y="195" text-anchor="middle" class="tm" font-size="9.5">4</text><rect x="131" y="158.2" width="13" height="21.8" class="fb sb"/><text x="137.5" y="195" text-anchor="middle" class="tm" font-size="9.5">5</text><rect x="152" y="164.7" width="13" height="15.3" class="fb sb"/><text x="158.5" y="195" text-anchor="middle" class="tm" font-size="9.5">6</text><rect x="173" y="169.3" width="13" height="10.7" class="fb sb"/><text x="179.5" y="195" text-anchor="middle" class="tm" font-size="9.5">7</text><rect x="194" y="172.5" width="13" height="7.5" class="fb sb"/><text x="200.5" y="195" text-anchor="middle" class="tm" font-size="9.5">8</text><text x="120" y="215" text-anchor="middle" class="tm" font-size="10">months after a shock of 1</text><text x="342" y="18" text-anchor="middle" font-size="11.5">MA(1), θ = 0.7</text><line x1="242" y1="180" x2="442" y2="180" stroke="currentColor"/><rect x="248" y="50.0" width="13" height="130.0" class="fr sr"/><text x="254.5" y="195" text-anchor="middle" class="tm" font-size="9.5">0</text><text x="254.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="269" y="89.0" width="13" height="91.0" class="fr sr"/><text x="275.5" y="195" text-anchor="middle" class="tm" font-size="9.5">1</text><text x="275.5" y="85.0" text-anchor="middle" class="tm" font-size="9">0.70</text><rect x="290" y="180.0" width="13" height="0.0" class="fr sr"/><text x="296.5" y="195" text-anchor="middle" class="tm" font-size="9.5">2</text><text x="296.5" y="176.0" text-anchor="middle" class="tm" font-size="9">0.00</text><rect x="311" y="180.0" width="13" height="0.0" class="fr sr"/><text x="317.5" y="195" text-anchor="middle" class="tm" font-size="9.5">3</text><text x="317.5" y="176.0" text-anchor="middle" class="tm" font-size="9">0.00</text><rect x="332" y="180.0" width="13" height="0.0" class="fr sr"/><text x="338.5" y="195" text-anchor="middle" class="tm" font-size="9.5">4</text><rect x="353" y="180.0" width="13" height="0.0" class="fr sr"/><text x="359.5" y="195" text-anchor="middle" class="tm" font-size="9.5">5</text><rect x="374" y="180.0" width="13" height="0.0" class="fr sr"/><text x="380.5" y="195" text-anchor="middle" class="tm" font-size="9.5">6</text><rect x="395" y="180.0" width="13" height="0.0" class="fr sr"/><text x="401.5" y="195" text-anchor="middle" class="tm" font-size="9.5">7</text><rect x="416" y="180.0" width="13" height="0.0" class="fr sr"/><text x="422.5" y="195" text-anchor="middle" class="tm" font-size="9.5">8</text><text x="342" y="215" text-anchor="middle" class="tm" font-size="10">months after a shock of 1</text><text x="564" y="18" text-anchor="middle" font-size="11.5">ARMA(1,1), φ = 0.6, θ = 0.4</text><line x1="464" y1="180" x2="664" y2="180" stroke="currentColor"/><rect x="470" y="50.0" width="13" height="130.0" class="fg sg"/><text x="476.5" y="195" text-anchor="middle" class="tm" font-size="9.5">0</text><text x="476.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="491" y="50.0" width="13" height="130.0" class="fg sg"/><text x="497.5" y="195" text-anchor="middle" class="tm" font-size="9.5">1</text><text x="497.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="512" y="102.0" width="13" height="78.0" class="fg sg"/><text x="518.5" y="195" text-anchor="middle" class="tm" font-size="9.5">2</text><text x="518.5" y="98.0" text-anchor="middle" class="tm" font-size="9">0.60</text><rect x="533" y="133.2" width="13" height="46.8" class="fg sg"/><text x="539.5" y="195" text-anchor="middle" class="tm" font-size="9.5">3</text><text x="539.5" y="129.2" text-anchor="middle" class="tm" font-size="9">0.36</text><rect x="554" y="151.9" width="13" height="28.1" class="fg sg"/><text x="560.5" y="195" text-anchor="middle" class="tm" font-size="9.5">4</text><rect x="575" y="163.2" width="13" height="16.8" class="fg sg"/><text x="581.5" y="195" text-anchor="middle" class="tm" font-size="9.5">5</text><rect x="596" y="169.9" width="13" height="10.1" class="fg sg"/><text x="602.5" y="195" text-anchor="middle" class="tm" font-size="9.5">6</text><rect x="617" y="173.9" width="13" height="6.1" class="fg sg"/><text x="623.5" y="195" text-anchor="middle" class="tm" font-size="9.5">7</text><rect x="638" y="176.4" width="13" height="3.6" class="fg sg"/><text x="644.5" y="195" text-anchor="middle" class="tm" font-size="9.5">8</text><text x="564" y="215" text-anchor="middle" class="tm" font-size="10">months after a shock of 1</text></svg><figcaption>How long a shock of size 1 echoes (the ψ-weights). AR(1): fades geometrically, 0.7, 0.49, 0.34 … and never quite reaches 0. MA(1): one echo of 0.7, then nothing. ARMA(1,1): an MA-like jump, then AR-like fading.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hot cup of chai cooling in a room. Each minute it keeps a fixed fraction of its excess heat (φ) and picks up small random draughts (ε). A disturbance (pouring in hot water) fades geometrically. φ near 1: a thermos, disturbances last long; φ = 1: a perfect thermos, they never fade.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>AR(1)</strong>: w<sub>t</sub> = c + φw<sub>t−1</sub> + ε<sub>t</sub>, ε<sub>t</sub> ~ WN(0, σ²). Stationary iff |φ| &lt; 1; then E[w] = c/(1 − φ), Var(w) = σ²/(1 − φ²), ρ<sub>k</sub> = φ<sup>k</sup>, PACF = φ at lag 1 and 0 after. One-step forecast ŵ<sub>t+1</sub> = c + φw<sub>t</sub>; h steps: the forecast decays toward the mean as φ<sup>h</sup>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting AR to a non-stationary series. On raw sales, a regression of y<sub>t</sub> on y<sub>t−1</sub> gives φ close to 1 (the trend makes them move together), which is the unit-root case: standard errors and forecasts are misleading. Difference first (or let the I in ARIMA do it).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: AR(p).</b> AR(1) uses one month of memory. If two months ago also matters directly, AR(1) misses it. How do we use several past values, and how do we estimate their weights?</div>

  <h2 id="ar-arp"><span class="num">02</span>AR(p): Several Past Values</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> AR(1) assumes everything older than last month matters only through last month. If the shop's months two back also push directly, we need more lags. How do we add them, and how do we estimate their weights without trial and error?</p>
  <h3>The equation</h3>
  <p style="text-align:center"><strong>w<sub>t</sub> = c + φ₁w<sub>t−1</sub> + φ₂w<sub>t−2</sub> + … + φ<sub>p</sub>w<sub>t−p</sub> + ε<sub>t</sub></strong></p>
  <p>Fitting is again a regression on the series' own lags. A neat shortcut, the <strong>Yule-Walker equations</strong>, gets the weights straight from the autocorrelations. Multiply the AR(2) equation by w<sub>t−1</sub> and by w<sub>t−2</sub>, take expectations, divide by the variance:</p>
  <p style="text-align:center">r₁ = φ₁ + φ₂r₁ &nbsp;&nbsp;and&nbsp;&nbsp; r₂ = φ₁r₁ + φ₂</p>
  <p>Two equations, two unknowns. Solving:</p>
  <p style="text-align:center"><strong>φ₁ = r₁(1 − r₂)/(1 − r₁²), &nbsp;&nbsp; φ₂ = (r₂ − r₁²)/(1 − r₁²)</strong></p>
  <p>φ₂ is exactly the PACF(2) formula from the Basics note: the last AR coefficient <em>is</em> the partial autocorrelation. That is why the PACF of an AR(p) cuts off after lag p.</p>
  <h3>By hand on w (training data)</h3>
  <ul>
    <li>r₁ = −0.4043, r₂ = 0.0683, r₁² = 0.1635, 1 − r₁² = 0.8365.</li>
    <li>φ₁ = −0.4043 × (1 − 0.0683)/0.8365 = −0.4043 × 0.9317/0.8365 = <strong>−0.4502</strong>.</li>
    <li>φ₂ = (0.0683 − 0.1635)/0.8365 = <strong>−0.1137</strong>: a small direct lag-2 effect.</li>
    <li>Forecast w for January 2024 from December (0) and November (2): −0.4502 × 0 + (−0.1137) × 2 = <strong>−0.227</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">from statsmodels.regression.linear_model import yule_walker
r = acf(w, nlags=2)
r1, r2 = r[1], r[2]
phi1 = r1 * (1 - r2) / (1 - r1 ** 2)
phi2 = (r2 - r1 ** 2) / (1 - r1 ** 2)
print(f"r1 = {r1:.4f}, r2 = {r2:.4f}")
print(f"Yule-Walker by hand: phi1 = {phi1:.4f}, phi2 = {phi2:.4f}")
print("statsmodels yule_walker:", yule_walker(w.values, order=2, method="mle")[0].round(4).tolist())
# AR(2) one-step forecast of w for Jan 2024 from Dec and Nov 2023
print(f"w_hat Jan 2024 = {phi1:.4f} x {w.iloc[-1]} + ({phi2:.4f}) x {w.iloc[-2]} = {phi1 * w.iloc[-1] + phi2 * w.iloc[-2]:.3f}")
# stationarity: roots of 1 - phi1 z - phi2 z^2 must lie outside the unit circle
roots = np.roots([-phi2, -phi1, 1])
print("roots:", np.round(roots, 3).tolist(), " |root|:", np.round(np.abs(roots), 3).tolist())
print("PACF of an AR(2) (phi 0.5, 0.3):", ArmaProcess(ar=[1, -0.5, -0.3]).pacf(5)[1:].round(3).tolist())</div>
  <div class="fx" data-lang="text">r1 = -0.4043, r2 = 0.0683
Yule-Walker by hand: phi1 = -0.4502, phi2 = -0.1137
statsmodels yule_walker: [-0.4502, -0.1137]
w_hat Jan 2024 = -0.4502 x 0.0 + (-0.1137) x 2.0 = -0.227
roots: [(-1.979+2.208j), (-1.979-2.208j)]  |root|: [2.965, 2.965]
PACF of an AR(2) (phi 0.5, 0.3): [0.714, 0.3, 0.0, -0.0]</div>
  <p>statsmodels' <code>yule_walker</code> reproduces both coefficients. The stationarity check for AR(p) generalises |φ| &lt; 1: the roots of the polynomial 1 − φ₁z − φ₂z² must lie outside the unit circle (|z| &gt; 1). Here both roots have modulus 2.965, comfortably stationary. <code>np.roots</code> takes coefficients from the highest power down, hence <code>[-φ₂, -φ₁, 1]</code>. The theoretical PACF of an AR(2) with φ = (0.5, 0.3) is non-zero at lags 1 and 2 (0.714, 0.300; the lag-2 value equals φ₂) and exactly 0 after: the cut-off at p.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Predicting tomorrow's crowd at the shop from today's and yesterday's crowds. Today matters most, yesterday adds a little on its own (a weekend hangover), and the day before yesterday only matters through them.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>AR(p)</strong>: φ(B)w<sub>t</sub> = c + ε<sub>t</sub> with φ(B) = 1 − φ₁B − … − φ<sub>p</sub>B<sup>p</sup>. Stationary iff all roots of φ(z) = 0 lie outside the unit circle. <strong>Yule-Walker</strong>: ρ<sub>k</sub> = φ₁ρ<sub>k−1</sub> + … + φ<sub>p</sub>ρ<sub>k−p</sub> for k = 1 … p, solved for φ. ACF tails off (mix of decays and damped waves); PACF cuts off after lag p.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checking stationarity of an AR(2) coefficient by coefficient. φ₁ = 0.6 and φ₂ = 0.5 are each below 1, but φ₁ + φ₂ = 1.1 &gt; 1 makes the model explosive. Check the roots (or, for AR(2): φ₁ + φ₂ &lt; 1, φ₂ − φ₁ &lt; 1, |φ₂| &lt; 1).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MA(q).</b> In an AR model every shock echoes forever, fading slowly. But a one-off event, like a promotion month, lifts sales once and is gone the month after. How do we model a shock whose effect stops after a fixed number of months?</div>

  <h2 id="ar-ma"><span class="num">03</span>MA(q): Learning from Past Errors</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> AR models carry every shock forward through the values. Some surprises matter for one month and then vanish completely. How do we build memory of the <em>surprise itself</em>, limited to q months?</p>
  <h3>Plain words and the equation</h3>
  <p>A <strong>moving-average</strong> model (nothing to do with rolling means) says: this value is the mean, plus this month's shock, plus a fraction of last month's shock.</p>
  <p style="text-align:center"><strong>w<sub>t</sub> = μ + ε<sub>t</sub> + θ₁ε<sub>t−1</sub> + … + θ<sub>q</sub>ε<sub>t−q</sub></strong></p>
  <p>The shocks are not observed directly. We recover them as forecast errors: e<sub>t</sub> = w<sub>t</sub> − ŵ<sub>t</sub>, where the forecast uses the previous errors. With θ negative, the model "takes back" part of last month's surprise; with θ positive, it adds a bit more of it.</p>
  <h3>By hand: the error recursion for MA(1) with θ = −0.41</h3>
  <p>Start with e = 0 before the first month. Each month: forecast ŵ = θ × (last error); error e = w − ŵ.</p>
  <table class="tbl">
    <tr><th>month</th><th>w</th><th>forecast = −0.41 × e<sub>prev</sub></th><th>error e = w − forecast</th></tr>
    <tr><td>Feb 2021</td><td>−2</td><td>−0.41 × 0 = 0</td><td>−2 − 0 = −2.000</td></tr>
    <tr><td>Mar 2021</td><td>−1</td><td>−0.41 × (−2) = 0.820</td><td>−1 − 0.820 = −1.820</td></tr>
    <tr><td>Apr 2021</td><td>0</td><td>−0.41 × (−1.82) = 0.746</td><td>0 − 0.746 = −0.746</td></tr>
    <tr><td>May 2021</td><td>−1</td><td>−0.41 × (−0.746) = 0.306</td><td>−1.306</td></tr>
  </table>
  <div class="fx" data-lang="py">theta = -0.41                                       # an MA(1) coefficient (our fitted model gives about this)
e_prev = 0.0                                        # error before the first month: assume 0
rows = []
for date, wt in w.iloc[:5].items():
    w_hat = theta * e_prev + 0.0                    # forecast uses only last month's ERROR
    e_t = wt - w_hat                                # this month's error (the shock)
    rows.append([date.strftime("%b %Y"), wt, round(w_hat, 3), round(e_t, 3)])
    e_prev = e_t
print(pd.DataFrame(rows, columns=["month", "w", "forecast = theta*e_prev", "error e"]).to_string(index=False))
print("theory: MA(1) lag-1 autocorrelation theta/(1+theta^2) =", round(theta / (1 + theta ** 2), 4))
for th in [0.7, -0.41]:
    p = ArmaProcess(ar=[1], ma=[1, th])
    print(f"MA(1) theta={th:+}: ACF {p.acf(5)[1:].round(3).tolist()}  PACF {p.pacf(5)[1:].round(3).tolist()}")
print("MA(2) (0.5, 0.4): ACF", ArmaProcess(ar=[1], ma=[1, 0.5, 0.4]).acf(5)[1:].round(3).tolist())
t2 = 1 / theta                                      # the "mirror" coefficient, -2.439
print("invertible?", ArmaProcess(ma=[1, theta]).isinvertible, f"  theta={t2:.3f} gives the same r1:",
      round(t2 / (1 + t2 ** 2), 4), " invertible?", ArmaProcess(ma=[1, t2]).isinvertible)
sim_ma = ArmaProcess(ar=[1], ma=[1, 0.7]).generate_sample(300, distrvs=np.random.default_rng(4).standard_normal)
print("simulated MA(1), n=300: ACF", acf(sim_ma, nlags=4)[1:].round(2).tolist(),
      " PACF", pacf(sim_ma, nlags=4, method="ywm")[1:].round(2).tolist())</div>
  <div class="fx" data-lang="text">   month    w  forecast = theta*e_prev  error e
Feb 2021 -2.0                    0.000   -2.000
Mar 2021 -1.0                    0.820   -1.820
Apr 2021  0.0                    0.746   -0.746
May 2021 -1.0                    0.306   -1.306
Jun 2021 -1.0                    0.535   -1.535
theory: MA(1) lag-1 autocorrelation theta/(1+theta^2) = -0.351
MA(1) theta=+0.7: ACF [0.47, 0.0, 0.0, 0.0]  PACF [0.47, -0.283, 0.186, -0.126]
MA(1) theta=-0.41: ACF [-0.351, 0.0, 0.0, 0.0]  PACF [-0.351, -0.141, -0.057, -0.024]
MA(2) (0.5, 0.4): ACF [0.496, 0.284, 0.0, 0.0]
invertible? True   theta=-2.439 gives the same r1: -0.351  invertible? False
simulated MA(1), n=300: ACF [0.47, 0.05, -0.02, -0.1]  PACF [0.47, -0.23, 0.09, -0.16]</div>
  <h3>Reading the output</h3>
  <ul>
    <li>The table matches the hand recursion. The forecast for any month after the next is just μ (= 0 here): an MA(1) model has no information beyond one step, because the shocks it remembers are only one month old.</li>
    <li><strong>ACF of MA(1)</strong>: r₁ = θ/(1 + θ²) = −0.41/1.168 = −0.351, then exactly 0. The ACF cuts off after lag q (MA(2): 0.496, 0.284, then 0). The <strong>PACF</strong> tails off instead (0.47, −0.283, 0.186, … for θ = 0.7): the mirror image of AR. The simulated MA(1) shows the same with noise.</li>
    <li><strong>Invertibility</strong>: θ = −0.41 and its mirror θ = 1/(−0.41) = −2.439 produce exactly the same r₁ (−0.351), so data cannot tell them apart. We pick the <strong>invertible</strong> one (|θ| &lt; 1), for which the error recursion above settles down instead of exploding, and the model can be rewritten as an AR(∞) in past values.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper who over-ordered milk last week by 10 litres orders 4 litres less this week to correct (θ = −0.4), then forgets about it. The memory is of the <em>mistake</em>, and it lasts exactly one week. An AR shopkeeper instead remembers last week's <em>sales level</em>, and through it every older week faintly.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MA(q)</strong>: w<sub>t</sub> = μ + θ(B)ε<sub>t</sub> with θ(B) = 1 + θ₁B + … + θ<sub>q</sub>B<sup>q</sup> (statsmodels' sign convention). Always stationary; <strong>invertible</strong> iff the roots of θ(z) = 0 lie outside the unit circle. ACF: non-zero up to lag q, zero after (MA(1): ρ₁ = θ/(1 + θ²), so |ρ₁| ≤ 0.5). PACF tails off.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sign conventions. statsmodels and R write the MA part with plus signs (1 + θB); Box-Jenkins' textbook writes 1 − θB. A "θ = 0.41" in one book is "θ = −0.41" in another. Always check which convention a library uses before interpreting the sign.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ARMA.</b> AR remembers values with a long fading tail; MA remembers surprises for exactly q steps. Real series often have a bit of both. Do we need many AR or many MA terms to fake the other kind?</div>

  <h2 id="ar-arma"><span class="num">04</span>ARMA(p, q): Both Kinds of Memory</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> An MA(1) pattern written as pure AR needs infinitely many lags, and vice versa. Can one small model hold both a short burst and a long fading tail?</p>
  <h3>The equation</h3>
  <p style="text-align:center"><strong>w<sub>t</sub> = c + φ₁w<sub>t−1</sub> + … + φ<sub>p</sub>w<sub>t−p</sub> + ε<sub>t</sub> + θ₁ε<sub>t−1</sub> + … + θ<sub>q</sub>ε<sub>t−q</sub></strong></p>
  <p>The principle of <strong>parsimony</strong> (Box and Jenkins): use the fewest parameters that capture the memory. ARMA(1,1) with two parameters often fits what would need AR(5) or MA(5).</p>
  <h3>By hand: the shock echo of ARMA(1,1)</h3>
  <p>With φ = 0.6 and θ = 0.4, a shock of 1 at month 0 gives ψ₀ = 1, ψ₁ = φ + θ = 1.0 (AR carries it, MA adds 0.4 on top), then ψ₂ = 0.6 × 1.0 = 0.6, ψ₃ = 0.36, ψ₄ = 0.216: an MA-like first step, then AR-like fading. The ACF behaves the same way: from lag 2 on, each bar is φ times the previous.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.arima.model import ARIMA
p = ArmaProcess(ar=[1, -0.6], ma=[1, 0.4])          # ARMA(1,1): phi = 0.6, theta = 0.4
print("ARMA(1,1) ACF ", p.acf(6)[1:].round(3).tolist())
print("ARMA(1,1) PACF", p.pacf(6)[1:].round(3).tolist())
print("ACF ratio r2/r1 =", round(p.acf(3)[2] / p.acf(3)[1], 3), "(= phi: from lag 2 on, each bar is phi x the previous)")
sim = p.generate_sample(400, distrvs=np.random.default_rng(5).standard_normal)
fit = ARIMA(sim, order=(1, 0, 1)).fit()
print("fitted on 400 simulated points:", fit.params.round(3).tolist(), "(const, ar.L1, ma.L1, sigma2)")
print("psi weights (MA(inf) form):", p.arma2ma(5).round(3).tolist())</div>
  <div class="fx" data-lang="text">ARMA(1,1) ACF  [0.756, 0.454, 0.272, 0.163, 0.098]
ARMA(1,1) PACF [0.756, -0.276, 0.109, -0.043, 0.017]
ACF ratio r2/r1 = 0.6 (= phi: from lag 2 on, each bar is phi x the previous)
fitted on 400 simulated points: [-0.182, 0.591, 0.502, 0.918] (const, ar.L1, ma.L1, sigma2)
psi weights (MA(inf) form): [1.0, 1.0, 0.6, 0.36, 0.216]</div>
  <p>Both the ACF (0.756, 0.454, 0.272 …, ratio exactly 0.6 = φ from lag 2) and the PACF (0.756, −0.276, 0.109 …) tail off: neither cuts off, which is how ARMA shows itself in the plots. Fitting <code>ARIMA(sim, order=(1, 0, 1))</code> on 400 simulated points recovers φ ≈ 0.59 and θ ≈ 0.50 (true 0.6 and 0.4: the MA term is the harder one to pin down). <code>arma2ma</code> returns the ψ-weights computed above.</p>
  <table class="tbl"><caption>Identification signatures</caption>
    <tr><th>Model</th><th>ACF</th><th>PACF</th><th>A shock echoes</th></tr>
    <tr><td>AR(p)</td><td>Tails off</td><td>Cuts off after p</td><td>Forever, fading</td></tr>
    <tr><td>MA(q)</td><td>Cuts off after q</td><td>Tails off</td><td>Exactly q steps</td></tr>
    <tr><td>ARMA(p, q)</td><td>Tails off (after lag q)</td><td>Tails off (after lag p)</td><td>Burst, then fading</td></tr>
    <tr><td>White noise</td><td>All ≈ 0</td><td>All ≈ 0</td><td>Not at all</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 680 370" width="680"><text x="95" y="16" text-anchor="middle" class="tm" font-size="11">model</text><text x="285" y="16" text-anchor="middle" class="tm" font-size="11">ACF, lags 1–14</text><text x="545" y="16" text-anchor="middle" class="tm" font-size="11">PACF, lags 1–14</text><text x="95" y="68" text-anchor="middle" font-size="11.5">AR(1) φ=0.7</text><line x1="175" y1="64" x2="405" y2="64" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="32.5" width="9" height="31.5" class="fr sr"/><rect x="195" y="42.0" width="9" height="22.1" class="fr sr"/><rect x="211" y="48.6" width="9" height="15.4" class="fr sr"/><rect x="227" y="53.2" width="9" height="10.8" class="fr sr"/><rect x="243" y="56.4" width="9" height="7.6" class="fr sr"/><rect x="259" y="58.7" width="9" height="5.3" class="fr sr"/><rect x="275" y="60.3" width="9" height="3.7" class="fr sr"/><rect x="291" y="61.4" width="9" height="2.6" class="fr sr"/><rect x="307" y="62.2" width="9" height="1.8" class="fb sb"/><rect x="323" y="62.7" width="9" height="1.3" class="fb sb"/><rect x="339" y="63.1" width="9" height="0.9" class="fb sb"/><rect x="355" y="63.4" width="9" height="0.6" class="fb sb"/><rect x="371" y="63.6" width="9" height="0.6" class="fb sb"/><rect x="387" y="63.7" width="9" height="0.6" class="fb sb"/><line x1="435" y1="64" x2="665" y2="64" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="32.5" width="9" height="31.5" class="fr sr"/><rect x="455" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="471" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="487" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="503" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="519" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="535" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="551" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="567" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="583" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="615" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="631" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="647" y="64.0" width="9" height="0.6" class="fb sb"/><text x="95" y="154" text-anchor="middle" font-size="11.5">MA(1) θ=0.7</text><line x1="175" y1="150" x2="405" y2="150" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="128.9" width="9" height="21.1" class="fr sr"/><rect x="195" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="211" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="227" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="243" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="259" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="275" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="291" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="307" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="323" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="339" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="355" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="371" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="387" y="150.0" width="9" height="0.6" class="fb sb"/><line x1="435" y1="150" x2="665" y2="150" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="128.9" width="9" height="21.1" class="fr sr"/><rect x="455" y="150.0" width="9" height="12.7" class="fr sr"/><rect x="471" y="141.6" width="9" height="8.4" class="fr sr"/><rect x="487" y="150.0" width="9" height="5.7" class="fr sr"/><rect x="503" y="146.1" width="9" height="3.9" class="fr sr"/><rect x="519" y="150.0" width="9" height="2.7" class="fr sr"/><rect x="535" y="148.1" width="9" height="1.9" class="fb sb"/><rect x="551" y="150.0" width="9" height="1.3" class="fb sb"/><rect x="567" y="149.1" width="9" height="0.9" class="fb sb"/><rect x="583" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="149.5" width="9" height="0.6" class="fb sb"/><rect x="615" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="631" y="149.8" width="9" height="0.6" class="fb sb"/><rect x="647" y="150.0" width="9" height="0.6" class="fb sb"/><text x="95" y="240" text-anchor="middle" font-size="11.5">ARMA(1,1)</text><line x1="175" y1="236" x2="405" y2="236" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="202.0" width="9" height="34.0" class="fr sr"/><rect x="195" y="215.6" width="9" height="20.4" class="fr sr"/><rect x="211" y="223.8" width="9" height="12.2" class="fr sr"/><rect x="227" y="228.7" width="9" height="7.3" class="fr sr"/><rect x="243" y="231.6" width="9" height="4.4" class="fr sr"/><rect x="259" y="233.4" width="9" height="2.6" class="fr sr"/><rect x="275" y="234.4" width="9" height="1.6" class="fb sb"/><rect x="291" y="235.0" width="9" height="1.0" class="fb sb"/><rect x="307" y="235.4" width="9" height="0.6" class="fb sb"/><rect x="323" y="235.7" width="9" height="0.6" class="fb sb"/><rect x="339" y="235.8" width="9" height="0.6" class="fb sb"/><rect x="355" y="235.9" width="9" height="0.6" class="fb sb"/><rect x="371" y="235.9" width="9" height="0.6" class="fb sb"/><rect x="387" y="236.0" width="9" height="0.6" class="fb sb"/><line x1="435" y1="236" x2="665" y2="236" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="202.0" width="9" height="34.0" class="fr sr"/><rect x="455" y="236.0" width="9" height="12.4" class="fr sr"/><rect x="471" y="231.1" width="9" height="4.9" class="fr sr"/><rect x="487" y="236.0" width="9" height="2.0" class="fb sb"/><rect x="503" y="235.2" width="9" height="0.8" class="fb sb"/><rect x="519" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="535" y="235.9" width="9" height="0.6" class="fb sb"/><rect x="551" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="567" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="583" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="615" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="631" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="647" y="236.0" width="9" height="0.6" class="fb sb"/><text x="95" y="326" text-anchor="middle" font-size="11.5">airline (θ −0.41, Θ −0.47)</text><line x1="175" y1="322" x2="405" y2="322" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="322.0" width="9" height="15.8" class="fr sr"/><text x="183.5" y="370" text-anchor="middle" class="tm" font-size="9">1</text><rect x="195" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="211" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="227" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="243" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="259" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="275" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="291" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="307" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="323" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="339" y="315.9" width="9" height="6.1" class="fr sr"/><rect x="355" y="322.0" width="9" height="17.3" class="fr sr"/><text x="359.5" y="370" text-anchor="middle" class="tm" font-size="9">12</text><rect x="371" y="315.9" width="9" height="6.1" class="fr sr"/><rect x="387" y="322.0" width="9" height="0.6" class="fb sb"/><line x1="435" y1="322" x2="665" y2="322" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="322.0" width="9" height="15.8" class="fr sr"/><text x="443.5" y="370" text-anchor="middle" class="tm" font-size="9">1</text><rect x="455" y="322.0" width="9" height="6.3" class="fr sr"/><rect x="471" y="322.0" width="9" height="2.6" class="fr sr"/><rect x="487" y="322.0" width="9" height="1.1" class="fb sb"/><rect x="503" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="519" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="535" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="551" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="567" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="583" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="314.9" width="9" height="7.1" class="fr sr"/><rect x="615" y="322.0" width="9" height="14.8" class="fr sr"/><text x="619.5" y="370" text-anchor="middle" class="tm" font-size="9">12</text><rect x="631" y="322.0" width="9" height="5.9" class="fr sr"/><rect x="647" y="322.0" width="9" height="2.4" class="fr sr"/></svg><figcaption>Theoretical ACF and PACF for four models (red: bars clearly non-zero). AR(1): ACF fades, PACF one bar. MA(1): ACF one bar, PACF fades with alternating signs. ARMA(1,1): both fade. Airline model: ACF bars only at lags 1, 11, 12, 13; PACF fades around lags 1 and 12.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rumour in a college hostel. The MA part is the first night's gossip about the event itself; the AR part is people repeating what they heard yesterday, fading each day. ARMA describes both with two numbers.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ARMA(p, q)</strong>: φ(B)w<sub>t</sub> = c + θ(B)ε<sub>t</sub>. Stationary if φ's roots are outside the unit circle; invertible if θ's are. MA(∞) form w<sub>t</sub> = μ + Σψ<sub>j</sub>ε<sub>t−j</sub> with ψ(B) = θ(B)/φ(B): the ψ-weights drive forecast uncertainty (section 12).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Over-parameterising with ARMA(2,2) "to be safe". If AR and MA roots nearly cancel (φ ≈ −θ), the model is not identified: coefficients become huge and unstable with large standard errors while the fit barely changes. Start small; add terms only if residual diagnostics demand it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Integration.</b> Every model so far requires a stationary series. Meera's sales have a trend and a season. How do we use ARMA on them, and turn its forecasts back into sales?</div>

  <h2 id="ar-int"><span class="num">05</span>Integration I(d): Modelling the Changes</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> ARMA assumes a stable mean, but sales keep climbing. The Basics note showed that differencing makes the series stable. How do we build differencing into the model so that forecasts come out in sales, not in differences?</p>
  <h3>Plain words</h3>
  <p>Difference the series d times, fit an ARMA to the differences, forecast the differences, then add them back up ("integrate") to get levels. The I in ARIMA stands for this integration step. The simplest case has no AR and no MA at all: <strong>ARIMA(0,1,0)</strong>, y<sub>t</sub> − y<sub>t−1</sub> = ε<sub>t</sub>, the <strong>random walk</strong>. Its best forecast for every future month is the last value.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.statespace.sarimax import SARIMAX
# ARIMA(0,1,0) = random walk: forecast = last value, for every horizon
rw = SARIMAX(train, order=(0, 1, 0)).fit(disp=False)
print("random walk forecast Jan-Mar 2024:", rw.forecast(3).round(2).tolist())
rwd = ARIMA(train, order=(0, 1, 0), trend="t").fit()   # with d=1, trend "t" = a constant drift per month
print("random walk + drift: drift =", round(rwd.params.iloc[0], 3), " forecast:", rwd.forecast(3).round(2).tolist())
print("average monthly change in train:", round(train.diff().mean(), 3))
# integrating back: forecasts of the CHANGE become forecasts of the LEVEL by a running sum
changes = np.array([1.2, -0.5, 2.0])                # pretend forecasts of diff(1)
print("level forecasts:", (train.iloc[-1] + np.cumsum(changes)).round(1).tolist())</div>
  <div class="fx" data-lang="text">random walk forecast Jan-Mar 2024: [138.0, 138.0, 138.0]
random walk + drift: drift = 0.83  forecast: [138.83, 139.66, 140.49]
average monthly change in train: 0.83
level forecasts: [139.2, 138.7, 140.7]</div>
  <ul>
    <li><strong>Random walk</strong>: forecast 138 (December 2023) for January, February, March: flat. This is the "naive" baseline.</li>
    <li><strong>Random walk with drift</strong>: y<sub>t</sub> − y<sub>t−1</sub> = c + ε<sub>t</sub>. The drift c is estimated as the average monthly change in training, 0.83, so the forecasts climb by 0.83 a month: 138.83, 139.66, 140.49. In <code>ARIMA</code>, with d = 1, <code>trend="t"</code> means a constant in the differenced equation (a drift).</li>
    <li><strong>By hand integration</strong>: if a model forecasts the next three changes as +1.2, −0.5, +2.0, the levels are 138 + 1.2 = 139.2, then 139.2 − 0.5 = 138.7, then 138.7 + 2.0 = 140.7: a running sum starting from the last actual value.</li>
  </ul>
  <p>Why the variance grows: the random walk's level h months ahead is the last value plus h independent shocks, so its forecast variance is h·σ²: intervals widen like √h, forever. That is the price of a unit root, and why ARIMA intervals fan out.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A drunkard's walk home: each step is random, so the best guess of where he will be in ten steps is where he is now (no drift) or a bit further along the road he tends to drift toward (with drift), and the uncertainty about his position keeps growing with every step.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Integrated of order d</strong>, I(d): a series that becomes stationary after d differences. <strong>ARIMA(p, d, q)</strong> = ARMA(p, q) on (1 − B)<sup>d</sup>y<sub>t</sub>. A constant in the differenced equation becomes a drift (d = 1) or a quadratic trend (d = 2) in the levels.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Including a constant by habit when d + D ≥ 2. A constant in a twice-differenced model implies a quadratic trend in sales, which forecasts explosive growth. statsmodels SARIMAX defaults to no trend; when d + D = 1, consider a drift only if the differenced series has a clearly non-zero mean.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ARIMA Notation.</b> Combining differences, AR terms and MA terms by hand already gives long equations. We need a compact way to write and manipulate the whole model.</div>

  <h2 id="ar-notation"><span class="num">06</span>ARIMA(p, d, q) Notation and the Backshift Operator</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> How do we write "difference once, then AR(1) and MA(1)" as one short formula that we can expand, compare and give to software?</p>
  <h3>The backshift operator</h3>
  <p>B shifts a series back one step: B·y<sub>t</sub> = y<sub>t−1</sub>, B²y<sub>t</sub> = y<sub>t−2</sub>. With it, a difference is (1 − B)y<sub>t</sub>, an AR polynomial is φ(B) = 1 − φ₁B − … − φ<sub>p</sub>B<sup>p</sup>, and an MA polynomial is θ(B) = 1 + θ₁B + … + θ<sub>q</sub>B<sup>q</sup>. Polynomials in B multiply like ordinary polynomials.</p>
  <p style="text-align:center"><strong>ARIMA(p, d, q): φ(B)(1 − B)<sup>d</sup>y<sub>t</sub> = c + θ(B)ε<sub>t</sub></strong></p>
  <h3>By hand: expanding ARIMA(1,1,1)</h3>
  <p>(1 − φB)(1 − B)y<sub>t</sub> = (1 + θB)ε<sub>t</sub>. Multiply out the left: (1 − (1 + φ)B + φB²)y<sub>t</sub> = y<sub>t</sub> − (1 + φ)y<sub>t−1</sub> + φy<sub>t−2</sub>. So</p>
  <p style="text-align:center">y<sub>t</sub> = (1 + φ)y<sub>t−1</sub> − φy<sub>t−2</sub> + ε<sub>t</sub> + θε<sub>t−1</sub></p>
  <p>With φ = 0.5, θ = −0.3, last month's sales 138, the month before 141, and last month's error 2: ŷ = 1.5 × 138 − 0.5 × 141 + (−0.3) × 2 = 207 − 70.5 − 0.6 = 135.9.</p>
  <table class="tbl"><caption>Famous special cases</caption>
    <tr><th>Model</th><th>Equation</th><th>Forecast behaviour</th></tr>
    <tr><td>ARIMA(0,0,0)</td><td>y<sub>t</sub> = c + ε<sub>t</sub></td><td>Flat at the mean (white noise)</td></tr>
    <tr><td>ARIMA(0,1,0)</td><td>y<sub>t</sub> = y<sub>t−1</sub> + ε<sub>t</sub></td><td>Naive: last value (random walk)</td></tr>
    <tr><td>ARIMA(0,1,0) + c</td><td>y<sub>t</sub> = c + y<sub>t−1</sub> + ε<sub>t</sub></td><td>Straight line from the last value (drift)</td></tr>
    <tr><td>ARIMA(0,1,1)</td><td>y<sub>t</sub> = y<sub>t−1</sub> + ε<sub>t</sub> + θε<sub>t−1</sub></td><td>Same as simple exponential smoothing with α = 1 + θ (<a class="xref" data-note="ml_ets_prophet">ETS</a>)</td></tr>
    <tr><td>ARIMA(0,2,2)</td><td>second differences, MA(2)</td><td>Same as Holt's linear trend</td></tr>
    <tr><td>ARIMA(p,0,0)</td><td>AR(p)</td><td>Decays to the mean</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chemical formulas: H₂O says "two hydrogens, one oxygen" without drawing the molecule. ARIMA(1,1,1) says "one AR lag, one difference, one MA lag" without writing the expanded equation; B-polynomials are the rules for drawing it when needed.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ARIMA(p, d, q)</strong>: φ(B)(1 − B)<sup>d</sup>y<sub>t</sub> = c + θ(B)ε<sub>t</sub> with p = AR order (past values), d = number of differences, q = MA order (past errors). φ(B) must have roots outside the unit circle (stationarity of the differenced series) and θ(B) too (invertibility).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading "ARIMA(1,1,1)" as "AR(1) on y". The AR and MA parts act on the <em>differenced</em> series; the expanded level equation has coefficient 1 + φ on y<sub>t−1</sub>, not φ. Interpreting φ as "this month = 0.5 × last month's sales" is wrong.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SARIMA.</b> Meera's strongest pattern repeats every 12 months. Catching memory at lag 12 with ordinary AR terms would need φ₁ … φ₁₂, mostly useless. How do we model seasonal memory cheaply?</div>

  <h2 id="ar-sarima"><span class="num">07</span>SARIMA: Seasonal Terms</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The ACF of w had a spike at lag 12 (−0.31): a surprise in one November is partly reversed the next November. How do we add memory at multiples of 12 without twelve extra parameters?</p>
  <h3>Plain words</h3>
  <p>Apply the same AR, I and MA ideas at the seasonal lag s: seasonal differencing (1 − B<sup>s</sup>)<sup>D</sup>, seasonal AR terms Φ(B<sup>s</sup>) = 1 − Φ₁B<sup>s</sup> − …, seasonal MA terms Θ(B<sup>s</sup>) = 1 + Θ₁B<sup>s</sup> + … . The seasonal and ordinary polynomials are <strong>multiplied</strong>:</p>
  <p style="text-align:center"><strong>SARIMA(p, d, q)(P, D, Q)<sub>s</sub>: φ(B)Φ(B<sup>s</sup>)(1 − B)<sup>d</sup>(1 − B<sup>s</sup>)<sup>D</sup>y<sub>t</sub> = θ(B)Θ(B<sup>s</sup>)ε<sub>t</sub></strong></p>
  <h3>By hand: the airline model</h3>
  <p>SARIMA(0,1,1)(0,1,1)<sub>12</sub>, first fitted by Box and Jenkins to airline passenger counts, is the classic model for monthly data with trend and season:</p>
  <p style="text-align:center">(1 − B)(1 − B<sup>12</sup>)y<sub>t</sub> = (1 + θB)(1 + ΘB<sup>12</sup>)ε<sub>t</sub></p>
  <p>Expand both sides. Left: y<sub>t</sub> − y<sub>t−1</sub> − y<sub>t−12</sub> + y<sub>t−13</sub> (that is w). Right: ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub>. The multiplication creates a lag-13 term with coefficient θΘ; with θ = −0.41 and Θ = −0.47 it is 0.1927. So</p>
  <p style="text-align:center"><strong>y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub></strong></p>
  <p>Its ACF: r₁ = θ/(1 + θ²) = −0.351, r₁₂ = Θ/(1 + Θ²) = −0.385, and the product term makes r₁₁ = r₁₃ = r₁ × r₁₂ = +0.135. Everything else is 0. Compare with Meera's actual ACF: −0.41 at 1, −0.31 at 12, +0.28 at 11: the same fingerprint.</p>
  <div class="fx" data-lang="py">th, Th = -0.41, -0.47
ma_poly = np.polymul([Th] + [0] * 11 + [1], [th, 1])[::-1]   # (1 + th B)(1 + Th B^12), lowest power first
print("MA polynomial coefficients at lags 0, 1, 12, 13:", ma_poly[[0, 1, 12, 13]].round(4).tolist())
r = ArmaProcess(ar=[1], ma=ma_poly).acf(15)
print("theoretical ACF lags 1, 2, 11, 12, 13, 14:", r[[1, 2, 11, 12, 13, 14]].round(3).tolist())
print("by hand: r1 =", round(th / (1 + th ** 2), 3), " r12 =", round(Th / (1 + Th ** 2), 3),
      " r11 = r13 = r1 x r12 =", round(th / (1 + th ** 2) * Th / (1 + Th ** 2), 3))</div>
  <div class="fx" data-lang="text">MA polynomial coefficients at lags 0, 1, 12, 13: [1.0, -0.41, -0.47, 0.1927]
theoretical ACF lags 1, 2, 11, 12, 13, 14: [-0.351, 0.0, 0.135, -0.385, 0.135, 0.0]
by hand: r1 = -0.351  r12 = -0.385  r11 = r13 = r1 x r12 = 0.135</div>
  <p><code>np.polymul</code> multiplies the two polynomials (written highest power first, then reversed); the coefficients at lags 1, 12, 13 are −0.41, −0.47 and 0.1927 as computed. The theoretical ACF matches the hand formulas at every lag shown.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two calendars hanging side by side: a monthly one ("last month was unusual, adjust a little") and a yearly one ("last November was unusual, adjust this November"). Multiplying the polynomials is how the two calendars interact: a surprise in last November's month-to-month change also echoes at lag 13.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Seasonal orders</strong> (P, D, Q, s): P seasonal AR terms at lags s, 2s, …; D seasonal differences; Q seasonal MA terms; s the period. statsmodels: <code>SARIMAX(y, order=(p, d, q), seasonal_order=(P, D, Q, s))</code>; parameters <code>ar.S.L12</code>, <code>ma.S.L12</code>. Seasonal signatures: ACF spike at s (and multiples cut off) → seasonal MA; PACF spike at s → seasonal AR.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a seasonal model with too little data. Seasonal parameters are estimated from year-to-year comparisons: four training years give only three seasonal differences per calendar month. Θ = −0.47 here has a standard error of 0.29. With fewer than three or four full seasons, prefer a simpler seasonal treatment (seasonal naive, dummies, or ETS).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Identification.</b> We now have a large family of models. Which p, d, q, P, D, Q should we try for Meera's shop, using only the training data?</div>

  <h2 id="ar-ident"><span class="num">08</span>Identification: Choosing d, D, p, q, P, Q</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The family has six orders to choose. Which values does the shop's training data suggest, and how much do the plots really tell us?</p>
  <div class="flow"><span>Plot; log if swing grows</span><span>Choose D (season) and d (trend)</span><span>ACF/PACF of the stationary series</span><span>Propose a few small models</span><span>Compare by AIC</span><span>Check residuals</span><span>Forecast</span></div>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import adfuller
for name, s in [("train", train), ("diff(1)", train.diff()), ("diff(12)", train.diff(12)), ("both", w)]:
    print(f"{name:9s} ADF p = {adfuller(s.dropna())[1]:.3f}")
print("ACF  of w, lags 1-13:", acf(w, nlags=13)[1:].round(2).tolist())
print("PACF of w, lags 1-13:", pacf(w, nlags=13, method="ywm")[1:].round(2).tolist())
print("95% band: +/-", round(1.96 / np.sqrt(len(w)), 3))
print("ACF of diff(1) only at lags 12 and 24:", acf(train.diff().dropna(), nlags=24)[[12, 24]].round(2).tolist())</div>
  <div class="fx" data-lang="text">train     ADF p = 0.995
diff(1)   ADF p = 0.001
diff(12)  ADF p = 0.026
both      ADF p = 0.000
ACF  of w, lags 1-13: [-0.4, 0.07, 0.06, 0.21, -0.19, -0.03, 0.28, -0.11, -0.09, -0.13, 0.27, -0.33, -0.02]
PACF of w, lags 1-13: [-0.4, -0.11, 0.05, 0.32, 0.04, -0.17, 0.18, 0.08, -0.07, -0.35, -0.02, -0.1, -0.14]
95% band: +/- 0.331
ACF of diff(1) only at lags 12 and 24: [0.61, 0.32]</div>
  <h3>Reading the evidence</h3>
  <ul>
    <li><strong>d and D</strong>: raw training sales fail ADF (p = 0.995). On these 48 months each single difference passes ADF, but diff(1) still has autocorrelation 0.61 at lag 12 and 0.32 at lag 24: the yearly pattern is untouched, so D = 1. diff(12) alone passes only narrowly (p = 0.026) and its yearly growth wandered (Basics: 3.8 vs 14.5 between halves), so we also take d = 1. Both together: p = 0.000. This agrees with the full-series tests in the Basics note.</li>
    <li><strong>Non-seasonal part</strong>: ACF −0.40 at lag 1, then small (0.07, 0.06): cut-off after lag 1 → <strong>q = 1</strong>. But the PACF is −0.40 then −0.11, 0.05: also a cut-off after lag 1 → <strong>p = 1</strong> is equally plausible. Both are candidates.</li>
    <li><strong>Seasonal part</strong>: ACF at lag 12 is −0.33, at the edge of the wide ±0.331 band (35 values only); PACF at 12 is −0.10. A seasonal MA (Q = 1) is suggested, a seasonal AR (P = 1) is a fallback.</li>
    <li>Bars near the band at lags 4, 7, 10 and 11 (only the PACF at lag 10 actually crosses it) are what chance produces among 26 bars on 35 points; no simple model explains them, so we ignore them.</li>
  </ul>
  <p>Candidates: (0,1,1)(0,1,1)<sub>12</sub> (airline), (1,1,0)(0,1,1)<sub>12</sub>, plus their seasonal-AR cousins and slightly larger models.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's first examination: temperature and blood test suggest two or three possible illnesses, not a single diagnosis. ACF/PACF are the examination; AIC and the residual checks are the further tests that decide.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Box-Jenkins method</strong>: (1) identification: transform and difference to stationarity, read ACF/PACF to propose orders; (2) estimation: fit by maximum likelihood; (3) diagnostic checking: residuals must be white noise; iterate if not; (4) forecasting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing orders by looking at the test year or at the full series' ACF. Every identification step here used only 2020–2023 (w has 35 values, not 47). Choices made with test data quietly overfit the test and the reported error is too optimistic.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: AIC &amp; BIC.</b> The plots leave at least two equally plausible readings. We need a single number that scores each candidate's fit while penalising extra parameters.</div>

  <h2 id="ar-aic"><span class="num">09</span>AIC and BIC: Choosing Between Candidates</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> AR(1) or MA(1)? Seasonal AR or seasonal MA? A bigger model always fits the training data at least as well, so "best fit" would always pick the biggest. How do we reward fit and punish complexity in one score?</p>
  <h3>Plain words</h3>
  <p>The <strong>log-likelihood</strong> log L measures how probable the observed data are under the fitted model: higher is better fit. <strong>AIC</strong> (Akaike Information Criterion) turns it into a cost and adds 2 per parameter; <strong>BIC</strong> (Bayesian IC) adds ln(n) per parameter, a harsher penalty once n &gt; 7. Lower is better for both.</p>
  <p style="text-align:center"><strong>AIC = −2 log L + 2k &nbsp;&nbsp;&nbsp; BIC = −2 log L + k ln n</strong></p>
  <p>k counts every estimated parameter, including the noise variance σ². n is the number of observations the likelihood actually uses.</p>
  <h3>By hand for the airline model</h3>
  <p>log L = −97.704, k = 3 (θ, Θ, σ²), n = 35 (48 months minus the 13 lost to differencing): AIC = 195.408 + 6 = <strong>201.41</strong>; BIC = 195.408 + 3 × ln 35 = 195.408 + 10.666 = <strong>206.07</strong>.</p>
  <div class="fx" data-lang="py">rows = []
for order in [(1, 1, 0), (0, 1, 1), (1, 1, 1), (2, 1, 0)]:
    for sorder in [(0, 1, 0, 12), (0, 1, 1, 12), (1, 1, 0, 12)]:
        r = SARIMAX(train, order=order, seasonal_order=sorder).fit(disp=False)
        rows.append([str(order), str(sorder), len(r.params), round(r.llf, 2), round(r.aic, 1), round(r.bic, 1)])
grid = pd.DataFrame(rows, columns=["order", "seasonal", "k", "loglik", "AIC", "BIC"]).sort_values("AIC")
print(grid.to_string(index=False))
air = SARIMAX(train, order=(0, 1, 1), seasonal_order=(0, 1, 1, 12)).fit(disp=False)
k, n = len(air.params), air.nobs_effective
print(f"airline by hand: AIC = -2 x ({air.llf:.3f}) + 2 x {k} = {-2 * air.llf + 2 * k:.2f}")
print(f"                 BIC = -2 x ({air.llf:.3f}) + {k} x ln({n}) = {-2 * air.llf + k * np.log(n):.2f}")</div>
  <div class="fx" data-lang="text">    order      seasonal  k  loglik   AIC   BIC
(1, 1, 0) (1, 1, 0, 12)  3  -97.61 201.2 205.9
(1, 1, 0) (0, 1, 1, 12)  3  -97.67 201.3 206.0
(0, 1, 1) (1, 1, 0, 12)  3  -97.63 201.3 205.9
(0, 1, 1) (0, 1, 1, 12)  3  -97.70 201.4 206.1
(2, 1, 0) (0, 1, 1, 12)  4  -97.27 202.5 208.8
(2, 1, 0) (1, 1, 0, 12)  4  -97.23 202.5 208.7
(1, 1, 1) (1, 1, 0, 12)  4  -97.30 202.6 208.8
(1, 1, 1) (0, 1, 1, 12)  4  -97.36 202.7 208.9
(1, 1, 0) (0, 1, 0, 12)  2 -100.17 204.3 207.5
(0, 1, 1) (0, 1, 0, 12)  2 -100.36 204.7 207.8
(2, 1, 0) (0, 1, 0, 12)  3  -99.94 205.9 210.6
(1, 1, 1) (0, 1, 0, 12)  3 -100.02 206.0 210.7
airline by hand: AIC = -2 x (-97.704) + 2 x 3 = 201.41
                 BIC = -2 x (-97.704) + 3 x ln(35) = 206.07</div>
  <h3>Reading the table</h3>
  <ul>
    <li>The four three-parameter models with one non-seasonal and one seasonal term are within 0.2 AIC of each other (201.2 to 201.4). An AIC difference below about 2 is not meaningful evidence: these models are a <strong>tie</strong>, as the ambiguous ACF/PACF predicted.</li>
    <li>Every model without a seasonal term is clearly worse (204.3 or more; log L about 2.5 lower): the lag-12 memory is real, even though its ACF bar only touched the band.</li>
    <li>Adding a second parameter (2,1,0) or (1,1,1) raises log L slightly (−97.27 vs −97.61) but not by enough to pay the penalty: AIC goes up by about 1.3.</li>
    <li>We choose the <strong>airline model</strong> (0,1,1)(0,1,1)<sub>12</sub>: tied on AIC, the standard, best-studied model for this kind of series, and its MA form fits the "give back last month's surprise" story. (Section 14 shows the tie was hiding something.)</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing a cricket squad: each extra player may add a few runs, but costs a salary. AIC is "runs minus a fixed salary per player"; BIC charges a higher salary, so it picks smaller squads.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>AIC</strong> = −2 log L + 2k estimates relative out-of-sample prediction error (Kullback-Leibler); <strong>AICc</strong> = AIC + 2k(k + 1)/(n − k − 1) corrects it for small n (here 201.41 + 24/31 = 202.18); <strong>BIC</strong> = −2 log L + k ln n is consistent (picks the true model as n grows, if it is among the candidates). <strong>HQIC</strong> uses 2k ln ln n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing AIC across different d or D. Differencing changes the data the likelihood is computed on (35 vs 47 vs 48 values), so AICs of models with different differencing are not comparable. Choose d and D first (tests, plots), then compare p, q, P, Q by AIC; compare different d by out-of-sample error instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Fitting &amp; the Summary.</b> AIC picked a model shape. What exactly did the fitted model learn, how certain are its coefficients, and what is the software's summary table telling us?</div>

  <h2 id="ar-summary"><span class="num">10</span>Fitting with statsmodels and Reading the Summary</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have chosen the airline model. What values of θ, Θ and σ² best explain the training data, how sure are we of each, and what do the other numbers in the output mean?</p>
  <h3>How the fitting works</h3>
  <p>statsmodels' <code>SARIMAX</code> writes the model in <strong>state-space form</strong> and runs the <strong>Kalman filter</strong>, which produces for every month the one-step forecast and its error. The log-likelihood is computed from those errors (normal distribution), and an optimiser adjusts θ, Θ, σ² to maximise it: <strong>maximum likelihood estimation</strong>. For pure AR models this is close to least squares; MA terms make the errors depend on the parameters, so there is no closed form.</p>
  <div class="fx" data-lang="py">print(air.summary())</div>
  <div class="fx" data-lang="text">                                     SARIMAX Results                                      
==========================================================================================
Dep. Variable:                              sales   No. Observations:                   48
Model:             SARIMAX(0, 1, 1)x(0, 1, 1, 12)   Log Likelihood                 -97.704
Date:                            Mon, 19 Oct 2026   AIC                            201.407
Time:                                    14:35:29   BIC                            206.073
Sample:                                01-01-2020   HQIC                           203.018
                                     - 12-01-2023                                         
Covariance Type:                              opg                                         
==============================================================================
                 coef    std err          z      P&gt;|z|      [0.025      0.975]
------------------------------------------------------------------------------
ma.L1         -0.4115      0.145     -2.839      0.005      -0.695      -0.127
ma.S.L12      -0.4723      0.288     -1.641      0.101      -1.036       0.092
sigma2        14.2172      2.621      5.425      0.000       9.081      19.353
===================================================================================
Ljung-Box (L1) (Q):                   0.29   Jarque-Bera (JB):                 9.26
Prob(Q):                              0.59   Prob(JB):                         0.01
Heteroskedasticity (H):               1.16   Skew:                            -0.73
Prob(H) (two-sided):                  0.80   Kurtosis:                         5.05
===================================================================================

Warnings:
[1] Covariance matrix calculated using the outer product of gradients (complex-step).</div>
  <h3>Line by line</h3>
  <table class="tbl">
    <tr><th>Line</th><th>Value</th><th>Meaning</th></tr>
    <tr><td>No. Observations</td><td>48</td><td>Training months given; the likelihood effectively uses 35 after the 13 lost to differencing.</td></tr>
    <tr><td>Model</td><td>SARIMAX(0, 1, 1)x(0, 1, 1, 12)</td><td>The airline model.</td></tr>
    <tr><td>Log Likelihood</td><td>−97.704</td><td>log L at the best parameters.</td></tr>
    <tr><td>AIC / BIC / HQIC</td><td>201.407 / 206.073 / 203.018</td><td>As computed by hand in section 09.</td></tr>
    <tr><td>Covariance Type: opg</td><td>–</td><td>Standard errors from the outer product of gradients (fast, approximate).</td></tr>
    <tr><td>ma.L1 coef, std err</td><td>−0.4115, 0.145</td><td>θ: 41% of last month's surprise is given back this month. Standard error 0.145.</td></tr>
    <tr><td>z, P&gt;|z|</td><td>−2.839, 0.005</td><td>z = coef / std err = −0.4115/0.145. p = 0.005: clearly non-zero.</td></tr>
    <tr><td>[0.025 0.975]</td><td>−0.695, −0.127</td><td>95% confidence interval: coef ± 1.96 × std err.</td></tr>
    <tr><td>ma.S.L12</td><td>−0.4723, p 0.101</td><td>Θ: 47% of last year's same-month surprise is given back. Not significant at 5% (interval −1.04 to 0.09): four years are little data for a yearly parameter, yet AIC preferred keeping it.</td></tr>
    <tr><td>sigma2</td><td>14.2172</td><td>Variance of the one-step errors: typical error √14.2 = 3.77 thousand.</td></tr>
    <tr><td>Ljung-Box (L1) (Q), Prob(Q)</td><td>0.29, 0.59</td><td>Test of residual autocorrelation at lag 1: no evidence left (section 11).</td></tr>
    <tr><td>Jarque-Bera (JB), Prob(JB)</td><td>9.26, 0.01</td><td>Test of residual normality (combining skew and kurtosis): <strong>rejected</strong>, residuals are not normal.</td></tr>
    <tr><td>Skew, Kurtosis</td><td>−0.73, 5.05</td><td>Normal values are 0 and 3: a long left tail and too many extreme errors.</td></tr>
    <tr><td>Heteroskedasticity (H), Prob(H)</td><td>1.16, 0.80</td><td>Ratio of residual variance in the last third to the first third; 1.16 is not significantly different from 1: stable variance.</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A medical report: the top block is the patient's ID (model, sample, scores), the middle block the measurements with their normal ranges (coefficients with intervals), the bottom block the screening tests (residual checks). A good doctor reads all three blocks, not just the middle.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Maximum likelihood</strong>: parameters that maximise log L = −½ Σ<sub>t</sub> [ln(2πF<sub>t</sub>) + v<sub>t</sub>²/F<sub>t</sub>], where v<sub>t</sub> is the one-step forecast error and F<sub>t</sub> its variance from the Kalman filter. <strong>z-test</strong> per coefficient: z = estimate / standard error, approximately standard normal (see <a class="xref" data-note="ml_regression">Linear Regression</a> for the same table in OLS).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Dropping a term only because its p-value is above 0.05. Θ has p = 0.10, yet removing it raises AIC by 3.3 (201.4 → 204.7). In forecasting, judge terms by AIC and residual diagnostics and out-of-sample error, not by significance alone. Also ignore the "EstimationWarning" about starting parameters with short seasonal series: it concerns the optimiser's starting point, not the result.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Residual Diagnostics.</b> The summary hints that residuals are uncorrelated at lag 1 but not normal. A model is adequate only if it has used all the memory in the data: are the residuals white noise at all lags, and what are the big ones?</div>

  <h2 id="ar-diag"><span class="num">11</span>Residual Diagnostics and the Ljung-Box Test</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> If the model captured all the memory, the one-step errors should be white noise: no autocorrelation, constant variance, ideally normal. Checking each ACF bar of the residuals one at a time invites false alarms. Is there one test for "no autocorrelation up to lag h"?</p>
  <h3>The Ljung-Box statistic</h3>
  <p>Add up the squared residual autocorrelations of the first h lags, each weighted for its sample size:</p>
  <p style="text-align:center"><strong>Q(h) = n(n + 2) Σ<sub>k=1..h</sub> r<sub>k</sub>² / (n − k)</strong></p>
  <p>If the residuals are white noise, Q follows a chi-square distribution with h degrees of freedom (minus the number of ARMA parameters, by a common correction). Large Q means some autocorrelation is left: the model missed memory.</p>
  <h3>By hand for h = 3</h3>
  <p>Residual autocorrelations (35 usable months): r₁ = −0.0713, r₂ = 0.0948, r₃ = 0.1066.</p>
  <ul>
    <li>r₁²/34 = 0.005084/34 = 0.00015; r₂²/33 = 0.008987/33 = 0.00027; r₃²/32 = 0.011364/32 = 0.00036.</li>
    <li>Sum = 0.000777; × 35 × 37 = 1,295 → <strong>Q(3) = 1.006</strong>.</li>
    <li>Chi-square with 3 degrees of freedom: 95% cut-off 7.81; p = 0.80. No evidence of leftover autocorrelation.</li>
  </ul>
  <div class="fx" data-lang="py">from statsmodels.stats.diagnostic import acorr_ljungbox
res = air.resid[13:]                                # first 13 residuals are start-up artefacts (d + 12D)
n = len(res)
rk = acf(res, nlags=3)[1:]
terms = [rk[k - 1] ** 2 / (n - k) for k in (1, 2, 3)]
print("residual ACF lags 1-3:", rk.round(4).tolist(), " n =", n)
print(f"Q(3) = {n}x{n + 2} x ({' + '.join(f'{t:.5f}' for t in terms)}) = {n * (n + 2) * sum(terms):.3f}")
print(acorr_ljungbox(res, lags=[3, 6, 12]).round(3))
print("residual mean:", round(res.mean(), 3), "  std:", round(res.std(), 3), "  sqrt(sigma2):", round(np.sqrt(air.params["sigma2"]), 3))
big = res.abs().sort_values(ascending=False).head(4).index
print(pd.DataFrame({"resid": res[big].round(2), "promo": shop.promo[big]}))</div>
  <div class="fx" data-lang="text">residual ACF lags 1-3: [-0.0713, 0.0948, 0.1066]  n = 35
Q(3) = 35x37 x (0.00015 + 0.00027 + 0.00036) = 1.006
    lb_stat  lb_pvalue
3     1.006      0.800
6     2.731      0.842
12    7.942      0.790
residual mean: -0.194   std: 3.969   sqrt(sigma2): 3.771
            resid  promo
2022-04-01 -12.46      0
2021-10-01  -9.96      0
2023-05-01   7.76      1
2023-01-01   6.20      0</div>
  <h3>Reading the output</h3>
  <ul>
    <li>The first 13 residuals are dropped: the model cannot form proper one-step errors until it has 13 months of history (d + sD = 1 + 12), and statsmodels fills those with large start-up values.</li>
    <li>Ljung-Box p = 0.80, 0.84, 0.79 at 3, 6 and 12 lags: <strong>no autocorrelation left</strong>. The model used the memory.</li>
    <li>Residual mean −0.19 (≈ 0) and std 3.97, close to √σ² = 3.77: consistent.</li>
    <li>But the largest errors tell a story. April 2022 (−12.5): in 2020, 2021 and 2024 April had the spring offer; in 2022 it ran in March, and the model, which learnt "April is high" from earlier Aprils, over-forecast. October 2021 (−10.0): the one October without the Diwali offer. May 2023 (+7.8): an offer in an unusual month. These are the heavy tails that failed the Jarque-Bera test: the promotions are not noise, they are information the model does not have.</li>
  </ul>
  <table class="tbl"><caption>The residual checklist</caption>
    <tr><th>Check</th><th>Tool</th><th>Shop</th><th>If it fails</th></tr>
    <tr><td>No autocorrelation</td><td>Ljung-Box, residual ACF</td><td>p 0.80: pass</td><td>Add AR/MA or seasonal terms</td></tr>
    <tr><td>Mean ≈ 0</td><td>mean of residuals</td><td>−0.19: pass</td><td>Add a constant / drift</td></tr>
    <tr><td>Constant variance</td><td>H test, plot</td><td>H 1.16, p 0.80: pass</td><td>Log / Box-Cox; GARCH for volatility</td></tr>
    <tr><td>Normality</td><td>Jarque-Bera, Q-Q plot</td><td>p 0.01: fail</td><td>Find the outliers' cause; intervals may be off</td></tr>
  </table>
  <p>In code, <code>air.plot_diagnostics()</code> draws the four standard plots (residuals over time, histogram with density, normal Q-Q, residual correlogram).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Squeezing a lemon: when the model has extracted all the juice (memory), what is left in your hand is dry pulp with no pattern. If you can still squeeze drops out (autocorrelation), keep squeezing (add terms). Odd lumps in the pulp (outliers) mean something else got into the lemon.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ljung-Box test</strong>: H₀: residual autocorrelations at lags 1 … h are all zero. Q(h) = n(n + 2)Σ r<sub>k</sub>²/(n − k) ~ χ²(h − p − q) under H₀ (statsmodels' <code>acorr_ljungbox(..., model_df=p+q)</code> applies the correction). Small p → model inadequate. (Box-Pierce is the older version n·Σr<sub>k</sub>².)</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Passing Ljung-Box does not make a model good. It says "no linear memory left", not "accurate forecasts" or "right model". Residuals can be uncorrelated yet huge, or driven by a missing variable, exactly as here. Always look at the biggest residuals and ask why.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Forecasts &amp; Intervals.</b> The model is adequate in the white-noise sense. What does it predict for 2024, how is each forecast actually computed, and how wide is the uncertainty?</div>

  <h2 id="ar-forecast"><span class="num">12</span>Forecasts and Prediction Intervals by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have an equation and fitted numbers. How does the model turn the last months of 2023 into a forecast for January 2024, and why do the intervals get wider for later months?</p>
  <h3>By hand: January 2024</h3>
  <p>From section 07, the airline model in levels is y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub>. For a forecast, the future shock ε<sub>t</sub> is replaced by its expected value 0, and past shocks by the model's past one-step errors e.</p>
  <ul>
    <li><strong>Base</strong> (the seasonal-naive-with-growth part): y<sub>Dec 2023</sub> + y<sub>Jan 2023</sub> − y<sub>Dec 2022</sub> = 138 + 125 − 126 = 137. "Last month, plus last year's January-over-December change."</li>
    <li><strong>MA correction</strong>: θ·e<sub>Dec 2023</sub> + Θ·e<sub>Jan 2023</sub> + θΘ·e<sub>Dec 2022</sub> = −0.4115 × 2.179 + (−0.4723) × 6.198 + 0.1943 × 4.033 = −0.897 − 2.927 + 0.784 = −3.040. January 2023 was 6.2 above what the model expected; the model assumes about half of that was a one-off and takes it back.</li>
    <li><strong>Forecast</strong> = 137 − 3.040 = <strong>133.96</strong>. Actual January 2024: 133.</li>
  </ul>
  <h3>By hand: the interval</h3>
  <p>The one-step error is the single new shock ε, with variance σ² = 14.22: a 95% interval is ±1.96 × √14.22 = ±7.39. Two steps ahead, the forecast also misses next month's shock, which reaches month 2 with weight ψ₁ = 1 + θ (one from the integration, θ from the MA term): variance σ²(1 + ψ₁²) = 14.22 × (1 + 0.5885²) → standard error 4.375. In general, var<sub>h</sub> = σ²(ψ₀² + ψ₁² + … + ψ<sub>h−1</sub>²) with the ψ-weights of the whole model including its differences, so intervals keep widening.</p>
  <div class="fx" data-lang="py">th, Th, s2 = air.params["ma.L1"], air.params["ma.S.L12"], air.params["sigma2"]
e = air.resid
# Jan 2024 = Dec 2023 + Jan 2023 - Dec 2022 + th*e(Dec 2023) + Th*e(Jan 2023) + th*Th*e(Dec 2022)
base = train.iloc[-1] + train.iloc[-12] - train.iloc[-13]
ma_part = th * e.iloc[-1] + Th * e.iloc[-12] + th * Th * e.iloc[-13]
print(f"base = {train.iloc[-1]} + {train.iloc[-12]} - {train.iloc[-13]} = {base}")
print(f"errors used: e(Dec23) = {e.iloc[-1]:.3f}, e(Jan23) = {e.iloc[-12]:.3f}, e(Dec22) = {e.iloc[-13]:.3f}")
print(f"MA part = {th:.4f}x{e.iloc[-1]:.3f} + {Th:.4f}x{e.iloc[-12]:.3f} + {th * Th:.4f}x{e.iloc[-13]:.3f} = {ma_part:.3f}")
print(f"forecast Jan 2024 by hand = {base + ma_part:.3f}   statsmodels: {air.forecast(1).iloc[0]:.3f}")
fc = air.get_forecast(12)
se = fc.se_mean
print(f"h=1 interval: {base + ma_part:.2f} +/- 1.96 x sqrt({s2:.3f}) = +/- {1.96 * np.sqrt(s2):.2f}")
print(f"h=2 std error: sqrt(s2 x (1 + (1 + theta)^2)) = {np.sqrt(s2 * (1 + (1 + th) ** 2)):.3f}   statsmodels: {se.iloc[1]:.3f}")
ci = fc.conf_int(alpha=0.05)
out = pd.DataFrame({"actual": test, "forecast": fc.predicted_mean.round(1), "lower": ci.iloc[:, 0].round(1),
                    "upper": ci.iloc[:, 1].round(1), "se": se.round(2)})
print(out)
inside = ((test &gt;= ci.iloc[:, 0]) &amp; (test &lt;= ci.iloc[:, 1])).sum()
print("actuals inside the 95% interval:", inside, "of 12")
def mae(f): return round(np.mean(np.abs(test.values - np.asarray(f))), 2)
print("MAE  airline:", mae(fc.predicted_mean), " seasonal naive:", mae(train[-12:]),
      " naive:", mae([train.iloc[-1]] * 12), " drift:", mae(rwd.forecast(12)))</div>
  <div class="fx" data-lang="text">base = 138 + 125 - 126 = 137
errors used: e(Dec23) = 2.179, e(Jan23) = 6.198, e(Dec22) = 4.033
MA part = -0.4115x2.179 + -0.4723x6.198 + 0.1943x4.033 = -3.040
forecast Jan 2024 by hand = 133.960   statsmodels: 134.045
h=1 interval: 133.96 +/- 1.96 x sqrt(14.217) = +/- 7.39
h=2 std error: sqrt(s2 x (1 + (1 + theta)^2)) = 4.375   statsmodels: 4.388
            actual  forecast  lower  upper    se
2024-01-01     133     134.0  126.6  141.5  3.78
2024-02-01     128     128.5  119.9  137.1  4.39
2024-03-01     136     135.1  125.5  144.7  4.92
2024-04-01     136     127.8  117.2  138.4  5.40
2024-05-01     129     125.1  113.7  136.6  5.84
2024-06-01     136     128.8  116.5  141.0  6.24
2024-07-01     144     137.6  124.6  150.6  6.63
2024-08-01     150     143.6  129.9  157.3  6.99
2024-09-01     147     142.2  127.8  156.6  7.33
2024-10-01     160     152.1  137.1  167.1  7.66
2024-11-01     160     151.0  135.4  166.7  7.98
2024-12-01     160     147.0  130.8  163.2  8.28
actuals inside the 95% interval: 12 of 12
MAE  airline: 5.76  seasonal naive: 14.75  naive: 10.25  drift: 7.76</div>
  <h3>Reading the output</h3>
  <ul>
    <li>Hand forecast 133.960; statsmodels 134.045. The small gap is because statsmodels' Kalman filter treats the early months as uncertain (it starts from a "diffuse" state) and with only 35 usable months that start-up uncertainty has not fully faded; our hand formula assumes the past errors are known exactly. The standard errors show the same small gap (3.78 vs √14.22 = 3.77; 4.388 vs 4.375).</li>
    <li>The 12-month forecast follows the season (peak in October–November) and grows with the base. The standard error grows from 3.78 to 8.28, so the interval widens from ±7.4 to ±16.2.</li>
    <li>All 12 actual values fall inside the 95% intervals. The forecasts are mostly a little low (2024 grew faster than the model's carried-forward growth), most visibly in April and December.</li>
    <li><strong>MAE</strong> on 2024: airline 5.76, drift 7.76, naive 10.25, seasonal naive 14.75. The model beats every baseline.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 680 280" width="680"><line x1="60" y1="216.9" x2="660" y2="216.9" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="220.9" text-anchor="end" class="tm" font-size="10.5">100</text><line x1="60" y1="164.4" x2="660" y2="164.4" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="168.4" text-anchor="end" class="tm" font-size="10.5">120</text><line x1="60" y1="111.9" x2="660" y2="111.9" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="115.9" text-anchor="end" class="tm" font-size="10.5">140</text><line x1="60" y1="59.4" x2="660" y2="59.4" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="63.4" text-anchor="end" class="tm" font-size="10.5">160</text><polygon points="471.4,108.0 488.6,119.4 505.7,99.4 522.9,116.1 540.0,120.9 557.1,109.2 574.3,84.0 591.4,66.4 608.6,68.3 625.7,40.7 642.9,41.9 660.0,50.9 660.0,136.1 642.9,124.0 625.7,119.5 608.6,143.8 591.4,138.3 574.3,152.2 557.1,173.5 540.0,180.9 522.9,171.7 505.7,150.0 488.6,164.6 471.4,147.0" class="fb" stroke="none"/><line x1="462.9" y1="20" x2="462.9" y2="230" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.6"/><text x="456.9" y="30" text-anchor="end" class="tm" font-size="10.5">train (2022–2023 shown)</text><text x="468.9" y="30" class="tm" font-size="10.5">test 2024</text><polyline points="60.0,190.6 77.1,206.4 94.3,180.1 111.4,216.9 128.6,222.1 145.7,206.4 162.9,180.1 180.0,161.8 197.1,164.4 214.3,132.9 231.4,140.8 248.6,148.6 265.7,151.2 282.9,164.4 300.0,151.2 317.1,169.6 334.3,167.0 351.4,164.4 368.6,143.4 385.7,127.6 402.9,132.9 420.0,106.6 437.1,109.2 454.3,117.1 471.4,130.2 488.6,143.4 505.7,122.4 522.9,122.4 540.0,140.8 557.1,122.4 574.3,101.4 591.4,85.6 608.6,93.5 625.7,59.4 642.9,59.4 660.0,59.4" fill="none" stroke="currentColor" stroke-width="1.8"/><polyline points="471.4,127.5 488.6,142.0 505.7,124.7 522.9,143.9 540.0,150.9 557.1,141.3 574.3,118.1 591.4,102.4 608.6,106.1 625.7,80.1 642.9,82.9 660.0,93.5" fill="none" class="sb" stroke-width="2.2" stroke-dasharray="6 3"/><polyline points="471.4,125.2 488.6,140.2 505.7,126.4 522.9,127.2 540.0,157.2 557.1,138.5 574.3,114.3 591.4,99.1 608.6,101.4 625.7,72.2 642.9,78.4 660.0,91.7" fill="none" class="sg" stroke-width="2.2"/><text x="162.9" y="246" text-anchor="middle" class="tm" font-size="11">2022</text><text x="368.6" y="246" text-anchor="middle" class="tm" font-size="11">2023</text><text x="574.3" y="246" text-anchor="middle" class="tm" font-size="11">2024</text><line x1="70" y1="266" x2="96" y2="266" stroke="currentColor" stroke-width="1.8"/><text x="102" y="270" font-size="11">actual sales</text><line x1="210" y1="266" x2="236" y2="266" class="sb" stroke-width="2.2" stroke-dasharray="6 3"/><text x="242" y="270" font-size="11">airline forecast</text><rect x="370" y="260" width="22" height="12" class="fb"/><text x="398" y="270" font-size="11">its 95% interval</text><line x1="520" y1="266" x2="546" y2="266" class="sg" stroke-width="2.2"/><text x="552" y="270" font-size="11">with promo (SARIMAX)</text></svg><figcaption>Training data (2022–2023 shown), the 2024 actuals, the airline forecast with its 95% interval (shaded, widening with the horizon), and the SARIMAX forecast with the promotion flag from section 14.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weather forecast: tomorrow's temperature ±2 degrees, next week's ±6. Each extra day adds one more day of unknown weather on top of the uncertainty already there, so the band fans out.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>h-step forecast</strong>: ŷ<sub>T+h|T</sub> = E[y<sub>T+h</sub> | data to T], computed by recursion with future shocks set to 0 and past shocks set to the residuals. <strong>Forecast error variance</strong>: σ²Σ<sub>j=0..h−1</sub> ψ<sub>j</sub>². <strong>95% prediction interval</strong>: ŷ ± 1.96·√var<sub>h</sub> (assumes normal errors and known parameters).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trusting ARIMA intervals too much. They ignore uncertainty in the estimated parameters and in the chosen orders, and they assume normal errors; ours failed normality, so the true tails are heavier. Intervals are usually too narrow in practice; check their coverage on held-out data (12 of 12 here, a good sign but a small sample) and widen if needed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: auto_arima.</b> We chose the orders by reading plots and a hand-picked grid. With hundreds of series (every product, every shop), nobody can read hundreds of correlograms. Can the search be automated?</div>

  <h2 id="ar-auto"><span class="num">13</span>auto_arima: Searching Orders Automatically</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Identification by eye does not scale and depends on judgment. How do automatic tools pick (p, d, q)(P, D, Q) for us, and do they agree with our choice?</p>
  <h3>The idea (Hyndman-Khandakar algorithm)</h3>
  <ol>
    <li>Choose D with a seasonal-strength or seasonal unit-root test (OCSB, Canova-Hansen), then d with repeated KPSS tests on the seasonally differenced data.</li>
    <li>Fit a few starting models, e.g. (2, d, 2)(1, D, 1), (0, d, 0)(0, D, 0), (1, d, 0)(1, D, 0), (0, d, 1)(0, D, 1).</li>
    <li><strong>Stepwise</strong>: from the current best, try changing each of p, q, P, Q by ±1 and adding or removing the constant; move to any neighbour with lower AICc; repeat until no neighbour improves.</li>
    <li>Reject models that are near non-stationary or non-invertible (roots close to the unit circle).</li>
  </ol>
  <p>This is what R's <code>auto.arima</code>, Python's <code>pmdarima.auto_arima(y, seasonal=True, m=12, stepwise=True)</code> and <code>statsforecast.models.AutoARIMA(season_length=12)</code> implement. The code below does the exhaustive version of step 3 on our training data, with d = D = 1 from section 08.</p>
  <div class="fx" data-lang="py">import itertools
results = []
for p, q, P, Q in itertools.product(range(3), range(3), range(2), range(2)):   # 36 candidates
    r = SARIMAX(train, order=(p, 1, q), seasonal_order=(P, 1, Q, 12)).fit(disp=False)
    results.append(((p, 1, q), (P, 1, Q, 12), round(float(r.aic), 2)))
results.sort(key=lambda t: t[2])
print("models tried:", len(results))
for o, so, a in results[:5]:
    print(o, so, "AIC", a)
print("worst:", results[-1])</div>
  <div class="fx" data-lang="text">models tried: 36
(1, 1, 0) (1, 1, 0, 12) AIC 201.22
(0, 1, 1) (1, 1, 0, 12) AIC 201.26
(1, 1, 0) (0, 1, 1, 12) AIC 201.34
(0, 1, 1) (0, 1, 1, 12) AIC 201.41
(0, 1, 2) (1, 1, 0, 12) AIC 202.19
worst: ((0, 1, 0), (0, 1, 0, 12), 208.45)</div>
  <p>The search over all 36 combinations of p, q ∈ {0, 1, 2} and P, Q ∈ {0, 1} finds the same four-way tie at the top (201.22 to 201.41), including the airline model, and puts the model with no AR or MA terms at all (the seasonal random walk with growth) last at 208.45. An automatic search would hand us (1,1,0)(1,1,0)<sub>12</sub>, which is as good as our choice by AIC. On a tie, prefer the model whose forecasts you can explain and check them on held-out data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding the lowest point of a hilly field in fog: stepwise search feels the ground around your feet and steps downhill until every direction goes up. It is fast but can stop in a local dip; the exhaustive grid walks the whole field.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>auto_arima</strong>: automatic SARIMA order selection: unit-root tests choose d and D; an information criterion (AICc by default) chooses p, q, P, Q by stepwise or grid search, subject to maximum orders and stationarity/invertibility checks.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating the auto-selected model as the truth. It only searches what you allow (maximum orders, seasonal period, d from a test that may be wrong), it cannot know about promotions or holidays, and AIC ties are common. Always run the residual checks and a held-out comparison with simple baselines.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SARIMAX.</b> Every model so far, ours and the automatic ones, only sees past sales. The residuals pointed straight at the promotions. How do we give the model an outside variable?</div>

  <h2 id="ar-sarimax"><span class="num">14</span>SARIMAX: Exogenous Variables</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The biggest errors were months with a missing or unusual promotion, and Meera knows her promotion calendar in advance. How do we feed that knowledge into the model, and what changes when we do?</p>
  <h3>Plain words: regression with SARIMA errors</h3>
  <p><strong>SARIMAX</strong> (the X is for eXogenous) fits a regression on the outside variables whose errors follow a SARIMA model:</p>
  <p style="text-align:center"><strong>y<sub>t</sub> = β·x<sub>t</sub> + u<sub>t</sub>, &nbsp;&nbsp; u<sub>t</sub> ~ SARIMA(p, d, q)(P, D, Q)<sub>s</sub></strong></p>
  <p>β is read like a regression coefficient: "a promotion month adds β to sales, all else equal". The SARIMA part models whatever the promotions do not explain. statsmodels differences x along with y internally, so β keeps its meaning in sales units.</p>
  <h3>By hand: why promotions created the negative lag-1 memory</h3>
  <p>Take a flat series 100, 100, 100 and a one-month promotion adding 6 in the middle: 100, 106, 100. Its differences are +6, −6: an up followed by a down, a <em>negative</em> lag-1 autocorrelation. The airline model saw these up-down pairs in w and modelled them as "give back 41% of last month's surprise" (θ = −0.41). Once the promotion is a regressor, the pairs are explained and that negative memory should disappear.</p>
  <div class="fx" data-lang="py">xtr, xte = shop.promo[:"2023"], shop.promo["2024":]      # promo flag: known in advance (it is planned)
sx = SARIMAX(train, exog=xtr, order=(0, 1, 1), seasonal_order=(0, 1, 1, 12)).fit(disp=False)
print(sx.params.round(3))
print(f"AIC without promo {air.aic:.1f} -&gt; with promo {sx.aic:.1f}")
lb = acorr_ljungbox(sx.resid[13:], lags=[12]).lb_pvalue.iloc[0]
print("Ljung-Box p (lag 12):", round(lb, 3))
fx = sx.get_forecast(12, exog=xte)
print("MAE 2024 with promo:", mae(fx.predicted_mean), "  without:", mae(fc.predicted_mean))
print("interval half-width Jan 2024: with promo", round(1.96 * fx.se_mean.iloc[0], 2), " without", round(1.96 * se.iloc[0], 2))
# the promo coefficient is exactly the forecast difference when we switch a planned promo on
x_off = xte.copy(); x_off.iloc[3] = 0                  # April 2024 has a promo; pretend it does not
f_on, f_off = fx.predicted_mean.iloc[3], sx.forecast(12, exog=x_off).iloc[3]
print(f"April 2024: promo on {f_on:.2f}, off {f_off:.2f}, difference {f_on - f_off:.3f}")
cix = fx.conf_int()
print("actuals inside the 95% interval:", int(((test &gt;= cix.iloc[:, 0]) &amp; (test &lt;= cix.iloc[:, 1])).sum()), "of 12")</div>
  <div class="fx" data-lang="text">promo       6.644
ma.L1       0.370
ma.S.L12   -0.799
sigma2      2.738
dtype: float64
AIC without promo 201.4 -&gt; with promo 152.6
Ljung-Box p (lag 12): 0.866
MAE 2024 with promo: 4.7   without: 5.76
interval half-width Jan 2024: with promo 3.43  without 7.42
April 2024: promo on 134.18, off 127.53, difference 6.644
actuals inside the 95% interval: 12 of 12</div>
  <h3>Reading the output</h3>
  <ul>
    <li><strong>promo = +6.644</strong>: a promotion month adds about ₹6,600 to sales.</li>
    <li><strong>θ flips from −0.41 to +0.37</strong>, exactly as the by-hand argument predicted: the "give-back" was the promotions in disguise. What remains is mild positive momentum. Θ strengthens to −0.80.</li>
    <li><strong>σ² falls from 14.2 to 2.7</strong>: the typical one-step error drops from 3.8 to 1.65 thousand. AIC falls from 201.4 to 152.6, a huge difference (anything above 10 is decisive). Ljung-Box p = 0.87: still white noise.</li>
    <li><strong>2024 MAE 4.70</strong> instead of 5.76, with intervals less than half as wide (±3.43 instead of ±7.42 in January) and still covering all 12 actual values.</li>
    <li>For the forecast we pass the 2024 promotion calendar (<code>exog=xte</code>). Switching off April 2024's planned promotion lowers April's forecast by exactly 6.644 = β: the model's "what-if" answer for planning.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor tracking a patient's blood sugar had been treating the spikes as random. Once the patient's meal diary is added, most spikes are explained by sweets on festival days; what is left is a much smaller, steadier pattern, and next week's forecast can use the planned festival dates.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SARIMAX</strong>: y<sub>t</sub> = x<sub>t</sub>ᵀβ + u<sub>t</sub>, φ(B)Φ(B<sup>s</sup>)(1 − B)<sup>d</sup>(1 − B<sup>s</sup>)<sup>D</sup>u<sub>t</sub> = θ(B)Θ(B<sup>s</sup>)ε<sub>t</sub>. statsmodels: <code>SARIMAX(y, exog=X, order=…, seasonal_order=…)</code>, forecasting with <code>get_forecast(h, exog=X_future)</code>. Typical exogenous inputs: promotions, prices, holidays, Fourier terms for long seasons, weather (if forecastable).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using an exogenous variable you will not know at forecast time. Promotions are planned, so their future values are known. Tomorrow's temperature or a competitor's price are not: you would have to forecast them first (adding their error) or use lagged values. Testing with the <em>actual</em> future values of such a variable flatters the model; that is leakage.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> We now have the full family and a working forecast. How do its members compare, and how does ARIMA compare with its siblings in the Time Series group?</div>

  <h2 id="ar-compare"><span class="num">15</span>Comparisons</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The family has many members and the group has other approaches. Which model should we reach for, and when does ARIMA lose to its siblings?</p>
  <table class="tbl"><caption>The ARIMA family at a glance</caption>
    <tr><th>Model</th><th>Uses</th><th>Needs stationary input?</th><th>Shop result</th></tr>
    <tr><td>AR(p)</td><td>past values</td><td>Yes</td><td>φ = −0.40 on w; Nov 2023 139.8</td></tr>
    <tr><td>MA(q)</td><td>past errors</td><td>Yes (always stationary)</td><td>θ = −0.41 on w</td></tr>
    <tr><td>ARMA(p, q)</td><td>both</td><td>Yes</td><td>–</td></tr>
    <tr><td>ARIMA(p, d, q)</td><td>both, after d differences</td><td>No: differences inside</td><td>Random walk 138 flat; drift +0.83/month</td></tr>
    <tr><td>SARIMA(p,d,q)(P,D,Q)<sub>s</sub></td><td>+ seasonal lags</td><td>No</td><td>Airline: AIC 201.4, MAE 5.76</td></tr>
    <tr><td>SARIMAX</td><td>+ outside variables</td><td>No</td><td>+promo: AIC 152.6, MAE 4.70</td></tr>
  </table>
  <table class="tbl"><caption>ARIMA vs its siblings in the Time Series group</caption>
    <tr><th></th><th>SARIMA(X)</th><th><a class="xref" data-note="ml_ets_prophet">ETS / Holt-Winters</a></th><th><a class="xref" data-note="ml_ets_prophet">Prophet</a></th><th><a class="xref" data-note="ml_ts_ml">GBM on lag features</a></th></tr>
    <tr><td>Core idea</td><td>Autocorrelation of the differenced series</td><td>Weighted averages of level, trend, season</td><td>Regression on the calendar (trend + Fourier season + holidays)</td><td>Supervised learning on lags, rolling and calendar features</td></tr>
    <tr><td>Stationarity needed</td><td>Yes (via d, D)</td><td>No</td><td>No</td><td>No, but trends need care (trees cannot extrapolate)</td></tr>
    <tr><td>Intervals</td><td>Analytic</td><td>Analytic (state space)</td><td>Simulation</td><td>Quantile loss or conformal</td></tr>
    <tr><td>External inputs</td><td>Yes (X)</td><td>No (basic ETS)</td><td>Yes (regressors, holidays)</td><td>Yes, any number</td></tr>
    <tr><td>Many series</td><td>One model per series</td><td>One per series</td><td>One per series</td><td>One global model for all</td></tr>
    <tr><td>Best when</td><td>Short-to-medium single series with clear autocorrelation</td><td>Strong level/trend/season, little else</td><td>Daily business data, many holidays, missing days</td><td>Thousands of related series, rich features</td></tr>
  </table>
  <table class="tbl"><caption>Baselines vs models on Meera's 2024 (MAE, ₹ thousand)</caption>
    <tr><th>Forecast</th><th>MAE</th><th>Comment</th></tr>
    <tr><td>Seasonal naive (same month 2023)</td><td>14.75</td><td>Ignores growth</td></tr>
    <tr><td>Naive (138 every month)</td><td>10.25</td><td>Ignores season and growth</td></tr>
    <tr><td>Random walk + drift</td><td>7.76</td><td>Growth but no season</td></tr>
    <tr><td>Airline SARIMA</td><td>5.76</td><td>Growth + season + short memory</td></tr>
    <tr><td>Airline + promo (SARIMAX)</td><td>4.70</td><td>Adds known future information</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> The tables compare models side by side; next, the chain that builds each concept out of the previous one, on Meera's numbers.</div>

  <h2 id="ar-connect"><span class="num">16</span>How It All Connects</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> AR, MA, differencing, seasonal terms, AIC, Ljung-Box, intervals, exogenous inputs: how does each one come out of the one before, and which question does each answer?</p>
  <figure class="viz"><svg viewBox="0 0 700 420" width="700">
<defs><marker id="ar-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="12" width="200" height="50" rx="8" class="fs" stroke="currentColor"/><text x="110" y="33" text-anchor="middle" font-size="12">w = (1 − B)(1 − B¹²)y</text><text x="110" y="50" text-anchor="middle" class="tm" font-size="10.5">from Basics: ACF −0.40 (1)</text>
<line x1="210" y1="37" x2="248" y2="37" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="250" y="12" width="200" height="50" rx="8" class="fb sb"/><text x="350" y="33" text-anchor="middle" font-size="12">AR: past values</text><text x="350" y="50" text-anchor="middle" class="tm" font-size="10.5">φ = r₁ = −0.40; Yule-Walker</text>
<line x1="450" y1="37" x2="488" y2="37" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="490" y="12" width="200" height="50" rx="8" class="fb sb"/><text x="590" y="33" text-anchor="middle" font-size="12">MA: past errors</text><text x="590" y="50" text-anchor="middle" class="tm" font-size="10.5">e = w − θe_prev; r₁ = θ/(1+θ²)</text>
<line x1="590" y1="62" x2="590" y2="90" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="490" y="92" width="200" height="50" rx="8" class="fb sb"/><text x="590" y="113" text-anchor="middle" font-size="12">ARMA</text><text x="590" y="130" text-anchor="middle" class="tm" font-size="10.5">ψ-weights: burst + fade</text>
<line x1="490" y1="117" x2="452" y2="117" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="250" y="92" width="200" height="50" rx="8" class="ft st"/><text x="350" y="113" text-anchor="middle" font-size="12">+ I(d): integrate back</text><text x="350" y="130" text-anchor="middle" class="tm" font-size="10.5">ARIMA(0,1,0): 138 flat</text>
<line x1="250" y1="117" x2="212" y2="117" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="10" y="92" width="200" height="50" rx="8" class="ft st"/><text x="110" y="113" text-anchor="middle" font-size="12">+ seasonal (P,D,Q)₁₂</text><text x="110" y="130" text-anchor="middle" class="tm" font-size="10.5">airline: θ·Θ term at lag 13</text>
<line x1="110" y1="142" x2="110" y2="170" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="10" y="172" width="200" height="50" rx="8" class="fv" stroke="currentColor"/><text x="110" y="193" text-anchor="middle" font-size="12">ACF/PACF → candidates</text><text x="110" y="210" text-anchor="middle" class="tm" font-size="10.5">(0,1,1) or (1,1,0) × seasonal</text>
<line x1="210" y1="197" x2="248" y2="197" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="250" y="172" width="200" height="50" rx="8" class="fv" stroke="currentColor"/><text x="350" y="193" text-anchor="middle" font-size="12">AIC = −2 log L + 2k</text><text x="350" y="210" text-anchor="middle" class="tm" font-size="10.5">201.2–201.4: a tie</text>
<line x1="450" y1="197" x2="488" y2="197" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="490" y="172" width="200" height="50" rx="8" class="fv" stroke="currentColor"/><text x="590" y="193" text-anchor="middle" font-size="12">MLE fit (Kalman)</text><text x="590" y="210" text-anchor="middle" class="tm" font-size="10.5">θ −0.41, Θ −0.47, σ² 14.2</text>
<line x1="590" y1="222" x2="590" y2="250" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="490" y="252" width="200" height="50" rx="8" class="fg sg"/><text x="590" y="273" text-anchor="middle" font-size="12">Ljung-Box on residuals</text><text x="590" y="290" text-anchor="middle" class="tm" font-size="10.5">Q(3) 1.006, p 0.80; JB fails</text>
<line x1="490" y1="277" x2="452" y2="277" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="250" y="252" width="200" height="50" rx="8" class="fg sg"/><text x="350" y="273" text-anchor="middle" font-size="12">forecast ± 1.96√(σ²Σψ²)</text><text x="350" y="290" text-anchor="middle" class="tm" font-size="10.5">Jan 2024 134 ± 7.4; MAE 5.76</text>
<line x1="250" y1="277" x2="212" y2="277" stroke="currentColor" marker-end="url(#ar-ca)"/>
<rect x="10" y="252" width="200" height="50" rx="8" class="fv" stroke="currentColor"/><text x="110" y="273" text-anchor="middle" font-size="12">auto_arima search</text><text x="110" y="290" text-anchor="middle" class="tm" font-size="10.5">36 models: same tie</text>
<line x1="110" y1="302" x2="110" y2="340" stroke="currentColor" marker-end="url(#ar-ca)"/>
<line x1="590" y1="302" x2="590" y2="326" stroke="currentColor" stroke-dasharray="3 3"/><line x1="590" y1="326" x2="232" y2="326" stroke="currentColor" stroke-dasharray="3 3"/><text x="420" y="320" text-anchor="middle" class="tm" font-size="10">big residuals = promotion months</text>
<line x1="232" y1="326" x2="212" y2="350" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ar-ca)"/>
<rect x="10" y="342" width="680" height="60" rx="8" class="fr sr"/><text x="350" y="366" text-anchor="middle" font-size="12.5">SARIMAX: y = β·promo + SARIMA errors</text><text x="350" y="386" text-anchor="middle" class="tm" font-size="10.5">β +6.64 · θ −0.41 → +0.37 · σ² 14.2 → 2.7 · AIC 201 → 153 · MAE 4.70 · interval ±3.4</text>
</svg><figcaption>The stationary series from the Basics note feeds AR and MA; together they make ARMA; integration and seasonal terms extend it to Meera's raw sales; ACF/PACF propose candidates, AIC compares them, MLE fits the winner, Ljung-Box checks it, the ψ-weights give intervals; the residuals point to the promotions, which SARIMAX adds.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Meera's sales</caption>
    <tr><th>Concept</th><th>Built from</th><th>Formula</th><th>Question it answers</th><th>Shop value</th><th>Robust / sensitive · use when</th></tr>
    <tr><td>AR(1)</td><td>stationary w, regression on its lag</td><td>w<sub>t</sub> = φw<sub>t−1</sub> + ε<sub>t</sub></td><td>Does last value predict this one?</td><td>φ = −0.4043; Nov 2023 139.81</td><td>Needs |φ| &lt; 1</td></tr>
    <tr><td>AR(p), Yule-Walker</td><td>ACF values r₁ … r<sub>p</sub></td><td>φ₂ = (r₂ − r₁²)/(1 − r₁²)</td><td>Several lags directly?</td><td>φ₁ −0.450, φ₂ −0.114</td><td>Check roots, not coefficients</td></tr>
    <tr><td>MA(q)</td><td>past one-step errors</td><td>w<sub>t</sub> = ε<sub>t</sub> + θε<sub>t−1</sub></td><td>Short-lived shocks?</td><td>θ −0.41 → r₁ −0.351</td><td>Invertible |θ| &lt; 1; sign conventions</td></tr>
    <tr><td>ARMA</td><td>AR + MA</td><td>φ(B)w = θ(B)ε</td><td>Both memories, few parameters</td><td>ψ: 1, 1, 0.6, 0.36</td><td>Near-cancelling roots</td></tr>
    <tr><td>I(d)</td><td>differencing (Basics)</td><td>(1 − B)<sup>d</sup>y</td><td>Non-stationary levels</td><td>RW 138; drift 0.83</td><td>Over-differencing; constants with d + D ≥ 2</td></tr>
    <tr><td>SARIMA</td><td>polynomials in B<sup>12</sup>, multiplied</td><td>φΦ(1 − B)(1 − B<sup>12</sup>)y = θΘε</td><td>Seasonal memory cheaply</td><td>ACF r₁₂ −0.385, r₁₃ +0.135</td><td>Needs several full seasons</td></tr>
    <tr><td>Identification</td><td>ADF/KPSS, ACF/PACF of w</td><td>cut-off rules</td><td>Which orders to try?</td><td>d = D = 1; (0,1,1) or (1,1,0)</td><td>Ambiguous on short data</td></tr>
    <tr><td>AIC / BIC</td><td>log-likelihood, parameter count</td><td>−2 log L + 2k (k ln n)</td><td>Fair comparison</td><td>201.41 / 206.07</td><td>Same d, D only; Δ &lt; 2 = tie</td></tr>
    <tr><td>MLE fit &amp; summary</td><td>Kalman filter errors</td><td>max log L</td><td>Values and certainty</td><td>θ −0.41 (p .005), Θ −0.47 (p .10)</td><td>Read the footer tests too</td></tr>
    <tr><td>Ljung-Box</td><td>residual ACF</td><td>n(n+2)Σr<sub>k</sub>²/(n−k)</td><td>Memory left over?</td><td>Q(3) = 1.006, p 0.80</td><td>Passing ≠ good model</td></tr>
    <tr><td>Forecast &amp; interval</td><td>model equation, ψ-weights</td><td>ŷ ± 1.96σ√Σψ²</td><td>What next, how sure?</td><td>134.0 ± 7.4; MAE 5.76</td><td>Intervals often too narrow</td></tr>
    <tr><td>auto_arima</td><td>AIC + search</td><td>stepwise / grid</td><td>Orders at scale</td><td>36 models, same tie</td><td>Only searches what you allow</td></tr>
    <tr><td>SARIMAX</td><td>regression + SARIMA errors</td><td>y = βx + u</td><td>Use known outside info</td><td>β 6.64; AIC 152.6; MAE 4.70</td><td>Future x must be known</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The chain shows the correct use; next, the ways each link is most often broken.</div>

  <h2 id="ar-traps"><span class="num">17</span>Common Mistakes</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We know how ARIMA works. Where do practitioners, and interview answers, most often go wrong?</p>
  <div class="callout trap"><span class="label">Trap: fitting ARMA to a trending series</span>
    <p>φ near 1 and misleading inference. Difference first (d, D) or let ARIMA difference for you; check with ADF/KPSS and the ACF of diff(1) at lag s.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing AIC across different d or D</span>
    <p>The likelihoods are on different data. Fix d and D first, then compare p, q, P, Q.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: chasing small AIC differences</span>
    <p>201.22 vs 201.41 is a tie. Prefer the simpler or more interpretable model and check out-of-sample error.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skipping residual diagnostics</span>
    <p>Run Ljung-Box and look at the biggest residuals. Ours passed Ljung-Box but the big errors revealed the missing promotion variable worth 48 AIC points.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: MA sign conventions</span>
    <p>statsmodels uses 1 + θB; some textbooks use 1 − θB. Check before interpreting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: future exogenous values you will not have</span>
    <p>Planned promotions and holidays are fine; actual weather or competitor prices in the test period are leakage.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting what the model cannot do</span>
    <p>ARIMA is linear, one series at a time, with fixed coefficients. Structural breaks (a new branch, a lockdown) need dummies or refitting on recent data; many related series favour global ML models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: taking intervals at face value</span>
    <p>They assume normal errors and known parameters. Check coverage on held-out data; widen if the residuals have heavy tails.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything is covered; next comes the whole note condensed for revision.</div>

  <h2 id="ar-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The ARIMA family models a series' memory with a linear equation: AR terms use past values, MA terms use past forecast errors, differencing (I) removes trend and season first, seasonal terms add memory at lag s, and exogenous regressors (X) add known outside information. Orders are proposed from the ACF/PACF, compared by AIC, fitted by maximum likelihood, checked with Ljung-Box, and forecasts come with intervals that widen with the horizon. Running example: Meera's chai shop, monthly sales 2020–2023 for training and 2024 for testing.</p>
  <h3>The story in one line per step</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer on the shop</th><th>Weakness that forces the next step</th></tr>
    <tr><td>AR(1)</td><td>Last value → this value?</td><td>φ = −0.40; Nov 2023 139.8 (141)</td><td>Only one lag</td></tr>
    <tr><td>AR(p)</td><td>Several lags?</td><td>Yule-Walker φ₁ −0.45, φ₂ −0.11</td><td>Shocks echo forever</td></tr>
    <tr><td>MA(q)</td><td>Short-lived shocks?</td><td>e = w − θe<sub>prev</sub>; r₁ = −0.351</td><td>Real series mix both</td></tr>
    <tr><td>ARMA</td><td>Both, few parameters?</td><td>ψ 1, 1, 0.6, 0.36 …</td><td>Needs stationarity</td></tr>
    <tr><td>I(d)</td><td>Trending levels?</td><td>Difference, integrate back; RW 138</td><td>Equations get long</td></tr>
    <tr><td>Notation</td><td>Compact form?</td><td>φ(B)(1 − B)<sup>d</sup>y = θ(B)ε</td><td>Lag-12 memory needs 12 terms</td></tr>
    <tr><td>SARIMA</td><td>Seasonal memory?</td><td>Airline (0,1,1)(0,1,1)<sub>12</sub></td><td>Which orders for the shop?</td></tr>
    <tr><td>Identification</td><td>Which to try?</td><td>d = D = 1; MA(1) or AR(1) + seasonal</td><td>Plots ambiguous</td></tr>
    <tr><td>AIC / BIC</td><td>Fair choice?</td><td>Four-way tie 201.2–201.4</td><td>Is the model adequate?</td></tr>
    <tr><td>Fit &amp; summary</td><td>Values, certainty?</td><td>θ −0.41 (p .005), Θ −0.47, σ² 14.2</td><td>Leftover memory?</td></tr>
    <tr><td>Ljung-Box</td><td>Residuals white?</td><td>Q(3) 1.006, p 0.80; JB fails</td><td>Forecast, uncertainty?</td></tr>
    <tr><td>Forecast</td><td>2024 and intervals?</td><td>Jan 134 ± 7.4; MAE 5.76 (baselines 7.8–14.8)</td><td>Manual order choice</td></tr>
    <tr><td>auto_arima</td><td>Automate?</td><td>36 models, same tie</td><td>Ignores promotions</td></tr>
    <tr><td>SARIMAX</td><td>Add outside info?</td><td>β 6.64; σ² 2.7; AIC 152.6; MAE 4.70</td><td>→ ETS &amp; Prophet, ML forecasting</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <div class="cards">
    <div><b>AR(p)</b><p>w<sub>t</sub> = c + Σφ<sub>i</sub>w<sub>t−i</sub> + ε<sub>t</sub>: φ<sub>i</sub> weights of past values, ε white noise (variance σ²). Stationary if the roots of 1 − φ₁z − … − φ<sub>p</sub>z<sup>p</sup> lie outside |z| = 1. AR(1): ACF φ<sup>k</sup>, mean c/(1 − φ), variance σ²/(1 − φ²). PACF cuts off at p.</p><small>Yule-Walker AR(2): φ₁ = r₁(1 − r₂)/(1 − r₁²), φ₂ = (r₂ − r₁²)/(1 − r₁²)</small></div>
    <div><b>MA(q)</b><p>w<sub>t</sub> = μ + ε<sub>t</sub> + Σθ<sub>j</sub>ε<sub>t−j</sub>: θ<sub>j</sub> weights of past shocks. Always stationary; invertible if |θ| &lt; 1 (MA(1)). MA(1): ρ₁ = θ/(1 + θ²), 0 beyond lag 1. ACF cuts off at q.</p><small>Errors: e<sub>t</sub> = w<sub>t</sub> − θe<sub>t−1</sub></small></div>
    <div><b>SARIMA</b><p>φ(B)Φ(B<sup>s</sup>)(1 − B)<sup>d</sup>(1 − B<sup>s</sup>)<sup>D</sup>y<sub>t</sub> = c + θ(B)Θ(B<sup>s</sup>)ε<sub>t</sub>. B = backshift; p, d, q ordinary orders; P, D, Q seasonal orders; s period.</p><small>Airline: y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub></small></div>
    <div><b>AIC, BIC</b><p>AIC = −2 log L + 2k; BIC = −2 log L + k ln n; AICc adds 2k(k + 1)/(n − k − 1). k = number of parameters incl. σ²; n = observations after differencing. Lower is better; differences below 2 are ties.</p><small>Airline: 195.41 + 6 = 201.41</small></div>
    <div><b>Ljung-Box</b><p>Q(h) = n(n + 2)Σ<sub>k=1..h</sub> r<sub>k</sub>²/(n − k), r<sub>k</sub> = residual autocorrelations, compared with χ²(h − p − q). Small p = autocorrelation left.</p><small>Q(3) = 35·37·0.000777 = 1.006</small></div>
    <div><b>Forecast and SARIMAX</b><p>Forecast: replace future shocks by 0, past shocks by residuals. Variance σ²Σ<sub>j&lt;h</sub>ψ<sub>j</sub>²; 95% interval ±1.96·se. SARIMAX: y<sub>t</sub> = βx<sub>t</sub> + u<sub>t</sub>, u<sub>t</sub> ~ SARIMA; future x needed.</p><small>Jan 2024: 137 − 3.04 = 133.96; ψ₁ = 1 + θ</small></div>
  </div>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Data</td><td>48 training months (2020–2023), 12 test months (2024); w has 35 values</td></tr>
    <tr><td>ACF / PACF of w (training)</td><td>ACF −0.40, 0.07, …, −0.33 at 12; PACF −0.40, −0.11; band ±0.331</td></tr>
    <tr><td>ADF p (training)</td><td>raw 0.995; diff(1) 0.001 but ACF at 12 = 0.61; diff(12) 0.026; both 0.000</td></tr>
    <tr><td>AR(1) / AR(2)</td><td>φ −0.4043 / φ₁ −0.4502, φ₂ −0.1137 (roots |z| = 2.965)</td></tr>
    <tr><td>AIC (no promo)</td><td>(1,1,0)(1,1,0) 201.22 · (1,1,0)(0,1,1) 201.34 · (0,1,1)(1,1,0) 201.26 · airline 201.41 · no seasonal term ≥ 204.3</td></tr>
    <tr><td>Airline fit</td><td>θ −0.4115 (se 0.145), Θ −0.4723 (se 0.288), σ² 14.22; JB p 0.01; H p 0.80</td></tr>
    <tr><td>Ljung-Box</td><td>Q(3) 1.006 (p 0.80), Q(12) 7.94 (p 0.79)</td></tr>
    <tr><td>Forecast Jan 2024</td><td>137 − 3.040 = 133.96 (statsmodels 134.05; actual 133); ±7.4 → ±16.2 by Dec</td></tr>
    <tr><td>2024 MAE</td><td>SARIMAX 4.70 · airline 5.76 · drift 7.76 · naive 10.25 · seasonal naive 14.75</td></tr>
    <tr><td>SARIMAX</td><td>promo +6.644, θ +0.370, Θ −0.799, σ² 2.738, AIC 152.6, interval ±3.43</td></tr>
  </table>
  <h3>When to use it, when not</h3>
  <table class="tbl">
    <tr><th>Use ARIMA / SARIMA(X)</th><th>Prefer something else</th></tr>
    <tr><td>A single series, tens to hundreds of points, clear autocorrelation and seasonality, need for honest intervals and an interpretable model; known future regressors (promotions, holidays).</td><td>Thousands of related series or many nonlinear drivers (global <a class="xref" data-note="ml_ts_ml">GBM</a>); multiple or very long seasonalities, daily data with holidays (<a class="xref" data-note="ml_ets_prophet">Prophet</a>, TBATS, Fourier terms); structural breaks; fewer than three seasons of data (seasonal naive, ETS).</td></tr>
  </table>
  <h3>Key traps</h3>
  <ul>
    <li>Make the series stationary first (d, D); never compare AIC across different differencing.</li>
    <li>ACF/PACF propose; AIC and residual checks decide; AIC gaps under 2 are ties.</li>
    <li>Ljung-Box passing is necessary, not sufficient: read the biggest residuals.</li>
    <li>Intervals assume normal errors and known parameters; check coverage.</li>
    <li>Exogenous inputs must be known at forecast time.</li>
  </ul>
  <h3>Rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>AR(1) with φ = 0.5, c = 0, last value 4: forecasts for the next two steps?</td><td>2, then 1 (decaying toward the mean 0 by φ<sup>h</sup>).</td></tr>
    <tr><td>MA(1) with θ = 0.5: lag-1 autocorrelation?</td><td>0.5/(1 + 0.25) = 0.4; zero at all higher lags.</td></tr>
    <tr><td>ACF cuts off after lag 2, PACF tails off: which model?</td><td>MA(2).</td></tr>
    <tr><td>log L = −100, k = 4: AIC?</td><td>200 + 8 = 208.</td></tr>
    <tr><td>Why do ARIMA(0,1,1) intervals keep widening?</td><td>The differenced (unit-root) part makes every future shock permanent: var<sub>h</sub> = σ²(1 + (h − 1)(1 + θ)²) grows without limit.</td></tr>
  </table>

  <h2 id="ar-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What do p, d and q mean in ARIMA(p, d, q)?</summary><div class="qa-body">p = number of autoregressive terms (past values of the differenced series), d = number of ordinary differences needed for stationarity, q = number of moving-average terms (past forecast errors). Seasonal (P, D, Q, s) are the same at multiples of the period s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>AR vs MA: what is the difference in plain words and in the ACF/PACF?</summary><div class="qa-body">AR uses past values, so a shock echoes forever, fading (ACF tails off, PACF cuts off after p). MA uses past shocks, so a shock lasts exactly q steps (ACF cuts off after q, PACF tails off). In the shop: φ = −0.40 (AR) or θ = −0.41 (MA) describe the same give-back almost equally well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must |φ| &lt; 1 in AR(1), and what happens at φ = 1?</summary><div class="qa-body">Back-substitution gives w<sub>t</sub> = Σφ<sup>k</sup>ε<sub>t−k</sub>; only if |φ| &lt; 1 do old shocks fade, giving a finite mean c/(1 − φ) and variance σ²/(1 − φ²). At φ = 1 it is a random walk (unit root): shocks are permanent and the variance grows with time; difference it (d = 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the AR(2) coefficients from r₁ and r₂.</summary><div class="qa-body">Yule-Walker: r₁ = φ₁ + φ₂r₁, r₂ = φ₁r₁ + φ₂. Solving: φ₁ = r₁(1 − r₂)/(1 − r₁²), φ₂ = (r₂ − r₁²)/(1 − r₁²), which is PACF(2). Shop: r₁ = −0.4043, r₂ = 0.0683 → φ₁ = −0.4502, φ₂ = −0.1137.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is invertibility and why do we require it?</summary><div class="qa-body">An MA model is invertible if it can be rewritten as a convergent AR(∞) in past values (|θ| &lt; 1 for MA(1)). θ and 1/θ give identical autocorrelations (−0.41 and −2.44 both give r₁ = −0.351), so the data cannot choose; invertibility picks the unique one whose error recursion is stable and whose forecasts depend sensibly on the past.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write out the airline model and explain each term.</summary><div class="qa-body">(1 − B)(1 − B<sup>12</sup>)y<sub>t</sub> = (1 + θB)(1 + ΘB<sup>12</sup>)ε<sub>t</sub>, i.e. y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub>. The y terms carry last month's level plus last year's month-to-month change; θ corrects for last month's surprise, Θ for last year's same-month surprise, θΘ is their interaction. ACF spikes at 1, 11, 12, 13.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the orders in practice?</summary><div class="qa-body">Transform if the variance grows; choose D (seasonal pattern in ACF of diff(1), seasonal tests) and d (ADF/KPSS); read ACF/PACF of the stationary series to propose small p, q, P, Q; compare candidates with the same d, D by AIC/AICc; check residuals with Ljung-Box; validate on held-out data against baselines. auto_arima automates the middle steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>AIC vs BIC: what is the difference and when do you prefer each?</summary><div class="qa-body">Both are −2 log L plus a penalty: 2k for AIC, k ln n for BIC. BIC penalises more (for n &gt; 7) and picks smaller models; it is consistent if the true model is among the candidates. AIC (or AICc for small n) targets predictive accuracy and is the default for forecasting. Neither can compare models with different differencing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Ljung-Box test check? Compute it from three residual autocorrelations.</summary><div class="qa-body">H₀: no autocorrelation in residuals up to lag h. Q = n(n + 2)Σr<sub>k</sub>²/(n − k) ~ χ²(h − p − q). Shop: n = 35, r = −0.0713, 0.0948, 0.1066 → 1,295 × (0.00015 + 0.00027 + 0.00036) = 1.006, p = 0.80: the model left no linear memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do ARIMA prediction intervals widen with the horizon, and why are they often too narrow?</summary><div class="qa-body">The h-step error accumulates the h future shocks weighted by the ψ-weights: var = σ²Σψ<sub>j</sub>²; with a unit root the weights do not decay, so the band keeps widening (shop: ±7.4 to ±16.2 over 12 months). They are too narrow when errors are heavy-tailed (our JB test failed) and because parameter and model-choice uncertainty are ignored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is SARIMAX, and what happened when we added the promotion flag?</summary><div class="qa-body">A regression on exogenous variables with SARIMA errors: y = βx + u. Adding promo gave β = +6.64, cut σ² from 14.2 to 2.7 and AIC from 201 to 153, improved 2024 MAE from 5.76 to 4.70 and halved the intervals. θ flipped from −0.41 to +0.37: the negative lag-1 memory was the up-then-down signature of one-month promotions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the main risk with exogenous variables?</summary><div class="qa-body">Needing their future values. Planned inputs (promotions, prices, holidays) are known; others (weather, competitor actions) must be forecast or lagged. Evaluating with their actual future values is leakage and overstates accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does ARIMA relate to exponential smoothing?</summary><div class="qa-body">Several linear ETS models are ARIMA models: simple exponential smoothing equals ARIMA(0,1,1) with α = 1 + θ, Holt's linear trend equals ARIMA(0,2,2), additive Holt-Winters corresponds to a seasonal ARIMA. ETS is parameterised by components (level, trend, season), ARIMA by autocorrelation; see <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) When would you choose a gradient-boosting forecaster over SARIMA?</summary><div class="qa-body">With many related series (one global model learns shared patterns), many nonlinear drivers or interactions, or long histories where feature engineering pays. SARIMA wins on a single short series, gives analytic intervals and is easy to explain. In practice, benchmark both against naive and seasonal naive on time-ordered validation (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does each ARIMA step use the Time Series Basics note?</summary><div class="qa-body">The I uses differencing and the ADF/KPSS tests; identification uses the ACF and PACF (PACF(2) formula = Yule-Walker φ₂); the seasonal period comes from the components analysis; the promotion clue came from the STL and model residuals (April 2022, October 2021); and the train/test split by time follows the leakage rules.</div></details>
</main>
`
});
