// notes/ml/ml_hierarchical.js — Hierarchical Clustering
Object.assign(TOPIC_CONTENT, {
  "ml_hierarchical": `<main>
  <h1>Hierarchical Clustering</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>Hierarchical</span></div>
  <p class="lead">Hierarchical clustering builds a whole family tree of groups instead of a single answer. It starts with every row on its own, repeatedly joins the two closest groups, and records how far apart they were at each join; the resulting tree, called a dendrogram, contains the grouping for every possible number of groups, and you cut it wherever you need. That makes it the natural tool when you do not know k in advance, when you want to see how groups nest inside each other (as in biology's gene trees or a company's product taxonomy), or when you have only a distance matrix, such as Gower distances for a mixed table. Its price is memory that grows with the square of the number of rows. The running example is five bank branches, A to E, on a city map; every linkage rule, the dendrogram and the cut are worked out by hand on these five points before scipy and sklearn confirm them.</p>

  <h2 id="hc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hierarchical Clustering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>A tree of nested groups: every k at once</li>
          <li>Agglomerative: merge the closest pair, n − 1 times</li>
          <li>Divisive: split from the top (DIANA, bisecting K-Means)</li>
          <li>Deterministic, any distance, no noise label</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linkage</div>
        <ul>
          <li>Single = closest pair (chains)</li>
          <li>Complete = farthest pair (compact)</li>
          <li>Average = mean of all pairs (faithful)</li>
          <li>Ward = smallest increase in within-group sum of squares</li>
          <li>All four: one Lance–Williams update formula</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dendrogram</div>
        <ul>
          <li>Bar height = distance at which two groups merged</li>
          <li>Cut by height, by k, or in the largest gap</li>
          <li>Cophenetic correlation = how faithful the tree is</li>
          <li>Leaf order means nothing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cost</div>
        <ul>
          <li>n² memory: 50,000 rows ≈ 10 GB</li>
          <li>Connectivity graph, K-Means first, or sampling for big data</li>
          <li>No predict: nearest centroid or KNN for new rows</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="hc-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Tree of Groups</span><span class="rm-sub">every k at once, on five bank branches</span></div></div>
      <div class="rm-item rm-done" data-target="hc-loop"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Distance Matrix &amp; the Merge Loop</span><span class="rm-sub">the algorithm, and why it needs a linkage</span></div></div>
      <div class="rm-item rm-done" data-target="hc-single"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Single Linkage</span><span class="rm-sub">groups as close as their closest members</span></div></div>
      <div class="rm-item rm-done" data-target="hc-complete"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Complete &amp; Average Linkage</span><span class="rm-sub">farthest members, and all members</span></div></div>
      <div class="rm-item rm-done" data-target="hc-ward"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Ward's Method</span><span class="rm-sub">merging to keep groups tight</span></div></div>
      <div class="rm-item rm-done" data-target="hc-lw"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Lance–Williams</span><span class="rm-sub">one update formula, and a from-scratch version</span></div></div>
      <div class="rm-item rm-done" data-target="hc-dendro"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Dendrogram</span><span class="rm-sub">drawing and reading the tree</span></div></div>
      <div class="rm-item rm-done" data-target="hc-cut"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Cutting the Tree</span><span class="rm-sub">from a tree to a list of groups</span></div></div>
      <div class="rm-item rm-done" data-target="hc-chain"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Chaining &amp; Linkage Behaviour</span><span class="rm-sub">why linkages disagree on real data</span></div></div>
      <div class="rm-item rm-done" data-target="hc-div"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Divisive Clustering</span><span class="rm-sub">building the tree from the top down</span></div></div>
      <div class="rm-item rm-done" data-target="hc-cost"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Complexity &amp; Scaling Up</span><span class="rm-sub">n² memory and how to work around it</span></div></div>
      <div class="rm-item rm-done" data-target="hc-tools"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">scipy and sklearn in Practice</span><span class="rm-sub">linkage, fcluster, AgglomerativeClustering</span></div></div>
      <div class="rm-item rm-done" data-target="hc-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">square matrices, chaining, wrong linkage</span></div></div>
      <div class="rm-item rm-done" data-target="hc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">linkages, formulas, when to use what</span></div></div>
      <div class="rm-item rm-done" data-target="hc-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on hierarchical clustering</span></div></div>
    </div>
  </div>

  <h2 id="hc-idea"><span class="num">01</span>A Tree of Groups</h2>
  <p><a class="xref" data-note="ml_kmeans">K-Means</a> made us choose the number of groups k before we had looked at the data, and gave back one flat answer with no idea how the groups relate to each other. Real groupings are often nested: shops form neighbourhoods, neighbourhoods form zones, zones form a city. If we asked K-Means for 3 groups and then for 4, the two answers might not even agree with each other. Can one algorithm give us every level at once, consistently?</p>
  <p>Here is the running example. A bank has five branches on a city map, with coordinates in kilometres: A (0, 0), B (2, 4), C (0, 7), D (6, 4) and E (5, 5). It wants to group them into service zones that share a cash van, but has not yet decided how many vans to buy. What it really needs is not "the 2 zones" or "the 3 zones" but "what the zones would look like for any number of vans".</p>
<figure class="viz"><svg viewBox="0 0 330 330" width="330"><line x1="40" y1="300" x2="320" y2="300" stroke="currentColor" stroke-opacity="0.3"/><line x1="40" y1="300" x2="40" y2="22.600000000000023" stroke="currentColor" stroke-opacity="0.3"/><text x="40" y="316" text-anchor="middle" class="tm" font-size="10">0</text><text x="32" y="304" text-anchor="end" class="tm" font-size="10">0</text><text x="80" y="316" text-anchor="middle" class="tm" font-size="10">1</text><text x="32" y="266" text-anchor="end" class="tm" font-size="10">1</text><text x="120" y="316" text-anchor="middle" class="tm" font-size="10">2</text><text x="32" y="228" text-anchor="end" class="tm" font-size="10">2</text><text x="160" y="316" text-anchor="middle" class="tm" font-size="10">3</text><text x="32" y="190" text-anchor="end" class="tm" font-size="10">3</text><text x="200" y="316" text-anchor="middle" class="tm" font-size="10">4</text><text x="32" y="152" text-anchor="end" class="tm" font-size="10">4</text><text x="240" y="316" text-anchor="middle" class="tm" font-size="10">5</text><text x="32" y="114" text-anchor="end" class="tm" font-size="10">5</text><text x="280" y="316" text-anchor="middle" class="tm" font-size="10">6</text><text x="32" y="76" text-anchor="end" class="tm" font-size="10">6</text><text x="320" y="316" text-anchor="middle" class="tm" font-size="10">7</text><text x="32" y="38" text-anchor="end" class="tm" font-size="10">7</text><line x1="280.0" y1="148.0" x2="240.0" y2="110.0" class="st" stroke-dasharray="4 3"/><text x="264.0" y="125.0" class="tm" font-size="10">1.41</text><line x1="120.0" y1="148.0" x2="240.0" y2="110.0" class="st" stroke-dasharray="4 3"/><text x="184.0" y="125.0" class="tm" font-size="10">3.16</text><line x1="120.0" y1="148.0" x2="40.0" y2="34.0" class="st" stroke-dasharray="4 3"/><text x="84.0" y="87.0" class="tm" font-size="10">3.61</text><line x1="120.0" y1="148.0" x2="280.0" y2="148.0" class="st" stroke-dasharray="4 3"/><text x="204.0" y="144.0" class="tm" font-size="10">4.00</text><line x1="40.0" y1="300.0" x2="120.0" y2="148.0" class="st" stroke-dasharray="4 3"/><text x="84.0" y="220.0" class="tm" font-size="10">4.47</text><circle cx="40.0" cy="300.0" r="7" class="fb sb"/><text x="50.0" y="314.0" font-size="12" font-weight="700">A (0,0)</text><circle cx="120.0" cy="148.0" r="7" class="fb sb"/><text x="130.0" y="162.0" font-size="12" font-weight="700">B (2,4)</text><circle cx="40.0" cy="34.0" r="7" class="fb sb"/><text x="50.0" y="48.0" font-size="12" font-weight="700">C (0,7)</text><circle cx="280.0" cy="148.0" r="7" class="fb sb"/><text x="290.0" y="162.0" font-size="12" font-weight="700">D (6,4)</text><circle cx="240.0" cy="110.0" r="7" class="fb sb"/><text x="250.0" y="124.0" font-size="12" font-weight="700">E (5,5)</text><text x="180.0" y="324" text-anchor="middle" class="tm" font-size="10.5">km east →   (dashed: the five shortest distances)</text></svg><figcaption>The five branches. D and E are almost neighbours (1.41 km); A is far from everyone; B sits in the middle.</figcaption></figure>
  <p>D and E are almost neighbours (1.41 km apart), A is far from everyone, and B sits in the middle. <strong>Hierarchical clustering</strong> answers the bank with a <strong>hierarchy</strong>: a sequence of groupings in which each one is made by joining two groups of the previous one. Using one of the rules we will meet in section 04 (complete linkage), it goes like this. With 5 zones every branch is alone. At distance 1.41, D and E join, leaving 4 zones: {A}, {B}, {C}, {D, E}. At 3.61, B and C join: 3 zones, {A}, {B, C}, {D, E}. At 6.71, {B, C} and {D, E} join: 2 zones, {A} and {B, C, D, E}. At 7.21 everything is one zone. The bank can now read off "3 vans means zones {A}, {B, C}, {D, E}" without re-running anything, and the zones for 3 vans are guaranteed to be the zones for 4 vans with two of them joined.</p>
  <p>Think of a family tree read upwards. Brothers and sisters join first, then cousins, then the whole extended family. Cut the tree at the "cousins" level and you get a few big branches; cut lower and you get many small families. The tree holds every grouping at once. Drawn with the joining distances as heights, it is called a <strong>dendrogram</strong> (section 07).</p>
  <p>There are two ways to grow such a tree. <strong>Agglomerative</strong> (bottom-up) clustering starts with every row as its own group and repeatedly merges the two closest groups. <strong>Divisive</strong> (top-down) clustering starts with one group of everything and repeatedly splits. Agglomerative is far more common, because each step only needs to find the smallest number in a table, while each divisive step is itself a hard clustering problem; when people, scipy or sklearn say "hierarchical clustering" they mean agglomerative unless they say otherwise. We build agglomerative first and come back to divisive in section 10. One caution from the start: "no k needed" does not mean the algorithm chooses k for you. You still decide where to cut the tree; hierarchical clustering simply lets you make that choice after seeing the structure.</p>

  <h2 id="hc-loop"><span class="num">02</span>The Distance Matrix &amp; the Merge Loop</h2>
  <p>To merge "the two closest groups" we need to know how far apart everything is. The first step is the <strong>distance matrix</strong>, the table of Euclidean distances between every pair of branches (introduced in <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>). A few by hand: D to E is √((6 − 5)² + (4 − 5)²) = √2 = 1.41; B to E is √(9 + 1) = 3.16; B to C is √(4 + 9) = 3.61; B to D is 4.00; A to B is √20 = 4.47.</p>
<div class="fx" data-lang="py">import numpy as np, pandas as pd
from scipy.spatial.distance import pdist, squareform
names = list("ABCDE")
X = np.array([[0, 0], [2, 4], [0, 7], [6, 4], [5, 5]], dtype=float)   # five bank branches, km on a map
D = squareform(pdist(X))                                                # 5 x 5 Euclidean distance matrix
print(pd.DataFrame(D, index=names, columns=names).round(2))</div>
  <div class="fx" data-lang="text">      A     B     C     D     E
A  0.00  4.47  7.00  7.21  7.07
B  4.47  0.00  3.61  4.00  3.16
C  7.00  3.61  0.00  6.71  5.39
D  7.21  4.00  6.71  0.00  1.41
E  7.07  3.16  5.39  1.41  0.00</div>
  <p>Five branches give 5 × 4 / 2 = 10 distinct numbers. The agglomerative loop is then short to describe: treat every row as its own group; find the smallest distance in the table; merge those two groups and record the distance as the merge height; replace their two rows and columns in the table by a single row and column for the new group; repeat until one group remains. With n rows there are always exactly n − 1 merges.</p>
  <p>The smallest number in our table is D–E at 1.41, so the first merge is {D, E} at height 1.41. Now the table must shrink from 5 × 5 to 4 × 4, and we need three new numbers: the distance from the new group {D, E} to A, to B and to C. B is 4.00 from D but 3.16 from E. Is B "4.00 from {D, E}", "3.16", or something in between? The rows themselves cannot answer; we need a rule that turns distances between rows into a distance between groups. That rule is called the <strong>linkage</strong>, and it is the only real design choice in agglomerative clustering. The next three sections compute the four standard linkages by hand.</p>
  <p>Notice one property of the loop before we go on: it is <strong>greedy</strong>. Once D and E are merged they can never be separated, even if later merges would make a different arrangement better. An early mistake, often caused by a single noisy row, is permanent.</p>

  <h2 id="hc-single"><span class="num">03</span>Single Linkage</h2>
  <p><strong>Single linkage</strong> says the distance between two groups is the distance between their <em>closest</em> members: L(G, H) = min over x in G and y in H of d(x, y). Think of two housing colonies that count as "near" if any one house in the first is near any one house in the second; one shared wall is enough.</p>
  <p>By hand on the branches. Step 1 merges D and E at 1.41. The new distances take the smaller of the two old ones: {D, E} to A is min(7.21, 7.07) = 7.07; to B is min(4.00, 3.16) = 3.16; to C is min(6.71, 5.39) = 5.39. Step 2: the smallest entry is now {D, E} to B at 3.16 (it beats B–C at 3.61), so B joins at 3.16. Its distances become {B, D, E} to A = min(4.47, 7.07) = 4.47 and to C = min(3.61, 5.39) = 3.61. Step 3: C joins at 3.61. Step 4: A joins at 4.47.</p>
  <p>The function below is a literal translation of the merge loop. It keeps a dictionary of distances between groups, repeatedly finds the smallest, computes the distances from the new group with the linkage rule, deletes the two old groups, and prints the table after each merge:</p>
<div class="fx" data-lang="py">def agglomerate(D, names, linkage):
    clusters = {n: [n] for n in names}                                 # every branch starts alone
    d = {(a, b): D[i, j] for i, a in enumerate(names) for j, b in enumerate(names) if i &lt; j}
    get = lambda a, b: d[(a, b)] if (a, b) in d else d[(b, a)]
    while len(clusters) &gt; 1:
        a, b = min(d, key=d.get)                                       # the closest pair of groups
        h = d[(a, b)]
        new = "".join(sorted(a + b))
        na, nb = len(clusters[a]), len(clusters[b])
        for c in [c for c in clusters if c not in (a, b)]:             # distance from new group to each other group
            dac, dbc = get(a, c), get(b, c)
            if linkage == "single":   v = min(dac, dbc)
            if linkage == "complete": v = max(dac, dbc)
            if linkage == "average":  v = (na * dac + nb * dbc) / (na + nb)
            d[(new, c)] = v
        d = {k: v for k, v in d.items() if a not in k and b not in k}  # drop the two old groups
        clusters[new] = clusters.pop(a) + clusters.pop(b)
        print(f"merge {a} + {b} at {h:.2f}  -&gt;  " + ", ".join(f"d({k[0]},{k[1]})={v:.2f}" for k, v in sorted(d.items())))

agglomerate(D, names, "single")</div>
  <div class="fx" data-lang="text">merge D + E at 1.41  -&gt;  d(A,B)=4.47, d(A,C)=7.00, d(B,C)=3.61, d(DE,A)=7.07, d(DE,B)=3.16, d(DE,C)=5.39
merge DE + B at 3.16  -&gt;  d(A,C)=7.00, d(BDE,A)=4.47, d(BDE,C)=3.61
merge BDE + C at 3.61  -&gt;  d(BCDE,A)=4.47
merge BCDE + A at 4.47  -&gt;</div>
  <p>Every printed number matches the hand work. Now look at the shape of the story: one group grows by swallowing one branch at a time, first B, then C, then A. C joined because it is close to B, even though it is 6.71 km from D, a member of the same group. This is called <strong>chaining</strong>: single linkage joins groups through a sequence of close neighbours, so it can follow long, curved, chain-like shapes, which is its strength on clean data such as two interleaved half-moons. It is also its great weakness: a few noisy rows lying between two real groups act as stepping stones and join them at a low height (section 09 shows how badly). Single linkage has a neat equivalent: its tree is exactly the <strong>minimum spanning tree</strong> of the rows (the shortest set of edges connecting all of them), and cutting the longest edges gives the groups.</p>

  <h2 id="hc-complete"><span class="num">04</span>Complete &amp; Average Linkage</h2>
  <p>Single linkage looked only at the closest pair, and groups grew long and thin. Two other natural rules look at more of each group.</p>
  <p><strong>Complete linkage</strong> uses the <em>farthest</em> pair: L(G, H) = max d(x, y). Two groups are only as close as their most distant members, so a group can only be joined when everything in it is close. By hand: after D and E merge at 1.41, {D, E} to A is max(7.21, 7.07) = 7.21; to B is max(4.00, 3.16) = 4.00; to C is max(6.71, 5.39) = 6.71. Now B is 4.00 from {D, E} but only 3.61 from C, so step 2 is different from single linkage: B and C merge at 3.61. Then {B, C} to {D, E} is max(4.00, 6.71) = 6.71, and they merge at 6.71; finally A joins at 7.21. We get two compact pairs, {B, C} and {D, E}, and a big jump in height to join them. Complete linkage tends to produce compact groups of similar diameter, but one far-away member makes its whole group look far from everything, so it is sensitive to outliers in the opposite way to single linkage.</p>
  <p><strong>Average linkage</strong> (also called UPGMA, "unweighted pair group method with arithmetic mean") uses the average over all pairs: L(G, H) = the mean of d(x, y) over all |G| × |H| pairs. When groups of sizes nᵢ and nⱼ merge, the distance from the new group to another group k is the size-weighted average (nᵢ·d(i, k) + nⱼ·d(j, k)) / (nᵢ + nⱼ). By hand: {D, E} to B is (4.00 + 3.16)/2 = 3.58, which beats B–C (3.61) by a whisker, so B joins {D, E} at 3.58. Then {B, D, E} to C is (2 × 6.05 + 3.61)/3 = 5.23, so C joins at 5.23, and A at 6.44. The same function as before, with the other two rules:</p>
<div class="fx" data-lang="py">for link in ["complete", "average"]:
    print(f"--- {link}")
    agglomerate(D, names, link)</div>
  <div class="fx" data-lang="text">--- complete
merge D + E at 1.41  -&gt;  d(A,B)=4.47, d(A,C)=7.00, d(B,C)=3.61, d(DE,A)=7.21, d(DE,B)=4.00, d(DE,C)=6.71
merge B + C at 3.61  -&gt;  d(BC,A)=7.00, d(BC,DE)=6.71, d(DE,A)=7.21
merge BC + DE at 6.71  -&gt;  d(BCDE,A)=7.21
merge BCDE + A at 7.21  -&gt;  
--- average
merge D + E at 1.41  -&gt;  d(A,B)=4.47, d(A,C)=7.00, d(B,C)=3.61, d(DE,A)=7.14, d(DE,B)=3.58, d(DE,C)=6.05
merge DE + B at 3.58  -&gt;  d(A,C)=7.00, d(BDE,A)=6.25, d(BDE,C)=5.23
merge BDE + C at 5.23  -&gt;  d(BCDE,A)=6.44
merge BCDE + A at 6.44  -&gt;</div>
  <p>Average linkage sits between the other two. Its merge <em>order</em> here matches single linkage (B, then C, then A), but its <em>heights</em> (3.58, 5.23, 6.44) are much larger, closer to complete linkage, because far members now count. It is a sensible general-purpose choice, and, as section 07 shows, it usually produces the tree that best preserves the original distances. A variant called <strong>weighted</strong> linkage (WPGMA) averages the two old distances without size weights.</p>

  <h2 id="hc-ward"><span class="num">05</span>Ward's Method</h2>
  <p>Min, max and mean are all reasonable rules, but none of them is tied to a goal. K-Means had a clear goal: small within-cluster sum of squares (WCSS), the total squared distance of rows to their group's centre. Can a merge loop pursue the same goal, one merge at a time?</p>
  <p><strong>Ward's method</strong> (Ward, 1963) does exactly that: at each step it merges the two groups whose union <strong>increases WCSS the least</strong>. Merging always increases WCSS (the new centre sits between the two old ones), and the increase has a simple closed form that needs only the sizes and centres of the two groups:</p>
  <p style="text-align:center"><strong>Δ(G, H) = (n_G · n_H / (n_G + n_H)) · ‖c_G − c_H‖²</strong></p>
  <p>Large groups and distant centres make Δ large, so Ward prefers merging small groups that are close. Think of a teacher combining small study groups so that each combined group stays as tight-knit as possible: she always combines the two groups that disturb the overall tightness least. scipy reports the merge height as √(2Δ), chosen so that for two single rows it equals their ordinary distance (two rows d apart give Δ = d²/2).</p>
  <p>By hand on the branches. Step 1: D and E are single rows 1.41 apart, so Δ = ½ × 2 = 1, the cheapest possible merge. Step 2: the candidates include B + C with Δ = ½ × 13 = 6.50, and B + {D, E}, where {D, E} has centre (5.5, 4.5), so Δ = (1·2/3) × ((2 − 5.5)² + (4 − 4.5)²) = ⅔ × 12.5 = 8.33. B + C is cheaper, so Ward, like complete linkage, makes the pair {B, C}. Step 3: three groups remain, {A}, {B, C} with centre (1, 5.5) and {D, E}. A + {B, C} costs (1·2/3) × (1 + 30.25) = 20.83; {B, C} + {D, E} costs (2·2/4) × (20.25 + 1) = 21.25. A joins {B, C}, narrowly. Step 4: {A, B, C}, with centre (0.67, 3.67), joins {D, E} at Δ = 28.87. So Ward's two-group answer is {A, B, C} and {D, E}, different from all three earlier linkages, which all left A on its own.</p>
<div class="fx" data-lang="py">def ward_cost(G, H):                                   # increase in WCSS if groups G and H merge
    g, h = X[[names.index(c) for c in G]], X[[names.index(c) for c in H]]
    return len(g) * len(h) / (len(g) + len(h)) * ((g.mean(0) - h.mean(0)) ** 2).sum()

for G, H in [("D", "E"), ("B", "C"), ("B", "DE"), ("A", "BC"), ("BC", "DE"), ("ABC", "DE")]:
    dw = ward_cost(G, H)
    print(f"Delta({G},{H}) = {dw:7.3f}   height sqrt(2*Delta) = {np.sqrt(2 * dw):.3f}")</div>
  <div class="fx" data-lang="text">Delta(D,E) =   1.000   height sqrt(2*Delta) = 1.414
Delta(B,C) =   6.500   height sqrt(2*Delta) = 3.606
Delta(B,DE) =   8.333   height sqrt(2*Delta) = 4.082
Delta(A,BC) =  20.833   height sqrt(2*Delta) = 6.455
Delta(BC,DE) =  21.250   height sqrt(2*Delta) = 6.519
Delta(ABC,DE) =  28.867   height sqrt(2*Delta) = 7.598</div>
  <p>A neat check: the four merge costs add up to the total sum of squares of the data. 1 + 6.5 + 20.83 + 28.87 = 57.2, and the squared distances of the five branches from their overall mean (2.6, 4) also add up to 57.2. Every merge spends some of that total, and Ward spends it as slowly as possible. Here is scipy's whole tree for all four linkages; ids 0 to 4 are A to E, and each merge creates a new id from 5 upwards:</p>
<div class="fx" data-lang="py">from scipy.cluster.hierarchy import linkage
for method in ["single", "complete", "average", "ward"]:
    Z = linkage(X, method=method)                      # one row per merge: [id1, id2, height, size]
    print(f"{method:9s}", [f"{int(a)}+{int(b)} @ {h:.3f}" for a, b, h, n in Z])</div>
  <div class="fx" data-lang="text">single    ['3+4 @ 1.414', '1+5 @ 3.162', '2+6 @ 3.606', '0+7 @ 4.472']
complete  ['3+4 @ 1.414', '1+2 @ 3.606', '5+6 @ 6.708', '0+7 @ 7.211']
average   ['3+4 @ 1.414', '1+5 @ 3.581', '2+6 @ 5.233', '0+7 @ 6.439']
ward      ['3+4 @ 1.414', '1+2 @ 3.606', '0+6 @ 6.455', '5+7 @ 7.598']</div>
  <p>Ward's row reads: 3 + 4 (D, E) becomes id 5; 1 + 2 (B, C) becomes id 6; 0 + 6 (A joins B, C) at 6.455 becomes id 7; and 5 + 7 joins everything at 7.598, exactly the hand values. Because Ward minimises the same quantity as K-Means, it shares K-Means' taste for compact, round, similar-sized groups, and a Ward cut is often used to give K-Means its starting centres. It is also sklearn's default linkage. Its restriction follows from its formula: it needs centres and squared Euclidean distances, so it only works with Euclidean distance on real coordinates, never with a precomputed Gower or cosine matrix.</p>

  <h2 id="hc-lw"><span class="num">06</span>One Update Formula: Lance–Williams</h2>
  <p>We now have four rules, and so far each needed its own code. After merging groups i and j, every rule needs the distance from the new group to every other group k. Can that number be computed from the three numbers already in the table, d(i, k), d(j, k) and d(i, j), without going back to the raw rows? Lance and Williams (1967) showed that all the common linkages fit one formula:</p>
  <p style="text-align:center"><strong>d(i∪j, k) = αᵢ·d(i, k) + αⱼ·d(j, k) + β·d(i, j) + γ·|d(i, k) − d(j, k)|</strong></p>
  <p>Only the four coefficients change. For single linkage they are ½, ½, 0, −½, because ½(a + b) − ½|a − b| is always the smaller of a and b; for complete linkage ½, ½, 0, +½, which gives the larger. For average linkage they are the size shares nᵢ/(nᵢ + nⱼ) and nⱼ/(nᵢ + nⱼ), with β = γ = 0. For Ward, working on squared distances with N = nᵢ + nⱼ + n_k, they are (nᵢ + n_k)/N, (nⱼ + n_k)/N, −n_k/N and 0. Checking our first update for B: single gives ½ × 4.00 + ½ × 3.16 − ½ × 0.84 = 3.58 − 0.42 = 3.16, and complete gives 3.58 + 0.42 = 4.00. Ward on squared distances (all sizes 1, N = 3) gives ⅔ × 16 + ⅔ × 10 − ⅓ × 2 = 16.67, a height of √16.67 = 4.08, the same as √(2 × 8.33) from section 05.</p>
  <p>This is why one program can offer every linkage: the merge loop stays the same and only four numbers change. It also gives us a compact from-scratch implementation that covers all four linkages, which we check against scipy on our branches and on 40 random points:</p>
<div class="fx" data-lang="py">def lw(method, ni, nj, nk):                            # Lance-Williams coefficients
    if method == "single":   return 0.5, 0.5, 0.0, -0.5
    if method == "complete": return 0.5, 0.5, 0.0, 0.5
    if method == "average":  return ni / (ni + nj), nj / (ni + nj), 0.0, 0.0
    if method == "ward":                               # works on squared distances
        t = ni + nj + nk
        return (ni + nk) / t, (nj + nk) / t, -nk / t, 0.0

def my_linkage(X, method):
    Dm = squareform(pdist(X)) ** (2 if method == "ward" else 1)
    size = {i: 1 for i in range(len(X))}               # group id -&gt; number of rows
    dist = {(i, j): Dm[i, j] for i in range(len(X)) for j in range(i + 1, len(X))}
    get = lambda a, b: dist[(min(a, b), max(a, b))]
    Z, nxt = [], len(X)
    while len(size) &gt; 1:
        (i, j) = min(dist, key=dist.get); h = dist[(i, j)]
        ni, nj = size.pop(i), size.pop(j)
        for k, nk in size.items():                     # one formula updates every remaining distance
            ai, aj, b, g = lw(method, ni, nj, nk)
            dik, djk = get(i, k), get(j, k)
            dist[(k, nxt)] = ai * dik + aj * djk + b * h + g * abs(dik - djk)
        dist = {key: v for key, v in dist.items() if i not in key and j not in key}
        Z.append([i, j, np.sqrt(h) if method == "ward" else h, ni + nj])
        size[nxt] = ni + nj; nxt += 1
    return np.array(Z)

for method in ["single", "complete", "average", "ward"]:
    mine = my_linkage(X, method)
    print(f"{method:9s} heights {mine[:, 2].round(3).tolist()}  match scipy: {np.allclose(mine[:, 2], linkage(X, method)[:, 2])}")
Xr = np.random.default_rng(1).normal(size=(40, 3))
print("40 random points, all four match:",
      all(np.allclose(my_linkage(Xr, m)[:, 2], linkage(Xr, m)[:, 2]) for m in ["single", "complete", "average", "ward"]))</div>
  <div class="fx" data-lang="text">single    heights [1.414, 3.162, 3.606, 4.472]  match scipy: True
complete  heights [1.414, 3.606, 6.708, 7.211]  match scipy: True
average   heights [1.414, 3.581, 5.233, 6.439]  match scipy: True
ward      heights [1.414, 3.606, 6.455, 7.598]  match scipy: True
40 random points, all four match: True</div>
  <p>All four reproduce the hand-computed heights and match scipy exactly. This naive version scans the whole table at every merge, so it costs O(n³) time; scipy uses cleverer algorithms that bring the time down to O(n²). (The older <strong>centroid</strong> linkage, the distance between group means, also fits the formula, but it has a problem we meet in section 09.)</p>

  <h2 id="hc-dendro"><span class="num">07</span>The Dendrogram</h2>
  <p>Four lists of merges and heights are hard to compare by reading numbers. A <strong>dendrogram</strong> draws a merge history as a tree: the rows are placed along the bottom, and each merge is drawn as an upside-down U connecting the two groups, with its horizontal bar at the merge height. For complete linkage, the D–E bar sits at 1.41, the B–C bar at 3.61, a bar at 6.71 joins those two, and the final bar at 7.21 brings in A. Here are all four trees side by side:</p>
<figure class="viz"><svg viewBox="0 0 680 230" width="680"><text x="97.5" y="14" text-anchor="middle" font-size="12" font-weight="700">single</text><line x1="28" y1="28" x2="28" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="24" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="24" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="24" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="24" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="24" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="124,190 124,161 153,161 153,190" fill="none" class="sb" stroke-width="2"/><text x="139" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="96,190 96,126 139,126 139,161" fill="none" class="sb" stroke-width="2"/><text x="117" y="122" text-anchor="middle" font-size="9.5" class="tm">3.16</text><polyline points="67,190 67,117 117,117 117,126" fill="none" class="sb" stroke-width="2"/><text x="92" y="113" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="38,190 38,99 92,99 92,117" fill="none" class="sb" stroke-width="2"/><text x="65" y="95" text-anchor="middle" font-size="9.5" class="tm">4.47</text><text x="38" y="204" text-anchor="middle" font-size="11.5">A</text><text x="67" y="204" text-anchor="middle" font-size="11.5">C</text><text x="96" y="204" text-anchor="middle" font-size="11.5">B</text><text x="124" y="204" text-anchor="middle" font-size="11.5">D</text><text x="153" y="204" text-anchor="middle" font-size="11.5">E</text><text x="262.5" y="14" text-anchor="middle" font-size="12" font-weight="700">complete</text><line x1="193" y1="28" x2="193" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="189" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="189" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="189" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="189" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="189" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="232,190 232,161 260,161 260,190" fill="none" class="sb" stroke-width="2"/><text x="246" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="289,190 289,117 318,117 318,190" fill="none" class="sb" stroke-width="2"/><text x="304" y="113" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="246,161 246,54 304,54 304,117" fill="none" class="sb" stroke-width="2"/><text x="275" y="50" text-anchor="middle" font-size="9.5" class="tm">6.71</text><polyline points="203,190 203,44 275,44 275,54" fill="none" class="sb" stroke-width="2"/><text x="239" y="40" text-anchor="middle" font-size="9.5" class="tm">7.21</text><text x="203" y="204" text-anchor="middle" font-size="11.5">A</text><text x="232" y="204" text-anchor="middle" font-size="11.5">D</text><text x="260" y="204" text-anchor="middle" font-size="11.5">E</text><text x="289" y="204" text-anchor="middle" font-size="11.5">B</text><text x="318" y="204" text-anchor="middle" font-size="11.5">C</text><text x="427.5" y="14" text-anchor="middle" font-size="12" font-weight="700">average</text><line x1="358" y1="28" x2="358" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="354" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="354" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="354" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="354" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="354" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="454,190 454,161 483,161 483,190" fill="none" class="sb" stroke-width="2"/><text x="469" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="426,190 426,117 469,117 469,161" fill="none" class="sb" stroke-width="2"/><text x="447" y="113" text-anchor="middle" font-size="9.5" class="tm">3.58</text><polyline points="397,190 397,84 447,84 447,117" fill="none" class="sb" stroke-width="2"/><text x="422" y="80" text-anchor="middle" font-size="9.5" class="tm">5.23</text><polyline points="368,190 368,60 422,60 422,84" fill="none" class="sb" stroke-width="2"/><text x="395" y="56" text-anchor="middle" font-size="9.5" class="tm">6.44</text><text x="368" y="204" text-anchor="middle" font-size="11.5">A</text><text x="397" y="204" text-anchor="middle" font-size="11.5">C</text><text x="426" y="204" text-anchor="middle" font-size="11.5">B</text><text x="454" y="204" text-anchor="middle" font-size="11.5">D</text><text x="483" y="204" text-anchor="middle" font-size="11.5">E</text><text x="592.5" y="14" text-anchor="middle" font-size="12" font-weight="700">ward</text><line x1="523" y1="28" x2="523" y2="190" stroke="currentColor" stroke-opacity="0.3"/><text x="519" y="194" text-anchor="end" class="tm" font-size="9">0</text><text x="519" y="154" text-anchor="end" class="tm" font-size="9">2</text><text x="519" y="113" text-anchor="end" class="tm" font-size="9">4</text><text x="519" y="72" text-anchor="end" class="tm" font-size="9">6</text><text x="519" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="533,190 533,161 562,161 562,190" fill="none" class="sb" stroke-width="2"/><text x="547" y="157" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="619,190 619,117 648,117 648,190" fill="none" class="sb" stroke-width="2"/><text x="634" y="113" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="590,190 590,59 634,59 634,117" fill="none" class="sb" stroke-width="2"/><text x="612" y="55" text-anchor="middle" font-size="9.5" class="tm">6.45</text><polyline points="547,161 547,36 612,36 612,59" fill="none" class="sb" stroke-width="2"/><text x="580" y="32" text-anchor="middle" font-size="9.5" class="tm">7.60</text><text x="533" y="204" text-anchor="middle" font-size="11.5">D</text><text x="562" y="204" text-anchor="middle" font-size="11.5">E</text><text x="590" y="204" text-anchor="middle" font-size="11.5">A</text><text x="619" y="204" text-anchor="middle" font-size="11.5">B</text><text x="648" y="204" text-anchor="middle" font-size="11.5">C</text></svg><figcaption>The same five branches under four linkages (height = merge distance, km for single/complete/average, √(2Δ) for Ward). Single and average chain B, then C, then A onto {D, E}; complete makes {B, C} and {D, E} and isolates A; Ward groups A with {B, C}.</figcaption></figure>
  <p>Reading a dendrogram comes down to three habits. The <strong>height of a bar</strong> is how far apart the two groups were when they merged: low bars mean tight groups, a tall bar means two genuinely different groups were forced together. A <strong>long vertical stretch with no bars</strong> means a range of cut heights where the grouping does not change, a sign of a stable, natural number of groups (complete linkage has one between 3.61 and 6.71). And the <strong>left-to-right order of leaves is partly arbitrary</strong>: every U can be flipped without changing the tree, so two leaves drawn side by side are not necessarily similar. In the complete-linkage tree, A is drawn next to D, yet A is the branch farthest from D; only the joining height tells you that.</p>
  <p>The tree also implies a distance of its own. The <strong>cophenetic distance</strong> between two rows is the height at which they first end up in the same group. Under complete linkage, B and C have cophenetic distance 3.61 (their own merge), but A and B only meet at the root, 7.21, although their real distance is 4.47. The <strong>cophenetic correlation</strong> is the correlation between all the real distances and all the cophenetic distances; it measures how faithfully the tree preserves the original distances, and it is a good way to compare linkages on the same data:</p>
<div class="fx" data-lang="py">from scipy.cluster.hierarchy import dendrogram, cophenet
for method in ["single", "complete", "average", "ward"]:
    Z = linkage(X, method=method)
    leaves = dendrogram(Z, no_plot=True, labels=names)["ivl"]       # left-to-right leaf order
    c, coph = cophenet(Z, pdist(X))                                 # correlation, cophenetic distances
    print(f"{method:9s} leaves {''.join(leaves)}  cophenetic corr {c:.3f}  coph(A,B) = {squareform(coph)[0, 1]:.2f}")</div>
  <div class="fx" data-lang="text">single    leaves ACBDE  cophenetic corr 0.825  coph(A,B) = 4.47
complete  leaves ADEBC  cophenetic corr 0.746  coph(A,B) = 7.21
average   leaves ACBDE  cophenetic corr 0.842  coph(A,B) = 6.44
ward      leaves DEABC  cophenetic corr 0.680  coph(A,B) = 6.45</div>
  <p>Average linkage preserves our distances best (0.842), then single (0.825), complete (0.746) and Ward (0.680). That pattern is typical: average linkage tends to give the most faithful tree, while Ward gives up some faithfulness to get compact groups. The leaf orders printed here are the left-to-right orders scipy draws; <code>dendrogram(Z, labels=names)</code> with matplotlib produces the picture itself.</p>

  <h2 id="hc-cut"><span class="num">08</span>Cutting the Tree</h2>
  <p>The bank still needs an actual list of zones. Turning a tree into flat groups is called <strong>cutting</strong> it, and there are three common ways. You can ask for a number of groups k, when there is a budget ("we can afford 3 vans"). You can cut at a height t, when the height has a real meaning ("no zone may have two branches more than 5 km apart" under complete linkage): draw a horizontal line at t, undo every merge above it, and the number of vertical lines the line crosses is k. Or you can let the data choose by cutting in the <strong>largest gap</strong> between successive merge heights, the most stable k.</p>
<figure class="viz"><svg viewBox="0 0 280 260" width="280"><text x="145.0" y="14" text-anchor="middle" font-size="12" font-weight="700">complete</text><line x1="28" y1="28" x2="28" y2="220" stroke="currentColor" stroke-opacity="0.3"/><text x="24" y="224" text-anchor="end" class="tm" font-size="9">0</text><text x="24" y="176" text-anchor="end" class="tm" font-size="9">2</text><text x="24" y="128" text-anchor="end" class="tm" font-size="9">4</text><text x="24" y="80" text-anchor="end" class="tm" font-size="9">6</text><text x="24" y="32" text-anchor="end" class="tm" font-size="9">8</text><polyline points="90,220 90,186 143,186 143,220" fill="none" class="sb" stroke-width="2"/><text x="117" y="182" text-anchor="middle" font-size="9.5" class="tm">1.41</text><polyline points="196,220 196,133 248,133 248,220" fill="none" class="sb" stroke-width="2"/><text x="222" y="129" text-anchor="middle" font-size="9.5" class="tm">3.61</text><polyline points="117,186 117,59 222,59 222,133" fill="none" class="sb" stroke-width="2"/><text x="169" y="55" text-anchor="middle" font-size="9.5" class="tm">6.71</text><polyline points="38,220 38,47 169,47 169,59" fill="none" class="sb" stroke-width="2"/><text x="104" y="43" text-anchor="middle" font-size="9.5" class="tm">7.21</text><text x="38" y="234" text-anchor="middle" font-size="11.5">A</text><text x="90" y="234" text-anchor="middle" font-size="11.5">D</text><text x="143" y="234" text-anchor="middle" font-size="11.5">E</text><text x="196" y="234" text-anchor="middle" font-size="11.5">B</text><text x="248" y="234" text-anchor="middle" font-size="11.5">C</text><line x1="28" y1="100" x2="268" y2="100" class="sr" stroke-width="1.5" stroke-dasharray="5 3"/><text x="266" y="96" text-anchor="end" class="tr" font-size="9.5">cut 5.0</text></svg><figcaption>Complete linkage cut at height 5.0 km. The red line crosses three vertical lines: zones {A}, {B, C}, {D, E}.</figcaption></figure>
  <p>By hand with complete linkage, the heights are 1.41, 3.61, 6.71 and 7.21, so the gaps between successive merges are 2.19, 3.10 and 0.50. The largest gap, 3.10, comes after the second merge, leaving 5 − 2 = 3 groups. Any cut height between 3.61 and 6.71 gives that same answer, and 5.0 sits in the middle of the range. scipy's <code>fcluster</code> does all of these cuts:</p>
<div class="fx" data-lang="py">from scipy.cluster.hierarchy import inconsistent
Zc = linkage(X, method="complete")
print("ask for k=3     :", dict(zip(names, fcluster(Zc, 3, criterion="maxclust").tolist())))
for t in [2.0, 5.0, 7.0]:
    print(f"cut at height {t}:", dict(zip(names, fcluster(Zc, t, criterion="distance").tolist())))
h = Zc[:, 2]
gaps = np.diff(h)
print("heights", h.round(2), " gaps", gaps.round(2), " -&gt; k =", len(X) - (gaps.argmax() + 1))
print("inconsistency coefficient per merge:", inconsistent(Zc, d=2)[:, 3].round(3))</div>
  <div class="fx" data-lang="text">ask for k=3     : {'A': 3, 'B': 2, 'C': 2, 'D': 1, 'E': 1}
cut at height 2.0: {'A': 4, 'B': 2, 'C': 3, 'D': 1, 'E': 1}
cut at height 5.0: {'A': 3, 'B': 2, 'C': 2, 'D': 1, 'E': 1}
cut at height 7.0: {'A': 2, 'B': 1, 'C': 1, 'D': 1, 'E': 1}
heights [1.41 3.61 6.71 7.21]  gaps [2.19 3.1  0.5 ]  -&gt; k = 3
inconsistency coefficient per merge: [0.    0.    1.052 0.707]</div>
  <p>Asking for k = 3 and cutting at 5.0 give the same zones, {A}, {B, C}, {D, E}; a cut at 2.0 gives four zones (only D and E joined) and 7.0 gives two. The last line shows a more formal version of the "big jump" idea, the <strong>inconsistency coefficient</strong>: for each merge it compares the merge height with the heights of the merges just below it, (height − their mean) / their standard deviation. For the 6.71 merge the merges within two levels are 6.71, 3.61 and 1.41 (mean 3.91, standard deviation 2.66), giving (6.71 − 3.91)/2.66 = 1.05. A high value means "this merge joins things much farther apart than the merges that built them", a natural place to cut, and <code>fcluster(Z, t, criterion="inconsistent")</code> cuts there.</p>
  <p>The k-choosing tools from <a class="xref" data-note="ml_kmeans">K-Means</a>, such as the silhouette score, also work here: compute it for each candidate cut and pick the best (see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>). The advantage over K-Means is that all candidate cuts come from one tree, so the groups for 3 and 4 zones are guaranteed to nest. One caution: different linkages produce heights on different scales (Ward's heights are √(2Δ), not kilometres), so a threshold like "5 km" only means kilometres for single, complete and average linkage. Compare cuts within one tree, never across linkages.</p>

  <h2 id="hc-chain"><span class="num">09</span>Chaining &amp; Linkage Behaviour</h2>
  <p>On five branches the linkages disagreed only mildly. On real data with noise and odd shapes the differences become dramatic. Here are two clear groups of 60 points (two towns), joined by a thin line of 12 points between them (a road of houses). Each linkage is asked for two groups:</p>
<div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score as ari
rng = np.random.default_rng(0)
left, right = rng.normal([0, 0], 0.5, (60, 2)), rng.normal([6, 0], 0.5, (60, 2))   # two towns
bridge = np.c_[np.linspace(0.8, 5.2, 12), np.zeros(12)]                               # a road of houses between them
Xc = np.vstack([left, right, bridge])
yc = np.r_[np.zeros(60), np.ones(60), (np.linspace(0.8, 5.2, 12) &gt; 3).astype(int)]
for link in ["single", "complete", "average", "ward"]:
    lab = AgglomerativeClustering(2, linkage=link).fit_predict(Xc)
    print(f"{link:9s} group sizes {np.bincount(lab)}  ARI {ari(yc, lab):.2f}")</div>
  <div class="fx" data-lang="text">single    group sizes [131   1]  ARI 0.00
complete  group sizes [67 65]  ARI 0.97
average   group sizes [67 65]  ARI 0.97
ward      group sizes [68 64]  ARI 0.94</div>
  <p>Single linkage returns one group of 131 points and one lonely point: ARI 0.00, completely wrong. The bridge links each house to the next, so the two towns become one long chain, and the "second group" is just the most isolated point in the data. This is the chaining effect from section 03 at full strength. Complete and average linkage ignore the thin bridge (0.97), because a group's distance depends on its far members too, and Ward does nearly as well (0.94).</p>
  <p>Each linkage has a personality worth remembering. Single linkage finds long, curved, chain-like groups (moons and rings, where it scored a perfect 1.00 in <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>) but collapses with noise and bridges. Complete linkage finds compact groups of similar diameter, but is pushed around by outliers and breaks large elongated groups into pieces. Average linkage is a compromise that gives the most faithful tree but struggles when groups have very different densities. Ward finds round, similar-sized groups like K-Means does, and fails on curved shapes and very unequal sizes like K-Means does.</p>
  <p>One more behaviour separates the standard linkages from the rest. With single, complete, average and Ward, merge heights only ever go up, so the dendrogram is clean and "cut at height t" is well defined. <strong>Centroid</strong> linkage, which uses the distance between group means, can break this. Take three points A (0, 0), B (2, 0) and C (1, 1.8). A and B, 2 apart, merge first. The centre of {A, B} is (1, 0), only 1.8 from C, so the next merge happens at a lower height than the first:</p>
<div class="fx" data-lang="py">T = np.array([[0, 0], [2, 0], [1, 1.8]])                 # an almost-equilateral triangle
for method in ["centroid", "average"]:
    print(f"{method:8s} merge heights {linkage(T, method=method)[:, 2].round(3)}")</div>
  <div class="fx" data-lang="text">centroid merge heights [2.  1.8]
average  merge heights [2.    2.059]</div>
  <p>Centroid heights go 2.0 then 1.8: an <strong>inversion</strong>, which makes the dendrogram cross itself and makes height cuts meaningless. Average linkage on the same points goes 2.0 then 2.059, always upward. Linkages that never invert are called <strong>monotone</strong>; prefer the four standard ones. Finally, remember that hierarchical clustering has no noise label: outliers are forced into the tree, usually joining last as singletons near the top, which is how single linkage produced a "group" of one point above. Remove outliers first, or use <a class="xref" data-note="ml_dbscan">DBSCAN</a>, which labels them as noise.</p>

  <h2 id="hc-div"><span class="num">10</span>Divisive Clustering</h2>
  <p>Agglomerative clustering builds the tree from the leaves up, and its early decisions are about small details: which two nearby rows to join first. Sometimes the big first split is what matters most ("which branches are fundamentally different from the rest?"), and then building from the top down is attractive. Divisive clustering starts with one group of everything and repeatedly splits a group in two. The difficulty is that the best way to split n rows into two groups is a search over 2ⁿ⁻¹ − 1 possibilities, so divisive methods use heuristics.</p>
  <p>The classic one is <strong>DIANA</strong> (DIvisive ANAlysis). It works like a club where one member storms out and others decide whether to follow. The member with the largest average distance to everyone else leaves first and starts a "splinter group". Then each remaining member compares their average distance to the rest with their average distance to the splinter group; anyone closer, on average, to the splinter group moves over. This repeats until nobody wants to move. For our branches, the average distance to the other four is A 6.44, B 3.81, C 5.67, D 4.83 and E 4.26, so A leaves first. Then every remaining branch's gain from moving (average distance to the rest minus distance to A) is negative, so nobody follows:</p>
<div class="fx" data-lang="py">avg = D.sum(1) / (len(X) - 1)                            # each branch's average distance to the others
print("average distance:", dict(zip(names, avg.round(2).tolist())))
splinter = [int(avg.argmax())]                           # the most isolated branch starts the splinter group
rest = [i for i in range(len(X)) if i not in splinter]
while True:
    gain = [D[i, [r for r in rest if r != i]].mean() - D[i, splinter].mean() for i in rest]
    print("  gain of moving", [names[r] for r in rest], "=", np.round(gain, 2).tolist())
    if max(gain) &lt;= 0: break                             # nobody is closer to the splinter group
    splinter.append(rest.pop(int(np.argmax(gain))))
print("first split:", [names[i] for i in splinter], "|", [names[i] for i in rest])</div>
  <div class="fx" data-lang="text">average distance: {'A': 6.44, 'B': 3.81, 'C': 5.67, 'D': 4.83, 'E': 4.26}
  gain of moving ['B', 'C', 'D', 'E'] = [-0.88, -1.77, -3.17, -3.75]
first split: ['A'] | ['B', 'C', 'D', 'E']</div>
  <p>The first split is {A} | {B, C, D, E}, the same top split that single, complete and average linkage produced from the bottom. DIANA then repeats on the larger piece. Another divisive method is <strong>bisecting K-Means</strong> (sklearn's <code>BisectingKMeans</code>, met in <a class="xref" data-note="ml_kmeans">K-Means</a>), which splits with 2-means and then splits the largest or loosest group again; it is fast and scales well. The two directions do not generally give the same tree: agglomerative tends to be better at fine, small groups and divisive at the big first splits.</p>

  <h2 id="hc-cost"><span class="num">11</span>Complexity &amp; Scaling Up</h2>
  <p>Five branches cost nothing. The bank has 50,000 ATMs. Does the merge loop survive? Memory is the first problem: the distance matrix holds n(n − 1)/2 numbers of 8 bytes each. Time is the second: the naive loop does n − 1 merges and scans up to n² entries for each, which is O(n³); better algorithms (SLINK for single linkage, nearest-neighbour chains for Ward, average and complete) bring the time down to O(n²), but memory stays O(n²) for every linkage except single.</p>
<div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering
from sklearn.neighbors import kneighbors_graph
from sklearn.datasets import make_moons
from sklearn.metrics import adjusted_rand_score as ari
for n in [1_000, 10_000, 50_000, 200_000]:
    print(f"n={n:&gt;7,}: distance matrix {n * (n - 1) // 2 * 8 / 1e6:9,.0f} MB")
Xm, ym = make_moons(400, noise=0.05, random_state=0)
conn = kneighbors_graph(Xm, n_neighbors=8, include_self=False)   # each point may only merge with its 8 neighbours
for link in ["average", "complete"]:
    for name, c in [("no constraint", None), ("8-NN graph", conn)]:
        lab = AgglomerativeClustering(2, linkage=link, connectivity=c).fit_predict(Xm)
        print(f"{link:8s} {name:13s} ARI on moons {ari(ym, lab):.2f}")</div>
  <div class="fx" data-lang="text">n=  1,000: distance matrix         4 MB
n= 10,000: distance matrix       400 MB
n= 50,000: distance matrix    10,000 MB
n=200,000: distance matrix   159,999 MB
average  no constraint ARI on moons 0.24
average  8-NN graph    ARI on moons 1.00
complete no constraint ARI on moons 0.28
complete 8-NN graph    ARI on moons 1.00</div>
  <p>The first four lines are the memory bill: 10,000 rows need 400 MB, 50,000 ATMs need 10 GB, and 2 lakh rows would need 160 GB. Compare <a class="xref" data-note="ml_kmeans">K-Means</a>, which only needs each row's distance to k centres. A rough rule is that hierarchical clustering suits up to about 10 to 20 thousand rows.</p>
  <p>The last four lines show the most useful trick, a <strong>connectivity constraint</strong>. sklearn can be told that only rows which are neighbours in a graph may merge, usually the k-nearest-neighbour graph built with <code>kneighbors_graph(X, 8)</code>. This makes the algorithm much faster, because only graph edges are candidates, and it also makes it follow the structure of the data: on the two moons, average and complete linkage jump from ARI 0.24 and 0.28 to a perfect 1.00 once merges must follow neighbour links. In image analysis the same idea lets only adjacent pixels merge.</p>
  <p>For truly large data people use hybrids. One is to run K-Means (or mini-batch K-Means) with a few hundred centres and then cluster those centres hierarchically, giving a dendrogram over millions of rows. Another is <strong>BIRCH</strong> (sklearn's <code>Birch</code>), which summarises the data into a compact tree of mini-clusters in one pass and then clusters the summaries. A third is to cluster a sample of, say, 10,000 rows and give every other row the label of its nearest group centre.</p>

  <h2 id="hc-tools"><span class="num">12</span>scipy and sklearn in Practice</h2>
  <p>scipy and sklearn both implement agglomerative clustering, with different strengths. scipy gives you the tree itself, which is what you want for dendrograms and exploration; sklearn gives you an estimator that fits into pipelines.</p>
  <p>In scipy, <code>linkage(X, method)</code> builds the tree from raw rows (or from a condensed distance vector made by <code>pdist</code>, which accepts metrics such as "euclidean", "cityblock", "cosine" and "jaccard"), with method one of single, complete, average, weighted, centroid, median or ward. It returns the <strong>linkage matrix</strong> Z, which has n − 1 rows, one per merge in order, each holding [id of group 1, id of group 2, height, number of rows in the new group]; ids 0 to n − 1 are the original rows and merge number m creates id n + m. Our Ward tree is [3, 4, 1.414, 2], [1, 2, 3.606, 2], [0, 6, 6.455, 3], [5, 7, 7.598, 5]. You have already used the other tools: <code>fcluster</code> to cut (section 08), <code>dendrogram</code> to draw (it has <code>truncate_mode="lastp"</code> for large trees and <code>color_threshold</code> to colour the groups below a cut), <code>cophenet</code> for the cophenetic correlation (section 07), and <code>inconsistent</code> for the inconsistency coefficient. <code>optimal_leaf_ordering</code> reorders leaves so that neighbours are similar, which makes heatmaps much more readable.</p>
  <p>sklearn's <code>AgglomerativeClustering</code> takes either <code>n_clusters</code> (cut by k) or <code>distance_threshold</code> (cut by height; then set <code>n_clusters=None</code>), a <code>linkage</code> ("ward" by default, "complete", "average" or "single"), a <code>metric</code> ("euclidean", "manhattan", "cosine" or "precomputed"; Ward allows only Euclidean), and an optional <code>connectivity</code> graph. After fitting it exposes <code>labels_</code>, <code>n_clusters_</code>, <code>children_</code> (the merge list) and, with <code>compute_distances=True</code>, <code>distances_</code> (the merge heights):</p>
<div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering
agg = AgglomerativeClustering(n_clusters=None, distance_threshold=5.0, linkage="complete",
                              compute_distances=True).fit(X)
print("clusters found:", agg.n_clusters_, "  labels:", dict(zip(names, agg.labels_.tolist())))
print("children_ :", agg.children_.tolist())
print("distances_:", agg.distances_.round(3).tolist())

cent = np.array([X[agg.labels_ == k].mean(0) for k in range(agg.n_clusters_)])   # no predict(): use centroids
new = np.array([[1, 1], [5.5, 4.0]])                                               # two new branches
print("new branches -&gt;", ((new[:, None] - cent[None]) ** 2).sum(2).argmin(1).tolist())</div>
  <div class="fx" data-lang="text">clusters found: 3   labels: {'A': 1, 'B': 0, 'C': 0, 'D': 2, 'E': 2}
children_ : [[3, 4], [1, 2], [5, 6], [0, 7]]
distances_: [1.414, 3.606, 6.708, 7.211]
new branches -&gt; [1, 2]</div>
  <p>A 5 km threshold with complete linkage gives the same three zones as scipy. <code>children_</code> is the merge list in scipy's id scheme and <code>distances_</code> the heights, so stacking them with the group sizes rebuilds scipy's Z and lets you draw a dendrogram of an sklearn model. There is no <code>predict</code>, because a tree is not a rule for new points. The usual fix is to compute each zone's centre and send a new branch to the nearest one: here (1, 1) goes to zone 1, {A}, and (5.5, 4) to zone 2, {D, E}. Training a KNN classifier on the cluster labels is the other common choice. With <code>metric="precomputed"</code> the estimator clusters any distance matrix, such as the Gower matrix in <a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>, as long as the linkage is not Ward.</p>
  <p>To place hierarchical clustering among its neighbours: it needs no k up front, gives a nested tree, is deterministic (K-Means and GMM depend on random starts), accepts any distance, and is ideal for small to medium data, taxonomies and pictures. <a class="xref" data-note="ml_kmeans">K-Means</a> scales to millions and labels new rows instantly but needs k and round groups. <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a> keep single linkage's ability to follow any shape, add a density test that labels lonely rows as noise and stops chaining through thin bridges, and scale much further; HDBSCAN is in fact a hierarchy built over densities. <a class="xref" data-note="ml_gmm">Gaussian mixtures</a> suit overlapping elliptical groups and give probabilities.</p>

  <h2 id="hc-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>A classic scipy mistake is passing the square n × n distance matrix to <code>linkage</code>. It accepts either raw rows or the condensed vector of n(n − 1)/2 distances, and a square matrix is silently read as n rows with n features each:</p>
<div class="fx" data-lang="py">print("wrong, square matrix:", linkage(D, "average")[:, 2].round(2))           # treated as 5 rows of 5 features
print("right, condensed     :", linkage(squareform(D), "average")[:, 2].round(2))</div>
  <div class="fx" data-lang="text">wrong, square matrix: [ 2.54  6.64  8.75 10.57]
right, condensed     : [1.41 3.58 5.23 6.44]</div>
  <p>The first tree is nonsense: scipy treated each row of distances as a point and measured distances between those rows (recent versions print a warning, which is easy to miss). Convert first with <code>squareform(D)</code>, and the heights are the correct average-linkage values from section 04.</p>
  <p>The other common mistakes have appeared along the way. Using single linkage on noisy data lets a thin bridge merge two real groups (ARI 0.00); prefer average, complete or Ward unless the data is clean and curved. Using Ward with a non-Euclidean matrix (Gower, cosine) is invalid, because Ward needs centres; use average or complete with <code>metric="precomputed"</code>. Reading similarity from leaf order is wrong; only joining heights matter. Comparing cut heights across linkages is meaningless, because Ward's heights are not distances. Running it on a lakh of rows asks for about 40 GB of memory; sample, use a connectivity graph, or cluster K-Means centres instead. Forgetting to scale lets the widest column decide every distance, just as in K-Means. And expecting a noise label leads to surprise singleton "groups" at the top of the tree.</p>

  <h2 id="hc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Hierarchical clustering</b>: a nested sequence of groupings, from n singletons to one group, drawn as a dendrogram.</li>
    <li><b>Agglomerative</b>: start with singletons, merge the closest pair n − 1 times. <b>Divisive</b>: start with one group and split (DIANA, bisecting K-Means).</li>
    <li><b>Linkage</b>: the rule for the distance between two groups; the main design choice.</li>
    <li><b>Dendrogram</b>: tree with each merge drawn at its height; leaf order is arbitrary.</li>
    <li><b>Cophenetic distance</b>: height where two rows first join; its correlation with real distances measures faithfulness.</li>
    <li><b>Chaining</b>: single linkage joining groups through a sequence of close in-between points.</li>
    <li><b>Inversion</b>: a later merge at a lower height (centroid, median linkage).</li>
  </ul>
  <h3>Linkages on our branches</h3>
  <table class="tbl">
    <tr><th>Linkage</th><th>Group distance</th><th>B to {D, E}</th><th>Heights</th><th>Personality</th></tr>
    <tr><td>Single</td><td>closest pair (min)</td><td>3.16</td><td>1.41, 3.16, 3.61, 4.47</td><td>chains; good for clean curves</td></tr>
    <tr><td>Complete</td><td>farthest pair (max)</td><td>4.00</td><td>1.41, 3.61, 6.71, 7.21</td><td>compact, equal diameters</td></tr>
    <tr><td>Average</td><td>mean of all pairs</td><td>3.58</td><td>1.41, 3.58, 5.23, 6.44</td><td>compromise; most faithful tree</td></tr>
    <tr><td>Ward</td><td>increase in WCSS</td><td>Δ 8.33 (height 4.08)</td><td>1.41, 3.61, 6.46, 7.60</td><td>round, similar sizes, like K-Means</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Ward cost</td><td>Δ(G, H) = (n_G·n_H / (n_G + n_H))·‖c_G − c_H‖²; height √(2Δ); Σ Δ = TSS (57.2)</td></tr>
    <tr><td>Lance–Williams</td><td>d(i∪j, k) = αᵢd(i,k) + αⱼd(j,k) + βd(i,j) + γ|d(i,k) − d(j,k)|</td></tr>
    <tr><td>Coefficients</td><td>single (½, ½, 0, −½); complete (½, ½, 0, ½); average (nᵢ/n, nⱼ/n, 0, 0); Ward on d²</td></tr>
    <tr><td>Inconsistency</td><td>(height − mean of nearby heights) / their std</td></tr>
    <tr><td>Cost</td><td>memory n(n − 1)/2 × 8 bytes; time O(n²) good, O(n³) naive</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from scipy.spatial.distance import pdist, squareform
from scipy.cluster.hierarchy import linkage, fcluster, dendrogram, cophenet
from sklearn.cluster import AgglomerativeClustering

Z = linkage(X, method="average")                 # or linkage(pdist(X, "cityblock"), "average")
labels = fcluster(Z, 3, criterion="maxclust")    # or fcluster(Z, 5.0, criterion="distance")
c, _ = cophenet(Z, pdist(X))                     # faithfulness of the tree
dendrogram(Z, labels=names)                      # draw (needs matplotlib)

agg = AgglomerativeClustering(n_clusters=None, distance_threshold=5.0,
                              linkage="complete", compute_distances=True).fit(X)
agg.labels_, agg.children_, agg.distances_
AgglomerativeClustering(3, metric="precomputed", linkage="average").fit(G)   # any distance matrix</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Single linkage chains through noise; centroid linkage can invert.</li>
    <li>Ward needs Euclidean coordinates; no precomputed matrices.</li>
    <li>Pass raw X or <code>squareform(D)</code> to <code>linkage</code>, never a square matrix.</li>
    <li>Leaf order means nothing; heights from different linkages are not comparable.</li>
    <li>n² memory: about 10–20 thousand rows at most.</li>
    <li>No noise label and no <code>predict</code>; merges are never undone.</li>
  </ul>

  <h2 id="hc-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is hierarchical clustering?</summary><div class="qa-body">A clustering method that builds a tree of nested groups rather than one flat answer. Agglomerative clustering starts with every row alone and repeatedly merges the two closest groups, recording the distance; cutting the resulting dendrogram at any level gives a flat clustering for that number of groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Agglomerative versus divisive clustering?</summary><div class="qa-body">Agglomerative is bottom-up: merge the closest pair of groups n − 1 times. Divisive is top-down: start with one group and split repeatedly (DIANA, bisecting K-Means). Agglomerative is standard because each step only needs the smallest entry in a table, while the best split is an exponential search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a linkage criterion? Name the main ones.</summary><div class="qa-body">It defines the distance between two groups from the distances between their rows. Single uses the closest pair, complete the farthest pair, average the mean of all pairs, and Ward the increase in within-cluster sum of squares caused by merging. For B against {D, E} they give 3.16, 4.00, 3.58 and a Ward cost of 8.33.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the chaining effect?</summary><div class="qa-body">Single linkage joins two groups if any one pair of members is close, so a sequence of in-between points can link distant groups into one long chain. Two groups joined by a 12-point bridge came out as 131 points plus one (ARI 0.00), while complete and average linkage scored 0.97.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Ward's method work, and how is it related to K-Means?</summary><div class="qa-body">At each step it merges the pair of groups whose union increases the within-cluster sum of squares least: Δ = (n_G·n_H/(n_G + n_H))·‖c_G − c_H‖². K-Means minimises the same quantity for one fixed k by iteration, while Ward does it greedily one merge at a time, so both prefer compact, round, similar-sized groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't Ward be used with cosine or Gower distance?</summary><div class="qa-body">Ward's cost uses group centres and squared Euclidean distances. With cosine or Gower there are no meaningful coordinates to average, so the cost is not defined consistently. Use average or complete linkage with a precomputed distance matrix instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a dendrogram?</summary><div class="qa-body">Each U-shaped join is drawn at the height where its two groups merged; low joins are tight groups and tall joins are very different groups. Long stretches with no joins indicate a stable number of groups. Leaf order is arbitrary, so only the joining height tells you how similar two rows are.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose where to cut the tree?</summary><div class="qa-body">Ask for a fixed k from a business constraint, cut at a height with real meaning, cut in the largest gap between successive merge heights (complete linkage: 3.61 to 6.71, giving 3 groups), use the inconsistency coefficient, or pick the cut with the best silhouette.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the cophenetic correlation coefficient?</summary><div class="qa-body">The correlation between the original pairwise distances and the cophenetic distances, where the cophenetic distance of two rows is the height at which they first join. It measures how faithfully the tree represents the data; on our branches average linkage scored 0.842 and Ward 0.680.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Lance–Williams formula?</summary><div class="qa-body">A single recurrence, d(i∪j, k) = αᵢd(i,k) + αⱼd(j,k) + βd(i,j) + γ|d(i,k) − d(j,k)|, that updates the distance from a merged group to every other group using only existing distances. Different coefficients give single, complete, average, Ward and centroid linkage, so one implementation serves them all.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an inversion in a dendrogram?</summary><div class="qa-body">A merge that happens at a lower height than an earlier merge, possible with centroid or median linkage. For A(0,0), B(2,0), C(1,1.8), A and B merge at 2, then their centre is only 1.8 from C. The tree crosses itself and height cuts lose meaning; single, complete, average and Ward are monotone and never invert.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the time and memory costs?</summary><div class="qa-body">Memory is O(n²) for the distance matrix: 50,000 rows need about 10 GB. Time is O(n³) for the naive loop and O(n²) with good algorithms such as SLINK and nearest-neighbour chains. That limits it to roughly 10 to 20 thousand rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you hierarchically cluster a million rows?</summary><div class="qa-body">Do not build the full matrix. Run (mini-batch) K-Means to a few hundred or thousand centres and cluster those hierarchically; or use BIRCH; or cluster a sample and assign the rest to the nearest group centre; or use a sparse connectivity graph so only neighbours can merge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a connectivity constraint do?</summary><div class="qa-body">It allows merges only between rows that are neighbours in a given graph, usually the k-nearest-neighbour graph. It makes the algorithm faster and structure-aware: on two half-moons, average and complete linkage went from ARI about 0.25 to 1.00 with an 8-neighbour graph.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>AgglomerativeClustering has no predict. How do you label a new row?</summary><div class="qa-body">Compute each cluster's centre (or medoid) and assign the new row to the nearest one, or train a KNN classifier on the cluster labels. The tree itself does not update, so re-cluster periodically if the data changes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hierarchical clustering versus K-Means: when do you choose which?</summary><div class="qa-body">Hierarchical needs no k up front, is deterministic, accepts any distance and shows nested structure, but costs O(n²) memory and cannot label new rows directly. K-Means needs k and round groups but scales to millions and predicts instantly. Use hierarchical for small data, taxonomies and custom distances; K-Means for large numeric data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are single linkage, the minimum spanning tree and DBSCAN related?</summary><div class="qa-body">Single linkage's tree is exactly the minimum spanning tree of the rows; cutting its longest edges gives the groups. DBSCAN also chains close neighbours, but only through dense core points, which stops chaining through thin bridges and labels isolated points as noise. HDBSCAN builds a single-linkage-style tree over a density-adjusted distance.</div></details>
</main>
`
});
