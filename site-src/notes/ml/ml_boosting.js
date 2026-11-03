// notes/ml/ml_boosting.js — How Boosting Works
Object.assign(TOPIC_CONTENT, {
  "ml_boosting": `<main>
<h1>How Boosting Works</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>How Boosting Works</span></div>
  <p class="lead">Boosting is a way of building one strong model out of many weak ones by training them <strong>one after another</strong>, where each new model is trained to fix what the models before it still get wrong, and their outputs are <strong>added up</strong>. It is the idea behind the most accurate models for table-shaped data used in industry today: AdaBoost, gradient boosting, XGBoost, LightGBM and CatBoost are all versions of it. Bagging and random forests, which you met earlier, average many independent models to cancel their random mistakes; boosting attacks a different kind of mistake, the one every simple model makes in the same way. To see how, we will follow one small running example used by the whole Tree-Based Models group: a college cricket captain's diary of 14 days, from which we try to predict how many club members turn up to play. Every idea on this page is computed on those 14 days first, and then checked at scale on a larger customer-churn dataset.</p>

  <h2 id="bst-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How Boosting Works</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why boosting</div>
        <ul>
          <li>Averaging (bagging) cuts <b>variance</b>, not <b>bias</b></li>
          <li>Boosting cuts bias: each model fixes the team's leftover error</li>
          <li>Built from <b>weak learners</b>, usually shallow trees</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li>Start at a constant F₀ (e.g. the mean)</li>
          <li>Fit a small tree to what is still wrong (residuals)</li>
          <li><b>F_m = F_{m−1} + ν·h_m</b>; never revisit old trees</li>
          <li>Diary MSE 91.43 → 55.43 → 35.83 → 20.87</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Step size and rounds</div>
        <ul>
          <li><b>Learning rate ν</b>: keep only a fraction of each tree</li>
          <li>Smaller ν: better, but needs ≈ 1/ν rounds</li>
          <li>Too many rounds overfit → <b>early stopping</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Risks</div>
        <ul>
          <li>Chases <b>label noise</b> and outliers</li>
          <li>Rounds are sequential (split search is parallel)</li>
          <li>Fixes: robust loss, small ν, subsampling, early stopping</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The family</div>
        <ul>
          <li><b>AdaBoost</b>: re-weight wrong rows</li>
          <li><b>Gradient Boosting</b>: fit the gradient of any loss</li>
          <li><b>XGBoost / LightGBM / CatBoost</b>: faster, regularised</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="bst-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Boosting Exists</span><span class="rm-sub">the error that averaging cannot fix</span></div></div>
      <div class="rm-item rm-done" data-target="bst-weak"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Weak Learners</span><span class="rm-sub">what the team is built from</span></div></div>
      <div class="rm-item rm-done" data-target="bst-seq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sequential Correction</span><span class="rm-sub">three rounds on the diary, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="bst-add"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Additive Model</span><span class="rm-sub">the formula behind the loop</span></div></div>
      <div class="rm-item rm-done" data-target="bst-shrink"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Shrinkage (the Learning Rate)</span><span class="rm-sub">why small steps generalise better</span></div></div>
      <div class="rm-item rm-done" data-target="bst-bv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Bias, Variance and the Number of Rounds</span><span class="rm-sub">when to stop adding trees</span></div></div>
      <div class="rm-item rm-done" data-target="bst-noise"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Noise and Outliers</span><span class="rm-sub">boosting's blind spot</span></div></div>
      <div class="rm-item rm-done" data-target="bst-vs"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Boosting vs Bagging</span><span class="rm-sub">two ways to build a team</span></div></div>
      <div class="rm-item rm-done" data-target="bst-family"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Boosting Family</span><span class="rm-sub">AdaBoost to CatBoost, and what each changed</span></div></div>
      <div class="rm-item rm-done" data-target="bst-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">deep trees, linear learners, too many rounds</span></div></div>
      <div class="rm-item rm-done" data-target="bst-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, comparison table</span></div></div>
      <div class="rm-item rm-done" data-target="bst-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the boosting questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="bst-need"><span class="num">01</span>Why Boosting Exists</h2>
  <p>Every model's error on new data can be split into two kinds, which you met in <a class="xref" data-note="ml_core">Core Concepts</a>. <strong>Variance</strong> is the part of the error that comes from the model being too sensitive to the particular rows it was trained on: train it on a slightly different sample and its predictions jump around, so its mistakes are partly random. <strong>Bias</strong> is the part that comes from the model being too simple for the pattern: whatever sample you give it, it makes the <em>same</em> mistake, because it cannot express the right answer. Bagging and random forests (<a class="xref" data-note="ml_bagging">Bagging</a>, <a class="xref" data-note="ml_rf">Random Forest</a>) attack variance. They train many deep trees on different random samples and average them, and because the trees' random mistakes point in different directions, the average cancels them out.</p>
  <p>Averaging has a limit, though. If every model in the team leans the same way, the average leans that way too. Averaging can only remove the part of the error that differs from model to model; it can do nothing about a mistake that all of them share. So a team of models that are each too simple stays too simple, however many of them you average. Boosting exists to fix that second kind of error.</p>
  <p>Let us see this on the running example. A college cricket captain kept a diary of 14 evenings, D1 to D14 (it is Quinlan's classic "PlayTennis" table, renamed). For each day he wrote down the outlook, the humidity and the wind, and how many club members came to the ground, the <strong>turnout</strong>. Our models will predict turnout. The simplest useful model is a <strong>stump</strong>: a decision tree that asks just one yes/no question, such as "Is the humidity high?", and predicts one number for "yes" and another for "no". (<code>play.py</code>, from <a class="xref" data-note="ml_dtree">Decision Trees</a>, simply holds the diary as a pandas DataFrame called <code>df</code>.) We compare one stump, an average of 200 bagged stumps, and two boosted teams:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df                       # the captain's 14-day cricket diary
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor, GradientBoostingRegressor

print(df[["Outlook", "Humidity", "Wind", "Turnout"]].T.to_string())
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)   # yes/no columns
y = df.Turnout.values.astype(float)
print(f"mean turnout {y.mean():.2f}, MSE of always guessing it {y.var():.2f}")

stump = DecisionTreeRegressor(max_depth=1)
models = {
    "1 stump":                     stump,
    "bagging, 200 stumps":         BaggingRegressor(stump, n_estimators=200, random_state=0),
    "boosting, 300 stumps":        GradientBoostingRegressor(max_depth=1, n_estimators=300, learning_rate=0.1),
    "boosting, 300 depth-2 trees": GradientBoostingRegressor(max_depth=2, n_estimators=300, learning_rate=0.1)}
for name, m in models.items():
    m.fit(X, y)
    print(f"{name:28s} training MSE {np.mean((m.predict(X) - y) ** 2):6.2f}")</div>
  <div class="fx" data-lang="text">             D1      D2        D3    D4      D5      D6        D7     D8      D9     D10     D11       D12       D13     D14
Outlook   Sunny   Sunny  Overcast  Rain    Rain    Rain  Overcast  Sunny   Sunny    Rain   Sunny  Overcast  Overcast    Rain
Humidity   High    High      High  High  Normal  Normal    Normal   High  Normal  Normal  Normal      High    Normal    High
Wind       Weak  Strong      Weak  Weak    Weak  Strong    Strong   Weak    Weak    Weak  Strong    Strong      Weak  Strong
Turnout      24      20        36    32      44      22        42     26      40      46      38        38        48      20
mean turnout 34.00, MSE of always guessing it 91.43
1 stump                      training MSE  55.43
bagging, 200 stumps          training MSE  43.60
boosting, 300 stumps         training MSE  20.62
boosting, 300 depth-2 trees  training MSE   2.48</div>
  <p>The table at the top is the whole dataset: the average turnout is 34, and always guessing 34 leaves a mean squared error (MSE) of 91.43. We look at <em>training</em> error here on purpose, because bias is exactly the error a model makes even on the data it has already seen. One stump brings the error down to 55.43. Averaging 200 bagged stumps only reaches 43.60: different bootstrap samples make different stumps pick slightly different questions, so the average is a little smoother, but every member can still ask only one question, and the average of one-question answers is still a blurred one-question answer. Boosting 300 stumps reaches 20.62, and boosting 300 small two-question trees reaches 2.48. Bagging made the stump steadier; boosting made the team able to say things no single member could.</p>
  <p>The same thing happens on real-sized data. All the tree notes share a synthetic churn dataset: 20,000 made-up mobile customers with 12 numeric columns plus two columns of pure noise, labelled 1 if the customer left. It is split into 12,000 training rows, 3,000 validation rows (for choosing settings) and 5,000 test rows (for the final check). Every churn example on this page starts from this setup:</p>
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
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import BaggingClassifier, GradientBoostingClassifier
for name, m in {
    "1 stump":               DecisionTreeClassifier(max_depth=1),
    "bagging, 300 stumps":   BaggingClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=300, random_state=0),
    "boosting, 300 stumps":  GradientBoostingClassifier(max_depth=1, n_estimators=300, random_state=0),
    "boosting, 300 depth-3": GradientBoostingClassifier(max_depth=3, n_estimators=300, random_state=0),
}.items():
    m.fit(Xtr, ytr)
    print(f"{name:22s} train acc {m.score(Xtr, ytr):.3f}   validation acc {m.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">1 stump                train acc 0.601   validation acc 0.597
bagging, 300 stumps    train acc 0.601   validation acc 0.596
boosting, 300 stumps   train acc 0.667   validation acc 0.652
boosting, 300 depth-3  train acc 0.873   validation acc 0.827</div>
  <p>Bagging 300 stumps is no better than one stump (0.596 validation accuracy against 0.597), which is exactly what "averaging cannot fix bias" predicts. Boosting the same 300 stumps lifts accuracy to 0.652, and boosting 300 three-question trees to 0.827. Notice also that training and validation accuracy stay close for the boosted stumps (0.667 and 0.652): their problem is not overfitting, it is being too simple, and boosting removes some of that simplicity.</p>
  <p>How does boosting manage this? Think of a team chasing 250 runs in a one-day cricket match. The opening pair puts on 120. The next pair does not start again from zero; their whole job is the 130 still needed. The pair after them plays for whatever is left after that. No pair has to be brilliant; each only has to make some progress on what remains, and all their runs add up to the total. Bagging, by contrast, would be like sending four separate teams to chase 250 from scratch and then averaging their scores.</p>
  <p>That is the definition. <strong>Boosting</strong> is a family of ensemble methods that build a strong model as a weighted sum of weak models trained <strong>sequentially</strong>, where each new model is trained to concentrate on what the current team still gets wrong. Because each member works on the remainder of the problem, the sum can describe patterns that no member can, which is why boosting mainly reduces bias. The figure contrasts the two ways of building a team of trees:</p>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720"><defs><marker id="bst-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="170" y="20" text-anchor="middle" font-size="13" font-weight="700">Bagging: in parallel</text><rect x="120" y="34" width="100" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="170" y="54" text-anchor="middle" font-size="12">training data</text><line x1="170" y1="64" x2="50" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="16" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="50" y="124" text-anchor="middle" font-size="11">sample 1</text><line x1="50" y1="134" x2="50" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="16" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="50" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="50" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><line x1="170" y1="64" x2="130" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="96" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="130" y="124" text-anchor="middle" font-size="11">sample 2</text><line x1="130" y1="134" x2="130" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="96" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="130" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="130" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><line x1="170" y1="64" x2="210" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="176" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="210" y="124" text-anchor="middle" font-size="11">sample 3</text><line x1="210" y1="134" x2="210" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="176" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="210" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="210" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><line x1="170" y1="64" x2="290" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="256" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="290" y="124" text-anchor="middle" font-size="11">sample 4</text><line x1="290" y1="134" x2="290" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="256" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="290" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="290" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="110" y="228" width="120" height="30" rx="6" class="fg sg"/><text x="170" y="248" text-anchor="middle" font-size="12">average / vote</text><text x="170" y="284" text-anchor="middle" class="tm" font-size="11">independent trees → less variance</text><line x1="355" y1="10" x2="355" y2="290" stroke="currentColor" stroke-opacity="0.2"/><text x="540" y="20" text-anchor="middle" font-size="13" font-weight="700">Boosting: in sequence</text><rect x="370" y="106" width="60" height="28" rx="5" class="ft st"/><text x="400" y="124" text-anchor="middle" font-size="11">tree 1</text><text x="400" y="96" text-anchor="middle" class="tm" font-size="10.5">data</text><line x1="430" y1="120" x2="458" y2="120" class="sr" stroke-width="1.6" marker-end="url(#bst-ar)"/><line x1="400" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="460" y="106" width="60" height="28" rx="5" class="ft st"/><text x="490" y="124" text-anchor="middle" font-size="11">tree 2</text><text x="490" y="96" text-anchor="middle" class="tm" font-size="10.5">errors left</text><line x1="520" y1="120" x2="548" y2="120" class="sr" stroke-width="1.6" marker-end="url(#bst-ar)"/><line x1="490" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="550" y="106" width="60" height="28" rx="5" class="ft st"/><text x="580" y="124" text-anchor="middle" font-size="11">tree 3</text><text x="580" y="96" text-anchor="middle" class="tm" font-size="10.5">errors left</text><line x1="610" y1="120" x2="638" y2="120" class="sr" stroke-width="1.6" marker-end="url(#bst-ar)"/><line x1="580" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="640" y="106" width="60" height="28" rx="5" class="ft st"/><text x="670" y="124" text-anchor="middle" font-size="11">tree 4</text><text x="670" y="96" text-anchor="middle" class="tm" font-size="10.5">errors left</text><line x1="670" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="420" y="228" width="230" height="30" rx="6" class="fg sg"/><text x="535" y="248" text-anchor="middle" font-size="12">F₀ + ν·(tree 1 + … + tree 4)</text><text x="535" y="284" text-anchor="middle" class="tm" font-size="11">each tree fixes the rest → less bias</text><text x="535" y="60" text-anchor="middle" class="tr" font-size="11">red arrows: "here is what we still get wrong"</text></svg><figcaption>The two ways to build a team of trees. Bagging trains independent deep trees on resampled data and averages them. Boosting trains small trees one after another; each one is aimed at the errors the previous ones left, and their shrunken outputs are added.</figcaption></figure>
  <p>On the left, bagging draws several random samples of the training data, grows one deep tree on each, completely independently of the others, and averages them at the end. On the right, boosting grows a small tree on the data, then looks at what that tree got wrong (the red arrows) and grows the second tree on exactly that, then the third on what the first two still get wrong, and so on. The final model is a starting value plus a scaled-down sum of all the trees. The rest of this page explains each piece of the right-hand side: what the small trees are, what "what is still wrong" means, why the outputs are scaled down by ν, and when to stop adding trees.</p>

  <h2 id="bst-weak"><span class="num">02</span>Weak Learners</h2>
  <p>Boosting deliberately builds its team from models that are poor on their own. A <strong>weak learner</strong> is a model that is only slightly better than guessing, but reliably so: whatever emphasis you put on the training rows, it can find something a little better than a coin flip. For a yes/no task, that means an error rate just below 50%. The stump is the classic weak learner. It trains in an instant, it barely changes when the data changes a little (very low variance), and on its own it is far too simple for anything interesting (high bias).</p>
  <p>On the diary a stump can ask one of five questions, because the word columns allow five yes/no questions: Overcast? Sunny? Rain? Humidity high? Wind strong? Before any question is asked, the total squared error around the mean is 14 × 91.43 = 1280. If we ask each question and let each side predict its own average turnout, the error left over is:</p>
  <table class="tbl">
    <tr><th>question</th><th>Overcast?</th><th>Sunny?</th><th>Rain?</th><th>Humidity high?</th><th>Wind strong?</th></tr>
    <tr><th>squared error left (from 1280)</th><td>1005.6</td><td>1129.4</td><td>1268.8</td><td><b>776.0</b></td><td>1112.0</td></tr>
  </table>
  <p>The best question, "Humidity high?", removes (1280 − 776) / 1280 = 39% of the error. "Overcast?" removes 21%, and "Rain?" barely 1%. That is what a weak learner looks like: clearly better than guessing the average, nowhere near good.</p>
  <p>Why should a pile of weak models ever become strong? This was a real open question. In 1988 Kearns and Valiant asked whether being able to find slightly-better-than-chance models always means you can build a model as accurate as you like. In 1990 Schapire proved that the answer is yes, with a construction: train learner 1; train learner 2 on a sample in which half the rows are ones learner 1 got wrong; train learner 3 on rows where 1 and 2 disagree; let the three vote. The intuition is the jury arithmetic from <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>. If three voters each have error e and their mistakes are independent, the majority is wrong only when at least two of them are, which happens with probability 3e²(1 − e) + e³ = 3e² − 2e³. Apply that again to three such committees, and again:</p>
  <table class="tbl">
    <tr><th>level</th><th>learners used</th><th>error of each voter e</th><th>majority-of-3 error 3e² − 2e³</th></tr>
    <tr><td>0</td><td>1</td><td>—</td><td>0.300</td></tr>
    <tr><td>1</td><td>3</td><td>0.300</td><td>3(0.09) − 2(0.027) = 0.216</td></tr>
    <tr><td>2</td><td>9</td><td>0.216</td><td>0.120</td></tr>
    <tr><td>3</td><td>27</td><td>0.120</td><td>0.040</td></tr>
    <tr><td>4</td><td>81</td><td>0.040</td><td>0.005</td></tr>
  </table>
  <p>Error 0.3 becomes 0.005 in four levels. The catch is the phrase "if their mistakes are independent". Three stumps trained on the same data make the same mistakes, so their vote is no better than one of them. The whole art of boosting is <em>forcing</em> each new learner to be different by showing it the part of the problem the others failed on. Schapire did it by filtering rows; AdaBoost (Freund and Schapire, 1995) did it by re-weighting rows; gradient boosting does it by changing the target, as the next section shows.</p>
  <p>How weak should the learner be? Not as weak as possible. The learner must be simple enough that it does not solve everything in one go, because a learner that fits the training data perfectly leaves nothing for the next ones to correct. But it must also be rich enough to express the kinds of pattern the data contains. The usual choices compare like this:</p>
  <table class="tbl">
    <tr><th>weak learner</th><th>what a sum of them can express</th><th>in practice</th></tr>
    <tr><td>stump (depth 1)</td><td>one separate effect per feature, added up; no "this AND that"</td><td>AdaBoost's default; readable</td></tr>
    <tr><td>tree of depth 2–8</td><td>combinations (interactions) of up to that many features</td><td>the usual choice for gradient boosting (sklearn default depth 3; LightGBM 31 leaves)</td></tr>
    <tr><td>fully grown tree</td><td>everything at once; nothing is left for later rounds</td><td>not weak: do not boost it (section 10)</td></tr>
    <tr><td>linear model</td><td>still a straight line, because a sum of lines is a line</td><td>boosting adds nothing (section 10)</td></tr>
  </table>
  <p>Trees are the default weak learner because they are fast, need no feature scaling, cope with mixed column types, can be fitted to any numeric target (which boosting needs, as you are about to see), and let you control how many features may combine simply by choosing the depth.</p>

  <h2 id="bst-seq"><span class="num">03</span>Sequential Correction</h2>
  <p>A single stump removes at most 39% of the diary's error, and averaging stumps only blurs them. How can a second stump find out what the first one missed, so that it adds something new instead of repeating the first? The simplest answer, and the heart of all boosting, is to train the second stump not on the turnout itself but on the <strong>residuals</strong>: the residual of a day is its true value minus the team's current prediction, in other words what the team still gets wrong on that day. A positive residual means "we predicted too few players", a negative one "too many".</p>
  <p>Think of a tailor fitting a suit. The first fitting gets the overall size right. At the second fitting the tailor does not cut a new suit; he looks only at where the current one is still off (the sleeves are long) and fixes that. At the third fitting he looks at what is still off after that. Each fitting works on the remaining error.</p>
  <p>Here is the procedure on the diary, step by step. Call the team's prediction F.</p>
  <p><strong>Start.</strong> Before any question, the best single guess for every day is the mean: F₀ = 476 / 14 = 34 players. The residuals y − F₀ are D1 −10, D2 −14, D3 +2, D4 −2, D5 +10, D6 −12, D7 +8, D8 −8, D9 +6, D10 +12, D11 +4, D12 +4, D13 +14, D14 −14, and the MSE is 91.43.</p>
  <p><strong>Round 1.</strong> Fit a stump to these residuals, trying all five questions. "Humidity high?" wins (the table in section 02). Its "yes" days are D1, D2, D3, D4, D8, D12, D14, whose residuals average (−10 − 14 + 2 − 2 − 8 + 4 − 14) / 7 = −42 / 7 = −6. The residuals add up to zero, so the seven other days average +6. Adding this stump to the team gives F₁ = 34 − 6 = 28 on humid days and 34 + 6 = 40 on the rest. MSE drops to 55.43.</p>
  <p><strong>Round 2.</strong> Recompute the residuals, y − F₁, and fit the next stump to <em>those</em>. Now "Humidity high?" is useless: both of its sides already have an average residual of exactly 0, so asking it again would add nothing. The best question is "Overcast?": the four overcast days D3, D7, D12, D13 now have residuals +8, +2, +10, +8, average +7, and the other ten average −2.8. MSE drops to 35.83.</p>
  <p><strong>Round 3.</strong> On the residuals after round 2 the best question is "Wind strong?": −4.47 on windy days, +3.35 on calm days. MSE 20.87.</p>
  <p>The code below runs exactly this loop for ten rounds: compute residuals, try the five questions, keep the one that leaves the least squared error, and add its two leaf averages to the team.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
     "Humidity high?": df.Humidity == "High", "Wind strong?": df.Wind == "Strong"}
Q = {k: v.values for k, v in Q.items()}               # the five yes/no questions a stump can ask
y = df.Turnout.values.astype(float)

def best_stump(r):
    """Try all five questions; keep the one whose two leaf means leave the smallest squared error."""
    sse = {k: ((r[q] - r[q].mean()) ** 2).sum() + ((r[~q] - r[~q].mean()) ** 2).sum() for k, q in Q.items()}
    k = min(sse, key=sse.get)
    return k, Q[k], r[Q[k]].mean(), r[~Q[k]].mean()

F = np.full(14, y.mean())                             # F0 = mean turnout for every day
print(f"start: F0 = {y.mean():.2f}   MSE {np.mean((y - F) ** 2):.2f}")
for m in range(1, 11):
    r = y - F                                         # residuals: what the team still gets wrong
    k, q, yes, no = best_stump(r)
    F = F + np.where(q, yes, no)                      # add the stump in full
    if m &lt;= 3 or m == 10:
        print(f"round {m:2d}: {k:15s} yes {yes:+6.2f}  no {no:+6.2f}   MSE {np.mean((y - F) ** 2):6.2f}")</div>
  <div class="fx" data-lang="text">start: F0 = 34.00   MSE 91.43
round  1: Humidity high?  yes  -6.00  no  +6.00   MSE  55.43
round  2: Overcast?       yes  +7.00  no  -2.80   MSE  35.83
round  3: Wind strong?    yes  -4.47  no  +3.35   MSE  20.87
round 10: Sunny?          yes  +0.02  no  -0.01   MSE  20.62</div>
  <p>Rounds 1 to 3 match the hand calculation: Humidity high?, then Overcast?, then Wind strong?, with MSE 91.43 → 55.43 → 35.83 → 20.87. Each stump asked a <em>different</em> question, because each one looked at what was left, and what was left no longer contained the patterns the earlier stumps had already captured. Follow one day to see the sum being built: D13 (overcast, normal humidity, calm) starts at 34, gets +6 for "not humid", +7 for "overcast" and +3.35 for "calm", reaching 50.35 against a true turnout of 48. Every prediction is simply the starting mean plus one number from each round.</p>
  <p>Look also at round 10. Its stump adds only +0.02 or −0.01, and the MSE has stopped at 20.62. The gains shrink quickly (−36.0, −19.6, −15.0, then almost nothing) because with one-question stumps there is a floor the team cannot go below; section 06 explains what that floor is. Deeper trees keep going (2.48 in section 01).</p>
  <p>For a yes/no target such as "was the match played?" there is no residual to subtract, so the first successful boosting algorithm did something else: it kept a <em>weight</em> on every row and made the rows the team got wrong heavier, so the next stump had to care about them. That is <a class="xref" data-note="ml_adaboost">AdaBoost</a>. Gradient boosting later showed that both ideas are the same thing in disguise, by replacing the residual with the gradient of a loss (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</p>

  <h2 id="bst-add"><span class="num">04</span>The Additive Model</h2>
  <p>We now have a loop that works. To reason about it (what is it actually minimising? why add instead of average? how big should each step be?) we need to write it down as a formula. After M rounds the team's prediction is a sum:</p>
  <p style="text-align:center"><strong>F_M(x) = F₀ + ν·h₁(x) + ν·h₂(x) + … + ν·h_M(x)</strong>, or one round at a time, <strong>F_m(x) = F_{m−1}(x) + ν·h_m(x)</strong></p>
  <p>Here x is one row (one day), F₀ is the constant starting guess (34 on the diary), each h_m is the weak learner added in round m, and ν (the Greek letter "nu") is the <strong>learning rate</strong>, a number between 0 and 1 that scales each learner down; in section 03 it was 1. For regression, F is the prediction itself. For classification, F is a score (the log-odds), which is turned into a probability at the end. A model of this shape is called an <strong>additive model</strong>: a weighted sum of simple functions. Compare it with linear regression, ŷ = b₀ + Σ βⱼxⱼ, which is a weighted sum of the columns you were given. A boosted model is a weighted sum of columns it <em>invents</em>: each small tree is a new feature, chosen from the enormous set of all possible small trees.</p>
  <p>Ideally we would choose all M trees and their weights together, so that the whole sum minimises the error. That is hopeless: the number of possible trees is astronomical and the choices interact. So boosting is <strong>greedy</strong>. It adds one term at a time, picks that term to reduce the loss as much as possible <em>given everything already in the model</em>, and never goes back to change an earlier term. This strategy is called <strong>forward stagewise additive modelling</strong>. "Forward" because terms are only ever added; "stagewise" because old terms are frozen (a "stepwise" method would re-fit old terms each time a new one arrives, which is much more expensive). Written out, with L the loss being minimised, each round solves</p>
  <p style="text-align:center"><strong>(β_m, h_m) = argmin over β, h of Σᵢ L(yᵢ, F_{m−1}(xᵢ) + β·h(xᵢ))</strong></p>
  <p>which reads: among all small trees h and multipliers β, pick the pair that makes the total loss over the training rows smallest when added to the current team. Think of building a wall one brick at a time: you choose each brick to fit the gap left by the bricks already laid, and you never pull an old brick out.</p>
  <p>Every algorithm in the boosting family is a different way of solving that one line, depending on the loss:</p>
  <table class="tbl">
    <tr><th>loss L</th><th>what the round's step becomes</th><th>algorithm</th></tr>
    <tr><td>squared error ½(y − F)²</td><td>fit the tree to the residuals y − F</td><td>least-squares boosting (section 03)</td></tr>
    <tr><td>exponential e^{−yF}</td><td>re-weight rows by e^{−yF}, fit a classifier, β = ½ln((1−ε)/ε)</td><td><a class="xref" data-note="ml_adaboost">AdaBoost</a></td></tr>
    <tr><td>any differentiable loss</td><td>fit the tree to the negative gradient of the loss, then choose each leaf's value</td><td><a class="xref" data-note="ml_gbm">Gradient Boosting</a></td></tr>
    <tr><td>any twice-differentiable loss plus a penalty</td><td>use first and second derivatives; leaf value −G/(H + λ)</td><td><a class="xref" data-note="ml_xgboost">XGBoost</a> and later libraries</td></tr>
  </table>
  <p>For squared error we can check the formula against what we did by hand. Once a tree h has been fitted to the residuals r, the best multiplier β for it is the slope of a line through the origin fitted to r against h, which is β = Σrᵢhᵢ / Σhᵢ². In round 1 on the diary, h is −6 on the seven humid days and +6 on the other seven. On the humid days Σrh = (−6) × (their residual sum, −42) = 252; on the others it is 6 × 42 = 252; total 504. And Σh² = 14 × 36 = 504. So β = 504 / 504 = 1: a regression tree whose leaves hold the average residual is already the best possible step, which is why section 03 could add each stump in full. The code below writes forward stagewise fitting directly, computing β every round, and compares the result with sklearn's <code>GradientBoostingRegressor</code> on 500 random rows:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingRegressor

def forward_stagewise(X, y, M=100, nu=0.1, depth=2):
    F = np.full(len(y), y.mean())                  # F0: best constant for squared error
    f0, terms = y.mean(), []
    for m in range(M):
        r = y - F                                  # what the team still gets wrong
        h = DecisionTreeRegressor(max_depth=depth, random_state=0).fit(X, r)
        hx = h.predict(X)
        beta = (r @ hx) / (hx @ hx)                # line search: best multiplier for h
        F = F + nu * beta * hx                     # shrink, add, never revisit old terms
        terms.append((nu * beta, h))
        if m &lt; 3:
            print(f"round {m+1}: beta = {beta:.6f}   train MSE {np.mean((y - F)**2):.4f}")
    return lambda Xn: f0 + sum(c * h.predict(Xn) for c, h in terms)

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, (500, 3))
y = X[:, 0] * np.sin(X[:, 1]) + X[:, 2] + rng.normal(0, 0.5, 500)
ours = forward_stagewise(X, y)
sk = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=2, random_state=0).fit(X, y)
print(f"largest gap between ours and sklearn: {np.abs(ours(X) - sk.predict(X)).max():.1e}")</div>
  <div class="fx" data-lang="text">round 1: beta = 1.000000   train MSE 21.7193
round 2: beta = 1.000000   train MSE 20.3672
round 3: beta = 1.000000   train MSE 19.2431
largest gap between ours and sklearn: 8.9e-15</div>
  <p>β comes out as exactly 1.000000 in every round, as the algebra said, and our 15-line loop agrees with sklearn's gradient boosting to within 9 × 10⁻¹⁵, which is floating-point rounding. So sklearn's regressor with squared error <em>is</em> this loop: start at the mean, fit a tree to the residuals, add ν times it, repeat.</p>
  <p>Put the formula next to bagging's and the difference between the two ideas is plain. Bagging computes F = (1/M)·Σ h_m, where every h_m is trained independently on the same target. Boosting computes F = F₀ + ν·Σ h_m, where every h_m is trained on what the sum before it gets wrong. Both are "a sum of trees", but one averages independent guesses and the other adds corrections.</p>

  <h2 id="bst-shrink"><span class="num">05</span>Shrinkage (the Learning Rate)</h2>
  <p>Section 04 showed that, for squared error, the best step for each tree is the full step, β = 1. But "best" here means best <em>on the training rows</em>. Each tree is fitted to the residuals of a finite, noisy sample, so its exact leaf values are partly luck. Adding it at full strength commits the model fully to that luck, and later rounds then have to spend effort undoing earlier overshoots. Friedman's remedy, called <strong>shrinkage</strong>, is to add only a fraction ν of each tree: F_m = F_{m−1} + ν·h_m with ν somewhere between 0 and 1. ν is the <strong>learning rate</strong>.</p>
  <p>Think of reversing a car into a tight parking space. You could turn the wheel as far as your estimate says and go for it, but if the estimate is a little off you hit the kerb and must correct a lot. Experienced drivers make many small adjustments instead, each based on where the car is now. Each small move is less ambitious, but the combination ends up more accurate, because no single misjudgement can push the car far off course.</p>
  <p>On the diary, we rerun the loop from section 03 keeping only ν = 1, 0.5 or 0.1 of each stump:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
# same Q, y and best_stump as before; now keep only a fraction nu of each stump
for nu in [1.0, 0.5, 0.1]:
    F = np.full(14, y.mean())
    asked, mse = [], []
    for m in range(1, 31):
        k, q, yes, no = best_stump(y - F)
        F = F + nu * np.where(q, yes, no)
        asked.append(k)
        mse.append(np.mean((y - F) ** 2))
    print(f"nu={nu}: rounds 1-3 ask {asked[:3]}")
    print(f"        MSE after 1, 3, 10, 30 rounds: {mse[0]:.2f}, {mse[2]:.2f}, {mse[9]:.2f}, {mse[29]:.2f}")</div>
  <div class="fx" data-lang="text">nu=1.0: rounds 1-3 ask ['Humidity high?', 'Overcast?', 'Wind strong?']
        MSE after 1, 3, 10, 30 rounds: 55.43, 20.87, 20.62, 20.62
nu=0.5: rounds 1-3 ask ['Humidity high?', 'Overcast?', 'Wind strong?']
        MSE after 1, 3, 10, 30 rounds: 64.43, 39.65, 21.69, 20.62
nu=0.1: rounds 1-3 ask ['Humidity high?', 'Humidity high?', 'Humidity high?']
        MSE after 1, 3, 10, 30 rounds: 84.59, 74.56, 53.99, 29.65</div>
  <p>Smaller steps move more slowly. With ν = 1 the MSE reaches the floor of 20.62 by round 10; with ν = 0.5 it gets there by round 30; with ν = 0.1 it is still at 29.65 after 30 rounds. Look at what ν = 0.1 does in its first three rounds: it asks "Humidity high?" three times in a row. Each round keeps only a tenth of the humidity pattern, so the same question stays the most useful one until its pattern has been used up. On training data, small steps simply look slow.</p>
  <p>The benefit appears only on data the model has not seen. On the churn data, we train sklearn's <code>HistGradientBoostingClassifier</code> (a fast gradient booster, explained in <a class="xref" data-note="ml_gbm">Gradient Boosting</a>) for 3,000 rounds at four learning rates, and after every round measure the <strong>log-loss</strong> on the validation rows. Log-loss is the standard error measure for predicted probabilities (<a class="xref" data-note="ml_classification">Classification</a>): lower is better, and it punishes confident wrong answers heavily.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import log_loss
for lr in [1.0, 0.3, 0.1, 0.03]:
    m = HistGradientBoostingClassifier(learning_rate=lr, max_iter=3000, early_stopping=False,
                                       random_state=0).fit(Xtr, ytr)
    va = np.array([log_loss(yva, p[:, 1]) for p in m.staged_predict_proba(Xva)])
    b = int(np.argmin(va))
    print(f"lr={lr:4.2f}  best validation log-loss {va[b]:.3f} at round {b+1:4d}   at round 3000: {va[-1]:.3f}")</div>
  <div class="fx" data-lang="text">lr=1.00  best validation log-loss 0.429 at round   10   at round 3000: 12.099
lr=0.30  best validation log-loss 0.345 at round   47   at round 3000: 0.873
lr=0.10  best validation log-loss 0.320 at round  373   at round 3000: 0.618
lr=0.03  best validation log-loss 0.320 at round 1340   at round 3000: 0.349</div>
  <p>Three lessons come out of these four lines. First, full steps are clearly worse: ν = 1 reaches its best validation log-loss of 0.429 after only 10 rounds and then falls apart, and by round 3,000 its predictions are so extreme that the log-loss is above 12. Second, smaller steps reach a <em>better</em> best (0.345 at ν = 0.3, 0.320 at ν = 0.1), and the number of rounds needed to get there grows roughly like 1/ν: 47 rounds at 0.3, 373 at 0.1, 1,340 at 0.03. Third, below about 0.1 the best score stops improving (0.320 both times) while the cost keeps growing; ν = 0.03 needs 3.6 times as many rounds for the same result. That is why ν = 0.05 to 0.1 is the usual starting point.</p>
  <p>The practical consequence is that ν and the number of rounds are not two separate settings. They trade off against each other: halve ν and you need roughly twice as many rounds. Lowering ν without adding rounds just gives an underfit model. The standard recipe is to fix ν, allow plenty of rounds, and let the validation data decide when to stop, which is the subject of the next section. (There is also a theoretical view: with a very small ν, boosting traces out a path very similar to L1-regularised (lasso) fitting over the space of all trees, which is one explanation of why shrinkage acts as a regulariser; see <a class="xref" data-note="ml_ridge_lasso">Ridge &amp; Lasso</a>.)</p>

  <h2 id="bst-bv"><span class="num">06</span>Bias, Variance and the Number of Rounds</h2>
  <p>How many rounds should boosting run? Two things happen as rounds are added, and they pull in opposite directions.</p>
  <p>The first is that bias goes down, but only to a floor set by the weak learner. On the diary, stumps stopped at an MSE of 20.62 whatever ν and however many rounds. The reason is what a sum of stumps can express. Each stump adds one number for one answer to one question, so the team's prediction is always turnout = mean + (a humidity effect) + (an outlook effect) + (a wind effect). It can never say "on rainy days the wind matters a lot, but on overcast days it hardly matters", and that is exactly what the diary shows: rainy and windy days had about 21 players (D6 22, D14 20), while overcast and windy days had about 40 (D7 42, D12 38). When the effect of one feature depends on the value of another, that is called an <strong>interaction</strong>, and a sum of one-question stumps cannot represent it. The missing interaction is bias, and no number of extra rounds removes it. Two-question trees can ask "Rain? and then Windy?", which is why boosting them reached 2.48. Deeper base trees lower the floor.</p>
  <p>The second is that variance goes up. Every round also fits a little of the training sample's noise, and the 14 diary days are too few to see it, so we go back to the churn data and look at the ν = 0.1 run from section 05 round by round, on training and validation rows:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import log_loss
m = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=3000, early_stopping=False,
                                   random_state=0).fit(Xtr, ytr)
tr = [log_loss(ytr, p[:, 1]) for p in m.staged_predict_proba(Xtr)]
va = [log_loss(yva, p[:, 1]) for p in m.staged_predict_proba(Xva)]
for r in [1, 10, 100, int(np.argmin(va)) + 1, 1000, 3000]:
    print(f"round {r:4d}: train log-loss {tr[r-1]:.3f}   validation log-loss {va[r-1]:.3f}")

es = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=3000, early_stopping=True,
                                    validation_fraction=0.2, n_iter_no_change=30, random_state=0).fit(Xtr, ytr)
print(f"with early stopping: stopped after {es.n_iter_} rounds, validation log-loss "
      f"{log_loss(yva, es.predict_proba(Xva)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">round    1: train log-loss 0.659   validation log-loss 0.660
round   10: train log-loss 0.492   validation log-loss 0.498
round  100: train log-loss 0.259   validation log-loss 0.342
round  373: train log-loss 0.103   validation log-loss 0.320
round 1000: train log-loss 0.014   validation log-loss 0.360
round 3000: train log-loss 0.000   validation log-loss 0.618
with early stopping: stopped after 239 rounds, validation log-loss 0.328</div>
  <p>Training log-loss falls without stopping: 0.659 after one round, 0.103 at round 373, and essentially 0 by round 3,000, because given enough trees the model can memorise every training row. Validation log-loss falls only until round 373 (0.320) and then climbs, reaching 0.618 by round 3,000. Up to round 373 the drop in bias wins; after it, the extra rounds are fitting noise that does not exist in new data. The figure plots both curves:</p>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640"><line x1="60" y1="250" x2="620" y2="250" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="250" stroke="currentColor"/><line x1="60.0" y1="250" x2="60.0" y2="255" stroke="currentColor"/><text x="60.0" y="268" text-anchor="middle" class="tm" font-size="11">1</text><line x1="221.1" y1="250" x2="221.1" y2="255" stroke="currentColor"/><text x="221.1" y="268" text-anchor="middle" class="tm" font-size="11">10</text><line x1="382.1" y1="250" x2="382.1" y2="255" stroke="currentColor"/><text x="382.1" y="268" text-anchor="middle" class="tm" font-size="11">100</text><line x1="543.2" y1="250" x2="543.2" y2="255" stroke="currentColor"/><text x="543.2" y="268" text-anchor="middle" class="tm" font-size="11">1000</text><line x1="55" y1="217.1" x2="620" y2="217.1" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="221.1" text-anchor="end" class="tm" font-size="11">0.1</text><line x1="55" y1="184.3" x2="620" y2="184.3" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="188.3" text-anchor="end" class="tm" font-size="11">0.2</text><line x1="55" y1="151.4" x2="620" y2="151.4" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="155.4" text-anchor="end" class="tm" font-size="11">0.3</text><line x1="55" y1="118.6" x2="620" y2="118.6" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="122.6" text-anchor="end" class="tm" font-size="11">0.4</text><line x1="55" y1="85.7" x2="620" y2="85.7" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="89.7" text-anchor="end" class="tm" font-size="11">0.5</text><line x1="55" y1="52.9" x2="620" y2="52.9" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="56.9" text-anchor="end" class="tm" font-size="11">0.6</text><line x1="55" y1="20.0" x2="620" y2="20.0" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="24.0" text-anchor="end" class="tm" font-size="11">0.7</text><text x="340" y="292" text-anchor="middle" class="tm" font-size="11.5">boosting rounds (log scale)</text><text x="14" y="135" text-anchor="middle" class="tm" font-size="11.5" transform="rotate(-90 14 135)">log-loss</text><polyline points="60.0,33.3 108.5,42.6 136.8,50.8 157.0,58.3 172.6,64.7 185.3,70.7 196.1,75.6 205.4,80.1 213.7,84.6 221.1,88.4 227.7,91.9 233.8,95.2 239.4,98.4 244.6,101.0 249.4,103.6 253.9,105.7 258.2,108.3 262.2,110.4 265.9,112.8 269.5,114.7 272.9,116.7 276.2,118.5 282.3,121.6 285.1,123.2 290.5,125.7 293.1,126.7 297.9,129.3 302.4,131.2 306.6,133.2 310.6,135.1 314.4,136.2 318.0,137.8 321.4,138.7 326.3,140.7 329.3,141.8 333.6,143.5 337.7,145.5 341.6,147.4 346.4,149.0 349.8,150.8 354.1,152.5 358.2,154.3 362.0,155.8 366.5,157.7 369.9,159.1 374.0,161.3 378.5,163.1 382.1,165.0 386.2,166.6 390.7,168.5 394.3,170.2 398.3,172.1 402.6,174.8 406.6,176.9 410.5,179.0 414.5,181.1 418.4,183.4 422.4,185.9 426.6,188.5 430.6,191.1 434.7,193.3 438.8,195.8 442.8,198.0 446.8,200.7 450.8,203.2 454.9,205.3 458.9,207.8 462.8,209.9 466.9,212.2 470.9,214.1 474.9,216.6 479.1,218.8 483.0,221.0 487.0,223.3 491.1,225.3 495.1,227.4 499.1,229.6 503.2,231.5 507.2,233.5 511.2,235.1 515.3,236.9 519.3,238.5 523.3,240.0 527.4,241.4 531.4,242.6 535.4,243.7 539.4,244.6 543.4,245.5 547.5,246.3 551.5,247.0 555.6,247.6 559.5,248.1 563.6,248.5 567.6,248.8 571.7,249.1 575.7,249.3 579.7,249.5 583.7,249.6 587.8,249.7 591.8,249.8 595.8,249.9 599.8,249.9 603.9,249.9 607.9,250.0 612.0,250.0 616.0,250.0 620.0,250.0" fill="none" class="st" stroke-width="2"/><polyline points="60.0,33.1 108.5,42.4 136.8,50.8 157.0,58.1 172.6,64.6 185.3,70.1 196.1,74.6 205.4,78.5 213.7,82.9 221.1,86.4 227.7,89.7 233.8,92.8 239.4,95.5 244.6,97.8 249.4,100.2 253.9,102.2 258.2,104.6 262.2,106.4 265.9,108.5 269.5,110.2 272.9,111.9 276.2,113.3 282.3,115.7 285.1,117.1 290.5,118.8 293.1,119.5 297.9,121.5 302.4,123.0 306.6,124.3 310.6,125.5 314.4,125.8 318.0,126.8 321.4,127.2 326.3,128.0 329.3,128.6 333.6,129.4 337.7,130.8 341.6,132.0 346.4,132.1 349.8,132.9 354.1,133.4 358.2,134.3 362.0,134.9 366.5,135.2 369.9,135.5 374.0,136.7 378.5,137.1 382.1,137.7 386.2,137.8 390.7,138.0 394.3,138.4 398.3,138.7 402.6,139.5 406.6,140.0 410.5,140.3 414.5,140.6 418.4,141.2 422.4,142.0 426.6,142.7 430.6,143.1 434.7,143.1 438.8,143.3 442.8,143.7 446.8,144.3 450.8,144.5 454.9,144.2 458.9,144.2 462.8,144.5 466.9,144.6 470.9,144.3 474.9,144.7 479.1,144.3 483.0,144.3 487.0,144.6 491.1,144.3 495.1,144.0 499.1,143.3 503.2,142.6 507.2,142.4 511.2,141.4 515.3,140.6 519.3,140.1 523.3,139.2 527.4,137.3 531.4,136.1 535.4,134.5 539.4,133.0 543.4,131.5 547.5,129.5 551.5,127.1 555.6,124.7 559.5,122.1 563.6,119.4 567.6,116.5 571.7,113.0 575.7,109.7 579.7,105.9 583.7,101.8 587.8,97.8 591.8,92.8 595.8,86.5 599.8,80.8 603.9,75.5 607.9,68.5 612.0,61.6 616.0,54.7 620.0,47.0" fill="none" class="sr" stroke-width="2"/><line x1="74" y1="221" x2="96" y2="221" class="st" stroke-width="2.5"/><text x="102" y="225" font-size="11.5">training log-loss</text><line x1="74" y1="238" x2="96" y2="238" class="sr" stroke-width="2.5"/><text x="102" y="242" font-size="11.5">validation log-loss</text><line x1="474.2" y1="20" x2="474.2" y2="250" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/><text x="469.2" y="32" text-anchor="end" class="tm" font-size="11">best: round 373</text></svg><figcaption>HistGradientBoosting on the churn data, learning rate 0.1. Training loss keeps falling towards 0; validation loss is lowest at round 373 and then climbs, because the extra rounds are fitting noise.</figcaption></figure>
  <p>The training curve heads steadily to 0, while the validation curve is U-shaped, with its lowest point at the dashed line. This is the most important practical difference from a random forest. A forest averages, so another tree can only make the average more stable, and you cannot overfit a forest by adding trees. Boosting adds, so every extra round fits whatever is left, and after a point what is left is noise. <strong>Every boosted model therefore needs a stopping rule.</strong> The standard one is <strong>early stopping</strong>: hold back part of the training data, measure the loss on it after every round, and stop once it has not improved for a set number of rounds (the "patience"). The last line of the output shows sklearn doing this automatically. With 20% of the training rows held back and a patience of 30, it stopped after 239 rounds with a validation log-loss of 0.328, close to the best value of 0.320 found by scanning every round, and nobody had to choose the number of rounds. (It stopped a little earlier than round 373 because it trained on 20% fewer rows and judged progress on its own held-out slice.)</p>
  <p>The main settings of a booster each move bias and variance in a predictable way:</p>
  <table class="tbl">
    <tr><th>setting</th><th>effect on bias</th><th>effect on variance</th></tr>
    <tr><td>more rounds</td><td>down</td><td>up, eventually</td></tr>
    <tr><td>deeper base trees</td><td>down (interactions)</td><td>up</td></tr>
    <tr><td>smaller learning rate ν</td><td>up per round (so more rounds are needed)</td><td>down</td></tr>
    <tr><td>training each tree on a random subsample of rows or columns</td><td>about the same</td><td>down</td></tr>
    <tr><td>larger minimum leaf size, penalties on leaf values</td><td>up slightly</td><td>down</td></tr>
  </table>
  <p>One historical puzzle belongs here. Early experiments found that AdaBoost's test error often kept falling even after its training error had reached zero, which seemed to say "boosting does not overfit". The explanation (Schapire and colleagues, 1998) is that extra rounds keep pushing training rows further from the decision boundary, making the classifier more confident without changing its training mistakes. It holds on clean data. With noisy labels AdaBoost does overfit, which leads to boosting's biggest weakness.</p>

  <h2 id="bst-noise"><span class="num">07</span>Noise and Outliers</h2>
  <p>Boosting's whole strategy is to focus on what the team still gets wrong. That is its strength, and it is also its blind spot. Suppose a row is wrong because the <em>data</em> is wrong: a turnout written down incorrectly, or a customer labelled as having left who actually stayed. No sensible model should fit such a row, because its features look like those of other, correctly labelled rows. But boosting cannot tell a genuinely hard row from a mistaken one. It sees a row the team gets wrong, and it keeps pushing the next learners towards it. A row with a wildly wrong value is called an <strong>outlier</strong>; a class label that is wrong is called <strong>label noise</strong>.</p>
  <p>It is like a teacher who gives extra lessons on whatever the class gets wrong in tests. That works well, until one question in the test has a misprinted answer key. Every student "fails" that question, so the teacher spends more and more lessons on it, teaching the class the wrong answer, while time for the real material shrinks.</p>
  <p>On the diary, suppose the captain wrote 83 instead of 22 for D6. Here is the first round of boosting on the clean and on the mistyped diary:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
y = df.Turnout.values.astype(float)
y_typo = y.copy(); y_typo[5] = 83                      # D6: 22 players written down as 83
for name, yy in [("clean diary", y), ("D6 typed as 83", y_typo)]:
    r = yy - yy.mean()
    sse = {k: ((r[q] - r[q].mean()) ** 2).sum() + ((r[~q] - r[~q].mean()) ** 2).sum() for k, q in Q.items()}
    q = Q[min(sse, key=sse.get)]
    print(f"{name:15s} F0 {yy.mean():5.2f}  D6 residual {r[5]:+6.2f}  "
          f"D6's share of the squared error {r[5]**2 / (r**2).sum():.0%}")
    print(f"{'':15s} round-1 stump (Humidity high?): yes {r[q].mean():+.2f}  no {r[~q].mean():+.2f}")</div>
  <div class="fx" data-lang="text">clean diary     F0 34.00  D6 residual -12.00  D6's share of the squared error 11%
                round-1 stump (Humidity high?): yes -6.00  no +6.00
D6 typed as 83  F0 38.36  D6 residual +44.64  D6's share of the squared error 61%
                round-1 stump (Humidity high?): yes -10.36  no +10.36</div>
  <p>D6's residual jumps from −12 to +44.64, and that one day now holds 61% of the total squared residual (on the clean diary it held 11%, and a fair share would be 1/14, about 7%). Squared error makes this worse than it looks, because squaring a residual of 44.64 gives about 1993, against 36 for a residual of 6. The first stump still asks "Humidity high?", but its answers are inflated: the starting mean rises from 34 to 38.36 and the "normal humidity" leaf from +6 to +10.36, so the six honest normal-humidity days are now predicted 48.7 instead of 40, nearly 9 players too many, all because of one wrong number. Every later round keeps chasing whatever is left of the typo.</p>
  <p>At scale, we flip 20% of the churn <em>training</em> labels at random (validation labels stay clean) and track validation accuracy as rounds are added, next to a random forest trained on the same labels:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
rng2 = np.random.default_rng(3)
flip = rng2.random(len(ytr)) &lt; 0.2
y_noisy = np.where(flip, 1 - ytr, ytr)                    # 20% of training labels made wrong
for name, yy in [("clean labels", ytr), ("20% flipped", y_noisy)]:
    m = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=1000, early_stopping=False,
                                       random_state=0).fit(Xtr, yy)
    acc = [np.mean(p == yva) for p in m.staged_predict(Xva)]   # validation labels stay clean
    rf = RandomForestClassifier(n_estimators=300, random_state=0).fit(Xtr, yy)
    print(f"{name:13s} boosting @50 {acc[49]:.3f}  @200 {acc[199]:.3f}  @1000 {acc[-1]:.3f}"
          f"  (best {max(acc):.3f} @ {int(np.argmax(acc))+1})   random forest {rf.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">clean labels  boosting @50 0.857  @200 0.869  @1000 0.875  (best 0.876 @ 446)   random forest 0.879
20% flipped   boosting @50 0.831  @200 0.825  @1000 0.797  (best 0.834 @ 83)   random forest 0.853</div>
  <p>With clean labels, boosting keeps improving to about 0.876 and holds there. With 20% of labels flipped it peaks early (0.834 at round 83) and then gets steadily <em>worse</em> as it fits more of the wrong labels: 0.825 at 200 rounds and 0.797 at 1,000. The random forest barely notices the noise (0.879 to 0.853) and has no round count to get wrong. This booster uses log-loss, which is the gentler choice; with AdaBoost's exponential loss the damage is larger (<a class="xref" data-note="ml_adaboost">AdaBoost</a> shows it row by row).</p>
  <p>The remedies all limit how hard boosting can chase a single row. Use a loss that grows slowly for large mistakes: for regression, absolute error or the Huber loss instead of squared error (<a class="xref" data-note="ml_gbm">Gradient Boosting</a> computes what each one tells the next tree about the D6 typo); for classification, log-loss rather than exponential loss. Use a small learning rate together with early stopping, so the model stops before it reaches the noisy rows. Train each tree on a random subsample of rows, require a minimum number of rows per leaf, and, where possible, clean the labels. When labels are known to be very noisy, a random forest is often the safer choice.</p>

  <h2 id="bst-vs"><span class="num">08</span>Boosting vs Bagging</h2>
  <p>We now have two complete ways to build a team of trees, and interviewers almost always ask you to compare them. Bagging builds independent, deep trees and averages them; boosting builds dependent, shallow trees and adds them. Everything else in the table follows from that one difference. Because bagging's trees are independent, they can be trained in parallel, adding more of them can never hurt, and a wrong label affects only the trees whose bootstrap samples contain it, in the same way as any other row. Because boosting's trees each depend on the previous ones, rounds must run in order, there is a best number of rounds beyond which it overfits, and a wrong label gets more attention every round.</p>
  <table class="tbl">
    <tr><th></th><th>Bagging / Random Forest</th><th>Boosting</th></tr>
    <tr><td>how models are trained</td><td>in parallel, independently</td><td>in sequence, each depends on the ones before</td></tr>
    <tr><td>what each model sees</td><td>a random bootstrap sample of rows</td><td>all rows, re-weighted (AdaBoost) or with new targets (residuals, gradients)</td></tr>
    <tr><td>base learner</td><td>deep trees (low bias, high variance)</td><td>shallow trees (high bias, low variance)</td></tr>
    <tr><td>combination</td><td>plain average or majority vote</td><td>weighted sum F₀ + ν·Σh</td></tr>
    <tr><td>main error reduced</td><td>variance</td><td>bias (and some variance, through shrinkage)</td></tr>
    <tr><td>more models</td><td>never hurts, only slower</td><td>eventually overfits; needs early stopping</td></tr>
    <tr><td>label noise and outliers</td><td>robust</td><td>sensitive, depending on the loss</td></tr>
    <tr><td>tuning effort</td><td>low; defaults usually work</td><td>higher: ν, rounds, depth, subsampling</td></tr>
    <tr><td>parallelism</td><td>whole trees in parallel</td><td>rounds in sequence; split search inside a round in parallel</td></tr>
    <tr><td>built-in validation</td><td>out-of-bag error</td><td>early stopping on a held-out slice</td></tr>
    <tr><td>diary turnout, training MSE</td><td>200 bagged stumps 43.60</td><td>300 boosted stumps 20.62; depth-2 trees 2.48</td></tr>
  </table>
  <p>In practice the choice is empirical. On clean tabular data with enough rows, a tuned booster usually wins by a small margin; on very noisy labels, tiny datasets or when there is no time to tune, a forest is often as good and much harder to get wrong. On our churn data, which was generated with 5% flipped labels, a 300-tree random forest scores about 0.88, the same as the best boosters. The two ideas also combine: stochastic gradient boosting, XGBoost and LightGBM all train each tree on a random subsample of rows and columns, which is bagging-style randomness inside boosting, and a forest and a booster can be blended in a stacked model (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>).</p>

  <h2 id="bst-family"><span class="num">09</span>The Boosting Family</h2>
  <p>"Add small trees one after another, each aimed at what is left" is a plan, not yet an algorithm. The open question is <em>how</em> to aim the next tree at what is left, and each member of the boosting family is one answer to it. Each kept the plan and fixed a limitation of the one before:</p>
  <table class="tbl">
    <tr><th>algorithm (year)</th><th>how the next tree is aimed at the errors</th><th>what it changed</th><th>remaining weakness</th></tr>
    <tr><td><a class="xref" data-note="ml_adaboost">AdaBoost</a> (1995)</td><td>rows the team gets wrong get heavier weights; next tree fits the weighted rows</td><td>first practical booster</td><td>one fixed loss (exponential); noise-sensitive; mainly classification</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient Boosting</a> (2001)</td><td>next tree fits the negative gradient of any loss; each leaf's value is then optimised</td><td>any differentiable loss: regression, classification, quantiles, robust losses</td><td>slow exact split search; no penalties on leaf values</td></tr>
    <tr><td>Stochastic Gradient Boosting (2002)</td><td>same, on a random subsample of rows each round</td><td>lower variance, faster</td><td>same engineering limits</td></tr>
    <tr><td><a class="xref" data-note="ml_xgboost">XGBoost</a> (2014)</td><td>first and second derivatives of the loss for every row; leaf value −G/(H + λ)</td><td>penalties on tree size and leaf values, built-in missing-value handling, fast parallel and histogram split search</td><td>slower than LightGBM on very large data</td></tr>
    <tr><td><a class="xref" data-note="ml_lightgbm">LightGBM</a> (2017)</td><td>same objective, on features bucketed into bins</td><td>leaf-wise tree growth, smart row sampling (GOSS) and feature bundling (EFB): the fastest</td><td>leaf-wise trees overfit small data</td></tr>
    <tr><td><a class="xref" data-note="ml_catboost">CatBoost</a> (2017)</td><td>"ordered" boosting, symmetric trees</td><td>leak-free handling of categorical columns; strong defaults</td><td>slower per tree to train</td></tr>
    <tr><td>HistGradientBoosting (sklearn, 2019)</td><td>LightGBM-style bins inside sklearn</td><td>fast, handles missing values and categories, early stopping built in</td><td>fewer settings than the big libraries</td></tr>
  </table>
  <p>On the diary each would behave a little differently. AdaBoost would predict Play / No play, starting every day at weight 1/14 and making the days the stump gets wrong heavier. Gradient boosting with squared error would do exactly section 03; with absolute or Huber loss, the D6 typo would count for much less. XGBoost would give each day a gradient and a curvature, and its penalty λ would pull a leaf holding only a few days towards zero. LightGBM would put the humidity readings into a few bins before searching for splits. CatBoost would turn the Outlook words into numbers using only the days <em>before</em> each day, so that no day ever sees its own answer.</p>
  <p>All of them on the churn data, with similar settings and no early stopping, so that the numbers compare the engines rather than tuning (fit times are approximate, single-threaded where the library allows):</p>
  <div class="fx" data-lang="py">import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
models = {
    "AdaBoost (depth 6, 300)":    AdaBoostClassifier(DecisionTreeClassifier(max_depth=6), n_estimators=300, learning_rate=0.5, random_state=0),
    "GradientBoosting (500)":     GradientBoostingClassifier(n_estimators=500, max_depth=5, random_state=0),
    "HistGradientBoosting (500)": HistGradientBoostingClassifier(max_iter=500, early_stopping=False, random_state=0),
    "XGBoost (500)":              xgb.XGBClassifier(n_estimators=500, learning_rate=0.1, max_depth=6, n_jobs=1),
    "LightGBM (500)":             lgb.LGBMClassifier(n_estimators=500, learning_rate=0.1, verbose=-1, n_jobs=1),
    "CatBoost (500)":             CatBoostClassifier(iterations=500, learning_rate=0.1, verbose=False, thread_count=1, random_seed=0)}
for name, m in models.items():
    t0 = time.time(); m.fit(Xtr, ytr)
    print(f"{name:27s} test acc {m.score(Xte, yte):.3f}   fit {time.time() - t0:5.1f}s")</div>
  <div class="fx" data-lang="text">AdaBoost (depth 6, 300)     test acc 0.844   fit  32.0s
GradientBoosting (500)      test acc 0.855   fit  36.9s
HistGradientBoosting (500)  test acc 0.873   fit   1.3s
XGBoost (500)               test acc 0.866   fit   1.3s
LightGBM (500)              test acc 0.872   fit   1.2s
CatBoost (500)              test acc 0.875   fit   2.9s</div>
  <p>Read the two columns separately. For accuracy, all the boosters land within a few points of each other; the gradient-based ones beat AdaBoost, and the differences among the modern libraries at near-default settings are small. For accuracy in numbers: AdaBoost 0.844, classic gradient boosting 0.855, and the four modern engines 0.866 to 0.875. For time, AdaBoost and sklearn's classic <code>GradientBoostingClassifier</code> take over 30 seconds, because they try every possible cut-off of every column, while the histogram-based engines (HistGradientBoosting, XGBoost, LightGBM) fit 500 trees in about a second and CatBoost in about three. That speed-up, more than any gain in accuracy, is why the libraries took over: it makes early stopping, cross-validation and tuning affordable. The reading order from here is <a class="xref" data-note="ml_adaboost">AdaBoost</a> (re-weighting, worked by hand on the diary), then <a class="xref" data-note="ml_gbm">Gradient Boosting</a> (gradients, losses, leaf values, early stopping), then the three libraries; choosing settings in practice is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>

  <h2 id="bst-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common mistake is carrying random-forest habits into boosting, and the first such habit is using deep trees. A forest wants fully grown trees, because averaging removes their variance. Boosting wants weak trees, because each round must leave something for the next round to correct. Here is what happens on the diary when each boosted tree is grown fully:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import GradientBoostingRegressor
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = df.Turnout.values.astype(float)
for depth in [None, 2]:                       # None = grow each tree fully
    gb = GradientBoostingRegressor(max_depth=depth, n_estimators=100, learning_rate=1.0, random_state=0).fit(X, y)
    mse = [np.mean((p - y) ** 2) for p in gb.staged_predict(X)]
    print(f"max_depth={depth}: training MSE after rounds 1, 2, 3, 100: "
          + ", ".join(f"{mse[i]:.2f}" for i in [0, 1, 2, 99]))</div>
  <div class="fx" data-lang="text">max_depth=None: training MSE after rounds 1, 2, 3, 100: 0.29, 0.29, 0.29, 0.29
max_depth=2: training MSE after rounds 1, 2, 3, 100: 25.73, 15.63, 12.22, 2.48</div>
  <p>With fully grown trees the training MSE is 0.29 after the first round and never changes again: the first tree already fits every day it can (only D1/D8 and D5/D10, which have identical weather but different turnouts, are left), so every later tree is fitted to residuals that are almost zero. The "ensemble" is just one overfit tree. With depth-2 trees the error falls round by round (25.73, 15.63, 12.22, … 2.48) because each tree leaves work for the next. Use shallow trees, depth 3 to 8 or around 31 leaves.</p>
  <p>The second habit is "more trees is always better". It is true for a forest and false for boosting, as the U-shaped validation curve in section 06 showed. Set a generous maximum and let early stopping choose the number of rounds. Closely related is tuning the number of rounds and the learning rate separately: since the best number of rounds scales like 1/ν, changing one without the other gives an under- or overfit model.</p>
  <p>A third mistake is boosting a model that cannot bend. Boosting builds a sum of weak learners, and a sum of straight lines is still a straight line, so boosting linear regression gives you linear regression again:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
rng = np.random.default_rng(0)
x = rng.uniform(0, 6, (300, 1)); y = 3 * np.sin(x[:, 0]) + rng.normal(0, 0.3, 300)
for name, make in [("linear model", LinearRegression), ("stump", lambda: DecisionTreeRegressor(max_depth=1))]:
    F = np.full(300, y.mean())
    for m in range(200):                       # 200 rounds of residual fitting, nu = 0.1
        F += 0.1 * make().fit(x, y - F).predict(x)
    one = make().fit(x, y).score(x, y)
    print(f"{name:12s}: R^2 of one {one:.3f}   R^2 after boosting 200 {1 - np.mean((y - F)**2) / y.var():.3f}")</div>
  <div class="fx" data-lang="text">linear model: R^2 of one 0.650   R^2 after boosting 200 0.650
stump       : R^2 of one 0.825   R^2 after boosting 200 0.982</div>
  <p>On a sine-shaped curve one linear model explains 65% of the variation (R² 0.650), and after 200 rounds of boosting linear models it still explains 65%. Boosting 200 stumps on the same data goes from 0.825 to 0.982, because stumps are step functions and a sum of many small steps can follow a curve. The weak learner itself must be able to express shapes the sum will need.</p>
  <p>Two mistakes concern evaluation and data. Choosing the number of rounds by early stopping on the <em>test</em> set makes the test score optimistic, because the number of rounds has been tuned to look good on it; use a separate validation split or cross-validation, and keep the test set for the very end. And boosting noisy labels with an aggressive loss (exponential for classes, squared error for numbers with outliers) lets a few bad rows steer the model, as section 07 showed; prefer log-loss or Huber, and compare with a forest. Finally, "boosting is sequential, so it cannot use many cores" is only half true: the rounds are sequential, but inside each round the search for the best split over all features and bins runs in parallel, which is how XGBoost and LightGBM are fast.</p>

  <h2 id="bst-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <ul>
    <li>Cricket diary, 14 days D1–D14; Turnout 24, 20, 36, 32, 44, 22, 42, 26, 40, 46, 38, 38, 48, 20 (mean 34, MSE of guessing it 91.43).</li>
    <li>Weak learner: a stump asking one of Overcast? / Sunny? / Rain? / Humidity high? / Wind strong?</li>
    <li>Rounds ask Humidity high? → Overcast? → Wind strong?; MSE 91.43 → 55.43 → 35.83 → 20.87; stump floor 20.62; depth-2 trees 2.48.</li>
  </ul>
  <h3>Definitions</h3>
  <ul>
    <li><b>Bias</b>: error from a model too simple for the pattern; the same mistake on any sample. <b>Variance</b>: error from sensitivity to the particular sample.</li>
    <li><b>Boosting</b>: an ensemble trained sequentially; each weak learner focuses on what the current team gets wrong; outputs are added. Mainly reduces bias.</li>
    <li><b>Weak learner</b>: reliably a little better than chance on any weighting of the rows (error ≤ ½ − γ for some edge γ &gt; 0). Usually a shallow tree.</li>
    <li><b>Residual</b>: y − F_{m−1}(x), what the team has not explained yet (the negative gradient of ½(y − F)²).</li>
    <li><b>Forward stagewise additive modelling</b>: add one term at a time to minimise the loss; never re-fit old terms.</li>
    <li><b>Shrinkage / learning rate ν</b>: keep only the fraction ν of each new learner.</li>
    <li><b>Interaction</b>: the effect of one feature depends on another; stumps cannot express it, depth-d trees handle up to d features.</li>
    <li><b>Early stopping</b>: stop adding rounds when validation loss has not improved for k rounds.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>name</th><th>formula</th><th>diary value</th></tr>
    <tr><td>start</td><td>F₀ = argmin_c Σ L(yᵢ, c) (mean for squared error)</td><td>34</td></tr>
    <tr><td>residual</td><td>rᵢ = yᵢ − F_{m−1}(xᵢ)</td><td>D6: −12</td></tr>
    <tr><td>update</td><td>F_m(x) = F_{m−1}(x) + ν·h_m(x)</td><td>D13: 34 + 6 + 7 + 3.35 = 50.35</td></tr>
    <tr><td>whole model</td><td>F_M(x) = F₀ + Σₘ ν·h_m(x)</td><td>—</td></tr>
    <tr><td>stagewise step</td><td>(β_m, h_m) = argmin Σᵢ L(yᵢ, F_{m−1}(xᵢ) + β·h(xᵢ))</td><td>—</td></tr>
    <tr><td>line search (squared)</td><td>β = Σrᵢhᵢ / Σhᵢ²</td><td>504 / 504 = 1</td></tr>
    <tr><td>majority of 3 independent voters</td><td>3e² − 2e³</td><td>0.3 → 0.216</td></tr>
    <tr><td>rounds vs learning rate</td><td>best M ≈ c / ν</td><td>churn: 373 at 0.1, 1,340 at 0.03</td></tr>
  </table>
  <h3>Bagging vs boosting</h3>
  <table class="tbl">
    <tr><th></th><th>Bagging / Random Forest</th><th>Boosting</th></tr>
    <tr><td>training</td><td>parallel, independent</td><td>sequential, dependent</td></tr>
    <tr><td>base trees</td><td>deep</td><td>shallow</td></tr>
    <tr><td>combine</td><td>average</td><td>weighted sum</td></tr>
    <tr><td>reduces</td><td>variance</td><td>bias</td></tr>
    <tr><td>more trees</td><td>never hurts</td><td>overfits eventually</td></tr>
    <tr><td>noisy labels</td><td>robust</td><td>sensitive</td></tr>
  </table>
  <h3>The family</h3>
  <table class="tbl">
    <tr><th>algorithm</th><th>how the next tree is aimed</th></tr>
    <tr><td>AdaBoost</td><td>row weights ∝ e^{−yF} (exponential loss)</td></tr>
    <tr><td>Gradient Boosting</td><td>tree fits −∂L/∂F of any loss; leaf values line-searched</td></tr>
    <tr><td>XGBoost</td><td>gradients + second derivatives, penalties, missing values</td></tr>
    <tr><td>LightGBM</td><td>histograms, leaf-wise growth, GOSS, EFB</td></tr>
    <tr><td>CatBoost</td><td>ordered boosting, leak-free categories</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingRegressor, HistGradientBoostingClassifier

gb = GradientBoostingRegressor(n_estimators=300, learning_rate=0.1, max_depth=3)
gb.fit(X, y)
for pred in gb.staged_predict(X_val): ...      # the model after 1, 2, 3, ... rounds

hgb = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=3000, early_stopping=True,
                                     validation_fraction=0.2, n_iter_no_change=30)
hgb.fit(X, y); hgb.n_iter_                     # rounds actually used</div>
  <h3>Gotchas</h3>
  <ul>
    <li>More trees always helps a forest, not a booster: use early stopping.</li>
    <li>Fully grown base trees leave nothing to boost (diary: stuck at 0.29 after round 1).</li>
    <li>Halving ν roughly doubles the rounds needed; tune them together.</li>
    <li>A sum of linear models is linear; the weak learner must bend.</li>
    <li>Stumps cannot learn interactions (the diary's floor of 20.62).</li>
    <li>Label noise and outliers get chased; use robust losses, small ν, subsampling.</li>
    <li>Never early-stop on the test set.</li>
  </ul>

  <h2 id="bst-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is boosting?</summary><div class="qa-body">Boosting is an ensemble method that trains weak models one after another, each one focusing on what the models before it still get wrong, and adds their outputs together (usually scaled by a learning rate). Because each member works on the remaining error, the sum can express patterns no single member can, so boosting mainly reduces bias. AdaBoost, gradient boosting, XGBoost, LightGBM and CatBoost are all boosting algorithms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between bagging and boosting?</summary><div class="qa-body">Bagging trains deep trees independently on bootstrap samples and averages them, which cancels random mistakes and reduces variance; more trees never hurt and it is robust to noise. Boosting trains shallow trees sequentially, each on what the current team gets wrong, and adds them, which reduces bias; it needs a stopping rule and is sensitive to noisy labels. Bagging parallelises across trees; boosting cannot parallelise across rounds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging reduce variance but not bias?</summary><div class="qa-body">Averaging models leaves the expected prediction unchanged and only cancels the part of the error that differs from model to model. If every model is too simple in the same way, the average is too simple in that way too. On the diary, averaging 200 bagged stumps only took training MSE from 55.43 to 43.60, while boosting 300 stumps reached 20.62; on churn, bagged stumps scored exactly the same as one stump.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a weak learner, and why does boosting use one instead of a strong model?</summary><div class="qa-body">A weak learner is reliably a little better than chance on any weighting of the data, for example a stump or a shallow tree. A strong learner such as a fully grown tree fits the training data in the first round, leaving residuals of almost zero, so later rounds have nothing to learn and the ensemble is just one overfit tree. Weak learners leave room for many small, controlled corrections.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write down the boosting model and explain each symbol.</summary><div class="qa-body">F_M(x) = F₀ + Σₘ ν·h_m(x), or round by round F_m = F_{m−1} + ν·h_m. F₀ is a constant start that minimises the loss (the mean for squared error); h_m is the weak learner added in round m, trained on what F_{m−1} gets wrong; ν is the learning rate; M is the number of rounds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is forward stagewise additive modelling?</summary><div class="qa-body">A greedy way to fit a sum of terms: add one term at a time, choosing it (and its multiplier) to minimise the loss given the current model, and never re-fit earlier terms. With squared loss it becomes "fit the residuals"; with exponential loss it gives AdaBoost; with any differentiable loss approximated by its gradient it gives gradient boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the diary, the first three stumps ask Humidity high?, Overcast?, Wind strong?. Why a different question each time?</summary><div class="qa-body">Each stump is fitted to the residuals, which contain only what the team has not explained yet. After round 1, the residuals on humid and normal-humidity days each average exactly 0, so "Humidity high?" can explain nothing more and the best next question is about something new. That is sequential correction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a learning rate below 1?</summary><div class="qa-body">Each tree is fitted to noisy residuals of a finite sample, so a full step commits the model to that noise and later rounds must undo overshoots. Small steps let many trees' quirks partly cancel, which generalises better: on churn the best validation log-loss was 0.429 at ν = 1 and 0.320 at ν = 0.1. The cost is more rounds, roughly proportional to 1/ν.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can boosting overfit? How do you detect and prevent it?</summary><div class="qa-body">Yes. Training loss keeps falling with more rounds while validation loss is U-shaped; on churn at ν = 0.1 validation log-loss bottomed at round 373 and nearly doubled by round 3,000. Prevent it with early stopping on a validation set, a small learning rate, shallow trees, row and column subsampling, minimum leaf sizes and leaf penalties.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a random forest not overfit by adding trees, while boosting can?</summary><div class="qa-body">A forest averages; one more tree barely changes the average and only makes it more stable. Boosting adds; each new tree fits whatever is left, and once what is left is mostly noise, new trees fit noise. So a forest's number of trees is a cost setting, while a booster's number of rounds is a regularisation setting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is boosting sensitive to label noise and outliers?</summary><div class="qa-body">It concentrates on rows the team gets wrong, and a mislabelled row or outlier is always "wrong". Under squared error a typo with residual 44.64 dominates the loss (61% of the diary's squared error from one day); under AdaBoost's exponential loss a wrong row's weight grows every round. Robust losses (Huber, absolute, log-loss rather than exponential), small ν, early stopping and subsampling limit the damage; forests are naturally more robust.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a sum of stumps never fit the diary perfectly?</summary><div class="qa-body">A sum of stumps is additive: mean + humidity effect + outlook effect + wind effect, with no term for combinations. The diary contains an interaction: wind matters a lot on rainy days (about 21 players) and little on overcast days (about 40). That missing interaction is bias that no number of rounds removes; depth-2 trees can express it and reach 2.48 instead of 20.62.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you boost linear regression models?</summary><div class="qa-body">You get a linear regression model. A sum of linear functions is linear, so boosting adds nothing a single least-squares fit could not. In the example, R² stayed at 0.650 after 200 rounds, while boosting stumps on the same curve went from 0.825 to 0.982. The base learner must be non-linear, which is why trees are used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can boosting be parallelised?</summary><div class="qa-body">Not across rounds, because round m needs the predictions after round m − 1. Within a round, yes: finding the best split over all features and bins is parallel, and XGBoost, LightGBM and HistGradientBoosting use many cores this way. Bagging, by contrast, can train whole trees in parallel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do AdaBoost and gradient boosting differ in how they aim the next tree?</summary><div class="qa-body">AdaBoost keeps the original labels and changes the row weights (rows the team gets wrong become heavier), then fits a classifier to the weighted rows. Gradient boosting keeps the rows equal and changes the targets to the negative gradient of a chosen loss (residuals for squared error), then fits a regression tree. AdaBoost is gradient-style boosting with the exponential loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What did XGBoost, LightGBM and CatBoost each add?</summary><div class="qa-body">XGBoost uses first and second derivatives of the loss with penalties on tree size and leaf values, handles missing values by learning a default direction, and searches splits in parallel. LightGBM adds histogram binning, leaf-wise growth, GOSS row sampling and EFB feature bundling for speed. CatBoost adds ordered boosting and ordered target statistics to use categorical features without target leakage, with symmetric trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your data has 2,000 rows and about 30% label noise. Boosting or random forest?</summary><div class="qa-body">Start with a random forest: it is robust to noisy labels, needs little tuning and cannot overfit by adding trees. If you try boosting, use log-loss, a small learning rate, shallow trees, subsampling and early stopping, and compare both on the same cross-validation folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shrinkage and early stopping are normally used together. What goes wrong if you use only one?</summary><div class="qa-body">A small ν with a fixed, too-small number of rounds underfits (the diary at ν = 0.1 was still at MSE 29.65 after 30 rounds), and with too many rounds it eventually overfits anyway. Early stopping with ν = 1 stops at the right time, but each round took a full noisy step, so the best point is worse (churn validation log-loss 0.429 against 0.320). ν sets how carefully you walk; early stopping says when to stop walking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a boosted model interpretable?</summary><div class="qa-body">A sum of stumps is an additive model, so each feature's total effect can be drawn as one curve by adding up all the stumps that use it. With deeper trees, interactions appear and the model is a black box of hundreds of trees; feature importances and SHAP values are then used to explain it (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>).</div></details>
</main>
`
});
