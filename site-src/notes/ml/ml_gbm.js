// notes/ml/ml_gbm.js — Gradient Boosting
Object.assign(TOPIC_CONTENT, {
  "ml_gbm": `<main>
<h1>Gradient Boosting</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>Gradient Boosting</span></div>
  <p class="lead">Gradient boosting (Friedman, 1999–2001) builds a model as a sum of small regression trees, where each new tree is trained to predict what the current model still gets wrong, measured as the negative gradient of a loss you choose. For squared error that is just the plain residual; for classification it is "label minus predicted probability"; for other losses it is something else, and that freedom is the point. It is the engine inside XGBoost, LightGBM, CatBoost and scikit-learn's HistGradientBoosting, and the most used model family for table-shaped data in industry. We continue with the tree group's running example, the cricket captain's 14-day diary, boosting the turnout (a number) and then Play / No play (a class) by hand, and then check every idea at scale on the 20,000-row churn dataset, ending with a from-scratch version that matches scikit-learn exactly.</p>

  <h2 id="gbm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Gradient Boosting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li>F₀ = best constant (mean, median, log-odds)</li>
          <li>Pseudo-residuals rᵢ = −∂L/∂F at the current F</li>
          <li>Fit a small regression tree to r</li>
          <li>Set each leaf to the best step for the real loss</li>
          <li>F ← F + ν·tree; repeat</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why "gradient"</div>
        <ul>
          <li>Gradient descent on the predictions themselves</li>
          <li>For ½(y − F)²: −gradient = y − F, the residual</li>
          <li>The tree turns n numbers into a rule for new rows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Losses</div>
        <ul>
          <li>Squared: r = y − F; absolute: r = sign(y − F)</li>
          <li>Huber: squared near 0, capped beyond δ</li>
          <li>Quantile: prediction intervals</li>
          <li>Log-loss: r = y − p; leaf = Σ(y − p)/Σp(1 − p)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The brakes</div>
        <ul>
          <li><b>learning_rate</b>: smaller = more trees, slightly better</li>
          <li><b>max_depth</b>: depth d = interactions of d features</li>
          <li><b>subsample</b>: random rows per tree</li>
          <li><b>early stopping</b> picks the number of trees</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In sklearn</div>
        <ul>
          <li>GradientBoosting*: exact splits, slow, no NaN</li>
          <li>HistGradientBoosting*: 255 bins, fast, NaN + categories</li>
          <li>Multiclass: K trees per round</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="gbm-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea: Fit What's Left</span><span class="rm-sub">one recipe for any target and any loss</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-hand"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Three Rounds by Hand</span><span class="rm-sub">turnout on the diary, squared error</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-grad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Residuals Are Negative Gradients</span><span class="rm-sub">gradient descent on the predictions</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-loss"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Loss Functions</span><span class="rm-sub">squared, absolute, Huber, quantile, log-loss</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-leaf"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leaf Values: the Line Search</span><span class="rm-sub">the Newton step for classification</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-lr"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Learning Rate and Number of Trees</span><span class="rm-sub">the central trade-off</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-depth"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tree Depth and Interactions</span><span class="rm-sub">why stumps fail on "rain and windy"</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-sub"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Subsampling and Early Stopping</span><span class="rm-sub">less variance, and when to stop</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-scratch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">our classifier equals sklearn's</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-sk"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">GradientBoosting vs HistGradientBoosting</span><span class="rm-sub">exact vs binned splits, and the family</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">fitting y, no F₀, extrapolation</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">losses table, formulas, settings</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the gradient boosting questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="gbm-idea"><span class="num">01</span>The Idea: Fit What's Left</h2>
  <p><a class="xref" data-note="ml_adaboost">AdaBoost</a> showed that small trees added one after another can become a strong model, but its way of pointing each tree at the mistakes, re-weighting rows that are "wrong", only makes sense for right/wrong classification under one fixed loss. For a house price, "wrong" is not yes or no: missing by ₹1 lakh and missing by ₹50 lakh are very different. For churn we usually want good probabilities, which means log-loss, not AdaBoost's exponential loss. And AdaBoost's loss lets mislabelled rows take over. What we want is one boosting recipe that works for any target and any loss we care to choose.</p>
  <p>Gradient boosting's idea, in plain words: start with the simplest possible guess for every row (for prices, the average price). For each row, measure how far off that guess is. Train a small tree to predict those "how far off" numbers from the features. Add a small fraction of that tree's answer to the guess. Measure again, train another small tree on what is still off, add a fraction of it, and so on. Each tree is a correction to the sum of all the trees before it. This is the loop from <a class="xref" data-note="ml_boosting">How Boosting Works</a>; what gradient boosting adds is a precise, general answer to "how far off", which section 03 derives.</p>
  <p>Golf is a good picture of it. The first shot sends the ball roughly towards the hole. You do not hit the second shot from the tee again; you walk to where the ball landed and aim from there at the distance that is left. Each shot is shorter and more careful than the last. Every tree in gradient boosting likewise aims from the current prediction at the remaining gap, and the learning rate is choosing to hit a little more softly than you think you need, so you do not overshoot.</p>
  <p>The running example is the captain's diary from <a class="xref" data-note="ml_dtree">Decision Trees</a>. Besides the outlook, humidity and wind words, the captain wrote down three numbers: the humidity reading in percent (HumPct), the temperature in °C (TempC), and the turnout. Trees need numbers, so every word answer becomes a 0/1 column (for example Outlook_Overcast is 1 on overcast days), and the two numeric readings are used as they are. This is the whole table the trees will see:</p>
  <div class="fx" data-lang="py">import pandas as pd
from play import df
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)], axis=1)
print(pd.concat([X, df[["Play", "Turnout"]]], axis=1).T.to_string())</div>
  <div class="fx" data-lang="text">                  D1  D2   D3   D4   D5  D6   D7  D8   D9  D10  D11  D12  D13 D14
HumPct            85  90   86   96   80  70   65  95   70   80   70   90   75  91
TempC             29  27   28   21   20  18   18  22   21   24   24   22   27  22
Outlook_Overcast   0   0    1    0    0   0    1   0    0    0    0    1    1   0
Outlook_Rain       0   0    0    1    1   1    0   0    0    1    0    0    0   1
Outlook_Sunny      1   1    0    0    0   0    0   1    1    0    1    0    0   0
Humidity_High      1   1    1    1    0   0    0   1    0    0    0    1    0   1
Humidity_Normal    0   0    0    0    1   1    1   0    1    1    1    0    1   0
Wind_Strong        0   1    0    0    0   1    1   0    0    0    1    1    0   1
Wind_Weak          1   0    1    1    1   0    0   1    1    1    0    0    1   0
Play              No  No  Yes  Yes  Yes  No  Yes  No  Yes  Yes  Yes  Yes  Yes  No
Turnout           24  20   36   32   44  22   42  26   40   46   38   38   48  20</div>
  <p>Sections 02 and 03 boost Turnout (a number, with squared error); sections 04 and 05 boost Play (yes/no, with log-loss). Two words need to be kept apart from the start. A <strong>residual</strong> is the plain gap y − F between the true value and the current prediction. A <strong>pseudo-residual</strong> is the negative gradient of the loss, which is the same as the residual for squared error and something different for other losses. Formally, <strong>gradient boosting</strong> builds F_M(x) = F₀ + ν·Σₘ hₘ(x), where each hₘ is a small regression tree fitted by least squares to the pseudo-residuals of the current model, each leaf's value is then chosen to minimise the actual loss, and ν between 0 and 1 is the learning rate. The trees are always <em>regression</em> trees, even for classification, because pseudo-residuals are real numbers.</p>

  <h2 id="gbm-hand"><span class="num">02</span>Three Rounds by Hand</h2>
  <p>The words are simple, but the details (which split, what the leaves hold, how the numbers move) only become clear with numbers. We predict Turnout with squared error, a learning rate ν = 0.5, and stumps that may split on any column.</p>
  <p><strong>Round 0: the starting constant.</strong> Which single number c makes the squared error Σ(yᵢ − c)² smallest? Setting its derivative −2Σ(yᵢ − c) to zero gives c = Σyᵢ/n, the mean. Here that is 476/14 = 34, so F₀ = 34 for every day, with a sum of squared errors (SSE) of 1280.</p>
  <p><strong>Round 1.</strong> The residuals y − F₀ are D1 −10, D2 −14, D3 +2, D4 −2, D5 +10, D6 −12, D7 +8, D8 −8, D9 +6, D10 +12, D11 +4, D12 +4, D13 +14, D14 −14. A stump is fitted to them: every cut-off of every column is tried (halfway between neighbouring values), each side's leaf holds the mean residual of its days, and the cut-off leaving the smallest SSE wins. The winner is HumPct ≤ 82.5, which separates exactly the seven normal-humidity days from the seven humid ones. The normal days' residuals are +10, −12, +8, +6, +12, +4, +14, summing to 42, so that leaf holds +6, and the humid leaf holds −6. Adding half of the stump (ν = 0.5) moves the normal days to 34 + 3 = 37 and the humid days to 34 − 3 = 31, and the SSE falls from 1280 to 902.</p>
  <p><strong>Round 2.</strong> The new residuals become the targets. Because we only took half a step, every normal day is still about 3 too low and every humid day 3 too high, but a stronger pattern has now appeared: the overcast days D3, D7, D12, D13 are under-predicted by +5, +5, +7, +11. The best stump is "Outlook_Overcast ≤ 0.5", with +7 on overcast days and −2.8 on the rest; half of it is added. SSE 696.2.</p>
  <p><strong>Round 3.</strong> The best split is "Wind_Strong ≤ 0.5": calm days +3.175, windy days −4.233. SSE 555.07.</p>
  <p>The code does the same search and then asks sklearn to do it:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import GradientBoostingRegressor
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)], axis=1)
y = df.Turnout.values.astype(float)
lr = 0.5

def best_stump(r):
    """Try every cut-off of every column; leaves = mean residual; keep the smallest SSE."""
    best = None
    for c in X.columns:
        v = np.sort(X[c].unique())
        for t in (v[:-1] + v[1:]) / 2:                 # cut-offs halfway between values
            L = X[c].values &lt;= t
            sse = ((r[L] - r[L].mean()) ** 2).sum() + ((r[~L] - r[~L].mean()) ** 2).sum()
            if best is None or sse &lt; best[0]:
                best = (sse, c, t, r[L].mean(), r[~L].mean(), L)
    return best

F = np.full(14, y.mean())                              # F0 = mean
print(f"F0 = {y.mean():.2f}   SSE {((y - F) ** 2).sum():.2f}")
for m in range(1, 4):
    r = y - F                                          # residuals
    sse, c, t, left, right, L = best_stump(r)
    F = F + lr * np.where(L, left, right)              # add half of the stump
    print(f"round {m}: {c} &lt;= {t}: left {left:+.3f}, right {right:+.3f}   SSE after adding half: {((y - F) ** 2).sum():.2f}")
print("F3 =", " ".join(f"{v:.2f}" for v in F))
sk = GradientBoostingRegressor(n_estimators=3, learning_rate=lr, max_depth=1).fit(X, y)
print(f"largest gap to sklearn's GradientBoostingRegressor: {np.abs(sk.predict(X) - F).max():.1e}")</div>
  <div class="fx" data-lang="text">F0 = 34.00   SSE 1280.00
round 1: HumPct &lt;= 82.5: left +6.000, right -6.000   SSE after adding half: 902.00
round 2: Outlook_Overcast &lt;= 0.5: left -2.800, right +7.000   SSE after adding half: 696.20
round 3: Wind_Strong &lt;= 0.5: left +3.175, right -4.233   SSE after adding half: 555.07
F3 = 31.19 27.48 36.09 31.19 37.19 33.48 38.38 31.19 37.19 37.19 33.48 32.38 42.09 27.48
largest gap to sklearn's GradientBoostingRegressor: 0.0e+00</div>
  <p>Each round used a different column (humidity, then outlook, then wind), because each tree looks at what is left, not at the original turnouts. The last line shows that sklearn's <code>GradientBoostingRegressor</code> with three stumps and learning rate 0.5 produces exactly our F₃: the gap is 0. Follow D6 (rainy, windy, normal humidity, 22 players): 34 → 37 → 35.6 → 33.48. It is moving the right way, slowly, because every round only takes half a step.</p>

  <h2 id="gbm-grad"><span class="num">03</span>Residuals Are Negative Gradients</h2>
  <p>For squared error, "fit the residuals" is obviously sensible. But for Play / No play there is no natural residual, and for other losses the plain residual is the wrong target. The general rule comes from looking at the residual in a new way.</p>
  <p>Forget trees for a moment. Treat the 14 training predictions F(x₁), …, F(x₁₄) as 14 numbers you are free to move, and suppose you want to move them so the loss goes down. <a class="xref" data-note="ml_loss_gd">Gradient descent</a> says: move each number a small step against its own derivative. For the loss L = ½(y − F)² (the ½ just cancels a 2), the derivative with respect to the prediction is ∂L/∂F = −(y − F). So a gradient descent step is F(xᵢ) ← F(xᵢ) − ν·∂L/∂F = F(xᵢ) + ν·(yᵢ − F(xᵢ)). The step is ν times the residual: <strong>the residual is the negative gradient of squared error</strong>. On the diary at F₀ = 34, the gradient is (+10, +14, −2, …, +14) and the negative gradient is (−10, −14, +2, …, −14), exactly the residuals we fitted in round 1.</p>
  <p>So why do we need a tree at all? Moving the 14 numbers directly would only change the predictions for the 14 training days; a 15th day would get nothing. Instead of taking the raw gradient step, we fit a regression tree to the negative gradient. The tree groups similar rows into the same leaf and gives them the same step, and it can be applied to any new row. In round 1 the raw step would have given each day its own correction; the stump gave +3 to every normal-humidity day and −3 to every humid one, a rule that also works for day 15. The tree is the closest tree-shaped approximation of the steepest-descent direction. That is why gradient boosting is described as <strong>gradient descent in function space</strong>: each step moves a whole function, not a vector of weights.</p>
  <table class="tbl">
    <tr><th></th><th>gradient descent (e.g. linear regression)</th><th>gradient boosting</th></tr>
    <tr><td>what is moved</td><td>the weights w</td><td>the prediction function F (its values at the training rows)</td></tr>
    <tr><td>gradient taken with respect to</td><td>w</td><td>F(xᵢ), for every row</td></tr>
    <tr><td>one step</td><td>w ← w − η·∇L</td><td>F ← F + ν·h, where the tree h ≈ −∇L</td></tr>
    <tr><td>step size</td><td>learning rate η</td><td>learning rate ν, plus a line search per leaf (section 05)</td></tr>
    <tr><td>result after M steps</td><td>one weight vector</td><td>a sum of M trees</td></tr>
  </table>
  <p>This gives the general definition. The <strong>pseudo-residual</strong> of row i in round m is rᵢ = −∂L(yᵢ, F)/∂F, evaluated at the current prediction F_{m−1}(xᵢ). It says in which direction, and roughly by how much, that row's prediction should move to reduce the loss fastest. Any loss you can differentiate gives pseudo-residuals, so the same loop handles regression, classification, ranking, counts, quantiles or a business's own cost; changing the loss changes only two lines of the algorithm, the pseudo-residual and the leaf value. One common misunderstanding is worth clearing up: gradient boosting does not use gradient descent to <em>train each tree</em>. Each tree is grown by the usual greedy least-squares splitting from <a class="xref" data-note="ml_dtree">Decision Trees</a>. The gradient is taken with respect to the model's predictions, and it only supplies each tree's targets.</p>

  <h2 id="gbm-loss"><span class="num">04</span>Loss Functions</h2>
  <p>Since any differentiable loss now works, the practical question is which loss to choose and what each one tells the next tree. Here are the common ones (r = y − F):</p>
  <table class="tbl">
    <tr><th>loss</th><th>L(y, F)</th><th>pseudo-residual</th><th>F₀</th><th>use for</th></tr>
    <tr><td>squared</td><td>½(y − F)²</td><td>y − F</td><td>mean</td><td>regression (default)</td></tr>
    <tr><td>absolute</td><td>|y − F|</td><td>sign(y − F), i.e. ±1</td><td>median</td><td>regression with outliers</td></tr>
    <tr><td>Huber (δ)</td><td>½r² if |r| ≤ δ, else δ(|r| − ½δ)</td><td>r, capped at ±δ</td><td>median</td><td>mostly clean regression with some outliers</td></tr>
    <tr><td>quantile (α)</td><td>α·r if r ≥ 0, else (α − 1)·r</td><td>α or α − 1</td><td>α-quantile</td><td>prediction intervals, unequal costs</td></tr>
    <tr><td>log-loss</td><td>−[y ln p + (1 − y) ln(1 − p)], p = σ(F)</td><td>y − p</td><td>log-odds of the base rate</td><td>classification (default)</td></tr>
    <tr><td>exponential</td><td>e^(−ỹF), ỹ = ±1</td><td>ỹ·e^(−ỹF)</td><td>½ log-odds</td><td>gives back AdaBoost; rarely better</td></tr>
  </table>
  <p>The figure shows what three of them pass to the next tree for residuals of different sizes:</p>
  <figure class="viz"><svg viewBox="0 0 560 270" width="560"><line x1="50" y1="120.0" x2="530" y2="120.0" stroke="currentColor" stroke-opacity="0.5"/><line x1="290.0" y1="20" x2="290.0" y2="220" stroke="currentColor" stroke-opacity="0.5"/><text x="50.0" y="234" text-anchor="middle" class="tm" font-size="10.5">-6</text><text x="284.0" y="224.0" text-anchor="end" class="tm" font-size="10.5">-6</text><text x="170.0" y="234" text-anchor="middle" class="tm" font-size="10.5">-3</text><text x="284.0" y="174.0" text-anchor="end" class="tm" font-size="10.5">-3</text><text x="410.0" y="234" text-anchor="middle" class="tm" font-size="10.5">3</text><text x="284.0" y="74.0" text-anchor="end" class="tm" font-size="10.5">3</text><text x="530.0" y="234" text-anchor="middle" class="tm" font-size="10.5">6</text><text x="284.0" y="24.0" text-anchor="end" class="tm" font-size="10.5">6</text><polyline points="50.0,220.0 52.0,219.2 54.0,218.3 56.0,217.5 58.0,216.7 60.0,215.8 62.0,215.0 64.0,214.2 66.0,213.3 68.0,212.5 70.0,211.7 72.0,210.8 74.0,210.0 76.0,209.2 78.0,208.3 80.0,207.5 82.0,206.7 84.0,205.8 86.0,205.0 88.0,204.2 90.0,203.3 92.0,202.5 94.0,201.7 96.0,200.8 98.0,200.0 100.0,199.2 102.0,198.3 104.0,197.5 106.0,196.7 108.0,195.8 110.0,195.0 112.0,194.2 114.0,193.3 116.0,192.5 118.0,191.7 120.0,190.8 122.0,190.0 124.0,189.2 126.0,188.3 128.0,187.5 130.0,186.7 132.0,185.8 134.0,185.0 136.0,184.2 138.0,183.3 140.0,182.5 142.0,181.7 144.0,180.8 146.0,180.0 148.0,179.2 150.0,178.3 152.0,177.5 154.0,176.7 156.0,175.8 158.0,175.0 160.0,174.2 162.0,173.3 164.0,172.5 166.0,171.7 168.0,170.8 170.0,170.0 172.0,169.2 174.0,168.3 176.0,167.5 178.0,166.7 180.0,165.8 182.0,165.0 184.0,164.2 186.0,163.3 188.0,162.5 190.0,161.7 192.0,160.8 194.0,160.0 196.0,159.2 198.0,158.3 200.0,157.5 202.0,156.7 204.0,155.8 206.0,155.0 208.0,154.2 210.0,153.3 212.0,152.5 214.0,151.7 216.0,150.8 218.0,150.0 220.0,149.2 222.0,148.3 224.0,147.5 226.0,146.7 228.0,145.8 230.0,145.0 232.0,144.2 234.0,143.3 236.0,142.5 238.0,141.7 240.0,140.8 242.0,140.0 244.0,139.2 246.0,138.3 248.0,137.5 250.0,136.7 252.0,135.8 254.0,135.0 256.0,134.2 258.0,133.3 260.0,132.5 262.0,131.7 264.0,130.8 266.0,130.0 268.0,129.2 270.0,128.3 272.0,127.5 274.0,126.7 276.0,125.8 278.0,125.0 280.0,124.2 282.0,123.3 284.0,122.5 286.0,121.7 288.0,120.8 290.0,120.0 292.0,119.2 294.0,118.3 296.0,117.5 298.0,116.7 300.0,115.8 302.0,115.0 304.0,114.2 306.0,113.3 308.0,112.5 310.0,111.7 312.0,110.8 314.0,110.0 316.0,109.2 318.0,108.3 320.0,107.5 322.0,106.7 324.0,105.8 326.0,105.0 328.0,104.2 330.0,103.3 332.0,102.5 334.0,101.7 336.0,100.8 338.0,100.0 340.0,99.2 342.0,98.3 344.0,97.5 346.0,96.7 348.0,95.8 350.0,95.0 352.0,94.2 354.0,93.3 356.0,92.5 358.0,91.7 360.0,90.8 362.0,90.0 364.0,89.2 366.0,88.3 368.0,87.5 370.0,86.7 372.0,85.8 374.0,85.0 376.0,84.2 378.0,83.3 380.0,82.5 382.0,81.7 384.0,80.8 386.0,80.0 388.0,79.2 390.0,78.3 392.0,77.5 394.0,76.7 396.0,75.8 398.0,75.0 400.0,74.2 402.0,73.3 404.0,72.5 406.0,71.7 408.0,70.8 410.0,70.0 412.0,69.2 414.0,68.3 416.0,67.5 418.0,66.7 420.0,65.8 422.0,65.0 424.0,64.2 426.0,63.3 428.0,62.5 430.0,61.7 432.0,60.8 434.0,60.0 436.0,59.2 438.0,58.3 440.0,57.5 442.0,56.7 444.0,55.8 446.0,55.0 448.0,54.2 450.0,53.3 452.0,52.5 454.0,51.7 456.0,50.8 458.0,50.0 460.0,49.2 462.0,48.3 464.0,47.5 466.0,46.7 468.0,45.8 470.0,45.0 472.0,44.2 474.0,43.3 476.0,42.5 478.0,41.7 480.0,40.8 482.0,40.0 484.0,39.2 486.0,38.3 488.0,37.5 490.0,36.7 492.0,35.8 494.0,35.0 496.0,34.2 498.0,33.3 500.0,32.5 502.0,31.7 504.0,30.8 506.0,30.0 508.0,29.2 510.0,28.3 512.0,27.5 514.0,26.7 516.0,25.8 518.0,25.0 520.0,24.2 522.0,23.3 524.0,22.5 526.0,21.7 528.0,20.8 530.0,20.0" fill="none" class="sb" stroke-width="2.4"/><line x1="58" y1="32" x2="80" y2="32" class="sb" stroke-width="2.5"/><text x="86" y="36" font-size="11.5" text-anchor="start">squared: r</text><polyline points="50.0,170.0 52.0,170.0 54.0,170.0 56.0,170.0 58.0,170.0 60.0,170.0 62.0,170.0 64.0,170.0 66.0,170.0 68.0,170.0 70.0,170.0 72.0,170.0 74.0,170.0 76.0,170.0 78.0,170.0 80.0,170.0 82.0,170.0 84.0,170.0 86.0,170.0 88.0,170.0 90.0,170.0 92.0,170.0 94.0,170.0 96.0,170.0 98.0,170.0 100.0,170.0 102.0,170.0 104.0,170.0 106.0,170.0 108.0,170.0 110.0,170.0 112.0,170.0 114.0,170.0 116.0,170.0 118.0,170.0 120.0,170.0 122.0,170.0 124.0,170.0 126.0,170.0 128.0,170.0 130.0,170.0 132.0,170.0 134.0,170.0 136.0,170.0 138.0,170.0 140.0,170.0 142.0,170.0 144.0,170.0 146.0,170.0 148.0,170.0 150.0,170.0 152.0,170.0 154.0,170.0 156.0,170.0 158.0,170.0 160.0,170.0 162.0,170.0 164.0,170.0 166.0,170.0 168.0,170.0 170.0,170.0 172.0,169.2 174.0,168.3 176.0,167.5 178.0,166.7 180.0,165.8 182.0,165.0 184.0,164.2 186.0,163.3 188.0,162.5 190.0,161.7 192.0,160.8 194.0,160.0 196.0,159.2 198.0,158.3 200.0,157.5 202.0,156.7 204.0,155.8 206.0,155.0 208.0,154.2 210.0,153.3 212.0,152.5 214.0,151.7 216.0,150.8 218.0,150.0 220.0,149.2 222.0,148.3 224.0,147.5 226.0,146.7 228.0,145.8 230.0,145.0 232.0,144.2 234.0,143.3 236.0,142.5 238.0,141.7 240.0,140.8 242.0,140.0 244.0,139.2 246.0,138.3 248.0,137.5 250.0,136.7 252.0,135.8 254.0,135.0 256.0,134.2 258.0,133.3 260.0,132.5 262.0,131.7 264.0,130.8 266.0,130.0 268.0,129.2 270.0,128.3 272.0,127.5 274.0,126.7 276.0,125.8 278.0,125.0 280.0,124.2 282.0,123.3 284.0,122.5 286.0,121.7 288.0,120.8 290.0,120.0 292.0,119.2 294.0,118.3 296.0,117.5 298.0,116.7 300.0,115.8 302.0,115.0 304.0,114.2 306.0,113.3 308.0,112.5 310.0,111.7 312.0,110.8 314.0,110.0 316.0,109.2 318.0,108.3 320.0,107.5 322.0,106.7 324.0,105.8 326.0,105.0 328.0,104.2 330.0,103.3 332.0,102.5 334.0,101.7 336.0,100.8 338.0,100.0 340.0,99.2 342.0,98.3 344.0,97.5 346.0,96.7 348.0,95.8 350.0,95.0 352.0,94.2 354.0,93.3 356.0,92.5 358.0,91.7 360.0,90.8 362.0,90.0 364.0,89.2 366.0,88.3 368.0,87.5 370.0,86.7 372.0,85.8 374.0,85.0 376.0,84.2 378.0,83.3 380.0,82.5 382.0,81.7 384.0,80.8 386.0,80.0 388.0,79.2 390.0,78.3 392.0,77.5 394.0,76.7 396.0,75.8 398.0,75.0 400.0,74.2 402.0,73.3 404.0,72.5 406.0,71.7 408.0,70.8 410.0,70.0 412.0,70.0 414.0,70.0 416.0,70.0 418.0,70.0 420.0,70.0 422.0,70.0 424.0,70.0 426.0,70.0 428.0,70.0 430.0,70.0 432.0,70.0 434.0,70.0 436.0,70.0 438.0,70.0 440.0,70.0 442.0,70.0 444.0,70.0 446.0,70.0 448.0,70.0 450.0,70.0 452.0,70.0 454.0,70.0 456.0,70.0 458.0,70.0 460.0,70.0 462.0,70.0 464.0,70.0 466.0,70.0 468.0,70.0 470.0,70.0 472.0,70.0 474.0,70.0 476.0,70.0 478.0,70.0 480.0,70.0 482.0,70.0 484.0,70.0 486.0,70.0 488.0,70.0 490.0,70.0 492.0,70.0 494.0,70.0 496.0,70.0 498.0,70.0 500.0,70.0 502.0,70.0 504.0,70.0 506.0,70.0 508.0,70.0 510.0,70.0 512.0,70.0 514.0,70.0 516.0,70.0 518.0,70.0 520.0,70.0 522.0,70.0 524.0,70.0 526.0,70.0 528.0,70.0 530.0,70.0" fill="none" class="sg" stroke-width="2.4"/><line x1="58" y1="49" x2="80" y2="49" class="sg" stroke-width="2.5"/><text x="86" y="53" font-size="11.5" text-anchor="start">Huber δ=3: clip(r, −3, 3)</text><polyline points="50.0,136.7 52.0,136.7 54.0,136.7 56.0,136.7 58.0,136.7 60.0,136.7 62.0,136.7 64.0,136.7 66.0,136.7 68.0,136.7 70.0,136.7 72.0,136.7 74.0,136.7 76.0,136.7 78.0,136.7 80.0,136.7 82.0,136.7 84.0,136.7 86.0,136.7 88.0,136.7 90.0,136.7 92.0,136.7 94.0,136.7 96.0,136.7 98.0,136.7 100.0,136.7 102.0,136.7 104.0,136.7 106.0,136.7 108.0,136.7 110.0,136.7 112.0,136.7 114.0,136.7 116.0,136.7 118.0,136.7 120.0,136.7 122.0,136.7 124.0,136.7 126.0,136.7 128.0,136.7 130.0,136.7 132.0,136.7 134.0,136.7 136.0,136.7 138.0,136.7 140.0,136.7 142.0,136.7 144.0,136.7 146.0,136.7 148.0,136.7 150.0,136.7 152.0,136.7 154.0,136.7 156.0,136.7 158.0,136.7 160.0,136.7 162.0,136.7 164.0,136.7 166.0,136.7 168.0,136.7 170.0,136.7 172.0,136.7 174.0,136.7 176.0,136.7 178.0,136.7 180.0,136.7 182.0,136.7 184.0,136.7 186.0,136.7 188.0,136.7 190.0,136.7 192.0,136.7 194.0,136.7 196.0,136.7 198.0,136.7 200.0,136.7 202.0,136.7 204.0,136.7 206.0,136.7 208.0,136.7 210.0,136.7 212.0,136.7 214.0,136.7 216.0,136.7 218.0,136.7 220.0,136.7 222.0,136.7 224.0,136.7 226.0,136.7 228.0,136.7 230.0,136.7 232.0,136.7 234.0,136.7 236.0,136.7 238.0,136.7 240.0,136.7 242.0,136.7 244.0,136.7 246.0,136.7 248.0,136.7 250.0,136.7 252.0,136.7 254.0,136.7 256.0,136.7 258.0,136.7 260.0,136.7 262.0,136.7 264.0,136.7 266.0,136.7 268.0,136.7 270.0,136.7 272.0,136.7 274.0,136.7 276.0,136.7 278.0,136.7 280.0,136.7 282.0,136.7 284.0,136.7 286.0,136.7 288.0,136.7 290.0,120.0 292.0,103.3 294.0,103.3 296.0,103.3 298.0,103.3 300.0,103.3 302.0,103.3 304.0,103.3 306.0,103.3 308.0,103.3 310.0,103.3 312.0,103.3 314.0,103.3 316.0,103.3 318.0,103.3 320.0,103.3 322.0,103.3 324.0,103.3 326.0,103.3 328.0,103.3 330.0,103.3 332.0,103.3 334.0,103.3 336.0,103.3 338.0,103.3 340.0,103.3 342.0,103.3 344.0,103.3 346.0,103.3 348.0,103.3 350.0,103.3 352.0,103.3 354.0,103.3 356.0,103.3 358.0,103.3 360.0,103.3 362.0,103.3 364.0,103.3 366.0,103.3 368.0,103.3 370.0,103.3 372.0,103.3 374.0,103.3 376.0,103.3 378.0,103.3 380.0,103.3 382.0,103.3 384.0,103.3 386.0,103.3 388.0,103.3 390.0,103.3 392.0,103.3 394.0,103.3 396.0,103.3 398.0,103.3 400.0,103.3 402.0,103.3 404.0,103.3 406.0,103.3 408.0,103.3 410.0,103.3 412.0,103.3 414.0,103.3 416.0,103.3 418.0,103.3 420.0,103.3 422.0,103.3 424.0,103.3 426.0,103.3 428.0,103.3 430.0,103.3 432.0,103.3 434.0,103.3 436.0,103.3 438.0,103.3 440.0,103.3 442.0,103.3 444.0,103.3 446.0,103.3 448.0,103.3 450.0,103.3 452.0,103.3 454.0,103.3 456.0,103.3 458.0,103.3 460.0,103.3 462.0,103.3 464.0,103.3 466.0,103.3 468.0,103.3 470.0,103.3 472.0,103.3 474.0,103.3 476.0,103.3 478.0,103.3 480.0,103.3 482.0,103.3 484.0,103.3 486.0,103.3 488.0,103.3 490.0,103.3 492.0,103.3 494.0,103.3 496.0,103.3 498.0,103.3 500.0,103.3 502.0,103.3 504.0,103.3 506.0,103.3 508.0,103.3 510.0,103.3 512.0,103.3 514.0,103.3 516.0,103.3 518.0,103.3 520.0,103.3 522.0,103.3 524.0,103.3 526.0,103.3 528.0,103.3 530.0,103.3" fill="none" class="sr" stroke-width="2.4"/><line x1="58" y1="66" x2="80" y2="66" class="sr" stroke-width="2.5"/><text x="86" y="70" font-size="11.5" text-anchor="start">absolute: sign(r)</text><text x="290.0" y="266" text-anchor="middle" class="tm" font-size="11.5">residual y − F  →  what the next tree is asked to fit</text></svg><figcaption>What each loss tells the next tree. Squared error passes residuals through unchanged, so a residual of 6 pulls 6 times harder than a residual of 1. Absolute error only passes the direction. Huber is squared for small residuals and absolute beyond δ.</figcaption></figure>
  <p>Squared error passes the residual through unchanged, a straight diagonal line, so a row that is 6 off pulls six times harder than a row that is 1 off. Absolute error passes only the direction, a flat +1 or −1, so every row pulls equally hard. Huber follows the diagonal for small residuals and goes flat beyond δ, so ordinary errors are treated as in squared error while huge ones are capped. Think of the residuals as votes on where the next tree should move the predictions: squared error lets a loud row shout as loudly as it likes, absolute error gives every row exactly one vote, and Huber lets rows speak normally but takes the megaphone away from anyone who starts shouting.</p>
  <p>On the diary, suppose the captain wrote 83 instead of 22 for D6. What does each loss tell the first tree about D6?</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y = df.Turnout.values.astype(float)
y_typo = y.copy(); y_typo[5] = 83                     # D6: 22 players written down as 83
for name, yy in [("clean", y), ("D6 typed as 83", y_typo)]:
    r_sq = yy - yy.mean()                              # squared error: F0 = mean, pseudo-residual y - F
    r_abs = np.sign(yy - np.median(yy))                # absolute error: F0 = median, pseudo-residual sign(y - F)
    d = np.quantile(np.abs(yy - np.median(yy)), 0.9)   # Huber: sklearn's delta = 90th percentile of |y - F|
    r_hub = np.clip(yy - np.median(yy), -d, d)
    print(f"{name:15s} mean {yy.mean():5.2f} median {np.median(yy):4.1f} | D6 pseudo-residual: "
          f"squared {r_sq[5]:+6.2f}   absolute {r_abs[5]:+.0f}   Huber (delta {d:.1f}) {r_hub[5]:+6.2f}")</div>
  <div class="fx" data-lang="text">clean           mean 34.00 median 37.0 | D6 pseudo-residual: squared -12.00   absolute -1   Huber (delta 16.4) -15.00
D6 typed as 83  mean 38.36 median 38.0 | D6 pseudo-residual: squared +44.64   absolute +1   Huber (delta 18.0) +18.00</div>
  <p>Squared error starts at the mean, which the typo drags from 34 to 38.36, and then tells the first tree that D6 is +44.64 off, three times more than any other day. Absolute error starts at the median, which barely moves (37 to 38), and passes only the direction, +1, like every other day. Huber passes the residual itself up to δ (sklearn sets δ to the 90th percentile of the absolute residuals, here 18) and caps it there, so D6 says +18 instead of +44.64. At scale, here are 2,000 synthetic house prices where 3% of the training labels were typed with an extra zero (ten times too big), and a test set with clean prices; the last lines fit two quantile models to build a prediction interval:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
rng = np.random.default_rng(0)
n = 2000
X = rng.uniform(0, 10, (n, 2))
y = 50 + 10 * np.sin(X[:, 0]) + 3 * X[:, 1] + rng.normal(0, 2, n)          # house prices (lakh)
Xte = rng.uniform(0, 10, (1000, 2))
yte = 50 + 10 * np.sin(Xte[:, 0]) + 3 * Xte[:, 1] + rng.normal(0, 2, 1000)
bad = rng.random(n) &lt; 0.03                       # 3% of labels typed with an extra zero
y_dirty = np.where(bad, y * 10, y)
for loss in ["squared_error", "absolute_error", "huber"]:
    m = GradientBoostingRegressor(loss=loss, n_estimators=300, max_depth=3, random_state=0).fit(X, y_dirty)
    print(f"{loss:15s} start value {m.init_.predict(X[:1])[0]:5.1f}   test MAE on clean data {mean_absolute_error(yte, m.predict(Xte)):5.2f}")
lo = GradientBoostingRegressor(loss="quantile", alpha=0.05, n_estimators=300, max_depth=3, random_state=0).fit(X, y)
hi = GradientBoostingRegressor(loss="quantile", alpha=0.95, n_estimators=300, max_depth=3, random_state=0).fit(X, y)
inside = np.mean((yte &gt;= lo.predict(Xte)) &amp; (yte &lt;= hi.predict(Xte)))
print(f"5%-95% quantile band covers {inside:.1%} of test points (target 90%)")</div>
  <div class="fx" data-lang="text">squared_error   start value  84.9   test MAE on clean data 19.80
absolute_error  start value  67.7   test MAE on clean data  1.98
huber           start value  67.7   test MAE on clean data  4.16
5%-95% quantile band covers 82.6% of test points (target 90%)</div>
  <p>Squared error's starting value (the mean, 84.9) is already dragged far above the typical price of about 67, and its test error on clean data is 19.80. Absolute error starts at the median (67.7), which the outliers barely move, and its test error is 1.98, ten times better. Huber sits between them at 4.16: sklearn sets its δ each round to the 90th percentile of the absolute residuals, so with 3% outliers some outlier pull remains. Quantile loss at α = 0.05 and α = 0.95 gives a band that should contain 90% of new points; here it covers 82.6%. Quantile bands from boosting are often too narrow, because the trees overfit the training residuals, so check coverage on held-out data before trusting them.</p>
  <p>Now classification, which needs the log-loss derivation. The model's output F is a log-odds, any real number, and the probability is p = σ(F) = 1/(1 + e^−F), the sigmoid from <a class="xref" data-note="ml_classification">Classification</a>. The log-loss of one row is L = −[y ln p + (1 − y) ln(1 − p)] with y = 1 or 0. Using the chain rule and the sigmoid's derivative dp/dF = p(1 − p): ∂L/∂F = −[y/p − (1 − y)/(1 − p)]·p(1 − p) = −[y(1 − p) − (1 − y)p] = p − y. So the pseudo-residual is simply <strong>y − p</strong>, "actual label minus predicted probability". A churner (y = 1) predicted at p = 0.3 gets +0.7: push F up. A stayer predicted at 0.3 gets −0.3: push it down a little. We will also need the second derivative in section 05: ∂²L/∂F² = p(1 − p). The best constant probability is the base rate ȳ, so F₀ = ln(ȳ/(1 − ȳ)), the log-odds of the base rate.</p>
  <p>On the diary, Play is 1 for the 9 played days and 0 for the other 5. The base rate is 9/14 = 0.643, so F₀ = ln(0.643/0.357) = ln 1.8 = 0.588, and every day starts at p = 0.643, with a log-loss of 0.652. The pseudo-residuals y − p are +0.357 for the nine played days and −0.643 for the five others. A regression stump fitted to those splits on "Overcast?": the four overcast days were all played (+0.357 each), and the other ten average −0.143. What those leaves should actually add to F is the subject of the next section.</p>

  <h2 id="gbm-leaf"><span class="num">05</span>Leaf Values: the Line Search</h2>
  <p>The tree is fitted to the pseudo-residuals by least squares, so each leaf naturally holds the mean pseudo-residual of its rows: +0.357 for the overcast leaf. For squared error that is exactly the right step (section 04 of <a class="xref" data-note="ml_boosting">How Boosting Works</a> showed β = 1). For log-loss it is not even in the right units: the pseudo-residuals are differences of probabilities, between −1 and 1, but F is measured in log-odds. Adding +0.357 log-odds to an overcast day would move its probability only from 0.643 to 0.719, even though all four overcast days were played.</p>
  <p>Friedman's fix (he called it TreeBoost) is to use the tree only for its <em>structure</em>, which rows land in which leaf, and then, separately for each leaf j, choose the one number γⱼ that makes the real loss of that leaf's rows as small as possible: γⱼ = argmin over γ of Σ L(yᵢ, F_{m−1}(xᵢ) + γ) over the rows in leaf j. This is called a <strong>line search</strong>. For squared error the answer is the leaf's mean residual, which the tree already holds. For absolute error it is the leaf's median residual, because the median minimises a sum of absolute values. For log-loss there is no closed-form answer, so one <strong>Newton step</strong> from γ = 0 is used: γ = −(sum of first derivatives)/(sum of second derivatives) = Σ(yᵢ − pᵢ) / Σ pᵢ(1 − pᵢ).</p>
  <p>Why Newton, in plain words: the first derivative says which way to go, and the second says how curved the loss is there. Dividing by the curvature converts "probability units" into "log-odds units". Near p = 0.5 the sigmoid is steep (p(1 − p) = 0.25, its largest value), so a small move in F changes p a lot; near p = 0.95 it is flat (p(1 − p) = 0.0475), so F must move much further for the same change in p. It is like converting a distance on a map into steps on the ground: the same centimetre on the map means a different number of steps depending on the scale at that spot.</p>
  <p>On the diary, round 1 with ν = 0.5. The overcast leaf (D3, D7, D12, D13) has Σ(y − p) = 4 × 0.357 = 1.429 and Σp(1 − p) = 4 × 0.643 × 0.357 = 0.918, so its Newton value is 1.429/0.918 = +1.556, more than four times the mean residual. The other leaf (10 days, 5 played) has Σ(y − p) = 5 × 0.357 − 5 × 0.643 = −1.429 and Σp(1 − p) = 10 × 0.2296 = 2.296, so γ = −0.622. After adding half of each, an overcast day has F = 0.588 + 0.778 = 1.366, which is p = 0.797, and the other days have F = 0.277, p = 0.569. The code runs two rounds and compares with sklearn:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingClassifier
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)], axis=1)
y = (df.Play == "Yes").astype(int).values            # 1 = played
lr = 0.5
sig = lambda F: 1 / (1 + np.exp(-F))
logloss = lambda p: -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
p0 = y.mean(); F = np.full(14, np.log(p0 / (1 - p0)))  # F0 = log-odds of the base rate
print(f"F0 = ln({p0:.4f}/{1 - p0:.4f}) = {F[0]:.4f}   log-loss {logloss(sig(F)):.4f}")
rs = np.random.RandomState(0)
for m in range(1, 3):
    p = sig(F); r = y - p                             # pseudo-residuals
    t = DecisionTreeRegressor(max_depth=1, random_state=rs).fit(X, r)
    print(f"round {m}: tree splits on {X.columns[t.tree_.feature[0]]}")
    leaf = t.apply(X)
    for j in np.unique(leaf):
        s = leaf == j
        num, den = r[s].sum(), (p[s] * (1 - p[s])).sum()
        print(f"   leaf of {s.sum():2d} days: mean residual {r[s].mean():+.4f}   "
              f"Newton value {num:+.3f}/{den:.3f} = {num / den:+.4f}")
        F[s] += lr * num / den
    print(f"   log-loss after round {m}: {logloss(sig(F)):.4f}")
sk = GradientBoostingClassifier(n_estimators=2, learning_rate=lr, max_depth=1, random_state=0).fit(X, y)
print(f"largest gap to sklearn: scores {np.abs(sk.decision_function(X) - F).max():.1e}, "
      f"probabilities {np.abs(sk.predict_proba(X)[:, 1] - sig(F)).max():.1e}")</div>
  <div class="fx" data-lang="text">F0 = ln(0.6429/0.3571) = 0.5878   log-loss 0.6518
round 1: tree splits on Outlook_Overcast
   leaf of 10 days: mean residual -0.1429   Newton value -1.429/2.296 = -0.6222
   leaf of  4 days: mean residual +0.3571   Newton value +1.429/0.918 = +1.5556
   log-loss after round 1: 0.5669
round 2: tree splits on Humidity_High
   leaf of  7 days: mean residual +0.2233   Newton value +1.563/1.550 = +1.0082
   leaf of  7 days: mean residual -0.2053   Newton value -1.437/1.550 = -0.9269
   log-loss after round 2: 0.4887
largest gap to sklearn: scores 2.2e-16, probabilities 1.1e-16</div>
  <p>Round 1 matches the hand numbers, and log-loss falls from 0.652 to 0.567. In round 2 the stump splits on Humidity_High, the same question the decision tree asks on sunny days, with Newton values +1.008 and −0.927, and log-loss falls to 0.489. Our scores and probabilities agree with sklearn's <code>GradientBoostingClassifier</code> to about 10⁻¹⁶: sklearn computes exactly this Newton value in its leaves.</p>
  <p>Putting everything together, the full algorithm (Friedman, 2001) is: (1) set F₀ to the constant that minimises the loss; (2) for each round, compute the pseudo-residual of every row at the current F, fit a regression tree with a fixed number of leaves to them by least squares, choose each leaf's value by a line search on the real loss, and add ν times that tree to F; (3) output F, turned into a probability with the sigmoid for classification. For K classes, log-loss becomes the softmax loss and each round fits K trees, one per class, each on its own pseudo-residuals 1[y = k] − p_k, so 100 rounds on 10 classes means 1,000 trees. XGBoost takes the Newton idea further: it uses first and second derivatives not only for the leaf values but also to choose the splits, and adds a penalty λ, giving leaf values −G/(H + λ) (<a class="xref" data-note="ml_xgboost">XGBoost</a>).</p>

  <h2 id="gbm-lr"><span class="num">06</span>Learning Rate and Number of Trees</h2>
  <p>Each leaf now holds the best step for its rows. Should the model take that whole step every round? With ν = 1 each tree takes its full step, and since each tree is fitted to noisy pseudo-residuals of a finite sample, a full step bakes that noise straight into the model. With a small ν each tree contributes only a little, and the final model is the sum of many trees whose individual quirks partly cancel. The price is that more trees are needed. <a class="xref" data-note="ml_boosting">How Boosting Works</a> showed this on the diary (ν = 0.1 needs many more rounds to fit the same 14 days) and on churn with HistGradientBoosting. Here is the same effect with the classic estimator, depth-3 trees and 600 trees per learning rate, tracking validation log-loss after every tree (<code>staged_predict_proba</code> gives the model after 1, 2, 3, … trees without refitting):</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss
for lr in [1.0, 0.3, 0.1]:
    gb = GradientBoostingClassifier(learning_rate=lr, n_estimators=600, max_depth=3, random_state=0).fit(Xtr, ytr)
    va = np.array([log_loss(yva, p[:, 1]) for p in gb.staged_predict_proba(Xva)])
    b = int(np.argmin(va))
    print(f"lr={lr:3.1f}  validation log-loss @10 {va[9]:.3f}  @100 {va[99]:.3f}  @600 {va[-1]:.3f}"
          f"   best {va[b]:.3f} at tree {b + 1}")</div>
  <div class="fx" data-lang="text">lr=1.0  validation log-loss @10 0.477  @100 0.437  @600 0.573   best 0.420 at tree 24
lr=0.3  validation log-loss @10 0.514  @100 0.388  @600 0.371   best 0.366 at tree 471
lr=0.1  validation log-loss @10 0.584  @100 0.456  @600 0.373   best 0.372 at tree 584</div>
  <p>Read the three lines side by side. ν = 1 reaches its best, 0.420, after only 24 trees and then overfits: by tree 600 its validation loss has risen to 0.573. ν = 0.3 reaches a much better best, 0.366, but only at tree 471, and has barely started to rise by 600. ν = 0.1 is slower still: after 10 trees it is the worst of the three (0.584), and at tree 584 it is at 0.372 and still falling, so it simply needs more than this budget of 600 trees. The rule is that smaller ν gives a better (or equal) best score but needs proportionally more trees, roughly doubling the trees each time ν is halved; full steps are clearly worse, and below about 0.1 the gain becomes small while the cost keeps growing. The practical recipe is to fix ν around 0.05 to 0.1, set a large number of trees, and let early stopping (section 08) choose how many to keep. Never tune the number of trees and then change ν without retuning, because the best number of trees depends on ν.</p>

  <h2 id="gbm-depth"><span class="num">07</span>Tree Depth and Interactions</h2>
  <p>So far every tree has been a stump. Is that enough? A path from the root of a depth-d tree to a leaf asks at most d questions, so it can involve at most d different features: each tree can model an <strong>interaction</strong> (a pattern where the effect of one feature depends on another) of order at most d. A sum of stumps is an additive model, F(x) = f₁(x₁) + f₂(x₂) + …, one separate curve per feature and no "this AND that". The diary already contains such a pattern. Play follows the rule "overcast → play; sunny → play only if humidity is normal; rain → play only if the wind is weak". Whether humidity matters depends on the outlook. Boosting 200 trees of each depth on Play:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import GradientBoostingClassifier
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = (df.Play == "Yes").astype(int)
for depth in [1, 2]:
    gb = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=depth, random_state=0).fit(X, y)
    p = gb.predict_proba(X)[:, 1]
    print(f"depth {depth}: days right {int((gb.predict(X) == y).sum())}/14   "
          f"P(play) on D4 {p[3]:.2f} (played), D6 {p[5]:.2f} (not played)")</div>
  <div class="fx" data-lang="text">depth 1: days right 11/14   P(play) on D4 0.43 (played), D6 0.59 (not played)
depth 2: days right 14/14   P(play) on D4 1.00 (played), D6 0.00 (not played)</div>
  <p>Stumps stop at 11 of 14 days. They can only add up "the effect of sunny" + "the effect of humid" + "the effect of windy", so a rainy, humid, calm day like D4 (played) and a rainy, normal, windy day like D6 (not played) get muddled: P(play) 0.43 and 0.59, both on the wrong side. Depth-2 trees can ask "Rain? then Windy?" and get all 14 (and, on just 14 days, memorise them completely). The cleanest test at scale is a target that is a pure interaction, y = x₁·x₂ with both inputs between −1 and 1: for any value of x₁, x₂ is equally likely to be positive or negative, so x₁ on its own tells you nothing, and the same is true of x₂. Only the combination matters. After that, a depth sweep on churn:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
rng = np.random.default_rng(0)
Xi = rng.uniform(-1, 1, (3000, 2)); yi = Xi[:, 0] * Xi[:, 1] + rng.normal(0, 0.05, 3000)   # pure interaction
Xit = rng.uniform(-1, 1, (2000, 2)); yit = Xit[:, 0] * Xit[:, 1]
for d in [1, 2, 3]:
    m = GradientBoostingRegressor(max_depth=d, n_estimators=500, random_state=0).fit(Xi, yi)
    print(f"y = x1*x2, depth {d}: test R^2 {m.score(Xit, yit):.3f}")
for d in [1, 3, 6]:
    gb = GradientBoostingClassifier(max_depth=d, n_estimators=200, random_state=0).fit(Xtr, ytr)
    print(f"churn, depth {d}: train acc {gb.score(Xtr, ytr):.3f}   validation acc {gb.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">y = x1*x2, depth 1: test R^2 -0.034
y = x1*x2, depth 2: test R^2 0.928
y = x1*x2, depth 3: test R^2 0.990
churn, depth 1: train acc 0.660   validation acc 0.649
churn, depth 3: train acc 0.856   validation acc 0.817
churn, depth 6: train acc 0.962   validation acc 0.866</div>
  <p>Stumps score R² ≈ 0 on x₁·x₂, no better than predicting the mean, because no single-feature split helps at all; depth 2 gets most of it and depth 3 nearly all. The churn data was generated with interacting clusters, and its validation accuracy climbs from 0.649 with stumps to 0.817 at depth 3 and 0.866 at depth 6, while training accuracy climbs faster (to 0.962), a sign that variance is growing too. On most real tables depth 3 to 8 (or 8 to 64 leaves) is the useful range; Friedman found that trees with 4 to 8 leaves were usually enough. The related settings are <code>max_depth</code> (interaction order and tree size), <code>max_leaf_nodes</code> (tree size directly, grown best-first; overrides <code>max_depth</code> in sklearn) and <code>min_samples_leaf</code> (no tiny leaves, which also stabilises the Newton step, since p(1 − p) is summed over more rows). Do not copy random-forest habits here: a forest averages deep trees, while boosting adds shallow ones, and deep trees in boosting overfit within a few rounds.</p>

  <h2 id="gbm-sub"><span class="num">08</span>Subsampling and Early Stopping</h2>
  <p>Bagging made its trees different by training each on a random sample of rows. Boosting's trees all see the same rows, so they tend to be alike. <strong>Stochastic gradient boosting</strong> (Friedman, 2002) borrows the bagging idea: each tree is fitted on a random fraction of the rows, drawn fresh each round without replacement (<code>subsample=0.5</code> means half the rows). The trees' errors become less correlated, which lowers variance, and each tree is cheaper to fit. <code>max_features</code> adds random-forest-style sampling of columns at each split. On the diary, <code>subsample=0.5</code> would fit each round's stump on 7 randomly chosen days. On churn, 500 depth-4 trees at the default learning rate 0.1 (fit times approximate):</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss
for sub, mf in [(1.0, None), (0.5, None), (0.5, 0.5)]:
    t0 = time.time()
    gb = GradientBoostingClassifier(n_estimators=500, max_depth=4, subsample=sub, max_features=mf,
                                    random_state=0).fit(Xtr, ytr)
    print(f"subsample={sub} max_features={mf}:  validation log-loss "
          f"{log_loss(yva, gb.predict_proba(Xva)[:, 1]):.3f}   acc {gb.score(Xva, yva):.3f}   fit {time.time() - t0:.0f}s")</div>
  <div class="fx" data-lang="text">subsample=1.0 max_features=None:  validation log-loss 0.351   acc 0.848   fit 65s
subsample=0.5 max_features=None:  validation log-loss 0.349   acc 0.854   fit 33s
subsample=0.5 max_features=0.5:  validation log-loss 0.349   acc 0.853   fit 18s</div>
  <p>Using half the rows per tree gives a slightly better validation log-loss (0.349 against 0.351) and accuracy (0.854 against 0.848) than using all of them, while fitting roughly twice as fast; adding column sampling (half the features at each split) keeps the same quality and cuts the time again. Typical values are <code>subsample</code> 0.5 to 0.8 and column sampling 0.5 to 1.0. The rows left out of a round can also serve as an out-of-bag check, which sklearn reports as <code>oob_improvement_</code>, but it is measured on a different random set each round and is noisy, so treat it as a rough guide rather than a replacement for a validation set.</p>
  <p>The bigger danger remains overfitting by adding trees. A random forest averages, so another tree barely changes it; gradient boosting adds, and each new tree fits whatever is left, which eventually is noise. Training loss always falls with more trees (on the diary, depth-2 boosting reached a log-loss of 0.000, memorising every day), so only held-out data can say when to stop. <strong>Early stopping</strong> automates this: hold back a slice of the training data, evaluate after every tree, and stop when the validation loss has not improved by at least <code>tol</code> for <code>n_iter_no_change</code> trees in a row. The model keeps the trees up to that point.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier
gb = GradientBoostingClassifier(n_estimators=5000, learning_rate=0.1, max_depth=4,
                                validation_fraction=0.2, n_iter_no_change=30, tol=1e-4,
                                random_state=0).fit(Xtr, ytr)
print(f"allowed 5000 trees, stopped at {gb.n_estimators_}   test acc {gb.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">allowed 5000 trees, stopped at 398   test acc 0.847</div>
  <p>The estimator was allowed 5,000 trees but stopped by itself at 398, with a test accuracy of 0.847, when 30 trees in a row had not improved the held-out 20% of the training rows; nobody had to guess the number of trees. In the classic <code>GradientBoosting*</code> classes early stopping is off unless you set <code>n_iter_no_change</code>, and the number of trees actually used is <code>n_estimators_</code>; in <code>HistGradientBoosting*</code> it is switched on automatically for datasets above 10,000 rows (<code>early_stopping="auto"</code>), and the number used is <code>n_iter_</code>. Never use the test set for early stopping: the number of trees would then be tuned to look good on it, and the test score would no longer be an honest estimate.</p>

  <h2 id="gbm-scratch"><span class="num">09</span>From Scratch</h2>
  <p>We now have every piece: the starting value, pseudo-residuals, a tree fitted to them, Newton leaf values and shrinkage. Is that really the whole algorithm? The test is to write it ourselves and compare with sklearn on real-sized data. The churn setup used by every churn example on this page is:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)
X["coin_noise"] = rng.integers(0, 2, 20000)
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)</div>
  <p>Below is a complete binary gradient boosting classifier. It uses sklearn's <code>DecisionTreeRegressor</code> only to grow each tree; the boosting itself (log-odds start, y − p targets, Newton leaves, shrinkage and summing) is ours.</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingClassifier
class MyGBClassifier:                                   # binary log-loss, labels 0/1
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3):
        self.M, self.lr, self.depth = n_estimators, learning_rate, max_depth
    def fit(self, X, y):
        p = y.mean()
        self.f0 = np.log(p / (1 - p))                   # 1. start at the log-odds
        F = np.full(len(y), self.f0)
        self.trees = []
        rs = np.random.RandomState(0)                   # one shared RNG breaks ties like sklearn
        for m in range(self.M):
            p = 1 / (1 + np.exp(-F))
            g = y - p                                   # 2. negative gradient of log-loss
            t = DecisionTreeRegressor(max_depth=self.depth, min_samples_leaf=20, random_state=rs).fit(X, g)
            leaf = t.apply(X)                           # 3. Newton value in every leaf
            for j in np.unique(leaf):
                s = leaf == j
                t.tree_.value[j, 0, 0] = g[s].sum() / (p[s] * (1 - p[s])).sum()
            F += self.lr * t.tree_.value[leaf, 0, 0]    # 4. shrink and add
            self.trees.append(t)
        return self
    def predict_proba1(self, X):
        F = self.f0 + self.lr * sum(t.tree_.value[t.apply(X), 0, 0] for t in self.trees)
        return 1 / (1 + np.exp(-F))

Xa, Xb = Xtr.values, Xva.values
mine = MyGBClassifier(200, 0.1, 3).fit(Xa, ytr)
sk = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=3, min_samples_leaf=20,
                                random_state=0).fit(Xa, ytr)
pm, ps = mine.predict_proba1(Xb), sk.predict_proba(Xb)[:, 1]
print(f"largest probability gap on validation rows: {np.abs(pm - ps).max():.1e}")
print(f"validation accuracy: mine {np.mean((pm &gt; 0.5) == yva):.4f}, sklearn {sk.score(Xb, yva):.4f}")</div>
  <div class="fx" data-lang="text">largest probability gap on validation rows: 5.6e-16
validation accuracy: mine 0.8177, sklearn 0.8177</div>
  <p>The largest difference in predicted probability between our model and sklearn's, over all 3,000 validation rows, is at the level of floating-point rounding, and the accuracies are identical: our 25 lines <em>are</em> sklearn's algorithm. Three details were needed to get there, and each teaches something. The model starts at the log-odds, not at 0. Each leaf is overwritten with Σ(y − p)/Σp(1 − p); without that overwrite the probabilities differ noticeably. And when two features split a small node in exactly the same way, a tree breaks the tie using a random feature order; sklearn passes one shared random generator to all its trees, so we do the same, and <code>min_samples_leaf=20</code> keeps nodes from getting small enough for such ties to matter. For regression the code is even shorter: start at the mean, fit each tree to y − F, and add ν times its prediction, since the leaf means are already the line-search answer.</p>

  <h2 id="gbm-sk"><span class="num">10</span>GradientBoosting vs HistGradientBoosting</h2>
  <p>Our version and sklearn's classic one try every distinct value of every column as a cut-off: 9 cut-offs for the diary's 10 distinct HumPct readings, but nearly 12,000 for a single churn column, at every node of every tree. That is slow on big data. sklearn therefore has two implementations. <code>GradientBoostingClassifier</code> / <code>Regressor</code> is the classic algorithm of this page. <code>HistGradientBoostingClassifier</code> / <code>Regressor</code> (2019, modelled on LightGBM) first sorts each column's values into at most 255 <strong>bins</strong> (a histogram) and only tries bin edges as cut-offs, which is far faster and loses almost nothing, because a split at the 4,000th distinct value and one at the nearest bin edge separate almost the same rows. It also handles missing values and categorical columns natively.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier, HistGradientBoostingClassifier
for name, m in [("GradientBoosting", GradientBoostingClassifier(n_estimators=300, max_depth=5, random_state=0)),
                ("HistGradientBoosting", HistGradientBoostingClassifier(max_iter=300, max_depth=5,
                                                                        early_stopping=False, random_state=0))]:
    t0 = time.time(); m.fit(Xtr, ytr)
    print(f"{name:21s} 300 trees, depth 5: test acc {m.score(Xte, yte):.3f}   fit {time.time() - t0:5.1f}s")
print("distinct values in column f0:", Xtr["f0"].nunique(), "-&gt; HistGradientBoosting uses at most 255 bins")
Xmiss = Xtr.copy(); Xmiss.loc[Xmiss.sample(frac=0.2, random_state=0).index, "f0"] = np.nan
hgb = HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0).fit(Xmiss, ytr)
print("HistGradientBoosting with 20% NaN in f0: test acc", round(hgb.score(Xte, yte), 3))
try:
    GradientBoostingClassifier(n_estimators=5).fit(Xmiss, ytr)
except ValueError as e:
    print("GradientBoosting:", str(e).splitlines()[0])</div>
  <div class="fx" data-lang="text">GradientBoosting      300 trees, depth 5: test acc 0.856   fit  25.9s
HistGradientBoosting  300 trees, depth 5: test acc 0.861   fit   1.0s
distinct values in column f0: 12000 -&gt; HistGradientBoosting uses at most 255 bins
HistGradientBoosting with 20% NaN in f0: test acc 0.87
GradientBoosting: Input X contains NaN.</div>
  <p>With the same 300 depth-5 trees, the histogram version fits in about 1 second instead of about 26 (single-threaded, approximate) and is even slightly more accurate here (0.861 against 0.856). Column f0 has 12,000 distinct training values, but the histogram version only ever looks at 255 bins of it. With 20% of f0 set to missing (NaN), HistGradientBoosting trains as is, because at every split it tries sending the missing rows left and right and keeps the better side; the classic estimator refuses, so you would have to fill in the missing values first.</p>
  <table class="tbl">
    <tr><th></th><th>GradientBoosting*</th><th>HistGradientBoosting*</th></tr>
    <tr><td>split search</td><td>exact: every distinct value</td><td>histogram: at most 255 bins per feature</td></tr>
    <tr><td>speed on 10k+ rows</td><td>slow</td><td>much faster (multi-threaded)</td></tr>
    <tr><td>tree size default</td><td>max_depth=3</td><td>max_leaf_nodes=31, max_depth=None</td></tr>
    <tr><td>number of trees</td><td>n_estimators=100</td><td>max_iter=100</td></tr>
    <tr><td>missing values</td><td>error</td><td>native: learns which side NaN goes</td></tr>
    <tr><td>categorical features</td><td>encode yourself</td><td>categorical_features= (native splits)</td></tr>
    <tr><td>early stopping</td><td>off unless n_iter_no_change is set</td><td>on by default above 10,000 rows</td></tr>
    <tr><td>losses</td><td>squared, absolute, huber, quantile; log_loss, exponential</td><td>squared, absolute, gamma, poisson, quantile; log_loss</td></tr>
    <tr><td>extras</td><td>subsample, oob_improvement_, init, warm_start</td><td>l2_regularization, monotonic_cst, interaction_cst, class_weight</td></tr>
  </table>
  <p>Use the histogram version for almost everything above a few thousand rows; the classic one is fine for small data, teaching, or when you need its extras. Against the rest of the tree family, gradient boosting sits between AdaBoost and the big libraries:</p>
  <table class="tbl">
    <tr><th></th><th>AdaBoost</th><th>Gradient Boosting</th><th>Random Forest</th><th>XGBoost / LightGBM / CatBoost</th></tr>
    <tr><td>loss</td><td>exponential only</td><td>any differentiable</td><td>none (impurity per tree)</td><td>any twice-differentiable, plus penalties</td></tr>
    <tr><td>each tree fits</td><td>labels, on re-weighted rows</td><td>pseudo-residuals</td><td>labels, on a bootstrap sample</td><td>gradients and second derivatives</td></tr>
    <tr><td>trees</td><td>stumps or shallow</td><td>shallow (3–8)</td><td>deep</td><td>shallow; leaf-wise (LightGBM), symmetric (CatBoost)</td></tr>
    <tr><td>leaf value</td><td>class vote × α</td><td>line search (Newton for log-loss)</td><td>mean or majority</td><td>−G/(H + λ)</td></tr>
    <tr><td>main error reduced</td><td>bias</td><td>bias</td><td>variance</td><td>bias</td></tr>
    <tr><td>more trees can hurt</td><td>yes, with noise</td><td>yes; early stopping</td><td>no</td><td>yes; early stopping built in</td></tr>
    <tr><td>outliers and label noise</td><td>sensitive</td><td>choose the loss (Huber, absolute)</td><td>robust</td><td>choose the loss</td></tr>
  </table>
  <p>On our synthetic churn data a random forest is about as good as any booster (it was generated with many clusters and 5% flipped labels, which suits averaging); on most real tabular benchmarks, tuned gradient boosting libraries come out ahead. Always try both. The libraries are covered in <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a> and <a class="xref" data-note="ml_catboost">CatBoost</a>, and choosing settings in practice in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>

  <h2 id="gbm-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The classic bug in hand-written boosting is fitting each tree to y instead of to the residuals. Then every tree learns the same thing, the original pattern, and each round adds another copy of it on top of the mean:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.tree import DecisionTreeRegressor
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = df.Turnout.values.astype(float)
for name, fit_to_residuals in [("bug: tree.fit(X, y)    ", False), ("fix: tree.fit(X, y - F)", True)]:
    F = np.full(14, y.mean())
    asked, mse = set(), []
    for m in range(20):
        target = y - F if fit_to_residuals else y
        t = DecisionTreeRegressor(max_depth=1).fit(X, target)
        asked.add(X.columns[t.tree_.feature[0]])
        F = F + 0.5 * t.predict(X)
        mse.append(np.mean((y - F) ** 2))
    print(f"{name} MSE after 1, 5, 20 rounds: {mse[0]:8.2f} {mse[4]:8.2f} {mse[19]:8.2f}   columns used: {sorted(asked)}")</div>
  <div class="fx" data-lang="text">bug: tree.fit(X, y)     MSE after 1, 5, 20 rounds:   353.43  7361.43 118571.43   columns used: ['Humidity_High', 'Humidity_Normal']
fix: tree.fit(X, y - F) MSE after 1, 5, 20 rounds:    64.43    28.65    20.64   columns used: ['Humidity_High', 'Humidity_Normal', 'Outlook_Overcast', 'Outlook_Sunny', 'Wind_Strong', 'Wind_Weak']</div>
  <p>With the bug, every tree asks about humidity (the best question for y itself) and the predictions are pushed further and further from the truth: the MSE explodes to over 100,000. With the fix, each tree fits what is left, uses a new column when the old pattern is exhausted, and the MSE falls to the stump floor of about 20.6. A related mistake is forgetting F₀ and starting every prediction at 0: the first trees then spend themselves learning a constant (on the diary every residual starts around +34), which with a small learning rate takes many rounds, and for log-loss it means starting at p = 0.5 instead of the base rate.</p>
  <p>The second family of mistakes comes from treating gradient boosting like other models. It always uses <em>regression</em> trees, even for classification, because the targets y − p are real numbers and the output F is a log-odds, not a class. It needs early stopping, because more trees can overfit. It wants shallow trees, not the fully grown trees of a random forest. And it is sensitive to the loss: squared error on data with outliers lets them dominate the pseudo-residuals (test MAE 19.80 against 1.98 with absolute error in section 04), so pick absolute or Huber loss when outliers are possible.</p>
  <p>A mistake that surprises many people is expecting a boosted model to <strong>extrapolate</strong>. Each tree is a set of flat steps, so a sum of trees is flat too beyond the range of values it was trained on:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
months = np.arange(1, 37).reshape(-1, 1)                 # 3 years of monthly sales
sales = 100 + 5 * months[:, 0]                           # a steady upward trend
future = np.array([[37], [42], [48]])
gb = GradientBoostingRegressor(n_estimators=300, random_state=0).fit(months, sales)
lin = LinearRegression().fit(months, sales)
print("true future sales       ", (100 + 5 * future[:, 0]).tolist())
print("gradient boosting       ", np.round(gb.predict(future)).tolist())
print("linear regression       ", np.round(lin.predict(future)).tolist())</div>
  <div class="fx" data-lang="text">true future sales        [285, 310, 340]
gradient boosting        [280.0, 280.0, 280.0]
linear regression        [285.0, 310.0, 340.0]</div>
  <p>Trained on 36 months of steadily rising sales, gradient boosting predicts 280 for every future month, the value at the edge of its training data, while a straight line continues the trend correctly. For trending targets, model the trend separately (predict differences or ratios, or put a linear model underneath) or use features that stay inside the training range; see <a class="xref" data-note="ml_ts_ml">ML for Time Series</a>. Finally, sklearn's exact <code>GradientBoostingClassifier</code> is slow on large data; above roughly 100,000 rows use HistGradientBoosting, LightGBM or XGBoost.</p>

  <h2 id="gbm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Gradient boosting</b>: F_M = F₀ + ν·Σhₘ, each hₘ a small regression tree fitted to the pseudo-residuals of the current model, with leaf values chosen to minimise the loss.</li>
    <li><b>Pseudo-residual</b>: rᵢ = −∂L(yᵢ, F)/∂F at F = F_{m−1}(xᵢ); the direction and rough size by which row i's prediction should move.</li>
    <li><b>Line search / Newton leaf</b>: re-pick each leaf's value to minimise the true loss of its rows; for log-loss, one Newton step.</li>
    <li><b>Gradient descent in function space</b>: each step moves the prediction function, approximated by a tree.</li>
    <li><b>Stochastic gradient boosting</b>: each tree fitted on a random subsample of rows (without replacement).</li>
    <li><b>Early stopping</b>: stop when validation loss has not improved for n trees.</li>
  </ul>
  <h3>Losses</h3>
  <table class="tbl">
    <tr><th>loss</th><th>pseudo-residual</th><th>F₀</th><th>leaf value</th><th>diary (D6 typed as 83)</th></tr>
    <tr><td>squared</td><td>y − F</td><td>mean</td><td>mean residual</td><td>+44.64</td></tr>
    <tr><td>absolute</td><td>sign(y − F)</td><td>median</td><td>median residual</td><td>+1</td></tr>
    <tr><td>Huber</td><td>y − F capped at ±δ</td><td>median</td><td>line search</td><td>+18</td></tr>
    <tr><td>quantile α</td><td>α or α − 1</td><td>α-quantile</td><td>α-quantile of residuals</td><td>—</td></tr>
    <tr><td>log-loss</td><td>y − p</td><td>ln(ȳ/(1 − ȳ))</td><td>Σ(y − p)/Σp(1 − p)</td><td>Play: +0.357 / −0.643</td></tr>
  </table>
  <h3>Diary numbers</h3>
  <table class="tbl">
    <tr><th>what</th><th>value</th></tr>
    <tr><td>turnout rounds (ν = 0.5)</td><td>HumPct ≤ 82.5 → Overcast → Wind strong; SSE 1280 → 902 → 696.2 → 555.1</td></tr>
    <tr><td>Play start</td><td>F₀ = ln(9/5) = 0.588, p = 0.643, log-loss 0.652</td></tr>
    <tr><td>overcast leaf</td><td>mean +0.357, Newton 1.429/0.918 = +1.556</td></tr>
    <tr><td>log-loss after 2 rounds</td><td>0.652 → 0.567 → 0.489</td></tr>
    <tr><td>depth</td><td>stumps 11/14 days, depth 2 14/14</td></tr>
  </table>
  <h3>Settings</h3>
  <table class="tbl">
    <tr><th>setting</th><th>what it controls</th><th>typical</th></tr>
    <tr><td>learning_rate</td><td>step size; smaller needs more trees</td><td>0.05–0.1</td></tr>
    <tr><td>n_estimators / max_iter</td><td>number of trees</td><td>large, cut by early stopping</td></tr>
    <tr><td>max_depth / max_leaf_nodes</td><td>interaction order, tree size</td><td>depth 3–8, 8–64 leaves</td></tr>
    <tr><td>min_samples_leaf</td><td>smallest leaf</td><td>20+</td></tr>
    <tr><td>subsample, max_features</td><td>random rows / columns per tree</td><td>0.5–0.8, 0.5–1.0</td></tr>
    <tr><td>n_iter_no_change, validation_fraction</td><td>early stopping</td><td>10–50, 0.1–0.2</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingRegressor, HistGradientBoostingClassifier

gb = GradientBoostingRegressor(loss="huber", n_estimators=2000, learning_rate=0.05,
                               max_depth=4, subsample=0.8,
                               validation_fraction=0.2, n_iter_no_change=30)
gb.fit(X, y); gb.n_estimators_                  # trees kept by early stopping

hgb = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=2000)   # NaN, bins, auto early stopping
hgb.fit(X, y); hgb.predict_proba(X_new)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Fit trees to the pseudo-residuals, never to y.</li>
    <li>Start from F₀ (mean / median / log-odds), not 0.</li>
    <li>Trees are regression trees even for classification.</li>
    <li>For log-loss, leaves need the Newton step, not the mean residual.</li>
    <li>Tune ν and the number of trees together; prefer early stopping.</li>
    <li>Squared error with outliers: use Huber or absolute.</li>
    <li>No extrapolation beyond the training range.</li>
  </ul>

  <h2 id="gbm-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain gradient boosting in a few sentences.</summary><div class="qa-body">Start with a constant prediction that minimises the loss, such as the mean or the log-odds. Each round, compute for every row the negative gradient of the loss with respect to its current prediction (the pseudo-residual), and fit a small regression tree to those values. Set each leaf to the value that best reduces the real loss for its rows, shrink it by the learning rate, and add the tree to the model. Repeat until the validation loss stops improving.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is it called "gradient" boosting? Show it for squared error.</summary><div class="qa-body">It is gradient descent where the parameters are the model's predictions F(xᵢ). For L = ½(y − F)², ∂L/∂F = −(y − F), so the negative gradient is the residual y − F. Fitting a tree to the residuals is fitting a tree to the steepest-descent direction, and the tree generalises that step to new rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a residual and a pseudo-residual?</summary><div class="qa-body">A residual is the plain gap y − F. A pseudo-residual is the negative gradient of the chosen loss at the current prediction. They are equal for squared error; for absolute error the pseudo-residual is sign(y − F), for Huber it is the residual capped at ±δ, and for log-loss it is y − p.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the pseudo-residuals and the starting value for binary log-loss?</summary><div class="qa-body">With p = σ(F), ∂L/∂F = p − y, so the pseudo-residuals are y − p. The starting value is the log-odds of the base rate, F₀ = ln(ȳ/(1 − ȳ)). On the diary, 9 of 14 days were played, so F₀ = ln(9/5) = 0.588 and every day starts at p = 0.643.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do leaf values need a separate line search? Give the log-loss formula.</summary><div class="qa-body">The tree is fitted by least squares, so its leaves hold mean pseudo-residuals, which are the right step only for squared error. For other losses each leaf value is re-chosen to minimise the actual loss of its rows. Log-loss has no closed form, so one Newton step is used: γ = Σ(y − p)/Σp(1 − p). On the diary's overcast leaf that is +1.556 instead of the mean +0.357.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does gradient boosting use gradient descent to train each tree?</summary><div class="qa-body">No. Each tree is grown by ordinary greedy least-squares splitting. The gradient is taken with respect to the model's predictions, not the tree's parameters, and it only provides the targets each tree is fitted to.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are regression trees used even for classification?</summary><div class="qa-body">Because the trees predict pseudo-residuals such as y − p, which are real numbers, and the model's output F is a log-odds score, not a class. The probability comes from applying the sigmoid (or softmax for several classes) to the summed scores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which loss would you use for house prices with some typo outliers? For a delivery-time promise?</summary><div class="qa-body">For prices with outliers, absolute or Huber loss, which cap each row's pull; on the typo example the test MAE was 1.98 with absolute error against 19.80 with squared error. For a delivery-time promise where late is worse than early, quantile loss at a high α such as 0.9, to predict a time you will beat 90% of the time, checking its coverage on held-out data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the learning rate do, and how does it interact with the number of trees?</summary><div class="qa-body">It scales each tree's contribution. Smaller steps bake in less of each tree's noise and usually reach a slightly better optimum, but need proportionally more trees (halving ν roughly doubles them). In practice fix ν around 0.05–0.1 and let early stopping choose the number of trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a sum of stumps learn y = x₁·x₂?</summary><div class="qa-body">A sum of stumps is additive, f₁(x₁) + f₂(x₂). For x₁·x₂ with symmetric inputs, each feature alone has zero average effect, so no single-feature split reduces the error and R² stays near 0. A depth-d tree can model interactions of up to d features, and depth 2 already captures most of it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A random forest does not overfit with more trees. Why does gradient boosting?</summary><div class="qa-body">A forest averages nearly independent trees, so adding one barely moves the average. Boosting adds trees that each fit the current remaining error; once that error is mostly noise, new trees fit noise. Training loss keeps falling while validation loss turns up, hence early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stochastic gradient boosting and why does it help?</summary><div class="qa-body">Each tree is fitted on a random subsample of the rows (without replacement), for example 50%. The trees become less correlated, which reduces variance as in bagging, and each fit is faster. Column subsampling (max_features) adds more diversity. On churn, half the rows gave a slightly better validation loss in about half the time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does early stopping work in sklearn's gradient boosting?</summary><div class="qa-body">A fraction of the training data (validation_fraction) is held out; after each tree the loss on it is computed, and training stops when it has not improved by at least tol for n_iter_no_change trees. The fitted model keeps the trees up to that point (n_estimators_ or n_iter_). It must use validation data, never the test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does gradient boosting handle multiclass problems?</summary><div class="qa-body">With softmax log-loss, each round fits K regression trees, one per class, on pseudo-residuals 1[y = k] − p_k, each with its own Newton leaf values. Predictions are the softmax of the K summed scores, so M rounds produce M·K trees (sklearn's estimators_ has shape (M, K)).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GradientBoostingClassifier or HistGradientBoostingClassifier?</summary><div class="qa-body">HistGradientBoosting for almost everything above a few thousand rows: binning each feature into at most 255 bins makes it much faster with nearly the same accuracy, and it handles missing values and categorical features natively, with early stopping on by default for large data. The classic estimator is fine for small data, exact splits, or its extras such as subsample with oob_improvement_.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does AdaBoost fit into gradient boosting?</summary><div class="qa-body">AdaBoost is forward stagewise additive modelling with the exponential loss. Gradient boosting with loss="exponential" has pseudo-residuals ỹ·e^(−ỹF), which are AdaBoost's row weights times the label, so it behaves like AdaBoost. Gradient boosting generalises the idea to any differentiable loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does XGBoost change in this algorithm?</summary><div class="qa-body">It uses a second-order Taylor expansion of the loss for every split, not only for the leaf values: split gain and leaf weight w* = −G/(H + λ) come from sums of gradients G and second derivatives H. It adds penalties on the number of leaves and the leaf weights, histogram split finding, built-in missing-value handling, column subsampling and parallel split search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can gradient boosting extrapolate a trend?</summary><div class="qa-body">No. Each tree is piecewise constant, so the sum is too, and beyond the training range of a feature the prediction stays flat: trained on 36 months of rising sales it predicted the same 280 for every future month. Model the trend separately (differences, ratios, or a linear model underneath) or use features that stay within the training range.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are AdaBoost's row weights, gradient boosting's pseudo-residuals and XGBoost's g and h related?</summary><div class="qa-body">All three tell the next tree what the current model gets wrong, derived from the loss. AdaBoost expresses the exponential loss as row weights e^(−yF). Gradient boosting uses the first derivative of any loss as each tree's target, plus a Newton step in the leaves. XGBoost uses first and second derivatives g and h for every row, both for the leaf values and for choosing the splits.</div></details>
</main>
`
});
