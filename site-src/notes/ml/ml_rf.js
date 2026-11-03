// notes/ml/ml_rf.js — Random Forest
Object.assign(TOPIC_CONTENT, {
  "ml_rf": `<main>
  <h1>Random Forest</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Bagging</span><span>Random Forest</span></div>
  <p class="lead">A <strong>random forest</strong> is a crowd of decision trees that vote. It is <a class="xref" data-note="ml_bagging">bagging</a> with one extra rule: whenever a tree is about to ask a question, it may only choose among a small random handful of the columns. That one rule makes the trees disagree more, and a vote among trees that disagree is worth more than a vote among near-copies. Random forests are one of the most widely used models for tabular data, because they are accurate with almost no tuning, hard to break, and give a free validation score and importance scores on the side. This page builds the forest from the problem it solves, works the key ideas by hand on the cricket captain's 14-day diary used throughout the tree notes, and then measures everything on the shared 20,000-customer churn table.</p>

  <h2 id="rf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Random Forest</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why it exists</div>
        <ul>
          <li>Bagged trees ask the same first question → alike</li>
          <li>Var = ρσ² + (1 − ρ)σ²/B: more trees cannot pass ρσ²</li>
          <li>Fix: make trees less alike (lower ρ)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How it works</div>
        <ul>
          <li>Bootstrap rows for each tree</li>
          <li>At <b>every split</b>: best split among m random columns</li>
          <li>m = <code>max_features</code>: √p for classes</li>
          <li>Deep trees, soft vote (average probabilities)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Free extras</div>
        <ul>
          <li><b>OOB score</b>: validation without a hold-out</li>
          <li><b>MDI importance</b>: biased to many-valued columns</li>
          <li><b>Permutation importance</b>: shuffle a column, measure the drop</li>
          <li><b>Proximity</b>: share of trees where two rows share a leaf</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits</div>
        <ul>
          <li>Cannot extrapolate beyond training targets</li>
          <li>Reduces variance, not bias</li>
          <li>Big models, slower prediction</li>
          <li>Usually beaten by tuned boosting</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rf-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Bagged Trees Look Alike</span><span class="rm-sub">the problem the forest solves</span></div></div>
      <div class="rm-item rm-done" data-target="rf-split"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Random Columns at Every Split</span><span class="rm-sub">the one new idea, worked by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rf-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Random Forest Algorithm</span><span class="rm-sub">training, soft vote, why it works</span></div></div>
      <div class="rm-item rm-done" data-target="rf-oob"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Out-of-Bag Score</span><span class="rm-sub">a free validation score</span></div></div>
      <div class="rm-item rm-done" data-target="rf-hp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Hyperparameters</span><span class="rm-sub">what each knob does and the tuning order</span></div></div>
      <div class="rm-item rm-done" data-target="rf-imp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feature Importance: MDI and Permutation</span><span class="rm-sub">which columns matter, and a famous trap</span></div></div>
      <div class="rm-item rm-done" data-target="rf-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Regression and the Extrapolation Limit</span><span class="rm-sub">predicting numbers, and where it fails</span></div></div>
      <div class="rm-item rm-done" data-target="rf-imb"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Imbalanced Classes</span><span class="rm-sub">class weights vs moving the threshold</span></div></div>
      <div class="rm-item rm-done" data-target="rf-prox"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Proximity and Outliers</span><span class="rm-sub">which rows the forest treats as alike</span></div></div>
      <div class="rm-item rm-done" data-target="rf-cost"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Memory and Speed</span><span class="rm-sub">what a forest costs in production</span></div></div>
      <div class="rm-item rm-done" data-target="rf-scratch"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">A Random Forest From Scratch</span><span class="rm-sub">30 lines on top of sklearn's tree</span></div></div>
      <div class="rm-item rm-done" data-target="rf-cmp"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Tree vs Bagging vs Forest</span><span class="rm-sub">measured side by side; when to use a forest</span></div></div>
      <div class="rm-item rm-done" data-target="rf-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">train accuracy, MDI, regressor defaults</span></div></div>
      <div class="rm-item rm-done" data-target="rf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, parameters</span></div></div>
      <div class="rm-item rm-done" data-target="rf-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions asked about random forests</span></div></div>
    </div>
  </div>

  <h2 id="rf-problem"><span class="num">01</span>Why Bagged Trees Look Alike</h2>
  <p>A single deep decision tree has <strong>high variance</strong>: it memorises its training rows, so a few changed rows give a quite different tree. <a class="xref" data-note="ml_bagging">Bagging</a> fixes part of this. It draws many <strong>bootstrap samples</strong> (n rows picked at random with replacement, so some rows appear twice and about 37% not at all), grows a deep tree on each, and averages them. The random wobbles of different trees cancel in the average. On the churn data that lifted one tree's accuracy from about 0.77 to about 0.88.</p>
  <p>But bagging stops improving after a hundred or so trees, and the reason is that cancelling only works when the trees wobble <em>differently</em>. Bootstrap samples overlap heavily, and, worse, if one column is much stronger than the others, nearly every tree asks about that column first, so the top of every tree is the same. Trees that share their structure share their mistakes, and averaging cannot cancel a mistake that every tree makes.</p>
  <p>The diary shows it. Its four weather columns (Outlook, Temp, Humidity, Wind) predict whether a match was played, and at the root Outlook is by far the best question: information gain 0.247, against 0.152 for Humidity, 0.048 for Wind and 0.029 for Temp (see <a class="xref" data-note="ml_dtree">Decision Trees</a>). The diary is kept in <code>play.py</code>:</p>
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
  <p>The code below draws 1,000 bootstrap samples of the 14 days and, for each, records the root question a tree would choose. It records two versions side by side: the bagged tree, which may choose among all four columns, and a forest tree, which, as we will see in the next section, may choose only between two randomly drawn columns.</p>
  <div class="fx" data-lang="py">import numpy as np
from collections import Counter
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, a):                                             # information gain of splitting d on column a
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(a))
cats = ["Outlook", "Temp", "Humidity", "Wind"]
rng = np.random.default_rng(0)
bag_roots, forest_roots = Counter(), Counter()
for _ in range(1000):
    d = df.iloc[rng.integers(0, 14, 14)]                  # a bootstrap sample of the diary
    g = {a: IG(d, a) for a in cats}
    bag_roots[max(g, key=g.get)] += 1                     # bagging: best of all 4 columns
    two = [str(c) for c in rng.choice(cats, size=2, replace=False)]
    forest_roots[max(two, key=lambda a: g[a])] += 1       # forest: best of 2 random columns
print("bagging root questions:", dict(bag_roots.most_common()))
print("forest  root questions:", dict(forest_roots.most_common()))</div>
  <div class="fx" data-lang="text">bagging root questions: {'Outlook': 562, 'Humidity': 248, 'Wind': 96, 'Temp': 94}
forest  root questions: {'Outlook': 375, 'Humidity': 280, 'Temp': 200, 'Wind': 145}</div>
  <p>Look at the first line for now. In bagging, Outlook is the root of 562 of the 1,000 trees: more than half of the trees begin with the same question and therefore share much of their structure. The churn data shows the same thing even more strongly. All churn code on this page uses one shared table: 20,000 made-up customers with 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixtures of those, 4 are useless) plus two pure-noise columns, split into 12,000 training, 3,000 validation and 5,000 test rows. It is saved as <code>churn.py</code>, and every churn block below starts from it:</p>
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
  <p>A fitted sklearn tree stores the column used by its root split in <code>tree_.feature[0]</code>. Counting these over 100 bagged trees and 100 forest trees:</p>
  <div class="fx" data-lang="py">from collections import Counter
from sklearn.ensemble import BaggingClassifier
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0).fit(Xtr, ytr)
rf  = RandomForestClassifier(n_estimators=100, max_features="sqrt", n_jobs=-1, random_state=0).fit(Xtr, ytr)
def roots(trees):                                        # which column each tree asks about first
    return Counter(Xtr.columns[t.tree_.feature[0]] for t in trees).most_common(4)
print("bagging root questions:", roots(bag.estimators_))
print("forest  root questions:", roots(rf.estimators_))</div>
  <div class="fx" data-lang="text">bagging root questions: [('f5', 100)]
forest  root questions: [('f8', 25), ('f5', 22), ('f9', 14), ('f3', 10)]</div>
  <p>All 100 bagged trees start with column <code>f5</code>. The bootstrap changed the rows, but not nearly enough to dethrone the strongest column, so the first and most influential question is identical everywhere.</p>
  <p>Why exactly does that hurt? Treat each tree's prediction for one customer as a random number, random because its bootstrap sample was random. Say each tree has variance σ², and any two trees have correlation ρ (0 means unrelated, 1 means identical). The variance of the average of B trees is the sum of all variances and covariances divided by B². There are B variances, each σ², and B(B − 1) ordered pairs of trees, each with covariance ρσ²:</p>
  <div class="fx" data-lang="text">Var(average of B trees) = [ B·σ² + B(B−1)·ρσ² ] / B²
                        = ρσ²  +  (1 − ρ)·σ²/B
                          ↑           ↑
                  never goes away   shrinks as B grows</div>
  <p>The second term shrinks as trees are added; the first, ρσ², does not care how many trees there are. This is the <strong>correlation floor</strong>. With σ² = 1 and B = 200, trees correlated at ρ = 0.47 (what we will measure for bagged churn trees) give a variance of 0.47 + 0.53/200 = 0.473, and a million trees would still give 0.470. Trees correlated at ρ = 0.17 give 0.174. Already at 200 trees we are sitting on the floor, so the only way down is to make ρ smaller. That is the random forest's whole idea. Think of a panel of judges at a cooking contest: if all of them read the same food blog beforehand, their average opinion is barely wiser than one judge's. Make each judge taste a different random set of dishes first, and their opinions become more independent, so their average becomes wiser, even though each judge individually knows a little less.</p>

  <h2 id="rf-split"><span class="num">02</span>Random Columns at Every Split</h2>
  <p>Changing the rows was not enough to make the trees differ, so the forest changes something else: which columns a split may use. When a forest tree is about to split a node, it first draws a random handful of the columns, m of the p available, and then finds the best question <em>using only those m</em>, exactly as a normal tree would (try every cut-off on each of them, keep the largest impurity drop). At the next node it draws a fresh random m. The number m is set by the parameter <code>max_features</code>. The strong column is still used, just not everywhere, and the weaker columns finally get a chance to show what they know.</p>
  <p>Work it by hand on the diary's root with m = 2 of the 4 columns. There are 4 × 3 / 2 = 6 equally likely pairs, and for each pair the winner is whichever of the two has the bigger information gain:</p>
  <table class="tbl">
    <tr><th>Columns drawn</th><th>Outlook, Temp</th><th>Outlook, Humidity</th><th>Outlook, Wind</th><th>Temp, Humidity</th><th>Temp, Wind</th><th>Humidity, Wind</th></tr>
    <tr><td>Root question</td><td>Outlook</td><td>Outlook</td><td>Outlook</td><td>Humidity</td><td>Wind</td><td>Humidity</td></tr>
  </table>
  <p>So on the full diary this root splits on Outlook half the time (3 of 6 pairs), on Humidity a third of the time and on Wind a sixth, and never on Temp, which loses every pair. Outlook wins exactly when it is drawn, and it is drawn with probability m/p = 2/4. Now go back to the output of the code in section 01, whose second line did exactly this on 1,000 bootstrap samples: Outlook is the forest's root in only 375 trees, fewer than half, because in some bootstrap samples Outlook is no longer the best column even when it is drawn, and Temp, which never wins on the full diary, now starts 200 trees. The trees genuinely differ from the first question on. On the churn data m = 3 of p = 14 columns, so <code>f5</code> is on offer at the root with probability 3/14 = 21.4%, and the forest in section 01 had it at the root of 22 of 100 trees, with <code>f8</code>, <code>f9</code> and <code>f3</code> starting most of the others. The formula and the experiment agree.</p>
  <p>Why draw the columns at every split rather than once per tree? An older method, <strong>random subspaces</strong>, gives each tree one random set of columns for its whole life. If a tree's set lacks every strong column, the entire tree is weak. Drawing per split is gentler: a node that misses <code>f5</code> uses something else, but its children draw again and may still use <code>f5</code> further down. Every tree can still use every column somewhere; it just cannot use the same one everywhere.</p>
  <p>How large should m be? There is a trade-off. Smaller m makes the trees less alike, which is good, but each tree is also worse, because many of its splits are forced onto weak columns. Breiman called the accuracy of individual trees their <strong>strength</strong>. The code measures both sides for several values of m: the accuracy of an average single tree, and ρ, the average correlation between two trees' predicted churn probabilities across the validation customers.</p>
  <div class="fx" data-lang="py">for mf in [1, 2, 3, 5, 8, 14]:
    rf = RandomForestClassifier(n_estimators=200, max_features=mf, oob_score=True,
                                n_jobs=-1, random_state=0).fit(Xtr, ytr)
    P = np.array([t.predict_proba(Xva.values)[:, 1] for t in rf.estimators_[:60]])  # 60 trees x rows
    rho = np.corrcoef(P)[np.triu_indices(60, 1)].mean()  # average correlation between two trees
    one = np.mean([np.mean((P[i] &gt; 0.5) == yva) for i in range(60)])
    print(f"max_features={mf:2d}  one tree {one:.3f}  rho {rho:.2f}  forest {rf.score(Xva, yva):.3f}  OOB {rf.oob_score_:.3f}")</div>
  <div class="fx" data-lang="text">max_features= 1  one tree 0.649  rho 0.17  forest 0.844  OOB 0.824
max_features= 2  one tree 0.710  rho 0.30  forest 0.876  OOB 0.853
max_features= 3  one tree 0.739  rho 0.37  forest 0.881  OOB 0.864
max_features= 5  one tree 0.757  rho 0.42  forest 0.879  OOB 0.868
max_features= 8  one tree 0.765  rho 0.45  forest 0.884  OOB 0.868
max_features=14  one tree 0.769  rho 0.47  forest 0.885  OOB 0.866</div>
  <p>Read down the columns. As m grows from 1 to 14, single trees get stronger (0.649 → 0.769) and more alike (ρ 0.17 → 0.47). The forest's accuracy is the result of this tug of war. With m = 1 the column at each split is pure chance, the trees are so weak that low correlation cannot save them, and the forest scores only 0.844. From m = 2 upward everything lands between 0.876 and 0.885, and on this data the largest m is even slightly the best, because the six useful columns are all decent, so forcing weak splits costs about as much as the extra diversity gains. On data with one overwhelming column, or with hundreds of columns, smaller m usually wins clearly. The common defaults are m = √p for classification (sklearn's <code>"sqrt"</code>, here ⌊√14⌋ = 3) and, following Breiman, p/3 for regression. <code>max_features</code> is the knob to tune first; √p is a good starting point, not a law.</p>

  <h2 id="rf-algo"><span class="num">03</span>The Random Forest Algorithm</h2>
  <p>With that one new ingredient, the whole recipe (Breiman, 2001) is short. Choose the number of trees B and the number of columns per split m. Then, for each tree independently, so that all trees can be trained at once on different CPU cores:</p>
  <div class="fx" data-lang="text">for b = 1 … B:
    draw a bootstrap sample S_b (n rows, with replacement)
    grow a tree on S_b; at EVERY node:
        draw m of the p columns at random (without replacement)
        for each drawn column, try every cut-off; keep the best (column, cut-off)
        split, and repeat in both children
    stop a node only when it is pure or too small: trees are grown deep, never pruned
predict: send the row down every tree and average the trees' answers</div>
  <p>The trees are grown deep on purpose. A deep tree has low bias and high variance, and averaging is good at removing variance but cannot remove bias, so we want the trees to be as flexible as possible and let the crowd deal with their nervousness.</p>
  <p>Prediction needs a little care for classification. Each tree sends the new row to a leaf, and the leaf stores the class shares of the training rows that ended there (for example 9 churn and 1 stay gives P(churn) = 0.9). A <strong>hard vote</strong> lets each tree name its top class and counts the votes; Breiman's original paper does this. A <strong>soft vote</strong> averages the trees' probabilities and picks the class with the highest average; sklearn does this. They can disagree. Here is a tiny forest of 5 shallow trees (depth 2, so leaves are mixed and give real probabilities) on the one-hot diary, asked about D10 (Rain, Mild, Normal humidity, Weak wind), a day on which a match was played:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)   # 10 one-hot columns
rf = RandomForestClassifier(n_estimators=5, max_depth=2, max_features=2, random_state=9).fit(X, df.Play)
p = np.array([t.predict_proba(X.loc[["D10"]].values)[0, 1] for t in rf.estimators_])   # P(Yes) per tree
print("D10, P(Yes) from each tree:", p.round(2).tolist())
print("hard vote:", "Yes" if (p &gt; 0.5).sum() &gt;= 3 else "No", f"({(p &gt; 0.5).sum()} of 5 trees say Yes)")
print(f"soft vote: mean P(Yes) = {p.mean():.3f} -&gt;", "Yes" if p.mean() &gt; 0.5 else "No")
print("sklearn predicts:", rf.predict(X.loc[["D10"]])[0], "| truth:", df.Play["D10"])</div>
  <div class="fx" data-lang="text">D10, P(Yes) from each tree: [1.0, 0.62, 0.33, 0.43, 0.4]
hard vote: No (2 of 5 trees say Yes)
soft vote: mean P(Yes) = 0.557 -&gt; Yes
sklearn predicts: Yes | truth: Yes</div>
  <p>Two trees say Yes and three say No, so the hard vote is No. But the three No trees are only mildly against (0.33, 0.43, 0.40), while one Yes tree is certain (1.00) and one fairly sure (0.62). The average is 2.79/5 = 0.557, so the soft vote says Yes, which is correct. Think of five doctors: counting hands throws away how sure each one is, averaging their percentages keeps it. The soft vote also produces a graded score for every row, which is what ranking metrics such as ROC-AUC need. For fully grown trees most leaves are pure, so each tree's probability is 0 or 1 and the two rules usually agree; the difference grows when leaves hold several rows. For regression each leaf stores the average target of its training rows, and the forest returns the plain average of the trees' leaf values.</p>
  <p>Breiman also proved why the recipe works. Define the <strong>margin</strong> of a row as the share of trees voting for its true class minus the largest share voting for any other class, and the forest's <strong>strength</strong> s as the average margin. With ρ̄ the average correlation between trees, the forest's error rate is at most</p>
  <div class="fx" data-lang="text">error  ≤  ρ̄ · (1 − s²) / s²

s = 0.6, ρ̄ = 0.2   →  0.2 × (1 − 0.36) / 0.36 = 0.2 × 1.78 = 0.36
s = 0.6, ρ̄ = 0.1   →  0.1 × 1.78               = 0.18   (halve the correlation, halve the bound)
s = 0.4, ρ̄ = 0.1   →  0.1 × (1 − 0.16) / 0.16  = 0.53   (weaker trees hurt a lot)</div>
  <p>The bound is loose (real errors are much lower), but its message is exactly the trade-off measured above: lower correlation helps, weaker trees hurt, and m trades one against the other. Breiman also showed that as B grows, the forest's error settles to a limit, so adding trees never makes a random forest overfit; after a point it simply stops helping. The forest can still overfit through very deep trees on very noisy data, but the number of trees is not the knob that causes it.</p>

  <h2 id="rf-oob"><span class="num">04</span>Out-of-Bag Score</h2>
  <p>To tune m and the other knobs we need a score on rows the forest did not train on. Because every tree is grown on a bootstrap sample, the forest inherits bagging's free test (see <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a> for the worked example). Each tree never saw about 36.8% of the rows. For each training row, let only the trees that never saw it vote; those votes are an honest prediction for that row. Scoring all such predictions against the true labels gives the <strong>out-of-bag (OOB) score</strong>, an estimate of the validation score that costs no data at all. In sklearn, set <code>oob_score=True</code> and read <code>oob_score_</code>. With <code>warm_start=True</code>, raising <code>n_estimators</code> and fitting again only adds new trees, so one forest can be scored at several sizes cheaply:</p>
  <div class="fx" data-lang="py">rf = RandomForestClassifier(n_estimators=1, warm_start=True, oob_score=True, n_jobs=-1, random_state=0)
for n in [5, 25, 100, 200, 400]:
    rf.set_params(n_estimators=n).fit(Xtr, ytr)          # warm_start: only the new trees are grown
    print(f"trees={n:3d}  OOB {rf.oob_score_:.3f}  validation {rf.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">trees=  5  OOB 0.728  validation 0.825
trees= 25  OOB 0.831  validation 0.868
trees=100  OOB 0.858  validation 0.880
trees=200  OOB 0.864  validation 0.881
trees=400  OOB 0.864  validation 0.879</div>
  <p>With 5 trees each row is out-of-bag for only about 5 × 0.368 ≈ 2 trees, so its OOB vote comes from a "forest" of one or two trees, and the OOB score (0.728) is far below the real 5-tree forest's validation score (0.825). By 200 trees each row gets about 74 OOB votes, and the gap is small (0.864 vs 0.881). Both curves flatten at about 200 trees, which tells us 200 trees are enough here. Use OOB for quick checks and for choosing the number of trees, and confirm final choices with cross-validation or a held-out set. And remember that it is only honest if nothing learnt from the OOB rows beforehand: a scaler, imputer, target encoder or feature selector fitted on all the training rows has already seen them.</p>

  <h2 id="rf-hp"><span class="num">05</span>Hyperparameters</h2>
  <p>A random forest has few knobs that matter, and it is famous for working well with its defaults. Still, interviews ask about them, and size and speed often need tuning in production. Here they are, with sklearn's names:</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>What it does</th><th>Raising it</th></tr>
    <tr><td><code>n_estimators</code></td><td>100</td><td>number of trees B</td><td>lower variance down to the floor; never overfits; costs time and memory</td></tr>
    <tr><td><code>max_features</code></td><td>"sqrt" (classifier), 1.0 (regressor)</td><td>columns drawn per split, m</td><td>stronger but more alike trees; <b>the most important knob</b></td></tr>
    <tr><td><code>max_depth</code></td><td>None</td><td>maximum depth of each tree</td><td>less bias, more variance, more memory</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>1</td><td>fewest rows allowed in a leaf</td><td>smoother, smaller trees, more bias</td></tr>
    <tr><td><code>max_samples</code></td><td>None (= n)</td><td>rows per bootstrap sample</td><td>smaller: faster, more diverse, weaker trees</td></tr>
    <tr><td><code>bootstrap</code></td><td>True</td><td>bootstrap rows per tree</td><td>False: every tree sees all rows; no OOB</td></tr>
    <tr><td><code>class_weight</code></td><td>None</td><td>weight per class</td><td>pushes splits toward a rare class (section 08)</td></tr>
    <tr><td><code>criterion</code></td><td>"gini" / "squared_error"</td><td>impurity used for splits</td><td>"entropy" rarely changes results</td></tr>
    <tr><td><code>oob_score</code>, <code>n_jobs</code>, <code>random_state</code>, <code>warm_start</code></td><td>False, 1 core, None, False</td><td>OOB score; cores; seed; keep old trees</td><td><code>n_jobs=-1</code> uses all cores; always set a seed</td></tr>
  </table>
  <p>The code tries the size knobs on the churn data, with 200 trees each, and reports the average number of leaves per tree, training and validation accuracy, and training time:</p>
  <div class="fx" data-lang="py">def run(**kw):
    rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0, **kw)
    t0 = time.time(); rf.fit(Xtr, ytr); sec = time.time() - t0
    leaves = np.mean([t.get_n_leaves() for t in rf.estimators_])
    print(f"{str(kw):27s} leaves/tree {leaves:5.0f}  train {rf.score(Xtr, ytr):.3f}  validation {rf.score(Xva, yva):.3f}  {sec:4.1f}s")
for kw in [{}, {"max_depth": 4}, {"max_depth": 16}, {"min_samples_leaf": 5},
           {"min_samples_leaf": 20}, {"max_samples": 0.2}, {"bootstrap": False}]:
    run(**kw)</div>
  <div class="fx" data-lang="text">{}                          leaves/tree  1438  train 1.000  validation 0.881  15.0s
{'max_depth': 4}            leaves/tree    16  train 0.761  validation 0.759   4.7s
{'max_depth': 16}           leaves/tree  1031  train 0.989  validation 0.874  16.0s
{'min_samples_leaf': 5}     leaves/tree   780  train 0.963  validation 0.873  14.2s
{'min_samples_leaf': 20}    leaves/tree   276  train 0.897  validation 0.858  12.2s
{'max_samples': 0.2}        leaves/tree   448  train 0.929  validation 0.862   5.8s
{'bootstrap': False}        leaves/tree  2047  train 1.000  validation 0.879  29.2s</div>
  <p>Three lessons. First, <strong>deep trees are the right default</strong>: every limit lowered accuracy, and depth-4 trees (16 leaves each) give 0.759, barely better than a single tree, because averaging cannot remove the bias of shallow trees. Second, <strong>limits buy size</strong>: <code>min_samples_leaf=5</code> keeps 0.873 with about half the leaves (780 instead of 1,438), which can be a good trade in production (section 10). Third, <strong>max_samples is a speed knob</strong>: growing each tree on 20% of the rows is more than twice as fast and costs about two points (0.862 vs 0.881). The last line turns the bootstrap off: every tree sees the same rows and differs only through its column draws, and accuracy barely moves (0.879 vs 0.881), because with 3 of 14 columns per split the column randomness alone already makes the trees diverse. (That is exactly the bet <a class="xref" data-note="ml_extratrees">Extra Trees</a> makes.) The training accuracy column shows why a forest's training score is useless: fully grown trees memorise their samples, so it is 1.000. Times are wall-clock on a shared 4-core machine; compare them with each other only.</p>
  <p>A tuning order that works in practice: first set <code>n_estimators</code> high enough that the OOB score has flattened (200–500 is typical), and then leave it alone, since more trees never hurt accuracy. Next tune <code>max_features</code> (try √p, p/3, p/2, p and a couple of small numbers), judged by OOB or cross-validation. Only then, if the model is too big or slow, raise <code>min_samples_leaf</code> or cap <code>max_depth</code>, and for very large data lower <code>max_samples</code>. Search strategies are covered in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>

  <h2 id="rf-imp"><span class="num">06</span>Feature Importance: MDI and Permutation</h2>
  <p>A forest of 200 trees cannot be read like one tree, yet the business still asks which columns drive churn. The forest offers two answers, and they mean different things.</p>
  <p>The built-in one is <strong>mean decrease in impurity (MDI)</strong>, sklearn's <code>feature_importances_</code>. Every split lowers the impurity (Gini) of the rows passing through it. MDI credits that drop to the column used, weighted by the share of rows that reached the node, sums the credits per column over all nodes, averages over all trees, and rescales the totals to sum to 1. For one split at node t, with N_t of the N training rows:</p>
  <div class="fx" data-lang="text">credit = (N_t / N) × [ Gini(t) − (N_left/N_t)·Gini(left) − (N_right/N_t)·Gini(right) ]</div>
  <p>Work it on a depth-2 tree grown on the one-hot diary:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)
t = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, df.Play)     # Gini, 2 levels
print(export_text(t, feature_names=list(X.columns), show_weights=True))
print("Gini per node:", t.tree_.impurity.round(3), " rows per node:", t.tree_.n_node_samples)
print("MDI:", {c: round(float(v), 3) for c, v in zip(X.columns, t.feature_importances_) if v &gt; 0})</div>
  <div class="fx" data-lang="text">|--- Outlook_Overcast &lt;= 0.50
|   |--- Humidity_Normal &lt;= 0.50
|   |   |--- weights: [4.00, 1.00] class: No
|   |--- Humidity_Normal &gt;  0.50
|   |   |--- weights: [1.00, 4.00] class: Yes
|--- Outlook_Overcast &gt;  0.50
|   |--- weights: [0.00, 4.00] class: Yes

Gini per node: [0.459 0.5   0.32  0.32  0.   ]  rows per node: [14 10  5  5  4]
MDI: {'Outlook_Overcast': 0.442, 'Humidity_Normal': 0.558}</div>
  <p>The root (all 14 days, Gini 0.459) splits on Outlook_Overcast. The 4 overcast days form a pure leaf (Gini 0) and the other 10 have Gini 0.5, so the weighted Gini after the split is 4/14 × 0 + 10/14 × 0.5 = 0.357, and the credit is 14/14 × (0.459 − 0.357) = 0.102. The 10-day node then splits on Humidity_Normal into two 5-day leaves with Gini 0.32 each, so its credit is 10/14 × (0.5 − 0.32) = 0.129. The total is 0.231, and normalising gives 0.102/0.231 = 0.442 for Outlook_Overcast and 0.129/0.231 = 0.558 for Humidity_Normal, exactly what sklearn printed. A forest does this per tree and averages.</p>
  <p>MDI has a famous bias. On the churn data, compare it with the second method (explained next) for a few columns, including the two pure-noise columns: <code>row_noise</code>, a random number with 20,000 different values, and <code>coin_noise</code>, a random 0 or 1.</p>
  <div class="fx" data-lang="py">from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr, ytr)
perm = permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=-1)
imp = pd.DataFrame({"MDI": rf.feature_importances_, "permutation": perm.importances_mean}, index=Xtr.columns)
print(imp.loc[["f5", "f8", "f9", "f10", "f0", "row_noise", "coin_noise"]].round(3))</div>
  <div class="fx" data-lang="text">              MDI  permutation
f5          0.139        0.193
f8          0.113        0.106
f9          0.099        0.072
f10         0.037        0.001
f0          0.035        0.001
row_noise   0.036        0.004
coin_noise  0.005        0.001</div>
  <p>The strong columns agree in both methods. But <code>row_noise</code>, which is pure randomness, gets an MDI score of 0.036, as large as genuinely weak but real columns like <code>f10</code> (0.037) and <code>f0</code> (0.035), and seven times that of <code>coin_noise</code> (0.005), which is equally random. The reason is how deep trees grow. Deep down, nodes hold a handful of rows, and a column with thousands of distinct values offers many cut-offs, one of which will separate those few rows by pure luck. Each lucky split lowers the <em>training</em> impurity, and MDI counts it. A 0/1 column offers one cut-off, so it rarely gets lucky. MDI therefore favours columns with many distinct values (IDs, timestamps, continuous noise), and since it is computed on training data it rewards memorisation.</p>
  <p><strong>Permutation importance</strong> asks a more direct question: how much worse does the model do if a column is scrambled? Score the fitted model on some data, shuffle one column (which breaks its link with the target but keeps its values), score again, and call the drop the column's importance; repeat with several shuffles and average. Measured on validation rows, as in the churn run above, it puts both noise columns near zero (0.004 and 0.001), where they belong. Here it is by hand on the finished diary tree of the Decision Trees note (Overcast → Yes; Sunny → ask Humidity; Rain → ask Wind), which is right on all 14 days:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def tree(o, h, w):                                         # the diary tree of the Decision Trees note
    if o == "Overcast": return "Yes"
    if o == "Sunny":    return "No" if h == "High" else "Yes"
    return "No" if w == "Strong" else "Yes"
def acc(d):
    return np.mean([tree(o, h, w) == p for o, h, w, p in zip(d.Outlook, d.Humidity, d.Wind, d.Play)])
print("accuracy before shuffling:", acc(df))
rng = np.random.default_rng(3)
d = df.copy(); d["Humidity"] = rng.permutation(df.Humidity.values)   # one shuffle of Humidity
print("accuracy after one shuffle of Humidity:", round(acc(d), 3))
for col in ["Outlook", "Humidity", "Wind", "Temp"]:          # importance = average drop over 1,000 shuffles
    drops = []
    for _ in range(1000):
        d = df.copy(); d[col] = rng.permutation(df[col].values)
        drops.append(acc(df) - acc(d))
    print(f"{col:8s} permutation importance {np.mean(drops):.3f}")</div>
  <div class="fx" data-lang="text">accuracy before shuffling: 1.0
accuracy after one shuffle of Humidity: 0.643
Outlook  permutation importance 0.340
Humidity permutation importance 0.178
Wind     permutation importance 0.174
Temp     permutation importance 0.000</div>
  <p>One shuffle of the Humidity column changed the humidity of the sunny days, and accuracy fell from 14/14 to 9/14 = 0.643: those are exactly the days on which the tree reads Humidity. Averaged over 1,000 shuffles, Outlook matters most (0.34, since every day passes through it), Humidity and Wind about half as much (0.18 and 0.17; each is used on only 5 days), and Temp exactly 0, because the tree never reads Temp, so shuffling it changes no prediction. The two methods answer different questions: MDI asks "how much impurity did splits on this column remove during training?", permutation asks "how much does the model need this column?". Permutation has its own weakness: when two columns are strongly correlated, shuffling one barely hurts because its twin covers for it, so both can look unimportant. Other methods, such as SHAP values, are covered in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>

  <h2 id="rf-reg"><span class="num">07</span>Regression and the Extrapolation Limit</h2>
  <p>A forest predicts numbers in the same way. Each regression tree chooses splits that reduce the squared error, and each leaf predicts the <strong>average</strong> target of its training rows; the forest averages the trees. For example, three trees predicting the diary's turnout at 85% humidity might hold leaves whose training turnouts average 38.86, 28.29 and 24.00, and the forest predicts (38.86 + 28.29 + 24.00)/3 = 30.38 members. The spread of the trees' answers (24 to 38.9 here) is a rough sign of uncertainty. Note one default: sklearn's <code>RandomForestRegressor</code> uses <code>max_features=1.0</code>, all columns, which makes it plain bagging; Breiman suggested p/3, and it is worth tuning.</p>
  <p>This construction has a structural limit. Every leaf value is an average of training targets, and every prediction is an average of leaf values, so a forest can never predict above the largest training target or below the smallest. Beyond the training data it simply repeats its edge leaves. On the diary, where turnout falls as humidity rises:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from play import df
X, y = df[["HumPct"]], df.Turnout                           # humidity 65-96% in the diary
rf = RandomForestRegressor(n_estimators=200, random_state=0).fit(X, y)
lin = LinearRegression().fit(X, y)
new = pd.DataFrame({"HumPct": [50, 65, 96, 110]})          # 50 and 110 are outside the diary
print("humidity:      ", new.HumPct.tolist())
print("forest turnout:", rf.predict(new).round(1).tolist())
print("line turnout:  ", lin.predict(new).round(1).tolist())</div>
  <div class="fx" data-lang="text">humidity:       [50, 65, 96, 110]
forest turnout: [38.6, 38.6, 29.2, 29.2]
line turnout:   [48.1, 41.4, 27.6, 21.3]</div>
  <p>The diary's humidity runs from 65% to 96%. The forest predicts 38.6 for both 50% and 65%, and 29.2 for both 96% and 110%, while a straight line keeps going (48.1 at 50%, 21.3 at 110%). With 14 days we cannot know which is right, but only one of the two models is even able to change its answer outside the data. The effect is clearest when the truth really is a straight line, such as flat prices of 0.8 lakh per square metre:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
size = rng.uniform(30, 150, 300)                       # flat size in square metres
price = 0.8 * size + rng.normal(0, 6, 300)             # price in lakh rupees: a straight line + noise
X = size.reshape(-1, 1)
rf = RandomForestRegressor(n_estimators=300, random_state=0).fit(X, price)
lr = LinearRegression().fit(X, price)
new = np.array([[60], [140], [200], [300]])            # 200 and 300 are outside the training range
print("size  true  forest  linear")
for s, f, l in zip(new.ravel(), rf.predict(new), lr.predict(new)):
    print(f"{s:4d}  {0.8*s:5.0f}  {f:6.1f}  {l:6.1f}")
print("largest price seen in training:", round(price.max(), 1))</div>
  <div class="fx" data-lang="text">size  true  forest  linear
  60     48    44.1    48.2
 140    112   108.2   111.8
 200    160   118.2   159.5
 300    240   118.2   238.9
largest price seen in training: 123.9</div>
  <p>Inside the training range (60 and 140 m²) the forest is fine. Outside it, it predicts 118.2 for both 200 and 300 m², because every tree sends those flats to its right-most leaf, whose value is near the top of the training prices. The linear model continues the line. A tree's prediction is a <strong>step function</strong> that goes flat after its last split, and averaging step functions gives another one. Anything that trends over time (sales, prices, users) eventually leaves the training range, so a forest will forecast a flat line. The usual fixes are to predict the <em>change</em> or a ratio instead of the level, or to remove the trend with a linear model and let the forest model what is left (see <a class="xref" data-note="ml_regression">Linear Regression</a>). The same limit applies to every tree model, boosted ones included.</p>

  <h2 id="rf-imb"><span class="num">08</span>Imbalanced Classes</h2>
  <p>Real targets are often lopsided: 1 fraud in 30 transactions, 1 churner in 50 customers. With a rare class, impurity is already low at the root (a node that is 97% honest has Gini 0.06), so splits that isolate the few positives look small, and many leaves end up majority-class. The forest may <em>rank</em> rows well, but at the default threshold of 0.5 it misses many positives.</p>
  <p>The common fix is <strong>class weights</strong>: <code>class_weight="balanced"</code> gives each row of class c the weight n / (k · n_c), with n rows, k classes and n_c rows in class c, so that both classes carry the same total weight in the impurity calculations and the leaf votes. On the diary (9 Yes, 5 No) a No day gets 14 / (2 × 5) = 1.4 and a Yes day 14 / (2 × 9) = 0.78, so the two classes weigh 5 × 1.4 = 7 and 9 × 0.78 = 7. An even simpler fix is to keep the model as it is and <strong>move the threshold</strong>: flag a row when P(positive) is at least some t below 0.5, chosen on validation data. The code compares them on a made-up fraud table with about 3% positives. Accuracy is useless here ("always honest" scores 97%), so it reports <strong>recall</strong> (share of frauds caught), <strong>precision</strong> (share of flagged rows that are fraud) and <strong>AP</strong>, average precision, which measures how well the scores <em>rank</em> frauds above honest rows regardless of any threshold (see <a class="xref" data-note="ml_evaluation">Classification Metrics</a>):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, average_precision_score
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, weights=[0.97],
                           class_sep=0.8, flip_y=0.01, random_state=1)        # about 3% "fraud"
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print("fraud share in training rows:", round(ytr.mean(), 3), " positives:", ytr.sum())
def report(name, proba, thr=0.5):
    pred = (proba &gt;= thr).astype(int)
    print(f"{name:34s} recall {recall_score(yte, pred):.2f}  precision {precision_score(yte, pred):.2f}"
          f"  AP {average_precision_score(yte, proba):.3f}")
kw = dict(n_estimators=300, n_jobs=-1, random_state=0)
p0 = RandomForestClassifier(**kw).fit(Xtr, ytr).predict_proba(Xte)[:, 1]
report("default", p0)
report("class_weight='balanced'",
       RandomForestClassifier(class_weight="balanced", **kw).fit(Xtr, ytr).predict_proba(Xte)[:, 1])
report("balanced + min_samples_leaf=10",
       RandomForestClassifier(class_weight="balanced", min_samples_leaf=10, **kw).fit(Xtr, ytr).predict_proba(Xte)[:, 1])
report("default, threshold moved to 0.2", p0, thr=0.2)</div>
  <div class="fx" data-lang="text">fraud share in training rows: 0.034  positives: 480
default                            recall 0.56  precision 0.97  AP 0.784
class_weight='balanced'            recall 0.57  precision 0.89  AP 0.778
balanced + min_samples_leaf=10     recall 0.80  precision 0.56  AP 0.740
default, threshold moved to 0.2    recall 0.76  precision 0.69  AP 0.784</div>
  <p>The result surprises people. The default forest already ranks best (AP 0.784), but at the 0.5 threshold it catches only 56% of frauds. <code>class_weight="balanced"</code> with fully grown trees changes almost nothing (recall 0.57), because deep leaves are pure, and a weight cannot change the majority of a pure leaf. Only with bigger leaves (<code>min_samples_leaf=10</code>) do the weights shift the votes: recall rises to 0.80, but precision falls to 0.56 and the ranking gets worse (AP 0.740). Moving the threshold of the default model to 0.2 catches 76% of frauds at a precision of 0.69, and keeps the best ranking. Think of a security guard who scores every bag from 0 to 1: reweighting retrains the guard to shout more, while moving the threshold keeps the same guard and says "check every bag above 0.2". If his ranking is already good, the second is cheaper and keeps his judgement intact. Weights and resampling also distort predicted probabilities, so if the business needs real probabilities, recalibrate afterwards.</p>

  <h2 id="rf-prox"><span class="num">09</span>Proximity and Outliers</h2>
  <p>Besides predictions, a forest knows which rows it treats as alike. If two rows land in the same leaf of a tree, that tree cannot tell them apart. The share of trees in which two rows share a leaf is their <strong>proximity</strong>, a similarity between 0 and 1 that the forest learnt with the target in mind: columns that matter for the target count, noise columns mostly do not. Breiman used proximities to fill missing values from similar rows, to draw maps of the data and to find outliers. sklearn's <code>rf.apply(X)</code> returns the leaf number of every row in every tree, and comparing those numbers gives the proximity:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)
rf = RandomForestClassifier(n_estimators=300, random_state=0).fit(X, df.Play)
leaf = rf.apply(X)                                          # 14 days x 300 trees: leaf number in each tree
def prox(a, b):                                             # share of trees where a and b share a leaf
    return np.mean(leaf[df.index.get_loc(a)] == leaf[df.index.get_loc(b)])
for a, b in [("D1", "D2"), ("D1", "D8"), ("D1", "D13")]:
    print(f"{a} {tuple(df.loc[a, ['Outlook', 'Temp', 'Humidity', 'Wind']])} vs {b} "
          f"{tuple(df.loc[b, ['Outlook', 'Temp', 'Humidity', 'Wind']])}: proximity {prox(a, b):.2f}")</div>
  <div class="fx" data-lang="text">D1 ('Sunny', 'Hot', 'High', 'Weak') vs D2 ('Sunny', 'Hot', 'High', 'Strong'): proximity 0.62
D1 ('Sunny', 'Hot', 'High', 'Weak') vs D8 ('Sunny', 'Mild', 'High', 'Weak'): proximity 0.58
D1 ('Sunny', 'Hot', 'High', 'Weak') vs D13 ('Overcast', 'Hot', 'Normal', 'Weak'): proximity 0.12</div>
  <p>D1 and D2 differ only in the wind and share a leaf in 62% of trees; D1 and D8 differ only in temperature (58%). D1 and D13 differ in outlook and humidity, the two columns that matter most, and share a leaf in only 12% of trees. Unlike a plain distance that counts every column equally, the forest's similarity weighs columns by how much they matter for the target.</p>
  <p>Proximity can find mislabelled rows: a row whose closest neighbours in the forest's eyes mostly have the <em>other</em> label is suspicious. The code plants a label typo in 500 validation customers (the customer the forest is surest is a churner is relabelled "stay"), computes for every row the share of its proximity that goes to rows of the other class, and ranks the rows by that score. <code>min_samples_leaf=5</code> is used so that leaves hold several rows; with one-row leaves most proximities would be 0.</p>
  <div class="fx" data-lang="py">rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=5, n_jobs=-1, random_state=0).fit(Xtr, ytr)
sub, ysub = Xva.iloc[:500], yva[:500].copy()
L = rf.apply(sub)                                         # 500 rows x 300 trees: leaf numbers
prox = (L[:, None, :] == L[None, :, :]).mean(axis=2)     # 500 x 500 proximity matrix
np.fill_diagonal(prox, 0)
i = int(np.argmax(np.where(ysub == 1, rf.predict_proba(sub)[:, 1], 0)))   # the surest churner...
ysub[i] = 0                                               # ...gets a wrong label: a typo in the data
same  = np.array([prox[k, ysub == ysub[k]].mean() for k in range(500)])   # closeness to own class
other = np.array([prox[k, ysub != ysub[k]].mean() for k in range(500)])   # closeness to the other class
score = other / (same + other)                            # near 1 = lives among the other class
rank = int(np.where(np.argsort(-score) == i)[0][0]) + 1
print(f"planted typo at row {i}: outlier rank {rank} of 500, score {score[i]:.2f}, median score {np.median(score):.2f}")</div>
  <div class="fx" data-lang="text">planted typo at row 443: outlier rank 4 of 500, score 0.94, median score 0.20</div>
  <p>The planted typo lives almost entirely among churners, so its score is 0.94 against a median of 0.20, and it ranks 4th of 500 suspects. The catch is size: the full proximity matrix is n × n, which for a million rows is 10¹² numbers, so compute it on a sample or only for the rows you care about.</p>

  <h2 id="rf-cost"><span class="num">10</span>Memory and Speed</h2>
  <p>Training a forest costs roughly B times the cost of one tree, but each split only examines m columns instead of p, so a forest trains several times faster than bagging with the same number of trees, and the trees can be trained in parallel (<code>n_jobs=-1</code>). Prediction is another matter: every row must walk down all B trees, so a forest predicts more slowly than one tree, and since fully grown trees have up to about one leaf per training row, the model can be large. The code measures a 300-tree forest at three settings, with prediction timed on one core:</p>
  <div class="fx" data-lang="py">import pickle
for kw in [{}, {"min_samples_leaf": 5}, {"max_depth": 10}]:
    rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0, **kw).fit(Xtr, ytr)
    nodes = sum(t.tree_.node_count for t in rf.estimators_)
    mb = len(pickle.dumps(rf)) / 1e6
    rf.set_params(n_jobs=1)
    t0 = time.time(); rf.predict(Xte); us = (time.time() - t0) / len(Xte) * 1e6
    print(f"{str(kw):22s} nodes {nodes:7d}  file {mb:5.1f} MB  validation {rf.score(Xva, yva):.3f}  predict {us:4.0f} us/row")</div>
  <div class="fx" data-lang="text">{}                     nodes  862330  file  69.1 MB  validation 0.879  predict  142 us/row
{'min_samples_leaf': 5} nodes  467444  file  37.5 MB  validation 0.872  predict   57 us/row
{'max_depth': 10}      nodes  192976  file  15.5 MB  validation 0.855  predict   46 us/row</div>
  <p>A default 300-tree forest trained on just 12,000 rows has 862,330 nodes and is a 69 MB file. <code>min_samples_leaf=5</code> roughly halves the size for −0.007 accuracy; <code>max_depth=10</code> cuts it 4.5 times and makes prediction about three times faster, for −0.024. Size grows roughly in proportion to the number of training rows, so a forest on 10 million rows can reach gigabytes. Forests that are fine in a notebook can fail in production because they are slow to load, too big for a container, or too slow for single-row requests; capping depth or leaf size, or using fewer trees once the OOB curve has flattened, are the usual remedies. (Timings are from a busy shared machine: compare them with each other, not with your laptop.)</p>

  <h2 id="rf-scratch"><span class="num">11</span>A Random Forest From Scratch</h2>
  <p>To prove that nothing else is hidden inside, here is a complete forest. We write the forest part ourselves (bootstrap rows, track the out-of-bag rows, average the trees' probabilities, compute the OOB score) and let <code>DecisionTreeClassifier(max_features="sqrt")</code> handle the per-split column draws: that option makes a single sklearn tree draw √p random columns at every split, exactly what a forest tree needs. (The split search itself is written by hand in <a class="xref" data-note="ml_dtree">Decision Trees</a>.)</p>
  <div class="fx" data-lang="py">class MyForest:
    def __init__(self, n_trees=200, max_features="sqrt", seed=0):
        self.n_trees, self.max_features, self.seed = n_trees, max_features, seed
    def fit(self, X, y):
        X, y = np.asarray(X), np.asarray(y)
        n = len(X)
        rng = np.random.default_rng(self.seed)
        self.classes_ = np.unique(y)
        self.trees = []
        oob_votes = np.zeros((n, len(self.classes_)))     # probabilities from trees that did NOT see the row
        for b in range(self.n_trees):
            idx = rng.integers(0, n, n)                    # 1. bootstrap: n rows with replacement
            tree = DecisionTreeClassifier(max_features=self.max_features,   # 2. random columns at EVERY split
                                          random_state=int(rng.integers(1e9)))
            self.trees.append(tree.fit(X[idx], y[idx]))    # 3. grow fully, no pruning
            oob = np.setdiff1d(np.arange(n), idx)          # rows this tree never saw
            oob_votes[oob] += tree.predict_proba(X[oob])
        seen = oob_votes.sum(1) &gt; 0
        self.oob_score_ = np.mean(self.classes_[oob_votes[seen].argmax(1)] == y[seen])
        return self
    def predict_proba(self, X):                            # 4. soft vote: average the probabilities
        return np.mean([t.predict_proba(np.asarray(X)) for t in self.trees], axis=0)
    def predict(self, X):
        return self.classes_[self.predict_proba(X).argmax(1)]

mine = MyForest(200).fit(Xtr, ytr)
sk = RandomForestClassifier(n_estimators=200, oob_score=True, n_jobs=-1, random_state=0).fit(Xtr, ytr)
print(f"from scratch: validation {np.mean(mine.predict(Xva) == yva):.3f}  OOB {mine.oob_score_:.3f}")
print(f"sklearn     : validation {sk.score(Xva, yva):.3f}  OOB {sk.oob_score_:.3f}")
print(f"same answer on {np.mean(mine.predict(Xva) == sk.predict(Xva)):.1%} of validation rows")</div>
  <div class="fx" data-lang="text">from scratch: validation 0.876  OOB 0.861
sklearn     : validation 0.881  OOB 0.864
same answer on 97.3% of validation rows</div>
  <p>The hand-written forest scores 0.876 on validation with OOB 0.861; sklearn's scores 0.881 with OOB 0.864, and the two give the same answer for 97.3% of customers. They cannot match exactly because their random draws differ; the gap is the size of a forest's run-to-run noise. Walk through the code: <code>rng.integers(0, n, n)</code> is the bootstrap; <code>max_features</code> on the tree gives the random columns per split; <code>np.setdiff1d</code> finds the rows a tree never saw, and that tree's probabilities are added to those rows only, which builds the OOB score; and <code>predict_proba</code> is the soft vote of section 03. That is the entire random forest.</p>

  <h2 id="rf-cmp"><span class="num">12</span>Tree vs Bagging vs Forest</h2>
  <p>Now step back and measure the forest against its parent (one tree) and its sibling (bagging) in the same way. Each model is trained on three different random 80% slices of the training rows. The code reports mean test accuracy, test AUC, and a direct look at variance: the share of test customers who get a <em>different answer</em> when the same kind of model is trained on a different slice.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
from sklearn.metrics import roc_auc_score
models = {
    "single tree (full depth)": lambda s: DecisionTreeClassifier(random_state=s),
    "single tree (depth 8)":    lambda s: DecisionTreeClassifier(max_depth=8, random_state=s),
    "bagging, 300 trees":       lambda s: BaggingClassifier(DecisionTreeClassifier(), n_estimators=300, n_jobs=-1, random_state=s),
    "random forest, 300 trees": lambda s: RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=s)}
for name, make in models.items():
    accs, preds = [], []
    for s in range(3):                                    # 3 different random 80% slices of the training rows
        rows = np.random.default_rng(s).choice(len(Xtr), int(0.8 * len(Xtr)), replace=False)
        m = make(s).fit(Xtr.iloc[rows], ytr[rows])
        accs.append(m.score(Xte, yte)); preds.append(m.predict(Xte))
    flip = np.mean(preds[0] != preds[1])                  # same kind of model, different data slice
    auc = roc_auc_score(yte, m.predict_proba(Xte)[:, 1])
    print(f"{name:25s} test acc {np.mean(accs):.3f}  AUC {auc:.3f}  answers changed by a new slice {flip:5.1%}")</div>
  <div class="fx" data-lang="text">single tree (full depth)  test acc 0.773  AUC 0.771  answers changed by a new slice 25.3%
single tree (depth 8)     test acc 0.782  AUC 0.843  answers changed by a new slice 15.9%
bagging, 300 trees        test acc 0.868  AUC 0.930  answers changed by a new slice  4.7%
random forest, 300 trees  test acc 0.871  AUC 0.932  answers changed by a new slice  3.6%</div>
  <p>One full tree scores 0.773 and gives a different answer for 25.3% of customers when retrained on a different 80% of the data: that is high variance in one number. Pruning to depth 8 helps a little (0.782, 15.9% changed). Bagging jumps to 0.868 with only 4.7% changed. The forest is the most stable (3.6%) and edges out bagging on accuracy (0.871) and AUC (0.932), while each of its splits searches 3 columns instead of 14. Most of the gain over a single tree comes from averaging; the random columns add a further step on this data, and much more on data dominated by one strong column.</p>
  <table class="tbl">
    <tr><th></th><th>Decision tree</th><th>Bagging</th><th>Random forest</th><th><a class="xref" data-note="ml_extratrees">Extra Trees</a></th><th><a class="xref" data-note="ml_gbm">Gradient boosting</a></th></tr>
    <tr><td>Randomness</td><td>none</td><td>bootstrap rows</td><td>bootstrap rows + m columns per split</td><td>m columns + random cut-offs</td><td>optional subsampling</td></tr>
    <tr><td>Trees built</td><td>1</td><td>in parallel</td><td>in parallel</td><td>in parallel</td><td>in sequence</td></tr>
    <tr><td>Typical tree</td><td>pruned</td><td>deep</td><td>deep</td><td>deep</td><td>shallow (depth 3–8)</td></tr>
    <tr><td>Mainly reduces</td><td>—</td><td>variance</td><td>variance (lower ρ)</td><td>variance (even lower ρ)</td><td>bias</td></tr>
    <tr><td>Tuning needed</td><td>depth</td><td>little</td><td>little (max_features)</td><td>little</td><td>more (learning rate, trees, depth)</td></tr>
    <tr><td>Overfits by adding trees?</td><td>—</td><td>no</td><td>no</td><td>no</td><td>yes</td></tr>
  </table>
  <p>When should you use a random forest? It is the best <em>first</em> model for almost any table: strong with default settings, no scaling needed, robust to outliers in the inputs and to many irrelevant columns, parallel, and it comes with an OOB score. It is also a valuable diverse member in a blend (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>). Its weaknesses are size and prediction speed, no extrapolation, no direct interpretability, and, most importantly, that it cannot reduce bias: if every tree misses a pattern, the average misses it too. That is why tuned gradient boosting (XGBoost, LightGBM, CatBoost) usually wins the last point of accuracy, by building trees in sequence, each fixing what the previous ones got wrong (<a class="xref" data-note="ml_boosting">How Boosting Works</a>). Prefer a linear model when the target must extrapolate or the model must be one readable formula.</p>

  <h2 id="rf-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The first mistake is reading a forest's training accuracy of 1.000 as overfitting. Fully grown trees memorise their bootstrap samples, so a forest's training score is always near perfect by design (section 05 printed 1.000 for the default). It says nothing about how the forest generalises; judge it only by OOB, validation or cross-validation scores.</p>
  <p>The second is treating <code>n_estimators</code> as a regularisation knob and grid-searching it. More trees never make a forest worse; they only cost time and memory. Pick the smallest number at which the OOB curve has flattened.</p>
  <p>The third is assuming that <code>RandomForestRegressor</code> decorrelates its trees by default. Its default <code>max_features=1.0</code> lets every split see every column, which is plain bagging. Set it to 0.33 or "sqrt" and compare.</p>
  <p>The fourth is presenting MDI importance as "what drives the target". MDI is computed on training data and inflates columns with many distinct values; section 06 showed pure noise scoring like real columns. Check rankings with permutation importance on held-out data.</p>
  <p>The fifth is using a forest to forecast a trend: beyond the training range it predicts a flat line (a 300 m² flat at 118 lakh instead of 240). Model the change, or remove the trend first.</p>
  <p>The sixth is judging an imbalanced problem by accuracy, or reaching for class weights by reflex. Use recall, precision and AP, and try moving the threshold first; it was simpler and better in section 08. Finally, forgetting <code>random_state</code> makes every refit slightly different, which confuses comparisons between settings, and forgetting model size can make a fine notebook model unusable in production.</p>

  <h2 id="rf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Random forest</b>: B deep trees, each on a bootstrap sample, each split chosen as the best among m randomly drawn columns; predictions averaged.</li>
    <li><b>max_features (m)</b>: columns drawn per split. √p for classification, p/3 (Breiman) for regression; sklearn's regressor defaults to all p.</li>
    <li><b>Correlation floor</b>: the variance of an average cannot go below ρσ², however many trees.</li>
    <li><b>Strength</b>: how good individual trees are (average margin). Smaller m: weaker but less correlated trees.</li>
    <li><b>Soft vote</b>: average probabilities (sklearn). <b>Hard vote</b>: majority of labels (Breiman's paper).</li>
    <li><b>OOB score</b>: each row predicted only by trees that never saw it.</li>
    <li><b>MDI</b>: summed weighted impurity drops per column; biased to many-valued columns. <b>Permutation importance</b>: score drop when a column is shuffled.</li>
    <li><b>Proximity</b>: share of trees in which two rows land in the same leaf.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Variance of the forest</td><td>ρσ² + (1 − ρ)σ²/B</td><td>σ² = 1, B = 200: ρ 0.47 → 0.473, ρ 0.17 → 0.174</td></tr>
    <tr><td>Chance the best column is on offer</td><td>m / p</td><td>diary 2/4; churn 3/14 = 21%</td></tr>
    <tr><td>Breiman's bound</td><td>error ≤ ρ̄(1 − s²)/s²</td><td>s = 0.6, ρ̄ = 0.2 → 0.36</td></tr>
    <tr><td>Soft vote</td><td>P(c) = (1/B) Σ P_b(c)</td><td>D10: 2.79/5 = 0.557 → Yes</td></tr>
    <tr><td>MDI credit of one split</td><td>(N_t/N)[i(t) − (N_L/N_t)i(L) − (N_R/N_t)i(R)]</td><td>diary: 0.102 and 0.129 → 0.442 / 0.558</td></tr>
    <tr><td>Balanced class weight</td><td>n / (k · n_c)</td><td>diary: No 1.4, Yes 0.78</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.inspection import permutation_importance

rf = RandomForestClassifier(n_estimators=300,      # trees: until OOB flattens
                            max_features="sqrt",   # m: tune first
                            min_samples_leaf=1,    # raise to shrink the model
                            oob_score=True, n_jobs=-1, random_state=0)
rf.fit(X_train, y_train)
rf.oob_score_, rf.feature_importances_             # free validation, MDI
permutation_importance(rf, X_val, y_val, n_repeats=5)
rf.apply(X)                                        # leaf of every row in every tree</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Training accuracy ≈ 1.000 is normal; judge by OOB / validation.</li>
    <li>More trees never overfit; tune <code>max_features</code>, not <code>n_estimators</code>.</li>
    <li><code>RandomForestRegressor</code> default <code>max_features=1.0</code> = bagging.</li>
    <li>MDI favours many-valued columns; use permutation importance on held-out data.</li>
    <li>No extrapolation: predictions stay within the training targets.</li>
    <li>Class weights barely matter with pure leaves; try moving the threshold.</li>
    <li>OOB is leaky after preprocessing fitted on all rows.</li>
  </ul>

  <h2 id="rf-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a random forest?</summary><div class="qa-body">An ensemble of deep decision trees. Each tree is trained on a bootstrap sample of the rows, and at every split it may only choose among a random subset of the columns. The forest predicts by averaging the trees' probabilities (classification) or values (regression).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a random forest add to bagging, and why?</summary><div class="qa-body">Random columns at every split. Bagged trees all ask about the strongest column first (all 100 bagged churn trees started with <code>f5</code>), so they are correlated and share mistakes. The variance of an average is ρσ² + (1 − ρ)σ²/B, and more trees only shrink the second term, so lowering the correlation ρ is the only way to improve further. Random column draws lower ρ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the variance of an average of B correlated trees.</summary><div class="qa-body">Var(ΣX_b/B) = (1/B²)[Σ Var(X_b) + Σ_{b≠c} Cov(X_b, X_c)] = (1/B²)[Bσ² + B(B − 1)ρσ²] = ρσ² + (1 − ρ)σ²/B. As B grows it tends to ρσ², the correlation floor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why sample columns per split rather than per tree?</summary><div class="qa-body">Per tree (random subspaces) can leave a tree with no strong column at all, so the whole tree is weak. Per split, a node that misses the strong column uses another, but deeper nodes draw again and can still use it. Trees stay reasonably strong while their structures differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose max_features, and what happens at the extremes?</summary><div class="qa-body">Start at √p for classification and p/3 for regression, then tune by OOB or cross-validation; it is the most important knob. m = p is plain bagging: strong but correlated trees. m = 1 picks the split column at random: very decorrelated but weak trees (0.844 vs about 0.88 on churn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a random forest overfit? Can adding trees cause it?</summary><div class="qa-body">Adding trees cannot: the error settles to a limit as B grows. The forest can still overfit through very deep trees on very noisy data, and its training accuracy is always near 1, so judge it on OOB or validation data and control it with min_samples_leaf, max_depth or max_features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the OOB score, and when would you not trust it?</summary><div class="qa-body">Each training row is predicted only by the trees whose bootstrap sample missed it (about 37% of them), and those predictions are scored. Do not trust it with few trees (5 trees: OOB 0.728 vs validation 0.825), on tiny data, with bootstrap=False (it does not exist), or when preprocessing was fitted on all rows first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Soft vote vs hard vote: which does sklearn use, and why does it matter?</summary><div class="qa-body">sklearn averages probabilities (soft); Breiman's paper counted votes (hard). They can disagree: on the diary five trees gave P(Yes) 1.00, 0.62, 0.33, 0.43, 0.40, so the hard vote is 3–2 for No but the average 0.557 says Yes, which was right. Soft voting uses each tree's confidence and gives scores for ROC and PR curves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is MDI feature importance computed, and what is its bias?</summary><div class="qa-body">For each split, (share of rows reaching the node) × (impurity drop), summed per column, averaged over trees and normalised to sum to 1. It is computed on training data and favours columns with many distinct values, which offer many cut-offs and win lucky splits deep in the tree; a pure-noise continuous column scored like real weak columns on churn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is permutation importance, and what is its weakness?</summary><div class="qa-body">Shuffle one column in held-out data and measure how much the model's score drops; average over several shuffles. It measures how much the model actually needs the column. Its weakness is correlated columns: shuffling one barely hurts because its twin carries the same information, so both can look unimportant. Shuffling can also create unrealistic rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a random forest extrapolate?</summary><div class="qa-body">Each leaf predicts an average of training targets, and the forest averages leaves, so predictions stay between the smallest and largest training target. Beyond the last split the prediction is flat (a 300 m² flat predicted at 118 instead of 240). Fix by predicting changes or ratios, or by detrending with a linear model first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle class imbalance with a random forest?</summary><div class="qa-body">Options are class_weight="balanced" or "balanced_subsample", a balanced random forest that undersamples the majority in each tree, or keeping the model and tuning the decision threshold on validation data. Evaluate with recall, precision and average precision, not accuracy. With fully grown trees weights change little because leaves are pure; moving the threshold is often the simplest effective fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are random forest proximities used for?</summary><div class="qa-body">Proximity(i, j) is the share of trees in which rows i and j share a leaf. It is a target-aware similarity used for finding similar rows, clustering and plotting the data, imputing missing values, and spotting outliers or mislabelled rows (a row whose closest neighbours mostly have the other label).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the time and memory costs of a random forest?</summary><div class="qa-body">Training is about B times one tree's cost with m columns per split, roughly O(B · m · n log n), and parallel across trees. Prediction is O(B · depth) per row. Memory is O(B · nodes), and fully grown trees have up to about one leaf per training row, so models can be tens of megabytes on small data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest vs gradient boosting: when would you pick each?</summary><div class="qa-body">A forest builds independent deep trees and averages them: it reduces variance, works well with defaults, cannot overfit by adding trees and is easy to parallelise. Boosting builds shallow trees in sequence, each fixing the previous ensemble's errors: it reduces bias, usually wins on accuracy, but needs tuning (learning rate, number of trees, early stopping). Use a forest as a strong baseline or when tuning time is short; boosting when the last point matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your forest stopped improving at 100 trees. What do you try next?</summary><div class="qa-body">Not more trees. Tune max_features (lower ρ or stronger trees), try min_samples_leaf for smoother leaves, check for leakage or label noise (proximities help), engineer better features, or switch to gradient boosting to attack bias. Compare everything on the same cross-validation folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a random forest need both the bootstrap and random columns?</summary><div class="qa-body">Without random columns it is plain bagging, and the strongest column starts most trees, so ρ stays high. Without the bootstrap, column randomness alone still diversifies the trees (accuracy barely changed on churn), but there is no OOB score and slightly less diversity. Together they give the most decorrelation for the least loss of tree strength.</div></details>
</main>
`
});
