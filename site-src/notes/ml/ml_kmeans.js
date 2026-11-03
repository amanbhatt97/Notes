// notes/ml/ml_kmeans.js — K-Means
Object.assign(TOPIC_CONTENT, {
  "ml_kmeans": `<main>
  <h1>K-Means</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>K-Means</span></div>
  <p class="lead">K-Means is the most widely used clustering algorithm. It splits rows into k groups, describes each group by a single centre point, and finds those centres by repeating two simple moves: give every row to its nearest centre, then move every centre to the average of its rows. It is fast enough for millions of rows, easy to explain to a manager, and the starting point for customer segmentation, colour compression and many feature-engineering tricks. To understand it properly we will build it from scratch on one running example, eight customers of a small electronics shop described by visits per month and monthly spend, computing the objective, the algorithm and every refinement by hand on those eight rows before letting sklearn do the same. We will also see exactly where K-Means breaks, because knowing its assumptions is what interviewers test most.</p>

  <h2 id="km-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">K-Means</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Objective</div>
        <ul>
          <li><b>Inertia</b> = sum of squared distances to own centre (25 for our eight)</li>
          <li>Best centre for a group = its mean</li>
          <li>Total = within + between (137.5 = 25 + 112.5)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lloyd's algorithm</div>
        <ul>
          <li>Assign to nearest centre, move centre to mean, repeat</li>
          <li>Inertia never rises, so it always stops</li>
          <li>But only at a local minimum: the start matters</li>
          <li>k-means++ start + several runs (n_init)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing k</div>
        <ul>
          <li>Elbow: where inertia stops falling fast</li>
          <li>Silhouette: (b − a) / max(a, b), pick the peak</li>
          <li>Gap statistic: better than random data? (can say k = 1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits and fixes</div>
        <ul>
          <li>Borders are straight lines: round, similar, convex groups only</li>
          <li>Outliers steal centres → k-medoids</li>
          <li>Huge data → mini-batch K-Means</li>
          <li>Scale first; ids are arbitrary</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="km-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Groups Around Centres</span><span class="rm-sub">the idea and the eight customers</span></div></div>
      <div class="rm-item rm-done" data-target="km-obj"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Objective: Inertia</span><span class="rm-sub">scoring a grouping, and why the centre is the mean</span></div></div>
      <div class="rm-item rm-done" data-target="km-lloyd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Lloyd's Algorithm</span><span class="rm-sub">assign, update, repeat, traced by hand</span></div></div>
      <div class="rm-item rm-done" data-target="km-conv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Convergence &amp; Local Minima</span><span class="rm-sub">why it stops, and why it can stop in the wrong place</span></div></div>
      <div class="rm-item rm-done" data-target="km-init"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">k-means++ and n_init</span><span class="rm-sub">starting with centres far apart</span></div></div>
      <div class="rm-item rm-done" data-target="km-k"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Choosing k</span><span class="rm-sub">elbow, silhouette, gap statistic</span></div></div>
      <div class="rm-item rm-done" data-target="km-fail"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Assumptions &amp; Failures</span><span class="rm-sub">straight borders, odd shapes, outliers</span></div></div>
      <div class="rm-item rm-done" data-target="km-variants"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">K-Medoids &amp; Other Variants</span><span class="rm-sub">real customers as centres, and the cousins</span></div></div>
      <div class="rm-item rm-done" data-target="km-mini"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Mini-Batch K-Means</span><span class="rm-sub">clustering data too big for one pass</span></div></div>
      <div class="rm-item rm-done" data-target="km-sklearn"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">K-Means in scikit-learn</span><span class="rm-sub">parameters, pipelines, and a from-scratch version</span></div></div>
      <div class="rm-item rm-done" data-target="km-uses"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Beyond Segmentation</span><span class="rm-sub">colour compression, features, and when to choose K-Means</span></div></div>
      <div class="rm-item rm-done" data-target="km-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">label ids, one-hot centres, single runs</span></div></div>
      <div class="rm-item rm-done" data-target="km-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, parameters</span></div></div>
      <div class="rm-item rm-done" data-target="km-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on K-Means</span></div></div>
    </div>
  </div>

  <h2 id="km-idea"><span class="num">01</span>Groups Around Centres</h2>
  <p>The previous note, <a class="xref" data-note="ml_clustering">Clustering: The Idea &amp; Distances</a>, gave us ways to measure how far apart two customers are, but no way to turn those distances into groups. What is the simplest rule that says which customers belong together? A natural answer is to describe each group by one typical point and let every customer belong to whichever typical point is nearest.</p>
  <p>Here is the running example. A small electronics shop tracks eight regular customers by two numbers: visits per month and spend per month in ₹1000. Both columns are on small, similar scales, so we can skip scaling for now (section 10 shows the pipeline for when you cannot).</p>
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
  <p>By eye there are two kinds of customer. A, B, C and D visit rarely and spend little; E, F, G and H visit often and spend more. D (4 visits, ₹3,000) sits a little apart from A to C. Two points describe the whole table well: (3.25, 0.75), "light customers, about 3 visits and ₹750", and (7.75, 6.75), "heavy customers, about 8 visits and ₹6,750". Each such point is called a <strong>centre</strong> or <strong>centroid</strong> of its group.</p>
  <p><strong>K-Means</strong> is the algorithm that, given a number k, finds k centres and gives every row to its nearest centre (using Euclidean distance), choosing the centres so that rows are as close as possible to their own centre. The "k" is the number of groups you ask for; the "means" is there because, as we will prove, each centre ends up as the average (mean) of its rows.</p>
  <p>Picture k kirana shops opening in a new colony. Every family buys from its nearest shop. Then each shopkeeper notices where his customers live and moves his shop to the middle of them. Some families now find a different shop closer and switch. The shopkeepers move again, families switch again, and after a few rounds nobody switches any more. The shops are the centres, the families are the rows, and those two alternating moves are the whole algorithm. Before we can run it, though, we need a way to say whether one set of shop positions is better than another.</p>

  <h2 id="km-obj"><span class="num">02</span>The Objective: Inertia</h2>
  <p>Suppose someone proposes the grouping {A, B, C, D} and {E, F, G, H}. Is it a good grouping? Is it better than {A, B} and {C, D, E, F, G, H}? We need a single number that scores a grouping. K-Means uses the most natural one: for every row, take the squared distance to its own group's centre, and add these up over all rows. This total is called <strong>inertia</strong>, or <strong>WCSS</strong> (within-cluster sum of squares). Small inertia means rows sit close to their centres, so groups are tight; K-Means is simply the search for the grouping with the smallest inertia.</p>
  <p>By hand for our proposal: the light centre is the mean of A to D, ((2 + 3 + 4 + 4)/4, (0 + 0 + 0 + 3)/4) = (3.25, 0.75), and the heavy centre is the mean of E to H, (7.75, 6.75). A at (2, 0) is 1.25 and 0.75 away from its centre in the two columns, so its squared distance is 1.5625 + 0.5625 = 2.125. D at (4, 3) is 0.75 and 2.25 away: 0.5625 + 5.0625 = 5.625. Doing all eight gives 9.5 for the light group and 15.5 for the heavy group, a total inertia of 25.</p>
  <p>Why should the centre be the mean, rather than, say, the middle customer? Fix a group and ask which centre c makes the sum of squared gaps smallest. Take one column, the visits of A to D: 2, 3, 4, 4. A centre at 3 gives 1 + 0 + 1 + 1 = 3; at 3.5 it gives 2.25 + 0.25 + 0.25 + 0.25 = 3; at the mean 3.25 it gives only 2.75. The calculus explains why the mean always wins. Write f(c) = Σ(xᵢ − c)². Its slope is f′(c) = −2 Σ(xᵢ − c), and setting the slope to zero gives Σxᵢ = n·c, so c = the mean. In fact moving the centre a distance δ away from the mean always costs exactly n·δ² extra (for c = 3: 2.75 + 4 × 0.25² = 3). Each column works independently, so in any number of dimensions the best centre is the column-by-column mean. This is the reason K-Means is tied to squared Euclidean distance: with plain (unsquared) Manhattan distance, the best centre would be the median instead.</p>
  <p>Two other views of inertia are useful. First, a group's WCSS also equals the sum of squared distances between every pair of rows inside it, divided by the group size: in the light group the six pairs give 1 + 4 + 13 + 1 + 10 + 9 = 38, and 38 / 4 = 9.5. So minimising inertia really means making every pair inside a group close, not just "being near a centre". Second, the spread of the whole table around its overall mean, called the <strong>total sum of squares</strong> (TSS), is fixed by the data and can be split exactly into within-group and between-group parts: TSS = WCSS + BCSS, where BCSS (between-cluster sum of squares) is each group's size times the squared distance from its centre to the overall mean. Because TSS cannot change, <strong>making groups tight is exactly the same as making them far apart</strong>; K-Means serves both wishes at once. The code checks every one of these numbers:</p>
<div class="fx" data-lang="py">from itertools import combinations
lab = np.array([0, 0, 0, 0, 1, 1, 1, 1])                       # {A,B,C,D} and {E,F,G,H}
mu = np.array([P[lab == k].mean(0) for k in range(2)])         # each centre = mean of its group
sq = ((P - mu[lab]) ** 2).sum(1)                               # squared distance to own centre
print("centres:", mu.tolist())
print("squared distances:", dict(zip(names, sq.tolist())))
print("WCSS per group:", [float(sq[lab == k].sum()) for k in range(2)], " inertia:", sq.sum())

x = np.array([2, 3, 4, 4.])                                    # visits of A-D
for c in [3.0, 3.25, 3.5]:
    print(f"centre {c}: sum of squares = {((x - c) ** 2).sum():.4f}")

pairs = sum(((a - b) ** 2).sum() for a, b in combinations(P[lab == 0], 2))
print("group 1: pairwise sum", pairs, "/ 4 =", pairs / 4)

g = P.mean(0)                                                  # grand mean of all eight
tss = ((P - g) ** 2).sum()
bcss = sum((lab == k).sum() * ((mu[k] - g) ** 2).sum() for k in range(2))
print("TSS", tss, "= WCSS", sq.sum(), "+ BCSS", bcss)</div>
  <div class="fx" data-lang="text">centres: [[3.25, 0.75], [7.75, 6.75]]
squared distances: {'A': 2.125, 'B': 0.625, 'C': 1.125, 'D': 5.625, 'E': 3.625, 'F': 4.625, 'G': 1.625, 'H': 5.625}
WCSS per group: [9.5, 15.5]  inertia: 25.0
centre 3.0: sum of squares = 3.0000
centre 3.25: sum of squares = 2.7500
centre 3.5: sum of squares = 3.0000
group 1: pairwise sum 38.0 / 4 = 9.5
TSS 137.5 = WCSS 25.0 + BCSS 112.5</div>
  <p>The per-customer values, 9.5 + 15.5 = 25, the mean beating its neighbours (2.75 against 3.0), the pairwise form 38 / 4 = 9.5, and 137.5 = 25 + 112.5 all match. One warning about inertia: it always falls when you add groups (more centres means everyone is nearer to one) and reaches 0 when every row is its own group. So it can compare two groupings with the same k, but never tell you which k is right; that is section 06.</p>

  <h2 id="km-lloyd"><span class="num">03</span>Lloyd's Algorithm</h2>
  <p>We can now score any grouping, but we cannot try them all. Eight customers can be split into two non-empty groups in 2⁷ − 1 = 127 ways, and for real data the number of possible groupings is astronomically large; finding the exact minimum of inertia is known to be NP-hard. We need a search that finds a good grouping quickly.</p>
  <p>Notice that we have solved two half-problems already. If the centres are known, the best grouping is obvious: give each row to its nearest centre. If the groups are known, the best centres are obvious: the means. Neither is known at the start, so <strong>Lloyd's algorithm</strong> (the algorithm people usually mean by "K-Means") alternates between them: place k starting centres; <strong>assign</strong> every row to its nearest centre; <strong>update</strong> every centre to the mean of its rows; repeat until nothing changes. Solving one half while pretending the other is fixed, and then swapping, is called alternating minimisation. It is exactly the kirana shops moving and the families switching.</p>
  <p>Let us trace it, starting badly on purpose with both centres among the light customers: c1 = B (3, 0) and c2 = C (4, 0). In the first assign step, every customer computes its squared distance to both centres. A is 1 from c1 and 4 from c2, so it goes to c1; B goes to c1 (0 against 1); C goes to c2 (1 against 0). D is 10 from c1 and 9 from c2, so it goes to c2, and so do E to H, which are all slightly closer to c2. The inertia with these centres is 1 + 0 + 0 + 9 + 40 + 50 + 74 + 90 = 264. In the update step c1 moves to the mean of A and B, (2.5, 0), and c2 to the mean of C to H, (6.5, 5). In the next round C finds c1 much closer (2.25 against 31.25) and switches; D stays with c2, but only just (11.25 against 10.25). The figure shows all four rounds.</p>
<figure class="viz"><svg viewBox="0 0 680 205" width="680"><rect x="8" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="88.0" y="15" text-anchor="middle" font-size="11">1: start B, C · inertia 264</text><circle cx="47" cy="178" r="5" class="fb sb"/><text x="54" y="173" font-size="9.5">A</text><circle cx="60" cy="178" r="5" class="fb sb"/><text x="68" y="173" font-size="9.5">B</text><circle cx="74" cy="178" r="5" class="fr sr"/><text x="81" y="173" font-size="9.5">C</text><circle cx="74" cy="133" r="5" class="fr sr"/><text x="81" y="128" font-size="9.5">D</text><circle cx="101" cy="88" r="5" class="fr sr"/><text x="108" y="83" font-size="9.5">E</text><circle cx="142" cy="103" r="5" class="fr sr"/><text x="148" y="98" font-size="9.5">F</text><circle cx="142" cy="73" r="5" class="fr sr"/><text x="148" y="68" font-size="9.5">G</text><circle cx="114" cy="43" r="5" class="fr sr"/><text x="122" y="38" font-size="9.5">H</text><rect x="56" y="173" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="69" y="173" width="10" height="10" class="fr sr" stroke-width="2.5"/><rect x="176" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="256.0" y="15" text-anchor="middle" font-size="11">2: C joins c1 · 47</text><circle cx="215" cy="178" r="5" class="fb sb"/><text x="222" y="173" font-size="9.5">A</text><circle cx="228" cy="178" r="5" class="fb sb"/><text x="236" y="173" font-size="9.5">B</text><circle cx="242" cy="178" r="5" class="fb sb"/><text x="249" y="173" font-size="9.5">C</text><circle cx="242" cy="133" r="5" class="fr sr"/><text x="249" y="128" font-size="9.5">D</text><circle cx="269" cy="88" r="5" class="fr sr"/><text x="276" y="83" font-size="9.5">E</text><circle cx="310" cy="103" r="5" class="fr sr"/><text x="316" y="98" font-size="9.5">F</text><circle cx="310" cy="73" r="5" class="fr sr"/><text x="316" y="68" font-size="9.5">G</text><circle cx="282" cy="43" r="5" class="fr sr"/><text x="290" y="38" font-size="9.5">H</text><rect x="217" y="173" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="271" y="98" width="10" height="10" class="fr sr" stroke-width="2.5"/><rect x="344" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="424.0" y="15" text-anchor="middle" font-size="11">3: D switches · 32</text><circle cx="383" cy="178" r="5" class="fb sb"/><text x="390" y="173" font-size="9.5">A</text><circle cx="396" cy="178" r="5" class="fb sb"/><text x="404" y="173" font-size="9.5">B</text><circle cx="410" cy="178" r="5" class="fb sb"/><text x="417" y="173" font-size="9.5">C</text><circle cx="410" cy="133" r="5" class="fb sb"/><text x="417" y="128" font-size="9.5">D</text><circle cx="437" cy="88" r="5" class="fr sr"/><text x="444" y="83" font-size="9.5">E</text><circle cx="478" cy="103" r="5" class="fr sr"/><text x="484" y="98" font-size="9.5">F</text><circle cx="478" cy="73" r="5" class="fr sr"/><text x="484" y="68" font-size="9.5">G</text><circle cx="450" cy="43" r="5" class="fr sr"/><text x="458" y="38" font-size="9.5">H</text><rect x="392" y="173" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="446" y="83" width="10" height="10" class="fr sr" stroke-width="2.5"/><rect x="512" y="22" width="160" height="168" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="592.0" y="15" text-anchor="middle" font-size="11">4: nothing moves · 25</text><line x1="531" y1="66" x2="666" y2="178" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.6"/><circle cx="551" cy="178" r="5" class="fb sb"/><text x="558" y="173" font-size="9.5">A</text><circle cx="564" cy="178" r="5" class="fb sb"/><text x="572" y="173" font-size="9.5">B</text><circle cx="578" cy="178" r="5" class="fb sb"/><text x="585" y="173" font-size="9.5">C</text><circle cx="578" cy="133" r="5" class="fb sb"/><text x="585" y="128" font-size="9.5">D</text><circle cx="605" cy="88" r="5" class="fr sr"/><text x="612" y="83" font-size="9.5">E</text><circle cx="646" cy="103" r="5" class="fr sr"/><text x="652" y="98" font-size="9.5">F</text><circle cx="646" cy="73" r="5" class="fr sr"/><text x="652" y="68" font-size="9.5">G</text><circle cx="618" cy="43" r="5" class="fr sr"/><text x="626" y="38" font-size="9.5">H</text><rect x="563" y="162" width="10" height="10" class="fb sb" stroke-width="2.5"/><rect x="624" y="72" width="10" height="10" class="fr sr" stroke-width="2.5"/><text x="340" y="202" text-anchor="middle" class="tm" font-size="10.5">circles = customers (colour = assigned centre) · squares = centres · dashed line in panel 4 = final boundary 3·visits + 4·spend = 31.5</text></svg><figcaption>The four iterations. The light group is gathered one customer at a time: C joins in iteration 2, D in iteration 3. Inertia falls 264 → 47 → 32 → 25.</figcaption></figure>
  <p>The light group is gathered one customer at a time: C joins in round 2 and D in round 3, and inertia falls 264 → 47 → 32 → 25. In round 4 nobody moves, the centres stay put, and the algorithm stops. The code below is a literal translation of the two steps and prints each round; then sklearn, given the same starting centres and one run, reaches the same place in the same four iterations:</p>
<div class="fx" data-lang="py">def lloyd(P, C, max_iter=10):
    for it in range(1, max_iter + 1):
        d2 = ((P[:, None, :] - C[None, :, :]) ** 2).sum(2)     # squared distance: point x centre
        lab = d2.argmin(1)                                      # step 1: assign to nearest centre
        inertia = d2[np.arange(len(P)), lab].sum()
        groups = ["".join(np.array(names)[lab == k]) for k in range(len(C))]
        print(f"iteration {it}: centres {C.tolist()}  groups {groups}  inertia {inertia}")
        newC = np.array([P[lab == k].mean(0) for k in range(len(C))])   # step 2: move to the mean
        if np.allclose(newC, C):
            return C, lab
        C = newC

C_final, lab_final = lloyd(P, P[[1, 2]].copy())               # start: c1 = B(3,0), c2 = C(4,0)

km = KMeans(n_clusters=2, init=P[[1, 2]], n_init=1).fit(P)   # sklearn from the same start
print("sklearn:", km.cluster_centers_.tolist(), " inertia", km.inertia_, " iterations", km.n_iter_)</div>
  <div class="fx" data-lang="text">iteration 1: centres [[3.0, 0.0], [4.0, 0.0]]  groups ['AB', 'CDEFGH']  inertia 264.0
iteration 2: centres [[2.5, 0.0], [6.5, 5.0]]  groups ['ABC', 'DEFGH']  inertia 47.0
iteration 3: centres [[3.0, 0.0], [7.0, 6.0]]  groups ['ABCD', 'EFGH']  inertia 32.0
iteration 4: centres [[3.25, 0.75], [7.75, 6.75]]  groups ['ABCD', 'EFGH']  inertia 25.0
sklearn: [[3.25, 0.75], [7.75, 6.75]]  inertia 25.0  iterations 4</div>
  <p>Each iteration costs one distance from every row to every centre, so for n rows, k centres and d columns it is O(n·k·d) work. For our customers that is trivial; for one crore customers, 20 groups and 30 columns it is about 6 × 10⁹ multiplications, around a second per iteration, and 10 to 100 iterations are usually enough. That linear cost in n is why K-Means scales so well. Also notice how fragile D's position was in round 2 (11.25 against 10.25): small changes in data or start can flip rows that sit near a border, so do not over-interpret the labels of border customers.</p>

  <h2 id="km-conv"><span class="num">04</span>Convergence &amp; Local Minima</h2>
  <p>Our trace stopped after four rounds. Is the loop guaranteed to stop on any data, or could it cycle forever? And when it stops, is the answer the best possible one?</p>
  <p>It always stops, for a simple reason. The assign step cannot raise inertia, because each row only moves to a centre that is at least as close. The update step cannot raise inertia either, because for fixed groups the mean is the best possible centre. So inertia never goes up. There are only finitely many groupings (127 for our customers into two), and inertia strictly drops every time the grouping changes, so no grouping can ever repeat, and the loop must end. In sklearn the loop also ends when centres move less than <code>tol</code> (default 1e-4) or after <code>max_iter</code> rounds (default 300), a safety cap that is almost never reached.</p>
  <p>But "cannot improve by these two moves" is not the same as "best possible". Think of a walker in hilly country at night who always steps downhill: she will certainly stop, but possibly in a small dip halfway up the mountain rather than in the deepest valley. A stable answer that is not the best is called a <strong>local minimum</strong>. Here is K-Means asked for three groups on our customers from two different starts:</p>
<div class="fx" data-lang="py">for start in ["AEG", "AEF"]:                                  # two different starting triples, k = 3
    init = P[[names.index(c) for c in start]]
    km = KMeans(3, init=init, n_init=1).fit(P)
    groups = ["".join(np.array(names)[km.labels_ == k]) for k in range(3)]
    print(f"start at {start}: groups {groups}  inertia {km.inertia_:.3f}")</div>
  <div class="fx" data-lang="text">start at AEG: groups ['ABCD', 'E', 'FGH']  inertia 20.167
start at AEF: groups ['ABCD', 'EH', 'FG']  inertia 16.500</div>
  <p>Starting from A, E and G, E ends up alone and F, G and H share a centre: inertia 20.17. Starting from A, E and F gives {E, H} and {F, G}: inertia 16.5. Both answers are stable (no single row wants to move), but the first is 22% worse. On real data with ten or twenty groups, bad local minima are common and the gap is much bigger. "Converged" therefore does not mean "correct", and a single run is never enough.</p>
  <p>Two more practical details. If a centre loses all its rows, its mean is undefined; sklearn moves such an empty centre to the row currently farthest from its centre. And sklearn offers <code>algorithm="elkan"</code>, which uses the triangle inequality to skip distance calculations that cannot change any assignment; it can be faster for small k on dense data but uses more memory, and the default <code>"lloyd"</code> is usually the right choice.</p>

  <h2 id="km-init"><span class="num">05</span>k-means++ and n_init</h2>
  <p>The answer depends on where the centres start. The simplest start picks k random rows. With ten real groups, the chance that ten random rows land exactly one per group is tiny, so usually two centres start in one group while another group gets none, and Lloyd's loop often cannot recover. Here is the effect on 1,000 points in 10 groups, with 30 single runs from different random seeds:</p>
<div class="fx" data-lang="py">Xb, yb = make_blobs(n_samples=1000, centers=10, cluster_std=0.6, center_box=(-10, 10), random_state=4)
for init in ["random", "k-means++"]:
    inert = np.array([KMeans(10, init=init, n_init=1, random_state=s).fit(Xb).inertia_ for s in range(30)])
    print(f"{init:10s} 30 single runs: best {inert.min():7.1f}  median {np.median(inert):7.1f}  "
          f"worst {inert.max():7.1f}")</div>
  <div class="fx" data-lang="text">random     30 single runs: best   789.7  median  2852.3  worst  7556.1
k-means++  30 single runs: best   657.6  median   658.3  worst   794.2</div>
  <p>With random starts the median run has inertia 2,852, more than four times the best k-means++ run (657.6), and the worst is over 7,500. With k-means++ starts the median (658.3) is almost exactly the best, and even the worst run (794.2) is about as good as the best random one.</p>
  <p><strong>k-means++</strong> (Arthur and Vassilvitskii, 2007) is a rule for spreading the starting centres out. Pick the first centre at random. Then pick each next centre at random too, but with probability proportional to D(x)², the squared distance from row x to the nearest centre already chosen. Rows far from every existing centre become very likely picks; rows right next to one almost never get picked. It is like seating guests at a wedding so that the first few people you place end up at different tables: you deliberately favour people who are far from anyone already seated.</p>
  <p>By hand on our customers with k = 3: suppose the first random draw picks B. The squared distances to B are A 1, B 0, C 1, D 10, E 45, F 61, G 85, H 97, summing to 300, so the heavy customers E to H hold (45 + 61 + 85 + 97)/300 = 96% of the probability. Suppose the random number is 0.5; walking through the cumulative probabilities (A .003, then B, C, D up to .04, E to .19, F to .393, G to .677) it lands on G. Now each row's D² is the distance to the nearer of B and G: E becomes min(45, 10) = 10, F 4, H 8, and so on, summing to 34, so D and E (10/34 = .294 each) are the likeliest, and 0.5 picks E. The starting centres B, G, E put one centre in the light group and two spread across the heavy group, exactly the kind of start that avoids bad local minima.</p>
<div class="fx" data-lang="py">from sklearn.cluster import kmeans_plusplus
chosen = ["B"]                                               # step 1: a uniform draw; say it picks B
for step in range(2):
    C = P[[names.index(c) for c in chosen]]
    D2 = ((P[:, None, :] - C[None]) ** 2).sum(2).min(1)        # squared distance to the NEAREST chosen centre
    p = D2 / D2.sum()                                        # probability of being picked next
    u = 0.5                                                  # pretend the random number is 0.5
    chosen.append(names[np.searchsorted(np.cumsum(p), u)])
    print(f"D2 = {dict(zip(names, D2.astype(int).tolist()))}  sum {int(D2.sum())}")
    print(f"   P = {dict(zip(names, p.round(3).tolist()))}  -&gt; picks {chosen[-1]}")
centers, idx = kmeans_plusplus(P, n_clusters=3, random_state=0)
print("sklearn's greedy k-means++ picks:", [names[i] for i in idx])</div>
  <div class="fx" data-lang="text">D2 = {'A': 1, 'B': 0, 'C': 1, 'D': 10, 'E': 45, 'F': 61, 'G': 85, 'H': 97}  sum 300
   P = {'A': 0.003, 'B': 0.0, 'C': 0.003, 'D': 0.033, 'E': 0.15, 'F': 0.203, 'G': 0.283, 'H': 0.323}  -&gt; picks G
D2 = {'A': 1, 'B': 0, 'C': 1, 'D': 10, 'E': 10, 'F': 4, 'G': 0, 'H': 8}  sum 34
   P = {'A': 0.029, 'B': 0.0, 'C': 0.029, 'D': 0.294, 'E': 0.294, 'F': 0.118, 'G': 0.0, 'H': 0.235}  -&gt; picks E
sklearn's greedy k-means++ picks: ['E', 'C', 'G']</div>
  <p>The printed probabilities match the hand work. sklearn's own <code>kmeans_plusplus</code> uses a "greedy" refinement: at each step it draws several candidates by the D² rule and keeps the one that lowers inertia most, so it picked E, C and G here, again one light and two heavy. The theory behind k-means++ is that the expected inertia of the starting centres alone is within a factor of about 8(ln k + 2) of the best possible, and Lloyd's iterations can only improve on that.</p>
  <p>Even k-means++ is random, so the second safeguard is to run the whole algorithm several times and keep the run with the lowest inertia. That is the <code>n_init</code> parameter. In current sklearn the default <code>n_init="auto"</code> means one run with k-means++ (and ten with random starts); for anything important set <code>n_init=10</code> explicitly. One caution: k-means++ loves far-away points, so an extreme outlier is very likely to become a starting centre. Remove or cap extreme outliers first.</p>

  <h2 id="km-k"><span class="num">06</span>Choosing k</h2>
  <p>So far we told K-Means to find two groups. In real work nobody tells you k, and inertia cannot choose it, because it always falls as k grows (k = 8 gives our eight customers inertia 0). We need evidence that the data has 2 groups rather than 3 or 5.</p>
  <p>The oldest tool is the <strong>elbow method</strong>: run K-Means for k = 1, 2, 3, … and look at how much inertia falls with each extra group. While k is below the true number of groups, each new centre splits a real group in two and inertia drops a lot; once k passes the true number, new centres only split groups that were already fine and the drops become small. The k where the curve bends, like an elbow, is the choice. The <strong>silhouette score</strong> is a second tool, explained just below; the table prints both, first for our eight customers and then for 500 synthetic customers with four hidden types:</p>
<div class="fx" data-lang="py">from sklearn.metrics import silhouette_score
def scan(X, ks):
    print(" k   inertia    drop  silhouette")
    prev = None
    for k in ks:
        km = KMeans(k, n_init=10, random_state=0).fit(X)
        drop = "" if prev is None else f"{prev - km.inertia_:7.1f}"
        sil = "" if k == 1 else f"{silhouette_score(X, km.labels_):8.3f}"
        print(f"{k:2d}  {km.inertia_:8.1f} {drop:&gt;7s}  {sil}")
        prev = km.inertia_
print("our eight customers"); scan(P, range(1, 6))
X4, y4 = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)
print("500 customers, 4 hidden types"); scan(X4, range(1, 8))</div>
  <div class="fx" data-lang="text">our eight customers
 k   inertia    drop  silhouette
 1     137.5          
 2      25.0   112.5     0.629
 3      16.5     8.5     0.450
 4       9.0     7.5     0.339
 5       4.0     5.0     0.304
500 customers, 4 hidden types
 k   inertia    drop  silhouette
 1   33903.9          
 2   15737.1 18166.8     0.596
 3    3426.3 12310.8     0.761
 4     948.9  2477.4     0.791
 5     855.9    93.0     0.665
 6     768.7    87.2     0.561
 7     681.0    87.7     0.442</div>
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
  <p>For our customers, going from 1 to 2 groups removes 112.5 of the 137.5 (exactly the between-group sum of squares from section 02), and the next steps remove only 8.5, 7.5 and 5: the elbow is at k = 2. For the 500 customers the drops are 18,167, 12,311, 2,477 and then just 93: the elbow is at 4. Real data rarely bends so sharply, which is the elbow's weakness: it is a judgement made by eye.</p>
  <p>The silhouette gives a score with a real peak. For each row i, let a(i) be its average distance to the other rows of its own group, and b(i) its average distance to the rows of the nearest other group. Then</p>
  <p style="text-align:center"><strong>s(i) = (b(i) − a(i)) / max(a(i), b(i))</strong></p>
  <p>which lies between −1 and 1. Near 1 means the row is deep inside its group (far from the neighbours, close to its own); near 0 means it sits on a border; negative means it is closer to another group than to its own. The silhouette of a whole clustering is the average over rows. Customer D by hand: its distances to A, B and C are √13 = 3.606, √10 = 3.162 and 3, so a = 3.256; to E, F, G and H they are 3.606, 5.385, 6.403 and 6.708, so b = 5.526. Then s(D) = (5.526 − 3.256)/5.526 = 0.411:</p>
<div class="fx" data-lang="py">from sklearn.metrics import silhouette_samples
from scipy.spatial.distance import cdist
dD = cdist(P[[3]], P)[0]                                    # distances from D(4,3) to all eight
a, b = dD[[0, 1, 2]].mean(), dD[4:].mean()                  # own group A,B,C   vs   other group E-H
print("a =", a.round(3), " b =", b.round(3), " s(D) =", round((b - a) / max(a, b), 3))
s = silhouette_samples(P, lab_final)
print("every customer:", dict(zip(names, s.round(3).tolist())), " mean:", s.mean().round(3))</div>
  <div class="fx" data-lang="text">a = 3.256  b = 5.526  s(D) = 0.411
every customer: {'A': 0.755, 'B': 0.795, 'C': 0.746, 'D': 0.411, 'E': 0.47, 'F': 0.555, 'G': 0.688, 'H': 0.616}  mean: 0.629</div>
  <p>D has the lowest score of the eight, which fits: it is the customer that joined the light group last in the trace. The average, 0.629, is the silhouette of the k = 2 clustering, and the table above shows it falling for larger k (0.450, 0.339, 0.304), so the silhouette also picks 2; for the 500 customers it peaks at k = 4 (0.791). Its cost is all pairwise distances, O(n²), so on large data it is computed on a sample. More detail, and its blind spots, are in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>.</p>
  <p>Neither tool can answer "there are no groups at all, k = 1", because the silhouette is undefined for one group and the elbow has nothing to bend from. The <strong>gap statistic</strong> (Tibshirani, Walther and Hastie, 2001) can. It asks how much lower our inertia is than the inertia K-Means would get on data with <em>no</em> groups. It generates several reference datasets spread uniformly over the same bounding box as the real data, clusters each, and compares on a log scale: Gap(k) = average of log(inertia on reference data) − log(inertia on our data). A large gap means our data is much more clustered than random. The rule is to choose the smallest k with Gap(k) ≥ Gap(k + 1) − s_{k+1}, where s_{k+1} measures how much the reference results vary; in words, stop at the first k where adding a group does not clearly increase the gap.</p>
<div class="fx" data-lang="py">def log_wk(X, k):
    return np.log(KMeans(k, n_init=10, random_state=0).fit(X).inertia_)

def gap_statistic(X, ks, B=10, seed=0):
    rng = np.random.default_rng(seed)
    lo, hi = X.min(0), X.max(0)                              # bounding box of the data
    rows = []
    for k in ks:
        ref = [log_wk(rng.uniform(lo, hi, size=X.shape), k) for _ in range(B)]   # data with NO groups
        lw = log_wk(X, k)
        rows.append((k, np.mean(ref) - lw, np.std(ref) * np.sqrt(1 + 1 / B)))
    for k, gap, s in rows: print(f"  k={k}  gap {gap:6.3f}  s_k {s:.3f}")
    return next(rows[i][0] for i in range(len(rows) - 1) if rows[i][1] &gt;= rows[i + 1][1] - rows[i + 1][2])

print("our eight customers -&gt;", gap_statistic(P, range(1, 5), B=20))
print("500 customers -&gt;", gap_statistic(X4, range(1, 8)))</div>
  <div class="fx" data-lang="text">  k=1  gap -0.616  s_k 0.250
  k=2  gap  0.036  s_k 0.521
  k=3  gap -0.352  s_k 0.303
  k=4  gap -0.545  s_k 0.493
our eight customers -&gt; 2
  k=1  gap -0.005  s_k 0.034
  k=2  gap  0.160  s_k 0.029
  k=3  gap  1.288  s_k 0.021
  k=4  gap  2.174  s_k 0.026
  k=5  gap  2.054  s_k 0.034
  k=6  gap  1.982  s_k 0.036
  k=7  gap  1.933  s_k 0.035
500 customers -&gt; 4</div>
  <p>For our customers, Gap(1) = −0.616 is below Gap(2) − s₂ = 0.036 − 0.521, so k = 1 is rejected; Gap(2) = 0.036 is above Gap(3) − s₃ = −0.352 − 0.303, so k = 2 is chosen. With only eight points the uncertainty s_k is large, a reminder that eight customers are a teaching example, not evidence. For the 500 customers the gap climbs to 2.174 at k = 4 and then falls: k = 4. The gap statistic is slow (it runs K-Means many times per k), but it is the only one of the three that can say "no structure".</p>
  <p>Two more indices appear in sklearn: the <strong>Calinski–Harabasz</strong> index, the ratio of between-group to within-group spread adjusted for k (higher is better), and the <strong>Davies–Bouldin</strong> index, the average of each group's worst ratio of spread to separation (lower is better). All of these scores share K-Means' picture of a good group, round and well separated, so they can agree with each other and still be wrong for curved or nested groups. The final check is always the business one: can each group be named and acted on?</p>

  <h2 id="km-fail"><span class="num">07</span>Assumptions &amp; Failures</h2>
  <p>"Give each row to the nearest centre" sounds neutral, but it quietly decides which shapes of group K-Means can ever find. To see that, work out where the border between two centres lies. A row x is on the border when its squared distances to μ₁ and μ₂ are equal: ‖x − μ₁‖² = ‖x − μ₂‖². Expanding both sides, the ‖x‖² terms cancel and what is left is a linear equation, 2x·(μ₂ − μ₁) = ‖μ₂‖² − ‖μ₁‖². So <strong>the border between two K-Means groups is always a straight line</strong> (a flat plane in more dimensions). For our final centres (3.25, 0.75) and (7.75, 6.75) it works out to 9·visits + 12·spend = 94.5, or 3·visits + 4·spend = 31.5:</p>
<div class="fx" data-lang="py">c1, c2 = C_final                                             # (3.25, 0.75) and (7.75, 6.75)
w = 2 * (c2 - c1); t = c2 @ c2 - c1 @ c1                     # border: w . x = t
print("border:", w, ". x =", t, "  -&gt; divide by 3:", w / 3, ". x =", t / 3)
for x in np.array([[5, 4], [6, 4]], dtype=float):
    side = "light" if w @ x &lt; t else "heavy"
    print(f"customer {x}: 3*visits + 4*spend = {(w / 3) @ x:5.1f}  vs 31.5 -&gt; {side}")</div>
  <div class="fx" data-lang="text">border: [ 9. 12.] . x = 94.5   -&gt; divide by 3: [3. 4.] . x = 31.5
customer [5. 4.]: 3*visits + 4*spend =  31.0  vs 31.5 -&gt; light
customer [6. 4.]: 3*visits + 4*spend =  34.0  vs 31.5 -&gt; heavy</div>
  <p>A new customer with 5 visits and ₹4,000 scores 31 and just joins the light group; one with 6 visits scores 34 and joins the heavy group. With k centres, these straight borders cut the space into k convex regions (a picture called a <strong>Voronoi diagram</strong>), and that single fact explains every assumption K-Means makes. Groups should be roughly round, because squared Euclidean distance treats every direction equally, so long stretched groups get cut across. They should have similar spread, because the border sits halfway between centres no matter how wide each group is, so a wide group spills into a tight neighbour. They should have similar sizes, because inertia gains more by splitting a big group than by keeping two small ones apart. They must be convex, so moons and rings are impossible. Features must be scaled, or the widest column decides. There should be no extreme outliers, because means and squares are pulled hard by extremes. And features must be numeric, because a mean must exist. In probability terms, K-Means behaves like a mixture of round Gaussian clouds of equal size with hard assignments, the limiting case of a <a class="xref" data-note="ml_gmm">Gaussian mixture</a> whose spread shrinks to zero. Here is what the violations cost, measured with ARI (1 = perfect, 0 = random) against a full-covariance Gaussian mixture:</p>
<div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.mixture import GaussianMixture
cases = {}
X, y = make_blobs(n_samples=600, random_state=170)
cases["stretched"] = (X @ np.array([[0.608, -0.637], [-0.409, 0.853]]), y, 3)
cases["unequal spread"] = make_blobs(600, centers=[[0, 0], [5, 0], [10, 0]],
                                     cluster_std=[0.5, 2.5, 0.5], random_state=170) + (3,)
cases["unequal size"] = make_blobs([500, 30, 30], centers=[[0, 0], [4, 2], [4, -2]],
                                   cluster_std=[1.6, 0.4, 0.4], random_state=0) + (3,)
cases["moons"] = make_moons(600, noise=0.06, random_state=0) + (2,)
print(f"{'case':15s} k-means ARI   GMM ARI")
for name, (X, y, k) in cases.items():
    a1 = ari(y, KMeans(k, n_init=10, random_state=0).fit_predict(X))
    a2 = ari(y, GaussianMixture(k, covariance_type="full", n_init=3, random_state=0).fit_predict(X))
    print(f"{name:15s} {a1:8.2f}    {a2:8.2f}")</div>
  <div class="fx" data-lang="text">case            k-means ARI   GMM ARI
stretched           0.59        1.00
unequal spread      0.71        0.94
unequal size        0.09        0.81
moons               0.26        0.49</div>
  <p>Stretched groups: 0.59 against the mixture's perfect 1.00, because K-Means cuts across the ellipses. A wide group between two tight ones: 0.71 against 0.94. A 500-point loose group next to two 30-point tight ones: K-Means splits the big group and merges the small ones, ARI 0.09, against 0.81. Moons: 0.26, and the mixture is poor too (0.49), because a moon is not an ellipse either; that is <a class="xref" data-note="ml_dbscan">DBSCAN</a>'s job. None of these failures produces a warning, and internal scores like the silhouette may look fine.</p>
  <p>Outliers deserve their own example. A wholesale buyer, I, joins the shop with 30 visits and ₹30,000 a month, far from everyone:</p>
<div class="fx" data-lang="py">P9 = np.vstack([P, [[30, 30]]])                               # customer I: a wholesale buyer
names9 = names + ["I"]
km9 = KMeans(2, n_init=10, random_state=0).fit(P9)
print("k=2 with I:", ["".join(np.array(names9)[km9.labels_ == k]) for k in range(2)],
      " centres:", km9.cluster_centers_.round(2).tolist(), " inertia", round(km9.inertia_, 1))</div>
  <div class="fx" data-lang="text">k=2 with I: ['ABCDEFGH', 'I']  centres: [[5.5, 3.75], [30.0, 30.0]]  inertia 137.5</div>
  <p>Asked for two groups, K-Means spends one whole centre on I alone and lumps A to H into a single group. The arithmetic explains it: left in a group, I would add a squared distance of several hundred to inertia, while separating light from heavy customers saves only 112.5. Squaring makes far points enormously expensive, so K-Means bends everything around them. One row has destroyed the segmentation.</p>

  <h2 id="km-variants"><span class="num">08</span>K-Medoids &amp; Other Variants</h2>
  <p>The wholesale buyer wrecked our groups because a mean is dragged by extremes and squared distances magnify them. What if the centre had to be an actual customer, and distances were not squared? A <strong>medoid</strong> is the member of a group whose total distance to the other members is smallest: the most central real row, not an average. <strong>K-medoids</strong> uses the same two alternating steps as Lloyd: assign every row to its nearest medoid, then inside each group pick as the new medoid the member with the smallest total distance to the others. The intuition is the same as mean versus median: for the values 1, 2, 3 and 100 the mean is 26.5, pulled towards the outlier, while the median is 2.5. Medoids behave like medians. Here it is on A to I, starting from medoids B and C:</p>
<div class="fx" data-lang="py">from scipy.spatial.distance import cdist
def k_medoids(X, init_idx, max_iter=20):
    D = cdist(X, X)                                          # any distance matrix works here
    med = list(init_idx)
    for _ in range(max_iter):
        lab = D[:, med].argmin(1)                            # assign to the nearest medoid
        new = []
        for k in range(len(med)):
            members = np.where(lab == k)[0]
            cost = D[np.ix_(members, members)].sum(1)        # each member's total distance to the others
            new.append(members[cost.argmin()])               # the most central member is the new medoid
        if new == med: break
        med = new
    return med, lab

med, lab = k_medoids(P9, [1, 2])                             # start from B and C
print("k-medoids with I:", ["".join(np.array(names9)[lab == k]) for k in range(2)],
      " medoids:", [names9[m] for m in med])</div>
  <div class="fx" data-lang="text">k-medoids with I: ['ABCD', 'EFGHI']  medoids: ['B', 'G']</div>
  <p>K-medoids recovers {A, B, C, D} around medoid B and puts I with the heavy customers around medoid G. The outlier is simply the most distant member of a group; it no longer gets a centre of its own. A second advantage is that k-medoids needs only a distance matrix, never a mean, so it works with any distance: Manhattan, cosine, or the Gower distance for mixed tables from the previous note. And its centres are real customers, which managers find easier to understand ("our typical light customer is B"). The price is speed: it needs the full n × n distance matrix, and the classic algorithm, <strong>PAM</strong> (Partitioning Around Medoids), tries swapping every medoid with every non-medoid, which suits thousands of rows rather than millions. A ready implementation is <code>KMedoids</code> in the <code>scikit-learn-extra</code> package.</p>
  <p>K-Means has several other cousins, each fixing one assumption. <strong>K-medians</strong> uses the column-wise median and Manhattan distance, for numeric data with outliers. <strong>K-modes</strong> uses the most common value of each category and a mismatch count, and <strong>k-prototypes</strong> combines it with K-Means for tables mixing numbers and categories. <strong>Spherical K-Means</strong> normalises rows to length 1 so that clustering follows cosine similarity, the standard choice for text and embeddings. <strong>Bisecting K-Means</strong> (sklearn's <code>BisectingKMeans</code>) starts with one group and repeatedly splits a group in two with 2-means, building a top-down hierarchy. <strong>Kernel K-Means</strong> and spectral clustering run K-Means in a transformed space so that curved groups become separable. And <strong>fuzzy c-means</strong> gives each row a degree of membership in every group, a softer version whose probabilistic form is the <a class="xref" data-note="ml_gmm">Gaussian mixture model</a>.</p>

  <h2 id="km-mini"><span class="num">09</span>Mini-Batch K-Means</h2>
  <p>Every Lloyd iteration reads all n rows. For data that barely fits in memory, or that arrives as a stream of new transactions, that is too slow. Can the centres be updated from a small sample of rows at a time?</p>
  <p>The key is that a mean can be updated one value at a time without storing the values. Keep, for each centre, a count of how many rows it has absorbed. When a new row x is assigned to centre c, add one to the count and nudge the centre towards x by a fraction 1/count: c ← c + (x − c) / count. By hand, start a centre at B (3, 0) with count 1. A (2, 0) arrives: count 2, c moves half-way to (2.5, 0). C (4, 0) arrives: count 3, c moves a third of the way, to (3, 0). D (4, 3) arrives: count 4, c moves a quarter of the way, to (3.25, 0.75), which is exactly the mean of A to D, computed without keeping any of them. Early on centres move a lot; as their counts grow the steps shrink and the centres settle.</p>
  <p><strong>Mini-batch K-Means</strong> (Sculley, 2010) repeats this with small random batches: draw, say, 256 or 1,024 rows, assign them to their nearest centres, and apply the running-mean update. In optimisation language it is stochastic gradient descent on inertia with a per-centre learning rate of 1/count (see <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>). The hand updates and a comparison on 20,000 rows:</p>
<div class="fx" data-lang="py">from sklearn.cluster import MiniBatchKMeans
c, count = np.array([3.0, 0.0]), 1                           # a centre that has absorbed B
for nm in ["A", "C", "D"]:
    x = P[names.index(nm)]; count += 1
    c = c + (x - c) / count                                  # step size 1 / points seen
    print(f"see {nm} {x}: step 1/{count} -&gt; centre {c}")

Xbig, _ = make_blobs(n_samples=20000, centers=5, cluster_std=1.2, random_state=1)
full = KMeans(5, n_init=3, random_state=0).fit(Xbig)
mb = MiniBatchKMeans(5, batch_size=256, n_init=3, random_state=0).fit(Xbig)
print(f"full inertia {full.inertia_:.0f}   mini-batch {mb.inertia_:.0f}   "
      f"ratio {mb.inertia_ / full.inertia_:.4f}   agreement ARI {ari(full.labels_, mb.labels_):.3f}")</div>
  <div class="fx" data-lang="text">see A [2. 0.]: step 1/2 -&gt; centre [2.5 0. ]
see C [4. 0.]: step 1/3 -&gt; centre [3. 0.]
see D [4. 3.]: step 1/4 -&gt; centre [3.25 0.75]
full inertia 52680   mini-batch 52708   ratio 1.0005   agreement ARI 0.992</div>
  <p>The hand updates match. On 20,000 rows the mini-batch result is only 0.05% worse in inertia than full K-Means and the two groupings agree almost perfectly (ARI 0.992), even though each step touched only 256 rows. Its <code>partial_fit</code> method lets you feed batches from disk or from a stream. The results are slightly noisier and small groups can be placed less precisely, so use it when n runs into hundreds of thousands or more; below that, full K-Means is fast enough and a little better.</p>

  <h2 id="km-sklearn"><span class="num">10</span>K-Means in scikit-learn</h2>
  <p>Every idea so far maps onto one argument of sklearn's <code>KMeans</code>. <code>n_clusters</code> is k (section 06). <code>init</code> is the start: "k-means++" by default, "random", or an array of centres you supply (section 05). <code>n_init</code> is the number of complete restarts, keeping the lowest inertia (section 05). <code>max_iter</code> (300) and <code>tol</code> (1e-4) are the stopping rules and <code>algorithm</code> ("lloyd" or "elkan") the loop variant (section 04). <code>random_state</code> fixes the seed so results are reproducible. After fitting, <code>labels_</code> holds each training row's group, <code>cluster_centers_</code> the centres, <code>inertia_</code> the final WCSS and <code>n_iter_</code> the iterations of the best run. <code>predict</code> gives new rows their nearest centre, and <code>transform</code> returns each row's distance to every centre.</p>
  <p>Our customers happen to share a scale, but real columns rarely do, so in practice the scaler and K-Means belong in one <code>Pipeline</code>. The pipeline learns the column means and spreads once and reuses them for every later prediction, so new customers land in the same coordinate system as the centres. The centres then live in scaled units, and the scaler's <code>inverse_transform</code> turns them back into numbers a manager understands:</p>
<div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
km = KMeans(n_clusters=2, init="k-means++", n_init=10, max_iter=300, tol=1e-4, random_state=0).fit(P)
print("labels_         ", km.labels_)
print("cluster_centers_", km.cluster_centers_.tolist())
print("inertia_        ", km.inertia_)
print("transform (distance to each centre) for A:", km.transform(P[[0]]).round(3))

pipe = make_pipeline(StandardScaler(), KMeans(2, n_init=10, random_state=0)).fit(P)
scaler, kmp = pipe[0], pipe[-1]
print("centres, scaled units:", kmp.cluster_centers_.round(3).tolist())
print("centres, real units  :", scaler.inverse_transform(kmp.cluster_centers_).round(3).tolist())
print("new customers -&gt;", pipe.predict([[5, 4], [8, 8]]))</div>
  <div class="fx" data-lang="text">labels_          [1 1 1 1 0 0 0 0]
cluster_centers_ [[7.75, 6.75], [3.25, 0.75]]
inertia_         25.0
transform (distance to each centre) for A: [[8.867 1.458]]
centres, scaled units: [[0.9, 0.907], [-0.9, -0.907]]
centres, real units  : [[7.75, 6.75], [3.25, 0.75]]
new customers -&gt; [1 0]</div>
  <p>The labels put A to D together and E to H together; note that this run happened to call the heavy group 0 (ids are arbitrary). Inertia is 25.0, as computed by hand. <code>transform</code> shows A is 1.458 from the light centre (√2.125) and 8.867 from the heavy one. Inside the pipeline the centres are about ±0.9 in scaled units, and <code>inverse_transform</code> brings them back to (7.75, 6.75) and (3.25, 0.75). Two new customers are labelled through the same scaler and centres: (5, 4) light, (8, 8) heavy.</p>
  <p>The best test of understanding is to rebuild the algorithm. The class below has three parts: k-means++ seeding (D² sampling), Lloyd's loop (assign, update, stop when centres barely move, leave an empty centre where it was), and <code>fit</code>, which runs <code>n_init</code> times and keeps the lowest inertia:</p>
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
        for _ in range(self.max_iter):
            lab = ((X[:, None] - C[None]) ** 2).sum(2).argmin(1)                 # assign
            newC = np.array([X[lab == j].mean(0) if (lab == j).any() else C[j]   # update
                             for j in range(self.k)])
            moved = ((newC - C) ** 2).sum()
            C = newC
            if moved &lt;= self.tol: break
        d2 = ((X[:, None] - C[None]) ** 2).sum(2)
        return C, d2.argmin(1), d2.min(1).sum()

    def fit(self, X):                                        # n_init runs, keep the lowest inertia
        self.cluster_centers_, self.labels_, self.inertia_ = min(
            (self._lloyd(X, self._plusplus(X)) for _ in range(self.n_init)), key=lambda r: r[2])
        return self

mine = MyKMeans(2).fit(P)
print("ours   :", mine.cluster_centers_.tolist(), mine.inertia_)
mine4, sk4 = MyKMeans(4).fit(X4), KMeans(4, n_init=10, random_state=0).fit(X4)
print(f"500 customers: ours {mine4.inertia_:.3f}  sklearn {sk4.inertia_:.3f}  "
      f"same grouping ARI {ari(mine4.labels_, sk4.labels_):.3f}")</div>
  <div class="fx" data-lang="text">ours   : [[7.75, 6.75], [3.25, 0.75]] 25.0
500 customers: ours 948.890  sklearn 948.890  same grouping ARI 1.000</div>
  <p>It finds the same centres and inertia 25.0 on our customers and the same inertia (948.890) and identical grouping (ARI 1.000) as sklearn on the 500-customer data. What sklearn adds is engineering: chunked and multithreaded distance computation, the greedy k-means++ variant and a smarter empty-cluster rule.</p>

  <h2 id="km-uses"><span class="num">11</span>Beyond Segmentation</h2>
  <p>K-Means replaces every row by its nearest centre, which is a form of compression: k centres plus one small index per row describe the whole table approximately. That idea, called <strong>vector quantisation</strong>, is useful far beyond customers. A photo, for example, is a table with one row per pixel and three columns (red, green, blue). Cluster the colours into k centres and repaint every pixel with its centre's colour, and the image now needs only a palette of k colours:</p>
<div class="fx" data-lang="py">from sklearn.datasets import load_sample_image
img = load_sample_image("china.jpg") / 255.0                 # 427 x 640 photo, RGB in [0, 1]
pix = img.reshape(-1, 3)                                     # one row per pixel, 3 columns
sample = pix[np.random.default_rng(0).choice(len(pix), 2000, replace=False)]
print("distinct colours in the photo:", len(np.unique(pix, axis=0)))
for k in [4, 16, 64]:
    q = KMeans(k, n_init=3, random_state=0).fit(sample)      # learn k colours from 2,000 pixels
    new = q.cluster_centers_[q.predict(pix)]                 # repaint every pixel with its centre
    print(f"k={k:2d}: mean squared error {((pix - new) ** 2).mean():.5f}")</div>
  <div class="fx" data-lang="text">distinct colours in the photo: 96615
k= 4: mean squared error 0.00705
k=16: mean squared error 0.00182
k=64: mean squared error 0.00064</div>
  <p>The photo has 96,615 distinct colours. With 16 colours the mean squared error is 0.0018 on a 0-to-1 scale, barely visible, and 64 colours is almost lossless. Notice the speed trick: the colours were learned from 2,000 sampled pixels and then <code>predict</code> labelled all 2.7 lakh. The same idea, applied to embedding vectors, is product quantisation in <a class="xref" data-note="vectordb">vector databases</a>.</p>
  <p>K-Means is also a feature-engineering tool for supervised models. The segment id can be a categorical feature; the distances to all k centres (from <code>transform</code>) give k new numeric features that act like a cheap non-linear map; the distance to the nearest centre is a simple anomaly score, since rows far from every centre are unusual; and in computer vision, clustering image patches and counting how often each centre appears in an image gave the classic "bag of visual words". If you use cluster features in a supervised model, fit the K-Means inside the cross-validation folds (inside the pipeline), or information from validation rows leaks into training (see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  <p>Finally, how does K-Means compare with its neighbours in this group? It is the right first try for large numeric data where groups are compact and new rows must be labelled quickly. Choose a sibling when its assumption fits better:</p>
  <table class="tbl">
    <tr><th></th><th>K-Means</th><th>K-Medoids</th><th><a class="xref" data-note="ml_hierarchical">Hierarchical</a></th><th><a class="xref" data-note="ml_dbscan">DBSCAN</a></th><th><a class="xref" data-note="ml_gmm">GMM</a></th></tr>
    <tr><td>You must give</td><td>k</td><td>k</td><td>linkage, where to cut</td><td>eps, min_samples</td><td>k, covariance type</td></tr>
    <tr><td>Distance</td><td>squared Euclidean</td><td>any</td><td>any (Ward: Euclidean)</td><td>any</td><td>Mahalanobis per group</td></tr>
    <tr><td>Shapes</td><td>round, convex</td><td>round-ish</td><td>depends on linkage</td><td>any</td><td>ellipses</td></tr>
    <tr><td>Outliers</td><td>steal centres</td><td>robust</td><td>forced in</td><td>labelled noise</td><td>low probability</td></tr>
    <tr><td>Output</td><td>hard labels</td><td>hard labels</td><td>a tree</td><td>hard labels + noise</td><td>probabilities</td></tr>
    <tr><td>Scale</td><td>millions</td><td>thousands</td><td>~10⁴</td><td>~10⁵–10⁶</td><td>~10⁵</td></tr>
    <tr><td>New rows</td><td>predict</td><td>predict</td><td>no</td><td>no</td><td>predict_proba</td></tr>
  </table>
  <p>Two connections are worth remembering. Ward's hierarchical clustering minimises the same within-group sum of squares as K-Means, but greedily, one merge at a time, producing a whole tree instead of one k; and the Gaussian mixture model generalises K-Means from round groups with hard labels to elliptical groups with probabilities. The next note, <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a>, removes the need to choose k before seeing the data.</p>

  <h2 id="km-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>A frequent mistake is to treat cluster numbers as meaningful. The numbers 0, 1, 2 are just names handed out in whatever order the run happened to find the groups. Here is the same data with three seeds:</p>
<div class="fx" data-lang="py">for seed in [0, 1, 2]:
    km = KMeans(2, n_init=1, random_state=seed).fit(P)
    print(f"seed {seed}: labels {km.labels_}  centre of group 0 {km.cluster_centers_[0].tolist()}")</div>
  <div class="fx" data-lang="text">seed 0: labels [1 1 1 1 0 0 0 0]  centre of group 0 [7.75, 6.75]
seed 1: labels [0 0 0 0 1 1 1 1]  centre of group 0 [3.25, 0.75]
seed 2: labels [0 0 0 0 1 1 1 1]  centre of group 0 [3.25, 0.75]</div>
  <p>Seed 0 calls the heavy group 0; seeds 1 and 2 call the light group 0. The grouping is identical, only the names swapped. A business rule written as "cluster 0 gets the premium offer" would silently flip between runs. Always name groups from their centres and profiles, and when re-training, match new groups to old ones by comparing centres.</p>
  <p>Another mistake is feeding one-hot encoded categories to K-Means. The centres become averages of 0/1 columns, which have no meaning as categories:</p>
<div class="fx" data-lang="py">df = pd.DataFrame({"city": ["Pune", "Pune", "Delhi", "Mumbai", "Pune", "Delhi"]})
onehot = pd.get_dummies(df["city"]).astype(float)            # one column per city
km = KMeans(2, n_init=10, random_state=0).fit(onehot)
print(pd.DataFrame(km.cluster_centers_, columns=onehot.columns).round(2))</div>
  <div class="fx" data-lang="text">   Delhi  Mumbai  Pune
0   0.67    0.33   0.0
1   0.00    0.00   1.0</div>
  <p>The first centre is "0.67 Delhi, 0.33 Mumbai": no customer lives there. For categorical columns use k-modes, for mixed tables k-prototypes, or Gower distance with k-medoids or hierarchical clustering.</p>
  <p>The rest have appeared already. Running with <code>n_init=1</code> and random starts risks a poor local minimum (the median random run was four times the best); use k-means++ and several restarts. Choosing k by the lowest inertia always picks the largest k; use the elbow, silhouette and gap statistic plus a business check. Forgetting to scale lets the widest column decide. Ignoring outliers lets one wholesale buyer take a whole centre. Trusting K-Means on stretched, unequal or curved groups gives poor groups with no warning. And over-reading border rows such as D, whose assignment hung on 11.25 against 10.25, treats an uncertain label as a fact.</p>

  <h2 id="km-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>K-Means</b>: k centres; each row belongs to its nearest centre; centres chosen to minimise inertia.</li>
    <li><b>Inertia (WCSS)</b>: sum of squared distances from rows to their own centre. Always falls as k grows.</li>
    <li><b>Lloyd's algorithm</b>: assign to nearest centre, move centres to means, repeat. Always stops, at a local minimum.</li>
    <li><b>k-means++</b>: first centre random, each next one picked with probability ∝ D², the squared distance to the nearest chosen centre.</li>
    <li><b>n_init</b>: number of full restarts; keep the lowest inertia.</li>
    <li><b>Medoid</b>: the real row with the smallest total distance to its group; k-medoids is robust and accepts any distance.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Our customers</th></tr>
    <tr><td>Inertia</td><td>Σⱼ Σ_{x∈Cⱼ} ‖x − μⱼ‖²</td><td>9.5 + 15.5 = 25</td></tr>
    <tr><td>Best centre</td><td>μⱼ = mean of its rows (slope −2Σ(x − c) = 0)</td><td>(3.25, 0.75), (7.75, 6.75)</td></tr>
    <tr><td>Decomposition</td><td>TSS = WCSS + BCSS</td><td>137.5 = 25 + 112.5</td></tr>
    <tr><td>Border</td><td>2x·(μ₂ − μ₁) = ‖μ₂‖² − ‖μ₁‖²</td><td>3·visits + 4·spend = 31.5</td></tr>
    <tr><td>k-means++</td><td>P(x) = D(x)² / Σ D(y)²</td><td>from B: P(H) = 97/300 = 0.323</td></tr>
    <tr><td>Silhouette</td><td>s = (b − a) / max(a, b)</td><td>s(D) = 0.411; mean 0.629</td></tr>
    <tr><td>Gap</td><td>E*[log W_k] − log W_k; smallest k with Gap(k) ≥ Gap(k+1) − s_{k+1}</td><td>k = 2</td></tr>
    <tr><td>Mini-batch</td><td>c ← c + (x − c)/count</td><td>B, A, C, D → (3.25, 0.75)</td></tr>
    <tr><td>Cost</td><td>O(n·k·d) per iteration</td><td></td></tr>
  </table>
  <h3>Choosing k</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Pick</th><th>Strength</th><th>Weakness</th></tr>
    <tr><td>Elbow</td><td>the bend in inertia</td><td>quick look</td><td>judgement by eye</td></tr>
    <tr><td>Silhouette</td><td>the maximum</td><td>real peak; per-row scores</td><td>O(n²); prefers round blobs</td></tr>
    <tr><td>Gap statistic</td><td>rule vs uniform data</td><td>can choose k = 1</td><td>slow</td></tr>
    <tr><td>Calinski–Harabasz / Davies–Bouldin</td><td>max / min</td><td>fast</td><td>prefer round, equal groups</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

pipe = make_pipeline(StandardScaler(),
                     KMeans(n_clusters=3, init="k-means++", n_init=10, random_state=0)).fit(X)
km = pipe[-1]
km.labels_, km.cluster_centers_, km.inertia_          # groups, centres (scaled), WCSS
pipe[0].inverse_transform(km.cluster_centers_)       # centres in real units
pipe.predict(X_new)                                   # nearest centre for new rows
MiniBatchKMeans(n_clusters=3, batch_size=1024).partial_fit(batch)   # huge or streaming data</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Scale first, in a pipeline; never re-fit the scaler on new rows.</li>
    <li>Use k-means++ and n_init ≥ 10; one run can be a bad local minimum.</li>
    <li>Never choose k by lowest inertia.</li>
    <li>Borders are straight: no moons, rings, stretched or very unequal groups.</li>
    <li>Outliers steal centres; cap them or use k-medoids.</li>
    <li>Label ids are arbitrary; no one-hot categories.</li>
  </ul>

  <h2 id="km-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the K-Means algorithm.</summary><div class="qa-body">Choose k starting centres. Assign every row to its nearest centre, then move each centre to the mean of the rows assigned to it. Repeat these two steps until assignments stop changing. The result is k groups, each summarised by its centre.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does K-Means minimise?</summary><div class="qa-body">Inertia, also called within-cluster sum of squares: the sum over all rows of the squared Euclidean distance to their own centre. Because the total spread of the data is fixed (TSS = WCSS + BCSS), minimising within-group spread also maximises between-group spread.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is each centre the mean of its points?</summary><div class="qa-body">For a fixed group, the sum of squared distances Σ(x − c)² has slope −2Σ(x − c), which is zero when c is the mean; any other centre costs n·δ² extra. With absolute (Manhattan) distances the best centre would be the median instead, which is k-medians.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does K-Means always converge? Does it find the best answer?</summary><div class="qa-body">It always converges, because neither step can increase inertia and there are only finitely many groupings. But it converges to a local minimum that depends on the start: our customers with k = 3 ended at inertia 20.17 or 16.5 from different starts. That is why we use k-means++ and several restarts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is k-means++ and why does it help?</summary><div class="qa-body">It spreads out the starting centres: the first is random, and each next centre is drawn with probability proportional to its squared distance from the nearest centre already chosen. Starting centres then tend to fall in different groups, giving better and more consistent results; its expected starting cost is within O(log k) of optimal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does n_init do?</summary><div class="qa-body">It runs the whole algorithm n_init times from different random starts and keeps the run with the lowest inertia. It protects against bad local minima. In current sklearn the default "auto" means one run with k-means++, so set it explicitly (for example 10) for important work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k?</summary><div class="qa-body">Look for the elbow in inertia against k, pick the k with the highest average silhouette, or use the gap statistic, which compares against random data and can choose k = 1. Then apply a business check: can each group be named and treated differently? All these scores favour round groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is the silhouette score computed?</summary><div class="qa-body">For each row, a is its average distance to its own group and b its average distance to the nearest other group; s = (b − a)/max(a, b), between −1 and 1. Near 1 is well inside a group, near 0 is on a border, negative is probably misassigned. The clustering's score is the mean over rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you pick k by the lowest inertia?</summary><div class="qa-body">Inertia always decreases as k grows, because more centres means every row is closer to one, and it reaches zero when every row is its own group. Lowest inertia would always pick the largest k you try.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What assumptions does K-Means make about clusters?</summary><div class="qa-body">The border between two centres is a straight line, so groups should be convex, roughly round, of similar spread and size, numeric, scaled, and free of extreme outliers. Stretched, unequal or curved groups break it: ARI 0.59, 0.09 and 0.26 in our tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is K-Means sensitive to outliers, and what can you do?</summary><div class="qa-body">It uses means and squared distances, so a far point adds a huge cost and the algorithm bends to reduce it: one wholesale buyer took a whole centre and merged all other customers. Remove or cap outliers, use k-medoids (real rows as centres, plain distances), or use DBSCAN, which labels them as noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>K-Means versus k-medoids?</summary><div class="qa-body">K-Means uses the mean as centre and squared Euclidean distance; it is fast (O(n·k·d) per iteration) but sensitive to outliers. K-medoids uses an actual row as centre and any distance matrix; it is robust and interpretable but needs O(n²) distances, so it suits thousands of rows, not millions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be scaled for K-Means?</summary><div class="qa-body">K-Means uses Euclidean distance, so a column measured in large units dominates every distance and the others are effectively ignored. Put a StandardScaler and KMeans in one pipeline so the same scaling is applied to new rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time complexity of K-Means?</summary><div class="qa-body">O(n·k·d) per iteration, times the number of iterations and n_init. It is linear in the number of rows, so it handles millions; mini-batch K-Means and fitting on a sample go further. Hierarchical clustering, by contrast, needs O(n²) memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does mini-batch K-Means work?</summary><div class="qa-body">It updates centres from small random batches. Each sampled row assigned to centre c increments c's count and moves it by (x − c)/count, a running mean, which is SGD with a shrinking step. On 20,000 rows it was only 0.05% worse in inertia than full K-Means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you cluster text documents with K-Means?</summary><div class="qa-body">Turn documents into TF-IDF vectors or embeddings, normalise each to length 1 so Euclidean distance ranks like cosine similarity, optionally reduce with PCA or truncated SVD, then run K-Means. Inspect sample documents per cluster to name them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is K-Means related to Gaussian mixture models?</summary><div class="qa-body">K-Means is the limit of a Gaussian mixture with equal round covariances as the spread goes to zero: soft probabilities become hard nearest-centre assignments and the EM update becomes the mean update. GMM generalises it to elliptical groups of different sizes with probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is K-Means related to Ward's hierarchical clustering?</summary><div class="qa-body">Both minimise within-cluster sum of squares. K-Means optimises it for one fixed k by iteration; Ward greedily merges the pair of groups whose union increases it least, producing a nested tree for every k. A Ward cut is a good way to initialise K-Means.</div></details>
</main>
`
});
