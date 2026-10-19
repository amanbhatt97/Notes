// notes/ml/ml_hierarchical.js — Hierarchical Clustering
Object.assign(TOPIC_CONTENT, {
  "ml_hierarchical": `<main>
  <h1>Hierarchical Clustering</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>Hierarchical</span></div>
  <p class="lead">Hierarchical clustering does not ask for k. It builds a whole family tree of groups, from every row on its own up to one group containing everything, and lets you cut the tree at whatever level you need. This note builds it completely on one running example, five bank branches A–E on a city map: the distance matrix, the merge loop, single, complete, average and Ward linkage each computed by hand, the single update formula behind all four (Lance–Williams), the dendrogram drawn step by step and how to cut it, the chaining effect, inversions, cost and how to scale up, scipy's <code>linkage</code>/<code>fcluster</code>/<code>dendrogram</code>, sklearn's <code>AgglomerativeClustering</code>, divisive clustering, and a from-scratch version that matches scipy for every linkage.</p>

  <h2 id="hc-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="hc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="235" y="8" width="190" height="36" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="31" text-anchor="middle" font-size="12">The Idea &amp; Distances</text>
<line x1="300" y1="44" x2="95" y2="84" stroke="currentColor" marker-end="url(#hc-a0)"/><line x1="320" y1="44" x2="255" y2="84" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#hc-a0)"/><line x1="340" y1="44" x2="420" y2="84" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#hc-a0)"/><line x1="360" y1="44" x2="575" y2="84" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#hc-a0)"/>
<rect x="20" y="86" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="95" y="107" text-anchor="middle" font-size="12">K-Means</text><text x="95" y="124" text-anchor="middle" class="tm" font-size="10">needs k, flat</text>
<rect x="180" y="86" width="150" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="255" y="107" text-anchor="middle" font-size="13" font-weight="700">Hierarchical</text><text x="255" y="125" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="340" y="86" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="420" y="107" text-anchor="middle" font-size="12">DBSCAN &amp; HDBSCAN</text><text x="420" y="124" text-anchor="middle" class="tm" font-size="10">any shape, noise</text>
<rect x="510" y="86" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="107" text-anchor="middle" font-size="12">GMM</text><text x="575" y="124" text-anchor="middle" class="tm" font-size="10">soft K-Means</text>
<line x1="170" y1="111" x2="178" y2="111" stroke="currentColor" marker-end="url(#hc-a0)"/>
<line x1="330" y1="111" x2="338" y2="111" stroke="currentColor" marker-end="url(#hc-a0)"/><text x="330" y="168" text-anchor="middle" class="tm" font-size="10.5">Ward linkage shares K-Means’ objective; single linkage is a cousin of DBSCAN; HDBSCAN is a hierarchy of densities</text>
</svg><figcaption>Hierarchical clustering is the second algorithm of the group: it removes K-Means’ need to choose k first, and its single linkage leads naturally to density-based DBSCAN.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_kmeans">K-Means</a></b><span>K-Means finds k groups around centres quickly. But you must choose k before seeing any structure, the answer is one flat split with no idea how groups relate, it depends on a random start, and it needs means (so numeric data and squared Euclidean distance).</span></li>
    <li><b>This note adds: a tree of all groupings</b><span>Merge the two closest groups, again and again, recording how far apart they were. The record is a dendrogram: every k at once, deterministic, any distance (including Gower from <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>), and a choice of linkage that decides which shapes count as groups.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a></b><span>Hierarchical clustering still forces every row into a group (no noise label) and needs O(n²) memory. Single linkage's "chain neighbours together" idea, made robust with a density threshold, becomes DBSCAN; HDBSCAN is literally a hierarchy over densities. <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a> later uses the cophenetic correlation met here.</span></li>
  </ol>

  <h2 id="hc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain of questions; each concept answers the question above it, and its weakness raises the next.</p>
  <ol class="story">
    <li><b>A tree of groups</b><span>Q: K-Means needs k first; can we get the groupings for every k at once? → Yes: nested groups, from 5 single branches up to one group. But how is the tree built?</span></li>
    <li><b>Agglomerative vs divisive</b><span>Q: bottom-up or top-down? → Bottom-up (merge the closest pair) is standard; top-down (DIANA) first splits off A. But "closest" needs numbers…</span></li>
    <li><b>Distance matrix &amp; merge loop</b><span>Q: what does each merge need? → The 5 × 5 distance matrix; D and E (1.41 km) merge first. But how far is the new group {D, E} from B?</span></li>
    <li><b>Single linkage</b><span>Q: distance between groups = closest pair? → d(DE, B) = 3.16; tree heights 1.41, 3.16, 3.61, 4.47. But one close pair is enough to join two groups, so groups chain…</span></li>
    <li><b>Complete linkage</b><span>Q: what if we use the farthest pair instead? → d(DE, B) = 4.00; compact groups {B, C} and {D, E}. But one far point decides everything…</span></li>
    <li><b>Average linkage</b><span>Q: a compromise using all pairs? → d(DE, B) = 3.58. Sensible, but not tied to any objective like K-Means' inertia…</span></li>
    <li><b>Ward's method</b><span>Q: can each merge minimise within-group spread? → Merge the pair that increases WCSS least: Δ(B, DE) = 8.33 (height 4.08). Four rules now; do we need four algorithms?</span></li>
    <li><b>Lance–Williams</b><span>Q: how do we update distances after a merge, for any linkage, without going back to the points? → One formula with four coefficient sets. Now: how do we see the result?</span></li>
    <li><b>The dendrogram</b><span>Q: how do we draw and read the tree? → Merge heights on the vertical axis; cophenetic distance = height where two rows first meet. But which groups do we report?</span></li>
    <li><b>Cutting the tree</b><span>Q: how do we turn the tree into k groups? → Cut at a height, ask for k, or cut in the largest gap (complete: k = 3). But the linkages gave different trees…</span></li>
    <li><b>Chaining &amp; linkage behaviour</b><span>Q: why do linkages disagree on real data? → Single chains along a 12-point bridge (ARI 0.00), complete/average/Ward don't (0.94–0.97); centroid linkage can even invert. And for big data…</span></li>
    <li><b>Complexity &amp; scaling</b><span>Q: can it handle 1 lakh rows? → Memory grows as n²: 50,000 rows need 10 GB. Connectivity constraints and hybrids help. Then: how do we run it in scipy and sklearn, and build it ourselves?</span></li>
  </ol>

  <h2 id="hc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hierarchical Clustering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>Nested groups</b> — a tree from n singletons to 1 group; every k inside</li>
          <li><b>Agglomerative</b> (bottom-up, merge) · <b>divisive</b> (top-down, split; DIANA, bisecting K-Means)</li>
          <li>Deterministic, any distance, no k up front, no noise label</li>
          <li>💡 A family tree read upwards: siblings, cousins, the whole khandaan</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linkage (distance between groups)</div>
        <ul>
          <li><b>Single</b> = closest pair (min) — chains; d(DE,B) 3.16</li>
          <li><b>Complete</b> = farthest pair (max) — compact; 4.00</li>
          <li><b>Average</b> (UPGMA) = mean of all pairs — 3.58</li>
          <li><b>Ward</b> = increase in WCSS = (nₐn_b/(nₐ+n_b))‖cₐ − c_b‖²; height √(2Δ) — 8.33 → 4.08</li>
          <li>Centroid / median linkage can give <b>inversions</b> (2 then 1.8)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running example</div>
        <ul>
          <li>A(0,0) B(2,4) C(0,7) D(6,4) E(5,5); D–E 1.41 merges first in all four</li>
          <li>single 1.41, 3.16, 3.61, 4.47 · complete 1.41, 3.61, 6.71, 7.21</li>
          <li>average 1.41, 3.58, 5.23, 6.44 · Ward 1.41, 3.61, 6.46, 7.60</li>
          <li>k = 2: single/complete/average {A} | {BCDE}; Ward {ABC} | {DE}</li>
          <li>Σ Ward Δ = 1 + 6.5 + 20.83 + 28.87 = 57.2 = TSS</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dendrogram &amp; cutting</div>
        <ul>
          <li>Height = linkage distance at the merge; leaves = rows</li>
          <li><b>Cophenetic distance</b> = height where two rows first join; correlation with true distances 0.68 (Ward) … 0.84 (average)</li>
          <li>Cut by height (<code>criterion="distance"</code>) or by k (<code>"maxclust"</code>)</li>
          <li>Largest gap: complete 3.61 → 6.71 ⇒ k = 3 {A} {B,C} {D,E}</li>
          <li>Inconsistency coefficient = (h − mean)/std of nearby merges</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Behaviour &amp; cost</div>
        <ul>
          <li><b>Chaining</b>: blobs + 12-point bridge → single ARI 0.00; complete/average 0.97; Ward 0.94</li>
          <li>Single = great on clean moons, fragile to noise; Ward ≈ K-Means' round groups</li>
          <li>Greedy: merges are never undone</li>
          <li>Memory O(n²): 50,000 rows → 10 GB; time O(n²)–O(n³)</li>
          <li>Connectivity (k-NN graph): moons ARI 0.24 → 1.00</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Code</div>
        <ul>
          <li><code>Z = linkage(X, "ward")</code> rows: [id₁, id₂, height, size]</li>
          <li><code>fcluster(Z, t, criterion)</code> · <code>dendrogram(Z)</code> · <code>cophenet(Z, pdist(X))</code></li>
          <li><code>AgglomerativeClustering(n_clusters | distance_threshold, linkage, metric, connectivity)</code></li>
          <li><code>labels_, children_, distances_</code>; no <code>predict</code> → nearest centroid / KNN</li>
          <li><code>metric="precomputed"</code> for Gower</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="hc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="hc-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Tree of Groups</span><span class="rm-sub">Five branches on a map</span></div></div>
      <div class="rm-item rm-done" data-target="hc-two"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Agglomerative vs Divisive</span><span class="rm-sub">Merge up or split down</span></div></div>
      <div class="rm-item rm-done" data-target="hc-loop"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Distance Matrix &amp; Merge Loop</span><span class="rm-sub">The algorithm in five lines</span></div></div>
      <div class="rm-item rm-done" data-target="hc-single"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Single Linkage by Hand</span><span class="rm-sub">Closest pair</span></div></div>
      <div class="rm-item rm-done" data-target="hc-complete"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Complete &amp; Average by Hand</span><span class="rm-sub">Farthest pair, mean of pairs</span></div></div>
      <div class="rm-item rm-done" data-target="hc-ward"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Ward's Method by Hand</span><span class="rm-sub">Smallest increase in WCSS</span></div></div>
      <div class="rm-item rm-done" data-target="hc-lw"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Lance–Williams</span><span class="rm-sub">One update formula for all</span></div></div>
      <div class="rm-item rm-done" data-target="hc-dendro"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Dendrogram</span><span class="rm-sub">Reading heights, cophenetic distance</span></div></div>
      <div class="rm-item rm-done" data-target="hc-cut"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Cutting the Tree</span><span class="rm-sub">Height, k, largest gap</span></div></div>
      <div class="rm-item rm-done" data-target="hc-chain"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Chaining &amp; Linkage Behaviour</span><span class="rm-sub">Bridges, outliers, inversions</span></div></div>
      <div class="rm-item rm-done" data-target="hc-cost"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Complexity &amp; Scaling Up</span><span class="rm-sub">n² memory, connectivity, hybrids</span></div></div>
      <div class="rm-item rm-done" data-target="hc-scipy"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">scipy in Practice</span><span class="rm-sub">linkage, fcluster, dendrogram</span></div></div>
      <div class="rm-item rm-done" data-target="hc-sklearn"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">sklearn AgglomerativeClustering</span><span class="rm-sub">Parameters, attributes, new rows</span></div></div>
      <div class="rm-item rm-done" data-target="hc-scratch"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Matches scipy for all linkages</span></div></div>
      <div class="rm-item rm-done" data-target="hc-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loop, four linkages</span></div></div>
      <div class="rm-item rm-done" data-target="hc-compare"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs K-Means, DBSCAN, GMM</span></div></div>
      <div class="rm-item rm-done" data-target="hc-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="hc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="hc-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="hc-idea"><span class="num">01</span>A Tree of Groups</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>K-Means made us pick k before looking, and returned one flat answer. Real groupings are often nested: shops form neighbourhoods, neighbourhoods form zones. Can one algorithm give us every level at once?</p>
  </div>
  <h3>The running example</h3>
  <p>A bank has five branches on a city map (coordinates in km): A (0, 0), B (2, 4), C (0, 7), D (6, 4), E (5, 5). It wants to group them into service zones that share a cash van, but has not decided how many vans to buy. The answer it needs is not "the 2 zones" or "the 3 zones" but "how the zones would look for any number of vans".</p>
  <figure class="viz"><svg viewBox="0 0 330 330" width="330"><line x1="40" y1="300" x2="320" y2="300" stroke="currentColor" stroke-opacity="0.3"/><line x1="40" y1="300" x2="40" y2="22.600000000000023" stroke="currentColor" stroke-opacity="0.3"/><text x="40" y="316" text-anchor="middle" class="tm" font-size="10">0</text><text x="32" y="304" text-anchor="end" class="tm" font-size="10">0</text><text x="80" y="316" text-anchor="middle" class="tm" font-size="10">1</text><text x="32" y="266" text-anchor="end" class="tm" font-size="10">1</text><text x="120" y="316" text-anchor="middle" class="tm" font-size="10">2</text><text x="32" y="228" text-anchor="end" class="tm" font-size="10">2</text><text x="160" y="316" text-anchor="middle" class="tm" font-size="10">3</text><text x="32" y="190" text-anchor="end" class="tm" font-size="10">3</text><text x="200" y="316" text-anchor="middle" class="tm" font-size="10">4</text><text x="32" y="152" text-anchor="end" class="tm" font-size="10">4</text><text x="240" y="316" text-anchor="middle" class="tm" font-size="10">5</text><text x="32" y="114" text-anchor="end" class="tm" font-size="10">5</text><text x="280" y="316" text-anchor="middle" class="tm" font-size="10">6</text><text x="32" y="76" text-anchor="end" class="tm" font-size="10">6</text><text x="320" y="316" text-anchor="middle" class="tm" font-size="10">7</text><text x="32" y="38" text-anchor="end" class="tm" font-size="10">7</text><line x1="280.0" y1="148.0" x2="240.0" y2="110.0" class="st" stroke-dasharray="4 3"/><text x="264.0" y="125.0" class="tm" font-size="10">1.41</text><line x1="120.0" y1="148.0" x2="240.0" y2="110.0" class="st" stroke-dasharray="4 3"/><text x="184.0" y="125.0" class="tm" font-size="10">3.16</text><line x1="120.0" y1="148.0" x2="40.0" y2="34.0" class="st" stroke-dasharray="4 3"/><text x="84.0" y="87.0" class="tm" font-size="10">3.61</text><line x1="120.0" y1="148.0" x2="280.0" y2="148.0" class="st" stroke-dasharray="4 3"/><text x="204.0" y="144.0" class="tm" font-size="10">4.00</text><line x1="40.0" y1="300.0" x2="120.0" y2="148.0" class="st" stroke-dasharray="4 3"/><text x="84.0" y="220.0" class="tm" font-size="10">4.47</text><circle cx="40.0" cy="300.0" r="7" class="fb sb"/><text x="50.0" y="314.0" font-size="12" font-weight="700">A (0,0)</text><circle cx="120.0" cy="148.0" r="7" class="fb sb"/><text x="130.0" y="162.0" font-size="12" font-weight="700">B (2,4)</text><circle cx="40.0" cy="34.0" r="7" class="fb sb"/><text x="50.0" y="48.0" font-size="12" font-weight="700">C (0,7)</text><circle cx="280.0" cy="148.0" r="7" class="fb sb"/><text x="290.0" y="162.0" font-size="12" font-weight="700">D (6,4)</text><circle cx="240.0" cy="110.0" r="7" class="fb sb"/><text x="250.0" y="124.0" font-size="12" font-weight="700">E (5,5)</text><text x="180.0" y="324" text-anchor="middle" class="tm" font-size="10.5">km east →   (dashed: the five shortest distances)</text></svg><figcaption>The five branches. D and E are almost neighbours (1.41 km); A is far from everyone; B sits in the middle.</figcaption></figure>
  <h3>Nested groups</h3>
  <p>Hierarchical clustering answers with a <strong>hierarchy</strong>: a sequence of groupings where each one is made by joining two groups of the previous one. For our branches (with complete linkage, section 05) it is:</p>
  <table class="tbl">
    <tr><th>Groups (k)</th><th>Zones</th><th>Joined at distance</th></tr>
    <tr><td>5</td><td>{A} {B} {C} {D} {E}</td><td>start</td></tr>
    <tr><td>4</td><td>{A} {B} {C} {D, E}</td><td>1.41</td></tr>
    <tr><td>3</td><td>{A} {B, C} {D, E}</td><td>3.61</td></tr>
    <tr><td>2</td><td>{A} {B, C, D, E}</td><td>6.71</td></tr>
    <tr><td>1</td><td>{A, B, C, D, E}</td><td>7.21</td></tr>
  </table>
  <p>Every k is there. The bank can read off "3 vans → zones {A}, {B, C}, {D, E}" without re-running anything. Drawn as a tree with the joining distances as heights, this table is a <strong>dendrogram</strong> (section 08).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A family tree read upwards. Siblings join first, then cousins, then the whole khandaan. Cut the tree at the "cousins" level and you get a few big branches; cut lower and you get many small families. The tree holds every grouping at once.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>hierarchical clustering</strong> of n rows is a nested sequence of partitions P_n ⊃ … ⊃ P₁, where P_n has n singletons, P₁ has one group, and each P_{k−1} is obtained from P_k by merging two groups (agglomerative) or, read the other way, each P_{k+1} by splitting one group (divisive). Each merge is recorded with a height h, the linkage distance between the two merged groups.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"No k needed" does not mean "k is chosen for you". You still decide where to cut the tree (section 09); hierarchical clustering only postpones that choice until after you have seen the structure.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Agglomerative vs divisive.</b> We saw the tree, but not how it was built. Do we start from five branches and merge, or from one big group and split?</div>

  <h2 id="hc-two"><span class="num">02</span>Agglomerative vs Divisive</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A tree can be grown from the leaves up or from the root down. Which way is practical, and do they give the same tree?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Agglomerative (bottom-up)</th><th>Divisive (top-down)</th></tr>
    <tr><td>Start</td><td>n groups of one row</td><td>one group of all rows</td></tr>
    <tr><td>Step</td><td>merge the two closest groups</td><td>split one group into two</td></tr>
    <tr><td>Cost of one step</td><td>find the smallest entry in a distance table</td><td>a full clustering problem (2ⁿ⁻¹ − 1 possible splits)</td></tr>
    <tr><td>Good at</td><td>small, fine-grained groups</td><td>the big first splits</td></tr>
    <tr><td>Algorithms</td><td>single, complete, average, Ward (AGNES)</td><td>DIANA, bisecting K-Means</td></tr>
  </table>
  <h3>Divisive by hand: DIANA's first split</h3>
  <p>DIANA (DIvisive ANAlysis) starts a "splinter group" with the row that is most different on average, then moves over any row that is closer, on average, to the splinter group than to the rest. Average distance of each branch to the other four: A (4.47 + 7 + 7.21 + 7.07)/4 = 6.44; B 3.81; C 5.67; D 4.83; E 4.26. A is the most isolated, so it starts the splinter group. For each remaining branch, gain = (average distance to the rest) − (distance to A): all are negative (B −0.88, C −1.77, D −3.17, E −3.75), so nobody follows A.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from scipy.spatial.distance import pdist, squareform
names = list("ABCDE")
X = np.array([[0, 0], [2, 4], [0, 7], [6, 4], [5, 5]], dtype=float)   # five bank branches, km on a city map
D = squareform(pdist(X))                                                # full 5 x 5 Euclidean distance matrix
print(pd.DataFrame(D, index=names, columns=names).round(2))</div>
  <div class="fx" data-lang="text">      A     B     C     D     E
A  0.00  4.47  7.00  7.21  7.07
B  4.47  0.00  3.61  4.00  3.16
C  7.00  3.61  0.00  6.71  5.39
D  7.21  4.00  6.71  0.00  1.41
E  7.07  3.16  5.39  1.41  0.00</div>
  <div class="fx" data-lang="py"># DIANA's first split: start a "splinter group" with the point that is most different on average
avg = D.sum(1) / (len(X) - 1)
print("average distance to the others:", dict(zip(names, avg.round(2).tolist())))
splinter, rest = [int(avg.argmax())], [i for i in range(len(X)) if i != avg.argmax()]
while True:
    gain = [D[i, [r for r in rest if r != i]].mean() - D[i, splinter].mean() for i in rest]
    best = int(np.argmax(gain))
    print("  gain of moving", [names[r] for r in rest], "=", np.round(gain, 2).tolist())
    if gain[best] &lt;= 0: break
    splinter.append(rest.pop(best))
print("first split:", [names[i] for i in splinter], "|", [names[i] for i in rest])</div>
  <div class="fx" data-lang="text">average distance to the others: {'A': 6.44, 'B': 3.81, 'C': 5.67, 'D': 4.83, 'E': 4.26}
  gain of moving ['B', 'C', 'D', 'E'] = [-0.88, -1.77, -3.17, -3.75]
first split: ['A'] | ['B', 'C', 'D', 'E']</div>
  <p>First split: {A} | {B, C, D, E}, the same top split that single, complete and average linkage will produce from the bottom. DIANA then repeats on the bigger piece. sklearn's <code>BisectingKMeans</code> (in the <a class="xref" data-note="ml_kmeans">K-Means</a> note) is another divisive method: split with 2-means, then split the largest or loosest group again.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Agglomerative</strong> (AGNES) clustering repeatedly merges the pair of groups with the smallest linkage distance until one group remains: n − 1 merges. <strong>Divisive</strong> clustering repeatedly splits a group, usually heuristically, since the optimal 2-split is exponential to search.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The two directions do not generally give the same tree. "Hierarchical clustering" in interviews, scipy and sklearn means agglomerative unless stated otherwise; the rest of this note is agglomerative.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The merge loop.</b> Agglomerative means "merge the two closest groups". What exactly do we need to compute to find them, step after step?</div>

  <h2 id="hc-loop"><span class="num">03</span>The Distance Matrix &amp; the Merge Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To merge "the two closest", we need every pairwise distance. And after a merge, the new group needs a distance to everyone else. What does the full procedure look like?</p>
  </div>
  <h3>Step 0: the distance matrix</h3>
  <p>Euclidean distance (from <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>) between every pair of branches, by hand for a few: D–E = √((6 − 5)² + (4 − 5)²) = √2 = <strong>1.41</strong>; B–E = √(9 + 1) = √10 = 3.16; B–C = √(4 + 9) = √13 = 3.61; B–D = √(16 + 0) = 4.00; A–B = √(4 + 16) = √20 = 4.47; A–D = √(36 + 16) = √52 = 7.21. The full table is the output of <code>b01_data</code> above; it has 5 × 4 / 2 = 10 distinct numbers.</p>
  <h3>The loop</h3>
  <div class="flow"><span>Every row is its own group</span><span>Find the smallest distance in the table</span><span>Merge those two groups; record the height</span><span>Replace their rows/columns by one row for the new group</span><span>Repeat until one group</span></div>
  <p>The smallest number in our table is D–E = 1.41, so the first merge is the same for every method: {D, E} at height 1.41. Now the table must shrink from 5 × 5 to 4 × 4, and we need three new numbers: d({D,E}, A), d({D,E}, B), d({D,E}, C). Here the methods part ways: the rule that turns "distances between rows" into "distance between groups" is called the <strong>linkage</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>linkage</strong> is a function L(G, H) giving the dissimilarity between two groups of rows G and H, computed from the row-level distances d(x, y). Agglomerative clustering = merge loop + distance + linkage.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The algorithm is greedy: once D and E are merged they can never be separated again, even if a later view of the data would prefer it. An early mistake (often caused by noise) is permanent.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Single linkage.</b> How far is the group {D, E} from B? The first and simplest answer: as far as their closest pair of members.</div>

  <h2 id="hc-single"><span class="num">04</span>Single Linkage by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>B is 4.00 km from D and 3.16 km from E. Is B "4.00 from {D, E}", "3.16", or something in between?</p>
  </div>
  <p><strong>Single linkage</strong> says: the distance between two groups is the distance between their <em>closest</em> members. L(G, H) = min over x ∈ G, y ∈ H of d(x, y).</p>
  <table class="tbl"><caption>Single linkage, step by step</caption>
    <tr><th>Step</th><th>Merge</th><th>Height</th><th>New distances (min rule)</th></tr>
    <tr><td>1</td><td>D + E</td><td>1.41</td><td>d(DE, A) = min(7.21, 7.07) = 7.07; d(DE, B) = min(4.00, 3.16) = <strong>3.16</strong>; d(DE, C) = min(6.71, 5.39) = 5.39</td></tr>
    <tr><td>2</td><td>{D,E} + B (3.16 &lt; B–C 3.61)</td><td>3.16</td><td>d(BDE, A) = min(4.47, 7.07) = 4.47; d(BDE, C) = min(3.61, 5.39) = <strong>3.61</strong></td></tr>
    <tr><td>3</td><td>{B,D,E} + C</td><td>3.61</td><td>d(BCDE, A) = min(4.47, 7.00) = 4.47</td></tr>
    <tr><td>4</td><td>{B,C,D,E} + A</td><td>4.47</td><td>—</td></tr>
  </table>
  <p>Look at the shape of the story: one group grows by swallowing one branch at a time (D–E, then B, then C, then A). That is <strong>chaining</strong>: B is close to E, C is close to B, so C joins a group whose far member D is 6.71 km away. Section 10 shows how badly this can go.</p>
  <div class="fx" data-lang="py">def agglomerate(D, names, linkage, verbose=True):
    """Naive agglomerative clustering on a distance matrix; prints every merge and the updated matrix."""
    clusters = {n: [n] for n in names}
    d = {(a, b): D[i, j] for i, a in enumerate(names) for j, b in enumerate(names) if i &lt; j}
    get = lambda a, b: d[(a, b)] if (a, b) in d else d[(b, a)]
    merges = []
    while len(clusters) &gt; 1:
        a, b = min(d, key=d.get)                                   # closest pair of clusters
        h = d[(a, b)]
        new = "".join(sorted(a + b))
        na, nb = len(clusters[a]), len(clusters[b])
        rest = [c for c in clusters if c not in (a, b)]
        for c in rest:                                             # distance from the new cluster to every other
            dac, dbc = get(a, c), get(b, c)
            if linkage == "single":   v = min(dac, dbc)
            if linkage == "complete": v = max(dac, dbc)
            if linkage == "average":  v = (na * dac + nb * dbc) / (na + nb)
            d[(new, c)] = v
        d = {k: v for k, v in d.items() if a not in k and b not in k}
        clusters[new] = clusters.pop(a) + clusters.pop(b)
        merges.append((new, round(h, 3)))
        if verbose:
            print(f"merge {a} + {b} at {h:.3f}  -&gt;  " +
                  ", ".join(f"d({k[0]},{k[1]})={v:.2f}" for k, v in sorted(d.items())))
    return merges

for link in ["single", "complete", "average"]:
    print(f"--- {link} linkage"); agglomerate(D, names, link)</div>
  <div class="fx" data-lang="text">--- single linkage
merge D + E at 1.414  -&gt;  d(A,B)=4.47, d(A,C)=7.00, d(B,C)=3.61, d(DE,A)=7.07, d(DE,B)=3.16, d(DE,C)=5.39
merge DE + B at 3.162  -&gt;  d(A,C)=7.00, d(BDE,A)=4.47, d(BDE,C)=3.61
merge BDE + C at 3.606  -&gt;  d(BCDE,A)=4.47
merge BCDE + A at 4.472  -&gt;  
--- complete linkage
merge D + E at 1.414  -&gt;  d(A,B)=4.47, d(A,C)=7.00, d(B,C)=3.61, d(DE,A)=7.21, d(DE,B)=4.00, d(DE,C)=6.71
merge B + C at 3.606  -&gt;  d(BC,A)=7.00, d(BC,DE)=6.71, d(DE,A)=7.21
merge BC + DE at 6.708  -&gt;  d(BCDE,A)=7.21
merge BCDE + A at 7.211  -&gt;  
--- average linkage
merge D + E at 1.414  -&gt;  d(A,B)=4.47, d(A,C)=7.00, d(B,C)=3.61, d(DE,A)=7.14, d(DE,B)=3.58, d(DE,C)=6.05
merge DE + B at 3.581  -&gt;  d(A,C)=7.00, d(BDE,A)=6.25, d(BDE,C)=5.23
merge BDE + C at 5.233  -&gt;  d(BCDE,A)=6.44
merge BCDE + A at 6.439  -&gt;  </div>
  <p>The single-linkage block of the output repeats the table exactly (the other two blocks are the next section). The function <code>agglomerate</code> is a literal translation of the merge loop: find the smallest entry, merge, compute new distances with the linkage rule, delete the old rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two colonies count as "near" if any one house in the first is near any one house in the second. A single shared wall joins two colonies, even if most houses are far apart.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Single linkage</strong> (nearest neighbour): L(G, H) = min_{x∈G, y∈H} d(x, y). Its tree is exactly the minimum spanning tree of the rows (cut the longest edges to get groups), so it can follow arbitrary chain-like shapes; the fast SLINK algorithm computes it in O(n²) time and O(n) memory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One noisy row lying between two real groups is enough to join them at a low height. Single linkage is excellent on clean, well-separated curved shapes and terrible with noise.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Complete and average linkage.</b> Single linkage let a group grow long and thin. What if a group's distance were decided by its farthest members, or by all members?</div>

  <h2 id="hc-complete"><span class="num">05</span>Complete &amp; Average Linkage by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Single linkage looked only at the closest pair and chained. What happens if we look at the farthest pair, or average over all pairs, using the same five branches?</p>
  </div>
  <h3>Complete linkage: the farthest pair</h3>
  <p>L(G, H) = max over x ∈ G, y ∈ H of d(x, y): two groups are only as close as their most distant members. A group can only be joined when <em>everything</em> in it is close.</p>
  <table class="tbl"><caption>Complete linkage, step by step</caption>
    <tr><th>Step</th><th>Merge</th><th>Height</th><th>New distances (max rule)</th></tr>
    <tr><td>1</td><td>D + E</td><td>1.41</td><td>d(DE, A) = max(7.21, 7.07) = 7.21; d(DE, B) = max(4.00, 3.16) = <strong>4.00</strong>; d(DE, C) = max(6.71, 5.39) = 6.71</td></tr>
    <tr><td>2</td><td>B + C (3.61 &lt; d(DE, B) 4.00)</td><td>3.61</td><td>d(BC, A) = max(4.47, 7.00) = 7.00; d(BC, DE) = max(4.00, 6.71) = <strong>6.71</strong></td></tr>
    <tr><td>3</td><td>{B,C} + {D,E}</td><td>6.71</td><td>d(BCDE, A) = max(7.00, 7.21) = 7.21</td></tr>
    <tr><td>4</td><td>{B,C,D,E} + A</td><td>7.21</td><td>—</td></tr>
  </table>
  <p>The second step differs from single linkage: under the max rule, B is 4.00 from {D, E}, so B prefers C (3.61). We get two compact pairs, {B, C} and {D, E}, and a big jump in height to join them (6.71).</p>
  <h3>Average linkage (UPGMA): the mean of all pairs</h3>
  <p>L(G, H) = average of d(x, y) over all |G| × |H| pairs. When groups of sizes nᵢ and nⱼ merge, the new distance to a third group k is the size-weighted average (nᵢ d(i, k) + nⱼ d(j, k))/(nᵢ + nⱼ).</p>
  <table class="tbl"><caption>Average linkage, step by step</caption>
    <tr><th>Step</th><th>Merge</th><th>Height</th><th>New distances (weighted mean)</th></tr>
    <tr><td>1</td><td>D + E</td><td>1.41</td><td>d(DE, A) = (7.21 + 7.07)/2 = 7.14; d(DE, B) = (4.00 + 3.16)/2 = <strong>3.58</strong>; d(DE, C) = (6.71 + 5.39)/2 = 6.05</td></tr>
    <tr><td>2</td><td>{D,E} + B (3.58 &lt; B–C 3.61, just)</td><td>3.58</td><td>d(BDE, A) = (2 × 7.14 + 4.47)/3 = 6.25; d(BDE, C) = (2 × 6.05 + 3.61)/3 = <strong>5.23</strong></td></tr>
    <tr><td>3</td><td>{B,D,E} + C</td><td>5.23</td><td>d(BCDE, A) = (3 × 6.25 + 7.00)/4 = 6.44</td></tr>
    <tr><td>4</td><td>{B,C,D,E} + A</td><td>6.44</td><td>—</td></tr>
  </table>
  <p>Average linkage sits between the two: its merge <em>order</em> here matches single linkage (B joins {D, E} by a whisker, 3.58 vs 3.61), but its <em>heights</em> (5.23, 6.44) are much larger, closer to complete linkage. The second and third blocks of the <code>b02_steps</code> output above print exactly these two tables.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Complete linkage</strong> (farthest neighbour): L(G, H) = max d(x, y); tends to give compact groups of similar diameter. <strong>Average linkage</strong> (UPGMA, unweighted pair group method with arithmetic mean): L(G, H) = (1/(|G||H|)) Σ_{x∈G} Σ_{y∈H} d(x, y). <strong>Weighted</strong> (WPGMA) averages the two old distances without size weights.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Complete linkage is sensitive to outliers in the other direction: one far-away member makes its whole group "far" from everything, delaying sensible merges. And it tends to break large genuine groups into pieces of similar diameter.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Ward's method.</b> Min, max and mean are reasonable rules, but none is tied to a goal like K-Means' "small within-group spread". Can each merge be chosen to keep groups as tight as possible?</div>

  <h2 id="hc-ward"><span class="num">06</span>Ward's Method by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>K-Means minimises within-cluster sum of squares (WCSS) for one k. Could a merge loop pursue the same goal, one merge at a time?</p>
  </div>
  <h3>The rule</h3>
  <p>Ward (1963): merge the two groups whose union <strong>increases WCSS the least</strong>. That increase has a closed form, using only the sizes and centroids (means) of the two groups:</p>
  <p style="text-align:center"><strong>Δ(G, H) = (n_G · n_H / (n_G + n_H)) · ‖c_G − c_H‖²</strong></p>
  <p>Big groups and distant centroids make Δ large. scipy reports the height √(2Δ), which for two single rows equals their ordinary distance (Δ = ½d², so √(2Δ) = d).</p>
  <h3>By hand on the branches</h3>
  <table class="tbl">
    <tr><th>Candidate merge</th><th>sizes</th><th>centroids</th><th>‖c_G − c_H‖²</th><th>Δ</th><th>height √(2Δ)</th></tr>
    <tr><td>D + E</td><td>1, 1</td><td>(6, 4), (5, 5)</td><td>2</td><td>½ × 2 = <strong>1.00</strong></td><td>1.414</td></tr>
    <tr><td>B + C</td><td>1, 1</td><td>(2, 4), (0, 7)</td><td>13</td><td>½ × 13 = 6.50</td><td>3.606</td></tr>
    <tr><td>B + {D,E}</td><td>1, 2</td><td>(2, 4), (5.5, 4.5)</td><td>12.25 + 0.25 = 12.5</td><td>⅔ × 12.5 = 8.33</td><td>4.082</td></tr>
    <tr><td>A + B</td><td>1, 1</td><td>(0, 0), (2, 4)</td><td>20</td><td>10.00</td><td>4.472</td></tr>
  </table>
  <p>Step 1 merges D + E (Δ = 1). Step 2: the cheapest is now B + C (6.50) rather than B + {D,E} (8.33): Ward, like complete linkage, makes the pair {B, C}. Step 3, three groups {A}, {B,C} with centroid (1, 5.5), {D,E} with centroid (5.5, 4.5):</p>
  <table class="tbl">
    <tr><th>Candidate</th><th>Δ</th><th>height</th></tr>
    <tr><td>A + {B,C}</td><td>(1·2/3) × (1 + 30.25) = 20.83</td><td><strong>6.455</strong></td></tr>
    <tr><td>{B,C} + {D,E}</td><td>(2·2/4) × (20.25 + 1) = 21.25</td><td>6.519</td></tr>
    <tr><td>A + {D,E}</td><td>(1·2/3) × (30.25 + 20.25) = 33.67</td><td>8.206</td></tr>
  </table>
  <p>A joins {B, C} (20.83, narrowly beating 21.25). Step 4: {A,B,C} with centroid (0.667, 3.667) joins {D,E}: Δ = (3·2/5) × (4.833² + 0.833²) = 1.2 × 24.06 = 28.87, height 7.598. So Ward's 2-group answer is {A, B, C} | {D, E}, different from all three earlier linkages, which isolated A.</p>
  <p>A neat check: the Δs add up to the total sum of squares. 1 + 6.5 + 20.83 + 28.87 = 57.2, and TSS around the grand mean (2.6, 4) is 22.76 + 0.36 + 15.76 + 11.56 + 6.76 = 57.2. Every merge spends some of the TSS; Ward spends it as slowly as possible.</p>
  <div class="fx" data-lang="py">def ward_cost(P, Q):                                   # increase in WCSS if groups P and Q merge
    p, q = X[[names.index(c) for c in P]], X[[names.index(c) for c in Q]]
    return len(p) * len(q) / (len(p) + len(q)) * ((p.mean(0) - q.mean(0)) ** 2).sum()
for P_, Q_ in [("D", "E"), ("B", "C"), ("B", "DE"), ("A", "B"), ("A", "BC"), ("BC", "DE"), ("A", "DE"), ("ABC", "DE")]:
    dw = ward_cost(P_, Q_)
    print(f"Delta({P_},{Q_}) = {dw:7.3f}   scipy height sqrt(2*Delta) = {np.sqrt(2 * dw):.3f}")</div>
  <div class="fx" data-lang="text">Delta(D,E) =   1.000   scipy height sqrt(2*Delta) = 1.414
Delta(B,C) =   6.500   scipy height sqrt(2*Delta) = 3.606
Delta(B,DE) =   8.333   scipy height sqrt(2*Delta) = 4.082
Delta(A,B) =  10.000   scipy height sqrt(2*Delta) = 4.472
Delta(A,BC) =  20.833   scipy height sqrt(2*Delta) = 6.455
Delta(BC,DE) =  21.250   scipy height sqrt(2*Delta) = 6.519
Delta(A,DE) =  33.667   scipy height sqrt(2*Delta) = 8.206
Delta(ABC,DE) =  28.867   scipy height sqrt(2*Delta) = 7.598</div>
  <p>And scipy agrees on the whole tree for all four linkages:</p>
  <div class="fx" data-lang="py">from scipy.cluster.hierarchy import linkage, fcluster
for method in ["single", "complete", "average", "ward"]:
    Z = linkage(X, method=method)
    print(f"--- {method}")
    for a, b, h, n in Z:
        print(f"  merge {int(a)} + {int(b)}  height {h:.3f}  size {int(n)}")</div>
  <div class="fx" data-lang="text">--- single
  merge 3 + 4  height 1.414  size 2
  merge 1 + 5  height 3.162  size 3
  merge 2 + 6  height 3.606  size 4
  merge 0 + 7  height 4.472  size 5
--- complete
  merge 3 + 4  height 1.414  size 2
  merge 1 + 2  height 3.606  size 2
  merge 5 + 6  height 6.708  size 4
  merge 0 + 7  height 7.211  size 5
--- average
  merge 3 + 4  height 1.414  size 2
  merge 1 + 5  height 3.581  size 3
  merge 2 + 6  height 5.233  size 4
  merge 0 + 7  height 6.439  size 5
--- ward
  merge 3 + 4  height 1.414  size 2
  merge 1 + 2  height 3.606  size 2
  merge 0 + 6  height 6.455  size 3
  merge 5 + 7  height 7.598  size 5</div>
  <p>In scipy's output, ids 0–4 are A–E and each merge creates a new id from 5 upward (5 = first merge, 6 = second, …). Ward: 3 + 4 (D, E) → id 5; 1 + 2 (B, C) → id 6; 0 + 6 (A joins B, C) at 6.455 → id 7; 5 + 7 at 7.598.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ward linkage</strong> merges the pair minimising ΔWCSS = (n_G n_H/(n_G + n_H))‖c_G − c_H‖² (squared Euclidean distance between centroids, so Euclidean data only). It is the greedy, merge-by-merge version of the <a class="xref" data-note="ml_kmeans">K-Means</a> objective, and like K-Means it prefers compact, similar-sized, round groups. It is sklearn's default linkage.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ward requires Euclidean distance on raw coordinates (it needs centroids). Passing a precomputed Gower or cosine matrix to Ward is invalid; sklearn refuses <code>metric</code> other than Euclidean for <code>linkage="ward"</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Lance–Williams.</b> We have four rules, each with its own update. Do we really need four algorithms, or is there one formula that updates the distance table for all of them?</div>

  <h2 id="hc-lw"><span class="num">07</span>One Update Formula: Lance–Williams</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>After merging groups i and j, we need d(i ∪ j, k) for every other group k. Can we get it from the three numbers already in the table, d(i, k), d(j, k) and d(i, j), without going back to the raw rows?</p>
  </div>
  <p>Lance and Williams (1967) showed that all the common linkages fit one formula:</p>
  <p style="text-align:center"><strong>d(i∪j, k) = αᵢ d(i, k) + αⱼ d(j, k) + β d(i, j) + γ |d(i, k) − d(j, k)|</strong></p>
  <table class="tbl">
    <tr><th>Linkage</th><th>αᵢ</th><th>αⱼ</th><th>β</th><th>γ</th><th>Why it works</th></tr>
    <tr><td>Single</td><td>½</td><td>½</td><td>0</td><td>−½</td><td>½(a + b) − ½|a − b| = min(a, b)</td></tr>
    <tr><td>Complete</td><td>½</td><td>½</td><td>0</td><td>+½</td><td>½(a + b) + ½|a − b| = max(a, b)</td></tr>
    <tr><td>Average</td><td>nᵢ/(nᵢ+nⱼ)</td><td>nⱼ/(nᵢ+nⱼ)</td><td>0</td><td>0</td><td>size-weighted mean</td></tr>
    <tr><td>Ward (on squared distances)</td><td>(nᵢ+n_k)/N</td><td>(nⱼ+n_k)/N</td><td>−n_k/N</td><td>0</td><td>N = nᵢ + nⱼ + n_k</td></tr>
    <tr><td>Centroid (squared)</td><td>nᵢ/(nᵢ+nⱼ)</td><td>nⱼ/(nᵢ+nⱼ)</td><td>−nᵢnⱼ/(nᵢ+nⱼ)²</td><td>0</td><td>distance between centroids</td></tr>
  </table>
  <p>Check single linkage on our first update: d(DE, B) = ½ × 4.00 + ½ × 3.16 − ½ × |4.00 − 3.16| = 3.58 − 0.42 = 3.16. ✓ Complete: 3.58 + 0.42 = 4.00. ✓ Ward on squared distances, i = D, j = E, k = B (all size 1, N = 3): d²(DE, B) = (2/3) × 16 + (2/3) × 10 − (1/3) × 2 = 10.67 + 6.67 − 0.67 = 16.67, so height √16.67 = 4.08. ✓ (that is the √(2Δ) = √(2 × 8.33) from section 06).</p>
  <p>This is why one program can offer every linkage: the merge loop stays the same, only four coefficients change. Section 14 implements exactly this and matches scipy.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>Lance–Williams recurrence</strong> expresses the dissimilarity between a newly merged group and any other group as a linear combination of existing dissimilarities. Any linkage expressible this way can be computed in O(n²) memory from the distance matrix alone.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ward and centroid coefficients work on <em>squared</em> Euclidean distances. Applying them to plain distances gives wrong heights. scipy handles this internally when you pass raw coordinates.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The dendrogram.</b> Each linkage produced a list of merges and heights. How do we draw that list as a picture, and what can we read from it?</div>

  <h2 id="hc-dendro"><span class="num">08</span>The Dendrogram</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Four lists of merges are hard to compare by reading numbers. How do we draw a merge history so that groups, their tightness and the right cut jump out?</p>
  </div>
  <h3>Building one step by step</h3>
  <p>Put the rows along the bottom. For each merge, draw a "∩" connecting the two groups, with its top bar at the merge height. Complete linkage: D–E bar at 1.41; B–C bar at 3.61; a bar at 6.71 joining the {B, C} and {D, E} bars; finally a bar at 7.21 joining A. The leaves are ordered so that no lines cross.</p>
  <figure class="viz"><svg viewBox="0 0 680 230" width="680"><text x="97.5" y="14" text-anchor="middle" font-size="12" font-weight="700">single</text><line x1="28" y1="28" x2="28" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="24" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="24" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="24" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="24" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="24" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="124,190 124,161 153,161 153,190" fill="none" class="sb" stroke-width="2"/><text x="139" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="96,190 96,126 139,126 139,161" fill="none" class="sb" stroke-width="2"/><text x="117" y="122" text-anchor="middle" font-size="9.5" class="tm">3.16</text><polyline points="67,190 67,117 117,117 117,126" fill="none" class="sb" stroke-width="2"/><text x="92" y="113" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="38,190 38,99 92,99 92,117" fill="none" class="sb" stroke-width="2"/><text x="65" y="95" text-anchor="middle" font-size="9.5" class="tm">4.47</text><text x="38" y="204" text-anchor="middle" font-size="11.5">A</text><text x="67" y="204" text-anchor="middle" font-size="11.5">C</text><text x="96" y="204" text-anchor="middle" font-size="11.5">B</text><text x="124" y="204" text-anchor="middle" font-size="11.5">D</text><text x="153" y="204" text-anchor="middle" font-size="11.5">E</text><text x="262.5" y="14" text-anchor="middle" font-size="12" font-weight="700">complete</text><line x1="193" y1="28" x2="193" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="189" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="189" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="189" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="189" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="189" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="232,190 232,161 260,161 260,190" fill="none" class="sb" stroke-width="2"/><text x="246" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="289,190 289,117 318,117 318,190" fill="none" class="sb" stroke-width="2"/><text x="304" y="113" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="246,161 246,54 304,54 304,117" fill="none" class="sb" stroke-width="2"/><text x="275" y="50" text-anchor="middle" font-size="9.5" class="tm">6.71</text><polyline points="203,190 203,44 275,44 275,54" fill="none" class="sb" stroke-width="2"/><text x="239" y="40" text-anchor="middle" font-size="9.5" class="tm">7.21</text><text x="203" y="204" text-anchor="middle" font-size="11.5">A</text><text x="232" y="204" text-anchor="middle" font-size="11.5">D</text><text x="260" y="204" text-anchor="middle" font-size="11.5">E</text><text x="289" y="204" text-anchor="middle" font-size="11.5">B</text><text x="318" y="204" text-anchor="middle" font-size="11.5">C</text><text x="427.5" y="14" text-anchor="middle" font-size="12" font-weight="700">average</text><line x1="358" y1="28" x2="358" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="354" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="354" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="354" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="354" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="354" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="454,190 454,161 483,161 483,190" fill="none" class="sb" stroke-width="2"/><text x="469" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="426,190 426,117 469,117 469,161" fill="none" class="sb" stroke-width="2"/><text x="447" y="113" text-anchor="middle" font-size="9.5" class="tm">3.58</text><polyline points="397,190 397,84 447,84 447,117" fill="none" class="sb" stroke-width="2"/><text x="422" y="80" text-anchor="middle" font-size="9.5" class="tm">5.23</text><polyline points="368,190 368,60 422,60 422,84" fill="none" class="sb" stroke-width="2"/><text x="395" y="56" text-anchor="middle" font-size="9.5" class="tm">6.44</text><text x="368" y="204" text-anchor="middle" font-size="11.5">A</text><text x="397" y="204" text-anchor="middle" font-size="11.5">C</text><text x="426" y="204" text-anchor="middle" font-size="11.5">B</text><text x="454" y="204" text-anchor="middle" font-size="11.5">D</text><text x="483" y="204" text-anchor="middle" font-size="11.5">E</text><text x="592.5" y="14" text-anchor="middle" font-size="12" font-weight="700">ward</text><line x1="523" y1="28" x2="523" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="519" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="519" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="519" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="519" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="519" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="533,190 533,161 562,161 562,190" fill="none" class="sb" stroke-width="2"/><text x="547" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="619,190 619,117 648,117 648,190" fill="none" class="sb" stroke-width="2"/><text x="634" y="113" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="590,190 590,59 634,59 634,117" fill="none" class="sb" stroke-width="2"/><text x="612" y="55" text-anchor="middle" font-size="9.5" class="tm">6.45</text><polyline points="547,161 547,36 612,36 612,59" fill="none" class="sb" stroke-width="2"/><text x="580" y="32" text-anchor="middle" font-size="9.5" class="tm">7.60</text><text x="533" y="204" text-anchor="middle" font-size="11.5">D</text><text x="562" y="204" text-anchor="middle" font-size="11.5">E</text><text x="590" y="204" text-anchor="middle" font-size="11.5">A</text><text x="619" y="204" text-anchor="middle" font-size="11.5">B</text><text x="648" y="204" text-anchor="middle" font-size="11.5">C</text></svg><figcaption>The same five branches under four linkages (height = merge distance, km for single/complete/average, √(2Δ) for Ward). Single and average chain B, then C, then A onto {D, E}; complete makes {B, C} and {D, E} and isolates A; Ward groups A with {B, C}.</figcaption></figure>
  <h3>How to read it</h3>
  <ul>
    <li><strong>Height of a bar</strong> = how far apart the two groups were when they merged. Low bars: tight groups. A tall bar: two genuinely different groups.</li>
    <li><strong>Long vertical stretches with no bars</strong> = a range of cut heights where the grouping does not change: a stable, natural k.</li>
    <li><strong>Horizontal order of leaves</strong> is partly arbitrary: each ∩ can be flipped. Two leaves drawn side by side are not necessarily similar; only the height where they join matters.</li>
  </ul>
  <h3>Cophenetic distance and correlation</h3>
  <p>The <strong>cophenetic distance</strong> between two rows is the height at which they first end up in the same group. Under complete linkage, coph(B, C) = 3.61 (their own merge), and coph(A, B) = 7.21 (they only meet at the root), though their real distance is 4.47. The <strong>cophenetic correlation</strong> is the correlation between the 10 real distances and the 10 cophenetic distances: how faithfully the tree preserves the original distances.</p>
  <div class="fx" data-lang="py">from scipy.cluster.hierarchy import dendrogram, cophenet
for method in ["single", "complete", "average", "ward"]:
    Z = linkage(X, method=method)
    leaves = dendrogram(Z, no_plot=True, labels=names)["ivl"]       # left-to-right leaf order
    c, coph = cophenet(Z, pdist(X))                                 # correlation, cophenetic distances
    print(f"{method:9s} leaf order {''.join(leaves)}   cophenetic corr {c:.3f}   "
          f"coph(A,B)={squareform(coph)[0, 1]:.3f}  coph(B,C)={squareform(coph)[1, 2]:.3f}")</div>
  <div class="fx" data-lang="text">single    leaf order ACBDE   cophenetic corr 0.825   coph(A,B)=4.472  coph(B,C)=3.606
complete  leaf order ADEBC   cophenetic corr 0.746   coph(A,B)=7.211  coph(B,C)=3.606
average   leaf order ACBDE   cophenetic corr 0.842   coph(A,B)=6.439  coph(B,C)=5.233
ward      leaf order DEABC   cophenetic corr 0.680   coph(A,B)=6.455  coph(B,C)=3.606</div>
  <p>Average linkage preserves our distances best (0.842), then single (0.825), complete (0.746) and Ward (0.680). That is typical: average linkage tends to maximise cophenetic correlation, while Ward sacrifices faithfulness for compact groups. Note coph(A, B): 4.47 under single (A joins last but at a low height), 7.21 under complete.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>dendrogram</strong> is a rooted binary tree with n leaves and n − 1 internal nodes, each internal node drawn at its merge height. The <strong>cophenetic distance</strong> c(x, y) is the height of the lowest node containing both x and y; it is an ultrametric (c(x, z) ≤ max(c(x, y), c(y, z))). The <strong>cophenetic correlation coefficient</strong> is the Pearson correlation between {d(x, y)} and {c(x, y)} over all pairs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not read similarity from leaf adjacency. In the complete-linkage tree, A is drawn next to D and E but is the farthest branch from them; only the joining height tells you that.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cutting the tree.</b> The bank still needs an actual list of zones. Where do we cut, and how do we choose?</div>

  <h2 id="hc-cut"><span class="num">09</span>Cutting the Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The tree contains every k. How do we pick one level, either because the bank has a budget (k vans) or because we want the data to tell us?</p>
  </div>
  <h3>Three ways to cut</h3>
  <ul>
    <li><strong>By number of groups</strong>: "give me k" — cut just below the (n − k + 1)-th merge.</li>
    <li><strong>By height</strong>: "no zone may be wider than t km" — every merge above t is undone. A horizontal line at t; the number of vertical lines it crosses is k.</li>
    <li><strong>By the largest gap</strong>: cut in the longest vertical stretch with no merges, the most stable k.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 280 260" width="280"><text x="145.0" y="14" text-anchor="middle" font-size="12" font-weight="700">complete</text><line x1="28" y1="28" x2="28" y2="220" stroke="currentColor" stroke-opacity="0.3"/><text x="24" y="224" text-anchor="end" class="tm" font-size="9">0</text><text x="24" y="176" text-anchor="end" class="tm" font-size="9">2</text><text x="24" y="128" text-anchor="end" class="tm" font-size="9">4</text><text x="24" y="80" text-anchor="end" class="tm" font-size="9">6</text><text x="24" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="90,220 90,186 143,186 143,220" fill="none" class="sb" stroke-width="2"/><text x="117" y="182" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="196,220 196,133 248,133 248,220" fill="none" class="sb" stroke-width="2"/><text x="222" y="129" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="117,186 117,59 222,59 222,133" fill="none" class="sb" stroke-width="2"/><text x="169" y="55" text-anchor="middle" font-size="9.5" class="tm">6.71</text><polyline points="38,220 38,47 169,47 169,59" fill="none" class="sb" stroke-width="2"/><text x="104" y="43" text-anchor="middle" font-size="9.5" class="tm">7.21</text><text x="38" y="234" text-anchor="middle" font-size="11.5">A</text><text x="90" y="234" text-anchor="middle" font-size="11.5">D</text><text x="143" y="234" text-anchor="middle" font-size="11.5">E</text><text x="196" y="234" text-anchor="middle" font-size="11.5">B</text><text x="248" y="234" text-anchor="middle" font-size="11.5">C</text><line x1="28" y1="100" x2="268" y2="100" class="sr" stroke-width="1.5" stroke-dasharray="5 3"/><text x="266" y="96" text-anchor="end" class="tr" font-size="9.5">cut 5.0</text></svg><figcaption>Complete linkage cut at height 5.0 km. The red line crosses three vertical lines: zones {A}, {B, C}, {D, E}.</figcaption></figure>
  <p>By hand with complete linkage: heights 1.41, 3.61, 6.71, 7.21. Gaps between successive merges: 2.19, <strong>3.10</strong>, 0.50. The largest gap is between 3.61 and 6.71, after the 2nd merge, leaving 5 − 2 = <strong>3 groups</strong>. Any height from 3.61 to 6.71 gives the same answer; 5.0 is in the middle.</p>
  <div class="fx" data-lang="py">Zc = linkage(X, method="complete")
for k in [2, 3, 4]:
    print(f"complete, maxclust k={k}:", dict(zip(names, fcluster(Zc, k, criterion="maxclust").tolist())))
for t in [2.0, 5.0, 7.0]:
    print(f"complete, cut at height {t}:", dict(zip(names, fcluster(Zc, t, criterion="distance").tolist())))
h = Zc[:, 2]
gaps = np.diff(h)
print("merge heights", h.round(3), " gaps", gaps.round(3), " largest gap after merge", gaps.argmax() + 1,
      "-&gt; k =", len(X) - (gaps.argmax() + 1))
from scipy.cluster.hierarchy import inconsistent
print("inconsistency (mean, std, count, coefficient) per merge:\\n", inconsistent(Zc, d=2).round(3))</div>
  <div class="fx" data-lang="text">complete, maxclust k=2: {'A': 2, 'B': 1, 'C': 1, 'D': 1, 'E': 1}
complete, maxclust k=3: {'A': 3, 'B': 2, 'C': 2, 'D': 1, 'E': 1}
complete, maxclust k=4: {'A': 4, 'B': 2, 'C': 3, 'D': 1, 'E': 1}
complete, cut at height 2.0: {'A': 4, 'B': 2, 'C': 3, 'D': 1, 'E': 1}
complete, cut at height 5.0: {'A': 3, 'B': 2, 'C': 2, 'D': 1, 'E': 1}
complete, cut at height 7.0: {'A': 2, 'B': 1, 'C': 1, 'D': 1, 'E': 1}
merge heights [1.414 3.606 6.708 7.211]  gaps [2.191 3.103 0.503]  largest gap after merge 2 -&gt; k = 3
inconsistency (mean, std, count, coefficient) per merge:
 [[1.414 0.    1.    0.   ]
 [3.606 0.    1.    0.   ]
 [3.909 2.66  3.    1.052]
 [6.96  0.356 2.    0.707]]</div>
  <p>Asking for k = 3 and cutting at height 5.0 give the same zones; height 2.0 gives 4 zones (only D, E merged); 7.0 gives 2. The <strong>inconsistency coefficient</strong> compares each merge height with the merges just below it: for the 6.71 merge, the merges within depth 2 are 6.71, 3.61 and 1.41 (mean 3.909, std 2.66), so (6.71 − 3.909)/2.66 = 1.05. A high value means "this merge joins things much farther apart than the merges that built them": a natural place to cut. <code>fcluster(Z, t, criterion="inconsistent")</code> cuts there.</p>
  <h3>Choosing k with outside help</h3>
  <p>The same tools as for K-Means apply: compute the silhouette for each cut (see <a class="xref" data-note="ml_kmeans">K-Means</a> and <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>), or use a business rule (the bank can afford 3 vans). The advantage here is that every candidate k comes from the <em>same</em> tree, so the groups for k = 3 and k = 4 are guaranteed to be nested.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>fcluster(Z, t, criterion)</code>: <code>"maxclust"</code> returns at most t groups; <code>"distance"</code> cuts so that no group has cophenetic height above t; <code>"inconsistent"</code> cuts merges whose inconsistency coefficient exceeds t. In sklearn, <code>n_clusters=k</code> or <code>distance_threshold=t</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Different linkages have different height scales (Ward heights are √(2Δ), not km). A threshold like "5 km" only means kilometres for single, complete and average linkage. Compare cuts within one tree, not across linkages.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Chaining and linkage behaviour.</b> On five branches the linkages disagreed mildly. On real data with noise and odd shapes, how differently do they behave, and why?</div>

  <h2 id="hc-chain"><span class="num">10</span>Chaining &amp; Other Linkage Behaviour</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We saw single linkage grow one group by swallowing branches one by one. Is that harmless, or can a few in-between rows ruin the result on real data?</p>
  </div>
  <h3>The chaining effect</h3>
  <p>Two clear blobs of 60 points, joined by a thin "bridge" of 12 points in a line (think of a road of houses between two towns). Ask each linkage for 2 groups:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score as ari
rng = np.random.default_rng(0)
left = rng.normal([0, 0], 0.5, (60, 2)); right = rng.normal([6, 0], 0.5, (60, 2))
bridge = np.c_[np.linspace(0.8, 5.2, 12), np.zeros(12)]          # a thin line of points between the blobs
Xc = np.vstack([left, right, bridge])
yc = np.r_[np.zeros(60), np.ones(60), (np.linspace(0.8, 5.2, 12) &gt; 3).astype(int)]
print("two blobs + a 12-point bridge (k = 2)")
for link in ["single", "complete", "average", "ward"]:
    lab = AgglomerativeClustering(2, linkage=link).fit_predict(Xc)
    print(f"  {link:9s} sizes {np.bincount(lab)}  ARI {ari(yc, lab):.2f}")</div>
  <div class="fx" data-lang="text">two blobs + a 12-point bridge (k = 2)
  single    sizes [131   1]  ARI 0.00
  complete  sizes [67 65]  ARI 0.97
  average   sizes [67 65]  ARI 0.97
  ward      sizes [68 64]  ARI 0.94</div>
  <p>Single linkage returns one group of 131 points and one lonely point: the bridge links every neighbour to the next, so both towns become one chain, and the "second group" is just the most isolated point. ARI 0.00. Complete and average linkage ignore the thin bridge (0.97), and Ward does nearly as well (0.94). This is the chaining effect seen in section 04 (B, then C, then A swallowed one by one), now at full strength.</p>
  <h3>Each linkage's personality</h3>
  <table class="tbl">
    <tr><th>Linkage</th><th>Finds</th><th>Weak against</th><th>On the shape table of <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a></th></tr>
    <tr><td>Single</td><td>long, curved, chain-like groups (moons, rings)</td><td>noise and bridges (chaining)</td><td>moons 1.00, circles 1.00, unequal blobs −0.01</td></tr>
    <tr><td>Complete</td><td>compact groups of similar diameter</td><td>outliers; splits big elongated groups</td><td>—</td></tr>
    <tr><td>Average</td><td>a compromise; most faithful tree (cophenetic)</td><td>very different densities</td><td>—</td></tr>
    <tr><td>Ward</td><td>round, similar-sized groups (like K-Means)</td><td>curved shapes, unequal sizes</td><td>moons 0.21, round blobs 0.99</td></tr>
  </table>
  <h3>Inversions: when heights go down</h3>
  <p>With single, complete, average and Ward linkage, merge heights only ever increase, so the dendrogram is clean. <strong>Centroid</strong> linkage (distance between group means) can break this. Three points A (0, 0), B (2, 0), C (1, 1.8): A–B = 2 merge first. The centroid of {A, B} is (1, 0), only 1.8 from C, so the next merge happens at a <em>lower</em> height than the first.</p>
  <div class="fx" data-lang="py">T = np.array([[0, 0], [2, 0], [1, 1.8]])                         # an almost-equilateral triangle
for method in ["centroid", "average"]:
    Zt = linkage(T, method=method)
    print(f"{method:8s} merge heights {Zt[:, 2].round(3)}")</div>
  <div class="fx" data-lang="text">centroid merge heights [2.  1.8]
average  merge heights [2.    2.059]</div>
  <p>Centroid heights 2.0 then 1.8: an <strong>inversion</strong>, which makes the dendrogram cross itself and "cut at height t" meaningless. Average linkage on the same points: 2.0 then 2.059, monotone. Prefer the four standard linkages.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Chaining</strong>: the tendency of single linkage to merge groups through a sequence of close intermediate points, producing long straggly groups. A linkage is <strong>monotone</strong> (no inversions) if every merge height is at least the previous one; single, complete, average and Ward are monotone, centroid and median are not.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Hierarchical clustering has no noise label: outliers are forced into the tree and usually join last, as singletons near the top. With single linkage a cut for k = 2 can return "everything + one outlier", as above. Remove outliers first, or use <a class="xref" data-note="ml_dbscan">DBSCAN</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Complexity.</b> Five branches cost nothing. The bank has 50,000 ATMs. Does the merge loop survive?</div>

  <h2 id="hc-cost"><span class="num">11</span>Complexity &amp; Scaling Up</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The loop needs the whole distance table and searches it at every merge. How does the cost grow with n, and what can we do for big data?</p>
  </div>
  <h3>The cost by hand</h3>
  <p>Memory: the condensed distance matrix holds n(n − 1)/2 numbers, 8 bytes each. Time: the naive loop does n − 1 merges, each scanning up to n² entries: O(n³). Better algorithms (SLINK for single, CLINK, nearest-neighbour chains for Ward/average/complete) bring time to O(n²), but memory stays O(n²) for everything except single linkage.</p>
  <div class="fx" data-lang="py">for n in [1_000, 10_000, 50_000, 200_000]:
    pairs = n * (n - 1) // 2
    print(f"n={n:&gt;7,}: pairs {pairs:&gt;14,}   condensed float64 matrix {pairs * 8 / 1e6:&gt;10,.0f} MB")
from sklearn.neighbors import kneighbors_graph
from sklearn.datasets import make_moons
Xm, ym = make_moons(400, noise=0.05, random_state=0)
conn = kneighbors_graph(Xm, n_neighbors=8, include_self=False)    # each point may only merge with its 8 neighbours
for link in ["average", "complete"]:
    for name, c in [("no constraint", None), ("8-NN connectivity", conn)]:
        lab = AgglomerativeClustering(2, linkage=link, connectivity=c).fit_predict(Xm)
        print(f"{link:8s} {name:18s} ARI on moons {ari(ym, lab):.2f}")</div>
  <div class="fx" data-lang="text">n=  1,000: pairs        499,500   condensed float64 matrix          4 MB
n= 10,000: pairs     49,995,000   condensed float64 matrix        400 MB
n= 50,000: pairs  1,249,975,000   condensed float64 matrix     10,000 MB
n=200,000: pairs 19,999,900,000   condensed float64 matrix    159,999 MB
average  no constraint      ARI on moons 0.24
average  8-NN connectivity  ARI on moons 1.00
complete no constraint      ARI on moons 0.28
complete 8-NN connectivity  ARI on moons 1.00</div>
  <p>10,000 rows: 400 MB, fine. 50,000 ATMs: 10 GB. 2 lakh: 160 GB. Compare <a class="xref" data-note="ml_kmeans">K-Means</a>, which needs only n × k distances. Rule of thumb: hierarchical clustering is for up to roughly 10–20 thousand rows.</p>
  <h3>Connectivity constraints</h3>
  <p>sklearn can restrict merges to pairs that are neighbours in a graph, usually the k-nearest-neighbour graph (<code>connectivity=kneighbors_graph(X, 8)</code>). Two effects: much faster (only graph edges are considered) and structure-aware. On the moons, average and complete linkage jump from ARI 0.24 / 0.28 to 1.00 once merges must follow neighbour links. (sklearn warns if the graph has several disconnected pieces and joins them itself.)</p>
  <h3>Hybrids for big data</h3>
  <ul>
    <li><strong>K-Means first</strong>: run <a class="xref" data-note="ml_kmeans">K-Means</a> (or mini-batch) with ~500 centres, then hierarchically cluster the 500 centres (weighting by size). You get a dendrogram over millions of rows.</li>
    <li><strong>BIRCH</strong>: builds a compact tree of mini-cluster summaries in one pass, then clusters the leaves (sklearn <code>Birch</code>).</li>
    <li><strong>Sample, then assign</strong>: cluster 10,000 sampled rows, then give every other row the label of its nearest group centroid.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>Standard agglomerative clustering needs Θ(n²) memory for the dissimilarity matrix and O(n²) to O(n³) time depending on algorithm and linkage. A <strong>connectivity constraint</strong> limits candidate merges to edges of a sparse graph, reducing cost and imposing structure (e.g. only adjacent pixels or neighbouring regions may merge).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling <code>linkage</code> on 1 lakh rows will try to allocate ~40 GB and crash or swap. Check n before you run it, and sample or use a hybrid.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: scipy in practice.</b> We know the algorithm and its limits. How do we drive it with scipy's functions and read their outputs?</div>

  <h2 id="hc-scipy"><span class="num">12</span>scipy in Practice</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which scipy functions build, cut, draw and evaluate a tree, and what exactly is in the linkage matrix Z?</p>
  </div>
  <table class="tbl">
    <tr><th>Function</th><th>Does</th><th>Key arguments</th></tr>
    <tr><td><code>pdist(X, metric)</code></td><td>condensed distance vector (n(n−1)/2)</td><td>"euclidean", "cityblock", "cosine", "jaccard", a callable</td></tr>
    <tr><td><code>linkage(y_or_X, method, metric)</code></td><td>builds the tree → Z</td><td>method: single, complete, average, weighted, centroid, median, ward</td></tr>
    <tr><td><code>fcluster(Z, t, criterion)</code></td><td>cuts → labels 1..k</td><td>"maxclust", "distance", "inconsistent"</td></tr>
    <tr><td><code>dendrogram(Z, ...)</code></td><td>draws (or returns coordinates with <code>no_plot=True</code>)</td><td>labels, truncate_mode="lastp", p, color_threshold, orientation</td></tr>
    <tr><td><code>cophenet(Z, y)</code></td><td>cophenetic correlation and distances</td><td>y = pdist(X)</td></tr>
    <tr><td><code>inconsistent(Z, d)</code></td><td>inconsistency statistics per merge</td><td>depth d</td></tr>
    <tr><td><code>optimal_leaf_ordering(Z, y)</code></td><td>reorders leaves so neighbours are similar</td><td>nicer heatmaps</td></tr>
  </table>
  <p><strong>The Z matrix</strong> has n − 1 rows, one per merge, in order: [id of group 1, id of group 2, height, number of rows in the new group]. Ids 0 … n−1 are the original rows; merge number m creates id n + m. Our Ward tree: [3, 4, 1.414, 2] (D + E → id 5), [1, 2, 3.606, 2] (B + C → id 6), [0, 6, 6.455, 3] (A + {B,C} → id 7), [5, 7, 7.598, 5]. You have already seen <code>linkage</code>, <code>fcluster</code>, <code>dendrogram</code> and <code>cophenet</code> in action in sections 06, 08 and 09.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>linkage</code> accepts either raw rows X (n × d) or a condensed distance vector from <code>pdist</code>, but not a square n × n matrix: a square matrix is silently treated as n rows of n features. Convert with <code>squareform(D)</code> first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sklearn.</b> scipy gives the tree; sklearn fits into pipelines. How does <code>AgglomerativeClustering</code> differ, and how do we handle new rows with no <code>predict</code>?</div>

  <h2 id="hc-sklearn"><span class="num">13</span>sklearn AgglomerativeClustering</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>sklearn's estimator returns labels, not a Z matrix. How do we set the cut, recover the tree, and assign a new branch that opens next year?</p>
  </div>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th></tr>
    <tr><td><code>n_clusters</code></td><td>2</td><td>cut by k (set None to use the threshold)</td></tr>
    <tr><td><code>distance_threshold</code></td><td>None</td><td>cut by height</td></tr>
    <tr><td><code>linkage</code></td><td>"ward"</td><td>"ward", "complete", "average", "single"</td></tr>
    <tr><td><code>metric</code></td><td>"euclidean"</td><td>"manhattan", "cosine", "precomputed" (not with Ward)</td></tr>
    <tr><td><code>connectivity</code></td><td>None</td><td>sparse neighbour graph restricting merges</td></tr>
    <tr><td><code>compute_full_tree</code>, <code>compute_distances</code></td><td>"auto", False</td><td>build the whole tree; store merge heights in <code>distances_</code></td></tr>
  </table>
  <div class="fx" data-lang="py">agg = AgglomerativeClustering(n_clusters=None, distance_threshold=5.0, linkage="complete",
                              compute_distances=True).fit(X)
print("n_clusters_ found:", agg.n_clusters_, "  labels_:", dict(zip(names, agg.labels_.tolist())))
print("children_ (merge order, ids &gt;= 5 are new clusters):", agg.children_.tolist())
print("distances_ (merge heights):", agg.distances_.round(3).tolist())

# rebuild a scipy linkage matrix from the sklearn model (counts = leaves under each merge)
counts = np.zeros(len(agg.children_))
for i, (l, r) in enumerate(agg.children_):
    counts[i] = sum(1 if c &lt; len(X) else counts[c - len(X)] for c in (l, r))
Z_sk = np.column_stack([agg.children_, agg.distances_, counts])
print("same as scipy complete:", np.allclose(Z_sk[:, 2], linkage(X, "complete")[:, 2]))

# no predict(): assign a new branch to the nearest cluster centroid
cent = np.array([X[agg.labels_ == k].mean(0) for k in range(agg.n_clusters_)])
new = np.array([[1, 1], [5.5, 4.0]])
print("new branches -&gt;", ((new[:, None] - cent[None]) ** 2).sum(2).argmin(1).tolist(),
      " (centroids", cent.round(2).tolist(), ")")</div>
  <div class="fx" data-lang="text">n_clusters_ found: 3   labels_: {'A': 1, 'B': 0, 'C': 0, 'D': 2, 'E': 2}
children_ (merge order, ids &gt;= 5 are new clusters): [[3, 4], [1, 2], [5, 6], [0, 7]]
distances_ (merge heights): [1.414, 3.606, 6.708, 7.211]
same as scipy complete: True
new branches -&gt; [1, 2]  (centroids [[1.0, 5.5], [0.0, 0.0], [5.5, 4.5]] )</div>
  <p>A 5 km threshold with complete linkage gives the same 3 zones as scipy. <code>children_</code> is the merge list (ids ≥ 5 are new groups) and <code>distances_</code> the heights; stacking them with the group sizes rebuilds scipy's Z exactly, so you can draw a dendrogram of an sklearn model. There is no <code>predict</code>, because a tree is not a rule for new points. The usual fix: compute each zone's centroid and send a new branch to the nearest one, here (1, 1) → zone 1 ({A}) and (5.5, 4) → zone 2 ({D, E}). A KNN classifier trained on the cluster labels is the other common choice.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>AgglomerativeClustering</code> exposes <code>labels_</code>, <code>n_clusters_</code>, <code>n_leaves_</code>, <code>children_</code> (shape (n − 1, 2)) and, with <code>compute_distances=True</code> or a threshold, <code>distances_</code>. With <code>metric="precomputed"</code> it clusters any distance matrix, e.g. the Gower matrix from <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Set exactly one of <code>n_clusters</code> and <code>distance_threshold</code>; giving both raises an error. And remember to scale features first: the merge loop uses distances just like K-Means.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From scratch.</b> Can we rebuild the whole thing, for all four linkages, in a few lines and match scipy's heights exactly?</div>

  <h2 id="hc-scratch"><span class="num">14</span>From Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 04's <code>agglomerate</code> handled single, complete and average with special cases. Can the Lance–Williams formula give one compact implementation that also covers Ward?</p>
  </div>
  <p>The program is the merge loop of section 03 with the update from section 07. Ward runs on squared distances and reports √ of the merge value, like scipy.</p>
  <div class="fx" data-lang="py"># Lance-Williams: d(i+j, k) = ai*d(i,k) + aj*d(j,k) + b*d(i,j) + g*|d(i,k) - d(j,k)|
def lw(method, ni, nj, nk):
    if method == "single":   return 0.5, 0.5, 0.0, -0.5
    if method == "complete": return 0.5, 0.5, 0.0, 0.5
    if method == "average":  return ni / (ni + nj), nj / (ni + nj), 0.0, 0.0
    if method == "ward":     # works on squared distances
        t = ni + nj + nk
        return (ni + nk) / t, (nj + nk) / t, -nk / t, 0.0

def my_linkage(X, method):
    Dm = squareform(pdist(X)); Dm = Dm ** 2 if method == "ward" else Dm
    active = {i: 1 for i in range(len(X))}              # cluster id -&gt; size
    dist = {(i, j): Dm[i, j] for i in range(len(X)) for j in range(i + 1, len(X))}
    get = lambda a, b: dist[(min(a, b), max(a, b))]
    Z, nxt = [], len(X)
    while len(active) &gt; 1:
        (i, j) = min(dist, key=dist.get); h = dist[(i, j)]
        ni, nj = active.pop(i), active.pop(j)
        for k, nk in active.items():
            ai, aj, b, g = lw(method, ni, nj, nk)
            dik, djk = get(i, k), get(j, k)
            dist[(k, nxt)] = ai * dik + aj * djk + b * h + g * abs(dik - djk)
        dist = {key: v for key, v in dist.items() if i not in key and j not in key}
        Z.append([i, j, np.sqrt(h) if method == "ward" else h, ni + nj])
        active[nxt] = ni + nj; nxt += 1
    return np.array(Z)

for method in ["single", "complete", "average", "ward"]:
    mine, ref = my_linkage(X, method), linkage(X, method)
    print(f"{method:9s} heights {mine[:, 2].round(3).tolist()}  match scipy: {np.allclose(mine[:, 2], ref[:, 2])}")
Xr = np.random.default_rng(1).normal(size=(40, 3))
print("40 random points, all methods match:",
      all(np.allclose(my_linkage(Xr, m)[:, 2], linkage(Xr, m)[:, 2]) for m in ["single", "complete", "average", "ward"]))</div>
  <div class="fx" data-lang="text">single    heights [1.414, 3.162, 3.606, 4.472]  match scipy: True
complete  heights [1.414, 3.606, 6.708, 7.211]  match scipy: True
average   heights [1.414, 3.581, 5.233, 6.439]  match scipy: True
ward      heights [1.414, 3.606, 6.455, 7.598]  match scipy: True
40 random points, all methods match: True</div>
  <p>All four linkages reproduce the hand-computed heights (single 1.414, 3.162, 3.606, 4.472; Ward 1.414, 3.606, 6.455, 7.598) and match scipy, also on 40 random 3-D points. This version is O(n³) and only for learning; scipy uses smarter O(n²) algorithms.</p>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have built every piece. How do they depend on each other, and which one answers which question?</div>

  <h2 id="hc-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Distance matrix, linkages, Lance–Williams, dendrogram, cophenetic distance, cuts: one system or a list of facts?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="hc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="6" width="180" height="40" rx="7" class="fb sb"/><text x="340" y="24" text-anchor="middle" font-size="11.5" font-weight="700">distance matrix (5 × 5)</text><text x="340" y="39" text-anchor="middle" class="tm" font-size="10">smallest: D–E 1.41</text>
<line x1="340" y1="46" x2="340" y2="66" stroke="currentColor" marker-end="url(#hc-a9)"/>
<rect x="215" y="68" width="250" height="40" rx="7" class="ft st"/><text x="340" y="86" text-anchor="middle" font-size="11.5" font-weight="700">merge loop: join closest, update</text><text x="340" y="101" text-anchor="middle" class="tm" font-size="10">n − 1 merges</text>
<line x1="270" y1="108" x2="85" y2="138" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="310" y1="108" x2="250" y2="138" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="370" y1="108" x2="420" y2="138" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="410" y1="108" x2="590" y2="138" stroke="currentColor" marker-end="url(#hc-a9)"/>
<text x="340" y="128" text-anchor="middle" class="tm" font-size="10">"closest" between groups = linkage</text>
<rect x="15" y="140" width="145" height="44" rx="7" class="fg sg"/><text x="87" y="158" text-anchor="middle" font-size="11">single = min</text><text x="87" y="174" text-anchor="middle" class="tm" font-size="10">d(DE,B) = 3.16</text>
<rect x="175" y="140" width="150" height="44" rx="7" class="fg sg"/><text x="250" y="158" text-anchor="middle" font-size="11">complete = max</text><text x="250" y="174" text-anchor="middle" class="tm" font-size="10">d(DE,B) = 4.00</text>
<rect x="340" y="140" width="155" height="44" rx="7" class="fg sg"/><text x="417" y="158" text-anchor="middle" font-size="11">average = mean</text><text x="417" y="174" text-anchor="middle" class="tm" font-size="10">d(DE,B) = 3.58</text>
<rect x="510" y="140" width="160" height="44" rx="7" class="fg sg"/><text x="590" y="158" text-anchor="middle" font-size="11">Ward = ΔWCSS</text><text x="590" y="174" text-anchor="middle" class="tm" font-size="10">Δ(B,DE) = 8.33 → 4.08</text>
<line x1="87" y1="184" x2="300" y2="214" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="250" y1="184" x2="320" y2="214" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="417" y1="184" x2="360" y2="214" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="590" y1="184" x2="380" y2="214" stroke="currentColor" marker-end="url(#hc-a9)"/>
<text x="560" y="206" class="tm" font-size="9.5">all four = one Lance–Williams formula</text>
<rect x="230" y="216" width="220" height="38" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="232" text-anchor="middle" font-size="11.5" font-weight="700">dendrogram (merge heights)</text><text x="340" y="247" text-anchor="middle" class="tm" font-size="10">cophenetic corr 0.68–0.84</text>
<line x1="300" y1="254" x2="150" y2="280" stroke="currentColor" marker-end="url(#hc-a9)"/><line x1="380" y1="254" x2="530" y2="280" stroke="currentColor" marker-end="url(#hc-a9)"/>
<rect x="40" y="282" width="230" height="32" rx="7" class="fr sr"/><text x="155" y="302" text-anchor="middle" font-size="11">cut: height · k · largest gap</text>
<rect x="410" y="282" width="250" height="32" rx="7" class="fr sr"/><text x="535" y="302" text-anchor="middle" font-size="11">behaviour: chaining · outliers · cost n²</text>
</svg><figcaption>One distance matrix and one merge loop; the only real choice is the linkage, which decides how distances to a merged group are updated. All four linkages share the Lance–Williams formula and all produce a dendrogram, which you then cut.</figcaption></figure>
  <p>In words: the <strong>distance matrix</strong> feeds the <strong>merge loop</strong>. The only design choice is the <strong>linkage</strong>, the rule for the distance from a merged group to the others; min, max, mean and ΔWCSS are four settings of the one <strong>Lance–Williams</strong> formula. The loop's record of merges and heights is the <strong>dendrogram</strong>; its heights define <strong>cophenetic distances</strong>, whose correlation with the original distances measures how faithful the tree is. <strong>Cutting</strong> the dendrogram gives flat groups, and the linkage decides their <strong>behaviour</strong> (chaining for single, compactness for complete and Ward). The n² table sets the <strong>cost</strong>.</p>
  <table class="tbl"><caption>Every concept on the same five branches</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On our branches</th><th>Robust or sensitive</th><th>Use when</th></tr>
    <tr><td>Distance matrix</td><td>any row distance</td><td>how far is each pair?</td><td>D–E 1.41 … A–D 7.21</td><td>scaling, choice of metric</td><td>always (step 0)</td></tr>
    <tr><td>Single linkage</td><td>min of pair distances</td><td>are the groups connected by a short link?</td><td>d(DE, B) 3.16; top split {A}|{BCDE}</td><td>very sensitive to noise (chaining)</td><td>clean curved shapes</td></tr>
    <tr><td>Complete linkage</td><td>max of pair distances</td><td>is the whole group within a diameter?</td><td>d(DE, B) 4.00; k = 3 {A}{BC}{DE}</td><td>sensitive to outliers</td><td>compact groups</td></tr>
    <tr><td>Average linkage</td><td>mean of pair distances</td><td>how far apart on average?</td><td>d(DE, B) 3.58; coph corr 0.842</td><td>moderate</td><td>general use, faithful trees</td></tr>
    <tr><td>Ward</td><td>sizes × squared centroid gap</td><td>which merge keeps groups tightest?</td><td>Δ(B, DE) 8.33; k = 2 {ABC}{DE}</td><td>outliers; Euclidean only</td><td>round groups, like K-Means</td></tr>
    <tr><td>Lance–Williams</td><td>old distances + 4 coefficients</td><td>how to update after a merge?</td><td>½·4 + ½·3.16 ∓ ½·0.84</td><td>—</td><td>implementations</td></tr>
    <tr><td>Dendrogram</td><td>merge list + heights</td><td>what does the tree look like?</td><td>complete: 1.41, 3.61, 6.71, 7.21</td><td>leaf order arbitrary</td><td>always look at it</td></tr>
    <tr><td>Cophenetic corr.</td><td>tree heights vs real distances</td><td>is the tree faithful?</td><td>0.680 (Ward) … 0.842 (average)</td><td>—</td><td>comparing linkages</td></tr>
    <tr><td>Cut</td><td>dendrogram + height or k</td><td>which groups do we report?</td><td>largest gap → k = 3</td><td>height scale differs per linkage</td><td>final answer</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Hierarchical clustering = <strong>distance + linkage + cut</strong>. The distance says which rows are alike, the linkage says what makes two groups alike (and therefore what shapes you can find), and the cut says how many groups you report. Change any one of the three and the answer can change, as the five branches showed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Where does hierarchical clustering stand against its siblings?</div>

  <h2 id="hc-compare"><span class="num">16</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When is a tree the right tool, and when should we use K-Means, DBSCAN or a GMM instead?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th><a class="xref" data-note="ml_kmeans">K-Means</a></th><th>Hierarchical</th><th><a class="xref" data-note="ml_dbscan">DBSCAN / HDBSCAN</a></th><th><a class="xref" data-note="ml_gmm">GMM</a></th></tr>
    <tr><td>Need k up front?</td><td>yes</td><td>no, cut later</td><td>no (density settings)</td><td>yes</td></tr>
    <tr><td>Output</td><td>flat, hard</td><td>tree → any k, nested</td><td>flat + noise</td><td>soft</td></tr>
    <tr><td>Deterministic?</td><td>no (random start)</td><td>yes (up to ties)</td><td>yes (mostly)</td><td>no</td></tr>
    <tr><td>Distance</td><td>squared Euclidean</td><td>any (Ward: Euclidean)</td><td>any</td><td>Mahalanobis</td></tr>
    <tr><td>Shapes</td><td>round</td><td>linkage decides</td><td>any</td><td>ellipses</td></tr>
    <tr><td>Outliers</td><td>steal centres</td><td>forced in, join late</td><td>noise −1</td><td>low probability</td></tr>
    <tr><td>Scale</td><td>millions</td><td>~10⁴ (n² memory)</td><td>~10⁵–10⁶</td><td>~10⁵</td></tr>
    <tr><td>New rows</td><td>predict</td><td>no (nearest centroid / KNN)</td><td>no</td><td>predict_proba</td></tr>
    <tr><td>Best for</td><td>big data segmentation</td><td>small data, taxonomies, any-distance (Gower)</td><td>spatial data, odd shapes, anomalies</td><td>overlapping groups, probabilities</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a>.</b> Hierarchical clustering still forces every row into a group and chokes on n². DBSCAN keeps single linkage's ability to follow any shape, adds a density test that labels lonely rows as noise, and scales much further.</div>

  <h2 id="hc-traps"><span class="num">17</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: single linkage on noisy data</span><p>A thin bridge of 12 points merged two towns (ARI 0.00). Use average, complete or Ward unless the data is clean and curved.</p></div>
  <div class="callout trap"><span class="label">Trap: Ward with a non-Euclidean matrix</span><p>Ward needs centroids; with Gower or cosine use average or complete linkage and <code>metric="precomputed"</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: square matrix into linkage()</span><p>Pass raw X or <code>squareform(D)</code>, never the n × n matrix directly.</p></div>
  <div class="callout trap"><span class="label">Trap: reading leaf order as similarity</span><p>Only the height where two leaves join matters; flipping a branch changes the drawing, not the tree.</p></div>
  <div class="callout trap"><span class="label">Trap: comparing heights across linkages</span><p>Ward heights are √(2Δ); single/complete/average are distances. Cut within one tree.</p></div>
  <div class="callout trap"><span class="label">Trap: running it on 1 lakh rows</span><p>~40 GB of distances. Sample, use connectivity, or K-Means first then cluster the centres.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting to scale</span><p>Every linkage starts from distances; the widest column still decides.</p></div>
  <div class="callout trap"><span class="label">Trap: expecting a noise label</span><p>Outliers are forced into the tree and often become singleton "groups" at the top. Remove them or use DBSCAN.</p></div>

  <h2 id="hc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: five bank branches A (0, 0), B (2, 4), C (0, 7), D (6, 4), E (5, 5), km on a map.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our branches</th><th>Weakness → next</th></tr>
    <tr><td>Tree of groups</td><td>every k at once?</td><td>5 → 4 → 3 → 2 → 1 zones</td><td>how is it built?</td></tr>
    <tr><td>Agglomerative / divisive</td><td>up or down?</td><td>merge up; DIANA splits off A first</td><td>"closest" needs numbers</td></tr>
    <tr><td>Distance matrix + loop</td><td>what does a merge need?</td><td>D–E 1.41 merges first</td><td>distance to a group?</td></tr>
    <tr><td>Single</td><td>closest pair?</td><td>3.16; heights 1.41, 3.16, 3.61, 4.47</td><td>chains</td></tr>
    <tr><td>Complete</td><td>farthest pair?</td><td>4.00; 1.41, 3.61, 6.71, 7.21</td><td>outliers dominate</td></tr>
    <tr><td>Average</td><td>all pairs?</td><td>3.58; 1.41, 3.58, 5.23, 6.44</td><td>no objective</td></tr>
    <tr><td>Ward</td><td>least WCSS increase?</td><td>Δ 1, 6.5, 20.83, 28.87 (Σ = TSS 57.2)</td><td>four rules?</td></tr>
    <tr><td>Lance–Williams</td><td>one update formula?</td><td>½·4.00 + ½·3.16 − ½·0.84 = 3.16</td><td>how to see it?</td></tr>
    <tr><td>Dendrogram</td><td>draw and read?</td><td>coph corr 0.68–0.84</td><td>which groups?</td></tr>
    <tr><td>Cut</td><td>pick k?</td><td>largest gap → {A} {B,C} {D,E}</td><td>linkages disagree</td></tr>
    <tr><td>Chaining etc.</td><td>why disagree?</td><td>bridge: single 0.00, others 0.94–0.97</td><td>cost</td></tr>
    <tr><td>Complexity</td><td>big data?</td><td>50,000 rows → 10 GB</td><td>→ DBSCAN, hybrids</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Single</td><td>L(G,H) = min_{x∈G,y∈H} d(x,y)</td><td>G, H groups; d row distance</td></tr>
    <tr><td>Complete</td><td>L(G,H) = max d(x,y)</td><td></td></tr>
    <tr><td>Average (UPGMA)</td><td>L(G,H) = (1/(|G||H|)) ΣΣ d(x,y)</td><td>|G| group size</td></tr>
    <tr><td>Ward</td><td>Δ(G,H) = (n_G n_H/(n_G + n_H)) ‖c_G − c_H‖²; height √(2Δ)</td><td>c centroids; Σ Δ over all merges = TSS</td></tr>
    <tr><td>Lance–Williams</td><td>d(i∪j,k) = αᵢd(i,k) + αⱼd(j,k) + βd(i,j) + γ|d(i,k) − d(j,k)|</td><td>single (½,½,0,−½), complete (½,½,0,½), average (nᵢ/n, nⱼ/n, 0, 0), Ward on d²</td></tr>
    <tr><td>Cophenetic distance</td><td>c(x,y) = height of first common merge</td><td>correlation with d = faithfulness</td></tr>
    <tr><td>Inconsistency</td><td>(h − mean of nearby heights)/std</td><td>large → natural cut</td></tr>
    <tr><td>Cost</td><td>memory n(n−1)/2 × 8 bytes; time O(n²)–O(n³)</td><td>n rows</td></tr>
  </table>
  <h3>When to use what</h3>
  <div class="cards">
    <div><b>Use hierarchical</b><p>Small to medium data (≤ ~20k rows), you want every k, a taxonomy or a picture, or a custom distance such as Gower.</p><small>Deterministic; no k up front</small></div>
    <div><b>Avoid it</b><p>Hundreds of thousands of rows, noisy data needing a noise label, or when new rows must be labelled constantly.</p><small>K-Means, DBSCAN</small></div>
    <div><b>Pick the linkage</b><p>Ward for compact round groups; average for a faithful general tree; complete for bounded diameter; single only for clean chains.</p><small>Check the cophenetic correlation</small></div>
    <div><b>Pick the cut</b><p>Largest gap, a height with real meaning (km), a business k, or the best silhouette.</p><small>Heights only comparable within one tree</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Chaining with single linkage; Ward with non-Euclidean distances; square matrix into <code>linkage</code>; reading leaf order; comparing heights across linkages; n² memory; forgetting to scale; no noise label; centroid linkage inversions; greedy merges are never undone.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>d(B,D) = 4.00, d(B,E) = 3.16. Distance from B to {D,E} under single / complete / average?</td><td>3.16 / 4.00 / 3.58</td></tr>
    <tr><td>Ward cost of merging single points 2 km apart, and scipy's height?</td><td>Δ = ½ × 4 = 2; height √(2 × 2) = 2</td></tr>
    <tr><td>Heights 1.41, 3.61, 6.71, 7.21: k by largest gap?</td><td>Gap 3.10 after the 2nd merge → 3 groups</td></tr>
    <tr><td>Which linkages can produce inversions?</td><td>Centroid and median</td></tr>
    <tr><td>Memory for 50,000 rows?</td><td>≈ 1.25 × 10⁹ distances × 8 bytes = 10 GB</td></tr>
  </table>

  <h2 id="hc-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does agglomerative clustering work, and how is it different from divisive?</summary><div class="qa-body">Start with every row as a group; repeatedly merge the two groups with the smallest linkage distance, recording the height, until one group remains (n − 1 merges). Divisive starts from one group and splits (DIANA, bisecting K-Means); each split is itself a hard problem, so agglomerative is the standard.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define single, complete, average and Ward linkage, with our numbers.</summary><div class="qa-body">For B vs {D, E} with d(B,D) = 4.00, d(B,E) = 3.16: single = closest pair 3.16; complete = farthest pair 4.00; average = mean 3.58; Ward = increase in WCSS = (1·2/3) × ‖(2,4) − (5.5,4.5)‖² = 8.33 (height 4.08).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the chaining effect and which linkage suffers from it?</summary><div class="qa-body">Single linkage joins groups if any one pair is close, so a sequence of in-between points links distant groups into one long chain. Two blobs with a 12-point bridge: single gave 131 + 1 points (ARI 0.00); complete and average 0.97; Ward 0.94.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a dendrogram and choose where to cut?</summary><div class="qa-body">Height of a merge = linkage distance between the merged groups; only the joining height tells similarity, not leaf order. Cut by a meaningful height, a required k, the largest gap between successive merges (complete: 3.61 → 6.71 ⇒ 3 groups), the inconsistency coefficient, or the best silhouette.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the cophenetic correlation?</summary><div class="qa-body">The correlation between the original pairwise distances and the cophenetic distances (height where each pair first merges). It measures how faithfully the tree represents the data: 0.842 for average, 0.825 single, 0.746 complete, 0.680 Ward on our branches.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Lance–Williams formula and why does it matter?</summary><div class="qa-body">d(i∪j, k) = αᵢd(i,k) + αⱼd(j,k) + βd(i,j) + γ|d(i,k) − d(j,k)|. Different coefficients give single, complete, average, Ward (on squared distances) and centroid linkage, so one O(n²)-memory implementation updates the table after each merge without revisiting the raw rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Time and memory complexity? How would you cluster 1 million rows hierarchically?</summary><div class="qa-body">Memory O(n²) (50,000 rows = 10 GB), time O(n²) with good algorithms (O(n³) naive). For 1 million rows: K-Means or mini-batch to ~1,000 centres, then hierarchical on the centres; or BIRCH; or sample + nearest-centroid assignment; or a sparse connectivity graph.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't Ward be used with Gower or cosine distance?</summary><div class="qa-body">Ward's merge cost uses centroids and squared Euclidean distance (ΔWCSS). Gower and cosine are not Euclidean, so centroids and WCSS are not defined consistently. Use average or complete linkage with a precomputed matrix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an inversion in a dendrogram?</summary><div class="qa-body">A merge at a lower height than an earlier merge, which happens with centroid or median linkage: A(0,0), B(2,0) merge at 2, then their centroid (1,0) is 1.8 from C(1,1.8), so the next merge is at 1.8. The dendrogram crosses itself and height cuts lose meaning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>sklearn's AgglomerativeClustering has no predict. How do you label a new row?</summary><div class="qa-body">Compute each cluster's centroid (or medoid) and assign the new row to the nearest, or train a KNN classifier on the cluster labels. New branch (5.5, 4) → zone {D, E}. Re-cluster periodically, since the tree itself does not update.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is Ward linkage related to K-Means?</summary><div class="qa-body">Both minimise within-cluster sum of squares. K-Means optimises WCSS for one fixed k by iterating; Ward greedily merges the pair that raises WCSS least, giving a nested tree. The Ward Δs sum to TSS (57.2 here). A Ward cut is a good initialisation for K-Means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is single linkage related to DBSCAN and the minimum spanning tree?</summary><div class="qa-body">Single linkage's tree is the minimum spanning tree; cutting its longest edges gives the groups. DBSCAN also chains close neighbours but only through dense core points, which stops chaining through sparse bridges and labels isolated points as noise. HDBSCAN builds a single-linkage-style tree over a density-adjusted distance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why use hierarchical clustering after computing a Gower matrix?</summary><div class="qa-body">Gower handles mixed numeric and categorical columns but gives only a distance matrix, no coordinates, so K-Means cannot use it. Agglomerative clustering with average or complete linkage and metric="precomputed" works directly on that matrix, as in The Idea &amp; Distances.</div></details>
</main>
`
});
