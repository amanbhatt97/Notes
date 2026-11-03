// notes/ml/ml_arima.js — ARIMA Family
Object.assign(TOPIC_CONTENT, {
  "ml_arima": `<main>
  <h1>ARIMA Family</h1>
  <div class="where"><span>Machine Learning</span><span>Time Series</span><span>ARIMA Family</span></div>
  <p class="lead">ARIMA is the classic statistical way to forecast a single time series. It writes the series' memory as an equation: this month's value is built from a few recent values (the AR part) and a few recent surprises (the MA part), after the trend and season have been removed by differencing (the I part). Because it is a proper probability model, it gives not only a forecast but an honest range around it, and it has been the standard benchmark in forecasting for fifty years. We will build the family one piece at a time on the same running example as <a class="xref" data-note="ml_timeseries">Time Series Basics</a>: Meera's chai shop, monthly sales in ₹ thousand from January 2020 to December 2024. We fit on 2020 to 2023 (48 months), keep 2024 hidden to judge the forecasts, and finish by adding her promotion calendar to the model, which turns out to explain the shop's biggest puzzle.</p>

  <h2 id="ar-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ARIMA Family</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The pieces</div>
        <ul>
          <li><b>AR(p)</b>: past values; PACF cuts off after p</li>
          <li><b>MA(q)</b>: past errors; ACF cuts off after q</li>
          <li><b>I(d)</b>: difference d times, integrate back</li>
          <li><b>Seasonal (P, D, Q)s</b>: the same at lag s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li>d, D from tests and plots; p, q, P, Q from ACF/PACF</li>
          <li>AIC = −2 log L + 2k; gaps under 2 are ties</li>
          <li>Compare AIC only with the same d and D</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Checking and forecasting</div>
        <ul>
          <li>Residuals must be white noise: Ljung-Box</li>
          <li>Future shocks = 0, past shocks = residuals</li>
          <li>Interval widens: var = σ²Σψ²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Meera's shop</div>
        <ul>
          <li>Airline (0,1,1)(0,1,1)12: θ −0.41, Θ −0.47</li>
          <li>Jan 2024: 134 ± 7.4; MAE 5.76 vs 14.75 seasonal naive</li>
          <li>+ promo (SARIMAX): β 6.64, AIC 201 → 153, MAE 4.70</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ar-ar"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Autoregressive Models: AR(p)</span><span class="rm-sub">predicting from the series' own past values</span></div></div>
      <div class="rm-item rm-done" data-target="ar-ma"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Moving-Average Models: MA(q)</span><span class="rm-sub">learning from past surprises</span></div></div>
      <div class="rm-item rm-done" data-target="ar-arma"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">ARMA: Both Kinds of Memory</span><span class="rm-sub">few parameters, rich memory</span></div></div>
      <div class="rm-item rm-done" data-target="ar-arima"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ARIMA: Differencing Inside the Model</span><span class="rm-sub">random walk, drift, backshift notation</span></div></div>
      <div class="rm-item rm-done" data-target="ar-sarima"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Seasonal ARIMA</span><span class="rm-sub">memory at lag 12; the airline model</span></div></div>
      <div class="rm-item rm-done" data-target="ar-ident"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Identification</span><span class="rm-sub">reading the orders from tests and plots</span></div></div>
      <div class="rm-item rm-done" data-target="ar-aic"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">AIC, BIC and Automatic Search</span><span class="rm-sub">choosing fairly between candidates</span></div></div>
      <div class="rm-item rm-done" data-target="ar-fit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Fitting and Reading the Summary</span><span class="rm-sub">maximum likelihood, every line explained</span></div></div>
      <div class="rm-item rm-done" data-target="ar-resid"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Residual Diagnostics</span><span class="rm-sub">the Ljung-Box test by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ar-fc"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Forecasts and Prediction Intervals</span><span class="rm-sub">January 2024 by hand, then the whole year</span></div></div>
      <div class="rm-item rm-done" data-target="ar-sarimax"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">SARIMAX: Outside Variables</span><span class="rm-sub">adding the promotion calendar</span></div></div>
      <div class="rm-item rm-done" data-target="ar-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">trending inputs, AIC across d, future regressors</span></div></div>
      <div class="rm-item rm-done" data-target="ar-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">equations, signatures, the shop's numbers</span></div></div>
      <div class="rm-item rm-done" data-target="ar-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about ARIMA</span></div></div>
    </div>
  </div>

  <h2 id="ar-ar"><span class="num">01</span>Autoregressive Models: AR(p)</h2>
  <p>The Basics note left us with three facts about Meera's sales. They need one ordinary and one seasonal difference to become stationary; the resulting series w ("did this month's change differ from the same change a year ago?") wobbles around zero; and w has memory, with a lag-1 autocorrelation of about −0.4. A regression on lag columns could already forecast one month ahead, but we still lack a model of how the series generates itself: one that can forecast any number of months ahead and say how uncertain each forecast is. That is what the ARIMA family provides. We start with the training data only, so that nothing from 2024 influences any choice we make.</p>
  <div class="fx" data-lang="py">import warnings; warnings.simplefilter("ignore")        # silence statsmodels start-up notices
train, test = y[:"2023"], y["2024":]                    # fit on 2020-2023, judge on 2024
w = train.diff().diff(12).dropna()                      # stationary version of the training data
print("train:", len(train), "months   test:", len(test), "months   w:", len(w), "values")
print("last 13 training months:", train[-13:].tolist())
print("last 3 values of w:", w[-3:].tolist())</div>
  <div class="fx" data-lang="text">train: 48 months   test: 12 months   w: 35 values
last 13 training months: [126, 125, 120, 125, 118, 119, 120, 128, 134, 132, 142, 141, 138]
last 3 values of w: [-2.0, 2.0, 0.0]</div>
  <p>The 48 training months give 35 values of w, because the two differences use up the first 13 months. The simplest model of memory says: this value is a fixed fraction of the last value, plus a fresh unpredictable shock. That is an <strong>autoregressive model of order 1</strong>, AR(1), "autoregressive" meaning a regression of the series on itself:</p>
  <p>w<sub>t</sub> = c + φ·w<sub>t−1</sub> + ε<sub>t</sub></p>
  <p>Here φ (phi) is the weight on last month, c is a constant, and ε<sub>t</sub> is <strong>white noise</strong>: independent shocks with mean 0 and variance σ². If φ is positive, good months follow good months (momentum); if negative, a high value tends to be followed by a low one (a give-back). Think of a cup of hot chai cooling in a room. Each minute it keeps a fixed fraction φ of its excess heat and picks up small random draughts. A disturbance, like pouring in more hot water, fades geometrically: with φ close to 1 the cup is a thermos and disturbances last a long time.</p>
  <p>Estimating φ is ordinary least squares on two columns, w<sub>t</sub> and w<sub>t−1</sub>. Because w has a mean of about zero we drop c, and the slope of a line through the origin is φ = Σ w<sub>t</sub>w<sub>t−1</sub> / Σ w<sub>t−1</sub>², which for a stationary series is essentially the lag-1 autocorrelation r₁. Then we forecast November 2023 by hand. October 2023 had w = −2, so the forecast of w is φ × (−2). To turn that back into sales we undo the two differences exactly as in the Basics note: ŷ<sub>Nov 2023</sub> = y<sub>Oct 2023</sub> + y<sub>Nov 2022</sub> − y<sub>Oct 2022</sub> + ŵ.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import acf, pacf
from statsmodels.tsa.arima_process import ArmaProcess
X1, Y1 = w.shift(1).dropna().values, w[1:].values       # w_t-1 and w_t side by side
phi = (X1 @ Y1) / (X1 @ X1)                             # least squares through the origin
print(f"phi (least squares) = {phi:.4f}   lag-1 autocorrelation r1 = {acf(w, nlags=1)[1]:.4f}")
w_oct = w["2023-10"].iloc[0]
w_nov_hat = phi * w_oct
y_nov_hat = y["2023-10"].iloc[0] + y["2022-11"].iloc[0] - y["2022-10"].iloc[0] + w_nov_hat
print(f"w Oct 2023 = {w_oct}  -&gt;  w_hat Nov = {phi:.4f} x {w_oct} = {w_nov_hat:.3f}")
print(f"sales_hat Nov 2023 = {y['2023-10'].iloc[0]} + {y['2022-11'].iloc[0]} - {y['2022-10'].iloc[0]} + {w_nov_hat:.3f}"
      f" = {y_nov_hat:.2f}   actual {y['2023-11'].iloc[0]}")
for ph in [0.7, -0.4]:                                  # theoretical ACF/PACF of AR(1)
    p = ArmaProcess(ar=[1, -ph], ma=[1])               # statsmodels writes AR as 1 - phi*B
    print(f"AR(1) phi={ph:+}: ACF {p.acf(5)[1:].round(3).tolist()}  PACF {p.pacf(5)[1:].round(3).tolist()}")
sim = ArmaProcess(ar=[1, -0.7], ma=[1]).generate_sample(300, distrvs=np.random.default_rng(3).standard_normal)
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
  <p>φ = −0.4043, the same as r₁: a give-back pattern. The forecast of w for November is −0.4043 × (−2) = +0.809, and the sales forecast is 142 + 129 − 132 + 0.809 = 139.81 against an actual 141. The next lines show what an AR(1) looks like in general. <code>ArmaProcess(ar=[1, -φ])</code> describes the model (statsmodels writes the AR side as the polynomial 1 − φB, so φ = 0.7 is passed as −0.7), and its <code>acf</code> and <code>pacf</code> give the theoretical values with infinite data. The ACF of an AR(1) is φ<sup>k</sup>: 0.7, 0.49, 0.343, 0.24, each bar 0.7 times the previous one; with φ = −0.4 the bars alternate in sign. The PACF is φ at lag 1 and exactly 0 afterwards: once you know last month, earlier months add nothing directly. A simulated path of 300 points shows the same shape with sampling noise.</p>
  <p>Why must |φ| be below 1? Substitute the equation into itself again and again: w<sub>t</sub> = ε<sub>t</sub> + φε<sub>t−1</sub> + φ²ε<sub>t−2</sub> + …. A shock from k months ago still contributes φ<sup>k</sup>. If |φ| &lt; 1 that influence fades, and the series has a stable mean c/(1 − φ) and a stable variance σ²/(1 − φ²); the simulation's variance, 1.84, is close to the theoretical 1/(1 − 0.49) = 1.96. If φ = 1 the shocks never fade: that is the random walk, a unit root. If |φ| &gt; 1 the series explodes.</p>
  <figure class="viz"><svg viewBox="0 0 680 230" width="680"><text x="120" y="18" text-anchor="middle" font-size="11.5">AR(1), φ = 0.7</text><line x1="20" y1="180" x2="220" y2="180" stroke="currentColor"/><rect x="26" y="50.0" width="13" height="130.0" class="fb sb"/><text x="32.5" y="195" text-anchor="middle" class="tm" font-size="9.5">0</text><text x="32.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="47" y="89.0" width="13" height="91.0" class="fb sb"/><text x="53.5" y="195" text-anchor="middle" class="tm" font-size="9.5">1</text><text x="53.5" y="85.0" text-anchor="middle" class="tm" font-size="9">0.70</text><rect x="68" y="116.3" width="13" height="63.7" class="fb sb"/><text x="74.5" y="195" text-anchor="middle" class="tm" font-size="9.5">2</text><text x="74.5" y="112.3" text-anchor="middle" class="tm" font-size="9">0.49</text><rect x="89" y="135.4" width="13" height="44.6" class="fb sb"/><text x="95.5" y="195" text-anchor="middle" class="tm" font-size="9.5">3</text><text x="95.5" y="131.4" text-anchor="middle" class="tm" font-size="9">0.34</text><rect x="110" y="148.8" width="13" height="31.2" class="fb sb"/><text x="116.5" y="195" text-anchor="middle" class="tm" font-size="9.5">4</text><rect x="131" y="158.2" width="13" height="21.8" class="fb sb"/><text x="137.5" y="195" text-anchor="middle" class="tm" font-size="9.5">5</text><rect x="152" y="164.7" width="13" height="15.3" class="fb sb"/><text x="158.5" y="195" text-anchor="middle" class="tm" font-size="9.5">6</text><rect x="173" y="169.3" width="13" height="10.7" class="fb sb"/><text x="179.5" y="195" text-anchor="middle" class="tm" font-size="9.5">7</text><rect x="194" y="172.5" width="13" height="7.5" class="fb sb"/><text x="200.5" y="195" text-anchor="middle" class="tm" font-size="9.5">8</text><text x="120" y="215" text-anchor="middle" class="tm" font-size="10">months after a shock of 1</text><text x="342" y="18" text-anchor="middle" font-size="11.5">MA(1), θ = 0.7</text><line x1="242" y1="180" x2="442" y2="180" stroke="currentColor"/><rect x="248" y="50.0" width="13" height="130.0" class="fr sr"/><text x="254.5" y="195" text-anchor="middle" class="tm" font-size="9.5">0</text><text x="254.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="269" y="89.0" width="13" height="91.0" class="fr sr"/><text x="275.5" y="195" text-anchor="middle" class="tm" font-size="9.5">1</text><text x="275.5" y="85.0" text-anchor="middle" class="tm" font-size="9">0.70</text><rect x="290" y="180.0" width="13" height="0.0" class="fr sr"/><text x="296.5" y="195" text-anchor="middle" class="tm" font-size="9.5">2</text><text x="296.5" y="176.0" text-anchor="middle" class="tm" font-size="9">0.00</text><rect x="311" y="180.0" width="13" height="0.0" class="fr sr"/><text x="317.5" y="195" text-anchor="middle" class="tm" font-size="9.5">3</text><text x="317.5" y="176.0" text-anchor="middle" class="tm" font-size="9">0.00</text><rect x="332" y="180.0" width="13" height="0.0" class="fr sr"/><text x="338.5" y="195" text-anchor="middle" class="tm" font-size="9.5">4</text><rect x="353" y="180.0" width="13" height="0.0" class="fr sr"/><text x="359.5" y="195" text-anchor="middle" class="tm" font-size="9.5">5</text><rect x="374" y="180.0" width="13" height="0.0" class="fr sr"/><text x="380.5" y="195" text-anchor="middle" class="tm" font-size="9.5">6</text><rect x="395" y="180.0" width="13" height="0.0" class="fr sr"/><text x="401.5" y="195" text-anchor="middle" class="tm" font-size="9.5">7</text><rect x="416" y="180.0" width="13" height="0.0" class="fr sr"/><text x="422.5" y="195" text-anchor="middle" class="tm" font-size="9.5">8</text><text x="342" y="215" text-anchor="middle" class="tm" font-size="10">months after a shock of 1</text><text x="564" y="18" text-anchor="middle" font-size="11.5">ARMA(1,1), φ = 0.6, θ = 0.4</text><line x1="464" y1="180" x2="664" y2="180" stroke="currentColor"/><rect x="470" y="50.0" width="13" height="130.0" class="fg sg"/><text x="476.5" y="195" text-anchor="middle" class="tm" font-size="9.5">0</text><text x="476.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="491" y="50.0" width="13" height="130.0" class="fg sg"/><text x="497.5" y="195" text-anchor="middle" class="tm" font-size="9.5">1</text><text x="497.5" y="46.0" text-anchor="middle" class="tm" font-size="9">1.00</text><rect x="512" y="102.0" width="13" height="78.0" class="fg sg"/><text x="518.5" y="195" text-anchor="middle" class="tm" font-size="9.5">2</text><text x="518.5" y="98.0" text-anchor="middle" class="tm" font-size="9">0.60</text><rect x="533" y="133.2" width="13" height="46.8" class="fg sg"/><text x="539.5" y="195" text-anchor="middle" class="tm" font-size="9.5">3</text><text x="539.5" y="129.2" text-anchor="middle" class="tm" font-size="9">0.36</text><rect x="554" y="151.9" width="13" height="28.1" class="fg sg"/><text x="560.5" y="195" text-anchor="middle" class="tm" font-size="9.5">4</text><rect x="575" y="163.2" width="13" height="16.8" class="fg sg"/><text x="581.5" y="195" text-anchor="middle" class="tm" font-size="9.5">5</text><rect x="596" y="169.9" width="13" height="10.1" class="fg sg"/><text x="602.5" y="195" text-anchor="middle" class="tm" font-size="9.5">6</text><rect x="617" y="173.9" width="13" height="6.1" class="fg sg"/><text x="623.5" y="195" text-anchor="middle" class="tm" font-size="9.5">7</text><rect x="638" y="176.4" width="13" height="3.6" class="fg sg"/><text x="644.5" y="195" text-anchor="middle" class="tm" font-size="9.5">8</text><text x="564" y="215" text-anchor="middle" class="tm" font-size="10">months after a shock of 1</text></svg><figcaption>How long a shock of size 1 echoes (the ψ-weights). AR(1): fades geometrically, 0.7, 0.49, 0.34 … and never quite reaches 0. MA(1): one echo of 0.7, then nothing. ARMA(1,1): an MA-like jump, then AR-like fading.</figcaption></figure>
  <p>One lag may not be enough memory. If the month two back also pushes directly, we add more lags, and the model becomes <strong>AR(p)</strong>:</p>
  <p>w<sub>t</sub> = c + φ₁w<sub>t−1</sub> + φ₂w<sub>t−2</sub> + … + φ<sub>p</sub>w<sub>t−p</sub> + ε<sub>t</sub></p>
  <p>Fitting is again a regression on the series' own lags, but there is an elegant shortcut that gets the weights straight from the autocorrelations, called the <strong>Yule-Walker equations</strong>. Multiply the AR(2) equation by w<sub>t−1</sub>, take averages and divide by the variance: you get r₁ = φ₁ + φ₂r₁. Do the same with w<sub>t−2</sub>: r₂ = φ₁r₁ + φ₂. Two equations, two unknowns. Solving them gives φ₁ = r₁(1 − r₂)/(1 − r₁²) and φ₂ = (r₂ − r₁²)/(1 − r₁²). Notice that φ₂ is exactly the PACF(2) formula from the Basics note: the last AR coefficient <em>is</em> the partial autocorrelation, which is why the PACF of an AR(p) cuts off after lag p. On the training w, r₁ = −0.4043 and r₂ = 0.0683, so φ₁ = −0.4043 × 0.9317/0.8365 = −0.4502 and φ₂ = (0.0683 − 0.1635)/0.8365 = −0.1137, a small direct lag-2 effect.</p>
  <div class="fx" data-lang="py">from statsmodels.regression.linear_model import yule_walker
r1, r2 = acf(w, nlags=2)[1:]
phi1 = r1 * (1 - r2) / (1 - r1 ** 2)
phi2 = (r2 - r1 ** 2) / (1 - r1 ** 2)
print(f"r1 = {r1:.4f}, r2 = {r2:.4f}")
print(f"Yule-Walker by hand: phi1 = {phi1:.4f}, phi2 = {phi2:.4f}")
print("statsmodels yule_walker:", yule_walker(w.values, order=2, method="mle")[0].round(4).tolist())
print(f"w_hat Jan 2024 = {phi1:.4f} x {w.iloc[-1]} + ({phi2:.4f}) x {w.iloc[-2]} = {phi1 * w.iloc[-1] + phi2 * w.iloc[-2]:.3f}")
roots = np.roots([-phi2, -phi1, 1])                    # roots of 1 - phi1 z - phi2 z^2
print("roots:", np.round(roots, 3).tolist(), " |root|:", np.round(np.abs(roots), 3).tolist())
print("PACF of an AR(2) (phi 0.5, 0.3):", ArmaProcess(ar=[1, -0.5, -0.3]).pacf(5)[1:].round(3).tolist())</div>
  <div class="fx" data-lang="text">r1 = -0.4043, r2 = 0.0683
Yule-Walker by hand: phi1 = -0.4502, phi2 = -0.1137
statsmodels yule_walker: [-0.4502, -0.1137]
w_hat Jan 2024 = -0.4502 x 0.0 + (-0.1137) x 2.0 = -0.227
roots: [(-1.979+2.208j), (-1.979-2.208j)]  |root|: [2.965, 2.965]
PACF of an AR(2) (phi 0.5, 0.3): [0.714, 0.3, 0.0, -0.0]</div>
  <p>statsmodels' <code>yule_walker</code> reproduces both coefficients. The AR(2) forecast of w for January 2024, from December (0) and November (2), is −0.227. The stationarity condition for AR(p) generalises |φ| &lt; 1: the roots of the polynomial 1 − φ₁z − φ₂z² must lie outside the unit circle, |z| &gt; 1. Here both roots have size 2.965, comfortably stationary. (<code>np.roots</code> takes coefficients from the highest power down, hence <code>[-φ₂, -φ₁, 1]</code>.) Check the roots rather than each coefficient separately: φ₁ = 0.6 and φ₂ = 0.5 are both below 1, yet together they make an explosive model. Finally, the theoretical PACF of an AR(2) with φ = (0.5, 0.3) is non-zero at lags 1 and 2 (the lag-2 value equals φ₂ = 0.3) and exactly zero after: the cut-off at p.</p>
  <p>One warning before moving on: fit AR only to a stationary series. A regression of raw sales on last month's sales gives a φ near 1 because the trend makes them move together, and section 12 shows what that does to the forecasts.</p>

  <h2 id="ar-ma"><span class="num">02</span>Moving-Average Models: MA(q)</h2>
  <p>In an AR model every shock is carried forward through the values and echoes forever, fading slowly. But some surprises matter for one month and then vanish completely. A one-month promotion lifts sales once and is gone the month after. How do we build a model whose memory is of the surprise itself, limited to a fixed number of months?</p>
  <p>A <strong>moving-average model</strong> of order q (which has nothing to do with rolling means, despite the name) says: this value is the mean, plus this month's shock, plus fractions of the last q shocks:</p>
  <p>w<sub>t</sub> = μ + ε<sub>t</sub> + θ₁ε<sub>t−1</sub> + … + θ<sub>q</sub>ε<sub>t−q</sub></p>
  <p>Think of a shopkeeper who over-ordered milk last week by 10 litres and orders 4 litres less this week to correct (θ = −0.4), then forgets about it. Her memory is of the mistake, and it lasts exactly one week. An AR shopkeeper instead remembers last week's sales level, and through it, faintly, every older week.</p>
  <p>The shocks are never observed directly. We recover them as forecast errors, one month at a time: the forecast for this month is θ × last month's error, and this month's error is the actual value minus that forecast. Let us run this recursion by hand for an MA(1) with θ = −0.41 (the value our fitted model will find), starting with an error of 0 before the first month. February 2021: forecast −0.41 × 0 = 0, error −2 − 0 = −2. March: forecast −0.41 × (−2) = 0.820, error −1 − 0.820 = −1.820. April: forecast −0.41 × (−1.82) = 0.746, error 0 − 0.746 = −0.746.</p>
  <div class="fx" data-lang="py">theta = -0.41                                       # an MA(1) coefficient (our fitted model gives about this)
e_prev, rows = 0.0, []                              # error before the first month: assume 0
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
      round(t2 / (1 + t2 ** 2), 4), " invertible?", ArmaProcess(ma=[1, t2]).isinvertible)</div>
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
invertible? True   theta=-2.439 gives the same r1: -0.351  invertible? False</div>
  <p>The table matches the hand recursion. Notice that an MA(1) has no information beyond one step ahead: the only shock it remembers is one month old, so the forecast for two or more months ahead is just the mean μ. The theory lines show the MA signature, the mirror image of AR. The lag-1 autocorrelation of an MA(1) is θ/(1 + θ²) = −0.41/1.168 = −0.351, and every later autocorrelation is exactly 0: the ACF cuts off after lag q (an MA(2) with weights 0.5 and 0.4 has ACF 0.496, 0.284, then 0). The PACF tails off instead (0.47, −0.283, 0.186, … for θ = 0.7).</p>
  <p>The last line shows a subtlety called <strong>invertibility</strong>. θ = −0.41 and its mirror 1/θ = −2.439 produce exactly the same autocorrelation, −0.351, so data alone cannot tell them apart. We always choose the one with |θ| &lt; 1, called the invertible one, because only then does the error recursion above settle down instead of exploding, and only then can the model be rewritten as an AR model in past values. A second subtlety is the sign convention: statsmodels and R write the MA part with plus signs (1 + θB), while the Box-Jenkins textbook writes 1 − θB. A "θ = 0.41" in one book is "θ = −0.41" in another, so check the library's convention before interpreting a sign.</p>

  <h2 id="ar-arma"><span class="num">03</span>ARMA: Both Kinds of Memory</h2>
  <p>Real series often have both kinds of memory: a short burst from the surprise itself, then a long fading tail. You could fake one with the other, but an MA(1) written as pure AR needs infinitely many lags, and vice versa. Box and Jenkins' <strong>principle of parsimony</strong> says: use the fewest parameters that capture the memory. An <strong>ARMA(p, q)</strong> model simply puts both parts into one equation:</p>
  <p>w<sub>t</sub> = c + φ₁w<sub>t−1</sub> + … + φ<sub>p</sub>w<sub>t−p</sub> + ε<sub>t</sub> + θ₁ε<sub>t−1</sub> + … + θ<sub>q</sub>ε<sub>t−q</sub></p>
  <p>An ARMA(1,1) with two parameters often fits what would otherwise need AR(5) or MA(5). Think of a rumour in a college hostel: the MA part is the first night's gossip about the event itself, the AR part is people repeating what they heard yesterday, fading each day. To see this, follow a single shock of size 1 through an ARMA(1,1) with φ = 0.6 and θ = 0.4. At month 0 it is 1. At month 1 the AR part carries 0.6 of it and the MA part adds 0.4 on top, so ψ₁ = φ + θ = 1.0. After that only the AR part remains: ψ₂ = 0.6 × 1.0 = 0.6, ψ₃ = 0.36, ψ₄ = 0.216. These echo sizes are called the <strong>ψ-weights</strong> (psi-weights), and they will decide how wide the forecast intervals are in section 10.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.arima.model import ARIMA
p = ArmaProcess(ar=[1, -0.6], ma=[1, 0.4])          # ARMA(1,1): phi = 0.6, theta = 0.4
print("ARMA(1,1) ACF ", p.acf(6)[1:].round(3).tolist())
print("ARMA(1,1) PACF", p.pacf(6)[1:].round(3).tolist())
print("ACF ratio r2/r1 =", round(p.acf(3)[2] / p.acf(3)[1], 3))
print("psi weights (echo of a shock of 1):", p.arma2ma(5).round(3).tolist())
sim = p.generate_sample(400, distrvs=np.random.default_rng(5).standard_normal)
fit = ARIMA(sim, order=(1, 0, 1)).fit()
print("fitted on 400 simulated points:", fit.params.round(3).tolist(), "(const, ar.L1, ma.L1, sigma2)")</div>
  <div class="fx" data-lang="text">ARMA(1,1) ACF  [0.756, 0.454, 0.272, 0.163, 0.098]
ARMA(1,1) PACF [0.756, -0.276, 0.109, -0.043, 0.017]
ACF ratio r2/r1 = 0.6
psi weights (echo of a shock of 1): [1.0, 1.0, 0.6, 0.36, 0.216]
fitted on 400 simulated points: [-0.182, 0.591, 0.502, 0.918] (const, ar.L1, ma.L1, sigma2)</div>
  <p><code>arma2ma</code> returns exactly the ψ-weights we computed. Both the ACF (0.756, 0.454, 0.272, …) and the PACF (0.756, −0.276, 0.109, …) tail off and neither cuts off, which is how an ARMA model shows itself in the plots; from lag 2 on, each ACF bar is φ = 0.6 times the previous one. Fitting <code>ARIMA(sim, order=(1, 0, 1))</code> on 400 simulated points recovers φ ≈ 0.59 and θ ≈ 0.50 against the true 0.6 and 0.4: the MA term is the harder one to pin down.</p>
  <figure class="viz"><svg viewBox="0 0 680 370" width="680"><text x="95" y="16" text-anchor="middle" class="tm" font-size="11">model</text><text x="285" y="16" text-anchor="middle" class="tm" font-size="11">ACF, lags 1–14</text><text x="545" y="16" text-anchor="middle" class="tm" font-size="11">PACF, lags 1–14</text><text x="95" y="68" text-anchor="middle" font-size="11.5">AR(1) φ=0.7</text><line x1="175" y1="64" x2="405" y2="64" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="32.5" width="9" height="31.5" class="fr sr"/><rect x="195" y="42.0" width="9" height="22.1" class="fr sr"/><rect x="211" y="48.6" width="9" height="15.4" class="fr sr"/><rect x="227" y="53.2" width="9" height="10.8" class="fr sr"/><rect x="243" y="56.4" width="9" height="7.6" class="fr sr"/><rect x="259" y="58.7" width="9" height="5.3" class="fr sr"/><rect x="275" y="60.3" width="9" height="3.7" class="fr sr"/><rect x="291" y="61.4" width="9" height="2.6" class="fr sr"/><rect x="307" y="62.2" width="9" height="1.8" class="fb sb"/><rect x="323" y="62.7" width="9" height="1.3" class="fb sb"/><rect x="339" y="63.1" width="9" height="0.9" class="fb sb"/><rect x="355" y="63.4" width="9" height="0.6" class="fb sb"/><rect x="371" y="63.6" width="9" height="0.6" class="fb sb"/><rect x="387" y="63.7" width="9" height="0.6" class="fb sb"/><line x1="435" y1="64" x2="665" y2="64" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="32.5" width="9" height="31.5" class="fr sr"/><rect x="455" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="471" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="487" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="503" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="519" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="535" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="551" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="567" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="583" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="615" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="631" y="64.0" width="9" height="0.6" class="fb sb"/><rect x="647" y="64.0" width="9" height="0.6" class="fb sb"/><text x="95" y="154" text-anchor="middle" font-size="11.5">MA(1) θ=0.7</text><line x1="175" y1="150" x2="405" y2="150" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="128.9" width="9" height="21.1" class="fr sr"/><rect x="195" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="211" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="227" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="243" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="259" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="275" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="291" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="307" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="323" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="339" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="355" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="371" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="387" y="150.0" width="9" height="0.6" class="fb sb"/><line x1="435" y1="150" x2="665" y2="150" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="128.9" width="9" height="21.1" class="fr sr"/><rect x="455" y="150.0" width="9" height="12.7" class="fr sr"/><rect x="471" y="141.6" width="9" height="8.4" class="fr sr"/><rect x="487" y="150.0" width="9" height="5.7" class="fr sr"/><rect x="503" y="146.1" width="9" height="3.9" class="fr sr"/><rect x="519" y="150.0" width="9" height="2.7" class="fr sr"/><rect x="535" y="148.1" width="9" height="1.9" class="fb sb"/><rect x="551" y="150.0" width="9" height="1.3" class="fb sb"/><rect x="567" y="149.1" width="9" height="0.9" class="fb sb"/><rect x="583" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="149.5" width="9" height="0.6" class="fb sb"/><rect x="615" y="150.0" width="9" height="0.6" class="fb sb"/><rect x="631" y="149.8" width="9" height="0.6" class="fb sb"/><rect x="647" y="150.0" width="9" height="0.6" class="fb sb"/><text x="95" y="240" text-anchor="middle" font-size="11.5">ARMA(1,1)</text><line x1="175" y1="236" x2="405" y2="236" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="202.0" width="9" height="34.0" class="fr sr"/><rect x="195" y="215.6" width="9" height="20.4" class="fr sr"/><rect x="211" y="223.8" width="9" height="12.2" class="fr sr"/><rect x="227" y="228.7" width="9" height="7.3" class="fr sr"/><rect x="243" y="231.6" width="9" height="4.4" class="fr sr"/><rect x="259" y="233.4" width="9" height="2.6" class="fr sr"/><rect x="275" y="234.4" width="9" height="1.6" class="fb sb"/><rect x="291" y="235.0" width="9" height="1.0" class="fb sb"/><rect x="307" y="235.4" width="9" height="0.6" class="fb sb"/><rect x="323" y="235.7" width="9" height="0.6" class="fb sb"/><rect x="339" y="235.8" width="9" height="0.6" class="fb sb"/><rect x="355" y="235.9" width="9" height="0.6" class="fb sb"/><rect x="371" y="235.9" width="9" height="0.6" class="fb sb"/><rect x="387" y="236.0" width="9" height="0.6" class="fb sb"/><line x1="435" y1="236" x2="665" y2="236" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="202.0" width="9" height="34.0" class="fr sr"/><rect x="455" y="236.0" width="9" height="12.4" class="fr sr"/><rect x="471" y="231.1" width="9" height="4.9" class="fr sr"/><rect x="487" y="236.0" width="9" height="2.0" class="fb sb"/><rect x="503" y="235.2" width="9" height="0.8" class="fb sb"/><rect x="519" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="535" y="235.9" width="9" height="0.6" class="fb sb"/><rect x="551" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="567" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="583" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="615" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="631" y="236.0" width="9" height="0.6" class="fb sb"/><rect x="647" y="236.0" width="9" height="0.6" class="fb sb"/><text x="95" y="326" text-anchor="middle" font-size="11.5">airline (θ −0.41, Θ −0.47)</text><line x1="175" y1="322" x2="405" y2="322" stroke="currentColor" stroke-opacity="0.6"/><rect x="179" y="322.0" width="9" height="15.8" class="fr sr"/><text x="183.5" y="370" text-anchor="middle" class="tm" font-size="9">1</text><rect x="195" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="211" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="227" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="243" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="259" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="275" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="291" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="307" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="323" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="339" y="315.9" width="9" height="6.1" class="fr sr"/><rect x="355" y="322.0" width="9" height="17.3" class="fr sr"/><text x="359.5" y="370" text-anchor="middle" class="tm" font-size="9">12</text><rect x="371" y="315.9" width="9" height="6.1" class="fr sr"/><rect x="387" y="322.0" width="9" height="0.6" class="fb sb"/><line x1="435" y1="322" x2="665" y2="322" stroke="currentColor" stroke-opacity="0.6"/><rect x="439" y="322.0" width="9" height="15.8" class="fr sr"/><text x="443.5" y="370" text-anchor="middle" class="tm" font-size="9">1</text><rect x="455" y="322.0" width="9" height="6.3" class="fr sr"/><rect x="471" y="322.0" width="9" height="2.6" class="fr sr"/><rect x="487" y="322.0" width="9" height="1.1" class="fb sb"/><rect x="503" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="519" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="535" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="551" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="567" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="583" y="322.0" width="9" height="0.6" class="fb sb"/><rect x="599" y="314.9" width="9" height="7.1" class="fr sr"/><rect x="615" y="322.0" width="9" height="14.8" class="fr sr"/><text x="619.5" y="370" text-anchor="middle" class="tm" font-size="9">12</text><rect x="631" y="322.0" width="9" height="5.9" class="fr sr"/><rect x="647" y="322.0" width="9" height="2.4" class="fr sr"/></svg><figcaption>Theoretical ACF and PACF for four models (red: bars clearly non-zero). AR(1): ACF fades, PACF one bar. MA(1): ACF one bar, PACF fades with alternating signs. ARMA(1,1): both fade. Airline model: ACF bars only at lags 1, 11, 12, 13; PACF fades around lags 1 and 12.</figcaption></figure>
  <p>The figure collects the signatures. AR(p): ACF tails off, PACF cuts off after p, a shock echoes forever while fading. MA(q): ACF cuts off after q, PACF tails off, a shock echoes exactly q steps. ARMA: both tail off. White noise: every bar near zero. One caution: bigger is not safer. If you fit an ARMA(2,2) "just in case" and its AR and MA roots nearly cancel (φ ≈ −θ), the model is not identified: the coefficients become large and unstable, with huge standard errors, while the fit barely changes. Start small and add terms only when the residual checks ask for them.</p>

  <h2 id="ar-arima"><span class="num">04</span>ARIMA: Differencing Inside the Model</h2>
  <p>Every model so far requires a stationary series, but Meera's sales keep climbing. The Basics note made them stationary by differencing. Rather than difference by hand and convert the forecasts back ourselves, we build the differencing into the model: difference the series d times, fit an ARMA to the differences, forecast the differences, and then add them back up to get levels. That adding-up step is called <strong>integration</strong>, and it is the I in <strong>ARIMA(p, d, q)</strong>: an ARMA(p, q) on the d-times differenced series. A series that becomes stationary after d differences is called "integrated of order d", I(d).</p>
  <p>The simplest member has no AR or MA terms at all: ARIMA(0,1,0), which says y<sub>t</sub> − y<sub>t−1</sub> = ε<sub>t</sub>. Each month's change is pure noise, so this is the random walk, and its best forecast for every future month is simply the last value. Add a constant to the differenced equation and you get a random walk with drift: each month moves by c on average. Think of a drunkard walking home: each step is random, so the best guess of where he will be in ten steps is where he is now, or a little further along the direction he tends to drift, and the uncertainty about his position keeps growing with every step.</p>
  <div class="fx" data-lang="py">rw = SARIMAX(train, order=(0, 1, 0)).fit(disp=False)    # ARIMA(0,1,0) = random walk
print("random walk forecast Jan-Mar 2024:", rw.forecast(3).round(2).tolist())
rwd = ARIMA(train, order=(0, 1, 0), trend="t").fit()   # with d=1, trend "t" = a constant drift per month
print("random walk + drift: drift =", round(rwd.params.iloc[0], 3), " forecast:", rwd.forecast(3).round(2).tolist())
print("average monthly change in train:", round(train.diff().mean(), 3))
changes = np.array([1.2, -0.5, 2.0])                    # pretend forecasts of diff(1)
print("level forecasts by running sum:", (train.iloc[-1] + np.cumsum(changes)).round(1).tolist())</div>
  <div class="fx" data-lang="text">random walk forecast Jan-Mar 2024: [138.0, 138.0, 138.0]
random walk + drift: drift = 0.83  forecast: [138.83, 139.66, 140.49]
average monthly change in train: 0.83
level forecasts by running sum: [139.2, 138.7, 140.7]</div>
  <p>The random walk forecasts 138 (December 2023's sales) for January, February and March: a flat line, which is the "naive" baseline. With drift, statsmodels estimates c as the average monthly change in training, 0.83, so the forecasts climb by 0.83 a month: 138.83, 139.66, 140.49. (In <code>ARIMA</code> with d = 1, <code>trend="t"</code> means a constant in the differenced equation, a drift.) The last line shows integration by hand: if a model forecasts the next three changes as +1.2, −0.5 and +2.0, the levels are 138 + 1.2 = 139.2, then 138.7, then 140.7, a running sum starting from the last actual value. It also explains why ARIMA intervals fan out: the level h months ahead is the last value plus h independent shocks, so its variance is h·σ², and the interval keeps widening like √h. That is the price of a unit root.</p>
  <p>Writing these equations by hand gets messy, so ARIMA uses a compact notation built on the <strong>backshift operator</strong> B, which shifts a series back one step: B·y<sub>t</sub> = y<sub>t−1</sub>, B²y<sub>t</sub> = y<sub>t−2</sub>. With it, a difference is (1 − B)y<sub>t</sub>, the AR part is the polynomial φ(B) = 1 − φ₁B − … − φ<sub>p</sub>B<sup>p</sup>, and the MA part is θ(B) = 1 + θ₁B + … + θ<sub>q</sub>B<sup>q</sup>. The whole model fits on one line:</p>
  <p>φ(B)(1 − B)<sup>d</sup>y<sub>t</sub> = c + θ(B)ε<sub>t</sub></p>
  <p>Polynomials in B multiply like ordinary polynomials, which lets us expand any model back into a plain equation. Take ARIMA(1,1,1): (1 − φB)(1 − B)y<sub>t</sub> = (1 + θB)ε<sub>t</sub>. Multiplying out the left side gives (1 − (1 + φ)B + φB²)y<sub>t</sub>, so y<sub>t</sub> = (1 + φ)y<sub>t−1</sub> − φy<sub>t−2</sub> + ε<sub>t</sub> + θε<sub>t−1</sub>. With φ = 0.5, θ = −0.3, last month's sales 138, the month before 141 and last month's error 2, the forecast is 1.5 × 138 − 0.5 × 141 − 0.3 × 2 = 207 − 70.5 − 0.6 = 135.9. Notice the coefficient on y<sub>t−1</sub> is 1 + φ, not φ: the AR and MA parts act on the differenced series, so reading "ARIMA(1,1,1) with φ = 0.5" as "this month is half of last month's sales" is wrong. Like a chemical formula, H₂O says "two hydrogens, one oxygen" without drawing the molecule; ARIMA(1,1,1) says "one AR lag, one difference, one MA lag" without writing the expanded equation.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Equation</th><th>Forecast behaviour</th></tr>
    <tr><td>ARIMA(0,0,0)</td><td>y<sub>t</sub> = c + ε<sub>t</sub></td><td>Flat at the mean (white noise)</td></tr>
    <tr><td>ARIMA(0,1,0)</td><td>y<sub>t</sub> = y<sub>t−1</sub> + ε<sub>t</sub></td><td>Naive: the last value (random walk)</td></tr>
    <tr><td>ARIMA(0,1,0) + c</td><td>y<sub>t</sub> = c + y<sub>t−1</sub> + ε<sub>t</sub></td><td>A straight line from the last value (drift)</td></tr>
    <tr><td>ARIMA(0,1,1)</td><td>y<sub>t</sub> = y<sub>t−1</sub> + ε<sub>t</sub> + θε<sub>t−1</sub></td><td>Same as simple exponential smoothing with α = 1 + θ</td></tr>
    <tr><td>ARIMA(0,2,2)</td><td>second differences, MA(2)</td><td>Same as Holt's linear trend</td></tr>
    <tr><td>ARIMA(p,0,0)</td><td>AR(p)</td><td>Decays to the mean</td></tr>
  </table>
  <p>The last rows link ARIMA to <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>: some smoothing methods are ARIMA models in disguise. One practical rule about constants: when d + D is 2 or more, a constant in the differenced equation implies a quadratic trend in sales, which forecasts explosive growth. statsmodels' <code>SARIMAX</code> includes no constant by default; add a drift only when d + D = 1 and the differenced series clearly has a non-zero mean.</p>

  <h2 id="ar-sarima"><span class="num">05</span>Seasonal ARIMA</h2>
  <p>Meera's strongest pattern repeats every 12 months, and the ACF of w had a spike at lag 12 (−0.31): a surprise in one November is partly reversed the next November. Catching memory at lag 12 with ordinary AR terms would need φ₁ to φ₁₂, eleven of them useless. The solution is to apply the same AR, I and MA ideas at the seasonal lag s: a seasonal difference (1 − B<sup>s</sup>)<sup>D</sup>, seasonal AR terms Φ(B<sup>s</sup>) = 1 − Φ₁B<sup>s</sup> − …, and seasonal MA terms Θ(B<sup>s</sup>) = 1 + Θ₁B<sup>s</sup> + …, all multiplied together with the ordinary ones. This is <strong>seasonal ARIMA</strong>, written SARIMA(p, d, q)(P, D, Q)<sub>s</sub>:</p>
  <p>φ(B)Φ(B<sup>s</sup>)(1 − B)<sup>d</sup>(1 − B<sup>s</sup>)<sup>D</sup>y<sub>t</sub> = θ(B)Θ(B<sup>s</sup>)ε<sub>t</sub></p>
  <p>Think of two calendars hanging side by side: a monthly one ("last month was unusual, adjust a little") and a yearly one ("last November was unusual, adjust this November"). Multiplying the polynomials is how the two calendars interact.</p>
  <p>The most famous member is SARIMA(0,1,1)(0,1,1)<sub>12</sub>, first fitted by Box and Jenkins to monthly airline passenger counts and still called the <strong>airline model</strong>. It is the classic model for monthly data with a trend and a season:</p>
  <p>(1 − B)(1 − B¹²)y<sub>t</sub> = (1 + θB)(1 + ΘB¹²)ε<sub>t</sub></p>
  <p>Let us expand both sides by hand. The left side is y<sub>t</sub> − y<sub>t−1</sub> − y<sub>t−12</sub> + y<sub>t−13</sub>, which is exactly w. The right side is ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub>: the multiplication creates a lag-13 term with coefficient θΘ, which with θ = −0.41 and Θ = −0.47 is 0.1927. Moving the y terms across:</p>
  <p>y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub></p>
  <p>In words: start from last month, add last year's month-to-month change, then correct for last month's surprise, last year's same-month surprise, and their interaction. Its ACF is easy to predict: r₁ = θ/(1 + θ²) = −0.351, r₁₂ = Θ/(1 + Θ²) = −0.385, and the product term makes r₁₁ = r₁₃ = r₁ × r₁₂ = +0.135; every other lag is zero.</p>
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
  <p><code>np.polymul</code> multiplies the two polynomials (written highest power first, then reversed), giving −0.41, −0.47 and 0.1927 at lags 1, 12 and 13, and the theoretical ACF matches the hand formulas at every lag. Now compare with Meera's actual ACF of w: −0.41 at lag 1, −0.31 at lag 12, +0.28 at lag 11. The same fingerprint. In statsmodels the model is <code>SARIMAX(y, order=(p, d, q), seasonal_order=(P, D, Q, s))</code>, and its seasonal parameters are named <code>ar.S.L12</code> and <code>ma.S.L12</code>. A caution: seasonal parameters are estimated from year-to-year comparisons, so four training years give only three seasonal differences per calendar month. With fewer than three or four full seasons, prefer a simpler seasonal treatment such as seasonal naive, seasonal dummies or exponential smoothing.</p>

  <h2 id="ar-ident"><span class="num">06</span>Identification</h2>
  <p>We now have a large family with six orders to choose: d and D (how many differences), p and q (ordinary AR and MA terms), P and Q (seasonal ones). Choosing them from the data is called <strong>identification</strong>, the first step of the <strong>Box-Jenkins method</strong>: (1) identify, by transforming and differencing to stationarity and reading the ACF and PACF to propose orders; (2) estimate, by fitting the candidates; (3) check, by testing that the residuals are white noise, and go back if not; (4) forecast. Think of a doctor's first examination: temperature and blood tests suggest two or three possible illnesses, not a single diagnosis. The ACF and PACF are the examination; the information criteria and residual checks in the next sections are the further tests that decide. Everything here uses the 2020 to 2023 training data only.</p>
  <div class="fx" data-lang="py">from statsmodels.tsa.stattools import adfuller
for name, s in [("train", train), ("diff(1)", train.diff()), ("diff(12)", train.diff(12)), ("both", w)]:
    print(f"{name:9s} ADF p = {adfuller(s.dropna())[1]:.3f}")
print("ACF of diff(1) only, lags 12 and 24:", acf(train.diff().dropna(), nlags=24)[[12, 24]].round(2).tolist())
print("ACF  of w, lags 1-13:", acf(w, nlags=13)[1:].round(2).tolist())
print("PACF of w, lags 1-13:", pacf(w, nlags=13, method="ywm")[1:].round(2).tolist())
print("95% band: +/-", round(1.96 / np.sqrt(len(w)), 3))</div>
  <div class="fx" data-lang="text">train     ADF p = 0.995
diff(1)   ADF p = 0.001
diff(12)  ADF p = 0.026
both      ADF p = 0.000
ACF of diff(1) only, lags 12 and 24: [0.61, 0.32]
ACF  of w, lags 1-13: [-0.4, 0.07, 0.06, 0.21, -0.19, -0.03, 0.28, -0.11, -0.09, -0.13, 0.27, -0.33, -0.02]
PACF of w, lags 1-13: [-0.4, -0.11, 0.05, 0.32, 0.04, -0.17, 0.18, 0.08, -0.07, -0.35, -0.02, -0.1, -0.14]
95% band: +/- 0.331</div>
  <p>First d and D. Raw training sales fail ADF (p = 0.995). On these 48 months each single difference passes ADF, but <code>diff(1)</code> still has an autocorrelation of 0.61 at lag 12 and 0.32 at lag 24: the yearly pattern is untouched, so we need D = 1. <code>diff(12)</code> alone passes only narrowly (p = 0.026) and its yearly growth wandered, so we also take d = 1. Both together give p = 0.000, in agreement with the full-series tests in the Basics note.</p>
  <p>Next the non-seasonal part. The ACF is −0.40 at lag 1, then small (0.07, 0.06): a cut-off after lag 1, suggesting q = 1. But the PACF is −0.40 and then −0.11, 0.05: also a cut-off after lag 1, suggesting p = 1 just as well. Both are candidates. For the seasonal part, the ACF at lag 12 is −0.33, right at the edge of the wide ±0.331 band (only 35 values), while the PACF at lag 12 is −0.10, which suggests a seasonal MA term (Q = 1) with a seasonal AR term (P = 1) as the fallback. A few bars near the band at lags 4, 7, 10 and 11 are what chance produces among 26 bars on 35 points; no simple model explains them, so we ignore them. Our candidates are therefore (0,1,1)(0,1,1)<sub>12</sub>, the airline model, and (1,1,0)(0,1,1)<sub>12</sub>, plus their seasonal-AR cousins and slightly larger models. The plots cannot choose between them; we need a score.</p>

  <h2 id="ar-aic"><span class="num">07</span>AIC, BIC and Automatic Search</h2>
  <p>A bigger model always fits the training data at least as well as a smaller one nested inside it, so "best fit" would always pick the biggest model, which then forecasts badly. We need one number that rewards fit and charges for complexity. Fit is measured by the <strong>log-likelihood</strong>, log L: how probable the observed data are under the fitted model, higher being better. The <strong>Akaike Information Criterion</strong> turns it into a cost and adds a charge of 2 per estimated parameter; the <strong>Bayesian Information Criterion</strong> charges ln(n) per parameter instead, which is harsher once n is above about 7. For both, lower is better:</p>
  <p>AIC = −2 log L + 2k        BIC = −2 log L + k ln n</p>
  <p>Here k counts every estimated parameter, including the noise variance σ², and n is the number of observations the likelihood actually uses. Think of picking a cricket squad: each extra player may add a few runs but costs a salary. AIC is "runs minus a fixed salary per player"; BIC charges a higher salary, so it picks smaller squads. For the airline model, log L = −97.704, k = 3 (θ, Θ and σ²) and n = 35 (48 months minus 13 lost to differencing), so AIC = 195.408 + 6 = 201.41 and BIC = 195.408 + 3 × ln 35 = 195.408 + 10.666 = 206.07. Let us score twelve candidates.</p>
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
  <p>The hand calculations match. Now read the table. The four three-parameter models with one non-seasonal and one seasonal term are within 0.2 AIC of each other (201.2 to 201.4). An AIC difference below about 2 is not meaningful evidence, so these four are a tie, exactly as the ambiguous plots predicted. Every model without a seasonal term is clearly worse (204.3 or more): the lag-12 memory is real, even though its ACF bar only touched the band. Adding a second parameter, as in (2,1,0) or (1,1,1), raises log L slightly but not enough to pay the penalty, so AIC goes up by about 1.3. We choose the airline model: it is tied on AIC, it is the standard and best-studied model for this kind of series, and its MA form matches the "give back last month's surprise" story. (Section 11 will show that the tie was hiding something.) For small samples there is also <strong>AICc</strong> = AIC + 2k(k + 1)/(n − k − 1), a corrected version (here 201.41 + 24/31 = 202.18), which is the default in most automatic tools.</p>
  <p>Identification by eye does not scale: with hundreds of products, nobody reads hundreds of correlograms. Automatic tools such as R's <code>auto.arima</code>, Python's <code>pmdarima.auto_arima(y, seasonal=True, m=12)</code> and <code>statsforecast</code>'s <code>AutoARIMA</code> implement the <strong>Hyndman-Khandakar algorithm</strong>. It chooses D with a seasonal test, then d with repeated KPSS tests; fits a few starting models; then moves step by step, trying each neighbour that changes p, q, P or Q by ±1 (or adds or removes the constant) and moving to any neighbour with lower AICc, until no neighbour improves; models with roots too close to the unit circle are rejected. Think of finding the lowest point of a hilly field in fog: stepwise search feels the ground around your feet and steps downhill until every direction goes up. It is fast but can stop in a local dip; the exhaustive grid walks the whole field. Here is the exhaustive version on our data, with d = D = 1:</p>
  <div class="fx" data-lang="py">import itertools
results = []
for p, q, P, Q in itertools.product(range(3), range(3), range(2), range(2)):   # 36 candidates, d = D = 1
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
  <p>All 36 combinations of p, q ∈ {0, 1, 2} and P, Q ∈ {0, 1} find the same four-way tie at the top (201.22 to 201.41), including the airline model, and put the model with no AR or MA terms at all last at 208.45. An automatic search would hand us (1,1,0)(1,1,0)<sub>12</sub>, which is as good as our choice by AIC. Two lessons follow. On a tie, prefer the model whose forecasts you can explain and check it on held-out data. And never compare AIC across different d or D: differencing changes the data the likelihood is computed on, so those AICs are not comparable (section 12 shows how badly). Choose d and D first, then compare p, q, P, Q.</p>

  <h2 id="ar-fit"><span class="num">08</span>Fitting and Reading the Summary</h2>
  <p>Having chosen the airline model, we need its best values of θ, Θ and σ², how sure we are of each, and what the rest of the software's output means. statsmodels' <code>SARIMAX</code> writes the model in a form called state space and runs the <strong>Kalman filter</strong>, which produces, for every month, the one-step forecast and its error. The log-likelihood is computed from those errors assuming they are normal, and an optimiser adjusts θ, Θ and σ² to make it as large as possible. This is <strong>maximum likelihood estimation</strong>. For pure AR models it is close to least squares; MA terms make the errors depend on the parameters themselves (as in the recursion of section 02), so there is no closed-form answer and the optimiser is needed.</p>
  <div class="fx" data-lang="py">air = SARIMAX(train, order=(0, 1, 1), seasonal_order=(0, 1, 1, 12)).fit(disp=False)
print(air.summary())</div>
  <div class="fx" data-lang="text">                                     SARIMAX Results                                      
==========================================================================================
Dep. Variable:                              sales   No. Observations:                   48
Model:             SARIMAX(0, 1, 1)x(0, 1, 1, 12)   Log Likelihood                 -97.704
Date:                            Tue, 03 Nov 2026   AIC                            201.407
Time:                                    11:24:21   BIC                            206.073
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
  <p>Think of this as a medical report: the top block is the patient's identification and overall scores, the middle block the measurements with their normal ranges, and the bottom block the screening tests. A good doctor reads all three. In the top block, No. Observations is 48 (the likelihood effectively uses 35 after differencing), Log Likelihood is −97.704, and AIC, BIC and HQIC are the scores we computed by hand. "Covariance Type: opg" says the standard errors come from the outer product of gradients, a fast approximation.</p>
  <p>The middle block holds the coefficients. <code>ma.L1</code> = −0.4115 is θ: 41% of last month's surprise is given back this month. Its standard error is 0.145, z = coefficient / standard error = −2.839, and P&gt;|z| = 0.005, so it is clearly non-zero; the 95% confidence interval [−0.695, −0.127] is the coefficient ± 1.96 standard errors. <code>ma.S.L12</code> = −0.4723 is Θ: 47% of last year's same-month surprise is given back. Its p-value is 0.101, so it is not significant at 5%: four years are little data for a yearly parameter. Yet AIC preferred keeping it (removing it raises AIC from 201.4 to 204.7), and in forecasting we judge terms by AIC, residual checks and held-out error rather than by significance alone. <code>sigma2</code> = 14.22 is the variance of the one-step errors, so a typical one-step error is √14.22 = 3.77 thousand.</p>
  <p>The bottom block is a set of checks on the residuals. Ljung-Box (L1) Q = 0.29 with Prob(Q) = 0.59 tests for leftover autocorrelation at lag 1 and finds none (the next section explains this test). Jarque-Bera JB = 9.26 with Prob(JB) = 0.01 tests whether the residuals are normal, combining skewness and kurtosis, and rejects: Skew −0.73 and Kurtosis 5.05 (normal values are 0 and 3) mean a long left tail and too many extreme errors. Heteroskedasticity H = 1.16 with Prob(H) = 0.80 compares the residual variance in the last third with the first third; 1.16 is not significantly different from 1, so the variance is stable. So the summary already hints at the story: no leftover memory, but some unusually large errors.</p>

  <h2 id="ar-resid"><span class="num">09</span>Residual Diagnostics</h2>
  <p>If a model has captured all the memory in the data, its one-step errors (the <strong>residuals</strong>) should be white noise: no autocorrelation, constant variance, ideally normal. Think of squeezing a lemon. When the model has extracted all the juice, what is left in your hand is dry pulp with no pattern; if you can still squeeze drops out (autocorrelation), keep squeezing by adding terms; and odd lumps in the pulp (outliers) mean something else got into the lemon.</p>
  <p>Checking each residual ACF bar separately invites false alarms, so we use one combined test. The <strong>Ljung-Box test</strong> adds up the squared residual autocorrelations of the first h lags, each weighted for its sample size:</p>
  <p>Q(h) = n(n + 2) Σ<sub>k=1..h</sub> r<sub>k</sub>² / (n − k)</p>
  <p>If the residuals are white noise, Q follows a chi-square distribution with h degrees of freedom (reduced by the number of ARMA parameters in a common correction). A large Q, with a small p-value, means some autocorrelation is left and the model missed memory. By hand for h = 3: the residual autocorrelations on the 35 usable months are r₁ = −0.0713, r₂ = 0.0948, r₃ = 0.1066. Then r₁²/34 = 0.00015, r₂²/33 = 0.00027, r₃²/32 = 0.00036; their sum, 0.000777, times 35 × 37 = 1,295 gives Q(3) = 1.006. The 95% cut-off of a chi-square with 3 degrees of freedom is 7.81, so 1.006 is far below it.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.diagnostic import acorr_ljungbox
res = air.resid[13:]                                # first 13 residuals are start-up artefacts (d + 12D)
n = len(res)
rk = acf(res, nlags=3)[1:]
terms = [rk[k - 1] ** 2 / (n - k) for k in (1, 2, 3)]
print("residual ACF lags 1-3:", rk.round(4).tolist(), " n =", n)
print(f"Q(3) = {n}x{n + 2} x ({' + '.join(f'{t:.5f}' for t in terms)}) = {n * (n + 2) * sum(terms):.3f}")
print(acorr_ljungbox(res, lags=[3, 6, 12]).round(3))
print("residual mean:", round(res.mean(), 3), "  std:", round(res.std(), 3),
      "  sqrt(sigma2):", round(np.sqrt(air.params["sigma2"]), 3))
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
  <p>The first 13 residuals are dropped: the model cannot form proper one-step errors until it has 13 months of history (d + sD = 1 + 12), and statsmodels fills those with large start-up values. The hand Q(3) = 1.006 matches <code>acorr_ljungbox</code>, and the p-values at 3, 6 and 12 lags (0.80, 0.84, 0.79) all say the same thing: no autocorrelation left, the model used the memory. The residual mean is −0.19, close to 0, and the standard deviation 3.97 is close to √σ² = 3.77: consistent.</p>
  <p>But passing Ljung-Box only means "no linear memory left"; it does not mean "accurate forecasts" or "the right model". The largest residuals tell a story. April 2022 (−12.5): in 2020, 2021 and 2024 April had the spring offer, but in 2022 it ran in March, and the model, which had learnt "April is high" from earlier Aprils, over-forecast. October 2021 (−10.0): the one October without the Diwali offer. May 2023 (+7.8): an offer in an unusual month. These are the heavy tails that failed the Jarque-Bera test. The promotions are not noise; they are information the model does not have. In code, <code>air.plot_diagnostics()</code> draws the four standard plots (residuals over time, histogram, normal Q-Q plot and residual correlogram).</p>
  <table class="tbl">
    <tr><th>Check</th><th>Tool</th><th>Shop</th><th>If it fails</th></tr>
    <tr><td>No autocorrelation</td><td>Ljung-Box, residual ACF</td><td>p 0.80: pass</td><td>Add AR/MA or seasonal terms</td></tr>
    <tr><td>Mean ≈ 0</td><td>mean of residuals</td><td>−0.19: pass</td><td>Add a constant or drift</td></tr>
    <tr><td>Constant variance</td><td>H test, plot</td><td>p 0.80: pass</td><td>Log or Box-Cox; GARCH for volatility</td></tr>
    <tr><td>Normality</td><td>Jarque-Bera, Q-Q plot</td><td>p 0.01: fail</td><td>Find the outliers' cause; intervals may be too narrow</td></tr>
  </table>

  <h2 id="ar-fc"><span class="num">10</span>Forecasts and Prediction Intervals</h2>
  <p>The model is adequate in the white-noise sense. How does it turn the last months of 2023 into a forecast for January 2024, and why do its intervals get wider for later months? A forecast uses the expanded level equation from section 05, with one rule: every future shock is replaced by its expected value, 0, and every past shock by the model's past one-step error e.</p>
  <p>For January 2024 the equation splits into two parts. The base is y<sub>Dec 2023</sub> + y<sub>Jan 2023</sub> − y<sub>Dec 2022</sub> = 138 + 125 − 126 = 137: "last month, plus last year's January-over-December change". The MA correction is θ·e<sub>Dec 2023</sub> + Θ·e<sub>Jan 2023</sub> + θΘ·e<sub>Dec 2022</sub>. January 2023 was 6.2 above what the model expected; the model assumes about half of that was a one-off and takes it back.</p>
  <div class="fx" data-lang="py">th, Th, s2 = air.params["ma.L1"], air.params["ma.S.L12"], air.params["sigma2"]
e = air.resid
base = train.iloc[-1] + train.iloc[-12] - train.iloc[-13]
ma_part = th * e.iloc[-1] + Th * e.iloc[-12] + th * Th * e.iloc[-13]
print(f"base = {train.iloc[-1]} + {train.iloc[-12]} - {train.iloc[-13]} = {base}")
print(f"errors used: e(Dec23) = {e.iloc[-1]:.3f}, e(Jan23) = {e.iloc[-12]:.3f}, e(Dec22) = {e.iloc[-13]:.3f}")
print(f"MA part = {th:.4f}x{e.iloc[-1]:.3f} + {Th:.4f}x{e.iloc[-12]:.3f} + {th * Th:.4f}x{e.iloc[-13]:.3f} = {ma_part:.3f}")
print(f"forecast Jan 2024 by hand = {base + ma_part:.3f}   statsmodels: {air.forecast(1).iloc[0]:.3f}")
fc = air.get_forecast(12)
se = fc.se_mean
print(f"h=1 interval: +/- 1.96 x sqrt({s2:.3f}) = +/- {1.96 * np.sqrt(s2):.2f}")
print(f"h=2 std error: sqrt(s2 x (1 + (1 + theta)^2)) = {np.sqrt(s2 * (1 + (1 + th) ** 2)):.3f}   statsmodels: {se.iloc[1]:.3f}")
ci = fc.conf_int(alpha=0.05)
print(pd.DataFrame({"actual": test, "forecast": fc.predicted_mean.round(1), "lower": ci.iloc[:, 0].round(1),
                    "upper": ci.iloc[:, 1].round(1), "se": se.round(2)}))
inside = ((test &gt;= ci.iloc[:, 0]) &amp; (test &lt;= ci.iloc[:, 1])).sum()
print("actuals inside the 95% interval:", inside, "of 12")
print("MAE  airline:", mae(fc.predicted_mean), " seasonal naive:", mae(train[-12:]),
      " naive:", mae([train.iloc[-1]] * 12), " drift:", mae(rwd.forecast(12)))</div>
  <div class="fx" data-lang="text">base = 138 + 125 - 126 = 137
errors used: e(Dec23) = 2.179, e(Jan23) = 6.198, e(Dec22) = 4.033
MA part = -0.4115x2.179 + -0.4723x6.198 + 0.1943x4.033 = -3.040
forecast Jan 2024 by hand = 133.960   statsmodels: 134.045
h=1 interval: +/- 1.96 x sqrt(14.217) = +/- 7.39
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
  <p>The correction is −0.897 − 2.927 + 0.784 = −3.040, so the forecast is 137 − 3.040 = 133.96, against an actual of 133. statsmodels gives 134.045; the small gap is because its Kalman filter treats the earliest months as uncertain (a "diffuse" start), and with only 35 usable months that start-up uncertainty has not fully faded, whereas our hand formula assumes the past errors are known exactly.</p>
  <p>Now the interval. One step ahead, the only thing we cannot know is the single new shock ε, with variance σ² = 14.22, so a 95% interval is ±1.96 × √14.22 = ±7.39. Two steps ahead, the forecast also misses next month's shock, which reaches month 2 with weight ψ₁ = 1 + θ (one from the integration, θ from the MA term), so the variance becomes σ²(1 + ψ₁²) and the standard error 4.375 (statsmodels: 4.388). In general the h-step variance is σ²(ψ₀² + ψ₁² + … + ψ<sub>h−1</sub>²), using the ψ-weights of the whole model including its differences. Each extra month adds one more unknown shock on top of those already there, so the band fans out, like a weather forecast that is ±2 degrees for tomorrow and ±6 for next week. The standard error grows from 3.78 in January to 8.28 in December, so the interval widens from ±7.4 to ±16.2.</p>
  <figure class="viz"><svg viewBox="0 0 680 280" width="680"><line x1="60" y1="216.9" x2="660" y2="216.9" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="220.9" text-anchor="end" class="tm" font-size="10.5">100</text><line x1="60" y1="164.4" x2="660" y2="164.4" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="168.4" text-anchor="end" class="tm" font-size="10.5">120</text><line x1="60" y1="111.9" x2="660" y2="111.9" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="115.9" text-anchor="end" class="tm" font-size="10.5">140</text><line x1="60" y1="59.4" x2="660" y2="59.4" stroke="currentColor" stroke-opacity="0.15"/><text x="52" y="63.4" text-anchor="end" class="tm" font-size="10.5">160</text><polygon points="471.4,108.0 488.6,119.4 505.7,99.4 522.9,116.1 540.0,120.9 557.1,109.2 574.3,84.0 591.4,66.4 608.6,68.3 625.7,40.7 642.9,41.9 660.0,50.9 660.0,136.1 642.9,124.0 625.7,119.5 608.6,143.8 591.4,138.3 574.3,152.2 557.1,173.5 540.0,180.9 522.9,171.7 505.7,150.0 488.6,164.6 471.4,147.0" class="fb" stroke="none"/><line x1="462.9" y1="20" x2="462.9" y2="230" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.6"/><text x="456.9" y="30" text-anchor="end" class="tm" font-size="10.5">train (2022–2023 shown)</text><text x="468.9" y="30" class="tm" font-size="10.5">test 2024</text><polyline points="60.0,190.6 77.1,206.4 94.3,180.1 111.4,216.9 128.6,222.1 145.7,206.4 162.9,180.1 180.0,161.8 197.1,164.4 214.3,132.9 231.4,140.8 248.6,148.6 265.7,151.2 282.9,164.4 300.0,151.2 317.1,169.6 334.3,167.0 351.4,164.4 368.6,143.4 385.7,127.6 402.9,132.9 420.0,106.6 437.1,109.2 454.3,117.1 471.4,130.2 488.6,143.4 505.7,122.4 522.9,122.4 540.0,140.8 557.1,122.4 574.3,101.4 591.4,85.6 608.6,93.5 625.7,59.4 642.9,59.4 660.0,59.4" fill="none" stroke="currentColor" stroke-width="1.8"/><polyline points="471.4,127.5 488.6,142.0 505.7,124.7 522.9,143.9 540.0,150.9 557.1,141.3 574.3,118.1 591.4,102.4 608.6,106.1 625.7,80.1 642.9,82.9 660.0,93.5" fill="none" class="sb" stroke-width="2.2" stroke-dasharray="6 3"/><polyline points="471.4,125.2 488.6,140.2 505.7,126.4 522.9,127.2 540.0,157.2 557.1,138.5 574.3,114.3 591.4,99.1 608.6,101.4 625.7,72.2 642.9,78.4 660.0,91.7" fill="none" class="sg" stroke-width="2.2"/><text x="162.9" y="246" text-anchor="middle" class="tm" font-size="11">2022</text><text x="368.6" y="246" text-anchor="middle" class="tm" font-size="11">2023</text><text x="574.3" y="246" text-anchor="middle" class="tm" font-size="11">2024</text><line x1="70" y1="266" x2="96" y2="266" stroke="currentColor" stroke-width="1.8"/><text x="102" y="270" font-size="11">actual sales</text><line x1="210" y1="266" x2="236" y2="266" class="sb" stroke-width="2.2" stroke-dasharray="6 3"/><text x="242" y="270" font-size="11">airline forecast</text><rect x="370" y="260" width="22" height="12" class="fb"/><text x="398" y="270" font-size="11">its 95% interval</text><line x1="520" y1="266" x2="546" y2="266" class="sg" stroke-width="2.2"/><text x="552" y="270" font-size="11">with promo (SARIMAX)</text></svg><figcaption>Training data (2022–2023 shown), the 2024 actuals, the airline forecast with its 95% interval (shaded, widening with the horizon), and the SARIMAX forecast with the promotion flag (section 11).</figcaption></figure>
  <p>The 12-month forecast follows the season, peaking in October and November, and grows with the base. All 12 actual values fall inside their 95% intervals, though the forecasts are mostly a little low because 2024 grew faster than the growth the model carried forward. On mean absolute error the airline model scores 5.76, against 7.76 for the random walk with drift, 10.25 for naive and 14.75 for seasonal naive: it beats every baseline.</p>
  <p>Do not trust ARIMA intervals too much, though. They assume normal errors (ours failed the normality test, so the true tails are heavier) and they ignore the uncertainty in the estimated parameters and in the chosen orders. In practice they are usually too narrow. Check their coverage on held-out data (12 of 12 here, a good sign on a small sample) and widen them if needed.</p>

  <h2 id="ar-sarimax"><span class="num">11</span>SARIMAX: Outside Variables</h2>
  <p>Every model so far, including the automatic ones, sees only past sales. The residuals pointed straight at the promotions, and Meera knows her promotion calendar in advance. How do we feed that knowledge in? <strong>SARIMAX</strong> (the X stands for eXogenous) is a regression on outside variables whose errors follow a SARIMA model:</p>
  <p>y<sub>t</sub> = β·x<sub>t</sub> + u<sub>t</sub>,    u<sub>t</sub> ~ SARIMA(p, d, q)(P, D, Q)<sub>s</sub></p>
  <p>β is read like an ordinary regression coefficient, "a promotion month adds β to sales, all else equal", and the SARIMA part models whatever the promotions do not explain. (statsmodels differences x along with y internally, so β keeps its meaning in sales units.) Think of a doctor tracking a patient's blood sugar who had been treating the spikes as random. Once the patient's meal diary is added, most spikes are explained by sweets on festival days; what is left is a much smaller, steadier pattern, and next week's forecast can use the planned festival dates.</p>
  <p>Before running it, a small hand calculation predicts something surprising. Take a flat series 100, 100, 100 and a one-month promotion adding 6 in the middle: 100, 106, 100. Its differences are +6 and −6: an up followed by a down, which is a negative lag-1 autocorrelation. The airline model saw these up-down pairs in w and modelled them as "give back 41% of last month's surprise". Once the promotion is a regressor, the pairs are explained, and that negative memory should disappear.</p>
  <div class="fx" data-lang="py">xtr, xte = shop.promo[:"2023"], shop.promo["2024":]      # promo flag: planned, so known in advance
sx = SARIMAX(train, exog=xtr, order=(0, 1, 1), seasonal_order=(0, 1, 1, 12)).fit(disp=False)
print(sx.params.round(3))
print(f"AIC without promo {air.aic:.1f} -&gt; with promo {sx.aic:.1f}")
print("Ljung-Box p (lag 12):", round(acorr_ljungbox(sx.resid[13:], lags=[12]).lb_pvalue.iloc[0], 3))
fx = sx.get_forecast(12, exog=xte)                       # the 2024 promotion calendar
print("MAE 2024 with promo:", mae(fx.predicted_mean), "  without:", mae(fc.predicted_mean))
print("interval half-width Jan 2024: with promo", round(1.96 * fx.se_mean.iloc[0], 2),
      " without", round(1.96 * fc.se_mean.iloc[0], 2))
x_off = xte.copy(); x_off.iloc[3] = 0                    # April 2024 has a promo; pretend it does not
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
  <p>The promotion coefficient is +6.644: a promotion month adds about ₹6,600 to sales. And θ flips from −0.41 to +0.37, exactly as the hand argument predicted: the "give-back" was the promotions in disguise, and what remains is mild positive momentum, while Θ strengthens to −0.80. σ² falls from 14.2 to 2.7, so the typical one-step error drops from 3.8 to 1.65 thousand. AIC falls from 201.4 to 152.6, an enormous difference (anything above 10 is decisive), and Ljung-Box p = 0.87 says the residuals are still white noise. On 2024, the mean absolute error improves from 5.76 to 4.70 and the intervals are less than half as wide (±3.43 instead of ±7.42 in January) while still covering all 12 actual values.</p>
  <p>For the forecast we passed the 2024 promotion calendar with <code>get_forecast(12, exog=xte)</code>. Switching off April 2024's planned promotion lowers April's forecast by exactly 6.644 = β, which gives Meera a "what-if" answer for planning. The main risk with exogenous variables is needing their future values. Promotions, prices and holidays are planned, so their futures are known. Tomorrow's temperature or a competitor's price are not: you would have to forecast them first (adding their error) or use lagged values. Testing a model with the actual future values of such a variable flatters it; that is leakage. Exogenous inputs commonly used this way are promotions, prices, holidays and Fourier terms for long seasons (the last is also called dynamic harmonic regression).</p>
  <p>ARIMA's limits are worth stating plainly before comparing it with other families. It is linear, it models one series at a time with fixed coefficients, and it needs a few full seasons of data. Structural breaks (a new branch, a lockdown) need dummy variables or refitting on recent data. With thousands of related series and many nonlinear drivers, a global gradient-boosting model usually wins (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>), and with daily data, several seasons and holidays, Prophet-style models are easier (<a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a>). On a single short series with clear autocorrelation, where honest intervals and an interpretable model matter, ARIMA remains the benchmark.</p>

  <h2 id="ar-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The first mistake is fitting AR or ARMA terms to a series that still trends. Here is an AR(1) fitted straight to the raw training sales:</p>
  <div class="fx" data-lang="py">raw = ARIMA(train, order=(1, 0, 0)).fit()            # AR(1) straight on trending sales: wrong
print("AR(1) on raw sales: phi =", round(raw.params["ar.L1"], 3))
print("forecast Jan-Dec 2024:", raw.forecast(12).round(0).astype(int).tolist()[::3], "... MAE", mae(raw.forecast(12)))</div>
  <div class="fx" data-lang="text">AR(1) on raw sales: phi = 0.872
forecast Jan-Dec 2024: [135, 129, 125, 122] ... MAE 18.2</div>
  <p>The trend makes this month and last month move together, so φ comes out at 0.872, close to a unit root. Worse, a stationary AR model believes the series returns to a fixed mean, so its forecasts decay from 135 down toward the training average while real sales climb to 160: an error of 18.2, worse than every baseline. Difference first (choose d and D), or let ARIMA difference for you.</p>
  <p>The second mistake is comparing AIC between models with different differencing:</p>
  <div class="fx" data-lang="py">for order, sorder in [((0, 1, 1), (0, 1, 1, 12)), ((0, 0, 1), (0, 1, 1, 12)), ((0, 1, 1), (0, 0, 1, 12))]:
    r = SARIMAX(train, order=order, seasonal_order=sorder).fit(disp=False)
    print(order, sorder, " observations used:", r.nobs_effective, " AIC", round(r.aic, 1))</div>
  <div class="fx" data-lang="text">(0, 1, 1) (0, 1, 1, 12)  observations used: 35  AIC 201.4
(0, 0, 1) (0, 1, 1, 12)  observations used: 36  AIC 251.7
(0, 1, 1) (0, 0, 1, 12)  observations used: 47  AIC 298.3</div>
  <p>The three models use 35, 36 and 47 observations, because each kind of differencing loses a different number of months and changes the scale of what is being modelled. Their AICs (201.4, 251.7, 298.3) are computed on different data and cannot be compared; the gap says nothing about which differencing is right. Fix d and D with tests and plots first, then compare p, q, P, Q by AIC, and compare different d by out-of-sample error.</p>
  <p>Several mistakes need no code. Chasing small AIC differences (201.22 against 201.41 is a tie; prefer the simpler or more interpretable model and check held-out error). Skipping residual diagnostics, or stopping at Ljung-Box: ours passed, yet the biggest residuals revealed a missing variable worth 48 AIC points. Mixing up MA sign conventions between libraries and textbooks. Using exogenous values in testing that you will not have in real use. Taking intervals at face value when the errors have heavy tails. And dropping a term only because its p-value is above 0.05, when AIC and held-out error say it helps.</p>

  <h2 id="ar-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>AR(p)</b>: w<sub>t</sub> = c + Σφ<sub>i</sub>w<sub>t−i</sub> + ε<sub>t</sub>. Uses past values; stationary if the roots of 1 − φ₁z − … − φ<sub>p</sub>z<sup>p</sup> lie outside |z| = 1.</li>
    <li><b>MA(q)</b>: w<sub>t</sub> = μ + ε<sub>t</sub> + Σθ<sub>j</sub>ε<sub>t−j</sub>. Uses past shocks; always stationary; invertible if |θ| &lt; 1 (MA(1)).</li>
    <li><b>ARIMA(p, d, q)</b>: ARMA on the d-times differenced series; <b>SARIMA</b> adds (P, D, Q)<sub>s</sub> at the seasonal lag.</li>
    <li><b>SARIMAX</b>: y = βx + u with u following SARIMA; x must be known for the future.</li>
    <li><b>ψ-weights</b>: how much a shock still affects the series j steps later; they set the interval width.</li>
    <li><b>Box-Jenkins</b>: identify → estimate → check residuals → forecast.</li>
  </ul>
  <h3>Signatures</h3>
  <table class="tbl">
    <tr><th>Model</th><th>ACF</th><th>PACF</th><th>A shock echoes</th></tr>
    <tr><td>AR(p)</td><td>tails off (φ<sup>k</sup> for AR(1))</td><td>cuts off after p</td><td>forever, fading</td></tr>
    <tr><td>MA(q)</td><td>cuts off after q (MA(1): θ/(1 + θ²))</td><td>tails off</td><td>exactly q steps</td></tr>
    <tr><td>ARMA(p, q)</td><td>tails off</td><td>tails off</td><td>burst, then fading</td></tr>
    <tr><td>Airline</td><td>spikes at 1, 11, 12, 13</td><td>fades around 1 and 12</td><td>—</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Formula</th><th>Shop</th></tr>
    <tr><td>Yule-Walker AR(2)</td><td>φ₁ = r₁(1 − r₂)/(1 − r₁²); φ₂ = (r₂ − r₁²)/(1 − r₁²)</td><td>−0.4502, −0.1137</td></tr>
    <tr><td>Airline in levels</td><td>y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub></td><td>θ −0.41, Θ −0.47</td></tr>
    <tr><td>AIC / BIC</td><td>−2 log L + 2k / −2 log L + k ln n</td><td>201.41 / 206.07</td></tr>
    <tr><td>Ljung-Box</td><td>Q(h) = n(n + 2)Σr<sub>k</sub>²/(n − k)</td><td>Q(3) = 1.006, p 0.80</td></tr>
    <tr><td>Forecast</td><td>future shocks = 0, past shocks = residuals</td><td>Jan 2024: 137 − 3.04 = 133.96</td></tr>
    <tr><td>Interval</td><td>±1.96·σ·√Σψ<sub>j</sub>²</td><td>±7.4 (Jan) → ±16.2 (Dec)</td></tr>
  </table>
  <h3>The shop's results (2024 MAE)</h3>
  <table class="tbl">
    <tr><th>Forecast</th><th>MAE</th></tr>
    <tr><td>Seasonal naive</td><td>14.75</td></tr>
    <tr><td>Naive (138 flat)</td><td>10.25</td></tr>
    <tr><td>Random walk + drift</td><td>7.76</td></tr>
    <tr><td>Airline SARIMA</td><td>5.76</td></tr>
    <tr><td>Airline + promo (SARIMAX)</td><td>4.70</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from statsmodels.tsa.statespace.sarimax import SARIMAX
m = SARIMAX(train, exog=x_train, order=(0, 1, 1), seasonal_order=(0, 1, 1, 12)).fit(disp=False)
m.summary(); m.aic; m.params; m.resid
acorr_ljungbox(m.resid[13:], lags=[12])
fc = m.get_forecast(12, exog=x_future)
fc.predicted_mean; fc.conf_int(alpha=0.05)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Make the series stationary (d, D) before AR/MA terms mean anything.</li>
    <li>Compare AIC only for the same d and D; gaps under 2 are ties.</li>
    <li>Ljung-Box passing is necessary, not sufficient: read the biggest residuals.</li>
    <li>Intervals assume normal errors and known parameters; check coverage.</li>
    <li>Exogenous inputs must be known at forecast time; check MA sign conventions.</li>
  </ul>

  <h2 id="ar-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What do p, d and q mean in ARIMA(p, d, q)?</summary><div class="qa-body">p is the number of autoregressive terms (past values of the differenced series), d the number of ordinary differences needed to make the series stationary, and q the number of moving-average terms (past forecast errors). The seasonal orders (P, D, Q, s) mean the same things at multiples of the period s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>AR vs MA: what is the difference in plain words?</summary><div class="qa-body">An AR model predicts from past values, so a shock is carried forward and echoes forever while fading. An MA model predicts from past shocks, so a shock affects exactly q later values and then disappears. In the plots, AR has a PACF that cuts off after p and an ACF that tails off; MA is the reverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must |φ| &lt; 1 in an AR(1), and what happens at φ = 1?</summary><div class="qa-body">Back-substitution gives w<sub>t</sub> = Σφ<sup>k</sup>ε<sub>t−k</sub>; only if |φ| &lt; 1 do old shocks fade, giving a finite mean c/(1 − φ) and variance σ²/(1 − φ²). At φ = 1 the model is a random walk with a unit root: shocks are permanent and the variance grows without limit, so the series must be differenced.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the AR(2) coefficients from r₁ and r₂.</summary><div class="qa-body">The Yule-Walker equations are r₁ = φ₁ + φ₂r₁ and r₂ = φ₁r₁ + φ₂. Solving gives φ₁ = r₁(1 − r₂)/(1 − r₁²) and φ₂ = (r₂ − r₁²)/(1 − r₁²), which is also PACF(2). On the shop, r₁ = −0.4043 and r₂ = 0.0683 give φ₁ = −0.4502 and φ₂ = −0.1137.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is invertibility and why do we require it?</summary><div class="qa-body">An MA model is invertible if it can be rewritten as a convergent AR(∞) in past values, which for MA(1) means |θ| &lt; 1. θ and 1/θ produce identical autocorrelations, so the data cannot choose between them; requiring invertibility picks the unique version whose error recursion is stable and whose forecasts depend sensibly on the past.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the backshift operator do, and why is ARIMA(1,1,1)'s coefficient on y<sub>t−1</sub> not φ?</summary><div class="qa-body">B shifts a series back one step, B·y<sub>t</sub> = y<sub>t−1</sub>, so models become polynomials that multiply like ordinary ones. Expanding (1 − φB)(1 − B)y<sub>t</sub> gives y<sub>t</sub> = (1 + φ)y<sub>t−1</sub> − φy<sub>t−2</sub> + …, because the AR term acts on the differenced series, not on the levels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write out the airline model and explain each term.</summary><div class="qa-body">(1 − B)(1 − B¹²)y<sub>t</sub> = (1 + θB)(1 + ΘB¹²)ε<sub>t</sub>, which expands to y<sub>t</sub> = y<sub>t−1</sub> + y<sub>t−12</sub> − y<sub>t−13</sub> + ε<sub>t</sub> + θε<sub>t−1</sub> + Θε<sub>t−12</sub> + θΘε<sub>t−13</sub>. The y terms carry last month's level plus last year's month-to-month change; θ corrects for last month's surprise, Θ for last year's same-month surprise, and θΘ is their interaction. Its ACF has spikes only at lags 1, 11, 12 and 13.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose ARIMA orders in practice?</summary><div class="qa-body">Transform if the variance grows; choose D from the seasonal pattern in the ACF of the first difference or a seasonal test, and d from ADF/KPSS; read the ACF/PACF of the stationary series to propose a few small p, q, P, Q; compare candidates with the same d and D by AIC or AICc; check residuals with Ljung-Box; then validate on held-out data against naive and seasonal naive. auto_arima automates the middle steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>AIC vs BIC: what is the difference, and which would you use for forecasting?</summary><div class="qa-body">Both are −2 log L plus a penalty: 2k for AIC and k ln n for BIC. BIC penalises more and picks smaller models; it is consistent, finding the true model as n grows if it is among the candidates. AIC (or AICc on small samples) targets predictive accuracy and is the usual default for forecasting. Neither can compare models fitted on differently differenced data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you compare AIC across models with different d?</summary><div class="qa-body">Differencing changes the data the likelihood is computed on: the number of observations and their scale both change (35, 36 and 47 observations for three differencing choices on the shop). The likelihoods are therefore on different data, and AIC differences between them are meaningless. Choose d and D first, then compare the remaining orders, or compare differencing choices by out-of-sample error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is an ARIMA model fitted?</summary><div class="qa-body">By maximum likelihood. statsmodels writes the model in state-space form and runs the Kalman filter to get every one-step forecast error and its variance; the Gaussian log-likelihood is built from those errors, and an optimiser searches for the parameters that maximise it. MA terms make the errors depend on the parameters, so there is no closed-form solution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Ljung-Box test check?</summary><div class="qa-body">Its null hypothesis is that the residual autocorrelations up to lag h are all zero. The statistic Q = n(n + 2)Σr<sub>k</sub>²/(n − k) is compared with a chi-square with h minus the number of ARMA parameters degrees of freedom. A small p-value means memory is left and the model needs more terms. Passing it does not prove the model is good: residuals can be uncorrelated yet large because of a missing variable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is an ARIMA forecast computed step by step?</summary><div class="qa-body">Write the model as an equation in levels, replace every future shock by 0 and every past shock by the model's residual, and compute recursively, using earlier forecasts where future values are needed. For the shop's January 2024: base 138 + 125 − 126 = 137, MA correction −3.04, forecast 133.96.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do ARIMA prediction intervals widen with the horizon, and why are they often too narrow?</summary><div class="qa-body">The h-step error accumulates the h future shocks weighted by the ψ-weights, so its variance is σ²Σψ<sub>j</sub>²; with a unit root the weights do not decay, and the band keeps widening (±7.4 to ±16.2 over a year for the shop). They are too narrow when errors are heavy-tailed, and because they ignore uncertainty in the estimated parameters and in the chosen orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is SARIMAX, and what happened when the promotion flag was added?</summary><div class="qa-body">SARIMAX is a regression on exogenous variables whose errors follow a SARIMA model. Adding the promotion flag gave β = +6.64, cut σ² from 14.2 to 2.7 and AIC from 201 to 153, improved 2024 MAE from 5.76 to 4.70 and halved the intervals. θ flipped from −0.41 to +0.37: the negative lag-1 memory was the up-then-down signature of one-month promotions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the main risk with exogenous variables in forecasting?</summary><div class="qa-body">You need their future values. Planned inputs such as promotions, prices and holidays are known; others such as weather or competitor prices must be forecast (adding their error) or used only as lags. Evaluating with their actual future values is leakage and overstates accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is ARIMA related to exponential smoothing?</summary><div class="qa-body">Several linear exponential smoothing models are ARIMA models: simple exponential smoothing equals ARIMA(0,1,1) with α = 1 + θ, Holt's linear trend equals ARIMA(0,2,2), and additive Holt-Winters corresponds to a seasonal ARIMA. ETS is parameterised by components (level, trend, season), ARIMA by autocorrelation; multiplicative ETS models have no ARIMA twin.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a gradient-boosting forecaster over SARIMA?</summary><div class="qa-body">With many related series, where one global model can learn shared patterns; with many nonlinear drivers or interactions; and with long histories where feature engineering pays off. SARIMA wins on a single short series, gives analytic intervals and is easy to explain. In practice, back-test both against naive and seasonal naive on time-ordered folds.</div></details>
</main>
`
});
