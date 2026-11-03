// notes/ml/ml_stacking.js — Stacking & Voting
Object.assign(TOPIC_CONTENT, {
  "ml_stacking": `<main>
  <h1>Stacking &amp; Voting</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Stacking &amp; Voting</span></div>
  <p class="lead">Bagging builds many copies of one algorithm side by side, and boosting builds many copies of one algorithm one after another. This note is about the third way to build a team: take several <em>different</em> models that are each already good, such as a random forest, a gradient booster and a nearest-neighbours model, and combine their answers. The simplest combination is a <strong>vote</strong>; the cleverer one, <strong>stacking</strong>, trains a second model to learn how much to trust each member, and it has one famous trap that silently ruins it if you do it the obvious way. In real work this is how many competition-winning solutions are built, and also a common way to waste compute, so we will be honest about when it pays. The running example is the same as in the rest of the tree notes: the cricket captain's 14-day diary, small enough to work every vote and every prediction by hand, followed by a 20,000-customer churn table that shows the same ideas at a realistic size.</p>

  <h2 id="stk-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Stacking &amp; Voting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Voting</div>
        <ul>
          <li><b>Hard</b>: majority of the members' labels</li>
          <li><b>Soft</b>: average of their probabilities</li>
          <li><b>Weighted</b>: trust some members more; pick weights on validation</li>
          <li>Beats only the <i>average</i> member, not always the best</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stacking</div>
        <ul>
          <li>Level 0: different base models</li>
          <li>Level 1: a meta-learner trained on their predictions</li>
          <li>Usually logistic or ridge regression: learns weights and calibration</li>
          <li>Robust to weak or duplicate members</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The leak and its fix</div>
        <ul>
          <li>Predictions on a member's own training rows are too good</li>
          <li>Meta-learner then trusts the biggest over-fitter</li>
          <li>Fix: <b>out-of-fold</b> predictions (k-fold CV)</li>
          <li><b>Blending</b>: one holdout instead of k folds</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it pays</div>
        <ul>
          <li>Members both good and different (low correlation)</li>
          <li>Costs: k + 1 fits per member, every member at prediction time</li>
          <li>Extra levels rarely help outside competitions</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="stk-vote"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Voting: Hard, Soft and Weighted</span><span class="rm-sub">the simplest way to combine finished models</span></div></div>
      <div class="rm-item rm-done" data-target="stk-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Stacking: Learning the Combiner</span><span class="rm-sub">a second model that learns whom to trust</span></div></div>
      <div class="rm-item rm-done" data-target="stk-leak"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Leak in Naive Stacking</span><span class="rm-sub">why in-sample predictions ruin the stack</span></div></div>
      <div class="rm-item rm-done" data-target="stk-oof"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Out-of-Fold Predictions</span><span class="rm-sub">an honest prediction for every training row</span></div></div>
      <div class="rm-item rm-done" data-target="stk-blend"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Blending</span><span class="rm-sub">the cheaper one-holdout version</span></div></div>
      <div class="rm-item rm-done" data-target="stk-sk"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Stacking in scikit-learn</span><span class="rm-sub">parameters, passthrough, a regression stack</span></div></div>
      <div class="rm-item rm-done" data-target="stk-gain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When Combining Pays</span><span class="rm-sub">diversity, extra levels and the costs</span></div></div>
      <div class="rm-item rm-done" data-target="stk-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">leaks, missing probabilities, false wins</span></div></div>
      <div class="rm-item rm-done" data-target="stk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, code, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="stk-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about combining models</span></div></div>
    </div>
  </div>

  <h2 id="stk-vote"><span class="num">01</span>Voting: Hard, Soft and Weighted</h2>
  <p>Suppose you have already trained a few good models for the same job, and they were built in different ways, so each one is right on some days the others get wrong. Picking one and throwing the rest away wastes what the others know. The question of this whole note is how to use them together, and the simplest answer is to let them <strong>vote</strong>: ask every model for its answer and combine the answers with a fixed rule. A model that combines other models in this way is called an <strong>ensemble</strong>, and the models inside it are its <strong>members</strong>.</p>
  <p>Think of a hiring panel of three interviewers. In one kind of panel each interviewer just says "hire" or "no hire" and the majority wins. In another, each gives a score between 0 and 1, the scores are averaged, and the candidate is hired if the average is above one half. In a third, the senior interviewer, who has been right more often in the past, counts double. These are exactly the three voting rules, and as we will see, they can reach different decisions about the same candidate.</p>
  <p>Our running example is the captain's diary: 14 days on which a college cricket match was or was not played, with the weather recorded each day.</p>
  <div class="fx" data-lang="py">from play import df
print(df[["Outlook", "Humidity", "Wind", "HumPct", "TempC", "Play"]].to_string())</div>
  <div class="fx" data-lang="text">      Outlook Humidity    Wind  HumPct  TempC Play
D1      Sunny     High    Weak      85     29   No
D2      Sunny     High  Strong      90     27   No
D3   Overcast     High    Weak      86     28  Yes
D4       Rain     High    Weak      96     21  Yes
D5       Rain   Normal    Weak      80     20  Yes
D6       Rain   Normal  Strong      70     18   No
D7   Overcast   Normal  Strong      65     18  Yes
D8      Sunny     High    Weak      95     22   No
D9      Sunny   Normal    Weak      70     21  Yes
D10      Rain   Normal    Weak      80     24  Yes
D11     Sunny   Normal  Strong      70     24  Yes
D12  Overcast     High  Strong      90     22  Yes
D13  Overcast   Normal    Weak      75     27  Yes
D14      Rain     High  Strong      91     22   No</div>
  <p>To have members to combine, we build three very small models, each a tree with a single question (called a <strong>stump</strong>). One asks only about Outlook, one only about Humidity, one only about Wind. A stump's estimate of P(Yes) for a day is simply the share of played days among the days that gave the same answer. Outlook gives Sunny 2/5 = 0.40, Overcast 4/4 = 1.00 and Rain 3/5 = 0.60. Humidity gives High 3/7 = 0.43 and Normal 6/7 = 0.86. Wind gives Weak 6/8 = 0.75 and Strong 3/6 = 0.50. Each stump's own yes/no answer is Yes when its probability is above 0.5.</p>
  <p>Now the three rules. <strong>Hard voting</strong> counts the members' yes/no labels and takes the majority. <strong>Soft voting</strong> averages the members' probabilities and says Yes if the average is above 0.5, so a member that is very sure counts for more than one that is barely sure. <strong>Weighted voting</strong> gives each member a weight and takes a weighted count or a weighted average. Take day D11 (sunny, normal humidity, strong wind, played). The three stumps say 0.40, 0.86 and 0.50, so their labels are No, Yes, No and the hard vote is No. The average probability is (0.40 + 0.86 + 0.50) / 3 = 0.586, so the soft vote is Yes, which is correct: one confident "Yes" outweighed two lukewarm "No"s. Day D1 (sunny, humid, weak wind, not played) goes the other way: 0.40, 0.43, 0.75 give labels No, No, Yes and a hard vote of No, but the average is 1.58 / 3 = 0.526, so the soft vote wrongly says Yes. If we trust the Outlook stump twice as much, weights (2, 1, 1), the weighted average is (2 × 0.40 + 0.43 + 0.75) / 4 = 0.495 and D1 is back to No. The code checks these days and scores every rule over all 14:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y = (df.Play == "Yes").astype(int).values
P = np.column_stack([df[c].map((df.Play == "Yes").groupby(df[c]).mean()).values   # each stump's P(Yes) for each day
                     for c in ["Outlook", "Humidity", "Wind"]])                   # 14 days x 3 members
labels = (P &gt; 0.5).astype(int)                         # each member's own yes/no
hard = (labels.sum(1) &gt;= 2).astype(int)                # majority of 3 labels
soft = (P.mean(1) &gt; 0.5).astype(int)                   # average probability
w = np.array([2, 1, 1])                                # trust the Outlook stump twice as much
wsoft = (P @ w / w.sum() &gt; 0.5).astype(int)
for d in ["D1", "D11", "D12", "D14"]:
    i = df.index.get_loc(d)
    print(f"{d:3s} P(Yes) {P[i].round(2).tolist()} -&gt; hard {hard[i]} | avg {P[i].mean():.3f} -&gt; soft {soft[i]}"
          f" | weighted {P[i] @ w / 4:.3f} -&gt; {wsoft[i]} | truth {y[i]}")
for name, pred in [("Outlook stump", labels[:, 0]), ("Humidity stump", labels[:, 1]), ("Wind stump", labels[:, 2]),
                   ("hard vote", hard), ("soft vote", soft), ("weighted soft (2,1,1)", wsoft)]:
    print(f"{name:22s} right on {np.sum(pred == y)}/14")</div>
  <div class="fx" data-lang="text">D1  P(Yes) [0.4, 0.43, 0.75] -&gt; hard 0 | avg 0.526 -&gt; soft 1 | weighted 0.495 -&gt; 0 | truth 0
D11 P(Yes) [0.4, 0.86, 0.5] -&gt; hard 0 | avg 0.586 -&gt; soft 1 | weighted 0.539 -&gt; 1 | truth 1
D12 P(Yes) [1.0, 0.43, 0.5] -&gt; hard 0 | avg 0.643 -&gt; soft 1 | weighted 0.732 -&gt; 1 | truth 1
D14 P(Yes) [0.6, 0.43, 0.5] -&gt; hard 0 | avg 0.510 -&gt; soft 1 | weighted 0.532 -&gt; 1 | truth 0
Outlook stump          right on 10/14
Humidity stump         right on 10/14
Wind stump             right on 9/14
hard vote              right on 11/14
soft vote              right on 10/14
weighted soft (2,1,1)  right on 12/14</div>
  <p>Each stump alone is right on 9 or 10 of the 14 days. The hard vote gets 11 and the weighted soft vote 12, so both beat every member; the plain soft vote gets only 10. The reason is visible in the Wind stump: it says 0.75 on every calm day and 0.50 on every windy day whatever the weather, so its probabilities are not very informative, yet soft voting trusts them as much as the others. (These stumps are scored on the same days they learnt from, so read this as a demonstration of the mechanics rather than a fair accuracy test.)</p>
  <p>Written as formulas, with members h₁ … h_M, weights w₁ … w_M (all 1 by default) and classes c: hard voting picks the class with the largest Σ_m w_m · [h_m(x) = c], where the bracket is 1 if member m voted for c and 0 otherwise; soft voting picks the class with the largest Σ_m w_m · P_m(c | x) / Σ_m w_m. For a regression problem the members' numbers are simply averaged, with or without weights, and that is called <strong>averaging</strong>.</p>
  <p>Notice where the weights (2, 1, 1) came from: we chose them after looking at the answers. On real data that is cheating unless the weights are chosen on a separate <strong>validation set</strong>, a slice of data used only for making choices like this, and the final score is reported on a <strong>test set</strong> that took no part in any choice. Here is the same experiment at scale. The churn table has 20,000 customers with 14 numeric columns, two of which (<code>row_noise</code> and <code>coin_noise</code>) are pure noise; the code below is the shared setup that every churn example on this page imports as <code>churn</code>:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)
print("train", Xtr.shape, "validation", Xva.shape, "test", Xte.shape, " churn rate", round(y.mean(), 3))</div>
  <div class="fx" data-lang="text">train (12000, 14) validation (3000, 14) test (5000, 14)  churn rate 0.502</div>
  <p>The members are a 200-tree random forest, a histogram gradient booster and a 15-nearest-neighbours model (with scaling, which nearest neighbours needs because it measures distances). Weights from 0 to 3 for each member are tried on the validation set, and only the final comparison touches the test set:</p>
  <div class="fx" data-lang="py">import numpy as np
from churn import Xtr, ytr, Xva, yva, Xte, yte
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score
members = [("rf",  RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
for name, m in members:
    m.fit(Xtr, ytr)
    print(f"{name:10s} val acc {m.score(Xva, yva):.3f}  AUC {roc_auc_score(yva, m.predict_proba(Xva)[:, 1]):.4f}")
hard = VotingClassifier(members, voting="hard").fit(Xtr, ytr)
soft = VotingClassifier(members, voting="soft").fit(Xtr, ytr)
print(f"{'hard vote':10s} val acc {hard.score(Xva, yva):.3f}  (no probabilities)")
print(f"{'soft vote':10s} val acc {soft.score(Xva, yva):.3f}  AUC {roc_auc_score(yva, soft.predict_proba(Xva)[:, 1]):.4f}")
probs = {n: m.predict_proba(Xva)[:, 1] for n, m in members}          # choose weights on VALIDATION
best = max(((a, b, c) for a in range(4) for b in range(4) for c in range(4) if a + b + c &gt; 0),
           key=lambda w: roc_auc_score(yva, (w[0]*probs["rf"] + w[1]*probs["hgb"] + w[2]*probs["knn"]) / sum(w)))
print("best weights (rf, hgb, knn) on validation:", best)
for name, m in [("rf alone", members[0][1]), ("soft vote", soft)]:
    print(f"TEST {name:10s} acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}")</div>
  <div class="fx" data-lang="text">rf         val acc 0.881  AUC 0.9410
hgb        val acc 0.864  AUC 0.9314
knn        val acc 0.805  AUC 0.8809
hard vote  val acc 0.872  (no probabilities)
soft vote  val acc 0.867  AUC 0.9341
best weights (rf, hgb, knn) on validation: (1, 0, 0)
TEST rf alone   acc 0.876  AUC 0.9358
TEST soft vote  acc 0.867  AUC 0.9317</div>
  <p>This is an honest and fairly common result. The forest is clearly the strongest member, and both votes land below it on validation, because the weaker booster and the much weaker nearest-neighbours model pull the average towards their worse answers. The weight search says the same thing in its own way: the best weights are "forest only". On the test set the plain soft vote loses to the forest alone. This is a general fact worth remembering: averaging several models is guaranteed to beat the <em>average</em> member, not the <em>best</em> one. A vote pays when the members are of similar strength and disagree with each other; when one member dominates, it simply dilutes that member. In the <a class="xref" data-note="ml_ensembles">Ensemble Learning</a> note this appears as the rule that a team gains only from the disagreement among its members.</p>
  <p>Two practical limits. Soft voting assumes every member's probabilities are on the same scale, but a member that always says 0.49 or 0.51 and one that says 0.01 or 0.99 are not equally sure per unit of probability, so badly calibrated members should be calibrated first (see <a class="xref" data-note="ml_calibration">Probability Calibration</a>). And hard voting produces only labels, so a hard-voting ensemble has no probabilities at all, which rules out ROC-AUC, threshold tuning and calibration.</p>

  <h2 id="stk-idea"><span class="num">02</span>Stacking: Learning the Combiner</h2>
  <p>Choosing the weights by trying every combination is a crude form of learning, and it can only learn weights. A natural next step is to let a model learn the best way to combine the members. That is <strong>stacking</strong>, also called stacked generalisation (David Wolpert, 1992): a two-level model in which the first level consists of several different <strong>base models</strong> (level 0), and the second level is a <strong>meta-learner</strong> (level 1) whose input columns are the base models' predictions and whose target is the true label.</p>
  <p>Think of a hospital where three specialists each examine a patient and write down how likely they think a disease is. A head doctor reads the three opinions and makes the final call. Over the years the head doctor has learnt that the first specialist is usually right, the second is a little over-cautious, and the third adds something only when the first two are unsure. The specialists are the base models; the head doctor is the meta-learner, and what the head doctor learnt is the combining rule.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="stk-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="88" width="100" height="54" rx="7" class="fs" stroke="currentColor"/><text x="60" y="110" text-anchor="middle" font-size="12">features x</text><text x="60" y="127" text-anchor="middle" class="tm" font-size="11">14 columns</text>
<rect x="165" y="20" width="130" height="40" rx="6" class="fb sb" fill-opacity="0.3"/><text x="230" y="44" text-anchor="middle" font-size="12">random forest</text>
<rect x="165" y="95" width="130" height="40" rx="6" class="ft st" fill-opacity="0.3"/><text x="230" y="119" text-anchor="middle" font-size="12">grad. boosting</text>
<rect x="165" y="170" width="130" height="40" rx="6" class="fv" stroke="currentColor"/><text x="230" y="194" text-anchor="middle" font-size="12">k-NN</text>
<line x1="110" y1="105" x2="163" y2="42" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="110" y1="115" x2="163" y2="115" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="110" y1="125" x2="163" y2="188" stroke="currentColor" marker-end="url(#stk-al)"/>
<text x="230" y="12" text-anchor="middle" class="tb" font-size="11" font-weight="700">LEVEL 0</text>
<rect x="345" y="60" width="120" height="110" rx="7" class="fs" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="405" y="80" text-anchor="middle" font-size="11">new table:</text><text x="405" y="100" text-anchor="middle" class="tm" font-size="11">p_rf  p_gb  p_knn</text><text x="405" y="118" text-anchor="middle" class="tm" font-size="11">0.83  0.91  0.67</text><text x="405" y="136" text-anchor="middle" class="tm" font-size="11">0.12  0.05  0.27</text><text x="405" y="154" text-anchor="middle" class="tm" font-size="11">…</text>
<line x1="295" y1="40" x2="343" y2="85" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="295" y1="115" x2="343" y2="115" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="295" y1="190" x2="343" y2="145" stroke="currentColor" marker-end="url(#stk-al)"/>
<rect x="510" y="88" width="120" height="54" rx="7" class="fr sr" fill-opacity="0.3"/><text x="570" y="110" text-anchor="middle" font-size="12">meta-learner</text><text x="570" y="127" text-anchor="middle" class="tm" font-size="11">logistic regr.</text>
<text x="570" y="78" text-anchor="middle" class="tr" font-size="11" font-weight="700">LEVEL 1</text>
<line x1="465" y1="115" x2="508" y2="115" stroke="currentColor" marker-end="url(#stk-al)"/>
<text x="570" y="165" text-anchor="middle" font-size="12">final P(churn)</text>
<text x="440" y="196" class="tr" font-size="11">its rows must be OUT-OF-FOLD</text><text x="440" y="211" class="tr" font-size="11">predictions (section 04)</text>
</svg><figcaption>Stacking. Each level-0 model turns a customer's 14 columns into one probability; the three probabilities form a small new table, and the level-1 meta-learner is trained on that table with the true labels as its target.</figcaption></figure>
  <p>Follow the figure from left to right. Each customer's 14 feature columns go into all three base models. Each base model returns one number, its probability of churn, so every customer is turned into a row of just three numbers. Those rows form a new, very small table, and the meta-learner is trained on it like any other model: three input columns, one target column. To predict for a new customer, the customer goes through the three base models first and their three probabilities go through the meta-learner.</p>
  <p>The usual meta-learner is plain <strong>logistic regression</strong> (for regression problems, ridge regression). It computes a weighted sum of the members' probabilities plus a constant and passes it through the sigmoid curve, so it learns three things a vote cannot: a <em>weight</em> for each member, chosen to fit the data rather than by hand; a <em>scale</em>, so that an over-cautious member's 0.6 can be stretched towards 0.9; and, through the constant, a shift of the overall level. In formula form, stacking trains base models f₁ … f_M, builds a table Z whose row i is (f₁(xᵢ), …, f_M(xᵢ)), and trains a meta-learner g on (Z, y); a new row x is predicted as g(f₁(x), …, f_M(x)).</p>
  <p>Why keep the meta-learner so simple? Its inputs are only a few columns, and those columns are strongly correlated with one another, because every member is trying to predict the same target. A flexible meta-learner, such as a deep tree or a booster, would happily fit noise in such a small, redundant table. A regularised linear model is hard to over-fit, and its coefficients can be read directly as "how much the stack trusts each member". A tree-based meta-learner is worth trying only with a lot of data, usually together with the original features (the <code>passthrough</code> option in section 06), where it can learn rules like "trust the booster when the forest is unsure".</p>
  <p>One question has been left open on purpose: which predictions go into the table Z? The obvious answer is to train each base model and let it predict the rows it was trained on. The next section shows that this obvious answer is wrong, and how badly.</p>

  <h2 id="stk-leak"><span class="num">03</span>The Leak in Naive Stacking</h2>
  <p>A base model's predictions on its own training rows do not tell you how good it is; they tell you how well it remembered. The extreme case is the <strong>1-nearest-neighbour</strong> model (1-NN), which predicts a row's label by copying the label of the single closest training row. Ask it about one of its own training rows and the closest training row is that row itself, at distance zero, so it repeats the true answer every time. On the diary, using the two numeric columns humidity and temperature, 1-NN is right on all 14 of its training days. That says nothing about tomorrow; it only says the model memorised.</p>
  <p>Now picture the meta-learner being trained on such a column. It sees one member that is <em>always</em> right and learns the obvious lesson: copy that member. On new data the member is no longer always right, but the meta-learner trusts it completely. This is a form of <strong>leakage</strong>, the general mistake of letting information about the answers reach a model in a way that will not be available when it is used for real. Here the leaked information is "these are the rows I trained on". It is like a student who marks their own homework with the answer key open: every mark is perfect, and the marks say nothing about the exam.</p>
  <p>On the churn table the effect is easy to measure. The members are the histogram booster and a 1-NN model. The code builds the meta-learner's table two ways: from each member's predictions on its own training rows (the naive way), and from honest predictions on rows the member did not see (built with <code>cross_val_predict</code>, which the next section explains). A logistic meta-learner is trained on each table and both stacks are scored on the same test set:</p>
  <div class="fx" data-lang="py">import numpy as np
from churn import Xtr, ytr, Xte, yte
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import roc_auc_score
members = {"hgb": HistGradientBoostingClassifier(random_state=0),
           "1nn": make_pipeline(StandardScaler(), KNeighborsClassifier(1))}
inside, oof, test = {}, {}, {}
for n, m in members.items():
    oof[n] = cross_val_predict(m, Xtr, ytr, cv=5, method="predict_proba")[:, 1]   # honest (next section)
    inside[n] = m.fit(Xtr, ytr).predict_proba(Xtr)[:, 1]                        # on its own training rows
    test[n] = m.predict_proba(Xte)[:, 1]
    print(f"{n}: AUC on own training rows {roc_auc_score(ytr, inside[n]):.3f}   on unseen rows {roc_auc_score(ytr, oof[n]):.3f}")
Z = lambda d: np.column_stack([d[n] for n in members])
for name, feats in [("in-sample predictions", inside), ("out-of-fold predictions", oof)]:
    meta = LogisticRegression().fit(Z(feats), ytr)
    p = meta.predict_proba(Z(test))[:, 1]
    print(f"meta trained on {name:24s} weights {meta.coef_.round(2).ravel().tolist()}  "
          f"TEST acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.4f}")</div>
  <div class="fx" data-lang="text">hgb: AUC on own training rows 0.971   on unseen rows 0.926
1nn: AUC on own training rows 1.000   on unseen rows 0.725
meta trained on in-sample predictions    weights [2.97, 11.15]  TEST acc 0.739  AUC 0.8920
meta trained on out-of-fold predictions  weights [6.63, 0.29]  TEST acc 0.863  AUC 0.9298</div>
  <p>Read the first two lines. On its own training rows 1-NN scores a perfect AUC of 1.000; on rows it has not seen it scores 0.725, much worse than the booster. The naive meta-learner only sees the first number, so it gives 1-NN a weight of about 11 and the booster only about 3, and the stack's test accuracy collapses to 0.739, more than 12 points below what the booster achieves on its own. The meta-learner trained on honest predictions sees the truth, gives 1-NN almost no weight, and matches the booster. The worst part is that nothing warned us: no error, no strange output, just a stack that is quietly worse than one of its own members. The only clues are a huge weight on the member most likely to over-fit and a stack that fails to beat its best member.</p>

  <h2 id="stk-oof"><span class="num">04</span>Out-of-Fold Predictions</h2>
  <p>We need, for every training row, a prediction made by a model that has <em>not</em> seen that row, and we still want to use every row for training. These two wishes sound contradictory, but cross-validation already solves exactly this problem. Split the training rows into k equal parts called <strong>folds</strong>. For each fold in turn, train a fresh copy of the base model on the other k − 1 folds and use it to predict the fold that was left out. After k rounds every row has exactly one prediction, made by a model that never saw it. These are the <strong>out-of-fold (OOF) predictions</strong>, and their quality matches what the model will show on genuinely new data.</p>
  <figure class="viz"><svg viewBox="0 0 650 200" width="650">
<text x="10" y="20" font-size="12" font-weight="700">5-fold out-of-fold predictions for one base model</text>
<g font-size="11">
<text x="10" y="50">round 1</text><rect x="80" y="38" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="170" y="38" width="360" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="76">round 2</text><rect x="80" y="64" width="90" height="18" class="fb sb" fill-opacity="0.2"/><rect x="170" y="64" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="260" y="64" width="270" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="102">round 3</text><rect x="80" y="90" width="180" height="18" class="fb sb" fill-opacity="0.2"/><rect x="260" y="90" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="350" y="90" width="180" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="128">round 4</text><rect x="80" y="116" width="270" height="18" class="fb sb" fill-opacity="0.2"/><rect x="350" y="116" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="440" y="116" width="90" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="154">round 5</text><rect x="80" y="142" width="360" height="18" class="fb sb" fill-opacity="0.2"/><rect x="440" y="142" width="90" height="18" class="fr sr" fill-opacity="0.45"/>
<text x="10" y="184">OOF column</text><rect x="80" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="170" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="260" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="350" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="440" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/>
<text x="125" y="185" text-anchor="middle">from r1</text><text x="215" y="185" text-anchor="middle">from r2</text><text x="305" y="185" text-anchor="middle">from r3</text><text x="395" y="185" text-anchor="middle">from r4</text><text x="485" y="185" text-anchor="middle">from r5</text>
<text x="542" y="50" class="tb">blue: train</text><text x="542" y="66" class="tr">red: predict</text>
</g></svg><figcaption>Each round trains on four folds (blue) and predicts the fifth (red). Stitching the five red pieces together gives one honest prediction per training row (green). Repeating this for every base model gives the meta-learner's training table.</figcaption></figure>
  <p>Read the figure row by row. In round 1 the model trains on folds 2 to 5 and predicts fold 1; in round 2 it trains on folds 1, 3, 4 and 5 and predicts fold 2; and so on. No row is ever predicted by a model that trained on it, yet every row was used for training in four of the five rounds. The green bottom row is the finished OOF column for this base model, and the meta-learner's table has one such column per base model.</p>
  <p>Think of an exam board that wants to know how good each teacher is at predicting their students' grades. Asking a teacher to predict grades for students whose exam papers they have already marked is pointless. Instead, each teacher predicts for a group of students whose papers they have not seen, and the groups rotate until every student has a prediction from someone who had not seen their paper.</p>
  <p>Here is the procedure by hand on the diary, with 1-NN on humidity and temperature and seven folds of two consecutive days. For each fold the model is trained on the other 12 days and predicts the two held-out days. Distances are ordinary straight-line distances: for example D6 (70%, 18 °C) is 3 away from D9 (70%, 21 °C) and 5 away from D7 (65%, 18 °C), so D6's nearest neighbour is D9.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from play import df
X = df[["HumPct", "TempC"]].values; y = df.Play.values; days = df.index
inside = KNeighborsClassifier(1).fit(X, y).predict(X)            # 1-NN predicting its own training days
print("in-sample 1-NN right on", (inside == y).sum(), "of 14")
oof = np.empty(14, dtype=object)
for k in range(7):                                                # 7 folds of 2 consecutive days
    hold = [2 * k, 2 * k + 1]; train = [i for i in range(14) if i not in hold]
    m = KNeighborsClassifier(1).fit(X[train], y[train])
    oof[hold] = m.predict(X[hold])
    nb = m.kneighbors(X[hold], return_distance=False)[:, 0]
    print(f"fold {k+1}: hold out {days[hold[0]]}, {days[hold[1]]} -&gt; nearest {days[train][nb[0]]}, {days[train][nb[1]]}"
          f" -&gt; predict {oof[hold[0]]}, {oof[hold[1]]} (truth {y[hold[0]]}, {y[hold[1]]})")
print("out-of-fold 1-NN right on", (oof == y).sum(), "of 14")</div>
  <div class="fx" data-lang="text">in-sample 1-NN right on 14 of 14
fold 1: hold out D1, D2 -&gt; nearest D3, D3 -&gt; predict Yes, Yes (truth No, No)
fold 2: hold out D3, D4 -&gt; nearest D1, D8 -&gt; predict No, No (truth Yes, Yes)
fold 3: hold out D5, D6 -&gt; nearest D10, D9 -&gt; predict Yes, Yes (truth Yes, No)
fold 4: hold out D7, D8 -&gt; nearest D6, D4 -&gt; predict No, Yes (truth Yes, No)
fold 5: hold out D9, D10 -&gt; nearest D6, D5 -&gt; predict No, Yes (truth Yes, Yes)
fold 6: hold out D11, D12 -&gt; nearest D9, D14 -&gt; predict Yes, No (truth Yes, Yes)
fold 7: hold out D13, D14 -&gt; nearest D10, D12 -&gt; predict Yes, Yes (truth Yes, No)
out-of-fold 1-NN right on 4 of 14</div>
  <p>Out of fold, 1-NN is right on only 4 of the 14 days, against 14 of 14 in-sample. Look at fold 1: D1 and D2 are sunny, hot, humid days with no match, and both find D3 (86%, 28 °C) as their nearest neighbour, an overcast day when a match was played, so both are predicted "Yes". Humidity and temperature alone simply do not separate the diary well, and the in-sample score of 14 out of 14 hid that completely. The OOF column tells the meta-learner the truth: this member is mostly wrong on days it has not seen.</p>
  <p>There is one more detail. The meta-learner was trained on predictions made by fold models, each trained on (k − 1)/k of the rows; what produces its inputs when a genuinely new row arrives? There are two common answers. scikit-learn refits each base model once on <em>all</em> the training rows and uses those refitted models; they are slightly stronger than the fold models, but the difference is small and it is simple. Many competition solutions instead keep the k fold models and average their predictions for the new row, which needs no extra fit. Either way, a k-fold stack fits each base model k + 1 times (k fold models plus the refit), or k times with the averaging approach.</p>
  <p>That is the whole algorithm, and it is short enough to write from scratch. scikit-learn's <code>StackingClassifier</code> with <code>cv=5</code> uses stratified 5-fold splitting without shuffling, takes each member's <code>predict_proba</code>, keeps only the positive-class column for a two-class problem, fits a logistic regression on the result, and refits the members on all rows. The function below does the same steps, so the two should agree exactly:</p>
  <div class="fx" data-lang="py">import numpy as np
from churn import Xtr, ytr, Xte, yte
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import StratifiedKFold
members = [("rf",  RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]

def my_stack_fit(members, meta, X, y, k=5):
    X, y = np.asarray(X), np.asarray(y)
    Z = np.zeros((len(X), len(members)))                  # level-1 training table
    for train, hold in StratifiedKFold(k).split(X, y):    # the folds sklearn uses for cv=5
        for j, (_, m) in enumerate(members):
            Z[hold, j] = clone(m).fit(X[train], y[train]).predict_proba(X[hold])[:, 1]
    fitted = [clone(m).fit(X, y) for _, m in members]     # level 0 refit on ALL rows, for new data
    return fitted, clone(meta).fit(Z, y)

def my_stack_proba(fitted, meta, X):
    Z = np.column_stack([m.predict_proba(np.asarray(X))[:, 1] for m in fitted])
    return meta.predict_proba(Z)[:, 1]

fitted, meta = my_stack_fit(members, LogisticRegression(), Xtr, ytr)
mine = my_stack_proba(fitted, meta, Xte)
sk = StackingClassifier(members, final_estimator=LogisticRegression(), cv=5).fit(Xtr.values, ytr)
theirs = sk.predict_proba(Xte.values)[:, 1]
print("my meta weights:     ", meta.coef_.round(3).ravel().tolist(), "intercept", meta.intercept_.round(3).tolist())
print("sklearn meta weights:", sk.final_estimator_.coef_.round(3).ravel().tolist(), "intercept", sk.final_estimator_.intercept_.round(3).tolist())
print(f"largest difference in test probabilities: {np.abs(mine - theirs).max():.2e}")
print(f"test acc  mine {np.mean((mine &gt; 0.5) == yte):.3f}   sklearn {sk.score(Xte.values, yte):.3f}")</div>
  <div class="fx" data-lang="text">my meta weights:      [5.868, 2.462, -0.056] intercept [-4.172]
sklearn meta weights: [5.868, 2.462, -0.056] intercept [-4.172]
largest difference in test probabilities: 0.00e+00
test acc  mine 0.877   sklearn 0.877</div>
  <p>The two agree to the last digit: the same meta weights, the same intercept and a largest difference of exactly zero in the test probabilities. So <code>StackingClassifier</code> is nothing more than those twenty lines. Look at the weights: a large weight on the forest, a smaller one on the booster and a weight close to zero (here slightly negative) on nearest neighbours. Once the forest and the booster are known, nearest neighbours adds nothing, and the meta-learner worked that out by itself, which a plain soft vote could not.</p>
  <p>The same rule that protects the meta-learner applies to every step that learns from data. If a scaler, an encoder or a feature selector is fitted on all the rows before the OOF predictions are made, information from each held-out fold has already leaked into training. Putting each preprocessing step inside the member's <code>Pipeline</code>, as the nearest-neighbours member does with its scaler, makes it refit inside every fold. For time-series data the folds must also respect time order (train on the past, predict the future), which <code>TimeSeriesSplit</code> handles.</p>

  <h2 id="stk-blend"><span class="num">05</span>Blending</h2>
  <p>Out-of-fold stacking is honest but expensive: every base model is trained k + 1 times. <strong>Blending</strong>, a name that became popular during the Netflix Prize competition, is the cheaper version. Split the training rows once into a base part (say 75%) and a <strong>holdout</strong> part (25%). Train each base model once on the base part, let it predict the holdout part, and train the meta-learner on those holdout predictions only. On the diary it would mean training the members on D1 to D10 and the meta-learner on their predictions for D11 to D14. Every prediction the meta-learner learns from is honest, because the holdout rows were never seen by the members, so blending has no leak. What it gives up is data: the members learn from only 75% of the rows, and the meta-learner from only 25%.</p>
  <div class="fx" data-lang="py">import numpy as np, time
from churn import Xtr, ytr, Xte, yte
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
members = [("rf",  RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
# BLENDING: members learn on 75% of train, the meta-learner on their predictions for the other 25%
t0 = time.time()
Xa, Xh, ya, yh = train_test_split(Xtr, ytr, test_size=0.25, stratify=ytr, random_state=0)
fitted = [clone(m).fit(Xa, ya) for _, m in members]
meta = LogisticRegression().fit(np.column_stack([m.predict_proba(Xh)[:, 1] for m in fitted]), yh)
p_blend = meta.predict_proba(np.column_stack([m.predict_proba(Xte)[:, 1] for m in fitted]))[:, 1]
t_blend = time.time() - t0
# STACKING: every training row gets an out-of-fold prediction (5 folds)
t0 = time.time()
st = StackingClassifier(members, final_estimator=LogisticRegression(), cv=5).fit(Xtr, ytr)
p_stack = st.predict_proba(Xte)[:, 1]
t_stack = time.time() - t0
for name, p, sec, rows in [("blending", p_blend, t_blend, len(yh)), ("stacking", p_stack, t_stack, len(ytr))]:
    print(f"{name:9s} meta-learner rows {rows:5d}  TEST acc {np.mean((p &gt; 0.5) == yte):.3f}"
          f"  AUC {roc_auc_score(yte, p):.4f}  fit {sec:.0f}s")</div>
  <div class="fx" data-lang="text">blending  meta-learner rows  3000  TEST acc 0.869  AUC 0.9345  fit 32s
stacking  meta-learner rows 12000  TEST acc 0.877  AUC 0.9367  fit 289s</div>
  <p>Blending trained the meta-learner on 3,000 rows and the members on 9,000, so each member is a little weaker, and the result is a little worse than stacking, which used all 12,000 rows for both jobs. In exchange blending fitted each member once instead of six times, so it was several times faster (the timings are approximate and come from a busy shared machine). With millions of rows the data lost to the holdout matters much less, and blending's speed and simplicity often win; with a moderate amount of data, where every row counts, k-fold stacking is the better choice.</p>
  <table class="tbl">
    <tr><th></th><th>Blending</th><th>Stacking (k-fold OOF)</th></tr>
    <tr><td>Meta-learner trains on</td><td>holdout rows only</td><td>every training row (OOF)</td></tr>
    <tr><td>Base models train on</td><td>the base part (e.g. 75%)</td><td>k fold fits on (k − 1)/k of the rows, plus one refit on all</td></tr>
    <tr><td>Fits per base model</td><td>1</td><td>k + 1</td></tr>
    <tr><td>Best when</td><td>lots of data, quick experiments, many candidate members</td><td>moderate data, every row counts</td></tr>
  </table>

  <h2 id="stk-sk"><span class="num">06</span>Stacking in scikit-learn</h2>
  <p>scikit-learn packages stacking as <code>StackingClassifier</code> and <code>StackingRegressor</code>, and voting as <code>VotingClassifier</code> and <code>VotingRegressor</code>. A stack takes a list of named base models and a meta-learner, and a handful of parameters decide how the level-1 table is built:</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>What it does</th></tr>
    <tr><td><code>estimators</code></td><td>required</td><td>list of (name, model) pairs: the base models</td></tr>
    <tr><td><code>final_estimator</code></td><td>LogisticRegression / RidgeCV</td><td>the meta-learner</td></tr>
    <tr><td><code>cv</code></td><td>5</td><td>how OOF predictions are made: a number of folds (stratified for classifiers), a splitter such as <code>TimeSeriesSplit</code>, or <code>"prefit"</code> for members that are already trained</td></tr>
    <tr><td><code>stack_method</code></td><td>"auto"</td><td>which output feeds the meta-learner: <code>predict_proba</code> if the member has it, else <code>decision_function</code>, else <code>predict</code></td></tr>
    <tr><td><code>passthrough</code></td><td>False</td><td>if True, the meta-learner also sees the original features</td></tr>
    <tr><td><code>n_jobs</code></td><td>None</td><td>fit the base models in parallel</td></tr>
  </table>
  <p>The code below fits a stack on churn, prints which output was used for each member and what the meta-learner's input looks like for two customers, then tries <code>passthrough=True</code>. The second half builds a regression stack on a standard synthetic problem (Friedman #1, where the target is a curved function of five inputs), with three members of very different kinds: a straight-line ridge regression, a random forest and nearest neighbours.</p>
  <div class="fx" data-lang="py">from churn import Xtr, ytr, Xte, yte
from sklearn.ensemble import (RandomForestClassifier, HistGradientBoostingClassifier, StackingClassifier,
                              RandomForestRegressor, StackingRegressor)
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.linear_model import LogisticRegression, RidgeCV, Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_friedman1
from sklearn.metrics import roc_auc_score
members = [("rf",  RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
st = StackingClassifier(members, final_estimator=LogisticRegression(), cv=5).fit(Xtr, ytr)
print("stack_method_:", st.stack_method_)
print("meta-learner input for 2 test rows:\n", st.transform(Xte.iloc[:2]).round(3))
pt = StackingClassifier(members, final_estimator=LogisticRegression(max_iter=1000), cv=5,
                        passthrough=True).fit(Xtr, ytr)
print("passthrough meta input width:", pt.transform(Xte.iloc[:2]).shape[1])
for name, m in [("stack (predictions only)", st), ("stack + passthrough", pt)]:
    print(f"{name:25s} TEST acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}")
# regression: three members of different kinds, ridge meta-learner
Xr, yr = make_friedman1(n_samples=3000, noise=1.0, random_state=0)
Xa, Xb, ya, yb = Xr[:2000], Xr[2000:], yr[:2000], yr[2000:]
base = [("ridge", Ridge()), ("rf", RandomForestRegressor(n_estimators=200, n_jobs=2, random_state=0)),
        ("knn", make_pipeline(StandardScaler(), KNeighborsRegressor(10)))]
for n, m in base:
    print(f"{n:6s} test R^2 {m.fit(Xa, ya).score(Xb, yb):.3f}")
sr = StackingRegressor(base, final_estimator=RidgeCV(), cv=5).fit(Xa, ya)
print(f"stack  test R^2 {sr.score(Xb, yb):.3f}  meta weights {sr.final_estimator_.coef_.round(2).tolist()}")</div>
  <div class="fx" data-lang="text">stack_method_: ['predict_proba', 'predict_proba', 'predict_proba']
meta-learner input for 2 test rows:
 [[0.1   0.097 0.2  ]
 [0.725 0.629 0.533]]
passthrough meta input width: 17
stack (predictions only)  TEST acc 0.877  AUC 0.9367
stack + passthrough       TEST acc 0.876  AUC 0.9376
ridge  test R^2 0.732
rf     test R^2 0.874
knn    test R^2 0.766
stack  test R^2 0.886  meta weights [-0.09, 0.88, 0.39]</div>
  <p>Line by line: <code>stack_method_</code> shows that "auto" picked <code>predict_proba</code> for all three members. <code>transform</code> exposes the meta-learner's input, one column per member for a two-class problem (scikit-learn drops the P(stay) column because it is just 1 − P(churn)): low numbers for a customer who stays, higher ones for a likely leaver. With <code>passthrough=True</code> the input grows from 3 to 3 + 14 = 17 columns, and with a linear meta-learner the gain is tiny, within the noise of one test set; passthrough is more useful with a flexible meta-learner and plenty of data.</p>
  <p>The regression stack is the clearer success. The three members are of genuinely different kinds and none of them dominates as completely as the forest did on churn, so the stack beats its best member. Its meta weights read as "mostly the forest, corrected by nearest neighbours, with ridge almost ignored". This is the situation stacking is made for, and it leads to the question of the next section: how can you tell in advance which situation you are in?</p>
  <p>One parameter needs a warning. <code>cv="prefit"</code> tells scikit-learn that the members are already trained and it should use their predictions on whatever data you pass to <code>fit</code> as the meta-learner's table. If that data is the same data the members were trained on, you have rebuilt the leak of section 03. It is only correct with a separate holdout set, and then it is exactly blending.</p>

  <h2 id="stk-gain"><span class="num">07</span>When Combining Pays</h2>
  <p>On churn, every vote and stack so far has at best tied with the forest. That is not bad luck; it has a measurable cause. A combination can only fix the mistakes on which its members disagree, so the useful question before building any blend is how much the candidate members disagree. A simple measure is the <strong>correlation</strong> of their out-of-fold probabilities: a number from −1 to 1, where 1 means two models rise and fall together on every row and 0 means they move independently. The code prints these correlations for five candidates, then compares a soft vote and a stack for three teams: two very alike members, three diverse strong members, and the same three plus a weak one.</p>
  <div class="fx" data-lang="py">import numpy as np
from churn import Xtr, ytr, Xte, yte
from sklearn.ensemble import (RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier,
                              VotingClassifier, StackingClassifier)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_predict
cands = {"rf":  RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0),
         "et":  ExtraTreesClassifier(n_estimators=200, n_jobs=2, random_state=0),
         "hgb": HistGradientBoostingClassifier(random_state=0),
         "knn": make_pipeline(StandardScaler(), KNeighborsClassifier(15)),
         "lr":  make_pipeline(StandardScaler(), LogisticRegression())}
oof = {n: cross_val_predict(m, Xtr, ytr, cv=5, method="predict_proba")[:, 1] for n, m in cands.items()}
names = list(cands); C = np.corrcoef([oof[n] for n in names])
print("correlation of out-of-fold P(churn):")
print("      " + "  ".join(f"{n:&gt;4s}" for n in names))
for i, n in enumerate(names):
    print(f"{n:&gt;4s}  " + "  ".join(f"{C[i, j]:4.2f}" for j in range(len(names))))
acc = {n: cands[n].fit(Xtr, ytr).score(Xte, yte) for n in names}
print("test acc alone:", {n: round(a, 3) for n, a in acc.items()})
teams = {"rf+et (alike)": ["rf", "et"], "rf+hgb+knn": ["rf", "hgb", "knn"], "rf+hgb+knn+lr (+weak)": ["rf", "hgb", "knn", "lr"]}
for tname, team in teams.items():
    est = [(n, cands[n]) for n in team]
    sv = VotingClassifier(est, voting="soft").fit(Xtr, ytr)
    st = StackingClassifier(est, final_estimator=LogisticRegression(), cv=5).fit(Xtr, ytr)
    print(f"{tname:22s} best member {max(acc[n] for n in team):.3f}  soft vote {sv.score(Xte, yte):.3f}"
          f"  stacking {st.score(Xte, yte):.3f}  meta weights {st.final_estimator_.coef_.round(1).ravel().tolist()}")</div>
  <div class="fx" data-lang="text">correlation of out-of-fold P(churn):
        rf    et   hgb   knn    lr
  rf  1.00  0.97  0.96  0.86  0.37
  et  0.97  1.00  0.95  0.89  0.39
 hgb  0.96  0.95  1.00  0.84  0.34
 knn  0.86  0.89  0.84  1.00  0.37
  lr  0.37  0.39  0.34  0.37  1.00
test acc alone: {'rf': 0.876, 'et': 0.869, 'hgb': 0.862, 'knn': 0.792, 'lr': 0.596}
rf+et (alike)          best member 0.876  soft vote 0.875  stacking 0.876  meta weights [5.2, 4.4]
rf+hgb+knn             best member 0.876  soft vote 0.867  stacking 0.877  meta weights [5.9, 2.5, -0.1]
rf+hgb+knn+lr (+weak)  best member 0.876  soft vote 0.860  stacking 0.878  meta weights [5.9, 2.5, 0.1, -1.7]</div>
  <p>The correlation table explains everything below it. The forest, Extra Trees and the booster are correlated at 0.95 or more: they are nearly the same opinion expressed three times. Nearest neighbours is a little different, and logistic regression is very different (correlations under 0.4) but also much weaker, because the churn signal is not a straight line. No candidate is both strong and different, so there is very little for any combiner to gain.</p>
  <p>The three teams show the consequences. The two alike members, forest plus Extra Trees, produce essentially the same accuracy as the better member however they are combined; the meta weights simply split the trust between them. In the diverse team the soft vote drops below the forest, dragged down by the weaker members, while the stack holds on to the forest's accuracy by learning to give nearest neighbours almost no weight. Adding a weak logistic regression hurts the soft vote further, but the stack is unharmed, and it even uses the weak member as a small correction. Two lessons follow. Stacking is <strong>robust</strong>: unlike plain averaging, it does not get worse when weak or duplicate members are added, because it learns their weights. But it only <strong>gains</strong> when some member is both good and different, as in the regression stack of section 06.</p>
  <p>If one level of stacking helps, a second level might seem to help more: several meta-learners, each trained on the base models' OOF predictions, combined by a final meta-learner trained on <em>their</em> OOF predictions. Competition winners have used three or more such levels with dozens of models. In scikit-learn you nest a <code>StackingClassifier</code> as the <code>final_estimator</code>:</p>
  <div class="fx" data-lang="py">import time
from churn import Xtr, ytr, Xte, yte
from sklearn.ensemble import (RandomForestClassifier, HistGradientBoostingClassifier, ExtraTreesClassifier,
                              StackingClassifier)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score
level0 = [("rf",  RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)),
          ("hgb", HistGradientBoostingClassifier(random_state=0)),
          ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
level1 = StackingClassifier([("lr", LogisticRegression()),
                             ("et", ExtraTreesClassifier(n_estimators=200, min_samples_leaf=20, random_state=0))],
                            final_estimator=LogisticRegression(), cv=5)
models = {"one level  (-&gt; LR)":          StackingClassifier(level0, final_estimator=LogisticRegression(), cv=5),
          "two levels (-&gt; LR+ET -&gt; LR)": StackingClassifier(level0, final_estimator=level1, cv=5)}
for name, m in models.items():
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    print(f"{name:28s} TEST acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}  fit {sec:.0f}s")</div>
  <div class="fx" data-lang="text">one level  (-&gt; LR)           TEST acc 0.877  AUC 0.9367  fit 283s
two levels (-&gt; LR+ET -&gt; LR)  TEST acc 0.876  AUC 0.9364  fit 356s</div>
  <p>The second level gains nothing measurable, while it adds training time (its own meta-learners need their own out-of-fold rounds) and, more importantly, complexity: another layer to build, test and maintain. Deeper levels rarely pay, because each level sees fewer, more correlated columns, all predicting the same target; most of the information has already been squeezed out at level 1, and further levels mostly fit noise. In a competition a gain of 0.0005 AUC can decide the ranking; in production it almost never justifies the cost.</p>
  <p>And there are real costs even for one level. Training takes k + 1 fits per member plus the meta-learner. At prediction time every member must run on every request, so latency is the sum of the members' times (or the slowest one, if they run in parallel) plus the meta-learner's. Every member is a separate pipeline to retrain, version and monitor, and a change to any member changes the meta-learner's inputs, so the meta-learner must be retrained too. Explaining a stacked prediction means going through two levels (see <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>). Put together, a blend is worth it when the members are of similar strength and low correlation, when the gain is larger than the noise of a single test split, and when the latency and maintenance budget allows it. Otherwise, ship the best single model.</p>
  <table class="tbl">
    <tr><th>Gains are small or zero when…</th><th>because</th></tr>
    <tr><td>members are alike (forest + Extra Trees, two boosters)</td><td>their errors are correlated, so there is nothing to cancel</td></tr>
    <tr><td>one member dominates</td><td>the best blend is "mostly that member", and a plain vote may even hurt</td></tr>
    <tr><td>the data is small</td><td>OOF predictions are noisy and the meta-learner over-fits</td></tr>
    <tr><td>the errors come from shared bias or label noise</td><td>no combination can recover information that no member has</td></tr>
  </table>

  <h2 id="stk-traps"><span class="num">08</span>Common Mistakes</h2>
  <p>The most damaging mistake is the one of section 03: training the meta-learner on the members' predictions for their own training rows. It produces no error, only a stack that is worse than its best member and a suspiciously large weight on the member most able to memorise. The fix is always out-of-fold predictions, which <code>StackingClassifier</code> and <code>cross_val_predict</code> produce automatically. A close relative is fitting preprocessing (scaling, encoding, feature selection) on all the rows before the folds are made; wrap each step in the member's <code>Pipeline</code> so it is refitted inside every fold.</p>
  <p>A second mistake is choosing voting weights, or tuning the meta-learner, by looking at the test set. The test score is then no longer an honest estimate of performance on new data. Choose weights on a validation set or by cross-validation, and touch the test set once, at the end.</p>
  <p>A third is reaching for hard voting and then needing probabilities. A hard-voting ensemble has no <code>predict_proba</code> at all:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import VotingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from churn import Xtr, ytr
hard = VotingClassifier([("tree", DecisionTreeClassifier(max_depth=3)), ("lr", LogisticRegression())],
                        voting="hard").fit(Xtr, ytr)
try:
    hard.predict_proba(Xtr.iloc[:1])
except AttributeError as e:
    print("AttributeError:", e)
soft = VotingClassifier(hard.estimators, voting="soft").fit(Xtr, ytr)
print("soft vote P(churn) for one customer:", soft.predict_proba(Xtr.iloc[:1])[0, 1].round(3))</div>
  <div class="fx" data-lang="text">AttributeError: This 'VotingClassifier' has no attribute 'predict_proba'
soft vote P(churn) for one customer: 0.266</div>
  <p>The fix is soft voting or stacking, both of which return probabilities, so ROC-AUC, threshold tuning and calibration all work again.</p>
  <p>Finally, three judgement mistakes. Stacking near-duplicates, such as five boosters with different random seeds, gives you one booster at five times the cost; look at the OOF correlation table first and add members that disagree. Using a flexible meta-learner, such as a deep tree, on three highly correlated columns over-fits; start with logistic or ridge regression. And declaring that a stack "won" because it beat the best single model by 0.002 on one test set ignores that a single random split moves scores by about that much; confirm the gain with repeated cross-validation or several splits before paying the production cost.</p>

  <h2 id="stk-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Ensemble</b>: a model that combines the predictions of several member models.</li>
    <li><b>Hard voting</b>: majority of the members' predicted labels (optionally weighted).</li>
    <li><b>Soft voting</b>: (weighted) average of the members' probabilities, then threshold.</li>
    <li><b>Stacking</b>: level-0 base models + a level-1 <b>meta-learner</b> trained on their out-of-fold predictions.</li>
    <li><b>Out-of-fold (OOF) prediction</b>: the prediction for a row from a model trained on all folds except the one containing that row.</li>
    <li><b>Blending</b>: stacking with one holdout split instead of k folds.</li>
    <li><b>Passthrough</b>: the meta-learner also receives the original features.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Diary example</th></tr>
    <tr><td>Hard vote</td><td>ŷ = argmax_c Σ_m w_m · [h_m(x) = c]</td><td>D11: No, Yes, No → No</td></tr>
    <tr><td>Soft vote</td><td>ŷ = argmax_c Σ_m w_m P_m(c | x) / Σ w_m</td><td>D11: (0.40 + 0.86 + 0.50)/3 = 0.586 → Yes</td></tr>
    <tr><td>Weighted soft</td><td>(2·P_Outlook + P_Humidity + P_Wind) / 4</td><td>D1: (0.80 + 0.43 + 0.75)/4 = 0.495 → No</td></tr>
    <tr><td>Stacking</td><td>ŷ(x) = g(f₁(x), …, f_M(x))</td><td>g trained on OOF predictions</td></tr>
    <tr><td>Cost</td><td>k + 1 fits per member (+ 1 meta fit); blending 1</td><td>5-fold: 6 fits per member</td></tr>
  </table>
  <h3>Comparison</h3>
  <table class="tbl">
    <tr><th></th><th>Hard vote</th><th>Soft / weighted vote</th><th>Stacking</th><th>Blending</th></tr>
    <tr><td>Combiner</td><td>majority of labels</td><td>mean of probabilities</td><td>meta-learner on OOF predictions</td><td>meta-learner on holdout predictions</td></tr>
    <tr><td>Learns weights?</td><td>no</td><td>only by your search</td><td>yes</td><td>yes</td></tr>
    <tr><td>Probabilities?</td><td>no</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>Fits per member</td><td>1</td><td>1</td><td>k + 1</td><td>1</td></tr>
    <tr><td>Hurt by a weak member?</td><td>partly</td><td>yes (unless weighted)</td><td>no</td><td>no</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import VotingClassifier, StackingClassifier, StackingRegressor
from sklearn.linear_model import LogisticRegression, RidgeCV
from sklearn.model_selection import cross_val_predict

vote = VotingClassifier(members, voting="soft", weights=[2, 1, 1])      # members = [(name, model), ...]
stack = StackingClassifier(members, final_estimator=LogisticRegression(),
                           cv=5, stack_method="auto", passthrough=False)
reg = StackingRegressor(members_reg, final_estimator=RidgeCV(), cv=5)
oof = cross_val_predict(model, X, y, cv=5, method="predict_proba")[:, 1]   # one OOF column by hand</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Never train the meta-learner on in-sample predictions; use OOF (or a holdout).</li>
    <li>Preprocessing goes inside each member's Pipeline, so it refits per fold.</li>
    <li>Averaging beats the average member, not necessarily the best one.</li>
    <li>Hard voting has no <code>predict_proba</code>.</li>
    <li>Gains need members that are both good and different; check OOF correlations first.</li>
    <li><code>cv="prefit"</code> on the members' own training data rebuilds the leak.</li>
    <li>Keep the meta-learner simple: logistic or ridge regression.</li>
  </ul>

  <h2 id="stk-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between hard and soft voting?</summary><div class="qa-body">Hard voting takes the majority of the members' predicted labels; soft voting averages their predicted probabilities and then applies the threshold. Soft voting uses each member's confidence, so one very sure member can outvote two unsure ones: with probabilities 0.40, 0.86 and 0.50, hard voting says No (one Yes of three) while soft voting averages 0.586 and says Yes. Soft voting is usually better when the members' probabilities are reasonably calibrated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a three-model weighted hard vote with weights (1, 1, 3), what happens?</summary><div class="qa-body">The third model's weight (3) is larger than the other two together (2), so it wins every vote on its own and the ensemble is just that model. Weights should be chosen on validation data, and no member should be able to dictate unless that is intended.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a soft-voting ensemble be worse than its best member? Why?</summary><div class="qa-body">Yes. Averaging is guaranteed to beat the average member, not the best one. If one member is clearly stronger and the others are weaker, the average is pulled towards their worse answers; on the churn data the soft vote of a forest, a booster and nearest neighbours scored below the forest alone. Voting pays when members are of similar strength and disagree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stacking?</summary><div class="qa-body">A two-level ensemble. Level-0 base models, ideally strong and different, each produce a prediction for every row; a level-1 meta-learner is trained on those predictions (made out of fold) with the true labels as its target. The meta-learner learns how much to trust each base model, and can recalibrate their combined output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't the meta-learner be trained on the base models' predictions for their own training rows?</summary><div class="qa-body">Those predictions measure memorisation, not skill. A 1-nearest-neighbour model is always right on its own training rows, so a meta-learner trained on them learns to trust it blindly. On new data that member is much weaker, and the stack underperforms; on the churn data a booster + 1-NN stack fell from 0.863 to 0.739 accuracy this way. Out-of-fold predictions have the same quality as predictions on new data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain out-of-fold predictions step by step.</summary><div class="qa-body">Split the training rows into k folds. For each fold, train a fresh copy of the model on the other k − 1 folds and predict the held-out fold. After k rounds every row has exactly one prediction, made by a model that never saw it. Doing this for each base model gives the meta-learner's training table; <code>cross_val_predict</code> does it in one call.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When a new row arrives, which base models produce the meta-learner's inputs?</summary><div class="qa-body">Either the base models refitted on all training rows (what scikit-learn's StackingClassifier does) or the average of the k fold models' predictions (common in competitions). Refitting is simpler; averaging needs no extra fit and matches the training inputs a little more closely. Both work well in practice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between blending and stacking?</summary><div class="qa-body">Blending trains the base models on one part of the data and the meta-learner on their predictions for a single holdout part: one fit per member, but the members learn from less data and the meta-learner from only the holdout rows. Stacking uses k-fold out-of-fold predictions, so every row trains both levels, at the cost of k + 1 fits per member. Blending suits very large data; stacking suits moderate data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which meta-learner would you choose, and why?</summary><div class="qa-body">A simple, regularised linear model: logistic regression for classification, ridge (or non-negative least squares) for regression. The meta-learner's inputs are few and highly correlated, since every member predicts the same target, so a flexible model over-fits them. A linear meta-learner's coefficients can also be read as member weights.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>passthrough=True</code> do?</summary><div class="qa-body">The meta-learner receives the original features as well as the members' predictions, so it can learn region-specific trust such as "use model A for young customers". It helps mostly with a flexible meta-learner and plenty of data; with a linear meta-learner it usually changes little.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For a binary problem, how many meta-features does StackingClassifier create per base model?</summary><div class="qa-body">One. With <code>stack_method="auto"</code> it uses <code>predict_proba</code> and drops the first column, because P(class 0) = 1 − P(class 1). For K classes it keeps all K probability columns per member.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a random forest + gradient boosting blend usually help more than two random forests?</summary><div class="qa-body">A blend gains only where members make different mistakes. Two forests are built the same way and make nearly the same errors (correlation close to 1). A forest (deep trees averaged in parallel, mainly reducing variance) and a booster (shallow trees added in sequence, mainly reducing bias) are built differently, so their errors overlap less and more of them cancel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you decide whether a set of models is worth stacking?</summary><div class="qa-body">Compute each candidate's out-of-fold predictions and look at their individual scores and pairwise correlations. A useful member is both reasonably strong and not too correlated with the others; near-duplicates (correlation above about 0.95) add little. Then compare the stack against the best single model with repeated cross-validation, not one test split.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is stacking robust to adding a weak member when soft voting is not?</summary><div class="qa-body">Soft voting gives every member the same say, so a weak member drags the average down. The meta-learner learns each member's weight from honest predictions, so it gives a weak member a weight near zero (or uses it as a small correction). On the churn data adding a weak logistic regression lowered the soft vote but left the stack unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What leaks can still occur inside a stacking pipeline that uses out-of-fold predictions?</summary><div class="qa-body">Preprocessing fitted on all rows before the folds (scalers, encoders, feature selection), folds that ignore groups (the same customer in train and held-out folds) or time order, tuning the meta-learner or weights on the test set, and <code>cv="prefit"</code> applied to the members' own training data. Each lets information about the held-out answers reach training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is multi-level stacking worth it?</summary><div class="qa-body">Rarely outside competitions. Each extra level learns from fewer, highly correlated columns and needs its own round of out-of-fold predictions, so it mostly fits noise while adding training time, risk of leaks between levels and maintenance. On the churn data a second level gained nothing measurable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your stack beats the best single model by 0.002 AUC on the test set. Do you ship it?</summary><div class="qa-body">Not on that evidence alone. A single split moves scores by about that much, so first confirm the gain with repeated cross-validation or several splits. Then weigh it against the costs: k + 1 times the training, every member running at prediction time, a larger artefact and several pipelines to retrain and monitor. Often the single booster wins on total value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are bagging, voting and stacking related?</summary><div class="qa-body">Bagging is an equal-weight soft vote over bootstrap copies of one algorithm. Voting does the same over different, finished algorithms, with optional hand-picked weights. Stacking replaces the hand-picked weights with a model that learns them from out-of-fold predictions. All three gain only from disagreement among their members.</div></details>
</main>
`
});
