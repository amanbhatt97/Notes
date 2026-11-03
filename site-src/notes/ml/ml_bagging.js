// notes/ml/ml_bagging.js — Bagging & Bootstrap
Object.assign(TOPIC_CONTENT, {
  "ml_bagging": `<main>
  <h1>Bagging &amp; Bootstrap</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Bagging</span><span>Bagging &amp; Bootstrap</span></div>
  <p class="lead">A single deep decision tree is a nervous model: change a few training rows and it grows into a quite different tree, with different mistakes. <strong>Bagging</strong> (short for <em>bootstrap aggregating</em>, Leo Breiman, 1996) calms it down by training many trees on slightly different copies of the training data and averaging their answers. The copies are made with the <strong>bootstrap</strong>, a simple trick for turning one table into many: draw rows at random, putting each one back after it is drawn. This idea is the foundation of the random forest and Extra Trees, and it explains one of the most useful ideas in machine learning: why averaging reduces variance but never bias. Small calculations on this page use the running example of the tree notes, the cricket captain's 14-day diary of weather, matches played and club turnout; the large experiments use the shared 20,000-customer churn table, so every number can be checked.</p>

  <h2 id="bag-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Bagging &amp; Bootstrap</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Bootstrap</div>
        <ul>
          <li>Draw n rows <b>with replacement</b> from n rows</li>
          <li>Some rows repeat, about 36.8% are left out</li>
          <li>(1 − 1/n)ⁿ → 1/e: a sample holds ≈ 63.2% of distinct rows</li>
          <li>Originally (Efron 1979): error bars without formulas</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bagging</div>
        <ul>
          <li>Fit the same model on B bootstrap samples</li>
          <li>Numbers: average · classes: vote or average probabilities</li>
          <li>Members are independent → train in parallel</li>
          <li>Works with any base model, not only trees</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why it works</div>
        <ul>
          <li>Var = ρσ² + (1 − ρ)σ²/B → floor ρσ²</li>
          <li>Bias stays the same as one member</li>
          <li>Helps <b>unstable</b> models (deep trees +0.104)</li>
          <li>Useless for <b>stable</b> ones (stumps, logistic regression ≈ 0)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extras</div>
        <ul>
          <li><b>Out-of-bag</b> score: free validation from left-out rows</li>
          <li>Pasting, random subspaces, random patches</li>
          <li>sklearn: <code>BaggingClassifier</code> / <code>BaggingRegressor</code></li>
          <li>Trees stay alike → Random Forest</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="bag-boot"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Bootstrap</span><span class="rm-sub">many training sets from one table</span></div></div>
      <div class="rm-item rm-done" data-target="bag-632"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The 63.2% Rule</span><span class="rm-sub">how much of the data each sample holds</span></div></div>
      <div class="rm-item rm-done" data-target="bag-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Bagging Algorithm</span><span class="rm-sub">train on each sample, then average or vote</span></div></div>
      <div class="rm-item rm-done" data-target="bag-why"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Why Variance Drops but Bias Does Not</span><span class="rm-sub">the formula, measured</span></div></div>
      <div class="rm-item rm-done" data-target="bag-stable"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Stable and Unstable Learners</span><span class="rm-sub">which models are worth bagging</span></div></div>
      <div class="rm-item rm-done" data-target="bag-oob"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Out-of-Bag Error</span><span class="rm-sub">a free test from the left-out rows</span></div></div>
      <div class="rm-item rm-done" data-target="bag-var"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pasting, Random Subspaces and Random Patches</span><span class="rm-sub">other ways to make members differ</span></div></div>
      <div class="rm-item rm-done" data-target="bag-sk"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Bagging in scikit-learn</span><span class="rm-sub">parameters and what is kept after fitting</span></div></div>
      <div class="rm-item rm-done" data-target="bag-scratch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Bagging From Scratch</span><span class="rm-sub">the whole algorithm in 25 lines</span></div></div>
      <div class="rm-item rm-done" data-target="bag-res"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Results at Scale</span><span class="rm-sub">one tree vs a bag, and the family side by side</span></div></div>
      <div class="rm-item rm-done" data-target="bag-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">stable models, OOB, time order</span></div></div>
      <div class="rm-item rm-done" data-target="bag-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, numbers</span></div></div>
      <div class="rm-item rm-done" data-target="bag-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions asked about bagging</span></div></div>
    </div>
  </div>

  <h2 id="bag-boot"><span class="num">01</span>The Bootstrap</h2>
  <p>The <a class="xref" data-note="ml_ensembles">Ensemble Learning</a> note showed that a team of models beats its members only when the members make <em>different</em> mistakes. If every member makes the same mistake, the average makes it too. So the first practical question of any ensemble is: where do different members come from? The ideal answer would be to collect a hundred fresh training sets from the real world and train one model on each. In real work we never have that luxury. We have one table.</p>
  <p>Training the same algorithm twice on that one table does not help, because a decision tree is deterministic: the same rows give the same tree. Here is the captain's diary, which lives in a small file <code>play.py</code> used by every diary example on this page (Outlook, Temp, Humidity and Wind are the weather; Play says whether a match was played; HumPct is the humidity reading; Turnout is how many club members came):</p>
  <div class="fx" data-lang="py">import pandas as pd
rows = [  # Outlook,   Temp,  Humidity, Wind,    Play, HumPct, TempC, Turnout
    ("Sunny",    "Hot",  "High",   "Weak",   "No",  85,  29, 24),
    ("Sunny",    "Hot",  "High",   "Strong", "No",  90,  27, 20),
    ("Overcast", "Hot",  "High",   "Weak",   "Yes", 86,  28, 36),
    ("Rain",     "Mild", "High",   "Weak",   "Yes", 96,  21, 32),
    ("Rain",     "Cool", "Normal", "Weak",   "Yes", 80,  20, 44),
    ("Rain",     "Cool", "Normal", "Strong", "No",  70,  18, 22),
    ("Overcast", "Cool", "Normal", "Strong", "Yes", 65,  18, 42),
    ("Sunny",    "Mild", "High",   "Weak",   "No",  95,  22, 26),
    ("Sunny",    "Cool", "Normal", "Weak",   "Yes", 70,  21, 40),
    ("Rain",     "Mild", "Normal", "Weak",   "Yes", 80,  24, 46),
    ("Sunny",    "Mild", "Normal", "Strong", "Yes", 70,  24, 38),
    ("Overcast", "Mild", "High",   "Strong", "Yes", 90,  22, 38),
    ("Overcast", "Hot",  "Normal", "Weak",   "Yes", 75,  27, 48),
    ("Rain",     "Mild", "High",   "Strong", "No",  91,  22, 20)]
df = pd.DataFrame(rows, columns=["Outlook", "Temp", "Humidity", "Wind", "Play", "HumPct", "TempC", "Turnout"])
df.index = [f"D{i}" for i in range(1, 15)]</div>
  <p>Two trees that predict the turnout from humidity and temperature, built with different random seeds, are the same tree:</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeRegressor
from play import df
X, y = df[["HumPct", "TempC"]], df.Turnout
a = DecisionTreeRegressor(random_state=0).fit(X, y)
b = DecisionTreeRegressor(random_state=1).fit(X, y)        # a second tree, same 14 days
print("tree a, first cut:", X.columns[a.tree_.feature[0]], "&lt;=", a.tree_.threshold[0])
print("tree b, first cut:", X.columns[b.tree_.feature[0]], "&lt;=", b.tree_.threshold[0])
print("same predictions on all 14 days:", (a.predict(X) == b.predict(X)).all())</div>
  <div class="fx" data-lang="text">tree a, first cut: HumPct &lt;= 82.5
tree b, first cut: HumPct &lt;= 82.5
same predictions on all 14 days: True</div>
  <p>Both trees ask "is humidity at most 82.5%?" first and agree on every day. Averaging them would change nothing. We need a way to give each member a <em>slightly different</em> training set, while still using only the data we have.</p>
  <p>That way is the <strong>bootstrap</strong>: a bootstrap sample of a table with n rows is n rows drawn at random <em>with replacement</em>, meaning each drawn row is put back before the next draw. Because rows go back, the same row can be drawn twice or three times, and some rows are never drawn at all. The sample has the same size as the original table, but a different mix of rows. Think of a school lucky draw where every chit is put back into the box after its name is read out. Draw 14 times from 14 chits and some names come up twice while others never come up. Do it again and you get a different list. Each list is a slightly different "class" made from the same students.</p>
  <p>The idea behind it is that our table is our best picture of the real world. If we cannot sample new rows from the world, we sample from the table instead, treating each row as one possible example the world could have given us. Here are three bootstrap samples of the diary. The code draws 14 random day numbers between 0 and 13 (repeats allowed), then counts how often each day appears:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
days = list(df.index)                                     # D1 ... D14
rng = np.random.default_rng(171)
for b in range(3):
    pick = rng.integers(0, 14, 14)                        # 14 draws, each from all 14 days
    sample = [days[i] for i in pick]
    counts = [sample.count(d) for d in days]
    oob = [d for d, c in zip(days, counts) if c == 0]
    print(f"sample {b+1}: {len(set(sample)):2d} different days; counts {counts}; never drawn {oob}")</div>
  <div class="fx" data-lang="text">sample 1:  9 different days; counts [0, 1, 0, 1, 1, 1, 2, 3, 0, 1, 2, 2, 0, 0]; never drawn ['D1', 'D3', 'D9', 'D13', 'D14']
sample 2: 11 different days; counts [1, 0, 0, 2, 2, 0, 1, 2, 1, 1, 1, 1, 1, 1]; never drawn ['D2', 'D3', 'D6']
sample 3:  7 different days; counts [2, 1, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 5]; never drawn ['D4', 'D5', 'D6', 'D7', 'D8', 'D11', 'D12']</div>
  <p>Read the counts as a list for D1 to D14. Sample 1 used only 9 different days: D8 appears three times, D7, D11 and D12 twice, and D1, D3, D9, D13 and D14 are missing. Sample 3 is extreme: D14, a rainy, windy, humid day with no match, appears five times, and seven days are missing. Each column of counts still adds up to 14. A tree trained on sample 3 will lean heavily on D14; a tree trained on sample 1 never sees it. That is exactly what we wanted: each sample pushes its model in a slightly different direction. The days a sample never drew are called its <strong>out-of-bag</strong> days, and they will turn out to be very useful in section 06.</p>
  <p>The bootstrap is older than bagging. Bradley Efron invented it in 1979 to answer a statistics question: "how uncertain is my estimate?" The mean turnout in the diary is 34 members. How much would that mean move if the captain had recorded a different 14 evenings? We cannot go back in time, but we can resample the 14 turnouts many times, compute the mean of each resample, and look at how much those means spread:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y = df.Turnout.values                                     # members who came, D1..D14
print("mean turnout:", y.mean())
rng = np.random.default_rng(0)
means = [rng.choice(y, size=len(y), replace=True).mean() for _ in range(10_000)]
print(f"bootstrap SE of the mean: {np.std(means):.2f}")
print(f"textbook SE s/sqrt(n):    {y.std() / np.sqrt(len(y)):.2f}")
print("95% bootstrap interval:", np.percentile(means, [2.5, 97.5]).round(1))</div>
  <div class="fx" data-lang="text">mean turnout: 34.0
bootstrap SE of the mean: 2.56
textbook SE s/sqrt(n):    2.56
95% bootstrap interval: [29.  38.9]</div>
  <p>The spread of the 10,000 resampled means, 2.56 members, is exactly the textbook standard error s/√n (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>), and the middle 95% of them runs from 29.0 to 38.9 members. The value of the trick is that it works for any statistic, including ones with no textbook formula, such as a median or a model's accuracy. Breiman's insight in 1996 was to use the same resampling for a different purpose: not to <em>measure</em> how much an estimate wobbles, but to <em>average the wobble away</em>.</p>

  <h2 id="bag-632"><span class="num">02</span>The 63.2% Rule</h2>
  <p>Our three diary samples kept 9, 11 and 7 of the 14 days. That is not luck; there is a simple rule for how much of the data a bootstrap sample contains, and it matters because each member of a bag learns only from the rows in its sample.</p>
  <p>Follow one row, call it row A, through the drawing. In a single draw, the chance of picking A is 1/n, so the chance of <em>not</em> picking it is 1 − 1/n. The n draws are independent, so the chance that A is missed in every one of them is (1 − 1/n) multiplied by itself n times, which is <strong>(1 − 1/n)ⁿ</strong>. For the diary, n = 14 and (13/14)¹⁴ = 0.354: about a third of the days are left out of each sample. Our three samples missed 5, 3 and 7 days, an average of 5 out of 14 = 0.357, right on target.</p>
  <p>For large n this number settles to a famous constant. Take the natural logarithm: ln[(1 − 1/n)ⁿ] = n · ln(1 − 1/n). For a small number x, ln(1 − x) is very close to −x (the first term of its Taylor series, see <a class="xref" data-note="m_calculus">Calculus</a>), so n · ln(1 − 1/n) ≈ n · (−1/n) = −1. Undoing the logarithm, (1 − 1/n)ⁿ → e⁻¹ = 1/e ≈ <strong>0.368</strong>. So each row is left out of a bootstrap sample with probability about 36.8% and included with probability 1 − 1/e ≈ <strong>63.2%</strong>. The code checks the formula for several sizes and then draws one large sample to count how many times each row was picked:</p>
  <div class="fx" data-lang="py">import numpy as np
from math import exp, factorial
for n in [5, 14, 100, 1000, 100_000]:
    out = (1 - 1/n) ** n
    print(f"n = {n:6d}   P(row never picked) = {out:.4f}   share of rows in the sample = {1 - out:.4f}")
print(f"limit: 1/e = {exp(-1):.4f},  1 - 1/e = {1 - exp(-1):.4f}")
rng = np.random.default_rng(0)
n = 100_000
counts = np.bincount(rng.integers(0, n, n), minlength=n)  # how many times each row was drawn
for k in range(4):
    print(f"rows drawn {k} times: {np.mean(counts == k):.3f}   Poisson(1) says {exp(-1) / factorial(k):.3f}")</div>
  <div class="fx" data-lang="text">n =      5   P(row never picked) = 0.3277   share of rows in the sample = 0.6723
n =     14   P(row never picked) = 0.3543   share of rows in the sample = 0.6457
n =    100   P(row never picked) = 0.3660   share of rows in the sample = 0.6340
n =   1000   P(row never picked) = 0.3677   share of rows in the sample = 0.6323
n = 100000   P(row never picked) = 0.3679   share of rows in the sample = 0.6321
limit: 1/e = 0.3679,  1 - 1/e = 0.6321
rows drawn 0 times: 0.368   Poisson(1) says 0.368
rows drawn 1 times: 0.369   Poisson(1) says 0.368
rows drawn 2 times: 0.184   Poisson(1) says 0.184
rows drawn 3 times: 0.060   Poisson(1) says 0.061</div>
  <p>The limit is reached quickly: at n = 100 the share of rows in the sample is already 0.634, and it never falls below 0.632. The second half shows something extra. The number of times a row is drawn follows a <strong>Poisson distribution with mean 1</strong>: 36.8% of rows are drawn zero times, 36.8% once, 18.4% twice and about 6% three times. The sample still has n rows because the duplicates exactly make up for the missing ones.</p>
  <p>This rule has two consequences that the rest of the page builds on. First, each bagged model learns from only about 63% of the distinct rows (some of them repeated), so a single bagged tree is slightly <em>worse</em> than a tree trained on all the rows; the advantage comes entirely from averaging many of them. Second, every model has about 37% of the rows that it never saw, a free test set waiting to be used.</p>

  <h2 id="bag-algo"><span class="num">03</span>The Bagging Algorithm</h2>
  <p>We can now make many different training sets from one. <strong>Bagging</strong> is the simplest way to turn them into a model: draw B bootstrap samples, train the same algorithm on each one to get B models (called the <strong>members</strong> of the bag), and combine their predictions. For a number, such as the turnout, the bag predicts the <strong>average</strong> of the members' numbers. For a class, such as Play, it either takes a <strong>majority vote</strong> of the members' labels or averages their class probabilities and picks the largest. Because no member depends on any other, all B can be trained at the same time on different CPU cores.</p>
<figure class="viz"><svg viewBox="0 0 640 210" width="640">
<defs><marker id="bag-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="80" width="95" height="50" rx="7" class="fs" stroke="currentColor"/><text x="57" y="102" text-anchor="middle" font-size="12">training data</text><text x="57" y="118" text-anchor="middle" class="tm" font-size="11">n rows</text>
<rect x="160" y="14" width="120" height="38" rx="6" class="fb sb" fill-opacity="0.3"/><text x="220" y="37" text-anchor="middle" font-size="12">bootstrap 1</text>
<rect x="160" y="86" width="120" height="38" rx="6" class="fb sb" fill-opacity="0.3"/><text x="220" y="109" text-anchor="middle" font-size="12">bootstrap 2</text>
<rect x="160" y="158" width="120" height="38" rx="6" class="fb sb" fill-opacity="0.3"/><text x="220" y="181" text-anchor="middle" font-size="12">bootstrap B</text>
<line x1="105" y1="95" x2="158" y2="35" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="105" y1="105" x2="158" y2="105" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="105" y1="115" x2="158" y2="175" stroke="currentColor" marker-end="url(#bag-al)"/>
<rect x="320" y="14" width="110" height="38" rx="6" class="ft st" fill-opacity="0.3"/><text x="375" y="37" text-anchor="middle" font-size="12">model h₁</text>
<rect x="320" y="86" width="110" height="38" rx="6" class="ft st" fill-opacity="0.3"/><text x="375" y="109" text-anchor="middle" font-size="12">model h₂</text>
<rect x="320" y="158" width="110" height="38" rx="6" class="ft st" fill-opacity="0.3"/><text x="375" y="181" text-anchor="middle" font-size="12">model h_B</text>
<line x1="280" y1="33" x2="318" y2="33" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="280" y1="105" x2="318" y2="105" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="280" y1="177" x2="318" y2="177" stroke="currentColor" marker-end="url(#bag-al)"/>
<text x="220" y="140" text-anchor="middle" class="tm" font-size="16">⋮</text><text x="375" y="140" text-anchor="middle" class="tm" font-size="16">⋮</text>
<rect x="470" y="78" width="160" height="54" rx="7" class="fg sg" fill-opacity="0.3"/><text x="550" y="100" text-anchor="middle" font-size="12">aggregate</text><text x="550" y="118" text-anchor="middle" class="tm" font-size="11">mean · vote · avg prob</text>
<line x1="430" y1="33" x2="468" y2="92" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="430" y1="105" x2="468" y2="105" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="430" y1="177" x2="468" y2="120" stroke="currentColor" marker-end="url(#bag-al)"/>
</svg><figcaption>Bagging: B bootstrap samples, the same algorithm trained on each one independently, and one combined answer at the end.</figcaption></figure>
  <p>A good everyday picture is a quiz show's "ask the audience". Each audience member has heard a different mix of news and gossip, so each has some random blind spots. Any one of them is unreliable, but the most common answer of a hundred of them is right far more often, because their random mistakes point in different directions and cancel, while the knowledge they share adds up.</p>
  <p>Let us bag three very small models by hand. The task is to predict the turnout from the humidity reading, and the base model is a <strong>stump</strong>: a tree with a single question "is humidity at most t?", which predicts the average turnout on each side. As in <a class="xref" data-note="ml_dtree">Decision Trees</a>, the cut-off t is the midpoint between two humidity readings that gives the smallest sum of squared errors (SSE). Take sample 3 from section 01, whose 14 rows are D1 twice, D2, D3 twice, D9, D10, D13 twice and D14 five times. Try the cut at 82.5. The left side (humidity 80 or below) holds D9 (40), D10 (46) and D13 twice (48, 48): mean 182/4 = 45.5, SSE 30.25 + 0.25 + 6.25 + 6.25 = 43. The right side holds D1 twice (24, 24), D2 (20), D3 twice (36, 36) and D14 five times (20 each): mean 240/10 = 24, SSE 0 + 0 + 16 + 144 + 144 + 5 × 16 = 384. The total, 427, is the smallest of all cuts, so stump 3 is "humidity ≤ 82.5 → 45.5, else 24.0". The code does the same for all three samples and averages:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
x = df.HumPct.values                                      # humidity, %
y = df.Turnout.values.astype(float)                       # members who came
rng = np.random.default_rng(171)
samples = [rng.integers(0, 14, 14) for _ in range(3)]     # the same three bootstrap samples

def best_stump(xs, ys):                                   # one cut, mean on each side, lowest SSE
    best = None
    v = np.unique(xs)
    for t in (v[:-1] + v[1:]) / 2:
        L, R = ys[xs &lt;= t], ys[xs &gt; t]
        sse = ((L - L.mean())**2).sum() + ((R - R.mean())**2).sum()
        if best is None or sse &lt; best[0]:
            best = (sse, t, L.mean(), R.mean())
    return best[1:]

stumps = [best_stump(x[idx], y[idx]) for idx in samples]
for b, (t, l, r) in enumerate(stumps):
    print(f"stump {b+1}: if HumPct &lt;= {t} predict {l:.2f} else {r:.2f}")
P = np.array([[l if xi &lt;= t else r for xi in x] for t, l, r in stumps])   # 3 stumps x 14 days
bag = P.mean(axis=0)                                                      # bagging = the average
for h in [70, 85, 90]:
    i = list(x).index(h)
    print(f"humidity {h}: stumps say {P[:, i].round(2).tolist()} -&gt; bagged {bag[i]:.2f}")
t, l, r = best_stump(x, y)
print(f"one stump on all 14 days: if HumPct &lt;= {t} predict {l:.2f} else {r:.2f}")</div>
  <div class="fx" data-lang="text">stump 1: if HumPct &lt;= 85.0 predict 38.86 else 29.43
stump 2: if HumPct &lt;= 82.5 predict 43.14 else 28.29
stump 3: if HumPct &lt;= 82.5 predict 45.50 else 24.00
humidity 70: stumps say [38.86, 43.14, 45.5] -&gt; bagged 42.50
humidity 85: stumps say [38.86, 28.29, 24.0] -&gt; bagged 30.38
humidity 90: stumps say [29.43, 28.29, 24.0] -&gt; bagged 27.24
one stump on all 14 days: if HumPct &lt;= 82.5 predict 40.00 else 28.00</div>
  <p>Check one prediction by hand: at 85% humidity the stumps say 38.86, 28.29 and 24.00, and (38.86 + 28.29 + 24.00)/3 = 91.15/3 = 30.38. Notice what the disagreement did. Sample 1 happened to contain no day between 80% and 90% humidity, so its stump cut at 85.0 instead of 82.5. Because the members disagree about <em>where</em> to cut, the bag has three levels (42.50 below 82.5, 30.38 at 85, 27.24 above 85) where any single stump can only ever have two. Averaging models that disagree produces a smoother answer than any one of them.</p>
  <p>Classification works the same way. Here the same three samples each grow the full ID3 tree of the Decision Trees note on the four weather columns, and each tree is asked about a new day: Sunny, Mild, Normal humidity, Strong wind.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def H(y):                                                 # entropy in bits
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def id3(d, attrs):                                        # the ID3 tree of the Decision Trees note
    if d.Play.nunique() == 1 or not attrs:
        return d.Play.mode()[0]
    gain = {a: H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(a)) for a in attrs}
    best = max(gain, key=gain.get)
    return (best, d.Play.mode()[0], {v: id3(g, [a for a in attrs if a != best]) for v, g in d.groupby(best)})
def predict(t, row):
    while isinstance(t, tuple):
        t = t[2].get(row[t[0]], t[1])
    return t
cats = ["Outlook", "Temp", "Humidity", "Wind"]
new = {"Outlook": "Sunny", "Temp": "Mild", "Humidity": "Normal", "Wind": "Strong"}
rng = np.random.default_rng(171)
votes = []
for b in range(3):
    d = df.iloc[rng.integers(0, 14, 14)]                  # bootstrap sample of the diary
    t = id3(d, cats)
    votes.append(predict(t, new))
    print(f"tree {b+1}: root question {t[0]:8s} -&gt; new day: {votes[-1]}")
print("majority vote:", max(set(votes), key=votes.count))</div>
  <div class="fx" data-lang="text">tree 1: root question Outlook  -&gt; new day: Yes
tree 2: root question Humidity -&gt; new day: Yes
tree 3: root question Wind     -&gt; new day: No
majority vote: Yes</div>
  <p>Three samples gave three different first questions. Sample 1 still prefers Outlook, the strongest column on the full diary. Sample 2 contains D4 and D5 twice and no D6, so Humidity wins there. Sample 3, flooded with five copies of D14 (strong wind, no match), puts Wind at the root. Trees 1 and 2 say "Yes" for the new day; tree 3, which barely saw a sunny day with normal humidity, says "No". The majority says Yes.</p>
  <p>There are two ways to combine class predictions, and they can disagree. A <strong>hard vote</strong> counts each member's predicted label. A <strong>soft vote</strong> averages each member's predicted probabilities and picks the class with the highest average, so a member that is 95% sure counts for more than one that is 51% sure. scikit-learn's <code>BaggingClassifier</code> uses the soft vote whenever the base model can give probabilities (trees can), and falls back to the hard vote otherwise. For fully grown trees every leaf is pure, so each tree's "probability" is 0 or 1 and the two rules almost always agree; the difference matters for shallower trees or other models.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Combination rule</th><th>Example with 3 members</th></tr>
    <tr><td>Regression</td><td>average of the predictions</td><td>38.86, 28.29, 24.00 → 30.38</td></tr>
    <tr><td>Classification, hard vote</td><td>most common predicted label</td><td>Yes, Yes, No → Yes</td></tr>
    <tr><td>Classification, soft vote</td><td>average the probabilities, take the largest</td><td>P(Yes) 1, 1, 0 → 0.667 → Yes</td></tr>
  </table>

  <h2 id="bag-why"><span class="num">04</span>Why Variance Drops but Bias Does Not</h2>
  <p>The bagged staircase looked smoother, and the vote overruled the odd tree. To know how much bagging helps, and when it stops helping, we need to split a model's error into its two learnable parts (see <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). <strong>Bias</strong> is how far the model's <em>average</em> prediction, over many possible training sets, is from the truth: a systematic mistake. <strong>Variance</strong> is how much the prediction jumps around from one training set to another: a nervous mistake. A deep tree has low bias (it can bend to any pattern) and high variance (it also bends to the noise).</p>
  <p>Averaging attacks variance. If B members each have variance σ² and every pair of them has correlation ρ (0 means their errors are unrelated, 1 means identical), the variance of their average is</p>
  <div class="fx" data-lang="text">Var(average of B members) = ρσ² + (1 − ρ)σ²/B</div>
  <p>The second term shrinks as members are added. The first term, ρσ², does not depend on B at all: it is a floor that no number of members can break through. In bagging the members are never independent, because they were all drawn from the same table, so ρ is always above zero. The code below measures every piece of the formula. It creates 200 different training sets (150 noisy points around the curve y = sin x), bags 25 deep trees on each, records every tree's predictions, and compares the formula with the variance actually observed:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor
rng = np.random.default_rng(0)
xg = np.linspace(0.2, 5.8, 50).reshape(-1, 1)            # 50 points where we watch the predictions
B, T = 25, 200                                           # 25 trees per bag, 200 different training sets
M = np.empty((T, B, len(xg)))                            # every tree's predictions, for every training set
for t in range(T):
    x = rng.uniform(0, 6, 150).reshape(-1, 1)
    y = np.sin(x).ravel() + rng.normal(0, 0.3, 150)      # truth sin(x) plus noise
    bag = BaggingRegressor(DecisionTreeRegressor(), n_estimators=B, random_state=t).fit(x, y)
    M[t] = [tree.predict(xg) for tree in bag.estimators_]
sigma2 = M.var(axis=0).mean(axis=0)                      # variance of ONE tree (over training sets)
cov = np.mean([np.mean((M[:, i] - M[:, i].mean(0)) * (M[:, j] - M[:, j].mean(0)), axis=0)
               for i in range(B) for j in range(i)], axis=0)
rho = cov / sigma2                                        # correlation of two trees from the same bag
print(f"one tree: sigma^2 = {sigma2.mean():.4f};  two trees of one bag: rho = {rho.mean():.2f}")
for b in [1, 5, 25]:
    formula = (rho * sigma2 + (1 - rho) * sigma2 / b).mean()
    measured = M[:, :b].mean(axis=1).var(axis=0).mean()
    print(f"bag of {b:2d}: formula {formula:.4f}   measured {measured:.4f}")
print(f"floor rho*sigma^2 = {(rho * sigma2).mean():.4f}")
truth = np.sin(xg.ravel())
print(f"bias^2  one tree {np.mean((M[:, 0].mean(0) - truth)**2):.4f}   bag of 25 {np.mean((M.mean(1).mean(0) - truth)**2):.4f}")</div>
  <div class="fx" data-lang="text">one tree: sigma^2 = 0.0894;  two trees of one bag: rho = 0.46
bag of  1: formula 0.0894   measured 0.0897
bag of  5: formula 0.0512   measured 0.0518
bag of 25: formula 0.0435   measured 0.0435
floor rho*sigma^2 = 0.0416
bias^2  one tree 0.0004   bag of 25 0.0002</div>
  <p>One deep tree has variance σ² = 0.0894, and two trees from the same bag are correlated at ρ = 0.46. The formula predicts the variance of a bag of 5 as 0.0512 (measured 0.0518) and of 25 as 0.0435 (measured 0.0435). The floor ρσ² = 0.0416 is almost reached by 25 trees: here bagging cuts a deep tree's variance roughly in half, and no further. The last line shows the other half of the story. The bias² of one tree (0.0004) and of the bag (0.0002) are both tiny and essentially unchanged. That is a general fact: the average prediction of a bag is the average of its members' average predictions, so <strong>bagging keeps the bias of its base model</strong>. It only removes variance.</p>
  <p>The picture below shows what that means on one training set of 60 noisy points. One deep tree (red) chases every noisy dot. Each bagged tree chases a <em>different</em> subset of dots, because each saw a different 63% of them, so where they disagree their jumps partly cancel, and the average (blue) leans toward what they share: the real curve (dashed).</p>
<figure class="viz"><svg viewBox="0 0 560 230" width="560">
<line x1="30" y1="110.0" x2="550" y2="110.0" stroke="currentColor" stroke-opacity="0.3"/>
<path d="M30.0,110.0 L32.2,108.5 L34.4,107.0 L36.5,105.5 L38.7,104.0 L40.9,102.6 L43.1,101.1 L45.2,99.6 L47.4,98.2 L49.6,96.7 L51.8,95.3 L53.9,93.8 L56.1,92.4 L58.3,91.0 L60.5,89.6 L62.6,88.2 L64.8,86.8 L67.0,85.4 L69.2,84.1 L71.3,82.7 L73.5,81.4 L75.7,80.1 L77.9,78.8 L80.0,77.6 L82.2,76.4 L84.4,75.1 L86.6,73.9 L88.7,72.8 L90.9,71.6 L93.1,70.5 L95.3,69.4 L97.4,68.3 L99.6,67.3 L101.8,66.2 L104.0,65.3 L106.2,64.3 L108.3,63.4 L110.5,62.4 L112.7,61.6 L114.9,60.7 L117.0,59.9 L119.2,59.1 L121.4,58.4 L123.6,57.6 L125.7,57.0 L127.9,56.3 L130.1,55.7 L132.3,55.1 L134.4,54.6 L136.6,54.0 L138.8,53.6 L141.0,53.1 L143.1,52.7 L145.3,52.3 L147.5,52.0 L149.7,51.7 L151.8,51.4 L154.0,51.2 L156.2,51.0 L158.4,50.9 L160.5,50.7 L162.7,50.7 L164.9,50.6 L167.1,50.6 L169.2,50.7 L171.4,50.7 L173.6,50.8 L175.8,51.0 L177.9,51.2 L180.1,51.4 L182.3,51.7 L184.5,51.9 L186.7,52.3 L188.8,52.6 L191.0,53.1 L193.2,53.5 L195.4,54.0 L197.5,54.5 L199.7,55.0 L201.9,55.6 L204.1,56.2 L206.2,56.9 L208.4,57.5 L210.6,58.3 L212.8,59.0 L214.9,59.8 L217.1,60.6 L219.3,61.4 L221.5,62.3 L223.6,63.2 L225.8,64.2 L228.0,65.1 L230.2,66.1 L232.3,67.1 L234.5,68.2 L236.7,69.2 L238.9,70.3 L241.0,71.5 L243.2,72.6 L245.4,73.8 L247.6,75.0 L249.7,76.2 L251.9,77.4 L254.1,78.7 L256.3,79.9 L258.5,81.2 L260.6,82.6 L262.8,83.9 L265.0,85.2 L267.2,86.6 L269.3,88.0 L271.5,89.4 L273.7,90.8 L275.9,92.2 L278.0,93.6 L280.2,95.0 L282.4,96.5 L284.6,98.0 L286.7,99.4 L288.9,100.9 L291.1,102.4 L293.3,103.8 L295.4,105.3 L297.6,106.8 L299.8,108.3 L302.0,109.8 L304.1,111.3 L306.3,112.8 L308.5,114.3 L310.7,115.7 L312.8,117.2 L315.0,118.7 L317.2,120.2 L319.4,121.6 L321.5,123.1 L323.7,124.5 L325.9,126.0 L328.1,127.4 L330.3,128.8 L332.4,130.2 L334.6,131.6 L336.8,133.0 L339.0,134.4 L341.1,135.7 L343.3,137.1 L345.5,138.4 L347.7,139.7 L349.8,141.0 L352.0,142.2 L354.2,143.5 L356.4,144.7 L358.5,145.9 L360.7,147.1 L362.9,148.2 L365.1,149.4 L367.2,150.5 L369.4,151.5 L371.6,152.6 L373.8,153.6 L375.9,154.6 L378.1,155.6 L380.3,156.5 L382.5,157.4 L384.6,158.3 L386.8,159.2 L389.0,160.0 L391.2,160.8 L393.3,161.5 L395.5,162.3 L397.7,162.9 L399.9,163.6 L402.1,164.2 L404.2,164.8 L406.4,165.4 L408.6,165.9 L410.8,166.4 L412.9,166.8 L415.1,167.2 L417.3,167.6 L419.5,168.0 L421.6,168.3 L423.8,168.5 L426.0,168.8 L428.2,169.0 L430.3,169.1 L432.5,169.2 L434.7,169.3 L436.9,169.4 L439.0,169.4 L441.2,169.3 L443.4,169.3 L445.6,169.2 L447.7,169.0 L449.9,168.9 L452.1,168.6 L454.3,168.4 L456.4,168.1 L458.6,167.8 L460.8,167.4 L463.0,167.0 L465.1,166.6 L467.3,166.1 L469.5,165.6 L471.7,165.1 L473.8,164.5 L476.0,163.9 L478.2,163.2 L480.4,162.5 L482.6,161.8 L484.7,161.1 L486.9,160.3 L489.1,159.5 L491.3,158.7 L493.4,157.8 L495.6,156.9 L497.8,156.0 L500.0,155.0 L502.1,154.0 L504.3,153.0 L506.5,152.0 L508.7,150.9 L510.8,149.8 L513.0,148.7 L515.2,147.6 L517.4,146.4 L519.5,145.2 L521.7,144.0 L523.9,142.8 L526.1,141.5 L528.2,140.2 L530.4,138.9 L532.6,137.6 L534.8,136.3 L536.9,135.0 L539.1,133.6 L541.3,132.2 L543.5,130.8 L545.6,129.4 L547.8,128.0 L550.0,126.6" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/>
<path d="M30.0,94.5 L32.2,94.5 L34.4,89.9 L36.5,89.9 L38.7,114.2 L40.9,114.2 L43.1,114.2 L45.2,114.2 L47.4,95.3 L49.6,95.3 L51.8,95.3 L53.9,95.3 L56.1,68.8 L58.3,98.2 L60.5,85.5 L62.6,88.1 L64.8,88.1 L67.0,88.1 L69.2,69.9 L71.3,69.9 L73.5,69.9 L75.7,69.9 L77.9,69.9 L80.0,69.9 L82.2,69.9 L84.4,69.9 L86.6,69.9 L88.7,69.9 L90.9,69.9 L93.1,70.2 L95.3,70.2 L97.4,70.2 L99.6,70.2 L101.8,70.2 L104.0,70.2 L106.2,70.2 L108.3,70.2 L110.5,70.2 L112.7,70.2 L114.9,70.2 L117.0,70.2 L119.2,70.2 L121.4,70.2 L123.6,57.0 L125.7,57.0 L127.9,57.0 L130.1,57.0 L132.3,57.0 L134.4,57.0 L136.6,57.0 L138.8,57.0 L141.0,57.0 L143.1,47.6 L145.3,47.6 L147.5,47.6 L149.7,47.6 L151.8,49.6 L154.0,74.3 L156.2,74.3 L158.4,74.3 L160.5,74.3 L162.7,74.3 L164.9,72.1 L167.1,72.1 L169.2,72.1 L171.4,72.1 L173.6,72.1 L175.8,74.1 L177.9,74.1 L180.1,74.1 L182.3,74.1 L184.5,74.1 L186.7,36.6 L188.8,36.6 L191.0,36.6 L193.2,36.6 L195.4,36.6 L197.5,60.6 L199.7,72.1 L201.9,72.1 L204.1,72.1 L206.2,72.1 L208.4,72.1 L210.6,82.5 L212.8,82.5 L214.9,82.5 L217.1,82.5 L219.3,82.5 L221.5,82.5 L223.6,82.5 L225.8,58.2 L228.0,58.2 L230.2,58.2 L232.3,86.7 L234.5,86.7 L236.7,92.4 L238.9,92.4 L241.0,61.2 L243.2,61.2 L245.4,61.2 L247.6,61.2 L249.7,101.2 L251.9,101.2 L254.1,101.2 L256.3,101.2 L258.5,86.2 L260.6,84.3 L262.8,84.3 L265.0,84.3 L267.2,84.3 L269.3,84.3 L271.5,84.3 L273.7,84.3 L275.9,107.1 L278.0,107.1 L280.2,107.1 L282.4,107.1 L284.6,107.1 L286.7,107.1 L288.9,107.1 L291.1,103.8 L293.3,80.0 L295.4,113.3 L297.6,129.5 L299.8,129.5 L302.0,129.5 L304.1,129.5 L306.3,129.5 L308.5,154.0 L310.7,154.0 L312.8,154.0 L315.0,154.0 L317.2,154.0 L319.4,125.2 L321.5,125.2 L323.7,125.2 L325.9,125.2 L328.1,125.2 L330.3,125.2 L332.4,125.2 L334.6,125.2 L336.8,125.2 L339.0,125.2 L341.1,125.2 L343.3,125.2 L345.5,157.7 L347.7,157.7 L349.8,157.7 L352.0,157.7 L354.2,157.7 L356.4,157.7 L358.5,157.7 L360.7,157.7 L362.9,157.7 L365.1,157.7 L367.2,157.7 L369.4,157.7 L371.6,157.7 L373.8,157.7 L375.9,152.0 L378.1,152.0 L380.3,152.0 L382.5,165.5 L384.6,166.2 L386.8,166.2 L389.0,174.3 L391.2,174.3 L393.3,174.3 L395.5,174.3 L397.7,172.3 L399.9,172.3 L402.1,172.3 L404.2,172.3 L406.4,172.3 L408.6,164.5 L410.8,164.5 L412.9,164.5 L415.1,164.5 L417.3,164.5 L419.5,164.5 L421.6,164.5 L423.8,164.5 L426.0,164.5 L428.2,164.5 L430.3,164.5 L432.5,176.0 L434.7,176.0 L436.9,176.0 L439.0,176.0 L441.2,176.0 L443.4,176.0 L445.6,176.0 L447.7,135.1 L449.9,196.9 L452.1,196.9 L454.3,196.9 L456.4,196.9 L458.6,196.9 L460.8,134.8 L463.0,134.8 L465.1,134.8 L467.3,134.8 L469.5,159.4 L471.7,159.4 L473.8,159.4 L476.0,178.6 L478.2,178.6 L480.4,178.6 L482.6,178.6 L484.7,145.3 L486.9,159.8 L489.1,159.8 L491.3,159.8 L493.4,167.9 L495.6,167.9 L497.8,167.7 L500.0,167.7 L502.1,167.7 L504.3,167.7 L506.5,165.2 L508.7,165.2 L510.8,165.2 L513.0,165.2 L515.2,165.2 L517.4,145.8 L519.5,145.8 L521.7,123.4 L523.9,123.4 L526.1,123.4 L528.2,123.4 L530.4,123.4 L532.6,141.0 L534.8,141.0 L536.9,141.0 L539.1,141.0 L541.3,141.0 L543.5,119.4 L545.6,119.4 L547.8,119.4 L550.0,119.4" fill="none" class="sr" stroke-width="1.3"/>
<path d="M30.0,95.1 L32.2,95.1 L34.4,93.1 L36.5,95.8 L38.7,105.8 L40.9,105.8 L43.1,105.4 L45.2,105.4 L47.4,96.6 L49.6,90.1 L51.8,89.2 L53.9,89.1 L56.1,78.0 L58.3,88.6 L60.5,88.4 L62.6,87.8 L64.8,87.8 L67.0,86.5 L69.2,76.4 L71.3,76.4 L73.5,76.4 L75.7,76.2 L77.9,76.2 L80.0,76.2 L82.2,76.2 L84.4,75.2 L86.6,72.1 L88.7,72.1 L90.9,72.1 L93.1,72.2 L95.3,72.0 L97.4,71.8 L99.6,70.2 L101.8,70.2 L104.0,69.7 L106.2,66.9 L108.3,66.7 L110.5,66.7 L112.7,65.2 L114.9,64.7 L117.0,64.7 L119.2,64.6 L121.4,64.6 L123.6,59.2 L125.7,59.2 L127.9,55.4 L130.1,54.2 L132.3,53.9 L134.4,53.9 L136.6,53.9 L138.8,53.9 L141.0,53.9 L143.1,50.0 L145.3,49.6 L147.5,49.6 L149.7,49.6 L151.8,53.2 L154.0,62.9 L156.2,62.9 L158.4,63.0 L160.5,63.1 L162.7,70.4 L164.9,69.7 L167.1,72.0 L169.2,72.0 L171.4,72.0 L173.6,71.8 L175.8,70.4 L177.9,70.4 L180.1,70.4 L182.3,70.4 L184.5,64.6 L186.7,47.4 L188.8,45.7 L191.0,45.6 L193.2,45.6 L195.4,45.6 L197.5,62.1 L199.7,66.3 L201.9,66.4 L204.1,66.4 L206.2,66.4 L208.4,69.2 L210.6,77.1 L212.8,77.4 L214.9,75.8 L217.1,77.6 L219.3,77.8 L221.5,77.7 L223.6,77.7 L225.8,67.1 L228.0,67.8 L230.2,68.2 L232.3,78.7 L234.5,84.1 L236.7,86.6 L238.9,83.2 L241.0,69.8 L243.2,70.9 L245.4,71.8 L247.6,72.4 L249.7,92.7 L251.9,92.5 L254.1,94.1 L256.3,94.1 L258.5,88.2 L260.6,85.0 L262.8,85.0 L265.0,86.4 L267.2,86.6 L269.3,86.6 L271.5,86.8 L273.7,89.3 L275.9,100.0 L278.0,102.8 L280.2,102.6 L282.4,103.1 L284.6,103.1 L286.7,103.1 L288.9,103.1 L291.1,98.6 L293.3,91.6 L295.4,105.1 L297.6,119.6 L299.8,119.6 L302.0,119.6 L304.1,119.8 L306.3,133.9 L308.5,145.0 L310.7,144.6 L312.8,144.6 L315.0,144.6 L317.2,144.6 L319.4,132.8 L321.5,132.8 L323.7,132.8 L325.9,132.8 L328.1,133.1 L330.3,133.1 L332.4,134.3 L334.6,136.5 L336.8,136.5 L339.0,137.0 L341.1,137.6 L343.3,137.6 L345.5,151.4 L347.7,151.4 L349.8,151.2 L352.0,157.1 L354.2,157.1 L356.4,157.4 L358.5,157.4 L360.7,157.4 L362.9,157.4 L365.1,157.4 L367.2,157.4 L369.4,157.4 L371.6,157.4 L373.8,157.4 L375.9,156.2 L378.1,156.8 L380.3,156.8 L382.5,164.5 L384.6,165.1 L386.8,165.1 L389.0,170.8 L391.2,172.7 L393.3,172.7 L395.5,172.7 L397.7,171.8 L399.9,171.9 L402.1,171.9 L404.2,171.9 L406.4,170.8 L408.6,167.4 L410.8,167.4 L412.9,167.4 L415.1,167.6 L417.3,167.6 L419.5,167.7 L421.6,167.6 L423.8,166.5 L426.0,166.5 L428.2,166.5 L430.3,166.5 L432.5,169.9 L434.7,170.4 L436.9,170.4 L439.0,170.4 L441.2,170.4 L443.4,170.4 L445.6,170.4 L447.7,145.6 L449.9,184.3 L452.1,184.3 L454.3,184.3 L456.4,184.3 L458.6,183.4 L460.8,148.4 L463.0,148.4 L465.1,148.4 L467.3,147.2 L469.5,155.1 L471.7,155.1 L473.8,155.1 L476.0,170.8 L478.2,169.5 L480.4,170.2 L482.6,170.2 L484.7,155.8 L486.9,158.5 L489.1,157.5 L491.3,162.8 L493.4,167.4 L495.6,167.4 L497.8,167.3 L500.0,167.2 L502.1,167.4 L504.3,167.2 L506.5,164.7 L508.7,161.1 L510.8,157.3 L513.0,157.1 L515.2,157.1 L517.4,149.0 L519.5,149.0 L521.7,133.8 L523.9,133.1 L526.1,131.5 L528.2,131.0 L530.4,131.0 L532.6,137.7 L534.8,135.4 L536.9,135.4 L539.1,134.9 L541.3,134.9 L543.5,125.8 L545.6,125.8 L547.8,125.8 L550.0,125.8" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="30.6" cy="94.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="37.6" cy="89.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="39.6" cy="114.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="53.5" cy="95.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="55.4" cy="68.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="58.0" cy="98.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="61.6" cy="85.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="63.4" cy="88.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="74.6" cy="69.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="107.5" cy="70.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="135.7" cy="57.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="148.2" cy="47.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="151.9" cy="49.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="152.5" cy="66.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="152.8" cy="35.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="154.9" cy="74.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="171.2" cy="72.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="178.6" cy="74.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="194.6" cy="36.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="196.3" cy="60.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="199.0" cy="72.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="221.3" cy="82.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="229.4" cy="58.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="234.1" cy="86.7" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="237.7" cy="92.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="242.4" cy="61.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="256.2" cy="101.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="257.1" cy="86.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="263.2" cy="84.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="286.4" cy="107.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="291.7" cy="103.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="293.3" cy="80.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="293.7" cy="113.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="298.0" cy="129.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="318.9" cy="154.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="319.2" cy="125.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="369.2" cy="157.7" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="380.7" cy="152.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="381.9" cy="165.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="383.2" cy="166.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="393.2" cy="174.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="397.9" cy="172.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="415.5" cy="164.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="445.4" cy="176.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="445.9" cy="167.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="448.6" cy="135.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="449.2" cy="160.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="450.1" cy="196.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="469.0" cy="134.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="469.4" cy="159.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="482.4" cy="178.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="483.5" cy="145.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="487.4" cy="159.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="495.6" cy="167.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="496.8" cy="167.7" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="515.3" cy="165.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="516.9" cy="145.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="524.5" cy="123.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="536.6" cy="141.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="549.6" cy="119.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="360" y="27" class="tr" font-size="12">red: one deep tree</text>
<text x="360" y="43" class="tb" font-size="12">blue: bagging, 200 trees</text>
<text x="360" y="59" class="tm" font-size="12">dashed: true curve sin(x)</text>
<text x="30" y="224" class="tm" font-size="11">x from 0 to 6 · 60 noisy training points</text>
</svg><figcaption>One deep tree (red) jumps to every noisy point. The average of 200 bagged trees (blue) still bends toward the data, but its jumps are smaller and it stays closer to the true curve (dashed). Drawn from a real run.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor
rng = np.random.default_rng(5)
x = np.sort(rng.uniform(0, 6, 60)).reshape(-1, 1)
y = np.sin(x).ravel() + rng.normal(0, 0.3, 60)
g = np.linspace(0, 6, 400).reshape(-1, 1)
one = DecisionTreeRegressor(random_state=0).fit(x, y).predict(g)
bag = BaggingRegressor(DecisionTreeRegressor(), n_estimators=200, random_state=0).fit(x, y).predict(g)
truth = np.sin(g.ravel())
print("one tree, mean squared distance from sin(x):", round(float(np.mean((one - truth)**2)), 3))
print("bag of 200, mean squared distance from sin(x):", round(float(np.mean((bag - truth)**2)), 3))</div>
  <div class="fx" data-lang="text">one tree, mean squared distance from sin(x): 0.059
bag of 200, mean squared distance from sin(x): 0.028</div>
  <p>On this run the single tree's mean squared distance from the true curve is 0.059 and the bag's is 0.028, about half, which matches the "variance halves" result above. The blue line is not perfectly smooth, because every member is still a deep tree that memorised its own sample, but its error from the truth has halved without anything about the tree itself being changed.</p>
  <p>Two consequences follow directly. Since bagging cannot reduce bias, the members should be <em>low-bias, high-variance</em> models: grow the trees deep and let averaging deal with their nervousness. And since the floor is ρσ², the only way to go further is to make the members less alike, which is exactly what the <a class="xref" data-note="ml_rf">Random Forest</a> does.</p>

  <h2 id="bag-stable"><span class="num">05</span>Stable and Unstable Learners</h2>
  <p>Bagging removes variance and nothing else, so it can only help a model that has variance to remove. Breiman put it in terms of stability. An <strong>unstable learner</strong> is one whose output changes a lot when the training data changes a little; a <strong>stable learner</strong> barely changes. Deep decision trees and neural networks are unstable; linear and logistic regression, k-nearest neighbours with a large k, naive Bayes and stumps are stable. Bagging an unstable learner gives members that disagree (large σ², ρ well below 1) and a real gain; bagging a stable learner gives near-identical copies (ρ close to 1) and almost nothing. Asking 50 photocopies of the same textbook gives one answer 50 times; asking 50 students who each studied a different random part of the notes gives different answers whose majority beats most of them.</p>
  <p>The diary shows the symptom of instability directly. Over 1,000 bootstrap samples, the root question of the ID3 tree changes:</p>
  <div class="fx" data-lang="py">import numpy as np
from collections import Counter
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, a):
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(a))
cats = ["Outlook", "Temp", "Humidity", "Wind"]
rng = np.random.default_rng(0)
roots = Counter()
for _ in range(1000):
    d = df.iloc[rng.integers(0, 14, 14)]                  # a bootstrap sample of the diary
    g = {a: IG(d, a) for a in cats}
    roots[max(g, key=g.get)] += 1                         # the root question this sample's tree would ask
print("root question over 1,000 bootstrap trees:", dict(roots.most_common()))</div>
  <div class="fx" data-lang="text">root question over 1,000 bootstrap trees: {'Outlook': 545, 'Humidity': 255, 'Temp': 108, 'Wind': 92}</div>
  <p>Outlook wins in 545 of 1,000 samples, but Humidity, Temp and Wind each take over in some, so the trees differ from their very first question. That is an unstable learner, and a good candidate for bagging. (Note also that Outlook still wins more than half the time; we will come back to this.)</p>
  <p>To measure the gain properly we need more than 14 rows. All the large experiments in the tree notes use one shared churn table: 20,000 made-up customers with 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixtures of those, 4 are useless) plus two columns of pure noise, split into 12,000 training, 3,000 validation and 5,000 test rows. This setup is saved as <code>churn.py</code>, and every churn block below starts from it:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)</div>
  <p>Now the same bag of 50 members is wrapped around six different base models, and each is compared with the same model trained once:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
learners = {
    "deep tree (no limit)":  DecisionTreeClassifier(random_state=0),
    "tree max_depth=5":      DecisionTreeClassifier(max_depth=5, random_state=0),
    "stump max_depth=1":     DecisionTreeClassifier(max_depth=1, random_state=0),
    "1-nearest neighbour":   make_pipeline(StandardScaler(), KNeighborsClassifier(1)),
    "15-nearest neighbours": make_pipeline(StandardScaler(), KNeighborsClassifier(15)),
    "logistic regression":   make_pipeline(StandardScaler(), LogisticRegression()),
}
for name, m in learners.items():
    one = m.fit(Xtr, ytr).score(Xva, yva)
    bag = BaggingClassifier(m, n_estimators=50, n_jobs=-1, random_state=0).fit(Xtr, ytr).score(Xva, yva)
    print(f"{name:22s} alone {one:.3f}   bagged x50 {bag:.3f}   gain {bag - one:+.3f}")</div>
  <div class="fx" data-lang="text">deep tree (no limit)   alone 0.773   bagged x50 0.877   gain +0.104
tree max_depth=5       alone 0.748   bagged x50 0.799   gain +0.052
stump max_depth=1      alone 0.597   bagged x50 0.598   gain +0.000
1-nearest neighbour    alone 0.746   bagged x50 0.748   gain +0.001
15-nearest neighbours  alone 0.805   bagged x50 0.813   gain +0.008
logistic regression    alone 0.581   bagged x50 0.579   gain -0.002</div>
  <p>The deep tree gains 10.4 points (0.773 → 0.877): it is the most unstable model and gains the most. The depth-5 tree is still somewhat unstable and gains 5.2 points, but its own bias limits it to 0.799. The stump gains nothing: all 50 bootstrap stumps pick the same column and almost the same cut, and their error is bias, which averaging keeps. Logistic regression even loses a little, because averaging 50 nearly identical straight boundaries is still a straight boundary, and its problem (a straight line on a bent pattern) is bias. The 1-nearest-neighbour result surprises many people, since 1-NN is very sensitive to individual points. But duplicates in a bootstrap sample never change which point is nearest, and when a point's nearest neighbour is missing from a sample, the next-nearest usually has the same label, so the 50 members nearly always agree. The rule is simple: bag models that overfit, never models that underfit. If the base model is too simple, use a more flexible one or use <a class="xref" data-note="ml_boosting">boosting</a>, which reduces bias.</p>

  <h2 id="bag-oob"><span class="num">06</span>Out-of-Bag Error</h2>
  <p>To choose the number of members, or to compare a bag with another model, we need its error on rows it was not trained on. Normally that means setting aside a validation set, which costs training data. Bagging offers a test for free. Every member skipped about 37% of the rows. So for each training row we can collect predictions only from the members that did <em>not</em> train on it, combine them, and compare with the true answer. Those members have never seen the row, so their prediction is an honest one. Averaged over all rows, this gives the <strong>out-of-bag (OOB) error</strong>, an estimate of the test error that uses no held-out data. It is like a teacher who sets a different random two-thirds of the syllabus for each practice exam and then marks each student only on questions from the third that student's practice never covered.</p>
  <p>Here it is by hand with the three turnout stumps of section 03. Sample 1 missed D1, D3, D9, D13 and D14; sample 2 missed D2, D3 and D6; sample 3 missed seven days. Each day is predicted only by the stumps that never saw it:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
x, y = df.HumPct.values, df.Turnout.values.astype(float)
rng = np.random.default_rng(171)
samples = [rng.integers(0, 14, 14) for _ in range(3)]     # the same three bootstrap samples
stumps = [(85.0, 38.86, 29.43), (82.5, 43.14, 28.29), (82.5, 45.50, 24.00)]   # from the stump run above
sq = []
for i, day in enumerate(df.index):
    who = [b for b in range(3) if i not in samples[b]]     # stumps whose sample did NOT contain this day
    if not who:
        print(f"{day:3s} in every sample: no out-of-bag prediction"); continue
    pred = np.mean([l if x[i] &lt;= t else r for t, l, r in (stumps[b] for b in who)])
    sq.append((pred - y[i])**2)
    print(f"{day:3s} humidity {x[i]}  true {y[i]:.0f}  judged by stump(s) {[b + 1 for b in who]}  OOB prediction {pred:.2f}")
print(f"OOB MSE over {len(sq)} days: {np.mean(sq):.1f}   (always predicting the mean 34: {np.mean((y - y.mean())**2):.1f})")</div>
  <div class="fx" data-lang="text">D1  humidity 85  true 24  judged by stump(s) [1]  OOB prediction 38.86
D2  humidity 90  true 20  judged by stump(s) [2]  OOB prediction 28.29
D3  humidity 86  true 36  judged by stump(s) [1, 2]  OOB prediction 28.86
D4  humidity 96  true 32  judged by stump(s) [3]  OOB prediction 24.00
D5  humidity 80  true 44  judged by stump(s) [3]  OOB prediction 45.50
D6  humidity 70  true 22  judged by stump(s) [2, 3]  OOB prediction 44.32
D7  humidity 65  true 42  judged by stump(s) [3]  OOB prediction 45.50
D8  humidity 95  true 26  judged by stump(s) [3]  OOB prediction 24.00
D9  humidity 70  true 40  judged by stump(s) [1]  OOB prediction 38.86
D10 in every sample: no out-of-bag prediction
D11 humidity 70  true 38  judged by stump(s) [3]  OOB prediction 45.50
D12 humidity 90  true 38  judged by stump(s) [3]  OOB prediction 24.00
D13 humidity 75  true 48  judged by stump(s) [1]  OOB prediction 38.86
D14 humidity 91  true 20  judged by stump(s) [1]  OOB prediction 29.43
OOB MSE over 13 days: 103.6   (always predicting the mean 34: 91.4)</div>
  <p>D3 was missed by stumps 1 and 2, so its OOB prediction is their average for 86% humidity, (29.43 + 28.29)/2 = 28.86. D10 was in all three samples and gets no OOB prediction at all. Adding the 13 squared errors and dividing by 13 gives an OOB mean squared error of 103.6. This tiny example shows the two weaknesses of OOB as well as the idea. Each day was judged by only one or two stumps, a much weaker "bag" than the real one with three, so the estimate is pessimistic: here it is even worse than always predicting the mean turnout (91.4). And with 14 rows it is very noisy: D6, a 22-member day, alone contributes about half of the total.</p>
  <p>With many members and many rows, OOB becomes reliable. On the churn data, with <code>oob_score=True</code>, sklearn computes it automatically and stores it in <code>oob_score_</code>:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
for n in [5, 10, 25, 50, 100, 200]:
    bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=n, oob_score=True,
                            n_jobs=-1, random_state=0).fit(Xtr, ytr)
    has = ~np.isnan(bag.oob_decision_function_[:, 0])     # rows that got at least one OOB vote
    print(f"trees {n:3d}: OOB acc {bag.oob_score_:.3f}  validation acc {bag.score(Xva, yva):.3f}  rows with an OOB vote {has.mean():.1%}")</div>
  <div class="fx" data-lang="text">trees   5: OOB acc 0.745  validation acc 0.836  rows with an OOB vote 90.1%
trees  10: OOB acc 0.798  validation acc 0.857  rows with an OOB vote 99.0%
trees  25: OOB acc 0.836  validation acc 0.865  rows with an OOB vote 100.0%
trees  50: OOB acc 0.851  validation acc 0.877  rows with an OOB vote 100.0%
trees 100: OOB acc 0.860  validation acc 0.881  rows with an OOB vote 100.0%
trees 200: OOB acc 0.866  validation acc 0.881  rows with an OOB vote 100.0%</div>
  <p>Read the columns together. With 5 trees, only 90.1% of rows receive any OOB vote (a row is in all five samples with probability 0.632⁵ ≈ 0.10), and each OOB vote comes from only about 0.368 × 5 ≈ 2 trees, so the OOB accuracy, 0.745, is far below the real 5-tree bag's validation accuracy of 0.836. As trees are added the two approach each other: 0.851 vs 0.877 at 50 trees, 0.866 vs 0.881 at 200. A small gap remains because each OOB vote still uses only about 37% of the members, and because the 3,000 validation rows carry their own noise of about ±0.006. In practice, OOB is excellent for quick checks and for choosing the number of members; it is not a replacement for a proper test set when you compare many settings, because picking the best of 50 OOB scores makes that score optimistic. And it is only honest if nothing was fitted on all the rows beforehand: a scaler, imputer or feature selector fitted on the whole training table has already seen the OOB rows.</p>

  <h2 id="bag-var"><span class="num">07</span>Pasting, Random Subspaces and Random Patches</h2>
  <p>Resampling rows with replacement is one way to make members differ, but not the only one. Bagging is one member of a family of methods that all "train each member on a random slice of the table", and sklearn's bagging classes can produce any of them. <strong>Pasting</strong> gives each member a random subset of the rows drawn <em>without</em> replacement, for example half of them; on the diary a member might get 7 different days with no repeats. <strong>Random subspaces</strong> give each member all the rows but only a random subset of the <em>columns</em>, for its whole life; a diary member given only Temp and Wind can never ask about Outlook. <strong>Random patches</strong> sample both rows and columns.</p>
  <table class="tbl">
    <tr><th>Variant</th><th>Rows per member</th><th>Columns per member</th><th>sklearn settings</th><th>Origin</th></tr>
    <tr><td>Bagging</td><td>n, with replacement</td><td>all</td><td><code>bootstrap=True, max_samples=1.0</code></td><td>Breiman 1996</td></tr>
    <tr><td>Pasting</td><td>a subset, no replacement</td><td>all</td><td><code>bootstrap=False, max_samples=0.5</code></td><td>Breiman 1999</td></tr>
    <tr><td>Random subspaces</td><td>all</td><td>a random subset</td><td><code>bootstrap=False, max_features=0.5</code></td><td>Ho 1998</td></tr>
    <tr><td>Random patches</td><td>a subset</td><td>a random subset</td><td><code>max_samples=0.5, max_features=0.5</code></td><td>Louppe &amp; Geurts 2012</td></tr>
  </table>
  <p>The code trains 100 trees with each variant and measures three things: the accuracy of an average single member, how often two members give the same answer (a direct look at ρ), and the accuracy of the whole ensemble.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
variants = {   # name: (max_samples, bootstrap, max_features)
    "bagging (rows with repl.)":    (1.0, True,  1.0),
    "pasting (50% rows, no repl.)": (0.5, False, 1.0),
    "random subspaces (50% cols)":  (1.0, False, 0.5),
    "random patches (50% + 50%)":   (0.5, False, 0.5),
}
for name, (ms, bs, mf) in variants.items():
    m = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, max_samples=ms, bootstrap=bs,
                          max_features=mf, n_jobs=-1, random_state=0)
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    P = np.array([e.predict(Xva.values[:, f]) for e, f in zip(m.estimators_[:30], m.estimators_features_[:30])])
    one = np.mean(P == yva, axis=1).mean()                # average accuracy of one member
    agree = np.mean([np.mean(P[i] == P[j]) for i in range(30) for j in range(i)])
    print(f"{name:29s} one tree {one:.3f}  trees agree {agree:.1%}  ensemble {m.score(Xva, yva):.3f}  fit {sec:4.1f}s")</div>
  <div class="fx" data-lang="text">bagging (rows with repl.)     one tree 0.769  trees agree 73.3%  ensemble 0.881  fit 12.6s
pasting (50% rows, no repl.)  one tree 0.768  trees agree 73.3%  ensemble 0.875  fit  7.8s
random subspaces (50% cols)   one tree 0.676  trees agree 60.4%  ensemble 0.861  fit  9.2s
random patches (50% + 50%)    one tree 0.666  trees agree 59.1%  ensemble 0.858  fit  3.3s</div>
  <p>Pasting with half the rows gives members as good as bagged ones (0.768 vs 0.769, because a bootstrap sample also holds only 63% distinct rows) and just as alike, a slightly lower ensemble (0.875 vs 0.881), and faster training, since each tree sees half the rows; that makes it attractive for very large data. Random subspaces change the picture: a tree that sees only 7 of the 14 columns often misses the strongest ones, so a single member drops to 0.676, but members agree far less often (60% instead of 73%). On this data the loss in member quality outweighs the gain in diversity (0.861). Random patches are the fastest and most diverse, and slightly the weakest here. Which variant wins depends on the data: with many noisy or redundant columns, column sampling often wins; with a few strong columns, as here, it hurts. (Fit times are from a shared machine and only meaningful compared with each other.)</p>
  <p>The weakness of random subspaces is that the column choice is made once per member, so a member that draws only weak columns is weak everywhere. The random forest makes a gentler version of the same choice: a fresh random set of columns at <em>every split</em>. Each tree can still use every column somewhere, but no single column can dominate every tree. That turns out to be the better trade, and it is why the random forest, not random subspaces, became the standard.</p>

  <h2 id="bag-sk"><span class="num">08</span>Bagging in scikit-learn</h2>
  <p>scikit-learn has two bagging classes: <code>BaggingClassifier</code> (members vote) and <code>BaggingRegressor</code> (members are averaged). Both wrap any estimator you give them, which is bagging's special strength compared with the random forest: you can bag a tree, a small neural network or a nearest-neighbour model. All the ideas of this page map onto a handful of parameters:</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>What it controls</th><th>Advice</th></tr>
    <tr><td><code>estimator</code></td><td>decision tree</td><td>the base model to copy</td><td>use an unstable, low-bias model</td></tr>
    <tr><td><code>n_estimators</code></td><td>10</td><td>number of members B</td><td>more never overfits; gains flatten after about 100–300</td></tr>
    <tr><td><code>max_samples</code></td><td>1.0</td><td>rows per member (fraction or count)</td><td>smaller: faster, more diverse, weaker members</td></tr>
    <tr><td><code>max_features</code></td><td>1.0</td><td>columns per member</td><td>below 1.0 gives random subspaces or patches</td></tr>
    <tr><td><code>bootstrap</code></td><td>True</td><td>rows drawn with replacement?</td><td>False gives pasting</td></tr>
    <tr><td><code>bootstrap_features</code></td><td>False</td><td>columns drawn with replacement?</td><td>rarely useful</td></tr>
    <tr><td><code>oob_score</code></td><td>False</td><td>compute the OOB score</td><td>needs <code>bootstrap=True</code></td></tr>
    <tr><td><code>warm_start</code></td><td>False</td><td>keep existing members when refitting with more</td><td>grow a bag step by step</td></tr>
    <tr><td><code>n_jobs</code>, <code>random_state</code></td><td>1 core, None</td><td>parallel cores; seed for the sampling</td><td><code>n_jobs=-1</code>; always set a seed</td></tr>
  </table>
  <p>After fitting, the bag keeps its members in <code>estimators_</code>, the row numbers each member drew in <code>estimators_samples_</code>, the columns each member got in <code>estimators_features_</code>, and, if requested, <code>oob_score_</code> plus per-row OOB predictions (<code>oob_decision_function_</code> for a classifier, <code>oob_prediction_</code> for a regressor). The code shows this bookkeeping, then warm starting, then the regression version on the Friedman #1 benchmark (a smooth made-up function of 10 inputs):</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, BaggingRegressor
from sklearn.datasets import make_friedman1
# 1) the bookkeeping sklearn keeps
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=3, max_features=0.5, random_state=0).fit(Xtr, ytr)
for k in range(3):
    rows, cols = bag.estimators_samples_[k], bag.estimators_features_[k]
    print(f"member {k}: {len(rows)} row draws, {len(np.unique(rows))} different rows; columns {sorted(cols.tolist())}")
# 2) warm_start: add members to an existing bag instead of refitting
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=20, warm_start=True, n_jobs=-1, random_state=0)
for n in [20, 60, 120]:
    bag.set_params(n_estimators=n).fit(Xtr, ytr)          # only the new members are trained
    print(f"warm start -&gt; {len(bag.estimators_)} trees, validation {bag.score(Xva, yva):.3f}")
# 3) regression: BaggingRegressor averages the members' numbers
Xr, yr = make_friedman1(n_samples=3000, noise=1.0, random_state=0)
tree = DecisionTreeRegressor(random_state=0).fit(Xr[:2000], yr[:2000])
breg = BaggingRegressor(DecisionTreeRegressor(), n_estimators=100, oob_score=True, n_jobs=-1,
                        random_state=0).fit(Xr[:2000], yr[:2000])
print(f"one deep tree      test R^2 {tree.score(Xr[2000:], yr[2000:]):.3f}")
print(f"bagging 100 trees  test R^2 {breg.score(Xr[2000:], yr[2000:]):.3f}   OOB R^2 {breg.oob_score_:.3f}")</div>
  <div class="fx" data-lang="text">member 0: 12000 row draws, 7570 different rows; columns [1, 4, 5, 7, 8, 9, 13]
member 1: 12000 row draws, 7586 different rows; columns [2, 4, 5, 6, 7, 10, 12]
member 2: 12000 row draws, 7554 different rows; columns [0, 2, 6, 8, 9, 10, 12]
warm start -&gt; 20 trees, validation 0.868
warm start -&gt; 60 trees, validation 0.881
warm start -&gt; 120 trees, validation 0.880
one deep tree      test R^2 0.688
bagging 100 trees  test R^2 0.872   OOB R^2 0.867</div>
  <p>Each member drew 12,000 rows, but only about 7,570 different ones, 63.1%, exactly the rule of section 02; with <code>max_features=0.5</code> each also got its own 7 of the 14 columns. With <code>warm_start=True</code>, raising <code>n_estimators</code> and calling <code>fit</code> again trains only the new members, so you can grow a bag and watch the validation score flatten (0.868 → 0.881 → 0.880) without starting from zero. For regression, one deep tree reaches a test R² of 0.688; averaging 100 bootstrap trees lifts it to 0.872, and the free OOB R², 0.867, lands within 0.005 of the test value. One version note: the parameter is called <code>estimator</code> since sklearn 1.2; older code used <code>base_estimator</code>, which no longer exists. Passing the base model as the first positional argument works in every version.</p>

  <h2 id="bag-scratch"><span class="num">09</span>Bagging From Scratch</h2>
  <p>Underneath all those parameters, bagging is four steps: draw a bootstrap sample, fit a member, remember which rows that member saw (for the OOB score), and average the members' probabilities to predict. Writing it ourselves, with sklearn's tree as the base model, is the best check that nothing else is hidden inside:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
class MyBagging:
    def __init__(self, n_estimators=50, seed=0):
        self.n, self.rng = n_estimators, np.random.default_rng(seed)
    def fit(self, X, y):
        X, y = np.asarray(X), np.asarray(y)
        n = len(X)
        self.classes_ = np.unique(y)
        self.trees, self.inbag = [], []
        for _ in range(self.n):
            idx = self.rng.integers(0, n, n)                  # 1. bootstrap: n draws with replacement
            tree = DecisionTreeClassifier(random_state=int(self.rng.integers(1e9)))
            self.trees.append(tree.fit(X[idx], y[idx]))       # 2. a full-depth tree on that sample
            self.inbag.append(np.bincount(idx, minlength=n) &gt; 0)
        votes, count = np.zeros((n, len(self.classes_))), np.zeros(n)
        for tree, seen in zip(self.trees, self.inbag):        # 3. out-of-bag: only trees that missed the row
            votes[~seen] += tree.predict_proba(X[~seen])
            count[~seen] += 1
        ok = count &gt; 0
        self.oob_score_ = np.mean(self.classes_[votes[ok].argmax(1)] == y[ok])
        return self
    def predict_proba(self, X):                               # 4. aggregate: average the probabilities
        return np.mean([t.predict_proba(np.asarray(X)) for t in self.trees], axis=0)
    def predict(self, X):
        return self.classes_[self.predict_proba(X).argmax(1)]

mine = MyBagging(100, seed=0).fit(Xtr, ytr)
sk = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, oob_score=True,
                       n_jobs=-1, random_state=0).fit(Xtr, ytr)
print(f"from scratch: validation {np.mean(mine.predict(Xva) == yva):.3f}  OOB {mine.oob_score_:.3f}")
print(f"sklearn:      validation {sk.score(Xva, yva):.3f}  OOB {sk.oob_score_:.3f}")
print(f"same label on {np.mean(mine.predict(Xva) == sk.predict(Xva)):.1%} of validation rows")</div>
  <div class="fx" data-lang="text">from scratch: validation 0.875  OOB 0.862
sklearn:      validation 0.881  OOB 0.860
same label on 96.7% of validation rows</div>
  <p>The hand-written bag scores 0.875 on validation with an OOB score of 0.862; sklearn's scores 0.881 with 0.860. They use different random numbers, so their samples and trees differ and the scores are not identical, but they give the same label on 96.7% of validation customers, and both OOB estimates sit at 0.86. Two details are worth copying. The OOB bookkeeping is just one true/false mask per member ("did this member see row i?"), built with <code>np.bincount</code>. And the prediction averages <code>predict_proba</code>, the soft vote, exactly as sklearn does for trees.</p>

  <h2 id="bag-res"><span class="num">10</span>Results at Scale</h2>
  <p>On the 14-day diary every accuracy moves by 7 points per day, so it cannot measure the gain from bagging. On the churn table we can. The code compares one deep tree trained on all 12,000 training rows with bags of 1 to 200 trees, on the 5,000 test customers. Besides accuracy it reports the <strong>AUC</strong>, the area under the ROC curve, which measures how well the model's scores rank churners above non-churners (1.0 is perfect, 0.5 is guessing; see <a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
from sklearn.metrics import roc_auc_score
single = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)
print(f"one deep tree (all rows)  test acc {single.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, single.predict_proba(Xte)[:, 1]):.3f}")
for n in [1, 10, 50, 200]:
    m = BaggingClassifier(DecisionTreeClassifier(), n_estimators=n, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    print(f"bagging {n:3d} trees         test acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">one deep tree (all rows)  test acc 0.778  AUC 0.778
bagging   1 trees         test acc 0.762  AUC 0.762
bagging  10 trees         test acc 0.844  AUC 0.912
bagging  50 trees         test acc 0.864  AUC 0.931
bagging 200 trees         test acc 0.876  AUC 0.934</div>
  <p>One tree trained on all rows scores 0.778. A bag with a single member is a little <em>worse</em>, 0.762, because that member saw only about 63% of the distinct rows, which is the 63.2% rule at work. Ten members reach 0.844, fifty 0.864, and two hundred 0.876: ten points of accuracy from one idea, without changing the tree at all. The AUC jumps even more, from 0.778 to 0.934. A fully grown tree outputs only 0 or 1, so it cannot rank customers; a bag of 200 trees outputs graded scores ("147 of 200 trees say churn"), which rank customers far better.</p>
  <p>To see where bagging stands among its relatives, here is the whole tree family side by side. The random forest and Extra Trees are bagging plus extra randomness; boosting is the other branch, which builds members in sequence.</p>
  <table class="tbl">
    <tr><th></th><th>Single deep tree</th><th>Bagging</th><th><a class="xref" data-note="ml_rf">Random Forest</a></th><th><a class="xref" data-note="ml_extratrees">Extra Trees</a></th><th><a class="xref" data-note="ml_boosting">Boosting</a></th></tr>
    <tr><td>Rows per member</td><td>all</td><td>bootstrap</td><td>bootstrap</td><td>all (default)</td><td>all or a subsample</td></tr>
    <tr><td>Columns at each split</td><td>all</td><td>all</td><td>random subset</td><td>random subset</td><td>all or a subsample</td></tr>
    <tr><td>Cut-off on a column</td><td>best</td><td>best</td><td>best</td><td>random</td><td>best</td></tr>
    <tr><td>Members built</td><td>—</td><td>in parallel</td><td>in parallel</td><td>in parallel</td><td>one after another</td></tr>
    <tr><td>Mainly reduces</td><td>—</td><td>variance</td><td>variance (lower ρ)</td><td>variance (lowest ρ)</td><td>bias</td></tr>
    <tr><td>Base model</td><td>—</td><td>any</td><td>trees only</td><td>trees only</td><td>usually trees</td></tr>
    <tr><td>Churn test accuracy</td><td>0.778</td><td>0.876</td><td>about 0.87–0.88</td><td>about 0.87–0.88</td><td>about 0.86–0.88</td></tr>
  </table>
  <p>Bagging's unique strength in this table is the "any base model" row. When the base model is a tree, the random forest is almost always at least as accurate and trains faster, because it searches only a few columns at each split. Bagging's limit is also visible on the diary: Outlook was still the root question in 545 of 1,000 bootstrap trees. Bagged trees keep asking the same first question, they stay correlated (ρ = 0.46 in section 04), and the variance stops at the floor ρσ². The <a class="xref" data-note="ml_rf">Random Forest</a> note starts exactly there.</p>

  <h2 id="bag-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common mistake is bagging a stable or high-bias model and expecting a gain. Section 05 showed it: logistic regression, 15-nearest neighbours and stumps changed by −0.002 to +0.008 when bagged. A closely related mistake is to prune each member hard "to avoid overfitting". That raises the members' bias, which bagging cannot remove, and throws away the variance that bagging is good at removing. Let the members grow deep and let the averaging do its job.</p>
  <p>A second mistake is to think that <code>max_samples=0.632</code> reproduces the 63.2% rule. The 63.2% is the share of <em>distinct</em> rows in a full-size sample; the sample itself still has n rows. Setting <code>max_samples=0.632</code> draws a smaller sample, which then contains even fewer distinct rows:</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
n = 12000
for frac in [1.0, 0.632]:
    draws = rng.integers(0, n, int(frac * n))             # bootstrap with max_samples = frac
    print(f"max_samples={frac}: {len(draws)} draws, {len(np.unique(draws)) / n:.1%} of the rows are in the sample")</div>
  <div class="fx" data-lang="text">max_samples=1.0: 12000 draws, 63.3% of the rows are in the sample
max_samples=0.632: 7584 draws, 46.5% of the rows are in the sample</div>
  <p>With the default <code>max_samples=1.0</code> the sample contains 63.3% of the rows; with 0.632 it contains only 46.5%. The default already gives the 63.2%.</p>
  <p>A third mistake is bootstrapping rows that are ordered in time, or that come in groups (several rows per customer). Row-level bootstrap mixes future rows into the training sample of every member, so the OOB rows are surrounded by neighbours from both sides in time and look easy to predict. The OOB score then says nothing about forecasting the future:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import BaggingRegressor
from sklearn.tree import DecisionTreeRegressor
rng = np.random.default_rng(0)
t = np.arange(400).reshape(-1, 1)                         # 400 days in time order
y = 0.05 * t.ravel() + np.sin(t.ravel() / 10) + rng.normal(0, 0.3, 400)   # trend + season + noise
bag = BaggingRegressor(DecisionTreeRegressor(), n_estimators=100, oob_score=True, random_state=0)
bag.fit(t[:300], y[:300])                                 # train on the first 300 days
print(f"OOB R^2 on the training days:  {bag.oob_score_:.3f}")
print(f"R^2 on the next 100 days:      {bag.score(t[300:], y[300:]):.3f}")</div>
  <div class="fx" data-lang="text">OOB R^2 on the training days:  0.993
R^2 on the next 100 days:      -3.914</div>
  <p>The OOB R² of 0.993 looks superb, but on the next 100 days the R² is −3.9, far worse than predicting a constant, because the trend has carried the target beyond anything the trees saw, and an average of trees can only predict values between the training targets. For time-ordered data, validate on a later period; for grouped rows, sample whole groups.</p>
  <p>Finally, two confusions come up in interviews. Bagging is not the same as a random forest: plain bagging lets every split use every column, while the forest restricts each split to a random subset. And trusting the OOB score with very few members gives a pessimistic number, because each row is judged by only a handful of them, and some rows get no OOB vote at all.</p>

  <h2 id="bag-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Bootstrap sample</b>: n rows drawn at random <b>with replacement</b> from an n-row table. Some rows repeat; about 36.8% are left out.</li>
    <li><b>Bagging</b> (bootstrap aggregating): train the same model on B bootstrap samples; average (regression) or vote (classification).</li>
    <li><b>Hard vote</b>: count predicted labels. <b>Soft vote</b>: average probabilities (sklearn's default when available).</li>
    <li><b>Out-of-bag (OOB) rows</b>: rows a member never saw. <b>OOB score</b>: each row predicted only by members that never saw it.</li>
    <li><b>Unstable learner</b>: output changes a lot when the data changes a little (deep trees). <b>Stable</b>: barely changes (linear models, stumps, large-k kNN).</li>
    <li><b>Pasting</b>: rows without replacement. <b>Random subspaces</b>: random columns per member. <b>Random patches</b>: both.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Formula</th><th>Value</th></tr>
    <tr><td>P(row left out of a sample)</td><td>(1 − 1/n)ⁿ → 1/e</td><td>n = 14: 0.354; limit 0.368</td></tr>
    <tr><td>Share of distinct rows in a sample</td><td>1 − (1 − 1/n)ⁿ → 1 − 1/e</td><td>0.632</td></tr>
    <tr><td>Times a row is drawn</td><td>Poisson(1): P(k) = e⁻¹/k!</td><td>0×: 36.8%, 1×: 36.8%, 2×: 18.4%</td></tr>
    <tr><td>Bagged regression</td><td>f̂(x) = (1/B) Σ h_b(x)</td><td>38.86, 28.29, 24.00 → 30.38</td></tr>
    <tr><td>Variance of the bag</td><td>ρσ² + (1 − ρ)σ²/B</td><td>σ² = 0.089, ρ = 0.46 → floor 0.042</td></tr>
    <tr><td>Members judging one OOB row</td><td>≈ 0.368 × B</td><td>B = 200 → about 74</td></tr>
  </table>
  <h3>Key numbers from this page</h3>
  <table class="tbl">
    <tr><th>Experiment</th><th>Result</th></tr>
    <tr><td>Bootstrap SE of mean turnout</td><td>2.56 (= s/√n)</td></tr>
    <tr><td>Bagging gain on churn (50 members)</td><td>deep tree +0.104; depth 5 +0.052; stump, kNN, logistic ≈ 0</td></tr>
    <tr><td>OOB vs validation on churn</td><td>5 trees 0.745 vs 0.836; 200 trees 0.866 vs 0.881</td></tr>
    <tr><td>One tree vs 200 bagged (test)</td><td>accuracy 0.778 → 0.876; AUC 0.778 → 0.934</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, BaggingRegressor
from sklearn.tree import DecisionTreeClassifier

bag = BaggingClassifier(DecisionTreeClassifier(),   # base model (estimator=)
                        n_estimators=200,           # members
                        max_samples=1.0,            # rows per member
                        max_features=1.0,           # columns per member (&lt;1: subspaces)
                        bootstrap=True,             # False: pasting
                        oob_score=True, n_jobs=-1, random_state=0)
bag.fit(X_train, y_train)
bag.oob_score_, bag.estimators_samples_, bag.predict_proba(X_new)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Bagging reduces variance only; bias stays. Bag deep trees, not stumps or linear models.</li>
    <li>More members never overfit; the gain stops at the floor ρσ².</li>
    <li>A single bagged member is slightly worse than one tree on all rows (it sees ≈ 63% of them).</li>
    <li>OOB is pessimistic with few members and leaky after preprocessing fitted on all rows.</li>
    <li>Row bootstrap on time series or grouped rows gives a misleading OOB score.</li>
    <li>Bagging ≠ random forest: the forest also samples columns at every split.</li>
  </ul>

  <h2 id="bag-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is bagging?</summary><div class="qa-body">Bagging (bootstrap aggregating) trains the same model on many bootstrap samples of the training data and combines them: the average for regression, a vote or averaged probabilities for classification. Each sample is slightly different, so the members make partly different mistakes, and averaging cancels much of their variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bootstrap sample, and why must it be drawn with replacement?</summary><div class="qa-body">It is n rows drawn at random with replacement from an n-row table. Because rows are put back, some appear several times and about 37% never appear, so every sample is a different dataset. Drawing n of n rows without replacement would just reorder the table, and every member would see identical data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the 63.2%.</summary><div class="qa-body">A row is missed in one draw with probability 1 − 1/n, and in all n independent draws with probability (1 − 1/n)ⁿ. Since n · ln(1 − 1/n) → −1, this tends to 1/e ≈ 0.368. So a row is in the sample with probability about 0.632, and a sample contains about 63.2% of the distinct rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging reduce variance but not bias?</summary><div class="qa-body">The bag's average prediction is the average of its members' average predictions, so its bias equals the members' bias. Its variance is ρσ² + (1 − ρ)σ²/B, which is smaller than one member's σ² whenever the members are not perfectly correlated. In the sine experiment the variance fell from 0.089 to 0.044 while bias stayed near zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which base models benefit from bagging, and which do not?</summary><div class="qa-body">Unstable, low-bias models benefit: fully grown trees gained 10 points on the churn data. Stable or high-bias models barely change: stumps, logistic regression and large-k nearest neighbours gained between −0.002 and +0.008. Bagging removes variance, so the model must have variance to remove.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the out-of-bag score, and when is it unreliable?</summary><div class="qa-body">Each training row is predicted only by the members whose bootstrap sample did not contain it (about 37% of them), and those predictions are scored against the truth. It is unreliable with few members (each row is judged by a tiny team, so it is pessimistic), on very small data (noisy), after preprocessing fitted on all rows (leakage), and on time-ordered or grouped rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can adding more members make a bagged model overfit?</summary><div class="qa-body">No. More members only shrink the (1 − ρ)σ²/B term, so the test error falls and then flattens. The members themselves may overfit, but adding more of them never makes it worse; the only costs are time and memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hard voting vs soft voting: which does sklearn's BaggingClassifier use?</summary><div class="qa-body">If the base model has <code>predict_proba</code>, sklearn averages the members' probabilities and picks the largest (soft voting); otherwise it counts labels (hard voting). Soft voting uses each member's confidence and gives graded scores for ROC curves. For fully grown trees, whose probabilities are 0 or 1, the two nearly coincide.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between bagging and a random forest?</summary><div class="qa-body">Both train deep trees on bootstrap samples and average them. A random forest also lets each split choose only among a random subset of columns. That stops the strongest column from being the first question in every tree, lowers the correlation between trees, and so lowers the variance floor ρσ². It also makes each split cheaper to search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging vs boosting?</summary><div class="qa-body">Bagging trains independent members in parallel on bootstrap samples and averages them; it reduces variance and suits deep, unstable models. Boosting trains members one after another, each focusing on what the previous ones got wrong; it mainly reduces bias and suits shallow, weak models. Bagging cannot overfit by adding members; boosting can.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are pasting, random subspaces and random patches?</summary><div class="qa-body">Pasting samples rows without replacement (a subset per member). Random subspaces give each member all rows but a random subset of columns. Random patches sample both rows and columns. In sklearn they are all <code>BaggingClassifier</code> settings: <code>bootstrap=False</code> with <code>max_samples</code> below 1, or <code>max_features</code> below 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a single bagged tree worse than a tree trained on all the data?</summary><div class="qa-body">A bootstrap sample contains only about 63% of the distinct rows, so each member learns from less information. On the churn data one bagged tree scored 0.762 against 0.778 for a tree on all rows. Bagging's advantage comes entirely from averaging many such members.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging stop improving after a few hundred trees?</summary><div class="qa-body">Because of the correlation floor: the variance of the average tends to ρσ², not to zero. Bagged trees are drawn from the same data and usually ask the same first question (Outlook in 545 of 1,000 diary trees), so ρ stays around 0.46. To go further you must make the trees less alike, which is what random forests and Extra Trees do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can bagging be parallelised? Can boosting?</summary><div class="qa-body">Bagging can: members are independent, so <code>n_jobs=-1</code> trains them on all cores at once. Boosting's rounds are sequential, because each round needs the previous ensemble, so only the work inside a round (such as finding splits) can be parallel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What was the bootstrap originally used for?</summary><div class="qa-body">Efron introduced it in 1979 to estimate the uncertainty of a statistic: resample the data many times, recompute the statistic on each resample, and use their spread as a standard error or confidence interval. For the diary's mean turnout the bootstrap standard error was 2.56, equal to the textbook s/√n, and it works equally well for statistics with no formula.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You bag a model and the OOB score is 0.99, but the model fails in production. What could be wrong?</summary><div class="qa-body">Likely leakage into the OOB rows. If rows are time-ordered, row-level bootstrap trains on the future and the OOB rows are easy to interpolate (OOB R² 0.993 but −3.9 on the next 100 days in our example). If one customer has many rows, the same customer is both in and out of bag. If a scaler, encoder or feature selector was fitted on all rows, it has seen the OOB rows. Use time-based or group-based validation and put preprocessing inside a pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you choose the number of bagged members?</summary><div class="qa-body">Grow the bag with <code>warm_start=True</code> (or refit at increasing sizes) and watch the OOB or validation score; stop where it flattens, typically 100–300 trees. It is not a regularisation knob, because more members never hurt accuracy; the only reason to stop is cost.</div></details>
</main>
`
});
