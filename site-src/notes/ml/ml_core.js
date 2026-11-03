// notes/ml/ml_core.js — Bias, Variance & Generalization
Object.assign(TOPIC_CONTENT, {
  "ml_core": `<main>
  <h1>Bias, Variance &amp; Generalization</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Bias, Variance &amp; Generalization</span></div>
  <p class="lead">A model is only useful on rows it has never seen, and the previous note showed how to measure that honestly. This note explains <em>why</em> a model that looks perfect on its training data can fail on new data, and what to do about it. The central idea is the bias–variance trade-off: every model's error on new data is made of three parts, one from being too rigid, one from being too sensitive to the particular sample it learned from, and one that no model can remove. Knowing which part is hurting you tells you whether to collect more data, use a bigger model, add features or regularise, which saves weeks of wasted effort in real projects and is one of the most common topics in ML interviews. The running example is again <strong>ten flats in Pune</strong>, priced by area, plus four new flats sold the following month that we use as unseen data; a simulated sine wave shows the same ideas where the true pattern is curved.</p>

  <h2 id="bv-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Bias, Variance &amp; Generalization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The goal</div>
        <ul>
          <li><b>Generalization</b>: low error on new rows</li>
          <li>Gap = test error − training error</li>
          <li><b>Underfit</b>: both errors high; <b>overfit</b>: training low, test high</li>
          <li><b>Capacity</b>: how many patterns a model can fit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The decomposition</div>
        <ul>
          <li>Test MSE = <b>bias²</b> + <b>variance</b> + <b>noise</b></li>
          <li>Bias: the average model misses the truth</li>
          <li>Variance: models from different samples disagree</li>
          <li>Noise: the floor no model beats with these features</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Seeing it on real data</div>
        <ul>
          <li><b>Learning curve</b>: error vs amount of data</li>
          <li><b>Validation curve</b>: error vs one capacity knob</li>
          <li>Avoidable bias = train − baseline; variance = val − train</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fixes</div>
        <ul>
          <li>High bias: bigger model, better features, less regularisation</li>
          <li>High variance: more data, regularise, simpler model, bagging</li>
          <li>More data never fixes bias</li>
          <li>Double descent: huge models can generalise again</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="bv-gen"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Generalization</span><span class="rm-sub">what we are really trying to be good at</span></div></div>
      <div class="rm-item rm-done" data-target="bv-uo"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Underfitting and Overfitting</span><span class="rm-sub">too rigid and too flexible</span></div></div>
      <div class="rm-item rm-done" data-target="bv-cap"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Model Capacity</span><span class="rm-sub">the flexibility dial in every model</span></div></div>
      <div class="rm-item rm-done" data-target="bv-derive"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Bias–Variance Decomposition</span><span class="rm-sub">splitting test error into three parts</span></div></div>
      <div class="rm-item rm-done" data-target="bv-sim"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Measuring Bias and Variance</span><span class="rm-sub">simulating many training sets</span></div></div>
      <div class="rm-item rm-done" data-target="bv-curve"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Bias–Variance Trade-off</span><span class="rm-sub">the U-curve and the sweet spot</span></div></div>
      <div class="rm-item rm-done" data-target="bv-noise"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Irreducible Error</span><span class="rm-sub">noise, missing features, Bayes error</span></div></div>
      <div class="rm-item rm-done" data-target="bv-lc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Learning Curves</span><span class="rm-sub">will more data help?</span></div></div>
      <div class="rm-item rm-done" data-target="bv-vc"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Validation Curves</span><span class="rm-sub">which setting of the knob?</span></div></div>
      <div class="rm-item rm-done" data-target="bv-fix"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Diagnosing and Fixing</span><span class="rm-sub">high bias vs high variance</span></div></div>
      <div class="rm-item rm-done" data-target="bv-dd"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Double Descent</span><span class="rm-sub">why huge models still work</span></div></div>
      <div class="rm-item rm-done" data-target="bv-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">choosing by training score, buying data</span></div></div>
      <div class="rm-item rm-done" data-target="bv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, fix table, curve reading</span></div></div>
      <div class="rm-item rm-done" data-target="bv-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on this topic</span></div></div>
    </div>
  </div>

  <h2 id="bv-gen"><span class="num">01</span>Generalization</h2>
  <p>The portal fitted its price model on last year's sales. Nobody cares how well it prices <em>those</em> flats, because their prices are already known. The model only earns money on next month's listings. The ability of a model to do well on new rows from the same source is called <strong>generalization</strong>, and it is the only thing that really matters in machine learning. The difficulty is that a model is built by making it good on its training rows, and being good on the training rows is not the same thing as being good on new rows. This whole note is about the difference.</p>
  <p>Think of two students preparing for an exam with last year's paper. Ravi learns every answer by heart, word for word. Asha works through each chapter until she understands it. On last year's paper both score 100. On this year's paper, with new questions on the same syllabus, Asha still does well and Ravi collapses. Last year's paper could not tell them apart; only new questions could.</p>
  <p>Models behave the same way. The ten flats A–J (area in hundreds of sq ft, price in ₹ lakh) are our training rows, and the following month four more flats sell, which we keep as new rows to test on:</p>
  <table class="tbl">
    <tr><th></th><th colspan="10">training flats A–J</th><th colspan="4">new flats K–N</th></tr>
    <tr><td>area x</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>6.4</td><td>8.7</td><td>10.3</td><td>13.6</td></tr>
    <tr><td>price y</td><td>38</td><td>49</td><td>53</td><td>56</td><td>67</td><td>68</td><td>73</td><td>83</td><td>87</td><td>96</td><td>47</td><td>64</td><td>70</td><td>93</td></tr>
  </table>
  <p>Compare Ravi and Asha as models. Ravi is the <strong>memoriser</strong>: "for a new flat, copy the price of the training flat with the closest area" (a 1-nearest-neighbour model). On the training flats it returns their own stored prices, so every training error is zero. For K (6.4) it copies B (6) and says 49, against a true 47; for L (8.7) it copies E and says 67 (true 64); for M (10.3) it copies F, 68 (true 70); for N (13.6) it copies J, 96 (true 93). The errors are −2, −3, +2, −3, whose squares average (4 + 9 + 4 + 9) / 4 = 6.5. Asha is the straight line price = 6 × area + 10 from <a class="xref" data-note="ml_intro">What is Machine Learning</a>, whose training MSE is 4.6.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

X_tr = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)   # the ten flats A..J
y_tr = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
X_new = np.array([[6.4], [8.7], [10.3], [13.6]])                       # new flats K, L, M, N
y_new = np.array([47, 64, 70, 93])

memo = KNeighborsRegressor(n_neighbors=1).fit(X_tr, y_tr)   # "copy the price of the nearest flat"
line = LinearRegression().fit(X_tr, y_tr)
for name, m in [("memoriser", memo), ("line", line)]:
    tr = ((m.predict(X_tr) - y_tr) ** 2).mean()
    te = ((m.predict(X_new) - y_new) ** 2).mean()
    print(f"{name:9s} predictions for K..N {m.predict(X_new).round(1)}  train MSE {tr:.2f}  new-flat MSE {te:.2f}")</div>
  <div class="fx" data-lang="text">memoriser predictions for K..N [49. 67. 68. 96.]  train MSE 0.00  new-flat MSE 6.50
line      predictions for K..N [48.4 62.2 71.8 91.6]  train MSE 4.60  new-flat MSE 2.60</div>
  <p>The memoriser wins on the training data (0 against 4.6) and loses on the new flats (6.50 against 2.60). If you had picked the model by training error, you would have picked the wrong one. Two terms name what we measured. <strong>Training error</strong> is the average loss on the rows the model learned from; it is cheap to compute and always too optimistic. <strong>Test error</strong> (or generalization error) is the expected loss on new rows from the same source; it is what we care about, and we estimate it on held-out data. Their difference, test error minus training error, is the <strong>generalization gap</strong>: a large gap means the model learned things about its training rows that are not true in general. The line's gap is actually negative here (2.6 below 4.6), only because four test flats are a small, lucky sample; on average a model does worse on new rows than on its own, and leave-one-out on the ten flats (MSE 7.25 against 4.6, from the previous note) shows the usual direction.</p>
  <p>All of this rests on one assumption: new rows come from the same source as the training rows. The formal phrase is that the rows are <strong>i.i.d.</strong>, independent and identically distributed draws from the same unknown distribution. Learning from the past only works if the future looks like the past. When that breaks, because a new metro line opens or a policy changes, error measured on old held-out data stops predicting live error; that is the drift described in <a class="xref" data-note="ml_intro">What is Machine Learning</a>. The rest of this note assumes the future does look like the past, and asks why some models still fail on it.</p>

  <h2 id="bv-uo"><span class="num">02</span>Underfitting and Overfitting</h2>
  <p>The memoriser failed by being too flexible: it followed every detail of its training flats. A model can also fail the opposite way. <strong>Underfitting</strong> means the model is too simple to capture the real pattern, so it is wrong on training rows and new rows alike, in a systematic way. <strong>Overfitting</strong> means the model is flexible enough to follow the random noise in its training rows, so it looks excellent on them and fails on new rows. In between is a model flexible enough for the pattern but not for the noise. A tailor makes the point well. Underfitting is selling you a "free size" shirt that fits nobody properly. Overfitting is measuring you just after a heavy lunch and cutting the shirt round the bulge, so it never fits again. A good tailor measures your real shape and ignores today's accident.</p>
  <p>Polynomials give a clean way to watch both failures, because their flexibility is controlled by one number, the degree. Degree 0 is a constant, degree 1 a straight line, degree 2 a parabola, and each extra degree adds one more coefficient the curve can bend with. Start with just three flats, D (8, 56), E (9, 67) and F (10, 68), and keep flat H (12, 83) aside as the new point. To keep the arithmetic small, measure area from 9: u = x − 9, so D, E, F sit at u = −1, 0, 1 and H at u = 3.</p>
  <p>The best constant (degree 0) is the mean, (56 + 67 + 68) / 3 = 63.67. Its training errors are −7.67, 3.33 and 4.33, an MSE of 29.6, and it predicts 63.67 for H, a squared error of (83 − 63.67)² = 373.8. The best line (degree 1) has slope [(−1)(−7.67) + 0 + (1)(4.33)] / [1 + 0 + 1] = 12 / 2 = 6 and intercept 63.67; its training MSE is 5.6 and it predicts 63.67 + 6 × 3 = 81.67 for H, a squared error of only 1.78. The parabola (degree 2) has three coefficients and there are three points, so it can pass through all of them exactly. Writing y = a + b·u + c·u², the point at u = 0 gives a = 67; u = 1 gives 67 + b + c = 68; u = −1 gives 67 − b + c = 56. Adding the last two, 134 + 2c = 124, so c = −5 and b = 6. Training MSE is 0, but for H it predicts 67 + 18 − 45 = 40, a squared error of 1,849.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([8, 9, 10]); y = np.array([56, 67, 68])     # three flats D, E, F
x_new, y_new = 12, 83                                     # flat H, not used for fitting
for deg in [0, 1, 2]:
    c = np.polyfit(x - 9, y, deg)                         # least squares in u = x - 9
    train = ((np.polyval(c, x - 9) - y) ** 2).mean()
    pred = np.polyval(c, x_new - 9)
    print(f"degree {deg}: coefs {np.round(c, 3)}  train MSE {train:6.3f}  "
          f"prediction for H {pred:6.2f}  squared error {(pred - y_new) ** 2:8.2f}")</div>
  <div class="fx" data-lang="text">degree 0: coefs [63.667]  train MSE 29.556  prediction for H  63.67  squared error   373.78
degree 1: coefs [ 6.    63.667]  train MSE  5.556  prediction for H  81.67  squared error     1.78
degree 2: coefs [-5.  6. 67.]  train MSE  0.000  prediction for H  40.00  squared error  1849.00</div>
  <p><code>np.polyfit</code> lists coefficients from the highest power down, so <code>[-5. 6. 67.]</code> is −5u² + 6u + 67, exactly what we solved. Training error falls steadily as the degree grows (29.6, then 5.6, then 0), but the error on the new flat does not: the "perfect" parabola bends down to follow E's slightly high price and F's slightly low one, and ends up pricing a 1,200 sq ft flat at ₹40 lakh. The same experiment on all ten flats, scored on the four new flats K–N:</p>
  <div class="fx" data-lang="py">import numpy as np
x_tr = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]); y_tr = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
x_new = np.array([6.4, 8.7, 10.3, 13.6]);             y_new = np.array([47, 64, 70, 93])   # flats K..N

print("degree  train MSE  new-flat MSE   predictions for K, L, M, N")
for d in range(10):
    p = np.polynomial.Polynomial.fit(x_tr, y_tr, d)       # least-squares polynomial of degree d
    tr = ((p(x_tr) - y_tr) ** 2).mean()
    te = ((p(x_new) - y_new) ** 2).mean()
    print(f"{d:6d} {tr:9.3f} {te:12.3f}   {np.round(p(x_new), 1)}")</div>
  <div class="fx" data-lang="text">degree  train MSE  new-flat MSE   predictions for K, L, M, N
     0   301.600      273.500   [67. 67. 67. 67.]
     1     4.600        2.600   [48.4 62.2 71.8 91.6]
     2     4.472        2.468   [48.5 61.8 71.4 92. ]
     3     3.316        2.206   [49.4 62.5 70.7 92.6]
     4     3.119        3.242   [50.  62.1 70.4 92.7]
     5     2.924        4.719   [50.5 61.7 70.8 92.2]
     6     2.681        4.477   [50.5 62.  71.1 93.2]
     7     1.659        4.261   [49.5 63.3 69.7 89.8]
     8     0.527       32.484   [51.8 63.3 69.6 82.7]
     9     0.000       23.418   [55.3 64.6 68.3 97.6]</div>
  <p>Degree 0 always says ₹67 lakh: training MSE 301.6, new-flat MSE 273.5. That is underfitting, wrong for every flat that is not mid-sized, in the same direction for small and big flats. Degrees 1 to 3 have training errors of 3.3 to 4.6 and new-flat errors of 2.2 to 2.6: a good fit. (Degree 3 edges out the line on these four flats, but section 09 shows that leave-one-out on all ten flats clearly prefers the line; four test flats are a noisy judge.) Degrees 8 and 9 have training errors of 0.5 and exactly 0, because degree 9 has ten coefficients for ten flats and passes through every one, while their new-flat errors jump to 32.5 and 23.4. That is overfitting: degree 8 prices flat N at ₹82.7 lakh against a true ₹93 lakh.</p>
  <p>The flats are nearly straight, so they show only part of the picture. A controlled experiment where the true pattern is curved shows the whole shape. We generate data ourselves from y = sin(2πx) + noise, with noise of standard deviation 0.3, so its variance is 0.09. Because we know the truth, we know that no model can get below an MSE of 0.09 on new data; that much is pure noise. This small helper file is used by every sine experiment in the note:</p>
  <div class="fx" data-lang="py"># sine.py: a world where we know the truth
import numpy as np

def f(x):                       # the true pattern (unknown in real life)
    return np.sin(2 * np.pi * x)

SIGMA = 0.3                     # noise standard deviation, so the noise variance is 0.09

def sample(n, rng):
    x = rng.uniform(0, 1, n)
    return x[:, None], f(x) + rng.normal(0, SIGMA, n)</div>
  <p>Take 10 training rows at evenly spaced x, 1,000 fresh rows to judge on, and fit polynomials of degree 0 to 9. (<code>Polynomial.fit</code> is NumPy's least-squares polynomial fit.)</p>
  <div class="fx" data-lang="py">import numpy as np
from sine import f, SIGMA

rng = np.random.default_rng(2)
x_tr = np.linspace(0, 1, 10)                       # 10 training rows
y_tr = f(x_tr) + rng.normal(0, SIGMA, 10)
x_val = rng.uniform(0, 1, 1000)                    # 1,000 fresh rows to judge on
y_val = f(x_val) + rng.normal(0, SIGMA, 1000)

print("degree  train MSE  val MSE")
for d in range(10):
    p = np.polynomial.Polynomial.fit(x_tr, y_tr, d)
    print(f"{d:6d} {((p(x_tr) - y_tr) ** 2).mean():9.3f} {((p(x_val) - y_val) ** 2).mean():8.3f}")</div>
  <div class="fx" data-lang="text">degree  train MSE  val MSE
     0     0.361    0.592
     1     0.220    0.325
     2     0.217    0.329
     3     0.086    0.125
     4     0.081    0.133
     5     0.077    0.122
     6     0.060    0.144
     7     0.060    0.145
     8     0.009    0.367
     9     0.000    0.701</div>
  <p>Read the two columns like practice marks and exam marks. Degrees 0 to 2 have high error on both (validation 0.33 to 0.59): a constant, a line and a parabola cannot make an S-shaped wave, so they underfit. (For the flats a line was enough because their truth is nearly straight; the right flexibility depends on the pattern.) Degrees 3 to 5 have training error around 0.08 and validation around 0.12 to 0.13, close to the noise floor of 0.09: a good fit. Degrees 8 and 9 have training error near 0 and validation 0.37 and 0.70: overfit.</p>
    <figure class="viz"><svg viewBox="0 0 640 232" width="640">
<line x1="30" y1="180" x2="205" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="30" y1="30" x2="30" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="30" y="194" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="30" y1="180" x2="30" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="205" y="194" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="205" y1="180" x2="205" y2="183" stroke="currentColor" opacity="0.5"/>
<polyline points="30,105 32.5,101.2 35.1,97.5 37.6,93.8 40.1,90.2 42.7,86.7 45.2,83.4 47.8,80.2 50.3,77.3 52.8,74.5 55.4,72.1 57.9,69.9 60.4,68 63,66.4 65.5,65.1 68,64.2 70.6,63.6 73.1,63.3 75.7,63.4 78.2,63.9 80.7,64.6 83.3,65.7 85.8,67.2 88.3,68.9 90.9,71 93.4,73.3 95.9,75.9 98.5,78.7 101,81.8 103.6,85 106.1,88.4 108.6,91.9 111.2,95.6 113.7,99.3 116.2,103.1 118.8,106.9 121.3,110.7 123.8,114.4 126.4,118.1 128.9,121.6 131.4,125 134,128.2 136.5,131.3 139.1,134.1 141.6,136.7 144.1,139 146.7,141.1 149.2,142.8 151.7,144.3 154.3,145.4 156.8,146.1 159.3,146.6 161.9,146.7 164.4,146.4 167,145.8 169.5,144.9 172,143.6 174.6,142 177.1,140.1 179.6,137.9 182.2,135.5 184.7,132.7 187.2,129.8 189.8,126.6 192.3,123.3 194.9,119.8 197.4,116.2 199.9,112.5 202.5,108.8 205,105" fill="none" class="sb" stroke-width="1.2" stroke-dasharray="4 3"/>
<polyline points="30,80.6 32.5,81.3 35.1,82 37.6,82.7 40.1,83.4 42.7,84.1 45.2,84.8 47.8,85.6 50.3,86.3 52.8,87 55.4,87.7 57.9,88.4 60.4,89.1 63,89.8 65.5,90.5 68,91.2 70.6,92 73.1,92.7 75.7,93.4 78.2,94.1 80.7,94.8 83.3,95.5 85.8,96.2 88.3,96.9 90.9,97.6 93.4,98.3 95.9,99.1 98.5,99.8 101,100.5 103.6,101.2 106.1,101.9 108.6,102.6 111.2,103.3 113.7,104 116.2,104.7 118.8,105.4 121.3,106.2 123.8,106.9 126.4,107.6 128.9,108.3 131.4,109 134,109.7 136.5,110.4 139.1,111.1 141.6,111.8 144.1,112.5 146.7,113.3 149.2,114 151.7,114.7 154.3,115.4 156.8,116.1 159.3,116.8 161.9,117.5 164.4,118.2 167,118.9 169.5,119.6 172,120.4 174.6,121.1 177.1,121.8 179.6,122.5 182.2,123.2 184.7,123.9 187.2,124.6 189.8,125.3 192.3,126 194.9,126.7 197.4,127.5 199.9,128.2 202.5,128.9 205,129.6" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="30" cy="102.6" r="3.2" class="tb"/>
<circle cx="49.4" cy="84.8" r="3.2" class="tb"/>
<circle cx="68.9" cy="69.1" r="3.2" class="tb"/>
<circle cx="88.3" cy="99.4" r="3.2" class="tb"/>
<circle cx="107.8" cy="68.3" r="3.2" class="tb"/>
<circle cx="127.2" cy="104.9" r="3.2" class="tb"/>
<circle cx="146.7" cy="145.2" r="3.2" class="tb"/>
<circle cx="166.1" cy="136.4" r="3.2" class="tb"/>
<circle cx="185.6" cy="128.3" r="3.2" class="tb"/>
<circle cx="205" cy="111.9" r="3.2" class="tb"/>
<text x="117.5" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 1: underfit</text>
<line x1="235" y1="180" x2="410" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="235" y1="30" x2="235" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="235" y="194" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="235" y1="180" x2="235" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="410" y="194" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="410" y1="180" x2="410" y2="183" stroke="currentColor" opacity="0.5"/>
<polyline points="235,105 237.5,101.2 240.1,97.5 242.6,93.8 245.1,90.2 247.7,86.7 250.2,83.4 252.8,80.2 255.3,77.3 257.8,74.5 260.4,72.1 262.9,69.9 265.4,68 268,66.4 270.5,65.1 273,64.2 275.6,63.6 278.1,63.3 280.7,63.4 283.2,63.9 285.7,64.6 288.3,65.7 290.8,67.2 293.3,68.9 295.9,71 298.4,73.3 300.9,75.9 303.5,78.7 306,81.8 308.6,85 311.1,88.4 313.6,91.9 316.2,95.6 318.7,99.3 321.2,103.1 323.8,106.9 326.3,110.7 328.8,114.4 331.4,118.1 333.9,121.6 336.4,125 339,128.2 341.5,131.3 344.1,134.1 346.6,136.7 349.1,139 351.7,141.1 354.2,142.8 356.7,144.3 359.3,145.4 361.8,146.1 364.3,146.6 366.9,146.7 369.4,146.4 372,145.8 374.5,144.9 377,143.6 379.6,142 382.1,140.1 384.6,137.9 387.2,135.5 389.7,132.7 392.2,129.8 394.8,126.6 397.3,123.3 399.9,119.8 402.4,116.2 404.9,112.5 407.5,108.8 410,105" fill="none" class="sb" stroke-width="1.2" stroke-dasharray="4 3"/>
<polyline points="235,106 237.5,101.3 240.1,97.1 242.6,93.3 245.1,89.8 247.7,86.7 250.2,83.9 252.8,81.5 255.3,79.4 257.8,77.6 260.4,76.1 262.9,74.9 265.4,74 268,73.3 270.5,72.9 273,72.8 275.6,72.9 278.1,73.2 280.7,73.7 283.2,74.4 285.7,75.3 288.3,76.4 290.8,77.7 293.3,79.1 295.9,80.6 298.4,82.3 300.9,84.1 303.5,86 306,88 308.6,90.1 311.1,92.2 313.6,94.4 316.2,96.7 318.7,99 321.2,101.4 323.8,103.7 326.3,106.1 328.8,108.4 331.4,110.8 333.9,113.1 336.4,115.3 339,117.5 341.5,119.7 344.1,121.8 346.6,123.7 349.1,125.6 351.7,127.4 354.2,129.1 356.7,130.6 359.3,132 361.8,133.2 364.3,134.2 366.9,135.1 369.4,135.8 372,136.3 374.5,136.6 377,136.6 379.6,136.4 382.1,136 384.6,135.3 387.2,134.3 389.7,133.1 392.2,131.5 394.8,129.7 397.3,127.5 399.9,125 402.4,122.2 404.9,119 407.5,115.5 410,111.6" fill="none" class="sg" stroke-width="2.2"/>
<circle cx="235" cy="102.6" r="3.2" class="tb"/>
<circle cx="254.4" cy="84.8" r="3.2" class="tb"/>
<circle cx="273.9" cy="69.1" r="3.2" class="tb"/>
<circle cx="293.3" cy="99.4" r="3.2" class="tb"/>
<circle cx="312.8" cy="68.3" r="3.2" class="tb"/>
<circle cx="332.2" cy="104.9" r="3.2" class="tb"/>
<circle cx="351.7" cy="145.2" r="3.2" class="tb"/>
<circle cx="371.1" cy="136.4" r="3.2" class="tb"/>
<circle cx="390.6" cy="128.3" r="3.2" class="tb"/>
<circle cx="410" cy="111.9" r="3.2" class="tb"/>
<text x="322.5" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 3: good fit</text>
<line x1="440" y1="180" x2="615" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="440" y1="30" x2="440" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="440" y="194" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="440" y1="180" x2="440" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="615" y="194" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="615" y1="180" x2="615" y2="183" stroke="currentColor" opacity="0.5"/>
<polyline points="440,105 442.5,101.2 445.1,97.5 447.6,93.8 450.1,90.2 452.7,86.7 455.2,83.4 457.8,80.2 460.3,77.3 462.8,74.5 465.4,72.1 467.9,69.9 470.4,68 473,66.4 475.5,65.1 478,64.2 480.6,63.6 483.1,63.3 485.7,63.4 488.2,63.9 490.7,64.6 493.3,65.7 495.8,67.2 498.3,68.9 500.9,71 503.4,73.3 505.9,75.9 508.5,78.7 511,81.8 513.6,85 516.1,88.4 518.6,91.9 521.2,95.6 523.7,99.3 526.2,103.1 528.8,106.9 531.3,110.7 533.8,114.4 536.4,118.1 538.9,121.6 541.4,125 544,128.2 546.5,131.3 549.1,134.1 551.6,136.7 554.1,139 556.7,141.1 559.2,142.8 561.7,144.3 564.3,145.4 566.8,146.1 569.3,146.6 571.9,146.7 574.4,146.4 577,145.8 579.5,144.9 582,143.6 584.6,142 587.1,140.1 589.6,137.9 592.2,135.5 594.7,132.7 597.2,129.8 599.8,126.6 602.3,123.3 604.9,119.8 607.4,116.2 609.9,112.5 612.5,108.8 615,105" fill="none" class="sb" stroke-width="1.2" stroke-dasharray="4 3"/>
<polyline points="440,102.6 442.5,180 445.1,180 447.6,180 450.1,180 452.7,172.9 455.2,136.5 457.8,103.4 460.3,76.6 462.8,57.4 465.4,45.8 467.9,41.1 470.4,42.2 473,47.7 475.5,56 478,65.8 480.6,75.8 483.1,85 485.7,92.8 488.2,98.5 490.7,101.9 493.3,103.1 495.8,102.2 498.3,99.4 500.9,95.3 503.4,90.3 505.9,84.9 508.5,79.7 511,75 513.6,71.4 516.1,69 518.6,68.2 521.2,68.9 523.7,71.4 526.2,75.4 528.8,80.7 531.3,87.2 533.8,94.5 536.4,102.3 538.9,110.2 541.4,117.9 544,125 546.5,131.3 549.1,136.6 551.6,140.7 554.1,143.5 556.7,145.2 559.2,145.6 561.7,145.2 564.3,144 566.8,142.3 569.3,140.5 571.9,138.7 574.4,137.1 577,136 579.5,135.4 582,135.2 584.6,135.2 587.1,135.1 589.6,134.5 592.2,132.9 594.7,129.7 597.2,124.6 599.8,117.4 602.3,108.4 604.9,98.5 607.4,89.6 609.9,85 612.5,90 615,111.9" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="440" cy="102.6" r="3.2" class="tb"/>
<circle cx="459.4" cy="84.8" r="3.2" class="tb"/>
<circle cx="478.9" cy="69.1" r="3.2" class="tb"/>
<circle cx="498.3" cy="99.4" r="3.2" class="tb"/>
<circle cx="517.8" cy="68.3" r="3.2" class="tb"/>
<circle cx="537.2" cy="104.9" r="3.2" class="tb"/>
<circle cx="556.7" cy="145.2" r="3.2" class="tb"/>
<circle cx="576.1" cy="136.4" r="3.2" class="tb"/>
<circle cx="595.6" cy="128.3" r="3.2" class="tb"/>
<circle cx="615" cy="111.9" r="3.2" class="tb"/>
<text x="527.5" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 9: overfit</text>
<text x="320" y="222" text-anchor="middle" class="tm" font-size="11">dots = 10 noisy training rows · dashed blue = true sine · solid = fitted polynomial</text>
</svg><figcaption>The same 10 training rows, three models. Degree 1 misses the shape. Degree 3 follows the true sine closely. Degree 9 passes through every dot, including the noise, and swings wildly between them (it dives off the bottom of the chart near x = 0.05).</figcaption></figure>
  <p>The figure draws three of these fits through the same ten dots, with the true sine dashed. The degree-1 line slices straight through the wave and misses its shape everywhere. The degree-3 curve follows the true sine closely while ignoring the scatter of individual dots. The degree-9 curve passes exactly through every dot, noise included, and swings wildly between them. That gives a practical way to name the failures: an underfit model has high training error, high validation error and a small gap between them; a good fit has training error near the noise level and validation slightly above; an overfit model has very low training error and a much higher validation error. Low training error on its own is not overfitting (degree 3 has 0.086 and 0.125, both fine); overfitting is about the gap, and about validation error rising as flexibility grows.</p>

  <h2 id="bv-cap"><span class="num">03</span>Model Capacity</h2>
  <p>We used the degree as the flexibility dial for polynomials. Trees have depth, k-nearest-neighbours has k, neural networks have layers. The general name for what all these dials control is <strong>capacity</strong>: how rich a set of patterns a model family is able to fit. A constant can only fit flat patterns, a line any trend, a degree-9 polynomial any ten points exactly. More capacity makes a lower training error possible, and it also makes it possible to fit noise. Think of a sculptor's tools: with only a saw you can cut blocks but never a face (too little capacity), and with a set of fine chisels you can carve a face, or, if you are careless, every crack in the stone.</p>
  <p>The three-flat example contains a rule that holds far more generally: a polynomial with p coefficients can pass exactly through any p points, and more broadly, <strong>when the number of free parameters reaches the number of training rows, a model can usually memorise them</strong>. Degree 2 can memorise three flats; degree 9 can memorise ten. So capacity must always be judged relative to the amount of data: degree 9 overfits ten flats, but would be perfectly reasonable for ten thousand. The table lists the capacity dial in the models you will meet in this track.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Capacity goes up when…</th><th>Too low</th><th>Too high</th></tr>
    <tr><td>Polynomial regression</td><td>degree goes up</td><td>₹67 lakh for every flat</td><td>wiggles through the noise</td></tr>
    <tr><td>Linear or logistic regression with a penalty</td><td>λ (alpha) goes down, or C goes up</td><td>all weights squeezed to 0</td><td>huge weights</td></tr>
    <tr><td><a class="xref" data-note="ml_knn">k-nearest neighbours</a></td><td><strong>k goes down</strong> (reversed)</td><td>k = n predicts the overall average</td><td>k = 1 memorises</td></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision tree</a></td><td>max_depth up, min_samples_leaf down</td><td>a single split</td><td>one leaf per row</td></tr>
    <tr><td><a class="xref" data-note="ml_svm">SVM with RBF kernel</a></td><td>C up, gamma up</td><td>almost linear</td><td>an island around each point</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient boosting</a></td><td>more trees, deeper trees, larger learning rate</td><td>too few rounds</td><td>fits noise late in training</td></tr>
    <tr><td>Neural network</td><td>more layers and units, more epochs, less dropout</td><td>a tiny network</td><td>memorises labels, even random ones</td></tr>
  </table>
  <p>Learning theory has a precise measure of capacity for classifiers, the <strong>VC dimension</strong> (after Vapnik and Chervonenkis): the largest number of points the model family can <strong>shatter</strong>, that is, separate correctly under every possible way of labelling them. A straight line in two dimensions can separate three points (not on one line) under all 2³ = 8 labellings, but no line can separate four points at the corners of a square labelled like a chessboard. So lines in 2D have VC dimension 3, and a linear classifier in d dimensions has VC dimension d + 1. Classic results say the generalization gap shrinks roughly like √(capacity / n): more capacity needs more rows. You will not compute these bounds at work, but the shape of the statement is worth remembering.</p>
  <p>Capacity is not simply the number of parameters, which is a common mistake. Ridge regression has as many parameters as plain linear regression but less effective capacity, because its penalty keeps the weights small. kNN has no trained parameters at all, yet with k = 1 its capacity is enormous. And deep networks with millions of parameters can generalise well, because the way they are trained limits what they actually fit; section 11 returns to this.</p>

  <h2 id="bv-derive"><span class="num">04</span>The Bias–Variance Decomposition</h2>
  <p>As capacity grows, error on new data first falls and then rises. "Too rigid" and "too flexible" are descriptions, not an explanation. The explanation is a formula that splits test error into three parts, one that shrinks as capacity grows, one that grows, and one that never changes, so that the U-shape follows from simple arithmetic.</p>
  <p>Start with the setup. Imagine the data truly comes from y = f(x) + ε, where f is the real pattern and ε is noise with average 0 and variance σ². For flats, f(x) is "the typical price of a flat of this area" and ε is the luck of a particular sale: a motivated seller, a good negotiator. Our ten flats are one random sample. If the portal had happened to record a <em>different</em> ten sales of the same sizes, it would have fitted a slightly different line. So the fitted model is itself random: it depends on which training set D we happened to get, and we write it f̂<sub>D</sub>. If we could train on very many training sets and average their predictions at a point x, we would get the <strong>average model</strong>, f̄(x).</p>
  <p>With these pieces the three parts can be defined. <strong>Bias</strong> is f̄(x) − f(x), how far the <em>average</em> model is from the truth: a systematic error that would not go away even with endless training sets. <strong>Variance</strong> is the average of (f̂<sub>D</sub>(x) − f̄(x))² over training sets: how much models trained on different samples disagree with one another. <strong>Noise</strong> is σ², how much y wobbles around f(x) even when x is known exactly. An archer is the classic picture, where each arrow is a model trained on a different sample. Arrows grouped tightly but off-centre mean high bias: the sight is bent. Arrows centred on average but scattered mean high variance: the hands are shaky. Steadying the hands does not fix the sight.</p>
    <figure class="viz"><svg viewBox="0 0 560 138" width="560">
    <g fill="none" stroke="currentColor" opacity="0.5">
      <circle cx="70" cy="60" r="40"/><circle cx="70" cy="60" r="26"/><circle cx="70" cy="60" r="12"/>
      <circle cx="210" cy="60" r="40"/><circle cx="210" cy="60" r="26"/><circle cx="210" cy="60" r="12"/>
      <circle cx="350" cy="60" r="40"/><circle cx="350" cy="60" r="26"/><circle cx="350" cy="60" r="12"/>
      <circle cx="490" cy="60" r="40"/><circle cx="490" cy="60" r="26"/><circle cx="490" cy="60" r="12"/>
    </g>
    <g class="tb"><circle cx="68" cy="58" r="3.5"/><circle cx="73" cy="62" r="3.5"/><circle cx="70" cy="55" r="3.5"/><circle cx="66" cy="63" r="3.5"/><circle cx="74" cy="57" r="3.5"/></g>
    <g class="tr"><circle cx="190" cy="40" r="3.5"/><circle cx="232" cy="52" r="3.5"/><circle cx="205" cy="88" r="3.5"/><circle cx="222" cy="78" r="3.5"/><circle cx="193" cy="70" r="3.5"/></g>
    <g class="tb"><circle cx="370" cy="38" r="3.5"/><circle cx="375" cy="42" r="3.5"/><circle cx="368" cy="44" r="3.5"/><circle cx="377" cy="36" r="3.5"/><circle cx="372" cy="47" r="3.5"/></g>
    <g class="tr"><circle cx="512" cy="36" r="3.5"/><circle cx="525" cy="62" r="3.5"/><circle cx="498" cy="30" r="3.5"/><circle cx="520" cy="45" r="3.5"/><circle cx="505" cy="52" r="3.5"/></g>
    <g text-anchor="middle"><text x="70" y="116" class="tg">low bias</text><text x="70" y="130" class="tg">low variance</text><text x="210" y="116">low bias</text><text x="210" y="130" class="tr">high variance</text><text x="350" y="116" class="tr">high bias</text><text x="350" y="130">low variance</text><text x="490" y="116" class="tr">high bias</text><text x="490" y="130" class="tr">high variance</text></g>
  </svg><figcaption>Each dot is one model trained on a different sample; the centre is the truth f(x). Bias is where the group sits; variance is how spread out it is.</figcaption></figure>
  <p>The four targets show the four combinations. In each one, the bullseye is the truth f(x) and each dot is the prediction of one model trained on a different sample: where the group sits is the bias, and how spread out it is, is the variance. Now a small example by hand. Take a 950 sq ft flat (x = 9.5) whose true typical price is f(9.5) = 6 × 9.5 + 10 = ₹67 lakh, and suppose the actual sale is 66 or 68 with equal chance (noise of ±1, so σ² = 1). Four different sets of ten past sales gave four fitted models, which predict 64, 66, 66 and 68 for this flat. The expected squared error is the average of (y − prediction)² over all 4 × 2 equally likely combinations:</p>
  <table class="tbl">
    <tr><th>prediction</th><th>if y = 66</th><th>if y = 68</th><th>average</th></tr>
    <tr><td>64</td><td>(66 − 64)² = 4</td><td>(68 − 64)² = 16</td><td>10</td></tr>
    <tr><td>66</td><td>0</td><td>4</td><td>2</td></tr>
    <tr><td>66</td><td>0</td><td>4</td><td>2</td></tr>
    <tr><td>68</td><td>4</td><td>0</td><td>2</td></tr>
    <tr><td colspan="3"><strong>expected squared error</strong> = (10 + 2 + 2 + 2) / 4</td><td><strong>4</strong></td></tr>
  </table>
  <p>Now the three parts. The average model is (64 + 66 + 66 + 68) / 4 = 66, so the bias is 66 − 67 = −1 and the squared bias is 1. The variance is the average of (prediction − 66)², which is (4 + 0 + 0 + 4) / 4 = 2. The noise is the average of (y − 67)², which is 1. And 1 + 2 + 1 = 4, exactly the expected error.</p>
  <div class="fx" data-lang="py">import numpy as np
f_x = 67                                   # true average price of a 950 sq ft flat
preds = np.array([64, 66, 66, 68])         # four models, one per training set
ys = np.array([66, 68])                    # the actual sale: 67 - 1 or 67 + 1, equally likely

errors = (ys[None, :] - preds[:, None]) ** 2      # every (model, outcome) pair
print(errors)
print("expected squared error =", errors.mean())
bias2 = (preds.mean() - f_x) ** 2
var = preds.var()                          # mean of squared deviations from the average model
noise = ((ys - f_x) ** 2).mean()
print(f"bias^2 + variance + noise = {bias2} + {var} + {noise} = {bias2 + var + noise}")</div>
  <div class="fx" data-lang="text">[[ 4 16]
 [ 0  4]
 [ 0  4]
 [ 4  0]]
expected squared error = 4.0
bias^2 + variance + noise = 1.0 + 2.0 + 1.0 = 4.0</div>
  <p>The 4 × 2 matrix is the hand table: rows are the four models, columns the two possible prices. <code>preds.var()</code> divides by the number of values, which is the definition the decomposition uses. The three parts adding up exactly is not a coincidence; for squared error it always happens, and the proof is two applications of one trick, "add and subtract the same thing, then expand a square". Write f, f̂ and f̄ for the three values at our point x.</p>
  <p>Step 1 separates the noise. Since y = f + ε, the error is y − f̂ = (f − f̂) + ε, and squaring gives (f − f̂)² + 2ε(f − f̂) + ε². Now average. The test noise ε is fresh noise, unrelated to the training set and therefore to f̂, and its average is 0, so the middle term averages to 2 × 0 × (…) = 0. The last term averages to σ². So the expected error is the average of (f − f̂)², plus σ². Step 2 splits that first part. Add and subtract the average model: f − f̂ = (f − f̄) + (f̄ − f̂). Squaring gives (f − f̄)² + 2(f − f̄)(f̄ − f̂) + (f̄ − f̂)². The quantity (f − f̄) is a fixed number that does not depend on the training set, and the average of (f̄ − f̂) is zero by the very definition of f̄, so the middle term vanishes again. What remains is (f − f̄)², the squared bias, plus the average of (f̂ − f̄)², the variance. Putting both steps together:</p>
  <p style="text-align:center"><strong>expected test error = (f̄(x) − f(x))² + E[(f̂(x) − f̄(x))²] + σ² = bias² + variance + noise</strong></p>
  <p>In the hand example, step 1 gives the average of (67 − 64)², (67 − 66)², (67 − 66)², (67 − 68)², which is (9 + 1 + 1 + 1) / 4 = 3, plus σ² = 1, so 4; step 2 splits the 3 into bias² 1 and variance 2. Averaging over all test points x gives the same split for the whole test MSE. The identity is exact for squared error; for other losses, such as classification accuracy, similar decompositions exist but the parts no longer simply add up. Note carefully what "variance" means here, because interviewers check it: it is not the variance of prices in the data, and not how much the predictions vary from one row to another. It is how much the prediction at <em>one fixed x</em> changes when the model is trained on a different sample. A model that draws a very wiggly curve can still have low variance if it draws the same wiggly curve every time.</p>

  <h2 id="bv-sim"><span class="num">05</span>Measuring Bias and Variance</h2>
  <p>The formula needs many training sets and the true f. In real life you have one set of ten flats and no f. But in a simulation we control both, so we can measure each part directly. The recipe is: draw a training set (fresh noise), fit the model, predict at fixed test points; repeat R times; the average of the R predictions is the average model; bias² is how far it is from f, and variance is how spread out the R predictions are.</p>
  <p>Suppose flat prices truly follow f(x) = 6x + 10, our fitted line promoted to "truth", with sale-to-sale noise of standard deviation ₹2 lakh, so σ² = 4, close to the 4.6 we saw. Keep the ten areas 5 to 14 fixed, redraw only the prices 2,000 times, and measure each candidate at 35 areas between the flats. As a check, we also measure the expected test error directly against fresh noisy prices, to confirm that bias² + variance + noise equals it.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsRegressor

def f(x):                                      # the "true" price rule in this simulated world
    return 6 * x + 10
SIGMA = 2.0                                    # sale-to-sale luck: noise variance 4
rng = np.random.default_rng(0)
x_tr = np.arange(5, 15, dtype=float)           # the same ten areas as flats A..J
x_te = np.linspace(5.25, 13.75, 35)            # test areas between them
R = 2000                                       # 2,000 alternative sets of ten sales

def fit_predict(model, y_tr):
    if model == "1-NN":
        return KNeighborsRegressor(1).fit(x_tr[:, None], y_tr).predict(x_te[:, None])
    return np.polynomial.Polynomial.fit(x_tr, y_tr, model)(x_te)    # polynomial of this degree

print("model     bias^2   variance  noise     sum    measured")
for model in [0, 1, 3, 6, 9, "1-NN"]:
    P = np.empty((R, len(x_te)))
    for r in range(R):
        P[r] = fit_predict(model, f(x_tr) + rng.normal(0, SIGMA, 10))   # a new set of ten sales
    avg = P.mean(axis=0)                                    # the average model
    bias2 = ((avg - f(x_te)) ** 2).mean()
    var = P.var(axis=0).mean()
    y_te = f(x_te) + rng.normal(0, SIGMA, (R, len(x_te)))   # fresh noisy prices
    measured = ((y_te - P) ** 2).mean()
    label = model if model == "1-NN" else f"degree {model}"
    print(f"{label:8s} {bias2:8.3f} {var:9.3f} {SIGMA**2:6.2f} {bias2 + var + SIGMA**2:8.3f} {measured:9.3f}")</div>
  <div class="fx" data-lang="text">model     bias^2   variance  noise     sum    measured
degree 0  229.500     0.391   4.00  233.891   234.204
degree 1    0.000     0.701   4.00    4.701     4.755
degree 3    0.001     1.240   4.00    5.241     5.249
degree 6    0.003     2.616   4.00    6.619     6.610
degree 9    0.001    26.231   4.00   30.232    30.045
1-NN        3.489     3.947   4.00   11.436    11.423</div>
  <p>First, the decomposition holds: the "sum" and "measured" columns agree to within simulation noise in every row. Degree 0, always the average price, has bias² of 229.5 and variance of only 0.39: every set of ten sales gives nearly the same average, about ₹67 lakh, and it is wrong for every flat that is not mid-sized. That is pure bias. Degree 1 has bias² of 0.000, because the line family contains the truth, and variance 0.70; theory for a fitted line agrees, giving σ² times the average of [1/n + (x − x̄)² / Σ(x − x̄)²] over the test areas, 4 × 0.177 = 0.71. Degrees 3, 6 and 9 also have no bias, since they can represent a line too, but their variance climbs from 1.24 to 2.62 to 26.2: the extra coefficients have nothing real to do, so they follow the noise, and degree 9 passes through every set of ten noisy prices. The 1-NN memoriser has some of both: bias² 3.49, because copying a flat up to 50 sq ft away misses the slope by up to 6 × 0.5 = ₹3 lakh, plus variance 3.95, because it copies that flat's noise too.</p>
  <p>The same recipe on the curved sine truth, with 15 training rows at fixed places and 500 training sets, shows a fuller picture, because here even the line is biased:</p>
  <div class="fx" data-lang="py">import numpy as np
from sine import f, SIGMA

rng = np.random.default_rng(42)
x_tr = np.linspace(0, 1, 15)                 # 15 training rows at fixed places
x_te = np.linspace(0.02, 0.98, 50)
R = 500                                      # 500 training sets
print("degree   bias^2   variance   total (+ noise 0.09)")
for d in [0, 1, 2, 3, 4, 5, 7, 9, 11, 13]:
    P = np.array([np.polynomial.Polynomial.fit(x_tr, f(x_tr) + rng.normal(0, SIGMA, 15), d)(x_te)
                  for r in range(R)])
    bias2 = ((P.mean(axis=0) - f(x_te)) ** 2).mean()
    var = P.var(axis=0).mean()
    print(f"{d:6d} {bias2:9.4f} {var:9.4f} {bias2 + var + SIGMA**2:10.4f}")</div>
  <div class="fx" data-lang="text">degree   bias^2   variance   total (+ noise 0.09)
     0    0.5104    0.0062     0.6066
     1    0.2001    0.0106     0.3007
     2    0.2000    0.0159     0.3058
     3    0.0059    0.0205     0.1165
     4    0.0056    0.0235     0.1191
     5    0.0001    0.0292     0.1193
     7    0.0001    0.0412     0.1313
     9    0.0001    0.0641     0.1542
    11    0.0008    0.1549     0.2457
    13    0.0013    3.2717     3.3630</div>
  <p>Bias² falls as the degree rises: 0.51 for a constant, which cannot follow a wave at all, 0.20 for a line or a parabola, 0.006 for a cubic, and essentially zero from degree 5, because on this range a sine is very close to a degree-5 polynomial. Unlike in the flats world, the line is <em>biased</em> here, because the truth is curved. Variance rises the whole way: 0.006 at degree 0, 0.021 at degree 3, 0.064 at degree 9, and 3.27 at degree 13, which has 14 coefficients for 15 rows. Each extra coefficient is one more thing the noise can push around. The noise, 0.09, is the same for every model. The best total is at degree 3 (0.1165), with degrees 4 and 5 close behind: that is the right capacity for 15 rows of this pattern.</p>

  <h2 id="bv-curve"><span class="num">06</span>The Bias–Variance Trade-off</h2>
  <p>Plot the three parts against capacity and you get the most famous figure in machine learning.</p>
    <figure class="viz"><svg viewBox="0 0 620 265" width="620">
<line x1="80" y1="215" x2="580" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="80" y1="25" x2="80" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="80" y="229" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="80" y1="215" x2="80" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="118.5" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="118.5" y1="215" x2="118.5" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="156.9" y="229" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="156.9" y1="215" x2="156.9" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="195.4" y="229" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="195.4" y1="215" x2="195.4" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="233.8" y="229" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="233.8" y1="215" x2="233.8" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="272.3" y="229" text-anchor="middle" class="tm" font-size="10.5">5</text>
<line x1="272.3" y1="215" x2="272.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="349.2" y="229" text-anchor="middle" class="tm" font-size="10.5">7</text>
<line x1="349.2" y1="215" x2="349.2" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="426.2" y="229" text-anchor="middle" class="tm" font-size="10.5">9</text>
<line x1="426.2" y1="215" x2="426.2" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="503.1" y="229" text-anchor="middle" class="tm" font-size="10.5">11</text>
<line x1="503.1" y1="215" x2="503.1" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="580" y="229" text-anchor="middle" class="tm" font-size="10.5">13</text>
<line x1="580" y1="215" x2="580" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="75" y="218.5" text-anchor="end" class="tm" font-size="10.5">0.0001</text>
<line x1="77" y1="215" x2="80" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="75" y="177.2" text-anchor="end" class="tm" font-size="10.5">0.001</text>
<line x1="77" y1="173.7" x2="80" y2="173.7" stroke="currentColor" opacity="0.5"/>
<text x="75" y="135.9" text-anchor="end" class="tm" font-size="10.5">0.01</text>
<line x1="77" y1="132.4" x2="80" y2="132.4" stroke="currentColor" opacity="0.5"/>
<text x="75" y="94.6" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="77" y1="91.1" x2="80" y2="91.1" stroke="currentColor" opacity="0.5"/>
<text x="75" y="53.4" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="77" y1="49.9" x2="80" y2="49.9" stroke="currentColor" opacity="0.5"/>
<line x1="80" y1="93" x2="580" y2="93" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<line x1="195.4" y1="25" x2="195.4" y2="215" stroke-dasharray="3 3" class="sg"/>
<text x="199.4" y="35" class="tm" font-size="10.5">best: degree 3</text>
<polyline points="80,61.9 118.5,78.6 156.9,78.7 195.4,141.9 233.8,142.5 272.3,215 349.2,215 426.2,202.6 503.1,182.9 580,152.9" fill="none" class="sb" stroke-width="2"/>
<circle cx="80" cy="61.9" r="3" class="tb"/>
<circle cx="118.5" cy="78.6" r="3" class="tb"/>
<circle cx="156.9" cy="78.7" r="3" class="tb"/>
<circle cx="195.4" cy="141.9" r="3" class="tb"/>
<circle cx="233.8" cy="142.5" r="3" class="tb"/>
<circle cx="272.3" cy="215" r="3" class="tb"/>
<circle cx="349.2" cy="215" r="3" class="tb"/>
<circle cx="426.2" cy="202.6" r="3" class="tb"/>
<circle cx="503.1" cy="182.9" r="3" class="tb"/>
<circle cx="580" cy="152.9" r="3" class="tb"/>
<text x="120" y="60" class="tb" font-size="11.5">bias²</text>
<polyline points="80,141 118.5,131 156.9,123.7 195.4,119.5 233.8,116.6 272.3,112.9 349.2,106.9 426.2,99.8 503.1,83.8 580,29.8" fill="none" class="sr" stroke-width="2"/>
<circle cx="80" cy="141" r="3" class="tr"/>
<circle cx="118.5" cy="131" r="3" class="tr"/>
<circle cx="156.9" cy="123.7" r="3" class="tr"/>
<circle cx="195.4" cy="119.5" r="3" class="tr"/>
<circle cx="233.8" cy="116.6" r="3" class="tr"/>
<circle cx="272.3" cy="112.9" r="3" class="tr"/>
<circle cx="349.2" cy="106.9" r="3" class="tr"/>
<circle cx="426.2" cy="99.8" r="3" class="tr"/>
<circle cx="503.1" cy="83.8" r="3" class="tr"/>
<circle cx="580" cy="29.8" r="3" class="tr"/>
<text x="440" y="120" class="tr" font-size="11.5">variance</text>
<polyline points="80,58.8 118.5,71.3 156.9,71.1 195.4,88.4 233.8,87.9 272.3,87.9 349.2,86.2 426.2,83.6 503.1,75.4 580,29.3" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="250" y="66" class="tm" font-size="11.5">total = bias² + variance + noise</text>
<text x="330" y="245" text-anchor="middle" class="tm" font-size="11">polynomial degree (model capacity) →</text>
<text x="26" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 120)">error (log scale)</text>
<text x="470" y="104" class="tm" font-size="11">noise σ² = 0.09</text>
</svg><figcaption>The sine simulation table, drawn on a log scale (from a run with the same settings). Blue: bias² falls with capacity. Red: variance rises. Black: their sum plus noise, the expected test error, is lowest at degree 3. The dashed line is the noise floor that no model can go below.</figcaption></figure>
  <p>Follow the blue line from left to right: more capacity, less bias. Follow the red line: more capacity, more variance. The black total is their sum plus the constant noise, so it first falls, while bias shrinks faster than variance grows, then flattens, then rises, once variance grows faster. The bottom of the black curve is the <strong>sweet spot</strong>, the best capacity for this amount of data. For the flats world the curve is simpler: the total is 233.9 at degree 0, a minimum of 4.70 at degree 1, then 5.24, 6.62 and 30.2 at degrees 3, 6 and 9, because the truth is a straight line and every extra coefficient only adds variance.</p>
  <p>The reason it is a trade-off can be put in one sentence for each side. A rigid model makes the <em>same</em> mistake on every training set: high bias, low variance, like always saying ₹67 lakh. A flexible model makes a <em>different</em> mistake on every training set: low bias, high variance, like degree 9 chasing each set's noise. With a fixed amount of data and a fixed family of models, you cannot make both small by turning the capacity dial; you can only choose the balance. A common mistake is to think the best point is where the bias² and variance curves cross. It is where their <em>slopes</em> cancel, where bias² is falling exactly as fast as variance is rising; in the flats world bias² is already 0 at degree 1 while variance is 0.70, and degree 1 is still best.</p>
  <p>Some changes move the whole curve rather than a point along it. More training rows lower the variance (roughly in proportion to 1/n for simple models) without touching the bias, so the sweet spot moves to the right and you can afford more capacity. Less noise, from cleaner labels, lowers both the variance and the floor. Better features, such as locality for the flats, make the pattern simpler and so lower bias and often variance too. Regularization, which adds a penalty for large weights, raises bias a little and lowers variance a lot, giving a finer dial than the degree (<a class="xref" data-note="ml_regularization">Regularization</a>). And ensembles bend the rule itself: <a class="xref" data-note="ml_bagging">bagging</a>, which averages many models trained on resampled data, keeps the low bias of deep trees while averaging away much of their variance, which is why a random forest works; <a class="xref" data-note="ml_boosting">boosting</a> goes the other way, starting from simple high-bias models and reducing bias step by step.</p>
  <p>The trade-off has a surprising consequence: deliberately adding bias can <em>lower</em> the total error. It already shows up when estimating a single number. Suppose the true mean is μ = 1, each observation has noise σ = 2, and you have n = 5 observations. The usual estimate is the sample mean x̄, which is unbiased and has variance σ²/n = 4/5 = 0.8, so its MSE is 0.8. Now try the shrunk estimate c·x̄ for some c between 0 and 1. Its bias is cμ − μ = (c − 1)μ, so bias² is (c − 1)², and its variance is c² × 0.8, so its MSE is (c − 1)² + 0.8c². At c = 0.8 that is 0.04 + 0.512 = 0.552, already much better than 0.8. Setting the derivative to zero, 2(c − 1) + 1.6c = 0, gives the best c = 1/1.8 = 0.556, with MSE 0.444. Shrinking towards zero trades a little bias for a large cut in variance. A simulation of 200,000 repeated studies agrees:</p>
  <div class="fx" data-lang="py">import numpy as np
mu, sigma, n = 1.0, 2.0, 5                       # true mean, noise SD, sample size
rng = np.random.default_rng(0)
xbar = rng.normal(mu, sigma, (200_000, n)).mean(axis=1)   # 200,000 repeated studies of 5 rows
c_best = mu**2 / (mu**2 + sigma**2 / n)
for c in [1.0, 0.8, c_best, 0.5, 0.0]:
    est = c * xbar                               # shrink the sample mean towards 0
    print(f"c={c:.3f}  bias^2={(est.mean() - mu) ** 2:.3f}  var={est.var():.3f}  MSE={((est - mu) ** 2).mean():.3f}")</div>
  <div class="fx" data-lang="text">c=1.000  bias^2=0.000  var=0.798  MSE=0.798
c=0.800  bias^2=0.039  var=0.511  MSE=0.550
c=0.556  bias^2=0.197  var=0.246  MSE=0.443
c=0.500  bias^2=0.249  var=0.200  MSE=0.449
c=0.000  bias^2=1.000  var=0.000  MSE=1.000</div>
  <p>The plain mean (c = 1) has no bias and MSE 0.798; c = 0.556 has bias² 0.197 but variance only 0.246, for an MSE of 0.443, the best in the table; c = 0, "always say 0", has no variance and is all bias. This is regularization in miniature. <a class="xref" data-note="ml_ridge_lasso">Ridge regression</a> shrinks every coefficient towards zero in exactly this spirit: the coefficients become biased, their variance drops by more, and test error goes down. "Unbiased" is not the same as "best". In practice the best amount of shrinkage depends on unknown quantities, which is why the penalty strength is tuned by cross-validation.</p>

  <h2 id="bv-noise"><span class="num">07</span>Irreducible Error</h2>
  <p>The noise term σ² sat under every model like a floor: 4 in the flats world, 0.09 for the sine. It is called the <strong>irreducible error</strong>, the error that even the best possible model would make with the information it is given. It comes from three places. There is measurement noise: an area recorded as carpet area for one flat and built-up area for another, a typo, two valuers disagreeing. There is missing information: the price depends on things we did not record, such as the floor, the view or the condition. And there is genuine randomness: whether a keen buyer happened to visit that week, how hard the seller bargained.</p>
  <p>Here is the idea at its simplest. Suppose four flats in the portal's data have exactly the same recorded features: 650 sq ft, two rooms, the same housing society. Their monthly rents are ₹14,000, ₹16,000, ₹15,000 and ₹15,000. Any model sees the same input for all four, so it must give all four the same prediction. The best single number under squared error is their mean, ₹15,000, and even that misses by −1,000, +1,000, 0 and 0, an MSE of 500,000. No model, however clever, can do better on these rows <em>with these features</em>.</p>
  <p>The words "with these features" matter, because "irreducible" is relative to what the model is told. With area as the only feature, the line's leftover misses on our ten flats are −2, 3, 1, −2, 3, −2, −3, 1, −1, 2. Look at them by locality: the Baner flats (B, E, H, J) missed by +3, +3, +1, +2, and the Hadapsar flats (A, D, G) by −2, −2, −3. A large part of what looked like noise is a feature we did not give the model. Add two 0/1 columns for locality, with Hadapsar as the baseline:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_predict

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
loc   = np.array(list("HBKHBKHBKB"))                 # Hadapsar, Baner, Kothrud
baner, kothrud = (loc == "B").astype(float), (loc == "K").astype(float)   # Hadapsar = both 0

for name, X in [("area only", np.c_[area]), ("area + locality", np.c_[area, baner, kothrud])]:
    fit = LinearRegression().fit(X, price)
    loo = cross_val_predict(LinearRegression(), X, price, cv=LeaveOneOut())
    print(f"{name:16s} coef {fit.coef_.round(2)}  train MSE {((fit.predict(X) - price) ** 2).mean():.3f}"
          f"  LOOCV MSE {((loo - price) ** 2).mean():.3f}")</div>
  <div class="fx" data-lang="text">area only        coef [6.]  train MSE 4.600  LOOCV MSE 7.255
area + locality  coef [5.78 5.09 2.11]  train MSE 0.445  LOOCV MSE 1.155</div>
  <p>The coefficients say ₹5.78 lakh per 100 sq ft, plus ₹5.09 lakh for Baner and ₹2.11 lakh for Kothrud compared with Hadapsar. The honest leave-one-out error falls from 7.25 to 1.16, a drop of 84%. No tuning of the area-only model could have done that, because its floor was set by the missing column. (The fall in <em>training</em> error, 4.6 to 0.445, would mean little on its own; adding columns always lowers training error. The leave-one-out number is what proves the gain is real.) So when a model seems stuck at a floor, the first question is whether some information it needs is missing.</p>
  <p>For classification the same idea is called the <strong>Bayes error</strong>. Suppose that among flats with a certain profile, 80% sell within 30 days. The best possible rule says "sells fast" for all of them and is still wrong 20% of the time. In general the ideal classifier predicts the most likely class at each x, and for two classes its error at x is the smaller of p and 1 − p. If there were three equally common profiles with P(sells fast) of 0.9, 0.5 and 0.2, the best possible error rate would be (0.1 + 0.5 + 0.2) / 3 = 0.267. A model with 27% error on such data is perfect, and a model with 10% is almost certainly leaking information or being scored wrongly. Knowing roughly where the floor is, often from how well a human expert does, tells you how much improvement is even possible. Two opposite warnings follow. Do not call remaining error "noise" too early: if training error is far above what experts achieve, or the leftover misses line up with a column you have, the error is probably reducible bias. And a validation score far <em>below</em> any plausible floor is a red flag for <a class="xref" data-note="ml_pipelines">data leakage</a>, not a reason to celebrate.</p>

  <h2 id="bv-lc"><span class="num">08</span>Learning Curves</h2>
  <p>Bias and variance were measured in simulations where we knew the truth. On real data we cannot draw 2,000 training sets, so we need plots made from one dataset that still reveal which problem we have. The first one answers a very practical question: should we spend money collecting more data? A <strong>learning curve</strong> trains the same model on growing subsets of the training data, say 5, 10, 20 and more rows, records the training error and the validation error at each size, and plots both against the training size.</p>
  <p>We can predict its shape by reasoning alone. Training error <em>rises</em> as rows are added, because memorising 5 flats is easy and memorising 160 is hard. Validation error <em>falls</em>, because more data means less variance. Both approach the same level, the error the model family would reach with unlimited data, which is bias² plus noise. So the <strong>height</strong> at which the two curves meet shows bias (plus noise), and the <strong>gap</strong> between them shows variance. Here it is in the flats world, for three models, each averaged over 50 training sets per size and scored on 2,000 fresh sales:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.dummy import DummyRegressor
from sklearn.neighbors import KNeighborsRegressor

rng = np.random.default_rng(0)
def sample(n):                                  # n sales from the flats world: 6 x area + 10 + noise
    x = rng.uniform(5, 14, n)
    return x[:, None], 6 * x + 10 + rng.normal(0, 2, n)
X_val, y_val = sample(2000)                     # a big validation set
models = {"mean (too simple)": DummyRegressor(), "line (right shape)": LinearRegression(),
          "1-NN (memoriser)": KNeighborsRegressor(1)}
for name, m in models.items():
    print(name)
    for n in [5, 10, 20, 40, 80, 160]:
        tr, va = [], []
        for rep in range(50):                   # 50 training sets of each size, averaged
            X, y = sample(n)
            m.fit(X, y)
            tr.append(((m.predict(X) - y) ** 2).mean()); va.append(((m.predict(X_val) - y_val) ** 2).mean())
        print(f"  n={n:4d}  train MSE={np.mean(tr):7.2f}  val MSE={np.mean(va):7.2f}  gap={np.mean(va) - np.mean(tr):6.2f}")</div>
  <div class="fx" data-lang="text">mean (too simple)
  n=   5  train MSE= 189.23  val MSE= 301.82  gap=112.59
  n=  10  train MSE= 214.02  val MSE= 281.04  gap= 67.01
  n=  20  train MSE= 226.15  val MSE= 264.27  gap= 38.12
  n=  40  train MSE= 245.66  val MSE= 254.77  gap=  9.11
  n=  80  train MSE= 237.61  val MSE= 252.41  gap= 14.81
  n= 160  train MSE= 245.84  val MSE= 251.51  gap=  5.67
line (right shape)
  n=   5  train MSE=   2.95  val MSE=   7.71  gap=  4.76
  n=  10  train MSE=   3.14  val MSE=   4.87  gap=  1.73
  n=  20  train MSE=   3.61  val MSE=   4.45  gap=  0.84
  n=  40  train MSE=   3.96  val MSE=   4.20  gap=  0.24
  n=  80  train MSE=   3.95  val MSE=   4.09  gap=  0.14
  n= 160  train MSE=   3.86  val MSE=   4.04  gap=  0.19
1-NN (memoriser)
  n=   5  train MSE=   0.00  val MSE=  45.96  gap= 45.96
  n=  10  train MSE=   0.00  val MSE=  22.00  gap= 22.00
  n=  20  train MSE=   0.00  val MSE=  11.20  gap= 11.20
  n=  40  train MSE=   0.00  val MSE=   8.92  gap=  8.92
  n=  80  train MSE=   0.00  val MSE=   8.28  gap=  8.28
  n= 160  train MSE=   0.00  val MSE=   8.02  gap=  8.02</div>
  <p>The average-price predictor, too simple for the pattern, has validation error stuck around 250 from 40 rows onwards, with training error rising to meet it: 160 sales are no better than 40. That is high bias, and more data is wasted on it. The line, which has the right shape, starts with a gap of 4.76 at 5 rows that closes to about 0.2, and both curves settle at 4, the noise floor; at our n = 10 the gap of 1.73 is the variance we saw as leave-one-out 7.25 against training 4.6. The 1-NN memoriser always has zero training error, and its validation error falls from 46 to 8 but levels off near 8, twice the noise variance, because it copies one neighbour's noise; the gap never closes. The same plot at a larger scale on the sine data, using scikit-learn's <code>learning_curve</code>, which fits on the first n training rows of each split and scores on the validation part:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import learning_curve, ShuffleSplit
from sine import sample

X, y = sample(600, np.random.default_rng(1))
cv = ShuffleSplit(n_splits=20, test_size=0.2, random_state=0)   # 20 random 80/20 splits
for name, d in [("degree 1 (too simple)", 1), ("degree 12 (very flexible)", 12)]:
    model = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression())
    n, tr, va = learning_curve(model, X, y, train_sizes=[15, 30, 60, 120, 240, 480], cv=cv,
                               scoring="neg_mean_squared_error")
    print(name)
    for k in range(len(n)):
        trm, vam = -np.median(tr[k]), -np.median(va[k])   # median over the 20 splits
        print(f"  n={n[k]:4d}  train MSE={trm:6.3f}  val MSE={vam:7.3f}  gap={vam - trm:6.3f}")</div>
  <div class="fx" data-lang="text">degree 1 (too simple)
  n=  15  train MSE= 0.217  val MSE=  0.308  gap= 0.091
  n=  30  train MSE= 0.270  val MSE=  0.304  gap= 0.033
  n=  60  train MSE= 0.252  val MSE=  0.299  gap= 0.047
  n= 120  train MSE= 0.285  val MSE=  0.294  gap= 0.009
  n= 240  train MSE= 0.278  val MSE=  0.293  gap= 0.015
  n= 480  train MSE= 0.289  val MSE=  0.292  gap= 0.003
degree 12 (very flexible)
  n=  15  train MSE= 0.033  val MSE=  2.059  gap= 2.026
  n=  30  train MSE= 0.061  val MSE=  0.174  gap= 0.113
  n=  60  train MSE= 0.080  val MSE=  0.134  gap= 0.054
  n= 120  train MSE= 0.088  val MSE=  0.109  gap= 0.021
  n= 240  train MSE= 0.094  val MSE=  0.105  gap= 0.011
  n= 480  train MSE= 0.097  val MSE=  0.102  gap= 0.005</div>
    <figure class="viz"><svg viewBox="0 0 650 235" width="650">
<line x1="55" y1="190" x2="295" y2="190" stroke="currentColor" opacity="0.5"/>
<line x1="55" y1="30" x2="55" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="55" y="204" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="55" y1="190" x2="55" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="151" y="204" text-anchor="middle" class="tm" font-size="10.5">60</text>
<line x1="151" y1="190" x2="151" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="247" y="204" text-anchor="middle" class="tm" font-size="10.5">240</text>
<line x1="247" y1="190" x2="247" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="295" y="204" text-anchor="middle" class="tm" font-size="10.5">480</text>
<line x1="295" y1="190" x2="295" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="50" y="193.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="52" y1="190" x2="55" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="50" y="153.5" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="52" y1="150" x2="55" y2="150" stroke="currentColor" opacity="0.5"/>
<text x="50" y="113.5" text-anchor="end" class="tm" font-size="10.5">0.2</text>
<line x1="52" y1="110" x2="55" y2="110" stroke="currentColor" opacity="0.5"/>
<text x="50" y="73.5" text-anchor="end" class="tm" font-size="10.5">0.3</text>
<line x1="52" y1="70" x2="55" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="50" y="33.5" text-anchor="end" class="tm" font-size="10.5">0.4</text>
<line x1="52" y1="30" x2="55" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="55" y1="154" x2="295" y2="154" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<text x="293" y="150" text-anchor="end" class="tm" font-size="10.5">noise</text>
<polyline points="55,103.2 103,82 151,89.2 199,76 247,78.8 295,74.4" fill="none" class="sb" stroke-width="2"/>
<circle cx="55" cy="103.2" r="3" class="tb"/>
<circle cx="103" cy="82" r="3" class="tb"/>
<circle cx="151" cy="89.2" r="3" class="tb"/>
<circle cx="199" cy="76" r="3" class="tb"/>
<circle cx="247" cy="78.8" r="3" class="tb"/>
<circle cx="295" cy="74.4" r="3" class="tb"/>
<text x="230" y="128" class="tb" font-size="11.5">train</text>
<polyline points="55,66.8 103,68.4 151,70.4 199,72.4 247,72.8 295,73.2" fill="none" class="sr" stroke-width="2"/>
<circle cx="55" cy="66.8" r="3" class="tr"/>
<circle cx="103" cy="68.4" r="3" class="tr"/>
<circle cx="151" cy="70.4" r="3" class="tr"/>
<circle cx="199" cy="72.4" r="3" class="tr"/>
<circle cx="247" cy="72.8" r="3" class="tr"/>
<circle cx="295" cy="73.2" r="3" class="tr"/>
<text x="120" y="60" class="tr" font-size="11.5">validation</text>
<text x="175" y="220" text-anchor="middle" class="tm" font-size="11">training rows (log)</text>
<text x="21" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 21 110)">MSE</text>
<text x="175" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 1: HIGH BIAS</text>
<line x1="385" y1="190" x2="625" y2="190" stroke="currentColor" opacity="0.5"/>
<line x1="385" y1="30" x2="385" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="385" y="204" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="385" y1="190" x2="385" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="481" y="204" text-anchor="middle" class="tm" font-size="10.5">60</text>
<line x1="481" y1="190" x2="481" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="577" y="204" text-anchor="middle" class="tm" font-size="10.5">240</text>
<line x1="577" y1="190" x2="577" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="625" y="204" text-anchor="middle" class="tm" font-size="10.5">480</text>
<line x1="625" y1="190" x2="625" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="380" y="193.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="382" y1="190" x2="385" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="380" y="153.5" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="382" y1="150" x2="385" y2="150" stroke="currentColor" opacity="0.5"/>
<text x="380" y="113.5" text-anchor="end" class="tm" font-size="10.5">0.2</text>
<line x1="382" y1="110" x2="385" y2="110" stroke="currentColor" opacity="0.5"/>
<text x="380" y="73.5" text-anchor="end" class="tm" font-size="10.5">0.3</text>
<line x1="382" y1="70" x2="385" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="380" y="33.5" text-anchor="end" class="tm" font-size="10.5">0.4</text>
<line x1="382" y1="30" x2="385" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="385" y1="154" x2="625" y2="154" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<polyline points="385,176.8 433,165.6 481,158 529,154.8 577,152.4 625,151.2" fill="none" class="sb" stroke-width="2"/>
<circle cx="385" cy="176.8" r="3" class="tb"/>
<circle cx="433" cy="165.6" r="3" class="tb"/>
<circle cx="481" cy="158" r="3" class="tb"/>
<circle cx="529" cy="154.8" r="3" class="tb"/>
<circle cx="577" cy="152.4" r="3" class="tb"/>
<circle cx="625" cy="151.2" r="3" class="tb"/>
<text x="470" y="182" class="tb" font-size="11.5">train</text>
<polyline points="385,30 433,120.4 481,136.4 529,146.4 577,148 625,149.2" fill="none" class="sr" stroke-width="2"/>
<circle cx="385" cy="30" r="3" class="tr"/>
<circle cx="433" cy="120.4" r="3" class="tr"/>
<circle cx="481" cy="136.4" r="3" class="tr"/>
<circle cx="529" cy="146.4" r="3" class="tr"/>
<circle cx="577" cy="148" r="3" class="tr"/>
<circle cx="625" cy="149.2" r="3" class="tr"/>
<text x="430" y="70" class="tr" font-size="11.5">validation (2.06 at n=15 ↑)</text>
<text x="505" y="220" text-anchor="middle" class="tm" font-size="11">training rows (log)</text>
<text x="351" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 351 110)">MSE</text>
<text x="505" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 12: HIGH VARIANCE at small n</text>
<text x="392" y="150" class="tm" font-size="11">noise</text>
</svg><figcaption>Left: a line on sine data. The curves meet quickly at about 0.29, far above the noise floor 0.09: more data cannot help, the model is too simple. Right: a degree-12 polynomial. A huge gap at small n that closes as data grows, ending near the noise floor: more data helped a lot.</figcaption></figure>
  <p>On the left, a line on sine data: the curves meet quickly at about 0.29, far above the noise floor of 0.09, and stay there from 60 rows to 480. More data cannot help; the model is too simple. On the right, a degree-12 polynomial: a huge gap at 15 rows (2.06 against 0.03) that closes steadily as data grows, ending at about 0.10, near the floor. More data helped a lot. Reading a learning curve therefore comes down to a few patterns. Both curves flat, close together and high above the target error mean high bias, and more data will not help. Training far below validation, with the gap shrinking as n grows, means high variance, and more data will help. A big gap that is <em>not</em> shrinking at the right edge means variance that data alone will fix only slowly, so also regularise or change the model. Both curves close together near the target mean a good fit. And validation better than training at every size is suspicious: check for leakage, or for regularization such as dropout that is only switched on during training. When building learning curves on sorted data, shuffle first, or the small subsets are not representative.</p>

  <h2 id="bv-vc"><span class="num">09</span>Validation Curves</h2>
  <p>A learning curve fixes the model and varies the amount of data. The opposite plot fixes the data and varies one capacity knob, and it is how you actually choose a degree, a depth, a k or a penalty. A <strong>validation curve</strong> picks one hyperparameter, computes cross-validated training and validation error for each of its values, and plots both against it. It is the U-curve of section 06, measured on real data instead of simulated. With only ten flats, leave-one-out (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>) is the natural validation: each value of the knob is fitted ten times on nine flats and tested on the tenth.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import validation_curve, LeaveOneOut

x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)   # the ten flats
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)

train, loo = [], []                           # knob 1: polynomial degree, scored by leave-one-out
for d in range(8):
    train.append(((np.polynomial.Polynomial.fit(x, y, d)(x) - y) ** 2).mean())
    loo.append(np.mean([(np.polynomial.Polynomial.fit(np.delete(x, i), np.delete(y, i), d)(x[i]) - y[i]) ** 2
                        for i in range(10)]))
print("degree:      ", "  ".join(f"{d:7d}" for d in range(8)))
print("  train MSE: ", "  ".join(f"{v:7.1f}" for v in train))
print("  LOOCV MSE: ", "  ".join(f"{v:7.1f}" for v in loo))

ks = list(range(1, 10))                       # knob 2: k in kNN (capacity goes DOWN as k goes up)
tr, va = validation_curve(KNeighborsRegressor(), x[:, None], y, param_name="n_neighbors", param_range=ks,
                          cv=LeaveOneOut(), scoring="neg_mean_squared_error")
print("kNN k:       ", "  ".join(f"{k:7d}" for k in ks))
print("  train MSE: ", "  ".join(f"{v:7.1f}" for v in np.abs(tr.mean(1))))
print("  LOOCV MSE: ", "  ".join(f"{v:7.1f}" for v in np.abs(va.mean(1))))</div>
  <div class="fx" data-lang="text">degree:             0        1        2        3        4        5        6        7
  train MSE:    301.6      4.6      4.5      3.3      3.1      2.9      2.7      1.7
  LOOCV MSE:    372.3      7.3     12.0     10.0     19.2     38.0    613.9   6072.9
kNN k:              1        2        3        4        5        6        7        8        9
  train MSE:      0.0     15.7     21.7     40.7     62.9     96.8    148.7    210.0    297.9
  LOOCV MSE:     61.1     36.9     59.8     78.4    107.3    149.7    212.3    277.4    372.3</div>
  <p>Training error only ever falls as the degree grows (301.6 down to 1.7), as it must. The leave-one-out error is a sharp U with its bottom at degree 1 (7.3), then 12.0, 10.0, 19.2 and 38.0, and an explosion to 614 and 6,073 at degrees 6 and 7, where nine flats leave almost no room between coefficients and points. On ten flats the straight line is the right capacity, which settles the question that four new flats could not. For kNN the axis runs the other way. k = 1 is the memoriser (training 0, leave-one-out 61.1), k = 2 is best (36.9), and k = 9 averages all nine other flats, giving 372.3, exactly the average predictor's leave-one-out error. Every kNN setting is far worse than the line, because averaging neighbours flattens the slope at the edges. A larger example, tree depth on 200 sine rows with 5-fold CV:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import validation_curve, KFold
from sine import sample

X, y = sample(200, np.random.default_rng(3))
depths = [1, 2, 3, 4, 5, 6, 8, 12, 20]
tr, va = validation_curve(DecisionTreeRegressor(random_state=0), X, y, param_name="max_depth",
                          param_range=depths, cv=KFold(5, shuffle=True, random_state=0),
                          scoring="neg_mean_squared_error")
print("max_depth: ", "  ".join(f"{d:5d}" for d in depths))
print("train MSE: ", "  ".join(f"{v:5.3f}" for v in -tr.mean(1)))
print("val MSE:   ", "  ".join(f"{v:5.3f}" for v in -va.mean(1)))</div>
  <div class="fx" data-lang="text">max_depth:      1      2      3      4      5      6      8     12     20
train MSE:  0.177  0.125  0.078  0.065  0.055  0.043  0.025  0.005  0.000
val MSE:    0.203  0.133  0.104  0.107  0.119  0.135  0.154  0.176  0.184</div>
  <p>Depths 1 and 2 underfit (validation 0.203 and 0.133). Depth 3 is best at 0.104, close to the noise floor of 0.09. From depth 4 on, training error keeps falling while validation error rises, reaching 0.184 at depth 20, where training error is 0 because every leaf holds a single row. Two cautions apply to every validation curve. The validation error at the chosen value is slightly optimistic, because you picked the minimum of several noisy numbers (the selection bias of the previous note), so report the final model on an untouched test set or with nested cross-validation. And when two values are within noise of each other, prefer the simpler one; this is often called the one-standard-error rule.</p>

  <h2 id="bv-fix"><span class="num">10</span>Diagnosing and Fixing</h2>
  <p>The curves give symptoms; the last step is turning them into a decision about what to change. A quick diagnosis needs only three numbers. The <strong>baseline error</strong> is the best error you could hope for: an expert's error, a strong existing system, or an estimate of the noise floor. Then the training error and the validation error. <strong>Avoidable bias</strong> is training error minus baseline, how far the model is from what is achievable even on the rows it learned from. <strong>Variance</strong> is validation error minus training error, how much worse it does on unseen rows. Whichever is larger is the problem to work on first. A doctor works the same way: the symptoms decide the medicine, and giving cough syrup for a broken arm wastes time.</p>
  <table class="tbl">
    <tr><th>Project (error %)</th><th>baseline</th><th>train</th><th>validation</th><th>avoidable bias</th><th>variance</th><th>verdict</th></tr>
    <tr><td>A</td><td>1</td><td>9</td><td>10</td><td>8</td><td>1</td><td>high bias</td></tr>
    <tr><td>B</td><td>1</td><td>2</td><td>12</td><td>1</td><td>10</td><td>high variance</td></tr>
    <tr><td>C</td><td>1</td><td>9</td><td>20</td><td>8</td><td>11</td><td>both</td></tr>
    <tr><td>D</td><td>1</td><td>1.5</td><td>2</td><td>0.5</td><td>0.5</td><td>good fit</td></tr>
  </table>
  <p>Project A shows why the baseline matters: if it were 8% instead of 1% (a very noisy problem), the same 9% and 10% would be a good fit. On the flats, take an expert valuer's typical miss of about ₹2 lakh, an MSE of 4, as the baseline, and the training and leave-one-out errors from section 09:</p>
  <div class="fx" data-lang="py">def diagnose(baseline, train_err, val_err):
    avoidable_bias = train_err - baseline     # how far training is from the best achievable
    variance = val_err - train_err            # how much worse on unseen rows
    verdict = "mainly BIAS" if avoidable_bias &gt;= variance else "mainly VARIANCE"
    return round(avoidable_bias, 1), round(variance, 1), verdict

expert = 4.0                                  # an expert valuer misses by about 2 lakh: MSE 4
for name, tr, va in [("mean price", 301.6, 372.3), ("line", 4.6, 7.3), ("degree 6", 2.7, 613.9), ("1-NN", 0.0, 61.1)]:
    print(f"{name:10s}", diagnose(expert, tr, va))</div>
  <div class="fx" data-lang="text">mean price (297.6, 70.7, 'mainly BIAS')
line       (0.6, 2.7, 'mainly VARIANCE')
degree 6   (-1.3, 611.2, 'mainly VARIANCE')
1-NN       (-4.0, 61.1, 'mainly VARIANCE')</div>
  <p>The average price has avoidable bias 297.6 dominating its variance gap: it needs more capacity, any slope at all. Degree 6 and 1-NN have training error <em>below</em> the expert baseline, which is only possible by fitting noise, and huge variance gaps: they need less capacity. The line has avoidable bias of only 0.6 and a variance gap of 2.7: its remaining problem is the variance of estimating two numbers from ten flats, so more sales, a little <a class="xref" data-note="ml_regularization">regularization</a>, or a better feature (locality cut its leave-one-out error to 1.16 in section 07) would help.</p>
  <p>The fixes follow directly from the decomposition. For <strong>high bias</strong> (underfitting): use a more flexible model (higher degree, deeper trees, a bigger network, a kernel), add better or more features, reduce regularization, train longer, or use boosting, which adds capacity step by step. More data of the same kind will not help. For <strong>high variance</strong> (overfitting): get more training data or use data augmentation, strengthen regularization, use a simpler model or fewer features, stop training early, or use bagging and random forests to average the variance away. A bigger model or longer training will not help. The workflow is a loop: is training error near the baseline? If not, fix bias and repeat. If so, is validation error near training error? If not, fix variance and repeat. If both are close, check once on the test set. The single most expensive mistake on this page is collecting more data for a high-bias model, which can take months; the learning curve shows the outcome in advance, as the average predictor stuck near 250 at both 40 and 160 sales showed.</p>

  <h2 id="bv-dd"><span class="num">11</span>Double Descent</h2>
  <p>Everything so far says too much capacity hurts: degree 9, with ten coefficients for ten flats, was the worst model we tried. Yet modern neural networks have far more parameters than training rows and still generalise well. The classic U-curve is not the whole story. Keep increasing capacity past the point where the model can fit the training data exactly, called the <strong>interpolation threshold</strong> (roughly "parameters = rows", degree 9 for ten flats). The classic picture says test error keeps rising. In many settings it instead peaks right at the threshold and then <em>falls again</em>, sometimes below the best point of the classic U. This is called <strong>double descent</strong>.</p>
  <p>A small linear demonstration shows it. The target depends a little on each of 300 features, but there are only 40 training rows, and the model sees only the first p features. When p is more than 40 there are infinitely many weight vectors that fit the training rows exactly, and <code>np.linalg.lstsq</code> returns the one with the smallest total size, called the <strong>minimum-norm</strong> solution. Ridge regression, which adds a penalty λ on the size of the weights, is fitted alongside for comparison.</p>
  <div class="fx" data-lang="py">import numpy as np

D, n_train, n_test = 300, 40, 2000            # 300 real causes, only 40 training rows
ps = [5, 10, 20, 30, 35, 40, 45, 50, 70, 100, 200, 300]
res = {p: [] for p in ps}
for seed in range(30):                        # 30 repeats, report the median
    rng = np.random.default_rng(seed)
    beta = rng.normal(0, 1, D) / np.sqrt(D)  # every feature matters a little
    X_tr, X_te = rng.normal(size=(n_train, D)), rng.normal(size=(n_test, D))
    y_tr = X_tr @ beta + rng.normal(0, 0.3, n_train)
    y_te = X_te @ beta + rng.normal(0, 0.3, n_test)
    for p in ps:                              # the model sees only the first p features
        A, B = X_tr[:, :p], X_te[:, :p]
        w, *_ = np.linalg.lstsq(A, y_tr, rcond=None)                    # minimum-norm fit if p &gt; n
        w_r = np.linalg.solve(A.T @ A + 5.0 * np.eye(p), A.T @ y_tr)    # ridge, lambda = 5
        res[p].append((((A @ w - y_tr) ** 2).mean(), ((B @ w - y_te) ** 2).mean(), ((B @ w_r - y_te) ** 2).mean()))
print("  p   train MSE   test MSE   ridge test MSE")
for p in ps:
    v = np.median(np.array(res[p]), axis=0)
    print(f"{p:4d} {v[0]:10.3f} {v[1]:10.3f} {v[2]:12.3f}")</div>
  <div class="fx" data-lang="text">  p   train MSE   test MSE   ridge test MSE
   5      0.894      1.197        1.165
  10      0.730      1.331        1.244
  20      0.416      2.014        1.520
  30      0.200      3.959        1.823
  35      0.069      5.977        1.823
  40      0.000     56.630        1.781
  45      0.000      7.355        1.775
  50      0.000      4.453        1.737
  70      0.000      2.029        1.575
 100      0.000      1.410        1.331
 200      0.000      1.082        1.075
 300      0.000      0.962        0.961</div>
  <p>On the left of the table is the classic U: test error is lowest with few features (1.20 at p = 5) and climbs as p approaches 40, while training error falls towards zero. At p = 40, where the number of features equals the number of rows, training error is exactly 0 and test error spikes to 56.6. Then, as p keeps growing, test error falls again, to 2.03 at p = 70, 1.08 at p = 200 and 0.96 at p = 300, lower than the first minimum. The ridge column never spikes: 1.78 at p = 40.</p>
  <p>Why does this happen? At p = n there is exactly one weight vector that fits all 40 rows, noise included, and to hit every noisy point it needs enormous weights, so its variance explodes; degree 9 on ten flats is the same situation, one curve forced through ten noisy prices. Beyond p = n many weight vectors fit the rows, and the minimum-norm choice spreads the fit thinly over many features and keeps every weight small, which acts as a hidden, <em>implicit</em> regularization; the more features there are, the smaller the weights need to be, so the variance falls again. With explicit regularization the spike disappears. Double descent does not overturn the bias–variance trade-off; it shows that "number of parameters" is a poor measure of capacity. What matters is the effective capacity of the solution the training procedure actually picks, and gradient descent started from zero on a least-squares problem converges to exactly the minimum-norm solution, which is one reason heavily over-parameterised networks still generalise. For classical tabular models such as polynomials, trees, kNN and boosting, the ordinary U-curve is still what you will see, so always check with a validation curve.</p>

  <h2 id="bv-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The first mistake is choosing a model by its training score. Training error always favours the most flexible model: the memoriser (training MSE 0) lost to the line, and degree 9 (training MSE 0) lost to degree 1. In code it looks harmless:</p>
  <div class="fx" data-lang="py">print("chosen by training error:", min(range(10), key=lambda d: train_mse[d]))
print("chosen by leave-one-out: ", min(range(8), key=lambda d: loo_mse[d]))</div>
  <div class="fx" data-lang="text">chosen by training error: 9
chosen by leave-one-out:  1</div>
  <p>Training error picks degree 9, the curve that passes through every flat; leave-one-out error, measured on rows each fit did not train on, picks the line. The same mistake in disguise is tuning on the test set: picking the degree or depth with the best test score turns the test set into a validation set, and on the four new flats degree 3 "won" by luck. Choose with a validation split or cross-validation, and use the test set once at the end.</p>
  <p>The second mistake is treating more data as a universal fix. More data shrinks variance only. A high-bias model's learning curve is already flat: the average predictor sat near 250 with 40 or 160 sales. Check the learning curve before paying for data.</p>
  <p>The third is mixing up the meaning of "variance". Model variance is the spread of the prediction at a fixed x across different training sets, not the variance of prices, of a feature, or of predictions across rows. Close to it is getting the kNN direction backwards: small k means high capacity and high variance, large k means low capacity and high bias (k = 9 on ten flats is the average predictor). Interviewers ask this precisely because it runs opposite to most knobs.</p>
  <p>Finally, judging errors without a baseline: 9% training error is high bias if experts get 1%, and a good fit if the Bayes error is 8%. A score that beats any plausible floor usually means leakage, such as a feature computed from the target, duplicates across the split, or scaling fitted on all the data. In scikit-learn, remember that scorers like <code>neg_mean_squared_error</code> return negative numbers, so flip the sign before plotting, or the best model looks worst. And remember that parameter count is not capacity in either direction: a regularised model with many parameters can have low effective capacity, and 1-NN, with none, has the most.</p>

  <h2 id="bv-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Ten flats, area x (100 sq ft) → price y (₹ lakh): A (5, 38), B (6, 49), C (7, 53), D (8, 56), E (9, 67), F (10, 68), G (11, 73), H (12, 83), I (13, 87), J (14, 96); line price = 6x + 10, training MSE 4.6, leave-one-out MSE 7.25. New flats: K (6.4, 47), L (8.7, 64), M (10.3, 70), N (13.6, 93).</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Generalization</b>: low expected loss on new rows from the same distribution. <b>Gap</b> = test error − training error.</li>
    <li><b>Underfitting</b>: a more flexible model would lower both errors. <b>Overfitting</b>: a less flexible one would raise training error but lower validation error.</li>
    <li><b>Capacity</b>: the richness of patterns a model family can fit (degree, depth, 1/k, 1/λ), judged relative to the number of rows.</li>
    <li><b>Bias</b>: f̄(x) − f(x), the average model's distance from the truth. <b>Variance</b>: E[(f̂(x) − f̄(x))²], disagreement between models trained on different samples.</li>
    <li><b>Irreducible error</b>: error of the best possible predictor with these features; <b>Bayes error</b> for classification.</li>
    <li><b>Learning curve</b>: train and validation error vs training size. <b>Validation curve</b>: vs one hyperparameter.</li>
    <li><b>Double descent</b>: test error peaks at parameters ≈ rows and falls again for minimum-norm solutions.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Decomposition</td><td>E[(y − f̂)²] = (f̄ − f)² + E[(f̂ − f̄)²] + σ²</td><td>predictions 64, 66, 66, 68; truth 67; noise ±1: 4 = 1 + 2 + 1</td></tr>
    <tr><td>Variance of a fitted line at x</td><td>σ² [1/n + (x − x̄)² / Σ(x − x̄)²]</td><td>averaged over test areas: 4 × 0.177 = 0.71</td></tr>
    <tr><td>Shrinkage</td><td>MSE(c·x̄) = (c − 1)²μ² + c²σ²/n</td><td>μ = 1, σ = 2, n = 5: best c = 0.556, MSE 0.444</td></tr>
    <tr><td>Bayes error (2 classes)</td><td>E[min(p, 1 − p)]</td><td>(0.1 + 0.5 + 0.2) / 3 = 0.267</td></tr>
    <tr><td>Diagnosis</td><td>avoidable bias = train − baseline; variance = val − train</td><td>line: 0.6 and 2.7</td></tr>
  </table>
  <h3>Bias vs variance</h3>
  <table class="tbl">
    <tr><th></th><th>Bias</th><th>Variance</th><th>Irreducible error</th></tr>
    <tr><td>Meaning</td><td>average model is wrong</td><td>models disagree across samples</td><td>noise given the features</td></tr>
    <tr><td>Symptom</td><td>high training error</td><td>train–validation gap</td><td>a floor nobody beats</td></tr>
    <tr><td>More data</td><td>no help</td><td>helps</td><td>no help</td></tr>
    <tr><td>More capacity</td><td>helps</td><td>hurts</td><td>no help</td></tr>
    <tr><td>Better features</td><td>often helps</td><td>sometimes</td><td>helps</td></tr>
    <tr><td>Typical fixes</td><td>bigger model, features, less regularisation, boosting</td><td>data, regularisation, simpler model, early stopping, bagging</td><td>new features, cleaner labels</td></tr>
  </table>
  <h3>Where common models sit</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Bias</th><th>Variance</th><th>Knob</th></tr>
    <tr><td>Linear / logistic regression</td><td>high if the pattern bends</td><td>low</td><td>features, λ</td></tr>
    <tr><td>Naive Bayes</td><td>high</td><td>very low</td><td>smoothing</td></tr>
    <tr><td>kNN</td><td>low at small k</td><td>high at small k</td><td>k (reversed)</td></tr>
    <tr><td>Deep decision tree</td><td>low</td><td>very high</td><td>depth, leaf size</td></tr>
    <tr><td>Random forest</td><td>low</td><td>reduced by averaging</td><td>max_features, leaf size</td></tr>
    <tr><td>Gradient boosting</td><td>reduced each round</td><td>grows with rounds</td><td>rounds × learning rate, depth</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.model_selection import learning_curve, validation_curve
n, tr, va = learning_curve(model, X, y, train_sizes=[0.1, 0.3, 1.0], cv=cv,
                           scoring="neg_mean_squared_error")          # flip the sign!
tr, va = validation_curve(model, X, y, param_name="max_depth", param_range=[1, 3, 5, 10],
                          cv=cv, scoring="neg_mean_squared_error")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Training error always prefers the most flexible model.</li>
    <li>More data fixes variance, never bias.</li>
    <li>Model variance is across training sets at a fixed x, not across rows.</li>
    <li>kNN's knob is reversed: small k = high variance.</li>
    <li>Judge errors against a baseline; beating the floor means leakage.</li>
    <li>The sweet spot is where slopes cancel, not where the curves cross.</li>
  </ul>

  <h2 id="bv-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is generalization, and why can't training error measure it?</summary><div class="qa-body">Generalization is low expected error on new data from the same distribution. Training error is computed on the rows the model was fitted to, so it rewards memorising: a 1-nearest-neighbour model has zero training error but did worse on new flats (6.5) than a straight line (2.6). Only held-out data or cross-validation estimates generalization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are underfitting and overfitting, and how do you recognise each?</summary><div class="qa-body">Underfitting: the model is too simple, so training and validation errors are both high and close together. Overfitting: the model fits noise, so training error is low and validation error much higher. Compare both errors with a baseline, and look at learning and validation curves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the bias–variance trade-off.</summary><div class="qa-body">Expected test error splits into bias² (the average model's distance from the truth), variance (how much models trained on different samples disagree) and irreducible noise. Increasing capacity lowers bias but raises variance, so test error is U-shaped in capacity and the best model balances the two for the amount of data available.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the decomposition and explain why the cross terms vanish.</summary><div class="qa-body">E[(y − f̂)²] = (f̄ − f)² + E[(f̂ − f̄)²] + σ². Writing y − f̂ = (f − f̂) + ε, the cross term vanishes because test noise has mean zero and is independent of the training set. Writing f − f̂ = (f − f̄) + (f̄ − f̂), the cross term vanishes because f − f̄ is a constant and E[f̄ − f̂] = 0 by the definition of f̄.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Four models predict 64, 66, 66, 68; the truth is 67; the outcome is 66 or 68 equally often. Compute bias², variance and noise.</summary><div class="qa-body">Average prediction 66, so bias² = 1. Variance = (4 + 0 + 0 + 4) / 4 = 2. Noise = 1. Total 4, which matches the direct average of (y − prediction)² over the eight combinations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models typically have high bias, and which high variance?</summary><div class="qa-body">High bias: linear models on curved patterns, Naive Bayes, shallow trees, kNN with large k, heavily regularised models. High variance: deep unpruned trees, kNN with k = 1, high-degree polynomials, large networks without regularisation. Random forests reduce the variance of deep trees; boosting reduces the bias of shallow ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do k in kNN, depth in a tree and λ in ridge move bias and variance?</summary><div class="qa-body">Smaller k: lower bias, higher variance. Deeper tree: lower bias, higher variance. Larger λ: higher bias, lower variance. kNN's knob runs backwards relative to capacity, which is a common trick question.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is irreducible error? Can it ever be reduced?</summary><div class="qa-body">It is the error of the best possible predictor given the features, from noise, missing information and randomness (the Bayes error for classification). No model can beat it with the same features, but new features or cleaner labels lower it: adding locality cut the flats' leave-one-out MSE from 7.25 to 1.16.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a learning curve, and how do you read it?</summary><div class="qa-body">Training and validation error plotted against training-set size. If both are high and meet early, the model has high bias and more data will not help. If there is a large gap that shrinks with more data, the model has high variance and more data will help. The level where they meet estimates bias² plus noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your learning curves converge quickly to a high error. What do you do?</summary><div class="qa-body">It is high bias, so increase capacity: a more flexible model, better or more features, less regularisation, or longer training. Do not collect more data; the converged curve shows it will not move the error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Learning curve vs validation curve?</summary><div class="qa-body">A learning curve varies the amount of training data with the model fixed and answers "will more data help?". A validation curve varies one hyperparameter with the data fixed and answers "which capacity is best?". Both plot training and cross-validated error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you decide whether to work on bias or variance first?</summary><div class="qa-body">Compare three errors: a baseline (expert or best achievable), training and validation. Avoidable bias is training minus baseline; variance is validation minus training. Work on the larger one, then repeat. The baseline matters: 9% training error is high bias if experts get 1%, but fine if the noise floor is 8%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a biased estimator be better than an unbiased one?</summary><div class="qa-body">Yes. Shrinking the sample mean of 5 noisy observations (μ = 1, σ = 2) by a factor of 0.556 adds bias² of about 0.2 but cuts variance from 0.8 to about 0.25, lowering MSE from 0.8 to 0.44. Ridge, lasso and early stopping all use this trade.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is model capacity the same as the number of parameters?</summary><div class="qa-body">No. Ridge has the same parameters as ordinary least squares but lower effective capacity; 1-NN has no parameters but maximal capacity; trained networks have far fewer effective degrees of freedom than parameters. VC dimension is one formal measure (d + 1 for linear classifiers in d dimensions).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging reduce variance, and boosting reduce bias?</summary><div class="qa-body">Bagging averages many high-variance models trained on resampled data; averaging B models whose errors are not perfectly correlated shrinks the variance while leaving bias almost unchanged. Boosting adds weak, high-bias models in sequence, each fixing the errors of the previous ones, so bias falls round by round (and variance slowly rises).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is double descent?</summary><div class="qa-body">Test error versus number of parameters shows the classic U, a spike at the interpolation threshold (parameters ≈ rows), then a second fall. At the threshold the only exact fit needs huge weights; beyond it, minimum-norm solutions spread the fit and act as implicit regularisation. Explicit regularisation such as ridge removes the spike.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your validation error is lower than your training error. What could explain it?</summary><div class="qa-body">A small or easy validation set (luck), regularisation active only during training (dropout, augmentation), training error recorded while weights were still changing, or leakage from validation into training features. Check with more folds and inspect the pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is there a bias–variance decomposition for classification accuracy?</summary><div class="qa-body">Not an additive one. For 0-1 loss, variance can even help when the average model is wrong, and several competing definitions exist. The clean sum bias² + variance + noise holds only for squared error, but the practical lessons (the capacity trade-off, averaging reduces variance) still apply.</div></details>
</main>
`
});
