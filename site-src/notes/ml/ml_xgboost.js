// notes/ml/ml_xgboost.js — XGBoost
Object.assign(TOPIC_CONTENT, {
  "ml_xgboost": `<main>
  <h1>XGBoost</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>XGBoost</span></div>
  <p class="lead">XGBoost ("eXtreme Gradient Boosting", Tianqi Chen and Carlos Guestrin, 2016) is gradient boosting rebuilt with sharper maths and much better engineering, and for years it was the model that won most competitions on table data. It keeps the loop you met in <a class="xref" data-note="ml_gbm">Gradient Boosting</a>, where each new small tree corrects the mistakes of the trees before it, but it changes how each tree is built: it uses both the slope and the curvature of the loss, it puts a price on complicated trees inside the tree-building itself, it learns where missing values should go, and it finds splits quickly on millions of rows. Those ideas give two short formulas, the best value for a leaf and the quality of a split, and almost everything else in XGBoost follows from them. Our running example is the same one used across the tree notes: the college cricket captain's 14-day diary, where we predict whether a match was played from the humidity reading. Fourteen rows are small enough to compute every number by hand and check it against the library; a 20,000-row customer churn table then shows the same ideas at a realistic size.</p>

  <h2 id="xgb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">XGBoost</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Same loop as gradient boosting: F ← F + η · tree</li>
          <li>Each row gets a slope g and a curvature h of the loss</li>
          <li>Log loss: g = p − y, h = p(1 − p)</li>
          <li>Any loss works if you can supply g and h</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two formulas</div>
        <ul>
          <li>Leaf value: w* = −G / (H + λ)</li>
          <li>Split gain: ½[G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)] − γ</li>
          <li>G, H = sums of g, h over the rows in a leaf</li>
          <li>The library prints the gain without the ½</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Brakes</div>
        <ul>
          <li>λ shrinks leaf values (default 1); α can zero them</li>
          <li>γ: minimum gain to keep a split (prunes after growing)</li>
          <li>min_child_weight: minimum Σh in a child, not a row count</li>
          <li>η, subsample, colsample, early stopping</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Engineering</div>
        <ul>
          <li>hist (default): ≤ 256 bins per column, g/h histograms</li>
          <li>Missing values: learned default direction per split</li>
          <li>Parallel inside a tree, never across trees</li>
          <li>Save as JSON; early stopping picks the number of trees</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="xgb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What XGBoost Adds</span><span class="rm-sub">what plain gradient boosting lacked, and the diary</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-obj"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Regularised Objective</span><span class="rm-sub">fit the data, but pay for every leaf</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-taylor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Gradients and Hessians</span><span class="rm-sub">turning any loss into g and h</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-gain"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Leaf Values and the Split Gain</span><span class="rm-sub">the two formulas at the heart of XGBoost</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-hand"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Three Rounds by Hand</span><span class="rm-sub">the diary, checked against the library</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-reg"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Brakes: λ, α, γ, min_child_weight</span><span class="rm-sub">what each penalty does to a tree</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-scratch"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">XGBoost From Scratch</span><span class="rm-sub">a short class that matches the library</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-split"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Finding Splits Fast</span><span class="rm-sub">exact, quantile sketch, histograms, the system</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-missing"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">a learned default direction</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-es"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Shrinkage, Sampling and Early Stopping</span><span class="rm-sub">brakes on the whole team of trees</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-api"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Using XGBoost in Practice</span><span class="rm-sub">key parameters, imbalance, two APIs</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-cmp"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">XGBoost and Its Family</span><span class="rm-sub">gradient boosting, LightGBM, CatBoost, forests</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">column order, extrapolation, misread numbers</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, knobs, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about XGBoost</span></div></div>
    </div>
  </div>

  <h2 id="xgb-why"><span class="num">01</span>What XGBoost Adds</h2>
  <p>Recall how gradient boosting works. It starts with one constant guess for every row, then repeatedly fits a small tree to the current errors (more precisely, to the negative gradient of the loss, which for squared error is just the residual) and adds a shrunk copy of that tree to the model. After a few hundred rounds the sum of all those small trees is a strong model. The loop is simple and works for any loss, and <a class="xref" data-note="ml_gbm">Gradient Boosting</a> built it step by step.</p>
  <p>Now picture a telecom company with 20 million customers and 300 columns each, many of them empty (a customer who never called support has no "last call date"), that must retrain a churn model every night. Classic gradient boosting struggles here in four ways. Each tree is grown using only the slope of the loss, so it ignores how sharply the loss curves, which matters for log loss where some rows are already confidently right. There is no penalty inside the tree, so the only protection against overfitting is "small trees, a small learning rate, and not too many of them". Every possible cut-off of every column is tried at every node, which is slow on millions of rows. And empty cells must be filled in by hand before training.</p>
  <p>XGBoost answers each of these. It writes down a single quantity to minimise, the loss plus a price for complex trees, called the <strong>regularised objective</strong>. It approximates the loss around the current prediction using both the first derivative (slope) and the second derivative (curvature), which turns every loss into the same simple problem and gives exact formulas for leaf values and split quality. It finds splits on a few hundred well-chosen cut-offs instead of every value. It learns, at every split, which side rows with a missing value should go. And it is engineered to run in parallel, on disk, on a GPU or on a cluster. It is still gradient boosting: the model is a sum of ordinary binary regression trees, ŷ = f<sub>1</sub>(x) + f<sub>2</sub>(x) + …, trained one tree at a time.</p>
  <p>Think of a cricket coach correcting a batsman. A coach working like plain gradient boosting only knows <em>which way</em> the player is wrong ("you are late on the shot") and always corrects by the same amount. XGBoost's coach also knows <em>how sensitive</em> the player is to correction, which is the curvature: a player who over-reacts gets a gentle hint and a stubborn one gets a firm push. This coach also has a rule: no special instruction for a situation seen only twice. That rule is the penalty.</p>
  <p>The running example is the captain's diary of 14 days. We use two of its columns: the humidity reading <strong>HumPct</strong> and whether the match was played (<strong>Play</strong>, 1 = yes). With one numeric feature every split search is small enough to do on paper.</p>
  <table class="tbl">
    <tr><th>day</th><td>D1</td><td>D2</td><td>D3</td><td>D4</td><td>D5</td><td>D6</td><td>D7</td><td>D8</td><td>D9</td><td>D10</td><td>D11</td><td>D12</td><td>D13</td><td>D14</td></tr>
    <tr><th>HumPct</th><td>85</td><td>90</td><td>86</td><td>96</td><td>80</td><td>70</td><td>65</td><td>95</td><td>70</td><td>80</td><td>70</td><td>90</td><td>75</td><td>91</td></tr>
    <tr><th>Play</th><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td></tr>
  </table>
  <p>Humid days are mostly not played and dry days mostly are, with exceptions: D6 at 70% was not played, D4 at 96% was. Nine days were played and five were not. The code blocks load the diary from <code>play.py</code>, which holds it as a pandas DataFrame called <code>df</code> (the same file the <a class="xref" data-note="ml_dtree">Decision Trees</a> note builds). The bigger examples use <code>churn.py</code>, the shared churn table of the tree notes: 20,000 customers, 12 columns f0–f11 from <code>make_classification</code> plus two pure-noise columns, split into 12,000 training, 3,000 validation and 5,000 test rows (its code is in <a class="xref" data-note="ml_bagging">Bagging</a>).</p>

  <h2 id="xgb-obj"><span class="num">02</span>The Regularised Objective</h2>
  <p>To put a price on a tree we first need to describe a tree with numbers. Any regression tree does two things to a row x: it sends x down to one leaf, and it outputs that leaf's number. Write the first step as q(x), "which leaf does x land in", a whole number from 1 to T where T is the number of leaves, and the leaf numbers as a list w = (w<sub>1</sub>, …, w<sub>T</sub>), called the <strong>leaf weights</strong>. Then the whole tree is just f(x) = w<sub>q(x)</sub>. For example, the first XGBoost tree on the diary will be "HumPct &lt; 82.5? leaf 1 : leaf 2" with w = (0.27, −0.05): D5 (80%) lands in leaf 1 and gets 0.27, D8 (95%) lands in leaf 2 and gets −0.05. The structure q says how rows are grouped; the weights w say what each group predicts. XGBoost will find w with a formula and q with a greedy search.</p>
  <p>With that notation, the quantity XGBoost minimises after building its trees is</p>
  <p style="text-align:center"><strong>Obj = Σ<sub>i</sub> loss(y<sub>i</sub>, ŷ<sub>i</sub>) + Σ<sub>trees</sub> [ γ·T + ½·λ·Σ<sub>j</sub> w<sub>j</sub>² + α·Σ<sub>j</sub> |w<sub>j</sub>| ]</strong></p>
  <p>Read it piece by piece. The first sum is the ordinary training loss, log loss for yes/no problems or squared error for numbers: it rewards fitting the data. The rest is the price of the trees. γ (gamma) is charged once per leaf, so a split is only worth making if it lowers the loss by more than γ. ½λΣw² (lambda) makes large leaf values expensive; it is the same idea as <a class="xref" data-note="ml_ridge_lasso">ridge regression</a>, applied to leaf values instead of coefficients. αΣ|w| (alpha) is the lasso version, which can push small leaf values to exactly zero. In the library these are <code>gamma</code> (default 0), <code>lambda</code> or <code>reg_lambda</code> (default 1) and <code>alpha</code> or <code>reg_alpha</code> (default 0). Note that λ = 1 is switched on by default.</p>
  <p>It is easiest to see what the penalty does on a case where we can compute everything. Take the diary's Turnout column (how many club members came each evening) as a regression target with squared-error loss ½(y − ŷ)². After the starting guess, the mean turnout of 34, the next tree must fit the 14 residuals. Try the split "Overcast?" (4 overcast days, whose residuals sum to +28, against 10 others summing to −28), with λ = 1 and γ = 1, and compare three ways of filling the leaves:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
r = df.Turnout.values - df.Turnout.mean()        # residuals after the start value (mean 34)
over = (df.Outlook == "Overcast").values          # the split "Overcast?"
lam, gam = 1.0, 1.0
def obj(w_over, w_rest, leaves):
    pred = np.where(over, w_over, w_rest) if leaves == 2 else np.full(14, w_over)
    loss = 0.5 * np.sum((r - pred) ** 2)
    pen = gam * leaves + 0.5 * lam * (w_over ** 2 + (w_rest ** 2 if leaves == 2 else 0))
    return loss, pen, loss + pen
G_o, n_o, G_r, n_r = r[over].sum(), over.sum(), r[~over].sum(), (~over).sum()
for name, args in [("1 leaf", (0.0, 0.0, 1)),
                   ("2 leaves, plain means", (G_o / n_o, G_r / n_r, 2)),
                   ("2 leaves, sum/(n+lambda)", (G_o / (n_o + lam), G_r / (n_r + lam), 2))]:
    loss, pen, tot = obj(*args)
    print(f"{name:25s} w = ({args[0]:+.3f}, {args[1]:+.3f})  loss {loss:6.2f}  penalty {pen:5.2f}  Obj {tot:6.2f}")</div>
  <div class="fx" data-lang="text">1 leaf                    w = (+0.000, +0.000)  loss 640.00  penalty  1.00  Obj 641.00
2 leaves, plain means     w = (+7.000, -2.800)  loss 502.80  penalty 30.42  Obj 533.22
2 leaves, sum/(n+lambda)  w = (+5.600, -2.545)  loss 507.04  penalty 20.92  Obj 527.96</div>
  <p>One leaf predicting 0 leaves the full loss of 640. Splitting and using the plain mean residual in each leaf (28/4 = 7 and −28/10 = −2.8) fits best, loss 502.80, but those large values cost 30.42 in penalty, for an objective of 533.22. Shrinking each leaf to "sum / (count + λ)", which is 28/5 = 5.6 and −28/11 = −2.545, fits slightly worse (507.04) but pays much less penalty (20.92), so its total, 527.96, is the lowest. Notice which leaf was shrunk most: the 4-day overcast leaf went from 7 to 5.6, while the 10-day leaf barely moved. The penalty trusts small groups less. Section 04 shows that "sum / (count + λ)" is not a lucky guess but the exact optimum, and that the same formula works for every loss.</p>

  <h2 id="xgb-taylor"><span class="num">03</span>Gradients and Hessians</h2>
  <p>For squared error, finding the best leaf values was easy. For log loss, which is what we need for Play / No play, it is not: the prediction is a probability p = sigmoid(F), where F is the raw score (the log-odds) that the trees add up, and p sits inside a logarithm. There is no neat formula for the best leaf. XGBoost's trick is to replace the true loss, near the current prediction, by a simpler curve that is easy to minimise.</p>
  <p>When we add a new tree, each row's score moves from its current value F by a small step f. Close to F, any smooth curve looks like a parabola. So XGBoost replaces the loss by the parabola that touches it at F with the same height, the same slope and the same bend. This is a second-order <strong>Taylor approximation</strong>: loss(y, F + f) ≈ loss(y, F) + g·f + ½·h·f², where <strong>g</strong> is the first derivative of the loss with respect to F (the <strong>gradient</strong>, which way and how steeply the loss goes) and <strong>h</strong> is the second derivative (the <strong>Hessian</strong>, how sharply it bends). Think of walking down a valley in fog: the slope tells you which way is downhill, and the curvature tells you whether the floor is near (sharp bend, take a small step) or far (flat, take a big step). Plain gradient boosting uses only the slope; using both is Newton's method (<a class="xref" data-note="m_optimization">Optimization</a> covers it, and <a class="xref" data-note="m_calculus">Calculus</a> covers Taylor series).</p>
  <p>For squared error, loss = ½(y − F)², the slope is g = F − y (prediction minus truth) and the curvature is h = 1 for every row, so −g is just the residual. For log loss, loss = −[y·ln p + (1 − y)·ln(1 − p)] with p = 1/(1 + e<sup>−F</sup>), the chain rule and the handy fact that dp/dF = p(1 − p) give a remarkably simple pair: <strong>g = p − y</strong> and <strong>h = p(1 − p)</strong>. A row with true label 1 and current p = 0.5 has g = −0.5 (push the score up) and h = 0.25, the largest curvature possible. A row with y = 1 already at p = 0.9 has g = −0.1 and h = 0.09: a gentle push. A row with y = 0 wrongly at p = 0.99 has g = +0.99 but h only 0.0099; its Newton step −g/h = −100 would be enormous, because the loss is nearly a straight line there and the parabola thinks the bottom is far away. That is one reason XGBoost adds λ to h, as we will see. The code checks the two formulas against slopes measured numerically and shows how close the parabola is:</p>
  <div class="fx" data-lang="py">import numpy as np
def logloss(y, F):                     # F = raw score (log-odds); p = sigmoid(F)
    p = 1 / (1 + np.exp(-F))
    return -(y * np.log(p) + (1 - y) * np.log(1 - p))
y, F, e = 1, 0.4, 1e-4
p = 1 / (1 + np.exp(-F))
g_num = (logloss(y, F + e) - logloss(y, F - e)) / (2 * e)                   # slope, measured
h_num = (logloss(y, F + e) - 2 * logloss(y, F) + logloss(y, F - e)) / e**2   # curvature, measured
print(f"p = {p:.4f}")
print(f"g: formula p - y   = {p - y:.4f}   measured {g_num:.4f}")
print(f"h: formula p(1-p)  = {p * (1 - p):.4f}   measured {h_num:.4f}")
for f in [0.1, 0.5, 2.0]:              # how good is the parabola for a step f?
    exact = logloss(y, F + f)
    approx = logloss(y, F) + (p - y) * f + 0.5 * p * (1 - p) * f**2
    print(f"step {f}:  true loss {exact:.4f}   parabola {approx:.4f}")</div>
  <div class="fx" data-lang="text">p = 0.5987
g: formula p - y   = -0.4013   measured -0.4013
h: formula p(1-p)  = 0.2403   measured 0.2403
step 0.1:  true loss 0.4741   parabola 0.4741
step 0.5:  true loss 0.3412   parabola 0.3424
step 2.0:  true loss 0.0868   parabola 0.1909</div>
  <p>The formulas match the measured derivatives to four decimals. The parabola is essentially exact for a step of 0.1, close for 0.5 (0.3424 against 0.3412) and clearly off for 2.0 (0.1909 against 0.0868). That is acceptable, because each tree is shrunk by the learning rate and moves scores only a little, and g and h are recomputed at the new point before the next tree.</p>
  <p>Now comes the payoff. The term loss(y, F) does not depend on the new tree, so drop it. What the new tree must minimise is Σ<sub>i</sub> [g<sub>i</sub>·f(x<sub>i</sub>) + ½·h<sub>i</sub>·f(x<sub>i</sub>)²] plus the penalty. The loss function itself has disappeared; only the numbers g<sub>i</sub> and h<sub>i</sub> remain. That is why one tree-building routine handles regression, classification, ranking, Poisson counts or a custom loss of your own: you only supply g and h for each row. A custom loss needs h &gt; 0, though. Absolute error has h = 0 almost everywhere, which is why XGBoost treats it specially and why the smooth pseudo-Huber loss is often used instead.</p>

  <h2 id="xgb-gain"><span class="num">04</span>Leaf Values and the Split Gain</h2>
  <p>Suppose the shape of the tree is fixed, so we know which rows land in which leaf. What number should each leaf hold? Every row in leaf j gets the same output w<sub>j</sub>, so we can group the sum by leaf. Write <strong>G<sub>j</sub></strong> for the sum of g over the rows in leaf j and <strong>H<sub>j</sub></strong> for the sum of h. The objective becomes Σ<sub>j</sub> [G<sub>j</sub>·w<sub>j</sub> + ½(H<sub>j</sub> + λ)·w<sub>j</sub>²] + γT. Each leaf is now its own little parabola in w<sub>j</sub>, and the bottom of a parabola is where its slope is zero: G<sub>j</sub> + (H<sub>j</sub> + λ)w<sub>j</sub> = 0. So</p>
  <p style="text-align:center"><strong>w<sub>j</sub>* = −G<sub>j</sub> / (H<sub>j</sub> + λ)</strong></p>
  <p>This is the <strong>optimal leaf weight</strong>, the first of XGBoost's two formulas. For squared error h = 1, so H is the number of rows n and −G is the sum of residuals, giving w* = (sum of residuals)/(n + λ): exactly the "sum / (count + λ)" that won in section 02. With λ = 0 it is the plain mean; with λ &gt; 0 it is the mean pulled towards 0, and pulled hardest when the leaf is small. A good way to remember λ is "add λ imaginary rows with residual 0 to every leaf". A leaf of 2 rows with residuals 4 and 6 has mean 5, but with λ = 10 it predicts 10/12 = 0.83; a leaf of 200 rows with mean residual 5 still predicts 1000/210 = 4.76. A pattern seen in two customers is not trusted; one seen in two hundred is. With the L1 penalty α, the leaf's total pull is reduced by α first, w* = −sign(G)·max(|G| − α, 0)/(H + λ), so a leaf whose |G| is below α outputs exactly 0.</p>
  <p>Putting w* back into the parabola gives the best objective that shape can reach, −½·Σ<sub>j</sub> G<sub>j</sub>²/(H<sub>j</sub> + λ) + γT, called the <strong>structure score</strong>. Lower is better. It plays the role that Gini impurity or entropy play in a single <a class="xref" data-note="ml_dtree">decision tree</a>, but it comes from your actual loss and already includes the penalties. The term G²/(H + λ) is large when the rows in a leaf agree on the direction they want to move (big |G|); a leaf where half want "up" and half want "down" has G ≈ 0 and scores nothing.</p>
  <p>There are far too many possible tree shapes to score them all, so XGBoost grows each tree greedily, one split at a time, exactly like a decision tree. For that it needs to know how much one split improves the structure score. Take a leaf with totals G and H, and a candidate split that sends its rows into a left part (G<sub>L</sub>, H<sub>L</sub>) and a right part (G<sub>R</sub>, H<sub>R</sub>). Before the split this leaf contributes −½G²/(H + λ) + γ; after it, the two children contribute −½G<sub>L</sub>²/(H<sub>L</sub> + λ) − ½G<sub>R</sub>²/(H<sub>R</sub> + λ) + 2γ. The improvement is</p>
  <p style="text-align:center"><strong>Gain = ½ [ G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ) ] − γ</strong></p>
  <p>In words: the score of the left child plus the score of the right child minus the score of the parent, minus the price of one extra leaf. A split is made only if the gain is positive, and among all candidates (every column, every cut-off) the largest gain wins. This <strong>split gain</strong> is the second formula. A split that separates rows pushing "up" from rows pushing "down" gains a lot; a split that leaves both sides mixed gains almost nothing. With λ &gt; 0 the bracket can even be negative for a weak split that peels off a few rows, so λ filters weak splits as well as shrinking leaves.</p>
  <p>Compare this with what came before. A CART tree chooses splits by variance reduction and then puts the mean in each leaf; classic gradient boosting in scikit-learn chooses splits with a squared-error criterion on g alone and only uses h afterwards for the leaf values. In XGBoost the split choice and the leaf values come from the <em>same</em> objective, both use h, and both include the penalties. One practical detail trips everyone up: the library's code drops the ½. The gain printed by the library, and the number compared with <code>gamma</code>, is G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ), twice the bracket. Also, the leaf values the library stores and prints are η·w*, the learning rate times the optimal weight.</p>

  <h2 id="xgb-hand"><span class="num">05</span>Three Rounds by Hand</h2>
  <p>Formulas are only convincing when the numbers come out right, so let us build XGBoost's first trees on the diary by hand and then ask the library for the same trees. The settings are log loss, a starting probability of 0.5 (<code>base_score=0.5</code>, so the starting log-odds F is 0 for every day), λ = 1, γ = 0, learning rate η = 0.3, trees with a single split (<code>max_depth=1</code>), <code>min_child_weight=0</code> so that any split is allowed, and <code>tree_method="exact"</code> so every cut-off is tried.</p>
  <p>Step one is g and h for every day. Every p is 0.5, so g = 0.5 − y is −0.5 for the 9 played days and +0.5 for the 5 others, and h = 0.25 for all. The totals are G = 9 × (−0.5) + 5 × 0.5 = −2.0 and H = 14 × 0.25 = 3.5, so the parent's score is G²/(H + λ) = 4/4.5 = 0.889. Step two is the gain of every cut-off. Sorted by humidity the days are 65, 70, 70, 70, 75, 80, 80, 85, 86, 90, 90, 91, 95, 96, ten distinct values and so nine possible cuts. For each cut, add up g and h on each side:</p>
  <table class="tbl">
    <tr><th>Cut</th><th>Days left</th><th>G<sub>L</sub>, H<sub>L</sub></th><th>G<sub>L</sub>²/(H<sub>L</sub>+1)</th><th>G<sub>R</sub>, H<sub>R</sub></th><th>G<sub>R</sub>²/(H<sub>R</sub>+1)</th><th>Gain = ½(sum − 0.889)</th></tr>
    <tr><td>67.5</td><td>1</td><td>−0.5, 0.25</td><td>0.200</td><td>−1.5, 3.25</td><td>0.529</td><td>−0.080</td></tr>
    <tr><td>72.5</td><td>4</td><td>−1.0, 1.00</td><td>0.500</td><td>−1.0, 2.50</td><td>0.286</td><td>−0.052</td></tr>
    <tr><td>77.5</td><td>5</td><td>−1.5, 1.25</td><td>1.000</td><td>−0.5, 2.25</td><td>0.077</td><td>0.094</td></tr>
    <tr><td><strong>82.5</strong></td><td>7</td><td>−2.5, 1.75</td><td>2.273</td><td>+0.5, 1.75</td><td>0.091</td><td><strong>0.737</strong></td></tr>
    <tr><td>85.5</td><td>8</td><td>−2.0, 2.00</td><td>1.333</td><td>0.0, 1.50</td><td>0.000</td><td>0.222</td></tr>
    <tr><td>88</td><td>9</td><td>−2.5, 2.25</td><td>1.923</td><td>+0.5, 1.25</td><td>0.111</td><td>0.573</td></tr>
    <tr><td>90.5</td><td>11</td><td>−2.5, 2.75</td><td>1.667</td><td>+0.5, 0.75</td><td>0.143</td><td>0.460</td></tr>
    <tr><td>93</td><td>12</td><td>−2.0, 3.00</td><td>1.000</td><td>0.0, 0.50</td><td>0.000</td><td>0.056</td></tr>
    <tr><td>95.5</td><td>13</td><td>−1.5, 3.25</td><td>0.529</td><td>−0.5, 0.25</td><td>0.200</td><td>−0.080</td></tr>
  </table>
  <p>The best cut is <strong>HumPct &lt; 82.5</strong> with gain 0.737. On the left are the 7 dry days, 6 of them played; on the right the 7 humid days, only 3 played. Three cuts have negative gain: they peel off one to four days, and with λ = 1 the penalty on those small leaves outweighs what they explain. Step three is the leaf values: left w* = 2.5/(1.75 + 1) = 0.909, stored as 0.3 × 0.909 = 0.2727; right w* = −0.5/2.75 = −0.182, stored as −0.0545. Step four updates every day's score and recomputes g and h. The dry days now have F = 0.2727, so p = sigmoid(0.2727) = 0.568, g = 0.568 − 1 = −0.432 for the played ones and h = 0.568 × 0.432 = 0.245. The same cut is best again, with left G = 6(−0.432) + 0.568 = −2.025, H = 7 × 0.245 = 1.718, so the new left leaf is 0.3 × 2.025/2.718 = 0.2236. Now the library, three rounds, with each tree printed with its statistics, followed by the probability of play for three days after each round:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from play import df
hum = df.HumPct.values.reshape(-1, 1).astype(float)   # one feature: humidity in %
play = (df.Play == "Yes").astype(int).values
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
d = xgb.DMatrix(hum, label=play)
bst = xgb.train(params, d, num_boost_round=3)
for i, t in enumerate(bst.get_dump(with_stats=True)):
    print(f"tree {i + 1}:", " ".join(t.split()))
rows = [4, 5, 7]                                      # D5 (80%, played), D6 (70%, not), D8 (95%, not)
for r in [1, 2, 3]:
    F = bst.predict(d, output_margin=True, iteration_range=(0, r))
    print(f"after {r} tree(s): p(play) for D5, D6, D8 = {np.round(1 / (1 + np.exp(-F[rows])), 4)}")</div>
  <div class="fx" data-lang="text">tree 1: 0:[f0&lt;82.5] yes=1,no=2,missing=1,gain=1.47474742,cover=3.5 1:leaf=0.272727281,cover=1.75 2:leaf=-0.0545454584,cover=1.75
tree 2: 0:[f0&lt;82.5] yes=1,no=2,missing=1,gain=0.980946064,cover=3.46655679 1:leaf=0.223594904,cover=1.71785784 2:leaf=-0.0441557281,cover=1.74869895
tree 3: 0:[f0&lt;82.5] yes=1,no=2,missing=1,gain=0.668753266,cover=3.39224815 1:leaf=0.18690747,cover=1.64650321 2:leaf=-0.0357731394,cover=1.74574482
after 1 tree(s): p(play) for D5, D6, D8 = [0.5678 0.5678 0.4864]
after 2 tree(s): p(play) for D5, D6, D8 = [0.6216 0.6216 0.4753]
after 3 tree(s): p(play) for D5, D6, D8 = [0.6645 0.6645 0.4664]</div>
  <p>Every number matches. The split is <code>f0&lt;82.5</code> (f0 is the humidity column) and the first tree's leaves are 0.2727 and −0.0545. <code>cover</code> is H: 1.75 on each side, 7 days × 0.25. The printed <code>gain=1.4747</code> is exactly 2 × 0.737, the library's gain without the ½. Tree 2's left leaf is 0.2236, as computed by hand, and its cover has dropped to 1.718 because the days are no longer at p = 0.5. Each tree is a smaller correction than the one before (gains 1.47, 0.98, 0.67), because the days are already partly right.</p>
  <p>D5 (80%, played) rises 0.50 → 0.57 → 0.62 → 0.66 and D8 (95%, not played) falls 0.50 → 0.49 → 0.48 → 0.47. D6 (70%, not played) sits on the dry side and keeps getting the same rising probability as D5: with one feature and one-split trees nothing can separate it, and a one-day leaf would be shrunk heavily by λ anyway. That is the regularisation at work, treating one odd day as noise. (What really separates D6 is its strong wind, a different column.) The whole algorithm is now visible: compute g and h, sum them per candidate child, score with G²/(H + λ), pick the best cut, set the leaves to η·(−G/(H + λ)), update every score, repeat. Everything else in XGBoost is about doing this faster or more safely.</p>

  <h2 id="xgb-reg"><span class="num">06</span>The Brakes: λ, α, γ, min_child_weight</h2>
  <p>A boosted model with nothing holding it back will keep carving out smaller and smaller groups until it memorises the training rows. XGBoost has four brakes that act inside each tree, and because we have the formulas, we can predict what each one does to the diary's first tree before running anything. From section 05: left G = −2.5, H = 1.75; right G = +0.5, H = 1.75; library gain 1.4747.</p>
  <table class="tbl">
    <tr><th>Setting</th><th>Hand calculation</th><th>Predicted stored leaves</th></tr>
    <tr><td>λ = 0</td><td>2.5/1.75 = 1.429; −0.5/1.75 = −0.286</td><td>0.429, −0.086</td></tr>
    <tr><td>λ = 10</td><td>2.5/11.75 = 0.213; −0.5/11.75 = −0.043</td><td>0.064, −0.013</td></tr>
    <tr><td>α = 1</td><td>(2.5 − 1)/2.75 = 0.545; right |G| = 0.5 &lt; 1, so exactly 0</td><td>0.164, 0</td></tr>
    <tr><td>γ = 1.4</td><td>gain 1.475 ≥ 1.4, keep the split</td><td>0.273, −0.055</td></tr>
    <tr><td>γ = 1.5</td><td>gain 1.475 &lt; 1.5, remove it; one leaf 2/(3.5 + 1) = 0.444</td><td>single leaf 0.133</td></tr>
    <tr><td>min_child_weight = 2</td><td>each child needs H ≥ 2, i.e. at least 8 days at h = 0.25; 8 + 8 &gt; 14</td><td>single leaf 0.133</td></tr>
  </table>
  <div class="fx" data-lang="py">import xgboost as xgb
from play import df
d = xgb.DMatrix(df.HumPct.values.reshape(-1, 1).astype(float), label=(df.Play == "Yes").astype(int))
base = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
        "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
def show(label, **change):
    t = xgb.train({**base, **change}, d, num_boost_round=1).get_dump()[0]
    print(f"{label:20s}", " ".join(t.split()))
show("default (lambda=1)")
show("lambda=0", **{"lambda": 0})
show("lambda=10", **{"lambda": 10})
show("alpha=1", alpha=1)
show("gamma=1.4", gamma=1.4)
show("gamma=1.5", gamma=1.5)
show("min_child_weight=2", min_child_weight=2)</div>
  <div class="fx" data-lang="text">default (lambda=1)   0:[f0&lt;82.5] yes=1,no=2,missing=1 1:leaf=0.272727281 2:leaf=-0.0545454584
lambda=0             0:[f0&lt;82.5] yes=1,no=2,missing=1 1:leaf=0.428571463 2:leaf=-0.0857142955
lambda=10            0:[f0&lt;82.5] yes=1,no=2,missing=1 1:leaf=0.0638297945 2:leaf=-0.012765958
alpha=1              0:[f0&lt;82.5] yes=1,no=2,missing=1 1:leaf=0.163636371 2:leaf=-0
gamma=1.4            0:[f0&lt;82.5] yes=1,no=2,missing=1 1:leaf=0.272727281 2:leaf=-0.0545454584
gamma=1.5            0:leaf=0.13333334
min_child_weight=2   0:leaf=0.13333334</div>
  <p>All six predictions are right, and each brake works differently. <strong>λ</strong> (L2 on leaf values) shrinks every leaf, the small ones most; with λ = 10 the dry leaf drops from 0.273 to 0.064. <strong>α</strong> (L1) subtracts a fixed amount from each leaf's pull and sets the weak humid leaf to exactly 0, which is why L1 gives sparse, many-zero leaves just as lasso gives zero coefficients. <strong>γ</strong> removes whole splits whose gain is too small, compared on the library's scale: γ = 1.4 keeps a split worth 1.475, γ = 1.5 removes it. <strong>min_child_weight</strong> forbids children whose total Hessian is too small, so here no split is allowed at all.</p>
  <p>Two of these deserve a closer look because they are commonly misunderstood. First, <code>min_child_weight</code> is a minimum on Σh, not a row count. For squared error h = 1, so the two coincide. For log loss h = p(1 − p) ≤ 0.25: with the default <code>min_child_weight=1</code>, a child of undecided rows (p = 0.5) needs 4 rows, a child of rows predicted at 0.9 needs 12, and a child of rows predicted at 0.99 needs 102. So as the model grows confident, it automatically refuses to build leaves for small groups of rows it already predicts well. This is also why <code>cover</code> in the dump is not a row count for classification. Second, γ is applied by pruning after the tree is grown: XGBoost grows to <code>max_depth</code> using every split with positive gain, then walks back up from the leaves and removes any split whose gain is below γ and whose children are both leaves. A weak split high up survives if a strong one sits below it, which matters for patterns like XOR where the first split alone looks useless.</p>
  <p>How much do these knobs matter on realistic data? On the 20,000-row churn table, starting from depth 6 and learning rate 0.1, with early stopping on the validation set picking the number of trees, change one knob at a time:</p>
  <div class="fx" data-lang="py">import xgboost as xgb
from sklearn.metrics import roc_auc_score
from churn import Xtr, ytr, Xva, yva, Xte, yte     # 12,000 / 3,000 / 5,000 customers
base = dict(n_estimators=3000, learning_rate=0.1, max_depth=6, early_stopping_rounds=50,
            eval_metric="logloss", tree_method="hist", random_state=0)
def run(**change):
    m = xgb.XGBClassifier(**{**base, **change}).fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False)
    auc = roc_auc_score(yte, m.predict_proba(Xte)[:, 1])
    print(f"{str(change):26s} trees {m.best_iteration + 1:4d}  train acc {m.score(Xtr, ytr):.3f}  test AUC {auc:.4f}")
for kw in [{}, {"max_depth": 3}, {"max_depth": 10}, {"min_child_weight": 50},
           {"gamma": 5}, {"reg_lambda": 0}, {"reg_lambda": 10}]:
    run(**kw)</div>
  <div class="fx" data-lang="text">{}                         trees  202  train acc 0.956  test AUC 0.9336
{'max_depth': 3}           trees 1023  train acc 0.928  test AUC 0.9264
{'max_depth': 10}          trees  117  train acc 0.994  test AUC 0.9360
{'min_child_weight': 50}   trees  473  train acc 0.924  test AUC 0.9288
{'gamma': 5}               trees   34  train acc 0.872  test AUC 0.9152
{'reg_lambda': 0}          trees  213  train acc 0.967  test AUC 0.9324
{'reg_lambda': 10}         trees  298  train acc 0.952  test AUC 0.9350</div>
  <p>The baseline reaches test AUC 0.9336 with 202 trees. <code>max_depth</code> has the biggest effect: depth 3 needed 1,023 trees and still scored lower (0.926), because the data has interactions that shallow trees capture slowly, while depth 10 fitted the training set almost perfectly (0.994) yet scored best on test (0.936) with only 117 trees. <code>min_child_weight=50</code> smoothed the trees (training accuracy 0.924) and cost a little AUC; this data is not noisy enough to need it. <code>gamma=5</code> is the instructive failure: training stopped after 34 trees at AUC 0.915. As boosting proceeds the remaining gains shrink, and once nearly every candidate split gains less than γ, new trees are pruned to a single leaf, nothing improves and early stopping fires. γ is measured in gain units, and gains grow with the number of rows, so a sensible γ depends on your data size. λ = 0 overfits slightly (train 0.967, test 0.9324) and λ = 10 gives the best AUC here (0.9350) at the cost of more trees. Most differences are in the third decimal, which is typical: depth, the learning rate with early stopping, and good features are where the big wins are.</p>

  <h2 id="xgb-scratch"><span class="num">07</span>XGBoost From Scratch</h2>
  <p>We have checked single formulas on 14 days with one-split trees. The real test of understanding is to write the whole algorithm, with deeper trees, several columns, γ-pruning and many rounds, and get the same predictions as the library. The plan follows <code>tree_method="exact"</code>: start every row at F = 0; each round compute g = p − y and h = p(1 − p); grow a tree by trying every column and every cut-off at each node and scoring it with the gain; prune splits whose gain is below γ; add η times the tree's leaf values to F; repeat.</p>
  <p>The only trick needed for speed is in the split search. Sort the node's rows by one column, and a running sum (<code>cumsum</code>) of g and h then gives G<sub>L</sub> and H<sub>L</sub> for every cut-off at once; the right side is the total minus the left. Read <code>_grow</code> first, because it is section 04 written in code: the leaf value −G/(H + λ), the gain from G²/(H + λ), the <code>min_child_weight</code> test on H, and the γ check.</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from churn import Xtr, ytr, Xte, yte

class TinyXGB:
    """XGBoost's core for binary log loss: exact greedy splits, lambda, gamma, min_child_weight, eta."""
    def __init__(self, n_rounds=20, eta=0.3, max_depth=3, lam=1.0, gamma=0.0, min_child_weight=1.0):
        self.n_rounds, self.eta, self.max_depth = n_rounds, eta, max_depth
        self.lam, self.gamma, self.mcw = lam, gamma, min_child_weight

    def _score(self, G, H):                            # G^2 / (H + lambda)
        return G * G / (H + self.lam)

    def _grow(self, X, g, h, idx, depth):
        G, H = g[idx].sum(), h[idx].sum()
        leaf = {"w": -G / (H + self.lam)}                # best leaf value w* = -G / (H + lambda)
        if depth == self.max_depth:
            return leaf
        best = (1e-6, None)
        for j in range(X.shape[1]):
            order = idx[np.argsort(X[idx, j], kind="stable")]
            xs = X[order, j]
            GL, HL = np.cumsum(g[order])[:-1], np.cumsum(h[order])[:-1]   # left sums for every cut
            GR, HR = G - GL, H - HL
            ok = (xs[1:] != xs[:-1]) &amp; (HL &gt;= self.mcw) &amp; (HR &gt;= self.mcw)
            gain = self._score(GL, HL) + self._score(GR, HR) - self._score(G, H)
            gain[~ok] = -np.inf
            k = int(np.argmax(gain))
            if gain[k] &gt; best[0]:
                best = (gain[k], (j, (xs[k] + xs[k + 1]) / 2))
        if best[1] is None:
            return leaf
        j, thr = best[1]
        L, R = idx[X[idx, j] &lt; thr], idx[X[idx, j] &gt;= thr]
        node = {"gain": best[0], "f": j, "thr": thr, "w": leaf["w"],
                "L": self._grow(X, g, h, L, depth + 1), "R": self._grow(X, g, h, R, depth + 1)}
        if "f" not in node["L"] and "f" not in node["R"] and node["gain"] &lt; self.gamma:
            return leaf                                  # gamma: prune a weak split above two leaves
        return node

    def _predict_tree(self, node, X):
        if "f" not in node:
            return np.full(len(X), node["w"])
        left = X[:, node["f"]] &lt; node["thr"]
        out = np.empty(len(X))
        out[left] = self._predict_tree(node["L"], X[left])
        out[~left] = self._predict_tree(node["R"], X[~left])
        return out

    def fit(self, X, y):
        X = np.asarray(X, float); self.trees = []
        F = np.zeros(len(y))                             # base_score 0.5 = log-odds 0
        for _ in range(self.n_rounds):
            p = 1 / (1 + np.exp(-F))
            g, h = p - y, p * (1 - p)                    # gradient and Hessian of log loss
            tree = self._grow(X, g, h, np.arange(len(y)), 0)
            self.trees.append(tree)
            F += self.eta * self._predict_tree(tree, X)
        return self

    def predict_margin(self, X):
        X = np.asarray(X, float)
        return sum(self.eta * self._predict_tree(t, X) for t in self.trees)

Xs, ys = Xtr.iloc[:600, :6].values, ytr[:600]           # 600 rows, 6 columns
mine = TinyXGB(n_rounds=20, eta=0.3, max_depth=3, lam=1.0, gamma=0.5, min_child_weight=1.0).fit(Xs, ys)
lib = xgb.train({"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 3,
                 "lambda": 1.0, "gamma": 0.5, "min_child_weight": 1.0, "tree_method": "exact"},
                xgb.DMatrix(Xs, label=ys), num_boost_round=20)
Xt = Xte.iloc[:, :6].values
a, b = mine.predict_margin(Xt), lib.predict(xgb.DMatrix(Xt), output_margin=True)
print(f"largest log-odds difference on 5,000 test rows: {np.abs(a - b).max():.1e}")
print("test accuracy  mine:", np.mean((a &gt; 0) == yte), "  xgboost:", np.mean((b &gt; 0) == yte))</div>
  <div class="fx" data-lang="text">largest log-odds difference on 5,000 test rows: 7.8e-07
test accuracy  mine: 0.7016   xgboost: 0.7016</div>
  <p>Twenty rounds of depth-3 trees with γ = 0.5, λ = 1 and <code>min_child_weight=1</code>, on 600 rows and 6 columns: our log-odds and XGBoost's agree to within 0.0000008 on all 5,000 test rows, which is the rounding of 32-bit floats, and the test accuracy is identical. Nothing about XGBoost's core is hidden any more. Three details decide whether a hand-written version matches: the threshold is the midpoint between two neighbouring distinct values with the test "x &lt; threshold"; <code>base_score</code> must be fixed, because recent versions otherwise estimate it from the data; and γ is applied as pruning on the gain without the ½, not as a rule that stops growth. Everything the library adds on top is speed (section 08), missing values (section 09) and sampling (section 10).</p>

  <h2 id="xgb-split"><span class="num">08</span>Finding Splits Fast</h2>
  <p>Our <code>_grow</code> sorts every column at every node. That is fine for 600 rows, and the diary needs only 9 candidate cuts, but a column with millions of distinct values gives millions of candidates at every node of every tree. Most of the training time of any booster goes into this one job, finding the best (column, cut-off) pair, so XGBoost offers three ways to do it, chosen with <code>tree_method</code>.</p>
  <p>The <strong>exact</strong> method is what we just wrote. To avoid re-sorting, XGBoost sorts each column once before training and stores it in compressed column "blocks" with pointers back to the rows, so one pass over the non-missing entries can evaluate every cut for every node at the same depth. It is still a pass over every distinct value, and the whole table must fit in memory.</p>
  <p>The <strong>approximate</strong> method tries only a few hundred candidate cut-offs per column, placed at quantiles, and buckets the rows between them. The interesting question is "quantiles of what?", and the answer comes from a little algebra. Completing the square in each row's term gives g·f + ½h·f² = ½·h·(f − (−g/h))² − g²/(2h), and the last part does not depend on f. So building a tree is the same as a weighted least-squares fit to targets −g/h with <strong>weights h</strong>. A row with tiny h, one the model already predicts confidently, barely affects the objective, so candidates should be spread by h-weight rather than by row count. That is the <strong>weighted quantile sketch</strong>: each row counts h<sub>i</sub>/Σh towards the rank, and candidates are spaced evenly in that rank. On the diary every h is about 0.25, so the effect is invisible; here are eight rows of one column where four rows (values 40–70) are already predicted with confidence:</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([10, 20, 30, 40, 50, 60, 70, 80])                    # one feature, sorted
p = np.array([0.50, 0.45, 0.55, 0.97, 0.98, 0.02, 0.03, 0.50])    # current predicted probability
h = p * (1 - p)                                                    # Hessian = weight of each row
rank_plain = np.arange(1, 9) / 8                                   # every row counts 1/8
rank_w = np.cumsum(h) / h.sum()                                    # every row counts h / sum(h)
print("h         ", np.round(h, 3))
print("plain rank", np.round(rank_plain, 3))
print("h-weighted", np.round(rank_w, 3))
def cuts(rank, k=4):                                               # first x whose rank reaches 1/4, 2/4, 3/4
    return [int(x[np.searchsorted(rank, q - 1e-9)]) for q in np.arange(1, k) / k]
print("plain quartile cuts     :", cuts(rank_plain))
print("h-weighted quartile cuts:", cuts(rank_w))</div>
  <div class="fx" data-lang="text">h          [0.25  0.248 0.248 0.029 0.02  0.02  0.029 0.25 ]
plain rank [0.125 0.25  0.375 0.5   0.625 0.75  0.875 1.   ]
h-weighted [0.229 0.455 0.682 0.709 0.727 0.745 0.771 1.   ]
plain quartile cuts     : [20, 40, 60]
h-weighted quartile cuts: [20, 30, 70]</div>
  <p>Plain quartiles put cut-offs at 20, 40 and 60, so two of the three candidates fall inside the confident block where any split changes the objective very little. The weighted rank jumps by about 0.23 for each uncertain row and by only 0.02–0.03 for each confident one, so the weighted cut-offs are 20, 30 and 70: they are spent among the uncertain rows, where a good split matters. The sketch is also a mergeable summary, so it works when the data is spread over many machines.</p>
  <p>The <strong>histogram</strong> method, <code>tree_method="hist"</code> and the default since version 2.0, goes one step further. Before training, each column is bucketed once into at most <code>max_bin</code> = 256 bins, and every value is stored as its small bin number. To find the best split of a node, XGBoost adds each row's g and h into its bin (one pass over the rows) and then scans the 256 bin edges with running sums. There is no sorting, a bin number fits in one byte so memory drops several times, and a parent's histogram equals the sum of its two children's, so only the smaller child needs building and the larger one comes by subtraction. (<a class="xref" data-note="ml_lightgbm">LightGBM</a>, which made this approach famous, works the subtraction through by hand.) The three methods on the churn data, 100 trees each, single-threaded (timings are approximate):</p>
  <div class="fx" data-lang="py">import time, xgboost as xgb
from sklearn.metrics import roc_auc_score
from churn import Xtr, ytr, Xte, yte
for method, extra in [("exact", {}), ("hist", {}), ("hist", {"max_bin": 16})]:
    t0 = time.time()
    m = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, tree_method=method,
                          random_state=0, **extra).fit(Xtr, ytr)
    auc = roc_auc_score(yte, m.predict_proba(Xte)[:, 1])
    print(f"tree_method={method:5s} {str(extra):16s} test AUC {auc:.4f}   fit {time.time() - t0:.1f}s")</div>
  <div class="fx" data-lang="text">tree_method=exact {}               test AUC 0.9267   fit 2.2s
tree_method=hist  {}               test AUC 0.9293   fit 0.4s
tree_method=hist  {'max_bin': 16}  test AUC 0.9262   fit 0.2s</div>
  <p><code>hist</code> with 256 bins is about five times faster than <code>exact</code> here and just as accurate (0.9293 against 0.9267; the difference is noise, and bucketing even acts as a mild regulariser). Even 16 bins per column keeps almost all the accuracy at ten times the speed. On 12,000 rows the gap is modest; on millions of rows <code>exact</code> becomes impractical while <code>hist</code> grows linearly with the data. Use <code>exact</code> only to reproduce textbook numbers on small data, as this note does.</p>
  <p>The rest of XGBoost's speed comes from systems engineering. Boosting is sequential, because tree t needs the predictions of all earlier trees, so XGBoost never builds trees in parallel; it parallelises <em>inside</em> each tree, with different threads searching different columns or building different parts of the histograms. It prefetches the g and h values it needs into small contiguous buffers so the CPU cache is used well (about a 2× gain on large data in the paper), it can stream compressed blocks from disk when the data does not fit in memory, it builds histograms on a GPU with <code>device="cuda"</code>, and on a cluster (Spark, Dask, Ray) each worker builds histograms on its own rows and the histograms are summed across machines, giving the same trees as single-machine training.</p>

  <h2 id="xgb-missing"><span class="num">09</span>Missing Values</h2>
  <p>Real tables have holes. Suppose the hygrometer broke on two days. Every split on humidity must still send those days somewhere. Most models force you to fill the hole first (imputation), which means choosing a value and keeping that choice consistent between training and serving. XGBoost instead <strong>learns a default direction</strong> at every split: it tries sending all rows with a missing value to the left child, then all to the right child, and keeps whichever gives the larger gain. At prediction time, rows with a missing value simply follow the stored direction. Think of a sorting office that receives letters with no pincode: rather than guessing an address for each, it looks at where such letters were best delivered in the past and sends them all that way.</p>
  <p>The implementation is neat. XGBoost first computes G and H for the whole node, including the missing rows. It then scans only the rows that have a value, in ascending order, accumulating the left sums; the right side is total minus left, so the missing rows automatically land on the right. Then it scans in descending order, accumulating the right sums, so the missing rows land on the left. The better of the two scans wins. Because only non-missing entries are touched, a column that is 95% empty costs one twentieth of the work, which made XGBoost very fast on sparse data such as one-hot or text features.</p>
  <p>Work it on the diary. Add D15 and D16, both with no humidity reading and both not played. Now G = −2.0 + 2 × 0.5 = −1.0 and H = 16 × 0.25 = 4.0, so the parent term is 1/5 = 0.2. At the cut 82.5, on the library's scale: if the missing days go left with the dry days, the left side has G = −1.5, H = 2.25 and the right side G = +0.5, H = 1.75, giving 0.692 + 0.091 − 0.2 = 0.583. If they go right with the humid days, left G = −2.5, H = 1.75 and right G = +1.5, H = 2.25, giving 2.273 + 0.692 − 0.2 = 2.765. Right wins clearly: the two unknown days were not played, like most humid days, and the right leaf becomes 0.3 × (−1.5/3.25) = −0.138.</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from play import df
hum = np.append(df.HumPct.values.astype(float), [np.nan, np.nan]).reshape(-1, 1)   # D15, D16: no reading
play = np.append((df.Play == "Yes").astype(int).values, [0, 0])                       # both: not played
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
bst = xgb.train(params, xgb.DMatrix(hum, label=play), num_boost_round=1)
print(" ".join(bst.get_dump(with_stats=True)[0].split()))
print("a new day with no reading gets log-odds", bst.predict(xgb.DMatrix(np.array([[np.nan]])), output_margin=True))</div>
  <div class="fx" data-lang="text">0:[f0&lt;82.5] yes=1,no=2,missing=2,gain=2.76503491,cover=4 1:leaf=0.272727281,cover=1.75 2:leaf=-0.138461545,cover=2.25
a new day with no reading gets log-odds [-0.13846155]</div>
  <p><code>missing=2</code> means "missing values go to node 2", the right child. The gain 2.765 and the leaf −0.138 match the hand calculation, and a brand-new day with no reading gets −0.138, the no-play side.</p>
  <p>Does native handling beat ordinary imputation? On the churn data, make column f1 go missing for 40% of churners but only 10% of stayers (say churners stop using the app that records it), so that missingness itself carries signal, and compare three approaches:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from sklearn.metrics import roc_auc_score
from churn import Xtr, ytr, Xte, yte
rng = np.random.default_rng(1)
def punch_holes(X, y):                     # f1 goes missing far more often for churners
    X = X.copy()
    X.loc[rng.random(len(X)) &lt; np.where(y == 1, 0.40, 0.10), "f1"] = np.nan
    return X
A, B = punch_holes(Xtr, ytr), punch_holes(Xte, yte)
def score(name, A, B):
    m = xgb.XGBClassifier(n_estimators=200, learning_rate=0.1, max_depth=6, random_state=0).fit(A, ytr)
    print(f"{name:30s} test AUC {roc_auc_score(yte, m.predict_proba(B)[:, 1]):.4f}")
score("NaN left in (native)", A, B)
mean = A["f1"].mean()
score("mean-imputed", A.fillna({"f1": mean}), B.fillna({"f1": mean}))
flag = lambda X: X.assign(f1_missing=X["f1"].isna().astype(int)).fillna({"f1": mean})
score("mean-imputed + missing flag", flag(A), flag(B))</div>
  <div class="fx" data-lang="text">NaN left in (native)           test AUC 0.9394
mean-imputed                   test AUC 0.9379
mean-imputed + missing flag    test AUC 0.9389</div>
  <p>All three land within 0.002 AUC of each other, which is noise at this size. This surprises many people: why does filling with the mean not destroy the "missing means churn" signal? Because a tree can still find it. Every filled-in row now has exactly the same value, the mean, so two cuts just below and just above it isolate those rows. For trees, constant imputation hides missingness only partly; for a linear model it would hide it completely. The real advantages of native handling are practical: no imputation code to keep identical in training and production, no extra column, and a direction chosen directly by the gain. A missing-value flag column remains the right habit for linear models and neural networks.</p>
  <p>One trap comes with this feature. For a SciPy sparse matrix, XGBoost treats every entry that is not stored as missing, and sparse matrices do not store zeros, so a genuine 0 becomes "missing":</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from scipy.sparse import csr_matrix
calls = np.array([0, 0, 0, 0, 3, 4, 5, 6], dtype=float).reshape(-1, 1)   # 0 support calls is a REAL value
churn = np.array([0, 0, 0, 0, 1, 1, 1, 1])
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
for name, data in [("dense numpy ", calls), ("scipy sparse", csr_matrix(calls))]:
    bst = xgb.train(params, xgb.DMatrix(data, label=churn), num_boost_round=1)
    print(name, "-&gt;", " ".join(bst.get_dump()[0].split()))</div>
  <div class="fx" data-lang="text">dense numpy  -&gt; 0:[f0&lt;1.5] yes=1,no=2,missing=1 1:leaf=-0.300000012 2:leaf=0.300000012
scipy sparse -&gt; 0:[f0&lt;12.000001] yes=1,no=2,missing=2 1:leaf=0.300000012 2:leaf=-0.300000012</div>
  <p>With dense input the tree splits at 1.5, between the zero-call and three-call customers. With sparse input it never sees the zeros: it splits "values present (3 to 6) versus missing", and the zero-call customers ride the missing branch. On this training data both trees predict the same, but they mean different things, and if a truly unknown value arrives later the sparse model will treat it like "0 calls". Similarly, if a column had no missing values in training but has them in production, the default direction was never learned from data, so watch missing rates between training and serving.</p>

  <h2 id="xgb-es"><span class="num">10</span>Shrinkage, Sampling and Early Stopping</h2>
  <p>The penalties of section 06 act inside each tree. But a team of well-regularised trees can still overfit as a group, simply because there are too many of them or each one moves the predictions too far. Three older ideas act on the team as a whole, and XGBoost uses all of them.</p>
  <p><strong>Shrinkage</strong>, the learning rate η (<code>eta</code> or <code>learning_rate</code>, default 0.3), multiplies every new tree before it is added: F ← F + η·f. We already saw its effect: the stored leaves were 0.3 × w*. Why not take the full step? Each tree is fitted to the current g and h, which include noise, and a smaller step leaves room for later trees to correct this tree's mistakes, so the final model averages many small, slightly different corrections. It is like seasoning food a pinch at a time and tasting in between. The price is more trees: halve η and you need roughly twice as many, usually for a slightly better result.</p>
  <p><strong>Row subsampling</strong> (<code>subsample</code>) builds each tree on a random fraction of the rows, drawn without replacement; this is Friedman's stochastic gradient boosting, and it makes the trees less alike and each one cheaper. <strong>Column subsampling</strong> was borrowed from <a class="xref" data-note="ml_rf">Random Forest</a>: <code>colsample_bytree</code> picks a random fraction of columns per tree, <code>colsample_bylevel</code> a fraction of those per depth level, and <code>colsample_bynode</code> a fraction per split. They multiply, so 0.8 at all three levels leaves about half the columns for each split. Column sampling also stops one dominant feature from appearing at the top of every tree. Typical values are 0.5 to 0.9 for both kinds of sampling; on a clean dataset with few columns they change little, and they pay off on wide, noisy data.</p>
  <p>The most important brake is choosing how many trees to keep. Training loss falls with every tree forever, so it cannot tell you when to stop; the loss on data the model has not seen falls, flattens and then rises. <strong>Early stopping</strong> evaluates a metric on a validation set after every tree and stops when it has not improved for a set number of rounds, remembering the best round. Here it is in XGBoost's native API, printing every 100 rounds:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from churn import Xtr, ytr, Xva, yva, Xte, yte
dtr, dva = xgb.DMatrix(Xtr, label=ytr), xgb.DMatrix(Xva, label=yva)
params = {"objective": "binary:logistic", "eval_metric": "logloss", "eta": 0.1,
          "max_depth": 6, "subsample": 0.8, "colsample_bytree": 0.8, "seed": 0}
bst = xgb.train(params, dtr, num_boost_round=3000, evals=[(dtr, "train"), (dva, "val")],
                early_stopping_rounds=50, verbose_eval=100)
print("best_iteration:", bst.best_iteration, "  trees built:", bst.num_boosted_rounds())
p = bst.predict(xgb.DMatrix(Xte), iteration_range=(0, bst.best_iteration + 1))
print(f"test accuracy with the best {bst.best_iteration + 1} trees: {np.mean((p &gt; 0.5) == yte):.4f}")</div>
  <div class="fx" data-lang="text">[0]	train-logloss:0.66410	val-logloss:0.66458
[100]	train-logloss:0.25249	val-logloss:0.33777
[200]	train-logloss:0.17366	val-logloss:0.32577
[300]	train-logloss:0.12181	val-logloss:0.32429
[331]	train-logloss:0.11029	val-logloss:0.32576
best_iteration: 281   trees built: 332
test accuracy with the best 282 trees: 0.8700</div>
  <p>The training log loss falls steadily, from 0.664 to 0.110, while the validation log loss stops improving: 0.338 at round 100, 0.326 at round 200, 0.324 at round 300, and slightly worse after that. The best round was 281. After 50 rounds without improvement, training stops at 332 trees. <code>best_iteration</code> is 281 and counts from 0, so the best model has 282 trees, and we predict with <code>iteration_range=(0, best_iteration + 1)</code>; the scikit-learn wrapper does this automatically. Early stopping replaces hours of searching over <code>n_estimators</code> with one run. Three rules keep it honest. The metric used is the last one in <code>eval_metric</code> on the last set in <code>evals</code>, so put the validation set last. Never early-stop on the test set, because the stopping point is chosen to look good on whatever data you give it, and that data's score becomes optimistic. And compare settings such as learning rates only with early stopping on, since a model with η = 0.05 and a fixed 300 trees is simply unfinished.</p>

  <h2 id="xgb-api"><span class="num">11</span>Using XGBoost in Practice</h2>
  <p>Most of the knobs have now appeared one at a time. In practice you meet them through two doors to the same engine: the <strong>native API</strong>, where data goes into a <code>DMatrix</code> and you call <code>xgb.train(params, dtrain, num_boost_round)</code>, and the <strong>scikit-learn API</strong>, where <code>XGBClassifier</code> and <code>XGBRegressor</code> behave like any sklearn model and fit into pipelines and grid searches. The native names are <code>eta</code>, <code>lambda</code>, <code>alpha</code>; the sklearn names are <code>learning_rate</code>, <code>reg_lambda</code>, <code>reg_alpha</code>; both are accepted. The parameters worth knowing:</p>
  <table class="tbl">
    <tr><th>Parameter (sklearn name)</th><th>Default</th><th>What it does</th><th>Move it when</th></tr>
    <tr><td><code>eta</code> (<code>learning_rate</code>)</td><td>0.3</td><td>Shrinks every tree</td><td>lower to 0.01–0.1 for the final model</td></tr>
    <tr><td><code>num_boost_round</code> (<code>n_estimators</code>)</td><td>10 / 100</td><td>Number of trees</td><td>set high and let early stopping cut</td></tr>
    <tr><td><code>max_depth</code></td><td>6</td><td>Depth of each tree, i.e. how many features can interact</td><td>3–10; the knob with the biggest effect</td></tr>
    <tr><td><code>min_child_weight</code></td><td>1</td><td>Minimum Σh in a child</td><td>raise for noisy labels</td></tr>
    <tr><td><code>gamma</code></td><td>0</td><td>Minimum gain to keep a split</td><td>scale it to the gains your data produces</td></tr>
    <tr><td><code>lambda</code> / <code>alpha</code></td><td>1 / 0</td><td>L2 / L1 on leaf values</td><td>raise when leaves are small or overfit</td></tr>
    <tr><td><code>subsample</code>, <code>colsample_by*</code></td><td>1</td><td>Row and column sampling</td><td>0.5–0.9 on wide or noisy data</td></tr>
    <tr><td><code>scale_pos_weight</code></td><td>1</td><td>Multiplies g and h of positive rows</td><td>rare positive class</td></tr>
    <tr><td><code>max_delta_step</code></td><td>0 (off)</td><td>Caps the size of each leaf value</td><td>extremely imbalanced log loss</td></tr>
    <tr><td><code>tree_method</code>, <code>max_bin</code></td><td>hist, 256</td><td>Split search and bins per column</td><td>rarely</td></tr>
    <tr><td><code>grow_policy</code>, <code>max_leaves</code></td><td>depthwise, 0</td><td>Level by level, or best leaf first (LightGBM style)</td><td>lossguide for leaf-wise growth</td></tr>
    <tr><td><code>monotone_constraints</code></td><td>none</td><td>Force a feature's effect to only increase or decrease</td><td>business or regulatory rules</td></tr>
  </table>
  <p>Class imbalance deserves a demonstration, because the usual fix has a side effect. With 5% churners there are about 19 stayers per churner, and a model trained as usual rarely predicts "churn" at the 0.5 cut-off. <code>scale_pos_weight=w</code> multiplies the g and h of every positive row by w, as if each churner appeared w times, and the usual starting value is negatives/positives:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, recall_score, precision_score
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,   # ~5% churners
                           n_clusters_per_class=3, class_sep=0.8, weights=[0.95], random_state=7)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
ratio = (ya == 0).sum() / (ya == 1).sum()
print(f"churn rate {ya.mean():.3f}, negatives/positives = {ratio:.1f}")
for spw in [1, np.sqrt(ratio), ratio]:
    m = xgb.XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=4, scale_pos_weight=spw,
                          random_state=0).fit(Xa, ya)
    p = m.predict_proba(Xb)[:, 1]
    print(f"scale_pos_weight={spw:4.1f}  AUC {roc_auc_score(yb, p):.3f}  recall {recall_score(yb, p &gt; 0.5):.2f}"
          f"  precision {precision_score(yb, p &gt; 0.5):.2f}  mean p {p.mean():.3f}")</div>
  <div class="fx" data-lang="text">churn rate 0.055, negatives/positives = 17.2
scale_pos_weight= 1.0  AUC 0.850  recall 0.21  precision 0.87  mean p 0.052
scale_pos_weight= 4.1  AUC 0.849  recall 0.39  precision 0.65  mean p 0.120
scale_pos_weight=17.2  AUC 0.839  recall 0.64  precision 0.25  mean p 0.254</div>
  <p>AUC barely moves (0.850 → 0.839): the ranking of customers by risk stays about the same. What changes is where the 0.5 cut-off falls. With weight 17.2 the model calls many more customers churners, so recall rises from 0.21 to 0.64 while precision falls from 0.87 to 0.25. And the probabilities are inflated: the average predicted churn probability is 0.254 although the true rate is 0.055, because the model was told every churner counts 17 times. If you need real probabilities, for pricing or expected-loss calculations, leave the weight at 1 and move the decision threshold instead, or recalibrate afterwards (<a class="xref" data-note="ml_calibration">Calibration</a>). The square root of the ratio, about 4 here, is a common middle ground.</p>
  <p>Finally, the two APIs side by side, plus saving and importance. The sklearn class is a thin wrapper, so the same native <code>Booster</code> lives inside it:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from churn import Xtr, ytr, Xva, yva, Xte, yte
clf = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.1, max_depth=6, subsample=0.8,
                        colsample_bytree=0.8, random_state=0, eval_metric="logloss",
                        early_stopping_rounds=50)
clf.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False)
print("sklearn API best_iteration:", clf.best_iteration)
p_sk = clf.predict_proba(Xte)[:, 1]                      # uses the best iteration automatically
booster = clf.get_booster()                              # the native Booster inside
p_nat = booster.predict(xgb.DMatrix(Xte), iteration_range=(0, clf.best_iteration + 1))
print("same predictions as the native booster:", np.allclose(p_sk, p_nat))
clf.save_model("churn_xgb.json")                         # portable JSON format
again = xgb.XGBClassifier(); again.load_model("churn_xgb.json")
print("reloaded model, same probabilities:", np.allclose(again.predict_proba(Xte)[:, 1], p_sk))
imp = booster.get_score(importance_type="gain")
print("top 3 by gain:", [(k, round(v, 1)) for k, v in sorted(imp.items(), key=lambda kv: -kv[1])[:3]])</div>
  <div class="fx" data-lang="text">sklearn API best_iteration: 281
same predictions as the native booster: True
reloaded model, same probabilities: True
top 3 by gain: [('f8', 6.5), ('f4', 5.8), ('f5', 5.8)]</div>
  <p>The sklearn model stops at the same best iteration as the native run (281), and its <code>predict_proba</code> equals the inner booster's predictions over the best 282 trees. The model saved as JSON reloads to identical probabilities; save with <code>save_model("model.json")</code> rather than pickle, because the JSON format loads in any XGBoost version and in R, Java or C, while a pickle can break after an upgrade. The importance shown is "gain", the average gain of the splits that use each feature; it is one of several built-in types and each has biases, so for explanations prefer SHAP values (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>). The native API also offers <code>xgb.cv</code>, k-fold cross-validation that picks the number of rounds by early stopping on the averaged folds.</p>

  <h2 id="xgb-cmp"><span class="num">12</span>XGBoost and Its Family</h2>
  <p>XGBoost sits between classic gradient boosting and two younger libraries that kept its maths and changed other things. <a class="xref" data-note="ml_lightgbm">LightGBM</a> (Microsoft, 2017) uses exactly the same g, h, gain and leaf formula, but makes split finding much faster with histograms everywhere, grows trees leaf by leaf instead of level by level, samples rows by gradient size (GOSS) and bundles sparse columns (EFB). <a class="xref" data-note="ml_catboost">CatBoost</a> (Yandex, 2018) also keeps the maths but fixes the label leakage that happens when categories are encoded with the target, and grows symmetric trees. If you understand this note, both are "the same machine with a different engine" (LightGBM) or "with different safety rules" (CatBoost).</p>
  <table class="tbl">
    <tr><th></th><th>sklearn GradientBoosting</th><th>XGBoost</th><th>LightGBM</th><th>CatBoost</th></tr>
    <tr><td>Split criterion</td><td>squared error on g only</td><td>gain from g, h, λ, γ</td><td>same as XGBoost</td><td>same idea, symmetric trees</td></tr>
    <tr><td>Penalty on leaves</td><td>none</td><td>λ (1), α, γ</td><td>λ (0), α, min_gain_to_split</td><td>l2_leaf_reg (3)</td></tr>
    <tr><td>Tree growth</td><td>depth-wise</td><td>depth-wise (leaf-wise optional)</td><td>leaf-wise</td><td>symmetric</td></tr>
    <tr><td>Missing values</td><td>no (HistGB: yes)</td><td>learned direction</td><td>learned direction</td><td>treated as min or max</td></tr>
    <tr><td>Categories</td><td>encode yourself</td><td>encode yourself, or <code>enable_categorical</code></td><td>native, sorted by gradient</td><td>native, ordered target statistics</td></tr>
    <tr><td>Speed on big data</td><td>slow</td><td>fast</td><td>fastest</td><td>fast, slowest of the three on CPU</td></tr>
  </table>
  <p>The other natural comparison is with a <a class="xref" data-note="ml_rf">Random Forest</a>. A forest grows deep trees independently and averages them, which mainly reduces variance; adding trees never hurts, and it needs little tuning. XGBoost grows shallow trees in sequence, each correcting the last, which mainly reduces bias, with variance controlled by η, sampling and the penalties; adding trees eventually overfits, so it needs early stopping and more tuning, and in return it is usually a little more accurate on tables. Both, like every tree model, predict a constant beyond the range of the training data, which section 13 shows.</p>

  <h2 id="xgb-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most dangerous mistake gives no error at all. When you train on a numpy array, the model knows columns only by position. If the columns arrive in a different order at prediction time, for example because a pipeline built them from a dictionary or a SQL query changed, XGBoost happily uses them:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from churn import Xtr, ytr, Xte, yte
m = xgb.XGBClassifier(n_estimators=100, max_depth=4, random_state=0).fit(Xtr.values, ytr)   # numpy: no names
print("columns in training order :", m.score(Xte.values, yte))
print("columns in reversed order :", m.score(Xte.values[:, ::-1], yte))                    # no error!</div>
  <div class="fx" data-lang="text">columns in training order : 0.8552
columns in reversed order : 0.5656</div>
  <p>Accuracy drops from 0.855 to 0.566, close to guessing, without a single warning. Train on a pandas DataFrame, so the model stores feature names and checks them, or save the column order with the model and enforce it before predicting.</p>
  <p>The second mistake is expecting a tree model to extrapolate. Every leaf holds a constant, so beyond the largest training value the prediction stays flat:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
x = np.arange(0, 100, dtype=float).reshape(-1, 1)        # e.g. flat size in square metres
y = 3 * x.ravel()                                        # price grows in a straight line
m = xgb.XGBRegressor(n_estimators=200, max_depth=3, random_state=0).fit(x, y)
print("x = 50 :", m.predict(np.array([[50.0]])).round(1), " true", 150)
print("x = 99 :", m.predict(np.array([[99.0]])).round(1), " true", 297)
print("x = 200:", m.predict(np.array([[200.0]])).round(1), " true", 600)</div>
  <div class="fx" data-lang="text">x = 50 : [150.3]  true 150
x = 99 : [296.9]  true 297
x = 200: [296.9]  true 600</div>
  <p>Inside the training range (0 to 99) the model is accurate, 150.3 for a true 150. At 200 it still predicts 296.9, the value at the edge, instead of 600. A price model trained on prices up to ₹10 lakh will never predict ₹20 lakh. For data with trends, model the trend with a linear model and let the trees fit what remains, or use ratios and differences as features.</p>
  <p>Several mistakes come from misreading XGBoost's numbers. The leaf values in a dump are η·w*, not w*, so a hand check seems wrong by a factor of 3 with η = 0.3. The printed gain and the number compared with <code>gamma</code> have no ½. <code>min_child_weight</code> is a Hessian sum, so setting it to 50 "because I want 50 rows per leaf" is much stricter than intended for log loss. And gain importance depends on data size, λ and the loss, so it is only comparable within one model.</p>
  <p>Finally, process mistakes: grid-searching <code>n_estimators</code> instead of using early stopping; shipping the exploratory learning rate of 0.3 instead of lowering it with early stopping for the final model; early-stopping on the test set; trusting probabilities after <code>scale_pos_weight</code>; feeding category codes 0, 1, 2 as numbers, which invents an order (use one-hot for few categories, <code>enable_categorical=True</code> with a pandas category column, or CatBoost); and passing a sparse matrix whose zeros are real values.</p>

  <h2 id="xgb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>XGBoost</b>: gradient boosting of regression trees with a regularised objective, a second-order approximation, fast split search and learned missing-value directions.</li>
    <li><b>Regularised objective</b>: Σ loss + Σ<sub>trees</sub> (γT + ½λΣw² + αΣ|w|).</li>
    <li><b>g, h</b>: first and second derivative of the loss for each row at its current score; recomputed before every tree.</li>
    <li><b>G, H</b>: sums of g and h over the rows of a leaf. <b>cover</b> in a dump = H.</li>
    <li><b>Structure score</b>: −½ΣG²/(H + λ) + γT; lower is better; replaces Gini or variance.</li>
    <li><b>Weighted quantile sketch</b>: candidate cut-offs spaced by Σh rather than by row count.</li>
    <li><b>Default direction</b>: the side of each split that rows with missing values follow, chosen by gain.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Diary value</th></tr>
    <tr><td>Taylor step</td><td>loss(F + f) ≈ loss(F) + g·f + ½h·f²</td><td>—</td></tr>
    <tr><td>Log loss</td><td>g = p − y, h = p(1 − p)</td><td>±0.5, 0.25 at p = 0.5</td></tr>
    <tr><td>Squared error</td><td>g = F − y, h = 1</td><td>—</td></tr>
    <tr><td>Leaf weight</td><td>w* = −G/(H + λ)</td><td>2.5/2.75 = 0.909</td></tr>
    <tr><td>With L1</td><td>w* = −sign(G)·max(|G| − α, 0)/(H + λ)</td><td>α = 1: 0.545 and 0</td></tr>
    <tr><td>Gain (paper)</td><td>½[G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)] − γ</td><td>0.737 at HumPct &lt; 82.5</td></tr>
    <tr><td>Gain (library)</td><td>same bracket without ½, compared with γ</td><td>1.4747</td></tr>
    <tr><td>Stored leaf</td><td>η · w*</td><td>0.3 × 0.909 = 0.2727</td></tr>
  </table>
  <h3>The brakes</h3>
  <table class="tbl">
    <tr><th>Knob</th><th>Default</th><th>Effect</th></tr>
    <tr><td>λ <code>reg_lambda</code></td><td>1</td><td>shrinks leaves, small leaves most; can make weak splits negative</td></tr>
    <tr><td>α <code>reg_alpha</code></td><td>0</td><td>leaf is exactly 0 unless |G| &gt; α</td></tr>
    <tr><td>γ <code>gamma</code></td><td>0</td><td>prunes splits with library gain &lt; γ, bottom-up after growing</td></tr>
    <tr><td><code>min_child_weight</code></td><td>1</td><td>minimum Σh per child (rows only for squared error)</td></tr>
    <tr><td><code>max_depth</code></td><td>6</td><td>biggest single effect on fit</td></tr>
    <tr><td>η, subsample, colsample</td><td>0.3, 1, 1</td><td>act on the whole team of trees</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import xgboost as xgb
m = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.05, max_depth=6,
                      subsample=0.8, colsample_bytree=0.8, reg_lambda=1,
                      eval_metric="logloss", early_stopping_rounds=50)
m.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
m.predict_proba(X_test)[:, 1]            # uses the best iteration
m.save_model("model.json")

bst = xgb.train(params, xgb.DMatrix(X, label=y), num_boost_round=3000,
                evals=[(dval, "val")], early_stopping_rounds=50)
bst.predict(dtest, iteration_range=(0, bst.best_iteration + 1))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>λ = 1 is on by default, so leaves are never plain means.</li>
    <li>Dumped leaves are η·w*; printed gain has no ½.</li>
    <li>min_child_weight counts Hessian, not rows.</li>
    <li>γ is in gain units, which grow with data size.</li>
    <li>Sparse matrix: absent entries (including zeros) are missing.</li>
    <li>scale_pos_weight inflates probabilities.</li>
    <li>Trees in sequence, parallel only inside a tree; no extrapolation.</li>
  </ul>

  <h2 id="xgb-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is XGBoost, and how does it differ from plain gradient boosting?</summary><div class="qa-body">XGBoost is gradient boosting of regression trees. It differs in five ways: it minimises a regularised objective with penalties on the number of leaves and the size of leaf values; it uses a second-order (Newton) approximation with gradients and Hessians, so split choice and leaf values come from one formula; it finds splits on quantile candidates or histograms instead of every value; it learns a default direction for missing values; and it is engineered for parallel, out-of-core, GPU and distributed training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write XGBoost's objective function and explain each term.</summary><div class="qa-body">Σ loss(y<sub>i</sub>, ŷ<sub>i</sub>) + Σ<sub>trees</sub> (γT + ½λΣw<sub>j</sub>² + αΣ|w<sub>j</sub>|). The loss rewards fitting the data. γT charges a fixed price per leaf, ½λΣw² penalises large leaf values like ridge, and αΣ|w| is the lasso version that can set leaves to zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the optimal leaf weight.</summary><div class="qa-body">With a second-order Taylor expansion, the objective for a new tree is Σ[g<sub>i</sub>f + ½h<sub>i</sub>f²] + penalty. Grouping rows by leaf gives Σ<sub>j</sub>[G<sub>j</sub>w<sub>j</sub> + ½(H<sub>j</sub> + λ)w<sub>j</sub>²] + γT, a separate parabola per leaf. Setting its derivative to zero gives w<sub>j</sub>* = −G<sub>j</sub>/(H<sub>j</sub> + λ), and substituting back gives the structure score −½ΣG<sub>j</sub>²/(H<sub>j</sub> + λ) + γT.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the split gain and explain it.</summary><div class="qa-body">Gain = ½[G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)] − γ. It is the score of the left child plus the right child minus the parent, minus the price of one extra leaf. A split is made only if the gain is positive, and the best one across all columns and cut-offs is chosen. The library drops the ½.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are g and h for log loss and for squared error?</summary><div class="qa-body">Log loss: g = p − y and h = p(1 − p), where p is the predicted probability. Squared error: g = prediction − y and h = 1. g says which way and how strongly a row wants its score to move; h says how curved the loss is there, largest for undecided rows and tiny for confident ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does XGBoost use the second derivative?</summary><div class="qa-body">It turns each step into a Newton step, scaling corrections by how curved the loss is, which usually needs fewer trees than fixed-size gradient steps. It also reduces every loss to the same problem in g and h, so one tree builder serves any twice-differentiable loss, and the split gain and leaf values come from the same objective.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between gamma and lambda?</summary><div class="qa-body">λ is an L2 penalty on leaf values: it shrinks them, the small leaves most, and can make weak splits unprofitable. γ is a fixed price per leaf: splits whose gain is below γ are pruned after the tree is grown. λ changes the numbers in the leaves; γ changes the shape of the tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does min_child_weight actually limit?</summary><div class="qa-body">The sum of Hessians in each child. For squared error that is the row count, but for log loss it is Σp(1 − p), so rows that are already confidently predicted count for very little. It stops the model building leaves on tiny or already well-fitted groups of rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does XGBoost handle missing values?</summary><div class="qa-body">At every split it tries sending all rows with a missing value left and then right, and keeps the direction with the larger gain. Missing values at prediction time follow that learned default. Only non-missing entries are scanned, so sparse data is cheap. In a SciPy sparse matrix, every absent entry, including zeros, counts as missing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the weighted quantile sketch, and why weight by h?</summary><div class="qa-body">It proposes candidate cut-offs so that each bucket holds about the same total Hessian rather than the same number of rows. The per-row objective equals ½h(f − (−g/h))² plus a constant, a weighted least-squares problem with weights h, so rows with large h matter more and deserve finer cut-offs, while confidently predicted rows matter little.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare tree_method exact, approx and hist.</summary><div class="qa-body">exact tries every distinct value using pre-sorted columns. approx tries Hessian-weighted quantile candidates, re-proposed each iteration. hist buckets each column once into at most 256 bins, sums g and h per bin and uses parent-minus-child subtraction. hist is the default because it is about as accurate and much faster and lighter on memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If boosting is sequential, where does XGBoost get its parallelism?</summary><div class="qa-body">Inside each tree: different threads search different columns or build different parts of the histograms, and the results are combined. The trees themselves must be built one after another, because each depends on the predictions of the previous ones. That is why training time grows linearly with the number of trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging versus boosting: how does XGBoost differ from a random forest?</summary><div class="qa-body">A random forest builds deep trees independently on bootstrap samples and averages them, which mainly reduces variance; more trees never hurt. XGBoost builds shallow trees in sequence, each fitting the remaining errors, which mainly reduces bias; it needs a learning rate, penalties and early stopping because too many trees overfit. XGBoost is usually somewhat more accurate but needs more tuning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does early stopping work, and what are its pitfalls?</summary><div class="qa-body">After each tree the model is scored on a validation set, and training stops when the score has not improved for N rounds; the best iteration is remembered and used for prediction. Pitfalls: stopping on the test set makes the test score optimistic, the metric used is the last one on the last evaluation set, and best_iteration counts from 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you handle a 1:50 class imbalance with XGBoost?</summary><div class="qa-body">Early-stop on a metric that suits imbalance, such as AUC-PR or log loss. Either keep the weights at 1 and choose the decision threshold on validation data, or set scale_pos_weight between 1 and about 50 (sometimes with max_delta_step 1–10). If you weight, the probabilities are inflated, so recalibrate them if they are used as probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model has train AUC 0.999 and validation AUC 0.80. What do you do?</summary><div class="qa-body">First check for a leaking feature, since a near-perfect training score often means a column contains the answer. Make sure early stopping is on. Then reduce complexity: lower max_depth, raise min_child_weight, add subsample and colsample around 0.7–0.8, raise lambda, try gamma, and lower the learning rate with more rounds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is λ in XGBoost related to ridge regression?</summary><div class="qa-body">It is the same L2 shrinkage applied to leaf values instead of coefficients. In w* = −G/(H + λ), λ acts like λ extra rows with zero residual in every leaf, which pulls small leaves strongly towards zero and barely affects large ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What did LightGBM and CatBoost change relative to XGBoost?</summary><div class="qa-body">Both kept XGBoost's g/h gain and leaf formula. LightGBM made training faster with histograms throughout, leaf-wise growth, gradient-based row sampling (GOSS), feature bundling (EFB) and native categorical splits. CatBoost removed target leakage with ordered target statistics and ordered boosting, and uses symmetric trees with strong defaults for categorical data.</div></details>
</main>
`
});
