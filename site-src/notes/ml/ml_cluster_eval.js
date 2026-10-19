// notes/ml/ml_cluster_eval.js — Evaluating Clusters
Object.assign(TOPIC_CONTENT, {
  "ml_cluster_eval": `<main>
  <h1>Evaluating Clusters</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>Evaluating Clusters</span></div>
  <p class="lead">A clustering algorithm always returns an answer, even on random noise. This note is about deciding whether the answer is any good. It follows one running example, nine customers' monthly spend, through every kind of check: internal scores that use only the data (silhouette, Davies–Bouldin and Calinski–Harabasz, each computed by hand), external scores for when true labels exist (purity, Rand index, adjusted Rand index, homogeneity, completeness, V-measure, mutual information, NMI, AMI and Fowlkes–Mallows, again by hand from one contingency table), stability under resampling, and the business checks that decide whether a segmentation is actually used: profiling, explaining clusters with a small tree, and validating against an outcome. It ends with how to choose an algorithm.</p>

  <h2 id="ce-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 240" width="660">
<defs><marker id="ce-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Clustering</text>
<rect x="245" y="26" width="170" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="330" y="45" text-anchor="middle" font-size="12.5">The Idea &amp; Distances</text><text x="330" y="61" text-anchor="middle" class="tm" font-size="10.5">what "similar" means</text>
<line x1="280" y1="70" x2="95" y2="104" stroke="currentColor" marker-end="url(#ce-fa)"/>
<line x1="310" y1="70" x2="255" y2="104" stroke="currentColor" marker-end="url(#ce-fa)"/>
<line x1="350" y1="70" x2="415" y2="104" stroke="currentColor" marker-end="url(#ce-fa)"/>
<line x1="380" y1="70" x2="570" y2="104" stroke="currentColor" marker-end="url(#ce-fa)"/>
<rect x="20" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="95" y="134" text-anchor="middle" font-size="12.5">K-Means</text>
<rect x="180" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="255" y="134" text-anchor="middle" font-size="12.5">Hierarchical</text>
<rect x="340" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="415" y="134" text-anchor="middle" font-size="12.5">DBSCAN &amp; HDBSCAN</text>
<rect x="500" y="106" width="140" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="570" y="134" text-anchor="middle" font-size="12.5">Gaussian Mixtures</text>
<line x1="95" y1="152" x2="300" y2="186" stroke="currentColor" marker-end="url(#ce-fa)"/>
<line x1="255" y1="152" x2="315" y2="186" stroke="currentColor" marker-end="url(#ce-fa)"/>
<line x1="415" y1="152" x2="345" y2="186" stroke="currentColor" marker-end="url(#ce-fa)"/>
<line x1="570" y1="152" x2="360" y2="186" stroke="currentColor" marker-end="url(#ce-fa)"/>
<rect x="235" y="188" width="190" height="48" rx="8" class="fb sb" stroke-width="3"/>
<text x="330" y="208" text-anchor="middle" font-size="12.5" font-weight="700">Evaluating Clusters</text><text x="330" y="226" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE · judges them all</text>
</svg><figcaption>The Clustering group. Every algorithm above produces labels; this note decides whether those labels are any good, and which algorithm to use.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_kmeans">K-Means</a>, <a class="xref" data-note="ml_hierarchical">Hierarchical</a>, <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a>, <a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a></b><span>Each algorithm returned labels and had its own way of choosing k (elbow, dendrogram gap, k-distance plot, BIC). What was left open: one common way to judge any clustering, to compare algorithms with each other, and to tell a real structure from an artefact of the method.</span></li>
    <li><b>This note adds: the toolkit for judging clusters</b><span>Internal scores (from the data alone), external scores (against known labels), stability (does the answer survive resampling?) and business validation (is it useful?). Every score is computed by hand on nine customers before any code.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_dimred">Dimensionality Reduction</a></b><span>Many evaluation problems come from too many features (distances concentrate, silhouettes flatten). The next group shows how to reduce dimensions before clustering and how to draw clusters in 2-D. In the supervised world the matching note is <a class="xref" data-note="ml_evaluation">Classification Metrics</a>, whose confusion matrix is the cousin of this note's contingency table.</span></li>
  </ol>
  <p>You should know what a cluster label, a centroid and Euclidean distance are (<a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>, <a class="xref" data-note="ml_kmeans">K-Means</a>). Entropy is re-explained where it is used.</p>

  <h2 id="ce-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>The note as one chain of questions; every answer is computed on the same nine customers.</p>
  <ol class="story">
    <li><b>Why evaluate at all</b><span>Q: K-Means gave labels for k = 2, 3 and 4. Which is right? → Without labels there is no accuracy, so we need scores built from the data itself…</span></li>
    <li><b>Silhouette</b><span>Q: is each point closer to its own cluster than to the next one? → s = (b − a) / max(a, b) per point; k = 3 gives 0.752. But it needs every pairwise distance and judges point by point…</span></li>
    <li><b>Davies–Bouldin</b><span>Q: can we judge whole clusters, cheaply, from centroids? → For each cluster, its worst "spread over separation" ratio; k = 3 gives 0.241 (lower is better). But it uses only centroid distances…</span></li>
    <li><b>Calinski–Harabasz</b><span>Q: how much of the total variation is between clusters rather than inside them? → (B/(k−1)) / (W/(n−k)); k = 3 gives 109. But all three internal scores reward round, compact clusters…</span></li>
    <li><b>Internal scores together</b><span>Q: do they agree, and can they be fooled? → They agree on k = 3 here, but all three prefer K-Means' wrong cut on the moons. When true labels exist, compare with them instead…</span></li>
    <li><b>Contingency table and purity</b><span>Q: how do clusters line up with known segments? → Count customers per (segment, cluster); purity 0.889. But purity reaches 1 by giving everyone their own cluster…</span></li>
    <li><b>Rand index, ARI, Fowlkes–Mallows</b><span>Q: what if we compare pairs of customers instead? → RI 0.861, but random labels score high, so correct for chance: ARI 0.643. But pair counts do not say <em>which</em> way the error goes…</span></li>
    <li><b>Homogeneity, completeness, V-measure, NMI, AMI</b><span>Q: are clusters pure, are segments kept together? → 0.800 and 0.773, combined 0.786; AMI corrects for chance (0.692). But real projects rarely have labels…</span></li>
    <li><b>Stability</b><span>Q: does the clustering survive small changes in the data? → Resample and compare: k = 3 always reproduces, k = 2 and 4 do not. But a stable clustering can still be useless…</span></li>
    <li><b>Business validation</b><span>Q: are the clusters different in ways that matter? → Profile them, explain them with a small tree, check an outcome (response rate 0, 0.67, 1.0). Finally: which algorithm should we use?</span></li>
  </ol>

  <h2 id="ce-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Evaluating Clusters</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · The problem</div>
        <ul>
          <li>Every algorithm returns labels, even on noise</li>
          <li>Four kinds of check: <b>internal</b> (data only), <b>external</b> (true labels), <b>stability</b>, <b>business</b></li>
          <li>Running example: spend 1, 2, 3, 6, 7, 8, 13, 14, 15 (C1–C9); K-Means k = 2, 3, 4</li>
          <li>💡 Judging a seating plan: are friends together (cohesion) and rival groups apart (separation)?</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Internal</div>
        <ul>
          <li><b>Silhouette</b> s = (b − a)/max(a, b), −1…1, higher better; k = 3: 0.752</li>
          <li><b>Davies–Bouldin</b> = mean over clusters of maxⱼ (Sᵢ + Sⱼ)/Mᵢⱼ, ≥ 0, lower better; 0.241</li>
          <li><b>Calinski–Harabasz</b> = (B/(k−1)) / (W/(n−k)), higher better; 109 (B 218, W 6)</li>
          <li>All three pick k = 3 here (and k = 4 on 4 blobs)</li>
          <li>⚠ All favour convex blobs: moons K-Means sil 0.494 vs correct DBSCAN 0.385</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · External: counts &amp; pairs</div>
        <ul>
          <li><b>Contingency table</b> n_ij = items in true class i and cluster j</li>
          <li><b>Purity</b> = Σⱼ maxᵢ n_ij / n = 0.889 (⚠ singletons → 1)</li>
          <li>Pairs: TP 7, FP 2, FN 3, TN 24 of 36</li>
          <li><b>RI</b> = (TP+TN)/pairs = 0.861; <b>ARI</b> = (Σ C(n_ij,2) − E)/(max − E) = 0.643</li>
          <li><b>Fowlkes–Mallows</b> = TP/√((TP+FP)(TP+FN)) = 0.738</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · External: entropy</div>
        <ul>
          <li><b>Homogeneity</b> = 1 − H(C|K)/H(C) = 0.800 (each cluster one class)</li>
          <li><b>Completeness</b> = 1 − H(K|C)/H(K) = 0.773 (each class one cluster)</li>
          <li><b>V-measure</b> = harmonic mean = 0.786 = NMI (arithmetic)</li>
          <li><b>MI</b> = H(C) − H(C|K) = 0.849 nats · <b>AMI</b> (chance-corrected) 0.692</li>
          <li>Use <b>ARI</b> or <b>AMI</b> by default; all are label-permutation invariant</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Stability</div>
        <ul>
          <li>Subsample / bootstrap, re-cluster, compare on shared rows with ARI</li>
          <li>Customers: k = 3 → 1.000 every time; k = 2 → 0.892 (worst −0.077); k = 4 → 0.858</li>
          <li>Per-cluster: <b>Jaccard</b> = |A∩B|/|A∪B| (Hennig: &gt; 0.75 stable, &lt; 0.5 dissolved)</li>
          <li>⚠ Stable ≠ right: k = 3 on 4 blobs is perfectly stable (two blobs always merged)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Business &amp; choice</div>
        <ul>
          <li><b>Profile</b>: size, means, z-scores per cluster; name each in one line</li>
          <li><b>Surrogate tree</b>: depth-2 tree reproduces clusters 100% (visits ≤ 3, spend ≤ 10.5)</li>
          <li><b>Outcome</b>: coupon response 0.00 / 0.67 / 1.00 → segments matter</li>
          <li>Choose: round → K-Means/GMM; shapes/noise → HDBSCAN; tilted → GMM; taxonomy → hierarchical</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ce-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ce-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Evaluation Is Hard</span><span class="rm-sub">Nine customers, three answers</span></div></div>
      <div class="rm-item rm-done" data-target="ce-sil"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Silhouette</span><span class="rm-sub">a, b and s by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ce-db"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Davies–Bouldin</span><span class="rm-sub">Scatter over separation</span></div></div>
      <div class="rm-item rm-done" data-target="ce-ch"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Calinski–Harabasz</span><span class="rm-sub">Between vs within variance</span></div></div>
      <div class="rm-item rm-done" data-target="ce-internal"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Internal Scores Together</span><span class="rm-sub">Choosing k, and the moons trap</span></div></div>
      <div class="rm-item rm-done" data-target="ce-cont"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Contingency Table &amp; Purity</span><span class="rm-sub">When labels exist</span></div></div>
      <div class="rm-item rm-done" data-target="ce-pairs"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pair Counting: RI, ARI, FM</span><span class="rm-sub">36 pairs by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ce-info"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Entropy-Based Scores</span><span class="rm-sub">Homogeneity to AMI</span></div></div>
      <div class="rm-item rm-done" data-target="ce-extuse"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Which External Score?</span><span class="rm-sub">Degenerate cases</span></div></div>
      <div class="rm-item rm-done" data-target="ce-stab"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Stability Analysis</span><span class="rm-sub">Resampling and Jaccard</span></div></div>
      <div class="rm-item rm-done" data-target="ce-biz"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Business Validation</span><span class="rm-sub">Profiles, surrogate tree, outcomes</span></div></div>
      <div class="rm-item rm-done" data-target="ce-choose"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Choosing an Algorithm</span><span class="rm-sub">Five algorithms, three data sets</span></div></div>
      <div class="rm-item rm-done" data-target="ce-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every score on the nine customers</span></div></div>
      <div class="rm-item rm-done" data-target="ce-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="ce-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ce-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ce-why"><span class="num">01</span>Why Evaluating Clusters Is Hard</h2>
  <p><strong>The question we can't answer yet.</strong> In supervised learning we compare predictions with the answer column. Clustering has no answer column. So how do we know whether a clustering is good, or which of several is best?</p>
  <h3>The running example: nine customers</h3>
  <p>A small shop knows each customer's monthly spend (₹ thousand):</p>
  <table class="tbl">
    <tr><th>Customer</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>C5</th><th>C6</th><th>C7</th><th>C8</th><th>C9</th></tr>
    <tr><td>spend</td><td>1</td><td>2</td><td>3</td><td>6</td><td>7</td><td>8</td><td>13</td><td>14</td><td>15</td></tr>
  </table>
  <p>Later we will also use their visits per month, whether they used last month's coupon, and the segment the sales team had written in the CRM. For now, only spend. K-Means with three different k:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans

spend = np.array([1, 2, 3, 6, 7, 8, 13, 14, 15], dtype=float)   # monthly spend, Rs thousand, customers C1..C9
X = spend.reshape(-1, 1)
labels = {k: KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X) for k in (2, 3, 4)}
for k, l in labels.items():
    print(f"k={k}:", l)</div>
  <div class="fx" data-lang="text">k=2: [0 0 0 0 0 0 1 1 1]
k=3: [2 2 2 0 0 0 1 1 1]
k=4: [2 2 2 3 0 0 1 1 1]</div>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
<line x1="30" y1="60" x2="620" y2="60" stroke="currentColor" stroke-opacity="0.4"/>
<g class="tm" font-size="10" text-anchor="middle"><text x="70" y="80">1</text><text x="108" y="80">2</text><text x="146" y="80">3</text><text x="260" y="80">6</text><text x="298" y="80">7</text><text x="336" y="80">8</text><text x="526" y="80">13</text><text x="564" y="80">14</text><text x="602" y="80">15</text></g>
<circle cx="70" cy="60" r="8" class="fb sb"/><circle cx="108" cy="60" r="8" class="fb sb"/><circle cx="146" cy="60" r="8" class="fb sb"/>
<circle cx="260" cy="60" r="8" class="fg sg"/><circle cx="298" cy="60" r="8" class="fg sg"/><circle cx="336" cy="60" r="8" class="fg sg"/>
<circle cx="526" cy="60" r="8" class="fr sr"/><circle cx="564" cy="60" r="8" class="fr sr"/><circle cx="602" cy="60" r="8" class="fr sr"/>
<g font-size="11" text-anchor="middle" font-weight="700"><text x="70" y="40">C1</text><text x="108" y="40">C2</text><text x="146" y="40">C3</text><text x="260" y="40">C4</text><text x="298" y="40">C5</text><text x="336" y="40">C6</text><text x="526" y="40">C7</text><text x="564" y="40">C8</text><text x="602" y="40">C9</text></g>
<text x="108" y="105" text-anchor="middle" class="tb" font-size="11">cluster 0 (centroid 2)</text>
<text x="298" y="105" text-anchor="middle" class="tg" font-size="11">cluster 1 (centroid 7)</text>
<text x="564" y="105" text-anchor="middle" class="tr" font-size="11">cluster 2 (centroid 14)</text>
<text x="320" y="135" text-anchor="middle" class="tm" font-size="11">spend (₹ thousand) · the k = 3 clustering used throughout · gaps of 3 and 5 between groups</text>
</svg><figcaption>The nine customers on a line with the k = 3 clustering. In code we renumber these clusters 0, 1, 2 from left to right (K-Means' own numbering is arbitrary).</figcaption></figure>
  <p>Which is right: two groups, three or four? Nothing in the output says. K-Means returns k clusters for any k you ask, and would happily return three clusters for nine random numbers. This is the core difficulty: <strong>every clustering algorithm always returns an answer</strong>.</p>
  <h3>Four kinds of evidence</h3>
  <div class="cards">
    <div><b>Internal</b><p>Use only the data and the labels: are clusters tight and well separated?</p><small>silhouette, Davies–Bouldin, Calinski–Harabasz</small></div>
    <div><b>External</b><p>Compare with known labels (a benchmark, a hand-labelled sample, a CRM field).</p><small>purity, ARI, NMI, AMI, V-measure…</small></div>
    <div><b>Stability</b><p>Does the same structure come back when the data is resampled or the seed changes?</p><small>bootstrap ARI, Jaccard per cluster</small></div>
    <div><b>Business</b><p>Are the clusters different in ways that matter, and can people act on them?</p><small>profiles, surrogate tree, outcomes</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a wedding seating plan without asking the guests. Internally: are people at each table close to each other, and tables different from each other? Externally (if you have the guest list by family): are families kept together? Stability: would a slightly different guest list give the same tables? Business: did people actually enjoy the evening?</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Algorithm-specific numbers such as K-Means inertia or a GMM's log-likelihood always improve with more clusters, and cannot be compared across algorithms. The scores in this note can (with care).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we need a first, concrete score that uses nothing but the distances. <b>Next: the silhouette.</b></div>

  <h2 id="ce-sil"><span class="num">02</span>Silhouette</h2>
  <p><strong>The question we can't answer yet.</strong> For a single customer, how do we measure "sits comfortably in its own cluster, far from the others"?</p>
  <h3>The idea in plain words</h3>
  <p>For one point, compare two numbers: <strong>a</strong>, how far it is on average from the other members of its own cluster (cohesion), and <strong>b</strong>, how far it is on average from the members of the nearest other cluster (separation). If a is much smaller than b the point is well placed; if a ≈ b it sits on a border; if a &gt; b it would be happier in the other cluster.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For point i in cluster A:<br>a(i) = mean distance from i to the other points of A<br>b(i) = min over clusters B ≠ A of the mean distance from i to the points of B<br><strong>s(i) = (b(i) − a(i)) / max(a(i), b(i))</strong>, between −1 and 1 (s = 0 for a point alone in its cluster, by convention).<br><strong>Silhouette score</strong> = mean of s(i) over all points.</p>
  </div>
  <h3>By hand for three customers (k = 3)</h3>
  <table class="tbl">
    <tr><th>Customer</th><th>Own cluster</th><th>a = mean distance to own</th><th>Other clusters' mean distances</th><th>b = smallest</th><th>s = (b − a)/max</th></tr>
    <tr><td>C1 (1)</td><td>{1, 2, 3}</td><td>(1 + 2)/2 = 1.5</td><td>to {6,7,8}: (5+6+7)/3 = 6; to {13,14,15}: 13</td><td>6</td><td>(6 − 1.5)/6 = <strong>0.750</strong></td></tr>
    <tr><td>C2 (2)</td><td>{1, 2, 3}</td><td>(1 + 1)/2 = 1.0</td><td>to {6,7,8}: (4+5+6)/3 = 5; to {13,14,15}: 12</td><td>5</td><td>(5 − 1)/5 = <strong>0.800</strong></td></tr>
    <tr><td>C4 (6)</td><td>{6, 7, 8}</td><td>(1 + 2)/2 = 1.5</td><td>to {1,2,3}: (5+4+3)/3 = 4; to {13,14,15}: 8</td><td>4</td><td>(4 − 1.5)/4 = <strong>0.625</strong></td></tr>
  </table>
  <p>C4 has the lowest value: it is the edge of the middle cluster nearest to the low spenders (only 3 away from C3). The function below follows the definition line by line, then sklearn computes all nine and the mean:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_samples, silhouette_score
lab3 = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2])        # the k=3 clustering, renumbered left to right

def silhouette_by_hand(i, x, lab):
    d = np.abs(x - x[i])                              # 1-D distances from point i to everyone
    own = (lab == lab[i]) &amp; (np.arange(len(x)) != i)
    a = d[own].mean()                                 # mean distance to its own cluster (excluding itself)
    b = min(d[lab == c].mean() for c in set(lab) if c != lab[i])   # nearest other cluster
    return a, b, (b - a) / max(a, b)

for i in (0, 1, 3):
    a, b, s = silhouette_by_hand(i, spend, lab3)
    print(f"C{i+1} (spend {spend[i]:.0f}): a={a:.3f}  b={b:.3f}  s={s:.3f}")
print("all nine  :", silhouette_samples(X, lab3).round(3))
print("mean (score):", round(silhouette_score(X, lab3), 3))</div>
  <div class="fx" data-lang="text">C1 (spend 1): a=1.500  b=6.000  s=0.750
C2 (spend 2): a=1.000  b=5.000  s=0.800
C4 (spend 6): a=1.500  b=4.000  s=0.625
all nine  : [0.75  0.8   0.625 0.625 0.8   0.75  0.75  0.857 0.812]
mean (score): 0.752</div>
  <p>Average of the nine values = 0.752. Rule-of-thumb reading (Kaufman and Rousseeuw): above 0.7 strong structure, 0.5–0.7 reasonable, 0.25–0.5 weak, below 0.25 no real structure.</p>
  <h3>Silhouette per cluster and across k</h3>
  <div class="fx" data-lang="py">from sklearn.metrics import davies_bouldin_score, calinski_harabasz_score
for k, l in labels.items():
    print(f"k={k}  silhouette={silhouette_score(X, l):.3f}  per cluster:",
          {int(c): round(float(silhouette_samples(X, l)[l == c].mean()), 3) for c in np.unique(l)})</div>
  <div class="fx" data-lang="text">k=2  silhouette=0.682  per cluster: {0: 0.593, 1: 0.858}
k=3  silhouette=0.752  per cluster: {0: 0.725, 1: 0.807, 2: 0.725}
k=4  silhouette=0.536  per cluster: {0: 0.25, 1: 0.791, 2: 0.65, 3: 0.0}</div>
  <figure class="viz"><svg viewBox="0 0 660 230" width="660">
<text x="110" y="18" text-anchor="middle" font-size="12">k = 2 · mean 0.682</text>
<line x1="20" y1="28" x2="20" y2="205" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="20" y="34" width="121.8" height="13" class="fb"/><text x="145.8" y="45" class="tm" font-size="9.5">C1 0.68</text>
<rect x="20" y="51" width="129.0" height="13" class="fb"/><text x="153.0" y="62" class="tm" font-size="9.5">C2 0.72</text>
<rect x="20" y="68" width="130.9" height="13" class="fb"/><text x="154.9" y="79" class="tm" font-size="9.5">C3 0.73</text>
<rect x="20" y="85" width="112.5" height="13" class="fb"/><text x="136.5" y="96" class="tm" font-size="9.5">C4 0.62</text>
<rect x="20" y="102" width="92.6" height="13" class="fb"/><text x="116.6" y="113" class="tm" font-size="9.5">C5 0.51</text>
<rect x="20" y="119" width="54.0" height="13" class="fb"/><text x="78.0" y="130" class="tm" font-size="9.5">C6 0.30</text>
<rect x="20" y="142" width="148.2" height="13" class="fg"/><text x="172.2" y="153" class="tm" font-size="9.5">C7 0.82</text>
<rect x="20" y="159" width="161.1" height="13" class="fg"/><text x="185.1" y="170" class="tm" font-size="9.5">C8 0.89</text>
<rect x="20" y="176" width="154.3" height="13" class="fg"/><text x="178.3" y="187" class="tm" font-size="9.5">C9 0.86</text>
<text x="330" y="18" text-anchor="middle" font-size="12">k = 3 · mean 0.752</text>
<line x1="240" y1="28" x2="240" y2="205" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="240" y="34" width="135.0" height="13" class="fb"/><text x="379.0" y="45" class="tm" font-size="9.5">C1 0.75</text>
<rect x="240" y="51" width="144.0" height="13" class="fb"/><text x="388.0" y="62" class="tm" font-size="9.5">C2 0.80</text>
<rect x="240" y="68" width="112.5" height="13" class="fb"/><text x="356.5" y="79" class="tm" font-size="9.5">C3 0.62</text>
<rect x="240" y="91" width="112.5" height="13" class="fg"/><text x="356.5" y="102" class="tm" font-size="9.5">C4 0.62</text>
<rect x="240" y="108" width="144.0" height="13" class="fg"/><text x="388.0" y="119" class="tm" font-size="9.5">C5 0.80</text>
<rect x="240" y="125" width="135.0" height="13" class="fg"/><text x="379.0" y="136" class="tm" font-size="9.5">C6 0.75</text>
<rect x="240" y="148" width="135.0" height="13" class="fr"/><text x="379.0" y="159" class="tm" font-size="9.5">C7 0.75</text>
<rect x="240" y="165" width="154.3" height="13" class="fr"/><text x="398.3" y="176" class="tm" font-size="9.5">C8 0.86</text>
<rect x="240" y="182" width="146.2" height="13" class="fr"/><text x="390.2" y="193" class="tm" font-size="9.5">C9 0.81</text>
<text x="550" y="18" text-anchor="middle" font-size="12">k = 4 · mean 0.536</text>
<line x1="460" y1="28" x2="460" y2="205" stroke="currentColor" stroke-opacity="0.5"/>
<rect x="460" y="34" width="126.0" height="13" class="fb"/><text x="590.0" y="45" class="tm" font-size="9.5">C1 0.70</text>
<rect x="460" y="51" width="135.0" height="13" class="fb"/><text x="599.0" y="62" class="tm" font-size="9.5">C2 0.75</text>
<rect x="460" y="68" width="90.0" height="13" class="fb"/><text x="554.0" y="79" class="tm" font-size="9.5">C3 0.50</text>
<rect x="460" y="91" width="0.0" height="13" class="fg"/><text x="464.0" y="102" class="tm" font-size="9.5">C4 0.00</text>
<rect x="460" y="114" width="0.0" height="13" class="fr"/><text x="464.0" y="125" class="tm" font-size="9.5">C5 0.00</text>
<rect x="460" y="131" width="90.0" height="13" class="fr"/><text x="554.0" y="142" class="tm" font-size="9.5">C6 0.50</text>
<rect x="460" y="154" width="130.9" height="13" class="fv"/><text x="594.9" y="165" class="tm" font-size="9.5">C7 0.73</text>
<rect x="460" y="171" width="152.3" height="13" class="fv"/><text x="616.3" y="182" class="tm" font-size="9.5">C8 0.85</text>
<rect x="460" y="188" width="144.0" height="13" class="fv"/><text x="608.0" y="199" class="tm" font-size="9.5">C9 0.80</text>
</svg><figcaption>Silhouette plots of the nine customers for k = 2, 3, 4 (bar length = s(i), grouped and coloured by cluster, from the real values). k = 3: every bar long and even. k = 2: bars in the first cluster shrink (C4–C6 sit far from C1–C3). k = 4: C4 alone gets s = 0 and C5, C6 become weak.</figcaption></figure>
  <p>k = 3 has the highest mean and no weak cluster. k = 2 has one very good cluster (0.858, the high spenders) and one mediocre one (0.593, because it lumps 1–3 with 6–8). k = 4 splits C4 off on its own (s = 0 by convention) and leaves C5, C6 poorly placed (cluster mean 0.25).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Silhouette needs all pairwise distances: O(n²) time and memory. On large data use <code>silhouette_score(X, labels, sample_size=10_000, random_state=0)</code>. And it uses the same metric as you pass (<code>metric="cosine"</code> for text embeddings); compute it in the space you clustered in.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> silhouette judges point by point and costs O(n²). Can we judge whole clusters, cheaply, from their centres? <b>Next: Davies–Bouldin.</b></div>

  <h2 id="ce-db"><span class="num">03</span>Davies–Bouldin Index</h2>
  <p><strong>The question we can't answer yet.</strong> We would like a cluster-level score that needs only each cluster's centre and spread, not every pair of points.</p>
  <h3>The idea in plain words</h3>
  <p>Two clusters are "too similar" if they are wide compared with the distance between them. For every cluster find the other cluster it is most easily confused with, and record how bad that confusion is. Average those worst cases. Small is good.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Sᵢ = mean distance of cluster i's points to its centroid (scatter). Mᵢⱼ = distance between centroids i and j.<br>Rᵢⱼ = (Sᵢ + Sⱼ) / Mᵢⱼ (how much the two clusters blur together).<br><strong>DB</strong> = (1/k) Σᵢ maxⱼ≠ᵢ Rᵢⱼ. Range 0 to ∞; lower is better; 0 only if clusters are points.</p>
  </div>
  <h3>By hand (k = 3)</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Cluster 0 {1,2,3}</th><th>Cluster 1 {6,7,8}</th><th>Cluster 2 {13,14,15}</th></tr>
    <tr><td>Centroid</td><td>2</td><td>7</td><td>14</td></tr>
    <tr><td>Scatter S = mean |x − centroid|</td><td>(1+0+1)/3 = 0.667</td><td>0.667</td><td>0.667</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Pair</th><th>M (centroid distance)</th><th>R = (Sᵢ + Sⱼ)/M</th></tr>
    <tr><td>0–1</td><td>5</td><td>1.333/5 = 0.267</td></tr>
    <tr><td>0–2</td><td>12</td><td>1.333/12 = 0.111</td></tr>
    <tr><td>1–2</td><td>7</td><td>1.333/7 = 0.190</td></tr>
  </table>
  <p>Worst neighbour per cluster: cluster 0 → 0.267 (with 1); cluster 1 → 0.267 (with 0); cluster 2 → 0.190 (with 1). DB = (0.267 + 0.267 + 0.190)/3 = <strong>0.241</strong>.</p>
  <div class="fx" data-lang="py">def davies_bouldin_by_hand(x, lab):
    cs = sorted(set(lab))
    cent = np.array([x[lab == c].mean() for c in cs])
    S = np.array([np.abs(x[lab == c] - cent[j]).mean() for j, c in enumerate(cs)])   # scatter
    D = []
    for i in range(len(cs)):
        R = [(S[i] + S[j]) / abs(cent[i] - cent[j]) for j in range(len(cs)) if j != i]
        D.append(max(R))                                # worst (most similar) neighbour
    return cent, S, np.array(D), np.mean(D)

cent, S, Dw, db = davies_bouldin_by_hand(spend, lab3)
print("centroids", cent, " scatter S", S.round(3), " worst R per cluster", Dw.round(3))
print("DB by hand", round(db, 3), "  sklearn", round(davies_bouldin_score(X, lab3), 3))</div>
  <div class="fx" data-lang="text">centroids [ 2.  7. 14.]  scatter S [0.667 0.667 0.667]  worst R per cluster [0.267 0.267 0.19 ]
DB by hand 0.241   sklearn 0.241</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>DB uses centroids and average distances to them, so it assumes clusters are summarised well by a centre: it favours round clusters exactly like K-Means does. It is also sensitive to the scale of features, like every distance-based score.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> DB compares clusters pair by pair. Is there a single, global "how much of the variation do the clusters explain"? <b>Next: Calinski–Harabasz.</b></div>

  <h2 id="ce-ch"><span class="num">04</span>Calinski–Harabasz Index</h2>
  <p><strong>The question we can't answer yet.</strong> Of all the variation in spend, how much is <em>between</em> clusters (they differ) rather than <em>within</em> clusters (members differ)?</p>
  <h3>The idea in plain words</h3>
  <p>Split the total spread of the data into two parts: the spread of the cluster centres around the overall mean (between) and the spread of points around their own centres (within). Good clusters put almost all the spread "between". It is the same idea as the F-statistic in one-way ANOVA (see <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>B = Σₖ nₖ ‖cₖ − m‖² (between-cluster sum of squares; m = overall mean)<br>W = Σₖ Σ_{x ∈ k} ‖x − cₖ‖² (within-cluster sum of squares = K-Means inertia)<br>B + W = total sum of squares.<br><strong>CH</strong> = [B / (k − 1)] / [W / (n − k)]. Higher is better. The divisions by k − 1 and n − k stop it from simply growing with k.</p>
  </div>
  <h3>By hand (k = 3)</h3>
  <p>Overall mean m = (1+2+3+6+7+8+13+14+15)/9 = 69/9 = 7.667.</p>
  <table class="tbl">
    <tr><th>Cluster</th><th>nₖ</th><th>cₖ</th><th>(cₖ − m)²</th><th>nₖ (cₖ − m)²</th><th>Σ (x − cₖ)²</th></tr>
    <tr><td>0</td><td>3</td><td>2</td><td>32.111</td><td>96.333</td><td>1 + 0 + 1 = 2</td></tr>
    <tr><td>1</td><td>3</td><td>7</td><td>0.444</td><td>1.333</td><td>2</td></tr>
    <tr><td>2</td><td>3</td><td>14</td><td>40.111</td><td>120.333</td><td>2</td></tr>
    <tr><td colspan="4"><strong>Sum</strong></td><td><strong>B = 218</strong></td><td><strong>W = 6</strong></td></tr>
  </table>
  <p>CH = (218 / 2) / (6 / 6) = 109 / 1 = <strong>109</strong>. The clusters explain 218 of the 224 units of total variation (97%).</p>
  <div class="fx" data-lang="py">m = spend.mean()
B = sum((lab3 == c).sum() * (spend[lab3 == c].mean() - m) ** 2 for c in range(3))   # between-cluster SS
W = sum(((spend[lab3 == c] - spend[lab3 == c].mean()) ** 2).sum() for c in range(3))  # within-cluster SS
n, k = len(spend), 3
print(f"overall mean {m:.3f}  B={B:.3f}  W={W:.3f}  B+W={B+W:.3f}  total SS={((spend-m)**2).sum():.3f}")
print("CH by hand", round((B / (k - 1)) / (W / (n - k)), 3), "  sklearn", round(calinski_harabasz_score(X, lab3), 3))</div>
  <div class="fx" data-lang="text">overall mean 7.667  B=218.000  W=6.000  B+W=224.000  total SS=224.000
CH by hand 109.0   sklearn 109.0</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>CH has no fixed scale (109 here, thousands on bigger data), so it is only useful for comparing clusterings of the <em>same</em> data. Because W is K-Means' own objective, CH is biased toward K-Means-style convex clusters.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> do the three internal scores agree on k, and can they be trusted when clusters are not round? <b>Next: internal scores together.</b></div>

  <h2 id="ce-internal"><span class="num">05</span>Internal Scores Together</h2>
  <p><strong>The question we can't answer yet.</strong> We have three scores. Do they pick the same k, and when do they all mislead us together?</p>
  <h3>On the nine customers</h3>
  <div class="fx" data-lang="py">print(" k   silhouette   Davies-Bouldin   Calinski-Harabasz")
for k, l in labels.items():
    print(f" {k}      {silhouette_score(X, l):.3f}          {davies_bouldin_score(X, l):.3f}             {calinski_harabasz_score(X, l):6.1f}")</div>
  <div class="fx" data-lang="text"> k   silhouette   Davies-Bouldin   Calinski-Harabasz
 2      0.682          0.333               29.0
 3      0.752          0.241              109.0
 4      0.536          0.265               81.3</div>
  <p>All three prefer k = 3: highest silhouette (0.752), lowest DB (0.241), highest CH (109). For k = 2, CH collapses to 29 because the low and middle spenders are lumped together and W jumps.</p>
  <h3>At scale, and the moons trap</h3>
  <div class="fx" data-lang="py">from sklearn.datasets import make_blobs, make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from sklearn.metrics import adjusted_rand_score
Xb, yb = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)
print("blobs (truth k=4)")
for k in range(2, 7):
    l = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(Xb)
    print(f"  k={k}  sil={silhouette_score(Xb, l):.3f}  DB={davies_bouldin_score(Xb, l):.3f}  CH={calinski_harabasz_score(Xb, l):7.1f}")
Xm, ym = make_moons(n_samples=300, noise=0.06, random_state=0)
Xm = StandardScaler().fit_transform(Xm)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(Xm)
dbl = DBSCAN(eps=0.3, min_samples=5).fit_predict(Xm)
print("moons: K-Means  ARI", round(adjusted_rand_score(ym, km), 3), " sil", round(silhouette_score(Xm, km), 3),
      " DB", round(davies_bouldin_score(Xm, km), 3))
keep = dbl != -1
print("moons: DBSCAN   ARI", round(adjusted_rand_score(ym, dbl), 3), " sil", round(silhouette_score(Xm[keep], dbl[keep]), 3),
      " DB", round(davies_bouldin_score(Xm[keep], dbl[keep]), 3))</div>
  <div class="fx" data-lang="text">blobs (truth k=4)
  k=2  sil=0.596  DB=0.520  CH=  574.9
  k=3  sil=0.761  DB=0.349  CH= 2210.5
  k=4  sil=0.791  DB=0.294  CH= 5742.0
  k=5  sil=0.665  DB=0.640  CH= 4778.3
  k=6  sil=0.561  DB=0.842  CH= 4259.6
moons: K-Means  ARI 0.47  sil 0.494  DB 0.809
moons: DBSCAN   ARI 0.993  sil 0.385  DB 1.023</div>
  <p>On four round blobs all three scores peak at the true k = 4. On the two moons, though, K-Means' straight cut (ARI 0.470, wrong) gets a <em>better</em> silhouette (0.494 vs 0.385) and DB (0.809 vs 1.023) than DBSCAN's correct answer (ARI 0.993). Internal scores measure compactness and separation around centres; a long curved cluster is not compact in that sense. For density-based results use a density-based score such as <strong>DBCV</strong> (density-based clustering validation; available in the <code>hdbscan</code> package as <code>validity_index</code>), and above all look at a plot.</p>
  <table class="tbl">
    <tr><th>Score</th><th>Formula idea</th><th>Range / best</th><th>Cost</th><th>Bias</th></tr>
    <tr><td>Silhouette</td><td>(b − a)/max(a, b) per point</td><td>−1…1, high</td><td>O(n²)</td><td>convex, similar density</td></tr>
    <tr><td>Davies–Bouldin</td><td>mean worst (Sᵢ + Sⱼ)/Mᵢⱼ</td><td>0…∞, low</td><td>O(n·k)</td><td>centroid-shaped clusters</td></tr>
    <tr><td>Calinski–Harabasz</td><td>(B/(k−1)) / (W/(n−k))</td><td>0…∞, high</td><td>O(n·k)</td><td>convex (W = inertia)</td></tr>
    <tr><td>Elbow / gap statistic</td><td>inertia vs k (gap: vs random reference data)</td><td>bend / max gap</td><td>K-Means runs</td><td>K-Means only (see <a class="xref" data-note="ml_kmeans">K-Means</a>)</td></tr>
    <tr><td>BIC / AIC</td><td>−2 LL + penalty</td><td>low</td><td>GMM fits</td><td>Gaussian clusters (see <a class="xref" data-note="ml_gmm">GMM</a>)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>An internal score is itself a definition of "good cluster". Silhouette, DB and CH all share K-Means' definition (compact around a centre), so using them to judge K-Means is partly circular, and using them to judge DBSCAN is unfair. Pick the score whose definition matches what you want.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> internal scores can be fooled by shape. When we do have true labels for some data, can we simply compare? <b>Next: the contingency table and purity.</b></div>

  <h2 id="ce-cont"><span class="num">06</span>When Labels Exist: Contingency Table and Purity</h2>
  <p><strong>The question we can't answer yet.</strong> The sales team's CRM records a segment for each customer. How well do our clusters match it?</p>
  <h3>The true segments</h3>
  <table class="tbl">
    <tr><th>Customer</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>C5</th><th>C6</th><th>C7</th><th>C8</th><th>C9</th></tr>
    <tr><td>spend</td><td>1</td><td>2</td><td>3</td><td>6</td><td>7</td><td>8</td><td>13</td><td>14</td><td>15</td></tr>
    <tr><td>CRM segment (true)</td><td>0 budget</td><td>0</td><td>0</td><td><strong>0</strong></td><td>1 regular</td><td>1</td><td>2 premium</td><td>2</td><td>2</td></tr>
    <tr><td>cluster (k = 3)</td><td>0</td><td>0</td><td>0</td><td><strong>1</strong></td><td>1</td><td>1</td><td>2</td><td>2</td><td>2</td></tr>
  </table>
  <p>The only disagreement: C4 (spend 6) is "budget" in the CRM but sits in the middle cluster. Cluster numbers and segment numbers are just names; a metric must not care that "cluster 1" happens to match "segment 1".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Contingency table</strong>: nᵢⱼ = number of items with true class i and cluster j. Row sums aᵢ = class sizes, column sums bⱼ = cluster sizes. Every external score in this note is a function of this table only.</p>
  </div>
  <div class="fx" data-lang="py">true = np.array([0, 0, 0, 0, 1, 1, 2, 2, 2])     # segment recorded in the CRM: budget, regular, premium
import pandas as pd
print(pd.crosstab(pd.Series(true, name="true"), pd.Series(lab3, name="cluster")))</div>
  <div class="fx" data-lang="text">cluster  0  1  2
true            
0        3  1  0
1        0  2  0
2        0  0  3</div>
  <h3>Purity</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Purity</strong> = (1/n) Σⱼ maxᵢ nᵢⱼ: label each cluster with its majority class and count how many items that labels correctly.</p>
  </div>
  <p>By hand: cluster 0's majority has 3, cluster 1's has 2 (two regulars vs one budget), cluster 2's has 3. Purity = (3 + 2 + 3)/9 = 8/9 = <strong>0.889</strong>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Purity never penalises splitting. Give every customer their own cluster and each "cluster" is trivially pure: purity = 1 (section 09 shows it). Use purity only to compare clusterings with the same number of clusters, or together with a score that punishes splitting.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we need a score that punishes both merging different classes and splitting one class. <b>Next: pair counting (Rand index, ARI, Fowlkes–Mallows).</b></div>

  <h2 id="ce-pairs"><span class="num">07</span>Pair Counting: Rand Index, ARI and Fowlkes–Mallows</h2>
  <p><strong>The question we can't answer yet.</strong> How do we compare two labelings fairly when the label names are arbitrary and the numbers of groups may differ?</p>
  <h3>The idea: look at pairs</h3>
  <p>Label names are arbitrary, but "these two customers are together" is not. Take every pair of customers and ask two yes/no questions: together in the truth? together in the clustering? Nine customers give C(9, 2) = 36 pairs.</p>
  <table class="tbl">
    <tr><th></th><th>Same cluster</th><th>Different clusters</th></tr>
    <tr><td>Same true class</td><td><strong>TP</strong> (agree: together)</td><td><strong>FN</strong> (a class was split)</td></tr>
    <tr><td>Different true classes</td><td><strong>FP</strong> (classes were merged)</td><td><strong>TN</strong> (agree: apart)</td></tr>
  </table>
  <h3>By hand from the contingency table</h3>
  <ul>
    <li><strong>TP</strong> = Σ C(nᵢⱼ, 2) over the cells: C(3,2) + C(1,2) + C(2,2) + C(3,2) = 3 + 0 + 1 + 3 = <strong>7</strong>.</li>
    <li>Pairs together in the clustering = Σ C(bⱼ, 2) = 3 + 3 + 3 = 9, so <strong>FP</strong> = 9 − 7 = <strong>2</strong> (C4 with C5, and C4 with C6).</li>
    <li>Pairs together in the truth = Σ C(aᵢ, 2) = C(4,2) + C(2,2) + C(3,2) = 6 + 1 + 3 = 10, so <strong>FN</strong> = 10 − 7 = <strong>3</strong> (C4 with C1, C2, C3).</li>
    <li><strong>TN</strong> = 36 − 7 − 2 − 3 = <strong>24</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">from math import comb
def pair_counts(t, p):
    n = len(t); TP = FP = FN = TN = 0
    for i in range(n):
        for j in range(i + 1, n):
            same_t, same_p = t[i] == t[j], p[i] == p[j]
            TP += same_t and same_p; FP += (not same_t) and same_p
            FN += same_t and not same_p; TN += (not same_t) and not same_p
    return TP, FP, FN, TN

TP, FP, FN, TN = pair_counts(true, lab3)
print("pairs: TP", TP, " FP", FP, " FN", FN, " TN", TN, " total", TP + FP + FN + TN)
print("Rand index", round((TP + TN) / comb(9, 2), 3))</div>
  <div class="fx" data-lang="text">pairs: TP 7  FP 2  FN 3  TN 24  total 36
Rand index 0.861</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rand index</strong> RI = (TP + TN) / C(n, 2): the share of pairs on which the two labelings agree. Here 31/36 = <strong>0.861</strong>.</p>
  </div>
  <h3>Correcting for chance: ARI</h3>
  <p>RI has a problem: most pairs are "apart" in both labelings simply because there are several groups, so even random labels get a decent RI (0.556 in section 09). The adjusted Rand index subtracts what random labels with the same group sizes would score on average, and rescales so that a perfect match is 1.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ARI</strong> = (Index − Expected) / (Max − Expected), where<br>Index = Σᵢⱼ C(nᵢⱼ, 2) (= TP)<br>Expected = [Σᵢ C(aᵢ, 2) · Σⱼ C(bⱼ, 2)] / C(n, 2)<br>Max = ½ [Σᵢ C(aᵢ, 2) + Σⱼ C(bⱼ, 2)]<br>ARI = 1 for identical partitions, ≈ 0 for random ones, and can be negative (worse than chance).</p>
  </div>
  <p>By hand: Index = 7; Expected = (10 × 9)/36 = 2.5; Max = (10 + 9)/2 = 9.5. ARI = (7 − 2.5)/(9.5 − 2.5) = 4.5/7 = <strong>0.643</strong>. One misplaced customer out of nine costs a lot of ARI, because C4 sits in 5 of the 36 pairs.</p>
  <h3>Fowlkes–Mallows</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>FM</strong> = TP / √((TP + FP)(TP + FN)) = √(pair precision × pair recall). Here 7/√(9 × 10) = 7/9.487 = <strong>0.738</strong>. It ignores TN, so it is not inflated by the many "apart" pairs.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Pair counting is <a class="xref" data-note="ml_evaluation">classification metrics</a> applied to the question "should these two be together?". TP, FP, FN and TN are the confusion matrix of that yes/no question; FM is the geometric mean of its precision (7/9) and recall (7/10).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> ARI says "0.643" but not whether clusters mix classes, or classes are split across clusters. <b>Next: the entropy-based scores.</b></div>

  <h2 id="ce-info"><span class="num">08</span>Entropy-Based Scores</h2>
  <p><strong>The question we can't answer yet.</strong> Is the error "a cluster contains several classes" or "a class is spread over several clusters"? These are different problems with different fixes.</p>
  <h3>Entropy refresher</h3>
  <p>Entropy H = −Σ p log p measures how mixed a set of labels is (0 = all the same). scikit-learn uses the natural log, so values are in "nats". (Full derivation in <a class="xref" data-note="ml_dtree">Decision Trees</a>.)</p>
  <ul>
    <li>H(C), entropy of the true classes, shares 4/9, 2/9, 3/9: 0.444 × 0.811 + 0.222 × 1.504 + 0.333 × 1.099 = 0.360 + 0.334 + 0.366 = <strong>1.061</strong>.</li>
    <li>H(K), entropy of the clusters, shares 1/3 each: ln 3 = <strong>1.099</strong>.</li>
  </ul>
  <h3>Homogeneity: is each cluster a single class?</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Homogeneity</strong> h = 1 − H(C | K) / H(C), where H(C | K) = Σⱼ (bⱼ/n) · entropy of the classes inside cluster j. h = 1 when every cluster contains one class.</p>
  </div>
  <p>Cluster 0 and cluster 2 contain one class each (entropy 0). Cluster 1 holds one budget and two regulars: entropy of (1/3, 2/3) = 0.333 × 1.099 + 0.667 × 0.405 = 0.637, weighted by 3/9 → 0.212. h = 1 − 0.212/1.061 = <strong>0.800</strong>.</p>
  <h3>Completeness: is each class in a single cluster?</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Completeness</strong> c = 1 − H(K | C) / H(K), where H(K | C) = Σᵢ (aᵢ/n) · entropy of the clusters inside class i. c = 1 when every class sits in one cluster.</p>
  </div>
  <p>The budget class (4 customers) is split 3 / 1: entropy of (3/4, 1/4) = 0.75 × 0.288 + 0.25 × 1.386 = 0.562, weighted by 4/9 → 0.250. The other classes are in one cluster each. c = 1 − 0.250/1.099 = <strong>0.773</strong>.</p>
  <h3>V-measure, mutual information, NMI, AMI</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>V-measure</strong> = 2hc/(h + c) (harmonic mean, like F1) = 2 × 0.800 × 0.773 / 1.573 = <strong>0.786</strong>.<br><strong>Mutual information</strong> MI = H(C) − H(C | K) = 1.061 − 0.212 = <strong>0.849</strong> nats: how much knowing the cluster tells you about the class.<br><strong>NMI</strong> = MI / mean(H(C), H(K)) = 0.849 / 1.080 = <strong>0.786</strong> (with the arithmetic mean, sklearn's default, NMI equals V-measure).<br><strong>AMI</strong> = (MI − E[MI]) / (mean(H(C), H(K)) − E[MI]), with E[MI] the expected MI of random labelings of the same sizes: <strong>0.692</strong>.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.metrics import (rand_score, adjusted_rand_score, homogeneity_score, completeness_score,
                             v_measure_score, mutual_info_score, normalized_mutual_info_score,
                             adjusted_mutual_info_score, fowlkes_mallows_score)
from sklearn.metrics.cluster import contingency_matrix
cm = contingency_matrix(true, lab3)
print("purity            ", round(cm.max(axis=0).sum() / cm.sum(), 3))
print("Rand index        ", round(rand_score(true, lab3), 3))
print("ARI               ", round(adjusted_rand_score(true, lab3), 3))
print("homogeneity       ", round(homogeneity_score(true, lab3), 3))
print("completeness      ", round(completeness_score(true, lab3), 3))
print("V-measure         ", round(v_measure_score(true, lab3), 3))
print("mutual information", round(mutual_info_score(true, lab3), 3), "(nats)")
print("NMI               ", round(normalized_mutual_info_score(true, lab3), 3))
print("AMI               ", round(adjusted_mutual_info_score(true, lab3), 3))
print("Fowlkes-Mallows   ", round(fowlkes_mallows_score(true, lab3), 3))</div>
  <div class="fx" data-lang="text">purity             0.889
Rand index         0.861
ARI                0.643
homogeneity        0.8
completeness       0.773
V-measure          0.786
mutual information 0.849 (nats)
NMI                0.786
AMI                0.692
Fowlkes-Mallows    0.738</div>
  <p>Every number matches the hand work. Homogeneity is higher than completeness: our clusters are fairly pure, and the problem is that one budget customer was split away from its class.</p>
  <div class="bridge"><b>What this still can't tell us →</b> there are now ten external scores. Which one should we report, and which can be fooled? <b>Next: choosing an external score.</b></div>

  <h2 id="ce-extuse"><span class="num">09</span>Which External Score? Degenerate Cases</h2>
  <p><strong>The question we can't answer yet.</strong> Some scores look good for silly clusterings. Which ones are safe?</p>
  <p>Four labelings of the nine customers: our k = 3 clustering, everyone in their own cluster, everyone in one cluster, and random labels:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
singletons = np.arange(9)                         # every customer its own cluster
one = np.zeros(9, int)                            # everyone in one cluster
rand9 = rng.integers(0, 3, 9)                     # random labels
for name, p in [("k=3 clustering", lab3), ("9 singletons", singletons), ("1 big cluster", one), ("random labels", rand9)]:
    cmx = contingency_matrix(true, p)
    print(f"{name:15s} purity={cmx.max(axis=0).sum()/9:.3f}  RI={rand_score(true, p):.3f}  ARI={adjusted_rand_score(true, p):6.3f}  "
          f"hom={homogeneity_score(true, p):.3f}  comp={completeness_score(true, p):.3f}  NMI={normalized_mutual_info_score(true, p):.3f}  AMI={adjusted_mutual_info_score(true, p):6.3f}")</div>
  <div class="fx" data-lang="text">k=3 clustering  purity=0.889  RI=0.861  ARI= 0.643  hom=0.800  comp=0.773  NMI=0.786  AMI= 0.692
9 singletons    purity=1.000  RI=0.722  ARI= 0.000  hom=1.000  comp=0.483  NMI=0.651  AMI=-0.000
1 big cluster   purity=0.444  RI=0.278  ARI= 0.000  hom=0.000  comp=1.000  NMI=0.000  AMI= 0.000
random labels   purity=0.667  RI=0.556  ARI= 0.065  hom=0.364  comp=0.456  NMI=0.405  AMI= 0.143</div>
  <table class="tbl">
    <tr><th>Labeling</th><th>What fools what</th></tr>
    <tr><td>9 singletons</td><td>purity = 1 and homogeneity = 1 (trivially pure), NMI still 0.651. ARI and AMI correctly say 0.</td></tr>
    <tr><td>1 big cluster</td><td>completeness = 1 (each class is "in one cluster"). Everything else says 0 or low.</td></tr>
    <tr><td>random labels</td><td>RI 0.556, NMI 0.405, completeness 0.456 look like "some" agreement. ARI 0.065 and AMI 0.143 stay near 0 (with nine items chance corrections are noisy).</td></tr>
  </table>
  <div class="fx" data-lang="py">relabelled = np.array([5, 5, 5, 9, 9, 9, 1, 1, 1])     # same groups, different names
print("ARI with renamed labels:", adjusted_rand_score(true, relabelled), "| same as before:",
      adjusted_rand_score(true, relabelled) == adjusted_rand_score(true, lab3))</div>
  <div class="fx" data-lang="text">ARI with renamed labels: 0.6428571428571429 | same as before: True</div>
  <p>Renaming the clusters changes nothing: all these scores depend only on the contingency table up to reordering its columns.</p>
  <div class="cards">
    <div><b>Default: ARI</b><p>Chance-corrected, symmetric, interpretable 0-to-1 scale. Best when the true classes are of similar size.</p><small>adjusted_rand_score</small></div>
    <div><b>Also: AMI</b><p>Chance-corrected information score; better than ARI when classes are very unbalanced or there are many small clusters.</p><small>adjusted_mutual_info_score</small></div>
    <div><b>Diagnose: h and c</b><p>Homogeneity and completeness tell you whether to merge (low completeness) or split (low homogeneity).</p><small>homogeneity_completeness_v_measure</small></div>
    <div><b>Avoid alone</b><p>Purity and RI: inflated by many clusters or many groups. NMI without adjustment rises with the number of clusters.</p><small>report with ARI/AMI</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>External scores need labels, and labels that define the same thing you want to cluster. If the CRM segments were assigned by a different rule (say, by region), a "low ARI" may simply mean your clusters capture something else, possibly more useful.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> in most projects there are no labels at all. Besides internal scores, how can we gain confidence? <b>Next: stability.</b></div>

  <h2 id="ce-stab"><span class="num">10</span>Stability Analysis</h2>
  <p><strong>The question we can't answer yet.</strong> If the clusters are real structure, they should come back when the data changes a little. Do they?</p>
  <h3>The idea</h3>
  <p>Perturb the data (drop a few rows, bootstrap, add noise, change the random seed), re-cluster, and compare the new labels with the old ones on the rows both runs contain, using ARI. Real structure reappears every time; an arbitrary split moves around.</p>
  <div class="flow"><span>Cluster all data</span><span>Draw a subsample</span><span>Re-cluster it</span><span>ARI on shared rows</span><span>Repeat 20–100×, average</span></div>
  <h3>On the nine customers</h3>
  <p>Drop 2 random customers, re-run K-Means on the remaining 7, compare with the full-data labels on those 7; 20 repetitions per k:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
print(" k   mean ARI vs full-data clustering   worst")
for k in (2, 3, 4):
    full = labels[k]
    scores = []
    for b in range(20):
        idx = np.sort(rng.choice(9, 7, replace=False))          # drop 2 of the 9 customers
        sub = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X[idx])
        scores.append(adjusted_rand_score(full[idx], sub))       # compare on the 7 shared customers
    print(f" {k}              {np.mean(scores):.3f}                  {np.min(scores):.3f}")</div>
  <div class="fx" data-lang="text"> k   mean ARI vs full-data clustering   worst
 2              0.892                  -0.077
 3              1.000                  1.000
 4              0.858                  0.488</div>
  <p>k = 3 reproduces perfectly every time. k = 2 usually agrees, but with some subsets the single cut lands in a different gap, so the two runs disagree completely (worst ARI −0.077). k = 4 has to split one natural group somewhere, and where it splits depends on which customers are left (worst 0.488).</p>
  <h3>Per-cluster stability: Jaccard</h3>
  <p>To find <em>which</em> cluster is unstable, compare each original cluster with its best-matching cluster in the re-run using the Jaccard similarity of their member sets, and average over runs (Hennig's method: a mean Jaccard below 0.5 means the cluster "dissolves"; above about 0.75 it is considered stable).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Jaccard</strong>(A, B) = |A ∩ B| / |A ∪ B|.</p>
  </div>
  <div class="fx" data-lang="py">def jaccard(a, b):
    a, b = set(a), set(b)
    return len(a &amp; b) / len(a | b)

print("{C1,C2,C3} vs {C1,C2,C3}    :", jaccard([1, 2, 3], [1, 2, 3]))
print("{C1,C2,C3} vs {C1,C2,C3,C4} :", jaccard([1, 2, 3], [1, 2, 3, 4]))
print("{C4,C5,C6} vs {C5,C6}       :", round(jaccard([4, 5, 6], [5, 6]), 3))</div>
  <div class="fx" data-lang="text">{C1,C2,C3} vs {C1,C2,C3}    : 1.0
{C1,C2,C3} vs {C1,C2,C3,C4} : 0.75
{C4,C5,C6} vs {C5,C6}       : 0.667</div>
  <p>If a re-run puts C4 back with the low spenders, the low-spender cluster {C1, C2, C3} still overlaps 3 of 4 (0.75) and the middle cluster loses one of its three members (0.667).</p>
  <h3>At scale, and why stable is not the same as right</h3>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
print(" k   mean ARI between two half-samples' clusterings (on shared rows)")
for k in range(2, 7):
    s = []
    for b in range(10):
        i1 = rng.choice(500, 350, replace=False); i2 = rng.choice(500, 350, replace=False)
        m1 = KMeans(n_clusters=k, n_init=3, random_state=b).fit(Xb[i1])
        m2 = KMeans(n_clusters=k, n_init=3, random_state=b + 100).fit(Xb[i2])
        s.append(adjusted_rand_score(m1.predict(Xb), m2.predict(Xb)))   # both models label ALL rows
    print(f" {k}   {np.mean(s):.3f}  (min {np.min(s):.3f})")</div>
  <div class="fx" data-lang="text"> k   mean ARI between two half-samples' clusterings (on shared rows)
 2   0.925  (min 0.249)
 3   1.000  (min 1.000)
 4   1.000  (min 1.000)
 5   0.835  (min 0.817)
 6   0.774  (min 0.601)</div>
  <p>Four blobs: k = 4 is perfectly stable, but so is k = 3, because two of the blobs are close and K-Means merges those two the same way every time. k = 2, 5 and 6 are unstable. Stability rules out bad choices (an unstable k is arbitrary) but cannot choose between several stable ones: combine it with internal scores and the business view.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Compare labelings with ARI (or Jaccard after matching), never by checking label equality: cluster "0" in one run may be cluster "2" in the next. And use the same preprocessing (fitted scaler, same features) for every run.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> clusters can be compact, matched and stable and still be useless to the business. <b>Next: business validation.</b></div>

  <h2 id="ce-biz"><span class="num">11</span>Business Validation and Profiling</h2>
  <p><strong>The question we can't answer yet.</strong> Do the clusters differ in ways people care about, can we describe them simply, and do they predict anything?</p>
  <h3>Profile every cluster</h3>
  <p>Add two more columns for the nine customers: visits per month, and whether they used last month's coupon. The profile table shows each cluster's size and average values; z-scores (cluster mean minus overall mean, divided by the overall standard deviation) show which features make each cluster special.</p>
  <div class="fx" data-lang="py">df = pd.DataFrame({"spend": spend,
                   "visits": [2, 1, 2, 4, 5, 4, 9, 8, 10],
                   "responded": [0, 0, 0, 1, 0, 1, 1, 1, 1]})      # did they use last month's coupon?
df["cluster"] = lab3
prof = df.groupby("cluster").agg(n=("spend", "size"), spend=("spend", "mean"),
                                 visits=("visits", "mean"), response_rate=("responded", "mean"))
print(prof.round(2))
z = (prof[["spend", "visits"]] - df[["spend", "visits"]].mean()) / df[["spend", "visits"]].std(ddof=0)
print("\\nz-scores of cluster means (how far from the average customer, in std devs):")
print(z.round(2))</div>
  <div class="fx" data-lang="text">         n  spend  visits  response_rate
cluster                                 
0        3    2.0    1.67           0.00
1        3    7.0    4.33           0.67
2        3   14.0    9.00           1.00

z-scores of cluster means (how far from the average customer, in std devs):
         spend  visits
cluster               
0        -1.14   -1.08
1        -0.13   -0.22
2         1.27    1.29</div>
  <p>Now each cluster can be named in one line. Cluster 0: low spend, rare visits (z ≈ −1.1), never used the coupon: "occasional bargain buyers". Cluster 1: average on everything, two of three used the coupon: "regulars". Cluster 2: high spend, frequent visits (z ≈ +1.3), all used the coupon: "loyal big spenders". If two clusters had the same profile, they would be one segment for the business, whatever the silhouette said.</p>
  <h3>Explain clusters with a small tree</h3>
  <p>Fit a shallow <a class="xref" data-note="ml_dtree">decision tree</a> that predicts the cluster from the original features. If a depth-2 tree reproduces the clusters, you get readable rules for the business:</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier, export_text
tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(df[["spend", "visits"]], df["cluster"])
print(export_text(tree, feature_names=["spend", "visits"]))
print("surrogate accuracy:", tree.score(df[["spend", "visits"]], df["cluster"]))</div>
  <div class="fx" data-lang="text">|--- visits &lt;= 3.00
|   |--- class: 0
|--- visits &gt;  3.00
|   |--- spend &lt;= 10.50
|   |   |--- class: 1
|   |--- spend &gt;  10.50
|   |   |--- class: 2

surrogate accuracy: 1.0</div>
  <p>"Visits ≤ 3 → occasional; otherwise spend ≤ 10.5 → regular, else loyal big spender", 100% faithful on these customers. A low surrogate accuracy means the clusters are hard to describe, which is itself a warning for a segmentation meant for people.</p>
  <h3>Validate against an outcome</h3>
  <p>The strongest evidence: clusters should differ on something they were <em>not</em> built from. Here the coupon response was not used for clustering, yet it differs sharply (0.00, 0.67, 1.00). On real data test it properly (a chi-square test or a held-out period; see <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>) and, best of all, run an experiment: different offers per segment, measured against a control (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Validating clusters on the features they were built from is circular: of course cluster 2 has high spend, spend made the clusters. Validate on outcomes and features that were held out. Also re-check segments over time: customer behaviour drifts, and a segmentation that was good last year may have dissolved.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> all of this judges one algorithm's output. How do we pick the algorithm in the first place? <b>Next: choosing an algorithm.</b></div>

  <h2 id="ce-choose"><span class="num">12</span>Choosing an Algorithm</h2>
  <p><strong>The question we can't answer yet.</strong> K-Means, GMM, hierarchical or HDBSCAN: which one, for which data?</p>
  <p>Five algorithms on three scaled 2-D data sets with known truth: four round blobs, two moons, and three stretched clouds. ARI measures correctness; silhouette is shown next to it (noise points dropped for HDBSCAN):</p>
  <div class="fx" data-lang="py">from sklearn.mixture import GaussianMixture
from sklearn.cluster import AgglomerativeClustering, HDBSCAN
Xs, ys = make_blobs(n_samples=600, centers=3, random_state=170)
Xs = StandardScaler().fit_transform(Xs @ np.array([[0.6, -0.6], [-0.4, 0.8]]))
data = {"blobs": (StandardScaler().fit_transform(Xb), yb, 4), "moons": (Xm, ym, 2), "stretched": (Xs, ys, 3)}
algos = {
    "K-Means": lambda Z, k: KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(Z),
    "GMM": lambda Z, k: GaussianMixture(n_components=k, n_init=3, random_state=0).fit(Z).predict(Z),
    "Ward": lambda Z, k: AgglomerativeClustering(n_clusters=k).fit_predict(Z),
    "Single link": lambda Z, k: AgglomerativeClustering(n_clusters=k, linkage="single").fit_predict(Z),
    "HDBSCAN": lambda Z, k: HDBSCAN(min_cluster_size=15, copy=True).fit_predict(Z),
}
print(f"{'':12s}" + "".join(f"{d:&gt;18s}" for d in data))
print(f"{'':12s}" + "".join(f"{'ARI':&gt;9s}{'sil':&gt;9s}" for d in data))
for name, f in algos.items():
    row = ""
    for d, (Z, yt, k) in data.items():
        l = f(Z, k); keep = l != -1
        sil = silhouette_score(Z[keep], l[keep]) if len(set(l[keep])) &gt; 1 else float("nan")
        row += f"{adjusted_rand_score(yt, l):9.3f}{sil:9.3f}"
    print(f"{name:12s}" + row)</div>
  <div class="fx" data-lang="text">                         blobs             moons         stretched
                  ARI      sil      ARI      sil      ARI      sil
K-Means         1.000    0.798    0.470    0.494    0.574    0.507
GMM             1.000    0.798    0.479    0.493    1.000    0.467
Ward            1.000    0.798    0.209    0.432    0.681    0.489
Single link     1.000    0.798    1.000    0.380    0.564    0.488
HDBSCAN         0.997    0.799    0.954    0.403    0.877    0.524</div>
  <p>Read it in two ways. By data: round blobs are easy for everyone; moons need single linkage or HDBSCAN; stretched clouds need a GMM (1.000). By score: on the stretched clouds the perfect GMM answer has the <em>lowest</em> silhouette (0.467) and on the moons the correct answers have lower silhouettes than the wrong ones. Silhouette told you nothing about which algorithm was right.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>First choice</th><th>Why</th><th>Evaluate with</th></tr>
    <tr><td>Round clusters, large n, k roughly known</td><td><a class="xref" data-note="ml_kmeans">K-Means</a></td><td>fast, simple</td><td>silhouette, DB, CH, stability</td></tr>
    <tr><td>Elliptical or overlapping clusters, need probabilities</td><td><a class="xref" data-note="ml_gmm">GMM</a></td><td>shapes, soft labels</td><td>BIC, stability</td></tr>
    <tr><td>Odd shapes, noise, unknown k</td><td><a class="xref" data-note="ml_dbscan">HDBSCAN</a></td><td>density, noise label</td><td>DBCV, plots, stability</td></tr>
    <tr><td>Small n, want a taxonomy</td><td><a class="xref" data-note="ml_hierarchical">Hierarchical</a></td><td>dendrogram, any k</td><td>dendrogram gaps, cophenetic correlation</td></tr>
    <tr><td>High-dimensional (text, images)</td><td>reduce first (<a class="xref" data-note="ml_pca">PCA</a> / <a class="xref" data-note="ml_umap">UMAP</a>), then HDBSCAN or K-Means</td><td>distances concentrate</td><td>stability, business checks</td></tr>
  </table>
  <div class="flow"><span>Scale and pick features</span><span>Reduce dimensions if many</span><span>Plot a 2-D view</span><span>Try 2–3 algorithms</span><span>Internal + stability</span><span>Profile and test an outcome</span></div>
  <div class="bridge"><b>What this still can't tell us →</b> how all these scores relate to each other. <b>Next: how it all connects.</b></div>

  <h2 id="ce-connect"><span class="num">13</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> Which scores are built from which pieces, which question does each answer, and which can be trusted when?</p>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="ce-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="190" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="44" text-anchor="middle" font-size="12">data X + cluster labels</text>
<rect x="470" y="20" width="190" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="565" y="44" text-anchor="middle" font-size="12">cluster labels + true labels</text>
<rect x="20" y="90" width="90" height="40" rx="7" class="fb sb"/><text x="65" y="109" text-anchor="middle" font-size="11">pairwise</text><text x="65" y="122" text-anchor="middle" class="tm" font-size="10">distances</text>
<rect x="120" y="90" width="90" height="40" rx="7" class="fb sb"/><text x="165" y="109" text-anchor="middle" font-size="11">centroids,</text><text x="165" y="122" text-anchor="middle" class="tm" font-size="10">scatter, B, W</text>
<rect x="20" y="160" width="90" height="40" rx="7" class="fb sb" stroke-width="2"/><text x="65" y="184" text-anchor="middle" font-size="11.5">silhouette</text>
<rect x="120" y="160" width="90" height="40" rx="7" class="fb sb" stroke-width="2"/><text x="165" y="178" text-anchor="middle" font-size="11">DB · CH</text><text x="165" y="192" text-anchor="middle" class="tm" font-size="10">(W = inertia)</text>
<rect x="470" y="90" width="190" height="40" rx="7" class="fr sr"/><text x="565" y="109" text-anchor="middle" font-size="11.5">contingency table nᵢⱼ</text><text x="565" y="122" text-anchor="middle" class="tm" font-size="10">row sums aᵢ, column sums bⱼ</text>
<rect x="420" y="160" width="80" height="40" rx="7" class="fr sr"/><text x="460" y="178" text-anchor="middle" font-size="11">max per</text><text x="460" y="191" text-anchor="middle" font-size="11">column</text>
<rect x="510" y="160" width="80" height="40" rx="7" class="fr sr"/><text x="550" y="178" text-anchor="middle" font-size="11">C(nᵢⱼ, 2)</text><text x="550" y="191" text-anchor="middle" font-size="11">pairs</text>
<rect x="600" y="160" width="70" height="40" rx="7" class="fr sr"/><text x="635" y="178" text-anchor="middle" font-size="11">entropies</text><text x="635" y="191" text-anchor="middle" class="tm" font-size="10">H(C|K)…</text>
<rect x="420" y="230" width="80" height="44" rx="7" class="fr sr" stroke-width="2"/><text x="460" y="256" text-anchor="middle" font-size="11.5">purity</text>
<rect x="510" y="230" width="80" height="44" rx="7" class="fr sr" stroke-width="2"/><text x="550" y="249" text-anchor="middle" font-size="11">RI → ARI</text><text x="550" y="264" text-anchor="middle" font-size="11">FM</text>
<rect x="600" y="230" width="70" height="44" rx="7" class="fr sr" stroke-width="2"/><text x="635" y="249" text-anchor="middle" font-size="10.5">h, c, V</text><text x="635" y="264" text-anchor="middle" font-size="10.5">MI → AMI</text>
<rect x="240" y="160" width="150" height="40" rx="7" class="fg sg" stroke-width="2"/><text x="315" y="178" text-anchor="middle" font-size="11.5">stability</text><text x="315" y="192" text-anchor="middle" class="tm" font-size="10">ARI / Jaccard between runs</text>
<rect x="240" y="230" width="150" height="44" rx="7" class="fv" stroke-width="2"/><text x="315" y="249" text-anchor="middle" font-size="11.5">business validation</text><text x="315" y="264" text-anchor="middle" class="tm" font-size="10">profiles, tree, outcome</text>
<line x1="80" y1="60" x2="65" y2="88" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="150" y1="60" x2="165" y2="88" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="65" y1="130" x2="65" y2="158" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="165" y1="130" x2="165" y2="158" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="565" y1="60" x2="565" y2="88" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="520" y1="130" x2="465" y2="158" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="555" y1="130" x2="550" y2="158" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="600" y1="130" x2="630" y2="158" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="460" y1="200" x2="460" y2="228" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="550" y1="200" x2="550" y2="228" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="635" y1="200" x2="635" y2="228" stroke="currentColor" marker-end="url(#ce-ca)"/>
<line x1="210" y1="40" x2="300" y2="158" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ce-ca)"/>
<line x1="510" y1="250" x2="392" y2="185" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ce-ca)"/>
<text x="400" y="225" class="tm" font-size="9.5">ARI reused</text>
<text x="115" y="230" text-anchor="middle" class="tm" font-size="10.5">internal: data only</text>
<text x="545" y="292" text-anchor="middle" class="tm" font-size="10.5">external: needs true labels</text>
</svg><figcaption>Internal scores are built from distances (silhouette) or from centroids and sums of squares (Davies–Bouldin, Calinski–Harabasz). External scores are all functions of one contingency table, through three routes: majority counts, pairs, entropies. Stability reuses ARI to compare a clustering with itself under resampling; business validation brings in new information.</figcaption></figure>
  <h3>Every per-customer piece of the running example</h3>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_samples
sil_i = silhouette_samples(X, lab3)
print("cust spend true cluster  a      b      s")
for i in range(9):
    a, b, s = silhouette_by_hand(i, spend, lab3)
    print(f" C{i+1}  {spend[i]:4.0f}   {true[i]}     {lab3[i]}    {a:.3f}  {b:.3f}  {s:.3f}")</div>
  <div class="fx" data-lang="text">cust spend true cluster  a      b      s
 C1     1   0     0    1.500  6.000  0.750
 C2     2   0     0    1.000  5.000  0.800
 C3     3   0     0    1.500  4.000  0.625
 C4     6   0     1    1.500  4.000  0.625
 C5     7   1     1    1.000  5.000  0.800
 C6     8   1     1    1.500  6.000  0.750
 C7    13   2     2    1.500  6.000  0.750
 C8    14   2     2    1.000  7.000  0.857
 C9    15   2     2    1.500  8.000  0.812</div>
  <p>Each silhouette comes from that customer's a and b; their mean is 0.752. The "true" and "cluster" columns build the contingency table, from which purity 0.889, ARI 0.643 and V-measure 0.786 follow. Only C4 disagrees, and it is also tied for the lowest silhouette (0.625): the internal and external views point at the same customer.</p>
  <h3>The summary table</h3>
  <table class="tbl">
    <tr><th>Score</th><th>Built from</th><th>Answers</th><th>Customers (k = 3)</th><th>Robust / sensitive</th></tr>
    <tr><td>Silhouette</td><td>a, b from pairwise distances</td><td>Is each point well placed?</td><td>0.752 (k = 2: 0.682, k = 4: 0.536)</td><td>favours convex; O(n²)</td></tr>
    <tr><td>Davies–Bouldin</td><td>centroids, scatter</td><td>Are clusters confusable?</td><td>0.241</td><td>favours convex; cheap</td></tr>
    <tr><td>Calinski–Harabasz</td><td>B and W (W = inertia)</td><td>Variation between vs within?</td><td>109 (B 218, W 6)</td><td>no fixed scale; convex</td></tr>
    <tr><td>Purity</td><td>column maxima of the table</td><td>Clusters mostly one class?</td><td>0.889</td><td>fooled by many clusters</td></tr>
    <tr><td>RI → ARI</td><td>pair counts (TP 7, FP 2, FN 3, TN 24)</td><td>Agree on who is together?</td><td>0.861 → 0.643</td><td>ARI chance-corrected</td></tr>
    <tr><td>Fowlkes–Mallows</td><td>TP, FP, FN</td><td>Pair precision × recall</td><td>0.738</td><td>ignores TN</td></tr>
    <tr><td>Homogeneity / completeness</td><td>conditional entropies</td><td>Pure clusters? Whole classes?</td><td>0.800 / 0.773</td><td>each fooled one way</td></tr>
    <tr><td>V-measure = NMI</td><td>h and c (or MI and H)</td><td>Overall information match</td><td>0.786</td><td>not chance-corrected</td></tr>
    <tr><td>AMI</td><td>MI minus its chance value</td><td>Same, corrected</td><td>0.692</td><td>robust to unbalanced sizes</td></tr>
    <tr><td>Stability</td><td>ARI between runs</td><td>Does it reproduce?</td><td>k = 3: 1.000; k = 2: 0.892; k = 4: 0.858</td><td>stable ≠ right</td></tr>
    <tr><td>Business</td><td>profiles, tree, outcome</td><td>Is it useful?</td><td>response 0 / 0.67 / 1.0</td><td>needs held-out outcome</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us →</b> the usual mistakes made with these scores. <b>Next: common mistakes.</b></div>

  <h2 id="ce-traps"><span class="num">14</span>Common Mistakes</h2>
  <p><strong>The question we can't answer yet.</strong> Knowing the scores, where do people still go wrong?</p>
  <div class="callout trap"><span class="label">Trap: one internal score as the truth</span>
    <p>Silhouette, DB and CH share a "compact around a centre" definition. They preferred K-Means' wrong cut on the moons and gave the perfect GMM the worst silhouette on stretched clouds. Use them to compare k within one algorithm, not to crown an algorithm.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing scores across feature sets</span>
    <p>Silhouette on 2 scaled features and silhouette on 20 raw features are on different scales of meaning. Compare scores only for clusterings of the same data with the same preprocessing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: including noise points, or silently dropping them</span>
    <p>For DBSCAN/HDBSCAN, label −1 is not a cluster. Drop noise before internal scores and report how many points were dropped; with external scores, decide explicitly whether noise counts as its own group.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: purity or RI alone</span>
    <p>Singletons get purity 1; random labels get RI 0.556. Report ARI or AMI.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: matching labels by name</span>
    <p>Cluster numbers are arbitrary. Never compute "accuracy" by comparing cluster 0 with class 0; use permutation-invariant scores or match clusters to classes first (Hungarian algorithm).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: evaluating on the features used to cluster</span>
    <p>"Cluster 2 has high spend" is not validation when spend built the clusters. Validate on held-out features and outcomes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: silhouette on huge data without sampling</span>
    <p>O(n²) memory: 100,000 rows means 10¹⁰ distances. Use sample_size.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> nothing new; time to compress everything. <b>Next: the revision sheet.</b></div>

  <h2 id="ce-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: nine customers' monthly spend 1, 2, 3, 6, 7, 8, 13, 14, 15 (C1–C9); K-Means k = 3 gives clusters {1,2,3}, {6,7,8}, {13,14,15}; the CRM segments are budget {C1–C4}, regular {C5, C6}, premium {C7–C9} (only C4 disagrees).</p>
  <h3>The question ladder in one line each</h3>
  <ol class="story">
    <li><b>Why evaluate</b><span>Every algorithm returns labels for any k; we need evidence.</span></li>
    <li><b>Silhouette</b><span>Per point: own-cluster distance a vs nearest-other b; mean 0.752 for k = 3.</span></li>
    <li><b>Davies–Bouldin</b><span>Per cluster: worst (spread + spread)/centroid distance; 0.241.</span></li>
    <li><b>Calinski–Harabasz</b><span>Between vs within sums of squares with degrees of freedom; 109.</span></li>
    <li><b>Internal together</b><span>All pick k = 3 here, but all favour round clusters (moons trap).</span></li>
    <li><b>Contingency and purity</b><span>Count (class, cluster) cells; purity 0.889 but fooled by splitting.</span></li>
    <li><b>Pairs</b><span>RI 0.861 is inflated by chance; ARI 0.643 corrects it; FM 0.738.</span></li>
    <li><b>Entropy</b><span>Homogeneity 0.800 (pure clusters), completeness 0.773 (whole classes), V = NMI 0.786, AMI 0.692.</span></li>
    <li><b>Stability</b><span>Resample and re-cluster: k = 3 always reproduces; stable is necessary, not sufficient.</span></li>
    <li><b>Business</b><span>Profiles, a surrogate tree and a held-out outcome (coupon response 0 / 0.67 / 1.0) decide usefulness.</span></li>
  </ol>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Score</th><th>Formula</th><th>Symbols</th><th>Best</th></tr>
    <tr><td>Silhouette</td><td>s(i) = (b − a)/max(a, b); score = mean s(i)</td><td>a = mean distance to own cluster; b = smallest mean distance to another cluster</td><td>1</td></tr>
    <tr><td>Davies–Bouldin</td><td>(1/k) Σᵢ maxⱼ (Sᵢ + Sⱼ)/Mᵢⱼ</td><td>S = mean distance to centroid; M = centroid distance</td><td>0</td></tr>
    <tr><td>Calinski–Harabasz</td><td>[B/(k−1)] / [W/(n−k)]</td><td>B = Σ nₖ‖cₖ − m‖²; W = Σ‖x − cₖ‖²</td><td>high</td></tr>
    <tr><td>Purity</td><td>(1/n) Σⱼ maxᵢ nᵢⱼ</td><td>nᵢⱼ = class i, cluster j count</td><td>1</td></tr>
    <tr><td>Rand index</td><td>(TP + TN)/C(n, 2)</td><td>pair agreements</td><td>1</td></tr>
    <tr><td>ARI</td><td>(Σ C(nᵢⱼ,2) − E)/(½[Σ C(aᵢ,2) + Σ C(bⱼ,2)] − E), E = Σ C(aᵢ,2) Σ C(bⱼ,2)/C(n,2)</td><td>aᵢ class sizes, bⱼ cluster sizes</td><td>1 (0 = chance)</td></tr>
    <tr><td>Fowlkes–Mallows</td><td>TP/√((TP+FP)(TP+FN))</td><td>pair precision × recall</td><td>1</td></tr>
    <tr><td>Homogeneity</td><td>1 − H(C|K)/H(C)</td><td>C classes, K clusters</td><td>1</td></tr>
    <tr><td>Completeness</td><td>1 − H(K|C)/H(K)</td><td></td><td>1</td></tr>
    <tr><td>V-measure / NMI</td><td>2hc/(h + c) = MI / mean(H(C), H(K))</td><td>MI = H(C) − H(C|K)</td><td>1</td></tr>
    <tr><td>AMI</td><td>(MI − E[MI])/(mean H − E[MI])</td><td>E[MI] = chance MI</td><td>1 (0 = chance)</td></tr>
    <tr><td>Jaccard</td><td>|A ∩ B|/|A ∪ B|</td><td>member sets of two clusters</td><td>1</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>k</th><th>Silhouette</th><th>Davies–Bouldin</th><th>Calinski–Harabasz</th><th>Stability (mean ARI)</th></tr>
    <tr><td>2</td><td>0.682</td><td>0.333</td><td>29.0</td><td>0.892</td></tr>
    <tr><td><strong>3</strong></td><td><strong>0.752</strong></td><td><strong>0.241</strong></td><td><strong>109.0</strong></td><td><strong>1.000</strong></td></tr>
    <tr><td>4</td><td>0.536</td><td>0.265</td><td>81.3</td><td>0.858</td></tr>
  </table>
  <p>External (k = 3 vs CRM): purity 0.889 · TP 7, FP 2, FN 3, TN 24 · RI 0.861 · ARI 0.643 · FM 0.738 · homogeneity 0.800 · completeness 0.773 · V = NMI 0.786 · MI 0.849 nats · AMI 0.692. Silhouettes per customer: 0.750, 0.800, 0.625, 0.625, 0.800, 0.750, 0.750, 0.857, 0.812.</p>
  <h3>When to use which</h3>
  <div class="cards">
    <div><b>No labels, choosing k</b><p>Silhouette (plus DB, CH) within one algorithm, and stability across resamples.</p><small>beware non-convex clusters</small></div>
    <div><b>Labels available</b><p>ARI as the headline, AMI for unbalanced classes, homogeneity/completeness to diagnose.</p><small>never purity or RI alone</small></div>
    <div><b>Density clusters</b><p>Plots, DBCV, stability; drop noise and say so.</p><small>silhouette is unfair here</small></div>
    <div><b>Shipping segments</b><p>Profiles, surrogate tree, a held-out outcome, an experiment.</p><small>usefulness beats geometry</small></div>
  </div>
  <h3>Key traps</h3>
  <div class="callout trap"><span class="label">Remember</span>
    <p>Every algorithm returns labels. Internal scores share K-Means' idea of a cluster. Purity and RI are inflated; ARI/AMI are chance-corrected. Labels are arbitrary names. Stable is not the same as right. Validate on information the clustering did not use.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>a = 2, b = 5. Silhouette of the point?</td><td>(5 − 2)/5 = 0.6.</td></tr>
    <tr><td>S₁ = S₂ = 1, centroids 4 apart, only two clusters. DB?</td><td>R = 2/4 = 0.5 for both; DB = 0.5.</td></tr>
    <tr><td>B = 90, W = 10, n = 12, k = 3. CH?</td><td>(90/2)/(10/9) = 45/1.111 = 40.5.</td></tr>
    <tr><td>Why is RI high for random labels?</td><td>Most pairs are "apart" in both labelings by chance (TN dominates); ARI subtracts that expected agreement.</td></tr>
    <tr><td>Low completeness, high homogeneity: merge or split?</td><td>Merge: clusters are pure but classes are spread over several clusters.</td></tr>
  </table>

  <h2 id="ce-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you evaluate a clustering when you have no labels?</summary><div class="qa-body">Internal scores (silhouette, Davies–Bouldin, Calinski–Harabasz) to compare k and settings within one algorithm; stability under subsampling and seeds; visual checks in a 2-D projection; and business validation: profile the clusters, explain them with a shallow tree, and test whether they differ on an outcome they were not built from.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define the silhouette and compute it for a = 1.5, b = 4.</summary><div class="qa-body">s = (b − a)/max(a, b), with a the mean distance to the point's own cluster and b the smallest mean distance to another cluster. (4 − 1.5)/4 = 0.625, exactly customer C4 in the running example.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Silhouette, Davies–Bouldin, Calinski–Harabasz: what does each measure and which direction is better?</summary><div class="qa-body">Silhouette: per-point cohesion vs separation, −1 to 1, higher better. DB: average over clusters of the worst (Sᵢ + Sⱼ)/Mᵢⱼ, lower better. CH: between-cluster over within-cluster variance with degrees-of-freedom corrections, higher better. On the nine customers: 0.752, 0.241, 109 for k = 3, all best among k = 2, 3, 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a wrong clustering have a better silhouette than the right one?</summary><div class="qa-body">Silhouette (like DB and CH) rewards compact clusters around a centre. Curved or elongated true clusters have large within-cluster distances, so a straight cut into rounder halves scores higher: on the moons K-Means scored 0.494 with ARI 0.47 while the correct DBSCAN result scored 0.385. Use plots and density-based measures (DBCV) for such data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the adjusted Rand index and why the adjustment is needed.</summary><div class="qa-body">RI is the share of pairs on which two labelings agree (together/apart). Because most pairs are apart in both, random labels already get a high RI. ARI = (Index − Expected)/(Max − Expected) using pair counts from the contingency table, so random labelings score about 0 and identical ones 1. Running example: Index 7, Expected 2.5, Max 9.5 → 0.643.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are homogeneity and completeness, and what do they tell you to do?</summary><div class="qa-body">Homogeneity = 1 − H(C|K)/H(C): each cluster holds one class. Completeness = 1 − H(K|C)/H(K): each class lies in one cluster. Low homogeneity → clusters mix classes, consider splitting (more clusters). Low completeness → classes are fragmented, consider merging. Their harmonic mean is the V-measure (= NMI with arithmetic normalisation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is purity a dangerous metric?</summary><div class="qa-body">It only checks that each cluster is dominated by one class, so it rewards splitting: n singleton clusters have purity 1. Use it only with a fixed number of clusters and alongside ARI/AMI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ARI or AMI: which and when?</summary><div class="qa-body">Both are chance-corrected and permutation-invariant. ARI is the common default when the reference classes are reasonably balanced and clusters fairly large; AMI is preferred with unbalanced classes or many small clusters (Romano et al., 2016). Report one consistently, possibly both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run a stability analysis, and what does it prove?</summary><div class="qa-body">Repeatedly subsample or bootstrap the data (and vary seeds), re-cluster with the same pipeline, and compare labels on shared rows with ARI (or per cluster with Jaccard after matching). Unstable results are arbitrary and should be rejected. Stability does not prove correctness: on four blobs, k = 3 was as stable as k = 4 because the same two blobs were always merged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Marketing says your high-silhouette segmentation is useless. What do you check?</summary><div class="qa-body">Whether the clusters differ on things the business cares about: profile them (sizes, z-scores), see whether a shallow tree can describe them in plain rules, and test whether they differ on held-out outcomes (response, churn, margin). If not, change the features to ones tied to the decision; a geometrically clean split on an irrelevant feature is still useless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you choose between K-Means, GMM, hierarchical and HDBSCAN for a new data set?</summary><div class="qa-body">Scale and, if high-dimensional, reduce first; plot a 2-D view. Round clusters and big data: K-Means. Elliptical, overlapping or unequal clusters and a need for probabilities: GMM with BIC. Odd shapes, noise, unknown k: HDBSCAN. Small data and a need for a taxonomy: hierarchical. Then compare candidates with stability and business checks, not with silhouette alone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) What is the link between Calinski–Harabasz and K-Means?</summary><div class="qa-body">W in CH is exactly K-Means' inertia (within-cluster sum of squares), and B + W is the fixed total sum of squares. K-Means minimises W, which maximises B; CH divides B/(k − 1) by W/(n − k), like an ANOVA F statistic, so it is naturally biased toward K-Means-style solutions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How are pair-counting scores related to classification metrics?</summary><div class="qa-body">Treat "should this pair be together?" as a binary classification. TP, FP, FN, TN are its confusion matrix (7, 2, 3, 24 in the running example); Rand index is its accuracy, Fowlkes–Mallows is the geometric mean of its precision (7/9) and recall (7/10), and ARI is its chance-corrected agreement, like Cohen's kappa.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) In the running example, why do the internal and external views both single out C4?</summary><div class="qa-body">C4 (spend 6) is only 3 away from the low spenders, so its a and b are close (silhouette 0.625, tied lowest). The CRM calls it budget while the clustering puts it with the regulars, producing all 2 false-positive and 3 false-negative pairs. A point near a cluster border is exactly where geometry and external labels are most likely to disagree.</div></details>
</main>
`
});
