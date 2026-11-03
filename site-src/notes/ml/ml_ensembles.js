// notes/ml/ml_ensembles.js — Ensemble Learning: The Idea
Object.assign(TOPIC_CONTENT, {
  "ml_ensembles": `<main>
  <h1>Ensemble Learning: The Idea</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Ensemble Learning: The Idea</span></div>
  <p class="lead">An <strong>ensemble</strong> is a team of models whose answers are combined into one answer. It matters because the strongest models for table data in real work, random forests and gradient-boosted trees such as XGBoost and LightGBM, are all ensembles, and because the reason they work is simple enough to compute by hand: a team beats its members only when the members make different mistakes. This page explains why a team of mediocre models can beat its best member, gives the exact maths of when that works and when it fails, shows which kind of error each team design removes, and ends with what teams cost. Our running example continues from <a class="xref" data-note="ml_dtree">Decision Trees</a>: the cricket captain's 14-day diary of weather and matches, small enough to work out by hand, and the shared 20,000-customer churn table, large enough to measure accuracy honestly.</p>

  <h2 id="ens-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ensemble Learning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Several base models + a rule that combines their outputs</li>
          <li>Works when members are better than chance AND make different mistakes</li>
          <li>5 shaky trees (about 0.78 each) voting → 0.840</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The maths</div>
        <ul>
          <li>3 independent voters at 0.7 → majority right 0.784</li>
          <li><b>Condorcet</b>: p &gt; 0.5 and independent → majority accuracy → 1</li>
          <li><b>Var(average)</b> = ρσ² + (1 − ρ)σ²/n, floor ρσ²</li>
          <li><b>Ambiguity</b>: team error = avg member error − avg disagreement</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Which error is removed</div>
        <ul>
          <li>Averaging (bagging): same bias, less variance → deep trees</li>
          <li>Adding (boosting): less bias → stumps / shallow trees</li>
          <li>Diversity from rows, columns, randomness, algorithms, reweighting</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four designs</div>
        <ul>
          <li><b>Bagging</b>: parallel, one algorithm, average</li>
          <li><b>Boosting</b>: sequential, each fixes the team's errors</li>
          <li><b>Voting</b>: fixed rule over different models (hard / soft)</li>
          <li><b>Stacking</b>: a meta-model learns the combination</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits and costs</div>
        <ul>
          <li>No gain from stable, high-bias or copied members</li>
          <li>A weak member can drag a plain average below the best member</li>
          <li>n× training, latency and memory; lost readability</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ens-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why One Model Is Not Enough</span><span class="rm-sub">a tree that changes its mind, and a vote that wins</span></div></div>
      <div class="rm-item rm-done" data-target="ens-vote"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Maths of Voting</span><span class="rm-sub">how often a majority is right, and Condorcet</span></div></div>
      <div class="rm-item rm-done" data-target="ens-avg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Maths of Averaging</span><span class="rm-sub">how much wobble an average removes</span></div></div>
      <div class="rm-item rm-done" data-target="ens-bv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bias and Variance per Design</span><span class="rm-sub">what averaging and adding each fix</span></div></div>
      <div class="rm-item rm-done" data-target="ens-div"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Diversity</span><span class="rm-sub">where the gain comes from, and how to create it</span></div></div>
      <div class="rm-item rm-done" data-target="ens-tax"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Four Designs</span><span class="rm-sub">bagging, boosting, voting, stacking</span></div></div>
      <div class="rm-item rm-done" data-target="ens-run"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Every Design on Real Data</span><span class="rm-sub">the same 20,000 customers, the same test rows</span></div></div>
      <div class="rm-item rm-done" data-target="ens-fail"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">When Ensembles Do Not Help</span><span class="rm-sub">stable, biased, correlated or weak members</span></div></div>
      <div class="rm-item rm-done" data-target="ens-cost"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Costs</span><span class="rm-sub">training time, latency, size, readability</span></div></div>
      <div class="rm-item rm-done" data-target="ens-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">copies, weak members, the test set</span></div></div>
      <div class="rm-item rm-done" data-target="ens-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, design table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="ens-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about ensembles</span></div></div>
    </div>
  </div>

  <h2 id="ens-need"><span class="num">01</span>Why One Model Is Not Enough</h2>
  <p>The <a class="xref" data-note="ml_dtree">Decision Trees</a> note ended with a warning: a decision tree fits the captain's diary perfectly, but remove a single day and the tree can change completely. Let us see how serious that is. We grow the same ID3 tree 14 times, each time leaving out one day, as if the captain had lost one page of his diary, and then ask all 14 trees about the same new day. (<code>play.py</code> holds the diary as a DataFrame <code>df</code>, as in the Decision Trees note.)</p>
  <div class="fx" data-lang="py">import itertools
import numpy as np, pandas as pd
from play import df

def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def id3(d, attrs):                                   # the ID3 tree of the Decision Trees note
    if d.Play.nunique() == 1 or not attrs:
        return d.Play.mode()[0]
    gain = {a: H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(a)) for a in attrs}
    best = max(gain, key=gain.get)
    kids = {v: id3(g, [a for a in attrs if a != best]) for v, g in d.groupby(best)}
    return (best, d.Play.mode()[0], kids)
def predict(t, row):
    while isinstance(t, tuple):
        t = t[2].get(row[t[0]], t[1])                # unseen value -&gt; majority of that node
    return t

cats = ["Outlook", "Temp", "Humidity", "Wind"]
trees = {day: id3(df.drop(day), cats) for day in df.index}    # 14 trees, each without one day
print("root question:", pd.Series({d: t[0] for d, t in trees.items()}).value_counts().to_dict())
grid = pd.DataFrame(list(itertools.product(*[sorted(df[c].unique()) for c in cats])), columns=cats)
P = np.array([[predict(t, r) for _, r in grid.iterrows()] for t in trees.values()])   # 14 trees x 36 days
agree = np.mean([np.mean(P[i] == P[j]) for i, j in itertools.combinations(range(14), 2)])
print(f"two of these trees agree on {agree:.0%} of the 36 possible days, on average")
day = {"Outlook": "Rain", "Temp": "Mild", "Humidity": "Normal", "Wind": "Strong"}
print("new day (Rain, Mild, Normal, Strong):", pd.Series([predict(t, day) for t in trees.values()]).value_counts().to_dict())</div>
  <div class="fx" data-lang="text">root question: {'Outlook': 11, 'Humidity': 3}
two of these trees agree on 94% of the 36 possible days, on average
new day (Rain, Mild, Normal, Strong): {'No': 13, 'Yes': 1}</div>
  <p>Eleven trees ask Outlook first and three ask Humidity first, so the trees really are different models. On the new rainy, normal-humidity, windy day, 13 trees say "No" but one says "Yes": that is the tree grown without D6, which was the only rainy, normal-humidity, windy day in the diary, so that tree never learnt the rule. One lost page changed the answer. A vote of all 14 trees still says "No", because the shaky tree is simply outvoted. The second line will matter later: two of these trees agree on 94% of all 36 possible days, because they share 13 of their 14 training days and are nearly copies of each other.</p>
  <p>The same thing happens on realistic data. The shared churn table (20,000 synthetic customers, 12 informative-or-useless columns plus two pure-noise columns, split 12,000 train / 3,000 validation / 5,000 test; label 1 means the customer left) is built by <code>common.py</code>, which every churn example on this page imports:</p>
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
  <p>Five analysts each take a different random 80% of the same training customers, grow a full tree, and then the five trees vote:</p>
  <div class="fx" data-lang="py">from common import *
rng = np.random.default_rng(1)
preds = []
for k in range(5):
    idx = rng.choice(len(Xtr), size=len(Xtr) * 8 // 10, replace=False)   # a different 80% of the rows
    t = DecisionTreeClassifier(random_state=0).fit(Xtr.iloc[idx], ytr[idx])
    p = t.predict(Xva); preds.append(p)
    print(f"tree {k+1}: first question '{Xtr.columns[t.tree_.feature[0]]} &lt;= {t.tree_.threshold[0]:.2f}'"
          f"  val {np.mean(p == yva):.3f}")
P = np.array(preds)                                        # 5 trees x 3000 validation rows
print(f"rows where the 5 trees do not all agree: {np.mean(P.min(0) != P.max(0)):.1%}")
vote = (P.mean(0) &gt; 0.5).astype(int)                       # majority vote of the 5 trees
print(f"majority vote of the 5 trees: val {np.mean(vote == yva):.3f}")</div>
  <div class="fx" data-lang="text">tree 1: first question 'f5 &lt;= 0.31'  val 0.779
tree 2: first question 'f5 &lt;= 0.31'  val 0.774
tree 3: first question 'f5 &lt;= 0.30'  val 0.776
tree 4: first question 'f5 &lt;= 0.05'  val 0.791
tree 5: first question 'f5 &lt;= -0.09'  val 0.779
rows where the 5 trees do not all agree: 50.0%
majority vote of the 5 trees: val 0.840</div>
  <p>All five trees ask about <code>f5</code> first, but at different cut-offs, and since a different first cut sends different customers to every question below, the trees grow apart from there. Each scores about 0.78 on validation. Yet on half the validation customers the five do not all agree, and when they simply vote, accuracy jumps to <strong>0.840</strong>, higher than every single member.</p>
  <p>Here is why. A model whose answers change a lot when its training data changes a little has <strong>high variance</strong>. That is bad for one model, but it has a bright side: its mistakes are partly random, and random mistakes made by different models land on different customers. When the models vote, each one's private mistakes are outvoted by the others, while the patterns they all learnt survive. Think of the "audience poll" in a quiz show. Any one audience member is often wrong, but wrong people scatter across different wrong options, while the people who know all pick the same right one, so the most popular answer is right far more often than a random audience member.</p>
  <p>Formally, an <strong>ensemble</strong> is a set of <strong>base models</strong> (also called members or base learners) h₁, ..., hₙ, plus a <strong>combination rule</strong> that turns their outputs into one prediction: a majority vote, an average of probabilities or numbers, a weighted sum, or a second model trained on their outputs. The rest of this page answers the questions this raises: by how much does a team gain, what does the gain depend on, and when is there no gain at all?</p>

  <h2 id="ens-vote"><span class="num">02</span>The Maths of Voting</h2>
  <p>Start with the simplest possible team: three classifiers voting on a yes/no question. Each is right on a given customer with probability p = 0.7, and for now their mistakes are <strong>independent</strong>, meaning that whether one is wrong tells you nothing about whether another is wrong. The team is right when at least 2 of the 3 are right. Because the voters are independent, the probability of any combination is the product of its parts: all three right is 0.7 × 0.7 × 0.7 = 0.343; exactly two right can happen in 3 ways (any one of the three is the wrong one), each with probability 0.7 × 0.7 × 0.3 = 0.147. The code lists all 2³ = 8 outcomes:</p>
  <div class="fx" data-lang="py">from itertools import product
p = 0.70                                    # each voter is right 70% of the time
total = 0.0
for votes in product([1, 0], repeat=3):     # 1 = this voter is right, 0 = wrong
    prob = 1.0
    for v in votes:
        prob *= p if v else (1 - p)         # independent: probabilities multiply
    ok = sum(votes) &gt;= 2                    # majority (2 of 3) right?
    total += prob if ok else 0
    print(votes, f"prob {prob:.3f}", "majority right" if ok else "majority WRONG")
print(f"P(majority right) = {total:.3f}")</div>
  <div class="fx" data-lang="text">(1, 1, 1) prob 0.343 majority right
(1, 1, 0) prob 0.147 majority right
(1, 0, 1) prob 0.147 majority right
(1, 0, 0) prob 0.063 majority WRONG
(0, 1, 1) prob 0.147 majority right
(0, 1, 0) prob 0.063 majority WRONG
(0, 0, 1) prob 0.063 majority WRONG
(0, 0, 0) prob 0.027 majority WRONG
P(majority right) = 0.784</div>
  <p>Adding the "right" rows gives 0.343 + 3 × 0.147 = <strong>0.784</strong>. Three 70% voters make a 78.4% team. In general, with n voters (n odd, so there are no ties) the number K of right voters follows a <strong>binomial distribution</strong>, P(K = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ, where C(n, k) counts the ways to choose which k voters are right, and the team is right when K is a majority:</p>
  <p style="text-align:center"><strong>P(majority right) = Σ over k ≥ (n+1)/2 of C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ</strong></p>
  <p>For n = 3 the k = 2 term is 3 × 0.49 × 0.3 = 0.441 and the k = 3 term is 0.343, giving 0.784 again. Here is the same sum for growing teams and three member strengths:</p>
  <div class="fx" data-lang="py">from math import comb
def majority_right(n, p):
    need = n // 2 + 1                       # votes needed for a strict majority (n odd)
    return sum(comb(n, k) * p**k * (1 - p)**(n - k) for k in range(need, n + 1))
print("  n   p=0.55  p=0.70  p=0.45")
for n in [1, 3, 5, 11, 25, 101, 1001]:
    print(f"{n:4d}  {majority_right(n, 0.55):.3f}   {majority_right(n, 0.70):.3f}   {majority_right(n, 0.45):.3f}")</div>
  <div class="fx" data-lang="text">  n   p=0.55  p=0.70  p=0.45
   1  0.550   0.700   0.450
   3  0.575   0.784   0.425
   5  0.593   0.837   0.407
  11  0.633   0.922   0.367
  25  0.694   0.983   0.306
 101  0.844   1.000   0.156
1001  0.999   1.000   0.001</div>
  <p>Each column teaches a lesson. With p = 0.70 the team is 98% right with 25 voters. With p = 0.55, barely better than a coin, the team still climbs, slowly: 0.69 at 25 voters, 0.84 at 101, 0.999 at 1001. With p = 0.45, slightly worse than a coin, adding voters makes the team worse and worse, down to 0.001: the majority reliably lands on the wrong answer. These three behaviours are <strong>Condorcet's jury theorem</strong> (1785): if n voters decide independently and each is right with the same probability p, then for p &gt; 0.5 the majority's accuracy rises towards 1 as n grows, for p &lt; 0.5 it falls towards 0, and for p = 0.5 it stays at 0.5. The reason is the law of large numbers: the share of right voters settles near p as n grows, and if p is 0.55 the share settles above the 50% line, with less and less room to wander below it by bad luck.</p>
  <p>The theorem's key assumption is independence, and models trained on the same data are never independent: they see the same rows and find the same strong column. Think of a panchayat of village elders. If each elder walks to the wells and judges for himself, a large panchayat's majority is almost never wrong; if they all repeat what the loudest elder said, the panchayat is exactly as good as that one elder. The simulation keeps every voter exactly 70% right on its own, but lets each voter copy a single "leader" opinion with some probability:</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
trials, n, p = 100_000, 25, 0.70
leader = rng.random((trials, 1)) &lt; p                    # one "loud" opinion, right 70% of the time
for copy in [0.0, 0.2, 0.5, 0.8]:
    own = rng.random((trials, n)) &lt; p                   # each voter's own opinion
    copies = rng.random((trials, n)) &lt; copy             # does this voter copy the leader?
    votes = np.where(copies, leader, own)               # True = voted for the right answer
    team = (votes.sum(axis=1) &gt; n // 2).mean()
    print(f"copy prob {copy:.1f}: each voter right {votes.mean():.3f}  majority of 25 right {team:.3f}")</div>
  <div class="fx" data-lang="text">copy prob 0.0: each voter right 0.700  majority of 25 right 0.982
copy prob 0.2: each voter right 0.700  majority of 25 right 0.916
copy prob 0.5: each voter right 0.700  majority of 25 right 0.719
copy prob 0.8: each voter right 0.700  majority of 25 right 0.701</div>
  <p>Every voter is still 70% right, yet the team of 25 falls from 0.98 to 0.72 when voters copy the leader half the time, and to 0.70, no gain at all, when they copy 80% of the time. The members' own accuracy did not change, only their independence did. That is the single most important lesson of ensembles. It is also why "Condorcet says 101 models give 100% accuracy" is wrong for real models: their errors are correlated, and some customers are hard for every model (p &lt; 0.5 on those rows), so the majority stays wrong on them however many members you add.</p>

  <h2 id="ens-avg"><span class="num">03</span>The Maths of Averaging</h2>
  <p>Voting combines yes/no answers. Many ensembles average numbers instead: a turnout, a price, or a probability. At a village fair there is a jar of laddoos and a prize for the closest guess. The true count is 500, and one person's guess is typically off by about 100 either way. Compare one guess, the average of 100 people who each guess on their own, and the average of 100 people who mostly copy one loud friend (80% of each copier's mistake is the friend's mistake):</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
true = 500
one = true + rng.normal(0, 100, 10_000)                          # one person's guess, 10k trials
avg = true + rng.normal(0, 100, (10_000, 100)).mean(1)            # mean of 100 independent guesses
friend = rng.normal(0, 100, (10_000, 1))                          # one shared mistake
copy = true + (0.8 * friend + 0.2 * rng.normal(0, 100, (10_000, 100))).mean(1)
for name, g in [("one guess", one), ("avg of 100 independent", avg), ("avg of 100 copiers", copy)]:
    print(f"{name:24s} typical error {np.abs(g - true).mean():5.1f}")</div>
  <div class="fx" data-lang="text">one guess                typical error  80.0
avg of 100 independent   typical error   8.0
avg of 100 copiers       typical error  64.5</div>
  <p>Averaging independent guessers cuts the typical error tenfold, from 80 to 8. Averaging copiers barely helps: 80 to 64.5. To see why exactly tenfold, and why copiers stay stuck, we derive the variance of an average. Let X₁, ..., Xₙ be the errors of n models on the same input. Assume each has the same <strong>variance</strong> σ² (its spread around its own average), and every pair has <strong>correlation</strong> ρ (rho, a number from −1 to 1 measuring how much two quantities move together), so the covariance of any pair is ρσ². The team's error is the average X̄ = (X₁ + ... + Xₙ)/n.</p>
  <p>First, a constant comes out of a variance squared: Var(X̄) = (1/n²) · Var(X₁ + ... + Xₙ). Second, the variance of a sum is the sum of all the variances plus the covariances of all pairs of different members. There are n variances, each σ², giving nσ², and n(n − 1) ordered pairs, each ρσ², giving n(n − 1)ρσ². So Var(X̄) = (1/n²)[nσ² + n(n − 1)ρσ²] = σ²/n + ρσ² − ρσ²/n, which rearranges to</p>
  <p style="text-align:center"><strong>Var(average of n models) = ρσ² + (1 − ρ)σ²/n</strong></p>
  <p>The first term does not depend on n at all: it is a <strong>floor</strong>. Only the second term shrinks as you add members. With σ² = 1, so that the answer is "the share of one model's variance that remains":</p>
  <table class="tbl">
    <tr><th>ρ (how alike)</th><th>n = 1</th><th>n = 5</th><th>n = 25</th><th>n → ∞ (floor)</th></tr>
    <tr><td>0 (independent)</td><td>1</td><td>1/5 = 0.200</td><td>1/25 = 0.040</td><td>0</td></tr>
    <tr><td>0.3</td><td>1</td><td>0.3 + 0.7/5 = 0.440</td><td>0.3 + 0.7/25 = 0.328</td><td>0.3</td></tr>
    <tr><td>0.7</td><td>1</td><td>0.7 + 0.3/5 = 0.760</td><td>0.7 + 0.3/25 = 0.712</td><td>0.7</td></tr>
    <tr><td>1 (identical)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
  </table>
  <p>Back to the jar, measuring in units of 100 laddoos so one guess has σ² = 1. (The "typical error" printed is the mean absolute error, which for a bell-shaped spread is about 0.8 times the standard deviation, the square root of the variance.) For 100 independent guessers ρ = 0, so the variance is 1/100, the standard deviation 0.1, and the typical error 0.8 × 10 = 8 laddoos: exactly the 80 → 8. Each copier's guess is 0.8 × (friend's mistake) + 0.2 × (own mistake), so its variance is 0.8² + 0.2² = 0.68, and any two copiers share the 0.64 part, so ρ = 0.64/0.68 ≈ 0.94. The formula gives 0.94 × 0.68 + 0.06 × 0.68/100 ≈ 0.640, a standard deviation of 0.80 (80 laddoos), and a typical error of about 0.8 × 80 = 64, matching the 64.5 the simulation printed. A direct simulation of the formula:</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
def var_of_mean(n, rho, trials=200_000):
    shared = rng.normal(size=(trials, 1))               # the part every model shares
    own = rng.normal(size=(trials, n))                  # each model's private part
    errs = np.sqrt(rho) * shared + np.sqrt(1 - rho) * own   # variance 1, pairwise correlation rho
    return errs.mean(axis=1).var()
print(" rho   n   simulated  formula rho+(1-rho)/n")
for rho in [0.0, 0.3, 0.7]:
    for n in [1, 5, 25]:
        print(f"{rho:4.1f} {n:3d}   {var_of_mean(n, rho):.3f}      {rho + (1 - rho) / n:.3f}")</div>
  <div class="fx" data-lang="text"> rho   n   simulated  formula rho+(1-rho)/n
 0.0   1   1.003      1.000
 0.0   5   0.200      0.200
 0.0  25   0.040      0.040
 0.3   1   0.999      1.000
 0.3   5   0.438      0.440
 0.3  25   0.328      0.328
 0.7   1   1.003      1.000
 0.7   5   0.761      0.760
 0.7  25   0.717      0.712</div>
  <p>Simulation and formula agree to the second decimal in every row. Look at ρ = 0.7: going from 5 members to 25 only moves 0.761 to 0.717. The formula has two levers. <strong>More members</strong> (n) only attack the second term, which is already small after a few dozen members. <strong>Less alike members</strong> (ρ) attack the floor. That is why "add more trees" stops helping after a few hundred trees, while "make the trees more different" keeps helping, and it is exactly what <a class="xref" data-note="ml_bagging">Bagging</a>, <a class="xref" data-note="ml_rf">Random Forest</a> and <a class="xref" data-note="ml_extratrees">Extra Trees</a> do, each a further step in lowering ρ even at the cost of making each tree a little worse. Our 14 leave-one-day-out diary trees agree on 94% of all possible days, so their ρ is close to 1 and averaging them would leave nearly all of one tree's variance in place; bagging makes bigger random changes (a bootstrap sample of the diary typically uses only about 9 of the 14 days), which is how it brings ρ down.</p>
  <p>One caution: the formula is about variance, the wobble of a prediction around its own average. It says nothing about <strong>bias</strong>, the gap between that average and the truth. If every guesser overestimates by 20 laddoos on average, the team overestimates by 20 too. The next section measures both.</p>

  <h2 id="ens-bv"><span class="num">04</span>Bias and Variance per Design</h2>
  <p>Recall from <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a> that the expected squared error of a model at a point splits into three parts: <strong>bias² + variance + noise</strong>. Bias is the gap between the model's average prediction (over many possible training sets) and the truth, a systematic miss; variance is how much its prediction spreads across training sets; noise is the randomness in the target itself, which no model can remove.</p>
  <p>Averaging does something simple to bias. If each member's average prediction at a point is truth + b, the team's average prediction is the average of those, (1/n) Σ (truth + b) = truth + b. <strong>Bias is unchanged</strong>, and only the variance falls, by the formula of section 03. So averaging, which is what <strong>bagging</strong> does, only pays off with members that have low bias and high variance: deep trees. <strong>Boosting</strong> is different. It does not average; it adds members one after another, F = h₁ + h₂ + ... + h_M, where each new member is fitted to what the current sum still gets wrong (the details are in <a class="xref" data-note="ml_boosting">How Boosting Works</a>). A sum of many simple steps can draw a shape that no single step can, so the bias falls. Boosting therefore pays off with members that have high bias and low variance: stumps and shallow trees.</p>
  <p>To measure this, the code draws 60 different training sets of 150 points from the same source (y = sin x plus noise), trains each model on each set, and then measures on a grid of x values how far the average prediction is from sin x (bias²) and how much the 60 predictions spread (variance):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor, GradientBoostingRegressor
rng = np.random.default_rng(0)
f = lambda x: np.sin(x)                                  # the true pattern
xg = np.linspace(0, 6, 300).reshape(-1, 1)               # where we measure bias and variance
models = {
    "one deep tree":         lambda: DecisionTreeRegressor(),
    "bagging 50 deep trees": lambda: BaggingRegressor(DecisionTreeRegressor(), n_estimators=50, random_state=0),
    "one stump (depth 1)":   lambda: DecisionTreeRegressor(max_depth=1),
    "bagging 50 stumps":     lambda: BaggingRegressor(DecisionTreeRegressor(max_depth=1), n_estimators=50, random_state=0),
    "boosting 200 stumps":   lambda: GradientBoostingRegressor(max_depth=1, n_estimators=200, learning_rate=0.1),
}
for name, make in models.items():
    preds = []
    for t in range(60):                                  # 60 different training sets from the same source
        x = rng.uniform(0, 6, 150).reshape(-1, 1)
        y = f(x).ravel() + rng.normal(0, 0.3, 150)
        preds.append(make().fit(x, y).predict(xg))
    P = np.array(preds)                                  # 60 x 300
    bias2 = np.mean((P.mean(0) - f(xg).ravel()) ** 2)    # average model vs truth
    var = np.mean(P.var(0))                              # spread across training sets
    print(f"{name:22s} bias^2 {bias2:.4f}  variance {var:.4f}  total {bias2 + var:.4f}")</div>
  <div class="fx" data-lang="text">one deep tree          bias^2 0.0014  variance 0.0897  total 0.0910
bagging 50 deep trees  bias^2 0.0010  variance 0.0432  total 0.0442
one stump (depth 1)    bias^2 0.0632  variance 0.0318  total 0.0950
bagging 50 stumps      bias^2 0.0630  variance 0.0125  total 0.0755
boosting 200 stumps    bias^2 0.0012  variance 0.0121  total 0.0133</div>
  <p>The five rows tell the whole bias-variance story of ensembles. One deep tree has tiny bias (0.0014) but large variance (0.0897), because it fits every noisy point. Bagging 50 deep trees keeps the low bias and halves the variance to 0.0432; it cannot go lower because bagged trees are correlated, the ρσ² floor. One stump has large bias (0.0632), because a single step cannot draw a sine wave. Bagging 50 stumps lowers their variance but leaves the bias exactly where it was (0.0630), so the total stays poor: averaging cannot fix a miss that every member shares. Boosting the very same stumps cuts the bias fiftyfold to 0.0012 and gives the lowest total error of all. The rule of thumb is to <strong>average strong-but-shaky models and add up weak-but-steady ones</strong>. Do not conclude that boosting cannot overfit, though: every round adds flexibility, and with enough rounds a booster starts fitting the noise, which is why boosters need a small learning rate and early stopping (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</p>

  <h2 id="ens-div"><span class="num">05</span>Diversity</h2>
  <p>Both formulas so far say the gain depends on how different the members are. For averaging under squared error there is an exact identity that makes this precise, the <strong>ambiguity decomposition</strong> (Krogh and Vedelsby, 1995). Let us work it on the diary's turnout column (how many members came to the ground). Take three one-question regression trees, each predicting the mean turnout of its leaf: a Humidity stump (humid days average 28), an Outlook stump (overcast days average 41) and a Wind stump (weak-wind days average 37). Ask all three about D3 (overcast, hot, humid, weak wind), when 36 members came. The team's guess is the average, (28 + 41 + 37)/3 = 35.33.</p>
  <table class="tbl">
    <tr><th>Member</th><th>Guess fᵢ</th><th>Own error (fᵢ − y)²</th><th>Disagreement with the team (fᵢ − f̄)²</th></tr>
    <tr><td>Humidity stump</td><td>28</td><td>64</td><td>53.78</td></tr>
    <tr><td>Outlook stump</td><td>41</td><td>25</td><td>32.11</td></tr>
    <tr><td>Wind stump</td><td>37</td><td>1</td><td>2.78</td></tr>
    <tr><td><b>Average</b></td><td>f̄ = 35.33</td><td><b>30</b></td><td><b>29.56</b> (the ambiguity)</td></tr>
  </table>
  <p>The team's own error is (35.33 − 36)² = 0.44, and 30 − 29.56 = 0.44 as well. This is not a coincidence:</p>
  <p style="text-align:center"><strong>(f̄ − y)² = average of (fᵢ − y)² − average of (fᵢ − f̄)²</strong></p>
  <p>In words, team error = average member error − average disagreement, where the disagreement is called the <strong>ambiguity</strong>. The proof is two lines: write fᵢ − y = (fᵢ − f̄) + (f̄ − y), square it and average over the members; the cross term contains the average of (fᵢ − f̄), which is zero because deviations from an average always cancel. The code checks it:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
day = "D3"                                            # Overcast, Hot, High humidity, Weak wind
y = df.Turnout[day]                                   # 36 members came
guess = {}
for col in ["Humidity", "Outlook", "Wind"]:           # three one-question regression trees (stumps)
    leaf_mean = df.groupby(col).Turnout.mean()        # each leaf predicts its mean turnout
    guess[col] = float(leaf_mean[df.loc[day, col]])
f = np.array(list(guess.values()))
fbar = f.mean()
print("member guesses:", guess, " truth", y)
print(f"team guess {fbar:.2f}, team error {(fbar - y) ** 2:.3f}")
own = ((f - y) ** 2).mean(); amb = ((f - fbar) ** 2).mean()
print(f"avg member error {own:.3f} - ambiguity {amb:.3f} = {own - amb:.3f}")</div>
  <div class="fx" data-lang="text">member guesses: {'Humidity': 28.0, 'Outlook': 41.0, 'Wind': 37.0}  truth 36
team guess 35.33, team error 0.444
avg member error 30.000 - ambiguity 29.556 = 0.444</div>
  <p>The three stumps are individually poor (the Humidity stump misses by 8 members), but they miss in different directions, one too low and two too high, so almost all of their average error (30) is disagreement (29.56), and disagreement is exactly what averaging removes. Had all three guessed 28, the ambiguity would be 0 and the team would miss by the full 64. Two consequences follow. Since ambiguity can never be negative, an averaged team is <strong>never worse than its average member</strong>. And there is a tug of war: you want members that are individually accurate (small first term) and that disagree a lot (large second term), but making members more random usually raises both. Every method in the bagging family is a different bet on that trade-off. Note what the identity does not promise: "never worse than the average member" is not "never worse than the best member", and section 08 shows a team falling below its best member.</p>
  <p>Where can differences between members come from, when there is only one training table? There are a handful of standard sources:</p>
  <table class="tbl">
    <tr><th>Source of diversity</th><th>How</th><th>Used by</th></tr>
    <tr><td>Different rows</td><td>bootstrap samples (with replacement) or subsamples</td><td><a class="xref" data-note="ml_bagging">Bagging</a>, Random Forest, stochastic gradient boosting</td></tr>
    <tr><td>Different columns</td><td>each member, or each split, sees a random subset of features</td><td><a class="xref" data-note="ml_rf">Random Forest</a>, XGBoost / LightGBM column sampling</td></tr>
    <tr><td>Random choices inside the algorithm</td><td>random thresholds, random starting weights, seeds</td><td><a class="xref" data-note="ml_extratrees">Extra Trees</a>, neural-network ensembles</td></tr>
    <tr><td>Different algorithms or settings</td><td>trees + kNN + linear models; different depths</td><td><a class="xref" data-note="ml_stacking">Voting and stacking</a></td></tr>
    <tr><td>Different emphasis on rows</td><td>each new member focuses on what the team gets wrong</td><td><a class="xref" data-note="ml_adaboost">AdaBoost</a> (weights), <a class="xref" data-note="ml_gbm">Gradient Boosting</a> (residuals)</td></tr>
  </table>
  <p>For classifiers, diversity can be measured in two practical ways: the <strong>disagreement rate</strong> (the share of rows where two members give different labels) and the <strong>error correlation</strong> (the correlation between "member i is wrong" and "member j is wrong" across rows; 1 means always wrong together). The code builds four teams of five and measures both:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
rng = np.random.default_rng(0)
def boot(m):                                             # fit m on a bootstrap sample of the rows
    i = rng.integers(0, len(Xtr), len(Xtr))
    return m.fit(Xtr.iloc[i], ytr[i])
teams = {
    "5 copies of one tree": [DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)] * 5,
    "5 trees, new seed each": [DecisionTreeClassifier(random_state=s).fit(Xtr, ytr) for s in range(5)],
    "5 trees, bootstrap rows": [boot(DecisionTreeClassifier(random_state=s)) for s in range(5)],
    "5 different algorithms": [DecisionTreeClassifier(random_state=0).fit(Xtr, ytr),
        make_pipeline(StandardScaler(), KNeighborsClassifier(15)).fit(Xtr, ytr),
        make_pipeline(StandardScaler(), LogisticRegression()).fit(Xtr, ytr),
        GaussianNB().fit(Xtr, ytr),
        HistGradientBoostingClassifier(random_state=0).fit(Xtr, ytr)],
}
for name, team in teams.items():
    P = np.array([m.predict(Xva) for m in team])         # 5 x 3000 predicted labels
    E = (P != yva).astype(float)                         # 1 where that member is wrong
    pairs = [(i, j) for i in range(5) for j in range(i)]
    dis = np.mean([np.mean(P[i] != P[j]) for i, j in pairs])
    rho = np.mean([np.corrcoef(E[i], E[j])[0, 1] if E[i].std() * E[j].std() &gt; 0 else 1.0 for i, j in pairs])
    each = 1 - E.mean(1)
    vote = np.mean((P.mean(0) &gt; 0.5) == yva)
    print(f"{name:24s} members {each.min():.3f}-{each.max():.3f}  disagree {dis:5.1%}  error corr {rho:.2f}  vote {vote:.3f}")</div>
  <div class="fx" data-lang="text">5 copies of one tree     members 0.773-0.773  disagree  0.0%  error corr 1.00  vote 0.773
5 trees, new seed each   members 0.770-0.777  disagree  6.0%  error corr 0.83  vote 0.778
5 trees, bootstrap rows  members 0.760-0.780  disagree 27.0%  error corr 0.24  vote 0.837
5 different algorithms   members 0.581-0.864  disagree 30.4%  error corr 0.28  vote 0.808</div>
  <p>Five copies of one tree disagree on 0% of rows, their errors are perfectly correlated, and their vote equals one tree (0.773): no diversity, no gain. Five trees with different seeds are near copies (a sklearn tree's seed only breaks ties between equally good splits): 6% disagreement, error correlation 0.83, vote 0.778. Five trees on bootstrap samples of the rows disagree on 27% of rows with an error correlation of only 0.24, and their vote jumps to 0.837: same algorithm, different data, real diversity. Five different algorithms disagree the most (30%), but their members range from 0.581 (naive Bayes) to 0.864 (gradient boosting), and their vote, 0.808, is <em>below</em> the best member. Good diversity means members that are roughly equally good and wrong on different rows; bootstrap trees are the textbook case. A team of different algorithms helps only when the members are of similar strength, or when the combination rule learns to trust the strong ones, which is what stacking adds.</p>

  <h2 id="ens-tax"><span class="num">06</span>The Four Designs</h2>
  <p>We now know what makes a team work: good members with different mistakes. Practitioners build such teams in four standard ways, which differ in where the diversity comes from and how the answers are combined.</p>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
<defs><marker id="ens-tx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="85" y="18" text-anchor="middle" font-weight="700" font-size="13">Bagging</text>
<text x="85" y="33" text-anchor="middle" class="tm" font-size="10">parallel · 1 algorithm</text>
<rect x="20" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="65" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="110" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/>
<text x="40" y="62" text-anchor="middle" font-size="10">h₁</text><text x="85" y="62" text-anchor="middle" font-size="10">h₂</text><text x="130" y="62" text-anchor="middle" font-size="10">h₃</text>
<line x1="40" y1="71" x2="80" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="85" y1="71" x2="85" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="130" y1="71" x2="90" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="45" y="120" width="80" height="28" rx="6" class="fg sg" fill-opacity="0.3"/><text x="85" y="138" text-anchor="middle" font-size="11">average / vote</text>
<text x="85" y="172" text-anchor="middle" class="tb" font-size="11">each on a bootstrap</text><text x="85" y="186" text-anchor="middle" class="tb" font-size="11">sample · cuts variance</text>
<text x="255" y="18" text-anchor="middle" font-weight="700" font-size="13">Boosting</text>
<text x="255" y="33" text-anchor="middle" class="tm" font-size="10">sequential · 1 algo</text>
<rect x="190" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="235" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="280" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/>
<text x="210" y="62" text-anchor="middle" font-size="10">h₁</text><text x="255" y="62" text-anchor="middle" font-size="10">h₂</text><text x="300" y="62" text-anchor="middle" font-size="10">h₃</text>
<line x1="230" y1="58" x2="234" y2="58" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="275" y1="58" x2="279" y2="58" stroke="currentColor" marker-end="url(#ens-tx)"/>
<line x1="255" y1="71" x2="255" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="205" y="120" width="100" height="28" rx="6" class="fg sg" fill-opacity="0.3"/><text x="255" y="138" text-anchor="middle" font-size="11">weighted sum</text>
<text x="255" y="172" text-anchor="middle" class="tb" font-size="11">each fixes the team's</text><text x="255" y="186" text-anchor="middle" class="tb" font-size="11">errors · cuts bias</text>
<text x="425" y="18" text-anchor="middle" font-weight="700" font-size="13">Voting</text>
<text x="425" y="33" text-anchor="middle" class="tm" font-size="10">parallel · mixed</text>
<rect x="360" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="405" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="450" y="45" width="40" height="26" rx="5" class="fv" stroke="currentColor"/>
<text x="380" y="62" text-anchor="middle" font-size="10">RF</text><text x="425" y="62" text-anchor="middle" font-size="10">GBM</text><text x="470" y="62" text-anchor="middle" font-size="10">kNN</text>
<line x1="380" y1="71" x2="420" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="425" y1="71" x2="425" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="470" y1="71" x2="430" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="375" y="120" width="100" height="28" rx="6" class="fg sg" fill-opacity="0.3"/><text x="425" y="138" text-anchor="middle" font-size="11">fixed rule</text>
<text x="425" y="172" text-anchor="middle" class="tb" font-size="11">hard / soft / weighted</text><text x="425" y="186" text-anchor="middle" class="tb" font-size="11">no learning in combiner</text>
<text x="595" y="18" text-anchor="middle" font-weight="700" font-size="13">Stacking</text>
<text x="595" y="33" text-anchor="middle" class="tm" font-size="10">parallel + meta</text>
<rect x="530" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="575" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="620" y="45" width="40" height="26" rx="5" class="fv" stroke="currentColor"/>
<text x="550" y="62" text-anchor="middle" font-size="10">RF</text><text x="595" y="62" text-anchor="middle" font-size="10">GBM</text><text x="640" y="62" text-anchor="middle" font-size="10">kNN</text>
<line x1="550" y1="71" x2="590" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="595" y1="71" x2="595" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="640" y1="71" x2="600" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="540" y="120" width="110" height="28" rx="6" class="fr sr" fill-opacity="0.3"/><text x="595" y="138" text-anchor="middle" font-size="11">meta-model</text>
<text x="595" y="172" text-anchor="middle" class="tb" font-size="11">learns whom to trust</text><text x="595" y="186" text-anchor="middle" class="tb" font-size="11">from out-of-fold preds</text>
<rect x="10" y="205" width="320" height="34" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="170" y="226" text-anchor="middle" class="tm" font-size="11.5">homogeneous: one algorithm, many copies</text>
<rect x="350" y="205" width="320" height="34" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="510" y="226" text-anchor="middle" class="tm" font-size="11.5">heterogeneous: different algorithms</text>
</svg><figcaption>The four standard designs. Left half: one algorithm copied many times (homogeneous). Right half: different algorithms combined (heterogeneous). Arrows between members = sequential (boosting only).</figcaption></figure>
  <p><strong>Bagging</strong> (short for bootstrap aggregating) trains many copies of one algorithm, each on its own bootstrap sample of the rows, in parallel, and averages them; it attacks variance, and its children are the Random Forest and Extra Trees (<a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>). <strong>Boosting</strong> trains many copies of a weak algorithm in sequence; each new member is trained on what the team so far gets wrong, and the output is a weighted sum; it attacks bias, and its children are AdaBoost, gradient boosting, XGBoost, LightGBM and CatBoost (<a class="xref" data-note="ml_boosting">How Boosting Works</a>). <strong>Voting</strong> combines already-trained, usually different models with a fixed rule, such as a majority or an average, with nothing learnt except perhaps hand-picked weights. <strong>Stacking</strong> trains a second-level <strong>meta-model</strong> on the members' predictions so that it learns whom to trust, using out-of-fold predictions to avoid leakage (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>). Think of a sports panel: bagging is several judges who each watched a different recording and average their scores; boosting is a relay of coaches, each working only on what the team still does badly; voting is a show of hands among different experts; stacking is a head judge who has learnt from past matches which expert to trust for what.</p>
  <p>Two pairs of words describe these designs. A <strong>homogeneous</strong> ensemble uses one algorithm many times, with diversity from the data or from randomness (bagging, random forests, boosting); a <strong>heterogeneous</strong> ensemble uses different algorithms (voting, stacking). A <strong>parallel</strong> design trains members independently, so it spreads easily over CPU cores; a <strong>sequential</strong> design needs member m − 1 before it can train member m.</p>
  <p>When classifiers vote there are two ways to do it, and they can disagree. <strong>Hard voting</strong> counts the predicted labels. <strong>Soft voting</strong> averages the predicted probabilities and then picks the most probable class. Ask three stumps from the diary (on Outlook, Humidity and Wind; each leaf's probability of "Yes" is the share of played days in it) about D1, a sunny, hot, humid day with weak wind:</p>
  <div class="fx" data-lang="py">from play import df
day = df.loc["D1"]                                     # Sunny, Hot, High humidity, Weak wind
p = {}
for col in ["Outlook", "Humidity", "Wind"]:            # three stumps; a leaf's P(Yes) = share of Yes in it
    p[col] = round(float((df[df[col] == day[col]].Play == "Yes").mean()), 3)
labels = {c: "Yes" if v &gt; 0.5 else "No" for c, v in p.items()}
print("P(Yes):", p, " labels:", labels)
hard = max(["Yes", "No"], key=list(labels.values()).count)
soft = sum(p.values()) / 3
print("hard vote:", hard, f"| soft vote: average P(Yes) = {soft:.3f} -&gt;", "Yes" if soft &gt; 0.5 else "No",
      "| truth:", day.Play)</div>
  <div class="fx" data-lang="text">P(Yes): {'Outlook': 0.4, 'Humidity': 0.429, 'Wind': 0.75}  labels: {'Outlook': 'No', 'Humidity': 'No', 'Wind': 'Yes'}
hard vote: No | soft vote: average P(Yes) = 0.526 -&gt; Yes | truth: No</div>
  <p>Sunny days were played 2 times out of 5 (0.40, so "No"), humid days 3 out of 7 (0.43, "No"), weak-wind days 6 out of 8 (0.75, "Yes"). Hard voting: two "No" against one "Yes", so No. Soft voting: (0.40 + 0.43 + 0.75)/3 = 0.526, above 0.5, so Yes. They disagree because hard voting throws away confidence: the two "No" voters were barely sure, the "Yes" voter was fairly sure. Here the truth is No, so the hard vote happened to be right; soft voting trusts confidence, which helps only when the confidence is earned (the Wind stump's 0.75 ignores that D1 was sunny and humid). With well-calibrated members, soft voting usually wins; with members whose probabilities are poor, calibrate them first or vote hard.</p>
  <table class="tbl">
    <tr><th></th><th>Bagging (RF, Extra Trees)</th><th>Boosting (AdaBoost ... CatBoost)</th><th>Voting</th><th>Stacking</th></tr>
    <tr><td>Members</td><td>one algorithm, deep trees</td><td>one algorithm, shallow trees</td><td>different, already strong</td><td>different, already strong</td></tr>
    <tr><td>Training</td><td>parallel, independent</td><td>sequential</td><td>parallel</td><td>parallel + k-fold + meta-model</td></tr>
    <tr><td>Diversity from</td><td>bootstrap rows, random features or thresholds</td><td>reweighting or residuals</td><td>different algorithms</td><td>different algorithms</td></tr>
    <tr><td>Combination</td><td>plain average or majority</td><td>weighted sum</td><td>fixed rule</td><td>learnt meta-model</td></tr>
    <tr><td>Mainly reduces</td><td>variance</td><td>bias</td><td>variance of the blend</td><td>a little of both</td></tr>
    <tr><td>More members overfit?</td><td>no, the curve flattens</td><td>yes, needs early stopping</td><td>no</td><td>meta-model can, if fed leaked predictions</td></tr>
    <tr><td>Noisy labels</td><td>robust</td><td>sensitive, chases hard rows</td><td>depends on members</td><td>depends on members</td></tr>
  </table>

  <h2 id="ens-run"><span class="num">07</span>Every Design on Real Data</h2>
  <p>The diary is ideal for following the mechanics by hand, but with 14 days one prediction moves accuracy by 7 points, so it cannot tell us which design is more accurate. On the churn table we fit one single tree, two bagging-family teams, one boosting team, and two blends of three different algorithms (a random forest, a histogram gradient booster and a k-nearest-neighbours model), all on the same rows and scored on the same test set. Fit times are approximate; they come from a shared machine and change from run to run.</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.ensemble import BaggingClassifier, HistGradientBoostingClassifier, VotingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
knn = make_pipeline(StandardScaler(), KNeighborsClassifier(15))
rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)
hgb = HistGradientBoostingClassifier(random_state=0)
models = {
    "single deep tree      (none)":       DecisionTreeClassifier(random_state=0),
    "bagging 100 trees     (parallel)":   BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0),
    "random forest 300     (parallel)":   rf,
    "hist grad. boosting   (sequential)": hgb,
    "soft vote rf+hgb+knn  (voting)":     VotingClassifier([("rf", rf), ("hgb", hgb), ("knn", knn)], voting="soft"),
    "stack rf+hgb+knn -&gt; LR (meta)":      StackingClassifier([("rf", rf), ("hgb", hgb), ("knn", knn)],
                                                             final_estimator=LogisticRegression(), cv=5),
}
for name, m in models.items():
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    print(f"{name:36s} test acc {m.score(Xte, yte):.3f}   fit {sec:5.1f}s")</div>
  <div class="fx" data-lang="text">single deep tree      (none)         test acc 0.778   fit   0.7s
bagging 100 trees     (parallel)     test acc 0.870   fit  46.4s
random forest 300     (parallel)     test acc 0.877   fit  22.6s
hist grad. boosting   (sequential)   test acc 0.862   fit   0.7s
soft vote rf+hgb+knn  (voting)       test acc 0.866   fit  22.8s
stack rf+hgb+knn -&gt; LR (meta)        test acc 0.877   fit 117.1s</div>
  <p>Every ensemble beats the single tree (0.778) by 8 to 10 points, which is the variance reduction we predicted. The two bagging-family teams lead (0.870 and 0.877), and the default booster is close behind (0.862; tuned boosters with early stopping reach the same level, as <a class="xref" data-note="ml_trees">Tree Models: Overview &amp; How to Choose</a> shows). The two blends of different algorithms show the subtle part. The soft vote (0.866) is <em>worse</em> than the forest alone, because the weaker kNN member drags the plain average down, just as section 05 warned. The stack, whose logistic-regression meta-model learns to lean on the forest, matches the forest but does not beat it. Look also at the fit times: the stack retrains every member 5 + 1 times for its out-of-fold predictions, several times the cost of the forest, for no gain here. Always choose among such options on validation data or cross-validation, then report the test score once (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</p>

  <h2 id="ens-fail"><span class="num">08</span>When Ensembles Do Not Help</h2>
  <p>The formulas also predict cases where a team gains nothing, or loses. A careful engineer should recognise them before spending the compute. The code below tries three of them on the churn data: bagging a stable model, bagging a high-bias model, and averaging a strong model with two weak ones.</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.ensemble import BaggingClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
lr = make_pipeline(StandardScaler(), LogisticRegression())
for name, m in [("logistic regression", lr), ("stump (depth 1)", DecisionTreeClassifier(max_depth=1))]:
    one = m.fit(Xtr, ytr).score(Xte, yte)                # 1) bagging a stable / high-bias model
    bag = BaggingClassifier(m, n_estimators=50, n_jobs=-1, random_state=0).fit(Xtr, ytr).score(Xte, yte)
    print(f"{name:20s} alone {one:.3f}   bagged x50 {bag:.3f}")
hgb = HistGradientBoostingClassifier(random_state=0)
alone = hgb.fit(Xtr, ytr).score(Xte, yte)                # 2) one strong member + two weak ones
team = VotingClassifier([("hgb", hgb), ("nb", GaussianNB()), ("lr", lr)], voting="soft").fit(Xtr, ytr)
print(f"boosting alone {alone:.3f}   soft vote boosting+NB+LR {team.score(Xte, yte):.3f}")
for n, m in team.named_estimators_.items():
    print(f"   member {n:4s} test acc {m.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">logistic regression  alone 0.596   bagged x50 0.594
stump (depth 1)      alone 0.609   bagged x50 0.609
boosting alone 0.862   soft vote boosting+NB+LR 0.824
   member hgb  test acc 0.862
   member nb   test acc 0.596
   member lr   test acc 0.596</div>
  <p>Bagging logistic regression moves 0.596 to 0.594: no gain. Logistic regression is a <strong>stable</strong> model, meaning each bootstrap sample gives nearly the same coefficients, so the members are near copies (ρ close to 1) and σ² was small to begin with; its error is mostly bias, a straight boundary on bent data, which averaging cannot touch. Bagging stumps moves 0.609 to 0.609 for the same reason as section 04: every stump makes essentially the same cut, and a shared miss survives averaging. Most strikingly, adding naive Bayes and logistic regression (0.596 each) to a good booster (0.862) in a plain soft vote drops accuracy to 0.824. The ambiguity identity only promised "no worse than the average member", and the weak members push their confident wrong probabilities into the average.</p>
  <p>The same reasoning covers the other failure cases. Highly correlated members leave the floor ρσ² in charge, so more members add nothing; inject randomness or mix algorithms instead. Members worse than chance on some region of the data make the majority more confidently wrong there (Condorcet with p &lt; 0.5); check accuracy per segment and fix the data for that region. A shared blind spot, such as a missing feature, label noise or a shift in the data after deployment, is pure bias that every member shares, and no combination rule can invent information that is not in the data. Very small datasets give tiny, heavily overlapping bootstrap samples and too few rows for a stacking meta-model. And an ensemble cannot rescue a broken pipeline: if a feature leaks the answer or will not exist at prediction time, every member learns the same broken signal and the team is confidently wrong.</p>

  <h2 id="ens-cost"><span class="num">09</span>The Costs</h2>
  <p>Even when a team helps, it is never free. An ensemble of n models costs roughly n times as much to train, store and run, and it can no longer be read like one tree. The code measures what an online service would care about: the time to score one customer at a time, and the size of the saved model (times are approximate and vary by machine):</p>
  <div class="fx" data-lang="py">from common import *
import pickle
from sklearn.ensemble import HistGradientBoostingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
rf = RandomForestClassifier(n_estimators=300, random_state=0, n_jobs=-1)
hgb = HistGradientBoostingClassifier(random_state=0)
knn = make_pipeline(StandardScaler(), KNeighborsClassifier(15))
models = {"single tree": DecisionTreeClassifier(max_depth=8, random_state=0),
          "random forest 300": rf, "hist grad. boosting": hgb,
          "stack rf+hgb+knn": StackingClassifier([("rf", rf), ("hgb", hgb), ("knn", knn)],
                                                 final_estimator=LogisticRegression(), cv=5)}
one = Xte.iloc[[0]]
for name, m in models.items():
    m.fit(Xtr, ytr)
    for e in [m, *getattr(m, "estimators_", [])]:        # predict on one thread, like a small API server
        if hasattr(e, "n_jobs"): e.n_jobs = 1
    t = []
    for _ in range(30):                                  # one customer at a time, like an online API
        t0 = time.perf_counter(); m.predict_proba(one); t.append(time.perf_counter() - t0)
    print(f"{name:20s} 1-row latency {np.median(t)*1000:6.1f} ms   saved size {len(pickle.dumps(m)) / 1e6:6.2f} MB")</div>
  <div class="fx" data-lang="text">single tree          1-row latency    0.7 ms   saved size   0.03 MB
random forest 300    1-row latency   28.4 ms   saved size  69.08 MB
hist grad. boosting  1-row latency    1.1 ms   saved size   0.39 MB
stack rf+hgb+knn     1-row latency   31.1 ms   saved size 140.61 MB</div>
  <p>One depth-8 tree answers in about a millisecond and saves to 0.03 MB. The 300-tree forest takes tens of milliseconds per single-customer request (scikit-learn walks 300 trees one after another) and needs about 69 MB, because each fully grown tree stores thousands of nodes. The histogram booster is the efficient ensemble: about a millisecond and 0.4 MB, since its trees are small. The stack carries a forest, a booster, a kNN model that stores all 12,000 training rows, and a meta-model: about 140 MB and a latency dominated by its forest, all for no accuracy gain over the forest on this data. Parallel designs can spread training over CPU cores (<code>n_jobs=-1</code>); boosting rounds cannot run in parallel, although each round is fast. Interpretability is lost too: one tree is a rule list you can read; 300 trees need tools such as SHAP (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>). And every extra model must be retrained, versioned and monitored (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>).</p>
  <p>Ways to pay less: use fewer members, since the gain flattens after a few hundred trees; cap the depth or raise the minimum leaf size; prefer histogram-based boosters, which are fast and small; drop members that add nothing on validation; or <strong>distil</strong> the ensemble by training one small model to copy its predictions. A gain of a few tenths of a percent that triples latency, or needs five models retrained every week, is often a bad trade, so write down the latency and size budget before you start blending.</p>

  <h2 id="ens-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common mistake is building a team without any source of diversity, for example many copies of one model trained on the same rows with the same settings. Here 50 trees that all see every row are compared with 50 trees on bootstrap samples:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.ensemble import BaggingClassifier
tree = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)
same = BaggingClassifier(DecisionTreeClassifier(random_state=0), n_estimators=50, bootstrap=False,
                         n_jobs=-1, random_state=0).fit(Xtr, ytr)      # every member sees all rows
boot = BaggingClassifier(DecisionTreeClassifier(random_state=0), n_estimators=50,
                         n_jobs=-1, random_state=0).fit(Xtr, ytr)      # bootstrap rows (the default)
print(f"one tree {tree.score(Xva, yva):.3f}   50 trees on the same rows {same.score(Xva, yva):.3f}"
      f"   50 trees on bootstrap rows {boot.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">one tree 0.773   50 trees on the same rows 0.780   50 trees on bootstrap rows 0.877</div>
  <p>Fifty trees trained on the same rows score almost exactly like one tree, because a scikit-learn tree's random seed only breaks ties, so the members are near copies. Give each tree its own bootstrap sample and the same 50 trees reach the level of a real ensemble. Diversity must come from somewhere: rows, columns, randomness or algorithms.</p>
  <p>The second mistake is averaging in a much weaker model because "more diversity is good". Section 08 showed the loss; the fix is to weight members by their validation performance, or drop the weak ones:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.ensemble import HistGradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
members = [("hgb", HistGradientBoostingClassifier(random_state=0)), ("nb", GaussianNB()),
           ("lr", make_pipeline(StandardScaler(), LogisticRegression()))]
for w in [None, [4, 1, 1], [1, 0, 0]]:
    v = VotingClassifier(members, voting="soft", weights=w).fit(Xtr, ytr)
    print(f"weights {str(w):10s} validation acc {v.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">weights None       validation acc 0.815
weights [4, 1, 1]  validation acc 0.857
weights [1, 0, 0]  validation acc 0.864</div>
  <p>The equal-weight vote loses to the booster alone; giving the booster four times the weight recovers most of the gap, and keeping only the booster (weights 1, 0, 0) is best here. A stacking meta-model learns such weights automatically from out-of-fold predictions.</p>
  <p>Three more mistakes need no code. Bagging the wrong learner, such as logistic regression or stumps, and expecting a jump: bagging fixes variance, and those models have little; bag deep trees and boost shallow ones. Quoting Condorcet literally: its assumptions of independent errors and p &gt; 0.5 on every row never hold, so gains flatten early. And picking the ensemble on the test set: trying ten blends and reporting the best test score leaks the test set into the choice; choose on validation or cross-validation and touch the test set once, then weigh the gain against latency and size before shipping.</p>

  <h2 id="ens-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Ensemble</b>: base models h₁ ... hₙ + a combination rule (vote, average, weighted sum, meta-model).</li>
    <li><b>Variance</b>: how much predictions change with the training sample. <b>Bias</b>: systematic gap between the average prediction and the truth.</li>
    <li><b>Diversity</b>: members making different mistakes; measured by disagreement rate or error correlation.</li>
    <li><b>Ambiguity</b>: average squared disagreement of members with the team's average.</li>
    <li><b>Homogeneous</b>: one algorithm many times. <b>Heterogeneous</b>: different algorithms.</li>
    <li><b>Hard voting</b>: count labels. <b>Soft voting</b>: average probabilities.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Majority of n independent voters</td><td>Σ over k ≥ (n+1)/2 of C(n,k) pᵏ (1 − p)ⁿ⁻ᵏ</td><td>n = 3, p = 0.7: p³ + 3p²(1 − p) = 0.784</td></tr>
    <tr><td>Condorcet</td><td>p &gt; 0.5 ⇒ → 1 as n → ∞; p &lt; 0.5 ⇒ → 0</td><td>needs independence</td></tr>
    <tr><td>Variance of an average</td><td>ρσ² + (1 − ρ)σ²/n</td><td>ρ = 0.3, n = 25: 0.328; floor 0.3</td></tr>
    <tr><td>Bias of an average</td><td>= average member bias</td><td>averaging never changes bias</td></tr>
    <tr><td>Ambiguity decomposition</td><td>(f̄ − y)² = mean (fᵢ − y)² − mean (fᵢ − f̄)²</td><td>D3: 0.44 = 30 − 29.56</td></tr>
    <tr><td>Soft vote</td><td>argmax over classes of Σ wₘ Pₘ(c | x) / Σ wₘ</td><td>D1: (0.40 + 0.43 + 0.75)/3 = 0.526</td></tr>
  </table>
  <h3>Which design for which members</h3>
  <table class="tbl">
    <tr><th>Design</th><th>Members</th><th>Removes</th><th>Watch out for</th></tr>
    <tr><td>Bagging / RF / Extra Trees</td><td>deep, low-bias, shaky trees</td><td>variance</td><td>correlated trees (floor ρσ²)</td></tr>
    <tr><td>Boosting</td><td>stumps, shallow trees</td><td>bias</td><td>overfitting: learning rate, early stopping</td></tr>
    <tr><td>Voting</td><td>different, similar-strength models</td><td>variance of the blend</td><td>weak members dragging the average</td></tr>
    <tr><td>Stacking</td><td>different, strong models</td><td>a little of both</td><td>leakage: use out-of-fold predictions</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import (BaggingClassifier, RandomForestClassifier,
                              HistGradientBoostingClassifier, VotingClassifier, StackingClassifier)
from sklearn.linear_model import LogisticRegression
bag  = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1)
rf   = RandomForestClassifier(n_estimators=300, n_jobs=-1)
hgb  = HistGradientBoostingClassifier()
vote = VotingClassifier([("rf", rf), ("hgb", hgb)], voting="soft", weights=[1, 1])
stack = StackingClassifier([("rf", rf), ("hgb", hgb)], final_estimator=LogisticRegression(), cv=5)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Copies vote like one model: diversity is the whole point.</li>
    <li>Bag deep trees, boost shallow ones; bagging stable or high-bias models gains nothing.</li>
    <li>More members cannot go below the floor ρσ²; lower ρ instead.</li>
    <li>"Never worse than the average member" is not "never worse than the best".</li>
    <li>Soft voting needs reasonable probabilities; otherwise calibrate or vote hard.</li>
    <li>Choose the blend on validation, not test; budget latency and size.</li>
  </ul>

  <h2 id="ens-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an ensemble, and when is it better than its members?</summary><div class="qa-body">An ensemble is a set of base models plus a rule that combines their outputs into one prediction. It beats its members when each member is reasonably accurate (better than chance) and the members make different, weakly correlated mistakes, so that the mistakes cancel in the vote or average while the shared signal survives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Three independent classifiers are each 70% accurate. What is the accuracy of their majority vote?</summary><div class="qa-body">The vote is right when at least two are right. P(all three) = 0.7³ = 0.343, P(exactly two) = 3 × 0.7² × 0.3 = 0.441, so the total is 0.784. In general P(majority right) = Σ over k ≥ (n+1)/2 of C(n,k) pᵏ(1−p)ⁿ⁻ᵏ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State Condorcet's jury theorem and its limits for machine learning.</summary><div class="qa-body">If n voters decide independently and each is right with the same probability p &gt; 0.5, the majority's accuracy rises towards 1 as n grows; with p &lt; 0.5 it falls towards 0. Machine-learning models are trained on the same data, so their errors are correlated, and on hard rows every model has p &lt; 0.5. Ensembles therefore gain, but the gain flattens early instead of reaching 100%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the variance of the average of n models with variance σ² and pairwise correlation ρ.</summary><div class="qa-body">Var(X̄) = (1/n²) Var(ΣXᵢ) = (1/n²)[nσ² + n(n−1)ρσ²] = ρσ² + (1−ρ)σ²/n. More members only shrink the second term; the first term, ρσ², is a floor that falls only if the members become less correlated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With ρ = 0.3 and σ² = 1, what is the variance of the average of 5 models? Of infinitely many?</summary><div class="qa-body">0.3 + 0.7/5 = 0.44 for five models, and 0.3 (the floor) for infinitely many. Going from 5 to infinitely many members removes only 0.14 more, while lowering ρ from 0.3 to 0.1 would lower the floor itself, which is why random forests decorrelate their trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does averaging reduce bias? What does it reduce?</summary><div class="qa-body">No. If each member's average prediction is truth + b, the average of the members is also truth + b, so the bias is unchanged. Averaging reduces variance, by the ρσ² + (1−ρ)σ²/n formula. That is why bagging uses low-bias, high-variance members (deep trees).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging vs boosting: what is the difference?</summary><div class="qa-body">Bagging trains members independently and in parallel on bootstrap samples and averages them; it reduces variance and suits deep trees, and adding members never overfits. Boosting trains members sequentially, each on what the team so far gets wrong, and adds them up; it reduces bias and suits shallow trees, but too many rounds overfit, so it needs a learning rate and early stopping. Bagging is robust to noisy labels; boosting can chase them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging use deep trees while boosting uses shallow ones?</summary><div class="qa-body">Averaging keeps bias and cuts variance, so its members must already have low bias: deep trees. Boosting removes bias step by step, so each member can be a high-bias, low-variance stump; deep members would make each step overfit. In our sine experiment, bagged stumps kept bias² at 0.063 while boosted stumps reached 0.0012.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the ambiguity decomposition and what does it imply?</summary><div class="qa-body">For an averaged regressor under squared error, (f̄ − y)² = mean (fᵢ − y)² − mean (fᵢ − f̄)²: team error equals the average member error minus the average disagreement. So the team is never worse than its average member, and the gain grows with disagreement; but making members more random usually also makes them individually worse, an accuracy-diversity trade-off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the main sources of diversity in ensembles, with a method that uses each.</summary><div class="qa-body">Different rows (bootstrap samples in bagging), different columns (random features per split in Random Forest), random choices inside the algorithm (random thresholds in Extra Trees), different algorithms or settings (voting and stacking), and different emphasis on rows (reweighting in AdaBoost, residuals in gradient boosting).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hard vs soft voting: when do they disagree, and which is better?</summary><div class="qa-body">They disagree when a confident minority faces an unsure majority: probabilities 0.40, 0.43 and 0.75 give a hard vote of No but a soft average of 0.526, Yes. Soft voting uses confidence and is usually better when the members' probabilities are well calibrated; hard voting is safer when they are not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stacking, and why must it use out-of-fold predictions?</summary><div class="qa-body">Stacking trains a meta-model on the base models' predictions so it learns how much to trust each. If the meta-model saw predictions made on the base models' own training rows, those predictions would look far better than they are on new data (an overfit model is nearly perfect on its training rows), and the meta-model would trust the wrong member. Out-of-fold predictions, made by models that did not see those rows, are honest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You bag logistic regression 50 times and see no improvement. Why?</summary><div class="qa-body">Logistic regression is a stable, low-variance model: each bootstrap sample gives almost the same coefficients, so the members are near copies (ρ near 1) and there is little variance to remove. Its error is mostly bias, a straight boundary on bent data, which averaging cannot fix. Improve the features or use a more flexible model instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adding two weaker models to a gradient-boosting model in a soft vote lowered accuracy. Explain and fix it.</summary><div class="qa-body">An averaged team is only guaranteed to beat its average member, not its best one, and the weak members' confident wrong probabilities pull the average away from the booster's good ones (0.862 → 0.824 in our run). Fix it by dropping the weak members, weighting members by validation performance, or stacking so a meta-model learns to down-weight them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do Random Forest and Extra Trees relate to the formula ρσ² + (1 − ρ)σ²/n?</summary><div class="qa-body">Bagged trees stay correlated because the strongest feature dominates every tree, so the floor ρσ² stays high. Random Forest lowers ρ by letting each split consider only a random subset of features; Extra Trees lowers it further with random thresholds. Each tree becomes a little worse, but the team improves because the floor falls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does boosting need early stopping but bagging does not?</summary><div class="qa-body">Adding bagged members only shrinks the (1−ρ)σ²/n term, so the error curve flattens and never turns upward. Each boosting round fits what is left of the training error; once the real signal is used up, that is noise, so validation error starts rising. Early stopping halts at the best validation round.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use an ensemble?</summary><div class="qa-body">When the members would be stable or high-bias (bagging gains nothing), when one model is far stronger than any partner, when the data is tiny, when the model's rules must be read directly, or when a tight latency or memory budget rules out hundreds of trees. If the problem is a shared blind spot such as a missing feature or leakage, no ensemble helps; fix the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the costs of an ensemble, and how can you reduce them?</summary><div class="qa-body">About n times the training time (times k folds for stacking), n times the prediction latency, larger model files, lost readability and more models to maintain. Reduce them with fewer members, shallower trees or bigger leaves, histogram-based boosters, parallel training, dropping members that add nothing, or distilling the ensemble into one small model.</div></details>
</main>
`
});
