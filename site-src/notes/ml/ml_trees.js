// notes/ml/ml_trees.js — Tree Models: Overview & How to Choose
Object.assign(TOPIC_CONTENT, {
  "ml_trees": `<main>
  <h1>Tree Models: Overview &amp; How to Choose</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Tree Models: Overview &amp; How to Choose</span></div>
  <p class="lead">Tree models are a family of machine-learning models built out of decision trees: the single tree, bagging, the random forest, Extra Trees, AdaBoost, gradient boosting, and the modern gradient-boosting libraries XGBoost, LightGBM and CatBoost. For table data (rows and columns, like a spreadsheet of customers or loans) they are the strongest classic models, and in industry they are usually the first thing tried and often the model that ships. They are not a list of unrelated algorithms: each member was invented to fix a specific weakness of the one before it, so they are easiest to learn as one story. This page tells that story, runs every member side by side on the same data, and ends with a practical guide for choosing one. Our running example is the shared 20,000-customer churn table used across the tree notes, with the cricket captain's 14-day diary from <a class="xref" data-note="ml_dtree">Decision Trees</a> for the small calculations we can do by hand.</p>

  <h2 id="mt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tree Models</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The root: one tree</div>
        <ul>
          <li>Greedy yes/no splits that lower impurity (Gini, entropy, variance)</li>
          <li>Bends and interactions for free; no scaling; readable rules</li>
          <li>Weakness: high variance, memorises unless pruned</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bagging branch (cuts variance)</div>
        <ul>
          <li><b>Bagging</b>: bootstrap rows, average deep trees, out-of-bag score</li>
          <li><b>Random forest</b>: + random columns per split → trees less alike</li>
          <li><b>Extra Trees</b>: + random thresholds → faster, even less alike</li>
          <li>More trees never overfit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Boosting branch (cuts bias)</div>
        <ul>
          <li>F_m = F_m−1 + ν·h_m: each small tree fixes the team's errors</li>
          <li><b>AdaBoost</b>: reweight wrong rows · <b>GBM</b>: fit the loss gradient</li>
          <li><b>XGBoost</b> second order + penalties · <b>LightGBM</b> histograms, leaf-wise · <b>CatBoost</b> ordered categories</li>
          <li>Too many rounds overfit → early stopping</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How to choose</div>
        <ul>
          <li>Rules must be read → pruned tree</li>
          <li>First baseline → random forest</li>
          <li>Best accuracy on a big table → LightGBM / XGBoost + early stopping</li>
          <li>Many text categories → CatBoost</li>
          <li>No tree model extrapolates</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mt-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Tree Models for Tables</span><span class="rm-sub">where straight-line models fail</span></div></div>
      <div class="rm-item rm-done" data-target="mt-tree"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Single Decision Tree</span><span class="rm-sub">the root of the family and its weakness</span></div></div>
      <div class="rm-item rm-done" data-target="mt-ens"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Combining Trees</span><span class="rm-sub">why many shaky trees make a steady team</span></div></div>
      <div class="rm-item rm-done" data-target="mt-bag"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bagging, Random Forest, Extra Trees</span><span class="rm-sub">making trees different on purpose</span></div></div>
      <div class="rm-item rm-done" data-target="mt-boost"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Boosting</span><span class="rm-sub">trees that fix each other's mistakes</span></div></div>
      <div class="rm-item rm-done" data-target="mt-modern"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">XGBoost, LightGBM, CatBoost</span><span class="rm-sub">what the modern libraries add</span></div></div>
      <div class="rm-item rm-done" data-target="mt-race"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Whole Family Side by Side</span><span class="rm-sub">every member on the same data</span></div></div>
      <div class="rm-item rm-done" data-target="mt-limits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">What No Tree Model Can Do</span><span class="rm-sub">extrapolation and staircases</span></div></div>
      <div class="rm-item rm-done" data-target="mt-choose"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How to Choose</span><span class="rm-sub">a comparison table and a decision guide</span></div></div>
      <div class="rm-item rm-done" data-target="mt-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">across the whole family</span></div></div>
      <div class="rm-item rm-done" data-target="mt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the family on one page</span></div></div>
      <div class="rm-item rm-done" data-target="mt-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions asked about tree models</span></div></div>
    </div>
  </div>

  <h2 id="mt-why"><span class="num">01</span>Why Tree Models for Tables</h2>
  <p>Imagine a telecom company that wants to know which customers are about to leave (to "churn"), so it can call them with an offer first. It has a table with one row per customer and columns such as monthly bill, tenure, number of complaints and data usage. Real patterns in such tables bend and interact: a customer may churn only if tenure is short <em>and</em> complaints are high, or the risk may rise with the bill up to a point and then fall. A <a class="xref" data-note="ml_classification">logistic regression</a> multiplies each column by a weight and adds them up, which draws one straight boundary; unless you build the interaction columns by hand, it cannot see such patterns.</p>
  <p>Our running example is a synthetic version of that table, shared by all the tree notes so that their numbers can be compared. It has 20,000 customers and 12 columns made by scikit-learn's <code>make_classification</code> (6 carry real signal, 2 are mixtures of those, 4 are useless), plus two pure-noise columns, <code>row_noise</code> (20,000 different random values) and <code>coin_noise</code> (random 0 or 1). 5% of the labels are flipped at random, so even a perfect model stays below about 0.95. The rows are split into 12,000 for training, 3,000 for validation (choosing settings) and 5,000 for the final test:</p>
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
  <p>First, the straight-line model against a single decision tree:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
models = {"logistic regression": make_pipeline(StandardScaler(), LogisticRegression()),
          "one tree, unlimited": DecisionTreeClassifier(random_state=0),
          "one tree, pruned":    DecisionTreeClassifier(ccp_alpha=3e-4, random_state=0)}
for name, m in models.items():
    m.fit(Xtr, ytr)
    print(f"{name:20s} train {m.score(Xtr, ytr):.3f}   test {m.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">logistic regression  train 0.596   test 0.596
one tree, unlimited  train 1.000   test 0.778
one tree, pruned     train 0.891   test 0.814</div>
  <p>Logistic regression barely beats a coin (0.596 on test), because the pattern is far from a straight line. A single decision tree, which asks one yes/no question at a time, jumps to about 0.78 without any feature engineering. But look at its training score: 1.000. The unlimited tree memorised its training customers, and pruning it (cutting back branches that do not earn their place) lifts the test score to about 0.81 while giving up the perfect training score. These two facts, that trees capture bends and interactions naturally and that a single tree overfits, are the whole reason the tree family exists. Every later member keeps the first fact and attacks the second.</p>

  <h2 id="mt-tree"><span class="num">02</span>The Single Decision Tree</h2>
  <p>A <strong>decision tree</strong> is a model that splits the rows by a sequence of one-column questions ("monthly bill ≤ 800?") until the remaining groups, called leaves, are as pure as possible, and then predicts the majority class (or, for a numeric target, the average) of each leaf. Think of a doctor's checklist: the first question rules out the most possibilities, and each later question depends on the earlier answers. The full story, worked by hand, is in <a class="xref" data-note="ml_dtree">Decision Trees</a>; here is the core idea in one example.</p>
  <p>To choose a question, the tree needs a number that says how mixed a group is. One common choice is <strong>Gini impurity</strong>, the chance that two rows drawn at random from the group have different classes: Gini = 1 − Σ pᵢ², where pᵢ is the share of class i. The captain's diary has 9 days when the match was played and 5 when it was not, so its Gini is 1 − (9/14)² − (5/14)² = 0.459. Split on humidity: the 7 humid days hold 3 played and 4 not (Gini 1 − (3/7)² − (4/7)² = 0.490), the 7 normal days hold 6 and 1 (Gini 0.245). Both halves have 7 days, so the size-weighted Gini of the children is 0.5 × 0.490 + 0.5 × 0.245 = 0.367, and the split removes 0.459 − 0.367 = 0.092 of impurity. The tree tries every column and every cut-off, keeps the question that removes the most impurity, and repeats inside each child. This greedy, top-down search is fast, needs no scaling (only the order of values matters), handles interactions automatically, and produces rules you can read aloud.</p>
  <p>Its weakness is <strong>variance</strong>: how much the model changes when the training data changes a little. When two candidate questions score almost the same, a handful of rows decides the winner, and because every later question depends on the first, the whole tree changes. On the diary, compare the information gain (the entropy version of "impurity removed") of each column with all 14 days and with day D3 removed:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, col):                                   # information gain of splitting d on col
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(col))
cols = ["Outlook", "Temp", "Humidity", "Wind"]
print("all 14 days: ", {c: round(IG(df, c), 3) for c in cols})
print("without D3:  ", {c: round(IG(df.drop("D3"), c), 3) for c in cols})</div>
  <div class="fx" data-lang="text">all 14 days:  {'Outlook': 0.247, 'Temp': 0.029, 'Humidity': 0.152, 'Wind': 0.048}
without D3:   {'Outlook': 0.214, 'Temp': 0.076, 'Humidity': 0.219, 'Wind': 0.035}</div>
  <p>With all days, Outlook (0.247) is clearly the best first question. Remove one overcast, humid day and Humidity (0.219) narrowly beats Outlook (0.214): a different root, and a different tree below it. One page of the diary changed the model. Limiting the tree (a maximum depth, a minimum number of rows per leaf, or cost-complexity pruning) reduces this, but only by making the tree simpler, which adds <strong>bias</strong>, a systematic miss of patterns too fine for the simple tree. On the churn data the best pruned tree stays around 0.81. To go further we need many trees.</p>

  <h2 id="mt-ens"><span class="num">03</span>Combining Trees</h2>
  <p>A tree's high variance has a useful side: its mistakes are partly random. Trees trained on different samples make mistakes on different customers, so when many such trees vote, each tree's private mistakes are outvoted, while the patterns they all learnt survive. A team of models combined in this way is called an <strong>ensemble</strong>. Think of a jar of sweets at a fair: one person's guess of the count may be far off, but the average of a hundred independent guesses is usually very close, because over-guesses and under-guesses cancel.</p>
  <p>How much the averaging helps has an exact answer. If each of n models has prediction variance σ² and every pair of models has correlation ρ (how much their errors move together, from 0 for unrelated to 1 for identical), the variance of their average is</p>
  <p style="text-align:center"><strong>Var(average) = ρσ² + (1 − ρ)σ²/n</strong></p>
  <p>Work it with σ² = 1 and ρ = 0.5. One tree: 1. Ten trees: 0.5 + 0.5/10 = 0.55. A thousand trees: 0.5 + 0.0005, about 0.50. More trees only shrink the second term; the first term, ρσ², is a floor that no number of trees can break. Lower the correlation to ρ = 0.3 and the floor drops to 0.3. Two consequences shape the whole family. First, the way to improve a team is to make its members <em>less alike</em>, not merely more numerous. Second, averaging never changes <em>bias</em>: if every tree misses the same pattern, their average misses it too. The bagging branch of the family is built on the first consequence; the boosting branch was invented because of the second. <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a> derives the formula and its limits.</p>

  <h2 id="mt-bag"><span class="num">04</span>Bagging, Random Forest and Extra Trees</h2>
  <p>We have one training table, but averaging needs many different trees. <strong>Bagging</strong> (bootstrap aggregating, Breiman 1996) creates them with the <strong>bootstrap</strong>: draw n rows <em>with replacement</em> from the n training rows, so some rows appear twice or more and others not at all, grow a full tree on that sample, repeat many times, and average the trees' predictions (or take a majority vote). Each row is left out of a given sample with probability (1 − 1/n)ⁿ, which approaches 1/e ≈ 0.368, so each tree sees about 63% of the distinct rows. The rows a tree did not see are its <strong>out-of-bag</strong> rows, a free validation set. Think of a panel of judges who each watched a different recording of the same match: their average score is steadier than any one judge's.</p>
  <p>Bagged trees are still too alike. If one column is clearly the strongest, it wins the first question in almost every bootstrap sample, so the trees share their top structure and their errors stay correlated, keeping the floor ρσ² high. The <strong>random forest</strong> (Breiman 2001) adds one rule: at every split, the tree may choose only among a small random subset of the columns (by default about √d of the d columns for classification). The strong column is often simply not on the menu, so other columns get a chance and the trees grow apart. <strong>Extra Trees</strong> (extremely randomised trees, Geurts 2006) go one step further: at each split they also draw the cut-off at random for each candidate column instead of searching for the best one, and by default they use all rows instead of bootstrap samples. Each tree is a little worse, but the trees are even less alike, and skipping the threshold search makes training faster. On the diary we can watch both effects:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, col):
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(col))
cols = ["Outlook", "Temp", "Humidity", "Wind"]
rng = np.random.default_rng(171)
idx = rng.integers(0, 14, 14)                                  # draw 14 days WITH replacement
used = sorted(set(df.index[idx]), key=lambda s: int(s[1:]))
print("one bootstrap sample uses", len(used), "different days; out-of-bag:", [d for d in df.index if d not in used])
roots_bag, roots_rf = [], []
for _ in range(1000):
    s = df.iloc[rng.integers(0, 14, 14)]                       # a bootstrap sample of the diary
    gains = {c: IG(s, c) for c in cols}
    roots_bag.append(max(gains, key=gains.get))                # bagging: best of all 4 columns
    pair = rng.choice(cols, 2, replace=False)                  # random forest: best of 2 random columns
    roots_rf.append(max(pair, key=gains.get))
print("Outlook wins the root in", roots_bag.count("Outlook"), "of 1000 bagged trees,",
      roots_rf.count("Outlook"), "of 1000 random-forest trees")</div>
  <div class="fx" data-lang="text">one bootstrap sample uses 9 different days; out-of-bag: ['D1', 'D3', 'D9', 'D13', 'D14']
Outlook wins the root in 547 of 1000 bagged trees, 413 of 1000 random-forest trees</div>
  <p>One bootstrap sample of the 14 days used only 9 different days; the 5 others are its out-of-bag days. Over 1,000 bootstrap samples, Outlook wins the first question in 547 of the bagged trees, but in only 413 of the random-forest trees, where each split may choose from just 2 random columns of the 4, so Outlook can win only when it is drawn. Fewer trees share the same root, which is exactly a lower ρ. On the churn data we can measure ρ directly as the correlation between two trees' mistakes:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.ensemble import BaggingClassifier, ExtraTreesClassifier
teams = {"bagging":       BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0),
         "random forest": RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=0),
         "extra trees":   ExtraTreesClassifier(n_estimators=100, n_jobs=-1, random_state=0)}
for name, m in teams.items():
    m.fit(Xtr, ytr)
    E = np.array([t.predict(Xva.values) != yva for t in m.estimators_[:30]], float)   # 1 = this tree is wrong
    rho = np.corrcoef(E)[np.triu_indices(30, 1)].mean()       # average error correlation between trees
    print(f"{name:14s} one tree {1 - E.mean():.3f}   error correlation {rho:.2f}   team {m.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">bagging        one tree 0.769   error correlation 0.25   team 0.881
random forest  one tree 0.738   error correlation 0.18   team 0.880
extra trees    one tree 0.701   error correlation 0.13   team 0.868</div>
  <p>Read the three lines from left to right and you can see the trade-off the formula describes. Each step adds randomness, so each single tree gets weaker (0.769 for a bagged tree, 0.738 for a random-forest tree, 0.701 for an Extra Trees tree), but the trees' errors also become less correlated (0.25, 0.18, 0.13). Here the two effects roughly cancel: the random forest matches bagging (0.880 against 0.881 on validation) while training faster, because each split looks at fewer columns, and Extra Trees gives up about a point for being faster still. On other data, especially with one dominant column or many columns, the lower correlation wins more clearly. All three branch members share three practical virtues: adding more trees never overfits (the variance term just shrinks towards the floor), the trees can be trained in parallel on several CPU cores, and the defaults work well with almost no tuning. What none of them can do is learn from another tree's mistakes: every tree is grown independently, so a pattern that every deep tree misses stays missed. Each member has its own note: <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>, <a class="xref" data-note="ml_rf">Random Forest</a> and <a class="xref" data-note="ml_extratrees">Extra Trees</a>.</p>

  <h2 id="mt-boost"><span class="num">05</span>Boosting</h2>
  <p><strong>Boosting</strong> takes the opposite route. Instead of growing many deep trees independently and averaging them, it grows many <em>small</em> trees one after another, and each new tree is trained to fix what the team built so far still gets wrong. The model is a sum,</p>
  <p style="text-align:center"><strong>F_m(x) = F_m−1(x) + ν · h_m(x)</strong></p>
  <p>where F_m−1 is the team so far, h_m is the new small tree fitted to its errors, and ν (nu, the <strong>learning rate</strong>, usually 0.01 to 0.3) shrinks each tree's contribution so that no single tree can dominate. Think of a relay of tutors preparing a student for an exam: each tutor tests the student, finds the chapters the student still gets wrong, and works only on those. Because each step corrects a mistake the whole team shares, boosting reduces <strong>bias</strong>, which averaging cannot touch, so its members can be weak, high-bias trees such as stumps (one question) or trees of depth 3 to 8.</p>
  <p>A tiny example by hand, predicting the turnout in the captain's diary (how many club members came; the 14 values sum to 476). Start with the simplest prediction, the mean: F₀ = 476/14 = 34 for every day. The squared errors add up to 1280. The errors y − F₀ (called residuals) run from −14 to +14. Fit a stump to the residuals: the best question is "humidity reading ≤ 82.5", and the mean residual is +6 on the 7 normal-humidity days and −6 on the 7 humid days. Add it with ν = 0.5: normal days become 34 + 3 = 37, humid days 34 − 3 = 31. The code checks this and then lets scikit-learn run more rounds:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from play import df
y = df.Turnout.values.astype(float)
F0 = y.mean(); r = y - F0                                  # start: everyone gets the mean
left = (df.HumPct &lt;= 82.5).values                          # the best stump on these residuals
h1 = np.where(left, r[left].mean(), r[~left].mean())       # +6 for normal days, -6 for humid days
F1 = F0 + 0.5 * h1                                         # add it with learning rate 0.5
print(f"F0 = {F0:.0f}, squared error {((y - F0) ** 2).sum():.0f}; stump says {h1[left][0]:+.0f} / {h1[~left][0]:+.0f};"
      f" after round 1: {((y - F1) ** 2).sum():.0f}")
gb = GradientBoostingRegressor(max_depth=1, learning_rate=0.5, n_estimators=20)
gb.fit(df[["HumPct", "TempC"]], y)
sse = [((y - p) ** 2).sum() for p in gb.staged_predict(df[["HumPct", "TempC"]])]
print("squared error after rounds 1, 2, 3, 5, 10, 20:", [round(sse[i - 1]) for i in (1, 2, 3, 5, 10, 20)])</div>
  <div class="fx" data-lang="text">F0 = 34, squared error 1280; stump says +6 / -6; after round 1: 902
squared error after rounds 1, 2, 3, 5, 10, 20: [902, 808, 734, 649, 484, 317]</div>
  <p>One stump cut the squared error from 1280 to 902, exactly as worked by hand, and each further round removes more: 808, 734, and down to 317 after 20 rounds. The two classic ways to decide what "fix the errors" means came next. <strong>AdaBoost</strong> (Freund and Schapire, 1997) increases the weight of misclassified rows so the next stump concentrates on them, and gives each stump a vote α = ½ ln((1 − ε)/ε) based on its weighted error ε; it is tied to one loss function and gives huge weights to mislabeled rows (<a class="xref" data-note="ml_adaboost">AdaBoost</a>). <strong>Gradient boosting</strong> (Friedman, 2001) generalises the idea: each new tree is fitted to the negative gradient of any differentiable loss (for squared error, the gradient is just the residual, as above; for classification, log loss), and every tree is a small regression tree even when the task is classification (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>, with the shared mechanics in <a class="xref" data-note="ml_boosting">How Boosting Works</a>).</p>
  <p>Boosting's power has a price. Every round fits what is left of the training error, and once the real signal is used up, what is left is noise, so a booster that keeps going will overfit. A forest has no such problem. The code compares validation log loss (a measure of how good the predicted probabilities are; lower is better) as rounds or trees are added:</p>
  <div class="fx" data-lang="py">from common import *
import lightgbm as lgb
from sklearn.metrics import log_loss
gbm = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, verbose=-1, n_jobs=1, random_state=0).fit(Xtr, ytr)
for k in [100, 300, 1000, 3000]:
    print(f"LightGBM after {k:4d} rounds: validation log loss {log_loss(yva, gbm.predict_proba(Xva, num_iteration=k)[:, 1]):.3f}")
rf = RandomForestClassifier(warm_start=True, n_jobs=-1, random_state=0)
for n in [50, 200, 500]:
    rf.set_params(n_estimators=n).fit(Xtr, ytr)              # warm_start: keep old trees, add new ones
    print(f"random forest, {n:3d} trees:   validation log loss {log_loss(yva, rf.predict_proba(Xva)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">LightGBM after  100 rounds: validation log loss 0.364
LightGBM after  300 rounds: validation log loss 0.329
LightGBM after 1000 rounds: validation log loss 0.323
LightGBM after 3000 rounds: validation log loss 0.419
random forest,  50 trees:   validation log loss 0.370
random forest, 200 trees:   validation log loss 0.356
random forest, 500 trees:   validation log loss 0.355</div>
  <p>LightGBM's validation loss improves up to around a thousand rounds (0.323) and then climbs: after 3,000 rounds it is 0.419, worse than after only 100. The random forest's loss only improves and then flattens (0.370, 0.356, 0.355) as trees are added. That is why every booster is trained with <strong>early stopping</strong>: watch the loss on validation rows after each round and stop when it has not improved for, say, 50 rounds.</p>

  <h2 id="mt-modern"><span class="num">06</span>XGBoost, LightGBM and CatBoost</h2>
  <p>Classic gradient boosting works, but it is slow (it tries every threshold of every column), has few built-in brakes, and needs you to prepare missing values and text categories. Three libraries engineered it into the tools most teams use today. All three are still "add small trees fitted to the gradient"; they differ in how each tree is chosen and what data they accept.</p>
  <p><strong>XGBoost</strong> (Chen and Guestrin, 2016) uses both the gradient g and the curvature h (the second derivative) of the loss for every row, like Newton's method instead of plain gradient descent, and puts penalties directly into the tree. The best value for a leaf becomes w* = −G/(H + λ), where G and H are the sums of g and h over the leaf's rows and λ is a penalty that pulls leaf values towards zero; a further penalty γ is charged for every extra leaf, so a split must earn more than γ to be made. A tiny example with squared error, where g = prediction − truth and h = 1: on the diary's seven normal-humidity days with starting prediction 34, the turnouts give g = −10, 12, −8, −6, −12, −4, −14, so G = −42 and H = 7. Without a penalty the leaf value is 42/7 = 6, the plain mean residual; with λ = 1 it is 42/8 = 5.25, a little more cautious. XGBoost also learns, at every split, which side rows with a missing value should go to (the "default direction"), and searches splits in parallel.</p>
  <p><strong>LightGBM</strong> (Microsoft, 2017) is built for speed on large tables. It first buckets each column into at most 255 histogram bins, so a split search tries a few hundred bin edges instead of every distinct value. It grows trees <strong>leaf-wise</strong>, always splitting the single leaf with the largest gain anywhere in the tree, instead of level by level, which reaches a lower loss with the same number of leaves but can overfit small data (its main knob is <code>num_leaves</code>). It also samples rows by gradient size (GOSS: keep the rows with large errors, sample the rest) and bundles sparse columns that are never non-zero together (EFB).</p>
  <p><strong>CatBoost</strong> (Yandex, 2017) is built for categorical columns such as city or product. The obvious way to turn a category into a number is <strong>target encoding</strong>, replacing each city by its average churn rate, but computed on all rows it leaks each row's own label into its feature (a city with one customer gets exactly that customer's answer). CatBoost computes the rate for each row using only rows that come before it in a random ordering (<strong>ordered target statistics</strong>), so no row sees its own label, and it uses <strong>symmetric</strong> trees that ask the same question at every node of a level, which makes prediction very fast. Its defaults are strong, so it needs little tuning.</p>
  <p>In practice all three accept missing values directly, and all three accept a text category without manual encoding, but "accepts" is not the same as "handles well". The code blanks out 20% of the strongest column, <code>f5</code>, and adds a 100-value city column in which 20 cities hold more churners than the rest. Each library is fitted with no preprocessing at all, with early stopping on the validation rows (pinned to one CPU thread), first without the city column and then with it:</p>
  <div class="fx" data-lang="py">from common import *
import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(1)
def prep(A, labels):                   # add a text column "city" with 100 values, blank out 20% of f5
    A = A.copy()
    risky = (labels == 1) &amp; (rng.random(len(A)) &lt; 0.3)  # 30% of churners live in the 20 "risky" cities
    c = np.where(risky, rng.integers(0, 20, len(A)), rng.integers(0, 100, len(A)))
    A["city"] = ("city_" + c.astype(str)).astype(object)
    A.loc[rng.random(len(A)) &lt; 0.2, "f5"] = np.nan
    return A
Atr, Ava, Ate = prep(Xtr, ytr), prep(Xva, yva), prep(Xte, yte)
cats = pd.CategoricalDtype(sorted(set(Atr.city) | set(Ava.city) | set(Ate.city)))

def fit_score(name, cols):
    tr, va, te = Atr[cols].copy(), Ava[cols].copy(), Ate[cols].copy()
    if name == "XGBoost":
        for A in (tr, va, te):
            if "city" in cols: A["city"] = A.city.astype(cats)      # pandas category column
        m = xgb.XGBClassifier(n_estimators=2000, learning_rate=0.05, enable_categorical=True, n_jobs=1,
                              early_stopping_rounds=50, random_state=0)
        m.fit(tr, ytr, eval_set=[(va, yva)], verbose=False)
    elif name == "LightGBM":
        for A in (tr, va, te):
            if "city" in cols: A["city"] = A.city.astype(cats)
        m = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, verbose=-1, n_jobs=1, random_state=0)
        m.fit(tr, ytr, eval_X=va, eval_y=yva, callbacks=[lgb.early_stopping(50, verbose=False)])
    else:                                                           # CatBoost takes the raw text column
        m = CatBoostClassifier(iterations=2000, learning_rate=0.05, early_stopping_rounds=50, verbose=False,
                               cat_features=["city"] if "city" in cols else None, thread_count=1, random_seed=0)
        m.fit(tr, ytr, eval_set=(va, yva))
    return roc_auc_score(yte, m.predict_proba(te)[:, 1])

no_city = [c for c in Atr.columns if c != "city"]
for name in ["XGBoost", "LightGBM", "CatBoost"]:
    print(f"{name:9s} test AUC without city {fit_score(name, no_city):.3f}   with city {fit_score(name, list(Atr.columns)):.3f}")</div>
  <div class="fx" data-lang="text">XGBoost   test AUC without city 0.928   with city 0.889
LightGBM  test AUC without city 0.929   with city 0.918
CatBoost  test AUC without city 0.929   with city 0.934</div>
  <p>The score is AUC, the area under the ROC curve, a ranking score where 1.0 is perfect and 0.5 is a coin. All three train on data that classic scikit-learn gradient boosting would refuse (it rejects NaN and text). Without the city column the three are tied at about 0.93: on ordinary numeric tables the libraries are usually within noise of each other. The city column separates them. It carries real signal, yet XGBoost drops from 0.928 to 0.889 and LightGBM from 0.929 to 0.918, because their native category splits can group the 100 cities in so many ways that they fit noise in the small cities. CatBoost improves to 0.934, because its ordered target statistics turn each city into a leak-free churn rate. So the choice is driven by data size, categorical columns and familiarity, and with many high-cardinality categories CatBoost (or careful out-of-fold target encoding) is the safe default. Each has its own note: <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a>, <a class="xref" data-note="ml_catboost">CatBoost</a>.</p>

  <h2 id="mt-race"><span class="num">07</span>The Whole Family Side by Side</h2>
  <p>Here is the family as one picture. Read it from the top: each arrow is labelled with the weakness that the next member was built to fix. The blue branch attacks variance by averaging independent deep trees; the teal branch attacks bias by adding small trees in sequence; the green box blends finished models of both branches; the dashed bar holds the tools that apply to every member.</p>
  <figure class="viz"><svg viewBox="0 0 760 640" width="760">
<defs><marker id="mt-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="255" y="8" width="250" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="380" y="27" text-anchor="middle" font-size="14" font-weight="700">Decision Trees</text>
<text x="380" y="44" text-anchor="middle" class="tm" font-size="10">entropy · Gini · CART · pruning</text>
<line x1="380" y1="52" x2="380" y2="98" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="392" y="70" class="tr" font-size="10">weakness: high variance</text>
<text x="392" y="85" class="tm" font-size="10">fix: combine many models</text>
<rect x="245" y="100" width="270" height="44" rx="8" class="fv" stroke="currentColor"/>
<text x="380" y="119" text-anchor="middle" font-size="14" font-weight="700">Ensemble Learning: The Idea</text>
<text x="380" y="136" text-anchor="middle" class="tm" font-size="10">Var = ρσ² + (1−ρ)σ²/n · Condorcet</text>
<line x1="310" y1="144" x2="140" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="390" y1="144" x2="420" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="460" y1="144" x2="655" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="200" y="168" text-anchor="end" class="tm" font-size="10">in parallel → cuts variance</text>
<text x="408" y="192" text-anchor="end" class="tm" font-size="10">in sequence → cuts bias</text>
<text x="590" y="166" class="tm" font-size="10">blend different models</text>
<rect x="55" y="210" width="170" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="229" text-anchor="middle" font-size="14" font-weight="700">Bagging &amp; Bootstrap</text>
<text x="140" y="246" text-anchor="middle" class="tm" font-size="10">resample rows · OOB · 63.2%</text>
<rect x="335" y="210" width="170" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="229" text-anchor="middle" font-size="14" font-weight="700">How Boosting Works</text>
<text x="420" y="246" text-anchor="middle" class="tm" font-size="10">F_m = F_m−1 + ν·h_m</text>
<rect x="580" y="210" width="170" height="44" rx="8" class="fg sg" fill-opacity="0.25"/>
<text x="665" y="229" text-anchor="middle" font-size="14" font-weight="700">Stacking &amp; Voting</text>
<text x="665" y="246" text-anchor="middle" class="tm" font-size="10">meta-model on OOF preds</text>
<line x1="140" y1="254" x2="140" y2="300" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="150" y="276" class="tm" font-size="10">+ random features</text>
<text x="150" y="290" class="tm" font-size="10">at every split</text>
<rect x="65" y="302" width="150" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="321" text-anchor="middle" font-size="14" font-weight="700">Random Forest</text>
<text x="140" y="338" text-anchor="middle" class="tm" font-size="10">lower ρ between trees</text>
<line x1="140" y1="346" x2="140" y2="392" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="150" y="368" class="tm" font-size="10">+ random cut-offs,</text>
<text x="150" y="382" class="tm" font-size="10">no bootstrap</text>
<rect x="65" y="394" width="150" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="413" text-anchor="middle" font-size="14" font-weight="700">Extra Trees</text>
<text x="140" y="430" text-anchor="middle" class="tm" font-size="10">even more random, faster</text>
<line x1="420" y1="254" x2="420" y2="300" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="276" class="tm" font-size="10">first answer:</text>
<text x="430" y="290" class="tm" font-size="10">reweight wrong rows</text>
<rect x="345" y="302" width="150" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="321" text-anchor="middle" font-size="14" font-weight="700">AdaBoost</text>
<text x="420" y="338" text-anchor="middle" class="tm" font-size="10">α = ½ ln((1−ε)/ε)</text>
<line x1="420" y1="346" x2="420" y2="392" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="368" class="tm" font-size="10">generalised: fit the</text>
<text x="430" y="382" class="tm" font-size="10">gradient of any loss</text>
<rect x="335" y="394" width="170" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="413" text-anchor="middle" font-size="14" font-weight="700">Gradient Boosting</text>
<text x="420" y="430" text-anchor="middle" class="tm" font-size="10">pseudo-residuals −∂L/∂F</text>
<line x1="395" y1="438" x2="268" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="420" y1="438" x2="420" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="445" y1="438" x2="572" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="318" y="458" text-anchor="end" class="tm" font-size="10">engineered GBM:</text>
<text x="318" y="472" text-anchor="end" class="tm" font-size="10">same idea, faster, safer</text>
<rect x="190" y="492" width="156" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="268" y="511" text-anchor="middle" font-size="14" font-weight="700">XGBoost</text>
<text x="268" y="528" text-anchor="middle" class="tm" font-size="10">w* = −G/(H+λ) · γ</text>
<rect x="348" y="492" width="144" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="511" text-anchor="middle" font-size="14" font-weight="700">LightGBM</text>
<text x="420" y="528" text-anchor="middle" class="tm" font-size="10">histograms · leaf-wise</text>
<rect x="494" y="492" width="156" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="572" y="511" text-anchor="middle" font-size="14" font-weight="700">CatBoost</text>
<text x="572" y="528" text-anchor="middle" class="tm" font-size="10">ordered TS · oblivious</text>
<path d="M215 330 C 280 360, 300 395, 335 410" fill="none" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.7" marker-end="url(#mt-fa)"/>
<text x="296" y="360" class="tm" font-size="10">borrows row/column</text>
<text x="296" y="373" class="tm" font-size="10">subsampling</text>
<path d="M665 254 L665 470 L652 500" fill="none" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.7"/>
<text x="657" y="448" text-anchor="end" class="tm" font-size="10">blends any models,</text>
<text x="657" y="461" text-anchor="end" class="tm" font-size="10">e.g. RF + LightGBM</text>
<rect x="20" y="566" width="720" height="66" rx="8" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.6"/>
<text x="380" y="582" text-anchor="middle" class="tm" font-size="10">tools that apply to every model above</text>
<rect x="110" y="590" width="250" height="34" rx="7" class="fs" stroke="currentColor"/>
<text x="235" y="612" text-anchor="middle" font-size="13" font-weight="700">Feature Importance &amp; SHAP</text>
<rect x="400" y="590" width="250" height="34" rx="7" class="fs" stroke="currentColor"/>
<text x="525" y="612" text-anchor="middle" font-size="13" font-weight="700">Tuning &amp; Production</text>
</svg><figcaption>The family tree of the Tree-Based Models group: every box is one note. Solid arrows: "was built from / fixes the weakness of". Dashed arrows: ideas that cross branches. Blue = bagging branch (cuts variance), teal = boosting branch (cuts bias), green = blending; the dashed bar holds tools for the whole family.</figcaption></figure>
  <p>The last two boxes deserve one sentence each. <strong>Stacking and voting</strong> blend different models: a vote averages them with a fixed rule, and a stack trains a small second-level model on their out-of-fold predictions to learn whom to trust (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>). <strong>Explaining and tuning</strong> apply to every member: hundreds of trees cannot be read aloud, so importance scores and SHAP values recover the "why" (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>), and a few knobs (learning rate, tree size, leaf size, sampling) do most of the tuning work (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>).</p>
  <p>Now every member on the same 12,000 training customers, scored on the same 5,000 test customers. The boosters use learning rate 0.05 with early stopping on the validation rows; everything else is close to its defaults, so this is a fair out-of-the-box comparison, not a tuned contest. The three boosting libraries run on one CPU thread each while the forests use all cores, and the times come from a busy shared machine, so treat them as rough ratios:</p>
  <div class="fx" data-lang="py">from common import *
import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (BaggingClassifier, ExtraTreesClassifier, AdaBoostClassifier,
                              GradientBoostingClassifier, HistGradientBoostingClassifier, VotingClassifier)
from sklearn.metrics import roc_auc_score
def run(name, make, fit=lambda m: m.fit(Xtr, ytr)):
    t0 = time.time(); m = make(); fit(m); sec = time.time() - t0
    p = m.predict_proba(Xte)[:, 1]
    print(f"{name:30s} test acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.3f}  fit {sec:5.1f}s")
run("Logistic regression (baseline)", lambda: make_pipeline(StandardScaler(), LogisticRegression()))
run("Decision tree, unlimited", lambda: DecisionTreeClassifier(random_state=0))
run("Decision tree, ccp_alpha=3e-4", lambda: DecisionTreeClassifier(ccp_alpha=3e-4, random_state=0))
run("Bagging, 100 trees", lambda: BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0))
run("Random forest, 300 trees", lambda: RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0))
run("Extra Trees, 300 trees", lambda: ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0))
run("AdaBoost, 300 stumps", lambda: AdaBoostClassifier(n_estimators=300, random_state=0))
run("Gradient boosting (sklearn)", lambda: GradientBoostingClassifier(n_estimators=300, max_depth=3, random_state=0))
run("HistGradientBoosting + ES", lambda: HistGradientBoostingClassifier(max_iter=2000, learning_rate=0.05,
    early_stopping=True, n_iter_no_change=50, random_state=0))
run("XGBoost + ES", lambda: xgb.XGBClassifier(n_estimators=2000, learning_rate=0.05, max_depth=6, subsample=0.8,
    colsample_bytree=0.8, early_stopping_rounds=50, n_jobs=1, random_state=0),
    lambda m: m.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False))
run("LightGBM + ES", lambda: lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, subsample=0.8, subsample_freq=1,
    colsample_bytree=0.8, verbose=-1, n_jobs=1, random_state=0),
    lambda m: m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(50, verbose=False)]))
run("CatBoost + ES", lambda: CatBoostClassifier(iterations=2000, learning_rate=0.05, depth=6,
    early_stopping_rounds=50, verbose=False, thread_count=1, random_seed=0), lambda m: m.fit(Xtr, ytr, eval_set=(Xva, yva)))
run("Soft vote: RF + ET + LightGBM", lambda: VotingClassifier([
    ("rf", RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
    ("et", ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
    ("lgb", lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1, n_jobs=1, random_state=0))], voting="soft"))</div>
  <div class="fx" data-lang="text">Logistic regression (baseline) test acc 0.596  AUC 0.629  fit   0.0s
Decision tree, unlimited       test acc 0.778  AUC 0.778  fit   0.2s
Decision tree, ccp_alpha=3e-4  test acc 0.814  AUC 0.869  fit   0.2s
Bagging, 100 trees             test acc 0.870  AUC 0.933  fit  17.2s
Random forest, 300 trees       test acc 0.877  AUC 0.936  fit   8.4s
Extra Trees, 300 trees         test acc 0.869  AUC 0.935  fit   3.5s
AdaBoost, 300 stumps           test acc 0.655  AUC 0.710  fit   5.9s
Gradient boosting (sklearn)    test acc 0.836  AUC 0.908  fit  17.6s
HistGradientBoosting + ES      test acc 0.872  AUC 0.935  fit   2.5s
XGBoost + ES                   test acc 0.872  AUC 0.935  fit   1.6s
LightGBM + ES                  test acc 0.874  AUC 0.936  fit   1.6s
CatBoost + ES                  test acc 0.874  AUC 0.938  fit   5.5s
Soft vote: RF + ET + LightGBM  test acc 0.878  AUC 0.940  fit  14.8s</div>
  <p>Read the table top to bottom and you are reading the family story. The straight line barely beats a coin. One unlimited tree jumps far ahead; pruning adds a few points and a big AUC improvement (an unpruned tree's probabilities are all 0 or 1, so it ranks customers poorly). Averaging many trees adds another six points or so: bagging, the random forest and Extra Trees are within a point of each other, with Extra Trees the fastest of the three. AdaBoost with stumps is weak here, because one-question trees cannot express this pattern's interactions and 300 rounds are not enough. Classic scikit-learn gradient boosting with 300 depth-3 trees and no early stopping is decent but slow. The four modern boosters with early stopping (HistGradientBoosting, XGBoost, LightGBM, CatBoost) all land within a few thousandths of AUC of each other. Finally, a soft vote of a forest, Extra Trees and LightGBM edges past every single member, because forests and boosters make different mistakes, but the gain over the best single model is small.</p>
  <p>Do not read a table like this as "model X is best". On another dataset the order changes, and a little tuning moves every row. What transfers is the shape: one tree &lt; pruned tree &lt; ensembles; ensembles within a point or two of each other; and good features and honest validation matter more than the choice of library.</p>

  <h2 id="mt-limits"><span class="num">08</span>What No Tree Model Can Do</h2>
  <p>Every tree predicts with leaf values learnt from training rows, and every ensemble's prediction is an average or sum of such values. So no tree model can predict outside the range of targets it saw, however well tuned. A housing example makes it concrete: the price of a flat is a straight line in its size (₹30 lakh per 100 sq ft plus noise), the models train on flats of up to 1,000 sq ft, and then we ask about flats of 1,500 and 2,000 sq ft:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 300).reshape(-1, 1)          # flat size, in hundreds of sq ft (0-1000)
y = 30 * x[:, 0] + rng.normal(0, 10, 300)           # price in lakh: a straight line + noise
new = np.array([[5.0], [10.0], [15.0], [20.0]])     # 15 and 20 are bigger than anything seen
print("true values:        ", (30 * new[:, 0]).tolist())
for name, m in {"linear regression": LinearRegression(),
                "random forest": RandomForestRegressor(n_estimators=200, random_state=0),
                "LightGBM": lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, verbose=-1, n_jobs=1)}.items():
    m.fit(x, y)
    print(f"{name:19s} predicts {m.predict(new).round(0).tolist()}")</div>
  <div class="fx" data-lang="text">true values:         [150.0, 300.0, 450.0, 600.0]
linear regression   predicts [150.0, 300.0, 449.0, 598.0]
random forest       predicts [148.0, 296.0, 296.0, 296.0]
LightGBM            predicts [154.0, 292.0, 292.0, 292.0]</div>
  <p>Inside the training range (500 and 1,000 sq ft) all three models are close to the truth. Outside it, linear regression keeps going (449 and 598 against the true 450 and 600), while the random forest is stuck at 296 and LightGBM at 292 for both larger flats: the same answer as for the biggest flat they had seen. Beyond the largest x in training, every tree sends the row to its right-most leaves, so the prediction freezes. For targets that grow over time (prices, sales, users), predict the change or the ratio instead of the level, add a trend from a linear model, or use LightGBM's linear trees (<code>linear_tree=True</code>); <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> shows this in practice.</p>
  <p>Three related limits follow from the same shape. A smooth or straight relationship is approximated by a staircase of flat steps, which wastes data, so with few rows and a truly linear effect, plain linear regression wins. Every split is "one column ≤ threshold", so a diagonal boundary such as "income &gt; loan instalment" needs many steps, while an engineered column (income − instalment) fixes it in one split. And splits on single pixels or single words do not capture shapes or meaning, so raw images, audio and text belong to neural networks (<a class="xref" data-note="dl_foundations">NN Foundations</a>), although trees work well on features extracted from them.</p>

  <h2 id="mt-choose"><span class="num">09</span>How to Choose</h2>
  <p>Accuracy is only one column of a real decision. Speed, missing values, text categories, interpretability and tuning effort decide just as often. This table summarises the family on all of them:</p>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Model</th><th>Mainly fights</th><th>Training speed</th><th>Missing values</th><th>Text categories</th><th>Tuning effort</th><th>Typical use</th></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision tree</a></td><td>(low bias, very high variance)</td><td>fast</td><td>sklearn ≥ 1.3 learns a side for NaN</td><td>encode</td><td>low (depth, leaf size, α)</td><td>readable rules; building block</td></tr>
    <tr><td><a class="xref" data-note="ml_bagging">Bagging</a></td><td>variance</td><td>n × one tree, parallel</td><td>as its trees</td><td>encode</td><td>low</td><td>stabilising any unstable model</td></tr>
    <tr><td><a class="xref" data-note="ml_rf">Random forest</a></td><td>variance (lower ρ)</td><td>parallel; faster than bagging</td><td>recent sklearn native</td><td>encode</td><td>very low</td><td>first baseline on any table; noisy labels</td></tr>
    <tr><td><a class="xref" data-note="ml_extratrees">Extra Trees</a></td><td>variance (lowest ρ)</td><td>fastest of the branch</td><td>recent sklearn native</td><td>encode</td><td>very low</td><td>fast strong baseline, many columns</td></tr>
    <tr><td><a class="xref" data-note="ml_adaboost">AdaBoost</a></td><td>bias</td><td>sequential; fast with stumps</td><td>impute first</td><td>encode</td><td>low</td><td>clean, low-noise data; teaching</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient boosting (classic)</a></td><td>bias</td><td>slow (exact splits)</td><td>impute first</td><td>encode</td><td>medium–high</td><td>small data, reference implementation</td></tr>
    <tr><td>HistGradientBoosting (sklearn)</td><td>bias</td><td>fast (histograms)</td><td>native</td><td>native</td><td>medium</td><td>boosting without extra libraries</td></tr>
    <tr><td><a class="xref" data-note="ml_xgboost">XGBoost</a></td><td>bias; λ, γ, sampling for variance</td><td>fast; GPU</td><td>native (default direction)</td><td>native or encode</td><td>medium–high</td><td>mature all-rounder, production</td></tr>
    <tr><td><a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td>bias; leaf-wise can raise variance</td><td>usually fastest; low memory</td><td>native</td><td>native</td><td>medium–high (num_leaves)</td><td>large tables, ranking</td></tr>
    <tr><td><a class="xref" data-note="ml_catboost">CatBoost</a></td><td>bias; ordered boosting limits leakage</td><td>slower per tree; fast prediction</td><td>native</td><td>best (ordered target statistics)</td><td>low (strong defaults)</td><td>many categorical columns</td></tr>
    <tr><td><a class="xref" data-note="ml_stacking">Stacking / voting</a></td><td>combines both</td><td>sum of members (+ k folds)</td><td>as members</td><td>as members</td><td>high</td><td>competitions; the last fraction of a point</td></tr>
  </table></div>
  <p>Turning these facts into one choice is easiest as a short sequence of questions. Start at the top of the guide below and stop at the first "yes". In practice you often run the first two or three candidates and keep the simplest one that is not clearly worse on validation.</p>
  <figure class="viz"><svg viewBox="0 0 700 420" width="700">
<defs><marker id="mt-ch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="35" text-anchor="middle" font-size="12.5">Must a person read and audit every rule?</text>
<line x1="400" y1="30" x2="460" y2="30" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="24" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="10" width="220" height="40" rx="8" class="fg sg"/><text x="572" y="35" text-anchor="middle" font-size="12.5">Pruned decision tree</text>
<line x1="210" y1="50" x2="210" y2="78" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="68" class="tr" font-size="11">no</text>
<rect x="20" y="80" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="105" text-anchor="middle" font-size="12.5">First model on a new table? (baseline)</text>
<line x1="400" y1="100" x2="460" y2="100" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="94" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="80" width="220" height="40" rx="8" class="fb sb" fill-opacity="0.25"/><text x="572" y="105" text-anchor="middle" font-size="12.5">Random forest (defaults)</text>
<line x1="210" y1="120" x2="210" y2="148" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="138" class="tr" font-size="11">no</text>
<rect x="20" y="150" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="175" text-anchor="middle" font-size="12.5">Many text categories, or little time to tune?</text>
<line x1="400" y1="170" x2="460" y2="170" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="164" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="150" width="220" height="40" rx="8" class="ft st" fill-opacity="0.25"/><text x="572" y="175" text-anchor="middle" font-size="12.5">CatBoost</text>
<line x1="210" y1="190" x2="210" y2="218" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="208" class="tr" font-size="11">no</text>
<rect x="20" y="220" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="245" text-anchor="middle" font-size="12.5">Very noisy / mislabeled targets?</text>
<line x1="400" y1="240" x2="460" y2="240" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="234" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="220" width="220" height="40" rx="8" class="fb sb" fill-opacity="0.25"/><text x="572" y="245" text-anchor="middle" font-size="12.5">Random forest / Extra Trees</text>
<line x1="210" y1="260" x2="210" y2="288" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="278" class="tr" font-size="11">no</text>
<rect x="20" y="290" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="315" text-anchor="middle" font-size="12.5">Want the best accuracy on a large table?</text>
<line x1="400" y1="310" x2="460" y2="310" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="304" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="290" width="220" height="40" rx="8" class="ft st" fill-opacity="0.25"/><text x="572" y="309" text-anchor="middle" font-size="12.5">LightGBM / XGBoost</text><text x="572" y="324" text-anchor="middle" class="tm" font-size="10.5">+ early stopping, then tune</text>
<line x1="210" y1="330" x2="210" y2="358" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="348" class="tr" font-size="11">no / still not enough</text>
<rect x="20" y="360" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="385" text-anchor="middle" font-size="12.5">Last fraction of a point matters (competition)?</text>
<line x1="400" y1="380" x2="460" y2="380" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="374" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="360" width="220" height="40" rx="8" class="fg sg"/><text x="572" y="385" text-anchor="middle" font-size="12.5">Blend RF + boosters</text>
</svg><figcaption>A first-pass decision guide. In practice you often run the first two or three candidates and keep the simplest one that is not clearly worse on validation.</figcaption></figure>
  <p>Walk through it. If a person must read and audit every rule (a regulator, a clinical protocol), use a single pruned decision tree and accept lower accuracy; if "explainable" only means a reason for each decision, a strong model plus SHAP is usually better. For the first model on any new table, use a random forest with default settings: it is hard to break, needs almost no tuning, and gives an honest baseline and an out-of-bag score for free. If the table has many text categories (city, plan, product) or you have little time to tune, use CatBoost. If the labels are very noisy, prefer a random forest or Extra Trees and avoid AdaBoost, which piles weight onto mislabeled rows. If you want the best accuracy on a large clean table, use LightGBM (fastest) or XGBoost (most mature) with a learning rate around 0.05 and early stopping, then tune the tree size and leaf size. Only when the last fraction of a point matters, as in a competition, blend a forest with one or two boosters. Two constraints can override all of this: a hard latency budget (prefer fewer, shallower trees; a 300-tree full-depth forest can take tens of megabytes and milliseconds per request), and a target that must be predicted outside its training range (section 08). Some typical scenarios:</p>
  <table class="tbl">
    <tr><th>Scenario</th><th>Pick</th><th>Why</th></tr>
    <tr><td>Bank credit approval with reason codes</td><td>XGBoost / LightGBM with monotone constraints + SHAP, or a pruned tree</td><td>accuracy plus a reason per applicant; "more debt never lowers risk" enforced</td></tr>
    <tr><td>E-commerce churn with 300 product categories</td><td>CatBoost</td><td>many categories without target leakage</td></tr>
    <tr><td>Fraud, 1 positive in 1,000, 50 million rows</td><td>LightGBM with class weights, PR-AUC, tuned threshold</td><td>speed on huge data; imbalance handling</td></tr>
    <tr><td>Hospital readmission, 3,000 rows, doctors want rules</td><td>pruned tree or a small forest</td><td>small data, explainability; leaf-wise boosting would overfit</td></tr>
    <tr><td>Sales forecast for 10,000 shops with lag features</td><td>one LightGBM model over all shops, predicting change</td><td>many series, fast retraining; avoids the extrapolation trap</td></tr>
    <tr><td>Search or recommendation ranking</td><td>LightGBM / XGBoost ranker</td><td>native ranking objectives (<a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>)</td></tr>
  </table>
  <p>One rule sits above the guide: if the fancier model does not clearly beat the simpler one on validation, keep the simpler one.</p>

  <h2 id="mt-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The first mistake is believing that random forests and boosters overfit in the same way. More trees in a forest only average more, which is slower but never worse; more rounds in a booster keep fitting the remaining error, which eventually is noise. Section 05 showed both curves on the same data: the forest's validation loss only flattens, the booster's climbs after its best round. Always train boosters with early stopping, and do not waste time "tuning" the number of trees in a forest beyond "enough".</p>
  <p>The second is reporting a model's built-in impurity importance (MDI, the <code>feature_importances_</code> attribute) as "what drives churn". It is computed on training data and favours columns with many distinct values, because a deep tree can always find a lucky threshold among thousands of values. Compare it with permutation importance, which shuffles one column on validation data and measures how much the score drops:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr, ytr)
mdi = pd.Series(rf.feature_importances_, index=Xtr.columns)
perm = pd.Series(permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=-1).importances_mean,
                 index=Xtr.columns)
for col in ["f5", "row_noise", "coin_noise"]:
    print(f"{col:10s} MDI {mdi[col]:.3f} (rank {int(mdi.rank(ascending=False)[col])} of 14)"
          f"   permutation {perm[col]:+.4f} (rank {int(perm.rank(ascending=False)[col])} of 14)")</div>
  <div class="fx" data-lang="text">f5         MDI 0.139 (rank 1 of 14)   permutation +0.1928 (rank 1 of 14)
row_noise  MDI 0.036 (rank 11 of 14)   permutation +0.0041 (rank 9 of 14)
coin_noise MDI 0.005 (rank 14 of 14)   permutation +0.0005 (rank 13 of 14)</div>
  <p>By MDI, the pure-noise column <code>row_noise</code>, with 20,000 distinct values, gets about seven times the importance of the pure-noise <code>coin_noise</code> with 2 values (0.036 against 0.005), and ranks above some genuine columns. Permutation importance on validation rows gives both noise columns almost nothing (accuracy drops of 0.004 and 0.0005) against 0.19 for the real feature <code>f5</code>. Use permutation importance or SHAP for decisions (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>), and remember that both explain the model, not the real world.</p>
  <p>Four more mistakes need no code. Building an ensemble of look-alike members (same model, same rows, same settings) gains nothing, because the gain comes from different mistakes; bootstrap rows, random columns, random thresholds and blending different families all exist to create them. Picking the library before checking the data is a common waste: on our data every modern ensemble landed within about a point of the others, while leakage, a wrong validation split or a missing feature costs far more. Naive target encoding and in-sample stacking both let a row see its own label: a one-customer city gets that customer's answer as its feature, and a meta-model trained on near-perfect in-sample predictions trusts the wrong member; use ordered statistics (CatBoost), cross-fitting, and out-of-fold predictions. And expecting any tree model to extrapolate leads to frozen forecasts (section 08); model the change, or add a trend.</p>

  <h2 id="mt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The family in one chain</h3>
  <table class="tbl">
    <tr><th>Model</th><th>What it adds</th><th>Fixes</th><th>Leaves open</th></tr>
    <tr><td>Decision tree</td><td>greedy impurity-lowering splits</td><td>straight-line models miss bends and interactions</td><td>high variance, memorises</td></tr>
    <tr><td>Bagging</td><td>bootstrap rows + average deep trees; out-of-bag score</td><td>variance</td><td>trees still alike (high ρ)</td></tr>
    <tr><td>Random forest</td><td>+ random columns per split</td><td>correlation between trees</td><td>bias untouched</td></tr>
    <tr><td>Extra Trees</td><td>+ random thresholds, all rows</td><td>even lower ρ, faster</td><td>no learning from mistakes</td></tr>
    <tr><td>AdaBoost</td><td>reweight wrong rows; α = ½ ln((1 − ε)/ε)</td><td>bias, with stumps</td><td>one loss; noise-sensitive</td></tr>
    <tr><td>Gradient boosting</td><td>each tree fits −∂L/∂F of any loss</td><td>any loss, regression or classes</td><td>slow, few brakes</td></tr>
    <tr><td>XGBoost</td><td>gradient + curvature, w* = −G/(H + λ), γ per leaf, NaN direction</td><td>better steps, built-in brakes</td><td>heavy on huge data</td></tr>
    <tr><td>LightGBM</td><td>histograms, leaf-wise growth, GOSS, EFB</td><td>speed on big tables</td><td>overfits small data</td></tr>
    <tr><td>CatBoost</td><td>ordered target statistics, symmetric trees</td><td>categories without leakage</td><td>slower per tree</td></tr>
    <tr><td>Stacking / voting</td><td>blend different models (out-of-fold for stacking)</td><td>the last fraction of a point</td><td>cost, complexity</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Gini</td><td>1 − Σ pᵢ²</td><td>diary [9, 5]: 0.459</td></tr>
    <tr><td>Split gain</td><td>i(parent) − Σ (nₖ/n) i(childₖ)</td><td>humidity: 0.459 − 0.367 = 0.092</td></tr>
    <tr><td>Variance of an average</td><td>ρσ² + (1 − ρ)σ²/n</td><td>ρ = 0.5, n = 10: 0.55; floor 0.5</td></tr>
    <tr><td>Bootstrap</td><td>P(row left out) = (1 − 1/n)ⁿ → 1/e ≈ 0.368</td><td>about 63% of rows in each sample</td></tr>
    <tr><td>Random forest</td><td>m ≈ √d columns per split (classification)</td><td></td></tr>
    <tr><td>Boosting</td><td>F_m = F_m−1 + ν · h_m</td><td>turnout: 1280 → 902 after one stump × 0.5</td></tr>
    <tr><td>XGBoost leaf</td><td>w* = −G / (H + λ)</td><td>G = −42, H = 7, λ = 1: 5.25</td></tr>
  </table>
  <h3>Bagging branch vs boosting branch</h3>
  <table class="tbl">
    <tr><th></th><th>Bagging, RF, Extra Trees</th><th>AdaBoost, GBM, XGBoost, LightGBM, CatBoost</th></tr>
    <tr><td>Trees built</td><td>independently, in parallel</td><td>in sequence, each on the team's errors</td></tr>
    <tr><td>Each tree</td><td>deep: low bias, high variance</td><td>shallow: high bias, low variance</td></tr>
    <tr><td>Mainly reduces</td><td>variance</td><td>bias</td></tr>
    <tr><td>Too many trees</td><td>harmless, just slower</td><td>overfits → early stopping</td></tr>
    <tr><td>Noisy labels</td><td>robust</td><td>can chase noise (AdaBoost most)</td></tr>
    <tr><td>Tuning effort</td><td>low</td><td>moderate to high</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
rf  = RandomForestClassifier(n_estimators=300, n_jobs=-1, oob_score=True)
et  = ExtraTreesClassifier(n_estimators=300, n_jobs=-1)
hgb = HistGradientBoostingClassifier(learning_rate=0.05, max_iter=2000, early_stopping=True)
xg  = xgb.XGBClassifier(n_estimators=2000, learning_rate=0.05, early_stopping_rounds=50)
lg  = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, num_leaves=31)
cb  = CatBoostClassifier(iterations=2000, learning_rate=0.05, cat_features=["city"], early_stopping_rounds=50)
xg.fit(X_tr, y_tr, eval_set=[(X_va, y_va)])                    # early stopping on validation rows
lg.fit(X_tr, y_tr, eval_X=X_va, eval_y=y_va, callbacks=[lgb.early_stopping(50)])</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Forests do not overfit by adding trees; boosters do: always early-stop boosters.</li>
    <li>Averaging cuts variance, never bias; boosting cuts bias.</li>
    <li>No tree model extrapolates beyond the target range it saw.</li>
    <li>MDI importance is biased to many-valued columns; use permutation importance or SHAP.</li>
    <li>Target encoding and stacking must be out-of-fold.</li>
    <li>Modern boosters are usually within noise of each other; data and validation matter more.</li>
  </ul>

  <h2 id="mt-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why do tree-based models work so well on tabular data?</summary><div class="qa-body">They learn bends and interactions automatically by asking one-column questions in sequence, need no feature scaling (only the order of values matters), handle mixed numeric and categorical columns, are robust to outliers in the inputs, and modern libraries handle missing values natively. Ensembles of trees then remove the single tree's high variance (forests) or bias (boosting).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Tell the story of the tree family from a single tree to CatBoost.</summary><div class="qa-body">A decision tree learns rules by greedy impurity reduction but has high variance. Bagging averages trees grown on bootstrap samples to cut that variance, and the random forest also randomises the columns at each split so the trees are less correlated. Boosting instead adds small trees in sequence, each fitted to the team's remaining errors, which cuts bias: AdaBoost reweights wrong rows, gradient boosting fits the loss gradient. XGBoost, LightGBM and CatBoost are engineered gradient boosting: second-order steps and penalties, histograms and leaf-wise growth, and leak-free categorical handling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gini vs entropy for splitting: does it matter?</summary><div class="qa-body">Gini (1 − Σp²) is the chance two random rows disagree; entropy (−Σ p log₂ p) is the average surprise. Their curves have almost the same shape, so they choose the same splits nearly always and give practically the same accuracy. Gini avoids logarithms and is scikit-learn's default; tune depth and leaf size instead of the criterion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging vs boosting: what is the difference?</summary><div class="qa-body">Bagging trains deep trees independently on bootstrap samples and averages them, which reduces variance; it trains in parallel, is robust to noise, and more trees never overfit. Boosting trains shallow trees sequentially, each on the current team's errors, and adds them up, which reduces bias; it is sequential, more sensitive to noisy labels, and overfits with too many rounds, so it needs a learning rate and early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a random forest reduce variance more than plain bagging?</summary><div class="qa-body">The variance of an average of n trees is ρσ² + (1−ρ)σ²/n, so with many trees the floor ρσ² dominates. In bagging a strong column wins the top split in most trees, so the trees stay correlated. Restricting each split to a random subset of columns (about √d) gives other columns a chance, lowers ρ and therefore lowers the floor, even though each tree is slightly weaker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the out-of-bag score?</summary><div class="qa-body">Each bootstrap sample leaves out about 37% of the rows ((1 − 1/n)ⁿ → 1/e). Each row can therefore be predicted by the trees that did not see it, and the accuracy of those predictions is the out-of-bag score, a free estimate of test performance without a separate validation set (<code>oob_score=True</code> in scikit-learn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do Extra Trees differ from a random forest?</summary><div class="qa-body">Besides sampling columns at each split, Extra Trees draw the cut-off for each candidate column at random instead of searching for the best one, and by default train every tree on all rows rather than a bootstrap sample. Each tree is a little weaker, but the trees are less correlated and training is faster because there is no threshold search; accuracy is usually similar to a random forest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a random forest overfit? Can boosting?</summary><div class="qa-body">Adding trees to a forest cannot cause overfitting; the error curve flattens. Individual deep trees do overfit, and a forest can still overfit through leakage or too-small leaves on noisy data, but not through the number of trees. Boosting overfits as rounds increase, because later trees fit noise; early stopping on validation data, a small learning rate, shallow trees and subsampling control it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the learning rate in gradient boosting, and how does it interact with the number of trees?</summary><div class="qa-body">The learning rate ν shrinks each new tree's contribution: F_m = F_m−1 + ν·h_m. A smaller ν needs more trees to reach the same training fit but usually generalises better, because each step is cautious. The standard recipe is to fix a small ν (0.05 or so) and let early stopping choose the number of trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does gradient boosting use regression trees even for classification?</summary><div class="qa-body">Each tree is fitted to the negative gradient of the loss for every row, which is a real number (for log loss, y − p), not a class. So each tree is a small regression tree whose leaf values are added to the running log-odds, and the final sum is turned into a probability with the sigmoid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does XGBoost add to classic gradient boosting?</summary><div class="qa-body">It uses a second-order (Newton) step with both gradients g and curvatures h, giving leaf values w* = −G/(H + λ); it builds penalties into the objective (λ on leaf values, α for L1, γ per extra leaf), so splits must pay for themselves; it learns a default direction for missing values at every split; and it adds column and row subsampling, parallel and histogram split search, and GPU support.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does XGBoost handle missing values?</summary><div class="qa-body">During training, for every candidate split it tries sending all rows with a missing value to the left child and then to the right child, and keeps the direction with the higher gain. That learned default direction is stored in the node, and at prediction time missing values follow it. Missingness itself can therefore become a signal, with no imputation needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is LightGBM fast, and what is its main risk?</summary><div class="qa-body">It buckets each column into at most 255 histogram bins, so split search is over bins rather than every value; it samples rows by gradient size (GOSS) and bundles mutually exclusive sparse columns (EFB). Its leaf-wise growth reaches low loss quickly but can grow deep, narrow branches that overfit small datasets, so num_leaves and min_data_in_leaf must be controlled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does CatBoost's ordered target statistics solve?</summary><div class="qa-body">Target encoding a category with its mean target on all rows leaks each row's own label into its feature (a city with one customer gets that customer's answer), so the model overfits. CatBoost orders the rows randomly and encodes each row using only the rows before it, so no row sees its own label; ordered boosting applies the same idea to the residuals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest or gradient boosting: which do you try first?</summary><div class="qa-body">A random forest first, as a fast, robust, nearly tuning-free baseline with an out-of-bag score. Then a gradient booster with early stopping, which usually wins on large, clean tables with interactions. If the booster does not clearly beat the forest on validation, keep the forest; with many categorical columns, try CatBoost early.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can tree models extrapolate? What do you do about it?</summary><div class="qa-body">No. A tree's output is one of its leaf values and an ensemble's is an average or sum of them, so predictions freeze beyond the range seen in training (in our example, a forest predicted 296 for flats of both 1,500 and 2,000 sq ft). Predict the change or ratio instead of the level, add a trend from a linear model, or use linear trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is impurity-based feature importance misleading, and what do you use instead?</summary><div class="qa-body">It is computed on training data and favours columns with many distinct values, because deep trees find lucky thresholds among them (pure noise with 20,000 values outranks noise with 2 values), and correlated columns split importance between them. Permutation importance on validation data or SHAP values are more reliable, and both still explain the model rather than cause and effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A colleague says "XGBoost is always the best model for tabular data". How do you respond?</summary><div class="qa-body">Gradient-boosted trees are usually among the best on tables, but LightGBM, CatBoost and often a random forest are within noise of XGBoost, as in our side-by-side run. The right choice depends on data size, categorical columns, latency, tuning time and the team's familiarity, and good features and honest validation matter far more than the library.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your forest and your booster score the same. Would blending them help?</summary><div class="qa-body">Probably a little, because they make different mistakes: averaged deep independent trees versus sequential shallow trees. In our run a soft vote of a forest, Extra Trees and LightGBM edged past every member, but by a small margin. Whether that is worth serving and maintaining several models depends on the value of the extra accuracy against latency and complexity.</div></details>
</main>
`
});
