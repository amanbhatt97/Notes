// notes/ml/ml_umap.js — UMAP
Object.assign(TOPIC_CONTENT, {
  "ml_umap": `<main>
  <h1>UMAP</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>UMAP</span></div>
  <p class="lead">UMAP, short for Uniform Manifold Approximation and Projection (McInnes, Healy and Melville, 2018), draws high-dimensional data as a low-dimensional map that keeps neighbours together, like t-SNE. It fixes most of t-SNE's practical problems: it is much faster on large data, it pays explicit attention to keeping unrelated points apart, and, most importantly, it can place new points on an existing map, so it can be used not only for pictures but also as a preprocessing step before clustering or a classifier. Today it is the standard way to visualise and cluster embeddings from language and image models. We keep the running example of the t-SNE note, 1,797 handwritten digits with 64 pixels each, compute UMAP's neighbour graph by hand on six points, and then measure what its two main settings do, how it compares with t-SNE and PCA, and how it performs as a step before clustering and classification.</p>

  <h2 id="um-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">UMAP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Phase 1: the graph</div>
        <ul>
          <li>Link each point to its n_neighbors − 1 nearest</li>
          <li>ρ = distance to the nearest neighbour</li>
          <li>w = exp(−(d − ρ)/σ), σ makes Σw = log₂k</li>
          <li>Fuzzy union: a + b − ab</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Phase 2: the layout</div>
        <ul>
          <li>Map similarity v = 1/(1 + a·d^{2b}); a, b from min_dist</li>
          <li>Cross-entropy: attraction + explicit repulsion</li>
          <li>SGD on sampled edges + negative sampling</li>
          <li>Spectral initial layout</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Knobs</div>
        <ul>
          <li>n_neighbors: local (5) ↔ global (50–200)</li>
          <li>min_dist: tight clumps (0) ↔ even spread (0.99)</li>
          <li>n_components: 2 for pictures, 5–50 for models</li>
          <li>metric: cosine for text embeddings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond pictures</div>
        <ul>
          <li>transform() places new points</li>
          <li>UMAP-10 → HDBSCAN for clustering</li>
          <li>Inside a Pipeline as a model step</li>
          <li>Gaps and sizes still only roughly meaningful</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="um-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea: Graph, then Layout</span><span class="rm-sub">what UMAP fixes about t-SNE, and how</span></div></div>
      <div class="rm-item rm-done" data-target="um-graph"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Fuzzy Neighbour Graph</span><span class="rm-sub">ρ, σ and the fuzzy union by hand</span></div></div>
      <div class="rm-item rm-done" data-target="um-curve"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Map Similarity Curve and min_dist</span><span class="rm-sub">how close points may sit</span></div></div>
      <div class="rm-item rm-done" data-target="um-loss"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cross-Entropy and Fast Optimisation</span><span class="rm-sub">attraction, repulsion, sampling</span></div></div>
      <div class="rm-item rm-done" data-target="um-digits"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">UMAP on the Digits</span><span class="rm-sub">umap-learn in practice</span></div></div>
      <div class="rm-item rm-done" data-target="um-knobs"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">n_neighbors and min_dist</span><span class="rm-sub">local vs global, clumpy vs even</span></div></div>
      <div class="rm-item rm-done" data-target="um-global"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Global Structure vs t-SNE</span><span class="rm-sub">an honest comparison</span></div></div>
      <div class="rm-item rm-done" data-target="um-transform"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Transforming New Data</span><span class="rm-sub">unseen digits on the map</span></div></div>
      <div class="rm-item rm-done" data-target="um-prep"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">UMAP as Preprocessing</span><span class="rm-sub">before clustering and classifiers</span></div></div>
      <div class="rm-item rm-done" data-target="um-choose"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing Between PCA, t-SNE and UMAP</span><span class="rm-sub">the group's final comparison</span></div></div>
      <div class="rm-item rm-done" data-target="um-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">leakage, over-reading, wrong settings</span></div></div>
      <div class="rm-item rm-done" data-target="um-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, parameters, numbers</span></div></div>
      <div class="rm-item rm-done" data-target="um-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on UMAP</span></div></div>
    </div>
  </div>

  <h2 id="um-idea"><span class="num">01</span>The Idea: Graph, then Layout</h2>
  <p><a class="xref" data-note="ml_tsne">t-SNE</a> gave the digits a beautiful map in which each digit formed its own island, but it left three practical problems. It is slow on large data, because every point repels every other point (approximated with a Barnes–Hut tree). It barely cares where non-neighbours go, so a true 10× gap between groups was drawn as 1.7×. And it has no <code>transform</code>: placing a single new digit meant refitting everything and moving the old points. UMAP keeps t-SNE's central idea, "keep neighbours together", and rebuilds the machinery around it to fix all three.</p>
  <p>UMAP works in two phases. In the first it builds a <strong>graph</strong> in the original high-dimensional space: every point is linked to its nearest neighbours, and each link gets a strength between 0 and 1 that says how sure we are the two points belong together. In the second phase it finds a <strong>layout</strong>: positions in two dimensions (or however many you ask for) such that a similar graph computed from those positions matches the first one as closely as possible, with linked points pulled together and unlinked points pushed apart. Think of drawing a metro map from city streets. First you list which stations are directly connected and how busy each connection is. Then you draw the map so connected stations sit close and unconnected ones do not overlap. Later you can add a new station by placing it next to the stations it connects to, without redrawing the whole map. That last property is exactly UMAP's <code>transform</code>.</p>
  <figure class="viz"><svg viewBox="0 0 680 220" width="680">
<defs><marker id="um-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="11.5">
<text x="10" y="16" class="tb">PHASE 1: graph (high-D)</text>
<rect x="10" y="24" width="120" height="46" rx="7" class="fs" stroke="currentColor"/><text x="70" y="43" text-anchor="middle" font-weight="700">kNN</text><text x="70" y="59" text-anchor="middle" class="tm">n_neighbors</text>
<rect x="150" y="24" width="120" height="46" rx="7" class="fb sb"/><text x="210" y="43" text-anchor="middle" font-weight="700">ρᵢ, σᵢ</text><text x="210" y="59" text-anchor="middle" class="tm">Σw = log₂k</text>
<rect x="290" y="24" width="120" height="46" rx="7" class="fb sb"/><text x="350" y="43" text-anchor="middle" font-weight="700">wᵢⱼ directed</text><text x="350" y="59" text-anchor="middle" class="tm">exp(−(d−ρ)/σ)</text>
<rect x="430" y="24" width="120" height="46" rx="7" class="fb sb"/><text x="490" y="43" text-anchor="middle" font-weight="700">Fuzzy union</text><text x="490" y="59" text-anchor="middle" class="tm">a + b − ab</text>
<line x1="130" y1="47" x2="148" y2="47" stroke="currentColor" marker-end="url(#um-c)"/><line x1="270" y1="47" x2="288" y2="47" stroke="currentColor" marker-end="url(#um-c)"/><line x1="410" y1="47" x2="428" y2="47" stroke="currentColor" marker-end="url(#um-c)"/>
<text x="10" y="102" class="tb">PHASE 2: layout (low-D)</text>
<rect x="10" y="110" width="120" height="46" rx="7" class="ft st"/><text x="70" y="129" text-anchor="middle" font-weight="700">Spectral start</text><text x="70" y="145" text-anchor="middle" class="tm">from the graph</text>
<rect x="150" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="210" y="129" text-anchor="middle" font-weight="700">v = 1/(1+a d^2b)</text><text x="210" y="145" text-anchor="middle" class="tm">a, b from min_dist</text>
<rect x="290" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="350" y="129" text-anchor="middle" font-weight="700">Cross-entropy</text><text x="350" y="145" text-anchor="middle" class="tm">attract + repel</text>
<rect x="430" y="110" width="120" height="46" rx="7" class="fr sr"/><text x="490" y="129" text-anchor="middle" font-weight="700">SGD</text><text x="490" y="145" text-anchor="middle" class="tm">edge + negative samples</text>
<line x1="130" y1="133" x2="148" y2="133" stroke="currentColor" marker-end="url(#um-c)"/><line x1="270" y1="133" x2="288" y2="133" stroke="currentColor" marker-end="url(#um-c)"/><line x1="410" y1="133" x2="428" y2="133" stroke="currentColor" marker-end="url(#um-c)"/>
<line x1="490" y1="70" x2="350" y2="108" stroke="currentColor" marker-end="url(#um-c)"/>
<rect x="575" y="70" width="100" height="56" rx="7" class="fs" stroke="currentColor"/><text x="625" y="92" text-anchor="middle" font-weight="700">Embedding</text><text x="625" y="110" text-anchor="middle" class="tm">+ transform()</text>
<line x1="550" y1="133" x2="573" y2="110" stroke="currentColor" marker-end="url(#um-c)"/>
<text x="10" y="190" class="tm">t-SNE counterparts: kNN + σ ↔ perplexity search · fuzzy union ↔ symmetrise · v ↔ Student-t (a = b = 1)</text>
<text x="10" y="208" class="tm">cross-entropy ↔ KL (no repulsion term) · negative sampling ↔ Barnes–Hut · spectral start ↔ PCA start</text>
</g></svg><figcaption>UMAP's two phases. The finished graph (top right) is what the layout loss compares against.</figcaption></figure>
  <p>Read the figure left to right. The top row is phase 1: find each point's nearest neighbours, give each point its own distance scale (ρ and σ, explained next), turn distances into one-directional link strengths, and merge the two directions of each link. The finished graph feeds the loss in the bottom row. Phase 2 starts from a layout computed from the graph itself, measures each map distance with a curve controlled by <code>min_dist</code>, scores the layout with a cross-entropy that both attracts and repels, and improves it by stochastic gradient descent. The bottom lines map each piece to its t-SNE counterpart, which is the quickest way to remember UMAP if you already know t-SNE. The name comes from the theory behind phase 1: if we assume the data is spread <em>uniformly</em> over a curved surface (a manifold), then in dense regions distances must be "shorter" and in sparse regions "longer" than they look, so each point needs its own distance scale. In practice that theory becomes the per-point ρ and σ.</p>
  <p>The running example is the same as in the t-SNE note, loaded from a file called <code>digits.py</code>:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
X, y = load_digits(return_X_y=True)        # 1,797 handwritten digits, 8x8 = 64 pixel columns
Xs = StandardScaler().fit_transform(X)</div>

  <h2 id="um-graph"><span class="num">02</span>The Fuzzy Neighbour Graph</h2>
  <p>To see every number in phase 1, take six digits summarised by one coordinate each (say, their position along the first principal component): <strong>1, 2 and 3.5</strong> (three images of a 0) and <strong>10, 11 and 12.5</strong> (three images of a 1). UMAP's main setting is <code>n_neighbors</code>, the size of each point's neighbourhood, and it counts the point itself. With <code>n_neighbors = 4</code>, each point links to its 3 nearest others. Point 1.0 links to 2.0 (distance 1), 3.5 (distance 2.5) and 10.0 (distance 9). Each group has only three members, so every point's third neighbour lies in the <em>other</em> group. That is the first intuition for <code>n_neighbors</code>: when it is larger than a group, the graph necessarily links groups together, and with <code>n_neighbors = 3</code> here the two groups would be completely disconnected. Small values give separate local pieces; large values give links between pieces, which is global structure.</p>
  <p>A bare list of neighbours treats the 1st and 3rd neighbour the same, even when the 3rd is six times further away. So each link gets a <strong>weight</strong> between 0 and 1, built in three steps. First, <strong>ρᵢ</strong> (rho) is the distance from point i to its nearest neighbour. Second, the weight to each neighbour decays with the <em>extra</em> distance beyond that nearest one: <strong>wᵢⱼ = exp(−(dᵢⱼ − ρᵢ) / σᵢ)</strong>. Subtracting ρ guarantees every point a link of weight exactly 1 to its nearest neighbour, so even a point in an empty region is never cut off from the graph; this is called <strong>local connectivity</strong>. Third, the width <strong>σᵢ</strong> is chosen so that each point's weights add up to <strong>log₂ k</strong>, where k = n_neighbors. That plays the same role as t-SNE's perplexity: it gives every point the same "amount" of neighbourhood whatever the local density.</p>
  <p>By hand for point 1.0: ρ = 1, so the extra distances are 0, 1.5 and 8. We need 1 + e^(−1.5/σ) + e^(−8/σ) = log₂ 4 = 2. Trying σ = 5.552 gives e^(−0.270) = 0.763 and e^(−1.441) = 0.237, and 1 + 0.763 + 0.237 = 2, so the weights are <strong>1, 0.763 and 0.237</strong>. In general σ is found by binary search, exactly as in t-SNE.</p>
  <p>The weights are one-directional: 1.0's weight towards 3.5 is 0.763, but 3.5, with its own ρ and σ, gives 1.0 a weight of 0.755. UMAP treats each weight as the probability that the link exists "from that side" and combines them as the probability that it exists from <em>either</em> side, the <strong>fuzzy union</strong>: <strong>w = a + b − a·b</strong>. (If two friends each independently have a chance of phoning the other, this is the chance that at least one of them calls.) For 1.0–3.5 that is 0.763 + 0.755 − 0.763 × 0.755 = <strong>0.942</strong>. For the cross-group link 3.5–10.0 it is 0.245 + 0.288 − 0.071 = <strong>0.462</strong>. The code repeats this for all six points and then compares our matrix with the graph that the <code>umap-learn</code> library itself builds:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import NearestNeighbors
pts = np.array([[1.0], [2.0], [3.5], [10.0], [11.0], [12.5]])   # six digits, summarised by one number
k = 4                                                           # n_neighbors (UMAP counts the point itself)
dist, idx = NearestNeighbors(n_neighbors=k).fit(pts).kneighbors(pts)
W = np.zeros((6, 6))
for i in range(6):
    d = dist[i, 1:]                                             # distances to the 3 real neighbours
    rho = d.min()                                               # distance to the nearest neighbour
    lo, hi = 1e-6, 100.0
    for _ in range(64):                                         # binary search: weights must sum to log2(k)
        s = (lo + hi) / 2
        tot = np.exp(-np.maximum(d - rho, 0) / s).sum()
        lo, hi = (lo, s) if tot &gt; np.log2(k) else (s, hi)
    w = np.exp(-np.maximum(d - rho, 0) / s)
    W[i, idx[i, 1:]] = w
    print(f"point {pts[i,0]:4.1f}: neighbours {pts[idx[i,1:],0].tolist()} rho={rho:.1f} sigma={s:.3f} weights={w.round(3).tolist()}")
G = W + W.T - W * W.T                                           # fuzzy union
print("edge 1.0-2.0:", G[0, 1].round(3), "  edge 1.0-3.5:", G[0, 2].round(3), "  edge 3.5-10.0:", G[2, 3].round(3))

import umap                                                     # pip install umap-learn
graph = umap.umap_.fuzzy_simplicial_set(pts, n_neighbors=k, random_state=0, metric="euclidean")[0].toarray()
print("umap-learn's own graph is the same:", np.allclose(graph, G, atol=1e-3))</div>
  <div class="fx" data-lang="text">point  1.0: neighbours [2.0, 3.5, 10.0] rho=1.0 sigma=5.552 weights=[1.0, 0.763, 0.237]
point  2.0: neighbours [1.0, 3.5, 10.0] rho=1.0 sigma=3.480 weights=[1.0, 0.866, 0.134]
point  3.5: neighbours [2.0, 1.0, 10.0] rho=1.5 sigma=3.556 weights=[1.0, 0.755, 0.245]
point 10.0: neighbours [11.0, 12.5, 3.5] rho=1.0 sigma=4.417 weights=[1.0, 0.712, 0.288]
point 11.0: neighbours [10.0, 12.5, 3.5] rho=1.0 sigma=3.309 weights=[1.0, 0.86, 0.14]
point 12.5: neighbours [11.0, 10.0, 3.5] rho=1.5 sigma=4.596 weights=[1.0, 0.804, 0.196]
edge 1.0-2.0: 1.0   edge 1.0-3.5: 0.942   edge 3.5-10.0: 0.462
umap-learn's own graph is the same: True</div>
  <p>Every ρ, σ, weight and union matches the hand work, and the last line confirms that our matrix is identical to umap-learn's own <code>fuzzy_simplicial_set</code>. Within-group links are strong (0.94 to 1) and the cross-group link is weaker (0.46); in the layout phase, strong links become strong pulls. One difference from t-SNE is worth noticing. UMAP's weights are not normalised to add up to 1 over all pairs; each is an independent membership strength between 0 and 1. That is what lets UMAP's loss include an explicit "there is no link here" term, as section 04 shows. For large datasets UMAP finds the nearest neighbours approximately with a fast algorithm called NN-descent (the <code>pynndescent</code> package); for small ones it computes them exactly.</p>

  <h2 id="um-curve"><span class="num">03</span>The Map Similarity Curve and min_dist</h2>
  <p>The graph is built. To lay it out, UMAP needs to know how strongly two points are "linked" on the map when they sit at distance d, and it needs a way to stop all of a point's neighbours piling onto the same spot. It uses the curve <strong>v(d) = 1 / (1 + a·d^{2b})</strong>. With a = b = 1 this is exactly t-SNE's Student-t curve. UMAP instead fits a and b so that v looks like "1 up to a distance of <code>min_dist</code>, then decaying", which means <code>min_dist</code> is the distance below which two map points already count as fully linked. It therefore controls how tightly points may pack.</p>
  <div class="fx" data-lang="py">from umap.umap_ import find_ab_params
for md in (0.0, 0.1, 0.99):
    a, b = find_ab_params(spread=1.0, min_dist=md)
    v = lambda d: 1 / (1 + a * d ** (2 * b))
    print(f"min_dist={md:4}: a={a:.3f} b={b:.3f}   v at d=0.1: {v(0.1):.3f}  d=0.5: {v(0.5):.3f}  d=1: {v(1):.3f}  d=3: {v(3):.3f}")
t = lambda d: 1 / (1 + d ** 2)
print(f"t-SNE's Student-t:              v at d=0.1: {t(0.1):.3f}  d=0.5: {t(0.5):.3f}  d=1: {t(1):.3f}  d=3: {t(3):.3f}")</div>
  <div class="fx" data-lang="text">min_dist= 0.0: a=1.933 b=0.790   v at d=0.1: 0.952  d=0.5: 0.608  d=1: 0.341  d=3: 0.083
min_dist= 0.1: a=1.577 b=0.895   v at d=0.1: 0.975  d=0.5: 0.687  d=1: 0.388  d=3: 0.082
min_dist=0.99: a=0.119 b=1.916   v at d=0.1: 1.000  d=0.5: 0.992  d=1: 0.893  d=3: 0.111
t-SNE's Student-t:              v at d=0.1: 0.990  d=0.5: 0.800  d=1: 0.500  d=3: 0.100</div>
  <p>With the default <code>min_dist = 0.1</code>, a = 1.577 and b = 0.895, and the similarity is 0.975 at distance 0.1 and 0.388 at distance 1. With <code>min_dist = 0.99</code>, the curve stays near 1 out to about 0.5 (0.992) and is still 0.893 at 1: neighbours are already "close enough" when they are some distance apart, so the layout has no reason to squeeze them together, and the map spreads out evenly. With <code>min_dist = 0</code> the curve drops fastest near zero (0.608 at 0.5), so neighbours must sit almost on top of each other to look linked, producing dense clumps. Far away, at distance 3, all the curves agree (about 0.08 to 0.11), like t-SNE's heavy tail. One thing <code>min_dist</code> does not change is <em>which</em> points are neighbours; that was settled by the graph in phase 1. It only changes how tightly they are drawn.</p>

  <h2 id="um-loss"><span class="num">04</span>Cross-Entropy and Fast Optimisation</h2>
  <p>We have link strengths w from the graph and v from the map. For each pair, UMAP treats both as the probability that "there is a link here" and compares them with a binary cross-entropy, the same idea as the log-loss of logistic regression:</p>
  <p><strong>CE = w·log(w/v) + (1 − w)·log((1 − w)/(1 − v))</strong></p>
  <p>The first part is <strong>attraction</strong>: it is large when the graph says "linked" (w high) but the map draws the points far apart (v low). The second part is <strong>repulsion</strong>: it is large when the graph says "not linked" (w low) but the map draws the points close (v high). t-SNE's KL divergence has only the first kind of term per pair. The code scores four situations:</p>
  <div class="fx" data-lang="py">import numpy as np
def ce(w, v):                     # UMAP's per-pair cross-entropy: attraction + repulsion
    att = w * np.log(w / v)
    rep = (1 - w) * np.log((1 - w) / (1 - v)) if w &lt; 1 else 0.0
    return att, rep
cases = [("neighbours drawn far apart", 1.0, 0.1), ("neighbours drawn close", 1.0, 0.9),
         ("strangers drawn close", 0.01, 0.9), ("strangers drawn far", 0.01, 0.05)]
for name, w, v in cases:
    a, r = ce(w, v)
    print(f"{name:27s} w={w:&lt;4} v={v:&lt;4} attraction={a:6.3f} repulsion={r:6.3f} total={a + r:6.3f}")</div>
  <div class="fx" data-lang="text">neighbours drawn far apart  w=1.0  v=0.1  attraction= 2.303 repulsion= 0.000 total= 2.303
neighbours drawn close      w=1.0  v=0.9  attraction= 0.105 repulsion= 0.000 total= 0.105
strangers drawn close       w=0.01 v=0.9  attraction=-0.045 repulsion= 2.270 total= 2.225
strangers drawn far         w=0.01 v=0.05 attraction=-0.016 repulsion= 0.041 total= 0.025</div>
  <p>Neighbours drawn far apart cost 1 × ln(1/0.1) = <strong>2.303</strong>, just as in t-SNE. The difference is the third line: strangers drawn close together cost <strong>2.270</strong> through the repulsion term, whereas in t-SNE the same mistake was almost free (−0.115). Strangers drawn far apart cost only 0.025, as they should. Because UMAP actively pays for drawing unrelated points close, it tends to keep separate groups apart more consistently. It does not, however, make distances between groups accurate: the repulsion says "keep strangers apart", not "keep them at the right distance".</p>
  <p>The optimisation is designed for speed. It starts from a <strong>spectral layout</strong>: positions taken from the eigenvectors of the graph's Laplacian matrix, a classic way to draw a graph so that strongly connected points are near each other. This already places big groups sensibly, and a large part of UMAP's good global layout comes from this start. Then it runs <strong>stochastic gradient descent over edges</strong>: in each epoch it samples links in proportion to their weight and pulls their two ends together. For every pulled link it also picks a few random points, five by default (<code>negative_sample_rate</code>), treats them as non-neighbours with w ≈ 0, and pushes them away. This <strong>negative sampling</strong> replaces t-SNE's all-pairs repulsion: there is no n² sum and no tree, so the cost per epoch grows roughly in proportion to n. Together with the approximate nearest-neighbour search and numba-compiled, multi-threaded code, this is why UMAP embeds hundreds of thousands to millions of points on a laptop in minutes. UMAP also supports any number of output dimensions, whereas Barnes–Hut t-SNE is limited to 2 or 3. One practical detail: setting <code>random_state</code> makes runs repeatable but switches UMAP to single-threaded mode, which is slower on big data.</p>

  <h2 id="um-digits"><span class="num">05</span>UMAP on the Digits</h2>
  <p>The library is called <code>umap-learn</code> (install it with <code>pip install umap-learn</code>; the package named just <code>umap</code> is something unrelated) and is imported as <code>umap</code>. Its interface follows scikit-learn: <code>umap.UMAP(...)</code>, then <code>fit</code>, <code>fit_transform</code> and <code>transform</code>, with the fitted map stored in <code>embedding_</code>. It uses numba, so the first call includes a short compilation pause. Here it is with its default settings written out, measured the same way as t-SNE was:</p>
  <div class="fx" data-lang="py">import umap
from sklearn.manifold import trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
reducer = umap.UMAP(n_components=2, n_neighbors=15, min_dist=0.1, random_state=0)
Z = reducer.fit_transform(Xs)
print("map shape:", Z.shape)
print("5-NN accuracy on the 2 UMAP coordinates:", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))
print("trustworthiness:", round(trustworthiness(Xs, Z, n_neighbors=10), 3))</div>
  <div class="fx" data-lang="text">map shape: (1797, 2)
5-NN accuracy on the 2 UMAP coordinates: 0.959
trustworthiness: 0.975</div>
  <p>A 5-NN classifier on the two UMAP coordinates scores <strong>0.959</strong> (t-SNE 0.954, PCA 0.514), and trustworthiness is <strong>0.975</strong> (t-SNE 0.986). Locally, UMAP is about as good as t-SNE: each digit forms its own island, and the few misplaced points are ambiguous handwriting. Visually, UMAP maps usually show tighter islands with more white space between them than t-SNE maps, and a different arrangement of the islands. UMAP is not "a faster t-SNE with the same output"; different curves and a different loss give different pictures.</p>

  <h2 id="um-knobs"><span class="num">06</span>n_neighbors and min_dist</h2>
  <p>UMAP has two settings that matter most. <code>n_neighbors</code> decides who is linked in the graph, and therefore the balance between local detail and global layout. <code>min_dist</code> decides how tightly linked points are drawn. The code varies each in turn on the digits and records three things: trust(10), whether each point's 10 nearest map neighbours are real; a "centre correlation", the rank correlation between the distances separating the ten digit-class centres in 64 dimensions and on the map (1 would mean the digit groups are arranged in exactly the same order of distances); and the average size of each digit's island after rescaling every map to the same overall spread.</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from scipy.stats import spearmanr
from sklearn.manifold import trustworthiness
from digits import Xs, y
iu = np.triu_indices(10, 1)
c_hi = np.array([Xs[y == k].mean(0) for k in range(10)])
d_hi = np.linalg.norm(c_hi[:, None] - c_hi[None], axis=-1)[iu]
def centre_corr(Z):                     # are the 10 digit centres arranged like in 64-D?
    c_lo = np.array([Z[y == k].mean(0) for k in range(10)])
    return spearmanr(d_hi, np.linalg.norm(c_lo[:, None] - c_lo[None], axis=-1)[iu])[0]
def spread(Z):                          # average size of each digit's island (map rescaled to std 1)
    Z = Z / Z.std()
    return np.mean([np.linalg.norm(Z[y == k] - Z[y == k].mean(0), axis=1).mean() for k in range(10)])
for nn, md in [(5, 0.1), (15, 0.1), (100, 0.1), (15, 0.0), (15, 0.99)]:
    Z = umap.UMAP(n_neighbors=nn, min_dist=md, random_state=0).fit_transform(Xs)
    print(f"n_neighbors={nn:3d} min_dist={md:4}: trust(10)={trustworthiness(Xs, Z, n_neighbors=10):.3f} "
          f"centre corr={centre_corr(Z):.3f} island spread={spread(Z):.3f}")</div>
  <div class="fx" data-lang="text">n_neighbors=  5 min_dist= 0.1: trust(10)=0.977 centre corr=0.618 island spread=0.258
n_neighbors= 15 min_dist= 0.1: trust(10)=0.975 centre corr=0.644 island spread=0.202
n_neighbors=100 min_dist= 0.1: trust(10)=0.968 centre corr=0.700 island spread=0.256
n_neighbors= 15 min_dist= 0.0: trust(10)=0.978 centre corr=0.658 island spread=0.186
n_neighbors= 15 min_dist=0.99: trust(10)=0.956 centre corr=0.656 island spread=0.357</div>
  <p>Raising <code>n_neighbors</code> from 5 to 100 lowers trust(10) slightly (0.977 → 0.968), because each point's graph now reaches further and fine local detail is smoothed, while the centre correlation rises from 0.618 to 0.700: the digit groups are arranged more faithfully. Very small values can also split one digit into several islands; very large values merge small groups and show the big shape. The default of 15 is a good start, and 5 to 50 is the usual range. Changing <code>min_dist</code> barely affects the centre correlation (0.658 and 0.656) but changes the packing: at 0 each digit's island has spread 0.186, at 0.99 it has 0.357, nearly twice as large and much more evenly filled. Small <code>min_dist</code> (0 to 0.1) suits clustering on the embedding, where dense, well-separated clumps help; larger values suit viewing, where you want to see inside each group without points piling on top of each other. As a rule of thumb, tune <code>n_neighbors</code> for <em>what</em> you want to see and <code>min_dist</code> for <em>how</em> it should look, and measure a goal (trustworthiness, separability, cluster stability) rather than tuning until the picture "looks right".</p>

  <h2 id="um-global"><span class="num">07</span>Global Structure vs t-SNE</h2>
  <p>UMAP is often said to "preserve global structure better than t-SNE". Thanks to its repulsion term and spectral start, it often does, but the claim needs care. The first test is the controlled one from the t-SNE note: three groups in 10 dimensions where group C is 10 times further from A than B is.</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from sklearn.manifold import TSNE
rng = np.random.default_rng(0)
cent = np.zeros((3, 10)); cent[1, 0] = 5; cent[2, 0] = 50            # A-B close, C ten times farther
X3 = np.vstack([rng.normal(c, 1.0, (200, 10)) for c in cent]); y3 = np.repeat([0, 1, 2], 200)
def ratio(Z):
    c = np.array([Z[y3 == i].mean(0) for i in range(3)])
    return np.linalg.norm(c[0] - c[2]) / np.linalg.norm(c[0] - c[1])
print(f"A-C gap / A-B gap: true {ratio(X3):.1f} | t-SNE {ratio(TSNE(2, random_state=0).fit_transform(X3)):.1f} | "
      f"UMAP {ratio(umap.UMAP(random_state=0).fit_transform(X3)):.1f}")</div>
  <div class="fx" data-lang="text">A-C gap / A-B gap: true 10.0 | t-SNE 1.7 | UMAP 3.9</div>
  <p>UMAP draws the far group 3.9 times further away: still compressed compared with the truth of 10, but much closer than t-SNE's 1.7. The second test uses the digits themselves, comparing all three methods on the local scores and on the centre correlation from the previous section:</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from scipy.stats import spearmanr
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE, trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
iu = np.triu_indices(10, 1)
c_hi = np.array([Xs[y == k].mean(0) for k in range(10)])
d_hi = np.linalg.norm(c_hi[:, None] - c_hi[None], axis=-1)[iu]
def centre_corr(Z):
    c_lo = np.array([Z[y == k].mean(0) for k in range(10)])
    return spearmanr(d_hi, np.linalg.norm(c_lo[:, None] - c_lo[None], axis=-1)[iu])[0]
maps = {"PCA": PCA(2).fit_transform(Xs),
        "t-SNE": TSNE(2, random_state=0).fit_transform(Xs),
        "UMAP": umap.UMAP(random_state=0).fit_transform(Xs)}
print("method | 5-NN acc | trust(10) | class-centre corr")
for name, Z in maps.items():
    print(f"{name:6s} | {cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean():8.3f} | "
          f"{trustworthiness(Xs, Z, n_neighbors=10):9.3f} | {centre_corr(Z):.3f}")</div>
  <div class="fx" data-lang="text">method | 5-NN acc | trust(10) | class-centre corr
PCA    |    0.514 |     0.816 | 0.789
t-SNE  |    0.954 |     0.986 | 0.681
UMAP   |    0.959 |     0.975 | 0.644</div>
  <p>Here the picture is more nuanced. Locally, t-SNE and UMAP tie (5-NN 0.954 and 0.959; trust(10) 0.986 and 0.975), and both crush PCA. For the arrangement of the ten digit groups, PCA, being linear, is actually best (0.789), and t-SNE with scikit-learn's default PCA start (0.681) is slightly <em>ahead</em> of UMAP at default settings (0.644). Research by Kobak and Linderman (2021) found that much of UMAP's reputation for better global structure came from comparing UMAP's informative spectral start with t-SNE's old random start; give both an informative start and their global layouts are similar. UMAP's centre correlation also rose to 0.700 with <code>n_neighbors = 100</code> in the previous section, so settings matter as much as the algorithm. The fair summary for an interview is: UMAP tends to keep more large-scale structure because of its loss and its spectral start; t-SNE with PCA initialisation is competitive; and neither preserves distances between groups faithfully, so global claims should be checked in the original space or with PCA.</p>

  <h2 id="um-transform"><span class="num">08</span>Transforming New Data</h2>
  <p>With t-SNE, one new digit meant refitting and moving every old point. UMAP can place new points on an existing map. For each new point it finds the nearest neighbours <em>among the training points</em>, computes fuzzy weights to them exactly as in section 02, starts the new point at the weighted average of their map positions, and runs a few optimisation epochs that move only the new points. The training map stays fixed. The code fits UMAP on 70% of the digits and then places the other 30%, which it has never seen:</p>
  <div class="fx" data-lang="py">import umap
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from digits import Xs, y
Xtr, Xte, ytr, yte = train_test_split(Xs, y, test_size=0.3, stratify=y, random_state=0)
reducer = umap.UMAP(random_state=0).fit(Xtr)              # learn the map from training digits only
Ztr = reducer.embedding_                                  # coordinates of the training digits
Zte = reducer.transform(Xte)                              # place the unseen digits on the same map
knn = KNeighborsClassifier(5).fit(Ztr, ytr)
print("unseen digits placed:", Zte.shape, "  5-NN test accuracy on the map:", round(knn.score(Zte, yte), 3))
print("5-NN test accuracy on the raw 64 pixels:", round(KNeighborsClassifier(5).fit(Xtr, ytr).score(Xte, yte), 3))</div>
  <div class="fx" data-lang="text">unseen digits placed: (540, 2)   5-NN test accuracy on the map: 0.961
5-NN test accuracy on the raw 64 pixels: 0.97</div>
  <p>The 540 unseen digits land on the map built from the 1,257 training digits. A 5-NN classifier trained on the training map and tested on the transformed test digits scores <strong>0.961</strong>, close to the 0.970 of 5-NN on all 64 raw pixels: two numbers per digit keep almost all the class information. This time the evaluation is honest, because the test digits did not help shape the map. UMAP also offers an approximate <code>inverse_transform</code>, which maps a point on the 2-D map back to 64 pixels, useful for asking "what would a digit at this spot look like?". One caution: <code>transform</code> can only place a new point relative to training points, so data that differs strongly from the training data (a new hospital, a new camera, a new language) lands somewhere misleading. When the population changes, refit.</p>

  <h2 id="um-prep"><span class="num">09</span>UMAP as Preprocessing</h2>
  <p>Because UMAP has a <code>transform</code> and can output any number of dimensions, it can feed other algorithms, not just pictures. The most important use is clustering. Density-based clustering such as <a class="xref" data-note="ml_dbscan">HDBSCAN</a> struggles in 64 dimensions, because of the curse of dimensionality: points are spread so thinly that "dense region" loses its meaning. The code clusters three versions of the digits, the raw pixels, 10 PCA components and 10 UMAP dimensions, with both k-means and HDBSCAN, and compares the clusters with the true digits using the adjusted Rand index (ARI: 1 means perfect agreement, 0 means no better than chance; see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>). For clustering we use <code>min_dist = 0</code> to pack each group tightly and <code>n_neighbors = 30</code>.</p>
  <div class="fx" data-lang="py">import umap
from sklearn.cluster import KMeans, HDBSCAN
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score as ari
from digits import Xs, y
inputs = {"raw 64-D": Xs,
          "PCA 10-D": PCA(10, random_state=0).fit_transform(Xs),
          "UMAP 10-D": umap.UMAP(n_components=10, n_neighbors=30, min_dist=0.0, random_state=0).fit_transform(Xs)}
for name, Z in inputs.items():
    km = KMeans(10, n_init=10, random_state=0).fit_predict(Z)
    hd = HDBSCAN(min_cluster_size=30).fit_predict(Z)
    print(f"{name:9s}  k-means ARI={ari(y, km):.3f}  HDBSCAN ARI={ari(y, hd):.3f} "
          f"(clusters={hd.max() + 1}, noise={(hd == -1).mean():.0%})")</div>
  <div class="fx" data-lang="text">raw 64-D   k-means ARI=0.468  HDBSCAN ARI=0.060 (clusters=6, noise=74%)
PCA 10-D   k-means ARI=0.485  HDBSCAN ARI=0.088 (clusters=6, noise=67%)
UMAP 10-D  k-means ARI=0.875  HDBSCAN ARI=0.798 (clusters=10, noise=1%)</div>
  <p>On raw pixels <a class="xref" data-note="ml_kmeans">k-means</a> reaches an ARI of 0.468 and HDBSCAN only 0.060, labelling 74% of the digits as noise because in 64 dimensions nothing looks dense. Ten PCA components barely help (0.485 and 0.088), because PCA is linear and the digit groups are curved. After UMAP to 10 dimensions, k-means jumps to <strong>0.875</strong> and HDBSCAN finds exactly 10 clusters with only 1% noise, ARI <strong>0.798</strong>. UMAP concentrates each digit's images into a dense region that density-based clustering can find. This gives the standard modern recipe for clustering embeddings: <strong>scale → (PCA to about 50) → UMAP to 5–15 dimensions with min_dist 0 → HDBSCAN</strong>, and then a separate 2-D UMAP just for the picture. Clusters found this way can still be artefacts of the settings, so check that they persist across seeds and settings and read examples from each cluster.</p>
  <p>UMAP can also be a step inside a classifier pipeline. Placed in a <code>Pipeline</code>, it is refitted on each training fold and applied with <code>transform</code> to the held-out fold, so the score is honest:</p>
  <div class="fx" data-lang="py">import umap
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.decomposition import PCA
from sklearn.model_selection import cross_val_score, StratifiedKFold
from digits import X, y
cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, reducer in [("PCA 10", PCA(10)), ("UMAP 10", umap.UMAP(n_components=10, random_state=0))]:
    pipe = make_pipeline(StandardScaler(), reducer, LogisticRegression(max_iter=5000))
    print(f"{name:8s} -&gt; logistic regression, 5-fold CV accuracy: {cross_val_score(pipe, X, y, cv=cv).mean():.3f}")</div>
  <div class="fx" data-lang="text">PCA 10   -&gt; logistic regression, 5-fold CV accuracy: 0.884
UMAP 10  -&gt; logistic regression, 5-fold CV accuracy: 0.967</div>
  <p>A plain logistic regression on 10 UMAP dimensions scores <strong>0.967</strong>, against 0.884 on 10 PCA components: the non-linear reduction has made the digit classes almost linearly separable. UMAP also supports a <strong>supervised</strong> mode, <code>fit(X, y)</code>, which uses labels to shape the graph so that classes separate even more cleanly. Supervised UMAP is powerful, and for exactly that reason it must only ever see training labels; section 11 shows what happens otherwise.</p>

  <h2 id="um-choose"><span class="num">10</span>Choosing Between PCA, t-SNE and UMAP</h2>
  <p>UMAP closes the dimensionality-reduction group, so this is the place to put the three extraction methods side by side, using the numbers measured on the digits in this note and the last two.</p>
  <table class="tbl">
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Idea</td><td>rotate to the axes of greatest variance, keep the top k</td><td>match Gaussian neighbour probabilities with Student-t map probabilities (KL)</td><td>match a fuzzy kNN graph with a map graph (cross-entropy)</td></tr>
    <tr><td>Linear</td><td>yes</td><td>no</td><td>no</td></tr>
    <tr><td>Digits, 2-D 5-NN</td><td>0.514</td><td>0.954</td><td>0.959</td></tr>
    <tr><td>Digits, trust(10)</td><td>0.816</td><td>0.986</td><td>0.975</td></tr>
    <tr><td>Digit-group arrangement</td><td>0.789</td><td>0.681</td><td>0.644 (0.700 at n_neighbors 100)</td></tr>
    <tr><td>True 10× gap drawn as</td><td>10.0×</td><td>1.7×</td><td>3.9×</td></tr>
    <tr><td>Cluster sizes meaningful</td><td>yes</td><td>no</td><td>no</td></tr>
    <tr><td>New points</td><td>transform</td><td>no</td><td>transform (test 5-NN 0.961)</td></tr>
    <tr><td>Speed on large data</td><td>fastest</td><td>slowest</td><td>fast</td></tr>
    <tr><td>Output dimensions</td><td>any</td><td>2–3</td><td>any</td></tr>
    <tr><td>As model input</td><td>yes (logistic 0.884 with 10)</td><td>never</td><td>yes, in a pipeline (0.967 with 10)</td></tr>
    <tr><td>Before HDBSCAN</td><td>little help (ARI 0.088)</td><td>no</td><td>strong help (ARI 0.798)</td></tr>
    <tr><td>Interpretable axes</td><td>loadings</td><td>no</td><td>no</td></tr>
  </table>
  <p>The table turns into three simple rules. To feed a model, use PCA in a pipeline, or UMAP when the structure is non-linear and you cross-validate it properly; never t-SNE. To draw a picture, scale, reduce to about 50 PCA components, then run UMAP or t-SNE, colour by known labels, check a few settings, and read neighbourhoods rather than gaps or sizes. To cluster embeddings, run UMAP to about 10 dimensions with <code>min_dist = 0</code>, cluster with HDBSCAN, and visualise separately in 2-D. And when you need explanations in terms of the original columns, none of the three is right: go back to feature selection from <a class="xref" data-note="ml_dimred">the first note of the group</a>.</p>

  <h2 id="um-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most serious mistake is fitting UMAP on all the data and then cross-validating a model on its output. Unsupervised UMAP leaks a little, because the test rows helped shape the map; supervised UMAP leaks enormously, because the labels of the test rows shaped it. The demonstration uses pure noise with random labels, where the honest accuracy is 50%:</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(0)
X = rng.normal(size=(300, 50))                  # pure noise: nothing to learn
y = rng.integers(0, 2, 300)                     # random labels, true accuracy 50%

# WRONG: supervised UMAP fitted on ALL rows (labels included), then cross-validate
Z = umap.UMAP(random_state=0).fit_transform(X, y)
print("UMAP on all rows, then CV:", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))

# RIGHT: UMAP is a pipeline step, refitted inside each training fold
pipe = make_pipeline(umap.UMAP(random_state=0), KNeighborsClassifier(5))
print("UMAP inside the pipeline: ", round(cross_val_score(pipe, X, y, cv=5).mean(), 3))</div>
  <div class="fx" data-lang="text">UMAP on all rows, then CV: 1.0
UMAP inside the pipeline:  0.473</div>
  <p>Fitted on all rows with labels, UMAP arranges the noise points by their labels, and a classifier on that map scores a perfect 1.0 on data that contains no information at all. Inside the pipeline, where each fold's UMAP sees only its own training labels, the score falls to 0.473, a coin flip. The fix is the same as for every learned transformation: make UMAP a <code>Pipeline</code> step.</p>
  <p>The second mistake is reading distances between clusters and cluster sizes literally. A true 10× gap was drawn as 3.9×, and, as in t-SNE, the per-point σ equalises densities, so a diverse group and a tight group can look the same size (the optional <code>densmap=True</code> mode tries to keep density information, at extra cost). The third is repeating "UMAP preserves global structure, t-SNE doesn't" without qualification; on the digits t-SNE with PCA initialisation arranged the groups slightly better. The fourth is a wrong <code>n_neighbors</code>: too small fragments real groups and can turn noise into clumps, and larger than the smallest group you care about links that group into its neighbours, as the six-point example showed. The fifth is the wrong distance for text or sentence embeddings, which usually need <code>metric="cosine"</code> (or normalised vectors). And finally, UMAP is stochastic: fix <code>random_state</code> for anything you report, accept that this makes it single-threaded, and check that structure you care about survives a few seeds and settings.</p>

  <h2 id="um-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>UMAP</b>: builds a weighted k-nearest-neighbour graph of the data, then finds a low-dimensional layout whose own graph matches it by minimising cross-entropy; non-linear, stochastic, has a transform.</li>
    <li><b>ρᵢ</b>: distance to point i's nearest neighbour; guarantees one link of weight 1 (local connectivity).</li>
    <li><b>σᵢ</b>: per-point distance scale chosen so the weights add up to log₂(n_neighbors).</li>
    <li><b>Fuzzy union</b>: w = a + b − ab, the chance a link exists from either side.</li>
    <li><b>min_dist</b>: how close points may sit on the map; sets the curve's a and b.</li>
    <li><b>Negative sampling</b>: push a few random points away for each pulled link, instead of repelling all pairs.</li>
    <li><b>Spectral initialisation</b>: start from the eigenvectors of the graph's Laplacian.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Hand example</th></tr>
    <tr><td>wᵢⱼ = exp(−max(0, dᵢⱼ − ρᵢ)/σᵢ), Σⱼ wᵢⱼ = log₂ k</td><td>point 1.0, k = 4: ρ = 1, σ = 5.552, weights 1, 0.763, 0.237</td></tr>
    <tr><td>w = wᵢⱼ + wⱼᵢ − wᵢⱼwⱼᵢ</td><td>1.0–3.5: 0.942; 3.5–10.0: 0.462</td></tr>
    <tr><td>v = 1/(1 + a·d^{2b})</td><td>min_dist 0.1 → a = 1.577, b = 0.895</td></tr>
    <tr><td>CE = w log(w/v) + (1 − w) log((1 − w)/(1 − v))</td><td>neighbours far 2.303; strangers close 2.270</td></tr>
  </table>
  <h3>Parameters</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Effect</th></tr>
    <tr><td><code>n_neighbors</code></td><td>15</td><td>local (5) ↔ global (50–200); the most important knob</td></tr>
    <tr><td><code>min_dist</code></td><td>0.1</td><td>0 = tight clumps (clustering); 0.5–0.99 = even spread (viewing)</td></tr>
    <tr><td><code>n_components</code></td><td>2</td><td>2–3 for pictures; 5–50 as model or clustering input</td></tr>
    <tr><td><code>metric</code></td><td>"euclidean"</td><td>"cosine" for text and embeddings</td></tr>
    <tr><td><code>init</code></td><td>"spectral"</td><td>also "pca", "random" or an array</td></tr>
    <tr><td><code>negative_sample_rate</code></td><td>5</td><td>negatives per pulled link (repulsion strength)</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>repeatable, but single-threaded</td></tr>
    <tr><td><code>densmap</code></td><td>False</td><td>also preserve local density (slower)</td></tr>
  </table>
  <h3>Numbers from the digits</h3>
  <ul>
    <li>2-D 5-NN / trust(10): PCA 0.514 / 0.816, t-SNE 0.954 / 0.986, UMAP 0.959 / 0.975.</li>
    <li>Gap test (true 10×): t-SNE 1.7×, UMAP 3.9×. Group arrangement: PCA 0.789, t-SNE 0.681, UMAP 0.644.</li>
    <li>n_neighbors 5 → 100: centre correlation 0.618 → 0.700. min_dist 0 → 0.99: island spread 0.186 → 0.357.</li>
    <li>transform on 540 unseen digits: 5-NN 0.961 (raw pixels 0.970).</li>
    <li>HDBSCAN ARI: raw 0.060, PCA-10 0.088, UMAP-10 0.798. Logistic in CV: PCA-10 0.884, UMAP-10 0.967.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import umap                                   # pip install umap-learn

reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, metric="euclidean", random_state=0)
Z = reducer.fit_transform(X_train)            # also: reducer.embedding_
Z_new = reducer.transform(X_new)              # place unseen rows on the same map
umap.UMAP().fit(X_train, y_train)             # supervised UMAP (training labels only!)
pipe = make_pipeline(StandardScaler(), umap.UMAP(n_components=10), LogisticRegression())
labels = HDBSCAN(min_cluster_size=30).fit_predict(umap.UMAP(n_components=10, min_dist=0.0).fit_transform(X))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Fit UMAP inside the pipeline; supervised UMAP on all data leaks completely.</li>
    <li>Gaps and sizes are only roughly meaningful.</li>
    <li>min_dist changes packing, not who is a neighbour.</li>
    <li>Use cosine for text embeddings.</li>
    <li>random_state → repeatable but single-threaded.</li>
    <li>The package is umap-learn, not umap.</li>
  </ul>

  <h2 id="um-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain UMAP in plain words.</summary><div class="qa-body">UMAP builds a weighted nearest-neighbour graph of the data, in which each point is fully linked to its nearest neighbour and more weakly to its other neighbours, with weights that adapt to local density. Then it places points in low dimensions so that a similar graph computed from the positions matches the first, pulling linked points together and pushing random unlinked points apart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problems of t-SNE does UMAP address?</summary><div class="qa-body">Speed: approximate neighbour search and negative sampling replace all-pairs repulsion, so it scales to millions of points. New points: it has a transform, so new rows can be placed on an existing map. Global layout: an explicit repulsion term and a spectral start often keep groups arranged more sensibly. It also supports any number of output dimensions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do ρ and σ do in the graph construction?</summary><div class="qa-body">ρ is the distance to a point's nearest neighbour; subtracting it guarantees each point one link of weight 1, so no point is disconnected (local connectivity). σ is a per-point scale chosen so that the weights add up to log₂(n_neighbors), giving every point the same amount of neighbourhood regardless of density, like perplexity in t-SNE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the weights for a point with neighbour distances 1, 2.5 and 9 when n_neighbors = 4.</summary><div class="qa-body">ρ = 1, so the extra distances are 0, 1.5 and 8. Find σ such that 1 + e^(−1.5/σ) + e^(−8/σ) = log₂ 4 = 2; this gives σ ≈ 5.552 and weights 1, 0.763 and 0.237.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the fuzzy union and why is it needed?</summary><div class="qa-body">Each point has its own ρ and σ, so the weight from i to j differs from the weight from j to i. UMAP combines them as a + b − ab, the probability that the link exists from either side (0.763 and 0.755 give 0.942). This produces one symmetric weight per link.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do n_neighbors and min_dist control?</summary><div class="qa-body">n_neighbors sets how many neighbours define the graph: small values keep fine local detail but can fragment groups, large values capture more global structure (digits centre correlation 0.618 at 5, 0.700 at 100). min_dist sets how tightly points may pack on the map: 0 gives dense clumps that suit clustering, large values give an even spread that suits viewing. min_dist does not change who is a neighbour.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does UMAP's loss differ from t-SNE's?</summary><div class="qa-body">t-SNE minimises KL divergence between normalised probability distributions, so placing non-neighbours close is almost free. UMAP minimises a per-link binary cross-entropy with an explicit repulsion term, (1 − w)·log((1 − w)/(1 − v)), so drawing strangers close is expensive (2.27 in the example). UMAP's weights are not normalised over all pairs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is UMAP faster than t-SNE?</summary><div class="qa-body">It finds neighbours approximately with NN-descent, keeps a sparse graph, optimises by sampling links in proportion to their weight, and handles repulsion with a few random negative samples per link instead of an all-pairs sum. Each epoch costs roughly O(n), and the code is compiled with numba and multi-threaded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does UMAP preserve global structure better than t-SNE?</summary><div class="qa-body">Often somewhat: in a controlled test it drew a true 10× gap as 3.9× against t-SNE's 1.7×. But on the digits t-SNE with PCA initialisation arranged the groups slightly better (0.681 against 0.644), and studies show initialisation explains much of the difference. Neither preserves distances between groups faithfully.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does UMAP transform a new point?</summary><div class="qa-body">It finds the new point's nearest neighbours among the training points, computes fuzzy weights to them, starts the point at the weighted average of their positions, and optimises only the new point for a few epochs. The training map does not move. Placing 540 unseen digits this way gave a 5-NN test accuracy of 0.961.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why run UMAP before HDBSCAN?</summary><div class="qa-body">Density estimation fails in high dimensions because points are spread too thinly. UMAP with min_dist 0 and about 10 output dimensions packs similar points into dense regions. On the digits HDBSCAN went from ARI 0.060 with 74% noise on raw pixels to 0.798 with 10 clusters and 1% noise on UMAP-10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can UMAP output be used as model features?</summary><div class="qa-body">Yes, unlike t-SNE, provided UMAP is a step in the pipeline so each fold fits it on training rows and transforms the held-out rows (digits: UMAP-10 then logistic regression 0.967, against 0.884 with PCA-10). Fitting it on all data first leaks; with supervised UMAP the leak turned pure noise into a perfect score.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is supervised UMAP?</summary><div class="qa-body">Calling fit(X, y) lets UMAP use the labels when building the graph, so points with the same label are pulled together and classes separate more cleanly. It is useful for visualising class structure or building features, but it must only see training labels, otherwise the evaluation is meaningless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you read cluster sizes and distances from a UMAP plot?</summary><div class="qa-body">Only roughly. The per-point σ equalises local density, so a diverse group and a tight group can look the same size, and the gap between groups is compressed (3.9× for a true 10×). Trust neighbourhoods and the existence of groups; check sizes and distances in the original space. densMAP partly preserves density.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which distance should UMAP use for sentence embeddings?</summary><div class="qa-body">Usually cosine distance (metric="cosine"), because embedding models encode meaning in the direction of a vector rather than its length. Alternatively normalise the vectors to unit length and use Euclidean distance, which is then equivalent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A team has a million 768-dimensional sentence embeddings and wants topics and a picture. What pipeline would you suggest?</summary><div class="qa-body">Normalise (cosine), optionally reduce to about 50 with PCA, run UMAP to 5–10 dimensions with min_dist 0 and n_neighbors around 15–50 using the cosine metric, cluster with HDBSCAN, and make a separate 2-D UMAP of a sample for the picture. Then read examples from each cluster to name the topics and check that clusters persist across settings and seeds. (Embeddings: <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose PCA, t-SNE, UMAP or feature selection?</summary><div class="qa-body">PCA for fast, linear compression and model inputs with many correlated columns. t-SNE for high-quality local pictures of small to medium datasets. UMAP for pictures at scale, non-linear reduction that must apply to new rows, and clustering embeddings. Feature selection when you need explanations in terms of the original columns or want to stop collecting some inputs.</div></details>
</main>
`
});
