// notes/ml/ml_dbscan.js — DBSCAN & HDBSCAN
Object.assign(TOPIC_CONTENT, {
  "ml_dbscan": `<main>
  <h1>DBSCAN &amp; HDBSCAN</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>DBSCAN &amp; HDBSCAN</span></div>
  <p class="lead">DBSCAN defines a cluster as a crowded region: points that have many neighbours close by, chained together, with lonely points left out as noise. It needs no number of clusters, follows any shape, and finds outliers as a side effect. This note follows one running example from start to finish, twelve tea stalls on a town map: it labels their core, border and noise points by hand, traces the expansion procedure step by step, rebuilds DBSCAN from scratch to match scikit-learn exactly, shows how to choose eps from a k-distance plot, and then fixes DBSCAN's big weakness (one radius for every density) with HDBSCAN, whose core distances, mutual reachability distances, condensed tree and stability scores are all worked by hand on the same twelve stalls. OPTICS, the third member of the family, reads the same stalls as a reachability plot, and a final section shows how every quantity is built from the one before.</p>

  <h2 id="db-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 240" width="660">
<defs><marker id="db-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Clustering</text>
<rect x="245" y="26" width="170" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="330" y="45" text-anchor="middle" font-size="12.5">The Idea &amp; Distances</text><text x="330" y="61" text-anchor="middle" class="tm" font-size="10.5">what "similar" means</text>
<line x1="280" y1="70" x2="95" y2="104" stroke="currentColor" marker-end="url(#db-fa)"/>
<line x1="310" y1="70" x2="255" y2="104" stroke="currentColor" marker-end="url(#db-fa)"/>
<line x1="350" y1="70" x2="415" y2="104" stroke="currentColor" marker-end="url(#db-fa)"/>
<line x1="380" y1="70" x2="570" y2="104" stroke="currentColor" marker-end="url(#db-fa)"/>
<rect x="20" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="95" y="126" text-anchor="middle" font-size="12.5">K-Means</text><text x="95" y="142" text-anchor="middle" class="tm" font-size="10.5">centroid</text>
<rect x="180" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="255" y="126" text-anchor="middle" font-size="12.5">Hierarchical</text><text x="255" y="142" text-anchor="middle" class="tm" font-size="10.5">merge tree</text>
<rect x="340" y="102" width="150" height="54" rx="8" class="fb sb" stroke-width="3"/>
<text x="415" y="124" text-anchor="middle" font-size="12.5" font-weight="700">DBSCAN &amp; HDBSCAN</text><text x="415" y="142" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE · density</text>
<rect x="500" y="106" width="140" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="570" y="126" text-anchor="middle" font-size="12.5">Gaussian Mixtures</text><text x="570" y="142" text-anchor="middle" class="tm" font-size="10.5">distribution</text>
<line x1="95" y1="152" x2="300" y2="190" stroke="currentColor" marker-end="url(#db-fa)"/>
<line x1="255" y1="152" x2="315" y2="190" stroke="currentColor" marker-end="url(#db-fa)"/>
<line x1="415" y1="156" x2="345" y2="190" stroke="currentColor" marker-end="url(#db-fa)"/>
<line x1="570" y1="152" x2="360" y2="190" stroke="currentColor" marker-end="url(#db-fa)"/>
<rect x="245" y="192" width="170" height="40" rx="8" class="ft st"/>
<text x="330" y="216" text-anchor="middle" font-size="12.5">Evaluating Clusters</text>
<line x1="170" y1="129" x2="178" y2="129" stroke="currentColor" stroke-dasharray="2 2"/>
<line x1="330" y1="129" x2="338" y2="129" stroke="currentColor" stroke-dasharray="2 2"/>
</svg><figcaption>The Clustering group. Four families of algorithms grow out of the idea of distance; each of them is judged with the tools in Evaluating Clusters. DBSCAN is the density family.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_kmeans">K-Means</a> and <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a></b><span>K-Means needs k in advance, cuts every pair of clusters with a straight line (so it fails on moons and rings), and forces every outlier into some cluster where it drags the centre. Single-linkage hierarchical clustering can follow curved shapes, but one stray point between two groups chains them together. What was left open: a method that follows any shape, does not need k, and is not fooled by a few stray points.</span></li>
    <li><b>This note adds: density</b><span>A cluster is a region where points are packed tightly; points in empty space are noise. Two knobs (eps and min_samples) define "packed". You will label core, border and noise points by hand, run the expansion procedure, choose eps with a k-distance plot, see why one eps fails when clusters have different densities, and learn how HDBSCAN (and OPTICS) remove that limit.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a> and <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a></b><span>DBSCAN gives hard yes/no labels and no model of the data. Gaussian mixtures describe each cluster as a probability cloud and give soft memberships. Evaluating Clusters explains how to score any of these results, including why silhouette is unfair to DBSCAN's curved clusters.</span></li>
  </ol>
  <p>You should know what Euclidean distance is and why features must be scaled before measuring it (<a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>), and roughly how K-Means works (<a class="xref" data-note="ml_kmeans">K-Means</a>). Both are re-explained in a line where they are used.</p>


  <h2 id="db-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>This note is one chain of questions. Each idea answers the question left by the one before it, and each answer raises the next question. All of them are computed on the same twelve tea stalls.</p>
  <ol class="story">
    <li><b>Density instead of centres</b><span>Q: how do we find groups of any shape, without choosing k, and leave loners out? → A cluster is a crowded region; lonely points are noise. But "crowded" is vague…</span></li>
    <li><b>eps and min_samples</b><span>Q: when is a point in a crowd? → Count the points within radius eps; crowded if the count reaches min_samples (stall D: 5 ≥ 4). But some points are on the edge of a crowd without being crowded themselves…</span></li>
    <li><b>Core, border and noise points</b><span>Q: what do we do with edge points and loners? → Core = crowded, border = inside a core's circle, noise = neither (E border, K noise). But a cluster is much wider than one circle…</span></li>
    <li><b>Reachability and connectivity</b><span>Q: which crowded points belong to the same cluster? → Those linked by a chain of core points (A → D → E). But a program needs a procedure, not a definition…</span></li>
    <li><b>The expansion procedure</b><span>Q: how does an algorithm find the clusters? → Flood-fill from each unlabelled core point. But everything depends on eps and min_samples, which we chose by looking at a map…</span></li>
    <li><b>The k-distance plot</b><span>Q: how do we choose eps without seeing the data? → Sort each point's distance to its min_samples-th neighbour; eps at the knee. But is DBSCAN actually better than K-Means?…</span></li>
    <li><b>Shapes and noise vs K-Means</b><span>Q: where does density win and where does it lose? → It wins on curves and noise, loses slightly on round blobs. But all those clusters had the same density…</span></li>
    <li><b>The varying-density problem</b><span>Q: can one eps serve tight and loose clusters? → No: any single radius shatters one or merges the other. So we need every eps at once…</span></li>
    <li><b>HDBSCAN</b><span>Q: how do we try every eps and keep the right clusters? → Core distance → mutual reachability → minimum spanning tree → condensed tree → stability. But the result hides the density structure inside a tree…</span></li>
    <li><b>OPTICS</b><span>Q: can we see the density structure as one picture? → The reachability plot: valleys are clusters, a cut at eps is DBSCAN. Then: how do we use all this in practice, and how do the pieces fit together?</span></li>
  </ol>

  <h2 id="db-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">DBSCAN &amp; HDBSCAN</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · The idea</div>
        <ul>
          <li><b>Cluster</b> = a dense region; clusters are separated by sparse space</li>
          <li><b>No k</b>, any shape, outliers labelled <b>−1</b> (noise)</li>
          <li>Running example: 12 tea stalls → 2 markets, loners K and L = noise (K-Means forced them in)</li>
          <li>Moons + 15 junk rows: K-Means ARI 0.461, DBSCAN <b>0.993</b> and 10 junk rows flagged</li>
          <li>DBSCAN = "Density-Based Spatial Clustering of Applications with Noise" (Ester et al., 1996)</li>
          <li>💡 India at night from space: cities are bright crowded patches, a lone village light is noise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Definitions</div>
        <ul>
          <li><b>N_eps(p)</b> = all points within distance eps of p (p included)</li>
          <li><b>Core</b>: |N_eps(p)| ≥ min_samples · <b>Border</b>: not core, but inside a core's eps-ball · <b>Noise</b>: neither</li>
          <li><b>Directly reachable</b> q from p: p core and q ∈ N_eps(p) (not symmetric)</li>
          <li><b>Reachable</b>: a chain of directly-reachable steps · <b>Connected</b>: both reachable from one core</li>
          <li><b>Cluster</b> = a maximal set of density-connected points</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · The procedure</div>
        <ul>
          <li>Find every point's eps-neighbourhood, mark core points</li>
          <li>Take an unlabelled core point, start cluster c, flood-fill: neighbours join; only <b>core</b> neighbours spread further</li>
          <li>Leftover points = noise (−1)</li>
          <li>Core points and noise: deterministic. Border point between two clusters: goes to whichever reaches it first (row order)</li>
          <li>Cost: O(n log n) with a tree index for small eps, O(n²) worst; memory grows with neighbour pairs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Choosing knobs</div>
        <ul>
          <li><b>min_samples</b>: ≥ d + 1; rule of thumb 2·d; bigger for noisy data</li>
          <li><b>k-distance plot</b>: each point's distance to its min_samples-th neighbour (self counted), sorted; eps at the knee</li>
          <li>A point is core ⇔ its k-distance ≤ eps</li>
          <li>Moons: knee ≈ 0.20; eps 0.1 shatters (21 clusters), <b>0.3 → 2</b>, 0.8 → 1</li>
          <li>⚠ Scale features first; eps is in the units of the data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · HDBSCAN</div>
        <ul>
          <li>Problem: one eps cannot fit tight and loose clusters (best DBSCAN ARI 0.952 only at one lucky eps)</li>
          <li><b>Core distance</b> core_k(p) · <b>mutual reachability</b> = max(core(a), core(b), d(a,b))</li>
          <li>MST on mutual reachability → single-linkage tree → <b>condensed tree</b> (drop splits smaller than min_cluster_size)</li>
          <li>λ = 1/distance; <b>stability</b> = Σ (λ_leave − λ_birth); pick clusters by excess of mass</li>
          <li>Knobs: <b>min_cluster_size</b> (main), min_samples (how conservative); 3 clouds: ARI 0.913–0.962</li>
          <li>Gives <b>probabilities_</b> (strength of membership)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · OPTICS &amp; practice</div>
        <ul>
          <li><b>OPTICS</b>: orders points, records reachability distance; valleys of the reachability plot = clusters; a horizontal cut = DBSCAN at that eps</li>
          <li>Geo data: metric="haversine", radians, eps = km / 6371</li>
          <li>No <code>predict</code>: assign a new point to the nearest core point within eps</li>
          <li>High dimensions: distances concentrate → reduce first (PCA/UMAP)</li>
          <li>Silhouette is unfair to curved clusters; judge with plots and DBCV</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="db-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="db-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Density?</span><span class="rm-sub">Where K-Means breaks</span></div></div>
      <div class="rm-item rm-done" data-target="db-defs"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">eps, min_samples &amp; Point Types</span><span class="rm-sub">Core, border, noise, reachability</span></div></div>
      <div class="rm-item rm-done" data-target="db-hand"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Labelling by Hand</span><span class="rm-sub">Twelve points, every distance</span></div></div>
      <div class="rm-item rm-done" data-target="db-expand"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Expansion Procedure</span><span class="rm-sub">Trace, scratch code, border order</span></div></div>
      <div class="rm-item rm-done" data-target="db-eps"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Choosing eps &amp; min_samples</span><span class="rm-sub">k-distance plot by hand</span></div></div>
      <div class="rm-item rm-done" data-target="db-shapes"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Shapes &amp; Noise vs K-Means</span><span class="rm-sub">Moons, rings, blobs</span></div></div>
      <div class="rm-item rm-done" data-target="db-varying"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Varying-Density Problem</span><span class="rm-sub">Why one radius fails</span></div></div>
      <div class="rm-item rm-done" data-target="db-hdbscan"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">HDBSCAN</span><span class="rm-sub">Mutual reachability, condensed tree, stability</span></div></div>
      <div class="rm-item rm-done" data-target="db-optics"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">OPTICS</span><span class="rm-sub">Reachability plots</span></div></div>
      <div class="rm-item rm-done" data-target="db-practice"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Parameters &amp; Practice</span><span class="rm-sub">sklearn, geo data, new points, cost</span></div></div>
      <div class="rm-item rm-done" data-target="db-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every quantity on the stalls</span></div></div>
      <div class="rm-item rm-done" data-target="db-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs K-Means, hierarchical, GMM</span></div></div>
      <div class="rm-item rm-done" data-target="db-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in practice</span></div></div>
      <div class="rm-item rm-done" data-target="db-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="db-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="db-why"><span class="num">01</span>Why Density-Based Clustering?</h2>
  <p><strong>The question we can't answer yet.</strong> K-Means can split the town's tea stalls into k groups, but it needs k in advance, it can only draw straight borders, and it has no way to say "this stall belongs to no group". How do we find groups of any shape, without choosing k, and leave the loners out?</p>
  <h3>The running example: 12 tea stalls</h3>
  <p>Throughout this note we use one small map: 12 tea stalls in a town, with positions in kilometres. Every concept (neighbourhoods, core points, k-distances, HDBSCAN's core distances, OPTICS' reachability) is computed on these same 12 points, so you can watch each new number being built from the previous ones.</p>
  <table class="tbl">
    <tr><th>Stall</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th><th>K</th><th>L</th></tr>
    <tr><td>(x, y) km</td><td>(1,1)</td><td>(2,1)</td><td>(1,2)</td><td>(2,2)</td><td>(3,2)</td><td>(6,5)</td><td>(7,5)</td><td>(6,6)</td><td>(7,6)</td><td>(8,7)</td><td>(4,9)</td><td>(10,1)</td></tr>
  </table>
  <p>By eye: a market near the station (A–E), a market near the college (F–J), and two lonely stalls on the highway (K and L). A good method should say exactly that: two groups and two loners.</p>
  <h3>What K-Means does with the stalls</h3>
  <div class="fx" data-lang="py">P = np.array([[1, 1], [2, 1], [1, 2], [2, 2], [3, 2],
              [6, 5], [7, 5], [6, 6], [7, 6], [8, 7],
              [4, 9], [10, 1]], dtype=float)          # the 12 tea stalls A..L, in km
names = list("ABCDEFGHIJKL")
for k in (2, 3):
    lab = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(P)
    print(f"K-Means k={k}:", " ".join(f"{n}={l}" for n, l in zip(names, lab)))</div>
  <div class="fx" data-lang="text">K-Means k=2: A=1 B=1 C=1 D=1 E=1 F=0 G=0 H=0 I=0 J=0 K=0 L=0
K-Means k=3: A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=1 L=2</div>
  <p>With k = 2, K-Means puts the two highway stalls K and L into the college market, because every stall must join its nearest centre; they also drag that centre away from the real market. With k = 3 it gives the lonely stall L a "group" of its own and still forces K into the college market. Neither answer says "K and L are loners". That one rule (every point joins its nearest centre) causes three problems:</p>
  <ul>
    <li><strong>Shapes.</strong> The border between two K-Means clusters is always a straight line halfway between their centres. A banana-shaped or ring-shaped group cannot be described by one centre.</li>
    <li><strong>Outliers.</strong> Every row must belong to some cluster, and it drags that cluster's centre toward itself.</li>
    <li><strong>k.</strong> You must say how many clusters there are before you start, which is usually the thing you wanted to learn.</li>
  </ul>
  <h3>The idea in plain words</h3>
  <p>Look at where the points are <em>crowded</em>. A cluster is a region where points are packed close together. Two clusters are separated by a gap of empty (or nearly empty) space. A point sitting alone in empty space belongs to no cluster at all: it is <strong>noise</strong>. Nothing in this definition mentions a centre or a shape, so the clusters can be any shape, and nothing mentions k, so the number of clusters comes out of the data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A photo of India at night taken from space. Delhi and Mumbai are bright patches of crowded lights; their suburbs glow less but are attached to the city. A single village light in the middle of nowhere belongs to no city. Nobody drew a circle around a city centre: a city is simply where the lights are packed together, whatever its shape.</p>
  </div>
  <h3>The same idea at scale</h3>
  <p>Two interlocking half-moons (300 points) plus 15 junk rows scattered at random. After scaling, K-Means with k = 2 and DBSCAN with eps = 0.3, min_samples = 5 (both knobs are explained in the next section) are compared with the adjusted Rand index (ARI): 1 means the found groups match the true moons exactly, about 0 means no better than random (details in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score

Xm, ym = make_moons(n_samples=300, noise=0.06, random_state=0)
rng = np.random.default_rng(1)
junk = rng.uniform(low=[-1.5, -1.0], high=[2.5, 1.5], size=(15, 2))   # 15 scattered junk rows
X = StandardScaler().fit_transform(np.vstack([Xm, junk]))
y = np.r_[ym, [-1] * 15]                      # truth: 0/1 = moon, -1 = junk
moon = y &gt;= 0

km = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
db = DBSCAN(eps=0.3, min_samples=5).fit_predict(X)
print("KMeans: clusters", len(set(km)), "| ARI on moon rows", round(adjusted_rand_score(y[moon], km[moon]), 3),
      "| junk rows flagged: 0 of 15 (it has no 'noise' label)")
print("DBSCAN: clusters", len(set(db) - {-1}), "| ARI on moon rows", round(adjusted_rand_score(y[moon], db[moon]), 3),
      "| junk rows flagged:", (db[~moon] == -1).sum(), "of 15 | moon rows flagged:", (db[moon] == -1).sum())</div>
  <div class="fx" data-lang="text">KMeans: clusters 2 | ARI on moon rows 0.461 | junk rows flagged: 0 of 15 (it has no 'noise' label)
DBSCAN: clusters 2 | ARI on moon rows 0.993 | junk rows flagged: 10 of 15 | moon rows flagged: 1</div>
  <p>K-Means scores 0.461 on the moon rows: it cuts both moons with a straight line, and all 15 junk rows were pushed into a moon. DBSCAN recovers the two moons almost perfectly (0.993), marks 10 of the 15 junk rows as noise (the other 5 happened to land inside or right next to a moon, where they really are indistinguishable from moon points), and wrongly calls only 1 of the 300 moon rows noise. Nobody told DBSCAN there were two clusters.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<text x="160" y="16" text-anchor="middle" font-size="12.5">KMeans, k = 2</text>
<text x="480" y="16" text-anchor="middle" font-size="12.5">DBSCAN, eps = 0.3, min_samples = 5</text>
<circle cx="169" cy="171" r="2.6" class="fr sr"/><circle cx="130" cy="153" r="2.6" class="fr sr"/><circle cx="186" cy="108" r="2.6" class="fr sr"/><circle cx="189" cy="170" r="2.6" class="fr sr"/><circle cx="209" cy="164" r="2.6" class="fr sr"/><circle cx="30" cy="122" r="2.6" class="fb sb"/><circle cx="206" cy="169" r="2.6" class="fr sr"/><circle cx="165" cy="164" r="2.6" class="fr sr"/><circle cx="152" cy="73" r="2.6" class="fb sb"/><circle cx="54" cy="77" r="2.6" class="fb sb"/><circle cx="265" cy="115" r="2.6" class="fr sr"/><circle cx="185" cy="112" r="2.6" class="fr sr"/><circle cx="129" cy="152" r="2.6" class="fr sr"/><circle cx="226" cy="172" r="2.6" class="fr sr"/><circle cx="185" cy="109" r="2.6" class="fr sr"/><circle cx="107" cy="62" r="2.6" class="fb sb"/><circle cx="252" cy="134" r="2.6" class="fr sr"/><circle cx="79" cy="65" r="2.6" class="fb sb"/><circle cx="198" cy="176" r="2.6" class="fr sr"/><circle cx="117" cy="120" r="2.6" class="fb sb"/><circle cx="141" cy="149" r="2.6" class="fr sr"/><circle cx="76" cy="69" r="2.6" class="fb sb"/><circle cx="40" cy="99" r="2.6" class="fb sb"/><circle cx="44" cy="102" r="2.6" class="fb sb"/><circle cx="190" cy="178" r="2.6" class="fr sr"/><circle cx="50" cy="92" r="2.6" class="fb sb"/><circle cx="144" cy="157" r="2.6" class="fr sr"/><circle cx="272" cy="117" r="2.6" class="fr sr"/><circle cx="210" cy="172" r="2.6" class="fr sr"/><circle cx="266" cy="107" r="2.6" class="fr sr"/><circle cx="82" cy="66" r="2.6" class="fb sb"/><circle cx="136" cy="64" r="2.6" class="fb sb"/><circle cx="185" cy="124" r="2.6" class="fr sr"/><circle cx="42" cy="94" r="2.6" class="fb sb"/><circle cx="174" cy="170" r="2.6" class="fr sr"/><circle cx="112" cy="98" r="2.6" class="fb sb"/><circle cx="120" cy="137" r="2.6" class="fr sr"/><circle cx="122" cy="146" r="2.6" class="fr sr"/><circle cx="268" cy="97" r="2.6" class="fr sr"/><circle cx="185" cy="124" r="2.6" class="fr sr"/><circle cx="195" cy="180" r="2.6" class="fr sr"/><circle cx="89" cy="63" r="2.6" class="fb sb"/><circle cx="97" cy="65" r="2.6" class="fb sb"/><circle cx="170" cy="89" r="2.6" class="fb sb"/><circle cx="141" cy="76" r="2.6" class="fb sb"/><circle cx="39" cy="115" r="2.6" class="fb sb"/><circle cx="206" cy="175" r="2.6" class="fr sr"/><circle cx="131" cy="67" r="2.6" class="fb sb"/><circle cx="191" cy="126" r="2.6" class="fr sr"/><circle cx="161" cy="73" r="2.6" class="fb sb"/><circle cx="110" cy="69" r="2.6" class="fb sb"/><circle cx="164" cy="166" r="2.6" class="fr sr"/><circle cx="115" cy="135" r="2.6" class="fb sb"/><circle cx="59" cy="78" r="2.6" class="fb sb"/><circle cx="127" cy="65" r="2.6" class="fb sb"/><circle cx="238" cy="158" r="2.6" class="fr sr"/><circle cx="115" cy="125" r="2.6" class="fb sb"/><circle cx="181" cy="109" r="2.6" class="fr sr"/><circle cx="276" cy="119" r="2.6" class="fr sr"/><circle cx="108" cy="105" r="2.6" class="fb sb"/><circle cx="38" cy="113" r="2.6" class="fb sb"/><circle cx="22" cy="120" r="2.6" class="fb sb"/><circle cx="130" cy="60" r="2.6" class="fb sb"/><circle cx="266" cy="101" r="2.6" class="fr sr"/><circle cx="268" cy="117" r="2.6" class="fr sr"/><circle cx="185" cy="166" r="2.6" class="fr sr"/><circle cx="238" cy="154" r="2.6" class="fr sr"/><circle cx="53" cy="85" r="2.6" class="fb sb"/><circle cx="195" cy="110" r="2.6" class="fr sr"/><circle cx="155" cy="70" r="2.6" class="fb sb"/><circle cx="112" cy="105" r="2.6" class="fb sb"/><circle cx="195" cy="169" r="2.6" class="fr sr"/><circle cx="252" cy="129" r="2.6" class="fr sr"/><circle cx="178" cy="99" r="2.6" class="fb sb"/><circle cx="35" cy="129" r="2.6" class="fb sb"/><circle cx="237" cy="159" r="2.6" class="fr sr"/><circle cx="171" cy="85" r="2.6" class="fb sb"/><circle cx="74" cy="66" r="2.6" class="fb sb"/><circle cx="134" cy="157" r="2.6" class="fr sr"/><circle cx="33" cy="113" r="2.6" class="fb sb"/><circle cx="48" cy="92" r="2.6" class="fb sb"/><circle cx="113" cy="114" r="2.6" class="fb sb"/><circle cx="246" cy="151" r="2.6" class="fr sr"/><circle cx="175" cy="173" r="2.6" class="fr sr"/><circle cx="208" cy="169" r="2.6" class="fr sr"/><circle cx="108" cy="53" r="2.6" class="fb sb"/><circle cx="167" cy="164" r="2.6" class="fr sr"/><circle cx="195" cy="176" r="2.6" class="fr sr"/><circle cx="242" cy="162" r="2.6" class="fr sr"/><circle cx="199" cy="166" r="2.6" class="fr sr"/><circle cx="257" cy="122" r="2.6" class="fr sr"/><circle cx="156" cy="70" r="2.6" class="fb sb"/><circle cx="263" cy="140" r="2.6" class="fr sr"/><circle cx="133" cy="157" r="2.6" class="fr sr"/><circle cx="109" cy="103" r="2.6" class="fb sb"/><circle cx="110" cy="110" r="2.6" class="fb sb"/><circle cx="72" cy="72" r="2.6" class="fb sb"/><circle cx="141" cy="75" r="2.6" class="fb sb"/><circle cx="134" cy="146" r="2.6" class="fr sr"/><circle cx="182" cy="110" r="2.6" class="fr sr"/><circle cx="256" cy="128" r="2.6" class="fr sr"/><circle cx="229" cy="158" r="2.6" class="fr sr"/><circle cx="44" cy="101" r="2.6" class="fb sb"/><circle cx="123" cy="128" r="2.6" class="fb sb"/><circle cx="117" cy="62" r="2.6" class="fb sb"/><circle cx="194" cy="173" r="2.6" class="fr sr"/><circle cx="223" cy="169" r="2.6" class="fr sr"/><circle cx="160" cy="169" r="2.6" class="fr sr"/><circle cx="272" cy="116" r="2.6" class="fr sr"/><circle cx="175" cy="167" r="2.6" class="fr sr"/><circle cx="114" cy="112" r="2.6" class="fb sb"/><circle cx="112" cy="108" r="2.6" class="fb sb"/><circle cx="164" cy="87" r="2.6" class="fb sb"/><circle cx="86" cy="68" r="2.6" class="fb sb"/><circle cx="230" cy="169" r="2.6" class="fr sr"/><circle cx="130" cy="72" r="2.6" class="fb sb"/><circle cx="124" cy="123" r="2.6" class="fb sb"/><circle cx="267" cy="128" r="2.6" class="fr sr"/><circle cx="55" cy="89" r="2.6" class="fb sb"/><circle cx="182" cy="107" r="2.6" class="fr sr"/><circle cx="180" cy="88" r="2.6" class="fb sb"/><circle cx="39" cy="127" r="2.6" class="fb sb"/><circle cx="183" cy="116" r="2.6" class="fr sr"/><circle cx="145" cy="66" r="2.6" class="fb sb"/><circle cx="102" cy="61" r="2.6" class="fb sb"/><circle cx="62" cy="81" r="2.6" class="fb sb"/><circle cx="121" cy="139" r="2.6" class="fr sr"/><circle cx="146" cy="159" r="2.6" class="fr sr"/><circle cx="112" cy="116" r="2.6" class="fb sb"/><circle cx="199" cy="126" r="2.6" class="fr sr"/><circle cx="78" cy="69" r="2.6" class="fb sb"/><circle cx="123" cy="115" r="2.6" class="fb sb"/><circle cx="138" cy="63" r="2.6" class="fb sb"/><circle cx="114" cy="63" r="2.6" class="fb sb"/><circle cx="33" cy="116" r="2.6" class="fb sb"/><circle cx="153" cy="172" r="2.6" class="fr sr"/><circle cx="245" cy="148" r="2.6" class="fr sr"/><circle cx="261" cy="134" r="2.6" class="fr sr"/><circle cx="168" cy="80" r="2.6" class="fb sb"/><circle cx="249" cy="141" r="2.6" class="fr sr"/><circle cx="192" cy="115" r="2.6" class="fr sr"/><circle cx="64" cy="78" r="2.6" class="fb sb"/><circle cx="181" cy="176" r="2.6" class="fr sr"/><circle cx="190" cy="129" r="2.6" class="fr sr"/><circle cx="116" cy="110" r="2.6" class="fb sb"/><circle cx="44" cy="104" r="2.6" class="fb sb"/><circle cx="177" cy="100" r="2.6" class="fb sb"/><circle cx="170" cy="88" r="2.6" class="fb sb"/><circle cx="109" cy="61" r="2.6" class="fb sb"/><circle cx="271" cy="102" r="2.6" class="fr sr"/><circle cx="165" cy="177" r="2.6" class="fr sr"/><circle cx="185" cy="107" r="2.6" class="fr sr"/><circle cx="235" cy="162" r="2.6" class="fr sr"/><circle cx="216" cy="166" r="2.6" class="fr sr"/><circle cx="249" cy="135" r="2.6" class="fr sr"/><circle cx="97" cy="66" r="2.6" class="fb sb"/><circle cx="138" cy="70" r="2.6" class="fb sb"/><circle cx="181" cy="134" r="2.6" class="fr sr"/><circle cx="207" cy="172" r="2.6" class="fr sr"/><circle cx="73" cy="72" r="2.6" class="fb sb"/><circle cx="132" cy="144" r="2.6" class="fr sr"/><circle cx="97" cy="62" r="2.6" class="fb sb"/><circle cx="193" cy="115" r="2.6" class="fr sr"/><circle cx="146" cy="163" r="2.6" class="fr sr"/><circle cx="142" cy="78" r="2.6" class="fb sb"/><circle cx="170" cy="77" r="2.6" class="fb sb"/><circle cx="187" cy="113" r="2.6" class="fr sr"/><circle cx="107" cy="108" r="2.6" class="fb sb"/><circle cx="156" cy="66" r="2.6" class="fb sb"/><circle cx="282" cy="110" r="2.6" class="fr sr"/><circle cx="202" cy="172" r="2.6" class="fr sr"/><circle cx="38" cy="97" r="2.6" class="fb sb"/><circle cx="153" cy="162" r="2.6" class="fr sr"/><circle cx="137" cy="66" r="2.6" class="fb sb"/><circle cx="132" cy="152" r="2.6" class="fr sr"/><circle cx="185" cy="178" r="2.6" class="fr sr"/><circle cx="32" cy="101" r="2.6" class="fb sb"/><circle cx="169" cy="161" r="2.6" class="fr sr"/><circle cx="239" cy="160" r="2.6" class="fr sr"/><circle cx="157" cy="77" r="2.6" class="fb sb"/><circle cx="55" cy="82" r="2.6" class="fb sb"/><circle cx="35" cy="111" r="2.6" class="fb sb"/><circle cx="269" cy="110" r="2.6" class="fr sr"/><circle cx="172" cy="174" r="2.6" class="fr sr"/><circle cx="33" cy="139" r="2.6" class="fb sb"/><circle cx="59" cy="78" r="2.6" class="fb sb"/><circle cx="216" cy="159" r="2.6" class="fr sr"/><circle cx="62" cy="69" r="2.6" class="fb sb"/><circle cx="184" cy="170" r="2.6" class="fr sr"/><circle cx="75" cy="70" r="2.6" class="fb sb"/><circle cx="175" cy="171" r="2.6" class="fr sr"/><circle cx="113" cy="117" r="2.6" class="fb sb"/><circle cx="170" cy="90" r="2.6" class="fb sb"/><circle cx="123" cy="132" r="2.6" class="fr sr"/><circle cx="51" cy="87" r="2.6" class="fb sb"/><circle cx="196" cy="146" r="2.6" class="fr sr"/><circle cx="85" cy="71" r="2.6" class="fb sb"/><circle cx="261" cy="133" r="2.6" class="fr sr"/><circle cx="82" cy="70" r="2.6" class="fb sb"/><circle cx="267" cy="98" r="2.6" class="fr sr"/><circle cx="235" cy="151" r="2.6" class="fr sr"/><circle cx="210" cy="171" r="2.6" class="fr sr"/><circle cx="130" cy="63" r="2.6" class="fb sb"/><circle cx="153" cy="80" r="2.6" class="fb sb"/><circle cx="150" cy="73" r="2.6" class="fb sb"/><circle cx="95" cy="62" r="2.6" class="fb sb"/><circle cx="270" cy="99" r="2.6" class="fr sr"/><circle cx="35" cy="131" r="2.6" class="fb sb"/><circle cx="162" cy="163" r="2.6" class="fr sr"/><circle cx="184" cy="103" r="2.6" class="fr sr"/><circle cx="222" cy="169" r="2.6" class="fr sr"/><circle cx="31" cy="128" r="2.6" class="fb sb"/><circle cx="23" cy="129" r="2.6" class="fb sb"/><circle cx="100" cy="59" r="2.6" class="fb sb"/><circle cx="124" cy="143" r="2.6" class="fr sr"/><circle cx="69" cy="71" r="2.6" class="fb sb"/><circle cx="155" cy="178" r="2.6" class="fr sr"/><circle cx="40" cy="106" r="2.6" class="fb sb"/><circle cx="252" cy="149" r="2.6" class="fr sr"/><circle cx="272" cy="99" r="2.6" class="fr sr"/><circle cx="143" cy="159" r="2.6" class="fr sr"/><circle cx="186" cy="126" r="2.6" class="fr sr"/><circle cx="115" cy="61" r="2.6" class="fb sb"/><circle cx="151" cy="163" r="2.6" class="fr sr"/><circle cx="88" cy="66" r="2.6" class="fb sb"/><circle cx="118" cy="135" r="2.6" class="fr sr"/><circle cx="45" cy="96" r="2.6" class="fb sb"/><circle cx="25" cy="127" r="2.6" class="fb sb"/><circle cx="243" cy="152" r="2.6" class="fr sr"/><circle cx="259" cy="133" r="2.6" class="fr sr"/><circle cx="33" cy="123" r="2.6" class="fb sb"/><circle cx="247" cy="161" r="2.6" class="fr sr"/><circle cx="87" cy="68" r="2.6" class="fb sb"/><circle cx="97" cy="65" r="2.6" class="fb sb"/><circle cx="264" cy="128" r="2.6" class="fr sr"/><circle cx="189" cy="111" r="2.6" class="fr sr"/><circle cx="47" cy="92" r="2.6" class="fb sb"/><circle cx="64" cy="75" r="2.6" class="fb sb"/><circle cx="172" cy="88" r="2.6" class="fb sb"/><circle cx="138" cy="66" r="2.6" class="fb sb"/><circle cx="113" cy="126" r="2.6" class="fb sb"/><circle cx="206" cy="164" r="2.6" class="fr sr"/><circle cx="126" cy="58" r="2.6" class="fb sb"/><circle cx="196" cy="138" r="2.6" class="fr sr"/><circle cx="40" cy="95" r="2.6" class="fb sb"/><circle cx="260" cy="142" r="2.6" class="fr sr"/><circle cx="130" cy="142" r="2.6" class="fr sr"/><circle cx="163" cy="89" r="2.6" class="fb sb"/><circle cx="65" cy="75" r="2.6" class="fb sb"/><circle cx="38" cy="108" r="2.6" class="fb sb"/><circle cx="103" cy="69" r="2.6" class="fb sb"/><circle cx="184" cy="114" r="2.6" class="fr sr"/><circle cx="244" cy="154" r="2.6" class="fr sr"/><circle cx="205" cy="170" r="2.6" class="fr sr"/><circle cx="164" cy="86" r="2.6" class="fb sb"/><circle cx="36" cy="106" r="2.6" class="fb sb"/><circle cx="136" cy="68" r="2.6" class="fb sb"/><circle cx="240" cy="162" r="2.6" class="fr sr"/><circle cx="30" cy="108" r="2.6" class="fb sb"/><circle cx="178" cy="93" r="2.6" class="fb sb"/><circle cx="125" cy="141" r="2.6" class="fr sr"/><circle cx="121" cy="117" r="2.6" class="fb sb"/><circle cx="108" cy="95" r="2.6" class="fb sb"/><circle cx="226" cy="161" r="2.6" class="fr sr"/><circle cx="151" cy="175" r="2.6" class="fr sr"/><circle cx="184" cy="98" r="2.6" class="fb sb"/><circle cx="173" cy="79" r="2.6" class="fb sb"/><circle cx="41" cy="98" r="2.6" class="fb sb"/><circle cx="125" cy="155" r="2.6" class="fr sr"/><circle cx="260" cy="125" r="2.6" class="fr sr"/><circle cx="255" cy="142" r="2.6" class="fr sr"/><circle cx="32" cy="127" r="2.6" class="fb sb"/><circle cx="254" cy="138" r="2.6" class="fr sr"/><circle cx="120" cy="133" r="2.6" class="fr sr"/><circle cx="73" cy="63" r="2.6" class="fb sb"/><circle cx="152" cy="159" r="2.6" class="fr sr"/><circle cx="227" cy="165" r="2.6" class="fr sr"/><circle cx="48" cy="84" r="2.6" class="fb sb"/><circle cx="247" cy="147" r="2.6" class="fr sr"/><circle cx="122" cy="63" r="2.6" class="fb sb"/><circle cx="176" cy="100" r="2.6" class="fb sb"/><circle cx="120" cy="124" r="2.6" class="fb sb"/><circle cx="266" cy="119" r="2.6" class="fr sr"/><circle cx="122" cy="135" r="2.6" class="fr sr"/><circle cx="261" cy="118" r="2.6" class="fr sr"/><circle cx="161" cy="76" r="2.6" class="fb sb"/><circle cx="146" cy="153" r="2.6" class="fr sr"/><circle cx="86" cy="69" r="2.6" class="fb sb"/><circle cx="116" cy="67" r="2.6" class="fb sb"/><circle cx="102" cy="75" r="2.6" class="fb sb"/><circle cx="222" cy="172" r="2.6" class="fr sr"/><circle cx="261" cy="135" r="2.6" class="fr sr"/><circle cx="163" cy="173" r="2.6" class="fr sr"/><circle cx="198" cy="122" r="2.6" class="fr sr"/><circle cx="141" cy="155" r="2.6" class="fr sr"/><circle cx="233" cy="157" r="2.6" class="fr sr"/><circle cx="132" cy="153" r="2.6" class="fr sr"/><circle cx="53" cy="97" r="2.6" class="fb sb"/><circle cx="157" cy="67" r="2.6" class="fb sb"/><circle cx="119" cy="127" r="2.6" class="fb sb"/><circle cx="155" cy="35" r="2.6" class="fb sb"/><circle cx="38" cy="36" r="2.6" class="fb sb"/><circle cx="91" cy="131" r="2.6" class="fb sb"/><circle cx="255" cy="133" r="2.6" class="fr sr"/><circle cx="167" cy="202" r="2.6" class="fr sr"/><circle cx="232" cy="110" r="2.6" class="fr sr"/><circle cx="97" cy="65" r="2.6" class="fb sb"/><circle cx="88" cy="125" r="2.6" class="fb sb"/><circle cx="34" cy="134" r="2.6" class="fb sb"/><circle cx="56" cy="160" r="2.6" class="fb sb"/><circle cx="231" cy="156" r="2.6" class="fr sr"/><circle cx="146" cy="30" r="2.6" class="fb sb"/><circle cx="298" cy="76" r="2.6" class="fr sr"/><circle cx="164" cy="157" r="2.6" class="fr sr"/><circle cx="43" cy="32" r="2.6" class="fb sb"/>
<circle cx="489" cy="171" r="2.6" class="fb sb"/><circle cx="450" cy="153" r="2.6" class="fb sb"/><circle cx="506" cy="108" r="2.6" class="fr sr"/><circle cx="509" cy="170" r="2.6" class="fb sb"/><circle cx="529" cy="164" r="2.6" class="fb sb"/><circle cx="350" cy="122" r="2.6" class="fr sr"/><circle cx="526" cy="169" r="2.6" class="fb sb"/><circle cx="485" cy="164" r="2.6" class="fb sb"/><circle cx="472" cy="73" r="2.6" class="fr sr"/><circle cx="374" cy="77" r="2.6" class="fr sr"/><circle cx="585" cy="115" r="2.6" class="fb sb"/><circle cx="505" cy="112" r="2.6" class="fr sr"/><circle cx="449" cy="152" r="2.6" class="fb sb"/><circle cx="546" cy="172" r="2.6" class="fb sb"/><circle cx="505" cy="109" r="2.6" class="fr sr"/><circle cx="427" cy="62" r="2.6" class="fr sr"/><circle cx="572" cy="134" r="2.6" class="fb sb"/><circle cx="399" cy="65" r="2.6" class="fr sr"/><circle cx="518" cy="176" r="2.6" class="fb sb"/><circle cx="437" cy="120" r="2.6" class="fb sb"/><circle cx="461" cy="149" r="2.6" class="fb sb"/><circle cx="396" cy="69" r="2.6" class="fr sr"/><circle cx="360" cy="99" r="2.6" class="fr sr"/><circle cx="364" cy="102" r="2.6" class="fr sr"/><circle cx="510" cy="178" r="2.6" class="fb sb"/><circle cx="370" cy="92" r="2.6" class="fr sr"/><circle cx="464" cy="157" r="2.6" class="fb sb"/><circle cx="592" cy="117" r="2.6" class="fb sb"/><circle cx="530" cy="172" r="2.6" class="fb sb"/><circle cx="586" cy="107" r="2.6" class="fb sb"/><circle cx="402" cy="66" r="2.6" class="fr sr"/><circle cx="456" cy="64" r="2.6" class="fr sr"/><circle cx="505" cy="124" r="2.6" class="fr sr"/><circle cx="362" cy="94" r="2.6" class="fr sr"/><circle cx="494" cy="170" r="2.6" class="fb sb"/><circle cx="432" cy="98" r="2.6" class="fb sb"/><circle cx="440" cy="137" r="2.6" class="fb sb"/><circle cx="442" cy="146" r="2.6" class="fb sb"/><circle cx="588" cy="97" r="2.6" class="fb sb"/><circle cx="505" cy="124" r="2.6" class="fr sr"/><circle cx="515" cy="180" r="2.6" class="fb sb"/><circle cx="409" cy="63" r="2.6" class="fr sr"/><circle cx="417" cy="65" r="2.6" class="fr sr"/><circle cx="490" cy="89" r="2.6" class="fr sr"/><circle cx="461" cy="76" r="2.6" class="fr sr"/><circle cx="359" cy="115" r="2.6" class="fr sr"/><circle cx="526" cy="175" r="2.6" class="fb sb"/><circle cx="451" cy="67" r="2.6" class="fr sr"/><circle cx="511" cy="126" r="2.6" class="fr sr"/><circle cx="481" cy="73" r="2.6" class="fr sr"/><circle cx="430" cy="69" r="2.6" class="fr sr"/><circle cx="484" cy="166" r="2.6" class="fb sb"/><circle cx="435" cy="135" r="2.6" class="fb sb"/><circle cx="379" cy="78" r="2.6" class="fr sr"/><circle cx="447" cy="65" r="2.6" class="fr sr"/><circle cx="558" cy="158" r="2.6" class="fb sb"/><circle cx="435" cy="125" r="2.6" class="fb sb"/><circle cx="501" cy="109" r="2.6" class="fr sr"/><circle cx="596" cy="119" r="2.6" class="fb sb"/><circle cx="428" cy="105" r="2.6" class="fb sb"/><circle cx="358" cy="113" r="2.6" class="fr sr"/><circle cx="342" cy="120" r="2.6" class="fr sr"/><circle cx="450" cy="60" r="2.6" class="fr sr"/><circle cx="586" cy="101" r="2.6" class="fb sb"/><circle cx="588" cy="117" r="2.6" class="fb sb"/><circle cx="505" cy="166" r="2.6" class="fb sb"/><circle cx="558" cy="154" r="2.6" class="fb sb"/><circle cx="373" cy="85" r="2.6" class="fr sr"/><circle cx="515" cy="110" r="2.6" class="fr sr"/><circle cx="475" cy="70" r="2.6" class="fr sr"/><circle cx="432" cy="105" r="2.6" class="fb sb"/><circle cx="515" cy="169" r="2.6" class="fb sb"/><circle cx="572" cy="129" r="2.6" class="fb sb"/><circle cx="498" cy="99" r="2.6" class="fr sr"/><circle cx="355" cy="129" r="2.6" class="fr sr"/><circle cx="557" cy="159" r="2.6" class="fb sb"/><circle cx="491" cy="85" r="2.6" class="fr sr"/><circle cx="394" cy="66" r="2.6" class="fr sr"/><circle cx="454" cy="157" r="2.6" class="fb sb"/><circle cx="353" cy="113" r="2.6" class="fr sr"/><circle cx="368" cy="92" r="2.6" class="fr sr"/><circle cx="433" cy="114" r="2.6" class="fb sb"/><circle cx="566" cy="151" r="2.6" class="fb sb"/><circle cx="495" cy="173" r="2.6" class="fb sb"/><circle cx="528" cy="169" r="2.6" class="fb sb"/><circle cx="428" cy="53" r="2.6" class="fr sr"/><circle cx="487" cy="164" r="2.6" class="fb sb"/><circle cx="515" cy="176" r="2.6" class="fb sb"/><circle cx="562" cy="162" r="2.6" class="fb sb"/><circle cx="519" cy="166" r="2.6" class="fb sb"/><circle cx="577" cy="122" r="2.6" class="fb sb"/><circle cx="476" cy="70" r="2.6" class="fr sr"/><circle cx="583" cy="140" r="2.6" class="fb sb"/><circle cx="453" cy="157" r="2.6" class="fb sb"/><circle cx="429" cy="103" r="2.6" class="fb sb"/><circle cx="430" cy="110" r="2.6" class="fb sb"/><circle cx="392" cy="72" r="2.6" class="fr sr"/><circle cx="461" cy="75" r="2.6" class="fr sr"/><circle cx="454" cy="146" r="2.6" class="fb sb"/><circle cx="502" cy="110" r="2.6" class="fr sr"/><circle cx="576" cy="128" r="2.6" class="fb sb"/><circle cx="549" cy="158" r="2.6" class="fb sb"/><circle cx="364" cy="101" r="2.6" class="fr sr"/><circle cx="443" cy="128" r="2.6" class="fb sb"/><circle cx="437" cy="62" r="2.6" class="fr sr"/><circle cx="514" cy="173" r="2.6" class="fb sb"/><circle cx="543" cy="169" r="2.6" class="fb sb"/><circle cx="480" cy="169" r="2.6" class="fb sb"/><circle cx="592" cy="116" r="2.6" class="fb sb"/><circle cx="495" cy="167" r="2.6" class="fb sb"/><circle cx="434" cy="112" r="2.6" class="fb sb"/><circle cx="432" cy="108" r="2.6" class="fb sb"/><circle cx="484" cy="87" r="2.6" class="fr sr"/><circle cx="406" cy="68" r="2.6" class="fr sr"/><circle cx="550" cy="169" r="2.6" class="fb sb"/><circle cx="450" cy="72" r="2.6" class="fr sr"/><circle cx="444" cy="123" r="2.6" class="fb sb"/><circle cx="587" cy="128" r="2.6" class="fb sb"/><circle cx="375" cy="89" r="2.6" class="fr sr"/><circle cx="502" cy="107" r="2.6" class="fr sr"/><circle cx="500" cy="88" r="2.6" class="fr sr"/><circle cx="359" cy="127" r="2.6" class="fr sr"/><circle cx="503" cy="116" r="2.6" class="fr sr"/><circle cx="465" cy="66" r="2.6" class="fr sr"/><circle cx="422" cy="61" r="2.6" class="fr sr"/><circle cx="382" cy="81" r="2.6" class="fr sr"/><circle cx="441" cy="139" r="2.6" class="fb sb"/><circle cx="466" cy="159" r="2.6" class="fb sb"/><circle cx="432" cy="116" r="2.6" class="fb sb"/><circle cx="519" cy="126" r="2.6" class="fr sr"/><circle cx="398" cy="69" r="2.6" class="fr sr"/><circle cx="443" cy="115" r="2.6" class="fb sb"/><circle cx="458" cy="63" r="2.6" class="fr sr"/><circle cx="434" cy="63" r="2.6" class="fr sr"/><circle cx="353" cy="116" r="2.6" class="fr sr"/><circle cx="473" cy="172" r="2.6" class="fb sb"/><circle cx="565" cy="148" r="2.6" class="fb sb"/><circle cx="581" cy="134" r="2.6" class="fb sb"/><circle cx="488" cy="80" r="2.6" class="fr sr"/><circle cx="569" cy="141" r="2.6" class="fb sb"/><circle cx="512" cy="115" r="2.6" class="fr sr"/><circle cx="384" cy="78" r="2.6" class="fr sr"/><circle cx="501" cy="176" r="2.6" class="fb sb"/><circle cx="510" cy="129" r="2.6" class="fr sr"/><circle cx="436" cy="110" r="2.6" class="fb sb"/><circle cx="364" cy="104" r="2.6" class="fr sr"/><circle cx="497" cy="100" r="2.6" class="fr sr"/><circle cx="490" cy="88" r="2.6" class="fr sr"/><circle cx="429" cy="61" r="2.6" class="fr sr"/><circle cx="591" cy="102" r="2.6" class="fb sb"/><circle cx="485" cy="177" r="2.6" class="fb sb"/><circle cx="505" cy="107" r="2.6" class="fr sr"/><circle cx="555" cy="162" r="2.6" class="fb sb"/><circle cx="536" cy="166" r="2.6" class="fb sb"/><circle cx="569" cy="135" r="2.6" class="fb sb"/><circle cx="417" cy="66" r="2.6" class="fr sr"/><circle cx="458" cy="70" r="2.6" class="fr sr"/><circle cx="501" cy="134" r="2.6" class="fr sr"/><circle cx="527" cy="172" r="2.6" class="fb sb"/><circle cx="393" cy="72" r="2.6" class="fr sr"/><circle cx="452" cy="144" r="2.6" class="fb sb"/><circle cx="417" cy="62" r="2.6" class="fr sr"/><circle cx="513" cy="115" r="2.6" class="fr sr"/><circle cx="466" cy="163" r="2.6" class="fb sb"/><circle cx="462" cy="78" r="2.6" class="fr sr"/><circle cx="490" cy="77" r="2.6" class="fr sr"/><circle cx="507" cy="113" r="2.6" class="fr sr"/><circle cx="427" cy="108" r="2.6" class="fb sb"/><circle cx="476" cy="66" r="2.6" class="fr sr"/><circle cx="602" cy="110" r="2.6" class="fb sb"/><circle cx="522" cy="172" r="2.6" class="fb sb"/><circle cx="358" cy="97" r="2.6" class="fr sr"/><circle cx="473" cy="162" r="2.6" class="fb sb"/><circle cx="457" cy="66" r="2.6" class="fr sr"/><circle cx="452" cy="152" r="2.6" class="fb sb"/><circle cx="505" cy="178" r="2.6" class="fb sb"/><circle cx="352" cy="101" r="2.6" class="fr sr"/><circle cx="489" cy="161" r="2.6" class="fb sb"/><circle cx="559" cy="160" r="2.6" class="fb sb"/><circle cx="477" cy="77" r="2.6" class="fr sr"/><circle cx="375" cy="82" r="2.6" class="fr sr"/><circle cx="355" cy="111" r="2.6" class="fr sr"/><circle cx="589" cy="110" r="2.6" class="fb sb"/><circle cx="492" cy="174" r="2.6" class="fb sb"/><circle cx="353" cy="139" r="2.6" class="fr sr"/><circle cx="379" cy="78" r="2.6" class="fr sr"/><circle cx="536" cy="159" r="2.6" class="fb sb"/><circle cx="382" cy="69" r="2.6" class="fr sr"/><circle cx="504" cy="170" r="2.6" class="fb sb"/><circle cx="395" cy="70" r="2.6" class="fr sr"/><circle cx="495" cy="171" r="2.6" class="fb sb"/><circle cx="433" cy="117" r="2.6" class="fb sb"/><circle cx="490" cy="90" r="2.6" class="fr sr"/><circle cx="443" cy="132" r="2.6" class="fb sb"/><circle cx="371" cy="87" r="2.6" class="fr sr"/><circle cx="516" cy="146" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="405" cy="71" r="2.6" class="fr sr"/><circle cx="581" cy="133" r="2.6" class="fb sb"/><circle cx="402" cy="70" r="2.6" class="fr sr"/><circle cx="587" cy="98" r="2.6" class="fb sb"/><circle cx="555" cy="151" r="2.6" class="fb sb"/><circle cx="530" cy="171" r="2.6" class="fb sb"/><circle cx="450" cy="63" r="2.6" class="fr sr"/><circle cx="473" cy="80" r="2.6" class="fr sr"/><circle cx="470" cy="73" r="2.6" class="fr sr"/><circle cx="415" cy="62" r="2.6" class="fr sr"/><circle cx="590" cy="99" r="2.6" class="fb sb"/><circle cx="355" cy="131" r="2.6" class="fr sr"/><circle cx="482" cy="163" r="2.6" class="fb sb"/><circle cx="504" cy="103" r="2.6" class="fr sr"/><circle cx="542" cy="169" r="2.6" class="fb sb"/><circle cx="351" cy="128" r="2.6" class="fr sr"/><circle cx="343" cy="129" r="2.6" class="fr sr"/><circle cx="420" cy="59" r="2.6" class="fr sr"/><circle cx="444" cy="143" r="2.6" class="fb sb"/><circle cx="389" cy="71" r="2.6" class="fr sr"/><circle cx="475" cy="178" r="2.6" class="fb sb"/><circle cx="360" cy="106" r="2.6" class="fr sr"/><circle cx="572" cy="149" r="2.6" class="fb sb"/><circle cx="592" cy="99" r="2.6" class="fb sb"/><circle cx="463" cy="159" r="2.6" class="fb sb"/><circle cx="506" cy="126" r="2.6" class="fr sr"/><circle cx="435" cy="61" r="2.6" class="fr sr"/><circle cx="471" cy="163" r="2.6" class="fb sb"/><circle cx="408" cy="66" r="2.6" class="fr sr"/><circle cx="438" cy="135" r="2.6" class="fb sb"/><circle cx="365" cy="96" r="2.6" class="fr sr"/><circle cx="345" cy="127" r="2.6" class="fr sr"/><circle cx="563" cy="152" r="2.6" class="fb sb"/><circle cx="579" cy="133" r="2.6" class="fb sb"/><circle cx="353" cy="123" r="2.6" class="fr sr"/><circle cx="567" cy="161" r="2.6" class="fb sb"/><circle cx="407" cy="68" r="2.6" class="fr sr"/><circle cx="417" cy="65" r="2.6" class="fr sr"/><circle cx="584" cy="128" r="2.6" class="fb sb"/><circle cx="509" cy="111" r="2.6" class="fr sr"/><circle cx="367" cy="92" r="2.6" class="fr sr"/><circle cx="384" cy="75" r="2.6" class="fr sr"/><circle cx="492" cy="88" r="2.6" class="fr sr"/><circle cx="458" cy="66" r="2.6" class="fr sr"/><circle cx="433" cy="126" r="2.6" class="fb sb"/><circle cx="526" cy="164" r="2.6" class="fb sb"/><circle cx="446" cy="58" r="2.6" class="fr sr"/><circle cx="516" cy="138" r="2.6" class="fr sr"/><circle cx="360" cy="95" r="2.6" class="fr sr"/><circle cx="580" cy="142" r="2.6" class="fb sb"/><circle cx="450" cy="142" r="2.6" class="fb sb"/><circle cx="483" cy="89" r="2.6" class="fr sr"/><circle cx="385" cy="75" r="2.6" class="fr sr"/><circle cx="358" cy="108" r="2.6" class="fr sr"/><circle cx="423" cy="69" r="2.6" class="fr sr"/><circle cx="504" cy="114" r="2.6" class="fr sr"/><circle cx="564" cy="154" r="2.6" class="fb sb"/><circle cx="525" cy="170" r="2.6" class="fb sb"/><circle cx="484" cy="86" r="2.6" class="fr sr"/><circle cx="356" cy="106" r="2.6" class="fr sr"/><circle cx="456" cy="68" r="2.6" class="fr sr"/><circle cx="560" cy="162" r="2.6" class="fb sb"/><circle cx="350" cy="108" r="2.6" class="fr sr"/><circle cx="498" cy="93" r="2.6" class="fr sr"/><circle cx="445" cy="141" r="2.6" class="fb sb"/><circle cx="441" cy="117" r="2.6" class="fb sb"/><circle cx="428" cy="95" r="2.6" class="fb sb"/><circle cx="546" cy="161" r="2.6" class="fb sb"/><circle cx="471" cy="175" r="2.6" class="fb sb"/><circle cx="504" cy="98" r="2.6" class="fr sr"/><circle cx="493" cy="79" r="2.6" class="fr sr"/><circle cx="361" cy="98" r="2.6" class="fr sr"/><circle cx="445" cy="155" r="2.6" class="fb sb"/><circle cx="580" cy="125" r="2.6" class="fb sb"/><circle cx="575" cy="142" r="2.6" class="fb sb"/><circle cx="352" cy="127" r="2.6" class="fr sr"/><circle cx="574" cy="138" r="2.6" class="fb sb"/><circle cx="440" cy="133" r="2.6" class="fb sb"/><circle cx="393" cy="63" r="2.6" class="fr sr"/><circle cx="472" cy="159" r="2.6" class="fb sb"/><circle cx="547" cy="165" r="2.6" class="fb sb"/><circle cx="368" cy="84" r="2.6" class="fr sr"/><circle cx="567" cy="147" r="2.6" class="fb sb"/><circle cx="442" cy="63" r="2.6" class="fr sr"/><circle cx="496" cy="100" r="2.6" class="fr sr"/><circle cx="440" cy="124" r="2.6" class="fb sb"/><circle cx="586" cy="119" r="2.6" class="fb sb"/><circle cx="442" cy="135" r="2.6" class="fb sb"/><circle cx="581" cy="118" r="2.6" class="fb sb"/><circle cx="481" cy="76" r="2.6" class="fr sr"/><circle cx="466" cy="153" r="2.6" class="fb sb"/><circle cx="406" cy="69" r="2.6" class="fr sr"/><circle cx="436" cy="67" r="2.6" class="fr sr"/><circle cx="422" cy="75" r="2.6" class="fr sr"/><circle cx="542" cy="172" r="2.6" class="fb sb"/><circle cx="581" cy="135" r="2.6" class="fb sb"/><circle cx="483" cy="173" r="2.6" class="fb sb"/><circle cx="518" cy="122" r="2.6" class="fr sr"/><circle cx="461" cy="155" r="2.6" class="fb sb"/><circle cx="553" cy="157" r="2.6" class="fb sb"/><circle cx="452" cy="153" r="2.6" class="fb sb"/><circle cx="373" cy="97" r="2.6" class="fr sr"/><circle cx="477" cy="67" r="2.6" class="fr sr"/><circle cx="439" cy="127" r="2.6" class="fb sb"/><circle cx="475" cy="35" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="358" cy="36" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="411" cy="131" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="575" cy="133" r="2.6" class="fb sb"/><circle cx="487" cy="202" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="552" cy="110" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="417" cy="65" r="2.6" class="fr sr"/><circle cx="408" cy="125" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="354" cy="134" r="2.6" class="fr sr"/><circle cx="376" cy="160" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="551" cy="156" r="2.6" class="fb sb"/><circle cx="466" cy="30" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="618" cy="76" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="484" cy="157" r="2.6" class="fb sb"/><circle cx="363" cy="32" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/>
<line x1="320" y1="26" x2="320" y2="206" stroke="currentColor" stroke-opacity="0.2"/>
<text x="160" y="224" text-anchor="middle" class="tm" font-size="11">straight cut; every junk row forced into a moon</text>
<text x="480" y="224" text-anchor="middle" class="tm" font-size="11">follows each moon; hollow grey circles = noise (−1)</text>
</svg><figcaption>The same 315 rows (300 moon points + 15 junk points, scaled). Colours are the cluster labels each algorithm returned.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span>
    <p>DBSCAN is not "better than K-Means" in general. On round, well-separated blobs of similar size K-Means is faster, simpler and at least as accurate (section 06 shows K-Means winning on blobs). Density methods win when the shapes are odd, when there is noise to throw away, or when you do not know k.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> "crowded" is still a vague word. Is stall E, with only two stalls close by, in a crowd or not? <b>Next: eps, min_samples and the three kinds of point.</b></div>

  <h2 id="db-defs"><span class="num">02</span>The Two Knobs and the Three Kinds of Point</h2>
  <p><strong>The question we can't answer yet.</strong> We want "a cluster is a crowded region", but a computer needs a yes/no test for "this point is in a crowd", and a rule for which crowded points belong together.</p>
  <h3>eps and min_samples</h3>
  <p>DBSCAN turns "crowded" into a count. Draw a circle of radius <strong>eps</strong> (epsilon, a small distance) around a point and count how many points fall inside, the point itself included. If the count reaches <strong>min_samples</strong>, the point lives in a crowded spot. For the stalls we use eps = 1.5 km and min_samples = 4: "a stall is in a crowd if at least 4 stalls, itself included, are within 1.5 km".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>eps-neighbourhood</strong> of a point p: N_eps(p) = { q : dist(p, q) ≤ eps }. It always contains p itself (distance 0).<br><strong>Density</strong> at p, in DBSCAN's sense, is just |N_eps(p)|, the number of points in that ball.</p>
  </div>
  <p>On the stalls: D's 1.5 km circle holds D, A, B, C and E (5 stalls); E's holds E, B and D (3); K's holds only K (1). Section 03 does all twelve.</p>
  <h3>Core, border, noise</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Core point</strong>: |N_eps(p)| ≥ min_samples. It sits in a crowded spot.<br><strong>Border point</strong>: not core itself, but inside the eps-ball of at least one core point. It sits on the edge of a crowd.<br><strong>Noise point</strong>: neither core nor border. Nothing crowded is near it. scikit-learn gives it the label −1.</p>
  </div>
  <p>So D (5 ≥ 4) is core; E (3 &lt; 4) is not core, but it lies inside D's circle, so it is border; K is alone, so it is noise.</p>
  <p>An important convention: in scikit-learn (and in the original paper), min_samples <strong>counts the point itself</strong>. min_samples = 4 means "the point plus at least 3 others". Some books and libraries count only the others; always check before comparing numbers.</p>
  <h3>Reachability and connectivity: how points chain into a cluster</h3>
  <p>A cluster can be long and curved, much wider than one eps-ball. It forms by chaining: a core point "reaches" its neighbours; if one of those neighbours is also core, it reaches its own neighbours, and so on. Formally:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Directly density-reachable</strong>: q is directly reachable from p if p is a core point and q ∈ N_eps(p).<br><strong>Density-reachable</strong>: q is reachable from p if there is a chain p = p₁, p₂, …, pₙ = q where each step is directly reachable (so every point in the chain except possibly the last is core).<br><strong>Density-connected</strong>: p and q are connected if some core point o reaches both of them.<br><strong>Cluster</strong>: a non-empty set C that is <em>maximal</em> (if p ∈ C and q is reachable from p, then q ∈ C) and <em>connected</em> (every pair in C is density-connected). Points in no cluster are noise.</p>
  </div>
  <p>On the stalls: E is directly reachable from D (D is core, E is in D's circle), but D is <em>not</em> directly reachable from E (E is not core, so it cannot start a step). Reachability is <strong>not symmetric</strong>. Now A and E: A reaches D (A core, D in A's circle) and D reaches E, so E is reachable from A. And two border points at opposite ends of a cluster cannot reach each other at all, yet they belong together because one core point in the middle reaches both. "Connected" is the symmetric relation that glues the whole cluster together.</p>
  <div class="cards">
    <div><b>Core</b><p>Crowded. Can start a cluster and pass it on to its neighbours.</p><small>count ≥ min_samples · stalls A B C D F G H I</small></div>
    <div><b>Border</b><p>On the edge of a crowd. Joins a cluster but never spreads it.</p><small>count &lt; min_samples, but near a core · stalls E J</small></div>
    <div><b>Noise</b><p>Alone. Belongs to no cluster.</p><small>label −1 · stalls K L</small></div>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Only core points pass the cluster along. That is what stops DBSCAN from chaining two clusters together through a thin line of stray points (the weakness of single-linkage clustering): a stray point between two groups is at best a border point, and border points are dead ends.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we checked D, E and K; we have not checked every stall or seen the groups appear. <b>Next: label all twelve stalls by hand.</b></div>

  <h2 id="db-hand"><span class="num">03</span>Labelling Points by Hand</h2>
  <p><strong>The question we can't answer yet.</strong> We have the definitions, but which of the 12 stalls are core, border and noise, and which groups do they form?</p>
  <h3>Step 1: the distances that matter</h3>
  <p>On a grid, three distances keep appearing. Side by side (one step across or up): √(1² + 0²) = 1. Diagonal neighbour: √(1² + 1²) = √2 ≈ 1.414. Knight's move (2 across, 1 up): √(2² + 1²) = √5 ≈ 2.236. With eps = 1.5, side and diagonal neighbours count, knight's moves do not.</p>
  <table class="tbl">
    <tr><th>Stall</th><th>Distances to nearby stalls (km)</th><th>Within 1.5?</th><th>Count (incl. itself)</th><th>Type</th></tr>
    <tr><td>A (1,1)</td><td>B 1, C 1, D 1.414, E 2.236</td><td>B, C, D</td><td>4</td><td>core</td></tr>
    <tr><td>B (2,1)</td><td>A 1, D 1, C 1.414, E 1.414</td><td>A, C, D, E</td><td>5</td><td>core</td></tr>
    <tr><td>C (1,2)</td><td>A 1, D 1, B 1.414, E 2</td><td>A, B, D</td><td>4</td><td>core</td></tr>
    <tr><td>D (2,2)</td><td>B 1, C 1, E 1, A 1.414</td><td>A, B, C, E</td><td>5</td><td>core</td></tr>
    <tr><td>E (3,2)</td><td>D 1, B 1.414, C 2, A 2.236</td><td>B, D</td><td>3</td><td><strong>border</strong> (3 &lt; 4, but B and D are core)</td></tr>
    <tr><td>F (6,5)</td><td>G 1, H 1, I 1.414, J 2.828</td><td>G, H, I</td><td>4</td><td>core</td></tr>
    <tr><td>G (7,5)</td><td>F 1, I 1, H 1.414, J 2.236</td><td>F, H, I</td><td>4</td><td>core</td></tr>
    <tr><td>H (6,6)</td><td>F 1, I 1, G 1.414, J 2.236</td><td>F, G, I</td><td>4</td><td>core</td></tr>
    <tr><td>I (7,6)</td><td>G 1, H 1, F 1.414, J 1.414</td><td>F, G, H, J</td><td>5</td><td>core</td></tr>
    <tr><td>J (8,7)</td><td>I 1.414, G 2.236, H 2.236</td><td>I</td><td>2</td><td><strong>border</strong> (I is core)</td></tr>
    <tr><td>K (4,9)</td><td>H 3.606, I 4.243, F 4.472, J 4.472</td><td>none</td><td>1</td><td><strong>noise</strong></td></tr>
    <tr><td>L (10,1)</td><td>G 5, F 5.657, I 5.831</td><td>none</td><td>1</td><td><strong>noise</strong></td></tr>
  </table>
  <p>Read the E row slowly, because it is the subtle one. E has only 3 stalls in its circle (itself, B and D), one short of min_samples = 4, so E is not core. But E lies inside the circles of B and D, which are core, so E is a border point. J is the same story with only I. K and L have nobody within 1.5 km, so no core point can reach them: noise.</p>
  <figure class="viz"><svg viewBox="0 0 640 320" width="640">
<line x1="40" y1="300" x2="40" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="40" y="314" text-anchor="middle" class="tm" font-size="10">0</text>
<line x1="95" y1="300" x2="95" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="95" y="314" text-anchor="middle" class="tm" font-size="10">1</text>
<line x1="150" y1="300" x2="150" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="150" y="314" text-anchor="middle" class="tm" font-size="10">2</text>
<line x1="205" y1="300" x2="205" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="205" y="314" text-anchor="middle" class="tm" font-size="10">3</text>
<line x1="260" y1="300" x2="260" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="260" y="314" text-anchor="middle" class="tm" font-size="10">4</text>
<line x1="315" y1="300" x2="315" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="315" y="314" text-anchor="middle" class="tm" font-size="10">5</text>
<line x1="370" y1="300" x2="370" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="370" y="314" text-anchor="middle" class="tm" font-size="10">6</text>
<line x1="425" y1="300" x2="425" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="425" y="314" text-anchor="middle" class="tm" font-size="10">7</text>
<line x1="480" y1="300" x2="480" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="480" y="314" text-anchor="middle" class="tm" font-size="10">8</text>
<line x1="535" y1="300" x2="535" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="535" y="314" text-anchor="middle" class="tm" font-size="10">9</text>
<line x1="590" y1="300" x2="590" y2="31.19999999999999" stroke="currentColor" stroke-opacity="0.07"/>
<text x="590" y="314" text-anchor="middle" class="tm" font-size="10">10</text>
<line x1="40" y1="300" x2="623.0" y2="300" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="304" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="40" y1="272" x2="623.0" y2="272" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="276" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="40" y1="244" x2="623.0" y2="244" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="248" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="40" y1="216" x2="623.0" y2="216" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="220" text-anchor="end" class="tm" font-size="10">3</text>
<line x1="40" y1="188" x2="623.0" y2="188" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="192" text-anchor="end" class="tm" font-size="10">4</text>
<line x1="40" y1="160" x2="623.0" y2="160" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="164" text-anchor="end" class="tm" font-size="10">5</text>
<line x1="40" y1="132" x2="623.0" y2="132" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="136" text-anchor="end" class="tm" font-size="10">6</text>
<line x1="40" y1="104" x2="623.0" y2="104" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="108" text-anchor="end" class="tm" font-size="10">7</text>
<line x1="40" y1="76" x2="623.0" y2="76" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="80" text-anchor="end" class="tm" font-size="10">8</text>
<line x1="40" y1="48" x2="623.0" y2="48" stroke="currentColor" stroke-opacity="0.07"/>
<text x="32" y="52" text-anchor="end" class="tm" font-size="10">9</text>
<ellipse cx="150.0" cy="244.0" rx="82.5" ry="42.0" fill="none" class="sb" stroke-dasharray="4 3"/>
<ellipse cx="425.0" cy="132.0" rx="82.5" ry="42.0" fill="none" class="sb" stroke-dasharray="4 3"/>
<ellipse cx="205.0" cy="244.0" rx="82.5" ry="42.0" fill="none" class="sg" stroke-dasharray="2 3"/>
<ellipse cx="260.0" cy="48.0" rx="82.5" ry="42.0" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="2 3"/>
<circle cx="95.0" cy="272.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="105.0" y="264.0" font-size="12" font-weight="700">A</text>
<circle cx="150.0" cy="272.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="160.0" y="264.0" font-size="12" font-weight="700">B</text>
<circle cx="95.0" cy="244.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="105.0" y="236.0" font-size="12" font-weight="700">C</text>
<circle cx="150.0" cy="244.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="160.0" y="236.0" font-size="12" font-weight="700">D</text>
<circle cx="205.0" cy="244.0" r="7" class="fg sg" stroke-width="1.5"/>
<text x="215.0" y="236.0" font-size="12" font-weight="700">E</text>
<circle cx="370.0" cy="160.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="380.0" y="152.0" font-size="12" font-weight="700">F</text>
<circle cx="425.0" cy="160.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="435.0" y="152.0" font-size="12" font-weight="700">G</text>
<circle cx="370.0" cy="132.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="380.0" y="124.0" font-size="12" font-weight="700">H</text>
<circle cx="425.0" cy="132.0" r="7" class="fb sb" stroke-width="1.5"/>
<text x="435.0" y="124.0" font-size="12" font-weight="700">I</text>
<circle cx="480.0" cy="104.0" r="7" class="fg sg" stroke-width="1.5"/>
<text x="490.0" y="96.0" font-size="12" font-weight="700">J</text>
<circle cx="260.0" cy="48.0" r="7" class="fs" stroke="currentColor"/>
<text x="270.0" y="40.0" font-size="12" font-weight="700">K</text>
<circle cx="590.0" cy="272.0" r="7" class="fs" stroke="currentColor"/>
<text x="600.0" y="264.0" font-size="12" font-weight="700">L</text>
<rect x="50" y="36" width="180" height="66" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.3"/>
<circle cx="66" cy="52" r="6" class="fb sb"/><text x="78" y="56" font-size="11.5">core (count ≥ 4)</text>
<circle cx="66" cy="70" r="6" class="fg sg"/><text x="78" y="74" font-size="11.5">border (near a core)</text>
<circle cx="66" cy="88" r="6" class="fs" stroke="currentColor"/><text x="78" y="92" font-size="11.5">noise (near no core)</text>
</svg><figcaption>The 12 tea stalls (grid units = km). Dashed rings are eps = 1.5 km around D and I (blue, both core), E (green, border: only 3 stalls inside) and K (grey, noise: alone). The rings look oval only because the two axes are drawn at different scales.</figcaption></figure>
  <h3>Step 2: chain the core points into clusters</h3>
  <p>A, B, C, D are core and each lies in another's circle, so they chain into one cluster; E hangs on as its border. F, G, H, I chain into a second cluster; J hangs on as its border. The closest pair across the two markets, E and F, are √(3² + 3²) = 4.243 km apart, far more than eps, so the markets stay separate. Result: cluster 0 = {A, B, C, D, E}, cluster 1 = {F, G, H, I, J}, noise = {K, L}. Exactly the answer we wanted by eye, and nobody asked for two clusters.</p>
  <h3>Check it in code</h3>
  <p>The code builds the full 12 × 12 distance matrix with numpy broadcasting (<code>P[:, None, :] - P[None, :, :]</code> subtracts every point from every other point), marks which pairs are within eps, counts each row, and applies the three definitions.</p>
  <div class="fx" data-lang="py">eps, min_samples = 1.5, 4

D = np.sqrt(((P[:, None, :] - P[None, :, :]) ** 2).sum(-1))   # every pairwise distance
N = D &lt;= eps                        # N[i, j] is True if j lies in i's eps-neighbourhood
count = N.sum(1)                    # neighbourhood size, the point itself included
core = count &gt;= min_samples
for i, nm in enumerate(names):
    others = "".join(names[j] for j in np.where(N[i])[0] if j != i)
    kind = "core" if core[i] else ("border" if N[i][core].any() else "noise")
    print(f"{nm} ({P[i,0]:.0f},{P[i,1]:.0f})  others within eps: {others or '-':5s} count={count[i]}  -&gt; {kind}")</div>
  <div class="fx" data-lang="text">A (1,1)  others within eps: BCD   count=4  -&gt; core
B (2,1)  others within eps: ACDE  count=5  -&gt; core
C (1,2)  others within eps: ABD   count=4  -&gt; core
D (2,2)  others within eps: ABCE  count=5  -&gt; core
E (3,2)  others within eps: BD    count=3  -&gt; border
F (6,5)  others within eps: GHI   count=4  -&gt; core
G (7,5)  others within eps: FHI   count=4  -&gt; core
H (6,6)  others within eps: FGI   count=4  -&gt; core
I (7,6)  others within eps: FGHJ  count=5  -&gt; core
J (8,7)  others within eps: I     count=2  -&gt; border
K (4,9)  others within eps: -     count=1  -&gt; noise
L (10,1)  others within eps: -     count=1  -&gt; noise</div>
  <p>Every row matches the hand table. Now the same data through scikit-learn. <code>labels_</code> holds the cluster of each point and <code>core_sample_indices_</code> lists which rows were core:</p>
  <div class="fx" data-lang="py">db = DBSCAN(eps=1.5, min_samples=4).fit(P)
print("labels:", " ".join(f"{n}={l}" for n, l in zip(names, db.labels_)))
print("core  :", "".join(names[i] for i in db.core_sample_indices_))</div>
  <div class="fx" data-lang="text">labels: A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=-1 L=-1
core  : ABCDFGHI</div>
  <p>Same answer: E and J are in their clusters but are not in the core list, K and L are −1.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two easy slips by hand. (1) Forgetting to count the point itself: E has 2 <em>other</em> stalls nearby, and 3 including itself; comparing the wrong number with min_samples flips its type. (2) Calling a border point noise because it is not dense: a point with a small count is noise only if no core point has it in its circle.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> by hand we simply "saw" which core points chain together. A program on a million rows needs a systematic way to grow each cluster. <b>Next: the expansion procedure.</b></div>

  <h2 id="db-expand"><span class="num">04</span>The Expansion Procedure</h2>
  <p><strong>The question we can't answer yet.</strong> Section 03 says <em>what</em> the clusters are. How does an algorithm <em>find</em> them, visiting each point a limited number of times?</p>
  <h3>Plain words</h3>
  <p>Think of spreading news through a crowd. Pick a person standing in a crowded spot who has not heard the news yet: a new cluster starts. Everyone within arm's reach hears it and joins the cluster. Anyone among them who is also standing in a crowded spot passes it on to the people within their reach. People standing alone on the edge hear it but tell nobody. When no one new hears it, that cluster is finished; look for another crowded person who has not heard anything, and start the next cluster.</p>
  <div class="flow"><span>Compute every eps-neighbourhood</span><span>Mark core points</span><span>Next unlabelled core point → new cluster</span><span>Flood-fill: neighbours join; core ones spread</span><span>Leftovers = noise (−1)</span></div>
  <h3>Pseudocode</h3>
  <ol>
    <li>For every point p, find N_eps(p). Mark p as core if |N_eps(p)| ≥ min_samples.</li>
    <li>Set every label to −1 and a cluster counter c = 0.</li>
    <li>For each point i in row order: if i is already labelled or is not core, skip it. Otherwise give i label c and put it in a queue.</li>
    <li>While the queue is not empty: take out a point p. For every q in N_eps(p) that is still −1, give q label c; if q is core, add q to the queue.</li>
    <li>When the queue is empty, c = c + 1 and continue step 3.</li>
  </ol>
  <h3>Traced by hand on the twelve stalls</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Take out</th><th>Its neighbours still −1</th><th>They get</th><th>Queue after</th></tr>
    <tr><td>start</td><td colspan="4">A is the first unlabelled core point → cluster 0 starts, queue = [A]</td></tr>
    <tr><td>1</td><td>A</td><td>B, C, D</td><td>0 (all core → queued)</td><td>B C D</td></tr>
    <tr><td>2</td><td>B</td><td>E (A, C, D already 0)</td><td>0 (E is border → not queued)</td><td>C D</td></tr>
    <tr><td>3</td><td>C</td><td>none</td><td>–</td><td>D</td></tr>
    <tr><td>4</td><td>D</td><td>none (E already has label 0)</td><td>–</td><td>empty → cluster 0 done</td></tr>
    <tr><td>start</td><td colspan="4">B, C, D, E are labelled; F is the next unlabelled core → cluster 1, queue = [F]</td></tr>
    <tr><td>5</td><td>F</td><td>G, H, I</td><td>1 (all core)</td><td>G H I</td></tr>
    <tr><td>6–7</td><td>G, H</td><td>none</td><td>–</td><td>I</td></tr>
    <tr><td>8</td><td>I</td><td>J</td><td>1 (border)</td><td>empty → cluster 1 done</td></tr>
    <tr><td>end</td><td colspan="4">J is labelled; K and L are not core and were never reached → stay −1</td></tr>
  </table>
  <h3>From scratch, matching scikit-learn</h3>
  <p>The function below is the pseudocode line by line. <code>neigh[i]</code> is the eps-neighbourhood of point i. The <code>deque</code> is a first-in-first-out queue. When <code>names</code> is passed it prints one line per point taken out of the queue, so you can compare it with the hand trace.</p>
  <div class="fx" data-lang="py">from collections import deque

def dbscan_scratch(X, eps, min_samples, names=None):
    n = len(X)
    D = np.sqrt(((X[:, None, :] - X[None, :, :]) ** 2).sum(-1))
    neigh = [np.where(D[i] &lt;= eps)[0] for i in range(n)]      # eps-neighbourhoods (self included)
    core = np.array([len(nb) &gt;= min_samples for nb in neigh])
    labels = np.full(n, -1)                                   # everyone starts as "noise / unvisited"
    c = 0
    for i in range(n):
        if labels[i] != -1 or not core[i]:
            continue                                          # only an unlabelled CORE point starts a cluster
        labels[i] = c
        queue = deque([i])
        while queue:                                          # expand: breadth-first over core points
            p = queue.popleft()
            new = [q for q in neigh[p] if labels[q] == -1]
            for q in new:
                labels[q] = c                                 # core or border: joins cluster c
                if core[q]:
                    queue.append(q)                           # only core points spread the cluster further
            if names:
                print(f"  cluster {c}: pop {names[p]} -&gt; claims {''.join(names[q] for q in new) or '-':5s}"
                      f" queue now {''.join(names[q] for q in queue) or 'empty'}")
        c += 1
    return labels

lab = dbscan_scratch(P, 1.5, 4, names)
print("scratch:", lab)
print("sklearn:", DBSCAN(eps=1.5, min_samples=4).fit_predict(P))</div>
  <div class="fx" data-lang="text">  cluster 0: pop A -&gt; claims BCD   queue now BCD
  cluster 0: pop B -&gt; claims E     queue now CD
  cluster 0: pop C -&gt; claims -     queue now D
  cluster 0: pop D -&gt; claims -     queue now empty
  cluster 1: pop F -&gt; claims GHI   queue now GHI
  cluster 1: pop G -&gt; claims -     queue now HI
  cluster 1: pop H -&gt; claims -     queue now I
  cluster 1: pop I -&gt; claims J     queue now empty
scratch: [ 0  0  0  0  0  1  1  1  1  1 -1 -1]
sklearn: [ 0  0  0  0  0  1  1  1  1  1 -1 -1]</div>
  <p>The printed steps are exactly the hand table, and the labels match scikit-learn. On a bigger test, the 315 moon-and-junk rows from section 01:</p>
  <div class="fx" data-lang="py">lab_s = dbscan_scratch(X, 0.3, 5)
lab_k = DBSCAN(eps=0.3, min_samples=5).fit_predict(X)
print("identical to sklearn on the 315 moon rows:", np.array_equal(lab_s, lab_k))</div>
  <div class="fx" data-lang="text">identical to sklearn on the 315 moon rows: True</div>
  <h3>Is DBSCAN deterministic?</h3>
  <p>Almost. Core points and noise points never depend on the order of the rows: being core is a count, and being noise means no core point is near. The only order-dependent thing is a <strong>border point that lies within eps of core points from two different clusters</strong>. It can only take one label, and it takes the label of whichever cluster's flood-fill reaches it first. Our stalls have no such point (E only touches the station market, J only the college market), so here is a tiny one-dimensional example: two groups at 0–1 and 4–5, and one point at 2.5 that is exactly eps = 1.5 away from the core point 1 and from the core point 4.</p>
  <div class="fx" data-lang="py">x1 = np.array([0, 0.5, 1, 2.5, 4, 4.5, 5])[:, None]      # the row at 2.5 sits between two groups
for order in ([0, 1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1, 0]):
    lab = DBSCAN(eps=1.5, min_samples=4).fit_predict(x1[order])
    pos = order.index(3)
    print("row order", order, "-&gt; labels", lab, "| the 2.5 row gets", lab[pos],
          "| it joined the group containing", x1[order][lab == lab[pos]].ravel().tolist())</div>
  <div class="fx" data-lang="text">row order [0, 1, 2, 3, 4, 5, 6] -&gt; labels [0 0 0 0 1 1 1] | the 2.5 row gets 0 | it joined the group containing [0.0, 0.5, 1.0, 2.5]
row order [6, 5, 4, 3, 2, 1, 0] -&gt; labels [0 0 0 0 1 1 1] | the 2.5 row gets 0 | it joined the group containing [5.0, 4.5, 4.0, 2.5]</div>
  <p>With the rows in their natural order, the left group is found first and the 2.5 point joins it. Reverse the rows, and the right group (now listed first) claims it instead. Only this one point changed sides; everything else is identical.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>DBSCAN output = the density-connected groups of core points (unique), plus each border point attached to one of the clusters whose core points reach it (order-dependent if several do), plus noise (unique). A variant called <strong>DBSCAN*</strong> drops border points entirely (treats them as noise), which makes the result fully deterministic; HDBSCAN builds on DBSCAN*.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A cluster can contain points that are much more than eps apart. A and E are 2.236 km apart with eps = 1.5, yet both are in cluster 0, because the chain A → D → E links them. In the moons, the two tips of one moon are many times eps apart. eps is the size of one step, not the size of a cluster.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we chose eps = 1.5 km and min_samples = 4 by looking at a map. On real data with 20 columns nobody can look. <b>Next: choosing eps and min_samples with the k-distance plot.</b></div>

  <h2 id="db-eps"><span class="num">05</span>Choosing eps and min_samples</h2>
  <p><strong>The question we can't answer yet.</strong> The whole result depends on eps and min_samples. Where should they come from when we cannot see the data?</p>
  <h3>min_samples first</h3>
  <p>min_samples decides how much evidence a point needs to count as "crowded". Common guidance:</p>
  <ul>
    <li><strong>At least d + 1</strong> for d features. With min_samples = 1 every point is core and DBSCAN becomes plain single-linkage clustering cut at eps (no noise at all); with 2 it is almost the same.</li>
    <li><strong>About 2 · d</strong> is the usual starting point. Our stalls have d = 2, so 4 is exactly the rule of thumb (it is also what the original authors suggested for 2-D data).</li>
    <li><strong>Larger</strong> for noisy or large data sets: more evidence is needed before a region counts as a crowd, so more stray points become noise and small accidental clusters disappear.</li>
  </ul>
  <h3>The k-distance idea</h3>
  <p>Once min_samples = k is fixed, look at each point's distance to its k-th nearest neighbour, counting the point itself as the first. Call it the point's <strong>k-distance</strong>. Here is the key link: <strong>a point is core exactly when its k-distance ≤ eps</strong>, because "the k-th closest point is within eps" means "at least k points are within eps". So if you sort all the k-distances, you see at a glance what fraction of points would be core for any eps you might pick.</p>
  <p>Inside a cluster, points have small, similar k-distances. Noise points sit far from everything and have large ones. Sorted, the curve stays low and flat for crowded points and then shoots up for the lonely ones. eps should go at the bend (the "knee" or "elbow").</p>
  <h3>By hand on the twelve stalls (k = 4)</h3>
  <p>For each stall, list the distances to the others from smallest up (they are already in the section 03 table); the k-distance is the 3rd one, because the stall itself is the 1st neighbour at distance 0.</p>
  <table class="tbl">
    <tr><th>Stall</th><th>Sorted distances to others</th><th>3rd other = 4-distance</th><th>≤ 1.5 → core?</th></tr>
    <tr><td>D</td><td>1, 1, 1, 1.414 …</td><td>1.000</td><td>yes</td></tr>
    <tr><td>A, B, C, F, G, H, I</td><td>1, 1, 1.414 …</td><td>1.414</td><td>yes</td></tr>
    <tr><td>E</td><td>1, 1.414, 2 …</td><td>2.000</td><td>no</td></tr>
    <tr><td>J</td><td>1.414, 2.236, 2.236</td><td>2.236</td><td>no</td></tr>
    <tr><td>K</td><td>3.606, 4.243, 4.472</td><td>4.472</td><td>no</td></tr>
    <tr><td>L</td><td>5, 5.657, 5.831</td><td>5.831</td><td>no</td></tr>
  </table>
  <p>Sorted: 1.0, then seven values of 1.414, then 2.0, 2.236, 4.472, 5.831. The knee is between 1.414 and 2.0, so any eps in [1.414, 2.0) gives the same core points; our 1.5 sits inside that range. Notice that the k-distance plot does not tell border from noise (E and K both have large k-distances); that is decided afterwards by whether a core point is nearby.</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import NearestNeighbors
dist, _ = NearestNeighbors(n_neighbors=4).fit(P).kneighbors(P)   # 4 = min_samples; column 0 is the point itself
kd = dist[:, -1]                                                  # distance to the 3rd OTHER point
for nm, v in sorted(zip(names, kd), key=lambda t: t[1]):
    print(f"{nm}: {v:.3f}", end="   ")
print()</div>
  <div class="fx" data-lang="text">D: 1.000   A: 1.414   B: 1.414   C: 1.414   F: 1.414   G: 1.414   H: 1.414   I: 1.414   E: 2.000   J: 2.236   K: 4.472   L: 5.831   </div>
  <p><code>NearestNeighbors(n_neighbors=4).kneighbors(P)</code> returns, for each training point, its 4 nearest points; since the query points are the training points, the first one is the point itself at distance 0. That is why <code>n_neighbors = min_samples</code> gives exactly DBSCAN's convention. Keep this column of numbers in mind: in section 08 the very same numbers come back under the name "core distance".</p>
  <h3>What different eps values do to the stalls</h3>
  <div class="fx" data-lang="py">for e in (1.0, 1.5, 2.0, 2.5, 4.5):
    lab = DBSCAN(eps=e, min_samples=4).fit_predict(P)
    print(f"eps={e:&lt;4}", " ".join(f"{n}={l:2d}" for n, l in zip(names, lab)))</div>
  <div class="fx" data-lang="text">eps=1.0  A=-1 B= 0 C= 0 D= 0 E= 0 F=-1 G=-1 H=-1 I=-1 J=-1 K=-1 L=-1
eps=1.5  A= 0 B= 0 C= 0 D= 0 E= 0 F= 1 G= 1 H= 1 I= 1 J= 1 K=-1 L=-1
eps=2.0  A= 0 B= 0 C= 0 D= 0 E= 0 F= 1 G= 1 H= 1 I= 1 J= 1 K=-1 L=-1
eps=2.5  A= 0 B= 0 C= 0 D= 0 E= 0 F= 1 G= 1 H= 1 I= 1 J= 1 K=-1 L=-1
eps=4.5  A= 0 B= 0 C= 0 D= 0 E= 0 F= 0 G= 0 H= 0 I= 0 J= 0 K= 0 L=-1</div>
  <table class="tbl">
    <tr><th>eps</th><th>What happened</th><th>Read from the k-distances</th></tr>
    <tr><td>1.0</td><td>Only D is core (its 4-distance is 1.0). Cluster 0 = D plus B, C, E; A and the whole college market become noise.</td><td>Below the plateau of 1.414: almost nothing is core</td></tr>
    <tr><td>1.5, 2.0</td><td>The right answer: two markets, K and L noise</td><td>Just above the plateau</td></tr>
    <tr><td>2.5</td><td>Same labels, but now E (2.0) and J (2.236) are core too</td><td>Still below K's 4.472</td></tr>
    <tr><td>4.5</td><td>E–F (4.243) is now within eps: the two markets merge, K (4.472) joins; only L is noise</td><td>Past the knee: too big</td></tr>
  </table>
  <h3>On the moons</h3>
  <p>For a larger set we sort the 315 k-distances (k = 5) and find the knee automatically with a simple rule: draw a straight line from the first to the last point of the sorted curve and take the point farthest below that line.</p>
  <div class="fx" data-lang="py">dist, _ = NearestNeighbors(n_neighbors=5).fit(X).kneighbors(X)
kd = np.sort(dist[:, -1])                       # the sorted k-distance curve (k = min_samples = 5)
print("percentiles 50/80/90/95/98:", np.percentile(kd, [50, 80, 90, 95, 98]).round(3))

# knee = point of the curve farthest from the straight line joining its two ends
i = np.arange(len(kd))
line = kd[0] + (kd[-1] - kd[0]) * i / (len(kd) - 1)
knee = np.argmax(line - kd)
print("knee at row", knee, "of", len(kd), "-&gt; eps about", round(kd[knee], 3))</div>
  <div class="fx" data-lang="text">percentiles 50/80/90/95/98: [0.116 0.153 0.177 0.258 0.659]
knee at row 296 of 315 -&gt; eps about 0.202</div>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
<line x1="60" y1="190" x2="560" y2="190" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="190" stroke="currentColor"/>
<line x1="60" y1="190" x2="560" y2="190" stroke="currentColor" stroke-opacity="0.1"/><text x="54" y="194" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="60" y1="151" x2="560" y2="151" stroke="currentColor" stroke-opacity="0.1"/><text x="54" y="155" text-anchor="end" class="tm" font-size="10">0.25</text>
<line x1="60" y1="113" x2="560" y2="113" stroke="currentColor" stroke-opacity="0.1"/><text x="54" y="117" text-anchor="end" class="tm" font-size="10">0.5</text>
<line x1="60" y1="74" x2="560" y2="74" stroke="currentColor" stroke-opacity="0.1"/><text x="54" y="78" text-anchor="end" class="tm" font-size="10">0.75</text>
<line x1="60" y1="35" x2="560" y2="35" stroke="currentColor" stroke-opacity="0.1"/><text x="54" y="39" text-anchor="end" class="tm" font-size="10">1.0</text>
<polyline points="60.0,181.1 64.8,180.0 69.6,179.9 74.3,179.4 79.1,178.9 83.9,178.7 88.7,178.3 93.4,178.0 98.2,177.6 103.0,177.5 107.8,177.4 112.5,177.0 117.3,176.9 122.1,176.7 126.9,176.6 131.7,176.4 136.4,176.2 141.2,176.0 146.0,175.8 150.8,175.7 155.5,175.7 160.3,175.5 165.1,175.4 169.9,175.2 174.6,174.9 179.4,174.9 184.2,174.7 189.0,174.6 193.8,174.5 198.5,174.4 203.3,174.3 208.1,174.2 212.9,174.0 217.6,174.0 222.4,173.9 227.2,173.8 232.0,173.7 236.8,173.7 241.5,173.6 246.3,173.5 251.1,173.4 255.9,173.3 260.6,173.1 265.4,172.9 270.2,172.8 275.0,172.7 279.7,172.6 284.5,172.5 289.3,172.4 294.1,172.4 298.9,172.2 303.6,172.1 308.4,172.0 313.2,171.8 318.0,171.7 322.7,171.6 327.5,171.5 332.3,171.2 337.1,170.9 341.8,170.7 346.6,170.4 351.4,170.3 356.2,170.2 361.0,170.1 365.7,170.0 370.5,169.8 375.3,169.7 380.1,169.6 384.8,169.5 389.6,169.3 394.4,169.2 399.2,168.9 403.9,168.7 408.7,168.6 413.5,168.4 418.3,168.3 423.1,168.1 427.8,167.9 432.6,167.6 437.4,167.4 442.2,167.3 446.9,167.0 451.7,167.0 456.5,166.4 461.3,166.3 466.1,166.3 470.8,166.0 475.6,165.8 480.4,165.7 485.2,165.4 489.9,165.1 494.7,164.3 499.5,164.0 504.3,163.5 509.0,162.8 513.8,161.4 518.6,160.8 523.4,160.3 528.2,159.5 532.9,151.5 537.7,148.9 542.5,140.8 547.3,119.7 552.0,76.2 556.8,55.9 560.0,30.6" fill="none" class="sb" stroke-width="2.2"/>
<line x1="60" y1="159" x2="560" y2="159" class="sr" stroke-dasharray="5 4"/>
<circle cx="531" cy="159" r="5" class="fr sr"/><text x="523" y="149" text-anchor="end" class="tr" font-size="11.5">knee ≈ 0.20 → eps</text>
<text x="310.0" y="208" text-anchor="middle" class="tm" font-size="11">rows sorted by their 5-distance (315 rows)</text>
<text x="72" y="32" class="tm" font-size="11">distance to 5th neighbour (self counted)</text>
<text x="554" y="130" text-anchor="end" class="tm" font-size="11">junk rows: far from everyone</text>
</svg><figcaption>The sorted k-distance curve on the moons-plus-junk data. Flat for crowded rows, then a sharp rise for the lonely ones. eps goes at the bend.</figcaption></figure>
  <p>Half the points have a 5-distance of 0.116 or less; 95% are below 0.258; then the curve rockets (98th percentile 0.659) because of the junk rows. The automatic knee lands at 0.202. Treat the knee as the <em>lower end</em> of a search range, then try a few values above it and look at the result. A grid of eps and min_samples shows what each choice does:</p>
  <div class="fx" data-lang="py">print("eps   min_samples=3          min_samples=5          min_samples=10")
for e in (0.1, 0.2, 0.3, 0.5, 0.8):
    row = []
    for m in (3, 5, 10):
        l = DBSCAN(eps=e, min_samples=m).fit_predict(X)
        row.append(f"k={len(set(l) - {-1}):2d} noise={(l == -1).sum():3d}  ")
    print(f"{e:&lt;5}", " ".join(row))</div>
  <div class="fx" data-lang="text">eps   min_samples=3          min_samples=5          min_samples=10
0.1   k=33 noise= 50   k=21 noise=158   k= 0 noise=315  
0.2   k= 2 noise= 13   k= 3 noise= 14   k= 9 noise= 43  
0.3   k= 2 noise= 10   k= 2 noise= 11   k= 2 noise= 12  
0.5   k= 1 noise=  7   k= 1 noise=  7   k= 2 noise=  7  
0.8   k= 1 noise=  2   k= 1 noise=  2   k= 1 noise=  3  </div>
  <p>Read it column by column. With min_samples = 5: eps = 0.1 shatters the data into 21 little clusters and 158 noise points (most points are not core); eps = 0.2 (the knee) gives 3 clusters (one moon tip is cut off); eps = 0.3 gives the right 2 clusters with 11 noise points; eps = 0.5 and above bridges the two moons into one (for min_samples 3 and 5). min_samples = 3 is more forgiving (at eps = 0.1 only 50 rows are noise, spread over 33 tiny clusters); min_samples = 10 is more demanding (at eps = 0.1 nothing is core, so all 315 rows are noise, and at 0.2 there are still 9 fragments). In the 0.3 row all three settings agree on 2 clusters: a region of the grid where the answer does not change when you nudge the knobs is a good sign, just like the range 1.5–2.0 for the stalls.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>eps is measured in the units of your features. For the stalls it is kilometres. After <code>StandardScaler</code>, 0.3 means "0.3 standard deviations". Without scaling, a feature measured in rupees and one measured in years would need completely different radii, and one eps cannot serve both. Scale first (see <a class="xref" data-note="ml_features">Feature Engineering</a>), then choose eps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The k-distance plot is computed with one fixed min_samples. If you change min_samples, recompute the plot; the knee moves (bigger k → larger k-distances → larger eps).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we can now run DBSCAN well. But is it really better than K-Means in general, or only on the stalls and the moons? <b>Next: shapes and noise, head to head.</b></div>

  <h2 id="db-shapes"><span class="num">06</span>Arbitrary Shapes and Noise vs K-Means</h2>
  <p><strong>The question we can't answer yet.</strong> On the stalls DBSCAN gave the right two markets and flagged K and L, while K-Means forced them in. Does that advantage hold on other shapes, and where does K-Means still win?</p>
  <p>Three classic data sets, each scaled, each clustered by K-Means (given the true k) and by DBSCAN (eps = 0.3, min_samples = 5, the same settings everywhere):</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_circles, make_blobs
from sklearn.cluster import HDBSCAN
sets = {
    "moons":   make_moons(n_samples=400, noise=0.06, random_state=0),
    "circles": make_circles(n_samples=400, noise=0.05, factor=0.45, random_state=0),
    "blobs":   make_blobs(n_samples=400, centers=3, cluster_std=0.6, random_state=2),
}
print(f"{'data':8s} {'KMeans ARI':&gt;10s} {'DBSCAN ARI':&gt;10s} {'DBSCAN k':&gt;8s} {'noise':&gt;5s}")
for name, (Xd, yd) in sets.items():
    Xd = StandardScaler().fit_transform(Xd)
    k = len(set(yd))
    a = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(Xd)
    b = DBSCAN(eps=0.3, min_samples=5).fit_predict(Xd)
    print(f"{name:8s} {adjusted_rand_score(yd, a):10.3f} {adjusted_rand_score(yd, b):10.3f} "
          f"{len(set(b) - {-1}):8d} {(b == -1).sum():5d}")</div>
  <div class="fx" data-lang="text">data     KMeans ARI DBSCAN ARI DBSCAN k noise
moons         0.475      1.000        2     0
circles      -0.003      1.000        2     0
blobs         0.985      0.952        3     5</div>
  <table class="tbl">
    <tr><th>Data</th><th>What it looks like</th><th>K-Means</th><th>DBSCAN</th><th>Why</th></tr>
    <tr><td>stalls</td><td>two square markets + 2 loners</td><td>groups right, loners forced in</td><td><strong>groups right, loners = noise</strong></td><td>K-Means has no noise label</td></tr>
    <tr><td>moons</td><td>two interlocking half-circles</td><td>0.475</td><td><strong>1.000</strong></td><td>a straight cut cannot separate them; chaining follows each curve</td></tr>
    <tr><td>circles</td><td>a small ring inside a big ring</td><td>−0.003</td><td><strong>1.000</strong></td><td>both rings have the same centre, so K-Means has nothing to work with; chaining follows each ring</td></tr>
    <tr><td>blobs</td><td>three round clouds</td><td><strong>0.985</strong></td><td>0.952</td><td>K-Means' home ground; DBSCAN calls 5 edge points noise, which costs it a little</td></tr>
  </table>
  <p>K-Means gets a <em>negative</em> ARI on the circles: slightly worse than random labelling. It cut both rings in half with one straight line. DBSCAN is perfect on both curved data sets with no k given. On the blobs, K-Means wins slightly: the points DBSCAN called noise are really cluster members in thin outer regions.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>K-Means is like drawing school catchment areas: everyone goes to the nearest school, so the boundaries are straight lines between schools. DBSCAN is like tracing a river: you follow the water wherever it bends, and dry land is left out.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling every noise point an anomaly. DBSCAN's −1 means "not in a dense region at this eps", which includes legitimate rows at the thin edges of clusters (the 5 blob points above). For anomaly detection proper, a dedicated method (Isolation Forest, Local Outlier Factor, or HDBSCAN's outlier scores) usually works better.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> both stall markets had the same density, and so did the moons and rings. What if one cluster is tight and another is loose? <b>Next: the varying-density problem.</b></div>

  <h2 id="db-varying"><span class="num">07</span>The Varying-Density Problem</h2>
  <p><strong>The question we can't answer yet.</strong> DBSCAN uses <em>one</em> eps for the whole map. Can one radius be right for a packed city centre and a spread-out suburb at the same time?</p>
  <h3>Seen on the stalls</h3>
  <p>Look again at the eps table of section 05. At eps = 1.0 the station market partly survives (D is extra-crowded: four stalls within 1 km) while the college market disappears completely: all its stalls became noise, although by eye it is just as much a market. Two groups differing only slightly in tightness already get very different treatment from one radius. Real data is far less kind.</p>
  <h3>At scale</h3>
  <p>Three clouds: a tight one (spread 0.3, 300 points), a loose one (spread 1.5, 300 points) and a medium one (spread 0.6, 100 points).</p>
  <div class="fx" data-lang="py">Xv, yv = make_blobs(n_samples=[300, 300, 100], centers=[[0, 0], [6, 0], [3, 5]],
                    cluster_std=[0.3, 1.5, 0.6], random_state=1)          # tight, loose, medium
for e in (0.2, 0.4, 0.7, 1.0, 1.5):
    l = DBSCAN(eps=e, min_samples=5).fit_predict(Xv)
    print(f"DBSCAN eps={e:&lt;4} clusters={len(set(l) - {-1}):2d} noise={(l == -1).sum():3d} "
          f"ARI={adjusted_rand_score(yv, l):.3f}")
h = HDBSCAN(min_cluster_size=20, copy=True).fit(Xv)
l = h.labels_
print(f"HDBSCAN min_cluster_size=20  clusters={len(set(l) - {-1})} noise={(l == -1).sum()} "
      f"ARI={adjusted_rand_score(yv, l):.3f}")</div>
  <div class="fx" data-lang="text">DBSCAN eps=0.2  clusters=13 noise=288 ARI=0.704
DBSCAN eps=0.4  clusters= 5 noise= 95 ARI=0.796
DBSCAN eps=0.7  clusters= 3 noise= 16 ARI=0.952
DBSCAN eps=1.0  clusters= 2 noise=  8 ARI=0.334
DBSCAN eps=1.5  clusters= 1 noise=  0 ARI=0.000
HDBSCAN min_cluster_size=20  clusters=3 noise=30 ARI=0.913</div>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<text x="160" y="16" text-anchor="middle" font-size="12.5">DBSCAN, eps = 0.4</text>
<text x="480" y="16" text-anchor="middle" font-size="12.5">HDBSCAN, min_cluster_size = 20</text>
<circle cx="44" cy="136" r="2.2" class="fb sb"/><circle cx="36" cy="138" r="2.2" class="fb sb"/><circle cx="193" cy="111" r="2.2" class="fr sr"/><circle cx="114" cy="50" r="2.2" class="fg sg"/><circle cx="45" cy="144" r="2.2" class="fb sb"/><circle cx="47" cy="136" r="2.2" class="fb sb"/><circle cx="42" cy="138" r="2.2" class="fb sb"/><circle cx="166" cy="132" r="2.2" class="fr sr"/><circle cx="194" cy="116" r="2.2" class="fr sr"/><circle cx="126" cy="53" r="2.2" class="fg sg"/><circle cx="35" cy="133" r="2.2" class="fb sb"/><circle cx="46" cy="138" r="2.2" class="fb sb"/><circle cx="53" cy="134" r="2.2" class="fb sb"/><circle cx="176" cy="167" r="2.2" class="fr sr"/><circle cx="44" cy="132" r="2.2" class="fb sb"/><circle cx="195" cy="141" r="2.2" class="fr sr"/><circle cx="107" cy="53" r="2.2" class="fg sg"/><circle cx="185" cy="128" r="2.2" class="fr sr"/><circle cx="41" cy="140" r="2.2" class="fb sb"/><circle cx="124" cy="57" r="2.2" class="fg sg"/><circle cx="136" cy="142" r="2.2" class="fr sr"/><circle cx="42" cy="128" r="2.2" class="fb sb"/><circle cx="233" cy="129" r="2.2" class="fr sr"/><circle cx="103" cy="55" r="2.2" class="fg sg"/><circle cx="40" cy="135" r="2.2" class="fb sb"/><circle cx="54" cy="142" r="2.2" class="fb sb"/><circle cx="201" cy="182" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="109" cy="128" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="110" cy="125" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="47" cy="132" r="2.2" class="fb sb"/><circle cx="40" cy="128" r="2.2" class="fb sb"/><circle cx="195" cy="119" r="2.2" class="fr sr"/><circle cx="119" cy="62" r="2.2" class="fg sg"/><circle cx="183" cy="88" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="45" cy="141" r="2.2" class="fb sb"/><circle cx="51" cy="139" r="2.2" class="fb sb"/><circle cx="47" cy="131" r="2.2" class="fb sb"/><circle cx="39" cy="134" r="2.2" class="fb sb"/><circle cx="193" cy="157" r="2.2" class="fr sr"/><circle cx="223" cy="110" r="2.2" class="fr sr"/><circle cx="50" cy="136" r="2.2" class="fb sb"/><circle cx="112" cy="116" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="216" cy="149" r="2.2" class="fr sr"/><circle cx="181" cy="133" r="2.2" class="fr sr"/><circle cx="237" cy="142" r="2.2" class="fr sr"/><circle cx="148" cy="148" r="2.2" class="fr sr"/><circle cx="45" cy="141" r="2.2" class="fb sb"/><circle cx="46" cy="136" r="2.2" class="fb sb"/><circle cx="192" cy="146" r="2.2" class="fr sr"/><circle cx="140" cy="147" r="2.2" class="fr sr"/><circle cx="236" cy="163" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="106" cy="50" r="2.2" class="fg sg"/><circle cx="46" cy="135" r="2.2" class="fb sb"/><circle cx="28" cy="143" r="2.2" class="fb sb"/><circle cx="40" cy="134" r="2.2" class="fb sb"/><circle cx="32" cy="136" r="2.2" class="fb sb"/><circle cx="153" cy="139" r="2.2" class="fr sr"/><circle cx="143" cy="116" r="2.2" class="fr sr"/><circle cx="191" cy="142" r="2.2" class="fr sr"/><circle cx="98" cy="47" r="2.2" class="fg sg"/><circle cx="203" cy="119" r="2.2" class="fr sr"/><circle cx="43" cy="126" r="2.2" class="fb sb"/><circle cx="217" cy="107" r="2.2" class="fr sr"/><circle cx="133" cy="63" r="2.2" class="fg sg"/><circle cx="42" cy="138" r="2.2" class="fb sb"/><circle cx="272" cy="147" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="37" cy="134" r="2.2" class="fb sb"/><circle cx="44" cy="137" r="2.2" class="fb sb"/><circle cx="219" cy="141" r="2.2" class="fr sr"/><circle cx="110" cy="49" r="2.2" class="fg sg"/><circle cx="39" cy="140" r="2.2" class="fb sb"/><circle cx="185" cy="132" r="2.2" class="fr sr"/><circle cx="111" cy="55" r="2.2" class="fg sg"/><circle cx="175" cy="124" r="2.2" class="fr sr"/><circle cx="57" cy="140" r="2.2" class="fb sb"/><circle cx="53" cy="135" r="2.2" class="fb sb"/><circle cx="34" cy="136" r="2.2" class="fb sb"/><circle cx="38" cy="131" r="2.2" class="fb sb"/><circle cx="49" cy="140" r="2.2" class="fb sb"/><circle cx="163" cy="145" r="2.2" class="fr sr"/><circle cx="47" cy="128" r="2.2" class="fb sb"/><circle cx="168" cy="94" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="94" cy="44" r="2.2" class="fg sg"/><circle cx="220" cy="165" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="106" cy="64" r="2.2" class="fg sg"/><circle cx="48" cy="147" r="2.2" class="fb sb"/><circle cx="41" cy="133" r="2.2" class="fb sb"/><circle cx="196" cy="159" r="2.2" class="fr sr"/><circle cx="34" cy="127" r="2.2" class="fb sb"/><circle cx="143" cy="96" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="31" cy="131" r="2.2" class="fb sb"/><circle cx="245" cy="147" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="168" cy="163" r="2.2" class="fr sr"/><circle cx="238" cy="157" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="42" cy="129" r="2.2" class="fb sb"/><circle cx="41" cy="126" r="2.2" class="fb sb"/><circle cx="97" cy="53" r="2.2" class="fg sg"/><circle cx="298" cy="150" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="41" cy="137" r="2.2" class="fb sb"/><circle cx="37" cy="132" r="2.2" class="fb sb"/><circle cx="95" cy="61" r="2.2" class="fg sg"/><circle cx="106" cy="72" r="2.2" class="fg sg"/><circle cx="45" cy="137" r="2.2" class="fb sb"/><circle cx="175" cy="129" r="2.2" class="fr sr"/><circle cx="147" cy="146" r="2.2" class="fr sr"/><circle cx="202" cy="159" r="2.2" class="fr sr"/><circle cx="38" cy="130" r="2.2" class="fb sb"/><circle cx="32" cy="136" r="2.2" class="fb sb"/><circle cx="187" cy="118" r="2.2" class="fr sr"/><circle cx="216" cy="119" r="2.2" class="fr sr"/><circle cx="162" cy="161" r="2.2" class="fr sr"/><circle cx="209" cy="161" r="2.2" class="fr sr"/><circle cx="206" cy="147" r="2.2" class="fr sr"/><circle cx="203" cy="144" r="2.2" class="fr sr"/><circle cx="208" cy="120" r="2.2" class="fr sr"/><circle cx="209" cy="152" r="2.2" class="fr sr"/><circle cx="197" cy="152" r="2.2" class="fr sr"/><circle cx="49" cy="134" r="2.2" class="fb sb"/><circle cx="249" cy="169" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="43" cy="133" r="2.2" class="fb sb"/><circle cx="223" cy="151" r="2.2" class="fr sr"/><circle cx="43" cy="137" r="2.2" class="fb sb"/><circle cx="196" cy="116" r="2.2" class="fr sr"/><circle cx="41" cy="140" r="2.2" class="fb sb"/><circle cx="213" cy="132" r="2.2" class="fr sr"/><circle cx="194" cy="140" r="2.2" class="fr sr"/><circle cx="38" cy="134" r="2.2" class="fb sb"/><circle cx="101" cy="39" r="2.2" class="fg sg"/><circle cx="153" cy="153" r="2.2" class="fr sr"/><circle cx="196" cy="132" r="2.2" class="fr sr"/><circle cx="119" cy="73" r="2.2" class="fg sg"/><circle cx="42" cy="143" r="2.2" class="fb sb"/><circle cx="44" cy="139" r="2.2" class="fb sb"/><circle cx="196" cy="139" r="2.2" class="fr sr"/><circle cx="40" cy="131" r="2.2" class="fb sb"/><circle cx="93" cy="63" r="2.2" class="fg sg"/><circle cx="167" cy="147" r="2.2" class="fr sr"/><circle cx="222" cy="141" r="2.2" class="fr sr"/><circle cx="46" cy="137" r="2.2" class="fb sb"/><circle cx="169" cy="171" r="2.2" class="fr sr"/><circle cx="42" cy="133" r="2.2" class="fb sb"/><circle cx="40" cy="140" r="2.2" class="fb sb"/><circle cx="116" cy="62" r="2.2" class="fg sg"/><circle cx="144" cy="124" r="2.2" class="fr sr"/><circle cx="42" cy="137" r="2.2" class="fb sb"/><circle cx="102" cy="138" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="40" cy="137" r="2.2" class="fb sb"/><circle cx="49" cy="132" r="2.2" class="fb sb"/><circle cx="119" cy="60" r="2.2" class="fg sg"/><circle cx="198" cy="141" r="2.2" class="fr sr"/><circle cx="199" cy="133" r="2.2" class="fr sr"/><circle cx="63" cy="132" r="2.2" class="fb sb"/><circle cx="210" cy="118" r="2.2" class="fr sr"/><circle cx="44" cy="133" r="2.2" class="fb sb"/><circle cx="122" cy="72" r="2.2" class="fg sg"/><circle cx="123" cy="61" r="2.2" class="fg sg"/><circle cx="46" cy="131" r="2.2" class="fb sb"/><circle cx="215" cy="134" r="2.2" class="fr sr"/><circle cx="36" cy="133" r="2.2" class="fb sb"/><circle cx="180" cy="102" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="144" cy="138" r="2.2" class="fr sr"/><circle cx="149" cy="140" r="2.2" class="fr sr"/><circle cx="52" cy="135" r="2.2" class="fb sb"/><circle cx="214" cy="114" r="2.2" class="fr sr"/><circle cx="187" cy="139" r="2.2" class="fr sr"/><circle cx="42" cy="135" r="2.2" class="fb sb"/><circle cx="46" cy="135" r="2.2" class="fb sb"/><circle cx="46" cy="137" r="2.2" class="fb sb"/><circle cx="130" cy="148" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="51" cy="135" r="2.2" class="fb sb"/><circle cx="113" cy="59" r="2.2" class="fg sg"/><circle cx="34" cy="136" r="2.2" class="fb sb"/><circle cx="33" cy="133" r="2.2" class="fb sb"/><circle cx="115" cy="63" r="2.2" class="fg sg"/><circle cx="45" cy="136" r="2.2" class="fb sb"/><circle cx="169" cy="124" r="2.2" class="fr sr"/><circle cx="114" cy="59" r="2.2" class="fg sg"/><circle cx="134" cy="47" r="2.2" class="fg sg"/><circle cx="40" cy="139" r="2.2" class="fb sb"/><circle cx="101" cy="128" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="126" cy="50" r="2.2" class="fg sg"/><circle cx="199" cy="130" r="2.2" class="fr sr"/><circle cx="32" cy="128" r="2.2" class="fb sb"/><circle cx="46" cy="134" r="2.2" class="fb sb"/><circle cx="180" cy="133" r="2.2" class="fr sr"/><circle cx="127" cy="150" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="33" cy="139" r="2.2" class="fb sb"/><circle cx="205" cy="162" r="2.2" class="fr sr"/><circle cx="116" cy="56" r="2.2" class="fg sg"/><circle cx="202" cy="108" r="2.2" class="fr sr"/><circle cx="49" cy="140" r="2.2" class="fb sb"/><circle cx="31" cy="138" r="2.2" class="fb sb"/><circle cx="54" cy="136" r="2.2" class="fb sb"/><circle cx="40" cy="130" r="2.2" class="fb sb"/><circle cx="176" cy="193" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="39" cy="129" r="2.2" class="fb sb"/><circle cx="177" cy="153" r="2.2" class="fr sr"/><circle cx="137" cy="167" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="34" cy="132" r="2.2" class="fb sb"/><circle cx="48" cy="132" r="2.2" class="fb sb"/><circle cx="164" cy="140" r="2.2" class="fr sr"/><circle cx="154" cy="107" r="2.2" class="fv"/><circle cx="33" cy="125" r="2.2" class="fb sb"/><circle cx="59" cy="137" r="2.2" class="fb sb"/><circle cx="175" cy="136" r="2.2" class="fr sr"/><circle cx="210" cy="138" r="2.2" class="fr sr"/><circle cx="147" cy="158" r="2.2" class="fr sr"/><circle cx="147" cy="132" r="2.2" class="fr sr"/><circle cx="218" cy="139" r="2.2" class="fr sr"/><circle cx="50" cy="136" r="2.2" class="fb sb"/><circle cx="45" cy="139" r="2.2" class="fb sb"/><circle cx="180" cy="141" r="2.2" class="fr sr"/><circle cx="41" cy="142" r="2.2" class="fb sb"/><circle cx="46" cy="139" r="2.2" class="fb sb"/><circle cx="41" cy="136" r="2.2" class="fb sb"/><circle cx="50" cy="128" r="2.2" class="fb sb"/><circle cx="38" cy="136" r="2.2" class="fb sb"/><circle cx="204" cy="132" r="2.2" class="fr sr"/><circle cx="48" cy="133" r="2.2" class="fb sb"/><circle cx="77" cy="54" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="37" cy="136" r="2.2" class="fb sb"/><circle cx="94" cy="117" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="30" cy="132" r="2.2" class="fb sb"/><circle cx="172" cy="156" r="2.2" class="fr sr"/><circle cx="42" cy="131" r="2.2" class="fb sb"/><circle cx="150" cy="140" r="2.2" class="fr sr"/><circle cx="44" cy="127" r="2.2" class="fb sb"/><circle cx="104" cy="82" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="149" cy="139" r="2.2" class="fr sr"/><circle cx="120" cy="40" r="2.2" class="fg sg"/><circle cx="50" cy="134" r="2.2" class="fb sb"/><circle cx="45" cy="131" r="2.2" class="fb sb"/><circle cx="130" cy="140" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="191" cy="177" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="33" cy="132" r="2.2" class="fb sb"/><circle cx="132" cy="110" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="100" cy="65" r="2.2" class="fg sg"/><circle cx="46" cy="138" r="2.2" class="fb sb"/><circle cx="196" cy="140" r="2.2" class="fr sr"/><circle cx="221" cy="152" r="2.2" class="fr sr"/><circle cx="43" cy="135" r="2.2" class="fb sb"/><circle cx="118" cy="76" r="2.2" class="fg sg"/><circle cx="124" cy="63" r="2.2" class="fg sg"/><circle cx="133" cy="42" r="2.2" class="fg sg"/><circle cx="99" cy="64" r="2.2" class="fg sg"/><circle cx="194" cy="138" r="2.2" class="fr sr"/><circle cx="39" cy="136" r="2.2" class="fb sb"/><circle cx="192" cy="135" r="2.2" class="fr sr"/><circle cx="52" cy="139" r="2.2" class="fb sb"/><circle cx="104" cy="52" r="2.2" class="fg sg"/><circle cx="27" cy="145" r="2.2" class="fb sb"/><circle cx="173" cy="156" r="2.2" class="fr sr"/><circle cx="45" cy="128" r="2.2" class="fb sb"/><circle cx="159" cy="148" r="2.2" class="fr sr"/><circle cx="210" cy="150" r="2.2" class="fr sr"/><circle cx="185" cy="124" r="2.2" class="fr sr"/><circle cx="222" cy="111" r="2.2" class="fr sr"/><circle cx="107" cy="145" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="202" cy="131" r="2.2" class="fr sr"/><circle cx="194" cy="141" r="2.2" class="fr sr"/><circle cx="165" cy="135" r="2.2" class="fr sr"/><circle cx="203" cy="82" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="148" cy="146" r="2.2" class="fr sr"/><circle cx="212" cy="168" r="2.2" class="ft st"/><circle cx="43" cy="137" r="2.2" class="fb sb"/><circle cx="116" cy="65" r="2.2" class="fg sg"/><circle cx="47" cy="139" r="2.2" class="fb sb"/><circle cx="37" cy="137" r="2.2" class="fb sb"/><circle cx="88" cy="146" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="180" cy="92" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="173" cy="116" r="2.2" class="fr sr"/><circle cx="39" cy="138" r="2.2" class="fb sb"/><circle cx="214" cy="94" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="236" cy="81" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="177" cy="142" r="2.2" class="fr sr"/><circle cx="232" cy="115" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="30" cy="140" r="2.2" class="fb sb"/><circle cx="87" cy="164" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="176" cy="115" r="2.2" class="fr sr"/><circle cx="155" cy="92" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="42" cy="133" r="2.2" class="fb sb"/><circle cx="107" cy="57" r="2.2" class="fg sg"/><circle cx="236" cy="156" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="136" cy="134" r="2.2" class="fr sr"/><circle cx="180" cy="112" r="2.2" class="fr sr"/><circle cx="122" cy="65" r="2.2" class="fg sg"/><circle cx="193" cy="141" r="2.2" class="fr sr"/><circle cx="38" cy="134" r="2.2" class="fb sb"/><circle cx="39" cy="130" r="2.2" class="fb sb"/><circle cx="160" cy="136" r="2.2" class="fr sr"/><circle cx="157" cy="110" r="2.2" class="fv"/><circle cx="150" cy="129" r="2.2" class="fr sr"/><circle cx="42" cy="141" r="2.2" class="fb sb"/><circle cx="184" cy="112" r="2.2" class="fr sr"/><circle cx="47" cy="138" r="2.2" class="fb sb"/><circle cx="107" cy="32" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="199" cy="142" r="2.2" class="fr sr"/><circle cx="45" cy="128" r="2.2" class="fb sb"/><circle cx="225" cy="161" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="239" cy="116" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="45" cy="135" r="2.2" class="fb sb"/><circle cx="200" cy="136" r="2.2" class="fr sr"/><circle cx="145" cy="128" r="2.2" class="fr sr"/><circle cx="75" cy="125" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="48" cy="135" r="2.2" class="fb sb"/><circle cx="38" cy="132" r="2.2" class="fb sb"/><circle cx="46" cy="139" r="2.2" class="fb sb"/><circle cx="202" cy="125" r="2.2" class="fr sr"/><circle cx="174" cy="147" r="2.2" class="fr sr"/><circle cx="40" cy="137" r="2.2" class="fb sb"/><circle cx="49" cy="143" r="2.2" class="fb sb"/><circle cx="119" cy="57" r="2.2" class="fg sg"/><circle cx="187" cy="123" r="2.2" class="fr sr"/><circle cx="46" cy="140" r="2.2" class="fb sb"/><circle cx="240" cy="103" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="41" cy="140" r="2.2" class="fb sb"/><circle cx="116" cy="57" r="2.2" class="fg sg"/><circle cx="127" cy="122" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="125" cy="54" r="2.2" class="fg sg"/><circle cx="41" cy="131" r="2.2" class="fb sb"/><circle cx="28" cy="134" r="2.2" class="fb sb"/><circle cx="44" cy="138" r="2.2" class="fb sb"/><circle cx="39" cy="142" r="2.2" class="fb sb"/><circle cx="120" cy="143" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="127" cy="42" r="2.2" class="fg sg"/><circle cx="38" cy="133" r="2.2" class="fb sb"/><circle cx="116" cy="31" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="115" cy="65" r="2.2" class="fg sg"/><circle cx="128" cy="172" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="119" cy="59" r="2.2" class="fg sg"/><circle cx="40" cy="129" r="2.2" class="fb sb"/><circle cx="50" cy="127" r="2.2" class="fb sb"/><circle cx="96" cy="69" r="2.2" class="fg sg"/><circle cx="29" cy="134" r="2.2" class="fb sb"/><circle cx="53" cy="133" r="2.2" class="fb sb"/><circle cx="214" cy="147" r="2.2" class="fr sr"/><circle cx="187" cy="169" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="41" cy="137" r="2.2" class="fb sb"/><circle cx="121" cy="60" r="2.2" class="fg sg"/><circle cx="40" cy="143" r="2.2" class="fb sb"/><circle cx="186" cy="149" r="2.2" class="fr sr"/><circle cx="51" cy="133" r="2.2" class="fb sb"/><circle cx="34" cy="135" r="2.2" class="fb sb"/><circle cx="44" cy="142" r="2.2" class="fb sb"/><circle cx="42" cy="133" r="2.2" class="fb sb"/><circle cx="180" cy="155" r="2.2" class="fr sr"/><circle cx="190" cy="159" r="2.2" class="fr sr"/><circle cx="34" cy="135" r="2.2" class="fb sb"/><circle cx="130" cy="57" r="2.2" class="fg sg"/><circle cx="100" cy="69" r="2.2" class="fg sg"/>
<circle cx="364" cy="136" r="2.2" class="fr sr"/><circle cx="356" cy="138" r="2.2" class="fr sr"/><circle cx="513" cy="111" r="2.2" class="fg sg"/><circle cx="434" cy="50" r="2.2" class="fb sb"/><circle cx="365" cy="144" r="2.2" class="fr sr"/><circle cx="367" cy="136" r="2.2" class="fr sr"/><circle cx="362" cy="138" r="2.2" class="fr sr"/><circle cx="486" cy="132" r="2.2" class="fg sg"/><circle cx="514" cy="116" r="2.2" class="fg sg"/><circle cx="446" cy="53" r="2.2" class="fb sb"/><circle cx="355" cy="133" r="2.2" class="fr sr"/><circle cx="366" cy="138" r="2.2" class="fr sr"/><circle cx="373" cy="134" r="2.2" class="fr sr"/><circle cx="496" cy="167" r="2.2" class="fg sg"/><circle cx="364" cy="132" r="2.2" class="fr sr"/><circle cx="515" cy="141" r="2.2" class="fg sg"/><circle cx="427" cy="53" r="2.2" class="fb sb"/><circle cx="505" cy="128" r="2.2" class="fg sg"/><circle cx="361" cy="140" r="2.2" class="fr sr"/><circle cx="444" cy="57" r="2.2" class="fb sb"/><circle cx="456" cy="142" r="2.2" class="fg sg"/><circle cx="362" cy="128" r="2.2" class="fr sr"/><circle cx="553" cy="129" r="2.2" class="fg sg"/><circle cx="423" cy="55" r="2.2" class="fb sb"/><circle cx="360" cy="135" r="2.2" class="fr sr"/><circle cx="374" cy="142" r="2.2" class="fr sr"/><circle cx="521" cy="182" r="2.2" class="fg sg"/><circle cx="429" cy="128" r="2.2" class="fr sr"/><circle cx="430" cy="125" r="2.2" class="fg sg"/><circle cx="367" cy="132" r="2.2" class="fr sr"/><circle cx="360" cy="128" r="2.2" class="fr sr"/><circle cx="515" cy="119" r="2.2" class="fg sg"/><circle cx="439" cy="62" r="2.2" class="fb sb"/><circle cx="503" cy="88" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="365" cy="141" r="2.2" class="fr sr"/><circle cx="371" cy="139" r="2.2" class="fr sr"/><circle cx="367" cy="131" r="2.2" class="fr sr"/><circle cx="359" cy="134" r="2.2" class="fr sr"/><circle cx="513" cy="157" r="2.2" class="fg sg"/><circle cx="543" cy="110" r="2.2" class="fg sg"/><circle cx="370" cy="136" r="2.2" class="fr sr"/><circle cx="432" cy="116" r="2.2" class="fg sg"/><circle cx="536" cy="149" r="2.2" class="fg sg"/><circle cx="501" cy="133" r="2.2" class="fg sg"/><circle cx="557" cy="142" r="2.2" class="fg sg"/><circle cx="468" cy="148" r="2.2" class="fg sg"/><circle cx="365" cy="141" r="2.2" class="fr sr"/><circle cx="366" cy="136" r="2.2" class="fr sr"/><circle cx="512" cy="146" r="2.2" class="fg sg"/><circle cx="460" cy="147" r="2.2" class="fg sg"/><circle cx="556" cy="163" r="2.2" class="fg sg"/><circle cx="426" cy="50" r="2.2" class="fb sb"/><circle cx="366" cy="135" r="2.2" class="fr sr"/><circle cx="348" cy="143" r="2.2" class="fr sr"/><circle cx="360" cy="134" r="2.2" class="fr sr"/><circle cx="352" cy="136" r="2.2" class="fr sr"/><circle cx="473" cy="139" r="2.2" class="fg sg"/><circle cx="463" cy="116" r="2.2" class="fg sg"/><circle cx="511" cy="142" r="2.2" class="fg sg"/><circle cx="418" cy="47" r="2.2" class="fb sb"/><circle cx="523" cy="119" r="2.2" class="fg sg"/><circle cx="363" cy="126" r="2.2" class="fr sr"/><circle cx="537" cy="107" r="2.2" class="fg sg"/><circle cx="453" cy="63" r="2.2" class="fb sb"/><circle cx="362" cy="138" r="2.2" class="fr sr"/><circle cx="592" cy="147" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="357" cy="134" r="2.2" class="fr sr"/><circle cx="364" cy="137" r="2.2" class="fr sr"/><circle cx="539" cy="141" r="2.2" class="fg sg"/><circle cx="430" cy="49" r="2.2" class="fb sb"/><circle cx="359" cy="140" r="2.2" class="fr sr"/><circle cx="505" cy="132" r="2.2" class="fg sg"/><circle cx="431" cy="55" r="2.2" class="fb sb"/><circle cx="495" cy="124" r="2.2" class="fg sg"/><circle cx="377" cy="140" r="2.2" class="fr sr"/><circle cx="373" cy="135" r="2.2" class="fr sr"/><circle cx="354" cy="136" r="2.2" class="fr sr"/><circle cx="358" cy="131" r="2.2" class="fr sr"/><circle cx="369" cy="140" r="2.2" class="fr sr"/><circle cx="483" cy="145" r="2.2" class="fg sg"/><circle cx="367" cy="128" r="2.2" class="fr sr"/><circle cx="488" cy="94" r="2.2" class="fg sg"/><circle cx="414" cy="44" r="2.2" class="fb sb"/><circle cx="540" cy="165" r="2.2" class="fg sg"/><circle cx="426" cy="64" r="2.2" class="fb sb"/><circle cx="368" cy="147" r="2.2" class="fr sr"/><circle cx="361" cy="133" r="2.2" class="fr sr"/><circle cx="516" cy="159" r="2.2" class="fg sg"/><circle cx="354" cy="127" r="2.2" class="fr sr"/><circle cx="463" cy="96" r="2.2" class="fb sb"/><circle cx="351" cy="131" r="2.2" class="fr sr"/><circle cx="565" cy="147" r="2.2" class="fg sg"/><circle cx="488" cy="163" r="2.2" class="fg sg"/><circle cx="558" cy="157" r="2.2" class="fg sg"/><circle cx="362" cy="129" r="2.2" class="fr sr"/><circle cx="361" cy="126" r="2.2" class="fr sr"/><circle cx="417" cy="53" r="2.2" class="fb sb"/><circle cx="618" cy="150" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="361" cy="137" r="2.2" class="fr sr"/><circle cx="357" cy="132" r="2.2" class="fr sr"/><circle cx="415" cy="61" r="2.2" class="fb sb"/><circle cx="426" cy="72" r="2.2" class="fb sb"/><circle cx="365" cy="137" r="2.2" class="fr sr"/><circle cx="495" cy="129" r="2.2" class="fg sg"/><circle cx="467" cy="146" r="2.2" class="fg sg"/><circle cx="522" cy="159" r="2.2" class="fg sg"/><circle cx="358" cy="130" r="2.2" class="fr sr"/><circle cx="352" cy="136" r="2.2" class="fr sr"/><circle cx="507" cy="118" r="2.2" class="fg sg"/><circle cx="536" cy="119" r="2.2" class="fg sg"/><circle cx="482" cy="161" r="2.2" class="fg sg"/><circle cx="529" cy="161" r="2.2" class="fg sg"/><circle cx="526" cy="147" r="2.2" class="fg sg"/><circle cx="523" cy="144" r="2.2" class="fg sg"/><circle cx="528" cy="120" r="2.2" class="fg sg"/><circle cx="529" cy="152" r="2.2" class="fg sg"/><circle cx="517" cy="152" r="2.2" class="fg sg"/><circle cx="369" cy="134" r="2.2" class="fr sr"/><circle cx="569" cy="169" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="363" cy="133" r="2.2" class="fr sr"/><circle cx="543" cy="151" r="2.2" class="fg sg"/><circle cx="363" cy="137" r="2.2" class="fr sr"/><circle cx="516" cy="116" r="2.2" class="fg sg"/><circle cx="361" cy="140" r="2.2" class="fr sr"/><circle cx="533" cy="132" r="2.2" class="fg sg"/><circle cx="514" cy="140" r="2.2" class="fg sg"/><circle cx="358" cy="134" r="2.2" class="fr sr"/><circle cx="421" cy="39" r="2.2" class="fb sb"/><circle cx="473" cy="153" r="2.2" class="fg sg"/><circle cx="516" cy="132" r="2.2" class="fg sg"/><circle cx="439" cy="73" r="2.2" class="fb sb"/><circle cx="362" cy="143" r="2.2" class="fr sr"/><circle cx="364" cy="139" r="2.2" class="fr sr"/><circle cx="516" cy="139" r="2.2" class="fg sg"/><circle cx="360" cy="131" r="2.2" class="fr sr"/><circle cx="413" cy="63" r="2.2" class="fb sb"/><circle cx="487" cy="147" r="2.2" class="fg sg"/><circle cx="542" cy="141" r="2.2" class="fg sg"/><circle cx="366" cy="137" r="2.2" class="fr sr"/><circle cx="489" cy="171" r="2.2" class="fg sg"/><circle cx="362" cy="133" r="2.2" class="fr sr"/><circle cx="360" cy="140" r="2.2" class="fr sr"/><circle cx="436" cy="62" r="2.2" class="fb sb"/><circle cx="464" cy="124" r="2.2" class="fg sg"/><circle cx="362" cy="137" r="2.2" class="fr sr"/><circle cx="422" cy="138" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="360" cy="137" r="2.2" class="fr sr"/><circle cx="369" cy="132" r="2.2" class="fr sr"/><circle cx="439" cy="60" r="2.2" class="fb sb"/><circle cx="518" cy="141" r="2.2" class="fg sg"/><circle cx="519" cy="133" r="2.2" class="fg sg"/><circle cx="383" cy="132" r="2.2" class="fr sr"/><circle cx="530" cy="118" r="2.2" class="fg sg"/><circle cx="364" cy="133" r="2.2" class="fr sr"/><circle cx="442" cy="72" r="2.2" class="fb sb"/><circle cx="443" cy="61" r="2.2" class="fb sb"/><circle cx="366" cy="131" r="2.2" class="fr sr"/><circle cx="535" cy="134" r="2.2" class="fg sg"/><circle cx="356" cy="133" r="2.2" class="fr sr"/><circle cx="500" cy="102" r="2.2" class="fg sg"/><circle cx="464" cy="138" r="2.2" class="fg sg"/><circle cx="469" cy="140" r="2.2" class="fg sg"/><circle cx="372" cy="135" r="2.2" class="fr sr"/><circle cx="534" cy="114" r="2.2" class="fg sg"/><circle cx="507" cy="139" r="2.2" class="fg sg"/><circle cx="362" cy="135" r="2.2" class="fr sr"/><circle cx="366" cy="135" r="2.2" class="fr sr"/><circle cx="366" cy="137" r="2.2" class="fr sr"/><circle cx="450" cy="148" r="2.2" class="fg sg"/><circle cx="371" cy="135" r="2.2" class="fr sr"/><circle cx="433" cy="59" r="2.2" class="fb sb"/><circle cx="354" cy="136" r="2.2" class="fr sr"/><circle cx="353" cy="133" r="2.2" class="fr sr"/><circle cx="435" cy="63" r="2.2" class="fb sb"/><circle cx="365" cy="136" r="2.2" class="fr sr"/><circle cx="489" cy="124" r="2.2" class="fg sg"/><circle cx="434" cy="59" r="2.2" class="fb sb"/><circle cx="454" cy="47" r="2.2" class="fb sb"/><circle cx="360" cy="139" r="2.2" class="fr sr"/><circle cx="421" cy="128" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="446" cy="50" r="2.2" class="fb sb"/><circle cx="519" cy="130" r="2.2" class="fg sg"/><circle cx="352" cy="128" r="2.2" class="fr sr"/><circle cx="366" cy="134" r="2.2" class="fr sr"/><circle cx="500" cy="133" r="2.2" class="fg sg"/><circle cx="447" cy="150" r="2.2" class="fg sg"/><circle cx="353" cy="139" r="2.2" class="fr sr"/><circle cx="525" cy="162" r="2.2" class="fg sg"/><circle cx="436" cy="56" r="2.2" class="fb sb"/><circle cx="522" cy="108" r="2.2" class="fg sg"/><circle cx="369" cy="140" r="2.2" class="fr sr"/><circle cx="351" cy="138" r="2.2" class="fr sr"/><circle cx="374" cy="136" r="2.2" class="fr sr"/><circle cx="360" cy="130" r="2.2" class="fr sr"/><circle cx="496" cy="193" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="359" cy="129" r="2.2" class="fr sr"/><circle cx="497" cy="153" r="2.2" class="fg sg"/><circle cx="457" cy="167" r="2.2" class="fg sg"/><circle cx="354" cy="132" r="2.2" class="fr sr"/><circle cx="368" cy="132" r="2.2" class="fr sr"/><circle cx="484" cy="140" r="2.2" class="fg sg"/><circle cx="474" cy="107" r="2.2" class="fg sg"/><circle cx="353" cy="125" r="2.2" class="fr sr"/><circle cx="379" cy="137" r="2.2" class="fr sr"/><circle cx="495" cy="136" r="2.2" class="fg sg"/><circle cx="530" cy="138" r="2.2" class="fg sg"/><circle cx="467" cy="158" r="2.2" class="fg sg"/><circle cx="467" cy="132" r="2.2" class="fg sg"/><circle cx="538" cy="139" r="2.2" class="fg sg"/><circle cx="370" cy="136" r="2.2" class="fr sr"/><circle cx="365" cy="139" r="2.2" class="fr sr"/><circle cx="500" cy="141" r="2.2" class="fg sg"/><circle cx="361" cy="142" r="2.2" class="fr sr"/><circle cx="366" cy="139" r="2.2" class="fr sr"/><circle cx="361" cy="136" r="2.2" class="fr sr"/><circle cx="370" cy="128" r="2.2" class="fr sr"/><circle cx="358" cy="136" r="2.2" class="fr sr"/><circle cx="524" cy="132" r="2.2" class="fg sg"/><circle cx="368" cy="133" r="2.2" class="fr sr"/><circle cx="397" cy="54" r="2.2" class="fb sb"/><circle cx="357" cy="136" r="2.2" class="fr sr"/><circle cx="414" cy="117" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="350" cy="132" r="2.2" class="fr sr"/><circle cx="492" cy="156" r="2.2" class="fg sg"/><circle cx="362" cy="131" r="2.2" class="fr sr"/><circle cx="470" cy="140" r="2.2" class="fg sg"/><circle cx="364" cy="127" r="2.2" class="fr sr"/><circle cx="424" cy="82" r="2.2" class="fb sb"/><circle cx="469" cy="139" r="2.2" class="fg sg"/><circle cx="440" cy="40" r="2.2" class="fb sb"/><circle cx="370" cy="134" r="2.2" class="fr sr"/><circle cx="365" cy="131" r="2.2" class="fr sr"/><circle cx="450" cy="140" r="2.2" class="fg sg"/><circle cx="511" cy="177" r="2.2" class="fg sg"/><circle cx="353" cy="132" r="2.2" class="fr sr"/><circle cx="452" cy="110" r="2.2" class="fg sg"/><circle cx="420" cy="65" r="2.2" class="fb sb"/><circle cx="366" cy="138" r="2.2" class="fr sr"/><circle cx="516" cy="140" r="2.2" class="fg sg"/><circle cx="541" cy="152" r="2.2" class="fg sg"/><circle cx="363" cy="135" r="2.2" class="fr sr"/><circle cx="438" cy="76" r="2.2" class="fb sb"/><circle cx="444" cy="63" r="2.2" class="fb sb"/><circle cx="453" cy="42" r="2.2" class="fb sb"/><circle cx="419" cy="64" r="2.2" class="fb sb"/><circle cx="514" cy="138" r="2.2" class="fg sg"/><circle cx="359" cy="136" r="2.2" class="fr sr"/><circle cx="512" cy="135" r="2.2" class="fg sg"/><circle cx="372" cy="139" r="2.2" class="fr sr"/><circle cx="424" cy="52" r="2.2" class="fb sb"/><circle cx="347" cy="145" r="2.2" class="fr sr"/><circle cx="493" cy="156" r="2.2" class="fg sg"/><circle cx="365" cy="128" r="2.2" class="fr sr"/><circle cx="479" cy="148" r="2.2" class="fg sg"/><circle cx="530" cy="150" r="2.2" class="fg sg"/><circle cx="505" cy="124" r="2.2" class="fg sg"/><circle cx="542" cy="111" r="2.2" class="fg sg"/><circle cx="427" cy="145" r="2.2" class="fg sg"/><circle cx="522" cy="131" r="2.2" class="fg sg"/><circle cx="514" cy="141" r="2.2" class="fg sg"/><circle cx="485" cy="135" r="2.2" class="fg sg"/><circle cx="523" cy="82" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="468" cy="146" r="2.2" class="fg sg"/><circle cx="532" cy="168" r="2.2" class="fg sg"/><circle cx="363" cy="137" r="2.2" class="fr sr"/><circle cx="436" cy="65" r="2.2" class="fb sb"/><circle cx="367" cy="139" r="2.2" class="fr sr"/><circle cx="357" cy="137" r="2.2" class="fr sr"/><circle cx="408" cy="146" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="500" cy="92" r="2.2" class="fg sg"/><circle cx="493" cy="116" r="2.2" class="fg sg"/><circle cx="359" cy="138" r="2.2" class="fr sr"/><circle cx="534" cy="94" r="2.2" class="fg sg"/><circle cx="556" cy="81" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="497" cy="142" r="2.2" class="fg sg"/><circle cx="552" cy="115" r="2.2" class="fg sg"/><circle cx="350" cy="140" r="2.2" class="fr sr"/><circle cx="407" cy="164" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="496" cy="115" r="2.2" class="fg sg"/><circle cx="475" cy="92" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="362" cy="133" r="2.2" class="fr sr"/><circle cx="427" cy="57" r="2.2" class="fb sb"/><circle cx="556" cy="156" r="2.2" class="fg sg"/><circle cx="456" cy="134" r="2.2" class="fg sg"/><circle cx="500" cy="112" r="2.2" class="fg sg"/><circle cx="442" cy="65" r="2.2" class="fb sb"/><circle cx="513" cy="141" r="2.2" class="fg sg"/><circle cx="358" cy="134" r="2.2" class="fr sr"/><circle cx="359" cy="130" r="2.2" class="fr sr"/><circle cx="480" cy="136" r="2.2" class="fg sg"/><circle cx="477" cy="110" r="2.2" class="fg sg"/><circle cx="470" cy="129" r="2.2" class="fg sg"/><circle cx="362" cy="141" r="2.2" class="fr sr"/><circle cx="504" cy="112" r="2.2" class="fg sg"/><circle cx="367" cy="138" r="2.2" class="fr sr"/><circle cx="427" cy="32" r="2.2" class="fb sb"/><circle cx="519" cy="142" r="2.2" class="fg sg"/><circle cx="365" cy="128" r="2.2" class="fr sr"/><circle cx="545" cy="161" r="2.2" class="fg sg"/><circle cx="559" cy="116" r="2.2" class="fg sg"/><circle cx="365" cy="135" r="2.2" class="fr sr"/><circle cx="520" cy="136" r="2.2" class="fg sg"/><circle cx="465" cy="128" r="2.2" class="fg sg"/><circle cx="395" cy="125" r="2.2" class="fr sr"/><circle cx="368" cy="135" r="2.2" class="fr sr"/><circle cx="358" cy="132" r="2.2" class="fr sr"/><circle cx="366" cy="139" r="2.2" class="fr sr"/><circle cx="522" cy="125" r="2.2" class="fg sg"/><circle cx="494" cy="147" r="2.2" class="fg sg"/><circle cx="360" cy="137" r="2.2" class="fr sr"/><circle cx="369" cy="143" r="2.2" class="fr sr"/><circle cx="439" cy="57" r="2.2" class="fb sb"/><circle cx="507" cy="123" r="2.2" class="fg sg"/><circle cx="366" cy="140" r="2.2" class="fr sr"/><circle cx="560" cy="103" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="361" cy="140" r="2.2" class="fr sr"/><circle cx="436" cy="57" r="2.2" class="fb sb"/><circle cx="447" cy="122" r="2.2" class="fg sg"/><circle cx="445" cy="54" r="2.2" class="fb sb"/><circle cx="361" cy="131" r="2.2" class="fr sr"/><circle cx="348" cy="134" r="2.2" class="fr sr"/><circle cx="364" cy="138" r="2.2" class="fr sr"/><circle cx="359" cy="142" r="2.2" class="fr sr"/><circle cx="440" cy="143" r="2.2" class="fg sg"/><circle cx="447" cy="42" r="2.2" class="fb sb"/><circle cx="358" cy="133" r="2.2" class="fr sr"/><circle cx="436" cy="31" r="2.2" class="fb sb"/><circle cx="435" cy="65" r="2.2" class="fb sb"/><circle cx="448" cy="172" r="2.2" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="439" cy="59" r="2.2" class="fb sb"/><circle cx="360" cy="129" r="2.2" class="fr sr"/><circle cx="370" cy="127" r="2.2" class="fr sr"/><circle cx="416" cy="69" r="2.2" class="fb sb"/><circle cx="349" cy="134" r="2.2" class="fr sr"/><circle cx="373" cy="133" r="2.2" class="fr sr"/><circle cx="534" cy="147" r="2.2" class="fg sg"/><circle cx="507" cy="169" r="2.2" class="fg sg"/><circle cx="361" cy="137" r="2.2" class="fr sr"/><circle cx="441" cy="60" r="2.2" class="fb sb"/><circle cx="360" cy="143" r="2.2" class="fr sr"/><circle cx="506" cy="149" r="2.2" class="fg sg"/><circle cx="371" cy="133" r="2.2" class="fr sr"/><circle cx="354" cy="135" r="2.2" class="fr sr"/><circle cx="364" cy="142" r="2.2" class="fr sr"/><circle cx="362" cy="133" r="2.2" class="fr sr"/><circle cx="500" cy="155" r="2.2" class="fg sg"/><circle cx="510" cy="159" r="2.2" class="fg sg"/><circle cx="354" cy="135" r="2.2" class="fr sr"/><circle cx="450" cy="57" r="2.2" class="fb sb"/><circle cx="420" cy="69" r="2.2" class="fb sb"/>
<line x1="320" y1="26" x2="320" y2="206" stroke="currentColor" stroke-opacity="0.2"/>
<text x="160" y="224" text-anchor="middle" class="tm" font-size="11">one radius: the loose cloud shatters into noise and bits</text>
<text x="480" y="224" text-anchor="middle" class="tm" font-size="11">each cloud judged at its own density</text>
</svg><figcaption>Three clouds with different spreads (0.3, 1.5, 0.6). Every second point drawn. Grey hollow points are noise.</figcaption></figure>
  <p>Small eps (0.2, 0.4): the loose cloud breaks into many fragments and hundreds of noise points. Large eps (1.0, 1.5): the tight and medium clouds merge with the loose one. Only eps = 0.7 happens to land on 3 clusters (ARI 0.952), and you could not have known that without the true labels. HDBSCAN, with no eps at all, finds the 3 clouds (ARI 0.913) and calls 30 thin-edge points noise.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Choosing eps is choosing one horizontal slice through a "density landscape". Clusters of different heights need different slices. HDBSCAN looks at all slices at once and picks, for each region, the slice where that cluster is most stable.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> how can one algorithm try "every eps" at once, and how does it decide which clusters to keep? <b>Next: HDBSCAN.</b></div>

  <h2 id="db-hdbscan"><span class="num">08</span>HDBSCAN</h2>
  <p><strong>The question we can't answer yet.</strong> We need DBSCAN's result for every eps at once, plus a rule that picks, region by region, the clusters worth keeping.</p>
  <h3>The idea in plain words</h3>
  <p>HDBSCAN (Hierarchical DBSCAN, Campello, Moulavi and Sander, 2013) runs DBSCAN at every possible eps simultaneously. As eps shrinks from huge to tiny, the data first forms one big cluster, which then splits into smaller ones, which lose points or split again, until everything is noise. HDBSCAN records this whole history as a tree, simplifies it, and keeps the clusters that <strong>survive the longest</strong> as eps shrinks. A real cluster persists over a wide range of eps; an accidental clump appears and vanishes quickly.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Islands in a falling sea. Picture the density of points as a landscape of hills (crowded) and valleys (sparse), with the sea level as eps. At high sea level only one big island peeks out; as the water drops, it reveals separate islands, and some islands show two peaks. HDBSCAN keeps the islands that stay distinct for the longest stretch of falling water, whatever their height.</p>
  </div>
  <p>Four steps make this precise. We do each by hand on the 12 stalls, with min_samples = 4 (as before) and min_cluster_size = 3 (a "market" needs at least 3 stalls).</p>
  <h3>Step 1: core distance (you already computed it)</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Core distance</strong> core_k(p) = the distance from p to its k-th nearest point, counting p itself (k = min_samples). It is the smallest eps at which p would be a DBSCAN core point, and it is large where points are sparse.</p>
  </div>
  <p>This is exactly the k-distance column of section 05: D = 1.0; A, B, C, F, G, H, I = 1.414; E = 2.0; J = 2.236; K = 4.472; L = 5.831. Nothing new to compute; only a new name.</p>
  <h3>Step 2: mutual reachability distance</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Mutual reachability distance</strong> d_mr(a, b) = max( core_k(a), core_k(b), d(a, b) ).<br>Two points count as "close" only if they are close to each other <em>and</em> both live in crowded places. Dense points keep their normal distances; sparse points are pushed away from everyone.</p>
  </div>
  <table class="tbl">
    <tr><th>Pair</th><th>core(a)</th><th>core(b)</th><th>d(a, b)</th><th>d_mr = max</th><th>Effect</th></tr>
    <tr><td>A–B</td><td>1.414</td><td>1.414</td><td>1</td><td>1.414</td><td>raised slightly to the crowd's scale</td></tr>
    <tr><td>B–E</td><td>1.414</td><td>2</td><td>1.414</td><td>2</td><td>E is on the edge: pushed out a bit</td></tr>
    <tr><td>G–J</td><td>1.414</td><td>2.236</td><td>2.236</td><td>2.236</td><td>unchanged</td></tr>
    <tr><td>E–F</td><td>2</td><td>1.414</td><td>4.243</td><td>4.243</td><td>the gap between the markets</td></tr>
    <tr><td>H–K</td><td>1.414</td><td>4.472</td><td>3.606</td><td>4.472</td><td>K is lonely: pushed from 3.6 to 4.5</td></tr>
    <tr><td>G–L</td><td>1.414</td><td>5.831</td><td>5</td><td>5.831</td><td>L is lonely: pushed from 5 to 5.8</td></tr>
  </table>
  <h3>Step 3: minimum spanning tree and the cluster hierarchy</h3>
  <p>Connect all 12 stalls with the cheapest set of 11 edges that links everyone (a <strong>minimum spanning tree</strong>, MST), using d_mr as the cost. Then remove edges from the most expensive down; each removal is "eps dropping below that value":</p>
  <div class="fx" data-lang="py">from scipy.sparse.csgraph import minimum_spanning_tree
k = 4                                                     # min_samples (the point itself counts)
core_d = np.sort(D, axis=1)[:, k - 1]                     # k-th smallest distance in each row = core distance
mr = np.maximum(np.maximum(core_d[:, None], core_d[None, :]), D)   # mutual reachability matrix
print("core distance:", " ".join(f"{n}={v:.3f}" for n, v in zip(names, core_d)))
mst = minimum_spanning_tree(mr).tocoo()                   # cheapest tree linking all 12 stalls
edges = sorted(zip(mst.data, mst.row, mst.col), reverse=True)
print("MST edges, most expensive first:")
print("  " + ", ".join(f"{names[i]}-{names[j]} {w:.3f}" for w, i, j in edges))
h12 = HDBSCAN(min_cluster_size=3, min_samples=4, copy=True).fit(P)
print("labels       :", " ".join(f"{n}={v}" for n, v in zip(names, h12.labels_)))
print("probabilities:", " ".join(f"{n}={v:.3f}" for n, v in zip(names, h12.probabilities_)))</div>
  <div class="fx" data-lang="text">core distance: A=1.414 B=1.414 C=1.414 D=1.000 E=2.000 F=1.414 G=1.414 H=1.414 I=1.414 J=2.236 K=4.472 L=5.831
MST edges, most expensive first:
  F-L 5.831, F-K 4.472, E-F 4.243, G-J 2.236, B-E 2.000, F-I 1.414, F-H 1.414, F-G 1.414, A-D 1.414, A-C 1.414, A-B 1.414
labels       : A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=-1 L=-1
probabilities: A=1.000 B=1.000 C=1.000 D=1.000 E=0.707 F=1.000 G=1.000 H=1.000 I=1.000 J=0.632 K=0.000 L=0.000</div>
  <p>(With ties the MST may pick a different but equally cheap edge, for example F–L instead of G–L, both 5.831; the hierarchy is the same.)</p>
  <table class="tbl">
    <tr><th>Remove edges at d_mr</th><th>λ = 1/d</th><th>What happens</th></tr>
    <tr><td>5.831 (F–L)</td><td>0.171</td><td>L falls off alone. One stall is smaller than min_cluster_size = 3, so it is not a new cluster: L simply <em>leaves</em> as noise.</td></tr>
    <tr><td>4.472 (F–K)</td><td>0.224</td><td>K falls off alone: noise.</td></tr>
    <tr><td>4.243 (E–F)</td><td>0.236</td><td>{A–E} and {F–J} separate. Both have ≥ 3 stalls → a <strong>true split</strong>: two clusters are born.</td></tr>
    <tr><td>2.236 (G–J)</td><td>0.447</td><td>J drops off the college market (leaves); the cluster continues as {F, G, H, I}.</td></tr>
    <tr><td>2.000 (B–E)</td><td>0.5</td><td>E drops off the station market.</td></tr>
    <tr><td>1.414 (the square edges)</td><td>0.707</td><td>Both squares fall apart into single stalls; both clusters end.</td></tr>
  </table>
  <p>This is exactly single-linkage clustering (see <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a>) run on mutual reachability distances. Rows like "J drops off" are what min_cluster_size is for: a split that sheds fewer than min_cluster_size points is not treated as two clusters, only as the parent getting smaller. This simplified tree is the <strong>condensed tree</strong>.</p>
  <h3>Step 4: stability and choosing the clusters</h3>
  <p>HDBSCAN measures time in λ = 1 / distance, so λ grows as eps shrinks (λ = 0 at infinite eps). A point p "leaves" a cluster at λ_p, and the cluster is "born" at λ_birth.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stability</strong> of a cluster C = Σ over its points p of (λ_p − λ_birth(C)): the total "lifetime" of the cluster's points. Many points staying for a long range of eps → high stability.<br><strong>Excess-of-mass selection</strong>: walking up from the leaves, keep a cluster if its own stability is larger than the sum of the stabilities of its selected children; otherwise keep the children. Selected clusters may not overlap.</p>
  </div>
  <table class="tbl">
    <tr><th>Cluster</th><th>Born at</th><th>Points leave at</th><th>Stability</th></tr>
    <tr><td>{A,B,C,D,E}</td><td>λ = 1/4.243 = 0.236</td><td>E at 0.5; A, B, C, D at 0.707</td><td>(0.5 − 0.236) + 4 × (0.707 − 0.236) = 0.264 + 1.886 = <strong>2.150</strong></td></tr>
    <tr><td>{F,G,H,I,J}</td><td>0.236</td><td>J at 0.447; F, G, H, I at 0.707</td><td>(0.447 − 0.236) + 4 × 0.471 = 0.211 + 1.886 = <strong>2.097</strong></td></tr>
  </table>
  <p>Neither cluster has child clusters, so both are kept (the root, "everything", is not allowed to be a cluster by default). Result: {A–E} is cluster 0, {F–J} is cluster 1, K and L are noise: the same as DBSCAN with eps = 1.5, but found without choosing eps.</p>
  <p>HDBSCAN also reports a <strong>membership strength</strong> per point: λ_p divided by the largest λ in that point's cluster. E left at λ = 0.5 while its cluster lasted to 0.707, so its strength is 0.5 / 0.707 = 0.707. J: 0.447 / 0.707 = 0.632. The square stalls are 1. These match the probabilities printed above; DBSCAN's "border point" has become a number.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor"/>
<text x="54" y="34" text-anchor="end" class="tm" font-size="10">λ=0</text>
<text x="54" y="76" text-anchor="end" class="tm" font-size="10">0.236</text>
<text x="54" y="130" text-anchor="end" class="tm" font-size="10">0.45</text>
<text x="54" y="146" text-anchor="end" class="tm" font-size="10">0.5</text>
<text x="54" y="220" text-anchor="end" class="tm" font-size="10">0.707</text>
<text x="20" y="130" class="tm" font-size="10" transform="rotate(-90 20 130)">λ = 1/eps (eps shrinks ↓)</text>
<rect x="80" y="30" width="480" height="42" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="320" y="49" text-anchor="middle" font-size="11.5">root: all 12 stalls</text>
<text x="320" y="65" text-anchor="middle" class="tm" font-size="10.5">L leaves at λ 0.171, K at 0.224 (noise)</text>
<rect x="90" y="72" width="220" height="70" class="fb sb"/>
<rect x="110" y="142" width="180" height="78" class="fb sb"/>
<text x="200" y="100" text-anchor="middle" font-size="12" font-weight="700">{A,B,C,D,E}</text>
<text x="200" y="118" text-anchor="middle" class="tm" font-size="10.5">E leaves at λ = 0.5</text>
<text x="200" y="185" text-anchor="middle" font-size="11.5">{A,B,C,D}</text>
<rect x="330" y="72" width="220" height="56" class="fr sr"/>
<rect x="350" y="128" width="180" height="92" class="fr sr"/>
<text x="440" y="96" text-anchor="middle" font-size="12" font-weight="700">{F,G,H,I,J}</text>
<text x="440" y="114" text-anchor="middle" class="tm" font-size="10.5">J leaves at λ = 0.447</text>
<text x="440" y="180" text-anchor="middle" font-size="11.5">{F,G,H,I}</text>
<text x="200" y="240" text-anchor="middle" class="tb" font-size="11">stability 2.150 → selected</text>
<text x="440" y="240" text-anchor="middle" class="tr" font-size="11">stability 2.097 → selected</text>
</svg><figcaption>The condensed tree of the 12 stalls, drawn as an icicle: width ≈ number of stalls still in the cluster, height = how long (in λ) it lasts. Stability is the area of each coloured shape below its birth line.</figcaption></figure>
  <h3>The knobs on real data</h3>
  <p><strong>min_cluster_size</strong> is the main knob: the smallest group you are willing to call a cluster. <strong>min_samples</strong> (defaults to min_cluster_size) sets the k in core distance: larger values make the algorithm more conservative, pushing more points to noise. On the three clouds of section 07:</p>
  <div class="fx" data-lang="py">for mcs, ms in [(5, None), (20, None), (60, None), (20, 5), (20, 40)]:
    l = HDBSCAN(min_cluster_size=mcs, min_samples=ms, copy=True).fit_predict(Xv)
    print(f"min_cluster_size={mcs:&lt;3} min_samples={str(ms):4s} -&gt; clusters={len(set(l) - {-1})} "
          f"noise={(l == -1).sum():3d} ARI={adjusted_rand_score(yv, l):.3f}")
l = HDBSCAN(min_cluster_size=20, cluster_selection_method="leaf", copy=True).fit_predict(Xv)
print(f"cluster_selection_method='leaf'      -&gt; clusters={len(set(l) - {-1})} noise={(l == -1).sum():3d} "
      f"ARI={adjusted_rand_score(yv, l):.3f}")</div>
  <div class="fx" data-lang="text">min_cluster_size=5   min_samples=None -&gt; clusters=4 noise= 39 ARI=0.896
min_cluster_size=20  min_samples=None -&gt; clusters=3 noise= 30 ARI=0.913
min_cluster_size=60  min_samples=None -&gt; clusters=3 noise= 71 ARI=0.845
min_cluster_size=20  min_samples=5    -&gt; clusters=3 noise= 14 ARI=0.962
min_cluster_size=20  min_samples=40   -&gt; clusters=3 noise= 52 ARI=0.875
cluster_selection_method='leaf'      -&gt; clusters=3 noise= 30 ARI=0.913</div>
  <p>min_cluster_size = 5 lets one small accidental clump count as a fourth cluster; 20 and 60 both find the 3 clouds (60 is stricter, so more thin-edge points become noise). Lowering min_samples to 5 keeps min_cluster_size = 20 but makes core distances smaller, so fewer points are noise (14) and ARI rises to 0.962. min_samples = 40 is very conservative (52 noise). <code>cluster_selection_method="leaf"</code> picks the leaves of the condensed tree instead of the most stable clusters, which gives many small homogeneous clusters on data with sub-structure (here the same 3).</p>
  <h3>Soft information: probabilities</h3>
  <div class="fx" data-lang="py">h = HDBSCAN(min_cluster_size=20, copy=True).fit(Xv)
p = h.probabilities_
print("rows with probability 1.0 (deep inside):", (p == 1).sum())
print("rows in a cluster but weak (0 &lt; p &lt; 0.3):", ((p &gt; 0) &amp; (p &lt; 0.3)).sum())
print("noise rows (p = 0):", (p == 0).sum())</div>
  <div class="fx" data-lang="text">rows with probability 1.0 (deep inside): 60
rows in a cluster but weak (0 &lt; p &lt; 0.3): 29
noise rows (p = 0): 30</div>
  <p>Every clustered point gets a strength between 0 and 1. 29 points are in a cluster but only weakly: they are good candidates for "unsure" in a business report. Other useful HDBSCAN settings: <code>cluster_selection_epsilon</code> (merge clusters closer than this distance, useful when HDBSCAN produces many tiny clusters in a dense region), <code>max_cluster_size</code>, <code>allow_single_cluster=True</code> (allow the answer "it is all one cluster"), and <code>store_centers="centroid"</code> or <code>"medoid"</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>HDBSCAN removes eps but not judgement. min_cluster_size still decides what counts as a cluster (5 gave a fake fourth cluster above), and a large share of noise (30–50% is common on real data) is normal behaviour, not a bug. If you must label everyone, assign noise points afterwards to the nearest cluster and report them separately.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> HDBSCAN hides the eps scale inside a tree. Can we <em>see</em> the density structure as one picture, and still cut it at an eps of our choice? <b>Next: OPTICS.</b></div>

  <h2 id="db-optics"><span class="num">09</span>OPTICS (brief)</h2>
  <p><strong>The question we can't answer yet.</strong> We would like one picture that shows every cluster at every density, from which any DBSCAN result can be read off.</p>
  <p>OPTICS ("Ordering Points To Identify the Clustering Structure", Ankerst et al., 1999) visits the points in a special order: always next the point that is easiest to reach from what has been visited so far. For each point it records a <strong>reachability distance</strong>, built from the same core distances as HDBSCAN. Plotting reachability in visiting order gives a <strong>reachability plot</strong>: clusters appear as valleys (points reached cheaply one after another), and the walls between valleys are the jumps from one cluster to the next.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reachability distance</strong> of q from p: reach(q | p) = max( core_k(p), d(p, q) ). (Mutual reachability takes the max with <em>both</em> core distances; OPTICS uses only the one it comes from.) OPTICS repeatedly moves to the unvisited point with the smallest reachability from any visited point and records that value. A horizontal cut at height eps on the reachability plot gives the DBSCAN clustering at that eps (up to border-point details).</p>
  </div>
  <p>On the twelve stalls with min_samples = 4:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import OPTICS, cluster_optics_dbscan
op = OPTICS(min_samples=4, max_eps=np.inf).fit(P)
print("order        :", " ".join(names[i] for i in op.ordering_))
print("reachability :", " ".join(f"{op.reachability_[i]:.2f}" for i in op.ordering_))
print("core distance:", " ".join(f"{op.core_distances_[i]:.2f}" for i in op.ordering_))
lab15 = cluster_optics_dbscan(reachability=op.reachability_, core_distances=op.core_distances_,
                              ordering=op.ordering_, eps=1.5)
print("cut at eps=1.5:", " ".join(f"{n}={v}" for n, v in zip(names, lab15)))</div>
  <div class="fx" data-lang="text">order        : A B C D E F G H I J K L
reachability : inf 1.41 1.41 1.41 1.00 4.24 1.41 1.41 1.41 1.41 3.61 5.00
core distance: 1.41 1.41 1.41 1.00 2.00 1.41 1.41 1.41 1.41 2.24 4.47 5.83
cut at eps=1.5: A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=-1 L=-1</div>
  <p>Read it as a walk. Start at A (no predecessor: inf). B, C, D are reached at 1.41 (A's core distance). E is reached from D at max(1.0, 1) = 1.00. Then the cheapest next step is F, at max(core E = 2, d(E, F) = 4.243) = 4.24: a tall wall, we are leaving the station market. G, H, I at 1.41 form the college valley, J at 1.41 from I. K is reached from H at max(1.414, 3.606) = 3.61, and L from G at max(1.414, 5) = 5.00: two more walls. Cutting at eps = 1.5 marks every reachability above 1.5 as "something new starts here" and reproduces DBSCAN's labels exactly.</p>
  <p>On the three clouds, one OPTICS run gives the plot below. Its automatic "xi" method detects valleys by the steepness of their walls (<code>xi</code> = minimum relative drop):</p>
  <div class="fx" data-lang="py">op = OPTICS(min_samples=30, xi=0.05, min_cluster_size=30).fit(Xv)
l = op.labels_
print(f"OPTICS xi=0.05: clusters={len(set(l) - {-1})} noise={(l == -1).sum()} ARI={adjusted_rand_score(yv, l):.3f}")
for e in (0.4, 1.0):
    l = cluster_optics_dbscan(reachability=op.reachability_, core_distances=op.core_distances_,
                              ordering=op.ordering_, eps=e)
    print(f"same OPTICS run, cut at eps={e}: clusters={len(set(l) - {-1})} noise={(l == -1).sum()}")</div>
  <div class="fx" data-lang="text">OPTICS xi=0.05: clusters=3 noise=4 ARI=0.946
same OPTICS run, cut at eps=0.4: clusters=2 noise=395
same OPTICS run, cut at eps=1.0: clusters=3 noise=60</div>
  <figure class="viz"><svg viewBox="0 0 620 230" width="620">
<line x1="50" y1="185" x2="600" y2="185" stroke="currentColor"/><line x1="50" y1="15" x2="50" y2="185" stroke="currentColor"/>
<text x="44" y="189" text-anchor="end" class="tm" font-size="10">0</text>
<text x="44" y="146" text-anchor="end" class="tm" font-size="10">0.5</text>
<text x="44" y="104" text-anchor="end" class="tm" font-size="10">1.0</text>
<text x="44" y="62" text-anchor="end" class="tm" font-size="10">1.5</text>
<text x="44" y="19" text-anchor="end" class="tm" font-size="10">2.0</text>
<rect x="50.00" y="15.0" width="1.09" height="170.0" class="fb"/>
<rect x="50.79" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="51.57" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="52.36" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="53.14" y="173.2" width="1.09" height="11.8" class="fb"/>
<rect x="53.93" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="54.71" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="55.50" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="56.29" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="57.07" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="57.86" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="58.64" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="59.43" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="60.21" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="61.00" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="61.79" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="62.57" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="63.36" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="64.14" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="64.93" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="65.71" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="66.50" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="67.29" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="68.07" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="68.86" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="69.64" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="70.43" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="71.21" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="72.00" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="72.79" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="73.57" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="74.36" y="173.9" width="1.09" height="11.1" class="fb"/>
<rect x="75.14" y="173.9" width="1.09" height="11.1" class="fb"/>
<rect x="75.93" y="173.9" width="1.09" height="11.1" class="fb"/>
<rect x="76.71" y="173.8" width="1.09" height="11.2" class="fb"/>
<rect x="77.50" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="78.29" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="79.07" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="79.86" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="80.64" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="81.43" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="82.21" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="83.00" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="83.79" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="84.57" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="85.36" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="86.14" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="86.93" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="87.71" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="88.50" y="173.5" width="1.09" height="11.5" class="fb"/>
<rect x="89.29" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="90.07" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="90.86" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="91.64" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="92.43" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="93.21" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="94.00" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="94.79" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="95.57" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="96.36" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="97.14" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="97.93" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="98.71" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="99.50" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="100.29" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="101.07" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="101.86" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="102.64" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="103.43" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="104.21" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="105.00" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="105.79" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="106.57" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="107.36" y="173.7" width="1.09" height="11.3" class="fb"/>
<rect x="108.14" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="108.93" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="109.71" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="110.50" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="111.29" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="112.07" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="112.86" y="174.0" width="1.09" height="11.0" class="fb"/>
<rect x="113.64" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="114.43" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="115.21" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="116.00" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="116.79" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="117.57" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="118.36" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="119.14" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="119.93" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="120.71" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="121.50" y="174.2" width="1.09" height="10.8" class="fb"/>
<rect x="122.29" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="123.07" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="123.86" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="124.64" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="125.43" y="174.1" width="1.09" height="10.9" class="fb"/>
<rect x="126.21" y="173.4" width="1.09" height="11.6" class="fb"/>
<rect x="127.00" y="173.3" width="1.09" height="11.7" class="fb"/>
<rect x="127.79" y="173.2" width="1.09" height="11.8" class="fb"/>
<rect x="128.57" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="129.36" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="130.14" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="130.93" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="131.71" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="132.50" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="133.29" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="134.07" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="134.86" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="135.64" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="136.43" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="137.21" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="138.00" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="138.79" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="139.57" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="140.36" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="141.14" y="173.1" width="1.09" height="11.9" class="fb"/>
<rect x="141.93" y="172.9" width="1.09" height="12.1" class="fb"/>
<rect x="142.71" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="143.50" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="144.29" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="145.07" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="145.86" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="146.64" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="147.43" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="148.21" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="149.00" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="149.79" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="150.57" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="151.36" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="152.14" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="152.93" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="153.71" y="172.8" width="1.09" height="12.2" class="fb"/>
<rect x="154.50" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="155.29" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="156.07" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="156.86" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="157.64" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="158.43" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="159.21" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="160.00" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="160.79" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="161.57" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="162.36" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="163.14" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="163.93" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="164.71" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="165.50" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="166.29" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="167.07" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="167.86" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="168.64" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="169.43" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="170.21" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="171.00" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="171.79" y="172.7" width="1.09" height="12.3" class="fb"/>
<rect x="172.57" y="172.6" width="1.09" height="12.4" class="fb"/>
<rect x="173.36" y="172.6" width="1.09" height="12.4" class="fb"/>
<rect x="174.14" y="172.5" width="1.09" height="12.5" class="fb"/>
<rect x="174.93" y="172.5" width="1.09" height="12.5" class="fb"/>
<rect x="175.71" y="172.5" width="1.09" height="12.5" class="fb"/>
<rect x="176.50" y="172.4" width="1.09" height="12.6" class="fb"/>
<rect x="177.29" y="172.4" width="1.09" height="12.6" class="fb"/>
<rect x="178.07" y="172.4" width="1.09" height="12.6" class="fb"/>
<rect x="178.86" y="172.4" width="1.09" height="12.6" class="fb"/>
<rect x="179.64" y="172.3" width="1.09" height="12.7" class="fb"/>
<rect x="180.43" y="172.2" width="1.09" height="12.8" class="fb"/>
<rect x="181.21" y="172.2" width="1.09" height="12.8" class="fb"/>
<rect x="182.00" y="172.2" width="1.09" height="12.8" class="fb"/>
<rect x="182.79" y="172.2" width="1.09" height="12.8" class="fb"/>
<rect x="183.57" y="172.2" width="1.09" height="12.8" class="fb"/>
<rect x="184.36" y="172.2" width="1.09" height="12.8" class="fb"/>
<rect x="185.14" y="172.1" width="1.09" height="12.9" class="fb"/>
<rect x="185.93" y="172.1" width="1.09" height="12.9" class="fb"/>
<rect x="186.71" y="172.1" width="1.09" height="12.9" class="fb"/>
<rect x="187.50" y="172.0" width="1.09" height="13.0" class="fb"/>
<rect x="188.29" y="172.0" width="1.09" height="13.0" class="fb"/>
<rect x="189.07" y="171.8" width="1.09" height="13.2" class="fb"/>
<rect x="189.86" y="171.7" width="1.09" height="13.3" class="fb"/>
<rect x="190.64" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="191.43" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="192.21" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="193.00" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="193.79" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="194.57" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="195.36" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="196.14" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="196.93" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="197.71" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="198.50" y="171.6" width="1.09" height="13.4" class="fb"/>
<rect x="199.29" y="171.5" width="1.09" height="13.5" class="fb"/>
<rect x="200.07" y="171.5" width="1.09" height="13.5" class="fb"/>
<rect x="200.86" y="171.4" width="1.09" height="13.6" class="fb"/>
<rect x="201.64" y="171.4" width="1.09" height="13.6" class="fb"/>
<rect x="202.43" y="171.4" width="1.09" height="13.6" class="fb"/>
<rect x="203.21" y="171.4" width="1.09" height="13.6" class="fb"/>
<rect x="204.00" y="171.2" width="1.09" height="13.8" class="fb"/>
<rect x="204.79" y="171.2" width="1.09" height="13.8" class="fb"/>
<rect x="205.57" y="171.2" width="1.09" height="13.8" class="fb"/>
<rect x="206.36" y="171.2" width="1.09" height="13.8" class="fb"/>
<rect x="207.14" y="171.1" width="1.09" height="13.9" class="fb"/>
<rect x="207.93" y="171.1" width="1.09" height="13.9" class="fb"/>
<rect x="208.71" y="171.1" width="1.09" height="13.9" class="fb"/>
<rect x="209.50" y="171.1" width="1.09" height="13.9" class="fb"/>
<rect x="210.29" y="170.9" width="1.09" height="14.1" class="fb"/>
<rect x="211.07" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="211.86" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="212.64" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="213.43" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="214.21" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="215.00" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="215.79" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="216.57" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="217.36" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="218.14" y="170.7" width="1.09" height="14.3" class="fb"/>
<rect x="218.93" y="170.5" width="1.09" height="14.5" class="fb"/>
<rect x="219.71" y="170.3" width="1.09" height="14.7" class="fb"/>
<rect x="220.50" y="170.3" width="1.09" height="14.7" class="fb"/>
<rect x="221.29" y="170.3" width="1.09" height="14.7" class="fb"/>
<rect x="222.07" y="170.3" width="1.09" height="14.7" class="fb"/>
<rect x="222.86" y="170.2" width="1.09" height="14.8" class="fb"/>
<rect x="223.64" y="169.8" width="1.09" height="15.2" class="fb"/>
<rect x="224.43" y="169.8" width="1.09" height="15.2" class="fb"/>
<rect x="225.21" y="169.7" width="1.09" height="15.3" class="fb"/>
<rect x="226.00" y="169.7" width="1.09" height="15.3" class="fb"/>
<rect x="226.79" y="169.7" width="1.09" height="15.3" class="fb"/>
<rect x="227.57" y="169.7" width="1.09" height="15.3" class="fb"/>
<rect x="228.36" y="169.7" width="1.09" height="15.3" class="fb"/>
<rect x="229.14" y="169.6" width="1.09" height="15.4" class="fb"/>
<rect x="229.93" y="169.5" width="1.09" height="15.5" class="fb"/>
<rect x="230.71" y="169.5" width="1.09" height="15.5" class="fb"/>
<rect x="231.50" y="169.5" width="1.09" height="15.5" class="fb"/>
<rect x="232.29" y="169.5" width="1.09" height="15.5" class="fb"/>
<rect x="233.07" y="169.5" width="1.09" height="15.5" class="fb"/>
<rect x="233.86" y="169.2" width="1.09" height="15.8" class="fb"/>
<rect x="234.64" y="169.2" width="1.09" height="15.8" class="fb"/>
<rect x="235.43" y="169.2" width="1.09" height="15.8" class="fb"/>
<rect x="236.21" y="169.2" width="1.09" height="15.8" class="fb"/>
<rect x="237.00" y="169.1" width="1.09" height="15.9" class="fb"/>
<rect x="237.79" y="169.1" width="1.09" height="15.9" class="fb"/>
<rect x="238.57" y="169.1" width="1.09" height="15.9" class="fb"/>
<rect x="239.36" y="169.0" width="1.09" height="16.0" class="fb"/>
<rect x="240.14" y="169.0" width="1.09" height="16.0" class="fb"/>
<rect x="240.93" y="168.9" width="1.09" height="16.1" class="fb"/>
<rect x="241.71" y="168.9" width="1.09" height="16.1" class="fb"/>
<rect x="242.50" y="168.8" width="1.09" height="16.2" class="fb"/>
<rect x="243.29" y="168.7" width="1.09" height="16.3" class="fb"/>
<rect x="244.07" y="168.7" width="1.09" height="16.3" class="fb"/>
<rect x="244.86" y="168.6" width="1.09" height="16.4" class="fb"/>
<rect x="245.64" y="168.5" width="1.09" height="16.5" class="fb"/>
<rect x="246.43" y="168.5" width="1.09" height="16.5" class="fb"/>
<rect x="247.21" y="168.5" width="1.09" height="16.5" class="fb"/>
<rect x="248.00" y="168.3" width="1.09" height="16.7" class="fb"/>
<rect x="248.79" y="168.2" width="1.09" height="16.8" class="fb"/>
<rect x="249.57" y="168.2" width="1.09" height="16.8" class="fb"/>
<rect x="250.36" y="168.2" width="1.09" height="16.8" class="fb"/>
<rect x="251.14" y="168.0" width="1.09" height="17.0" class="fb"/>
<rect x="251.93" y="168.0" width="1.09" height="17.0" class="fb"/>
<rect x="252.71" y="168.0" width="1.09" height="17.0" class="fb"/>
<rect x="253.50" y="167.6" width="1.09" height="17.4" class="fb"/>
<rect x="254.29" y="167.3" width="1.09" height="17.7" class="fb"/>
<rect x="255.07" y="167.1" width="1.09" height="17.9" class="fb"/>
<rect x="255.86" y="167.1" width="1.09" height="17.9" class="fb"/>
<rect x="256.64" y="166.9" width="1.09" height="18.1" class="fb"/>
<rect x="257.43" y="166.8" width="1.09" height="18.2" class="fb"/>
<rect x="258.21" y="166.8" width="1.09" height="18.2" class="fb"/>
<rect x="259.00" y="166.6" width="1.09" height="18.4" class="fb"/>
<rect x="259.79" y="166.1" width="1.09" height="18.9" class="fb"/>
<rect x="260.57" y="166.1" width="1.09" height="18.9" class="fb"/>
<rect x="261.36" y="165.9" width="1.09" height="19.1" class="fb"/>
<rect x="262.14" y="165.5" width="1.09" height="19.5" class="fb"/>
<rect x="262.93" y="165.5" width="1.09" height="19.5" class="fb"/>
<rect x="263.71" y="165.5" width="1.09" height="19.5" class="fb"/>
<rect x="264.50" y="165.5" width="1.09" height="19.5" class="fb"/>
<rect x="265.29" y="165.4" width="1.09" height="19.6" class="fb"/>
<rect x="266.07" y="165.3" width="1.09" height="19.7" class="fb"/>
<rect x="266.86" y="164.8" width="1.09" height="20.2" class="fb"/>
<rect x="267.64" y="164.5" width="1.09" height="20.5" class="fb"/>
<rect x="268.43" y="164.5" width="1.09" height="20.5" class="fb"/>
<rect x="269.21" y="164.1" width="1.09" height="20.9" class="fb"/>
<rect x="270.00" y="163.2" width="1.09" height="21.8" class="fb"/>
<rect x="270.79" y="162.8" width="1.09" height="22.2" class="fb"/>
<rect x="271.57" y="162.8" width="1.09" height="22.2" class="fb"/>
<rect x="272.36" y="162.2" width="1.09" height="22.8" class="fb"/>
<rect x="273.14" y="161.8" width="1.09" height="23.2" class="fb"/>
<rect x="273.93" y="161.6" width="1.09" height="23.4" class="fb"/>
<rect x="274.71" y="161.5" width="1.09" height="23.5" class="fb"/>
<rect x="275.50" y="161.5" width="1.09" height="23.5" class="fb"/>
<rect x="276.29" y="161.5" width="1.09" height="23.5" class="fb"/>
<rect x="277.07" y="159.4" width="1.09" height="25.6" class="fb"/>
<rect x="277.86" y="158.7" width="1.09" height="26.3" class="fb"/>
<rect x="278.64" y="157.3" width="1.09" height="27.7" class="fb"/>
<rect x="279.43" y="156.9" width="1.09" height="28.1" class="fb"/>
<rect x="280.21" y="156.0" width="1.09" height="29.0" class="fb"/>
<rect x="281.00" y="155.6" width="1.09" height="29.4" class="fb"/>
<rect x="281.79" y="155.2" width="1.09" height="29.8" class="fb"/>
<rect x="282.57" y="155.1" width="1.09" height="29.9" class="fb"/>
<rect x="283.36" y="153.3" width="1.09" height="31.7" class="fb"/>
<rect x="284.14" y="149.5" width="1.09" height="35.5" class="fb"/>
<rect x="284.93" y="145.1" width="1.09" height="39.9" class="fb"/>
<rect x="285.71" y="125.9" width="1.09" height="59.1" class="fb"/>
<rect x="286.50" y="80.1" width="1.09" height="104.9" class="fb"/>
<rect x="287.29" y="80.1" width="1.09" height="104.9" class="fb"/>
<rect x="288.07" y="72.6" width="1.09" height="112.4" class="fb"/>
<rect x="288.86" y="70.4" width="1.09" height="114.6" class="fb"/>
<rect x="289.64" y="63.7" width="1.09" height="121.3" class="fb"/>
<rect x="290.43" y="60.7" width="1.09" height="124.3" class="fb"/>
<rect x="291.21" y="56.8" width="1.09" height="128.2" class="fb"/>
<rect x="292.00" y="47.9" width="1.09" height="137.1" class="fr"/>
<rect x="292.79" y="99.7" width="1.09" height="85.3" class="fr"/>
<rect x="293.57" y="99.7" width="1.09" height="85.3" class="fr"/>
<rect x="294.36" y="107.7" width="1.09" height="77.3" class="fr"/>
<rect x="295.14" y="107.7" width="1.09" height="77.3" class="fr"/>
<rect x="295.93" y="120.9" width="1.09" height="64.1" class="fr"/>
<rect x="296.71" y="122.6" width="1.09" height="62.4" class="fr"/>
<rect x="297.50" y="122.6" width="1.09" height="62.4" class="fr"/>
<rect x="298.29" y="122.6" width="1.09" height="62.4" class="fr"/>
<rect x="299.07" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="299.86" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="300.64" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="301.43" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="302.21" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="303.00" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="303.79" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="304.57" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="305.36" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="306.14" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="306.93" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="307.71" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="308.50" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="309.29" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="310.07" y="139.0" width="1.09" height="46.0" class="fr"/>
<rect x="310.86" y="139.0" width="1.09" height="46.0" class="fr"/>
<rect x="311.64" y="139.0" width="1.09" height="46.0" class="fr"/>
<rect x="312.43" y="139.0" width="1.09" height="46.0" class="fr"/>
<rect x="313.21" y="139.0" width="1.09" height="46.0" class="fr"/>
<rect x="314.00" y="139.0" width="1.09" height="46.0" class="fr"/>
<rect x="314.79" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="315.57" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="316.36" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="317.14" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="317.93" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="318.71" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="319.50" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="320.29" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="321.07" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="321.86" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="322.64" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="323.43" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="324.21" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="325.00" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="325.79" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="326.57" y="140.6" width="1.09" height="44.4" class="fr"/>
<rect x="327.36" y="141.1" width="1.09" height="43.9" class="fr"/>
<rect x="328.14" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="328.93" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="329.71" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="330.50" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="331.29" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="332.07" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="332.86" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="333.64" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="334.43" y="142.9" width="1.09" height="42.1" class="fr"/>
<rect x="335.21" y="141.1" width="1.09" height="43.9" class="fr"/>
<rect x="336.00" y="141.1" width="1.09" height="43.9" class="fr"/>
<rect x="336.79" y="139.8" width="1.09" height="45.2" class="fr"/>
<rect x="337.57" y="139.8" width="1.09" height="45.2" class="fr"/>
<rect x="338.36" y="139.8" width="1.09" height="45.2" class="fr"/>
<rect x="339.14" y="139.8" width="1.09" height="45.2" class="fr"/>
<rect x="339.93" y="139.8" width="1.09" height="45.2" class="fr"/>
<rect x="340.71" y="139.8" width="1.09" height="45.2" class="fr"/>
<rect x="341.50" y="139.5" width="1.09" height="45.5" class="fr"/>
<rect x="342.29" y="139.4" width="1.09" height="45.6" class="fr"/>
<rect x="343.07" y="138.0" width="1.09" height="47.0" class="fr"/>
<rect x="343.86" y="137.5" width="1.09" height="47.5" class="fr"/>
<rect x="344.64" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="345.43" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="346.21" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="347.00" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="347.79" y="136.2" width="1.09" height="48.8" class="fr"/>
<rect x="348.57" y="136.0" width="1.09" height="49.0" class="fr"/>
<rect x="349.36" y="135.7" width="1.09" height="49.3" class="fr"/>
<rect x="350.14" y="135.7" width="1.09" height="49.3" class="fr"/>
<rect x="350.93" y="135.3" width="1.09" height="49.7" class="fr"/>
<rect x="351.71" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="352.50" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="353.29" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="354.07" y="134.6" width="1.09" height="50.4" class="fr"/>
<rect x="354.86" y="134.4" width="1.09" height="50.6" class="fr"/>
<rect x="355.64" y="134.4" width="1.09" height="50.6" class="fr"/>
<rect x="356.43" y="133.9" width="1.09" height="51.1" class="fr"/>
<rect x="357.21" y="132.9" width="1.09" height="52.1" class="fr"/>
<rect x="358.00" y="132.9" width="1.09" height="52.1" class="fr"/>
<rect x="358.79" y="132.9" width="1.09" height="52.1" class="fr"/>
<rect x="359.57" y="132.3" width="1.09" height="52.7" class="fr"/>
<rect x="360.36" y="131.4" width="1.09" height="53.6" class="fr"/>
<rect x="361.14" y="131.4" width="1.09" height="53.6" class="fr"/>
<rect x="361.93" y="131.3" width="1.09" height="53.7" class="fr"/>
<rect x="362.71" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="363.50" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="364.29" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="365.07" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="365.86" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="366.64" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="367.43" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="368.21" y="131.1" width="1.09" height="53.9" class="fr"/>
<rect x="369.00" y="130.8" width="1.09" height="54.2" class="fr"/>
<rect x="369.79" y="130.8" width="1.09" height="54.2" class="fr"/>
<rect x="370.57" y="130.6" width="1.09" height="54.4" class="fr"/>
<rect x="371.36" y="130.6" width="1.09" height="54.4" class="fr"/>
<rect x="372.14" y="129.9" width="1.09" height="55.1" class="fr"/>
<rect x="372.93" y="129.8" width="1.09" height="55.2" class="fr"/>
<rect x="373.71" y="129.2" width="1.09" height="55.8" class="fr"/>
<rect x="374.50" y="129.1" width="1.09" height="55.9" class="fr"/>
<rect x="375.29" y="129.0" width="1.09" height="56.0" class="fr"/>
<rect x="376.07" y="129.0" width="1.09" height="56.0" class="fr"/>
<rect x="376.86" y="129.0" width="1.09" height="56.0" class="fr"/>
<rect x="377.64" y="129.0" width="1.09" height="56.0" class="fr"/>
<rect x="378.43" y="128.8" width="1.09" height="56.2" class="fr"/>
<rect x="379.21" y="128.4" width="1.09" height="56.6" class="fr"/>
<rect x="380.00" y="128.2" width="1.09" height="56.8" class="fr"/>
<rect x="380.79" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="381.57" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="382.36" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="383.14" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="383.93" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="384.71" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="385.50" y="127.2" width="1.09" height="57.8" class="fr"/>
<rect x="386.29" y="126.7" width="1.09" height="58.3" class="fr"/>
<rect x="387.07" y="126.7" width="1.09" height="58.3" class="fr"/>
<rect x="387.86" y="126.7" width="1.09" height="58.3" class="fr"/>
<rect x="388.64" y="126.2" width="1.09" height="58.8" class="fr"/>
<rect x="389.43" y="125.5" width="1.09" height="59.5" class="fr"/>
<rect x="390.21" y="125.5" width="1.09" height="59.5" class="fr"/>
<rect x="391.00" y="125.5" width="1.09" height="59.5" class="fr"/>
<rect x="391.79" y="125.5" width="1.09" height="59.5" class="fr"/>
<rect x="392.57" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="393.36" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="394.14" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="394.93" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="395.71" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="396.50" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="397.29" y="124.6" width="1.09" height="60.4" class="fr"/>
<rect x="398.07" y="124.4" width="1.09" height="60.6" class="fr"/>
<rect x="398.86" y="124.3" width="1.09" height="60.7" class="fr"/>
<rect x="399.64" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="400.43" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="401.21" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="402.00" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="402.79" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="403.57" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="404.36" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="405.14" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="405.93" y="124.1" width="1.09" height="60.9" class="fr"/>
<rect x="406.71" y="123.9" width="1.09" height="61.1" class="fr"/>
<rect x="407.50" y="123.8" width="1.09" height="61.2" class="fr"/>
<rect x="408.29" y="123.2" width="1.09" height="61.8" class="fr"/>
<rect x="409.07" y="122.8" width="1.09" height="62.2" class="fr"/>
<rect x="409.86" y="122.8" width="1.09" height="62.2" class="fr"/>
<rect x="410.64" y="122.8" width="1.09" height="62.2" class="fr"/>
<rect x="411.43" y="122.8" width="1.09" height="62.2" class="fr"/>
<rect x="412.21" y="122.3" width="1.09" height="62.7" class="fr"/>
<rect x="413.00" y="122.3" width="1.09" height="62.7" class="fr"/>
<rect x="413.79" y="122.3" width="1.09" height="62.7" class="fr"/>
<rect x="414.57" y="122.3" width="1.09" height="62.7" class="fr"/>
<rect x="415.36" y="122.1" width="1.09" height="62.9" class="fr"/>
<rect x="416.14" y="122.0" width="1.09" height="63.0" class="fr"/>
<rect x="416.93" y="122.0" width="1.09" height="63.0" class="fr"/>
<rect x="417.71" y="122.0" width="1.09" height="63.0" class="fr"/>
<rect x="418.50" y="122.0" width="1.09" height="63.0" class="fr"/>
<rect x="419.29" y="122.0" width="1.09" height="63.0" class="fr"/>
<rect x="420.07" y="122.0" width="1.09" height="63.0" class="fr"/>
<rect x="420.86" y="121.0" width="1.09" height="64.0" class="fr"/>
<rect x="421.64" y="121.0" width="1.09" height="64.0" class="fr"/>
<rect x="422.43" y="121.0" width="1.09" height="64.0" class="fr"/>
<rect x="423.21" y="121.0" width="1.09" height="64.0" class="fr"/>
<rect x="424.00" y="119.8" width="1.09" height="65.2" class="fr"/>
<rect x="424.79" y="119.8" width="1.09" height="65.2" class="fr"/>
<rect x="425.57" y="119.4" width="1.09" height="65.6" class="fr"/>
<rect x="426.36" y="119.4" width="1.09" height="65.6" class="fr"/>
<rect x="427.14" y="119.3" width="1.09" height="65.7" class="fr"/>
<rect x="427.93" y="118.8" width="1.09" height="66.2" class="fr"/>
<rect x="428.71" y="118.2" width="1.09" height="66.8" class="fr"/>
<rect x="429.50" y="116.8" width="1.09" height="68.2" class="fr"/>
<rect x="430.29" y="116.8" width="1.09" height="68.2" class="fr"/>
<rect x="431.07" y="116.7" width="1.09" height="68.3" class="fr"/>
<rect x="431.86" y="116.4" width="1.09" height="68.6" class="fr"/>
<rect x="432.64" y="116.1" width="1.09" height="68.9" class="fr"/>
<rect x="433.43" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="434.21" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="435.00" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="435.79" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="436.57" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="437.36" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="438.14" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="438.93" y="116.0" width="1.09" height="69.0" class="fr"/>
<rect x="439.71" y="115.7" width="1.09" height="69.3" class="fr"/>
<rect x="440.50" y="114.5" width="1.09" height="70.5" class="fr"/>
<rect x="441.29" y="114.4" width="1.09" height="70.6" class="fr"/>
<rect x="442.07" y="113.3" width="1.09" height="71.7" class="fr"/>
<rect x="442.86" y="113.3" width="1.09" height="71.7" class="fr"/>
<rect x="443.64" y="113.3" width="1.09" height="71.7" class="fr"/>
<rect x="444.43" y="113.3" width="1.09" height="71.7" class="fr"/>
<rect x="445.21" y="113.3" width="1.09" height="71.7" class="fr"/>
<rect x="446.00" y="112.7" width="1.09" height="72.3" class="fr"/>
<rect x="446.79" y="112.0" width="1.09" height="73.0" class="fr"/>
<rect x="447.57" y="112.0" width="1.09" height="73.0" class="fr"/>
<rect x="448.36" y="111.5" width="1.09" height="73.5" class="fr"/>
<rect x="449.14" y="111.3" width="1.09" height="73.7" class="fr"/>
<rect x="449.93" y="111.2" width="1.09" height="73.8" class="fr"/>
<rect x="450.71" y="110.7" width="1.09" height="74.3" class="fr"/>
<rect x="451.50" y="110.2" width="1.09" height="74.8" class="fr"/>
<rect x="452.29" y="110.2" width="1.09" height="74.8" class="fr"/>
<rect x="453.07" y="110.2" width="1.09" height="74.8" class="fr"/>
<rect x="453.86" y="110.0" width="1.09" height="75.0" class="fr"/>
<rect x="454.64" y="109.8" width="1.09" height="75.2" class="fr"/>
<rect x="455.43" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="456.21" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="457.00" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="457.79" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="458.57" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="459.36" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="460.14" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="460.93" y="109.2" width="1.09" height="75.8" class="fr"/>
<rect x="461.71" y="108.8" width="1.09" height="76.2" class="fr"/>
<rect x="462.50" y="108.8" width="1.09" height="76.2" class="fr"/>
<rect x="463.29" y="108.4" width="1.09" height="76.6" class="fr"/>
<rect x="464.07" y="108.4" width="1.09" height="76.6" class="fr"/>
<rect x="464.86" y="108.2" width="1.09" height="76.8" class="fr"/>
<rect x="465.64" y="108.2" width="1.09" height="76.8" class="fr"/>
<rect x="466.43" y="108.2" width="1.09" height="76.8" class="fr"/>
<rect x="467.21" y="107.5" width="1.09" height="77.5" class="fr"/>
<rect x="468.00" y="106.9" width="1.09" height="78.1" class="fr"/>
<rect x="468.79" y="106.1" width="1.09" height="78.9" class="fr"/>
<rect x="469.57" y="105.7" width="1.09" height="79.3" class="fr"/>
<rect x="470.36" y="105.3" width="1.09" height="79.7" class="fr"/>
<rect x="471.14" y="105.3" width="1.09" height="79.7" class="fr"/>
<rect x="471.93" y="105.1" width="1.09" height="79.9" class="fr"/>
<rect x="472.71" y="104.9" width="1.09" height="80.1" class="fr"/>
<rect x="473.50" y="104.9" width="1.09" height="80.1" class="fr"/>
<rect x="474.29" y="103.7" width="1.09" height="81.3" class="fr"/>
<rect x="475.07" y="103.7" width="1.09" height="81.3" class="fr"/>
<rect x="475.86" y="103.7" width="1.09" height="81.3" class="fr"/>
<rect x="476.64" y="103.6" width="1.09" height="81.4" class="fr"/>
<rect x="477.43" y="103.0" width="1.09" height="82.0" class="fr"/>
<rect x="478.21" y="101.8" width="1.09" height="83.2" class="fr"/>
<rect x="479.00" y="101.8" width="1.09" height="83.2" class="fr"/>
<rect x="479.79" y="101.8" width="1.09" height="83.2" class="fr"/>
<rect x="480.57" y="100.8" width="1.09" height="84.2" class="fr"/>
<rect x="481.36" y="100.1" width="1.09" height="84.9" class="fr"/>
<rect x="482.14" y="99.9" width="1.09" height="85.1" class="fr"/>
<rect x="482.93" y="99.7" width="1.09" height="85.3" class="fr"/>
<rect x="483.71" y="99.2" width="1.09" height="85.8" class="fr"/>
<rect x="484.50" y="98.4" width="1.09" height="86.6" class="fr"/>
<rect x="485.29" y="97.7" width="1.09" height="87.3" class="fr"/>
<rect x="486.07" y="97.7" width="1.09" height="87.3" class="fr"/>
<rect x="486.86" y="97.7" width="1.09" height="87.3" class="fr"/>
<rect x="487.64" y="96.6" width="1.09" height="88.4" class="fr"/>
<rect x="488.43" y="93.3" width="1.09" height="91.7" class="fr"/>
<rect x="489.21" y="93.1" width="1.09" height="91.9" class="fr"/>
<rect x="490.00" y="93.1" width="1.09" height="91.9" class="fr"/>
<rect x="490.79" y="93.1" width="1.09" height="91.9" class="fr"/>
<rect x="491.57" y="93.1" width="1.09" height="91.9" class="fr"/>
<rect x="492.36" y="92.4" width="1.09" height="92.6" class="fr"/>
<rect x="493.14" y="92.3" width="1.09" height="92.7" class="fr"/>
<rect x="493.93" y="92.3" width="1.09" height="92.7" class="fr"/>
<rect x="494.71" y="92.3" width="1.09" height="92.7" class="fr"/>
<rect x="495.50" y="91.8" width="1.09" height="93.2" class="fr"/>
<rect x="496.29" y="91.8" width="1.09" height="93.2" class="fr"/>
<rect x="497.07" y="91.8" width="1.09" height="93.2" class="fr"/>
<rect x="497.86" y="91.8" width="1.09" height="93.2" class="fr"/>
<rect x="498.64" y="90.1" width="1.09" height="94.9" class="fr"/>
<rect x="499.43" y="90.1" width="1.09" height="94.9" class="fr"/>
<rect x="500.21" y="90.1" width="1.09" height="94.9" class="fr"/>
<rect x="501.00" y="90.1" width="1.09" height="94.9" class="fr"/>
<rect x="501.79" y="90.1" width="1.09" height="94.9" class="fr"/>
<rect x="502.57" y="89.9" width="1.09" height="95.1" class="fr"/>
<rect x="503.36" y="89.9" width="1.09" height="95.1" class="fr"/>
<rect x="504.14" y="89.7" width="1.09" height="95.3" class="fr"/>
<rect x="504.93" y="89.0" width="1.09" height="96.0" class="fr"/>
<rect x="505.71" y="88.6" width="1.09" height="96.4" class="fr"/>
<rect x="506.50" y="83.3" width="1.09" height="101.7" class="fr"/>
<rect x="507.29" y="82.7" width="1.09" height="102.3" class="fr"/>
<rect x="508.07" y="82.6" width="1.09" height="102.4" class="fr"/>
<rect x="508.86" y="82.1" width="1.09" height="102.9" class="fr"/>
<rect x="509.64" y="81.2" width="1.09" height="103.8" class="fr"/>
<rect x="510.43" y="80.2" width="1.09" height="104.8" class="fr"/>
<rect x="511.21" y="79.2" width="1.09" height="105.8" class="fr"/>
<rect x="512.00" y="73.9" width="1.09" height="111.1" class="fr"/>
<rect x="512.79" y="73.9" width="1.09" height="111.1" class="fr"/>
<rect x="513.57" y="72.7" width="1.09" height="112.3" class="fr"/>
<rect x="514.36" y="71.7" width="1.09" height="113.3" class="fr"/>
<rect x="515.14" y="70.3" width="1.09" height="114.7" class="fr"/>
<rect x="515.93" y="65.7" width="1.09" height="119.3" class="fr"/>
<rect x="516.71" y="64.8" width="1.09" height="120.2" class="fr"/>
<rect x="517.50" y="55.0" width="1.09" height="130.0" class="fs"/>
<rect x="518.29" y="51.1" width="1.09" height="133.9" class="fs"/>
<rect x="519.07" y="47.2" width="1.09" height="137.8" class="fg"/>
<rect x="519.86" y="66.2" width="1.09" height="118.8" class="fg"/>
<rect x="520.64" y="92.7" width="1.09" height="92.3" class="fg"/>
<rect x="521.43" y="133.0" width="1.09" height="52.0" class="fg"/>
<rect x="522.21" y="136.8" width="1.09" height="48.2" class="fg"/>
<rect x="523.00" y="136.8" width="1.09" height="48.2" class="fg"/>
<rect x="523.79" y="136.8" width="1.09" height="48.2" class="fg"/>
<rect x="524.57" y="136.8" width="1.09" height="48.2" class="fg"/>
<rect x="525.36" y="145.8" width="1.09" height="39.2" class="fg"/>
<rect x="526.14" y="148.3" width="1.09" height="36.7" class="fg"/>
<rect x="526.93" y="148.3" width="1.09" height="36.7" class="fg"/>
<rect x="527.71" y="148.3" width="1.09" height="36.7" class="fg"/>
<rect x="528.50" y="148.6" width="1.09" height="36.4" class="fg"/>
<rect x="529.29" y="150.0" width="1.09" height="35.0" class="fg"/>
<rect x="530.07" y="150.0" width="1.09" height="35.0" class="fg"/>
<rect x="530.86" y="150.0" width="1.09" height="35.0" class="fg"/>
<rect x="531.64" y="150.0" width="1.09" height="35.0" class="fg"/>
<rect x="532.43" y="150.0" width="1.09" height="35.0" class="fg"/>
<rect x="533.21" y="150.0" width="1.09" height="35.0" class="fg"/>
<rect x="534.00" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="534.79" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="535.57" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="536.36" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="537.14" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="537.93" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="538.71" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="539.50" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="540.29" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="541.07" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="541.86" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="542.64" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="543.43" y="151.0" width="1.09" height="34.0" class="fg"/>
<rect x="544.21" y="152.0" width="1.09" height="33.0" class="fg"/>
<rect x="545.00" y="152.0" width="1.09" height="33.0" class="fg"/>
<rect x="545.79" y="152.0" width="1.09" height="33.0" class="fg"/>
<rect x="546.57" y="152.0" width="1.09" height="33.0" class="fg"/>
<rect x="547.36" y="152.0" width="1.09" height="33.0" class="fg"/>
<rect x="548.14" y="152.0" width="1.09" height="33.0" class="fg"/>
<rect x="548.93" y="150.5" width="1.09" height="34.5" class="fg"/>
<rect x="549.71" y="149.9" width="1.09" height="35.1" class="fg"/>
<rect x="550.50" y="149.9" width="1.09" height="35.1" class="fg"/>
<rect x="551.29" y="149.9" width="1.09" height="35.1" class="fg"/>
<rect x="552.07" y="149.0" width="1.09" height="36.0" class="fg"/>
<rect x="552.86" y="148.1" width="1.09" height="36.9" class="fg"/>
<rect x="553.64" y="148.1" width="1.09" height="36.9" class="fg"/>
<rect x="554.43" y="147.9" width="1.09" height="37.1" class="fg"/>
<rect x="555.21" y="147.9" width="1.09" height="37.1" class="fg"/>
<rect x="556.00" y="147.3" width="1.09" height="37.7" class="fg"/>
<rect x="556.79" y="146.9" width="1.09" height="38.1" class="fg"/>
<rect x="557.57" y="146.8" width="1.09" height="38.2" class="fg"/>
<rect x="558.36" y="146.3" width="1.09" height="38.7" class="fg"/>
<rect x="559.14" y="145.0" width="1.09" height="40.0" class="fg"/>
<rect x="559.93" y="145.0" width="1.09" height="40.0" class="fg"/>
<rect x="560.71" y="144.8" width="1.09" height="40.2" class="fg"/>
<rect x="561.50" y="144.8" width="1.09" height="40.2" class="fg"/>
<rect x="562.29" y="144.8" width="1.09" height="40.2" class="fg"/>
<rect x="563.07" y="144.8" width="1.09" height="40.2" class="fg"/>
<rect x="563.86" y="143.2" width="1.09" height="41.8" class="fg"/>
<rect x="564.64" y="142.7" width="1.09" height="42.3" class="fg"/>
<rect x="565.43" y="142.7" width="1.09" height="42.3" class="fg"/>
<rect x="566.21" y="142.5" width="1.09" height="42.5" class="fg"/>
<rect x="567.00" y="142.2" width="1.09" height="42.8" class="fg"/>
<rect x="567.79" y="141.3" width="1.09" height="43.7" class="fg"/>
<rect x="568.57" y="141.3" width="1.09" height="43.7" class="fg"/>
<rect x="569.36" y="141.2" width="1.09" height="43.8" class="fg"/>
<rect x="570.14" y="141.1" width="1.09" height="43.9" class="fg"/>
<rect x="570.93" y="141.1" width="1.09" height="43.9" class="fg"/>
<rect x="571.71" y="141.1" width="1.09" height="43.9" class="fg"/>
<rect x="572.50" y="139.2" width="1.09" height="45.8" class="fg"/>
<rect x="573.29" y="137.0" width="1.09" height="48.0" class="fg"/>
<rect x="574.07" y="136.8" width="1.09" height="48.2" class="fg"/>
<rect x="574.86" y="136.8" width="1.09" height="48.2" class="fg"/>
<rect x="575.64" y="136.1" width="1.09" height="48.9" class="fg"/>
<rect x="576.43" y="135.8" width="1.09" height="49.2" class="fg"/>
<rect x="577.21" y="135.7" width="1.09" height="49.3" class="fg"/>
<rect x="578.00" y="135.5" width="1.09" height="49.5" class="fg"/>
<rect x="578.79" y="135.5" width="1.09" height="49.5" class="fg"/>
<rect x="579.57" y="135.5" width="1.09" height="49.5" class="fg"/>
<rect x="580.36" y="135.5" width="1.09" height="49.5" class="fg"/>
<rect x="581.14" y="135.4" width="1.09" height="49.6" class="fg"/>
<rect x="581.93" y="135.2" width="1.09" height="49.8" class="fg"/>
<rect x="582.71" y="134.8" width="1.09" height="50.2" class="fg"/>
<rect x="583.50" y="134.8" width="1.09" height="50.2" class="fg"/>
<rect x="584.29" y="134.8" width="1.09" height="50.2" class="fg"/>
<rect x="585.07" y="134.8" width="1.09" height="50.2" class="fg"/>
<rect x="585.86" y="133.1" width="1.09" height="51.9" class="fg"/>
<rect x="586.64" y="133.1" width="1.09" height="51.9" class="fg"/>
<rect x="587.43" y="130.2" width="1.09" height="54.8" class="fg"/>
<rect x="588.21" y="130.2" width="1.09" height="54.8" class="fg"/>
<rect x="589.00" y="129.8" width="1.09" height="55.2" class="fg"/>
<rect x="589.79" y="129.8" width="1.09" height="55.2" class="fg"/>
<rect x="590.57" y="129.2" width="1.09" height="55.8" class="fg"/>
<rect x="591.36" y="127.6" width="1.09" height="57.4" class="fg"/>
<rect x="592.14" y="125.0" width="1.09" height="60.0" class="fg"/>
<rect x="592.93" y="123.8" width="1.09" height="61.2" class="fg"/>
<rect x="593.71" y="121.5" width="1.09" height="63.5" class="fg"/>
<rect x="594.50" y="118.0" width="1.09" height="67.0" class="fg"/>
<rect x="595.29" y="116.2" width="1.09" height="68.8" class="fg"/>
<rect x="596.07" y="111.7" width="1.09" height="73.3" class="fg"/>
<rect x="596.86" y="111.1" width="1.09" height="73.9" class="fg"/>
<rect x="597.64" y="107.7" width="1.09" height="77.3" class="fg"/>
<rect x="598.43" y="46.2" width="1.09" height="138.8" class="fs"/>
<rect x="599.21" y="23.5" width="1.09" height="161.5" class="fs"/>
<line x1="50" y1="151" x2="600" y2="151" class="sr" stroke-dasharray="5 4" stroke-width="1.5"/>
<text x="596" y="147" text-anchor="end" font-size="11">cut at eps = 0.4</text>
<line x1="50" y1="100" x2="600" y2="100" class="sg" stroke-dasharray="5 4" stroke-width="1.5"/>
<text x="596" y="96" text-anchor="end" font-size="11">cut at eps = 1.0</text>
<text x="325.0" y="203" text-anchor="middle" class="tm" font-size="11">points in OPTICS order (700 rows) · bar height = reachability distance · colour = xi cluster</text>
</svg><figcaption>The reachability plot of the three-cloud data. Each valley is a cluster: the deep narrow one is the tight cloud, the wide shallow one is the loose cloud. A horizontal cut at any eps reproduces DBSCAN at that eps.</figcaption></figure>
  <p>The xi method finds the three clouds (ARI 0.946) from one run, and the same run can be cut at any eps afterwards without recomputation. The catch: xi is a fussy knob (small changes in xi and min_samples change the result a lot), and OPTICS is slower than DBSCAN. In practice HDBSCAN has mostly replaced it, but the reachability plot is still the best picture of a data set's density structure.</p>
  <div class="bridge"><b>What this still can't tell us →</b> the practical details: every parameter, distances other than straight lines, how to label a new stall, cost, and high dimensions. <b>Next: parameters and practice.</b></div>

  <h2 id="db-practice"><span class="num">10</span>Parameters and Practice</h2>
  <p><strong>The question we can't answer yet.</strong> We understand the algorithms. What do we need to know to use them on real data without nasty surprises?</p>
  <h3>scikit-learn DBSCAN</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th></tr>
    <tr><td><code>eps</code></td><td>0.5</td><td>neighbourhood radius, in feature units; the knob that matters most</td></tr>
    <tr><td><code>min_samples</code></td><td>5</td><td>points (including itself) needed within eps to be core</td></tr>
    <tr><td><code>metric</code></td><td>"euclidean"</td><td>any sklearn/scipy distance: "manhattan", "cosine", "haversine", or "precomputed" (pass an n × n distance matrix)</td></tr>
    <tr><td><code>algorithm</code></td><td>"auto"</td><td>neighbour search: "ball_tree", "kd_tree", "brute"</td></tr>
    <tr><td><code>leaf_size</code>, <code>p</code>, <code>metric_params</code></td><td>30, None, None</td><td>tree tuning; p = Minkowski power</td></tr>
    <tr><td><code>n_jobs</code></td><td>None</td><td>parallel neighbour search</td></tr>
    <tr><td><code>fit(X, sample_weight=…)</code></td><td>–</td><td>a row with weight w counts as w points when testing for core</td></tr>
  </table>
  <div class="fx" data-lang="py">db = DBSCAN(eps=0.3, min_samples=5).fit(X)
print("labels_[:8]             ", db.labels_[:8])
print("core_sample_indices_[:8]", db.core_sample_indices_[:8])
print("components_.shape       ", db.components_.shape, "(the core points themselves)")
w = np.ones(len(P)); w[10] = 4                       # stall K counts as 4 stalls (say, 4 carts parked together)
print("stall labels with K weighted 4:", DBSCAN(eps=1.5, min_samples=4).fit_predict(P, sample_weight=w))</div>
  <div class="fx" data-lang="text">labels_[:8]              [0 0 1 0 0 1 0 0]
core_sample_indices_[:8] [0 1 2 3 4 5 6 7]
components_.shape        (303, 2) (the core points themselves)
stall labels with K weighted 4: [ 0  0  0  0  0  1  1  1  1  1  2 -1]</div>
  <p><code>components_</code> holds copies of the 303 core points of the moons. The last line is the stalls: if stall K is really 4 carts parked together, weight 4 makes its own count 4 ≥ min_samples, so K becomes core and forms a third cluster on its own. Sample weights are a way to say "this row is really many identical rows".</p>
  <h3>Non-Euclidean distances: a geographic example</h3>
  <p>Our stalls used flat-map kilometres. For real latitude/longitude, Euclidean distance on degrees is wrong (a degree of longitude shrinks toward the poles). Use the great-circle (haversine) distance: inputs in radians as [lat, lon], and eps in radians, so divide kilometres by the Earth's radius (6371 km).</p>
  <div class="fx" data-lang="py">cities = {"Connaught Pl": (28.6315, 77.2167), "Karol Bagh": (28.6519, 77.1909),
          "Lajpat Nagar": (28.5677, 77.2433), "Saket": (28.5245, 77.2066),
          "Bandra": (19.0596, 72.8295), "Andheri": (19.1136, 72.8697),
          "Dadar": (19.0178, 72.8478), "Colaba": (18.9067, 72.8147),
          "Shimla": (31.1048, 77.1734)}
rad = np.radians(list(cities.values()))               # haversine wants [lat, lon] in radians
km_per_rad = 6371.0
geo = DBSCAN(eps=25 / km_per_rad, min_samples=3, metric="haversine",
             algorithm="ball_tree").fit_predict(rad)  # eps = 25 km
for name, l in zip(cities, geo):
    print(f"{name:13s} {l}")</div>
  <div class="fx" data-lang="text">Connaught Pl  0
Karol Bagh    0
Lajpat Nagar  0
Saket         0
Bandra        1
Andheri       1
Dadar         1
Colaba        1
Shimla        -1</div>
  <p>With eps = 25 km and min_samples = 3, the four Delhi localities form one cluster, the four Mumbai localities another, and Shimla (over 250 km from either) is noise. Notice how natural eps becomes when the distance has real units.</p>
  <h3>Scaling and feature choice</h3>
  <p>DBSCAN uses one radius in every direction, so all features must be on comparable scales (StandardScaler or RobustScaler) unless they share real units (like the kilometres of the stalls). Categorical features need a suitable distance (for example Gower, see <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>) passed as <code>metric="precomputed"</code>.</p>
  <h3>New points: there is no predict</h3>
  <p>DBSCAN has <code>fit_predict</code> but no <code>predict</code>: the clusters are defined by the training points themselves. The standard way to label a new point follows the definition: it belongs to a cluster if it lies within eps of one of that cluster's <em>core</em> points (it would be a border point), otherwise it is noise. Three new stalls open:</p>
  <div class="fx" data-lang="py">db12 = DBSCAN(eps=1.5, min_samples=4).fit(P)
cores = P[db12.core_sample_indices_]                       # the 8 core stalls A B C D F G H I
core_lab = db12.labels_[db12.core_sample_indices_]
nn = NearestNeighbors(n_neighbors=1).fit(cores)

def dbscan_predict(Xnew, eps=1.5):
    d, j = nn.kneighbors(Xnew)
    return np.where(d[:, 0] &lt;= eps, core_lab[j[:, 0]], -1)   # nearest core within eps, else noise

new = np.array([[2, 3], [5, 5], [9, 9]])                     # three new stalls
for p, l in zip(new, dbscan_predict(new)):
    print(tuple(int(v) for v in p), "-&gt;", l)</div>
  <div class="fx" data-lang="text">(2, 3) -&gt; 0
(5, 5) -&gt; 1
(9, 9) -&gt; -1</div>
  <p>(2, 3) is 1 km from core stall D → station market. (5, 5) is 1 km from core stall F → college market. (9, 9) is far from every core stall → noise. (HDBSCAN offers <code>approximate_predict</code> only in the separate <code>hdbscan</code> package, not in scikit-learn's version; the same nearest-core idea works there.)</p>
  <h3>Cost: time and memory</h3>
  <p>The work is dominated by the neighbourhood queries. With a tree index and a small eps, each query is about O(log n), so the total is about O(n log n). With a large eps (or in high dimensions, where tree indexes stop helping), each query returns a big share of the data and the cost tends to O(n²). scikit-learn's implementation also <strong>stores every neighbourhood</strong>, so memory grows with the number of neighbour pairs (on the 315 moon rows):</p>
  <div class="fx" data-lang="py">for e in (0.3, 1.0, 3.0):
    nn_e = NearestNeighbors(radius=e).fit(X)
    total = sum(len(a) for a in nn_e.radius_neighbors(X, return_distance=False))
    print(f"eps={e}: neighbour pairs stored = {total:6d}  (all pairs would be {len(X)**2})")</div>
  <div class="fx" data-lang="text">eps=0.3: neighbour pairs stored =   5109  (all pairs would be 99225)
eps=1.0: neighbour pairs stored =  20823  (all pairs would be 99225)
eps=3.0: neighbour pairs stored =  86215  (all pairs would be 99225)</div>
  <p>At eps = 3 nearly every pair is stored (86,215 of 99,225). On a million rows that would not fit in memory. If eps is too large, the first symptom is often a memory error, not a bad clustering. HDBSCAN costs about O(n log n) for low-dimensional data with tree indexes and O(n²) in the worst case, without needing eps.</p>
  <h3>High dimensions</h3>
  <p>In 50 or 500 dimensions, all pairwise distances become similar ("distance concentration", see <a class="xref" data-note="ml_dimred">Curse of Dimensionality</a>), so a ball of radius eps holds either almost nobody or almost everybody; density loses its meaning. The usual recipe for embeddings, documents or images is to reduce dimensions first (PCA to ~20–50, or <a class="xref" data-note="ml_umap">UMAP</a> to ~5–10) and then run HDBSCAN. UMAP + HDBSCAN is a very common pipeline for clustering text embeddings.</p>
  <h3>DBSCAN and single linkage</h3>
  <p>A useful fact for interviews: the DBSCAN* clusters (core points only) at radius eps are exactly the connected pieces you get by cutting the single-linkage tree on mutual reachability distances (k = min_samples) at height eps. On the stalls: cut the MST of section 08 at 1.5 and the pieces with more than one stall are {A, B, C, D} and {F, G, H, I}, the DBSCAN core points. With min_samples = 1 or 2, core distances are 0 or the nearest-neighbour distance, so DBSCAN becomes ordinary single linkage cut at eps. That is why HDBSCAN can be described as "single linkage on mutual reachability, plus a smart way to cut".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Judging DBSCAN with silhouette. Silhouette rewards round, compact clusters and does not know what to do with noise (you must drop the −1 points first, which flatters the result). A perfect moon clustering can score lower than K-Means' wrong straight cut. Use plots, cluster profiles and, if needed, a density-based score such as DBCV (see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we have met many pieces (counts, k-distances, core distances, reachabilities, stabilities). How do they all fit together? <b>Next: how it all connects.</b></div>

  <h2 id="db-connect"><span class="num">11</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> Each section added one idea to answer the previous one's weakness. Seen together, which quantities are built from which, and which one should you reach for?</p>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="db-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="270" y="10" width="140" height="36" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="33" text-anchor="middle" font-size="12">distance d(p, q)</text>
<rect x="40" y="80" width="170" height="40" rx="7" class="fb sb"/><text x="125" y="98" text-anchor="middle" font-size="12">eps-ball count</text><text x="125" y="113" text-anchor="middle" class="tm" font-size="10">|N_eps(p)|</text>
<rect x="255" y="80" width="170" height="40" rx="7" class="fb sb"/><text x="340" y="98" text-anchor="middle" font-size="12">k-distance</text><text x="340" y="113" text-anchor="middle" class="tm" font-size="10">= core distance</text>
<rect x="470" y="80" width="190" height="40" rx="7" class="fv"/><text x="565" y="98" text-anchor="middle" font-size="12">reachability</text><text x="565" y="113" text-anchor="middle" class="tm" font-size="10">max(core(p), d)</text>
<line x1="300" y1="46" x2="150" y2="78" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="340" y1="46" x2="340" y2="78" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="380" y1="46" x2="540" y2="78" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="425" y1="100" x2="468" y2="100" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="253" y1="100" x2="212" y2="100" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#db-ca)"/>
<text x="232" y="94" text-anchor="middle" class="tm" font-size="9.5">≤ eps ⇔</text>
<rect x="40" y="150" width="170" height="40" rx="7" class="fb sb"/><text x="125" y="168" text-anchor="middle" font-size="12">core / border / noise</text><text x="125" y="183" text-anchor="middle" class="tm" font-size="10">count ≥ min_samples?</text>
<rect x="255" y="150" width="170" height="40" rx="7" class="fr sr"/><text x="340" y="168" text-anchor="middle" font-size="12">mutual reachability</text><text x="340" y="183" text-anchor="middle" class="tm" font-size="10">max(core a, core b, d)</text>
<rect x="470" y="150" width="190" height="40" rx="7" class="fv"/><text x="565" y="168" text-anchor="middle" font-size="12">reachability plot</text><text x="565" y="183" text-anchor="middle" class="tm" font-size="10">valleys = clusters</text>
<line x1="125" y1="120" x2="125" y2="148" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="340" y1="120" x2="340" y2="148" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="565" y1="120" x2="565" y2="148" stroke="currentColor" marker-end="url(#db-ca)"/>
<rect x="40" y="220" width="170" height="40" rx="7" class="fb sb" stroke-width="2.5"/><text x="125" y="238" text-anchor="middle" font-size="12" font-weight="700">DBSCAN clusters</text><text x="125" y="253" text-anchor="middle" class="tm" font-size="10">chain core points</text>
<rect x="255" y="220" width="170" height="40" rx="7" class="fr sr" stroke-width="2.5"/><text x="340" y="238" text-anchor="middle" font-size="12" font-weight="700">HDBSCAN clusters</text><text x="340" y="253" text-anchor="middle" class="tm" font-size="10">MST → condensed tree → stability</text>
<rect x="470" y="220" width="190" height="40" rx="7" class="fv" stroke-width="2.5"/><text x="565" y="238" text-anchor="middle" font-size="12" font-weight="700">OPTICS clusters</text><text x="565" y="253" text-anchor="middle" class="tm" font-size="10">xi, or a cut at eps</text>
<line x1="125" y1="190" x2="125" y2="218" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="340" y1="190" x2="340" y2="218" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="565" y1="190" x2="565" y2="218" stroke="currentColor" marker-end="url(#db-ca)"/>
<line x1="468" y1="240" x2="212" y2="240" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="340" y="285" text-anchor="middle" class="tm" font-size="10.5">dashed: a cut of the reachability plot (or of the HDBSCAN tree) at height eps gives DBSCAN at that eps</text>
</svg><figcaption>Everything is built from one distance. The k-distance of DBSCAN is the core distance of HDBSCAN and OPTICS; the three algorithms differ only in what they do with it.</figcaption></figure>
  <h3>Every quantity on the running example</h3>
  <div class="fx" data-lang="py">from sklearn.cluster import OPTICS
op12 = OPTICS(min_samples=4).fit(P)
dbl = DBSCAN(eps=1.5, min_samples=4).fit(P)
is_core = np.zeros(12, bool); is_core[dbl.core_sample_indices_] = True
print("stall count@1.5  k-dist=core-dist  DBSCAN-type  DBSCAN  OPTICS-reach  HDBSCAN  strength")
for i, n in enumerate(names):
    t = "core" if is_core[i] else ("border" if dbl.labels_[i] != -1 else "noise")
    r = op12.reachability_[i]
    print(f"  {n}      {count[i]}        {core_d[i]:6.3f}          {t:7s}   {dbl.labels_[i]:3d}     "
          f"{('inf' if np.isinf(r) else f'{r:.3f}'):&gt;6s}     {h12.labels_[i]:3d}     {h12.probabilities_[i]:.3f}")</div>
  <div class="fx" data-lang="text">stall count@1.5  k-dist=core-dist  DBSCAN-type  DBSCAN  OPTICS-reach  HDBSCAN  strength
  A      4         1.414          core        0        inf       0     1.000
  B      5         1.414          core        0      1.414       0     1.000
  C      4         1.414          core        0      1.414       0     1.000
  D      5         1.000          core        0      1.414       0     1.000
  E      3         2.000          border      0      1.000       0     0.707
  F      4         1.414          core        1      4.243       1     1.000
  G      4         1.414          core        1      1.414       1     1.000
  H      4         1.414          core        1      1.414       1     1.000
  I      5         1.414          core        1      1.414       1     1.000
  J      2         2.236          border      1      1.414       1     0.632
  K      1         4.472          noise      -1      3.606      -1     0.000
  L      1         5.831          noise      -1      5.000      -1     0.000</div>
  <p>Read across one row to see the chain. Stall E: 3 stalls in its 1.5 km circle → its 4-distance is 2.0 &gt; 1.5 → not core, but near core D → border, cluster 0 → in HDBSCAN it leaves its cluster at λ = 1/2 while the core lasts to 1/1.414 → strength 0.707. Stall K: 1 in its circle → 4-distance 4.472 → noise in DBSCAN, falls off the root in HDBSCAN (strength 0), reached by a 3.61 wall in OPTICS.</p>
  <table class="tbl">
    <tr><th>Concept</th><th>Built from</th><th>Answers the question</th><th>On the stalls</th><th>Sensitive to</th></tr>
    <tr><td>eps-ball count</td><td>distance, eps</td><td>How crowded is this point?</td><td>D 5, E 3, K 1</td><td>eps, scaling</td></tr>
    <tr><td>core / border / noise</td><td>count, min_samples</td><td>Is it in a crowd, on its edge, or alone?</td><td>8 core, E J border, K L noise</td><td>both knobs</td></tr>
    <tr><td>reachable / connected</td><td>core points + eps-balls</td><td>Which crowded points belong together?</td><td>A → D → E</td><td>eps</td></tr>
    <tr><td>expansion procedure</td><td>reachability</td><td>How does a program find the clusters?</td><td>2 flood-fills from A and F</td><td>row order (shared border only)</td></tr>
    <tr><td>k-distance</td><td>distance, min_samples</td><td>Which eps makes which points core?</td><td>knee between 1.414 and 2.0</td><td>min_samples</td></tr>
    <tr><td>core distance</td><td>= k-distance</td><td>From which eps on is p core?</td><td>same column</td><td>min_samples</td></tr>
    <tr><td>mutual reachability</td><td>core distances + distance</td><td>How far apart are two points, counting sparseness?</td><td>H–K 3.606 → 4.472</td><td>min_samples</td></tr>
    <tr><td>MST / condensed tree</td><td>mutual reachability, min_cluster_size</td><td>What happens at every eps?</td><td>split at 4.243</td><td>min_cluster_size</td></tr>
    <tr><td>stability</td><td>λ = 1/d along the tree</td><td>Which clusters are real?</td><td>2.150 and 2.097</td><td>min_cluster_size</td></tr>
    <tr><td>membership strength</td><td>λ_p / λ_max</td><td>How firmly is p in its cluster?</td><td>E 0.707, J 0.632</td><td>–</td></tr>
    <tr><td>OPTICS reachability</td><td>core distance of predecessor + distance</td><td>What does the density structure look like?</td><td>walls 4.24, 3.61, 5.00</td><td>min_samples, xi</td></tr>
  </table>
  <h3>When to use which</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th><th>Why</th></tr>
    <tr><td>eps has a real meaning (metres, seconds) and densities are similar</td><td>DBSCAN</td><td>simple, fast, interpretable radius</td></tr>
    <tr><td>Unknown scale or clusters of different densities</td><td>HDBSCAN</td><td>no eps; picks each cluster at its own density; gives strengths</td></tr>
    <tr><td>You want to see the density structure, or try many eps cheaply</td><td>OPTICS</td><td>one run, any cut</td></tr>
    <tr><td>Round blobs, k known, very large data</td><td>K-Means instead</td><td>faster; density adds nothing</td></tr>
    <tr><td>Overlapping clusters that need probabilities</td><td>GMM instead</td><td>density methods need gaps</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us →</b> how the density family compares with K-Means, hierarchical clustering and GMMs on every practical axis. <b>Next: comparisons.</b></div>

  <h2 id="db-compare"><span class="num">12</span>Comparisons</h2>
  <p><strong>The question we can't answer yet.</strong> Given a new data set, how do we choose between the density methods and the other clustering families?</p>
  <h3>The density family</h3>
  <table class="tbl">
    <tr><th></th><th>DBSCAN</th><th>HDBSCAN</th><th>OPTICS</th></tr>
    <tr><td>Main knobs</td><td>eps, min_samples</td><td>min_cluster_size (min_samples)</td><td>min_samples, xi (or a cut eps)</td></tr>
    <tr><td>Varying density</td><td>No: one eps</td><td><strong>Yes</strong></td><td>Yes (xi), or one cut</td></tr>
    <tr><td>Output</td><td>labels</td><td>labels + probabilities + tree</td><td>labels + reachability plot</td></tr>
    <tr><td>Deterministic</td><td>except shared border points</td><td>yes</td><td>yes</td></tr>
    <tr><td>Speed</td><td>fast (small eps)</td><td>fast-ish</td><td>slowest</td></tr>
    <tr><td>Use when</td><td>you understand the scale (eps in km, in seconds…)</td><td>default choice for density clustering</td><td>you want to see the density structure</td></tr>
  </table>
  <h3>Against the other families</h3>
  <table class="tbl">
    <tr><th></th><th>K-Means</th><th>Hierarchical (single link)</th><th>DBSCAN / HDBSCAN</th><th>GMM</th></tr>
    <tr><td>Needs k</td><td>yes</td><td>no (cut later)</td><td>no</td><td>yes (choose with BIC)</td></tr>
    <tr><td>Cluster shape</td><td>round, similar size</td><td>any (chains)</td><td>any</td><td>ellipses</td></tr>
    <tr><td>Noise / outliers</td><td>forced into clusters</td><td>forced in; can chain clusters</td><td><strong>labelled −1</strong></td><td>low density, still assigned</td></tr>
    <tr><td>Soft membership</td><td>no</td><td>no</td><td>HDBSCAN: strength</td><td><strong>yes, probabilities</strong></td></tr>
    <tr><td>New points</td><td>predict</td><td>no</td><td>nearest core point</td><td>predict / predict_proba</td></tr>
    <tr><td>Scale</td><td>millions</td><td>~10–20k (n² memory)</td><td>~10⁵–10⁶ with small eps</td><td>~10⁵</td></tr>
    <tr><td>Main weakness</td><td>shapes, outliers, k</td><td>chaining, memory</td><td>one eps (DBSCAN), high dims</td><td>k, local optima, Gaussian shape</td></tr>
  </table>
  <p>Notes on the neighbours: <a class="xref" data-note="ml_kmeans">K-Means</a> · <a class="xref" data-note="ml_hierarchical">Hierarchical</a> · <a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a>.</p>
  <div class="bridge"><b>What this still can't tell us →</b> what typically goes wrong when people apply these methods. <b>Next: common mistakes.</b></div>

  <h2 id="db-traps"><span class="num">13</span>Common Mistakes</h2>
  <p><strong>The question we can't answer yet.</strong> We know how the methods work; which errors do people actually make with them?</p>
  <div class="callout trap"><span class="label">Trap: not scaling</span>
    <p>eps is one radius in every direction. If income is in rupees and age in years, the ball is effectively a thin slab along the age axis and income alone decides neighbourhoods. Scale (or use features with shared real units, like the stalls' kilometres) before choosing eps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying eps from somewhere else</span>
    <p>eps = 0.5 (the default) means nothing for your data. Choose it from a k-distance plot on <em>your</em> scaled features, then check a small grid around it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: off-by-one in min_samples</span>
    <p>scikit-learn counts the point itself. Other tools (and some textbooks' "MinPts") may not. Stall E has 3 stalls in its circle including itself; with "others only" counting it would be 2.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: counting −1 as a cluster</span>
    <p><code>len(set(labels))</code> includes −1. Use <code>len(set(labels) - {-1})</code> for the number of clusters, and drop −1 rows before computing metrics like silhouette (and say that you did).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting one eps to handle different densities</span>
    <p>If the k-distance plot has several plateaus, or a grid search never gives a stable answer, the clusters have different densities. Switch to HDBSCAN rather than hunting for a magic eps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: running on raw high-dimensional embeddings</span>
    <p>In hundreds of dimensions density is meaningless and runtime explodes. Reduce first (PCA, UMAP), then cluster.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: treating noise as anomalies without checking</span>
    <p>Noise includes ordinary rows from the thin edges of clusters. Use outlier scores (GLOSH in the hdbscan package, LOF, Isolation Forest) when anomalies are the goal.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a huge eps on a big data set</span>
    <p>scikit-learn stores all neighbourhoods. With a large eps that is nearly n² pairs and the process runs out of memory. Start small and increase.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> nothing new; time to compress the whole note into one sheet. <b>Next: the revision sheet.</b></div>

  <h2 id="db-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>A complete summary of the note. The running example is 12 tea stalls (km): station market A(1,1) B(2,1) C(1,2) D(2,2) E(3,2), college market F(6,5) G(7,5) H(6,6) I(7,6) J(8,7), and two loners K(4,9), L(10,1). Settings: eps = 1.5, min_samples = 4, min_cluster_size = 3.</p>
  <h3>The question ladder in one line each</h3>
  <ol class="story">
    <li><b>Density instead of centres</b><span>K-Means needs k, cuts straight lines and forces loners in (K and L joined the college market). A cluster should instead be a crowded region, and loners noise.</span></li>
    <li><b>eps and min_samples</b><span>"Crowded" = at least min_samples points (itself included) within radius eps. D has 5, E 3, K 1.</span></li>
    <li><b>Core, border, noise</b><span>Core if the count reaches min_samples; border if not, but inside a core's ball; noise otherwise. Stalls: 8 core, E and J border, K and L noise.</span></li>
    <li><b>Reachability and connectivity</b><span>Clusters chain through core points only (A → D → E); "connected" makes the relation symmetric.</span></li>
    <li><b>Expansion procedure</b><span>Flood-fill from each unlabelled core point; core neighbours spread, border neighbours stop. Only a border point shared by two clusters depends on row order.</span></li>
    <li><b>k-distance plot</b><span>Point is core ⇔ its k-distance ≤ eps; put eps at the knee (stalls: between 1.414 and 2.0).</span></li>
    <li><b>Shapes vs K-Means</b><span>DBSCAN wins on moons (1.000 vs 0.475) and rings (1.000 vs −0.003), K-Means on round blobs (0.985 vs 0.952).</span></li>
    <li><b>Varying density</b><span>One eps cannot fit tight and loose clusters (eps 1.0 kept part of one market and erased the other).</span></li>
    <li><b>HDBSCAN</b><span>Core distance → mutual reachability → MST → condensed tree → stability; keeps each cluster at its own density, adds membership strengths.</span></li>
    <li><b>OPTICS</b><span>Reachability plot: valleys are clusters, a cut at eps is DBSCAN.</span></li>
  </ol>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Formula / rule</th><th>Symbols in plain words</th></tr>
    <tr><td>eps-neighbourhood</td><td>N_eps(p) = { q : d(p, q) ≤ eps }</td><td>all points within radius eps of p, p included</td></tr>
    <tr><td>Core point</td><td>|N_eps(p)| ≥ min_samples</td><td>|·| = number of points</td></tr>
    <tr><td>Border point</td><td>not core, and p ∈ N_eps(c) for some core c</td><td>on the edge of a crowd</td></tr>
    <tr><td>Noise</td><td>neither; label −1</td><td>alone</td></tr>
    <tr><td>Directly reachable</td><td>p core and q ∈ N_eps(p)</td><td>one step, must start at a core point</td></tr>
    <tr><td>Connected</td><td>some core o reaches both p and q</td><td>symmetric glue of a cluster</td></tr>
    <tr><td>k-distance = core distance</td><td>core_k(p) = distance to k-th nearest point, self counted (k = min_samples)</td><td>p is core ⇔ core_k(p) ≤ eps</td></tr>
    <tr><td>Mutual reachability</td><td>d_mr(a, b) = max(core_k(a), core_k(b), d(a, b))</td><td>pushes sparse points away</td></tr>
    <tr><td>OPTICS reachability</td><td>reach(q | p) = max(core_k(p), d(p, q))</td><td>p = the point q is reached from</td></tr>
    <tr><td>λ</td><td>λ = 1 / distance</td><td>grows as eps shrinks</td></tr>
    <tr><td>Stability</td><td>S(C) = Σ_{p ∈ C} (λ_p − λ_birth(C))</td><td>λ_p = when p leaves C; λ_birth = when C appears</td></tr>
    <tr><td>Membership strength</td><td>λ_p / max λ in the cluster</td><td>1 = deep inside, near 0 = on the fringe</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Stall</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th><th>K</th><th>L</th></tr>
    <tr><td>count @ 1.5</td><td>4</td><td>5</td><td>4</td><td>5</td><td>3</td><td>4</td><td>4</td><td>4</td><td>5</td><td>2</td><td>1</td><td>1</td></tr>
    <tr><td>4-distance</td><td>1.414</td><td>1.414</td><td>1.414</td><td>1.000</td><td>2.000</td><td>1.414</td><td>1.414</td><td>1.414</td><td>1.414</td><td>2.236</td><td>4.472</td><td>5.831</td></tr>
    <tr><td>DBSCAN</td><td>0 core</td><td>0 core</td><td>0 core</td><td>0 core</td><td>0 border</td><td>1 core</td><td>1 core</td><td>1 core</td><td>1 core</td><td>1 border</td><td>−1</td><td>−1</td></tr>
    <tr><td>HDBSCAN strength</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0.707</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0.632</td><td>0 (noise)</td><td>0 (noise)</td></tr>
  </table>
  <p>MST edges cut from the top: L leaves at 5.831, K at 4.472, the markets split at 4.243 (λ 0.236), J leaves at 2.236, E at 2.0, the squares end at 1.414 (λ 0.707). Stabilities 2.150 and 2.097. eps sweep: 1.0 → only D core; 1.5–2.5 → right answer; 4.5 → markets merge.</p>
  <h3>When to use, when not to</h3>
  <div class="cards">
    <div><b>Use DBSCAN</b><p>Odd shapes, noise to discard, unknown k, and a radius with real meaning (km, seconds).</p><small>Choose eps from a k-distance plot</small></div>
    <div><b>Use HDBSCAN</b><p>Default for density clustering, especially with clusters of different densities or no feel for scale.</p><small>Main knob: min_cluster_size</small></div>
    <div><b>Use OPTICS</b><p>To see the density structure, or cut at many eps from one run.</p><small>xi is fussy</small></div>
    <div><b>Avoid</b><p>Raw high-dimensional data, unscaled features, overlapping clusters with no density gap, huge eps on big data.</p><small>Reduce dims; scale; consider GMM</small></div>
  </div>
  <h3>Key traps</h3>
  <div class="callout trap"><span class="label">Remember</span>
    <p>Scale features first. min_samples counts the point itself in scikit-learn. −1 is not a cluster. Noise is not automatically an anomaly. One eps cannot fit several densities. There is no predict: use the nearest core point within eps. Silhouette is unfair to curved clusters. A big eps can exhaust memory.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>With eps = 1.5, min_samples = 4, why is E border and not core?</td><td>Only 3 stalls (itself, B, D) are within 1.5; but it lies in core D's circle.</td></tr>
    <tr><td>What is the link between the k-distance plot and core points?</td><td>A point is core exactly when its k-distance (k = min_samples) ≤ eps.</td></tr>
    <tr><td>d_mr(H, K) if core(H) = 1.414, core(K) = 4.472, d = 3.606?</td><td>max(1.414, 4.472, 3.606) = 4.472.</td></tr>
    <tr><td>Stability of a cluster born at λ 0.2 whose 3 points all leave at λ 0.5?</td><td>3 × (0.5 − 0.2) = 0.9.</td></tr>
    <tr><td>Which DBSCAN output can depend on row order?</td><td>Only a border point within eps of core points of two different clusters.</td></tr>
  </table>


  <h2 id="db-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain DBSCAN in three sentences.</summary><div class="qa-body">A point is core if at least min_samples points (itself included) lie within distance eps. Clusters are grown by chaining core points that lie in each other's eps-balls; non-core points within eps of a core point join as border points. Everything else is noise (label −1), and the number of clusters comes out of the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define core, border and noise points. Can a border point start a cluster?</summary><div class="qa-body">Core: |N_eps(p)| ≥ min_samples. Border: not core, but within eps of a core point. Noise: neither. A border point cannot start or extend a cluster, because reachability steps must start from a core point; this is what stops thin bridges of stray points from merging clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is "density-connected" needed when we already have "density-reachable"?</summary><div class="qa-body">Reachability is not symmetric: a core point reaches a border point, but not the other way round, and two border points never reach each other. Density-connected (both reachable from some common core point) is symmetric and ties together all points of one cluster, including border points at opposite ends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose eps and min_samples?</summary><div class="qa-body">Pick min_samples first (≥ d + 1, typically 2·d, larger for noisy data). Then plot the sorted distances to each point's min_samples-th nearest neighbour (self counted). Points with k-distance ≤ eps are exactly the core points, so put eps at the knee where the curve shoots up, and check a small grid around it for a stable answer. Scale features first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is DBSCAN deterministic?</summary><div class="qa-body">Core points and noise are fully determined by the data. A border point within eps of core points from two different clusters is assigned to whichever cluster reaches it first, so its label can change with row order. DBSCAN* (and HDBSCAN) avoid this by treating border points differently.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does DBSCAN become with min_samples = 1?</summary><div class="qa-body">Every point is core, so there is no noise, and clusters are the connected components of the graph "points within eps", which is single-linkage hierarchical clustering cut at height eps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does DBSCAN fail, and what do you use instead?</summary><div class="qa-body">(1) Clusters of different densities: one eps cannot fit all; use HDBSCAN or OPTICS. (2) High dimensions: distances concentrate; reduce with PCA/UMAP first. (3) Unscaled or mixed-type features: scale or use a proper distance. (4) Very large data with large eps: memory blows up. (5) Overlapping clusters with no density gap: nothing density-based can separate them; consider a GMM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the mutual reachability distance and why does HDBSCAN use it?</summary><div class="qa-body">d_mr(a, b) = max(core_k(a), core_k(b), d(a, b)), where core_k is the distance to the k-th nearest neighbour. It leaves dense regions unchanged and pushes points in sparse regions away from everyone, so single linkage on d_mr is robust to noise and does not chain clusters through stray points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does HDBSCAN decide which clusters to keep?</summary><div class="qa-body">It builds the single-linkage tree on mutual reachability, condenses it by ignoring splits that shed fewer than min_cluster_size points, and measures each cluster's stability Σ(λ_p − λ_birth) with λ = 1/distance. Bottom-up, a parent is kept if its stability beats the sum of its selected children's; otherwise the children are kept (excess of mass). "leaf" selection keeps the leaves instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HDBSCAN marks 40% of your customers as noise. Is something wrong?</summary><div class="qa-body">Not necessarily: HDBSCAN is conservative and keeps only clearly dense groups. Lower min_samples (min_cluster_size stays) to make it less conservative, check that features are scaled and dimensions reduced, and if every customer needs a segment, assign noise points to their nearest cluster afterwards and flag them as low-confidence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you cluster GPS pings of delivery drivers to find hotspots?</summary><div class="qa-body">DBSCAN (or HDBSCAN) with metric="haversine", inputs as radians [lat, lon], eps = desired radius in km / 6371, ball_tree index. eps then has a physical meaning ("pings within 200 m"), noise pings are dropped automatically, and hotspots of any shape (along a road, around a mall) are found without choosing k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is OPTICS's reachability plot and how is it related to DBSCAN?</summary><div class="qa-body">OPTICS orders points by always visiting next the point with the smallest reachability distance max(core(p), d(p, q)) from the visited set, and plots those distances in order. Valleys are clusters; a horizontal cut at height eps gives the DBSCAN result for that eps, so one OPTICS run summarises DBSCAN at every eps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can silhouette prefer K-Means over a perfect DBSCAN result on moons?</summary><div class="qa-body">Silhouette compares average distances within and between clusters, so it rewards compact, round, well-separated clusters. Each moon is long and curved, so points at its tips are far from many points of their own cluster and close to the other moon: a low silhouette. A straight K-Means cut makes rounder halves and can score higher while being wrong. Use density-based validation (DBCV) or visual checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How is the k-distance plot of DBSCAN related to HDBSCAN?</summary><div class="qa-body">They use the same number. The k-distance of a point (distance to its min_samples-th neighbour, self counted) is HDBSCAN's core distance: the smallest eps at which that point would be a DBSCAN core point. HDBSCAN builds mutual reachability distances from it and then effectively considers every eps at once instead of the single eps you would pick at the knee.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) DBSCAN called stall E a border point. What does HDBSCAN say about it, and why?</summary><div class="qa-body">HDBSCAN puts E in the same cluster but with strength 0.707. E's core distance is 2.0, so it leaves its cluster at λ = 1/2 = 0.5, while the cluster's core stalls last until λ = 1/1.414 = 0.707; 0.5/0.707 = 0.707. The yes/no border label has become a degree of membership.</div></details>
</main>
`
});
