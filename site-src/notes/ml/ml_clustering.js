// notes/ml/ml_clustering.js — Clustering: The Idea & Distances
Object.assign(TOPIC_CONTENT, {
  "ml_clustering": `<main>
  <h1>Clustering: The Idea &amp; Distances</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>The Idea &amp; Distances</span></div>
  <p class="lead">Clustering finds groups in a table that has no answer column. Every clustering algorithm rests on one question, "how similar are these two rows?", so this note answers that question completely before any algorithm appears. One small story runs through the whole note: six customers of a neighbourhood shop, A to F. On those same six rows we compute Euclidean, Manhattan, Minkowski and Chebyshev distance, cosine similarity, Jaccard and Gower distance, watch scaling change who is "nearest", and let four families of algorithms disagree about where customer B belongs. This note also opens the Clustering group: the map below shows how its six notes connect and in which order to read them.</p>

  <h2 id="cl-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="cl-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="12" width="190" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="115" y="30" text-anchor="middle" font-size="12">Supervised learning</text><text x="115" y="45" text-anchor="middle" class="tm" font-size="10.5">kNN, scaling, features</text>
<line x1="210" y1="32" x2="243" y2="32" stroke="currentColor" marker-end="url(#cl-a0)"/>
<rect x="245" y="8" width="190" height="50" rx="8" class="fb sb" stroke-width="3"/><text x="340" y="29" text-anchor="middle" font-size="13" font-weight="700">The Idea &amp; Distances</text><text x="340" y="47" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE</text>
<line x1="435" y1="32" x2="468" y2="32" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#cl-a0)"/>
<rect x="470" y="12" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="555" y="30" text-anchor="middle" font-size="12">Dimensionality</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10.5">Reduction (next group)</text>
<line x1="300" y1="58" x2="95" y2="118" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="320" y1="58" x2="255" y2="118" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="360" y1="58" x2="420" y2="118" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="380" y1="58" x2="575" y2="118" stroke="currentColor" marker-end="url(#cl-a0)"/>
<text x="340" y="96" text-anchor="middle" class="tm" font-size="10.5">four ways to define "a group"</text>
<rect x="20" y="120" width="150" height="50" rx="8" class="ft st"/><text x="95" y="141" text-anchor="middle" font-size="12.5" font-weight="700">K-Means</text><text x="95" y="158" text-anchor="middle" class="tm" font-size="10.5">centroid</text>
<rect x="180" y="120" width="150" height="50" rx="8" class="ft st"/><text x="255" y="141" text-anchor="middle" font-size="12.5" font-weight="700">Hierarchical</text><text x="255" y="158" text-anchor="middle" class="tm" font-size="10.5">connectivity / tree</text>
<rect x="340" y="120" width="160" height="50" rx="8" class="ft st"/><text x="420" y="141" text-anchor="middle" font-size="12.5" font-weight="700">DBSCAN &amp; HDBSCAN</text><text x="420" y="158" text-anchor="middle" class="tm" font-size="10.5">density</text>
<rect x="510" y="120" width="130" height="50" rx="8" class="ft st"/><text x="575" y="141" text-anchor="middle" font-size="12.5" font-weight="700">GMM</text><text x="575" y="158" text-anchor="middle" class="tm" font-size="10.5">distribution</text>
<line x1="170" y1="145" x2="178" y2="145" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="330" y1="145" x2="338" y2="145" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="500" y1="145" x2="508" y2="145" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="95" y1="170" x2="290" y2="228" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="255" y1="170" x2="320" y2="228" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="420" y1="170" x2="360" y2="228" stroke="currentColor" marker-end="url(#cl-a0)"/>
<line x1="575" y1="170" x2="390" y2="228" stroke="currentColor" marker-end="url(#cl-a0)"/>
<rect x="245" y="230" width="190" height="44" rx="8" class="fg sg"/><text x="340" y="249" text-anchor="middle" font-size="12.5" font-weight="700">Evaluating Clusters</text><text x="340" y="265" text-anchor="middle" class="tm" font-size="10.5">is any of it any good?</text>
<text x="330" y="294" text-anchor="middle" class="tm" font-size="10.5">Read left to right along the middle row: each algorithm fixes a weakness of the one before it.</text>
</svg><figcaption>The Clustering group. This note is the root: every algorithm below it uses the distances defined here. The middle row is the reading order; Evaluating Clusters judges all of them.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: supervised learning</b><span>In <a class="xref" data-note="ml_classification">Logistic Regression</a> and the tree notes, every training row came with an answer (churned or not, a price). <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> already used the idea "rows that are close are alike", and <a class="xref" data-note="ml_features">Feature Engineering</a> showed how scaling changes numbers. Left open: what can you learn when <em>nobody</em> has written the answer column?</span></li>
    <li><b>This note adds: groups without labels, and the ruler that measures "alike"</b><span>What clustering is, where it pays off, how to measure similarity for amounts, spending mixes, baskets and mixed tables, why scaling and dimensionality change the answer, and the four families of algorithms.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_kmeans">K-Means</a></b><span>The simplest and most used algorithm: a group is "everything nearest to a centre". Its weaknesses (you must give k, it only finds round blobs) lead to <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a> (a whole tree, no k up front), <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a> (any shape, noise), <a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a> (soft, elliptical groups) and finally <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>.</span></li>
  </ol>

  <h2 id="cl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note is one chain of questions. Each concept answers the question above it, and its weakness raises the next question. Read this once now and once again at the end.</p>
  <ol class="story">
    <li><b>Clustering</b><span>Q: the shop has six customers and no labels; can we still find "types" of customer? → Yes: split rows into groups that are alike inside and different across. But "alike" is not a number yet…</span></li>
    <li><b>Distance &amp; the metric rules</b><span>Q: how do we turn "alike" into a number? → A distance d(i, j): 0 for the same row, larger for more different rows, obeying four sanity rules. Stored as a 6 × 6 distance matrix. But which formula should fill it?</span></li>
    <li><b>Euclidean (L2)</b><span>Q: for amounts like age and income, what is the natural distance? → The straight-line distance: A to D = 44.72. But one big gap is squared and dominates, and city blocks are not straight lines…</span></li>
    <li><b>Manhattan (L1), Minkowski (Lp), Chebyshev (L∞)</b><span>Q: are there other honest ways to add up per-column gaps? → Yes, one dial p: 60 (p = 1), 44.72 (p = 2), 41.60 (p = 3), 40 (p = ∞). But all of them compare raw amounts, so a big spender and a small spender with the same habits look far apart…</span></li>
    <li><b>Cosine similarity</b><span>Q: how do we compare the <em>mix</em> of spending, not its size? → The angle between the spend vectors: A and B (B spends 3× A in the same mix) get cosine 1.0. But some data is not amounts at all: a basket is a set of items…</span></li>
    <li><b>Jaccard</b><span>Q: how alike are two sets? → Shared items ÷ all items: A and E share 3 of 4, 0.75. But a real customer row mixes numbers, a city, a yes/no and a basket…</span></li>
    <li><b>Gower</b><span>Q: one distance for a mixed table? → Score each column on its own 0-to-1 scale and average: A–E = 0.031. Gower scales inside its formula, but L1/L2/cosine do not…</span></li>
    <li><b>Scaling</b><span>Q: does the unit of a column change who is "near"? → Completely: in raw rupees, B's nearest customer is E; after standard scaling it is D. And with hundreds of columns…</span></li>
    <li><b>Curse of dimensionality</b><span>Q: does distance still work with many columns? → Less and less: in 1,000 dimensions the farthest point is only 11% farther than the nearest. Even with good distances, algorithms still disagree…</span></li>
    <li><b>Cluster shapes</b><span>Q: why do two algorithms give different groups on the same data? → Each assumes a shape of group (blobs, chains, dense patches, ellipses). Which shapes exist, and who assumes which?</span></li>
    <li><b>The four families</b><span>Q: what are the main answers to "what is a group"? → Centroid, hierarchical, density, distribution. On our six customers they disagree about B and D. So how do we run a real project end to end?</span></li>
    <li><b>The workflow</b><span>Q: what are the steps from raw table to named segments? → Goal, features, scaling, distance, algorithm, k, evaluation, profiling, deployment. Next question, for the following notes: how does each algorithm actually work? → <a class="xref" data-note="ml_kmeans">K-Means</a>.</span></li>
  </ol>

  <h2 id="cl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Clustering: Idea &amp; Distances</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Clustering</b> — split unlabeled rows into groups: alike inside, different across</li>
          <li><b>Unsupervised</b> — no answer column; no "correct" output to score against</li>
          <li><b>Uses</b> — customer segments, topic grouping, colour compression, anomaly flags, gene groups, hotspot maps, label bootstrapping</li>
          <li><b>Hard</b> (one group each) · <b>soft</b> (probabilities) · <b>hierarchical</b> (nested tree)</li>
          <li>⚠ Always returns groups, even for random noise</li>
          <li>💡 A new teacher finding friend groups by watching who sits together</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Distance basics</div>
        <ul>
          <li><b>Metric rules</b> — d ≥ 0, d = 0 only for same row, symmetric, triangle inequality</li>
          <li><b>Similarity</b> s ∈ [0, 1] ↔ distance d = 1 − s</li>
          <li><b>Distance matrix</b> — n × n, symmetric, zero diagonal; n² memory</li>
          <li>Squared L2 breaks the triangle rule: A–D 2000 &gt; A–E + E–D = 1746</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Distances for amounts</div>
        <ul>
          <li><b>Euclidean</b> L2 = √Σ(xᵢ − yᵢ)² — A(25, 40) to D(45, 80) = 44.72</li>
          <li><b>Manhattan</b> L1 = Σ|xᵢ − yᵢ| = 60 — street grid</li>
          <li><b>Minkowski</b> (Σ|xᵢ − yᵢ|ᵖ)^(1/p): p = 3 → 41.60</li>
          <li><b>Chebyshev</b> L∞ = largest gap = 40</li>
          <li>Unit "circles": diamond (L1), circle (L2), square (L∞)</li>
          <li><b>Mahalanobis</b> — L2 after undoing correlation and scale</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mixes, sets, mixed tables</div>
        <ul>
          <li><b>Cosine</b> = a·b / (|a||b|) — angle only: A vs B (3× spend) = 1.0, A vs C = 0.423</li>
          <li>Unit rows: ‖a − b‖² = 2 − 2cos (1.155 for A, C)</li>
          <li><b>Jaccard</b> = |A∩B| / |A∪B| — baskets A, E: 3/4 = 0.75</li>
          <li><b>SMC</b> counts 0–0 matches → inflated (A, B: 0.7 vs Jaccard 0.4)</li>
          <li><b>Gower</b> — numeric |Δ|/range, category 0/1, average: A–E 0.031, A–B 0.491</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scale &amp; dimensions</div>
        <ul>
          <li>Raw rupees: B's nearest is E (age ignored); scaled: B's nearest is D</li>
          <li><b>Standard</b> (x − mean)/std · <b>min-max</b> · <b>robust</b> (median/IQR)</li>
          <li>At scale: raw ARI −0.002 → standard 1.000; robust −0.002 (bimodal column)</li>
          <li>Scaling = choosing feature weights</li>
          <li><b>Curse</b>: (far − near)/near 13.2 at d = 2 → 0.11 at d = 1000</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Families &amp; workflow</div>
        <ul>
          <li><b>Centroid</b> K-Means · <b>Hierarchical</b> · <b>Density</b> DBSCAN · <b>Distribution</b> GMM</li>
          <li>Six customers: three families give {A,E} vs {B,C,D,F}; DBSCAN calls B and D noise</li>
          <li>Moons ARI: k-means 0.47, single 1.00 · stretched: GMM 1.00, k-means 0.51</li>
          <li>Workflow: goal → features → scale → distance → algorithm → k → evaluate → profile → deploy</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cl-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain of questions</span></div></div>
      <div class="rm-item rm-done" data-target="cl-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Clustering Is</span><span class="rm-sub">Six customers, no labels</span></div></div>
      <div class="rm-item rm-done" data-target="cl-dist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Similarity &amp; Distance</span><span class="rm-sub">Metric rules, distance matrix</span></div></div>
      <div class="rm-item rm-done" data-target="cl-lp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Euclidean, Manhattan, Minkowski</span><span class="rm-sub">One dial p, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="cl-cos"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cosine Similarity</span><span class="rm-sub">The mix, not the size</span></div></div>
      <div class="rm-item rm-done" data-target="cl-jac"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Jaccard &amp; Binary Data</span><span class="rm-sub">Baskets by hand</span></div></div>
      <div class="rm-item rm-done" data-target="cl-gower"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gower for Mixed Types</span><span class="rm-sub">Numbers + categories together</span></div></div>
      <div class="rm-item rm-done" data-target="cl-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scaling &amp; Dimensions</span><span class="rm-sub">Who is nearest changes</span></div></div>
      <div class="rm-item rm-done" data-target="cl-shapes"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Cluster Shapes</span><span class="rm-sub">Why algorithms disagree</span></div></div>
      <div class="rm-item rm-done" data-target="cl-tax"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Four Families</span><span class="rm-sub">Run on our six customers</span></div></div>
      <div class="rm-item rm-done" data-target="cl-flow"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Clustering Project</span><span class="rm-sub">End-to-end workflow and profiling</span></div></div>
      <div class="rm-item rm-done" data-target="cl-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every measure on one table</span></div></div>
      <div class="rm-item rm-done" data-target="cl-group"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">The Group Map</span><span class="rm-sub">Reading order and sibling comparison</span></div></div>
      <div class="rm-item rm-done" data-target="cl-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in projects and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="cl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="cl-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="cl-what"><span class="num">01</span>What Clustering Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every model so far needed an answer column to learn from. A shop owner has a table of customers and no column saying what "type" each one is. Can a machine still find structure in it, and what would "structure" even mean?</p>
  </div>
  <h3>The need</h3>
  <p>A new class teacher gets 40 students and no information about them. After a week of watching who sits with whom, she can name the friend groups. Nobody gave her a list. She found the groups from behaviour.</p>
  <p>Every model in the earlier groups had an answer column: "churned or not" for <a class="xref" data-note="ml_classification">classification</a>, "price" for <a class="xref" data-note="ml_regression">regression</a>. Very often a real table has none. <strong>Clustering</strong> puts similar rows together into groups; you then look at each group and give it a name.</p>
  <h3>The running example: six customers</h3>
  <p>Mrs. Kulkarni runs a general store and keeps a small card for each regular customer. We will use these six cards, A to F, in every section of this note.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
cust = pd.DataFrame({
    "age":      [25,      52,      55,       45,       28,      50],
    "income":   [40000,   45000,   120000,   80000,    42000,   110000],   # Rs per month
    "city":     ["Pune",  "Pune",  "Delhi",  "Mumbai", "Pune",  "Delhi"],
    "has_card": [1,       0,       1,        1,        1,       0],
    "grocery":  [3,       9,       0,        2,        4,       1],        # monthly spend, Rs 1000
    "fashion":  [2,       6,       1,        2,        2,       2],
    "electro":  [1,       3,       3,        6,        1,       8]},
    index=list("ABCDEF"))
baskets = {"A": {"milk", "bread", "eggs", "butter"}, "B": {"milk", "bread", "jam"},
           "C": {"chips", "cola", "milk"},           "D": {"rice", "dal", "soap", "milk"},
           "E": {"milk", "bread", "eggs"},           "F": {"chips", "cola", "soap"}}
print(cust)</div>
  <div class="fx" data-lang="text">   age  income    city  has_card  grocery  fashion  electro
A   25   40000    Pune         1        3        2        1
B   52   45000    Pune         0        9        6        3
C   55  120000   Delhi         1        0        1        3
D   45   80000  Mumbai         1        2        2        6
E   28   42000    Pune         1        4        2        1
F   50  110000   Delhi         0        1        2        8</div>
  <p>Columns: age, monthly income in rupees, city, whether they hold the shop's credit card (1/0), and monthly spend in ₹1000 on grocery, fashion and electronics. Each customer also has a basket, the set of items in their last bill: A {milk, bread, eggs, butter}, B {milk, bread, jam}, C {chips, cola, milk}, D {rice, dal, soap, milk}, E {milk, bread, eggs}, F {chips, cola, soap}. By eye: A and E look like young Pune customers; C and F look like older, richer Delhi customers; B and D are less obvious. Clustering's job is to make that "by eye" precise and repeatable for 10 lakh customers, not six.</p>
  <div class="flow"><span>Unlabeled rows</span><span>Pick and scale features</span><span>Measure distance</span><span>Group similar rows</span><span>Profile and name each group</span></div>

  <h3>Supervised vs unsupervised</h3>
  <table class="tbl">
    <tr><th></th><th>Supervised (classification, regression)</th><th>Unsupervised (clustering)</th></tr>
    <tr><td>Training data</td><td>features <strong>and</strong> an answer column y</td><td>features only (our six cards)</td></tr>
    <tr><td>Goal</td><td>predict y for new rows</td><td>discover which rows belong together</td></tr>
    <tr><td>"Correct" output</td><td>known for training rows</td><td>does not exist; many groupings can be reasonable</td></tr>
    <tr><td>How you check it</td><td>accuracy, RMSE on held-out rows</td><td>internal scores, stability, and above all a human: are the groups useful?</td></tr>
    <tr><td>Typical output</td><td>a label or number per row</td><td>a group id per row (and maybe a centre or a tree)</td></tr>
  </table>
  <p>Clustering sits in the unsupervised branch of the ML map from <a class="xref" data-note="ml_intro">What is Machine Learning</a>, next to dimensionality reduction. The two are often used together: reduce the columns first, then cluster.</p>

  <h3>Real uses</h3>
  <div class="cards">
    <div><b>Customer segmentation</b><p>Group shoppers by behaviour, then design one offer per segment.</p><small>Our running example</small></div>
    <div><b>Grouping documents</b><p>Cluster news stories or support tickets by topic, using cosine distance on text vectors.</p><small>"Related stories"</small></div>
    <div><b>Image compression</b><p>Cluster pixel colours into 16 groups and repaint each pixel with its group's colour.</p><small>Colour quantisation with K-Means</small></div>
    <div><b>Anomaly detection</b><p>Rows far from every group, or labelled noise by DBSCAN, are suspicious.</p><small>Card fraud, faulty sensors</small></div>
    <div><b>Biology</b><p>Group genes with similar expression patterns; the dendrogram is the classic picture.</p><small>Hierarchical clustering</small></div>
    <div><b>Maps &amp; hotspots</b><p>Group delivery addresses or accident locations into dense zones.</p><small>DBSCAN with haversine distance</small></div>
    <div><b>Label bootstrapping</b><p>Cluster 1 lakh unlabelled tickets, label a few per cluster, spread the label.</p><small>Cheap first training set</small></div>
    <div><b>Feature for a model</b><p>"Segment id" or "distance to each centre" becomes an input column for a supervised model.</p><small>Clustering as feature engineering</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting a pile of mixed laundry with the lights off. You cannot read the labels, so you group by feel: towels together, shirts together, socks together. Clustering sorts rows by the "feel" of their numbers, and the distance function is the hand that feels them.</p>
  </div>

  <h3>What a "good" clustering means</h3>
  <p>Two wishes that pull against each other: <strong>compact</strong> (rows inside a group are close) and <strong>separated</strong> (rows in different groups are far apart). Put each of our six customers in its own group and every group is perfectly compact but useless; put all six in one group and nothing is separated. Every algorithm and score in this group is a trade-off between the two. A third wish matters most and no formula sees it: <strong>useful</strong>, meaning Mrs. Kulkarni would treat the groups differently.</p>

  <h3>Hard, soft and hierarchical outputs</h3>
  <table class="tbl">
    <tr><th>Output</th><th>What each row gets</th><th>Example for customer B</th><th>Algorithms</th></tr>
    <tr><td><strong>Hard (flat)</strong></td><td>exactly one group id</td><td>B → group 2</td><td>K-Means, DBSCAN (plus "noise")</td></tr>
    <tr><td><strong>Soft (probabilistic)</strong></td><td>a share for every group, adding to 1</td><td>B → [0.6, 0.4]</td><td>GMM, fuzzy c-means</td></tr>
    <tr><td><strong>Hierarchical</strong></td><td>a place in a tree of nested groups</td><td>B ⊂ {B, D} ⊂ {B, C, D, F} ⊂ all six</td><td>Agglomerative, divisive</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Given n rows x₁ … xₙ, a <strong>hard clustering</strong> into k groups is a partition C₁, …, C_k: every row is in exactly one Cⱼ and no Cⱼ is empty. A <strong>soft clustering</strong> gives each row memberships (r_i1, …, r_ik) with r_ij ≥ 0 and Σⱼ r_ij = 1. A <strong>hierarchical clustering</strong> is a nested sequence of partitions from n singletons to one group. "Good" is defined by the algorithm's own objective, built on a chosen distance d(xᵢ, xⱼ).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A clustering algorithm always returns groups, even on pure random noise. Ask K-Means for 5 groups of random dots and it hands back 5 neat groups with no warning. Whether clusters exist is something you must check (<a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>), not something the output proves.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Distance.</b> "Put similar customers together" hides the real decision: how similar are A and D, as a number? Without a distance function no algorithm can start.</div>

  <h2 id="cl-dist"><span class="num">02</span>Similarity &amp; Distance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want "alike" as a number for every pair of our six customers. What properties must such a number have so that algorithms can trust it, and where do we store 15 pair-numbers for six customers (or 5 × 10¹¹ for a million)?</p>
  </div>
  <h3>Two sides of one coin</h3>
  <p>A <strong>distance</strong> (dissimilarity) is small for alike rows and large for different rows. A <strong>similarity</strong> is the reverse. When a similarity lives between 0 and 1, the usual conversion is d = 1 − s: cosine distance = 1 − cosine similarity, Jaccard distance = 1 − Jaccard similarity. sklearn algorithms almost always want a distance.</p>
  <h3>What makes a proper distance (a metric)</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>Plain words</th></tr>
    <tr><td>Non-negative</td><td>d(x, y) ≥ 0</td><td>no negative distances</td></tr>
    <tr><td>Identity</td><td>d(x, y) = 0 only if x = y</td><td>zero means "the same row"</td></tr>
    <tr><td>Symmetry</td><td>d(x, y) = d(y, x)</td><td>A to D = D to A</td></tr>
    <tr><td>Triangle inequality</td><td>d(x, z) ≤ d(x, y) + d(y, z)</td><td>a detour through E is never shorter than going straight from A to D</td></tr>
  </table>
  <p>Why care? Fast neighbour search (KD-trees and ball trees, used by DBSCAN and <a class="xref" data-note="ml_knn">KNN</a>) skips whole regions of space using the triangle inequality. If the "distance" breaks it, those shortcuts give wrong answers.</p>
  <h3>The distance matrix on our customers</h3>
  <p>Take two columns, age and income in ₹1000, so A = (25, 40), D = (45, 80), E = (28, 42). With straight-line (Euclidean) distance, defined fully in the next section: A to E = √((28 − 25)² + (42 − 40)²) = √(9 + 4) = √13 = <strong>3.61</strong>. C = (55, 120) to F = (50, 110) = √(25 + 100) = √125 = <strong>11.18</strong>. Doing this for all 15 pairs fills a 6 × 6 table: the distance matrix.</p>
  <div class="fx" data-lang="py">from scipy.spatial import distance
X = cust[["age", "income"]].to_numpy(float).copy()
X[:, 1] /= 1000                                   # income in Rs 1000 for now (section 07 revisits units)
a, d = X[0], X[3]                                 # customer A and customer D
diff = np.abs(a - d)
print("A =", a, " D =", d, " gaps =", diff)
print("Euclidean   L2  :", round(np.sqrt((diff ** 2).sum()), 2), round(distance.euclidean(a, d), 2))
print("Manhattan   L1  :", diff.sum(), distance.cityblock(a, d))
print("Minkowski   p=3 :", round((diff ** 3).sum() ** (1 / 3), 2), round(distance.minkowski(a, d, p=3), 2))
print("Chebyshev   Linf:", diff.max(), distance.chebyshev(a, d))
print("Squared L2      :", (diff ** 2).sum(), distance.sqeuclidean(a, d))</div>
  <div class="fx" data-lang="text">A = [25. 40.]  D = [45. 80.]  gaps = [20. 40.]
Euclidean   L2  : 44.72 44.72
Manhattan   L1  : 60.0 60.0
Minkowski   p=3 : 41.6 41.6
Chebyshev   Linf: 40.0 40.0
Squared L2      : 2000.0 2000.0</div>
  <div class="fx" data-lang="py">from sklearn.metrics import pairwise_distances
L2 = pd.DataFrame(pairwise_distances(X), index=cust.index, columns=cust.index)
print(L2.round(2))
e = X[4]                                          # customer E
print("triangle, plain L2 : d(A,D) =", round(distance.euclidean(a, d), 2),
      "&lt;= d(A,E)+d(E,D) =", round(distance.euclidean(a, e) + distance.euclidean(e, d), 2))
print("triangle, squared  : d(A,D) =", distance.sqeuclidean(a, d),
      " &gt;  d(A,E)+d(E,D) =", distance.sqeuclidean(a, e) + distance.sqeuclidean(e, d))</div>
  <div class="fx" data-lang="text">       A      B      C      D      E      F
A   0.00  27.46  85.44  44.72   3.61  74.33
B  27.46   0.00  75.06  35.69  24.19  65.03
C  85.44  75.06   0.00  41.23  82.54  11.18
D  44.72  35.69  41.23   0.00  41.63  30.41
E   3.61  24.19  82.54  41.63   0.00  71.47
F  74.33  65.03  11.18  30.41  71.47   0.00
triangle, plain L2 : d(A,D) = 44.72 &lt;= d(A,E)+d(E,D) = 45.23
triangle, squared  : d(A,D) = 2000.0  &gt;  d(A,E)+d(E,D) = 1746.0</div>
  <p>Find the hand values in the matrix: row A, column E = 3.61; row C, column F = 11.18. The diagonal is all zeros (identity) and the table mirrors across it (symmetry). A's nearest customer is E; C's is F, as our eyes said.</p>
  <p>The last two lines test the triangle inequality on real customers. Plain Euclidean passes: going A → D directly (44.72) is shorter than the detour A → E → D (45.23). <strong>Squared</strong> Euclidean fails: d²(A, E) = 13 and d²(E, D) = 17² + 38² = 289 + 1,444 = 1,733, so the detour costs 1,746, yet the direct d²(A, D) = 20² + 40² = 2,000 is "longer". K-Means uses squared Euclidean inside its objective, which is fine for an objective, but it is not a metric.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>metric</strong> is a function d(x, y) that is non-negative, zero only when x = y, symmetric, and obeys the triangle inequality. A <strong>dissimilarity</strong> needs only the first three; squared Euclidean and cosine distance are dissimilarities, not metrics. The <strong>distance matrix</strong> D has Dᵢⱼ = d(xᵢ, xⱼ); it holds n(n−1)/2 distinct numbers (15 for our six customers).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The matrix grows with n². For 1 lakh rows that is 10¹⁰ numbers, 80 GB in float64. Methods that need the matrix (hierarchical, PAM k-medoids, Gower-based clustering) do not scale; methods that only need "distance to k centres" (K-Means) do.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Euclidean and its relatives.</b> We filled the matrix with straight-line distance without asking whether that is the right ruler. It is one member of a family, and the members disagree about how far A is from D.</div>

  <h2 id="cl-lp"><span class="num">03</span>Euclidean, Manhattan &amp; Minkowski</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A and D differ by 20 years of age and ₹40,000 of income. How should two per-column gaps be combined into one distance: add them, take a straight line, or keep only the bigger one?</p>
  </div>
  <h3>Plain words first</h3>
  <p>A = (25, 40) and D = (45, 80). The per-column gaps are |25 − 45| = 20 and |40 − 80| = 40. Every distance in this family combines those gaps differently.</p>
  <table class="tbl">
    <tr><th>Distance</th><th>Formula</th><th>By hand for A, D</th><th>Plain meaning</th></tr>
    <tr><td><strong>Euclidean (L2)</strong></td><td>√Σ(xᵢ − yᵢ)²</td><td>√(20² + 40²) = √2000 = <strong>44.72</strong></td><td>straight line, "as the crow flies"</td></tr>
    <tr><td><strong>Manhattan (L1, city-block)</strong></td><td>Σ|xᵢ − yᵢ|</td><td>20 + 40 = <strong>60</strong></td><td>walking a street grid: across, then up</td></tr>
    <tr><td><strong>Minkowski (Lp)</strong></td><td>(Σ|xᵢ − yᵢ|ᵖ)^(1/p)</td><td>p = 3: (8,000 + 64,000)^(1/3) = 72,000^(1/3) = <strong>41.60</strong></td><td>a dial: p = 1 is L1, p = 2 is L2</td></tr>
    <tr><td><strong>Chebyshev (L∞)</strong></td><td>maxᵢ |xᵢ − yᵢ|</td><td>max(20, 40) = <strong>40</strong></td><td>only the worst gap counts</td></tr>
    <tr><td>Squared Euclidean</td><td>Σ(xᵢ − yᵢ)²</td><td>400 + 1,600 = <strong>2,000</strong></td><td>K-Means' objective; not a metric</td></tr>
  </table>
  <p>The order: 60 (p = 1) ≥ 44.72 (p = 2) ≥ 41.60 (p = 3) ≥ 40 (p = ∞). As p grows, the largest gap takes over, until at p = ∞ it is the only one that counts. The output of <code>b01_dist</code> above matches every number in this table.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="cl-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="130" y="18" text-anchor="middle" font-size="12">A to D: three rulers</text>
<line x1="30" y1="200" x2="250" y2="200" stroke="currentColor" stroke-opacity="0.3"/><line x1="30" y1="200" x2="30" y2="30" stroke="currentColor" stroke-opacity="0.3"/>
<circle cx="70" cy="160" r="5" class="fb sb"/><text x="58" y="178" font-size="11">A (25, 40)</text>
<circle cx="190" cy="60" r="5" class="fr sr"/><text x="196" y="54" font-size="11">D (45, 80)</text>
<line x1="70" y1="160" x2="190" y2="60" class="sb" stroke-width="2"/><text x="112" y="100" class="tb" font-size="11">L2 = 44.72</text>
<polyline points="70,160 190,160 190,60" fill="none" class="sr" stroke-width="2" stroke-dasharray="5 3"/><text x="120" y="176" class="tr" font-size="11">20</text><text x="196" y="115" class="tr" font-size="11">40</text>
<text x="200" y="190" class="tr" font-size="11">L1 = 20 + 40 = 60</text>
<text x="130" y="222" text-anchor="middle" class="tm" font-size="10.5">L∞ = max(20, 40) = 40</text>
<text x="465" y="18" text-anchor="middle" font-size="12">All points at distance 1 from the centre</text>
<line x1="330" y1="120" x2="600" y2="120" stroke="currentColor" stroke-opacity="0.2"/><line x1="465" y1="30" x2="465" y2="210" stroke="currentColor" stroke-opacity="0.2"/>
<rect x="385" y="40" width="160" height="160" fill="none" class="sg" stroke-width="2"/>
<circle cx="465" cy="120" r="80" fill="none" class="sb" stroke-width="2"/>
<polygon points="465,40 545,120 465,200 385,120" fill="none" class="sr" stroke-width="2"/>
<circle cx="465" cy="120" r="3" fill="currentColor"/>
<text x="555" y="58" class="tg" font-size="11">L∞ square</text><text x="555" y="150" class="tb" font-size="11">L2 circle</text><text x="335" y="100" class="tr" font-size="11">L1 diamond</text>
</svg><figcaption>Left: customers A and D on (age, income in ₹1000). Euclidean goes straight (44.72), Manhattan goes along the axes (20 + 40 = 60), Chebyshev keeps only the bigger gap (40). Right: the set of points at distance exactly 1 from the centre has a different shape under each ruler, so "the nearest centre" can change.</figcaption></figure>
  <h3>Why the shape of "distance 1" matters</h3>
  <p>Under L2 the points at distance 1 from a centre form a circle; under L1 a diamond (moving diagonally costs more); under L∞ a square. A clustering that asks "which centre is nearest?" draws different boundaries under each ruler, so the groups change. The general rule: <strong>the distance decides which shapes look like a group</strong>.</p>
  <h3>When to use which</h3>
  <table class="tbl">
    <tr><th>Distance</th><th>Good for</th><th>Watch out</th></tr>
    <tr><td>Euclidean</td><td>continuous features on the same scale, low dimensions; the default for K-Means and Ward</td><td>one huge gap dominates (it is squared); suffers most in high dimensions</td></tr>
    <tr><td>Manhattan</td><td>features that are independent "costs" to add; data with outliers in a few features; somewhat better in high dimensions</td><td>not rotation-invariant</td></tr>
    <tr><td>Chebyshev</td><td>"the worst single difference is what matters" (tolerances, chessboard kings)</td><td>ignores all but one feature per pair</td></tr>
    <tr><td>Mahalanobis</td><td>correlated features: √((x − y)ᵀ S⁻¹ (x − y)), S = covariance; undoes scale and correlation</td><td>needs a good estimate of S; GMM uses this idea per cluster (<a class="xref" data-note="ml_gmm">GMM</a>)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>From Connaught Place to a shop in Delhi: a drone flies straight (Euclidean); an auto-rickshaw follows roads at right angles (Manhattan); a courier who moves both ways at once and only cares about the longer leg is Chebyshev. Same two places, three honest answers.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Minkowski distance</strong> of order p ≥ 1: d_p(x, y) = (Σᵢ |xᵢ − yᵢ|ᵖ)^(1/p). p = 1 Manhattan, p = 2 Euclidean, p → ∞ Chebyshev. For p &lt; 1 the triangle inequality fails. sklearn: <code>pairwise_distances(X, metric="minkowski", p=3)</code>; scipy: <code>distance.minkowski(a, b, p=3)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn's <code>KMeans</code> has no <code>metric</code> argument: "move the centre to the mean" is only optimal for squared Euclidean (for L1 the best centre is the median, which is k-medians). For another distance, use k-medoids, hierarchical clustering or DBSCAN.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cosine.</b> All these rulers compare raw amounts. Customer B spends ₹18,000 a month in exactly the same grocery/fashion/electronics mix as A's ₹6,000. Do they have the same <em>habits</em>? Amount-based rulers say they are far apart.</div>

  <h2 id="cl-cos"><span class="num">04</span>Cosine Similarity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>L1 and L2 measure how far apart two rows' amounts are. How do we compare the <em>proportions</em> of a row (its mix) while ignoring its overall size?</p>
  </div>
  <h3>The need</h3>
  <table class="tbl"><caption>Monthly spend in ₹1000 (from the running table)</caption>
    <tr><th>Customer</th><th>grocery</th><th>fashion</th><th>electronics</th><th>Story</th></tr>
    <tr><td>A</td><td>3</td><td>2</td><td>1</td><td>mostly grocery</td></tr>
    <tr><td>B</td><td>9</td><td>6</td><td>3</td><td>exactly A's mix, three times bigger</td></tr>
    <tr><td>C</td><td>0</td><td>1</td><td>3</td><td>mostly electronics</td></tr>
  </table>
  <p>Euclidean by hand: A to B = √(6² + 4² + 2²) = √56 = 7.48. A to C = √(3² + 1² + 2²) = √14 = 3.74. Euclidean says A shops more like the electronics buyer C than like B, who buys the same things in the same proportions. For "what kind of shopper", that is wrong: size is not habit.</p>
  <h3>Plain words and the formula</h3>
  <p>Treat each row as an arrow from the origin. B points exactly the same way as A, just three times longer. <strong>Cosine similarity</strong> measures only the angle:</p>
  <p style="text-align:center"><strong>cos(a, b) = (a · b) / (‖a‖ · ‖b‖)</strong></p>
  <p>a · b multiplies matching columns and adds; dividing by both lengths removes size. 1 = same direction, 0 = nothing in common, −1 = opposite (only with negative values).</p>
  <p>A and C by hand: A · C = 3·0 + 2·1 + 1·3 = 5. ‖A‖ = √(9 + 4 + 1) = √14 = 3.742; ‖C‖ = √(0 + 1 + 9) = √10 = 3.162. cos = 5 / (3.742 × 3.162) = 5 / 11.83 = <strong>0.423</strong>. A and B: A · B = 27 + 12 + 3 = 42; ‖B‖ = √126 = 11.225; cos = 42 / (3.742 × 11.225) = 42 / 42 = <strong>1.0</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 520 200" width="520">
<defs><marker id="cl-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="40" y1="180" x2="500" y2="180" stroke="currentColor" stroke-opacity="0.3"/><line x1="40" y1="180" x2="40" y2="15" stroke="currentColor" stroke-opacity="0.3"/>
<text x="490" y="196" class="tm" font-size="10.5" text-anchor="end">grocery-heavy direction</text><text x="46" y="22" class="tm" font-size="10.5">electronics-heavy direction</text>
<line x1="40" y1="180" x2="140" y2="150" class="sb" stroke-width="2.5" marker-end="url(#cl-a2)"/><text x="120" y="140" class="tb" font-size="11">A</text>
<line x1="40" y1="180" x2="340" y2="90" class="sb" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#cl-a2)"/><text x="345" y="88" class="tb" font-size="11">B = 3 × A (angle 0°, cos 1.0)</text>
<line x1="40" y1="180" x2="58" y2="60" class="sr" stroke-width="2.5" marker-end="url(#cl-a2)"/><text x="65" y="58" class="tr" font-size="11">C (angle 65°, cos 0.423)</text>
<path d="M90,165 A55,55 0 0 0 58,128" fill="none" stroke="currentColor"/>
<text x="250" y="160" class="tm" font-size="11">Euclidean: A→C = 3.74 &lt; A→B = 7.48 (wrong for spending habits)</text>
</svg><figcaption>Cosine looks only at the angle between arrows. B is A stretched (three times the spend, same mix), so the angle is 0 and cosine is 1, even though the arrow tips are far apart.</figcaption></figure>
  <h3>The link to Euclidean distance</h3>
  <p>Divide every row by its length so every arrow has length 1. Then for unit vectors â, b̂:</p>
  <p style="text-align:center">‖â − b̂‖² = â·â − 2 â·b̂ + b̂·b̂ = 1 − 2 cos + 1 = <strong>2 − 2 cos(a, b)</strong></p>
  <p>For A, C: 2 − 2 × 0.423 = 1.155. So "K-Means with cosine distance" (which sklearn does not offer directly) is just: normalise rows with <code>sklearn.preprocessing.normalize</code>, then ordinary K-Means. This is the standard trick for text and embeddings.</p>
  <div class="fx" data-lang="py">from sklearn.metrics.pairwise import cosine_similarity
S = cust[["grocery", "fashion", "electro"]].to_numpy(float)     # spend mix, Rs 1000
sA, sB, sC = S[0], S[1], S[2]
print("A·C =", sA @ sC, " |A| =", round(np.linalg.norm(sA), 3), " |C| =", round(np.linalg.norm(sC), 3))
print("A·B =", sA @ sB, " |B| =", round(np.linalg.norm(sB), 3))
print("cosine similarity\\n", pd.DataFrame(cosine_similarity(S), index=cust.index, columns=cust.index).round(3))
print("Euclidean A-B", round(distance.euclidean(sA, sB), 2), "  A-C", round(distance.euclidean(sA, sC), 2))
U = S / np.linalg.norm(S, axis=1, keepdims=True)                # unit-length rows
print("||uA-uC||^2 =", round(((U[0] - U[2]) ** 2).sum(), 3), "  2 - 2cos(A,C) =",
      round(2 - 2 * cosine_similarity(S)[0, 2], 3))</div>
  <div class="fx" data-lang="text">A·C = 5.0  |A| = 3.742  |C| = 3.162
A·B = 42.0  |B| = 11.225
cosine similarity
        A      B      C      D      E      F
A  1.000  1.000  0.423  0.645  0.991  0.483
B  1.000  1.000  0.423  0.645  0.991  0.483
C  0.423  0.423  1.000  0.953  0.345  0.990
D  0.645  0.645  0.953  1.000  0.592  0.980
E  0.991  0.991  0.345  0.592  1.000  0.420
F  0.483  0.483  0.990  0.980  0.420  1.000
Euclidean A-B 7.48   A-C 3.74
||uA-uC||^2 = 1.155   2 - 2cos(A,C) = 1.155</div>
  <p>The output repeats the hand work (A·C = 5, cosine 0.423; A·B = 42, cosine 1.0) and confirms ‖â − ĉ‖² = 2 − 2cos = 1.155. The full matrix tells a clear story: A, B and E (cosine 0.991) are grocery-mix shoppers; C, D and F (0.95 to 0.99 with each other) are electronics-mix shoppers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people point at the same star from the same roof, one with a short stick and one with a long pole. The tips are far apart, but they point the same way. Cosine asks "same direction?", not "same tip?".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cosine similarity</strong> cos(a, b) = Σᵢ aᵢbᵢ / (√Σᵢ aᵢ² · √Σᵢ bᵢ²) ∈ [−1, 1]; <strong>cosine distance</strong> = 1 − cos ∈ [0, 2]. Invariant to multiplying a row by a positive number. Not a metric (the angle arccos(cos) is). Used for TF-IDF vectors (<a class="xref" data-note="nlp">NLP Foundations</a>), embeddings (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>) and user–item vectors in recommenders.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Cosine ignores magnitude on purpose, which is wrong when magnitude <em>is</em> the signal: for a "big spender" segment, A and B (₹6,000 vs ₹18,000) are different customers even with cosine 1.0. An all-zero row has no direction: cosine is undefined.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Jaccard.</b> Amounts and mixes are vectors of numbers. A basket is not: it is a set of items bought. How alike are the baskets {milk, bread, eggs, butter} and {milk, bread, jam}?</div>

  <h2 id="cl-jac"><span class="num">05</span>Jaccard &amp; Binary Data</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Cosine and Euclidean need numbers. Our customers' baskets are sets of items. How do we measure the overlap of two sets, and what should "both did not buy soap" count for?</p>
  </div>
  <h3>Plain words</h3>
  <p>Count the items two baskets share and divide by the items that appear in either:</p>
  <p style="text-align:center"><strong>J(S, T) = |S ∩ T| / |S ∪ T|</strong> &nbsp;&nbsp; (shared items ÷ all distinct items)</p>
  <table class="tbl">
    <tr><th>Pair</th><th>Shared (∩)</th><th>All distinct (∪)</th><th>Jaccard</th><th>Distance 1 − J</th></tr>
    <tr><td>A, E</td><td>milk, bread, eggs → 3</td><td>milk, bread, eggs, butter → 4</td><td>3/4 = <strong>0.750</strong></td><td>0.250</td></tr>
    <tr><td>A, B</td><td>milk, bread → 2</td><td>milk, bread, eggs, butter, jam → 5</td><td>2/5 = <strong>0.400</strong></td><td>0.600</td></tr>
    <tr><td>A, C</td><td>milk → 1</td><td>6 items</td><td>1/6 = <strong>0.167</strong></td><td>0.833</td></tr>
    <tr><td>C, F</td><td>chips, cola → 2</td><td>chips, cola, milk, soap → 4</td><td>2/4 = <strong>0.500</strong></td><td>0.500</td></tr>
  </table>
  <h3>Why not just count matches? (SMC vs Jaccard)</h3>
  <p>Write each basket as a 0/1 row over the shop's 10 items. The <strong>simple matching coefficient</strong> (SMC) counts every position where two rows agree, including both 0. A vs B: 2 positions are 1–1 (milk, bread), 3 disagree (butter, eggs, jam), and 5 are 0–0 (chips, cola, dal, rice, soap). SMC = (2 + 5)/10 = 0.7. Jaccard ignores 0–0: 2/(2 + 3) = 0.4.</p>
  <p>In a real shop with 20,000 products, any two baskets agree on about 19,990 "not bought" items, so SMC says every pair of customers is 99.9% alike. Not buying the same soap is not evidence of similar taste. When 1 is rare and meaningful ("asymmetric binary"), use Jaccard. When 0 and 1 are equally meaningful (a yes/no survey answer), SMC is fine.</p>
  <div class="fx" data-lang="py">def jac(s, t): return len(s &amp; t) / len(s | t)
for p, q in [("A", "B"), ("A", "E"), ("A", "C"), ("C", "F")]:
    s, t = baskets[p], baskets[q]
    print(f"J({p},{q}) = {len(s &amp; t)}/{len(s | t)} = {jac(s, t):.3f}")
items = sorted(set().union(*baskets.values()))
Bm = np.array([[i in baskets[c] for i in items] for c in cust.index])   # boolean basket matrix
print(items); print(Bm.astype(int))
print("Jaccard distance\\n", pd.DataFrame(pairwise_distances(Bm, metric="jaccard"),
                                         index=cust.index, columns=cust.index).round(3))
smc = (Bm[:, None, :] == Bm[None, :, :]).mean(2)                # simple matching: 0-0 counts as agreement
print("simple matching A-B =", smc[0, 1].round(2), "  A-C =", smc[0, 2].round(2))</div>
  <div class="fx" data-lang="text">J(A,B) = 2/5 = 0.400
J(A,E) = 3/4 = 0.750
J(A,C) = 1/6 = 0.167
J(C,F) = 2/4 = 0.500
['bread', 'butter', 'chips', 'cola', 'dal', 'eggs', 'jam', 'milk', 'rice', 'soap']
[[1 1 0 0 0 1 0 1 0 0]
 [1 0 0 0 0 0 1 1 0 0]
 [0 0 1 1 0 0 0 1 0 0]
 [0 0 0 0 1 0 0 1 1 1]
 [1 0 0 0 0 1 0 1 0 0]
 [0 0 1 1 0 0 0 0 0 1]]
Jaccard distance
        A      B      C      D      E      F
A  0.000  0.600  0.833  0.857  0.250  1.000
B  0.600  0.000  0.800  0.833  0.500  1.000
C  0.833  0.800  0.000  0.833  0.800  0.500
D  0.857  0.833  0.833  0.000  0.833  0.833
E  0.250  0.500  0.800  0.833  0.000  1.000
F  1.000  1.000  0.500  0.833  1.000  0.000
simple matching A-B = 0.7   A-C = 0.5</div>
  <p>The set calculations match the table. sklearn's <code>metric="jaccard"</code> on the boolean matrix gives 1 − J: A–E 0.25, A–B 0.6. F shares nothing with A, B or E (distance 1.0). SMC gives A–B 0.7 and even A–C, who share only milk, 0.5.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people who both do not own a yacht, a helicopter and a racehorse are not alike because of it. Jaccard only gives credit for what they actually share.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For sets S, T: <strong>Jaccard similarity</strong> J = |S ∩ T| / |S ∪ T| ∈ [0, 1]; <strong>Jaccard distance</strong> 1 − J (a true metric). With 0/1 counts a = #(1,1), b = #(1,0), c = #(0,1), d = #(0,0): Jaccard = a/(a + b + c), SMC = (a + d)/(a + b + c + d). Related: <strong>Dice</strong> = 2a/(2a + b + c); <strong>Hamming</strong> = (b + c)/total = 1 − SMC.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>pairwise_distances(metric="jaccard")</code> expects boolean data; counts or floats give warnings or nonsense. Jaccard on one-hot <em>symmetric</em> categories (city) is odd too: Pune vs Delhi share nothing in those columns. For mixed tables, use Gower.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gower.</b> A full customer card has age and income (numbers on different scales), city (a category) and has_card (binary) at once. Euclidean needs numbers, Jaccard needs sets. We need one distance that treats each column by its type and combines them fairly.</div>

  <h2 id="cl-gower"><span class="num">06</span>Gower Distance for Mixed Types</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How far is A (25, ₹40,000, Pune, card) from B (52, ₹45,000, Pune, no card)? Age, rupees, a city name and a yes/no cannot be put into one Euclidean formula. How do we compare apples, oranges and yes/no answers in one number?</p>
  </div>
  <h3>The idea</h3>
  <p>Gower (1971): compare the two rows <strong>one column at a time</strong>, with a rule suited to that column's type, so each column gives a partial distance between 0 and 1. Then average.</p>
  <table class="tbl">
    <tr><th>Column type</th><th>Partial distance for rows i, j</th><th>Range</th></tr>
    <tr><td>Numeric</td><td>|xᵢ − xⱼ| / (range of the column)</td><td>0 (same) … 1 (min vs max)</td></tr>
    <tr><td>Categorical (city)</td><td>0 if equal, 1 if different</td><td>0 or 1</td></tr>
    <tr><td>Binary, symmetric</td><td>0 if equal, 1 if different</td><td>0 or 1</td></tr>
    <tr><td>Binary, asymmetric</td><td>like Jaccard: if both are 0, skip the column</td><td>0, 1 or "not counted"</td></tr>
    <tr><td>Ordinal (low/mid/high)</td><td>convert to ranks, then treat as numeric</td><td>0 … 1</td></tr>
  </table>
  <p>Notice the numeric rule: it is the Manhattan gap from section 03, divided by the range, which is min-max scaling (section 07) built in. Gower is made of pieces we already know.</p>
  <h3>Worked by hand on our customers</h3>
  <p>Ranges: age 55 − 25 = 30; income ₹1,20,000 − ₹40,000 = ₹80,000 (80 in ₹1000).</p>
  <table class="tbl">
    <tr><th>Pair</th><th>age</th><th>income</th><th>city</th><th>has_card</th><th>Gower = average</th></tr>
    <tr><td>A, E</td><td>3/30 = 0.1</td><td>2/80 = 0.025</td><td>Pune = Pune → 0</td><td>1 = 1 → 0</td><td>0.125/4 = <strong>0.031</strong></td></tr>
    <tr><td>A, B</td><td>27/30 = 0.9</td><td>5/80 = 0.0625</td><td>Pune = Pune → 0</td><td>1 vs 0 → 1</td><td>1.9625/4 = <strong>0.491</strong></td></tr>
    <tr><td>A, C</td><td>30/30 = 1</td><td>80/80 = 1</td><td>different → 1</td><td>same → 0</td><td>3/4 = <strong>0.750</strong></td></tr>
    <tr><td>B, F</td><td>2/30 = 0.067</td><td>65/80 = 0.8125</td><td>different → 1</td><td>0 = 0 → 0</td><td>1.879/4 = <strong>0.470</strong></td></tr>
  </table>
  <p>A and E are almost identical (0.031). B is the interesting customer: close to A in income and city but 27 years older and without a card, so 0.491 from A; and close to F in age and card but far in income and city, 0.470. B sits between the two camps. Notice also how heavily the binary column weighs: one card mismatch alone adds 1/4 = 0.25. That is a design choice you can change with weights.</p>
  <div class="fx" data-lang="py">def gower_matrix(df, num_cols, cat_cols):
    n = len(df); total = np.zeros((n, n))
    for c in num_cols:                                   # numeric: |xi - xj| / range
        x = df[c].to_numpy(float)
        total += np.abs(x[:, None] - x[None, :]) / (x.max() - x.min())
    for c in cat_cols:                                   # categorical / binary: 0 if equal else 1
        x = df[c].to_numpy()
        total += (x[:, None] != x[None, :]).astype(float)
    return total / (len(num_cols) + len(cat_cols))       # average over features

G = gower_matrix(cust, ["age", "income"], ["city", "has_card"])
print(pd.DataFrame(G, index=cust.index, columns=cust.index).round(3))</div>
  <div class="fx" data-lang="text">       A      B      C      D      E      F
A  0.000  0.491  0.750  0.542  0.031  0.927
B  0.491  0.000  0.759  0.668  0.459  0.470
C  0.750  0.759  0.000  0.458  0.719  0.323
D  0.542  0.668  0.458  0.000  0.510  0.635
E  0.031  0.459  0.719  0.510  0.000  0.896
F  0.927  0.470  0.323  0.635  0.896  0.000</div>
  <p>The matrix matches the hand values. sklearn has no Gower option, but any algorithm that accepts a <strong>precomputed</strong> distance matrix can use it. Hierarchical clustering with average linkage (explained in <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a>) is the usual partner:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering
agg = AgglomerativeClustering(n_clusters=2, metric="precomputed", linkage="average")
print(cust[["age", "income", "city", "has_card"]].assign(cluster=agg.fit_predict(G)))</div>
  <div class="fx" data-lang="text">   age  income    city  has_card  cluster
A   25   40000    Pune         1        1
B   52   45000    Pune         0        1
C   55  120000   Delhi         1        0
D   45   80000  Mumbai         1        0
E   28   42000    Pune         1        1
F   50  110000   Delhi         0        0</div>
  <p>Gower puts B with the Pune group {A, B, E}: shared city and low income outweigh the age gap. Remember this; section 07 will put B somewhere else with a different distance. K-Means could not do this at all: it needs a mean, and "the mean of Pune and Delhi" does not exist.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gower distance</strong>: d(i, j) = Σ_f w_f δ_ij^(f) d_ij^(f) / Σ_f w_f δ_ij^(f), where d_ij^(f) ∈ [0, 1] is the partial distance on feature f (range-normalised absolute difference for numeric, 0/1 mismatch for categorical), w_f an optional weight, and δ_ij^(f) = 0 if the comparison is skipped (a missing value, or 0–0 on an asymmetric binary), else 1. Missing values simply drop out of that pair's average.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Gower divides by the range, so one outlier (an income of ₹50 lakh) stretches the range and squashes every other income gap to almost 0. Cap outliers first. Gower also needs the full n × n matrix; for big mixed data use k-prototypes (K-Means for numbers + k-modes for categories).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Scaling.</b> Gower scaled each column inside its formula. Euclidean, Manhattan and cosine do not, so the units we happen to store (rupees or ₹1000) silently decide which column the distance listens to. How much can that change?</div>

  <h2 id="cl-scale"><span class="num">07</span>Scaling &amp; Dimensions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In section 02 we quietly stored income in ₹1000. Mrs. Kulkarni's cards store it in rupees. Does that choice change who is nearest to whom? And does distance still work when a table has hundreds of columns instead of two?</p>
  </div>
  <h3>Who is nearest to B? It depends on the units</h3>
  <p>B is 52 years old with ₹45,000. In raw rupees, B to E = √((52 − 28)² + (45,000 − 42,000)²) = √(576 + 9,000,000) = <strong>3,000.1</strong>, and B to D = √(7² + 35,000²) = <strong>35,000.0</strong>. The 24-year age gap adds just 0.1 to a distance of 3,000. Income is the only column that counts.</p>
  <p>Now <strong>standard-scale</strong> each column: subtract the mean and divide by the standard deviation, z = (x − mean)/std. Age: mean 42.5, std 11.7. Income: mean ₹72,833, std ₹32,815. By hand: B → ((52 − 42.5)/11.7, (45,000 − 72,833)/32,815) = (0.81, −0.85); E → (−1.24, −0.94); D → (0.21, 0.22). Then B to E = √(2.05² + 0.09²) = <strong>2.05</strong> and B to D = √(0.60² + 1.07²) = √1.51 = <strong>1.22</strong>. B's nearest customer flips from E to D.</p>
  <div class="fx" data-lang="py">Xr = cust[["age", "income"]].to_numpy(float)             # income in rupees now
Z = (Xr - Xr.mean(0)) / Xr.std(0)                        # standard scaling by hand
print(f"mean: age {Xr[:, 0].mean():.1f}, income {Xr[:, 1].mean():.0f}   std: age {Xr[:, 0].std():.1f}, income {Xr[:, 1].std():.0f}")
print("B scaled =", Z[1].round(2), " E scaled =", Z[4].round(2), " D scaled =", Z[3].round(2))
for name, M in [("raw (age, Rs)", Xr), ("raw (age, Rs 1000)", X), ("standard-scaled", Z)]:
    dB = pairwise_distances(M[[1]], M)[0]
    order = [cust.index[i] for i in np.argsort(dB)[1:3]]
    print(f"{name:20s} B-&gt;E {dB[4]:9.2f}  B-&gt;D {dB[3]:9.2f}  nearest to B: {order}")</div>
  <div class="fx" data-lang="text">mean: age 42.5, income 72833   std: age 11.7, income 32815
B scaled = [ 0.81 -0.85]  E scaled = [-1.24 -0.94]  D scaled = [0.21 0.22]
raw (age, Rs)        B-&gt;E   3000.10  B-&gt;D  35000.00  nearest to B: ['E', 'A']
raw (age, Rs 1000)   B-&gt;E     24.19  B-&gt;D     35.69  nearest to B: ['E', 'A']
standard-scaled      B-&gt;E      2.05  B-&gt;D      1.22  nearest to B: ['D', 'F']</div>
  <p>Raw rupees and ₹1000 both say "B is like young E" (income dominates either way, because income's spread is still larger than age's). After scaling, age and income count equally, and B is like 45-year-old D. Neither answer is "true": the scaling choice <em>is</em> a decision about what similarity means. That is also why Gower (section 06) and scaled Euclidean put B in different groups.</p>
  <h3>The three common scalers, by hand on our ages</h3>
  <p>Ages 25, 52, 55, 45, 28, 50: mean 42.5, std 11.73, min 25, max 55, median 47.5, Q1 32.25, Q3 51.5, IQR 19.25. For A (age 25): standard (25 − 42.5)/11.73 = −1.49; min-max (25 − 25)/30 = 0; robust (25 − 47.5)/19.25 = −1.17. For B (52): 0.81, 27/30 = 0.90, (52 − 47.5)/19.25 = 0.23.</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
age = cust[["age"]].to_numpy(float)
q1, med, q3 = np.percentile(age, [25, 50, 75])
print(f"ages {age.ravel().astype(int).tolist()}  mean {age.mean():.1f}  std {age.std():.2f}  "
      f"min {age.min():.0f}  max {age.max():.0f}  median {med}  Q1 {q1}  Q3 {q3}  IQR {q3 - q1}")
table = pd.DataFrame({"age": age.ravel(),
                      "standard": StandardScaler().fit_transform(age).ravel(),
                      "min-max": MinMaxScaler().fit_transform(age).ravel(),
                      "robust": RobustScaler().fit_transform(age).ravel()}, index=cust.index)
print(table.round(2))</div>
  <div class="fx" data-lang="text">ages [25, 52, 55, 45, 28, 50]  mean 42.5  std 11.73  min 25  max 55  median 47.5  Q1 32.25  Q3 51.5  IQR 19.25
    age  standard  min-max  robust
A  25.0     -1.49     0.00   -1.17
B  52.0      0.81     0.90    0.23
C  55.0      1.07     1.00    0.39
D  45.0      0.21     0.67   -0.13
E  28.0     -1.24     0.10   -1.01
F  50.0      0.64     0.83    0.13</div>
  <table class="tbl">
    <tr><th>Scaler</th><th>Formula</th><th>Centre / spread used</th><th>Effect of one outlier</th></tr>
    <tr><td><strong>Standard</strong></td><td>(x − mean) / std</td><td>mean, std</td><td>inflates the std, squashing the rest</td></tr>
    <tr><td><strong>Min-max</strong></td><td>(x − min) / (max − min)</td><td>min, range (as in Gower)</td><td>squashes the rest into a small band</td></tr>
    <tr><td><strong>Robust</strong></td><td>(x − median) / IQR</td><td>median, IQR</td><td>the bulk keeps its spread; the outlier stays visibly far</td></tr>
  </table>
  <p>(Details of each scaler live in <a class="xref" data-note="ml_features">Feature Engineering</a>.) Six rows cannot show the full effect, so here is the same idea at scale: 400 customers in two groups that differ only in age, plus an income column that is pure noise on a huge scale.</p>
  <div class="fx" data-lang="py">from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.metrics import adjusted_rand_score

rng = np.random.default_rng(0)
age = np.r_[rng.normal(25, 3, 200), rng.normal(55, 3, 200)]   # the real groups differ in age
income = rng.normal(60000, 15000, 400)                          # same for both groups (noise)
Xs, ys = np.c_[age, income], np.r_[np.zeros(200), np.ones(200)]
print("column std:", Xs.std(0).round(1))
for name, Z in [("raw", Xs), ("standard", StandardScaler().fit_transform(Xs)),
                ("min-max", MinMaxScaler().fit_transform(Xs)), ("robust", RobustScaler().fit_transform(Xs))]:
    lab = KMeans(2, n_init=10, random_state=0).fit_predict(Z)
    print(f"{name:9s} ARI = {adjusted_rand_score(ys, lab):.3f}")</div>
  <div class="fx" data-lang="text">column std: [   15.1 15080.6]
raw       ARI = -0.002
standard  ARI = 1.000
min-max   ARI = 1.000
robust    ARI = -0.002</div>
  <p><strong>ARI</strong> (adjusted Rand index, defined in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>) compares found groups with the true ones: 1 = perfect, about 0 = random. Raw: −0.002, because income (std ≈ 15,081) is a thousand times wider than age (15.1), so K-Means splits on income noise. Standard and min-max fix it: 1.000. Robust fails again (−0.002): age here is <em>bimodal</em> (half near 25, half near 55), so its IQR is huge (about 30 years) and dividing by it squeezes the two age groups to about ±0.5, smaller than the income noise's spread of about ±0.74. Scaling is not a ritual; each scaler decides how much each column weighs.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>For any distance-based method, <strong>scaling = choosing feature weights</strong>. Multiplying a column by 2 makes it count twice as much in Euclidean distance. Equal variance is a sensible default, not a law. Two hidden weights to watch: correlated duplicate columns (height in cm and in inches) count the same information twice, and a 50-value one-hot block can outweigh everything else.</p>
  </div>
  <h3>Too many dimensions: the curse</h3>
  <p>Our customers have 2 numeric columns. A real feature table may have 500. Throw 200 random points into a d-dimensional unit cube and compare, for one point, its nearest and farthest neighbour:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d in [2, 10, 100, 1000]:
    Xr = rng.uniform(size=(200, d))
    dist = pairwise_distances(Xr[:1], Xr[1:])[0]                 # point 0 to the other 199
    print(f"d={d:4d}  nearest={dist.min():6.2f}  farthest={dist.max():6.2f}  "
          f"(far-near)/near={(dist.max() - dist.min()) / dist.min():5.2f}")</div>
  <div class="fx" data-lang="text">d=   2  nearest=  0.06  farthest=  0.86  (far-near)/near=13.18
d=  10  nearest=  0.59  farthest=  1.99  (far-near)/near= 2.36
d= 100  nearest=  3.48  farthest=  4.81  (far-near)/near= 0.38
d=1000  nearest= 12.14  farthest= 13.49  (far-near)/near= 0.11</div>
  <p>In 2 dimensions the farthest point is about 14 times as far as the nearest (relative gap 13.18), so "near" means something. In 1,000 dimensions the farthest is only 11% farther than the nearest: every point is about equally far from every other. Each extra random column adds independent noise to every distance; the total grows like d while its relative spread shrinks like 1/√d. Fixes: select features, reduce dimensions first (PCA, UMAP; see <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>), or use cosine on normalised embeddings.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Standard scaling</strong> z = (x − x̄)/s. <strong>Distance concentration</strong>: as dimension d → ∞, (max distance − min distance)/min distance → 0 for many data distributions, so distance-based methods (K-Means, DBSCAN, hierarchical, KNN) lose contrast. Rough rule: beyond 20–50 informative dimensions, reduce before clustering.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fit the scaler on the data you cluster and reuse the <em>same fitted</em> scaler for new customers (put both in a <code>Pipeline</code>, section 10). Re-fitting on a new batch shifts every coordinate, and old centres stop meaning the same thing. See <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cluster shapes.</b> Even with a sensible distance and careful scaling, two algorithms run on the same rows return different groups. Why? Because each one assumes what a group <em>looks like</em>.</div>

  <h2 id="cl-shapes"><span class="num">08</span>Cluster Shapes: Why Algorithms Disagree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We now have a ruler. But a ruler measures pairs; a cluster is a whole set of rows. Is a group a round blob around a centre, a chain of neighbours, a crowded patch, an oval cloud? Six customers are too few to see shapes, so we borrow five 300-point datasets with known answers.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660"><rect x="8" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="69.0" y="15" text-anchor="middle" font-size="12">round blobs</text><circle cx="24" cy="87" r="2.2" class="fr sr"/><circle cx="34" cy="104" r="2.2" class="fr sr"/><circle cx="61" cy="136" r="2.2" class="fg sg"/><circle cx="122" cy="50" r="2.2" class="fb sb"/><circle cx="107" cy="43" r="2.2" class="fb sb"/><circle cx="114" cy="32" r="2.2" class="fb sb"/><circle cx="27" cy="101" r="2.2" class="fr sr"/><circle cx="112" cy="35" r="2.2" class="fb sb"/><circle cx="32" cy="92" r="2.2" class="fr sr"/><circle cx="33" cy="100" r="2.2" class="fr sr"/><circle cx="62" cy="119" r="2.2" class="fg sg"/><circle cx="103" cy="45" r="2.2" class="fb sb"/><circle cx="29" cy="97" r="2.2" class="fr sr"/><circle cx="35" cy="95" r="2.2" class="fr sr"/><circle cx="102" cy="36" r="2.2" class="fb sb"/><circle cx="53" cy="122" r="2.2" class="fg sg"/><circle cx="58" cy="117" r="2.2" class="fg sg"/><circle cx="108" cy="40" r="2.2" class="fb sb"/><circle cx="30" cy="94" r="2.2" class="fr sr"/><circle cx="68" cy="118" r="2.2" class="fg sg"/><circle cx="108" cy="39" r="2.2" class="fb sb"/><circle cx="106" cy="46" r="2.2" class="fb sb"/><circle cx="57" cy="130" r="2.2" class="fg sg"/><circle cx="110" cy="41" r="2.2" class="fb sb"/><circle cx="58" cy="114" r="2.2" class="fg sg"/><circle cx="35" cy="101" r="2.2" class="fr sr"/><circle cx="30" cy="100" r="2.2" class="fr sr"/><circle cx="64" cy="126" r="2.2" class="fg sg"/><circle cx="110" cy="46" r="2.2" class="fb sb"/><circle cx="48" cy="104" r="2.2" class="fr sr"/><circle cx="16" cy="108" r="2.2" class="fr sr"/><circle cx="60" cy="138" r="2.2" class="fg sg"/><circle cx="66" cy="121" r="2.2" class="fg sg"/><circle cx="118" cy="38" r="2.2" class="fb sb"/><circle cx="37" cy="99" r="2.2" class="fr sr"/><circle cx="33" cy="96" r="2.2" class="fr sr"/><circle cx="57" cy="127" r="2.2" class="fg sg"/><circle cx="19" cy="107" r="2.2" class="fr sr"/><circle cx="67" cy="115" r="2.2" class="fg sg"/><circle cx="97" cy="38" r="2.2" class="fb sb"/><circle cx="39" cy="96" r="2.2" class="fr sr"/><circle cx="69" cy="121" r="2.2" class="fg sg"/><circle cx="24" cy="96" r="2.2" class="fr sr"/><circle cx="108" cy="28" r="2.2" class="fb sb"/><circle cx="104" cy="37" r="2.2" class="fb sb"/><circle cx="25" cy="100" r="2.2" class="fr sr"/><circle cx="55" cy="118" r="2.2" class="fg sg"/><circle cx="102" cy="38" r="2.2" class="fb sb"/><circle cx="105" cy="40" r="2.2" class="fb sb"/><circle cx="97" cy="38" r="2.2" class="fb sb"/><circle cx="110" cy="33" r="2.2" class="fb sb"/><circle cx="24" cy="106" r="2.2" class="fr sr"/><circle cx="112" cy="36" r="2.2" class="fb sb"/><circle cx="51" cy="125" r="2.2" class="fg sg"/><circle cx="38" cy="98" r="2.2" class="fr sr"/><circle cx="51" cy="125" r="2.2" class="fg sg"/><circle cx="59" cy="125" r="2.2" class="fg sg"/><circle cx="109" cy="41" r="2.2" class="fb sb"/><circle cx="99" cy="39" r="2.2" class="fb sb"/><circle cx="106" cy="44" r="2.2" class="fb sb"/><circle cx="57" cy="128" r="2.2" class="fg sg"/><circle cx="37" cy="102" r="2.2" class="fr sr"/><circle cx="107" cy="41" r="2.2" class="fb sb"/><circle cx="105" cy="37" r="2.2" class="fb sb"/><circle cx="33" cy="98" r="2.2" class="fr sr"/><circle cx="67" cy="129" r="2.2" class="fg sg"/><circle cx="38" cy="97" r="2.2" class="fr sr"/><circle cx="108" cy="41" r="2.2" class="fb sb"/><circle cx="53" cy="119" r="2.2" class="fg sg"/><circle cx="56" cy="127" r="2.2" class="fg sg"/><circle cx="36" cy="92" r="2.2" class="fr sr"/><circle cx="105" cy="43" r="2.2" class="fb sb"/><circle cx="64" cy="129" r="2.2" class="fg sg"/><circle cx="37" cy="100" r="2.2" class="fr sr"/><circle cx="44" cy="129" r="2.2" class="fg sg"/><circle cx="63" cy="130" r="2.2" class="fg sg"/><circle cx="114" cy="28" r="2.2" class="fb sb"/><circle cx="105" cy="45" r="2.2" class="fb sb"/><circle cx="58" cy="118" r="2.2" class="fg sg"/><circle cx="99" cy="34" r="2.2" class="fb sb"/><circle cx="108" cy="35" r="2.2" class="fb sb"/><circle cx="99" cy="39" r="2.2" class="fb sb"/><circle cx="43" cy="100" r="2.2" class="fr sr"/><circle cx="104" cy="35" r="2.2" class="fb sb"/><circle cx="34" cy="91" r="2.2" class="fr sr"/><circle cx="63" cy="115" r="2.2" class="fg sg"/><circle cx="54" cy="121" r="2.2" class="fg sg"/><circle cx="104" cy="53" r="2.2" class="fb sb"/><circle cx="41" cy="94" r="2.2" class="fr sr"/><circle cx="109" cy="51" r="2.2" class="fb sb"/><circle cx="30" cy="98" r="2.2" class="fr sr"/><circle cx="48" cy="100" r="2.2" class="fr sr"/><circle cx="62" cy="114" r="2.2" class="fg sg"/><circle cx="70" cy="129" r="2.2" class="fg sg"/><circle cx="62" cy="128" r="2.2" class="fg sg"/><circle cx="21" cy="92" r="2.2" class="fr sr"/><circle cx="62" cy="134" r="2.2" class="fg sg"/><circle cx="34" cy="90" r="2.2" class="fr sr"/><circle cx="32" cy="96" r="2.2" class="fr sr"/><circle cx="36" cy="102" r="2.2" class="fr sr"/><circle cx="65" cy="125" r="2.2" class="fg sg"/><circle cx="45" cy="132" r="2.2" class="fg sg"/><circle cx="62" cy="125" r="2.2" class="fg sg"/><circle cx="113" cy="43" r="2.2" class="fb sb"/><circle cx="113" cy="39" r="2.2" class="fb sb"/><circle cx="41" cy="91" r="2.2" class="fr sr"/><circle cx="108" cy="36" r="2.2" class="fb sb"/><circle cx="27" cy="97" r="2.2" class="fr sr"/><circle cx="48" cy="93" r="2.2" class="fr sr"/><circle cx="71" cy="129" r="2.2" class="fg sg"/><circle cx="96" cy="43" r="2.2" class="fb sb"/><circle cx="53" cy="121" r="2.2" class="fg sg"/><circle cx="60" cy="118" r="2.2" class="fg sg"/><circle cx="106" cy="43" r="2.2" class="fb sb"/><circle cx="65" cy="125" r="2.2" class="fg sg"/><circle cx="66" cy="132" r="2.2" class="fg sg"/><circle cx="26" cy="92" r="2.2" class="fr sr"/><circle cx="56" cy="117" r="2.2" class="fg sg"/><circle cx="110" cy="41" r="2.2" class="fb sb"/><circle cx="103" cy="46" r="2.2" class="fb sb"/><rect x="139" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="200.0" y="15" text-anchor="middle" font-size="12">stretched</text><circle cx="174" cy="73" r="2.2" class="fb sb"/><circle cx="183" cy="57" r="2.2" class="fr sr"/><circle cx="151" cy="47" r="2.2" class="fb sb"/><circle cx="189" cy="96" r="2.2" class="fb sb"/><circle cx="194" cy="105" r="2.2" class="fb sb"/><circle cx="231" cy="104" r="2.2" class="fg sg"/><circle cx="193" cy="63" r="2.2" class="fr sr"/><circle cx="200" cy="82" r="2.2" class="fr sr"/><circle cx="225" cy="92" r="2.2" class="fg sg"/><circle cx="179" cy="44" r="2.2" class="fr sr"/><circle cx="242" cy="121" r="2.2" class="fg sg"/><circle cx="244" cy="125" r="2.2" class="fg sg"/><circle cx="180" cy="50" r="2.2" class="fr sr"/><circle cx="176" cy="79" r="2.2" class="fb sb"/><circle cx="181" cy="92" r="2.2" class="fb sb"/><circle cx="165" cy="33" r="2.2" class="fr sr"/><circle cx="247" cy="124" r="2.2" class="fg sg"/><circle cx="243" cy="122" r="2.2" class="fg sg"/><circle cx="219" cy="92" r="2.2" class="fg sg"/><circle cx="226" cy="101" r="2.2" class="fg sg"/><circle cx="170" cy="76" r="2.2" class="fb sb"/><circle cx="180" cy="88" r="2.2" class="fb sb"/><circle cx="181" cy="58" r="2.2" class="fr sr"/><circle cx="192" cy="75" r="2.2" class="fr sr"/><circle cx="218" cy="91" r="2.2" class="fg sg"/><circle cx="196" cy="71" r="2.2" class="fr sr"/><circle cx="171" cy="71" r="2.2" class="fb sb"/><circle cx="170" cy="33" r="2.2" class="fr sr"/><circle cx="185" cy="86" r="2.2" class="fb sb"/><circle cx="185" cy="60" r="2.2" class="fr sr"/><circle cx="235" cy="109" r="2.2" class="fg sg"/><circle cx="215" cy="83" r="2.2" class="fg sg"/><circle cx="248" cy="135" r="2.2" class="fg sg"/><circle cx="181" cy="83" r="2.2" class="fb sb"/><circle cx="235" cy="112" r="2.2" class="fg sg"/><circle cx="176" cy="75" r="2.2" class="fb sb"/><circle cx="245" cy="131" r="2.2" class="fg sg"/><circle cx="242" cy="124" r="2.2" class="fg sg"/><circle cx="220" cy="85" r="2.2" class="fg sg"/><circle cx="178" cy="49" r="2.2" class="fr sr"/><circle cx="230" cy="99" r="2.2" class="fg sg"/><circle cx="174" cy="68" r="2.2" class="fb sb"/><circle cx="237" cy="111" r="2.2" class="fg sg"/><circle cx="184" cy="90" r="2.2" class="fb sb"/><circle cx="172" cy="44" r="2.2" class="fr sr"/><circle cx="237" cy="115" r="2.2" class="fg sg"/><circle cx="182" cy="53" r="2.2" class="fr sr"/><circle cx="194" cy="65" r="2.2" class="fr sr"/><circle cx="186" cy="61" r="2.2" class="fr sr"/><circle cx="195" cy="93" r="2.2" class="fb sb"/><circle cx="192" cy="68" r="2.2" class="fr sr"/><circle cx="227" cy="90" r="2.2" class="fg sg"/><circle cx="189" cy="102" r="2.2" class="fb sb"/><circle cx="188" cy="63" r="2.2" class="fr sr"/><circle cx="235" cy="113" r="2.2" class="fg sg"/><circle cx="229" cy="106" r="2.2" class="fg sg"/><circle cx="186" cy="102" r="2.2" class="fb sb"/><circle cx="182" cy="61" r="2.2" class="fr sr"/><circle cx="175" cy="86" r="2.2" class="fb sb"/><circle cx="181" cy="91" r="2.2" class="fb sb"/><circle cx="190" cy="97" r="2.2" class="fb sb"/><circle cx="175" cy="86" r="2.2" class="fb sb"/><circle cx="170" cy="68" r="2.2" class="fb sb"/><circle cx="182" cy="53" r="2.2" class="fr sr"/><circle cx="242" cy="119" r="2.2" class="fg sg"/><circle cx="176" cy="73" r="2.2" class="fb sb"/><circle cx="247" cy="132" r="2.2" class="fg sg"/><circle cx="187" cy="66" r="2.2" class="fr sr"/><circle cx="178" cy="90" r="2.2" class="fb sb"/><circle cx="187" cy="56" r="2.2" class="fr sr"/><circle cx="176" cy="77" r="2.2" class="fb sb"/><circle cx="182" cy="51" r="2.2" class="fr sr"/><circle cx="225" cy="91" r="2.2" class="fg sg"/><circle cx="182" cy="54" r="2.2" class="fr sr"/><circle cx="183" cy="60" r="2.2" class="fr sr"/><circle cx="203" cy="77" r="2.2" class="fr sr"/><circle cx="192" cy="106" r="2.2" class="fb sb"/><circle cx="183" cy="88" r="2.2" class="fb sb"/><circle cx="194" cy="73" r="2.2" class="fr sr"/><circle cx="183" cy="50" r="2.2" class="fr sr"/><circle cx="203" cy="73" r="2.2" class="fr sr"/><circle cx="182" cy="56" r="2.2" class="fr sr"/><circle cx="246" cy="130" r="2.2" class="fg sg"/><circle cx="169" cy="71" r="2.2" class="fb sb"/><circle cx="163" cy="65" r="2.2" class="fb sb"/><circle cx="241" cy="119" r="2.2" class="fg sg"/><circle cx="182" cy="59" r="2.2" class="fr sr"/><circle cx="234" cy="105" r="2.2" class="fg sg"/><circle cx="195" cy="69" r="2.2" class="fr sr"/><circle cx="175" cy="39" r="2.2" class="fr sr"/><circle cx="164" cy="59" r="2.2" class="fb sb"/><circle cx="232" cy="102" r="2.2" class="fg sg"/><circle cx="247" cy="125" r="2.2" class="fg sg"/><circle cx="185" cy="91" r="2.2" class="fb sb"/><circle cx="170" cy="37" r="2.2" class="fr sr"/><circle cx="176" cy="79" r="2.2" class="fb sb"/><circle cx="158" cy="58" r="2.2" class="fb sb"/><circle cx="169" cy="59" r="2.2" class="fb sb"/><circle cx="171" cy="42" r="2.2" class="fr sr"/><circle cx="243" cy="120" r="2.2" class="fg sg"/><circle cx="253" cy="138" r="2.2" class="fg sg"/><circle cx="233" cy="107" r="2.2" class="fg sg"/><circle cx="171" cy="72" r="2.2" class="fb sb"/><circle cx="163" cy="57" r="2.2" class="fb sb"/><circle cx="181" cy="66" r="2.2" class="fr sr"/><circle cx="186" cy="90" r="2.2" class="fb sb"/><circle cx="238" cy="120" r="2.2" class="fg sg"/><circle cx="185" cy="82" r="2.2" class="fb sb"/><circle cx="178" cy="79" r="2.2" class="fb sb"/><circle cx="180" cy="49" r="2.2" class="fr sr"/><circle cx="226" cy="101" r="2.2" class="fg sg"/><circle cx="231" cy="101" r="2.2" class="fg sg"/><circle cx="182" cy="52" r="2.2" class="fr sr"/><circle cx="244" cy="124" r="2.2" class="fg sg"/><circle cx="195" cy="110" r="2.2" class="fb sb"/><circle cx="192" cy="60" r="2.2" class="fr sr"/><circle cx="230" cy="90" r="2.2" class="fg sg"/><circle cx="163" cy="55" r="2.2" class="fb sb"/><circle cx="180" cy="45" r="2.2" class="fr sr"/><circle cx="182" cy="87" r="2.2" class="fb sb"/><rect x="270" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="331.0" y="15" text-anchor="middle" font-size="12">unequal</text><circle cx="317" cy="116" r="2.2" class="fb sb"/><circle cx="323" cy="72" r="2.2" class="fb sb"/><circle cx="315" cy="89" r="2.2" class="fb sb"/><circle cx="330" cy="38" r="2.2" class="fg sg"/><circle cx="380" cy="82" r="2.2" class="fr sr"/><circle cx="360" cy="110" r="2.2" class="fb sb"/><circle cx="342" cy="93" r="2.2" class="fb sb"/><circle cx="352" cy="84" r="2.2" class="fb sb"/><circle cx="325" cy="80" r="2.2" class="fb sb"/><circle cx="331" cy="93" r="2.2" class="fb sb"/><circle cx="280" cy="84" r="2.2" class="fb sb"/><circle cx="322" cy="79" r="2.2" class="fb sb"/><circle cx="377" cy="83" r="2.2" class="fr sr"/><circle cx="348" cy="54" r="2.2" class="fb sb"/><circle cx="362" cy="75" r="2.2" class="fb sb"/><circle cx="340" cy="99" r="2.2" class="fb sb"/><circle cx="333" cy="118" r="2.2" class="fb sb"/><circle cx="377" cy="80" r="2.2" class="fr sr"/><circle cx="375" cy="87" r="2.2" class="fr sr"/><circle cx="314" cy="103" r="2.2" class="fb sb"/><circle cx="337" cy="49" r="2.2" class="fb sb"/><circle cx="334" cy="37" r="2.2" class="fg sg"/><circle cx="308" cy="84" r="2.2" class="fb sb"/><circle cx="351" cy="61" r="2.2" class="fb sb"/><circle cx="337" cy="138" r="2.2" class="fb sb"/><circle cx="293" cy="102" r="2.2" class="fb sb"/><circle cx="321" cy="121" r="2.2" class="fb sb"/><circle cx="383" cy="73" r="2.2" class="fb sb"/><circle cx="326" cy="91" r="2.2" class="fb sb"/><circle cx="335" cy="35" r="2.2" class="fg sg"/><circle cx="317" cy="89" r="2.2" class="fb sb"/><circle cx="352" cy="51" r="2.2" class="fb sb"/><circle cx="380" cy="82" r="2.2" class="fr sr"/><circle cx="352" cy="65" r="2.2" class="fb sb"/><circle cx="337" cy="92" r="2.2" class="fb sb"/><circle cx="323" cy="69" r="2.2" class="fb sb"/><circle cx="325" cy="44" r="2.2" class="fg sg"/><circle cx="312" cy="103" r="2.2" class="fb sb"/><circle cx="375" cy="80" r="2.2" class="fr sr"/><circle cx="316" cy="83" r="2.2" class="fb sb"/><circle cx="378" cy="91" r="2.2" class="fr sr"/><circle cx="342" cy="90" r="2.2" class="fb sb"/><circle cx="330" cy="96" r="2.2" class="fb sb"/><circle cx="378" cy="87" r="2.2" class="fr sr"/><circle cx="378" cy="87" r="2.2" class="fr sr"/><circle cx="334" cy="68" r="2.2" class="fb sb"/><circle cx="374" cy="85" r="2.2" class="fr sr"/><circle cx="349" cy="118" r="2.2" class="fb sb"/><circle cx="375" cy="81" r="2.2" class="fr sr"/><circle cx="332" cy="38" r="2.2" class="fg sg"/><circle cx="355" cy="82" r="2.2" class="fb sb"/><circle cx="338" cy="105" r="2.2" class="fb sb"/><circle cx="323" cy="94" r="2.2" class="fb sb"/><circle cx="339" cy="89" r="2.2" class="fb sb"/><circle cx="360" cy="80" r="2.2" class="fb sb"/><circle cx="341" cy="95" r="2.2" class="fb sb"/><circle cx="313" cy="78" r="2.2" class="fb sb"/><circle cx="308" cy="87" r="2.2" class="fb sb"/><circle cx="380" cy="87" r="2.2" class="fr sr"/><circle cx="375" cy="88" r="2.2" class="fr sr"/><circle cx="347" cy="94" r="2.2" class="fb sb"/><circle cx="316" cy="128" r="2.2" class="fb sb"/><circle cx="381" cy="82" r="2.2" class="fr sr"/><circle cx="376" cy="81" r="2.2" class="fr sr"/><circle cx="374" cy="82" r="2.2" class="fr sr"/><circle cx="356" cy="112" r="2.2" class="fb sb"/><circle cx="321" cy="115" r="2.2" class="fb sb"/><circle cx="375" cy="85" r="2.2" class="fr sr"/><circle cx="321" cy="112" r="2.2" class="fb sb"/><circle cx="338" cy="55" r="2.2" class="fb sb"/><circle cx="376" cy="82" r="2.2" class="fr sr"/><circle cx="312" cy="80" r="2.2" class="fb sb"/><circle cx="373" cy="86" r="2.2" class="fr sr"/><circle cx="380" cy="86" r="2.2" class="fr sr"/><circle cx="305" cy="60" r="2.2" class="fb sb"/><circle cx="337" cy="117" r="2.2" class="fb sb"/><circle cx="309" cy="88" r="2.2" class="fb sb"/><circle cx="334" cy="105" r="2.2" class="fb sb"/><circle cx="324" cy="78" r="2.2" class="fb sb"/><circle cx="333" cy="34" r="2.2" class="fg sg"/><circle cx="328" cy="125" r="2.2" class="fb sb"/><circle cx="377" cy="78" r="2.2" class="fr sr"/><circle cx="334" cy="108" r="2.2" class="fb sb"/><circle cx="328" cy="53" r="2.2" class="fb sb"/><circle cx="318" cy="72" r="2.2" class="fb sb"/><circle cx="327" cy="45" r="2.2" class="fg sg"/><circle cx="312" cy="69" r="2.2" class="fb sb"/><circle cx="337" cy="62" r="2.2" class="fb sb"/><circle cx="366" cy="43" r="2.2" class="fb sb"/><circle cx="276" cy="102" r="2.2" class="fb sb"/><circle cx="336" cy="76" r="2.2" class="fb sb"/><circle cx="344" cy="100" r="2.2" class="fb sb"/><circle cx="330" cy="37" r="2.2" class="fg sg"/><circle cx="344" cy="79" r="2.2" class="fb sb"/><circle cx="307" cy="105" r="2.2" class="fb sb"/><circle cx="336" cy="89" r="2.2" class="fb sb"/><circle cx="327" cy="93" r="2.2" class="fb sb"/><circle cx="320" cy="50" r="2.2" class="fb sb"/><circle cx="349" cy="111" r="2.2" class="fb sb"/><circle cx="327" cy="39" r="2.2" class="fg sg"/><circle cx="312" cy="80" r="2.2" class="fb sb"/><circle cx="334" cy="62" r="2.2" class="fb sb"/><circle cx="328" cy="46" r="2.2" class="fg sg"/><circle cx="308" cy="96" r="2.2" class="fb sb"/><circle cx="339" cy="87" r="2.2" class="fb sb"/><circle cx="319" cy="96" r="2.2" class="fb sb"/><circle cx="315" cy="65" r="2.2" class="fb sb"/><circle cx="333" cy="102" r="2.2" class="fb sb"/><circle cx="281" cy="92" r="2.2" class="fb sb"/><circle cx="305" cy="80" r="2.2" class="fb sb"/><circle cx="327" cy="38" r="2.2" class="fg sg"/><circle cx="374" cy="85" r="2.2" class="fr sr"/><circle cx="333" cy="71" r="2.2" class="fb sb"/><circle cx="333" cy="43" r="2.2" class="fg sg"/><circle cx="304" cy="71" r="2.2" class="fb sb"/><circle cx="314" cy="87" r="2.2" class="fb sb"/><circle cx="332" cy="41" r="2.2" class="fg sg"/><circle cx="316" cy="61" r="2.2" class="fb sb"/><circle cx="382" cy="92" r="2.2" class="fr sr"/><circle cx="331" cy="76" r="2.2" class="fb sb"/><rect x="401" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="462.0" y="15" text-anchor="middle" font-size="12">moons</text><circle cx="498" cy="119" r="2.2" class="fr sr"/><circle cx="450" cy="82" r="2.2" class="fr sr"/><circle cx="454" cy="118" r="2.2" class="fr sr"/><circle cx="456" cy="37" r="2.2" class="fb sb"/><circle cx="441" cy="42" r="2.2" class="fb sb"/><circle cx="415" cy="68" r="2.2" class="fb sb"/><circle cx="417" cy="62" r="2.2" class="fb sb"/><circle cx="447" cy="100" r="2.2" class="fr sr"/><circle cx="510" cy="93" r="2.2" class="fr sr"/><circle cx="485" cy="129" r="2.2" class="fr sr"/><circle cx="450" cy="89" r="2.2" class="fr sr"/><circle cx="512" cy="71" r="2.2" class="fr sr"/><circle cx="418" cy="62" r="2.2" class="fb sb"/><circle cx="482" cy="126" r="2.2" class="fr sr"/><circle cx="470" cy="59" r="2.2" class="fb sb"/><circle cx="429" cy="43" r="2.2" class="fb sb"/><circle cx="501" cy="111" r="2.2" class="fr sr"/><circle cx="416" cy="71" r="2.2" class="fb sb"/><circle cx="495" cy="128" r="2.2" class="fr sr"/><circle cx="411" cy="70" r="2.2" class="fb sb"/><circle cx="486" cy="124" r="2.2" class="fr sr"/><circle cx="473" cy="63" r="2.2" class="fb sb"/><circle cx="498" cy="115" r="2.2" class="fr sr"/><circle cx="425" cy="50" r="2.2" class="fb sb"/><circle cx="435" cy="42" r="2.2" class="fb sb"/><circle cx="466" cy="46" r="2.2" class="fb sb"/><circle cx="444" cy="71" r="2.2" class="fr sr"/><circle cx="453" cy="114" r="2.2" class="fr sr"/><circle cx="474" cy="134" r="2.2" class="fr sr"/><circle cx="466" cy="48" r="2.2" class="fb sb"/><circle cx="431" cy="39" r="2.2" class="fb sb"/><circle cx="413" cy="74" r="2.2" class="fb sb"/><circle cx="485" cy="131" r="2.2" class="fr sr"/><circle cx="496" cy="118" r="2.2" class="fr sr"/><circle cx="429" cy="44" r="2.2" class="fb sb"/><circle cx="447" cy="87" r="2.2" class="fr sr"/><circle cx="475" cy="81" r="2.2" class="fb sb"/><circle cx="457" cy="48" r="2.2" class="fb sb"/><circle cx="451" cy="33" r="2.2" class="fb sb"/><circle cx="503" cy="99" r="2.2" class="fr sr"/><circle cx="492" cy="131" r="2.2" class="fr sr"/><circle cx="448" cy="89" r="2.2" class="fr sr"/><circle cx="501" cy="116" r="2.2" class="fr sr"/><circle cx="434" cy="44" r="2.2" class="fb sb"/><circle cx="513" cy="83" r="2.2" class="fr sr"/><circle cx="453" cy="115" r="2.2" class="fr sr"/><circle cx="412" cy="83" r="2.2" class="fb sb"/><circle cx="450" cy="97" r="2.2" class="fr sr"/><circle cx="474" cy="75" r="2.2" class="fb sb"/><circle cx="428" cy="37" r="2.2" class="fb sb"/><circle cx="467" cy="59" r="2.2" class="fb sb"/><circle cx="504" cy="98" r="2.2" class="fr sr"/><circle cx="500" cy="122" r="2.2" class="fr sr"/><circle cx="476" cy="77" r="2.2" class="fb sb"/><circle cx="489" cy="126" r="2.2" class="fr sr"/><circle cx="507" cy="98" r="2.2" class="fr sr"/><circle cx="478" cy="78" r="2.2" class="fb sb"/><circle cx="481" cy="134" r="2.2" class="fr sr"/><circle cx="509" cy="93" r="2.2" class="fr sr"/><circle cx="408" cy="92" r="2.2" class="fb sb"/><circle cx="452" cy="34" r="2.2" class="fb sb"/><circle cx="415" cy="63" r="2.2" class="fb sb"/><circle cx="478" cy="130" r="2.2" class="fr sr"/><circle cx="476" cy="136" r="2.2" class="fr sr"/><circle cx="453" cy="37" r="2.2" class="fb sb"/><circle cx="477" cy="80" r="2.2" class="fb sb"/><circle cx="470" cy="59" r="2.2" class="fb sb"/><circle cx="443" cy="36" r="2.2" class="fb sb"/><circle cx="506" cy="88" r="2.2" class="fr sr"/><circle cx="424" cy="42" r="2.2" class="fb sb"/><circle cx="476" cy="71" r="2.2" class="fb sb"/><circle cx="420" cy="56" r="2.2" class="fb sb"/><circle cx="459" cy="123" r="2.2" class="fr sr"/><circle cx="465" cy="129" r="2.2" class="fr sr"/><circle cx="462" cy="120" r="2.2" class="fr sr"/><circle cx="445" cy="91" r="2.2" class="fr sr"/><circle cx="480" cy="132" r="2.2" class="fr sr"/><circle cx="449" cy="109" r="2.2" class="fr sr"/><circle cx="456" cy="43" r="2.2" class="fb sb"/><circle cx="453" cy="105" r="2.2" class="fr sr"/><circle cx="504" cy="94" r="2.2" class="fr sr"/><circle cx="453" cy="45" r="2.2" class="fb sb"/><circle cx="508" cy="99" r="2.2" class="fr sr"/><circle cx="412" cy="89" r="2.2" class="fb sb"/><circle cx="472" cy="130" r="2.2" class="fr sr"/><circle cx="498" cy="121" r="2.2" class="fr sr"/><circle cx="439" cy="38" r="2.2" class="fb sb"/><circle cx="485" cy="129" r="2.2" class="fr sr"/><circle cx="510" cy="85" r="2.2" class="fr sr"/><circle cx="446" cy="91" r="2.2" class="fr sr"/><circle cx="476" cy="75" r="2.2" class="fb sb"/><circle cx="445" cy="76" r="2.2" class="fr sr"/><circle cx="461" cy="45" r="2.2" class="fb sb"/><circle cx="435" cy="40" r="2.2" class="fb sb"/><circle cx="476" cy="92" r="2.2" class="fb sb"/><circle cx="509" cy="103" r="2.2" class="fr sr"/><circle cx="508" cy="90" r="2.2" class="fr sr"/><circle cx="470" cy="133" r="2.2" class="fr sr"/><circle cx="414" cy="67" r="2.2" class="fb sb"/><circle cx="502" cy="122" r="2.2" class="fr sr"/><circle cx="462" cy="134" r="2.2" class="fr sr"/><circle cx="450" cy="106" r="2.2" class="fr sr"/><circle cx="476" cy="126" r="2.2" class="fr sr"/><circle cx="467" cy="124" r="2.2" class="fr sr"/><circle cx="502" cy="110" r="2.2" class="fr sr"/><circle cx="451" cy="104" r="2.2" class="fr sr"/><circle cx="458" cy="50" r="2.2" class="fb sb"/><circle cx="493" cy="131" r="2.2" class="fr sr"/><circle cx="459" cy="40" r="2.2" class="fb sb"/><circle cx="449" cy="37" r="2.2" class="fb sb"/><circle cx="411" cy="102" r="2.2" class="fb sb"/><circle cx="467" cy="57" r="2.2" class="fb sb"/><circle cx="507" cy="105" r="2.2" class="fr sr"/><circle cx="454" cy="118" r="2.2" class="fr sr"/><circle cx="441" cy="35" r="2.2" class="fb sb"/><circle cx="441" cy="47" r="2.2" class="fb sb"/><circle cx="469" cy="131" r="2.2" class="fr sr"/><circle cx="480" cy="77" r="2.2" class="fb sb"/><circle cx="514" cy="86" r="2.2" class="fr sr"/><circle cx="491" cy="128" r="2.2" class="fr sr"/><rect x="532" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="593.0" y="15" text-anchor="middle" font-size="12">circles</text><circle cx="587" cy="102" r="2.2" class="fr sr"/><circle cx="613" cy="66" r="2.2" class="fr sr"/><circle cx="590" cy="66" r="2.2" class="fr sr"/><circle cx="553" cy="54" r="2.2" class="fb sb"/><circle cx="543" cy="95" r="2.2" class="fb sb"/><circle cx="616" cy="129" r="2.2" class="fb sb"/><circle cx="607" cy="132" r="2.2" class="fb sb"/><circle cx="607" cy="73" r="2.2" class="fr sr"/><circle cx="608" cy="99" r="2.2" class="fr sr"/><circle cx="577" cy="87" r="2.2" class="fr sr"/><circle cx="613" cy="70" r="2.2" class="fr sr"/><circle cx="613" cy="86" r="2.2" class="fr sr"/><circle cx="605" cy="134" r="2.2" class="fb sb"/><circle cx="569" cy="92" r="2.2" class="fr sr"/><circle cx="600" cy="34" r="2.2" class="fb sb"/><circle cx="553" cy="120" r="2.2" class="fb sb"/><circle cx="592" cy="103" r="2.2" class="fr sr"/><circle cx="629" cy="121" r="2.2" class="fb sb"/><circle cx="583" cy="105" r="2.2" class="fr sr"/><circle cx="624" cy="118" r="2.2" class="fb sb"/><circle cx="573" cy="93" r="2.2" class="fr sr"/><circle cx="614" cy="36" r="2.2" class="fb sb"/><circle cx="586" cy="98" r="2.2" class="fr sr"/><circle cx="584" cy="133" r="2.2" class="fb sb"/><circle cx="555" cy="116" r="2.2" class="fb sb"/><circle cx="579" cy="33" r="2.2" class="fb sb"/><circle cx="613" cy="82" r="2.2" class="fr sr"/><circle cx="590" cy="64" r="2.2" class="fr sr"/><circle cx="572" cy="82" r="2.2" class="fr sr"/><circle cx="588" cy="30" r="2.2" class="fb sb"/><circle cx="549" cy="113" r="2.2" class="fb sb"/><circle cx="632" cy="114" r="2.2" class="fb sb"/><circle cx="574" cy="93" r="2.2" class="fr sr"/><circle cx="584" cy="100" r="2.2" class="fr sr"/><circle cx="580" cy="128" r="2.2" class="fb sb"/><circle cx="612" cy="73" r="2.2" class="fr sr"/><circle cx="631" cy="53" r="2.2" class="fb sb"/><circle cx="559" cy="48" r="2.2" class="fb sb"/><circle cx="547" cy="59" r="2.2" class="fb sb"/><circle cx="595" cy="97" r="2.2" class="fr sr"/><circle cx="579" cy="100" r="2.2" class="fr sr"/><circle cx="612" cy="73" r="2.2" class="fr sr"/><circle cx="591" cy="107" r="2.2" class="fr sr"/><circle cx="561" cy="121" r="2.2" class="fb sb"/><circle cx="613" cy="94" r="2.2" class="fr sr"/><circle cx="585" cy="63" r="2.2" class="fr sr"/><circle cx="637" cy="109" r="2.2" class="fb sb"/><circle cx="601" cy="61" r="2.2" class="fr sr"/><circle cx="625" cy="46" r="2.2" class="fb sb"/><circle cx="567" cy="121" r="2.2" class="fb sb"/><circle cx="585" cy="39" r="2.2" class="fb sb"/><circle cx="598" cy="99" r="2.2" class="fr sr"/><circle cx="589" cy="106" r="2.2" class="fr sr"/><circle cx="626" cy="47" r="2.2" class="fb sb"/><circle cx="576" cy="96" r="2.2" class="fr sr"/><circle cx="602" cy="100" r="2.2" class="fr sr"/><circle cx="639" cy="57" r="2.2" class="fb sb"/><circle cx="573" cy="90" r="2.2" class="fr sr"/><circle cx="608" cy="100" r="2.2" class="fr sr"/><circle cx="635" cy="107" r="2.2" class="fb sb"/><circle cx="549" cy="56" r="2.2" class="fb sb"/><circle cx="612" cy="129" r="2.2" class="fb sb"/><circle cx="576" cy="80" r="2.2" class="fr sr"/><circle cx="569" cy="88" r="2.2" class="fr sr"/><circle cx="549" cy="71" r="2.2" class="fb sb"/><circle cx="636" cy="55" r="2.2" class="fb sb"/><circle cx="606" cy="33" r="2.2" class="fb sb"/><circle cx="540" cy="81" r="2.2" class="fb sb"/><circle cx="604" cy="96" r="2.2" class="fr sr"/><circle cx="559" cy="124" r="2.2" class="fb sb"/><circle cx="624" cy="43" r="2.2" class="fb sb"/><circle cx="589" cy="135" r="2.2" class="fb sb"/><circle cx="582" cy="67" r="2.2" class="fr sr"/><circle cx="580" cy="71" r="2.2" class="fr sr"/><circle cx="588" cy="65" r="2.2" class="fr sr"/><circle cx="605" cy="68" r="2.2" class="fr sr"/><circle cx="573" cy="86" r="2.2" class="fr sr"/><circle cx="594" cy="65" r="2.2" class="fr sr"/><circle cx="560" cy="40" r="2.2" class="fb sb"/><circle cx="593" cy="59" r="2.2" class="fr sr"/><circle cx="599" cy="98" r="2.2" class="fr sr"/><circle cx="550" cy="57" r="2.2" class="fb sb"/><circle cx="605" cy="103" r="2.2" class="fr sr"/><circle cx="642" cy="99" r="2.2" class="fb sb"/><circle cx="574" cy="76" r="2.2" class="fr sr"/><circle cx="588" cy="109" r="2.2" class="fr sr"/><circle cx="544" cy="99" r="2.2" class="fb sb"/><circle cx="573" cy="95" r="2.2" class="fr sr"/><circle cx="610" cy="95" r="2.2" class="fr sr"/><circle cx="607" cy="69" r="2.2" class="fr sr"/><circle cx="630" cy="47" r="2.2" class="fb sb"/><circle cx="612" cy="74" r="2.2" class="fr sr"/><circle cx="570" cy="37" r="2.2" class="fb sb"/><circle cx="542" cy="104" r="2.2" class="fb sb"/><circle cx="640" cy="71" r="2.2" class="fb sb"/><circle cx="604" cy="103" r="2.2" class="fr sr"/><circle cx="604" cy="97" r="2.2" class="fr sr"/><circle cx="570" cy="80" r="2.2" class="fr sr"/><circle cx="612" cy="130" r="2.2" class="fb sb"/><circle cx="592" cy="107" r="2.2" class="fr sr"/><circle cx="580" cy="74" r="2.2" class="fr sr"/><circle cx="598" cy="65" r="2.2" class="fr sr"/><circle cx="570" cy="80" r="2.2" class="fr sr"/><circle cx="582" cy="68" r="2.2" class="fr sr"/><circle cx="594" cy="104" r="2.2" class="fr sr"/><circle cx="595" cy="61" r="2.2" class="fr sr"/><circle cx="557" cy="57" r="2.2" class="fb sb"/><circle cx="580" cy="106" r="2.2" class="fr sr"/><circle cx="560" cy="46" r="2.2" class="fb sb"/><circle cx="546" cy="77" r="2.2" class="fb sb"/><circle cx="645" cy="88" r="2.2" class="fb sb"/><circle cx="599" cy="33" r="2.2" class="fb sb"/><circle cx="601" cy="103" r="2.2" class="fr sr"/><circle cx="588" cy="65" r="2.2" class="fr sr"/><circle cx="538" cy="83" r="2.2" class="fb sb"/><circle cx="555" cy="114" r="2.2" class="fb sb"/><circle cx="581" cy="73" r="2.2" class="fr sr"/><circle cx="633" cy="48" r="2.2" class="fb sb"/><circle cx="614" cy="95" r="2.2" class="fr sr"/><circle cx="578" cy="102" r="2.2" class="fr sr"/><text x="330" y="164" text-anchor="middle" class="tm" font-size="11">colour = the true group (120 of 300 points drawn, after standard scaling)</text></svg><figcaption>Five shapes of "group": round blobs, stretched (elongated) blobs, groups of unequal size and spread, two interleaved moons, and a ring around a core.</figcaption></figure>
  <p>Run five algorithms on each (all given the true number of groups where they need one) and score with ARI:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_blobs, make_moons, make_circles
from sklearn.cluster import AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture

def datasets():
    X1, y1 = make_blobs(300, centers=3, cluster_std=0.8, random_state=1)
    X2, y2 = make_blobs(300, centers=3, random_state=170)
    X2 = X2 @ np.array([[0.6, -0.64], [-0.41, 0.85]])            # stretch -&gt; elongated
    X3, y3 = make_blobs([200, 60, 40], centers=[[0, 0], [5, 0], [0, 5]],
                        cluster_std=[2.0, 0.4, 0.4], random_state=3)  # unequal size/spread
    X4, y4 = make_moons(300, noise=0.06, random_state=0)
    X5, y5 = make_circles(300, factor=0.4, noise=0.05, random_state=0)
    return {"round blobs": (X1, y1, 3), "stretched": (X2, y2, 3), "unequal": (X3, y3, 3),
            "moons": (X4, y4, 2), "circles": (X5, y5, 2)}

def algos(k):
    return {"k-means": KMeans(k, n_init=10, random_state=0),
            "ward": AgglomerativeClustering(k, linkage="ward"),
            "single": AgglomerativeClustering(k, linkage="single"),
            "DBSCAN": DBSCAN(eps=0.3, min_samples=5),
            "GMM": GaussianMixture(k, covariance_type="full", random_state=0)}

print(f"{'data':12s}" + "".join(f"{a:&gt;9s}" for a in algos(2)))
for name, (X, y, k) in datasets().items():
    X = StandardScaler().fit_transform(X)
    row = [adjusted_rand_score(y, m.fit_predict(X)) for m in algos(k).values()]
    print(f"{name:12s}" + "".join(f"{r:9.2f}" for r in row))</div>
  <div class="fx" data-lang="text">data          k-means     ward   single   DBSCAN      GMM
round blobs      0.99     0.99     0.99     0.99     0.99
stretched        0.51     0.47     0.57     0.57     1.00
unequal          0.37     0.54    -0.01     0.40     0.88
moons            0.47     0.21     1.00     0.99     0.48
circles         -0.00    -0.00     1.00     0.86    -0.00</div>
  <table class="tbl">
    <tr><th>Data</th><th>Who wins</th><th>Why</th></tr>
    <tr><td>Round blobs</td><td>everyone (0.99)</td><td>every definition of "group" agrees on round, equal, far-apart groups. This is why toy demos mislead.</td></tr>
    <tr><td>Stretched</td><td>GMM 1.00; k-means 0.51</td><td>K-Means assumes round groups; GMM with full covariance learns the tilt of each ellipse.</td></tr>
    <tr><td>Unequal</td><td>GMM 0.88; single −0.01</td><td>K-Means puts the boundary halfway between centres, so the big loose group spills into the small tight ones. GMM learns each group's own spread.</td></tr>
    <tr><td>Moons</td><td>single 1.00, DBSCAN 0.99; ward 0.21</td><td>A moon is a chain of close neighbours, not a blob around a centre.</td></tr>
    <tr><td>Circles</td><td>single 1.00, DBSCAN 0.86; centroid methods 0.00</td><td>The two rings share the <em>same</em> centre, so any "nearest centre" method is helpless.</td></tr>
  </table>
  <p>No column wins every row. Single linkage is perfect on moons and circles but worthless on unequal blobs (it chains stragglers to everything); GMM is best on ellipses and fails on rings. <strong>Choosing an algorithm means choosing what you believe a group looks like.</strong></p>
  <p>One more number. Without labels you only have internal scores; the silhouette (defined in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>) is the most common. What does it say about K-Means on the moons?</p>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_score
Xm, ym = make_moons(300, noise=0.06, random_state=0)
Xm = StandardScaler().fit_transform(Xm)
km_lab = KMeans(2, n_init=10, random_state=0).fit_predict(Xm)
print("k-means split : ARI", round(adjusted_rand_score(ym, km_lab), 2), " silhouette", round(silhouette_score(Xm, km_lab), 2))
print("true moons    : ARI 1.0   silhouette", round(silhouette_score(Xm, ym), 2))</div>
  <div class="fx" data-lang="text">k-means split : ARI 0.47  silhouette 0.49
true moons    : ARI 1.0   silhouette 0.38</div>
  <p>The wrong K-Means split (ARI 0.47) scores a <em>higher</em> silhouette (0.49) than the true moons (0.38). Silhouette rewards round, separated blobs, so it prefers the wrong answer here.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ask four people to "group the lights" in a night photo of India. One draws circles around the brightest spots (centroid). One connects each light to its nearest neighbour and follows the chains (single linkage). One outlines crowded patches and ignores lonely village lights (density). One fits soft oval glows (distribution). All four are reasonable; they answer different questions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Real data has no ARI. Internal scores share K-Means' love of round blobs, as the moons just showed. Plot the data in 2D (PCA or UMAP) and look before trusting any score.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The four families.</b> We saw five algorithms behave differently. They fall into four families, each with its own definition of a group. What are they, and what do they do to our six customers?</div>

  <h2 id="cl-tax"><span class="num">09</span>The Four Families</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 08 showed that "what a group looks like" decides the answer. How many fundamentally different answers are there, and which one should Mrs. Kulkarni use for her six (or six lakh) customers?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 250" width="660">
<rect x="8" y="8" width="155" height="200" rx="8" class="fb sb" fill-opacity="0.35"/><text x="85" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Centroid</text>
<circle cx="55" cy="80" r="3" class="fb sb"/><circle cx="45" cy="95" r="3" class="fb sb"/><circle cx="65" cy="98" r="3" class="fb sb"/><circle cx="58" cy="65" r="3" class="fb sb"/><circle cx="40" cy="75" r="3" class="fb sb"/>
<circle cx="115" cy="120" r="3" class="fr sr"/><circle cx="125" cy="135" r="3" class="fr sr"/><circle cx="105" cy="138" r="3" class="fr sr"/><circle cx="128" cy="115" r="3" class="fr sr"/><circle cx="112" cy="150" r="3" class="fr sr"/>
<rect x="49" y="78" width="9" height="9" class="fb sb" stroke-width="2"/><rect x="113" y="127" width="9" height="9" class="fr sr" stroke-width="2"/>
<line x1="30" y1="160" x2="145" y2="55" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="85" y="180" text-anchor="middle" font-size="10.5" class="tm">nearest centre wins</text><text x="85" y="196" text-anchor="middle" font-size="10.5" class="tb">K-Means, k-medoids</text>
<rect x="172" y="8" width="155" height="200" rx="8" class="ft st" fill-opacity="0.6"/><text x="250" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Hierarchical</text>
<path d="M195,150 V135 H215 V150" fill="none" stroke="currentColor"/><path d="M235,150 V128 H255 V150" fill="none" stroke="currentColor"/><path d="M285,150 V120 H305 V150" fill="none" stroke="currentColor"/>
<path d="M205,135 V95 H245 V128" fill="none" stroke="currentColor"/><path d="M225,95 V60 H295 V120" fill="none" stroke="currentColor"/>
<line x1="185" y1="110" x2="315" y2="110" class="sr" stroke-dasharray="4 3"/>
<text x="250" y="180" text-anchor="middle" font-size="10.5" class="tm">merge closest groups → tree</text><text x="250" y="196" text-anchor="middle" font-size="10.5" class="tb">Agglomerative, divisive</text>
<rect x="336" y="8" width="155" height="200" rx="8" class="fg sg" fill-opacity="0.6"/><text x="413" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Density</text>
<path d="M360,120 Q385,60 420,90 T470,80" fill="none" class="sb" stroke-width="9" stroke-opacity="0.35"/>
<circle cx="365" cy="112" r="3" class="fb sb"/><circle cx="375" cy="92" r="3" class="fb sb"/><circle cx="390" cy="76" r="3" class="fb sb"/><circle cx="408" cy="80" r="3" class="fb sb"/><circle cx="425" cy="93" r="3" class="fb sb"/><circle cx="443" cy="92" r="3" class="fb sb"/><circle cx="460" cy="82" r="3" class="fb sb"/>
<circle cx="372" cy="150" r="3" class="fs" stroke="currentColor"/><circle cx="470" cy="140" r="3" class="fs" stroke="currentColor"/><text x="430" y="150" font-size="10" class="tm">noise</text>
<text x="413" y="180" text-anchor="middle" font-size="10.5" class="tm">crowded regions; lonely = noise</text><text x="413" y="196" text-anchor="middle" font-size="10.5" class="tb">DBSCAN, HDBSCAN, OPTICS</text>
<rect x="500" y="8" width="152" height="200" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="576" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Distribution</text>
<ellipse cx="555" cy="90" rx="38" ry="18" transform="rotate(-25 555 90)" fill="none" class="sb" stroke-width="2"/><ellipse cx="555" cy="90" rx="22" ry="10" transform="rotate(-25 555 90)" fill="none" class="sb"/>
<ellipse cx="605" cy="130" rx="22" ry="22" fill="none" class="sr" stroke-width="2"/><ellipse cx="605" cy="130" rx="12" ry="12" fill="none" class="sr"/>
<text x="576" y="180" text-anchor="middle" font-size="10.5" class="tm">soft bell-shaped clouds</text><text x="576" y="196" text-anchor="middle" font-size="10.5" class="tb">GMM (EM algorithm)</text>
<text x="330" y="236" text-anchor="middle" class="tm" font-size="11">Also: graph-based (spectral clustering), grid-based (STING), and model-free tricks (BIRCH summaries for huge data).</text>
</svg><figcaption>Four answers to "what is a group?". Each family has one algorithm you must know, and each has its own note in this group.</figcaption></figure>
  <table class="tbl">
    <tr><th>Family</th><th>A group is …</th><th>Needs k?</th><th>Shapes</th><th>Outliers</th><th>Scales to</th><th>Note</th></tr>
    <tr><td><strong>Centroid</strong></td><td>everything nearest to a centre</td><td>yes</td><td>round, similar size</td><td>forced in, pull the centre</td><td>millions</td><td><a class="xref" data-note="ml_kmeans">K-Means</a></td></tr>
    <tr><td><strong>Connectivity (hierarchical)</strong></td><td>a branch of a merge tree</td><td>no, cut later</td><td>depends on linkage</td><td>forced in</td><td>~10–20 thousand</td><td><a class="xref" data-note="ml_hierarchical">Hierarchical</a></td></tr>
    <tr><td><strong>Density</strong></td><td>a crowded region separated by sparse space</td><td>no (eps, min_samples)</td><td>any</td><td>labelled −1 (noise)</td><td>hundreds of thousands</td><td><a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a></td></tr>
    <tr><td><strong>Distribution</strong></td><td>one Gaussian bell in a mixture</td><td>yes (choose with BIC)</td><td>ellipses, different sizes</td><td>low probability</td><td>~100 thousand</td><td><a class="xref" data-note="ml_gmm">GMM</a></td></tr>
  </table>
  <h3>The four families on our six customers</h3>
  <p>Scale age and income (section 07) and ask one algorithm from each family for 2 groups:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering
Z6 = StandardScaler().fit_transform(cust[["age", "income"]])          # our six customers, scaled
fams = {"centroid   (k-means)":     KMeans(2, n_init=10, random_state=0),
        "hierarchy  (single)":      AgglomerativeClustering(2, linkage="single"),
        "density    (DBSCAN)":      DBSCAN(eps=0.6, min_samples=2),
        "distribution (GMM)":       GaussianMixture(2, random_state=0)}
for name, m in fams.items():
    lab = m.fit_predict(Z6)
    print(f"{name:24s}", dict(zip(cust.index, lab.tolist())))</div>
  <div class="fx" data-lang="text">centroid   (k-means)     {'A': 1, 'B': 0, 'C': 0, 'D': 0, 'E': 1, 'F': 0}
hierarchy  (single)      {'A': 1, 'B': 0, 'C': 0, 'D': 0, 'E': 1, 'F': 0}
density    (DBSCAN)      {'A': 0, 'B': -1, 'C': 1, 'D': -1, 'E': 0, 'F': 1}
distribution (GMM)       {'A': 1, 'B': 0, 'C': 0, 'D': 0, 'E': 1, 'F': 0}</div>
  <p>Three families agree: {A, E} (young, low income) vs {B, C, D, F}. DBSCAN, with a neighbourhood radius of 0.6 and at least 2 customers per dense patch, finds two tight pairs {A, E} and {C, F} and calls B and D <strong>noise</strong>: they have no close neighbour within 0.6 (B's nearest, D, is 1.22 away). Compare with Gower (section 06), which put B with A and E. Same customers, different distances and families, three different stories about B. That is not a bug: B really is a borderline customer, and each method answers a different question about him.</p>
  <p>Two more families worth one line: <strong>graph-based</strong> (spectral clustering cuts a neighbour graph where few edges cross; good on rings, costly for big n) and <strong>grid-based</strong> (merge dense grid cells; fast in low dimensions). BIRCH summarises millions of rows into small mini-clusters first.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partitional</strong> methods return one flat split; <strong>hierarchical</strong> methods a nested sequence of splits. <strong>Hard</strong> methods give one label per row; <strong>soft</strong> methods give probabilities. <strong>Parametric</strong> methods (K-Means, GMM) summarise each group with a few numbers and label new rows cheaply; non-parametric ones (DBSCAN, hierarchical) describe groups only through training rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Which algorithm is best?" has no answer without the data. The interview answer: "It depends on what I believe a group looks like, how many rows I have, whether I know k, whether outliers matter, and whether I must label new rows later."</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The workflow.</b> We have rulers, scaling and algorithm families. How do they fit into a real project, from "segment our customers" to a table a manager can act on?</div>

  <h2 id="cl-flow"><span class="num">10</span>A Clustering Project, End to End</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Six customers can be grouped by eye. Mrs. Kulkarni's full list has 600. In what order do the decisions of sections 01–09 happen, and what does the finished result look like?</p>
  </div>
  <div class="flow"><span>1. Goal: what decision will the groups drive?</span><span>2. Features tied to that decision</span><span>3. Clean, encode, cap outliers</span><span>4. Scale (or Gower)</span><span>5. Reduce dims if &gt; ~20</span><span>6. Distance + algorithm</span><span>7. k / parameters</span><span>8. Evaluate</span><span>9. Profile and name</span><span>10. Deploy and monitor</span></div>
  <p>Step 1 is the one people skip. "Segment our customers" is not a goal. "Find 3–5 groups that should get different discount offers" is: it says to use buying behaviour (visits, order size), and that 20 groups would be useless however good their score.</p>
  <p>Here are 600 customers of the same shop with three hidden types. Scaling and K-Means live in one pipeline, so new customers are scaled with the same numbers; silhouette (higher is better, max 1) helps choose k; a profile table explains the groups.</p>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(7)
n = [300, 200, 100]                                             # three hidden customer types
shop = pd.DataFrame({
    "age":    np.r_[rng.normal(24, 3, n[0]), rng.normal(38, 5, n[1]), rng.normal(52, 6, n[2])],
    "visits": np.r_[rng.poisson(14, n[0]), rng.poisson(4, n[1]), rng.poisson(2, n[2])],
    "order":  np.r_[rng.normal(400, 80, n[0]), rng.normal(1500, 250, n[1]), rng.normal(4000, 600, n[2])]})

for k in [2, 3, 4, 5]:                                          # choose k with a quick silhouette scan
    pipe = make_pipeline(StandardScaler(), KMeans(k, n_init=10, random_state=0))
    lab = pipe.fit_predict(shop)
    print(f"k={k} silhouette={silhouette_score(StandardScaler().fit_transform(shop), lab):.3f}")

pipe = make_pipeline(StandardScaler(), KMeans(3, n_init=10, random_state=0)).fit(shop)
shop["segment"] = pipe.predict(shop)
profile = shop.groupby("segment").agg(customers=("age", "size"), age=("age", "mean"),
                                      visits=("visits", "mean"), order=("order", "mean")).round(0)
print(profile)
new = pd.DataFrame({"age": [23, 55], "visits": [12, 1], "order": [350, 4200]})
print("new customers -&gt;", pipe.predict(new))</div>
  <div class="fx" data-lang="text">k=2 silhouette=0.582
k=3 silhouette=0.628
k=4 silhouette=0.533
k=5 silhouette=0.436
         customers   age  visits   order
segment                                 
0              201  37.0     4.0  1494.0
1              299  24.0    14.0   399.0
2              100  51.0     2.0  4144.0
new customers -&gt; [1 2]</div>
  <p>Silhouette peaks at k = 3 (0.628). The profile table is what Mrs. Kulkarni reads: segment 1 (299 customers) are about 24, visit 14 times a month, spend about ₹400 a visit, "frequent small-basket students"; segment 0 are about 37, visit 4 times, spend ₹1,494, "monthly family shoppers"; segment 2 are about 51, visit twice, spend ₹4,144, "big occasional buyers". The two new customers are routed to segments 1 and 2, matching their numbers.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A clustering is finished when every group can be described in one sentence a manager understands and the groups would be treated differently. If two segments would get the same offer, merge them; if a segment cannot be described, its features or k are wrong.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Segment ids are arbitrary. Re-run with another seed or next month's data and "segment 1" may become "segment 2". Never hard-code business rules on raw ids; match new centres to old ones by profile.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met a dozen ideas. Before moving on to the algorithms themselves, it helps to see in one place how each measure is built from the others and which question each one answers.</div>

  <h2 id="cl-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Euclidean, Manhattan, cosine, Jaccard, Gower, scaling: are they separate tricks to memorise, or one system? Which one do I reach for, and how do they relate on the same six customers?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="cl-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="6" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="24" text-anchor="middle" font-size="12" font-weight="700">Six customers A–F</text><text x="340" y="39" text-anchor="middle" class="tm" font-size="10">what kind of column?</text>
<line x1="280" y1="46" x2="95" y2="78" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="320" y1="46" x2="270" y2="78" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="360" y1="46" x2="440" y2="78" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="400" y1="46" x2="595" y2="78" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="15" y="80" width="160" height="34" rx="7" class="fb sb"/><text x="95" y="101" text-anchor="middle" font-size="11.5">amounts: age, income</text>
<rect x="190" y="80" width="160" height="34" rx="7" class="fb sb"/><text x="270" y="101" text-anchor="middle" font-size="11.5">a mix: spend vector</text>
<rect x="365" y="80" width="150" height="34" rx="7" class="fb sb"/><text x="440" y="101" text-anchor="middle" font-size="11.5">a set: basket</text>
<rect x="530" y="80" width="140" height="34" rx="7" class="fb sb"/><text x="600" y="101" text-anchor="middle" font-size="11.5">mixed: all columns</text>
<line x1="95" y1="114" x2="95" y2="136" stroke="currentColor" marker-end="url(#cl-a9)"/><text x="100" y="130" class="tm" font-size="9.5">scale first</text>
<rect x="15" y="138" width="160" height="58" rx="7" class="ft st"/><text x="95" y="155" text-anchor="middle" font-size="11">gaps |xᵢ − yᵢ| per column</text><text x="95" y="171" text-anchor="middle" font-size="11">combine with power p</text><text x="95" y="187" text-anchor="middle" class="tm" font-size="10">L1 · L2 · Lp · L∞</text>
<line x1="270" y1="114" x2="270" y2="136" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="190" y="138" width="160" height="58" rx="7" class="ft st"/><text x="270" y="155" text-anchor="middle" font-size="11">dot product ÷ lengths</text><text x="270" y="171" text-anchor="middle" font-size="11">= cosine (angle)</text><text x="270" y="187" text-anchor="middle" class="tm" font-size="10">unit rows: L2² = 2 − 2cos</text>
<line x1="175" y1="175" x2="188" y2="175" class="sr" stroke-dasharray="3 2" marker-end="url(#cl-a9)"/>
<line x1="440" y1="114" x2="440" y2="136" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="365" y="138" width="150" height="58" rx="7" class="ft st"/><text x="440" y="155" text-anchor="middle" font-size="11">shared ÷ union</text><text x="440" y="171" text-anchor="middle" font-size="11">= Jaccard</text><text x="440" y="187" text-anchor="middle" class="tm" font-size="10">SMC also counts 0–0</text>
<line x1="600" y1="114" x2="600" y2="136" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="530" y="138" width="140" height="58" rx="7" class="ft st"/><text x="600" y="155" text-anchor="middle" font-size="11">per column: L1/range</text><text x="600" y="171" text-anchor="middle" font-size="11">or 0/1 mismatch</text><text x="600" y="187" text-anchor="middle" class="tm" font-size="10">average = Gower</text>
<path d="M175,150 Q350,125 528,150" fill="none" class="sr" stroke-dasharray="3 2" marker-end="url(#cl-a9)"/><text x="352" y="128" text-anchor="middle" class="tr" font-size="9.5">Gower reuses L1 and range scaling</text>
<line x1="95" y1="196" x2="300" y2="236" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="270" y1="196" x2="320" y2="236" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="440" y1="196" x2="360" y2="236" stroke="currentColor" marker-end="url(#cl-a9)"/><line x1="600" y1="196" x2="380" y2="236" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="230" y="238" width="220" height="36" rx="8" class="fg sg"/><text x="340" y="260" text-anchor="middle" font-size="12" font-weight="700">distance matrix d(i, j)</text>
<line x1="340" y1="274" x2="340" y2="294" stroke="currentColor" marker-end="url(#cl-a9)"/>
<rect x="130" y="296" width="420" height="30" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="315" text-anchor="middle" font-size="11.5">a family decides what "a group" is: centroid · tree · density · distribution</text>
</svg><figcaption>How every concept in this note is built from the one before. The column type picks the ruler; every ruler ends in the same distance matrix; the algorithm family then turns distances into groups.</figcaption></figure>
  <p>The chain in words. Every distance starts from <strong>per-column gaps</strong>. Raise them to a power p, add, take the p-th root: that is Minkowski, with Manhattan (p = 1), Euclidean (p = 2) and Chebyshev (p = ∞) as settings of one dial. Squaring without the root gives the squared Euclidean that K-Means minimises. Divide each row by its length first and Euclidean turns into cosine (‖â − b̂‖² = 2 − 2cos). Turn rows into sets and count overlap: Jaccard. Divide each gap by the column's range (min-max scaling), use 0/1 mismatches for categories and average: Gower. Standard scaling sits in front of every amount-based ruler. Whatever ruler you pick, the result is the same object, a distance matrix, which an algorithm family turns into groups.</p>
  <table class="tbl"><caption>Every measure on the same six customers</caption>
    <tr><th>Measure</th><th>Built from</th><th>Answers</th><th>On our customers</th><th>Robust or sensitive</th><th>Use when</th></tr>
    <tr><td>Euclidean L2</td><td>√ of sum of squared gaps</td><td>how far apart are the amounts?</td><td>A–D 44.72; A–E 3.61</td><td>sensitive to scale and to one big gap</td><td>scaled numeric data, K-Means, Ward</td></tr>
    <tr><td>Squared L2</td><td>L2 without the root</td><td>K-Means' cost</td><td>A–D 2,000</td><td>very sensitive (squares); not a metric</td><td>objectives, not neighbour search</td></tr>
    <tr><td>Manhattan L1</td><td>sum of absolute gaps</td><td>total of independent differences</td><td>A–D 60</td><td>less hurt by one big gap</td><td>outliers, grids, many columns</td></tr>
    <tr><td>Minkowski Lp</td><td>p-th root of sum of p-th powers</td><td>a dial between L1 and L∞</td><td>A–D 41.60 (p = 3)</td><td>more sensitive as p grows</td><td>tuning a distance</td></tr>
    <tr><td>Chebyshev L∞</td><td>largest gap only</td><td>what is the worst single difference?</td><td>A–D 40</td><td>ignores all but one column</td><td>tolerances</td></tr>
    <tr><td>Cosine</td><td>dot product ÷ lengths</td><td>same mix, ignoring size?</td><td>A–B 1.0; A–C 0.423</td><td>robust to size; blind to it</td><td>text, embeddings, spend mixes</td></tr>
    <tr><td>Jaccard</td><td>shared ÷ union of sets</td><td>how much do the baskets overlap?</td><td>A–E 0.75; A–B 0.4</td><td>ignores 0–0 (good for sparse)</td><td>baskets, tags, sparse binary</td></tr>
    <tr><td>SMC</td><td>matching positions ÷ total</td><td>how many yes/no answers agree?</td><td>A–B 0.7</td><td>inflated by shared absences</td><td>symmetric binary only</td></tr>
    <tr><td>Gower</td><td>average of range-scaled L1 and 0/1 mismatches</td><td>one distance for a mixed card</td><td>A–E 0.031; A–B 0.491</td><td>range-sensitive to outliers; handles missing</td><td>mixed tables, small n</td></tr>
    <tr><td>Standard scaling</td><td>mean and std of each column</td><td>make columns count equally</td><td>B's nearest: E (raw) → D (scaled)</td><td>sensitive to outliers</td><td>default before L1/L2</td></tr>
    <tr><td>Robust scaling</td><td>median and IQR</td><td>scale ignoring outliers</td><td>A's age → −1.17</td><td>robust; odd on bimodal columns</td><td>heavy outliers</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Three questions pick the ruler: <strong>What type is the column?</strong> (amount, mix, set, mixed) <strong>Does size matter or only proportion?</strong> (L2 vs cosine) <strong>Do shared absences mean anything?</strong> (SMC vs Jaccard). Then one more question picks the family: <strong>what does a group look like?</strong></p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The group map.</b> This note gave the rulers. The next five notes are the algorithms that use them. In what order, and how do they compare?</div>

  <h2 id="cl-group"><span class="num">12</span>The Group Map: Reading Order</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which algorithm note should come next, and why in that order?</p>
  </div>
  <table class="tbl">
    <tr><th>#</th><th>Note</th><th>Answers</th><th>Key ideas</th><th>Leaves open</th></tr>
    <tr><td>1</td><td><a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a> (this note)</td><td>What is "alike"?</td><td>metrics, cosine, Jaccard, Gower, scaling, shapes, families</td><td>no algorithm yet</td></tr>
    <tr><td>2</td><td><a class="xref" data-note="ml_kmeans">K-Means</a></td><td>Fast flat groups around centres</td><td>inertia, Lloyd's loop, k-means++, elbow, silhouette, gap</td><td>needs k; round groups; outliers</td></tr>
    <tr><td>3</td><td><a class="xref" data-note="ml_hierarchical">Hierarchical</a></td><td>All k at once, as a tree</td><td>linkage, dendrogram, cutting, chaining, Ward</td><td>n² cost; no noise label</td></tr>
    <tr><td>4</td><td><a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a></td><td>Any shape, with noise</td><td>eps, min_samples, core/border/noise, k-distance plot</td><td>one density level; no soft membership</td></tr>
    <tr><td>5</td><td><a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a></td><td>Soft, elliptical groups</td><td>EM, responsibilities, covariance types, BIC</td><td>assumes bell shapes</td></tr>
    <tr><td>6</td><td><a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a></td><td>Is any of it good?</td><td>silhouette, Davies-Bouldin, ARI, NMI, stability, profiling</td><td>→ next group: <a class="xref" data-note="ml_dimred">Dimensionality Reduction</a></td></tr>
  </table>
  <p>How they connect: K-Means is a GMM with equal round covariances and hard assignments. Ward linkage uses K-Means' objective (within-group squared distance) one merge at a time. Single linkage and DBSCAN both chain neighbours; HDBSCAN is a hierarchical method over densities. All are judged with the same toolkit in Evaluating Clusters.</p>
  <table class="tbl"><caption>Quick comparison of the siblings</caption>
    <tr><th></th><th>K-Means</th><th>Hierarchical</th><th>DBSCAN / HDBSCAN</th><th>GMM</th></tr>
    <tr><td>You must give</td><td>k</td><td>linkage; cut height or k</td><td>eps, min_samples / min_cluster_size</td><td>components, covariance type</td></tr>
    <tr><td>Distances allowed</td><td>squared Euclidean only</td><td>any (Ward: Euclidean)</td><td>any</td><td>Mahalanobis inside the model</td></tr>
    <tr><td>Output</td><td>hard labels + centres</td><td>tree → hard labels</td><td>hard labels + noise</td><td>soft probabilities</td></tr>
    <tr><td>New rows</td><td><code>predict</code></td><td>no predict</td><td>no predict (HDBSCAN: approximate)</td><td><code>predict_proba</code></td></tr>
    <tr><td>Cost</td><td>O(n·k·d) per pass</td><td>O(n²) memory, O(n²)–O(n³) time</td><td>~O(n log n) with an index</td><td>O(n·k·d²) per pass</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_kmeans">K-Means</a>.</b> We know what a distance is and what families exist, but not how any algorithm actually finds its groups. K-Means is the simplest: start there.</div>

  <h2 id="cl-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: forgetting to scale</span>
    <p>In raw rupees B's nearest customer is E and age is ignored; at scale, raw age + income gave ARI −0.002 and scaled 1.000. Put the scaler in a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scaling blindly</span>
    <p>Scaling is weighting. Robust scaling shrank a bimodal age column and broke the clustering again. Profile which columns drive the groups and set weights on purpose.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one-hot + Euclidean for categories</span>
    <p>A 50-city one-hot block dominates the distance, and "the mean of Pune and Delhi" is meaningless for K-Means. Use Gower with a precomputed-distance algorithm, or k-prototypes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Euclidean on mixes, text or embeddings</span>
    <p>Size dominates: B (A's mix ×3) was 7.48 from A while the electronics buyer C was 3.74. Use cosine, or L2-normalise rows then use Euclidean.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: SMC on sparse binary data</span>
    <p>Shared zeros make everyone look alike (A–B 0.7 vs Jaccard 0.4). Use Jaccard when 1 is rare and meaningful.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: clustering hundreds of raw columns</span>
    <p>Distances concentrate (11% contrast at d = 1,000). Select or reduce features first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: believing the clusters exist</span>
    <p>Every algorithm returns groups, even on noise. Check stability and business meaning before presenting them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging by a toy dataset</span>
    <p>On round, well-separated blobs every algorithm scores 0.99. Real data looks like the "unequal" or "stretched" rows of the shape table.</p>
  </div>

  <h2 id="cl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Everything in this note on one sheet. The running example: six shop customers A–F with age, income, city, has_card, a spend mix (grocery, fashion, electronics in ₹1000) and a basket.</p>
  <h3>The question ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Weakness that leads on</th></tr>
    <tr><td>Clustering</td><td>Can we find groups with no labels?</td><td>needs a number for "alike"</td></tr>
    <tr><td>Distance &amp; metric rules</td><td>What is a valid "alike" number?</td><td>which formula?</td></tr>
    <tr><td>Euclidean L2</td><td>Straight-line gap between amounts</td><td>one big gap dominates</td></tr>
    <tr><td>L1, Lp, L∞</td><td>Other ways to add up gaps</td><td>all compare raw size</td></tr>
    <tr><td>Cosine</td><td>Same mix regardless of size?</td><td>needs numeric vectors</td></tr>
    <tr><td>Jaccard</td><td>How much do two sets overlap?</td><td>only sets</td></tr>
    <tr><td>Gower</td><td>One distance for a mixed table</td><td>other rulers still need scaling</td></tr>
    <tr><td>Scaling</td><td>Do units change "nearest"?</td><td>many columns still break distance</td></tr>
    <tr><td>Curse of dimensionality</td><td>Does distance survive 1,000 columns?</td><td>algorithms still disagree</td></tr>
    <tr><td>Shapes</td><td>Why do algorithms disagree?</td><td>need the families</td></tr>
    <tr><td>Four families</td><td>What is "a group"?</td><td>need a project workflow</td></tr>
    <tr><td>Workflow</td><td>From raw table to named segments</td><td>→ K-Means</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Hard clustering</td><td>partition C₁ … C_k</td><td>each row in exactly one non-empty group</td></tr>
    <tr><td>Soft clustering</td><td>r_ij ≥ 0, Σⱼ r_ij = 1</td><td>r_ij = share of row i in group j</td></tr>
    <tr><td>Metric</td><td>d ≥ 0; d = 0 ⇔ x = y; d(x,y) = d(y,x); d(x,z) ≤ d(x,y) + d(y,z)</td><td>x, y, z rows</td></tr>
    <tr><td>Euclidean</td><td>√Σᵢ(xᵢ − yᵢ)²</td><td>i runs over columns</td></tr>
    <tr><td>Manhattan</td><td>Σᵢ|xᵢ − yᵢ|</td><td></td></tr>
    <tr><td>Minkowski</td><td>(Σᵢ|xᵢ − yᵢ|ᵖ)^(1/p)</td><td>p = 1 L1, 2 L2, ∞ Chebyshev max |xᵢ − yᵢ|</td></tr>
    <tr><td>Cosine similarity</td><td>a·b / (‖a‖‖b‖)</td><td>a·b = Σ aᵢbᵢ; ‖a‖ = √Σ aᵢ²; distance = 1 − cos</td></tr>
    <tr><td>Unit-vector link</td><td>‖â − b̂‖² = 2 − 2cos</td><td>â = a/‖a‖</td></tr>
    <tr><td>Jaccard</td><td>|S∩T| / |S∪T| = a/(a + b + c)</td><td>a = 1–1, b = 1–0, c = 0–1 positions</td></tr>
    <tr><td>SMC</td><td>(a + d)/(a + b + c + d)</td><td>d = 0–0 positions</td></tr>
    <tr><td>Gower</td><td>Σ w δ d^(f) / Σ w δ</td><td>d^(f): |Δ|/range or 0/1; δ = 0 if skipped</td></tr>
    <tr><td>Standard / min-max / robust</td><td>(x − x̄)/s · (x − min)/(max − min) · (x − median)/IQR</td><td>s = std, IQR = Q3 − Q1</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Pair</th><th>Measure</th><th>Hand calculation</th><th>Value</th></tr>
    <tr><td>A(25, 40) – D(45, 80)</td><td>L2 / L1 / L3 / L∞</td><td>√(20² + 40²) · 20 + 40 · 72,000^(1/3) · max</td><td>44.72 / 60 / 41.60 / 40</td></tr>
    <tr><td>A – E</td><td>L2 (age, ₹1000)</td><td>√(3² + 2²)</td><td>3.61</td></tr>
    <tr><td>A – D vs A – E – D</td><td>squared L2</td><td>2,000 vs 13 + 1,733</td><td>triangle rule broken</td></tr>
    <tr><td>A [3,2,1] – B [9,6,3]</td><td>cosine / L2</td><td>42 / (3.742 × 11.225) · √56</td><td>1.0 / 7.48</td></tr>
    <tr><td>A – C [0,1,3]</td><td>cosine / L2</td><td>5 / (3.742 × 3.162) · √14</td><td>0.423 / 3.74</td></tr>
    <tr><td>A – E baskets</td><td>Jaccard</td><td>3/4</td><td>0.75</td></tr>
    <tr><td>A – B baskets</td><td>Jaccard / SMC</td><td>2/5 · 7/10</td><td>0.4 / 0.7</td></tr>
    <tr><td>A – E, A – B, A – C</td><td>Gower</td><td>(0.1 + 0.025 + 0 + 0)/4 · (0.9 + 0.0625 + 0 + 1)/4 · 3/4</td><td>0.031 · 0.491 · 0.750</td></tr>
    <tr><td>B's nearest customer</td><td>L2 raw vs scaled</td><td>3,000.1 vs 35,000 · 2.05 vs 1.22</td><td>E (raw) → D (scaled)</td></tr>
    <tr><td>Four families, k = 2</td><td>scaled age, income</td><td>—</td><td>{A,E} vs {B,C,D,F}; DBSCAN: B, D noise</td></tr>
  </table>
  <h3>When to use what</h3>
  <div class="cards">
    <div><b>Euclidean</b><p>Scaled numeric columns, few dimensions, K-Means and Ward.</p><small>Not on raw mixed units</small></div>
    <div><b>Manhattan</b><p>Outliers in a few columns, many columns, additive costs.</p><small>Not with K-Means (use k-medians)</small></div>
    <div><b>Cosine</b><p>Text, embeddings, spending mixes: proportion matters, size does not.</p><small>Not when size is the signal</small></div>
    <div><b>Jaccard</b><p>Sets and sparse binary data: baskets, tags, symptoms.</p><small>Not for symmetric yes/no (use SMC)</small></div>
    <div><b>Gower</b><p>Mixed numeric + categorical tables, small n, missing values.</p><small>Not for huge n; cap outliers first</small></div>
    <div><b>Standard scaling</b><p>The default before any L1/L2-based clustering.</p><small>Check bimodal and outlier columns</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Unscaled columns decide everything. Scaling is weighting. Squared L2 and cosine are not metrics. Euclidean on mixes/text lets size dominate. SMC is inflated by shared zeros. Gower's range is wrecked by outliers. Distances concentrate in high dimensions. Every algorithm returns groups even on noise. Internal scores prefer round blobs (moons: wrong split silhouette 0.49 vs true 0.38).</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>L1, L2, L∞ between (25, 40) and (45, 80)?</td><td>60, 44.72, 40</td></tr>
    <tr><td>Cosine of [3,2,1] and [9,6,3]? Why?</td><td>1.0: same direction, only the length differs</td></tr>
    <tr><td>Jaccard of {milk, bread, eggs, butter} and {milk, bread, eggs}?</td><td>3/4 = 0.75</td></tr>
    <tr><td>Gower partial distance for ages 25 and 52 when the age range is 30?</td><td>27/30 = 0.9</td></tr>
    <tr><td>Which family labels outliers as noise?</td><td>Density (DBSCAN / HDBSCAN), label −1</td></tr>
  </table>

  <h2 id="cl-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is clustering and how does it differ from classification?</summary><div class="qa-body">Clustering splits rows into groups of similar rows when there is no answer column (unsupervised). Classification learns to predict a known answer column (supervised). Clustering has no "correct" output, so it is judged by internal scores, stability and usefulness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute Euclidean, Manhattan and Chebyshev distance between (25, 40) and (45, 80).</summary><div class="qa-body">Gaps 20 and 40. Euclidean √(400 + 1600) = 44.72; Manhattan 60; Chebyshev 40. Minkowski p = 3 gives 72,000^(1/3) ≈ 41.60, between L2 and L∞.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four metric rules, and does squared Euclidean satisfy them?</summary><div class="qa-body">Non-negativity, identity, symmetry, triangle inequality. Squared Euclidean fails the last: on our customers d²(A, D) = 2,000 &gt; d²(A, E) + d²(E, D) = 1,746. Fine as an objective (K-Means), but tree-based neighbour search assumes a metric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use cosine instead of Euclidean? Give a numeric reason.</summary><div class="qa-body">When proportion matters and size does not: text, embeddings, spending mixes. B spends A's mix ×3: cosine 1.0 but Euclidean 7.48, more than the 3.74 to the electronics buyer C. For unit vectors ‖a − b‖² = 2 − 2cos, so normalising rows then using Euclidean/K-Means is equivalent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why Jaccard rather than simple matching for baskets?</summary><div class="qa-body">SMC counts items neither customer bought. A vs B: SMC 0.7, Jaccard 0.4; in a 20,000-item shop SMC is ~1.0 for everyone. Shared absences say nothing about taste, so for asymmetric binary data use Jaccard.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Gower handle a row with age, income, city and a yes/no column?</summary><div class="qa-body">Per column: numeric gap ÷ range; category or binary 0 if equal else 1 (or skip 0–0 if asymmetric); average. A vs B: (27/30 + 5/80 + 0 + 1)/4 = 0.491. Use with algorithms accepting a precomputed matrix (hierarchical, k-medoids, DBSCAN).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why scale before K-Means or DBSCAN, and is standard scaling always right?</summary><div class="qa-body">The column with the largest units dominates: in raw rupees B's nearest customer is E and age is ignored; scaled, it is D. At scale raw ARI was −0.002 vs 1.000 scaled. Not always right: robust scaling on a bimodal column broke it again. Scaling sets feature weights.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the curse of dimensionality for clustering with a number.</summary><div class="qa-body">For 200 uniform points the farthest neighbour was ~14× as far as the nearest in 2D, but only 11% farther in 1,000D. When all distances are nearly equal, nearest-centre and density decisions become noise. Reduce or select features first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the four families and one algorithm each. What did they do to our six customers?</summary><div class="qa-body">Centroid (K-Means), hierarchical (agglomerative), density (DBSCAN), distribution (GMM). K-Means, single linkage and GMM gave {A, E} vs {B, C, D, F}; DBSCAN found {A, E} and {C, F} and labelled B and D noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two interleaved moons: which algorithms work and why does K-Means fail?</summary><div class="qa-body">Single linkage (ARI 1.00) and DBSCAN (0.99) chain close neighbours. K-Means (0.47) assigns to the nearest centre, so its boundary is a straight line between two centres, which cuts both moons. Its silhouette (0.49) even beats the true moons (0.38).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your clustering returned 5 neat groups. How do you know they are real?</summary><div class="qa-body">Algorithms return groups even on noise. Compare scores against the same algorithm on uniform/shuffled data (the gap-statistic idea), check stability across bootstrap samples and seeds, and check that profiles differ in ways that matter. See Evaluating Clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is clustering related to K-Nearest Neighbors?</summary><div class="qa-body">Both rest on "close rows are alike" and need the same care with distance, scaling and dimensions. KNN is supervised (neighbours vote on a known label); clustering is unsupervised (neighbours define the groups). DBSCAN uses the same neighbour indexes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is Gower built from earlier ideas in this note?</summary><div class="qa-body">Its numeric part is the Manhattan gap divided by the column's range, which is min-max scaling; its categorical part is a 0/1 mismatch, like a one-column Hamming distance; its asymmetric-binary rule is Jaccard's "ignore 0–0". It then averages them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does clustering use the Dimensionality Reduction group?</summary><div class="qa-body">High dimensions concentrate distances, so a common pipeline is scale → PCA or UMAP → cluster. 2D projections are also how you look at clusters, though clustering on a t-SNE picture is risky since t-SNE distorts sizes and distances.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Marketing wants "segments". What do you ask before writing any code?</summary><div class="qa-body">What decision will the segments drive? How many can the team act on? Which behaviours matter for it? How will new customers be assigned, and how often refreshed? These choose the features, k range, algorithm (must it predict new rows?) and evaluation.</div></details>
</main>
`
});
