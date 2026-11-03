// notes/ml/ml_classification.js — Logistic Regression
Object.assign(TOPIC_CONTENT, {
  "ml_classification": `<main>
  <h1>Logistic Regression</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>Logistic Regression</span></div>
  <p class="lead">Many real questions have a yes/no answer: will this student pass, will this customer miss a loan payment, is this tumour benign. Logistic regression answers them with a probability. It keeps the weighted sum you know from <a class="xref" data-note="ml_regression">Linear Regression</a> and passes it through an S-shaped curve, the sigmoid, so the answer always lands between 0 and 1. It is the standard first model for any classification problem, the model banks and hospitals use when they must explain their decisions, and the building block whose loss function (log-loss) and output layer (softmax) reappear in gradient boosting and every neural-network classifier. The running example is six students, their hours of study (1 to 6) and whether they passed (0, 0, 1, 0, 1, 1); later we add the number of mock tests each took, and a few real datasets show the same ideas at scale.</p>

  <h2 id="lg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Logistic Regression</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The model</div>
        <ul>
          <li>Score z = w·x + b is the <b>log-odds</b> ln(p / (1 − p))</li>
          <li><b>Sigmoid</b> σ(z) = 1 / (1 + e⁻ᶻ) turns it into p</li>
          <li>Predict 1 if p ≥ threshold (0.5 ⇔ z ≥ 0)</li>
          <li>Boundary w·x + b = 0 is a straight line / plane</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training</div>
        <ul>
          <li><b>Log-loss</b> = −mean[y ln p + (1 − y) ln(1 − p)], from maximum likelihood</li>
          <li>Gradient (1/n)Σ(p − y)x: error × input</li>
          <li>No closed form; gradient descent, Newton, L-BFGS</li>
          <li>Convex: one bowl, one answer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading it</div>
        <ul>
          <li>e<sup>w</sup> = <b>odds ratio</b> per unit of x</li>
          <li>Probability change p(1 − p)w depends on the row</li>
          <li>statsmodels: standard errors, p-values, CIs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extensions</div>
        <ul>
          <li><b>Softmax</b> for K classes; one-vs-rest for multilabel</li>
          <li>C = 1/λ: small C = strong penalty; L2 default, L1 sparse</li>
          <li>Rare class: lower the threshold or class_weight</li>
          <li>Always scale features</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-task"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">From Regression to Classification</span><span class="rm-sub">and why a straight line fails</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sigmoid"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Odds, Log-Odds and the Sigmoid</span><span class="rm-sub">turning any score into a probability</span></div></div>
      <div class="rm-item rm-done" data-target="lg-model"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Logistic Regression Model</span><span class="rm-sub">from features to a decision</span></div></div>
      <div class="rm-item rm-done" data-target="lg-loss"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Log-Loss from Likelihood</span><span class="rm-sub">scoring a set of weights</span></div></div>
      <div class="rm-item rm-done" data-target="lg-grad"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Training: Gradient Descent and Newton</span><span class="rm-sub">finding the best weights</span></div></div>
      <div class="rm-item rm-done" data-target="lg-boundary"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Decision Boundary</span><span class="rm-sub">where the answer switches</span></div></div>
      <div class="rm-item rm-done" data-target="lg-coef"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Odds Ratios</span><span class="rm-sub">explaining a weight in words</span></div></div>
      <div class="rm-item rm-done" data-target="lg-multi"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Multiclass: Softmax and One-vs-Rest</span><span class="rm-sub">more than two classes</span></div></div>
      <div class="rm-item rm-done" data-target="lg-reg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Regularization and C</span><span class="rm-sub">keeping weights finite and sensible</span></div></div>
      <div class="rm-item rm-done" data-target="lg-imb"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Class Imbalance</span><span class="rm-sub">making a rare class count</span></div></div>
      <div class="rm-item rm-done" data-target="lg-practice"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">sklearn and statsmodels in Practice</span><span class="rm-sub">solvers, outputs, p-values</span></div></div>
      <div class="rm-item rm-done" data-target="lg-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Strengths and Comparisons</span><span class="rm-sub">when to use it, and its siblings</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">penalties, thresholds, separation</span></div></div>
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about logistic regression</span></div></div>
    </div>
  </div>

  <h2 id="lg-task"><span class="num">01</span>From Regression to Classification</h2>
  <p>In linear regression the target was a number, such as a flat's price. Many questions have a category as the answer instead: will a student pass or fail, will a customer miss next month's payment, which of three species is this flower. Predicting a category is called <strong>classification</strong>, and when there are only two categories it is <strong>binary classification</strong>. A quick test tells the two kinds of problem apart: can you average two answers and get a sensible answer? Marks of 60 and 80 average to 70, a real mark, so predicting marks is regression. "Pass" and "fail" do not average to anything, so predicting the result is classification. We usually code the classes as numbers, fail = 0 and pass = 1, but these numbers are only names.</p>
  <p>A good classifier does not jump straight to "pass". It works in three stages: a <strong>score</strong> (any number, saying how strong the evidence is), then a <strong>probability</strong> between 0 and 1 (how likely "yes" is), then a <strong>decision</strong> ("yes" if the probability is above some threshold). Keeping these stages separate is one of the most useful habits in machine learning, because the right threshold depends on the business, not on the model. A bank may reject loans with more than a 30% risk of default, a hospital may test every patient with more than a 5% cancer risk, and a spam filter may only block mail it is 99% sure about. Think of a weather forecast that says "70% chance of rain". That is the probability. Whether you carry an umbrella is the decision, and it depends on how much you hate getting wet. The model's job is to be an honest forecaster; choosing the threshold is a separate step (see <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  <p>So we need a model that outputs a probability. The obvious first try is to reuse linear regression on the 0/1 labels. Here are our six students:</p>
  <table class="tbl">
    <tr><th>hours studied</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><th>passed</th><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>
  </table>
  <p>The 3-hour student got lucky and passed, and the 4-hour student did not, which is the kind of noise real data has. Least squares gives slope Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = 3.5 / 17.5 = 0.2 and intercept 0.5 − 0.2 × 3.5 = −0.2, so ŷ = −0.2 + 0.2·hours. Now we add a seventh student who studied 20 hours and, of course, passed:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
hours = np.array([1, 2, 3, 4, 5, 6.])           # hours studied
passed = np.array([0, 0, 1, 0, 1, 1])           # 1 = passed the exam
ols = LinearRegression().fit(hours[:, None], passed)
print(f"line: y_hat = {ols.intercept_:.3f} + {ols.coef_[0]:.3f} * hours")
print("  at 0, 6 and 10 hours:", ols.predict([[0], [6], [10]]).round(2))
print(f"  0.5 is crossed at {(0.5 - ols.intercept_) / ols.coef_[0]:.2f} hours")
h2, p2 = np.append(hours, 20), np.append(passed, 1)     # add a 20-hour student who passed
ols2 = LinearRegression().fit(h2[:, None], p2)
print(f"with a 20-hour student: 0.5 is crossed at {(0.5 - ols2.intercept_) / ols2.coef_[0]:.2f} hours")
print("  predicted labels:", (ols2.predict(h2[:, None]) &gt;= 0.5).astype(int), " true:", p2)</div>
  <div class="fx" data-lang="text">line: y_hat = -0.200 + 0.200 * hours
  at 0, 6 and 10 hours: [-0.2  1.   1.8]
  0.5 is crossed at 3.50 hours
with a 20-hour student: 0.5 is crossed at 4.16 hours
  predicted labels: [0 0 0 0 1 1 1]  true: [0 0 1 0 1 1 1]</div>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
<line x1="60" y1="250" x2="600" y2="250" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="250" x2="60" y2="50" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="250" x2="60.0" y2="254" stroke="currentColor"/><text x="60.0" y="266" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="168.0" y1="250" x2="168.0" y2="254" stroke="currentColor"/><text x="168.0" y="266" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="276.0" y1="250" x2="276.0" y2="254" stroke="currentColor"/><text x="276.0" y="266" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="384.0" y1="250" x2="384.0" y2="254" stroke="currentColor"/><text x="384.0" y="266" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="492.0" y1="250" x2="492.0" y2="254" stroke="currentColor"/><text x="492.0" y="266" text-anchor="middle" class="tm" font-size="11">8</text>
<line x1="600.0" y1="250" x2="600.0" y2="254" stroke="currentColor"/><text x="600.0" y="266" text-anchor="middle" class="tm" font-size="11">10</text>
<line x1="56" y1="250.0" x2="60" y2="250.0" stroke="currentColor"/><text x="53" y="254.0" text-anchor="end" class="tm" font-size="11">-0.4</text>
<line x1="56" y1="205.6" x2="60" y2="205.6" stroke="currentColor"/><text x="53" y="209.6" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="150.0" x2="60" y2="150.0" stroke="currentColor"/><text x="53" y="154.0" text-anchor="end" class="tm" font-size="11">0.5</text>
<line x1="56" y1="94.4" x2="60" y2="94.4" stroke="currentColor"/><text x="53" y="98.4" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="56" y1="50.0" x2="60" y2="50.0" stroke="currentColor"/><text x="53" y="54.0" text-anchor="end" class="tm" font-size="11">1.4</text>
<text x="330.0" y="282" text-anchor="middle" font-size="12">hours studied</text>
<text x="22" y="150.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 150.0)">y or p</text>
<line x1="60" y1="205.6" x2="600" y2="205.6" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity="0.35"/>
<line x1="60" y1="94.4" x2="600" y2="94.4" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity="0.35"/>
<path d="M60.0 227.8 L65.4 225.6 L70.8 223.3 L76.2 221.1 L81.6 218.9 L87.0 216.7 L92.4 214.4 L97.8 212.2 L103.2 210.0 L108.6 207.8 L114.0 205.6 L119.4 203.3 L124.8 201.1 L130.2 198.9 L135.6 196.7 L141.0 194.4 L146.4 192.2 L151.8 190.0 L157.2 187.8 L162.6 185.6 L168.0 183.3 L173.4 181.1 L178.8 178.9 L184.2 176.7 L189.6 174.4 L195.0 172.2 L200.4 170.0 L205.8 167.8 L211.2 165.6 L216.6 163.3 L222.0 161.1 L227.4 158.9 L232.8 156.7 L238.2 154.4 L243.6 152.2 L249.0 150.0 L254.4 147.8 L259.8 145.6 L265.2 143.3 L270.6 141.1 L276.0 138.9 L281.4 136.7 L286.8 134.4 L292.2 132.2 L297.6 130.0 L303.0 127.8 L308.4 125.6 L313.8 123.3 L319.2 121.1 L324.6 118.9 L330.0 116.7 L335.4 114.4 L340.8 112.2 L346.2 110.0 L351.6 107.8 L357.0 105.6 L362.4 103.3 L367.8 101.1 L373.2 98.9 L378.6 96.7 L384.0 94.4 L389.4 92.2 L394.8 90.0 L400.2 87.8 L405.6 85.6 L411.0 83.3 L416.4 81.1 L421.8 78.9 L427.2 76.7 L432.6 74.4 L438.0 72.2 L443.4 70.0 L448.8 67.8 L454.2 65.6 L459.6 63.3 L465.0 61.1 L470.4 58.9 L475.8 56.7 L481.2 54.4 L486.6 52.2 L492.0 50.0" fill="none" class="sr" stroke-width="2.2"/>
<path d="M60.0 204.0 L65.4 203.8 L70.8 203.6 L76.2 203.3 L81.6 203.0 L87.0 202.7 L92.4 202.4 L97.8 202.0 L103.2 201.5 L108.6 201.0 L114.0 200.5 L119.4 199.8 L124.8 199.1 L130.2 198.4 L135.6 197.5 L141.0 196.5 L146.4 195.5 L151.8 194.3 L157.2 193.0 L162.6 191.6 L168.0 190.1 L173.4 188.4 L178.8 186.5 L184.2 184.6 L189.6 182.4 L195.0 180.1 L200.4 177.7 L205.8 175.0 L211.2 172.3 L216.6 169.4 L222.0 166.4 L227.4 163.2 L232.8 160.0 L238.2 156.7 L243.6 153.4 L249.0 150.0 L254.4 146.6 L259.8 143.3 L265.2 140.0 L270.6 136.8 L276.0 133.6 L281.4 130.6 L286.8 127.7 L292.2 125.0 L297.6 122.3 L303.0 119.9 L308.4 117.6 L313.8 115.4 L319.2 113.5 L324.6 111.6 L330.0 109.9 L335.4 108.4 L340.8 107.0 L346.2 105.7 L351.6 104.5 L357.0 103.5 L362.4 102.5 L367.8 101.6 L373.2 100.9 L378.6 100.2 L384.0 99.5 L389.4 99.0 L394.8 98.5 L400.2 98.0 L405.6 97.6 L411.0 97.3 L416.4 97.0 L421.8 96.7 L427.2 96.4 L432.6 96.2 L438.0 96.0 L443.4 95.8 L448.8 95.7 L454.2 95.5 L459.6 95.4 L465.0 95.3 L470.4 95.2 L475.8 95.1 L481.2 95.0 L486.6 95.0 L492.0 94.9 L497.4 94.9 L502.8 94.8 L508.2 94.8 L513.6 94.7 L519.0 94.7 L524.4 94.7 L529.8 94.6 L535.2 94.6 L540.6 94.6 L546.0 94.6 L551.4 94.6 L556.8 94.6 L562.2 94.5 L567.6 94.5 L573.0 94.5 L578.4 94.5 L583.8 94.5 L589.2 94.5 L594.6 94.5 L600.0 94.5" fill="none" class="sb" stroke-width="2.6"/>
<circle cx="114.0" cy="205.6" r="6" class="fr sr" stroke-width="1.5"/>
<circle cx="168.0" cy="205.6" r="6" class="fr sr" stroke-width="1.5"/>
<circle cx="222.0" cy="94.4" r="6" class="fg sg" stroke-width="1.5"/>
<circle cx="276.0" cy="205.6" r="6" class="fr sr" stroke-width="1.5"/>
<circle cx="330.0" cy="94.4" r="6" class="fg sg" stroke-width="1.5"/>
<circle cx="384.0" cy="94.4" r="6" class="fg sg" stroke-width="1.5"/>
<text x="500.1" y="54.4" class="tr" font-size="12">line: 1.4 at 8 h</text>
<text x="459.6" y="110.0" class="tb" font-size="12">sigmoid: stays in 0..1</text>
<text x="70.8" y="238.9" class="tr" font-size="12">−0.2 at 0 h</text>
<line x1="249.0" y1="250.0" x2="249.0" y2="50.0" stroke="currentColor" stroke-dasharray="2 3" stroke-opacity="0.6"/>
<text x="254.4" y="61.1" class="tm" font-size="11">both cross 0.5 at 3.5 h</text>
</svg><figcaption>Red: the least-squares line on the six students; it leaves [0, 1] on both sides. Blue: the logistic curve fitted to the same students (section 05); it bends to stay between 0 and 1. Green dots passed, red dots failed.</figcaption></figure>
  <p>Three things go wrong. First, the line predicts −0.2 at 0 hours and 1.8 at 10 hours, and a "probability" of −20% or 180% is nonsense: a straight line is unbounded. Second, the obvious 20-hour student moved the 0.5 crossing point from 3.50 to 4.16 hours, and now the 3-hour student who passed is predicted to fail. Squared error punishes the line heavily for predicting 3.8 for a student whose label is 1, even though that prediction is "too right" rather than wrong, so it tilts the whole line to reduce that error. Third, the line says every extra hour adds the same 0.2 to the probability, whereas in reality an extra hour matters a lot for a student on the borderline and hardly at all for one who is already certain to pass. Fitting least squares to 0/1 labels is called the <strong>linear probability model</strong>, and these three failures are why we need something better: an output that stays between 0 and 1, flattens out at the ends, and is not dragged around by easy cases. In the figure, the red line escapes the [0, 1] band on both sides, while the blue logistic curve bends to stay inside it.</p>

  <h2 id="lg-sigmoid"><span class="num">02</span>Odds, Log-Odds and the Sigmoid</h2>
  <p>A straight line naturally produces values from −∞ to +∞, while a probability must stay between 0 and 1. The trick is to find a different way of expressing probability that does run from −∞ to +∞, let the line predict that, and convert back. The route goes through odds.</p>
  <p>Cricket commentators say "the odds are 4 to 1 that India wins", meaning that for every match India loses it wins 4. Out of 5 matches that is 4 wins, so the probability is 0.8. The <strong>odds</strong> of an event are p / (1 − p): probability of it happening divided by probability of it not happening. A probability of 0.5 gives odds of 1 ("even"), 0.8 gives odds of 4, and 0.1 gives odds of 1/9 = 0.111. Odds run from 0 to +∞, which is better than 0 to 1 but still bounded on one side. Taking the natural logarithm finishes the job: the <strong>log-odds</strong>, also called the <strong>logit</strong>, ln(p / (1 − p)), runs from −∞ to +∞ and is symmetric around zero. p = 0.5 gives log-odds 0, p = 0.8 gives +1.386, and p = 0.2 gives −1.386. This is exactly the range a straight line produces, so the plan is: let the line predict the log-odds, then convert the log-odds back into a probability.</p>
  <p>Converting back takes four lines of algebra. Set the log-odds equal to the line's score z: ln(p / (1 − p)) = z. Undo the log: p / (1 − p) = eᶻ. Multiply out: p = eᶻ − p·eᶻ, so p(1 + eᶻ) = eᶻ and p = eᶻ / (1 + eᶻ). Dividing top and bottom by eᶻ gives</p>
  <p style="text-align:center"><strong>p = σ(z) = 1 / (1 + e<sup>−z</sup>)</strong></p>
  <p>This is the <strong>sigmoid</strong>, or logistic function, the inverse of the log-odds. It is not chosen because it looks nice; it is simply "log-odds back to probability". By hand: for z = 1, e⁻¹ = 0.368, so σ(1) = 1 / 1.368 = 0.731; for z = −2, e² = 7.389, so σ(−2) = 1 / 8.389 = 0.119. The code fills in more values, and applies the sigmoid to our six students using the weights we will find in section 05:</p>
  <div class="fx" data-lang="py">def sigmoid(z):
    return 1 / (1 + np.exp(-z))
print(" z    odds=e^z   p=sigmoid(z)  slope p(1-p)")
for z in [-4, -2, -1, 0, 1, 2, 4]:
    p = sigmoid(z)
    print(f"{z:+d}  {np.exp(z):9.3f}   {p:.3f}         {p * (1 - p):.3f}")
print("symmetry: sigmoid(-1.5) =", round(sigmoid(-1.5), 4), " 1 - sigmoid(1.5) =", round(1 - sigmoid(1.5), 4))
z_st = 1.214 * hours - 4.249                  # the six students, with weights found in section 05
print("students z:", z_st.round(2))
print("         p:", sigmoid(z_st).round(3))</div>
  <div class="fx" data-lang="text"> z    odds=e^z   p=sigmoid(z)  slope p(1-p)
-4      0.018   0.018         0.018
-2      0.135   0.119         0.105
-1      0.368   0.269         0.197
+0      1.000   0.500         0.250
+1      2.718   0.731         0.197
+2      7.389   0.881         0.105
+4     54.598   0.982         0.018
symmetry: sigmoid(-1.5) = 0.1824  1 - sigmoid(1.5) = 0.1824
students z: [-3.03 -1.82 -0.61  0.61  1.82  3.04]
         p: [0.046 0.139 0.353 0.647 0.861 0.954]</div>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="60" y1="240" x2="600" y2="240" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="240" x2="60" y2="40" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="240" x2="60.0" y2="244" stroke="currentColor"/><text x="60.0" y="256" text-anchor="middle" class="tm" font-size="11">-6</text>
<line x1="150.0" y1="240" x2="150.0" y2="244" stroke="currentColor"/><text x="150.0" y="256" text-anchor="middle" class="tm" font-size="11">-4</text>
<line x1="240.0" y1="240" x2="240.0" y2="244" stroke="currentColor"/><text x="240.0" y="256" text-anchor="middle" class="tm" font-size="11">-2</text>
<line x1="330.0" y1="240" x2="330.0" y2="244" stroke="currentColor"/><text x="330.0" y="256" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="420.0" y1="240" x2="420.0" y2="244" stroke="currentColor"/><text x="420.0" y="256" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="510.0" y1="240" x2="510.0" y2="244" stroke="currentColor"/><text x="510.0" y="256" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="600.0" y1="240" x2="600.0" y2="244" stroke="currentColor"/><text x="600.0" y="256" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="56" y1="240.0" x2="60" y2="240.0" stroke="currentColor"/><text x="53" y="244.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="140.0" x2="60" y2="140.0" stroke="currentColor"/><text x="53" y="144.0" text-anchor="end" class="tm" font-size="11">0.5</text>
<line x1="56" y1="40.0" x2="60" y2="40.0" stroke="currentColor"/><text x="53" y="44.0" text-anchor="end" class="tm" font-size="11">1</text>
<text x="330.0" y="272" text-anchor="middle" font-size="12">z = w·x + b  (log-odds)</text>
<text x="22" y="140.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 140.0)">p = σ(z)</text>
<line x1="60" y1="140.0" x2="600" y2="140.0" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity="0.35"/>
<path d="M60.0 239.5 L64.5 239.5 L69.0 239.4 L73.5 239.3 L78.0 239.3 L82.5 239.2 L87.0 239.1 L91.5 239.0 L96.0 238.9 L100.5 238.8 L105.0 238.7 L109.5 238.5 L114.0 238.4 L118.5 238.2 L123.0 238.0 L127.5 237.8 L132.0 237.6 L136.5 237.3 L141.0 237.0 L145.5 236.7 L150.0 236.4 L154.5 236.0 L159.0 235.6 L163.5 235.2 L168.0 234.7 L172.5 234.1 L177.0 233.5 L181.5 232.9 L186.0 232.2 L190.5 231.4 L195.0 230.5 L199.5 229.6 L204.0 228.5 L208.5 227.4 L213.0 226.2 L217.5 224.8 L222.0 223.4 L226.5 221.8 L231.0 220.0 L235.5 218.2 L240.0 216.2 L244.5 214.0 L249.0 211.6 L253.5 209.1 L258.0 206.4 L262.5 203.5 L267.0 200.4 L271.5 197.2 L276.0 193.7 L280.5 190.1 L285.0 186.2 L289.5 182.2 L294.0 178.0 L298.5 173.6 L303.0 169.1 L307.5 164.5 L312.0 159.7 L316.5 154.9 L321.0 150.0 L325.5 145.0 L330.0 140.0 L334.5 135.0 L339.0 130.0 L343.5 125.1 L348.0 120.3 L352.5 115.5 L357.0 110.9 L361.5 106.4 L366.0 102.0 L370.5 97.8 L375.0 93.8 L379.5 89.9 L384.0 86.3 L388.5 82.8 L393.0 79.6 L397.5 76.5 L402.0 73.6 L406.5 70.9 L411.0 68.4 L415.5 66.0 L420.0 63.8 L424.5 61.8 L429.0 60.0 L433.5 58.2 L438.0 56.6 L442.5 55.2 L447.0 53.8 L451.5 52.6 L456.0 51.5 L460.5 50.4 L465.0 49.5 L469.5 48.6 L474.0 47.8 L478.5 47.1 L483.0 46.5 L487.5 45.9 L492.0 45.3 L496.5 44.8 L501.0 44.4 L505.5 44.0 L510.0 43.6 L514.5 43.3 L519.0 43.0 L523.5 42.7 L528.0 42.4 L532.5 42.2 L537.0 42.0 L541.5 41.8 L546.0 41.6 L550.5 41.5 L555.0 41.3 L559.5 41.2 L564.0 41.1 L568.5 41.0 L573.0 40.9 L577.5 40.8 L582.0 40.7 L586.5 40.7 L591.0 40.6 L595.5 40.5 L600.0 40.5" fill="none" class="sb" stroke-width="2.6"/>
<circle cx="150.0" cy="236.4" r="4.5" class="fb sb"/>
<circle cx="240.0" cy="216.2" r="4.5" class="fb sb"/>
<circle cx="285.0" cy="186.2" r="4.5" class="fb sb"/>
<circle cx="330.0" cy="140.0" r="4.5" class="fb sb"/>
<circle cx="375.0" cy="93.8" r="4.5" class="fb sb"/>
<circle cx="420.0" cy="63.8" r="4.5" class="fb sb"/>
<circle cx="510.0" cy="43.6" r="4.5" class="fb sb"/>
<text x="341.2" y="146.0" class="tb" font-size="11.5">z = 0 → p = 0.5, slope 0.25 (steepest)</text>
<text x="69.0" y="216.0" class="tm" font-size="11.5">z = −4 → p = 0.018</text>
<text x="433.5" y="80.0" class="tm" font-size="11.5">z = +4 → p = 0.982</text>
<text x="69.0" y="54.0" class="tm" font-size="11.5">σ(z) = 1 / (1 + e^(−z))</text>
</svg><figcaption>The sigmoid turns any log-odds score into a probability. It is steepest at z = 0 (slope 0.25) and almost flat beyond |z| = 4.</figcaption></figure>
  <p>Three properties of the sigmoid come up again and again. First, σ(0) = 0.5: a score of zero means even odds, and this is where the decision boundary will be. Second, it is symmetric, σ(−z) = 1 − σ(z) (0.1824 both ways in the output), so the probability of class 0 is σ(−z) and swapping which class is called "1" just flips the sign of every weight. Third, its slope is σ(z)(1 − σ(z)), which is largest, 0.25, at z = 0 and only 0.018 at z = ±4. So one more unit of score moves the probability a lot in the middle (0.500 to 0.731) and hardly at all near the edges (0.018 to 0.047). Think of a fan regulator rather than an on/off switch: turning the knob (the score) is linear, but the fan's speed (the probability) responds strongly in the middle range and barely at all when the fan is already almost off or at full speed. That is exactly the "big effect near 50/50, small effect when already sure" behaviour the straight line lacked. For our students, scores from −3.03 to +3.04 become probabilities from 0.046 to 0.954, all safely inside (0, 1).</p>
  <p>One caution: odds are not probabilities. "Odds of 2" means p = 2/3, not 2. For rare events they are nearly equal (odds 0.018 and p 0.018 at z = −4), which is why they are often loosely mixed up, but for common events they differ a lot (p = 0.8 has odds 4).</p>

  <h2 id="lg-model"><span class="num">03</span>The Logistic Regression Model</h2>
  <p>Now we can put the pieces together. <strong>Logistic regression</strong> computes the same weighted sum as linear regression, reads it as the log-odds, and turns it into a probability with the sigmoid:</p>
  <p style="text-align:center"><strong>z = b + w₁x₁ + … + w<sub>d</sub>x<sub>d</sub>, &nbsp; P(y = 1 | x) = σ(z)</strong></p>
  <p>Here x₁ … x<sub>d</sub> are the features, w₁ … w<sub>d</sub> are the weights (one per feature), and b is the intercept, also called the bias. The decision is "class 1 if p ≥ 0.5", and since σ(z) ≥ 0.5 exactly when z ≥ 0, that is the same as "class 1 if z ≥ 0". Every weight now means "how much this feature adds to the log-odds". Despite its name, logistic regression is a classifier; it is called regression for historical reasons, because it runs a linear regression on the log-odds.</p>
  <p>Let us predict one student by hand. Suppose a model with two features, hours studied and number of mock tests taken, has been trained (section 06 fits it) and gives b = −7.14, w_hours = 1.52 and w_tests = 1.10. A new student studied 3 hours and took 2 mock tests. The score is −7.14 + 1.52 × 3 + 1.10 × 2 = −7.14 + 4.55 + 2.19 = −0.40. The odds are e<sup>−0.40</sup> = 0.67, about 2 to 3 in favour. The probability is 1 / (1 + e<sup>0.40</sup>) = 1 / 2.49 = 0.40. Since 0.40 &lt; 0.5, the model predicts "fail", but only just; a business that wanted to catch every borderline student might use a lower threshold.</p>
  <p>There are three useful ways to read the same model, and interviewers like to hear them. As a <em>probability model</em>, each label is a coin flip whose chance of heads is p = σ(w·x + b); this is what gives us the loss in the next section. As a <em>generalised linear model</em>, the log-odds are a linear function of the features, logit(p) = w·x + b, which is why the weights add up on the log-odds scale. And <em>geometrically</em>, the set of points where w·x + b = 0 is a straight line (or a flat plane in more dimensions) that splits the space into the two predicted classes, and points far from it get confident probabilities. Two assumptions are built in: the effect of each feature on the log-odds is additive and constant, so if hours matter more for students who also took mock tests, you must add an interaction column hours × tests yourself, as in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</p>

  <h2 id="lg-loss"><span class="num">04</span>Log-Loss from Likelihood</h2>
  <p>We can compute a probability for any weights, but we have no way yet to say whether w = 1.214 is better than w = 0 for our six students. For lines we minimised squared error. For probabilities there is a more natural question: if the model were true, how probable would the data we actually saw be? Good weights make the real passes and fails probable. That quantity is called the <strong>likelihood</strong>, and choosing the weights that make it as large as possible is called <strong>maximum likelihood estimation</strong>.</p>
  <p>For one student the model says P(pass) = p. If the student really passed, the model gave the truth probability p; if they failed, it gave 1 − p. Because y is 0 or 1, one formula covers both cases: p<sup>y</sup>(1 − p)<sup>1−y</sup>. Assuming the students are independent, the probability of the whole dataset is the product over all students. Let us compare a "know-nothing" model (w = 0, b = 0, so every p = 0.5) with the weights section 05 will find (w = 1.214, b = −4.249), whose probabilities we computed above: 0.046, 0.139, 0.353, 0.647, 0.861, 0.954. The probabilities the fitted model gives to what actually happened are 0.954, 0.861, 0.353, 0.353, 0.861 and 0.954, whose product is about 0.084. The know-nothing model gives 0.5⁶ = 0.0156. So the fitted model makes the real results about five times more likely.</p>
  <p>Products of many numbers below 1 become tiny (with 10,000 rows they underflow to zero on a computer) and are awkward to differentiate. Taking the logarithm fixes both problems, because the log turns a product into a sum and, since log is an increasing function, does not change which weights are best. Maximising the log-likelihood is the same as minimising its negative, and dividing by n gives an average per row. The result is the <strong>log-loss</strong>, also called binary cross-entropy:</p>
  <p style="text-align:center"><strong>L(w, b) = −(1/n) Σ [ yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ) ]</strong></p>
  <p>Each row contributes −ln(the probability the model gave to the truth). The code computes it for both models and then compares log-loss with squared error for a single student whose truth is 1:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import log_loss
y = passed
for w, b in [(0.0, 0.0), (1.214, -4.249)]:              # a know-nothing model and the fitted one
    p = sigmoid(w * hours + b)
    rows = -(y * np.log(p) + (1 - y) * np.log(1 - p))    # -ln(probability given to the truth)
    lik = np.prod(np.where(y == 1, p, 1 - p))
    print(f"w={w}, b={b}: row losses {rows.round(3)}  mean {rows.mean():.3f}  likelihood {lik:.4f}")
print("sklearn log_loss:", round(log_loss(y, sigmoid(1.214 * hours - 4.249)), 3))
print("truth y=1:  p      log-loss  squared  push on z: log-loss  squared")
for p1 in [0.99, 0.5, 0.1, 0.01]:
    print(f"        {p1:5}  {-np.log(p1):8.3f}  {(1 - p1)**2:7.3f}  {abs(p1 - 1):18.3f}  {abs(2 * (p1 - 1) * p1 * (1 - p1)):7.4f}")</div>
  <div class="fx" data-lang="text">w=0.0, b=0.0: row losses [0.693 0.693 0.693 0.693 0.693 0.693]  mean 0.693  likelihood 0.0156
w=1.214, b=-4.249: row losses [0.047 0.15  1.042 1.042 0.15  0.047]  mean 0.413  likelihood 0.0839
sklearn log_loss: 0.413
truth y=1:  p      log-loss  squared  push on z: log-loss  squared
         0.99     0.010    0.000               0.010   0.0002
          0.5     0.693    0.250               0.500   0.2500
          0.1     2.303    0.810               0.900   0.1620
         0.01     4.605    0.980               0.990   0.0196</div>
  <p>The know-nothing model scores ln 2 = 0.693 on every row, the baseline any useful model must beat. The fitted model scores 0.413 on average, and almost all of its loss comes from the two surprising students (3 hours passed, 4 hours failed), each costing 1.042, while the clear cases cost only 0.047. scikit-learn's <code>log_loss</code> agrees.</p>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="60" y1="240" x2="600" y2="240" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="240" x2="60" y2="40" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="240" x2="60.0" y2="244" stroke="currentColor"/><text x="60.0" y="256" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="168.0" y1="240" x2="168.0" y2="244" stroke="currentColor"/><text x="168.0" y="256" text-anchor="middle" class="tm" font-size="11">0.2</text>
<line x1="276.0" y1="240" x2="276.0" y2="244" stroke="currentColor"/><text x="276.0" y="256" text-anchor="middle" class="tm" font-size="11">0.4</text>
<line x1="384.0" y1="240" x2="384.0" y2="244" stroke="currentColor"/><text x="384.0" y="256" text-anchor="middle" class="tm" font-size="11">0.6</text>
<line x1="492.0" y1="240" x2="492.0" y2="244" stroke="currentColor"/><text x="492.0" y="256" text-anchor="middle" class="tm" font-size="11">0.8</text>
<line x1="600.0" y1="240" x2="600.0" y2="244" stroke="currentColor"/><text x="600.0" y="256" text-anchor="middle" class="tm" font-size="11">1</text>
<line x1="56" y1="240.0" x2="60" y2="240.0" stroke="currentColor"/><text x="53" y="244.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="200.0" x2="60" y2="200.0" stroke="currentColor"/><text x="53" y="204.0" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="56" y1="160.0" x2="60" y2="160.0" stroke="currentColor"/><text x="53" y="164.0" text-anchor="end" class="tm" font-size="11">2</text>
<line x1="56" y1="120.0" x2="60" y2="120.0" stroke="currentColor"/><text x="53" y="124.0" text-anchor="end" class="tm" font-size="11">3</text>
<line x1="56" y1="80.0" x2="60" y2="80.0" stroke="currentColor"/><text x="53" y="84.0" text-anchor="end" class="tm" font-size="11">4</text>
<line x1="56" y1="40.0" x2="60" y2="40.0" stroke="currentColor"/><text x="53" y="44.0" text-anchor="end" class="tm" font-size="11">5</text>
<text x="330.0" y="272" text-anchor="middle" font-size="12">predicted p = P(y = 1)</text>
<text x="22" y="140.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 140.0)">loss for one row</text>
<path d="M63.6 39.8 L67.2 67.3 L70.8 83.4 L74.3 94.9 L77.9 103.8 L81.5 111.1 L85.1 117.2 L88.6 122.5 L92.2 127.2 L95.8 131.5 L99.4 135.3 L102.9 138.7 L106.5 141.9 L110.1 144.9 L113.7 147.7 L117.3 150.2 L120.8 152.7 L124.4 154.9 L128.0 157.1 L131.6 159.2 L135.1 161.1 L138.7 163.0 L142.3 164.7 L145.9 166.4 L149.4 168.1 L153.0 169.6 L156.6 171.2 L160.2 172.6 L163.7 174.0 L167.3 175.4 L170.9 176.7 L174.5 177.9 L178.0 179.2 L181.6 180.4 L185.2 181.5 L188.8 182.7 L192.3 183.8 L195.9 184.8 L199.5 185.9 L203.1 186.9 L206.6 187.9 L210.2 188.8 L213.8 189.8 L217.4 190.7 L220.9 191.6 L224.5 192.5 L228.1 193.3 L231.7 194.2 L235.2 195.0 L238.8 195.8 L242.4 196.6 L246.0 197.4 L249.5 198.1 L253.1 198.9 L256.7 199.6 L260.3 200.3 L263.9 201.0 L267.4 201.7 L271.0 202.4 L274.6 203.1 L278.2 203.7 L281.7 204.4 L285.3 205.0 L288.9 205.7 L292.5 206.3 L296.0 206.9 L299.6 207.5 L303.2 208.1 L306.8 208.7 L310.3 209.2 L313.9 209.8 L317.5 210.4 L321.1 210.9 L324.6 211.5 L328.2 212.0 L331.8 212.5 L335.4 213.1 L338.9 213.6 L342.5 214.1 L346.1 214.6 L349.7 215.1 L353.2 215.6 L356.8 216.1 L360.4 216.5 L364.0 217.0 L367.5 217.5 L371.1 217.9 L374.7 218.4 L378.3 218.9 L381.8 219.3 L385.4 219.7 L389.0 220.2 L392.6 220.6 L396.1 221.0 L399.7 221.5 L403.3 221.9 L406.9 222.3 L410.5 222.7 L414.0 223.1 L417.6 223.5 L421.2 223.9 L424.8 224.3 L428.3 224.7 L431.9 225.1 L435.5 225.5 L439.1 225.8 L442.6 226.2 L446.2 226.6 L449.8 227.0 L453.4 227.3 L456.9 227.7 L460.5 228.0 L464.1 228.4 L467.7 228.8 L471.2 229.1 L474.8 229.5 L478.4 229.8 L482.0 230.1 L485.5 230.5 L489.1 230.8 L492.7 231.1 L496.3 231.5 L499.8 231.8 L503.4 232.1 L507.0 232.4 L510.6 232.8 L514.1 233.1 L517.7 233.4 L521.3 233.7 L524.9 234.0 L528.4 234.3 L532.0 234.6 L535.6 234.9 L539.2 235.2 L542.7 235.5 L546.3 235.8 L549.9 236.1 L553.5 236.4 L557.1 236.7 L560.6 237.0 L564.2 237.3 L567.8 237.5 L571.4 237.8 L574.9 238.1 L578.5 238.4 L582.1 238.7 L585.7 238.9 L589.2 239.2 L592.8 239.5 L596.4 239.7" fill="none" class="sg" stroke-width="2.6"/>
<path d="M63.6 239.7 L67.2 239.5 L70.8 239.2 L74.3 238.9 L77.9 238.7 L81.5 238.4 L85.1 238.1 L88.6 237.8 L92.2 237.5 L95.8 237.3 L99.4 237.0 L102.9 236.7 L106.5 236.4 L110.1 236.1 L113.7 235.8 L117.3 235.5 L120.8 235.2 L124.4 234.9 L128.0 234.6 L131.6 234.3 L135.1 234.0 L138.7 233.7 L142.3 233.4 L145.9 233.1 L149.4 232.8 L153.0 232.4 L156.6 232.1 L160.2 231.8 L163.7 231.5 L167.3 231.1 L170.9 230.8 L174.5 230.5 L178.0 230.1 L181.6 229.8 L185.2 229.5 L188.8 229.1 L192.3 228.8 L195.9 228.4 L199.5 228.0 L203.1 227.7 L206.6 227.3 L210.2 227.0 L213.8 226.6 L217.4 226.2 L220.9 225.8 L224.5 225.5 L228.1 225.1 L231.7 224.7 L235.2 224.3 L238.8 223.9 L242.4 223.5 L246.0 223.1 L249.5 222.7 L253.1 222.3 L256.7 221.9 L260.3 221.5 L263.9 221.0 L267.4 220.6 L271.0 220.2 L274.6 219.7 L278.2 219.3 L281.7 218.9 L285.3 218.4 L288.9 217.9 L292.5 217.5 L296.0 217.0 L299.6 216.5 L303.2 216.1 L306.8 215.6 L310.3 215.1 L313.9 214.6 L317.5 214.1 L321.1 213.6 L324.6 213.1 L328.2 212.5 L331.8 212.0 L335.4 211.5 L338.9 210.9 L342.5 210.4 L346.1 209.8 L349.7 209.2 L353.2 208.7 L356.8 208.1 L360.4 207.5 L364.0 206.9 L367.5 206.3 L371.1 205.7 L374.7 205.0 L378.3 204.4 L381.8 203.7 L385.4 203.1 L389.0 202.4 L392.6 201.7 L396.1 201.0 L399.7 200.3 L403.3 199.6 L406.9 198.9 L410.5 198.1 L414.0 197.4 L417.6 196.6 L421.2 195.8 L424.8 195.0 L428.3 194.2 L431.9 193.3 L435.5 192.5 L439.1 191.6 L442.6 190.7 L446.2 189.8 L449.8 188.8 L453.4 187.9 L456.9 186.9 L460.5 185.9 L464.1 184.8 L467.7 183.8 L471.2 182.7 L474.8 181.5 L478.4 180.4 L482.0 179.2 L485.5 177.9 L489.1 176.7 L492.7 175.4 L496.3 174.0 L499.8 172.6 L503.4 171.2 L507.0 169.6 L510.6 168.1 L514.1 166.4 L517.7 164.7 L521.3 163.0 L524.9 161.1 L528.4 159.2 L532.0 157.1 L535.6 154.9 L539.2 152.7 L542.7 150.2 L546.3 147.7 L549.9 144.9 L553.5 141.9 L557.1 138.7 L560.6 135.3 L564.2 131.5 L567.8 127.2 L571.4 122.5 L574.9 117.2 L578.5 111.1 L582.1 103.8 L585.7 94.9 L589.2 83.4 L592.8 67.3 L596.4 39.8" fill="none" class="sr" stroke-width="2.6"/>
<path d="M63.6 200.5 L67.2 201.1 L70.8 201.6 L74.3 202.1 L77.9 202.6 L81.5 203.1 L85.1 203.6 L88.6 204.1 L92.2 204.6 L95.8 205.1 L99.4 205.6 L102.9 206.1 L106.5 206.6 L110.1 207.1 L113.7 207.6 L117.3 208.0 L120.8 208.5 L124.4 209.0 L128.0 209.4 L131.6 209.9 L135.1 210.4 L138.7 210.8 L142.3 211.3 L145.9 211.7 L149.4 212.2 L153.0 212.6 L156.6 213.0 L160.2 213.5 L163.7 213.9 L167.3 214.3 L170.9 214.7 L174.5 215.2 L178.0 215.6 L181.6 216.0 L185.2 216.4 L188.8 216.8 L192.3 217.2 L195.9 217.6 L199.5 218.0 L203.1 218.4 L206.6 218.8 L210.2 219.2 L213.8 219.5 L217.4 219.9 L220.9 220.3 L224.5 220.7 L228.1 221.0 L231.7 221.4 L235.2 221.7 L238.8 222.1 L242.4 222.5 L246.0 222.8 L249.5 223.2 L253.1 223.5 L256.7 223.8 L260.3 224.2 L263.9 224.5 L267.4 224.8 L271.0 225.2 L274.6 225.5 L278.2 225.8 L281.7 226.1 L285.3 226.4 L288.9 226.7 L292.5 227.0 L296.0 227.3 L299.6 227.6 L303.2 227.9 L306.8 228.2 L310.3 228.5 L313.9 228.8 L317.5 229.1 L321.1 229.3 L324.6 229.6 L328.2 229.9 L331.8 230.1 L335.4 230.4 L338.9 230.7 L342.5 230.9 L346.1 231.2 L349.7 231.4 L353.2 231.6 L356.8 231.9 L360.4 232.1 L364.0 232.4 L367.5 232.6 L371.1 232.8 L374.7 233.0 L378.3 233.3 L381.8 233.5 L385.4 233.7 L389.0 233.9 L392.6 234.1 L396.1 234.3 L399.7 234.5 L403.3 234.7 L406.9 234.9 L410.5 235.1 L414.0 235.3 L417.6 235.4 L421.2 235.6 L424.8 235.8 L428.3 236.0 L431.9 236.1 L435.5 236.3 L439.1 236.4 L442.6 236.6 L446.2 236.8 L449.8 236.9 L453.4 237.1 L456.9 237.2 L460.5 237.3 L464.1 237.5 L467.7 237.6 L471.2 237.7 L474.8 237.9 L478.4 238.0 L482.0 238.1 L485.5 238.2 L489.1 238.3 L492.7 238.4 L496.3 238.5 L499.8 238.6 L503.4 238.7 L507.0 238.8 L510.6 238.9 L514.1 239.0 L517.7 239.1 L521.3 239.2 L524.9 239.2 L528.4 239.3 L532.0 239.4 L535.6 239.4 L539.2 239.5 L542.7 239.6 L546.3 239.6 L549.9 239.7 L553.5 239.7 L557.1 239.7 L560.6 239.8 L564.2 239.8 L567.8 239.9 L571.4 239.9 L574.9 239.9 L578.5 239.9 L582.1 240.0 L585.7 240.0 L589.2 240.0 L592.8 240.0 L596.4 240.0" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-width="1.6"/>
<text x="76.2" y="50.0" class="tg" font-size="12">truth y = 1: −ln p</text>
<text x="416.4" y="50.0" class="tr" font-size="12">truth y = 0: −ln(1 − p)</text>
<text x="195.0" y="112.0" class="tm" font-size="11.5">dashed: squared error (1 − p)² for y = 1</text>
<circle cx="546.0" cy="235.8" r="4.5" class="fg sg"/><text x="554.0" y="229.8" font-size="11.5">0.105</text>
<circle cx="114.0" cy="147.9" r="4.5" class="fg sg"/><text x="122.0" y="141.9" font-size="11.5">2.303</text>
</svg><figcaption>Log-loss for one row. Green: the truth is 1, loss −ln p explodes as p → 0. Red: the truth is 0, mirror image. Dashed: squared error for a true 1, which never exceeds 1.</figcaption></figure>
  <p>The last four lines and the figure show why we do not simply use squared error. First, punishment: predicting p = 0.01 for a student who passed costs 4.605 in log-loss but only 0.980 in squared error. Squared error can never cost more than 1 per row, so a confidently wrong model is barely punished, while log-loss grows without limit as p approaches 0. Second, the push during training: with log-loss, the push on the score of that confidently wrong row is |p − y| = 0.990, the strongest of all. With squared error passed through a sigmoid it is 2(p − y)·p(1 − p) = 0.0196, almost nothing, because the sigmoid's slope is tiny at p = 0.01, so training would stall exactly where the model is most wrong. Third, shape: log-loss for logistic regression is <strong>convex</strong> in the weights, a single bowl with no false bottoms, so any downhill method finds the best answer; squared error through a sigmoid is not convex. Think of two weather forecasters on a dry day: one said "55% rain", the other "99% rain". Log-loss charges the first 0.80 and the second 4.61. A forecaster who bluffs with extreme confidence and is wrong should lose credibility fast.</p>

  <h2 id="lg-grad"><span class="num">05</span>Training: Gradient Descent and Newton</h2>
  <p>Log-loss scores any weights, but nobody handed us 1.214. For linear regression, setting the derivative of the squared error to zero gave a formula, the normal equation. For log-loss, setting the derivative to zero gives Σ(σ(w·xᵢ + b) − yᵢ)xᵢ = 0, and w sits inside the sigmoid where it cannot be isolated. So there is no formula, and we do what <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> taught: start somewhere, work out which direction is downhill, take a step, and repeat. Think of walking down a hill in fog: you cannot see the valley, but you can feel the slope under your feet. Because the log-loss is a single bowl, you always reach the one true bottom.</p>
  <p>The direction comes from the <strong>gradient</strong>, the vector of derivatives of the loss with respect to each weight. For one row, the loss depends on p, p depends on z, and z depends on the weights, so the chain rule multiplies three small derivatives. The derivative of the loss with respect to p is (p − y) / (p(1 − p)). The derivative of p with respect to z is the sigmoid slope, p(1 − p). Multiplying them, the p(1 − p) cancels and leaves simply <strong>p − y</strong>. Finally z = w·x + b, so the derivative with respect to wⱼ is xⱼ and with respect to b is 1. Averaging over the rows:</p>
  <p style="text-align:center"><strong>∂L/∂wⱼ = (1/n) Σ (pᵢ − yᵢ)·xᵢⱼ, &nbsp; ∂L/∂b = (1/n) Σ (pᵢ − yᵢ)</strong></p>
  <p>Read it in words: error times input. A row the model already gets right (p close to y) contributes almost nothing, and a confidently wrong row contributes the most. It has the same form as linear regression's gradient, (ŷ − y)·x, and that is not a coincidence: pairing the sigmoid with log-loss is what makes the p(1 − p) cancel.</p>
  <p>One step by hand, starting from w = 0, b = 0 with a learning rate (step size) of 0.5. Every p is 0.5, so the errors p − y are +0.5, +0.5, −0.5, +0.5, −0.5, −0.5. Multiplying by hours 1 to 6 gives +0.5, +1.0, −1.5, +2.0, −2.5, −3.0, whose mean is −0.583, and the mean error is 0. So ∂L/∂w = −0.583 and ∂L/∂b = 0. Gradient descent moves against the gradient: w ← 0 − 0.5 × (−0.583) = 0.292, and b stays 0. A negative gradient means the loss falls if w grows, so w grows: more hours, more likely to pass. The code repeats this and then runs 20,000 steps:</p>
  <div class="fx" data-lang="py">x, y = hours, passed
w, b, lr = 0.0, 0.0, 0.5
for step in range(1, 20001):
    p = sigmoid(w * x + b)
    gw, gb = ((p - y) * x).mean(), (p - y).mean()     # the gradient: mean of (p - y) * input
    if step &lt;= 2:
        loss = -(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()
        print(f"step {step}: p={p.round(3)} loss={loss:.3f} gw={gw:.3f} gb={gb:.3f}")
    w, b = w - lr * gw, b - lr * gb
    if step &lt;= 2:
        print(f"         -&gt; w={w:.3f} b={b:.3f}")
print(f"after 20000 steps: w={w:.3f} b={b:.3f}")
m = LogisticRegression(C=np.inf).fit(x[:, None], y)   # C=inf switches off sklearn's penalty
print(f"sklearn (C=inf):   w={m.coef_[0, 0]:.3f} b={m.intercept_[0]:.3f}")</div>
  <div class="fx" data-lang="text">step 1: p=[0.5 0.5 0.5 0.5 0.5 0.5] loss=0.693 gw=-0.583 gb=0.000
         -&gt; w=0.292 b=0.000
step 2: p=[0.572 0.642 0.706 0.763 0.811 0.852] loss=0.672 gw=0.365 gb=0.224
         -&gt; w=0.109 b=-0.112
after 20000 steps: w=1.214 b=-4.249
sklearn (C=inf):   w=1.214 b=-4.249</div>
  <p>Step 1 matches the hand calculation and the loss falls from 0.693 to 0.672. In step 2 every p is above 0.5, so the model now over-predicts passing, the mean error is +0.224, and b is pushed down to −0.112. That zig-zag is normal with a large step size. After 20,000 steps we land on w = 1.214, b = −4.249, exactly what scikit-learn finds. (<code>C=np.inf</code> switches off scikit-learn's default penalty, explained in section 09, so that both minimise the same loss.)</p>
  <p>Gradient descent needs many small steps. <strong>Newton's method</strong> uses the curvature of the bowl as well as its slope, and jumps almost straight to the bottom. The curvature is the matrix of second derivatives, the <strong>Hessian</strong>, which for log-loss is H = XᵀSX with S a diagonal matrix of pᵢ(1 − pᵢ). Each Newton step solves H·d = gradient and moves by d. Because every pᵢ(1 − pᵢ) is non-negative, the Hessian is positive semi-definite, which is the mathematical way of saying the loss is convex. Written as a weighted least-squares problem, the same Newton step is called <strong>IRLS</strong> (iteratively reweighted least squares), which is how statsmodels and R fit logistic regression. Here is a from-scratch Newton solver, checked against scikit-learn with and without its penalty:</p>
  <div class="fx" data-lang="py">def newton_logreg(X, y, C=np.inf, steps=25):
    """Minimise C * sum(log-loss) + 0.5*||w||^2 (intercept not penalised) by Newton's method."""
    X1 = np.c_[np.ones(len(X)), X]                    # column of 1s for the intercept
    theta = np.zeros(X1.shape[1])                     # [b, w1, ..., wd]
    pen = 0.0 if np.isinf(C) else 1 / C
    P = pen * np.diag(np.r_[0.0, np.ones(X.shape[1])])
    for it in range(steps):
        p = sigmoid(X1 @ theta)
        grad = X1.T @ (p - y) + P @ theta             # gradient (sum form, penalty scaled by 1/C)
        H = (X1.T * (p * (1 - p))) @ X1 + P           # Hessian: X^T diag(p(1-p)) X
        theta -= np.linalg.solve(H, grad)
    return theta
for C in [np.inf, 1.0]:
    b, w = newton_logreg(hours[:, None], passed, C)
    sk = LogisticRegression(C=C).fit(hours[:, None], passed)
    print(f"C={C}: Newton w={w:.3f} b={b:.3f}   sklearn w={sk.coef_[0, 0]:.3f} b={sk.intercept_[0]:.3f}")</div>
  <div class="fx" data-lang="text">C=inf: Newton w=1.214 b=-4.249   sklearn w=1.214 b=-4.249
C=1.0: Newton w=0.767 b=-2.685   sklearn w=0.767 b=-2.685</div>
  <p>Newton reproduces scikit-learn's answers in a few steps, both without a penalty (w = 1.214, b = −4.249) and with scikit-learn's default penalty C = 1 (w = 0.767, b = −2.685). scikit-learn's default solver, L-BFGS, approximates the Hessian from recent gradients, giving nearly Newton's speed without building a d × d matrix. One warning that follows from all this: convex does not guarantee a finite answer. If a straight line separates the classes perfectly, the loss keeps falling as the weights grow and the minimum is at infinity, a problem section 09 solves.</p>

  <h2 id="lg-boundary"><span class="num">06</span>The Decision Boundary</h2>
  <p>We have the best weights, but what has the model actually learned to do? The model predicts class 1 when p ≥ 0.5, which happens exactly when z ≥ 0, so the <strong>decision boundary</strong>, the place where the answer switches, is the set of points where w·x + b = 0. With one feature that is a single cut point: 1.214·hours − 4.249 = 0 gives hours = 3.50, right between the confusing 3-hour and 4-hour students. With two features it is a straight line, and with more it is a flat plane (a hyperplane). Here are ten students with hours studied and mock tests taken:</p>
  <table class="tbl">
    <tr><th>hours</th><td>1</td><td>2</td><td>3</td><td>4</td><td>2</td><td>5</td><td>6</td><td>4</td><td>5</td><td>3</td></tr>
    <tr><th>tests</th><td>0</td><td>1</td><td>0</td><td>1</td><td>3</td><td>2</td><td>1</td><td>3</td><td>0</td><td>3</td></tr>
    <tr><th>passed</th><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.datasets import make_circles
m2 = LogisticRegression(C=np.inf).fit(X2, y2)          # ten students: hours, mock tests
w1, w2 = m2.coef_[0]; b2 = m2.intercept_[0]
print(f"z = {b2:.2f} + {w1:.2f}*hours + {w2:.2f}*tests")
print(f"boundary: tests = {-b2 / w2:.2f} - {w1 / w2:.2f}*hours")
for row in [[3, 2], [4, 1], [1, 3]]:
    z = b2 + w1 * row[0] + w2 * row[1]
    print(f"  student {row}: z={z:+.2f}  p={sigmoid(z):.3f}  label={int(z &gt;= 0)}")
Xc, yc = make_circles(n_samples=300, noise=0.1, factor=0.4, random_state=0)   # one ring inside another
plain = cross_val_score(LogisticRegression(), Xc, yc, cv=5).mean()
poly = make_pipeline(PolynomialFeatures(2), StandardScaler(), LogisticRegression())
print(f"rings: plain CV accuracy {plain:.3f} | with x1^2, x1*x2, x2^2: {cross_val_score(poly, Xc, yc, cv=5).mean():.3f}")
pf = poly.fit(Xc, yc)
print("weights:", {k: float(v) for k, v in zip(pf[0].get_feature_names_out(["x1", "x2"]), pf[-1].coef_[0].round(2))})</div>
  <div class="fx" data-lang="text">z = -7.14 + 1.52*hours + 1.10*tests
boundary: tests = 6.52 - 1.39*hours
  student [3, 2]: z=-0.40  p=0.402  label=0
  student [4, 1]: z=+0.02  p=0.506  label=1
  student [1, 3]: z=-2.34  p=0.088  label=0
rings: plain CV accuracy 0.457 | with x1^2, x1*x2, x2^2: 1.000
weights: {'1': 0.0, 'x1': -0.06, 'x2': -0.15, 'x1^2': -3.65, 'x1 x2': 0.11, 'x2^2': -3.55}</div>
  <p>The fitted model is z = −7.14 + 1.52·hours + 1.10·tests, the one we used by hand in section 03, and student (3, 2) indeed gets p = 0.402. Setting z = 0 and solving for tests gives the boundary tests = 6.52 − 1.39·hours: a student who studied 3 hours would need about 6.52 − 4.16 = 2.36 mock tests to reach 50%. Student (4, 1) sits almost exactly on the line (p = 0.506) and student (1, 3) is far on the fail side (p = 0.088).</p>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
<line x1="60" y1="250" x2="560" y2="250" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="250" x2="60" y2="40" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="250" x2="60.0" y2="254" stroke="currentColor"/><text x="60.0" y="266" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="131.4" y1="250" x2="131.4" y2="254" stroke="currentColor"/><text x="131.4" y="266" text-anchor="middle" class="tm" font-size="11">1</text>
<line x1="202.9" y1="250" x2="202.9" y2="254" stroke="currentColor"/><text x="202.9" y="266" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="274.3" y1="250" x2="274.3" y2="254" stroke="currentColor"/><text x="274.3" y="266" text-anchor="middle" class="tm" font-size="11">3</text>
<line x1="345.7" y1="250" x2="345.7" y2="254" stroke="currentColor"/><text x="345.7" y="266" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="417.1" y1="250" x2="417.1" y2="254" stroke="currentColor"/><text x="417.1" y="266" text-anchor="middle" class="tm" font-size="11">5</text>
<line x1="488.6" y1="250" x2="488.6" y2="254" stroke="currentColor"/><text x="488.6" y="266" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="560.0" y1="250" x2="560.0" y2="254" stroke="currentColor"/><text x="560.0" y="266" text-anchor="middle" class="tm" font-size="11">7</text>
<line x1="56" y1="250.0" x2="60" y2="250.0" stroke="currentColor"/><text x="53" y="254.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="202.3" x2="60" y2="202.3" stroke="currentColor"/><text x="53" y="206.3" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="56" y1="154.5" x2="60" y2="154.5" stroke="currentColor"/><text x="53" y="158.5" text-anchor="end" class="tm" font-size="11">2</text>
<line x1="56" y1="106.8" x2="60" y2="106.8" stroke="currentColor"/><text x="53" y="110.8" text-anchor="end" class="tm" font-size="11">3</text>
<line x1="56" y1="59.1" x2="60" y2="59.1" stroke="currentColor"/><text x="53" y="63.1" text-anchor="end" class="tm" font-size="11">4</text>
<text x="310.0" y="282" text-anchor="middle" font-size="12">hours studied</text>
<text x="22" y="145.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 145.0)">mock tests</text>
<path d="M120.7 55.4 L124.3 58.8 L127.9 62.1 L131.4 65.4 L135.0 68.7 L138.6 72.0 L142.1 75.3 L145.7 78.6 L149.3 81.9 L152.9 85.2 L156.4 88.5 L160.0 91.8 L163.6 95.1 L167.1 98.4 L170.7 101.7 L174.3 105.0 L177.9 108.3 L181.4 111.7 L185.0 115.0 L188.6 118.3 L192.1 121.6 L195.7 124.9 L199.3 128.2 L202.9 131.5 L206.4 134.8 L210.0 138.1 L213.6 141.4 L217.1 144.7 L220.7 148.0 L224.3 151.3 L227.9 154.6 L231.4 157.9 L235.0 161.2 L238.6 164.6 L242.1 167.9 L245.7 171.2 L249.3 174.5 L252.9 177.8 L256.4 181.1 L260.0 184.4 L263.6 187.7 L267.1 191.0 L270.7 194.3 L274.3 197.6 L277.9 200.9 L281.4 204.2 L285.0 207.5 L288.6 210.8 L292.1 214.1 L295.7 217.5 L299.3 220.8 L302.9 224.1 L306.4 227.4 L310.0 230.7 L313.6 234.0 L317.1 237.3 L320.7 240.6 L324.3 243.9 L327.9 247.2" fill="none" class="sr" stroke-width="1.4" stroke-dasharray="5 4"/>
<text x="106.7" y="47.4" font-size="11.5" class="tr">p = 0.2</text>
<path d="M185.0 54.6 L188.6 57.9 L192.1 61.2 L195.7 64.5 L199.3 67.8 L202.9 71.1 L206.4 74.4 L210.0 77.7 L213.6 81.0 L217.1 84.3 L220.7 87.6 L224.3 90.9 L227.9 94.2 L231.4 97.6 L235.0 100.9 L238.6 104.2 L242.1 107.5 L245.7 110.8 L249.3 114.1 L252.9 117.4 L256.4 120.7 L260.0 124.0 L263.6 127.3 L267.1 130.6 L270.7 133.9 L274.3 137.2 L277.9 140.5 L281.4 143.8 L285.0 147.1 L288.6 150.4 L292.1 153.8 L295.7 157.1 L299.3 160.4 L302.9 163.7 L306.4 167.0 L310.0 170.3 L313.6 173.6 L317.1 176.9 L320.7 180.2 L324.3 183.5 L327.9 186.8 L331.4 190.1 L335.0 193.4 L338.6 196.7 L342.1 200.0 L345.7 203.3 L349.3 206.7 L352.9 210.0 L356.4 213.3 L360.0 216.6 L363.6 219.9 L367.1 223.2 L370.7 226.5 L374.3 229.8 L377.9 233.1 L381.4 236.4 L385.0 239.7 L388.6 243.0 L392.1 246.3 L395.7 249.6" fill="none" class="sb" stroke-width="2.6" />
<text x="171.0" y="46.6" font-size="11.5" class="tb">p = 0.5</text>
<path d="M252.9 57.0 L256.4 60.3 L260.0 63.6 L263.6 66.9 L267.1 70.2 L270.7 73.5 L274.3 76.8 L277.9 80.1 L281.4 83.4 L285.0 86.8 L288.6 90.1 L292.1 93.4 L295.7 96.7 L299.3 100.0 L302.9 103.3 L306.4 106.6 L310.0 109.9 L313.6 113.2 L317.1 116.5 L320.7 119.8 L324.3 123.1 L327.9 126.4 L331.4 129.7 L335.0 133.0 L338.6 136.3 L342.1 139.7 L345.7 143.0 L349.3 146.3 L352.9 149.6 L356.4 152.9 L360.0 156.2 L363.6 159.5 L367.1 162.8 L370.7 166.1 L374.3 169.4 L377.9 172.7 L381.4 176.0 L385.0 179.3 L388.6 182.6 L392.1 185.9 L395.7 189.2 L399.3 192.6 L402.9 195.9 L406.4 199.2 L410.0 202.5 L413.6 205.8 L417.1 209.1 L420.7 212.4 L424.3 215.7 L427.9 219.0 L431.4 222.3 L435.0 225.6 L438.6 228.9 L442.1 232.2 L445.7 235.5 L449.3 238.8 L452.9 242.1 L456.4 245.4 L460.0 248.8" fill="none" class="sg" stroke-width="1.4" stroke-dasharray="5 4"/>
<text x="238.9" y="49.0" font-size="11.5" class="tg">p = 0.8</text>
<circle cx="131.4" cy="250.0" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="202.9" cy="202.3" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="274.3" cy="250.0" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="345.7" cy="202.3" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="202.9" cy="106.8" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="417.1" cy="154.5" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="488.6" cy="202.3" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="345.7" cy="106.8" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="417.1" cy="250.0" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="274.3" cy="106.8" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="274.3" cy="154.5" r="6.5" fill="none" stroke="currentColor" stroke-dasharray="2 2" stroke-width="1.6"/><text x="146.3" y="180.5" font-size="11" class="tm">new (3, 2): p = 0.40</text>
<text x="417.1" y="78.2" font-size="11.5" class="tm">green = passed, red = failed</text>
</svg><figcaption>The ten students. The solid blue line is the 50% boundary; the dashed lines are where p = 0.2 and p = 0.8. All three are parallel, because each is just z = constant. Two students sit on the "wrong" side: no straight line can separate this data perfectly (which is why the weights stay finite).</figcaption></figure>
  <p>The figure shows the boundary and the lines where p = 0.2 and p = 0.8. They are parallel, because each is simply "z equals a constant". This explains an important fact: changing the threshold moves the boundary but never rotates it. If the school wants to predict "pass" only when p ≥ 0.8, the rule becomes z ≥ ln(0.8 / 0.2) = 1.386, a parallel line shifted toward the pass side. Only the weights can change the boundary's direction, which is why fitting the model and choosing the threshold are separate jobs.</p>
  <p>Logistic regression is often described as "only able to learn straight boundaries". That is true only in the features you give it. The second half of the output uses two rings, one class inside the other, which no straight line can separate: plain logistic regression scores 0.457, worse than guessing. Adding the columns x₁², x₁x₂ and x₂² keeps the model linear in its weights, but its boundary in the original plane becomes a curve, and accuracy reaches 1.000. The learned weights, about −3.65 on x₁² and −3.55 on x₂² with the rest near zero, describe z ≈ c − 3.6(x₁² + x₂²), which is a circle. This is the same trick as in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>, and the idea that kernels automate in <a class="xref" data-note="ml_svm">Support Vector Machines</a>.</p>

  <h2 id="lg-coef"><span class="num">07</span>Odds Ratios</h2>
  <p>A teacher asks: "How much does one extra hour of study help?" Linear regression would answer with a single number of marks. For logistic regression the honest answer depends on the scale you choose: log-odds, odds or probability. Only two of them give a single number. Take the ten-student model and fix tests at 1:</p>
  <div class="fx" data-lang="py">m2 = LogisticRegression(C=np.inf).fit(X2, y2)
w1, w2 = m2.coef_[0]; b2 = m2.intercept_[0]
print(f"hours weight {w1:.3f} -&gt; odds ratio e^w = {np.exp(w1):.3f}")
for h in [3, 4, 5]:
    z = b2 + w1 * h + w2 * 1                           # tests fixed at 1
    print(f"  hours={h}, tests=1: z={z:+.3f}  odds={np.exp(z):.3f}  p={sigmoid(z):.3f}")
cols = ["mean radius", "mean texture", "worst concave points", "worst smoothness"]
clf = make_pipeline(StandardScaler(), LogisticRegression()).fit(Xa_tr[cols], ya_tr)   # y=1: benign
lr, sd = clf[-1], clf[0].scale_
print(pd.DataFrame({"coef per SD": lr.coef_[0], "odds ratio per SD": np.exp(lr.coef_[0]),
                    "1 SD =": sd, "coef per unit": lr.coef_[0] / sd}, index=cols).round(3))</div>
  <div class="fx" data-lang="text">hours weight 1.518 -&gt; odds ratio e^w = 4.563
  hours=3, tests=1: z=-1.493  odds=0.225  p=0.183
  hours=4, tests=1: z=+0.025  odds=1.025  p=0.506
  hours=5, tests=1: z=+1.543  odds=4.676  p=0.824
                      coef per SD  odds ratio per SD  1 SD =  coef per unit
mean radius                -3.034              0.048   3.609         -0.841
mean texture               -1.167              0.311   4.370         -0.267
worst concave points       -2.451              0.086   0.067        -36.654
worst smoothness           -0.827              0.437   0.023        -36.330</div>
  <p>Going from 3 to 4 to 5 hours, the log-odds rise by exactly 1.518 each time: on that scale every hour adds the same amount, w. The odds go 0.225 → 1.025 → 4.676, multiplied by e<sup>1.518</sup> = 4.56 each time: on that scale every hour multiplies by the same factor. That factor is the <strong>odds ratio</strong>, e<sup>w</sup>, and it is the standard way to explain a logistic regression weight: "each extra hour of study multiplies the odds of passing by 4.6, holding mock tests fixed". The reason it is constant is simple algebra: odds(x + 1) / odds(x) = e<sup>b + w(x+1)</sup> / e<sup>b + wx</sup> = e<sup>w</sup>. An odds ratio above 1 raises the odds, below 1 lowers them, and exactly 1 means no effect.</p>
  <p>The probability, by contrast, rises by different amounts depending on where you start. Here it rises by about 0.32 both times only because 3, 4 and 5 hours happen to straddle 50%; for a student already at p = 0.98, one more hour adds only about 0.02. For a small change the probability moves by approximately p(1 − p)·w, which is 0.25 × 1.518 = 0.38 per hour at p = 0.5 and much less near 0 or 1. Think of compound interest: a 5% rate always multiplies your balance by 1.05, like the odds ratio, but the rupees added depend on your current balance, like the probability change.</p>
  <p>The bottom half of the output shows a real dataset, breast-cancer measurements where y = 1 means benign. The features have very different units: one standard deviation of "mean radius" is 3.6 units, while one standard deviation of "worst smoothness" is 0.023. The raw per-unit coefficients (−0.84 against −36.3) cannot be compared, because one unit of smoothness is an enormous change. After <code>StandardScaler</code>, each coefficient means "per one standard deviation", and they can be ranked: mean radius (−3.03, odds ratio 0.048) matters most. One standard deviation more radius multiplies the odds of benign by 0.048, which is the same as multiplying the odds of malignant by about 21. Two cautions: with correlated features the individual coefficients can be unstable or even flip sign while predictions stay good, and coefficients from scikit-learn's default (penalised) fit are shrunk toward zero, so for formal inference use statsmodels (section 11). And as always, a coefficient describes association in this data, not cause and effect.</p>

  <h2 id="lg-multi"><span class="num">08</span>Multiclass: Softmax and One-vs-Rest</h2>
  <p>Everything so far has two classes. What if the school grades students as fail, pass or distinction, or a flower must be one of three species? There are two ways to extend logistic regression. <strong>One-vs-rest</strong> (OvR) trains K separate binary models ("distinction vs not", "pass vs not", "fail vs not"), each with its own sigmoid, and predicts the class whose model is most confident; its K probabilities do not naturally add up to 1, so they are divided by their sum. <strong>Softmax regression</strong> (multinomial logistic regression) is one joint model with K scores, zₖ = wₖ·x + bₖ, turned into K probabilities that add up to 1 by the <strong>softmax</strong> function:</p>
  <p style="text-align:center"><strong>P(y = k | x) = e<sup>zₖ</sup> / Σⱼ e<sup>zⱼ</sup></strong></p>
  <p>By hand, for a student with scores [2.0, 1.0, 0.1] for distinction, pass and fail: exponentiate to get 7.389, 2.718 and 1.105 (which makes everything positive and stretches the gaps), then divide by their total, 11.213, to get 0.659, 0.242 and 0.099. If the student actually got a plain pass, the loss is −ln(0.242) = 1.417, the same "minus log of the probability given to the truth" as binary log-loss; this multiclass version is called <strong>cross-entropy</strong>, and its gradient is again prediction minus target, times input. Two facts are worth knowing. Adding the same constant to every score changes nothing, so code subtracts the largest score before exponentiating to avoid overflow. And with K = 2, softmax is exactly the sigmoid of the difference of the two scores, which is why binary logistic regression needs only one weight vector.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_iris
from sklearn.multiclass import OneVsRestClassifier
z = np.array([2.0, 1.0, 0.1])                      # one student's scores: distinction, pass, fail
e = np.exp(z)
print("e^z =", e.round(3), " sum =", round(e.sum(), 3), " softmax =", (e / e.sum()).round(3))
print("cross-entropy if the truth is pass:", round(-np.log(e[1] / e.sum()), 3))
print("K=2 check: softmax", round(np.exp(1.5) / (np.exp(1.5) + np.exp(0.3)), 4), " sigmoid(1.5-0.3)", round(sigmoid(1.2), 4))
Xi, yi = load_iris(return_X_y=True)
soft = make_pipeline(StandardScaler(), LogisticRegression())                     # softmax (default)
ovr = make_pipeline(StandardScaler(), OneVsRestClassifier(LogisticRegression())) # 3 separate sigmoids
for name, mdl in [("softmax", soft), ("one-vs-rest", ovr)]:
    acc = cross_val_score(mdl, Xi, yi, cv=5).mean()
    pr = mdl.fit(Xi, yi).predict_proba(Xi[[70]])[0]
    print(f"{name:12s} CV accuracy {acc:.3f}  P(flower 70) = {pr.round(3)}")</div>
  <div class="fx" data-lang="text">e^z = [7.389 2.718 1.105]  sum = 11.213  softmax = [0.659 0.242 0.099]
cross-entropy if the truth is pass: 1.417
K=2 check: softmax 0.7685  sigmoid(1.5-0.3) 0.7685
softmax      CV accuracy 0.960  P(flower 70) = [0.012 0.44  0.548]
one-vs-rest  CV accuracy 0.927  P(flower 70) = [0.017 0.248 0.735]</div>
  <p>The first lines confirm the hand calculation and the K = 2 identity. On the iris flowers, softmax scores 0.960 in 5-fold cross-validation and one-vs-rest 0.927. For flower 70, a hard case that sits between two species, they disagree: softmax gives 0.44 and 0.548 to the two likely species, one-vs-rest gives 0.248 and 0.735. Softmax is scikit-learn's default for three or more classes and usually gives better-calibrated probabilities because they are fitted jointly. One-vs-rest is the right choice for <em>multilabel</em> problems, where a row can belong to several classes at once (an article about both sports and business): softmax would force those classes to compete, so use independent sigmoids via <code>OneVsRestClassifier</code>.</p>

  <h2 id="lg-reg"><span class="num">09</span>Regularization and C</h2>
  <p>Plain maximum likelihood has two weaknesses. With many features (30 tumour measurements, 10,000 words) it fits noise with large weights that carve up the training data and generalise badly. And, special to logistic regression, if a straight line separates the training classes perfectly, the loss keeps falling as the weights grow: every doubling of w pushes each p closer to exactly 0 or 1, so the "best" weights are infinite. The cure is the same as in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>: add a penalty for large weights. scikit-learn minimises</p>
  <p style="text-align:center"><strong>½‖w‖² + C · Σᵢ log-lossᵢ</strong> &nbsp; (L2, the default)</p>
  <p>Note where C sits: it multiplies the data term, not the penalty, so <strong>C is the inverse of the penalty strength</strong>, C = 1/λ. A small C means the penalty dominates and the weights are small (more bias); a large C means the data dominates; C = ∞ means no penalty. The intercept is not penalised, and since the data term is a sum over rows, the same C means relatively less penalty on a larger dataset. Think of C as how much you trust the training data: a teacher with a low C says "don't overreact to one test", while one with a huge C changes the whole grading scheme because of a single answer sheet.</p>
  <p>The penalty changes the condition at the optimum. Without it, the data gradient must be exactly zero. With it, the gradient of the whole objective is w + C·Σ(pᵢ − yᵢ)xᵢ = 0, so the data only has to balance the pull of the penalty. For the six students at C = 1, scikit-learn finds w = 0.767 and b = −2.685; plugging these in gives p = 0.128, 0.240, 0.405, 0.595, 0.760, 0.872, and Σ(p − y)·x = −0.765, so −C × (−0.765) ≈ 0.767 = w, as required. The model is deliberately left a little under-confident.</p>
  <div class="fx" data-lang="py">for C in [0.01, 0.1, 1, 10, np.inf]:
    m = LogisticRegression(C=C).fit(hours[:, None], passed)
    print(f"six students C={C:&lt;5} w={m.coef_[0, 0]:.3f}  b={m.intercept_[0]:+.3f}")
xs, ys = np.array([1, 2, 3, 4, 5, 6.]), np.array([0, 0, 0, 1, 1, 1])     # perfectly separable
print("separable data, w as C grows:",
      [round(float(LogisticRegression(C=C, max_iter=1000).fit(xs[:, None], ys).coef_[0, 0]), 1) for C in [1, 10, 100, 1e4]])
print("breast cancer, 30 features:")
for l1 in [0, 1]:
    for C in [0.01, 1, 100]:
        m = make_pipeline(StandardScaler(), LogisticRegression(C=C, l1_ratio=l1, solver="saga" if l1 else "lbfgs",
                                                               max_iter=5000, random_state=0)).fit(Xa_tr, ya_tr)
        print(f"  {'L1' if l1 else 'L2'} C={C:&lt;5} nonzero {np.sum(m[-1].coef_ != 0):2d}  "
              f"train {m.score(Xa_tr, ya_tr):.3f}  test {m.score(Xa_te, ya_te):.3f}")</div>
  <div class="fx" data-lang="text">six students C=0.01  w=0.034  b=-0.117
six students C=0.1   w=0.245  b=-0.859
six students C=1     w=0.767  b=-2.685
six students C=10    w=1.126  b=-3.940
six students C=inf   w=1.214  b=-4.249
separable data, w as C grows: [1.1, 2.7, 5.7, 13.0]
breast cancer, 30 features:
  L2 C=0.01  nonzero 30  train 0.953  test 0.951
  L2 C=1     nonzero 30  train 0.991  test 0.958
  L2 C=100   nonzero 30  train 0.998  test 0.951
  L1 C=0.01  nonzero  3  train 0.869  test 0.867
  L1 C=1     nonzero 13  train 0.988  test 0.958
  L1 C=100   nonzero 30  train 0.991  test 0.951</div>
  <p>Read the output from the top. As C falls from ∞ to 0.01, the six students' weight shrinks from 1.214 to 0.034, until the model hardly uses hours at all. On perfectly separable data (3 hours or fewer always fail, 4 or more always pass), the weight grows without limit as C grows (1.1, 2.7, 5.7, 13.0); only a penalty keeps it finite. On the 30-feature breast-cancer data with L2, all 30 weights stay non-zero; training accuracy rises with C (0.953 to 0.998) while test accuracy peaks at 0.958 and then falls back, which is the bias–variance trade-off in a few lines. With L1 (<code>l1_ratio=1</code>, which needs the <code>saga</code> or <code>liblinear</code> solver), many weights become exactly zero: only 3 features survive at C = 0.01 and 13 at C = 1, which is built-in feature selection. Values between 0 and 1 give elastic net. In practice choose C by cross-validation, for example with <code>LogisticRegressionCV</code>, and always scale the features first, because the penalty treats all weights alike: a feature measured in rupees (tiny weight) would barely be penalised while the same feature in lakh would be penalised heavily. In Bayesian terms L2 corresponds to a normal prior on the weights and L1 to a Laplace prior.</p>

  <h2 id="lg-imb"><span class="num">10</span>Class Imbalance</h2>
  <p>Suppose a school wants an early-warning system for the roughly 5% of students who will fail the board exam. The same shape appears in fraud, loan default and disease screening: the class you care about is a small fraction of the rows. Log-loss is an average over rows, so 95 easy negatives outvote 5 positives. The model learns a large negative intercept, most probabilities stay below 0.5, and at the 0.5 threshold it rarely flags anyone. Accuracy looks great (95% by always saying "no") while <strong>recall</strong>, the fraction of real positives the model catches, is poor; <strong>precision</strong> is the fraction of flagged rows that really are positive (both are covered in <a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</p>
  <p>There are two common fixes. The first is <code>class_weight="balanced"</code>, which gives each row of class k the weight n / (K·nₖ). With 2,838 negatives and 162 positives in 3,000 training rows, negatives get 3000 / (2 × 2838) = 0.529 and positives 3000 / (2 × 162) = 9.259, so each class carries the same total weight, as if every positive had been copied about 17.5 times. For logistic regression this mainly moves the intercept by about ln(17.5) = 2.86, which is the same as lowering the threshold. The second fix is to keep the ordinary model and simply lower the threshold. Here are both on 4,000 simulated students:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_classification
from sklearn.metrics import precision_score, recall_score
Xm, ym = make_classification(n_samples=4000, n_features=6, n_informative=3, weights=[0.95],
                             class_sep=0.8, flip_y=0.01, random_state=1)
Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.25, stratify=ym, random_state=0)
print("train counts:", np.bincount(ym_tr))
plain = make_pipeline(StandardScaler(), LogisticRegression()).fit(Xm_tr, ym_tr)
bal = make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced")).fit(Xm_tr, ym_tr)
p_plain, p_bal = plain.predict_proba(Xm_te)[:, 1], bal.predict_proba(Xm_te)[:, 1]
for name, p, thr in [("plain, threshold 0.5", p_plain, 0.5), ("balanced, threshold 0.5", p_bal, 0.5),
                     ("plain, threshold 0.10", p_plain, 0.10)]:
    pred = (p &gt;= thr).astype(int)
    print(f"{name:24s} precision {precision_score(ym_te, pred):.3f}  recall {recall_score(ym_te, pred):.3f}  mean p {p.mean():.3f}")
print(f"intercepts: plain {plain[-1].intercept_[0]:.3f}  balanced {bal[-1].intercept_[0]:.3f}")
print(f"true rate of the rare class in test: {ym_te.mean():.3f}")</div>
  <div class="fx" data-lang="text">train counts: [2838  162]
plain, threshold 0.5     precision 0.882  recall 0.278  mean p 0.056
balanced, threshold 0.5  precision 0.163  recall 0.741  mean p 0.345
plain, threshold 0.10    precision 0.246  recall 0.630  mean p 0.056
intercepts: plain -3.886  balanced -0.801
true rate of the rare class in test: 0.054</div>
  <p>The plain model at 0.5 catches only 27.8% of the failing students (though it is right 88% of the time when it does flag one). Balanced weights catch 74.1% but with precision 0.163. The intercept moved from −3.886 to −0.801, a shift of about 3.1, close to the predicted 2.86. Now look at the mean predicted probability: 0.056 for the plain model, matching the true rate of 0.054, but 0.345 for the balanced one. Class weights break calibration: the balanced model's outputs are no longer real probabilities. The third line keeps the plain, honest model and lowers the threshold to 0.10, reaching recall 0.630 with better precision (0.246) than the balanced model. So if you need real probabilities (for pricing or risk), move the threshold; use class weights when only rankings or labels matter. Resampling methods such as SMOTE change the training data instead (see <a class="xref" data-note="ml_features">Feature Engineering</a>) and must be applied inside cross-validation. Whatever you do, never judge an imbalanced model by accuracy.</p>

  <h2 id="lg-practice"><span class="num">11</span>sklearn and statsmodels in Practice</h2>
  <p>scikit-learn's <code>LogisticRegression</code> has a handful of settings that matter. <code>C</code> (default 1.0) is the inverse penalty strength; <code>np.inf</code> means no penalty. <code>l1_ratio</code> (default 0) chooses L2 (0), L1 (1) or elastic net (between); it replaces the older <code>penalty=</code> argument, which is deprecated. <code>solver</code> chooses the optimisation algorithm. <code>max_iter</code> (default 100) caps the iterations, and <code>class_weight</code> handles imbalance. The solvers differ in what they support: <code>lbfgs</code> (the default, quasi-Newton) handles L2 or no penalty; <code>newton-cholesky</code> uses the exact Hessian and is fast when there are many more rows than features; <code>newton-cg</code> suits medium data with many features; <code>liblinear</code> uses coordinate descent, supports L1 but only binary problems, and also penalises the intercept; <code>saga</code> supports every penalty and is meant for large datasets. The code fits several solvers on the 30 breast-cancer features, unscaled and scaled:</p>
  <div class="fx" data-lang="py">Xs_tr = StandardScaler().fit_transform(Xa_tr)
print("solver           iterations unscaled | scaled")
for solver in ["lbfgs", "liblinear", "newton-cg", "newton-cholesky", "saga"]:
    its = [int(np.max(LogisticRegression(solver=solver, random_state=0).fit(d, ya_tr).n_iter_)) for d in [Xa_tr.values, Xs_tr]]
    print(f"{solver:16s} {its[0]:5d}               | {its[1]:4d}")
m = LogisticRegression().fit(Xs_tr, ya_tr)
z = m.decision_function(Xs_tr[:3])
print("decision_function (z):", z.round(3))
print("sigmoid(z)           :", sigmoid(z).round(3))
print("predict_proba[:, 1]  :", m.predict_proba(Xs_tr[:3])[:, 1].round(3))
print("predict              :", m.predict(Xs_tr[:3]))</div>
  <div class="fx" data-lang="text">solver           iterations unscaled | scaled
lbfgs              100               |   18
liblinear           19               |    8
newton-cg           50               |    8
newton-cholesky      9               |    7
saga               100               |  100
decision_function (z): [ 6.266 -6.376  9.49 ]
sigmoid(z)           : [0.998 0.002 1.   ]
predict_proba[:, 1]  : [0.998 0.002 1.   ]
predict              : [1 0 1]</div>
  <p>On unscaled data (some features in the thousands, others around 0.1), <code>lbfgs</code> and <code>saga</code> hit the 100-iteration cap. After scaling, <code>lbfgs</code> needs 18 iterations and the Newton solvers 7 or 8; <code>saga</code> still needs more than 100 passes because it is designed for very large datasets, not 426 rows. So a <code>ConvergenceWarning</code> usually means "scale your features", not "raise max_iter". The last lines show how the three output methods relate: <code>decision_function</code> returns the score z, <code>predict_proba[:, 1]</code> is σ(z), and <code>predict</code> is "z &gt; 0", the 0.5 threshold. To use another threshold, compare <code>predict_proba</code> with it yourself. The usual setup is <code>make_pipeline(StandardScaler(), LogisticRegression(C=...))</code>, so that the scaler is fitted inside each cross-validation fold.</p>
  <p>scikit-learn answers "how well does it predict?". A doctor or economist also asks "is the effect of sleep real or just noise, and how sure are we about it?". That needs <strong>standard errors</strong>, <strong>p-values</strong> and <strong>confidence intervals</strong>, which statsmodels provides from an unpenalised maximum-likelihood fit. To check it, we simulate 400 students where the true log-odds are −6 + 0.8·hours + 0.5·sleep + 0·phone, so phone time truly has no effect:</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
rng = np.random.default_rng(42)
n = 400
df = pd.DataFrame({"hours": rng.uniform(0, 10, n).round(1),          # hours studied
                   "sleep": rng.uniform(4, 9, n).round(1),           # hours slept the night before
                   "phone": rng.uniform(0, 5, n).round(1)})          # hours on phone (true effect 0)
true_z = -6 + 0.8 * df.hours + 0.5 * df.sleep + 0.0 * df.phone
df["passed"] = (rng.random(n) &lt; sigmoid(true_z)).astype(int)
res = sm.Logit(df.passed, sm.add_constant(df[["hours", "sleep", "phone"]])).fit(disp=0)
print(res.summary().tables[1])
print(f"logLik={res.llf:.2f}  LL-Null={res.llnull:.2f}  pseudo R2={res.prsquared:.3f}  LLR p={res.llr_pvalue:.1e}")
ci = res.conf_int()
print(pd.DataFrame({"odds ratio": np.exp(res.params), "2.5%": np.exp(ci[0]), "97.5%": np.exp(ci[1])}).round(3))</div>
  <div class="fx" data-lang="text">==============================================================================
                 coef    std err          z      P&gt;|z|      [0.025      0.975]
------------------------------------------------------------------------------
const         -4.8110      0.817     -5.886      0.000      -6.413      -3.209
hours          0.7335      0.073     10.099      0.000       0.591       0.876
sleep          0.3409      0.098      3.486      0.000       0.149       0.533
phone          0.1043      0.100      1.048      0.295      -0.091       0.299
==============================================================================
logLik=-152.84  LL-Null=-254.37  pseudo R2=0.399  LLR p=9.2e-44
       odds ratio   2.5%  97.5%
const       0.008  0.002  0.040
hours       2.082  1.806  2.401
sleep       1.406  1.161  1.703
phone       1.110  0.913  1.349</div>
  <p>Read the hours row. <code>coef</code> 0.7335 is the maximum-likelihood weight (the truth was 0.8). <code>std err</code> 0.073 says how much that estimate would wobble across new samples; it comes from the inverse of the Hessian at the optimum. <code>z</code> = 0.7335 / 0.073 = 10.1 says how many standard errors the estimate is from zero, and <code>P&gt;|z|</code> is the chance of a value that extreme if the true weight were zero, here essentially nil. The 95% interval is coef ± 1.96 × std err = [0.591, 0.876]. Now the phone row: coef 0.104, z = 1.05, p = 0.295, and the interval [−0.091, 0.299] contains zero, so we cannot tell its effect from nothing, which is correct. Exponentiating the coefficients and interval ends gives odds ratios with confidence intervals: each extra hour multiplies the odds of passing by 2.08 (95% CI 1.81 to 2.40), while phone's interval 0.91 to 1.35 includes 1, "no effect". The model-level line compares the log-likelihood (−152.84) with that of an intercept-only model (−254.37): McFadden's pseudo R² = 1 − 152.84 / 254.37 = 0.399 (0.2 to 0.4 is already a good fit), and the likelihood-ratio test's tiny p-value says the features together clearly help. These numbers only make sense for unpenalised fits with more rows than features, no perfect separation and no near-duplicate features.</p>

  <h2 id="lg-compare"><span class="num">12</span>Strengths and Comparisons</h2>
  <p>Logistic regression's strengths are honest probabilities out of the box (it directly minimises log-loss), coefficients with a clear meaning and statistical tests, very fast training and prediction (one dot product), the ability to handle millions of sparse features such as words in text, and a convex loss with no bad local minima. Its weaknesses are straight boundaries unless you engineer features, no automatic interactions, the need for scaling and encoding, unstable coefficients with correlated features, and infinite weights on separable data without a penalty. To see these in action, here are several classifiers on the "two moons" dataset, two curved, interleaved half-circles with noise, scored by test accuracy and test log-loss (lower is better):</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import log_loss
Xo, yo = make_moons(n_samples=600, noise=0.3, random_state=0)       # two interleaved half-circles
Xo_tr, Xo_te, yo_tr, yo_te = train_test_split(Xo, yo, test_size=0.3, random_state=0)
models = {"Logistic": LogisticRegression(),
          "Logistic + poly(3)": make_pipeline(PolynomialFeatures(3), StandardScaler(), LogisticRegression()),
          "Gaussian NB": GaussianNB(), "KNN k=15": KNeighborsClassifier(15),
          "Tree depth 4": DecisionTreeClassifier(max_depth=4, random_state=0)}
print(f"{'model':19s} test acc  test log-loss")
for name, mdl in models.items():
    p = make_pipeline(StandardScaler(), mdl).fit(Xo_tr, yo_tr)
    print(f"{name:19s} {p.score(Xo_te, yo_te):.3f}     {log_loss(yo_te, p.predict_proba(Xo_te)):.3f}")</div>
  <div class="fx" data-lang="text">model               test acc  test log-loss
Logistic            0.844     0.374
Logistic + poly(3)  0.872     0.294
Gaussian NB         0.856     0.378
KNN k=15            0.889     1.193
Tree depth 4        0.861     2.754</div>
  <p>Plain logistic regression is limited by its straight boundary (accuracy 0.844), but its log-loss of 0.374 is respectable: its probabilities are honest even when its boundary is too simple. Adding cubic features lifts it to 0.872 and the best log-loss of all, 0.294. KNN has the best accuracy but a poor log-loss (1.193), because its vote shares include hard 0s and 1s that are sometimes wrong, and the depth-4 tree is worse still for the same reason.</p>
  <table class="tbl">
    <tr><th></th><th>Logistic regression</th><th>Naive Bayes</th><th>KNN</th><th>SVM</th><th>Tree / boosting</th></tr>
    <tr><td>Approach</td><td>models P(y | x) directly</td><td>models P(x | y) and P(y), uses Bayes' rule</td><td>votes of nearest rows</td><td>widest-margin boundary</td><td>rule-based splits</td></tr>
    <tr><td>Boundary</td><td>linear in the features</td><td>linear or quadratic</td><td>any shape</td><td>linear or kernel-curved</td><td>axis-aligned boxes</td></tr>
    <tr><td>Probabilities</td><td>good</td><td>too extreme</td><td>coarse</td><td>need calibration</td><td>tree coarse, boosting decent</td></tr>
    <tr><td>Needs scaling</td><td>yes</td><td>no</td><td>yes</td><td>yes</td><td>no</td></tr>
    <tr><td>Interpretability</td><td>odds ratios, p-values</td><td>per-feature likelihoods</td><td>similar cases</td><td>weak</td><td>rules, SHAP</td></tr>
  </table>
  <p>Compared with its parent, linear regression, it keeps the weighted sum and the "prediction minus target, times input" gradient, but adds a sigmoid, swaps squared error for log-loss, loses the closed-form solution and reads its coefficients on the log-odds scale. <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> is its generative twin: under its assumptions it produces log-odds of the same linear form, but gets the weights by counting rather than fitting. <a class="xref" data-note="ml_svm">Support Vector Machines</a> also learn a hyperplane, but with hinge loss, so points well beyond the margin contribute nothing, while in logistic regression every point contributes a little. Logistic regression is also a one-layer neural network with a sigmoid output, and softmax regression is the last layer of every deep classifier; gradient boosting for classification minimises this same log-loss, fitting each tree to the gradient p − y. Use logistic regression when you need probabilities or explanations (credit scoring, medicine, regulated domains), as the first baseline on any tabular yes/no problem, for high-dimensional sparse text, or as a calibrator on top of other models. Reach for trees and boosting when the signal is strongly nonlinear and interactive.</p>

  <h2 id="lg-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common surprise is forgetting that scikit-learn penalises by default. <code>LogisticRegression()</code> uses C = 1, so its coefficients are shrunk and will not match a textbook, statsmodels or R:</p>
  <div class="fx" data-lang="py">print("LogisticRegression()       w =", LogisticRegression().fit(hours[:, None], passed).coef_.round(3))
print("LogisticRegression(C=inf)  w =", LogisticRegression(C=np.inf).fit(hours[:, None], passed).coef_.round(3))</div>
  <div class="fx" data-lang="text">LogisticRegression()       w = [[0.767]]
LogisticRegression(C=inf)  w = [[1.214]]</div>
  <p>The six students' weight is 0.767 with the default and 1.214 without a penalty. If you want plain maximum likelihood, pass <code>C=np.inf</code> or use statsmodels. Because the penalty does not scale with n, the default fit's coefficients also change when you add rows.</p>
  <p>Close behind is reading a weight as a change in probability. A weight of 1.5 means +1.5 in log-odds, or odds multiplied by e<sup>1.5</sup> = 4.5; the change in probability is about p(1 − p)·w and depends on the row. Comparing raw coefficients of features in different units is the related mistake: scale first, then compare.</p>
  <p>Not scaling features causes three problems at once: convergence warnings (section 11), unfair penalties (section 09) and incomparable coefficients. Put <code>StandardScaler</code> in a pipeline with the model, fitted on training folds only.</p>
  <p>Using 0.5 as the threshold out of habit is another. 0.5 is right only when false positives and false negatives cost the same and the probabilities are calibrated. Choose the threshold from the costs or from a precision or recall target. Relatedly, after <code>class_weight="balanced"</code>, <code>predict_proba</code> is inflated (mean 0.345 against a true rate of 0.054 in section 10), so do not report it as a risk without recalibrating.</p>
  <p>Huge coefficients and huge standard errors usually signal perfect separation: some feature, or combination, splits the classes perfectly. Often it is a leaked feature, such as an "account closed date" column used to predict churn. Check for leakage first, then add a penalty. With one-hot encoding, including all K categories plus an intercept makes the columns perfectly collinear; scikit-learn copes because of the penalty, but statsmodels fails or gives meaningless standard errors, so drop one level for inference. Finally, do not use softmax when a row can belong to several classes, and do not claim logistic regression cannot handle curved boundaries: with polynomial or interaction features it can (the rings went from 0.457 to 1.000).</p>

  <h2 id="lg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Classification</b>: predicting a category; binary (2 classes), multiclass (one of K), multilabel (any subset).</li>
    <li><b>Odds</b> p / (1 − p); <b>log-odds / logit</b> ln(p / (1 − p)), any real number.</li>
    <li><b>Sigmoid</b> σ(z) = 1 / (1 + e⁻ᶻ): inverse of the logit; σ(0) = 0.5, σ(−z) = 1 − σ(z), slope σ(1 − σ) ≤ 0.25.</li>
    <li><b>Logistic regression</b>: P(y = 1 | x) = σ(w·x + b); linear in the log-odds.</li>
    <li><b>Log-loss</b>: −(1/n)Σ[y ln p + (1 − y) ln(1 − p)] = negative log-likelihood per row; convex.</li>
    <li><b>Decision boundary</b>: w·x + b = logit(threshold); a hyperplane.</li>
    <li><b>Odds ratio</b>: e<sup>w</sup>, the factor by which one more unit multiplies the odds.</li>
    <li><b>Softmax</b>: pₖ = e<sup>zₖ</sup> / Σe<sup>zⱼ</sup>; cross-entropy loss.</li>
    <li><b>C</b>: inverse penalty strength in scikit-learn (C = 1/λ).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Formula</th></tr>
    <tr><td>Gradient</td><td>∂L/∂w = (1/n)Xᵀ(p − y), ∂L/∂b = mean(p − y)</td></tr>
    <tr><td>Hessian / Newton</td><td>H = XᵀSX, S = diag(p(1 − p)); θ ← θ − H⁻¹g</td></tr>
    <tr><td>Probability change</td><td>Δp ≈ p(1 − p)·w</td></tr>
    <tr><td>sklearn objective</td><td>½‖w‖² + C·Σ log-loss (L2); ‖w‖₁ + C·Σ log-loss (L1)</td></tr>
    <tr><td>Balanced weights</td><td>n / (K·nₖ); intercept shifts by ≈ ln(w₁/w₀)</td></tr>
    <tr><td>Wald test, CI</td><td>z = coef / se; CI = coef ± 1.96·se; odds-ratio CI = e<sup>CI</sup></td></tr>
    <tr><td>Pseudo R² (McFadden)</td><td>1 − LL / LL₀</td></tr>
  </table>
  <h3>The six students</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Least-squares line</td><td>−0.2 + 0.2·hours (−0.2 at 0 h, 1.8 at 10 h)</td></tr>
    <tr><td>Fitted (no penalty)</td><td>w = 1.214, b = −4.249, boundary 3.50 h, odds ratio 3.37 per hour</td></tr>
    <tr><td>Probabilities</td><td>0.046, 0.139, 0.353, 0.647, 0.861, 0.954</td></tr>
    <tr><td>Log-loss</td><td>0.413 (know-nothing model 0.693)</td></tr>
    <tr><td>First GD step (rate 0.5)</td><td>gradient −0.583 → w = 0.292</td></tr>
    <tr><td>sklearn default C = 1</td><td>w = 0.767, b = −2.685</td></tr>
    <tr><td>Ten students</td><td>z = −7.14 + 1.52·hours + 1.10·tests; odds ratio 4.56 per hour</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, LogisticRegressionCV

clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0))          # L2, lbfgs
sparse = LogisticRegression(C=0.1, l1_ratio=1, solver="saga")             # L1
cv = LogisticRegressionCV(Cs=10, cv=5)                                    # tune C
# clf.predict_proba(X)[:, 1], clf.decision_function(X), clf[-1].coef_, clf[-1].intercept_
# statsmodels: sm.Logit(y, sm.add_constant(X)).fit().summary()</div>
  <h3>Gotchas</h3>
  <ul>
    <li>scikit-learn penalises by default (C = 1); use C=np.inf or statsmodels for plain MLE.</li>
    <li>A weight is a change in log-odds, not probability.</li>
    <li>Scale features: convergence, fair penalties, comparable coefficients.</li>
    <li>0.5 is not a law; class_weight inflates predict_proba.</li>
    <li>Huge coefficients and SEs → perfect separation, often leakage.</li>
    <li>Softmax for mutually exclusive classes; independent sigmoids for multilabel.</li>
  </ul>

  <h2 id="lg-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Is logistic regression a regression or a classification model?</summary><div class="qa-body">It is a classification model. It is called regression because it fits a linear model to the log-odds of the positive class; the sigmoid then turns the log-odds into a probability, and a threshold turns the probability into a class.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use linear regression for a 0/1 target?</summary><div class="qa-body">Its predictions are unbounded, so they are not probabilities (−0.2 at 0 hours and 1.8 at 10 hours for our students). Squared error punishes predictions that are "too right", so a far-away easy point tilts the line and moves the cut-off (3.50 to 4.16 hours after adding one 20-hour student). And it assumes a constant effect on probability instead of a saturating one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the sigmoid from the log-odds.</summary><div class="qa-body">Set ln(p / (1 − p)) = z. Then p / (1 − p) = eᶻ, so p = eᶻ(1 − p), p(1 + eᶻ) = eᶻ, and p = eᶻ / (1 + eᶻ) = 1 / (1 + e⁻ᶻ). The sigmoid is simply the inverse of the logit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the log-loss from maximum likelihood.</summary><div class="qa-body">Each label is Bernoulli: P(yᵢ) = pᵢ<sup>yᵢ</sup>(1 − pᵢ)<sup>1−yᵢ</sup>. Independence gives the likelihood as the product over rows. Taking logs turns the product into a sum without changing the best weights; negating turns maximisation into minimisation; dividing by n gives the average −(1/n)Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the gradient of the log-loss. Why is it so simple?</summary><div class="qa-body">By the chain rule, ∂ℓ/∂p = (p − y)/(p(1 − p)), ∂p/∂z = p(1 − p) and ∂z/∂w = x. The p(1 − p) cancels, leaving ∂ℓ/∂w = (p − y)x, so the full gradient is (1/n)Xᵀ(p − y). It mirrors linear regression's (ŷ − y)x because the sigmoid is the natural ("canonical") link for the Bernoulli likelihood.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is mean squared error a bad loss for logistic regression?</summary><div class="qa-body">Passed through a sigmoid it is not convex, so optimisation can get stuck. Its gradient 2(p − y)p(1 − p) almost vanishes when the model is confidently wrong (0.0196 at p = 0.01 for a true 1, against 0.990 for log-loss), so training stalls exactly where it should push hardest. And it caps the penalty for a confident mistake at 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is there a closed-form solution? How is it trained?</summary><div class="qa-body">No, because the weights sit inside the sigmoid in the zero-gradient equation. It is trained iteratively: gradient descent, Newton's method / IRLS using the Hessian XᵀSX (a handful of steps), L-BFGS (scikit-learn's default), coordinate descent (liblinear) or SAG/SAGA for large data. The loss is convex, so they all reach the same optimum.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you interpret a coefficient of 0.7 on "hours"?</summary><div class="qa-body">Each extra hour, holding the other features fixed, adds 0.7 to the log-odds of passing, which multiplies the odds by e<sup>0.7</sup> ≈ 2.01. The change in probability depends on the starting point: about 0.25 × 0.7 = 0.175 near p = 0.5, and much less near 0 or 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the decision boundary, and what happens when you change the threshold?</summary><div class="qa-body">It is the set of points where w·x + b = logit(t); for t = 0.5 that is w·x + b = 0, a hyperplane. Changing the threshold shifts it parallel to itself; it never rotates it. Curved boundaries need transformed features such as squares or interactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens with perfectly separable data?</summary><div class="qa-body">The likelihood keeps increasing as the weights grow, so the maximum-likelihood estimate does not exist: the weights run to infinity (they grew 1.1 → 13 as C increased on our separable example). statsmodels reports separation and huge standard errors. Fix it with a penalty, and check for target leakage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does C mean in scikit-learn, and how do L1 and L2 differ?</summary><div class="qa-body">scikit-learn minimises penalty + C × Σ log-loss, so C is the inverse of the regularization strength: small C means strong shrinkage. L2 shrinks all weights smoothly; L1 drives some exactly to zero, performing feature selection (3 of 30 kept at C = 0.01 on breast cancer); elastic net mixes them. Choose C by cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Softmax or one-vs-rest?</summary><div class="qa-body">One-vs-rest trains K binary models and normalises their probabilities afterwards; softmax trains one model whose K probabilities sum to 1 by construction and minimises cross-entropy. Softmax is the default for mutually exclusive classes and is usually better calibrated (0.960 against 0.927 on iris). One-vs-rest, or independent sigmoids, suits multilabel problems. With K = 2 softmax reduces to the sigmoid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does class_weight="balanced" work, and what does it cost?</summary><div class="qa-body">Each row of class k is weighted n/(K·nₖ), so every class carries equal total weight. For logistic regression this mainly shifts the intercept by about ln(w₁/w₀), which is equivalent to lowering the threshold. The cost is calibration: predicted probabilities are inflated (mean 0.345 against a true rate of 0.054), so if you need real probabilities, lower the threshold on the unweighted model instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Read a statsmodels row: coef 0.10, std err 0.10, P&gt;|z| 0.30.</summary><div class="qa-body">z = 0.10 / 0.10 = 1, so the estimate is one standard error from zero. A p-value of 0.30 means data like this is common even if the true effect is zero, the 95% interval (about −0.10 to 0.30) includes zero, and the odds-ratio interval includes 1. We cannot claim an effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be scaled for logistic regression?</summary><div class="qa-body">Three reasons: the penalty treats all weights alike, so unscaled features are penalised unfairly; gradient-based solvers converge slowly on badly scaled data (lbfgs hit its 100-iteration cap unscaled and needed 18 iterations scaled); and coefficients on different scales cannot be compared. The unpenalised model's predictions would not change, but in practice the model is almost always penalised.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is logistic regression related to Naive Bayes?</summary><div class="qa-body">They are a discriminative/generative pair. Gaussian Naive Bayes with shared variances, or multinomial Naive Bayes, produces log-odds that are linear in x, the same form as logistic regression. Naive Bayes estimates the weights by counting P(x | y) under an independence assumption, which works well with little data; logistic regression fits them directly to maximise P(y | x), which is usually better with more data and better calibrated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does logistic regression compare with an SVM?</summary><div class="qa-body">Both learn a linear boundary (and both can use kernels or engineered features for curves). Logistic regression minimises log-loss, so every point contributes and it outputs probabilities. A linear SVM minimises hinge loss, so only points near or inside the margin matter, and it outputs a score that needs calibration to become a probability.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does logistic regression's log-loss reappear elsewhere?</summary><div class="qa-body">Gradient boosting for classification minimises the same log-loss on the log-odds scale, fitting each new tree to the negative gradient y − p. A neural-network classifier ends with a softmax layer trained by cross-entropy, so its last layer is a softmax regression on learned features. And Platt scaling, used to calibrate other models, is a one-feature logistic regression.</div></details>
</main>
`
});
