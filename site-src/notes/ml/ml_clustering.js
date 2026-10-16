// ml/ml_clustering.js — Clustering
Object.assign(TOPIC_CONTENT, {
  "ml_clustering": `<main>
  <h1>Clustering</h1>
  <p class="lead">Clustering puts similar rows into groups when you have no labels. Shops use it to find customer types, news apps to group stories, banks to spot odd transactions. This page covers KMeans, choosing k, DBSCAN and hierarchical clustering, all run on real synthetic data. You need distances and feature scaling first.</p>

  <h2 id="mcu-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Clustering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics</div>
        <ul>
          <li><b>Unsupervised</b> — no labels; group by similarity (a distance)</li>
          <li><b>Uses</b> — segmentation, topic grouping, image compression, anomaly flags, label bootstrapping</li>
          <li>⚠ <b>Scale first</b> — distance-based; a 0–100k feature drowns a 0–1 one</li>
          <li>⚠ High dims (&gt; ~20) → distances concentrate; reduce with PCA/UMAP first</li>
          <li>⚠ "Good" geometry ≠ useful segments; profile each cluster in business terms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">KMeans</div>
        <ul>
          <li><b>Objective</b> — minimise WCSS (inertia) = Σ ||x − μ<sub>k</sub>||²</li>
          <li><b>Lloyd loop</b> — assign to nearest centroid → move centroid to mean → repeat</li>
          <li><b>Converges</b> always (inertia never rises) but to a <b>local</b> minimum</li>
          <li><b>Fix</b> — k-means++ init + <code>n_init=10</code>, keep lowest inertia</li>
          <li><b>Cost</b> — O(n·k·d) per iteration; scales to millions (MiniBatchKMeans)</li>
          <li>💡 Kirana shops in a new colony: each family uses the nearest shop, shops move to the middle of their customers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing k</div>
        <ul>
          <li><b>Elbow</b> — inertia vs k; pick the bend. Always falls, so subjective</li>
          <li><b>Silhouette</b> — s = (b − a) / max(a, b); a = own-cluster dist, b = nearest other cluster</li>
          <li>Range −1…1; &gt; 0.5 good, ~0 overlapping, &lt; 0 wrong cluster</li>
          <li>4 blobs: inertia 15737 → 3426 → <b>949</b> → 856; silhouette peaks 0.791 at k=4</li>
          <li><b>Davies–Bouldin</b> — scatter / separation; lower is better (0.29 on blobs)</li>
          <li>⚠ All favour round clusters; moons fool them</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">KMeans fails when</div>
        <ul>
          <li><b>Non-spherical</b> — moons: ARI 0.47 (DBSCAN 0.99)</li>
          <li><b>Unequal sizes/spreads</b> — 1000 vs 50 pts: big cluster split, ARI 0.07</li>
          <li><b>Unscaled</b> — income swamps age: ARI 0.00 → 1.00 after scaling</li>
          <li><b>Outliers</b> — pull centroids; every point forced into a cluster</li>
          <li><b>Alternatives</b> — DBSCAN/HDBSCAN (shapes, noise), GMM (ellipses, soft)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">DBSCAN</div>
        <ul>
          <li><b>Density</b> — cluster = region where points are packed</li>
          <li><b>eps</b> radius, <b>min_samples</b> neighbours (incl. itself) to be dense</li>
          <li><b>Core</b> ≥ min_samples within eps · <b>Border</b> near a core, not dense · <b>Noise</b> → label −1</li>
          <li>No k; any shape; outliers for free</li>
          <li><b>eps</b> — knee of sorted k-distance plot (k = min_samples)</li>
          <li>Moons: eps 0.1 → 20 clusters, <b>0.3 → 2</b>, 0.6 → 1</li>
          <li>⚠ One eps can't fit mixed densities → <b>HDBSCAN</b> (ARI 0.80 → 0.89)</li>
          <li>💡 India at night from space: bright cities are clusters, lone village lights are noise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hierarchical</div>
        <ul>
          <li><b>Agglomerative</b> — start n singletons, merge the closest pair, repeat</li>
          <li><b>Dendrogram</b> — merge tree; cut at a height → any k after the fact</li>
          <li><b>Linkage</b> — single (min, chains), complete (max, compact), average, <b>ward</b> (min variance increase, default)</li>
          <li>Moons: single ARI 1.00, ward 0.21</li>
          <li>Cost O(n²) memory → ≤ ~10–20k points</li>
          <li>Cut where the vertical gap is largest</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Which one</div>
        <ul>
          <li><b>KMeans</b> — big data, round blobs, k roughly known</li>
          <li><b>DBSCAN / HDBSCAN</b> — odd shapes, unknown k, need noise</li>
          <li><b>Hierarchical</b> — small n, want a taxonomy / dendrogram</li>
          <li><b>GMM</b> — elliptical clusters, soft probabilities</li>
          <li><b>With labels</b> → ARI to check; without → silhouette + human review</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mcu-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Clustering Does</span><span class="rm-sub">Groups without labels</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-km"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">KMeans</span><span class="rm-sub">Assign → update → repeat</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-k"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Choosing k</span><span class="rm-sub">Elbow and silhouette, real numbers</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-fail"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">When KMeans Fails</span><span class="rm-sub">Shapes, sizes, scale</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-db"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">DBSCAN</span><span class="rm-sub">Core, border, noise</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-hc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Hierarchical Clustering</span><span class="rm-sub">Dendrograms and linkage</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-which"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Which to Use</span><span class="rm-sub">Decision table</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">Segment and profile</span></div></div>
      <div class="rm-item rm-done" data-target="mcu-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mcu-what"><span class="num">01</span>What Clustering Does</h2>
  <div class="flow"><span>Unlabeled rows</span><span>Scale features</span><span>Measure distance</span><span>Group similar rows</span><span>Name each group</span></div>
  <p>You have rows but no answer column. Example: 10 lakh Flipkart customers, no "type" label. Clustering finds groups like "weekend bargain hunters" and "monthly big spenders". The algorithm only sees distances, so the groups are only as good as your features and scaling.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new teacher seats a class by watching who talks to whom. Nobody gave her a list of friend groups; she finds them from behaviour.</p>
  </div>
  <div class="cards">
    <div><b>Centroid</b><p>Each cluster = a centre point.</p><small>KMeans</small></div>
    <div><b>Density</b><p>Cluster = crowded region; sparse = noise.</p><small>DBSCAN, HDBSCAN</small></div>
    <div><b>Hierarchy</b><p>Nested merges, cut at any level.</p><small>Agglomerative</small></div>
    <div><b>Distribution</b><p>Mixture of Gaussians, soft membership.</p><small>GMM</small></div>
  </div>

  <h2 id="mcu-km"><span class="num">02</span>KMeans</h2>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><defs><marker id="mcu-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs><text x="90" y="18" text-anchor="middle">1. Random centroids</text><rect x="5" y="25" width="170" height="135" fill="none" stroke="currentColor" opacity=".3"/><circle cx="30" cy="133" r="4" class="fs"/><circle cx="40" cy="116" r="4" class="fs"/><circle cx="50" cy="129" r="4" class="fs"/><circle cx="56" cy="112" r="4" class="fs"/><circle cx="130" cy="64" r="4" class="fs"/><circle cx="140" cy="47" r="4" class="fs"/><circle cx="150" cy="61" r="4" class="fs"/><circle cx="158" cy="42" r="4" class="fs"/><circle cx="126" cy="44" r="4" class="fs"/><circle cx="34" cy="107" r="4" class="fs"/><rect x="34" y="118" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="54" y="103" width="12" height="12" class="fr sr" stroke-width="2"/><text x="280" y="18" text-anchor="middle">2. Assign to nearest</text><rect x="195" y="25" width="170" height="135" fill="none" stroke="currentColor" opacity=".3"/><circle cx="220" cy="133" r="4" class="fb sb"/><circle cx="230" cy="116" r="4" class="fb sb"/><circle cx="240" cy="129" r="4" class="fb sb"/><circle cx="246" cy="112" r="4" class="fr sr"/><circle cx="320" cy="64" r="4" class="fr sr"/><circle cx="330" cy="47" r="4" class="fr sr"/><circle cx="340" cy="61" r="4" class="fr sr"/><circle cx="348" cy="42" r="4" class="fr sr"/><circle cx="316" cy="44" r="4" class="fr sr"/><circle cx="224" cy="107" r="4" class="fb sb"/><rect x="224" y="118" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="244" y="103" width="12" height="12" class="fr sr" stroke-width="2"/><text x="470" y="18" text-anchor="middle">3. Move to the mean</text><rect x="385" y="25" width="170" height="135" fill="none" stroke="currentColor" opacity=".3"/><circle cx="410" cy="133" r="4" class="fb sb"/><circle cx="420" cy="116" r="4" class="fb sb"/><circle cx="430" cy="129" r="4" class="fb sb"/><circle cx="436" cy="112" r="4" class="fr sr"/><circle cx="510" cy="64" r="4" class="fr sr"/><circle cx="520" cy="47" r="4" class="fr sr"/><circle cx="530" cy="61" r="4" class="fr sr"/><circle cx="538" cy="42" r="4" class="fr sr"/><circle cx="506" cy="44" r="4" class="fr sr"/><circle cx="414" cy="107" r="4" class="fb sb"/><line x1="420" y1="124" x2="418" y2="121" stroke="currentColor" stroke-dasharray="3 2" marker-end="url(#mcu-ar)"/><rect x="412" y="115" width="12" height="12" class="fb sb" stroke-width="2"/><line x1="440" y1="109" x2="507" y2="62" stroke="currentColor" stroke-dasharray="3 2" marker-end="url(#mcu-ar)"/><rect x="501" y="56" width="12" height="12" class="fr sr" stroke-width="2"/><text x="280" y="182" text-anchor="middle" class="tm">repeat 2 → 3 until no point changes colour (here: one more round)</text></svg><figcaption>Squares = centroids. Both start in the left group; after one update red jumps to the right group, and the next assignment is final.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>KMeans splits data into k groups, each with a centre point. It wants every point close to its own centre. "Close" is measured by <strong>inertia</strong> (also called WCSS): the sum of squared distances from each point to its centre. Lower is tighter.</p>
  </div>
  <p>It is the fastest, simplest clustering method, so it is the usual first try. The loop (Lloyd's algorithm):</p>
  <div class="flow"><span>Place k centres</span><span>Each point joins its nearest centre</span><span>Each centre moves to the mean of its points</span><span>Repeat until nobody switches</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>k kirana shops open in a new colony. Every family buys from the nearest shop. Each shopkeeper then shifts to the middle of his customers. Families switch to whichever shop is now closest. After a few rounds nobody switches.</p>
  </div>
  <ul>
    <li><strong>Always converges</strong>: neither step can raise inertia. But only to a <em>local</em> minimum.</li>
    <li><strong>k-means++</strong> spreads initial centres apart; <code>n_init=10</code> runs 10 starts and keeps the best.</li>
    <li>Cost O(n·k·d) per iteration. For millions of rows use <code>MiniBatchKMeans</code>.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score

X, y = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)
km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X)
print("sizes", np.bincount(km.labels_), "ARI", round(adjusted_rand_score(y, km.labels_), 3),
      "iters", km.n_iter_)</div>
  <div class="fx" data-lang="text">sizes [125 125 125 125] ARI 1.0 iters 2</div>
  <p><strong>ARI</strong> (adjusted Rand index) compares clusters with true labels: 1 = perfect, ~0 = random. Only usable when you happen to have labels.</p>

  <h2 id="mcu-k"><span class="num">03</span>Choosing k</h2>
  <p>KMeans needs k before it starts, but with no labels nobody tells you k. So you try several k values and score each one.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<text x="140" y="16" text-anchor="middle">Elbow: inertia</text>
<text x="420" y="16" text-anchor="middle">Silhouette</text>
<line x1="40" y1="150" x2="270" y2="150" stroke="currentColor"/><line x1="40" y1="25" x2="40" y2="150" stroke="currentColor"/>
<line x1="320" y1="150" x2="550" y2="150" stroke="currentColor"/><line x1="320" y1="25" x2="320" y2="150" stroke="currentColor"/>
<polyline points="60,32 104,124 148,143 192,144 236,144 270,145" fill="none" class="sb" stroke-width="2"/>
<circle cx="60" cy="32" r="4" class="fb sb"/><circle cx="104" cy="124" r="4" class="fb sb"/><circle cx="148" cy="143" r="6" class="fr sr"/><circle cx="192" cy="144" r="4" class="fb sb"/><circle cx="236" cy="144" r="4" class="fb sb"/>
<text x="68" y="36" class="tm">15737</text><text x="112" y="120" class="tm">3426</text><text x="148" y="133" class="tr">949</text>
<polyline points="340,91 384,42 428,33 472,71 516,102 545,137" fill="none" class="st" stroke-width="2"/>
<circle cx="340" cy="91" r="4" class="ft st"/><circle cx="384" cy="42" r="4" class="ft st"/><circle cx="428" cy="33" r="6" class="fr sr"/><circle cx="472" cy="71" r="4" class="ft st"/><circle cx="516" cy="102" r="4" class="ft st"/>
<text x="350" y="96" class="tm">.596</text><text x="372" y="60" class="tm">.761</text><text x="436" y="32" class="tr">.791</text><text x="480" y="70" class="tm">.665</text><text x="524" y="102" class="tm">.561</text>
<g class="tm"><text x="60" y="166" text-anchor="middle">2</text><text x="104" y="166" text-anchor="middle">3</text><text x="148" y="166" text-anchor="middle">4</text><text x="192" y="166" text-anchor="middle">5</text><text x="236" y="166" text-anchor="middle">6</text>
<text x="340" y="166" text-anchor="middle">2</text><text x="384" y="166" text-anchor="middle">3</text><text x="428" y="166" text-anchor="middle">4</text><text x="472" y="166" text-anchor="middle">5</text><text x="516" y="166" text-anchor="middle">6</text></g>
<text x="155" y="188" text-anchor="middle" class="tm">k → bend at 4</text><text x="435" y="188" text-anchor="middle" class="tm">k → peak at 4</text>
</svg><figcaption>Real numbers from 4 blobs. Inertia always drops with k; look for where it stops dropping fast. Silhouette has a real maximum.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_score, davies_bouldin_score
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(f"k={k}  inertia={km.inertia_:8.0f}  silhouette={silhouette_score(X, km.labels_):.3f}")</div>
  <div class="fx" data-lang="text">k=2  inertia=   15737  silhouette=0.596
k=3  inertia=    3426  silhouette=0.761
k=4  inertia=     949  silhouette=0.791
k=5  inertia=     856  silhouette=0.665
k=6  inertia=     769  silhouette=0.561
k=7  inertia=     681  silhouette=0.442</div>
  <table class="tbl">
    <tr><th>Method</th><th>How</th><th>Read it</th></tr>
    <tr><td><strong>Elbow</strong></td><td>Plot inertia vs k</td><td>Pick the bend. Inertia hits 0 at k = n, so never pick the minimum. Often no clear bend.</td></tr>
    <tr><td><strong>Silhouette</strong></td><td>Per point s = (b − a) / max(a, b); average</td><td>a = mean distance to own cluster, b = to the nearest other. Higher is better (max 1). Example: a = 2, b = 5 → (5 − 2)/5 = 0.6.</td></tr>
    <tr><td><strong>Davies–Bouldin</strong></td><td>Mean ratio of cluster scatter to separation</td><td>Lower is better. 0.294 here at k=4.</td></tr>
    <tr><td><strong>Business check</strong></td><td>Profile each cluster's feature means</td><td>Do segments behave differently? If not, k is wrong or features are.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high silhouette means geometrically separated, not useful. Two segments that buy the same things at the same rate are one segment for the business.</p>
  </div>

  <h2 id="mcu-fail"><span class="num">04</span>When KMeans Fails</h2>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560"><text x="140" y="18" text-anchor="middle">KMeans k=2 — ARI 0.47</text><text x="420" y="18" text-anchor="middle">DBSCAN eps=0.3 — ARI 0.99</text><circle cx="117" cy="39" r="3" class="fr sr"/><circle cx="22" cy="96" r="3" class="fr sr"/><circle cx="69" cy="43" r="3" class="fr sr"/><circle cx="173" cy="93" r="3" class="fb sb"/><circle cx="100" cy="103" r="3" class="fb sb"/><circle cx="110" cy="47" r="3" class="fr sr"/><circle cx="113" cy="120" r="3" class="fb sb"/><circle cx="49" cy="49" r="3" class="fr sr"/><circle cx="142" cy="126" r="3" class="fb sb"/><circle cx="93" cy="69" r="3" class="fr sr"/><circle cx="32" cy="68" r="3" class="fr sr"/><circle cx="40" cy="51" r="3" class="fr sr"/><circle cx="105" cy="118" r="3" class="fb sb"/><circle cx="141" cy="59" r="3" class="fr sr"/><circle cx="30" cy="73" r="3" class="fr sr"/><circle cx="90" cy="73" r="3" class="fr sr"/><circle cx="20" cy="85" r="3" class="fr sr"/><circle cx="237" cy="68" r="3" class="fb sb"/><circle cx="181" cy="131" r="3" class="fb sb"/><circle cx="12" cy="94" r="3" class="fr sr"/><circle cx="170" cy="103" r="3" class="fb sb"/><circle cx="141" cy="59" r="3" class="fr sr"/><circle cx="160" cy="91" r="3" class="fb sb"/><circle cx="157" cy="77" r="3" class="fb sb"/><circle cx="240" cy="70" r="3" class="fb sb"/><circle cx="80" cy="40" r="3" class="fr sr"/><circle cx="93" cy="75" r="3" class="fr sr"/><circle cx="38" cy="58" r="3" class="fr sr"/><circle cx="11" cy="96" r="3" class="fr sr"/><circle cx="24" cy="82" r="3" class="fr sr"/><circle cx="141" cy="138" r="3" class="fb sb"/><circle cx="102" cy="101" r="3" class="fb sb"/><circle cx="124" cy="117" r="3" class="fb sb"/><circle cx="85" cy="44" r="3" class="fr sr"/><circle cx="210" cy="123" r="3" class="fb sb"/><circle cx="206" cy="124" r="3" class="fb sb"/><circle cx="164" cy="80" r="3" class="fb sb"/><circle cx="65" cy="45" r="3" class="fr sr"/><circle cx="170" cy="137" r="3" class="fb sb"/><circle cx="123" cy="42" r="3" class="fr sr"/><circle cx="407" cy="39" r="3" class="fr sr"/><circle cx="312" cy="96" r="3" class="fr sr"/><circle cx="359" cy="43" r="3" class="fr sr"/><circle cx="463" cy="93" r="3" class="fr sr"/><circle cx="390" cy="103" r="3" class="fb sb"/><circle cx="400" cy="47" r="3" class="fr sr"/><circle cx="403" cy="120" r="3" class="fb sb"/><circle cx="339" cy="49" r="3" class="fr sr"/><circle cx="432" cy="126" r="3" class="fb sb"/><circle cx="383" cy="69" r="3" class="fb sb"/><circle cx="322" cy="68" r="3" class="fr sr"/><circle cx="330" cy="51" r="3" class="fr sr"/><circle cx="395" cy="118" r="3" class="fb sb"/><circle cx="431" cy="59" r="3" class="fr sr"/><circle cx="320" cy="73" r="3" class="fr sr"/><circle cx="380" cy="73" r="3" class="fb sb"/><circle cx="310" cy="85" r="3" class="fr sr"/><circle cx="527" cy="68" r="3" class="fb sb"/><circle cx="471" cy="131" r="3" class="fb sb"/><circle cx="302" cy="94" r="3" class="fr sr"/><circle cx="460" cy="103" r="3" class="fr sr"/><circle cx="431" cy="59" r="3" class="fr sr"/><circle cx="450" cy="91" r="3" class="fr sr"/><circle cx="447" cy="77" r="3" class="fr sr"/><circle cx="530" cy="70" r="3" class="fb sb"/><circle cx="370" cy="40" r="3" class="fr sr"/><circle cx="383" cy="75" r="3" class="fb sb"/><circle cx="328" cy="58" r="3" class="fr sr"/><circle cx="301" cy="96" r="3" class="fr sr"/><circle cx="314" cy="82" r="3" class="fr sr"/><circle cx="431" cy="138" r="3" class="fb sb"/><circle cx="392" cy="101" r="3" class="fb sb"/><circle cx="414" cy="117" r="3" class="fb sb"/><circle cx="375" cy="44" r="3" class="fr sr"/><circle cx="500" cy="123" r="3" class="fb sb"/><circle cx="496" cy="124" r="3" class="fb sb"/><circle cx="454" cy="80" r="3" class="fr sr"/><circle cx="355" cy="45" r="3" class="fr sr"/><circle cx="460" cy="137" r="3" class="fb sb"/><circle cx="413" cy="42" r="3" class="fr sr"/><line x1="280" y1="25" x2="280" y2="150" stroke="currentColor" stroke-dasharray="3 3"/><text x="140" y="168" text-anchor="middle" class="tm">straight cut through both moons</text><text x="420" y="168" text-anchor="middle" class="tm">follows the shape</text></svg><figcaption>Same 300 moon points (40 drawn). KMeans can only draw a straight boundary between two centroids; DBSCAN chains dense neighbours together.</figcaption></figure>
  <p>KMeans assumes clusters are round, of similar size and spread, with features on the same scale. Why: it only compares distance to a centre, so the border between two clusters is always a straight line halfway between centres. Break any assumption and it fails quietly: you still get k neat labels.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN

Xm, ym = make_moons(n_samples=300, noise=0.06, random_state=0)
Xm = StandardScaler().fit_transform(Xm)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(Xm)
print("KMeans ARI", round(adjusted_rand_score(ym, km.labels_), 3),
      "silhouette", round(silhouette_score(Xm, km.labels_), 3))

# unequal sizes: 1000 wide points vs 50 tight points
Xa, ya = make_blobs(n_samples=[1000, 50], centers=[[0, 0], [4, 0]],
                    cluster_std=[1.5, 0.3], random_state=0)
l = KMeans(2, n_init=10, random_state=0).fit_predict(Xa)
print("unequal sizes:", np.bincount(l), "ARI", round(adjusted_rand_score(ya, l), 3))

# scale: groups differ only in age; income is huge-scale noise
rng = np.random.default_rng(0)
age = np.r_[rng.normal(25, 3, 200), rng.normal(55, 3, 200)]
income = rng.normal(60000, 15000, 400)
Xs, ys = np.c_[age, income], np.r_[np.zeros(200), np.ones(200)]
for name, Z in [("raw", Xs), ("scaled", StandardScaler().fit_transform(Xs))]:
    print(name, "ARI", round(adjusted_rand_score(ys, KMeans(2, n_init=10, random_state=0).fit_predict(Z)), 3))</div>
  <div class="fx" data-lang="text">KMeans ARI 0.47 silhouette 0.494
unequal sizes: [645 405] ARI 0.065
raw ARI -0.002
scaled ARI 1.0</div>
  <table class="tbl">
    <tr><th>Failure</th><th>What happens</th><th>Fix</th></tr>
    <tr><td>Non-spherical (moons, rings)</td><td>Straight cut through shapes</td><td>DBSCAN, HDBSCAN, single linkage, spectral</td></tr>
    <tr><td>Unequal size / spread</td><td>Big cluster split; boundary sits midway between centres</td><td>GMM, HDBSCAN</td></tr>
    <tr><td>Unscaled features</td><td>Largest-unit feature decides everything</td><td><code>StandardScaler</code> / <code>RobustScaler</code></td></tr>
    <tr><td>Outliers</td><td>Drag centroids; forced into clusters</td><td>Remove first, or DBSCAN (labels them −1)</td></tr>
    <tr><td>Categorical features</td><td>Mean of a category is meaningless</td><td>KModes / KPrototypes, Gower distance</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Moons with KMeans still scored silhouette 0.494, which looks "fine". Internal metrics reward round blobs, so they can't warn you here. Plot the data (or a 2D projection).</p>
  </div>

  <h2 id="mcu-db"><span class="num">05</span>DBSCAN</h2>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560">
<circle cx="140" cy="95" r="45" fill="none" class="sb" stroke-dasharray="4 3"/>
<line x1="140" y1="95" x2="185" y2="95" class="sb"/><text x="150" y="90" class="tb">eps</text>
<circle cx="140" cy="95" r="6" class="fb sb"/>
<circle cx="115" cy="75" r="6" class="fb sb"/><circle cx="160" cy="70" r="6" class="fb sb"/><circle cx="120" cy="118" r="6" class="fb sb"/><circle cx="162" cy="115" r="6" class="fb sb"/>
<circle cx="90" cy="100" r="6" class="fb sb"/><circle cx="95" cy="55" r="6" class="fb sb"/>
<circle cx="205" cy="105" r="6" class="ft st"/>
<circle cx="250" cy="30" r="6" class="fs" stroke="currentColor"/>
<circle cx="280" cy="160" r="6" class="fs" stroke="currentColor"/>
<line x1="212" y1="108" x2="240" y2="125" stroke="currentColor" opacity=".5"/><text x="243" y="132" class="tm">border</text>
<text x="262" y="34" class="tm">noise</text>
<text x="40" y="180" class="tm">blue = core: ≥ 4 points inside its eps circle</text>
<rect x="370" y="30" width="180" height="40" class="fb sb"/><text x="460" y="48" text-anchor="middle">Core</text><text x="460" y="63" text-anchor="middle" class="tm">≥ min_samples in eps</text>
<rect x="370" y="78" width="180" height="40" class="ft st"/><text x="460" y="96" text-anchor="middle">Border</text><text x="460" y="111" text-anchor="middle" class="tm">near a core, not dense</text>
<rect x="370" y="126" width="180" height="40" class="fs" stroke="currentColor"/><text x="460" y="144" text-anchor="middle">Noise</text><text x="460" y="159" text-anchor="middle" class="tm">near no core → −1</text>
</svg><figcaption>min_samples = 4. Clusters grow core-to-core; border points join but don't extend the cluster; noise is left out.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A photo of India at night from space. Mumbai and Delhi glow as dense patches; their suburbs attach to them; a lone village light belongs to no city. A city's shape follows the lights, not a circle drawn around a centre.</p>
  </div>
  <p>DBSCAN says: a cluster is a crowded area. It exists because KMeans can't handle odd shapes or outliers. How: for each point, count neighbours within a radius. Crowded points start a cluster and spread it to their crowded neighbours.</p>
  <ul>
    <li><strong>eps</strong>: neighbourhood radius. <strong>min_samples</strong>: points within eps (counting itself) to be a core.</li>
    <li>No k needed, any shape, outliers labelled <code>-1</code>.</li>
    <li>Choose eps from the <strong>k-distance plot</strong>: sort each point's distance to its k-th neighbour (k = min_samples), pick the knee.</li>
  </ul>
  <div class="fx" data-lang="py">from sklearn.neighbors import NearestNeighbors
d, _ = NearestNeighbors(n_neighbors=5).fit(Xm).kneighbors(Xm)
print("5th-NN distance percentiles 50/90/95/99:", np.percentile(np.sort(d[:, -1]), [50, 90, 95, 99]).round(3))

for eps in (0.1, 0.3, 0.6):
    l = DBSCAN(eps=eps, min_samples=5).fit_predict(Xm)
    print(f"eps={eps} clusters={len(set(l)) - (-1 in l)} noise={(l == -1).sum()} "
          f"ARI={adjusted_rand_score(ym, l):.3f}")</div>
  <div class="fx" data-lang="text">5th-NN distance percentiles 50/90/95/99: [0.119 0.17  0.195 0.279]
eps=0.1 clusters=20 noise=161 ARI=0.024
eps=0.3 clusters=2 noise=1 ARI=0.993
eps=0.6 clusters=1 noise=0 ARI=0.000</div>
  <p>The knee sits near the 99th percentile (0.28), so eps 0.3 works. Too small shatters into noise; too large bridges the moons. At eps 0.3: 297 core, 2 border, 1 noise.</p>
  <h3>Mixed densities: HDBSCAN</h3>
  <div class="fx" data-lang="py">from sklearn.cluster import HDBSCAN
Xv, yv = make_blobs(n_samples=[300, 300], centers=[[0, 0], [6, 0]],
                    cluster_std=[0.3, 1.5], random_state=1)        # tight + loose
for eps in (0.2, 0.5, 1.0):
    l = DBSCAN(eps=eps, min_samples=5).fit_predict(Xv)
    print(f"DBSCAN eps={eps} clusters={len(set(l)) - (-1 in l)} ARI={adjusted_rand_score(yv, l):.3f}")
l = HDBSCAN(min_cluster_size=20).fit_predict(Xv)
print(f"HDBSCAN clusters={len(set(l)) - (-1 in l)} noise={(l == -1).sum()} ARI={adjusted_rand_score(yv, l):.3f}")</div>
  <div class="fx" data-lang="text">DBSCAN eps=0.2 clusters=9 ARI=0.789
DBSCAN eps=0.5 clusters=6 ARI=0.801
DBSCAN eps=1.0 clusters=1 ARI=0.001
HDBSCAN clusters=2 noise=32 ARI=0.892</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One eps can't fit a tight and a loose cluster: small eps shatters the loose one, large eps merges both. HDBSCAN tries all densities and keeps the most stable clusters; only <code>min_cluster_size</code> to set.</p>
  </div>
  <p>For pure anomaly detection, Isolation Forest or LOF usually beat DBSCAN's noise label.</p>

  <h2 id="mcu-hc"><span class="num">06</span>Hierarchical Clustering</h2>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<line x1="30" y1="170" x2="320" y2="170" stroke="currentColor" opacity=".4"/>
<path d="M60,170 V163 H100 V170" fill="none" class="sb" stroke-width="2"/>
<path d="M160,170 V161 H200 V170" fill="none" class="st" stroke-width="2"/>
<path d="M260,170 V157 H300 V170" fill="none" class="sg" stroke-width="2"/>
<path d="M180,161 V73 H280 V157" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M80,163 V35 H230 V73" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="30" y1="131" x2="370" y2="131" class="sr" stroke-dasharray="6 4" stroke-width="2"/>
<text x="300" y="124" class="tr">cut → k=3</text>
<g text-anchor="middle"><text x="60" y="186">A</text><text x="100" y="186">B</text><text x="160" y="186">C</text><text x="200" y="186">D</text><text x="260" y="186">E</text><text x="300" y="186">F</text></g>
<text x="236" y="68" class="tm">7.45</text><text x="236" y="30" class="tm">10.37</text>
<text x="390" y="40" class="tm">height = merge cost</text>
<text x="390" y="58" class="tm">long gap = real split</text>
<text x="390" y="90">{A,B} {C,D} {E,F}</text>
<text x="390" y="108" class="tm">pairs: .54 .67 1.02</text>
</svg><figcaption>Real Ward linkage on 6 points (3 tight pairs). Draw a horizontal line; the number of vertical lines it crosses is k.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Agglomerative</strong> clustering: start with every point as its own cluster, then keep merging the two closest clusters until one is left. The <strong>dendrogram</strong> is the tree of merges, with the height of each merge. You choose k afterwards by cutting the tree.</p>
  </div>
  <p>Use it when you don't know k, or you want nested groups (species → genus → family).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A family tree read upwards. Siblings join first, then cousins, then the whole khandaan. Cut at "cousins" and you get a few big family branches.</p>
  </div>
  <div class="fx" data-lang="py">from scipy.cluster.hierarchy import linkage, fcluster
P = np.array([[1, 1], [1.5, 1.2], [5, 5], [5.6, 5.3], [9, 1], [9.2, 2]])   # A..F
Z = linkage(P, method="ward")
for a, b, h, n in Z: print(f"merge {int(a)} + {int(b)}  height={h:.2f}  size={int(n)}")
print("cut k=3:", fcluster(Z, 3, criterion="maxclust"))</div>
  <div class="fx" data-lang="text">merge 0 + 1  height=0.54  size=2
merge 2 + 3  height=0.67  size=2
merge 4 + 5  height=1.02  size=2
merge 7 + 8  height=7.45  size=4
merge 6 + 9  height=10.37  size=6
cut k=3: [1 1 2 2 3 3]</div>
  <p>Ids ≥ 6 are new clusters: 6 = {A,B}, 7 = {C,D}, 8 = {E,F}, 9 = {C,D,E,F}.</p>
  <table class="tbl">
    <tr><th>Linkage</th><th>Cluster distance</th><th>Behaviour</th><th>Moons ARI</th></tr>
    <tr><td><strong>single</strong></td><td>Closest pair of points</td><td>Follows chains and shapes; one noisy bridge merges clusters</td><td>1.000</td></tr>
    <tr><td><strong>complete</strong></td><td>Farthest pair</td><td>Compact, similar-diameter clusters</td><td>0.618</td></tr>
    <tr><td><strong>average</strong></td><td>Mean of all pairs</td><td>In between</td><td>0.546</td></tr>
    <tr><td><strong>ward</strong></td><td>Increase in within-cluster variance</td><td>Round, even-sized (like KMeans); sklearn default</td><td>0.209</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>O(n²) memory for the distance matrix: fine for thousands, not millions. Merges are greedy and never undone.</p>
  </div>

  <h2 id="mcu-which"><span class="num">07</span>Which to Use</h2>
  <table class="tbl">
    <tr><th></th><th>KMeans</th><th>DBSCAN / HDBSCAN</th><th>Hierarchical</th><th>GMM</th></tr>
    <tr><td>Need k?</td><td>Yes</td><td>No (eps / min_cluster_size)</td><td>No, cut later</td><td>Yes</td></tr>
    <tr><td>Shapes</td><td>Round</td><td>Any</td><td>Depends on linkage</td><td>Ellipses</td></tr>
    <tr><td>Outliers</td><td>Forced in, drag centres</td><td>Labelled −1</td><td>Forced in</td><td>Low probability</td></tr>
    <tr><td>Scale (n)</td><td>Millions</td><td>~100k+ with index</td><td>~10k</td><td>~100k</td></tr>
    <tr><td>New points</td><td><code>predict</code></td><td>No predict (HDBSCAN: approximate)</td><td>No</td><td><code>predict_proba</code></td></tr>
    <tr><td>Pick when</td><td>Fast baseline, segmentation</td><td>Spatial / odd shapes, anomalies</td><td>Small n, want a taxonomy</td><td>Soft membership</td></tr>
  </table>
  <div class="flow"><span>Scale features</span><span>Reduce dims if &gt; ~20</span><span>KMeans baseline</span><span>Plot / silhouette</span><span>Shapes odd? DBSCAN / HDBSCAN</span><span>Profile clusters</span></div>

  <h2 id="mcu-build"><span class="num">08</span>Hands-on</h2>
  <p>Make segments, then describe each one with its average values. The business team reads this profile table, not the silhouette score.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.pipeline import make_pipeline
rng = np.random.default_rng(0)
df = pd.DataFrame({"age": np.r_[rng.normal(25, 3, 200), rng.normal(55, 3, 200)],
                   "income": rng.normal(60000, 15000, 400),
                   "visits": np.r_[rng.poisson(12, 200), rng.poisson(3, 200)]})
pipe = make_pipeline(StandardScaler(), KMeans(n_clusters=2, n_init=10, random_state=0))
df["segment"] = pipe.fit_predict(df)
print(df.groupby("segment").agg(n=("age", "size"), age=("age", "mean"),
                                income=("income", "mean"), visits=("visits", "mean")).round(1))</div>
  <div class="fx" data-lang="text">           n   age   income  visits
segment                            
0        200  54.7  59449.9     2.7
1        200  25.0  60076.5    12.0</div>
  <p>Try: add an outlier row (age 200) and watch a centroid move; swap in <code>HDBSCAN</code> and count the −1 labels.</p>

  <h2 id="mcu-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through KMeans. Is it guaranteed to find the best clustering?</summary><div class="qa-body">Initialise k centroids (k-means++), assign every point to its nearest centroid, move each centroid to the mean of its points, repeat until assignments stop changing. It always converges because neither step increases inertia, but only to a local minimum. Run several initialisations (<code>n_init</code>) and keep the lowest inertia.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you scale before KMeans or DBSCAN?</summary><div class="qa-body">Both use Euclidean distance, so the feature with the largest units dominates. In the age/income example, raw data gave ARI −0.002 (income noise decided everything); after StandardScaler, ARI 1.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Elbow vs silhouette: which do you trust?</summary><div class="qa-body">Elbow plots inertia, which always decreases with k, so you eyeball a bend that may not exist. Silhouette (b − a) / max(a, b) has a genuine maximum (0.791 at k=4 on the blobs). Use both, then check the clusters make business sense. Neither works for non-convex shapes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A point has a = 2 (mean distance to its own cluster) and b = 5 (to the nearest other). Silhouette?</summary><div class="qa-body">(5 − 2) / max(2, 5) = 0.6. Well placed. If a = 5 and b = 2 it would be −0.6: closer to another cluster, probably mislabelled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List KMeans' assumptions and what breaks each.</summary><div class="qa-body">Round clusters (moons: ARI 0.47), similar sizes and spreads (1000 vs 50 points: the big cluster gets split, ARI 0.07), comparable feature scales, no outliers, numeric features. It never says "I don't fit": it always returns k labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>KMeans vs DBSCAN: when do you choose each?</summary><div class="qa-body">KMeans: large data, roughly spherical clusters, k known or tunable, need to assign new points. DBSCAN: arbitrary shapes, unknown k, want outliers labelled −1. DBSCAN struggles with mixed densities (use HDBSCAN) and in high dimensions (reduce first).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define core, border and noise points in DBSCAN.</summary><div class="qa-body">Core: at least min_samples points (including itself) within eps. Border: within eps of a core but not dense itself; joins that cluster but doesn't extend it. Noise: within eps of no core point; label −1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you pick eps?</summary><div class="qa-body">k-distance plot: for each point, distance to its k-th nearest neighbour (k = min_samples), sorted ascending; eps at the knee where it shoots up. Start with min_samples ≈ 2 × dimensions. On the moons the knee was ~0.28 and eps 0.3 gave ARI 0.993.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does linkage mean in hierarchical clustering, and which would you use for the moons?</summary><div class="qa-body">How distance between two clusters is defined: single (closest pair), complete (farthest), average, ward (variance increase). Single linkage follows chains, so it got ARI 1.0 on clean moons; ward behaves like KMeans (0.21). Single is fragile: one noisy bridge merges clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a dendrogram to choose k?</summary><div class="qa-body">Height = distance at which clusters merged. Cut horizontally through the longest vertical stretch with no merges; the number of lines you cross is k. In the 6-point example merges jump from 1.02 to 7.45, so cutting between gives 3 clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your segmentation has a silhouette of 0.7 but marketing says it's useless. How?</summary><div class="qa-body">Silhouette measures geometry, not usefulness. The split may be driven by a feature that doesn't matter for behaviour (e.g. region), or the segments may buy the same things. Profile each cluster, choose features tied to the decision, and validate with an outcome (response rate per segment).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Clustering 300-dimensional embeddings with KMeans gives poor results. Why, and what do you do?</summary><div class="qa-body">In high dimensions distances concentrate (nearest and farthest neighbours look alike), so "nearest centroid" is noisy. Reduce with PCA (e.g. to 50) or UMAP first, use cosine distance (normalise vectors, then KMeans), or HDBSCAN on a UMAP embedding.</div></details>
</main>`
});
