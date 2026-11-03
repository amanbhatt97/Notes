// notes/ml/ml_dimred.js — Curse of Dimensionality & Feature Selection
Object.assign(TOPIC_CONTENT, {
  "ml_dimred": `<main>
  <h1>Curse of Dimensionality &amp; Feature Selection</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>Curse of Dimensionality &amp; Feature Selection</span></div>
  <p class="lead">Every column in a table is one more thing a model can learn from, so it is tempting to believe that more columns always help. They do not. Past a point, each extra column makes the data thinner, the model slower and more likely to memorise noise, and for methods that rely on distances it can make "nearest" almost meaningless. This page explains why that happens, a set of effects known as the <strong>curse of dimensionality</strong>, and then teaches the first cure, <strong>feature selection</strong>: deciding which columns to keep. The running example is a hospital that measures breast tumours on a scan and wants to predict which ones are malignant. We work out every score by hand on 10 small teaching tumours, then run the same idea with scikit-learn on the real dataset of 569 tumours with 30 measurements each.</p>

  <h2 id="dr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Curse of Dimensionality &amp; Feature Selection</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The curse</div>
        <ul>
          <li>Space grows like 10^d: data becomes sparse</li>
          <li>Most volume sits near the edges (1 − 0.9^d)</li>
          <li>Distances concentrate: nearest ≈ farthest</li>
          <li>Hurts kNN, k-means, SVM-RBF most; trees least</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filter methods</div>
        <ul>
          <li>Score each column alone, no model</li>
          <li>Variance, correlation, χ², ANOVA F, mutual information</li>
          <li>Fast, but blind to redundancy and teamwork</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Wrapper methods</div>
        <ul>
          <li>Search column sets using the model's CV score</li>
          <li>Forward, backward, RFE, RFECV</li>
          <li>Sees redundancy; costs many fits</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Embedded methods</div>
        <ul>
          <li>The model selects while training</li>
          <li>L1 sets coefficients to exactly 0</li>
          <li>Tree importances (MDI, permutation)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Doing it right</div>
        <ul>
          <li>Select inside each CV fold (Pipeline)</li>
          <li>Selection keeps names; extraction (PCA) merges columns</li>
          <li>Wins are cost and explanation, rarely raw accuracy</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dr-dims"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Columns as Dimensions</span><span class="rm-sub">the tumour data and what "a dimension" means</span></div></div>
      <div class="rm-item rm-done" data-target="dr-curse"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Curse of Dimensionality</span><span class="rm-sub">empty space, hollow cubes, equal distances</span></div></div>
      <div class="rm-item rm-done" data-target="dr-models"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">What the Curse Does to Models</span><span class="rm-sub">noise columns against kNN and a forest</span></div></div>
      <div class="rm-item rm-done" data-target="dr-selext"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Selection vs Extraction</span><span class="rm-sub">keep columns, or build new ones</span></div></div>
      <div class="rm-item rm-done" data-target="dr-filter"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Filters: Variance and Correlation</span><span class="rm-sub">the cheapest tests of a column</span></div></div>
      <div class="rm-item rm-done" data-target="dr-stats"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Filters: χ², ANOVA F and Mutual Information</span><span class="rm-sub">statistical tests of "related to the label"</span></div></div>
      <div class="rm-item rm-done" data-target="dr-wrapper"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Wrapper Methods</span><span class="rm-sub">forward, backward, RFE, RFECV</span></div></div>
      <div class="rm-item rm-done" data-target="dr-embedded"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Embedded Methods</span><span class="rm-sub">L1 zeros and tree importance</span></div></div>
      <div class="rm-item rm-done" data-target="dr-leak"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Selecting Without Leakage</span><span class="rm-sub">a model that "learns" pure noise</span></div></div>
      <div class="rm-item rm-done" data-target="dr-compare"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Comparing the Methods</span><span class="rm-sub">one fair benchmark, when to use which</span></div></div>
      <div class="rm-item rm-done" data-target="dr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">leakage, twins, units, misread zeros</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, tables, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="dr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on this topic</span></div></div>
    </div>
  </div>

  <h2 id="dr-dims"><span class="num">01</span>Columns as Dimensions</h2>
  <p>A hospital scans breast tumours and, for each one, measures things like its radius, its perimeter, how rough its texture looks and how smooth its edge is. A biopsy later says whether the tumour was malignant (cancerous) or benign. The hospital wants a model that predicts the biopsy result from the scan measurements. The real version of this data is built into scikit-learn as the Wisconsin breast-cancer dataset: <strong>569 tumours, 30 measurements each</strong>, 212 malignant and 357 benign. Every full-size example on this page uses it.</p>
  <p>Thirty columns are too many to calculate by hand, so we also use a tiny teaching version with 10 tumours. Each column was chosen to teach one lesson. <code>radius</code> is genuinely useful. <code>perimeter</code> is roughly 2π × radius, so it is a near-copy of radius. <code>texture</code> is somewhat useful. <code>smooth</code> has nothing to do with the label. <code>scanner</code> records which machine was used and is the same for every tumour. <code>rare_flag</code> is 1 for only one tumour. <code>big</code> is a yes/no column that says whether the radius is at least 15 mm. Every hand-worked example below imports this little table from a file called <code>tumours.py</code>:</p>
  <div class="fx" data-lang="py">import pandas as pd
# 10 teaching tumours shaped like the breast-cancer data (sizes in mm, rounded)
mini = pd.DataFrame({
    "radius":    [10, 11, 12, 13, 14, 13, 15, 16, 17, 19],
    "perimeter": [62, 69, 75, 80, 88, 83, 95, 99, 107, 120],   # about 2*pi*radius: a near-copy
    "texture":   [15, 18, 14, 17, 20, 21, 17, 23, 19, 25],
    "smooth":    [9, 11, 10, 8, 12, 10, 9, 12, 11, 8],          # unrelated to the label
    "scanner":   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],                # same machine every time
    "rare_flag": [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],                # 1 in only one row
    "malignant": [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]})               # the label
mini["big"] = (mini.radius &gt;= 15).astype(int)                   # a yes/no version of radius</div>
  <div class="fx" data-lang="py">from tumours import mini
print(mini.to_string())
print("\\nmeans by class:")
print(mini.groupby("malignant")[["radius", "texture", "smooth"]].mean())</div>
  <div class="fx" data-lang="text">   radius  perimeter  texture  smooth  scanner  rare_flag  malignant  big
0      10         62       15       9        1          0          0    0
1      11         69       18      11        1          0          0    0
2      12         75       14      10        1          0          0    0
3      13         80       17       8        1          0          0    0
4      14         88       20      12        1          0          0    0
5      13         83       21      10        1          0          1    0
6      15         95       17       9        1          0          1    1
7      16         99       23      12        1          1          1    1
8      17        107       19      11        1          0          1    1
9      19        120       25       8        1          0          1    1

means by class:
           radius  texture  smooth
malignant                         
0            12.0     16.8    10.0
1            16.0     21.0    10.0</div>
  <p>The story is already visible in the class averages. Malignant tumours are bigger (average radius 16 against 12) and rougher (texture 21 against 16.8), while smoothness is exactly the same in both classes (10 and 10). Keep this table in mind; nearly every score on this page will be computed from it.</p>
  <p>To talk about "too many columns" we need a picture of what a column is. With two columns, radius and texture, each tumour is a dot on graph paper: radius along the bottom edge, texture up the side. Add smoothness and each tumour becomes a dot floating inside a box. Each column is one <strong>direction</strong>, also called an axis, and the number of columns is the <strong>dimension</strong> of the data, usually written d. So the real dataset is 569 points in a 30-dimensional space. Nobody can draw 30 directions, but all the arithmetic still works: the distance between two tumours is still the square root of the sum of squared differences, just with 30 terms instead of 2.</p>
  <p>Wide tables are completely normal in practice. One-hot encoding a "city" column with 300 cities creates 300 columns. An 8 × 8 image has 64 pixel columns. A bag-of-words text model has one column per word in the vocabulary, often tens of thousands. Gene-expression studies measure 20,000 genes for perhaps 200 patients. In all of these cases the number of columns is large compared with the number of rows, and that is exactly when the trouble starts. Notice the direction of the problem: "more data" normally means more <em>rows</em>, and more rows help. More <em>columns</em> with the same number of rows make the data relatively scarcer, as the next section shows.</p>

  <h2 id="dr-curse"><span class="num">02</span>The Curse of Dimensionality</h2>
  <p>The phrase <strong>curse of dimensionality</strong> (coined by the mathematician Richard Bellman in 1961) is the name for a group of strange effects that appear when the number of columns grows while the number of rows stays fixed. They all come from one fact: every new direction multiplies the amount of space, so the same number of points is spread ever more thinly. Think of trying to find a friend. On a railway platform, which has one direction, it is easy. On a cricket ground, with two directions, it is harder. In a 100-floor building with three directions it is hopeless. The same crowd of people is spread over much more space.</p>
  <p>The first effect is <strong>sparsity</strong>. Cut the range of every column into 10 equal bins. With one column there are 10 boxes; with two columns 10 × 10 = 100 boxes; with d columns there are 10^d boxes. Our 569 tumours with one measurement fill 10 boxes with about 57 tumours each. With two measurements there are 5.7 tumours per box. With all 30 measurements there are 10^30 boxes, so almost every box is empty, and a new tumour will nearly always land in a box that no training tumour has ever visited. A model learns "what happens around here" from the rows around here, and in 30 dimensions there are no rows around here. To keep 10 rows per box you would need 10^31 tumours. The amount of data needed grows exponentially with the number of columns.</p>
  <p>The second effect answers the natural follow-up question: if the boxes are empty, where are the points? Rescale every column to run from 0 to 1, so the data lives in a unit cube, and call a point "near the edge" if any one of its coordinates is within 0.05 of 0 or 1. In one dimension the safe middle runs from 0.05 to 0.95, which is 90% of the line. In d dimensions a point is safe only if <em>every</em> coordinate is safe, so the safe share of the volume is 0.9^d and the share near an edge is <strong>1 − 0.9^d</strong>. In 2 dimensions that is 0.19, in 10 dimensions 0.65, and in 30 dimensions 0.958. In other words, in 30-D almost all of the space is "near the edge", where a model has to extrapolate rather than interpolate. The cube is effectively hollow.</p>
  <p>The third effect is that <strong>neighbourhoods stop being local</strong>. A method like k-nearest neighbours (kNN) predicts from the rows closest to the query. Suppose we want the nearest 10% of the data. For uniformly spread data, a small cube with side length ℓ holds a fraction ℓ^d of the points, so we need ℓ^d = 0.1, which gives <strong>ℓ = 0.1^(1/d)</strong>. In one dimension ℓ = 0.1, a tight window. In 30 dimensions ℓ = 0.1^(1/30) = 0.926: to collect 10% of the tumours you must stretch over 93% of the range of every single measurement. Such a "neighbourhood" contains tumours that are not similar at all. The code below checks all three volume facts. The middle column is the share of the cube filled by the largest ball that fits inside it, another way of seeing that the volume runs off into the corners.</p>
  <div class="fx" data-lang="py">from math import pi, gamma
print("  d | near an edge | ball/cube | edge for 10% of data")
for d in (1, 2, 3, 10, 30, 100):
    shell = 1 - 0.9 ** d                                  # within 0.05 of a face on ANY axis
    ball = pi ** (d / 2) / gamma(d / 2 + 1) * 0.5 ** d    # ball of radius 0.5 inside the unit cube
    edge = 0.1 ** (1 / d)                                 # side of a sub-cube holding 10% of uniform data
    print(f"{d:3d} | {shell:12.3f} | {ball:9.4f} | {edge:6.3f}")</div>
  <div class="fx" data-lang="text">  d | near an edge | ball/cube | edge for 10% of data
  1 |        0.100 |    1.0000 |  0.100
  2 |        0.190 |    0.7854 |  0.316
  3 |        0.271 |    0.5236 |  0.464
 10 |        0.651 |    0.0025 |  0.794
 30 |        0.958 |    0.0000 |  0.926
100 |        1.000 |    0.0000 |  0.977</div>
  <p>Each row matches the reasoning: the share near an edge climbs 0.19 → 0.651 → 0.958, the inscribed ball fills 79% of a square but only 0.25% of a 10-D cube, and the side needed for a 10% neighbourhood climbs 0.316 → 0.794 → 0.926.</p>
  <p>The fourth effect is the one that hurts most in practice: <strong>distance concentration</strong>, meaning that all pairwise distances become nearly equal. Take two random points in the unit cube. Along one axis, the squared difference (a − b)² of two random numbers between 0 and 1 has an average of 1/6. The squared distance between the points is the sum of d such terms, so its average is <strong>d/6</strong>; it grows in proportion to d. But its spread (standard deviation) grows only like √d, because the random ups and downs of independent terms partly cancel. So the spread relative to the average shrinks like √d / d = 1/√d. Working out the constant gives std/mean = √(7/(5d)): 1.18 for one dimension, 0.216 for 30, 0.037 for 1,000. In 1,000 dimensions every pair of random points is at almost exactly the same distance, give or take 4%, and then "the nearest point" is decided by noise. The code checks the formulas with random pairs, then asks the practical question: from one query tumour, how much farther is the farthest other tumour than the nearest?</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.preprocessing import StandardScaler
rng = np.random.default_rng(0)

# part 1: random pairs of points in the unit cube, checked against the formulas
for d in (1, 30, 1000):
    A, B = rng.random((20000, d)), rng.random((20000, d))       # 20,000 random pairs
    sq = ((A - B) ** 2).sum(axis=1)                              # squared distance of each pair
    print(f"d={d:4d}: mean sq dist {sq.mean():7.2f} (theory d/6 = {d/6:7.2f})   "
          f"std/mean {sq.std()/sq.mean():.3f} (theory {np.sqrt(7/(5*d)):.3f})")

# part 2: from one query row, how much nearer is the nearest row than the farthest?
def contrast(X, name):
    dist = np.linalg.norm(X[1:] - X[0], axis=1)                  # row 0 is the query
    print(f"{name:27s} farthest/nearest = {dist.max()/dist.min():5.2f}")
for d in (2, 30, 1000):
    contrast(rng.random((569, d)), f"uniform noise, d={d}")
Xs = StandardScaler().fit_transform(load_breast_cancer().data)
contrast(Xs, "real tumours, d=30")
contrast(np.hstack([Xs, rng.normal(size=(569, 1000))]), "tumours + 1000 noise columns")</div>
  <div class="fx" data-lang="text">d=   1: mean sq dist    0.17 (theory d/6 =    0.17)   std/mean 1.184 (theory 1.183)
d=  30: mean sq dist    5.00 (theory d/6 =    5.00)   std/mean 0.215 (theory 0.216)
d=1000: mean sq dist  166.63 (theory d/6 =  166.67)   std/mean 0.037 (theory 0.037)
uniform noise, d=2          farthest/nearest = 12.65
uniform noise, d=30         farthest/nearest =  2.03
uniform noise, d=1000       farthest/nearest =  1.10
real tumours, d=30          farthest/nearest =  3.89
tumours + 1000 noise columns farthest/nearest =  1.15</div>
  <p>The simulation agrees with the formulas to two or three decimals. For uniform noise the farthest point is 12.65 times farther than the nearest in 2-D, only 2.03 times in 30-D, and 1.10 times in 1,000-D, so "nearest" means very little. Now look at the real tumours. They are also 30-dimensional, yet they keep a healthy contrast of <strong>3.89</strong>, almost twice that of uniform 30-D noise. Append 1,000 columns of random noise to the very same tumours and the contrast collapses to 1.15.</p>
  <p>Why did the real tumours resist? Because their 30 columns are not independent. Radius, perimeter and area are three ways of measuring the same size, and the "mean" and "worst" versions of each measurement move together. The tumours actually lie close to a thin, low-dimensional surface inside the 30-dimensional space, the way a sheet of paper is a two-dimensional object even when it is floating in a three-dimensional room. Such a surface is called a <strong>manifold</strong>. The number of columns is the <strong>ambient dimension</strong>; the number of independent directions the data really varies in is its <strong>intrinsic dimension</strong>. The gap between the two is exactly what dimensionality reduction exploits, and it is why the curse is a warning rather than a death sentence. Pure noise columns have no such structure, which is why they do so much damage.</p>

  <h2 id="dr-models"><span class="num">03</span>What the Curse Does to Models</h2>
  <p>Ratios of distances are geometry. What we really care about is whether a model gets worse. The experiment below keeps the 30 real tumour measurements and appends more and more columns of pure random noise, then measures 5-fold cross-validated accuracy for two very different models. The first is 5-nearest-neighbours, which classifies a tumour by a vote of the 5 closest training tumours, so it depends entirely on distances. The second is a random forest, a collection of decision trees, each of which picks the single most useful column at every split.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)          # 569 tumours, 30 real measurements
rng = np.random.default_rng(0)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
print("extra noise cols | 5-NN acc | forest acc")
for extra in (0, 30, 300, 1000):
    Xn = np.hstack([X, rng.normal(size=(len(X), extra))])     # add useless random columns
    knn = make_pipeline(StandardScaler(), KNeighborsClassifier(5))
    rf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=1)
    print(f"{extra:16d} | {cross_val_score(knn, Xn, y, cv=cv).mean():8.3f} | "
          f"{cross_val_score(rf, Xn, y, cv=cv).mean():10.3f}")
print("always guess 'benign':", round(y.mean(), 3))</div>
  <div class="fx" data-lang="text">extra noise cols | 5-NN acc | forest acc
               0 |    0.965 |      0.965
              30 |    0.940 |      0.953
             300 |    0.872 |      0.954
            1000 |    0.830 |      0.949
always guess 'benign': 0.627</div>
  <p>With the 30 real columns both models score 0.965. kNN then falls steadily: 0.940 with 30 noise columns, 0.872 with 300, 0.830 with 1,000, heading towards 0.627, which is what you get by always guessing "benign". The reason is in the distance formula itself. Distance is a sum over all columns, and the 30 useful terms are drowned by 1,000 useless ones, so the "nearest" tumours are nearest by accident. The forest barely moves (0.965 → 0.949), because at each split it chooses the one column that best separates the classes, and the real columns still win most of those contests.</p>
  <p>The same reasoning predicts how other models behave. Anything built on distances over all columns, such as kNN, k-means, DBSCAN and support vector machines with an RBF kernel, suffers badly. Linear and logistic regression have one weight per column; when the number of columns approaches the number of rows they can fit the training data perfectly, memorising noise, which is overfitting. Trees and boosting suffer least, though they still train more slowly and occasionally split on a noise column that happened to look useful.</p>
  <p>The experiment also gives us the vocabulary for the rest of the page. A column is <strong>relevant</strong> if it carries information about the label, like radius. It is <strong>redundant</strong> if its information is already carried by columns we keep, like perimeter once radius is kept. It is <strong>irrelevant</strong> if it carries no information at all, like smooth, scanner or the 1,000 noise columns. Every reduction method on this page tries to remove the redundant and irrelevant columns while keeping the relevant ones.</p>

  <h2 id="dr-selext"><span class="num">04</span>Selection vs Extraction</h2>
  <p>"Use fewer columns" can mean two quite different things, and interviewers like to check that you know the difference. <strong>Feature selection</strong> keeps some of the original columns and throws the rest away: "keep radius and texture". <strong>Feature extraction</strong> builds a few brand-new columns, each calculated from all the old ones: "new column 1 = 0.71 × radius + 0.70 × perimeter". A cricket selector choosing 11 players from a squad of 30 is doing selection: every chosen player is a real person you can name. A batting index that combines average, strike rate and consistency into one number is doing extraction: it carries more information per number, but "the index" is not a player.</p>
  <p>Each approach has its own strengths. Selection keeps the original names, so the model stays explainable ("the prediction is driven by radius and texture"), and the hospital can stop measuring the dropped columns, which saves money. Extraction can merge many weak, overlapping columns into a few strong ones, which selection cannot do: selection must either keep both radius and perimeter or drop one of them. But extracted columns have no natural meaning, and every original column is still needed at prediction time, because each new column is computed from all of them.</p>
  <table class="tbl">
    <tr><th></th><th>Feature selection</th><th>Feature extraction</th></tr>
    <tr><td>Output</td><td>a subset of the original columns</td><td>new columns built from all originals</td></tr>
    <tr><td>Interpretable</td><td>yes, names survive</td><td>no, "PC1" has no business meaning</td></tr>
    <tr><td>Saves measuring</td><td>yes</td><td>no</td></tr>
    <tr><td>Merges overlapping columns</td><td>no</td><td>yes</td></tr>
    <tr><td>Uses the label</td><td>usually</td><td>usually not (LDA is the exception)</td></tr>
    <tr><td>Examples</td><td>variance threshold, χ², RFE, Lasso</td><td>PCA, LDA, t-SNE, UMAP, autoencoders</td></tr>
  </table>
  <p>This page covers selection; extraction is the subject of <a class="xref" data-note="ml_pca">PCA</a> and then <a class="xref" data-note="ml_tsne">t-SNE</a> and <a class="xref" data-note="ml_umap">UMAP</a>. Selection methods come in three families, which differ in how much they involve the model. <strong>Filter methods</strong> score each column with a quick statistic and never train a model. <strong>Wrapper methods</strong> try different sets of columns, train the model on each set and keep the set that scores best. <strong>Embedded methods</strong> let the model choose its columns as part of training itself. The next four sections take them in that order.</p>

  <h2 id="dr-filter"><span class="num">05</span>Filters: Variance and Correlation</h2>
  <p>The cheapest possible test asks whether a column ever changes. A column that has the same value for every tumour cannot help tell tumours apart, no matter how clever the model is. The measure of "how much a column changes" is its <strong>variance</strong>, the average squared distance of the values from their mean. For a yes/no column in which a share p of the rows are 1, the variance works out to p(1 − p). By hand on our ten tumours: <code>scanner</code> is always 1, so its variance is 0. <code>rare_flag</code> has p = 1/10, so 0.1 × 0.9 = 0.09. <code>big</code> has p = 4/10, so 0.4 × 0.6 = 0.24. For radius the mean is 14, the deviations are −4, −3, −2, −1, 0, −1, 1, 2, 3, 5, their squares add up to 70, and 70/10 = 7.</p>
  <p>A <strong>variance threshold</strong> drops every column whose variance is below some cut-off. A common rule removes yes/no columns that are more than 80% one value, which means a threshold of 0.8 × 0.2 = 0.16. scikit-learn's <code>VarianceThreshold</code> does exactly this:</p>
  <div class="fx" data-lang="py">from sklearn.feature_selection import VarianceThreshold
from tumours import mini
X = mini.drop(columns="malignant")
print(X.var(ddof=0).round(2).to_string())                  # population variance, as sklearn uses
vt = VarianceThreshold(threshold=0.8 * (1 - 0.8)).fit(X)  # drop binary columns more than 80% one value
print("dropped:", list(X.columns[~vt.get_support()]))</div>
  <div class="fx" data-lang="text">radius         7.00
perimeter    284.96
texture       10.69
smooth         2.00
scanner        0.00
rare_flag      0.09
big            0.24
dropped: ['scanner', 'rare_flag']</div>
  <p>The hand values all appear (7.00, 0.00, 0.09, 0.24), and the threshold drops <code>scanner</code> and <code>rare_flag</code>. <code>get_support()</code> returns a True/False mask of the kept columns. This filter never looks at the label, so it is safe to use at any point and makes a good first clean-up step. Two warnings, though. Variance depends on units: perimeter's variance is 284.96 and radius's is 7.00 only because perimeter is about 6.3 times larger in millimetres, so variances should only be compared between columns on the same scale. And a rare column is not always useless; "had a previous biopsy" might be 1 for only 2% of patients and still be very predictive. Use the threshold to remove constants and junk, not as a test of usefulness.</p>
  <p>Variance says a column changes, but not that the change has anything to do with the label. Smoothness changes (variance 2) and is completely unrelated to malignancy. The next test, <strong>correlation</strong>, asks whether a column moves together with the label. Pearson's correlation r measures how well two columns line up along a straight line, from −1 (perfectly opposite) through 0 (no straight-line relation) to +1 (perfectly together). Its formula is r = Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² · Σ(y − ȳ)²), where x̄ and ȳ are the means. Think of it as "on average, when x is above its mean, is y above its mean too?". By hand for radius against the 0/1 label, with means 14 and 0.5:</p>
  <table class="tbl">
    <tr><th>tumour</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>sum</th></tr>
    <tr><td>x − 14</td><td>−4</td><td>−3</td><td>−2</td><td>−1</td><td>0</td><td>−1</td><td>1</td><td>2</td><td>3</td><td>5</td><td></td></tr>
    <tr><td>y − 0.5</td><td>−.5</td><td>−.5</td><td>−.5</td><td>−.5</td><td>−.5</td><td>.5</td><td>.5</td><td>.5</td><td>.5</td><td>.5</td><td></td></tr>
    <tr><td>product</td><td>2</td><td>1.5</td><td>1</td><td>.5</td><td>0</td><td>−.5</td><td>.5</td><td>1</td><td>1.5</td><td>2.5</td><td><b>10</b></td></tr>
  </table>
  <p>The products add to 10. The squared deviations of radius add to 70 (from the variance calculation) and those of the label to 10 × 0.25 = 2.5. So r = 10 / √(70 × 2.5) = 10 / 13.23 = <strong>0.756</strong>. pandas computes all pairs at once:</p>
  <div class="fx" data-lang="py">from tumours import mini
C = mini[["radius", "perimeter", "texture", "smooth", "malignant"]].corr()
print(C.round(3))</div>
  <div class="fx" data-lang="text">           radius  perimeter  texture  smooth  malignant
radius      1.000      0.999    0.751  -0.027      0.756
perimeter   0.999      1.000    0.753  -0.029      0.770
texture     0.751      0.753    1.000   0.151      0.642
smooth     -0.027     -0.029    0.151   1.000      0.000
malignant   0.756      0.770    0.642   0.000      1.000</div>
  <p>Correlation is used in two ways here. Down the <code>malignant</code> column it measures <strong>relevance</strong>: perimeter 0.770, radius 0.756 (our hand value), texture 0.642 and smooth exactly 0.000. Between the features it measures <strong>redundancy</strong>: radius and perimeter correlate at <strong>0.999</strong>, so keeping both adds almost nothing, and a common rule is to keep only one of any pair above about 0.9. Pearson correlation has one big blind spot: it only sees straight lines. A lab value where both too low and too high are dangerous has a U-shaped relationship with risk, and its correlation can be close to zero even though it is very predictive. The statistical tests in the next section handle other shapes and other kinds of column.</p>

  <h2 id="dr-stats"><span class="num">06</span>Filters: χ², ANOVA F and Mutual Information</h2>
  <p>Correlation needs numbers on both sides. Many features are categories instead: "is the tumour big?", "which hospital?", "does the email contain the word 'free'?". For a category against a category label we count. The <strong>χ² (chi-square) test</strong> asks whether the counts in a table look different from what we would expect if the two things were unrelated. Here is <code>big</code> against <code>malignant</code> for our ten tumours:</p>
  <table class="tbl">
    <tr><th>observed</th><th>benign</th><th>malignant</th><th>row total</th></tr>
    <tr><td>big = 0</td><td>5</td><td>1</td><td>6</td></tr>
    <tr><td>big = 1</td><td>0</td><td>4</td><td>4</td></tr>
    <tr><td>column total</td><td>5</td><td>5</td><td>10</td></tr>
  </table>
  <p>If "big" and "malignant" were unrelated, the 6 small tumours would split between benign and malignant in the same 5 : 5 proportion as everyone else, giving 3 and 3, and the 4 big ones would split 2 and 2. In general the <strong>expected count</strong> of a cell is row total × column total / n. The χ² statistic adds up how far each observed count O is from its expected count E, squared and scaled by E: χ² = Σ (O − E)²/E = (5 − 3)²/3 + (1 − 3)²/3 + (0 − 2)²/2 + (4 − 2)²/2 = 1.333 + 1.333 + 2 + 2 = <strong>6.667</strong>. A bigger χ² means the table is further from independence, so the feature is more related to the label. scipy confirms the hand calculation:</p>
  <div class="fx" data-lang="py">import pandas as pd
from scipy.stats import chi2_contingency
from sklearn.feature_selection import chi2
from tumours import mini
table = pd.crosstab(mini.big, mini.malignant)          # rows: big 0/1, columns: malignant 0/1
print(table)
stat, p, dof, expected = chi2_contingency(table, correction=False)
print("expected counts:", expected.tolist())
print(f"textbook chi2 = {stat:.3f}, dof = {dof}, p = {p:.4f}")
s, pv = chi2(mini[["big"]], mini.malignant)
print(f"sklearn chi2  = {s[0]:.3f}, p = {pv[0]:.4f}")</div>
  <div class="fx" data-lang="text">malignant  0  1
big            
0          5  1
1          0  4
expected counts: [[3.0, 3.0], [2.0, 2.0]]
textbook chi2 = 6.667, dof = 1, p = 0.0098
sklearn chi2  = 4.000, p = 0.0455</div>
  <p>scipy reproduces the expected counts (3, 3, 2, 2) and χ² = 6.667, with a p-value of 0.0098, meaning a table this lopsided would be very unlikely if size and malignancy were unrelated. scikit-learn's <code>chi2</code> function gives 4.000 instead. That is not a bug: it treats each feature as a count (like the number of times a word appears) and uses only the "feature present" row, (0 − 2)²/2 + (4 − 2)²/2 = 4. It ranks count features well, which is what <code>SelectKBest(chi2)</code> uses it for, but it requires non-negative values and will not match a textbook χ² test.</p>
  <p>For a numeric feature against a class label, the natural question is whether the class averages are far apart compared with the spread inside each class. That is the <strong>ANOVA F-test</strong> (analysis of variance). Imagine two groups of students who took the same exam. If the group averages differ by 10 marks but marks inside each group vary by 30, the difference could easily be luck; if marks inside each group vary by only 2, the difference is clearly real. F is the ratio of "between-group spread" to "within-group spread". For radius, the benign values are 10, 11, 12, 13, 14 (mean 12), the malignant values are 13, 15, 16, 17, 19 (mean 16), and the overall mean is 14.</p>
  <table class="tbl">
    <tr><th>part</th><th>calculation</th><th>sum of squares</th><th>degrees of freedom</th><th>mean square</th></tr>
    <tr><td>between classes</td><td>5·(12 − 14)² + 5·(16 − 14)²</td><td>40</td><td>2 classes − 1 = 1</td><td>40</td></tr>
    <tr><td>within classes</td><td>benign: 4+1+0+1+4; malignant: 9+1+0+1+9</td><td>10 + 20 = 30</td><td>10 rows − 2 = 8</td><td>3.75</td></tr>
  </table>
  <p>F = 40 / 3.75 = <strong>10.67</strong>. For smooth, both class means are 10, so the between part is 0 and F = 0. <code>f_classif</code>, the default scorer of <code>SelectKBest</code>, agrees:</p>
  <div class="fx" data-lang="py">from sklearn.feature_selection import f_classif
from tumours import mini
cols = ["radius", "texture", "smooth"]
F, p = f_classif(mini[cols], mini.malignant)
for name, f, pv in zip(cols, F, p):
    print(f"{name:8s} F = {f:6.3f}  p = {pv:.4f}")</div>
  <div class="fx" data-lang="text">radius   F = 10.667  p = 0.0114
texture  F =  5.618  p = 0.0452
smooth   F =  0.000  p = 1.0000</div>
  <p>Texture lands in between at 5.618. For a numeric target (regression) the matching function is <code>f_regression</code>. With two classes, F and r carry the same information (F = (n − 2)·r²/(1 − r²) = 8 × 0.571/0.429 = 10.67), so they rank columns identically; both only notice differences in averages or straight-line trends.</p>
  <p>All the scores so far look for one particular shape of relationship. <strong>Mutual information</strong> (MI) asks the most general question: how much does knowing the feature reduce my uncertainty about the label? It is zero only when the two are completely independent and positive for any kind of relationship, straight or curved. Its formula is MI = Σ p(x, y) · log [ p(x, y) / (p(x) · p(y)) ]. Each term compares how often a pair of values actually occurs, p(x, y), with how often it would occur if the two were independent, p(x)·p(y). By hand for big against malignant, with log base 2 so the answer is in bits:</p>
  <table class="tbl">
    <tr><th>cell</th><th>p(x, y)</th><th>p(x)·p(y)</th><th>ratio</th><th>p · log₂(ratio)</th></tr>
    <tr><td>big=0, benign</td><td>0.5</td><td>0.6 × 0.5 = 0.3</td><td>1.667</td><td>0.368</td></tr>
    <tr><td>big=0, malignant</td><td>0.1</td><td>0.3</td><td>0.333</td><td>−0.158</td></tr>
    <tr><td>big=1, benign</td><td>0</td><td>0.4 × 0.5 = 0.2</td><td>0</td><td>0 (by convention)</td></tr>
    <tr><td>big=1, malignant</td><td>0.4</td><td>0.2</td><td>2</td><td>0.400</td></tr>
    <tr><td colspan="4"><b>total</b></td><td><b>0.610 bits</b></td></tr>
  </table>
  <p>The label has 1 bit of uncertainty (a 50/50 split), so knowing "big" removes 61% of it. This is the same quantity that a decision tree calls information gain (see <a class="xref" data-note="ml_dtree">Decision Trees</a>). The code checks the hand value, then shows why MI matters, using that U-shaped lab value:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
from tumours import mini
mi = mutual_info_classif(mini[["big"]], mini.malignant, discrete_features=True)[0]
print(f"MI(big; malignant) = {mi:.4f} nats = {mi / np.log(2):.4f} bits")

# a lab value where BOTH too low and too high are risky: a U-shape
rng = np.random.default_rng(0)
x = rng.uniform(-3, 3, 500)                              # lab value, centred on "normal"
risk = x ** 2 + rng.normal(0, 0.5, 500)                  # U-shaped risk
noise = rng.uniform(-3, 3, 500)                          # an unrelated column
print("corr(x, risk) =", round(np.corrcoef(x, risk)[0, 1], 3),
      "  corr(noise, risk) =", round(np.corrcoef(noise, risk)[0, 1], 3))
m = mutual_info_regression(np.c_[x, noise], risk, random_state=0)
print("MI(x, risk)   =", round(m[0], 3), "  MI(noise, risk)   =", round(m[1], 3))</div>
  <div class="fx" data-lang="text">MI(big; malignant) = 0.4228 nats = 0.6100 bits
corr(x, risk) = 0.08   corr(noise, risk) = 0.015
MI(x, risk)   = 1.541   MI(noise, risk)   = 0.02</div>
  <p>scikit-learn reports MI in nats (natural log), and 0.4228 nats is exactly 0.6100 bits. In the second part, the lab value <code>x</code> determines risk almost perfectly through a U-shape, yet its Pearson correlation is 0.08, barely more than an unrelated column's 0.015. Mutual information sees it clearly: 1.541 against 0.02. For continuous columns scikit-learn estimates MI from nearest-neighbour distances, so it is somewhat noisy on small data and depends on <code>random_state</code>.</p>
  <p>Choosing among the filters is mostly about column types. For a categorical or count feature with a class label, use <code>chi2</code> or <code>mutual_info_classif</code>; for a numeric feature with a class label, <code>f_classif</code> or <code>mutual_info_classif</code>; for a numeric target, <code>f_regression</code> or <code>mutual_info_regression</code>. Wrap any of them in <code>SelectKBest(score_func, k=...)</code> to keep the k best columns, or <code>SelectPercentile</code> to keep a top percentage. All filters share one serious weakness: they judge each column <strong>alone</strong>. Every filter above ranks radius and perimeter near the top, even though keeping both adds almost nothing. And two columns that are useless alone but decisive together (an "exclusive or" pattern) both score zero and get dropped. To see redundancy and teamwork, we have to ask the model.</p>

  <h2 id="dr-wrapper"><span class="num">07</span>Wrapper Methods</h2>
  <p>A <strong>wrapper method</strong> chooses columns by training the actual model on different sets of columns and comparing their cross-validated scores; the model is "wrapped" inside the search. This directly answers the question filters cannot: which <em>combination</em> of columns works best together? The obvious approach, trying every possible subset, is impossible: d columns have 2^d subsets, about a billion for our 30. So wrappers search greedily, one column at a time. Think of picking a cricket team by trials. <strong>Forward selection</strong> starts with nobody and repeatedly adds whichever player improves the team's trial result the most. <strong>Backward elimination</strong> starts with the whole squad and repeatedly drops the player whose absence hurts least.</p>
  <p>Here is forward selection on all 569 tumours, with a scaled logistic regression as the model and 5-fold cross-validated accuracy as the score. The loop prints the top three candidates at each step, and then scikit-learn's <code>SequentialFeatureSelector</code> does the same job:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.feature_selection import SequentialFeatureSelector

data = load_breast_cancer()
X, y, names = data.data, data.target, [str(n) for n in data.feature_names]
cv = StratifiedKFold(5, shuffle=True, random_state=0)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))
score = lambda cols: cross_val_score(model, X[:, cols], y, cv=cv).mean()

chosen = []
for step in range(1, 4):                     # forward selection by hand, 3 steps
    cands = {n: score(chosen + [i]) for i, n in enumerate(names) if i not in chosen}
    top = sorted(cands.items(), key=lambda kv: -kv[1])[:3]
    print(f"step {step}: " + " | ".join(f"{n} {s:.3f}" for n, s in top))
    chosen.append(names.index(top[0][0]))

sfs = SequentialFeatureSelector(model, n_features_to_select=3, direction="forward", cv=cv).fit(X, y)
print("sklearn picks:", list(sfs.get_feature_names_out(names)))
print(f"all 30 columns: {score(list(range(30))):.3f} | chosen 3: {score(chosen):.3f}")</div>
  <div class="fx" data-lang="text">step 1: worst perimeter 0.917 | worst area 0.917 | worst radius 0.916
step 2: worst smoothness 0.958 | worst texture 0.947 | worst concave points 0.940
step 3: mean texture 0.970 | worst texture 0.970 | worst area 0.961
sklearn picks: ['mean texture', 'worst perimeter', 'worst smoothness']
all 30 columns: 0.979 | chosen 3: 0.970</div>
  <p>Step 1 tries each of the 30 columns alone. The top three are "worst perimeter", "worst area" and "worst radius", all at about 0.917: three versions of the same size measurement. Step 2 is where wrappers earn their keep. It tries worst perimeter plus each remaining column, and the winner is <em>not</em> worst area or worst radius, which would repeat the size information, but <strong>worst smoothness</strong> (0.958), which adds something new. A filter could never make that choice. Step 3 adds mean texture (0.970). Three columns reach 0.970 against 0.979 for all thirty, and scikit-learn picks the same three. The cost is the catch: 30 + 29 + 28 = 87 candidate sets, each fitted 5 times, is 435 model fits. In general forward selection of k columns from d needs about d + (d − 1) + … + (d − k + 1) sets, far fewer than 2^d but still many. Backward elimination (<code>direction="backward"</code>) can find a different set and costs more when you want only a few columns.</p>
  <p><strong>Recursive Feature Elimination (RFE)</strong> makes backward elimination cheaper by letting the model rank the columns itself. It trains once, looks at how much the model relies on each column (the size of each coefficient on standardised data, or a tree's importance score), drops the weakest column, retrains on the rest and repeats. That is one fit per step instead of one fit per candidate. On our ten tumours with four numeric columns:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFE
from tumours import mini

names = ["radius", "perimeter", "texture", "smooth"]
X = StandardScaler().fit_transform(mini[names]); y = mini.malignant
left = list(range(4))
while len(left) &gt; 1:                          # RFE by hand: drop the smallest |coef|
    coef = LogisticRegression().fit(X[:, left], y).coef_[0]
    worst = left[int(np.argmin(np.abs(coef)))]
    print("  ".join(f"{names[i]}={c:+.2f}" for i, c in zip(left, coef)), f"  -&gt; drop {names[worst]}")
    left.remove(worst)
rfe = RFE(LogisticRegression(), n_features_to_select=1).fit(X, y)
print("sklearn ranking_ (1 = kept):", dict(zip(names, rfe.ranking_.tolist())))</div>
  <div class="fx" data-lang="text">radius=+0.72  perimeter=+0.80  texture=+0.64  smooth=-0.22   -&gt; drop smooth
radius=+0.72  perimeter=+0.79  texture=+0.57   -&gt; drop texture
radius=+0.82  perimeter=+0.89   -&gt; drop radius
sklearn ranking_ (1 = kept): {'radius': 2, 'perimeter': 1, 'texture': 3, 'smooth': 4}</div>
  <p>Round 1: smooth has the smallest coefficient in absolute size (0.22), so it goes. Round 2: texture (0.57) goes. Round 3 is the interesting one: radius (0.82) and perimeter (0.89) are twins, and perimeter wins by a hair. scikit-learn's <code>ranking_</code> records the same order (4 = dropped first, 1 = kept). Notice that RFE kept both twins until the very end. Because they carry the same information, the model shares the credit between them, so neither looks weak. With strongly correlated columns, coefficients can even become inflated and opposite in sign, which misleads any ranking based on coefficient size.</p>
  <p>RFE needs to be told how many columns to keep. <code>RFECV</code> answers that by running RFE inside cross-validation and recording the score for every possible number of columns:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFECV
from sklearn.model_selection import StratifiedKFold

X, y = load_breast_cancer(return_X_y=True)
Xs = StandardScaler().fit_transform(X)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
rfecv = RFECV(LogisticRegression(max_iter=5000), cv=cv, n_jobs=1).fit(Xs, y)
scores = rfecv.cv_results_["mean_test_score"]
print("best number of columns:", rfecv.n_features_)
for k in (1, 2, 5, 10, 15, 20, 30):
    print(f"  {k:2d} columns -&gt; cv acc {scores[k - 1]:.3f}")</div>
  <div class="fx" data-lang="text">best number of columns: 26
   1 columns -&gt; cv acc 0.916
   2 columns -&gt; cv acc 0.954
   5 columns -&gt; cv acc 0.960
  10 columns -&gt; cv acc 0.968
  15 columns -&gt; cv acc 0.977
  20 columns -&gt; cv acc 0.979
  30 columns -&gt; cv acc 0.979</div>
  <p>One column gives 0.916, two give 0.954, and the curve is essentially flat from about 15 columns (0.977) to 30 (0.979). RFECV picks the maximum, 26, but a sensible engineer would choose about 15: within 0.002 of the best with half the measurements. That habit of choosing the simplest option that is "within noise" of the best is often called the one-standard-error rule. Wrappers have one more danger: searching through hundreds of subsets on a small dataset can find a set that scores well by luck. Report the final score on data the search never saw, or wrap the whole search inside an outer cross-validation (see <a class="xref" data-note="ml_splits">Train/Test Splits &amp; Cross-Validation</a>).</p>

  <h2 id="dr-embedded"><span class="num">08</span>Embedded Methods</h2>
  <p>Forward selection needed 435 fits to choose three columns. An <strong>embedded method</strong> does the selection inside a single training run, because the model's own training rule switches weak columns off. The best-known example is the L1 penalty used by Lasso and by L1-regularised logistic regression. The model minimises its usual loss plus α × Σ|wⱼ|, the sum of the absolute sizes of its coefficients wⱼ. The absolute value has a sharp corner at zero, and for a weak or redundant column the cheapest place to sit is exactly on that corner, so its coefficient becomes <em>exactly</em> 0 and the column is dropped. (Why the corner produces exact zeros, while the squared L2 penalty only shrinks, is explained step by step in <a class="xref" data-note="ml_regularization">Regularization</a> and <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>.) Think of a strict budget: every rupee spent on a coefficient costs a penalty, so columns that only repeat what another column already says get no budget at all.</p>
  <p>In scikit-learn's logistic regression you ask for a pure L1 penalty with <code>l1_ratio=1.0</code> (the older <code>penalty="l1"</code> is deprecated), and the strength is set by C = 1/α, so a <em>small</em> C means a <em>strong</em> penalty and more zeros:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.pipeline import make_pipeline
from tumours import mini

# the 10 teaching tumours: what does L1 do with the radius/perimeter twins?
num = ["radius", "perimeter", "texture", "smooth"]
l1 = LogisticRegression(l1_ratio=1.0, C=1.0, solver="liblinear")
coef = l1.fit(StandardScaler().fit_transform(mini[num]), mini.malignant).coef_[0]
print("10 tumours:", dict(zip(num, coef.round(2).tolist())))

# all 569 tumours: smaller C = stronger penalty = more zeros
data = load_breast_cancer()
X, y, names = data.data, data.target, data.feature_names
cv = StratifiedKFold(5, shuffle=True, random_state=0)
for C in (0.01, 0.03, 0.1, 1.0):
    pipe = make_pipeline(StandardScaler(), LogisticRegression(l1_ratio=1.0, C=C, solver="liblinear"))
    nz = np.flatnonzero(pipe.fit(X, y)[-1].coef_[0])
    acc = cross_val_score(pipe, X, y, cv=cv).mean()
    kept = ", ".join(names[nz]) if len(nz) &lt;= 4 else f"{len(nz)} columns"
    print(f"C={C:&lt;5} non-zero={len(nz):2d}  cv acc={acc:.3f}  kept: {kept}")</div>
  <div class="fx" data-lang="text">10 tumours: {'radius': 0.0, 'perimeter': 1.48, 'texture': 0.15, 'smooth': 0.0}
C=0.01  non-zero= 4  cv acc=0.933  kept: mean concave points, worst radius, worst perimeter, worst concave points
C=0.03  non-zero= 4  cv acc=0.954  kept: mean concave points, worst radius, worst texture, worst concave points
C=0.1   non-zero= 8  cv acc=0.974  kept: 8 columns
C=1.0   non-zero=16  cv acc=0.977  kept: 16 columns</div>
  <p>On the ten tumours, L1 keeps perimeter (1.48) and a little texture (0.15), and sets both smooth and radius to exactly 0.00. Smooth is irrelevant; radius is redundant, because its twin perimeter already carries the same information. On all 569 tumours, C = 0.01 keeps only 4 columns and scores 0.933; C = 0.1 keeps 8 and reaches 0.974, nearly the 0.979 of all 30. Compare the two 4-column rows: C = 0.01 keeps worst perimeter, while C = 0.03 swaps it for worst texture. Which member of a correlated group survives is fragile, and it is a mistake to read an L1 zero as "this column is unrelated to the label". It only means "not needed given the others". When stable choices matter, Elastic Net (which mixes L1 and L2) or stability selection (repeat L1 on many bootstrap samples and keep columns chosen most often) behave better.</p>
  <p>Tree ensembles provide a second embedded route, because they rank columns as a side effect of training. <strong>MDI</strong> (mean decrease in impurity) adds up how much each column's splits improved the purity of the tree nodes during training. <strong>Permutation importance</strong> instead shuffles one column on held-out data and measures how much the score drops; a column the model truly relies on causes a big drop. Both are explained in depth in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>. <code>SelectFromModel</code> turns any fitted model with coefficients or importances into a selector:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

data = load_breast_cancer()
X, y, names = data.data, data.target, data.feature_names
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
rf = RandomForestClassifier(n_estimators=200, random_state=0, n_jobs=1).fit(Xtr, ytr)
top = np.argsort(rf.feature_importances_)[::-1][:4]
print("top-4 MDI (train):", [f"{names[i]} {rf.feature_importances_[i]:.3f}" for i in top])
pi = permutation_importance(rf, Xte, yte, n_repeats=10, random_state=0, n_jobs=1)
top = np.argsort(pi.importances_mean)[::-1][:4]
print("top-4 permutation (test):", [f"{names[i]} {pi.importances_mean[i]:.3f}" for i in top])
sfm = SelectFromModel(rf, threshold="median", prefit=True)
rf2 = RandomForestClassifier(n_estimators=200, random_state=0, n_jobs=1).fit(sfm.transform(Xtr), ytr)
print(f"test acc: all 30 = {rf.score(Xte, yte):.3f} | top {sfm.get_support().sum()} by MDI = "
      f"{rf2.score(sfm.transform(Xte), yte):.3f}")</div>
  <div class="fx" data-lang="text">top-4 MDI (train): ['worst radius 0.133', 'worst perimeter 0.132', 'worst concave points 0.128', 'worst area 0.108']
top-4 permutation (test): ['worst radius 0.021', 'worst area 0.019', 'worst texture 0.016', 'worst perimeter 0.012']
test acc: all 30 = 0.953 | top 15 by MDI = 0.953</div>
  <p>Both methods put the "worst" size and concavity measurements on top. MDI splits the credit between the size twins (worst radius 0.133, worst perimeter 0.132, worst area 0.108), and the permutation importances are small (0.021 at most) because when one twin is shuffled the forest simply uses another: the radius-perimeter story again. Keeping only the top half of columns by MDI (<code>threshold="median"</code>) gives the same test accuracy, 0.953, with 15 columns instead of 30. MDI is computed on training data and is known to favour columns with many distinct values, so for decisions that matter prefer permutation importance on held-out data.</p>

  <h2 id="dr-leak"><span class="num">09</span>Selecting Without Leakage</h2>
  <p>Every method since correlation used the labels to choose columns. Choosing columns is therefore a form of learning, and that has a consequence that catches out many experienced people. If you choose the columns using all the rows and then cross-validate, the rows in each test fold have already helped decide which columns to use, so the test is no longer honest. This mistake is called <strong>selection leakage</strong>.</p>
  <p>To see how bad it can get, imagine the hospital adds 2,000 gene-expression columns measured on just 60 tumours, and suppose, so that we know the truth, that every gene is pure random noise. No model can genuinely beat 50% accuracy on such data.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score, StratifiedKFold

rng = np.random.default_rng(0)
X = rng.normal(size=(60, 2000))              # 60 tumours x 2000 "gene" columns of PURE NOISE
y = np.array([0, 1] * 30)                    # malignant or not: unrelated to X
cv = StratifiedKFold(5, shuffle=True, random_state=0)

# WRONG: pick the 20 "best" columns using ALL rows, then cross-validate
X20 = SelectKBest(f_classif, k=20).fit_transform(X, y)
wrong = cross_val_score(LogisticRegression(max_iter=1000), X20, y, cv=cv).mean()

# RIGHT: selection is a pipeline step, refitted inside each training fold
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=1000))
right = cross_val_score(pipe, X, y, cv=cv).mean()
print(f"select, then CV:   {wrong:.3f}")
print(f"select inside CV:  {right:.3f}")</div>
  <div class="fx" data-lang="text">select, then CV:   0.883
select inside CV:  0.383</div>
  <p>Selecting the 20 "best" genes from all 60 tumours and then cross-validating reports <strong>0.883</strong>, a model that looks like a breakthrough. Among 2,000 random columns, a few correlate with the labels <em>on these particular 60 rows</em> purely by chance, and the selection finds exactly those. When <code>SelectKBest</code> is put inside a pipeline instead, each fold selects genes using only its own training rows; those genes say nothing about the held-out rows, and the score falls to <strong>0.383</strong>, a coin flip (slightly below 0.5 is normal luck with 12-row folds). This example is famous from the textbook <em>The Elements of Statistical Learning</em> as "the wrong and the right way to do cross-validation".</p>
  <p>Think of a teacher who first sees which questions the class happened to get right in a mock test, then sets the real exam using only those questions, and proudly reports the class's score. The fix is simple and always the same: make the selector a step in a <code>Pipeline</code>, so that <code>cross_val_score</code> or <code>GridSearchCV</code> refits it inside every training fold (see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). The damage grows with the ratio of columns to rows. With 30 columns and 569 tumours the inflation is small; with 2,000 genes and 60 tumours it turns a useless model into a published result.</p>

  <h2 id="dr-compare"><span class="num">10</span>Comparing the Methods</h2>
  <p>We have met each family on its own. To compare them fairly, the benchmark below asks one representative of each family to cut the 569 tumours down to about five columns, adds PCA (the extraction method of the next note) for contrast, and runs everything inside the same pipeline and the same 5-fold cross-validation:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectKBest, f_classif, RFE, SelectFromModel
from sklearn.model_selection import cross_val_score, StratifiedKFold

X, y = load_breast_cancer(return_X_y=True)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
lr = lambda: LogisticRegression(max_iter=5000)
l1 = LogisticRegression(l1_ratio=1.0, C=0.05, solver="liblinear")
pipes = {
    "all 30 columns":        [lr()],
    "filter: ANOVA F, 5":    [SelectKBest(f_classif, k=5), lr()],
    "wrapper: RFE, 5":       [RFE(lr(), n_features_to_select=5), lr()],
    "embedded: L1 (C=0.05)": [SelectFromModel(l1), lr()],
    "extraction: PCA, 5":    [PCA(5), lr()],
}
for name, steps in pipes.items():
    pipe = make_pipeline(StandardScaler(), *steps)          # every step refitted inside each fold
    print(f"{name:22s} cv acc = {cross_val_score(pipe, X, y, cv=cv).mean():.3f}")</div>
  <div class="fx" data-lang="text">all 30 columns         cv acc = 0.979
filter: ANOVA F, 5     cv acc = 0.947
wrapper: RFE, 5        cv acc = 0.968
embedded: L1 (C=0.05)  cv acc = 0.961
extraction: PCA, 5     cv acc = 0.974</div>
  <p>All 30 columns score 0.979. The ANOVA filter's five columns score only 0.947, because the five individually best columns are mostly copies of the same size measurement. RFE's five, chosen with the model and therefore less redundant, reach 0.968. The L1 selector reaches 0.961. PCA with five components reaches 0.974, the best of the reduced versions, because each of its new columns blends all 30 measurements, so information spread thinly across many columns is not lost. Notice that no method beats all 30 columns. With a regularised model and a sensible number of columns, selection rarely raises raw accuracy; its real wins are cheaper data collection, faster training and serving, more stable models, and explanations in the hospital's own language.</p>
  <p>Putting it together, the choice depends on the situation. For very wide data such as text or genes, start with a filter: it is fast and model-free, and it can cut tens of thousands of columns down to a manageable number. When you have a moderate number of columns and the budget to train many models, a wrapper (sequential selection or RFECV) finds a good set for your particular model. When you want selection in a single training run, use L1 for linear models or importances for trees, remembering that both pick arbitrarily between correlated twins. And when the names do not matter and all inputs will be available at prediction time, extraction with PCA usually keeps more information than any subset of columns.</p>

  <h2 id="dr-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most damaging mistake is choosing columns on the full dataset and only then cross-validating. Section 09 showed it turning pure noise into 0.883 accuracy, when the honest answer was a coin flip. There is only one fix, and it is worth making a habit: every selector, like every scaler, goes inside the <code>Pipeline</code>, so it is refitted within each training fold.</p>
  <p>The second is comparing columns that are measured in different units. Variance, and the coefficients that RFE ranks, both depend on units. Here is RFE run on the ten tumours twice, once on raw millimetres and once after standardising:</p>
  <div class="fx" data-lang="py">from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from tumours import mini
names = ["radius", "perimeter", "texture", "smooth"]
X, y = mini[names], mini.malignant
raw = RFE(LogisticRegression(max_iter=1000), n_features_to_select=1).fit(X, y)
scaled = RFE(LogisticRegression(), n_features_to_select=1).fit(StandardScaler().fit_transform(X), y)
print("raw columns,    ranking:", dict(zip(names, raw.ranking_.tolist())))
print("scaled columns, ranking:", dict(zip(names, scaled.ranking_.tolist())))</div>
  <div class="fx" data-lang="text">raw columns,    ranking: {'radius': 4, 'perimeter': 3, 'texture': 1, 'smooth': 2}
scaled columns, ranking: {'radius': 2, 'perimeter': 1, 'texture': 3, 'smooth': 4}</div>
  <p>On raw columns RFE throws radius out first and even ranks the irrelevant <code>smooth</code> second, because a coefficient on a column measured in big numbers (perimeter, around 90) is naturally small, and one on a column in small numbers is naturally large. After standardising, the ranking matches what we know: perimeter and radius first, smooth last. Always standardise before comparing variances or coefficients.</p>
  <p>The third is using scikit-learn's <code>chi2</code> on standardised data. Standardised columns contain negative numbers, and <code>chi2</code> treats features as counts, so it refuses them:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.preprocessing import StandardScaler, MinMaxScaler
X, y = load_breast_cancer(return_X_y=True)
try:
    SelectKBest(chi2, k=5).fit(StandardScaler().fit_transform(X), y)   # scaled values can be negative
except ValueError as e:
    print("ValueError:", e)
sel = SelectKBest(chi2, k=5).fit(MinMaxScaler().fit_transform(X), y)  # 0..1 values are fine
print("kept", sel.get_support().sum(), "columns")</div>
  <div class="fx" data-lang="text">ValueError: Input X must be non-negative.
kept 5 columns</div>
  <p>Use <code>chi2</code> on counts, frequencies or 0–1 scaled values (<code>MinMaxScaler</code>), and use <code>f_classif</code> or mutual information on ordinary standardised numbers. Remember too that sklearn's <code>chi2</code> does not equal the textbook test (4.000 against 6.667 on our table).</p>
  <p>Three mistakes are about interpretation rather than code. Assuming the k individually best columns are the best k columns together ignores redundancy: the filter's top five scored 0.947 while RFE's five scored 0.968, because the filter picked several copies of "size". Reading an L1 zero as "unrelated to the label" is wrong: radius got 0.00 while correlating 0.756 with malignancy, because it was redundant with perimeter, not irrelevant. And trusting correlation to find every useful column misses curved relationships, as the U-shaped lab value showed (r = 0.08, mutual information 1.541). Finally, do not assume the curse always applies: the real tumours kept a healthy distance contrast in 30 dimensions because their columns are correlated. The real danger is a large number of irrelevant columns.</p>

  <h2 id="dr-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Dimension</b>: the number of columns d; each row is a point in d-dimensional space.</li>
    <li><b>Curse of dimensionality</b>: with fixed rows, more columns make data sparse, push volume to the edges, make neighbourhoods non-local and make all distances look alike.</li>
    <li><b>Intrinsic dimension</b>: how many directions the data really varies in (small when columns are correlated); <b>ambient dimension</b>: the number of columns.</li>
    <li><b>Relevant / redundant / irrelevant</b>: informative / already covered by kept columns / no information.</li>
    <li><b>Feature selection</b>: keep a subset of original columns. <b>Feature extraction</b>: build new columns from all of them.</li>
    <li><b>Filter / wrapper / embedded</b>: score columns without a model / search sets with the model's CV score / select during training.</li>
    <li><b>Selection leakage</b>: choosing columns with labels from rows later used for evaluation.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Formula</th><th>Tumour value</th></tr>
    <tr><td>boxes with 10 bins per column</td><td>10^d</td><td>10^30 for 30 columns</td></tr>
    <tr><td>share of cube near an edge</td><td>1 − 0.9^d</td><td>0.958 at d = 30</td></tr>
    <tr><td>side of a 10% neighbourhood</td><td>0.1^(1/d)</td><td>0.926 at d = 30</td></tr>
    <tr><td>squared distance, random pair</td><td>mean d/6, std/mean √(7/(5d))</td><td>0.216 at d = 30</td></tr>
    <tr><td>variance of a 0/1 column</td><td>p(1 − p)</td><td>rare_flag 0.09, big 0.24</td></tr>
    <tr><td>Pearson r</td><td>Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)² Σ(y−ȳ)²)</td><td>radius vs label 0.756</td></tr>
    <tr><td>χ²</td><td>Σ (O − E)²/E, E = row × col / n</td><td>big vs label 6.667</td></tr>
    <tr><td>ANOVA F</td><td>between mean square / within mean square</td><td>radius 10.67, smooth 0</td></tr>
    <tr><td>mutual information</td><td>Σ p(x,y) log [p(x,y) / (p(x)p(y))]</td><td>big vs label 0.610 bits</td></tr>
    <tr><td>forward selection cost</td><td>d + (d−1) + … + (d−k+1) sets</td><td>87 sets × 5 folds = 435 fits</td></tr>
    <tr><td>L1 objective</td><td>loss + α Σ|wⱼ|, C = 1/α</td><td>radius coefficient 0.00</td></tr>
  </table>
  <h3>Which method for which job</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Question it answers</th><th>Sees redundancy?</th><th>scikit-learn</th></tr>
    <tr><td>Variance threshold</td><td>does the column ever change?</td><td>no</td><td><code>VarianceThreshold</code></td></tr>
    <tr><td>Correlation</td><td>straight-line link to the label or another column?</td><td>pairwise only</td><td><code>df.corr()</code>, <code>r_regression</code></td></tr>
    <tr><td>χ²</td><td>do category counts differ from independence?</td><td>no</td><td><code>chi2</code></td></tr>
    <tr><td>ANOVA F</td><td>are class means far apart compared with the noise?</td><td>no</td><td><code>f_classif</code>, <code>f_regression</code></td></tr>
    <tr><td>Mutual information</td><td>any dependence at all, any shape?</td><td>no</td><td><code>mutual_info_classif</code></td></tr>
    <tr><td>Forward / backward</td><td>best set for this model?</td><td>yes</td><td><code>SequentialFeatureSelector</code></td></tr>
    <tr><td>RFE / RFECV</td><td>which column does the model lean on least?</td><td>partly</td><td><code>RFE</code>, <code>RFECV</code></td></tr>
    <tr><td>L1 / tree importance</td><td>what survives one penalised fit?</td><td>picks one twin</td><td><code>SelectFromModel</code></td></tr>
  </table>
  <h3>Numbers to remember</h3>
  <ul>
    <li>Farthest/nearest contrast: uniform 30-D 2.03, real tumours 3.89, tumours + 1,000 noise columns 1.15.</li>
    <li>5-NN with 0 / 1,000 noise columns: 0.965 / 0.830; forest 0.965 / 0.949.</li>
    <li>About five columns, logistic regression: filter 0.947, RFE 0.968, L1 0.961, PCA 0.974; all 30: 0.979.</li>
    <li>Leakage demo on pure noise: 0.883 wrong, 0.383 right.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.feature_selection import (VarianceThreshold, SelectKBest, f_classif, chi2,
    mutual_info_classif, SequentialFeatureSelector, RFE, RFECV, SelectFromModel)

VarianceThreshold(threshold=0.16)                       # drop near-constant columns
SelectKBest(f_classif, k=10)                            # filter: top 10 by a score
SequentialFeatureSelector(model, n_features_to_select=5, direction="forward", cv=5)
RFECV(LogisticRegression(max_iter=5000), cv=5)          # wrapper, CV picks the count
SelectFromModel(LogisticRegression(l1_ratio=1.0, C=0.1, solver="liblinear"))
SelectFromModel(RandomForestClassifier(), threshold="median")

pipe = make_pipeline(StandardScaler(), SelectKBest(f_classif, k=10), LogisticRegression())
selector.get_support(); selector.get_feature_names_out()</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Always select inside the CV loop (Pipeline).</li>
    <li>Filters judge columns alone: blind to redundancy and interactions.</li>
    <li>Correlation misses curves; mutual information does not.</li>
    <li>Standardise before comparing variances or coefficients.</li>
    <li>sklearn <code>chi2</code> ≠ textbook χ², and needs non-negative inputs.</li>
    <li>An L1 zero means "redundant given the others", not "unrelated".</li>
  </ul>

  <h2 id="dr-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the curse of dimensionality?</summary><div class="qa-body">It is the set of problems that appear when the number of features grows while the number of rows stays fixed. The space grows exponentially, so data becomes sparse; most of the volume lies near the edges; a neighbourhood holding a fixed share of the data spans almost the whole range of every feature; and pairwise distances concentrate so that the nearest and farthest points are almost equally far. Models that rely on "similar inputs have similar outputs" lose their neighbours.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do distances become meaningless in high dimensions?</summary><div class="qa-body">The squared distance between two random points is a sum of d independent terms, so its mean grows like d while its standard deviation grows only like √d. The relative spread therefore shrinks like 1/√d, and all distances end up close to the same value. For uniform data the farthest/nearest ratio fell from 12.7 in 2-D to 1.10 in 1,000-D.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models suffer most from many irrelevant features?</summary><div class="qa-body">Distance-based ones, such as kNN, k-means, DBSCAN and RBF-kernel SVMs, because the distance sums over every column and noise drowns the signal (tumour 5-NN fell from 0.965 to 0.830 with 1,000 noise columns). Linear models overfit as the number of features approaches the number of rows. Tree ensembles suffer least because each split picks the single best column (the forest only fell to 0.949).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If high-dimensional space is so empty, why does machine learning work at all?</summary><div class="qa-body">Real features are correlated, so the data lies near a low-dimensional surface (a manifold) inside the high-dimensional space. Its intrinsic dimension is much smaller than the number of columns. The real tumours in 30-D kept a nearest/farthest contrast of 3.89, almost double that of uniform 30-D noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between feature selection and feature extraction?</summary><div class="qa-body">Selection keeps a subset of the original columns, so names survive, the model is explainable and you can stop collecting the dropped columns. Extraction builds new columns from all the originals, as PCA does, which can merge many weak correlated columns into a few strong ones, but the new columns have no natural meaning and every original column is still needed at prediction time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare filter, wrapper and embedded methods.</summary><div class="qa-body">Filters score each column with a statistic and never train a model: fastest and model-agnostic, but blind to redundancy and interactions. Wrappers search over column sets using the model's cross-validated score: they see redundancy but need many fits and can overfit the search. Embedded methods select during a single training run (L1 zeros, tree importances): cheap, but they choose arbitrarily between correlated twins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use mutual information instead of correlation?</summary><div class="qa-body">When the relationship might not be a straight line. Pearson correlation only measures linear association, so a U-shaped relation can have r near zero (0.08 in the lab example) while mutual information is large (1.541), because MI is zero only under complete independence. The cost is that MI must be estimated, which is noisy on small samples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the χ² test score a categorical feature?</summary><div class="qa-body">Build the table of counts of feature value against class, compute each cell's expected count under independence (row total × column total / n), and add up (observed − expected)²/expected. A large value means the counts are far from what independence predicts. For "big" against "malignant" on ten tumours it is 6.667 with p ≈ 0.01. sklearn's <code>chi2</code> uses only the "feature present" cells and needs non-negative inputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the ANOVA F statistic measure?</summary><div class="qa-body">The ratio of the spread between class means to the spread within classes, each divided by its degrees of freedom. A large F means the classes differ in that feature by much more than the natural noise. Radius on ten tumours: between mean square 40, within 3.75, F = 10.67; smoothness has equal class means, so F = 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain forward selection and its cost.</summary><div class="qa-body">Start with no features; at each step try adding each remaining feature, keep the one that most improves the cross-validated score, and stop at k features or when gains become tiny. Choosing k of d features needs about d + (d−1) + … + (d−k+1) candidate sets, each trained once per fold: 435 fits for 3 of 30 with 5 folds, instead of 2^d sets for an exhaustive search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does RFE work, and what can mislead it?</summary><div class="qa-body">Fit the model, rank features by absolute coefficient (on standardised data) or importance, remove the weakest, refit and repeat until k remain; RFECV picks k by cross-validation. Correlated features mislead it: they share credit, so neither looks weak until late, and collinearity can inflate coefficients or flip their signs. Unscaled features mislead it too, because coefficients then reflect units.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 regularisation produce sparse models?</summary><div class="qa-body">The penalty α·Σ|w| has a sharp corner at zero. For a feature whose contribution to the loss is smaller than the penalty's pull, the optimum sits exactly at that corner, so the coefficient becomes exactly 0. The L2 penalty α·Σw² is smooth at zero, so it shrinks coefficients towards zero but almost never makes them exactly zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lasso dropped a feature you know is important. Why?</summary><div class="qa-body">It is probably correlated with a feature Lasso kept. L1 tends to keep one member of a correlated group and zero the rest, so a zero means "not needed given the others", not "unrelated" (radius got 0.00 next to perimeter, r = 0.999). Elastic Net or stability selection give steadier choices.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MDI importance versus permutation importance?</summary><div class="qa-body">MDI sums the impurity reductions from each feature's splits on the training data: free to compute but biased towards features with many distinct values and not a measure of generalisation. Permutation importance shuffles a feature on held-out data and measures the score drop: slower but honest. Both split credit among correlated features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You selected 20 of 2,000 features on the whole dataset and got 88% CV accuracy. What is wrong?</summary><div class="qa-body">Selection leakage: the test folds' labels helped choose the features, so some features were picked because they correlate with those very rows by chance. On pure noise this gave 0.883; with selection inside each fold it gave 0.383. Put the selector in a Pipeline and keep an untouched test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does feature selection improve accuracy?</summary><div class="qa-body">Sometimes, especially for distance-based models or when there are many noise columns. With a regularised model and correlated features it rarely beats using all columns (0.979 for all 30 tumour columns versus 0.968 for the best five). Its main benefits are cheaper data collection, faster models, stability and explanations in the original feature names.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose PCA over feature selection?</summary><div class="qa-body">When many columns each carry a little of the same signal and names do not matter, because PCA merges them instead of having to choose (five PCA components scored 0.974 against 0.968 for RFE's best five). Choose selection when you need explainable drivers or want to stop measuring some inputs, since PCA still needs every original column at prediction time.</div></details>
</main>
`
});
