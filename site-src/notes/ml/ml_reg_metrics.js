// notes/ml/ml_reg_metrics.js — Regression Metrics
Object.assign(TOPIC_CONTENT, {
  "ml_reg_metrics": `<main>
  <h1>Regression Metrics</h1>
  <div class="where"><span>Machine Learning</span><span>Model Evaluation</span><span>Regression Metrics</span></div>
  <p class="lead">When a model predicts a number (orders, price, delivery time), there is no confusion matrix: every prediction is wrong by some amount, and the question is how to add those amounts up. This note follows one tiffin kitchen's forecast for six days and computes every standard regression metric on those same six numbers, by hand: the residual and bias, MAE, MSE and RMSE (and why the mean and the median are the "best constants" behind them), median absolute error and max error, R² derived from scratch (and why it can be negative), adjusted R², MAPE and its three traps, sMAPE and WAPE, MASE, and RMSLE. Then it shows which to use when, how to read residuals, why every number needs a baseline next to it, and how to compute it all in scikit-learn.</p>

  <h2 id="rm-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_evaluation">Classification Metrics</a> and <a class="xref" data-note="ml_regression">Linear Regression</a></b><span>The classification note judged yes/no answers by counting four kinds of right and wrong. The regression note fitted a line by minimising squared error and printed R² and RMSE in passing. Left open: with a numeric target, how do you summarise many errors of different sizes and signs into one honest number, and which number?</span></li>
    <li><b>This note: Regression Metrics</b><span>Every standard error summary, each built to fix a weakness of the previous one: average size of error (MAE), punishing big misses (RMSE), robustness (MedAE), comparison with a baseline (R²), fairness to model size (adjusted R²), percentages (MAPE, sMAPE, WAPE), scale-free comparison with a naive forecast (MASE), and relative errors (RMSLE). Plus residual analysis and baselines.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>, <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> and <a class="xref" data-note="ml_ts_ml">ML Forecasting</a></b><span>The last note of this group turns classifier scores into decisions and honest probabilities. Residual plots from here are the starting point of regression diagnostics, and MASE, WAPE and pinball loss are the everyday metrics of forecasting.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="rm-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Model Evaluation</text>
<rect x="20" y="40" width="190" height="56" rx="8" class="fb sb"/><text x="115" y="62" text-anchor="middle" font-size="13">Classification Metrics</text><text x="115" y="80" text-anchor="middle" class="tm" font-size="10.5">F1, AUC, log loss</text>
<rect x="235" y="34" width="190" height="68" rx="8" class="ft st" stroke-width="3"/><text x="330" y="58" text-anchor="middle" font-size="13" font-weight="700">Regression Metrics</text><text x="330" y="75" text-anchor="middle" class="tm" font-size="10.5">MAE, RMSE, R², MAPE</text><text x="330" y="92" text-anchor="middle" class="tb" font-size="10">YOU ARE HERE</text>
<rect x="450" y="40" width="190" height="56" rx="8" class="fg sg"/><text x="545" y="62" text-anchor="middle" font-size="13">Thresholds &amp; Calibration</text><text x="545" y="80" text-anchor="middle" class="tm" font-size="10.5">cut-offs, reliability</text>
<line x1="210" y1="68" x2="233" y2="68" stroke="currentColor" marker-end="url(#rm-a0)"/><line x1="425" y1="68" x2="448" y2="68" stroke="currentColor" marker-end="url(#rm-a0)"/>
<text x="330" y="132" text-anchor="middle" class="tm" font-size="10.5">Brier score (classification) = MSE of probabilities: the bridge between the two notes</text>
</svg><figcaption>The Model Evaluation group. This note is the numeric-target twin of Classification Metrics.</figcaption></figure>
  <p>You need: mean, median and squared deviations (<a class="xref" data-note="st_descriptive">Descriptive Statistics</a>), what a held-out test set is (<a class="xref" data-note="ml_splits">Train/Val/Test</a>), and a fitted regression model (<a class="xref" data-note="ml_regression">Linear Regression</a>). Natural log is used once, for RMSLE.</p>

  <h2 id="rm-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>The whole note is one chain of questions about the same six days of tiffin orders (real: 20, 25, 30, 35, 40, 60; forecast: 22, 24, 33, 30, 41, 50). Each metric answers the question above it, and its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Residual and bias (ME)</b><span>Q: how wrong was each day? → e = y − ŷ: −2, +1, −3, +5, −1, +10. Their mean, +1.67, says we under-forecast on average. But positive and negative misses cancel, so a terrible model can have zero bias…</span></li>
    <li><b>MAE</b><span>Q: how big is a typical miss, ignoring direction? → mean |e| = 22/6 = 3.67 orders. But a 10-order miss counts only twice a 5-order miss, though running out of food on Saturday hurts far more…</span></li>
    <li><b>MSE and RMSE</b><span>Q: how do we punish big misses more? → square them: MSE = 140/6 = 23.3, RMSE = 4.83 orders. But now one freak day (a festival) can dominate the whole number…</span></li>
    <li><b>Median absolute error and max error</b><span>Q: what does a typical day look like, ignoring freak days, and what was the worst? → MedAE = 2.5, max = 10. But none of these says whether 3.67 is good: good compared with what?…</span></li>
    <li><b>R²</b><span>Q: how much better than the dumbest forecast ("always 35") are we? → 1 − 140/1000 = 0.86. But R² never goes down when you add features, even useless ones…</span></li>
    <li><b>Adjusted R²</b><span>Q: is the gain worth the extra features? → 0.825 with 1 feature, 0.650 if it took 3. But all of these are in "orders", so a 3-order miss means the same at 20 orders and at 2,000…</span></li>
    <li><b>MAPE</b><span>Q: how big is the miss as a percentage? → 9.58%. But it explodes on quiet days, is infinite at zero, and rewards under-forecasting…</span></li>
    <li><b>sMAPE and WAPE</b><span>Q: a percentage that survives small values? → sMAPE 9.86%, WAPE = 22/210 = 10.48%. But a percentage still does not say whether forecasting is even hard for this series…</span></li>
    <li><b>MASE</b><span>Q: are we better than "tomorrow = today"? → 3.67 / 7.4 = 0.50: half the naive error. But it, too, treats a miss of 10 on 20 like a miss of 10 on 1,000…</span></li>
    <li><b>RMSLE</b><span>Q: what if relative (ratio) errors matter and under-forecasting is worse? → RMSE of log(1 + y) = 0.111. Then: which to pick, how to read the residuals behind any of them, and which baseline to compare with.</span></li>
  </ol>
  <div class="bridge"><b>What this still can't tell us.</b> The ladder is the plot; each step is worked by hand in the sections below. <b>→ next: the Mind Map, then 01 Residuals</b></div>

  <h2 id="rm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Regression Metrics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Residuals</div>
        <ul>
          <li><b>e = y − ŷ</b>: −2, +1, −3, +5, −1, +10 (Mon–Sat)</li>
          <li><b>ME (bias)</b> = mean e = +1.67 → under-forecasting</li>
          <li>Signs cancel → never use ME alone</li>
          <li>💡 A dart player: bias = where the cluster sits, MAE = how far darts land</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Size of error</div>
        <ul>
          <li><b>MAE</b> = mean |e| = 3.67 · best constant = <b>median</b></li>
          <li><b>MSE</b> = mean e² = 23.3 · <b>RMSE</b> = 4.83 · best constant = <b>mean</b></li>
          <li>RMSE ≥ MAE always; ratio 1.32 → 1.91 after one 40-order miss</li>
          <li><b>MedAE</b> = 2.5 (robust) · <b>max error</b> = 10 (worst case)</li>
          <li>Saturday: 45% of Σ|e| but 71% of Σe²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Compared with a baseline</div>
        <ul>
          <li><b>R²</b> = 1 − SS_res/SS_tot = 1 − 140/1000 = 0.86</li>
          <li>SS_tot = misses of "always the mean (35)"</li>
          <li>0 = no better than the mean · negative = worse (reversed forecast: −1.86)</li>
          <li><b>Adjusted R²</b> = 1 − (1−R²)(n−1)/(n−p−1): 0.825 (p=1), 0.650 (p=3)</li>
          <li>Explained variance ignores bias (+10 shift: R² 0.46, EV 0.88)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Percentages</div>
        <ul>
          <li><b>MAPE</b> = mean |e|/|y| = 9.58% · sklearn returns 0.0958</li>
          <li>⚠ quiet day (1 order, forecast 4) → 51%; y = 0 → huge; favours low forecasts</li>
          <li><b>sMAPE</b> = mean 2|e|/(|y|+|ŷ|) = 9.86%, capped at 200%, still asymmetric</li>
          <li><b>WAPE</b> = Σ|e|/Σ|y| = 22/210 = 10.48% — volume-weighted, safe</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scale-free &amp; relative</div>
        <ul>
          <li><b>MASE</b> = MAE / MAE of naive on training = 3.67/7.4 = 0.50; &lt; 1 beats naive</li>
          <li><b>RMSLE</b> = RMSE of ln(1+y) = 0.111; ratios, punishes under-forecasts more</li>
          <li>RMSLE ⇔ fit on log1p target; back-transform predicts a median (bias)</li>
          <li>Pinball loss (quantiles), Poisson deviance (counts): brief</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using metrics well</div>
        <ul>
          <li>Always beside a <b>baseline</b>: mean, median, naive, seasonal naive</li>
          <li>Kitchen test: seasonal naive MAE 8.78 vs linear 5.68 vs mean 10.33</li>
          <li><b>Residual plots</b>: patterns by weekday, festival, funnel → model is missing something</li>
          <li>sklearn scorers are <code>neg_…</code> (it maximises) · R² on test uses the test mean</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rm-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">Every metric as an answer</span></div></div>
      <div class="rm-item rm-done" data-target="rm-resid"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Residuals and Bias</span><span class="rm-sub">The six-day example</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mae"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">MAE</span><span class="rm-sub">Average miss; the median</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mse"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">MSE and RMSE</span><span class="rm-sub">Punishing big misses; the mean</span></div></div>
      <div class="rm-item rm-done" data-target="rm-robust"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">MedAE and Max Error</span><span class="rm-sub">Typical day, worst day</span></div></div>
      <div class="rm-item rm-done" data-target="rm-r2"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">R²</span><span class="rm-sub">Derived; why it can be negative</span></div></div>
      <div class="rm-item rm-done" data-target="rm-adj"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Adjusted R²</span><span class="rm-sub">Paying for features</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mape"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">MAPE and Its Traps</span><span class="rm-sub">Zero, small values, asymmetry</span></div></div>
      <div class="rm-item rm-done" data-target="rm-smape"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">sMAPE and WAPE</span><span class="rm-sub">Safer percentages</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mase"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">MASE</span><span class="rm-sub">Versus the naive forecast</span></div></div>
      <div class="rm-item rm-done" data-target="rm-rmsle"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">RMSLE</span><span class="rm-sub">Relative errors and log targets</span></div></div>
      <div class="rm-item rm-done" data-target="rm-choose"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Which Metric When</span><span class="rm-sub">Train loss vs report metric</span></div></div>
      <div class="rm-item rm-done" data-target="rm-resan"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Residual Analysis</span><span class="rm-sub">What the errors are telling you</span></div></div>
      <div class="rm-item rm-done" data-target="rm-base"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Baseline Models</span><span class="rm-sub">Mean, median, naive, seasonal</span></div></div>
      <div class="rm-item rm-done" data-target="rm-api"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">scikit-learn API</span><span class="rm-sub">Functions and neg_ scorers</span></div></div>
      <div class="rm-item rm-done" data-target="rm-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="rm-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="rm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="rm-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rm-resid"><span class="num">01</span>Residuals and Bias: the Running Example</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>A classifier is either right or wrong on a row, so we could count. A forecast of 33 tiffins when 30 were ordered is neither right nor wrong: it is off by some amount. Before we can summarise a model, we need a clear number for "how wrong, and in which direction" on each single day.</p></div>
  <h3>The story</h3>
  <p>A small tiffin kitchen cooks the day's meals in the morning, using a model's forecast of orders. Cook too few and customers go hungry (lost sales, angry regulars). Cook too many and food is thrown away. Here is one week (Monday to Saturday; the kitchen is closed on Sunday that week): what the model forecast and what was really ordered. Every metric in this note is computed on these six pairs.</p>
  <table class="tbl"><caption>The running example: six days of tiffin orders</caption>
    <tr><th>Day</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sum</th></tr>
    <tr><td>real orders y</td><td>20</td><td>25</td><td>30</td><td>35</td><td>40</td><td>60</td><td>210</td></tr>
    <tr><td>forecast ŷ</td><td>22</td><td>24</td><td>33</td><td>30</td><td>41</td><td>50</td><td>200</td></tr>
  </table>
  <div class="fx" data-lang="py"># week.py - one week of a tiffin kitchen: real orders vs the model's forecast (used all through this note)
import numpy as np
days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
y    = np.array([20, 25, 30, 35, 40, 60], dtype=float)   # real orders
yhat = np.array([22, 24, 33, 30, 41, 50], dtype=float)   # model's forecast
history = np.array([14, 22, 17, 28, 24, 33], dtype=float) # the 6 days BEFORE (training period), for MASE</div>
  <p>(<code>history</code> holds the six days before this week; it is needed only for MASE in section 09.)</p>
  <h3>The residual</h3>
  <p>For each day, the <strong>residual</strong> (or error) is actual minus predicted: e = y − ŷ. A positive residual means we forecast too low (under-forecast: cooked too little); a negative one means too high.</p>
  <figure class="viz"><svg viewBox="0 0 640 250" width="640">
<line x1="60" y1="215" x2="600" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="55" y="218.5" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="57" y1="215" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="55" y="186.8" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="183.3" x2="60" y2="183.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="155.2" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="151.7" x2="60" y2="151.7" stroke="currentColor" opacity="0.5"/>
<text x="55" y="123.5" text-anchor="end" class="tm" font-size="10.5">40</text>
<line x1="57" y1="120" x2="60" y2="120" stroke="currentColor" opacity="0.5"/>
<text x="55" y="91.8" text-anchor="end" class="tm" font-size="10.5">50</text>
<line x1="57" y1="88.3" x2="60" y2="88.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="60.2" text-anchor="end" class="tm" font-size="10.5">60</text>
<line x1="57" y1="56.7" x2="60" y2="56.7" stroke="currentColor" opacity="0.5"/>
<text x="55" y="28.5" text-anchor="end" class="tm" font-size="10.5">70</text>
<line x1="57" y1="25" x2="60" y2="25" stroke="currentColor" opacity="0.5"/>
<text x="26" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 120)">orders</text>
<line x1="105" y1="183.3" x2="105" y2="177" class="sr" stroke-width="3"/>
<circle cx="105" cy="183.3" r="5" class="fb sb"/><circle cx="105" cy="177" r="5" class="fg sg"/>
<text x="114" y="184.2" class="tr" font-size="11">e = -2</text>
<text x="105" y="231" text-anchor="middle" class="tm" font-size="11">Mon</text>
<line x1="195" y1="167.5" x2="195" y2="170.7" class="sr" stroke-width="3"/>
<circle cx="195" cy="167.5" r="5" class="fb sb"/><circle cx="195" cy="170.7" r="5" class="fg sg"/>
<text x="204" y="173.1" class="tr" font-size="11">e = +1</text>
<text x="195" y="231" text-anchor="middle" class="tm" font-size="11">Tue</text>
<line x1="285" y1="151.7" x2="285" y2="142.2" class="sr" stroke-width="3"/>
<circle cx="285" cy="151.7" r="5" class="fb sb"/><circle cx="285" cy="142.2" r="5" class="fg sg"/>
<text x="294" y="150.9" class="tr" font-size="11">e = -3</text>
<text x="285" y="231" text-anchor="middle" class="tm" font-size="11">Wed</text>
<line x1="375" y1="135.8" x2="375" y2="151.7" class="sr" stroke-width="3"/>
<circle cx="375" cy="135.8" r="5" class="fb sb"/><circle cx="375" cy="151.7" r="5" class="fg sg"/>
<text x="384" y="147.8" class="tr" font-size="11">e = +5</text>
<text x="375" y="231" text-anchor="middle" class="tm" font-size="11">Thu</text>
<line x1="465" y1="120" x2="465" y2="116.8" class="sr" stroke-width="3"/>
<circle cx="465" cy="120" r="5" class="fb sb"/><circle cx="465" cy="116.8" r="5" class="fg sg"/>
<text x="474" y="122.4" class="tr" font-size="11">e = -1</text>
<text x="465" y="231" text-anchor="middle" class="tm" font-size="11">Fri</text>
<line x1="555" y1="56.7" x2="555" y2="88.3" class="sr" stroke-width="3"/>
<circle cx="555" cy="56.7" r="5" class="fb sb"/><circle cx="555" cy="88.3" r="5" class="fg sg"/>
<text x="564" y="76.5" class="tr" font-size="11">e = +10</text>
<text x="555" y="231" text-anchor="middle" class="tm" font-size="11">Sat</text>
<line x1="60" y1="135.8" x2="600" y2="135.8" stroke="currentColor" stroke-dasharray="4 3" opacity="0.5"/><text x="596" y="130.8" text-anchor="end" class="tm" font-size="10.5">mean of y = 35</text>
<circle cx="80" cy="12" r="5" class="fb sb"/><text x="90" y="16" font-size="11">real orders y</text><circle cx="200" cy="12" r="5" class="fg sg"/><text x="210" y="16" font-size="11">forecast ŷ</text><line x1="310" y1="7" x2="310" y2="18" class="sr" stroke-width="3"/><text x="318" y="16" font-size="11">residual e = y − ŷ</text>
</svg><figcaption>The six days. Blue: what really happened; green: the forecast; red stick: the residual. Saturday's miss (+10) is by far the largest. The dashed line is the mean of the real orders (35), which section 05 uses as the baseline.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from week import days, y, yhat
from sklearn.metrics import mean_absolute_error, mean_squared_error, root_mean_squared_error

e = y - yhat                                   # residual = actual - predicted
print(" day   y   ŷ   e=y-ŷ  |e|   e²")
for d, a, b, r in zip(days, y, yhat, e):
    print(f" {d}  {a:3.0f} {b:3.0f}  {r:5.0f}  {abs(r):3.0f}  {r*r:4.0f}")
print(f"sums              {e.sum():5.0f}  {np.abs(e).sum():3.0f}  {(e**2).sum():4.0f}")
print(f"\\nME   (bias)  = {e.mean():.3f}")
print(f"MAE  = 22/6  = {np.abs(e).mean():.3f}   sklearn {mean_absolute_error(y, yhat):.3f}")
print(f"MSE  = 140/6 = {(e**2).mean():.3f}  sklearn {mean_squared_error(y, yhat):.3f}")
print(f"RMSE = √MSE  = {np.sqrt((e**2).mean()):.3f}   sklearn {root_mean_squared_error(y, yhat):.3f}")</div>
  <div class="fx" data-lang="text"> day   y   ŷ   e=y-ŷ  |e|   e²
 Mon   20  22     -2    2     4
 Tue   25  24      1    1     1
 Wed   30  33     -3    3     9
 Thu   35  30      5    5    25
 Fri   40  41     -1    1     1
 Sat   60  50     10   10   100
sums                 10   22   140

ME   (bias)  = 1.667
MAE  = 22/6  = 3.667   sklearn 3.667
MSE  = 140/6 = 23.333  sklearn 23.333
RMSE = √MSE  = 4.830   sklearn 4.830</div>
  <p>The table's three columns (e, |e|, e²) are the raw material for every metric in sections 01–05. Check by hand: residuals −2 + 1 − 3 + 5 − 1 + 10 = 10.</p>
  <h3>Mean error (bias)</h3>
  <p>The plain average of the residuals is the <strong>mean error</strong> or <strong>bias</strong>: ME = 10 / 6 = <strong>+1.67</strong> orders. It answers "do we lean one way?": on average this model forecasts 1.67 tiffins too few. A bias far from 0 is a cheap fix (shift every forecast) and a sign of something systematic (a trend the model has not caught, a missing holiday effect).</p>
  <p>But bias is useless as an accuracy measure: errors of +20 and −20 average to 0. A model that is wildly wrong in both directions can have zero bias. We need to remove the sign before averaging. There are two natural ways: take the absolute value (section 02) or square (section 03).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dart player. Bias is where the centre of the cluster sits relative to the bullseye. Accuracy (MAE, RMSE) is how far darts land from the bullseye on average. A player can be perfectly centred and still spray darts all over the board.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For n predictions, the <strong>residual</strong> eᵢ = yᵢ − ŷᵢ. The <strong>mean error</strong> (bias) ME = (1/n) Σ eᵢ. Some libraries and textbooks define the error as ŷ − y, which flips the sign of ME; always say which you use.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A model trained by least squares with an intercept has ME exactly 0 on its training data, so a zero training bias proves nothing. Measure bias on held-out data, and per segment (weekday, region): the overall bias can be 0 while Saturdays are always under-forecast and Mondays always over-forecast.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Bias says which way we lean, not how big the misses are, because signs cancel. <b>→ next: 02 MAE, the average size of a miss</b></div>

  <h2 id="rm-mae"><span class="num">02</span>Mean Absolute Error (MAE)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The residuals are −2, +1, −3, +5, −1, +10, and their mean (+1.67) hides how big they are because the signs cancel. How far off is a typical forecast, in orders, whatever the direction?</p></div>
  <h3>By hand</h3>
  <p>Drop the signs and average: |e| = 2, 1, 3, 5, 1, 10. Sum = 22. <strong>MAE = 22 / 6 = 3.67 orders</strong>. In words: "on a typical day the forecast is off by about 3.7 tiffins". That sentence is why managers like MAE: it is in the units of the target and needs no explanation.</p>
  <h3>Each unit of error costs the same</h3>
  <p>In MAE, a 10-order miss counts exactly twice a 5-order miss, and five 2-order misses count the same as one 10-order miss. That is right when the cost of an error grows in a straight line with its size (each wasted tiffin costs ₹40, whatever else happened that day).</p>
  <h3>The best constant under MAE is the median</h3>
  <p>Suppose the model could only output one number c for every day. Which c gives the smallest MAE? Think of the six real values on a line: 20, 25, 30, 35, 40, 60. Move c one order to the right. Every value to the right of c gets 1 closer, every value to the left gets 1 farther. If more values sit on the right, the total drops, so keep moving. You stop when the values are balanced: half on each side. That point is the <strong>median</strong>. With an even count (six values) any c between the two middle values (30 and 35) gives the same MAE.</p>
  <div class="fx" data-lang="py"># if a model could only predict ONE number c for every day, which c is best under each metric?
import numpy as np
from week import y
cs = np.arange(15, 65.01, 0.5)
mse = [np.mean((y - c) ** 2) for c in cs]
mae = [np.mean(np.abs(y - c)) for c in cs]
print("mean of y   =", y.mean(), "   median of y =", np.median(y))
print("best c for MSE:", cs[np.argmin(mse)], "  MSE there =", round(min(mse), 3))
print("best c for MAE:", cs[np.argmin(mae)], "-", cs[np.flatnonzero(np.isclose(mae, min(mae)))[-1]],
      "(a flat stretch)  MAE there =", round(min(mae), 3))
for c in [30, 32.5, 35]:
    print(f"c={c:&lt;5}: MSE={np.mean((y-c)**2):7.3f}  MAE={np.mean(np.abs(y-c)):.3f}")</div>
  <div class="fx" data-lang="text">mean of y   = 35.0    median of y = 32.5
best c for MSE: 35.0   MSE there = 166.667
best c for MAE: 30.0 - 35.0 (a flat stretch)  MAE there = 10.0
c=30   : MSE=191.667  MAE=10.000
c=32.5 : MSE=172.917  MAE=10.000
c=35   : MSE=166.667  MAE=10.000</div>
  <p>Any c from 30 to 35 gives MAE = 10, exactly as the balancing argument says. (The MSE lines are for section 03.) This is why a model trained to minimise absolute error predicts something like the <em>conditional median</em>, and why MAE is robust: the median does not care how far out the extreme values are.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Six friends live along one road and want a meeting point that minimises the total walking distance. The best spot is the middle friend's house (the median), not the average position: the friend who lives far out of town drags the average but not the median.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MAE</strong> = (1/n) Σ |yᵢ − ŷᵢ|. Units: same as y. Range [0, ∞). Minimised by the median of y among constant predictions. sklearn: <code>mean_absolute_error</code>; scorer <code>"neg_mean_absolute_error"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>MAE's value depends on the scale of y: an MAE of 3.67 is excellent for a kitchen selling 2,000 tiffins a day and poor for one selling 5. Never compare MAE across series of different sizes; use a percentage (section 07–08) or MASE (section 09).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> MAE treats Saturday's 10-order miss as only twice as bad as Thursday's 5. For a kitchen, running out by 10 tiffins on the busiest day may be far worse than that. <b>→ next: 03 MSE and RMSE, which punish big misses more</b></div>

  <h2 id="rm-mse"><span class="num">03</span>MSE and RMSE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>MAE = 3.67 counts every order of error equally. We cannot yet express "one huge miss is worse than several small ones adding up to the same total".</p></div>
  <h3>By hand</h3>
  <p>Square each residual instead of taking its absolute value: e² = 4, 1, 9, 25, 1, 100. Sum = 140.</p>
  <ul>
    <li><strong>MSE</strong> (mean squared error) = 140 / 6 = <strong>23.33</strong>. Units: orders² ("squared tiffins"), which nobody can picture.</li>
    <li><strong>RMSE</strong> (root mean squared error) = √23.33 = <strong>4.83 orders</strong>. Taking the root brings the units back to orders.</li>
  </ul>
  <h3>Who dominates the total</h3>
  <figure class="viz"><svg viewBox="0 0 660 240" width="660">
<line x1="60" y1="205" x2="310" y2="205" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="60" y="219" text-anchor="middle" class="tm" font-size="10.5">-10</text>
<line x1="60" y1="205" x2="60" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="122.5" y="219" text-anchor="middle" class="tm" font-size="10.5">-5</text>
<line x1="122.5" y1="205" x2="122.5" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="185" y="219" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="185" y1="205" x2="185" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="247.5" y="219" text-anchor="middle" class="tm" font-size="10.5">5</text>
<line x1="247.5" y1="205" x2="247.5" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="310" y="219" text-anchor="middle" class="tm" font-size="10.5">10</text>
<line x1="310" y1="205" x2="310" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="55" y="208.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="205" x2="60" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="55" y="118.5" text-anchor="end" class="tm" font-size="10.5">50</text>
<line x1="57" y1="115" x2="60" y2="115" stroke="currentColor" opacity="0.5"/>
<text x="55" y="28.5" text-anchor="end" class="tm" font-size="10.5">100</text>
<line x1="57" y1="25" x2="60" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="60,25 61.2,26.8 62.5,28.6 63.8,30.4 65,32.2 66.2,34 67.5,35.8 68.7,37.6 70,39.4 71.2,41.2 72.5,43 73.8,44.8 75,46.6 76.2,48.4 77.5,50.2 78.8,52 80,53.8 81.2,55.6 82.5,57.4 83.8,59.2 85,61 86.2,62.8 87.5,64.6 88.8,66.4 90,68.2 91.2,70 92.5,71.8 93.8,73.6 95,75.4 96.2,77.2 97.5,79 98.8,80.8 100,82.6 101.2,84.4 102.5,86.2 103.8,88 105,89.8 106.2,91.6 107.5,93.4 108.8,95.2 110,97 111.2,98.8 112.5,100.6 113.8,102.4 115,104.2 116.2,106 117.5,107.8 118.8,109.6 120,111.4 121.2,113.2 122.5,115 123.8,116.8 125,118.6 126.2,120.4 127.5,122.2 128.8,124 130,125.8 131.2,127.6 132.5,129.4 133.8,131.2 135,133 136.2,134.8 137.5,136.6 138.8,138.4 140,140.2 141.2,142 142.5,143.8 143.8,145.6 145,147.4 146.2,149.2 147.5,151 148.8,152.8 150,154.6 151.2,156.4 152.5,158.2 153.8,160 155,161.8 156.2,163.6 157.5,165.4 158.8,167.2 160,169 161.2,170.8 162.5,172.6 163.8,174.4 165,176.2 166.2,178 167.5,179.8 168.8,181.6 170,183.4 171.2,185.2 172.5,187 173.8,188.8 175,190.6 176.2,192.4 177.5,194.2 178.8,196 180,197.8 181.2,199.6 182.5,201.4 183.8,203.2 185,205 186.3,203.2 187.5,201.4 188.8,199.6 190,197.8 191.2,196 192.5,194.2 193.8,192.4 195,190.6 196.2,188.8 197.5,187 198.8,185.2 200,183.4 201.3,181.6 202.5,179.8 203.8,178 205,176.2 206.3,174.4 207.5,172.6 208.8,170.8 210,169 211.3,167.2 212.5,165.4 213.8,163.6 215,161.8 216.2,160 217.5,158.2 218.8,156.4 220,154.6 221.2,152.8 222.5,151 223.8,149.2 225,147.4 226.2,145.6 227.5,143.8 228.8,142 230,140.2 231.2,138.4 232.5,136.6 233.8,134.8 235,133 236.3,131.2 237.5,129.4 238.8,127.6 240,125.8 241.2,124 242.5,122.2 243.8,120.4 245,118.6 246.2,116.8 247.5,115 248.8,113.2 250,111.4 251.2,109.6 252.5,107.8 253.8,106 255,104.2 256.2,102.4 257.5,100.6 258.8,98.8 260,97 261.2,95.2 262.5,93.4 263.8,91.6 265,89.8 266.2,88 267.5,86.2 268.8,84.4 270,82.6 271.2,80.8 272.5,79 273.8,77.2 275,75.4 276.2,73.6 277.5,71.8 278.8,70 280,68.2 281.2,66.4 282.5,64.6 283.8,62.8 285,61 286.2,59.2 287.5,57.4 288.8,55.6 290,53.8 291.2,52 292.5,50.2 293.8,48.4 295,46.6 296.2,44.8 297.5,43 298.8,41.2 300,39.4 301.2,37.6 302.5,35.8 303.8,34 305,32.2 306.2,30.4 307.5,28.6 308.8,26.8 310,25" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="60,25 61.2,28.6 62.5,32.1 63.8,35.6 65,39.1 66.2,42.6 67.5,46 68.7,49.3 70,52.6 71.2,55.9 72.5,59.2 73.8,62.4 75,65.6 76.2,68.8 77.5,71.9 78.8,74.9 80,78 81.2,81 82.5,84 83.8,86.9 85,89.8 86.2,92.7 87.5,95.5 88.8,98.3 90,101 91.2,103.8 92.5,106.4 93.8,109.1 95,111.7 96.2,114.3 97.5,116.8 98.8,119.3 100,121.8 101.2,124.2 102.5,126.6 103.8,128.9 105,131.3 106.2,133.6 107.5,135.8 108.8,138 110,140.2 111.2,142.3 112.5,144.4 113.8,146.5 115,148.6 116.2,150.6 117.5,152.5 118.8,154.4 120,156.3 121.2,158.2 122.5,160 123.8,161.8 125,163.5 126.2,165.2 127.5,166.9 128.8,168.6 130,170.2 131.2,171.7 132.5,173.2 133.8,174.7 135,176.2 136.2,177.6 137.5,179 138.8,180.4 140,181.7 141.2,182.9 142.5,184.2 143.8,185.4 145,186.6 146.2,187.7 147.5,188.8 148.8,189.9 150,190.9 151.2,191.9 152.5,192.8 153.8,193.8 155,194.6 156.2,195.5 157.5,196.3 158.8,197.1 160,197.8 161.2,198.5 162.5,199.2 163.8,199.8 165,200.4 166.2,200.9 167.5,201.5 168.8,202 170,202.4 171.2,202.8 172.5,203.2 173.8,203.5 175,203.8 176.2,204.1 177.5,204.4 178.8,204.6 180,204.7 181.2,204.8 182.5,204.9 183.8,205 185,205 186.3,205 187.5,204.9 188.8,204.8 190,204.7 191.2,204.6 192.5,204.4 193.8,204.1 195,203.8 196.2,203.5 197.5,203.2 198.8,202.8 200,202.4 201.3,202 202.5,201.5 203.8,200.9 205,200.4 206.3,199.8 207.5,199.2 208.8,198.5 210,197.8 211.3,197.1 212.5,196.3 213.8,195.5 215,194.6 216.2,193.8 217.5,192.8 218.8,191.9 220,190.9 221.2,189.9 222.5,188.8 223.8,187.7 225,186.6 226.2,185.4 227.5,184.2 228.8,182.9 230,181.7 231.2,180.4 232.5,179 233.8,177.6 235,176.2 236.3,174.7 237.5,173.2 238.8,171.7 240,170.2 241.2,168.6 242.5,166.9 243.8,165.2 245,163.5 246.2,161.8 247.5,160 248.8,158.2 250,156.3 251.2,154.4 252.5,152.5 253.8,150.6 255,148.6 256.2,146.5 257.5,144.4 258.8,142.3 260,140.2 261.2,138 262.5,135.8 263.8,133.6 265,131.3 266.2,128.9 267.5,126.6 268.8,124.2 270,121.8 271.2,119.3 272.5,116.8 273.8,114.3 275,111.7 276.2,109.1 277.5,106.4 278.8,103.8 280,101 281.2,98.3 282.5,95.5 283.8,92.7 285,89.8 286.2,86.9 287.5,84 288.8,81 290,78 291.2,74.9 292.5,71.9 293.8,68.8 295,65.6 296.2,62.4 297.5,59.2 298.8,55.9 300,52.6 301.2,49.3 302.5,46 303.8,42.6 305,39.1 306.2,35.6 307.5,32.1 308.8,28.6 310,25" fill="none" class="sr" stroke-width="2.5"/>
<text x="185" y="235" text-anchor="middle" class="tm" font-size="11">error e</text>
<text x="185" y="17" text-anchor="middle" font-size="12.5" font-weight="700">penalty for one error</text>
<text x="140" y="56" class="tr" font-size="11">red: e² (MSE)</text><text x="140" y="72" class="tb" font-size="11">blue: 10·|e| (MAE)</text>
<rect x="390" y="188.6" width="16" height="16.4" class="fb sb"/><rect x="407" y="199.9" width="16" height="5.1" class="fr sr"/>
<text x="406" y="220" text-anchor="middle" class="tm" font-size="10.5">Mon</text>
<rect x="430" y="196.8" width="16" height="8.2" class="fb sb"/><rect x="447" y="203.7" width="16" height="1.3" class="fr sr"/>
<text x="446" y="220" text-anchor="middle" class="tm" font-size="10.5">Tue</text>
<rect x="470" y="180.5" width="16" height="24.5" class="fb sb"/><rect x="487" y="193.4" width="16" height="11.6" class="fr sr"/>
<text x="486" y="220" text-anchor="middle" class="tm" font-size="10.5">Wed</text>
<rect x="510" y="164.1" width="16" height="40.9" class="fb sb"/><rect x="527" y="172.9" width="16" height="32.1" class="fr sr"/>
<text x="526" y="220" text-anchor="middle" class="tm" font-size="10.5">Thu</text>
<rect x="550" y="196.8" width="16" height="8.2" class="fb sb"/><rect x="567" y="203.7" width="16" height="1.3" class="fr sr"/>
<text x="566" y="220" text-anchor="middle" class="tm" font-size="10.5">Fri</text>
<rect x="590" y="123.2" width="16" height="81.8" class="fb sb"/><rect x="607" y="76.4" width="16" height="128.6" class="fr sr"/>
<text x="606" y="220" text-anchor="middle" class="tm" font-size="10.5">Sat</text>
<line x1="385" y1="205" x2="630" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="510" y="17" text-anchor="middle" font-size="12.5" font-weight="700">share of the total</text>
<text x="395" y="40" class="tb" font-size="10.5">blue: Σ|e| share, Sat 45%</text><text x="395" y="55" class="tr" font-size="10.5">red: Σe² share, Sat 71%</text>
</svg><figcaption>Left: the penalty for one error. Small errors are cheaper under squaring, big ones much dearer. Right: each day's share of the total. Saturday is 45% of Σ|e| but 71% of Σe².</figcaption></figure>
  <p>Saturday alone contributes 100 of the 140 squared units. Squaring turns "Saturday is the worst day" into "Saturday is most of the score". That is exactly what you want if big misses are disproportionately costly, and exactly what you do not want if Saturday was a data-entry error.</p>
  <h3>The best constant under MSE is the mean</h3>
  <p>For a constant forecast c, MSE(c) = (1/n) Σ (yᵢ − c)². Take the derivative and set it to 0: −(2/n) Σ (yᵢ − c) = 0 ⇒ Σ yᵢ = n·c ⇒ c = mean(y) = 210/6 = 35. The output of section 02 confirms it: MSE is smallest (166.67) at c = 35. And that minimum, 166.67 = 1000/6, is the variance of y: <strong>the MSE of the best constant forecast is the variance of the target</strong>. Remember the 1000; it returns as SS_tot in section 05.</p>
  <h3>RMSE versus MAE</h3>
  <ul>
    <li><strong>RMSE ≥ MAE, always.</strong> The root of a mean of squares is at least the mean (a property of averages, the power-mean inequality). Equality holds only if every |e| is the same.</li>
    <li><strong>The ratio is a warning light.</strong> Here RMSE/MAE = 4.83/3.67 = 1.32. If all errors were equal it would be 1.0; the bigger the ratio, the more the total comes from a few large misses. Section 04 shows it jumping to 1.91 after one freak day.</li>
    <li><strong>Upper bound.</strong> RMSE ≤ √n · MAE (reached when a single day carries all the error).</li>
  </ul>
  <h3>Why models are trained on MSE</h3>
  <p>MSE is smooth (its derivative 2e exists everywhere, unlike |e| at 0), so gradient descent and the closed-form normal equation work (<a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>, <a class="xref" data-note="ml_regression">Linear Regression</a>). If the errors are Gaussian, minimising MSE is the same as maximising likelihood. So MSE is the natural <em>training</em> loss; RMSE is its human-readable <em>report</em>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A traffic fine that grows with the square of your excess speed: 10 km/h over costs ₹100, 20 over costs ₹400, 40 over costs ₹1,600. Many small slips are cheap; one wild drive is ruinous.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MSE</strong> = (1/n) Σ (yᵢ − ŷᵢ)². <strong>RMSE</strong> = √MSE, in the units of y. Minimised by the mean of y among constants; MSE of that constant = Var(y). sklearn: <code>mean_squared_error</code>, <code>root_mean_squared_error</code>; scorers <code>"neg_mean_squared_error"</code>, <code>"neg_root_mean_squared_error"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>RMSE is not "the average error". Saying "we are off by 4.83 tiffins a day on average" is wrong; that is MAE (3.67). And averaging RMSE across folds or series is not the RMSE of the pooled data: average the MSEs, then take the root.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Because squaring lets one day dominate, RMSE can be ruined by a single freak day, and neither MAE nor RMSE says what a typical day or the worst day looks like. <b>→ next: 04 Median absolute error and max error</b></div>

  <h2 id="rm-robust"><span class="num">04</span>Median Absolute Error and Max Error</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>RMSE (4.83) is pulled up mostly by Saturday. If Saturday was a festival or a typo, how good is the model on an ordinary day? And separately: what is the single worst miss we must plan for?</p></div>
  <h3>By hand</h3>
  <p>Sort the absolute errors: 1, 1, 2, 3, 5, 10. The <strong>median absolute error</strong> is the middle value; with six values, the average of the 3rd and 4th: (2 + 3)/2 = <strong>2.5 orders</strong>. Half the days are off by 2.5 or less. The <strong>max error</strong> is simply the largest: <strong>10 orders</strong> (Saturday).</p>
  <h3>A freak day: who notices?</h3>
  <p>Suppose Saturday had been a festival: 60 orders, but the model said 20. One residual becomes 40 instead of 10.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from sklearn.metrics import (median_absolute_error, max_error, mean_absolute_error,
                             root_mean_squared_error)

ae = np.abs(y - yhat)
print("|e| sorted:", np.sort(ae), " -&gt; median of 2 and 3 =", np.median(ae))
print(f"MedAE = {median_absolute_error(y, yhat):.2f}   max error = {max_error(y, yhat):.0f}")

print("\\nSaturday was a festival: 60 real orders, but suppose the model said 20 (a 40-order miss)")
y2 = yhat.copy(); y2[5] = 20
for name, f in [("original forecast", yhat), ("festival miss", y2)]:
    print(f"{name:18s} MAE={mean_absolute_error(y, f):5.2f}  RMSE={root_mean_squared_error(y, f):5.2f}  "
          f"MedAE={median_absolute_error(y, f):4.2f}  max={max_error(y, f):4.0f}  RMSE/MAE={root_mean_squared_error(y, f)/mean_absolute_error(y, f):.2f}")</div>
  <div class="fx" data-lang="text">|e| sorted: [ 1.  1.  2.  3.  5. 10.]  -&gt; median of 2 and 3 = 2.5
MedAE = 2.50   max error = 10

Saturday was a festival: 60 real orders, but suppose the model said 20 (a 40-order miss)
original forecast  MAE= 3.67  RMSE= 4.83  MedAE=2.50  max=  10  RMSE/MAE=1.32
festival miss      MAE= 8.67  RMSE=16.53  MedAE=2.50  max=  40  RMSE/MAE=1.91</div>
  <p>By hand for the festival case: |e| = 2, 1, 3, 5, 1, 40, so MAE = 52/6 = 8.67; e² sum = 4 + 1 + 9 + 25 + 1 + 1600 = 1640, so RMSE = √(1640/6) = 16.53. One bad day multiplied MAE by 2.4 and RMSE by 3.4, while MedAE did not move at all (2.5): the median ignores how extreme the extreme value is. The RMSE/MAE ratio jumped from 1.32 to 1.91, flagging that one day dominates.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Normal week</th><th>Festival miss</th><th>Reacts to the one bad day?</th></tr>
    <tr><td>MedAE</td><td>2.50</td><td>2.50</td><td>Not at all</td></tr>
    <tr><td>MAE</td><td>3.67</td><td>8.67</td><td>In proportion</td></tr>
    <tr><td>RMSE</td><td>4.83</td><td>16.53</td><td>Strongly</td></tr>
    <tr><td>Max error</td><td>10</td><td>40</td><td>Only to it</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a delivery service. MedAE: "a typical order is 2.5 minutes late". Max error: "the worst order was 40 minutes late". You need the first to describe the service and the second to decide whether you can promise a time.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Median absolute error</strong> = median(|yᵢ − ŷᵢ|), robust to a minority of huge errors. <strong>Max error</strong> = maxᵢ |yᵢ − ŷᵢ|, the worst case. sklearn: <code>median_absolute_error</code>, <code>max_error</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Robust is not always good. If festival days really happen and really cost money, a metric that ignores them (MedAE) will happily select a model that fails on every festival. Decide whether extreme days are noise or business before choosing a robust metric. Max error depends on a single row and grows with test-set size; use it as a check, not a model-selection score.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We have four sizes of error (3.67, 4.83, 2.5, 10), but no way to say whether 3.67 is good. Good compared with what? <b>→ next: 05 R², which compares the model with the simplest possible forecast</b></div>

  <h2 id="rm-r2"><span class="num">05</span>R²: Compared with Always Guessing the Mean</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>MAE 3.67 and RMSE 4.83 are in orders. Is that good? It depends on how much the orders move around: if every day were 35, an RMSE of 4.83 would be awful; if days ranged from 0 to 500, it would be superb. We need a score that compares the model's errors with how hard the series is to predict.</p></div>
  <h3>The baseline: always predict the mean</h3>
  <p>The laziest forecast that still uses the data is "every day = the average day", 35 orders. Section 03 showed that this constant minimises squared error among all constants, so it is the fair "know-nothing" benchmark. Its squared misses are the deviations of y from its mean:</p>
  <table class="tbl">
    <tr><th>Day</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sum</th></tr>
    <tr><td>y − 35</td><td>−15</td><td>−10</td><td>−5</td><td>0</td><td>+5</td><td>+25</td><td>0</td></tr>
    <tr><td>(y − 35)²</td><td>225</td><td>100</td><td>25</td><td>0</td><td>25</td><td>625</td><td><strong>SS_tot = 1000</strong></td></tr>
    <tr><td>model's e²</td><td>4</td><td>1</td><td>9</td><td>25</td><td>1</td><td>100</td><td><strong>SS_res = 140</strong></td></tr>
  </table>
  <h3>Deriving R²</h3>
  <p>SS_tot ("total sum of squares") is how much squared error you get by knowing nothing. SS_res ("residual sum of squares") is how much is left with the model. The share of the baseline's error that the model removed is:</p>
  <p><strong>R² = 1 − SS_res / SS_tot = 1 − 140 / 1000 = 0.86</strong></p>
  <p>Read it as "the model removes 86% of the squared error of the mean forecast", or in the textbook phrase, "explains 86% of the variance of y". Divide top and bottom by n and the formula becomes R² = 1 − MSE(model) / MSE(mean) = 1 − MSE / Var(y): R² is just MSE rescaled by the target's variance, which makes it unit-free and comparable across targets.</p>
  <figure class="viz"><svg viewBox="0 0 660 255" width="660">
<line x1="50" y1="200" x2="310" y2="200" stroke="currentColor" opacity="0.5"/>
<line x1="50" y1="30" x2="50" y2="200" stroke="currentColor" opacity="0.5"/>
<text x="45" y="203.5" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="47" y1="200" x2="50" y2="200" stroke="currentColor" opacity="0.5"/>
<text x="45" y="146.8" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="47" y1="143.3" x2="50" y2="143.3" stroke="currentColor" opacity="0.5"/>
<text x="45" y="90.2" text-anchor="end" class="tm" font-size="10.5">50</text>
<line x1="47" y1="86.7" x2="50" y2="86.7" stroke="currentColor" opacity="0.5"/>
<text x="45" y="33.5" text-anchor="end" class="tm" font-size="10.5">70</text>
<line x1="47" y1="30" x2="50" y2="30" stroke="currentColor" opacity="0.5"/>
<text x="180" y="22" text-anchor="middle" font-size="12.5" font-weight="700">baseline: always 35</text>
<line x1="71.7" y1="171.7" x2="71.7" y2="129.2" class="sr" stroke-width="3"/>
<circle cx="71.7" cy="171.7" r="4.5" class="fb sb"/>
<circle cx="71.7" cy="129.2" r="3" fill="currentColor" opacity="0.6"/>
<line x1="115" y1="157.5" x2="115" y2="129.2" class="sr" stroke-width="3"/>
<circle cx="115" cy="157.5" r="4.5" class="fb sb"/>
<circle cx="115" cy="129.2" r="3" fill="currentColor" opacity="0.6"/>
<line x1="158.3" y1="143.3" x2="158.3" y2="129.2" class="sr" stroke-width="3"/>
<circle cx="158.3" cy="143.3" r="4.5" class="fb sb"/>
<circle cx="158.3" cy="129.2" r="3" fill="currentColor" opacity="0.6"/>
<line x1="201.7" y1="129.2" x2="201.7" y2="129.2" class="sr" stroke-width="3"/>
<circle cx="201.7" cy="129.2" r="4.5" class="fb sb"/>
<circle cx="201.7" cy="129.2" r="3" fill="currentColor" opacity="0.6"/>
<line x1="245" y1="115" x2="245" y2="129.2" class="sr" stroke-width="3"/>
<circle cx="245" cy="115" r="4.5" class="fb sb"/>
<circle cx="245" cy="129.2" r="3" fill="currentColor" opacity="0.6"/>
<line x1="288.3" y1="58.3" x2="288.3" y2="129.2" class="sr" stroke-width="3"/>
<circle cx="288.3" cy="58.3" r="4.5" class="fb sb"/>
<circle cx="288.3" cy="129.2" r="3" fill="currentColor" opacity="0.6"/>
<text x="180" y="222" text-anchor="middle" class="tr" font-size="11.5" font-weight="700">SS_tot = 225+100+25+0+25+625 = 1000</text><line x1="380" y1="200" x2="640" y2="200" stroke="currentColor" opacity="0.5"/>
<line x1="380" y1="30" x2="380" y2="200" stroke="currentColor" opacity="0.5"/>
<text x="375" y="203.5" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="377" y1="200" x2="380" y2="200" stroke="currentColor" opacity="0.5"/>
<text x="375" y="146.8" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="377" y1="143.3" x2="380" y2="143.3" stroke="currentColor" opacity="0.5"/>
<text x="375" y="90.2" text-anchor="end" class="tm" font-size="10.5">50</text>
<line x1="377" y1="86.7" x2="380" y2="86.7" stroke="currentColor" opacity="0.5"/>
<text x="375" y="33.5" text-anchor="end" class="tm" font-size="10.5">70</text>
<line x1="377" y1="30" x2="380" y2="30" stroke="currentColor" opacity="0.5"/>
<text x="510" y="22" text-anchor="middle" font-size="12.5" font-weight="700">the model's forecast</text>
<line x1="401.7" y1="171.7" x2="401.7" y2="166" class="sg" stroke-width="3"/>
<circle cx="401.7" cy="171.7" r="4.5" class="fb sb"/>
<circle cx="401.7" cy="166" r="3" fill="currentColor" opacity="0.6"/>
<line x1="445" y1="157.5" x2="445" y2="160.3" class="sg" stroke-width="3"/>
<circle cx="445" cy="157.5" r="4.5" class="fb sb"/>
<circle cx="445" cy="160.3" r="3" fill="currentColor" opacity="0.6"/>
<line x1="488.3" y1="143.3" x2="488.3" y2="134.8" class="sg" stroke-width="3"/>
<circle cx="488.3" cy="143.3" r="4.5" class="fb sb"/>
<circle cx="488.3" cy="134.8" r="3" fill="currentColor" opacity="0.6"/>
<line x1="531.7" y1="129.2" x2="531.7" y2="143.3" class="sg" stroke-width="3"/>
<circle cx="531.7" cy="129.2" r="4.5" class="fb sb"/>
<circle cx="531.7" cy="143.3" r="3" fill="currentColor" opacity="0.6"/>
<line x1="575" y1="115" x2="575" y2="112.2" class="sg" stroke-width="3"/>
<circle cx="575" cy="115" r="4.5" class="fb sb"/>
<circle cx="575" cy="112.2" r="3" fill="currentColor" opacity="0.6"/>
<line x1="618.3" y1="58.3" x2="618.3" y2="86.7" class="sg" stroke-width="3"/>
<circle cx="618.3" cy="58.3" r="4.5" class="fb sb"/>
<circle cx="618.3" cy="86.7" r="3" fill="currentColor" opacity="0.6"/>
<text x="510" y="222" text-anchor="middle" class="tg" font-size="11.5" font-weight="700">SS_res = 4+1+9+25+1+100 = 140</text>
<text x="330" y="246" text-anchor="middle" font-size="12" font-weight="700">R² = 1 − 140/1000 = 0.86: the model removes 86% of the baseline's squared error</text>
</svg><figcaption>Left: the baseline's misses (red sticks from 35 to each real value), whose squares sum to 1000. Right: the model's misses (green sticks), whose squares sum to 140. R² is one minus the ratio of the two totals.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from sklearn.metrics import r2_score, explained_variance_score

ss_res = np.sum((y - yhat) ** 2)                  # model's squared misses
ss_tot = np.sum((y - y.mean()) ** 2)              # misses of "always predict the mean (35)"
print("deviations from mean:", y - y.mean())
print(f"SS_res = {ss_res:.0f}   SS_tot = {ss_tot:.0f}")
r2 = 1 - ss_res / ss_tot
print(f"R² = 1 - {ss_res:.0f}/{ss_tot:.0f} = {r2:.3f}   sklearn {r2_score(y, yhat):.3f}")
n, p = len(y), 1                                  # suppose the model used p = 1 feature
print(f"adjusted R² (p=1) = 1 - (1-R²)(n-1)/(n-p-1) = {1 - (1-r2)*(n-1)/(n-p-1):.3f}")
print(f"adjusted R² (p=3) = {1 - (1-r2)*(n-1)/(n-3-1):.3f}")

print("\\nthree other forecasts:")
for name, f in [("predict the mean 35", np.full(6, 35.0)),
                ("forecast + 10 (biased)", yhat + 10),
                ("reversed forecast", yhat[::-1])]:
    print(f"{name:24s} R²={r2_score(y, f):7.3f}   explained variance={explained_variance_score(y, f):7.3f}")</div>
  <div class="fx" data-lang="text">deviations from mean: [-15. -10.  -5.   0.   5.  25.]
SS_res = 140   SS_tot = 1000
R² = 1 - 140/1000 = 0.860   sklearn 0.860
adjusted R² (p=1) = 1 - (1-R²)(n-1)/(n-p-1) = 0.825
adjusted R² (p=3) = 0.650

three other forecasts:
predict the mean 35      R²=  0.000   explained variance=  0.000
forecast + 10 (biased)   R²=  0.460   explained variance=  0.877
reversed forecast        R²= -1.860   explained variance= -1.843</div>
  <h3>What values R² can take</h3>
  <ul>
    <li><strong>R² = 1</strong>: perfect, SS_res = 0.</li>
    <li><strong>R² = 0</strong>: no better than the mean. "predict the mean 35" scores exactly 0.000 above, by construction.</li>
    <li><strong>R² &lt; 0</strong>: <em>worse</em> than the mean. The reversed forecast (Saturday's 50 given to Monday, and so on) scores −1.86: its squared error is 2.86 times the baseline's. There is no lower limit. On the data a linear-regression model was <em>trained</em> on (with an intercept), R² cannot go below 0, because the mean is one of the lines it could have chosen; on new data, or for any other model, it can. So "R² is between 0 and 1" is only true in-sample.</li>
  </ul>
  <h3>R² vs explained variance</h3>
  <p>The biased forecast (every forecast + 10) has R² 0.46, but <code>explained_variance_score</code> says 0.877. Explained variance = 1 − Var(residuals)/Var(y): it subtracts the mean residual first, so it forgives a constant bias. Shifting all forecasts by +10 makes every day worse, and R² notices; explained variance does not. Prefer R² for evaluation; the two agree only when the mean residual is 0.</p>
  <h3>R² on the test set uses the test mean</h3>
  <p>sklearn's <code>r2_score(y_test, pred)</code> builds SS_tot from the mean of <em>y_test</em>. A model that predicts the training mean will usually score slightly below 0 on a test set whose mean differs (section 13 shows −0.098 on the kitchen data). Also, R² depends on how varied the test set is: the same model gets a lower R² on a test set with a narrow range of y, although its errors did not change. Compare R² only on the same test set.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student's exam score compared with the class average. R² says how much of the gap between "the average student" and perfection this student closed. Negative R² is a student who did worse than simply writing the class average for every answer.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>R²</strong> (coefficient of determination) = 1 − SS_res/SS_tot, where SS_res = Σ(yᵢ − ŷᵢ)² and SS_tot = Σ(yᵢ − ȳ)². Range (−∞, 1]. For least-squares linear regression with intercept, evaluated on its training data, R² equals the squared correlation between y and ŷ. sklearn: <code>r2_score</code>, scorer <code>"r2"</code>; <code>LinearRegression().score(X, y)</code> also returns R².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high R² does not mean good forecasts. With a strongly trending series, even a poor model gets R² 0.95 because the mean is a terrible baseline. And R² says nothing about bias or about the size of errors in units: report RMSE or MAE beside it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> On training data, adding any column, even random noise, can only lower SS_res, so R² never goes down as a model grows. R² cannot tell a real improvement from a model that is just bigger. <b>→ next: 06 Adjusted R²</b></div>

  <h2 id="rm-adj"><span class="num">06</span>Adjusted R²</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>R² = 0.86. If the kitchen's model used 1 feature to get there, that is impressive with 6 days of data; if it used 4 features, it has nearly as many knobs as data points and could fit almost anything. Plain R² cannot tell the two apart.</p></div>
  <h3>The idea</h3>
  <p>Replace the two sums of squares by their unbiased variance estimates, dividing each by its degrees of freedom: SS_res by (n − p − 1) (n rows minus p slopes minus 1 intercept) and SS_tot by (n − 1). Each feature then "costs" a degree of freedom:</p>
  <p><strong>Adjusted R² = 1 − (1 − R²) · (n − 1)/(n − p − 1)</strong></p>
  <h3>By hand</h3>
  <ul>
    <li>p = 1 feature: 1 − 0.14 × 5/4 = 1 − 0.175 = <strong>0.825</strong>.</li>
    <li>p = 3 features: 1 − 0.14 × 5/2 = 1 − 0.35 = <strong>0.650</strong>.</li>
  </ul>
  <p>Same R², very different verdicts (both in the output of section 05). A new feature raises adjusted R² only if it reduces (1 − R²) by more than the penalty grows; roughly, if its t-statistic in a linear regression exceeds 1 in absolute value. Adjusted R² can be negative, and with p close to n it becomes unstable.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor who charges for every measurement taken. A suit that fits well after 3 measurements beats one that fits slightly better after 30.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Adjusted R²</strong> = 1 − [SS_res/(n − p − 1)] / [SS_tot/(n − 1)] = 1 − (1 − R²)(n − 1)/(n − p − 1), with n rows and p predictors. sklearn has no function for it (compute it); statsmodels prints it as "Adj. R-squared" (<a class="xref" data-note="ml_regression">Linear Regression</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adjusted R² is an in-sample correction for linear models with a clear p. For trees, boosting or regularized models, "number of features" is not the number of degrees of freedom; judge them on held-out data or cross-validation instead (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> R², MAE and RMSE are all in units (or squared units) of orders. A 3-order miss is a disaster at 5 orders and nothing at 2,000, and none of these metrics says which. <b>→ next: 07 MAPE, the error as a percentage</b></div>

  <h2 id="rm-mape"><span class="num">07</span>MAPE and Its Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The owner runs two kitchens: ours (about 35 orders a day) and a big one (about 2,000). MAE 3.67 here and MAE 40 there: which forecast is better? Errors in orders cannot be compared across sizes. We need the error relative to the size of the day.</p></div>
  <h3>By hand</h3>
  <p>Divide each absolute error by the real value, then average: the <strong>mean absolute percentage error</strong>.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import days, y, yhat
from sklearn.metrics import mean_absolute_percentage_error

pe = np.abs(y - yhat) / np.abs(y)                     # each miss as a share of the real value
for d, a, b, q in zip(days, y, yhat, pe):
    print(f"{d}: |{a:.0f} - {b:.0f}| / {a:.0f} = {q:.4f}")
print(f"MAPE = mean = {pe.mean()*100:.3f}%    sklearn {mean_absolute_percentage_error(y, yhat)*100:.3f}%  (sklearn returns a fraction)")

print("\\nTrap 1: a quiet day. Add Sunday: 1 real order, forecast 4")
y7, f7 = np.r_[y, 1.0], np.r_[yhat, 4.0]
print(f"MAE  {np.abs(y-yhat).mean():.3f} -&gt; {np.abs(y7-f7).mean():.3f}     "
      f"MAPE {mean_absolute_percentage_error(y, yhat)*100:.2f}% -&gt; {mean_absolute_percentage_error(y7, f7)*100:.2f}%")
print("a day with 0 orders: sklearn MAPE =", f"{mean_absolute_percentage_error([0, 10], [1, 10]):.3e}", "(divides by machine epsilon)")

print("\\nTrap 2: asymmetry. Real value 100:")
for f in [50, 150, 200, 0]:
    print(f"  forecast {f:3d}: APE = {abs(100-f)/100:.0%}")
print("Real value 50 forecast 100 vs real 100 forecast 50 (same miss of 50):",
      f"{abs(50-100)/50:.0%} vs {abs(100-50)/100:.0%}")

print("\\nTrap 3: MAPE pulls forecasts LOW. Two days with 10 and 100 orders; one constant forecast c for both:")
two = np.array([10.0, 100.0])
for c in [10, 30, 55, 100]:
    print(f"  c={c:3d}: MAPE={np.mean(np.abs(two - c) / two):.0%}   MSE={np.mean((two - c) ** 2):6.0f}")</div>
  <div class="fx" data-lang="text">Mon: |20 - 22| / 20 = 0.1000
Tue: |25 - 24| / 25 = 0.0400
Wed: |30 - 33| / 30 = 0.1000
Thu: |35 - 30| / 35 = 0.1429
Fri: |40 - 41| / 40 = 0.0250
Sat: |60 - 50| / 60 = 0.1667
MAPE = mean = 9.575%    sklearn 9.575%  (sklearn returns a fraction)

Trap 1: a quiet day. Add Sunday: 1 real order, forecast 4
MAE  3.667 -&gt; 3.571     MAPE 9.58% -&gt; 51.06%
a day with 0 orders: sklearn MAPE = 2.252e+15 (divides by machine epsilon)

Trap 2: asymmetry. Real value 100:
  forecast  50: APE = 50%
  forecast 150: APE = 50%
  forecast 200: APE = 100%
  forecast   0: APE = 100%
Real value 50 forecast 100 vs real 100 forecast 50 (same miss of 50): 100% vs 50%

Trap 3: MAPE pulls forecasts LOW. Two days with 10 and 100 orders; one constant forecast c for both:
  c= 10: MAPE=45%   MSE=  4050
  c= 30: MAPE=135%   MSE=  2650
  c= 55: MAPE=248%   MSE=  2025
  c=100: MAPE=450%   MSE=  4050</div>
  <p>The six percentage errors are 10%, 4%, 10%, 14.3%, 2.5%, 16.7%; their mean is <strong>MAPE = 9.58%</strong>: "the forecast is off by about 10% of the day's orders". Easy to explain and comparable across kitchens. Note that sklearn returns 0.0958, a fraction, not 9.58.</p>
  <h3>Trap 1: small and zero actuals</h3>
  <p>Add one quiet Sunday: 1 real order, forecast 4. The miss is only 3 tiffins, and MAE barely changes (3.67 → 3.57). But that day's percentage error is 3/1 = 300%, and MAPE jumps from 9.58% to <strong>51%</strong>. One tiny day now dominates the whole metric. With a real value of 0 the percentage is infinite; sklearn divides by machine epsilon and returns about 2 × 10¹⁵. Electricity load at night, sales of slow items, and intermittent demand all hit this trap.</p>
  <h3>Trap 2: asymmetry</h3>
  <p>For a real value of 100, forecasting 50 is a 50% error and forecasting 150 is a 50% error: fine. But forecasting 200 is 100% and forecasting 0 is also 100%; an under-forecast can never cost more than 100%, while an over-forecast has no upper limit. And the same 50-order miss costs 100% if the truth was 50 but only 50% if the truth was 100.</p>
  <figure class="viz"><svg viewBox="0 0 640 250" width="640">
<line x1="60" y1="205" x2="580" y2="205" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="60" y="219" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="60" y1="205" x2="60" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="146.7" y="219" text-anchor="middle" class="tm" font-size="10.5">50</text>
<line x1="146.7" y1="205" x2="146.7" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="233.3" y="219" text-anchor="middle" class="tm" font-size="10.5">100</text>
<line x1="233.3" y1="205" x2="233.3" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="320" y="219" text-anchor="middle" class="tm" font-size="10.5">150</text>
<line x1="320" y1="205" x2="320" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="406.7" y="219" text-anchor="middle" class="tm" font-size="10.5">200</text>
<line x1="406.7" y1="205" x2="406.7" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="580" y="219" text-anchor="middle" class="tm" font-size="10.5">300</text>
<line x1="580" y1="205" x2="580" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="55" y="208.5" text-anchor="end" class="tm" font-size="10.5">0%</text>
<line x1="57" y1="205" x2="60" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="55" y="163.5" text-anchor="end" class="tm" font-size="10.5">50%</text>
<line x1="57" y1="160" x2="60" y2="160" stroke="currentColor" opacity="0.5"/>
<text x="55" y="118.5" text-anchor="end" class="tm" font-size="10.5">100%</text>
<line x1="57" y1="115" x2="60" y2="115" stroke="currentColor" opacity="0.5"/>
<text x="55" y="73.5" text-anchor="end" class="tm" font-size="10.5">150%</text>
<line x1="57" y1="70" x2="60" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="55" y="28.5" text-anchor="end" class="tm" font-size="10.5">200%</text>
<line x1="57" y1="25" x2="60" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="60,115 61.7,115.9 63.5,116.8 65.2,117.7 66.9,118.6 68.7,119.5 70.4,120.4 72.1,121.3 73.9,122.2 75.6,123.1 77.3,124 79.1,124.9 80.8,125.8 82.5,126.7 84.3,127.6 86,128.5 87.7,129.4 89.5,130.3 91.2,131.2 92.9,132.1 94.7,133 96.4,133.9 98.1,134.8 99.9,135.7 101.6,136.6 103.3,137.5 105.1,138.4 106.8,139.3 108.5,140.2 110.3,141.1 112,142 113.7,142.9 115.5,143.8 117.2,144.7 118.9,145.6 120.7,146.5 122.4,147.4 124.1,148.3 125.9,149.2 127.6,150.1 129.3,151 131.1,151.9 132.8,152.8 134.5,153.7 136.3,154.6 138,155.5 139.7,156.4 141.5,157.3 143.2,158.2 144.9,159.1 146.7,160 148.4,160.9 150.1,161.8 151.9,162.7 153.6,163.6 155.3,164.5 157.1,165.4 158.8,166.3 160.5,167.2 162.3,168.1 164,169 165.7,169.9 167.5,170.8 169.2,171.7 170.9,172.6 172.7,173.5 174.4,174.4 176.1,175.3 177.9,176.2 179.6,177.1 181.3,178 183.1,178.9 184.8,179.8 186.5,180.7 188.3,181.6 190,182.5 191.7,183.4 193.5,184.3 195.2,185.2 196.9,186.1 198.7,187 200.4,187.9 202.1,188.8 203.9,189.7 205.6,190.6 207.3,191.5 209.1,192.4 210.8,193.3 212.5,194.2 214.3,195.1 216,196 217.7,196.9 219.5,197.8 221.2,198.7 222.9,199.6 224.7,200.5 226.4,201.4 228.1,202.3 229.9,203.2 231.6,204.1 233.3,205 235.1,204.1 236.8,203.2 238.5,202.3 240.3,201.4 242,200.5 243.7,199.6 245.5,198.7 247.2,197.8 248.9,196.9 250.7,196 252.4,195.1 254.1,194.2 255.9,193.3 257.6,192.4 259.3,191.5 261.1,190.6 262.8,189.7 264.5,188.8 266.3,187.9 268,187 269.7,186.1 271.5,185.2 273.2,184.3 274.9,183.4 276.7,182.5 278.4,181.6 280.1,180.7 281.9,179.8 283.6,178.9 285.3,178 287.1,177.1 288.8,176.2 290.5,175.3 292.3,174.4 294,173.5 295.7,172.6 297.5,171.7 299.2,170.8 300.9,169.9 302.7,169 304.4,168.1 306.1,167.2 307.9,166.3 309.6,165.4 311.3,164.5 313.1,163.6 314.8,162.7 316.5,161.8 318.3,160.9 320,160 321.7,159.1 323.5,158.2 325.2,157.3 326.9,156.4 328.7,155.5 330.4,154.6 332.1,153.7 333.9,152.8 335.6,151.9 337.3,151 339.1,150.1 340.8,149.2 342.5,148.3 344.3,147.4 346,146.5 347.7,145.6 349.5,144.7 351.2,143.8 352.9,142.9 354.7,142 356.4,141.1 358.1,140.2 359.9,139.3 361.6,138.4 363.3,137.5 365.1,136.6 366.8,135.7 368.5,134.8 370.3,133.9 372,133 373.7,132.1 375.5,131.2 377.2,130.3 378.9,129.4 380.7,128.5 382.4,127.6 384.1,126.7 385.9,125.8 387.6,124.9 389.3,124 391.1,123.1 392.8,122.2 394.5,121.3 396.3,120.4 398,119.5 399.7,118.6 401.5,117.7 403.2,116.8 404.9,115.9 406.7,115 408.4,114.1 410.1,113.2 411.9,112.3 413.6,111.4 415.3,110.5 417.1,109.6 418.8,108.7 420.5,107.8 422.3,106.9 424,106 425.7,105.1 427.5,104.2 429.2,103.3 430.9,102.4 432.7,101.5 434.4,100.6 436.1,99.7 437.9,98.8 439.6,97.9 441.3,97 443.1,96.1 444.8,95.2 446.5,94.3 448.3,93.4 450,92.5 451.7,91.6 453.5,90.7 455.2,89.8 456.9,88.9 458.7,88 460.4,87.1 462.1,86.2 463.9,85.3 465.6,84.4 467.3,83.5 469.1,82.6 470.8,81.7 472.5,80.8 474.3,79.9 476,79 477.7,78.1 479.5,77.2 481.2,76.3 482.9,75.4 484.7,74.5 486.4,73.6 488.1,72.7 489.9,71.8 491.6,70.9 493.3,70 495.1,69.1 496.8,68.2 498.5,67.3 500.3,66.4 502,65.5 503.7,64.6 505.5,63.7 507.2,62.8 508.9,61.9 510.7,61 512.4,60.1 514.1,59.2 515.9,58.3 517.6,57.4 519.3,56.5 521.1,55.6 522.8,54.7 524.5,53.8 526.3,52.9 528,52 529.7,51.1 531.5,50.2 533.2,49.3 534.9,48.4 536.7,47.5 538.4,46.6 540.1,45.7 541.9,44.8 543.6,43.9 545.3,43 547.1,42.1 548.8,41.2 550.5,40.3 552.3,39.4 554,38.5 555.7,37.6 557.5,36.7 559.2,35.8 560.9,34.9 562.7,34 564.4,33.1 566.1,32.2 567.9,31.3 569.6,30.4 571.3,29.5 573.1,28.6 574.8,27.7 576.5,26.8 578.3,25.9 580,25" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="60,25 61.7,28.6 63.5,32.1 65.2,35.5 66.9,38.8 68.7,42.1 70.4,45.4 72.1,48.6 73.9,51.7 75.6,54.7 77.3,57.7 79.1,60.7 80.8,63.6 82.5,66.4 84.3,69.2 86,72 87.7,74.7 89.5,77.3 91.2,79.9 92.9,82.5 94.7,85 96.4,87.5 98.1,89.9 99.9,92.3 101.6,94.7 103.3,97 105.1,99.3 106.8,101.5 108.5,103.8 110.3,105.9 112,108.1 113.7,110.2 115.5,112.3 117.2,114.3 118.9,116.3 120.7,118.3 122.4,120.3 124.1,122.2 125.9,124.1 127.6,126 129.3,127.9 131.1,129.7 132.8,131.5 134.5,133.3 136.3,135 138,136.7 139.7,138.4 141.5,140.1 143.2,141.8 144.9,143.4 146.7,145 148.4,146.6 150.1,148.2 151.9,149.7 153.6,151.2 155.3,152.7 157.1,154.2 158.8,155.7 160.5,157.2 162.3,158.6 164,160 165.7,161.4 167.5,162.8 169.2,164.1 170.9,165.5 172.7,166.8 174.4,168.1 176.1,169.4 177.9,170.7 179.6,172 181.3,173.2 183.1,174.5 184.8,175.7 186.5,176.9 188.3,178.1 190,179.3 191.7,180.5 193.5,181.6 195.2,182.8 196.9,183.9 198.7,185 200.4,186.1 202.1,187.2 203.9,188.3 205.6,189.3 207.3,190.4 209.1,191.5 210.8,192.5 212.5,193.5 214.3,194.5 216,195.5 217.7,196.5 219.5,197.5 221.2,198.5 222.9,199.4 224.7,200.4 226.4,201.3 228.1,202.3 229.9,203.2 231.6,204.1 233.3,205 235.1,204.1 236.8,203.2 238.5,202.3 240.3,201.5 242,200.6 243.7,199.8 245.5,198.9 247.2,198.1 248.9,197.2 250.7,196.4 252.4,195.6 254.1,194.8 255.9,194 257.6,193.2 259.3,192.4 261.1,191.7 262.8,190.9 264.5,190.1 266.3,189.4 268,188.6 269.7,187.9 271.5,187.2 273.2,186.4 274.9,185.7 276.7,185 278.4,184.3 280.1,183.6 281.9,182.9 283.6,182.2 285.3,181.5 287.1,180.8 288.8,180.2 290.5,179.5 292.3,178.8 294,178.2 295.7,177.5 297.5,176.9 299.2,176.3 300.9,175.6 302.7,175 304.4,174.4 306.1,173.8 307.9,173.1 309.6,172.5 311.3,171.9 313.1,171.3 314.8,170.7 316.5,170.2 318.3,169.6 320,169 321.7,168.4 323.5,167.9 325.2,167.3 326.9,166.7 328.7,166.2 330.4,165.6 332.1,165.1 333.9,164.5 335.6,164 337.3,163.5 339.1,162.9 340.8,162.4 342.5,161.9 344.3,161.4 346,160.8 347.7,160.3 349.5,159.8 351.2,159.3 352.9,158.8 354.7,158.3 356.4,157.8 358.1,157.4 359.9,156.9 361.6,156.4 363.3,155.9 365.1,155.4 366.8,155 368.5,154.5 370.3,154 372,153.6 373.7,153.1 375.5,152.7 377.2,152.2 378.9,151.8 380.7,151.3 382.4,150.9 384.1,150.4 385.9,150 387.6,149.6 389.3,149.1 391.1,148.7 392.8,148.3 394.5,147.9 396.3,147.4 398,147 399.7,146.6 401.5,146.2 403.2,145.8 404.9,145.4 406.7,145 408.4,144.6 410.1,144.2 411.9,143.8 413.6,143.4 415.3,143 417.1,142.6 418.8,142.3 420.5,141.9 422.3,141.5 424,141.1 425.7,140.8 427.5,140.4 429.2,140 430.9,139.6 432.7,139.3 434.4,138.9 436.1,138.6 437.9,138.2 439.6,137.9 441.3,137.5 443.1,137.1 444.8,136.8 446.5,136.5 448.3,136.1 450,135.8 451.7,135.4 453.5,135.1 455.2,134.8 456.9,134.4 458.7,134.1 460.4,133.8 462.1,133.4 463.9,133.1 465.6,132.8 467.3,132.5 469.1,132.1 470.8,131.8 472.5,131.5 474.3,131.2 476,130.9 477.7,130.6 479.5,130.3 481.2,130 482.9,129.7 484.7,129.3 486.4,129 488.1,128.7 489.9,128.4 491.6,128.2 493.3,127.9 495.1,127.6 496.8,127.3 498.5,127 500.3,126.7 502,126.4 503.7,126.1 505.5,125.8 507.2,125.6 508.9,125.3 510.7,125 512.4,124.7 514.1,124.4 515.9,124.2 517.6,123.9 519.3,123.6 521.1,123.4 522.8,123.1 524.5,122.8 526.3,122.6 528,122.3 529.7,122 531.5,121.8 533.2,121.5 534.9,121.3 536.7,121 538.4,120.7 540.1,120.5 541.9,120.2 543.6,120 545.3,119.7 547.1,119.5 548.8,119.2 550.5,119 552.3,118.8 554,118.5 555.7,118.3 557.5,118 559.2,117.8 560.9,117.5 562.7,117.3 564.4,117.1 566.1,116.8 567.9,116.6 569.6,116.4 571.3,116.1 573.1,115.9 574.8,115.7 576.5,115.5 578.3,115.2 580,115" fill="none" class="sg" stroke-width="2.5"/>
<text x="320" y="235" text-anchor="middle" class="tm" font-size="11">forecast (real value = 100)</text>
<text x="16" y="115" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 16 115)">error for this day</text>
<text x="170" y="46" class="tb" font-size="11">blue: APE (MAPE term), no upper limit</text><text x="170" y="62" class="tg" font-size="11">green: sMAPE term, at most 200%</text>
</svg><figcaption>The error charged for one day whose real value is 100. The APE (blue) is capped at 100% for under-forecasts (left of 100) but unbounded for over-forecasts. The sMAPE term (green) is capped at 200% but penalises under-forecasts more.</figcaption></figure>
  <h3>Trap 3: MAPE rewards forecasting low</h3>
  <p>Because each error is divided by the actual value, errors on small days weigh more. Two days with 10 and 100 orders and one constant forecast c: c = 10 gives MAPE (0 + 90%)/2 = 45%, the lowest possible, while c = 55 (the MSE-best mean) gives 248%. A model trained or tuned on MAPE learns to forecast low, which for a kitchen means running out of food.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper judging staff by "percentage of stock-count error". Counting 2 pens when there were 1 is a 100% error and counting 1,010 when there were 1,000 is 1%. The pen counter looks fifty times worse while being off by one item.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MAPE</strong> = (1/n) Σ |yᵢ − ŷᵢ| / |yᵢ| (× 100 for %). Undefined when any yᵢ = 0; dominated by small yᵢ; biased toward under-forecasts. sklearn: <code>mean_absolute_percentage_error</code> (returns a fraction); scorer <code>"neg_mean_absolute_percentage_error"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If your data can contain zeros or near-zeros, do not use MAPE, or at least report it only above a written-down floor (e.g. days with ≥ 5 orders). And never average MAPE across series of very different sizes to judge the business: a 50% error on a tiny product counts as much as a 50% error on the bestseller.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> MAPE gives percentages but breaks on quiet days and leans toward low forecasts. Is there a percentage that survives small values? <b>→ next: 08 sMAPE and WAPE</b></div>

  <h2 id="rm-smape"><span class="num">08</span>sMAPE and WAPE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>MAPE = 9.58% on a normal week, but one quiet Sunday pushed it to 51%. We still want a percentage (to compare kitchens), but one that a single tiny day cannot wreck.</p></div>
  <h3>sMAPE: divide by the average of truth and forecast</h3>
  <p>The "symmetric" MAPE divides each error by the mean of |y| and |ŷ| instead of |y| alone: term = 2|e| / (|y| + |ŷ|).</p>
  <h3>WAPE: total error over total volume</h3>
  <p>The weighted absolute percentage error divides the <em>sum</em> of absolute errors by the <em>sum</em> of actuals: WAPE = Σ|e| / Σ|y|. It is MAPE in which each day is weighted by its size; equivalently, it is MAE divided by the mean of y.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import days, y, yhat

s = 2 * np.abs(y - yhat) / (np.abs(y) + np.abs(yhat))
for d, a, b, q in zip(days, y, yhat, s):
    print(f"{d}: 2·|{a:.0f}-{b:.0f}| / ({a:.0f}+{b:.0f}) = {q:.4f}")
print(f"sMAPE = {s.mean()*100:.3f}%")
wape = np.abs(y - yhat).sum() / np.abs(y).sum()
print(f"WAPE  = Σ|e| / Σy = 22 / 210 = {wape*100:.3f}%")

print("\\nsMAPE is not symmetric either (real 100):")
for f in [50, 150]:
    print(f"  forecast {f}: sMAPE = {2*abs(100-f)/(100+f):.1%}")
print("quiet Sunday (real 1, forecast 4): APE =", f"{abs(1-4)/1:.0%}", " sMAPE term =", f"{2*3/5:.0%}",
      " WAPE with Sunday =", f"{(22+3)/(210+1):.2%}")</div>
  <div class="fx" data-lang="text">Mon: 2·|20-22| / (20+22) = 0.0952
Tue: 2·|25-24| / (25+24) = 0.0408
Wed: 2·|30-33| / (30+33) = 0.0952
Thu: 2·|35-30| / (35+30) = 0.1538
Fri: 2·|40-41| / (40+41) = 0.0247
Sat: 2·|60-50| / (60+50) = 0.1818
sMAPE = 9.861%
WAPE  = Σ|e| / Σy = 22 / 210 = 10.476%

sMAPE is not symmetric either (real 100):
  forecast 50: sMAPE = 66.7%
  forecast 150: sMAPE = 40.0%
quiet Sunday (real 1, forecast 4): APE = 300%  sMAPE term = 120%  WAPE with Sunday = 11.85%</div>
  <p>By hand: sMAPE terms 4/42, 2/49, 6/63, 10/65, 2/81, 20/110 average to <strong>9.86%</strong>. WAPE = 22/210 = <strong>10.48%</strong> (= MAE 3.67 / mean 35). On the quiet Sunday the sMAPE term is 120% instead of 300%: better, but still large. WAPE barely moves (10.48% → 11.85%), because a 3-tiffin miss is 3 tiffins out of 211, whatever day it happened on.</p>
  <table class="tbl">
    <tr><th></th><th>MAPE</th><th>sMAPE</th><th>WAPE</th></tr>
    <tr><td>Running week</td><td>9.58%</td><td>9.86%</td><td>10.48%</td></tr>
    <tr><td>Divides by</td><td>each |y|</td><td>each (|y|+|ŷ|)/2</td><td>total Σ|y|</td></tr>
    <tr><td>y = 0 possible?</td><td>No (infinite)</td><td>Yes, unless ŷ = 0 too</td><td>Yes, if Σy &gt; 0</td></tr>
    <tr><td>Range</td><td>0 to ∞</td><td>0 to 200%</td><td>0 to ∞</td></tr>
    <tr><td>Asymmetry</td><td>Over-forecasts unbounded</td><td>Under-forecasts cost more</td><td>None (it is a scaled MAE)</td></tr>
    <tr><td>Best for</td><td>Large, never-small series</td><td>Forecast competitions (M3)</td><td>Demand, retail, energy; business reporting</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>WAPE is a shop's monthly "items miscounted ÷ items in stock". A miscount on a slow item and on a bestseller count the same per item, so the bestseller's volume naturally dominates, which is usually what the business feels.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>sMAPE</strong> = (1/n) Σ 2|yᵢ − ŷᵢ| / (|yᵢ| + |ŷᵢ|). <strong>WAPE</strong> (also MAD/mean ratio) = Σ|yᵢ − ŷᵢ| / Σ|yᵢ| = MAE / mean(|y|). Neither is in sklearn; both are one line of numpy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"sMAPE" has several definitions (some without the 2, giving 0–100%). Always print the formula you used. Despite its name, sMAPE is not symmetric: forecasting 50 for 100 costs 66.7%, forecasting 150 costs 40%.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> A percentage says how big the errors are, not whether forecasting this series is hard. 10% might be brilliant for a chaotic series and lazy for a steady one. <b>→ next: 09 MASE, which compares with the naive forecast</b></div>

  <h2 id="rm-mase"><span class="num">09</span>MASE: Compared with the Naive Forecast</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>WAPE = 10.48%. Is that good for this kitchen? If orders barely change day to day, "tomorrow = today" might already be within 3%; if they jump around, 10% may be excellent. We need a scale-free score anchored to the simplest sensible forecast for a time series.</p></div>
  <h3>The idea</h3>
  <p>The <strong>naive forecast</strong> says "tomorrow will be like today". Measure how wrong it was on the training period (the six days before our week), and use that as the yardstick. MASE = MAE of the model ÷ in-sample MAE of the naive forecast.</p>
  <h3>By hand</h3>
  <p>History: 14, 22, 17, 28, 24, 33. The naive one-step errors are the day-to-day changes: |22−14| = 8, |17−22| = 5, |28−17| = 11, |24−28| = 4, |33−24| = 9. Their mean: 37/5 = <strong>7.4</strong>. MASE = 3.67 / 7.4 = <strong>0.50</strong>.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat, history

naive_steps = np.abs(np.diff(history))           # how wrong "tomorrow = today" was on the training days
print("history:", history, " |day-to-day changes|:", naive_steps)
scale = naive_steps.mean()
mae = np.abs(y - yhat).mean()
print(f"scale = mean = {naive_steps.sum():.0f}/{len(naive_steps)} = {scale:.2f}")
print(f"MASE  = MAE / scale = {mae:.3f} / {scale:.2f} = {mae/scale:.3f}")

# the naive forecast on the test week itself: each day = the day before (Monday uses the last history day, 33)
naive = np.r_[history[-1], y[:-1]]
print("naive forecast for the test week:", naive, f" its MAE = {np.abs(y - naive).mean():.3f}",
      f" its MASE = {np.abs(y - naive).mean()/scale:.3f}")</div>
  <div class="fx" data-lang="text">history: [14. 22. 17. 28. 24. 33.]  |day-to-day changes|: [ 8.  5. 11.  4.  9.]
scale = mean = 37/5 = 7.40
MASE  = MAE / scale = 3.667 / 7.40 = 0.495
naive forecast for the test week: [33. 20. 25. 30. 35. 40.]  its MAE = 8.833  its MASE = 1.194</div>
  <p>MASE 0.50: the model's typical miss is half the typical miss of "tomorrow = today" (as measured on the training days). MASE &lt; 1 beats that yardstick; MASE &gt; 1 is worse than it. The naive forecast applied to the test week itself has MASE 1.19 (it was even worse that week than in training). For weekly-seasonal data, use the <strong>seasonal naive</strong> forecast ("same day last week") as the yardstick: scale = mean |y_t − y_{t−7}|.</p>
  <p>Why the training period, not the test period? The scale must not depend on the test errors, and it is defined even for a one-day test horizon. Because the scale is an MAE in the same units as the model's MAE, MASE is unit-free, works with zeros in y (unless the series is completely constant), and is symmetric. Rob Hyndman proposed it in 2006 as the general-purpose forecast accuracy measure; it is covered in practice in <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> and <a class="xref" data-note="ml_timeseries">Time Series Basics</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a weather forecaster against "tomorrow's weather = today's weather". In a place where the weather barely changes, beating that is hard; in a place where it swings daily, it is easy. MASE grades on that curve.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MASE</strong> = MAE(test) / [ (1/(T − m)) Σ_{t=m+1}^{T} |y_t − y_{t−m}| ], where the denominator is computed on the training series of length T and m is the season length (m = 1 for plain naive, m = 7 for weekly). Not in sklearn; sktime and statsforecast provide it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>MASE is only meaningful for ordered data (time series). For cross-sectional data (houses, customers) there is no "yesterday"; use R², or a skill score against the mean or median baseline (section 13).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> MASE, MAE and RMSE all measure absolute differences: a miss of 10 on a 20-order day counts like a miss of 10 on a 1,000-order day. When it is the <em>ratio</em> that matters, and when cooking too little is worse than cooking too much, we need yet another view. <b>→ next: 10 RMSLE</b></div>

  <h2 id="rm-rmsle"><span class="num">10</span>RMSLE: Relative Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Some targets span orders of magnitude (house prices, bakery orders from 5 to 5,000). For them, forecasting 20 when the truth is 10 should count like forecasting 2,000 when the truth is 1,000: both are "double". No metric so far measures error as a ratio while staying well behaved at small values.</p></div>
  <h3>The idea</h3>
  <p>Take logs first. ln(1 + y) − ln(1 + ŷ) = ln[(1 + y)/(1 + ŷ)], a log-ratio, so equal ratios give equal errors. The "+1" keeps y = 0 allowed. Then compute RMSE on that scale:</p>
  <p><strong>RMSLE</strong> = √[ (1/n) Σ (ln(1 + yᵢ) − ln(1 + ŷᵢ))² ]</p>
  <div class="fx" data-lang="py">import numpy as np
from week import days, y, yhat
from sklearn.metrics import root_mean_squared_log_error, root_mean_squared_error

d = np.log1p(y) - np.log1p(yhat)                 # ln(1+y) - ln(1+ŷ) = ln((1+y)/(1+ŷ))
for dd, a, b, v in zip(days, y, yhat, d):
    print(f"{dd}: ln({a+1:.0f}/{b+1:.0f}) = {v:+.4f}   squared {v*v:.5f}")
print(f"RMSLE = √(mean) = √({np.mean(d**2):.5f}) = {np.sqrt(np.mean(d**2)):.4f}   sklearn {root_mean_squared_log_error(y, yhat):.4f}")
print(f"same as RMSE on log1p scale: {root_mean_squared_error(np.log1p(y), np.log1p(yhat)):.4f}")

print("\\nRMSLE cares about ratios, RMSE about absolute size (a miss of 10 each time):")
for a, b in [(20, 10), (20, 30), (1000, 990)]:
    v = np.log1p(a) - np.log1p(b)
    print(f"  real {a:4d}, forecast {b:4d}: squared error {(a-b)**2:4d}   squared log error ({v:+.3f})² = {v*v:.4f}")</div>
  <div class="fx" data-lang="text">Mon: ln(21/23) = -0.0910   squared 0.00828
Tue: ln(26/25) = +0.0392   squared 0.00154
Wed: ln(31/34) = -0.0924   squared 0.00853
Thu: ln(36/31) = +0.1495   squared 0.02236
Fri: ln(41/42) = -0.0241   squared 0.00058
Sat: ln(61/51) = +0.1790   squared 0.03206
RMSLE = √(mean) = √(0.01222) = 0.1106   sklearn 0.1106
same as RMSE on log1p scale: 0.1106

RMSLE cares about ratios, RMSE about absolute size (a miss of 10 each time):
  real   20, forecast   10: squared error  100   squared log error (+0.647)² = 0.4181
  real   20, forecast   30: squared error  100   squared log error (-0.389)² = 0.1517
  real 1000, forecast  990: squared error  100   squared log error (+0.010)² = 0.0001</div>
  <p>By hand: Monday ln(21/23) = −0.091, Saturday ln(61/51) = +0.179, and so on; the mean of the squares is 0.0122 and its root is <strong>RMSLE = 0.111</strong>. As a rough reading, the forecast is typically off by about 11% in ratio terms (e^0.111 ≈ 1.12).</p>
  <h3>Two properties shown in the last three lines</h3>
  <ul>
    <li><strong>Size-free:</strong> a 10-order miss at 1,000 costs 0.0001, at 20 it costs 0.15–0.42. RMSE charges 100 to all three.</li>
    <li><strong>Under-forecasts cost more:</strong> real 20, forecast 10 (half) costs 0.418; forecast 30 (+50%) costs 0.152. In log space, halving is as far as doubling. Useful when running out is worse than over-supply (a kitchen, inventory).</li>
  </ul>
  <h3>RMSLE and log targets</h3>
  <p>RMSLE equals the RMSE of the model on log(1 + y), so the natural way to optimise it is to train on log(1 + y) and transform predictions back with exp(·) − 1 (<code>TransformedTargetRegressor</code>). One catch: the back-transformed prediction estimates something like the median, not the mean, so it is biased low in the original units. Section 12 shows this on the kitchen data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A stock trader thinks in percentages: a ₹10 drop on a ₹20 share is a disaster, the same ₹10 on a ₹2,000 share is noise. RMSLE thinks like the trader; RMSE thinks like an accountant counting rupees.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RMSLE</strong> = √(mean (log1p(y) − log1p(ŷ))²); requires y, ŷ &gt; −1 (in practice ≥ 0). sklearn: <code>root_mean_squared_log_error</code>, <code>mean_squared_log_error</code> (raise an error for negative values); scorer <code>"neg_root_mean_squared_log_error"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>RMSLE fails if a model predicts a negative value (a linear model can): clip predictions at 0 first. And RMSLE ignores absolute size by design: a model that is off by 20% on the biggest customer costs the same as 20% on the smallest, which may not be what the business wants.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We now have ten metrics for one week. Which should the kitchen actually use to pick a model, and how do they line up? <b>→ next: 11 Which Metric When</b></div>

  <h2 id="rm-choose"><span class="num">11</span>Which Metric When</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>On the same six days we have ME +1.67, MAE 3.67, RMSE 4.83, MedAE 2.5, max 10, R² 0.86, MAPE 9.58%, sMAPE 9.86%, WAPE 10.48%, MASE 0.50 and RMSLE 0.111. They answer different questions, and on another model they could rank differently. Which one should drive the decision?</p></div>
  <h3>Start from the cost of an error</h3>
  <p>As with classification (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>, section 11), ask what an error of a given size costs the business, then pick the metric whose penalty has the same shape:</p>
  <table class="tbl">
    <tr><th>If the cost of a miss…</th><th>Use</th><th>Week value</th><th>Best constant / what it targets</th></tr>
    <tr><td>grows in proportion to its size</td><td>MAE (or WAPE to compare sizes)</td><td>3.67 (10.48%)</td><td>median</td></tr>
    <tr><td>grows faster than its size (big misses are disasters)</td><td>RMSE / MSE</td><td>4.83</td><td>mean</td></tr>
    <tr><td>should ignore rare freak days</td><td>MedAE</td><td>2.5</td><td>median of errors</td></tr>
    <tr><td>has a hard limit (must never exceed X)</td><td>max error, or a high quantile of |e|</td><td>10</td><td>worst case</td></tr>
    <tr><td>is relative to the size of the day</td><td>WAPE (safe), MAPE (only if y never small), RMSLE (ratios)</td><td>10.48%, 9.58%, 0.111</td><td>MAPE: a low-biased value</td></tr>
    <tr><td>needs comparing across many series</td><td>MASE, WAPE</td><td>0.50</td><td>vs naive</td></tr>
    <tr><td>is asymmetric (running out worse than leftovers)</td><td>pinball (quantile) loss at q &gt; 0.5, or RMSLE</td><td>pinball q=0.9: 2.50</td><td>the q-th quantile</td></tr>
    <tr><td>you must explain "share of variation captured"</td><td>R² (plus RMSE)</td><td>0.86</td><td>mean baseline</td></tr>
  </table>
  <h3>Training loss vs reporting metric</h3>
  <p>The loss a model <em>minimises</em> and the metric you <em>report</em> should point at the same target. A model trained on squared error predicts the conditional <strong>mean</strong>; scored on MAE (which prefers the median) it is slightly handicapped on skewed data. A model trained on absolute error predicts the <strong>median</strong>. A model trained on pinball loss at q = 0.9 predicts the 90th percentile: cook enough to cover 9 days out of 10. Most libraries let you choose: <code>HistGradientBoostingRegressor(loss="absolute_error" | "squared_error" | "quantile" | "poisson")</code> (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</p>
  <h3>Two more metrics, briefly</h3>
  <ul>
    <li><strong>Pinball (quantile) loss</strong> at level q: an under-forecast of size e costs q·e, an over-forecast costs (1 − q)·e. On the week at q = 0.9: under-forecasts (1 + 5 + 10) × 0.9 = 14.4, over-forecasts (2 + 3 + 1) × 0.1 = 0.6, total 15/6 = <strong>2.50</strong>. At q = 0.5 it is half the MAE (1.83). It scores quantile forecasts and prediction intervals (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</li>
    <li><strong>Poisson / Tweedie deviance</strong>: for counts and non-negative skewed targets (claims, orders), the deviance of the matching distribution; <code>mean_poisson_deviance</code>, <code>mean_tweedie_deviance</code>. D² scores (<code>d2_absolute_error_score</code> = 1 − MAE/MAE of the median, 0.633 on the week) generalise R² to these losses.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing a metric is choosing a referee. A referee who fines every foul equally (MAE), one who fines dangerous fouls far more (RMSE), one who ignores a single freak incident (MedAE): the same match produces different winners. Pick the referee whose rules match what the league cares about.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A metric is <strong>consistent</strong> for a target statistic if, in expectation, it is minimised by forecasting that statistic: MSE for the mean, MAE for the median, pinball loss at q for the q-quantile. Train and evaluate with metrics consistent for the same statistic.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting five metrics and choosing the model that wins on the most of them is not a method. Fix one primary metric before modelling (from the business cost), keep the others as diagnostics.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Every metric is an average, so it hides <em>where</em> the model goes wrong (which days, which sizes). <b>→ next: 12 Residual Analysis</b></div>

  <h2 id="rm-resan"><span class="num">12</span>Residual Analysis</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>MAE 3.67 says how big the errors are on average. It cannot say that Saturday is always under-forecast, or that errors grow on busy days. Those patterns are what tell you how to improve the model, and a single number throws them away.</p></div>
  <h3>On the six days, by eye</h3>
  <p>The residuals are −2, +1, −3, +5, −1, +10. Two things stand out: the two biggest residuals are positive (Thursday, Saturday) and they are on the busier days. With six points this is only a hint, so look at the same kitchen at realistic scale.</p>
  <h3>The same kitchen at scale</h3>
  <p>Two years of daily orders for the kitchen (synthetic, with weekday pattern, festivals and slow growth); the last 120 days are the test period. A linear regression uses weekday, festival flag, trend, yesterday's orders and last week's orders:</p>
  <div class="fx" data-lang="py"># kitchen.py - the same tiffin kitchen at realistic scale: 730 days of orders (synthetic)
import numpy as np, pandas as pd
rng = np.random.default_rng(0)
days = pd.date_range("2024-01-01", periods=730, freq="D")
dow = days.dayofweek.values                                  # 0 = Monday
festival = rng.random(730) &lt; 0.03                            # about 11 festival days a year
level = 30 + 0.01 * np.arange(730)                           # slow growth
orders = level * np.array([0.8, 0.9, 1.0, 1.0, 1.1, 1.5, 0.6])[dow] * np.where(festival, 1.8, 1.0)
orders = np.round(rng.poisson(orders)).astype(float)
df = pd.DataFrame({"orders": orders, "dow": dow, "festival": festival.astype(int), "t": np.arange(730)}, index=days)
df["lag1"], df["lag7"] = df.orders.shift(1), df.orders.shift(7)
df = df.dropna()
train, test = df.iloc[:-120], df.iloc[-120:]                 # last 120 days are the test period</div>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from kitchen import train, test
from sklearn.linear_model import LinearRegression

def design(d):                                    # weekday dummies + festival + trend + lags
    return pd.get_dummies(d.dow, prefix="d").join(d[["festival", "t", "lag1", "lag7"]]).astype(float)
model = LinearRegression().fit(design(train), train.orders)
fit = model.predict(design(test))
res = test.orders.values - fit                    # residual = actual - predicted
print(f"mean residual (bias) = {res.mean():+.2f}   std = {res.std():.2f}")
r = pd.DataFrame({"res": res, "fit": fit, "dow": test.dow.values, "festival": test.festival.values})
print("\\nmean residual by weekday (0=Mon):"); print(r.groupby("dow").res.agg(["mean", "count"]).round(2).T)
print("\\nfestival days vs normal days:"); print(r.groupby("festival").res.agg(["mean", "count"]).round(2))
r["fit_bin"] = pd.cut(r.fit, [0, 30, 40, 50, 200])
print("\\nspread of residuals by size of forecast (funnel check):")
print(r.groupby("fit_bin", observed=True).res.agg(["std", "count"]).round(2))</div>
  <div class="fx" data-lang="text">mean residual (bias) = +0.77   std = 7.23

mean residual by weekday (0=Mon):
dow        0      1      2      3      4      5      6
mean   -1.64   0.92   1.72   1.66   2.24   3.68  -3.16
count  17.00  18.00  17.00  17.00  17.00  17.00  17.00

festival days vs normal days:
          mean  count
festival             
0         0.57    116
1         6.76      4

spread of residuals by size of forecast (funnel check):
             std  count
fit_bin                
(0, 30]     5.19     33
(30, 40]    6.34     64
(40, 50]   15.94      3
(50, 200]   9.21     20</div>
  <figure class="viz"><svg viewBox="0 0 640 255" width="640">
<line x1="60" y1="215" x2="580" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="103.3" y="229" text-anchor="middle" class="tm" font-size="10.5">20</text>
<line x1="103.3" y1="215" x2="103.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="190" y="229" text-anchor="middle" class="tm" font-size="10.5">30</text>
<line x1="190" y1="215" x2="190" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="276.7" y="229" text-anchor="middle" class="tm" font-size="10.5">40</text>
<line x1="276.7" y1="215" x2="276.7" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="363.3" y="229" text-anchor="middle" class="tm" font-size="10.5">50</text>
<line x1="363.3" y1="215" x2="363.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="450" y="229" text-anchor="middle" class="tm" font-size="10.5">60</text>
<line x1="450" y1="215" x2="450" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="536.7" y="229" text-anchor="middle" class="tm" font-size="10.5">70</text>
<line x1="536.7" y1="215" x2="536.7" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="55" y="202.7" text-anchor="end" class="tm" font-size="10.5">-20</text>
<line x1="57" y1="199.2" x2="60" y2="199.2" stroke="currentColor" opacity="0.5"/>
<text x="55" y="171" text-anchor="end" class="tm" font-size="10.5">-10</text>
<line x1="57" y1="167.5" x2="60" y2="167.5" stroke="currentColor" opacity="0.5"/>
<text x="55" y="139.3" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="135.8" x2="60" y2="135.8" stroke="currentColor" opacity="0.5"/>
<text x="55" y="107.7" text-anchor="end" class="tm" font-size="10.5">10</text>
<line x1="57" y1="104.2" x2="60" y2="104.2" stroke="currentColor" opacity="0.5"/>
<text x="55" y="76" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="57" y1="72.5" x2="60" y2="72.5" stroke="currentColor" opacity="0.5"/>
<text x="55" y="44.3" text-anchor="end" class="tm" font-size="10.5">30</text>
<line x1="57" y1="40.8" x2="60" y2="40.8" stroke="currentColor" opacity="0.5"/>
<polyline points="60,135.8 580,135.8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<text x="320" y="245" text-anchor="middle" class="tm" font-size="11">fitted value ŷ (orders)</text>
<text x="26" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 120)">residual y − ŷ</text>
<circle cx="204.7" cy="141.2" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="229.1" cy="134.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="240" cy="119.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="266.4" cy="151.1" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="381.8" cy="101.4" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="128.3" cy="160.8" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="181.3" cy="139" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="206.1" cy="141.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="229" cy="156.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="242.8" cy="126.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="264.7" cy="141" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="388.5" cy="160.9" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="124.8" cy="143.7" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="181.5" cy="151.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="207" cy="142" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="227.5" cy="136.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="242.3" cy="113.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="265.8" cy="147.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="383.8" cy="149.6" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="126.7" cy="115.9" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="180.2" cy="125.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="206.9" cy="129.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="443.6" cy="111.3" r="3.5" class="fr sr" fill-opacity="0.7"/>
<circle cx="241.5" cy="148.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="266.6" cy="119.5" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="384.5" cy="77.1" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="128.2" cy="135.4" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="183.6" cy="136.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="208.9" cy="136.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="240.2" cy="122.5" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="240.8" cy="157.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="270.1" cy="123.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="392.1" cy="136.8" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="128.3" cy="167.1" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="184" cy="117.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="208.4" cy="136.2" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="232.6" cy="132.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="240.8" cy="132.2" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="269.7" cy="152.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="387.9" cy="125.8" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="125.6" cy="121.8" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="185.3" cy="159.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="209.9" cy="133.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="231.8" cy="163.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="244.5" cy="139.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="267.7" cy="167.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="389.7" cy="161.3" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="345.3" cy="195.7" r="3.5" class="fr sr" fill-opacity="0.7"/>
<circle cx="181.7" cy="148.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="210.5" cy="105.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="228.7" cy="134.1" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="243.8" cy="108" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="266" cy="97.1" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="385.3" cy="137.5" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="131.8" cy="149.4" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="184" cy="146.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="213.7" cy="154" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="233.1" cy="94.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="246.3" cy="108.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="273.2" cy="118.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="388.4" cy="94.3" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="128.2" cy="144.9" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="184.7" cy="165.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="210.2" cy="140.1" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="237.2" cy="137.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="462" cy="80" r="3.5" class="fr sr" fill-opacity="0.7"/>
<circle cx="269.3" cy="126.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="393.4" cy="137.3" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="130.1" cy="139.3" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="183.3" cy="133.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="211.2" cy="165.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="234.5" cy="174.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="259.6" cy="148.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="272.4" cy="137.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="390.2" cy="158.3" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="131.8" cy="149.4" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="187.1" cy="128.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="209.2" cy="127" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="230.5" cy="106.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="245" cy="133.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="271.8" cy="121.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="388.3" cy="145" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="131.1" cy="149.2" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="188.3" cy="116.2" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="213" cy="131.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="237.4" cy="146.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="247.3" cy="93.5" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="272.9" cy="143.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="390.6" cy="98.3" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="130.5" cy="126.8" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="189.5" cy="119.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="427.5" cy="70.6" r="3.5" class="fr sr" fill-opacity="0.7"/>
<circle cx="231" cy="109.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="251" cy="151.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="272.7" cy="96.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="394.5" cy="99.7" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="133.2" cy="118.2" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="189.5" cy="129.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="227.4" cy="149.5" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="238.5" cy="115.6" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="246.2" cy="165.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="278.1" cy="158.5" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="396.5" cy="122.6" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="135.2" cy="150.6" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="189.9" cy="145.3" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="213.9" cy="135" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="238.5" cy="128.2" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="245.5" cy="118.1" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="271.8" cy="89.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="393.3" cy="118.3" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="132.6" cy="168.7" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="189.4" cy="164.1" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="215.8" cy="119.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="237.5" cy="112" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="250.2" cy="173.7" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="280" cy="95.9" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="394.3" cy="87" r="3.5" class="fg sg" fill-opacity="0.7"/>
<circle cx="130.6" cy="142.6" r="3.5" class="ft st" fill-opacity="0.7"/>
<circle cx="187.5" cy="169.8" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="218" cy="133.4" r="3.5" class="fb sb" fill-opacity="0.7"/>
<circle cx="380" cy="38" r="4" class="fr sr"/><text x="388" y="42" font-size="10.5">festival</text><circle cx="480" cy="38" r="4" class="fg sg"/><text x="488" y="42" font-size="10.5">Saturday</text><circle cx="380" cy="56" r="4" class="ft st"/><text x="388" y="60" font-size="10.5">Sunday</text><circle cx="480" cy="56" r="4" class="fb sb"/><text x="488" y="60" font-size="10.5">Mon–Fri</text>
</svg><figcaption>Residuals of the linear model on the 120 test days against its forecast. Saturdays (green, right) sit mostly above zero, Sundays (teal, left) mostly below, festivals (red) are under-forecast, and the cloud widens as the forecast grows.</figcaption></figure>
  <p>What the residuals say, and what each pattern means:</p>
  <table class="tbl">
    <tr><th>Look at</th><th>Seen here</th><th>Meaning</th><th>Fix</th></tr>
    <tr><td>Mean residual</td><td>+0.77</td><td>Slight overall under-forecast</td><td>Check trend features</td></tr>
    <tr><td>Mean residual by group</td><td>Sat +3.68, Sun −3.16; festival +6.76</td><td>The model adds a fixed weekday effect, but the real effect scales with the level (it is multiplicative)</td><td>Log target, or interactions (weekday × level)</td></tr>
    <tr><td>Spread vs fitted value</td><td>std 5.2 for small forecasts, 9–16 for big ones</td><td>Errors grow with size (heteroscedasticity, a "funnel")</td><td>Log target; judge with WAPE / RMSLE; intervals that widen</td></tr>
    <tr><td>Residual vs time</td><td>(check) runs of same sign</td><td>Autocorrelation: information left in recent errors</td><td>Lag features (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>)</td></tr>
    <tr><td>Histogram / Q-Q of residuals</td><td>(check) long right tail</td><td>A few big misses (festivals) dominate RMSE</td><td>Event features; robust loss</td></tr>
  </table>
  <h3>Acting on it: a log target</h3>
  <p>The funnel and the "Saturday effect grows with size" both say the effects are multiplicative, which a log target turns into additive ones:</p>
  <div class="fx" data-lang="py"># the residuals said "effects are multiplicative": fit on log(1 + orders) instead
import numpy as np, pandas as pd
from kitchen import train, test
from sklearn.linear_model import LinearRegression
from sklearn.compose import TransformedTargetRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, root_mean_squared_log_error

def design(d):
    X = pd.get_dummies(d.dow, prefix="d").join(d[["festival", "t"]]).astype(float)
    X["log_lag1"], X["log_lag7"] = np.log1p(d.lag1), np.log1p(d.lag7)
    return X
plain = LinearRegression().fit(design(train), train.orders)
logm = TransformedTargetRegressor(LinearRegression(), func=np.log1p, inverse_func=np.expm1).fit(design(train), train.orders)
for name, m in [("plain target", plain), ("log1p target", logm)]:
    f = m.predict(design(test))
    res = test.orders.values - f
    by_dow = pd.Series(res).groupby(test.dow.values).mean().round(1).tolist()
    print(f"{name:13s} MAE={mean_absolute_error(test.orders, f):.2f}  RMSE={root_mean_squared_error(test.orders, f):.2f}  "
          f"RMSLE={root_mean_squared_log_error(test.orders, np.clip(f, 0, None)):.4f}  bias={res.mean():+.2f}")
    print(f"{'':13s} mean residual Mon..Sun = {by_dow}")</div>
  <div class="fx" data-lang="text">plain target  MAE=5.67  RMSE=7.27  RMSLE=0.1948  bias=+0.79
              mean residual Mon..Sun = [-1.7, 0.9, 1.8, 1.7, 2.3, 3.7, -3.2]
log1p target  MAE=5.58  RMSE=7.09  RMSLE=0.1869  bias=+1.45
              mean residual Mon..Sun = [-0.8, 1.8, 2.5, 2.3, 2.9, 2.9, -1.4]</div>
  <p>(Both models here use logged lag features, so the plain model's MAE differs slightly from above.) MAE, RMSE and RMSLE all improve a little, and the Saturday/Sunday imbalance shrinks (3.7/−3.2 → 2.9/−1.4). But the overall bias grew from +0.79 to +1.45: transforming a log-scale prediction back with exp gives roughly the conditional <em>median</em>, which for right-skewed counts is below the mean. If the kitchen needs unbiased totals (for buying ingredients), it must correct for this (e.g. multiply by a factor fitted on validation data). A metric table alone would have hidden this trade-off; residuals showed it. Formal tests (Breusch–Pagan, Durbin–Watson, Q-Q plots) are in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor does not stop at "average temperature is normal". She looks at when the fever spikes (nights? after meals?), because the pattern points to the cause. Residual plots are the pattern; the metric is the average temperature.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Residual analysis</strong> is the inspection of eᵢ = yᵢ − ŷᵢ on held-out data: their mean (bias), their mean per segment, their spread against the fitted value (heteroscedasticity), against time (autocorrelation) and their distribution (tails). A good model leaves residuals that look like structureless noise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do residual analysis on validation or test data. Training residuals of a flexible model (a deep tree, boosting) look perfect because the model memorised them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> The linear model's MAE on the kitchen test period is 5.68. Is that good? Without the score of a simple baseline on the same 120 days, the number means nothing. <b>→ next: 13 Baseline Models</b></div>

  <h2 id="rm-base"><span class="num">13</span>Baseline Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>R² compared our six-day forecast with the mean, and MASE with the naive forecast. But for a real project, which baselines should every model beat, and by how much does the linear model actually beat them on the kitchen data?</p></div>
  <h3>The usual suspects</h3>
  <ul>
    <li><strong>Mean of train</strong>: the MSE-best constant (R² compares with this, using the test mean).</li>
    <li><strong>Median of train</strong>: the MAE-best constant.</li>
    <li><strong>Naive</strong> (time series): tomorrow = today.</li>
    <li><strong>Seasonal naive</strong>: same day last week (or last year).</li>
    <li>For cross-sectional data: a one-feature model (price per m² × area), or yesterday's production model.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from kitchen import train, test
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import (mean_absolute_error, root_mean_squared_error, r2_score,
                             mean_absolute_percentage_error, median_absolute_error)

feats = ["dow", "festival", "t", "lag1", "lag7"]
Xtr, ytr, Xte, yte = train[feats], train.orders, test[feats], test.orders
X1 = pd.get_dummies(Xtr.dow, prefix="d").join(Xtr.drop(columns="dow")).astype(float)
X2 = pd.get_dummies(Xte.dow, prefix="d").join(Xte.drop(columns="dow")).astype(float)
preds = {
    "mean of train": DummyRegressor(strategy="mean").fit(Xtr, ytr).predict(Xte),
    "median of train": DummyRegressor(strategy="median").fit(Xtr, ytr).predict(Xte),
    "naive (yesterday)": test.lag1.values,
    "seasonal naive (-7d)": test.lag7.values,
    "linear regression": LinearRegression().fit(X1, ytr).predict(X2),
    "gradient boosting": HistGradientBoostingRegressor(random_state=0).fit(Xtr, ytr).predict(Xte),
}
scale = np.abs(np.diff(ytr.values)).mean()                   # MASE scale from the training period
wape = lambda a, f: np.abs(a - f).sum() / np.abs(a).sum()
print(f"test days {len(yte)}, mean orders {yte.mean():.1f}, MASE scale {scale:.2f}")
print(f"{'model':21s}{'MAE':&gt;6s}{'RMSE':&gt;7s}{'MedAE':&gt;7s}{'R²':&gt;7s}{'MAPE':&gt;7s}{'WAPE':&gt;7s}{'MASE':&gt;6s}")
for name, f in preds.items():
    print(f"{name:21s}{mean_absolute_error(yte, f):6.2f}{root_mean_squared_error(yte, f):7.2f}"
          f"{median_absolute_error(yte, f):7.2f}{r2_score(yte, f):7.3f}{mean_absolute_percentage_error(yte, f):7.1%}"
          f"{wape(yte, f):7.1%}{mean_absolute_error(yte, f)/scale:6.2f}")</div>
  <div class="fx" data-lang="text">test days 120, mean orders 37.1, MASE scale 12.00
model                   MAE   RMSE  MedAE     R²   MAPE   WAPE  MASE
mean of train         10.33  14.21   8.00 -0.098  28.5%  27.8%  0.86
median of train       10.78  14.87   8.00 -0.203  28.3%  29.0%  0.90
naive (yesterday)     14.30  19.22   9.50 -1.009  48.1%  38.5%  1.19
seasonal naive (-7d)   8.78  12.57   6.00  0.141  24.8%  23.7%  0.73
linear regression      5.68   7.27   4.62  0.713  16.7%  15.3%  0.47
gradient boosting      7.21   9.96   5.76  0.461  21.3%  19.4%  0.60</div>
  <p>Reading the table:</p>
  <ul>
    <li><strong>Seasonal naive</strong> (MAE 8.78, MASE 0.73) is the baseline to beat, much better than plain naive (14.30, worse than the constant mean!) because Saturday follows Friday and Monday follows Sunday. Choosing the wrong baseline makes any model look good.</li>
    <li><strong>The mean of train has R² −0.098</strong> on the test period: R² uses the test mean (higher, because orders grow), so even the "R² = 0 model" scores below 0 out of sample.</li>
    <li><strong>Linear regression</strong> beats seasonal naive by about 35% in MAE (8.78 → 5.68) and has R² 0.71. That relative improvement is the honest headline, often written as a <strong>skill score</strong>: 1 − MAE_model / MAE_baseline = 1 − 5.68/8.78 = 0.35.</li>
    <li><strong>Gradient boosting</strong> loses to the linear model here: with a trend, trees cannot extrapolate beyond the training range (<a class="xref" data-note="ml_dtree">Decision Trees</a>). Only a baseline table makes that visible.</li>
    <li>The columns agree on the order of the top three (linear, boosting, seasonal naive). Mean and median of train swap places: MAE and RMSE prefer the mean (10.33 vs 10.78), MAPE prefers the median (28.3% vs 28.5%), a small live example of MAPE preferring lower forecasts. MAPE is above WAPE for every model because quiet Sundays carry large percentage errors.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new medicine is tested against a placebo and against the current best drug, never against nothing. Baselines are the placebo (mean) and the current drug (seasonal naive).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>baseline</strong> is a trivial or existing model scored on exactly the same test rows with the same metric. A <strong>skill score</strong> = 1 − score(model)/score(baseline) (for error metrics) is the fraction of the baseline's error removed; R² is the skill score of MSE against the mean, MASE is a ratio against the naive forecast. sklearn: <code>DummyRegressor(strategy="mean" | "median" | "quantile" | "constant")</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>For time series, a random train/test split lets the "baseline" and the model peek at neighbouring days and makes everything look better. Split by time (train before test), as the kitchen code does (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We computed everything with hand-written numpy and a few sklearn calls. For model selection inside cross-validation we need the full list of functions and the scorer names. <b>→ next: 14 scikit-learn API</b></div>

  <h2 id="rm-api"><span class="num">14</span>scikit-learn Regression Metrics API</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We know what each metric means. We have not yet seen which sklearn function computes it, what name to pass as <code>scoring=</code> in cross-validation, and why those names start with "neg_".</p></div>
  <table class="tbl">
    <tr><th>Metric</th><th>Function</th><th>Scorer string</th></tr>
    <tr><td>MAE</td><td><code>mean_absolute_error</code></td><td><code>neg_mean_absolute_error</code></td></tr>
    <tr><td>MSE / RMSE</td><td><code>mean_squared_error</code> / <code>root_mean_squared_error</code></td><td><code>neg_mean_squared_error</code> / <code>neg_root_mean_squared_error</code></td></tr>
    <tr><td>MedAE</td><td><code>median_absolute_error</code></td><td><code>neg_median_absolute_error</code></td></tr>
    <tr><td>Max error</td><td><code>max_error</code></td><td><code>neg_max_error</code></td></tr>
    <tr><td>R² / explained variance</td><td><code>r2_score</code> / <code>explained_variance_score</code></td><td><code>r2</code> / <code>explained_variance</code></td></tr>
    <tr><td>MAPE</td><td><code>mean_absolute_percentage_error</code> (fraction)</td><td><code>neg_mean_absolute_percentage_error</code></td></tr>
    <tr><td>MSLE / RMSLE</td><td><code>mean_squared_log_error</code> / <code>root_mean_squared_log_error</code></td><td><code>neg_mean_squared_log_error</code> / <code>neg_root_mean_squared_log_error</code></td></tr>
    <tr><td>Pinball, Poisson, Tweedie, D²</td><td><code>mean_pinball_loss</code>, <code>mean_poisson_deviance</code>, <code>mean_tweedie_deviance</code>, <code>d2_*_score</code></td><td>via <code>make_scorer</code> or <code>neg_mean_poisson_deviance</code></td></tr>
    <tr><td>sMAPE, WAPE, MASE, adjusted R²</td><td>not in sklearn: write them</td><td><code>make_scorer(f, greater_is_better=False)</code></td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from kitchen import train
from sklearn.metrics import (get_scorer_names, mean_pinball_loss, mean_poisson_deviance,
                             d2_absolute_error_score, explained_variance_score, r2_score)
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import cross_validate, TimeSeriesSplit

print([s for s in get_scorer_names() if s.startswith("neg_") and "error" in s or s in ("r2", "explained_variance")])

# a few more metrics on the running week
print(f"pinball loss, q=0.9: {mean_pinball_loss(y, yhat, alpha=0.9):.3f}   q=0.5 (= MAE/2): {mean_pinball_loss(y, yhat, alpha=0.5):.3f}")
print(f"Poisson deviance: {mean_poisson_deviance(y, yhat):.3f}   D² (absolute error): {d2_absolute_error_score(y, yhat):.3f}")

X, yy = train[["dow", "festival", "t", "lag1", "lag7"]], train.orders
r = cross_validate(HistGradientBoostingRegressor(random_state=0), X, yy, cv=TimeSeriesSplit(4), n_jobs=1,
                   scoring=["neg_mean_absolute_error", "neg_root_mean_squared_error", "r2"])
print("fold MAE :", np.round(-r["test_neg_mean_absolute_error"], 2), " (negated back: sklearn maximises -MAE)")
print("fold RMSE:", np.round(-r["test_neg_root_mean_squared_error"], 2))
print("fold R²  :", np.round(r["test_r2"], 3))</div>
  <div class="fx" data-lang="text">['explained_variance', 'neg_max_error', 'neg_mean_absolute_error', 'neg_mean_absolute_percentage_error', 'neg_mean_squared_error', 'neg_mean_squared_log_error', 'neg_median_absolute_error', 'neg_root_mean_squared_error', 'neg_root_mean_squared_log_error', 'r2']
pinball loss, q=0.9: 2.500   q=0.5 (= MAE/2): 1.833
Poisson deviance: 0.534   D² (absolute error): 0.633
fold MAE : [5.28 6.45 5.36 6.63]  (negated back: sklearn maximises -MAE)
fold RMSE: [6.79 9.75 6.65 9.71]
fold R²  : [0.524 0.361 0.647 0.384]</div>
  <p>sklearn's model-selection tools always <em>maximise</em> a score, so error metrics are exposed negated: "neg_mean_absolute_error" returns −MAE, and you flip the sign to report it. The four <code>TimeSeriesSplit</code> folds give MAE between 5.3 and 6.6 and R² between 0.36 and 0.65: the spread across folds is as informative as the average. The pinball and D² values match the hand calculations of section 11.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>regressor.score(X, y)</code> returns R², not MAE. And with "neg_" scorers, "higher is better" still holds: −3.2 beats −5.1. Forgetting the sign is the most common bug in hand-written model-comparison tables.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We have met each metric separately. How are they all built from the same residuals and baselines, and which one answers which question? <b>→ next: 15 How It All Connects</b></div>

  <h2 id="rm-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Each metric was introduced to fix the previous one's weakness. We have not yet seen, in one picture, that every one of them is built from the same six residuals, plus at most one baseline.</p></div>
  <figure class="viz"><svg viewBox="0 0 660 330" width="660">
<defs><marker id="rm-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="180" y="10" width="300" height="42" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="28" text-anchor="middle" font-size="12.5" font-weight="700">residuals e = y − ŷ</text><text x="330" y="44" text-anchor="middle" font-size="11">−2, +1, −3, +5, −1, +10</text>
<line x1="220" y1="52" x2="70" y2="86" stroke="currentColor" marker-end="url(#rm-a1)"/><line x1="290" y1="52" x2="240" y2="86" stroke="currentColor" marker-end="url(#rm-a1)"/><line x1="370" y1="52" x2="435" y2="86" stroke="currentColor" marker-end="url(#rm-a1)"/><line x1="440" y1="52" x2="585" y2="86" stroke="currentColor" marker-end="url(#rm-a1)"/>
<rect x="15" y="88" width="110" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="106" text-anchor="middle" font-size="11">keep the sign</text><text x="70" y="123" text-anchor="middle" font-size="11" font-weight="700">ME +1.67</text>
<rect x="135" y="88" width="210" height="44" rx="8" class="fb sb"/><text x="240" y="106" text-anchor="middle" font-size="11">|e|: mean, median, max</text><text x="240" y="123" text-anchor="middle" font-size="11" font-weight="700">MAE 3.67 · MedAE 2.5 · max 10</text>
<rect x="355" y="88" width="160" height="44" rx="8" class="fr sr"/><text x="435" y="106" text-anchor="middle" font-size="11">e²: mean, then √</text><text x="435" y="123" text-anchor="middle" font-size="11" font-weight="700">MSE 23.3 · RMSE 4.83</text>
<rect x="525" y="88" width="120" height="44" rx="8" class="ft st"/><text x="585" y="106" text-anchor="middle" font-size="11">log ratios²</text><text x="585" y="123" text-anchor="middle" font-size="11" font-weight="700">RMSLE 0.111</text>
<line x1="180" y1="132" x2="90" y2="168" stroke="currentColor" marker-end="url(#rm-a1)"/><line x1="240" y1="132" x2="250" y2="168" stroke="currentColor" marker-end="url(#rm-a1)"/><line x1="300" y1="132" x2="400" y2="168" stroke="currentColor" marker-end="url(#rm-a1)"/>
<line x1="470" y1="132" x2="560" y2="168" stroke="currentColor" marker-end="url(#rm-a1)"/>
<rect x="15" y="170" width="150" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="90" y="188" text-anchor="middle" font-size="11">÷ each y, average</text><text x="90" y="205" text-anchor="middle" font-size="11" font-weight="700">MAPE 9.58%</text>
<rect x="175" y="170" width="150" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="250" y="188" text-anchor="middle" font-size="11">Σ|e| ÷ Σy</text><text x="250" y="205" text-anchor="middle" font-size="11" font-weight="700">WAPE 10.48%</text>
<rect x="335" y="170" width="140" height="44" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="405" y="188" text-anchor="middle" font-size="11">MAE ÷ naive 7.4</text><text x="405" y="205" text-anchor="middle" font-size="11" font-weight="700">MASE 0.50</text>
<rect x="485" y="170" width="160" height="44" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="565" y="188" text-anchor="middle" font-size="11">1 − 140 ÷ 1000</text><text x="565" y="205" text-anchor="middle" font-size="11" font-weight="700">R² 0.86</text>
<line x1="90" y1="214" x2="90" y2="234" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#rm-a1)"/>
<rect x="15" y="236" width="150" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="90" y="254" text-anchor="middle" font-size="11">÷ (y + ŷ)/2 each</text><text x="90" y="271" text-anchor="middle" font-size="11" font-weight="700">sMAPE 9.86%</text>
<line x1="565" y1="214" x2="565" y2="234" stroke="currentColor" marker-end="url(#rm-a1)"/>
<rect x="485" y="236" width="160" height="44" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="565" y="254" text-anchor="middle" font-size="11">charge p features</text><text x="565" y="271" text-anchor="middle" font-size="11" font-weight="700">adj. R² 0.825</text>
<text x="330" y="304" text-anchor="middle" class="tm" font-size="10.5">blue: from |e| · red: from e² · teal: log ratios · green: ÷ a baseline</text>
<text x="330" y="322" text-anchor="middle" class="tm" font-size="10.5">dashed: sMAPE repairs MAPE's division by small y</text>
</svg><figcaption>Every regression metric of this note, built from the six residuals. Moving down a column means dividing by something: the size of each day, the total volume, or a baseline's error.</figcaption></figure>
  <h3>One table on the running week</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Built from</th><th>Week</th><th>Question it answers</th><th>Weakness → next</th><th>Robust to one freak day?</th><th>Units</th></tr>
    <tr><td>ME (bias)</td><td>mean e</td><td>+1.67</td><td>Which way do we lean?</td><td>Signs cancel</td><td>No</td><td>orders</td></tr>
    <tr><td>MAE</td><td>mean |e|</td><td>3.67</td><td>Typical miss size</td><td>Big misses not special</td><td>Medium</td><td>orders</td></tr>
    <tr><td>MSE / RMSE</td><td>mean e², √</td><td>23.3 / 4.83</td><td>Miss size, big ones weighted more</td><td>One day dominates</td><td>No</td><td>orders², orders</td></tr>
    <tr><td>MedAE / max</td><td>median / max of |e|</td><td>2.5 / 10</td><td>Typical day / worst day</td><td>No reference point</td><td>Yes / no</td><td>orders</td></tr>
    <tr><td>R²</td><td>1 − SS_res / SS_tot</td><td>0.86</td><td>Better than the mean, by how much?</td><td>Never falls with more features</td><td>No</td><td>none</td></tr>
    <tr><td>Adjusted R²</td><td>R² with df penalty</td><td>0.825</td><td>Worth the features?</td><td>Still in-sample, still units-blind</td><td>No</td><td>none</td></tr>
    <tr><td>MAPE</td><td>mean |e|/y</td><td>9.58%</td><td>Miss as % of the day</td><td>Explodes near 0; low bias</td><td>No</td><td>%</td></tr>
    <tr><td>sMAPE / WAPE</td><td>2|e|/(y+ŷ) / Σ|e|/Σy</td><td>9.86% / 10.48%</td><td>% that survives small days</td><td>Not anchored to difficulty</td><td>Medium</td><td>%</td></tr>
    <tr><td>MASE</td><td>MAE / naive MAE</td><td>0.50</td><td>Better than "tomorrow = today"?</td><td>Absolute, not relative</td><td>Medium</td><td>none</td></tr>
    <tr><td>RMSLE</td><td>RMSE of log1p</td><td>0.111</td><td>Ratio error, under-forecasts worse</td><td>Ignores absolute size</td><td>Medium</td><td>log units</td></tr>
  </table>
  <h3>Identities worth remembering</h3>
  <ul>
    <li>RMSE = √MSE ≥ MAE; RMSE/MAE = 1 only if all |e| are equal.</li>
    <li>MSE of the mean forecast = Var(y) = SS_tot/n (1000/6 = 166.7); R² = 1 − MSE/Var(y).</li>
    <li>WAPE = MAE / mean(y) = 3.67/35. MASE = MAE / (naive MAE). Both are MAE divided by something.</li>
    <li>RMSLE = RMSE on log1p(y). Pinball loss at q = 0.5 = MAE/2. D²_abs = 1 − MAE / MAE(median).</li>
    <li>Brier score in <a class="xref" data-note="ml_evaluation">Classification Metrics</a> = MSE with y ∈ {0, 1} and ŷ = a probability.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us.</b> Knowing how the metrics fit together does not stop the classic mistakes in using them. <b>→ next: 16 Common Mistakes</b></div>

  <h2 id="rm-traps"><span class="num">16</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Which errors in using these metrics show up again and again in code reviews and interviews?</p></div>
  <div class="cards">
    <div><b>RMSE called "average error"</b><p>The average miss is MAE (3.67), not RMSE (4.83).</p><small>Section 03</small></div>
    <div><b>R² read as accuracy</b><p>R² 0.86 is not "86% correct"; it is the share of the mean forecast's squared error removed.</p><small>Section 05</small></div>
    <div><b>"R² is between 0 and 1"</b><p>Only in-sample for least squares with intercept. Out of sample it can be any negative number (−1.86).</p><small>Section 05</small></div>
    <div><b>MAPE with small or zero actuals</b><p>One quiet day took MAPE from 9.6% to 51%. Use WAPE or MASE.</p><small>Section 07</small></div>
    <div><b>Comparing MAE across series</b><p>MAE is in units; a kitchen 50× bigger has a 50× bigger MAE. Use WAPE or MASE.</p><small>Sections 08–09</small></div>
    <div><b>No baseline</b><p>"MAE 5.68" means nothing until the seasonal naive's 8.78 sits beside it.</p><small>Section 13</small></div>
    <div><b>Wrong baseline</b><p>Plain naive (14.3) made every model look great; seasonal naive (8.78) is the honest bar.</p><small>Section 13</small></div>
    <div><b>Training loss ≠ report metric</b><p>A model trained on MSE predicts the mean; scoring it on MAPE rewards a lower forecast.</p><small>Section 11</small></div>
    <div><b>Forgetting the neg_ sign</b><p>sklearn scorers return −MAE; flip it before reporting, and remember −3 &gt; −5.</p><small>Section 14</small></div>
    <div><b>Averaging RMSE over folds</b><p>Average the MSEs then take the root, or report the mean ± spread clearly.</p><small>Section 03</small></div>
    <div><b>Only one number</b><p>Averages hide segment bias (Saturday +3.7). Always look at residuals by group.</p><small>Section 12</small></div>
    <div><b>Log target, unbiased totals?</b><p>exp of a log-scale prediction is roughly a median: totals come out low (bias +0.79 → +1.45).</p><small>Section 12</small></div>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> To revise everything above in ten minutes, use the sheet below. <b>→ next: Revision Sheet, then 17 Questions &amp; Answers</b></div>

  <h2 id="rm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: a tiffin kitchen's forecast for six days. Real orders y = 20, 25, 30, 35, 40, 60 (sum 210, mean 35); forecast ŷ = 22, 24, 33, 30, 41, 50; residuals e = y − ŷ = −2, +1, −3, +5, −1, +10. The six days before (for MASE): 14, 22, 17, 28, 24, 33.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Residual / bias</strong>: how wrong each day, and which way do we lean? ME = +1.67.</li>
    <li><strong>MAE</strong>: typical size of a miss, ignoring direction: 3.67 orders.</li>
    <li><strong>MSE / RMSE</strong>: punish big misses more: 23.3 orders², 4.83 orders.</li>
    <li><strong>MedAE / max</strong>: typical day, ignoring freak days (2.5); worst day (10).</li>
    <li><strong>R²</strong>: how much better than always predicting the mean: 0.86.</li>
    <li><strong>Adjusted R²</strong>: still better after paying for features: 0.825 (p = 1).</li>
    <li><strong>MAPE</strong>: miss as a percentage: 9.58%; breaks on small values.</li>
    <li><strong>sMAPE / WAPE</strong>: percentages that survive small days: 9.86% / 10.48%.</li>
    <li><strong>MASE</strong>: better than the naive forecast? 0.50 = half its error.</li>
    <li><strong>RMSLE</strong>: ratio errors, under-forecasts weigh more: 0.111.</li>
  </ol>
  <h3>Every formula</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Symbols</th><th>Week (by hand)</th></tr>
    <tr><td>Residual</td><td>eᵢ = yᵢ − ŷᵢ</td><td>y real, ŷ forecast</td><td>−2, +1, −3, +5, −1, +10</td></tr>
    <tr><td>ME</td><td>(1/n) Σ eᵢ</td><td>n = 6</td><td>10/6 = +1.67</td></tr>
    <tr><td>MAE</td><td>(1/n) Σ |eᵢ|</td><td></td><td>22/6 = 3.67</td></tr>
    <tr><td>MSE</td><td>(1/n) Σ eᵢ²</td><td></td><td>140/6 = 23.33</td></tr>
    <tr><td>RMSE</td><td>√MSE</td><td></td><td>4.83</td></tr>
    <tr><td>MedAE</td><td>median |eᵢ|</td><td></td><td>(2 + 3)/2 = 2.5</td></tr>
    <tr><td>Max error</td><td>max |eᵢ|</td><td></td><td>10</td></tr>
    <tr><td>R²</td><td>1 − Σeᵢ² / Σ(yᵢ − ȳ)²</td><td>ȳ = mean of y</td><td>1 − 140/1000 = 0.86</td></tr>
    <tr><td>Adjusted R²</td><td>1 − (1 − R²)(n − 1)/(n − p − 1)</td><td>p = number of features</td><td>1 − 0.14·5/4 = 0.825</td></tr>
    <tr><td>MAPE</td><td>(1/n) Σ |eᵢ|/|yᵢ|</td><td></td><td>(10 + 4 + 10 + 14.3 + 2.5 + 16.7)/6 = 9.58%</td></tr>
    <tr><td>sMAPE</td><td>(1/n) Σ 2|eᵢ| / (|yᵢ| + |ŷᵢ|)</td><td></td><td>9.86%</td></tr>
    <tr><td>WAPE</td><td>Σ|eᵢ| / Σ|yᵢ|</td><td></td><td>22/210 = 10.48%</td></tr>
    <tr><td>MASE</td><td>MAE / mean|y_t − y_{t−m}| (training)</td><td>m = season length (1 here)</td><td>3.67/7.4 = 0.50</td></tr>
    <tr><td>RMSLE</td><td>√[(1/n) Σ (ln(1 + yᵢ) − ln(1 + ŷᵢ))²]</td><td></td><td>√0.0122 = 0.111</td></tr>
    <tr><td>Pinball loss</td><td>(1/n) Σ max(q·eᵢ, (q − 1)·eᵢ)</td><td>q = target quantile</td><td>q = 0.9: 15/6 = 2.50</td></tr>
  </table>
  <h3>Key facts</h3>
  <ul>
    <li>The best constant forecast under MSE is the <strong>mean</strong> (35); under MAE the <strong>median</strong> (anything from 30 to 35 here); under MAPE a <strong>low</strong> value.</li>
    <li>MSE of the mean forecast = variance of y, so R² = 1 − MSE / Var(y).</li>
    <li>R² = 0 means "as good as the mean"; negative means worse; out of sample it has no lower limit. sklearn's test R² uses the test mean.</li>
    <li>RMSE ≥ MAE. A large RMSE/MAE ratio (1.32 → 1.91 after one festival miss) means a few big errors dominate.</li>
    <li>One festival miss of 40: MAE 3.67 → 8.67, RMSE 4.83 → 16.53, MedAE unchanged at 2.5.</li>
  </ul>
  <h3>When to use which</h3>
  <div class="cards">
    <div><b>MAE / WAPE</b><p>Default for business reporting: in units (or % of volume), linear cost, easy to explain, robust-ish.</p><small>Targets the median</small></div>
    <div><b>RMSE</b><p>When big misses are disproportionately costly, and to match a model trained on squared error.</p><small>Sensitive to outliers</small></div>
    <div><b>R²</b><p>To say how much of the variation the model captures, on one fixed test set; always with RMSE beside it.</p><small>Not comparable across test sets</small></div>
    <div><b>MAPE</b><p>Only when actuals are never near zero and stakeholders insist on percentages.</p><small>Biased low</small></div>
    <div><b>MASE</b><p>Comparing forecast accuracy across many time series of different sizes; &lt; 1 beats naive.</p><small>Time series only</small></div>
    <div><b>RMSLE / pinball</b><p>RMSLE for ratio errors on wide-range targets; pinball for quantile forecasts and asymmetric costs.</p><small>Pick q from the cost ratio</small></div>
  </div>
  <h3>The traps to remember</h3>
  <ul>
    <li>RMSE is not the average error; R² is not accuracy; MAPE explodes near zero.</li>
    <li>Every metric needs a baseline beside it; for weekly data that is the seasonal naive (kitchen: 8.78 vs model 5.68).</li>
    <li>sklearn scorers are negated (<code>neg_mean_absolute_error</code>) and <code>mean_absolute_percentage_error</code> returns a fraction.</li>
    <li>Look at residuals by segment: an overall bias of +0.77 hid Saturday +3.7 and Sunday −3.2.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <details class="qa"><summary><span class="qmark">Q</span>Errors 2, 1, 3, 5, 1, 10 (absolute). MAE, RMSE, MedAE?</summary><div class="qa-body">MAE 22/6 = 3.67; RMSE √(140/6) = 4.83; MedAE (2 + 3)/2 = 2.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SS_res 140, SS_tot 1000, n = 6, p = 1. R² and adjusted R²?</summary><div class="qa-body">R² = 0.86; adjusted = 1 − 0.14 × 5/4 = 0.825.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which constant minimises MSE, and which minimises MAE?</summary><div class="qa-body">The mean minimises MSE; the median minimises MAE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Real 1 order, forecast 4. Absolute error and APE?</summary><div class="qa-body">3 orders, 300%: one quiet day can dominate MAPE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MASE = 1.2. Good or bad?</summary><div class="qa-body">Bad: the model's MAE is 20% worse than the naive forecast's in-sample MAE.</div></details>

  <h2 id="rm-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Can you now answer, with numbers, the questions an interviewer asks about regression metrics?</p></div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Real 20, 25, 30, 35, 40, 60; forecast 22, 24, 33, 30, 41, 50. Compute ME, MAE, RMSE and R².</summary><div class="qa-body">e = −2, 1, −3, 5, −1, 10. ME = 10/6 = 1.67. MAE = 22/6 = 3.67. MSE = 140/6 = 23.3, RMSE = 4.83. Mean of y = 35, SS_tot = 225 + 100 + 25 + 0 + 25 + 625 = 1000, R² = 1 − 140/1000 = 0.86.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MAE vs RMSE: when do you use each, and what does a large gap between them tell you?</summary><div class="qa-body">MAE when each unit of error costs the same and outliers should not dominate (it targets the median). RMSE when big misses cost disproportionately more, or to match an MSE-trained model (it targets the mean). RMSE ≥ MAE always; a large ratio means a few big errors dominate (1.32 → 1.91 after one 40-order miss).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prove that the mean minimises MSE and say what minimises MAE.</summary><div class="qa-body">d/dc (1/n)Σ(yᵢ − c)² = −(2/n)Σ(yᵢ − c) = 0 ⇒ c = ȳ; the second derivative 2 &gt; 0 confirms a minimum. For MAE, moving c right lowers the loss by 1/n for every point to the right and raises it for every point to the left, so the minimum is where half the points are on each side: the median.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive R² and explain why it can be negative.</summary><div class="qa-body">R² = 1 − SS_res/SS_tot compares the model's squared error with that of always predicting the mean. If the model's squared error exceeds the mean forecast's, the ratio is above 1 and R² is negative (a reversed forecast gave −1.86). In-sample least squares with an intercept cannot do worse than the mean (it could pick the flat line), but out of sample or for other models it can.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why adjusted R², and how does it change when you add a useless feature?</summary><div class="qa-body">Plain in-sample R² never decreases when a feature is added. Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p − 1) charges for each feature, so a useless feature (tiny R² gain) lowers it; a feature raises it only if its |t| &gt; 1. Same R² 0.86 gives 0.825 with p = 1 and 0.650 with p = 3 on 6 rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MAPE dangerous for demand or energy forecasting? What do you use instead?</summary><div class="qa-body">It divides by the actual value: near-zero actuals give huge percentages (one quiet day: 9.6% → 51%), zero gives infinity, and it penalises over-forecasts without limit while under-forecasts cap at 100%, so it favours low forecasts (with days of 10 and 100, the MAPE-best constant is 10). Use WAPE (Σ|e|/Σy), MASE, or MAPE above a floor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is MASE and how do you read 0.5 and 1.2?</summary><div class="qa-body">MAE of the model divided by the in-sample MAE of the naive (or seasonal naive) forecast on the training series. 0.5: half the naive forecast's typical error (our week: 3.67/7.4). 1.2: 20% worse than naive, so the model is not worth it. Scale-free, works with zeros, for time series.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose RMSLE, and what does training for it look like?</summary><div class="qa-body">When the target spans orders of magnitude and relative errors matter, or under-forecasting is worse than over-forecasting (halving costs more than +50%). Optimise it by fitting on log1p(y) and back-transforming with expm1; remember the back-transformed prediction is roughly a median, biased low for totals. Clip negative predictions first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>R² vs explained variance score: when do they differ?</summary><div class="qa-body">Explained variance uses Var(residuals), which ignores a constant bias; R² uses the raw squared residuals. Shifting every forecast by +10 dropped R² to 0.46 while explained variance stayed 0.877. They agree only if the mean residual is 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model's MAE is 5.68. Is that good?</summary><div class="qa-body">Only relative to baselines on the same test rows: mean of train 10.33, naive 14.30, seasonal naive 8.78. The model removes 35% of the seasonal naive's error (skill score 0.35), R² 0.71, MASE 0.47. Report it that way, with the spread across time-series CV folds (5.3 to 6.6).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do you look for in residual plots, and what did the kitchen's show?</summary><div class="qa-body">Bias overall and per segment, spread vs fitted value (funnel = heteroscedasticity), patterns over time (autocorrelation), heavy tails. The kitchen's linear model under-forecast Saturdays (+3.7) and festivals (+6.8), over-forecast Sundays (−3.2), and errors widened on busy days: signs of multiplicative effects, pointing to a log target or interactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does sklearn call it neg_mean_absolute_error?</summary><div class="qa-body">Model-selection tools (cross_val_score, GridSearchCV) always maximise the score. Error metrics are negated so that larger is better; flip the sign when reporting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does R² relate to null accuracy and AP baselines in classification?</summary><div class="qa-body">All three compare the model with a know-nothing baseline: R² with "always the mean" (R² = 0), accuracy with "always the majority class" (null accuracy), AP with the positive rate (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>). A metric without its baseline cannot be judged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How is the Brier score a regression metric, and why does that matter for the next note?</summary><div class="qa-body">Brier = mean (p − y)² with y ∈ {0, 1}: the MSE of probabilities. Like MSE it is minimised by the true conditional mean, here P(y = 1 | x), which is why it rewards calibrated probabilities. <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a> splits it into a calibration part and a sharpness part.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Which training loss would you choose for the kitchen if running out is 9 times worse than leftovers?</summary><div class="qa-body">Pinball (quantile) loss at q = 9/(9 + 1) = 0.9: the model then forecasts the 90th percentile of demand, so it runs out on about 1 day in 10. Evaluate with the same pinball loss (2.50 on the week). In gradient boosting: <code>loss="quantile", quantile=0.9</code> (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</div></details>
</main>
`
});
