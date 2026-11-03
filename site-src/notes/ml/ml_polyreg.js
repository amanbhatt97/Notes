// notes/ml/ml_polyreg.js — Polynomial & Basis Functions
Object.assign(TOPIC_CONTENT, {
  "ml_polyreg": `<main>
  <h1>Polynomial Regression &amp; Basis Functions</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Polynomial &amp; Basis Functions</span></div>
  <p class="lead">Linear regression can only draw straight lines, but many real relationships bend: a flat's price climbs faster than its floor area, a car's stopping distance grows faster than its speed, and sales flatten once a market is saturated. This note shows that you do not need a new algorithm to fit curves. You give ordinary linear regression some new, made-up columns, such as size², size × bedrooms or "how far past 1,100 sq ft is this flat", and it finds their weights exactly as before. That one trick explains polynomial regression, interaction terms, splines and much of what later models do automatically, and it brings three new problems with it: overfitting, unstable numbers and too many columns. The running example is the same six houses used in <a class="xref" data-note="ml_regression">Linear Regression</a> (sizes 600 to 1,600 sq ft, prices 28 to 100 lakh), and a small noisy sine wave shows the same ideas when we need more data than six rows.</p>

  <h2 id="pr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Polynomial &amp; Basis Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The trick</div>
        <ul>
          <li>Curved data + straight line → residuals with a pattern (a "smile")</li>
          <li>Add columns x², x³, a·b … then run plain linear regression</li>
          <li>Still a <b>linear model</b>: linear in the weights, not in x</li>
          <li>Houses: SSE 34 (line) → 9.89 (quadratic)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Problems it creates</div>
        <ul>
          <li>Column count C(k + d, d) − 1 explodes with inputs k and degree d</li>
          <li>High degree → overfitting, wild edges, absurd extrapolation</li>
          <li>x and x² are highly correlated (0.991) → centre / standardise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Other columns</div>
        <ul>
          <li><b>Interaction</b> a·b: one input changes another's slope</li>
          <li><b>Steps</b>, <b>hinges</b> max(0, x − c), <b>splines</b>, <b>RBF</b> bumps</li>
          <li>Local bases bend only where needed and behave at the edges</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control</div>
        <ul>
          <li>Choose degree / knots by <b>cross-validation</b>, never training error</li>
          <li>Or keep many columns and add a <b>ridge / lasso</b> penalty</li>
          <li>Always: scaler + features + model in one pipeline</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When a Straight Line Is Not Enough</span><span class="rm-sub">the houses' residual pattern</span></div></div>
      <div class="rm-item rm-done" data-target="pr-trick"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">New Columns, Same Linear Regression</span><span class="rm-sub">fitting a curve with the tools you have</span></div></div>
      <div class="rm-item rm-done" data-target="pr-features"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Polynomial Features</span><span class="rm-sub">which columns, and how many</span></div></div>
      <div class="rm-item rm-done" data-target="pr-overfit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Degree and Overfitting</span><span class="rm-sub">why more bends can be worse</span></div></div>
      <div class="rm-item rm-done" data-target="pr-scale"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Scaling and Collinearity of Powers</span><span class="rm-sub">why powers must be centred</span></div></div>
      <div class="rm-item rm-done" data-target="pr-inter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Interaction Terms</span><span class="rm-sub">when one input changes another's effect</span></div></div>
      <div class="rm-item rm-done" data-target="pr-basis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Basis Functions</span><span class="rm-sub">steps, hinges, splines and bumps</span></div></div>
      <div class="rm-item rm-done" data-target="pr-cv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing the Degree by Cross-Validation</span><span class="rm-sub">scoring each degree on unseen rows</span></div></div>
      <div class="rm-item rm-done" data-target="pr-reg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Taming High Degrees with Regularization</span><span class="rm-sub">many columns, small weights</span></div></div>
      <div class="rm-item rm-done" data-target="pr-compare"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Polynomials, Splines or Trees?</span><span class="rm-sub">picking the right curve model</span></div></div>
      <div class="rm-item rm-done" data-target="pr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, extrapolation, leakage</span></div></div>
      <div class="rm-item rm-done" data-target="pr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="pr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about curves</span></div></div>
    </div>
  </div>

  <h2 id="pr-need"><span class="num">01</span>When a Straight Line Is Not Enough</h2>
  <p>A property dealer has sold six flats and wants a rule that turns floor area into a price. Here is the data. Size is in hundreds of square feet (so 6 means 600 sq ft) and price is in lakh rupees:</p>
  <table class="tbl">
    <tr><th>house</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th></tr>
    <tr><td>size (hundreds of sq ft)</td><td>6</td><td>8</td><td>10</td><td>12</td><td>14</td><td>16</td></tr>
    <tr><td>price (lakh ₹)</td><td>28</td><td>40</td><td>53</td><td>66</td><td>79</td><td>100</td></tr>
    <tr><td>increase from previous house</td><td>–</td><td>+12</td><td>+13</td><td>+13</td><td>+13</td><td>+21</td></tr>
  </table>
  <p>The last row already hints at something. Each extra 200 sq ft adds about 12 or 13 lakh, except the last step, which adds 21. Bigger flats seem to cost more per square foot, which is believable: large flats are rarer and usually come with better finishes. Linear regression, which we learned in <a class="xref" data-note="ml_regression">Linear Regression</a>, assumes the opposite. Its model is ŷ = b₀ + b₁·x, which says that every extra unit of x adds the <em>same</em> amount b₁ to the prediction, whether the flat is small or large. Let us fit it anyway and look at what it gets wrong.</p>
  <div class="fx" data-lang="py">import numpy as np
size = np.array([6, 8, 10, 12, 14, 16.0])       # houses A-F, hundreds of sq ft
price = np.array([28, 40, 53, 66, 79, 100.0])   # lakh rupees
w, b = np.polyfit(size, price, 1)               # best straight line
res = price - (b + w * size)
print(f"line: price = {b:.1f} + {w:.1f} * size")
print("residuals:", res.round(2) + 0.0)
print(f"SSE {res @ res:.1f}   R2 {1 - res @ res / ((price - price.mean()) @ (price - price.mean())):.4f}")</div>
  <div class="fx" data-lang="text">line: price = -16.0 + 7.0 * size
residuals: [ 2.  0. -1. -2. -3.  4.]
SSE 34.0   R2 0.9902</div>
  <p>The best line is price = −16 + 7·size, and its R² of 0.990 looks excellent. But read the residuals (actual price minus predicted price) in order from the smallest flat to the largest: +2, 0, −1, −2, −3, +4. The line is too low at both ends and too high in the middle. If the errors were just random noise, their signs would be mixed up with no pattern. A run of signs like this is a message: the true relationship bends, and the line cannot follow the bend however we tilt it. Plotted against size, these residuals form a "smile", the classic fingerprint of a curve that a straight line has missed.</p>
  <figure class="viz"><svg viewBox="0 0 520 270" width="520">
<line x1="60" y1="230" x2="500" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="186" text-anchor="end" class="tm" font-size="11">25</text><text x="52" y="139" text-anchor="end" class="tm" font-size="11">50</text><text x="52" y="91" text-anchor="end" class="tm" font-size="11">75</text><text x="52" y="43" text-anchor="end" class="tm" font-size="11">100</text>
<text x="123" y="246" text-anchor="middle" class="tm" font-size="11">6</text><text x="186" y="246" text-anchor="middle" class="tm" font-size="11">8</text><text x="249" y="246" text-anchor="middle" class="tm" font-size="11">10</text><text x="311" y="246" text-anchor="middle" class="tm" font-size="11">12</text><text x="374" y="246" text-anchor="middle" class="tm" font-size="11">14</text><text x="437" y="246" text-anchor="middle" class="tm" font-size="11">16</text>
<text x="280" y="264" text-anchor="middle" class="tm" font-size="11.5">size (hundreds of sq ft)</text><text x="66" y="16" class="tm" font-size="11.5">price (lakh ₹)</text>
<line x1="91" y1="194" x2="469" y2="33" class="sr" stroke-width="2"/>
<polyline points="91,184 107,180 123,175 139,170 154,165 170,160 186,155 201,149 217,143 233,137 249,131 264,125 280,118 296,111 311,104 327,97 343,90 359,82 374,74 390,67 406,58 421,50 437,42 453,33 469,24" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="123" cy="177" r="5" class="ft st"/><circle cx="186" cy="154" r="5" class="ft st"/><circle cx="249" cy="129" r="5" class="ft st"/><circle cx="311" cy="104" r="5" class="ft st"/><circle cx="374" cy="79" r="5" class="ft st"/><circle cx="437" cy="39" r="5" class="ft st"/>
<text x="113" y="170" text-anchor="end" font-size="11">A</text><text x="427" y="34" text-anchor="end" font-size="11">F</text><text x="384" y="92" font-size="11">E</text>
<text x="80" y="40" class="tr" font-size="12.5">line ŷ = −16 + 7x   (SSE 34)</text>
<text x="80" y="58" class="tb" font-size="12.5">curve ŷ = 5.96 + 2.58x + 0.2009x²   (SSE 9.89)</text>
</svg><figcaption>The six houses. The red line is a little too low at A and F and too high at C, D, E. The blue quadratic of section 02 bends upward to follow the price climb of the big flats.</figcaption></figure>
  <p>The picture shows the problem. The red straight line cuts through the middle of the points, sitting slightly above the middle flats and below the end ones. The blue curve, which we will fit in the next section, bends upward and passes close to every flat.</p>
  <p>Think of trying to trace the arc of a thrown cricket ball with a ruler. However you hold the ruler, it is above the ball in the middle of the flight and below it at the ends. The ruler is not badly placed; it is simply the wrong tool. A relationship is called <strong>nonlinear</strong> in x when the change in y caused by one more unit of x depends on where you are, and the tell-tale sign in a fitted linear model is a pattern in the residuals. The lesson to keep: a high R² does not prove that a relationship is straight. This line has R² 0.990 and is still systematically wrong at both ends, which is exactly where the dealer's most expensive flats are. Always look at the residuals, as described in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>

  <h2 id="pr-trick"><span class="num">02</span>New Columns, Same Linear Regression</h2>
  <p>We need a curve, but we do not want to throw away everything we know about linear regression: least squares, the normal equation, standard errors, p-values and all the diagnostics. The good news is that we do not have to. Linear regression only ever does one thing: it multiplies each <em>column</em> of the table by a weight and adds the results. It does not know or care where the columns came from. So we can invent a new column, size², put it next to size, and let linear regression find a weight for it. The model becomes</p>
  <p style="text-align:center"><strong>ŷ = b₀ + b₁·x + b₂·x²</strong></p>
  <p>As a function of x this is a parabola, a curve. But as a function of the weights b₀, b₁ and b₂ it is still "weight times column, added up", which is exactly the form least squares knows how to solve. Nothing in the fitting changes; only the table changes, because it now has an extra column whose values are 36, 64, 100, 144, 196 and 256. This is called <strong>polynomial regression</strong>: linear regression on the columns x, x², …, x<sup>d</sup>, where d is called the <strong>degree</strong>. It is still a <strong>linear model</strong>, because "linear" in that phrase always meant linear in the weights, never "a straight line in x".</p>
  <p>Think of a tailor who can only cut straight strips of cloth. He can still make a round collar if you hand him pre-curved strips: he only has to decide how much of each strip to use. Linear regression is the tailor, and x², x³ and the other new columns are the pre-curved strips.</p>
  <p>Let us fit the quadratic by hand. The direct route is the normal equation (XᵀX)b = Xᵀy with three columns [1, x, x²], which produces a 3 × 3 system with entries such as Σx⁴ = 140,080. It can be solved, but the numbers are already large for sizes no bigger than 16, and that is a warning we will return to in section 05. There is a much neater route, and it teaches the most important practical habit of this note: <strong>centre x first</strong>, meaning subtract its average before squaring.</p>
  <p>The average size is 11, so let z = size − 11, which gives z = −5, −3, −1, 1, 3, 5. Then z² = 25, 9, 1, 1, 9, 25. Instead of z² we use q = 3z² − 35 = 40, −8, −32, −32, −8, 40, which is just z² shifted so that it sums to zero and multiplied by 3 to keep whole numbers. Now three facts hold: Σz = 0, Σq = 0 and Σz·q = 0. Columns whose products sum to zero like this are called <strong>orthogonal</strong>: they share no information, so each weight can be found on its own with one division, weight = Σ(column × y) / Σ(column²).</p>
  <table class="tbl">
    <tr><th>column</th><th>values</th><th>Σ column × price</th><th>Σ column²</th><th>weight</th></tr>
    <tr><td>1</td><td>1, 1, 1, 1, 1, 1</td><td>366</td><td>6</td><td>61</td></tr>
    <tr><td>z</td><td>−5, −3, −1, 1, 3, 5</td><td>490</td><td>70</td><td>7</td></tr>
    <tr><td>q = 3z² − 35</td><td>40, −8, −32, −32, −8, 40</td><td>360</td><td>5,376</td><td>0.06696</td></tr>
  </table>
  <p>So ŷ = 61 + 7z + 0.06696·(3z² − 35). Multiplying out, 0.06696 × 3 = 0.2009 and 0.06696 × 35 = 2.344, which gives <strong>ŷ = 58.66 + 7z + 0.2009z²</strong>. Notice that the weight on z is exactly the slope of the straight line, 7: because the new column is orthogonal to the old ones, adding it did not disturb them. The code checks both routes:</p>
  <div class="fx" data-lang="py"># route 1: raw columns [1, size, size^2] and the normal equation
X = np.c_[np.ones(6), size, size**2]
print("X^T X =", (X.T @ X).astype(int).tolist())
print("w (raw) =", np.linalg.solve(X.T @ X, X.T @ price).round(4))

# route 2: centred, orthogonal columns [1, z, 3z^2 - 35]
z = size - 11
q = 3 * z**2 - 35
for name, col in [("1", np.ones(6)), ("z", z), ("3z^2-35", q)]:
    print(f"{name:8s} sum(col*y)={col @ price:5.0f}  sum(col^2)={col @ col:5.0f}  weight={col @ price / (col @ col):.5f}")</div>
  <div class="fx" data-lang="text">X^T X = [[6, 66, 796], [66, 796, 10296], [796, 10296, 140080]]
w (raw) = [5.9643 2.5804 0.2009]
1        sum(col*y)=  366  sum(col^2)=    6  weight=61.00000
z        sum(col*y)=  490  sum(col^2)=   70  weight=7.00000
3z^2-35  sum(col*y)=  360  sum(col^2)= 5376  weight=0.06696</div>
  <p>The raw normal equation gives weights 5.96, 2.58 and 0.2009, and the orthogonal columns give 61, 7 and 0.06696, exactly the hand table. These look different but describe the same curve: substitute z = size − 11 into 58.66 + 7z + 0.2009z² and multiply out, and you get 5.96 + 2.58·size + 0.2009·size². The raw form describes the curve around size 0; the centred form describes it around size 11, the middle of the data.</p>
  <p>In everyday work you do not build the columns by hand. scikit-learn's <code>PolynomialFeatures</code> creates them, and <code>LinearRegression</code> fits the weights as usual. <code>size[:, None]</code> turns the list of sizes into a one-column table, and <code>include_bias=False</code> leaves out a column of 1s because <code>LinearRegression</code> adds its own intercept:</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

X2 = PolynomialFeatures(degree=2, include_bias=False).fit_transform(size[:, None])
print(X2[:3])                                    # columns: size, size^2
m = LinearRegression().fit(X2, price)
r = price - m.predict(X2)
print("intercept", round(m.intercept_, 4), " weights", m.coef_.round(4))
print("residuals", r.round(2), " SSE", round(r @ r, 2))
print("1,800 sq ft: curve", m.predict([[18, 324]]).round(2), " line", np.polyval(np.polyfit(size, price, 1), 18).round(2))</div>
  <div class="fx" data-lang="text">[[  6.  36.]
 [  8.  64.]
 [ 10. 100.]]
intercept 5.9643  weights [2.5804 0.2009]
residuals [-0.68  0.54  1.14  0.14 -2.46  1.32]  SSE 9.89
1,800 sq ft: curve [117.5]  line 110.0</div>
  <p>The first three rows show the new table: each row now holds size and size². The weights match the hand calculation, the residuals are −0.68, 0.54, 1.14, 0.14, −2.46, 1.32, and the sum of squared errors (SSE) falls from 34 to 9.89. The residual signs are now mixed, so the smile is gone. For an 1,800 sq ft flat the line predicts 110 lakh and the curve 117.5 lakh, because the curve continues the upward bend the data showed.</p>
  <p>Because this <em>is</em> linear regression, statsmodels gives the full statistical summary too. In its formula language <code>I(...)</code> means "compute this expression as a new column":</p>
  <div class="fx" data-lang="py">import statsmodels.formula.api as smf
houses = pd.DataFrame({"size": size, "price": price})
fit = smf.ols("price ~ size + I(size**2)", data=houses).fit()    # I(...) = "compute this column"
print(fit.params.round(4).to_dict())
print("p-value of the size^2 term:", round(fit.pvalues["I(size ** 2)"], 4))
cfit = smf.ols("price ~ I(size - 11) + I((size - 11)**2)", data=houses).fit()
print("centred:", cfit.params.round(4).to_dict())</div>
  <div class="fx" data-lang="text">{'Intercept': 5.9643, 'size': 2.5804, 'I(size ** 2)': 0.2009}
p-value of the size^2 term: 0.0735
centred: {'Intercept': 58.6562, 'I(size - 11)': 7.0, 'I((size - 11) ** 2)': 0.2009}</div>
  <p>The same three weights appear, and the centred formula gives 58.66, 7 and 0.2009 directly. The p-value of 0.0735 for the size² term says that, with only six houses, the curvature is suggestive but not proven at the usual 5% level. Every column of the summary you learned for linear regression (standard error, t, confidence interval) applies unchanged.</p>
  <p>There is one new thing to learn about reading a curved model. In a straight line, b₁ is "the effect of one more unit of x". In a curve there is no single effect, because the slope changes along the curve. The slope at any point is the derivative: for ŷ = 58.66 + 7z + 0.2009z² it is 7 + 2 × 0.2009·z = 7 + 0.402z. At 600 sq ft (z = −5) that is 4.99 lakh per extra 100 sq ft; at the average flat of 1,100 sq ft (z = 0) it is 7.0; at 1,600 sq ft (z = 5) it is 9.01. So in the centred model, b₁ = 7 means "the slope at the average flat", which is useful. In the raw model, b₁ = 2.58 means "the slope at a flat of 0 sq ft", which is meaningless. This is a second reason to centre: it makes the coefficients readable.</p>
  <p>Hold on to the big idea of this section, because the rest of the note builds on it: <strong>to fit a curve, change the table, not the algorithm</strong>. Whatever you can do to a column (scale it, select it, penalise its weight, put it in a pipeline) you can do to x² and x³.</p>

  <h2 id="pr-features"><span class="num">03</span>Polynomial Features</h2>
  <p>With one input, "degree 2" simply means adding x². The dealer's sheet also records bedrooms, and with two or more inputs the word "polynomial" covers more: squares of each input, and also products of different inputs. A <strong>polynomial feature expansion of degree d</strong> lists every product of the inputs whose powers add up to at most d. For house F, with size 16 and 4 bedrooms, degree 2 gives six columns: the constant 1; the originals size = 16 and rooms = 4; the squares size² = 256 and rooms² = 16; and the product size × rooms = 64. The squares let the model bend along each input. The product is different and important: it lets the effect of size depend on the number of rooms, an idea called an <em>interaction</em> that section 06 explains properly. Degree 3 adds every term whose powers add up to 3: size³, size²·rooms, size·rooms² and rooms³.</p>
  <p>How many columns is that in general? With k inputs and degree d, the number of terms including the constant is the binomial coefficient C(k + d, d), so <strong>C(k + d, d) − 1</strong> without it. For two inputs at degree 2 that is C(4, 2) − 1 = 5; for ten inputs at degree 3 it is C(13, 3) − 1 = 285. The code builds house F's row and prints the counts:</p>
  <div class="fx" data-lang="py">from math import comb
row = np.array([[16, 4]])                         # house F: size = 16, rooms = 4
for kw in [dict(degree=2), dict(degree=2, interaction_only=True)]:
    pf = PolynomialFeatures(**kw).fit(row)
    print(kw)
    print("  names :", list(pf.get_feature_names_out(["size", "rooms"])))
    print("  values:", pf.transform(row)[0].astype(int).tolist())
print("columns (no bias) for k inputs at degree 2, 3, 4:")
for k in [1, 2, 5, 10, 50]:
    print(f"  k={k:&lt;3}", [comb(k + d, d) - 1 for d in (2, 3, 4)])</div>
  <div class="fx" data-lang="text">{'degree': 2}
  names : ['1', 'size', 'rooms', 'size^2', 'size rooms', 'rooms^2']
  values: [1, 16, 4, 256, 64, 16]
{'degree': 2, 'interaction_only': True}
  names : ['1', 'size', 'rooms', 'size rooms']
  values: [1, 16, 4, 64]
columns (no bias) for k inputs at degree 2, 3, 4:
  k=1   [2, 3, 4]
  k=2   [5, 9, 14]
  k=5   [20, 55, 125]
  k=10  [65, 285, 1000]
  k=50  [1325, 23425, 316250]</div>
  <p><code>get_feature_names_out</code> shows exactly which product each column is, in the same order as above, and the values 1, 16, 4, 256, 64, 16 match. With <code>interaction_only=True</code> the squares are dropped and only products of different inputs are kept. The count table is the warning: 10 inputs at degree 3 already make 285 columns, and 50 inputs make 23,425, more than most datasets have rows. Even our two inputs at degree 2 give 5 columns for 6 houses. When a model has about as many weights as there are rows, least squares can fit the training data perfectly and learn nothing useful. This <strong>column explosion</strong> is why polynomial features are used with a small degree, or together with a penalty (section 09).</p>
  <p>The three settings you will use are <code>degree</code> (start at 2, rarely go above 3 with many inputs), <code>interaction_only</code> (keep products but no squares, for when you believe inputs affect each other but do not bend on their own) and <code>include_bias</code> (set it to False when the next step fits its own intercept). One practical warning: a 0/1 dummy column squared is itself (0² = 0, 1² = 1), so running <code>PolynomialFeatures</code> over one-hot encoded categories creates exact duplicate columns. Expand only the numeric columns, using a <code>ColumnTransformer</code> as described in <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>

  <h2 id="pr-overfit"><span class="num">04</span>Degree and Overfitting</h2>
  <p>Degree 2 cut the error from 34 to 9.89. It is tempting to conclude that degree 3, 4 or 5 will be better still, and on the training data they always are. A polynomial of degree d has d + 1 weights. Asking it to pass exactly through n points gives n equations, so with d + 1 = n weights there is always an exact solution: through any 2 points goes a line, through any 3 a parabola, and through any 6 points a polynomial of degree 5. Zero training error is guaranteed, whatever the data, even pure noise. Here is every degree on the six houses, with what each one predicts for a flat outside the data:</p>
  <div class="fx" data-lang="py">for d in [1, 2, 3, 4, 5]:
    c = np.polyfit(size - 11, price, d)            # centred size keeps the numbers tame
    sse = np.sum((price - np.polyval(c, size - 11)) ** 2)
    print(f"degree {d}: {d+1} weights, train SSE {sse:7.3f}, "
          f"price at size 18 -&gt; {np.polyval(c, 7):6.2f}, size 4 -&gt; {np.polyval(c, -7):6.2f}")</div>
  <div class="fx" data-lang="text">degree 1: 2 weights, train SSE  34.000, price at size 18 -&gt; 110.00, size 4 -&gt;  12.00
degree 2: 3 weights, train SSE   9.893, price at size 18 -&gt; 117.50, size 4 -&gt;  19.50
degree 3: 4 weights, train SSE   3.087, price at size 18 -&gt; 125.67, size 4 -&gt;  11.33
degree 4: 5 weights, train SSE   0.194, price at size 18 -&gt; 139.17, size 4 -&gt;  24.83
degree 5: 6 weights, train SSE   0.000, price at size 18 -&gt; 152.00, size 4 -&gt;  12.00</div>
  <p>Training SSE falls 34 → 9.9 → 3.1 → 0.19 → 0, and degree 5 hits every flat exactly. But look at what the models say about flats they have not seen. At 1,800 sq ft the predictions climb from 110 to 152 lakh as the degree rises, and at 400 sq ft they jump between 11 and 25 lakh. All five models agree closely about the six flats they were trained on and disagree wildly about everything else. A perfect fit to the training data tells us nothing about new data.</p>
  <p>This is <strong>overfitting</strong>: the model is flexible enough to fit the noise in the training data as well as the pattern, so its training error is low and its error on new data is high. The opposite failure, a model too simple to capture the pattern, is <strong>underfitting</strong>, and both its training and test errors are high. Polynomial degree is the textbook dial between the two. Think of a student preparing for an exam. One who learns only a rough summary (degree 1) does poorly on every paper. One who learns the ideas (degree 2) does well on new papers. One who memorises last year's paper word for word (degree 5) scores full marks on that paper and badly on a new one.</p>
  <p>Six houses are too few to measure test error, so we switch to a larger example where we know the truth: 20 training points from the curve y = sin(2πx) plus random noise with standard deviation 0.3, and 1,000 fresh test points from the same source. RMSE (root mean squared error) is reported for both. The pipeline standardises the polynomial columns, for reasons section 05 explains:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
rng = np.random.default_rng(0)
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1           # 20 training points
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.3, 20)
xt = rng.uniform(0, 1, 1000); yt = np.sin(2 * np.pi * xt) + rng.normal(0, 0.3, 1000)
def rmse(m, a, b):
    return mean_squared_error(b, m.predict(a[:, None])) ** 0.5
print("deg  train  test   largest |weight|  predicts x=1.1")
for d in [0, 1, 2, 3, 5, 9, 12, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x[:, None], y)
    big = np.abs(m[-1].coef_).max() if d else 0.0
    print(f"{d:3d}  {rmse(m, x, y):.3f}  {rmse(m, xt, yt):.3f}  {big:12,.1f}  {m.predict([[1.1]])[0]:10.2f}")
print("true value at x=1.1:", round(np.sin(2 * np.pi * 1.1), 2))</div>
  <div class="fx" data-lang="text">deg  train  test   largest |weight|  predicts x=1.1
  0  0.689  0.781           0.0       -0.18
  1  0.534  0.577           0.4       -0.96
  2  0.529  0.590           0.7       -0.69
  3  0.158  0.330          10.7        2.31
  5  0.155  0.336          12.4        1.96
  9  0.150  0.344         565.7        2.44
 12  0.139  0.381       2,880.6      -35.00
 15  0.125  0.548       4,794.4     -214.35
true value at x=1.1: 0.59</div>
  <p>Read the table in three zones. Degrees 0 to 2 underfit: a sine wave has two bends and a parabola has only one, so both errors are high. Degrees 3 to 9 are about right: test RMSE is around 0.33 to 0.34, close to the noise level of 0.3 that no model can beat. Degrees 12 and 15 overfit: training RMSE keeps falling to 0.125, which is below the noise level and therefore means the model is fitting noise, while test RMSE climbs back to 0.548. The weights tell the same story. Degree 3 needs weights of about 11, while degree 15 needs weights near 4,800 that almost cancel each other, so a tiny change in the data changes them a lot.</p>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600">
<line x1="60" y1="230" x2="580" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="184" text-anchor="end" class="tm" font-size="11">0.2</text><text x="52" y="134" text-anchor="end" class="tm" font-size="11">0.4</text><text x="52" y="84" text-anchor="end" class="tm" font-size="11">0.6</text><text x="52" y="34" text-anchor="end" class="tm" font-size="11">0.8</text>
<line x1="60" y1="155" x2="580" y2="155" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4"/><text x="575" y="168" text-anchor="end" class="tm" font-size="10.5">noise level 0.3</text>
<text x="60" y="246" text-anchor="middle" class="tm" font-size="11">0</text><text x="162" y="246" text-anchor="middle" class="tm" font-size="11">3</text><text x="230" y="246" text-anchor="middle" class="tm" font-size="11">5</text><text x="366" y="246" text-anchor="middle" class="tm" font-size="11">9</text><text x="468" y="246" text-anchor="middle" class="tm" font-size="11">12</text><text x="570" y="246" text-anchor="middle" class="tm" font-size="11">15</text>
<text x="320" y="264" text-anchor="middle" class="tm" font-size="12">polynomial degree</text>
<polyline points="60,58 94,96 128,98 162,190 196,191 230,191 298,192 366,192 468,195 570,199" fill="none" class="sb" stroke-width="2.2"/>
<polyline points="60,35 94,86 128,82 162,148 196,146 230,146 298,144 366,144 468,135 570,93" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="162" cy="148" r="5" class="fg sg"/><text x="170" y="138" class="tg" font-size="12">best test: degree 3 (0.330)</text>
<text x="420" y="210" class="tb" font-size="12">train RMSE keeps falling</text>
<text x="470" y="110" class="tr" font-size="12">test RMSE turns up</text>
<text x="70" y="22" class="tm" font-size="11">underfit (high bias)</text><text x="575" y="60" text-anchor="end" class="tm" font-size="11">overfit (high variance)</text>
</svg><figcaption>Train error (blue) falls with every extra degree. Test error (red) falls until degree 3, stays flat, then rises: the U-shape of overfitting. Below the dashed line (the noise level) a model is fitting noise.</figcaption></figure>
  <p>The figure plots the same two columns. The training curve only ever goes down. The test curve goes down, flattens, and rises again, making a U. The bottom of the U is the degree we want, and the whole job of model selection is to find it without peeking at the test set (section 08).</p>
  <p>The last column of the output shows the second danger of high degrees: <strong>extrapolation</strong>, predicting outside the range of the training data. At x = 1.1 the true value is 0.59, but degree 15 predicts −214, and even degree 3 predicts 2.31. Every polynomial eventually heads to plus or minus infinity, because its highest power dominates, and high-degree polynomials also wobble more and more near the edges of the data, where there are no points on one side to hold them down (this is called Runge's phenomenon). So never trust a polynomial outside the range it was trained on, and be suspicious near the edges even inside it. If you genuinely need to extrapolate, use a model whose shape outside the data was chosen on purpose, such as a straight line or a spline with linear tails.</p>

  <h2 id="pr-scale"><span class="num">05</span>Scaling and Collinearity of Powers</h2>
  <p>In section 02 we centred size before squaring it and the hand calculation became three simple divisions, while the raw route needed numbers as large as 140,080. That was not just a convenience. Raw powers cause two real problems.</p>
  <p>The first problem is that x and x² are nearly the same column when x is positive. As size goes 6, 8, 10, 12, 14, 16, size² goes 36, 64, 100, 144, 196, 256: both rise together, so they are strongly correlated. When two columns carry almost the same information, least squares cannot decide how to share the effect between them, so many combinations of weights fit almost equally well, the chosen weights swing with small changes in the data, and their standard errors grow. This is <strong>multicollinearity</strong>, the problem measured by VIF in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>, except that this time we created it ourselves. Centring fixes most of it: after centring, z goes −5 … 5 symmetrically, z² is symmetric (25, 9, 1, 1, 9, 25) while z is antisymmetric, so their correlation becomes exactly zero.</p>
  <p>The second problem is size. Take a feature with large values, such as the year, from 2000 to 2010. Its cube is about 8 × 10⁹, while the intercept column is 1. A computer stores roughly 16 significant digits, so when numbers this different in size are combined, the small ones are lost entirely. The <strong>condition number</strong> of XᵀX (its largest eigenvalue divided by its smallest) measures how badly a system amplifies such rounding errors; as a rule of thumb you lose about log₁₀ of it in digits of accuracy, so a condition number near 10¹⁶ means the answer may be pure noise.</p>
  <div class="fx" data-lang="py">print("corr(size, size^2), raw 6..16      :", round(np.corrcoef(size, size**2)[0, 1], 4))
zc = size - size.mean()
print("corr(size, size^2), centred -5..5  :", round(np.corrcoef(zc, zc**2)[0, 1], 4) + 0.0)
years = np.arange(2000, 2011.0)                    # a feature with big values
for name, v in [("raw years", years), ("centred years", years - years.mean()),
                ("standardised", (years - years.mean()) / years.std())]:
    P = PolynomialFeatures(3, include_bias=False).fit_transform(v[:, None])
    print(f"{name:14s} x^3 max {np.abs(P[:, 2]).max():&gt;14,.1f}   cond(X^T X) {np.linalg.cond(P.T @ P):.1e}")</div>
  <div class="fx" data-lang="text">corr(size, size^2), raw 6..16      : 0.9913
corr(size, size^2), centred -5..5  : 0.0
raw years      x^3 max 8,120,601,000.0   cond(X^T X) 1.4e+22
centred years  x^3 max          125.0   cond(X^T X) 2.5e+03
standardised   x^3 max            4.0   cond(X^T X) 3.8e+01</div>
  <p>The houses give a correlation of 0.9913 between size and size² before centring and 0.0 after. For raw years, the cube reaches 8.1 billion and the condition number is 1.4 × 10²², which is numerically hopeless: the computed weights cannot be trusted at all. Centring alone brings the condition number down to 2,500, and standardising (centring and then dividing by the standard deviation) brings it down to 38. The predictions of a well-solved model are the same either way; what scaling changes is whether the computer can solve it accurately and whether the coefficients mean anything.</p>
  <p>Scaling matters for one more reason. Penalties such as ridge and lasso, and gradient descent, are sensitive to the scale of each column. Without standardising, size³ (values up to 4,096) needs only a tiny weight while size (values up to 16) needs a large one, and a penalty on weight size would then punish the two very unequally for no real reason. So the standard recipe in scikit-learn is <code>PolynomialFeatures</code> followed by <code>StandardScaler</code> inside a pipeline, with an extra scaler <em>before</em> the polynomial step when the raw inputs are large numbers like years or prices. Statisticians sometimes go further and use <strong>orthogonal polynomials</strong>, columns built to be exactly uncorrelated, which is what our hand-made 1, z, 3z² − 35 were.</p>

  <h2 id="pr-inter"><span class="num">06</span>Interaction Terms</h2>
  <p>Squares let one input bend. A different question arises with two inputs: can one input change the effect of another? Suppose flats C and F are in the Metro area and the others are not. A model with "main effects" only, price = b₀ + b₁·size + b₂·metro, says that Metro shifts the whole price line up or down by b₂, but that 100 extra sq ft adds the same b₁ everywhere. If Metro buyers actually pay more per extra square foot, the effect of size depends on locality, and the model cannot express that.</p>
  <p>The fix is again a new column: the product size × metro. The model becomes ŷ = b₀ + b₁·size + b₂·metro + b₃·size·metro. Group the size terms and it reads ŷ = (b₀ + b₂·metro) + (b₁ + b₃·metro)·size, so the slope of size is now b₁ outside Metro and b₁ + b₃ inside it. This is an <strong>interaction</strong>: the effect of one input depends on the value of another, and in a linear model it is represented by a product column. Think of fertiliser and water. Fertiliser on dry soil does little, water alone helps a bit, but both together help far more than the sum of the two. That extra "both together" effect is the interaction, and a model with main effects only cannot express it.</p>
  <p>With a 0/1 column the interaction model is the same as fitting a separate line to each group, so we can compute it by hand. The four non-Metro flats A, B, D, E have sizes 6, 8, 12, 14 and prices 28, 40, 66, 79; their mean size is 10 and mean price 53.25, and their least-squares slope works out to 256 / 40 = 6.4, with intercept 53.25 − 6.4 × 10 = −10.75. The two Metro flats C and F give a line through (10, 53) and (16, 100), whose slope is 47 / 6 = 7.83. Matching these to the formula: b₀ = −10.75, b₁ = 6.4, b₃ = 7.83 − 6.4 = 1.43, and b₂ = −14.58 so that the Metro intercept is −25.33. In statsmodels formula language, <code>size * metro</code> is shorthand for size + metro + size:metro, where the colon means the product:</p>
  <div class="fx" data-lang="py">houses = pd.DataFrame({"size":  [6, 8, 10, 12, 14, 16],
                       "metro": [0, 0, 1, 0, 0, 1],               # houses C and F are in Metro
                       "price": [28, 40, 53, 66, 79, 100]})
print(smf.ols("price ~ size + metro", houses).fit().params.round(3).to_dict())
inter = smf.ols("price ~ size * metro", houses).fit()          # a*b = a + b + a:b
print(inter.params.round(3).to_dict())
b0, b1, b2, b3 = inter.params
print(f"slope of size: non-Metro {b1:.3f}, Metro {b1 + b3:.3f}")</div>
  <div class="fx" data-lang="text">{'Intercept': -15.198, 'size': 6.845, 'metro': 2.716}
{'Intercept': -10.75, 'size': 6.4, 'metro': -14.583, 'size:metro': 1.433}
slope of size: non-Metro 6.400, Metro 7.833</div>
  <p>The main-effects model gives one shared slope (6.85) and a Metro bump of 2.72. The interaction model reproduces the hand numbers exactly: 100 extra sq ft adds 6.4 lakh outside Metro and 7.83 lakh inside it. (With only two Metro flats this estimate is fragile; the point here is the mechanics.) Notice that b₂ = −14.58 does not mean "Metro flats are cheaper". With the product in the model, b₂ is the Metro difference for a flat of size 0, which does not exist. If you centre size before multiplying, b₂ becomes the Metro difference at the average size, which is meaningful.</p>
  <p>To see the benefit on more data, consider an advertiser spending on TV and radio, where the two reinforce each other. Suppose the truth is sales = 10 + 2·TV + 1·radio + 0.5·TV·radio, so the value of one more lakh on TV is 2 + 0.5·radio. We simulate 200 campaigns and fit both models; <code>interaction_only=True</code> adds just the product column:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(7)
tv = rng.uniform(0, 10, 200)                    # TV spend, lakh rupees
radio = rng.uniform(0, 5, 200)                  # radio spend, lakh rupees
sales = 10 + 2 * tv + 1 * radio + 0.5 * tv * radio + rng.normal(0, 2, 200)
X = np.c_[tv, radio]
Xi = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False).fit_transform(X)  # tv, radio, tv*radio
for name, A in [("main effects only", X), ("with tv*radio", Xi)]:
    m = LinearRegression().fit(A, sales)
    r2 = cross_val_score(LinearRegression(), A, sales, cv=5).mean()
    print(f"{name:18s} intercept {m.intercept_:5.2f}  weights {m.coef_.round(2)}  CV R2 {r2:.3f}")</div>
  <div class="fx" data-lang="text">main effects only  intercept  3.51  weights [3.28 3.35]  CV R2 0.933
with tv*radio      intercept  9.88  weights [1.99 0.98 0.48]  CV R2 0.969</div>
  <p>Without the product, the model has to give TV one average slope (3.28) and gets the intercept badly wrong (3.51 instead of 10). With the product, the weights land close to the truth (1.99, 0.98, 0.48 and intercept 9.88), and cross-validated R² rises from 0.933 to 0.969.</p>
  <p>Two rules come with interactions. The first is the <strong>hierarchy principle</strong>: if you keep a product a·b, keep a and b on their own as well, even if their p-values look large, because without them the product's meaning depends on where zero happens to be. The second is restraint: with k inputs there are k(k − 1)/2 possible pairs, so adding all of them is the column explosion again. Add the pairs that domain knowledge suggests, or let a model find them. Tree-based models such as <a class="xref" data-note="ml_dtree">Decision Trees</a> discover interactions automatically, which is one of their big advantages; linear models need them typed in.</p>

  <h2 id="pr-basis"><span class="num">07</span>Basis Functions: Steps, Hinges, Splines and RBFs</h2>
  <p>Powers of x are only one choice of new column, and section 04 showed their weakness: they are <em>global</em>. Changing one weight changes the curve everywhere, so one point near the edge can swing the whole fit, and outside the data the curve shoots off to infinity. Are there columns that bend the fit only where the data asks for it?</p>
  <p>Every model in this note has the form ŷ = w₀ + w₁φ₁(x) + w₂φ₂(x) + … + w<sub>m</sub>φ<sub>m</sub>(x), where the φ's ("phi") are fixed functions chosen before training and least squares only picks the weights. These fixed functions are called <strong>basis functions</strong>, and building the new columns from them is called a <strong>basis expansion</strong>. Polynomials use φⱼ(x) = xʲ, but any family of shapes will do. The question is which family, added together, can imitate the curves you expect without misbehaving at the edges. Think of a set of building blocks: polynomials are a few long, rigid planks that span the whole range, while the bases below are many small blocks, each placed in one spot.</p>
  <figure class="viz"><svg viewBox="0 0 700 185" width="700">
<line x1="30" y1="150" x2="230" y2="150" stroke="currentColor"/><line x1="250" y1="150" x2="450" y2="150" stroke="currentColor"/><line x1="470" y1="150" x2="670" y2="150" stroke="currentColor"/>
<polyline points="30,150 80,150 230,40" fill="none" class="sb" stroke-width="2"/><polyline points="30,150 130,150 230,77" fill="none" class="sg" stroke-width="2"/><polyline points="30,150 180,150 230,113" fill="none" class="sr" stroke-width="2"/>
<polyline points="250,40 255,42 260,49 265,60 270,72 275,86 280,100 285,112 290,123 295,131 300,137 305,142 310,145 315,147 320,148 325,149 330,150" fill="none" class="sb" stroke-width="2"/>
<polyline points="250,137 255,131 260,123 265,112 270,100 275,86 280,72 285,60 290,49 295,42 300,40 305,42 310,49 315,60 320,72 325,86 330,100 335,112 340,123 345,131 350,137 355,142 360,145 365,147 370,148 375,149 380,150" fill="none" class="sg" stroke-width="2"/>
<polyline points="270,150 275,149 280,148 285,147 290,145 295,142 300,137 305,131 310,123 315,112 320,100 325,86 330,72 335,60 340,49 345,42 350,40 355,42 360,49 365,60 370,72 375,86 380,100 385,112 390,123 395,131 400,137 405,142 410,145 415,147 420,148 425,149 430,150" fill="none" class="sr" stroke-width="2"/>
<polyline points="320,150 325,149 330,148 335,147 340,145 345,142 350,137 355,131 360,123 365,112 370,100 375,86 380,72 385,60 390,49 395,42 400,40 405,42 410,49 415,60 420,72 425,86 430,100 435,112 440,123 445,131 450,137" fill="none" class="st" stroke-width="2"/>
<polyline points="370,150 375,149 380,148 385,147 390,145 395,142 400,137 405,131 410,123 415,112 420,100 425,86 430,72 435,60 440,49 445,42 450,40" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<polyline points="470,132 475,137 480,141 485,144 490,146 495,148 500,149 505,150" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<polyline points="470,77 475,78 480,81 485,85 490,91 495,97 500,104 505,112 510,119 515,126 520,132 525,137 530,141 535,144 540,146 545,148 550,149 555,150" fill="none" class="sb" stroke-width="2"/>
<polyline points="470,132 475,126 480,119 485,112 490,104 495,97 500,91 505,85 510,81 515,78 520,77 525,78 530,81 535,85 540,91 545,97 550,104 555,112 560,119 565,126 570,132 575,137 580,141 585,144 590,146 595,148 600,149 605,150" fill="none" class="sg" stroke-width="2"/>
<polyline points="485,150 490,149 495,148 500,146 505,144 510,141 515,137 520,132 525,126 530,119 535,112 540,104 545,97 550,91 555,85 560,81 565,78 570,77 575,78 580,81 585,85 590,91 595,97 600,104 605,112 610,119 615,126 620,132 625,137 630,141 635,144 640,146 645,148 650,149 655,150" fill="none" class="sr" stroke-width="2"/>
<polyline points="535,150 540,149 545,148 550,146 555,144 560,141 565,137 570,132 575,126 580,119 585,112 590,104 595,97 600,91 605,85 610,81 615,78 620,77 625,78 630,81 635,85 640,91 645,97 650,104 655,112 660,119 665,126 670,132" fill="none" class="st" stroke-width="2"/>
<polyline points="585,150 590,149 595,148 600,146 605,144 610,141 615,137 620,132 625,126 630,119 635,112 640,104 645,97 650,91 655,85 660,81 665,78 670,77" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<polyline points="635,150 640,149 645,148 650,146 655,144 660,141 665,137 670,132" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<text x="130" y="20" text-anchor="middle" font-size="12.5">hinges max(0, x − c)</text><text x="130" y="172" text-anchor="middle" class="tm" font-size="11">knots c = 0.25, 0.5, 0.75</text>
<text x="350" y="20" text-anchor="middle" font-size="12.5">RBF bumps</text><text x="350" y="172" text-anchor="middle" class="tm" font-size="11">centres 0, 0.25, 0.5, 0.75, 1</text>
<text x="570" y="20" text-anchor="middle" font-size="12.5">cubic B-splines</text><text x="570" y="172" text-anchor="middle" class="tm" font-size="11">5 knots → 7 local bumps</text>
</svg><figcaption>Three families of basis functions on x ∈ [0, 1]. Each column of the new table is one of these curves evaluated at the row's x. A fitted model is a weighted sum of the curves.</figcaption></figure>
  <p>The simplest local basis is a set of <strong>step functions</strong>, or bins. Cut the size range into intervals and make one 0/1 column per interval: 1 if the flat falls in that bin, 0 otherwise. The fitted weight of each bin is simply the average price of the flats in it, so the model is a staircase. With bins "small" (under 900 sq ft), "medium" (900 to 1,300) and "large" (over 1,300), the predictions are (28 + 40)/2 = 34, (53 + 66)/2 = 59.5 and (79 + 100)/2 = 89.5. Steps are simple and robust, but the prediction jumps at each bin edge (a 1,290 sq ft flat would be priced 30 lakh below a 1,310 sq ft one) and is flat inside each bin. A regression tree is exactly a step function whose bins are chosen automatically.</p>
  <p>A <strong>hinge</strong> at a point c, called a <strong>knot</strong>, is the column max(0, x − c): zero to the left of the knot and a rising straight line to the right. (In neural networks the same function is called ReLU.) Adding w·max(0, x − c) to a straight line changes the slope by w at x = c and nowhere else, so you get two straight pieces joined at a corner. For the houses, a hinge at 1,100 sq ft gives the column 0, 0, 0, 1, 3, 5, and least squares chooses a slope of 5.875 lakh per 100 sq ft below the knot and 5.875 + 2.25 = 8.125 above it. That reads naturally ("small flats gain about 5.9 lakh per 100 sq ft, big ones about 8.1") and suits thresholds and saturation, such as a salary that rises and then levels off, which a polynomial would need a high degree to imitate.</p>
  <p>A <strong>spline</strong> joins smooth pieces instead of straight ones. A cubic spline puts a separate cubic polynomial on each interval between knots and forces the value, slope and curvature to match at every knot, so the joins are invisible. Libraries build splines from <strong>B-splines</strong>: a set of local bumps, each non-zero over only a few neighbouring intervals, that add up to exactly 1 at every x. For a flat of 1,300 sq ft with five evenly spaced knots between 6 and 16, only four of the seven B-spline columns are non-zero, with values 0.0013, 0.2827, 0.6307 and 0.0853, which sum to 1. So that flat only influences the weights of the bumps near it. A <strong>natural spline</strong> additionally forces the curve to be a straight line beyond the outer knots, which tames the edges and gives sensible linear extrapolation.</p>
  <p>Finally, a <strong>radial basis function</strong> (RBF) column is a Gaussian bump centred at c with width s: φ(x) = exp(−(x − c)² / (2s²)). It equals 1 at x = c and fades to 0 a few widths away. For a 1,300 sq ft flat with centres at 6, 11 and 16 and width 2.5, the three values are 0.0198, 0.7261 and 0.4868: the nearest centre gives the largest value. The width is a smoothness dial: wide bumps give smooth curves, narrow bumps give wiggly ones that overfit. The code checks every number in this section:</p>
  <div class="fx" data-lang="py"># 1) step functions: three size bins
bins = np.digitize(size, [9, 13])                 # 0 = small, 1 = medium, 2 = large
print("bin means:", [float(price[bins == k].mean()) for k in range(3)])
# 2) a hinge at size 11
H = np.c_[size, np.maximum(0, size - 11)]         # columns: size, max(0, size - 11)
mh = LinearRegression().fit(H, price)
rh = price - mh.predict(H)
print("hinge column:", H[:, 1].tolist(), " weights", mh.coef_.round(3), " intercept", round(mh.intercept_, 3), f" SSE {rh @ rh:.2f}")
# 3) cubic B-spline basis, 5 knots on [6, 16]
st = SplineTransformer(n_knots=5, degree=3).fit(size[:, None])
row = st.transform([[13]])[0]
print("B-spline row at size 13:", row.round(4), " sum =", round(row.sum(), 6))
# 4) RBF bumps at centres 6, 11, 16 with width 2.5
c, s = np.array([6, 11, 16]), 2.5
print("RBF row at size 13:", np.exp(-(13 - c) ** 2 / (2 * s ** 2)).round(4))</div>
  <div class="fx" data-lang="text">bin means: [34.0, 59.5, 89.5]
hinge column: [0.0, 0.0, 0.0, 1.0, 3.0, 5.0]  weights [5.875 2.25 ]  intercept -7.0  SSE 13.75
B-spline row at size 13: [0.     0.     0.0013 0.2827 0.6307 0.0853 0.    ]  sum = 1.0
RBF row at size 13: [0.0198 0.7261 0.4868]</div>
  <p>The bin means (34, 59.5, 89.5), the hinge weights (5.875 and 2.25, with SSE 13.75, close to the quadratic's 9.89 with the same number of weights) and the spline and RBF rows all match. <code>SplineTransformer(n_knots=5, degree=3)</code> places its knots evenly between the smallest and largest training value and makes n_knots + degree − 1 = 7 columns.</p>
  <p>Six houses cannot rank these bases against each other, so we return to the 20 sine points. Each model below is "basis columns, then linear regression" (the RBF model adds a tiny ridge penalty because its eight overlapping bumps are correlated). We also ask each model for a prediction outside the data, at x = 1.2 and x = 1.5. The small RBF class is a custom scikit-learn transformer: <code>fit</code> stores the centres and <code>transform</code> computes the bumps.</p>
  <div class="fx" data-lang="py">from sklearn.base import BaseEstimator, TransformerMixin
class RBF(BaseEstimator, TransformerMixin):         # Gaussian bumps at evenly spaced centres
    def __init__(self, n_centers=8, width=0.15):
        self.n_centers, self.width = n_centers, width
    def fit(self, X, y=None):
        self.c_ = np.linspace(X.min(), X.max(), self.n_centers); return self
    def transform(self, X):
        return np.exp(-(X - self.c_) ** 2 / (2 * self.width ** 2))
models = {
    "polynomial deg 3":     make_pipeline(PolynomialFeatures(3), StandardScaler(), LinearRegression()),
    "steps (6 bins)":       make_pipeline(KBinsDiscretizer(6, encode="onehot-dense", strategy="uniform"), LinearRegression()),
    "hinges (6 knots)":     make_pipeline(SplineTransformer(n_knots=6, degree=1), LinearRegression()),
    "cubic spline 6 knots": make_pipeline(SplineTransformer(n_knots=6, degree=3), LinearRegression()),
    "RBF 8 bumps + ridge":  make_pipeline(RBF(8, 0.15), Ridge(alpha=0.1)),
}
print(f"{'basis':21s} train   test   f(1.2)  f(1.5)   (true {np.sin(2*np.pi*1.2):.2f}, {np.sin(2*np.pi*1.5):.2f})")
for name, m in models.items():
    m.fit(x[:, None], y)
    tr = mean_squared_error(y, m.predict(x[:, None])) ** 0.5
    te = mean_squared_error(yt, m.predict(xt[:, None])) ** 0.5
    f12, f15 = m.predict([[1.2], [1.5]])
    print(f"{name:21s} {tr:.3f}  {te:.3f}  {f12:6.2f}  {f15:6.2f}")</div>
  <div class="fx" data-lang="text">basis                 train   test   f(1.2)  f(1.5)   (true 0.95, 0.00)
polynomial deg 3      0.158  0.330    4.98   19.73
steps (6 bins)        0.310  0.400   -0.40   -0.40
hinges (6 knots)      0.157  0.343    0.34    0.34
cubic spline 6 knots  0.151  0.339    0.47    0.47
RBF 8 bumps + ridge   0.174  0.327    0.40    0.20</div>
  <p>Inside the data, the cubic polynomial, both kinds of spline and the RBF model all reach a test RMSE of about 0.33 to 0.34, near the noise floor of 0.3; the staircase is worse (0.400) because it is flat inside each bin. Outside the data the difference is dramatic. The cubic polynomial predicts 4.98 and 19.73 for a curve that never exceeds 1, because it heads to infinity. The splines hold their edge value (scikit-learn's default), and the RBF model fades back toward its intercept as the bumps die away. None of them knows that the sine continues, because no basis can extrapolate a pattern it has not seen, but the local bases at least fail gracefully.</p>
  <p>Basis functions connect this note to much of machine learning. A GAM (generalized additive model) puts a spline basis on each input and adds them up. A kernel method such as an SVM with an RBF kernel uses one RBF bump per training point, without ever building the columns (the "kernel trick", see <a class="xref" data-note="ml_svm">Support Vector Machines</a>). A neural network's hidden layer is a set of hinges whose knots and directions are learned rather than fixed. Fourier terms, sin and cos at a known period, are the basis used for seasonality in time series. The idea is the same each time: build useful columns, then put a linear model on top. And the number of knots, bins or centres is a capacity dial just like the degree, so it too must be chosen by cross-validation, and fitted on the training data only.</p>

  <h2 id="pr-cv"><span class="num">08</span>Choosing the Degree by Cross-Validation</h2>
  <p>We now have a dial (degree, number of knots) and we know that training error always prefers turning it all the way up. We also cannot use the test set to choose, because the test set must stay untouched until the very end; if we use it to make choices, its score stops being an honest estimate. The answer is <strong>cross-validation</strong> on the training data, covered fully in <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>: split the training rows into k groups called folds, train on k − 1 of them, measure the error on the one left out, rotate so that every fold is left out once, and average. The degree with the lowest average validation error wins. Think of a teacher who hides a few questions from each practice set, so that the student's score on the hidden questions shows whether they understood or just memorised.</p>
  <p>With only six houses, the natural choice is to leave out one house at a time, which is called <strong>leave-one-out cross-validation</strong> (LOOCV). It would normally require six refits per degree, but least squares has an exact shortcut. If eᵢ is the ordinary residual of row i and hᵢ its leverage (how strongly that row pulls the fit towards itself, a number between 0 and 1), then the error the model would make on row i if that row had been left out is eᵢ / (1 − hᵢ). For the straight line, house F has residual 4 and leverage 0.524, so its leave-one-out error is 4 / 0.476 = 8.4: a line fitted only to A to E predicts 91.6 for F, which actually sold for 100. Averaging the squares of these errors gives the LOOCV score without any refitting:</p>
  <div class="fx" data-lang="py">print("deg  leave-one-out errors e/(1-h)              LOOCV MSE  train MSE")
for d in [1, 2, 3, 4]:
    Xd = np.vander(size - 11, d + 1)                       # columns z^d ... z, 1
    H = Xd @ np.linalg.solve(Xd.T @ Xd, Xd.T)              # hat matrix
    e = price - H @ price
    loo = e / (1 - np.diag(H))                             # leave-one-out errors
    print(f"{d:3d}  {np.array2string(loo.round(2), separator=', '):42s}  {np.mean(loo ** 2):8.2f}  {np.mean(e ** 2):8.3f}")</div>
  <div class="fx" data-lang="text">deg  leave-one-out errors e/(1-h)              LOOCV MSE  train MSE
  1  [ 4.2 ,  0.  , -1.22, -2.44, -4.26,  8.4 ]     18.96     5.667
  2  [-3.8 ,  0.77,  1.82,  0.23, -3.56,  7.4 ]     14.30     1.649
  3  [ 7.4 , -1.96,  0.68,  1.71, -2.62,  8.8 ]     24.38     0.515
  4  [-7. ,  1.4, -0.7,  0.7, -1.4,  7. ]           17.15     0.032</div>
  <p>Training MSE falls with every degree (5.67, 1.65, 0.52, 0.03), but the LOOCV MSE is 18.96, 14.30, 24.38 and 17.15: degree 2 predicts unseen houses best. Degree 3 is even worse than the straight line, because when an end house such as A or F is left out the cubic has to extrapolate to it. (Degree 5 cannot be scored at all: with one house left out it has six weights for five points.) Leave-one-out on six rows is noisy, so read the result as "a gentle curve is supported; wiggles are not", not as proof.</p>
  <p>On the 20 sine points we can use the usual 5-fold cross-validation. The whole pipeline is passed to <code>cross_val_score</code>, so the scaler is refitted inside every fold and never sees that fold's validation rows. scikit-learn's scorers follow a "higher is better" rule, so mean squared error is reported as a negative number and we flip its sign:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import KFold, cross_val_score, GridSearchCV
X = x[:, None]
cv = KFold(5, shuffle=True, random_state=0)
print("deg  fold MSEs (5 folds)                    mean     std")
for d in range(1, 11):
    pipe = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression())
    mse = -cross_val_score(pipe, X, y, cv=cv, scoring="neg_mean_squared_error")
    print(f"{d:3d}  " + " ".join(f"{v:7.3f}" for v in mse) + f"  {mse.mean():6.3f}  {mse.std():6.3f}")
pipe = make_pipeline(PolynomialFeatures(), StandardScaler(), Ridge())
grid = GridSearchCV(pipe, {"polynomialfeatures__degree": [1, 3, 5, 9, 15],
                           "ridge__alpha": [1e-3, 1e-2, 0.1, 1, 10]},
                    cv=cv, scoring="neg_mean_squared_error").fit(X, y)
print("grid best:", grid.best_params_, " CV MSE", round(-grid.best_score_, 3))</div>
  <div class="fx" data-lang="text">deg  fold MSEs (5 folds)                    mean     std
  1    0.822   0.276   0.571   0.127   0.265   0.412   0.251
  2    1.753   0.272   0.695   0.131   0.393   0.649   0.583
  3    0.059   0.033   0.062   0.021   0.010   0.037   0.021
  4    0.226   0.031   0.060   0.040   0.007   0.073   0.078
  5    1.113   0.033   0.060   0.043   0.007   0.251   0.431
  6    0.825   0.033   0.067   0.049   0.017   0.198   0.314
  7   27.862   0.038   0.084   0.052   0.169   5.641  11.111
  8    0.213   0.037   0.337   0.051   0.429   0.213   0.154
  9    9.162   0.038   0.246   0.052   0.306   1.961   3.602
 10   56.455   0.039   0.197   0.053   0.201  11.389  22.533
grid best: {'polynomialfeatures__degree': 3, 'ridge__alpha': 0.001}  CV MSE 0.039</div>
  <p>Degree 3 has the lowest mean, (0.059 + 0.033 + 0.062 + 0.021 + 0.010) / 5 = 0.037. Look also at the first fold: degrees 7, 9 and 10 score 27.9, 9.2 and 56.5 there while their other folds are fine. That fold holds the right-hand end point, so the models trained without it must extrapolate to it, and high-degree polynomials explode outside their data. This is why we look at the spread across folds and not only at the mean.</p>
  <p>Cross-validation scores are themselves noisy, so a common habit is the <strong>one-standard-error rule</strong>: choose the simplest model whose mean score is within one standard error of the best. Degree 3's standard error is its std divided by √5, 0.021 / 2.236 = 0.0094, so anything below 0.037 + 0.009 = 0.046 counts as "as good". Degrees 1 and 2 are far above that, so the rule also picks degree 3. When a higher degree wins only by a hair, this rule prefers the lower one.</p>
  <p>The last line of the output shows the everyday tool, <code>GridSearchCV</code>, which tries every combination of settings with cross-validation. Its parameter names use the pipeline step name, two underscores and the parameter name (<code>polynomialfeatures__degree</code>, <code>ridge__alpha</code>). Here it searched degree and a ridge penalty together and picked degree 3 with a tiny penalty, CV MSE 0.039. After choosing, you refit on all the training data and score once on the test set.</p>

  <h2 id="pr-reg"><span class="num">09</span>Taming High Degrees with Regularization</h2>
  <p>Cross-validation controls flexibility by throwing columns away: it picks a small degree. There is a second way. Section 04 showed that overfitting appears in the weights: degree 5 on the houses and degree 15 on the sine wave needed enormous weights that cancel each other. Instead of removing columns, we could keep them all and simply make large weights expensive. That is <strong>regularization</strong>: add a cost for large weights to the least-squares error, so the fit only uses a big weight if it really pays for itself. <strong>Ridge</strong> regression charges α·Σw², and <strong>lasso</strong> charges α·Σ|w|, which can push some weights to exactly zero. Think of a builder told to make a curved wall from many planks but charged for every plank he bends hard: he will use gentle bends unless the shape really needs a sharp one. The general idea is in <a class="xref" data-note="ml_regularization">Regularization</a> and the two models are explained fully in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>; here we only watch what they do to a high-degree polynomial. First the houses at degree 5:</p>
  <div class="fx" data-lang="py">for name, reg in [("OLS", LinearRegression()), ("Ridge(0.1)", Ridge(0.1)), ("Ridge(1)", Ridge(1.0))]:
    m = make_pipeline(PolynomialFeatures(5, include_bias=False), StandardScaler(), reg).fit(size[:, None], price)
    r = price - m.predict(size[:, None])
    print(f"degree 5, {name:10s} train SSE {r @ r:7.3f}  max|w| {np.abs(m[-1].coef_).max():8.2f}  "
          f"price at 1,800 sq ft {m.predict([[18]])[0]:7.2f}")</div>
  <div class="fx" data-lang="text">degree 5, OLS        train SSE   0.000  max|w|  2256.89  price at 1,800 sq ft  152.00
degree 5, Ridge(0.1) train SSE   9.536  max|w|    11.49  price at 1,800 sq ft  121.35
degree 5, Ridge(1)   train SSE  35.879  max|w|     7.35  price at 1,800 sq ft  126.40</div>
  <p>Without a penalty, degree 5 needs a weight of 2,257 (on standardised columns) to pass through all six houses, and it prices an 1,800 sq ft flat at 152 lakh. With Ridge(0.1) the largest weight drops to 11.5, the training SSE is 9.5 (about the same as the quadratic's 9.89) and the 1,800 sq ft prediction is 121, close to the quadratic's 117.5. The penalty found a gentle curve by itself, without us choosing degree 2. Too strong a penalty, α = 1, starts flattening the fit (SSE 35.9, worse than the straight line). Now the sine wave at degree 15:</p>
  <div class="fx" data-lang="py">print("degree 15 with        train   test    max|w|  nonzero")
for name, reg in [("no penalty (OLS)", LinearRegression()), ("Ridge alpha=1e-3", Ridge(1e-3)),
                  ("Ridge alpha=10", Ridge(10)), ("Lasso alpha=1e-3", Lasso(1e-3, max_iter=100_000))]:
    m = make_pipeline(PolynomialFeatures(15, include_bias=False), StandardScaler(), reg).fit(x[:, None], y)
    tr = mean_squared_error(y, m.predict(x[:, None])) ** 0.5
    te = mean_squared_error(yt, m.predict(xt[:, None])) ** 0.5
    w = m[-1].coef_
    print(f"{name:20s}  {tr:.3f}  {te:.3f}  {np.abs(w).max():8.2f}  {int((w != 0).sum()):3d}/15")
print("Lasso kept powers:", [f"x^{i+1}" for i in np.flatnonzero(w)])</div>
  <div class="fx" data-lang="text">degree 15 with        train   test    max|w|  nonzero
no penalty (OLS)      0.125  0.548   4794.44   15/15
Ridge alpha=1e-3      0.159  0.325      6.72   15/15
Ridge alpha=10        0.404  0.522      0.19   15/15
Lasso alpha=1e-3      0.176  0.328      4.91    4/15
Lasso kept powers: ['x^1', 'x^2', 'x^5', 'x^13']</div>
  <p>A very small ridge penalty (α = 0.001) cuts the largest weight from 4,794 to 6.7 and the test RMSE from 0.548 to 0.325, as good as the best plain polynomial. Too much penalty (α = 10) flattens the curve and underfits (test 0.522). Lasso keeps only 4 of the 15 powers (x, x², x⁵, x¹³) and still reaches 0.328, so in a sense it chose the columns for us. The scaler matters here: without it, x¹⁵ (values between 0 and 1, so tiny) would need a huge weight and be punished far more than x.</p>
  <p>So there are two ways to control capacity: fewer columns (low degree, few knots) or many columns with small weights (a penalty). The second is often better because it does not have to guess which columns matter, and it is how penalised splines, kernel ridge regression and weight decay in neural networks work. Either way the dial (degree or α) is chosen by cross-validation. One thing regularization does not fix is extrapolation: a penalised degree-5 curve is still a polynomial and still heads off to infinity outside the data, only more slowly.</p>

  <h2 id="pr-compare"><span class="num">10</span>Polynomials, Splines or Trees?</h2>
  <p>Polynomials, splines, kernels, trees and neural networks can all fit curves, so which should you reach for? The differences come down to how the columns are chosen, how the model behaves at the edges, and whether it finds interactions on its own.</p>
  <table class="tbl">
    <tr><th></th><th>Polynomial</th><th>Splines / GAM</th><th>Kernel (RBF)</th><th>Tree / boosting</th></tr>
    <tr><td>New columns</td><td>fixed powers</td><td>fixed local pieces</td><td>a bump per training row</td><td>steps, learned from data</td></tr>
    <tr><td>Smooth?</td><td>yes</td><td>yes</td><td>yes</td><td>no (steps)</td></tr>
    <tr><td>Outside the data</td><td>explodes</td><td>linear (natural) or flat</td><td>fades to the intercept</td><td>flat</td></tr>
    <tr><td>Interactions</td><td>typed in by hand</td><td>typed in by hand</td><td>automatic</td><td>automatic</td></tr>
    <tr><td>Many inputs</td><td>column explosion</td><td>fine if effects add up</td><td>slow for large n</td><td>excellent</td></tr>
    <tr><td>p-values, confidence intervals</td><td>yes</td><td>yes</td><td>limited</td><td>no</td></tr>
  </table>
  <p>In practice: for one or two inputs with a gentle bend, especially when you need p-values, a centred quadratic (plus perhaps one interaction) is ideal, as it was for the houses. For a smooth effect of unknown shape that you need to explain, use splines, or a GAM if there are several inputs. For a threshold or saturation, use a hinge. For a known period such as day, week or year, use Fourier terms. For tabular data with many inputs and interactions you cannot anticipate, gradient boosting (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>) usually wins, because trees build their own step-function basis and find interactions automatically. And if you must extrapolate, use a straight line or a model based on domain knowledge, never a high-degree polynomial.</p>

  <h2 id="pr-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake is choosing the degree by training error. Training error falls with every extra degree, all the way to zero, so it always picks the most complex model. On the houses, training SSE went 34 → 9.89 → 3.09 → 0.19 → 0 while leave-one-out error said degree 2 was best. The fix is to score the whole pipeline with cross-validation:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import cross_val_score, LeaveOneOut
X = size[:, None]
for d in range(1, 5):
    pipe = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression())
    train = mean_squared_error(price, pipe.fit(X, price).predict(X))
    cv = -cross_val_score(pipe, X, price, cv=LeaveOneOut(), scoring="neg_mean_squared_error").mean()
    print(f"degree {d}: train MSE {train:6.3f}   leave-one-out MSE {cv:6.2f}")</div>
  <div class="fx" data-lang="text">degree 1: train MSE  5.667   leave-one-out MSE  18.96
degree 2: train MSE  1.649   leave-one-out MSE  14.30
degree 3: train MSE  0.515   leave-one-out MSE  24.38
degree 4: train MSE  0.032   leave-one-out MSE  17.15</div>
  <p>Training error picks degree 4 here (and would pick 5 if it could), while the cross-validated error clearly prefers degree 2. The second is forgetting to scale. Raw powers of large numbers make XᵀX numerically singular (raw years cubed gave a condition number of 10²²), x and x² are highly correlated (0.991 for the house sizes), and penalties treat columns of different sizes unfairly. Put <code>StandardScaler</code> after <code>PolynomialFeatures</code> in the pipeline, and another one before it for large raw values.</p>
  <p>The third is trusting the curve outside the data. Degree 5 priced an 1,800 sq ft flat at 152 lakh, degree 15 predicted −214 for a sine wave bounded by 1, and even the sensible quadratic has its lowest point at −640 sq ft. A polynomial is only meaningful inside the range it was fitted on.</p>
  <p>The fourth is reading b₁ as "the effect of x". With x² in the model, the effect of x is b₁ + 2b₂x and changes along the range; with a product a·b, the effect of a is b₁ + b₃·b. The raw b₁ = 2.58 for the houses is the slope at a flat of 0 sq ft. Centre the inputs, or report the slope at typical values.</p>
  <p>The fifth is keeping a product term without its main effects, for example size·metro without metro. That forces the Metro difference to be zero at size 0, an assumption almost nobody intends. Follow the hierarchy principle. Related to this is expanding everything: running <code>PolynomialFeatures</code> over every numeric and one-hot column at degree 3 can create tens of thousands of columns, including exact duplicates (a dummy squared is itself). Expand only the columns you believe bend.</p>
  <p>The last is leakage: fitting <code>PolynomialFeatures</code>, <code>SplineTransformer</code> or the scaler on all the data before cross-validation lets the validation rows influence the features. Always cross-validate the whole pipeline. And remember that polynomial terms fix the <em>shape</em> of the mean only; the other assumptions of linear regression, such as constant error variance and independent errors, still need checking after you add them.</p>

  <h2 id="pr-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Nonlinear relationship</b>: the effect of one more unit of x depends on x. Sign: a pattern (smile, frown, S) in the residuals.</li>
    <li><b>Polynomial regression (degree d)</b>: OLS on x, x², …, x<sup>d</sup>. Linear in the weights, so OLS, p-values and diagnostics all still apply.</li>
    <li><b>Polynomial features</b>: all products of inputs with total power ≤ d; C(k + d, d) − 1 columns without the bias.</li>
    <li><b>Interaction</b>: the effect of a depends on b; represented by the product column a·b.</li>
    <li><b>Basis expansion</b>: ŷ = w₀ + Σ wⱼφⱼ(x) with fixed functions φⱼ; OLS only finds the w's.</li>
    <li><b>Knot</b>: a point where a piecewise basis (hinge, spline) may change its formula.</li>
    <li><b>Overfitting / underfitting</b>: low train, high test error / both errors high. Degree is the dial.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Quadratic</td><td>ŷ = b₀ + b₁x + b₂x²; slope b₁ + 2b₂x; turning point x = −b₁ / (2b₂)</td></tr>
    <tr><td>Orthogonal column weight</td><td>w = Σ(col·y) / Σcol²</td></tr>
    <tr><td>Column count</td><td>C(k + d, d) − 1</td></tr>
    <tr><td>Interaction slope</td><td>∂ŷ/∂a = b₁ + b₃·b</td></tr>
    <tr><td>Hinge</td><td>max(0, x − c)</td></tr>
    <tr><td>RBF</td><td>exp(−(x − c)² / (2s²))</td></tr>
    <tr><td>LOOCV for OLS</td><td>mean of (eᵢ / (1 − hᵢ))²</td></tr>
  </table>
  <h3>The six houses</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Train SSE</th><th>LOOCV MSE</th><th>Price at 1,800 sq ft</th></tr>
    <tr><td>line −16 + 7·size</td><td>34</td><td>18.96</td><td>110</td></tr>
    <tr><td>quadratic 58.66 + 7z + 0.2009z²</td><td>9.89</td><td>14.30</td><td>117.5</td></tr>
    <tr><td>degree 3</td><td>3.09</td><td>24.38</td><td>125.7</td></tr>
    <tr><td>degree 5</td><td>0</td><td>–</td><td>152</td></tr>
    <tr><td>hinge at 1,100 sq ft (slopes 5.875 → 8.125)</td><td>13.75</td><td>–</td><td>–</td></tr>
    <tr><td>degree 5 + Ridge(0.1)</td><td>9.54</td><td>–</td><td>121.4</td></tr>
  </table>
  <h3>Bases compared</h3>
  <table class="tbl">
    <tr><th>Basis</th><th>Character</th><th>Use for</th></tr>
    <tr><td>Polynomial</td><td>global, smooth; explodes at edges</td><td>degree 2–3, one or two inputs</td></tr>
    <tr><td>Steps / bins</td><td>local, jumpy, robust</td><td>scorecards, coarse effects</td></tr>
    <tr><td>Hinges</td><td>straight pieces with corners</td><td>thresholds, saturation</td></tr>
    <tr><td>Splines</td><td>local, smooth; natural splines extrapolate linearly</td><td>default smooth 1-D effect, GAMs</td></tr>
    <tr><td>RBF</td><td>bumps; width = smoothness</td><td>kernel methods</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.preprocessing import PolynomialFeatures, SplineTransformer, StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import GridSearchCV

poly = make_pipeline(PolynomialFeatures(degree=2, include_bias=False), StandardScaler(), LinearRegression())
spline = make_pipeline(SplineTransformer(n_knots=6, degree=3), LinearRegression())
grid = GridSearchCV(make_pipeline(PolynomialFeatures(), StandardScaler(), Ridge()),
                    {"polynomialfeatures__degree": [1, 2, 3, 5], "ridge__alpha": [0.01, 0.1, 1]}, cv=5)
# statsmodels: smf.ols("price ~ size + I(size**2)", df);  "y ~ a * b" = a + b + a:b</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Never choose degree, knots or α by training error; cross-validate the whole pipeline.</li>
    <li>Centre or standardise before and after creating powers.</li>
    <li>Polynomials explode outside the data; prefer natural splines if edges matter.</li>
    <li>With x² or a·b in the model, b₁ is the slope at x = 0, not "the effect".</li>
    <li>Keep main effects when you keep their product; don't expand dummy columns.</li>
  </ul>

  <h2 id="pr-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Polynomial regression fits a curve. Why is it still called a linear model?</summary><div class="qa-body">Because it is linear in its parameters. ŷ = b₀ + b₁x + b₂x² is a weighted sum of fixed columns (1, x, x²), so least squares, the normal equation, standard errors and p-values all work unchanged. "Linear" refers to the weights, not to the shape of the curve in x.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you notice that a linear model needs a curve?</summary><div class="qa-body">Plot the residuals against x or against the predictions. A pattern, such as a smile (positive at both ends, negative in the middle), means the straight line is missing a bend. Domain knowledge and binned-average plots help too. A high R² does not rule out curvature: the houses' straight line had R² 0.990 and still showed a clear smile.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many columns does PolynomialFeatures create for 10 inputs at degree 3?</summary><div class="qa-body">C(10 + 3, 3) = 286 including the constant column, so 285 without it. In general the count is C(k + d, d), which grows roughly like k<sup>d</sup> / d!, so 50 inputs at degree 3 already give 23,425 columns. That growth is why high-degree expansions need a penalty or a small degree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training error keeps falling as you increase the degree. Why, and what do you do about it?</summary><div class="qa-body">A higher-degree model contains every lower-degree model (just set the extra weights to zero), so its best training error can only be equal or lower, and with n points degree n − 1 fits them exactly. Training error therefore cannot choose the degree. Use cross-validation instead, optionally with the one-standard-error rule, and keep the test set for a final check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the bias–variance trade-off in terms of polynomial degree?</summary><div class="qa-body">A low degree is too rigid to follow the true curve, so it has high bias and both train and test errors are high. A high degree can follow noise, so its fit changes a lot from sample to sample: high variance, low training error, high test error. Test error forms a U-shape against degree, and the best degree sits at the bottom of the U, where bias and variance are balanced.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you centre or standardise x before creating powers?</summary><div class="qa-body">First, x and x² are highly correlated on a positive range (0.991 for sizes 6 to 16), which causes multicollinearity and unstable coefficients; centring removes most of that correlation. Second, powers of large numbers are huge, which makes XᵀX numerically ill-conditioned (condition number about 10²² for raw years cubed). Third, penalties and gradient descent need columns on comparable scales. The predictions of a well-solved model do not change; stability and interpretation do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In ŷ = 58.66 + 7z + 0.2009z² with z = size − 11, what is the effect of size?</summary><div class="qa-body">It is the derivative, 7 + 0.402z, so it depends on the size: about 5 lakh per 100 sq ft for a 600 sq ft flat, 7 at the average flat, and 9 for a 1,600 sq ft flat. The coefficient 7 alone is the slope at the average size, which is why centring makes coefficients readable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an interaction term and how do you interpret its coefficient?</summary><div class="qa-body">It is a product column a·b, used when the effect of a depends on the value of b. In ŷ = b₀ + b₁a + b₂b + b₃ab the slope of a is b₁ + b₃b, so b₃ is how much a's slope changes per unit of b. For the houses, size added 6.4 lakh per 100 sq ft outside Metro and 7.83 inside. Keep a and b in the model whenever you keep a·b.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You add x² and the p-value of x becomes large. Should you drop x?</summary><div class="qa-body">No. With x² in the model, the coefficient of x is the slope at x = 0, which may be far outside the data and poorly determined, and x and x² are correlated, which inflates standard errors. Keep lower-order terms when a higher-order one is present (the hierarchy principle), and centre x to make the coefficients meaningful.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a basis function expansion? Give examples besides powers.</summary><div class="qa-body">It means replacing x with a set of fixed functions φ₁(x), …, φ<sub>m</sub>(x) and fitting a linear model on them. Examples: step functions (bins), hinges max(0, x − c), B-splines, Gaussian radial basis functions exp(−(x − c)² / 2s²), and Fourier sine and cosine terms for seasonality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are splines usually preferred over high-degree polynomials?</summary><div class="qa-body">Splines are local: each piece only affects the curve near its knots, so one point cannot swing the whole fit, the columns stay small and well conditioned, and natural splines continue as straight lines beyond the data. High-degree polynomials are global, ill-conditioned, wobble near the edges (Runge's phenomenon) and explode outside the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a knot, and how do you choose how many to use?</summary><div class="qa-body">A knot is a point where a piecewise basis is allowed to change its formula: a hinge bends there, a spline switches to a new cubic with matching value, slope and curvature. More knots means more flexibility and more variance. Place knots at quantiles of x and choose their number by cross-validation, or use many knots with a smoothness penalty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which would you trust to extrapolate: a cubic polynomial, a cubic spline or a decision tree?</summary><div class="qa-body">None of them fully. A polynomial heads to plus or minus infinity (the cubic predicted 19.7 for a sine wave bounded by 1). A natural spline continues linearly and scikit-learn's spline holds its edge value by default. A tree predicts a constant beyond its last split. Real extrapolation needs a model whose behaviour outside the data comes from domain knowledge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the leave-one-out shortcut for least squares?</summary><div class="qa-body">The error on row i when that row is left out equals its ordinary residual divided by (1 − hᵢ), where hᵢ is its leverage, the diagonal of the hat matrix. So LOOCV error can be computed from a single fit. For house F under the straight line: 4 / (1 − 0.524) = 8.4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does regularization interact with polynomial features?</summary><div class="qa-body">Polynomial columns are numerous and correlated, and a high degree overfits with huge, cancelling weights (2,257 for degree 5 on six houses). A ridge or lasso penalty keeps all the columns but makes large weights costly, which gives a smooth curve without hand-picking the degree: Ridge(0.1) at degree 5 behaved like the quadratic. The columns must be standardised first, and α is chosen by cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need a pipeline when using PolynomialFeatures with cross-validation?</summary><div class="qa-body">Any step that learns from data, such as the scaler's means and standard deviations or a spline's knot positions, must be fitted only on the training folds. If you transform all the data first and then cross-validate the regression, information from the validation rows leaks into training and the score is optimistic. A pipeline refits every step inside each fold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are kernels and neural networks related to basis functions?</summary><div class="qa-body">An RBF kernel corresponds to an RBF basis with one bump per training point, used implicitly through the kernel trick instead of building the columns. A ReLU hidden layer is a set of hinge basis functions whose knots and directions are learned by gradient descent. Both follow the same recipe as polynomial regression: features, then a linear model on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose polynomial features over a tree-based model?</summary><div class="qa-body">When there are few inputs with smooth, gentle bends, when you need interpretable coefficients and p-values, or when a smooth prediction surface matters. With many inputs and unknown interactions, gradient-boosted trees usually do better because they build their own basis and find interactions automatically, though they predict flat outside the data.</div></details>
</main>
`
});
