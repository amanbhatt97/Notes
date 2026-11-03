// notes/ml/ml_adaboost.js — AdaBoost
Object.assign(TOPIC_CONTENT, {
  "ml_adaboost": `<main>
<h1>AdaBoost</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>AdaBoost</span></div>
  <p class="lead">AdaBoost, short for Adaptive Boosting (Freund and Schapire, 1995), was the first boosting algorithm that worked well in practice. It trains tiny decision trees one after another; after each tree it makes the training rows that tree got wrong heavier, so that the next tree is forced to pay attention to them, and it gives each tree a vote whose size depends on how accurate the tree was. It matters for two reasons: it is still the clearest way to understand boosting (and a favourite interview topic), and its maths, once understood, leads directly to gradient boosting, the idea behind XGBoost and LightGBM. We will use the running example of the whole tree group, the cricket captain's 14-day diary, to answer the question "will we play today?", tracing every weight of three full rounds by hand, and then check the same algorithm on 20,000 rows against scikit-learn.</p>

  <h2 id="ada-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">AdaBoost</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Every row has a <b>weight</b>; all start at 1/n</li>
          <li>Train a stump on the weighted rows</li>
          <li>Wrong rows get heavier, right rows lighter</li>
          <li>Each stump gets a <b>say α</b>; final = sign(Σ α·h)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The formulas</div>
        <ul>
          <li>ε = total weight of wrong rows</li>
          <li>α = ½·ln((1 − ε)/ε)</li>
          <li>w ← w·e^(−α·y·h), then divide by Z = 2√(ε(1−ε))</li>
          <li>After the update the wrong rows hold exactly 50%</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why it works</div>
        <ul>
          <li>Greedy minimisation of the <b>exponential loss</b> Σe^(−yF)</li>
          <li>Training error ≤ ∏Z, falls exponentially</li>
          <li>P(y = +1) = 1/(1 + e^(−2F))</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants</div>
        <ul>
          <li><b>SAMME</b>: K classes, α + ln(K − 1)</li>
          <li><b>AdaBoost.R2</b>: regression, loss in [0, 1]</li>
          <li>sklearn's weights = 2α (same predictions)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Weak spots</div>
        <ul>
          <li><b>Label noise</b>: wrong rows' weight grows exponentially</li>
          <li>Stumps cannot learn interactions: use depth 2–6</li>
          <li>Usually beaten by gradient boosting today</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ada-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea: Make Hard Rows Heavier</span><span class="rm-sub">boosting when there is no residual</span></div></div>
      <div class="rm-item rm-done" data-target="ada-blocks"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Labels, Stumps and Weighted Error</span><span class="rm-sub">the pieces the formulas need</span></div></div>
      <div class="rm-item rm-done" data-target="ada-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Algorithm</span><span class="rm-sub">the say α, the weight update, the vote</span></div></div>
      <div class="rm-item rm-done" data-target="ada-trace"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Three Rounds by Hand</span><span class="rm-sub">every weight on the 14 diary days</span></div></div>
      <div class="rm-item rm-done" data-target="ada-exp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Exponential Loss</span><span class="rm-sub">where the formulas come from</span></div></div>
      <div class="rm-item rm-done" data-target="ada-code"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">From Scratch vs scikit-learn</span><span class="rm-sub">30 lines, identical predictions</span></div></div>
      <div class="rm-item rm-done" data-target="ada-samme"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multiclass: SAMME</span><span class="rm-sub">what "better than chance" means for K classes</span></div></div>
      <div class="rm-item rm-done" data-target="ada-r2"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Regression: AdaBoost.R2</span><span class="rm-sub">"how wrong" instead of "wrong"</span></div></div>
      <div class="rm-item rm-done" data-target="ada-noise"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Noise Sensitivity</span><span class="rm-sub">why wrong labels take over</span></div></div>
      <div class="rm-item rm-done" data-target="ada-sk"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Settings and When to Use It</span><span class="rm-sub">depth, learning rate, rounds, alternatives</span></div></div>
      <div class="rm-item rm-done" data-target="ada-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">0/1 labels, two kinds of weight, strong learners</span></div></div>
      <div class="rm-item rm-done" data-target="ada-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, diary numbers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="ada-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the AdaBoost questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="ada-idea"><span class="num">01</span>The Idea: Make Hard Rows Heavier</h2>
  <p>In <a class="xref" data-note="ml_boosting">How Boosting Works</a> we boosted a number, the turnout, and each new stump was trained on the residuals, the gap between the true turnout and the team's current prediction. That told the next stump exactly what the team still got wrong. Now suppose the question is yes/no: "will the match be played today?" A stump either says "Play" or "No play", and the team is either right or wrong about a day. There is no natural number like "you were 6 players short" to hand to the next stump. So how can we tell the next stump which days the team keeps getting wrong?</p>
  <p>AdaBoost's answer is to leave the labels alone and change how much each row <em>counts</em>. Every training row is given a <strong>weight</strong>, a number saying how important it is right now. At the start all rows weigh the same. We train a stump that does as well as possible on the weighted rows. Then we look at which rows it got wrong, make those heavier, and make the rows it got right lighter. The next stump is trained on the new weights, and since getting a heavy row wrong is now expensive, it will try hard to get those rows right. We repeat this for as many rounds as we like. At the end every stump votes on each new case, and a stump that was more accurate gets a bigger vote. "Adaptive" in the name refers to this: how much the weights move each round adapts to how good the current stump was.</p>
  <p>Think of a coaching teacher preparing a class for an entrance exam. After the first mock test she sees the class keeps failing rotational-motion questions, so the second mock test has many more of those and fewer of the easy ones. After that test the weak spot is thermodynamics, so the third test leans on that. Each test is set to the class's current weak spots. When she finally predicts how the class will do, she trusts the tests that turned out to be good predictors more than the others; that trust is the stump's vote.</p>
  <p>The running example is the captain's diary from <a class="xref" data-note="ml_dtree">Decision Trees</a>: 14 days, D1 to D14, each with an outlook, a humidity level, a wind level, and whether the match was played. AdaBoost needs the two classes written as the numbers +1 and −1 (section 02 explains why), so Play = Yes becomes y = +1 and No becomes y = −1:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df                                   # the captain's 14-day cricket diary
y = np.where(df.Play == "Yes", 1, -1)                 # AdaBoost labels: Yes = +1, No = -1
print(df[["Outlook", "Humidity", "Wind", "Play"]].assign(y=y).T.to_string())
print("Yes days:", (y == 1).sum(), " No days:", (y == -1).sum())</div>
  <div class="fx" data-lang="text">             D1      D2        D3    D4      D5      D6        D7     D8      D9     D10     D11       D12       D13     D14
Outlook   Sunny   Sunny  Overcast  Rain    Rain    Rain  Overcast  Sunny   Sunny    Rain   Sunny  Overcast  Overcast    Rain
Humidity   High    High      High  High  Normal  Normal    Normal   High  Normal  Normal  Normal      High    Normal    High
Wind       Weak  Strong      Weak  Weak    Weak  Strong    Strong   Weak    Weak    Weak  Strong    Strong      Weak  Strong
Play         No      No       Yes   Yes     Yes      No       Yes     No     Yes     Yes     Yes       Yes       Yes      No
y            -1      -1         1     1       1      -1         1     -1       1       1       1         1         1      -1
Yes days: 9  No days: 5</div>
  <p>Nine days were played and five were not. Our weak learner is a <strong>stump</strong>, a decision tree with a single question, which asks one of the five yes/no questions the diary allows (Overcast? Sunny? Rain? Humidity high? Wind strong?) and says "Play" for one answer and "No play" for the other. No single question gets all 14 days right. The rest of this page shows how AdaBoost makes three of them work together, and why its particular formulas are the right ones.</p>
  <p>Formally, <strong>AdaBoost</strong> is a boosting algorithm for classification that keeps a set of weights over the training rows (adding up to 1), trains a weak learner on those weights each round, gives the learner a vote α computed from its weighted error, multiplies the weights of the rows it got wrong by e^α and of the rows it got right by e^−α, and rescales them to add up to 1 again. The final classifier is the sign of the α-weighted sum of all the learners' votes. Two things distinguish it from bagging (<a class="xref" data-note="ml_bagging">Bagging</a>): the data never changes, only the weights do, and the votes are not equal but earned.</p>

  <h2 id="ada-blocks"><span class="num">02</span>Labels, Stumps and Weighted Error</h2>
  <p>"Make the wrong rows heavier" is a plan, not yet an algorithm. Before we can say how heavy, or how big a vote, we need three small pieces: a convenient way to write right and wrong, the stump itself, and a way to score a stump when rows count differently.</p>
  <p>The first piece is the label coding. AdaBoost writes the two classes as y = +1 and y = −1 instead of 1 and 0, and every stump also outputs +1 or −1. This makes the formulas short because of a small trick: multiply the true label by the stump's answer. If both are +1, or both are −1, the product is +1; if they differ, it is −1. So y·h(x) = +1 means "right" and y·h(x) = −1 means "wrong", and one multiplication replaces an if-statement. More generally, if F(x) is the team's total vote (any real number, whose sign is the prediction), the product y·F(x) is called the <strong>margin</strong>: positive means the team is right about that row, and the larger it is, the more confidently right.</p>
  <p>The second piece is the weak learner. A <strong>decision stump</strong> is a tree with one split: "if feature j is at most t, predict a, otherwise predict b". On the diary's word columns a stump is simply one yes/no question with one prediction per answer, so there are 5 questions × 2 directions = 10 possible stumps. Stumps are weak on purpose: very fast, almost no variance, and too simple to be useful alone. AdaBoost works with any classifier that can take row weights, but stumps or trees of depth 2 to 6 are the standard choice.</p>
  <p>The third piece is scoring a stump when rows have weights. Every row i carries a weight wᵢ ≥ 0, and the weights add up to 1, so they behave like a probability distribution over rows. The <strong>weighted error</strong> ε (the Greek letter epsilon) of a stump is the total weight of the rows it gets wrong: ε = Σ wᵢ over the rows where h(xᵢ) ≠ yᵢ. With equal weights of 1/n this is just the ordinary error rate. With unequal weights, missing a heavy row costs more than missing a light one, like a test where questions carry different marks.</p>
  <p>Here is why this matters, using the weights AdaBoost will give the diary after its first round (section 04 derives them): the four days the first stump got wrong, D6, D9, D11 and D14, now weigh 0.125 each, and the other ten weigh 0.05 each. For each question we take its better direction and add up the weights of the days it gets wrong:</p>
  <table class="tbl">
    <tr><th>stump</th><th>days it gets wrong</th><th>plain count</th><th>weighted error ε</th></tr>
    <tr><td>Sunny? yes → No play</td><td>D6, D9, D11, D14</td><td>4 / 14</td><td>4 × 0.125 = 0.500</td></tr>
    <tr><td>Humidity high? yes → No play</td><td>D3, D4, D12, D6</td><td>4 / 14</td><td>3 × 0.05 + 0.125 = 0.275</td></tr>
    <tr><td>Rain? yes → No play</td><td>D4, D5, D10, D1, D2, D8</td><td>6 / 14</td><td>6 × 0.05 = 0.300</td></tr>
    <tr><td>Wind strong? yes → No play</td><td>D7, D11, D12, D1, D8</td><td>5 / 14</td><td>4 × 0.05 + 0.125 = 0.325</td></tr>
    <tr><td>Overcast? yes → Play</td><td>D4, D5, D9, D10, D11</td><td>5 / 14</td><td>3 × 0.05 + 2 × 0.125 = 0.400</td></tr>
  </table>
  <p>By plain counting, "Sunny?" and "Humidity high?" tie at four mistakes each. With the weights, "Sunny?" has become a coin flip (0.500), because every day it gets wrong is a heavy day, while "Humidity high?" misses mostly light days and wins with 0.275. This is the whole mechanism in one table: the weights change which stump looks best, so the next stump cannot simply repeat the previous one. (One practical note: sklearn's <code>DecisionTreeClassifier</code>, given <code>sample_weight</code>, chooses the split with the lowest weighted Gini impurity rather than the lowest weighted error. The two usually agree, and AdaBoost's theory only needs ε &lt; 0.5, so both work; our hand trace minimises ε directly, as the theory does.)</p>

  <h2 id="ada-algo"><span class="num">03</span>The Algorithm</h2>
  <p>We can now score a stump on weighted rows. Two questions remain: how much say should that stump get in the final vote, and exactly how much heavier should the rows it got wrong become? Here is the whole algorithm for two classes; the rest of this section explains each line.</p>
  <ol>
    <li>Give every row the weight wᵢ = 1/n.</li>
    <li>For each round m = 1 … M: train a stump hₘ on the weighted rows; compute its weighted error εₘ; stop if εₘ ≥ 0.5 (no better than chance) or εₘ = 0 (perfect); compute its say αₘ = ½·ln((1 − εₘ)/εₘ); multiply each weight by e^(−αₘ·yᵢ·hₘ(xᵢ)); divide all weights by their sum Zₘ.</li>
    <li>Predict H(x) = sign(Σₘ αₘ·hₘ(x)).</li>
  </ol>
  <p>Start with the say, α = ½·ln((1 − ε)/ε), and read it from the inside out. (1 − ε)/ε is the stump's odds of being right on the weighted rows: with ε = 0.3 it is right 0.7 and wrong 0.3 of the time, odds of 0.7/0.3 = 2.33. Taking the natural log turns odds into log-odds, which is 0 for even odds and grows slowly as the odds improve. The ½ comes from the loss AdaBoost minimises (section 05). So a stump's vote is half the log-odds that it is right:</p>
  <table class="tbl">
    <tr><th>ε</th><th>odds (1 − ε)/ε</th><th>α = ½·ln(odds)</th><th>meaning</th></tr>
    <tr><td>0.50</td><td>1</td><td>0</td><td>a coin flip gets no say at all</td></tr>
    <tr><td>0.40</td><td>1.5</td><td>0.203</td><td>slightly useful</td></tr>
    <tr><td>0.30</td><td>2.33</td><td>0.424</td><td>useful</td></tr>
    <tr><td>0.10</td><td>9</td><td>1.099</td><td>very good</td></tr>
    <tr><td>0.01</td><td>99</td><td>2.298</td><td>nearly perfect</td></tr>
    <tr><td>0</td><td>∞</td><td>∞</td><td>perfect: it alone decides (implementations stop here)</td></tr>
    <tr><td>0.70</td><td>0.43</td><td>−0.424</td><td>worse than chance: its vote is flipped</td></tr>
  </table>
  <p>Two properties of this formula matter. It is symmetric: a stump that is wrong 70% of the time gets α = −0.424, which means "do the opposite of what it says", and the opposite of a 70%-wrong stump is a 70%-right one. That is why stopping at ε ≥ 0.5 loses nothing, since such a stump can always be flipped. And α grows without limit as ε approaches 0, so a single perfect stump would outvote everything, which is why implementations guard against ε = 0.</p>
  <p>Next, the weight update, wᵢ ← wᵢ·e^(−α·yᵢ·h(xᵢ)). Using the y·h trick: for a row the stump got right, y·h = +1, so its weight is multiplied by e^−α, which is less than 1. For a row it got wrong, y·h = −1, so its weight is multiplied by e^α, which is more than 1. In the diary's first round (section 04), ε = 4/14 = 0.2857, so α = ½·ln(0.7143/0.2857) = ½·ln 2.5 = 0.4581, giving e^−0.4581 = 0.63 and e^0.4581 = 1.58: the right days lose about a third of their weight and the wrong days gain more than half.</p>
  <p>After the update the weights no longer add up to 1, so all of them are divided by their sum Z, the <strong>normaliser</strong>. Something neat happens here. Before the update, the wrong rows held ε of the total weight and the right rows held 1 − ε. Since e^α = √((1 − ε)/ε) (which is just the formula for α undone), after multiplying, the wrong rows hold ε·√((1 − ε)/ε) = √(ε(1 − ε)), and the right rows hold (1 − ε)·√(ε/(1 − ε)) = √(ε(1 − ε)). The two halves are equal. So Z = 2√(ε(1 − ε)), and after normalising, the rows the last stump got wrong hold <em>exactly</em> 50% of the weight. On the new weights, the last stump is a pure coin flip. The next stump cannot copy it and must find something new; this is how AdaBoost forces its stumps to be different from one another. It also gives a shortcut for hand calculation: a wrong row's new weight is its old weight divided by 2ε, and a right row's is its old weight divided by 2(1 − ε). With ε = 4/14 that gives (1/14)/(8/14) = 0.125 for wrong days and (1/14)/(20/14) = 0.05 for right days, with no exponentials.</p>
  <p>Finally, the vote F(x) = Σ αₘ·hₘ(x) is a weighted sum of ±1 answers. Its sign is the predicted class, and its size is the confidence. It is important not to confuse the two kinds of weight in AdaBoost. The <em>row</em> weights wᵢ say how much each training row matters to the next stump; they are used only during training and then thrown away. The <em>learner</em> weights αₘ say how much each stump's vote counts at prediction time; they are kept forever as part of the model.</p>

  <h2 id="ada-trace"><span class="num">04</span>Three Rounds by Hand</h2>
  <p>Formulas are one thing; watching them work is another. The code below runs three rounds on the 14 diary days exactly as section 03 describes, trying all ten stumps each round and keeping the one with the smallest weighted error:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
     "Humidity high?": df.Humidity == "High", "Wind strong?": df.Wind == "Strong"}
Q = {k: v.values for k, v in Q.items()}                # the five yes/no questions
y = np.where(df.Play == "Yes", 1, -1)
days = np.array(df.index)
w = np.full(14, 1 / 14)                                # step 1: equal weights
F = np.zeros(14)                                       # the team's vote so far
for m in range(1, 4):
    cands = []                                         # every stump: a question + what "yes" means
    for k, q in Q.items():
        for s in (+1, -1):
            h = np.where(q, s, -s)
            cands.append((w[h != y].sum(), k, s, h))
    eps, k, s, h = min(cands, key=lambda c: c[0])      # smallest weighted error (first wins ties)
    alpha = 0.5 * np.log((1 - eps) / eps)
    F += alpha * h
    w = w * np.exp(-alpha * y * h)                     # wrong rows x e^alpha, right rows x e^-alpha
    Z = w.sum(); w = w / Z
    print(f"round {m}: {k} yes-&gt;{'Play' if s &gt; 0 else 'No play'}, wrong on {list(days[h != y])}")
    print(f"   eps = {eps:.4f}   alpha = {alpha:.4f}   Z = {Z:.4f}   weight now on those days = {w[h != y].sum():.3f}")
    print("   weights:", " ".join(f"{d}:{v:.3f}" for d, v in zip(days, w)))
    print(f"   team training errors: {(np.sign(F) != y).sum()} {list(days[np.sign(F) != y])}")</div>
  <div class="fx" data-lang="text">round 1: Sunny? yes-&gt;No play, wrong on ['D6', 'D9', 'D11', 'D14']
   eps = 0.2857   alpha = 0.4581   Z = 0.9035   weight now on those days = 0.500
   weights: D1:0.050 D2:0.050 D3:0.050 D4:0.050 D5:0.050 D6:0.125 D7:0.050 D8:0.050 D9:0.125 D10:0.050 D11:0.125 D12:0.050 D13:0.050 D14:0.125
   team training errors: 4 ['D6', 'D9', 'D11', 'D14']
round 2: Humidity high? yes-&gt;No play, wrong on ['D3', 'D4', 'D6', 'D12']
   eps = 0.2750   alpha = 0.4847   Z = 0.8930   weight now on those days = 0.500
   weights: D1:0.034 D2:0.034 D3:0.091 D4:0.091 D5:0.034 D6:0.227 D7:0.034 D8:0.034 D9:0.086 D10:0.034 D11:0.086 D12:0.091 D13:0.034 D14:0.086
   team training errors: 4 ['D3', 'D4', 'D6', 'D12']
round 3: Rain? yes-&gt;No play, wrong on ['D1', 'D2', 'D4', 'D5', 'D8', 'D10']
   eps = 0.2633   alpha = 0.5144   Z = 0.8809   weight now on those days = 0.500
   weights: D1:0.065 D2:0.065 D3:0.062 D4:0.173 D5:0.065 D6:0.154 D7:0.023 D8:0.065 D9:0.059 D10:0.065 D11:0.059 D12:0.062 D13:0.023 D14:0.059
   team training errors: 2 ['D4', 'D6']</div>
  <p><strong>Round 1.</strong> All weights are 1/14 = 0.0714, so each stump's ε is just its number of mistakes divided by 14. "Sunny? → No play" (wrong on D6, D9, D11, D14) and "Humidity high? → No play" (wrong on D3, D4, D6, D12) tie at 4/14 = 0.2857; the code keeps the first one it tried, Sunny?. Its say is α₁ = ½·ln(10/4) = 0.4581. The ten right days are multiplied by e^−0.4581 = 0.6325, giving 0.04518 each, and the four wrong days by e^0.4581 = 1.5811, giving 0.11294 each. Their total is Z₁ = 10 × 0.04518 + 4 × 0.11294 = 0.4518 + 0.4518 = 0.9035, and you can see the two halves are equal, as promised. Dividing by Z₁ gives 0.05 for right days and 0.125 for wrong days, exactly the shortcut's values, and the four wrong days now hold half the total weight.</p>
  <p><strong>Round 2.</strong> This is the table from section 02. "Sunny?" now scores exactly 0.500, useless, which is the 50% fact at work. "Humidity high? → No play" misses three light days and one heavy one: ε₂ = 3 × 0.05 + 0.125 = 0.275, the smallest, so α₂ = ½·ln(0.725/0.275) = 0.4847. Using the shortcut: D3, D4, D12 (wrong now, were 0.05) become 0.05/0.55 = 0.091; D6 (wrong again, was 0.125) becomes 0.125/0.55 = 0.227; D9, D11, D14 (wrong in round 1, right now) become 0.125/1.45 = 0.086; the seven days right both times become 0.05/1.45 = 0.034. D6, a rainy, windy day with normal humidity that was not played, has been wrong twice and is now by far the heaviest day, more than three times its starting weight.</p>
  <p><strong>Round 3.</strong> "Rain? → No play" is wrong on six days, more than any earlier stump: D1, D2, D8 (not rain, not played) and D4, D5, D10 (rain, but played). Yet five of those are the lightest days (0.034 each) and only D4 is medium (0.091), so ε₃ = 0.2633 is the smallest of all, and this stump gets the biggest say, α₃ = 0.5144. A stump with more mistakes wins because its mistakes are on days the team already handles well. That is exactly the behaviour we wanted. The figure shows the weights moving:</p>
  <figure class="viz"><svg viewBox="0 0 700 440" width="700"><text x="130" y="16" text-anchor="middle" class="tm" font-size="10.5">D1</text><text x="170" y="16" text-anchor="middle" class="tm" font-size="10.5">D2</text><text x="210" y="16" text-anchor="middle" class="tm" font-size="10.5">D3</text><text x="250" y="16" text-anchor="middle" class="tm" font-size="10.5">D4</text><text x="290" y="16" text-anchor="middle" class="tm" font-size="10.5">D5</text><text x="330" y="16" text-anchor="middle" class="tm" font-size="10.5">D6</text><text x="370" y="16" text-anchor="middle" class="tm" font-size="10.5">D7</text><text x="410" y="16" text-anchor="middle" class="tm" font-size="10.5">D8</text><text x="450" y="16" text-anchor="middle" class="tm" font-size="10.5">D9</text><text x="490" y="16" text-anchor="middle" class="tm" font-size="10.5">D10</text><text x="530" y="16" text-anchor="middle" class="tm" font-size="10.5">D11</text><text x="570" y="16" text-anchor="middle" class="tm" font-size="10.5">D12</text><text x="610" y="16" text-anchor="middle" class="tm" font-size="10.5">D13</text><text x="650" y="16" text-anchor="middle" class="tm" font-size="10.5">D14</text><text x="8" y="56" font-size="11.5">start</text><line x1="112" y1="52" x2="652" y2="52" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="130" y="56" text-anchor="middle" font-size="9.5">−</text><text x="130" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="170" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="170" y="56" text-anchor="middle" font-size="9.5">−</text><text x="170" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="210" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="210" y="56" text-anchor="middle" font-size="9.5">+</text><text x="210" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="250" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="250" y="56" text-anchor="middle" font-size="9.5">+</text><text x="250" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="290" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="290" y="56" text-anchor="middle" font-size="9.5">+</text><text x="290" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="330" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="330" y="56" text-anchor="middle" font-size="9.5">−</text><text x="330" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="330" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="370" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="370" y="56" text-anchor="middle" font-size="9.5">+</text><text x="370" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="410" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="410" y="56" text-anchor="middle" font-size="9.5">−</text><text x="410" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="450" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="450" y="56" text-anchor="middle" font-size="9.5">+</text><text x="450" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="450" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="490" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="490" y="56" text-anchor="middle" font-size="9.5">+</text><text x="490" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="530" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="530" y="56" text-anchor="middle" font-size="9.5">+</text><text x="530" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="530" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="570" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="570" y="56" text-anchor="middle" font-size="9.5">+</text><text x="570" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="610" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="610" y="56" text-anchor="middle" font-size="9.5">+</text><text x="610" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="650" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="650" y="56" text-anchor="middle" font-size="9.5">−</text><text x="650" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="650" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><text x="390" y="102" text-anchor="middle" class="tg" font-size="10.5">stump 1: Sunny? → No play (dashed rings = days it gets wrong)</text><text x="8" y="160" font-size="11.5">after round 1</text><line x1="112" y1="156" x2="652" y2="156" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="156" r="8.2" class="fr sr" stroke-width="1.5"/><text x="130" y="160" text-anchor="middle" font-size="9.5">−</text><text x="130" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="170" cy="156" r="8.2" class="fr sr" stroke-width="1.5"/><text x="170" y="160" text-anchor="middle" font-size="9.5">−</text><text x="170" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="210" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="210" y="160" text-anchor="middle" font-size="9.5">+</text><text x="210" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="210" cy="156" r="12.2" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="250" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="250" y="160" text-anchor="middle" font-size="9.5">+</text><text x="250" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="250" cy="156" r="12.2" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="290" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="290" y="160" text-anchor="middle" font-size="9.5">+</text><text x="290" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="330" cy="156" r="13.0" class="fr sr" stroke-width="1.5"/><text x="330" y="160" text-anchor="middle" font-size="9.5">−</text><text x="330" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><circle cx="330" cy="156" r="17.0" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="370" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="370" y="160" text-anchor="middle" font-size="9.5">+</text><text x="370" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="410" cy="156" r="8.2" class="fr sr" stroke-width="1.5"/><text x="410" y="160" text-anchor="middle" font-size="9.5">−</text><text x="410" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="450" cy="156" r="13.0" class="fb sb" stroke-width="1.5"/><text x="450" y="160" text-anchor="middle" font-size="9.5">+</text><text x="450" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><circle cx="490" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="490" y="160" text-anchor="middle" font-size="9.5">+</text><text x="490" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="530" cy="156" r="13.0" class="fb sb" stroke-width="1.5"/><text x="530" y="160" text-anchor="middle" font-size="9.5">+</text><text x="530" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><circle cx="570" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="570" y="160" text-anchor="middle" font-size="9.5">+</text><text x="570" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="570" cy="156" r="12.2" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="610" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="610" y="160" text-anchor="middle" font-size="9.5">+</text><text x="610" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="650" cy="156" r="13.0" class="fr sr" stroke-width="1.5"/><text x="650" y="160" text-anchor="middle" font-size="9.5">−</text><text x="650" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><text x="390" y="206" text-anchor="middle" class="tg" font-size="10.5">stump 2: Humidity high? → No play (dashed rings = days it gets wrong)</text><text x="8" y="264" font-size="11.5">after round 2</text><line x1="112" y1="260" x2="652" y2="260" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="260" r="6.8" class="fr sr" stroke-width="1.5"/><text x="130" y="264" text-anchor="middle" font-size="9.5">−</text><text x="130" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="130" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="170" cy="260" r="6.8" class="fr sr" stroke-width="1.5"/><text x="170" y="264" text-anchor="middle" font-size="9.5">−</text><text x="170" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="170" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="210" cy="260" r="11.1" class="fb sb" stroke-width="1.5"/><text x="210" y="264" text-anchor="middle" font-size="9.5">+</text><text x="210" y="291" text-anchor="middle" class="tm" font-size="8.5">0.091</text><circle cx="250" cy="260" r="11.1" class="fb sb" stroke-width="1.5"/><text x="250" y="264" text-anchor="middle" font-size="9.5">+</text><text x="250" y="291" text-anchor="middle" class="tm" font-size="8.5">0.091</text><circle cx="250" cy="260" r="15.1" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="290" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="290" y="264" text-anchor="middle" font-size="9.5">+</text><text x="290" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="290" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="330" cy="260" r="17.5" class="fr sr" stroke-width="1.5"/><text x="330" y="264" text-anchor="middle" font-size="9.5">−</text><text x="330" y="291" text-anchor="middle" class="tm" font-size="8.5">0.227</text><circle cx="370" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="370" y="264" text-anchor="middle" font-size="9.5">+</text><text x="370" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="410" cy="260" r="6.8" class="fr sr" stroke-width="1.5"/><text x="410" y="264" text-anchor="middle" font-size="9.5">−</text><text x="410" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="410" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="450" cy="260" r="10.8" class="fb sb" stroke-width="1.5"/><text x="450" y="264" text-anchor="middle" font-size="9.5">+</text><text x="450" y="291" text-anchor="middle" class="tm" font-size="8.5">0.086</text><circle cx="490" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="490" y="264" text-anchor="middle" font-size="9.5">+</text><text x="490" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="490" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="530" cy="260" r="10.8" class="fb sb" stroke-width="1.5"/><text x="530" y="264" text-anchor="middle" font-size="9.5">+</text><text x="530" y="291" text-anchor="middle" class="tm" font-size="8.5">0.086</text><circle cx="570" cy="260" r="11.1" class="fb sb" stroke-width="1.5"/><text x="570" y="264" text-anchor="middle" font-size="9.5">+</text><text x="570" y="291" text-anchor="middle" class="tm" font-size="8.5">0.091</text><circle cx="610" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="610" y="264" text-anchor="middle" font-size="9.5">+</text><text x="610" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="650" cy="260" r="10.8" class="fr sr" stroke-width="1.5"/><text x="650" y="264" text-anchor="middle" font-size="9.5">−</text><text x="650" y="291" text-anchor="middle" class="tm" font-size="8.5">0.086</text><text x="390" y="310" text-anchor="middle" class="tg" font-size="10.5">stump 3: Rain? → No play (dashed rings = days it gets wrong)</text><text x="8" y="368" font-size="11.5">after round 3</text><line x1="112" y1="364" x2="652" y2="364" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="364" r="9.4" class="fr sr" stroke-width="1.5"/><text x="130" y="368" text-anchor="middle" font-size="9.5">−</text><text x="130" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="170" cy="364" r="9.4" class="fr sr" stroke-width="1.5"/><text x="170" y="368" text-anchor="middle" font-size="9.5">−</text><text x="170" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="210" cy="364" r="9.1" class="fb sb" stroke-width="1.5"/><text x="210" y="368" text-anchor="middle" font-size="9.5">+</text><text x="210" y="395" text-anchor="middle" class="tm" font-size="8.5">0.062</text><circle cx="250" cy="364" r="15.3" class="fb sb" stroke-width="1.5"/><text x="250" y="368" text-anchor="middle" font-size="9.5">+</text><text x="250" y="395" text-anchor="middle" class="tm" font-size="8.5">0.173</text><circle cx="290" cy="364" r="9.4" class="fb sb" stroke-width="1.5"/><text x="290" y="368" text-anchor="middle" font-size="9.5">+</text><text x="290" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="330" cy="364" r="14.4" class="fr sr" stroke-width="1.5"/><text x="330" y="368" text-anchor="middle" font-size="9.5">−</text><text x="330" y="395" text-anchor="middle" class="tm" font-size="8.5">0.154</text><circle cx="370" cy="364" r="5.6" class="fb sb" stroke-width="1.5"/><text x="370" y="368" text-anchor="middle" font-size="9.5">+</text><text x="370" y="395" text-anchor="middle" class="tm" font-size="8.5">0.023</text><circle cx="410" cy="364" r="9.4" class="fr sr" stroke-width="1.5"/><text x="410" y="368" text-anchor="middle" font-size="9.5">−</text><text x="410" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="450" cy="364" r="8.9" class="fb sb" stroke-width="1.5"/><text x="450" y="368" text-anchor="middle" font-size="9.5">+</text><text x="450" y="395" text-anchor="middle" class="tm" font-size="8.5">0.059</text><circle cx="490" cy="364" r="9.4" class="fb sb" stroke-width="1.5"/><text x="490" y="368" text-anchor="middle" font-size="9.5">+</text><text x="490" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="530" cy="364" r="8.9" class="fb sb" stroke-width="1.5"/><text x="530" y="368" text-anchor="middle" font-size="9.5">+</text><text x="530" y="395" text-anchor="middle" class="tm" font-size="8.5">0.059</text><circle cx="570" cy="364" r="9.1" class="fb sb" stroke-width="1.5"/><text x="570" y="368" text-anchor="middle" font-size="9.5">+</text><text x="570" y="395" text-anchor="middle" class="tm" font-size="8.5">0.062</text><circle cx="610" cy="364" r="5.6" class="fb sb" stroke-width="1.5"/><text x="610" y="368" text-anchor="middle" font-size="9.5">+</text><text x="610" y="395" text-anchor="middle" class="tm" font-size="8.5">0.023</text><circle cx="650" cy="364" r="8.9" class="fr sr" stroke-width="1.5"/><text x="650" y="368" text-anchor="middle" font-size="9.5">−</text><text x="650" y="395" text-anchor="middle" class="tm" font-size="8.5">0.059</text></svg><figcaption>The 14 diary days in four snapshots. Circle area = day weight (number under each circle); blue + = played, red − = not played. Dashed rings mark the days the next stump gets wrong; they grow in the next snapshot while the others shrink. D6 grows twice.</figcaption></figure>
  <p>Each row of circles is one moment: the starting weights, then after rounds 1, 2 and 3. A circle's area is the day's weight. The dashed rings mark the days the <em>next</em> stump gets wrong, and in the next row those circles have grown while all the others have shrunk. D6 grows twice in a row; in the last row D4 and D6, the two days the team still gets wrong, are the largest.</p>
  <p>Now the final vote. Each stump says +1 (Play) or −1 (No play): h₁ = −1 on sunny days, h₂ = −1 on humid days, h₃ = −1 on rainy days, and +1 otherwise. The team's score is F = 0.4581·h₁ + 0.4847·h₂ + 0.5144·h₃, and days with the same outlook and humidity get the same score:</p>
  <table class="tbl">
    <tr><th>days</th><th>outlook, humidity</th><th>true</th><th>h₁ h₂ h₃</th><th>F = Σα·h</th><th>vote</th></tr>
    <tr><td>D1, D2, D8</td><td>Sunny, High</td><td>No</td><td>−1 −1 +1</td><td>−0.458 − 0.485 + 0.514 = −0.428</td><td>No ✔</td></tr>
    <tr><td>D9, D11</td><td>Sunny, Normal</td><td>Yes</td><td>−1 +1 +1</td><td>+0.541</td><td>Yes ✔</td></tr>
    <tr><td>D3, D12</td><td>Overcast, High</td><td>Yes</td><td>+1 −1 +1</td><td>+0.488</td><td>Yes ✔</td></tr>
    <tr><td>D7, D13</td><td>Overcast, Normal</td><td>Yes</td><td>+1 +1 +1</td><td>+1.457</td><td>Yes ✔</td></tr>
    <tr><td>D14</td><td>Rain, High</td><td>No</td><td>+1 −1 −1</td><td>−0.541</td><td>No ✔</td></tr>
    <tr><td>D4</td><td>Rain, High</td><td>Yes</td><td>+1 −1 −1</td><td>−0.541</td><td>No ✘</td></tr>
    <tr><td>D5, D10</td><td>Rain, Normal</td><td>Yes</td><td>+1 +1 −1</td><td>+0.428</td><td>Yes ✔</td></tr>
    <tr><td>D6</td><td>Rain, Normal</td><td>No</td><td>+1 +1 −1</td><td>+0.428</td><td>Yes ✘</td></tr>
  </table>
  <p>Each stump alone gets 8 to 10 of the 14 days right. Together, after three rounds, the team gets 12 right; the last line of each round in the output shows the training errors going 4 → 4 → 2. The two days still wrong, D4 and D6, are both rainy, and what decides them is the wind: D4 was calm and played, D6 windy and not. More rounds bring in "Wind strong?", but a sum of one-question stumps can never get every day right, because the true rule "rain and windy means no play" is an <strong>interaction</strong> (the effect of wind depends on the outlook), and a sum of stumps can only add up separate effects. Section 10 shows two-question trees fixing it.</p>

  <h2 id="ada-exp"><span class="num">05</span>The Exponential Loss</h2>
  <p>The trace shows the formulas work, but they look invented: why ½·ln, and why multiply by e^±α? For five years AdaBoost worked without anyone fully knowing what it was optimising. In 2000 Friedman, Hastie and Tibshirani showed that it is exactly forward stagewise additive modelling (adding one term at a time, never changing old terms; see <a class="xref" data-note="ml_boosting">How Boosting Works</a>) applied to one particular loss, the <strong>exponential loss</strong>: L(y, F(x)) = e^(−y·F(x)). In terms of the margin y·F, a row that is confidently right (margin +2) costs e^−2 = 0.14, a row on the fence (margin 0) costs 1, and a row confidently wrong (margin −2) costs e^2 = 7.4. The loss of the whole training set is the sum over rows.</p>
  <p>The derivation is short and worth knowing for interviews. Suppose the team so far is F_{m−1}, and we add one more stump h with say α. The new total loss is Σᵢ e^(−yᵢ(F_{m−1}(xᵢ) + α·h(xᵢ))), which splits into Σᵢ e^(−yᵢF_{m−1}(xᵢ)) · e^(−α·yᵢ·h(xᵢ)). The first factor does not depend on the new stump; call it wᵢ. These are exactly AdaBoost's row weights: a row the team gets wrong has a negative margin and therefore a large wᵢ. Now split the rows into right ones (y·h = +1) and wrong ones (y·h = −1). With ε the share of weight on wrong rows, the loss is proportional to (1 − ε)·e^−α + ε·e^α. For any fixed positive α this grows with ε, so the best stump is the one with the smallest weighted error, which is AdaBoost's choice. To find the best α, differentiate with respect to α and set the result to zero: −(1 − ε)e^−α + ε·e^α = 0, so e^(2α) = (1 − ε)/ε and α = ½·ln((1 − ε)/ε). That is AdaBoost's say, and now you can see where the ½ comes from: it is the 2 in e^(2α). Finally, the weights for the next round are e^(−yᵢF_m(xᵢ)) = wᵢ·e^(−α·yᵢ·hₘ(xᵢ)), which is AdaBoost's update. Normalising only rescales every weight by the same number, which does not change which stump is best.</p>
  <p>We can check this on round 1 of the diary: keep the stump "Sunny? → No play", try different values of α, and compute the average exponential loss over the 14 days.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y = np.where(df.Play == "Yes", 1, -1)
h1 = np.where(df.Outlook == "Sunny", -1, 1)            # round-1 stump: Sunny? yes -&gt; No play
print("alpha    mean exp(-y * alpha * h1)")
for a in [0.0, 0.2, 0.4, 0.4581, 0.5, 0.7, 1.0]:
    print(f"{a:.4f}   {np.mean(np.exp(-y * a * h1)):.4f}")</div>
  <div class="fx" data-lang="text">alpha    mean exp(-y * alpha * h1)
0.0000   1.0000
0.2000   0.9338
0.4000   0.9050
0.4581   0.9035
0.5000   0.9043
0.7000   0.9301
1.0000   1.0394</div>
  <p>The loss is smallest at α = 0.4581, exactly the value the formula gave, and its value there, 0.9035, is the normaliser Z₁ from the trace. That is no coincidence: each round multiplies the average exponential loss by that round's Z. The same fact gives AdaBoost's famous guarantee. Because e^(−y·F) is at least 1 whenever y·F ≤ 0 (a mistake), the exponential loss is always at least the fraction of mistakes, so training error ≤ Z₁·Z₂·…·Z_M = ∏ 2√(εₘ(1 − εₘ)). If every stump is at least a little better than chance, say εₘ ≤ ½ − γ for some edge γ, then each Z is at most √(1 − 4γ²), and the training error falls exponentially with the number of rounds. For example, stumps that are only 60% accurate (ε = 0.4) give Z = 0.98 per round; after 100 rounds the bound is 0.13, and after 339 rounds it is below 0.001. That answered the theoretical question "can weak learners be combined into a strong one?" with a yes, at least on the training set.</p>
  <p>The loss also tells us how to turn the vote F into a probability. The F that minimises expected exponential loss at a point x is half the log-odds, F = ½·ln(P(y = +1|x)/P(y = −1|x)), so P(y = +1|x) = 1/(1 + e^(−2F)). On the diary after three rounds:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
eps = [4 / 14, 0.275, 5 * 0.05 / 1.45 + 0.05 / 0.55]   # the three rounds of the trace
alphas = [0.5 * np.log((1 - e) / e) for e in eps]
h = [np.where(df.Outlook == "Sunny", -1, 1), np.where(df.Humidity == "High", -1, 1),
     np.where(df.Outlook == "Rain", -1, 1)]
F = sum(a * hh for a, hh in zip(alphas, h))
Z = [2 * np.sqrt(e * (1 - e)) for e in eps]
print("Z per round:", [round(float(z), 4) for z in Z], "  product:", round(float(np.prod(Z)), 4))
print("mean exponential loss after 3 rounds:", round(float(np.mean(np.exp(-y * F))), 4))
print("training error after 3 rounds:", round(float(np.mean(np.sign(F) != y)), 3))
p = 1 / (1 + np.exp(-2 * F))                           # probability of Play
for d in ["D3", "D6", "D9", "D14"]:
    i = list(df.index).index(d)
    print(f"{d}: F {F[i]:+.3f}   P(play) = {p[i]:.2f}   actual {df.Play.iloc[i]}")</div>
  <div class="fx" data-lang="text">Z per round: [0.9035, 0.893, 0.8809]   product: 0.7107
mean exponential loss after 3 rounds: 0.7107
training error after 3 rounds: 0.143
D3: F +0.488   P(play) = 0.73   actual Yes
D6: F +0.428   P(play) = 0.70   actual No
D9: F +0.541   P(play) = 0.75   actual Yes
D14: F -0.541   P(play) = 0.25   actual No</div>
  <p>The product of the three Z values, 0.7107, equals the average exponential loss computed directly from F, and the real training error, 2/14 = 0.143, is well below that bound. D9, with F = +0.541, gets a 75% chance of play; D14, with −0.541, gets 25%. D6 is truly a "No" but gets 70%: the team is wrong about it and fairly sure. In practice AdaBoost's probabilities are often badly calibrated, pushed towards the extremes, so calibrate them before using them as real chances (<a class="xref" data-note="ml_calibration">Calibration</a>).</p>
  <p>The figure compares the exponential loss with two others as a function of the margin:</p>
  <figure class="viz"><svg viewBox="0 0 600 290" width="600"><line x1="60" y1="240" x2="560" y2="240" stroke="currentColor"/><line x1="360.0" y1="20" x2="360.0" y2="240" stroke="currentColor" stroke-opacity="0.4"/><text x="60.0" y="256" text-anchor="middle" class="tm" font-size="11">-3</text><text x="160.0" y="256" text-anchor="middle" class="tm" font-size="11">-2</text><text x="260.0" y="256" text-anchor="middle" class="tm" font-size="11">-1</text><text x="360.0" y="256" text-anchor="middle" class="tm" font-size="11">0</text><text x="460.0" y="256" text-anchor="middle" class="tm" font-size="11">1</text><text x="560.0" y="256" text-anchor="middle" class="tm" font-size="11">2</text><text x="52" y="200.0" text-anchor="end" class="tm" font-size="11">2</text><line x1="60" y1="196.0" x2="560" y2="196.0" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="156.0" text-anchor="end" class="tm" font-size="11">4</text><line x1="60" y1="152.0" x2="560" y2="152.0" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="112.0" text-anchor="end" class="tm" font-size="11">6</text><line x1="60" y1="108.0" x2="560" y2="108.0" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="68.0" text-anchor="end" class="tm" font-size="11">8</text><line x1="60" y1="63.99999999999999" x2="560" y2="63.99999999999999" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="24.0" text-anchor="end" class="tm" font-size="11">10</text><line x1="60" y1="20.0" x2="560" y2="20.0" stroke="currentColor" stroke-opacity="0.1"/><polyline points="60.0,218.0 61.7,218.0 63.3,218.0 65.0,218.0 66.7,218.0 68.4,218.0 70.0,218.0 71.7,218.0 73.4,218.0 75.1,218.0 76.7,218.0 78.4,218.0 80.1,218.0 81.7,218.0 83.4,218.0 85.1,218.0 86.8,218.0 88.4,218.0 90.1,218.0 91.8,218.0 93.4,218.0 95.1,218.0 96.8,218.0 98.5,218.0 100.1,218.0 101.8,218.0 103.5,218.0 105.2,218.0 106.8,218.0 108.5,218.0 110.2,218.0 111.8,218.0 113.5,218.0 115.2,218.0 116.9,218.0 118.5,218.0 120.2,218.0 121.9,218.0 123.5,218.0 125.2,218.0 126.9,218.0 128.6,218.0 130.2,218.0 131.9,218.0 133.6,218.0 135.3,218.0 136.9,218.0 138.6,218.0 140.3,218.0 141.9,218.0 143.6,218.0 145.3,218.0 147.0,218.0 148.6,218.0 150.3,218.0 152.0,218.0 153.6,218.0 155.3,218.0 157.0,218.0 158.7,218.0 160.3,218.0 162.0,218.0 163.7,218.0 165.4,218.0 167.0,218.0 168.7,218.0 170.4,218.0 172.0,218.0 173.7,218.0 175.4,218.0 177.1,218.0 178.7,218.0 180.4,218.0 182.1,218.0 183.7,218.0 185.4,218.0 187.1,218.0 188.8,218.0 190.4,218.0 192.1,218.0 193.8,218.0 195.5,218.0 197.1,218.0 198.8,218.0 200.5,218.0 202.1,218.0 203.8,218.0 205.5,218.0 207.2,218.0 208.8,218.0 210.5,218.0 212.2,218.0 213.8,218.0 215.5,218.0 217.2,218.0 218.9,218.0 220.5,218.0 222.2,218.0 223.9,218.0 225.6,218.0 227.2,218.0 228.9,218.0 230.6,218.0 232.2,218.0 233.9,218.0 235.6,218.0 237.3,218.0 238.9,218.0 240.6,218.0 242.3,218.0 243.9,218.0 245.6,218.0 247.3,218.0 249.0,218.0 250.6,218.0 252.3,218.0 254.0,218.0 255.7,218.0 257.3,218.0 259.0,218.0 260.7,218.0 262.3,218.0 264.0,218.0 265.7,218.0 267.4,218.0 269.0,218.0 270.7,218.0 272.4,218.0 274.0,218.0 275.7,218.0 277.4,218.0 279.1,218.0 280.7,218.0 282.4,218.0 284.1,218.0 285.8,218.0 287.4,218.0 289.1,218.0 290.8,218.0 292.4,218.0 294.1,218.0 295.8,218.0 297.5,218.0 299.1,218.0 300.8,218.0 302.5,218.0 304.1,218.0 305.8,218.0 307.5,218.0 309.2,218.0 310.8,218.0 312.5,218.0 314.2,218.0 315.9,218.0 317.5,218.0 319.2,218.0 320.9,218.0 322.5,218.0 324.2,218.0 325.9,218.0 327.6,218.0 329.2,218.0 330.9,218.0 332.6,218.0 334.2,218.0 335.9,218.0 337.6,218.0 339.3,218.0 340.9,218.0 342.6,218.0 344.3,218.0 346.0,218.0 347.6,218.0 349.3,218.0 351.0,218.0 352.6,218.0 354.3,218.0 356.0,218.0 357.7,218.0 359.3,218.0 361.0,240.0 362.7,240.0 364.3,240.0 366.0,240.0 367.7,240.0 369.4,240.0 371.0,240.0 372.7,240.0 374.4,240.0 376.1,240.0 377.7,240.0 379.4,240.0 381.1,240.0 382.7,240.0 384.4,240.0 386.1,240.0 387.8,240.0 389.4,240.0 391.1,240.0 392.8,240.0 394.4,240.0 396.1,240.0 397.8,240.0 399.5,240.0 401.1,240.0 402.8,240.0 404.5,240.0 406.2,240.0 407.8,240.0 409.5,240.0 411.2,240.0 412.8,240.0 414.5,240.0 416.2,240.0 417.9,240.0 419.5,240.0 421.2,240.0 422.9,240.0 424.5,240.0 426.2,240.0 427.9,240.0 429.6,240.0 431.2,240.0 432.9,240.0 434.6,240.0 436.3,240.0 437.9,240.0 439.6,240.0 441.3,240.0 442.9,240.0 444.6,240.0 446.3,240.0 448.0,240.0 449.6,240.0 451.3,240.0 453.0,240.0 454.6,240.0 456.3,240.0 458.0,240.0 459.7,240.0 461.3,240.0 463.0,240.0 464.7,240.0 466.4,240.0 468.0,240.0 469.7,240.0 471.4,240.0 473.0,240.0 474.7,240.0 476.4,240.0 478.1,240.0 479.7,240.0 481.4,240.0 483.1,240.0 484.7,240.0 486.4,240.0 488.1,240.0 489.8,240.0 491.4,240.0 493.1,240.0 494.8,240.0 496.5,240.0 498.1,240.0 499.8,240.0 501.5,240.0 503.1,240.0 504.8,240.0 506.5,240.0 508.2,240.0 509.8,240.0 511.5,240.0 513.2,240.0 514.8,240.0 516.5,240.0 518.2,240.0 519.9,240.0 521.5,240.0 523.2,240.0 524.9,240.0 526.6,240.0 528.2,240.0 529.9,240.0 531.6,240.0 533.2,240.0 534.9,240.0 536.6,240.0 538.3,240.0 539.9,240.0 541.6,240.0 543.3,240.0 544.9,240.0 546.6,240.0 548.3,240.0 550.0,240.0 551.6,240.0 553.3,240.0 555.0,240.0 556.7,240.0 558.3,240.0 560.0,240.0" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="260" y1="30" x2="282" y2="30" stroke="currentColor" stroke-width="2.5"/><text x="288" y="34" font-size="11.5">0-1 loss (counts mistakes)</text><polyline points="130.2,21.1 131.9,24.7 133.6,28.3 135.3,31.8 136.9,35.2 138.6,38.6 140.3,42.0 141.9,45.3 143.6,48.5 145.3,51.7 147.0,54.8 148.6,57.9 150.3,60.9 152.0,63.9 153.6,66.8 155.3,69.6 157.0,72.5 158.7,75.3 160.3,78.0 162.0,80.7 163.7,83.3 165.4,85.9 167.0,88.5 168.7,91.0 170.4,93.5 172.0,95.9 173.7,98.3 175.4,100.6 177.1,102.9 178.7,105.2 180.4,107.4 182.1,109.6 183.7,111.8 185.4,113.9 187.1,116.0 188.8,118.1 190.4,120.1 192.1,122.1 193.8,124.0 195.5,126.0 197.1,127.9 198.8,129.7 200.5,131.5 202.1,133.3 203.8,135.1 205.5,136.8 207.2,138.6 208.8,140.2 210.5,141.9 212.2,143.5 213.8,145.1 215.5,146.7 217.2,148.2 218.9,149.8 220.5,151.3 222.2,152.7 223.9,154.2 225.6,155.6 227.2,157.0 228.9,158.4 230.6,159.7 232.2,161.1 233.9,162.4 235.6,163.7 237.3,164.9 238.9,166.2 240.6,167.4 242.3,168.6 243.9,169.8 245.6,170.9 247.3,172.1 249.0,173.2 250.6,174.3 252.3,175.4 254.0,176.5 255.7,177.5 257.3,178.6 259.0,179.6 260.7,180.6 262.3,181.6 264.0,182.6 265.7,183.5 267.4,184.4 269.0,185.4 270.7,186.3 272.4,187.2 274.0,188.0 275.7,188.9 277.4,189.7 279.1,190.6 280.7,191.4 282.4,192.2 284.1,193.0 285.8,193.8 287.4,194.5 289.1,195.3 290.8,196.0 292.4,196.8 294.1,197.5 295.8,198.2 297.5,198.9 299.1,199.6 300.8,200.2 302.5,200.9 304.1,201.5 305.8,202.2 307.5,202.8 309.2,203.4 310.8,204.0 312.5,204.6 314.2,205.2 315.9,205.8 317.5,206.4 319.2,206.9 320.9,207.5 322.5,208.0 324.2,208.5 325.9,209.1 327.6,209.6 329.2,210.1 330.9,210.6 332.6,211.1 334.2,211.5 335.9,212.0 337.6,212.5 339.3,212.9 340.9,213.4 342.6,213.8 344.3,214.3 346.0,214.7 347.6,215.1 349.3,215.5 351.0,215.9 352.6,216.3 354.3,216.7 356.0,217.1 357.7,217.5 359.3,217.9 361.0,218.2 362.7,218.6 364.3,218.9 366.0,219.3 367.7,219.6 369.4,220.0 371.0,220.3 372.7,220.6 374.4,220.9 376.1,221.3 377.7,221.6 379.4,221.9 381.1,222.2 382.7,222.5 384.4,222.8 386.1,223.1 387.8,223.3 389.4,223.6 391.1,223.9 392.8,224.1 394.4,224.4 396.1,224.7 397.8,224.9 399.5,225.2 401.1,225.4 402.8,225.7 404.5,225.9 406.2,226.1 407.8,226.4 409.5,226.6 411.2,226.8 412.8,227.0 414.5,227.2 416.2,227.5 417.9,227.7 419.5,227.9 421.2,228.1 422.9,228.3 424.5,228.5 426.2,228.7 427.9,228.8 429.6,229.0 431.2,229.2 432.9,229.4 434.6,229.6 436.3,229.7 437.9,229.9 439.6,230.1 441.3,230.2 442.9,230.4 444.6,230.6 446.3,230.7 448.0,230.9 449.6,231.0 451.3,231.2 453.0,231.3 454.6,231.5 456.3,231.6 458.0,231.7 459.7,231.9 461.3,232.0 463.0,232.1 464.7,232.3 466.4,232.4 468.0,232.5 469.7,232.7 471.4,232.8 473.0,232.9 474.7,233.0 476.4,233.1 478.1,233.2 479.7,233.4 481.4,233.5 483.1,233.6 484.7,233.7 486.4,233.8 488.1,233.9 489.8,234.0 491.4,234.1 493.1,234.2 494.8,234.3 496.5,234.4 498.1,234.5 499.8,234.6 501.5,234.7 503.1,234.7 504.8,234.8 506.5,234.9 508.2,235.0 509.8,235.1 511.5,235.2 513.2,235.2 514.8,235.3 516.5,235.4 518.2,235.5 519.9,235.6 521.5,235.6 523.2,235.7 524.9,235.8 526.6,235.8 528.2,235.9 529.9,236.0 531.6,236.0 533.2,236.1 534.9,236.2 536.6,236.2 538.3,236.3 539.9,236.4 541.6,236.4 543.3,236.5 544.9,236.5 546.6,236.6 548.3,236.7 550.0,236.7 551.6,236.8 553.3,236.8 555.0,236.9 556.7,236.9 558.3,237.0 560.0,237.0" fill="none" class="sr" stroke-width="2.2"/><line x1="260" y1="47" x2="282" y2="47" class="sr" stroke-width="2.5"/><text x="288" y="51" font-size="11.5">exponential e^(−yF)  ← AdaBoost</text><polyline points="60.0,49.5 61.7,50.5 63.3,51.6 65.0,52.7 66.7,53.7 68.4,54.8 70.0,55.8 71.7,56.9 73.4,58.0 75.1,59.0 76.7,60.1 78.4,61.1 80.1,62.2 81.7,63.2 83.4,64.3 85.1,65.4 86.8,66.4 88.4,67.5 90.1,68.5 91.8,69.6 93.4,70.6 95.1,71.7 96.8,72.8 98.5,73.8 100.1,74.9 101.8,75.9 103.5,77.0 105.2,78.0 106.8,79.1 108.5,80.1 110.2,81.2 111.8,82.3 113.5,83.3 115.2,84.4 116.9,85.4 118.5,86.5 120.2,87.5 121.9,88.6 123.5,89.6 125.2,90.7 126.9,91.7 128.6,92.8 130.2,93.8 131.9,94.9 133.6,95.9 135.3,97.0 136.9,98.0 138.6,99.1 140.3,100.1 141.9,101.2 143.6,102.2 145.3,103.3 147.0,104.3 148.6,105.4 150.3,106.4 152.0,107.5 153.6,108.5 155.3,109.5 157.0,110.6 158.7,111.6 160.3,112.7 162.0,113.7 163.7,114.8 165.4,115.8 167.0,116.8 168.7,117.9 170.4,118.9 172.0,120.0 173.7,121.0 175.4,122.0 177.1,123.1 178.7,124.1 180.4,125.1 182.1,126.2 183.7,127.2 185.4,128.2 187.1,129.3 188.8,130.3 190.4,131.3 192.1,132.3 193.8,133.4 195.5,134.4 197.1,135.4 198.8,136.4 200.5,137.5 202.1,138.5 203.8,139.5 205.5,140.5 207.2,141.5 208.8,142.5 210.5,143.5 212.2,144.6 213.8,145.6 215.5,146.6 217.2,147.6 218.9,148.6 220.5,149.6 222.2,150.6 223.9,151.6 225.6,152.6 227.2,153.6 228.9,154.6 230.6,155.5 232.2,156.5 233.9,157.5 235.6,158.5 237.3,159.5 238.9,160.4 240.6,161.4 242.3,162.4 243.9,163.4 245.6,164.3 247.3,165.3 249.0,166.2 250.6,167.2 252.3,168.2 254.0,169.1 255.7,170.0 257.3,171.0 259.0,171.9 260.7,172.9 262.3,173.8 264.0,174.7 265.7,175.6 267.4,176.6 269.0,177.5 270.7,178.4 272.4,179.3 274.0,180.2 275.7,181.1 277.4,182.0 279.1,182.9 280.7,183.8 282.4,184.6 284.1,185.5 285.8,186.4 287.4,187.3 289.1,188.1 290.8,189.0 292.4,189.8 294.1,190.6 295.8,191.5 297.5,192.3 299.1,193.1 300.8,193.9 302.5,194.8 304.1,195.6 305.8,196.4 307.5,197.1 309.2,197.9 310.8,198.7 312.5,199.5 314.2,200.2 315.9,201.0 317.5,201.7 319.2,202.5 320.9,203.2 322.5,203.9 324.2,204.7 325.9,205.4 327.6,206.1 329.2,206.8 330.9,207.4 332.6,208.1 334.2,208.8 335.9,209.4 337.6,210.1 339.3,210.7 340.9,211.4 342.6,212.0 344.3,212.6 346.0,213.2 347.6,213.8 349.3,214.4 351.0,215.0 352.6,215.6 354.3,216.1 356.0,216.7 357.7,217.2 359.3,217.8 361.0,218.3 362.7,218.8 364.3,219.3 366.0,219.9 367.7,220.3 369.4,220.8 371.0,221.3 372.7,221.8 374.4,222.2 376.1,222.7 377.7,223.1 379.4,223.6 381.1,224.0 382.7,224.4 384.4,224.8 386.1,225.2 387.8,225.6 389.4,226.0 391.1,226.4 392.8,226.7 394.4,227.1 396.1,227.4 397.8,227.8 399.5,228.1 401.1,228.4 402.8,228.8 404.5,229.1 406.2,229.4 407.8,229.7 409.5,230.0 411.2,230.3 412.8,230.5 414.5,230.8 416.2,231.1 417.9,231.3 419.5,231.6 421.2,231.8 422.9,232.1 424.5,232.3 426.2,232.5 427.9,232.7 429.6,232.9 431.2,233.2 432.9,233.4 434.6,233.6 436.3,233.8 437.9,233.9 439.6,234.1 441.3,234.3 442.9,234.5 444.6,234.6 446.3,234.8 448.0,235.0 449.6,235.1 451.3,235.3 453.0,235.4 454.6,235.5 456.3,235.7 458.0,235.8 459.7,235.9 461.3,236.1 463.0,236.2 464.7,236.3 466.4,236.4 468.0,236.5 469.7,236.6 471.4,236.8 473.0,236.9 474.7,237.0 476.4,237.0 478.1,237.1 479.7,237.2 481.4,237.3 483.1,237.4 484.7,237.5 486.4,237.6 488.1,237.6 489.8,237.7 491.4,237.8 493.1,237.9 494.8,237.9 496.5,238.0 498.1,238.1 499.8,238.1 501.5,238.2 503.1,238.2 504.8,238.3 506.5,238.3 508.2,238.4 509.8,238.5 511.5,238.5 513.2,238.6 514.8,238.6 516.5,238.6 518.2,238.7 519.9,238.7 521.5,238.8 523.2,238.8 524.9,238.8 526.6,238.9 528.2,238.9 529.9,239.0 531.6,239.0 533.2,239.0 534.9,239.1 536.6,239.1 538.3,239.1 539.9,239.1 541.6,239.2 543.3,239.2 544.9,239.2 546.6,239.2 548.3,239.3 550.0,239.3 551.6,239.3 553.3,239.3 555.0,239.4 556.7,239.4 558.3,239.4 560.0,239.4" fill="none" class="sb" stroke-width="2.2"/><line x1="260" y1="64" x2="282" y2="64" class="sb" stroke-width="2.5"/><text x="288" y="68" font-size="11.5">log-loss log₂(1+e^(−2yF)) ← GBM</text><text x="310.0" y="284" text-anchor="middle" class="tm" font-size="11.5">margin y·F(x): negative = wrong side, positive = right side</text></svg><figcaption>Three losses as a function of the margin y·F(x). Both smooth losses sit above the 0-1 loss, so pushing them down pushes mistakes down. For a row on the wrong side (left), exponential loss explodes while log-loss grows only in a straight line: that is the whole story of AdaBoost's noise sensitivity.</figcaption></figure>
  <p>The step-shaped 0-1 loss simply counts mistakes: 1 on the wrong side (negative margin), 0 on the right side. Both smooth losses sit above it, so pushing them down pushes mistakes down. On the right side of the picture they behave alike. On the wrong side they differ sharply: the exponential loss shoots upwards, while the log-loss used by gradient boosting grows only like a straight line. A row that is badly wrong therefore costs enormously more under AdaBoost's loss, and section 09 shows the consequence. Replacing e^(−yF) with log-loss gives an algorithm called LogitBoost; replacing it with any differentiable loss and fitting each tree to the gradient gives <a class="xref" data-note="ml_gbm">Gradient Boosting</a>. AdaBoost is the special case that started it all.</p>

  <h2 id="ada-code"><span class="num">06</span>From Scratch vs scikit-learn</h2>
  <p>Fourteen days are too few to compare implementations seriously, so this section uses the tree group's larger dataset: 20,000 synthetic mobile-phone customers with 12 numeric columns and two pure-noise columns, labelled 1 if the customer churned (left), split into 12,000 training, 3,000 validation and 5,000 test rows. Every churn example on this page starts from this setup:</p>
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
  <p>Below is AdaBoost in about 25 lines. The weak learner is sklearn's stump, so we can compare like with like; everything else (the weights, ε, α, the update and the vote) is ours. The 0/1 churn labels are converted to −1/+1 inside <code>fit</code>.</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
class MyAdaBoost:
    def __init__(self, n_estimators=50, learning_rate=1.0, max_depth=1):
        self.M, self.lr, self.depth = n_estimators, learning_rate, max_depth
    def fit(self, X, y):                       # y in {0, 1}
        ys = np.where(y == 1, 1, -1)           # work with -1 / +1
        w = np.full(len(y), 1 / len(y))        # equal weights
        self.stumps, self.alphas = [], []
        for m in range(self.M):
            h = DecisionTreeClassifier(max_depth=self.depth, random_state=m).fit(X, ys, sample_weight=w)
            pred = h.predict(X)
            eps = w[pred != ys].sum() / w.sum()           # weighted error
            if eps &lt;= 0 or eps &gt;= 0.5:                    # perfect or useless: stop
                break
            alpha = self.lr * 0.5 * np.log((1 - eps) / eps)   # its say
            w = w * np.exp(-alpha * ys * pred)            # wrong rows up, right rows down
            w = w / w.sum()
            self.stumps.append(h); self.alphas.append(alpha)
        return self
    def decision_function(self, X):            # F(x) = sum of alpha * h(x)
        return sum(a * h.predict(X) for a, h in zip(self.alphas, self.stumps))
    def predict(self, X):
        return (self.decision_function(X) &gt; 0).astype(int)

mine = MyAdaBoost(n_estimators=200).fit(Xtr, ytr)
sk = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=200, random_state=0).fit(Xtr, ytr)
print("my alphas[:4]       ", np.round(mine.alphas[:4], 4))
print("sklearn weights[:4] ", np.round(sk.estimator_weights_[:4], 4))
print("same split feature in all 200 stumps:",
      all(a.tree_.feature[0] == b.tree_.feature[0] for a, b in zip(mine.stumps, sk.estimators_)))
print(f"validation accuracy: mine {np.mean(mine.predict(Xva) == yva):.4f}, sklearn {sk.score(Xva, yva):.4f}, "
      f"predictions agree on {np.mean(mine.predict(Xva) == sk.predict(Xva)):.1%} of rows")</div>
  <div class="fx" data-lang="text">my alphas[:4]        [0.2053 0.0916 0.1068 0.1113]
sklearn weights[:4]  [0.4107 0.1832 0.2136 0.2226]
same split feature in all 200 stumps: True
validation accuracy: mine 0.6487, sklearn 0.6487, predictions agree on 100.0% of rows</div>
  <p>The first line of output looks like a disagreement: sklearn's weights are exactly twice ours. That is a convention, not a difference. sklearn uses the SAMME formula from section 07, which for two classes is α = ln((1 − ε)/ε) without the ½. Doubling every α doubles F but never changes its sign, so the predictions are identical; and sklearn's update (multiply only the wrong rows by e^(2α), then normalise) gives the same distribution as ours after normalising. The next lines confirm it: the same feature is chosen in all 200 stumps, and the predictions agree on every validation row. Notice also how weak 200 stumps are here, about 0.65 accuracy: this data is full of interactions between columns, and a sum of one-question trees cannot express "A and B together". Section 10 fixes that with deeper trees.</p>

  <h2 id="ada-samme"><span class="num">07</span>Multiclass: SAMME</h2>
  <p>Everything so far assumed two classes. With K classes the binary rules break. A stump that guesses at random among 10 classes is wrong 90% of the time, so a stump that is wrong "only" 80% of the time is actually good: it is right twice as often as chance. But the binary say α = ½·ln((1 − ε)/ε) is negative for any ε above 0.5, so binary AdaBoost would throw such a stump away or flip it. The binary rule draws the "better than chance" line in the wrong place.</p>
  <p><strong>SAMME</strong> (Stagewise Additive Modeling using a Multi-class Exponential loss; Zhu and colleagues, 2009) moves that line by adding one term: αₘ = ln((1 − εₘ)/εₘ) + ln(K − 1). The weights of wrong rows are multiplied by e^αₘ and then normalised, and the prediction is the class with the largest total vote, where each stump adds αₘ to the class it predicts. α is positive exactly when ε &lt; 1 − 1/K, that is, when the stump beats random guessing among K classes. For K = 2 the extra term is ln 1 = 0, and α = ln((1 − ε)/ε) is just twice the binary α, which is why sklearn's weights were doubled. On the 10-class digits dataset (8×8 pixel images of the digits 0 to 9):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
X, y = load_digits(return_X_y=True)                      # 10 classes, 1797 images of 8x8 pixels
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
K = 10
stump = DecisionTreeClassifier(max_depth=1).fit(Xtr, ytr)
eps = np.mean(stump.predict(Xtr) != ytr)
print(f"first stump error eps = {eps:.3f}   (random guessing: {1 - 1/K:.2f})")
print(f"binary formula 0.5*ln((1-eps)/eps) = {0.5*np.log((1-eps)/eps):+.3f}")
print(f"SAMME  ln((1-eps)/eps) + ln(K-1)   = {np.log((1-eps)/eps) + np.log(K-1):+.3f}")
for depth in [1, 3]:
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=300,
                             learning_rate=0.5, random_state=0).fit(Xtr, ytr)
    one = DecisionTreeClassifier(max_depth=depth).fit(Xtr, ytr)
    print(f"depth {depth}: one tree test acc {one.score(Xte, yte):.3f}   AdaBoost, 300 trees {ada.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">first stump error eps = 0.802   (random guessing: 0.90)
binary formula 0.5*ln((1-eps)/eps) = -0.699
SAMME  ln((1-eps)/eps) + ln(K-1)   = +0.799
depth 1: one tree test acc 0.198   AdaBoost, 300 trees 0.861
depth 3: one tree test acc 0.476   AdaBoost, 300 trees 0.980</div>
  <p>The first stump is wrong 80.2% of the time, much better than the 90% of a random guess. The binary formula would give it α = −0.699 (reject); SAMME gives +0.799 (keep). Three hundred boosted stumps reach 86.1% accuracy on ten classes, up from 19.8% for one stump, and with depth-3 trees 98.0%. An older variant, SAMME.R, used each tree's class probabilities rather than its hard vote; it has been removed from recent sklearn versions, and <code>AdaBoostClassifier</code> now always runs SAMME.</p>

  <h2 id="ada-r2"><span class="num">08</span>Regression: AdaBoost.R2</h2>
  <p>AdaBoost's weights are driven by "wrong", and for a number such as the diary's turnout there is no "wrong": predicting 37 players when 38 came is neither right nor wrong, just a little off. <strong>AdaBoost.R2</strong> (Drucker, 1997) replaces "wrong" with "how wrong, on a scale from 0 to 1". Each round it trains a regressor on the weighted rows, computes each row's absolute error eᵢ = |yᵢ − h(xᵢ)|, and divides by the largest error D to get a loss Lᵢ = eᵢ/D between 0 and 1 (or its square, or 1 − e^(−eᵢ/D)). The average weighted loss L̄ = Σwᵢ·Lᵢ plays the role of ε, and the round stops if it reaches 0.5. Then β = L̄/(1 − L̄), which is small when the model is good; the model's vote is ln(1/β); and each weight is multiplied by β^(1 − Lᵢ). A row predicted perfectly (L = 0) is multiplied by β and shrinks the most; the worst row (L = 1) is multiplied by β⁰ = 1 and keeps its weight, so badly predicted rows gain share. The final prediction is the <em>weighted median</em> of all the models' predictions, not the mean, so one wild model cannot drag the answer.</p>
  <p>One round on the diary's turnout, with the stump "Humidity high?" (which predicts 28 on humid days and 40 on the others) and equal starting weights:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y = df.Turnout.values.astype(float)                    # regression target: players who came
humid = (df.Humidity == "High").values
w = np.full(14, 1 / 14)
pred = np.where(humid, y[humid].mean(), y[~humid].mean())   # stump "Humidity high?": mean of each side
err = np.abs(y - pred); D = err.max()
L = err / D                                            # linear loss in [0, 1]
Lbar = np.sum(w * L); beta = Lbar / (1 - Lbar)
print("abs errors", err.astype(int).tolist(), f"  largest D = {D:.0f} (day {df.index[err.argmax()]})")
print(f"Lbar = {Lbar:.4f}   beta = {beta:.4f}   model weight ln(1/beta) = {np.log(1 / beta):.4f}")
w = w * beta ** (1 - L); w /= w.sum()
print(f"new weights: D6 {w[5]:.3f} (worst day), D9 {w[8]:.3f} (perfect day), others {w.min():.3f}-{np.sort(w)[-2]:.3f}")</div>
  <div class="fx" data-lang="text">abs errors [4, 8, 8, 4, 4, 18, 2, 2, 0, 6, 2, 10, 8, 8]   largest D = 18 (day D6)
Lbar = 0.3333   beta = 0.5000   model weight ln(1/beta) = 0.6931
new weights: D6 0.112 (worst day), D9 0.056 (perfect day), others 0.056-0.082</div>
  <p>The largest error is D6: 22 players on a dry day predicted at 40, an error of 18, so D = 18 and D6 gets L = 1, while D9 (40 predicted, 40 came) gets L = 0. The average loss is (4 + 8 + 8 + … + 8)/(14 × 18) = 84/252 = 1/3, so β = (1/3)/(2/3) = 0.5 and the stump's vote is ln 2 = 0.693. Every day's weight is multiplied by 0.5^(1 − L): D6 keeps its weight and D9 is halved, so after normalising D6 has risen from 0.071 to 0.112, the heaviest day, and D9 has fallen to 0.056. In practice AdaBoost.R2 (<code>AdaBoostRegressor</code> in sklearn) is rarely the best choice today; gradient boosting with squared or Huber loss usually does better.</p>

  <h2 id="ada-noise"><span class="num">09</span>Noise Sensitivity</h2>
  <p>AdaBoost's strength is that hard rows get heavier. But consider a row whose label is simply wrong: a customer marked "churned" who actually just moved to a family plan. Its features look like a stayer's, so no sensible model will get it right. AdaBoost will keep getting it wrong, and every round it stays wrong its weight is multiplied by e^α. In loss terms, a row with margin −3 costs e³ = 20 under the exponential loss but only about 8.7 under log-loss (the figure in section 05). The exponential penalty for being confidently wrong is what makes AdaBoost chase such rows. It is like a teacher who keeps setting more questions on a topic the class "fails", when the real problem is a misprinted answer key.</p>
  <p>On the diary we can watch two cases over 20 rounds. The first is D6 from the trace: its label is correct, but no sum of stumps can get it right (rain and windy is an interaction). The second is a genuine labelling mistake: suppose the captain wrote "No" for D13, an overcast day that was in fact played.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
     "Humidity high?": df.Humidity == "High", "Wind strong?": df.Wind == "Strong"}
Q = {k: v.values for k, v in Q.items()}
def weight_history(y, rounds):
    w = np.full(14, 1 / 14); hist = [w.copy()]
    for m in range(rounds):
        cands = [(w[np.where(q, s, -s) != y].sum(), np.where(q, s, -s)) for q in Q.values() for s in (1, -1)]
        eps, h = min(cands, key=lambda c: c[0])
        a = 0.5 * np.log((1 - eps) / eps)
        w = w * np.exp(-a * y * h); w /= w.sum(); hist.append(w.copy())
    return np.array(hist)
y = np.where(df.Play == "Yes", 1, -1)
y_bad = y.copy(); y_bad[12] = -1                       # D13 (overcast, played) wrongly written as "No"
for name, yy, d in [("clean diary, hard day D6", y, 5), ("D13 mislabelled as No", y_bad, 12)]:
    H = weight_history(yy, 20)
    print(f"{name}: weight of D{d + 1} after rounds 0,1,2,5,10,20:",
          " ".join(f"{H[r, d]:.3f}" for r in [0, 1, 2, 5, 10, 20]),
          f"| heaviest day at the end: {df.index[H[20].argmax()]}")</div>
  <div class="fx" data-lang="text">clean diary, hard day D6: weight of D6 after rounds 0,1,2,5,10,20: 0.071 0.125 0.227 0.181 0.169 0.196 | heaviest day at the end: D4
D13 mislabelled as No: weight of D13 after rounds 0,1,2,5,10,20: 0.071 0.100 0.136 0.187 0.181 0.181 | heaviest day at the end: D13</div>
  <p>D6 goes from 0.071 to 0.227 after two rounds and stays around 0.17 to 0.20: AdaBoost keeps spending about a fifth of its attention on a day it cannot fix. The mislabelled D13 climbs from 0.071 to 0.181 and ends as the heaviest day of all, two and a half times a fair share. At scale, we flip 10% or 20% of the churn <em>training</em> labels at random (the validation labels stay clean) and compare AdaBoost with gradient boosting using log-loss and with a random forest:</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier, HistGradientBoostingClassifier, RandomForestClassifier
rng = np.random.default_rng(1)
for noise in [0.0, 0.1, 0.2]:
    flip = rng.random(len(ytr)) &lt; noise                  # wrong labels in TRAIN only
    yn = np.where(flip, 1 - ytr, ytr)
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=4), n_estimators=300,
                             learning_rate=0.5, random_state=0).fit(Xtr, yn)
    gbm = HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0).fit(Xtr, yn)
    rf = RandomForestClassifier(n_estimators=300, random_state=0).fit(Xtr, yn)
    print(f"flipped {noise:.0%}:  AdaBoost {ada.score(Xva, yva):.3f}   "
          f"gradient boosting (log-loss) {gbm.score(Xva, yva):.3f}   random forest {rf.score(Xva, yva):.3f}")
# where did AdaBoost put its weight in the 20% run? replay the weights
w = np.full(len(yn), 1 / len(yn))
for h, a in zip(ada.estimators_, ada.estimator_weights_):
    w = w * np.exp(a * (h.predict(Xtr) != yn)); w /= w.sum()
print(f"flipped rows are {flip.mean():.0%} of rows but hold {w[flip].sum():.0%} of the weight; "
      f"{flip[np.argsort(w)[-100:]].sum()} of the 100 heaviest rows are flipped")</div>
  <div class="fx" data-lang="text">flipped 0%:  AdaBoost 0.828   gradient boosting (log-loss) 0.872   random forest 0.879
flipped 10%:  AdaBoost 0.814   gradient boosting (log-loss) 0.847   random forest 0.874
flipped 20%:  AdaBoost 0.772   gradient boosting (log-loss) 0.812   random forest 0.850
flipped rows are 20% of rows but hold 28% of the weight; 88 of the 100 heaviest rows are flipped</div>
  <p>All three get worse as the training labels get noisier. Both boosters lose about 0.06 at 20% noise (AdaBoost 0.828 → 0.772, gradient boosting with log-loss 0.872 → 0.812, both run for a fixed 300 rounds), while the random forest loses only 0.029 (0.879 → 0.850), because averaging never up-weights any row. AdaBoost is the weakest at every noise level. The last line shows why it suffers: after 300 rounds on the 20%-noise labels, the flipped rows are 20% of the data but hold 28% of the total weight, and 88 of the 100 heaviest rows are flipped labels. The algorithm is spending its attention on exactly the rows it should ignore.</p>
  <p>This also settles an old puzzle. Early papers found that on clean data AdaBoost's test error often kept falling even after its training error reached zero, which seemed to say "AdaBoost never overfits". The explanation (Schapire, Freund, Bartlett and Lee, 1998) is that extra rounds keep pushing the training rows' margins further from zero, making the classifier more confident and more stable. But with label noise, the noisy rows can only reach positive margins by bending the model around them, and then extra rounds do overfit. Noisy labels are the normal case in business data (churn, fraud, medical codes), so the remedies matter: fewer rounds chosen on validation data and a smaller learning rate; cleaning labels or removing obvious outliers; a loss that grows more slowly for confident mistakes (gradient boosting with log-loss or Huber loss); or a bagging-type model such as a random forest.</p>

  <h2 id="ada-sk"><span class="num">10</span>Settings and When to Use It</h2>
  <p>sklearn's <code>AdaBoostClassifier</code> has only a few settings, and they map directly onto the algorithm. <code>estimator</code> is the weak learner, by default a stump (<code>DecisionTreeClassifier(max_depth=1)</code>); any classifier that accepts <code>sample_weight</code> works. <code>n_estimators</code> (default 50) is the maximum number of rounds. <code>learning_rate</code> (default 1.0) multiplies every α, so each learner both votes less and moves the weights less; it is the same shrinkage idea as in <a class="xref" data-note="ml_boosting">How Boosting Works</a> and trades off directly against the number of rounds. After fitting, <code>estimators_</code>, <code>estimator_weights_</code> (the α values, on the SAMME scale) and <code>estimator_errors_</code> (the ε values) are available, and <code>staged_score</code> / <code>staged_predict</code> give the model after 1, 2, 3, … rounds, which is how you choose the number of rounds on validation data.</p>
  <p>The setting that matters most in practice is the depth of the base tree. On the diary, counting training days right after each round:</p>
  <div class="fx" data-lang="py">import pandas as pd
from play import df
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = (df.Play == "Yes").astype(int)
for depth in [1, 2]:
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=50, random_state=0).fit(X, y)
    right = [round(s * 14) for s in ada.staged_score(X, y)]
    print(f"depth {depth}: days right after rounds 1, 2, 3, 5, 10, 50: "
          f"{[right[i - 1] for i in [1, 2, 3, 5, 10, len(right)]]} of 14")</div>
  <div class="fx" data-lang="text">depth 1: days right after rounds 1, 2, 3, 5, 10, 50: [9, 10, 12, 12, 12, 11] of 14
depth 2: days right after rounds 1, 2, 3, 5, 10, 50: [12, 12, 14, 14, 14, 14] of 14</div>
  <p>Stumps reach 12 of 14 days by round 3 and never more; later rounds even wobble down to 11 as the weights keep shifting between the hard days. Depth-2 trees can ask "Rain? then Windy?" and get all 14 by round 3. The same lesson at scale, with the learning rate too:</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
for depth, lr in [(1, 1.0), (3, 0.5), (6, 0.5), (6, 0.1)]:
    t0 = time.time()
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=300,
                             learning_rate=lr, random_state=0).fit(Xtr, ytr)
    curve = list(ada.staged_score(Xva, yva))
    print(f"depth={depth} lr={lr}: val acc after 10/50/300 rounds {curve[9]:.3f} {curve[49]:.3f} {curve[-1]:.3f}"
          f"  best {max(curve):.3f} @ {int(np.argmax(curve)) + 1}  train {ada.score(Xtr, ytr):.3f}  {time.time() - t0:.0f}s")</div>
  <div class="fx" data-lang="text">depth=1 lr=1.0: val acc after 10/50/300 rounds 0.617 0.646 0.649  best 0.652 @ 289  train 0.667  7s
depth=3 lr=0.5: val acc after 10/50/300 rounds 0.744 0.785 0.791  best 0.791 @ 299  train 0.805  18s
depth=6 lr=0.5: val acc after 10/50/300 rounds 0.818 0.838 0.851  best 0.854 @ 98  train 0.916  34s
depth=6 lr=0.1: val acc after 10/50/300 rounds 0.803 0.821 0.829  best 0.831 @ 274  train 0.852  31s</div>
  <p>Each line shows validation accuracy after 10, 50 and 300 rounds, the best round, training accuracy and fit time. Base-tree depth matters most: stumps plateau around 0.65 however many rounds are added, depth 3 reaches 0.79 and depth 6 0.85, because the churn pattern is made of interactions that only deeper trees can express. The learning rate trades speed for smoothness: at depth 6, lr 0.5 peaks at round 98 (0.854) and then drifts slightly down (0.851 at round 300) while training accuracy climbs to 0.916, which is mild overfitting, whereas lr 0.1 is still improving at round 274 (0.831) and simply needs more rounds. And it is slow: each round is a full weighted tree fit, one after another, so the depth-6 runs take tens of seconds (times are approximate), while the histogram-based gradient-boosting libraries fit 500 trees in a second or two with higher accuracy. A sensible AdaBoost recipe is depth 2 to 6, a learning rate of 0.1 to 0.5, a few hundred rounds, and the round count chosen with <code>staged_score</code> on validation data.</p>
  <p>Against its siblings, AdaBoost compares like this:</p>
  <table class="tbl">
    <tr><th></th><th>Random Forest</th><th>AdaBoost</th><th>Gradient Boosting</th></tr>
    <tr><td>how trees are built</td><td>many deep trees, in parallel, on bootstrap samples</td><td>many shallow trees, in sequence, on re-weighted rows</td><td>many shallow trees, in sequence, on gradients of a loss</td></tr>
    <tr><td>main error reduced</td><td>variance</td><td>bias</td><td>bias</td></tr>
    <tr><td>loss</td><td>none (impurity per tree)</td><td>exponential only</td><td>any differentiable loss</td></tr>
    <tr><td>combining</td><td>plain average or vote</td><td>α-weighted vote</td><td>sum with learning rate</td></tr>
    <tr><td>label noise</td><td>robust</td><td>sensitive</td><td>moderate (log-loss, Huber)</td></tr>
    <tr><td>overfits with more trees?</td><td>no</td><td>slowly; yes with noise</td><td>yes; needs early stopping</td></tr>
    <tr><td>churn validation accuracy</td><td>≈ 0.88</td><td>0.65 (stumps) to 0.85 (depth 6)</td><td>≈ 0.85–0.87</td></tr>
    <tr><td>use today</td><td>strong, robust default</td><td>small clean data, teaching, any weighted learner</td><td>the default for tabular data (XGBoost, LightGBM, CatBoost)</td></tr>
  </table>
  <p>So you would rarely pick AdaBoost as the final model on tabular data today. It remains reasonable for small, clean datasets, when you want a very simple model (a weighted list of stumps), and when your base learner is not a tree but can take sample weights. Historically it was hugely important: AdaBoost over simple image features was the heart of the Viola–Jones face detector (2001), the first real-time face detector used in cameras, and Freund and Schapire received the Gödel Prize for it in 2003.</p>

  <h2 id="ada-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common bug in a hand-written AdaBoost is leaving the labels as 0 and 1. The update multiplies by e^(−α·y·h), and with 0/1 coding the product y·h is 0 whenever either the label or the prediction is 0, so those rows' weights never change, whether they were right or wrong:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y01 = (df.Play == "Yes").astype(int).values             # 0/1 labels, NOT converted
h01 = np.where(df.Outlook == "Sunny", 0, 1)             # stump: Sunny? -&gt; 0 (No play), else 1
alpha, w = 0.4581, np.full(14, 1 / 14)
show = {"D1 (No, right)": 0, "D6 (No, wrong)": 5, "D3 (Yes, right)": 2, "D9 (Yes, wrong)": 8}
for name, yy, hh in [("0/1 labels  ", y01, h01), ("-1/+1 labels", 2 * y01 - 1, 2 * h01 - 1)]:
    w_new = w * np.exp(-alpha * yy * hh); w_new /= w_new.sum()
    print(name, "  ".join(f"{k}: {w_new[i]:.3f}" for k, i in show.items()))</div>
  <div class="fx" data-lang="text">0/1 labels   D1 (No, right): 0.088  D6 (No, wrong): 0.088  D3 (Yes, right): 0.055  D9 (Yes, wrong): 0.088
-1/+1 labels D1 (No, right): 0.050  D6 (No, wrong): 0.125  D3 (Yes, right): 0.050  D9 (Yes, wrong): 0.125</div>
  <p>With 0/1 labels, D1 (right) and D6 (wrong) end up with the same weight, and D9 (wrong) gets the same weight as D1 (right): the weights no longer say anything about mistakes, and the algorithm silently learns nonsense. Converting to −1/+1 restores the correct behaviour: both wrong days rise to 0.125 and both right days fall to 0.05.</p>
  <p>The second mistake is conceptual: mixing up the two kinds of weight. Row weights wᵢ are temporary and exist only to train the next learner; learner weights αₘ are permanent and decide the vote. Interviewers ask about this often. Related to the formulas, every implementation must guard two edge cases: ε = 0 gives an infinite α and a division by zero, and ε ≥ 0.5 (binary) gives α ≤ 0; stop on the first, and stop or flip on the second.</p>
  <p>Two mistakes concern the base learner. Using stumps on data with interactions caps the model at an additive one (the diary stuck at 12 of 14 days, churn at 0.65), so try depths 1 to 6. At the other extreme, using a strong base learner such as a fully grown tree gives ε ≈ 0 on the training rows in round 1, a huge α, and an "ensemble" that is just one overfit tree.</p>
  <p>Finally, three mistakes concern trusting the output. Trusting AdaBoost on noisy labels lets mislabelled rows dominate the weights; choose the number of rounds on clean validation data and prefer gradient boosting or a forest when labels are noisy. Reading <code>predict_proba</code> as real probabilities is risky, because AdaBoost's scores are pushed towards the extremes; use <code>CalibratedClassifierCV</code> if you need real chances. And comparing α values across libraries is misleading: sklearn's <code>estimator_weights_</code> are twice the textbook α, the same model on a different scale.</p>

  <h2 id="ada-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>AdaBoost</b>: boosting for classification that keeps a weight on every row, trains a weak learner on the weighted rows each round, gives it a say α from its weighted error, and multiplies wrong rows' weights by e^α and right rows' by e^−α before renormalising. Prediction: sign(Σα·h).</li>
    <li><b>Margin</b>: y·F(x); positive = right, bigger = more confident.</li>
    <li><b>Weighted error ε</b>: total weight of the rows the learner gets wrong (weights sum to 1).</li>
    <li><b>Row weight vs learner weight</b>: wᵢ is temporary (training the next learner); αₘ is permanent (voting).</li>
    <li><b>Exponential loss</b>: e^(−y·F); AdaBoost is its forward stagewise minimiser.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>name</th><th>formula</th><th>diary value</th></tr>
    <tr><td>weighted error</td><td>ε = Σ wᵢ·1[h(xᵢ) ≠ yᵢ]</td><td>ε₁ = 4/14 = 0.2857</td></tr>
    <tr><td>say</td><td>α = ½·ln((1 − ε)/ε)</td><td>0.4581, 0.4847, 0.5144</td></tr>
    <tr><td>update</td><td>wᵢ ← wᵢ·e^(−α·yᵢ·h(xᵢ)) / Z</td><td>wrong 1/14 → 0.125, right → 0.05</td></tr>
    <tr><td>normaliser</td><td>Z = 2√(ε(1 − ε))</td><td>0.9035, 0.8930, 0.8809</td></tr>
    <tr><td>shortcut</td><td>wrong: w/(2ε); right: w/(2(1 − ε))</td><td>D6: 0.125/0.55 = 0.227</td></tr>
    <tr><td>final</td><td>H(x) = sign(Σ αₘ·hₘ(x))</td><td>D3: +0.488 → Play</td></tr>
    <tr><td>error bound</td><td>training error ≤ ∏ Zₘ ≤ e^(−2Mγ²)</td><td>0.143 ≤ 0.7107</td></tr>
    <tr><td>probability</td><td>P(y = +1) = 1/(1 + e^(−2F))</td><td>D9: 0.75</td></tr>
    <tr><td>SAMME</td><td>α = ln((1 − ε)/ε) + ln(K − 1)</td><td>K = 2: 0.916 (= 2 × 0.4581)</td></tr>
    <tr><td>AdaBoost.R2</td><td>Lᵢ = eᵢ/D; β = L̄/(1 − L̄); w ← w·β^(1 − Lᵢ)</td><td>L̄ = 1/3, β = 0.5</td></tr>
  </table>
  <h3>The diary trace</h3>
  <table class="tbl">
    <tr><th>round</th><th>stump</th><th>ε</th><th>α</th><th>training errors</th></tr>
    <tr><td>1</td><td>Sunny? → No play</td><td>0.2857</td><td>0.4581</td><td>4</td></tr>
    <tr><td>2</td><td>Humidity high? → No play</td><td>0.2750</td><td>0.4847</td><td>4</td></tr>
    <tr><td>3</td><td>Rain? → No play</td><td>0.2633</td><td>0.5144</td><td>2 (D4, D6)</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import AdaBoostClassifier, AdaBoostRegressor
from sklearn.tree import DecisionTreeClassifier

ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=3),   # base learner
                         n_estimators=300, learning_rate=0.5)   # rounds, shrinkage of alpha
ada.fit(X_train, y_train)
ada.estimator_weights_                  # alphas (SAMME scale = 2x textbook)
curve = list(ada.staged_score(X_val, y_val))   # pick the number of rounds here</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Convert 0/1 labels to −1/+1 in hand-written code.</li>
    <li>After each update the last learner has weighted error exactly 0.5.</li>
    <li>Guard ε = 0 (α infinite) and ε ≥ 0.5 (α ≤ 0).</li>
    <li>Stumps cannot learn interactions; use depth 2–6.</li>
    <li>Exponential loss makes mislabelled rows dominate; prefer GBM or a forest on noisy labels.</li>
    <li>Probabilities are poorly calibrated; calibrate before use.</li>
  </ul>

  <h2 id="ada-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain AdaBoost in a few sentences.</summary><div class="qa-body">Every training row gets a weight, equal at the start. Each round a weak learner, usually a stump, is trained on the weighted rows and gets a say α = ½·ln((1 − ε)/ε) based on its weighted error ε. The rows it got wrong are multiplied by e^α and the rows it got right by e^−α, and the weights are renormalised, so the next learner focuses on the current mistakes. The final prediction is the sign of the α-weighted sum of all learners.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between the row weights and the learner weights?</summary><div class="qa-body">Row weights wᵢ say how much each training row matters when fitting the next learner; they change every round and are discarded after training. Learner weights αₘ say how much each learner's vote counts in the final prediction; they are computed once per learner and stored in the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does AdaBoost use labels −1 and +1?</summary><div class="qa-body">Because then y·h(x) is +1 for a correct prediction and −1 for a wrong one, so a single formula, w·e^(−α·y·h), raises wrong rows and lowers right rows. With 0/1 labels the product is 0 for every row of class 0, so their weights never change and the algorithm breaks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A learner has weighted error 0.5. What is its α, and what happens if ε = 0.7?</summary><div class="qa-body">At ε = 0.5, α = ½·ln 1 = 0: a coin flip gets no say. At ε = 0.7, α = ½·ln(0.3/0.7) = −0.42: its votes are flipped, and the flipped learner has error 0.3. Implementations usually stop when ε ≥ 0.5 because such a learner can always be flipped or a better one found.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive α from the exponential loss.</summary><div class="qa-body">Adding α·h to F gives loss Σ wᵢ·e^(−α·yᵢ·h(xᵢ)) with wᵢ = e^(−yᵢF(xᵢ)). Splitting into right and wrong rows, it is proportional to (1 − ε)e^−α + ε·e^α. Setting the derivative in α to zero gives ε·e^α = (1 − ε)e^−α, so e^(2α) = (1 − ε)/ε and α = ½·ln((1 − ε)/ε).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What weighted error does the previous learner have on the new weights, and why does it matter?</summary><div class="qa-body">Exactly 0.5. After the update both the wrong rows and the right rows hold √(ε(1 − ε)) of the unnormalised weight, so they are equal. The previous learner is a coin flip on the new distribution, so the next learner cannot repeat it and must find new information; this is AdaBoost's built-in diversity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did round 3 on the diary choose a stump with six mistakes over ones with four or five?</summary><div class="qa-body">Because AdaBoost minimises weighted error, not the count of mistakes. "Rain? → No play" was wrong mostly on the lightest days (those the team already got right twice), so its weighted error, 0.263, was the smallest. A stump that errs only where the team is already confident is the most useful next member.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the training error bound say?</summary><div class="qa-body">Training error ≤ ∏ Zₘ = ∏ 2√(εₘ(1 − εₘ)). If every learner has εₘ ≤ ½ − γ, the bound is at most e^(−2Mγ²), so training error falls exponentially with the number of rounds. It proves weak learners can be boosted into a strong learner on the training set, but says nothing directly about test error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which loss does AdaBoost minimise, and what follows from it?</summary><div class="qa-body">The exponential loss Σe^(−y·F), minimised greedily one learner at a time (forward stagewise). The row weights are each row's current loss, the best learner minimises weighted error, α is the exact step size, Z is the factor by which the loss shrinks each round, and P(y = +1) = 1/(1 + e^(−2F)). The exponential shape is also the cause of its noise sensitivity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is AdaBoost sensitive to label noise?</summary><div class="qa-body">The exponential loss grows exponentially for rows on the wrong side. A mislabelled row stays wrong, its weight is multiplied by e^α every round, and soon it dominates the distribution so the learners bend to fit it; on the diary a mislabelled D13 became the heaviest day. Log-loss grows only linearly for confident mistakes, which is why gradient boosting with log-loss, or a random forest, is more robust.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does AdaBoost use weak learners? What happens with fully grown trees?</summary><div class="qa-body">Boosting reduces bias by combining many simple, low-variance learners, each correcting the others. A fully grown tree reaches ε ≈ 0 on the training data, so α becomes enormous and there is nothing left for later rounds: you get one overfit tree. Moderately deep trees (depth 2–6) are fine and often better than stumps when features interact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can no number of stumps get every diary day right?</summary><div class="qa-body">A sum of stumps adds one separate effect per question, so it cannot make the wind matter only when it rains. D4 (rain, calm, played) and D6 (rain, windy, not played) need the interaction "rain and windy → no play". Depth-2 trees can express it and reach 14 of 14 by round 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is SAMME different from binary AdaBoost?</summary><div class="qa-body">SAMME uses α = ln((1 − ε)/ε) + ln(K − 1), multiplies wrong rows by e^α, and predicts the class with the largest total α-vote. The ln(K − 1) term moves the "useful" threshold from ε &lt; 0.5 to ε &lt; 1 − 1/K, because random guessing among K classes is wrong (K − 1)/K of the time. For K = 2 it equals twice the binary α and gives the same predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>sklearn's estimator_weights_ are twice your hand-computed α. Is sklearn wrong?</summary><div class="qa-body">No. sklearn uses the SAMME formula, which for two classes is ln((1 − ε)/ε), exactly twice ½·ln((1 − ε)/ε). Scaling every α by the same factor doubles F without changing its sign, and the normalised weight distribution is the same, so predictions are identical (100% agreement on the churn validation rows).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does AdaBoost.R2 adapt the idea to regression?</summary><div class="qa-body">Each row's absolute error is divided by the largest error to give a loss between 0 and 1; the weighted average loss L̄ gives β = L̄/(1 − L̄); weights are multiplied by β^(1 − Lᵢ), so well-predicted rows shrink most; each model gets the vote ln(1/β); and the final prediction is the weighted median of the models' predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does learning_rate do in AdaBoostClassifier?</summary><div class="qa-body">It multiplies every α, so each learner both votes less and moves the weights less. Smaller values need more rounds but usually generalise a little better; it trades off directly against n_estimators, like the learning rate in gradient boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does AdaBoost relate to gradient boosting?</summary><div class="qa-body">Both are forward stagewise additive models. AdaBoost is the special case with exponential loss, where each step becomes "re-weight rows by e^(−yF) and fit a classifier". Gradient boosting generalises it to any differentiable loss by fitting a regression tree to the negative gradient of the loss; with the exponential loss it behaves like AdaBoost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging also changes which rows a model sees. How is it different from AdaBoost's re-weighting?</summary><div class="qa-body">Bagging draws rows at random, independently of any model, and trains its models in parallel; it averages away variance and is robust to noisy labels. AdaBoost sets the weights deterministically from the previous learners' mistakes and trains in sequence; it removes bias but chases noisy labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still choose AdaBoost today?</summary><div class="qa-body">Rarely as the final model on tabular data, where gradient boosting libraries are usually faster and more accurate. It is reasonable for small, clean datasets, when you want a very simple model (a weighted list of stumps), when your base learner is not a tree but accepts sample weights, and as the clearest way to explain boosting in an interview.</div></details>
</main>
`
});
