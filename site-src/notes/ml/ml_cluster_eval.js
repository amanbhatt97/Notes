// notes/ml/ml_cluster_eval.js — Evaluating Clusters
Object.assign(TOPIC_CONTENT, {
  "ml_cluster_eval": `<main>
  <h1>Evaluating Clusters</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>Evaluating Clusters</span></div>
  <p class="lead">Every clustering algorithm always returns an answer: ask K-Means for three clusters and it will give you three, even if the data is pure random noise. Evaluating clusters is the work of deciding whether that answer is any good, which number of clusters to keep, and which algorithm to trust. It is harder than evaluating a classifier because there is usually no answer column to compare with, so we collect several kinds of evidence instead: scores computed from the data alone, comparisons with known labels when some exist, checks that the clusters come back when the data changes a little, and business checks that the clusters actually mean something. The whole page uses one running example, nine shop customers and their monthly spend, so every score can be computed by hand before we let scikit-learn do it.</p>

  <h2 id="ce-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Evaluating Clusters</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Internal (no labels)</div>
        <ul>
          <li><b>Silhouette</b> (b − a)/max(a, b): −1…1, higher better</li>
          <li><b>Davies–Bouldin</b>: worst spread/separation ratio, lower better</li>
          <li><b>Calinski–Harabasz</b>: between/within variance, higher better</li>
          <li>All favour round, compact clusters</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">External (labels exist)</div>
        <ul>
          <li>Everything comes from the <b>contingency table</b></li>
          <li>Purity, Rand index: inflated, avoid alone</li>
          <li><b>ARI</b> and <b>AMI</b>: chance-corrected, use by default</li>
          <li>Homogeneity (pure clusters) vs completeness (whole classes)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stability</div>
        <ul>
          <li>Resample, re-cluster, compare with ARI</li>
          <li>Per cluster: Jaccard of member sets</li>
          <li>Unstable = arbitrary; stable ≠ right</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Business</div>
        <ul>
          <li>Profile clusters; name each in one line</li>
          <li>Shallow surrogate tree gives readable rules</li>
          <li>Validate on an outcome not used for clustering</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ce-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Evaluating Clusters Is Hard</span><span class="rm-sub">nine customers, three possible answers</span></div></div>
      <div class="rm-item rm-done" data-target="ce-sil"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Silhouette</span><span class="rm-sub">is each point in the right cluster?</span></div></div>
      <div class="rm-item rm-done" data-target="ce-db"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Davies–Bouldin Index</span><span class="rm-sub">can two clusters be confused?</span></div></div>
      <div class="rm-item rm-done" data-target="ce-ch"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Calinski–Harabasz Index</span><span class="rm-sub">variation between vs within clusters</span></div></div>
      <div class="rm-item rm-done" data-target="ce-internal"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">What Internal Scores Can and Cannot Tell You</span><span class="rm-sub">choosing k, and the moons trap</span></div></div>
      <div class="rm-item rm-done" data-target="ce-cont"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Contingency Table and Purity</span><span class="rm-sub">comparing clusters with known labels</span></div></div>
      <div class="rm-item rm-done" data-target="ce-pairs"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pair Counting: Rand Index, ARI, Fowlkes–Mallows</span><span class="rm-sub">who is together with whom</span></div></div>
      <div class="rm-item rm-done" data-target="ce-info"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Information-Based Scores</span><span class="rm-sub">homogeneity, completeness, V-measure, NMI, AMI</span></div></div>
      <div class="rm-item rm-done" data-target="ce-extuse"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Which External Score to Trust</span><span class="rm-sub">silly clusterings that fool some scores</span></div></div>
      <div class="rm-item rm-done" data-target="ce-stab"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Stability Analysis</span><span class="rm-sub">does the answer survive resampling?</span></div></div>
      <div class="rm-item rm-done" data-target="ce-biz"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Business Validation</span><span class="rm-sub">profiles, surrogate trees, outcomes</span></div></div>
      <div class="rm-item rm-done" data-target="ce-choose"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Choosing an Algorithm</span><span class="rm-sub">five algorithms on three data shapes</span></div></div>
      <div class="rm-item rm-done" data-target="ce-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">one score as truth, label names, circular checks</span></div></div>
      <div class="rm-item rm-done" data-target="ce-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, syntax</span></div></div>
      <div class="rm-item rm-done" data-target="ce-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on cluster evaluation</span></div></div>
    </div>
  </div>

  <h2 id="ce-why"><span class="num">01</span>Why Evaluating Clusters Is Hard</h2>
  <p>A small shop knows the monthly spend of nine customers, in thousands of rupees: C1 to C9 spend 1, 2, 3, 6, 7, 8, 13, 14 and 15. Later we will also use how often they visit, whether they used last month's coupon, and the segment the sales team wrote down for each of them, but for now spend is all we have. The shop wants to split customers into groups for different offers, so we run K-Means (see <a class="xref" data-note="ml_kmeans">K-Means</a>) for k = 2, 3 and 4:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans

spend = np.array([1, 2, 3, 6, 7, 8, 13, 14, 15], dtype=float)   # monthly spend, Rs thousand, C1..C9
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
</svg><figcaption>The nine customers on a line with the k = 3 clustering. In code we number these clusters 0, 1, 2 from left to right (K-Means' own numbering is arbitrary).</figcaption></figure>
  <p>Which answer is right: two groups, three or four? Nothing in the output says. In supervised learning we would compare predictions with the true answers, but clustering has no answer column; that is the whole point of using it. Worse, the algorithm never refuses. Here is K-Means asked for three clusters on 200 points scattered completely at random, where there are no groups at all:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
U = rng.uniform(0, 1, size=(200, 2))                  # pure noise: no groups at all
print("K-Means on random noise, k=3 -&gt; cluster sizes:",
      np.bincount(KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(U)))</div>
  <div class="fx" data-lang="text">K-Means on random noise, k=3 -&gt; cluster sizes: [56 76 68]</div>
  <p>Three tidy-looking clusters, with no warning. Every clustering algorithm always returns an answer, so the answer alone is never evidence that the groups are real. We need separate evidence, and there are four kinds.</p>
  <p><strong>Internal</strong> scores use only the data and the labels: are the clusters tight, and are they well separated from each other? <strong>External</strong> scores compare the clusters with labels we trust, when a few exist (a benchmark data set, a hand-labelled sample, a field in the CRM). <strong>Stability</strong> checks whether the same clusters come back when the data or the random seed changes slightly. <strong>Business validation</strong> asks whether the clusters differ in ways that matter and whether people can act on them. Think of judging a wedding seating plan without asking the guests. Internally you check that people at each table have things in common and that tables differ from each other; externally, if you have the guest list by family, you check that families sit together; for stability you ask whether a slightly different guest list would give the same tables; and for business value you ask whether people actually enjoyed the evening.</p>
  <p>One note before we start: the algorithm-specific numbers you met earlier, such as K-Means' inertia or a Gaussian mixture's log-likelihood, always improve as you add clusters and cannot be compared across algorithms. The scores on this page can.</p>

  <h2 id="ce-sil"><span class="num">02</span>Silhouette</h2>
  <p>The first question to ask about any clustering is whether each point sits comfortably in its own cluster, far from the others. The <strong>silhouette</strong> answers it one point at a time by comparing two numbers. The first, <strong>a</strong>, is the average distance from the point to the other members of its own cluster; it measures <em>cohesion</em>, how tightly the point fits in. The second, <strong>b</strong>, is the average distance from the point to the members of the nearest other cluster; it measures <em>separation</em>. If a is much smaller than b, the point is well placed. If a ≈ b, it sits on a border. If a is larger than b, it would be happier in the other cluster. The silhouette value combines the two into one number between −1 and 1:</p>
  <p>s(i) = (b − a) / max(a, b)</p>
  <p>Dividing by the larger of the two makes the value independent of the units: s is close to 1 when a is tiny compared with b, 0 when they are equal, and negative when the point is closer to another cluster. A point alone in its cluster gets s = 0 by convention. The <strong>silhouette score</strong> of a whole clustering is the average s over all points. A student in a classroom is a good picture: a is how far they sit, on average, from their own study group, and b is how far they sit from the nearest other group. A student in the middle of their group has a small a and a large b; a student halfway between two groups has a ≈ b.</p>
  <p>By hand for k = 3, where the clusters are {1, 2, 3}, {6, 7, 8} and {13, 14, 15}. For C1 (spend 1): its own cluster-mates are 1 and 2 away, so a = 1.5; the middle cluster is 5, 6 and 7 away (mean 6) and the top cluster 12, 13 and 14 away (mean 13), so b = 6, the nearer of the two; s = (6 − 1.5)/6 = 0.750. For C2 (spend 2): a = (1 + 1)/2 = 1, b = mean(4, 5, 6) = 5, s = (5 − 1)/5 = 0.800. For C4 (spend 6): a = (1 + 2)/2 = 1.5, and the nearest other cluster is the low one at distances 5, 4, 3 (mean 4), so s = (4 − 1.5)/4 = 0.625. C4 has the lowest value because it is the edge of the middle cluster closest to the low spenders. The function below follows the definition line by line, and scikit-learn then computes all nine values and their mean:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import silhouette_samples, silhouette_score
lab3 = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2])          # the k=3 clustering, numbered left to right

def silhouette_by_hand(i, x, lab):
    d = np.abs(x - x[i])                               # distances from point i to everyone (1-D)
    own = (lab == lab[i]) &amp; (np.arange(len(x)) != i)
    a = d[own].mean()                                  # mean distance to its own cluster
    b = min(d[lab == c].mean() for c in set(lab) if c != lab[i])   # nearest other cluster
    return a, b, (b - a) / max(a, b)

for i in (0, 1, 3):
    a, b, s = silhouette_by_hand(i, spend, lab3)
    print(f"C{i+1} (spend {spend[i]:.0f}): a={a:.3f}  b={b:.3f}  s={s:.3f}")
print("all nine s(i):", silhouette_samples(X, lab3).round(3))
print("silhouette score (mean):", round(silhouette_score(X, lab3), 3))</div>
  <div class="fx" data-lang="text">C1 (spend 1): a=1.500  b=6.000  s=0.750
C2 (spend 2): a=1.000  b=5.000  s=0.800
C4 (spend 6): a=1.500  b=4.000  s=0.625
all nine s(i): [0.75  0.8   0.625 0.625 0.8   0.75  0.75  0.857 0.812]
silhouette score (mean): 0.752</div>
  <p>The mean, 0.752, is the silhouette score of the k = 3 clustering. A common rule of thumb (from Kaufman and Rousseeuw) reads it as: above 0.7 strong structure, 0.5 to 0.7 reasonable, 0.25 to 0.5 weak, and below 0.25 no real structure. The real use, though, is comparison. Here are the three values of k, with the average silhouette inside each cluster:</p>
  <div class="fx" data-lang="py">for k, l in labels.items():
    s = silhouette_samples(X, l)
    print(f"k={k}  silhouette={s.mean():.3f}  per cluster:",
          {int(c): round(float(s[l == c].mean()), 3) for c in np.unique(l)})</div>
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
</svg><figcaption>Silhouette plots of the nine customers for k = 2, 3, 4 (bar length = s(i), grouped and coloured by cluster). k = 3: every bar long and even. k = 2: bars in the first cluster shrink. k = 4: C4 alone gets s = 0 and C5, C6 become weak.</figcaption></figure>
  <p>k = 3 has the highest score and no weak cluster. k = 2 has one excellent cluster (0.858, the high spenders) and one mediocre one (0.593), because it lumps 1–3 together with 6–8, so its members have a large a. k = 4 splits C4 off on its own, which gives it s = 0 by convention, and leaves C5 and C6 poorly placed (their cluster averages 0.25). A plot like the one above, with one bar per point grouped by cluster, is the standard way to look at silhouettes: a good cluster has long, even bars, and a cluster with short or negative bars is suspicious.</p>
  <p>Silhouette has two practical costs. It needs the distance between every pair of points, which is O(n²) in time and memory, so on large data you compute it on a random sample with <code>silhouette_score(X, labels, sample_size=10_000, random_state=0)</code>. And it uses whatever distance you give it (for example <code>metric="cosine"</code> for text embeddings), so compute it in the same space and with the same distance you clustered with.</p>

  <h2 id="ce-db"><span class="num">03</span>Davies–Bouldin Index</h2>
  <p>Silhouette judges point by point and needs all pairwise distances. The <strong>Davies–Bouldin index</strong> judges whole clusters instead, using only each cluster's centre and spread, which makes it much cheaper. Its idea is that two clusters are easy to confuse if they are wide compared with the distance between them, like two crowds at a fair that blur into each other when each is spread out and they stand close together.</p>
  <p>For every cluster i compute its <strong>scatter</strong> Sᵢ, the average distance of its points to its centroid. For every pair of clusters compute Mᵢⱼ, the distance between their centroids, and the ratio Rᵢⱼ = (Sᵢ + Sⱼ) / Mᵢⱼ, which is large when the pair blurs together. Each cluster then records its worst ratio, with the neighbour it is most easily confused with, and the index is the average of these worst cases:</p>
  <p>DB = (1/k) Σᵢ maxⱼ≠ᵢ (Sᵢ + Sⱼ) / Mᵢⱼ</p>
  <p>Lower is better, and 0 is the ideal (clusters that are single points). By hand for k = 3: the centroids are 2, 7 and 14, and every cluster's scatter is (1 + 0 + 1)/3 = 0.667, so Sᵢ + Sⱼ = 1.333 for every pair. The low and middle clusters are 5 apart, giving R = 1.333/5 = 0.267; low and high are 12 apart, R = 0.111; middle and high are 7 apart, R = 0.190. The worst ratio for the low cluster is 0.267 (with the middle one), for the middle cluster also 0.267, and for the high cluster 0.190 (with the middle one). DB = (0.267 + 0.267 + 0.190)/3 = 0.241.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import davies_bouldin_score

def davies_bouldin_by_hand(x, lab):
    cs = sorted(set(lab))
    cent = np.array([x[lab == c].mean() for c in cs])
    S = np.array([np.abs(x[lab == c] - cent[j]).mean() for j, c in enumerate(cs)])   # scatter
    worst = [max((S[i] + S[j]) / abs(cent[i] - cent[j]) for j in range(len(cs)) if j != i)
             for i in range(len(cs))]                  # each cluster's most similar neighbour
    return cent, S, np.array(worst), np.mean(worst)

cent, S, worst, db = davies_bouldin_by_hand(spend, lab3)
print("centroids", cent, " scatter", S.round(3), " worst R per cluster", worst.round(3))
print("DB by hand", round(db, 3), "  sklearn", round(davies_bouldin_score(X, lab3), 3))</div>
  <div class="fx" data-lang="text">centroids [ 2.  7. 14.]  scatter [0.667 0.667 0.667]  worst R per cluster [0.267 0.267 0.19 ]
DB by hand 0.241   sklearn 0.241</div>
  <p>The hand calculation matches scikit-learn's <code>davies_bouldin_score</code>. Because DB summarises each cluster by its centroid and the average distance to it, it assumes clusters are well described by a centre, so like K-Means it favours round, compact clusters. And like every distance-based score, it changes if you rescale the features.</p>

  <h2 id="ce-ch"><span class="num">04</span>Calinski–Harabasz Index</h2>
  <p>A third way to judge a clustering asks a global question: of all the variation in the data, how much lies <em>between</em> clusters, because the clusters differ, rather than <em>within</em> clusters, because their members differ? Good clusters put almost all the variation between them. The idea is the same as the F-statistic in one-way ANOVA (see <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>).</p>
  <p>Measure variation with sums of squares. The <strong>between-cluster sum of squares</strong> B = Σₖ nₖ (cₖ − m)² adds, for every cluster, its size times the squared distance from its centroid cₖ to the overall mean m. The <strong>within-cluster sum of squares</strong> W = Σₖ Σ (x − cₖ)² adds the squared distance of every point to its own centroid; this is exactly K-Means' inertia. Together they always add up to the total sum of squares of the data. The <strong>Calinski–Harabasz index</strong> compares them per degree of freedom:</p>
  <p>CH = [ B / (k − 1) ] / [ W / (n − k) ]</p>
  <p>Higher is better. The divisions by k − 1 and n − k stop the score from simply growing as you add clusters, because B always grows and W always shrinks with more clusters. By hand for k = 3: the overall mean is 69/9 = 7.667. The low cluster's centroid 2 is 5.667 below it, so it contributes 3 × 5.667² = 96.33 to B; the middle cluster contributes 3 × 0.667² = 1.33; the high cluster 3 × 6.333² = 120.33; so B = 218. Inside each cluster the squared distances to the centroid are 1 + 0 + 1 = 2, so W = 6. CH = (218/2)/(6/6) = 109.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import calinski_harabasz_score
m = spend.mean()
B = sum((lab3 == c).sum() * (spend[lab3 == c].mean() - m) ** 2 for c in range(3))   # between clusters
W = sum(((spend[lab3 == c] - spend[lab3 == c].mean()) ** 2).sum() for c in range(3))  # within clusters
n, k = len(spend), 3
print(f"overall mean {m:.3f}  B={B:.0f}  W={W:.0f}  B+W={B+W:.0f}  total SS={((spend - m) ** 2).sum():.0f}")
print("CH by hand", (B / (k - 1)) / (W / (n - k)), "  sklearn", round(calinski_harabasz_score(X, lab3), 3))</div>
  <div class="fx" data-lang="text">overall mean 7.667  B=218  W=6  B+W=224  total SS=224
CH by hand 109.0   sklearn 109.0</div>
  <p>The clusters explain 218 of the 224 units of total variation, 97%. CH has no fixed scale (109 here, thousands on larger data), so it is only useful for comparing clusterings of the <em>same</em> data. And because W is K-Means' own objective, CH is naturally biased towards K-Means-style, compact clusters.</p>

  <h2 id="ce-internal"><span class="num">05</span>What Internal Scores Can and Cannot Tell You</h2>
  <p>We now have three internal scores. On the nine customers they all agree:</p>
  <div class="fx" data-lang="py">print(" k   silhouette   Davies-Bouldin   Calinski-Harabasz")
for k, l in labels.items():
    print(f" {k}      {silhouette_score(X, l):.3f}          {davies_bouldin_score(X, l):.3f}             {calinski_harabasz_score(X, l):6.1f}")</div>
  <div class="fx" data-lang="text"> k   silhouette   Davies-Bouldin   Calinski-Harabasz
 2      0.682          0.333               29.0
 3      0.752          0.241              109.0
 4      0.536          0.265               81.3</div>
  <p>All three prefer k = 3: the highest silhouette (0.752), the lowest Davies–Bouldin (0.241) and the highest Calinski–Harabasz (109). For k = 2, CH collapses to 29 because lumping the low and middle spenders together makes W jump. This is the main legitimate use of internal scores: comparing different values of k, or different settings, for one algorithm on one data set. On four round blobs they also find the truth, but on two interlocking moons they all go wrong:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_blobs, make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from sklearn.metrics import adjusted_rand_score
Xb, yb = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)
for k in range(2, 7):
    l = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(Xb)
    print(f"blobs k={k}  sil={silhouette_score(Xb, l):.3f}  DB={davies_bouldin_score(Xb, l):.3f}  CH={calinski_harabasz_score(Xb, l):7.1f}")
Xm, ym = make_moons(n_samples=300, noise=0.06, random_state=0)
Xm = StandardScaler().fit_transform(Xm)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(Xm)
dbl = DBSCAN(eps=0.3, min_samples=5).fit_predict(Xm)
keep = dbl != -1                                      # silhouette cannot score DBSCAN's noise points
print("moons K-Means: ARI", round(adjusted_rand_score(ym, km), 3), " sil", round(silhouette_score(Xm, km), 3),
      " DB", round(davies_bouldin_score(Xm, km), 3))
print("moons DBSCAN : ARI", round(adjusted_rand_score(ym, dbl), 3), " sil", round(silhouette_score(Xm[keep], dbl[keep]), 3),
      " DB", round(davies_bouldin_score(Xm[keep], dbl[keep]), 3))</div>
  <div class="fx" data-lang="text">blobs k=2  sil=0.596  DB=0.520  CH=  574.9
blobs k=3  sil=0.761  DB=0.349  CH= 2210.5
blobs k=4  sil=0.791  DB=0.294  CH= 5742.0
blobs k=5  sil=0.665  DB=0.640  CH= 4778.3
blobs k=6  sil=0.561  DB=0.842  CH= 4259.6
moons K-Means: ARI 0.47  sil 0.494  DB 0.809
moons DBSCAN : ARI 0.993  sil 0.385  DB 1.023</div>
  <p>On the blobs, all three scores peak at the true k = 4. On the moons, K-Means' straight cut (ARI 0.470, clearly wrong) gets a <em>better</em> silhouette (0.494 against 0.385) and a better Davies–Bouldin (0.809 against 1.023) than DBSCAN's correct answer (ARI 0.993). (ARI, the adjusted Rand index, measures agreement with the true labels and is explained in section 07.) The reason is that all three scores measure how compact clusters are around a centre and how far apart the centres are. A long, curved moon is not compact in that sense: points at its two tips are far apart even though they belong together. So internal scores are not neutral judges. Each one is itself a definition of "a good cluster", and silhouette, Davies–Bouldin and Calinski–Harabasz all share K-Means' definition. Using them to judge K-Means is partly circular, and using them to judge density-based clusters is unfair. For density-based results, use a density-based score such as <strong>DBCV</strong> (density-based clustering validation, available in the <code>hdbscan</code> package as <code>validity_index</code>), and above all look at a plot (see <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a>).</p>
  <table class="tbl">
    <tr><th>Score</th><th>Idea</th><th>Range, best</th><th>Cost</th><th>Favours</th></tr>
    <tr><td>Silhouette</td><td>(b − a)/max(a, b) per point</td><td>−1 to 1, high</td><td>O(n²)</td><td>round clusters of similar density</td></tr>
    <tr><td>Davies–Bouldin</td><td>mean worst (Sᵢ + Sⱼ)/Mᵢⱼ</td><td>0 to ∞, low</td><td>O(n·k)</td><td>clusters well summarised by a centre</td></tr>
    <tr><td>Calinski–Harabasz</td><td>(B/(k−1)) / (W/(n−k))</td><td>0 to ∞, high</td><td>O(n·k)</td><td>compact clusters (W = inertia)</td></tr>
    <tr><td>Elbow / gap statistic</td><td>inertia against k</td><td>the bend</td><td>K-Means runs</td><td>K-Means only (see <a class="xref" data-note="ml_kmeans">K-Means</a>)</td></tr>
    <tr><td>BIC / AIC</td><td>−2 log-likelihood + penalty</td><td>low</td><td>GMM fits</td><td>Gaussian clusters (see <a class="xref" data-note="ml_gmm">GMM</a>)</td></tr>
  </table>
  <p>Internal scores can be fooled by shape. When we do have trusted labels for at least some of the data, we can compare with them directly.</p>

  <h2 id="ce-cont"><span class="num">06</span>The Contingency Table and Purity</h2>
  <p>The shop's sales team keeps a segment for every customer in its CRM: budget, regular or premium. If those segments describe the same thing we want our clusters to find, we can measure how well the clusters match them. Scores that compare a clustering with labels from outside are called <strong>external</strong> scores.</p>
  <table class="tbl">
    <tr><th>Customer</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>C5</th><th>C6</th><th>C7</th><th>C8</th><th>C9</th></tr>
    <tr><td>spend</td><td>1</td><td>2</td><td>3</td><td>6</td><td>7</td><td>8</td><td>13</td><td>14</td><td>15</td></tr>
    <tr><td>CRM segment</td><td>0 budget</td><td>0</td><td>0</td><td>0</td><td>1 regular</td><td>1</td><td>2 premium</td><td>2</td><td>2</td></tr>
    <tr><td>cluster (k = 3)</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>2</td><td>2</td><td>2</td></tr>
  </table>
  <p>The only disagreement is C4, who spends 6: the CRM calls them budget, but the clustering puts them with the regulars. Why not simply count matches, like accuracy? Because cluster numbers are just names. K-Means could equally have called the low spenders "cluster 2", and a score must give the same answer however the clusters happen to be numbered. Every external score is therefore built from the <strong>contingency table</strong>: a table whose cell nᵢⱼ counts the items that are in true class i and in cluster j. Its row totals are the class sizes and its column totals the cluster sizes. Renaming clusters only reorders its columns.</p>
  <div class="fx" data-lang="py">import pandas as pd
true = np.array([0, 0, 0, 0, 1, 1, 2, 2, 2])         # CRM segment: 0 budget, 1 regular, 2 premium
print(pd.crosstab(pd.Series(true, name="segment"), pd.Series(lab3, name="cluster")))</div>
  <div class="fx" data-lang="text">cluster  0  1  2
segment         
0        3  1  0
1        0  2  0
2        0  0  3</div>
  <p>Read it row by row: the four budget customers are split 3 into cluster 0 and 1 into cluster 1; the two regulars are both in cluster 1; the three premium customers are all in cluster 2.</p>
  <p>The simplest external score is <strong>purity</strong>: label each cluster with the class most common in it, and count the fraction of items that this labels correctly, purity = (1/n) Σⱼ maxᵢ nᵢⱼ. Cluster 0's most common class has 3 members, cluster 1's has 2 (two regulars against one budget), cluster 2's has 3, so purity = (3 + 2 + 3)/9 = 0.889. It is easy to explain, but it has a serious flaw: it never penalises splitting. Put every customer in a cluster of their own and every "cluster" is trivially pure, so purity is a perfect 1. Purity only makes sense for comparing clusterings with the same number of clusters, alongside a score that punishes splitting.</p>

  <h2 id="ce-pairs"><span class="num">07</span>Pair Counting: Rand Index, ARI and Fowlkes–Mallows</h2>
  <p>We need a score that punishes both kinds of error: merging different classes into one cluster, and splitting one class across several clusters. Pair counting gets there with a neat trick. Label names are arbitrary, but "these two customers are together" is not. So take every pair of customers and ask two yes-or-no questions: are they together in the truth, and are they together in the clustering? Nine customers give C(9, 2) = 9 × 8 / 2 = 36 pairs, and each falls into one of four boxes, named as in classification (see <a class="xref" data-note="ml_evaluation">Classification Metrics</a>):</p>
  <table class="tbl">
    <tr><th></th><th>Same cluster</th><th>Different clusters</th></tr>
    <tr><td>Same true class</td><td><b>TP</b>: agree, together</td><td><b>FN</b>: a class was split</td></tr>
    <tr><td>Different true classes</td><td><b>FP</b>: classes were merged</td><td><b>TN</b>: agree, apart</td></tr>
  </table>
  <p>The counts come straight from the contingency table. A cell with nᵢⱼ items contains C(nᵢⱼ, 2) pairs that are together in both labelings, so TP = C(3,2) + C(1,2) + C(2,2) + C(3,2) = 3 + 0 + 1 + 3 = 7. The pairs together in the clustering are C(3,2) for each of the three clusters, 9 in all, so FP = 9 − 7 = 2: C4 paired with C5 and with C6. The pairs together in the truth are C(4,2) + C(2,2) + C(3,2) = 6 + 1 + 3 = 10, so FN = 10 − 7 = 3: C4 paired with C1, C2 and C3. That leaves TN = 36 − 7 − 2 − 3 = 24. The <strong>Rand index</strong> is the fraction of pairs on which the two labelings agree, (TP + TN) / C(n, 2) = 31/36 = 0.861.</p>
  <div class="fx" data-lang="py">from math import comb
def pair_counts(t, p):
    TP = FP = FN = TN = 0
    for i in range(len(t)):
        for j in range(i + 1, len(t)):
            same_t, same_p = t[i] == t[j], p[i] == p[j]
            TP += same_t and same_p;  FP += (not same_t) and same_p
            FN += same_t and not same_p;  TN += (not same_t) and not same_p
    return TP, FP, FN, TN

TP, FP, FN, TN = pair_counts(true, lab3)
print("TP", TP, " FP", FP, " FN", FN, " TN", TN, " total", TP + FP + FN + TN)
print("Rand index", round((TP + TN) / comb(9, 2), 3))</div>
  <div class="fx" data-lang="text">TP 7  FP 2  FN 3  TN 24  total 36
Rand index 0.861</div>
  <p>The Rand index has a problem. When there are several groups, most pairs are "apart" in both labelings simply by chance, so TN dominates and even random labels get a respectable score (0.556 on these customers, as section 09 shows). The <strong>adjusted Rand index</strong> (ARI) fixes this the same way a teacher would mark a multiple-choice test fairly: subtract what pure guessing would score, then rescale so that a perfect score is still 1. Using the pair counts from the table:</p>
  <p>ARI = (Index − Expected) / (Max − Expected), where Index = Σ C(nᵢⱼ, 2) = TP; Expected = [Σᵢ C(aᵢ, 2) × Σⱼ C(bⱼ, 2)] / C(n, 2); Max = ½ [Σᵢ C(aᵢ, 2) + Σⱼ C(bⱼ, 2)].</p>
  <p>Here aᵢ are the class sizes and bⱼ the cluster sizes, so Σ C(aᵢ, 2) = 10 (pairs together in the truth) and Σ C(bⱼ, 2) = 9 (pairs together in the clustering). Index = 7; Expected = (10 × 9)/36 = 2.5, the number of "together" agreements random labels with these group sizes would get on average; Max = (10 + 9)/2 = 9.5. ARI = (7 − 2.5)/(9.5 − 2.5) = 4.5/7 = 0.643. ARI is 1 for identical groupings, about 0 for random ones, and can be negative for worse-than-random. One misplaced customer out of nine costs a lot because C4 is involved in 5 of the 36 pairs.</p>
  <p>A third pair-counting score ignores TN altogether. The <strong>Fowlkes–Mallows index</strong> is FM = TP / √((TP + FP)(TP + FN)), the geometric mean of pair precision (of the pairs we put together, how many belong together: 7/9) and pair recall (of the pairs that belong together, how many we put together: 7/10). Here FM = 7/√90 = 0.738. Seen this way, pair counting is simply classification applied to the question "should these two be together?": TP, FP, FN and TN are its confusion matrix, the Rand index is its accuracy, Fowlkes–Mallows combines its precision and recall, and ARI is its chance-corrected agreement, much like Cohen's kappa.</p>

  <h2 id="ce-info"><span class="num">08</span>Information-Based Scores</h2>
  <p>ARI says how good the match is, but not what kind of error remains. Is the problem that a cluster contains several classes, or that a class is spread across several clusters? These need different fixes (split clusters or merge them), and information-based scores tell them apart. They are built on <strong>entropy</strong>, H = −Σ p log p, which measures how mixed a set of labels is: 0 when everything has the same label, larger when labels are evenly mixed. scikit-learn uses natural logs, so the unit is "nats". (Entropy is explained in detail in <a class="xref" data-note="ml_dtree">Decision Trees</a>.) For the customers, the true classes have shares 4/9, 2/9 and 3/9, so H(C) = −(0.444 ln 0.444 + 0.222 ln 0.222 + 0.333 ln 0.333) = 0.360 + 0.334 + 0.366 = 1.061. The clusters have shares of 1/3 each, so H(K) = ln 3 = 1.099.</p>
  <p><strong>Homogeneity</strong> asks whether each cluster contains only one class. It looks at the entropy of the classes inside each cluster, averaged with the cluster sizes as weights, which is written H(C | K), and compares it with H(C): h = 1 − H(C | K)/H(C). Clusters 0 and 2 contain one class each, entropy 0. Cluster 1 holds one budget customer and two regulars, whose entropy is −(⅓ ln ⅓ + ⅔ ln ⅔) = 0.637; weighted by its share 3/9 that gives H(C | K) = 0.212. So h = 1 − 0.212/1.061 = 0.800.</p>
  <p><strong>Completeness</strong> is the mirror image: does each class sit inside one cluster? c = 1 − H(K | C)/H(K), where H(K | C) is the entropy of the clusters inside each class, weighted by class size. The budget class is split 3 and 1, entropy −(¾ ln ¾ + ¼ ln ¼) = 0.562, weighted by 4/9 gives 0.250; the other classes sit in one cluster each. So c = 1 − 0.250/1.099 = 0.773. Homogeneity is higher than completeness: our clusters are fairly pure, and the real problem is that one budget customer was split away from its class. Low homogeneity suggests splitting clusters; low completeness suggests merging them.</p>
  <p>Several summary scores combine these. The <strong>V-measure</strong> is the harmonic mean of homogeneity and completeness, like an F1 score: 2 × 0.800 × 0.773 / (0.800 + 0.773) = 0.786. <strong>Mutual information</strong>, MI = H(C) − H(C | K) = 1.061 − 0.212 = 0.849 nats, measures how much knowing the cluster tells you about the class. Its normalised version, <strong>NMI</strong>, divides MI by the average of H(C) and H(K): 0.849/1.080 = 0.786, which with this (default) averaging is exactly the V-measure. Like the Rand index, MI and NMI give random labelings a positive score, so the <strong>adjusted mutual information</strong> (AMI) subtracts the MI that random labelings of the same sizes would get on average, just as ARI does for pairs. Here AMI = 0.692. All of these, together with the scores from the previous two sections, are one line each in scikit-learn:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import (rand_score, homogeneity_score, completeness_score, v_measure_score,
                             mutual_info_score, normalized_mutual_info_score,
                             adjusted_mutual_info_score, fowlkes_mallows_score)
from sklearn.metrics.cluster import contingency_matrix
cm = contingency_matrix(true, lab3)
print("purity            ", round(cm.max(axis=0).sum() / cm.sum(), 3))
print("Rand index        ", round(rand_score(true, lab3), 3))
print("ARI               ", round(adjusted_rand_score(true, lab3), 3))
print("Fowlkes-Mallows   ", round(fowlkes_mallows_score(true, lab3), 3))
print("homogeneity       ", round(homogeneity_score(true, lab3), 3))
print("completeness      ", round(completeness_score(true, lab3), 3))
print("V-measure         ", round(v_measure_score(true, lab3), 3))
print("mutual information", round(mutual_info_score(true, lab3), 3), "nats")
print("NMI               ", round(normalized_mutual_info_score(true, lab3), 3))
print("AMI               ", round(adjusted_mutual_info_score(true, lab3), 3))</div>
  <div class="fx" data-lang="text">purity             0.889
Rand index         0.861
ARI                0.643
Fowlkes-Mallows    0.738
homogeneity        0.8
completeness       0.773
V-measure          0.786
mutual information 0.849 nats
NMI                0.786
AMI                0.692</div>
  <p>Every number matches the hand calculations.</p>

  <h2 id="ce-extuse"><span class="num">09</span>Which External Score to Trust</h2>
  <p>With ten external scores available, the important question is which ones can be fooled. The best test is to feed them clusterings that are obviously silly: every customer in a cluster of their own, everyone in one big cluster, and random labels. A trustworthy score should give all of these a low value.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for name, p in [("k=3 clustering", lab3), ("9 singletons", np.arange(9)),
                ("1 big cluster", np.zeros(9, int)), ("random labels", rng.integers(0, 3, 9))]:
    cmx = contingency_matrix(true, p)
    print(f"{name:15s} purity={cmx.max(axis=0).sum() / 9:.3f}  RI={rand_score(true, p):.3f}  ARI={adjusted_rand_score(true, p):6.3f}  "
          f"hom={homogeneity_score(true, p):.3f}  comp={completeness_score(true, p):.3f}  NMI={normalized_mutual_info_score(true, p):.3f}  AMI={adjusted_mutual_info_score(true, p):6.3f}")</div>
  <div class="fx" data-lang="text">k=3 clustering  purity=0.889  RI=0.861  ARI= 0.643  hom=0.800  comp=0.773  NMI=0.786  AMI= 0.692
9 singletons    purity=1.000  RI=0.722  ARI= 0.000  hom=1.000  comp=0.483  NMI=0.651  AMI=-0.000
1 big cluster   purity=0.444  RI=0.278  ARI= 0.000  hom=0.000  comp=1.000  NMI=0.000  AMI= 0.000
random labels   purity=0.667  RI=0.556  ARI= 0.065  hom=0.364  comp=0.456  NMI=0.405  AMI= 0.143</div>
  <p>Nine singletons get a perfect purity and homogeneity (each "cluster" trivially contains one class) and still a respectable NMI of 0.651, while ARI and AMI correctly say 0. One big cluster gets a perfect completeness (each class is, trivially, inside one cluster), while the rest say 0. Random labels get a Rand index of 0.556 and an NMI of 0.405, which look like "some agreement", while ARI (0.065) and AMI (0.143) stay near 0; with only nine items, chance corrections are themselves noisy.</p>
  <p>So the safe defaults are the chance-corrected scores. <strong>ARI</strong> is the usual headline number when the true classes have reasonably similar sizes. <strong>AMI</strong> is preferred when classes are very unbalanced or there are many small clusters. Report homogeneity and completeness alongside as a diagnosis of whether to split or merge, and never report purity, the Rand index or plain NMI on their own. All of these scores ignore cluster names, as they should; section 13 shows what happens if you forget that.</p>
  <p>One caution applies to every external score: the labels must describe the same thing you want the clusters to find. If the CRM segments had been assigned by region, a low ARI would only mean that your spending-based clusters capture something else, which might be more useful.</p>

  <h2 id="ce-stab"><span class="num">10</span>Stability Analysis</h2>
  <p>In most real projects there are no labels at all. Besides internal scores, the main source of confidence is <strong>stability</strong>: if the clusters reflect real structure in the population, they should come back when the data changes a little, just as a real pattern in a survey shows up again in a second sample, while a fluke does not. The recipe is to perturb the data (drop some rows, draw a bootstrap sample, add a little noise, or change the random seed), cluster again with exactly the same pipeline, and compare the new labels with the old ones on the rows both runs contain, using ARI so that label names do not matter. Repeat 20 to 100 times and average.</p>
  <p>On the nine customers: drop 2 customers at random, re-run K-Means on the remaining 7, and compare with the full-data clustering on those 7; 20 repetitions for each k:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
print(" k   mean ARI vs full-data clustering   worst")
for k in (2, 3, 4):
    full = labels[k]
    scores = []
    for b in range(20):
        idx = np.sort(rng.choice(9, 7, replace=False))          # drop 2 random customers
        sub = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X[idx])
        scores.append(adjusted_rand_score(full[idx], sub))       # compare on the 7 kept customers
    print(f" {k}              {np.mean(scores):.3f}                  {np.min(scores):.3f}")</div>
  <div class="fx" data-lang="text"> k   mean ARI vs full-data clustering   worst
 2              0.892                  -0.077
 3              1.000                  1.000
 4              0.858                  0.488</div>
  <p>k = 3 reproduces perfectly every time. k = 2 usually agrees, but for some subsets the single cut lands in the other gap, and then the two runs disagree completely (worst ARI −0.077). k = 4 has to split one natural group somewhere, and where it splits depends on which customers are left (worst 0.488). An answer that changes when two customers leave is arbitrary, so stability rules out k = 2 and k = 4 here.</p>
  <p>To find <em>which</em> cluster is unstable, compare each original cluster with its best-matching cluster in each re-run using the <strong>Jaccard similarity</strong> of their member sets, |A ∩ B| / |A ∪ B|, the number of shared members divided by the number of members in either. Averaging this over many runs gives each cluster a stability score; a common rule (Hennig's) treats an average below 0.5 as a cluster that "dissolves" and above about 0.75 as stable. For example, if a re-run moved C4 back to the low spenders:</p>
  <div class="fx" data-lang="py">def jaccard(a, b):
    a, b = set(a), set(b)
    return len(a &amp; b) / len(a | b)

print("{C1,C2,C3} vs {C1,C2,C3,C4}:", jaccard([1, 2, 3], [1, 2, 3, 4]))
print("{C4,C5,C6} vs {C5,C6}      :", round(jaccard([4, 5, 6], [5, 6]), 3))</div>
  <div class="fx" data-lang="text">{C1,C2,C3} vs {C1,C2,C3,C4}: 0.75
{C4,C5,C6} vs {C5,C6}      : 0.667</div>
  <p>The low-spender cluster would still match 0.75 (three shared members out of four), and the middle cluster, having lost one of its three members, 0.667.</p>
  <p>Stability has an important limit, which the four-blob data from section 05 shows. Here two models are fitted on two different random 70% samples and both then label all 500 rows:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
for k in range(2, 7):
    s = []
    for b in range(10):
        i1 = rng.choice(500, 350, replace=False); i2 = rng.choice(500, 350, replace=False)
        m1 = KMeans(n_clusters=k, n_init=3, random_state=b).fit(Xb[i1])
        m2 = KMeans(n_clusters=k, n_init=3, random_state=b + 100).fit(Xb[i2])
        s.append(adjusted_rand_score(m1.predict(Xb), m2.predict(Xb)))   # both models label all 500 rows
    print(f"k={k}  mean ARI between runs {np.mean(s):.3f}  (worst {np.min(s):.3f})")</div>
  <div class="fx" data-lang="text">k=2  mean ARI between runs 0.925  (worst 0.249)
k=3  mean ARI between runs 1.000  (worst 1.000)
k=4  mean ARI between runs 1.000  (worst 1.000)
k=5  mean ARI between runs 0.835  (worst 0.817)
k=6  mean ARI between runs 0.774  (worst 0.601)</div>
  <p>k = 4, the truth, is perfectly stable. But so is k = 3, because two of the four blobs lie close together and K-Means merges those same two every time. k = 2, 5 and 6 are unstable. So stability can rule out bad choices, because an unstable answer is arbitrary, but it cannot choose between several stable ones: a consistent mistake is still stable. Combine it with internal scores and the business view. And when comparing runs, always use ARI or matched Jaccard, never label equality, because cluster "0" in one run may be cluster "2" in the next.</p>

  <h2 id="ce-biz"><span class="num">11</span>Business Validation</h2>
  <p>A clustering can be compact, match the labels and be perfectly stable, and still be useless to the people who are meant to act on it. The last kind of evidence asks whether the clusters differ in ways that matter, whether they can be described simply, and whether they predict something. The first step is to <strong>profile</strong> each cluster: its size and the average of each feature. Here we add two more columns for the nine customers, visits per month and whether they used last month's coupon (which was <em>not</em> used for clustering). z-scores, the cluster mean minus the overall mean divided by the overall standard deviation, show how far each cluster is from the average customer in comparable units:</p>
  <div class="fx" data-lang="py">df = pd.DataFrame({"spend": spend,
                   "visits": [2, 1, 2, 4, 5, 4, 9, 8, 10],
                   "responded": [0, 0, 0, 1, 0, 1, 1, 1, 1]})      # used last month's coupon? (not clustered on)
df["cluster"] = lab3
prof = df.groupby("cluster").agg(n=("spend", "size"), spend=("spend", "mean"),
                                 visits=("visits", "mean"), response_rate=("responded", "mean"))
print(prof.round(2))
z = (prof[["spend", "visits"]] - df[["spend", "visits"]].mean()) / df[["spend", "visits"]].std(ddof=0)
print("\\nz-scores of cluster means:")
print(z.round(2))</div>
  <div class="fx" data-lang="text">         n  spend  visits  response_rate
cluster                                 
0        3    2.0    1.67           0.00
1        3    7.0    4.33           0.67
2        3   14.0    9.00           1.00

z-scores of cluster means:
         spend  visits
cluster               
0        -1.14   -1.08
1        -0.13   -0.22
2         1.27    1.29</div>
  <p>Now each cluster can be named in one line, which is the real test of a segmentation meant for people. Cluster 0: low spend, rare visits (z about −1.1), and nobody used the coupon, so "occasional bargain buyers". Cluster 1: close to average on everything, and two of three used the coupon, so "regulars". Cluster 2: high spend, frequent visits (z about +1.3), and all used the coupon, so "loyal big spenders". If two clusters had the same profile, the business would treat them as one segment, whatever the silhouette said.</p>
  <p>The second step is to explain the clusters with simple rules. Fit a shallow <a class="xref" data-note="ml_dtree">decision tree</a> that predicts the cluster label from the original features; this is called a <strong>surrogate model</strong>, because it stands in for the clustering in a form people can read:</p>
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
  <p>"Visits 3 or fewer: occasional. Otherwise, spend up to 10.5: regular; above: loyal big spender." The tree reproduces the clusters 100%, so these rules can go straight into a CRM filter. A low surrogate accuracy means the clusters are hard to describe in simple terms, which is itself a warning for a segmentation that people are supposed to use.</p>
  <p>The strongest evidence of all is an outcome the clustering was not built from. Here the coupon response was not used, yet it differs sharply between clusters: 0%, 67% and 100%. That says the segments capture something real about behaviour. Checking clusters on the features they were built from would be circular: of course cluster 2 has high spend, since spend made the clusters. On real data, test the difference properly, with a chi-square test or a held-out time period (see <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>), and best of all run an experiment that gives different offers to each segment and measures them against a control group (see <a class="xref" data-note="st_abtesting">A/B Testing</a>). Re-check segments over time as well, because customer behaviour drifts and last year's segmentation can quietly dissolve.</p>

  <h2 id="ce-choose"><span class="num">12</span>Choosing an Algorithm</h2>
  <p>Everything so far judged one algorithm's output. The same tools also help choose the algorithm in the first place. Below, five algorithms run on three scaled two-dimensional data sets whose true groups we know: four round blobs, two moons, and three stretched, tilted clouds. ARI measures correctness, and silhouette is shown next to it (with HDBSCAN's noise points dropped):</p>
  <div class="fx" data-lang="py">from sklearn.mixture import GaussianMixture
from sklearn.cluster import AgglomerativeClustering, HDBSCAN
Xs, ys = make_blobs(n_samples=600, centers=3, random_state=170)
Xs = StandardScaler().fit_transform(Xs @ np.array([[0.6, -0.6], [-0.4, 0.8]]))   # stretched clouds
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
        row += f"{adjusted_rand_score(yt, l):9.3f}{silhouette_score(Z[keep], l[keep]):9.3f}"
    print(f"{name:12s}" + row)</div>
  <div class="fx" data-lang="text">                         blobs             moons         stretched
                  ARI      sil      ARI      sil      ARI      sil
K-Means         1.000    0.798    0.470    0.494    0.574    0.507
GMM             1.000    0.798    0.479    0.493    1.000    0.467
Ward            1.000    0.798    0.209    0.432    0.681    0.489
Single link     1.000    0.798    1.000    0.380    0.564    0.488
HDBSCAN         0.997    0.799    0.954    0.403    0.877    0.524</div>
  <p>Read the table in two directions. By data set: round blobs are easy for everyone; the moons need single linkage or HDBSCAN, which can follow curves; the stretched clouds need a Gaussian mixture, the only method that learns tilted shapes (ARI 1.000). By score: on the stretched clouds the perfect GMM answer has the <em>lowest</em> silhouette (0.467), and on the moons the correct answers have lower silhouettes than the wrong ones. Silhouette told you nothing about which algorithm was right, which is exactly the lesson of section 05.</p>
  <p>In practice the choice starts from what you know about the data and what you need. For round clusters, large data and a rough idea of k, use <a class="xref" data-note="ml_kmeans">K-Means</a> and judge it with silhouette, Davies–Bouldin, Calinski–Harabasz and stability. For elliptical or overlapping clusters, or when you need membership probabilities, use a <a class="xref" data-note="ml_gmm">Gaussian mixture</a> and choose k with BIC. For odd shapes, noise and unknown k, use <a class="xref" data-note="ml_dbscan">HDBSCAN</a> and judge it with plots, DBCV and stability. For small data where you want a family tree of groups, use <a class="xref" data-note="ml_hierarchical">hierarchical clustering</a>. For high-dimensional data such as text or images, reduce dimensions first (<a class="xref" data-note="ml_pca">PCA</a> or <a class="xref" data-note="ml_umap">UMAP</a>) and then cluster. Whatever you choose, the workflow is the same: scale and select features, reduce dimensions if there are many, plot a two-dimensional view, try two or three algorithms, check internal scores and stability, and finish with profiles and an outcome test.</p>

  <h2 id="ce-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common technical mistake is comparing cluster labels by name, for example computing an "accuracy" by checking whether cluster 0 equals class 0. Cluster numbers are arbitrary, so the same grouping with different names looks like a disaster:</p>
  <div class="fx" data-lang="py">renamed = np.array([5, 5, 5, 9, 9, 9, 1, 1, 1])          # the same three groups, different names
print("'accuracy' by matching names:", (renamed == true).mean(), "  vs lab3:", round((lab3 == true).mean(), 3))
print("ARI renamed:", round(adjusted_rand_score(true, renamed), 3), "  ARI lab3:", round(adjusted_rand_score(true, lab3), 3))</div>
  <div class="fx" data-lang="text">'accuracy' by matching names: 0.0   vs lab3: 0.889
ARI renamed: 0.643   ARI lab3: 0.643</div>
  <p>The renamed labels describe exactly the same three groups as lab3, yet their name-matching "accuracy" is 0 while lab3's is 0.889. ARI gives both the same 0.643, because it only looks at who is grouped with whom. Use permutation-invariant scores such as ARI and AMI, or match clusters to classes first (for example with the Hungarian algorithm) if you really need an accuracy figure.</p>
  <p>The most common judgement mistake is treating one internal score as the truth. Silhouette, Davies–Bouldin and Calinski–Harabasz share a "compact around a centre" definition of a good cluster; they preferred K-Means' wrong cut on the moons and gave the perfect GMM the worst silhouette on stretched clouds. Use them to compare values of k within one algorithm, not to crown an algorithm. Relatedly, scores are only comparable for the same data and preprocessing: a silhouette on two scaled features and one on twenty raw features are not on the same scale of meaning.</p>
  <p>A few more are worth remembering. For DBSCAN and HDBSCAN, the noise label −1 is not a cluster: drop noise points before internal scores and say how many you dropped, and decide explicitly whether noise counts as its own group in external scores. Reporting purity or the Rand index on their own flatters results (singletons get purity 1, random labels a Rand index of 0.556); report ARI or AMI. Validating clusters on the features used to build them is circular; validate on held-out features and outcomes. And computing silhouette on very large data without sampling needs n² distances, 10¹⁰ for 100,000 rows; use <code>sample_size</code>.</p>

  <h2 id="ce-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Four kinds of evidence</h3>
  <ul>
    <li><b>Internal</b>: data only (silhouette, Davies–Bouldin, Calinski–Harabasz). Compare k within one algorithm.</li>
    <li><b>External</b>: compare with trusted labels (ARI, AMI, homogeneity, completeness…). All built from the contingency table.</li>
    <li><b>Stability</b>: resample or reseed, re-cluster, compare with ARI; per cluster with Jaccard. Unstable = arbitrary; stable ≠ right.</li>
    <li><b>Business</b>: profiles, shallow surrogate tree, a held-out outcome, ideally an experiment.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Score</th><th>Formula</th><th>Best</th></tr>
    <tr><td>Silhouette</td><td>s = (b − a)/max(a, b); a = mean distance to own cluster, b = to nearest other cluster</td><td>1</td></tr>
    <tr><td>Davies–Bouldin</td><td>(1/k) Σᵢ maxⱼ (Sᵢ + Sⱼ)/Mᵢⱼ; S = scatter, M = centroid distance</td><td>0</td></tr>
    <tr><td>Calinski–Harabasz</td><td>[B/(k−1)] / [W/(n−k)]; B between, W within sum of squares</td><td>high</td></tr>
    <tr><td>Purity</td><td>(1/n) Σⱼ maxᵢ nᵢⱼ</td><td>1 (fooled by splitting)</td></tr>
    <tr><td>Rand index</td><td>(TP + TN)/C(n, 2)</td><td>1 (inflated by chance)</td></tr>
    <tr><td>ARI</td><td>(Index − Expected)/(Max − Expected), from pair counts</td><td>1; 0 = chance</td></tr>
    <tr><td>Fowlkes–Mallows</td><td>TP/√((TP + FP)(TP + FN))</td><td>1</td></tr>
    <tr><td>Homogeneity</td><td>1 − H(C|K)/H(C): each cluster one class</td><td>1</td></tr>
    <tr><td>Completeness</td><td>1 − H(K|C)/H(K): each class one cluster</td><td>1</td></tr>
    <tr><td>V-measure = NMI</td><td>2hc/(h + c) = MI / mean(H(C), H(K))</td><td>1</td></tr>
    <tr><td>AMI</td><td>(MI − E[MI]) / (mean H − E[MI])</td><td>1; 0 = chance</td></tr>
    <tr><td>Jaccard</td><td>|A ∩ B| / |A ∪ B|</td><td>1</td></tr>
  </table>
  <h3>The nine customers (spend 1, 2, 3, 6, 7, 8, 13, 14, 15)</h3>
  <table class="tbl">
    <tr><th>k</th><th>Silhouette</th><th>Davies–Bouldin</th><th>Calinski–Harabasz</th><th>Stability (mean ARI)</th></tr>
    <tr><td>2</td><td>0.682</td><td>0.333</td><td>29.0</td><td>0.892</td></tr>
    <tr><td>3</td><td>0.752</td><td>0.241</td><td>109.0</td><td>1.000</td></tr>
    <tr><td>4</td><td>0.536</td><td>0.265</td><td>81.3</td><td>0.858</td></tr>
  </table>
  <p>k = 3 against the CRM (only C4 differs): purity 0.889 · TP 7, FP 2, FN 3, TN 24 · RI 0.861 · ARI 0.643 · FM 0.738 · homogeneity 0.800 · completeness 0.773 · V = NMI 0.786 · MI 0.849 nats · AMI 0.692. Coupon response by cluster: 0, 0.67, 1.0.</p>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.metrics import (silhouette_score, silhouette_samples, davies_bouldin_score,
    calinski_harabasz_score, adjusted_rand_score, adjusted_mutual_info_score,
    homogeneity_completeness_v_measure, fowlkes_mallows_score)
from sklearn.metrics.cluster import contingency_matrix

silhouette_score(X, labels, sample_size=10_000, random_state=0)   # internal, higher better
davies_bouldin_score(X, labels)                                    # lower better
calinski_harabasz_score(X, labels)                                 # higher better
adjusted_rand_score(y_true, labels)                                # external, 0 = chance
adjusted_mutual_info_score(y_true, labels)
homogeneity_completeness_v_measure(y_true, labels)
contingency_matrix(y_true, labels)
keep = labels != -1                                                # drop DBSCAN noise first</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Every algorithm returns clusters, even on noise.</li>
    <li>Internal scores favour round, compact clusters (moons trap); use DBCV and plots for density clusters.</li>
    <li>Purity and Rand index are inflated; report ARI or AMI.</li>
    <li>Cluster labels are arbitrary names; never compare them by equality.</li>
    <li>Stable is necessary, not sufficient.</li>
    <li>Validate on information the clustering did not use.</li>
  </ul>

  <h2 id="ce-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is evaluating clustering harder than evaluating classification?</summary><div class="qa-body">There is usually no ground-truth label to compare with, and every algorithm returns clusters even on random data. So instead of one accuracy number we combine internal scores, external scores when some labels exist, stability checks and business validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you evaluate a clustering when you have no labels?</summary><div class="qa-body">Use internal scores (silhouette, Davies–Bouldin, Calinski–Harabasz) to compare k and settings within one algorithm; check stability under subsampling and different seeds; look at a 2-D projection; and validate with the business: profile the clusters, explain them with a shallow tree, and test whether they differ on an outcome they were not built from.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define the silhouette coefficient. What do its values mean?</summary><div class="qa-body">For a point, a is the mean distance to its own cluster and b the mean distance to the nearest other cluster; s = (b − a)/max(a, b). Near 1 means well placed, near 0 means on a border, negative means probably in the wrong cluster. The silhouette score is the mean over all points; for example a = 1.5 and b = 4 give 0.625.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare silhouette, Davies–Bouldin and Calinski–Harabasz.</summary><div class="qa-body">Silhouette is per point, ranges from −1 to 1, higher is better, and costs O(n²). Davies–Bouldin averages each cluster's worst (scatter + scatter)/centroid-distance ratio; lower is better and it is cheap. Calinski–Harabasz is between-cluster over within-cluster variance with degrees-of-freedom corrections; higher is better, it has no fixed scale and is cheap. All three favour compact, round clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a wrong clustering have a better silhouette than the correct one?</summary><div class="qa-body">Silhouette rewards clusters that are compact around a centre and far from each other. Long or curved true clusters have large within-cluster distances, so a straight cut into rounder halves can score higher while being wrong; on two moons, K-Means' wrong answer scored 0.494 and DBSCAN's correct answer 0.385. Use plots and density-based measures such as DBCV for such data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are Calinski–Harabasz and K-Means related?</summary><div class="qa-body">The within-cluster sum of squares W in CH is exactly K-Means' inertia, and B + W is the fixed total sum of squares. K-Means minimises W, which maximises B, so CH, like an ANOVA F-statistic, is naturally biased towards K-Means-style solutions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a contingency table in cluster evaluation?</summary><div class="qa-body">A table whose cell nᵢⱼ counts the items in true class i and cluster j. Its rows sum to class sizes and its columns to cluster sizes. Every external score (purity, Rand, ARI, mutual information and so on) is a function of this table, and renaming clusters only reorders its columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is purity a dangerous metric?</summary><div class="qa-body">It only checks that each cluster is dominated by one class, so it rewards splitting: n singleton clusters have purity 1. It is only meaningful when comparing clusterings with the same number of clusters, alongside a score such as ARI that penalises splitting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the Rand index and the adjusted Rand index.</summary><div class="qa-body">The Rand index is the fraction of item pairs on which two labelings agree (both together or both apart). With several groups most pairs are apart by chance, so random labels already score high. ARI subtracts the expected agreement of random labelings with the same group sizes and rescales, so random labels score about 0, identical ones 1, and worse-than-random can be negative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are pair-counting scores related to classification metrics?</summary><div class="qa-body">Treat "should these two items be together?" as a binary classification. TP, FP, FN and TN are its confusion matrix; the Rand index is its accuracy, Fowlkes–Mallows is the geometric mean of its precision and recall, and ARI is its chance-corrected agreement, similar to Cohen's kappa.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are homogeneity and completeness, and what do they tell you to do?</summary><div class="qa-body">Homogeneity = 1 − H(C|K)/H(C): each cluster contains a single class. Completeness = 1 − H(K|C)/H(K): each class lies in a single cluster. Low homogeneity means clusters mix classes, so consider more clusters; low completeness means classes are fragmented, so consider merging. Their harmonic mean is the V-measure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between NMI and AMI?</summary><div class="qa-body">NMI divides mutual information by an average of the two entropies, giving a 0-to-1 scale, but it is not corrected for chance: random labelings and many small clusters still get positive scores. AMI subtracts the expected mutual information of random labelings with the same sizes, so chance agreement scores about 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ARI or AMI: which would you report?</summary><div class="qa-body">Both are chance-corrected and ignore label names. ARI is the common default when the reference classes are fairly balanced and clusters reasonably large; AMI is preferred with unbalanced classes or many small clusters. Report one consistently, with homogeneity and completeness as diagnostics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run a stability analysis, and what does it prove?</summary><div class="qa-body">Repeatedly subsample or bootstrap the data, or change the seed, re-cluster with the same pipeline, and compare labels on the shared rows with ARI, or per cluster with Jaccard after matching. Unstable results are arbitrary and should be rejected. Stability does not prove correctness, because an algorithm can make the same mistake every time, such as always merging two nearby blobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the number of clusters?</summary><div class="qa-body">Compare candidate k values with internal scores (silhouette, Davies–Bouldin, Calinski–Harabasz, the elbow for K-Means or BIC for GMMs), keep only values that are stable under resampling, and among those prefer the one whose clusters are distinct and useful in profiling. Domain knowledge about how many segments can be acted on also matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you evaluate a DBSCAN or HDBSCAN result?</summary><div class="qa-body">Decide how to treat noise (−1): drop it for internal scores and report how many points were dropped. Silhouette and Davies–Bouldin are unfair to non-convex clusters, so prefer plots, a density-based score such as DBCV, stability across runs, and profiling of the clusters and of the noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Marketing says your segmentation with a high silhouette is useless. What do you check?</summary><div class="qa-body">Whether the clusters differ on things the business cares about: profile them with sizes and z-scores, see whether a shallow decision tree can describe them in plain rules, and test whether they differ on held-out outcomes such as response, churn or margin. If they do not, change the features to ones tied to the decision; a geometrically clean split on irrelevant features is still useless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a surrogate model in clustering, and why use one?</summary><div class="qa-body">A simple, interpretable model, usually a shallow decision tree, trained to predict the cluster labels from the original features. It turns clusters into readable rules that can be used in reports or CRM filters, and its accuracy shows how easily the clusters can be described; low accuracy is a warning for a segmentation meant for people.</div></details>
</main>
`
});
