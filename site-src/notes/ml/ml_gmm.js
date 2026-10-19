// notes/ml/ml_gmm.js — Gaussian Mixture Models
Object.assign(TOPIC_CONTENT, {
  "ml_gmm": `<main>
  <h1>Gaussian Mixture Models</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>Gaussian Mixture Models</span></div>
  <p class="lead">A Gaussian mixture model (GMM) says: the data was produced by a few bell-shaped clouds, each with its own centre, width, shape and share of the points. Fitting one gives every point a probability of belonging to each cloud (soft assignment), lets clusters be stretched ellipses of different sizes, and gives a full probability density you can use for anomaly detection or to generate new data. This note follows one running example, six users' daily minutes on a learning app, from a single bell curve to a two-component mixture; computes responsibilities and one complete round of the EM algorithm by hand; runs EM to convergence and matches scikit-learn to four decimals; and then covers initialisation and collapse, covariance types, choosing the number of components with BIC and AIC, the exact relation to K-Means, density estimation, and a from-scratch multivariate EM.</p>

  <h2 id="gm-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 240" width="660">
<defs><marker id="gm-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Clustering</text>
<rect x="245" y="26" width="170" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="330" y="45" text-anchor="middle" font-size="12.5">The Idea &amp; Distances</text><text x="330" y="61" text-anchor="middle" class="tm" font-size="10.5">what "similar" means</text>
<line x1="280" y1="70" x2="95" y2="104" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="310" y1="70" x2="255" y2="104" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="350" y1="70" x2="415" y2="104" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="380" y1="70" x2="570" y2="104" stroke="currentColor" marker-end="url(#gm-fa)"/>
<rect x="20" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="95" y="126" text-anchor="middle" font-size="12.5">K-Means</text><text x="95" y="142" text-anchor="middle" class="tm" font-size="10.5">centroid</text>
<rect x="180" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="255" y="126" text-anchor="middle" font-size="12.5">Hierarchical</text><text x="255" y="142" text-anchor="middle" class="tm" font-size="10.5">merge tree</text>
<rect x="340" y="106" width="150" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="415" y="126" text-anchor="middle" font-size="12.5">DBSCAN &amp; HDBSCAN</text><text x="415" y="142" text-anchor="middle" class="tm" font-size="10.5">density</text>
<rect x="500" y="102" width="150" height="54" rx="8" class="fb sb" stroke-width="3"/>
<text x="575" y="124" text-anchor="middle" font-size="12.5" font-weight="700">Gaussian Mixtures</text><text x="575" y="142" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<line x1="95" y1="152" x2="300" y2="190" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="255" y1="152" x2="315" y2="190" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="415" y1="152" x2="345" y2="190" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="575" y1="156" x2="360" y2="190" stroke="currentColor" marker-end="url(#gm-fa)"/>
<line x1="170" y1="129" x2="498" y2="129" stroke="currentColor" stroke-dasharray="2 3" stroke-opacity="0.5"/>
<text x="300" y="100" class="tm" font-size="10">K-Means = a GMM with hard, round, equal clusters</text>
<rect x="245" y="192" width="170" height="40" rx="8" class="ft st"/>
<text x="330" y="216" text-anchor="middle" font-size="12.5">Evaluating Clusters</text>
</svg><figcaption>The Clustering group. The Gaussian mixture is the "distribution" family: each cluster is a probability cloud. K-Means turns out to be a special, hardened case of it.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_kmeans">K-Means</a> and <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a></b><span>K-Means gives each point exactly one cluster, even a point sitting halfway between two, and it can only describe round clusters of similar size. DBSCAN handles odd shapes and noise, but it also gives hard labels, has no model of the data, and needs a density gap between clusters. What was left open: overlapping clusters, stretched clusters of different sizes, and an honest "this point is 70% A and 30% B".</span></li>
    <li><b>This note adds: clusters as probability distributions</b><span>Each cluster is a Gaussian (a bell curve, or a tilted ellipse in several dimensions) with a weight. Bayes' rule turns that into soft memberships, and the EM algorithm fits everything by alternating "who belongs where" and "where are the clouds". You also get BIC/AIC to choose the number of clusters and a density for anomaly detection.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a></b><span>A GMM always returns the number of components you ask for. Evaluating Clusters explains how to judge any clustering, internal scores, external scores and stability. Gaussians and likelihood also come back in <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> (Gaussian NB is a GMM with known labels) and in <a class="xref" data-note="ml_calibration">calibration</a>.</span></li>
  </ol>
  <p>You should know what a mean and a variance are (<a class="xref" data-note="st_descriptive">Descriptive Statistics</a>), what a probability density and Bayes' rule are (<a class="xref" data-note="st_probability">Probability</a>), and how K-Means works (<a class="xref" data-note="ml_kmeans">K-Means</a>). Each is re-explained where it is used.</p>

  <h2 id="gm-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>The whole note as one chain of questions. Each idea answers the question the previous one could not, and every number is computed on the same six users.</p>
  <ol class="story">
    <li><b>Soft, shaped clusters</b><span>Q: what about a user halfway between two groups, or stretched groups? → K-Means forces user U4 (5 minutes) into one group and only knows round shapes. We need a probability model of each group…</span></li>
    <li><b>The Gaussian</b><span>Q: how do we describe one group with probabilities? → A bell curve with mean μ and variance σ². But one bell for all six users is a poor fit (log-likelihood −15.07): the data has two humps…</span></li>
    <li><b>The mixture</b><span>Q: how do we describe two humps? → A weighted sum of bells: p(x) = Σ π_k N(x | μ_k, σ_k²). But which bell did each user come from?…</span></li>
    <li><b>Responsibilities (soft assignment)</b><span>Q: how much does each user belong to each bell? → Bayes' rule: r_ik = π_k N(x_i | k) / p(x_i). But this needs the bells' parameters, which we do not know…</span></li>
    <li><b>The EM algorithm</b><span>Q: how do we find parameters and memberships at the same time? → Alternate: E-step computes responsibilities, M-step re-estimates weighted means and variances; the likelihood never goes down. But it can stop at a poor solution or blow up…</span></li>
    <li><b>Initialisation and collapse</b><span>Q: how do we avoid bad local optima and infinite likelihood? → Several starts (n_init), a sensible init (k-means), and a variance floor (reg_covar). In more than one dimension: how flexible should each bell's shape be?…</span></li>
    <li><b>Covariance types</b><span>Q: full, tied, diagonal or spherical? → A trade-off between flexibility and number of parameters. And how many components?…</span></li>
    <li><b>BIC and AIC</b><span>Q: how many bells? → Likelihood minus a penalty per parameter; lowest wins. How does all this relate to K-Means?…</span></li>
    <li><b>GMM vs K-Means</b><span>Q: what is K-Means in this language? → A GMM with equal round bells whose width shrinks to zero. What else does a density buy us?…</span></li>
    <li><b>Density estimation and anomalies</b><span>Q: which new users are unusual, and can we generate fake ones? → Low log p(x) = unusual; sample() draws new data.</span></li>
  </ol>

  <h2 id="gm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Gaussian Mixture Models</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Model</div>
        <ul>
          <li><b>p(x) = Σₖ πₖ · N(x | μₖ, Σₖ)</b>; weights πₖ ≥ 0 sum to 1</li>
          <li>Generative story: roll a weighted die for k, then draw x from bell k</li>
          <li>Latent variable zᵢ = which bell produced xᵢ (never observed)</li>
          <li>Running example: users 1, 2, 3, 5, 8, 9 minutes; one bell LL −15.07, two bells −12.51</li>
          <li>💡 Two tea-sellers' cups mixed in one tray: guess who poured each from its size</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Soft assignment</div>
        <ul>
          <li><b>Responsibility</b> rᵢₖ = πₖ N(xᵢ | k) / Σⱼ πⱼ N(xᵢ | j) (Bayes' rule)</li>
          <li>Each row of r sums to 1; hard label = argmax</li>
          <li>Start (μ 2, 8, σ² 4): U3 → 0.953 / 0.047, U4 → <b>0.500 / 0.500</b></li>
          <li>Depends on widths, not only distances</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · EM</div>
        <ul>
          <li><b>E</b>: responsibilities from current parameters</li>
          <li><b>M</b>: Nₖ = Σ rᵢₖ; πₖ = Nₖ/n; μₖ = Σ rᵢₖ xᵢ / Nₖ; σₖ² = Σ rᵢₖ (xᵢ − μₖ)² / Nₖ</li>
          <li>One step by hand: π 0.575/0.425, μ 2.446/7.677, σ² 1.819/2.722; LL −14.56 → −13.79</li>
          <li>LL never decreases; converges to a <b>local</b> optimum (here μ 2.75, 8.5)</li>
          <li>⚠ Collapse: a bell on one point → σ² → 0, LL → ∞; fix reg_covar</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Shapes</div>
        <ul>
          <li><b>full</b>: own tilted ellipse · <b>tied</b>: one shared ellipse · <b>diag</b>: axis-aligned · <b>spherical</b>: circles</li>
          <li>Parameters (k=3, d=2): 17 · 11 · 14 · 11</li>
          <li>Stretched blobs: full/tied ARI 1.000, diag 0.516, spherical 0.568</li>
          <li>Full covariance costs k·d(d+1)/2: 3,977 parameters for k=3, d=50</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · How many</div>
        <ul>
          <li><b>AIC</b> = −2 LL + 2p · <b>BIC</b> = −2 LL + p ln n; lower is better</li>
          <li>1-D, k bells: p = 3k − 1</li>
          <li>Blobs: BIC minimum at k = 3 (3061.9)</li>
          <li>⚠ Tiny n: a bell on one point fakes a huge LL (k=3 "wins" on 6 users)</li>
          <li>BayesianGaussianMixture switches unneeded bells off (8 offered → 3 used)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Uses &amp; relations</div>
        <ul>
          <li>K-Means = equal weights, shared σ²I, σ² → 0 (hard)</li>
          <li>Unequal clusters: K-Means ARI 0.166, GMM 0.902</li>
          <li><b>score_samples</b> = log p(x) → anomalies: 19 of 20 oddballs caught</li>
          <li><b>sample()</b> → synthetic data · <b>predict_proba</b> → soft labels</li>
          <li>Scale features; diag/spherical care about units</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="gm-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="gm-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Soft, Shaped Clusters?</span><span class="rm-sub">Where K-Means is too blunt</span></div></div>
      <div class="rm-item rm-done" data-target="gm-gauss"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Gaussian</span><span class="rm-sub">One bell, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="gm-mix"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Mixture</span><span class="rm-sub">Weighted bells, likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="gm-soft"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Soft vs Hard Assignment</span><span class="rm-sub">Responsibilities by Bayes</span></div></div>
      <div class="rm-item rm-done" data-target="gm-em"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The EM Algorithm</span><span class="rm-sub">One iteration fully by hand</span></div></div>
      <div class="rm-item rm-done" data-target="gm-init"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Local Optima &amp; Collapse</span><span class="rm-sub">n_init, init_params, reg_covar</span></div></div>
      <div class="rm-item rm-done" data-target="gm-cov"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Covariance Types</span><span class="rm-sub">full, tied, diag, spherical</span></div></div>
      <div class="rm-item rm-done" data-target="gm-select"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing k: BIC &amp; AIC</span><span class="rm-sub">By hand, then at scale</span></div></div>
      <div class="rm-item rm-done" data-target="gm-kmeans"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">GMM vs K-Means</span><span class="rm-sub">K-Means as a limit</span></div></div>
      <div class="rm-item rm-done" data-target="gm-density"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Density &amp; Anomalies</span><span class="rm-sub">score_samples, sample</span></div></div>
      <div class="rm-item rm-done" data-target="gm-sklearn"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">scikit-learn &amp; From Scratch</span><span class="rm-sub">Every parameter; multivariate EM</span></div></div>
      <div class="rm-item rm-done" data-target="gm-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every quantity on the six users</span></div></div>
      <div class="rm-item rm-done" data-target="gm-compare"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs K-Means, DBSCAN, hierarchical</span></div></div>
      <div class="rm-item rm-done" data-target="gm-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="gm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="gm-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="gm-why"><span class="num">01</span>Why Soft, Shaped Clusters?</h2>
  <p><strong>The question we can't answer yet.</strong> K-Means and DBSCAN both give each point exactly one label. What should we say about a point that sits between two groups, and how do we describe groups that are stretched or of very different sizes?</p>
  <h3>The running example: six users</h3>
  <p>A learning app records how many minutes six users spent on it yesterday:</p>
  <table class="tbl">
    <tr><th>User</th><th>U1</th><th>U2</th><th>U3</th><th>U4</th><th>U5</th><th>U6</th></tr>
    <tr><td>minutes x</td><td>1</td><td>2</td><td>3</td><td>5</td><td>8</td><td>9</td></tr>
  </table>
  <p>By eye there are "casual" users (1–3 minutes) and "keen" users (8–9 minutes), and U4 at 5 minutes is in between. One-dimensional data keeps every calculation small enough to do by hand; everything carries over to many columns.</p>
  <h3>What K-Means says</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans

x = np.array([1, 2, 3, 5, 8, 9], dtype=float)        # minutes per day on the app, users U1..U6
X1 = x.reshape(-1, 1)                                  # sklearn wants a 2-D array (6 rows, 1 column)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X1)
print("K-Means labels :", km.labels_)
print("centres        :", km.cluster_centers_.ravel().round(3))
print("distance of 5 to each centre:", np.abs(5 - km.cluster_centers_.ravel()).round(3))</div>
  <div class="fx" data-lang="text">K-Means labels : [0 0 0 0 1 1]
centres        : [2.75 8.5 ]
distance of 5 to each centre: [2.25 3.5 ]</div>
  <p>K-Means puts U4 firmly with the casual users (label 0), because 5 is 2.25 from the casual centre 2.75 and 3.5 from the keen centre 8.5. The label carries no hint that U4 is a borderline case. If marketing sends "casual" offers to label-0 users, U4 gets the same treatment as U1, although U4 is much more likely to become a keen user.</p>
  <h3>The idea in plain words</h3>
  <p>Describe each group by a <strong>probability cloud</strong>: a bell curve that says where the group's points usually fall and how spread out they are. A point then belongs to each group <em>in proportion to how likely that group is to have produced it</em>. A point deep inside one cloud is 99.9% that group; a point where two clouds overlap is split. Clouds can be wide or narrow, and in more dimensions stretched and tilted, so groups of different sizes and shapes are natural.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two tea-sellers pour into the same tray: one makes small cutting-chai cups (about 60 ml, give or take 10), the other big glasses (about 150 ml, give or take 25). Looking at a 70 ml cup you would say "almost surely the first seller"; a 105 ml cup could be either. You judge from what each seller usually pours <em>and</em> how much their pours vary. That is exactly how a Gaussian mixture assigns points.</p>
  </div>
  <h3>The same idea at scale</h3>
  <p>Two 2-D data sets where K-Means' assumptions break: three stretched, tilted clouds, and one big loose cloud (500 points) next to a small tight one (60 points). The adjusted Rand index (ARI) compares the found groups with the truth (1 = perfect, 0 = random; see <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_blobs
from sklearn.mixture import GaussianMixture
from sklearn.metrics import adjusted_rand_score

Xb, yb = make_blobs(n_samples=600, centers=3, random_state=170)
Xa = Xb @ np.array([[0.6, -0.6], [-0.4, 0.8]])          # stretch and shear: elliptical clusters
Xu, yu = make_blobs(n_samples=[500, 60], centers=[[0, 0], [3.5, 0]],
                    cluster_std=[1.6, 0.4], random_state=0)   # big loose + small tight
for name, (Z, yt, k) in {"stretched": (Xa, yb, 3), "unequal": (Xu, yu, 2)}.items():
    a = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(Z)
    g = GaussianMixture(n_components=k, n_init=5, random_state=0).fit(Z).predict(Z)
    print(f"{name:9s}  K-Means ARI {adjusted_rand_score(yt, a):.3f}   GMM ARI {adjusted_rand_score(yt, g):.3f}")</div>
  <div class="fx" data-lang="text">stretched  K-Means ARI 0.580   GMM ARI 1.000
unequal    K-Means ARI 0.166   GMM ARI 0.902</div>
  <figure class="viz"><svg viewBox="0 0 640 240" width="640">
<text x="160" y="16" text-anchor="middle" font-size="12.5">K-Means, k = 3</text>
<text x="480" y="16" text-anchor="middle" font-size="12.5">GMM, 3 components, full covariance</text>
<circle cx="117" cy="86" r="2.2" class="fg sg"/><circle cx="121" cy="138" r="2.2" class="fb sb"/><circle cx="93" cy="61" r="2.2" class="fg sg"/><circle cx="87" cy="110" r="2.2" class="fb sb"/><circle cx="94" cy="98" r="2.2" class="fg sg"/><circle cx="137" cy="97" r="2.2" class="fb sb"/><circle cx="102" cy="116" r="2.2" class="fb sb"/><circle cx="263" cy="171" r="2.2" class="fr sr"/><circle cx="212" cy="140" r="2.2" class="fr sr"/><circle cx="152" cy="111" r="2.2" class="fb sb"/><circle cx="72" cy="81" r="2.2" class="fg sg"/><circle cx="223" cy="149" r="2.2" class="fr sr"/><circle cx="118" cy="85" r="2.2" class="fg sg"/><circle cx="104" cy="116" r="2.2" class="fb sb"/><circle cx="102" cy="101" r="2.2" class="fb sb"/><circle cx="95" cy="126" r="2.2" class="fb sb"/><circle cx="61" cy="81" r="2.2" class="fg sg"/><circle cx="127" cy="133" r="2.2" class="fb sb"/><circle cx="257" cy="175" r="2.2" class="fr sr"/><circle cx="149" cy="167" r="2.2" class="fb sb"/><circle cx="244" cy="167" r="2.2" class="fr sr"/><circle cx="187" cy="111" r="2.2" class="fb sb"/><circle cx="141" cy="101" r="2.2" class="fb sb"/><circle cx="99" cy="104" r="2.2" class="fb sb"/><circle cx="131" cy="76" r="2.2" class="fg sg"/><circle cx="78" cy="89" r="2.2" class="fg sg"/><circle cx="104" cy="63" r="2.2" class="fg sg"/><circle cx="243" cy="152" r="2.2" class="fr sr"/><circle cx="93" cy="96" r="2.2" class="fg sg"/><circle cx="244" cy="156" r="2.2" class="fr sr"/><circle cx="93" cy="52" r="2.2" class="fg sg"/><circle cx="153" cy="114" r="2.2" class="fb sb"/><circle cx="234" cy="155" r="2.2" class="fr sr"/><circle cx="88" cy="58" r="2.2" class="fg sg"/><circle cx="257" cy="167" r="2.2" class="fr sr"/><circle cx="200" cy="123" r="2.2" class="fr sr"/><circle cx="115" cy="84" r="2.2" class="fg sg"/><circle cx="68" cy="76" r="2.2" class="fg sg"/><circle cx="116" cy="80" r="2.2" class="fg sg"/><circle cx="99" cy="108" r="2.2" class="fb sb"/><circle cx="79" cy="51" r="2.2" class="fg sg"/><circle cx="238" cy="156" r="2.2" class="fr sr"/><circle cx="103" cy="123" r="2.2" class="fb sb"/><circle cx="238" cy="158" r="2.2" class="fr sr"/><circle cx="136" cy="143" r="2.2" class="fb sb"/><circle cx="211" cy="120" r="2.2" class="fr sr"/><circle cx="79" cy="80" r="2.2" class="fg sg"/><circle cx="111" cy="73" r="2.2" class="fg sg"/><circle cx="117" cy="83" r="2.2" class="fg sg"/><circle cx="112" cy="64" r="2.2" class="fg sg"/><circle cx="121" cy="80" r="2.2" class="fg sg"/><circle cx="77" cy="88" r="2.2" class="fg sg"/><circle cx="157" cy="156" r="2.2" class="fb sb"/><circle cx="240" cy="151" r="2.2" class="fr sr"/><circle cx="245" cy="165" r="2.2" class="fr sr"/><circle cx="228" cy="146" r="2.2" class="fr sr"/><circle cx="119" cy="79" r="2.2" class="fg sg"/><circle cx="269" cy="182" r="2.2" class="fr sr"/><circle cx="233" cy="156" r="2.2" class="fr sr"/><circle cx="245" cy="163" r="2.2" class="fr sr"/><circle cx="220" cy="143" r="2.2" class="fr sr"/><circle cx="248" cy="170" r="2.2" class="fr sr"/><circle cx="227" cy="134" r="2.2" class="fr sr"/><circle cx="67" cy="90" r="2.2" class="fg sg"/><circle cx="66" cy="88" r="2.2" class="fg sg"/><circle cx="121" cy="118" r="2.2" class="fb sb"/><circle cx="238" cy="155" r="2.2" class="fr sr"/><circle cx="129" cy="85" r="2.2" class="fg sg"/><circle cx="253" cy="164" r="2.2" class="fr sr"/><circle cx="151" cy="151" r="2.2" class="fb sb"/><circle cx="253" cy="181" r="2.2" class="fr sr"/><circle cx="98" cy="65" r="2.2" class="fg sg"/><circle cx="118" cy="86" r="2.2" class="fg sg"/><circle cx="251" cy="157" r="2.2" class="fr sr"/><circle cx="143" cy="159" r="2.2" class="fb sb"/><circle cx="86" cy="109" r="2.2" class="fb sb"/><circle cx="232" cy="148" r="2.2" class="fr sr"/><circle cx="213" cy="136" r="2.2" class="fr sr"/><circle cx="128" cy="140" r="2.2" class="fb sb"/><circle cx="134" cy="88" r="2.2" class="fg sg"/><circle cx="93" cy="51" r="2.2" class="fg sg"/><circle cx="82" cy="58" r="2.2" class="fg sg"/><circle cx="134" cy="93" r="2.2" class="fb sb"/><circle cx="267" cy="178" r="2.2" class="fr sr"/><circle cx="145" cy="94" r="2.2" class="fb sb"/><circle cx="142" cy="96" r="2.2" class="fb sb"/><circle cx="82" cy="93" r="2.2" class="fg sg"/><circle cx="145" cy="146" r="2.2" class="fb sb"/><circle cx="136" cy="90" r="2.2" class="fg sg"/><circle cx="101" cy="60" r="2.2" class="fg sg"/><circle cx="89" cy="95" r="2.2" class="fg sg"/><circle cx="126" cy="126" r="2.2" class="fb sb"/><circle cx="86" cy="99" r="2.2" class="fg sg"/><circle cx="114" cy="82" r="2.2" class="fg sg"/><circle cx="110" cy="78" r="2.2" class="fg sg"/><circle cx="125" cy="148" r="2.2" class="fb sb"/><circle cx="112" cy="70" r="2.2" class="fg sg"/><circle cx="120" cy="134" r="2.2" class="fb sb"/><circle cx="206" cy="134" r="2.2" class="fr sr"/><circle cx="110" cy="112" r="2.2" class="fb sb"/><circle cx="148" cy="146" r="2.2" class="fb sb"/><circle cx="118" cy="70" r="2.2" class="fg sg"/><circle cx="227" cy="143" r="2.2" class="fr sr"/><circle cx="129" cy="108" r="2.2" class="fb sb"/><circle cx="55" cy="78" r="2.2" class="fg sg"/><circle cx="112" cy="64" r="2.2" class="fg sg"/><circle cx="112" cy="73" r="2.2" class="fg sg"/><circle cx="135" cy="91" r="2.2" class="fg sg"/><circle cx="123" cy="135" r="2.2" class="fb sb"/><circle cx="96" cy="100" r="2.2" class="fg sg"/><circle cx="113" cy="78" r="2.2" class="fg sg"/><circle cx="92" cy="102" r="2.2" class="fg sg"/><circle cx="295" cy="198" r="2.2" class="fr sr"/><circle cx="137" cy="90" r="2.2" class="fg sg"/><circle cx="101" cy="63" r="2.2" class="fg sg"/><circle cx="75" cy="101" r="2.2" class="fg sg"/><circle cx="222" cy="147" r="2.2" class="fr sr"/><circle cx="215" cy="142" r="2.2" class="fr sr"/><circle cx="254" cy="163" r="2.2" class="fr sr"/><circle cx="89" cy="96" r="2.2" class="fg sg"/><circle cx="112" cy="116" r="2.2" class="fb sb"/><circle cx="121" cy="90" r="2.2" class="fg sg"/><circle cx="122" cy="79" r="2.2" class="fg sg"/><circle cx="89" cy="100" r="2.2" class="fg sg"/><circle cx="106" cy="125" r="2.2" class="fb sb"/><circle cx="247" cy="157" r="2.2" class="fr sr"/><circle cx="221" cy="145" r="2.2" class="fr sr"/><circle cx="125" cy="131" r="2.2" class="fb sb"/><circle cx="260" cy="177" r="2.2" class="fr sr"/><circle cx="236" cy="152" r="2.2" class="fr sr"/><circle cx="126" cy="89" r="2.2" class="fg sg"/><circle cx="242" cy="149" r="2.2" class="fr sr"/><circle cx="104" cy="71" r="2.2" class="fg sg"/><circle cx="120" cy="91" r="2.2" class="fg sg"/><circle cx="106" cy="113" r="2.2" class="fb sb"/><circle cx="126" cy="84" r="2.2" class="fg sg"/><circle cx="126" cy="88" r="2.2" class="fg sg"/><circle cx="83" cy="59" r="2.2" class="fg sg"/><circle cx="124" cy="140" r="2.2" class="fb sb"/><circle cx="105" cy="70" r="2.2" class="fg sg"/><circle cx="241" cy="159" r="2.2" class="fr sr"/><circle cx="111" cy="73" r="2.2" class="fg sg"/><circle cx="113" cy="88" r="2.2" class="fg sg"/><circle cx="261" cy="163" r="2.2" class="fr sr"/><circle cx="209" cy="138" r="2.2" class="fr sr"/><circle cx="87" cy="57" r="2.2" class="fg sg"/><circle cx="155" cy="164" r="2.2" class="fb sb"/><circle cx="215" cy="143" r="2.2" class="fr sr"/><circle cx="255" cy="164" r="2.2" class="fr sr"/><circle cx="100" cy="122" r="2.2" class="fb sb"/><circle cx="141" cy="148" r="2.2" class="fb sb"/><circle cx="103" cy="74" r="2.2" class="fg sg"/><circle cx="136" cy="94" r="2.2" class="fb sb"/><circle cx="62" cy="84" r="2.2" class="fg sg"/><circle cx="143" cy="101" r="2.2" class="fb sb"/><circle cx="90" cy="55" r="2.2" class="fg sg"/><circle cx="136" cy="94" r="2.2" class="fb sb"/><circle cx="241" cy="151" r="2.2" class="fr sr"/><circle cx="236" cy="161" r="2.2" class="fr sr"/><circle cx="220" cy="146" r="2.2" class="fr sr"/><circle cx="116" cy="124" r="2.2" class="fb sb"/><circle cx="82" cy="45" r="2.2" class="fg sg"/><circle cx="270" cy="185" r="2.2" class="fr sr"/><circle cx="64" cy="74" r="2.2" class="fg sg"/><circle cx="237" cy="157" r="2.2" class="fr sr"/><circle cx="76" cy="49" r="2.2" class="fg sg"/><circle cx="220" cy="151" r="2.2" class="fr sr"/><circle cx="222" cy="146" r="2.2" class="fr sr"/><circle cx="226" cy="147" r="2.2" class="fr sr"/><circle cx="208" cy="130" r="2.2" class="fr sr"/><circle cx="139" cy="156" r="2.2" class="fb sb"/><circle cx="265" cy="176" r="2.2" class="fr sr"/><circle cx="75" cy="89" r="2.2" class="fg sg"/><circle cx="144" cy="98" r="2.2" class="fb sb"/><circle cx="252" cy="170" r="2.2" class="fr sr"/><circle cx="106" cy="64" r="2.2" class="fg sg"/><circle cx="275" cy="185" r="2.2" class="fr sr"/><circle cx="270" cy="178" r="2.2" class="fr sr"/><circle cx="75" cy="97" r="2.2" class="fg sg"/><circle cx="108" cy="64" r="2.2" class="fg sg"/><circle cx="240" cy="151" r="2.2" class="fr sr"/><circle cx="155" cy="161" r="2.2" class="fb sb"/><circle cx="237" cy="153" r="2.2" class="fr sr"/><circle cx="230" cy="149" r="2.2" class="fr sr"/><circle cx="118" cy="125" r="2.2" class="fb sb"/><circle cx="251" cy="157" r="2.2" class="fr sr"/><circle cx="111" cy="71" r="2.2" class="fg sg"/><circle cx="211" cy="126" r="2.2" class="fr sr"/><circle cx="129" cy="82" r="2.2" class="fg sg"/><circle cx="58" cy="35" r="2.2" class="fg sg"/><circle cx="81" cy="51" r="2.2" class="fg sg"/><circle cx="107" cy="82" r="2.2" class="fg sg"/><circle cx="235" cy="153" r="2.2" class="fr sr"/><circle cx="100" cy="112" r="2.2" class="fb sb"/><circle cx="112" cy="123" r="2.2" class="fb sb"/><circle cx="92" cy="111" r="2.2" class="fb sb"/><circle cx="113" cy="120" r="2.2" class="fb sb"/><circle cx="230" cy="153" r="2.2" class="fr sr"/><circle cx="113" cy="70" r="2.2" class="fg sg"/><circle cx="275" cy="176" r="2.2" class="fr sr"/><circle cx="132" cy="96" r="2.2" class="fb sb"/><circle cx="81" cy="98" r="2.2" class="fg sg"/><circle cx="107" cy="68" r="2.2" class="fg sg"/><circle cx="238" cy="161" r="2.2" class="fr sr"/><circle cx="25" cy="45" r="2.2" class="fg sg"/><circle cx="97" cy="99" r="2.2" class="fg sg"/><circle cx="243" cy="160" r="2.2" class="fr sr"/><circle cx="208" cy="114" r="2.2" class="fr sr"/><circle cx="218" cy="139" r="2.2" class="fr sr"/><circle cx="146" cy="104" r="2.2" class="fb sb"/><circle cx="264" cy="173" r="2.2" class="fr sr"/><circle cx="126" cy="87" r="2.2" class="fg sg"/><circle cx="225" cy="156" r="2.2" class="fr sr"/><circle cx="100" cy="107" r="2.2" class="fb sb"/><circle cx="250" cy="167" r="2.2" class="fr sr"/><circle cx="107" cy="112" r="2.2" class="fb sb"/><circle cx="198" cy="128" r="2.2" class="fr sr"/><circle cx="125" cy="131" r="2.2" class="fb sb"/><circle cx="110" cy="126" r="2.2" class="fb sb"/><circle cx="119" cy="139" r="2.2" class="fb sb"/><circle cx="116" cy="77" r="2.2" class="fg sg"/><circle cx="147" cy="93" r="2.2" class="fb sb"/><circle cx="263" cy="178" r="2.2" class="fr sr"/><circle cx="120" cy="75" r="2.2" class="fg sg"/><circle cx="230" cy="140" r="2.2" class="fr sr"/><circle cx="82" cy="96" r="2.2" class="fg sg"/><circle cx="140" cy="127" r="2.2" class="fb sb"/><circle cx="119" cy="82" r="2.2" class="fg sg"/><circle cx="257" cy="169" r="2.2" class="fr sr"/><circle cx="97" cy="108" r="2.2" class="fb sb"/><circle cx="121" cy="87" r="2.2" class="fg sg"/><circle cx="249" cy="156" r="2.2" class="fr sr"/><circle cx="162" cy="107" r="2.2" class="fb sb"/><circle cx="96" cy="63" r="2.2" class="fg sg"/><circle cx="93" cy="113" r="2.2" class="fb sb"/><circle cx="114" cy="123" r="2.2" class="fb sb"/><circle cx="86" cy="44" r="2.2" class="fg sg"/><circle cx="131" cy="134" r="2.2" class="fb sb"/><circle cx="217" cy="143" r="2.2" class="fr sr"/><circle cx="251" cy="164" r="2.2" class="fr sr"/><circle cx="234" cy="144" r="2.2" class="fr sr"/><circle cx="154" cy="106" r="2.2" class="fb sb"/><circle cx="105" cy="75" r="2.2" class="fg sg"/><circle cx="132" cy="140" r="2.2" class="fb sb"/><circle cx="126" cy="137" r="2.2" class="fb sb"/><circle cx="99" cy="119" r="2.2" class="fb sb"/><circle cx="268" cy="180" r="2.2" class="fr sr"/><circle cx="254" cy="164" r="2.2" class="fr sr"/><circle cx="276" cy="188" r="2.2" class="fr sr"/><circle cx="143" cy="93" r="2.2" class="fb sb"/><circle cx="141" cy="99" r="2.2" class="fb sb"/><circle cx="220" cy="142" r="2.2" class="fr sr"/><circle cx="255" cy="167" r="2.2" class="fr sr"/><circle cx="81" cy="104" r="2.2" class="fg sg"/><circle cx="154" cy="162" r="2.2" class="fb sb"/><circle cx="79" cy="97" r="2.2" class="fg sg"/><circle cx="275" cy="186" r="2.2" class="fr sr"/><circle cx="113" cy="65" r="2.2" class="fg sg"/><circle cx="230" cy="153" r="2.2" class="fr sr"/><circle cx="233" cy="143" r="2.2" class="fr sr"/><circle cx="114" cy="126" r="2.2" class="fb sb"/><circle cx="271" cy="187" r="2.2" class="fr sr"/><circle cx="103" cy="109" r="2.2" class="fb sb"/><circle cx="283" cy="187" r="2.2" class="fr sr"/><circle cx="143" cy="88" r="2.2" class="fg sg"/><circle cx="127" cy="125" r="2.2" class="fb sb"/><circle cx="159" cy="108" r="2.2" class="fb sb"/><circle cx="71" cy="104" r="2.2" class="fg sg"/><circle cx="131" cy="89" r="2.2" class="fg sg"/><circle cx="220" cy="145" r="2.2" class="fr sr"/><circle cx="98" cy="60" r="2.2" class="fg sg"/><circle cx="115" cy="81" r="2.2" class="fg sg"/><circle cx="257" cy="171" r="2.2" class="fr sr"/><circle cx="265" cy="175" r="2.2" class="fr sr"/><circle cx="120" cy="83" r="2.2" class="fg sg"/><circle cx="105" cy="57" r="2.2" class="fg sg"/><circle cx="70" cy="40" r="2.2" class="fg sg"/><circle cx="131" cy="82" r="2.2" class="fg sg"/><circle cx="154" cy="115" r="2.2" class="fb sb"/><circle cx="244" cy="163" r="2.2" class="fr sr"/><circle cx="260" cy="173" r="2.2" class="fr sr"/><circle cx="246" cy="167" r="2.2" class="fr sr"/><circle cx="140" cy="145" r="2.2" class="fb sb"/><circle cx="74" cy="94" r="2.2" class="fg sg"/><circle cx="105" cy="119" r="2.2" class="fb sb"/><circle cx="126" cy="126" r="2.2" class="fb sb"/><circle cx="70" cy="34" r="2.2" class="fg sg"/><circle cx="105" cy="67" r="2.2" class="fg sg"/><circle cx="215" cy="131" r="2.2" class="fr sr"/><circle cx="127" cy="128" r="2.2" class="fb sb"/><circle cx="80" cy="97" r="2.2" class="fg sg"/><circle cx="133" cy="144" r="2.2" class="fb sb"/><circle cx="100" cy="76" r="2.2" class="fg sg"/><circle cx="218" cy="135" r="2.2" class="fr sr"/><circle cx="156" cy="111" r="2.2" class="fb sb"/><circle cx="97" cy="50" r="2.2" class="fg sg"/><circle cx="253" cy="171" r="2.2" class="fr sr"/><circle cx="95" cy="53" r="2.2" class="fg sg"/><circle cx="248" cy="169" r="2.2" class="fr sr"/><circle cx="109" cy="62" r="2.2" class="fg sg"/>
<circle cx="437" cy="86" r="2.2" class="fg sg"/><circle cx="441" cy="138" r="2.2" class="fb sb"/><circle cx="413" cy="61" r="2.2" class="fg sg"/><circle cx="407" cy="110" r="2.2" class="fb sb"/><circle cx="414" cy="98" r="2.2" class="fb sb"/><circle cx="457" cy="97" r="2.2" class="fg sg"/><circle cx="422" cy="116" r="2.2" class="fb sb"/><circle cx="583" cy="171" r="2.2" class="fr sr"/><circle cx="532" cy="140" r="2.2" class="fr sr"/><circle cx="472" cy="111" r="2.2" class="fg sg"/><circle cx="392" cy="81" r="2.2" class="fb sb"/><circle cx="543" cy="149" r="2.2" class="fr sr"/><circle cx="438" cy="85" r="2.2" class="fg sg"/><circle cx="424" cy="116" r="2.2" class="fb sb"/><circle cx="422" cy="101" r="2.2" class="fb sb"/><circle cx="415" cy="126" r="2.2" class="fb sb"/><circle cx="381" cy="81" r="2.2" class="fb sb"/><circle cx="447" cy="133" r="2.2" class="fb sb"/><circle cx="577" cy="175" r="2.2" class="fr sr"/><circle cx="469" cy="167" r="2.2" class="fb sb"/><circle cx="564" cy="167" r="2.2" class="fr sr"/><circle cx="507" cy="111" r="2.2" class="fr sr"/><circle cx="461" cy="101" r="2.2" class="fg sg"/><circle cx="419" cy="104" r="2.2" class="fb sb"/><circle cx="451" cy="76" r="2.2" class="fg sg"/><circle cx="398" cy="89" r="2.2" class="fb sb"/><circle cx="424" cy="63" r="2.2" class="fg sg"/><circle cx="563" cy="152" r="2.2" class="fr sr"/><circle cx="413" cy="96" r="2.2" class="fb sb"/><circle cx="564" cy="156" r="2.2" class="fr sr"/><circle cx="413" cy="52" r="2.2" class="fg sg"/><circle cx="473" cy="114" r="2.2" class="fg sg"/><circle cx="554" cy="155" r="2.2" class="fr sr"/><circle cx="408" cy="58" r="2.2" class="fg sg"/><circle cx="577" cy="167" r="2.2" class="fr sr"/><circle cx="520" cy="123" r="2.2" class="fr sr"/><circle cx="435" cy="84" r="2.2" class="fg sg"/><circle cx="388" cy="76" r="2.2" class="fb sb"/><circle cx="436" cy="80" r="2.2" class="fg sg"/><circle cx="419" cy="108" r="2.2" class="fb sb"/><circle cx="399" cy="51" r="2.2" class="fg sg"/><circle cx="558" cy="156" r="2.2" class="fr sr"/><circle cx="423" cy="123" r="2.2" class="fb sb"/><circle cx="558" cy="158" r="2.2" class="fr sr"/><circle cx="456" cy="143" r="2.2" class="fb sb"/><circle cx="531" cy="120" r="2.2" class="fr sr"/><circle cx="399" cy="80" r="2.2" class="fb sb"/><circle cx="431" cy="73" r="2.2" class="fg sg"/><circle cx="437" cy="83" r="2.2" class="fg sg"/><circle cx="432" cy="64" r="2.2" class="fg sg"/><circle cx="441" cy="80" r="2.2" class="fg sg"/><circle cx="397" cy="88" r="2.2" class="fb sb"/><circle cx="477" cy="156" r="2.2" class="fb sb"/><circle cx="560" cy="151" r="2.2" class="fr sr"/><circle cx="565" cy="165" r="2.2" class="fr sr"/><circle cx="548" cy="146" r="2.2" class="fr sr"/><circle cx="439" cy="79" r="2.2" class="fg sg"/><circle cx="589" cy="182" r="2.2" class="fr sr"/><circle cx="553" cy="156" r="2.2" class="fr sr"/><circle cx="565" cy="163" r="2.2" class="fr sr"/><circle cx="540" cy="143" r="2.2" class="fr sr"/><circle cx="568" cy="170" r="2.2" class="fr sr"/><circle cx="547" cy="134" r="2.2" class="fr sr"/><circle cx="387" cy="90" r="2.2" class="fb sb"/><circle cx="386" cy="88" r="2.2" class="fb sb"/><circle cx="441" cy="118" r="2.2" class="fb sb"/><circle cx="558" cy="155" r="2.2" class="fr sr"/><circle cx="449" cy="85" r="2.2" class="fg sg"/><circle cx="573" cy="164" r="2.2" class="fr sr"/><circle cx="471" cy="151" r="2.2" class="fb sb"/><circle cx="573" cy="181" r="2.2" class="fr sr"/><circle cx="418" cy="65" r="2.2" class="fg sg"/><circle cx="438" cy="86" r="2.2" class="fg sg"/><circle cx="571" cy="157" r="2.2" class="fr sr"/><circle cx="463" cy="159" r="2.2" class="fb sb"/><circle cx="406" cy="109" r="2.2" class="fb sb"/><circle cx="552" cy="148" r="2.2" class="fr sr"/><circle cx="533" cy="136" r="2.2" class="fr sr"/><circle cx="448" cy="140" r="2.2" class="fb sb"/><circle cx="454" cy="88" r="2.2" class="fg sg"/><circle cx="413" cy="51" r="2.2" class="fg sg"/><circle cx="402" cy="58" r="2.2" class="fg sg"/><circle cx="454" cy="93" r="2.2" class="fg sg"/><circle cx="587" cy="178" r="2.2" class="fr sr"/><circle cx="465" cy="94" r="2.2" class="fg sg"/><circle cx="462" cy="96" r="2.2" class="fg sg"/><circle cx="402" cy="93" r="2.2" class="fb sb"/><circle cx="465" cy="146" r="2.2" class="fb sb"/><circle cx="456" cy="90" r="2.2" class="fg sg"/><circle cx="421" cy="60" r="2.2" class="fg sg"/><circle cx="409" cy="95" r="2.2" class="fb sb"/><circle cx="446" cy="126" r="2.2" class="fb sb"/><circle cx="406" cy="99" r="2.2" class="fb sb"/><circle cx="434" cy="82" r="2.2" class="fg sg"/><circle cx="430" cy="78" r="2.2" class="fg sg"/><circle cx="445" cy="148" r="2.2" class="fb sb"/><circle cx="432" cy="70" r="2.2" class="fg sg"/><circle cx="440" cy="134" r="2.2" class="fb sb"/><circle cx="526" cy="134" r="2.2" class="fr sr"/><circle cx="430" cy="112" r="2.2" class="fb sb"/><circle cx="468" cy="146" r="2.2" class="fb sb"/><circle cx="438" cy="70" r="2.2" class="fg sg"/><circle cx="547" cy="143" r="2.2" class="fr sr"/><circle cx="449" cy="108" r="2.2" class="fg sg"/><circle cx="375" cy="78" r="2.2" class="fb sb"/><circle cx="432" cy="64" r="2.2" class="fg sg"/><circle cx="432" cy="73" r="2.2" class="fg sg"/><circle cx="455" cy="91" r="2.2" class="fg sg"/><circle cx="443" cy="135" r="2.2" class="fb sb"/><circle cx="416" cy="100" r="2.2" class="fb sb"/><circle cx="433" cy="78" r="2.2" class="fg sg"/><circle cx="412" cy="102" r="2.2" class="fb sb"/><circle cx="615" cy="198" r="2.2" class="fr sr"/><circle cx="457" cy="90" r="2.2" class="fg sg"/><circle cx="421" cy="63" r="2.2" class="fg sg"/><circle cx="395" cy="101" r="2.2" class="fb sb"/><circle cx="542" cy="147" r="2.2" class="fr sr"/><circle cx="535" cy="142" r="2.2" class="fr sr"/><circle cx="574" cy="163" r="2.2" class="fr sr"/><circle cx="409" cy="96" r="2.2" class="fb sb"/><circle cx="432" cy="116" r="2.2" class="fb sb"/><circle cx="441" cy="90" r="2.2" class="fg sg"/><circle cx="442" cy="79" r="2.2" class="fg sg"/><circle cx="409" cy="100" r="2.2" class="fb sb"/><circle cx="426" cy="125" r="2.2" class="fb sb"/><circle cx="567" cy="157" r="2.2" class="fr sr"/><circle cx="541" cy="145" r="2.2" class="fr sr"/><circle cx="445" cy="131" r="2.2" class="fb sb"/><circle cx="580" cy="177" r="2.2" class="fr sr"/><circle cx="556" cy="152" r="2.2" class="fr sr"/><circle cx="446" cy="89" r="2.2" class="fg sg"/><circle cx="562" cy="149" r="2.2" class="fr sr"/><circle cx="424" cy="71" r="2.2" class="fg sg"/><circle cx="440" cy="91" r="2.2" class="fg sg"/><circle cx="426" cy="113" r="2.2" class="fb sb"/><circle cx="446" cy="84" r="2.2" class="fg sg"/><circle cx="446" cy="88" r="2.2" class="fg sg"/><circle cx="403" cy="59" r="2.2" class="fg sg"/><circle cx="444" cy="140" r="2.2" class="fb sb"/><circle cx="425" cy="70" r="2.2" class="fg sg"/><circle cx="561" cy="159" r="2.2" class="fr sr"/><circle cx="431" cy="73" r="2.2" class="fg sg"/><circle cx="433" cy="88" r="2.2" class="fg sg"/><circle cx="581" cy="163" r="2.2" class="fr sr"/><circle cx="529" cy="138" r="2.2" class="fr sr"/><circle cx="407" cy="57" r="2.2" class="fg sg"/><circle cx="475" cy="164" r="2.2" class="fb sb"/><circle cx="535" cy="143" r="2.2" class="fr sr"/><circle cx="575" cy="164" r="2.2" class="fr sr"/><circle cx="420" cy="122" r="2.2" class="fb sb"/><circle cx="461" cy="148" r="2.2" class="fb sb"/><circle cx="423" cy="74" r="2.2" class="fg sg"/><circle cx="456" cy="94" r="2.2" class="fg sg"/><circle cx="382" cy="84" r="2.2" class="fb sb"/><circle cx="463" cy="101" r="2.2" class="fg sg"/><circle cx="410" cy="55" r="2.2" class="fg sg"/><circle cx="456" cy="94" r="2.2" class="fg sg"/><circle cx="561" cy="151" r="2.2" class="fr sr"/><circle cx="556" cy="161" r="2.2" class="fr sr"/><circle cx="540" cy="146" r="2.2" class="fr sr"/><circle cx="436" cy="124" r="2.2" class="fb sb"/><circle cx="402" cy="45" r="2.2" class="fg sg"/><circle cx="590" cy="185" r="2.2" class="fr sr"/><circle cx="384" cy="74" r="2.2" class="fb sb"/><circle cx="557" cy="157" r="2.2" class="fr sr"/><circle cx="396" cy="49" r="2.2" class="fg sg"/><circle cx="540" cy="151" r="2.2" class="fr sr"/><circle cx="542" cy="146" r="2.2" class="fr sr"/><circle cx="546" cy="147" r="2.2" class="fr sr"/><circle cx="528" cy="130" r="2.2" class="fr sr"/><circle cx="459" cy="156" r="2.2" class="fb sb"/><circle cx="585" cy="176" r="2.2" class="fr sr"/><circle cx="395" cy="89" r="2.2" class="fb sb"/><circle cx="464" cy="98" r="2.2" class="fg sg"/><circle cx="572" cy="170" r="2.2" class="fr sr"/><circle cx="426" cy="64" r="2.2" class="fg sg"/><circle cx="595" cy="185" r="2.2" class="fr sr"/><circle cx="590" cy="178" r="2.2" class="fr sr"/><circle cx="395" cy="97" r="2.2" class="fb sb"/><circle cx="428" cy="64" r="2.2" class="fg sg"/><circle cx="560" cy="151" r="2.2" class="fr sr"/><circle cx="475" cy="161" r="2.2" class="fb sb"/><circle cx="557" cy="153" r="2.2" class="fr sr"/><circle cx="550" cy="149" r="2.2" class="fr sr"/><circle cx="438" cy="125" r="2.2" class="fb sb"/><circle cx="571" cy="157" r="2.2" class="fr sr"/><circle cx="431" cy="71" r="2.2" class="fg sg"/><circle cx="531" cy="126" r="2.2" class="fr sr"/><circle cx="449" cy="82" r="2.2" class="fg sg"/><circle cx="378" cy="35" r="2.2" class="fg sg"/><circle cx="401" cy="51" r="2.2" class="fg sg"/><circle cx="427" cy="82" r="2.2" class="fg sg"/><circle cx="555" cy="153" r="2.2" class="fr sr"/><circle cx="420" cy="112" r="2.2" class="fb sb"/><circle cx="432" cy="123" r="2.2" class="fb sb"/><circle cx="412" cy="111" r="2.2" class="fb sb"/><circle cx="433" cy="120" r="2.2" class="fb sb"/><circle cx="550" cy="153" r="2.2" class="fr sr"/><circle cx="433" cy="70" r="2.2" class="fg sg"/><circle cx="595" cy="176" r="2.2" class="fr sr"/><circle cx="452" cy="96" r="2.2" class="fg sg"/><circle cx="401" cy="98" r="2.2" class="fb sb"/><circle cx="427" cy="68" r="2.2" class="fg sg"/><circle cx="558" cy="161" r="2.2" class="fr sr"/><circle cx="345" cy="45" r="2.2" class="fb sb"/><circle cx="417" cy="99" r="2.2" class="fb sb"/><circle cx="563" cy="160" r="2.2" class="fr sr"/><circle cx="528" cy="114" r="2.2" class="fr sr"/><circle cx="538" cy="139" r="2.2" class="fr sr"/><circle cx="466" cy="104" r="2.2" class="fg sg"/><circle cx="584" cy="173" r="2.2" class="fr sr"/><circle cx="446" cy="87" r="2.2" class="fg sg"/><circle cx="545" cy="156" r="2.2" class="fr sr"/><circle cx="420" cy="107" r="2.2" class="fb sb"/><circle cx="570" cy="167" r="2.2" class="fr sr"/><circle cx="427" cy="112" r="2.2" class="fb sb"/><circle cx="518" cy="128" r="2.2" class="fr sr"/><circle cx="445" cy="131" r="2.2" class="fb sb"/><circle cx="430" cy="126" r="2.2" class="fb sb"/><circle cx="439" cy="139" r="2.2" class="fb sb"/><circle cx="436" cy="77" r="2.2" class="fg sg"/><circle cx="467" cy="93" r="2.2" class="fg sg"/><circle cx="583" cy="178" r="2.2" class="fr sr"/><circle cx="440" cy="75" r="2.2" class="fg sg"/><circle cx="550" cy="140" r="2.2" class="fr sr"/><circle cx="402" cy="96" r="2.2" class="fb sb"/><circle cx="460" cy="127" r="2.2" class="fb sb"/><circle cx="439" cy="82" r="2.2" class="fg sg"/><circle cx="577" cy="169" r="2.2" class="fr sr"/><circle cx="417" cy="108" r="2.2" class="fb sb"/><circle cx="441" cy="87" r="2.2" class="fg sg"/><circle cx="569" cy="156" r="2.2" class="fr sr"/><circle cx="482" cy="107" r="2.2" class="fg sg"/><circle cx="416" cy="63" r="2.2" class="fg sg"/><circle cx="413" cy="113" r="2.2" class="fb sb"/><circle cx="434" cy="123" r="2.2" class="fb sb"/><circle cx="406" cy="44" r="2.2" class="fg sg"/><circle cx="451" cy="134" r="2.2" class="fb sb"/><circle cx="537" cy="143" r="2.2" class="fr sr"/><circle cx="571" cy="164" r="2.2" class="fr sr"/><circle cx="554" cy="144" r="2.2" class="fr sr"/><circle cx="474" cy="106" r="2.2" class="fg sg"/><circle cx="425" cy="75" r="2.2" class="fg sg"/><circle cx="452" cy="140" r="2.2" class="fb sb"/><circle cx="446" cy="137" r="2.2" class="fb sb"/><circle cx="419" cy="119" r="2.2" class="fb sb"/><circle cx="588" cy="180" r="2.2" class="fr sr"/><circle cx="574" cy="164" r="2.2" class="fr sr"/><circle cx="596" cy="188" r="2.2" class="fr sr"/><circle cx="463" cy="93" r="2.2" class="fg sg"/><circle cx="461" cy="99" r="2.2" class="fg sg"/><circle cx="540" cy="142" r="2.2" class="fr sr"/><circle cx="575" cy="167" r="2.2" class="fr sr"/><circle cx="401" cy="104" r="2.2" class="fb sb"/><circle cx="474" cy="162" r="2.2" class="fb sb"/><circle cx="399" cy="97" r="2.2" class="fb sb"/><circle cx="595" cy="186" r="2.2" class="fr sr"/><circle cx="433" cy="65" r="2.2" class="fg sg"/><circle cx="550" cy="153" r="2.2" class="fr sr"/><circle cx="553" cy="143" r="2.2" class="fr sr"/><circle cx="434" cy="126" r="2.2" class="fb sb"/><circle cx="591" cy="187" r="2.2" class="fr sr"/><circle cx="423" cy="109" r="2.2" class="fb sb"/><circle cx="603" cy="187" r="2.2" class="fr sr"/><circle cx="463" cy="88" r="2.2" class="fg sg"/><circle cx="447" cy="125" r="2.2" class="fb sb"/><circle cx="479" cy="108" r="2.2" class="fg sg"/><circle cx="391" cy="104" r="2.2" class="fb sb"/><circle cx="451" cy="89" r="2.2" class="fg sg"/><circle cx="540" cy="145" r="2.2" class="fr sr"/><circle cx="418" cy="60" r="2.2" class="fg sg"/><circle cx="435" cy="81" r="2.2" class="fg sg"/><circle cx="577" cy="171" r="2.2" class="fr sr"/><circle cx="585" cy="175" r="2.2" class="fr sr"/><circle cx="440" cy="83" r="2.2" class="fg sg"/><circle cx="425" cy="57" r="2.2" class="fg sg"/><circle cx="390" cy="40" r="2.2" class="fg sg"/><circle cx="451" cy="82" r="2.2" class="fg sg"/><circle cx="474" cy="115" r="2.2" class="fg sg"/><circle cx="564" cy="163" r="2.2" class="fr sr"/><circle cx="580" cy="173" r="2.2" class="fr sr"/><circle cx="566" cy="167" r="2.2" class="fr sr"/><circle cx="460" cy="145" r="2.2" class="fb sb"/><circle cx="394" cy="94" r="2.2" class="fb sb"/><circle cx="425" cy="119" r="2.2" class="fb sb"/><circle cx="446" cy="126" r="2.2" class="fb sb"/><circle cx="390" cy="34" r="2.2" class="fg sg"/><circle cx="425" cy="67" r="2.2" class="fg sg"/><circle cx="535" cy="131" r="2.2" class="fr sr"/><circle cx="447" cy="128" r="2.2" class="fb sb"/><circle cx="400" cy="97" r="2.2" class="fb sb"/><circle cx="453" cy="144" r="2.2" class="fb sb"/><circle cx="420" cy="76" r="2.2" class="fg sg"/><circle cx="538" cy="135" r="2.2" class="fr sr"/><circle cx="476" cy="111" r="2.2" class="fg sg"/><circle cx="417" cy="50" r="2.2" class="fg sg"/><circle cx="573" cy="171" r="2.2" class="fr sr"/><circle cx="415" cy="53" r="2.2" class="fg sg"/><circle cx="568" cy="169" r="2.2" class="fr sr"/><circle cx="429" cy="62" r="2.2" class="fg sg"/>
<g transform="translate(424.2,115.2) scale(31.71,-20.34) rotate(125.7)"><ellipse cx="0" cy="0" rx="2.622" ry="0.391" fill="none" stroke="currentColor" stroke-width="0.038" stroke-dasharray="0.126 0.095"/></g>
<g transform="translate(557.6,153.6) scale(31.71,-20.34) rotate(126.4)"><ellipse cx="0" cy="0" rx="2.265" ry="0.362" fill="none" stroke="currentColor" stroke-width="0.038" stroke-dasharray="0.126 0.095"/></g>
<g transform="translate(438.1,79.4) scale(31.71,-20.34) rotate(125.8)"><ellipse cx="0" cy="0" rx="2.253" ry="0.405" fill="none" stroke="currentColor" stroke-width="0.038" stroke-dasharray="0.126 0.095"/></g>
<line x1="320" y1="26" x2="320" y2="206" stroke="currentColor" stroke-opacity="0.2"/>
<text x="160" y="226" text-anchor="middle" class="tm" font-size="11">straight cuts through stretched clouds</text>
<text x="480" y="226" text-anchor="middle" class="tm" font-size="11">each cloud = one tilted ellipse (dashed: 2 std devs)</text>
</svg><figcaption>600 points in three stretched, tilted clouds (every second point drawn). K-Means can only describe round groups; a Gaussian mixture learns the shape and tilt of each cloud.</figcaption></figure>
  <p>On stretched clouds K-Means cuts across them (0.580) while the mixture recovers them perfectly (1.000), because each component learned the tilt of its cloud. On unequal clouds K-Means moves its border toward the middle and steals points from the big cloud (0.166); the mixture knows one cloud is wide and one narrow (0.902).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Soft" does not mean "always uncertain". Most points in well-separated data get probabilities like 0.999. The value of soft assignment is in the few points that really are in between, and in knowing which ones those are.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> what exactly is a "probability cloud", and how do we write one down with numbers? <b>Next: the Gaussian.</b></div>

  <h2 id="gm-gauss"><span class="num">02</span>The Gaussian: One Bell Curve</h2>
  <p><strong>The question we can't answer yet.</strong> To say "how likely is it that group k produced this point" we need a formula that turns a position into a likelihood. What formula describes one group?</p>
  <h3>The formula, piece by piece</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Normal (Gaussian) density</strong> with mean μ and variance σ²:<br>N(x | μ, σ²) = 1 / √(2πσ²) · exp( −(x − μ)² / (2σ²) )<br>(x − μ)² is the squared distance from the centre; dividing by 2σ² measures it in units of the spread; exp(−…) turns "far" into "small"; the front factor 1/√(2πσ²) makes the total area under the curve equal 1.</p>
  </div>
  <p>Two consequences matter for clustering. The density is highest at μ and falls off symmetrically. And a narrow bell (small σ²) is taller at its centre but drops much faster: being 2 units from the centre is ordinary for a wide bell and very unlikely for a narrow one. (More on the normal distribution in <a class="xref" data-note="st_distributions">Distributions</a>.)</p>
  <h3>By hand: a bell with μ = 2, σ² = 4 (σ = 2)</h3>
  <p>The front factor is 1/√(2π · 4) = 1/√25.13 = 1/5.013 = 0.1995. Then for each user:</p>
  <table class="tbl">
    <tr><th>x</th><th>(x − 2)²</th><th>/ (2·4) = /8</th><th>exp(−…)</th><th>× 0.1995 = N(x | 2, 4)</th></tr>
    <tr><td>1</td><td>1</td><td>0.125</td><td>0.8825</td><td>0.1760</td></tr>
    <tr><td>2</td><td>0</td><td>0</td><td>1</td><td>0.1995</td></tr>
    <tr><td>3</td><td>1</td><td>0.125</td><td>0.8825</td><td>0.1760</td></tr>
    <tr><td>5</td><td>9</td><td>1.125</td><td>0.3247</td><td>0.0648</td></tr>
    <tr><td>8</td><td>36</td><td>4.5</td><td>0.0111</td><td>0.0022</td></tr>
    <tr><td>9</td><td>49</td><td>6.125</td><td>0.0022</td><td>0.0004</td></tr>
  </table>
  <p>A second bell with μ = 8, σ² = 4 is the mirror image: 0.1995 at 8, 0.1760 at 9, 0.0648 at 5, and so on. These two bells are the starting guess we will use for the mixture.</p>
  <div class="fx" data-lang="py">def normal_pdf(x, mu, var):
    return np.exp(-(x - mu) ** 2 / (2 * var)) / np.sqrt(2 * np.pi * var)

print("N(x | mu=2, var=4):", {int(v): round(float(normal_pdf(v, 2, 4)), 4) for v in x})
print("N(x | mu=8, var=4):", {int(v): round(float(normal_pdf(v, 8, 4)), 4) for v in x})</div>
  <div class="fx" data-lang="text">N(x | mu=2, var=4): {1: 0.176, 2: 0.1995, 3: 0.176, 5: 0.0648, 8: 0.0022, 9: 0.0004}
N(x | mu=8, var=4): {1: 0.0004, 2: 0.0022, 3: 0.0088, 5: 0.0648, 8: 0.1995, 9: 0.176}</div>
  <h3>Fitting one bell to data</h3>
  <p>If all six users came from one bell, the best μ and σ² (the <strong>maximum-likelihood estimates</strong>) are simply the mean and the variance with division by n: μ = (1+2+3+5+8+9)/6 = 28/6 = 4.667; σ² = mean of squared deviations = 8.889. The <strong>log-likelihood</strong>, LL = Σ log N(xᵢ | μ, σ²), measures how well the bell explains the data (higher is better; it is a sum of logs of small numbers, so it is negative).</p>
  <div class="fx" data-lang="py">mu_all, var_all = x.mean(), x.var()               # MLE: plain mean, variance divided by n
print(f"one Gaussian: mean={mu_all:.3f}  variance={var_all:.3f}  std={np.sqrt(var_all):.3f}")
print("density at each user:", normal_pdf(x, mu_all, var_all).round(4))
print("log-likelihood:", round(float(np.log(normal_pdf(x, mu_all, var_all)).sum()), 4))</div>
  <div class="fx" data-lang="text">one Gaussian: mean=4.667  variance=8.889  std=2.981
density at each user: [0.0628 0.0897 0.1145 0.133  0.0716 0.0465]
log-likelihood: -15.068</div>
  <p>The single bell puts its highest density (0.133) at U4, the one user who is <em>not</em> typical, and spreads thinly over the real groups. Its LL is −15.068; keep that number, we will beat it.</p>
  <h3>In more dimensions: the covariance matrix</h3>
  <p>With d columns a Gaussian has a mean vector μ (d numbers) and a <strong>covariance matrix</strong> Σ (d × d): the diagonal holds each column's variance, the off-diagonal entries the covariances (how two columns move together). By hand for four 2-D points (1,1), (2,2), (3,2), (4,3): means 2.5 and 2; deviations x: −1.5, −0.5, 0.5, 1.5 and y: −1, 0, 0, 1. var(x) = (2.25+0.25+0.25+2.25)/4 = 1.25; var(y) = (1+0+0+1)/4 = 0.5; cov(x, y) = (1.5+0+0+1.5)/4 = 0.75.</p>
  <div class="fx" data-lang="py">Q = np.array([[1, 1], [2, 2], [3, 2], [4, 3]], dtype=float)
print("mean      :", Q.mean(0))
print("covariance (divide by n):\\n", np.cov(Q.T, bias=True))</div>
  <div class="fx" data-lang="text">mean      : [2.5 2. ]
covariance (divide by n):
 [[1.25 0.75]
 [0.75 0.5 ]]</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multivariate normal density</strong>: N(x | μ, Σ) = (2π)^(−d/2) |Σ|^(−1/2) exp( −½ (x − μ)ᵀ Σ⁻¹ (x − μ) ). The quantity (x − μ)ᵀ Σ⁻¹ (x − μ) is the squared <strong>Mahalanobis distance</strong>: distance measured in "standard deviations along the cloud's own axes". Its contours are ellipses; the positive covariance 0.75 above tilts the ellipse up and to the right.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A density is not a probability. N(8 | 8, 0.25) = 0.80 and with a very small variance it can exceed 1. Only areas under the curve are probabilities. That is why log-likelihoods can even become positive, and why a bell squeezed onto one point can make the likelihood explode (section 06).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> one bell cannot describe two humps; it put its peak on the one atypical user. <b>Next: mix several bells.</b></div>

  <h2 id="gm-mix"><span class="num">03</span>The Mixture: Several Weighted Bells</h2>
  <p><strong>The question we can't answer yet.</strong> The data has two humps but a Gaussian has one. How do we write a density with two (or k) humps?</p>
  <h3>The generative story</h3>
  <p>Imagine how the data was produced. For each user, first roll a weighted die to decide which kind they are: "casual" with probability π₁, "keen" with probability π₂. Then draw their minutes from that kind's bell. The die result zᵢ is a <strong>latent</strong> (hidden) variable: it happened, but we never see it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gaussian mixture</strong> with k components: p(x) = Σₖ πₖ · N(x | μₖ, Σₖ), with mixing weights πₖ ≥ 0 and Σ πₖ = 1.<br>πₖ = P(z = k), the share of points from component k; N(x | μₖ, Σₖ) = p(x | z = k). The mixture is just the law of total probability: p(x) = Σₖ P(z = k) p(x | z = k).</p>
  </div>
  <h3>By hand at the starting guess</h3>
  <p>Start with π = (0.5, 0.5), μ = (2, 8), σ² = (4, 4). Multiply each bell's density from section 02 by its weight 0.5 and add:</p>
  <table class="tbl">
    <tr><th>User</th><th>x</th><th>0.5 · N(x | 2, 4)</th><th>0.5 · N(x | 8, 4)</th><th>p(x) = sum</th><th>log p(x)</th></tr>
    <tr><td>U1</td><td>1</td><td>0.0880</td><td>0.0002</td><td>0.0882</td><td>−2.428</td></tr>
    <tr><td>U2</td><td>2</td><td>0.0997</td><td>0.0011</td><td>0.1008</td><td>−2.294</td></tr>
    <tr><td>U3</td><td>3</td><td>0.0880</td><td>0.0044</td><td>0.0924</td><td>−2.382</td></tr>
    <tr><td>U4</td><td>5</td><td>0.0324</td><td>0.0324</td><td>0.0648</td><td>−2.736</td></tr>
    <tr><td>U5</td><td>8</td><td>0.0011</td><td>0.0997</td><td>0.1008</td><td>−2.294</td></tr>
    <tr><td>U6</td><td>9</td><td>0.0002</td><td>0.0880</td><td>0.0882</td><td>−2.428</td></tr>
    <tr><td colspan="5"><strong>log-likelihood LL = Σ log p(xᵢ)</strong></td><td><strong>−14.563</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">pi0, mu0, var0 = np.array([0.5, 0.5]), np.array([2.0, 8.0]), np.array([4.0, 4.0])
dens = pi0 * normal_pdf(x[:, None], mu0, var0)      # pi_k * N(x_i | mu_k, var_k), shape (6, 2)
p = dens.sum(1)                                     # mixture density at each user
print("pi*N, component 1:", dens[:, 0].round(4))
print("pi*N, component 2:", dens[:, 1].round(4))
print("mixture p(x)     :", p.round(4))
print("log-likelihood of the 6 users:", round(float(np.log(p).sum()), 4))</div>
  <div class="fx" data-lang="text">pi*N, component 1: [0.088  0.0997 0.088  0.0324 0.0011 0.0002]
pi*N, component 2: [0.0002 0.0011 0.0044 0.0324 0.0997 0.088 ]
mixture p(x)     : [0.0882 0.1008 0.0924 0.0648 0.1008 0.0882]
log-likelihood of the 6 users: -14.5626</div>
  <p>Even this rough guess (−14.563) already beats the best single bell (−15.068). The mixture puts density where the users are (around 2 and 8) and less at 5.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Fitting a GMM means finding the π, μ and σ² that make LL as large as possible: the parameters under which the observed data is most probable. The difficulty is that LL = Σᵢ log Σₖ πₖ N(xᵢ | k) has a <em>sum inside the log</em>, so setting derivatives to zero gives no closed-form answer, unlike the single bell (mean and variance).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we have a density for the whole data, but not the clustering: how much does each user belong to each bell? <b>Next: responsibilities.</b></div>

  <h2 id="gm-soft"><span class="num">04</span>Soft vs Hard Assignment: Responsibilities</h2>
  <p><strong>The question we can't answer yet.</strong> The mixture tells us p(x), the chance of seeing a user with x minutes. For clustering we need the reverse: given that we saw x, what is the chance the user is casual, or keen?</p>
  <h3>Bayes' rule</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Responsibility</strong> of component k for point i:<br>rᵢₖ = P(zᵢ = k | xᵢ) = πₖ N(xᵢ | μₖ, σₖ²) / Σⱼ πⱼ N(xᵢ | μⱼ, σⱼ²)<br>Numerator: prior share × how well bell k explains xᵢ. Denominator: p(xᵢ), the same for all k, so the rᵢₖ of a point add up to 1. A <strong>hard assignment</strong> takes the largest: label = argmaxₖ rᵢₖ.</p>
  </div>
  <h3>By hand</h3>
  <p>Divide each column of the section 03 table by the p(x) column. For U3: 0.0880 / 0.0924 = 0.953 casual, 0.0044 / 0.0924 = 0.047 keen. For U4: 0.0324 / 0.0648 = 0.5 each.</p>
  <div class="fx" data-lang="py">r = dens / dens.sum(1, keepdims=True)               # responsibilities: each row sums to 1
for xi, (r1, r2) in zip(x, r):
    print(f"x={xi:.0f}  r1={r1:.3f}  r2={r2:.3f}  hard label={1 if r1 &gt;= r2 else 2}")
r0 = r.copy()                                       # keep the starting responsibilities</div>
  <div class="fx" data-lang="text">x=1  r1=0.998  r2=0.002  hard label=1
x=2  r1=0.989  r2=0.011  hard label=1
x=3  r1=0.953  r2=0.047  hard label=1
x=5  r1=0.500  r2=0.500  hard label=1
x=8  r1=0.011  r2=0.989  hard label=2
x=9  r1=0.002  r2=0.998  hard label=2</div>
  <table class="tbl">
    <tr><th>User</th><th>U1</th><th>U2</th><th>U3</th><th>U4</th><th>U5</th><th>U6</th></tr>
    <tr><td>r₁ (casual)</td><td>0.998</td><td>0.989</td><td>0.953</td><td><strong>0.500</strong></td><td>0.011</td><td>0.002</td></tr>
    <tr><td>r₂ (keen)</td><td>0.002</td><td>0.011</td><td>0.047</td><td><strong>0.500</strong></td><td>0.989</td><td>0.998</td></tr>
  </table>
  <p>The soft answer says what K-Means could not: under these parameters U4 is a coin flip. The hard label "1" for U4 is an arbitrary tie-break and throws that information away.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's differential diagnosis: "70% viral, 25% bacterial, 5% allergy" is more useful than just "viral", because it tells you how confident to be and when to run another test.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Responsibilities are not "closeness to the centre". They also depend on the widths and weights: a point can be nearer to a narrow bell's centre and still belong mostly to a wide bell (we will see U4 do exactly this in section 05, where it ends up 2.25 from one centre and 3.5 from the other, yet 100% in the wide casual bell because the keen bell becomes very narrow).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> responsibilities need the parameters (π, μ, σ²), but the parameters we used were a guess. To estimate the parameters we would need to know who belongs where. Chicken and egg. <b>Next: the EM algorithm.</b></div>

  <h2 id="gm-em"><span class="num">05</span>The EM Algorithm</h2>
  <p><strong>The question we can't answer yet.</strong> If we knew each user's group, fitting the bells would be easy (mean and variance per group). If we knew the bells, the groups would be easy (responsibilities). We know neither. How do we get both?</p>
  <h3>The idea: alternate</h3>
  <p>Guess the bells. Compute soft groups from them (the <strong>E-step</strong>, for Expectation). Re-fit each bell to its soft group, every point weighted by its responsibility (the <strong>M-step</strong>, for Maximisation). Repeat until nothing changes. Each round can only improve (or keep) the log-likelihood.</p>
  <div class="flow"><span>Initial π, μ, σ²</span><span>E: rᵢₖ by Bayes' rule</span><span>M: weighted counts, means, variances</span><span>LL went up? repeat</span><span>Stop when LL stops rising</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>E-step</strong>: rᵢₖ = πₖ N(xᵢ | μₖ, σₖ²) / Σⱼ πⱼ N(xᵢ | μⱼ, σⱼ²).<br><strong>M-step</strong>: Nₖ = Σᵢ rᵢₖ (effective number of points in k)<br>πₖ = Nₖ / n · μₖ = (1/Nₖ) Σᵢ rᵢₖ xᵢ · σₖ² = (1/Nₖ) Σᵢ rᵢₖ (xᵢ − μₖ)² (with the new μₖ)<br>In d dimensions: Σₖ = (1/Nₖ) Σᵢ rᵢₖ (xᵢ − μₖ)(xᵢ − μₖ)ᵀ.</p>
  </div>
  <p>The M-step formulas are just "mean and variance of a group" where each point counts as a fraction rᵢₖ of a point. With hard 0/1 responsibilities they become the ordinary per-group mean and variance.</p>
  <h3>One full iteration by hand</h3>
  <p>The E-step was section 04. Now the M-step for component 1 (casual), using r₁ = 0.998, 0.989, 0.953, 0.5, 0.011, 0.002:</p>
  <table class="tbl">
    <tr><th>User</th><th>x</th><th>r₁</th><th>r₁ · x</th><th>(x − 2.446)²</th><th>r₁ · (x − 2.446)²</th><th>r₂</th><th>r₂ · x</th><th>(x − 7.677)²</th><th>r₂ · (x − 7.677)²</th></tr>
    <tr><td>U1</td><td>1</td><td>0.998</td><td>0.998</td><td>2.091</td><td>2.087</td><td>0.002</td><td>0.002</td><td>44.58</td><td>0.089</td></tr>
    <tr><td>U2</td><td>2</td><td>0.989</td><td>1.978</td><td>0.199</td><td>0.197</td><td>0.011</td><td>0.022</td><td>32.23</td><td>0.355</td></tr>
    <tr><td>U3</td><td>3</td><td>0.953</td><td>2.859</td><td>0.307</td><td>0.292</td><td>0.047</td><td>0.141</td><td>21.87</td><td>1.028</td></tr>
    <tr><td>U4</td><td>5</td><td>0.500</td><td>2.500</td><td>6.523</td><td>3.261</td><td>0.500</td><td>2.500</td><td>7.166</td><td>3.583</td></tr>
    <tr><td>U5</td><td>8</td><td>0.011</td><td>0.088</td><td>30.85</td><td>0.339</td><td>0.989</td><td>7.912</td><td>0.104</td><td>0.103</td></tr>
    <tr><td>U6</td><td>9</td><td>0.002</td><td>0.018</td><td>42.95</td><td>0.086</td><td>0.998</td><td>8.982</td><td>1.750</td><td>1.747</td></tr>
    <tr><td colspan="2"><strong>Sum</strong></td><td><strong>N₁ = 3.453</strong></td><td><strong>8.441</strong></td><td></td><td><strong>6.262</strong></td><td><strong>N₂ = 2.547</strong></td><td><strong>19.559</strong></td><td></td><td><strong>6.905</strong></td></tr>
  </table>
  <ul>
    <li>Weights: π₁ = 3.453 / 6 = <strong>0.575</strong>, π₂ = 2.547 / 6 = <strong>0.425</strong>. U4's half counts toward both groups.</li>
    <li>Means: μ₁ = 8.441 / 3.453 = <strong>2.445</strong>; μ₂ = 19.559 / 2.547 = <strong>7.679</strong>. Both moved toward U4, which pulls each with weight 0.5.</li>
    <li>Variances: σ₁² = 6.262 / 3.453 = <strong>1.813</strong>; σ₂² = 6.905 / 2.547 = <strong>2.711</strong>. Both shrank from 4, because each group is tighter than the guess.</li>
  </ul>
  <p>(The code below keeps full precision in r and gets μ = 2.446, 7.677 and σ² = 1.819, 2.722; the small differences come only from rounding r to three decimals by hand.)</p>
  <div class="fx" data-lang="py">Nk = r.sum(0)                                       # "effective number" of users per component
pi1 = Nk / len(x)
mu1 = (r * x[:, None]).sum(0) / Nk                  # responsibility-weighted means
var1 = (r * (x[:, None] - mu1) ** 2).sum(0) / Nk    # weighted variances around the NEW means
print("N_k :", Nk.round(3))
print("pi  :", pi1.round(3))
print("mu  :", mu1.round(3))
print("var :", var1.round(3))
ll1 = np.log((pi1 * normal_pdf(x[:, None], mu1, var1)).sum(1)).sum()
print("log-likelihood before", round(float(np.log(p).sum()), 4), "-&gt; after one EM step", round(float(ll1), 4))</div>
  <div class="fx" data-lang="text">N_k : [3.453 2.547]
pi  : [0.575 0.425]
mu  : [2.446 7.677]
var : [1.819 2.722]
log-likelihood before -14.5626 -&gt; after one EM step -13.7901</div>
  <p>The log-likelihood rose from −14.563 to −13.790 in one step. That is guaranteed: EM never decreases it.</p>
  <h3>Running to convergence</h3>
  <p><code>em_1d</code> repeats the two steps and stops when LL improves by less than <code>tol</code>. It prints the parameters after each M-step together with the LL of the parameters going into that step.</p>
  <div class="fx" data-lang="py">def em_1d(x, pi, mu, var, n_iter=100, tol=1e-8, verbose=False):
    ll_old = -np.inf
    for it in range(1, n_iter + 1):
        dens = pi * normal_pdf(x[:, None], mu, var)          # E-step
        ll = np.log(dens.sum(1)).sum()
        r = dens / dens.sum(1, keepdims=True)
        Nk = r.sum(0)                                        # M-step
        pi, mu = Nk / len(x), (r * x[:, None]).sum(0) / Nk
        var = (r * (x[:, None] - mu) ** 2).sum(0) / Nk
        if verbose and (it &lt;= 4 or it % 10 == 0):
            print(f"iter {it:2d}  LL(before step)={ll:.4f}  mu={mu.round(3)}  var={var.round(3)}  pi={pi.round(3)}")
        if ll - ll_old &lt; tol:
            break
        ll_old = ll
    return pi, mu, var, r, it

pi_f, mu_f, var_f, r_f, n_it = em_1d(x, pi0, mu0, var0, verbose=True)
print("stopped after", n_it, "iterations")
print("final responsibilities of component 1:", r_f[:, 0].round(3))</div>
  <div class="fx" data-lang="text">iter  1  LL(before step)=-14.5626  mu=[2.446 7.677]  var=[1.819 2.722]  pi=[0.575 0.425]
iter  2  LL(before step)=-13.7901  mu=[2.433 7.781]  var=[1.692 2.268]  pi=[0.582 0.418]
iter  3  LL(before step)=-13.7492  mu=[2.471 7.858]  var=[1.757 2.064]  pi=[0.592 0.408]
iter  4  LL(before step)=-13.7187  mu=[2.533 7.971]  var=[1.867 1.796]  pi=[0.608 0.392]
iter 10  LL(before step)=-12.5097  mu=[2.753 8.5  ]  var=[2.203 0.25 ]  pi=[0.667 0.333]
stopped after 10 iterations
final responsibilities of component 1: [1.    1.    1.    1.    0.002 0.   ]</div>
  <figure class="viz"><svg viewBox="0 0 640 215" width="640">
<text x="160.0" y="18" text-anchor="middle" font-size="12.5">Start: mu = 2 and 8, var = 4 each, pi = 0.5</text><line x1="15" y1="180" x2="305" y2="180" stroke="currentColor"/><text x="39" y="194" text-anchor="middle" class="tm" font-size="10">0</text><text x="88" y="194" text-anchor="middle" class="tm" font-size="10">2</text><text x="136" y="194" text-anchor="middle" class="tm" font-size="10">4</text><text x="184" y="194" text-anchor="middle" class="tm" font-size="10">6</text><text x="232" y="194" text-anchor="middle" class="tm" font-size="10">8</text><text x="281" y="194" text-anchor="middle" class="tm" font-size="10">10</text><polyline points="15.0,149.6 17.4,147.3 19.8,144.9 22.2,142.4 24.7,139.8 27.1,137.2 29.5,134.5 31.9,131.7 34.3,128.9 36.8,126.1 39.2,123.3 41.6,120.5 44.0,117.6 46.4,114.8 48.8,112.1 51.2,109.4 53.7,106.8 56.1,104.3 58.5,101.9 60.9,99.6 63.3,97.5 65.8,95.5 68.2,93.7 70.6,92.1 73.0,90.6 75.4,89.4 77.8,88.3 80.2,87.5 82.7,87.0 85.1,86.6 87.5,86.5 89.9,86.6 92.3,87.0 94.8,87.5 97.2,88.3 99.6,89.4 102.0,90.6 104.4,92.1 106.8,93.7 109.2,95.5 111.7,97.5 114.1,99.6 116.5,101.9 118.9,104.3 121.3,106.8 123.8,109.4 126.2,112.1 128.6,114.8 131.0,117.6 133.4,120.5 135.8,123.3 138.2,126.1 140.7,128.9 143.1,131.7 145.5,134.5 147.9,137.2 150.3,139.8 152.8,142.4 155.2,144.9 157.6,147.3 160.0,149.6 162.4,151.9 164.8,154.0 167.2,156.0 169.7,158.0 172.1,159.8 174.5,161.5 176.9,163.1 179.3,164.6 181.8,166.0 184.2,167.3 186.6,168.6 189.0,169.7 191.4,170.7 193.8,171.7 196.2,172.6 198.7,173.4 201.1,174.1 203.5,174.8 205.9,175.4 208.3,175.9 210.7,176.4 213.2,176.8 215.6,177.2 218.0,177.6 220.4,177.9 222.8,178.1 225.3,178.4 227.7,178.6 230.1,178.8 232.5,179.0 234.9,179.1 237.3,179.2 239.8,179.3 242.2,179.4 244.6,179.5 247.0,179.6 249.4,179.7 251.8,179.7 254.3,179.8 256.7,179.8 259.1,179.8 261.5,179.9 263.9,179.9 266.3,179.9 268.8,179.9 271.2,179.9 273.6,179.9 276.0,180.0 278.4,180.0 280.8,180.0 283.3,180.0 285.7,180.0 288.1,180.0 290.5,180.0 292.9,180.0 295.3,180.0 297.8,180.0 300.2,180.0 302.6,180.0 305.0,180.0" fill="none" class="sb" stroke-width="1.6" stroke-dasharray="5 3"/><polyline points="15.0,180.0 17.4,180.0 19.8,180.0 22.2,180.0 24.7,180.0 27.1,180.0 29.5,180.0 31.9,180.0 34.3,180.0 36.8,180.0 39.2,180.0 41.6,180.0 44.0,180.0 46.4,179.9 48.8,179.9 51.2,179.9 53.7,179.9 56.1,179.9 58.5,179.9 60.9,179.8 63.3,179.8 65.8,179.8 68.2,179.7 70.6,179.7 73.0,179.6 75.4,179.5 77.8,179.4 80.2,179.3 82.7,179.2 85.1,179.1 87.5,179.0 89.9,178.8 92.3,178.6 94.8,178.4 97.2,178.1 99.6,177.9 102.0,177.6 104.4,177.2 106.8,176.8 109.2,176.4 111.7,175.9 114.1,175.4 116.5,174.8 118.9,174.1 121.3,173.4 123.8,172.6 126.2,171.7 128.6,170.7 131.0,169.7 133.4,168.6 135.8,167.3 138.2,166.0 140.7,164.6 143.1,163.1 145.5,161.5 147.9,159.8 150.3,158.0 152.8,156.0 155.2,154.0 157.6,151.9 160.0,149.6 162.4,147.3 164.8,144.9 167.2,142.4 169.7,139.8 172.1,137.2 174.5,134.5 176.9,131.7 179.3,128.9 181.8,126.1 184.2,123.3 186.6,120.5 189.0,117.6 191.4,114.8 193.8,112.1 196.2,109.4 198.7,106.8 201.1,104.3 203.5,101.9 205.9,99.6 208.3,97.5 210.7,95.5 213.2,93.7 215.6,92.1 218.0,90.6 220.4,89.4 222.8,88.3 225.3,87.5 227.7,87.0 230.1,86.6 232.5,86.5 234.9,86.6 237.3,87.0 239.8,87.5 242.2,88.3 244.6,89.4 247.0,90.6 249.4,92.1 251.8,93.7 254.3,95.5 256.7,97.5 259.1,99.6 261.5,101.9 263.9,104.3 266.3,106.8 268.8,109.4 271.2,112.1 273.6,114.8 276.0,117.6 278.4,120.5 280.8,123.3 283.3,126.1 285.7,128.9 288.1,131.7 290.5,134.5 292.9,137.2 295.3,139.8 297.8,142.4 300.2,144.9 302.6,147.3 305.0,149.6" fill="none" class="sr" stroke-width="1.6" stroke-dasharray="5 3"/><polyline points="15.0,149.6 17.4,147.3 19.8,144.9 22.2,142.4 24.7,139.8 27.1,137.2 29.5,134.5 31.9,131.7 34.3,128.9 36.8,126.1 39.2,123.3 41.6,120.4 44.0,117.6 46.4,114.8 48.8,112.0 51.2,109.3 53.7,106.7 56.1,104.2 58.5,101.8 60.9,99.5 63.3,97.3 65.8,95.3 68.2,93.4 70.6,91.7 73.0,90.2 75.4,88.9 77.8,87.8 80.2,86.9 82.7,86.2 85.1,85.7 87.5,85.5 89.9,85.4 92.3,85.6 94.8,85.9 97.2,86.5 99.6,87.2 102.0,88.2 104.4,89.3 106.8,90.5 109.2,91.9 111.7,93.4 114.1,95.0 116.5,96.7 118.9,98.4 121.3,100.2 123.8,102.0 126.2,103.8 128.6,105.6 131.0,107.3 133.4,109.0 135.8,110.6 138.2,112.2 140.7,113.6 143.1,114.8 145.5,116.0 147.9,117.0 150.3,117.8 152.8,118.4 155.2,118.9 157.6,119.2 160.0,119.3 162.4,119.2 164.8,118.9 167.2,118.4 169.7,117.8 172.1,117.0 174.5,116.0 176.9,114.8 179.3,113.6 181.8,112.2 184.2,110.6 186.6,109.0 189.0,107.3 191.4,105.6 193.8,103.8 196.2,102.0 198.7,100.2 201.1,98.4 203.5,96.7 205.9,95.0 208.3,93.4 210.7,91.9 213.2,90.5 215.6,89.3 218.0,88.2 220.4,87.2 222.8,86.5 225.3,85.9 227.7,85.6 230.1,85.4 232.5,85.5 234.9,85.7 237.3,86.2 239.8,86.9 242.2,87.8 244.6,88.9 247.0,90.2 249.4,91.7 251.8,93.4 254.3,95.3 256.7,97.3 259.1,99.5 261.5,101.8 263.9,104.2 266.3,106.7 268.8,109.3 271.2,112.0 273.6,114.8 276.0,117.6 278.4,120.4 280.8,123.3 283.3,126.1 285.7,128.9 288.1,131.7 290.5,134.5 292.9,137.2 295.3,139.8 297.8,142.4 300.2,144.9 302.6,147.3 305.0,149.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="63.3" cy="180" r="4.5" class="fg sg"/><circle cx="87.5" cy="180" r="4.5" class="fg sg"/><circle cx="111.7" cy="180" r="4.5" class="fg sg"/><circle cx="160.0" cy="180" r="4.5" class="fg sg"/><circle cx="232.5" cy="180" r="4.5" class="fg sg"/><circle cx="256.7" cy="180" r="4.5" class="fg sg"/>
<text x="480.0" y="18" text-anchor="middle" font-size="12.5">After EM: mu = 2.75 and 8.5, var = 2.2 and 0.25</text><line x1="335" y1="180" x2="625" y2="180" stroke="currentColor"/><text x="359" y="194" text-anchor="middle" class="tm" font-size="10">0</text><text x="408" y="194" text-anchor="middle" class="tm" font-size="10">2</text><text x="456" y="194" text-anchor="middle" class="tm" font-size="10">4</text><text x="504" y="194" text-anchor="middle" class="tm" font-size="10">6</text><text x="552" y="194" text-anchor="middle" class="tm" font-size="10">8</text><text x="601" y="194" text-anchor="middle" class="tm" font-size="10">10</text><polyline points="335.0,173.1 337.4,171.9 339.8,170.4 342.2,168.8 344.7,166.9 347.1,164.8 349.5,162.4 351.9,159.7 354.3,156.8 356.8,153.5 359.2,149.9 361.6,146.0 364.0,141.7 366.4,137.1 368.8,132.2 371.2,126.9 373.7,121.3 376.1,115.4 378.5,109.3 380.9,102.9 383.3,96.3 385.8,89.6 388.2,82.8 390.6,75.9 393.0,69.1 395.4,62.3 397.8,55.7 400.2,49.3 402.7,43.2 405.1,37.5 407.5,32.2 409.9,30.0 412.3,30.0 414.8,30.0 417.2,30.0 419.6,30.0 422.0,30.0 424.4,30.0 426.8,30.0 429.2,30.0 431.7,30.0 434.1,30.0 436.5,30.0 438.9,30.0 441.3,30.0 443.8,31.9 446.2,37.2 448.6,42.9 451.0,48.9 453.4,55.3 455.8,61.9 458.2,68.6 460.7,75.5 463.1,82.4 465.5,89.2 467.9,95.9 470.3,102.5 472.8,108.9 475.2,115.1 477.6,121.0 480.0,126.6 482.4,131.9 484.8,136.8 487.2,141.4 489.7,145.7 492.1,149.7 494.5,153.3 496.9,156.6 499.3,159.6 501.8,162.2 504.2,164.6 506.6,166.8 509.0,168.7 511.4,170.3 513.8,171.8 516.2,173.1 518.7,174.2 521.1,175.1 523.5,175.9 525.9,176.6 528.3,177.2 530.8,177.7 533.2,178.1 535.6,178.5 538.0,178.8 540.4,179.0 542.8,179.2 545.2,179.4 547.7,179.5 550.1,179.6 552.5,179.7 554.9,179.7 557.3,179.8 559.8,179.8 562.2,179.9 564.6,179.9 567.0,179.9 569.4,179.9 571.8,180.0 574.2,180.0 576.7,180.0 579.1,180.0 581.5,180.0 583.9,180.0 586.3,180.0 588.8,180.0 591.2,180.0 593.6,180.0 596.0,180.0 598.4,180.0 600.8,180.0 603.2,180.0 605.7,180.0 608.1,180.0 610.5,180.0 612.9,180.0 615.3,180.0 617.8,180.0 620.2,180.0 622.6,180.0 625.0,180.0" fill="none" class="sb" stroke-width="1.6" stroke-dasharray="5 3"/><polyline points="335.0,180.0 337.4,180.0 339.8,180.0 342.2,180.0 344.7,180.0 347.1,180.0 349.5,180.0 351.9,180.0 354.3,180.0 356.8,180.0 359.2,180.0 361.6,180.0 364.0,180.0 366.4,180.0 368.8,180.0 371.2,180.0 373.7,180.0 376.1,180.0 378.5,180.0 380.9,180.0 383.3,180.0 385.8,180.0 388.2,180.0 390.6,180.0 393.0,180.0 395.4,180.0 397.8,180.0 400.2,180.0 402.7,180.0 405.1,180.0 407.5,180.0 409.9,180.0 412.3,180.0 414.8,180.0 417.2,180.0 419.6,180.0 422.0,180.0 424.4,180.0 426.8,180.0 429.2,180.0 431.7,180.0 434.1,180.0 436.5,180.0 438.9,180.0 441.3,180.0 443.8,180.0 446.2,180.0 448.6,180.0 451.0,180.0 453.4,180.0 455.8,180.0 458.2,180.0 460.7,180.0 463.1,180.0 465.5,180.0 467.9,180.0 470.3,180.0 472.8,180.0 475.2,180.0 477.6,180.0 480.0,180.0 482.4,180.0 484.8,180.0 487.2,180.0 489.7,180.0 492.1,180.0 494.5,180.0 496.9,180.0 499.3,180.0 501.8,180.0 504.2,180.0 506.6,180.0 509.0,180.0 511.4,180.0 513.8,180.0 516.2,179.9 518.7,179.8 521.1,179.6 523.5,179.2 525.9,178.5 528.3,177.2 530.8,175.1 533.2,171.5 535.6,166.1 538.0,157.9 540.4,146.4 542.8,130.8 545.2,110.9 547.7,86.7 550.1,58.9 552.5,30.0 554.9,30.0 557.3,30.0 559.8,30.0 562.2,30.0 564.6,30.0 567.0,30.0 569.4,30.0 571.8,30.0 574.2,30.0 576.7,30.0 579.1,58.6 581.5,86.4 583.9,110.6 586.3,130.6 588.8,146.2 591.2,157.8 593.6,166.0 596.0,171.5 598.4,175.0 600.8,177.2 603.2,178.5 605.7,179.2 608.1,179.6 610.5,179.8 612.9,179.9 615.3,180.0 617.8,180.0 620.2,180.0 622.6,180.0 625.0,180.0" fill="none" class="sr" stroke-width="1.6" stroke-dasharray="5 3"/><polyline points="335.0,173.1 337.4,171.9 339.8,170.4 342.2,168.8 344.7,166.9 347.1,164.8 349.5,162.4 351.9,159.7 354.3,156.8 356.8,153.5 359.2,149.9 361.6,146.0 364.0,141.7 366.4,137.1 368.8,132.2 371.2,126.9 373.7,121.3 376.1,115.4 378.5,109.3 380.9,102.9 383.3,96.3 385.8,89.6 388.2,82.8 390.6,75.9 393.0,69.1 395.4,62.3 397.8,55.7 400.2,49.3 402.7,43.2 405.1,37.5 407.5,32.2 409.9,30.0 412.3,30.0 414.8,30.0 417.2,30.0 419.6,30.0 422.0,30.0 424.4,30.0 426.8,30.0 429.2,30.0 431.7,30.0 434.1,30.0 436.5,30.0 438.9,30.0 441.3,30.0 443.8,31.9 446.2,37.2 448.6,42.9 451.0,48.9 453.4,55.3 455.8,61.9 458.2,68.6 460.7,75.5 463.1,82.4 465.5,89.2 467.9,95.9 470.3,102.5 472.8,108.9 475.2,115.1 477.6,121.0 480.0,126.6 482.4,131.9 484.8,136.8 487.2,141.4 489.7,145.7 492.1,149.7 494.5,153.3 496.9,156.6 499.3,159.6 501.8,162.2 504.2,164.6 506.6,166.8 509.0,168.7 511.4,170.3 513.8,171.8 516.2,173.0 518.7,174.0 521.1,174.7 523.5,175.2 525.9,175.1 528.3,174.4 530.8,172.8 533.2,169.7 535.6,164.5 538.0,156.7 540.4,145.4 542.8,130.0 545.2,110.2 547.7,86.1 550.1,58.5 552.5,30.0 554.9,30.0 557.3,30.0 559.8,30.0 562.2,30.0 564.6,30.0 567.0,30.0 569.4,30.0 571.8,30.0 574.2,30.0 576.7,30.0 579.1,58.6 581.5,86.4 583.9,110.6 586.3,130.6 588.8,146.2 591.2,157.8 593.6,166.0 596.0,171.5 598.4,175.0 600.8,177.2 603.2,178.5 605.7,179.2 608.1,179.6 610.5,179.8 612.9,179.9 615.3,180.0 617.8,180.0 620.2,180.0 622.6,180.0 625.0,180.0" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="383.3" cy="180" r="4.5" class="fg sg"/><circle cx="407.5" cy="180" r="4.5" class="fg sg"/><circle cx="431.7" cy="180" r="4.5" class="fg sg"/><circle cx="480.0" cy="180" r="4.5" class="fg sg"/><circle cx="552.5" cy="180" r="4.5" class="fg sg"/><circle cx="576.7" cy="180" r="4.5" class="fg sg"/>
<text x="320" y="208" text-anchor="middle" class="tm" font-size="11">dashed blue / red: pi_k × N(x | mu_k, var_k) · solid: mixture p(x) · green dots: the six users</text>
</svg><figcaption>The running example. Left: the starting guess, two equal bells; user U4 (x = 5) sits exactly where they cross. Right: after EM the second bell has become tall and narrow around 8 and 9 (its peak is cut off at the top of the panel), and the first bell covers 1 to 5.</figcaption></figure>
  <p>LL climbs −14.56 → −13.79 → −13.75 → −13.72 → … → −12.51. The keen bell slides to 8.5 and narrows to variance 0.25 (U5 and U6 are 1 minute apart), while the casual bell settles at 2.75 with variance 2.2 and takes U4. Final responsibilities: U4 is 1.000 casual. Why, when it started at 0.5? Because U4 is 2.25 / √2.2 = 1.5 standard deviations from the casual centre but 3.5 / 0.5 = 7 standard deviations from the keen centre. The narrow keen bell gives it almost zero density. The weights also changed: π = 0.667 / 0.333, i.e. four users casual, two keen.</p>
  <h3>Matching scikit-learn</h3>
  <p>Starting sklearn from the same parameters (<code>weights_init</code>, <code>means_init</code>, and <code>precisions_init</code>, which is 1/variance) and switching off its small variance floor gives the same answer:</p>
  <div class="fx" data-lang="py">gm = GaussianMixture(n_components=2, weights_init=pi0, means_init=mu0.reshape(-1, 1),
                     precisions_init=(1 / var0).reshape(-1, 1, 1), reg_covar=1e-12,
                     tol=1e-10, max_iter=500).fit(X1)
print("sklearn  weights", gm.weights_.round(4), " means", gm.means_.ravel().round(4),
      " variances", gm.covariances_.ravel().round(4))
print("scratch  weights", pi_f.round(4), " means", mu_f.round(4), " variances", var_f.round(4))
print("predict_proba(5):", gm.predict_proba([[5]]).round(3), " predict(5):", gm.predict([[5]]))</div>
  <div class="fx" data-lang="text">sklearn  weights [0.6671 0.3329]  means [2.7531 8.5005]  variances [2.2026 0.25  ]
scratch  weights [0.6671 0.3329]  means [2.7531 8.5005]  variances [2.2026 0.25  ]
predict_proba(5): [[1. 0.]]  predict(5): [0]</div>
  <h3>Why EM works (the short version)</h3>
  <p>For any responsibilities r, Jensen's inequality gives a lower bound on the log-likelihood: LL(θ) ≥ Σᵢ Σₖ rᵢₖ log( πₖ N(xᵢ | k) / rᵢₖ ). The E-step chooses r to make this bound touch LL at the current parameters; the M-step maximises the bound over the parameters (which is easy, because the log now sits directly on each Gaussian, giving the weighted mean/variance formulas). Raising a bound that touches LL can only raise LL. This is why scikit-learn reports <code>lower_bound_</code>. The same E/M pattern fits any model with hidden variables (hidden Markov models, missing data, topic models).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Converged" means LL stopped improving, not that the best possible solution was found. EM climbs to the nearest hill top (a local maximum). The next section shows other hill tops on these same six users.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> EM's answer depends on where it starts, and something strange can happen if a bell sits on a single point. <b>Next: local optima and collapse.</b></div>

  <h2 id="gm-init"><span class="num">06</span>Local Optima, Initialisation and Collapse</h2>
  <p><strong>The question we can't answer yet.</strong> EM always climbs, but from a bad start it may climb the wrong hill, or climb forever. How do we make it reliable?</p>
  <h3>Different starts, different answers</h3>
  <p>With <code>init_params="random"</code> sklearn starts from random responsibilities. Six runs on the six users:</p>
  <div class="fx" data-lang="py">for seed in range(6):
    g = GaussianMixture(n_components=2, init_params="random", n_init=1, random_state=seed).fit(X1)
    print(f"seed {seed}: means {np.sort(g.means_.ravel()).round(2)}  avg log-lik/row {g.score(X1):.4f}")</div>
  <div class="fx" data-lang="text">seed 0: means [4.07 5.26]  avg log-lik/row -2.5099
seed 1: means [4.45 5.05]  avg log-lik/row -2.5111
seed 2: means [4.16 5.34]  avg log-lik/row -2.5102
seed 3: means [1.98 7.21]  avg log-lik/row -2.2658
seed 4: means [4.59 4.83]  avg log-lik/row -2.5113
seed 5: means [4.54 4.9 ]  avg log-lik/row -2.5113</div>
  <p>Five starts end with two almost identical bells in the middle (means between about 4 and 5.3; average LL per row about −2.51). One finds a different split (2.0 and 7.2, −2.27). None reaches the solution of section 05 (average −12.51 / 6 = −2.085). Each is a local maximum of LL. The fixes:</p>
  <ul>
    <li><strong>n_init</strong>: run EM from several starts and keep the one with the highest LL (sklearn default 1; use 5–10).</li>
    <li><strong>init_params</strong>: "kmeans" (default: responsibilities from a K-Means run), "k-means++" (just the k-means++ seeding), "random", "random_from_data" (random points as means). A K-Means start is usually much better than random, which is also why the default run in section 11 lands directly on the good solution in 2 iterations.</li>
  </ul>
  <h3>Collapse: when the likelihood goes to infinity</h3>
  <p>Put one bell exactly on one user and let its variance shrink. Its density at that point, 1/√(2πσ²), grows without limit as σ² → 0, so LL → +∞. The "best" fit is then nonsense: a spike on one point. Start a bell at U4 with a tiny variance:</p>
  <div class="fx" data-lang="py">pi_c, mu_c, var_c = np.array([0.5, 0.5]), np.array([5.0, 4.0]), np.array([0.05, 10.0])
for it in range(3):
    dens = pi_c * normal_pdf(x[:, None], mu_c, var_c)
    ll = np.log(dens.sum(1)).sum()
    r = dens / dens.sum(1, keepdims=True)
    Nk = r.sum(0); pi_c = Nk / len(x); mu_c = (r * x[:, None]).sum(0) / Nk
    var_c = (r * (x[:, None] - mu_c) ** 2).sum(0) / Nk
    print(f"iter {it}: var of component 1 = {var_c[0]:.2e}   LL = {ll:.2f}")
g = GaussianMixture(n_components=2, means_init=[[5.0], [4.0]], precisions_init=[[[20.0]], [[0.1]]],
                    weights_init=[0.5, 0.5]).fit(X1)
print("sklearn (reg_covar=1e-6) variances:", g.covariances_.ravel().round(6))</div>
  <div class="fx" data-lang="text">iter 0: var of component 1 = 2.70e-16   LL = -16.62
iter 1: var of component 1 = 0.00e+00   LL = 1.29
iter 2: var of component 1 = nan   LL = nan
sklearn (reg_covar=1e-6) variances: [1.0000000e-06 1.0636811e+01]</div>
  <p>Within one step the variance is 0 and the LL is positive (1.29); then a division by zero gives nan. scikit-learn prevents this by adding <code>reg_covar</code> (default 1e-6) to every variance: the spike is stopped at variance 1e-6. That still is a degenerate component (it holds one point), which is the real warning: too many components, or duplicated rows.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The GMM likelihood is <strong>unbounded</strong>: for any data set, a component with mean on a data point and variance → 0 makes LL → ∞. The maximum-likelihood "solution" therefore does not exist in the strict sense; EM finds a good local maximum, and <code>reg_covar</code> (a floor on variances) or a Bayesian prior keeps it away from the spikes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Duplicate rows and discrete features (counts, ratings) invite collapse: a component can wrap tightly around many identical values. Add a little noise, raise reg_covar, or use fewer components.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> in one dimension a bell only has a width. In many dimensions it also has a shape and a tilt. How much shape freedom should each component get? <b>Next: covariance types.</b></div>

  <h2 id="gm-cov"><span class="num">07</span>Covariance Types</h2>
  <p><strong>The question we can't answer yet.</strong> A full covariance matrix lets each bell be any tilted ellipse, but costs many parameters. When should we restrict the shapes?</p>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
<g transform="translate(80,80)"><ellipse rx="52" ry="18" transform="rotate(-30)" class="fb sb" fill-opacity="0.5"/><ellipse cx="30" cy="40" rx="22" ry="12" transform="rotate(50 30 40)" class="fr sr" fill-opacity="0.5"/></g>
<text x="80" y="160" text-anchor="middle" font-size="12">full</text>
<g transform="translate(240,80)"><ellipse rx="40" ry="16" transform="rotate(-30)" class="fb sb" fill-opacity="0.5"/><ellipse cx="34" cy="38" rx="40" ry="16" transform="rotate(-30 34 38)" class="fr sr" fill-opacity="0.5"/></g>
<text x="240" y="160" text-anchor="middle" font-size="12">tied (same shape for all)</text>
<g transform="translate(400,80)"><ellipse rx="50" ry="16" class="fb sb" fill-opacity="0.5"/><ellipse cx="30" cy="42" rx="14" ry="26" class="fr sr" fill-opacity="0.5"/></g>
<text x="400" y="160" text-anchor="middle" font-size="12">diag (axis-aligned)</text>
<g transform="translate(560,80)"><circle r="34" class="fb sb" fill-opacity="0.5"/><circle cx="34" cy="40" r="16" class="fr sr" fill-opacity="0.5"/></g>
<text x="560" y="160" text-anchor="middle" font-size="12">spherical (circles)</text>
</svg><figcaption>What each covariance type allows. From left to right the shapes get more restricted and the number of parameters drops.</figcaption></figure>
  <table class="tbl">
    <tr><th>covariance_type</th><th>Each component's Σ</th><th>Covariance parameters</th><th>k = 3, d = 2</th><th>k = 3, d = 50</th></tr>
    <tr><td><code>full</code> (default)</td><td>any ellipse, own tilt</td><td>k · d(d+1)/2</td><td>9</td><td>3,825</td></tr>
    <tr><td><code>tied</code></td><td>one shared ellipse</td><td>d(d+1)/2</td><td>3</td><td>1,275</td></tr>
    <tr><td><code>diag</code></td><td>own axis-aligned ellipse</td><td>k · d</td><td>6</td><td>150</td></tr>
    <tr><td><code>spherical</code></td><td>own circle (one variance)</td><td>k</td><td>3</td><td>3</td></tr>
  </table>
  <p>Add k · d means and k − 1 free weights for the total parameter count p. By hand for k = 3, d = 2: full = 6 + 9 + 2 = 17; tied = 6 + 3 + 2 = 11; diag = 6 + 6 + 2 = 14; spherical = 6 + 3 + 2 = 11. In one dimension (our six users) full, diag and spherical are the same thing (one variance per bell, p = 3k − 1) and tied means "both bells share one variance".</p>
  <div class="fx" data-lang="py">def n_params(k, d, ct):
    cov = {"full": k * d * (d + 1) / 2, "tied": d * (d + 1) / 2, "diag": k * d, "spherical": k}[ct]
    return int(k * d + cov + (k - 1))          # means + covariances + free weights

for ct in ("full", "tied", "diag", "spherical"):
    g = GaussianMixture(n_components=3, covariance_type=ct, random_state=0).fit(Xa)
    print(f"{ct:9s} by formula {n_params(3, 2, ct):3d}   sklearn {g._n_parameters():3d}")
print("k=3, d=50 full:", n_params(3, 50, "full"), "  diag:", n_params(3, 50, "diag"))</div>
  <div class="fx" data-lang="text">full      by formula  17   sklearn  17
tied      by formula  11   sklearn  11
diag      by formula  14   sklearn  14
spherical by formula  11   sklearn  11
k=3, d=50 full: 3977   diag: 302</div>
  <p>On the stretched, tilted blobs of section 01:</p>
  <div class="fx" data-lang="py">from sklearn.mixture import GaussianMixture
for ct in ("full", "tied", "diag", "spherical"):
    g = GaussianMixture(n_components=3, covariance_type=ct, n_init=3, random_state=0).fit(Xa)
    print(f"{ct:9s}  covariances_ shape {str(np.shape(g.covariances_)):10s} BIC {g.bic(Xa):8.1f}  "
          f"ARI {adjusted_rand_score(yb, g.predict(Xa)):.3f}")</div>
  <div class="fx" data-lang="text">full       covariances_ shape (3, 2, 2)  BIC   3061.9  ARI 1.000
tied       covariances_ shape (2, 2)     BIC   3032.8  ARI 1.000
diag       covariances_ shape (3, 2)     BIC   3988.2  ARI 0.516
spherical  covariances_ shape (3,)       BIC   4019.7  ARI 0.568</div>
  <p>The clouds really are tilted, so full and tied recover them (ARI 1.000) and the axis-aligned types cannot (0.516, 0.568). Tied wins on BIC (3032.8 vs 3061.9) because the three clouds were made by the same stretch, so one shared shape is enough and saves 6 parameters.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Covariance type is a bias–variance knob (see <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). Full is flexible but needs many rows per component in high dimensions (3,977 parameters for k = 3, d = 50); diag or spherical are much cheaper and often better when d is large or data is scarce. Compare them with BIC.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>diag and spherical depend on the units of each column (a spherical bell treats one unit of income like one unit of age). Standardise first. Full covariance is less sensitive to scaling, but scaling still helps numerically.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we have been told k (2 for the users, 3 for the blobs). How do we choose the number of components ourselves? <b>Next: BIC and AIC.</b></div>

  <h2 id="gm-select"><span class="num">08</span>Choosing the Number of Components: BIC and AIC</h2>
  <p><strong>The question we can't answer yet.</strong> More components always raise the log-likelihood (in the extreme, one spike per point). How do we stop adding components at the right moment?</p>
  <h3>Likelihood minus a price per parameter</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>AIC</strong> = −2 · LL + 2p · <strong>BIC</strong> = −2 · LL + p · ln n<br>LL = maximised log-likelihood, p = number of free parameters, n = number of rows. Lower is better. BIC's price per parameter (ln n) is bigger than AIC's (2) whenever n ≥ 8, so BIC chooses fewer components; it is the usual choice for clustering. AIC aims at prediction and tends to pick more.</p>
  </div>
  <h3>By hand on the six users</h3>
  <p>In 1-D with k bells, p = k means + k variances + (k − 1) weights = 3k − 1. ln 6 = 1.792.</p>
  <table class="tbl">
    <tr><th>k</th><th>LL</th><th>p</th><th>−2·LL</th><th>AIC = −2LL + 2p</th><th>BIC = −2LL + p·1.792</th></tr>
    <tr><td>1</td><td>−15.068</td><td>2</td><td>30.136</td><td>34.136</td><td>33.720</td></tr>
    <tr><td>2</td><td>−12.510</td><td>5</td><td>25.019</td><td>35.019</td><td>33.978</td></tr>
  </table>
  <p>With only six users, the improvement from a second bell (2.56 in LL) is not quite worth 3 extra parameters: BIC slightly prefers one bell. Now ask for three:</p>
  <div class="fx" data-lang="py">for k in (1, 2, 3):
    g = GaussianMixture(n_components=k, n_init=10, random_state=0).fit(X1)
    LL = g.score(X1) * len(x)                  # score() is the AVERAGE log-likelihood per row
    p_ = 3 * k - 1
    print(f"k={k}: LL={LL:8.4f}  params={p_}  AIC={-2*LL + 2*p_:7.3f} ({g.aic(X1):7.3f})  "
          f"BIC={-2*LL + p_*np.log(len(x)):7.3f} ({g.bic(X1):7.3f})")
    if k == 3:
        print("   k=3 means", g.means_.ravel().round(2), " variances", g.covariances_.ravel().round(3))</div>
  <div class="fx" data-lang="text">k=1: LL=-15.0680  params=2  AIC= 34.136 ( 34.136)  BIC= 33.720 ( 33.720)
k=2: LL=-12.5097  params=5  AIC= 35.019 ( 35.019)  BIC= 33.978 ( 33.978)
k=3: LL= -5.1798  params=8  AIC= 26.360 ( 26.360)  BIC= 24.694 ( 24.694)
   k=3 means [5.  8.5 2. ]  variances [0.    0.25  0.667]</div>
  <p>k = 3 "wins" by far (BIC 24.7). Look at why: one component sits on U4 alone with variance ≈ 0 (it is the collapse of section 06, stopped by reg_covar). Its density spike inflates LL from −12.5 to −5.2, and the penalty cannot keep up. The lesson: BIC is a large-sample rule. It needs many rows per parameter, and a component holding one or two points is a red flag whatever BIC says.</p>
  <h3>At scale</h3>
  <div class="fx" data-lang="py">print(" k     BIC       AIC")
for k in range(1, 8):
    g = GaussianMixture(n_components=k, n_init=3, random_state=0).fit(Xa)
    print(f"{k:2d}  {g.bic(Xa):8.1f}  {g.aic(Xa):8.1f}")</div>
  <div class="fx" data-lang="text"> k     BIC       AIC
 1    4272.7    4250.7
 2    3509.5    3461.1
 3    3061.9    2987.2
 4    3093.1    2992.0
 5    3120.3    2992.8
 6    3162.8    3008.9
 7    3189.7    3009.4</div>
  <p>On the 600 stretched-blob rows BIC falls steeply to k = 3 (3061.9) and then rises again: 3 components, the truth. AIC also has its minimum at 3 but is almost flat from 3 to 7, showing its weaker penalty.</p>
  <h3>Letting the model switch components off</h3>
  <p><code>BayesianGaussianMixture</code> puts a prior on the weights. With a small <code>weight_concentration_prior</code> it prefers to give unnecessary components weight ≈ 0, so you can offer a generous number and let it decide:</p>
  <div class="fx" data-lang="py">from sklearn.mixture import BayesianGaussianMixture
bg = BayesianGaussianMixture(n_components=8, weight_concentration_prior=0.01,
                             n_init=3, random_state=0, max_iter=500).fit(Xa)
print("weights of the 8 offered components:", np.sort(bg.weights_)[::-1].round(3))
print("components with weight &gt; 1%:", (bg.weights_ &gt; 0.01).sum())</div>
  <div class="fx" data-lang="text">weights of the 8 offered components: [0.335 0.334 0.331 0.    0.    0.    0.    0.   ]
components with weight &gt; 1%: 3</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>BIC chooses the number of Gaussians that best describes the <em>density</em>, which is not always the number of meaningful <em>groups</em>. One banana-shaped cluster may need three Gaussians to describe it; BIC will say 3. Look at the components, and merge ones that describe the same group if that is what the business needs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we keep comparing with K-Means. What exactly is the relation between the two? <b>Next: GMM vs K-Means.</b></div>

  <h2 id="gm-kmeans"><span class="num">09</span>GMM vs K-Means</h2>
  <p><strong>The question we can't answer yet.</strong> Both have k centres and both alternate "assign" and "update". Is K-Means just a special GMM, and when is the extra machinery worth it?</p>
  <h3>K-Means as a limit of EM</h3>
  <p>Take a GMM with equal weights πₖ = 1/k and the same spherical covariance σ²I for every component. Then rᵢₖ ∝ exp(−‖xᵢ − μₖ‖² / 2σ²). Now let σ² → 0: the nearest centre's term dominates all others, so rᵢₖ → 1 for the nearest centre and 0 for the rest. The E-step becomes "assign to nearest centre", and the M-step becomes "centre = mean of its points". That is exactly Lloyd's K-Means algorithm.</p>
  <table class="tbl">
    <tr><th></th><th>K-Means</th><th>GMM</th></tr>
    <tr><td>Assignment</td><td>hard (nearest centre)</td><td>soft (responsibilities)</td></tr>
    <tr><td>Cluster shape</td><td>sphere, same for all</td><td>ellipse per component (or restricted)</td></tr>
    <tr><td>Cluster size / weight</td><td>implicitly equal</td><td>learned πₖ</td></tr>
    <tr><td>Objective</td><td>inertia (within-cluster squared distance)</td><td>log-likelihood</td></tr>
    <tr><td>Parameters per cluster</td><td>d (centre)</td><td>d + covariance + weight</td></tr>
    <tr><td>Output</td><td>labels, centres</td><td>labels, probabilities, density, samples</td></tr>
    <tr><td>Speed</td><td>fast, millions of rows</td><td>slower (d × d matrices), ~10⁵ rows</td></tr>
    <tr><td>Choosing k</td><td>elbow, silhouette</td><td>BIC / AIC (a real likelihood)</td></tr>
  </table>
  <h3>On the six users</h3>
  <p>Both end up with the same hard split {U1–U4}, {U5, U6} and the same centres 2.75 and 8.5 (compare section 01 with section 05). The GMM adds what K-Means cannot: the variances 2.2 and 0.25 (casual users vary a lot, keen users very little), the weights 2/3 and 1/3, and probabilities that at the start flagged U4 as a toss-up.</p>
  <h3>Unequal clusters at scale</h3>
  <div class="fx" data-lang="py">km_u = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(Xu)
gm_u = GaussianMixture(n_components=2, n_init=5, random_state=0).fit(Xu)
print("true sizes      ", np.bincount(yu))
print("K-Means sizes   ", np.bincount(km_u), " ARI", round(adjusted_rand_score(yu, km_u), 3))
print("GMM sizes       ", np.bincount(gm_u.predict(Xu)), " ARI", round(adjusted_rand_score(yu, gm_u.predict(Xu)), 3))
print("GMM weights     ", gm_u.weights_.round(3), " std devs", np.sqrt(gm_u.covariances_[:, [0, 1], [0, 1]].mean(1)).round(2))</div>
  <div class="fx" data-lang="text">true sizes       [500  60]
K-Means sizes    [217 343]  ARI 0.166
GMM sizes        [ 67 493]  ARI 0.902
GMM weights      [0.113 0.887]  std devs [0.38 1.57]</div>
  <p>K-Means puts its border halfway between the centres and splits 560 points into 217 / 343, though the truth is 500 / 60. The GMM learns weights 0.887 / 0.113 and standard deviations 1.57 / 0.38, so it nearly recovers the true sizes (493 / 67).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>GMMs are not shape-free. Each component is still an ellipse; two interlocking moons or a ring need many components and the clusters will not match the shapes. For those, use <a class="xref" data-note="ml_dbscan">DBSCAN / HDBSCAN</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> a GMM is a full density, not just a clustering. What can we do with p(x) itself? <b>Next: density estimation and anomaly detection.</b></div>

  <h2 id="gm-density"><span class="num">10</span>Density Estimation and Anomaly Detection</h2>
  <p><strong>The question we can't answer yet.</strong> Clustering tells us which group a user is in. How do we tell that a new user is unlike <em>any</em> group, and can we produce realistic fake users?</p>
  <h3>log p(x) as an "unusualness" score</h3>
  <p><code>score_samples(X)</code> returns log p(x) for each row under the fitted mixture. A high value means "typical"; a very low one means "the model would rarely produce this". A simple rule: flag new rows whose log density is below the lowest (or the 1st percentile) of the training rows.</p>
  <div class="fx" data-lang="py">gm_run = GaussianMixture(n_components=2, random_state=0).fit(X1)
new = np.array([[2.5], [5], [12], [20]])
print("log density of new users:", ", ".join(f"x={v:g}: {s:.2f}" for v, s in zip(new.ravel(), gm_run.score_samples(new))))
thr = gm_run.score_samples(X1).min()
print("lowest training log density (threshold):", round(thr, 2))
print("flag as unusual:", ", ".join(f"x={v:g}: {bool(f)}" for v, f in zip(new.ravel(), gm_run.score_samples(new) &lt; thr)))</div>
  <div class="fx" data-lang="text">log density of new users: x=2.5: -1.73, x=5: -2.86, x=12: -21.12, x=20: -69.25
lowest training log density (threshold): -2.86
flag as unusual: x=2.5: False, x=5: False, x=12: True, x=20: True</div>
  <p>A new user with 2.5 minutes is very typical (−1.73). 5 minutes equals U4, the least typical training user, so it sits exactly at the threshold and is not flagged. 12 and 20 minutes are far outside both bells (−21 and −69): flagged. (With six training users this is a toy; with thousands you would use a low percentile rather than the minimum.)</p>
  <h3>At scale</h3>
  <p>Fit on the 600 normal blob rows, inject 20 random oddballs, and flag everything below the 1st percentile of the training log densities:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
odd = rng.uniform(Xa.min(0) - 1, Xa.max(0) + 1, size=(20, 2))       # 20 injected oddballs
Xo = np.vstack([Xa, odd]); is_odd = np.r_[np.zeros(len(Xa)), np.ones(20)].astype(bool)
g = GaussianMixture(n_components=3, n_init=3, random_state=0).fit(Xa)  # fit on clean data
s = g.score_samples(Xo)
thr = np.percentile(g.score_samples(Xa), 1)                         # 1% of normal rows below this
flag = s &lt; thr
print("threshold (1st percentile of training log density):", round(thr, 2))
print("oddballs caught:", (flag &amp; is_odd).sum(), "of 20 | normal rows flagged:", (flag &amp; ~is_odd).sum(), "of", len(Xa))</div>
  <div class="fx" data-lang="text">threshold (1st percentile of training log density): -5.69
oddballs caught: 19 of 20 | normal rows flagged: 6 of 600</div>
  <p>19 of 20 oddballs are caught (the missed one landed inside a cloud), at the cost of flagging 6 normal rows, which is the 1% we chose to accept.</p>
  <h3>Generating new data</h3>
  <p><code>sample(n)</code> runs the generative story: pick a component with probability πₖ, then draw from its bell.</p>
  <div class="fx" data-lang="py">new_rows, comp = gm_run.sample(5)
print("5 synthetic users:", new_rows.ravel().round(2), " from components", comp)</div>
  <div class="fx" data-lang="text">5 synthetic users: [ 3.85  5.06 -0.61  9.17  8.08]  from components [0 0 0 1 1]</div>
  <p>Useful for simulation, for oversampling a rare class, or for checking a fitted model: if the samples do not look like the real data, the model is wrong.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fit the density on clean data. If anomalies are in the training set, a component may wrap around them and give them a high density. And in high dimensions log densities have huge ranges and a full-covariance GMM needs a lot of data; reduce dimensions first (<a class="xref" data-note="ml_pca">PCA</a>) or prefer Isolation Forest.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> the full list of knobs and outputs, and whether we could write the whole thing ourselves for many dimensions. <b>Next: scikit-learn and a from-scratch EM.</b></div>

  <h2 id="gm-sklearn"><span class="num">11</span>scikit-learn and From Scratch</h2>
  <p><strong>The question we can't answer yet.</strong> We know the maths in one dimension. What does the library expose, and does the same EM work with full covariance matrices in several dimensions?</p>
  <h3>GaussianMixture parameters</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th></tr>
    <tr><td><code>n_components</code></td><td>1</td><td>number of bells k</td></tr>
    <tr><td><code>covariance_type</code></td><td>"full"</td><td>"full", "tied", "diag", "spherical" (section 07)</td></tr>
    <tr><td><code>tol</code></td><td>1e-3</td><td>stop when the average lower bound improves by less than this</td></tr>
    <tr><td><code>reg_covar</code></td><td>1e-6</td><td>added to the diagonal of every covariance: prevents collapse</td></tr>
    <tr><td><code>max_iter</code></td><td>100</td><td>EM iterations per start</td></tr>
    <tr><td><code>n_init</code></td><td>1</td><td>number of starts; best LL kept (use 5–10)</td></tr>
    <tr><td><code>init_params</code></td><td>"kmeans"</td><td>"kmeans", "k-means++", "random", "random_from_data"</td></tr>
    <tr><td><code>weights_init</code>, <code>means_init</code>, <code>precisions_init</code></td><td>None</td><td>start from your own parameters (precision = inverse covariance)</td></tr>
    <tr><td><code>warm_start</code></td><td>False</td><td>continue from the previous fit when calling fit again</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>reproducible starts</td></tr>
  </table>
  <h3>Attributes and methods on the running example</h3>
  <div class="fx" data-lang="py">g = GaussianMixture(n_components=2, random_state=0).fit(X1)
print("converged_:", g.converged_, " n_iter_:", g.n_iter_, " lower_bound_:", round(g.lower_bound_, 4))
print("weights_:", g.weights_.round(3), " means_:", g.means_.ravel().round(3),
      " covariances_:", g.covariances_.ravel().round(3))
print("precisions_ = 1/variance:", g.precisions_.ravel().round(3))
print("predict:", g.predict(X1), " score (avg log-lik):", round(g.score(X1), 4))</div>
  <div class="fx" data-lang="text">converged_: True  n_iter_: 2  lower_bound_: -2.0849
weights_: [0.667 0.333]  means_: [2.753 8.5  ]  covariances_: [2.203 0.25 ]
precisions_ = 1/variance: [0.454 4.   ]
predict: [0 0 0 0 1 1]  score (avg log-lik): -2.0849</div>
  <p>With the default K-Means start, EM converged in 2 iterations to the same solution as section 05 (weights 0.667 / 0.333, means 2.753 / 8.5, variances 2.203 / 0.25). <code>score</code> is the <em>average</em> log-likelihood per row (−2.0849 × 6 = −12.51), <code>lower_bound_</code> is the same number at convergence, and <code>precisions_</code> are 1/variance. Other methods: <code>predict_proba</code>, <code>score_samples</code>, <code>bic</code>, <code>aic</code>, <code>sample</code>.</p>
  <h3>From scratch: multivariate EM with full covariances</h3>
  <p>The same E-step and M-step with vectors and matrices. <code>np.einsum("ij,jk,ik->i", diff, inv, diff)</code> computes (x − μ)ᵀ Σ⁻¹ (x − μ) for every row at once. The M-step covariance is the responsibility-weighted outer product, plus 1e-6 on the diagonal exactly like sklearn's reg_covar. Both implementations start from the same parameters and run 30 iterations:</p>
  <div class="fx" data-lang="py">def em_full(X, pi, mu, cov, n_iter):
    n, d = X.shape
    for _ in range(n_iter):
        dens = np.empty((n, len(pi)))
        for k in range(len(pi)):                                   # E-step
            diff = X - mu[k]
            inv = np.linalg.inv(cov[k])
            md = np.einsum("ij,jk,ik-&gt;i", diff, inv, diff)          # squared Mahalanobis distance
            dens[:, k] = pi[k] * np.exp(-0.5 * md) / np.sqrt((2 * np.pi) ** d * np.linalg.det(cov[k]))
        r = dens / dens.sum(1, keepdims=True)
        Nk = r.sum(0)                                                # M-step
        pi = Nk / n
        mu = (r.T @ X) / Nk[:, None]
        cov = np.array([((r[:, k, None] * (X - mu[k])).T @ (X - mu[k])) / Nk[k] + 1e-6 * np.eye(d)
                        for k in range(len(pi))])
    return pi, mu, cov

mu_i = Xa[[0, 1, 2]]; cov_i = np.array([np.eye(2)] * 3); pi_i = np.ones(3) / 3
pi_s, mu_s, cov_s = em_full(Xa, pi_i, mu_i, cov_i, 30)
sk = GaussianMixture(n_components=3, weights_init=pi_i, means_init=mu_i,
                     precisions_init=np.array([np.eye(2)] * 3), max_iter=30, tol=0).fit(Xa)
print("max |weights diff|    :", f"{np.abs(pi_s - sk.weights_).max():.1e}")
print("max |means diff|      :", f"{np.abs(mu_s - sk.means_).max():.1e}")
print("max |covariance diff| :", f"{np.abs(cov_s - sk.covariances_).max():.1e}")</div>
  <div class="fx" data-lang="text">max |weights diff|    : 1.7e-16
max |means diff|      : 4.4e-16
max |covariance diff| : 1.3e-15</div>
  <p>Agreement to about 1e-15, i.e. floating-point round-off: sklearn's GaussianMixture is exactly this algorithm (it works with Cholesky factors of the precision matrices for numerical stability, which gives the same numbers).</p>
  <div class="bridge"><b>What this still can't tell us →</b> we have many pieces (densities, weights, responsibilities, LL, BIC). How do they depend on each other? <b>Next: how it all connects.</b></div>

  <h2 id="gm-connect"><span class="num">12</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> Each section answered the weakness of the previous one. Seen together, which quantity is built from which, and which answers which question?</p>
  <figure class="viz"><svg viewBox="0 0 680 290" width="680">
<defs><marker id="gm-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="150" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="95" y="39" text-anchor="middle" font-size="12">μₖ, σₖ² per bell</text><text x="95" y="55" text-anchor="middle" class="tm" font-size="10">mean, variance</text>
<rect x="20" y="110" width="150" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="95" y="129" text-anchor="middle" font-size="12">πₖ weights</text><text x="95" y="145" text-anchor="middle" class="tm" font-size="10">share of points</text>
<rect x="230" y="20" width="160" height="44" rx="7" class="fb sb"/><text x="310" y="39" text-anchor="middle" font-size="12">N(x | μₖ, σₖ²)</text><text x="310" y="55" text-anchor="middle" class="tm" font-size="10">one bell's density</text>
<rect x="230" y="110" width="160" height="44" rx="7" class="fb sb"/><text x="310" y="129" text-anchor="middle" font-size="12">p(x) = Σ πₖ N(x | k)</text><text x="310" y="145" text-anchor="middle" class="tm" font-size="10">mixture density</text>
<rect x="450" y="20" width="200" height="44" rx="7" class="fr sr"/><text x="550" y="39" text-anchor="middle" font-size="12">rᵢₖ = πₖ N(xᵢ | k) / p(xᵢ)</text><text x="550" y="55" text-anchor="middle" class="tm" font-size="10">E-step: soft memberships</text>
<rect x="450" y="110" width="200" height="44" rx="7" class="fg sg"/><text x="550" y="129" text-anchor="middle" font-size="12">LL = Σ log p(xᵢ)</text><text x="550" y="145" text-anchor="middle" class="tm" font-size="10">how well it fits</text>
<rect x="450" y="200" width="200" height="44" rx="7" class="fg sg"/><text x="550" y="219" text-anchor="middle" font-size="12">BIC = −2LL + p ln n</text><text x="550" y="235" text-anchor="middle" class="tm" font-size="10">choose k / covariance type</text>
<rect x="230" y="200" width="160" height="44" rx="7" class="fr sr"/><text x="310" y="219" text-anchor="middle" font-size="12">Nₖ, weighted μ, σ²</text><text x="310" y="235" text-anchor="middle" class="tm" font-size="10">M-step</text>
<rect x="20" y="200" width="150" height="44" rx="7" class="fv"/><text x="95" y="219" text-anchor="middle" font-size="12">log p(new x)</text><text x="95" y="235" text-anchor="middle" class="tm" font-size="10">anomaly score</text>
<line x1="170" y1="42" x2="228" y2="42" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="310" y1="64" x2="310" y2="108" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="170" y1="132" x2="228" y2="132" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="390" y1="42" x2="448" y2="42" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="390" y1="120" x2="450" y2="62" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="390" y1="132" x2="448" y2="132" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="550" y1="154" x2="550" y2="198" stroke="currentColor" marker-end="url(#gm-ca)"/>
<line x1="500" y1="64" x2="370" y2="198" stroke="currentColor" marker-end="url(#gm-ca)"/>
<path d="M230 222 C 120 222, 95 120, 95 66" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#gm-ca)"/>
<line x1="230" y1="150" x2="150" y2="198" stroke="currentColor" marker-end="url(#gm-ca)"/>
<text x="150" y="182" class="tm" font-size="10">new parameters (loop)</text>
<text x="340" y="275" text-anchor="middle" class="tm" font-size="10.5">EM = the loop parameters → densities → responsibilities → M-step → parameters; LL rises every lap</text>
</svg><figcaption>One chain. The bell parameters give densities; densities and weights give the mixture and, by Bayes' rule, the responsibilities; the responsibilities give new parameters (EM). The mixture's log-likelihood scores the fit, BIC turns it into a choice of k, and log p(x) of new rows is the anomaly score.</figcaption></figure>
  <h3>Every quantity on the running example</h3>
  <div class="fx" data-lang="py">gm_c = GaussianMixture(n_components=2, weights_init=pi0, means_init=mu0.reshape(-1, 1),
                       precisions_init=(1 / var0).reshape(-1, 1, 1), tol=1e-10, max_iter=500).fit(X1)
R = gm_c.predict_proba(X1)
print("user  x  r1 at start  r1 at end  hard label  log p(x) at end")
for i, xi in enumerate(x):
    print(f" U{i+1}   {xi:.0f}     {r0[i, 0]:.3f}       {R[i, 0]:.3f}        {gm_c.predict(X1)[i]}         {gm_c.score_samples(X1)[i]:.3f}")</div>
  <div class="fx" data-lang="text">user  x  r1 at start  r1 at end  hard label  log p(x) at end
 U1   1     0.998       1.000        0         -2.416
 U2   2     0.989       1.000        0         -1.847
 U3   3     0.953       1.000        0         -1.732
 U4   5     0.500       1.000        0         -2.865
 U5   8     0.011       0.002        1         -1.824
 U6   9     0.002       0.000        1         -1.824</div>
  <p>Read along U4: at the start its two weighted densities were equal (0.0324 each), so r₁ = 0.5; EM made the keen bell narrow, its density at 5 vanished, so r₁ became 1.000; and its final log p(x) = −2.865 is the lowest of all six users, which is why it set the anomaly threshold in section 10.</p>
  <table class="tbl">
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Six users (start → end)</th><th>Robust or sensitive?</th></tr>
    <tr><td>Gaussian N(x | μ, σ²)</td><td>mean, variance</td><td>How likely is x under one group?</td><td>N(5 | 2, 4) = 0.0648</td><td>sensitive to outliers (mean, variance)</td></tr>
    <tr><td>Mixture p(x)</td><td>weights × Gaussians, summed</td><td>How likely is x overall?</td><td>p(5) = 0.0648</td><td>depends on k</td></tr>
    <tr><td>Log-likelihood</td><td>Σ log p(xᵢ)</td><td>How well do parameters fit?</td><td>one bell −15.07; mixture −14.56 → −12.51</td><td>unbounded (collapse)</td></tr>
    <tr><td>Responsibility rᵢₖ</td><td>πₖ N(xᵢ | k) / p(xᵢ)</td><td>How much is i in k?</td><td>U4: 0.5 → 1.0</td><td>depends on widths</td></tr>
    <tr><td>Nₖ, πₖ</td><td>Σᵢ rᵢₖ; Nₖ / n</td><td>How big is each group?</td><td>π 0.5 → 0.575 → 0.667</td><td>–</td></tr>
    <tr><td>Weighted μₖ, σₖ²</td><td>responsibilities + data</td><td>Where and how wide is each group?</td><td>μ 2, 8 → 2.75, 8.5; σ² 4, 4 → 2.2, 0.25</td><td>local optima</td></tr>
    <tr><td>AIC / BIC</td><td>LL, p, n</td><td>How many components?</td><td>BIC k=1 33.72, k=2 33.98</td><td>unreliable for tiny n</td></tr>
    <tr><td>log p(new x)</td><td>fitted mixture</td><td>Is this new row unusual?</td><td>x=12: −21.1 → flagged</td><td>needs clean training data</td></tr>
  </table>
  <h3>When to use which output</h3>
  <table class="tbl">
    <tr><th>You need</th><th>Use</th></tr>
    <tr><td>A segment per row</td><td><code>predict</code> (argmax of r)</td></tr>
    <tr><td>Confidence / borderline cases</td><td><code>predict_proba</code></td></tr>
    <tr><td>The number of segments</td><td>BIC over k and covariance types (and look at the components)</td></tr>
    <tr><td>Anomaly scores</td><td><code>score_samples</code> with a percentile threshold</td></tr>
    <tr><td>Synthetic data</td><td><code>sample</code></td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us →</b> how a GMM compares with all the other clustering families. <b>Next: comparisons.</b></div>

  <h2 id="gm-compare"><span class="num">13</span>Comparisons</h2>
  <p><strong>The question we can't answer yet.</strong> Faced with a new data set, when is a GMM the right clustering tool?</p>
  <table class="tbl">
    <tr><th></th><th>K-Means</th><th>GMM</th><th>DBSCAN / HDBSCAN</th><th>Hierarchical</th></tr>
    <tr><td>Needs k</td><td>yes</td><td>yes (BIC helps)</td><td>no</td><td>no (cut later)</td></tr>
    <tr><td>Shapes</td><td>round, similar size</td><td>ellipses, any size</td><td>any</td><td>depends on linkage</td></tr>
    <tr><td>Membership</td><td>hard</td><td><strong>soft probabilities</strong></td><td>hard (HDBSCAN: strength)</td><td>hard</td></tr>
    <tr><td>Overlapping clusters</td><td>splits at midpoint</td><td><strong>handles overlap</strong></td><td>merges them (no density gap)</td><td>depends</td></tr>
    <tr><td>Noise</td><td>forced in</td><td>low density, still assigned</td><td>labelled −1</td><td>forced in</td></tr>
    <tr><td>Density / sampling</td><td>no</td><td><strong>yes</strong></td><td>no</td><td>no</td></tr>
    <tr><td>New points</td><td>predict</td><td>predict, predict_proba</td><td>nearest core point</td><td>no</td></tr>
    <tr><td>Scale</td><td>millions</td><td>~10⁵ (full covariance, moderate d)</td><td>~10⁵–10⁶</td><td>~10⁴</td></tr>
  </table>
  <p>Neighbouring notes: <a class="xref" data-note="ml_kmeans">K-Means</a> · <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a> · <a class="xref" data-note="ml_hierarchical">Hierarchical</a>. Gaussian Naive Bayes (<a class="xref" data-note="ml_naivebayes">Naive Bayes</a>) is the supervised cousin: the labels are known, so each class's Gaussian is fitted directly without EM.</p>
  <div class="bridge"><b>What this still can't tell us →</b> which mistakes people actually make with GMMs. <b>Next: common mistakes.</b></div>

  <h2 id="gm-traps"><span class="num">14</span>Common Mistakes</h2>
  <p><strong>The question we can't answer yet.</strong> We know how it works; where does it typically go wrong?</p>
  <div class="callout trap"><span class="label">Trap: n_init = 1</span>
    <p>EM finds a local maximum. One run from a poor start can give two bells on top of each other (section 06). Use n_init of 5–10 and keep the best.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting a huge likelihood</span>
    <p>A component on one point (or on duplicated rows) has variance near reg_covar and a spiked likelihood. Check component weights and variances; a component with Nₖ ≈ 1 is a symptom, not a cluster.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: BIC on tiny data</span>
    <p>BIC is a large-sample rule. On six users it chose k = 3 because of a collapsed component. Use it only with many rows per parameter, and sanity-check the chosen components.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting to scale</span>
    <p>diag and spherical covariances (and K-Means initialisation) depend on units. Standardise first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: full covariance in high dimensions</span>
    <p>k · d(d+1)/2 parameters grows fast (3,825 covariance parameters for k = 3, d = 50). With too few rows the covariances are singular or overfit. Use diag, tied, PCA first, or BayesianGaussianMixture.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading soft probabilities as calibrated truth</span>
    <p>predict_proba is correct only if the data really is a mixture of Gaussians. With skewed or curved clusters the probabilities are too confident. Treat them as a ranking of certainty unless checked.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one Gaussian per business segment</span>
    <p>BIC counts Gaussians, not meaningful groups. A skewed segment may need two components. Merge components when they describe one group.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> nothing new; time to compress the note into one page. <b>Next: the revision sheet.</b></div>

  <h2 id="gm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: six users' daily minutes x = 1, 2, 3, 5, 8, 9 (U1–U6), two components, starting from π = (0.5, 0.5), μ = (2, 8), σ² = (4, 4).</p>
  <h3>The question ladder in one line each</h3>
  <ol class="story">
    <li><b>Soft, shaped clusters</b><span>K-Means forces U4 into one group and only knows round, equal clusters; we want probabilities and flexible shapes.</span></li>
    <li><b>Gaussian</b><span>One group = one bell with mean and variance; one bell for all users fits poorly (LL −15.07).</span></li>
    <li><b>Mixture</b><span>p(x) = Σ πₖ N(x | μₖ, σₖ²); even the starting guess fits better (LL −14.56).</span></li>
    <li><b>Responsibilities</b><span>Bayes' rule gives each user's share in each bell; U4 starts at 0.5 / 0.5.</span></li>
    <li><b>EM</b><span>Alternate responsibilities and weighted re-fits; LL rises to −12.51 with μ = 2.75, 8.5 and σ² = 2.2, 0.25.</span></li>
    <li><b>Initialisation and collapse</b><span>Local optima need n_init; a bell on one point blows LL up, so reg_covar floors the variance.</span></li>
    <li><b>Covariance types</b><span>full / tied / diag / spherical trade shape freedom for parameters.</span></li>
    <li><b>BIC / AIC</b><span>−2 LL plus a price per parameter chooses k; unreliable for tiny n.</span></li>
    <li><b>GMM vs K-Means</b><span>K-Means is a GMM with equal round bells shrunk to zero width (hard assignment).</span></li>
    <li><b>Density and anomalies</b><span>log p(x) scores how typical a row is; sample() generates new rows.</span></li>
  </ol>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols in plain words</th></tr>
    <tr><td>Gaussian</td><td>N(x | μ, σ²) = exp(−(x − μ)² / 2σ²) / √(2πσ²)</td><td>μ centre, σ² spread</td></tr>
    <tr><td>Multivariate</td><td>(2π)^(−d/2) |Σ|^(−½) exp(−½ (x−μ)ᵀ Σ⁻¹ (x−μ))</td><td>Σ covariance matrix; (x−μ)ᵀΣ⁻¹(x−μ) = squared Mahalanobis distance</td></tr>
    <tr><td>Mixture</td><td>p(x) = Σₖ πₖ N(x | μₖ, Σₖ)</td><td>πₖ = share of component k, Σπₖ = 1</td></tr>
    <tr><td>Log-likelihood</td><td>LL = Σᵢ log p(xᵢ)</td><td>higher = better fit</td></tr>
    <tr><td>E-step</td><td>rᵢₖ = πₖ N(xᵢ | k) / Σⱼ πⱼ N(xᵢ | j)</td><td>probability point i came from k</td></tr>
    <tr><td>M-step</td><td>Nₖ = Σᵢ rᵢₖ; πₖ = Nₖ/n; μₖ = Σ rᵢₖ xᵢ / Nₖ; σₖ² = Σ rᵢₖ (xᵢ − μₖ)² / Nₖ</td><td>weighted count, share, mean, variance</td></tr>
    <tr><td>Parameters (k bells, d dims, full)</td><td>p = k·d + k·d(d+1)/2 + (k − 1)</td><td>1-D: p = 3k − 1</td></tr>
    <tr><td>AIC / BIC</td><td>−2 LL + 2p / −2 LL + p ln n</td><td>lower is better; BIC stricter</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>User</th><th>U1</th><th>U2</th><th>U3</th><th>U4</th><th>U5</th><th>U6</th></tr>
    <tr><td>x</td><td>1</td><td>2</td><td>3</td><td>5</td><td>8</td><td>9</td></tr>
    <tr><td>N(x | 2, 4)</td><td>0.1760</td><td>0.1995</td><td>0.1760</td><td>0.0648</td><td>0.0022</td><td>0.0004</td></tr>
    <tr><td>p(x) at start</td><td>0.0882</td><td>0.1008</td><td>0.0924</td><td>0.0648</td><td>0.1008</td><td>0.0882</td></tr>
    <tr><td>r₁ at start</td><td>0.998</td><td>0.989</td><td>0.953</td><td>0.500</td><td>0.011</td><td>0.002</td></tr>
    <tr><td>r₁ at end</td><td>1.000</td><td>1.000</td><td>1.000</td><td>1.000</td><td>0.002</td><td>0.000</td></tr>
  </table>
  <p>After one M-step: π = 0.575 / 0.425, μ = 2.446 / 7.677, σ² = 1.819 / 2.722, LL −14.563 → −13.790. Converged: π = 0.667 / 0.333, μ = 2.753 / 8.5, σ² = 2.203 / 0.25, LL −12.510. One bell: μ 4.667, σ² 8.889, LL −15.068. BIC: k=1 33.720, k=2 33.978 (k=3 "wins" only through a collapsed component).</p>
  <h3>When to use, when not to</h3>
  <div class="cards">
    <div><b>Use a GMM</b><p>Overlapping or elliptical clusters, different sizes, when you need probabilities, a density, BIC-based k, or synthetic samples.</p><small>covariance_type by BIC; n_init ≥ 5</small></div>
    <div><b>Use K-Means instead</b><p>Round, similar clusters, very large data, only hard labels needed.</p><small>K-Means = hard, round, equal GMM</small></div>
    <div><b>Use DBSCAN / HDBSCAN instead</b><p>Curved shapes, noise to discard, unknown k.</p><small>GMM components are always ellipses</small></div>
    <div><b>Be careful</b><p>High dimensions with full covariance, tiny data, duplicate rows, discrete features.</p><small>diag/tied, PCA, reg_covar</small></div>
  </div>
  <h3>Key traps</h3>
  <div class="callout trap"><span class="label">Remember</span>
    <p>EM finds local optima: use several starts. The likelihood is unbounded: watch for components on one point. BIC needs many rows. Scale features for diag/spherical. Soft probabilities are only as good as the Gaussian assumption. A Gaussian is not a business segment.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>π = (0.5, 0.5), weighted densities at x are 0.03 and 0.01. r for component 1?</td><td>0.03 / 0.04 = 0.75.</td></tr>
    <tr><td>Responsibilities for component k are 1, 1, 0.5, 0. Nₖ and μₖ if x = 2, 4, 6, 10?</td><td>Nₖ = 2.5; μₖ = (2 + 4 + 3 + 0) / 2.5 = 3.6.</td></tr>
    <tr><td>Parameters of a 1-D GMM with 4 components?</td><td>3 · 4 − 1 = 11.</td></tr>
    <tr><td>Why can LL become positive or infinite?</td><td>Densities can exceed 1; a bell with variance → 0 on a point makes its density → ∞.</td></tr>
    <tr><td>What does K-Means become in GMM terms?</td><td>Equal weights, shared spherical covariance, variance → 0 (hard assignments).</td></tr>
  </table>

  <h2 id="gm-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a Gaussian mixture model, in two sentences?</summary><div class="qa-body">A density p(x) = Σ πₖ N(x | μₖ, Σₖ): the data is assumed to come from k Gaussian clouds with weights πₖ. Clustering with it means computing, for each point, the probability that each cloud produced it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through one EM iteration.</summary><div class="qa-body">E-step: for every point and component, rᵢₖ = πₖ N(xᵢ | μₖ, Σₖ) / Σⱼ πⱼ N(xᵢ | μⱼ, Σⱼ). M-step: Nₖ = Σᵢ rᵢₖ, πₖ = Nₖ / n, μₖ = Σᵢ rᵢₖ xᵢ / Nₖ, Σₖ = Σᵢ rᵢₖ (xᵢ − μₖ)(xᵢ − μₖ)ᵀ / Nₖ. On the six users one iteration moved μ from (2, 8) to (2.446, 7.677) and LL from −14.56 to −13.79.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't we maximise the GMM likelihood directly, as for a single Gaussian?</summary><div class="qa-body">LL = Σᵢ log Σₖ πₖ N(xᵢ | k) has a sum inside the log, so the derivative equations couple all parameters and have no closed-form solution. EM sidesteps this: given responsibilities, the problem separates into weighted single-Gaussian fits with closed forms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does EM always increase the likelihood? Does it find the global maximum?</summary><div class="qa-body">It never decreases it (each step raises a lower bound that touches LL at the current parameters), so it converges. But only to a local maximum or saddle point; different starts give different answers (on the six users random starts gave average LL −2.51 and −2.27 per row versus −2.085 for the best). Use n_init and a K-Means start.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the singularity (collapse) problem and how is it handled?</summary><div class="qa-body">A component centred on a single point with variance → 0 has density → ∞ there, so LL → ∞: the likelihood is unbounded. sklearn adds reg_covar (1e-6) to the covariance diagonal; Bayesian GMMs add a prior. A collapsed component also signals too many components or duplicate rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the four covariance types and when to use each.</summary><div class="qa-body">full: own arbitrary ellipse (most flexible, k·d(d+1)/2 parameters); tied: one ellipse shared by all components (clusters of the same shape); diag: own axis-aligned ellipse (k·d, good for high d); spherical: own circle (k, closest to K-Means). Choose by BIC, scale features for diag/spherical.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the number of components?</summary><div class="qa-body">Fit k = 1…K (and several covariance types) and take the lowest BIC = −2 LL + p ln n (AIC = −2 LL + 2p picks more). Check that no component is degenerate, or use BayesianGaussianMixture, which switches off unneeded components. Remember BIC counts Gaussians needed for the density, not necessarily meaningful groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is K-Means a special case of a GMM?</summary><div class="qa-body">With equal weights and the same spherical covariance σ²I for all components, rᵢₖ ∝ exp(−‖xᵢ − μₖ‖² / 2σ²). As σ² → 0 the nearest centre takes responsibility 1, so the E-step is nearest-centre assignment and the M-step is the cluster mean: Lloyd's algorithm. GMM generalises it with soft assignments, learned weights and shapes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a GMM over K-Means in a real project?</summary><div class="qa-body">When clusters overlap or differ in size or shape (unequal clusters: ARI 0.902 vs 0.166), when you need membership probabilities (borderline customers), when you want a principled k (BIC), or when you also need a density for anomaly detection or synthetic data. Not when data is huge and clusters round, or when shapes are curved (use HDBSCAN).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you use a GMM for anomaly detection?</summary><div class="qa-body">Fit on clean (mostly normal) data, compute log p(x) with score_samples, and flag rows below a low percentile of the training scores (1st percentile caught 19 of 20 injected oddballs with 1% false alarms). Choose k and covariance type by BIC; reduce dimensions first if d is large.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your GMM's predict_proba gives 0.99 for almost every customer. Is the segmentation confident?</summary><div class="qa-body">Only if the Gaussian assumption holds. Probabilities from a misspecified model (skewed or curved clusters) are overconfident. Check with a held-out likelihood, try other covariance types or more components, and treat the numbers as a ranking of certainty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) In the running example U4 started at 50/50 and ended 100% casual. Explain using the formulas.</summary><div class="qa-body">At the start both bells had variance 4 and U4 was 3 from each centre, so πₖ N(5 | k) were equal (0.0324) and r = 0.5. EM made the keen bell narrow (σ² = 0.25, σ = 0.5) around 8.5; U4 is then 7 standard deviations away from it but only 1.5 from the casual bell (σ² = 2.2), so the keen density at 5 is essentially zero and r₁ → 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How do the M-step formulas relate to an ordinary mean and variance?</summary><div class="qa-body">They are the mean and variance of each group with every point counted as a fraction rᵢₖ of a point. With 0/1 responsibilities they reduce exactly to the per-group mean and variance (the maximum-likelihood fit of one Gaussian per group), which is also what K-Means' update step computes for the mean.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How is Gaussian Naive Bayes related to a GMM?</summary><div class="qa-body">Gaussian NB is a mixture of Gaussians (one per class, with diagonal covariance) where the component of every training row is known, so no EM is needed: fit each class's mean and variance directly, then predict with Bayes' rule, exactly like a GMM's responsibilities.</div></details>
</main>
`
});
