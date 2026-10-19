// notes/ml/ml_kmeans.js — K-Means
Object.assign(TOPIC_CONTENT, {
  "ml_kmeans": `<main>
  <h1>K-Means</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>K-Means</span></div>
  <p class="lead">K-Means splits rows into k groups, each summarised by one centre point, by repeating two simple steps: give every row to its nearest centre, then move every centre to the average of its rows. This note builds it completely on one running example, eight customers A–H described by visits per month and monthly spend: the objective (inertia) computed by hand, why the centre must be the mean, Lloyd's algorithm traced for four iterations, why it always stops but can stop in the wrong place, k-means++ seeding worked by hand, choosing k with the elbow, the silhouette and the gap statistic, the hidden assumptions and how they fail, outliers and k-medoids, mini-batch K-Means for huge data, every sklearn parameter, and a from-scratch version that matches sklearn exactly.</p>

  <h2 id="km-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 190" width="660">
<defs><marker id="km-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="235" y="8" width="190" height="36" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="31" text-anchor="middle" font-size="12">The Idea &amp; Distances</text>
<line x1="300" y1="44" x2="95" y2="84" stroke="currentColor" marker-end="url(#km-a0)"/><line x1="320" y1="44" x2="255" y2="84" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#km-a0)"/><line x1="340" y1="44" x2="420" y2="84" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#km-a0)"/><line x1="360" y1="44" x2="575" y2="84" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#km-a0)"/>
<rect x="20" y="86" width="150" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="95" y="107" text-anchor="middle" font-size="13" font-weight="700">K-Means</text><text x="95" y="125" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="180" y="86" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="255" y="107" text-anchor="middle" font-size="12">Hierarchical</text><text x="255" y="124" text-anchor="middle" class="tm" font-size="10">no k up front</text>
<rect x="340" y="86" width="160" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="420" y="107" text-anchor="middle" font-size="12">DBSCAN &amp; HDBSCAN</text><text x="420" y="124" text-anchor="middle" class="tm" font-size="10">any shape, noise</text>
<rect x="510" y="86" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="575" y="107" text-anchor="middle" font-size="12">GMM</text><text x="575" y="124" text-anchor="middle" class="tm" font-size="10">soft K-Means</text>
<line x1="170" y1="111" x2="178" y2="111" stroke="currentColor" marker-end="url(#km-a0)"/>
<path d="M95,136 Q330,190 575,136" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#km-a0)"/><text x="330" y="176" text-anchor="middle" class="tm" font-size="10.5">GMM generalises K-Means (round + hard → elliptical + soft)</text>
</svg><figcaption>K-Means is the first algorithm of the Clustering group. Its weaknesses motivate every sibling to its right.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_clustering">Clustering: The Idea &amp; Distances</a></b><span>We learnt to measure how alike two rows are (Euclidean, cosine, Gower …), why scaling matters, and that there are four families of algorithms. Left open: how does an actual algorithm turn a table of distances into groups?</span></li>
    <li><b>This note adds: the centroid family's main algorithm</b><span>A group = everything nearest to a centre. One number to minimise (inertia), one loop to minimise it (Lloyd), a smart start (k-means++), tools to pick k, and the variants that fix its weak spots (k-medoids, mini-batch).</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a></b><span>K-Means needs k before it starts and gives one flat answer. Hierarchical clustering builds every k at once as a tree. Further on, <a class="xref" data-note="ml_dbscan">DBSCAN</a> fixes the "round groups only, outliers forced in" problem, <a class="xref" data-note="ml_gmm">GMM</a> makes K-Means soft and elliptical, and <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a> deepens the silhouette and friends met here.</span></li>
  </ol>

  <h2 id="km-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Centres</b><span>Q: how can a whole group of customers be summarised? → By one centre point; every customer belongs to the nearest centre. But which grouping is "good"?</span></li>
    <li><b>Inertia (WCSS)</b><span>Q: how do we score a grouping? → Add up each customer's squared distance to its own centre: 25 for our final answer. But where exactly should each centre sit?</span></li>
    <li><b>The mean is the best centre</b><span>Q: for a fixed group, which centre gives the lowest inertia? → The mean (calculus: derivative = 0). Plus total = within + between: 137.5 = 25 + 112.5. But there are 127 ways to split 8 customers in two, and billions for real data…</span></li>
    <li><b>Lloyd's algorithm</b><span>Q: how do we find a good grouping without trying them all? → Alternate "assign to nearest centre" and "move centre to mean": inertia 264 → 47 → 32 → 25. Does it always stop, and at the best answer?</span></li>
    <li><b>Convergence &amp; local minima</b><span>Q: is the loop guaranteed to finish and to be optimal? → Finish yes (inertia never rises); optimal no: with k = 3 one start ends at 20.17, another at 16.5. The start decides…</span></li>
    <li><b>k-means++ and n_init</b><span>Q: how do we start well? → Pick starting centres far apart, with probability ∝ D²; run several times, keep the best. But we still had to tell it k…</span></li>
    <li><b>Elbow</b><span>Q: how many groups? → Plot inertia against k and look for the bend (k = 2). But inertia always falls, and the bend is a judgement call…</span></li>
    <li><b>Silhouette</b><span>Q: is there a score with a real peak? → Compare each customer's distance to its own group with the nearest other group: s(D) = 0.411, mean 0.629 at k = 2. But it cannot say "there are no groups at all"…</span></li>
    <li><b>Gap statistic</b><span>Q: is the grouping better than what pure noise would give? → Compare log-inertia with uniform random data; picks k = 2. But all of these assume K-Means' picture of a group…</span></li>
    <li><b>Assumptions &amp; failures</b><span>Q: what shapes can K-Means find? → Only groups split by straight lines (3·visits + 4·spend = 31.5): round, similar-sized, outlier-free. One wholesale buyer breaks it…</span></li>
    <li><b>K-medoids &amp; variants</b><span>Q: how do we resist outliers or use other distances? → Use an actual customer as the centre (medoid): the outlier stops stealing a group. But for 10 crore rows even one pass is slow…</span></li>
    <li><b>Mini-batch K-Means</b><span>Q: how do we cluster huge data? → Update centres from small random batches with a shrinking step 1/count: inertia only 0.05% worse. Then: how do we use all this in sklearn, and could we write it ourselves?</span></li>
  </ol>

  <h2 id="km-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">K-Means</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Objective</div>
        <ul>
          <li><b>Inertia / WCSS</b> = Σᵢ ‖xᵢ − μ_c(i)‖² — our 8 customers: 9.5 + 15.5 = 25</li>
          <li><b>Best centre</b> = mean (d/dc Σ(x − c)² = 0)</li>
          <li><b>Pairwise form</b>: WCSS_k = Σ pairs ‖xᵢ − xⱼ‖² / n_k (38 / 4 = 9.5)</li>
          <li><b>TSS = WCSS + BCSS</b>: 137.5 = 25 + 112.5 → minimising within = maximising between</li>
          <li>Exact optimum is NP-hard → heuristic search</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lloyd's algorithm</div>
        <ul>
          <li><b>Assign</b> each point to nearest centre · <b>update</b> centre = mean · repeat</li>
          <li>Trace: 264 → 47 → 32 → 25, stops at iteration 4 (sklearn n_iter_ 4)</li>
          <li>Never increases inertia; finitely many partitions → always stops</li>
          <li><b>Local minimum</b>: k = 3 starts AEG → 20.17, AEF → 16.5</li>
          <li>Cost O(n·k·d) per iteration; <code>algorithm="elkan"</code> skips distances via triangle inequality</li>
          <li>💡 Kirana shops move to the middle of their customers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Starting well</div>
        <ul>
          <li><b>Random</b> starts: 30 seeds, only 3 near the best; median inertia 4× worse</li>
          <li><b>k-means++</b>: next centre with probability D(x)² / ΣD²</li>
          <li>By hand from B: P(next in E–H) = 288/300 = 0.96 → picks G, then E</li>
          <li>O(log k)-competitive in expectation; sklearn uses a greedy version</li>
          <li><b>n_init</b> runs, keep lowest inertia (default "auto")</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing k</div>
        <ul>
          <li><b>Elbow</b>: 137.5, 25, 16.5, 9, 4 → bend at 2</li>
          <li><b>Silhouette</b> s = (b − a)/max(a, b): s(D) = 0.411; mean 0.629 at k = 2</li>
          <li><b>Gap</b> = E*[log W_k] − log W_k vs uniform data; smallest k with Gap(k) ≥ Gap(k+1) − s_{k+1}</li>
          <li><b>CH</b> (higher better), <b>DB</b> (lower better)</li>
          <li>Business: how many groups can you act on?</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Assumptions &amp; failures</div>
        <ul>
          <li>Boundary between 2 centres is a straight line: 3·visits + 4·spend = 31.5</li>
          <li>Round, similar spread &amp; size, scaled, outlier-free, numeric</li>
          <li>ARI: stretched 0.59, unequal size 0.09, moons 0.26 (GMM: 1.00, 0.81, 0.49)</li>
          <li>Outlier I (30, 30) takes a whole centre; A–H merged</li>
          <li>⚠ Always returns k groups, never "no structure"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants &amp; practice</div>
        <ul>
          <li><b>K-medoids</b> (PAM): centre = a real row, any distance, robust: {ABCD} {EFGHI}</li>
          <li>K-medians (L1), bisecting, k-modes / k-prototypes, kernel, fuzzy c-means</li>
          <li><b>Mini-batch</b>: c ← c + (x − c)/count; 20,000 rows: inertia ratio 1.0005</li>
          <li>sklearn: <code>KMeans(n_clusters, init, n_init, max_iter, tol, algorithm)</code></li>
          <li><code>labels_ · cluster_centers_ · inertia_ · predict · transform</code></li>
          <li>Scale in a Pipeline; from-scratch matches sklearn (25.0, 948.890)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="km-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="km-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Groups Around Centres</span><span class="rm-sub">Eight customers A–H</span></div></div>
      <div class="rm-item rm-done" data-target="km-obj"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Objective: Inertia</span><span class="rm-sub">WCSS, the mean, TSS = W + B</span></div></div>
      <div class="rm-item rm-done" data-target="km-lloyd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Lloyd's Algorithm by Hand</span><span class="rm-sub">Four iterations traced</span></div></div>
      <div class="rm-item rm-done" data-target="km-conv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Convergence &amp; Local Minima</span><span class="rm-sub">Why it stops, where it can stop</span></div></div>
      <div class="rm-item rm-done" data-target="km-init"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Initialization &amp; k-means++</span><span class="rm-sub">D² sampling by hand</span></div></div>
      <div class="rm-item rm-done" data-target="km-k"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Choosing k</span><span class="rm-sub">Elbow, silhouette, gap</span></div></div>
      <div class="rm-item rm-done" data-target="km-fail"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Assumptions &amp; Failures</span><span class="rm-sub">Straight boundaries, outliers</span></div></div>
      <div class="rm-item rm-done" data-target="km-variants"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">K-Medoids &amp; Variants</span><span class="rm-sub">Robust and specialised cousins</span></div></div>
      <div class="rm-item rm-done" data-target="km-mini"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Mini-Batch K-Means</span><span class="rm-sub">Running-mean updates</span></div></div>
      <div class="rm-item rm-done" data-target="km-sklearn"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">scikit-learn in Practice</span><span class="rm-sub">Every parameter and attribute</span></div></div>
      <div class="rm-item rm-done" data-target="km-scratch"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Matches sklearn exactly</span></div></div>
      <div class="rm-item rm-done" data-target="km-uses"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Beyond Segmentation</span><span class="rm-sub">Colour quantisation, features</span></div></div>
      <div class="rm-item rm-done" data-target="km-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One quantity, many tools</span></div></div>
      <div class="rm-item rm-done" data-target="km-compare"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs medoids, hierarchical, DBSCAN, GMM</span></div></div>
      <div class="rm-item rm-done" data-target="km-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="km-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="km-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="km-idea"><span class="num">01</span>Groups Around Centres</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The previous note gave us distances between customers, but no way to turn them into groups. What is the simplest possible rule that says which customers belong together?</p>
  </div>
  <h3>The running example</h3>
  <p>A small electronics shop tracks eight regular customers by two numbers: visits per month and spend per month (₹1000). Both columns are on similar small scales, so we can skip scaling for now (section 10 shows the pipeline for when you cannot).</p>
  <div class="fx" data-lang="py">import numpy as np
#             visits/month, spend (Rs 1000/month)
P = np.array([[2, 0], [3, 0], [4, 0], [4, 3],                # A B C D
              [6, 6], [9, 5], [9, 7], [7, 9]], dtype=float)   # E F G H
names = list("ABCDEFGH")
for n, (v, s) in zip(names, P): print(f"{n}: visits {v:.0f}, spend {s:.0f}")</div>
  <div class="fx" data-lang="text">A: visits 2, spend 0
B: visits 3, spend 0
C: visits 4, spend 0
D: visits 4, spend 3
E: visits 6, spend 6
F: visits 9, spend 5
G: visits 9, spend 7
H: visits 7, spend 9</div>
  <p>By eye there are two kinds of customer: A, B, C, D visit rarely and spend little; E, F, G, H visit often and spend more. D (4 visits, ₹3,000) sits a little apart from A–C. We want an algorithm that finds these two groups for 8 customers or 8 crore.</p>
  <h3>The idea: one centre per group</h3>
  <p>Summarise each group by one point, its <strong>centre</strong> (or <strong>centroid</strong>), and let every customer belong to the nearest centre. Two centres, (3.25, 0.75) and (7.75, 6.75), describe our whole table: "light customers, about 3 visits and ₹750" and "heavy customers, about 8 visits and ₹6,750". That is the K-Means model: k centres, and a rule "nearest centre wins".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>k kirana shops open in a new colony. Every family buys from the nearest shop. Each shopkeeper then shifts his shop to the middle of his customers. Families switch to whichever shop is now closest. After a few rounds nobody switches. The shops are the centres; the families are the rows.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>K-Means</strong> partitions n rows into k clusters C₁ … C_k, each with a centre μⱼ (a point in the same space as the rows), assigns each row to its nearest centre in Euclidean distance, and chooses the centres and assignment to minimise the total squared distance from rows to their centres. "k" is the number of groups you ask for; "means" because each centre ends up as the mean of its rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>K-Means needs k before it starts and always returns exactly k groups. Ask for 3 on our customers and it will split one of the two natural groups, with no warning. Choosing k is a separate job (section 06).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The objective.</b> "Nearest centre wins" assigns customers once the centres are known, but which centres are good? We need a single number that scores a grouping.</div>

  <h2 id="km-obj"><span class="num">02</span>The Objective: Inertia</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two different groupings of A–H: how do we say which one is better, as a number? And once the groups are fixed, where exactly should each centre sit?</p>
  </div>
  <h3>Inertia (WCSS) by hand</h3>
  <p>Take the grouping {A, B, C, D} and {E, F, G, H}. Centre 1 = mean of A–D = ((2 + 3 + 4 + 4)/4, (0 + 0 + 0 + 3)/4) = (3.25, 0.75). Centre 2 = mean of E–H = ((6 + 9 + 9 + 7)/4, (6 + 5 + 7 + 9)/4) = (7.75, 6.75). Now square each customer's distance to its own centre:</p>
  <table class="tbl">
    <tr><th>Customer</th><th>point</th><th>own centre</th><th>gaps</th><th>squared distance</th></tr>
    <tr><td>A</td><td>(2, 0)</td><td>(3.25, 0.75)</td><td>−1.25, −0.75</td><td>1.5625 + 0.5625 = 2.125</td></tr>
    <tr><td>B</td><td>(3, 0)</td><td>(3.25, 0.75)</td><td>−0.25, −0.75</td><td>0.0625 + 0.5625 = 0.625</td></tr>
    <tr><td>C</td><td>(4, 0)</td><td>(3.25, 0.75)</td><td>0.75, −0.75</td><td>1.125</td></tr>
    <tr><td>D</td><td>(4, 3)</td><td>(3.25, 0.75)</td><td>0.75, 2.25</td><td>0.5625 + 5.0625 = 5.625</td></tr>
    <tr><td>E</td><td>(6, 6)</td><td>(7.75, 6.75)</td><td>−1.75, −0.75</td><td>3.0625 + 0.5625 = 3.625</td></tr>
    <tr><td>F</td><td>(9, 5)</td><td>(7.75, 6.75)</td><td>1.25, −1.75</td><td>1.5625 + 3.0625 = 4.625</td></tr>
    <tr><td>G</td><td>(9, 7)</td><td>(7.75, 6.75)</td><td>1.25, 0.25</td><td>1.625</td></tr>
    <tr><td>H</td><td>(7, 9)</td><td>(7.75, 6.75)</td><td>−0.75, 2.25</td><td>5.625</td></tr>
    <tr><td colspan="4"><strong>WCSS</strong> = group 1 (9.5) + group 2 (15.5)</td><td><strong>25</strong></td></tr>
  </table>
  <p>That total is <strong>inertia</strong>, also called WCSS (within-cluster sum of squares). Small inertia = tight groups. K-Means is the search for the grouping with the smallest inertia.</p>
  <h3>Why the centre must be the mean</h3>
  <p>Fix a group and ask: which centre c makes Σ(xᵢ − c)² smallest? Look at one column, the visits of A–D: 2, 3, 4, 4. Try three centres: c = 3 gives 1 + 0 + 1 + 1 = 3; c = 3.25 gives 1.5625 + 0.0625 + 0.5625 + 0.5625 = 2.75; c = 3.5 gives 2.25 + 0.25 + 0.25 + 0.25 = 3. The mean 3.25 wins. The calculus (from <a class="xref" data-note="m_calculus">Calculus</a>) says why:</p>
  <p style="text-align:center">f(c) = Σᵢ (xᵢ − c)² &nbsp;⇒&nbsp; f′(c) = −2 Σᵢ (xᵢ − c) = 0 &nbsp;⇒&nbsp; c = (Σᵢ xᵢ)/n = the mean</p>
  <p>and f″(c) = 2n &gt; 0, so it is a minimum. Even better, f(c) = f(mean) + n(c − mean)²: moving the centre away from the mean by δ always costs exactly nδ². For c = 3: 2.75 + 4 × 0.25² = 3. ✓ Each column works the same way, so in any number of dimensions the best centre is the column-by-column mean.</p>
  <h3>Two other ways to see the same number</h3>
  <p><strong>Pairwise form.</strong> WCSS of a group also equals the sum of squared distances over all pairs inside the group, divided by the group size. Group 1 pairs: A–B 1, A–C 4, A–D 4 + 9 = 13, B–C 1, B–D 1 + 9 = 10, C–D 9; total 38; 38 / 4 = 9.5. ✓ So minimising inertia means making every pair inside a group close, not just "near a centre".</p>
  <p><strong>Total = within + between.</strong> The grand mean of all eight is (5.5, 3.75). The total sum of squares around it, TSS, is fixed by the data: 137.5. Between-cluster sum of squares, BCSS = Σ nⱼ‖μⱼ − grand mean‖² = 4 × (2.25² + 3²) + 4 × (2.25² + 3²) = 8 × 14.0625 = 112.5. And 25 + 112.5 = 137.5. Because TSS cannot change, <strong>making groups tight (small WCSS) is the same as making them far apart (large BCSS)</strong>: K-Means serves both wishes from the previous note at once.</p>
  <div class="fx" data-lang="py">lab = np.array([0, 0, 0, 0, 1, 1, 1, 1])                      # the final clustering we will reach
mu = np.array([P[lab == k].mean(0) for k in range(2)])
print("centres:", mu.tolist())
sq = ((P - mu[lab]) ** 2).sum(1)                              # squared distance of each point to its own centre
for n, s in zip(names, sq): print(n, s, end=" | ")
print("\\nWCSS per cluster:", [float(sq[lab == k].sum()) for k in range(2)], " total:", sq.sum())

# the mean is the best centre: try other centres for x-values 2, 3, 4, 4
x = np.array([2, 3, 4, 4.])
for c in [3.0, 3.25, 3.5]:
    print(f"centre {c}: sum of squares = {((x - c) ** 2).sum():.4f}")

# same WCSS from pairwise distances: sum over pairs / cluster size
from itertools import combinations
c1 = P[lab == 0]
pairs = sum(((a - b) ** 2).sum() for a, b in combinations(c1, 2))
print("pairwise sum", pairs, "/ 4 =", pairs / 4)

# total = within + between
g = P.mean(0)
tss = ((P - g) ** 2).sum()
bcss = sum((lab == k).sum() * ((mu[k] - g) ** 2).sum() for k in range(2))
print("grand mean", g, " TSS", tss, " WCSS", sq.sum(), " BCSS", bcss, " WCSS+BCSS", sq.sum() + bcss)</div>
  <div class="fx" data-lang="text">centres: [[3.25, 0.75], [7.75, 6.75]]
A 2.125 | B 0.625 | C 1.125 | D 5.625 | E 3.625 | F 4.625 | G 1.625 | H 5.625 | 
WCSS per cluster: [9.5, 15.5]  total: 25.0
centre 3.0: sum of squares = 3.0000
centre 3.25: sum of squares = 2.7500
centre 3.5: sum of squares = 3.0000
pairwise sum 38.0 / 4 = 9.5
grand mean [5.5  3.75]  TSS 137.5  WCSS 25.0  BCSS 112.5  WCSS+BCSS 137.5</div>
  <p>Every hand number appears: the per-customer squared distances, 9.5 + 15.5 = 25, the mean beating its neighbours (2.75 vs 3.0), 38 / 4 = 9.5, and 137.5 = 25 + 112.5.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Inertia</strong> (within-cluster sum of squares) J = Σⱼ Σ_{x∈Cⱼ} ‖x − μⱼ‖², with μⱼ = (1/|Cⱼ|) Σ_{x∈Cⱼ} x. Equivalently J = Σⱼ (1/(2|Cⱼ|)) Σ_{x,y∈Cⱼ} ‖x − y‖² over ordered pairs. With TSS = Σ‖x − x̄‖² and BCSS = Σⱼ |Cⱼ| ‖μⱼ − x̄‖²: TSS = J + BCSS. Finding the exact minimum of J is NP-hard (even for k = 2 in general dimension), so K-Means uses a heuristic search.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Inertia always falls when k rises (more centres, everyone is nearer to one) and reaches 0 when k = n. Never compare inertia across different k, or across differently scaled data, as if lower meant better.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Lloyd's algorithm.</b> We can score a grouping and place its centres. But even 8 customers can be split into two non-empty groups 2⁷ − 1 = 127 ways, and real data has astronomically many splits. How do we find a good one without trying them all?</div>

  <h2 id="km-lloyd"><span class="num">03</span>Lloyd's Algorithm by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the best centre for fixed groups (the mean) and the best groups for fixed centres (nearest centre). Neither is known at the start. How do we get both?</p>
  </div>
  <h3>The loop</h3>
  <div class="flow"><span>Place k starting centres</span><span>Assign: each point → nearest centre</span><span>Update: each centre → mean of its points</span><span>Repeat until centres stop moving</span></div>
  <p>Each step solves half the problem exactly, using the other half as if it were known. That trick is called <strong>alternating minimisation</strong>.</p>
  <h3>Iteration 1, by hand</h3>
  <p>We start badly on purpose: both centres in the light group, c1 = B (3, 0) and c2 = C (4, 0). Squared distance to each centre, nearest wins:</p>
  <table class="tbl">
    <tr><th>Customer</th><th>d² to c1 (3, 0)</th><th>d² to c2 (4, 0)</th><th>goes to</th></tr>
    <tr><td>A (2, 0)</td><td>1</td><td>4</td><td>c1</td></tr>
    <tr><td>B (3, 0)</td><td>0</td><td>1</td><td>c1</td></tr>
    <tr><td>C (4, 0)</td><td>1</td><td>0</td><td>c2</td></tr>
    <tr><td>D (4, 3)</td><td>1 + 9 = 10</td><td>0 + 9 = 9</td><td>c2</td></tr>
    <tr><td>E (6, 6)</td><td>9 + 36 = 45</td><td>4 + 36 = 40</td><td>c2</td></tr>
    <tr><td>F (9, 5)</td><td>61</td><td>50</td><td>c2</td></tr>
    <tr><td>G (9, 7)</td><td>85</td><td>74</td><td>c2</td></tr>
    <tr><td>H (7, 9)</td><td>97</td><td>90</td><td>c2</td></tr>
  </table>
  <p>Inertia with these centres = 1 + 0 + 0 + 9 + 40 + 50 + 74 + 90 = <strong>264</strong>. Update: c1 = mean of A, B = (2.5, 0); c2 = mean of C–H = ((4 + 4 + 6 + 9 + 9 + 7)/6, (0 + 3 + 6 + 5 + 7 + 9)/6) = (6.5, 5).</p>
  <h3>Iterations 2–4</h3>
  <table class="tbl">
    <tr><th>Iteration</th><th>centres used</th><th>what changes</th><th>inertia</th><th>new centres</th></tr>
    <tr><td>2</td><td>(2.5, 0), (6.5, 5)</td><td>C: 2.25 vs 31.25 → moves to c1. D: 11.25 vs 10.25 → stays with c2 (just!)</td><td>47</td><td>(3, 0) from A, B, C; (7, 6) from D–H</td></tr>
    <tr><td>3</td><td>(3, 0), (7, 6)</td><td>D: 10 vs 18 → moves to c1</td><td>32</td><td>(3.25, 0.75); (7.75, 6.75)</td></tr>
    <tr><td>4</td><td>(3.25, 0.75), (7.75, 6.75)</td><td>nobody moves (D: 5.625 vs 28.125)</td><td><strong>25</strong></td><td>same → stop</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 680 205" width="680"><rect x="8" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="88.0" y="15" text-anchor="middle" font-size="11">1: start B, C · inertia 264</text><circle cx="47" cy="178" r="5" class="fb sb"/><text x="54" y="173" font-size="9.5">A</text><circle cx="60" cy="178" r="5" class="fb sb"/><text x="68" y="173" font-size="9.5">B</text><circle cx="74" cy="178" r="5" class="fr sr"/><text x="81" y="173" font-size="9.5">C</text><circle cx="74" cy="133" r="5" class="fr sr"/><text x="81" y="128" font-size="9.5">D</text><circle cx="101" cy="88" r="5" class="fr sr"/><text x="108" y="83" font-size="9.5">E</text><circle cx="142" cy="103" r="5" class="fr sr"/><text x="148" y="98" font-size="9.5">F</text><circle cx="142" cy="73" r="5" class="fr sr"/><text x="148" y="68" font-size="9.5">G</text><circle cx="114" cy="43" r="5" class="fr sr"/><text x="122" y="38" font-size="9.5">H</text><rect x="56" y="173" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="69" y="173" width="10" height="10" class="fr sr" stroke-width="2.5"/><rect x="176" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="256.0" y="15" text-anchor="middle" font-size="11">2: C joins c1 · 47</text><circle cx="215" cy="178" r="5" class="fb sb"/><text x="222" y="173" font-size="9.5">A</text><circle cx="228" cy="178" r="5" class="fb sb"/><text x="236" y="173" font-size="9.5">B</text><circle cx="242" cy="178" r="5" class="fb sb"/><text x="249" y="173" font-size="9.5">C</text><circle cx="242" cy="133" r="5" class="fr sr"/><text x="249" y="128" font-size="9.5">D</text><circle cx="269" cy="88" r="5" class="fr sr"/><text x="276" y="83" font-size="9.5">E</text><circle cx="310" cy="103" r="5" class="fr sr"/><text x="316" y="98" font-size="9.5">F</text><circle cx="310" cy="73" r="5" class="fr sr"/><text x="316" y="68" font-size="9.5">G</text><circle cx="282" cy="43" r="5" class="fr sr"/><text x="290" y="38" font-size="9.5">H</text><rect x="217" y="173" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="271" y="98" width="10" height="10" class="fr sr" stroke-width="2.5"/><rect x="344" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="424.0" y="15" text-anchor="middle" font-size="11">3: D switches · 32</text><circle cx="383" cy="178" r="5" class="fb sb"/><text x="390" y="173" font-size="9.5">A</text><circle cx="396" cy="178" r="5" class="fb sb"/><text x="404" y="173" font-size="9.5">B</text><circle cx="410" cy="178" r="5" class="fb sb"/><text x="417" y="173" font-size="9.5">C</text><circle cx="410" cy="133" r="5" class="fb sb"/><text x="417" y="128" font-size="9.5">D</text><circle cx="437" cy="88" r="5" class="fr sr"/><text x="444" y="83" font-size="9.5">E</text><circle cx="478" cy="103" r="5" class="fr sr"/><text x="484" y="98" font-size="9.5">F</text><circle cx="478" cy="73" r="5" class="fr sr"/><text x="484" y="68" font-size="9.5">G</text><circle cx="450" cy="43" r="5" class="fr sr"/><text x="458" y="38" font-size="9.5">H</text><rect x="392" y="173" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="446" y="83" width="10" height="10" class="fr sr" stroke-width="2.5"/><rect x="512" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="592.0" y="15" text-anchor="middle" font-size="11">4: nothing moves · 25</text><line x1="531" y1="66" x2="666" y2="178" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.6"/><circle cx="551" cy="178" r="5" class="fb sb"/><text x="558" y="173" font-size="9.5">A</text><circle cx="564" cy="178" r="5" class="fb sb"/><text x="572" y="173" font-size="9.5">B</text><circle cx="578" cy="178" r="5" class="fb sb"/><text x="585" y="173" font-size="9.5">C</text><circle cx="578" cy="133" r="5" class="fb sb"/><text x="585" y="128" font-size="9.5">D</text><circle cx="605" cy="88" r="5" class="fr sr"/><text x="612" y="83" font-size="9.5">E</text><circle cx="646" cy="103" r="5" class="fr sr"/><text x="652" y="98" font-size="9.5">F</text><circle cx="646" cy="73" r="5" class="fr sr"/><text x="652" y="68" font-size="9.5">G</text><circle cx="618" cy="43" r="5" class="fr sr"/><text x="626" y="38" font-size="9.5">H</text><rect x="563" y="162" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="624" y="72" width="10" height="10" class="fr sr" stroke-width="2.5"/><text x="340" y="202" text-anchor="middle" class="tm" font-size="10.5">circles = customers (colour = assigned centre) · squares = centres · dashed line in panel 4 = final boundary 3·visits + 4·spend = 31.5</text></svg><figcaption>The four iterations. The light group is gathered one customer at a time: C joins in iteration 2, D in iteration 3. Inertia falls 264 → 47 → 32 → 25.</figcaption></figure>
  <p>The code below runs exactly this trace and prints every squared distance:</p>
  <div class="fx" data-lang="py">def lloyd_trace(P, C, max_iter=10):
    for it in range(1, max_iter + 1):
        d2 = ((P[:, None, :] - C[None, :, :]) ** 2).sum(2)     # squared distance, point x centre
        lab = d2.argmin(1)                                      # step 1: assign
        inertia = d2[np.arange(len(P)), lab].sum()
        print(f"--- iteration {it}: centres {C.tolist()}")
        for n, row, l in zip(names, d2, lab):
            print(f"  {n}  d2 to c1 = {row[0]:6.3f}   d2 to c2 = {row[1]:6.3f}   -&gt; c{l + 1}")
        print(f"  inertia with these centres = {inertia:.4f}")
        newC = np.array([P[lab == k].mean(0) for k in range(len(C))])   # step 2: update
        if np.allclose(newC, C):
            print("  centres did not move -&gt; converged"); return C, lab
        C = newC

C_final, lab_final = lloyd_trace(P, P[[1, 2]].copy())          # start: c1 = B(3,0), c2 = C(4,0)</div>
  <div class="fx" data-lang="text">--- iteration 1: centres [[3.0, 0.0], [4.0, 0.0]]
  A  d2 to c1 =  1.000   d2 to c2 =  4.000   -&gt; c1
  B  d2 to c1 =  0.000   d2 to c2 =  1.000   -&gt; c1
  C  d2 to c1 =  1.000   d2 to c2 =  0.000   -&gt; c2
  D  d2 to c1 = 10.000   d2 to c2 =  9.000   -&gt; c2
  E  d2 to c1 = 45.000   d2 to c2 = 40.000   -&gt; c2
  F  d2 to c1 = 61.000   d2 to c2 = 50.000   -&gt; c2
  G  d2 to c1 = 85.000   d2 to c2 = 74.000   -&gt; c2
  H  d2 to c1 = 97.000   d2 to c2 = 90.000   -&gt; c2
  inertia with these centres = 264.0000
--- iteration 2: centres [[2.5, 0.0], [6.5, 5.0]]
  A  d2 to c1 =  0.250   d2 to c2 = 45.250   -&gt; c1
  B  d2 to c1 =  0.250   d2 to c2 = 37.250   -&gt; c1
  C  d2 to c1 =  2.250   d2 to c2 = 31.250   -&gt; c1
  D  d2 to c1 = 11.250   d2 to c2 = 10.250   -&gt; c2
  E  d2 to c1 = 48.250   d2 to c2 =  1.250   -&gt; c2
  F  d2 to c1 = 67.250   d2 to c2 =  6.250   -&gt; c2
  G  d2 to c1 = 91.250   d2 to c2 = 10.250   -&gt; c2
  H  d2 to c1 = 101.250   d2 to c2 = 16.250   -&gt; c2
  inertia with these centres = 47.0000
--- iteration 3: centres [[3.0, 0.0], [7.0, 6.0]]
  A  d2 to c1 =  1.000   d2 to c2 = 61.000   -&gt; c1
  B  d2 to c1 =  0.000   d2 to c2 = 52.000   -&gt; c1
  C  d2 to c1 =  1.000   d2 to c2 = 45.000   -&gt; c1
  D  d2 to c1 = 10.000   d2 to c2 = 18.000   -&gt; c1
  E  d2 to c1 = 45.000   d2 to c2 =  1.000   -&gt; c2
  F  d2 to c1 = 61.000   d2 to c2 =  5.000   -&gt; c2
  G  d2 to c1 = 85.000   d2 to c2 =  5.000   -&gt; c2
  H  d2 to c1 = 97.000   d2 to c2 =  9.000   -&gt; c2
  inertia with these centres = 32.0000
--- iteration 4: centres [[3.25, 0.75], [7.75, 6.75]]
  A  d2 to c1 =  2.125   d2 to c2 = 78.625   -&gt; c1
  B  d2 to c1 =  0.625   d2 to c2 = 68.125   -&gt; c1
  C  d2 to c1 =  1.125   d2 to c2 = 59.625   -&gt; c1
  D  d2 to c1 =  5.625   d2 to c2 = 28.125   -&gt; c1
  E  d2 to c1 = 35.125   d2 to c2 =  3.625   -&gt; c2
  F  d2 to c1 = 51.125   d2 to c2 =  4.625   -&gt; c2
  G  d2 to c1 = 72.125   d2 to c2 =  1.625   -&gt; c2
  H  d2 to c1 = 82.125   d2 to c2 =  5.625   -&gt; c2
  inertia with these centres = 25.0000
  centres did not move -&gt; converged</div>
  <p>sklearn, given the same starting centres and one run, lands in the same place after the same 4 iterations:</p>
  <div class="fx" data-lang="py">from sklearn.cluster import KMeans
km = KMeans(n_clusters=2, init=P[[1, 2]], n_init=1).fit(P)   # same starting centres
print("labels ", km.labels_)
print("centres", km.cluster_centers_.tolist())
print("inertia", km.inertia_, " iterations", km.n_iter_)</div>
  <div class="fx" data-lang="text">labels  [0 0 0 0 1 1 1 1]
centres [[3.25, 0.75], [7.75, 6.75]]
inertia 25.0  iterations 4</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lloyd's algorithm</strong> (1957/1982): given centres μ⁽ᵗ⁾, (1) assignment step cᵢ⁽ᵗ⁾ = argminⱼ ‖xᵢ − μⱼ⁽ᵗ⁾‖²; (2) update step μⱼ⁽ᵗ⁺¹⁾ = mean of {xᵢ : cᵢ⁽ᵗ⁾ = j}. Stop when assignments no longer change, when the total centre movement falls below <code>tol</code>, or after <code>max_iter</code> iterations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>D's switch hung on a hair in iteration 2 (11.25 vs 10.25). Small changes in the data or start can flip borderline rows; K-Means labels for border customers are not stable, so do not over-interpret them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Convergence.</b> The loop stopped after four rounds here. Is it guaranteed to stop on any data? And is the answer it stops at the best possible one?</div>

  <h2 id="km-conv"><span class="num">04</span>Convergence &amp; Local Minima</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our trace went 264 → 47 → 32 → 25 and stopped. Could the loop ever cycle forever? And when it stops, have we found the lowest possible inertia?</p>
  </div>
  <h3>Why it always stops</h3>
  <ol>
    <li><strong>The assign step cannot raise inertia.</strong> Each point moves only to a centre that is at least as close, so each term in the sum stays the same or shrinks.</li>
    <li><strong>The update step cannot raise inertia.</strong> For fixed groups the mean is the best centre (section 02), so moving to it can only lower the sum.</li>
    <li><strong>There are finitely many groupings</strong> (127 for 8 customers into 2). Inertia strictly drops each time the grouping changes, so no grouping can repeat, and the loop must end.</li>
  </ol>
  <h3>Why it can stop in the wrong place</h3>
  <p>"Can never go downhill further by these two steps" is not "lowest possible". Ask for k = 3 on our customers from two different starts:</p>
  <div class="fx" data-lang="py">for start in ["AEG", "AEF"]:                                  # two different starting triples, k = 3
    init = P[[names.index(c) for c in start]]
    km = KMeans(3, init=init, n_init=1).fit(P)
    groups = ["".join(np.array(names)[km.labels_ == k]) for k in range(3)]
    print(f"start at {start}: groups {groups}  inertia {km.inertia_:.3f}")</div>
  <div class="fx" data-lang="text">start at AEG: groups ['ABCD', 'E', 'FGH']  inertia 20.167
start at AEF: groups ['ABCD', 'EH', 'FG']  inertia 16.500</div>
  <p>Starting at A, E, G, E ends up alone and F, G, H share a centre: inertia 20.17. Starting at A, E, F gives {E, H} and {F, G}: 16.5. Both are stable (no single reassignment helps), but one is 22% worse. Such a stable-but-not-best answer is a <strong>local minimum</strong>. With real data and k = 10, bad starts are common and the gap is bigger (section 05).</p>
  <h3>Cost and speed-ups</h3>
  <p>Each iteration computes n × k distances of d columns: O(n·k·d). For us 8 × 2 × 2 = 32 multiplications; for 1 crore customers, 20 groups and 30 columns, 6 × 10⁹, about a second per iteration. Usually 10–100 iterations are enough. sklearn's <code>algorithm="elkan"</code> uses the triangle inequality to skip distances that cannot change the nearest centre (faster for small k and dense data, more memory); the default <code>"lloyd"</code> is usually best.</p>
  <h3>Empty clusters, tol and max_iter</h3>
  <p>If a centre loses all its points, its mean is undefined. sklearn moves it to the point currently farthest from its centre; our from-scratch code (section 11) simply leaves it in place. <code>tol</code> (default 1e-4) stops when centres barely move; <code>max_iter</code> (default 300) is a safety cap that is almost never reached.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Lloyd's algorithm is a <strong>coordinate descent</strong> on J(assignment, centres) that converges in a finite number of steps to a <strong>local minimum</strong> (a fixed point where neither step changes anything). The worst-case number of iterations can be exponential, but in practice it is small. Its result depends on the initial centres.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Converged" is not "correct". A single K-Means run with <code>n_init=1</code> may be stuck far from the best answer. Always run several starts and compare inertia.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Initialization.</b> The answer depends on where the centres start. Our deliberately bad start (B and C, both light customers) wasted iterations; worse starts give worse answers. How do we choose starting centres well?</div>

  <h2 id="km-init"><span class="num">05</span>Initialization &amp; k-means++</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two starting centres inside the same group cost us extra rounds; with k = 3 a bad start cost 22% of inertia. Is there a rule for picking starting centres that are likely to land in different groups?</p>
  </div>
  <h3>Random starts are risky</h3>
  <p>The simplest start picks k random rows. With 10 true groups, the chance that 10 random rows land one per group is tiny, and then two centres share a group while another group has none. At scale, on 1,000 points in 10 groups:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_blobs
Xb, yb = make_blobs(n_samples=1000, centers=10, cluster_std=0.6, center_box=(-10, 10), random_state=4)
for init in ["random", "k-means++"]:
    inert = np.array([KMeans(10, init=init, n_init=1, random_state=s).fit(Xb).inertia_ for s in range(30)])
    best = inert.min()
    print(f"{init:10s} n_init=1 over 30 seeds: best {best:7.1f}  median {np.median(inert):7.1f}  "
          f"worst {inert.max():7.1f}  runs within 1% of best: {(inert &lt; best * 1.01).sum()}/30")
km10 = KMeans(10, init="random", n_init=10, random_state=0).fit(Xb)
print(f"random     n_init=10 (keeps the best of 10): inertia {km10.inertia_:.1f}")</div>
  <div class="fx" data-lang="text">random     n_init=1 over 30 seeds: best   789.7  median  2852.3  worst  7556.1  runs within 1% of best: 3/30
k-means++  n_init=1 over 30 seeds: best   657.6  median   658.3  worst   794.2  runs within 1% of best: 18/30
random     n_init=10 (keeps the best of 10): inertia 1369.7</div>
  <p>With random starts, only 3 of 30 runs came within 1% of random's own best (789.7), which is itself 20% worse than the k-means++ best (657.6), and the median random run (2,852.3) is more than 4× worse. Even keeping the best of 10 random runs (1,369.7) is twice the k-means++ result. k-means++ gets within 1% in 18 of 30 single runs, and its worst run (794.2) is close to random's best.</p>
  <h3>k-means++ by hand</h3>
  <p>Idea: spread the starting centres out. Pick the first centre at random. Then pick each next centre at random, but with probability proportional to D(x)², the squared distance from x to the nearest centre already chosen. Far-away points are much more likely to be picked; points already near a centre almost never are.</p>
  <p>Our customers, k = 3. Step 1: suppose the uniform draw picks B (3, 0). Step 2: D² to B for every customer:</p>
  <table class="tbl">
    <tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>sum</th></tr>
    <tr><td>D² to B</td><td>1</td><td>0</td><td>1</td><td>10</td><td>45</td><td>61</td><td>85</td><td>97</td><td>300</td></tr>
    <tr><td>P(pick) = D²/300</td><td>.003</td><td>0</td><td>.003</td><td>.033</td><td>.150</td><td>.203</td><td>.283</td><td>.323</td><td>1</td></tr>
    <tr><td>cumulative</td><td>.003</td><td>.003</td><td>.007</td><td>.040</td><td>.190</td><td>.393</td><td>.677</td><td>1</td><td></td></tr>
  </table>
  <p>The heavy group E–H holds (45 + 61 + 85 + 97)/300 = 288/300 = 96% of the probability. Draw u = 0.5 and walk the cumulative row: 0.5 falls between .393 and .677, so G is picked. Step 3: D² is now the distance to the <em>nearer</em> of B and G: A 1, B 0, C 1, D 10, E min(45, 10) = 10, F 4, G 0, H 8; sum 34. Probabilities: D and E .294 each, H .235, F .118, A and C .029. With u = 0.5, E is picked. Starting centres: B, G, E: one in the light group and two spread across the heavy group.</p>
  <div class="fx" data-lang="py">from sklearn.cluster import kmeans_plusplus
chosen = ["B"]                                               # step 1: the first centre is a uniform draw; say B
for step in range(2):
    C = P[[names.index(c) for c in chosen]]
    D2 = ((P[:, None, :] - C[None]) ** 2).sum(2).min(1)        # squared distance to the NEAREST chosen centre
    p = D2 / D2.sum()                                        # k-means++ probability of being picked next
    print(f"centres so far {chosen}:  D2 = {dict(zip(names, D2.astype(int).tolist()))}  sum = {int(D2.sum())}")
    print("   P(pick) =", dict(zip(names, p.round(3).tolist())))
    cum = np.cumsum(p); u = 0.5                              # a uniform random number u = 0.5
    chosen.append(names[np.searchsorted(cum, u)])
    print(f"   cumulative = {cum.round(3).tolist()}  -&gt;  u = {u} picks {chosen[-1]}")
print("k-means++ centres for k = 3:", chosen)
centers, idx = kmeans_plusplus(P, n_clusters=3, random_state=0)
print("sklearn kmeans_plusplus (greedy version) picks:", [names[i] for i in idx])</div>
  <div class="fx" data-lang="text">centres so far ['B']:  D2 = {'A': 1, 'B': 0, 'C': 1, 'D': 10, 'E': 45, 'F': 61, 'G': 85, 'H': 97}  sum = 300
   P(pick) = {'A': 0.003, 'B': 0.0, 'C': 0.003, 'D': 0.033, 'E': 0.15, 'F': 0.203, 'G': 0.283, 'H': 0.323}
   cumulative = [0.003, 0.003, 0.007, 0.04, 0.19, 0.393, 0.677, 1.0]  -&gt;  u = 0.5 picks G
centres so far ['B', 'G']:  D2 = {'A': 1, 'B': 0, 'C': 1, 'D': 10, 'E': 10, 'F': 4, 'G': 0, 'H': 8}  sum = 34
   P(pick) = {'A': 0.029, 'B': 0.0, 'C': 0.029, 'D': 0.294, 'E': 0.294, 'F': 0.118, 'G': 0.0, 'H': 0.235}
   cumulative = [0.029, 0.029, 0.059, 0.353, 0.647, 0.765, 0.765, 1.0]  -&gt;  u = 0.5 picks E
k-means++ centres for k = 3: ['B', 'G', 'E']
sklearn kmeans_plusplus (greedy version) picks: ['E', 'C', 'G']</div>
  <p>The printed tables match ours. sklearn's own <code>kmeans_plusplus</code> uses a <strong>greedy</strong> refinement: at each step it draws several candidates (2 + log k) by the D² rule and keeps the one that lowers inertia most, so it picked E, C, G here, again one light and two heavy.</p>
  <h3>n_init: restart and keep the best</h3>
  <p>Even k-means++ is random. <code>n_init</code> runs the whole algorithm several times from different seeds and keeps the run with the lowest inertia. In sklearn 1.4+ the default <code>n_init="auto"</code> means 1 run with k-means++ and 10 runs with random init. For important work, set <code>n_init=10</code> explicitly.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>k-means++</strong> (Arthur &amp; Vassilvitskii, 2007): choose μ₁ uniformly from the data; for j = 2 … k choose μⱼ = x with probability D(x)² / Σ_y D(y)², where D(x) = min over chosen centres ‖x − μ‖. The expected inertia of the seeding alone is at most 8(ln k + 2) times the optimum, and Lloyd's iterations only improve it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>k-means++ is attracted by outliers: a far-away point has a huge D² and is very likely to become a starting centre. Remove or cap extreme outliers first (section 07).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing k.</b> We now find good groups reliably, for a k we chose. But nobody told us k = 2. How do we choose the number of groups from the data?</div>

  <h2 id="km-k"><span class="num">06</span>Choosing k</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Inertia always falls as k grows, so "lowest inertia" would pick k = 8 (one customer per group, inertia 0). What evidence says our customers form 2 groups and not 3 or 5?</p>
  </div>
  <h3>The elbow method</h3>
  <p>Run K-Means for k = 1, 2, 3, … and plot inertia. Look for the <strong>elbow</strong>: the k after which adding a group stops helping much.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
def scan(X, ks):
    print(" k   inertia    drop  silhouette     CH      DB")
    prev = None
    for k in ks:
        km = KMeans(k, n_init=10, random_state=0).fit(X)
        drop = "" if prev is None else f"{prev - km.inertia_:7.1f}"
        sc = "" if k == 1 else (f"{silhouette_score(X, km.labels_):8.3f}  {calinski_harabasz_score(X, km.labels_):7.1f}"
                                f"  {davies_bouldin_score(X, km.labels_):6.3f}")
        print(f"{k:2d}  {km.inertia_:8.1f} {drop:&gt;7s}  {sc}")
        prev = km.inertia_
print("our eight customers"); scan(P, range(1, 6))
from sklearn.datasets import make_blobs
X4, y4 = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)
print("\\n500 customers, 4 hidden types"); scan(X4, range(1, 8))</div>
  <div class="fx" data-lang="text">our eight customers
 k   inertia    drop  silhouette     CH      DB
 1     137.5          
 2      25.0   112.5     0.629     27.0   0.446
 3      16.5     8.5     0.450     18.3   0.724
 4       9.0     7.5     0.339     19.0   0.587
 5       4.0     5.0     0.304     25.0   0.273

500 customers, 4 hidden types
 k   inertia    drop  silhouette     CH      DB
 1   33903.9          
 2   15737.1 18166.8     0.596    574.9   0.520
 3    3426.3 12310.8     0.761   2210.5   0.349
 4     948.9  2477.4     0.791   5742.0   0.294
 5     855.9    93.0     0.665   4778.3   0.640
 6     768.7    87.2     0.561   4259.6   0.842
 7     681.0    87.7     0.442   4008.7   1.011</div>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
<text x="150" y="16" text-anchor="middle" font-size="12">Elbow: inertia vs k</text><text x="450" y="16" text-anchor="middle" font-size="12">Silhouette vs k</text>
<line x1="40" y1="170" x2="270" y2="170" stroke="currentColor"/><line x1="40" y1="25" x2="40" y2="170" stroke="currentColor"/>
<line x1="330" y1="170" x2="570" y2="170" stroke="currentColor"/><line x1="330" y1="25" x2="330" y2="170" stroke="currentColor"/>
<polyline points="60,30 110,144 160,153 210,161 260,166" fill="none" class="sb" stroke-width="2"/>
<circle cx="60" cy="30" r="4" class="fb sb"/><circle cx="110" cy="144" r="6" class="fr sr"/><circle cx="160" cy="153" r="4" class="fb sb"/><circle cx="210" cy="161" r="4" class="fb sb"/><circle cx="260" cy="166" r="4" class="fb sb"/>
<text x="68" y="34" class="tm" font-size="11">137.5</text><text x="118" y="138" class="tr" font-size="11">25</text><text x="160" y="146" class="tm" font-size="11">16.5</text><text x="210" y="154" class="tm" font-size="11">9</text><text x="255" y="158" class="tm" font-size="11">4</text>
<polyline points="350,40 420,93 490,129 560,140" fill="none" class="st" stroke-width="2"/>
<circle cx="350" cy="40" r="6" class="fr sr"/><circle cx="420" cy="93" r="4" class="ft st"/><circle cx="490" cy="129" r="4" class="ft st"/><circle cx="560" cy="140" r="4" class="ft st"/>
<text x="360" y="38" class="tr" font-size="11">.629</text><text x="428" y="90" class="tm" font-size="11">.450</text><text x="498" y="126" class="tm" font-size="11">.339</text><text x="540" y="132" class="tm" font-size="11">.304</text>
<g class="tm" font-size="11"><text x="60" y="186" text-anchor="middle">1</text><text x="110" y="186" text-anchor="middle">2</text><text x="160" y="186" text-anchor="middle">3</text><text x="210" y="186" text-anchor="middle">4</text><text x="260" y="186" text-anchor="middle">5</text>
<text x="350" y="186" text-anchor="middle">2</text><text x="420" y="186" text-anchor="middle">3</text><text x="490" y="186" text-anchor="middle">4</text><text x="560" y="186" text-anchor="middle">5</text></g>
<text x="155" y="204" text-anchor="middle" class="tm" font-size="11">bend at k = 2 (drop 112.5, then 8.5)</text><text x="450" y="204" text-anchor="middle" class="tm" font-size="11">peak at k = 2</text>
</svg><figcaption>Our eight customers. Inertia always falls as k grows; the useful signal is where the fall suddenly slows. Silhouette has a real maximum.</figcaption></figure>
  <p>For our eight customers, going from 1 to 2 groups removes 112.5 of the 137.5 (that is the BCSS from section 02), and the next steps remove only 8.5, 7.5, 5. Elbow at k = 2. For the 500 customers with 4 hidden types the drops are 18,167, 12,311, 2,477, then 93: elbow at 4. Real data rarely has such a sharp bend, which is the elbow's weakness: it is a judgement by eye.</p>
  <h3>The silhouette: a score with a real peak</h3>
  <p>For each point i: a(i) = average distance to the other points in its own group; b(i) = average distance to the points of the nearest other group. Then</p>
  <p style="text-align:center"><strong>s(i) = (b(i) − a(i)) / max(a(i), b(i))</strong> &nbsp; ∈ [−1, 1]</p>
  <p>Near 1: deep inside its group. Near 0: on a border. Negative: closer to another group than its own. Customer D by hand (k = 2): distances to A, B, C are √13 = 3.606, √10 = 3.162, 3, so a = 3.256. To E, F, G, H: √13 = 3.606, √29 = 5.385, √41 = 6.403, √45 = 6.708, so b = 5.526. s(D) = (5.526 − 3.256)/5.526 = <strong>0.411</strong>: D belongs to the light group, but less clearly than A, B, C.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_samples
from scipy.spatial.distance import cdist
dD = cdist(P[[3]], P)[0]                                    # distances from D(4,3) to all 8 points
print("D to A,B,C:", dD[[0, 1, 2]].round(3), " a =", dD[[0, 1, 2]].mean().round(3))
print("D to E,F,G,H:", dD[4:].round(3), " b =", dD[4:].mean().round(3))
a, b = dD[[0, 1, 2]].mean(), dD[4:].mean()
print("s(D) = (b - a) / max(a, b) =", round((b - a) / max(a, b), 3))
s = silhouette_samples(P, lab_final)
print("sklearn per point:", {n: float(v) for n, v in zip(names, s.round(3))})
print("mean silhouette:", s.mean().round(3))</div>
  <div class="fx" data-lang="text">D to A,B,C: [3.606 3.162 3.   ]  a = 3.256
D to E,F,G,H: [3.606 5.385 6.403 6.708]  b = 5.526
s(D) = (b - a) / max(a, b) = 0.411
sklearn per point: {'A': 0.755, 'B': 0.795, 'C': 0.746, 'D': 0.411, 'E': 0.47, 'F': 0.555, 'G': 0.688, 'H': 0.616}
mean silhouette: 0.629</div>
  <p>D has the lowest score of the eight (0.411), exactly the customer that switched late in the trace. The mean, 0.629, is the silhouette score of the whole clustering; the table in <code>b08_elbow</code> shows it peaks at k = 2 (0.629, then 0.450, 0.339, 0.304). For the 500 customers it peaks at 4 (0.791). The full theory, and its blind spots, are in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>.</p>
  <h3>The gap statistic: better than noise?</h3>
  <p>Elbow and silhouette cannot say "k = 1, there are no groups". The gap statistic (Tibshirani, Walther &amp; Hastie, 2001) asks: how much lower is our inertia than the inertia K-Means would get on data with <em>no</em> clusters? Generate B reference datasets uniformly in the bounding box of the data, cluster each, and compare on a log scale:</p>
  <p style="text-align:center"><strong>Gap(k) = E*[log W_k] − log W_k</strong>, &nbsp; s_k = sd*(log W_k) · √(1 + 1/B)</p>
  <p>Choose the smallest k with Gap(k) ≥ Gap(k+1) − s_{k+1}: the first k where adding a group does not clearly increase the gap.</p>
  <div class="fx" data-lang="py">def log_wk(X, k):
    return np.log(KMeans(k, n_init=10, random_state=0).fit(X).inertia_)

def gap_statistic(X, ks, B=20, seed=0):
    rng = np.random.default_rng(seed)
    lo, hi = X.min(0), X.max(0)                              # bounding box of the data
    rows = []
    for k in ks:
        ref = [log_wk(rng.uniform(lo, hi, size=X.shape), k) for _ in range(B)]   # data with NO clusters
        lw = log_wk(X, k)
        rows.append((k, lw, np.mean(ref), np.mean(ref) - lw, np.std(ref) * np.sqrt(1 + 1 / B)))
    print(" k  log(W_k)  E*[log W_k]   gap    s_k")
    for k, lw, ref, gap, s_k in rows: print(f"{k:2d}  {lw:7.3f}   {ref:8.3f}   {gap:6.3f}  {s_k:.3f}")
    choice = next(rows[i][0] for i in range(len(rows) - 1) if rows[i][3] &gt;= rows[i + 1][3] - rows[i + 1][4])
    print("smallest k with gap(k) &gt;= gap(k+1) - s(k+1):", choice)

print("our eight customers"); gap_statistic(P, range(1, 5))
print("\\n500 customers, 4 hidden types"); gap_statistic(X4, range(1, 8), B=10)</div>
  <div class="fx" data-lang="text">our eight customers
 k  log(W_k)  E*[log W_k]   gap    s_k
 1    4.924      4.307   -0.616  0.250
 2    3.219      3.255    0.036  0.521
 3    2.803      2.451   -0.352  0.303
 4    2.197      1.653   -0.545  0.493
smallest k with gap(k) &gt;= gap(k+1) - s(k+1): 2

500 customers, 4 hidden types
 k  log(W_k)  E*[log W_k]   gap    s_k
 1   10.431     10.426   -0.005  0.034
 2    9.664      9.824    0.160  0.029
 3    8.139      9.428    1.288  0.021
 4    6.855      9.030    2.174  0.026
 5    6.752      8.806    2.054  0.034
 6    6.645      8.627    1.982  0.036
 7    6.524      8.457    1.933  0.035
smallest k with gap(k) &gt;= gap(k+1) - s(k+1): 4</div>
  <p>Our customers: Gap(1) = −0.616 is not ≥ Gap(2) − s₂ = 0.036 − 0.521 = −0.485, so k = 1 is rejected; Gap(2) = 0.036 ≥ Gap(3) − s₃ = −0.352 − 0.303 = −0.655, so k = 2. With only 8 points the uncertainty s_k is large (about 0.3–0.5), a reminder that eight customers are a teaching example, not evidence. On the 500 customers the gap climbs to 2.174 at k = 4 and then falls: k = 4, with tiny s_k.</p>
  <h3>Other indices and the business check</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Measures</th><th>Pick</th><th>Our customers</th><th>Weakness</th></tr>
    <tr><td>Elbow</td><td>inertia vs k</td><td>the bend</td><td>2</td><td>subjective; often no clear bend</td></tr>
    <tr><td>Silhouette</td><td>own vs nearest-other distance</td><td>maximum</td><td>2 (0.629)</td><td>favours round blobs; O(n²)</td></tr>
    <tr><td>Gap statistic</td><td>log W_k vs uniform data</td><td>rule above</td><td>2</td><td>slow (B × K-Means runs); reference choice matters</td></tr>
    <tr><td>Calinski–Harabasz</td><td>(BCSS/(k−1)) / (WCSS/(n−k))</td><td>maximum</td><td>2 (27.0)</td><td>favours round, equal groups</td></tr>
    <tr><td>Davies–Bouldin</td><td>average worst ratio of scatter to separation</td><td>minimum</td><td>5 (0.273) — misleading on 8 points</td><td>also favours round groups</td></tr>
    <tr><td>Business</td><td>can each group be named and acted on?</td><td>usable k</td><td>2 offers</td><td>needs a human</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Silhouette</strong> of point i: s(i) = (b(i) − a(i))/max(a(i), b(i)); the clustering's silhouette is the mean over all points. <strong>Gap statistic</strong>: Gap(k) = (1/B)Σ_b log W*_kb − log W_k with W_k the inertia; choose the smallest k with Gap(k) ≥ Gap(k+1) − s_{k+1}.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>All of these scores measure "round, separated blobs", the same picture K-Means has. They can agree with each other and still be wrong for moons, chains or nested groups. And k = 1 is only ever tested by the gap statistic.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Assumptions.</b> Every tool here assumed K-Means' picture of a group. What exactly is that picture, and what happens to data that does not fit it?</div>

  <h2 id="km-fail"><span class="num">07</span>Assumptions &amp; Failures</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Nearest centre wins" sounds neutral. What shape of group does it actually allow, and how does it break on real data, including one unusual customer?</p>
  </div>
  <h3>The boundary is always a straight line</h3>
  <p>A point x is on the border between centres μ₁ and μ₂ when ‖x − μ₁‖² = ‖x − μ₂‖². Expand both sides: ‖x‖² − 2x·μ₁ + ‖μ₁‖² = ‖x‖² − 2x·μ₂ + ‖μ₂‖². The ‖x‖² cancels, leaving a <em>linear</em> equation: 2x·(μ₂ − μ₁) = ‖μ₂‖² − ‖μ₁‖².</p>
  <p>For our final centres μ₁ = (3.25, 0.75), μ₂ = (7.75, 6.75): μ₂ − μ₁ = (4.5, 6); ‖μ₂‖² = 60.0625 + 45.5625 = 105.625; ‖μ₁‖² = 10.5625 + 0.5625 = 11.125. So 9·visits + 12·spend = 94.5, or <strong>3·visits + 4·spend = 31.5</strong>. Below the line → light group. A new customer with 5 visits and ₹4,000: 15 + 16 = 31 → light group, just. With 6 visits: 18 + 16 = 34 → heavy.</p>
  <div class="fx" data-lang="py">c1, c2 = C_final                                             # (3.25, 0.75) and (7.75, 6.75)
w = 2 * (c2 - c1); t = (c2 @ c2) - (c1 @ c1)                 # boundary: w . x = t
print("boundary:", w, ". x =", t, "  -&gt; divide by 3:", w / 3, ". x =", t / 3)
new = np.array([[5, 4], [6, 4], [4, 3]], dtype=float)
for x in new:
    side = "c1" if w @ x &lt; t else "c2"
    print(f"customer {x}: 3*visits + 4*spend = {(w / 3) @ x:5.1f}  vs 31.5 -&gt; {side}")
km2 = KMeans(2, n_init=10, random_state=0).fit(P)
print("sklearn predict:", km2.predict(new), " (label of A is", km2.labels_[0], ")")</div>
  <div class="fx" data-lang="text">boundary: [ 9. 12.] . x = 94.5   -&gt; divide by 3: [3. 4.] . x = 31.5
customer [5. 4.]: 3*visits + 4*spend =  31.0  vs 31.5 -&gt; c1
customer [6. 4.]: 3*visits + 4*spend =  34.0  vs 31.5 -&gt; c2
customer [4. 3.]: 3*visits + 4*spend =  24.0  vs 31.5 -&gt; c1
sklearn predict: [1 0 1]  (label of A is 1 )</div>
  <p>With k centres the space is cut into k convex regions by such straight lines (a <strong>Voronoi diagram</strong>). That single fact explains every assumption:</p>
  <table class="tbl">
    <tr><th>Assumption</th><th>Why it follows</th><th>What breaks</th><th>Fix</th></tr>
    <tr><td>Groups are roughly round</td><td>squared Euclidean treats every direction equally</td><td>stretched groups get cut across</td><td>GMM (full covariance), or whitening/PCA</td></tr>
    <tr><td>Groups have similar spread</td><td>the border sits halfway between centres, whatever the spread</td><td>a wide group spills into a tight one</td><td>GMM, HDBSCAN</td></tr>
    <tr><td>Groups have similar size</td><td>inertia prefers splitting a big group to leaving it whole</td><td>big group split, small ones merged</td><td>GMM, HDBSCAN</td></tr>
    <tr><td>Groups are convex</td><td>Voronoi regions are convex</td><td>moons, rings</td><td>DBSCAN, single linkage, spectral</td></tr>
    <tr><td>Features are scaled</td><td>Euclidean distance</td><td>the widest column decides</td><td><code>StandardScaler</code> in a pipeline</td></tr>
    <tr><td>No outliers</td><td>means and squares are pulled by extremes</td><td>an outlier steals a centre</td><td>remove, k-medoids, DBSCAN</td></tr>
    <tr><td>Numeric features</td><td>a mean must exist</td><td>"mean of Pune and Delhi"</td><td>k-modes, k-prototypes, Gower + k-medoids</td></tr>
  </table>
  <h3>The failures, measured at scale</h3>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.mixture import GaussianMixture
from sklearn.metrics import adjusted_rand_score as ari

cases = {}
X, y = make_blobs(n_samples=600, random_state=170)
cases["stretched"] = (X @ np.array([[0.608, -0.637], [-0.409, 0.853]]), y, 3)
cases["unequal spread"] = make_blobs(600, centers=[[0, 0], [5, 0], [10, 0]],
                                     cluster_std=[0.5, 2.5, 0.5], random_state=170) + (3,)
cases["unequal size"] = make_blobs([500, 30, 30], centers=[[0, 0], [4, 2], [4, -2]],
                                   cluster_std=[1.6, 0.4, 0.4], random_state=0) + (3,)
cases["moons"] = make_moons(600, noise=0.06, random_state=0) + (2,)
print(f"{'case':15s} k-means ARI   GMM(full) ARI")
for name, (X, y, k) in cases.items():
    a1 = ari(y, KMeans(k, n_init=10, random_state=0).fit_predict(X))
    a2 = ari(y, GaussianMixture(k, covariance_type="full", n_init=3, random_state=0).fit_predict(X))
    print(f"{name:15s} {a1:8.2f}      {a2:8.2f}")</div>
  <div class="fx" data-lang="text">case            k-means ARI   GMM(full) ARI
stretched           0.59          1.00
unequal spread      0.71          0.94
unequal size        0.09          0.81
moons               0.26          0.49</div>
  <p>Stretched groups: 0.59 vs GMM's perfect 1.00. A wide group between two tight ones: 0.71 vs 0.94. A 500-point loose group next to two 30-point tight ones: K-Means splits the big one and merges the small ones, ARI 0.09, while GMM gets 0.81. Moons: 0.26; GMM is also poor (0.49), because a moon is not an ellipse either; that is <a class="xref" data-note="ml_dbscan">DBSCAN</a>'s job.</p>
  <h3>One outlier on our customers</h3>
  <p>A wholesale buyer I joins: 30 visits and ₹30,000 a month, far from everyone.</p>
  <div class="fx" data-lang="py">P9 = np.vstack([P, [[30, 30]]])                               # customer I: a wholesale buyer, far from everyone
km9 = KMeans(2, n_init=10, random_state=0).fit(P9)
names9 = names + ["I"]
print("k=2 with I:", ["".join(np.array(names9)[km9.labels_ == k]) for k in range(2)],
      " centres:", km9.cluster_centers_.round(2).tolist(), " inertia", round(km9.inertia_, 1))
print("mean of A..H =", P.mean(0), "   mean of A..I =", P9.mean(0).round(2))</div>
  <div class="fx" data-lang="text">k=2 with I: ['ABCDEFGH', 'I']  centres: [[5.5, 3.75], [30.0, 30.0]]  inertia 137.5
mean of A..H = [5.5  3.75]    mean of A..I = [8.22 6.67]</div>
  <p>With k = 2, K-Means spends one whole centre on I alone and lumps A–H into one group. Why? Leaving I in a group costs a huge squared distance (the square of ~27), so giving it its own centre lowers inertia more than separating light from heavy customers (which saves only 112.5). The mean of the whole table also jumps from (5.5, 3.75) to (8.22, 6.67) because of one row.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>K-Means implicitly assumes each cluster is a spherical Gaussian with the same variance and that every point belongs to one cluster: it is the limit of a Gaussian mixture with covariance σ²I as σ → 0 (hard assignments). Its decision regions form the <strong>Voronoi tessellation</strong> of the centres.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>K-Means never says "this data does not fit me". It returns k labels on moons, rings and outlier-heavy data alike. Plot the data (or a PCA projection) and profile the groups.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: K-medoids and variants.</b> One wholesale buyer wrecked our two groups because a mean is pulled by extremes. Is there a centre that a single outlier cannot drag, and that works with other distances too?</div>

  <h2 id="km-variants"><span class="num">08</span>K-Medoids &amp; Other Variants</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The mean is fragile and needs numeric columns and Euclidean distance. What if the centre had to be an actual customer?</p>
  </div>
  <h3>K-medoids by hand</h3>
  <p>A <strong>medoid</strong> is the member of a group with the smallest total distance to the other members: a real row, not an average. K-medoids alternates the same two steps as Lloyd: assign each row to the nearest medoid, then, inside each group, pick as new medoid the member with the smallest total distance to the others. It accepts any distance matrix (Manhattan, cosine, Gower) and, because it uses plain (not squared) distances and real rows, a single outlier cannot drag a medoid away.</p>
  <p>On A–I (with the wholesale buyer), starting from medoids B and C:</p>
  <div class="fx" data-lang="py">from scipy.spatial.distance import cdist
def k_medoids(X, init_idx, max_iter=20):
    D = cdist(X, X)                                          # any distance works; here Euclidean
    med = list(init_idx)
    for _ in range(max_iter):
        lab = D[:, med].argmin(1)                            # assign to nearest medoid
        new = []
        for k in range(len(med)):
            members = np.where(lab == k)[0]
            cost = D[np.ix_(members, members)].sum(1)        # total distance from each member to the others
            new.append(members[cost.argmin()])               # the member with the smallest total = new medoid
        if new == med: break
        med = new
    return med, lab, D[np.arange(len(X)), np.array(med)[lab]].sum()

med, lab, cost = k_medoids(P9, [1, 2])
print("k-medoids with I:", ["".join(np.array(names9)[lab == k]) for k in range(2)],
      " medoids:", [names9[m] for m in med], " total distance", round(cost, 2))
from sklearn.cluster import BisectingKMeans
bk = BisectingKMeans(3, random_state=0).fit(P)
print("bisecting k-means, k=3:", ["".join(np.array(names)[bk.labels_ == k]) for k in range(3)])</div>
  <div class="fx" data-lang="text">k-medoids with I: ['ABCD', 'EFGHI']  medoids: ['B', 'G']  total distance 44.3
bisecting k-means, k=3: ['ABCD', 'EGH', 'F']</div>
  <p>K-medoids recovers {A, B, C, D} with medoid B and puts I with the heavy group {E, F, G, H} around medoid G. The outlier is simply the farthest member of a group; it does not get a centre of its own. The 1D intuition: for the values 1, 2, 3, 100 the mean is 26.5 (pulled toward 100) but the median is 2.5; medoids behave like medians.</p>
  <p>The classic algorithm is <strong>PAM</strong> (Partitioning Around Medoids), which tries swapping each medoid with each non-medoid: O(k(n − k)²) per pass, so it suits thousands of rows, not millions (CLARA and CLARANS sample to scale). A ready implementation is <code>KMedoids</code> in the <code>scikit-learn-extra</code> package.</p>
  <h3>The family of cousins</h3>
  <table class="tbl">
    <tr><th>Variant</th><th>Centre</th><th>Distance</th><th>Use when</th></tr>
    <tr><td><strong>K-medoids (PAM)</strong></td><td>a real row</td><td>any</td><td>outliers, non-Euclidean or Gower distances, interpretable "typical customer"</td></tr>
    <tr><td><strong>K-medians</strong></td><td>column-wise median</td><td>Manhattan (L1)</td><td>outliers in numeric data</td></tr>
    <tr><td><strong>Bisecting K-Means</strong></td><td>mean</td><td>Euclidean</td><td>top-down splitting (a divisive hierarchy); sklearn <code>BisectingKMeans</code>; gave {ABCD}, {EGH}, {F} at k = 3</td></tr>
    <tr><td><strong>K-modes / k-prototypes</strong></td><td>mode per category (+ mean for numbers)</td><td>mismatch count (+ Euclidean)</td><td>categorical or mixed tables at scale</td></tr>
    <tr><td><strong>Spherical K-Means</strong></td><td>normalised mean</td><td>cosine</td><td>text and embeddings (normalise rows, then K-Means)</td></tr>
    <tr><td><strong>Kernel K-Means / spectral</strong></td><td>mean in a feature space</td><td>kernel</td><td>non-convex shapes, small n</td></tr>
    <tr><td><strong>Fuzzy c-means</strong></td><td>weighted mean</td><td>Euclidean</td><td>soft memberships; see <a class="xref" data-note="ml_gmm">GMM</a> for the probabilistic version</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>K-medoids</strong> minimises Σⱼ Σ_{x∈Cⱼ} d(x, mⱼ) where each medoid mⱼ must be one of the data points and d is any dissimilarity. Because centres are data points, it works with a precomputed distance matrix and is robust to outliers (an L1-type objective rather than squared L2).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>K-medoids needs the full n × n distance matrix (or repeated distance computations), so it is far slower than K-Means. Use it when its robustness or distance flexibility is needed, not by default.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Mini-batch.</b> K-medoids is slower than K-Means. But even plain K-Means touches every row every iteration. What if the shop had 10 crore rows?</div>

  <h2 id="km-mini"><span class="num">09</span>Mini-Batch K-Means</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each Lloyd iteration reads all n rows. For data that barely fits in memory, or arrives as a stream, can centres be updated from a small sample at a time?</p>
  </div>
  <h3>The running-mean update, by hand</h3>
  <p>Keep, for each centre, a count of how many points it has absorbed. When a new point x is assigned to centre c, nudge c toward x with step η = 1/count:</p>
  <p style="text-align:center"><strong>count ← count + 1; &nbsp; c ← c + (x − c) / count</strong></p>
  <p>This is exactly a running mean. Start the light centre at B (3, 0) with count 1. A (2, 0) arrives: count 2, c = (3, 0) + ((2, 0) − (3, 0))/2 = (2.5, 0). C (4, 0): count 3, c = (2.5, 0) + (1.5, 0)/3 = (3, 0). D (4, 3): count 4, c = (3, 0) + (1, 3)/4 = <strong>(3.25, 0.75)</strong>, the mean of A–D, without ever storing them.</p>
  <p>Mini-batch K-Means repeats: draw a random batch (e.g. 1,024 rows), assign them to the nearest centres, apply this update. Early on centres move a lot; as counts grow the steps shrink and centres settle.</p>
  <div class="fx" data-lang="py">from sklearn.cluster import MiniBatchKMeans
# the per-centre update, by hand: centre c has absorbed \`count\` points; a new point x arrives
c, count = np.array([3.0, 0.0]), 1                           # centre starts at B, which counts as 1 point
for nm in ["A", "C", "D"]:
    x = P[names.index(nm)]; count += 1
    eta = 1 / count                                          # learning rate = 1 / points seen
    c = c + eta * (x - c)
    print(f"see {nm} {x}: eta = 1/{count} -&gt; centre {c.round(3)}")
print("mean of B, A, C, D =", P[[1, 0, 2, 3]].mean(0))

Xbig, ybig = make_blobs(n_samples=20000, centers=5, cluster_std=1.2, random_state=1)
full = KMeans(5, n_init=3, random_state=0).fit(Xbig)
mb = MiniBatchKMeans(5, batch_size=256, n_init=3, random_state=0).fit(Xbig)
print(f"KMeans inertia {full.inertia_:.0f}   MiniBatch inertia {mb.inertia_:.0f}   "
      f"ratio {mb.inertia_ / full.inertia_:.4f}   label agreement ARI {ari(full.labels_, mb.labels_):.4f}")</div>
  <div class="fx" data-lang="text">see A [2. 0.]: eta = 1/2 -&gt; centre [2.5 0. ]
see C [4. 0.]: eta = 1/3 -&gt; centre [3. 0.]
see D [4. 3.]: eta = 1/4 -&gt; centre [3.25 0.75]
mean of B, A, C, D = [3.25 0.75]
KMeans inertia 52680   MiniBatch inertia 52708   ratio 1.0005   label agreement ARI 0.9919</div>
  <p>The hand updates match. On 20,000 rows, the mini-batch inertia is only 0.05% worse than full K-Means and the groupings agree almost perfectly (ARI 0.992), while each step touched only 256 rows. <code>partial_fit</code> lets you feed batches from disk or a stream.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Mini-batch K-Means</strong> (Sculley, 2010) is stochastic gradient descent on the inertia: for each sampled point x assigned to centre c, c ← (1 − η)c + ηx with per-centre learning rate η = 1/(points seen by c). See <a class="xref" data-note="m_optimization">Optimization</a> for SGD.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mini-batch results are a bit noisier and can leave small clusters poorly placed. Use it when n is large (hundreds of thousands and up); for small data the full algorithm is fast enough and slightly better.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sklearn in practice.</b> We understand every moving part. Which knobs does sklearn expose, what do they do, and how do we put scaling and K-Means together safely?</div>

  <h2 id="km-sklearn"><span class="num">10</span>scikit-learn in Practice</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do the ideas of sections 02–09 map onto sklearn's <code>KMeans</code> arguments and attributes, and how do we read the centres in real units after scaling?</p>
  </div>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning (section)</th></tr>
    <tr><td><code>n_clusters</code></td><td>8</td><td>k (06)</td></tr>
    <tr><td><code>init</code></td><td>"k-means++"</td><td>"k-means++", "random", an array of centres, or a callable (05)</td></tr>
    <tr><td><code>n_init</code></td><td>"auto"</td><td>number of restarts; keep the lowest inertia (05)</td></tr>
    <tr><td><code>max_iter</code>, <code>tol</code></td><td>300, 1e-4</td><td>stopping rules (04)</td></tr>
    <tr><td><code>algorithm</code></td><td>"lloyd"</td><td>"lloyd" or "elkan" (04)</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>seed for reproducible starts</td></tr>
    <tr><td><code>copy_x</code></td><td>True</td><td>whether to centre a copy of X internally</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Attribute / method</th><th>Gives</th></tr>
    <tr><td><code>labels_</code>, <code>cluster_centers_</code></td><td>group of each training row; centres (k × d)</td></tr>
    <tr><td><code>inertia_</code>, <code>n_iter_</code></td><td>final WCSS; iterations of the best run</td></tr>
    <tr><td><code>predict(X)</code></td><td>nearest centre for new rows</td></tr>
    <tr><td><code>transform(X)</code></td><td>distance from each row to every centre (n × k)</td></tr>
    <tr><td><code>score(X)</code></td><td>−inertia on X (higher is better, sklearn convention)</td></tr>
    <tr><td><code>fit_predict</code>, <code>fit_transform</code></td><td>fit and return labels / distances in one call</td></tr>
  </table>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
km = KMeans(n_clusters=2, init="k-means++", n_init=10, max_iter=300, tol=1e-4, random_state=0).fit(P)
print("labels_         ", km.labels_)
print("cluster_centers_", km.cluster_centers_.tolist())
print("inertia_        ", km.inertia_, "  n_iter_", km.n_iter_)
print("transform (distance to each centre) for A and H:\\n", km.transform(P[[0, 7]]).round(3))
print("score = -inertia:", km.score(P))

pipe = make_pipeline(StandardScaler(), KMeans(2, n_init=10, random_state=0)).fit(P)
scaler, kmp = pipe[0], pipe[-1]
print("centres in scaled units  :", kmp.cluster_centers_.round(3).tolist())
print("centres back in real units:", scaler.inverse_transform(kmp.cluster_centers_).round(3).tolist())
print("new customers -&gt;", pipe.predict([[5, 4], [8, 8]]))</div>
  <div class="fx" data-lang="text">labels_          [1 1 1 1 0 0 0 0]
cluster_centers_ [[7.75, 6.75], [3.25, 0.75]]
inertia_         25.0   n_iter_ 2
transform (distance to each centre) for A and H:
 [[8.867 1.458]
 [2.372 9.062]]
score = -inertia: -25.0
centres in scaled units  : [[0.9, 0.907], [-0.9, -0.907]]
centres back in real units: [[7.75, 6.75], [3.25, 0.75]]
new customers -&gt; [1 0]</div>
  <p>Read the output: labels put A–D together and E–H together (ids 0/1 are arbitrary; here the heavy group is 0). Inertia 25.0, as by hand. <code>transform</code> shows A is 1.458 from the light centre (√2.125) and 8.867 from the heavy one. Inside the pipeline the centres live in scaled units (±0.9); <code>inverse_transform</code> brings them back to (7.75, 6.75) and (3.25, 0.75), the numbers a manager understands. Two new customers are labelled with the same scaler and centres.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>Pipeline</strong> (<code>make_pipeline(StandardScaler(), KMeans(...))</code>) fits the scaler on the training rows and reuses those exact means and standard deviations for every later <code>predict</code>, so new customers land in the same coordinate system as the centres. See <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Label ids are arbitrary and can swap between runs or library versions (our hand trace called the light group 0; this run called it 1). Map ids to meaning through the centres, never hard-code "cluster 0 = premium".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From scratch.</b> sklearn is a black box until we can rebuild it. Can we write K-Means with k-means++ and n_init ourselves and get exactly sklearn's answer?</div>

  <h2 id="km-scratch"><span class="num">11</span>From Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Do we really understand every piece? The test: about 40 lines of numpy that reproduce sklearn's labels, centres and inertia.</p>
  </div>
  <p>The class has three parts: <code>_plusplus</code> (section 05: D² sampling), <code>_lloyd</code> (section 03: assign, update, stop when centres barely move; empty clusters keep their old centre), and <code>fit</code> (section 05: <code>n_init</code> runs, keep the lowest inertia).</p>
  <div class="fx" data-lang="py">class MyKMeans:
    def __init__(self, k, n_init=10, max_iter=300, tol=1e-4, seed=0):
        self.k, self.n_init, self.max_iter, self.tol = k, n_init, max_iter, tol
        self.rng = np.random.default_rng(seed)

    def _plusplus(self, X):                                  # k-means++ seeding
        C = [X[self.rng.integers(len(X))]]
        for _ in range(1, self.k):
            D2 = ((X[:, None] - np.array(C)[None]) ** 2).sum(2).min(1)
            C.append(X[self.rng.choice(len(X), p=D2 / D2.sum())])
        return np.array(C)

    def _lloyd(self, X, C):
        for it in range(1, self.max_iter + 1):
            d2 = ((X[:, None] - C[None]) ** 2).sum(2)
            lab = d2.argmin(1)                               # assign
            newC = np.array([X[lab == j].mean(0) if (lab == j).any() else C[j]   # update (keep empty)
                             for j in range(self.k)])
            shift = ((newC - C) ** 2).sum()
            C = newC
            if shift &lt;= self.tol: break
        d2 = ((X[:, None] - C[None]) ** 2).sum(2)
        return C, d2.argmin(1), d2.min(1).sum(), it

    def fit(self, X):
        best = min((self._lloyd(X, self._plusplus(X)) for _ in range(self.n_init)), key=lambda r: r[2])
        self.cluster_centers_, self.labels_, self.inertia_, self.n_iter_ = best
        return self

    def predict(self, X):
        return ((X[:, None] - self.cluster_centers_[None]) ** 2).sum(2).argmin(1)

mine = MyKMeans(2).fit(P)
print("ours   :", mine.labels_, mine.cluster_centers_.tolist(), mine.inertia_)
print("sklearn:", km.labels_, km.cluster_centers_.tolist(), km.inertia_)
mine4 = MyKMeans(4).fit(X4)
sk4 = KMeans(4, n_init=10, random_state=0).fit(X4)
print(f"500 customers: ours {mine4.inertia_:.3f}  sklearn {sk4.inertia_:.3f}  "
      f"same grouping ARI {ari(mine4.labels_, sk4.labels_):.3f}")</div>
  <div class="fx" data-lang="text">ours   : [1 1 1 1 0 0 0 0] [[7.75, 6.75], [3.25, 0.75]] 25.0
sklearn: [1 1 1 1 0 0 0 0] [[7.75, 6.75], [3.25, 0.75]] 25.0
500 customers: ours 948.890  sklearn 948.890  same grouping ARI 1.000</div>
  <p>Identical labels, centres and inertia (25.0) on our eight customers, and the same inertia 948.890 with a perfect ARI of 1.000 on the 500-customer data. The only differences from sklearn are engineering: chunked distance computation, the greedy k-means++ variant, multithreading and the empty-cluster rule.</p>
  <div class="bridge"><b>What this still can't tell us → next: Beyond segmentation.</b> So far K-Means grouped customers. The same "replace a point by its nearest centre" idea is useful far outside segmentation.</div>

  <h2 id="km-uses"><span class="num">12</span>Beyond Segmentation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If every row can be replaced by its nearest centre, what else can that compression do?</p>
  </div>
  <h3>Colour quantisation</h3>
  <p>A photo is a table of pixels with three columns (red, green, blue). Cluster the colours into k centres and repaint each pixel with its centre's colour: the image now needs only k colours, a palette of k entries plus one small index per pixel.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_sample_image
img = load_sample_image("china.jpg") / 255.0                 # 427 x 640 photo, RGB in [0, 1]
pix = img.reshape(-1, 3)
rng = np.random.default_rng(0)
sample = pix[rng.choice(len(pix), 2000, replace=False)]      # fit on 2,000 pixels only
for k in [4, 16, 64]:
    q = KMeans(k, n_init=3, random_state=0).fit(sample)
    new = q.cluster_centers_[q.predict(pix)]                 # repaint every pixel with its centre's colour
    print(f"k={k:2d}: colours {k:3d} (was {len(np.unique(pix, axis=0))})   "
          f"mean squared error {((pix - new) ** 2).mean():.5f}")</div>
  <div class="fx" data-lang="text">k= 4: colours   4 (was 96615)   mean squared error 0.00705
k=16: colours  16 (was 96615)   mean squared error 0.00182
k=64: colours  64 (was 96615)   mean squared error 0.00064</div>
  <p>The photo has 96,615 distinct colours. With 16 colours the mean squared error is 0.0018 on a 0–1 scale, hardly visible; 64 colours is almost lossless. Fitting on 2,000 sampled pixels and predicting all 2.7 lakh is a common speed trick. This is <strong>vector quantisation</strong>, the same idea used to compress embeddings in vector databases (<a class="xref" data-note="vectordb">product quantisation</a>).</p>
  <h3>K-Means as feature engineering</h3>
  <ul>
    <li><strong>Segment id</strong> as a categorical feature for a supervised model.</li>
    <li><strong>Distances to all centres</strong> (<code>transform</code>) as k new numeric features: a cheap non-linear map (like RBF features).</li>
    <li><strong>Distance to the nearest centre</strong> as an anomaly score: rows far from every centre are unusual.</li>
    <li><strong>Bag of visual words</strong>: cluster image patches, describe each image by how often each centre appears.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If you use cluster features in a supervised model, fit the K-Means inside the cross-validation folds (put it in the pipeline). Fitting it on all rows first leaks information from the validation rows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met a dozen ideas. How do they hang together, and which one answers which question?</div>

  <h2 id="km-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Inertia, the mean, Lloyd, k-means++, elbow, silhouette, gap, medoids, mini-batch: separate facts, or one system grown from a single idea?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="km-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">squared distance</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="10">‖x − μ‖² (previous note)</text>
<line x1="160" y1="32" x2="193" y2="32" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="195" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="270" y="29" text-anchor="middle" font-size="11.5" font-weight="700">inertia (WCSS)</text><text x="270" y="45" text-anchor="middle" class="tm" font-size="10">sum over all points: 25</text>
<line x1="345" y1="32" x2="378" y2="32" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="380" y="10" width="140" height="44" rx="7" class="fb sb"/><text x="450" y="29" text-anchor="middle" font-size="11.5" font-weight="700">best centre = mean</text><text x="450" y="45" text-anchor="middle" class="tm" font-size="10">derivative = 0</text>
<line x1="520" y1="32" x2="548" y2="32" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="550" y="10" width="120" height="44" rx="7" class="fb sb"/><text x="610" y="29" text-anchor="middle" font-size="11.5" font-weight="700">TSS = W + B</text><text x="610" y="45" text-anchor="middle" class="tm" font-size="10">137.5 = 25 + 112.5</text>
<line x1="270" y1="54" x2="270" y2="86" stroke="currentColor" marker-end="url(#km-a9)"/><line x1="450" y1="54" x2="300" y2="86" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="160" y="88" width="220" height="44" rx="7" class="ft st"/><text x="270" y="107" text-anchor="middle" font-size="11.5" font-weight="700">Lloyd: assign ⇄ update</text><text x="270" y="123" text-anchor="middle" class="tm" font-size="10">264 → 47 → 32 → 25, never rises</text>
<line x1="380" y1="110" x2="428" y2="110" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="430" y="88" width="160" height="44" rx="7" class="fr sr"/><text x="510" y="107" text-anchor="middle" font-size="11.5" font-weight="700">local minima</text><text x="510" y="123" text-anchor="middle" class="tm" font-size="10">20.17 vs 16.5 (k = 3)</text>
<line x1="510" y1="132" x2="510" y2="164" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="430" y="166" width="160" height="44" rx="7" class="ft st"/><text x="510" y="185" text-anchor="middle" font-size="11.5" font-weight="700">k-means++ · n_init</text><text x="510" y="201" text-anchor="middle" class="tm" font-size="10">D² sampling, keep best run</text>
<line x1="270" y1="132" x2="140" y2="164" stroke="currentColor" marker-end="url(#km-a9)"/><line x1="270" y1="132" x2="300" y2="164" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="20" y="166" width="200" height="44" rx="7" class="fg sg"/><text x="120" y="185" text-anchor="middle" font-size="11.5" font-weight="700">choose k</text><text x="120" y="201" text-anchor="middle" class="tm" font-size="10">elbow · silhouette · gap</text>
<rect x="235" y="166" width="170" height="44" rx="7" class="fg sg"/><text x="320" y="185" text-anchor="middle" font-size="11.5" font-weight="700">linear boundaries</text><text x="320" y="201" text-anchor="middle" class="tm" font-size="10">3·visits + 4·spend = 31.5</text>
<line x1="320" y1="210" x2="320" y2="240" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="190" y="242" width="260" height="36" rx="7" class="fr sr"/><text x="320" y="264" text-anchor="middle" font-size="11.5">assumes round, similar, outlier-free groups</text>
<line x1="230" y1="278" x2="95" y2="296" stroke="currentColor" marker-end="url(#km-a9)"/><line x1="320" y1="278" x2="320" y2="296" stroke="currentColor" marker-end="url(#km-a9)"/><line x1="410" y1="278" x2="555" y2="296" stroke="currentColor" marker-end="url(#km-a9)"/>
<rect x="10" y="298" width="170" height="28" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="317" text-anchor="middle" font-size="10.5">outliers → k-medoids</text>
<rect x="235" y="298" width="170" height="28" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="320" y="317" text-anchor="middle" font-size="10.5">huge n → mini-batch</text>
<rect x="460" y="298" width="210" height="28" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="565" y="317" text-anchor="middle" font-size="10.5">ellipses, soft → GMM; chains → others</text>
</svg><figcaption>Everything in this note grows out of one quantity: the squared distance from a point to its centre. Summed, it is inertia; minimised over the centre, it gives the mean; alternated with assignment, it is Lloyd's algorithm; its weaknesses lead to k-means++, the k-choosing tools and the variants.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same eight customers</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our customers</th><th>Sensitive to</th><th>Use when</th></tr>
    <tr><td>Squared distance</td><td>Euclidean distance, squared</td><td>how far is a point from a centre?</td><td>A to light centre 2.125</td><td>scale, outliers</td><td>always (it is K-Means' ruler)</td></tr>
    <tr><td>Inertia (WCSS)</td><td>sum of squared distances</td><td>how tight is this grouping?</td><td>25</td><td>k (always falls), scale</td><td>comparing runs at the same k</td></tr>
    <tr><td>Mean as centre</td><td>derivative of inertia = 0</td><td>where should a centre sit?</td><td>(3.25, 0.75), (7.75, 6.75)</td><td>outliers</td><td>numeric data</td></tr>
    <tr><td>TSS = WCSS + BCSS</td><td>inertia + grand mean</td><td>is tight also well separated?</td><td>137.5 = 25 + 112.5</td><td>—</td><td>explaining the objective; CH index</td></tr>
    <tr><td>Lloyd's algorithm</td><td>nearest centre + mean, alternated</td><td>how to search?</td><td>264 → 47 → 32 → 25</td><td>starting centres</td><td>always</td></tr>
    <tr><td>Local minimum</td><td>Lloyd's fixed points</td><td>can it stop wrongly?</td><td>k = 3: 20.17 vs 16.5</td><td>start</td><td>reason for n_init</td></tr>
    <tr><td>k-means++</td><td>squared distance to chosen centres</td><td>how to start?</td><td>B → G (p .283) → E (p .294)</td><td>outliers</td><td>default init</td></tr>
    <tr><td>Elbow</td><td>inertia across k</td><td>how many groups (by eye)?</td><td>bend at 2</td><td>judgement</td><td>quick first look</td></tr>
    <tr><td>Silhouette</td><td>average distances a, b</td><td>how well is each point placed?</td><td>s(D) 0.411; mean 0.629</td><td>shape bias</td><td>choosing k, spotting border rows</td></tr>
    <tr><td>Gap statistic</td><td>log inertia vs uniform data</td><td>better than no structure?</td><td>k = 2</td><td>cost, reference</td><td>testing k = 1</td></tr>
    <tr><td>Voronoi boundary</td><td>equal squared distance</td><td>what shapes are possible?</td><td>3·visits + 4·spend = 31.5</td><td>—</td><td>explaining failures</td></tr>
    <tr><td>K-medoids</td><td>real rows as centres, any distance</td><td>resist outliers?</td><td>with I: {ABCD}, {EFGHI}</td><td>cost O(n²)</td><td>outliers, Gower</td></tr>
    <tr><td>Mini-batch</td><td>running mean of samples</td><td>huge data?</td><td>B, A, C, D → (3.25, 0.75)</td><td>batch noise</td><td>n ≥ 10⁵</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>K-Means minimises the sum of squared distances to centres, by alternating the two moves that each solve half of that problem.</strong> Squaring makes the mean optimal (and outliers dangerous), the alternation makes it converge (to a local minimum, so starts matter), and "nearest centre" makes boundaries straight (so shapes matter).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Where does K-Means stand against the other algorithms of the group?</div>

  <h2 id="km-compare"><span class="num">14</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When should you choose K-Means over its siblings, and when not?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>K-Means</th><th>K-Medoids</th><th><a class="xref" data-note="ml_hierarchical">Hierarchical</a></th><th><a class="xref" data-note="ml_dbscan">DBSCAN</a></th><th><a class="xref" data-note="ml_gmm">GMM</a></th></tr>
    <tr><td>Must give</td><td>k</td><td>k</td><td>linkage, cut</td><td>eps, min_samples</td><td>k, covariance type</td></tr>
    <tr><td>Centre</td><td>mean</td><td>real row</td><td>none</td><td>none</td><td>mean + covariance</td></tr>
    <tr><td>Distance</td><td>squared Euclidean</td><td>any</td><td>any (Ward: Euclidean)</td><td>any</td><td>Mahalanobis per component</td></tr>
    <tr><td>Shapes</td><td>round, convex</td><td>round-ish</td><td>linkage-dependent</td><td>any</td><td>ellipses</td></tr>
    <tr><td>Outliers</td><td>steal centres</td><td>robust</td><td>forced in</td><td>noise label</td><td>low likelihood</td></tr>
    <tr><td>Output</td><td>hard</td><td>hard</td><td>tree</td><td>hard + noise</td><td>soft</td></tr>
    <tr><td>Scale</td><td>millions (mini-batch: more)</td><td>thousands</td><td>~10⁴</td><td>~10⁵–10⁶ with index</td><td>~10⁵</td></tr>
    <tr><td>New rows</td><td>predict</td><td>predict</td><td>no</td><td>no</td><td>predict_proba</td></tr>
  </table>
  <p>K-Means is the right first try for large numeric data where groups are compact and you need to label new rows fast. Choose a sibling when its assumption fits better: medoids for outliers or custom distances, hierarchical for small data and a taxonomy, DBSCAN for odd shapes and noise, GMM for elliptical or overlapping groups and probabilities.</p>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a>.</b> K-Means makes you commit to one k before seeing any structure. Hierarchical clustering builds the answer for every k at once, as a tree you can cut afterwards.</div>

  <h2 id="km-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: not scaling</span><p>Euclidean distance listens to the widest column. Put <code>StandardScaler</code> and <code>KMeans</code> in one pipeline.</p></div>
  <div class="callout trap"><span class="label">Trap: n_init=1 with random init</span><p>One run can be stuck in a local minimum (30 random seeds: median inertia 4× the best). Use k-means++ and several restarts.</p></div>
  <div class="callout trap"><span class="label">Trap: picking k by lowest inertia</span><p>Inertia always falls with k. Use the elbow, silhouette, gap and a business check.</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring outliers</span><p>Wholesale buyer I took a whole centre and merged A–H. Cap or remove extremes, or use k-medoids.</p></div>
  <div class="callout trap"><span class="label">Trap: non-round groups</span><p>Stretched, unequal or curved groups break K-Means (ARI 0.59, 0.09, 0.26) while every internal score may look fine.</p></div>
  <div class="callout trap"><span class="label">Trap: categorical columns</span><p>One-hot + K-Means gives centres like "0.4 Pune". Use k-modes/k-prototypes or Gower + k-medoids.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting label ids</span><p>Ids swap between runs. Name groups from their centres and profiles.</p></div>
  <div class="callout trap"><span class="label">Trap: over-reading border rows</span><p>D's assignment flipped on 11.25 vs 10.25. Low-silhouette rows are uncertain; report them as such.</p></div>

  <h2 id="km-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: eight customers (visits/month, spend ₹1000): A (2, 0), B (3, 0), C (4, 0), D (4, 3), E (6, 6), F (9, 5), G (9, 7), H (7, 9).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>Centres</td><td>how to summarise a group?</td><td>(3.25, 0.75), (7.75, 6.75)</td><td>which grouping is good?</td></tr>
    <tr><td>Inertia</td><td>how to score a grouping?</td><td>25</td><td>where should centres sit?</td></tr>
    <tr><td>Mean / TSS split</td><td>best centre? tight = separated?</td><td>mean; 137.5 = 25 + 112.5</td><td>too many groupings to try</td></tr>
    <tr><td>Lloyd</td><td>how to search?</td><td>264 → 47 → 32 → 25</td><td>does it stop at the best?</td></tr>
    <tr><td>Local minima</td><td>is the result optimal?</td><td>k = 3: 20.17 vs 16.5</td><td>starts matter</td></tr>
    <tr><td>k-means++</td><td>how to start?</td><td>B, then G, then E</td><td>still need k</td></tr>
    <tr><td>Elbow</td><td>how many groups?</td><td>bend at 2</td><td>subjective</td></tr>
    <tr><td>Silhouette</td><td>a score with a peak?</td><td>s(D) 0.411, mean 0.629</td><td>can't test k = 1</td></tr>
    <tr><td>Gap</td><td>better than noise?</td><td>k = 2</td><td>assumes K-Means' shapes</td></tr>
    <tr><td>Assumptions</td><td>what shapes?</td><td>straight border 3v + 4s = 31.5</td><td>outliers break it</td></tr>
    <tr><td>K-medoids</td><td>robust centre?</td><td>with I: {ABCD}, {EFGHI}</td><td>slow</td></tr>
    <tr><td>Mini-batch</td><td>huge data?</td><td>running mean → (3.25, 0.75)</td><td>slightly noisier</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Inertia</td><td>J = Σⱼ Σ_{x∈Cⱼ} ‖x − μⱼ‖²</td><td>Cⱼ group j; μⱼ its centre</td></tr>
    <tr><td>Best centre</td><td>μⱼ = (1/|Cⱼ|) Σ_{x∈Cⱼ} x</td><td>from d/dc Σ(x − c)² = −2Σ(x − c) = 0</td></tr>
    <tr><td>Off-centre cost</td><td>Σ(x − c)² = Σ(x − x̄)² + n(c − x̄)²</td><td>n points, x̄ their mean</td></tr>
    <tr><td>Decomposition</td><td>TSS = WCSS + BCSS, BCSS = Σⱼ |Cⱼ| ‖μⱼ − x̄‖²</td><td>x̄ grand mean</td></tr>
    <tr><td>Assign / update</td><td>cᵢ = argminⱼ ‖xᵢ − μⱼ‖²; μⱼ = mean of its points</td><td>Lloyd</td></tr>
    <tr><td>k-means++</td><td>P(x) = D(x)² / Σ D(y)²</td><td>D(x) distance to nearest chosen centre</td></tr>
    <tr><td>Silhouette</td><td>s = (b − a)/max(a, b)</td><td>a own-group mean distance; b nearest-other-group mean distance</td></tr>
    <tr><td>Gap</td><td>Gap(k) = E*[log W_k] − log W_k; pick smallest k with Gap(k) ≥ Gap(k+1) − s_{k+1}</td><td>W_k inertia; E* over uniform reference data</td></tr>
    <tr><td>Boundary</td><td>2x·(μ₂ − μ₁) = ‖μ₂‖² − ‖μ₁‖²</td><td>a straight line / hyperplane</td></tr>
    <tr><td>Mini-batch</td><td>c ← c + (x − c)/count</td><td>count = points absorbed by c</td></tr>
    <tr><td>Cost</td><td>O(n·k·d) per iteration</td><td>n rows, k centres, d columns</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use K-Means</b><p>Large numeric data, compact roughly round groups, need to label new rows, a fast baseline.</p><small>Scale first; k-means++; n_init ≥ 10</small></div>
    <div><b>Avoid K-Means</b><p>Curved or nested shapes, very unequal sizes or spreads, heavy outliers, categorical columns, unknown structure.</p><small>DBSCAN, GMM, k-medoids, k-prototypes</small></div>
    <div><b>Choosing k</b><p>Elbow for a look, silhouette for a peak, gap to test k = 1, and a business check for usefulness.</p><small>All favour round blobs</small></div>
    <div><b>Huge data</b><p>MiniBatchKMeans with partial_fit; fit on a sample and predict the rest.</p><small>~0.05% worse inertia here</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Unscaled columns; single random start; choosing k by lowest inertia; outliers stealing centres; non-round shapes scoring well internally; one-hot categories; trusting label ids; over-reading border rows; fitting cluster features outside CV.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Group {(2,0), (3,0), (4,0), (4,3)}: centre and WCSS?</td><td>(3.25, 0.75); 9.5</td></tr>
    <tr><td>Why can't Lloyd's loop run forever?</td><td>Neither step raises inertia and there are finitely many groupings</td></tr>
    <tr><td>k-means++: D² values 1, 0, 1, 10, 45, 61, 85, 97. P(pick H)?</td><td>97/300 = 0.323</td></tr>
    <tr><td>a = 3.256, b = 5.526: silhouette?</td><td>(5.526 − 3.256)/5.526 = 0.411</td></tr>
    <tr><td>Which variant resists an outlier and accepts Gower distance?</td><td>K-medoids (PAM)</td></tr>
  </table>

  <h2 id="km-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does K-Means minimise, and why is the centre the mean?</summary><div class="qa-body">Inertia, the sum of squared Euclidean distances from each point to its own centre. For a fixed group, d/dc Σ(x − c)² = −2Σ(x − c) = 0 gives c = mean; any other centre costs an extra n(c − mean)². On A–D the visits 2, 3, 4, 4: centre 3.25 gives 2.75, centres 3 or 3.5 give 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one Lloyd iteration from centres (3, 0) and (4, 0) on our customers.</summary><div class="qa-body">Squared distances: A 1/4, B 0/1, C 1/0, D 10/9, E 45/40 … so A, B go to c1 and C–H to c2; inertia 264. Update: c1 = (2.5, 0), c2 = (6.5, 5). Repeating gives 47, 32, then 25 at the final centres (3.25, 0.75) and (7.75, 6.75).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does K-Means always converge? To the global optimum?</summary><div class="qa-body">It always converges in finitely many steps, because neither step increases inertia and the number of groupings is finite. Only to a local minimum: with k = 3 our customers end at 20.17 or 16.5 depending on the start. Use k-means++ and n_init.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain k-means++ with numbers.</summary><div class="qa-body">First centre uniform (say B). Each next centre is drawn with probability D²/ΣD², D = distance to the nearest chosen centre. From B the D² are 1, 0, 1, 10, 45, 61, 85, 97 (sum 300), so 96% of the probability is in the heavy group; then from {B, G} the sum is 34 and D or E are most likely. Expected seeding cost is O(log k) times optimal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Elbow vs silhouette vs gap statistic?</summary><div class="qa-body">Elbow: inertia vs k, pick the bend (137.5 → 25 → 16.5: k = 2); subjective. Silhouette: (b − a)/max(a, b), has a real peak (0.629 at k = 2). Gap: compares log inertia with uniform data, the only one that can choose k = 1. All favour round groups; finish with a business check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the K-Means boundary between two clusters a straight line?</summary><div class="qa-body">Setting ‖x − μ₁‖² = ‖x − μ₂‖² cancels ‖x‖² and leaves a linear equation, 2x·(μ₂ − μ₁) = ‖μ₂‖² − ‖μ₁‖². For our centres: 3·visits + 4·spend = 31.5. So regions are convex Voronoi cells, and curved groups cannot be captured.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List K-Means' assumptions and a fix for each violation.</summary><div class="qa-body">Round groups (GMM/whitening), similar spread and size (GMM, HDBSCAN), convex shapes (DBSCAN, spectral), scaled features (StandardScaler), no outliers (remove, k-medoids, DBSCAN), numeric features (k-modes/k-prototypes, Gower + k-medoids).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An outlier (30, 30) joins our eight customers. What does K-Means with k = 2 do, and what does k-medoids do?</summary><div class="qa-body">K-Means gives the outlier its own centre and merges A–H (inertia 137.5), because its squared distance is so large. K-medoids keeps {A, B, C, D} around medoid B and puts the outlier in {E, F, G, H, I} around medoid G: medoids are real rows and use plain distances, like medians.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does mini-batch K-Means update a centre?</summary><div class="qa-body">For each sampled point assigned to centre c: count += 1, c ← c + (x − c)/count, a running mean (SGD with step 1/count). From B, adding A, C, D gives (2.5, 0), (3, 0), (3.25, 0.75). On 20,000 rows its inertia was only 0.05% worse than full K-Means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of K-Means, and how does it scale?</summary><div class="qa-body">O(n·k·d) per iteration, times the number of iterations and n_init. Linear in n, so millions of rows are fine; mini-batch and fitting on a sample go further. Hierarchical clustering needs O(n²) memory by comparison.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you cluster text embeddings with K-Means?</summary><div class="qa-body">L2-normalise the vectors (so Euclidean ranks like cosine: ‖a − b‖² = 2 − 2cos), optionally reduce with PCA, then K-Means (spherical K-Means). Choose k with silhouette on cosine distance and read sample documents per cluster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is K-Means related to GMM?</summary><div class="qa-body">K-Means is the limit of a Gaussian mixture with equal spherical covariances σ²I as σ → 0: soft responsibilities become hard nearest-centre assignments and the EM M-step becomes the mean update. GMM generalises it to ellipses, different sizes and probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is K-Means related to Ward's hierarchical clustering?</summary><div class="qa-body">Both minimise within-cluster sum of squares. Ward merges, at each step, the two groups whose union increases WCSS the least, building a tree greedily; K-Means optimises WCSS for one fixed k. Ward's cut is often used to initialise K-Means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: TSS = WCSS + BCSS. Why does it matter?</summary><div class="qa-body">TSS is fixed by the data (137.5 here), so minimising within-cluster spread (25) automatically maximises between-cluster spread (112.5). It also underlies the Calinski–Harabasz index and the elbow's first big drop (112.5 when going from k = 1 to 2).</div></details>
</main>
`
});
