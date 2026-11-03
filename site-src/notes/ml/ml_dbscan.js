// notes/ml/ml_dbscan.js — DBSCAN & HDBSCAN
Object.assign(TOPIC_CONTENT, {
  "ml_dbscan": `<main>
  <h1>DBSCAN &amp; HDBSCAN</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>DBSCAN &amp; HDBSCAN</span></div>
  <p class="lead">DBSCAN is a clustering method that defines a cluster as a crowded region of points, and treats points standing alone in empty space as noise that belongs to no cluster at all. That one idea fixes the three things that make K-Means awkward in real work: you do not have to choose the number of clusters in advance, clusters can be any shape (a curved road, a ring, a river bank), and outliers are flagged instead of being forced into a group. It is the standard tool for things like finding hotspots in GPS pings, grouping text embeddings, or separating real customer groups from one-off oddballs. Its weakness is that it uses one fixed radius for the whole map, and HDBSCAN, its modern successor built into scikit-learn, removes that weakness. The whole page uses one small running example, twelve tea stalls on a town map, so that every quantity (core points, k-distances, HDBSCAN's tree, OPTICS' plot) is computed on stalls you already know.</p>

  <h2 id="db-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">DBSCAN &amp; HDBSCAN</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Cluster = dense region; separated by sparse space</li>
          <li>No k, any shape, loners labelled <b>−1</b> (noise)</li>
          <li>Two knobs: radius <b>eps</b> and count <b>min_samples</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">DBSCAN</div>
        <ul>
          <li><b>Core</b>: ≥ min_samples points within eps (itself counted)</li>
          <li><b>Border</b>: not core, inside a core's circle; <b>noise</b>: neither</li>
          <li>Clusters grow by chaining core points; border points never spread</li>
          <li>Choose eps at the knee of the sorted k-distance plot</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HDBSCAN</div>
        <ul>
          <li>Fixes "one eps for every density"</li>
          <li>Core distance → mutual reachability → MST → condensed tree</li>
          <li>Keeps the most <b>stable</b> clusters; gives membership strengths</li>
          <li>Main knob: <b>min_cluster_size</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practice</div>
        <ul>
          <li>Scale features first; eps is in feature units</li>
          <li>No <code>predict</code>: nearest core point within eps</li>
          <li>Geo data: haversine, eps = km / 6371</li>
          <li>High dimensions: reduce (PCA/UMAP) first</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="db-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Density-Based Clustering</span><span class="rm-sub">twelve tea stalls, and where K-Means goes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="db-points"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Core, Border and Noise Points</span><span class="rm-sub">eps, min_samples, every stall labelled by hand</span></div></div>
      <div class="rm-item rm-done" data-target="db-grow"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How Clusters Grow</span><span class="rm-sub">reachability and the expansion procedure</span></div></div>
      <div class="rm-item rm-done" data-target="db-eps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Choosing eps and min_samples</span><span class="rm-sub">the k-distance plot</span></div></div>
      <div class="rm-item rm-done" data-target="db-shapes"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Where DBSCAN Wins and Where It Fails</span><span class="rm-sub">odd shapes, and clusters of different density</span></div></div>
      <div class="rm-item rm-done" data-target="db-hdbscan"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">HDBSCAN</span><span class="rm-sub">every eps at once, keep the stable clusters</span></div></div>
      <div class="rm-item rm-done" data-target="db-optics"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">OPTICS</span><span class="rm-sub">the density structure as one picture</span></div></div>
      <div class="rm-item rm-done" data-target="db-practice"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">DBSCAN in Practice</span><span class="rm-sub">parameters, geo data, new points, cost</span></div></div>
      <div class="rm-item rm-done" data-target="db-compare"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing a Clustering Method</span><span class="rm-sub">density methods vs K-Means, hierarchical, GMM</span></div></div>
      <div class="rm-item rm-done" data-target="db-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, −1, one eps for all</span></div></div>
      <div class="rm-item rm-done" data-target="db-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, the stalls' numbers</span></div></div>
      <div class="rm-item rm-done" data-target="db-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on density clustering</span></div></div>
    </div>
  </div>

  <h2 id="db-why"><span class="num">01</span>Why Density-Based Clustering</h2>
  <p>Imagine you have a map of the twelve tea stalls in a small town, with each stall's position in kilometres. Looking at the map, anyone can see the structure: five stalls (A to E) crowd around the railway station, five more (F to J) crowd around the college, and two stalls, K and L, stand on their own out on the highway. A good clustering method should say exactly that: two markets, and two loners that belong to neither.</p>
  <table class="tbl">
    <tr><th>Stall</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th><th>K</th><th>L</th></tr>
    <tr><td>(x, y) km</td><td>(1,1)</td><td>(2,1)</td><td>(1,2)</td><td>(2,2)</td><td>(3,2)</td><td>(6,5)</td><td>(7,5)</td><td>(6,6)</td><td>(7,6)</td><td>(8,7)</td><td>(4,9)</td><td>(10,1)</td></tr>
  </table>
  <p>The method most people reach for first is K-Means (see <a class="xref" data-note="ml_kmeans">K-Means</a>), which places k centres and sends every point to its nearest centre. Here is what it does with the stalls for k = 2 and k = 3:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans, DBSCAN

P = np.array([[1, 1], [2, 1], [1, 2], [2, 2], [3, 2],      # station market A..E
              [6, 5], [7, 5], [6, 6], [7, 6], [8, 7],      # college market F..J
              [4, 9], [10, 1]], dtype=float)               # lonely stalls K, L   (km)
names = list("ABCDEFGHIJKL")
for k in (2, 3):
    lab = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(P)
    print(f"K-Means k={k}:", " ".join(f"{n}={l}" for n, l in zip(names, lab)))</div>
  <div class="fx" data-lang="text">K-Means k=2: A=1 B=1 C=1 D=1 E=1 F=0 G=0 H=0 I=0 J=0 K=0 L=0
K-Means k=3: A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=1 L=2</div>
  <p>With k = 2 the station market is cluster 1 and everything else is cluster 0, so the two highway stalls K and L have been added to the college market, and they drag its centre away from where the stalls really are. With k = 3 K-Means gives the lonely stall L a "market" of its own and still pushes K into the college market. Neither answer says what we can see: K and L are loners.</p>
  <p>The cause is the one rule K-Means is built on, "every point joins its nearest centre", and it leads to three separate problems. Every point must belong to some cluster, so outliers are forced in and distort the result. The border between two clusters is always a straight line halfway between their centres, so a banana-shaped or ring-shaped group cannot be described. And you must choose k before you start, although the number of groups is usually the very thing you wanted to find out.</p>
  <p><strong>Density-based clustering</strong> starts from a different definition of a cluster: a cluster is a region where points are packed closely together, and clusters are separated by regions of empty or nearly empty space. A point sitting alone in empty space belongs to no cluster; it is called <strong>noise</strong>. Notice what this definition does not mention. It says nothing about a centre, so clusters can be any shape, and it says nothing about k, so the number of clusters comes out of the data.</p>
  <p>Think of a photograph of India taken from space at night. Delhi and Mumbai show up as bright patches of crowded lights, with suburbs glowing more faintly at their edges, while a single village light far from any city belongs to no city at all. Nobody drew a circle around a city centre to decide where Delhi ends: a city is simply the place where the lights are packed together, whatever its shape. DBSCAN, which stands for "Density-Based Spatial Clustering of Applications with Noise" (Ester and colleagues, 1996), finds clusters in exactly this way.</p>
  <p>The difference becomes dramatic on shapes that K-Means cannot draw. Below are two interlocking half-moons of 300 points with 15 junk rows scattered at random. Both methods run on scaled data; DBSCAN's two settings, <code>eps</code> and <code>min_samples</code>, are explained in the next section. To score the results we use the <strong>adjusted Rand index</strong> (ARI), which compares found groups with the true ones: 1 means a perfect match and about 0 means no better than random (see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import adjusted_rand_score

Xm, ym = make_moons(n_samples=300, noise=0.06, random_state=0)
rng = np.random.default_rng(1)
junk = rng.uniform(low=[-1.5, -1.0], high=[2.5, 1.5], size=(15, 2))   # 15 scattered junk rows
X = StandardScaler().fit_transform(np.vstack([Xm, junk]))
y = np.r_[ym, [-1] * 15]                    # truth: 0/1 = which moon, -1 = junk
moon = y &gt;= 0

km = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
db = DBSCAN(eps=0.3, min_samples=5).fit_predict(X)
print("K-Means: ARI on moon rows", round(adjusted_rand_score(y[moon], km[moon]), 3), "| junk rows flagged: 0 of 15")
print("DBSCAN : ARI on moon rows", round(adjusted_rand_score(y[moon], db[moon]), 3),
      "| junk rows flagged:", (db[~moon] == -1).sum(), "of 15 | moon rows flagged:", (db[moon] == -1).sum())</div>
  <div class="fx" data-lang="text">K-Means: ARI on moon rows 0.461 | junk rows flagged: 0 of 15
DBSCAN : ARI on moon rows 0.993 | junk rows flagged: 10 of 15 | moon rows flagged: 1</div>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<text x="160" y="16" text-anchor="middle" font-size="12.5">KMeans, k = 2</text>
<text x="480" y="16" text-anchor="middle" font-size="12.5">DBSCAN, eps = 0.3, min_samples = 5</text>
<circle cx="169" cy="171" r="2.6" class="fr sr"/><circle cx="130" cy="153" r="2.6" class="fr sr"/><circle cx="186" cy="108" r="2.6" class="fr sr"/><circle cx="189" cy="170" r="2.6" class="fr sr"/><circle cx="209" cy="164" r="2.6" class="fr sr"/><circle cx="30" cy="122" r="2.6" class="fb sb"/><circle cx="206" cy="169" r="2.6" class="fr sr"/><circle cx="165" cy="164" r="2.6" class="fr sr"/><circle cx="152" cy="73" r="2.6" class="fb sb"/><circle cx="54" cy="77" r="2.6" class="fb sb"/><circle cx="265" cy="115" r="2.6" class="fr sr"/><circle cx="185" cy="112" r="2.6" class="fr sr"/><circle cx="129" cy="152" r="2.6" class="fr sr"/><circle cx="226" cy="172" r="2.6" class="fr sr"/><circle cx="185" cy="109" r="2.6" class="fr sr"/><circle cx="107" cy="62" r="2.6" class="fb sb"/><circle cx="252" cy="134" r="2.6" class="fr sr"/><circle cx="79" cy="65" r="2.6" class="fb sb"/><circle cx="198" cy="176" r="2.6" class="fr sr"/><circle cx="117" cy="120" r="2.6" class="fb sb"/><circle cx="141" cy="149" r="2.6" class="fr sr"/><circle cx="76" cy="69" r="2.6" class="fb sb"/><circle cx="40" cy="99" r="2.6" class="fb sb"/><circle cx="44" cy="102" r="2.6" class="fb sb"/><circle cx="190" cy="178" r="2.6" class="fr sr"/><circle cx="50" cy="92" r="2.6" class="fb sb"/><circle cx="144" cy="157" r="2.6" class="fr sr"/><circle cx="272" cy="117" r="2.6" class="fr sr"/><circle cx="210" cy="172" r="2.6" class="fr sr"/><circle cx="266" cy="107" r="2.6" class="fr sr"/><circle cx="82" cy="66" r="2.6" class="fb sb"/><circle cx="136" cy="64" r="2.6" class="fb sb"/><circle cx="185" cy="124" r="2.6" class="fr sr"/><circle cx="42" cy="94" r="2.6" class="fb sb"/><circle cx="174" cy="170" r="2.6" class="fr sr"/><circle cx="112" cy="98" r="2.6" class="fb sb"/><circle cx="120" cy="137" r="2.6" class="fr sr"/><circle cx="122" cy="146" r="2.6" class="fr sr"/><circle cx="268" cy="97" r="2.6" class="fr sr"/><circle cx="185" cy="124" r="2.6" class="fr sr"/><circle cx="195" cy="180" r="2.6" class="fr sr"/><circle cx="89" cy="63" r="2.6" class="fb sb"/><circle cx="97" cy="65" r="2.6" class="fb sb"/><circle cx="170" cy="89" r="2.6" class="fb sb"/><circle cx="141" cy="76" r="2.6" class="fb sb"/><circle cx="39" cy="115" r="2.6" class="fb sb"/><circle cx="206" cy="175" r="2.6" class="fr sr"/><circle cx="131" cy="67" r="2.6" class="fb sb"/><circle cx="191" cy="126" r="2.6" class="fr sr"/><circle cx="161" cy="73" r="2.6" class="fb sb"/><circle cx="110" cy="69" r="2.6" class="fb sb"/><circle cx="164" cy="166" r="2.6" class="fr sr"/><circle cx="115" cy="135" r="2.6" class="fb sb"/><circle cx="59" cy="78" r="2.6" class="fb sb"/><circle cx="127" cy="65" r="2.6" class="fb sb"/><circle cx="238" cy="158" r="2.6" class="fr sr"/><circle cx="115" cy="125" r="2.6" class="fb sb"/><circle cx="181" cy="109" r="2.6" class="fr sr"/><circle cx="276" cy="119" r="2.6" class="fr sr"/><circle cx="108" cy="105" r="2.6" class="fb sb"/><circle cx="38" cy="113" r="2.6" class="fb sb"/><circle cx="22" cy="120" r="2.6" class="fb sb"/><circle cx="130" cy="60" r="2.6" class="fb sb"/><circle cx="266" cy="101" r="2.6" class="fr sr"/><circle cx="268" cy="117" r="2.6" class="fr sr"/><circle cx="185" cy="166" r="2.6" class="fr sr"/><circle cx="238" cy="154" r="2.6" class="fr sr"/><circle cx="53" cy="85" r="2.6" class="fb sb"/><circle cx="195" cy="110" r="2.6" class="fr sr"/><circle cx="155" cy="70" r="2.6" class="fb sb"/><circle cx="112" cy="105" r="2.6" class="fb sb"/><circle cx="195" cy="169" r="2.6" class="fr sr"/><circle cx="252" cy="129" r="2.6" class="fr sr"/><circle cx="178" cy="99" r="2.6" class="fb sb"/><circle cx="35" cy="129" r="2.6" class="fb sb"/><circle cx="237" cy="159" r="2.6" class="fr sr"/><circle cx="171" cy="85" r="2.6" class="fb sb"/><circle cx="74" cy="66" r="2.6" class="fb sb"/><circle cx="134" cy="157" r="2.6" class="fr sr"/><circle cx="33" cy="113" r="2.6" class="fb sb"/><circle cx="48" cy="92" r="2.6" class="fb sb"/><circle cx="113" cy="114" r="2.6" class="fb sb"/><circle cx="246" cy="151" r="2.6" class="fr sr"/><circle cx="175" cy="173" r="2.6" class="fr sr"/><circle cx="208" cy="169" r="2.6" class="fr sr"/><circle cx="108" cy="53" r="2.6" class="fb sb"/><circle cx="167" cy="164" r="2.6" class="fr sr"/><circle cx="195" cy="176" r="2.6" class="fr sr"/><circle cx="242" cy="162" r="2.6" class="fr sr"/><circle cx="199" cy="166" r="2.6" class="fr sr"/><circle cx="257" cy="122" r="2.6" class="fr sr"/><circle cx="156" cy="70" r="2.6" class="fb sb"/><circle cx="263" cy="140" r="2.6" class="fr sr"/><circle cx="133" cy="157" r="2.6" class="fr sr"/><circle cx="109" cy="103" r="2.6" class="fb sb"/><circle cx="110" cy="110" r="2.6" class="fb sb"/><circle cx="72" cy="72" r="2.6" class="fb sb"/><circle cx="141" cy="75" r="2.6" class="fb sb"/><circle cx="134" cy="146" r="2.6" class="fr sr"/><circle cx="182" cy="110" r="2.6" class="fr sr"/><circle cx="256" cy="128" r="2.6" class="fr sr"/><circle cx="229" cy="158" r="2.6" class="fr sr"/><circle cx="44" cy="101" r="2.6" class="fb sb"/><circle cx="123" cy="128" r="2.6" class="fb sb"/><circle cx="117" cy="62" r="2.6" class="fb sb"/><circle cx="194" cy="173" r="2.6" class="fr sr"/><circle cx="223" cy="169" r="2.6" class="fr sr"/><circle cx="160" cy="169" r="2.6" class="fr sr"/><circle cx="272" cy="116" r="2.6" class="fr sr"/><circle cx="175" cy="167" r="2.6" class="fr sr"/><circle cx="114" cy="112" r="2.6" class="fb sb"/><circle cx="112" cy="108" r="2.6" class="fb sb"/><circle cx="164" cy="87" r="2.6" class="fb sb"/><circle cx="86" cy="68" r="2.6" class="fb sb"/><circle cx="230" cy="169" r="2.6" class="fr sr"/><circle cx="130" cy="72" r="2.6" class="fb sb"/><circle cx="124" cy="123" r="2.6" class="fb sb"/><circle cx="267" cy="128" r="2.6" class="fr sr"/><circle cx="55" cy="89" r="2.6" class="fb sb"/><circle cx="182" cy="107" r="2.6" class="fr sr"/><circle cx="180" cy="88" r="2.6" class="fb sb"/><circle cx="39" cy="127" r="2.6" class="fb sb"/><circle cx="183" cy="116" r="2.6" class="fr sr"/><circle cx="145" cy="66" r="2.6" class="fb sb"/><circle cx="102" cy="61" r="2.6" class="fb sb"/><circle cx="62" cy="81" r="2.6" class="fb sb"/><circle cx="121" cy="139" r="2.6" class="fr sr"/><circle cx="146" cy="159" r="2.6" class="fr sr"/><circle cx="112" cy="116" r="2.6" class="fb sb"/><circle cx="199" cy="126" r="2.6" class="fr sr"/><circle cx="78" cy="69" r="2.6" class="fb sb"/><circle cx="123" cy="115" r="2.6" class="fb sb"/><circle cx="138" cy="63" r="2.6" class="fb sb"/><circle cx="114" cy="63" r="2.6" class="fb sb"/><circle cx="33" cy="116" r="2.6" class="fb sb"/><circle cx="153" cy="172" r="2.6" class="fr sr"/><circle cx="245" cy="148" r="2.6" class="fr sr"/><circle cx="261" cy="134" r="2.6" class="fr sr"/><circle cx="168" cy="80" r="2.6" class="fb sb"/><circle cx="249" cy="141" r="2.6" class="fr sr"/><circle cx="192" cy="115" r="2.6" class="fr sr"/><circle cx="64" cy="78" r="2.6" class="fb sb"/><circle cx="181" cy="176" r="2.6" class="fr sr"/><circle cx="190" cy="129" r="2.6" class="fr sr"/><circle cx="116" cy="110" r="2.6" class="fb sb"/><circle cx="44" cy="104" r="2.6" class="fb sb"/><circle cx="177" cy="100" r="2.6" class="fb sb"/><circle cx="170" cy="88" r="2.6" class="fb sb"/><circle cx="109" cy="61" r="2.6" class="fb sb"/><circle cx="271" cy="102" r="2.6" class="fr sr"/><circle cx="165" cy="177" r="2.6" class="fr sr"/><circle cx="185" cy="107" r="2.6" class="fr sr"/><circle cx="235" cy="162" r="2.6" class="fr sr"/><circle cx="216" cy="166" r="2.6" class="fr sr"/><circle cx="249" cy="135" r="2.6" class="fr sr"/><circle cx="97" cy="66" r="2.6" class="fb sb"/><circle cx="138" cy="70" r="2.6" class="fb sb"/><circle cx="181" cy="134" r="2.6" class="fr sr"/><circle cx="207" cy="172" r="2.6" class="fr sr"/><circle cx="73" cy="72" r="2.6" class="fb sb"/><circle cx="132" cy="144" r="2.6" class="fr sr"/><circle cx="97" cy="62" r="2.6" class="fb sb"/><circle cx="193" cy="115" r="2.6" class="fr sr"/><circle cx="146" cy="163" r="2.6" class="fr sr"/><circle cx="142" cy="78" r="2.6" class="fb sb"/><circle cx="170" cy="77" r="2.6" class="fb sb"/><circle cx="187" cy="113" r="2.6" class="fr sr"/><circle cx="107" cy="108" r="2.6" class="fb sb"/><circle cx="156" cy="66" r="2.6" class="fb sb"/><circle cx="282" cy="110" r="2.6" class="fr sr"/><circle cx="202" cy="172" r="2.6" class="fr sr"/><circle cx="38" cy="97" r="2.6" class="fb sb"/><circle cx="153" cy="162" r="2.6" class="fr sr"/><circle cx="137" cy="66" r="2.6" class="fb sb"/><circle cx="132" cy="152" r="2.6" class="fr sr"/><circle cx="185" cy="178" r="2.6" class="fr sr"/><circle cx="32" cy="101" r="2.6" class="fb sb"/><circle cx="169" cy="161" r="2.6" class="fr sr"/><circle cx="239" cy="160" r="2.6" class="fr sr"/><circle cx="157" cy="77" r="2.6" class="fb sb"/><circle cx="55" cy="82" r="2.6" class="fb sb"/><circle cx="35" cy="111" r="2.6" class="fb sb"/><circle cx="269" cy="110" r="2.6" class="fr sr"/><circle cx="172" cy="174" r="2.6" class="fr sr"/><circle cx="33" cy="139" r="2.6" class="fb sb"/><circle cx="59" cy="78" r="2.6" class="fb sb"/><circle cx="216" cy="159" r="2.6" class="fr sr"/><circle cx="62" cy="69" r="2.6" class="fb sb"/><circle cx="184" cy="170" r="2.6" class="fr sr"/><circle cx="75" cy="70" r="2.6" class="fb sb"/><circle cx="175" cy="171" r="2.6" class="fr sr"/><circle cx="113" cy="117" r="2.6" class="fb sb"/><circle cx="170" cy="90" r="2.6" class="fb sb"/><circle cx="123" cy="132" r="2.6" class="fr sr"/><circle cx="51" cy="87" r="2.6" class="fb sb"/><circle cx="196" cy="146" r="2.6" class="fr sr"/><circle cx="85" cy="71" r="2.6" class="fb sb"/><circle cx="261" cy="133" r="2.6" class="fr sr"/><circle cx="82" cy="70" r="2.6" class="fb sb"/><circle cx="267" cy="98" r="2.6" class="fr sr"/><circle cx="235" cy="151" r="2.6" class="fr sr"/><circle cx="210" cy="171" r="2.6" class="fr sr"/><circle cx="130" cy="63" r="2.6" class="fb sb"/><circle cx="153" cy="80" r="2.6" class="fb sb"/><circle cx="150" cy="73" r="2.6" class="fb sb"/><circle cx="95" cy="62" r="2.6" class="fb sb"/><circle cx="270" cy="99" r="2.6" class="fr sr"/><circle cx="35" cy="131" r="2.6" class="fb sb"/><circle cx="162" cy="163" r="2.6" class="fr sr"/><circle cx="184" cy="103" r="2.6" class="fr sr"/><circle cx="222" cy="169" r="2.6" class="fr sr"/><circle cx="31" cy="128" r="2.6" class="fb sb"/><circle cx="23" cy="129" r="2.6" class="fb sb"/><circle cx="100" cy="59" r="2.6" class="fb sb"/><circle cx="124" cy="143" r="2.6" class="fr sr"/><circle cx="69" cy="71" r="2.6" class="fb sb"/><circle cx="155" cy="178" r="2.6" class="fr sr"/><circle cx="40" cy="106" r="2.6" class="fb sb"/><circle cx="252" cy="149" r="2.6" class="fr sr"/><circle cx="272" cy="99" r="2.6" class="fr sr"/><circle cx="143" cy="159" r="2.6" class="fr sr"/><circle cx="186" cy="126" r="2.6" class="fr sr"/><circle cx="115" cy="61" r="2.6" class="fb sb"/><circle cx="151" cy="163" r="2.6" class="fr sr"/><circle cx="88" cy="66" r="2.6" class="fb sb"/><circle cx="118" cy="135" r="2.6" class="fr sr"/><circle cx="45" cy="96" r="2.6" class="fb sb"/><circle cx="25" cy="127" r="2.6" class="fb sb"/><circle cx="243" cy="152" r="2.6" class="fr sr"/><circle cx="259" cy="133" r="2.6" class="fr sr"/><circle cx="33" cy="123" r="2.6" class="fb sb"/><circle cx="247" cy="161" r="2.6" class="fr sr"/><circle cx="87" cy="68" r="2.6" class="fb sb"/><circle cx="97" cy="65" r="2.6" class="fb sb"/><circle cx="264" cy="128" r="2.6" class="fr sr"/><circle cx="189" cy="111" r="2.6" class="fr sr"/><circle cx="47" cy="92" r="2.6" class="fb sb"/><circle cx="64" cy="75" r="2.6" class="fb sb"/><circle cx="172" cy="88" r="2.6" class="fb sb"/><circle cx="138" cy="66" r="2.6" class="fb sb"/><circle cx="113" cy="126" r="2.6" class="fb sb"/><circle cx="206" cy="164" r="2.6" class="fr sr"/><circle cx="126" cy="58" r="2.6" class="fb sb"/><circle cx="196" cy="138" r="2.6" class="fr sr"/><circle cx="40" cy="95" r="2.6" class="fb sb"/><circle cx="260" cy="142" r="2.6" class="fr sr"/><circle cx="130" cy="142" r="2.6" class="fr sr"/><circle cx="163" cy="89" r="2.6" class="fb sb"/><circle cx="65" cy="75" r="2.6" class="fb sb"/><circle cx="38" cy="108" r="2.6" class="fb sb"/><circle cx="103" cy="69" r="2.6" class="fb sb"/><circle cx="184" cy="114" r="2.6" class="fr sr"/><circle cx="244" cy="154" r="2.6" class="fr sr"/><circle cx="205" cy="170" r="2.6" class="fr sr"/><circle cx="164" cy="86" r="2.6" class="fb sb"/><circle cx="36" cy="106" r="2.6" class="fb sb"/><circle cx="136" cy="68" r="2.6" class="fb sb"/><circle cx="240" cy="162" r="2.6" class="fr sr"/><circle cx="30" cy="108" r="2.6" class="fb sb"/><circle cx="178" cy="93" r="2.6" class="fb sb"/><circle cx="125" cy="141" r="2.6" class="fr sr"/><circle cx="121" cy="117" r="2.6" class="fb sb"/><circle cx="108" cy="95" r="2.6" class="fb sb"/><circle cx="226" cy="161" r="2.6" class="fr sr"/><circle cx="151" cy="175" r="2.6" class="fr sr"/><circle cx="184" cy="98" r="2.6" class="fb sb"/><circle cx="173" cy="79" r="2.6" class="fb sb"/><circle cx="41" cy="98" r="2.6" class="fb sb"/><circle cx="125" cy="155" r="2.6" class="fr sr"/><circle cx="260" cy="125" r="2.6" class="fr sr"/><circle cx="255" cy="142" r="2.6" class="fr sr"/><circle cx="32" cy="127" r="2.6" class="fb sb"/><circle cx="254" cy="138" r="2.6" class="fr sr"/><circle cx="120" cy="133" r="2.6" class="fr sr"/><circle cx="73" cy="63" r="2.6" class="fb sb"/><circle cx="152" cy="159" r="2.6" class="fr sr"/><circle cx="227" cy="165" r="2.6" class="fr sr"/><circle cx="48" cy="84" r="2.6" class="fb sb"/><circle cx="247" cy="147" r="2.6" class="fr sr"/><circle cx="122" cy="63" r="2.6" class="fb sb"/><circle cx="176" cy="100" r="2.6" class="fb sb"/><circle cx="120" cy="124" r="2.6" class="fb sb"/><circle cx="266" cy="119" r="2.6" class="fr sr"/><circle cx="122" cy="135" r="2.6" class="fr sr"/><circle cx="261" cy="118" r="2.6" class="fr sr"/><circle cx="161" cy="76" r="2.6" class="fb sb"/><circle cx="146" cy="153" r="2.6" class="fr sr"/><circle cx="86" cy="69" r="2.6" class="fb sb"/><circle cx="116" cy="67" r="2.6" class="fb sb"/><circle cx="102" cy="75" r="2.6" class="fb sb"/><circle cx="222" cy="172" r="2.6" class="fr sr"/><circle cx="261" cy="135" r="2.6" class="fr sr"/><circle cx="163" cy="173" r="2.6" class="fr sr"/><circle cx="198" cy="122" r="2.6" class="fr sr"/><circle cx="141" cy="155" r="2.6" class="fr sr"/><circle cx="233" cy="157" r="2.6" class="fr sr"/><circle cx="132" cy="153" r="2.6" class="fr sr"/><circle cx="53" cy="97" r="2.6" class="fb sb"/><circle cx="157" cy="67" r="2.6" class="fb sb"/><circle cx="119" cy="127" r="2.6" class="fb sb"/><circle cx="155" cy="35" r="2.6" class="fb sb"/><circle cx="38" cy="36" r="2.6" class="fb sb"/><circle cx="91" cy="131" r="2.6" class="fb sb"/><circle cx="255" cy="133" r="2.6" class="fr sr"/><circle cx="167" cy="202" r="2.6" class="fr sr"/><circle cx="232" cy="110" r="2.6" class="fr sr"/><circle cx="97" cy="65" r="2.6" class="fb sb"/><circle cx="88" cy="125" r="2.6" class="fb sb"/><circle cx="34" cy="134" r="2.6" class="fb sb"/><circle cx="56" cy="160" r="2.6" class="fb sb"/><circle cx="231" cy="156" r="2.6" class="fr sr"/><circle cx="146" cy="30" r="2.6" class="fb sb"/><circle cx="298" cy="76" r="2.6" class="fr sr"/><circle cx="164" cy="157" r="2.6" class="fr sr"/><circle cx="43" cy="32" r="2.6" class="fb sb"/>
<circle cx="489" cy="171" r="2.6" class="fb sb"/><circle cx="450" cy="153" r="2.6" class="fb sb"/><circle cx="506" cy="108" r="2.6" class="fr sr"/><circle cx="509" cy="170" r="2.6" class="fb sb"/><circle cx="529" cy="164" r="2.6" class="fb sb"/><circle cx="350" cy="122" r="2.6" class="fr sr"/><circle cx="526" cy="169" r="2.6" class="fb sb"/><circle cx="485" cy="164" r="2.6" class="fb sb"/><circle cx="472" cy="73" r="2.6" class="fr sr"/><circle cx="374" cy="77" r="2.6" class="fr sr"/><circle cx="585" cy="115" r="2.6" class="fb sb"/><circle cx="505" cy="112" r="2.6" class="fr sr"/><circle cx="449" cy="152" r="2.6" class="fb sb"/><circle cx="546" cy="172" r="2.6" class="fb sb"/><circle cx="505" cy="109" r="2.6" class="fr sr"/><circle cx="427" cy="62" r="2.6" class="fr sr"/><circle cx="572" cy="134" r="2.6" class="fb sb"/><circle cx="399" cy="65" r="2.6" class="fr sr"/><circle cx="518" cy="176" r="2.6" class="fb sb"/><circle cx="437" cy="120" r="2.6" class="fb sb"/><circle cx="461" cy="149" r="2.6" class="fb sb"/><circle cx="396" cy="69" r="2.6" class="fr sr"/><circle cx="360" cy="99" r="2.6" class="fr sr"/><circle cx="364" cy="102" r="2.6" class="fr sr"/><circle cx="510" cy="178" r="2.6" class="fb sb"/><circle cx="370" cy="92" r="2.6" class="fr sr"/><circle cx="464" cy="157" r="2.6" class="fb sb"/><circle cx="592" cy="117" r="2.6" class="fb sb"/><circle cx="530" cy="172" r="2.6" class="fb sb"/><circle cx="586" cy="107" r="2.6" class="fb sb"/><circle cx="402" cy="66" r="2.6" class="fr sr"/><circle cx="456" cy="64" r="2.6" class="fr sr"/><circle cx="505" cy="124" r="2.6" class="fr sr"/><circle cx="362" cy="94" r="2.6" class="fr sr"/><circle cx="494" cy="170" r="2.6" class="fb sb"/><circle cx="432" cy="98" r="2.6" class="fb sb"/><circle cx="440" cy="137" r="2.6" class="fb sb"/><circle cx="442" cy="146" r="2.6" class="fb sb"/><circle cx="588" cy="97" r="2.6" class="fb sb"/><circle cx="505" cy="124" r="2.6" class="fr sr"/><circle cx="515" cy="180" r="2.6" class="fb sb"/><circle cx="409" cy="63" r="2.6" class="fr sr"/><circle cx="417" cy="65" r="2.6" class="fr sr"/><circle cx="490" cy="89" r="2.6" class="fr sr"/><circle cx="461" cy="76" r="2.6" class="fr sr"/><circle cx="359" cy="115" r="2.6" class="fr sr"/><circle cx="526" cy="175" r="2.6" class="fb sb"/><circle cx="451" cy="67" r="2.6" class="fr sr"/><circle cx="511" cy="126" r="2.6" class="fr sr"/><circle cx="481" cy="73" r="2.6" class="fr sr"/><circle cx="430" cy="69" r="2.6" class="fr sr"/><circle cx="484" cy="166" r="2.6" class="fb sb"/><circle cx="435" cy="135" r="2.6" class="fb sb"/><circle cx="379" cy="78" r="2.6" class="fr sr"/><circle cx="447" cy="65" r="2.6" class="fr sr"/><circle cx="558" cy="158" r="2.6" class="fb sb"/><circle cx="435" cy="125" r="2.6" class="fb sb"/><circle cx="501" cy="109" r="2.6" class="fr sr"/><circle cx="596" cy="119" r="2.6" class="fb sb"/><circle cx="428" cy="105" r="2.6" class="fb sb"/><circle cx="358" cy="113" r="2.6" class="fr sr"/><circle cx="342" cy="120" r="2.6" class="fr sr"/><circle cx="450" cy="60" r="2.6" class="fr sr"/><circle cx="586" cy="101" r="2.6" class="fb sb"/><circle cx="588" cy="117" r="2.6" class="fb sb"/><circle cx="505" cy="166" r="2.6" class="fb sb"/><circle cx="558" cy="154" r="2.6" class="fb sb"/><circle cx="373" cy="85" r="2.6" class="fr sr"/><circle cx="515" cy="110" r="2.6" class="fr sr"/><circle cx="475" cy="70" r="2.6" class="fr sr"/><circle cx="432" cy="105" r="2.6" class="fb sb"/><circle cx="515" cy="169" r="2.6" class="fb sb"/><circle cx="572" cy="129" r="2.6" class="fb sb"/><circle cx="498" cy="99" r="2.6" class="fr sr"/><circle cx="355" cy="129" r="2.6" class="fr sr"/><circle cx="557" cy="159" r="2.6" class="fb sb"/><circle cx="491" cy="85" r="2.6" class="fr sr"/><circle cx="394" cy="66" r="2.6" class="fr sr"/><circle cx="454" cy="157" r="2.6" class="fb sb"/><circle cx="353" cy="113" r="2.6" class="fr sr"/><circle cx="368" cy="92" r="2.6" class="fr sr"/><circle cx="433" cy="114" r="2.6" class="fb sb"/><circle cx="566" cy="151" r="2.6" class="fb sb"/><circle cx="495" cy="173" r="2.6" class="fb sb"/><circle cx="528" cy="169" r="2.6" class="fb sb"/><circle cx="428" cy="53" r="2.6" class="fr sr"/><circle cx="487" cy="164" r="2.6" class="fb sb"/><circle cx="515" cy="176" r="2.6" class="fb sb"/><circle cx="562" cy="162" r="2.6" class="fb sb"/><circle cx="519" cy="166" r="2.6" class="fb sb"/><circle cx="577" cy="122" r="2.6" class="fb sb"/><circle cx="476" cy="70" r="2.6" class="fr sr"/><circle cx="583" cy="140" r="2.6" class="fb sb"/><circle cx="453" cy="157" r="2.6" class="fb sb"/><circle cx="429" cy="103" r="2.6" class="fb sb"/><circle cx="430" cy="110" r="2.6" class="fb sb"/><circle cx="392" cy="72" r="2.6" class="fr sr"/><circle cx="461" cy="75" r="2.6" class="fr sr"/><circle cx="454" cy="146" r="2.6" class="fb sb"/><circle cx="502" cy="110" r="2.6" class="fr sr"/><circle cx="576" cy="128" r="2.6" class="fb sb"/><circle cx="549" cy="158" r="2.6" class="fb sb"/><circle cx="364" cy="101" r="2.6" class="fr sr"/><circle cx="443" cy="128" r="2.6" class="fb sb"/><circle cx="437" cy="62" r="2.6" class="fr sr"/><circle cx="514" cy="173" r="2.6" class="fb sb"/><circle cx="543" cy="169" r="2.6" class="fb sb"/><circle cx="480" cy="169" r="2.6" class="fb sb"/><circle cx="592" cy="116" r="2.6" class="fb sb"/><circle cx="495" cy="167" r="2.6" class="fb sb"/><circle cx="434" cy="112" r="2.6" class="fb sb"/><circle cx="432" cy="108" r="2.6" class="fb sb"/><circle cx="484" cy="87" r="2.6" class="fr sr"/><circle cx="406" cy="68" r="2.6" class="fr sr"/><circle cx="550" cy="169" r="2.6" class="fb sb"/><circle cx="450" cy="72" r="2.6" class="fr sr"/><circle cx="444" cy="123" r="2.6" class="fb sb"/><circle cx="587" cy="128" r="2.6" class="fb sb"/><circle cx="375" cy="89" r="2.6" class="fr sr"/><circle cx="502" cy="107" r="2.6" class="fr sr"/><circle cx="500" cy="88" r="2.6" class="fr sr"/><circle cx="359" cy="127" r="2.6" class="fr sr"/><circle cx="503" cy="116" r="2.6" class="fr sr"/><circle cx="465" cy="66" r="2.6" class="fr sr"/><circle cx="422" cy="61" r="2.6" class="fr sr"/><circle cx="382" cy="81" r="2.6" class="fr sr"/><circle cx="441" cy="139" r="2.6" class="fb sb"/><circle cx="466" cy="159" r="2.6" class="fb sb"/><circle cx="432" cy="116" r="2.6" class="fb sb"/><circle cx="519" cy="126" r="2.6" class="fr sr"/><circle cx="398" cy="69" r="2.6" class="fr sr"/><circle cx="443" cy="115" r="2.6" class="fb sb"/><circle cx="458" cy="63" r="2.6" class="fr sr"/><circle cx="434" cy="63" r="2.6" class="fr sr"/><circle cx="353" cy="116" r="2.6" class="fr sr"/><circle cx="473" cy="172" r="2.6" class="fb sb"/><circle cx="565" cy="148" r="2.6" class="fb sb"/><circle cx="581" cy="134" r="2.6" class="fb sb"/><circle cx="488" cy="80" r="2.6" class="fr sr"/><circle cx="569" cy="141" r="2.6" class="fb sb"/><circle cx="512" cy="115" r="2.6" class="fr sr"/><circle cx="384" cy="78" r="2.6" class="fr sr"/><circle cx="501" cy="176" r="2.6" class="fb sb"/><circle cx="510" cy="129" r="2.6" class="fr sr"/><circle cx="436" cy="110" r="2.6" class="fb sb"/><circle cx="364" cy="104" r="2.6" class="fr sr"/><circle cx="497" cy="100" r="2.6" class="fr sr"/><circle cx="490" cy="88" r="2.6" class="fr sr"/><circle cx="429" cy="61" r="2.6" class="fr sr"/><circle cx="591" cy="102" r="2.6" class="fb sb"/><circle cx="485" cy="177" r="2.6" class="fb sb"/><circle cx="505" cy="107" r="2.6" class="fr sr"/><circle cx="555" cy="162" r="2.6" class="fb sb"/><circle cx="536" cy="166" r="2.6" class="fb sb"/><circle cx="569" cy="135" r="2.6" class="fb sb"/><circle cx="417" cy="66" r="2.6" class="fr sr"/><circle cx="458" cy="70" r="2.6" class="fr sr"/><circle cx="501" cy="134" r="2.6" class="fr sr"/><circle cx="527" cy="172" r="2.6" class="fb sb"/><circle cx="393" cy="72" r="2.6" class="fr sr"/><circle cx="452" cy="144" r="2.6" class="fb sb"/><circle cx="417" cy="62" r="2.6" class="fr sr"/><circle cx="513" cy="115" r="2.6" class="fr sr"/><circle cx="466" cy="163" r="2.6" class="fb sb"/><circle cx="462" cy="78" r="2.6" class="fr sr"/><circle cx="490" cy="77" r="2.6" class="fr sr"/><circle cx="507" cy="113" r="2.6" class="fr sr"/><circle cx="427" cy="108" r="2.6" class="fb sb"/><circle cx="476" cy="66" r="2.6" class="fr sr"/><circle cx="602" cy="110" r="2.6" class="fb sb"/><circle cx="522" cy="172" r="2.6" class="fb sb"/><circle cx="358" cy="97" r="2.6" class="fr sr"/><circle cx="473" cy="162" r="2.6" class="fb sb"/><circle cx="457" cy="66" r="2.6" class="fr sr"/><circle cx="452" cy="152" r="2.6" class="fb sb"/><circle cx="505" cy="178" r="2.6" class="fb sb"/><circle cx="352" cy="101" r="2.6" class="fr sr"/><circle cx="489" cy="161" r="2.6" class="fb sb"/><circle cx="559" cy="160" r="2.6" class="fb sb"/><circle cx="477" cy="77" r="2.6" class="fr sr"/><circle cx="375" cy="82" r="2.6" class="fr sr"/><circle cx="355" cy="111" r="2.6" class="fr sr"/><circle cx="589" cy="110" r="2.6" class="fb sb"/><circle cx="492" cy="174" r="2.6" class="fb sb"/><circle cx="353" cy="139" r="2.6" class="fr sr"/><circle cx="379" cy="78" r="2.6" class="fr sr"/><circle cx="536" cy="159" r="2.6" class="fb sb"/><circle cx="382" cy="69" r="2.6" class="fr sr"/><circle cx="504" cy="170" r="2.6" class="fb sb"/><circle cx="395" cy="70" r="2.6" class="fr sr"/><circle cx="495" cy="171" r="2.6" class="fb sb"/><circle cx="433" cy="117" r="2.6" class="fb sb"/><circle cx="490" cy="90" r="2.6" class="fr sr"/><circle cx="443" cy="132" r="2.6" class="fb sb"/><circle cx="371" cy="87" r="2.6" class="fr sr"/><circle cx="516" cy="146" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="405" cy="71" r="2.6" class="fr sr"/><circle cx="581" cy="133" r="2.6" class="fb sb"/><circle cx="402" cy="70" r="2.6" class="fr sr"/><circle cx="587" cy="98" r="2.6" class="fb sb"/><circle cx="555" cy="151" r="2.6" class="fb sb"/><circle cx="530" cy="171" r="2.6" class="fb sb"/><circle cx="450" cy="63" r="2.6" class="fr sr"/><circle cx="473" cy="80" r="2.6" class="fr sr"/><circle cx="470" cy="73" r="2.6" class="fr sr"/><circle cx="415" cy="62" r="2.6" class="fr sr"/><circle cx="590" cy="99" r="2.6" class="fb sb"/><circle cx="355" cy="131" r="2.6" class="fr sr"/><circle cx="482" cy="163" r="2.6" class="fb sb"/><circle cx="504" cy="103" r="2.6" class="fr sr"/><circle cx="542" cy="169" r="2.6" class="fb sb"/><circle cx="351" cy="128" r="2.6" class="fr sr"/><circle cx="343" cy="129" r="2.6" class="fr sr"/><circle cx="420" cy="59" r="2.6" class="fr sr"/><circle cx="444" cy="143" r="2.6" class="fb sb"/><circle cx="389" cy="71" r="2.6" class="fr sr"/><circle cx="475" cy="178" r="2.6" class="fb sb"/><circle cx="360" cy="106" r="2.6" class="fr sr"/><circle cx="572" cy="149" r="2.6" class="fb sb"/><circle cx="592" cy="99" r="2.6" class="fb sb"/><circle cx="463" cy="159" r="2.6" class="fb sb"/><circle cx="506" cy="126" r="2.6" class="fr sr"/><circle cx="435" cy="61" r="2.6" class="fr sr"/><circle cx="471" cy="163" r="2.6" class="fb sb"/><circle cx="408" cy="66" r="2.6" class="fr sr"/><circle cx="438" cy="135" r="2.6" class="fb sb"/><circle cx="365" cy="96" r="2.6" class="fr sr"/><circle cx="345" cy="127" r="2.6" class="fr sr"/><circle cx="563" cy="152" r="2.6" class="fb sb"/><circle cx="579" cy="133" r="2.6" class="fb sb"/><circle cx="353" cy="123" r="2.6" class="fr sr"/><circle cx="567" cy="161" r="2.6" class="fb sb"/><circle cx="407" cy="68" r="2.6" class="fr sr"/><circle cx="417" cy="65" r="2.6" class="fr sr"/><circle cx="584" cy="128" r="2.6" class="fb sb"/><circle cx="509" cy="111" r="2.6" class="fr sr"/><circle cx="367" cy="92" r="2.6" class="fr sr"/><circle cx="384" cy="75" r="2.6" class="fr sr"/><circle cx="492" cy="88" r="2.6" class="fr sr"/><circle cx="458" cy="66" r="2.6" class="fr sr"/><circle cx="433" cy="126" r="2.6" class="fb sb"/><circle cx="526" cy="164" r="2.6" class="fb sb"/><circle cx="446" cy="58" r="2.6" class="fr sr"/><circle cx="516" cy="138" r="2.6" class="fr sr"/><circle cx="360" cy="95" r="2.6" class="fr sr"/><circle cx="580" cy="142" r="2.6" class="fb sb"/><circle cx="450" cy="142" r="2.6" class="fb sb"/><circle cx="483" cy="89" r="2.6" class="fr sr"/><circle cx="385" cy="75" r="2.6" class="fr sr"/><circle cx="358" cy="108" r="2.6" class="fr sr"/><circle cx="423" cy="69" r="2.6" class="fr sr"/><circle cx="504" cy="114" r="2.6" class="fr sr"/><circle cx="564" cy="154" r="2.6" class="fb sb"/><circle cx="525" cy="170" r="2.6" class="fb sb"/><circle cx="484" cy="86" r="2.6" class="fr sr"/><circle cx="356" cy="106" r="2.6" class="fr sr"/><circle cx="456" cy="68" r="2.6" class="fr sr"/><circle cx="560" cy="162" r="2.6" class="fb sb"/><circle cx="350" cy="108" r="2.6" class="fr sr"/><circle cx="498" cy="93" r="2.6" class="fr sr"/><circle cx="445" cy="141" r="2.6" class="fb sb"/><circle cx="441" cy="117" r="2.6" class="fb sb"/><circle cx="428" cy="95" r="2.6" class="fb sb"/><circle cx="546" cy="161" r="2.6" class="fb sb"/><circle cx="471" cy="175" r="2.6" class="fb sb"/><circle cx="504" cy="98" r="2.6" class="fr sr"/><circle cx="493" cy="79" r="2.6" class="fr sr"/><circle cx="361" cy="98" r="2.6" class="fr sr"/><circle cx="445" cy="155" r="2.6" class="fb sb"/><circle cx="580" cy="125" r="2.6" class="fb sb"/><circle cx="575" cy="142" r="2.6" class="fb sb"/><circle cx="352" cy="127" r="2.6" class="fr sr"/><circle cx="574" cy="138" r="2.6" class="fb sb"/><circle cx="440" cy="133" r="2.6" class="fb sb"/><circle cx="393" cy="63" r="2.6" class="fr sr"/><circle cx="472" cy="159" r="2.6" class="fb sb"/><circle cx="547" cy="165" r="2.6" class="fb sb"/><circle cx="368" cy="84" r="2.6" class="fr sr"/><circle cx="567" cy="147" r="2.6" class="fb sb"/><circle cx="442" cy="63" r="2.6" class="fr sr"/><circle cx="496" cy="100" r="2.6" class="fr sr"/><circle cx="440" cy="124" r="2.6" class="fb sb"/><circle cx="586" cy="119" r="2.6" class="fb sb"/><circle cx="442" cy="135" r="2.6" class="fb sb"/><circle cx="581" cy="118" r="2.6" class="fb sb"/><circle cx="481" cy="76" r="2.6" class="fr sr"/><circle cx="466" cy="153" r="2.6" class="fb sb"/><circle cx="406" cy="69" r="2.6" class="fr sr"/><circle cx="436" cy="67" r="2.6" class="fr sr"/><circle cx="422" cy="75" r="2.6" class="fr sr"/><circle cx="542" cy="172" r="2.6" class="fb sb"/><circle cx="581" cy="135" r="2.6" class="fb sb"/><circle cx="483" cy="173" r="2.6" class="fb sb"/><circle cx="518" cy="122" r="2.6" class="fr sr"/><circle cx="461" cy="155" r="2.6" class="fb sb"/><circle cx="553" cy="157" r="2.6" class="fb sb"/><circle cx="452" cy="153" r="2.6" class="fb sb"/><circle cx="373" cy="97" r="2.6" class="fr sr"/><circle cx="477" cy="67" r="2.6" class="fr sr"/><circle cx="439" cy="127" r="2.6" class="fb sb"/><circle cx="475" cy="35" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="358" cy="36" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="411" cy="131" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="575" cy="133" r="2.6" class="fb sb"/><circle cx="487" cy="202" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="552" cy="110" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="417" cy="65" r="2.6" class="fr sr"/><circle cx="408" cy="125" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="354" cy="134" r="2.6" class="fr sr"/><circle cx="376" cy="160" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="551" cy="156" r="2.6" class="fb sb"/><circle cx="466" cy="30" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="618" cy="76" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/><circle cx="484" cy="157" r="2.6" class="fb sb"/><circle cx="363" cy="32" r="2.6" class="fs" stroke="currentColor" stroke-width="0.8"/>
<line x1="320" y1="26" x2="320" y2="206" stroke="currentColor" stroke-opacity="0.2"/>
<text x="160" y="224" text-anchor="middle" class="tm" font-size="11">straight cut; every junk row forced into a moon</text>
<text x="480" y="224" text-anchor="middle" class="tm" font-size="11">follows each moon; hollow grey circles = noise (−1)</text>
</svg><figcaption>The same 315 rows (300 moon points + 15 junk points, scaled). Colours are the cluster labels each algorithm returned.</figcaption></figure>
  <p>K-Means scores only 0.461 on the moon rows: it cuts both moons with one straight line, as the left panel shows, and every junk row was pushed into a moon because it has no way to say "none of the above". DBSCAN recovers the two moons almost perfectly (0.993), labels 10 of the 15 junk rows as noise, and wrongly calls only 1 of the 300 moon points noise. The other 5 junk rows happened to land inside or right next to a moon, where nothing could tell them apart from real moon points. Nobody told DBSCAN that there were two clusters.</p>
  <p>This does not make DBSCAN "better than K-Means" in general. On round, well-separated groups of similar size, K-Means is faster, simpler and at least as accurate, as section 05 will show. Density methods win when shapes are irregular, when there is noise you want to throw away, or when you do not know how many groups to expect. To use one well, we first need to turn the vague word "crowded" into something a computer can check.</p>

  <h2 id="db-points"><span class="num">02</span>Core, Border and Noise Points</h2>
  <p>"A cluster is a crowded region" is a nice sentence, but a program needs a yes-or-no test for "this point is in a crowd". DBSCAN's test is a count. Draw a circle of radius <strong>eps</strong> (short for epsilon, the Greek letter mathematicians use for a small distance) around a point, and count how many points fall inside it, the point itself included. If the count reaches <strong>min_samples</strong>, the point is in a crowded spot. The set of points inside the circle is called the point's <strong>eps-neighbourhood</strong>, written N_eps(p) = { q : distance(p, q) ≤ eps }. For the stalls we use eps = 1.5 km and min_samples = 4, which reads: "a stall is in a crowd if at least 4 stalls, itself included, lie within 1.5 km of it".</p>
  <p>Counting like this sorts every point into one of three kinds. A <strong>core point</strong> has at least min_samples points in its eps-neighbourhood: it sits in a crowded spot. A <strong>border point</strong> does not have enough neighbours to be core itself, but it lies inside the circle of at least one core point: it sits on the edge of a crowd. A <strong>noise point</strong> is neither: nothing crowded is near it, and scikit-learn gives it the label −1. A school playground is a good picture. Children standing in the middle of a big group are core; a child standing at the edge of the group, close to some of its members but with only one or two others nearby, is border; a child standing alone by the gate is noise.</p>
  <p>Let us label all twelve stalls by hand. On a grid three distances keep appearing: a stall one step across or up is √(1² + 0²) = 1 km away; a diagonal neighbour is √(1² + 1²) = √2 ≈ 1.414 km away; a "knight's move" neighbour (two across, one up) is √(2² + 1²) = √5 ≈ 2.236 km away. With eps = 1.5, side and diagonal neighbours are inside the circle and knight's moves are not.</p>
  <table class="tbl">
    <tr><th>Stall</th><th>Nearby stalls and distances (km)</th><th>Within 1.5</th><th>Count (incl. itself)</th><th>Kind</th></tr>
    <tr><td>A (1,1)</td><td>B 1, C 1, D 1.414, E 2.236</td><td>B, C, D</td><td>4</td><td>core</td></tr>
    <tr><td>B (2,1)</td><td>A 1, D 1, C 1.414, E 1.414</td><td>A, C, D, E</td><td>5</td><td>core</td></tr>
    <tr><td>C (1,2)</td><td>A 1, D 1, B 1.414, E 2</td><td>A, B, D</td><td>4</td><td>core</td></tr>
    <tr><td>D (2,2)</td><td>B 1, C 1, E 1, A 1.414</td><td>A, B, C, E</td><td>5</td><td>core</td></tr>
    <tr><td>E (3,2)</td><td>D 1, B 1.414, C 2, A 2.236</td><td>B, D</td><td>3</td><td>border (B and D are core)</td></tr>
    <tr><td>F, G, H</td><td>three neighbours at 1, 1 and 1.414</td><td>3 each</td><td>4</td><td>core</td></tr>
    <tr><td>I (7,6)</td><td>G 1, H 1, F 1.414, J 1.414</td><td>F, G, H, J</td><td>5</td><td>core</td></tr>
    <tr><td>J (8,7)</td><td>I 1.414, G 2.236, H 2.236</td><td>I</td><td>2</td><td>border (I is core)</td></tr>
    <tr><td>K (4,9)</td><td>nearest is H at 3.606</td><td>none</td><td>1</td><td>noise</td></tr>
    <tr><td>L (10,1)</td><td>nearest is G at 5</td><td>none</td><td>1</td><td>noise</td></tr>
  </table>
  <p>Read the E row slowly, because it is the subtle one. E has only 3 stalls in its circle (itself, B and D), one short of min_samples = 4, so E is not core. But E lies inside the circles of B and D, which are core, so E is a border point rather than noise. J is the same story with only I nearby. K and L have nobody within 1.5 km, so no core point can reach them: they are noise. The figure shows these circles on the map.</p>
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
  <p>The same labelling in code takes four lines. <code>P[:, None, :] - P[None, :, :]</code> uses numpy broadcasting to subtract every stall from every other stall, giving the full 12 × 12 table of distances; comparing it with eps marks which pairs are close, and summing each row gives each stall's count.</p>
  <div class="fx" data-lang="py">eps, min_samples = 1.5, 4
D = np.sqrt(((P[:, None, :] - P[None, :, :]) ** 2).sum(-1))   # 12 x 12 matrix of distances
N = D &lt;= eps                        # N[i, j] is True if stall j is inside stall i's circle
count = N.sum(1)                    # how many stalls in each circle, the stall itself included
core = count &gt;= min_samples
for i, nm in enumerate(names):
    others = "".join(names[j] for j in np.where(N[i])[0] if j != i)
    kind = "core" if core[i] else ("border" if N[i][core].any() else "noise")
    print(f"{nm}  others within eps: {others or '-':5s} count={count[i]}  -&gt; {kind}")</div>
  <div class="fx" data-lang="text">A  others within eps: BCD   count=4  -&gt; core
B  others within eps: ACDE  count=5  -&gt; core
C  others within eps: ABD   count=4  -&gt; core
D  others within eps: ABCE  count=5  -&gt; core
E  others within eps: BD    count=3  -&gt; border
F  others within eps: GHI   count=4  -&gt; core
G  others within eps: FHI   count=4  -&gt; core
H  others within eps: FGI   count=4  -&gt; core
I  others within eps: FGHJ  count=5  -&gt; core
J  others within eps: I     count=2  -&gt; border
K  others within eps: -     count=1  -&gt; noise
L  others within eps: -     count=1  -&gt; noise</div>
  <p>Every row matches the hand table. scikit-learn's <code>DBSCAN</code> gives the same answer: <code>labels_</code> holds each point's cluster number (−1 for noise) and <code>core_sample_indices_</code> lists the rows that were core.</p>
  <div class="fx" data-lang="py">db12 = DBSCAN(eps=1.5, min_samples=4).fit(P)
print("labels:", " ".join(f"{n}={l}" for n, l in zip(names, db12.labels_)))
print("core  :", "".join(names[i] for i in db12.core_sample_indices_))</div>
  <div class="fx" data-lang="text">labels: A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=-1 L=-1
core  : ABCDFGHI</div>
  <p>E and J are in clusters but missing from the core list, because they are border points, and K and L are −1. The stall markets came out as cluster 0 and cluster 1 even though we never asked for two clusters.</p>
  <p>One convention trips people up constantly. In scikit-learn and in the original paper, min_samples <em>counts the point itself</em>, so min_samples = 4 means "the point plus at least 3 others". Some books and other libraries count only the others. E has 2 other stalls nearby and 3 including itself; compare the wrong number with min_samples and its kind flips. Always check which convention a source uses before comparing numbers.</p>

  <h2 id="db-grow"><span class="num">03</span>How Clusters Grow</h2>
  <p>A single eps-circle is small, but a cluster can be long and curved, far wider than one circle: the tips of one moon in section 01 are many times eps apart. So DBSCAN needs a rule that links circles together into one cluster. The rule is chaining. A core point "reaches" every point in its circle. If one of those points is also core, it reaches the points in its own circle, and so on, so the cluster spreads from crowd to crowd like news passing through a packed room.</p>
  <p>The formal names for this are worth knowing because interviewers use them. A point q is <strong>directly density-reachable</strong> from p if p is a core point and q is inside p's circle. q is <strong>density-reachable</strong> from p if there is a chain of such steps from p to q, which means every point in the chain except possibly the last must be core. Two points are <strong>density-connected</strong> if some core point reaches both of them. Finally, a <strong>cluster</strong> is a largest-possible set of density-connected points: everything reachable from its core points is included, and every pair in it is connected.</p>
  <p>Why three words instead of one? Because reaching is one-directional. On the stalls, E is directly reachable from D (D is core and E is in D's circle), but D is not reachable from E, because E is not core and a step can only start from a core point. Two border points at opposite ends of a cluster cannot reach each other at all. Yet they clearly belong together, because a core point in the middle reaches both of them, and "connected" is the symmetric relation that captures this. For example, A and E are 2.236 km apart, more than eps, but A reaches D and D reaches E, so both are in the same cluster. eps is the size of one step, not the size of a cluster.</p>
  <p>This one-way rule is also what makes DBSCAN robust. Only core points pass the cluster along, and border points are dead ends. So a thin line of stray points between two groups cannot chain them into one cluster: each stray point is at best a border point, and the chain stops there. Single-linkage hierarchical clustering (see <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a>) has no such protection, which is why one stray point can merge two of its clusters.</p>
  <p>To turn the definition into an algorithm, DBSCAN uses a flood fill, much like the paint-bucket tool in a drawing program. First it finds every point's eps-neighbourhood and marks the core points. Then it walks through the points in row order. When it finds a core point that has no label yet, it starts a new cluster with it and puts it in a queue. It repeatedly takes a point out of the queue and gives the cluster's label to every unlabelled point in its circle; any of those that are core are added to the queue, so they spread the cluster further, while border points are labelled and go no further. When the queue is empty that cluster is complete, and the walk continues to look for the next unlabelled core point. Whatever is still unlabelled at the end is noise.</p>
  <p>Here is that procedure written out line by line. The <code>deque</code> is a first-in-first-out queue, and when stall names are passed it prints one line each time a point is taken out of the queue, so you can follow it on the map.</p>
  <div class="fx" data-lang="py">from collections import deque

def dbscan_scratch(X, eps, min_samples, names=None):
    n = len(X)
    D = np.sqrt(((X[:, None, :] - X[None, :, :]) ** 2).sum(-1))
    neigh = [np.where(D[i] &lt;= eps)[0] for i in range(n)]      # every eps-neighbourhood
    core = np.array([len(nb) &gt;= min_samples for nb in neigh])
    labels = np.full(n, -1)                                   # everyone starts as -1
    c = 0
    for i in range(n):
        if labels[i] != -1 or not core[i]:
            continue                                          # only an unlabelled CORE point starts a cluster
        labels[i] = c
        queue = deque([i])
        while queue:
            p = queue.popleft()
            new = [q for q in neigh[p] if labels[q] == -1]
            for q in new:
                labels[q] = c                                 # core or border: joins cluster c
                if core[q]:
                    queue.append(q)                           # only core points spread the cluster
            if names:
                print(f"  cluster {c}: take {names[p]} -&gt; claims {''.join(names[q] for q in new) or '-':4s}"
                      f" queue now {''.join(names[q] for q in queue) or 'empty'}")
        c += 1
    return labels

print("scratch:", dbscan_scratch(P, 1.5, 4, names))
print("sklearn:", DBSCAN(eps=1.5, min_samples=4).fit_predict(P))
print("same on the 315 moon rows:", np.array_equal(dbscan_scratch(X, 0.3, 5), DBSCAN(eps=0.3, min_samples=5).fit_predict(X)))</div>
  <div class="fx" data-lang="text">  cluster 0: take A -&gt; claims BCD  queue now BCD
  cluster 0: take B -&gt; claims E    queue now CD
  cluster 0: take C -&gt; claims -    queue now D
  cluster 0: take D -&gt; claims -    queue now empty
  cluster 1: take F -&gt; claims GHI  queue now GHI
  cluster 1: take G -&gt; claims -    queue now HI
  cluster 1: take H -&gt; claims -    queue now I
  cluster 1: take I -&gt; claims J    queue now empty
scratch: [ 0  0  0  0  0  1  1  1  1  1 -1 -1]
sklearn: [ 0  0  0  0  0  1  1  1  1  1 -1 -1]
same on the 315 moon rows: True</div>
  <p>Follow the printout. A is the first unlabelled core point, so cluster 0 starts at A, which claims B, C and D (all core, so all join the queue). B then claims E, but E is a border point, so it is labelled and not queued. C and D find nobody new, the queue empties, and cluster 0 is {A, B, C, D, E}. The walk moves on: B, C, D and E are already labelled, F is the next unlabelled core point, and cluster 1 grows from F the same way, with I finally claiming the border stall J. K and L are never reached and stay −1. The result matches scikit-learn exactly, and so does the run on the 315 moon rows, which shows the small function really is the algorithm.</p>
  <p>Is the result always the same? Almost. Being core is just a count, and being noise means no core point is nearby, so neither depends on the order of the rows. The one exception is a border point that lies within eps of core points from <em>two different</em> clusters. It can only take one label, and it takes the label of whichever cluster's flood fill reaches it first. The stalls have no such point, so here is a tiny one-dimensional case: two groups at 0–1 and 4–5, and one point at 2.5 that is exactly 1.5 away from the core point 1 and the core point 4.</p>
  <div class="fx" data-lang="py">x1 = np.array([0, 0.5, 1, 2.5, 4, 4.5, 5])[:, None]     # the point 2.5 sits between two groups
for order in ([0, 1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1, 0]):
    lab = DBSCAN(eps=1.5, min_samples=4).fit_predict(x1[order])
    pos = order.index(3)
    print("rows in order", order, "-&gt; 2.5 joins the group",
          sorted(x1[order][lab == lab[pos]].ravel().tolist()))</div>
  <div class="fx" data-lang="text">rows in order [0, 1, 2, 3, 4, 5, 6] -&gt; 2.5 joins the group [0.0, 0.5, 1.0, 2.5]
rows in order [6, 5, 4, 3, 2, 1, 0] -&gt; 2.5 joins the group [2.5, 4.0, 4.5, 5.0]</div>
  <p>In the natural row order, the left group is found first and claims the 2.5 point; with the rows reversed the right group comes first and claims it. Nothing else changes. A variant called <strong>DBSCAN*</strong> avoids this by treating all border points as noise, which makes the result fully deterministic; HDBSCAN, in section 06, is built on DBSCAN*.</p>

  <h2 id="db-eps"><span class="num">04</span>Choosing eps and min_samples</h2>
  <p>So far we chose eps = 1.5 km and min_samples = 4 by looking at a map. Real data with twenty columns cannot be looked at, and the whole result depends on these two numbers, so we need a systematic way to choose them.</p>
  <p>Choose min_samples first, because it decides how much evidence a point needs before it counts as crowded. It should be at least d + 1 for d features: with min_samples = 1 every point is core, there is no noise at all, and DBSCAN turns into plain single-linkage clustering. The usual starting point is about 2 × d; the stalls have d = 2 columns, so 4 is exactly the rule of thumb. For noisy or very large data sets use a larger value, so that small accidental clumps of points stop counting as clusters.</p>
  <p>With min_samples = k fixed, look at each point's distance to its k-th nearest point, counting the point itself as the first. This is called the point's <strong>k-distance</strong>, and it has one very useful property: <em>a point is core exactly when its k-distance is at most eps</em>. That is just a restatement of the definition, because "my k-th closest point is within eps" means "at least k points are within eps". So if you sort everyone's k-distances, you can see at a glance what fraction of the points would be core for any eps you might pick.</p>
  <p>For the stalls with k = 4, the k-distance is the third-smallest distance to another stall (the first "neighbour" is the stall itself at distance 0). D has three stalls at 1 km, so its 4-distance is 1.0. A, B, C, F, G, H and I have two at 1 km and one at 1.414, so theirs is 1.414. E's third neighbour is C at 2, J's is 2.236, K's is 4.472 and L's is 5.831. scikit-learn's <code>NearestNeighbors</code> computes the same thing; asking it for <code>n_neighbors=4</code> on the training points themselves returns each stall plus its three nearest, which is exactly DBSCAN's convention.</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import NearestNeighbors
dist, _ = NearestNeighbors(n_neighbors=4).fit(P).kneighbors(P)   # 4 = min_samples; column 0 is the stall itself
kd = dist[:, -1]
print("  ".join(f"{nm}:{v:.3f}" for nm, v in sorted(zip(names, kd), key=lambda t: t[1])))</div>
  <div class="fx" data-lang="text">D:1.000  A:1.414  B:1.414  C:1.414  F:1.414  G:1.414  H:1.414  I:1.414  E:2.000  J:2.236  K:4.472  L:5.831</div>
  <p>Sorted, the values sit on a low plateau (1.0 and seven values of 1.414) and then jump: 2.0, 2.236, 4.472, 5.831. Points inside a crowd have small, similar k-distances; lonely points have large ones. eps belongs just after the plateau, at the bend in the sorted curve that people call the <strong>knee</strong>. Any eps from 1.414 up to just below 2.0 makes exactly the same eight stalls core, and our 1.5 is inside that range. Notice that the k-distances alone cannot tell a border point from noise (E and K both have large values); that is decided afterwards by whether a core point is nearby. Here is what happens to the stalls as eps moves through the sorted values:</p>
  <div class="fx" data-lang="py">for e in (1.0, 1.5, 2.0, 2.5, 4.5):
    lab = DBSCAN(eps=e, min_samples=4).fit_predict(P)
    print(f"eps={e:&lt;4}", " ".join(f"{n}={l:2d}" for n, l in zip(names, lab)))</div>
  <div class="fx" data-lang="text">eps=1.0  A=-1 B= 0 C= 0 D= 0 E= 0 F=-1 G=-1 H=-1 I=-1 J=-1 K=-1 L=-1
eps=1.5  A= 0 B= 0 C= 0 D= 0 E= 0 F= 1 G= 1 H= 1 I= 1 J= 1 K=-1 L=-1
eps=2.0  A= 0 B= 0 C= 0 D= 0 E= 0 F= 1 G= 1 H= 1 I= 1 J= 1 K=-1 L=-1
eps=2.5  A= 0 B= 0 C= 0 D= 0 E= 0 F= 1 G= 1 H= 1 I= 1 J= 1 K=-1 L=-1
eps=4.5  A= 0 B= 0 C= 0 D= 0 E= 0 F= 0 G= 0 H= 0 I= 0 J= 0 K= 0 L=-1</div>
  <p>At eps = 1.0 only D is core (its 4-distance is exactly 1.0), so cluster 0 is D plus its circle (B, C, E), stall A becomes noise, and the whole college market disappears. From 1.5 to 2.5 the answer is the right one; at 2.5 E and J have also become core, which changes nothing visible. At 4.5 the gap between the markets (E to F is 4.243 km) is inside one circle, so the two markets merge and K joins them; only L is still noise. A range of eps over which the answer does not change, like 1.5 to 2.5 here, is a good sign that the structure is real.</p>
  <p>On larger data you look at the curve instead of a table. For the 315 moon-and-junk rows with k = 5 the sorted k-distances look like this:</p>
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
  <p>A simple automatic way to find the knee is to draw a straight line from the first to the last point of the sorted curve and take the point that lies farthest below that line:</p>
  <div class="fx" data-lang="py">dist, _ = NearestNeighbors(n_neighbors=5).fit(X).kneighbors(X)
kd = np.sort(dist[:, -1])                         # sorted k-distances, k = min_samples = 5
print("percentiles 50/80/90/95/98:", np.percentile(kd, [50, 80, 90, 95, 98]).round(3))
i = np.arange(len(kd))                            # knee = point farthest below the line joining the ends
line = kd[0] + (kd[-1] - kd[0]) * i / (len(kd) - 1)
knee = np.argmax(line - kd)
print("knee at row", knee, "of", len(kd), "-&gt; eps about", round(kd[knee], 3))</div>
  <div class="fx" data-lang="text">percentiles 50/80/90/95/98: [0.116 0.153 0.177 0.258 0.659]
knee at row 296 of 315 -&gt; eps about 0.202</div>
  <p>Half the points have a 5-distance of 0.116 or less and 95% are below 0.258; after that the curve shoots up (the 98th percentile is 0.659) because of the junk rows. The automatic knee lands at 0.202. Treat the knee as the lower end of a search range rather than the final answer, and try a small grid of values around it:</p>
  <div class="fx" data-lang="py">print("eps   min_samples=3     min_samples=5     min_samples=10")
for e in (0.1, 0.2, 0.3, 0.5, 0.8):
    row = []
    for m in (3, 5, 10):
        l = DBSCAN(eps=e, min_samples=m).fit_predict(X)
        row.append(f"k={len(set(l) - {-1}):2d} noise={(l == -1).sum():3d}")
    print(f"{e:&lt;5}", "   ".join(row))</div>
  <div class="fx" data-lang="text">eps   min_samples=3     min_samples=5     min_samples=10
0.1   k=33 noise= 50   k=21 noise=158   k= 0 noise=315
0.2   k= 2 noise= 13   k= 3 noise= 14   k= 9 noise= 43
0.3   k= 2 noise= 10   k= 2 noise= 11   k= 2 noise= 12
0.5   k= 1 noise=  7   k= 1 noise=  7   k= 2 noise=  7
0.8   k= 1 noise=  2   k= 1 noise=  2   k= 1 noise=  3</div>
  <p>Read it column by column. With min_samples = 5, eps = 0.1 shatters the data into 21 little clusters with 158 noise points, because most points are not core at that radius; eps = 0.2 (the knee) gives 3 clusters because one moon tip is cut off; eps = 0.3 gives the right 2 clusters with 11 noise points; and from 0.5 the two moons are bridged into one. A smaller min_samples is more forgiving (at eps = 0.1 only 50 rows are noise, but spread over 33 tiny clusters), and a larger one is stricter (at eps = 0.1 nothing is core and all 315 rows are noise). In the 0.3 row all three settings agree on 2 clusters: just as with the stalls, a region where nudging the knobs does not change the answer is the one to trust. If you change min_samples, recompute the k-distance plot, because a larger k gives larger k-distances and moves the knee to a larger eps.</p>
  <p>Finally, remember that eps is measured in the units of your features. For the stalls it is kilometres; after <code>StandardScaler</code> it is "standard deviations". If one feature is in rupees and another in years, no single radius can be right in both directions, so scale the features first (see <a class="xref" data-note="ml_features">Feature Engineering</a>) and then choose eps.</p>

  <h2 id="db-shapes"><span class="num">05</span>Where DBSCAN Wins and Where It Fails</h2>
  <p>The moons in section 01 were one data set. To see the general pattern, here are three classic shapes, each scaled, each clustered by K-Means (given the true k) and by DBSCAN with the same settings everywhere (eps = 0.3, min_samples = 5):</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_circles, make_blobs
sets = {
    "moons":   make_moons(n_samples=400, noise=0.06, random_state=0),
    "circles": make_circles(n_samples=400, noise=0.05, factor=0.45, random_state=0),
    "blobs":   make_blobs(n_samples=400, centers=3, cluster_std=0.6, random_state=2),
}
print(f"{'data':8s} {'K-Means ARI':&gt;11s} {'DBSCAN ARI':&gt;10s} {'DBSCAN k':&gt;8s} {'noise':&gt;5s}")
for name, (Xd, yd) in sets.items():
    Xd = StandardScaler().fit_transform(Xd)
    a = KMeans(n_clusters=len(set(yd)), n_init=10, random_state=0).fit_predict(Xd)
    b = DBSCAN(eps=0.3, min_samples=5).fit_predict(Xd)
    print(f"{name:8s} {adjusted_rand_score(yd, a):11.3f} {adjusted_rand_score(yd, b):10.3f} "
          f"{len(set(b) - {-1}):8d} {(b == -1).sum():5d}")</div>
  <div class="fx" data-lang="text">data     K-Means ARI DBSCAN ARI DBSCAN k noise
moons          0.475      1.000        2     0
circles       -0.003      1.000        2     0
blobs          0.985      0.952        3     5</div>
  <p>On the moons and on two rings, one inside the other, DBSCAN is perfect without being told k, because chaining from core point to core point simply follows each curve. K-Means scores 0.475 on the moons and a slightly <em>negative</em> ARI on the rings, which is worse than random labelling: both rings have the same centre, so any straight cut slices both rings in half. On three round blobs the roles reverse. This is K-Means' home ground and it scores 0.985, while DBSCAN scores 0.952 because it labels 5 points in the thin outer edges of the blobs as noise, although they really belong to a blob. A useful picture is that K-Means draws school catchment areas, where everyone goes to the nearest school and the boundaries are straight lines, while DBSCAN traces a river, following the water wherever it bends and leaving the dry land out.</p>
  <p>Those blob edge points also show that DBSCAN's −1 does not mean "anomaly". It means "not in a dense region at this eps", and that includes perfectly ordinary rows at the thin edges of clusters. If finding anomalies is the actual goal, a dedicated method such as Isolation Forest or Local Outlier Factor usually works better.</p>
  <p>DBSCAN's real weakness appears when clusters have different densities. It uses one eps for the whole map, and one radius cannot be right for a packed city centre and a spread-out suburb at the same time. You can already see a hint of this on the stalls: at eps = 1.0 the station market partly survived, because D has four stalls within 1 km, while the college market vanished completely, although by eye it is just as much a market. Real data is far less kind. Here are three clouds with very different spreads, a tight one (spread 0.3, 300 points), a loose one (spread 1.5, 300 points) and a medium one (spread 0.6, 100 points):</p>
  <div class="fx" data-lang="py">from sklearn.cluster import HDBSCAN
Xv, yv = make_blobs(n_samples=[300, 300, 100], centers=[[0, 0], [6, 0], [3, 5]],
                    cluster_std=[0.3, 1.5, 0.6], random_state=1)          # tight, loose, medium
for e in (0.2, 0.4, 0.7, 1.0, 1.5):
    l = DBSCAN(eps=e, min_samples=5).fit_predict(Xv)
    print(f"DBSCAN eps={e:&lt;4} clusters={len(set(l) - {-1}):2d} noise={(l == -1).sum():3d} "
          f"ARI={adjusted_rand_score(yv, l):.3f}")
l = HDBSCAN(min_cluster_size=20, copy=True).fit_predict(Xv)
print(f"HDBSCAN (no eps)  clusters={len(set(l) - {-1})} noise={(l == -1).sum()} ARI={adjusted_rand_score(yv, l):.3f}")</div>
  <div class="fx" data-lang="text">DBSCAN eps=0.2  clusters=13 noise=288 ARI=0.704
DBSCAN eps=0.4  clusters= 5 noise= 95 ARI=0.796
DBSCAN eps=0.7  clusters= 3 noise= 16 ARI=0.952
DBSCAN eps=1.0  clusters= 2 noise=  8 ARI=0.334
DBSCAN eps=1.5  clusters= 1 noise=  0 ARI=0.000
HDBSCAN (no eps)  clusters=3 noise=30 ARI=0.913</div>
  <p>With a small eps (0.2, 0.4) the tight cloud is found but the loose cloud falls apart into fragments and hundreds of noise points. With a large eps (1.0, 1.5) the loose cloud is held together but the tight and medium clouds merge into it. Only eps = 0.7 happens to land on three clusters (ARI 0.952), and you could not have known that without the true labels. The last line is a preview of the fix: HDBSCAN, which has no eps at all, finds the three clouds (ARI 0.913) and calls 30 thin-edge points noise.</p>
  <p>A helpful way to picture the problem is to imagine the density of points as a landscape, with hills where points are crowded and valleys where they are sparse. Choosing eps is like choosing one water level and calling every island that sticks out a cluster. A tight cluster is a tall, narrow hill and a loose cluster is a low, wide one, so no single water level shows both of them as separate islands. What we would like is to look at every water level and pick, for each region, the level at which its cluster stands out best. That is exactly what HDBSCAN does.</p>

  <h2 id="db-hdbscan"><span class="num">06</span>HDBSCAN</h2>
  <p><strong>HDBSCAN</strong> (Hierarchical DBSCAN; Campello, Moulavi and Sander, 2013) runs DBSCAN at every possible eps at once and keeps, region by region, the clusters that last the longest. Picture the density landscape again with the sea slowly falling. At a high sea level (a huge eps) only one big island shows: everything is one cluster. As the water drops (eps shrinks), the island splits into separate islands, some islands lose their beaches (points drop out as noise), and eventually everything is under water. HDBSCAN records this whole history as a tree and keeps the islands that stay distinct for the longest stretch of falling water, whatever their height. A real cluster persists over a wide range of eps; an accidental clump appears and vanishes almost at once.</p>
  <p>Four steps make this precise. We work each of them by hand on the twelve stalls with min_samples = 4 as before, plus a new setting, <strong>min_cluster_size</strong> = 3, meaning "a market needs at least 3 stalls".</p>
  <p>The first step is the <strong>core distance</strong> of each point: its distance to its k-th nearest point, counting itself, with k = min_samples. You have already computed these, because they are exactly the k-distances of section 04: D = 1.0; A, B, C, F, G, H, I = 1.414; E = 2.0; J = 2.236; K = 4.472; L = 5.831. In DBSCAN terms, a point's core distance is the smallest eps at which it would be a core point, so it is small inside crowds and large for loners.</p>
  <p>The second step changes how distance is measured so that loners are pushed away from everyone. The <strong>mutual reachability distance</strong> between a and b is</p>
  <p>d_mr(a, b) = max( core(a), core(b), d(a, b) ),</p>
  <p>the largest of the two core distances and the ordinary distance. Two points count as close only if they are close to each other <em>and</em> both live in crowded places. For points inside a crowd nothing much changes: A and B are 1 km apart, both have core distance 1.414, so d_mr(A, B) = 1.414, just raised to the crowd's own scale. For a loner it changes a lot: H and K are 3.606 km apart, but K's core distance is 4.472, so d_mr(H, K) = max(1.414, 4.472, 3.606) = 4.472. K has been pushed further away because it lives in empty space. Similarly B to E becomes 2.0 (E is on the edge) and G to L becomes 5.831. The gap between the markets, E to F at 4.243, is unchanged because it is already larger than both core distances.</p>
  <p>The third step builds the hierarchy. Connect all twelve stalls using the cheapest set of 11 links that joins everyone, with d_mr as the cost of each link. This is called a <strong>minimum spanning tree</strong> (MST). Then remove links from the most expensive downwards; each removal corresponds to eps falling below that link's length, and shows what DBSCAN would see at that eps. The code computes the core distances, the mutual reachability matrix and the MST, and then runs scikit-learn's <code>HDBSCAN</code>:</p>
  <div class="fx" data-lang="py">from scipy.sparse.csgraph import minimum_spanning_tree
k = 4                                                     # min_samples (the stall itself counts)
core_d = np.sort(D, axis=1)[:, k - 1]                     # core distance = k-distance
mr = np.maximum(np.maximum(core_d[:, None], core_d[None, :]), D)   # mutual reachability matrix
mst = minimum_spanning_tree(mr).tocoo()                   # cheapest tree linking all 12 stalls
edges = sorted(zip(mst.data, mst.row, mst.col), reverse=True)
print("MST edges, most expensive first:")
print("  " + ", ".join(f"{names[i]}-{names[j]} {w:.3f}" for w, i, j in edges))
h12 = HDBSCAN(min_cluster_size=3, min_samples=4, copy=True).fit(P)
print("labels       :", " ".join(f"{n}={v}" for n, v in zip(names, h12.labels_)))
print("probabilities:", " ".join(f"{n}={v:.3f}" for n, v in zip(names, h12.probabilities_)))</div>
  <div class="fx" data-lang="text">MST edges, most expensive first:
  F-L 5.831, F-K 4.472, E-F 4.243, G-J 2.236, B-E 2.000, F-I 1.414, F-H 1.414, F-G 1.414, A-D 1.414, A-C 1.414, A-B 1.414
labels       : A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=-1 L=-1
probabilities: A=1.000 B=1.000 C=1.000 D=1.000 E=0.707 F=1.000 G=1.000 H=1.000 I=1.000 J=0.632 K=0.000 L=0.000</div>
  <p>(When there are ties, the MST may show a different but equally cheap link, for example F–L instead of G–L, both 5.831; the hierarchy is the same.) Now remove the links in order. HDBSCAN measures "time" with λ = 1 / distance, so λ starts near 0 at a huge eps and grows as eps shrinks.</p>
  <table class="tbl">
    <tr><th>Remove link at d_mr</th><th>λ = 1/d</th><th>What happens</th></tr>
    <tr><td>5.831 (F–L)</td><td>0.171</td><td>L drops off alone. One stall is less than min_cluster_size, so this is not a new cluster: L simply leaves as noise.</td></tr>
    <tr><td>4.472 (F–K)</td><td>0.224</td><td>K drops off alone: noise.</td></tr>
    <tr><td>4.243 (E–F)</td><td>0.236</td><td>{A–E} and {F–J} separate. Both have at least 3 stalls, so this is a real split: two clusters are born.</td></tr>
    <tr><td>2.236 (G–J)</td><td>0.447</td><td>J drops off the college market; the cluster carries on as {F, G, H, I}.</td></tr>
    <tr><td>2.000 (B–E)</td><td>0.5</td><td>E drops off the station market.</td></tr>
    <tr><td>1.414 (the square links)</td><td>0.707</td><td>Both squares fall apart into single stalls; both clusters end.</td></tr>
  </table>
  <p>This is single-linkage clustering run on mutual reachability distances. The rows where one stall "drops off" show what min_cluster_size is for: a split that sheds fewer than min_cluster_size points is not treated as two clusters, only as the parent cluster getting smaller. The tree simplified in this way is called the <strong>condensed tree</strong>.</p>
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
  <p>The fourth step chooses which clusters to keep. Each cluster gets a <strong>stability</strong> score, the total lifetime of its points inside it: stability(C) = Σ (λ_p − λ_birth), summed over its points p, where λ_birth is when the cluster was born and λ_p is when point p left it. Many points staying for a long range of eps means high stability, which is the area of the shapes in the figure. For the station market, born at λ = 1/4.243 = 0.236, E leaves at 0.5 and A, B, C, D last until 0.707, so stability = (0.5 − 0.236) + 4 × (0.707 − 0.236) = 0.264 + 1.886 = 2.150. For the college market, J leaves at 0.447, so stability = 0.211 + 1.886 = 2.097. Selection then walks up the tree from the leaves: a parent cluster is kept if its own stability is larger than the total stability of its chosen children, and otherwise the children are kept instead. This rule is called <strong>excess of mass</strong>. Here neither market has child clusters, and by default the root ("everything is one cluster") is not allowed, so both markets are kept: {A–E} is cluster 0, {F–J} is cluster 1, and K and L are noise. That is the same result as DBSCAN with eps = 1.5, but found without choosing eps.</p>
  <p>HDBSCAN also gives every point a <strong>membership strength</strong> in <code>probabilities_</code>: the λ at which the point left its cluster divided by the largest λ in that cluster. E left at λ = 0.5 while its cluster lasted to 0.707, so its strength is 0.5 / 0.707 = 0.707; J's is 0.447 / 0.707 = 0.632; the square stalls are 1; noise is 0. These are exactly the probabilities printed above. DBSCAN's yes-or-no "border point" has become a number, which is useful in reports: a customer with strength 0.2 can be flagged as an uncertain member of their segment.</p>
  <p><code>min_cluster_size</code> is HDBSCAN's main knob: the smallest group you are willing to call a cluster. <code>min_samples</code> (which defaults to min_cluster_size) is the k used for core distances, and it controls how conservative the algorithm is: larger values make core distances larger, so more points end up as noise. On the three clouds of section 05:</p>
  <div class="fx" data-lang="py">for mcs, ms in [(5, None), (20, None), (60, None), (20, 5), (20, 40)]:
    h = HDBSCAN(min_cluster_size=mcs, min_samples=ms, copy=True).fit(Xv)
    l, p = h.labels_, h.probabilities_
    print(f"min_cluster_size={mcs:&lt;3} min_samples={str(ms):4s} -&gt; clusters={len(set(l) - {-1})} "
          f"noise={(l == -1).sum():3d} ARI={adjusted_rand_score(yv, l):.3f}  weak members (0&lt;p&lt;0.3)={((p &gt; 0) &amp; (p &lt; 0.3)).sum()}")</div>
  <div class="fx" data-lang="text">min_cluster_size=5   min_samples=None -&gt; clusters=4 noise= 39 ARI=0.896  weak members (0&lt;p&lt;0.3)=3
min_cluster_size=20  min_samples=None -&gt; clusters=3 noise= 30 ARI=0.913  weak members (0&lt;p&lt;0.3)=29
min_cluster_size=60  min_samples=None -&gt; clusters=3 noise= 71 ARI=0.845  weak members (0&lt;p&lt;0.3)=6
min_cluster_size=20  min_samples=5    -&gt; clusters=3 noise= 14 ARI=0.962  weak members (0&lt;p&lt;0.3)=38
min_cluster_size=20  min_samples=40   -&gt; clusters=3 noise= 52 ARI=0.875  weak members (0&lt;p&lt;0.3)=11</div>
  <p>min_cluster_size = 5 lets one small accidental clump count as a fourth cluster. 20 and 60 both find the three clouds, with 60 stricter, so more thin-edge points become noise. Keeping min_cluster_size = 20 but lowering min_samples to 5 shrinks the core distances, so only 14 rows are noise and ARI rises to 0.962; min_samples = 40 is very conservative and calls 52 rows noise. The last column counts rows that are in a cluster but only weakly (strength below 0.3), the natural "unsure" group for a business report. Other useful settings are <code>cluster_selection_method="leaf"</code> (take the leaves of the condensed tree, giving many small, tight clusters), <code>cluster_selection_epsilon</code> (merge clusters closer than this distance), and <code>allow_single_cluster=True</code> (allow the answer "it is all one group").</p>
  <p>HDBSCAN removes eps but not judgement. min_cluster_size still decides what counts as a cluster, as the fake fourth cluster shows, and a large share of noise (30–50% is common on real data) is normal behaviour rather than a bug. If every row must get a segment, assign the noise points to their nearest cluster afterwards and report them separately as low-confidence.</p>

  <h2 id="db-optics"><span class="num">07</span>OPTICS</h2>
  <p>HDBSCAN hides the density structure inside a tree. <strong>OPTICS</strong> ("Ordering Points To Identify the Clustering Structure"; Ankerst and colleagues, 1999), an older member of the same family, turns it into a single picture from which DBSCAN's answer for any eps can be read. It visits the points in a special order, always moving next to the unvisited point that is easiest to reach from the points visited so far, and for each point records how expensive that step was. The cost of reaching q from p is the <strong>reachability distance</strong>, reach(q | p) = max( core(p), d(p, q) ). It is like mutual reachability, but uses only the core distance of the point you come from.</p>
  <p>Plotting these recorded costs in visiting order gives the <strong>reachability plot</strong>. While OPTICS walks around inside a cluster, every step is cheap, so the plot stays low: clusters appear as valleys. When it has to leave a cluster and jump to the next one, the step is expensive and the plot shows a tall wall. On the twelve stalls:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import OPTICS, cluster_optics_dbscan
op = OPTICS(min_samples=4, max_eps=np.inf).fit(P)
print("order        :", "    ".join(names[i] for i in op.ordering_))
print("reachability :", " ".join(f"{op.reachability_[i]:4.2f}" for i in op.ordering_))
lab15 = cluster_optics_dbscan(reachability=op.reachability_, core_distances=op.core_distances_,
                              ordering=op.ordering_, eps=1.5)
print("cut at eps=1.5:", " ".join(f"{n}={v}" for n, v in zip(names, lab15)))</div>
  <div class="fx" data-lang="text">order        : A    B    C    D    E    F    G    H    I    J    K    L
reachability :  inf 1.41 1.41 1.41 1.00 4.24 1.41 1.41 1.41 1.41 3.61 5.00
cut at eps=1.5: A=0 B=0 C=0 D=0 E=0 F=1 G=1 H=1 I=1 J=1 K=-1 L=-1</div>
  <p>Read it as a walk. It starts at A, which has no predecessor (inf). B, C and D are each reached at 1.41, A's core distance. E is reached from D at max(1.0, 1) = 1.00. The cheapest next step is then F, at max(core(E) = 2, d(E, F) = 4.243) = 4.24: a tall wall, because we are leaving the station market. G, H and I at 1.41 form the college valley, and J is reached from I at 1.41. K is reached from H at max(1.414, 3.606) = 3.61, and L from G at max(1.414, 5) = 5.00: two more walls. Now draw a horizontal line at height eps = 1.5. Every value above the line means "something new starts here", and cutting there reproduces DBSCAN's labels for eps = 1.5 exactly. A cut at any other height gives DBSCAN at that eps, without running anything again.</p>
  <p>On the three clouds of section 05, one OPTICS run gives the plot below. Its automatic "xi" method finds valleys by the steepness of their walls (<code>xi</code> is the minimum relative drop that counts as a wall):</p>
  <div class="fx" data-lang="py">op = OPTICS(min_samples=30, xi=0.05, min_cluster_size=30).fit(Xv)
l = op.labels_
print(f"OPTICS xi=0.05: clusters={len(set(l) - {-1})} noise={(l == -1).sum()} ARI={adjusted_rand_score(yv, l):.3f}")
for e in (0.4, 1.0):
    l = cluster_optics_dbscan(reachability=op.reachability_, core_distances=op.core_distances_,
                              ordering=op.ordering_, eps=e)
    print(f"same run, cut at eps={e}: clusters={len(set(l) - {-1})} noise={(l == -1).sum()}")</div>
  <div class="fx" data-lang="text">OPTICS xi=0.05: clusters=3 noise=4 ARI=0.946
same run, cut at eps=0.4: clusters=2 noise=395
same run, cut at eps=1.0: clusters=3 noise=60</div>
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
  <p>The plot shows the varying-density problem directly: the tight cloud is a deep, narrow valley and the loose cloud a wide, shallow one, so no single horizontal cut suits all three: at 0.4 only the bottoms of the deep valleys lie below the line, leaving 2 clusters and 395 of the 700 rows as noise, while at 1.0 all three valleys appear but 60 rows on the loose cloud's slopes are still noise. The xi method looks at walls rather than one height, so it finds the three clouds (ARI 0.946). The catch is that xi is a fussy knob and OPTICS is slower than DBSCAN, so in practice HDBSCAN has largely replaced it; but the reachability plot is still the best single picture of a data set's density structure.</p>

  <h2 id="db-practice"><span class="num">08</span>DBSCAN in Practice</h2>
  <p>Using these methods on real data raises practical questions that the algorithm itself does not answer: what every parameter does, how to handle distances that are not straight lines, how to label a new point, and what the cost is. scikit-learn's DBSCAN has these parameters:</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th></tr>
    <tr><td><code>eps</code></td><td>0.5</td><td>neighbourhood radius, in feature units; the knob that matters most</td></tr>
    <tr><td><code>min_samples</code></td><td>5</td><td>points within eps (itself included) needed to be core</td></tr>
    <tr><td><code>metric</code></td><td>"euclidean"</td><td>any distance, e.g. "manhattan", "cosine", "haversine", or "precomputed" with an n × n distance matrix</td></tr>
    <tr><td><code>algorithm</code>, <code>leaf_size</code></td><td>"auto", 30</td><td>how neighbours are searched: "ball_tree", "kd_tree", "brute"</td></tr>
    <tr><td><code>n_jobs</code></td><td>None</td><td>parallel neighbour search</td></tr>
  </table>
  <p>After fitting, <code>labels_</code> holds the clusters, <code>core_sample_indices_</code> the rows that were core, and <code>components_</code> a copy of the core points themselves. <code>fit</code> also accepts <code>sample_weight</code>: a row with weight w counts as w points when testing whether a point is core, which is a compact way to say "this row stands for many identical rows".</p>
  <div class="fx" data-lang="py">db = DBSCAN(eps=0.3, min_samples=5).fit(X)
print("labels_[:8]             ", db.labels_[:8])
print("core_sample_indices_[:8]", db.core_sample_indices_[:8])
print("components_.shape       ", db.components_.shape)
w = np.ones(len(P)); w[10] = 4                 # stall K is really 4 carts parked together
print("stalls with K weighted 4:", DBSCAN(eps=1.5, min_samples=4).fit_predict(P, sample_weight=w))</div>
  <div class="fx" data-lang="text">labels_[:8]              [0 0 1 0 0 1 0 0]
core_sample_indices_[:8] [0 1 2 3 4 5 6 7]
components_.shape        (303, 2)
stalls with K weighted 4: [ 0  0  0  0  0  1  1  1  1  1  2 -1]</div>
  <p>The moons have 303 core points out of 315. In the last line, stall K has been given weight 4, as if four carts were parked at that spot. Its own count is now 4, which reaches min_samples, so K becomes core and forms a third cluster on its own.</p>
  <p>The stalls used flat-map kilometres, but real locations come as latitude and longitude, and straight-line distance on degrees is wrong because a degree of longitude shrinks towards the poles. The right distance is the great-circle or <strong>haversine</strong> distance along the Earth's surface. scikit-learn expects [latitude, longitude] in radians, and gives the distance in radians too, so eps in kilometres must be divided by the Earth's radius, 6371 km:</p>
  <div class="fx" data-lang="py">cities = {"Connaught Pl": (28.6315, 77.2167), "Karol Bagh": (28.6519, 77.1909),
          "Lajpat Nagar": (28.5677, 77.2433), "Saket": (28.5245, 77.2066),
          "Bandra": (19.0596, 72.8295), "Andheri": (19.1136, 72.8697),
          "Dadar": (19.0178, 72.8478), "Colaba": (18.9067, 72.8147),
          "Shimla": (31.1048, 77.1734)}
rad = np.radians(list(cities.values()))               # haversine wants [lat, lon] in radians
geo = DBSCAN(eps=25 / 6371.0, min_samples=3,          # eps = 25 km / Earth's radius
             metric="haversine", algorithm="ball_tree").fit_predict(rad)
print("  ".join(f"{name}={l}" for name, l in zip(cities, geo)))</div>
  <div class="fx" data-lang="text">Connaught Pl=0  Karol Bagh=0  Lajpat Nagar=0  Saket=0  Bandra=1  Andheri=1  Dadar=1  Colaba=1  Shimla=-1</div>
  <p>With eps = 25 km and min_samples = 3, the four Delhi localities form one cluster, the four Mumbai localities another, and Shimla, over 250 km from either, is noise. Notice how natural eps becomes when the distance has real units: "localities within 25 km". This is why DBSCAN is the classic tool for GPS hotspots and delivery zones. For categorical or mixed features, compute a suitable distance yourself (for example Gower distance, see <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>) and pass it with <code>metric="precomputed"</code>.</p>
  <p>DBSCAN has <code>fit_predict</code> but no <code>predict</code>, because the clusters are defined by the training points themselves rather than by a formula such as a centre. The natural way to label a new point follows the definition: it joins a cluster if it lies within eps of one of that cluster's core points (it would be a border point), and otherwise it is noise. Three new stalls open:</p>
  <div class="fx" data-lang="py">cores = P[db12.core_sample_indices_]                       # the 8 core stalls
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
  <p>(2, 3) is 1 km from core stall D, so it joins the station market; (5, 5) is 1 km from core stall F, so it joins the college market; (9, 9) is far from every core stall, so it is noise. Note that this only labels new points; it does not let a new point become core and change the clusters, which would require refitting.</p>
  <p>The cost of DBSCAN is dominated by finding neighbourhoods. With a tree index and a small eps each search is fast, roughly O(log n), so the total is about O(n log n). With a large eps, or in many dimensions where tree indexes stop helping, each search returns a big share of the data and the cost tends towards O(n²). scikit-learn also <em>stores</em> every neighbourhood, so memory grows with the number of neighbour pairs:</p>
  <div class="fx" data-lang="py">for e in (0.3, 1.0, 3.0):
    nn_e = NearestNeighbors(radius=e).fit(X)
    total = sum(len(a) for a in nn_e.radius_neighbors(X, return_distance=False))
    print(f"eps={e}: neighbour pairs stored = {total:6d}  (all pairs = {len(X)**2})")</div>
  <div class="fx" data-lang="text">eps=0.3: neighbour pairs stored =   5109  (all pairs = 99225)
eps=1.0: neighbour pairs stored =  20823  (all pairs = 99225)
eps=3.0: neighbour pairs stored =  86215  (all pairs = 99225)</div>
  <p>At eps = 3 nearly every pair is stored (86,215 of 99,225). On a million rows that would never fit in memory, so the first symptom of an eps that is too large is often a memory error rather than a bad clustering. HDBSCAN costs about O(n log n) on low-dimensional data and needs no eps.</p>
  <p>High-dimensional data needs special care. In 50 or 500 dimensions all pairwise distances become similar, an effect called distance concentration (see <a class="xref" data-note="ml_dimred">Curse of Dimensionality</a>), so a ball of radius eps contains either almost nobody or almost everybody and "density" loses its meaning. The standard recipe for text embeddings, images and similar data is to reduce dimensions first, with PCA to about 20–50 or <a class="xref" data-note="ml_umap">UMAP</a> to about 5–10, and then run HDBSCAN. UMAP followed by HDBSCAN is one of the most common pipelines for clustering documents.</p>
  <p>There is also a neat connection to hierarchical clustering that interviewers like. The DBSCAN* clusters (core points only) at radius eps are exactly the pieces you get by cutting the single-linkage tree built on mutual reachability distances at height eps. On the stalls, cutting the MST of section 06 at 1.5 leaves {A, B, C, D} and {F, G, H, I}, which are DBSCAN's core points. That is why HDBSCAN is often summarised as "single linkage on mutual reachability, plus a smart way to cut the tree".</p>
  <p>Finally, judging a DBSCAN result needs care. The popular silhouette score rewards round, compact clusters and does not know what to do with noise, so a perfect moon clustering can score lower than K-Means' wrong straight cut. Use plots, cluster profiles and, if needed, a density-based score such as DBCV (see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>

  <h2 id="db-compare"><span class="num">09</span>Choosing a Clustering Method</h2>
  <p>Within the density family the choice is usually simple. Use plain DBSCAN when eps has a real meaning, such as metres or seconds, and the clusters have similar densities: it is simple, fast and easy to explain. Use HDBSCAN as the default otherwise, especially when you have no feel for the scale or clusters have different densities; it needs no eps and gives membership strengths. Use OPTICS when you want to see the density structure or cut the same run at several eps values.</p>
  <table class="tbl">
    <tr><th></th><th>DBSCAN</th><th>HDBSCAN</th><th>OPTICS</th></tr>
    <tr><td>Main knobs</td><td>eps, min_samples</td><td>min_cluster_size (min_samples)</td><td>min_samples, xi (or a cut eps)</td></tr>
    <tr><td>Different densities</td><td>no: one eps</td><td>yes</td><td>yes (xi)</td></tr>
    <tr><td>Output</td><td>labels</td><td>labels + strengths + tree</td><td>labels + reachability plot</td></tr>
    <tr><td>Deterministic</td><td>except shared border points</td><td>yes</td><td>yes</td></tr>
    <tr><td>Speed</td><td>fast with small eps</td><td>fast</td><td>slowest</td></tr>
  </table>
  <p>Against the other clustering families, the deciding questions are the shape of the clusters, whether there is noise, whether you know k, and whether you need probabilities. <a class="xref" data-note="ml_kmeans">K-Means</a> is the right choice for round clusters of similar size, especially on millions of rows. <a class="xref" data-note="ml_gmm">Gaussian mixture models</a> are right when clusters are elliptical or overlap, because density methods need a gap of empty space between clusters and GMMs give honest probabilities where groups blur together. <a class="xref" data-note="ml_hierarchical">Hierarchical clustering</a> is right on small data when you want a full tree of groups within groups.</p>
  <table class="tbl">
    <tr><th></th><th>K-Means</th><th>Hierarchical (single link)</th><th>DBSCAN / HDBSCAN</th><th>GMM</th></tr>
    <tr><td>Needs k</td><td>yes</td><td>no (cut later)</td><td>no</td><td>yes (BIC helps)</td></tr>
    <tr><td>Cluster shape</td><td>round, similar size</td><td>any (chains)</td><td>any</td><td>ellipses</td></tr>
    <tr><td>Outliers</td><td>forced in</td><td>forced in; can chain clusters</td><td>labelled −1</td><td>low density, still assigned</td></tr>
    <tr><td>Soft membership</td><td>no</td><td>no</td><td>HDBSCAN strengths</td><td>yes, probabilities</td></tr>
    <tr><td>New points</td><td>predict</td><td>no</td><td>nearest core point</td><td>predict, predict_proba</td></tr>
    <tr><td>Typical size</td><td>millions</td><td>~10–20 thousand</td><td>~10⁵–10⁶</td><td>~10⁵</td></tr>
    <tr><td>Main weakness</td><td>shapes, outliers, k</td><td>chaining, memory</td><td>one eps (DBSCAN), high dimensions</td><td>k, local optima, Gaussian shape</td></tr>
  </table>

  <h2 id="db-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most damaging mistake is running DBSCAN on unscaled features. eps is one radius in every direction, so if one column is in rupees and another in years, the circle is effectively a thin sliver and the large-unit column alone decides who is a neighbour. Here are the moon rows again with the second column multiplied by 1000, as if it had been recorded in different units:</p>
  <div class="fx" data-lang="py">Xraw = np.vstack([Xm, junk]) * [1, 1000]          # same moons, but column 2 is now in "rupees"
for name, Z in [("raw", Xraw), ("scaled", StandardScaler().fit_transform(Xraw))]:
    l = DBSCAN(eps=0.3, min_samples=5).fit_predict(Z)
    print(f"{name:6s}: clusters={len(set(l) - {-1}):3d}  noise={(l == -1).sum()}")</div>
  <div class="fx" data-lang="text">raw   : clusters=  0  noise=315
scaled: clusters=  2  noise=11</div>
  <p>On the raw data no point has 5 neighbours within 0.3, because the second column's distances are now in the hundreds, so all 315 rows become noise. After scaling, the same eps gives the two moons. A related mistake is copying an eps from a tutorial or keeping the default of 0.5: eps means nothing outside the data it was chosen for. Choose it from a k-distance plot on your own scaled features and check a small grid around it.</p>
  <p>A second common slip is counting the noise label as a cluster. <code>labels_</code> contains −1 for noise, so the obvious way of counting clusters is off by one:</p>
  <div class="fx" data-lang="py">lab = DBSCAN(eps=1.5, min_samples=4).fit_predict(P)
print("len(set(labels))        =", len(set(lab)), "  (wrong: counts -1)")
print("len(set(labels) - {-1}) =", len(set(lab) - {-1}))</div>
  <div class="fx" data-lang="text">len(set(labels))        = 3   (wrong: counts -1)
len(set(labels) - {-1}) = 2</div>
  <p>Use <code>len(set(labels) - {-1})</code>. In the same spirit, drop the −1 rows before computing scores such as silhouette, and say that you did, because scoring only the confident points flatters the result.</p>
  <p>Beyond these, a few mistakes come from expecting too much of the method. Hunting for a "magic eps" when clusters have different densities wastes time: if the k-distance plot has several plateaus or no eps gives a stable answer, switch to HDBSCAN. Running density clustering on raw embeddings with hundreds of dimensions gives meaningless densities and slow runs; reduce dimensions first. Treating every noise point as an anomaly is wrong, because noise includes ordinary rows at the thin edges of clusters. Forgetting that scikit-learn's min_samples counts the point itself makes comparisons with other tools off by one. And a large eps on a big data set can exhaust memory before it produces any answer, so start small and increase.</p>

  <h2 id="db-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key ideas</h3>
  <ul>
    <li><b>Density-based clustering</b>: a cluster is a crowded region; clusters are separated by sparse space; lone points are <b>noise</b> (label −1). No k needed, any shape.</li>
    <li><b>eps-neighbourhood</b> N_eps(p) = all points within distance eps of p, p included.</li>
    <li><b>Core</b>: |N_eps(p)| ≥ min_samples. <b>Border</b>: not core, inside a core point's circle. <b>Noise</b>: neither.</li>
    <li><b>Directly reachable</b>: q in the circle of core point p (one-way). <b>Reachable</b>: a chain of such steps. <b>Connected</b>: both reachable from one core point. <b>Cluster</b>: a maximal connected set.</li>
    <li>Only core points spread a cluster, so stray points cannot chain two clusters together.</li>
    <li>Order dependence: only a border point within eps of two clusters' core points. <b>DBSCAN*</b> treats border points as noise.</li>
  </ul>
  <h3>Choosing knobs</h3>
  <ul>
    <li>min_samples ≥ d + 1, about 2·d, larger for noisy data. min_samples = 1 → single linkage, no noise.</li>
    <li><b>k-distance</b> = distance to the k-th nearest point, itself counted (k = min_samples). A point is core ⇔ k-distance ≤ eps.</li>
    <li>Sort k-distances; put eps at the knee; check a small grid for a stable answer. Scale features first.</li>
  </ul>
  <h3>HDBSCAN and OPTICS formulas</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Formula</th><th>Meaning</th></tr>
    <tr><td>Core distance</td><td>core_k(p) = k-distance</td><td>smallest eps at which p is core</td></tr>
    <tr><td>Mutual reachability</td><td>max(core(a), core(b), d(a, b))</td><td>pushes sparse points away</td></tr>
    <tr><td>λ</td><td>1 / distance</td><td>grows as eps shrinks</td></tr>
    <tr><td>Stability</td><td>Σ over points (λ_p − λ_birth)</td><td>total lifetime of a cluster's points</td></tr>
    <tr><td>Membership strength</td><td>λ_p / max λ in the cluster</td><td>1 = deep inside, 0 = noise</td></tr>
    <tr><td>OPTICS reachability</td><td>max(core(p), d(p, q))</td><td>cost of stepping from p to q</td></tr>
  </table>
  <p>HDBSCAN pipeline: core distances → mutual reachability → minimum spanning tree (single linkage) → condensed tree (ignore splits smaller than min_cluster_size) → keep clusters by excess of mass (stability). OPTICS: valleys of the reachability plot are clusters; a horizontal cut at eps = DBSCAN at that eps.</p>
  <h3>The stalls (eps = 1.5, min_samples = 4)</h3>
  <table class="tbl">
    <tr><th>Stall</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th><th>K</th><th>L</th></tr>
    <tr><td>count</td><td>4</td><td>5</td><td>4</td><td>5</td><td>3</td><td>4</td><td>4</td><td>4</td><td>5</td><td>2</td><td>1</td><td>1</td></tr>
    <tr><td>4-distance</td><td>1.414</td><td>1.414</td><td>1.414</td><td>1.0</td><td>2.0</td><td>1.414</td><td>1.414</td><td>1.414</td><td>1.414</td><td>2.236</td><td>4.472</td><td>5.831</td></tr>
    <tr><td>DBSCAN</td><td>0 core</td><td>0 core</td><td>0 core</td><td>0 core</td><td>0 border</td><td>1 core</td><td>1 core</td><td>1 core</td><td>1 core</td><td>1 border</td><td>−1</td><td>−1</td></tr>
    <tr><td>HDBSCAN strength</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0.707</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0.632</td><td>0</td><td>0</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.cluster import DBSCAN, HDBSCAN, OPTICS
from sklearn.neighbors import NearestNeighbors

Xs = StandardScaler().fit_transform(X)                     # always scale first
kd = NearestNeighbors(n_neighbors=5).fit(Xs).kneighbors(Xs)[0][:, -1]   # k-distances; plot sorted
db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)
db.labels_, db.core_sample_indices_                        # -1 = noise
n_clusters = len(set(db.labels_) - {-1})

h = HDBSCAN(min_cluster_size=20, min_samples=5).fit(Xs)
h.labels_, h.probabilities_                                # membership strength

DBSCAN(eps=25 / 6371, min_samples=3, metric="haversine",   # lat/lon in radians
       algorithm="ball_tree").fit(np.radians(latlon))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Scale features; eps is in feature units. Don't copy eps from elsewhere.</li>
    <li>min_samples counts the point itself in scikit-learn.</li>
    <li>−1 is noise, not a cluster: <code>len(set(labels) - {-1})</code>.</li>
    <li>One eps cannot fit several densities → HDBSCAN.</li>
    <li>Noise ≠ anomaly; no <code>predict</code> (use nearest core point within eps).</li>
    <li>High dimensions: reduce first. Huge eps: memory blows up. Silhouette is unfair to curved clusters.</li>
  </ul>

  <h2 id="db-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain DBSCAN in a few sentences.</summary><div class="qa-body">DBSCAN defines clusters as dense regions. A point is core if at least min_samples points (itself included) lie within distance eps of it. Clusters grow by chaining core points that lie in each other's eps-circles; non-core points within eps of a core point join as border points, and everything else is noise with label −1. The number of clusters comes out of the data and clusters can have any shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are core, border and noise points? Can a border point extend a cluster?</summary><div class="qa-body">Core: at least min_samples points within eps. Border: fewer than that, but inside some core point's circle. Noise: neither. A border point cannot start or extend a cluster, because reachability steps must start from a core point. That is what stops a thin line of stray points from chaining two clusters together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the advantages of DBSCAN over K-Means?</summary><div class="qa-body">It does not need k, it finds clusters of any shape (moons, rings, roads) instead of only convex ones, and it labels outliers as noise instead of forcing them into a cluster where they distort the centre. K-Means is still better for round, similar-sized clusters and for very large data, and it can predict new points directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need "density-connected" as well as "density-reachable"?</summary><div class="qa-body">Reachability is one-directional: a core point reaches a border point but not the other way round, and two border points never reach each other. Density-connected means both points are reachable from some common core point; it is symmetric, so it ties together all points of one cluster, including border points at opposite ends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose eps and min_samples?</summary><div class="qa-body">Choose min_samples first: at least d + 1, typically about 2·d, larger for noisy data. Then compute each point's distance to its min_samples-th nearest neighbour (itself counted), sort these k-distances and plot them. A point is core exactly when its k-distance ≤ eps, so put eps at the knee where the curve shoots up, then check a small grid around it for a stable answer. Scale the features first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if eps is too small or too large?</summary><div class="qa-body">Too small: few points are core, so clusters break into many fragments and most points become noise. Too large: separate clusters get bridged and merge, eventually into one cluster with no noise, and memory use can explode because every neighbourhood is stored.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is DBSCAN deterministic?</summary><div class="qa-body">Almost. Core points and noise depend only on the data. A border point within eps of core points from two different clusters goes to whichever cluster reaches it first, so its label can depend on row order. DBSCAN* removes this by treating border points as noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does DBSCAN become with min_samples = 1?</summary><div class="qa-body">Every point is core, so there is no noise, and clusters are the connected groups of the graph "points within eps of each other". That is single-linkage hierarchical clustering cut at height eps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does DBSCAN fail, and what would you use instead?</summary><div class="qa-body">With clusters of different densities, because one eps cannot fit them all: use HDBSCAN or OPTICS. In high dimensions, because distances concentrate: reduce with PCA or UMAP first. With unscaled or mixed-type features: scale or use a proper precomputed distance. With overlapping clusters that have no density gap: no density method can separate them, so consider a Gaussian mixture.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the mutual reachability distance and why does HDBSCAN use it?</summary><div class="qa-body">d_mr(a, b) = max(core(a), core(b), d(a, b)), where core is the distance to the min_samples-th nearest neighbour. It leaves distances inside dense regions roughly unchanged and pushes points in sparse regions away from everyone. Single linkage on this distance is therefore robust to noise and does not chain clusters through stray points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does HDBSCAN decide which clusters to keep?</summary><div class="qa-body">It builds a single-linkage tree on mutual reachability distances, condenses it by ignoring splits that shed fewer than min_cluster_size points, and scores each cluster's stability as the sum over its points of (λ_leave − λ_birth), with λ = 1/distance. Walking up from the leaves, a parent is kept if its stability beats the total of its selected children; otherwise the children are kept. This is called excess-of-mass selection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are HDBSCAN's main parameters?</summary><div class="qa-body">min_cluster_size is the main one: the smallest group that counts as a cluster. min_samples (default equal to min_cluster_size) sets the k for core distances and controls how conservative it is: larger means more noise. cluster_selection_method ("eom" or "leaf") and cluster_selection_epsilon fine-tune how clusters are picked from the tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>HDBSCAN labels 40% of your customers as noise. Is something wrong?</summary><div class="qa-body">Not necessarily: HDBSCAN is conservative and keeps only clearly dense groups. Check that features are scaled and dimensions reduced, lower min_samples to make it less strict, and if every customer needs a segment, assign the noise points to their nearest cluster afterwards and flag them as low-confidence using the membership strengths.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is OPTICS's reachability plot and how does it relate to DBSCAN?</summary><div class="qa-body">OPTICS visits points by always moving to the unvisited point with the smallest reachability distance max(core(p), d(p, q)), and plots those distances in visiting order. Valleys are clusters and tall walls are jumps between clusters. A horizontal cut at height eps gives the DBSCAN result for that eps, so one OPTICS run summarises DBSCAN at every eps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you assign a new point to a DBSCAN cluster?</summary><div class="qa-body">DBSCAN has no predict method because clusters are defined by the training points. Find the nearest core point; if it is within eps, give the new point that core point's cluster (it would be a border point), otherwise label it noise. A nearest-neighbour index on the core points makes this fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you cluster GPS pings of delivery drivers to find hotspots?</summary><div class="qa-body">DBSCAN or HDBSCAN with metric="haversine", inputs as [latitude, longitude] in radians, eps = desired radius in km divided by 6371, and a ball-tree index. eps then has a physical meaning ("pings within 200 m"), stray pings are dropped as noise, and hotspots of any shape, such as along a road, are found without choosing k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time and memory complexity of DBSCAN?</summary><div class="qa-body">It is dominated by neighbourhood searches. With a tree index and a small eps in low dimensions it is about O(n log n); with a large eps or high dimensions it tends to O(n²). scikit-learn stores every neighbourhood, so memory grows with the number of neighbour pairs, which approaches n² for a large eps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can silhouette prefer K-Means over a correct DBSCAN result on moon-shaped data?</summary><div class="qa-body">Silhouette compares average distances within and between clusters, so it rewards compact, round, well-separated clusters. A long curved moon has points far from many members of their own cluster and close to the other moon, so it scores low, while K-Means' straight cut makes rounder halves and can score higher while being wrong. Use plots or a density-based score such as DBCV instead.</div></details>
</main>
`
});
