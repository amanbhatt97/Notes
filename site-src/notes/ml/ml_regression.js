// notes/ml/ml_regression.js — Linear Regression
Object.assign(TOPIC_CONTENT, {
  "ml_regression": `<main>
  <h1>Linear Regression</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Linear Regression</span></div>
  <p class="lead">Linear regression predicts a number, such as a flat's price, a month's rent or a delivery time, as a constant plus a weighted sum of the input columns. It is the simplest real model in machine learning, the baseline every other regressor is compared against, and the one model whose every number you can compute by hand, so it is the best place to learn what "fitting" actually means. We will use one running example for the whole page: six flats, A to F, sold by a small property dealer, with their size, number of bedrooms, locality and sale price. We will find the best straight line through them by calculus, then with matrices, then by gradient descent; read its weights in plain words; measure how good and how certain it is; and finally use it in scikit-learn. The same six flats continue through the other notes of the Regression group.</p>

  <h2 id="lr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linear Regression</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The model</div>
        <ul>
          <li>ŷ = b + w₁x₁ + … + w_dx_d; the truth adds noise ε</li>
          <li>"Linear" means linear in the weights; x² columns are allowed</li>
          <li>Residual e = y − ŷ; least squares minimises SSE = Σe²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Finding the weights</div>
        <ul>
          <li>One feature: w = S_xy / S_xx, b = ȳ − w·x̄ (six flats: 7 and −16)</li>
          <li>Many features: normal equation XᵀXw = Xᵀy</li>
          <li>Gradient descent reaches the same answer step by step</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading and scoring</div>
        <ul>
          <li>wⱼ = change in ŷ per unit of xⱼ, others held fixed</li>
          <li>R² = 1 − SSE/SST; RMSE = typical miss in y's units</li>
          <li>Categories enter as k − 1 dummy columns</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How sure</div>
        <ul>
          <li>s² = SSE/(n − p); se from s²(XᵀX)⁻¹; t = coef/se</li>
          <li>Confidence interval: the average; prediction interval: one new case</li>
          <li>All of it assumes well-behaved errors (next note)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lr-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Regression Problem</span><span class="rm-sub">six flats and a model for their prices</span></div></div>
      <div class="rm-item rm-done" data-target="lr-ls"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Least Squares</span><span class="rm-sub">scoring a line and finding the best one by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lr-matrix"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Normal Equation</span><span class="rm-sub">many features at once, with matrices</span></div></div>
      <div class="rm-item rm-done" data-target="lr-geom"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Why Least Squares Works</span><span class="rm-sub">projection, Gauss–Markov, maximum likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="lr-gd"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Gradient Descent</span><span class="rm-sub">the same answer, one step at a time</span></div></div>
      <div class="rm-item rm-done" data-target="lr-interp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Interpreting Coefficients</span><span class="rm-sub">units, "holding others fixed", logs</span></div></div>
      <div class="rm-item rm-done" data-target="lr-score"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">R² and RMSE</span><span class="rm-sub">how good is the line?</span></div></div>
      <div class="rm-item rm-done" data-target="lr-sm"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Standard Errors, t and p</span><span class="rm-sub">the statsmodels summary, rebuilt by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lr-pi"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Prediction Intervals</span><span class="rm-sub">a price range for one new flat</span></div></div>
      <div class="rm-item rm-done" data-target="lr-cat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Categorical Features</span><span class="rm-sub">dummy columns and the dummy trap</span></div></div>
      <div class="rm-item rm-done" data-target="lr-sk"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">scikit-learn and From Scratch</span><span class="rm-sub">a real pipeline, and 25 lines of numpy</span></div></div>
      <div class="rm-item rm-done" data-target="lr-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">training R², extrapolation, misreading weights</span></div></div>
      <div class="rm-item rm-done" data-target="lr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="lr-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about linear regression</span></div></div>
    </div>
  </div>

  <h2 id="lr-problem"><span class="num">01</span>The Regression Problem</h2>
  <p>A family wants to sell their 1,300 sq ft flat and asks what price to put on it. A food-delivery app wants to promise a delivery time before the rider has even left. A landlord wants to set a rent from a flat's size, its distance to the metro and its city. In all three cases the answer is a number on a continuous scale, and we have past examples where that number is known. Learning to predict such a number from past examples is called <strong>regression</strong>. (The name is an accident of history: Francis Galton used it in the 1880s when he noticed that very tall parents tend to have children who "regress" toward average height.) If the answer were a category instead, such as spam or not spam, the task would be classification, which starts in <a class="xref" data-note="ml_classification">Logistic Regression</a>.</p>
  <p>Here is the data we will use throughout. A small property dealer sold six flats last year. Size is in hundreds of square feet, so 6 means 600 sq ft, and price is in lakh rupees.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
houses = pd.DataFrame({
    "house":    list("ABCDEF"),
    "size":     [6, 8, 10, 12, 14, 16],          # floor area, hundreds of sq ft (6 = 600 sq ft)
    "rooms":    [1, 2, 2, 3, 3, 4],              # bedrooms
    "locality": ["Old town", "Suburb", "Metro", "Old town", "Suburb", "Metro"],
    "price":    [28, 40, 53, 66, 79, 100],       # sale price, lakh rupees
})
print(houses.to_string(index=False))</div>
  <div class="fx" data-lang="text">house  size  rooms locality  price
    A     6      1 Old town     28
    B     8      2   Suburb     40
    C    10      2    Metro     53
    D    12      3 Old town     66
    E    14      3   Suburb     79
    F    16      4    Metro    100</div>
  <p>Even by eye there is a pattern: price climbs steadily with size, about 12 or 13 lakh for every extra 200 sq ft, and a little faster at the big end (F is 21 lakh more than E). Bigger flats also tend to have more bedrooms. What the dealer wants is a single formula that captures this pattern, so that a new flat can be priced from its size.</p>
  <p>The simplest formula that could do this is a straight line: price ≈ b + w × size. The number <strong>w</strong> is the <strong>slope</strong> or <strong>weight</strong>: how many lakh the price rises for each extra 100 sq ft. The number <strong>b</strong> is the <strong>intercept</strong> or <strong>bias</strong>: the predicted price when size is zero, which is simply where the line crosses the vertical axis. Together w and b are the model's <strong>parameters</strong>, and "training" the model means choosing them. With several columns the formula becomes ŷ = b + w₁x₁ + w₂x₂ + … + w_dx_d, a constant plus a weighted sum of the features, and that is all <strong>linear regression</strong> is. The little hat on ŷ ("y-hat") marks it as a prediction rather than a real price.</p>
  <p>Linear regression also assumes a story about where the data came from: y = b + w₁x₁ + … + w_dx_d + ε. The weighted sum is the part of the price that size and bedrooms explain. The extra term <strong>ε</strong> (epsilon), the <strong>error</strong> or noise, is everything else: how urgently the buyer needed a flat, the view from the balcony, all the things the dealer never recorded. Think of a chai stall whose daily sales are "200 cups, plus 15 cups for every degree below 20 °C, plus a random amount for whatever happened that day (a cricket match nearby, a festival)". The "200 plus 15 per degree" is the line; the random amount is ε. Looking at a month of sales, you try to recover 200 and 15, and you accept that the random part can never be predicted. In the same way, our job is to estimate b and w from six flats, and later to say how uncertain those estimates are.</p>
  <p>One word in the name causes a lot of confusion. "Linear" means linear in the <em>parameters</em>: each weight multiplies something and the results are added. The things being multiplied can be anything you compute from the data, such as size², log of size or size × bedrooms. So ŷ = b + w₁x + w₂x² is still linear regression even though its graph is a curve; the Regression group fits exactly that curve to these six flats in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>. What linear regression cannot do is put a parameter inside a non-linear function, as in ŷ = b·e^(wx).</p>

  <h2 id="lr-ls"><span class="num">02</span>Least Squares</h2>
  <p>Before we can find the best line we need a way to say how bad any particular line is. Take a candidate line and, for each flat, compare the real price with the line's prediction. The gap eᵢ = yᵢ − ŷᵢ is called the <strong>residual</strong>: positive when the flat sold for more than the line predicts (the point sits above the line), negative when it sold for less. We measure the gap vertically, in price, because price is what we are predicting and price errors are what cost money.</p>
  <p>Six residuals have to be turned into one score. Simply adding them does not work, because positive and negative misses cancel and a terrible line could score zero. We could add their absolute values, or we could add their squares. Linear regression adds the squares, and the total is called the <strong>sum of squared errors</strong>, SSE (also called RSS, the residual sum of squares). Choosing the line with the smallest SSE is called <strong>ordinary least squares</strong>, or OLS. Squares are chosen for three reasons. A square is smooth everywhere, while |e| has a sharp corner at zero, so calculus can give an exact formula for the best line. The total of squares, viewed as a function of the weights, is shaped like a bowl with a single lowest point, so there is exactly one best line. And, as section 04 shows, when the noise follows a bell curve, least squares is exactly what probability theory recommends. The price of squaring is that big misses dominate: a miss of 6 costs 36, while six misses of 1 cost only 6, so one wild flat can pull the line hard. <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> compares squared loss with absolute and Huber loss.</p>
  <p>Now, which line has the smallest SSE? Picture the SSE as a bowl. Every point on the floor of the bowl is one choice of (w, b), and the height above it is that line's SSE. A marble dropped into a bowl rolls down and stops at the bottom, where the surface is perfectly level in every direction. "Level" means the slope is zero, so at the best line the derivative of SSE with respect to b is zero and the derivative with respect to w is zero. That gives two equations for two unknowns.</p>
  <p>Write SSE(w, b) = Σ(yᵢ − wxᵢ − b)². Differentiating with respect to b with the chain rule gives −2Σ(yᵢ − wxᵢ − b). Setting this to zero and dividing by the number of rows n gives ȳ − w·x̄ − b = 0, so <strong>b = ȳ − w·x̄</strong>. In plain words, the best line always passes through the point of averages (x̄, ȳ), and because Σ(yᵢ − ŷᵢ) = 0 at the solution, the residuals of any least-squares line with an intercept add up to exactly zero. Differentiating with respect to w gives −2Σxᵢ(yᵢ − wxᵢ − b). Setting it to zero, substituting the formula for b and tidying up gives the slope:</p>
  <p><strong>w = S_xy / S_xx = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²</strong></p>
  <p>S_xy measures how x and y move together: it is large and positive when flats above average size are also above average price. S_xx measures how spread out the sizes are. So the slope is "how much x and y move together, divided by how much x moves on its own", which is the covariance of x and y divided by the variance of x.</p>
  <p>Let us do it by hand. The average size is x̄ = 66/6 = 11 and the average price is ȳ = 366/6 = 61.</p>
  <table class="tbl">
    <tr><th>flat</th><th>x</th><th>y</th><th>x − 11</th><th>y − 61</th><th>product</th><th>(x − 11)²</th><th>ŷ = −16 + 7x</th><th>residual</th></tr>
    <tr><td>A</td><td>6</td><td>28</td><td>−5</td><td>−33</td><td>165</td><td>25</td><td>26</td><td>+2</td></tr>
    <tr><td>B</td><td>8</td><td>40</td><td>−3</td><td>−21</td><td>63</td><td>9</td><td>40</td><td>0</td></tr>
    <tr><td>C</td><td>10</td><td>53</td><td>−1</td><td>−8</td><td>8</td><td>1</td><td>54</td><td>−1</td></tr>
    <tr><td>D</td><td>12</td><td>66</td><td>1</td><td>5</td><td>5</td><td>1</td><td>68</td><td>−2</td></tr>
    <tr><td>E</td><td>14</td><td>79</td><td>3</td><td>18</td><td>54</td><td>9</td><td>82</td><td>−3</td></tr>
    <tr><td>F</td><td>16</td><td>100</td><td>5</td><td>39</td><td>195</td><td>25</td><td>96</td><td>+4</td></tr>
    <tr><td colspan="5"><strong>sums</strong></td><td><strong>S_xy = 490</strong></td><td><strong>S_xx = 70</strong></td><td></td><td><strong>0</strong></td></tr>
  </table>
  <p>The slope is w = 490/70 = 7 lakh per 100 sq ft, and the intercept is b = 61 − 7 × 11 = −16 lakh. The best line is <strong>price = −16 + 7 × size</strong>. Every product in the sixth column is positive because every flat above average size is also above average price, which is why the slope is steep and positive. The code checks the arithmetic and then scores four other lines, the last of which is the lazy flat line that predicts the average price, 61, for every flat:</p>
  <div class="fx" data-lang="py">x = houses["size"].to_numpy(float)             # size, hundreds of sq ft
y = houses["price"].to_numpy(float)            # price, lakh rupees
dx, dy = x - x.mean(), y - y.mean()
w = (dx * dy).sum() / (dx ** 2).sum()          # slope = S_xy / S_xx
b = y.mean() - w * x.mean()                    # intercept = y_bar - w * x_bar
print("S_xy", (dx * dy).sum(), " S_xx", (dx ** 2).sum())
print(f"slope w = {w:.3f}   intercept b = {b:.3f}")
res = y - (b + w * x)
print("residuals", res + 0.0, " sum", res.sum() + 0.0, " SSE", (res ** 2).sum())
for bb, ww in [(-10, 6.5), (-20, 7.5), (0, 5.5), (61, 0)]:   # other lines are all worse
    print(f"line {bb:4} + {ww}x   SSE = {((y - (bb + ww * x)) ** 2).sum():.0f}")</div>
  <div class="fx" data-lang="text">S_xy 490.0  S_xx 70.0
slope w = 7.000   intercept b = -16.000
residuals [ 2.  0. -1. -2. -3.  4.]  sum 0.0  SSE 34.0
line  -10 + 6.5x   SSE = 53
line  -20 + 7.5x   SSE = 65
line    0 + 5.5x   SSE = 193
line   61 + 0x   SSE = 3464</div>
  <p>The residuals sum to zero, as promised, and SSE is 34. Every other line does worse: 53, 65, 193, and 3,464 for the lazy flat line. Keep the residual pattern in mind, <strong>+2, 0, −1, −2, −3, +4</strong>: positive at both ends and negative in the middle. That shape is a clue that a straight line is not quite the right shape for these flats, and <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> follows it up.</p>
<figure class="viz"><svg viewBox="0 0 520 270" width="520">
<line x1="60" y1="230" x2="500" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="186" text-anchor="end" class="tm" font-size="11">25</text><text x="52" y="139" text-anchor="end" class="tm" font-size="11">50</text><text x="52" y="91" text-anchor="end" class="tm" font-size="11">75</text><text x="52" y="43" text-anchor="end" class="tm" font-size="11">100</text>
<text x="123" y="246" text-anchor="middle" class="tm" font-size="11">6</text><text x="186" y="246" text-anchor="middle" class="tm" font-size="11">8</text><text x="249" y="246" text-anchor="middle" class="tm" font-size="11">10</text><text x="311" y="246" text-anchor="middle" class="tm" font-size="11">12</text><text x="374" y="246" text-anchor="middle" class="tm" font-size="11">14</text><text x="437" y="246" text-anchor="middle" class="tm" font-size="11">16</text>
<text x="280" y="264" text-anchor="middle" class="tm" font-size="11.5">size (hundreds of sq ft)</text><text x="66" y="16" class="tm" font-size="11.5">price (lakh ₹)</text>
<line x1="60" y1="114" x2="480" y2="114" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="478" y="108" text-anchor="end" class="tm" font-size="11">ȳ = 61</text>
<line x1="60" y1="207" x2="500" y2="20" class="sb" stroke-width="2.2"/>
<line x1="123" y1="177" x2="123" y2="180" class="sr" stroke-width="3"/>
<line x1="249" y1="129" x2="249" y2="127" class="sr" stroke-width="3"/>
<line x1="311" y1="104" x2="311" y2="100" class="sr" stroke-width="3"/>
<line x1="374" y1="79" x2="374" y2="73" class="sr" stroke-width="3"/>
<line x1="437" y1="39" x2="437" y2="47" class="sr" stroke-width="3"/>
<circle cx="123" cy="177" r="5" class="ft st"/><circle cx="186" cy="154" r="5" class="ft st"/><circle cx="249" cy="129" r="5" class="ft st"/><circle cx="311" cy="104" r="5" class="ft st"/><circle cx="374" cy="79" r="5" class="ft st"/><circle cx="437" cy="39" r="5" class="ft st"/>
<text x="113" y="170" text-anchor="end" font-size="11">A</text><text x="176" y="148" text-anchor="end" font-size="11">B</text><text x="239" y="122" text-anchor="end" font-size="11">C</text><text x="321" y="116" font-size="11">D</text><text x="384" y="92" font-size="11">E</text><text x="427" y="34" text-anchor="end" font-size="11">F</text>
<text x="300" y="60" class="tb" font-size="12.5">ŷ = −16 + 7x</text>
<circle cx="280" cy="114" r="4" class="fg sg"/><text x="288" y="130" class="tg" font-size="11">(x̄, ȳ) = (11, 61)</text>
</svg><figcaption>The six houses and the least-squares line we will derive. The residuals (red, vertical) are small at this scale: at most 4 lakh. The line passes through the point of averages (11, 61).</figcaption></figure>
  <p>The figure shows the six flats, the line and the residuals as short red vertical bars. They are small at this scale, at most 4 lakh, and the line passes through the green point of averages (11, 61). If you fix b at its best value for each slope and plot SSE against w, you get SSE(w) = 34 + 70(w − 7)², a parabola with its bottom at w = 7: the bowl from the marble picture, seen from the side.</p>
  <p>One more subtlety is worth knowing. Regressing price on size and regressing size on price give two different lines, because the first minimises vertical gaps and the second horizontal ones. The slope of price on size is 7, so you might expect size on price to be 1/7 = 0.1429, but it is S_xy / S_yy = 490/3464 = 0.1415. They only agree when the points lie exactly on a line. Always decide first which variable you are predicting.</p>

  <h2 id="lr-matrix"><span class="num">03</span>The Normal Equation</h2>
  <p>The slope formula handles one feature. The dealer also knows each flat's bedrooms, and a real model may have dozens of columns. Writing a separate derivative for every weight quickly becomes a mess. Matrices let us write every row and every weight at once, so that one formula covers any number of features.</p>
  <p>Put the data in a table X with one row per flat. Its first column is all 1s, and the remaining columns are the features. Stack the parameters into one vector w = [b, w₁, …, w_d]. Then the prediction for every flat at once is the matrix product <strong>ŷ = Xw</strong>: each row of X is multiplied by the weights and added up, and the column of 1s multiplies b, which is how the intercept gets in. The residuals are the vector y − Xw, and SSE is its squared length, ‖y − Xw‖².</p>
  <p>Setting the gradient of this SSE to zero (the many-variable version of "the bottom of the bowl is flat") gives −2Xᵀ(y − Xw) = 0, which rearranges to</p>
  <p><strong>XᵀX w = Xᵀy</strong>, so w = (XᵀX)⁻¹Xᵀy.</p>
  <p>This is called the <strong>normal equation</strong>. It is really one ordinary equation per parameter, packed together. XᵀX is a small square table of sums: for one feature it is [[n, Σx], [Σx, Σx²]], and Xᵀy is [Σy, Σxy]. For our flats, n = 6, Σx = 66, Σx² = 796, Σy = 366 and Σxy = 4516, so the normal equation is the pair 6b + 66w = 366 and 66b + 796w = 4516. The determinant of the 2 × 2 table is 6 × 796 − 66² = 420, and solving gives b = (796 × 366 − 66 × 4516)/420 = −16 and w = (6 × 4516 − 66 × 366)/420 = 7, exactly the line from section 02, as it must be.</p>
  <p>Does the flat point have to be the bottom rather than a peak? The second derivative is 2XᵀX, and for any vector v, vᵀXᵀXv = ‖Xv‖² is never negative, so the SSE is a bowl that opens upward. If no column of X is an exact combination of the others, XᵀX can be inverted and the answer is unique. The code solves the system for size alone and then for size and bedrooms together:</p>
  <div class="fx" data-lang="py">X = np.c_[np.ones(6), x]                        # column of 1s (intercept) + size
XtX, Xty = X.T @ X, X.T @ y
print("X^T X =", XtX.tolist(), "  X^T y =", Xty.tolist())
w = np.linalg.solve(XtX, Xty)                   # solves (X^T X) w = X^T y, no inverse formed
print("solve:", w + 0.0, "  lstsq:", np.linalg.lstsq(X, y, rcond=None)[0].round(6) + 0.0)
print("X^T e =", (X.T @ (y - X @ w)).round(8) + 0.0)   # residuals are perpendicular to every column

X3 = np.c_[np.ones(6), x, rooms]                # now size AND bedrooms
print("size + rooms:", np.linalg.solve(X3.T @ X3, X3.T @ y).round(4))
print("corr(size, rooms) =", round(np.corrcoef(x, rooms)[0, 1], 3))</div>
  <div class="fx" data-lang="text">X^T X = [[6.0, 66.0], [66.0, 796.0]]   X^T y = [366.0, 4516.0]
solve: [-16.   7.]   lstsq: [-16.   7.]
X^T e = [0. 0.]
size + rooms: [-14.5833   6.2083   2.9167]
corr(size, rooms) = 0.968</div>
  <p><code>np.linalg.solve</code> solves the system directly, and <code>lstsq</code> uses a more robust method (the singular value decomposition) that also copes with redundant columns; both give −16 and 7. The line <code>X^T e = [0, 0]</code> is the normal equation written as Xᵀ(y − Xw) = 0, and section 04 explains what it means geometrically.</p>
  <p>The last two lines are the interesting ones. With bedrooms included, the model becomes price = −14.58 + 6.21 × size + 2.92 × bedrooms. Size alone was worth 7 lakh per 100 sq ft, but with bedrooms in the model it is worth only 6.21. That is not a contradiction. In this table bigger flats nearly always have more bedrooms (correlation 0.968), so when size was alone it took credit for the bedrooms that come with it. Section 06 shows the exact formula that links 7 and 6.21. The high correlation also makes the 2 × 2 system for these two columns nearly singular, which makes the separate weights unstable; <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> measures this as a VIF of 16 and <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> repairs it.</p>
  <p>In real code, never compute <code>np.linalg.inv(X.T @ X) @ X.T @ y</code>. Forming an explicit inverse loses accuracy when columns are nearly duplicates. Use <code>lstsq</code>, <code>solve</code>, or scikit-learn's <code>LinearRegression</code>, which uses an SVD-based least-squares solver. The cost of the closed-form solution is roughly O(nd²) to build XᵀX plus O(d³) to solve it, which is fast for thousands of features and becomes painful only for very wide or streaming data.</p>

  <h2 id="lr-geom"><span class="num">04</span>Why Least Squares Works</h2>
  <p>The normal equation is a recipe. Interviewers like to ask why it is the right recipe, and there are three answers that support each other: a picture, a guarantee and a probability argument.</p>
  <p>The picture first. Treat the six prices as a single arrow in six-dimensional space, one coordinate per flat. Every possible prediction Xw is some mix of X's columns (the column of 1s and the size column), so all possible predictions lie on a flat sheet inside that space, called the <strong>column space</strong> of X. The best prediction is the point on the sheet closest to the real prices, and the closest point is found the way you find your shadow at noon: drop a perpendicular. That shadow is ŷ = (26, 40, 54, 68, 82, 96), and the perpendicular part left over is the residual vector e = (2, 0, −1, −2, −3, 4). "The residual is perpendicular to every column of X" is exactly Xᵀe = 0, which is the normal equation. (That is where the name comes from: "normal" is an old word for perpendicular.)</p>
<figure class="viz"><svg viewBox="0 0 460 210" width="460">
<defs><marker id="lr-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<path d="M30 150 L250 175 L420 130 L200 105 Z" class="fs" stroke="currentColor"/>
<text x="30" y="198" class="tm" font-size="12">sheet = all possible Xw (column space of X)</text>
<line x1="120" y1="140" x2="260" y2="30" stroke="currentColor" stroke-width="2" marker-end="url(#lr-ah)"/>
<text x="266" y="28" font-size="13">y (actual prices)</text>
<line x1="120" y1="140" x2="260" y2="135" class="sb" stroke-width="2" marker-end="url(#lr-ah)"/>
<text x="266" y="150" class="tb" font-size="13">ŷ = Xŵ = Hy</text>
<line x1="260" y1="35" x2="260" y2="130" class="sr" stroke-width="2" stroke-dasharray="4 3"/>
<text x="268" y="88" class="tr" font-size="12">e = y − ŷ, perpendicular</text>
<path d="M260 122 h-8 v9" fill="none" stroke="currentColor"/>
</svg><figcaption>OLS finds the point of the sheet closest to y. The residual sticks out at a right angle: Xᵀe = 0.</figcaption></figure>
  <p>Substituting the solution gives ŷ = X(XᵀX)⁻¹Xᵀy = Hy. The matrix H is called the <strong>hat matrix</strong> because it puts the hat on y. Its diagonal entries are the <strong>leverages</strong>: how strongly each flat's own price pulls on its own prediction. For one feature, hᵢ = 1/n + (xᵢ − x̄)²/S_xx, so the end flats A and F have 1/6 + 25/70 = 0.524 while the middle flats C and D have only 0.181. The line pivots around its centre, so the ends can move it most. Leverage is the starting point of <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>
  <p>The right angle also guarantees several facts for every least-squares fit with an intercept: the residuals sum to zero, they are uncorrelated with every feature and with the predictions, the line passes through (x̄, ȳ), and the total spread splits like Pythagoras' theorem, SST = SSR + SSE, here 3464 = 3430 + 34. Because these hold by construction, they say nothing about whether the model is good. Our residuals average zero and still bend in a curve.</p>
  <p>The guarantee is the <strong>Gauss–Markov theorem</strong>. If the true relationship is linear and the errors have mean zero, the same spread for every row, and are uncorrelated with each other, then the least-squares weights are <strong>BLUE</strong>: the Best Linear Unbiased Estimator. "Unbiased" means that over many possible datasets the estimates average out to the true weights. "Best" means that no other unbiased estimator built as a linear combination of the y values wobbles less from sample to sample. Normal (bell-shaped) errors are not needed for this. And BLUE is not the same as "best model": a deliberately biased estimator like ridge regression can have lower total error, which is why <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> often predicts better.</p>
  <p>The probability argument is <strong>maximum likelihood</strong>. Suppose each error is drawn from a normal distribution with mean 0 and variance σ². The chance of seeing a price yᵢ is then proportional to exp(−(yᵢ − ŷᵢ)²/(2σ²)), and the log of the chance of the whole dataset is −(n/2)·log(2πσ²) − SSE/(2σ²). The only part that depends on the weights is −SSE/(2σ²), so making the data most likely is exactly the same as making SSE smallest. Plugging in the best σ² = SSE/n gives log L = −(n/2)(log 2π + log(SSE/n) + 1) = −13.717 for our flats, a number that appears in the statsmodels summary in section 08. The same idea with a different probability model gives <a class="xref" data-note="ml_classification">logistic regression</a>; adding a penalty to the bowl gives ridge and lasso.</p>

  <h2 id="lr-gd"><span class="num">05</span>Gradient Descent</h2>
  <p>The normal equation jumps straight to the bottom of the bowl, but only if we can build XᵀX and solve it. With hundreds of millions of rows that do not fit in memory, with data arriving as a stream, or with a loss that has no neat formula (logistic regression, neural networks), we need another way. <strong>Gradient descent</strong> starts anywhere on the bowl and repeatedly takes a small step downhill. The gradient points uphill, so we step in the opposite direction, and the step size is a number we choose called the <strong>learning rate</strong>, η. It is like walking down a hill in thick fog: you cannot see the valley, but you can feel which way the ground slopes under your feet, so you take a step that way and feel again. The general theory is in <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>; here we watch it find our line.</p>
  <p>We use the mean squared error, MSE = SSE/n, so the step size does not depend on how many rows we have. Its gradients are ∂MSE/∂b = −(2/n)Σeᵢ and ∂MSE/∂w = −(2/n)Σxᵢeᵢ, and each step does b ← b − η·∂MSE/∂b and w ← w − η·∂MSE/∂w. One practical trick: we centre the size first, c = x − 11, so the sizes become −5, −3, −1, 1, 3, 5. The slope is still 7, the intercept becomes the price of an average-size flat (61), and, as we will see, the two weights stop getting in each other's way.</p>
  <p>Two steps by hand, with η = 0.05 and starting from b = 0, w = 0. At the start every prediction is 0, so the residuals are just the prices; their sum is 366 and Σc·e = 490. The gradients are −(2/6)(366) = −122 and −(2/6)(490) = −163.3, so the first step moves to b = 0 + 0.05 × 122 = 6.1 and w = 0 + 0.05 × 163.3 = 8.17. The slope has overshot 7, because every prediction was far too low. At the second step the residuals are 62.73, 58.40, 55.07, 51.73, 48.40, 53.07, which sum to 329.4, with Σc·e = −81.67. That gives b = 6.1 + 0.05 × 109.8 = 11.59 and w = 8.17 − 0.05 × 27.22 = 6.81: the slope is pulled back and the intercept creeps up toward 61. The code continues, and then repeats the experiment on raw, uncentred size:</p>
  <div class="fx" data-lang="py">xc = x - x.mean()                             # centred size: -5, -3, -1, 1, 3, 5
b, w, lr = 0.0, 0.0, 0.05                     # start from the flat line y = 0
for step in range(1, 201):
    err = y - (b + w * xc)                    # residual of each house
    gb, gw = -2 * err.mean(), -2 * (err * xc).mean()   # dMSE/db, dMSE/dw
    b, w = b - lr * gb, w - lr * gw           # step downhill
    if step in (1, 2, 3, 10, 50, 200):
        print(f"step {step:3d}  b={b:7.3f} w={w:6.3f}  MSE={((y - b - w * xc) ** 2).mean():8.3f}")
print("in raw size units: intercept", round(b - w * x.mean(), 3), " slope", round(w, 3))

b, w, lr = 0.0, 0.0, 0.004                    # same algorithm on RAW size: needs a tiny step
for step in range(1, 20001):
    err = y - (b + w * x)
    b, w = b + lr * 2 * err.mean(), w + lr * 2 * (err * x).mean()
    if step in (1000, 20000):
        print(f"raw size, step {step:5d}: b={b:8.3f} w={w:6.3f}")</div>
  <div class="fx" data-lang="text">step   1  b=  6.100 w= 8.167  MSE=3035.556
step   2  b= 11.590 w= 6.806  MSE=2447.456
step   3  b= 16.531 w= 7.032  MSE=1983.171
step  10  b= 39.731 w= 7.000  MSE= 458.053
step  50  b= 60.686 w= 7.000  MSE=   5.766
step 200  b= 61.000 w= 7.000  MSE=   5.667
in raw size units: intercept -16.0  slope 7.0
raw size, step  1000: b=  -7.814 w= 6.321
raw size, step 20000: b= -16.000 w= 7.000</div>
  <p>Steps 1 and 2 match the hand calculation. With centred size the slope is right by step 10 and the intercept reaches 61 by step 200, where the MSE is 5.667, which is SSE 34 divided by 6. Converted back to raw size, the intercept is 61 − 7 × 11 = −16: the least-squares line again. On raw size the same algorithm needs a learning rate twelve times smaller (with 0.05 it blows up) and about 20,000 steps; after 1,000 steps it still says w = 6.32. Raw sizes of 6 to 16 make the bowl very steep in the w direction and shallow in the b direction, a long narrow valley where every step zig-zags. Centring or standardising the features makes the bowl round, so gradient descent walks almost straight to the bottom. That is why scaling matters for gradient descent but not for the normal equation.</p>
  <table class="tbl">
    <tr><th></th><th>Normal equation / SVD</th><th>Gradient descent</th></tr>
    <tr><td>Answer</td><td>exact, in one shot</td><td>approximate, improves with steps</td></tr>
    <tr><td>Cost</td><td>O(nd² + d³)</td><td>O(nd) per pass over the data</td></tr>
    <tr><td>Settings to choose</td><td>none</td><td>learning rate, number of steps, batch size</td></tr>
    <tr><td>Feature scaling</td><td>not needed</td><td>needed (200 vs 20,000 steps above)</td></tr>
    <tr><td>Huge or streaming data</td><td>hard</td><td>natural (mini-batches, <code>SGDRegressor</code>)</td></tr>
    <tr><td>Other losses</td><td>squared loss (and ridge) only</td><td>any differentiable loss</td></tr>
  </table>

  <h2 id="lr-interp"><span class="num">06</span>Interpreting Coefficients</h2>
  <p>The dealer does not care about S_xy. They want to know what the numbers mean. The rule is short: a coefficient wⱼ is the change in the prediction when xⱼ goes up by one unit and every other feature in the model stays the same. Its units are "units of y per unit of xⱼ". With size alone, w = 7 means "each extra 100 sq ft is associated with 7 lakh more". With size and bedrooms, w_size = 6.21 means "comparing two flats with the same number of bedrooms, 100 sq ft more is associated with 6.21 lakh more", and w_rooms = 2.92 means "same size, one more bedroom, 2.92 lakh more".</p>
  <p>The intercept is the prediction when every feature is zero. Here b = −16 says a flat of zero square feet sells for minus 16 lakh, which is nonsense: zero size is far outside the data (600 to 1,600 sq ft), and the intercept is only the anchor that positions the line. If you centre the features, as we did for gradient descent, the intercept becomes meaningful: 61 lakh for a flat of average size.</p>
  <p>Why does "holding the others fixed" change the number from 7 to 6.21? When a feature x₂ is left out of the model, x₁'s slope absorbs the part of x₂'s effect that travels along with x₁. The exact relationship is the <strong>omitted-variable formula</strong>: slope of x₁ alone = w₁ + w₂·δ, where δ is the slope you get by regressing x₂ on x₁, "how many extra bedrooms come with 100 more sq ft". For our flats, δ = 19/70 = 0.271, so 6.208 + 2.917 × 0.271 = 6.208 + 0.792 = 7.000. The extra 0.79 lakh in the size-only slope is really the value of the bedrooms that come with the size. The classic everyday example: ice-cream sales and drownings rise together, so if you regress drownings on ice-cream sales alone, ice-cream gets a positive coefficient. Add temperature to the model and ice-cream's coefficient falls to about zero, because holding temperature fixed, ice-cream has nothing to do with drowning. <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> returns to this as omitted-variable bias.</p>
  <p>Units change the number but not the model. To see that on a bigger table we use 300 simulated rented flats, where rent (in ₹ thousand a month) is built as 5 + 0.02 × size in sq ft − 1.5 × km to the metro − 0.1 × building age + a city effect + noise with SD 3. Because we simulated it, we know the true answers and can check the model against them. We fit it with size in square feet and again in hundreds of square feet, and then with every feature standardised:</p>
  <div class="fx" data-lang="py">def make_rent(n=300, seed=0):
    rng = np.random.default_rng(seed)
    city = rng.choice(["Delhi", "Mumbai", "Pune"], n)
    size = rng.uniform(500, 1800, n).round()               # sq ft
    metro = rng.uniform(0.2, 6, n).round(1)                # km to the metro
    age = rng.integers(0, 30, n)                           # building age, years
    effect = pd.Series(city).map({"Delhi": 0, "Mumbai": 8, "Pune": -3}).to_numpy()
    rent = 5 + 0.02 * size - 1.5 * metro - 0.1 * age + effect + rng.normal(0, 3, n)
    return pd.DataFrame({"size": size, "metro": metro, "age": age, "city": city, "rent": rent.round(1)})

from sklearn.linear_model import LinearRegression
df = make_rent()                                           # rent in Rs thousand per month
num = ["size", "metro", "age"]
d2 = df.assign(size_100=df["size"] / 100, metro_m=df["metro"] * 1000)   # same data, new units
for cols in (num, ["size_100", "metro_m", "age"]):
    m = LinearRegression().fit(d2[cols], d2["rent"])
    print({k: round(float(v), 5) for k, v in zip(cols, m.coef_)}, " R2", round(m.score(d2[cols], d2["rent"]), 4))
z = (df[num] - df[num].mean()) / df[num].std(ddof=0)       # standardise: mean 0, SD 1
mz = LinearRegression().fit(z, df["rent"])
print("per 1 SD:", {k: round(float(v), 2) for k, v in zip(num, mz.coef_)})</div>
  <div class="fx" data-lang="text">{'size': 0.01959, 'metro': -1.70849, 'age': -0.12213}  R2 0.6779
{'size_100': 1.95935, 'metro_m': -0.00171, 'age': -0.12213}  R2 0.6779
per 1 SD: {'size': 7.35, 'metro': -2.74, 'age': -1.03}</div>
  <p>The size coefficient goes from 0.0196 per sq ft to 1.96 per 100 sq ft, exactly 100 times larger, and the metro coefficient from −1.71 per km to −0.0017 per metre, while R² is identical in both fits. The predictions do not change; only the units of the weights do. So a large coefficient does not mean an important feature. To compare features, <strong>standardise</strong> them first (subtract the mean and divide by the standard deviation), so each weight means "change in rent per one standard deviation of the feature". Then size moves rent by 7.35, metro distance by 2.74 and age by 1.03: size matters most.</p>
  <p>Taking logs changes the reading from "units" to "percent". In a model of log y, a weight w means one more unit of x multiplies y by e^w, which is roughly a 100·w percent rise when w is small (w = 0.1 gives e^0.1 = 1.105, a 10.5% rise; but w = 0.5 gives 64.9%, not 50%). In a model of y on log x, a 1% rise in x adds w/100 units of y. With logs on both sides, w is an <strong>elasticity</strong>: a 1% rise in x gives about a w% change in y.</p>
  <p>Two warnings belong with every interpretation. Coefficients describe association in this data, not cause and effect: nobody showed that adding a bedroom to a flat would raise its price by 2.92 lakh. And "holding the others fixed" can describe a situation that never happens in the data: a 1,600 sq ft flat with one bedroom does not exist in our table, which is exactly why the separate size and bedroom weights are unstable.</p>

  <h2 id="lr-score"><span class="num">07</span>R² and RMSE</h2>
  <p>SSE = 34 is the smallest possible for a straight line, but is 34 good? On its own it has no scale: it is measured in lakh squared, and it grows with the number of flats. We need a score that compares the line against something sensible and a number that speaks in price units.</p>
  <p>The sensible comparison is the lazy model that ignores size and predicts the average price, 61, for every flat. Its SSE is called the <strong>total sum of squares</strong>, SST = Σ(yᵢ − ȳ)² = 33² + 21² + 8² + 5² + 18² + 39² = 3464. Our line leaves SSE = 34 unexplained. The <strong>coefficient of determination</strong>, R², is the fraction of the lazy model's squared error that the line removes: R² = 1 − SSE/SST = 1 − 34/3464 = 0.990. A value of 1 is a perfect fit, 0 is no better than the average, and on new data R² can even be negative, meaning worse than the average. With a single feature, R² is the square of the correlation between x and y.</p>
  <p>R² is a ratio, so it says nothing about the size of a typical miss. The <strong>root mean squared error</strong>, RMSE = √(SSE/n) = √(34/6) = 2.38 lakh, does: it is in the same units as the price. The <strong>mean absolute error</strong>, MAE = (2 + 0 + 1 + 2 + 3 + 4)/6 = 2.0 lakh, is the plain average miss and is less dominated by the biggest one.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
pred = -16 + 7 * x
print(f"R2 {r2_score(y, pred):.4f}   RMSE {mean_squared_error(y, pred) ** 0.5:.4f}   MAE {mean_absolute_error(y, pred):.2f}")
print(f"corr(x, y)^2 = {np.corrcoef(x, y)[0, 1] ** 2:.4f}")</div>
  <div class="fx" data-lang="text">R2 0.9902   RMSE 2.3805   MAE 2.00
corr(x, y)^2 = 0.9902</div>
  <p>The library numbers match the hand ones. Two cautions go with them. First, R² = 0.990 does not prove the shape is right: our residuals still bend, and a curve will do better. Second, R² on the training data can never go down when you add a column, even a column of random numbers, because the old solution is still available by giving the new column weight zero. That is why models are judged on held-out data (<a class="xref" data-note="ml_splits">Splits &amp; CV</a>), and why statsmodels also prints an <strong>adjusted R²</strong>, 1 − (1 − R²)(n − 1)/(n − p), which charges for every parameter (p counts the intercept). <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> covers MAE, MAPE and other scores and when each fits the business.</p>

  <h2 id="lr-sm"><span class="num">08</span>Standard Errors, t and p</h2>
  <p>Our slope of 7 came from six flats. Six other flats from the same market would have given a slightly different slope, perhaps 6.6 or 7.3. Before the dealer quotes "7 lakh per 100 sq ft" to a client, a careful analyst wants to know how much that number would wobble from sample to sample, whether it is clearly different from zero, and what range of true slopes is believable. scikit-learn does not answer these questions, because it is built for prediction. The statistics library statsmodels prints all of it in one table:</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
ols = sm.OLS(y, sm.add_constant(x)).fit()      # add_constant = the column of 1s
print(ols.summary(xname=["const", "size"], yname="price"))</div>
  <div class="fx" data-lang="text">                            OLS Regression Results                            
==============================================================================
Dep. Variable:                  price   R-squared:                       0.990
Model:                            OLS   Adj. R-squared:                  0.988
Method:                 Least Squares   F-statistic:                     403.5
Date:                Tue, 03 Nov 2026   Prob (F-statistic):           3.62e-05
Time:                        10:39:52   Log-Likelihood:                -13.717
No. Observations:                   6   AIC:                             31.43
Df Residuals:                       4   BIC:                             31.02
Df Model:                           1                                         
Covariance Type:            nonrobust                                         
==============================================================================
                 coef    std err          t      P&gt;|t|      [0.025      0.975]
------------------------------------------------------------------------------
const        -16.0000      4.014     -3.986      0.016     -27.144      -4.856
size           7.0000      0.348     20.088      0.000       6.033       7.967
==============================================================================
Omnibus:                          nan   Durbin-Watson:                   1.647
Prob(Omnibus):                    nan   Jarque-Bera (JB):                0.489
Skew:                           0.445   Prob(JB):                        0.783
Kurtosis:                       1.920   Cond. No.                         39.1
==============================================================================

Notes:
[1] Standard Errors assume that the covariance matrix of the errors is correctly specified.</div>
  <p>That is a lot of numbers, but they are all built from things we already have, and rebuilding them by hand is the best way to understand them.</p>
  <p>The first step is to estimate how noisy the prices are around the true line. The estimate is s² = SSE/(n − p) = 34/4 = 8.5, so s = 2.92 lakh. We divide by n − p (six rows minus two fitted parameters, the "Df Residuals: 4" line) rather than n, because the line was fitted to these same six points and bends toward them, so the residuals are a little smaller than the true errors. Dividing by 4 instead of 6 corrects that.</p>
  <p>The second step turns noise into uncertainty about the weights. The formula is Cov(ŵ) = s²(XᵀX)⁻¹. From section 03, the diagonal of (XᵀX)⁻¹ is 796/420 = 1.895 for the intercept and 6/420 = 0.0143 for the slope. Multiplying by 8.5 and taking square roots gives the <strong>standard errors</strong>: se(b) = √16.11 = 4.01 and se(w) = √0.1214 = 0.348. For one feature the slope's standard error simplifies to s/√S_xx = 2.92/√70. A standard error is the typical amount an estimate would change if we collected a fresh sample, and the formula says when it is small: more rows, sizes that are more spread out (bigger S_xx), and less noise. The intercept's standard error is eleven times larger because x = 0 is so far from the data.</p>
  <p>The third step asks whether each weight could really be zero. The <strong>t-statistic</strong> is the coefficient divided by its standard error: t = 7/0.348 = 20.1 for the slope, so the estimate is twenty standard errors away from zero. The <strong>p-value</strong> (the P&gt;|t| column) is the probability of a t at least that far from zero if the true coefficient were zero, read from a t-distribution with 4 degrees of freedom: 0.00004 for the slope, 0.016 for the intercept. A p-value is not the probability that the effect is real; <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> explains exactly what it is.</p>
  <p>The fourth step gives a range. A 95% <strong>confidence interval</strong> is coefficient ± t₀.₉₇₅ × se. With 4 degrees of freedom the multiplier is 2.776, wider than the familiar 1.96 because six rows is very little data. For the slope that is 7 ± 2.776 × 0.348 = [6.03, 7.97]: the data are consistent with any true slope in that range.</p>
  <div class="fx" data-lang="py">from scipy import stats
n, p = 6, 2                                    # rows, fitted parameters (b and w)
e = y - (-16 + 7 * x)
sse, sxx, sst = e @ e, ((x - x.mean()) ** 2).sum(), ((y - y.mean()) ** 2).sum()
s2 = sse / (n - p)                             # noise variance estimate
se_w = np.sqrt(s2 / sxx)
se_b = np.sqrt(s2 * (1 / n + x.mean() ** 2 / sxx))
tcrit = stats.t.ppf(0.975, df=n - p)
for name, coef, se in [("w", 7, se_w), ("b", -16, se_b)]:
    t = coef / se
    pval = 2 * stats.t.sf(abs(t), df=n - p)    # two-sided p-value
    print(f"{name}: se={se:.4f}  t={t:7.3f}  p={pval:.2e}  CI=[{coef - tcrit * se:.3f}, {coef + tcrit * se:.3f}]")
F = ((sst - sse) / (p - 1)) / s2
print(f"s^2={s2}  t_crit={tcrit:.3f}  adjR2={1 - (sse / sst) * (n - 1) / (n - p):.4f}  F={F:.2f}")</div>
  <div class="fx" data-lang="text">w: se=0.3485  t= 20.088  p=3.62e-05  CI=[6.033, 7.967]
b: se=4.0137  t= -3.986  p=1.63e-02  CI=[-27.144, -4.856]
s^2=8.5  t_crit=2.776  adjR2=0.9877  F=403.53</div>
  <p>Every number matches the summary. The rest of the summary is built the same way. Adjusted R² is 0.988. The <strong>F-statistic</strong>, 403.5, tests whether all the slopes are zero at once; it is (SSR/1)/(SSE/4) = 3430/8.5, and with a single feature it equals t² = 20.088². Log-likelihood −13.717 is the formula from section 04, and AIC = −2 log L + 2p and BIC = −2 log L + p·ln n are fit scores that charge for parameters, used to compare models of the same y (lower is better). The bottom block checks the residuals: Skew and Kurtosis describe their shape, Jarque–Bera tests whether they look normal (Omnibus needs at least eight rows, hence "nan"), Durbin–Watson checks whether neighbouring residuals are correlated (about 2 means no), and Cond. No. warns about nearly redundant columns. <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> explains each of these.</p>
  <p>All of these standard errors rest on assumptions: that the errors are independent, have the same spread for every flat, and sit around a correctly shaped line. Our residuals bend, so part of s² = 8.5 is curvature rather than noise. And with large datasets, tiny useless effects become "significant". Always read the size of a coefficient and its interval, not just whether p is below 0.05.</p>

  <h2 id="lr-pi"><span class="num">09</span>Prediction Intervals</h2>
  <p>Back to the family with the 1,300 sq ft flat. The line predicts −16 + 7 × 13 = 75 lakh. Section 08 told us how uncertain the slope is, but the family is asking a different question: what range of prices should they realistically expect for this one flat? There are two different questions hiding here, and they have different answers.</p>
  <p>The first is "what is the average price of all 1,300 sq ft flats in this market?" The only uncertainty is that we do not know the true line exactly. The answer is a <strong>confidence interval for the mean</strong>, with standard error s·√(1/n + (x₀ − x̄)²/S_xx). The second is "what will this particular flat sell for?" Now we have the line's uncertainty <em>plus</em> this flat's own noise ε, because even if we knew the true line perfectly, individual flats scatter around it. The answer is a <strong>prediction interval</strong>, with standard error s·√(1 + 1/n + (x₀ − x̄)²/S_xx). The extra "1" under the square root is the new flat's own noise. Think of a weather forecast: "the average temperature on days like tomorrow is 30 to 31 °C" is a much narrower statement than "tomorrow will be between 27 and 34 °C".</p>
  <p>By hand at x₀ = 13: (13 − 11)²/70 = 0.057, so the mean's standard error is 2.92 × √(0.167 + 0.057) = 1.38 and the single flat's is 2.92 × √(1.224) = 3.23. Multiplying by 2.776 gives a confidence interval of 75 ± 3.83 and a prediction interval of 75 ± 8.95. statsmodels gives both:</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
ols = sm.OLS(y, sm.add_constant(x)).fit()
frame = ols.get_prediction(np.array([[1.0, 13.0]])).summary_frame(alpha=0.05)   # a 1,300 sq ft flat
print(frame.round(3).to_string(index=False))</div>
  <div class="fx" data-lang="text"> mean  mean_se  mean_ci_lower  mean_ci_upper  obs_ci_lower  obs_ci_upper
 75.0    1.379         71.171         78.829        66.045        83.955</div>
  <p>The <code>mean_ci</code> columns are the confidence interval for the average flat, [71.2, 78.8]; the <code>obs_ci</code> columns are the prediction interval for one flat, [66.0, 84.0]. The family should be told "about 66 to 84 lakh", not "71 to 79". Both intervals widen as x₀ moves away from x̄, because the line is least certain at its ends. With more data the confidence interval shrinks toward zero width, but the prediction interval can never become narrower than about ±1.96 noise standard deviations, however many flats you collect, because individual flats will always scatter. Prediction intervals also depend heavily on the errors being normal with constant spread; when they are not, quantile regression or conformal prediction give honest ranges without that assumption.</p>

  <h2 id="lr-cat"><span class="num">10</span>Categorical Features</h2>
  <p>The dealer insists location matters. But locality is a word, and a weight cannot multiply "Old town". The tempting shortcut is to code Old town = 1, Suburb = 2, Metro = 3. That forces the model to believe the localities are in that order and equally spaced, so the step from Suburb to Metro must equal the step from Old town to Suburb. Nothing in the world says so.</p>
  <p>The fix is a set of <strong>dummy variables</strong> (also called one-hot encoding): one 0/1 column per locality, saying "is this flat in Old town?", "is it in Suburb?". We create one fewer column than there are categories, here two, and the left-out category, Metro, becomes the <strong>reference</strong>: a Metro flat has 0 in both columns. Think of a menu that lists the price of a plain dosa and then "masala +₹20, cheese +₹40": the plain dosa is the reference, and each extra is priced relative to it. The model price = b + w_O·is_OldTown + w_S·is_Suburb predicts one number per locality, and least squares makes that number the locality's average price. So b is the Metro average, (53 + 100)/2 = 76.5; b + w_O is the Old town average, (28 + 66)/2 = 47, so w_O = −29.5; and b + w_S is the Suburb average, 59.5, so w_S = −17.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
print(houses.groupby("locality")["price"].mean())
D = pd.get_dummies(houses["locality"], drop_first=True, dtype=float)   # Metro is dropped: the reference
m = LinearRegression().fit(D, houses["price"])
print("intercept:", m.intercept_, " coefs:", {k: round(float(v), 3) for k, v in zip(D.columns, m.coef_)})</div>
  <div class="fx" data-lang="text">locality
Metro       76.5
Old town    47.0
Suburb      59.5
Name: price, dtype: float64
intercept: 76.5  coefs: {'Old town': -29.5, 'Suburb': -17.0}</div>
  <p><code>pd.get_dummies(..., drop_first=True)</code> drops the first category in alphabetical order, Metro, and the fitted coefficients are exactly the hand values. Each dummy coefficient is a difference from the reference: an Old town flat is 29.5 lakh cheaper than a Metro flat on average.</p>
  <p>Why drop one column? If we keep all three dummies as well as the intercept, the three dummies always add up to 1 on every row, which is exactly the column of 1s. One column is then a combination of others, XᵀX has no inverse, and infinitely many weight vectors fit equally well. This is the <strong>dummy-variable trap</strong>:</p>
  <div class="fx" data-lang="py">import statsmodels.formula.api as smf
D_all = pd.get_dummies(houses["locality"], dtype=float)        # all three dummies, none dropped
X_trap = np.c_[np.ones(6), D_all]                              # intercept + Metro + Old town + Suburb
print("rank of X:", np.linalg.matrix_rank(X_trap), "of", X_trap.shape[1])
for shift in [0, 20]:                                          # two different weight vectors...
    wv = np.array([76.5 - shift, shift, -29.5 + shift, -17 + shift])
    print(f"weights {wv}  predictions {X_trap @ wv}")           # ...identical predictions
both = smf.ols("price ~ size + C(locality)", data=houses).fit()  # size AND locality
print(both.params.round(3).to_dict())</div>
  <div class="fx" data-lang="text">rank of X: 3 of 4
weights [ 76.5   0.  -29.5 -17. ]  predictions [47.  59.5 76.5 47.  59.5 76.5]
weights [56.5 20.  -9.5  3. ]  predictions [47.  59.5 76.5 47.  59.5 76.5]
{'Intercept': -13.056, 'C(locality)[T.Old town]': -1.944, 'C(locality)[T.Suburb]': -3.222, 'size': 6.889}</div>
  <p>The design matrix has four columns but rank 3, meaning only three of them carry independent information. Two very different weight vectors give identical predictions, because any amount can be moved from the intercept into all three dummies. The predictions are fine, but the coefficients mean nothing. Dropping one category (or the intercept) fixes it.</p>
  <p>The last line of the output is the more important lesson. With size added to the model, the Old town gap shrinks from −29.5 to −1.9 and Suburb from −17 to −3.2. The two Metro flats in our table happen to be big on average (1,300 sq ft, against 900 for Old town), so "Metro" was mostly standing in for size: the omitted-variable formula from section 06 again. With six flats and four parameters these numbers are very uncertain, but the direction of the lesson holds. A dummy coefficient's meaning, like any coefficient's, depends on what else is in the model. If you want the slope itself to differ by locality, you add an <strong>interaction</strong> column such as size × is_Metro, covered in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>. For categories with hundreds of levels, such as PIN codes, see target encoding in <a class="xref" data-note="ml_features">Feature Engineering</a>.</p>

  <h2 id="lr-sk"><span class="num">11</span>scikit-learn and From Scratch</h2>
  <p>Six flats fit in our head, but a real pricing system has thousands of rows, text columns, and a test set that must stay unseen until the end. In everyday code the model is scikit-learn's <code>LinearRegression</code>. It has almost nothing to tune: <code>fit_intercept=True</code> learns b, and <code>positive=True</code> forces every weight to be at least zero. After fitting, <code>coef_</code> and <code>intercept_</code> hold the weights, <code>score(X, y)</code> returns R², and <code>rank_</code> and <code>singular_</code> warn you about redundant columns. It gives no standard errors or p-values; for those, use statsmodels.</p>
  <p>Six rows are too few to split into training and test sets, so here we use the 300 simulated rented flats from section 06. We split first, then put the city's one-hot encoder inside a pipeline, so that the encoder learns the list of cities from the training rows only (why this matters is the subject of <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>), and compare test scores with and without the city:</p>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder

num, cols = ["size", "metro", "age"], ["size", "metro", "age", "city"]
train, test = train_test_split(df, test_size=0.25, random_state=0)      # split first
prep = ColumnTransformer([("city", OneHotEncoder(drop="first"), ["city"])], remainder="passthrough")
pipe = make_pipeline(prep, LinearRegression()).fit(train[cols], train["rent"])
print({k: round(float(v), 4) for k, v in zip(pipe[0].get_feature_names_out(), pipe[-1].coef_)})
lin = LinearRegression().fit(train[num], train["rent"])                  # numbers only, for comparison
for name, model, c in [("numbers only", lin, num), ("with city", pipe, cols)]:
    p = model.predict(test[c])
    print(f"{name:12s} test R2 {r2_score(test['rent'], p):.3f}  RMSE {mean_squared_error(test['rent'], p) ** 0.5:.2f}")
new = pd.DataFrame({"size": [1000], "metro": [1.0], "age": [10], "city": ["Pune"]})
print("new 1000 sq ft Pune flat:", pipe.predict(new).round(2))</div>
  <div class="fx" data-lang="text">{'city__city_Mumbai': 7.1903, 'city__city_Pune': -3.8607, 'remainder__size': 0.0193, 'remainder__metro': -1.8477, 'remainder__age': -0.0696}
numbers only test R2 0.674  RMSE 5.09
with city    test R2 0.905  RMSE 2.74
new 1000 sq ft Pune flat: [19.66]</div>
  <p>With numbers only the test R² is 0.674 and RMSE 5.09; adding the two city dummies raises R² to 0.905 and brings RMSE to 2.74, close to the true noise of 3. The coefficients are near the truth used to simulate the data: Mumbai +7.2 (truth +8) and Pune −3.9 (truth −3) relative to Delhi, size 0.0193 per sq ft (truth 0.02) and metro −1.85 per km (truth −1.5). <code>OneHotEncoder(drop="first")</code> avoids the dummy trap. One trap with <code>remainder="passthrough"</code>: pass only the feature columns, because passing the whole table would pass the rent itself through as a feature and give a perfect, useless model.</p>
  <p>Finally, to prove there is no magic in the library, here is the whole model from scratch with three solvers: the normal equation (section 03), <code>lstsq</code>, and batch gradient descent (section 05) on standardised features, converted back to the original units at the end. If z = (x − μ)/σ, a weight on z becomes w/σ on x, and the intercept absorbs the shift. We check it against scikit-learn on its built-in diabetes dataset (442 patients, 10 features) and on our six flats:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression

class MyLinearRegression:
    def __init__(self, method="lstsq", lr=0.1, n_iter=20000):
        self.method, self.lr, self.n_iter = method, lr, n_iter
    def fit(self, X, y):
        X, y = np.asarray(X, float), np.asarray(y, float)
        Xb = np.c_[np.ones(len(X)), X]                       # prepend the column of 1s
        if self.method == "normal":
            w = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)          # (X^T X) w = X^T y
        elif self.method == "lstsq":
            w = np.linalg.lstsq(Xb, y, rcond=None)[0]         # SVD: safest
        else:                                                 # batch gradient descent
            mu, sd = X.mean(0), X.std(0)                      # GD needs scaled features
            Zb = np.c_[np.ones(len(X)), (X - mu) / sd]
            w = np.zeros(Zb.shape[1])
            for _ in range(self.n_iter):
                w -= self.lr * (2 / len(y)) * Zb.T @ (Zb @ w - y)
            w[1:] = w[1:] / sd                                # back to original units
            w[0] = w[0] - mu @ w[1:]
        self.intercept_, self.coef_ = w[0], w[1:]
        return self
    def predict(self, X):
        return np.asarray(X, float) @ self.coef_ + self.intercept_

Xd, yd = load_diabetes(return_X_y=True)                       # 442 patients, 10 features
ref = LinearRegression().fit(Xd, yd)
for method in ["normal", "lstsq", "gd"]:
    mine = MyLinearRegression(method).fit(Xd, yd)
    print(f"{method:6s} max |coef - sklearn| = {np.abs(mine.coef_ - ref.coef_).max():.1e}"
          f"   houses: {MyLinearRegression(method).fit(x[:, None], y).coef_.round(6)}")</div>
  <div class="fx" data-lang="text">normal max |coef - sklearn| = 1.6e-12   houses: [7.]
lstsq  max |coef - sklearn| = 1.5e-12   houses: [7.]
gd     max |coef - sklearn| = 3.8e-11   houses: [7.]</div>
  <p>All three agree with scikit-learn to about 10⁻¹¹, which is floating-point rounding, and all three give the slope 7 on the flats. The scaling inside the gradient-descent branch is not decoration: every diabetes feature has a standard deviation of about 0.05, and without scaling, 20,000 steps would still leave the weights badly wrong, the raw-size problem of section 05 again. The whole of linear regression really is this small: add a column of 1s, solve one linear system.</p>
  <p>When should you reach for it? Linear regression is fast, has no hyperparameters, works with few rows, and gives coefficients you can explain to a manager along with standard errors and intervals. That makes it the default baseline for any numeric target. Its weaknesses are the other side of its simplicity: it only fits straight, additive effects unless you engineer features, squared loss makes it sensitive to outliers, correlated columns make its weights unstable, and its statistics depend on assumptions about the errors. Each sibling note fixes one of these: <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> checks when the statistics can be trusted, <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> bends the line, and <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> tames the weights. Compared with other families, decision trees and boosting (<a class="xref" data-note="ml_dtree">Decision Trees</a>, <a class="xref" data-note="ml_gbm">Gradient Boosting</a>) capture steps and interactions automatically but predict a flat value beyond the data, while linear regression keeps extending its line, sometimes wisely and sometimes dangerously. <a class="xref" data-note="ml_knn">KNN</a> fits any local shape but explains nothing and suffers with many features. Logistic regression reuses the same weighted sum for yes/no targets by passing it through a sigmoid.</p>

  <h2 id="lr-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake is judging a model by its training R². Training R² can only go up as you add columns, whether or not they mean anything. Here 100 columns of pure noise are added to the rent data:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
num = ["size", "metro", "age"]
X = np.c_[df[num], rng.normal(size=(len(df), 100))]        # 3 real columns + 100 columns of noise
Xtr, Xte, ytr, yte = train_test_split(X, df["rent"], test_size=0.25, random_state=0)
for k in [3, 23, 103]:                                      # use the first k columns
    m = LinearRegression().fit(Xtr[:, :k], ytr)
    print(f"{k:3d} columns: train R2 {m.score(Xtr[:, :k], ytr):.3f}   test R2 {m.score(Xte[:, :k], yte):.3f}")</div>
  <div class="fx" data-lang="text">  3 columns: train R2 0.677   test R2 0.674
 23 columns: train R2 0.705   test R2 0.614
103 columns: train R2 0.806   test R2 0.473</div>
  <p>Training R² climbs from 0.677 to 0.806 as the noise columns go in, while the test R² falls from 0.674 to 0.473: the model is memorising noise. Report test or cross-validated scores, and use adjusted R², AIC or BIC when comparing models on the same data.</p>
  <p>The second is extrapolating. A line knows only the range it was fitted on:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
m = LinearRegression().fit(houses[["size"]], houses["price"])
print("4,000 sq ft villa:", m.predict(pd.DataFrame({"size": [40]})).round(1), "lakh  (data covered 600-1,600 sq ft)")
print("300 sq ft studio :", m.predict(pd.DataFrame({"size": [3]})).round(1), "lakh")</div>
  <div class="fx" data-lang="text">4,000 sq ft villa: [264.] lakh  (data covered 600-1,600 sq ft)
300 sq ft studio : [5.] lakh</div>
  <p>The line prices a 4,000 sq ft villa at 264 lakh from data on 600 to 1,600 sq ft, although it already under-prices the biggest flat we have (F's residual is +4), and it prices a 300 sq ft studio at 5 lakh because the intercept is −16. Neither number deserves trust.</p>
  <p>Several mistakes are about reading coefficients. A big coefficient is not an important feature, because units change the number (7 per 100 sq ft is 0.07 per sq ft); compare standardised coefficients or, better, permutation importance on test data. A coefficient's meaning depends on what else is in the model (size 7.0 alone, 6.21 with bedrooms; Old town −29.5 alone, −1.9 with size). The intercept is often a meaningless anchor (−16 lakh for a zero-size flat). And a small p-value is neither a large effect nor a cause.</p>
  <p>Finally, the mechanical ones: keeping all k dummies with an intercept (the dummy trap, rank 3 of 4), computing <code>inv(X.T @ X)</code> instead of using <code>lstsq</code>, quoting a confidence interval when someone asks about one new case (±3.8 instead of ±9.0 lakh), and skipping the residual plot because R² looked excellent (0.990, with residuals that bend).</p>

  <h2 id="lr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: six flats (size in 100 sq ft, bedrooms, locality, price in lakh): A (6, 1, Old town, 28), B (8, 2, Suburb, 40), C (10, 2, Metro, 53), D (12, 3, Old town, 66), E (14, 3, Suburb, 79), F (16, 4, Metro, 100).</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Linear regression</b>: ŷ = b + Σwⱼxⱼ; linear in the parameters, features may be x², log x, x₁x₂.</li>
    <li><b>Residual</b>: eᵢ = yᵢ − ŷᵢ (observed); the <b>error</b> εᵢ is the unobservable noise around the true line.</li>
    <li><b>OLS</b>: choose the weights that minimise SSE = Σeᵢ².</li>
    <li><b>Normal equation</b>: XᵀXw = Xᵀy (X has a leading column of 1s).</li>
    <li><b>Hat matrix / leverage</b>: ŷ = Hy, H = X(XᵀX)⁻¹Xᵀ; hᵢ = how much row i pulls its own prediction.</li>
    <li><b>BLUE (Gauss–Markov)</b>: with linear truth, mean-zero, equal-variance, uncorrelated errors, OLS has the lowest variance among linear unbiased estimators. No normality needed.</li>
    <li><b>Standard error</b>: how much an estimate would vary across samples; <b>t</b> = coef/se; <b>CI</b> = coef ± t·se.</li>
    <li><b>Confidence vs prediction interval</b>: the average y at x₀ vs one new y at x₀ (adds the case's own noise).</li>
    <li><b>Dummy variables</b>: k − 1 indicator columns for k categories; coefficients are differences from the reference.</li>
  </ul>
  <h3>Formulas and our numbers</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Six flats</th></tr>
    <tr><td>One-feature OLS</td><td>w = S_xy/S_xx; b = ȳ − w·x̄</td><td>490/70 = 7; 61 − 77 = −16</td></tr>
    <tr><td>Normal equation</td><td>w = (XᵀX)⁻¹Xᵀy</td><td>[[6, 66], [66, 796]], [366, 4516], det 420</td></tr>
    <tr><td>Two features</td><td>same, with a bedroom column</td><td>−14.58 + 6.21·size + 2.92·rooms</td></tr>
    <tr><td>Omitted variable</td><td>short slope = w₁ + w₂·δ</td><td>6.21 + 2.92 × 0.271 = 7.0</td></tr>
    <tr><td>Gradient descent</td><td>w ← w − η·(2/n)Xᵀ(Xw − y)</td><td>centred: 200 steps; raw: 20,000</td></tr>
    <tr><td>Fit</td><td>R² = 1 − SSE/SST; RMSE = √(SSE/n)</td><td>1 − 34/3464 = 0.990; 2.38</td></tr>
    <tr><td>Noise and SE</td><td>s² = SSE/(n − p); se(w) = s/√S_xx</td><td>8.5; 0.348</td></tr>
    <tr><td>Test and CI</td><td>t = w/se; w ± t₀.₉₇₅,ₙ₋ₚ·se</td><td>20.1; [6.03, 7.97]</td></tr>
    <tr><td>Intervals at x₀</td><td>s√(1/n + (x₀ − x̄)²/S_xx), add 1 inside for PI</td><td>x₀ = 13: CI [71.2, 78.8], PI [66.0, 84.0]</td></tr>
    <tr><td>Leverage (one feature)</td><td>hᵢ = 1/n + (xᵢ − x̄)²/S_xx</td><td>A, F: 0.524; C, D: 0.181</td></tr>
  </table>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th></th><th>Linear (OLS)</th><th>Ridge / Lasso</th><th>Tree / boosting</th><th>KNN</th></tr>
    <tr><td>Shape</td><td>flat planes</td><td>flat planes</td><td>steps, interactions</td><td>any local shape</td></tr>
    <tr><td>Hyperparameters</td><td>none</td><td>α</td><td>depth, learning rate…</td><td>k</td></tr>
    <tr><td>Scaling needed</td><td>no (yes for GD)</td><td>yes</td><td>no</td><td>yes</td></tr>
    <tr><td>Interpretability</td><td>excellent</td><td>good</td><td>tree good; boosting via SHAP</td><td>low</td></tr>
    <tr><td>Beyond the data</td><td>continues the line</td><td>continues the line</td><td>flat</td><td>flat</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
m = LinearRegression().fit(X_train, y_train)     # m.coef_, m.intercept_, m.score(X, y) = R2

import statsmodels.api as sm, statsmodels.formula.api as smf
ols = sm.OLS(y, sm.add_constant(X)).fit()        # ols.summary(), ols.bse, ols.pvalues
ols.get_prediction(X0).summary_frame(alpha=0.05) # mean_ci_* (CI), obs_ci_* (PI)
smf.ols("price ~ size + C(locality)", data=df).fit()   # dummies automatically

w = np.linalg.lstsq(np.c_[np.ones(n), X], y, rcond=None)[0]   # never inv(X.T @ X)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>High R² does not mean the shape is right; plot residuals.</li>
    <li>Training R² never decreases when columns are added; judge on test data.</li>
    <li>Coefficient size depends on units; standardise to compare.</li>
    <li>Coefficients change when correlated columns enter or leave.</li>
    <li>All k dummies plus an intercept = singular XᵀX.</li>
    <li>Prediction interval, not confidence interval, for one new case.</li>
    <li>Gradient descent needs scaled features; the normal equation does not.</li>
  </ul>

  <h2 id="lr-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is linear regression, and what does "linear" mean?</summary><div class="qa-body">It models a numeric target as a constant plus a weighted sum of features, ŷ = b + Σwⱼxⱼ, and chooses the weights that minimise the sum of squared residuals. "Linear" means linear in the parameters: each weight multiplies something and the results are added. The features themselves can be non-linear, such as x² or log x, so a parabola is still linear regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we minimise squared errors rather than absolute errors?</summary><div class="qa-body">Squared loss is smooth, so calculus gives a closed-form solution; it is convex, so there is a single minimum; and under normal noise it is the maximum-likelihood estimate and estimates the mean of y. The cost is sensitivity to outliers, because large misses are squared. Absolute error estimates the median and is more robust but has no closed form.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the slope and intercept for one feature.</summary><div class="qa-body">Set the derivatives of SSE = Σ(yᵢ − wxᵢ − b)² to zero. ∂/∂b gives b = ȳ − w·x̄, so the line passes through the means. ∂/∂w, after substituting b, gives w = Σ(xᵢ − x̄)(yᵢ − ȳ)/Σ(xᵢ − x̄)², which is cov(x, y)/var(x). For the six flats: 490/70 = 7 and 61 − 7 × 11 = −16.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the normal equation, and when is its solution unique?</summary><div class="qa-body">XᵀXw = Xᵀy, from setting the gradient of ‖y − Xw‖² to zero. The solution w = (XᵀX)⁻¹Xᵀy is unique when X has full column rank, meaning no column is an exact linear combination of others. With redundant columns (all dummies plus an intercept) XᵀX is singular and infinitely many weights fit equally well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the geometry of least squares.</summary><div class="qa-body">The predictions Xw all lie in the column space of X. OLS picks the point in that space closest to y, which is the perpendicular projection ŷ = Hy. The residual vector is perpendicular to every column, Xᵀe = 0, which is the normal equation. As a result the residuals sum to zero and are uncorrelated with each feature and with ŷ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent: which, and when?</summary><div class="qa-body">The normal equation (via SVD or a solver) gives the exact answer in one shot, costs about O(nd² + d³), needs no learning rate and no scaling, and is best when the data fit in memory and d is moderate. Gradient descent costs O(nd) per pass, works on streaming or huge data and for any differentiable loss, but needs a learning rate, many iterations and scaled features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does gradient descent need feature scaling when the normal equation does not?</summary><div class="qa-body">With unscaled features the loss surface is a long narrow valley: steep in some directions and flat in others. A learning rate small enough not to diverge in the steep direction crawls in the flat one. Scaling makes the bowl round so steps go straight to the minimum (200 steps vs 20,000 on the flats). The normal equation solves the system exactly, so the shape of the bowl does not matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a coefficient mean in multiple regression?</summary><div class="qa-body">It is the expected change in y for a one-unit increase in that feature with all other features in the model held fixed. Its units are y-units per x-unit, so its size depends on units and does not measure importance; standardised coefficients compare features. It describes association in the data, not causation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Size is worth 7.0 alone but 6.21 when bedrooms are added. Why?</summary><div class="qa-body">Size and bedrooms are correlated, so alone, size also gets credit for the bedrooms that come with it. The omitted-variable formula makes it exact: short slope = w_size + w_rooms·δ, where δ = 0.271 is the slope of bedrooms on size, giving 6.21 + 2.92 × 0.271 = 7.0. Adding or removing a correlated feature always changes the other coefficients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>R² versus adjusted R²: why both?</summary><div class="qa-body">R² = 1 − SSE/SST is the fraction of variance explained compared with predicting the mean, but on training data it never decreases when a feature is added, even a random one. Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p) charges for each parameter and can fall when a useless feature is added. For model choice, held-out scores are better than either.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are the standard errors in a regression summary computed?</summary><div class="qa-body">Estimate the noise variance s² = SSE/(n − p), dividing by n − p because p parameters were fitted to the same data. The covariance of the weights is s²(XᵀX)⁻¹, and each standard error is the square root of a diagonal entry. For one feature se(w) = s/√S_xx: smaller with more rows, more spread in x and less noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do the t-statistic, p-value and confidence interval tell you?</summary><div class="qa-body">t = coefficient/standard error, the number of standard errors the estimate is from zero. The p-value is the probability of a t at least this extreme if the true coefficient were zero. The 95% CI, coef ± t₀.₉₇₅ × se, is the range of true values consistent with the data. None of them measures the size or business value of an effect, and all assume well-behaved errors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Confidence interval versus prediction interval?</summary><div class="qa-body">A confidence interval for the mean covers the average y at x₀ and reflects only uncertainty in the line. A prediction interval covers one new observation and adds that observation's own noise, the extra 1 in √(1 + 1/n + (x₀ − x̄)²/S_xx). The PI is always wider and never shrinks below the noise level however much data you have. For the 1,300 sq ft flat: CI [71.2, 78.8], PI [66.0, 84.0].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you include a categorical feature, and what is the dummy-variable trap?</summary><div class="qa-body">Create k − 1 indicator columns for k categories; the left-out level is the reference, and each coefficient is the difference from it. Including all k dummies with an intercept makes them sum to the intercept column, so XᵀX is singular and the coefficients are not unique (rank 3 of 4 on the flats). Drop one level or the intercept.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is OLS the same as maximum likelihood?</summary><div class="qa-body">If the errors are independent normal with constant variance, the log-likelihood is −(n/2)log(2πσ²) − SSE/(2σ²). The only term involving the weights is −SSE/(2σ²), so maximising likelihood is minimising SSE. Changing the likelihood (Bernoulli instead of normal) gives logistic regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Gauss–Markov theorem say, and what does it not say?</summary><div class="qa-body">With a linear true model and errors that have mean zero, equal variance and no correlation, OLS is BLUE: the lowest-variance estimator among all linear unbiased ones. It does not need normal errors. It does not say OLS is the best model: biased estimators like ridge can have lower total error by trading a little bias for a lot less variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you forget the intercept?</summary><div class="qa-body">The line is forced through the origin, which biases the slope whenever the true intercept is not zero, and the residuals no longer have to sum to zero, so R² can even become negative or misleading. In scikit-learn leave <code>fit_intercept=True</code>; in statsmodels remember <code>sm.add_constant</code>, because it does not add one for you.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>LinearRegression().fit([[1], [2], [3]], [2, 4, 6]).coef_</code></summary><div class="qa-body"><code>array([2.])</code>, with <code>intercept_</code> essentially 0. The points lie exactly on y = 2x, so S_xy/S_xx = 4/2 = 2 and b = 4 − 2 × 2 = 0. <code>coef_</code> is always an array, one weight per feature.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use linear regression?</summary><div class="qa-body">When the relationship is strongly non-linear or full of interactions (trees or boosting, or add polynomial and spline features), when there are many correlated features (ridge or lasso), when outliers dominate (robust losses), or when you must predict far outside the data. It remains the baseline to beat, and the right choice when interpretability or inference matters.</div></details>
</main>
`
});
