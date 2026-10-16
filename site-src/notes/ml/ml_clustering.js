// ml/ml_clustering.js — Clustering
Object.assign(TOPIC_CONTENT, {
  "ml_clustering": `<main>
  <h1>Clustering</h1>
  <p class="lead">Clustering puts similar rows into groups when you have no labels. Shops use it to find customer types, news apps to group stories, banks to spot odd transactions. This page covers KMeans, choosing k, DBSCAN and hierarchical clustering, each started from a tiny example you can check by hand and then run on real synthetic data. The only thing you need first is the idea of distance between two points.</p>

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
  <p>A new class teacher gets 40 students and no information about them. After a week of watching who sits with whom and who talks to whom, she can name the friend groups. Nobody handed her a list; she found the groups from behaviour.</p>
  <p>Every ML model so far had an answer column: "churned or not", "price". <strong>Clustering</strong> is for tables with no answer column. You have 10 lakh Flipkart customers with age, city, visits per month, average order value, and nobody has labelled their "type". Clustering puts similar rows together into groups, and you then look at each group and give it a name: "weekend bargain hunters", "monthly big spenders". Learning without an answer column is called <strong>unsupervised</strong> learning.</p>
  <p>Why do companies need it? Marketing wants a few segments to design offers for. A news app wants to group similar stories. A bank wants to know which transactions sit far from every group (suspicious). In interviews, clustering questions test whether you know what "similar" means in numbers, and what can go wrong.</p>
  <div class="flow"><span>Unlabeled rows</span><span>Scale features</span><span>Measure distance</span><span>Group similar rows</span><span>Name each group</span></div>
  <p>"Similar" is always a <strong>distance</strong>: treat each row as a point (age on one axis, income on another) and measure how far apart two points are. Small distance means similar. Everything on this page is built on that one idea, which is why the step "scale features" sits before everything else; section 04 shows what happens if you skip it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The teacher finding friend groups by watching behaviour, with no list given to her. The algorithm watches distances instead of conversations.</p>
  </div>
  <p>There are four main ways to define "a group". Each has one algorithm you should know:</p>
  <div class="cards">
    <div><b>Centroid</b><p>A group is a centre point plus everything nearest to it.</p><small>KMeans (section 02)</small></div>
    <div><b>Density</b><p>A group is a crowded region; lonely points are noise.</p><small>DBSCAN, HDBSCAN (section 05)</small></div>
    <div><b>Hierarchy</b><p>Groups inside groups, like a family tree; cut at any level.</p><small>Agglomerative (section 06)</small></div>
    <div><b>Distribution</b><p>Each group is a bell-shaped cloud; points belong partly to several.</p><small>GMM (Gaussian mixture)</small></div>
  </div>

  <h2 id="mcu-km"><span class="num">02</span>KMeans</h2>
  <p>Six people with ages 18, 20, 22, 40, 44, 48. By eye there are two groups. KMeans finds them like this: put two centre points somewhere, give every person to the nearer centre, then move each centre to the average age of its people. Repeat until nobody switches. Here is that loop run by hand in code, starting from a deliberately bad pair of centres (18 and 22, both in the young group):</p>
  <div class="fx" data-lang="py">import numpy as np
ages = np.array([18, 20, 22, 40, 44, 48])
c = np.array([18.0, 22.0])                    # two starting centres (bad start on purpose)
for step in range(1, 4):
    group = np.abs(ages[:, None] - c).argmin(1)          # each person -&gt; nearest centre (0 or 1)
    c = np.array([ages[group == k].mean() for k in range(2)])   # centre -&gt; mean age of its people
    print(f"round {step}: groups {group}  new centres {c.round(1)}")</div>
  <div class="fx" data-lang="text">round 1: groups [0 0 1 1 1 1]  new centres [19.  38.5]
round 2: groups [0 0 0 1 1 1]  new centres [20. 44.]
round 3: groups [0 0 0 1 1 1]  new centres [20. 44.]</div>
  <p>Round 1: the 22-year-old is nearer to centre 22 than to 18, so he joins the "old" group with 40, 44, 48, and that centre moves to 38.5. Round 2: now 22 is nearer to 19 than to 38.5, so he switches; centres become 20 and 44. Round 3: nothing changes, so the loop stops. Two rounds was enough even from a bad start.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<line x1="40" y1="40" x2="540" y2="40" stroke="currentColor" opacity=".4"/><line x1="40" y1="85" x2="540" y2="85" stroke="currentColor" opacity=".4"/><line x1="40" y1="130" x2="540" y2="130" stroke="currentColor" opacity=".4"/>
<text x="4" y="44" class="tm" font-size="11">start</text><text x="4" y="89" class="tm" font-size="11">round 1</text><text x="4" y="134" class="tm" font-size="11">round 2</text>
<g font-size="11" class="tm"><text x="100" y="24" text-anchor="middle">18</text><text x="130" y="24" text-anchor="middle">20</text><text x="160" y="24" text-anchor="middle">22</text><text x="430" y="24" text-anchor="middle">40</text><text x="490" y="24" text-anchor="middle">44</text><text x="550" y="24" text-anchor="middle">48</text></g>
<g><circle cx="100" cy="40" r="5" class="fs" stroke="currentColor"/><circle cx="130" cy="40" r="5" class="fs" stroke="currentColor"/><circle cx="160" cy="40" r="5" class="fs" stroke="currentColor"/><circle cx="430" cy="40" r="5" class="fs" stroke="currentColor"/><circle cx="490" cy="40" r="5" class="fs" stroke="currentColor"/><circle cx="550" cy="40" r="5" class="fs" stroke="currentColor"/>
<rect x="94" y="48" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="154" y="48" width="12" height="12" class="fr sr" stroke-width="2"/></g>
<g><circle cx="100" cy="85" r="5" class="fb sb"/><circle cx="130" cy="85" r="5" class="fb sb"/><circle cx="160" cy="85" r="5" class="fr sr"/><circle cx="430" cy="85" r="5" class="fr sr"/><circle cx="490" cy="85" r="5" class="fr sr"/><circle cx="550" cy="85" r="5" class="fr sr"/>
<rect x="109" y="93" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="401" y="93" width="12" height="12" class="fr sr" stroke-width="2"/><text x="415" y="113" class="tm" font-size="10">38.5</text></g>
<g><circle cx="100" cy="130" r="5" class="fb sb"/><circle cx="130" cy="130" r="5" class="fb sb"/><circle cx="160" cy="130" r="5" class="fb sb"/><circle cx="430" cy="130" r="5" class="fr sr"/><circle cx="490" cy="130" r="5" class="fr sr"/><circle cx="550" cy="130" r="5" class="fr sr"/>
<rect x="124" y="138" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="484" y="138" width="12" height="12" class="fr sr" stroke-width="2"/></g>
</svg><figcaption>The six ages on a line. Squares are the centres. Watch the 22-year-old: red in round 1, blue in round 2, when the red centre has moved away to 38.5 and then 44.</figcaption></figure>
  <p>That loop, with any number of columns and any k, is <strong>KMeans</strong>. "k" is the number of groups you ask for; "means" because each centre is the mean (average) of its points. The loop has a name too, Lloyd's algorithm:</p>
  <div class="flow"><span>Place k centres</span><span>Each point joins its nearest centre</span><span>Each centre moves to the mean of its points</span><span>Repeat until nobody switches</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>k kirana shops open in a new colony. Every family buys from the nearest shop. Each shopkeeper then shifts his shop to the middle of his customers. Families switch to whichever shop is now closest. After a few rounds nobody switches.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><defs><marker id="mcu-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs><text x="90" y="18" text-anchor="middle">1. Random centroids</text><rect x="5" y="25" width="170" height="135" fill="none" stroke="currentColor" opacity=".3"/><circle cx="30" cy="133" r="4" class="fs"/><circle cx="40" cy="116" r="4" class="fs"/><circle cx="50" cy="129" r="4" class="fs"/><circle cx="56" cy="112" r="4" class="fs"/><circle cx="130" cy="64" r="4" class="fs"/><circle cx="140" cy="47" r="4" class="fs"/><circle cx="150" cy="61" r="4" class="fs"/><circle cx="158" cy="42" r="4" class="fs"/><circle cx="126" cy="44" r="4" class="fs"/><circle cx="34" cy="107" r="4" class="fs"/><rect x="34" y="118" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="54" y="103" width="12" height="12" class="fr sr" stroke-width="2"/><text x="280" y="18" text-anchor="middle">2. Assign to nearest</text><rect x="195" y="25" width="170" height="135" fill="none" stroke="currentColor" opacity=".3"/><circle cx="220" cy="133" r="4" class="fb sb"/><circle cx="230" cy="116" r="4" class="fb sb"/><circle cx="240" cy="129" r="4" class="fb sb"/><circle cx="246" cy="112" r="4" class="fr sr"/><circle cx="320" cy="64" r="4" class="fr sr"/><circle cx="330" cy="47" r="4" class="fr sr"/><circle cx="340" cy="61" r="4" class="fr sr"/><circle cx="348" cy="42" r="4" class="fr sr"/><circle cx="316" cy="44" r="4" class="fr sr"/><circle cx="224" cy="107" r="4" class="fb sb"/><rect x="224" y="118" width="12" height="12" class="fb sb" stroke-width="2"/><rect x="244" y="103" width="12" height="12" class="fr sr" stroke-width="2"/><text x="470" y="18" text-anchor="middle">3. Move to the mean</text><rect x="385" y="25" width="170" height="135" fill="none" stroke="currentColor" opacity=".3"/><circle cx="410" cy="133" r="4" class="fb sb"/><circle cx="420" cy="116" r="4" class="fb sb"/><circle cx="430" cy="129" r="4" class="fb sb"/><circle cx="436" cy="112" r="4" class="fr sr"/><circle cx="510" cy="64" r="4" class="fr sr"/><circle cx="520" cy="47" r="4" class="fr sr"/><circle cx="530" cy="61" r="4" class="fr sr"/><circle cx="538" cy="42" r="4" class="fr sr"/><circle cx="506" cy="44" r="4" class="fr sr"/><circle cx="414" cy="107" r="4" class="fb sb"/><line x1="420" y1="124" x2="418" y2="121" stroke="currentColor" stroke-dasharray="3 2" marker-end="url(#mcu-ar)"/><rect x="412" y="115" width="12" height="12" class="fb sb" stroke-width="2"/><line x1="440" y1="109" x2="507" y2="62" stroke="currentColor" stroke-dasharray="3 2" marker-end="url(#mcu-ar)"/><rect x="501" y="56" width="12" height="12" class="fr sr" stroke-width="2"/><text x="280" y="182" text-anchor="middle" class="tm">repeat 2 → 3 until no point changes colour (here: one more round)</text></svg><figcaption>Squares = centroids. Both start in the left group; after one update red jumps to the right group, and the next assignment is final.</figcaption></figure>
  <p>The same loop in two dimensions. Both centres start inside the left blob; after one update the red one jumps to the right blob, and the next assignment is final.</p>
  <p>What is KMeans actually trying to make small? The total of (distance from each point to its own centre)². That total is called <strong>inertia</strong>, or WCSS (within-cluster sum of squares). Tight groups give low inertia. Three facts to remember:</p>
  <ul>
    <li><strong>It always finishes.</strong> Neither step can make inertia go up, so the loop cannot run forever. But it can settle in a poor arrangement (a <em>local</em> minimum): with a bad start, two centres may end up sharing one blob while another blob gets none.</li>
    <li><strong>Fix for bad starts:</strong> <strong>k-means++</strong> picks starting centres that are spread apart, and <code>n_init=10</code> runs the whole thing 10 times from different starts and keeps the lowest inertia. Both are sklearn defaults or one argument away.</li>
    <li><strong>It is fast.</strong> Each round costs about n × k × d operations (rows × groups × columns), so it handles millions of rows. For really huge data use <code>MiniBatchKMeans</code>, which updates centres from small random batches.</li>
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
  <p><code>make_blobs</code> makes 500 points in 4 round clouds and also tells us the true cloud of each point (<code>y</code>), which real data never does. All four groups came out with exactly 125 points, in just 2 rounds. <strong>ARI</strong> (adjusted Rand index) compares the found groups with the true labels: 1 = perfect match, about 0 = no better than random guessing. It is only usable when you happen to have labels, which is why it appears on this page (to check the algorithms) and rarely in real work.</p>
  <div class="callout intu"><span class="label">Formal term</span>
    <p><strong>Inertia = Σ ‖x − μₖ‖²</strong>: for every point x, take the straight-line distance to the centre μₖ (mu) of its own cluster k, square it, add them all up. KMeans is the loop that keeps lowering this number.</p>
  </div>

  <h2 id="mcu-k"><span class="num">03</span>Choosing k</h2>
  <p>KMeans needs k before it starts, and with no labels nobody tells you k. Ask for 2 groups and you get 2; ask for 7 and you get 7, every time, with no complaint. So you run it for several k values and score each result. Two common scores:</p>
  <ul>
    <li><strong>Elbow (inertia)</strong>: inertia always falls as k grows (more centres, everyone is nearer to one). Plot it and look for the bend, where adding one more group stops helping much.</li>
    <li><strong>Silhouette</strong>: for each point, compare a = average distance to its own group and b = average distance to the nearest other group. If the point sits deep in its own group, a is small and b is large. The score is (b − a) / max(a, b): +1 is perfect, 0 means it sits on a border, negative means it is probably in the wrong group. Average over all points.</li>
  </ul>
  <p>Worked example of silhouette for one point: a = 2, b = 5 → (5 − 2) / 5 = 0.6, well placed. If a = 5 and b = 2 → (2 − 5) / 5 = −0.6, closer to another group than to its own.</p>
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
  <p>Inertia drops a lot until k = 4 (15737 → 3426 → 949), then only a little (856, 769). Silhouette rises to 0.791 at k = 4 and falls after. Both say 4, which is the truth here.</p>
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
  <p>Left: the elbow bends at 4. Right: the silhouette has a clear peak at 4. In real data the elbow is often not this sharp, so lean on silhouette and on the business check below.</p>
  <table class="tbl">
    <tr><th>Method</th><th>How</th><th>Read it</th></tr>
    <tr><td><strong>Elbow</strong></td><td>Plot inertia vs k</td><td>Pick the bend. Inertia hits 0 at k = n, so never pick the minimum. Often no clear bend.</td></tr>
    <tr><td><strong>Silhouette</strong></td><td>Per point s = (b − a) / max(a, b); average</td><td>a = mean distance to own cluster, b = to the nearest other. Higher is better (max 1). Example: a = 2, b = 5 → (5 − 2)/5 = 0.6.</td></tr>
    <tr><td><strong>Davies–Bouldin</strong></td><td>Mean ratio of cluster scatter to separation</td><td>Lower is better. 0.294 here at k=4.</td></tr>
    <tr><td><strong>Business check</strong></td><td>Profile each cluster's feature means</td><td>Do segments behave differently? If not, k is wrong or features are.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high silhouette means the groups are far apart in the numbers, not that they are useful. Two segments that buy the same things at the same rate are one segment for the business. Always profile each cluster (section 08) before calling k "right".</p>
  </div>

  <h2 id="mcu-fail"><span class="num">04</span>When KMeans Fails</h2>
  <p>KMeans only ever compares "distance to a centre". That one fact creates all its weaknesses. The border between two groups is always a straight line exactly halfway between the two centres. So KMeans quietly assumes groups are round blobs of similar size and spread, measured in columns with similar units. Break any of these and it still returns k neat labels, with no warning.</p>
  <h3>Shape</h3>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560"><text x="140" y="18" text-anchor="middle">KMeans k=2 — ARI 0.47</text><text x="420" y="18" text-anchor="middle">DBSCAN eps=0.3 — ARI 0.99</text><circle cx="117" cy="39" r="3" class="fr sr"/><circle cx="22" cy="96" r="3" class="fr sr"/><circle cx="69" cy="43" r="3" class="fr sr"/><circle cx="173" cy="93" r="3" class="fb sb"/><circle cx="100" cy="103" r="3" class="fb sb"/><circle cx="110" cy="47" r="3" class="fr sr"/><circle cx="113" cy="120" r="3" class="fb sb"/><circle cx="49" cy="49" r="3" class="fr sr"/><circle cx="142" cy="126" r="3" class="fb sb"/><circle cx="93" cy="69" r="3" class="fr sr"/><circle cx="32" cy="68" r="3" class="fr sr"/><circle cx="40" cy="51" r="3" class="fr sr"/><circle cx="105" cy="118" r="3" class="fb sb"/><circle cx="141" cy="59" r="3" class="fr sr"/><circle cx="30" cy="73" r="3" class="fr sr"/><circle cx="90" cy="73" r="3" class="fr sr"/><circle cx="20" cy="85" r="3" class="fr sr"/><circle cx="237" cy="68" r="3" class="fb sb"/><circle cx="181" cy="131" r="3" class="fb sb"/><circle cx="12" cy="94" r="3" class="fr sr"/><circle cx="170" cy="103" r="3" class="fb sb"/><circle cx="141" cy="59" r="3" class="fr sr"/><circle cx="160" cy="91" r="3" class="fb sb"/><circle cx="157" cy="77" r="3" class="fb sb"/><circle cx="240" cy="70" r="3" class="fb sb"/><circle cx="80" cy="40" r="3" class="fr sr"/><circle cx="93" cy="75" r="3" class="fr sr"/><circle cx="38" cy="58" r="3" class="fr sr"/><circle cx="11" cy="96" r="3" class="fr sr"/><circle cx="24" cy="82" r="3" class="fr sr"/><circle cx="141" cy="138" r="3" class="fb sb"/><circle cx="102" cy="101" r="3" class="fb sb"/><circle cx="124" cy="117" r="3" class="fb sb"/><circle cx="85" cy="44" r="3" class="fr sr"/><circle cx="210" cy="123" r="3" class="fb sb"/><circle cx="206" cy="124" r="3" class="fb sb"/><circle cx="164" cy="80" r="3" class="fb sb"/><circle cx="65" cy="45" r="3" class="fr sr"/><circle cx="170" cy="137" r="3" class="fb sb"/><circle cx="123" cy="42" r="3" class="fr sr"/><circle cx="407" cy="39" r="3" class="fr sr"/><circle cx="312" cy="96" r="3" class="fr sr"/><circle cx="359" cy="43" r="3" class="fr sr"/><circle cx="463" cy="93" r="3" class="fr sr"/><circle cx="390" cy="103" r="3" class="fb sb"/><circle cx="400" cy="47" r="3" class="fr sr"/><circle cx="403" cy="120" r="3" class="fb sb"/><circle cx="339" cy="49" r="3" class="fr sr"/><circle cx="432" cy="126" r="3" class="fb sb"/><circle cx="383" cy="69" r="3" class="fb sb"/><circle cx="322" cy="68" r="3" class="fr sr"/><circle cx="330" cy="51" r="3" class="fr sr"/><circle cx="395" cy="118" r="3" class="fb sb"/><circle cx="431" cy="59" r="3" class="fr sr"/><circle cx="320" cy="73" r="3" class="fr sr"/><circle cx="380" cy="73" r="3" class="fb sb"/><circle cx="310" cy="85" r="3" class="fr sr"/><circle cx="527" cy="68" r="3" class="fb sb"/><circle cx="471" cy="131" r="3" class="fb sb"/><circle cx="302" cy="94" r="3" class="fr sr"/><circle cx="460" cy="103" r="3" class="fr sr"/><circle cx="431" cy="59" r="3" class="fr sr"/><circle cx="450" cy="91" r="3" class="fr sr"/><circle cx="447" cy="77" r="3" class="fr sr"/><circle cx="530" cy="70" r="3" class="fb sb"/><circle cx="370" cy="40" r="3" class="fr sr"/><circle cx="383" cy="75" r="3" class="fb sb"/><circle cx="328" cy="58" r="3" class="fr sr"/><circle cx="301" cy="96" r="3" class="fr sr"/><circle cx="314" cy="82" r="3" class="fr sr"/><circle cx="431" cy="138" r="3" class="fb sb"/><circle cx="392" cy="101" r="3" class="fb sb"/><circle cx="414" cy="117" r="3" class="fb sb"/><circle cx="375" cy="44" r="3" class="fr sr"/><circle cx="500" cy="123" r="3" class="fb sb"/><circle cx="496" cy="124" r="3" class="fb sb"/><circle cx="454" cy="80" r="3" class="fr sr"/><circle cx="355" cy="45" r="3" class="fr sr"/><circle cx="460" cy="137" r="3" class="fb sb"/><circle cx="413" cy="42" r="3" class="fr sr"/><line x1="280" y1="25" x2="280" y2="150" stroke="currentColor" stroke-dasharray="3 3"/><text x="140" y="168" text-anchor="middle" class="tm">straight cut through both moons</text><text x="420" y="168" text-anchor="middle" class="tm">follows the shape</text></svg><figcaption>Same 300 moon points (40 drawn). KMeans can only draw a straight boundary between two centroids; DBSCAN chains dense neighbours together.</figcaption></figure>
  <p>The two moons are obvious to the eye. KMeans cuts straight across both (left), because a straight cut is the only border it can draw. DBSCAN (right, section 05) follows the shape, because it links neighbours to neighbours.</p>
  <h3>Scale</h3>
  <p>The quiet failure that catches everyone. Three customers, with age in years and income in rupees per month:</p>
  <div class="fx" data-lang="py">#               age  income (Rs/month)
A = np.array([25, 50000]); B = np.array([60, 50500]); C = np.array([26, 58000])
print("raw    A-B", round(np.linalg.norm(A - B)), " A-C", round(np.linalg.norm(A - C)))
sd = np.array([15, 15000])                                # typical spread of each column
print("scaled A-B", round(np.linalg.norm((A - B) / sd), 2), " A-C", round(np.linalg.norm((A - C) / sd), 2))</div>
  <div class="fx" data-lang="text">raw    A-B 501  A-C 8000
scaled A-B 2.33  A-C 0.54</div>
  <p>On raw numbers A (25 years) and B (60 years) look close (distance 501) because their incomes differ by only 500, and the 35-year age gap is tiny next to that. A and C, both mid-twenties, look far apart (8000) because of an income gap. Income decided everything; age was ignored. Dividing each column by its typical spread (that is what <code>StandardScaler</code> does) flips it: now A and C are the close pair. Always scale before any distance-based method.</p>
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
  <p>Three failures, with numbers. Moons: ARI 0.47, and the silhouette still looks healthy. Unequal groups (1,000 loose points vs 50 tight ones): the big group gets split in two and the small one swallowed, ARI 0.065. Unscaled age + income: ARI −0.002, meaning the groups had nothing to do with age; after scaling, ARI 1.0.</p>
  <table class="tbl">
    <tr><th>Failure</th><th>What happens</th><th>Fix</th></tr>
    <tr><td>Non-spherical (moons, rings)</td><td>Straight cut through shapes</td><td>DBSCAN, HDBSCAN, single linkage, spectral</td></tr>
    <tr><td>Unequal size / spread</td><td>Big cluster split; boundary sits midway between centres</td><td>GMM, HDBSCAN</td></tr>
    <tr><td>Unscaled features</td><td>Largest-unit feature decides everything</td><td><code>StandardScaler</code> / <code>RobustScaler</code></td></tr>
    <tr><td>Outliers</td><td>Drag centroids; forced into clusters</td><td>Remove first, or DBSCAN (labels them −1)</td></tr>
    <tr><td>Categorical features</td><td>Mean of a category is meaningless</td><td>KModes / KPrototypes, Gower distance</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Moons with KMeans still scored silhouette 0.494, which looks "fine". The internal scores reward round blobs, so they cannot warn you about shape. Plot the data (or a 2D projection from the Dimensionality Reduction note) before trusting any score.</p>
  </div>

  <h2 id="mcu-db"><span class="num">05</span>DBSCAN</h2>
  <p>A photo of India at night from space. Mumbai and Delhi are bright patches. Their suburbs glow a little and attach to them. A lone village light in between belongs to no city. Nobody drew circles around a centre: a city is simply where the lights are packed close.</p>
  <p>That is <strong>DBSCAN</strong>'s definition of a cluster: a region where points are crowded. It exists because KMeans cannot handle odd shapes or outliers, and because it needs k. DBSCAN needs no k, follows any shape, and labels lonely points as noise instead of forcing them into a group. It needs two settings:</p>
  <ul>
    <li><strong>eps</strong> — a radius. Two points are neighbours if they are within eps of each other.</li>
    <li><strong>min_samples</strong> — how many neighbours (counting itself) a point needs within eps to count as "crowded".</li>
  </ul>
  <p>Tiny example on a line, eps = 0.3 and min_samples = 3:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import DBSCAN
pts = np.array([1.0, 1.2, 1.4, 1.6, 5.0, 5.2, 5.4, 9.0])[:, None]
print(DBSCAN(eps=0.3, min_samples=3).fit_predict(pts))</div>
  <div class="fx" data-lang="text">[ 0  0  0  0  1  1  1 -1]</div>
  <p>1.0 to 1.6 are each within 0.3 of a neighbour, so they chain into cluster 0. 5.0 to 5.4 form cluster 1. The point at 9.0 has nobody within 0.3, so it gets label −1: noise. Nobody told DBSCAN there were two groups.</p>
  <p>Every point ends up as one of three kinds:</p>
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
  <p>Blue points have at least min_samples (4 here) neighbours inside their circle: they are <strong>core</strong> points, and the cluster grows from core to core. The teal point is near a core but not crowded itself: a <strong>border</strong> point, which joins the cluster but does not extend it. Grey points are near no core: <strong>noise</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The night-sky photo. Cities are crowded lights (core), suburbs attach to them (border), a lone village light belongs to no city (noise). A city's shape follows the lights, not a circle drawn around a centre.</p>
  </div>
  <h3>Choosing eps</h3>
  <p>eps is the hard setting. Too small and everything is noise; too big and all groups merge. A practical method is the <strong>k-distance plot</strong>: for each point, find the distance to its k-th nearest neighbour (k = min_samples). Sort those distances. Most points have a small value (they live in a crowd); the curve shoots up at the lonely points. The eps you want is where it starts shooting up, the "knee".</p>
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
  <p>On the moons, the 5th-neighbour distance is 0.12 for a typical point and 0.28 at the 99th percentile, so the knee is near 0.28 and eps = 0.3 is a good pick: 2 clusters, 1 noise point, ARI 0.993. eps = 0.1 shatters the moons into 20 pieces plus 161 noise points; eps = 0.6 bridges the two moons into one cluster.</p>
  <h3>Mixed densities: HDBSCAN</h3>
  <p>One eps cannot suit both a tight group and a loose group. Small eps shatters the loose one; large eps merges them. <strong>HDBSCAN</strong> tries every eps at once and keeps the clusters that stay stable across the widest range. You set only <code>min_cluster_size</code>.</p>
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
  <p>A tight cloud (spread 0.3) next to a loose one (spread 1.5): no single eps gets above ARI 0.80 with the right number of clusters, while HDBSCAN finds exactly 2 and scores 0.892.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>DBSCAN has no <code>predict</code> for new points (you re-run it), and in high dimensions (more than ~20 columns) all distances look alike, so "crowded" loses meaning; reduce dimensions first. For pure anomaly detection, Isolation Forest or LOF usually beat DBSCAN's noise label.</p>
  </div>

  <h2 id="mcu-hc"><span class="num">06</span>Hierarchical Clustering</h2>
  <p>A family tree read upwards. Siblings join first, then cousins, then the whole khandaan. Cut the tree at the "cousins" level and you get a few branches; cut lower and you get many small ones. The tree holds every possible grouping at once.</p>
  <p><strong>Agglomerative</strong> (bottom-up) clustering builds exactly this tree from data: start with every point as its own group, find the two closest groups, merge them, and repeat until one group is left. The picture of all the merges, drawn with the height of each merge, is a <strong>dendrogram</strong>. You choose k afterwards by cutting the dendrogram with a horizontal line: the number of vertical lines you cross is k.</p>
  <p>Six points: A and B close together, C and D close together, E and F close together, and the three pairs far apart.</p>
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
  <p>Each merge line says which two groups joined and at what height (distance). Ids 0–5 are the original points A–F; new ids count up from 6. So 6 = {A,B}, 7 = {C,D}, 8 = {E,F}, 9 = {C,D,E,F}. The heights tell the story: three cheap merges (0.54, 0.67, 1.02) then a huge jump to 7.45. Cutting anywhere in that jump gives 3 groups, which <code>fcluster</code> confirms: [1 1 2 2 3 3].</p>
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
  <p>The same merges drawn as a dendrogram. The long vertical gap between 1.02 and 7.45 is the signal that 3 is the natural number of groups. The red dashed line is a cut there.</p>
  <h3>Linkage: what "closest two groups" means</h3>
  <p>Between two single points, distance is clear. Between two groups of points, you must decide which distance to use. That choice is the <strong>linkage</strong>, and it changes the result a lot:</p>
  <table class="tbl">
    <tr><th>Linkage</th><th>Cluster distance</th><th>Behaviour</th><th>Moons ARI</th></tr>
    <tr><td><strong>single</strong></td><td>Closest pair of points</td><td>Follows chains and shapes; one noisy bridge merges clusters</td><td>1.000</td></tr>
    <tr><td><strong>complete</strong></td><td>Farthest pair</td><td>Compact, similar-diameter clusters</td><td>0.618</td></tr>
    <tr><td><strong>average</strong></td><td>Mean of all pairs</td><td>In between</td><td>0.546</td></tr>
    <tr><td><strong>ward</strong></td><td>Increase in within-cluster variance</td><td>Round, even-sized (like KMeans); sklearn default</td><td>0.209</td></tr>
  </table>
  <p>Single linkage joins groups if <em>any</em> pair of points is close, so it can follow a curved moon (ARI 1.0) but one noisy point bridging two groups will merge them. Ward joins the two groups whose merge adds the least spread, which gives round, even groups like KMeans (and fails on moons the same way, 0.21). Ward is the sklearn default.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing linkage is choosing how two colonies count as "near": nearest houses (single), farthest houses (complete), or average over all houses (average).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>It needs the distance between every pair of points, so memory grows with n²: fine for 10,000 points, impossible for millions. And merges are never undone: a wrong early merge stays.</p>
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
  <p>The usual path in a project:</p>
  <div class="flow"><span>Scale features</span><span>Reduce dims if &gt; ~20</span><span>KMeans baseline</span><span>Plot / silhouette</span><span>Shapes odd? DBSCAN / HDBSCAN</span><span>Profile clusters</span></div>
  <p>Start with KMeans because it is fast and gives a baseline to beat. Look at the data. If the groups are clearly not round blobs, or there are many outliers, switch to HDBSCAN. Use hierarchical when the data is small and the business wants a tree (product → sub-category → category). GMM when you want "this customer is 70% segment A, 30% segment B" instead of a hard label.</p>

  <h2 id="mcu-build"><span class="num">08</span>Hands-on</h2>
  <p>Segment customers, then describe each segment with its average values. The business team reads this profile table, not the silhouette score. The pipeline puts scaling and KMeans together so you can never forget to scale.</p>
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
  <p>Segment 1: around 25 years old, about 12 visits a month. Segment 0: mid-fifties, about 3 visits. Income is the same in both, so it did not drive the split. That is what a useful segmentation looks like: you can describe each group in one line and imagine a different offer for each.</p>
  <p>Try: add an outlier row (age 200) and watch a centre move; swap in <code>HDBSCAN</code> and count the −1 labels.</p>

  <h2 id="mcu-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is clustering, in one line, and how is it different from classification?</summary><div class="qa-body">Clustering groups rows that are close to each other when there is no answer column; classification learns to predict a given answer column. Clustering is unsupervised, so the groups must be checked by a human afterwards.</div></details>
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
