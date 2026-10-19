// notes/ml/ml_umap.js — UMAP
Object.assign(TOPIC_CONTENT, {
  "ml_umap": `<main>
  <h1>UMAP</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>UMAP</span></div>
  <p class="lead">UMAP (Uniform Manifold Approximation and Projection, McInnes, Healy &amp; Melville 2018) draws high-dimensional data in 2D like t-SNE, but it is faster, keeps more of the large-scale layout in controlled tests, and, crucially, can place new points on an existing map, so it is also used as a preprocessing step before clustering or classification. This note keeps the running example of the previous note, 1,797 handwritten digits with 64 pixels, and builds UMAP in its two phases: first a <strong>fuzzy neighbour graph</strong> (computed completely by hand on six points and checked against the umap library's own graph), then a <strong>layout</strong> that makes a 2D graph match it (the min_dist curve and the cross-entropy loss by hand). Then we measure what n_neighbors and min_dist do, compare global structure with t-SNE honestly, embed unseen digits, cluster with UMAP + HDBSCAN, and finish with the full PCA vs t-SNE vs UMAP comparison.</p>

  <h2 id="um-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <p><strong>Came from.</strong> <a class="xref" data-note="ml_tsne">t-SNE</a> gave the digits a beautiful neighbour-preserving map (5-NN 0.954), but left three problems: it is slow on large data (all-pairs repulsion, approximated by Barnes–Hut), it barely cares where non-neighbours go (a true 10× gap was shown as 1.7×), and it has no <code>transform</code> (adding one digit moved old points up to 24.3 units).</p>
  <p><strong>What this note adds.</strong> The same neighbourhood idea phrased as a graph: connect each point to its k nearest neighbours with fuzzy weights, then lay the graph out with a loss that both pulls linked points together and explicitly pushes unlinked points apart. You will compute ρ, σ, edge weights and the fuzzy union by hand, derive the a, b curve from min_dist, and see the loss's attraction and repulsion terms.</p>
  <p><strong>Leads to.</strong> UMAP closes the Dimensionality Reduction group and opens the door back to <a class="xref" data-note="ml_clustering">Clustering</a>: the standard modern recipe for clustering embeddings is scale → (PCA) → UMAP to ~10 dimensions → <a class="xref" data-note="ml_dbscan">HDBSCAN</a>. It is also how embeddings from <a class="xref" data-note="vectordb">vector databases</a> are usually visualised.</p>
  <figure class="viz"><svg viewBox="0 0 640 120" width="640">
<defs><marker id="um-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="12">
<rect x="10" y="30" width="135" height="56" rx="8" class="fs" stroke="currentColor"/><text x="77" y="52" text-anchor="middle" font-weight="700">Selection</text><text x="77" y="70" text-anchor="middle" class="tm" font-size="10.5">keep columns</text>
<rect x="165" y="30" width="135" height="56" rx="8" class="ft st"/><text x="232" y="52" text-anchor="middle" font-weight="700">PCA</text><text x="232" y="70" text-anchor="middle" class="tm" font-size="10.5">flat projection</text>
<rect x="320" y="30" width="135" height="56" rx="8" class="fg sg"/><text x="387" y="52" text-anchor="middle" font-weight="700">t-SNE</text><text x="387" y="70" text-anchor="middle" class="tm" font-size="10.5">neighbours, no transform</text>
<rect x="475" y="24" width="155" height="68" rx="8" class="fb sb" stroke-width="3"/><text x="552" y="48" text-anchor="middle" font-weight="700">UMAP</text><text x="552" y="66" text-anchor="middle" class="tb" font-size="10.5">graph + layout, transform</text><text x="552" y="82" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<line x1="145" y1="58" x2="163" y2="58" stroke="currentColor" marker-end="url(#um-a)"/><line x1="300" y1="58" x2="318" y2="58" stroke="currentColor" marker-end="url(#um-a)"/><line x1="455" y1="58" x2="473" y2="58" stroke="currentColor" marker-end="url(#um-a)"/>
</g></svg><figcaption>UMAP is the last note of the Dimensionality Reduction group.</figcaption></figure>

  <h2 id="um-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <ol class="story">
    <li><b>Two-phase idea</b><span>Q: can we keep t-SNE's neighbour idea but make it faster, more global and reusable? → build a neighbour graph in high-D, then lay out a matching graph in low-D. But which edges go in the graph?</span></li>
    <li><b>k-nearest-neighbour graph</b><span>Q: who is linked to whom? → each point to its n_neighbors − 1 nearest (k = 4 on six points: 1.0 → 2.0, 3.5, 10.0). But a hard list says nothing about how strong each link is.</span></li>
    <li><b>Fuzzy weights (ρ, σ)</b><span>Q: how strong is each link? → w = exp(−(d − ρ)/σ), nearest gets 1, σ chosen so weights sum to log₂k (point 1.0: σ = 5.552, weights 1, 0.763, 0.237). But i→j and j→i disagree.</span></li>
    <li><b>Fuzzy union</b><span>Q: one weight per edge? → w = a + b − ab (1.0–3.5: 0.942; cross-group 3.5–10.0: 0.462). Now the graph is done; how do we draw it?</span></li>
    <li><b>Low-D similarity curve (min_dist)</b><span>Q: what similarity do two map points have? → v = 1/(1 + a·d^{2b}), a, b fitted from min_dist (0.1 → a 1.577, b 0.895). How do we compare v with w?</span></li>
    <li><b>Cross-entropy loss</b><span>Q: how badly does the layout misrepresent the graph? → attraction w log(w/v) + repulsion (1 − w) log((1 − w)/(1 − v)); strangers drawn close cost 2.27, unlike t-SNE's KL. How is it minimised fast?</span></li>
    <li><b>SGD with negative sampling &amp; spectral init</b><span>Q: how to optimise without all pairs? → sample edges to pull, random points to push; start from a spectral layout. Does it work on digits?</span></li>
    <li><b>UMAP on the digits</b><span>Q: as good as t-SNE locally? → 5-NN 0.959 (t-SNE 0.954), trust 0.975. What do the two main knobs do?</span></li>
    <li><b>n_neighbors</b><span>Q: local vs global? → 5 → 200: trust(10) 0.977 → 0.964, class-centre corr 0.618 → 0.736. And how tightly are points packed?</span></li>
    <li><b>min_dist</b><span>Q: clumpy or even? → 0 → 0.99: within-digit spread 0.186 → 0.357. Is UMAP really more global than t-SNE?</span></li>
    <li><b>Global structure, honestly</b><span>Q: does it keep big distances? → gap test 3.9× (t-SNE 1.7×, true 10×), but on digits class-centre order t-SNE 0.681 vs UMAP 0.644: much of the "global" advantage is initialisation. Is it at least faster?</span></li>
    <li><b>Speed</b><span>Q: does it scale? → approximate kNN (NN-descent) + edge sampling: roughly linear in n. Can it place new points?</span></li>
    <li><b>transform on new data</b><span>Q: embed tomorrow's digits? → fit on 1,257, transform 540 unseen: 5-NN test 0.961. Then can it feed other models?</span></li>
    <li><b>UMAP as preprocessing</b><span>Q: does clustering or classification improve? → HDBSCAN ARI 0.060 (raw) → 0.798 (UMAP-10); logistic 0.884 (PCA-10) → 0.967 (UMAP-10). Which tool for which job? → the final comparison.</span></li>
  </ol>

  <h2 id="um-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">UMAP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Phase 1: fuzzy graph</div>
        <ul>
          <li>kNN with n_neighbors (counts the point itself)</li>
          <li>ρᵢ = distance to nearest neighbour (local connectivity)</li>
          <li>wᵢⱼ = exp(−(dᵢⱼ − ρᵢ)/σᵢ); Σ w = log₂ k</li>
          <li>Point 1.0: ρ 1, σ 5.552 → 1, 0.763, 0.237</li>
          <li>Union: a + b − ab (0.942; cross-group 0.462)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Phase 2: layout</div>
        <ul>
          <li>v = 1/(1 + a·d^{2b}); min_dist 0.1 → a 1.577, b 0.895</li>
          <li>CE = w log(w/v) + (1−w) log((1−w)/(1−v))</li>
          <li>Neighbours far: 2.303 · strangers close: 2.270 (repulsion!)</li>
          <li>SGD on sampled edges + negative sampling</li>
          <li>Spectral initialisation → better global start</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Knobs</div>
        <ul>
          <li><b>n_neighbors</b> (15): 5 local … 200 global; trust(10) .977 → .964, centre corr .618 → .736</li>
          <li><b>min_dist</b> (0.1): 0 clumpy (good for clustering) … 0.99 even; spread .186 → .357</li>
          <li><b>n_components</b>: 2 for pictures, 5–50 for models</li>
          <li><b>metric</b>: cosine for text/embeddings</li>
          <li><code>random_state</code> → reproducible but single-threaded</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Digits results</div>
        <ul>
          <li>2D 5-NN: PCA .514 · t-SNE .954 · UMAP .959</li>
          <li>trust(10): .816 · .986 · .975</li>
          <li>Gap 10×: PCA 10 · t-SNE 1.7 · UMAP 3.9</li>
          <li>Class-centre corr: .789 · .681 · .644 (init matters)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond pictures</div>
        <ul>
          <li><code>transform</code>: 540 unseen digits, 5-NN 0.961</li>
          <li>UMAP-10 → HDBSCAN: ARI 0.798 (raw 0.060)</li>
          <li>UMAP-10 → logistic (in CV): 0.967 vs PCA-10 0.884</li>
          <li>Supervised UMAP: fit(X, y); inverse_transform (approx.)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cautions</div>
        <ul>
          <li>⚠ Still stochastic; distances and sizes only roughly meaningful</li>
          <li>⚠ Fit inside CV when used as a model step</li>
          <li>⚠ n_neighbors &gt; cluster size links clusters</li>
          <li>⚠ Separate package: <code>pip install umap-learn</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="um-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea: Graph, then Layout</span><span class="rm-sub">Fixing t-SNE's three problems</span></div></div>
      <div class="rm-item rm-done" data-target="um-knn"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Neighbour Graph</span><span class="rm-sub">kNN on six digits</span></div></div>
      <div class="rm-item rm-done" data-target="um-fuzzy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Fuzzy Weights &amp; Union</span><span class="rm-sub">ρ, σ, log₂k by hand</span></div></div>
      <div class="rm-item rm-done" data-target="um-curve"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Low-D Similarity &amp; min_dist</span><span class="rm-sub">The a, b curve</span></div></div>
      <div class="rm-item rm-done" data-target="um-loss"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Cross-Entropy &amp; Optimisation</span><span class="rm-sub">Attraction, repulsion, sampling</span></div></div>
      <div class="rm-item rm-done" data-target="um-digits"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">UMAP on the Digits</span><span class="rm-sub">umap-learn in practice</span></div></div>
      <div class="rm-item rm-done" data-target="um-nn"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">n_neighbors</span><span class="rm-sub">Local vs global</span></div></div>
      <div class="rm-item rm-done" data-target="um-md"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">min_dist</span><span class="rm-sub">Clumpy vs even</span></div></div>
      <div class="rm-item rm-done" data-target="um-global"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Global Structure vs t-SNE</span><span class="rm-sub">An honest comparison</span></div></div>
      <div class="rm-item rm-done" data-target="um-speed"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Speed &amp; Scaling</span><span class="rm-sub">NN-descent, edge sampling</span></div></div>
      <div class="rm-item rm-done" data-target="um-transform"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Transforming New Data</span><span class="rm-sub">Unseen digits on the map</span></div></div>
      <div class="rm-item rm-done" data-target="um-prep"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">UMAP as Preprocessing</span><span class="rm-sub">Clustering and classification</span></div></div>
      <div class="rm-item rm-done" data-target="um-params"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Parameters</span><span class="rm-sub">Every knob in one table</span></div></div>
      <div class="rm-item rm-done" data-target="um-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">PCA vs t-SNE vs UMAP</span></div></div>
      <div class="rm-item rm-done" data-target="um-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="um-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="um-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="um-idea"><span class="num">01</span>The Idea: Graph, then Layout</h2>
  <p><strong>The question we can't answer yet.</strong> t-SNE showed that keeping neighbours gives great pictures. Can we keep that idea while making the method faster, more respectful of non-neighbours, and able to place new points?</p>
  <h3>The running example</h3>
  <p>The same 1,797 handwritten digits (8 × 8 = 64 pixels), standardised, as in the t-SNE note. Hand calculations use six digits summarised by one coordinate each.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
X, y = load_digits(return_X_y=True)        # 1,797 handwritten digits, 8x8 = 64 pixel columns
Xs = StandardScaler().fit_transform(X)</div>
  <h3>Plain words</h3>
  <p>UMAP works in two phases.</p>
  <ol>
    <li><strong>Build a graph in high-D.</strong> Connect every point to its nearest neighbours. Give each connection a strength between 0 and 1 ("how sure are we these two belong together?"), adapting to local density.</li>
    <li><strong>Lay the graph out in low-D.</strong> Place points in 2D so that strongly connected points are close and unconnected points are apart, by minimising a cross-entropy between the high-D graph and a similar graph built from the 2D positions.</li>
  </ol>
  <div class="flow"><span>kNN in high-D (n_neighbors)</span><span>Fuzzy edge weights (ρ, σ) + union</span><span>Spectral initial layout</span><span>SGD: pull edges, push random pairs (min_dist)</span></div>
  <p>The name comes from the theory behind phase 1: assume the data is spread <em>uniformly</em> on a curved surface (a <em>manifold</em>); then in dense areas distances are "shorter" and in sparse ones "longer", so each point gets its own distance scale. The practical result is the per-point ρ and σ below.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Drawing a metro map from city streets. First list which stations are directly connected and how busy each link is (the graph). Then draw the map so connected stations sit close and unconnected ones do not overlap. Later you can add a new station by placing it near the stations it connects to, without redrawing the whole map.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>UMAP</strong> builds a weighted k-nearest-neighbour graph (a "fuzzy simplicial set") of the data and finds a low-dimensional embedding whose own fuzzy graph minimises the fuzzy-set cross-entropy to it. It is non-linear, stochastic, and learns a mapping usable on new points.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>UMAP is not "a faster t-SNE with the same output". Different similarity curves and loss give different pictures: often tighter clusters with more white space, and different inter-cluster arrangements.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the neighbour graph.</b> Phase 1 starts with "connect each point to its nearest neighbours". How many, and who exactly?</div>

  <h2 id="um-knn"><span class="num">02</span>The Neighbour Graph</h2>
  <p><strong>The question we can't answer yet.</strong> t-SNE gave every pair a probability. UMAP only links each point to a few neighbours. Which ones, for our six digits?</p>
  <p>Six digits, each summarised by one number (say, position along their first principal component): <strong>1, 2, 3.5</strong> (three "0"-like images) and <strong>10, 11, 12.5</strong> (three "1"-like images). With <code>n_neighbors = 4</code> (UMAP counts the point itself, so 3 real neighbours):</p>
  <table class="tbl"><caption>Nearest neighbours with n_neighbors = 4</caption>
    <tr><th>point</th><th>1st (dist)</th><th>2nd (dist)</th><th>3rd (dist)</th></tr>
    <tr><td>1.0</td><td>2.0 (1)</td><td>3.5 (2.5)</td><td>10.0 (9)</td></tr>
    <tr><td>2.0</td><td>1.0 (1)</td><td>3.5 (1.5)</td><td>10.0 (8)</td></tr>
    <tr><td>3.5</td><td>2.0 (1.5)</td><td>1.0 (2.5)</td><td>10.0 (6.5)</td></tr>
    <tr><td>10.0</td><td>11.0 (1)</td><td>12.5 (2.5)</td><td>3.5 (6.5)</td></tr>
    <tr><td>11.0</td><td>10.0 (1)</td><td>12.5 (1.5)</td><td>3.5 (7.5)</td></tr>
    <tr><td>12.5</td><td>11.0 (1.5)</td><td>10.0 (2.5)</td><td>3.5 (9)</td></tr>
  </table>
  <p>Each group has only 3 points, so the 3rd neighbour of every point is in the <em>other</em> group: with n_neighbors larger than a cluster, the graph necessarily links clusters. With n_neighbors = 3 there would be no cross edge and the groups would be disconnected pieces. This is the first intuition for n_neighbors: <strong>small = local pieces, large = links between pieces (global structure)</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>k-nearest-neighbour graph</strong> links each point to its k − 1 closest other points (UMAP's n_neighbors = k includes the point itself). For large data UMAP finds them approximately with NN-descent (the pynndescent package); for small data it computes them exactly.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A hard kNN list treats the 1st and the 3rd neighbour the same, even when the 3rd is six times farther (3.5's neighbours at 1.5 vs 6.5). We need weights.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: fuzzy weights.</b> How strong is each of these links, and how do we make "near" mean the same thing in dense and sparse regions?</div>

  <h2 id="um-fuzzy"><span class="num">03</span>Fuzzy Weights &amp; Union</h2>
  <p><strong>The question we can't answer yet.</strong> Point 1.0's neighbours are at 1, 2.5 and 9. How strong should each link be, and how do we combine 1.0's view of 3.5 with 3.5's view of 1.0?</p>
  <h3>Directed weights by hand</h3>
  <p>For point i with neighbour distances d:</p>
  <ul>
    <li><strong>ρᵢ</strong> = distance to the nearest neighbour. Subtracting it guarantees every point is fully connected (weight 1) to at least one neighbour: <em>local connectivity</em>, so even an isolated point is not left alone.</li>
    <li><strong>wᵢⱼ = exp(−(dᵢⱼ − ρᵢ) / σᵢ)</strong>: decays with the <em>extra</em> distance beyond the nearest.</li>
    <li><strong>σᵢ</strong> is chosen so the weights sum to <strong>log₂ k</strong>: the UMAP counterpart of t-SNE's perplexity, giving every point the same "amount" of neighbourhood.</li>
  </ul>
  <p>Point 1.0: ρ = 1, extra distances 0, 1.5, 8. We need 1 + e^(−1.5/σ) + e^(−8/σ) = log₂ 4 = 2. Try σ = 5.552: e^(−0.270) = 0.763 and e^(−1.441) = 0.237; 1 + 0.763 + 0.237 = 2. ✓ So the weights are <strong>1, 0.763, 0.237</strong>. In general σ is found by binary search, exactly like t-SNE's σ.</p>
  <h3>Fuzzy union</h3>
  <p>w(1.0 → 3.5) = 0.763 but w(3.5 → 1.0) = 0.755 (different ρ and σ). UMAP treats each weight as the probability that the edge exists "from that side" and combines them as the probability that it exists from <em>either</em> side: <strong>w = a + b − a·b</strong>.</p>
  <ul>
    <li>1.0–2.0: both sides give 1 → 1 + 1 − 1 = <strong>1</strong>.</li>
    <li>1.0–3.5: 0.763 + 0.755 − 0.763 × 0.755 = 1.518 − 0.576 = <strong>0.942</strong>.</li>
    <li>3.5–10.0 (the cross-group link): 0.245 + 0.288 − 0.071 = <strong>0.462</strong>.</li>
  </ul>
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
    for _ in range(64):                                         # binary search sigma: sum of weights = log2(k)
        s = (lo + hi) / 2
        tot = np.exp(-np.maximum(d - rho, 0) / s).sum()
        lo, hi = (lo, s) if tot &gt; np.log2(k) else (s, hi)
    w = np.exp(-np.maximum(d - rho, 0) / s)
    W[i, idx[i, 1:]] = w
    print(f"point {pts[i,0]:4.1f}: neighbours {pts[idx[i,1:],0].tolist()} rho={rho:.1f} sigma={s:.3f} weights={w.round(3).tolist()}")
G = W + W.T - W * W.T                                           # fuzzy union: P(edge in either direction)
print("symmetric edge 1.0-2.0:", G[0, 1].round(3), " 1.0-3.5:", G[0, 2].round(3), " 3.5-10.0:", G[2, 3].round(3))

import umap                                                     # pip install umap-learn
graph = umap.umap_.fuzzy_simplicial_set(pts, n_neighbors=k, random_state=0, metric="euclidean")[0].toarray()
print("umap's own graph agrees:", np.allclose(graph, G, atol=1e-3))</div>
  <div class="fx" data-lang="text">point  1.0: neighbours [2.0, 3.5, 10.0] rho=1.0 sigma=5.552 weights=[1.0, 0.763, 0.237]
point  2.0: neighbours [1.0, 3.5, 10.0] rho=1.0 sigma=3.480 weights=[1.0, 0.866, 0.134]
point  3.5: neighbours [2.0, 1.0, 10.0] rho=1.5 sigma=3.556 weights=[1.0, 0.755, 0.245]
point 10.0: neighbours [11.0, 12.5, 3.5] rho=1.0 sigma=4.417 weights=[1.0, 0.712, 0.288]
point 11.0: neighbours [10.0, 12.5, 3.5] rho=1.0 sigma=3.309 weights=[1.0, 0.86, 0.14]
point 12.5: neighbours [11.0, 10.0, 3.5] rho=1.5 sigma=4.596 weights=[1.0, 0.804, 0.196]
symmetric edge 1.0-2.0: 1.0  1.0-3.5: 0.942  3.5-10.0: 0.462
umap's own graph agrees: True</div>
  <p>Every σ, weight and union matches the hand work, and the last line confirms our matrix equals umap-learn's own <code>fuzzy_simplicial_set</code> graph. Within-group edges are strong (0.94–1), the cross-group edge is weaker (0.46). In the layout phase, strong edges become strong attractions.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Directed weight wᵢⱼ = exp(−max(0, dᵢⱼ − ρᵢ)/σᵢ) for the k − 1 nearest neighbours (0 otherwise), with Σⱼ wᵢⱼ = log₂ k. Symmetric weight (fuzzy union, probabilistic t-conorm) w = wᵢⱼ + wⱼᵢ − wᵢⱼwⱼᵢ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing with t-SNE: UMAP's weights are <em>not</em> normalised to sum to 1 over all pairs. Each edge weight is a membership strength between 0 and 1; that is why UMAP can use a loss with an explicit "no edge" (1 − w) term.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the low-D similarity curve.</b> The graph is built. To lay it out we need the similarity of two points <em>on the map</em>, and a knob for how close points may sit.</div>

  <h2 id="um-curve"><span class="num">04</span>Low-D Similarity &amp; min_dist</h2>
  <p><strong>The question we can't answer yet.</strong> Two map points at distance d: how strongly are they "connected" on the map? And how do we stop the layout from piling all neighbours on one spot?</p>
  <p>UMAP uses the curve <strong>v(d) = 1 / (1 + a·d^{2b})</strong>. With a = b = 1 it is exactly t-SNE's Student-t. UMAP fits a and b so that v looks like "1 up to distance min_dist, then decaying exponentially": min_dist is the distance below which points are considered fully overlapping, so it controls how tightly points may pack.</p>
  <div class="fx" data-lang="py">import numpy as np
from umap.umap_ import find_ab_params
for md in (0.0, 0.1, 0.5, 0.99):
    a, b = find_ab_params(spread=1.0, min_dist=md)
    v = lambda d: 1 / (1 + a * d ** (2 * b))
    print(f"min_dist={md:4}: a={a:.3f} b={b:.3f}  similarity at d=0.1:{v(0.1):.3f} d=0.5:{v(0.5):.3f} d=1:{v(1):.3f} d=3:{v(3):.3f}")
t = lambda d: 1 / (1 + d ** 2)
print(f"t-SNE kernel          :                  at d=0.1:{t(0.1):.3f} d=0.5:{t(0.5):.3f} d=1:{t(1):.3f} d=3:{t(3):.3f}")</div>
  <div class="fx" data-lang="text">min_dist= 0.0: a=1.933 b=0.790  similarity at d=0.1:0.952 d=0.5:0.608 d=1:0.341 d=3:0.083
min_dist= 0.1: a=1.577 b=0.895  similarity at d=0.1:0.975 d=0.5:0.687 d=1:0.388 d=3:0.082
min_dist= 0.5: a=0.583 b=1.334  similarity at d=0.1:0.999 d=0.5:0.916 d=1:0.632 d=3:0.084
min_dist=0.99: a=0.119 b=1.916  similarity at d=0.1:1.000 d=0.5:0.992 d=1:0.893 d=3:0.111
t-SNE kernel          :                  at d=0.1:0.990 d=0.5:0.800 d=1:0.500 d=3:0.100</div>
  <p>Default min_dist 0.1 gives a = 1.577, b = 0.895: similarity 0.975 at d = 0.1, 0.388 at d = 1. With min_dist 0.99 the curve stays near 1 out to d ≈ 0.5 (0.992) and 0.893 at d = 1: neighbours are already "close enough" at a distance, so the layout spreads them out. With min_dist 0 the curve drops fastest near 0 (0.608 at 0.5), so neighbours must be packed very tightly to look connected: dense clumps. Far away (d = 3) all curves agree (~0.08–0.11), like t-SNE's heavy tail.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Low-dimensional membership vᵢⱼ = (1 + a‖yᵢ − yⱼ‖^{2b})⁻¹, with (a, b) fitted by least squares to the target curve 1 for d ≤ min_dist and exp(−(d − min_dist)/spread) beyond (spread = 1 by default).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>min_dist does not change <em>which</em> points are neighbours (that is the graph, phase 1); it only changes how tightly they are drawn. Do not tune min_dist to "find more clusters".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the loss.</b> We have w (graph) and v (map). We need a cost comparing them and a fast way to minimise it.</div>

  <h2 id="um-loss"><span class="num">05</span>Cross-Entropy &amp; Optimisation</h2>
  <p><strong>The question we can't answer yet.</strong> How do we measure how badly the map represents the graph, and why does UMAP's measure keep more of the big picture than t-SNE's KL?</p>
  <h3>The loss by hand</h3>
  <p>For each pair, UMAP adds the cross-entropy between two "is there an edge?" probabilities, w (graph) and v (map):</p>
  <p><strong>CE = w·log(w/v) + (1 − w)·log((1 − w)/(1 − v))</strong></p>
  <p>The first part is <strong>attraction</strong> (like t-SNE's KL term): punished when w is high but v low. The second is <strong>repulsion</strong>: punished when w is low but v high. t-SNE's KL has no second part per pair.</p>
  <div class="fx" data-lang="py">import numpy as np
def ce(w, v):                     # UMAP's per-pair cross-entropy: attraction + repulsion
    att = w * np.log(w / v) if w &gt; 0 else 0.0
    rep = (1 - w) * np.log((1 - w) / (1 - v)) if w &lt; 1 else 0.0
    return att, rep
def kl(p, q):                     # t-SNE's per-pair term
    return p * np.log(p / q) if p &gt; 0 else 0.0
cases = [("neighbours drawn far apart", 1.0, 0.1), ("neighbours drawn close", 1.0, 0.9),
         ("strangers drawn close", 0.01, 0.9), ("strangers drawn far", 0.01, 0.05)]
for name, w, v in cases:
    a, r = ce(w, v)
    print(f"{name:27s} w={w:&lt;4} v={v:&lt;4} attraction={a:6.3f} repulsion={r:6.3f} total={a + r:6.3f}")</div>
  <div class="fx" data-lang="text">neighbours drawn far apart  w=1.0  v=0.1  attraction= 2.303 repulsion= 0.000 total= 2.303
neighbours drawn close      w=1.0  v=0.9  attraction= 0.105 repulsion= 0.000 total= 0.105
strangers drawn close       w=0.01 v=0.9  attraction=-0.045 repulsion= 2.270 total= 2.225
strangers drawn far         w=0.01 v=0.05 attraction=-0.016 repulsion= 0.041 total= 0.025</div>
  <ul>
    <li>Neighbours (w = 1) drawn far (v = 0.1): 1 × ln(10) = <strong>2.303</strong>. Drawn close (v = 0.9): ln(1/0.9) = 0.105.</li>
    <li>Strangers (w = 0.01) drawn close (v = 0.9): repulsion 0.99 × ln(0.99/0.1) = <strong>2.270</strong>. In t-SNE the analogous mistake was almost free (−0.115).</li>
    <li>Strangers drawn far (v = 0.05): 0.025, cheap, as it should be.</li>
  </ul>
  <p>Because UMAP actively pays for drawing unrelated points close, it tends to keep separate groups apart in a more consistent way.</p>
  <h3>Optimisation</h3>
  <ul>
    <li><strong>Spectral initialisation</strong>: start from the eigenvectors of the graph Laplacian (a "spectral embedding" of the kNN graph). This already places connected components and big groups sensibly: a large part of UMAP's global structure comes from here.</li>
    <li><strong>Stochastic gradient descent over edges</strong>: each epoch, sample edges in proportion to their weight w and pull their endpoints together (attraction gradient).</li>
    <li><strong>Negative sampling</strong>: for each pulled edge, pick a few random points (<code>negative_sample_rate</code> = 5) and push them away (repulsion gradient), treating them as w ≈ 0. This replaces t-SNE's all-pairs repulsion: no n² sum, no tree approximation.</li>
    <li><code>n_epochs</code>: 500 for small data, 200 for large, with a linearly decaying learning rate.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>UMAP minimises Σ over pairs of [wᵢⱼ log(wᵢⱼ/vᵢⱼ) + (1 − wᵢⱼ) log((1 − wᵢⱼ)/(1 − vᵢⱼ))] by SGD with edge sampling and negative sampling, from a spectral initial layout.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Believing the repulsion makes UMAP distances metric-faithful. Repulsion uses <em>random</em> negatives with w ≈ 0, so it says "keep strangers apart", not "keep them at the right distance". Between-cluster distances are still only roughly meaningful.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the digits.</b> We know how UMAP works. How good is its map of the 1,797 digits compared with t-SNE's?</div>

  <h2 id="um-digits"><span class="num">06</span>UMAP on the Digits</h2>
  <p><strong>The question we can't answer yet.</strong> t-SNE's digits map scored 5-NN 0.954 and trustworthiness 0.986. Does UMAP match it locally?</p>
  <div class="fx" data-lang="py">import umap
from sklearn.manifold import trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
reducer = umap.UMAP(n_components=2, n_neighbors=15, min_dist=0.1, random_state=0)
Z = reducer.fit_transform(Xs)
print("embedding shape:", Z.shape)
print("5-NN accuracy on the 2 UMAP coordinates:", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))
print("trustworthiness:", round(trustworthiness(Xs, Z, n_neighbors=10), 3))</div>
  <div class="fx" data-lang="text">embedding shape: (1797, 2)
5-NN accuracy on the 2 UMAP coordinates: 0.959
trustworthiness: 0.975</div>
  <p>A 5-NN classifier on the two UMAP coordinates reaches <strong>0.959</strong> (t-SNE 0.954, PCA 0.514), and trustworthiness is 0.975 (t-SNE 0.986): locally UMAP is about as good as t-SNE. The API follows sklearn: <code>umap.UMAP(...)</code>, <code>fit</code>, <code>fit_transform</code>, <code>transform</code>; the fitted map is in <code>embedding_</code>. The package is <code>umap-learn</code> (imported as <code>umap</code>); it uses numba, so the first call includes a compilation pause.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Installing the wrong package: <code>pip install umap</code> is an unrelated library. The right one is <code>pip install umap-learn</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: n_neighbors.</b> We used the defaults. What does UMAP's most important knob do to the picture?</div>

  <h2 id="um-nn"><span class="num">07</span>n_neighbors: Local vs Global</h2>
  <p><strong>The question we can't answer yet.</strong> In section 02, n_neighbors decided whether our two groups were linked. On the digits, how does it trade local detail against global layout?</p>
  <p>We measure trust(10) (small neighbourhoods), trust(100) (larger neighbourhoods) and the rank correlation between the distances of the ten digit-class centres in 64-D and on the map (a global-layout score: 1 = the classes are arranged in the same order of distances).</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from scipy.stats import spearmanr
from sklearn.manifold import trustworthiness
from digits import Xs, y
def centre_corr(Z):                         # are digit-class centres arranged like in 64-D?
    c_hi = np.array([Xs[y == k].mean(0) for k in range(10)]); c_lo = np.array([Z[y == k].mean(0) for k in range(10)])
    iu = np.triu_indices(10, 1)
    d_hi = np.linalg.norm(c_hi[:, None] - c_hi[None], axis=-1)[iu]; d_lo = np.linalg.norm(c_lo[:, None] - c_lo[None], axis=-1)[iu]
    return spearmanr(d_hi, d_lo)[0]
for nn in (5, 15, 50, 200):
    Z = umap.UMAP(n_neighbors=nn, min_dist=0.1, random_state=0).fit_transform(Xs)
    print(f"n_neighbors={nn:3d}: trust(10)={trustworthiness(Xs, Z, n_neighbors=10):.3f} "
          f"trust(100)={trustworthiness(Xs, Z, n_neighbors=100):.3f} class-centre rank corr={centre_corr(Z):.3f}")</div>
  <div class="fx" data-lang="text">n_neighbors=  5: trust(10)=0.977 trust(100)=0.919 class-centre rank corr=0.618
n_neighbors= 15: trust(10)=0.975 trust(100)=0.927 class-centre rank corr=0.644
n_neighbors= 50: trust(10)=0.973 trust(100)=0.934 class-centre rank corr=0.647
n_neighbors=200: trust(10)=0.964 trust(100)=0.932 class-centre rank corr=0.736</div>
  <p>From 5 to 200 neighbours: trust(10) slips from 0.977 to 0.964 (less fine local detail), while the class-centre correlation rises from 0.618 to 0.736 (more faithful arrangement of the digit groups) and trust(100) improves up to 50. Small n_neighbors can split one class into several islands; large values merge small groups and show the big shape. Default 15 is a good starting point; 5–50 is the usual range.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>n_neighbors</strong> is the size of the local neighbourhood used to build the graph: the balance between local and global structure (analogous to t-SNE's perplexity).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Setting n_neighbors larger than the smallest group you care about links that group to others (our six points with k = 4); it may disappear into a neighbour.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: min_dist.</b> n_neighbors decides who is linked. The second knob decides how tightly linked points are drawn.</div>

  <h2 id="um-md"><span class="num">08</span>min_dist: Clumpy vs Even</h2>
  <p><strong>The question we can't answer yet.</strong> Section 04 showed min_dist reshaping the similarity curve. What does that do to the digits map?</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from sklearn.neighbors import NearestNeighbors
from digits import Xs, y
for md in (0.0, 0.1, 0.5, 0.99):
    Z = umap.UMAP(n_neighbors=15, min_dist=md, random_state=0).fit_transform(Xs)
    Z = Z / Z.std()                                              # same overall scale for every run
    d1 = NearestNeighbors(n_neighbors=2).fit(Z).kneighbors(Z)[0][:, 1].mean()
    spread = np.mean([np.linalg.norm(Z[y == k] - Z[y == k].mean(0), axis=1).mean() for k in range(10)])
    print(f"min_dist={md:4}: mean nearest-neighbour gap={d1:.4f}  mean within-digit spread={spread:.3f}")</div>
  <div class="fx" data-lang="text">min_dist= 0.0: mean nearest-neighbour gap=0.0059  mean within-digit spread=0.186
min_dist= 0.1: mean nearest-neighbour gap=0.0091  mean within-digit spread=0.202
min_dist= 0.5: mean nearest-neighbour gap=0.0227  mean within-digit spread=0.298
min_dist=0.99: mean nearest-neighbour gap=0.0323  mean within-digit spread=0.357</div>
  <p>After rescaling each map to the same overall size, min_dist 0 packs points tightly: the average gap to the nearest point is 0.0059 and each digit's island has spread 0.186. At 0.99 the gap is 0.0323 (5.5× larger) and spread 0.357: evenly spread, softer islands. Small min_dist (0–0.1) suits clustering on the embedding (dense, separable clumps); larger min_dist suits viewing, where you want to see the inside of each group without overplotting.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>min_dist</strong> (default 0.1) is the minimum distance apart points are drawn in the embedding; together with <code>spread</code> (default 1) it sets the a, b of the low-D curve.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>min_dist must be ≤ spread; and very small min_dist plus small n_neighbors can make noise look like tight clusters.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: global structure.</b> UMAP is often said to "preserve global structure better than t-SNE". Is that true on our data?</div>

  <h2 id="um-global"><span class="num">09</span>Global Structure vs t-SNE</h2>
  <p><strong>The question we can't answer yet.</strong> UMAP's loss repels strangers explicitly. Does that make distances between clusters trustworthy, and is UMAP always more global than t-SNE?</p>
  <h3>Test 1: a known gap</h3>
  <p>Three groups in 10-D where C is 10× farther from A than B is (the test from the t-SNE note):</p>
  <div class="fx" data-lang="py">import numpy as np, umap
from sklearn.manifold import TSNE
rng = np.random.default_rng(0)
cent = np.zeros((3, 10)); cent[1, 0] = 5; cent[2, 0] = 50            # A-B close, C ten times farther
X3 = np.vstack([rng.normal(c, 1.0, (200, 10)) for c in cent]); y3 = np.repeat([0, 1, 2], 200)
def ratio(Z):
    c = np.array([Z[y3 == i].mean(0) for i in range(3)])
    return np.linalg.norm(c[0] - c[2]) / np.linalg.norm(c[0] - c[1])
print(f"true ratio {ratio(X3):.1f} | t-SNE {ratio(TSNE(2, random_state=0).fit_transform(X3)):.1f} | "
      f"UMAP {ratio(umap.UMAP(random_state=0).fit_transform(X3)):.1f}")</div>
  <div class="fx" data-lang="text">true ratio 10.0 | t-SNE 1.7 | UMAP 3.9</div>
  <p>UMAP shows the far group 3.9× farther: still compressed (truth 10×), but much closer to the truth than t-SNE's 1.7×.</p>
  <h3>Test 2: the arrangement of the ten digits</h3>
  <div class="fx" data-lang="py">import numpy as np, umap
from scipy.stats import spearmanr
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE, trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
def centre_corr(Z):
    c_hi = np.array([Xs[y == k].mean(0) for k in range(10)]); c_lo = np.array([Z[y == k].mean(0) for k in range(10)])
    iu = np.triu_indices(10, 1)
    return spearmanr(np.linalg.norm(c_hi[:, None] - c_hi[None], axis=-1)[iu],
                     np.linalg.norm(c_lo[:, None] - c_lo[None], axis=-1)[iu])[0]
maps = {"PCA": PCA(2).fit_transform(Xs),
        "t-SNE": TSNE(2, random_state=0).fit_transform(Xs),
        "UMAP": umap.UMAP(random_state=0).fit_transform(Xs)}
print("method | 5-NN acc | trust(10) | trust(100) | class-centre rank corr")
for name, Z in maps.items():
    print(f"{name:6s} | {cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean():8.3f} | "
          f"{trustworthiness(Xs, Z, n_neighbors=10):9.3f} | {trustworthiness(Xs, Z, n_neighbors=100):10.3f} | {centre_corr(Z):.3f}")</div>
  <div class="fx" data-lang="text">method | 5-NN acc | trust(10) | trust(100) | class-centre rank corr
PCA    |    0.514 |     0.816 |      0.823 | 0.789
t-SNE  |    0.954 |     0.986 |      0.934 | 0.681
UMAP   |    0.959 |     0.975 |      0.927 | 0.644</div>
  <p>On the digits the picture is more nuanced. Locally, t-SNE and UMAP tie (5-NN 0.954 vs 0.959; trust(10) 0.986 vs 0.975). For the arrangement of class centres, PCA, a linear map, is best (0.789); t-SNE with sklearn's default PCA initialisation (0.681) is slightly <em>ahead</em> of UMAP with default settings (0.644). Research (Kobak &amp; Linderman, 2021) found that much of UMAP's reputation for better global structure came from comparing UMAP's spectral initialisation with t-SNE's old random initialisation; with an informative initialisation both keep similar global layouts. And UMAP's global score rose to 0.736 with n_neighbors = 200 (section 07).</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Neither method promises faithful global distances. UMAP's explicit repulsion and spectral start often give a more sensible big-picture layout (3.9× vs 1.7× above), but initialisation and n_neighbors matter as much as the algorithm. Check global claims in the original space or with PCA.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Repeating "UMAP preserves global structure, t-SNE doesn't" in an interview without qualification. Better: "UMAP tends to keep more global structure thanks to its loss and spectral initialisation; t-SNE with PCA initialisation is competitive; neither preserves distances faithfully."</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: speed.</b> The practical reason most teams pick UMAP is speed on large data. Where does that speed come from?</div>

  <h2 id="um-speed"><span class="num">10</span>Speed &amp; Scaling</h2>
  <p><strong>The question we can't answer yet.</strong> t-SNE needs every pair of points (exactly or via Barnes–Hut trees) each iteration. What does UMAP do differently that makes millions of points feasible?</p>
  <table class="tbl">
    <tr><th>Step</th><th>t-SNE (Barnes–Hut)</th><th>UMAP</th></tr>
    <tr><td>Neighbours</td><td>Exact/tree kNN for ~3×perplexity neighbours</td><td>Approximate kNN by NN-descent (empirically ~O(n^1.14))</td></tr>
    <tr><td>Attraction</td><td>Over kNN pairs</td><td>Sampled edges, in proportion to weight</td></tr>
    <tr><td>Repulsion</td><td>All pairs, approximated by a quadtree, O(n log n)</td><td>A few random negative samples per edge, O(n)</td></tr>
    <tr><td>Output dimension</td><td>2–3 (Barnes–Hut)</td><td>Any (2 for pictures, 5–100 for models)</td></tr>
    <tr><td>Parallelism</td><td>Limited</td><td>Multi-threaded (numba) unless <code>random_state</code> is set</td></tr>
  </table>
  <p>In practice UMAP embeds hundreds of thousands to millions of points on a laptop in minutes, where sklearn's t-SNE takes much longer; the gap widens with n. For very large data, also reduce to ~50 PCA components first, and consider the GPU implementation in RAPIDS cuML.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Setting <code>random_state</code> for reproducibility switches UMAP to single-threaded mode, slower on big data. Fine for reports; drop it when speed matters and you accept small run-to-run variation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: new data.</b> Speed solves one t-SNE problem. The other was placing new points without refitting.</div>

  <h2 id="um-transform"><span class="num">11</span>Transforming New Data</h2>
  <p><strong>The question we can't answer yet.</strong> With t-SNE, one new digit meant refitting and moving all old points. Can UMAP place unseen digits on an existing map?</p>
  <p>Yes: for a new point, UMAP finds its nearest neighbours <em>among the training points</em>, computes fuzzy weights to them exactly as in section 03, initialises the new point at the weighted average of their positions, and runs a few optimisation epochs that move only the new points. The training map stays fixed.</p>
  <div class="fx" data-lang="py">import umap
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from digits import Xs, y
Xtr, Xte, ytr, yte = train_test_split(Xs, y, test_size=0.3, stratify=y, random_state=0)
reducer = umap.UMAP(random_state=0).fit(Xtr)              # learn the map on training digits only
Ztr = reducer.embedding_                                  # = coordinates of the training digits
Zte = reducer.transform(Xte)                              # place 540 NEW digits on the same map
knn = KNeighborsClassifier(5).fit(Ztr, ytr)
print("test digits placed:", Zte.shape, " 5-NN test accuracy on the map:", round(knn.score(Zte, yte), 3))
print("5-NN test accuracy on raw 64 pixels:", round(KNeighborsClassifier(5).fit(Xtr, ytr).score(Xte, yte), 3))</div>
  <div class="fx" data-lang="text">test digits placed: (540, 2)  5-NN test accuracy on the map: 0.961
5-NN test accuracy on raw 64 pixels: 0.97</div>
  <p>Fitted on 1,257 training digits, UMAP placed the 540 test digits it had never seen. A 5-NN classifier trained on the training map and evaluated on the transformed test digits scores <strong>0.961</strong>, close to 0.970 for 5-NN on all 64 raw pixels: two numbers per digit keep almost all the class information, and the evaluation is honest because the test digits did not shape the map.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>reducer.transform(X_new)</code> embeds new rows into a fitted UMAP space without changing <code>embedding_</code>. <code>inverse_transform</code> (approximate) maps 2D points back to the original space, useful for "what would a digit here look like?".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Transforming data that differs strongly from the training data (a new hospital, a new camera). New points can only be placed relative to training neighbours; genuinely new kinds of data land somewhere misleading. Refit when the population changes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: preprocessing.</b> With a reusable transform and any output dimension, UMAP can feed other algorithms. Does that help?</div>

  <h2 id="um-prep"><span class="num">12</span>UMAP as Preprocessing</h2>
  <p><strong>The question we can't answer yet.</strong> Clustering algorithms such as HDBSCAN struggle in 64-D (the curse of dimensionality: density is hard to estimate). Does reducing with UMAP first help them, and can UMAP be a step in a classifier pipeline?</p>
  <h3>Clustering the digits without labels</h3>
  <p>We cluster three versions of the digits and compare with the true digits using the adjusted Rand index (ARI: 1 = perfect agreement, 0 = chance; see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>). For clustering we use UMAP with 10 output dimensions, min_dist = 0 (tight clumps) and n_neighbors = 30.</p>
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
  <p>On raw pixels, <a class="xref" data-note="ml_kmeans">k-means</a> reaches ARI 0.468 and <a class="xref" data-note="ml_dbscan">HDBSCAN</a> only 0.060, labelling 74% of digits as noise: in 64-D, density is too thin. PCA-10 barely helps (0.485 / 0.088). After UMAP-10, k-means jumps to <strong>0.875</strong> and HDBSCAN finds exactly 10 clusters with 1% noise, ARI <strong>0.798</strong>. UMAP concentrates each digit's images into a dense region that density-based clustering can find.</p>
  <h3>Inside a classifier pipeline</h3>
  <div class="fx" data-lang="py">import umap
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.decomposition import PCA
from sklearn.model_selection import cross_val_score, StratifiedKFold
from digits import X, y
from sklearn.preprocessing import StandardScaler
cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, reducer in [("PCA 10", PCA(10)), ("UMAP 10", umap.UMAP(n_components=10, random_state=0))]:
    pipe = make_pipeline(StandardScaler(), reducer, LogisticRegression(max_iter=5000))
    print(f"{name:8s} -&gt; logistic, 5-fold CV accuracy: {cross_val_score(pipe, X, y, cv=cv).mean():.3f}")</div>
  <div class="fx" data-lang="text">PCA 10   -&gt; logistic, 5-fold CV accuracy: 0.884
UMAP 10  -&gt; logistic, 5-fold CV accuracy: 0.967</div>
  <p>With the reducer inside the pipeline (refitted on each training fold, applied with <code>transform</code> to the held-out fold), a plain logistic regression on 10 UMAP dimensions reaches <strong>0.967</strong>, against 0.884 on 10 PCA components: the non-linear reduction makes the classes linearly separable. UMAP also supports <strong>supervised</strong> and semi-supervised fitting, <code>fit(X, y)</code>, which uses labels to shape the graph (only inside CV, never with test labels).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The common recipe for clustering embeddings: <strong>scale → (PCA to ~50) → UMAP (n_components 5–15, min_dist 0, n_neighbors ~30) → HDBSCAN</strong>, then visualise with a separate 2D UMAP.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Clusters found after UMAP can be artefacts of n_neighbors / min_dist. Check stability across settings and seeds, and inspect examples from each cluster. And never fit UMAP on all data, then cross-validate a classifier on its output: that leaks the test rows into the features.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the parameters in one place.</b> We met many knobs one at a time. Here they are together.</div>

  <h2 id="um-params"><span class="num">13</span>Parameters</h2>
  <p><strong>The question we can't answer yet.</strong> Which knobs matter, what are their defaults, and how should a beginner set them?</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Effect / advice</th></tr>
    <tr><td><code>n_neighbors</code></td><td>15</td><td>Local (5) ↔ global (50–200); most important knob</td></tr>
    <tr><td><code>min_dist</code></td><td>0.1</td><td>0 = tight clumps (clustering), 0.5–0.99 = even spread (viewing)</td></tr>
    <tr><td><code>n_components</code></td><td>2</td><td>2–3 for pictures; 5–50 as model/clustering input</td></tr>
    <tr><td><code>metric</code></td><td>"euclidean"</td><td>"cosine" for text/embeddings, "manhattan", "hamming", custom numba functions</td></tr>
    <tr><td><code>spread</code></td><td>1.0</td><td>Overall scale of the embedded clusters (with min_dist)</td></tr>
    <tr><td><code>n_epochs</code></td><td>None (200/500)</td><td>More = better converged, slower</td></tr>
    <tr><td><code>init</code></td><td>"spectral"</td><td>"spectral", "pca", "random", or an array</td></tr>
    <tr><td><code>negative_sample_rate</code></td><td>5</td><td>Negatives per positive edge (repulsion strength)</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>Reproducible but single-threaded</td></tr>
    <tr><td><code>target_metric</code>, <code>target_weight</code></td><td>"categorical", 0.5</td><td>For supervised UMAP: how much labels shape the graph</td></tr>
    <tr><td><code>densmap</code></td><td>False</td><td>Also preserve local density (fixes "all clusters same size", slower)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tuning knobs until the picture "looks right". Fix a goal first (separability, cluster stability, trustworthiness) and measure it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> How does UMAP relate to t-SNE and PCA ingredient by ingredient, and which should you use?</div>

  <h2 id="um-connect"><span class="num">14</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> We now have PCA, t-SNE and UMAP. How are UMAP's pieces built from each other, how do they map onto t-SNE's, and which method fits which job?</p>
  <figure class="viz"><svg viewBox="0 0 680 240" width="680">
<defs><marker id="um-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="11.5">
<text x="10" y="16" class="tb">PHASE 1: graph (high-D)</text>
<rect x="10" y="24" width="120" height="46" rx="7" class="fs" stroke="currentColor"/><text x="70" y="43" text-anchor="middle" font-weight="700">kNN</text><text x="70" y="59" text-anchor="middle" class="tm">n_neighbors</text>
<rect x="150" y="24" width="120" height="46" rx="7" class="fb sb"/><text x="210" y="43" text-anchor="middle" font-weight="700">ρᵢ, σᵢ</text><text x="210" y="59" text-anchor="middle" class="tm">Σw = log₂k</text>
<rect x="290" y="24" width="120" height="46" rx="7" class="fb sb"/><text x="350" y="43" text-anchor="middle" font-weight="700">wᵢⱼ directed</text><text x="350" y="59" text-anchor="middle" class="tm">exp(−(d−ρ)/σ)</text>
<rect x="430" y="24" width="120" height="46" rx="7" class="fb sb"/><text x="490" y="43" text-anchor="middle" font-weight="700">Fuzzy union</text><text x="490" y="59" text-anchor="middle" class="tm">a + b − ab</text>
<line x1="130" y1="47" x2="148" y2="47" stroke="currentColor" marker-end="url(#um-c)"/><line x1="270" y1="47" x2="288" y2="47" stroke="currentColor" marker-end="url(#um-c)"/><line x1="410" y1="47" x2="428" y2="47" stroke="currentColor" marker-end="url(#um-c)"/>
<text x="10" y="102" class="tb">PHASE 2: layout (low-D)</text>
<rect x="10" y="110" width="120" height="46" rx="7" class="ft st"/><text x="70" y="129" text-anchor="middle" font-weight="700">Spectral init</text><text x="70" y="145" text-anchor="middle" class="tm">graph Laplacian</text>
<rect x="150" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="210" y="129" text-anchor="middle" font-weight="700">v = 1/(1+a d^2b)</text><text x="210" y="145" text-anchor="middle" class="tm">a, b from min_dist</text>
<rect x="290" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="350" y="129" text-anchor="middle" font-weight="700">Cross-entropy</text><text x="350" y="145" text-anchor="middle" class="tm">attract + repel</text>
<rect x="430" y="110" width="120" height="46" rx="7" class="fr sr"/><text x="490" y="129" text-anchor="middle" font-weight="700">SGD</text><text x="490" y="145" text-anchor="middle" class="tm">edge + negative samples</text>
<line x1="130" y1="133" x2="148" y2="133" stroke="currentColor" marker-end="url(#um-c)"/><line x1="270" y1="133" x2="288" y2="133" stroke="currentColor" marker-end="url(#um-c)"/><line x1="410" y1="133" x2="428" y2="133" stroke="currentColor" marker-end="url(#um-c)"/>
<line x1="490" y1="70" x2="350" y2="108" stroke="currentColor" marker-end="url(#um-c)"/>
<rect x="575" y="70" width="100" height="56" rx="7" class="fs" stroke="currentColor"/><text x="625" y="92" text-anchor="middle" font-weight="700">Embedding</text><text x="625" y="110" text-anchor="middle" class="tm">+ transform()</text>
<line x1="550" y1="133" x2="573" y2="110" stroke="currentColor" marker-end="url(#um-c)"/>
<text x="10" y="190" class="tm">t-SNE counterparts: kNN+σ ↔ perplexity search · fuzzy union ↔ symmetrise /2n · v ↔ Student-t (a=b=1)</text>
<text x="10" y="208" class="tm">cross-entropy ↔ KL (no per-pair repulsion) · negative sampling ↔ Barnes–Hut · spectral init ↔ PCA init</text>
</g></svg><figcaption>UMAP's two phases. Every piece has a t-SNE counterpart; the differences (unnormalised weights, repulsion term, sampling, transform) are what make UMAP faster and reusable.</figcaption></figure>
  <table class="tbl"><caption>UMAP ingredients on the running example</caption>
    <tr><th>Ingredient</th><th>Built from</th><th>Our numbers</th><th>Answers</th></tr>
    <tr><td>kNN</td><td>distances, n_neighbors</td><td>1.0 → 2.0, 3.5, 10.0</td><td>Who is linked?</td></tr>
    <tr><td>ρ, σ</td><td>neighbour distances</td><td>point 1.0: ρ 1, σ 5.552</td><td>Local distance scale</td></tr>
    <tr><td>Directed w</td><td>d, ρ, σ</td><td>1, 0.763, 0.237</td><td>How strong from i's side?</td></tr>
    <tr><td>Union w</td><td>both directions</td><td>0.942 (1.0–3.5), 0.462 (3.5–10.0)</td><td>One strength per edge</td></tr>
    <tr><td>a, b</td><td>min_dist</td><td>1.577, 0.895 (min_dist 0.1)</td><td>Map similarity curve</td></tr>
    <tr><td>Cross-entropy</td><td>w, v</td><td>2.303 (neighbours far), 2.270 (strangers close)</td><td>Map error, both ways</td></tr>
    <tr><td>Digits map</td><td>all above</td><td>5-NN 0.959, trust 0.975</td><td>Does it work?</td></tr>
  </table>
  <h3>The group's final comparison: PCA vs t-SNE vs UMAP</h3>
  <table class="tbl">
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Idea</td><td>Rotate to max-variance axes, keep top k</td><td>Match Gaussian neighbour probs with Student-t map probs (KL)</td><td>Match fuzzy kNN graph with map graph (cross-entropy)</td></tr>
    <tr><td>Linear?</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Deterministic</td><td>Yes</td><td>With PCA init</td><td>With seed (single-threaded)</td></tr>
    <tr><td>Digits 2D 5-NN</td><td>0.514</td><td>0.954</td><td>0.959</td></tr>
    <tr><td>Digits trust(10)</td><td>0.816</td><td>0.986</td><td>0.975</td></tr>
    <tr><td>Digits class-centre corr</td><td>0.789</td><td>0.681</td><td>0.644 (0.736 at n_neighbors 200)</td></tr>
    <tr><td>True 10× gap shown as</td><td>10.0×</td><td>1.7×</td><td>3.9×</td></tr>
    <tr><td>Cluster sizes meaningful</td><td>Yes (variance)</td><td>No</td><td>No (densMAP helps)</td></tr>
    <tr><td>New points</td><td><code>transform</code></td><td>No</td><td><code>transform</code> (test 5-NN 0.961)</td></tr>
    <tr><td>Speed at large n</td><td>Fastest</td><td>Slowest</td><td>Fast</td></tr>
    <tr><td>Output dims</td><td>Any</td><td>2–3</td><td>Any</td></tr>
    <tr><td>As model input</td><td>Yes (logistic 0.884 with 10)</td><td>Never</td><td>Yes, in a pipeline (0.967 with 10)</td></tr>
    <tr><td>Before clustering</td><td>Mild help (HDBSCAN ARI 0.088)</td><td>No</td><td>Strong help (ARI 0.798)</td></tr>
    <tr><td>Interpretable axes</td><td>Loadings</td><td>No</td><td>No</td></tr>
    <tr><td>Best for</td><td>Compression, linear models, denoising, first look</td><td>Publication-quality local pictures, small/medium n</td><td>Pictures at scale, clustering embeddings, reusable non-linear reduction</td></tr>
  </table>
  <div class="cards">
    <div><b>Feed a model</b><p>PCA in a pipeline; UMAP when non-linear structure matters and you cross-validate it.</p><small>Never t-SNE</small></div>
    <div><b>Draw a picture</b><p>Scale → PCA-50 → UMAP or t-SNE; colour by known labels; check several settings.</p><small>Read neighbours, not gaps</small></div>
    <div><b>Cluster embeddings</b><p>UMAP to ~10 dims with min_dist 0 → HDBSCAN; visualise separately in 2D.</p><small>Check stability</small></div>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> The comparison tells us which tool to use; the traps below are how people still misuse it.</div>

  <h2 id="um-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: reading inter-cluster distances or sizes literally</span>
    <p>A true 10× gap was 3.9×; densities are equalised as in t-SNE. Only neighbourhoods are reliable.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fitting UMAP on all data before a model's CV</span>
    <p>Put it inside the Pipeline; transform held-out folds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming "UMAP preserves global structure" unconditionally</span>
    <p>On digits t-SNE (PCA init) scored 0.681 vs UMAP 0.644 on class-centre arrangement; initialisation and n_neighbors matter.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: n_neighbors too large or too small</span>
    <p>Too small fragments classes and invents clumps; larger than the smallest group links it to others.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong metric for embeddings</span>
    <p>Text/sentence embeddings usually need <code>metric="cosine"</code> (or normalise first).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting one run</span>
    <p>UMAP is stochastic; with multi-threading results vary slightly. Fix <code>random_state</code> for reports and check stability across seeds and settings.</p>
  </div>

  <div class="bridge"><b>What this still can't tell us → next: back to clustering.</b> UMAP closes the Dimensionality Reduction group. What it cannot do is decide what the clusters <em>are</em> or whether they are real: that is the work of <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a> and <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>.</div>

  <h2 id="um-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>This section stands alone: the whole note in one place.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Idea</strong>: high-D fuzzy neighbour graph, then a low-D layout of a matching graph.</li>
    <li><strong>kNN</strong>: link each point to n_neighbors − 1 nearest; size sets local vs global.</li>
    <li><strong>Fuzzy weights</strong>: w = exp(−(d − ρ)/σ), nearest = 1, Σ = log₂ k.</li>
    <li><strong>Fuzzy union</strong>: w = a + b − ab.</li>
    <li><strong>Low-D curve</strong>: v = 1/(1 + a d^{2b}), a, b from min_dist.</li>
    <li><strong>Cross-entropy</strong>: attraction for edges, repulsion for non-edges.</li>
    <li><strong>Optimisation</strong>: spectral init, SGD on sampled edges, negative sampling.</li>
    <li><strong>n_neighbors / min_dist</strong>: who is linked / how tightly drawn.</li>
    <li><strong>Global structure</strong>: often better than t-SNE, but initialisation matters; never faithful distances.</li>
    <li><strong>Speed</strong>: approximate kNN + sampling → scales to millions.</li>
    <li><strong>transform</strong>: embeds new points against the fixed training map.</li>
    <li><strong>Preprocessing</strong>: UMAP-10 → HDBSCAN or a classifier, inside CV.</li>
  </ol>
  <h3>Formulas and symbols</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols / meaning</th></tr>
    <tr><td>ρᵢ = min distance to a neighbour</td><td>local connectivity: nearest edge gets weight 1</td></tr>
    <tr><td>wᵢⱼ = exp(−max(0, dᵢⱼ − ρᵢ)/σᵢ)</td><td>σᵢ solves Σⱼ wᵢⱼ = log₂ k, k = n_neighbors</td></tr>
    <tr><td>w = wᵢⱼ + wⱼᵢ − wᵢⱼ wⱼᵢ</td><td>fuzzy union (probability of the edge from either side)</td></tr>
    <tr><td>vᵢⱼ = (1 + a‖yᵢ − yⱼ‖^{2b})⁻¹</td><td>a, b fitted from min_dist, spread</td></tr>
    <tr><td>CE = Σ w log(w/v) + (1 − w) log((1 − w)/(1 − v))</td><td>attraction + repulsion</td></tr>
  </table>
  <h3>The running example in one table</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Six points 1, 2, 3.5 | 10, 11, 12.5, k = 4</td><td>point 1.0: ρ 1, σ 5.552, w 1 / 0.763 / 0.237</td></tr>
    <tr><td>Union weights</td><td>1.0–2.0: 1 · 1.0–3.5: 0.942 · 3.5–10.0: 0.462</td></tr>
    <tr><td>min_dist 0 / 0.1 / 0.5 / 0.99</td><td>a, b = 1.933, 0.790 / 1.577, 0.895 / 0.583, 1.334 / 0.119, 1.916</td></tr>
    <tr><td>CE examples</td><td>neighbours far 2.303 · strangers close 2.270</td></tr>
    <tr><td>Digits UMAP 2D</td><td>5-NN 0.959, trust 0.975</td></tr>
    <tr><td>n_neighbors 5 → 200</td><td>trust(10) 0.977 → 0.964; class-centre corr 0.618 → 0.736</td></tr>
    <tr><td>min_dist 0 → 0.99</td><td>within-digit spread 0.186 → 0.357</td></tr>
    <tr><td>Gap test (true 10×)</td><td>PCA 10 · t-SNE 1.7 · UMAP 3.9</td></tr>
    <tr><td>transform 540 unseen digits</td><td>5-NN 0.961 (raw pixels 0.970)</td></tr>
    <tr><td>HDBSCAN ARI raw / PCA-10 / UMAP-10</td><td>0.060 / 0.088 / 0.798</td></tr>
    <tr><td>Logistic in CV: PCA-10 / UMAP-10</td><td>0.884 / 0.967</td></tr>
  </table>
  <h3>When to use / not use</h3>
  <ul>
    <li><strong>Use</strong>: visualising large or embedding data; non-linear reduction that must apply to new rows; before density-based clustering; exploratory analysis of labels.</li>
    <li><strong>Avoid</strong>: when you need interpretable axes or faithful distances (PCA); tiny datasets where PCA suffices; reading cluster sizes; as a model step without CV.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>What does ρᵢ guarantee? <em>Every point has at least one edge of weight 1 (local connectivity).</em></li>
    <li>Union of directed weights 0.6 and 0.5? <em>0.6 + 0.5 − 0.3 = 0.8.</em></li>
    <li>Which knob controls local vs global? <em>n_neighbors; min_dist only controls packing.</em></li>
    <li>Why can UMAP repel strangers but t-SNE barely does? <em>Its cross-entropy has a (1 − w) log((1 − w)/(1 − v)) term per pair.</em></li>
    <li>Can UMAP embed new points? <em>Yes, transform(); t-SNE cannot.</em></li>
  </ol>

  <h2 id="um-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain UMAP in plain words.</summary><div class="qa-body">Build a weighted nearest-neighbour graph of the data in which each point is fully linked to its nearest neighbour and more weakly to the others, adapting to local density; then place points in low-D so a similar graph computed from the positions matches it, pulling linked points together and pushing random non-linked points apart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the fuzzy weights for a point with neighbour distances 1, 2.5, 9 and n_neighbors = 4.</summary><div class="qa-body">ρ = 1. Find σ with 1 + e^(−1.5/σ) + e^(−8/σ) = log₂ 4 = 2 → σ = 5.552; weights 1, 0.763, 0.237.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do n_neighbors and min_dist control?</summary><div class="qa-body">n_neighbors sets the neighbourhood size used to build the graph: small = local detail, possible fragmentation; large = more global structure (digits class-centre corr 0.618 at 5 → 0.736 at 200). min_dist sets how tightly points may pack in the embedding: 0 = dense clumps (good for clustering), large = even spread (spread 0.186 → 0.357).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does UMAP's loss differ from t-SNE's?</summary><div class="qa-body">t-SNE minimises KL(P‖Q) over normalised probabilities, so placing non-neighbours close is cheap. UMAP minimises a per-edge binary cross-entropy with an explicit repulsion term (1 − w) log((1 − w)/(1 − v)): strangers drawn close cost 2.270 in our example. It uses unnormalised weights, optimised by edge sampling and negative sampling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does UMAP preserve global structure better than t-SNE?</summary><div class="qa-body">Often somewhat: in a controlled gap test it showed 3.9× vs t-SNE's 1.7× (true 10×). But on digits class-centre arrangement t-SNE with PCA initialisation scored 0.681 vs UMAP's 0.644; studies show initialisation explains much of the difference. Neither preserves distances faithfully.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is UMAP faster than t-SNE?</summary><div class="qa-body">Approximate kNN via NN-descent, a sparse graph, SGD over sampled edges and a few negative samples per edge (O(n) repulsion instead of t-SNE's all-pairs repulsion approximated in O(n log n)), numba-compiled and multi-threaded; and it supports any output dimension.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does UMAP transform a new point?</summary><div class="qa-body">It finds the new point's nearest neighbours among the training points, computes fuzzy weights to them, starts it at their weighted mean position and optimises only the new point for a few epochs; the training embedding stays fixed. 540 unseen digits placed this way gave 5-NN test accuracy 0.961.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use UMAP before HDBSCAN?</summary><div class="qa-body">Density estimates fail in high dimensions; UMAP (min_dist 0, ~10 components) concentrates similar points into dense regions. On digits HDBSCAN went from ARI 0.060 with 74% noise on raw pixels to 0.798 with 10 clusters and 1% noise on UMAP-10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you use UMAP output as model features?</summary><div class="qa-body">Yes, unlike t-SNE, as long as UMAP is a step inside the pipeline so each CV fold fits it on training rows and transforms held-out rows (UMAP-10 → logistic 0.967 vs PCA-10 0.884 on digits). Watch for instability and refit when the data distribution shifts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the role of ρ (local connectivity)?</summary><div class="qa-body">Subtracting the nearest-neighbour distance before applying the exponential guarantees each point an edge of weight 1, so no point (even in a sparse region or an outlier) is disconnected from the graph; it implements UMAP's assumption that data is locally uniform on the manifold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does setting random_state do?</summary><div class="qa-body">Makes results reproducible, but forces single-threaded optimisation, so it is slower on large data. Without it, runs differ slightly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Map each UMAP ingredient to its t-SNE counterpart.</summary><div class="qa-body">kNN + σ search with Σw = log₂k ↔ perplexity-based σ search; fuzzy union ↔ symmetrising p_ij; v = 1/(1 + a d^{2b}) ↔ Student-t (a = b = 1); cross-entropy ↔ KL; negative sampling ↔ Barnes–Hut repulsion; spectral init ↔ PCA init; transform ↔ none.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) A team has 1M sentence embeddings (768-d) and wants topics and a picture. Pipeline?</summary><div class="qa-body">Normalise (cosine), optionally PCA to ~50, UMAP to ~5–10 dims with min_dist 0 and n_neighbors ~15–50 using metric="cosine", HDBSCAN for clusters (see <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a>), a separate 2D UMAP of a sample for the picture, then read examples from each cluster to name topics and check stability across settings. Embeddings come from <a class="xref" data-note="vectordb">embedding models / vector databases</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Across the whole group, which method would you choose for: (a) shrinking 30 tumour measurements for logistic regression, (b) explaining which measurements matter, (c) a picture of digits, (d) clustering embeddings?</summary><div class="qa-body">(a) PCA in a pipeline (tumours: 10 components 0.981). (b) Feature selection: L1, RFE or permutation importance (<a class="xref" data-note="ml_dimred">first note</a>). (c) t-SNE or UMAP after scaling/PCA, reading only neighbourhoods. (d) UMAP to ~10 dims → HDBSCAN.</div></details>
</main>
`
});
