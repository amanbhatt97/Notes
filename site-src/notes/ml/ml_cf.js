// notes/ml/ml_cf.js — Collaborative Filtering
Object.assign(TOPIC_CONTENT, {
  "ml_cf": `<main>
<h1>Collaborative Filtering</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Collaborative Filtering</span></div>
  <p class="lead">Collaborative filtering recommends from other people's behaviour alone: no genres, no descriptions, just the user × item table. "People who agreed with you before will agree again." This note builds neighbourhood collaborative filtering completely on the CineCity running example from the previous note (five users, six films, 19 ratings): how to measure that two users agree (cosine, and why it must be mean-centred), user-based prediction worked by hand, item-based prediction worked by hand, every common similarity choice side by side with significance weighting, how to evaluate with hold-out ratings, why sparsity and scale hurt and what systems do about it, how it works with implicit clicks and plays, and a from-scratch implementation that reproduces every hand number.</p>

  <h2 id="cf-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 190" width="680">
<defs><marker id="cf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="6" width="190" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Recommendation Systems</text>
<line x1="300" y1="40" x2="95" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#cf-a0)"/><line x1="320" y1="40" x2="262" y2="78" stroke="currentColor" marker-end="url(#cf-a0)"/><line x1="360" y1="40" x2="425" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#cf-a0)"/><line x1="380" y1="40" x2="590" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#cf-a0)"/>
<rect x="10" y="80" width="170" height="58" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="95" y="102" text-anchor="middle" font-size="12">1 Basics &amp; Content-Based</text><text x="95" y="120" text-anchor="middle" class="tm" font-size="10">needs item features</text>
<rect x="185" y="80" width="155" height="58" rx="8" class="fg sg" stroke-width="3"/><text x="262" y="100" text-anchor="middle" font-size="12" font-weight="700">2 Collaborative Filtering</text><text x="262" y="116" text-anchor="middle" class="tm" font-size="10">learn from other users</text><text x="262" y="130" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<rect x="345" y="80" width="160" height="58" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="425" y="102" text-anchor="middle" font-size="12">3 Matrix Factorization</text><text x="425" y="120" text-anchor="middle" class="tm" font-size="10">hidden taste vectors</text>
<rect x="510" y="80" width="160" height="58" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="98" text-anchor="middle" font-size="12">4 Ranking, Evaluation</text><text x="590" y="113" text-anchor="middle" font-size="12">&amp; Cold Start</text><text x="590" y="129" text-anchor="middle" class="tm" font-size="10">top-k lists, metrics, new users</text>
<line x1="180" y1="109" x2="183" y2="109" stroke="currentColor" marker-end="url(#cf-a0)"/><line x1="340" y1="109" x2="343" y2="109" stroke="currentColor" marker-end="url(#cf-a0)"/><line x1="505" y1="109" x2="508" y2="109" stroke="currentColor" marker-end="url(#cf-a0)"/>
<text x="340" y="170" text-anchor="middle" class="tm" font-size="10.5">neighbourhood CF breaks when users share no ratings → Matrix Factorization compresses everyone into a few shared dimensions</text>
</svg><figcaption>Collaborative filtering is the second note of the Recommendation Systems group.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_recsys">Recommendation Systems: Basics &amp; Content-Based</a></b><span>We built CineCity's rating matrix, the damped popularity baseline and content-based filtering. Content-based filtering put 3 Idiots last for Ben (cosine −0.235) because its genre tags look like the DDLJ he disliked, yet Asha and Esha, who share his love of Dangal, rated it 4 and 5. Features cannot see that link.</span></li>
    <li><b>This note adds: learning from other users</b><span>Find the people (or films) whose ratings move together, then predict a blank from theirs. No features at all: the matrix is the model. Also borrows <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> (prediction from the k most similar rows) and Pearson correlation from <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_mf">Matrix Factorization</a></b><span>Neighbourhood methods need overlapping ratings; in sparse data most pairs share almost nothing. Matrix factorization learns a short taste vector for every user and film so any pair can be compared. Then <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a> turns scores into ranked lists, measures them with ranking metrics and handles users and films with no history.</span></li>
  </ol>

  <h2 id="cf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>The collaborative idea</b><span>Q: how can we recommend without any item features? → Use people whose past ratings agree with Ben's. But how do we measure "agree"?</span></li>
    <li><b>Raw cosine similarity</b><span>Q: how alike are two users' rating rows? → Cosine on the films both rated: Ben–Asha 0.987. But Ben–Chen is 0.690 though they disagree on everything, because all ratings are positive…</span></li>
    <li><b>Mean-centring</b><span>Q: how do we remove "everyone rates 1–5" and "Esha rates everything high"? → Subtract each user's mean first. Now Ben–Asha 0.953, Ben–Chen −0.800. So who do we listen to, and how much?</span></li>
    <li><b>User-based prediction</b><span>Q: how do we turn neighbours into a number? → Ben's mean plus a similarity-weighted average of the neighbours' centred ratings: 3 Idiots 4.744, Lagaan 4.500, K3G 2.256. But Ben's users change daily and there are crores of them…</span></li>
    <li><b>Item-based prediction</b><span>Q: can we compare films instead of people? → Adjusted cosine between film columns, then a weighted average of Ben's own ratings: 3 Idiots 5.000, K3G 2.000. But Esha (one shared film) and Lagaan (one rater) get a perfect 1.0 similarity…</span></li>
    <li><b>Similarity choices &amp; significance weighting</b><span>Q: which similarity, and how do we distrust tiny overlaps? → Pearson, Jaccard, MSD…; multiply by min(n, β)/β: Esha 1.0 → 0.333, 3 Idiots 4.870. But which version is actually better?</span></li>
    <li><b>Hold-out evaluation</b><span>Q: does it predict ratings it has not seen? → Hide ratings, compare RMSE: at scale plain CF (0.777) does not beat a good baseline (0.771); shrunk CF does (0.746). But why is it so fragile?</span></li>
    <li><b>Sparsity &amp; scalability</b><span>Q: what happens with real data? → 58% of film pairs share no rater, and all-pairs similarity is O(n²). Fixes: shrinkage, top-k neighbour tables, sparse maths, approximate search. But most real data is clicks, not ratings…</span></li>
    <li><b>Implicit feedback</b><span>Q: what if we only know who watched what? → Cosine or Jaccard on 0/1 columns, score = sum of similarities; hit rate@10 0.27–0.30 vs popularity 0.19. Then: how do we code all of this?</span></li>
    <li><b>CF in code</b><span>Q: can we reproduce every hand number? → A 40-line KNN class; sklearn's NearestNeighbors for the search. Its limits lead to <a class="xref" data-note="ml_mf">Matrix Factorization</a>.</span></li>
  </ol>

  <h2 id="cf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Collaborative Filtering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea &amp; similarity</div>
        <ul>
          <li>Only the rating matrix; "people who agreed will agree"</li>
          <li><b>Co-rated</b> items I<sub>uv</sub>: Ben–Esha share 1 film</li>
          <li><b>Raw cosine</b>: Ben–Asha 0.987 but Ben–Chen 0.690 (all ratings positive)</li>
          <li><b>Mean-centre</b> by user mean: Ben 4 → +1, +1, −2</li>
          <li><b>Centred cosine</b>: Asha 0.953, Chen −0.800; <b>Pearson</b> (co-rated means): 0.971, −1.000</li>
          <li>💡 a friend whose film opinions always matched yours</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">User-based</div>
        <ul>
          <li>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ s<sub>uv</sub>(r<sub>vi</sub> − r̄<sub>v</sub>) / Σ|s<sub>uv</sub>|</li>
          <li>Neighbours: k most similar users <em>who rated i</em>, s &gt; 0</li>
          <li>Ben: 3 Idiots 4.744, Lagaan 4.500, K3G 2.256</li>
          <li>Raw weighted average for K3G: 3.177 (wrong way)</li>
          <li>Users change; many users → costly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Item-based</div>
        <ul>
          <li><b>Adjusted cosine</b>: centre by user mean, compare columns</li>
          <li>3 Idiots–Dangal 0.976, –Chak De 0.949, –DDLJ −0.949</li>
          <li>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ s<sub>ij</sub>(r<sub>uj</sub> − r̄<sub>u</sub>) / Σ|s<sub>ij</sub>|</li>
          <li>Ben: 3 Idiots 5.000, Lagaan 5.000, K3G 2.000</li>
          <li>Stable, precomputable, explainable (Amazon)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Similarity choices</div>
        <ul>
          <li>Cosine (raw / 0-filled), centred cosine, Pearson, Spearman, Jaccard, 1/(1 + MSD)</li>
          <li><b>Significance weighting</b> s·min(n, β)/β: Esha 1.0 → 0.333</li>
          <li>Minimum overlap; positive-only neighbours; k ≈ 20–50</li>
          <li>⚠ Pearson undefined with 1 co-rated item</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluation &amp; scale</div>
        <ul>
          <li>Hide ratings (random, per-user, time) → RMSE, MAE; ranking metrics in note 4</li>
          <li>Toy LOO: user-CF 1.208, item-CF 1.213 vs global 1.650</li>
          <li>Scale: baseline 0.771, plain CF 0.777, shrunk 0.746, CF on baseline 0.744</li>
          <li>58% of film pairs share no rater; O(n²) pairs</li>
          <li>Sparse cosine, top-k tables, ANN / LSH</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Implicit &amp; code</div>
        <ul>
          <li>0/1 "watched": cos = |both| / √(|i||j|), Jaccard = |both| / |either|</li>
          <li>Score = Σ similarities to the user's items; Ben: K3G 2.077 (watched ≠ liked)</li>
          <li>IUF down-weights popular items; hit rate@10 0.296 vs popularity 0.190</li>
          <li>KNNCF class reproduces 4.744 / 5.0; sklearn NearestNeighbors(metric="cosine")</li>
          <li>→ <a class="xref" data-note="ml_mf">Matrix Factorization</a> for sparsity</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="cf-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Learning From Other People</span><span class="rm-sub">Ben's three blanks</span></div></div>
      <div class="rm-item rm-done" data-target="cf-sim"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Similarity Between Users</span><span class="rm-sub">Raw cosine by hand</span></div></div>
      <div class="rm-item rm-done" data-target="cf-centre"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Mean-Centring</span><span class="rm-sub">Centred cosine and Pearson</span></div></div>
      <div class="rm-item rm-done" data-target="cf-user"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">User-Based CF by Hand</span><span class="rm-sub">Neighbours and weighted prediction</span></div></div>
      <div class="rm-item rm-done" data-target="cf-item"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Item-Based CF by Hand</span><span class="rm-sub">Adjusted cosine between films</span></div></div>
      <div class="rm-item rm-done" data-target="cf-choices"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Similarity Choices</span><span class="rm-sub">Eight measures, significance weighting</span></div></div>
      <div class="rm-item rm-done" data-target="cf-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Evaluation with Hold-Out</span><span class="rm-sub">LOO by hand, RMSE at scale</span></div></div>
      <div class="rm-item rm-done" data-target="cf-sparse"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Sparsity &amp; Scalability</span><span class="rm-sub">Overlaps, cost, speed-ups</span></div></div>
      <div class="rm-item rm-done" data-target="cf-implicit"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Implicit Feedback</span><span class="rm-sub">Who watched what</span></div></div>
      <div class="rm-item rm-done" data-target="cf-code"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">CF in Code</span><span class="rm-sub">From scratch and sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="cf-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every number on CineCity</span></div></div>
      <div class="rm-item rm-done" data-target="cf-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">User vs item vs content vs MF</span></div></div>
      <div class="rm-item rm-done" data-target="cf-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="cf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="cf-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="cf-idea"><span class="num">01</span>Learning From Other People</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The previous note could only recommend films whose <em>features</em> resemble what Ben liked, so it ranked 3 Idiots last. How can we use what <em>other users</em> did, without any features at all?</p>
  </div>
  <h3>The running example, again</h3>
  <p>CineCity's five users and six films, ratings 1–5, blank = not rated. Ben has rated Dangal 5, Chak De 5 and DDLJ 2. We want his ratings for the three blanks.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
films = ["Dangal", "Chak De", "Lagaan", "DDLJ", "K3G", "3 Idiots"]
users = ["Asha", "Ben", "Chen", "Dia", "Esha"]
n = np.nan
R = pd.DataFrame([[5, 4, n, 1, 1, 4],      # Asha
                  [5, 5, n, 2, n, n],      # Ben
                  [2, n, n, 5, 5, n],      # Chen
                  [n, 1, n, 4, 5, 2],      # Dia
                  [5, n, 5, n, 3, 5]],     # Esha
                 index=users, columns=films)
print(R.fillna("."))
print("Ben has not rated:", list(R.columns[R.loc["Ben"].isna()]))</div>
  <div class="fx" data-lang="text">     Dangal Chak De Lagaan DDLJ  K3G 3 Idiots
Asha    5.0     4.0      .  1.0  1.0      4.0
Ben     5.0     5.0      .  2.0    .        .
Chen    2.0       .      .  5.0  5.0        .
Dia       .     1.0      .  4.0  5.0      2.0
Esha    5.0       .    5.0    .  3.0      5.0
Ben has not rated: ['Lagaan', 'K3G', '3 Idiots']</div>
  <h3>The idea in plain words</h3>
  <p>Look for people whose past ratings agree with Ben's, and see what they thought of the films Ben has not rated. Asha also gave Dangal 5 and DDLJ a low score, and she gave 3 Idiots a 4. Chen and Dia disagree with Ben on everything; their opinions should count less, or even count the other way. That is <strong>collaborative filtering (CF)</strong>: the users "collaborate", without knowing it, to filter the catalogue for each other.</p>
  <p>Two mirror-image versions:</p>
  <div class="cards">
    <div><b>User-based</b><p>Find users similar to Ben; average their (adjusted) ratings of the target film.</p><small>"People like you liked 3 Idiots"</small></div>
    <div><b>Item-based</b><p>Find films similar to the target film, using who rated them how; average Ben's own ratings of those films.</p><small>"Because you liked Dangal"</small></div>
  </div>
  <p>Both need, first of all, to know <em>which ratings two users have in common</em>. Counting co-rated films for every pair is one matrix product of the 0/1 "has rated" table with its transpose:</p>
  <div class="fx" data-lang="py">known = R.notna().astype(int)
overlap = known @ known.T                    # co-rated films for every pair of users
print(overlap)</div>
  <div class="fx" data-lang="text">      Asha  Ben  Chen  Dia  Esha
Asha     5    3     3    4     3
Ben      3    3     2    2     1
Chen     3    2     3    2     2
Dia      4    2     2    4     2
Esha     3    1     2    2     4</div>
  <p>The diagonal is how many films each user rated. Off the diagonal: Ben shares 3 films with Asha, 2 with Chen and Dia, and only 1 (Dangal) with Esha. Every similarity in this note is computed on these few shared films, which is where both the power and the fragility of CF come from.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A classmate liked the same five films you did and hated the same two. When she raves about a sixth film, you will probably like it too, even if neither of you can say what the films have in common.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Collaborative filtering</strong> predicts a user's preference for an item from the preferences of other users, using only the interaction matrix R. <strong>Neighbourhood (memory-based)</strong> CF predicts from the k most similar users or items; <strong>model-based</strong> CF fits a model of R, such as <a class="xref" data-note="ml_mf">Matrix Factorization</a>. I<sub>uv</sub> denotes the items rated by both u and v.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>CF cannot say anything about a film nobody has rated or a user who has rated nothing (cold start). Content features or popularity must cover those cases (<a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Similarity.</b> "Asha agrees with Ben" is a feeling. To weight her opinion we need a number for how similar two rating rows are.</div>

  <h2 id="cf-sim"><span class="num">02</span>Similarity Between Users</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben's row is (Dangal 5, Chak De 5, DDLJ 2); Asha's is (5, 4, ·, 1, 1, 4). How do we turn two partly-blank rows into one similarity number?</p>
  </div>
  <h3>Cosine on the co-rated films, by hand</h3>
  <p>Treat each user's ratings on the shared films as a vector and take the cosine (<a class="xref" data-note="ml_recsys">previous note</a>): dot product over the product of lengths.</p>
  <table class="tbl">
    <tr><th>Pair</th><th>shared films</th><th>Ben</th><th>other</th><th>dot</th><th>lengths</th><th>cosine</th></tr>
    <tr><td>Ben–Asha</td><td>Dangal, Chak De, DDLJ</td><td>(5, 5, 2)</td><td>(5, 4, 1)</td><td>25 + 20 + 2 = 47</td><td>√54 = 7.348, √42 = 6.481</td><td>47/47.62 = <strong>0.987</strong></td></tr>
    <tr><td>Ben–Chen</td><td>Dangal, DDLJ</td><td>(5, 2)</td><td>(2, 5)</td><td>10 + 10 = 20</td><td>√29, √29</td><td>20/29 = <strong>0.690</strong></td></tr>
    <tr><td>Ben–Dia</td><td>Chak De, DDLJ</td><td>(5, 2)</td><td>(1, 4)</td><td>5 + 8 = 13</td><td>√29 = 5.385, √17 = 4.123</td><td>13/22.20 = <strong>0.585</strong></td></tr>
    <tr><td>Ben–Esha</td><td>Dangal</td><td>(5)</td><td>(5)</td><td>25</td><td>5, 5</td><td><strong>1.000</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">def co_rated(u, v):
    m = R.loc[u].notna() &amp; R.loc[v].notna()
    return R.columns[m]

def cos(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    den = np.linalg.norm(a) * np.linalg.norm(b)
    return np.nan if den == 0 else a @ b / den

Z = R.fillna(0)                              # the naive way: missing = 0
print(f"{'pair':10s} {'co-rated films':30s} {'cos(co-rated)':&gt;13s} {'cos(missing=0)':&gt;15s}")
for v in ["Asha", "Chen", "Dia", "Esha"]:
    I = co_rated("Ben", v)
    print(f"Ben-{v:6s} {', '.join(I):30s} {cos(R.loc['Ben', I], R.loc[v, I]):13.3f} "
          f"{cos(Z.loc['Ben'], Z.loc[v]):15.3f}")</div>
  <div class="fx" data-lang="text">pair       co-rated films                 cos(co-rated)  cos(missing=0)
Ben-Asha   Dangal, Chak De, DDLJ                  0.987           0.833
Ben-Chen   Dangal, DDLJ                           0.690           0.370
Ben-Dia    Chak De, DDLJ                          0.585           0.261
Ben-Esha   Dangal                                 1.000           0.371</div>
  <p>The code agrees. The second column shows the naive alternative, filling every blank with 0 and taking cosine over all six films: Ben–Asha 0.833, Ben–Chen 0.370. Filling with 0 claims "Ben rated K3G zero stars", which is false, and it mixes "how similar" with "how much overlap". We keep the co-rated version.</p>
  <h3>What is wrong with these numbers</h3>
  <p>Look at Ben–Chen. Ben gave Dangal 5 and DDLJ 2; Chen gave Dangal 2 and DDLJ 5. They disagree completely, yet raw cosine says 0.690, "fairly similar". The reason is geometric: ratings 1–5 are all positive, so every rating vector points into the same corner of space, and the angle between any two of them is at most 90°. Raw cosine cannot go negative and cannot express "opposite taste". And Esha shares one film with Ben, so their cosine is a meaningless perfect 1.000.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cosine similarity between users</strong> on co-rated items: cos(u, v) = Σ<sub>i∈I<sub>uv</sub></sub> r<sub>ui</sub> r<sub>vi</sub> / (√Σ<sub>i∈I<sub>uv</sub></sub> r<sub>ui</sub>² · √Σ<sub>i∈I<sub>uv</sub></sub> r<sub>vi</sub>²).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using raw cosine on positive ratings. Every pair of users looks at least somewhat similar, so users with opposite tastes vote as if they were friends. Centre first (next section).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Mean-centring.</b> Raw ratings mix two things: the user's taste and the user's habit (Esha rates everything 3–5, Asha uses the whole scale). How do we keep the taste and remove the habit?</div>

  <h2 id="cf-centre"><span class="num">03</span>Mean-Centring</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Is Esha's 3 for K3G a compliment or a complaint? For Esha, who averages 4.5, it is a complaint; for Asha, who averages 3, it would be neutral. How do we make ratings comparable across users?</p>
  </div>
  <h3>Subtract each user's mean, by hand</h3>
  <p>Each user's mean over the films they rated: Asha (5 + 4 + 1 + 1 + 4)/5 = 3.0, Ben (5 + 5 + 2)/3 = 4.0, Chen (2 + 5 + 5)/3 = 4.0, Dia (1 + 4 + 5 + 2)/4 = 3.0, Esha (5 + 5 + 3 + 5)/4 = 4.5. Subtract it from every rating: now each number means "above (+) or below (−) my usual".</p>
  <div class="fx" data-lang="py">mu = R.mean(axis=1)                         # each user's own average (NaN cells skipped)
C = R.sub(mu, axis=0)                       # centred: "above or below my usual"
print("user means:", mu.to_dict())
print(C.fillna("."))</div>
  <div class="fx" data-lang="text">user means: {'Asha': 3.0, 'Ben': 4.0, 'Chen': 4.0, 'Dia': 3.0, 'Esha': 4.5}
     Dangal Chak De Lagaan DDLJ  K3G 3 Idiots
Asha    2.0     1.0      . -2.0 -2.0      1.0
Ben     1.0     1.0      . -2.0    .        .
Chen   -2.0       .      .  1.0  1.0        .
Dia       .    -2.0      .  1.0  2.0     -1.0
Esha    0.5       .    0.5    . -1.5      0.5</div>
  <p>Ben becomes (+1, +1, −2): he liked the sports films and disliked DDLJ, relative to his own scale. Esha's 3 for K3G becomes −1.5: a clear "no". Each centred row sums to zero, so it now has positive and negative parts and vectors can point in opposite directions.</p>
  <h3>Centred cosine and Pearson, by hand</h3>
  <table class="tbl">
    <tr><th>Pair</th><th>Ben centred</th><th>other centred</th><th>dot</th><th>lengths</th><th>centred cosine</th></tr>
    <tr><td>Ben–Asha</td><td>(1, 1, −2)</td><td>(2, 1, −2)</td><td>2 + 1 + 4 = 7</td><td>√6 = 2.449, √9 = 3</td><td>7/7.348 = <strong>0.953</strong></td></tr>
    <tr><td>Ben–Chen</td><td>(1, −2)</td><td>(−2, 1)</td><td>−2 − 2 = −4</td><td>√5, √5</td><td>−4/5 = <strong>−0.800</strong></td></tr>
    <tr><td>Ben–Dia</td><td>(1, −2)</td><td>(−2, 1)</td><td>−4</td><td>√5, √5</td><td><strong>−0.800</strong></td></tr>
    <tr><td>Ben–Esha</td><td>(1)</td><td>(0.5)</td><td>0.5</td><td>1, 0.5</td><td><strong>1.000</strong></td></tr>
  </table>
  <p>Chen and Dia flip from "similar" (0.690, 0.585) to clearly opposite (−0.800). Asha stays very similar. Esha is still a meaningless 1.000 from one shared film: centring fixes the scale problem, not the small-overlap problem (section 06 fixes that).</p>
  <p><strong>Pearson correlation</strong> (<a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>) is the same formula with one difference: each user is centred on their mean over the <em>co-rated</em> films only. For Ben–Asha, the co-rated means are 4 for Ben and (5 + 4 + 1)/3 = 3.333 for Asha, so Asha's vector is (1.667, 0.667, −2.333): dot = 1.667 + 0.667 + 4.667 = 7.0, length √8.667 = 2.944, Pearson = 7/(2.449 × 2.944) = <strong>0.971</strong>. With only two co-rated films, Pearson is always ±1, and with one it is undefined (0/0).</p>
  <div class="fx" data-lang="py">def sim_centred(u, v):                       # mean-centred cosine on co-rated films
    I = co_rated(u, v)
    return cos(C.loc[u, I], C.loc[v, I]), len(I)

def sim_pearson(u, v):                       # Pearson: centre on the co-rated films only
    I = co_rated(u, v)
    if len(I) &lt; 2: return np.nan, len(I)
    a, b = R.loc[u, I], R.loc[v, I]
    return cos(a - a.mean(), b - b.mean()), len(I)

for v in ["Asha", "Chen", "Dia", "Esha"]:
    I = co_rated("Ben", v)
    s, k = sim_centred("Ben", v)
    p, _ = sim_pearson("Ben", v)
    print(f"Ben-{v:5s} Ben {C.loc['Ben', I].tolist()}  {v} {C.loc[v, I].tolist()}  "
          f"centred cos {s:6.3f}  Pearson {p:6.3f}  overlap {k}")</div>
  <div class="fx" data-lang="text">Ben-Asha  Ben [1.0, 1.0, -2.0]  Asha [2.0, 1.0, -2.0]  centred cos  0.953  Pearson  0.971  overlap 3
Ben-Chen  Ben [1.0, -2.0]  Chen [-2.0, 1.0]  centred cos -0.800  Pearson -1.000  overlap 2
Ben-Dia   Ben [1.0, -2.0]  Dia [-2.0, 1.0]  centred cos -0.800  Pearson -1.000  overlap 2
Ben-Esha  Ben [1.0]  Esha [0.5]  centred cos  1.000  Pearson    nan  overlap 1</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two teachers mark the same essays. One gives everyone 7–9, the other 3–9. To see whether they agree on which essays are good, compare how far each mark sits above or below that teacher's own average, not the raw marks.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Mean-centred (adjusted) cosine</strong>: s(u, v) = Σ<sub>i∈I<sub>uv</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)(r<sub>vi</sub> − r̄<sub>v</sub>) / (√Σ<sub>I<sub>uv</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)² · √Σ<sub>I<sub>uv</sub></sub>(r<sub>vi</sub> − r̄<sub>v</sub>)²), with r̄<sub>u</sub> the mean of all of u's ratings. <strong>Pearson</strong> uses means over I<sub>uv</sub> instead. A further step, <strong>z-score normalisation</strong>, also divides by each user's standard deviation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Centring by the <em>item</em> mean when comparing users, or forgetting to add the user's mean back when predicting. The centred rating is a deviation; the prediction must be r̄<sub>u</sub> + deviation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: User-based prediction.</b> We now know Asha agrees with Ben (0.953) and Chen disagrees (−0.800). How do we turn those similarities and their ratings into Ben's predicted rating for 3 Idiots?</div>

  <h2 id="cf-user"><span class="num">04</span>User-Based CF by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three users rated 3 Idiots: Asha 4, Dia 2, Esha 5. They agree with Ben to very different degrees. What single number should we predict for Ben?</p>
  </div>
  <h3>The recipe</h3>
  <div class="flow"><span>Users who rated the target film</span><span>Keep the k most similar, similarity &gt; 0</span><span>Their centred ratings of the film</span><span>Similarity-weighted average</span><span>Add back Ben's mean</span></div>
  <p style="text-align:center"><strong>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>v∈N<sub>k</sub>(u, i)</sub> s(u, v)·(r<sub>vi</sub> − r̄<sub>v</sub>) / Σ<sub>v∈N<sub>k</sub>(u, i)</sub> |s(u, v)|</strong></p>
  <p>In words: start from Ben's usual rating, then shift it by how far his look-alikes rated this film above or below <em>their</em> usual. Dividing by the sum of |similarities| makes it a weighted average.</p>
  <h3>Ben → 3 Idiots, k = 2</h3>
  <table class="tbl">
    <tr><th>Rater of 3 Idiots</th><th>similarity to Ben</th><th>rating</th><th>their mean</th><th>centred rating</th><th>used?</th></tr>
    <tr><td>Esha</td><td>1.000</td><td>5</td><td>4.5</td><td>+0.5</td><td>yes</td></tr>
    <tr><td>Asha</td><td>0.953</td><td>4</td><td>3.0</td><td>+1.0</td><td>yes</td></tr>
    <tr><td>Dia</td><td>−0.800</td><td>2</td><td>3.0</td><td>−1.0</td><td>no (negative)</td></tr>
  </table>
  <p>r̂ = 4 + (1.000 × 0.5 + 0.953 × 1.0)/(1.000 + 0.953) = 4 + 1.453/1.953 = 4 + 0.744 = <strong>4.744</strong>. The film content-based filtering put last now comes out near the top of Ben's scale.</p>
  <p><strong>Ben → Lagaan:</strong> only Esha rated it (+0.5): 4 + 0.5 = <strong>4.500</strong>. <strong>Ben → K3G:</strong> raters Asha (−2.0), Chen (+1.0), Dia (+2.0), Esha (−1.5); the two positive neighbours are Esha and Asha: 4 + (1.000 × (−1.5) + 0.953 × (−2.0))/1.953 = 4 − 3.406/1.953 = 4 − 1.744 = <strong>2.256</strong>. Ben's collaborative ranking: 3 Idiots, Lagaan, K3G.</p>
  <div class="fx" data-lang="py">S_user = pd.DataFrame([[sim_centred(u, v)[0] if u != v else 1.0 for v in users] for u in users],
                      index=users, columns=users)

def predict_user(u, i, k=2, S=S_user, verbose=False):
    raters = R.index[R[i].notna() &amp; (R.index != u)]           # who rated film i
    s = S.loc[u, raters].dropna()
    nb = s[s &gt; 0].sort_values(ascending=False).head(k)         # k most similar, positive only
    if nb.empty: return mu[u]
    dev = C.loc[nb.index, i]                                    # their centred ratings of i
    if verbose:
        print(f"  {i}: neighbours {nb.round(3).to_dict()}  centred ratings {dev.to_dict()}")
    return mu[u] + (nb * dev).sum() / nb.abs().sum()

for f in ["3 Idiots", "Lagaan", "K3G"]:
    print(f"Ben -&gt; {f}: {predict_user('Ben', f, verbose=True):.3f}")</div>
  <div class="fx" data-lang="text">  3 Idiots: neighbours {'Esha': 1.0, 'Asha': 0.953}  centred ratings {'Esha': 0.5, 'Asha': 1.0}
Ben -&gt; 3 Idiots: 4.744
  Lagaan: neighbours {'Esha': 1.0}  centred ratings {'Esha': 0.5}
Ben -&gt; Lagaan: 4.500
  K3G: neighbours {'Esha': 1.0, 'Asha': 0.953}  centred ratings {'Esha': -1.5, 'Asha': -2.0}
Ben -&gt; K3G: 2.256</div>
  <h3>Why centre the prediction too</h3>
  <p>The old-fashioned formula skips centring entirely: raw cosine weights times raw ratings, r̂ = Σ s·r / Σ s. For K3G, all four raters have positive raw cosine with Ben, so all four vote, and the romance fans' 5s pull the prediction up:</p>
  <div class="fx" data-lang="py">S_raw = pd.DataFrame([[cos(R.loc[u, co_rated(u, v)], R.loc[v, co_rated(u, v)]) for v in users]
                      for u in users], index=users, columns=users)
raters = ["Asha", "Chen", "Dia", "Esha"]                        # everyone who rated K3G
s = S_raw.loc["Ben", raters]
r = R.loc[raters, "K3G"]
print("raw cosine to Ben:", s.round(3).to_dict())
print("their K3G ratings:", r.astype(int).to_dict())
print(f"raw weighted average   = {(s * r).sum():.3f} / {s.sum():.3f} = {(s * r).sum() / s.sum():.3f}")
print(f"centred, k=2 positive  = {predict_user('Ben', 'K3G'):.3f}")</div>
  <div class="fx" data-lang="text">raw cosine to Ben: {'Asha': 0.987, 'Chen': 0.69, 'Dia': 0.585, 'Esha': 1.0}
their K3G ratings: {'Asha': 1, 'Chen': 5, 'Dia': 5, 'Esha': 3}
raw weighted average   = 10.363 / 3.262 = 3.177
centred, k=2 positive  = 2.256</div>
  <p>(0.987 × 1 + 0.690 × 5 + 0.585 × 5 + 1.000 × 3)/3.262 = 10.363/3.262 = 3.177: "Ben will find K3G okay". The centred version says 2.256: "Ben will dislike it", which matches his 2 for the similar DDLJ. Centring both the similarity and the prediction is what lets opposite tastes stop voting.</p>
  <h3>Design choices inside the formula</h3>
  <ul>
    <li><strong>k (neighbourhood size)</strong>: small k is noisy (one odd neighbour decides), large k drags in weakly similar users. Typical values 20–50; tune on a hold-out (section 07).</li>
    <li><strong>Positive neighbours only</strong>: negative similarities could vote "the opposite", but with few co-ratings they are noisy, so most systems drop them. Keeping Dia here would give 4 + (0.5 + 0.953 + 0.8)/2.753 = 4.818.</li>
    <li><strong>Similarity threshold</strong> instead of a fixed k: use all neighbours above, say, 0.3.</li>
    <li><strong>Fallback</strong>: if no neighbour rated the film, predict the user's mean (or the baseline μ + b<sub>u</sub> + b<sub>i</sub>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>User-based CF</strong>: r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>v∈N<sub>k</sub>(u,i)</sub> s(u, v)(r<sub>vi</sub> − r̄<sub>v</sub>) / Σ<sub>v</sub> |s(u, v)|, where N<sub>k</sub>(u, i) are the k users most similar to u among those who rated i (often restricted to s &gt; 0). It is <a class="xref" data-note="ml_knn">KNN regression</a> with users as points and rating rows as features.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing the k neighbours of u once, globally, and then predicting from those k. Most of them may not have rated the target film. Neighbours must be chosen per (user, item) among the users who rated that item.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Item-based CF.</b> User-based CF works, but users are many, their tastes drift, and a new rating changes their similarities. Films are fewer and more stable. Can we run the same idea on film columns instead?</div>

  <h2 id="cf-item"><span class="num">05</span>Item-Based CF by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Instead of "who is like Ben?", ask "which films are rated like 3 Idiots?", and then look at how Ben rated those films. How do we measure film-to-film similarity from ratings, and predict from it?</p>
  </div>
  <h3>Adjusted cosine between film columns</h3>
  <p>Compare two film columns over the users who rated both, after centring every rating by its <em>user's</em> mean (the same centred table as before). This is called <strong>adjusted cosine</strong>; centring by user removes "Esha rates everything high" from the film comparison.</p>
  <table class="tbl">
    <tr><th>Pair</th><th>users who rated both</th><th>3 Idiots (centred)</th><th>other film (centred)</th><th>dot</th><th>lengths</th><th>adjusted cosine</th></tr>
    <tr><td>3 Idiots–Dangal</td><td>Asha, Esha</td><td>(1, 0.5)</td><td>(2, 0.5)</td><td>2 + 0.25 = 2.25</td><td>√1.25 = 1.118, √4.25 = 2.062</td><td>2.25/2.305 = <strong>0.976</strong></td></tr>
    <tr><td>3 Idiots–Chak De</td><td>Asha, Dia</td><td>(1, −1)</td><td>(1, −2)</td><td>1 + 2 = 3</td><td>√2, √5</td><td>3/3.162 = <strong>0.949</strong></td></tr>
    <tr><td>3 Idiots–DDLJ</td><td>Asha, Dia</td><td>(1, −1)</td><td>(−2, 1)</td><td>−2 − 1 = −3</td><td>√2, √5</td><td><strong>−0.949</strong></td></tr>
  </table>
  <p>Ratings say 3 Idiots behaves like a sports film: whoever liked Dangal and Chak De liked it, whoever liked DDLJ did not. No genre tag says so; the ratings do.</p>
  <div class="fx" data-lang="py">def sim_items(i, j):                          # adjusted cosine: centre by USER means, compare columns
    m = R[i].notna() &amp; R[j].notna()
    if m.sum() == 0: return np.nan, 0
    return cos(C.loc[m, i], C.loc[m, j]), int(m.sum())

S_item = pd.DataFrame([[sim_items(i, j)[0] if i != j else 1.0 for j in films] for i in films],
                      index=films, columns=films)
print(S_item.round(3).fillna("."))
for i, j in [("3 Idiots", "Dangal"), ("3 Idiots", "Chak De"), ("3 Idiots", "DDLJ")]:
    m = R[i].notna() &amp; R[j].notna()
    print(f"{i} vs {j}: users {list(R.index[m])}  {i} {C.loc[m, i].tolist()}  {j} {C.loc[m, j].tolist()}"
          f"  -&gt; {S_item.loc[i, j]:.3f}")</div>
  <div class="fx" data-lang="text">          Dangal Chak De Lagaan   DDLJ    K3G  3 Idiots
Dangal     1.000   0.949    1.0 -0.889 -0.873     0.976
Chak De    0.949     1.0      . -0.816 -0.949     0.949
Lagaan     1.000       .    1.0      . -1.000     1.000
DDLJ      -0.889  -0.816      .    1.0  0.953    -0.949
K3G       -0.873  -0.949   -1.0  0.953  1.000    -0.989
3 Idiots   0.976   0.949    1.0 -0.949 -0.989     1.000
3 Idiots vs Dangal: users ['Asha', 'Esha']  3 Idiots [1.0, 0.5]  Dangal [2.0, 0.5]  -&gt; 0.976
3 Idiots vs Chak De: users ['Asha', 'Dia']  3 Idiots [1.0, -1.0]  Chak De [1.0, -2.0]  -&gt; 0.949
3 Idiots vs DDLJ: users ['Asha', 'Dia']  3 Idiots [1.0, -1.0]  DDLJ [-2.0, 1.0]  -&gt; -0.949</div>
  <p>The full film × film table shows the two taste groups as blocks: Dangal, Chak De, 3 Idiots (and Lagaan) are mutually positive; DDLJ and K3G are positive with each other and negative with the first group. Lagaan's 1.0 and −1.0 entries come from a single shared rater (Esha), so they are as unreliable as Ben–Esha.</p>
  <h3>Predicting from Ben's own ratings</h3>
  <p style="text-align:center"><strong>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>j∈N<sub>k</sub>(i; u)</sub> s(i, j)·(r<sub>uj</sub> − r̄<sub>u</sub>) / Σ<sub>j</sub> |s(i, j)|</strong></p>
  <p>Now the neighbours are the k films most similar to the target <em>among the films Ben rated</em>. For 3 Idiots with k = 2: Dangal (0.976, Ben +1) and Chak De (0.949, Ben +1): r̂ = 4 + (0.976 + 0.949)/(0.976 + 0.949) = 4 + 1 = <strong>5.000</strong>. For K3G, the only positively similar film Ben rated is DDLJ (0.953, Ben −2): 4 − 2 = <strong>2.000</strong>. For Lagaan: Dangal (1.0 from one rater), 4 + 1 = <strong>5.000</strong>.</p>
  <div class="fx" data-lang="py">def predict_item(u, i, k=2, verbose=False):
    rated = R.columns[R.loc[u].notna()]                         # films u has rated
    s = S_item.loc[i, rated].dropna()
    nb = s[s &gt; 0].sort_values(ascending=False).head(k)          # k most similar, positive only
    if nb.empty: return mu[u]
    dev = C.loc[u, nb.index]                                     # u's centred ratings of those films
    if verbose:
        print(f"  {i}: neighbour films {nb.round(3).to_dict()}  Ben's centred ratings {dev.to_dict()}")
    return mu[u] + (nb * dev).sum() / nb.abs().sum()

for f in ["3 Idiots", "Lagaan", "K3G"]:
    print(f"Ben -&gt; {f}: {predict_item('Ben', f, verbose=True):.3f}")</div>
  <div class="fx" data-lang="text">  3 Idiots: neighbour films {'Dangal': 0.976, 'Chak De': 0.949}  Ben's centred ratings {'Dangal': 1.0, 'Chak De': 1.0}
Ben -&gt; 3 Idiots: 5.000
  Lagaan: neighbour films {'Dangal': 1.0}  Ben's centred ratings {'Dangal': 1.0}
Ben -&gt; Lagaan: 5.000
  K3G: neighbour films {'DDLJ': 0.953}  Ben's centred ratings {'DDLJ': -2.0}
Ben -&gt; K3G: 2.000</div>
  <p>User-based said 4.744, 4.500, 2.256; item-based says 5.000, 5.000, 2.000. Different evidence, same story: 3 Idiots and Lagaan high, K3G low. Item-based also gives a natural explanation: "because you rated Dangal and Chak De highly".</p>
  <h3>Why item-based is the industry default</h3>
  <ul>
    <li><strong>Stable</strong>: a film's similarity to other films changes slowly as ratings arrive; a user's neighbours change with every rating. Item similarities can be computed offline, nightly.</li>
    <li><strong>Fewer, denser objects</strong> in many catalogues: each item has many ratings, each user few, so item similarities are better supported (true for shops with millions of shoppers; not for, say, news with endless new articles).</li>
    <li><strong>Fast at serving time</strong>: precompute each item's top-k similar items; recommending is a lookup and a sum over the user's recent items. Amazon's 2003 "item-to-item collaborative filtering" paper made this famous: "customers who bought this also bought".</li>
    <li><strong>Explainable</strong>: "because you watched Dangal".</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Item-based CF</strong>: s(i, j) = adjusted cosine over users U<sub>ij</sub> who rated both, Σ<sub>u∈U<sub>ij</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)(r<sub>uj</sub> − r̄<sub>u</sub>) / (√Σ(r<sub>ui</sub> − r̄<sub>u</sub>)² √Σ(r<sub>uj</sub> − r̄<sub>u</sub>)²); prediction r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>j∈N<sub>k</sub>(i;u)</sub> s(i, j)(r<sub>uj</sub> − r̄<sub>u</sub>) / Σ|s(i, j)| over the k items rated by u most similar to i.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Centring item columns by the <em>item</em> mean and calling it adjusted cosine. That is Pearson between items, which keeps each user's rating habit inside the comparison. Adjusted cosine centres by the user mean.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Similarity choices.</b> Both methods trusted Esha (one shared film) and Lagaan (one rater) with perfect similarities of 1.0. Which similarity measure should we use, and how do we stop tiny overlaps from dominating?</div>

  <h2 id="cf-choices"><span class="num">06</span>Similarity Choices</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Esha's 1.000 similarity to Ben rests on a single film, yet in section 04 she was Ben's <em>top</em> neighbour. Which similarity measure is right, and how do we encode "trust needs evidence"?</p>
  </div>
  <h3>Eight measures on the same four pairs</h3>
  <div class="fx" data-lang="py">from scipy.stats import spearmanr
def jaccard(u, v):
    a, b = set(R.columns[R.loc[u].notna()]), set(R.columns[R.loc[v].notna()])
    return len(a &amp; b) / len(a | b)
def msd(u, v):                                 # mean squared difference -&gt; similarity 1/(1+MSD)
    I = co_rated(u, v)
    return 1 / (1 + ((R.loc[u, I] - R.loc[v, I]) ** 2).mean())
def spearman(u, v):
    I = co_rated(u, v)
    return spearmanr(R.loc[u, I], R.loc[v, I]).statistic if len(I) &gt; 2 else np.nan
beta = 3                                       # significance weighting: trust grows with overlap
rows = []
for v in ["Asha", "Chen", "Dia", "Esha"]:
    s, k = sim_centred("Ben", v)
    rows.append([v, k, S_raw.loc["Ben", v], cos(Z.loc["Ben"], Z.loc[v]), s, sim_pearson("Ben", v)[0],
                 spearman("Ben", v), jaccard("Ben", v), msd("Ben", v), s * min(k, beta) / beta])
print(pd.DataFrame(rows, columns=["Ben vs", "overlap", "raw cos", "cos 0-fill", "centred cos", "Pearson",
                                  "Spearman", "Jaccard", "1/(1+MSD)", "centred x min(n,3)/3"])
      .round(3).to_string(index=False))</div>
  <div class="fx" data-lang="text">Ben vs  overlap  raw cos  cos 0-fill  centred cos  Pearson  Spearman  Jaccard  1/(1+MSD)  centred x min(n,3)/3
  Asha        3    0.987       0.833        0.953    0.971     0.866    0.600      0.600                 0.953
  Chen        2    0.690       0.370       -0.800   -1.000       NaN    0.500      0.100                -0.533
   Dia        2    0.585       0.261       -0.800   -1.000       NaN    0.400      0.091                -0.533
  Esha        1    1.000       0.371        1.000      NaN       NaN    0.167      1.000                 0.333</div>
  <table class="tbl">
    <tr><th>Measure</th><th>Formula (on co-rated items unless noted)</th><th>What it sees on CineCity</th><th>Use when</th></tr>
    <tr><td>Raw cosine</td><td>Σ r<sub>u</sub>r<sub>v</sub> / (‖r<sub>u</sub>‖‖r<sub>v</sub>‖)</td><td>everyone similar (Chen 0.690)</td><td>implicit 0/1 data, not ratings</td></tr>
    <tr><td>Cosine, 0-filled</td><td>same over all items, blanks = 0</td><td>mixes overlap and agreement</td><td>avoid for ratings</td></tr>
    <tr><td>Centred cosine</td><td>cosine of (r − r̄<sub>u</sub>), r̄ over all u's ratings</td><td>Asha 0.953, Chen −0.800</td><td>default for user-based ratings</td></tr>
    <tr><td>Pearson</td><td>cosine of (r − mean over co-rated)</td><td>±1.000 with 2 items, undefined with 1</td><td>classic GroupLens choice; needs overlap</td></tr>
    <tr><td>Spearman</td><td>Pearson on ranks</td><td>needs 3+ shared items</td><td>ordinal ratings, outlier raters</td></tr>
    <tr><td>Jaccard</td><td>|I<sub>u</sub> ∩ I<sub>v</sub>| / |I<sub>u</sub> ∪ I<sub>v</sub>| (which films, not scores)</td><td>Asha 0.600, Esha 0.167</td><td>implicit data</td></tr>
    <tr><td>1/(1 + MSD)</td><td>MSD = mean (r<sub>u</sub> − r<sub>v</sub>)²</td><td>Asha 0.600, Esha 1.000</td><td>ignores direction; simple</td></tr>
    <tr><td>Adjusted cosine</td><td>item columns centred by user mean</td><td>3 Idiots–Dangal 0.976</td><td>default for item-based</td></tr>
  </table>
  <p>By hand for two of them: Jaccard(Ben, Esha) = |{Dangal}| / |{Dangal, Chak De, DDLJ, Lagaan, K3G, 3 Idiots}| = 1/6 = 0.167: they share little. MSD(Ben, Asha) = ((5 − 5)² + (5 − 4)² + (2 − 1)²)/3 = 2/3, so 1/(1 + 0.667) = 0.600.</p>
  <h3>Significance weighting: trust grows with overlap</h3>
  <p>Every measure above gives Esha a high score from one film. The fix is the same shrinkage idea as the damped mean in the previous note: scale a similarity down when it rests on fewer than β shared items.</p>
  <p style="text-align:center">s′(u, v) = s(u, v) · min(n<sub>uv</sub>, β) / β</p>
  <p>With β = 3: Asha (3 shared) keeps 0.953; Chen and Dia (2 shared) go from −0.800 to −0.533; Esha (1 shared) drops from 1.000 to <strong>0.333</strong>. Redo Ben → 3 Idiots: 4 + (0.333 × 0.5 + 0.953 × 1.0)/(0.333 + 0.953) = 4 + 1.120/1.286 = 4 + 0.870 = <strong>4.870</strong>. Asha, the neighbour with real evidence, now dominates.</p>
  <div class="fx" data-lang="py">S_shrunk = S_user.copy()
for u in users:
    for v in users:
        if u != v: S_shrunk.loc[u, v] *= min(overlap.loc[u, v], beta) / beta
for f in ["3 Idiots", "Lagaan", "K3G"]:
    print(f"Ben -&gt; {f}: plain {predict_user('Ben', f):.3f}   with significance weighting "
          f"{predict_user('Ben', f, S=S_shrunk):.3f}")
print("shrunk sims to Ben:", S_shrunk.loc["Ben"].drop("Ben").round(3).to_dict())</div>
  <div class="fx" data-lang="text">Ben -&gt; 3 Idiots: plain 4.744   with significance weighting 4.870
Ben -&gt; Lagaan: plain 4.500   with significance weighting 4.500
Ben -&gt; K3G: plain 2.256   with significance weighting 2.130
shrunk sims to Ben: {'Asha': 0.953, 'Chen': -0.533, 'Dia': -0.533, 'Esha': 0.333}</div>
  <p>Two related tricks: a <strong>minimum overlap</strong> (ignore pairs with fewer than, say, 5 co-ratings; harsh on sparse data), and <strong>shrinking toward zero</strong> as s·n/(n + λ), which has the same effect with a smooth curve. Real systems use β or λ around 25–100.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Significance weighting</strong> (Herlocker et al., 1999) multiplies a similarity by min(n<sub>uv</sub>, β)/β, where n<sub>uv</sub> is the number of co-rated items. <strong>Shrinkage</strong> uses n<sub>uv</sub>/(n<sub>uv</sub> + λ). Both are priors that say "similarity is 0 until proven otherwise".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Picking the similarity measure by how sensible a few numbers look. Measures that look alike on the toy can differ by a lot on real data; choose with a hold-out comparison (next section).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Evaluation.</b> We have many variants: user or item, raw or centred, shrunk or not, k = 2 or 50. Which one actually predicts ratings it has not seen, and does any of them beat a simple baseline?</div>

  <h2 id="cf-eval"><span class="num">07</span>Evaluation with Hold-Out</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben's predictions look plausible, but we cannot check them: nobody knows what Ben would rate 3 Idiots. How do we measure a recommender's accuracy honestly?</p>
  </div>
  <h3>The idea: hide ratings we do know</h3>
  <p>Take ratings we know, hide them, predict them from everything else, and compare. With 19 ratings the most thorough version is <strong>leave-one-out (LOO)</strong>: hide each rating in turn (19 rounds), recompute means and similarities without it, predict it, and collect the 19 errors. By hand for one round: hide Asha's 4 for 3 Idiots. Asha's mean becomes (5 + 4 + 1 + 1)/4 = 2.75 and her similarities change; the user-based prediction is then compared with the true 4.</p>
  <div class="fx" data-lang="py">def loo(predict):
    errs = []
    for u in users:
        for f in films:
            if pd.isna(R.loc[u, f]): continue
            true = R.loc[u, f]
            R.loc[u, f] = np.nan                                     # hide one rating
            refresh()
            errs.append(np.clip(predict(u, f), 1, 5) - true)
            R.loc[u, f] = true                                       # put it back
    refresh()
    e = np.array(errs)
    return np.sqrt(np.mean(e ** 2)), np.mean(np.abs(e))

def refresh():                                   # recompute means and similarities after hiding a cell
    global mu, C, S_user, S_item
    mu = R.mean(axis=1); C = R.sub(mu, axis=0)
    S_user = pd.DataFrame([[sim_centred(u, v)[0] if u != v else 1.0 for v in users] for u in users],
                          index=users, columns=users)
    S_item = pd.DataFrame([[sim_items(i, j)[0] if i != j else 1.0 for j in films] for i in films],
                          index=films, columns=films)

gm = lambda u, f: np.nanmean(R.values)
um = lambda u, f: mu[u] if not np.isnan(mu[u]) else np.nanmean(R.values)
for name, fn in [("global mean", gm), ("user mean", um), ("user-based CF k=2", predict_user),
                 ("item-based CF k=2", predict_item)]:
    rmse, mae = loo(fn)
    print(f"{name:18s} RMSE {rmse:.3f}  MAE {mae:.3f}")</div>
  <div class="fx" data-lang="text">global mean        RMSE 1.650  MAE 1.491
user mean          RMSE 1.946  MAE 1.789
user-based CF k=2  RMSE 1.208  MAE 0.851
item-based CF k=2  RMSE 1.213  MAE 0.772</div>
  <p>Both CF variants clearly beat the global mean (RMSE 1.208 and 1.213 vs 1.650). A surprise: the <em>user mean</em> is worse than the global mean (1.946). With only 3–5 ratings per user, hiding one rating moves that user's mean <em>away</em> from it (hide Ben's 2 and his mean jumps to 5), a known artefact of leave-one-out on tiny data. It is one more reason 19 ratings are a teaching device, not evidence.</p>
  <h3>Ways to split</h3>
  <table class="tbl">
    <tr><th>Split</th><th>How</th><th>Answers</th><th>Watch out</th></tr>
    <tr><td>Random hold-out</td><td>hide a random 10–20% of ratings</td><td>can it fill blanks?</td><td>uses the future to predict the past</td></tr>
    <tr><td>Leave-one-out</td><td>hide each rating (or each user's last item) in turn</td><td>small data; top-N hit rate</td><td>expensive; LOO artefacts on tiny data</td></tr>
    <tr><td>Per-user hold-out</td><td>hide k ratings of every user</td><td>every user is tested equally</td><td>heavy users still dominate RMSE</td></tr>
    <tr><td>Temporal split</td><td>train before a date, test after</td><td>what production will face</td><td>the most honest; new users/items appear in test</td></tr>
    <tr><td>Cold-user split</td><td>hold out whole users</td><td>new-user performance</td><td>pure CF cannot score them</td></tr>
  </table>
  <p>Metrics: <strong>RMSE and MAE</strong> for rating prediction (<a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>), and <strong>top-N metrics</strong> (hit rate, precision@k, recall@k, NDCG) for lists, covered fully in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>. Also report <strong>coverage</strong>: the share of test cases for which the method could make a prediction at all (CF fails when no neighbour rated the film).</p>
  <h3>CineCity at scale</h3>
  <p>The same simulated CineCity as in the previous note: 1,000 users × 1,000 films, genre tastes plus two hidden traits no tag records, generous and strict raters, long-tail popularity, about 50 ratings per user. Hide 20% at random.</p>
  <div class="fx" data-lang="py">def make_ratings(n_users=1000, n_items=1000, per_user=50, seed=0):
    """Synthetic 'CineCity at scale'. Each film has genre tags plus 2 hidden traits no tag records
    (star power, director style...). Each user has a taste for both. People mostly watch popular
    films they are likely to enjoy, so which cells are missing is not random."""
    rng = np.random.default_rng(seed)
    tags = np.zeros((n_items, 4), int)                      # sports, drama, romance, comedy
    for i in range(n_items):
        tags[i, rng.choice(4, rng.integers(1, 3), replace=False)] = 1
    taste = rng.normal(0, 1, (n_users, 4))                  # how much each user likes each genre
    hid_u, hid_i = rng.normal(0, 1, (n_users, 2)), rng.normal(0, 1, (n_items, 2))
    bu, bi = rng.normal(0, 0.4, n_users), rng.normal(0, 0.4, n_items)   # generous raters, good films
    pop = 1 / np.arange(1, n_items + 1)                     # Zipf popularity
    fit = 0.9 * taste @ (tags / tags.sum(1, keepdims=True)).T + 0.8 * hid_u @ hid_i.T / np.sqrt(2)
    rows = []
    for u in range(n_users):
        p = pop * np.exp(1.5 * fit[u]); p /= p.sum()        # watch popular films you will like
        for i in rng.choice(n_items, max(3, rng.poisson(per_user)), replace=False, p=p):
            s = 3.4 + bu[u] + bi[i] + fit[u, i] + rng.normal(0, 0.6)
            rows.append((u, i, int(np.clip(np.rint(s), 1, 5))))
    return pd.DataFrame(rows, columns=["user", "item", "rating"]), tags

big, big_tags = make_ratings()
test = np.random.default_rng(1).random(len(big)) &lt; 0.2         # hide 20% of ratings at random
tr, te = big[~test], big[test]
nU, nI = 1000, 1000
Rtr = np.full((nU, nI), np.nan)
Rtr[tr.user, tr.item] = tr.rating
Mk = ~np.isnan(Rtr)                                             # known-cell mask
print(f"{len(big):,} ratings, density {len(big) / (nU * nI):.4f}; train {len(tr):,}, test {len(te):,}")</div>
  <div class="fx" data-lang="text">50,186 ratings, density 0.0502; train 40,182, test 10,004</div>
  <p>Every method is fitted on the training ratings only. The baseline predictor μ + b<sub>u</sub> + b<sub>i</sub> (global mean plus damped user and film offsets) is the strong reference. "CF on baseline" is the next step of centring: instead of subtracting only the user's mean, subtract the full baseline, and let the neighbours vote on what the baseline could not explain (this is the KNNBaseline idea from the Netflix Prize years).</p>
  <div class="fx" data-lang="py">def centred_sims(Rm, axis):
    """Mean-centred cosine on co-rated cells, for all user pairs (axis=0) or all film pairs (axis=1)."""
    mask = ~np.isnan(Rm)
    mu_u = np.nanmean(Rm, axis=1)                               # centre by USER mean either way
    Cc = np.where(mask, Rm - mu_u[:, None], 0.0)
    A, Mm = (Cc, mask.astype(float)) if axis == 0 else (Cc.T, mask.T.astype(float))
    num = A @ A.T
    den = np.sqrt((A ** 2) @ Mm.T) * np.sqrt(Mm @ (A ** 2).T)  # norms over co-rated cells only
    with np.errstate(invalid="ignore", divide="ignore"):
        S = np.where(den &gt; 0, num / den, 0.0)
    np.fill_diagonal(S, 0.0)                                     # never use yourself as a neighbour
    return S, mu_u, Cc

def shrink(S, overlap, beta=5):
    return S * np.minimum(overlap, beta) / beta                  # significance weighting

def predict_rows(pairs, S, mu_u, Cc, k, kind):
    out = np.empty(len(pairs)); found = 0
    for n_, (u, i) in enumerate(pairs):
        if kind == "user":
            cand = np.where(Mk[:, i])[0]; s = S[u, cand]; dev = Cc[cand, i]
        else:
            cand = np.where(Mk[u])[0]; s = S[i, cand]; dev = Cc[u, cand]
        keep = s &gt; 0
        s, dev = s[keep], dev[keep]
        top = np.argsort(-s)[:k]
        if len(top):
            found += 1
            out[n_] = mu_u[u] + (s[top] @ dev[top]) / np.abs(s[top]).sum()
        else:
            out[n_] = mu_u[u]                                    # no neighbour: fall back to user mean
    return out, found / len(pairs)

y = te.rating.values
pairs = list(zip(te.user, te.item))
def rmse(p): return np.sqrt(np.mean((p - y) ** 2))
mu_all = np.nanmean(Rtr)
S_u, mu_u, Cc = centred_sims(Rtr, axis=0)
S_i, _, _ = centred_sims(Rtr, axis=1)
cnt_i, sum_i = Mk.sum(0), np.nansum(Rtr, 0)
bi = (sum_i - cnt_i * mu_all) / (cnt_i + 5)                     # damped film effect
bu = np.nansum(Rtr - mu_all - bi, 1) / (Mk.sum(1) + 5)          # damped user effect
print(f"{'predictor':32s} {'RMSE':&gt;6s} {'MAE':&gt;6s} {'has neighbours':&gt;15s}")
rows = [("global mean", np.full(len(y), mu_all), 1.0),
        ("user mean", mu_u[te.user.values], 1.0),
        ("baseline mu + b_u + b_i", np.clip(mu_all + bu[te.user.values] + bi[te.item.values], 1, 5), 1.0)]
for name, S, kind in [("user-based CF, k=30", S_u, "user"), ("item-based CF, k=30", S_i, "item"),
                      ("user-based CF, k=30, shrunk", shrink(S_u, ov_u), "user"),
                      ("item-based CF, k=30, shrunk", shrink(S_i, ov_i), "item")]:
    p, cov = predict_rows(pairs, S, mu_u, Cc, 30, kind)
    rows.append((name, np.clip(p, 1, 5), cov))
base_tr = mu_all + bu[:, None] + bi[None, :]                     # baseline for every cell
Rres = Rtr - base_tr                                             # what the baseline cannot explain
Cb = np.where(Mk, Rres, 0.0)
def res_sims(A, Mm):
    num = A @ A.T
    den = np.sqrt((A ** 2) @ Mm.T) * np.sqrt(Mm @ (A ** 2).T)
    with np.errstate(invalid="ignore", divide="ignore"):
        S = np.where(den &gt; 0, num / den, 0.0)
    np.fill_diagonal(S, 0.0)
    return S
S_ib = shrink(res_sims(Cb.T, Mk.T.astype(float)), ov_i)
S_ub = shrink(res_sims(Cb, Mk.astype(float)), ov_u)
for name, S, kind in [("user-based CF on baseline", S_ub, "user"), ("item-based CF on baseline", S_ib, "item")]:
    p, cov = predict_rows(pairs, S, np.zeros(nU), Cb, 30, kind)  # neighbours vote on residuals
    p = np.clip(mu_all + bu[te.user.values] + bi[te.item.values] + p, 1, 5)
    rows.append((name, p, cov))
for name, p, cov in rows:
    print(f"{name:32s} {rmse(p):6.3f} {np.mean(np.abs(p - y)):6.3f} {cov:15.1%}")</div>
  <div class="fx" data-lang="text">predictor                          RMSE    MAE  has neighbours
global mean                       1.007  0.828          100.0%
user mean                         0.859  0.666          100.0%
baseline mu + b_u + b_i           0.771  0.585          100.0%
user-based CF, k=30               0.777  0.575           99.6%
item-based CF, k=30               0.779  0.574          100.0%
user-based CF, k=30, shrunk       0.746  0.544           99.6%
item-based CF, k=30, shrunk       0.761  0.556          100.0%
user-based CF on baseline         0.744  0.549           99.9%
item-based CF on baseline         0.744  0.544          100.0%</div>
  <p>Read it top to bottom. The user mean (0.859) and then the baseline (0.771) capture rater habits and film quality. <strong>Plain user-based CF (0.777) does not beat the baseline</strong>, and plain item-based (0.779) neither: with about 40 training ratings per user, many similarities rest on a handful of co-ratings and are noisy. Significance weighting (β = 5) fixes much of that: user-based 0.746, item-based 0.761. Centring on the baseline is best: 0.744 for both. On this data, CF beats content-based filtering from the previous note (0.801) because it also captures the hidden traits that no tag recorded.</p>
  <h3>Choosing k</h3>
  <div class="fx" data-lang="py">S_is = shrink(S_i, ov_i)
for k in [1, 5, 10, 20, 40, 80, 200]:
    p, _ = predict_rows(pairs, S_is, mu_u, Cc, k, "item")
    print(f"item-based, shrunk, k={k:3d}: RMSE {rmse(np.clip(p, 1, 5)):.3f}")</div>
  <div class="fx" data-lang="text">item-based, shrunk, k=  1: RMSE 0.997
item-based, shrunk, k=  5: RMSE 0.787
item-based, shrunk, k= 10: RMSE 0.764
item-based, shrunk, k= 20: RMSE 0.761
item-based, shrunk, k= 40: RMSE 0.761
item-based, shrunk, k= 80: RMSE 0.761
item-based, shrunk, k=200: RMSE 0.761</div>
  <p>k = 1 (copy the single most similar film) is terrible: 0.997. The error falls fast up to k ≈ 10–20 and then flattens, because after shrinkage the extra neighbours have small weights. Pick k on a validation split, not the test split (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Offline evaluation</strong> of CF hides a set of known interactions T, fits on R \\ T, and reports RMSE = √(Σ<sub>(u,i)∈T</sub>(r̂<sub>ui</sub> − r<sub>ui</sub>)²/|T|), MAE, coverage, and top-N metrics. The <strong>baseline predictor</strong> b<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> is the reference every CF model must beat.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing user means or similarities on all ratings and then evaluating on some of them. The hidden rating leaks into the mean and the similarities. Everything (means, biases, similarities, k) must come from the training part only, and k from a validation part.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sparsity and scalability.</b> CF only just beat the baseline, and only after shrinkage. What exactly makes it fragile on real data, and what does it cost to compute all those similarities for millions of users?</div>

  <h2 id="cf-sparse"><span class="num">08</span>Sparsity &amp; Scalability</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On CineCity every pair of users shares at least one film. In a real matrix that is 99% empty, how many pairs share anything, and how long does it take to compare everyone with everyone?</p>
  </div>
  <h3>Sparsity: most pairs share almost nothing</h3>
  <div class="fx" data-lang="py">ov_u = Mk.astype(int) @ Mk.T.astype(int)                        # co-rated films per user pair
iu = np.triu_indices(nU, 1)
pu = ov_u[iu]
ov_i = Mk.T.astype(int) @ Mk.astype(int)                        # co-raters per film pair
ii = np.triu_indices(nI, 1)
pi = ov_i[ii]
print(f"user pairs: {len(pu):,}  share with 0 co-rated films {np.mean(pu == 0):.1%}, "
      f"&gt;=3 {np.mean(pu &gt;= 3):.1%}, &gt;=5 {np.mean(pu &gt;= 5):.1%}, median {np.median(pu):.0f}")
print(f"film pairs: {len(pi):,}  share with 0 co-raters {np.mean(pi == 0):.1%}, "
      f"&gt;=3 {np.mean(pi &gt;= 3):.1%}, &gt;=5 {np.mean(pi &gt;= 5):.1%}")
nr = Mk.sum(0)
print(f"films with 0 training ratings: {(nr == 0).sum()}, with 1-4: {((nr &gt; 0) &amp; (nr &lt; 5)).sum()}, "
      f"median ratings per film {np.median(nr):.0f}, per user {np.median(Mk.sum(1)):.0f}")</div>
  <div class="fx" data-lang="text">user pairs: 499,500  share with 0 co-rated films 1.4%, &gt;=3 86.9%, &gt;=5 63.6%, median 6
film pairs: 499,500  share with 0 co-raters 58.5%, &gt;=3 14.3%, &gt;=5 7.9%
films with 0 training ratings: 0, with 1-4: 36, median ratings per film 20, per user 40</div>
  <p>Users here rate about 40 films each (5% density), so most <em>user</em> pairs share a few films (median 6). But 58% of <em>film</em> pairs have no rater in common, and only 8% share 5 or more: most film–film similarities cannot be computed at all, and of those that can, most rest on one or two people. 36 films have fewer than 5 ratings. At 0.1% density (typical for shops), even user pairs mostly share nothing. Consequences:</p>
  <ul>
    <li><strong>Unreliable similarities</strong>: a similarity from 1–2 co-ratings is noise (Esha's 1.0). Shrinkage helps.</li>
    <li><strong>Low coverage</strong>: no neighbour rated the target film, so no prediction (fall back to the baseline).</li>
    <li><strong>No transitivity</strong>: if Ben shares films with Asha and Asha with Farhan, but Ben shares none with Farhan, neighbourhood CF cannot link Ben and Farhan. Matrix factorization can.</li>
  </ul>
  <h3>Scalability: the cost of all pairs</h3>
  <p>User-based CF needs similarities between m users: m(m − 1)/2 pairs, each over up to n items, so O(m²n) naive work and O(m²) memory. For 1 crore users that is 5 × 10<sup>13</sup> pairs: impossible. Item-based has the same problem with n items, but n is often smaller and the table can be built offline. What real systems do:</p>
  <div class="fx" data-lang="py">import time
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
Cs = csr_matrix(Cc)                                             # centred ratings, zeros not stored
t = time.perf_counter(); S_fast = cosine_similarity(Cs.T, dense_output=False); t1 = time.perf_counter() - t
t = time.perf_counter(); S_dense = cosine_similarity(Cc.T); t2 = time.perf_counter() - t
print(f"centred matrix: {Cs.nnz:,} stored values of {Cc.size:,} ({Cs.nnz / Cc.size:.2%})")
print(f"item-item cosine: sparse {t1 * 1000:.0f} ms, dense {t2 * 1000:.0f} ms, same result "
      f"{np.allclose(S_fast.toarray(), S_dense)}; non-zero similarities {S_fast.nnz:,} of {nI * nI:,}")
k = 50                                                          # keep only the top-50 neighbours per film
topk = np.argpartition(-S_dense, k, axis=1)[:, :k]
print(f"top-{k} neighbour table: {nI} x {k} = {nI * k:,} numbers instead of {nI * nI:,}")</div>
  <div class="fx" data-lang="text">centred matrix: 39,752 stored values of 1,000,000 (3.98%)
item-item cosine: sparse 25 ms, dense 32 ms, same result True; non-zero similarities 412,862 of 1,000,000
top-50 neighbour table: 1000 x 50 = 50,000 numbers instead of 1,000,000</div>
  <ul>
    <li><strong>Sparse maths</strong>: only 4% of the centred matrix is non-zero; a sparse product skips the zeros (25 ms vs 32 ms dense in this run; timings vary from run to run, and the gap grows with size and sparsity).</li>
    <li><strong>Only pairs that co-occur</strong>: 59% of film pairs have similarity 0 because nobody rated both, so never store them; compute similarities by iterating over each user's items (the Amazon algorithm).</li>
    <li><strong>Top-k neighbour tables</strong>: keep each film's 50 most similar films: 50,000 numbers instead of 1,000,000. Serving = look up the neighbours of the user's recent films and add up.</li>
    <li><strong>Approximate nearest neighbours</strong> (ANN: HNSW, LSH, MinHash for Jaccard) find "most similar" without comparing everything (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>).</li>
    <li><strong>Sampling and clustering</strong>: compare a user only with users in the same cluster (<a class="xref" data-note="ml_kmeans">K-Means</a>), or sub-sample heavy users.</li>
    <li><strong>Distributed jobs</strong>: item-item co-occurrence counts are a classic Spark map-reduce.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking every student in India to compare report cards with every other student is hopeless. Comparing only students who took at least a few of the same exams, and keeping each one's 50 closest matches, is a weekend job.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sparsity problem</strong>: with density far below 1%, few pairs share enough co-rated items, giving unreliable similarities and low prediction coverage. <strong>Scalability problem</strong>: all-pairs similarity is O(m²) in the number of users (or items); solved with sparse computation, co-occurrence-only pairs, top-k pruning, ANN search and offline precomputation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Prototyping user-based CF on a sample, then running the same dense code on the full user base. The m × m similarity matrix for 10 lakh users is 8 TB. Decide on item-based, top-k tables or ANN before scaling.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Implicit feedback.</b> All of this assumed star ratings. Most real data is plays, clicks and purchases: no stars, no negatives. How does CF work when all we know is who watched what?</div>

  <h2 id="cf-implicit"><span class="num">09</span>Implicit Feedback</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Forget the star values: suppose CineCity only knew who watched which film. There is no mean to subtract and no "below average". What do similarity and prediction look like now?</p>
  </div>
  <h3>By hand on the "watched" matrix</h3>
  <p>Turn every rating into a 1 ("watched") and every blank into 0 ("no record"). For 0/1 columns, cosine becomes a count: the number of users who watched both films, divided by the square root of the product of how many watched each.</p>
  <p style="text-align:center">cos(i, j) = |U<sub>i</sub> ∩ U<sub>j</sub>| / √(|U<sub>i</sub>|·|U<sub>j</sub>|) &nbsp;&nbsp; Jaccard(i, j) = |U<sub>i</sub> ∩ U<sub>j</sub>| / |U<sub>i</sub> ∪ U<sub>j</sub>|</p>
  <p>Ben watched Dangal, Chak De and DDLJ. Score each unseen film by the sum of its similarities to those three. K3G was watched by Asha, Chen, Dia, Esha; Dangal by Asha, Ben, Chen, Esha; both: Asha, Chen, Esha = 3, so cos = 3/√(4 × 4) = 0.75. Doing all nine pairs:</p>
  <div class="fx" data-lang="py">B = R.notna().astype(int)                       # implicit view: 1 = watched, 0 = no record
print(B)
pop_i = B.sum(axis=0)
co = B.T @ B                                    # co-watch counts for every pair of films
cos_b = co / np.sqrt(np.outer(pop_i, pop_i))    # cosine on 0/1 columns = |both| / sqrt(|i| |j|)
seen = B.columns[B.loc["Ben"] == 1]
unseen_b = B.columns[B.loc["Ben"] == 0]
for f in unseen_b:
    parts = {g: round(float(cos_b.loc[f, g]), 3) for g in seen}
    print(f"{f:8s} co-watch {co.loc[f, seen].to_dict()}  cosine {parts}  score {sum(parts.values()):.3f}")
jac = lambda u, v: (B.loc[u] &amp; B.loc[v]).sum() / (B.loc[u] | B.loc[v]).sum()
print("Jaccard to Ben:", {v: round(float(jac("Ben", v)), 3) for v in users if v != "Ben"})</div>
  <div class="fx" data-lang="text">      Dangal  Chak De  Lagaan  DDLJ  K3G  3 Idiots
Asha       1        1       0     1    1         1
Ben        1        1       0     1    0         0
Chen       1        0       0     1    1         0
Dia        0        1       0     1    1         1
Esha       1        0       1     0    1         1
Lagaan   co-watch {'Dangal': 1, 'Chak De': 0, 'DDLJ': 0}  cosine {'Dangal': 0.5, 'Chak De': 0.0, 'DDLJ': 0.0}  score 0.500
K3G      co-watch {'Dangal': 3, 'Chak De': 2, 'DDLJ': 3}  cosine {'Dangal': 0.75, 'Chak De': 0.577, 'DDLJ': 0.75}  score 2.077
3 Idiots co-watch {'Dangal': 2, 'Chak De': 2, 'DDLJ': 2}  cosine {'Dangal': 0.577, 'Chak De': 0.667, 'DDLJ': 0.577}  score 1.821
Jaccard to Ben: {'Asha': 0.6, 'Chen': 0.5, 'Dia': 0.4, 'Esha': 0.167}</div>
  <p>Implicit item-based CF ranks <strong>K3G first</strong> for Ben (2.077), then 3 Idiots (1.821), then Lagaan (0.5). With star ratings, both CF variants put K3G <em>last</em> (2.256 and 2.000). The reason: K3G was watched by four of the five users, including Chen and Dia who share films with Ben, but the stars showed that Ben's look-alikes disliked it. "Watched" is not "liked"; a popular film co-occurs with everything. This is the central difficulty of implicit CF and the reason to use stronger signals (finishes, repeat plays, purchases) and to down-weight popular items.</p>
  <h3>Making implicit CF work</h3>
  <ul>
    <li><strong>Weight the events</strong>: finish 3, play 1 (previous note); use log(1 + count) so a binge does not dominate.</li>
    <li><strong>Down-weight popular items and heavy users</strong>: inverse user frequency, IUF(i) = log(m / n<sub>i</sub>), the same idea as IDF in TF-IDF: co-watching a blockbuster says little, co-watching a niche film says a lot.</li>
    <li><strong>Score = sum of similarities</strong> to the user's items (no ratings to average), often over recent items only.</li>
    <li><strong>Evaluate with ranking metrics</strong>: hide one interaction per user and check whether it appears in the top 10 (<strong>hit rate@10</strong>).</li>
  </ul>
  <div class="fx" data-lang="py">X = np.zeros((nU, nI), int)
X[big.user, big.item] = 1                                       # every rating = "watched"
rng = np.random.default_rng(2)
held = np.array([rng.choice(np.flatnonzero(X[u])) for u in range(nU)])   # hide one film per user
Xtr = X.copy(); Xtr[np.arange(nU), held] = 0

def hit_rate(scores, k=10):
    scores = scores.astype(float).copy()
    scores[Xtr == 1] = -np.inf                                  # never recommend what was watched
    top = np.argpartition(-scores, k, axis=1)[:, :k]
    return np.mean([held[u] in top[u] for u in range(nU)])

popularity = np.tile(Xtr.sum(0), (nU, 1))                       # same list for everyone
n_i = Xtr.sum(0)
S_ib = (Xtr.T @ Xtr) / np.sqrt(np.outer(n_i, n_i) + 1e-9)       # film-film cosine on 0/1
np.fill_diagonal(S_ib, 0)
n_u = Xtr.sum(1)
S_ub = (Xtr @ Xtr.T) / np.sqrt(np.outer(n_u, n_u))              # user-user cosine on 0/1
np.fill_diagonal(S_ub, 0)
k_nb = 50
nb = np.argpartition(-S_ub, k_nb, axis=1)[:, :k_nb]             # each user's 50 nearest users
S_ub_k = np.zeros_like(S_ub); rows_ = np.arange(nU)[:, None]
S_ub_k[rows_, nb] = S_ub[rows_, nb]
iuf = np.log(nU / np.maximum(n_i, 1))                           # inverse user frequency, like IDF
for name, sc in [("popularity", popularity), ("item-based, cosine", Xtr @ S_ib),
                 ("user-based, cosine, k=50", S_ub_k @ Xtr),
                 ("item-based, IUF-weighted", (Xtr * iuf) @ S_ib)]:
    print(f"{name:26s} hit rate@10 = {hit_rate(sc):.3f}")
print(f"random guessing would give about {10 / (nI - 50):.3f}")</div>
  <div class="fx" data-lang="text">popularity                 hit rate@10 = 0.190
item-based, cosine         hit rate@10 = 0.269
user-based, cosine, k=50   hit rate@10 = 0.301
item-based, IUF-weighted   hit rate@10 = 0.296
random guessing would give about 0.011</div>
  <p>Hiding one watched film per user among 1,000: popularity (everyone gets the same top 10 unseen hits) recovers it 19.0% of the time, already 17× better than random (1.1%), because people do watch popular films. Item-based cosine reaches 26.9%, IUF-weighting it 29.6%, and user-based (50 nearest users) 30.1%. Every CF variant beats popularity by 40–60%.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Implicit CF</strong> works on a binary or confidence matrix (1/weight = interaction, 0 = unknown). Item similarity is usually cosine |U<sub>i</sub>∩U<sub>j</sub>|/√(|U<sub>i</sub>||U<sub>j</sub>|) or Jaccard, the score of item i for user u is Σ<sub>j∈I<sub>u</sub></sub> s(i, j), and evaluation uses top-N metrics. Model-based versions (implicit ALS with confidence weights, BPR) are in <a class="xref" data-note="ml_mf">Matrix Factorization</a> and <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating implicit counts as ratings and mean-centring them, or evaluating implicit CF with RMSE. There is no "below average" in "watched"; the zeros are unknowns, and the job is ranking.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CF in code.</b> We have computed similarities and predictions in many variants. Can one small class reproduce every hand number, and how does it map onto library tools?</div>

  <h2 id="cf-code"><span class="num">10</span>CF in Code</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Do we understand every piece well enough to rebuild it? Test: a class that fits on the CineCity table and gives back 4.744, 5.000, 2.256 and 4.870 exactly.</p>
  </div>
  <p>The class has two parts. <code>fit</code> centres by user mean and computes all similarities at once with matrix products: numerator = centred dot products, denominator = norms over <em>co-rated</em> cells only (the mask matrix M does that), then applies a minimum overlap and optional significance weighting β. <code>predict</code> picks the k most similar positive neighbours among those who rated the film (user-based) or among the films the user rated (item-based) and applies the formula of sections 04–05, clipped to 1–5.</p>
  <div class="fx" data-lang="py">class KNNCF:
    """Neighbourhood collaborative filtering on a users x films DataFrame (NaN = unknown)."""
    def __init__(self, kind="user", k=2, min_overlap=1, beta=None):
        self.kind, self.k, self.min_overlap, self.beta = kind, k, min_overlap, beta

    def fit(self, R):
        self.R = R
        self.mu = R.mean(axis=1)
        self.C = R.sub(self.mu, axis=0)                    # centre by user mean
        A = self.C if self.kind == "user" else self.C.T    # rows = the things we compare
        M = A.notna().astype(float).values
        V = A.fillna(0).values
        num = V @ V.T
        den = np.sqrt((V ** 2) @ M.T) * np.sqrt(M @ (V ** 2).T)   # norms over co-rated cells
        with np.errstate(invalid="ignore", divide="ignore"):
            S = np.where(den &gt; 0, num / den, np.nan)
        ov = M @ M.T
        S[ov &lt; self.min_overlap] = np.nan                  # too few co-ratings: no similarity
        if self.beta: S = S * np.minimum(ov, self.beta) / self.beta
        np.fill_diagonal(S, np.nan)
        self.S = pd.DataFrame(S, index=A.index, columns=A.index)
        return self

    def predict(self, u, i):
        if self.kind == "user":
            s = self.S.loc[u, self.R.index[self.R[i].notna()]]       # users who rated i
            dev = lambda nb: self.C.loc[nb, i]
        else:
            s = self.S.loc[i, self.R.columns[self.R.loc[u].notna()]]  # films u rated
            dev = lambda nb: self.C.loc[u, nb]
        s = s[s &gt; 0].sort_values(ascending=False).head(self.k)
        if s.empty: return float(self.mu[u])
        return float(np.clip(self.mu[u] + (s * dev(s.index)).sum() / s.abs().sum(), 1, 5))

    def recommend(self, u, n=3):
        unseen = self.R.columns[self.R.loc[u].isna()]
        return dict(sorted(((i, round(self.predict(u, i), 3)) for i in unseen), key=lambda t: -t[1])[:n])

print("user-based:", KNNCF("user").fit(R).recommend("Ben"))
print("item-based:", KNNCF("item").fit(R).recommend("Ben"))
print("user-based, min_overlap=2:", KNNCF("user", min_overlap=2).fit(R).recommend("Ben"))
print("user-based, beta=3:", KNNCF("user", beta=3).fit(R).recommend("Ben"))</div>
  <div class="fx" data-lang="text">user-based: {'3 Idiots': 4.744, 'Lagaan': 4.5, 'K3G': 2.256}
item-based: {'Lagaan': 5.0, '3 Idiots': 5.0, 'K3G': 2.0}
user-based, min_overlap=2: {'3 Idiots': 5.0, 'Lagaan': 4.0, 'K3G': 2.0}
user-based, beta=3: {'3 Idiots': 4.87, 'Lagaan': 4.5, 'K3G': 2.13}</div>
  <p>Every hand number is back: user-based 4.744 / 4.5 / 2.256, item-based 5.0 / 5.0 / 2.0, significance weighting 4.87 / 2.13. With <code>min_overlap=2</code>, Esha is dropped entirely: 3 Idiots then rests on Asha alone (5.0), and Lagaan has no neighbour left, so it falls back to Ben's mean (4.0). That is the coverage cost of strict overlap rules.</p>
  <h3>Library tools</h3>
  <p>scikit-learn has no recommender, but its <code>NearestNeighbors</code> finds neighbours fast (brute force, or tree indexes for low dimensions). The usual trick is to centre each row, fill blanks with 0 (= "my average"), and use cosine:</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import NearestNeighbors
Cz = C.fillna(0)                                   # centred, unknown = 0 (= "my average")
nn = NearestNeighbors(n_neighbors=5, metric="cosine").fit(Cz.values)
dist, idx = nn.kneighbors(Cz.loc[["Ben"]].values)        # the query point itself comes back first
print("sklearn, cosine on centred rows with 0 for unknown:",
      {users[j]: round(float(1 - d), 3) for j, d in zip(idx[0], dist[0]) if users[j] != "Ben"})
print("our co-rated centred cosine:", S_user.loc["Ben"].drop("Ben").round(3).to_dict())</div>
  <div class="fx" data-lang="text">sklearn, cosine on centred rows with 0 for unknown: {'Asha': 0.764, 'Esha': 0.118, 'Dia': -0.516, 'Chen': -0.667}
our co-rated centred cosine: {'Asha': 0.953, 'Chen': -0.8, 'Dia': -0.8, 'Esha': 1.0}</div>
  <p>Filling centred blanks with 0 changes the similarity: the denominator now includes all of a user's ratings, not just the shared ones. Ben–Esha drops from 1.000 to 0.118 (by hand: dot = 1 × 0.5 = 0.5; lengths √6 and √3; 0.5/4.243). That acts as an automatic penalty for small overlap, which is why this cheap version often works well on sparse data. Dedicated libraries: <code>surprise</code> (KNNBasic, KNNWithMeans, KNNBaseline), <code>implicit</code> (item-item and ALS for implicit data), and Spark MLlib for distributed jobs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Vectorised similarity: with C the centred matrix (0 for unknown) and M the 0/1 mask, user similarities are S = CCᵀ ⊘ (√((C∘C)Mᵀ) ∘ √(M(C∘C)ᵀ)), where ∘ and ⊘ are element-wise product and division; the two square roots are each user's norm restricted to the co-rated items.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Letting a user be their own neighbour. <code>NearestNeighbors.kneighbors</code> returns the query point first when it is in the fitted data, and a similarity matrix has 1.0 on the diagonal. Drop it (we set the diagonal to NaN).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> Many quantities, many variants. How do they build on each other, and which one answers which question?</div>

  <h2 id="cf-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Overlap, raw cosine, centring, Pearson, neighbours, adjusted cosine, shrinkage, hold-out, implicit scores: one system or a bag of tricks?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 340" width="680">
<defs><marker id="cf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="180" height="40" rx="7" class="fb sb"/><text x="340" y="25" text-anchor="middle" font-size="11.5" font-weight="700">rating matrix R</text><text x="340" y="40" text-anchor="middle" class="tm" font-size="10">19 ratings, Ben: 5, 5, 2</text>
<line x1="300" y1="48" x2="130" y2="74" stroke="currentColor" marker-end="url(#cf-a9)"/><line x1="340" y1="48" x2="340" y2="74" stroke="currentColor" marker-end="url(#cf-a9)"/><line x1="380" y1="48" x2="560" y2="74" stroke="currentColor" marker-end="url(#cf-a9)"/>
<rect x="20" y="76" width="220" height="40" rx="7" class="fb sb"/><text x="130" y="93" text-anchor="middle" font-size="11.5" font-weight="700">overlap n<tspan font-size="8" dy="2">uv</tspan></text><text x="130" y="108" text-anchor="middle" class="tm" font-size="10">Ben–Esha 1 film</text>
<rect x="250" y="76" width="180" height="40" rx="7" class="fb sb"/><text x="340" y="93" text-anchor="middle" font-size="11.5" font-weight="700">user means → centring</text><text x="340" y="108" text-anchor="middle" class="tm" font-size="10">Ben 4: +1, +1, −2</text>
<rect x="450" y="76" width="210" height="40" rx="7" class="fb sb"/><text x="555" y="93" text-anchor="middle" font-size="11.5" font-weight="700">0/1 "watched"</text><text x="555" y="108" text-anchor="middle" class="tm" font-size="10">implicit view</text>
<line x1="300" y1="116" x2="200" y2="144" stroke="currentColor" marker-end="url(#cf-a9)"/><line x1="380" y1="116" x2="470" y2="144" stroke="currentColor" marker-end="url(#cf-a9)"/>
<rect x="60" y="146" width="250" height="40" rx="7" class="ft st"/><text x="185" y="163" text-anchor="middle" font-size="11.5" font-weight="700">centred cosine (rows)</text><text x="185" y="178" text-anchor="middle" class="tm" font-size="10">Asha .953 · Chen −.800 · Esha 1.0</text>
<rect x="340" y="146" width="250" height="40" rx="7" class="ft st"/><text x="465" y="163" text-anchor="middle" font-size="11.5" font-weight="700">adjusted cosine (columns)</text><text x="465" y="178" text-anchor="middle" class="tm" font-size="10">3 Idiots–Dangal .976, –DDLJ −.949</text>
<line x1="130" y1="116" x2="150" y2="214" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#cf-a9)"/>
<line x1="185" y1="186" x2="185" y2="214" stroke="currentColor" marker-end="url(#cf-a9)"/><line x1="465" y1="186" x2="465" y2="214" stroke="currentColor" marker-end="url(#cf-a9)"/>
<rect x="60" y="216" width="250" height="40" rx="7" class="fg sg"/><text x="185" y="233" text-anchor="middle" font-size="11.5" font-weight="700">shrink × min(n, β)/β → user-based</text><text x="185" y="248" text-anchor="middle" class="tm" font-size="10">3 Idiots 4.744 → 4.870 · K3G 2.256</text>
<rect x="340" y="216" width="250" height="40" rx="7" class="fg sg"/><text x="465" y="233" text-anchor="middle" font-size="11.5" font-weight="700">item-based prediction</text><text x="465" y="248" text-anchor="middle" class="tm" font-size="10">3 Idiots 5.0 · K3G 2.0</text>
<line x1="555" y1="116" x2="640" y2="214" stroke="currentColor" marker-end="url(#cf-a9)"/>
<rect x="600" y="216" width="72" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="636" y="233" text-anchor="middle" font-size="10">implicit</text><text x="636" y="248" text-anchor="middle" class="tm" font-size="9.5">K3G 2.077</text>
<line x1="185" y1="256" x2="300" y2="284" stroke="currentColor" marker-end="url(#cf-a9)"/><line x1="465" y1="256" x2="380" y2="284" stroke="currentColor" marker-end="url(#cf-a9)"/>
<rect x="190" y="286" width="300" height="44" rx="7" class="fr sr"/><text x="340" y="304" text-anchor="middle" font-size="11.5" font-weight="700">hold-out evaluation</text><text x="340" y="320" text-anchor="middle" class="tm" font-size="10">baseline .771 · plain CF .777 · shrunk .746 · on baseline .744</text>
</svg><figcaption>Everything grows from the rating matrix. Centring feeds both similarity directions; overlap feeds shrinkage; the 0/1 view feeds implicit CF; one hold-out procedure judges them all.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the CineCity running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>CineCity value</th><th>Sensitive to</th><th>Use when</th></tr>
    <tr><td>Overlap n<sub>uv</sub></td><td>0/1 mask × its transpose</td><td>how much evidence?</td><td>Ben–Asha 3, Ben–Esha 1</td><td>sparsity</td><td>shrinkage, minimum overlap</td></tr>
    <tr><td>Raw cosine</td><td>co-rated ratings</td><td>do rows point the same way?</td><td>Ben–Chen 0.690 (misleading)</td><td>positive scale</td><td>0/1 implicit data only</td></tr>
    <tr><td>User mean, centring</td><td>row means</td><td>above or below my usual?</td><td>Ben 4.0 → +1, +1, −2</td><td>few ratings</td><td>always with ratings</td></tr>
    <tr><td>Centred cosine</td><td>centred co-rated vectors</td><td>do two users agree?</td><td>Asha 0.953, Chen −0.800</td><td>tiny overlap</td><td>user-based default</td></tr>
    <tr><td>Pearson</td><td>centring on co-rated means</td><td>same, stricter</td><td>Asha 0.971, Chen −1.000</td><td>needs 3+ items</td><td>dense data</td></tr>
    <tr><td>User-based prediction</td><td>r̄<sub>u</sub> + weighted centred ratings of neighbours</td><td>what will Ben rate?</td><td>3 Idiots 4.744, Lagaan 4.5, K3G 2.256</td><td>k, neighbours' overlap</td><td>many items per user</td></tr>
    <tr><td>Adjusted cosine</td><td>user-centred film columns</td><td>are two films rated alike?</td><td>3 Idiots–Dangal 0.976</td><td>films with few raters</td><td>item-based default</td></tr>
    <tr><td>Item-based prediction</td><td>r̄<sub>u</sub> + weighted centred ratings of Ben's similar films</td><td>what will Ben rate?</td><td>3 Idiots 5.0, K3G 2.0</td><td>k</td><td>stable catalogues; serving at scale</td></tr>
    <tr><td>Significance weighting</td><td>similarity × min(n, β)/β</td><td>how much to trust it?</td><td>Esha 1.0 → 0.333; 3 Idiots 4.870</td><td>β</td><td>always on sparse data</td></tr>
    <tr><td>Hold-out RMSE</td><td>hidden ratings</td><td>does it work?</td><td>toy LOO 1.208; scale 0.744–0.777</td><td>split type</td><td>every comparison</td></tr>
    <tr><td>Implicit item score</td><td>0/1 cosine, sum over the user's items</td><td>what will Ben watch?</td><td>K3G 2.077, 3 Idiots 1.821</td><td>popularity</td><td>clicks, plays, purchases</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>collaborative filtering predicts a blank as "your usual, adjusted by how much your look-alikes (or the films that behave like this one) deviated from theirs", and every refinement (centring, adjusted cosine, shrinkage, baseline-centring, IUF) is a way of making "look-alike" and "deviated" more honest.</strong></p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> How does neighbourhood CF stand against content-based filtering and against matrix factorization?</div>

  <h2 id="cf-compare"><span class="num">12</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>User-based or item-based? And when should we move on from neighbourhoods altogether?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>User-based CF</th><th>Item-based CF</th><th><a class="xref" data-note="ml_recsys">Content-based</a></th><th><a class="xref" data-note="ml_mf">Matrix factorization</a></th></tr>
    <tr><td>Compares</td><td>users (rows)</td><td>items (columns)</td><td>user profile vs item features</td><td>learned user and item vectors</td></tr>
    <tr><td>Ben → 3 Idiots</td><td>4.744 (shrunk 4.870)</td><td>5.000</td><td>last (cos −0.235)</td><td>see that note</td></tr>
    <tr><td>Scale RMSE (shrunk / best)</td><td>0.746 / 0.744</td><td>0.761 / 0.744</td><td>0.801</td><td>see that note</td></tr>
    <tr><td>Stability</td><td>neighbours change with every rating</td><td>item similarities change slowly</td><td>stable</td><td>retrain periodically</td></tr>
    <tr><td>Precompute</td><td>hard (users drift)</td><td>easy: top-k similar items</td><td>item vectors</td><td>all vectors</td></tr>
    <tr><td>Explanation</td><td>"people like you"</td><td>"because you liked X"</td><td>"because it is sports"</td><td>hard</td></tr>
    <tr><td>Serendipity</td><td>high</td><td>medium</td><td>low</td><td>high</td></tr>
    <tr><td>New user / new item</td><td>✘ / ✘</td><td>✘ / ✘</td><td>✘ / ✔</td><td>✘ / ✘ (✔ with features)</td></tr>
    <tr><td>Sparse data</td><td>weak</td><td>weak</td><td>unaffected</td><td>strong (shares information through factors)</td></tr>
    <tr><td>Best when</td><td>fewer users than items, users with long histories</td><td>many users, stable catalogue (shops)</td><td>rich features, new items</td><td>large sparse matrices</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_mf">Matrix Factorization</a>.</b> Neighbourhoods need overlapping ratings and can only link users through shared items. Matrix factorization gives every user and film a short vector of hidden traits (exactly the "star power" and "director style" our simulation hid), so any user can be compared with any film.</div>

  <h2 id="cf-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: raw cosine on ratings</span><p>All-positive ratings make opposite users look similar (Ben–Chen 0.690). Mean-centre first.</p></div>
  <div class="callout trap"><span class="label">Trap: filling blanks with 0 as ratings</span><p>A blank is "unknown", not "zero stars". Compute on co-rated items, or centre first so 0 means "average".</p></div>
  <div class="callout trap"><span class="label">Trap: trusting tiny overlaps</span><p>One shared film gave Esha similarity 1.0 and top-neighbour status. Use significance weighting or shrinkage.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting to add the mean back</span><p>A weighted average of centred ratings is a deviation; the prediction is r̄<sub>u</sub> + deviation.</p></div>
  <div class="callout trap"><span class="label">Trap: global neighbours</span><p>Choose neighbours per (user, item) among those who rated the item, not one fixed list per user.</p></div>
  <div class="callout trap"><span class="label">Trap: no baseline</span><p>Plain CF (0.777) lost to μ + b<sub>u</sub> + b<sub>i</sub> (0.771). Always compare with the baseline and with popularity.</p></div>
  <div class="callout trap"><span class="label">Trap: leaking the hidden rating</span><p>Means and similarities must be computed after hiding the test ratings.</p></div>
  <div class="callout trap"><span class="label">Trap: "watched" = "liked"</span><p>Implicit CF ranked K3G first for Ben although his look-alikes disliked it. Weight strong events, down-weight popular items, evaluate with ranking metrics.</p></div>
  <div class="callout trap"><span class="label">Trap: dense all-pairs at scale</span><p>An m × m matrix for crores of users does not fit anywhere. Item-based top-k tables, sparse products, ANN.</p></div>

  <h2 id="cf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: CineCity ratings (· = not rated). Goal: predict Ben's ratings for Lagaan, K3G and 3 Idiots.</p>
  <table class="tbl">
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>mean</th><th>sim to Ben (centred)</th><th>shared with Ben</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>·</td><td>1</td><td>1</td><td>4</td><td>3.0</td><td>0.953</td><td>3</td></tr>
    <tr><td>Ben</td><td>5</td><td>5</td><td>·</td><td>2</td><td>·</td><td>·</td><td>4.0</td><td>—</td><td>—</td></tr>
    <tr><td>Chen</td><td>2</td><td>·</td><td>·</td><td>5</td><td>5</td><td>·</td><td>4.0</td><td>−0.800</td><td>2</td></tr>
    <tr><td>Dia</td><td>·</td><td>1</td><td>·</td><td>4</td><td>5</td><td>2</td><td>3.0</td><td>−0.800</td><td>2</td></tr>
    <tr><td>Esha</td><td>5</td><td>·</td><td>5</td><td>·</td><td>3</td><td>5</td><td>4.5</td><td>1.000 (shrunk 0.333)</td><td>1</td></tr>
  </table>
  <h3>The question ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>CineCity answer</th><th>Weakness → next</th></tr>
    <tr><td>Collaborative idea</td><td>recommend without features?</td><td>use people who agree with Ben</td><td>how to measure agreement?</td></tr>
    <tr><td>Raw cosine</td><td>how alike are two rows?</td><td>Asha 0.987, Chen 0.690</td><td>opposites look similar</td></tr>
    <tr><td>Mean-centring</td><td>remove rating habits?</td><td>Asha 0.953, Chen −0.800; Pearson 0.971</td><td>how to predict?</td></tr>
    <tr><td>User-based</td><td>neighbours → number?</td><td>3 Idiots 4.744, Lagaan 4.5, K3G 2.256</td><td>users drift, many users</td></tr>
    <tr><td>Item-based</td><td>compare films instead?</td><td>3 Idiots 5.0, Lagaan 5.0, K3G 2.0</td><td>tiny overlaps give 1.0</td></tr>
    <tr><td>Similarity choices, shrinkage</td><td>which measure; trust?</td><td>Esha 1.0 → 0.333; 3 Idiots 4.870</td><td>which is really better?</td></tr>
    <tr><td>Hold-out</td><td>does it work?</td><td>LOO 1.208 vs 1.650; scale 0.744 vs baseline 0.771</td><td>why fragile?</td></tr>
    <tr><td>Sparsity &amp; scale</td><td>real data?</td><td>58% film pairs share no rater; O(m²)</td><td>clicks, not stars</td></tr>
    <tr><td>Implicit</td><td>only "who watched"?</td><td>K3G 2.077 (watched ≠ liked); hit@10 0.30 vs 0.19</td><td>code it</td></tr>
    <tr><td>Code</td><td>reproduce it?</td><td>KNNCF matches all hand numbers</td><td>→ Matrix Factorization</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Centred cosine (users)</td><td>Σ<sub>I<sub>uv</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)(r<sub>vi</sub> − r̄<sub>v</sub>) / (√Σ(r<sub>ui</sub> − r̄<sub>u</sub>)² √Σ(r<sub>vi</sub> − r̄<sub>v</sub>)²)</td><td>I<sub>uv</sub> co-rated items; r̄ mean of all the user's ratings (Pearson: mean over I<sub>uv</sub>)</td></tr>
    <tr><td>User-based prediction</td><td>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>v∈N<sub>k</sub>(u,i)</sub> s<sub>uv</sub>(r<sub>vi</sub> − r̄<sub>v</sub>) / Σ|s<sub>uv</sub>|</td><td>N<sub>k</sub>(u,i): k most similar users who rated i, s &gt; 0</td></tr>
    <tr><td>Adjusted cosine (items)</td><td>Σ<sub>U<sub>ij</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)(r<sub>uj</sub> − r̄<sub>u</sub>) / (√Σ(r<sub>ui</sub> − r̄<sub>u</sub>)² √Σ(r<sub>uj</sub> − r̄<sub>u</sub>)²)</td><td>U<sub>ij</sub> users who rated both; centre by USER mean</td></tr>
    <tr><td>Item-based prediction</td><td>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>j∈N<sub>k</sub>(i;u)</sub> s<sub>ij</sub>(r<sub>uj</sub> − r̄<sub>u</sub>) / Σ|s<sub>ij</sub>|</td><td>N<sub>k</sub>(i;u): k items rated by u most similar to i</td></tr>
    <tr><td>Significance weighting</td><td>s′ = s · min(n<sub>uv</sub>, β)/β</td><td>n<sub>uv</sub> co-rated count; β ≈ 25–100 in practice (3 here)</td></tr>
    <tr><td>Jaccard / binary cosine</td><td>|A∩B|/|A∪B| ; |A∩B|/√(|A||B|)</td><td>sets of items (or users)</td></tr>
    <tr><td>Baseline</td><td>b<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub></td><td>global mean, damped user and item offsets</td></tr>
    <tr><td>RMSE</td><td>√(mean (r̂ − r)²) on hidden ratings</td><td>MAE = mean |r̂ − r|</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Item-based CF</b><p>Shops and catalogues with many users and a stable item set; need fast serving and "because you liked X" explanations.</p><small>Precompute top-k similar items</small></div>
    <div><b>User-based CF</b><p>Fewer users than items, long user histories, when serendipity from "people like you" matters.</p><small>Costly to keep fresh</small></div>
    <div><b>Implicit CF</b><p>Clicks, plays, purchases: binary cosine or Jaccard, IUF weighting, ranking metrics.</p><small>Watched ≠ liked</small></div>
    <div><b>Avoid / move on</b><p>Very sparse data, brand-new users or items, need to link users with no shared items.</p><small>Matrix factorization, content, popularity</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Raw cosine on positive ratings; blanks as zero stars; trusting one-item overlaps; forgetting to add the mean back; one global neighbour list; no baseline comparison; leaking hidden ratings into means; treating watched as liked; dense all-pairs matrices at scale.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Centred vectors (1, 1, −2) and (2, 1, −2): similarity?</td><td>7/(√6 × 3) = 0.953</td></tr>
    <tr><td>Ben mean 4; neighbours s = 1.0 (dev +0.5), 0.953 (dev +1.0). Prediction?</td><td>4 + 1.453/1.953 = 4.744</td></tr>
    <tr><td>Similarity 1.0 from 1 shared item, β = 3. Weighted?</td><td>1.0 × 1/3 = 0.333</td></tr>
    <tr><td>Why is item-based preferred in large shops?</td><td>Item similarities are stable, well supported, precomputable and explainable</td></tr>
    <tr><td>U<sub>K3G</sub> = {A, C, D, E}, U<sub>Dangal</sub> = {A, B, C, E}: binary cosine?</td><td>3/√(4 × 4) = 0.75</td></tr>
  </table>

  <h2 id="cf-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is collaborative filtering, and how does it differ from content-based filtering?</summary><div class="qa-body">CF predicts a user's preference from other users' interactions, using only the user × item matrix, no item features. Content-based uses item features and the user's own history. CF can find links nobody wrote down (people who love Dangal also love 3 Idiots: CF 4.744 vs content cosine −0.235) but cannot handle brand-new items or users.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must ratings be mean-centred before computing cosine similarity?</summary><div class="qa-body">Ratings are all positive, so raw vectors all point into one corner and cosine is never negative: Ben–Chen = 0.690 although they disagree completely. Subtracting each user's mean turns ratings into above/below "my usual", removes rating habits (Esha's generosity) and lets opposite tastes get negative similarity: Ben–Chen −0.800.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through a user-based prediction for Ben → 3 Idiots.</summary><div class="qa-body">Raters: Asha 4, Dia 2, Esha 5, with means 3, 3, 4.5 → centred +1, −1, +0.5. Similarities to Ben: 0.953, −0.800, 1.000. Keep the 2 most similar positive: Esha and Asha. r̂ = 4 + (1.0 × 0.5 + 0.953 × 1.0)/(1.0 + 0.953) = 4 + 0.744 = 4.744.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is adjusted cosine and why is it used for item-based CF?</summary><div class="qa-body">Cosine between two item columns after subtracting each <em>user's</em> mean from their ratings, over users who rated both. It removes user rating habits from the item comparison. 3 Idiots vs Dangal over Asha (1, 2) and Esha (0.5, 0.5): 2.25/(1.118 × 2.062) = 0.976.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do large e-commerce sites prefer item-based CF?</summary><div class="qa-body">There are many more users than items, each item has many ratings so item similarities are better supported, they change slowly so they can be precomputed offline as top-k tables, serving is a fast lookup, and explanations ("because you bought X") are natural. Amazon's item-to-item CF is the classic example.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two users share one rated item and get similarity 1.0. What do you do?</summary><div class="qa-body">Do not trust it: apply significance weighting s·min(n, β)/β or shrinkage s·n/(n + λ), or require a minimum overlap. With β = 3, Esha's 1.0 becomes 0.333 and Ben → 3 Idiots moves from 4.744 to 4.870 as Asha's well-supported opinion dominates. At scale, shrinkage improved user-based RMSE from 0.777 to 0.746.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you evaluate a CF model offline, and what can go wrong?</summary><div class="qa-body">Hide known ratings (random, per-user, or better a time split), fit everything on the rest, predict the hidden ones and report RMSE/MAE, coverage and top-N metrics. Pitfalls: computing means/similarities before hiding (leakage), tuning k on the test set, random splits that use the future, tiny data artefacts (LOO made the user mean worse than the global mean on CineCity), and no baseline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the scale experiment plain CF did not beat the baseline. Why, and what fixed it?</summary><div class="qa-body">The baseline μ + b<sub>u</sub> + b<sub>i</sub> already captures rater habits and film quality (0.771). Plain CF's similarities often rest on a few co-ratings, so the neighbours' votes add noise (0.777). Significance weighting (0.746) and centring on the full baseline instead of the user mean (0.744) made CF add real signal on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the sparsity and scalability problems of neighbourhood CF?</summary><div class="qa-body">Sparsity: most pairs share few or no items (58% of film pairs had no common rater at 5% density), so similarities are unreliable or undefined, coverage drops, and users with no shared items cannot be linked. Scalability: all-pairs similarity is O(m²); handled with sparse products, co-occurring pairs only, top-k neighbour tables, ANN/LSH, sampling and offline jobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CF change for implicit feedback?</summary><div class="qa-body">Use a 0/1 or confidence matrix, binary cosine |A∩B|/√(|A||B|) or Jaccard, score = sum of similarities to the user's items, down-weight popular items (IUF) and heavy users, and evaluate with top-N metrics such as hit rate. Beware "watched ≠ liked": implicit CF ranked K3G first for Ben, whom ratings say would dislike it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is user-based CF related to K-Nearest Neighbors?</summary><div class="qa-body">It is KNN regression where each user is a point described by their rating row, distance is (1 − centred cosine) on co-rated items, and the target is the rating of item i, averaged over the k nearest users who have that target, weighted by similarity and corrected for each neighbour's mean. Same bias-variance trade-off in k: k = 1 gave RMSE 0.997, k ≥ 20 about 0.761.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: significance weighting, the damped mean and ridge regression share one idea. Which?</summary><div class="qa-body">Shrinkage toward a safe prior when evidence is thin. The damped mean pulls a film's average toward the global mean with m virtual ratings; significance weighting pulls a similarity toward 0 until there are β co-ratings; ridge pulls coefficients toward 0 with penalty λ. All trade a little bias for a big cut in variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does sparsity motivate matrix factorization?</summary><div class="qa-body">Neighbourhood CF can only compare users through items they both rated, so in a 99%-empty matrix most pairs are incomparable and similarities are noisy. Matrix factorization gives every user and item a short vector of latent factors learned from all ratings at once, so any user can be scored against any item, and information flows through shared factors rather than shared items.</div></details>
</main>
`
});
