// ml/ml_regression.js — Regression
Object.assign(TOPIC_CONTENT, {
  "ml_regression": `<main>
  <h1>Regression</h1>
  <p class="lead">Regression predicts a number: marks from study hours, a flat's rent from its size, tomorrow's electricity demand. This note builds the best-fit line by hand on six students before any library, then shows how to score it (R², RMSE), how the one-line normal equation and gradient descent find the same answer, how to check the line with residual plots, and how ridge, lasso and elastic net keep weights sane when features are correlated or useless. Logistic regression (see <a class="xref" data-note="ml_classification">Classification</a>) and neural network layers reuse every idea here.</p>

  <h2 id="mr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Regression</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">OLS line</div>
        <ul>
          <li><b>Model</b> — ŷ = w₀ + w₁x₁ + … + w_dx_d = Xw</li>
          <li><b>Residual</b> — y − ŷ; vertical gap from point to line</li>
          <li><b>Loss</b> — minimise Σ(y − ŷ)², the sum of squared residuals (SSE)</li>
          <li><b>One feature</b> — slope = Σ(dx·dy) / Σdx², intercept = ȳ − slope·x̄</li>
          <li>Toy: 6 students → slope 73/17.5 = 4.17, intercept 47.4</li>
          <li>💡 A stick tied to every point by rubber bands</li>
          <li>⚠ Squares make one far outlier pull the line hard</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scoring</div>
        <ul>
          <li><b>R²</b> — 1 − SS_res/SS_tot; share of spread explained (toy 0.970)</li>
          <li><b>RMSE</b> — √mean(res²), in y's units (toy 1.26 marks)</li>
          <li><b>MAE</b> — mean |res|; less outlier-sensitive (toy 1.09)</li>
          <li>R² &lt; 0 on test = worse than predicting the mean</li>
          <li>⚠ Score on test data, not training data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Normal equation &amp; GD</div>
        <ul>
          <li><b>w = (XᵀX)⁻¹Xᵀy</b> — set gradient to zero, solve</li>
          <li>Toy: XᵀX = [[6,21],[21,91]], Xᵀy = [372,1375]</li>
          <li><b>Geometry</b> — ŷ is the projection of y; Xᵀ(y − ŷ) = 0</li>
          <li><b>Gradient descent</b> — step downhill; toy reaches 47.40 / 4.17 by step 500</li>
          <li><b>Use GD</b> — huge d, data that doesn't fit in memory</li>
          <li>⚠ Use solve / lstsq, never inv()</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Assumptions (LINE)</div>
        <ul>
          <li><b>L</b>inearity — curve in residual plot; biased weights</li>
          <li><b>I</b>ndependence — time series; Durbin–Watson ≈ 2 good</li>
          <li><b>N</b>ormal errors — only for p-values / CIs</li>
          <li><b>E</b>qual variance — fan shape; Breusch–Pagan; log(y)</li>
          <li><b>Multicollinearity</b> — VIF &gt; 10; unstable signs</li>
          <li>⚠ y = x² fit by a line: R² 0.963, residuals +,−,−,−,+</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ridge / Lasso / ENet</div>
        <ul>
          <li><b>Ridge (L2)</b> — RSS + α·Σw²; shrinks, never 0; toy w = 73/(17.5+α)</li>
          <li><b>Lasso (L1)</b> — RSS + α·Σ|w|; exact zeros; toy w = 0 once α ≥ 12.17</li>
          <li><b>Elastic Net</b> — mix; sparse and keeps correlated groups</li>
          <li><b>Twins</b> — OLS [−3.8, 6.8], Ridge [1.5, 1.5], Lasso [2.9, 0.0]</li>
          <li><b>Why zeros</b> — diamond corners; L1 pull is constant, L2 pull fades</li>
          <li>⚠ Standardise first; tune α with CV</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Polynomial &amp; payoff</div>
        <ul>
          <li><b>Idea</b> — add x², x³ columns; still linear in w</li>
          <li><b>Overfit</b> — degree 15: train 0.12, test 0.55 (degree 3: 0.33)</li>
          <li><b>Explosion</b> — 10 inputs → 65 / 285 / 3002 features (degree 2/3/5)</li>
          <li><b>200 noise columns</b> — OLS R² −0.26, Ridge 0.37, Lasso 0.49 (6 kept)</li>
          <li>💡 Degree 15 = mugging last year's paper word by word</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mr-ols"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Best-Fit Line by Hand</span><span class="rm-sub">Residuals, squared loss, 6 students</span></div></div>
      <div class="rm-item rm-done" data-target="mr-score"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How Good Is the Line?</span><span class="rm-sub">R², RMSE, MAE</span></div></div>
      <div class="rm-item rm-done" data-target="mr-normal"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Normal Equation &amp; Gradient Descent</span><span class="rm-sub">One formula vs walking downhill</span></div></div>
      <div class="rm-item rm-done" data-target="mr-diag"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Assumptions &amp; Diagnostics</span><span class="rm-sub">Reading residual plots</span></div></div>
      <div class="rm-item rm-done" data-target="mr-reg"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Ridge, Lasso, Elastic Net</span><span class="rm-sub">Shrinkage by hand, then real data</span></div></div>
      <div class="rm-item rm-done" data-target="mr-l1"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Why L1 Gives Zeros</span><span class="rm-sub">Diamond vs circle, fee vs tax</span></div></div>
      <div class="rm-item rm-done" data-target="mr-poly"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Polynomial Regression</span><span class="rm-sub">Curves and overfitting</span></div></div>
      <div class="rm-item rm-done" data-target="mr-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">When regularisation pays</span></div></div>
      <div class="rm-item rm-done" data-target="mr-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leaks, inv(), unscaled penalties</span></div></div>
      <div class="rm-item rm-done" data-target="mr-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mr-ols"><span class="num">01</span>The Best-Fit Line by Hand</h2>
  <p>Six students tell you how many hours they studied and the marks they got. A seventh student says "I will study 7 hours. What will I get?" You could eyeball the scatter and guess. But two people eyeballing will draw two different lines, and neither can say why theirs is better. We need a rule that picks <em>one</em> line and can defend it.</p>
  <p>The rule: for every student, measure how far the line's guess is from the real mark. That gap is the <strong>residual</strong> (real minus predicted). Square each gap so negatives don't cancel positives, add them up, and pick the line that makes this total as small as possible. That is <strong>ordinary least squares</strong>, OLS for short.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tie each point to a long bamboo stick with a rubber band. Let go. The stick wobbles and settles where the total pull of all the bands is least. A point far away stretches its band a lot and pulls the stick hard. That is also why one outlier can tilt an OLS line.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 520 250" width="520">
<line x1="50" y1="225" x2="505" y2="225" stroke="currentColor"/><line x1="50" y1="5" x2="50" y2="225" stroke="currentColor"/>
<text x="40" y="211" text-anchor="end" class="tm" font-size="11">50</text><text x="40" y="131" text-anchor="end" class="tm" font-size="11">60</text><text x="40" y="51" text-anchor="end" class="tm" font-size="11">70</text>
<text x="95" y="242" text-anchor="middle" class="tm" font-size="11">1</text><text x="165" y="242" text-anchor="middle" class="tm" font-size="11">2</text><text x="235" y="242" text-anchor="middle" class="tm" font-size="11">3</text><text x="305" y="242" text-anchor="middle" class="tm" font-size="11">4</text><text x="375" y="242" text-anchor="middle" class="tm" font-size="11">5</text><text x="445" y="242" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="60" y1="211" x2="480" y2="11" class="sb" stroke-width="2"/>
<line x1="95" y1="191" x2="95" y2="194" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="165" y1="167" x2="165" y2="161" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="235" y1="119" x2="235" y2="128" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="305" y1="111" x2="305" y2="94" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="375" y1="47" x2="375" y2="61" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="445" y1="31" x2="445" y2="28" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<circle cx="95" cy="191" r="4.5" class="ft st"/><circle cx="165" cy="167" r="4.5" class="ft st"/><circle cx="235" cy="119" r="4.5" class="ft st"/><circle cx="305" cy="111" r="4.5" class="ft st"/><circle cx="375" cy="47" r="4.5" class="ft st"/><circle cx="445" cy="31" r="4.5" class="ft st"/>
<text x="70" y="25" class="tb" font-size="13">ŷ = 47.4 + 4.17·hours</text>
<text x="318" y="108" class="tr" font-size="12">residual −2.09</text>
<text x="500" y="218" text-anchor="end" class="tm" font-size="11">hours studied</text>
<text x="58" y="12" class="tm" font-size="11">marks</text>
</svg><figcaption>The six students. OLS picks the line that makes the sum of the squared red gaps as small as possible.</figcaption></figure>
  <h3>Worked example: fit the line with a pencil</h3>
  <p>For one feature there is a short recipe. Take each point's distance from the average: dx = x − x̄ and dy = y − ȳ. The slope is Σ(dx·dy) / Σ(dx²). The intercept makes the line pass through the average point: intercept = ȳ − slope·x̄.</p>
  <table class="tbl out"><caption>x̄ = 3.5 hours, ȳ = 62 marks</caption>
    <tr><th>hours x</th><th>marks y</th><th>dx</th><th>dy</th><th>dx·dy</th><th>dx²</th></tr>
    <tr><td>1</td><td>52</td><td>−2.5</td><td>−10</td><td>25</td><td>6.25</td></tr>
    <tr><td>2</td><td>55</td><td>−1.5</td><td>−7</td><td>10.5</td><td>2.25</td></tr>
    <tr><td>3</td><td>61</td><td>−0.5</td><td>−1</td><td>0.5</td><td>0.25</td></tr>
    <tr><td>4</td><td>62</td><td>0.5</td><td>0</td><td>0</td><td>0.25</td></tr>
    <tr><td>5</td><td>70</td><td>1.5</td><td>8</td><td>12</td><td>2.25</td></tr>
    <tr><td>6</td><td>72</td><td>2.5</td><td>10</td><td>25</td><td>6.25</td></tr>
    <tr><td colspan="4"><strong>sum</strong></td><td><strong>73</strong></td><td><strong>17.5</strong></td></tr>
  </table>
  <p>Slope = 73 / 17.5 = <strong>4.171</strong> marks per hour. Intercept = 62 − 4.171 × 3.5 = <strong>47.4</strong>. Is this really the smallest? Try two other lines: 45 + 5x gives a squared-error total of 23.0, and 50 + 4x gives 34.0. Our line gives 9.49. Nothing beats it. The script below does the same arithmetic in NumPy, so you can check every number in the table.</p>
  <div class="fx" data-lang="py">import numpy as np
hours = np.array([1, 2, 3, 4, 5, 6])
marks = np.array([52, 55, 61, 62, 70, 72])
dx = hours - hours.mean()
dy = marks - marks.mean()
slope = (dx * dy).sum() / (dx ** 2).sum()
intercept = marks.mean() - slope * hours.mean()
print("sum dx*dy:", (dx * dy).sum(), " sum dx^2:", (dx ** 2).sum())
print(f"slope {slope:.4f}  intercept {intercept:.4f}")
res = marks - (intercept + slope * hours)
print("residuals:", res.round(2))
for a, b in [(47.4, 4.1714), (45, 5), (50, 4)]:
    print(f"line {a}+{b}x  SSE={((marks - (a + b*hours))**2).sum():.2f}")</div>
  <div class="fx" data-lang="text">sum dx*dy: 73.0  sum dx^2: 17.5
slope 4.1714  intercept 47.4000
residuals: [ 0.43 -0.74  1.09 -2.09  1.74 -0.43]
line 47.4+4.1714x  SSE=9.49
line 45+5x  SSE=23.00
line 50+4x  SSE=34.00</div>
  <p><code>dx</code> and <code>dy</code> are the two middle columns of the table. The <code>slope</code> line is the recipe. The final loop scores three candidate lines by their SSE (sum of squared errors); the OLS line wins. Now the same fit with scikit-learn, the library you will use at work:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
X = np.array([[1], [2], [3], [4], [5], [6]])      # hours, as a 2-D table: 6 rows, 1 column
y = np.array([52, 55, 61, 62, 70, 72])            # marks
m = LinearRegression().fit(X, y)
print(f"slope {m.coef_[0]:.3f}  intercept {m.intercept_:.3f}")
res = y - m.predict(X)
print("residuals:", res.round(2), " sum:", round(res.sum(), 10))
print("predict 7 hours:", m.predict([[7]]).round(1))</div>
  <div class="fx" data-lang="text">slope 4.171  intercept 47.400
residuals: [ 0.43 -0.74  1.09 -2.09  1.74 -0.43]  sum: 0.0
predict 7 hours: [76.6]</div>
  <p>Same numbers. Note <code>X</code> is a 2-D table (<code>[[1],[2],…]</code>), because sklearn always expects rows × features, even for one feature. <code>coef_</code> holds the slopes, <code>intercept_</code> the constant. The residuals add up to exactly 0: that always happens when the model has an intercept.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ordinary least squares (OLS)</strong> fits ŷ = w₀ + w₁x₁ + … + w_dx_d by choosing the weights w that minimise <code>Σ(yᵢ − ŷᵢ)²</code>. The w's are called <strong>coefficients</strong> (or weights); w₀ is the <strong>intercept</strong>. Squaring makes the loss smooth with a single lowest point and punishes large misses more than small ones.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Squaring means a miss of 10 costs 100, while ten misses of 1 cost 10. One bad data entry (marks typed as 720) will drag the whole line. Plot the data first; for heavy outliers use MAE-based or Huber regression (<code>HuberRegressor</code>).</p>
  </div>
  <p>Where it matters: linear regression is the first baseline for any numeric target (price, demand, delivery time), and interviewers love asking you to derive the slope or explain a coefficient in plain words: "each extra hour adds about 4.2 marks".</p>

  <h2 id="mr-score"><span class="num">02</span>How Good Is the Line?</h2>
  <p>You have a line. Your manager asks "is it any good?" Saying "the residuals look small" is not an answer. Small compared to what? A miss of 2 marks is great if marks range 0–100, terrible if they range 60–64. We need numbers that compare the line's errors against something.</p>
  <p>Three numbers do most of the work. <strong>RMSE</strong> (root mean squared error) is the typical miss, in the same units as y. <strong>MAE</strong> (mean absolute error) is the average miss, ignoring sign. <strong>R²</strong> compares your line with the laziest possible model, "always predict the average", and says what share of the spread your line explains.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weather app says tomorrow will be 31°C. RMSE is "on average we are off by about 1.3 degrees". R² is "we are much better than just saying the monthly average every day". You want both: the size of the miss, and the improvement over a lazy guess.</p>
  </div>
  <h3>Worked example on the six students</h3>
  <ol>
    <li><strong>SS_tot</strong> (total spread): square each dy from the table and add: 100 + 49 + 1 + 0 + 64 + 100 = <strong>314</strong>. This is the error of the lazy "always say 62" model.</li>
    <li><strong>SS_res</strong> (what is left): square each residual and add: 0.43² + 0.74² + 1.09² + 2.09² + 1.74² + 0.43² = <strong>9.49</strong>.</li>
    <li><strong>R²</strong> = 1 − 9.49 / 314 = <strong>0.970</strong>. The line removes 97% of the squared error of the lazy guess.</li>
    <li><strong>RMSE</strong> = √(9.49 / 6) = <strong>1.26</strong> marks. <strong>MAE</strong> = (0.43 + 0.74 + 1.09 + 2.09 + 1.74 + 0.43) / 6 = <strong>1.09</strong> marks.</li>
  </ol>
  <p>The code below asks sklearn's metric functions for the same three numbers, so you can check the hand arithmetic.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
p = m.predict(X)
print(f"RMSE {mean_squared_error(y, p) ** 0.5:.2f}  MAE {mean_absolute_error(y, p):.2f}  R2 {r2_score(y, p):.3f}")</div>
  <div class="fx" data-lang="text">RMSE 1.26  MAE 1.09  R2 0.970</div>
  <p><code>mean_squared_error</code> returns MSE, so we take <code>** 0.5</code> to get RMSE back into marks. <code>r2_score(y, p)</code> is the same as <code>m.score(X, y)</code> for a regressor. All three match the pencil numbers.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>R² = 1 − SS_res / SS_tot</strong>, the coefficient of determination. 1 = perfect, 0 = no better than the mean, negative = worse than the mean (possible on test data). <strong>RMSE</strong> = √mean(residual²): punishes big misses. <strong>MAE</strong> = mean |residual|: treats all misses equally, so it is less swayed by outliers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>These scores on the <em>training</em> data are optimistic: the line was chosen to make them good. Always report them on a held-out test set or with cross-validation (see <a class="xref" data-note="ml_evaluation">Model Evaluation</a>). And a high R² does not prove the line is the right shape: section 04 shows a wrong model with R² 0.96.</p>
  </div>
  <p>Interview angle: "R² went up when I added a random column. Why?" Training R² can never go down when you add features, because the old solution is still available. That is why people use adjusted R² or, better, test-set scores.</p>

  <h2 id="mr-normal"><span class="num">03</span>Normal Equation &amp; Gradient Descent</h2>
  <p>The pencil recipe works for one feature. Real data has 10, 100 or 10,000 features (size, floor, age of building, distance to metro…). We need a method that finds all the weights at once. There are two: solve one matrix equation (the <strong>normal equation</strong>), or start with a guess and walk downhill step by step (<strong>gradient descent</strong>). Both reach the same line.</p>
  <p>The normal equation comes from one fact: at the lowest point of a bowl, the ground is flat. Write the loss for all weights, take its slope (gradient) with respect to each weight, set every slope to zero, and solve. The answer is w = (XᵀX)⁻¹Xᵀy, where X is the data table with an extra column of 1s for the intercept.</p>
  <div class="flow"><span>Loss ‖y − Xw‖²</span><span>Gradient −2Xᵀ(y − Xw)</span><span>Set to 0: XᵀXw = Xᵀy</span><span>w = (XᵀX)⁻¹Xᵀy</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding the lowest point of a valley. The normal equation is having the full contour map and reading the bottom off it in one go. Gradient descent is walking blindfolded: feel which way the ground slopes under your feet and take a step downhill, again and again.</p>
  </div>
  <h3>Worked example: the normal equation on six students</h3>
  <p>X has two columns: all 1s, and the hours. Then XᵀX is a 2×2 table of sums: [[n, Σx], [Σx, Σx²]] = [[6, 21], [21, 91]]. Xᵀy is [Σy, Σxy] = [372, 1375]. Solve the two equations 6w₀ + 21w₁ = 372 and 21w₀ + 91w₁ = 1375. The determinant is 6·91 − 21·21 = 105, so w₁ = (6·1375 − 21·372) / 105 = 438/105 = <strong>4.171</strong> and w₀ = (91·372 − 21·1375) / 105 = 4977/105 = <strong>47.4</strong>. Same line as before. In code:</p>
  <div class="fx" data-lang="py">Xb = np.c_[np.ones(len(X)), X]                 # add the 1s column for the intercept
XtX = Xb.T @ Xb
Xty = Xb.T @ y
print("XtX =", XtX.tolist(), " Xty =", Xty.tolist())
w = np.linalg.solve(XtX, Xty)                  # solve, don't invert
print("normal eq:", w.round(3))
w2, *_ = np.linalg.lstsq(Xb, y, rcond=None)    # SVD-based, safest
print("lstsq    :", w2.round(3))
print("X^T residual:", (Xb.T @ (y - Xb @ w)).round(10) + 0.0)</div>
  <div class="fx" data-lang="text">XtX = [[6.0, 21.0], [21.0, 91.0]]  Xty = [372.0, 1375.0]
normal eq: [47.4    4.171]
lstsq    : [47.4    4.171]
X^T residual: [0. 0.]</div>
  <p><code>np.c_</code> glues a column of 1s to the left of X. <code>@</code> is matrix multiply. <code>np.linalg.solve</code> solves XᵀXw = Xᵀy without ever forming an inverse, and <code>lstsq</code> uses SVD, which also copes with duplicate columns. The last line checks the key property: Xᵀ(y − ŷ) = 0, the residuals are at right angles to every column of X.</p>
  <figure class="viz"><svg viewBox="0 0 440 200" width="440">
<defs><marker id="mr-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<path d="M30 150 L250 175 L410 130 L190 105 Z" class="fs" stroke="currentColor"/>
<text x="30" y="194" class="tm" font-size="12">plane = span of X's columns</text>
<line x1="120" y1="140" x2="250" y2="30" stroke="currentColor" stroke-width="2" marker-end="url(#mr-ah)"/>
<text x="258" y="28" font-size="13">y</text>
<line x1="120" y1="140" x2="250" y2="135" class="sb" stroke-width="2" marker-end="url(#mr-ah)"/>
<text x="256" y="150" class="tb" font-size="13">ŷ = Xw</text>
<line x1="250" y1="35" x2="250" y2="130" class="sr" stroke-width="2" stroke-dasharray="4 3"/>
<text x="258" y="88" class="tr" font-size="12">residual y − ŷ ⟂ plane</text>
<path d="M250 122 h-8 v9" fill="none" stroke="currentColor"/>
</svg><figcaption>ŷ is the shadow of y on the space your features can reach; the residual sticks straight out of it. That right angle is the equation Xᵀ(y − ŷ) = 0.</figcaption></figure>
  <h3>Worked example: gradient descent on the same data</h3>
  <p>Start with w₀ = 0, w₁ = 0 (a flat line at zero marks). Each step: compute the errors, compute how the MSE changes if each weight moves a little (the gradient), and move each weight a small amount (the <strong>learning rate</strong>, 0.05 here) in the downhill direction.</p>
  <div class="fx" data-lang="py">x = np.array([1, 2, 3, 4, 5, 6.]); yv = np.array([52, 55, 61, 62, 70, 72.])
w0, w1, lr = 0.0, 0.0, 0.05                # start from a flat line at 0
for step in range(1, 1001):
    err = (w0 + w1 * x) - yv               # prediction minus truth, per row
    g0 = 2 * err.mean()                    # slope of MSE w.r.t. w0
    g1 = 2 * (err * x).mean()              # slope of MSE w.r.t. w1
    w0 -= lr * g0                          # step downhill
    w1 -= lr * g1
    if step in (1, 2, 10, 100, 500, 1000):
        mse = (((w0 + w1 * x) - yv) ** 2).mean()
        print(f"step {step:4d}  w0={w0:6.2f}  w1={w1:5.2f}  MSE={mse:8.2f}")</div>
  <div class="fx" data-lang="text">step    1  w0=  6.20  w1=22.92  MSE= 1622.22
step    2  w0=  3.76  w1= 8.91  MSE=  799.67
step   10  w0= 10.76  w1=12.64  MSE=  259.74
step  100  w0= 40.42  w1= 5.80  MSE=   10.96
step  500  w0= 47.40  w1= 4.17  MSE=    1.58
step 1000  w0= 47.40  w1= 4.17  MSE=    1.58</div>
  <p>Step 1 overshoots the slope to 22.9 (every guess was far too low, so the gradient is huge). It then zig-zags and settles. By step 500 it has the exact OLS answer, and MSE 1.58 is SSE 9.49 ÷ 6. <code>g0</code> and <code>g1</code> are the two partial derivatives; the <code>-=</code> lines are the "step downhill".</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th><th>Why</th></tr>
    <tr><td>Up to ~10k features, fits in memory</td><td>Closed form (SVD / <code>lstsq</code>), i.e. <code>LinearRegression</code></td><td>Exact, no learning rate; cost O(nd² + d³)</td></tr>
    <tr><td>Huge d or data won't fit in memory</td><td>Mini-batch gradient descent, <code>SGDRegressor</code></td><td>O(nd) per pass, can stream</td></tr>
    <tr><td>Duplicate / perfectly collinear features</td><td>Ridge or drop one</td><td>XᵀX is singular; (XᵀX + αI) is not</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Normal equation</strong>: XᵀXw = Xᵀy, whose solution w = (XᵀX)⁻¹Xᵀy is the OLS weight vector. <strong>Gradient descent</strong>: repeat w ← w − η·∇Loss(w), where η is the learning rate. For OLS the loss is a convex bowl, so GD with a small enough η reaches the same answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>np.linalg.inv(X.T @ X)</code> silently returns garbage when XᵀX is nearly singular (two almost identical columns). Use <code>np.linalg.lstsq</code> or <code>solve</code>; sklearn's <code>LinearRegression</code> already does. For GD: too large a learning rate and the loss blows up; unscaled features make GD crawl.</p>
  </div>

  <h2 id="mr-diag"><span class="num">04</span>Assumptions &amp; Diagnostics</h2>
  <p>OLS will always give you a line, even when a line is the wrong shape. And if you report p-values or confidence intervals (as analysts do in statsmodels), those numbers are only correct when certain conditions hold. So after fitting, you check. The main tool is the <strong>residual plot</strong>: predictions on the x-axis, residuals on the y-axis. A good model leaves only random noise behind, a shapeless band around zero.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor does not stop at one number on a blood report. R² is that one number. The residual plot is the full report: it shows <em>what kind</em> of problem is there, and so what medicine to give.</p>
  </div>
  <h3>Worked example: a line through a curve</h3>
  <p>Take five points that are truly curved: x = 1, 2, 3, 4, 5 and y = x² = 1, 4, 9, 16, 25. Fit a straight line with the pencil recipe: x̄ = 3, ȳ = 11, Σdx·dy = 60, Σdx² = 10, so slope = 6 and intercept = 11 − 18 = −7.</p>
  <table class="tbl out"><caption>Line ŷ = −7 + 6x on a curve</caption>
    <tr><th>x</th><th>y</th><th>ŷ</th><th>residual</th></tr>
    <tr><td>1</td><td>1</td><td>−1</td><td>+2</td></tr>
    <tr><td>2</td><td>4</td><td>5</td><td>−1</td></tr>
    <tr><td>3</td><td>9</td><td>11</td><td>−2</td></tr>
    <tr><td>4</td><td>16</td><td>17</td><td>−1</td></tr>
    <tr><td>5</td><td>25</td><td>23</td><td>+2</td></tr>
  </table>
  <p>R² = 1 − 14/374 = 0.963. Looks excellent. But the residuals go +, −, −, −, +: a smile. Random noise would never line up like that. The pattern says "you are missing an x² term". Random-looking residuals are the goal; any shape is a message.</p>
  <figure class="viz"><svg viewBox="0 0 570 150" width="570">
<line x1="10" y1="75" x2="130" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="150" y1="75" x2="270" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="290" y1="75" x2="410" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="430" y1="75" x2="550" y2="75" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M114 77h0M101 78h0M71 61h0M50 67h0M105 74h0M19 74h0M108 63h0M70 116h0M119 62h0M68 68h0M87 87h0M114 106h0M75 93h0M42 71h0M17 72h0M20 91h0M98 83h0M121 62h0M12 79h0M79 61h0M104 69h0M125 73h0M65 79h0M81 87h0M21 67h0M56 95h0M60 57h0M41 83h0M73 68h0M80 72h0M25 65h0M120 76h0M16 85h0M13 68h0M128 53h0M94 71h0M39 83h0M46 95h0M25 81h0M122 79h0M57 64h0M74 70h0M75 83h0M122 83h0M57 64h0M51 56h0M44 56h0M30 77h0M98 89h0M84 61h0M88 87h0M12 78h0M73 85h0M117 95h0M13 67h0M54 92h0M116 70h0M117 78h0M81 86h0M122 62h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M251 83h0M262 49h0M200 98h0M261 49h0M265 51h0M166 59h0M267 50h0M230 85h0M260 60h0M224 94h0M201 109h0M177 70h0M170 75h0M238 84h0M183 80h0M262 50h0M203 93h0M228 92h0M194 100h0M184 93h0M238 85h0M238 77h0M150 42h0M262 54h0M213 100h0M201 93h0M225 97h0M203 97h0M219 96h0M159 54h0M249 77h0M257 66h0M160 50h0M186 90h0M173 76h0M177 81h0M231 81h0M216 100h0M221 95h0M172 66h0M194 87h0M263 57h0M182 79h0M151 45h0M256 66h0M213 101h0M158 46h0M165 58h0M255 56h0M226 87h0M181 79h0M246 72h0M231 76h0M215 98h0M179 79h0M245 86h0M152 45h0M270 35h0M157 50h0M237 95h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M402 64h0M307 66h0M401 83h0M359 78h0M308 79h0M388 63h0M312 76h0M298 77h0M394 70h0M397 67h0M322 76h0M359 73h0M408 102h0M402 67h0M328 79h0M294 73h0M297 72h0M351 70h0M378 76h0M299 77h0M295 75h0M322 82h0M322 66h0M402 54h0M348 73h0M376 91h0M317 74h0M300 74h0M368 76h0M301 69h0M390 85h0M334 73h0M389 46h0M331 76h0M388 35h0M405 92h0M406 60h0M368 74h0M353 69h0M345 75h0M404 76h0M358 80h0M319 62h0M353 76h0M378 70h0M397 73h0M291 75h0M295 72h0M389 52h0M378 75h0M296 76h0M310 86h0M391 75h0M402 60h0M371 63h0M383 92h0M355 68h0M341 72h0M321 81h0M300 72h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M430 69h0M432 72h0M434 79h0M436 82h0M438 72h0M440 59h0M442 64h0M444 52h0M446 67h0M448 58h0M450 74h0M452 72h0M454 94h0M456 103h0M458 79h0M460 61h0M462 71h0M464 65h0M466 64h0M469 64h0M470 74h0M472 73h0M475 60h0M476 81h0M478 83h0M481 76h0M482 98h0M485 104h0M487 107h0M488 95h0M491 92h0M493 70h0M495 87h0M497 86h0M499 84h0M501 71h0M503 83h0M505 77h0M507 73h0M509 72h0M511 81h0M513 75h0M515 70h0M517 73h0M519 81h0M521 68h0M523 64h0M525 62h0M527 59h0M529 47h0M531 66h0M534 70h0M536 65h0M537 69h0M540 52h0M542 77h0M543 83h0M546 90h0M548 84h0M550 68h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<text x="70" y="18" text-anchor="middle" class="tg" font-size="13">healthy</text><text x="210" y="18" text-anchor="middle" class="tr" font-size="13">curve</text><text x="350" y="18" text-anchor="middle" class="tr" font-size="13">fan</text><text x="490" y="18" text-anchor="middle" class="tr" font-size="13">snake</text>
<text x="70" y="140" text-anchor="middle" class="tm" font-size="11">random band</text><text x="210" y="140" text-anchor="middle" class="tm" font-size="11">missing x² term</text><text x="350" y="140" text-anchor="middle" class="tm" font-size="11">variance grows</text><text x="490" y="140" text-anchor="middle" class="tm" font-size="11">residuals vs time</text>
</svg><figcaption>Residuals (y-axis) vs fitted values from four simulated datasets. Only the first is a model you can trust.</figcaption></figure>
  <table class="tbl">
    <tr><th>Assumption</th><th>If violated</th><th>Check</th><th>Fix</th></tr>
    <tr><td><strong>L</strong>inearity</td><td>Biased coefficients, systematic misses</td><td>Curve in residual plot</td><td>Add x², log, splines; or trees</td></tr>
    <tr><td><strong>I</strong>ndependent errors</td><td>Coefficients fine, standard errors too small → fake significance</td><td>Durbin–Watson (≈ 2 good, ≪ 2 bad)</td><td>Lag features, time-series model, Newey–West SEs</td></tr>
    <tr><td><strong>N</strong>ormal errors</td><td>Only p-values / CIs off (small n)</td><td>Q-Q plot</td><td>Usually ignore for large n</td></tr>
    <tr><td><strong>E</strong>qual variance</td><td>Unbiased but standard errors wrong</td><td>Fan shape; Breusch–Pagan p &lt; 0.05</td><td>log(y), weighted least squares, robust SEs</td></tr>
    <tr><td>No multicollinearity</td><td>Coefficients swing, signs flip</td><td>VIF &gt; 10</td><td>Ridge, drop or combine features</td></tr>
  </table>
  <p>The script below builds four fake datasets, one per picture, fits OLS with statsmodels and prints one test number for each problem. It also measures the <strong>VIF</strong> (variance inflation factor: how much a feature is explained by the other features) for two near-copies and one independent column.</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.outliers_influence import variance_inflation_factor
rng = np.random.default_rng(0); n = 200
x = rng.uniform(1, 10, n)
e = rng.normal(0, 1, n); ar1 = np.zeros(n)
for t in range(1, n): ar1[t] = 0.9*ar1[t-1] + e[t]          # each error carries 90% of the last one
cases = {"good":     3 + 2*x + rng.normal(0, 1, n),
         "curved":   3 + 0.5*x**2 + rng.normal(0, 1, n),
         "fan":      3 + 2*x + rng.normal(0, 0.4*x, n),       # noise grows with x
         "autocorr": 3 + 2*np.sort(x) + ar1}
for name, y in cases.items():
    xx = np.sort(x) if name == "autocorr" else x
    X = sm.add_constant(xx); fit = sm.OLS(y, X).fit(); r = fit.resid
    curv = np.corrcoef(r, (xx - xx.mean())**2)[0, 1]
    print(f"{name:9s} R2={fit.rsquared:.3f}  DW={durbin_watson(r):.2f}  "
          f"BP p={het_breuschpagan(r, X)[1]:.3f}  corr(res,x^2)={curv:+.2f}")
x1 = rng.normal(size=n); x2 = x1 + rng.normal(0, 0.1, n); x3 = rng.normal(size=n)
Xv = sm.add_constant(np.c_[x1, x2, x3])
print("VIF:", [float(round(variance_inflation_factor(Xv, i), 1)) for i in range(1, 4)])</div>
  <div class="fx" data-lang="text">good      R2=0.968  DW=2.15  BP p=0.505  corr(res,x^2)=+0.05
curved    R2=0.956  DW=1.96  BP p=0.067  corr(res,x^2)=+0.93
fan       R2=0.846  DW=1.94  BP p=0.000  corr(res,x^2)=-0.01
autocorr  R2=0.897  DW=0.33  BP p=0.272  corr(res,x^2)=+0.30
VIF: [90.0, 89.9, 1.0]</div>
  <p>Read it row by row. "good" passes everything. "curved" has residuals that correlate 0.93 with x²: the smile again. "fan" fails Breusch–Pagan (p = 0.000): the noise grows with x. "autocorr" has Durbin–Watson 0.33, far below 2: each error follows the last. The VIF line shows the two near-copies (about 90) next to a clean column (1.0).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>LINE</strong> assumptions: <strong>L</strong>inear relationship, <strong>I</strong>ndependent errors, <strong>N</strong>ormally distributed errors, <strong>E</strong>qual error variance (homoscedasticity; its failure is heteroscedasticity). Only linearity affects whether the coefficients are right; the others affect standard errors and p-values.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The curved model has R² 0.956 and is still wrong. A high R² never proves the shape is right. Always look at the residual plot. Interviewers often ask "R² is 0.95, are we done?" The answer is "not until I've seen the residuals".</p>
  </div>

  <h2 id="mr-reg"><span class="num">05</span>Ridge, Lasso, Elastic Net</h2>
  <p>Real datasets have problems the six students did not. Two columns may measure almost the same thing (two cholesterol readings, temperature from two sensors). Many columns may be pure noise. OLS then does strange things: it gives huge weights with opposite signs that cancel each other, and the weights change wildly if you add or remove a few rows. Predictions on new data get worse.</p>
  <p>The fix is <strong>regularisation</strong>: add a penalty for big weights to the loss. Now the model must balance "fit the data" against "keep the weights small". It only gives a feature a large weight if the feature really earns it. <strong>Ridge</strong> charges the sum of squared weights. <strong>Lasso</strong> charges the sum of absolute weights. <strong>Elastic Net</strong> charges a mix. The knob α (alpha) sets how strong the penalty is.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You get fixed pocket money to spend on features. Ridge spreads it a little over every feature. Lasso spends it only on the few that matter most and gives the rest nothing. α is how tight the budget is.</p>
  </div>
  <h3>Worked example: shrink one weight by hand</h3>
  <p>With one feature and centred data, ridge has a tiny formula: w = Σ(dx·dy) / (Σdx² + α). For the students that is 73 / (17.5 + α). Lasso (in sklearn's scaling) has another: w = max(73 − 6α, 0) / 17.5, where 6 is the number of rows. It subtracts a fixed amount, and once that amount is bigger than 73 the weight is exactly 0.</p>
  <table class="tbl out"><caption>Slope for marks vs hours as α grows</caption>
    <tr><th>α</th><th>Ridge 73 / (17.5 + α)</th><th>α</th><th>Lasso max(73 − 6α, 0) / 17.5</th></tr>
    <tr><td>0</td><td>4.171 (plain OLS)</td><td>0.5</td><td>4.000</td></tr>
    <tr><td>1</td><td>3.946</td><td>5</td><td>2.457</td></tr>
    <tr><td>17.5</td><td>2.086 (halved)</td><td>12.17</td><td><strong>0.000</strong></td></tr>
    <tr><td>100</td><td>0.621 (small, never 0)</td><td>13</td><td><strong>0.000</strong></td></tr>
  </table>
  <p>The script checks every cell of that table against sklearn's <code>Ridge</code> and <code>Lasso</code>:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Ridge, Lasso
X = np.array([[1], [2], [3], [4], [5], [6]]); y = np.array([52, 55, 61, 62, 70, 72])   # the six students
sxy, sxx, n = 73.0, 17.5, 6                 # from the hand calculation (centred sums)
for a in [0, 1, 17.5, 100]:
    hand = sxy / (sxx + a)
    skl = Ridge(alpha=a).fit(X, y).coef_[0] if a else hand
    print(f"ridge alpha={a:&lt;5} hand w={hand:.3f}  sklearn w={skl:.3f}")
for a in [0.5, 5, 12.17, 13]:
    hand = max(sxy - n * a, 0) / sxx       # soft threshold
    skl = Lasso(alpha=a).fit(X, y).coef_[0]
    print(f"lasso alpha={a:&lt;5} hand w={hand:.3f}  sklearn w={skl:.3f}")</div>
  <div class="fx" data-lang="text">ridge alpha=0     hand w=4.171  sklearn w=4.171
ridge alpha=1     hand w=3.946  sklearn w=3.946
ridge alpha=17.5  hand w=2.086  sklearn w=2.086
ridge alpha=100   hand w=0.621  sklearn w=0.621
lasso alpha=0.5   hand w=4.000  sklearn w=4.000
lasso alpha=5     hand w=2.457  sklearn w=2.457
lasso alpha=12.17 hand w=0.000  sklearn w=0.000
lasso alpha=13    hand w=0.000  sklearn w=0.000</div>
  <p>Hand and library agree. The pattern is the whole story: ridge <em>divides</em> (the weight shrinks but never reaches 0), lasso <em>subtracts</em> (the weight hits 0 and stays there). <code>max(..., 0)</code> is called soft thresholding.</p>
  <h3>On real data: the diabetes dataset</h3>
  <p>442 patients, 10 measurements (age, BMI, blood pressure, six blood tests s1–s6), target = disease progression after a year. s1 and s2 are two cholesterol readings with correlation 0.9. The code standardises every column, fits four models, and prints each weight per one standard deviation of its feature.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
X, y = load_diabetes(return_X_y=True, as_frame=True)          # 442 patients, 10 features
models = {"OLS": LinearRegression(), "Ridge a=10": Ridge(alpha=10),
          "Lasso a=1": Lasso(alpha=1), "ENet a=1 r=.5": ElasticNet(alpha=1, l1_ratio=0.5)}
coefs, cv = {}, {}
for name, m in models.items():
    pipe = make_pipeline(StandardScaler(), m)
    coefs[name] = pipe.fit(X, y)[-1].coef_
    cv[name] = cross_val_score(pipe, X, y, cv=5).mean()
print(pd.DataFrame(coefs, index=X.columns).round(1) + 0.0)
print("5-fold CV R2:", {k: round(float(v), 3) for k, v in cv.items()})</div>
  <table class="tbl out"><caption>Coefficients per 1 SD of each feature (real output)</caption>
    <tr><th>feature</th><th>OLS</th><th>Ridge α=10</th><th>Lasso α=1</th><th>ENet α=1, r=.5</th></tr>
    <tr><td>age</td><td>−0.5</td><td>−0.3</td><td><strong>0.0</strong></td><td>0.6</td></tr>
    <tr><td>sex</td><td>−11.4</td><td>−10.9</td><td>−9.3</td><td>−5.7</td></tr>
    <tr><td>bmi</td><td>24.7</td><td>24.6</td><td>24.8</td><td>18.1</td></tr>
    <tr><td>bp</td><td>15.4</td><td>15.1</td><td>14.1</td><td>11.4</td></tr>
    <tr><td>s1</td><td><strong>−37.7</strong></td><td>−11.3</td><td>−4.8</td><td>−0.2</td></tr>
    <tr><td>s2</td><td><strong>22.7</strong></td><td>1.8</td><td><strong>0.0</strong></td><td>−2.4</td></tr>
    <tr><td>s3</td><td>4.8</td><td>−6.6</td><td>−10.6</td><td>−8.2</td></tr>
    <tr><td>s4</td><td>8.4</td><td>5.6</td><td><strong>0.0</strong></td><td>5.3</td></tr>
    <tr><td>s5</td><td>35.7</td><td>25.3</td><td>24.4</td><td>15.4</td></tr>
    <tr><td>s6</td><td>3.2</td><td>3.5</td><td>2.6</td><td>5.1</td></tr>
    <tr><td><em>5-fold CV R²</em></td><td>0.482</td><td>0.481</td><td>0.482</td><td>0.458</td></tr>
  </table>
  <p>OLS gives the cholesterol twins s1/s2 big opposite weights (−37.7 and +22.7) that mostly cancel. Ridge brings them to −11.3 / +1.8. Lasso sets s2, age and s4 to exactly 0, and the CV score does not drop: those columns were not pulling their weight. <code>pipe.fit(X, y)[-1]</code> picks the last step of the pipeline (the model) so we can read its <code>coef_</code>. Raising α makes lasso keep fewer columns:</p>
  <div class="fx" data-lang="py">for a in [0.1, 1, 5, 10, 20]:
    c = make_pipeline(StandardScaler(), Lasso(alpha=a)).fit(X, y)[-1].coef_
    print(f"lasso alpha={a:&lt;4} nonzero={int((c != 0).sum())}  kept={list(X.columns[c != 0])}")</div>
  <div class="fx" data-lang="text">lasso alpha=0.1  nonzero=9  kept=['age', 'sex', 'bmi', 'bp', 's1', 's2', 's4', 's5', 's6']
lasso alpha=1    nonzero=7  kept=['sex', 'bmi', 'bp', 's1', 's3', 's5', 's6']
lasso alpha=5    nonzero=5  kept=['sex', 'bmi', 'bp', 's3', 's5']
lasso alpha=10   nonzero=4  kept=['bmi', 'bp', 's3', 's5']
lasso alpha=20   nonzero=3  kept=['bmi', 'bp', 's5']</div>
  <p>bmi, bp and s5 survive even α = 20: they are the strongest signals.</p>
  <h3>Correlated twins: who gets the weight?</h3>
  <p>Two temperature sensors that read almost the same value (correlation 0.9999). The target truly depends on temperature with total effect 3 per degree. We refit each model on three random resamples of the rows (bootstrap) to see how stable the weights are.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
temp_a = rng.normal(25, 5, 100)                  # sensor A, degrees C
temp_b = temp_a + rng.normal(0, 0.05, 100)       # sensor B: a near-copy of A
yt = 3 * temp_a + rng.normal(0, 3, 100)          # true total effect: 3 per degree
Xt = np.c_[temp_a, temp_b]
models = {"OLS": LinearRegression(), "Ridge": Ridge(alpha=10),
          "Lasso": Lasso(alpha=1), "ENet": ElasticNet(alpha=1, l1_ratio=0.5)}
for name, m in models.items():
    row = []
    for b in range(3):                           # 3 bootstrap resamples of the rows
        idx = rng.integers(0, 100, 100)
        w = m.fit(Xt[idx], yt[idx]).coef_
        row.append(f"[{w[0]:5.1f}, {w[1]:5.1f}]")
    print(f"{name:6s}", "  ".join(row))</div>
  <div class="fx" data-lang="text">OLS    [ -3.8,   6.8]  [ -3.7,   6.7]  [ -0.4,   3.4]
Ridge  [  1.5,   1.5]  [  1.6,   1.4]  [  1.6,   1.4]
Lasso  [  2.9,   0.0]  [  3.0,   0.0]  [  2.9,   0.0]
ENet   [  1.5,   1.5]  [  1.5,   1.5]  [  1.4,   1.4]</div>
  <p>Each pair always adds to about 3, the true effect. But OLS splits it wildly, with a negative weight on one sensor. Ridge and Elastic Net share it fairly. Lasso gives everything to one twin; which twin wins depends on tiny noise.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ridge (L2)</strong>: minimise RSS + α·Σw². <strong>Lasso (L1)</strong>: minimise RSS + α·Σ|w| (sklearn scales RSS by 1/(2n)). <strong>Elastic Net</strong>: α·[r·Σ|w| + (1−r)/2·Σw²], with r = <code>l1_ratio</code> (0 = ridge, 1 = lasso). α → 0 gives OLS; α → ∞ makes every weight 0, so the model predicts the mean. You trade a little bias for much less variance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Always standardise before ridge or lasso. The penalty treats a weight on "income in rupees" and "age in years" the same way, so units change the answer. Put the scaler inside a <code>Pipeline</code> so cross-validation does not leak. And never pick α by eye: use <code>RidgeCV</code>, <code>LassoCV</code>, <code>ElasticNetCV</code>.</p>
  </div>

  <h2 id="mr-l1"><span class="num">06</span>Why L1 Gives Zeros</h2>
  <p>The table in section 05 showed it with numbers: ridge divides the weight, so it shrinks but never reaches 0; lasso subtracts, so it hits 0. This matters in practice. Lasso can switch features fully off, which makes it a built-in feature selector: give it 200 columns and it may hand back 6. Ridge cannot do that. Interviewers ask "why" almost every time lasso comes up, so it pays to understand it two ways: with a picture and with the pull on each weight.</p>
  <p>The picture: think of the penalty as a budget fence around the origin. Ridge's fence (w₁² + w₂² ≤ t) is a circle. Lasso's fence (|w₁| + |w₂| ≤ t) is a diamond with sharp corners sitting on the axes. The loss is a set of oval rings around the OLS answer. Grow the rings until they first touch the fence. A round fence is touched at a generic spot, where both weights are non-zero. A diamond is usually touched at a corner, and at a corner one weight is exactly 0.</p>
  <figure class="viz"><svg viewBox="0 -8 540 240" width="540">
<line x1="20" y1="120" x2="240" y2="120" stroke="currentColor"/><line x1="130" y1="20" x2="130" y2="210" stroke="currentColor"/>
<text x="236" y="136" class="tm" font-size="12">w₁</text><text x="136" y="206" class="tm" font-size="12">w₂</text>
<path d="M130 70 L180 120 L130 170 L80 120 Z" class="fb sb" fill-opacity="0.35"/>
<ellipse cx="165" cy="40" rx="60" ry="36.9" fill="none" class="sr" stroke-width="2"/>
<ellipse cx="165" cy="40" rx="30" ry="18.5" fill="none" class="sr" stroke-dasharray="3 3"/>
<circle cx="165" cy="40" r="3" class="fr"/><text x="172" y="36" class="tr" font-size="11">OLS ŵ</text>
<circle cx="130" cy="70" r="5" class="fg sg"/><text x="118" y="70" text-anchor="end" class="tg" font-size="12">w₁ = 0 here</text>
<text x="130" y="226" text-anchor="middle" font-size="13">L1: |w₁| + |w₂| ≤ t</text>
<line x1="300" y1="120" x2="520" y2="120" stroke="currentColor"/><line x1="410" y1="20" x2="410" y2="210" stroke="currentColor"/>
<text x="516" y="136" class="tm" font-size="12">w₁</text><text x="416" y="206" class="tm" font-size="12">w₂</text>
<circle cx="410" cy="120" r="50" class="ft st" fill-opacity="0.35"/>
<ellipse cx="445" cy="40" rx="60" ry="35" fill="none" class="sr" stroke-width="2"/>
<ellipse cx="445" cy="40" rx="30" ry="17.5" fill="none" class="sr" stroke-dasharray="3 3"/>
<circle cx="445" cy="40" r="3" class="fr"/><text x="452" y="36" class="tr" font-size="11">OLS ŵ</text>
<circle cx="430" cy="74" r="5" class="fg sg"/><text x="440" y="90" class="tg" font-size="12">both ≠ 0</text>
<text x="410" y="226" text-anchor="middle" font-size="13">L2: w₁² + w₂² ≤ t</text>
</svg><figcaption>Loss contours (red) grow from the OLS solution until they first touch the allowed region. The diamond is usually hit at a corner, where a weight is exactly 0.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>L2 is like a percentage tax: someone earning ₹100 pays ₹10, someone earning ₹10 pays ₹1. Small earners shrink but are never wiped out. L1 is like a fixed fee of ₹500: anyone earning less than ₹500 is left with nothing.</p>
  </div>
  <h3>Worked example: the pull on one weight</h3>
  <p>During training, the penalty pulls each weight toward 0. The L2 pull is the slope of αw², which is 2αw: proportional to the weight. The L1 pull is the slope of α|w|, which is α: the same size no matter how small w is. Take α = 1:</p>
  <table class="tbl out"><caption>Penalty pull on a weight, α = 1</caption>
    <tr><th>current w</th><th>L2 pull 2αw</th><th>L1 pull α</th></tr>
    <tr><td>4</td><td>8</td><td>1</td></tr>
    <tr><td>1</td><td>2</td><td>1</td></tr>
    <tr><td>0.25</td><td>0.5</td><td>1</td></tr>
    <tr><td>0.01</td><td>0.02 (almost nothing)</td><td>1 (still full strength)</td></tr>
  </table>
  <p>For big weights, L2 pulls harder. For small weights, the L2 pull fades away, so a weak weight settles at some small non-zero number. The L1 pull stays at full strength all the way down. If the data's push on a weight is weaker than α, nothing can hold it up and it lands on exactly 0. That is the "subtract 6α" in the lasso formula from section 05: once 6α ≥ 73, the slope is gone.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sparsity</strong>: a weight vector with many exact zeros. L1 regularisation produces sparse solutions; L2 does not. Lasso's update for a single weight is the <strong>soft-threshold</strong> operator: w = sign(ρ)·max(|ρ| − λ, 0) / Σx².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Lasso's selection is unstable with correlated features: of two twins it keeps one, and which one can flip between runs (the [2.9, 0.0] row above). Do not tell a stakeholder "s2 doesn't matter" because lasso zeroed it. Use Elastic Net to keep groups together, or check stability over bootstrap resamples.</p>
  </div>

  <h2 id="mr-poly"><span class="num">07</span>Polynomial Regression &amp; Overfitting</h2>
  <p>Many relationships are curved. Fuel use rises faster at high speed. Ice-cream sales rise with temperature, then fall in a heatwave. A straight line cannot follow a curve, however you tilt it; the residual smile in section 04 was exactly that failure.</p>
  <p>The trick is to keep using linear regression but give it new columns: x², x³, or products like x₁·x₂. The model is still "weights times columns, added up", so all the OLS machinery still works. Only the columns are curved. This is <strong>polynomial regression</strong>. The danger is that with enough columns the curve can bend to pass through every noisy point, which looks perfect on training data and is useless on new data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Degree 15 is a student who memorises last year's question paper word by word. Full marks on that paper, poor marks on a new one. Degree 3 is the student who learnt the concept.</p>
  </div>
  <h3>Worked example: fix the curved data from section 04</h3>
  <p>Back to x = 1…5, y = x². Add a column x² next to x. Now the table has two columns: x = [1, 2, 3, 4, 5] and x² = [1, 4, 9, 16, 25]. Linear regression must find y = w₀ + w₁·x + w₂·x². By eye: w₀ = 0, w₁ = 0, w₂ = 1 fits every point exactly. Let sklearn confirm:</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import PolynomialFeatures
x5 = np.array([[1], [2], [3], [4], [5]]); y5 = np.array([1, 4, 9, 16, 25])
Xp = PolynomialFeatures(degree=2, include_bias=False).fit_transform(x5)
print(Xp)
m = LinearRegression().fit(Xp, y5)
print("weights", m.coef_.round(3) + 0.0, "intercept", round(m.intercept_, 3) + 0.0)
print("predict x=6:", m.predict([[6, 36]]).round(2))</div>
  <div class="fx" data-lang="text">[[ 1.  1.]
 [ 2.  4.]
 [ 3.  9.]
 [ 4. 16.]
 [ 5. 25.]]
weights [0. 1.] intercept 0.0
predict x=6: [36.]</div>
  <p><code>PolynomialFeatures(degree=2)</code> built the x and x² columns. The fitted weights are 0 on x and 1 on x²: the exact curve, and the residuals that formed a smile are now all 0. It predicts 36 for x = 6, which is right.</p>
  <h3>Too much of a good thing</h3>
  <p>Now 20 noisy points from a sine wave, and four degrees. We measure RMSE on the 20 training points and on 1,000 fresh test points.</p>
  <figure class="viz"><svg viewBox="0 0 540 230" width="540">
<defs><clipPath id="mr-clip"><rect x="20" y="5" width="500" height="200"/></clipPath></defs>
<line x1="30" y1="110" x2="510" y2="110" stroke="currentColor" stroke-dasharray="2 4"/>
<polyline clip-path="url(#mr-clip)" points="30,82 37,83 44,84 51,85 58,86 65,87 72,88 79,89 86,90 93,91 100,93 107,94 113,95 120,96 127,97 134,98 141,99 148,100 155,101 162,102 169,103 176,104 183,105 190,106 197,107 204,109 211,110 218,111 225,112 232,113 239,114 246,115 253,116 260,117 267,118 273,119 280,120 287,121 294,122 301,123 308,124 315,126 322,127 329,128 336,129 343,130 350,131 357,132 364,133 371,134 378,135 385,136 392,137 399,138 406,139 413,140 420,141 427,143 433,144 440,145 447,146 454,147 461,148 468,149 475,150 482,151 489,152 496,153 503,154 510,155" fill="none" class="sb" stroke-width="2"/>
<polyline clip-path="url(#mr-clip)" points="30,109 37,101 44,93 51,87 58,81 65,75 72,71 79,67 86,64 93,61 100,59 107,57 113,56 120,55 127,55 134,56 141,56 148,57 155,59 162,61 169,63 176,65 183,68 190,71 197,75 204,78 211,82 218,86 225,90 232,94 239,98 246,102 253,107 260,111 267,115 273,120 280,124 287,128 294,132 301,136 308,140 315,144 322,147 329,150 336,153 343,156 350,159 357,161 364,162 371,164 378,165 385,166 392,166 399,166 406,165 413,164 420,162 427,160 433,157 440,154 447,150 454,145 461,139 468,133 475,127 482,119 489,111 496,102 503,92 510,81" fill="none" class="sg" stroke-width="2"/>
<polyline clip-path="url(#mr-clip)" points="30,105 37,101 44,96 51,92 58,86 65,81 72,75 79,69 86,63 93,58 100,54 107,50 113,47 120,46 127,45 134,46 141,48 148,51 155,54 162,58 169,63 176,68 183,73 190,77 197,82 204,86 211,90 218,94 225,97 232,100 239,102 246,105 253,108 260,111 267,114 273,118 280,122 287,126 294,131 301,136 308,142 315,147 322,152 329,157 336,161 343,164 350,166 357,167 364,166 371,165 378,163 385,160 392,158 399,156 406,154 413,154 420,154 427,156 433,158 440,160 447,159 454,154 461,143 468,125 475,98 482,64 489,28 496,3 503,10 510,85" fill="none" class="sr" stroke-width="2"/>
<path d="M30 112h0M38 82h0M46 109h0M50 90h0M114 46h0M159 54h0M174 70h0M233 100h0M290 132h0M291 121h0M321 161h0M336 155h0M380 167h0M380 156h0M420 157h0M422 154h0M442 164h0M444 154h0M468 126h0M510 85h0" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
<text x="40" y="226" class="tb" font-size="12">degree 1 (underfit)</text><text x="200" y="226" class="tg" font-size="12">degree 3 (good)</text><text x="340" y="226" class="tr" font-size="12">degree 15 (chases noise)</text>
</svg><figcaption>20 noisy points from a sine wave. Degree 15 bends to hit points, especially at the edges.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.metrics import mean_squared_error
rng = np.random.default_rng(0)
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1          # 20 training points
ys = np.sin(2*np.pi*x) + rng.normal(0, 0.3, 20)
xt = rng.uniform(0, 1, 1000); yt = np.sin(2*np.pi*xt) + rng.normal(0, 0.3, 1000)   # test
def rmse(m, a, b): return mean_squared_error(b, m.predict(a[:, None])) ** 0.5
for d in [1, 3, 9, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x[:, None], ys)
    print(f"degree {d:2d}         train RMSE {rmse(m, x, ys):.2f}  test RMSE {rmse(m, xt, yt):.2f}")
m = make_pipeline(PolynomialFeatures(15), StandardScaler(), Ridge(alpha=0.1)).fit(x[:, None], ys)
print(f"degree 15 + Ridge train RMSE {rmse(m, x, ys):.2f}  test RMSE {rmse(m, xt, yt):.2f}")
print("features from 10 inputs, degree 2/3/5:",
      [PolynomialFeatures(d, include_bias=False).fit(np.zeros((1, 10))).n_output_features_ for d in (2, 3, 5)])</div>
  <div class="fx" data-lang="text">degree  1         train RMSE 0.53  test RMSE 0.58
degree  3         train RMSE 0.16  test RMSE 0.33
degree  9         train RMSE 0.15  test RMSE 0.34
degree 15         train RMSE 0.12  test RMSE 0.55
degree 15 + Ridge train RMSE 0.25  test RMSE 0.37
features from 10 inputs, degree 2/3/5: [65, 285, 3002]</div>
  <p>Train error keeps falling as degree rises (0.53 → 0.12). Test error falls, then climbs back (0.33 → 0.55): the U-shape of overfitting. Adding <code>Ridge</code> to degree 15 pulls test RMSE back to 0.37. The last line shows the column explosion: 10 inputs at degree 3 already make 285 columns. <code>x[:, None]</code> turns the 1-D array into the 2-D table sklearn wants.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Polynomial regression</strong>: linear regression on polynomial features (x, x², …, and cross terms). It is still a <em>linear model</em> because it is linear in the weights. <strong>Overfitting</strong>: low training error, high test error, because the model learned noise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>High-degree polynomials explode outside the training range and near its edges. Keep degree ≤ 2–3, always regularise, scale after <code>PolynomialFeatures</code> (x¹⁵ is tiny or huge), and prefer trees or splines for complex shapes.</p>
  </div>

  <h2 id="mr-build"><span class="num">08</span>Hands-on: When Regularisation Pays</h2>
  <p>On the clean diabetes data, OLS, ridge and lasso all scored the same CV R² (≈ 0.48). So is regularisation just theory? No. It pays when you have many columns compared to rows, or many useless columns, which is normal at work: a feature store hands you 200 columns and most are noise for your target. Here we simulate that by adding 200 columns of pure random numbers to the 10 real ones, then compare four models on a held-out test set.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket selector watching 210 players, of whom 10 can actually play. OLS picks everyone and gives each a role. Ridge picks everyone but gives the dud players tiny roles. Lasso sends most of them home.</p>
  </div>
  <p>What to expect, step by step: (1) split 442 rows into 331 train and 111 test; (2) OLS must fit 210 weights from 331 rows, so it will memorise noise; (3) the CV versions pick their own α on the training rows only; (4) we count how many weights each model left non-zero.</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import train_test_split
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV
from sklearn.metrics import r2_score
models = {"OLS": LinearRegression(),
          "RidgeCV": RidgeCV(alphas=np.logspace(-3, 3, 13)),
          "LassoCV": LassoCV(cv=5, random_state=0),
          "ElasticCV": ElasticNetCV(l1_ratio=[.2, .5, .8, 1], cv=5, random_state=0)}
rng = np.random.default_rng(0)
Xn = np.c_[X.values, rng.normal(size=(len(X), 200))]          # 10 real + 200 noise
Xtr, Xte, ytr, yte = train_test_split(Xn, y, test_size=0.25, random_state=42)
for name, m in models.items():
    p = make_pipeline(StandardScaler(), m).fit(Xtr, ytr)
    print(f"{name:10s} test R2 {r2_score(yte, p.predict(Xte)):.3f}  "
          f"nonzero coefs {int((p[-1].coef_ != 0).sum())}/210")
print("ElasticNetCV picked l1_ratio =", p[-1].l1_ratio_)
lasso = make_pipeline(StandardScaler(), LassoCV(cv=5, random_state=0)).fit(Xtr, ytr)[-1]
print("Lasso kept columns:", np.flatnonzero(lasso.coef_).tolist())</div>
  <div class="fx" data-lang="text">OLS        test R2 -0.258  nonzero coefs 210/210
RidgeCV    test R2 0.366  nonzero coefs 210/210
LassoCV    test R2 0.485  nonzero coefs 6/210
ElasticCV  test R2 0.485  nonzero coefs 6/210
ElasticNetCV picked l1_ratio = 1.0
Lasso kept columns: [2, 3, 6, 8, 132, 140]</div>
  <p>OLS scores −0.258 on test: worse than predicting the average for everyone. Ridge recovers to 0.366 but still carries 210 weights. Lasso keeps 6 columns and scores 0.485, the same as the 10-real-feature models score without any noise (0.485–0.487 when rerun on the real columns only). The kept columns 2, 3, 6, 8 are bmi, bp, s3, s5, the strongest real signals; two noise columns (132, 140) slipped in by chance. ElasticNetCV chose <code>l1_ratio=1.0</code>, pure lasso, because sparsity is what this data needs. <code>np.flatnonzero</code> lists the indexes of non-zero weights.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RidgeCV / LassoCV / ElasticNetCV</strong>: models that try a grid of α (and <code>l1_ratio</code>) values with internal cross-validation on the training data, then refit with the best one. The chosen value is stored in <code>alpha_</code> (and <code>l1_ratio_</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Lasso picked these features, so they cause the outcome" is wrong twice: lasso can admit noise columns (132 and 140 here) and can drop a real feature that has a correlated twin. Treat lasso's selection as a shortlist to investigate, not a finding.</p>
  </div>

  <h2 id="mr-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: judging the model by training R²</span>
    <p>Training R² never goes down when you add columns. The 210-column OLS above looks great on train and scores −0.258 on test. Report test or cross-validated scores.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting R² without the residual plot</span>
    <p>y = x² fit by a straight line scored R² 0.963 with residuals +, −, −, −, +. A pattern in residuals means the form is wrong, whatever R² says.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: inverting XᵀX</span>
    <p><code>np.linalg.inv</code> on a near-singular matrix returns huge, meaningless weights. Use <code>lstsq</code>, <code>solve</code> or just <code>LinearRegression</code>; for collinear features use ridge.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: regularising unscaled features</span>
    <p>Ridge and lasso penalise raw weight sizes, so units change which features get shrunk. Scale first, inside a <code>Pipeline</code>, so each CV fold fits its own scaler.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading coefficients as causes</span>
    <p>"s1 has weight −37.7, so cholesterol protects you" is wrong: it is cancelling its twin s2. Coefficients of correlated features are unstable and only mean "holding the others fixed", which may be impossible in real life.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: extrapolating</span>
    <p>The student line predicts 76.6 marks for 7 hours, and would predict 130 marks for 20 hours. A model is only trustworthy inside the range of data it saw, especially polynomial fits.</p>
  </div>

  <h2 id="mr-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Fit a line by hand to (1,2), (2,4), (3,5). What are the slope and intercept?</summary><div class="qa-body">x̄ = 2, ȳ = 11/3. dx = −1, 0, 1; dy = −5/3, 1/3, 4/3. Σdx·dy = 5/3 + 0 + 4/3 = 3, Σdx² = 2, so slope = 1.5. Intercept = 11/3 − 1.5·2 = 2/3 ≈ 0.667. Line: ŷ = 0.667 + 1.5x.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the normal equation, and when would you not use it?</summary><div class="qa-body">w = (XᵀX)⁻¹Xᵀy, from setting the gradient of the squared loss to zero. Avoid it when d is very large (O(d³) solve), when data doesn't fit in memory (use mini-batch GD), or when XᵀX is singular from perfectly correlated features (use ridge: (XᵀX + αI)⁻¹Xᵀy). In code use an SVD-based solver (<code>lstsq</code>), not an explicit inverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>R² is 0.97, RMSE is 1.26. Explain both to a manager.</summary><div class="qa-body">RMSE: "our predictions are typically off by about 1.3 marks." R²: "the model removes 97% of the error you'd make by guessing the class average for everyone." Then add: "measured on held-out data", or it means little.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are OLS residuals always uncorrelated with the fitted values?</summary><div class="qa-body">ŷ is the orthogonal projection of y onto the column space of X, so Xᵀ(y − ŷ) = 0. The residual vector is perpendicular to every column and hence to ŷ = Xw. It's a consequence of the fit, not evidence the model is good.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List the OLS assumptions. Which violation matters most in practice?</summary><div class="qa-body">LINE: linearity, independent errors, normal errors, equal variance (plus no severe multicollinearity). Linearity violations bias the coefficients. Independence violations (time series) leave coefficients unbiased but shrink standard errors, so everything looks significant: check Durbin–Watson. Normality matters least.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your residual plot fans out as fitted values grow. What is it and what do you do?</summary><div class="qa-body">Heteroscedasticity. Estimates stay unbiased but standard errors are wrong. Fixes: log-transform a right-skewed target, weighted least squares, or robust (HC) standard errors. Confirm with Breusch–Pagan (p was 0.000 in the fan example).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ridge vs lasso vs elastic net: how do you choose?</summary><div class="qa-body">Ridge: most features matter, some are correlated, you want stable coefficients. Lasso: you suspect many features are useless and want automatic selection. Elastic net: many correlated features and you still want sparsity; it keeps correlated groups together. Always tune α (and l1_ratio) with CV.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 produce exact zeros but L2 doesn't?</summary><div class="qa-body">Geometry: the L1 ball is a diamond with corners on the axes, and expanding loss contours usually touch it at a corner, where some weights are 0. Pull: L1's pull is a constant α down to zero, L2's pull 2αw fades as w shrinks. Formula: ridge divides (73/(17.5+α)), lasso subtracts (max(73 − 6α, 0)/17.5).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are 0.9999 correlated. What happens to OLS, ridge and lasso coefficients?</summary><div class="qa-body">OLS: unstable, large opposite-signed weights that change with every resample ([−3.8, 6.8] then [−0.4, 3.4]). Ridge: splits the effect evenly ([1.5, 1.5]). Lasso: gives it all to one ([2.9, 0.0]) and which one is arbitrary. Elastic net behaves like ridge on the pair.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you scale features before ridge or lasso but not for plain OLS?</summary><div class="qa-body">OLS predictions are unchanged by rescaling a feature (its weight just rescales). The penalty sums raw weights, so a feature measured in small units needs a big weight and gets punished more. Standardising puts every weight on the same footing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is polynomial regression a linear model? How many features does degree 3 on 10 inputs create?</summary><div class="qa-body">Yes: it's linear in the weights; only the features are non-linear. PolynomialFeatures(3, include_bias=False) on 10 inputs gives 285 columns, so pair it with ridge or prefer trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>LinearRegression().fit([[1],[2],[3]], [2,4,6]).coef_</code></summary><div class="qa-body"><code>array([2.])</code> with intercept ≈ 0: the points lie exactly on y = 2x, so every residual is 0 and R² = 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training R² is 0.99 and test R² is negative. What happened?</summary><div class="qa-body">Overfitting: too many features (or polynomial terms) for the rows, so the model fits noise. Negative R² means worse than predicting the mean, as with OLS on 210 features / 331 rows (−0.258). Fix with regularisation (lasso recovered 0.485), fewer features, or more data.</div></details>
</main>`
});
