// notes/ml/ml_pipelines.js — Pipelines & Data Leakage
Object.assign(TOPIC_CONTENT, {
  "ml_pipelines": `<main>
  <h1>Pipelines &amp; Data Leakage</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Pipelines &amp; Data Leakage</span></div>
  <p class="lead">Data leakage happens when information that will not exist at prediction time sneaks into training or evaluation, so the validation score looks wonderful and the model then disappoints in production. It is one of the most common and most expensive mistakes in applied machine learning, because nothing crashes: the numbers simply look better than they should. This page first shows the classic ways leakage happens, each one measured with real numbers, and then builds the cure: scikit-learn's <strong>Pipeline</strong>, an object that learns every preprocessing step from training rows only, inside every cross-validation fold, and can be saved and served as one unit. The running example is the Foundations group's ten flats in Pune, A to J, with their area, locality, listing month, age and asking price; every leak is shown first on those ten rows, small enough to check by hand, and then at a larger scale.</p>

  <h2 id="pl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Pipelines &amp; Leakage</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Leakage</div>
        <ul>
          <li>Information unavailable at prediction time used in training or evaluation</li>
          <li>Two families: a step learnt from held-out rows; a feature that encodes the answer</li>
          <li>The one question: "would I know this value, computed this way, at prediction time?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Where it hides</div>
        <ul>
          <li>Scaling, selecting, encoding before the split</li>
          <li>Random splits of time-ordered data; whole-history features</li>
          <li>Duplicates and repeated entities across the split</li>
          <li>Columns written after the outcome</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The cure</div>
        <ul>
          <li><b>fit</b> learns, <b>transform</b> applies; fit on training rows only</li>
          <li><b>Pipeline</b> enforces it in every fold and grid candidate</li>
          <li><b>ColumnTransformer</b>: different steps per column</li>
          <li>Grid keys <code>step__param</code>; nested CV for an honest tuned score</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shipping</div>
        <ul>
          <li>Save the whole fitted pipeline with versions (joblib)</li>
          <li>Train/serve skew: serving computes features differently</li>
          <li>Guards: schema, ranges, unknown categories</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pl-leak"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Data Leakage Is</span><span class="rm-sub">a column from the future, and the one question</span></div></div>
      <div class="rm-item rm-done" data-target="pl-pre"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Preprocessing Before the Split</span><span class="rm-sub">scalers and feature selectors that peek</span></div></div>
      <div class="rm-item rm-done" data-target="pl-te"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Target Encoding Before the Split</span><span class="rm-sub">a row's own answer inside its feature</span></div></div>
      <div class="rm-item rm-done" data-target="pl-time"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Time Leakage</span><span class="rm-sub">when the future trains the past</span></div></div>
      <div class="rm-item rm-done" data-target="pl-dup"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Duplicates and Groups</span><span class="rm-sub">the same thing on both sides of the split</span></div></div>
      <div class="rm-item rm-done" data-target="pl-detect"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Detecting Leakage</span><span class="rm-sub">warning signs and the shuffled-label check</span></div></div>
      <div class="rm-item rm-done" data-target="pl-fitapi"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">fit, transform and fit_transform</span><span class="rm-sub">what learns and what only applies</span></div></div>
      <div class="rm-item rm-done" data-target="pl-pipe"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Pipeline</span><span class="rm-sub">one object that keeps the rule for you</span></div></div>
      <div class="rm-item rm-done" data-target="pl-ct"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ColumnTransformer</span><span class="rm-sub">different steps for different columns</span></div></div>
      <div class="rm-item rm-done" data-target="pl-cv"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Grid Search and Nested CV</span><span class="rm-sub">tuning every step honestly</span></div></div>
      <div class="rm-item rm-done" data-target="pl-custom"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Custom Transformers</span><span class="rm-sub">writing your own learnt step</span></div></div>
      <div class="rm-item rm-done" data-target="pl-save"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Saving and Train/Serve Skew</span><span class="rm-sub">shipping exactly what was validated</span></div></div>
      <div class="rm-item rm-done" data-target="pl-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">fit before split, wrong keys, lambdas</span></div></div>
      <div class="rm-item rm-done" data-target="pl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">leaks, fixes, syntax</span></div></div>
      <div class="rm-item rm-done" data-target="pl-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on leakage and pipelines</span></div></div>
    </div>
  </div>

  <h2 id="pl-leak"><span class="num">01</span>What Data Leakage Is</h2>
  <p>A model's validation score is really a forecast: "this is how well the model will do on tomorrow's data". That forecast is only honest if the validation rows played exactly the role tomorrow's rows will play: unseen during training, and described only by information that will actually be available when the prediction is made. Let us see how easily that promise breaks. Here are the ten flats a Pune property portal will use throughout this page. Area is in hundreds of square feet, price is the asking price in lakh rupees, and the portal's historical table also has a column "final_price", the price each flat finally sold for after negotiation:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_score

flats = pd.DataFrame({
    "flat":     list("ABCDEFGHIJ"),
    "area":     np.arange(5., 15.),                              # hundreds of sq ft
    "locality": ["Hadapsar", "Baner", "Kothrud"] * 3 + ["Baner"],
    "listed":   [3, 1, 5, 2, 8, 4, 6, 9, 7, 10],                 # listing month (Jan = 1)
    "age":      [12, 3, 8, 15, 5, 10, np.nan, 2, 7, 4],          # flat G's age is blank
    "price":    [38., 49, 53, 56, 67, 68, 73, 83, 87, 96],       # asking price, lakh: the target
})
discount = np.array([3, 2, 4, 1, 3, 2, 5, 2, 3, 2]) / 100        # negotiated at the deal
flats["final_price"] = (flats.price * (1 - discount)).round(1)   # written AFTER the flat sells
print(flats.to_string(index=False))
loo = dict(cv=LeaveOneOut(), scoring="neg_mean_squared_error")
for cols in [["area"], ["area", "final_price"]]:
    mse = -cross_val_score(LinearRegression(), flats[cols], flats.price, **loo).mean()
    print(f"{' + '.join(cols):19s} LOOCV MSE {mse:5.2f}")</div>
  <div class="fx" data-lang="text">flat  area locality  listed  age  price  final_price
   A   5.0 Hadapsar       3 12.0   38.0         36.9
   B   6.0    Baner       1  3.0   49.0         48.0
   C   7.0  Kothrud       5  8.0   53.0         50.9
   D   8.0 Hadapsar       2 15.0   56.0         55.4
   E   9.0    Baner       8  5.0   67.0         65.0
   F  10.0  Kothrud       4 10.0   68.0         66.6
   G  11.0 Hadapsar       6  NaN   73.0         69.4
   H  12.0    Baner       9  2.0   83.0         81.3
   I  13.0  Kothrud       7  7.0   87.0         84.4
   J  14.0    Baner      10  4.0   96.0         94.1
area                LOOCV MSE  7.25
area + final_price  LOOCV MSE  0.80</div>
  <p>The earlier Foundations notes scored a straight line on area alone with leave-one-out cross-validation (each flat is predicted by a model trained on the other nine) and got a mean squared error of 7.25. Adding the final sale price drops it to 0.80, nine times better. Is that a better model? No. The final price is written when the deal closes, after the listing, and it is nearly the asking price itself minus a few percent. When the portal prices a new listing, that column is empty. The model learnt to lean on a value it will never have.</p>
  <p>Notice also that cross-validation did not catch this. Every held-out flat also had its final price filled in, because the historical table was assembled after the sales. Splitting rows protects against rows leaking into rows; it cannot protect against a column that comes from the future. The same thing at scale: a telecom company wants to predict which customers will leave (churn) early enough to offer them a discount, and its customer table has a column <code>refund_issued</code>, which is filled in for most customers after they leave:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
df = pd.DataFrame({"tenure": rng.integers(1, 60, 2000), "tickets": rng.poisson(2, 2000)})
p = 1 / (1 + np.exp(-(-1.5 - 0.04 * df.tenure + 0.35 * df.tickets)))
df["churn"] = (rng.random(2000) &lt; p).astype(int)
df["refund_issued"] = df.churn &amp; (rng.random(2000) &lt; 0.9)       # only known AFTER the customer left
for cols in [["tenure", "tickets", "refund_issued"], ["tenure", "tickets"]]:
    Xtr, Xte, ytr, yte = train_test_split(df[cols], df.churn, random_state=0, stratify=df.churn)
    rf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=1).fit(Xtr, ytr)
    print(f"{'+'.join(cols):28s} test accuracy {rf.score(Xte, yte):.3f}")
print("always predict 'no churn'   :", round(1 - df.churn.mean(), 3))</div>
  <div class="fx" data-lang="text">tenure+tickets+refund_issued test accuracy 0.984
tenure+tickets               test accuracy 0.832
always predict 'no churn'   : 0.861</div>
  <p>With the leaky column, test accuracy is 98.4%. Without it, 83.2%, which is actually <em>below</em> the 86.1% you would get by always predicting "no churn". The impressive model was an illusion, and finding that out before launch is much cheaper than finding it out after.</p>
  <p>This is <strong>data leakage</strong>: using, during training or model selection, information that would not be available when the model makes real predictions. Think of a school exam paper that leaks the night before. Everyone scores 95%. The marks are real numbers, correctly added, and they say nothing about what anyone knows; the leak only shows up when the same students sit a fresh paper. Leakage comes in two families. In <strong>target leakage</strong>, a feature is a consequence of the answer or is recorded after it, like the final price or the refund. In <strong>train–test contamination</strong>, a preprocessing step learns something from rows that should have been unseen, such as a scaler or encoder fitted before the data was split. The next four sections show the main forms in practice.</p>
  <p>The single most useful habit is to ask one question of every column and every preprocessing step: <strong>"At the moment I make this prediction in production, would I know this value, computed this way?"</strong> For a model that prices a flat at the moment it is listed: area, locality, bedrooms, age and listing date are all known (flat G's blank age is also what production will see). A locality's average price over the whole year is only partly known, because it includes flats listed later and this flat's own price. Days on market and final price are not known at all. The listing id is known but meaningless, and should be dropped so the model cannot memorise it. Typical names to be suspicious of include "final", "closed", "resolved", "outcome", "total", and any timestamp after the prediction moment. The safest way to build training data is from <strong>as-of snapshots</strong>: the features exactly as they stood at the moment each prediction would have been made.</p>

  <h2 id="pl-pre"><span class="num">02</span>Preprocessing Before the Split</h2>
  <p>The second family of leaks looks completely innocent. Many preprocessing steps learn something from the data: a scaler learns each column's mean and standard deviation, an imputer learns the median it will fill blanks with, a feature selector learns which columns to keep. If such a step is fitted on the whole table before the data is split (or before cross-validation), it has already seen the rows that are supposed to be unseen.</p>
  <p>Here is what that does, by hand. Train on flats A to H, areas 5 to 12: mean 8.5, standard deviation 2.291. A 5,000 sq ft bungalow (area 50) arrives later. Scaled with the training statistics, it is (50 − 8.5)/2.291 = 18.1 standard deviations from the mean, and the model is correctly told it has never seen anything like it. Now fit the scaler with the bungalow included:</p>
  <div class="fx" data-lang="py">import numpy as np
train = np.arange(5., 13.)                 # flats A..H: areas 5..12
bungalow = 50.                             # a 5,000 sq ft bungalow arrives later
m, s = train.mean(), train.std()           # learnt from training flats only
print(f"proper: mean={m:.2f} std={s:.3f}  bungalow z={(bungalow - m) / s:.2f}  flat A z={(5 - m) / s:.2f}")
allx = np.r_[train, bungalow]
m2, s2 = allx.mean(), allx.std()           # learnt with the bungalow included (leaky)
print(f"leaky : mean={m2:.2f} std={s2:.3f}  bungalow z={(bungalow - m2) / s2:.2f}  flat A z={(5 - m2) / s2:.2f}")</div>
  <div class="fx" data-lang="text">proper: mean=8.50 std=2.291  bungalow z=18.11  flat A z=-1.53
leaky : mean=13.11 std=13.220  bungalow z=2.79  flat A z=-0.61</div>
  <p>The mean jumps to 13.11 and the standard deviation to 13.22, the bungalow becomes an unremarkable 2.79, and flat A moved from −1.53 to −0.61 before training even began. The held-out row reshaped the training data and hid its own novelty.</p>
  <p>How much does this matter for the score? It depends on how much the step learns, and above all on whether it looks at the labels. A scaler only learns two numbers per column and never sees y, so including one extra fold barely moves it. A feature selector chooses columns by how well they match y, and that can be disastrous. Here are 300 columns of pure random noise for the ten flats. Predicting each flat by the average of the other nine gives a leave-one-out MSE of 372.3, the bar any real model should beat. We pick the single noise column that best matches the ten prices, using all ten prices, and then cross-validate:</p>
  <div class="fx" data-lang="py">from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.pipeline import make_pipeline
rng = np.random.default_rng(0)
noise = rng.normal(size=(10, 300))                   # 300 random columns, unrelated to price
mean_only = np.mean([(price[i] - np.delete(price, i).mean()) ** 2 for i in range(10)])
print(f"predict the mean of the other nine: LOOCV MSE {mean_only:.1f}")
best = SelectKBest(f_regression, k=1).fit(noise, price)             # looked at ALL ten prices
col = best.get_support(indices=True)[0]
print(f"column picked with all prices: #{col}, correlation {np.corrcoef(noise[:, col], price)[0, 1]:+.2f}")
print(f"selection BEFORE LOOCV: {-cross_val_score(LinearRegression(), noise[:, [col]], price, **loo).mean():.1f}")
pipe = make_pipeline(SelectKBest(f_regression, k=1), LinearRegression())   # re-selects inside each fold
print(f"selection INSIDE LOOCV: {-cross_val_score(pipe, noise, price, **loo).mean():.1f}")</div>
  <div class="fx" data-lang="text">predict the mean of the other nine: LOOCV MSE 372.3
column picked with all prices: #149, correlation -0.77
selection BEFORE LOOCV: 162.7
selection INSIDE LOOCV: 788.9</div>
  <p>Among 300 random columns, one happens to correlate −0.77 with ten prices purely by chance. Chosen with every price in view, it "beats" the mean (162.7 against 372.3). Inside a pipeline, each fold chooses its column using only its own nine training prices; that choice means nothing for the held-out flat, and the honest score, 788.9, is worse than predicting the mean. The same two mistakes at scale, a scaler on a real medical dataset and a selector on 5,000 noise columns with 100 random labels:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)                # (a) a scaler, on real data
gaps = []
for seed in range(20):
    cv = StratifiedKFold(5, shuffle=True, random_state=seed)
    leaky = cross_val_score(KNeighborsClassifier(), StandardScaler().fit_transform(X), y, cv=cv).mean()
    proper = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y, cv=cv).mean()
    gaps.append(leaky - proper)
print(f"scaler fit before CV: accuracy inflated by {np.mean(gaps):+.4f} on average")

rng = np.random.default_rng(0)                            # (b) a selector, on pure noise
Xn, yn = rng.normal(size=(100, 5000)), rng.integers(0, 2, 100)
X_sel = SelectKBest(f_classif, k=20).fit_transform(Xn, yn)          # looked at every label
print("selection before CV:", cross_val_score(LogisticRegression(), X_sel, yn, cv=5).mean().round(3))
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print("selection inside CV:", cross_val_score(pipe, Xn, yn, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">scaler fit before CV: accuracy inflated by +0.0004 on average
selection before CV: 0.85
selection inside CV: 0.48</div>
  <p>The scaler leak is tiny, +0.0004 accuracy on average. The selector leak is enormous: 85% accuracy on labels that carry no information, against an honest 48%. Supervised steps (feature selection, target encoding, oversampling with SMOTE, choosing bins by the target) and steps that store rows (a KNN imputer) can leak a lot; unsupervised steps with few parameters (scaling, mean imputation) usually leak a little. But you cannot easily tell in advance, a tiny leak still corrupts the comparison when two models are close, and "it's only a scaler" is the habit that later becomes "it's only feature selection" on a project where it matters. So the rule is absolute: <strong>every step that learns from data is fitted inside the split, on training rows only.</strong> Sections 07 and 08 show how to make that automatic.</p>

  <h2 id="pl-te"><span class="num">03</span>Target Encoding Before the Split</h2>
  <p>Some preprocessing steps are built directly from the label. <strong>Target encoding</strong> replaces a category with the average target of that category (<a class="xref" data-note="ml_features">Feature Engineering</a>): every Baner flat gets "the average Baner price". It is a powerful way to turn a category with many values into one number, and computed before the split it leaks in a way that is easy to see by hand. Baner holds flats B, E, H and J with prices 49, 67, 83 and 96, an average of 73.75. Every Baner flat's own price is inside that average.</p>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.model_selection import KFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import TargetEncoder

baner = flats[flats.locality == "Baner"].copy()
baner["with_itself"] = baner.price.mean()                                    # every Baner flat: 73.75
baner["without_itself"] = (baner.price.sum() - baner.price) / 3              # leave-one-out mean
print(baner[["flat", "price", "with_itself", "without_itself"]].round(2).to_string(index=False))

flats["loc_mean"] = flats.locality.map(flats.groupby("locality").price.mean())   # on ALL ten flats
naive = -cross_val_score(LinearRegression(), flats[["area", "loc_mean"]], price, **loo).mean()
honest = [-cross_val_score(make_pipeline(
              ColumnTransformer([("te", TargetEncoder(smooth=2, cv=KFold(3, shuffle=True, random_state=s),
                                                      target_type="continuous"), ["locality"])],
                                remainder="passthrough"), LinearRegression()),
              flats[["area", "locality"]], price, **loo).mean() for s in range(20)]
print(f"LOOCV MSE, locality mean computed before the split: {naive:.2f}")
print(f"LOOCV MSE, TargetEncoder inside the pipeline     : {np.median(honest):.2f} (median of 20 runs)")</div>
  <div class="fx" data-lang="text">flat  price  with_itself  without_itself
   B   49.0        73.75           82.00
   E   67.0        73.75           76.00
   H   83.0        73.75           70.67
   J   96.0        73.75           66.33
LOOCV MSE, locality mean computed before the split: 1.68
LOOCV MSE, TargetEncoder inside the pipeline     : 3.69 (median of 20 runs)</div>
  <p>Without itself, B's locality average would be (67 + 83 + 96)/3 = 82, and J's would be (49 + 67 + 83)/3 = 66.33. Including each flat's own price nudges the cheap flat B's feature down toward its price (82 → 73.75) and the expensive J's up (66.33 → 73.75). The feature has learnt a little of each answer. Computed on all ten flats it gives a leave-one-out MSE of 1.68; done properly inside the pipeline, where the held-out flat's price never touches its own feature, it gives 3.69. The 1.68 was a leaky measurement, not a better model.</p>
  <p>At scale the effect is dramatic when each category has only a few rows. Here are 3,000 card transactions spread over 800 merchants, about four each. Fraud depends only on the transaction amount; the merchant is irrelevant:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.compose import make_column_transformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import TargetEncoder

rng = np.random.default_rng(0)
df = pd.DataFrame({"merchant": rng.choice([f"m{i}" for i in range(800)], 3000),   # ~4 rows each
                   "amount": rng.lognormal(7, 1, 3000)})
df["fraud"] = (rng.random(3000) &lt; 1 / (1 + np.exp(-(np.log(df.amount) - 9)))).astype(int)  # amount only

leak = df.assign(merchant_rate=df.groupby("merchant").fraud.transform("mean"))     # on ALL rows
tr, te = train_test_split(leak, test_size=0.3, random_state=0, stratify=leak.fraud)
m = HistGradientBoostingClassifier(random_state=0).fit(tr[["amount", "merchant_rate"]], tr.fraud)
print("leaky  test AUC:", round(roc_auc_score(te.fraud, m.predict_proba(te[["amount", "merchant_rate"]])[:, 1]), 3))

tr, te = train_test_split(df, test_size=0.3, random_state=0, stratify=df.fraud)   # split FIRST
enc = TargetEncoder(cv=StratifiedKFold(5, shuffle=True, random_state=0))
pipe = make_pipeline(make_column_transformer((enc, ["merchant"]), remainder="passthrough"),
                     HistGradientBoostingClassifier(random_state=0)).fit(tr[["merchant", "amount"]], tr.fraud)
print("honest test AUC:", round(roc_auc_score(te.fraud, pipe.predict_proba(te[["merchant", "amount"]])[:, 1]), 3))</div>
  <div class="fx" data-lang="text">leaky  test AUC: 0.902
honest test AUC: 0.711</div>
  <p>Encoding the merchant's fraud rate on all rows before splitting gives a test AUC of 0.902 for a column with no real information; splitting first and encoding properly gives 0.711. Even the "untouched" test set was contaminated, because its rows were encoded with their own labels. There is one more subtlety: splitting first is necessary but not sufficient. If you compute the rate on the training rows and use it as a training feature, each training row still sees its own label, and the model learns to trust the feature too much. That is why scikit-learn's <code>TargetEncoder.fit_transform</code> uses internal <strong>cross-fitting</strong> (each training fold is encoded using only the other folds), while <code>transform</code> on new rows uses all the training rows, and why it also <strong>smooths</strong> small categories toward the overall average.</p>

  <h2 id="pl-time"><span class="num">04</span>Time Leakage</h2>
  <p>When rows arrive in time order, leakage gains a direction: the future can train the past. A model that prices a flat on the day it is listed only knows about earlier listings. Our flats were listed one a month, from B in January to J in October. Compare two versions of "the locality's typical price": over the <em>whole year</em>, which gives B the Baner average 73.75 even in January, when H and J have not been listed yet; and <em>as of</em> listing time, the average of the same locality's earlier listings, with last year's city average of 60 lakh as the starting value. We score both honestly with <strong>forward chaining</strong>: train on everything listed so far, predict the next listing, repeat.</p>
  <div class="fx" data-lang="py">df = flats.sort_values("listed").reset_index(drop=True)      # time order: B D A F C G I E H J
PRIOR = 60.0                                                 # last year's city average: known in January
df["loc_year"] = df.locality.map(df.groupby("locality").price.mean())        # whole year, incl. later flats
df["loc_asof"] = [df.loc[:i - 1].query("locality == @l").price.mean() if i and (df.loc[:i - 1].locality == l).any()
                  else PRIOR for i, l in enumerate(df.locality)]             # only EARLIER listings
print(df[["flat", "listed", "locality", "price", "loc_year", "loc_asof"]].round(2).to_string(index=False))

def forward_mse(cols):                       # train on everything listed so far, predict the next
    errs = [(LinearRegression().fit(df.loc[:i - 1, cols], df.price[:i]).predict(df.loc[[i], cols])[0]
             - df.price[i]) ** 2 for i in range(4, len(df))]
    return np.mean(errs)
for cols in [["area", "loc_year"], ["area", "loc_asof"], ["area"]]:
    print(f"forward-chaining MSE, {' + '.join(cols):15s}: {forward_mse(cols):.2f}")</div>
  <div class="fx" data-lang="text">flat  listed locality  price  loc_year  loc_asof
   B       1    Baner   49.0     73.75     60.00
   D       2 Hadapsar   56.0     55.67     60.00
   A       3 Hadapsar   38.0     55.67     56.00
   F       4  Kothrud   68.0     69.33     60.00
   C       5  Kothrud   53.0     69.33     68.00
   G       6 Hadapsar   73.0     55.67     47.00
   I       7  Kothrud   87.0     69.33     60.50
   E       8    Baner   67.0     73.75     49.00
   H       9    Baner   83.0     73.75     58.00
   J      10    Baner   96.0     73.75     66.33
forward-chaining MSE, area + loc_year: 2.24
forward-chaining MSE, area + loc_asof: 29.04
forward-chaining MSE, area           : 6.91</div>
  <p>The whole-year feature looks excellent (2.24) because it contains later prices, including the flat's own. The as-of version, the only one that exists in production, scores 29.04: with one or two earlier listings per locality it is very noisy, and the model would be better off with area alone (6.91). The leaky feature did not just inflate a score; it would have led us to ship a feature that makes the model worse.</p>
  <p>Time leaks in two ways. The first is a random split of time-ordered data: if July is in training and June in validation, the model can interpolate between yesterday and tomorrow, which it can never do when forecasting. The second is a feature computed with future rows, such as a centred rolling average (days t − 3 to t + 3), a customer's "lifetime spend" that includes future purchases, or a table joined in after it was updated. At scale, here are two years of daily sales with a drifting trend and a weekly cycle, scored with a shuffled split and with a time-ordered split (train on the past, validate on the next block):</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score
rng = np.random.default_rng(0)
t = np.arange(730)                                            # two years of daily sales
sales = 200 + np.cumsum(rng.normal(0, 3, 730)) + 20 * np.sin(2 * np.pi * t / 7) + rng.normal(0, 5, 730)
df = pd.DataFrame({"t": t, "dow": t % 7, "sales": sales})
df["roll7_centered"] = df.sales.rolling(7, center=True, min_periods=1).mean()   # uses 3 FUTURE days
df["roll7_past"] = df.sales.shift(1).rolling(7, min_periods=1).mean()           # only the past
df = df.dropna()
rf = RandomForestRegressor(n_estimators=100, random_state=0, n_jobs=1)
def mae(cols, cv):
    return -cross_val_score(rf, df[cols], df.sales, cv=cv, scoring="neg_mean_absolute_error").mean()
for cols in [["t", "dow"], ["dow", "roll7_centered"], ["dow", "roll7_past"]]:
    print(f"{str(cols):28s} shuffled KFold MAE {mae(cols, KFold(5, shuffle=True, random_state=0)):5.1f}"
          f"   time split MAE {mae(cols, TimeSeriesSplit(5)):5.1f}")</div>
  <div class="fx" data-lang="text">['t', 'dow']                 shuffled KFold MAE   6.2   time split MAE  13.4
['dow', 'roll7_centered']    shuffled KFold MAE   4.8   time split MAE   7.5
['dow', 'roll7_past']        shuffled KFold MAE   6.7   time split MAE   9.6</div>
  <p>With the day number and weekday as features, a shuffled split reports a mean absolute error of 6.2, because the forest simply looks up neighbouring days on both sides; under the honest time split it must extrapolate a trend it has not seen, and the error doubles to 13.4. The centred rolling mean scores 7.5 even under the time split, because the feature itself contains future sales. The past-only rolling mean (shift by one day, then average) gives the realistic 9.6. The fixes: time-ordered splits (<code>TimeSeriesSplit</code>, forward chaining), past-only windows, as-of joins, and a gap between training and validation when labels arrive late (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>

  <h2 id="pl-dup"><span class="num">05</span>Duplicates and Groups</h2>
  <p>Property portals relist flats and scrapers run twice. If flat E appears as two identical listings and one lands in training and the other in validation, the model is not predicting E's price; it is looking it up. More generally, when rows share an entity (several visits by the same patient, many transactions by the same customer, many photos of the same object, sentences from the same document), a random split puts the same entity on both sides, and the model can recognise the entity instead of learning the pattern. This is <strong>group leakage</strong>.</p>
  <p>How strong is it? Take 200 patients with four nearly identical visits each, and a diagnosis that is completely random. In a random 5-fold split, a test visit's three sibling visits all land in the same test fold with probability (159/799) × (158/798) × (157/797) ≈ 0.008, so about 99% of test visits have a near-identical twin in training, carrying the same label. A model that just finds the nearest twin will score about 99% while knowing nothing about disease. <code>GroupKFold</code> keeps all of a patient's visits in the same fold:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupKFold, KFold, cross_val_score
rng = np.random.default_rng(0)
base = rng.normal(size=(200, 10))                        # 200 patients, each with a "fingerprint"
label = rng.integers(0, 2, 200)                          # diagnosis: unrelated to the features!
X = np.repeat(base, 4, axis=0) + rng.normal(0, 0.05, (800, 10))   # 4 near-identical visits each
y, groups = np.repeat(label, 4), np.repeat(np.arange(200), 4)
rf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=1)
print("random KFold      :", cross_val_score(rf, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean().round(3))
print("GroupKFold patient:", cross_val_score(rf, X, y, cv=GroupKFold(5), groups=groups).mean().round(3))</div>
  <div class="fx" data-lang="text">random KFold      : 0.991
GroupKFold patient: 0.482</div>
  <p>Random K-fold reports 0.991, as the hand calculation predicted; grouping by patient gives the coin-flip truth, 0.482. Now our flats, every one listed twice. Leaving out one <em>listing</em> leaves its twin in training; leaving out one <em>flat</em> removes both:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import LeaveOneGroupOut
from sklearn.neighbors import KNeighborsRegressor
X, y = np.repeat(flats[["area"]].to_numpy(), 2, axis=0), np.repeat(price, 2)   # every flat listed twice
flat = np.repeat(flats.flat.to_numpy(), 2)                                     # which flat each row is
for name, model in [("4-NN          ", KNeighborsRegressor(4, weights="distance")),
                    ("straight line ", LinearRegression())]:
    by_row = -cross_val_score(model, X, y, **loo).mean()
    by_flat = -cross_val_score(model, X, y, cv=LeaveOneGroupOut(), groups=flat, scoring="neg_mean_squared_error").mean()
    print(f"{name} leave-one-LISTING-out MSE {abs(by_row):6.2f}   leave-one-FLAT-out MSE {by_flat:6.2f}")</div>
  <div class="fx" data-lang="text">4-NN           leave-one-LISTING-out MSE   0.00   leave-one-FLAT-out MSE  33.79
straight line  leave-one-LISTING-out MSE   5.64   leave-one-FLAT-out MSE   7.25</div>
  <p>A 4-nearest-neighbour model, which can memorise, scores a perfect 0.00 when a listing's twin is in training and 33.79 when the whole flat is held out. The straight line barely memorises, 5.64 against 7.25, and 7.25 is exactly the honest score on the ten distinct flats. The more a model can memorise, the more a group leak flatters it. The fixes are to remove exact and near duplicates before splitting, and to split by entity (<code>GroupKFold</code>, <code>GroupShuffleSplit</code>, <code>StratifiedGroupKFold</code>, <code>LeaveOneGroupOut</code>). You also create duplicates yourself when you oversample or apply SMOTE before splitting, or augment images before splitting; resample and augment only the training fold.</p>

  <h2 id="pl-detect"><span class="num">06</span>Detecting Leakage</h2>
  <p>Each leak so far was found because we knew where to look. On a new project you do not. A few warning signs catch most leaks. A score that is too good to be true, far above published baselines or common sense (98% churn accuracy), is a leak until proven otherwise. A single feature that carries most of the importance, or that alone gives near-perfect AUC, deserves the question "when is this column filled?". A big drop between a random split and a time or group split, or between validation and production, points to time or group leakage. And certain lines of code are red flags in review: <code>fit</code> or <code>fit_transform</code> called before <code>train_test_split</code>, global <code>groupby(...).transform(...)</code> features, and <code>rolling(center=True)</code>.</p>
  <p>There are also two mechanical checks. <strong>Adversarial validation</strong> trains a classifier to tell training rows from test or production rows; if it succeeds easily, the features it relies on are either drifting or leaking time or identity. The <strong>shuffled-label check</strong> runs your whole procedure on data where the right answer is known to be "nothing to learn": shuffle the labels so they no longer belong to their rows, and the score must fall to chance. If it does not, something in the features or preprocessing is carrying label information. On the flats we shuffle the ten prices 20 times and count how often each procedure beats "predict the mean":</p>
  <div class="fx" data-lang="py">from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.pipeline import make_pipeline
noise = np.random.default_rng(0).normal(size=(10, 300))           # the 300 random columns again
def score(model, X, y): return -cross_val_score(model, X, y, **loo).mean()
def select_before(y):
    col = SelectKBest(f_regression, k=1).fit(noise, y).get_support()
    return score(LinearRegression(), noise[:, col], y)
def select_inside(y):
    return score(make_pipeline(SelectKBest(f_regression, k=1), LinearRegression()), noise, y)
def loc_mean_before(y):
    loc = flats.locality.map(pd.Series(y).groupby(flats.locality).mean())
    return score(LinearRegression(), loc.to_frame(), y)

rng = np.random.default_rng(1)
shuffles = [rng.permutation(price) for _ in range(20)]            # prices no longer belong to any flat
base = [np.mean([(y[i] - np.delete(y, i).mean()) ** 2 for i in range(10)]) for y in shuffles]
for name, f in [("selection before LOOCV", select_before), ("selection in pipeline ", select_inside),
                ("locality mean before  ", loc_mean_before)]:
    wins = sum(f(y) &lt; b for y, b in zip(shuffles, base))
    print(f"{name}: beats 'predict the mean' in {wins:2d} of 20 shuffles")</div>
  <div class="fx" data-lang="text">selection before LOOCV: beats 'predict the mean' in 20 of 20 shuffles
selection in pipeline : beats 'predict the mean' in  7 of 20 shuffles
locality mean before  : beats 'predict the mean' in  7 of 20 shuffles</div>
  <p>Selection before the split beats the mean on all 20 shuffles of meaningless labels: an unmistakable alarm. The honest pipeline wins 7 times out of 20, by chance. But the naive locality average also wins only 7 times: with ten flats and three or four per locality, the check is too weak to catch a leak that still turned 3.69 into 1.68. The checks catch big leaks; small leaks on small data can only be prevented by construction. That is where the rest of this page goes.</p>

  <h2 id="pl-fitapi"><span class="num">07</span>fit, transform and fit_transform</h2>
  <p>Every contamination leak came from a step learning from rows it should only have been applied to. To prevent that by construction we first need to be precise about what "learning" means for a preprocessing step. Every scikit-learn step follows the same contract. <strong>fit(X, y)</strong> looks at the rows and <em>learns</em> something, storing it in attributes whose names end with an underscore: <code>mean_</code> and <code>scale_</code> for a scaler, <code>statistics_</code> for an imputer, <code>categories_</code> for an encoder, <code>coef_</code> for a model. <strong>transform(X)</strong> <em>applies</em> what was learnt to any rows, without learning anything new. <strong>fit_transform(X, y)</strong> does both on the same rows, sometimes faster, and is meant for training rows only. For a model, <strong>predict</strong> plays the role of transform.</p>
  <p>Think of a tailor. Taking your measurements is fit; cutting cloth to those measurements is transform. If the tailor re-measured every new piece of cloth instead of you, the suit would fit the cloth. The rule that follows is short: fit and fit_transform touch training rows only; everything else gets transform or predict. Train the scaler on flats A to H, then apply it to flats I and J when they arrive. By hand, (13 − 8.5)/2.291 = 1.964 and (14 − 8.5)/2.291 = 2.400, both correctly "larger than any training flat":</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler
Xtr = np.arange(5., 13.)[:, None]                      # flats A..H (training)
Xte = np.array([[13.], [14.]])                         # flats I, J arrive later
sc = StandardScaler().fit(Xtr)                         # LEARN mean_ and scale_ from A..H
print("learnt: mean_", sc.mean_, " scale_", sc.scale_.round(3))
print("transform(I, J)        :", sc.transform(Xte).ravel().round(3))           # APPLY training statistics
print("BUG fit_transform(I, J):", StandardScaler().fit_transform(Xte).ravel())  # re-learns from I and J
print("BUG on one live row J  :", StandardScaler().fit_transform([[14.]]).ravel())</div>
  <div class="fx" data-lang="text">learnt: mean_ [8.5]  scale_ [2.291]
transform(I, J)        : [1.964 2.4  ]
BUG fit_transform(I, J): [-1.  1.]
BUG on one live row J  : [0.]</div>
  <p>The last two lines are the classic bug. Calling <code>fit_transform</code> on I and J re-learns a mean of 13.5 and a standard deviation of 0.5 from those two rows, so they become −1 and +1, and the larger flat J now looks average. On a single live listing it always returns 0, whatever the area. This is both a leak (test statistics used) and a source of production errors (new data transformed differently from training data). Applying the rule by hand in every fold, every tuning candidate and at serving time is exactly where it breaks, which is why the next section hands it to an object.</p>

  <h2 id="pl-pipe"><span class="num">08</span>The Pipeline</h2>
  <p>A <strong>Pipeline</strong> is a list of named steps, any number of transformers followed by one final model, that behaves like a single model. Calling <code>pipe.fit(X, y)</code> runs <code>fit_transform</code> on each transformer in order, passing each output to the next, and then <code>fit</code> on the final model. Calling <code>pipe.predict(X)</code> runs only <code>transform</code> on each transformer (never fit) and then the model's <code>predict</code>. Think of an assembly line in a factory: during setup each station is calibrated on the training batch; during production each station only processes, using its calibration, and never recalibrates on the parts going through.</p>
<figure class="viz"><svg viewBox="0 0 660 230" width="660">
<defs><marker id="pip-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="10" y="22" font-size="12.5" font-weight="700">pipe.fit(X_train, y_train)</text>
<rect x="10" y="34" width="90" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="55" y="58" text-anchor="middle" font-size="12">X_train</text>
<rect x="130" y="34" width="150" height="40" rx="7" class="fb sb"/><text x="205" y="52" text-anchor="middle" font-size="12">imputer</text><text x="205" y="67" text-anchor="middle" class="tb" font-size="10.5">fit_transform</text>
<rect x="310" y="34" width="150" height="40" rx="7" class="fb sb"/><text x="385" y="52" text-anchor="middle" font-size="12">scaler</text><text x="385" y="67" text-anchor="middle" class="tb" font-size="10.5">fit_transform</text>
<rect x="490" y="34" width="150" height="40" rx="7" class="fg sg"/><text x="565" y="52" text-anchor="middle" font-size="12">model</text><text x="565" y="67" text-anchor="middle" class="tg" font-size="10.5">fit</text>
<line x1="100" y1="54" x2="128" y2="54" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="280" y1="54" x2="308" y2="54" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="460" y1="54" x2="488" y2="54" stroke="currentColor" marker-end="url(#pip-a2)"/>
<text x="205" y="92" text-anchor="middle" class="tm" font-size="10.5">learns statistics_ (medians)</text><text x="385" y="92" text-anchor="middle" class="tm" font-size="10.5">learns mean_, scale_</text><text x="565" y="92" text-anchor="middle" class="tm" font-size="10.5">learns coef_</text>
<line x1="205" y1="98" x2="205" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pip-a2)"/><line x1="385" y1="98" x2="385" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pip-a2)"/><line x1="565" y1="98" x2="565" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pip-a2)"/>
<text x="10" y="132" font-size="12.5" font-weight="700">pipe.predict(X_new)</text>
<rect x="10" y="144" width="90" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="55" y="168" text-anchor="middle" font-size="12">X_new</text>
<rect x="130" y="144" width="150" height="40" rx="7" class="ft st"/><text x="205" y="162" text-anchor="middle" font-size="12">imputer</text><text x="205" y="177" text-anchor="middle" class="tm" font-size="10.5">transform only</text>
<rect x="310" y="144" width="150" height="40" rx="7" class="ft st"/><text x="385" y="162" text-anchor="middle" font-size="12">scaler</text><text x="385" y="177" text-anchor="middle" class="tm" font-size="10.5">transform only</text>
<rect x="490" y="144" width="150" height="40" rx="7" class="ft st"/><text x="565" y="162" text-anchor="middle" font-size="12">model</text><text x="565" y="177" text-anchor="middle" class="tm" font-size="10.5">predict</text>
<line x1="100" y1="164" x2="128" y2="164" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="280" y1="164" x2="308" y2="164" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="460" y1="164" x2="488" y2="164" stroke="currentColor" marker-end="url(#pip-a2)"/>
<text x="330" y="214" text-anchor="middle" class="tm" font-size="11">dashed arrows: what was learnt in fit is reused, unchanged, at prediction time</text>
</svg><figcaption>One Pipeline, two calls. fit learns every step from the training rows only; predict reuses those learnt numbers on new rows. Because cross-validation and grid search call fit on training folds, every step is automatically re-learnt per fold.</figcaption></figure>
  <p>The top row is <code>fit</code>: the imputer learns its medians, the scaler its mean and scale, the model its coefficients, all from the training rows. The dashed arrows show those learnt numbers being carried down, unchanged, to the bottom row, <code>predict</code>, where new rows are only transformed. The important consequence: cross-validation and grid search call <code>fit</code> on each training fold, so every step is automatically re-learnt per fold, and the held-out fold only ever reaches transform. To see that rather than take it on trust, we put a do-nothing "spy" step at the front that prints which flats each call sees, and run 5-fold cross-validation over the ten flats in order:</p>
  <div class="fx" data-lang="py">from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.model_selection import KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

class Spy(BaseEstimator, TransformerMixin):
    """Passes data through unchanged, but reports which flats each call sees."""
    def fit(self, X, y=None):
        print(f"  fit       on {''.join(X.index)}")
        return self
    def transform(self, X):
        print(f"  transform on {''.join(X.index)}")
        return X

X = flats.set_index("flat")[["area"]]
pipe = Pipeline([("spy", Spy()), ("scale", StandardScaler()), ("model", LinearRegression())])
print("5-fold cross-validation:")
mse = -cross_val_score(pipe, X, price, cv=KFold(5), scoring="neg_mean_squared_error")
print("fold MSEs:", mse.round(2), " mean", mse.mean().round(2))
print("fit on all ten, then predict four new flats:")
pipe.fit(X, price)
new = pd.DataFrame({"area": [6.4, 8.7, 10.3, 13.6]}, index=list("KLMN"))
print("predictions:", pipe.predict(new).round(1), "| learnt mean_:", pipe["scale"].mean_)</div>
  <div class="fx" data-lang="text">5-fold cross-validation:
  fit       on CDEFGHIJ
  transform on CDEFGHIJ
  transform on AB
  fit       on ABEFGHIJ
  transform on ABEFGHIJ
  transform on CD
  fit       on ABCDGHIJ
  transform on ABCDGHIJ
  transform on EF
  fit       on ABCDEFIJ
  transform on ABCDEFIJ
  transform on GH
  fit       on ABCDEFGH
  transform on ABCDEFGH
  transform on IJ
fold MSEs: [6.95 2.66 6.72 5.75 4.44]  mean 5.31
fit on all ten, then predict four new flats:
  fit       on ABCDEFGHIJ
  transform on ABCDEFGHIJ
  transform on KLMN
predictions: [48.4 62.2 71.8 91.6] | learnt mean_: [9.5]</div>
  <p>Read the trace. In each round the spy is fitted on eight flats and only transforms the two held out (A and B, then C and D, and so on); the held-out flats never reach a fit. After cross-validation we fit on all ten flats, and the four new flats K to N are only transformed. The scaler's learnt mean is 9.5, and the predictions follow the least-squares line from earlier notes, 6 × area + 10: 6 × 6.4 + 10 = 48.4, up to 6 × 13.6 + 10 = 91.6.</p>
  <p>A few practical details. <code>make_pipeline(a, b, c)</code> builds a pipeline with automatic step names (the lowercase class name, such as <code>standardscaler</code>). Steps can be reached by name (<code>pipe["scale"]</code>, <code>pipe.named_steps</code>) or position (<code>pipe[-1]</code> is the model, <code>pipe[:-1]</code> the preprocessing). A step can be switched off by setting it to <code>"passthrough"</code>. <code>cross_val_score</code> works on copies (clones), so the original pipeline is unchanged by it. And one limitation: steps that change the number of rows, such as SMOTE oversampling or outlier removal, cannot live in a scikit-learn Pipeline, because <code>transform</code> must return one row per input row (at prediction time you cannot drop or invent rows). The <code>imbalanced-learn</code> library provides a Pipeline that applies such samplers only during fit; class weights are the other option.</p>

  <h2 id="pl-ct"><span class="num">09</span>ColumnTransformer</h2>
  <p>A pipeline is a single chain, but a real table needs different treatment for different columns. The portal's raw table has area in square feet, a locality name, an age with one blank, and a listing id. Numbers need imputing and scaling; categories need one-hot encoding; the id should be dropped. A <strong>ColumnTransformer</strong> takes a list of (name, transformer, columns) triples, applies each transformer to its own columns, and places the outputs side by side. Each transformer can itself be a pipeline. Think of a kitchen where vegetables go to one station, meat to another and spices to a third, and the dish is assembled at the end.</p>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

raw = flats.assign(listing_id=[f"PN-{i}" for i in range(101, 111)], area_sqft=flats.area * 100)
num = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
pre = ColumnTransformer([("num", num, ["area_sqft", "age"]),
                         ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["locality"])],
                        remainder="drop")                      # listing_id and the rest are dropped
pre.set_output(transform="pandas")
Z = pre.fit_transform(raw)
print("shape", Z.shape, "| learnt medians:", pre.named_transformers_["num"]["impute"].statistics_)
print(Z.round(3).loc[[0, 6]].to_string())
new = pd.DataFrame({"listing_id": ["PN-201"], "area_sqft": [870.], "locality": ["Wakad"], "age": [np.nan]})
print(pre.transform(new).round(3).to_string())</div>
  <div class="fx" data-lang="text">shape (10, 5) | learnt medians: [950.   7.]
   num__area_sqft  num__age  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0          -1.567     1.205                  0.0                     1.0                    0.0
6           0.522    -0.077                  0.0                     1.0                    0.0
   num__area_sqft  num__age  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0          -0.279    -0.077                  0.0                     0.0                    0.0</div>
  <p>Check it by hand. The median area of 500 to 1,400 sq ft is 950 and the median of the nine known ages is 7, so G's blank age is filled with 7 before scaling (its scaled value, −0.077, appears in row 6). Flat A's area becomes (500 − 950)/287.2 = −1.567. The output has two numeric columns plus three locality columns, five in all; the listing id was dropped by <code>remainder="drop"</code> (the default, which discards any column you did not list; <code>remainder="passthrough"</code> would keep them unchanged). Output names are prefixed with the step name, <code>num__</code> and <code>cat__</code>. The last line shows a new Wakad listing with no age: it gets the training median and all-zero locality columns, because <code>handle_unknown="ignore"</code> was set. Nothing crashes and nothing is re-learnt. Two habits keep this safe in production: select columns by name, not by position, because column order changes; and make sure every new column is either listed or deliberately dropped. <code>make_column_selector(dtype_include=object)</code> selects columns by type instead of by name.</p>

  <h2 id="pl-cv"><span class="num">10</span>Grid Search and Nested CV</h2>
  <p>Our preprocessing now has choices in it: mean or median imputation, locality in or out, and how strong the ridge penalty should be. These choices are hyperparameters just like the model's, and they should be tuned together and honestly, with every step re-learnt in every fold. Because a pipeline is one estimator, <code>GridSearchCV</code> can do exactly that. It only needs a way to name a parameter deep inside the pipeline, and the rule is to join the names along the path with double underscores: <code>model__alpha</code> is the <code>alpha</code> of the step called <code>model</code>; <code>pre__num__impute__strategy</code> goes from the pipeline step <code>pre</code>, into its transformer <code>num</code>, into that pipeline's step <code>impute</code>, to the parameter <code>strategy</code>. Naming a whole step (<code>pre__cat</code>) lets you swap it for another transformer or for <code>"drop"</code>, and naming the model step lets you compare model types in one search.</p>
  <p>Count the work first. Four alphas × two strategies × two locality options = 16 candidates. With leave-one-out on ten flats each candidate is fitted 10 times, so 160 fits, plus one final refit of the winner on all ten flats.</p>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

X = flats.assign(area_sqft=flats.area * 100)[["area_sqft", "age", "locality"]]
pre = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer()), ("scale", StandardScaler())]), ["area_sqft", "age"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])])
pipe = Pipeline([("pre", pre), ("model", Ridge())])
grid = {"model__alpha": [0.01, 0.1, 1, 10],                          # ridge strength
        "pre__num__impute__strategy": ["mean", "median"],            # three levels deep
        "pre__cat": [OneHotEncoder(handle_unknown="ignore"), "drop"]}  # locality on or off
gs = GridSearchCV(pipe, grid, **loo).fit(X, price)
res = pd.DataFrame(gs.cv_results_)
res["locality"] = ["drop" if v == "drop" else "one-hot" for v in res.param_pre__cat]
res["mse"] = -res.mean_test_score
print("candidates:", len(res), "| fits:", len(res) * 10, "+ 1 refit")
print(res.sort_values("mse")[["param_model__alpha", "param_pre__num__impute__strategy", "locality", "mse"]]
      .head(3).round(2).to_string(index=False))
inner = GridSearchCV(pipe, grid, cv=3, scoring="neg_mean_squared_error")
print("nested (outer LOO, inner 3-fold) MSE:", (-cross_val_score(inner, X, price, **loo)).mean().round(2))</div>
  <div class="fx" data-lang="text">candidates: 16 | fits: 160 + 1 refit
 param_model__alpha param_pre__num__impute__strategy locality  mse
               0.01                           median  one-hot 1.41
               0.01                             mean  one-hot 1.44
               0.10                           median  one-hot 1.63
nested (outer LOO, inner 3-fold) MSE: 1.63</div>
  <p>Locality is on in every top row (it is the feature that matters), the lightest ridge wins, and median imputation beats mean narrowly. The winner's own score, 1.41, is optimistic, because it is the best of 16 noisy estimates: we picked the luckiest. For an honest estimate of the whole process "tune, then deploy", wrap the search in an outer cross-validation, so each outer training set runs its own complete grid search and the outer held-out flat scores a winner it never influenced. This is <strong>nested cross-validation</strong>, and here it gives 1.63. It costs 10 × (16 × 3 + 1) = 490 fits. Report the nested number; use the plain search to choose the final settings (<a class="xref" data-note="ml_splits">Splits &amp; CV</a>). Grids grow quickly (multiply every list length, then the number of folds), so start coarse, use <code>RandomizedSearchCV</code> for many parameters, cache slow transformers with <code>Pipeline(memory=...)</code>, and never tune on the test set, which is leakage through model selection.</p>

  <h2 id="pl-custom"><span class="num">11</span>Custom Transformers</h2>
  <p>Real projects need steps scikit-learn does not ship. The flats' model has never seen anything like the bungalow; capping area at a value learnt from the training flats would keep its prediction in a sensible range, but that cap must be learnt inside each fold like any other statistic. There are two ways to write your own step, depending on whether it needs to learn anything.</p>
  <p>If a step learns nothing (a unit conversion, a log, a ratio of two columns, splitting a date), wrap a function: <code>FunctionTransformer(func)</code> fits instantly and calls <code>func</code> on every transform. If a step must learn from training rows (which categories are frequent, which quantiles to clip at), write a small class, following a few rules that make it work with cloning, pipelines, cross-validation and grid search. Inherit from <code>BaseEstimator</code> (which provides <code>get_params</code> and <code>set_params</code>) and <code>TransformerMixin</code> (which provides <code>fit_transform</code>). Let <code>__init__</code> only store its arguments under the same names, with no checks or computation, because <code>clone</code> rebuilds the object from those arguments. Let <code>fit</code> learn, store the results in attributes ending with an underscore, and return <code>self</code>. Let <code>transform</code> use only those learnt attributes and return one row per input row.</p>
  <div class="fx" data-lang="py">from sklearn.base import BaseEstimator, TransformerMixin, clone
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.utils.validation import check_is_fitted

def to_hundreds(X):                       # stateless: a plain, named function
    return np.asarray(X, dtype=float) / 100

class QuantileClipper(BaseEstimator, TransformerMixin):
    """Clip each column to the [low, high] quantiles learnt from TRAINING rows."""
    def __init__(self, low=0.05, high=0.95):
        self.low, self.high = low, high              # only store the settings
    def fit(self, X, y=None):
        X = np.asarray(X, dtype=float)
        self.lo_ = np.quantile(X, self.low, axis=0)  # learnt values end in "_"
        self.hi_ = np.quantile(X, self.high, axis=0)
        return self                                  # always return self
    def transform(self, X):
        check_is_fitted(self, "lo_")
        return np.clip(np.asarray(X, dtype=float), self.lo_, self.hi_)

sqft = (flats.area * 100).to_numpy()[:, None]        # the portal stores square feet
pipe = make_pipeline(FunctionTransformer(to_hundreds), QuantileClipper(), LinearRegression()).fit(sqft, price)
clip = pipe["quantileclipper"]
print("learnt: lo_", clip.lo_, " hi_", clip.hi_)
plain = make_pipeline(FunctionTransformer(to_hundreds), LinearRegression()).fit(sqft, price)
print("5,000 sq ft bungalow: with clipper", pipe.predict([[5000.]]).round(1), " without", plain.predict([[5000.]]).round(1))
print("clone keeps settings, drops learnt state:", clone(clip).get_params(), hasattr(clone(clip), "lo_"))</div>
  <div class="fx" data-lang="text">learnt: lo_ [5.45]  hi_ [13.55]
5,000 sq ft bungalow: with clipper [92.4]  without [310.]
clone keeps settings, drops learnt state: {'high': 0.95, 'low': 0.05} False</div>
  <p>The stateless <code>FunctionTransformer</code> converts square feet to hundreds. The clipper learns the 5th and 95th percentiles of training areas, 5.45 and 13.55, in <code>fit</code>, and only applies them in <code>transform</code>. The bungalow is predicted at 92.4 lakh instead of 310: clipping trades a wild extrapolation for a capped one (its real price, about 400, shows that neither is right; the honest answer is "outside what this model knows", which a range check should flag). <code>clone</code> keeps the settings and drops the learnt <code>lo_</code> and <code>hi_</code>, which is exactly what makes the step safe inside cross-validation, and because <code>low</code> and <code>high</code> are constructor parameters, a grid search can tune them as <code>quantileclipper__high</code>. Two traps: never compute statistics inside <code>transform</code> (for example, category frequencies of the batch being transformed), which recreates the fit_transform-on-test bug; and use named functions rather than lambdas in pipelines you will save, as section 13 shows.</p>

  <h2 id="pl-save"><span class="num">12</span>Saving and Train/Serve Skew</h2>
  <p>The tuned pipeline lives in a Python session; a pricing service needs it tomorrow on another machine. Save the <strong>whole fitted pipeline</strong>, not just the model: the imputer medians, scaler statistics, category lists and model weights are all part of "the model". Saving only the final estimator forces someone to re-implement preprocessing at serving time, which is how most production bugs in this area are born. Store metadata alongside it (library versions, training date, feature list, data snapshot, validation score) so you can always tell what produced a file.</p>
  <div class="fx" data-lang="py">import os, tempfile, joblib, sklearn
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

pipe = make_pipeline(ColumnTransformer([("num", StandardScaler(), ["area"]),
                                        ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])]),
                     Ridge(alpha=0.01)).fit(flats[["area", "locality"]], price)
path = os.path.join(tempfile.mkdtemp(), "flats_price.joblib")
joblib.dump({"pipeline": pipe, "sklearn_version": sklearn.__version__,
             "features": ["area", "locality"], "target": "asking price, lakh"}, path)
bundle = joblib.load(path)                                   # ONLY load files you trust
new = pd.DataFrame({"area": [6.4, 8.7, 10.3, 13.6], "locality": ["Baner", "Kothrud", "Hadapsar", "Wakad"]})
a, b = pipe.predict(new), bundle["pipeline"].predict(new)
print(f"saved {os.path.getsize(path):,} bytes | version {bundle['sklearn_version']}")
print("predictions K..N:", a.round(1), "| identical after reload:", np.array_equal(a, b))</div>
  <div class="fx" data-lang="text">saved 2,895 bytes | version 1.9.1
predictions K..N: [51.5 61.8 68.9 90.4] | identical after reload: True</div>
  <p>One small file holds the column transformer and the ridge weights, and the reloaded pipeline gives identical predictions. Flat N, listed in Wakad, gets no locality premium because the saved encoder ignores unknown categories, a behaviour decided at training time that travels with the file. Two cautions come with <code>joblib</code> and <code>pickle</code>. Loading a pickle can run arbitrary code, so never load files you do not trust. And a pickle made with one scikit-learn version may fail, or worse, load and behave differently, under another, so pin the serving environment to the recorded versions and re-check a few stored predictions after loading. <code>skops</code> offers safer loading, ONNX gives language-independent serving, and a model registry such as <a class="xref" data-note="mlops_mlflow">MLflow</a> tracks versions.</p>
  <p>Saving guarantees the model is the same; it does not guarantee the input is. <strong>Train/serve skew</strong> is a difference between the features the model was trained on and the features it receives in production, caused by the system rather than by the world changing: the serving team re-implements a step in another language, sends a value in different units, spells a category differently, skips a step, or computes a feature from a fresher table. It is the production twin of leakage: leakage makes offline scores too optimistic, skew makes online behaviour different from what was tested. Here is the saved flats pipeline receiving realistic serving bugs for a flat just like E (area 9, Baner, price 67):</p>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
pipe = make_pipeline(ColumnTransformer([("num", StandardScaler(), ["area"]),
                                        ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])]),
                     Ridge(alpha=0.01)).fit(flats[["area", "locality"]], price)

live = pd.DataFrame({"area": [9.], "locality": ["Baner"]})             # a flat just like E (price 67)
print(f"correct input                 : {pipe.predict(live)[0]:7.1f}")
print(f"skew 1: area sent in sq ft    : {pipe.predict(live.assign(area=900.))[0]:7.1f}")
print(f"skew 2: locality as 'baner'   : {pipe.predict(live.assign(locality='baner'))[0]:7.1f}")
batch = pd.DataFrame({"area": [900., 1100., 750.], "locality": ["baner", "Kothrud", "Baner"]})
known = pipe[0].named_transformers_["cat"].categories_[0]
print("guard: live/train median area =", round(batch.area.median() / flats.area.median(), 1),
      "| unknown localities:", sorted(set(batch.locality) - set(known)))</div>
  <div class="fx" data-lang="text">correct input                 :    66.5
skew 1: area sent in sq ft    :  5208.3
skew 2: locality as 'baner'   :    63.8
guard: live/train median area = 94.7 | unknown localities: ['baner']</div>
  <p>With correct input the price is 66.5. Sent as 900 sq ft instead of 9 hundred, the area becomes hundreds of standard deviations from the training mean and the prediction is 5,208 lakh. Spelled "baner", the locality is an unknown category, gets all-zero locality columns and loses the Baner premium (63.8, a quiet error that no one would notice). Nothing crashed in either case. The cheap guards at the bottom catch both before any prediction is trusted: a live-to-training median ratio of 94.7 for area and an unknown locality. The defences are to serve the same fitted pipeline object that was validated, share one feature-definition library (or a feature store) between training and serving, validate column names, types, units, ranges and categories at the serving boundary, and log served features and compare their distributions with training (<a class="xref" data-note="sd_monitoring">Monitoring</a>). Skew is different from <strong>data drift</strong>, where the code is right but the world changed (a new customer mix, inflation) and the fix is to retrain; both show up as live performance below offline performance, and logging features is how you tell them apart. Deployment itself continues in <a class="xref" data-note="mlops_deploy">Model Deployment</a>.</p>

  <h2 id="pl-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common mistake is fitting a learnt step on the full table before splitting: <code>StandardScaler().fit_transform(X)</code>, <code>SelectKBest(...).fit(X, y)</code> or <code>SMOTE().fit_resample(X, y)</code> followed by <code>train_test_split</code> or cross-validation. Section 02 showed it turning pure noise into 85% accuracy. The fix is always the same: put the step inside the pipeline and cross-validate the pipeline. Its twin is calling <code>fit_transform</code> on test or live rows, which re-learns statistics from them ([13, 14] became [−1, 1], and a single live row always becomes 0).</p>
  <p>A frequent pipeline error is using the bare parameter name in a grid:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
pipe = make_pipeline(StandardScaler(), Ridge())
try:
    GridSearchCV(pipe, {"alpha": [0.1, 1]}, cv=3).fit(flats[["area"]], price)
except ValueError as e:
    print("ValueError:", str(e)[:80], "...")
print([k for k in pipe.get_params() if "alpha" in k])        # the valid name</div>
  <div class="fx" data-lang="text">ValueError: Invalid parameter 'alpha' for estimator Pipeline(steps=[('standardscaler', Stand ...
['ridge__alpha']</div>
  <p>On a pipeline, <code>alpha</code> is not a parameter; the step's is. The fix is <code>ridge__alpha</code> (step name, two underscores, parameter), and <code>pipe.get_params().keys()</code> lists every valid name.</p>
  <p>Another appears only when you try to save. A pipeline that contains a lambda cannot be pickled:</p>
  <div class="fx" data-lang="py">import pickle
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer
pipe = make_pipeline(FunctionTransformer(lambda X: X / 100), LinearRegression()).fit(flats[["area"]] * 100, price)
try:
    pickle.dumps(pipe)
except Exception as e:
    print(type(e).__name__ + ":", str(e).split(" at ")[0])</div>
  <div class="fx" data-lang="text">PicklingError: Can't pickle &lt;function &lt;lambda&gt;</div>
  <p>Standard <code>pickle</code> and <code>joblib</code> save functions by name, and a lambda has none. Use a named function defined at module level, as <code>to_hundreds</code> was in section 11.</p>
  <p>The rest have appeared in the sections above. Global <code>groupby</code> features computed over all rows (other rows' data, and for target columns, target leakage). Random splits for time-ordered or grouped data (0.991 on random labels; MAE 6.2 instead of 13.4). Tuning many decisions by looking at the test score, which leaks the test set into the model. Building a feature from the whole history (the whole-year locality average looked excellent at 2.24 and its honest version made the model worse). Saving only the model without its preprocessing. Loading untrusted pickles or unpinned versions. And trusting a passed shuffled-label check on tiny data, which missed the locality leak on ten flats.</p>

  <h2 id="pl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: ten flats A–J, area 5–14 (100 sq ft), price 38, 49, 53, 56, 67, 68, 73, 83, 87, 96 (lakh), localities Hadapsar (A, D, G), Baner (B, E, H, J), Kothrud (C, F, I); line 6 × area + 10; area-only LOOCV MSE 7.25.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Data leakage</b>: using, in training or model selection, information not available at prediction time.</li>
    <li><b>Target leakage</b>: a feature that is a consequence of the target or recorded after it (final sale price, refund issued).</li>
    <li><b>Train–test contamination</b>: a learnt step (scaler, selector, encoder, imputer, sampler) fitted on rows that should be unseen.</li>
    <li><b>Group leakage</b>: the same entity on both sides of the split.</li>
    <li><b>As-of feature</b>: computed only from data that existed at the prediction moment.</li>
    <li><b>fit / transform / fit_transform</b>: learn (attributes ending in _) / apply / both, on training rows only.</li>
    <li><b>Pipeline</b>: named transformers + final model; fit = fit_transform each step then fit the model; predict = transform each step then predict.</li>
    <li><b>ColumnTransformer</b>: (name, transformer, columns) triples, outputs stacked; <code>remainder</code> drops or passes the rest.</li>
    <li><b>Nested CV</b>: an outer CV around the whole search; the honest score of "tune, then deploy".</li>
    <li><b>Train/serve skew vs drift</b>: serving computes features differently (fix the code) vs the world changed (retrain).</li>
  </ul>
  <h3>The leaks, measured</h3>
  <table class="tbl">
    <tr><th>Leak</th><th>Ten flats (leaky → honest)</th><th>At scale (leaky → honest)</th><th>Fix</th></tr>
    <tr><td>Column from the future</td><td>final price: 0.80 → 7.25</td><td>refund_issued: 0.984 → 0.832</td><td>as-of snapshots; ask when each column is filled</td></tr>
    <tr><td>Selection before the split</td><td>162.7 → 788.9 (mean: 372.3)</td><td>0.85 → 0.48 on noise</td><td>selector inside the pipeline</td></tr>
    <tr><td>Scaler before the split</td><td>bungalow z 2.79 → 18.11</td><td>+0.0004 accuracy</td><td>scaler inside the pipeline</td></tr>
    <tr><td>Target encoding before the split</td><td>1.68 → 3.69</td><td>AUC 0.902 → 0.711</td><td>cross-fitted <code>TargetEncoder</code> in the pipeline</td></tr>
    <tr><td>Time</td><td>whole-year mean 2.24 → as-of 29.04 (area 6.91)</td><td>MAE 6.2 → 13.4</td><td>time-ordered splits, past-only features</td></tr>
    <tr><td>Duplicates / groups</td><td>4-NN 0.00 → 33.79</td><td>0.991 → 0.482</td><td>dedupe; GroupKFold</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.model_selection import GridSearchCV, cross_val_score

num = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
pre = ColumnTransformer([("num", num, ["area", "age"]),
                         ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])])
pipe = Pipeline([("pre", pre), ("model", Ridge())])
cross_val_score(pipe, X, y, cv=5)                          # every step refit per fold
grid = {"model__alpha": [0.1, 1], "pre__num__impute__strategy": ["mean", "median"]}
gs = GridSearchCV(pipe, grid, cv=5).fit(X, y)              # candidates x folds + 1 refit
cross_val_score(GridSearchCV(pipe, grid, cv=3), X, y, cv=5)   # nested CV
joblib.dump(gs.best_estimator_, "model.joblib")            # the whole pipeline</div>
  <h3>Gotchas</h3>
  <ul>
    <li>fit and fit_transform on training rows only; transform/predict everything else.</li>
    <li>Cross-validation cannot catch a column from the future; ask when each column is filled.</li>
    <li>Splitting first is not enough for target encoding: use cross-fitting.</li>
    <li>Grid keys need the step path: <code>model__alpha</code>, not <code>alpha</code>.</li>
    <li>Row-changing steps (SMOTE) need imbalanced-learn's Pipeline.</li>
    <li><code>best_score_</code> is optimistic; report nested CV.</li>
    <li>No lambdas in pipelines you save; pin versions; never load untrusted pickles.</li>
  </ul>

  <h2 id="pl-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is data leakage? Name its two main families.</summary><div class="qa-body">Using information during training or model selection that will not be available at prediction time, which inflates offline scores. Target leakage: a feature encodes the answer or is recorded after it (refund issued, for churn). Train–test contamination: a learnt preprocessing step such as a scaler, selector, encoder or sampler is fitted on rows that should be unseen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What single question helps you find leaks?</summary><div class="qa-body">"At the moment I make this prediction in production, would I know this value, computed this way?" Ask it of every column and every preprocessing step. Anything filled in after the outcome, aggregated over future data, or computed with statistics from held-out rows fails it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature selection before cross-validation inflate scores so much, while scaling barely does?</summary><div class="qa-body">The selector uses the labels: among many noise columns it picks those that match all labels by chance, including the future validation labels, so cross-validation then finds "signal" (0.85 accuracy on pure noise against 0.48 honestly). A scaler learns only a mean and standard deviation per column without labels, so one extra fold barely changes it. Both are contamination and both belong in the pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain why naive target encoding leaks, and how to do it properly.</summary><div class="qa-body">Each row's own label is included in its category's average, so cheap rows get a slightly lower feature and expensive rows a slightly higher one; with few rows per category this is label information. Do it inside the pipeline, fitted on training rows only, with cross-fitting (each training fold encoded from the other folds) and smoothing toward the global mean, as <code>TargetEncoder</code> does.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a random split wrong for time series? Where else does time leak?</summary><div class="qa-body">The model trains on days after the validation days and can interpolate, which it cannot do when forecasting (MAE 6.2 shuffled against 13.4 time-ordered). Time also leaks through centred rolling windows, whole-history aggregates, tables updated after the event, and scalers fit on the full period. Use forward-chaining splits, past-only shifted features, as-of joins and a gap for delayed labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Patients have four visits each. Why can random K-fold score 99% on random labels?</summary><div class="qa-body">Almost every test visit has a near-identical sibling visit in training with the same label, so the model recognises the patient rather than learning anything. GroupKFold keeps each patient's visits in one fold and gives the honest 0.48. The same applies to customers, devices, documents and relisted flats.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you investigate a validation AUC of 0.99 on a hard problem?</summary><div class="qa-body">Look for one dominant feature and ask when it is filled; re-score with a split that mirrors production (time or group); search the code for fitting before the split, global groupby aggregates and centred windows; check for duplicates across the split; run the whole pipeline with shuffled labels, which should give about 0.5; try adversarial validation; and compare with a simple baseline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between fit, transform and fit_transform?</summary><div class="qa-body">fit learns parameters from data and stores them in attributes ending with an underscore; transform applies those parameters without learning; fit_transform does both on the same rows. Use fit and fit_transform on training rows only. fit_transform on test data re-learns from the test rows, a leak and a mismatch: on a single live row a scaler always outputs 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly happens when you call fit and predict on a Pipeline?</summary><div class="qa-body">fit runs fit_transform on each transformer in order, feeding each output to the next, then fits the final estimator. predict runs only transform on each transformer and then the estimator's predict, so nothing learns at prediction time. Because cross-validation and grid search call fit on training folds, every step is re-learnt per fold and held-out rows only reach transform.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need a ColumnTransformer?</summary><div class="qa-body">Whenever different columns need different preprocessing, such as imputing and scaling numbers, one-hot encoding categories and dropping ids. It applies each (name, transformer, columns) triple and concatenates the results; <code>remainder</code> decides what happens to unlisted columns. Select columns by name, and set <code>handle_unknown="ignore"</code> on encoders so unseen categories do not crash serving.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tune a parameter inside a ColumnTransformer inside a Pipeline?</summary><div class="qa-body">Join the step names with double underscores: <code>pre__num__impute__strategy</code> means step "pre", its transformer "num", its step "impute", parameter "strategy". Whole steps can be swapped or set to "passthrough" or "drop" the same way, and the model step can be given a list of different estimators. <code>pipe.get_params().keys()</code> lists the valid names.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is GridSearchCV's best_score_ optimistic, and what do you report instead?</summary><div class="qa-body">It is the maximum of many noisy cross-validation scores, so it is biased upward by the selection itself. Nested cross-validation runs the entire search inside each outer training fold and scores the winner on the outer held-out fold, giving an honest estimate of "tune, then deploy" (1.41 against nested 1.63 on the flats).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many fits does a grid of 16 candidates with leave-one-out on ten rows need? And nested with an inner 3-fold?</summary><div class="qa-body">16 × 10 = 160 fits, plus 1 refit of the winner, so 161. Nested: each of the 10 outer folds runs 16 × 3 inner fits plus 1 refit, so 10 × 49 = 490 fits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the rules for writing a custom scikit-learn transformer?</summary><div class="qa-body">Inherit BaseEstimator and TransformerMixin. <code>__init__</code> only stores its arguments under the same names, with no logic, so <code>get_params</code> and <code>clone</code> work. <code>fit</code> learns from training data, stores attributes ending in "_" and returns self. <code>transform</code> uses only the learnt attributes and returns one row per input row. Stateless logic can simply be a FunctionTransformer with a named function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't SMOTE be a step in a normal scikit-learn Pipeline?</summary><div class="qa-body">A transformer must return one row per input row at both fit and predict time, while SMOTE adds rows and must never run at prediction. imbalanced-learn's Pipeline applies samplers only during fit, so inside cross-validation it resamples only the training fold. Class weights are an alternative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you save a model for serving, and what are the risks?</summary><div class="qa-body">Save the whole fitted pipeline, not just the estimator, with metadata such as library versions, feature list and training data snapshot. Pickle and joblib files run code when loaded, so never load untrusted files, and they can break or behave differently across library versions, so pin versions and smoke-test predictions after loading. skops, ONNX and model registries are alternatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is train/serve skew, and how is it different from data drift?</summary><div class="qa-body">Skew is a mismatch created by the system: serving computes features differently from training, through re-implemented code, different units, misspelt categories or skipped steps. Drift is the world changing while the code is correct. Prevent skew by serving the same pipeline object and shared feature code, validating inputs at the boundary, and logging served features to compare with training; respond to drift by retraining.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Cross-validation already holds data out. Why is that not enough to prevent leakage?</summary><div class="qa-body">Cross-validation holds rows out of the model's fit, but steps run before it (a scaler, a selector, a locality average) have already seen those rows, and a column from the future is filled in for held-out rows too. The pipeline moves every learnt step inside the fold, the split must match production (time order, groups), and each column must be checked for when it is known.</div></details>
</main>
`
});
