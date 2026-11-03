// notes/ml/ml_reg_metrics.js — Regression Metrics
Object.assign(TOPIC_CONTENT, {
  "ml_reg_metrics": `<main>
  <h1>Regression Metrics</h1>
  <div class="where"><span>Machine Learning</span><span>Model Evaluation</span><span>Regression Metrics</span></div>
  <p class="lead">A regression model predicts a number: tomorrow's orders, a house price, a delivery time. Unlike a classifier, it is almost never exactly right, so the question is not "right or wrong?" but "wrong by how much, and does that matter?". A regression metric is a rule for adding up many errors of different sizes and signs into one number, and each rule quietly encodes a view about which errors hurt most, so choosing the wrong one picks the wrong model. The running example is a small tiffin kitchen that cooks each morning from a model's forecast of the day's orders. Every metric is first worked out by hand on one six-day week of that kitchen, and then the same kitchen is studied at realistic scale to show residual analysis and baselines.</p>

  <h2 id="rm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Regression Metrics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Size of error</div>
        <ul>
          <li>Residual e = y − ŷ; mean of e = <b>bias</b></li>
          <li><b>MAE</b> = mean |e| (best constant: median)</li>
          <li><b>RMSE</b> = √mean e² (best constant: mean); punishes big misses</li>
          <li><b>MedAE</b> ignores freak days; <b>max error</b> = worst day</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Against a baseline</div>
        <ul>
          <li><b>R²</b> = 1 − SS_res/SS_tot: vs always predicting the mean</li>
          <li>Can be negative; adjusted R² charges for features</li>
          <li><b>MASE</b> = MAE / naive forecast's MAE; &lt; 1 beats naive</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Relative errors</div>
        <ul>
          <li><b>MAPE</b>: explodes near 0, favours low forecasts</li>
          <li><b>WAPE</b> = Σ|e| / Σy: safe percentage</li>
          <li><b>RMSLE</b>: ratio errors; <b>pinball</b>: asymmetric costs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using metrics well</div>
        <ul>
          <li>Match the metric to the cost of an error</li>
          <li>Always beside a baseline (seasonal naive for weekly data)</li>
          <li>Residuals by group reveal what averages hide</li>
          <li>sklearn scorers are <code>neg_…</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rm-resid"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Residuals and Bias</span><span class="rm-sub">how wrong each day, and which way</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mae"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Mean Absolute Error</span><span class="rm-sub">the typical miss, and the median</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mse"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">MSE, RMSE and Robust Alternatives</span><span class="rm-sub">punishing big misses, and freak days</span></div></div>
      <div class="rm-item rm-done" data-target="rm-r2"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">R² and Adjusted R²</span><span class="rm-sub">compared with always guessing the mean</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mape"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Percentage Errors: MAPE, sMAPE, WAPE</span><span class="rm-sub">errors relative to the day's size</span></div></div>
      <div class="rm-item rm-done" data-target="rm-mase"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">MASE</span><span class="rm-sub">compared with "tomorrow = today"</span></div></div>
      <div class="rm-item rm-done" data-target="rm-rmsle"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">RMSLE and Pinball Loss</span><span class="rm-sub">ratio errors and lopsided costs</span></div></div>
      <div class="rm-item rm-done" data-target="rm-choose"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Which Metric When</span><span class="rm-sub">training loss vs reporting metric</span></div></div>
      <div class="rm-item rm-done" data-target="rm-resan"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Residual Analysis</span><span class="rm-sub">what the errors are telling you</span></div></div>
      <div class="rm-item rm-done" data-target="rm-base"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Baselines and scikit-learn</span><span class="rm-sub">skill scores, neg_ scorers, CV</span></div></div>
      <div class="rm-item rm-done" data-target="rm-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">RMSE averaging, R² as accuracy, MAPE at zero</span></div></div>
      <div class="rm-item rm-done" data-target="rm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, values, when to use which</span></div></div>
      <div class="rm-item rm-done" data-target="rm-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="rm-resid"><span class="num">01</span>Residuals and Bias</h2>
  <p>A classifier is right or wrong on a row, so its mistakes can be counted. A forecast of 33 tiffins when 30 were ordered is neither: it is off by some amount. Before we can summarise a model, we need a clear number for "how wrong, and in which direction" on each single day.</p>
  <p>Here is the kitchen's week. Each morning it cooks from the model's forecast; cooking too few leaves customers hungry, cooking too many wastes food. The table shows what the model forecast and what was really ordered from Monday to Saturday (the kitchen was closed on Sunday that week):</p>
  <table class="tbl">
    <tr><th>Day</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sum</th></tr>
    <tr><td>real orders y</td><td>20</td><td>25</td><td>30</td><td>35</td><td>40</td><td>60</td><td>210</td></tr>
    <tr><td>forecast ŷ</td><td>22</td><td>24</td><td>33</td><td>30</td><td>41</td><td>50</td><td>200</td></tr>
  </table>
  <p>We keep these numbers in a small module that later blocks import. It also holds the six days before this week, which section 06 needs:</p>
  <div class="fx" data-lang="py"># week.py - one week of a tiffin kitchen: real orders vs the model's forecast
import numpy as np
days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
y    = np.array([20, 25, 30, 35, 40, 60], dtype=float)    # real orders
yhat = np.array([22, 24, 33, 30, 41, 50], dtype=float)    # model's forecast
history = np.array([14, 22, 17, 28, 24, 33], dtype=float) # the 6 days BEFORE this week (for MASE)

if __name__ == "__main__":
    print("real total", y.sum(), " forecast total", yhat.sum())</div>
  <div class="fx" data-lang="text">real total 210.0  forecast total 200.0</div>
  <p>For each day the <strong>residual</strong>, or error, is the actual value minus the predicted value: e = y − ŷ. A positive residual means the forecast was too low (the kitchen cooked too little); a negative one means it was too high. In the figure, blue is what happened, green is the forecast, and each red stick is a residual. Saturday's miss of +10 is clearly the largest.</p>
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
  <p>The code builds the three columns, e, |e| and e², that every metric in the next sections is made from, and prints the first few metrics so we can check them by hand as we go:</p>
  <div class="fx" data-lang="py">import numpy as np
from week import days, y, yhat
from sklearn.metrics import mean_absolute_error, mean_squared_error, root_mean_squared_error

e = y - yhat                                   # residual = actual - predicted
print(" day   y   ŷ   e   |e|   e²")
for d, a, b, r in zip(days, y, yhat, e):
    print(f" {d}  {a:3.0f} {b:3.0f} {r:3.0f}  {abs(r):3.0f}  {r*r:4.0f}")
print(f" sum          {e.sum():3.0f}  {np.abs(e).sum():3.0f}  {(e**2).sum():4.0f}")
print(f"ME (bias) = {e.mean():.3f}")
print(f"MAE  = {mean_absolute_error(y, yhat):.3f}")
print(f"MSE  = {mean_squared_error(y, yhat):.3f}")
print(f"RMSE = {root_mean_squared_error(y, yhat):.3f}")</div>
  <div class="fx" data-lang="text"> day   y   ŷ   e   |e|   e²
 Mon   20  22  -2    2     4
 Tue   25  24   1    1     1
 Wed   30  33  -3    3     9
 Thu   35  30   5    5    25
 Fri   40  41  -1    1     1
 Sat   60  50  10   10   100
 sum           10   22   140
ME (bias) = 1.667
MAE  = 3.667
MSE  = 23.333
RMSE = 4.830</div>
  <p>The residuals are −2, +1, −3, +5, −1, +10, and they add up to 10. Their plain average is the <strong>mean error</strong>, also called the <strong>bias</strong>: ME = 10 / 6 = +1.67. It answers the question "does the model lean one way?": on average this model forecasts 1.67 tiffins too few. A bias far from zero is worth knowing about, because it is cheap to fix (shift every forecast) and usually points to something systematic, such as a growth trend or a holiday effect the model has missed.</p>
  <p>But bias is useless as a measure of accuracy, because positive and negative errors cancel. A model that is off by +20 one day and −20 the next has zero bias while being wildly wrong. Think of a darts player: bias is where the centre of the cluster of darts sits relative to the bullseye, while accuracy is how far the darts land from the bullseye on average. A player can be perfectly centred and still spray darts all over the board. To measure the size of the errors we have to remove the sign before averaging, and there are two natural ways to do it: take the absolute value, or square. Each leads to a family of metrics. One more warning about bias: a least-squares model with an intercept has a mean residual of exactly 0 on its own training data, so measure bias on held-out data and per segment, where Saturdays may always be under-forecast and Mondays always over-forecast even when the overall bias is zero.</p>

  <h2 id="rm-mae"><span class="num">02</span>Mean Absolute Error</h2>
  <p>The simplest way to remove the sign is to take the absolute value of each residual and average. That is the <strong>mean absolute error</strong> (MAE). The absolute errors are 2, 1, 3, 5, 1, 10, which sum to 22, so MAE = 22 / 6 = 3.67 orders, matching the output above. In words: "on a typical day the forecast is off by about 3.7 tiffins". That sentence is why managers like MAE. It is in the same units as the target and needs no explanation.</p>
  <p>MAE charges every unit of error the same. A 10-order miss counts exactly twice as much as a 5-order miss, and five 2-order misses count the same as one 10-order miss. That is the right view when the cost of an error grows in a straight line with its size, for example when every wasted tiffin costs ₹40 whatever else happened that day.</p>
  <p>MAE has a less obvious property that explains a lot of its behaviour. Suppose a model could only output one number c for every day; which c gives the smallest MAE? Picture the six real values on a line: 20, 25, 30, 35, 40, 60. If you move c one order to the right, every value to the right of c gets 1 closer and every value to the left gets 1 farther away. While more values sit on the right, the total keeps dropping, so you keep moving. You stop when the values are balanced, half on each side. That point is the <strong>median</strong>. Six friends living along one road who want a meeting point with the least total walking should meet at the middle friend's house, not at the average position, because the friend who lives far out of town pulls the average but not the median.</p>
  <div class="fx" data-lang="py"># if a model could only predict ONE number c for every day, which c is best?
import numpy as np
from week import y
print("mean of y =", y.mean(), "  median of y =", np.median(y))
for c in [25, 30, 32.5, 35, 40]:
    print(f"c={c:&lt;5}: MAE={np.mean(np.abs(y - c)):6.3f}   MSE={np.mean((y - c) ** 2):7.3f}")</div>
  <div class="fx" data-lang="text">mean of y = 35.0   median of y = 32.5
c=25   : MAE=11.667   MSE=266.667
c=30   : MAE=10.000   MSE=191.667
c=32.5 : MAE=10.000   MSE=172.917
c=35   : MAE=10.000   MSE=166.667
c=40   : MAE=11.667   MSE=191.667</div>
  <p>With an even number of values, any c between the two middle ones (30 and 35) gives the same MAE, and the output shows exactly that: MAE is 10.000 at 30, 32.5 and 35, and higher outside that range. (The MSE column is for the next section.) This is why a model trained to minimise absolute error ends up predicting something like the conditional median, and why MAE is fairly robust to outliers: the median does not care how far out the extreme values are. MAE does have one big limitation: it is in the units of the target, so an MAE of 3.67 is superb for a kitchen selling 2,000 tiffins a day and poor for one selling 5. Never compare MAE across series of different sizes; sections 05 and 06 give scale-free alternatives.</p>

  <h2 id="rm-mse"><span class="num">03</span>MSE, RMSE and Robust Alternatives</h2>
  <p>MAE treats Saturday's 10-order miss as only twice as bad as Thursday's 5. For a kitchen, running out by 10 tiffins on the busiest day may be far worse than twice as bad: regulars go elsewhere and the reviews turn sour. If big misses are disproportionately costly, we want a metric that punishes them disproportionately. The second way to remove the sign does exactly that: square each residual.</p>
  <p>The squared errors are 4, 1, 9, 25, 1 and 100, which sum to 140. The <strong>mean squared error</strong> (MSE) is 140 / 6 = 23.33. Its units are "squared tiffins", which nobody can picture, so we usually take the square root to get back to orders: the <strong>root mean squared error</strong> (RMSE) is √23.33 = 4.83 orders. Think of a traffic fine that grows with the square of your excess speed: 10 km/h over costs ₹100, 20 over costs ₹400 and 40 over costs ₹1,600. Many small slips are cheap; one wild drive is ruinous. Look at who dominates the total: Saturday alone contributes 100 of the 140 squared units, 71% of the total, while it was only 45% of the absolute errors. Squaring turns "Saturday is the worst day" into "Saturday is most of the score".</p>
  <p>MSE also has a best constant, and it is the <strong>mean</strong>. For a constant forecast c, MSE(c) = (1/n) Σ (yᵢ − c)². Setting its derivative to zero gives −(2/n) Σ (yᵢ − c) = 0, so c = mean(y) = 35. The earlier output confirms it: MSE is smallest, 166.67, at c = 35. That minimum is also the variance of y, which is worth remembering: the MSE of the best constant forecast is the variance of the target. So a model trained on squared error predicts the conditional mean, and a model trained on absolute error predicts the conditional median.</p>
  <p>Because squaring makes RMSE sensitive to the biggest misses, RMSE is always at least as large as MAE, with equality only when every error has the same size. The ratio RMSE/MAE is therefore a handy warning light: here it is 4.83 / 3.67 = 1.32, and the larger it gets, the more of the total comes from a few large misses. To see how strongly one day can matter, suppose Saturday had been a festival with 60 orders, but the model said 20, a 40-order miss. Two more summaries help here. The <strong>median absolute error</strong> (MedAE) is the middle value of the absolute errors, which describes a typical day while ignoring freak days; sorting 1, 1, 2, 3, 5, 10, it is (2 + 3)/2 = 2.5. The <strong>max error</strong> is simply the largest absolute error, the worst case you must plan for; here it is 10.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from sklearn.metrics import (mean_absolute_error, root_mean_squared_error,
                             median_absolute_error, max_error)

festival = yhat.copy(); festival[5] = 20        # Saturday: 60 real orders, model said 20
for name, f in [("normal week", yhat), ("festival miss", festival)]:
    mae, rmse = mean_absolute_error(y, f), root_mean_squared_error(y, f)
    print(f"{name:14s} MAE={mae:5.2f}  RMSE={rmse:5.2f}  MedAE={median_absolute_error(y, f):4.2f}  "
          f"max={max_error(y, f):3.0f}  RMSE/MAE={rmse / mae:.2f}")</div>
  <div class="fx" data-lang="text">normal week    MAE= 3.67  RMSE= 4.83  MedAE=2.50  max= 10  RMSE/MAE=1.32
festival miss  MAE= 8.67  RMSE=16.53  MedAE=2.50  max= 40  RMSE/MAE=1.91</div>
  <p>One bad day multiplied MAE by 2.4 (3.67 to 8.67) and RMSE by 3.4 (4.83 to 16.53), and the RMSE/MAE ratio jumped from 1.32 to 1.91. MedAE did not move at all, because the median ignores how extreme the extreme value is, while max error reacts only to that one day. Think of judging a delivery service: MedAE says "a typical order is 2.5 minutes late", max error says "the worst order was 40 minutes late", and you need the first to describe the service and the second to decide whether you can promise a time.</p>
  <p>Which of these is "right" depends on whether the festival day is noise or business. If it was a data-entry error, RMSE is being ruined by garbage and a robust metric is wiser. If festivals really happen and really cost money, a metric that ignores them will happily choose a model that fails every festival. MSE remains the usual <em>training</em> loss for practical reasons: it is smooth (its derivative 2e exists everywhere, unlike |e| at zero), so gradient descent and the normal equation work, and if errors are Gaussian, minimising it is the same as maximising likelihood (<a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>). RMSE is its human-readable report. But RMSE is not "the average error": the average miss is MAE.</p>

  <h2 id="rm-r2"><span class="num">04</span>R² and Adjusted R²</h2>
  <p>MAE of 3.67 and RMSE of 4.83 are in orders. Are they good? That depends on how much the orders move around. If every day had exactly 35 orders, an RMSE of 4.83 would be awful; if days ranged from 0 to 500, it would be superb. We need a score that compares the model's errors with how hard the series is to predict in the first place.</p>
  <p>The fair "know-nothing" benchmark is the forecast "every day equals the average day", 35 orders, since we just saw that this constant has the smallest squared error of any constant. Its squared misses are the squared deviations of y from its mean, and their sum is called the <strong>total sum of squares</strong>, SS_tot. The model's squared misses add up to the <strong>residual sum of squares</strong>, SS_res:</p>
  <table class="tbl">
    <tr><th>Day</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sum</th></tr>
    <tr><td>(y − 35)²</td><td>225</td><td>100</td><td>25</td><td>0</td><td>25</td><td>625</td><td>SS_tot = 1000</td></tr>
    <tr><td>model's e²</td><td>4</td><td>1</td><td>9</td><td>25</td><td>1</td><td>100</td><td>SS_res = 140</td></tr>
  </table>
  <p><strong>R²</strong>, the coefficient of determination, is the share of the baseline's squared error that the model removed: R² = 1 − SS_res / SS_tot = 1 − 140 / 1000 = 0.86. Read it as "the model removes 86% of the squared error of always forecasting the mean", or in the textbook phrase, "explains 86% of the variance of y". Dividing top and bottom by n shows that R² = 1 − MSE / Var(y): it is just MSE rescaled by the target's variance, which makes it unit-free. Think of a student's exam compared with simply writing the class average for every answer: R² says how much of the gap between "average" and "perfect" the student closed. The figure shows the two sets of misses side by side, red sticks for the mean forecast and green sticks for the model.</p>
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
r2 = 1 - ss_res / ss_tot
print(f"SS_res = {ss_res:.0f}   SS_tot = {ss_tot:.0f}   R² = {r2:.3f}   sklearn {r2_score(y, yhat):.3f}")
n = len(y)
for p in [1, 3]:
    print(f"adjusted R² with p={p} features = {1 - (1 - r2) * (n - 1) / (n - p - 1):.3f}")

for name, f in [("predict the mean 35", np.full(6, 35.0)),
                ("forecast + 10 (biased)", yhat + 10),
                ("reversed forecast", yhat[::-1])]:
    print(f"{name:24s} R²={r2_score(y, f):7.3f}   explained variance={explained_variance_score(y, f):7.3f}")</div>
  <div class="fx" data-lang="text">SS_res = 140   SS_tot = 1000   R² = 0.860   sklearn 0.860
adjusted R² with p=1 features = 0.825
adjusted R² with p=3 features = 0.650
predict the mean 35      R²=  0.000   explained variance=  0.000
forecast + 10 (biased)   R²=  0.460   explained variance=  0.877
reversed forecast        R²= -1.860   explained variance= -1.843</div>
  <p>The first line confirms the hand calculation. The three other forecasts show what R² can and cannot do. Predicting the mean scores exactly 0, by construction: R² = 0 means "no better than the mean". The reversed forecast (Saturday's 50 given to Monday, and so on) scores −1.86, because its squared error is 2.86 times the baseline's. <strong>R² can be negative</strong> and has no lower limit. The common statement "R² is between 0 and 1" is true only for a least-squares linear model with an intercept, evaluated on its own training data, because the flat line at the mean is one of the lines it could have chosen; on new data, or for any other model, R² can go below zero. The biased forecast (every value + 10) shows a related trap. Its R² is 0.46, but <code>explained_variance_score</code> says 0.877, because explained variance subtracts the mean residual first and so forgives a constant bias. Shifting every forecast by 10 makes every day worse, and R² notices while explained variance does not, so prefer R² for evaluation.</p>
  <p>R² has another weakness. On training data, adding any column to a linear model, even pure noise, can only lower SS_res, so R² never decreases as the model grows. With 6 days of data, an R² of 0.86 from 1 feature is impressive, but from 4 features the model has almost as many knobs as data points. <strong>Adjusted R²</strong> corrects for this by charging for each feature: Adjusted R² = 1 − (1 − R²) · (n − 1)/(n − p − 1), where n is the number of rows and p the number of features. It comes from replacing the two sums of squares by unbiased variance estimates, each divided by its degrees of freedom. A tailor who charges for every measurement is a fair picture: a suit that fits well after 3 measurements beats one that fits slightly better after 30. By hand, with p = 1: 1 − 0.14 × 5/4 = 0.825; with p = 3: 1 − 0.14 × 5/2 = 0.650, as printed. A new feature raises adjusted R² only if it reduces the unexplained part by more than its cost. Adjusted R² is an in-sample correction for linear models with a clear number of features; for trees or boosting, judge on held-out data instead (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>).</p>
  <p>Two last cautions. A high R² does not mean good forecasts: on a strongly trending series even a poor model gets R² 0.95, because the mean is a terrible baseline for a trend. And R² depends on how varied the test set is, so compare R² values only on the same test set, and always report RMSE or MAE beside it.</p>

  <h2 id="rm-mape"><span class="num">05</span>Percentage Errors: MAPE, sMAPE and WAPE</h2>
  <p>The kitchen's owner runs two kitchens: ours, with about 35 orders a day, and a big one with about 2,000. An MAE of 3.67 here and 40 there: which forecast is better? Errors in orders cannot be compared across sizes. We need the error relative to the size of the day.</p>
  <p>The best-known answer is the <strong>mean absolute percentage error</strong> (MAPE): divide each absolute error by the real value, then average. The six percentage errors are 10%, 4%, 10%, 14.3%, 2.5% and 16.7%, and their mean is 9.58%: "the forecast is typically off by about 10% of the day's orders". That is easy to explain and comparable across kitchens. Note that scikit-learn returns 0.0958, a fraction, not 9.58. But MAPE has three serious traps, and the code shows all three:</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from sklearn.metrics import mean_absolute_percentage_error as mape

print("percentage errors:", np.round(np.abs(y - yhat) / y * 100, 1))
print(f"MAPE = {mape(y, yhat):.4f}   (sklearn returns a fraction)")

y7, f7 = np.r_[y, 1.0], np.r_[yhat, 4.0]           # add a quiet Sunday: 1 real order, forecast 4
print(f"with quiet Sunday: MAE {np.abs(y - yhat).mean():.2f} -&gt; {np.abs(y7 - f7).mean():.2f}   "
      f"MAPE {mape(y, yhat):.1%} -&gt; {mape(y7, f7):.1%}")

two = np.array([10.0, 100.0])                       # two days, one constant forecast c for both
for c in [10, 55, 100]:
    print(f"days 10 and 100, forecast c={c:3d}: MAPE={np.mean(np.abs(two - c) / two):.0%}")</div>
  <div class="fx" data-lang="text">percentage errors: [10.   4.  10.  14.3  2.5 16.7]
MAPE = 0.0958   (sklearn returns a fraction)
with quiet Sunday: MAE 3.67 -&gt; 3.57   MAPE 9.6% -&gt; 51.1%
days 10 and 100, forecast c= 10: MAPE=45%
days 10 and 100, forecast c= 55: MAPE=248%
days 10 and 100, forecast c=100: MAPE=450%</div>
  <p>The first trap is small and zero actual values. Add one quiet Sunday with 1 real order and a forecast of 4. The miss is only 3 tiffins and MAE barely changes (3.67 to 3.57), but that day's percentage error is 3/1 = 300%, and MAPE jumps from 9.6% to 51%. One tiny day now dominates the metric, and a real value of 0 makes it infinite. Electricity load at night, slow-selling items and intermittent demand all fall into this trap.</p>
  <p>The second trap is asymmetry. For a real value of 100, forecasting 0 is a 100% error, the worst an under-forecast can ever do, but forecasting 200 is also 100% and forecasting 300 is 200%: over-forecasts have no upper limit. The figure shows this: the blue MAPE line is capped at 100% on the left of the true value and keeps rising on the right.</p>
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
  <p>The third trap follows from the first two: <strong>MAPE rewards forecasting low</strong>. With two days of 10 and 100 orders and one constant forecast for both, forecasting 10 gives MAPE (0 + 90%)/2 = 45%, the lowest possible, while 55, the mean, gives 248%. A model tuned on MAPE learns to forecast low, which for a kitchen means running out of food. Think of a shopkeeper judging staff by "percentage stock-count error": counting 2 pens when there was 1 is a 100% error, while counting 1,010 boxes when there were 1,000 is 1%, so the pen counter looks a hundred times worse while being off by a single item.</p>
  <p>Two alternatives fix parts of this. The <strong>symmetric MAPE</strong> (sMAPE) divides each error by the average of the actual and the forecast, 2|e| / (|y| + |ŷ|), which caps each term at 200%; despite its name it is still not symmetric (it now charges under-forecasts more, the green line in the figure), and it has several competing definitions, so always state the formula. The <strong>weighted absolute percentage error</strong> (WAPE) divides the <em>total</em> absolute error by the <em>total</em> actual volume: Σ|e| / Σ|y| = 22 / 210. It is MAPE in which each day is weighted by its size, or equivalently MAE divided by the mean of y, so it has no asymmetry and copes with individual zero days.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat

smape = np.mean(2 * np.abs(y - yhat) / (np.abs(y) + np.abs(yhat)))
wape = np.abs(y - yhat).sum() / np.abs(y).sum()
print(f"sMAPE = {smape:.2%}   WAPE = 22/210 = {wape:.2%}")
print("quiet Sunday (real 1, forecast 4): APE 300%, sMAPE term", f"{2 * 3 / 5:.0%},",
      "WAPE with Sunday", f"{(22 + 3) / (210 + 1):.2%}")</div>
  <div class="fx" data-lang="text">sMAPE = 9.86%   WAPE = 22/210 = 10.48%
quiet Sunday (real 1, forecast 4): APE 300%, sMAPE term 120%, WAPE with Sunday 11.85%</div>
  <p>On the normal week the three percentages are close (MAPE 9.58%, sMAPE 9.86%, WAPE 10.48%). On the quiet Sunday the sMAPE term is 120% instead of 300%, better but still large, while WAPE barely moves, from 10.48% to 11.85%, because a 3-tiffin miss is 3 tiffins out of 211 whatever day it happened on. WAPE is the safe default for demand, retail and energy reporting; MAPE should be used only when actual values are never near zero.</p>

  <h2 id="rm-mase"><span class="num">06</span>MASE</h2>
  <p>A WAPE of 10.48% says how big the errors are, but not whether forecasting this series is hard. If orders barely change from day to day, "tomorrow will be like today" might already be within 3%, and 10% would be lazy; if they jump around, 10% may be excellent. For time series we want a score anchored to the simplest sensible forecast.</p>
  <p>That forecast is the <strong>naive forecast</strong>: tomorrow equals today. The <strong>mean absolute scaled error</strong> (MASE) divides the model's MAE by the MAE that the naive forecast achieved on the training period. MASE below 1 means the model beats the naive forecast; above 1 means it is worse. It is like judging a weather forecaster against "tomorrow's weather = today's weather": in a place where the weather barely changes that is hard to beat, and MASE grades on that curve. For the kitchen, the six days before our week had 14, 22, 17, 28, 24 and 33 orders. The naive one-step errors are the day-to-day changes, 8, 5, 11, 4 and 9, whose mean is 37/5 = 7.4. So MASE = 3.67 / 7.4 = 0.50:</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat, history

naive_steps = np.abs(np.diff(history))           # how wrong "tomorrow = today" was on the training days
scale = naive_steps.mean()
mae = np.abs(y - yhat).mean()
print("history:", history, " day-to-day changes:", naive_steps, " scale =", scale)
print(f"MASE = {mae:.3f} / {scale:.2f} = {mae / scale:.3f}")</div>
  <div class="fx" data-lang="text">history: [14. 22. 17. 28. 24. 33.]  day-to-day changes: [ 8.  5. 11.  4.  9.]  scale = 7.4
MASE = 3.667 / 7.40 = 0.495</div>
  <p>A MASE of 0.50 means the model's typical miss is half the typical miss of "tomorrow = today". The scale is taken from the training period rather than the test period so that it does not depend on the test errors and exists even for a one-day forecast. Because both numerator and denominator are MAEs in the same units, MASE is unit-free, works when some actual values are zero, and does not favour low forecasts; Rob Hyndman proposed it in 2006 as a general-purpose forecast accuracy measure. For data with a weekly pattern, the fair yardstick is the <strong>seasonal naive</strong> forecast, "the same day last week", whose scale is the mean of |y_t − y_{t−7}|; section 10 shows how much that choice matters. MASE only makes sense for ordered data: for houses or customers there is no "yesterday", so use R² or a skill score against the mean or median instead. MASE is not in scikit-learn; it is in forecasting libraries and is a few lines of numpy (see <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>

  <h2 id="rm-rmsle"><span class="num">07</span>RMSLE and Pinball Loss</h2>
  <p>MAE, RMSE and MASE all measure absolute differences, so a miss of 10 on a 20-order day counts the same as a miss of 10 on a 1,000-order day. For targets that span orders of magnitude, such as house prices or bakery orders from 5 to 5,000, it is the <em>ratio</em> that matters: forecasting 20 when the truth is 10 should count like forecasting 2,000 when the truth is 1,000, since both are "double".</p>
  <p>The trick is to take logarithms first, because ln(1 + y) − ln(1 + ŷ) = ln[(1 + y)/(1 + ŷ)] is a log-ratio, so equal ratios give equal errors. The "+1" keeps a real value of 0 allowed. Computing RMSE on that scale gives the <strong>root mean squared log error</strong>: RMSLE = √[(1/n) Σ (ln(1 + yᵢ) − ln(1 + ŷᵢ))²]. Think of a stock trader who thinks in percentages: a ₹10 drop on a ₹20 share is a disaster, the same ₹10 on a ₹2,000 share is noise. RMSLE thinks like the trader, RMSE like an accountant counting rupees.</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from sklearn.metrics import root_mean_squared_log_error, mean_pinball_loss

print(f"RMSLE = {root_mean_squared_log_error(y, yhat):.4f}")
for a, b in [(20, 10), (20, 30), (1000, 990)]:       # each forecast misses by 10
    v = np.log1p(a) - np.log1p(b)
    print(f"real {a:4d}, forecast {b:4d}: squared error {(a - b)**2}   squared log error {v * v:.4f}")

print(f"pinball loss q=0.9: {mean_pinball_loss(y, yhat, alpha=0.9):.3f}   q=0.5: {mean_pinball_loss(y, yhat, alpha=0.5):.3f}")</div>
  <div class="fx" data-lang="text">RMSLE = 0.1106
real   20, forecast   10: squared error 100   squared log error 0.4181
real   20, forecast   30: squared error 100   squared log error 0.1517
real 1000, forecast  990: squared error 100   squared log error 0.0001
pinball loss q=0.9: 2.500   q=0.5: 1.833</div>
  <p>The week's RMSLE is 0.111, which roughly means the forecast is typically off by about 11% in ratio terms (e^0.111 ≈ 1.12). The three comparison lines each miss by 10 orders and so all have squared error 100, but their squared log errors differ enormously. A 10-order miss at 1,000 costs 0.0001, while at 20 it costs 0.15 to 0.42: RMSLE is size-free. And at 20, forecasting 10 (half) costs 0.418 while forecasting 30 (one and a half times) costs only 0.152: in log space halving is as far as doubling, so <strong>under-forecasts cost more</strong> than over-forecasts of the same size. That suits a kitchen, where running out is worse than leftovers. The natural way to optimise RMSLE is to train on log(1 + y) and transform predictions back with exp(·) − 1; section 09 shows one catch with that. Predictions must be non-negative, so clip a linear model's output at 0 first.</p>
  <p>When the costs are lopsided in a known ratio, there is a more direct tool. Suppose running out is 9 times worse than leftovers. The <strong>pinball loss</strong>, or quantile loss, at level q charges an under-forecast of size e by q·e and an over-forecast by (1 − q)·e. With q = 0.9, under-forecasting is charged 9 times as much as over-forecasting, and the forecast that minimises this loss is the 90th percentile of demand: cook enough to cover 9 days out of 10. On the week, the under-forecasts are 1 + 5 + 10 = 16 orders, charged 0.9 each (14.4), and the over-forecasts are 2 + 3 + 1 = 6, charged 0.1 each (0.6), so the loss is 15 / 6 = 2.50, as printed. At q = 0.5 both sides are charged equally and the loss is exactly half the MAE (1.833). The general rule is q = (cost of an under-forecast) / (sum of both costs). Pinball loss is the standard way to score quantile forecasts and prediction intervals (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>

  <h2 id="rm-choose"><span class="num">08</span>Which Metric When</h2>
  <p>On the same six days we now have ME +1.67, MAE 3.67, RMSE 4.83, MedAE 2.5, max error 10, R² 0.86, MAPE 9.58%, WAPE 10.48%, MASE 0.50, RMSLE 0.111 and pinball 2.50. They answer different questions, and on another pair of models they could rank them differently. As with classification (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>), the way to choose is to ask what an error of a given size costs the business, and pick the metric whose penalty has the same shape. Choosing a metric is like choosing a referee: one who fines every foul equally (MAE), one who fines dangerous fouls far more (RMSE), and one who ignores a single freak incident (MedAE) will pick different winners from the same match.</p>
  <table class="tbl">
    <tr><th>If the cost of a miss…</th><th>Use</th><th>Week</th><th>Targets</th></tr>
    <tr><td>grows in proportion to its size</td><td>MAE (WAPE to compare sizes)</td><td>3.67 (10.48%)</td><td>median</td></tr>
    <tr><td>grows faster than its size</td><td>RMSE / MSE</td><td>4.83</td><td>mean</td></tr>
    <tr><td>should ignore rare freak days</td><td>MedAE</td><td>2.5</td><td>median of errors</td></tr>
    <tr><td>has a hard limit</td><td>max error, or a high quantile of |e|</td><td>10</td><td>worst case</td></tr>
    <tr><td>is relative to the size of the day</td><td>WAPE; MAPE only if y is never small; RMSLE for ratios</td><td>10.48%, 9.58%, 0.111</td><td></td></tr>
    <tr><td>must be compared across many series</td><td>MASE, WAPE</td><td>0.50</td><td>vs naive</td></tr>
    <tr><td>is lopsided (running out worse)</td><td>pinball loss at q &gt; 0.5</td><td>2.50 at q = 0.9</td><td>q-th quantile</td></tr>
    <tr><td>you must explain "share of variation captured"</td><td>R², with RMSE beside it</td><td>0.86</td><td>vs mean</td></tr>
  </table>
  <p>The "Targets" column carries an important idea. A metric is <strong>consistent</strong> for a statistic if, on average, the forecast that minimises it is that statistic: MSE is minimised by the mean, MAE by the median, and pinball loss at q by the q-th quantile. So the loss a model is <em>trained</em> on and the metric you <em>report</em> should point at the same target. A model trained on squared error predicts the mean; if you then judge it on MAE, which prefers the median, it is slightly handicapped on skewed data, and if you judge it on MAPE, a lower forecast would score better. Most libraries let you choose the training loss to match: for example <code>HistGradientBoostingRegressor(loss="absolute_error" | "squared_error" | "quantile" | "poisson")</code> (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>). For counts and non-negative skewed targets, the Poisson or Tweedie deviance (<code>mean_poisson_deviance</code>) is the matching metric. Finally, reporting five metrics and choosing whichever model wins the most of them is not a method: fix one primary metric from the business cost before modelling, and keep the others as diagnostics.</p>

  <h2 id="rm-resan"><span class="num">09</span>Residual Analysis</h2>
  <p>Every metric is an average, so it hides <em>where</em> the model goes wrong. MAE 3.67 cannot tell you that Saturdays are always under-forecast or that errors grow on busy days, yet those patterns are exactly what tells you how to improve the model. A doctor does not stop at "average temperature is normal"; she looks at when the fever spikes, because the pattern points to the cause. <strong>Residual analysis</strong> is that habit for models: looking at the residuals on held-out data, overall, by group, against the size of the forecast and over time, to find structure the model missed.</p>
  <p>On the six days there is a hint: the two biggest residuals, Thursday and Saturday, are both positive and both on busy days. Six points are too few to trust, so here is the same kitchen at realistic scale: two years of synthetic daily orders with a weekday pattern, festivals and slow growth, where the last 120 days are the test period:</p>
  <div class="fx" data-lang="py"># kitchen.py - the same tiffin kitchen at realistic scale: 730 days of orders (synthetic)
import numpy as np, pandas as pd
rng = np.random.default_rng(0)
days = pd.date_range("2024-01-01", periods=730, freq="D")
dow = days.day_of_week.values                                 # 0 = Monday
festival = rng.random(730) &lt; 0.03                            # about 11 festival days a year
level = 30 + 0.01 * np.arange(730)                           # slow growth
orders = level * np.array([0.8, 0.9, 1.0, 1.0, 1.1, 1.5, 0.6])[dow] * np.where(festival, 1.8, 1.0)
orders = np.round(rng.poisson(orders)).astype(float)
df = pd.DataFrame({"orders": orders, "dow": dow, "festival": festival.astype(int), "t": np.arange(730)}, index=days)
df["lag1"], df["lag7"] = df.orders.shift(1), df.orders.shift(7)
df = df.dropna()
train, test = df.iloc[:-120], df.iloc[-120:]                 # last 120 days are the test period

if __name__ == "__main__":
    print(len(train), "training days,", len(test), "test days")</div>
  <div class="fx" data-lang="text">603 training days, 120 test days</div>
  <p>A linear regression uses weekday, a festival flag, the trend and the orders from yesterday and from the same day last week. Instead of stopping at one metric, we look at the residuals in groups:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from kitchen import train, test
from sklearn.linear_model import LinearRegression

def design(d):                                    # weekday dummies + festival + trend + lags
    return pd.get_dummies(d.dow, prefix="d").join(d[["festival", "t", "lag1", "lag7"]]).astype(float)
fit = LinearRegression().fit(design(train), train.orders).predict(design(test))
r = pd.DataFrame({"res": test.orders.values - fit, "fit": fit,
                  "dow": test.dow.values, "festival": test.festival.values})
print(f"mean residual (bias) = {r.res.mean():+.2f}")
print("mean residual by weekday (0=Mon):", r.groupby("dow").res.mean().round(2).tolist())
print("mean residual, normal vs festival:", r.groupby("festival").res.mean().round(2).tolist())
r["size"] = pd.cut(r.fit, [0, 30, 40, 50, 200])
print("spread (std) of residuals by forecast size:")
print(r.groupby("size", observed=True).res.agg(["std", "count"]).round(2))</div>
  <div class="fx" data-lang="text">mean residual (bias) = +0.77
mean residual by weekday (0=Mon): [-1.64, 0.92, 1.72, 1.66, 2.24, 3.68, -3.16]
mean residual, normal vs festival: [0.57, 6.76]
spread (std) of residuals by forecast size:
             std  count
size                   
(0, 30]     5.19     33
(30, 40]    6.34     64
(40, 50]   15.94      3
(50, 200]   9.21     20</div>
  <p>The overall bias is small, +0.77, but the groups tell a different story. Saturdays are under-forecast by 3.68 on average and Sundays over-forecast by 3.16; festival days are under-forecast by 6.76. And the spread of the residuals grows with the size of the forecast, from a standard deviation of about 5 for small forecasts to 9 to 16 for big ones. A spread that grows with size is called <strong>heteroscedasticity</strong>, and on a plot of residuals against forecasts it looks like a funnel. The figure shows the 120 test residuals: Saturdays (green) sit mostly above zero, Sundays (teal) mostly below, festivals (red) are under-forecast, and the cloud widens to the right.</p>
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
  <p>All these patterns point to the same cause. The model adds a fixed amount for Saturday, but in the real kitchen Saturday multiplies the level of orders, and a fixed amount cannot capture a multiplication. A log target turns multiplicative effects into additive ones, so it is the natural fix:</p>
  <div class="fx" data-lang="py"># the residuals said "effects are multiplicative": fit on log(1 + orders) instead
import numpy as np, pandas as pd
from kitchen import train, test
from sklearn.linear_model import LinearRegression
from sklearn.compose import TransformedTargetRegressor
from sklearn.metrics import mean_absolute_error

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
    print(f"{name}: MAE={mean_absolute_error(test.orders, f):.2f}  bias={res.mean():+.2f}  Mon..Sun={by_dow}")</div>
  <div class="fx" data-lang="text">plain target: MAE=5.67  bias=+0.79  Mon..Sun=[-1.7, 0.9, 1.8, 1.7, 2.3, 3.7, -3.2]
log1p target: MAE=5.58  bias=+1.45  Mon..Sun=[-0.8, 1.8, 2.5, 2.3, 2.9, 2.9, -1.4]</div>
  <p>The log model improves MAE slightly (5.67 to 5.58) and shrinks the Saturday and Sunday imbalance (3.7 and −3.2 become 2.9 and −1.4). (Both models here use logged lag features, so the plain model's numbers differ slightly from the previous block.) But the overall bias grew from +0.79 to +1.45. Transforming a log-scale prediction back with exp gives roughly the conditional <em>median</em>, which for right-skewed counts sits below the mean, so totals come out too low. If the kitchen needs unbiased totals for buying ingredients, it must correct for this, for example by multiplying by a factor fitted on validation data. A table of metrics alone would have hidden this trade-off; the residuals showed it. Two habits make residual analysis trustworthy: do it on validation or test data, because a flexible model's training residuals look perfect; and also plot residuals against time, where runs of the same sign mean information is left in recent errors. Formal tests are covered in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>

  <h2 id="rm-base"><span class="num">10</span>Baselines and scikit-learn</h2>
  <p>The linear model's MAE on the kitchen's test period is about 5.7. Is that good? Without the score of a simple model on the same 120 days, the number means nothing. A <strong>baseline</strong> is a trivial or existing model scored on exactly the same test rows with the same metric. Medicine works the same way: a new drug is tested against a placebo and against the current best drug, never against nothing. The usual baselines are the mean of the training target (the MSE-best constant, which R² compares against), the median (the MAE-best constant), the naive forecast, and the seasonal naive forecast:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from kitchen import train, test
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

feats = ["dow", "festival", "t", "lag1", "lag7"]
Xtr, ytr, Xte, yte = train[feats], train.orders, test[feats], test.orders
dummies = lambda X: pd.get_dummies(X.dow, prefix="d").join(X.drop(columns="dow")).astype(float)
preds = {
    "mean of train":        DummyRegressor(strategy="mean").fit(Xtr, ytr).predict(Xte),
    "naive (yesterday)":    test.lag1.values,
    "seasonal naive (-7d)": test.lag7.values,
    "linear regression":    LinearRegression().fit(dummies(Xtr), ytr).predict(dummies(Xte)),
    "gradient boosting":    HistGradientBoostingRegressor(random_state=0).fit(Xtr, ytr).predict(Xte),
}
scale = np.abs(np.diff(ytr.values)).mean()                   # MASE scale from the training period
print(f"{'model':21s}{'MAE':&gt;6s}{'RMSE':&gt;7s}{'R²':&gt;8s}{'MASE':&gt;6s}")
for name, f in preds.items():
    print(f"{name:21s}{mean_absolute_error(yte, f):6.2f}{root_mean_squared_error(yte, f):7.2f}"
          f"{r2_score(yte, f):8.3f}{mean_absolute_error(yte, f) / scale:6.2f}")</div>
  <div class="fx" data-lang="text">model                   MAE   RMSE      R²  MASE
mean of train         10.33  14.21  -0.098  0.86
naive (yesterday)     14.30  19.22  -1.009  1.19
seasonal naive (-7d)   8.78  12.57   0.141  0.73
linear regression      5.68   7.27   0.713  0.47
gradient boosting      7.21   9.96   0.461  0.60</div>
  <p>The seasonal naive forecast (MAE 8.78, MASE 0.73) is the baseline to beat. It is much better than plain naive, which at 14.30 is even worse than the constant mean, because Saturday follows Friday and Monday follows Sunday, so "same as yesterday" is badly wrong at both ends of the week. Choosing a weak baseline makes any model look good. Notice that the mean of the training data scores R² −0.098 on the test period: scikit-learn's <code>r2_score</code> builds SS_tot from the mean of the <em>test</em> values, which is higher because orders grow, so even the "R² = 0 model" scores below zero out of sample. Linear regression beats seasonal naive by about 35%. That relative improvement is the honest headline, and it has a name: a <strong>skill score</strong>, 1 − score(model) / score(baseline) = 1 − 5.68 / 8.78 = 0.35. R² is the skill score of MSE against the mean, and MASE is a ratio against the naive forecast. Gradient boosting loses to the linear model here, because with a trend, trees cannot predict values beyond the range they saw in training (<a class="xref" data-note="ml_dtree">Decision Trees</a>); only a baseline table makes that visible. For time series, always split by time as this code does: a random split lets models and baselines peek at neighbouring days.</p>
  <p>To use these metrics inside model selection, you pass scorer names to <code>cross_val_score</code>, <code>cross_validate</code> or <code>GridSearchCV</code>. Those tools always <em>maximise</em> a score, so error metrics are exposed negated: <code>"neg_mean_absolute_error"</code> returns −MAE:</p>
  <div class="fx" data-lang="py">import numpy as np
from kitchen import train
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import cross_validate, TimeSeriesSplit

X, y = train[["dow", "festival", "t", "lag1", "lag7"]], train.orders
r = cross_validate(HistGradientBoostingRegressor(random_state=0), X, y, cv=TimeSeriesSplit(4),
                   scoring=["neg_mean_absolute_error", "r2"])
print("raw scores :", np.round(r["test_neg_mean_absolute_error"], 2))
print("fold MAE   :", np.round(-r["test_neg_mean_absolute_error"], 2))
print("fold R²    :", np.round(r["test_r2"], 3))</div>
  <div class="fx" data-lang="text">raw scores : [-5.28 -6.45 -5.36 -6.63]
fold MAE   : [5.28 6.45 5.36 6.63]
fold R²    : [0.524 0.361 0.647 0.384]</div>
  <p>The raw scores come back negative, and you flip the sign to report them; "higher is better" still holds, so −5.28 beats −6.63. The four time-ordered folds give MAE between 5.3 and 6.6 and R² between 0.36 and 0.65, and that spread is as informative as the average. The main functions and their scorer names are:</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Function</th><th>Scorer string</th></tr>
    <tr><td>MAE</td><td><code>mean_absolute_error</code></td><td><code>neg_mean_absolute_error</code></td></tr>
    <tr><td>MSE / RMSE</td><td><code>mean_squared_error</code> / <code>root_mean_squared_error</code></td><td><code>neg_mean_squared_error</code> / <code>neg_root_mean_squared_error</code></td></tr>
    <tr><td>MedAE / max error</td><td><code>median_absolute_error</code> / <code>max_error</code></td><td><code>neg_median_absolute_error</code> / <code>neg_max_error</code></td></tr>
    <tr><td>R² / explained variance</td><td><code>r2_score</code> / <code>explained_variance_score</code></td><td><code>r2</code> / <code>explained_variance</code></td></tr>
    <tr><td>MAPE (a fraction)</td><td><code>mean_absolute_percentage_error</code></td><td><code>neg_mean_absolute_percentage_error</code></td></tr>
    <tr><td>RMSLE</td><td><code>root_mean_squared_log_error</code></td><td><code>neg_root_mean_squared_log_error</code></td></tr>
    <tr><td>Pinball, Poisson deviance</td><td><code>mean_pinball_loss</code>, <code>mean_poisson_deviance</code></td><td>via <code>make_scorer</code>, <code>neg_mean_poisson_deviance</code></td></tr>
    <tr><td>sMAPE, WAPE, MASE, adjusted R²</td><td>not in scikit-learn: write them</td><td><code>make_scorer(f, greater_is_better=False)</code></td></tr>
  </table>

  <h2 id="rm-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>A quiet but common mistake is averaging RMSE across cross-validation folds or across product series and calling the result "the RMSE". Because of the square root, the average of RMSEs is not the RMSE of all the errors pooled together:</p>
  <div class="fx" data-lang="py">import numpy as np
from week import y, yhat
from sklearn.metrics import root_mean_squared_error

folds = [(y[:3], yhat[:3]), (y[3:], yhat[3:])]           # pretend the week is two CV folds
per_fold = [root_mean_squared_error(a, b) for a, b in folds]
print("RMSE per fold:", np.round(per_fold, 3), " average of RMSEs:", round(np.mean(per_fold), 3))
print("RMSE of pooled errors:", round(root_mean_squared_error(y, yhat), 3))
print("root of averaged MSEs:", round(np.sqrt(np.mean([r ** 2 for r in per_fold])), 3))</div>
  <div class="fx" data-lang="text">RMSE per fold: [2.16  6.481]  average of RMSEs: 4.32
RMSE of pooled errors: 4.83
root of averaged MSEs: 4.83</div>
  <p>Splitting the week into two "folds" gives RMSEs of 2.16 and 6.48, whose average is 4.32, but the RMSE of all six errors is 4.83. Averaging the MSEs first and then taking the root gives the correct 4.83 when the folds are the same size. Either do that, or clearly report "mean of fold RMSEs".</p>
  <p>Other mistakes are about interpretation. Calling RMSE "the average error" is wrong; the average miss is MAE (3.67, not 4.83). Reading R² as accuracy is wrong: R² 0.86 is not "86% correct" but the share of the mean forecast's squared error removed. Believing R² must lie between 0 and 1 fails out of sample, where the reversed forecast scored −1.86. Using MAPE when actual values can be small or zero lets one quiet day take MAPE from 9.6% to 51%; use WAPE or MASE. Comparing MAE across series of different sizes compares their sizes, not their forecasts. Reporting a metric without a baseline, or with the wrong baseline (plain naive instead of seasonal naive), makes any model look good. Training on one loss and reporting a metric that targets a different statistic, such as an MSE-trained model judged on MAPE, rewards the wrong forecasts. Forgetting the sign of <code>neg_</code> scorers produces upside-down comparison tables, and <code>regressor.score(X, y)</code> returns R², not MAE. And trusting one overall number hides segment problems, like the overall bias of +0.77 that hid Saturdays at +3.7 and Sundays at −3.2.</p>

  <h2 id="rm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Real orders y = 20, 25, 30, 35, 40, 60 (sum 210, mean 35); forecast ŷ = 22, 24, 33, 30, 41, 50; residuals e = y − ŷ = −2, +1, −3, +5, −1, +10. Previous six days (for MASE): 14, 22, 17, 28, 24, 33.</p>
  <h3>Formulas and values</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Week</th></tr>
    <tr><td>ME (bias)</td><td>(1/n) Σ eᵢ</td><td>10/6 = +1.67</td></tr>
    <tr><td>MAE</td><td>(1/n) Σ |eᵢ|</td><td>22/6 = 3.67</td></tr>
    <tr><td>MSE / RMSE</td><td>(1/n) Σ eᵢ² / √MSE</td><td>140/6 = 23.33 / 4.83</td></tr>
    <tr><td>MedAE / max error</td><td>median |eᵢ| / max |eᵢ|</td><td>2.5 / 10</td></tr>
    <tr><td>R²</td><td>1 − Σeᵢ² / Σ(yᵢ − ȳ)²</td><td>1 − 140/1000 = 0.86</td></tr>
    <tr><td>Adjusted R²</td><td>1 − (1 − R²)(n − 1)/(n − p − 1)</td><td>0.825 (p = 1), 0.650 (p = 3)</td></tr>
    <tr><td>MAPE</td><td>(1/n) Σ |eᵢ|/|yᵢ|</td><td>9.58%</td></tr>
    <tr><td>sMAPE</td><td>(1/n) Σ 2|eᵢ| / (|yᵢ| + |ŷᵢ|)</td><td>9.86%</td></tr>
    <tr><td>WAPE</td><td>Σ|eᵢ| / Σ|yᵢ| = MAE / mean(y)</td><td>22/210 = 10.48%</td></tr>
    <tr><td>MASE</td><td>MAE / mean |y_t − y_{t−m}| on training data</td><td>3.67/7.4 = 0.50</td></tr>
    <tr><td>RMSLE</td><td>√[(1/n) Σ (ln(1 + yᵢ) − ln(1 + ŷᵢ))²]</td><td>0.111</td></tr>
    <tr><td>Pinball loss at q</td><td>(1/n) Σ max(q·eᵢ, (q − 1)·eᵢ)</td><td>2.50 at q = 0.9</td></tr>
    <tr><td>Skill score</td><td>1 − score(model)/score(baseline)</td><td>kitchen: 1 − 5.68/8.78 = 0.35</td></tr>
  </table>
  <h3>Key facts</h3>
  <ul>
    <li>Best constant: mean for MSE, median for MAE, q-th quantile for pinball, a low value for MAPE.</li>
    <li>MSE of the mean forecast = Var(y), so R² = 1 − MSE/Var(y).</li>
    <li>RMSE ≥ MAE; a large RMSE/MAE ratio means a few big misses dominate (1.32 → 1.91 after one festival).</li>
    <li>R² = 0 means as good as the mean; it can be any negative number out of sample; test R² uses the test mean.</li>
    <li>Explained variance forgives constant bias; R² does not.</li>
    <li>RMSLE = RMSE on log1p scale; back-transformed log predictions are roughly medians (biased low).</li>
  </ul>
  <h3>Which metric when</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Use when</th><th>Watch out</th></tr>
    <tr><td>MAE / WAPE</td><td>Default business reporting; linear cost</td><td>MAE is scale-dependent</td></tr>
    <tr><td>RMSE</td><td>Big misses disproportionately costly</td><td>Outliers dominate</td></tr>
    <tr><td>R²</td><td>Share of variation captured, one test set</td><td>Not accuracy; not comparable across test sets</td></tr>
    <tr><td>MAPE</td><td>Actuals never near zero</td><td>Biased low; infinite at 0</td></tr>
    <tr><td>MASE</td><td>Many time series of different sizes</td><td>Time series only</td></tr>
    <tr><td>RMSLE / pinball</td><td>Ratio errors / asymmetric costs</td><td>Clip negatives; pick q from costs</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.metrics import (mean_absolute_error, root_mean_squared_error, r2_score,
                             mean_absolute_percentage_error, mean_pinball_loss)
from sklearn.dummy import DummyRegressor
mae = mean_absolute_error(y, pred); rmse = root_mean_squared_error(y, pred)
r2 = r2_score(y, pred)                        # uses the mean of y passed in
wape = abs(y - pred).sum() / abs(y).sum()
base = DummyRegressor(strategy="mean").fit(X_tr, y_tr)   # always score a baseline
cross_val_score(model, X, y, scoring="neg_mean_absolute_error")   # negated: flip the sign</div>
  <h3>Gotchas</h3>
  <ul>
    <li>RMSE is not the average error; R² is not accuracy.</li>
    <li>MAPE explodes on small or zero values and favours low forecasts.</li>
    <li>Average MSEs then take the root; never average RMSEs.</li>
    <li>Always beside a baseline; for weekly data, the seasonal naive.</li>
    <li>Look at residuals by segment; overall bias hides group bias.</li>
  </ul>

  <h2 id="rm-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a residual, and why is the mean residual not a measure of accuracy?</summary><div class="qa-body">A residual is actual minus predicted, y − ŷ. Its mean is the bias, which says whether the model leans high or low. Positive and negative errors cancel, so a model that is wildly wrong in both directions can have zero bias; to measure size you must remove the sign with absolute values or squares.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MAE vs RMSE: when do you use each?</summary><div class="qa-body">MAE when every unit of error costs the same and outliers should not dominate; it targets the median. RMSE when big misses are disproportionately costly, or to match a model trained on squared error; it targets the mean. RMSE is always at least MAE, and a large gap means a few big errors dominate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that the mean minimises MSE and say what minimises MAE.</summary><div class="qa-body">The derivative of (1/n)Σ(yᵢ − c)² with respect to c is −(2/n)Σ(yᵢ − c); setting it to zero gives c = mean(y), and the second derivative is positive. For MAE, moving c lowers the loss for points on one side and raises it for the other, so the minimum is where half the points lie on each side: the median.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does R² measure, and how can it be negative?</summary><div class="qa-body">R² = 1 − SS_res/SS_tot compares the model's squared error with that of always predicting the mean. If the model's squared error is larger than the mean forecast's, the ratio exceeds 1 and R² is negative. In-sample least squares with an intercept cannot do worse than the mean, but on new data or for other models it can, with no lower limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use adjusted R², and what happens to it when you add a useless feature?</summary><div class="qa-body">In-sample R² never decreases when a feature is added, even pure noise. Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p − 1) charges for each feature, so a useless feature lowers it. It applies to linear models with a clear feature count; for other models use held-out data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between R² and explained variance?</summary><div class="qa-body">Explained variance uses the variance of the residuals, which subtracts their mean, so it ignores a constant bias. R² uses the raw squared residuals. Shifting every forecast up by 10 lowers R² but leaves explained variance unchanged; they agree only when the mean residual is zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MAPE dangerous, and what do you use instead?</summary><div class="qa-body">It divides by the actual value, so small actuals produce huge percentages and zero gives infinity. Over-forecasts are unbounded while under-forecasts cap at 100%, so it favours low forecasts. Use WAPE (total absolute error over total actual), MASE, or MAPE only above a stated floor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is MASE and how do you read 0.5 and 1.2?</summary><div class="qa-body">The model's MAE divided by the in-sample MAE of the naive (or seasonal naive) forecast on the training series. 0.5 means half the naive forecast's typical error; 1.2 means 20% worse than naive, so the model is not worth using. It is scale-free, handles zeros and suits comparing many time series.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose RMSLE?</summary><div class="qa-body">When the target spans orders of magnitude and relative errors matter, or when under-forecasting is worse than over-forecasting, since halving costs more than a 50% overshoot in log space. Optimise it by training on log1p(y) and back-transforming with expm1, remembering that the result is roughly a median and biased low for totals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Running out of stock is 9 times worse than leftovers. Which loss do you train and evaluate with?</summary><div class="qa-body">Pinball (quantile) loss at q = 9/(9 + 1) = 0.9, which makes the model forecast the 90th percentile of demand, so it runs out on about 1 day in 10. In gradient boosting this is <code>loss="quantile"</code> with the quantile set to 0.9; evaluate with the same pinball loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should the training loss and the reporting metric agree?</summary><div class="qa-body">Each loss is minimised by a particular statistic: MSE by the mean, MAE by the median, pinball by a quantile. A model trained for the mean but judged on MAE or MAPE is optimised for a different target and can lose to a worse model that happens to aim at the right statistic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model's MAE is 5.7. Is that good?</summary><div class="qa-body">Only relative to baselines on the same test rows. For the kitchen, the mean scored 10.3, naive 14.3 and seasonal naive 8.8, so the model removes about 35% of the seasonal naive's error (skill score 0.35). Report it that way, with the spread across time-ordered CV folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do you look for in residual plots?</summary><div class="qa-body">Overall bias and bias per segment (weekday, region), spread against the fitted value (a funnel means heteroscedasticity), patterns over time (autocorrelation), and heavy tails. In the kitchen, Saturdays and festivals were under-forecast and errors widened on busy days, pointing to multiplicative effects and a log target.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a model trained on a log target under-predict totals?</summary><div class="qa-body">Exponentiating the mean of log(y) gives roughly the median of y, not its mean, and for right-skewed targets the median is below the mean. The fix is a correction factor fitted on validation data, or a loss on the original scale such as Poisson deviance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does scikit-learn call it neg_mean_absolute_error?</summary><div class="qa-body">Model-selection tools such as cross_val_score and GridSearchCV always maximise the score. Error metrics are negated so that larger is better; you flip the sign when reporting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you average RMSE across folds?</summary><div class="qa-body">The square root is not linear, so the mean of fold RMSEs differs from the RMSE of the pooled errors (4.32 vs 4.83 in the example). Average the MSEs and then take the root, or explicitly report the mean of fold RMSEs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is the Brier score related to regression metrics?</summary><div class="qa-body">The Brier score is the MSE of predicted probabilities against 0/1 labels. Like MSE it is minimised by the true conditional mean, here P(y = 1 | x), which is why it rewards calibrated probabilities (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</div></details>
</main>
`
});
