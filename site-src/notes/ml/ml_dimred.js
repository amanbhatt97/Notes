// notes/ml/ml_dimred.js — Curse of Dimensionality & Feature Selection
Object.assign(TOPIC_CONTENT, {
  "ml_dimred": `<main>
  <h1>Curse of Dimensionality &amp; Feature Selection</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>Curse of Dimensionality &amp; Feature Selection</span></div>
  <p class="lead">More columns feel like more information, yet past a point every extra column makes models slower, noisier and, for distance-based methods, almost blind. This note opens the Dimensionality Reduction group. It follows one story from start to end: a hospital that measures tumours and wants to predict which are malignant. First we see, with numbers you can check by hand, <em>why</em> high-dimensional space is strange (empty boxes, hollow cubes, distances that all look the same). Then we learn the first cure, <strong>feature selection</strong>: keep only the columns that matter. Every selection method (filter, wrapper, embedded) is worked by hand on the same 10 tumours, then run in scikit-learn on the full 569-tumour dataset, and the classic leakage trap is shown with a model that "learns" pure noise. The other cure, building new columns (PCA, t-SNE, UMAP), is the rest of the group.</p>

  <h2 id="dr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <p><strong>Came from.</strong> In <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> and <a class="xref" data-note="ml_clustering">Clustering</a> everything rests on "who is close to whom". In <a class="xref" data-note="ml_features">Feature Engineering</a> you learned to <em>create</em> columns (one-hot, interactions, polynomials), which can turn 10 raw columns into hundreds. And <a class="xref" data-note="ml_regularization">Regularization</a> showed that a model with too many knobs memorises. One question was left open: <em>what happens when there are simply too many columns, and how do we decide which to keep?</em></p>
  <p><strong>What this note adds.</strong> (1) The <strong>curse of dimensionality</strong>: exactly how and why high-dimensional data becomes sparse and distances lose meaning. (2) <strong>Feature selection</strong>: filter methods (variance, correlation, χ², ANOVA F, mutual information), wrapper methods (forward, backward, RFE, RFECV) and embedded methods (L1, tree importance), each by hand and in sklearn, and how to do it without leaking.</p>
  <p><strong>Leads to.</strong> Selection can only keep or drop whole columns. When many columns each carry a little of the same signal (radius, perimeter and area of the same tumour; 64 pixels of a digit), it is better to <em>merge</em> them into a few new ones: <a class="xref" data-note="ml_pca">PCA</a> does this with straight lines. When the structure is curved and you want a picture, <a class="xref" data-note="ml_tsne">t-SNE</a> and then <a class="xref" data-note="ml_umap">UMAP</a> draw high-dimensional data in 2D.</p>
  <h3>The Dimensionality Reduction group at a glance</h3>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="215" y="10" width="230" height="40" rx="8" class="fs" stroke="currentColor"/>
<text x="330" y="28" text-anchor="middle" font-size="13" font-weight="700">Too many columns</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="11">curse of dimensionality (this note)</text>
<line x1="290" y1="50" x2="150" y2="88" stroke="currentColor" marker-end="url(#dr-a)"/>
<line x1="370" y1="50" x2="500" y2="88" stroke="currentColor" marker-end="url(#dr-a)"/>
<rect x="30" y="90" width="240" height="52" rx="8" class="fb sb" stroke-width="3"/>
<text x="150" y="111" text-anchor="middle" font-size="13" font-weight="700">Feature SELECTION</text><text x="150" y="128" text-anchor="middle" class="tb" font-size="11">keep a subset of columns · YOU ARE HERE</text>
<rect x="390" y="90" width="240" height="52" rx="8" class="fs" stroke="currentColor"/>
<text x="510" y="111" text-anchor="middle" font-size="13" font-weight="700">Feature EXTRACTION</text><text x="510" y="128" text-anchor="middle" class="tm" font-size="11">build new columns from all</text>
<g font-size="11.5"><rect x="20" y="168" width="78" height="30" rx="6" class="fb sb" fill-opacity="0.35"/><text x="59" y="187" text-anchor="middle">Filter</text>
<rect x="111" y="168" width="78" height="30" rx="6" class="fb sb" fill-opacity="0.35"/><text x="150" y="187" text-anchor="middle">Wrapper</text>
<rect x="202" y="168" width="78" height="30" rx="6" class="fb sb" fill-opacity="0.35"/><text x="241" y="187" text-anchor="middle">Embedded</text></g>
<line x1="150" y1="142" x2="59" y2="166" stroke="currentColor" marker-end="url(#dr-a)"/><line x1="150" y1="142" x2="150" y2="166" stroke="currentColor" marker-end="url(#dr-a)"/><line x1="150" y1="142" x2="241" y2="166" stroke="currentColor" marker-end="url(#dr-a)"/>
<rect x="410" y="166" width="200" height="34" rx="8" class="ft st"/><text x="510" y="181" text-anchor="middle" font-size="12.5" font-weight="700">PCA</text><text x="510" y="194" text-anchor="middle" class="tm" font-size="10.5">linear · for models &amp; compression</text>
<line x1="510" y1="142" x2="510" y2="164" stroke="currentColor" marker-end="url(#dr-a)"/>
<rect x="410" y="218" width="200" height="34" rx="8" class="fg sg"/><text x="510" y="233" text-anchor="middle" font-size="12.5" font-weight="700">t-SNE</text><text x="510" y="246" text-anchor="middle" class="tm" font-size="10.5">non-linear · 2D pictures</text>
<line x1="510" y1="200" x2="510" y2="216" stroke="currentColor" marker-end="url(#dr-a)"/>
<rect x="410" y="262" width="200" height="34" rx="8" class="fg sg"/><text x="510" y="277" text-anchor="middle" font-size="12.5" font-weight="700">UMAP</text><text x="510" y="290" text-anchor="middle" class="tm" font-size="10.5">faster · more global · new points</text>
<line x1="510" y1="252" x2="510" y2="260" stroke="currentColor" marker-end="url(#dr-a)"/>
<text x="20" y="232" class="tm" font-size="11">Selection keeps names → explainable.</text>
<text x="20" y="250" class="tm" font-size="11">Extraction merges columns → stronger</text>
<text x="20" y="266" class="tm" font-size="11">compression, but new axes have no names.</text>
</svg><figcaption>The four notes of this group. This note covers the problem and the "keep columns" branch; the right branch builds new columns.</figcaption></figure>
  <ol class="story">
    <li><b>Curse of Dimensionality &amp; Feature Selection</b><span>Why many columns hurt (sparsity, distance concentration, overfitting) and how to keep only useful columns: filter, wrapper, embedded. → <em>Weakness:</em> it can only keep or drop whole columns; ten weakly useful, correlated columns cannot be merged into one strong one. <a class="xref" data-note="ml_dimred">this note</a></span></li>
    <li><b>PCA</b><span>Rotates the data onto new axes ordered by variance and keeps the top few: the best straight-line compression, with <code>transform</code> for new rows. → <em>Weakness:</em> straight lines only; curved structure gets squashed, and a 2-component picture often overlaps. <a class="xref" data-note="ml_pca">PCA</a></span></li>
    <li><b>t-SNE</b><span>Keeps each point's neighbours as neighbours in a 2D map; crisp cluster pictures. → <em>Weakness:</em> slow, distances and sizes between clusters are meaningless, no <code>transform</code> for new points. <a class="xref" data-note="ml_tsne">t-SNE</a></span></li>
    <li><b>UMAP</b><span>Builds a fuzzy neighbour graph and lays it out: as good locally, more faithful globally, faster, and can embed new points, so it is also used before clustering. <a class="xref" data-note="ml_umap">UMAP</a></span></li>
  </ol>
  <p><strong>Reading order:</strong> this note → PCA → t-SNE → UMAP. If you only need a model's input smaller, this note and PCA are enough. If you need pictures of high-dimensional data, read all four.</p>

  <h2 id="dr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Every idea in this note exists because the idea before it left a question unanswered. Read this ladder first; each step is a section below, in the same order.</p>
  <ol class="story">
    <li><b>Dimension</b><span>Q: what is "a column" geometrically? → one axis; a row with d columns is a point in d-dimensional space (our tumours: 30 measurements → 30-D). But is a 30-D space just a bigger 2-D space?</span></li>
    <li><b>Sparsity (empty boxes)</b><span>Q: do 569 rows fill 30-D space? → no: 10 bins per axis make 10^30 boxes; almost all are empty. But even if a box is empty, can't we just look at the nearest rows?</span></li>
    <li><b>Hollow cube &amp; non-local neighbourhoods</b><span>Q: where do the nearest rows sit? → near the edges, and a neighbourhood holding 10% of the data spans 93% of every axis in 30-D. But are the "nearest" rows at least clearly nearer than the rest?</span></li>
    <li><b>Distance concentration</b><span>Q: does nearest still mean much nearer? → no: mean squared distance grows like d but its spread only like √d, so all distances look alike. But does this actually hurt a real model?</span></li>
    <li><b>Effect on models</b><span>Q: what happens to accuracy when useless columns pile up? → kNN on tumours drops 0.965 → 0.805 with 1,000 noise columns; a forest barely moves. So which columns should we remove, and how do we decide?</span></li>
    <li><b>Selection vs extraction</b><span>Q: remove columns or rebuild them? → selection keeps original columns (this note), extraction builds new ones (PCA and after). If we select, what is the cheapest test of a column?</span></li>
    <li><b>Variance threshold</b><span>Q: which columns cannot possibly help? → those that never change (scanner = 0 variance). But a column that changes may still be unrelated to the label.</span></li>
    <li><b>Correlation</b><span>Q: does the column move with the label, and does it repeat another column? → |r| (perimeter 0.770, smooth 0.000) and r between features (radius–perimeter 0.999). But r needs numbers and straight lines.</span></li>
    <li><b>χ² test</b><span>Q: for a yes/no feature and a yes/no label, are they related? → compare counts with what independence predicts (big vs malignant: χ² = 6.667). But what about a numeric feature with a class label?</span></li>
    <li><b>ANOVA F</b><span>Q: are the class means of a numeric column far apart compared with the noise? → F = between ÷ within (radius 10.67, smooth 0). But F and r only see differences in means / straight lines.</span></li>
    <li><b>Mutual information</b><span>Q: is there <em>any</em> dependence, even curved? → MI (big: 0.610 bits; a U-shape with r = 0.08 has MI 1.54). But every filter scores columns one at a time: it cannot see redundancy or teamwork.</span></li>
    <li><b>Forward / backward selection</b><span>Q: which <em>set</em> of columns works best together for the model? → add (or drop) one column at a time by CV score. But this needs a model fit for every candidate at every step.</span></li>
    <li><b>RFE &amp; RFECV</b><span>Q: can the model rank columns itself to save fits? → fit, drop the smallest |coef|, repeat; RFECV picks how many. But it still trains many times.</span></li>
    <li><b>Embedded: L1 and tree importance</b><span>Q: can one training run do the selection? → L1 zeroes weak coefficients (on our 10 tumours it zeroes radius, keeping its twin perimeter); trees rank by split gains. But all of these used the labels — how do we measure the result honestly?</span></li>
    <li><b>Selection inside CV</b><span>Q: is the reported score real? → only if selection is refitted inside each training fold: pure noise scored 0.883 the wrong way, 0.383 the right way. Next: when columns should be merged rather than chosen → <a class="xref" data-note="ml_pca">PCA</a>.</span></li>
  </ol>

  <h2 id="dr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Curse of Dimensionality &amp; Feature Selection</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why many columns hurt</div>
        <ul>
          <li><b>Sparsity</b> — 10 bins/axis → 10^d boxes; 569 tumours in 30-D: 10^30 boxes</li>
          <li><b>Hollow cube</b> — near an edge: 1 − 0.9^d (d=30: 0.958)</li>
          <li><b>Non-local neighbourhoods</b> — edge for 10% of data = 0.1^(1/d) (d=30: 0.926)</li>
          <li><b>Distance concentration</b> — E[dist²] = d/6, std/mean = √(7/(5d)) → 0</li>
          <li>Tumours 5-NN: 0.965 → 0.805 with 1,000 noise cols; forest 0.965 → 0.946</li>
          <li>💡 Real data lives on a thin surface: tumours' farthest/nearest 3.89 vs 1.91 for uniform 30-D</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why reduce · what kind</div>
        <ul>
          <li>Speed &amp; memory · less overfitting · distances work · pictures · explainability</li>
          <li><b>Selection</b> keeps original columns (names survive, collect less)</li>
          <li><b>Extraction</b> builds new ones (PCA, t-SNE, UMAP)</li>
          <li>Relevant · redundant · irrelevant columns</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filter (score each column alone)</div>
        <ul>
          <li><b>Variance</b> — binary p(1−p); threshold .8×.2 = 0.16 drops scanner, rare_flag</li>
          <li><b>Correlation</b> — |r| relevance; r between features = redundancy (radius–perimeter 0.999)</li>
          <li><b>χ²</b> — Σ(O−E)²/E, E = row×col/n; big vs malignant 6.667 (sklearn 4.000)</li>
          <li><b>ANOVA F</b> — between ÷ within; radius 10.67, smooth 0</li>
          <li><b>MI</b> — Σ p log p/(p·p); big 0.610 bits; catches curves</li>
          <li>Fast, model-free; ⚠ blind to redundancy &amp; teamwork</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Wrapper (search with the model)</div>
        <ul>
          <li><b>Forward</b> — add best column by CV: worst perimeter → worst smoothness → mean texture (0.970 vs 0.979 all)</li>
          <li><b>Backward</b> — start full, drop least useful</li>
          <li><b>RFE</b> — fit, drop smallest |coef|, repeat; mini: smooth → texture → radius</li>
          <li><b>RFECV</b> — CV picks the count; flat from ~15 of 30</li>
          <li>Cost: d + (d−1) + … subsets vs 2^d</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Embedded (select while training)</div>
        <ul>
          <li><b>L1</b> — zeros coefficients; C = 0.01 → 4 columns (0.933), C = 0.1 → 8 (0.974)</li>
          <li><b>Tree importance</b> — MDI (train, biased) vs permutation (held-out)</li>
          <li><code>SelectFromModel(threshold="median")</code>: 15 of 30, same 0.953</li>
          <li>⚠ Correlated twins: L1 keeps one, trees split credit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Doing it right</div>
        <ul>
          <li>⚠ Select <b>inside</b> CV: noise "genes" 0.883 wrong vs 0.383 right</li>
          <li>Selectors are Pipeline steps; tune k by CV</li>
          <li>5 columns: filter 0.947 · RFE 0.968 · L1 0.961 · PCA 0.974 · all 30: 0.979</li>
          <li>Wins: cost, speed, stability, explanation — rarely raw accuracy</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dr-dims"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Tumours, Columns &amp; Dimensions</span><span class="rm-sub">The running example, why reduce</span></div></div>
      <div class="rm-item rm-done" data-target="dr-curse"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Curse of Dimensionality</span><span class="rm-sub">Boxes, hollow cubes, distances</span></div></div>
      <div class="rm-item rm-done" data-target="dr-models"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">What It Does to Models</span><span class="rm-sub">Noise columns vs kNN and forests</span></div></div>
      <div class="rm-item rm-done" data-target="dr-selext"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Selection vs Extraction</span><span class="rm-sub">Keep columns or build new ones</span></div></div>
      <div class="rm-item rm-done" data-target="dr-filter"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Filter Methods</span><span class="rm-sub">Variance, correlation, χ², F, MI</span></div></div>
      <div class="rm-item rm-done" data-target="dr-wrapper"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Wrapper Methods</span><span class="rm-sub">Forward, backward, RFE, RFECV</span></div></div>
      <div class="rm-item rm-done" data-target="dr-embedded"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Embedded Methods</span><span class="rm-sub">L1 and tree importance</span></div></div>
      <div class="rm-item rm-done" data-target="dr-leak"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Selection Without Leakage</span><span class="rm-sub">A model that "learns" noise</span></div></div>
      <div class="rm-item rm-done" data-target="dr-sklearn"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">scikit-learn Toolbox</span><span class="rm-sub">Every selector, one benchmark</span></div></div>
      <div class="rm-item rm-done" data-target="dr-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every score on the same 10 tumours</span></div></div>
      <div class="rm-item rm-done" data-target="dr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="dr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="dr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dr-dims"><span class="num">01</span>Tumours, Columns &amp; Dimensions</h2>
  <p><strong>The question we can't answer yet.</strong> Earlier notes treated a table's columns as "inputs" without asking how many is too many. Before we can say anything about too many columns, we need a picture of what a column <em>is</em>, and a concrete dataset to measure on.</p>
  <h3>The running example</h3>
  <p>A hospital measures each breast tumour from a scan: its radius, perimeter, area, texture, smoothness and so on, 30 measurements in all, and records whether a biopsy found it malignant. The real data (the Wisconsin breast-cancer dataset, built into sklearn) has <strong>569 tumours × 30 columns</strong>: 212 malignant, 357 benign. All full-size code in this note uses it.</p>
  <p>For calculations by hand we use a tiny version with the same story: <strong>10 tumours</strong> and a few columns, chosen so that each column teaches something.</p>
  <ul>
    <li><code>radius</code> (mm): genuinely useful. <code>perimeter</code>: about 2π × radius, so a near-copy (redundant).</li>
    <li><code>texture</code>: somewhat useful. <code>smooth</code>: unrelated to the label (same mean in both classes).</li>
    <li><code>scanner</code>: the same machine for every tumour (constant). <code>rare_flag</code>: 1 for only one tumour.</li>
    <li><code>big</code>: a yes/no column, radius ≥ 15. <code>malignant</code>: the label (1 = malignant).</li>
  </ul>
  <p>The file <code>tumours.py</code> below holds this table; every hand-worked code block imports it.</p>
  <div class="fx" data-lang="py">import pandas as pd
# 10 teaching tumours shaped like the breast-cancer data (sizes in mm, rounded)
mini = pd.DataFrame({
    "radius":    [10, 11, 12, 13, 14, 13, 15, 16, 17, 19],
    "perimeter": [62, 69, 75, 80, 88, 83, 95, 99, 107, 120],   # ≈ 2π·radius: a near-copy of radius
    "texture":   [15, 18, 14, 17, 20, 21, 17, 23, 19, 25],
    "smooth":    [9, 11, 10, 8, 12, 10, 9, 12, 11, 8],          # unrelated to the label
    "scanner":   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],                # same machine every time
    "rare_flag": [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],                # 1 in 10 rows
    "malignant": [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]})
mini["big"] = (mini.radius &gt;= 15).astype(int)                   # a yes/no version of radius</div>
  <div class="fx" data-lang="py">from tumours import mini
print(mini.to_string())
print("\\nmeans by class:\\n", mini.groupby("malignant")[["radius", "texture", "smooth"]].mean())</div>
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
  <p>Already you can see the story: malignant tumours are bigger on average (radius 16 vs 12), have rougher texture (21 vs 16.8), and identical smoothness (10 vs 10). Keep this table in mind; every score in this note will be computed on it.</p>
  <h3>A column is a direction</h3>
  <p>With two columns, radius and texture, each tumour is a dot on graph paper: radius along one edge, texture along the other. Add smoothness and each tumour becomes a dot inside a box. Each column is one <strong>direction</strong> (axis) and the number of columns is the <strong>dimension</strong> d. The real dataset puts 569 points in a 30-dimensional space. You cannot draw it, but every formula still works: the distance between two tumours is √(Σ (differences)²) over 30 terms instead of 2.</p>
  <p>Wide tables are normal: one-hot encoding a "city" column with 300 cities gives 300 columns; an 8×8 image gives 64 pixel columns; a bag-of-words text model has one column per word; gene-expression data has 20,000 genes for perhaps 200 patients.</p>
  <h3>Five reasons to reduce</h3>
  <div class="cards">
    <div><b>Speed &amp; memory</b><p>Cost grows with d. 1 million rows × 1,000 float64 columns is 8 GB; × 50 columns is 400 MB.</p><small>Cheaper to store, train, serve</small></div>
    <div><b>Less overfitting</b><p>Every column is a chance to fit noise. With d close to n a linear model can memorise the training rows.</p><small>Better generalisation</small></div>
    <div><b>Distances work again</b><p>kNN, k-means, DBSCAN and RBF kernels need meaningful distances, which fade in high d.</p><small>Distance-based models</small></div>
    <div><b>Pictures</b><p>Humans see 2-D and 3-D; 30-D tumours must be squeezed into 2 to be looked at.</p><small>PCA, t-SNE, UMAP</small></div>
    <div><b>Explain &amp; collect less</b><p>A model on 5 named scan measurements is easier to explain, monitor and feed than one on 30.</p><small>Feature selection</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Packing for a trek. Every extra item feels useful, but the bag gets heavy and you move slowly. A good trekker keeps the items that earn their weight (selection) or swaps three single-use gadgets for one multi-tool (extraction).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>dimension</strong> of a dataset is its number of features d; each row is a point in ℝ^d. <strong>Dimensionality reduction</strong> maps each row to a shorter vector of k &lt; d numbers while keeping what matters for the task: either a subset of the original columns (<strong>feature selection</strong>) or new columns computed from all of them (<strong>feature extraction</strong>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"More data" means more <em>rows</em>, not more <em>columns</em>. Adding columns without adding rows makes the data relatively <em>scarcer</em>, as the next section shows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the curse of dimensionality.</b> We know 30 columns means a 30-D space. We do not yet know whether 569 points are "a lot" in such a space, or what goes wrong when they are not.</div>

  <h2 id="dr-curse"><span class="num">02</span>The Curse of Dimensionality</h2>
  <p><strong>The question we can't answer yet.</strong> Is a 30-D space just a bigger 2-D space, or does it behave differently? The phrase "curse of dimensionality" (Richard Bellman, 1961) names four related effects. We take them one at a time, each answering the question the previous one raises.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a friend on a railway platform (one direction) is easy. On a cricket ground (two directions) it is harder. In a 100-floor building (three directions) it is hopeless. Each extra direction multiplies the space, so the same 500 people spread thinner.</p>
  </div>
  <h3>Effect 1: data becomes sparse (count the boxes)</h3>
  <p>Cut every feature's range into 10 equal bins. With 1 feature there are 10 boxes; with 2 features 10 × 10 = 100; with d features 10^d. Our 10 teaching tumours with just radius: 10 boxes, about one tumour each. With radius and texture: 100 boxes for 10 tumours, so 90% of boxes are empty. With the real 569 tumours and 30 columns: 10^30 boxes.</p>
  <table class="tbl"><caption>Rows per box with 10 bins per feature</caption>
    <tr><th>features d</th><th>boxes 10^d</th><th>569 tumours: rows per box</th><th>rows needed for 10 per box</th></tr>
    <tr><td>1</td><td>10</td><td>56.9</td><td>100</td></tr>
    <tr><td>2</td><td>100</td><td>5.69</td><td>1,000</td></tr>
    <tr><td>3</td><td>1,000</td><td>0.569</td><td>10,000</td></tr>
    <tr><td>30</td><td>10^30</td><td>5.7 × 10⁻²⁸</td><td>10^31</td></tr>
  </table>
  <p>A model learns "what happens around here" from the rows around here. In 30-D a new tumour almost always lands in a box no training tumour has visited. Keeping the same density needs exponentially many rows: <strong>the data needed grows like (bins)^d</strong>.</p>
  <h3>Effect 2: the cube is hollow</h3>
  <p>Effect 1 raises a question: if boxes are empty, where are the points? Take the unit cube [0, 1]^d (every feature rescaled to 0–1) and call a point "near the edge" if any coordinate is within 0.05 of 0 or 1. In 1-D the safe middle is [0.05, 0.95], length 0.9, so 10% of the line is near an edge. In d dimensions a point is safe only if <em>every</em> coordinate is safe, so the safe volume is 0.9^d and the edge volume is <strong>1 − 0.9^d</strong>:</p>
  <ul>
    <li>d = 2: 1 − 0.81 = <strong>0.19</strong></li>
    <li>d = 3: 1 − 0.729 = <strong>0.271</strong></li>
    <li>d = 10: 1 − 0.349 = <strong>0.651</strong></li>
    <li>d = 30 (our tumours): 1 − 0.042 = <strong>0.958</strong></li>
  </ul>
  <p>In 30-D, 96% of the volume is near the boundary, where models must <em>extrapolate</em>. A second view: the biggest ball that fits inside the cube (radius 0.5) fills π·0.5² = 0.785 of the square, 4/3·π·0.5³ = 0.524 of the 3-D cube, but only 0.0025 of the 10-D cube. Almost all the volume is in the corners.</p>
  <h3>Effect 3: neighbourhoods stop being local</h3>
  <p>Then can we not simply use the nearest rows, wherever they are? Suppose kNN looks at the nearest 10% of the data. With uniform data, a sub-cube with edge ℓ holds a fraction ℓ^d of the points. Setting ℓ^d = 0.1 gives <strong>ℓ = 0.1^(1/d)</strong>. In 1-D, ℓ = 0.1: a tight window. In 2-D, √0.1 = 0.316. In 10-D, 0.1^0.1 = 0.794. In 30-D, 0.1^(1/30) = 0.926: to collect 10% of the tumours you must cover 93% of the range of <em>every</em> measurement. The "neighbourhood" is not local at all, so averaging over it is not averaging similar tumours.</p>
  <p>The code checks the three volume facts (the ball volume formula is π^(d/2) / Γ(d/2 + 1) · r^d, where Γ is the factorial extended to fractions).</p>
  <div class="fx" data-lang="py">from math import pi, gamma
print("  d | near an edge | ball/cube | edge for 10% of data")
for d in (1, 2, 3, 10, 30, 100):
    shell = 1 - (1 - 0.05 * 2) ** d          # within 0.05 of a face on ANY axis
    ball = pi ** (d / 2) / gamma(d / 2 + 1) * 0.5 ** d   # ball of radius 0.5 inside unit cube
    edge = 0.1 ** (1 / d)                    # side of a sub-cube holding 10% of uniform data
    print(f"{d:3d} | {shell:12.3f} | {ball:9.4f} | {edge:6.3f}")</div>
  <div class="fx" data-lang="text">  d | near an edge | ball/cube | edge for 10% of data
  1 |        0.100 |    1.0000 |  0.100
  2 |        0.190 |    0.7854 |  0.316
  3 |        0.271 |    0.5236 |  0.464
 10 |        0.651 |    0.0025 |  0.794
 30 |        0.958 |    0.0000 |  0.926
100 |        1.000 |    0.0000 |  0.977</div>
  <p>Each row matches the hand calculation: 0.19, 0.271, 0.651, 0.958 for the edge band; 0.7854, 0.5236, 0.0025 for the ball; 0.316, 0.794, 0.926 for the neighbourhood edge.</p>
  <h3>Effect 4: all distances look the same</h3>
  <p>Even if neighbourhoods are wide, is the nearest point at least clearly nearer than the others? Take two random points in the unit cube. Along one axis the squared difference (a − b)² of two uniform numbers has average 1/6 (E[(a−b)²] = E[a²] + E[b²] − 2E[a]E[b] = 1/3 + 1/3 − 2·¼ = 1/6). The squared distance is the sum over d independent axes, so</p>
  <ul>
    <li><strong>mean of squared distance = d/6</strong> (grows like d), but</li>
    <li>its <strong>standard deviation grows only like √d</strong> (variances of independent terms add).</li>
  </ul>
  <p>So the relative spread std/mean shrinks like √d / d = 1/√d. Working the constant out (the variance of one term is 7/180) gives std/mean = √(7/(5d)): 1.183 for d = 1, 0.216 for d = 30, 0.037 for d = 1,000. In 1,000-D every pair of random points is at almost exactly the same distance, give or take 4%. The simulation draws 20,000 random pairs for each d and checks both formulas.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(1)
for d in (1, 2, 10, 30, 100, 1000):
    A, B = rng.random((20000, d)), rng.random((20000, d))   # 20,000 random pairs of points
    sq = ((A - B) ** 2).sum(axis=1)                          # squared distance of each pair
    print(f"d={d:5d}  mean sq dist={sq.mean():8.3f} (theory d/6={d/6:8.3f})  "
          f"std/mean={sq.std()/sq.mean():.3f} (theory {np.sqrt(7/(5*d)):.3f})")</div>
  <div class="fx" data-lang="text">d=    1  mean sq dist=   0.166 (theory d/6=   0.167)  std/mean=1.178 (theory 1.183)
d=    2  mean sq dist=   0.336 (theory d/6=   0.333)  std/mean=0.837 (theory 0.837)
d=   10  mean sq dist=   1.668 (theory d/6=   1.667)  std/mean=0.372 (theory 0.374)
d=   30  mean sq dist=   5.003 (theory d/6=   5.000)  std/mean=0.215 (theory 0.216)
d=  100  mean sq dist=  16.659 (theory d/6=  16.667)  std/mean=0.118 (theory 0.118)
d= 1000  mean sq dist= 166.644 (theory d/6= 166.667)  std/mean=0.038 (theory 0.037)</div>
  <p>Simulation and theory agree to two or three decimals. Now the practical version, including our real tumours: from one query row, how much nearer is the nearest of 568 others than the farthest?</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<text x="20" y="18">Farthest ÷ nearest distance from one query row (569 rows)</text>
<g text-anchor="end" font-size="12"><text x="150" y="44">uniform d = 2</text><text x="150" y="66">uniform d = 10</text><text x="150" y="88">uniform d = 30</text><text x="150" y="110">uniform d = 1000</text><text x="150" y="138">real tumours, d = 30</text><text x="150" y="160">tumours + 1000 noise</text></g>
<rect x="160" y="32" width="320" height="16" class="fb sb"/><text x="486" y="45" font-size="12">67.1×</text>
<rect x="160" y="54" width="104" height="16" class="fb sb"/><text x="270" y="67" font-size="12">3.57×</text>
<rect x="160" y="76" width="53" height="16" class="fr sr"/><text x="219" y="89" font-size="12">1.91×</text>
<rect x="160" y="98" width="8" height="16" class="fr sr"/><text x="174" y="111" font-size="12">1.11×</text>
<rect x="160" y="126" width="111" height="16" class="fg sg"/><text x="277" y="139" font-size="12">3.89×</text>
<rect x="160" y="148" width="11" height="16" class="fr sr"/><text x="177" y="161" font-size="12">1.14×</text>
<text x="20" y="190" class="tm" font-size="11">bar length ∝ log(ratio); near 1× = nearest is no nearer than farthest</text>
</svg><figcaption>Uniform noise loses "nearest" fast. Real tumours in 30-D keep a healthy 3.89× contrast, because their columns are correlated; add 1,000 noise columns and the contrast collapses to 1.14×.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.preprocessing import StandardScaler
rng = np.random.default_rng(0)
def ratio(X, name):
    q, rest = X[0], X[1:]                                   # first row is the query
    dist = np.linalg.norm(rest - q, axis=1)                 # distance from q to every other row
    print(f"{name:28s} nearest={dist.min():6.2f} farthest={dist.max():6.2f} "
          f"ratio={dist.max()/dist.min():6.2f}  std/mean={dist.std()/dist.mean():.3f}")
for d in (2, 10, 30, 100, 1000):
    ratio(rng.random((569, d)), f"uniform noise, d={d}")
Xs = StandardScaler().fit_transform(load_breast_cancer().data)
ratio(Xs, "real tumours, d=30")
ratio(np.hstack([Xs, rng.normal(size=(569, 1000))]), "tumours + 1000 noise cols")</div>
  <div class="fx" data-lang="text">uniform noise, d=2           nearest=  0.01 farthest=  0.94 ratio= 67.13  std/mean=0.476
uniform noise, d=10          nearest=  0.56 farthest=  1.98 ratio=  3.57  std/mean=0.172
uniform noise, d=30          nearest=  1.51 farthest=  2.90 ratio=  1.91  std/mean=0.105
uniform noise, d=100         nearest=  3.39 farthest=  4.68 ratio=  1.38  std/mean=0.054
uniform noise, d=1000        nearest= 12.14 farthest= 13.49 ratio=  1.11  std/mean=0.017
real tumours, d=30           nearest=  4.83 farthest= 18.79 ratio=  3.89  std/mean=0.202
tumours + 1000 noise cols    nearest= 43.24 farthest= 49.44 ratio=  1.14  std/mean=0.022</div>
  <p>Uniform noise: the ratio falls 67.1 → 3.57 → 1.91 → 1.11 as d grows, and std/mean falls to 0.017. This is <strong>distance concentration</strong> (Beyer et al., 1999): when distances barely differ, "nearest" is decided by noise. Now the important surprise: the real tumours, also 30-D, keep a ratio of <strong>3.89</strong> (std/mean 0.202), much healthier than uniform 30-D noise (1.91). Append 1,000 noise columns to the same tumours and the ratio collapses to 1.14.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>All four effects say the same thing: a fixed number of rows cannot fill a high-dimensional space, so every point is far from every other, near an edge, and roughly equally far from all. Models that reason "similar inputs → similar outputs" need neighbours, and neighbours vanish.</p>
  </div>
  <h3>The blessing: real data is not uniform</h3>
  <p>Why did the real tumours resist? Their 30 columns are not independent: radius, perimeter and area are almost the same measurement; "mean" and "worst" versions of each move together. The tumours really live on a thin surface (a <strong>manifold</strong>) of a few dimensions inside the 30-D space. That gap between the <strong>ambient dimension</strong> (30 columns) and the <strong>intrinsic dimension</strong> (the few real degrees of freedom) is exactly what dimensionality reduction exploits. Pure noise columns have no such structure, which is why they are so damaging.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>curse of dimensionality</strong> is the set of effects that appear as the number of features d grows with a fixed number of rows: volume grows exponentially (sparsity), most volume lies near the boundary (1 − 0.9^d), a neighbourhood holding a fixed fraction of the data spans almost the whole range of each feature (edge 0.1^(1/d) for 10%), and pairwise distances concentrate (std/mean → 0 like 1/√d). The <strong>intrinsic dimension</strong> is the number of coordinates needed to describe the surface the data actually lies on.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not say "30 features means 30 dimensions of trouble". Correlated features have a small intrinsic dimension and kNN may still work (it did: 3.89×). The curse bites hardest when many columns are <em>irrelevant</em> noise.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the effect on models.</b> Ratios of distances are geometry. Does an actual classifier on our tumours lose accuracy when useless columns pile up, and do all models suffer equally?</div>

  <h2 id="dr-models"><span class="num">03</span>What It Does to Models</h2>
  <p><strong>The question we can't answer yet.</strong> We saw the nearest/farthest contrast collapse from 3.89 to 1.14 when 1,000 noise columns were added to the tumours. How much accuracy does that cost, and which models are hurt most?</p>
  <p>We keep the 30 real columns and add more and more columns of pure random noise, then measure 5-fold cross-validated accuracy for 5-nearest-neighbours (distance-based) and a random forest (picks one column per split).</p>
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
for extra in (0, 30, 100, 300, 1000):
    Xn = np.hstack([X, rng.normal(size=(len(X), extra))])     # add useless random columns
    knn = make_pipeline(StandardScaler(), KNeighborsClassifier(5))
    rf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=1)
    a = cross_val_score(knn, Xn, y, cv=cv).mean()
    b = cross_val_score(rf, Xn, y, cv=cv).mean()
    print(f"{extra:16d} | {a:8.3f} | {b:10.3f}")
print("always guess 'benign':", round(y.mean(), 3))</div>
  <div class="fx" data-lang="text">extra noise cols | 5-NN acc | forest acc
               0 |    0.965 |      0.965
              30 |    0.940 |      0.953
             100 |    0.924 |      0.951
             300 |    0.870 |      0.947
            1000 |    0.805 |      0.946
always guess 'benign': 0.627</div>
  <p>With the 30 real columns both models score 0.965. kNN falls steadily: 0.940 with 30 noise columns, 0.870 with 300, 0.805 with 1,000, heading towards 0.627, the score of always guessing "benign". The distance is a sum over all columns and the 30 useful terms are drowned by 1,000 noise terms, so the "nearest" tumours are nearest by accident. The forest only slips from 0.965 to 0.946, because each split picks the single best column and the real columns still win most splits.</p>
  <table class="tbl">
    <tr><th>Model family</th><th>How badly the curse hurts</th><th>Why</th></tr>
    <tr><td>kNN, k-means, DBSCAN, RBF-SVM</td><td>Badly</td><td>Everything depends on distances over all columns</td></tr>
    <tr><td>Linear / logistic regression</td><td>Overfits when d approaches n</td><td>One weight per column; with d ≥ n it can fit training rows exactly</td></tr>
    <tr><td>Naive Bayes</td><td>Mildly</td><td>Each column is a separate factor; many weak noisy ones add up</td></tr>
    <tr><td>Decision trees, forests, boosting</td><td>Least</td><td>Splits choose one column at a time; still slower and can split on noise</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging how similar two patients are by comparing 30 scan measurements works. Add 1,000 columns of random lottery numbers and compare all 1,030 values: two patients look "similar" only by lottery luck.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A feature is <strong>relevant</strong> if it carries information about the target (radius), <strong>redundant</strong> if its information is already carried by kept features (perimeter, once radius is kept), and <strong>irrelevant</strong> if it carries none (smooth, scanner). Reduction tries to remove the last two kinds while keeping the first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tree models cope but are not immune: the forest lost 2 points, trains slower, and its importance ranking gives noise columns some credit. Clean feature sets help every model.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: selection vs extraction.</b> We now know useless columns hurt. Should we remove some columns, or replace them all with a few new ones?</div>

  <h2 id="dr-selext"><span class="num">04</span>Selection vs Extraction</h2>
  <p><strong>The question we can't answer yet.</strong> We want fewer columns. But "fewer" can mean two different things: keep some of the originals, or invent new ones that summarise all of them. Which, and when?</p>
  <ul>
    <li><strong>Feature selection</strong> keeps k of the original columns. "Keep radius and texture." The result is still in hospital language, and the scanner team can stop measuring the dropped columns.</li>
    <li><strong>Feature extraction</strong> builds k <em>new</em> columns from all the old ones. "New column 1 = 0.71·radius + 0.70·perimeter." It merges near-copies such as radius and perimeter into one, but the new column has no natural name.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket selector picking 11 players from a squad of 30 is <em>selection</em>: every player is a real person you can name. A batting index that combines average, strike rate and consistency into one score is <em>extraction</em>: more informative per number, but "the index" is not a person.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Feature selection</th><th>Feature extraction</th></tr>
    <tr><td>Output columns</td><td>A subset of the originals</td><td>New combinations of all originals</td></tr>
    <tr><td>Interpretability</td><td>High: names survive</td><td>Low: PC1, UMAP-2 have no business meaning</td></tr>
    <tr><td>Saves data collection</td><td>Yes</td><td>No: every original column is still needed</td></tr>
    <tr><td>Many weak correlated columns</td><td>Must keep or drop each</td><td>Merges them</td></tr>
    <tr><td>Uses the target y</td><td>Usually</td><td>Usually not (PCA, t-SNE, UMAP; LDA is the exception)</td></tr>
    <tr><td>Examples</td><td>Variance threshold, χ², MI, RFE, Lasso</td><td>PCA, kernel PCA, LDA, t-SNE, UMAP, autoencoders</td></tr>
  </table>
  <p>Selection methods come in three families, which differ in how much they involve the final model:</p>
  <div class="flow"><span>Filter: score each column with a statistic, no model</span><span>Wrapper: search subsets, scoring each with the model</span><span>Embedded: the model selects while it trains</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Filter methods</strong> rank features by a model-independent statistic. <strong>Wrapper methods</strong> search over feature subsets and evaluate each by training the model. <strong>Embedded methods</strong> perform selection as part of training (L1 penalties, tree splits).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Reduce dimensions" does not automatically mean PCA. If the goal is a cheaper, explainable model that needs fewer measurements, selection is the right tool; PCA still needs every original column at prediction time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: filter methods.</b> We chose selection. Now we need the cheapest possible test of whether a single column deserves to stay.</div>

  <h2 id="dr-filter"><span class="num">05</span>Filter Methods</h2>
  <p><strong>The question we can't answer yet.</strong> Given one column of our 10 tumours, how do we put a number on "is this worth keeping?" without training any model? Each score below answers a question the previous one could not.</p>
  <h3>Variance threshold: which columns cannot possibly help?</h3>
  <p>A column that is the same for every tumour cannot tell tumours apart. For a 0/1 column where a share p of rows are 1, the variance is <strong>p(1 − p)</strong>. By hand on our table (population variance, divide by n = 10):</p>
  <table class="tbl"><caption>Variance by hand on the 10 tumours</caption>
    <tr><th>column</th><th>calculation</th><th>variance</th></tr>
    <tr><td>scanner</td><td>all 1: constant</td><td>0</td></tr>
    <tr><td>rare_flag</td><td>p = 1/10: 0.1 × 0.9</td><td>0.09</td></tr>
    <tr><td>big</td><td>p = 4/10: 0.4 × 0.6</td><td>0.24</td></tr>
    <tr><td>radius</td><td>mean 14; deviations −4 −3 −2 −1 0 −1 1 2 3 5; squares sum 70; 70/10</td><td>7.00</td></tr>
  </table>
  <p>A common rule drops binary columns that are more than 80% one value: threshold = 0.8 × 0.2 = <strong>0.16</strong>. That drops scanner (0) and rare_flag (0.09) and keeps everything else.</p>
  <div class="fx" data-lang="py">from sklearn.feature_selection import VarianceThreshold
from tumours import mini
X = mini.drop(columns="malignant")
print(X.var(ddof=0).round(3).to_string())        # population variance, as sklearn uses
vt = VarianceThreshold(threshold=0.8 * (1 - 0.8)).fit(X)   # drop binary columns &gt;80% one value
print("dropped:", list(X.columns[~vt.get_support()]))</div>
  <div class="fx" data-lang="text">radius         7.00
perimeter    284.96
texture       10.69
smooth         2.00
scanner        0.00
rare_flag      0.09
big            0.24
dropped: ['scanner', 'rare_flag']</div>
  <p><code>VarianceThreshold</code> never looks at the label, so it is safe and cheap: a good first cleaning step. <code>get_support()</code> returns the True/False mask of kept columns. Notice perimeter's variance 284.96 vs radius's 7.00: variance depends on units (perimeter is about 6.3× radius, so its variance is about 40× larger), so variances only compare fairly between binary or same-unit columns.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A rare column is not always useless: "had a previous biopsy" may be 1 for 2% of patients and be very predictive. Use the threshold to remove constants and junk, not as a relevance test.</p>
  </div>
  <h3>Correlation: does the column move with the label, and does it repeat another?</h3>
  <p>Variance says a column changes; it does not say the change has anything to do with malignancy (smooth changes, variance 2, but is unrelated). Pearson correlation measures how well two columns line up on a straight line, from −1 to +1: r = Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² · Σ(y − ȳ)²). By hand for radius vs malignant (a 0/1 label is allowed; this is called the point-biserial correlation):</p>
  <table class="tbl"><caption>radius vs malignant; means 14 and 0.5</caption>
    <tr><th>tumour</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>sum</th></tr>
    <tr><td>x − 14</td><td>−4</td><td>−3</td><td>−2</td><td>−1</td><td>0</td><td>−1</td><td>1</td><td>2</td><td>3</td><td>5</td><td></td></tr>
    <tr><td>y − 0.5</td><td>−.5</td><td>−.5</td><td>−.5</td><td>−.5</td><td>−.5</td><td>.5</td><td>.5</td><td>.5</td><td>.5</td><td>.5</td><td></td></tr>
    <tr><td>product</td><td>2</td><td>1.5</td><td>1</td><td>.5</td><td>0</td><td>−.5</td><td>.5</td><td>1</td><td>1.5</td><td>2.5</td><td><b>10</b></td></tr>
  </table>
  <p>Σ(x − x̄)² = 70 (from the variance table), Σ(y − ȳ)² = 10 × 0.25 = 2.5. So r = 10 / √(70 × 2.5) = 10 / 13.23 = <strong>0.756</strong>. Correlation is used twice: <em>relevance</em> (|r| with the label) and <em>redundancy</em> (r between two features; above about 0.9, keep one).</p>
  <div class="fx" data-lang="py">from tumours import mini
cols = ["radius", "perimeter", "texture", "smooth", "malignant"]
C = mini[cols].corr()
print(C.round(3))
print("\\n|corr with malignant|:", C["malignant"].drop("malignant").abs().sort_values(ascending=False).round(3).to_dict())</div>
  <div class="fx" data-lang="text">           radius  perimeter  texture  smooth  malignant
radius      1.000      0.999    0.751  -0.027      0.756
perimeter   0.999      1.000    0.753  -0.029      0.770
texture     0.751      0.753    1.000   0.151      0.642
smooth     -0.027     -0.029    0.151   1.000      0.000
malignant   0.756      0.770    0.642   0.000      1.000

|corr with malignant|: {'perimeter': 0.77, 'radius': 0.756, 'texture': 0.642, 'smooth': 0.0}</div>
  <p>Relevance: perimeter 0.770, radius 0.756 (our hand value), texture 0.642, smooth exactly 0.000. Redundancy: radius and perimeter correlate <strong>0.999</strong>, so a correlation filter keeps one of them (perimeter, slightly higher relevance) and drops the other. Texture correlates 0.75 with size, so it is partly redundant too.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pearson r only sees straight-line relations. A U-shaped relation can have r ≈ 0 and still be perfectly predictive (we show r = 0.08 below). Use Spearman for monotone curves and mutual information for any shape.</p>
  </div>
  <h3>χ² (chi-square): is a yes/no feature related to a yes/no label?</h3>
  <p>Correlation needs numbers. Many features are categories: "is the tumour big?", "which hospital?", "does the email contain 'free'?". For categories we count. The contingency table of <code>big</code> vs <code>malignant</code>:</p>
  <table class="tbl"><caption>Observed counts O</caption>
    <tr><th></th><th>benign</th><th>malignant</th><th>row total</th></tr>
    <tr><td>big = 0</td><td>5</td><td>1</td><td>6</td></tr>
    <tr><td>big = 1</td><td>0</td><td>4</td><td>4</td></tr>
    <tr><td>column total</td><td>5</td><td>5</td><td>n = 10</td></tr>
  </table>
  <p>If big and malignant were unrelated, each cell would hold its <strong>expected count</strong> E = row total × column total / n: big=0 &amp; benign: 6 × 5 / 10 = 3; big=0 &amp; malignant: 3; big=1 &amp; benign: 4 × 5 / 10 = 2; big=1 &amp; malignant: 2. The χ² statistic adds up the squared gaps between observed and expected, scaled by expected:</p>
  <p>χ² = Σ (O − E)²/E = (5 − 3)²/3 + (1 − 3)²/3 + (0 − 2)²/2 + (4 − 2)²/2 = 1.333 + 1.333 + 2 + 2 = <strong>6.667</strong>.</p>
  <p>With (2 − 1)(2 − 1) = 1 degree of freedom, 6.667 has a p-value of about 0.0098: unlikely if big and malignant were independent. Higher χ² = stronger dependence = keep.</p>
  <div class="fx" data-lang="py">import pandas as pd
from scipy.stats import chi2_contingency
from sklearn.feature_selection import chi2
from tumours import mini
table = pd.crosstab(mini.big, mini.malignant)          # rows big 0/1, columns malignant 0/1
print(table, "\\n")
stat, p, dof, expected = chi2_contingency(table, correction=False)
print("expected:\\n", expected)
print(f"full 2x2 chi2 = {stat:.3f}, dof = {dof}, p = {p:.4f}")
s, pv = chi2(mini[["big"]], mini.malignant)
print(f"sklearn chi2 = {s[0]:.3f}, p = {pv[0]:.4f}")</div>
  <div class="fx" data-lang="text">malignant  0  1
big            
0          5  1
1          0  4 

expected:
 [[3. 3.]
 [2. 2.]]
full 2x2 chi2 = 6.667, dof = 1, p = 0.0098
sklearn chi2 = 4.000, p = 0.0455</div>
  <p>scipy reproduces the expected table and 6.667. sklearn's <code>chi2</code> gives <strong>4.000</strong>: it treats each feature as a count (like word counts) and uses only the "feature present" row: (0 − 2)²/2 + (4 − 2)²/2 = 4. For ranking count features this works well and is what <code>SelectKBest(chi2)</code> uses, but feature values must be non-negative and the numbers will not match a textbook χ² test.</p>
  <h3>ANOVA F: is a numeric column's class difference bigger than its noise?</h3>
  <p>χ² handles categories, and r handles a straight line against the label. A cleaner question for a numeric feature and a class label: are the class means far apart <em>compared with the spread inside each class</em>? For radius: benign 10, 11, 12, 13, 14 (mean 12); malignant 13, 15, 16, 17, 19 (mean 16); overall mean 14.</p>
  <ul>
    <li>Between-class sum of squares = 5·(12 − 14)² + 5·(16 − 14)² = 40, with 2 − 1 = 1 degree of freedom → mean square 40.</li>
    <li>Within-class sum of squares: benign deviations −2, −1, 0, 1, 2 → 10; malignant −3, −1, 0, 1, 3 → 20; total 30, with 10 − 2 = 8 degrees of freedom → mean square 3.75.</li>
    <li><strong>F = 40 / 3.75 = 10.67</strong>. For smooth both class means are 10, so the between part is 0 and F = 0.</li>
  </ul>
  <div class="fx" data-lang="py">from sklearn.feature_selection import f_classif
from tumours import mini
F, p = f_classif(mini[["radius", "texture", "smooth"]], mini.malignant)
for name, f, pv in zip(["radius", "texture", "smooth"], F, p):
    print(f"{name:8s} F = {f:6.3f}  p = {pv:.4f}")</div>
  <div class="fx" data-lang="text">radius   F = 10.667  p = 0.0114
texture  F =  5.618  p = 0.0452
smooth   F =  0.000  p = 1.0000</div>
  <p><code>f_classif</code> is the default scorer of <code>SelectKBest</code>; texture scores in between (5.618). For a numeric target, <code>f_regression</code> does the same job via correlation with y. (For two classes, F is a rescaled r²: both rank columns the same way.)</p>
  <h3>Mutual information: is there any dependence at all, even curved?</h3>
  <p>All previous scores look for one particular shape (different counts, different means, a straight line). Mutual information asks the general question: how much does knowing the feature reduce my uncertainty about the label? It is 0 only under independence and positive for any kind of relation:</p>
  <p><strong>MI(X; Y) = Σ p(x, y) · log [ p(x, y) / (p(x) · p(y)) ]</strong></p>
  <p>Each term compares how often a pair actually happens, p(x, y), with how often it would happen under independence, p(x)·p(y). By hand for big vs malignant (counts ÷ 10): p(big=1) = 0.4, p(malignant) = 0.5.</p>
  <table class="tbl"><caption>MI by hand, log base 2 (bits)</caption>
    <tr><th>cell</th><th>p(x,y)</th><th>p(x)p(y)</th><th>ratio</th><th>p · log₂ ratio</th></tr>
    <tr><td>big=0, benign</td><td>0.5</td><td>0.6 × 0.5 = 0.3</td><td>1.667</td><td>0.5 × 0.737 = 0.368</td></tr>
    <tr><td>big=0, malignant</td><td>0.1</td><td>0.3</td><td>0.333</td><td>0.1 × (−1.585) = −0.158</td></tr>
    <tr><td>big=1, benign</td><td>0</td><td>0.4 × 0.5 = 0.2</td><td>0</td><td>0 (0·log 0 counts as 0)</td></tr>
    <tr><td>big=1, malignant</td><td>0.4</td><td>0.2</td><td>2</td><td>0.4 × 1 = 0.400</td></tr>
    <tr><td colspan="4"><b>MI</b></td><td><b>0.610 bits</b></td></tr>
  </table>
  <p>The label has entropy 1 bit (5/5 split), so knowing "big" removes 61% of the uncertainty. MI is the same quantity a decision tree calls <em>information gain</em> (see <a class="xref" data-note="ml_dtree">Decision Trees</a>). sklearn reports nats (natural log): 0.610 × ln 2 = 0.423.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
from tumours import mini
mi = mutual_info_classif(mini[["big"]], mini.malignant, discrete_features=True)[0]
print(f"MI(big; malignant) = {mi:.4f} nats = {mi / np.log(2):.4f} bits")

# a curved relationship: a lab value where BOTH too low and too high are bad
rng = np.random.default_rng(0)
x = rng.uniform(-3, 3, 500)                              # lab value, centred on "normal"
risk = x ** 2 + rng.normal(0, 0.5, 500)                  # U-shaped risk
noise = rng.uniform(-3, 3, 500)                          # an unrelated column
print("corr(x, risk) =", round(np.corrcoef(x, risk)[0, 1], 3), "  corr(noise, risk) =", round(np.corrcoef(noise, risk)[0, 1], 3))
m = mutual_info_regression(np.c_[x, noise], risk, random_state=0)
print("MI(x, risk)   =", round(m[0], 3), "  MI(noise, risk)   =", round(m[1], 3))</div>
  <div class="fx" data-lang="text">MI(big; malignant) = 0.4228 nats = 0.6100 bits
corr(x, risk) = 0.08   corr(noise, risk) = 0.015
MI(x, risk)   = 1.541   MI(noise, risk)   = 0.02</div>
  <p>The first line matches the hand table. The second part shows why MI matters: for a lab value where <em>both</em> too low and too high are risky (a U-shape), Pearson r is 0.08, no better than an unrelated column (0.015), while MI scores it 1.541 vs 0.02. For continuous columns sklearn estimates MI from nearest-neighbour distances (the Kraskov estimator), so it is noisy on small data and depends on <code>random_state</code>.</p>
  <table class="tbl"><caption>Which filter score for which column types</caption>
    <tr><th>feature \\ target</th><th>categorical target</th><th>numeric target</th></tr>
    <tr><td>categorical / counts</td><td><code>chi2</code>, <code>mutual_info_classif</code></td><td><code>mutual_info_regression</code></td></tr>
    <tr><td>numeric</td><td><code>f_classif</code>, <code>mutual_info_classif</code></td><td><code>f_regression</code>, <code>r_regression</code>, <code>mutual_info_regression</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>χ²</strong> = Σ (O − E)²/E with E = row total × column total / n. <strong>ANOVA F</strong> = between-group mean square / within-group mean square. <strong>Mutual information</strong> MI(X;Y) = Σ p(x,y) log [p(x,y)/(p(x)p(y))] = H(Y) − H(Y|X) ≥ 0, zero only under independence. <code>SelectKBest(score_func, k)</code> keeps the k highest-scoring columns; <code>SelectPercentile</code> keeps a top percentage.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Filters judge each column <strong>alone</strong>. On our tumours every filter ranks radius and perimeter both near the top, though keeping both adds nothing (r = 0.999). And two columns useless alone but decisive together (XOR-like interactions) both score 0 and get dropped.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: wrapper methods.</b> Filters rank columns one by one. They cannot tell us which <em>set</em> of columns works best together, because they never ask the model.</div>

  <h2 id="dr-wrapper"><span class="num">06</span>Wrapper Methods</h2>
  <p><strong>The question we can't answer yet.</strong> The filters put radius and perimeter both near the top, but together they are one column twice. Which <em>combination</em> of columns gives the best model? The only way to know is to train the model on combinations and compare.</p>
  <p>Trying every subset of d columns means 2^d models: 1,024 for d = 10, about 10^9 for our 30 columns. So wrappers search greedily.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Picking a cricket XI by trials. Forward selection: start with nobody, add whichever player improves the team's trial result most, repeat. Backward elimination: start with the whole squad, drop whoever's absence hurts least, repeat.</p>
  </div>
  <h3>Forward selection, traced</h3>
  <p>Model: scaled logistic regression on all 569 tumours; score: 5-fold CV accuracy.</p>
  <ol>
    <li><strong>Step 1</strong>: try each of the 30 columns alone. Best: worst perimeter (0.917), with worst area (0.917) and worst radius (0.916) just behind: three versions of "size". Add <strong>worst perimeter</strong>.</li>
    <li><strong>Step 2</strong>: try worst perimeter + each of the other 29. The winner is <em>not</em> worst area or worst radius (they repeat size), but <strong>worst smoothness</strong> (0.958): new information. This is exactly what filters cannot do.</li>
    <li><strong>Step 3</strong>: add <strong>mean texture</strong> (0.970). Stop at 3 (or when the gain becomes tiny).</li>
  </ol>
  <p>Cost: 30 + 29 + 28 = 87 subsets × 5 folds = 435 model fits. In general forward selection to k of d columns costs d + (d − 1) + … + (d − k + 1) subsets, at most d(d + 1)/2, instead of 2^d.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
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
print("sklearn forward picks:", [names[i] for i in np.where(sfs.get_support())[0]])
print(f"all 30 features acc = {score(list(range(30))):.3f} | chosen 3 acc = {score(chosen):.3f}")</div>
  <div class="fx" data-lang="text">step 1: worst perimeter 0.917 | worst area 0.917 | worst radius 0.916
step 2: worst smoothness 0.958 | worst texture 0.947 | worst concave points 0.940
step 3: mean texture 0.970 | worst texture 0.970 | worst area 0.961
sklearn forward picks: ['mean texture', 'worst perimeter', 'worst smoothness']
all 30 features acc = 0.979 | chosen 3 acc = 0.970</div>
  <p>The loop prints the top three candidates at each step; <code>SequentialFeatureSelector(direction="forward")</code> picks the same three (listed in column order). Three columns give 0.970 against 0.979 for all thirty. <strong>Backward elimination</strong> (<code>direction="backward"</code>) starts with all columns and removes the one whose removal hurts CV least, repeatedly; it can land on a different set, and costs more when k is much smaller than d.</p>
  <h3>Recursive Feature Elimination (RFE)</h3>
  <p>Backward elimination refits the model for every candidate removal: expensive. RFE asks the model to rank columns itself: fit once, rank by |coefficient| (on standardised data) or <code>feature_importances_</code>, drop the weakest, refit, repeat. One fit per step. By hand on our 10 tumours with four numeric columns:</p>
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
    print("  ".join(f"{names[i]}={c:+.2f}" for i, c in zip(left, coef)), end="")
    worst = left[int(np.argmin(np.abs(coef)))]
    print(f"   -&gt; drop {names[worst]}")
    left.remove(worst)
print("kept by hand:", names[left[0]])
rfe = RFE(LogisticRegression(), n_features_to_select=1).fit(X, y)
print("sklearn ranking_ (1 = kept):", {n: int(r) for n, r in zip(names, rfe.ranking_)})</div>
  <div class="fx" data-lang="text">radius=+0.72  perimeter=+0.80  texture=+0.64  smooth=-0.22   -&gt; drop smooth
radius=+0.72  perimeter=+0.79  texture=+0.57   -&gt; drop texture
radius=+0.82  perimeter=+0.89   -&gt; drop radius
kept by hand: perimeter
sklearn ranking_ (1 = kept): {'radius': 2, 'perimeter': 1, 'texture': 3, 'smooth': 4}</div>
  <p>Round 1: smooth has the smallest |coef| (0.22), so it goes. Round 2: texture (0.57) goes. Round 3: radius (0.82) vs perimeter (0.89): the twins compete and perimeter wins narrowly. sklearn's <code>ranking_</code> records the same order backwards (4 = dropped first, 1 = kept). Note that RFE kept both twins until the very last round: their coefficients share the credit, so neither looks weak. With strong collinearity coefficients can even get inflated and opposite-signed, which misleads coefficient-based ranking.</p>
  <h3>RFECV: how many columns?</h3>
  <p>RFE needs you to say how many columns to keep. <code>RFECV</code> runs RFE inside cross-validation, records the CV score for every subset size, and keeps the best size. On all 569 tumours:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import RFECV
from sklearn.model_selection import StratifiedKFold

X, y = load_breast_cancer(return_X_y=True)
Xs = StandardScaler().fit_transform(X)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
rfecv = RFECV(LogisticRegression(max_iter=5000), step=1, cv=cv, scoring="accuracy", n_jobs=1).fit(Xs, y)
scores = rfecv.cv_results_["mean_test_score"]
print("best number of features:", rfecv.n_features_)
for k in (1, 2, 3, 5, 10, 15, 20, 30):
    print(f"  {k:2d} features -&gt; cv acc {scores[k - 1]:.3f}")</div>
  <div class="fx" data-lang="text">best number of features: 26
   1 features -&gt; cv acc 0.916
   2 features -&gt; cv acc 0.954
   3 features -&gt; cv acc 0.947
   5 features -&gt; cv acc 0.960
  10 features -&gt; cv acc 0.968
  15 features -&gt; cv acc 0.977
  20 features -&gt; cv acc 0.979
  30 features -&gt; cv acc 0.979</div>
  <p>One column gives 0.916, two 0.954, ten 0.968, and the curve is flat from about 15 (0.977–0.979). RFECV picks the maximum, 26, but a sensible engineer would take ~15: within 0.002 of the best with half the measurements (the "one standard error" idea).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sequential forward selection</strong> starts empty and repeatedly adds the feature that most improves the CV score; <strong>backward elimination</strong> starts full and repeatedly removes the feature whose removal hurts least. <strong>RFE</strong> repeatedly fits the model and removes the feature(s) with the smallest importance; <strong>RFECV</strong> chooses the number of features by CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Wrappers can overfit the selection: trying thousands of subsets on few rows finds one that scores well by luck. Report a test score the search never saw, or wrap the search in an outer CV (<a class="xref" data-note="ml_splits">nested CV</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: embedded methods.</b> Wrappers answer "which set?", but at the price of hundreds of fits. Can a model pick its columns during a single training run?</div>

  <h2 id="dr-embedded"><span class="num">07</span>Embedded Methods</h2>
  <p><strong>The question we can't answer yet.</strong> Forward selection on our tumours needed 435 fits for 3 columns. Some models can switch columns off <em>while</em> they train. How, and can they be trusted?</p>
  <h3>L1 (Lasso): coefficients that become exactly zero</h3>
  <p>A model with an L1 penalty minimises its loss + α·Σ|wⱼ|. The absolute value has a corner at 0, so for a weak or redundant feature the cheapest choice is a coefficient of <em>exactly</em> zero, which drops the column (geometry and the 1-D soft-thresholding proof: <a class="xref" data-note="ml_regularization">Regularization</a>, <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). On our 10 tumours (section 10 shows the numbers) L1 logistic regression gives perimeter 1.48, texture 0.15, and radius <strong>0.00</strong>: with the twins it keeps one and zeroes the other. On all 569 tumours, with C = 1/α (small C = strong penalty):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.pipeline import make_pipeline

data = load_breast_cancer()
X, y, names = data.data, data.target, data.feature_names
Xs = StandardScaler().fit_transform(X)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
for C in (0.01, 0.03, 0.1, 0.3, 1.0):                      # small C = strong L1 penalty
    l1 = LogisticRegression(penalty="l1", C=C, solver="liblinear")
    nz = np.flatnonzero(l1.fit(Xs, y).coef_[0])
    acc = cross_val_score(make_pipeline(StandardScaler(), l1), X, y, cv=cv).mean()
    kept = ", ".join(names[nz]) if len(nz) &lt;= 4 else f"{len(nz)} columns"
    print(f"C={C:&lt;5} non-zero={len(nz):2d}  cv acc={acc:.3f}  kept: {kept}")</div>
  <div class="fx" data-lang="text">C=0.01  non-zero= 4  cv acc=0.933  kept: mean concave points, worst radius, worst perimeter, worst concave points
C=0.03  non-zero= 4  cv acc=0.954  kept: mean concave points, worst radius, worst texture, worst concave points
C=0.1   non-zero= 8  cv acc=0.974  kept: 8 columns
C=0.3   non-zero=11  cv acc=0.977  kept: 11 columns
C=1.0   non-zero=15  cv acc=0.977  kept: 15 columns</div>
  <p>C = 0.01 keeps 4 columns (0.933); C = 0.1 keeps 8 (0.974, nearly the full 0.979); C = 1 keeps 16. Look at the two 4-column rows: C = 0.01 keeps worst perimeter, C = 0.03 swaps it for worst texture. Which of a correlated group survives is fragile. <code>SelectFromModel</code> turns any fitted model with <code>coef_</code> or <code>feature_importances_</code> into a selector; for L1 models it keeps the non-zero coefficients.</p>
  <h3>Tree-based importance</h3>
  <p>A tree ensemble ranks columns as a side effect of training. <strong>MDI</strong> (mean decrease in impurity) adds up how much each column's splits reduced impurity on the training data; <strong>permutation importance</strong> shuffles one column on held-out data and measures the score drop (details: <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>).</p>
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
top = np.argsort(rf.feature_importances_)[::-1][:5]
print("top-5 MDI:", [f"{names[i]} {rf.feature_importances_[i]:.3f}" for i in top])
pi = permutation_importance(rf, Xte, yte, n_repeats=10, random_state=0, n_jobs=1)
top = np.argsort(pi.importances_mean)[::-1][:5]
print("top-5 permutation (test):", [f"{names[i]} {pi.importances_mean[i]:.3f}" for i in top])
sfm = SelectFromModel(rf, threshold="median", prefit=True)
print("SelectFromModel(threshold='median') keeps", sfm.get_support().sum(), "of", X.shape[1])
rf2 = RandomForestClassifier(n_estimators=200, random_state=0, n_jobs=1).fit(sfm.transform(Xtr), ytr)
print(f"test acc: all 30 = {rf.score(Xte, yte):.3f} | kept 15 = {rf2.score(sfm.transform(Xte), yte):.3f}")</div>
  <div class="fx" data-lang="text">top-5 MDI: ['worst radius 0.133', 'worst perimeter 0.132', 'worst concave points 0.128', 'worst area 0.108', 'mean concave points 0.098']
top-5 permutation (test): ['worst radius 0.021', 'worst area 0.019', 'worst texture 0.016', 'worst perimeter 0.012', 'worst concave points 0.012']
SelectFromModel(threshold='median') keeps 15 of 30
test acc: all 30 = 0.953 | kept 15 = 0.953</div>
  <p>Both rank the "worst" size and concavity measurements first. MDI splits credit among the size twins (worst radius 0.133, worst perimeter 0.132, worst area 0.108), and permutation importances are small (0.021) because when one twin is shuffled the forest uses the others: the radius/perimeter story again. Keeping the top half by MDI (<code>threshold="median"</code>) gives the same test accuracy, 0.953, with 15 columns instead of 30.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Embedded selection</strong> happens inside training: L1-penalised linear models set some coefficients exactly to zero; tree models assign importances through their split choices. <code>SelectFromModel(estimator, threshold)</code> keeps features whose |coef| or importance exceeds the threshold ("mean", "median", "1.25*mean" or a number).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Coefficient zero" means "not needed given the others", not "unrelated": radius got 0.00 on our tumours although it correlates 0.756 with malignancy. For stable choices use Elastic Net or stability selection (repeat on bootstrap samples, keep columns chosen most often).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: selection without leakage.</b> Every method from χ² onwards used the labels to choose columns. Are the accuracy numbers we then report honest?</div>

  <h2 id="dr-leak"><span class="num">08</span>Selection Without Leakage</h2>
  <p><strong>The question we can't answer yet.</strong> Choosing columns <em>is</em> learning from labels. If we choose them on all rows and then cross-validate, the test folds have already influenced the choice. How big can that error get?</p>
  <p>Imagine the hospital adds 2,000 gene-expression columns measured on 60 tumours, and suppose (to make the truth known) the genes are pure random noise. No model can beat 50% accuracy.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score, StratifiedKFold

rng = np.random.default_rng(0)
X = rng.normal(size=(60, 2000))              # 60 tumours x 2000 "gene" columns that are PURE NOISE
y = np.array([0, 1] * 30)                    # malignant or not: unrelated to X, true accuracy 50%
cv = StratifiedKFold(5, shuffle=True, random_state=0)

# WRONG: pick the 20 "best" columns using ALL rows, then cross-validate
X20 = SelectKBest(f_classif, k=20).fit_transform(X, y)
wrong = cross_val_score(LogisticRegression(max_iter=1000), X20, y, cv=cv).mean()
# RIGHT: selection is a step inside the pipeline, refit within each training fold
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=1000))
right = cross_val_score(pipe, X, y, cv=cv).mean()
print(f"select-then-CV accuracy: {wrong:.3f}   &lt;- looks like a great model")
print(f"select-inside-CV accuracy: {right:.3f} &lt;- the truth: coin flip")</div>
  <div class="fx" data-lang="text">select-then-CV accuracy: 0.883   &lt;- looks like a great model
select-inside-CV accuracy: 0.383 &lt;- the truth: coin flip</div>
  <p>Selecting the 20 "best" noise genes on all 60 tumours and then cross-validating reports <strong>0.883</strong>. Among 2,000 random columns some correlate with the labels <em>on these 60 rows</em> by chance, and selection finds exactly those. With <code>SelectKBest</code> inside the pipeline, each fold selects using its own training rows; the genes chosen there carry nothing about the held-out rows: <strong>0.383</strong>, a coin flip (slightly below 0.5 is normal variation on 12-row folds). This example is famous from <em>The Elements of Statistical Learning</em> (section 7.10.2, "the wrong and the right way to do cross-validation").</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher who picks the exam questions after seeing which ones the class happened to answer correctly in a mock test, then reports the class's "score" on those same questions.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Selection leakage</strong>: feature selection that uses target information from rows later used for evaluation. Fix: make selection a step of a <code>Pipeline</code> so <code>cross_val_score</code> / <code>GridSearchCV</code> refit it inside each training fold (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The danger grows with columns ÷ rows. With 30 columns and 569 tumours the inflation is small; with 2,000 genes and 60 tumours it turns a useless model into a "breakthrough".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the toolbox.</b> We have many methods. Which sklearn class does each, and how do they compare on the real tumours under the same honest CV?</div>

  <h2 id="dr-sklearn"><span class="num">09</span>scikit-learn Toolbox</h2>
  <p><strong>The question we can't answer yet.</strong> Each method so far was shown alone. Under one fair comparison on all 569 tumours, how much accuracy does each family keep with only about 5 columns?</p>
  <table class="tbl">
    <tr><th>Class</th><th>Family</th><th>What it does</th><th>Key parameters</th></tr>
    <tr><td><code>VarianceThreshold</code></td><td>Filter (no y)</td><td>Drops columns with variance ≤ threshold</td><td><code>threshold</code></td></tr>
    <tr><td><code>SelectKBest</code> / <code>SelectPercentile</code></td><td>Filter</td><td>Keeps top k / top % by a score</td><td><code>score_func</code>, <code>k</code>, <code>percentile</code></td></tr>
    <tr><td><code>GenericUnivariateSelect</code></td><td>Filter</td><td>p-value based modes fpr / fdr / fwe</td><td><code>mode</code>, <code>param</code></td></tr>
    <tr><td><code>SequentialFeatureSelector</code></td><td>Wrapper</td><td>Forward or backward greedy search by CV</td><td><code>direction</code>, <code>n_features_to_select</code> ("auto" + <code>tol</code>), <code>cv</code>, <code>scoring</code></td></tr>
    <tr><td><code>RFE</code> / <code>RFECV</code></td><td>Wrapper (model-ranked)</td><td>Recursive elimination by coef/importance</td><td><code>n_features_to_select</code>, <code>step</code>, <code>cv</code>, <code>min_features_to_select</code></td></tr>
    <tr><td><code>SelectFromModel</code></td><td>Embedded</td><td>Keeps features with coef/importance above threshold</td><td><code>threshold</code>, <code>max_features</code>, <code>prefit</code></td></tr>
  </table>
  <p>All are transformers with <code>fit</code>, <code>transform</code>, <code>get_support()</code> and <code>get_feature_names_out()</code>, so they slot into a pipeline. The benchmark runs one representative of each family plus PCA (extraction), all inside the same 5-fold CV.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.decomposition import PCA
from sklearn.feature_selection import (SelectKBest, f_classif, mutual_info_classif, RFE,
                                       SelectFromModel, VarianceThreshold)
from sklearn.model_selection import cross_val_score, StratifiedKFold

X, y = load_breast_cancer(return_X_y=True)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
lr = lambda: LogisticRegression(max_iter=5000)
pipes = {
    "all 30 features":          make_pipeline(StandardScaler(), lr()),
    "filter: ANOVA F, k=5":      make_pipeline(StandardScaler(), SelectKBest(f_classif, k=5), lr()),
    "filter: mutual info, k=5":  make_pipeline(StandardScaler(), SelectKBest(lambda X, y: mutual_info_classif(X, y, random_state=0), k=5), lr()),
    "wrapper: RFE, 5":           make_pipeline(StandardScaler(), RFE(lr(), n_features_to_select=5), lr()),
    "embedded: L1, C=0.05":      make_pipeline(StandardScaler(), SelectFromModel(LogisticRegression(penalty="l1", C=0.05, solver="liblinear")), lr()),
    "extraction: PCA, 5":        make_pipeline(StandardScaler(), PCA(5), lr()),
}
for name, p in pipes.items():
    print(f"{name:26s} cv acc = {cross_val_score(p, X, y, cv=cv).mean():.3f}")
l1 = make_pipeline(StandardScaler(), LogisticRegression(penalty="l1", C=0.05, solver="liblinear")).fit(X, y)
print("L1 (C=0.05) non-zero coefficients on full data:", int((l1[-1].coef_ != 0).sum()))</div>
  <div class="fx" data-lang="text">all 30 features            cv acc = 0.979
filter: ANOVA F, k=5       cv acc = 0.947
filter: mutual info, k=5   cv acc = 0.947
wrapper: RFE, 5            cv acc = 0.968
embedded: L1, C=0.05       cv acc = 0.963
extraction: PCA, 5         cv acc = 0.974
L1 (C=0.05) non-zero coefficients on full data: 7</div>
  <p>All 30 columns: 0.979. Filters' 5 columns (ANOVA F or MI): 0.947, because the 5 individually best columns are mostly size twins. RFE's 5 (chosen with the model, less redundant): 0.968. L1 with 7 non-zero columns: 0.961. PCA with 5 components: 0.974, the best reduced version, because each component blends all 30 columns. Selection rarely <em>beats</em> all features when the model is regularised; its wins are cost, speed, stability and explanation.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>SelectKBest(chi2)</code> after <code>StandardScaler</code> fails: chi2 needs non-negative values. Use chi2 on raw counts/frequencies and f_classif or MI on scaled numeric data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have many scores and methods. How are they built from one another, and which question does each answer?</div>

  <h2 id="dr-connect"><span class="num">10</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> We met a dozen ideas one at a time. How do they depend on each other, and what does each say about the <em>same</em> 10 tumours?</p>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="dr-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="11.5">
<rect x="10" y="10" width="200" height="42" rx="7" class="fr sr"/><text x="110" y="28" text-anchor="middle" font-weight="700">Curse of dimensionality</text><text x="110" y="44" text-anchor="middle" class="tm">sparsity · hollow cube · d/6 vs √d</text>
<rect x="240" y="10" width="200" height="42" rx="7" class="fr sr"/><text x="340" y="28" text-anchor="middle" font-weight="700">Hurts distance models</text><text x="340" y="44" text-anchor="middle" class="tm">kNN 0.965 → 0.805</text>
<rect x="470" y="10" width="200" height="42" rx="7" class="fs" stroke="currentColor"/><text x="570" y="28" text-anchor="middle" font-weight="700">Reduce: select or extract</text><text x="570" y="44" text-anchor="middle" class="tm">extract → PCA note</text>
<line x1="210" y1="31" x2="238" y2="31" stroke="currentColor" marker-end="url(#dr-c)"/><line x1="440" y1="31" x2="468" y2="31" stroke="currentColor" marker-end="url(#dr-c)"/>
<rect x="10" y="90" width="150" height="50" rx="7" class="fb sb"/><text x="85" y="110" text-anchor="middle" font-weight="700">Variance</text><text x="85" y="126" text-anchor="middle" class="tm">mean of squared dev.</text>
<rect x="180" y="90" width="150" height="50" rx="7" class="fb sb"/><text x="255" y="110" text-anchor="middle" font-weight="700">Correlation r</text><text x="255" y="126" text-anchor="middle" class="tm">covariance ÷ (std·std)</text>
<rect x="350" y="90" width="150" height="50" rx="7" class="fb sb"/><text x="425" y="110" text-anchor="middle" font-weight="700">ANOVA F</text><text x="425" y="126" text-anchor="middle" class="tm">between ÷ within var.</text>
<rect x="520" y="90" width="150" height="50" rx="7" class="fb sb"/><text x="595" y="110" text-anchor="middle" font-weight="700">χ² and MI</text><text x="595" y="126" text-anchor="middle" class="tm">observed vs independent</text>
<line x1="160" y1="115" x2="178" y2="115" stroke="currentColor" marker-end="url(#dr-c)"/><line x1="330" y1="115" x2="348" y2="115" stroke="currentColor" marker-end="url(#dr-c)"/>
<line x1="570" y1="52" x2="300" y2="88" stroke="currentColor" marker-end="url(#dr-c)"/>
<text x="20" y="160" class="tb">FILTER: one column at a time, no model</text>
<rect x="60" y="180" width="250" height="50" rx="7" class="ft st"/><text x="185" y="200" text-anchor="middle" font-weight="700">Forward / backward (CV score)</text><text x="185" y="216" text-anchor="middle" class="tm">sets, not single columns</text>
<rect x="370" y="180" width="250" height="50" rx="7" class="ft st"/><text x="495" y="200" text-anchor="middle" font-weight="700">RFE / RFECV</text><text x="495" y="216" text-anchor="middle" class="tm">model's |coef| ranks columns</text>
<line x1="255" y1="140" x2="185" y2="178" stroke="currentColor" marker-end="url(#dr-c)"/><line x1="310" y1="205" x2="368" y2="205" stroke="currentColor" marker-end="url(#dr-c)"/>
<text x="20" y="248" class="tb">WRAPPER: many fits</text>
<rect x="200" y="262" width="280" height="44" rx="7" class="fg sg"/><text x="340" y="281" text-anchor="middle" font-weight="700">Embedded: L1 zeros · tree importance</text><text x="340" y="297" text-anchor="middle" class="tm">one fit; coef ranking without the loop</text>
<line x1="495" y1="230" x2="400" y2="260" stroke="currentColor" marker-end="url(#dr-c)"/>
<rect x="500" y="262" width="170" height="44" rx="7" class="fr sr"/><text x="585" y="281" text-anchor="middle" font-weight="700">All inside CV</text><text x="585" y="297" text-anchor="middle" class="tm">noise: 0.883 vs 0.383</text>
<line x1="480" y1="284" x2="498" y2="284" stroke="currentColor" marker-end="url(#dr-c)"/>
</g>
<text x="20" y="324" class="tm" font-size="11">Each arrow = "is built from" or "fixes the weakness of".</text>
</svg><figcaption>The chain of the note: the curse motivates reduction; filter scores are built from variance and counts; wrappers fix the filters' blindness to sets; embedded methods fold the wrapper's ranking into one fit; everything must sit inside CV.</figcaption></figure>
  <h3>How each score is built from the previous ones</h3>
  <ul>
    <li><strong>Variance</strong> = mean of squared deviations from the mean (radius: 70/10 = 7).</li>
    <li><strong>Correlation</strong> = covariance ÷ (std_x · std_y), where covariance is the mean of products of deviations and std = √variance (radius vs malignant: (10/10) ÷ (√7 · √0.25) = 0.756).</li>
    <li><strong>ANOVA F</strong> splits the same variance into "between class means" and "within classes" parts; for two classes F = (n − 2)·r² / (1 − r²) = 8 · 0.571 / 0.429 = 10.67.</li>
    <li><strong>χ²</strong> and <strong>MI</strong> both compare observed counts with the counts independence predicts (E = row × column / n, or p(x)p(y)); χ² uses squared gaps, MI uses log ratios.</li>
    <li><strong>Forward/backward</strong> replace a statistic with the model's own CV score on sets; <strong>RFE</strong> replaces the CV loop with the model's coefficients; <strong>L1</strong> builds the RFE idea into the loss itself.</li>
  </ul>
  <h3>Every score on the same 10 tumours</h3>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.feature_selection import f_classif, chi2, mutual_info_classif, RFE
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from tumours import mini
y = mini.malignant
cols = ["radius", "perimeter", "texture", "smooth", "scanner", "rare_flag", "big"]
X = mini[cols]
var = X.var(ddof=0)
r = X.apply(lambda c: np.corrcoef(c, y)[0, 1] if c.std() &gt; 0 else np.nan)
F = pd.Series(f_classif(X, y)[0], index=cols)
mi = pd.Series(mutual_info_classif(X[["rare_flag", "big"]], y, discrete_features=True) / np.log(2), index=["rare_flag", "big"])
num = ["radius", "perimeter", "texture", "smooth"]
Xs = StandardScaler().fit_transform(mini[num])
rank = pd.Series(RFE(LogisticRegression(), n_features_to_select=1).fit(Xs, y).ranking_, index=num)
l1 = pd.Series(LogisticRegression(penalty="l1", C=1.0, solver="liblinear").fit(Xs, y).coef_[0], index=num)
out = pd.DataFrame({"variance": var.round(2), "|r| with y": r.abs().round(3), "F": F.round(2),
                    "MI bits": mi.round(3), "RFE rank": rank, "L1 coef": l1.round(2)})
out = out.reindex(cols); out["RFE rank"] = out["RFE rank"].map(lambda v: "-" if pd.isna(v) else str(int(v)))
print(out.to_string(na_rep="-"))</div>
  <div class="fx" data-lang="text">           variance  |r| with y      F  MI bits RFE rank  L1 coef
radius         7.00       0.756  10.67        -        2     0.00
perimeter    284.96       0.770  11.66        -        1     1.48
texture       10.69       0.642   5.62        -        3     0.15
smooth         2.00       0.000   0.00        -        4     0.00
scanner        0.00           -      -        -        -        -
rare_flag      0.09       0.333   1.00    0.108        -        -
big            0.24       0.816  16.00    0.610        -        -</div>
  <p>Read across a row and the whole note appears. <strong>scanner</strong> fails at the first gate (variance 0). <strong>rare_flag</strong> is dropped by the variance threshold (0.09) and is weak everywhere. <strong>smooth</strong> has variance but r = 0, F = 0, RFE drops it first and L1 zeroes it: irrelevant. <strong>radius</strong> and <strong>perimeter</strong> score almost identically on every filter (r 0.756 / 0.770, F 10.67 / 11.66), yet the model-based methods keep only one: RFE ranks radius 2nd and L1 sets it to 0.00. That is redundancy, visible only to wrappers and embedded methods. <strong>texture</strong> is moderately relevant. <strong>big</strong> has the strongest F (16) because it is a clean threshold on size.</p>
  <table class="tbl"><caption>Which concept answers which question</caption>
    <tr><th>Concept</th><th>Question it answers</th><th>Needs y?</th><th>Sees redundancy?</th><th>Robust to…</th><th>Use when</th></tr>
    <tr><td>Variance threshold</td><td>Does the column ever change?</td><td>No</td><td>No</td><td>—; unit-dependent</td><td>First cleanup of constants</td></tr>
    <tr><td>Correlation r</td><td>Straight-line link to y / to another feature?</td><td>Yes (relevance)</td><td>Pairwise only</td><td>Not outliers; not curves</td><td>Numeric columns; redundancy check</td></tr>
    <tr><td>χ²</td><td>Category counts differ from independence?</td><td>Yes</td><td>No</td><td>Needs counts ≥ ~5 per cell</td><td>Categorical / count features</td></tr>
    <tr><td>ANOVA F</td><td>Class means apart vs noise?</td><td>Yes</td><td>No</td><td>Sensitive to outliers</td><td>Numeric feature, class target</td></tr>
    <tr><td>Mutual information</td><td>Any dependence at all?</td><td>Yes</td><td>No</td><td>Any shape; noisy estimate</td><td>Non-linear relations</td></tr>
    <tr><td>Forward / backward</td><td>Best set for this model?</td><td>Yes</td><td>Yes</td><td>Can overfit the search</td><td>Moderate d, budget for fits</td></tr>
    <tr><td>RFE / RFECV</td><td>Which columns does the model lean on least?</td><td>Yes</td><td>Partly</td><td>Misled by collinear coefs</td><td>Linear models, trees</td></tr>
    <tr><td>L1 / tree importance</td><td>Which columns survive one penalised fit?</td><td>Yes</td><td>Picks one of twins</td><td>Unstable among twins</td><td>Large d, one fit budget</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Filters ask "is this column related to y?"; wrappers and embedded methods ask "is this column needed <em>given the others</em>?". The radius/perimeter pair is the clearest example: related, but not needed together.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: PCA.</b> Selection had to choose between radius and perimeter. It cannot <em>merge</em> them, or merge 30 overlapping measurements into 5 summary numbers. That is the job of <a class="xref" data-note="ml_pca">PCA</a>.</div>

  <h2 id="dr-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: selecting features on the full dataset before CV</span>
    <p>Noise genes scored 0.883 that way and 0.383 done correctly. Put every selector inside a Pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting correlation to find all useful features</span>
    <p>The U-shaped lab value had r = 0.08 but MI = 1.54. Correlation sees only straight lines.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "top k individually best" = "best k together"</span>
    <p>Filters' 5 columns: 0.947; RFE's 5: 0.968. Individually strong columns are often twins (radius/perimeter r = 0.999).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing variances or coefficients across units</span>
    <p>Perimeter's variance (285) dwarfs radius's (7) only because of units. Standardise before comparing coefficients or using RFE on linear models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting sklearn chi2 to match the textbook</span>
    <p>It uses only the "present" cells (4.000 vs 6.667) and needs non-negative features.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading an L1 zero as "unrelated"</span>
    <p>Radius got 0.00 while correlating 0.756 with malignancy: it was redundant, not irrelevant.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming the curse always applies</span>
    <p>Real tumours in 30-D kept a 3.89× nearest/farthest contrast. Correlated features have a small intrinsic dimension; noise columns are the real danger.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "dimensionality reduction" = always PCA</span>
    <p>PCA still needs all original columns and loses names. If the goal is fewer measurements or explanation, select.</p>
  </div>

  <div class="bridge"><b>What this still can't tell us → next: the revision sheet, then PCA.</b> Every trap above is about choosing or judging columns one by one. Merging overlapping columns is the job of <a class="xref" data-note="ml_pca">PCA</a>; first, the whole note condensed.</div>

  <h2 id="dr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>This section stands alone: the whole note in one place.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Dimension</strong>: each column is an axis; d columns → points in d-D space.</li>
    <li><strong>Sparsity</strong>: 10^d boxes for n rows → almost all empty when d is large.</li>
    <li><strong>Hollow cube / wide neighbourhoods</strong>: 1 − 0.9^d of volume is near an edge; a 10% neighbourhood needs edge 0.1^(1/d).</li>
    <li><strong>Distance concentration</strong>: mean squared distance d/6, spread ∝ √d → all distances look alike.</li>
    <li><strong>Effect on models</strong>: noise columns wreck distance-based models (kNN 0.965 → 0.805), trees resist.</li>
    <li><strong>Selection vs extraction</strong>: keep original columns vs build new ones.</li>
    <li><strong>Variance threshold</strong>: drop columns that never change.</li>
    <li><strong>Correlation</strong>: relevance to y and redundancy between features, straight lines only.</li>
    <li><strong>χ²</strong>: categorical feature vs class, counts vs independence.</li>
    <li><strong>ANOVA F</strong>: numeric feature vs class, between ÷ within.</li>
    <li><strong>Mutual information</strong>: any dependence, any shape.</li>
    <li><strong>Forward/backward</strong>: greedy search over sets using the model's CV score.</li>
    <li><strong>RFE/RFECV</strong>: drop the smallest |coef| repeatedly; CV picks the count.</li>
    <li><strong>Embedded</strong>: L1 zeros and tree importances in one fit.</li>
    <li><strong>Leakage</strong>: all selection inside CV folds via a Pipeline.</li>
  </ol>
  <h3>Formulas and what each symbol means</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>Meaning</th></tr>
    <tr><td>boxes = b^d</td><td>b bins per feature, d features</td><td>Space to fill grows exponentially</td></tr>
    <tr><td>near-edge share = 1 − (1 − 2ε)^d</td><td>ε band width (0.05)</td><td>Most volume is at the boundary</td></tr>
    <tr><td>ℓ = f^(1/d)</td><td>f fraction of data wanted (0.1), ℓ edge length</td><td>Neighbourhoods span almost all of each axis</td></tr>
    <tr><td>E[‖a − b‖²] = d/6; std/mean = √(7/(5d))</td><td>a, b uniform in [0,1]^d</td><td>Distances concentrate like 1/√d</td></tr>
    <tr><td>Var = (1/n) Σ (x − x̄)²; binary: p(1 − p)</td><td>x̄ mean, p share of 1s</td><td>How much a column changes</td></tr>
    <tr><td>r = Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)² Σ(y−ȳ)²)</td><td>x feature, y target or 2nd feature</td><td>Straight-line association, −1..1</td></tr>
    <tr><td>χ² = Σ (O − E)²/E, E = row·col/n</td><td>O observed, E expected count</td><td>Dependence of categories; dof (r−1)(c−1)</td></tr>
    <tr><td>F = [SS_between/(k−1)] / [SS_within/(n−k)]</td><td>k classes, n rows</td><td>Class-mean separation vs noise</td></tr>
    <tr><td>MI = Σ p(x,y) log p(x,y)/(p(x)p(y))</td><td>joint and marginal probabilities</td><td>Uncertainty about y removed by x</td></tr>
    <tr><td>forward cost ≈ d + (d−1) + … + (d−k+1) subsets</td><td>k columns chosen of d</td><td>vs 2^d exhaustive</td></tr>
    <tr><td>min loss + α Σ|wⱼ| (C = 1/α)</td><td>wⱼ coefficients</td><td>L1: some wⱼ exactly 0</td></tr>
  </table>
  <h3>The running example in one table (10 tumours, label = malignant)</h3>
  <table class="tbl">
    <tr><th>column</th><th>variance</th><th>|r|</th><th>F</th><th>χ² / MI</th><th>RFE rank</th><th>L1 coef</th><th>verdict</th></tr>
    <tr><td>radius</td><td>7.00</td><td>0.756</td><td>10.67</td><td>—</td><td>2</td><td>0.00</td><td>relevant but redundant with perimeter</td></tr>
    <tr><td>perimeter</td><td>284.96</td><td>0.770</td><td>11.66</td><td>—</td><td>1</td><td>1.48</td><td>keep (one of the twins)</td></tr>
    <tr><td>texture</td><td>10.69</td><td>0.642</td><td>5.62</td><td>—</td><td>3</td><td>0.15</td><td>moderately useful</td></tr>
    <tr><td>smooth</td><td>2.00</td><td>0.000</td><td>0.00</td><td>—</td><td>4</td><td>0.00</td><td>irrelevant</td></tr>
    <tr><td>scanner</td><td>0</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>constant: drop first</td></tr>
    <tr><td>rare_flag</td><td>0.09</td><td>0.333</td><td>1.00</td><td>MI 0.108 bits</td><td>—</td><td>—</td><td>near-constant: dropped at 0.16</td></tr>
    <tr><td>big</td><td>0.24</td><td>0.816</td><td>16.00</td><td>χ² 6.667 (sklearn 4.0), MI 0.610 bits</td><td>—</td><td>—</td><td>strong</td></tr>
  </table>
  <p>Full data (569 × 30, logistic regression, 5-fold CV): all 30 = 0.979; forward 3 (worst perimeter, worst smoothness, mean texture) = 0.970; filter 5 = 0.947; RFE 5 = 0.968; L1 = 0.961; PCA 5 = 0.974. kNN with 0 / 1,000 noise columns: 0.965 / 0.805; forest 0.965 / 0.946. Leakage demo: 0.883 wrong vs 0.383 right.</p>
  <h3>When to use what</h3>
  <div class="cards">
    <div><b>Filter</b><p>Very wide data (text, genes), quick first pass, model-agnostic. Not for interactions or redundancy.</p><small>VarianceThreshold, SelectKBest</small></div>
    <div><b>Wrapper</b><p>Moderate d, the best set for one specific model, budget for many fits. Guard against overfitting the search.</p><small>SequentialFeatureSelector, RFECV</small></div>
    <div><b>Embedded</b><p>Large d, one training run, linear (L1) or tree models. Unstable between correlated twins.</p><small>SelectFromModel</small></div>
    <div><b>Extraction instead</b><p>Many correlated columns, names not needed, all inputs available at prediction time.</p><small>PCA (next note)</small></div>
  </div>
  <h3>Key traps</h3>
  <ul>
    <li>Select inside CV (Pipeline), never on all rows first.</li>
    <li>Correlation misses curves; MI does not.</li>
    <li>Individually best ≠ best together (twins).</li>
    <li>Scale before comparing variances or coefficients.</li>
    <li>sklearn chi2 ≠ textbook χ²; needs non-negative inputs.</li>
    <li>An L1 zero means "redundant given the others", not "unrelated".</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>What share of a 30-D unit cube is within 0.05 of a face? <em>1 − 0.9^30 = 0.958.</em></li>
    <li>Variance of a 0/1 column with 1 in 10 rows? <em>0.1 × 0.9 = 0.09.</em></li>
    <li>Expected count for big=1 &amp; malignant with row total 4, column total 5, n = 10? <em>4 × 5 / 10 = 2.</em></li>
    <li>Forward selection of 3 from 30 with 5-fold CV: how many fits? <em>(30 + 29 + 28) × 5 = 435.</em></li>
    <li>Why did L1 zero radius but keep perimeter? <em>They correlate 0.999; L1 keeps one of a redundant pair.</em></li>
  </ol>

  <h2 id="dr-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the curse of dimensionality? Give concrete effects with numbers.</summary><div class="qa-body">As d grows with fixed n the space grows exponentially, so data becomes sparse (10 bins per axis: 10^30 boxes for 569 tumours in 30-D). 1 − 0.9^d of the cube is near an edge (0.958 at d = 30). A neighbourhood with 10% of the data has edge 0.1^(1/d) (0.926 at d = 30). Distances concentrate: mean squared distance d/6, std/mean = √(7/(5d)), so the farthest/nearest ratio for uniform data fell from 67 (2-D) to 1.11 (1,000-D).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models suffer most from many irrelevant features, and why?</summary><div class="qa-body">Distance-based ones (kNN, k-means, DBSCAN, RBF SVM): the distance sums over every column, so noise drowns signal. Tumours 5-NN fell from 0.965 to 0.805 with 1,000 noise columns; a random forest only to 0.946 because each split picks one column. Linear models overfit as d approaches n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does dimensionality reduction work if high-D space is so empty?</summary><div class="qa-body">Real features are correlated, so data lies on a low-dimensional manifold: intrinsic dimension ≪ number of columns. The real tumours in 30-D kept a nearest/farthest contrast of 3.89 vs 1.91 for uniform 30-D noise. Reduction methods find that smaller description.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Feature selection vs extraction?</summary><div class="qa-body">Selection keeps a subset of original columns: names survive, fewer measurements to collect, explainable. Extraction builds new columns from all originals (PCA, LDA, UMAP): merges many weak correlated columns, but new axes have no names and every original column is still needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute χ² for big vs malignant: counts (big=0: 5 benign, 1 malignant; big=1: 0 benign, 4 malignant).</summary><div class="qa-body">Expected = row × column / n: 3, 3, 2, 2. χ² = 4/3 + 4/3 + 4/2 + 4/2 = 6.667 with 1 dof, p ≈ 0.0098. sklearn's chi2 gives 4.000 because it uses only the "feature present" row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the ANOVA F for radius: benign 10–14 (mean 12), malignant 13, 15, 16, 17, 19 (mean 16).</summary><div class="qa-body">Overall mean 14. Between SS = 5·4 + 5·4 = 40, df 1. Within SS = 10 + 20 = 30, df 8 → 3.75. F = 40 / 3.75 = 10.67. Equivalently F = (n − 2) r²/(1 − r²) with r = 0.756.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is mutual information better than correlation?</summary><div class="qa-body">For non-linear or non-monotone relations: a U-shaped lab value had r = 0.08 but MI = 1.54 vs 0.02 for noise. MI is zero only under independence. Downside: noisy estimates for continuous data on small samples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Filter vs wrapper vs embedded: trade-offs?</summary><div class="qa-body">Filter: fastest, model-free, ignores redundancy and interactions (keeps both radius and perimeter). Wrapper: searches sets with the real model (forward chose worst smoothness over size twins at step 2), but costs many fits and can overfit the search. Embedded: selection in one fit (L1 zeros, importances); correlated twins are picked arbitrarily or share credit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does RFE work and what can mislead it?</summary><div class="qa-body">Fit, rank by |coef| (standardised) or importance, drop the weakest, refit, repeat until k remain; RFECV picks k by CV. On the 10 tumours it dropped smooth, then texture, then radius. Collinearity misleads it: correlated columns share or inflate coefficients, so neither twin looks weak until the end, and coefficient size can reflect collinearity rather than usefulness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You selected 20 of 2,000 features using all data, then got 88% CV accuracy. What's wrong?</summary><div class="qa-body">Selection leakage: test-fold labels influenced the selection. On pure noise genes this gave 0.883; selection inside each fold gave 0.383 (chance). Put SelectKBest in a Pipeline and keep an untouched test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lasso dropped a feature you know matters. Why?</summary><div class="qa-body">It is probably correlated with a kept feature: L1 keeps one of a correlated group (radius got 0.00 next to perimeter 1.48, r = 0.999). Zero means "not needed given the others". Use Elastic Net or stability selection for steadier choices.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many fits does forward selection of 3 from 30 features take with 5-fold CV? Exhaustive?</summary><div class="qa-body">(30 + 29 + 28) × 5 = 435 fits. Exhaustive over all subsets: (2^30 − 1) × 5 ≈ 5.4 billion; even only size-3 subsets C(30,3) = 4,060 × 5 = 20,300.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does this note lead to PCA, and when prefer PCA over selection?</summary><div class="qa-body">Selection must choose between radius and perimeter; it cannot merge overlapping columns. PCA merges them into uncorrelated components and kept more accuracy with 5 columns (0.974 vs 0.968 for RFE's best 5). Prefer PCA when names do not matter and all inputs remain available; prefer selection for explanation or cheaper data collection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Mutual information appeared in decision trees too. Where?</summary><div class="qa-body">Information gain at a split = MI between the split feature and the label on that node's rows: H(Y) − H(Y | X). A filter computes it once on all rows; a tree recomputes it at every node. See <a class="xref" data-note="ml_dtree">Decision Trees</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Why does the curse matter for clustering, t-SNE and UMAP?</summary><div class="qa-body">All start from distances or nearest neighbours. When distances concentrate, neighbours become arbitrary, so the standard recipe is scale → remove useless columns → PCA to ~50 dimensions → then cluster or run <a class="xref" data-note="ml_tsne">t-SNE</a> / <a class="xref" data-note="ml_umap">UMAP</a>.</div></details>
</main>
`
});
