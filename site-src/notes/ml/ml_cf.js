// notes/ml/ml_cf.js — Collaborative Filtering
Object.assign(TOPIC_CONTENT, {
  "ml_cf": `<main>
<h1>Collaborative Filtering</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Collaborative Filtering</span></div>
  <p class="lead">Collaborative filtering recommends using nothing but other people's behaviour: no genres, no descriptions, only the table of who rated what. Its idea is the one we use every day when we ask a friend with similar taste for a film suggestion: people who agreed with you in the past will probably agree with you again. It matters because it finds connections nobody wrote down as a feature, and because "people who bought this also bought" has driven shop and streaming recommendations for decades. This note builds neighbourhood collaborative filtering from scratch on the CineCity running example from <a class="xref" data-note="ml_recsys">Recommendation Systems: Basics &amp; Content-Based</a>: five friends, six films, 19 ratings, and the question of which of Lagaan, K3G and 3 Idiots to show Ben. Content-based filtering ranked 3 Idiots last for Ben because its tags look like a film he disliked; by the end of this note, the people who share Ben's taste will have ranked it first.</p>

  <h2 id="cf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Collaborative Filtering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Similarity</div>
        <ul>
          <li>Only the rating matrix; compare on <b>co-rated</b> items</li>
          <li>Raw cosine on ratings: everyone looks similar (Ben–Chen 0.690)</li>
          <li><b>Mean-centre</b> first: Ben–Asha 0.953, Ben–Chen −0.800</li>
          <li>Pearson, Jaccard, MSD; <b>significance weighting</b> for small overlaps</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Prediction</div>
        <ul>
          <li><b>User-based</b>: r̄<sub>u</sub> + weighted centred ratings of similar users</li>
          <li><b>Item-based</b>: r̄<sub>u</sub> + weighted centred ratings of similar items u rated</li>
          <li>Ben: 3 Idiots 4.744 / 5.0, Lagaan 4.5 / 5.0, K3G 2.256 / 2.0</li>
          <li>Item-based is the industry default: stable, precomputable</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluation and scale</div>
        <ul>
          <li>Hide ratings, predict, RMSE; always beat μ + b<sub>u</sub> + b<sub>i</sub></li>
          <li>Scale: plain CF 0.777 vs baseline 0.771; shrunk 0.746; on baseline 0.744</li>
          <li>Sparsity: 58% of film pairs share no rater; all pairs is O(n²)</li>
          <li>Fixes: sparse maths, top-k tables, approximate search</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Implicit data</div>
        <ul>
          <li>0/1 "watched": cosine |both| / √(|i||j|), Jaccard</li>
          <li>Score = sum of similarities to the user's items</li>
          <li>Watched ≠ liked; down-weight popular items (IUF)</li>
          <li>Hit rate@10: CF 0.27–0.30 vs popularity 0.19</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cf-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Learning From Other People</span><span class="rm-sub">the collaborative idea and co-rated films</span></div></div>
      <div class="rm-item rm-done" data-target="cf-sim"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Measuring Agreement Between Users</span><span class="rm-sub">cosine on shared ratings, and its flaw</span></div></div>
      <div class="rm-item rm-done" data-target="cf-centre"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Mean-Centring and Pearson Correlation</span><span class="rm-sub">removing rating habits</span></div></div>
      <div class="rm-item rm-done" data-target="cf-user"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">User-Based Collaborative Filtering</span><span class="rm-sub">predicting from similar people</span></div></div>
      <div class="rm-item rm-done" data-target="cf-item"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Item-Based Collaborative Filtering</span><span class="rm-sub">predicting from similar films</span></div></div>
      <div class="rm-item rm-done" data-target="cf-choices"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Choosing a Similarity and Trusting Overlap</span><span class="rm-sub">eight measures, significance weighting</span></div></div>
      <div class="rm-item rm-done" data-target="cf-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Evaluating on Hidden Ratings</span><span class="rm-sub">leave-one-out, scale, choosing k</span></div></div>
      <div class="rm-item rm-done" data-target="cf-sparse"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Sparsity and Scalability</span><span class="rm-sub">why it is fragile and slow, and the fixes</span></div></div>
      <div class="rm-item rm-done" data-target="cf-implicit"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Implicit Feedback</span><span class="rm-sub">when all we know is who watched what</span></div></div>
      <div class="rm-item rm-done" data-target="cf-code"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Neighbourhood CF in Code</span><span class="rm-sub">one class, library tools, comparison</span></div></div>
      <div class="rm-item rm-done" data-target="cf-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">raw cosine, tiny overlaps, leakage</span></div></div>
      <div class="rm-item rm-done" data-target="cf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, Ben's numbers, comparison</span></div></div>
      <div class="rm-item rm-done" data-target="cf-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on CF</span></div></div>
    </div>
  </div>

  <h2 id="cf-idea"><span class="num">01</span>Learning From Other People</h2>
  <p>Content-based filtering, in the previous note, could only recommend films whose features resemble what Ben already liked. It put 3 Idiots last for him (cosine −0.235), because its tags, drama and comedy, look like DDLJ, which he rated 2. Yet the two other users who gave Dangal a 5, Asha and Esha, rated 3 Idiots 4 and 5. Something about 3 Idiots appeals to people with Ben's taste, and no tag records it. To use that kind of evidence we need a method that learns from what other people did, with no features at all. Here is the CineCity table again; blank means "not rated":</p>
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
  <p>Look for people whose past ratings agree with Ben's, then see what they thought of the films Ben has not rated. Asha also gave Dangal a 5 and DDLJ a low score, and she gave 3 Idiots a 4. Chen and Dia disagree with Ben on everything, so their opinions should count less, or even count the other way. This is <strong>collaborative filtering</strong> (CF): predicting a user's preference for an item from the preferences of other users, using only the interaction matrix. The users "collaborate", without knowing it, to filter the catalogue for each other. Think of a classmate who loved the same five films you did and hated the same two: when she raves about a sixth film, you will probably like it too, even if neither of you can say what the films have in common.</p>
  <p>There are two mirror-image versions. <strong>User-based</strong> CF finds users similar to Ben and averages their opinions of the target film: "people like you liked 3 Idiots". <strong>Item-based</strong> CF finds films that are rated similarly to the target film, judged by who rated them how, and averages Ben's own ratings of those films: "because you liked Dangal". Both belong to <strong>neighbourhood</strong> (or memory-based) CF, which predicts directly from the k most similar users or items, much like <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a>. The other family, model-based CF, fits a compact model of the whole matrix and is the subject of <a class="xref" data-note="ml_mf">Matrix Factorization</a>.</p>
  <p>Both versions first need to know which films two users have both rated, because that is the only place their opinions can be compared. These are their <strong>co-rated</strong> items, written I<sub>uv</sub> for users u and v. Counting them for every pair of users is a single matrix product of the 0/1 "has rated" table with its own transpose:</p>
  <div class="fx" data-lang="py">known = R.notna().astype(int)
overlap = known @ known.T                    # co-rated films for every pair of users
print(overlap)</div>
  <div class="fx" data-lang="text">      Asha  Ben  Chen  Dia  Esha
Asha     5    3     3    4     3
Ben      3    3     2    2     1
Chen     3    2     3    2     2
Dia      4    2     2    4     2
Esha     3    1     2    2     4</div>
  <p>The diagonal is how many films each user rated (Ben 3). Off the diagonal, Ben shares 3 films with Asha, 2 with Chen and Dia, and only 1 (Dangal) with Esha. Every similarity in this note is computed on these few shared films, and that is where both the power and the fragility of collaborative filtering come from. It also explains CF's blind spot: a film nobody has rated, or a user who has rated nothing, shares nothing with anyone, so CF can say nothing about them. That is the cold-start problem, handled by content and popularity in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>

  <h2 id="cf-sim"><span class="num">02</span>Measuring Agreement Between Users</h2>
  <p>"Asha agrees with Ben" is a feeling. To weight her opinion we need a number that says how similar two partly blank rating rows are. The natural first attempt is the cosine similarity from the previous note, computed on co-rated films only: treat each user's ratings of the shared films as a vector, and divide their dot product by the product of their lengths. By hand for Ben and each other user:</p>
  <table class="tbl">
    <tr><th>Pair</th><th>shared films</th><th>Ben</th><th>other</th><th>dot</th><th>lengths</th><th>cosine</th></tr>
    <tr><td>Ben–Asha</td><td>Dangal, Chak De, DDLJ</td><td>(5, 5, 2)</td><td>(5, 4, 1)</td><td>25 + 20 + 2 = 47</td><td>√54 = 7.348, √42 = 6.481</td><td>47/47.62 = 0.987</td></tr>
    <tr><td>Ben–Chen</td><td>Dangal, DDLJ</td><td>(5, 2)</td><td>(2, 5)</td><td>10 + 10 = 20</td><td>√29, √29</td><td>20/29 = 0.690</td></tr>
    <tr><td>Ben–Dia</td><td>Chak De, DDLJ</td><td>(5, 2)</td><td>(1, 4)</td><td>5 + 8 = 13</td><td>√29 = 5.385, √17 = 4.123</td><td>13/22.20 = 0.585</td></tr>
    <tr><td>Ben–Esha</td><td>Dangal</td><td>(5)</td><td>(5)</td><td>25</td><td>5, 5</td><td>1.000</td></tr>
  </table>
  <p>The code repeats this, and also shows the tempting shortcut of filling every blank with 0 and taking cosine over all six films:</p>
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
  <p>The co-rated column matches the table. The zero-filled column gives different and meaningless numbers (Ben–Asha 0.833, Ben–Esha 0.371): filling with 0 claims "Ben rated K3G zero stars", which is false, and it mixes "how much do they agree" with "how many films do they share". We keep the co-rated version.</p>
  <p>But look again at Ben–Chen. Ben gave Dangal 5 and DDLJ 2; Chen gave Dangal 2 and DDLJ 5. They disagree completely, yet the cosine says 0.690, "fairly similar". The reason is geometric. Ratings from 1 to 5 are all positive, so every rating vector points into the same corner of space, and the angle between any two of them is at most 90°. Raw cosine on ratings therefore can never be negative and can never say "opposite taste". And Esha shares a single film with Ben, so their cosine is a perfect but meaningless 1.000. Both problems need fixing before we can trust any similarity.</p>

  <h2 id="cf-centre"><span class="num">03</span>Mean-Centring and Pearson Correlation</h2>
  <p>A raw rating mixes two things: the user's <em>taste</em> (does she like this film?) and the user's <em>habit</em> (how does she use the scale?). Esha averages 4.5, so her 3 for K3G is a complaint; for Asha, who averages 3, a 3 would be neutral. Two teachers marking the same essays show the same thing: one gives everyone 7 to 9, the other 3 to 9, so to see whether they agree on which essays are good, you compare how far each mark sits above or below that teacher's own average, not the raw marks.</p>
  <p>That is <strong>mean-centring</strong>: subtract each user's average rating from all their ratings, so every number means "above (+) or below (−) my usual". By hand: Asha (5 + 4 + 1 + 1 + 4)/5 = 3.0, Ben (5 + 5 + 2)/3 = 4.0, Chen 4.0, Dia 3.0, Esha (5 + 5 + 3 + 5)/4 = 4.5.</p>
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
  <p>Ben's row becomes (+1, +1, −2): relative to his own scale he liked the two sports films and disliked DDLJ. Esha's 3 for K3G becomes −1.5, a clear "no". Each centred row now has positive and negative parts, so two users' vectors can point in opposite directions. Recomputing the cosine on the centred co-rated values gives the <strong>mean-centred cosine</strong>:</p>
  <table class="tbl">
    <tr><th>Pair</th><th>Ben centred</th><th>other centred</th><th>dot</th><th>lengths</th><th>centred cosine</th></tr>
    <tr><td>Ben–Asha</td><td>(1, 1, −2)</td><td>(2, 1, −2)</td><td>2 + 1 + 4 = 7</td><td>√6 = 2.449, √9 = 3</td><td>7/7.348 = 0.953</td></tr>
    <tr><td>Ben–Chen</td><td>(1, −2)</td><td>(−2, 1)</td><td>−2 − 2 = −4</td><td>√5, √5</td><td>−4/5 = −0.800</td></tr>
    <tr><td>Ben–Dia</td><td>(1, −2)</td><td>(−2, 1)</td><td>−4</td><td>√5, √5</td><td>−0.800</td></tr>
    <tr><td>Ben–Esha</td><td>(1)</td><td>(0.5)</td><td>0.5</td><td>1, 0.5</td><td>1.000</td></tr>
  </table>
  <p>Chen and Dia flip from "similar" (0.690 and 0.585) to clearly opposite (−0.800), and Asha stays very similar. Esha is still a meaningless 1.000, because centring fixes the scale problem but not the small-overlap problem; section 06 fixes that.</p>
  <p><strong>Pearson correlation</strong> (<a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>) is the same formula with one difference: each user is centred on their average over the <em>co-rated films only</em>, not over all their ratings. For Ben and Asha, the co-rated means are 4 for Ben and (5 + 4 + 1)/3 = 3.333 for Asha, so Asha's vector becomes (1.667, 0.667, −2.333), the dot product is 7.0, her length √8.667 = 2.944, and Pearson = 7/(2.449 × 2.944) = 0.971.</p>
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
  <p>The output confirms both measures. It also shows Pearson's weakness on sparse data: with only two co-rated films it is always exactly ±1 (Chen and Dia get −1.000), and with one it is undefined (Esha gets <code>nan</code>, because 0/0). Mean-centred cosine, which uses each user's overall mean, behaves more gently with small overlaps, so it is the usual default for user-based CF.</p>

  <h2 id="cf-user"><span class="num">04</span>User-Based Collaborative Filtering</h2>
  <p>We now know Asha agrees with Ben (0.953) and Chen disagrees (−0.800). Three users rated 3 Idiots: Asha 4, Dia 2 and Esha 5. How do we turn their ratings and their similarities to Ben into one predicted number? The recipe has five steps: take the users who rated the target film; keep the k most similar to Ben, usually only those with positive similarity; convert their ratings of the film to centred ratings; take the similarity-weighted average of those; and add Ben's own mean back. As a formula, with N<sub>k</sub>(u, i) the chosen neighbours:</p>
  <p>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>v∈N<sub>k</sub>(u,i)</sub> s(u, v)·(r<sub>vi</sub> − r̄<sub>v</sub>) / Σ<sub>v</sub> |s(u, v)|</p>
  <p>In words: start from Ben's usual rating, then shift it by how far his look-alikes rated this film above or below their own usual. Dividing by the sum of absolute similarities turns the sum into a weighted average. By hand for Ben → 3 Idiots with k = 2:</p>
  <table class="tbl">
    <tr><th>Rater of 3 Idiots</th><th>similarity to Ben</th><th>rating</th><th>their mean</th><th>centred rating</th><th>used?</th></tr>
    <tr><td>Esha</td><td>1.000</td><td>5</td><td>4.5</td><td>+0.5</td><td>yes</td></tr>
    <tr><td>Asha</td><td>0.953</td><td>4</td><td>3.0</td><td>+1.0</td><td>yes</td></tr>
    <tr><td>Dia</td><td>−0.800</td><td>2</td><td>3.0</td><td>−1.0</td><td>no (negative)</td></tr>
  </table>
  <p>r̂ = 4 + (1.000 × 0.5 + 0.953 × 1.0)/(1.000 + 0.953) = 4 + 1.453/1.953 = 4 + 0.744 = 4.744. The film content-based filtering put last now comes out near the top of Ben's scale. Lagaan has only one rater, Esha (+0.5), so it gets 4 + 0.5 = 4.500. K3G has four raters; the two positive neighbours are Esha (−1.5) and Asha (−2.0), so it gets 4 + (1.000 × (−1.5) + 0.953 × (−2.0))/1.953 = 4 − 1.744 = 2.256. In code, with the similarity matrix built from the centred cosine:</p>
  <div class="fx" data-lang="py">S_user = pd.DataFrame([[sim_centred(u, v)[0] if u != v else 1.0 for v in users] for u in users],
                      index=users, columns=users)

def predict_user(u, i, k=2, S=None, verbose=False):
    S = S_user if S is None else S
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
  <p>The printed neighbours and centred ratings are exactly the hand table's, and the three predictions are 4.744, 4.500 and 2.256. Ben's collaborative ranking is 3 Idiots, Lagaan, K3G. Notice that the neighbours are chosen separately for each film, from the users who actually rated that film; choosing one fixed list of "Ben's neighbours" would fail whenever most of them have not rated the target.</p>
  <p>Why go to the trouble of centring? The older textbook formula skips it: raw cosine weights times raw ratings, Σ s·r / Σ s. For K3G all four raters have positive raw cosine with Ben, so all four vote, and the romance fans' 5s pull the prediction up:</p>
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
  <p>By hand: (0.987 × 1 + 0.690 × 5 + 0.585 × 5 + 1.000 × 3)/3.262 = 10.363/3.262 = 3.177, "Ben will find K3G okay". The centred version says 2.256, "Ben will dislike it", which matches his 2 for the similar DDLJ. Centring both the similarity and the prediction is what stops users with opposite taste from voting as if they were friends.</p>
  <p>A few design choices sit inside the formula. The neighbourhood size k trades noise against dilution: a small k lets one odd neighbour decide, a large k drags in weakly similar users; typical values are 20 to 50, chosen on held-out data (section 07). Negative similarities could in principle vote "the opposite", but with few co-ratings they are noisy, so most systems drop them; keeping Dia here would give 4 + (0.5 + 0.953 + 0.8)/2.753 = 4.818. Some systems use a similarity threshold instead of a fixed k. And when no neighbour has rated the film, the prediction falls back to the user's mean or to the baseline μ + b<sub>u</sub> + b<sub>i</sub>. Seen from a distance, user-based CF is simply KNN regression in which each user is a point described by their rating row.</p>

  <h2 id="cf-item"><span class="num">05</span>Item-Based Collaborative Filtering</h2>
  <p>User-based CF works, but it has practical problems. A big service has far more users than items, users' tastes drift, and every new rating changes a user's neighbours, so the neighbour lists must be recomputed constantly. Films are fewer and their audiences change slowly. So instead of asking "who is like Ben?", item-based CF asks "which films are rated like 3 Idiots?", and then looks at how Ben rated those films.</p>
  <p>To compare two film columns, we take the users who rated both and compute the cosine of their ratings, after centring every rating by <em>its user's</em> mean (the same centred table as before). This is called <strong>adjusted cosine</strong>; centring by user removes "Esha rates everything high" from the comparison of films. By hand:</p>
  <table class="tbl">
    <tr><th>Pair</th><th>users who rated both</th><th>3 Idiots (centred)</th><th>other film (centred)</th><th>dot</th><th>lengths</th><th>adjusted cosine</th></tr>
    <tr><td>3 Idiots–Dangal</td><td>Asha, Esha</td><td>(1, 0.5)</td><td>(2, 0.5)</td><td>2 + 0.25 = 2.25</td><td>1.118, 2.062</td><td>2.25/2.305 = 0.976</td></tr>
    <tr><td>3 Idiots–Chak De</td><td>Asha, Dia</td><td>(1, −1)</td><td>(1, −2)</td><td>1 + 2 = 3</td><td>√2, √5</td><td>3/3.162 = 0.949</td></tr>
    <tr><td>3 Idiots–DDLJ</td><td>Asha, Dia</td><td>(1, −1)</td><td>(−2, 1)</td><td>−2 − 1 = −3</td><td>√2, √5</td><td>−0.949</td></tr>
  </table>
  <p>The ratings say 3 Idiots behaves like a sports film: whoever liked Dangal and Chak De liked it, and whoever liked DDLJ did not. No genre tag says so; the ratings do. The code builds the full film × film table:</p>
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
  <p>The table shows the two taste groups as blocks. Dangal, Chak De, 3 Idiots and Lagaan are positive with each other; DDLJ and K3G are positive with each other (0.953) and negative with the first group. Lagaan's 1.0 and −1.0 entries rest on a single shared rater, Esha, so they are as unreliable as Ben–Esha's 1.0. A dot means the two films have no rater in common, so their similarity cannot be computed at all.</p>
  <p>To predict, the neighbours are now the k films most similar to the target <em>among the films Ben has rated</em>, and we average Ben's own centred ratings of them: r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>j</sub> s(i, j)·(r<sub>uj</sub> − r̄<sub>u</sub>) / Σ<sub>j</sub> |s(i, j)|. For 3 Idiots with k = 2, the neighbours are Dangal (0.976, Ben +1) and Chak De (0.949, Ben +1), so r̂ = 4 + (0.976 + 0.949)/(0.976 + 0.949) = 5.000. For K3G, the only positively similar film Ben rated is DDLJ (0.953, Ben −2), so r̂ = 4 − 2 = 2.000.</p>
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
  <p>User-based said 4.744, 4.500 and 2.256; item-based says 5.000, 5.000 and 2.000. Different evidence, same story: 3 Idiots and Lagaan high, K3G low. Item-based CF also gives a natural explanation: "because you rated Dangal and Chak De highly".</p>
  <p>Item-based CF is the industry default for four reasons. It is <em>stable</em>: a film's similarity to other films changes slowly as ratings arrive, so the similarity table can be computed offline, say nightly. It is often <em>better supported</em>: in a shop with millions of customers, each item has many ratings while each customer has few, so item similarities rest on more evidence (this flips for, say, news, where items are short-lived). It is <em>fast to serve</em>: keep each item's top-k similar items, and recommending becomes a look-up and a sum over the user's recent items. And it is <em>explainable</em>. Amazon's 2003 "item-to-item collaborative filtering" paper, the source of "customers who bought this also bought", made the approach famous. One detail to get right: adjusted cosine centres by the user's mean. Centring each film column by the film's own mean instead gives Pearson correlation between items, which keeps each user's rating habit inside the comparison.</p>

  <h2 id="cf-choices"><span class="num">06</span>Choosing a Similarity and Trusting Overlap</h2>
  <p>Both methods so far trusted Esha, who shares one film with Ben, and Lagaan, which has one rater, with perfect similarities of 1.0. In section 04 Esha was even Ben's top neighbour. Two questions follow: which similarity measure should we use, and how do we encode the common-sense rule that trust needs evidence? Here are eight common measures on the same four pairs; a few are new. <strong>Jaccard similarity</strong> ignores the scores and asks how much the two users' sets of rated films overlap, |I<sub>u</sub> ∩ I<sub>v</sub>| / |I<sub>u</sub> ∪ I<sub>v</sub>|. <strong>Mean squared difference</strong> (MSD) averages the squared gaps between the two users' ratings and turns that into a similarity as 1/(1 + MSD). <strong>Spearman correlation</strong> is Pearson on the ranks of the ratings.</p>
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
  <p>By hand for two of them: Jaccard(Ben, Esha) = |{Dangal}| / |{Dangal, Chak De, DDLJ, Lagaan, K3G, 3 Idiots}| = 1/6 = 0.167, because they share little; MSD(Ben, Asha) = ((5 − 5)² + (5 − 4)² + (2 − 1)²)/3 = 0.667, so 1/(1 + 0.667) = 0.600. The table shows each measure's character:</p>
  <table class="tbl">
    <tr><th>Measure</th><th>What it sees on CineCity</th><th>Use when</th></tr>
    <tr><td>Raw cosine</td><td>everyone similar (Chen 0.690)</td><td>0/1 implicit data, not ratings</td></tr>
    <tr><td>Cosine with blanks as 0</td><td>mixes overlap with agreement</td><td>avoid for ratings</td></tr>
    <tr><td>Centred cosine</td><td>Asha 0.953, Chen −0.800</td><td>default for user-based CF on ratings</td></tr>
    <tr><td>Pearson</td><td>±1 with 2 items, undefined with 1</td><td>dense data with large overlaps</td></tr>
    <tr><td>Spearman</td><td>needs 3+ shared items</td><td>ordinal ratings, outlier raters</td></tr>
    <tr><td>Jaccard</td><td>Asha 0.600, Esha 0.167 (which films, not scores)</td><td>implicit data</td></tr>
    <tr><td>1/(1 + MSD)</td><td>Asha 0.600, Esha 1.000; no direction</td><td>simple, rarely best</td></tr>
    <tr><td>Adjusted cosine</td><td>3 Idiots–Dangal 0.976</td><td>default for item-based CF</td></tr>
  </table>
  <p>Almost every measure gives Esha a high score from one film. The fix is the shrinkage idea from the damped mean in the previous note, applied to similarities: scale a similarity down when it rests on fewer than β shared items. This is called <strong>significance weighting</strong> (Herlocker and colleagues, 1999): s′(u, v) = s(u, v) · min(n<sub>uv</sub>, β)/β, where n<sub>uv</sub> is the number of co-rated items. It encodes the belief "similarity is zero until proven otherwise". Think of a new colleague who agreed with you once about a restaurant; you would not yet trust her film taste as much as an old friend's. With β = 3, Asha (3 shared films) keeps 0.953; Chen and Dia (2 shared) go from −0.800 to −0.533; Esha (1 shared) drops from 1.000 to 0.333. Redo Ben → 3 Idiots: 4 + (0.333 × 0.5 + 0.953 × 1.0)/(0.333 + 0.953) = 4 + 1.120/1.286 = 4.870.</p>
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
  <p>3 Idiots rises from 4.744 to 4.870 because Asha, the neighbour with real evidence, now dominates, and her centred rating (+1.0) is larger than Esha's (+0.5). Lagaan is unchanged at 4.500 because Esha is its only rater and the weighted average of one neighbour is that neighbour's value whatever its weight. Two related tricks exist: a hard minimum overlap (ignore pairs with fewer than, say, 5 co-ratings, which is harsh on sparse data) and smooth shrinkage s·n/(n + λ). Real systems use β or λ around 25 to 100. Do not choose a measure by how sensible a few toy numbers look; measures that look alike here can differ a lot on real data, so choose with a held-out comparison, which is the next section.</p>

  <h2 id="cf-eval"><span class="num">07</span>Evaluating on Hidden Ratings</h2>
  <p>Ben's predictions look plausible, but we cannot check them: nobody knows what Ben would rate 3 Idiots. To measure accuracy honestly we hide ratings we <em>do</em> know, predict them from everything else, and compare. With only 19 ratings the most thorough version is <strong>leave-one-out</strong> (LOO): hide each rating in turn, recompute the user means and all similarities without it, predict it, and collect the 19 errors. Recomputing matters: if Asha's 4 for 3 Idiots is hidden, her mean becomes (5 + 4 + 1 + 1)/4 = 2.75 and her similarities change too. Leaving the hidden rating inside the means or similarities would leak the answer into the prediction.</p>
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
user-based CF k=2  RMSE 1.444  MAE 1.048
item-based CF k=2  RMSE 1.213  MAE 0.772</div>
  <p>Both CF variants beat the global mean (RMSE 1.444 and 1.213 against 1.650). One result looks odd: the user mean is worse than the global mean (1.946). With only three to five ratings per user, hiding one rating moves that user's mean <em>away</em> from it (hide Ben's 2 and his mean jumps to 5), a known artefact of leave-one-out on tiny data. It is a reminder that 19 ratings are a teaching device, not evidence.</p>
  <p>How the ratings are hidden matters as much as the metric:</p>
  <table class="tbl">
    <tr><th>Split</th><th>How</th><th>Answers</th><th>Watch out</th></tr>
    <tr><td>Random hold-out</td><td>hide a random 10–20% of ratings</td><td>can it fill blanks?</td><td>uses the future to predict the past</td></tr>
    <tr><td>Leave-one-out</td><td>hide each rating (or each user's last item) in turn</td><td>small data; top-N hit rate</td><td>expensive; artefacts on tiny data</td></tr>
    <tr><td>Per-user hold-out</td><td>hide k ratings of every user</td><td>every user tested equally</td><td>heavy users still dominate RMSE</td></tr>
    <tr><td>Temporal split</td><td>train before a date, test after</td><td>what production will face</td><td>most honest; new users and items appear in test</td></tr>
    <tr><td>Cold-user split</td><td>hold out whole users</td><td>new-user performance</td><td>pure CF cannot score them</td></tr>
  </table>
  <p>Besides RMSE and MAE (<a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>), report <strong>coverage</strong>, the share of test cases for which the method could make a prediction at all (CF fails when no neighbour rated the film), and, for lists, the top-N metrics of <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>
  <p>For real evidence we use the simulated CineCity from the Basics note: 1,000 users × 1,000 films, genre tastes plus two hidden traits no tag records, generous and strict raters, long-tail popularity, about 50 ratings per user. We hide the same random 20% as that note did, so the numbers can be compared with content-based filtering (0.801).</p>
  <div class="fx" data-lang="py">big, big_tags, hidden = make_ratings()                          # the simulator from the Basics note
test = np.random.default_rng(1).random(len(big)) &lt; 0.2         # hide the same 20% of ratings
tr, te = big[~test], big[test]
nU, nI = 1000, 1000
Rtr = np.full((nU, nI), np.nan)
Rtr[tr.user, tr.item] = tr.rating
Mk = ~np.isnan(Rtr)                                             # known-cell mask
print(f"{len(big):,} ratings, density {len(big) / (nU * nI):.4f}; train {len(tr):,}, test {len(te):,}")</div>
  <div class="fx" data-lang="text">50,186 ratings, density 0.0502; train 40,182, test 10,004</div>
  <p>The strong reference is the <strong>baseline predictor</strong> μ + b<sub>u</sub> + b<sub>i</sub>: the global mean plus a damped user offset (strict or generous rater) plus a damped film offset (generally liked or not). Every CF variant must beat it. The code below computes all similarities at once with matrix products (the trick is explained in section 10), adds significance weighting with β = 5, and also tries "CF on baseline": instead of subtracting only the user's mean, subtract the full baseline and let the neighbours vote only on what the baseline could not explain. This last idea, called KNNBaseline, came out of the Netflix Prize years.</p>
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

ov_u = Mk.astype(int) @ Mk.T.astype(int)                        # co-rated films per user pair
ov_i = Mk.T.astype(int) @ Mk.astype(int)                        # co-raters per film pair
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
  <p>Read the table from the top. The user mean (0.859) captures rating habits, and the baseline (0.771) adds film quality. Plain user-based CF (0.777) and item-based CF (0.779) do <em>not</em> beat the baseline: with about 40 training ratings per user, many similarities rest on a handful of co-ratings and are mostly noise. Significance weighting fixes much of that (user-based 0.746, item-based 0.761), and centring on the baseline is best for both (0.744). The last column is coverage: user-based CF finds at least one positive neighbour for 99.6% of test cases and falls back to the user's mean for the rest. On this data CF clearly beats content-based filtering (0.801), because it also captures the hidden traits that no tag recorded.</p>
  <p>Finally, the neighbourhood size k. Here is shrunk item-based CF for k from 1 to 200:</p>
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
  <p>k = 1, copying the single most similar film, is terrible at 0.997. The error falls quickly up to k ≈ 10 to 20 and then stays flat, because after shrinkage extra neighbours carry small weights. This is the usual bias–variance shape: too few neighbours give a noisy prediction, more neighbours average the noise away. In real work, k (and β) are chosen on a separate validation split, never on the test split (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</p>

  <h2 id="cf-sparse"><span class="num">08</span>Sparsity and Scalability</h2>
  <p>CF only just beat the baseline, and only after shrinkage. The reason is the shape of real data. On CineCity every pair of users shares at least one film, but in a matrix that is 95% or 99% empty, most pairs share almost nothing. Counting co-ratings for every pair on the simulated training data:</p>
  <div class="fx" data-lang="py">pu = ov_u[np.triu_indices(nU, 1)]                               # every pair counted once
pi = ov_i[np.triu_indices(nI, 1)]
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
  <p>Users rate about 40 films each here (5% density), so most user pairs share a few films (median 6). But 58.5% of film pairs have no rater in common, and only 7.9% share 5 or more: most film–film similarities cannot be computed at all, and most of those that can rest on one or two people. At the 0.1% density typical of shops, even user pairs mostly share nothing. This is the <strong>sparsity problem</strong>, and it has three consequences. Similarities from one or two co-ratings are unreliable (Esha's 1.0), which shrinkage softens. Coverage drops, because often no neighbour rated the target film. And there is no transitivity: if Ben shares films with Asha, and Asha with a new user Farhan, but Ben shares none with Farhan, neighbourhood CF cannot connect Ben and Farhan at all. Matrix factorization, the next note, can.</p>
  <p>The second problem is cost. User-based CF compares every pair of m users, m(m − 1)/2 pairs, each over up to n items, so the work grows with m² and the similarity table needs m² numbers. For one crore (10 million) users that is 5 × 10¹³ pairs, which is impossible; the m × m table for even ten lakh (one million) users would need 8 TB. Item-based CF has the same problem with n items, but n is often smaller and the table can be built offline. This is the <strong>scalability problem</strong>. Think of asking every student in India to compare report cards with every other student: hopeless. Comparing only students who took some of the same exams, and keeping each student's 50 closest matches, is a weekend job. That is exactly what real systems do:</p>
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
item-item cosine: sparse 26 ms, dense 33 ms, same result True; non-zero similarities 412,862 of 1,000,000
top-50 neighbour table: 1000 x 50 = 50,000 numbers instead of 1,000,000</div>
  <p>Only 4% of the centred matrix is non-zero, so a <strong>sparse</strong> matrix product skips the zeros (here 26 ms against 33 ms dense; timings are approximate and vary from run to run, and the gap grows with size and sparsity). 59% of the film–film similarities are exactly 0 because nobody rated both films, so they never need to be stored; production systems compute similarities only for pairs that co-occur, by walking through each user's items (the Amazon algorithm). Keeping a <strong>top-k neighbour table</strong> of each film's 50 most similar films stores 50,000 numbers instead of 1,000,000, and serving becomes a look-up of the user's recent films' neighbours plus a sum. For the largest catalogues, <strong>approximate nearest-neighbour</strong> search (HNSW, locality-sensitive hashing, MinHash for Jaccard) finds the most similar items without comparing everything (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>), and item co-occurrence counts are a classic distributed Spark job.</p>

  <h2 id="cf-implicit"><span class="num">09</span>Implicit Feedback</h2>
  <p>Everything so far assumed star ratings. Most real data is plays, clicks and purchases: no stars, and no recorded dislikes. Suppose CineCity knew only <em>who watched which film</em>. There is no mean to subtract and no "below average", so mean-centring makes no sense. What is left is a 0/1 matrix, and for 0/1 columns the cosine becomes a count: the number of users who watched both films, divided by the square root of the product of how many watched each, cos(i, j) = |U<sub>i</sub> ∩ U<sub>j</sub>| / √(|U<sub>i</sub>|·|U<sub>j</sub>|), where U<sub>i</sub> is the set of users who watched film i. With no ratings to average, the score of an unseen film for Ben is simply the sum of its similarities to the films he watched.</p>
  <p>By hand for one pair: K3G was watched by Asha, Chen, Dia and Esha, Dangal by Asha, Ben, Chen and Esha, and both by Asha, Chen and Esha, so cos = 3/√(4 × 4) = 0.75. The code does all nine pairs Ben needs:</p>
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
  <p>Implicit item-based CF ranks K3G <em>first</em> for Ben (2.077), then 3 Idiots (1.821), then Lagaan (0.500). With star ratings both CF variants put K3G last. The reason is that K3G was watched by four of the five users, including Chen and Dia, who share films with Ben; the stars showed that Ben's look-alikes disliked it, but the 0/1 matrix cannot. <strong>Watched is not liked</strong>, and a popular film co-occurs with everything. This is the central difficulty of implicit CF, and three standard responses follow from it. Use stronger signals where possible (finishes, repeat plays, purchases), weighted as in the Basics note's event log, with log(1 + count) so one binge does not dominate. Down-weight popular items with <strong>inverse user frequency</strong>, IUF(i) = log(m / n<sub>i</sub>), the same idea as IDF: co-watching a blockbuster says little, co-watching a niche film says a lot. And evaluate with ranking metrics rather than RMSE, because there is no rating to predict: hide one watched film per user and check whether it appears in that user's top 10, the <strong>hit rate@10</strong>.</p>
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
  <p>Popularity (everyone gets the same top 10 unseen films) recovers the hidden film 19.0% of the time, already 17 times better than random guessing (1.1%), because people really do watch popular films. Item-based cosine reaches 26.9%, its IUF-weighted version 29.6%, and user-based CF with each user's 50 nearest users 30.1%. Every CF variant beats popularity by 40 to 60%. Model-based methods for implicit data, implicit ALS with confidence weights and BPR, appear in <a class="xref" data-note="ml_mf">Matrix Factorization</a> and <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>

  <h2 id="cf-code"><span class="num">10</span>Neighbourhood CF in Code</h2>
  <p>A good test of understanding is to rebuild everything as one small class that reproduces every hand number: 4.744, 4.500 and 2.256 (user-based), 5.0 and 2.0 (item-based), and 4.870 (significance weighting). The class has two parts. <code>fit</code> centres the ratings by user mean and computes all similarities at once with matrix products. The numerator is the matrix of centred dot products, V Vᵀ (with blanks as 0, they add nothing). The denominator must use each user's length over the co-rated cells only; with M the 0/1 mask of known cells, (V∘V) Mᵀ gives, for every pair, the sum of one user's squared centred ratings over the films the other user also rated (∘ means element-wise product). <code>fit</code> then applies a minimum overlap and optional significance weighting. <code>predict</code> picks the k most similar positive neighbours, among the raters of the film (user-based) or among the films the user rated (item-based), and applies the formula of sections 04 and 05, clipped to 1–5.</p>
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
  <p>Every hand number is back: user-based 4.744, 4.5 and 2.256, item-based 5.0, 5.0 and 2.0, and with β = 3, 4.87 and 2.13. The <code>min_overlap=2</code> line shows the cost of strict overlap rules: Esha is dropped entirely, 3 Idiots then rests on Asha alone (5.0), and Lagaan, whose only rater was Esha, has no neighbour left and falls back to Ben's mean (4.0). The diagonal of the similarity matrix is set to NaN so a user is never their own neighbour.</p>
  <p>scikit-learn has no recommender, but its <code>NearestNeighbors</code> finds neighbours quickly, by brute force or with tree indexes. The usual trick is to centre each row, fill the blanks with 0 (which now means "my average"), and use cosine:</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import NearestNeighbors
Cz = C.fillna(0)                                   # centred, unknown = 0 (= "my average")
nn = NearestNeighbors(n_neighbors=5, metric="cosine").fit(Cz.values)
dist, idx = nn.kneighbors(Cz.loc[["Ben"]].values)        # the query point itself comes back first
print("sklearn, cosine on centred rows with 0 for unknown:",
      {users[j]: round(float(1 - d), 3) for j, d in zip(idx[0], dist[0]) if users[j] != "Ben"})
print("our co-rated centred cosine:", S_user.loc["Ben"].drop("Ben").round(3).to_dict())</div>
  <div class="fx" data-lang="text">sklearn, cosine on centred rows with 0 for unknown: {'Asha': 0.764, 'Esha': 0.118, 'Dia': -0.516, 'Chen': -0.667}
our co-rated centred cosine: {'Asha': 0.953, 'Chen': -0.8, 'Dia': -0.8, 'Esha': 1.0}</div>
  <p>The neighbour order is similar, but the numbers differ, because filling centred blanks with 0 changes the denominator: it now includes all of a user's ratings, not just the shared ones. Ben–Esha drops from 1.000 to 0.118 (by hand: dot 1 × 0.5 = 0.5, lengths √6 and √3, 0.5/4.243). That acts as an automatic penalty for small overlap, which is why this cheap version often works well on sparse data. Note also that <code>kneighbors</code> returns the query point itself first, which is why the code skips Ben. Dedicated libraries include <code>surprise</code> (KNNBasic, KNNWithMeans, KNNBaseline), <code>implicit</code> (item-item and ALS for implicit data) and Spark MLlib for distributed jobs.</p>
  <p>Here is where neighbourhood CF stands against its neighbours in this group of notes:</p>
  <table class="tbl">
    <tr><th></th><th>User-based CF</th><th>Item-based CF</th><th>Content-based</th><th>Matrix factorization</th></tr>
    <tr><td>Compares</td><td>users (rows)</td><td>items (columns)</td><td>user profile vs item features</td><td>learned user and item vectors</td></tr>
    <tr><td>Ben → 3 Idiots</td><td>4.744 (shrunk 4.870)</td><td>5.000</td><td>last (cosine −0.235)</td><td>see that note</td></tr>
    <tr><td>Scale RMSE</td><td>0.746 shrunk / 0.744 on baseline</td><td>0.761 / 0.744</td><td>0.801</td><td>see that note</td></tr>
    <tr><td>Stability</td><td>neighbours change with every rating</td><td>similarities change slowly</td><td>stable</td><td>retrain periodically</td></tr>
    <tr><td>Explanation</td><td>"people like you"</td><td>"because you liked X"</td><td>"because it is a sports film"</td><td>hard</td></tr>
    <tr><td>Serendipity</td><td>high</td><td>medium</td><td>low</td><td>high</td></tr>
    <tr><td>New user / new item</td><td>✘ / ✘</td><td>✘ / ✘</td><td>✘ / ✔</td><td>✘ / ✘ (✔ with features)</td></tr>
    <tr><td>Very sparse data</td><td>weak</td><td>weak</td><td>unaffected</td><td>strong</td></tr>
  </table>
  <p>Neighbourhoods need overlapping ratings and can only link users through items they share. <a class="xref" data-note="ml_mf">Matrix Factorization</a> removes that limit by giving every user and film a short vector of learned hidden traits, exactly the "star power" and "director style" that our simulation hid, so any user can be compared with any film.</p>

  <h2 id="cf-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The classic mistake is computing raw cosine on ratings. Because ratings are all positive, users with opposite tastes look similar (Ben–Chen 0.690) and vote as if they were friends. Mean-centre first. A close relative is forgetting to add the mean back after averaging centred ratings, or skipping centring in the prediction altogether:</p>
  <div class="fx" data-lang="py">nb = S_user.loc["Ben", ["Esha", "Asha"]]                 # Ben's two positive neighbours who rated 3 Idiots
raw = R.loc[["Esha", "Asha"], "3 Idiots"]               # their raw ratings: 5 and 4
dev = C.loc[["Esha", "Asha"], "3 Idiots"]               # their centred ratings: +0.5 and +1.0
print("weighted centred ratings, mean forgotten:", round((nb * dev).sum() / nb.abs().sum(), 3))
print("plus Ben's mean (correct)               :", round(mu["Ben"] + (nb * dev).sum() / nb.abs().sum(), 3))
print("weighted RAW ratings (no centring)      :", round((nb * raw).sum() / nb.abs().sum(), 3))</div>
  <div class="fx" data-lang="text">weighted centred ratings, mean forgotten: 0.744
plus Ben's mean (correct)               : 4.744
weighted RAW ratings (no centring)      : 4.512</div>
  <p>The weighted average of the neighbours' centred ratings is 0.744, which is a <em>deviation</em> from Ben's usual, not a rating; reported as a prediction it would say Ben hates 3 Idiots. Adding Ben's mean gives the correct 4.744. Averaging the neighbours' raw ratings (4.512) is not absurd here, but it ignores that Esha's 5 is only slightly above her own habit while Asha's 4 is well above hers.</p>
  <p>Filling blanks with 0 and treating them as ratings is the second family of mistakes. A blank is "unknown", not "zero stars"; compute on co-rated items, or centre first so that 0 means "average". Trusting tiny overlaps is the third: one shared film gave Esha similarity 1.0 and top-neighbour status. Use significance weighting or shrinkage. Choosing one global list of neighbours per user, instead of choosing neighbours per (user, item) among the people who rated the item, quietly ruins coverage.</p>
  <p>Evaluation has its own traps. Computing means or similarities before hiding the test ratings leaks the answer into the prediction; everything must come from the training part. Skipping the baseline is just as bad: plain CF (0.777) actually lost to μ + b<sub>u</sub> + b<sub>i</sub> (0.771), and without the comparison nobody would have noticed. With implicit data, treating "watched" as "liked" ranked K3G first for Ben although his look-alikes disliked it; weight strong events, down-weight popular items and use ranking metrics. Finally, prototyping user-based CF on a sample and then running the same dense all-pairs code on the full user base fails at scale; plan for item-based top-k tables, sparse products or approximate search from the start.</p>

  <h2 id="cf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Ben's numbers</h3>
  <table class="tbl">
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>mean</th><th>centred sim to Ben</th><th>shared</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>·</td><td>1</td><td>1</td><td>4</td><td>3.0</td><td>0.953</td><td>3</td></tr>
    <tr><td>Ben</td><td>5</td><td>5</td><td>·</td><td>2</td><td>·</td><td>·</td><td>4.0</td><td>—</td><td>—</td></tr>
    <tr><td>Chen</td><td>2</td><td>·</td><td>·</td><td>5</td><td>5</td><td>·</td><td>4.0</td><td>−0.800</td><td>2</td></tr>
    <tr><td>Dia</td><td>·</td><td>1</td><td>·</td><td>4</td><td>5</td><td>2</td><td>3.0</td><td>−0.800</td><td>2</td></tr>
    <tr><td>Esha</td><td>5</td><td>·</td><td>5</td><td>·</td><td>3</td><td>5</td><td>4.5</td><td>1.000 (β = 3: 0.333)</td><td>1</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Method</th><th>Lagaan</th><th>K3G</th><th>3 Idiots</th></tr>
    <tr><td>User-based, k = 2</td><td>4.500</td><td>2.256</td><td>4.744</td></tr>
    <tr><td>User-based, β = 3</td><td>4.500</td><td>2.130</td><td>4.870</td></tr>
    <tr><td>Item-based, k = 2</td><td>5.000</td><td>2.000</td><td>5.000</td></tr>
    <tr><td>Implicit item-based score</td><td>0.500</td><td>2.077</td><td>1.821</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Collaborative filtering</b>: predict a user's preference from other users' interactions, using only the user × item matrix.</li>
    <li><b>Neighbourhood (memory-based) CF</b>: predict from the k most similar users or items; <b>model-based</b>: fit a model of the matrix (MF).</li>
    <li><b>Co-rated items</b> I<sub>uv</sub>: items both users rated; every similarity is computed on them.</li>
    <li><b>Mean-centring</b>: subtract the user's mean so ratings mean "above or below my usual".</li>
    <li><b>Adjusted cosine</b>: cosine between item columns after centring by each <em>user's</em> mean.</li>
    <li><b>Significance weighting</b>: s · min(n, β)/β, distrusting similarities from few co-ratings.</li>
    <li><b>Baseline predictor</b>: μ + b<sub>u</sub> + b<sub>i</sub>; every CF model must beat it.</li>
    <li><b>Sparsity problem</b>: few shared items → unreliable similarities, low coverage, no transitivity. <b>Scalability problem</b>: all pairs is O(m²).</li>
    <li><b>IUF</b>: log(m / n<sub>i</sub>), down-weights popular items in implicit CF.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Centred cosine (users)</td><td>Σ<sub>I<sub>uv</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)(r<sub>vi</sub> − r̄<sub>v</sub>) / (√Σ(r<sub>ui</sub> − r̄<sub>u</sub>)² √Σ(r<sub>vi</sub> − r̄<sub>v</sub>)²); Pearson uses means over I<sub>uv</sub></td></tr>
    <tr><td>User-based prediction</td><td>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>v</sub> s<sub>uv</sub>(r<sub>vi</sub> − r̄<sub>v</sub>) / Σ|s<sub>uv</sub>|, v among the k most similar raters of i</td></tr>
    <tr><td>Adjusted cosine (items)</td><td>Σ<sub>U<sub>ij</sub></sub>(r<sub>ui</sub> − r̄<sub>u</sub>)(r<sub>uj</sub> − r̄<sub>u</sub>) / (√Σ(r<sub>ui</sub> − r̄<sub>u</sub>)² √Σ(r<sub>uj</sub> − r̄<sub>u</sub>)²)</td></tr>
    <tr><td>Item-based prediction</td><td>r̂<sub>ui</sub> = r̄<sub>u</sub> + Σ<sub>j</sub> s<sub>ij</sub>(r<sub>uj</sub> − r̄<sub>u</sub>) / Σ|s<sub>ij</sub>|, j among the k items u rated most similar to i</td></tr>
    <tr><td>Significance weighting</td><td>s′ = s · min(n<sub>uv</sub>, β)/β (β ≈ 25–100 in practice)</td></tr>
    <tr><td>Binary cosine / Jaccard</td><td>|A∩B| / √(|A||B|); |A∩B| / |A∪B|</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">mu = R.mean(axis=1); C = R.sub(mu, axis=0)             # centre by user mean
known = R.notna().astype(int); overlap = known @ known.T   # co-rated counts
S_shrunk = S * np.minimum(overlap, beta) / beta            # significance weighting
pred = mu[u] + (nb * C.loc[nb.index, i]).sum() / nb.abs().sum()   # user-based

from sklearn.neighbors import NearestNeighbors
nn = NearestNeighbors(n_neighbors=k + 1, metric="cosine").fit(C.fillna(0).values)
dist, idx = nn.kneighbors(C.fillna(0).loc[["Ben"]].values)  # first hit is Ben himself</div>
  <h3>Scale results (1,000 × 1,000 simulated CineCity, same test set)</h3>
  <table class="tbl">
    <tr><th>Predictor</th><th>RMSE</th></tr>
    <tr><td>global mean / user mean / baseline</td><td>1.007 / 0.859 / 0.771</td></tr>
    <tr><td>content-based (previous note)</td><td>0.801</td></tr>
    <tr><td>plain user / item CF, k = 30</td><td>0.777 / 0.779</td></tr>
    <tr><td>shrunk user / item CF</td><td>0.746 / 0.761</td></tr>
    <tr><td>CF on baseline (both)</td><td>0.744</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Raw cosine on ratings: opposites look similar. Centre first.</li>
    <li>A centred average is a deviation: add the user's mean back.</li>
    <li>One shared item can give similarity 1.0: shrink it.</li>
    <li>Choose neighbours per (user, item), among those who rated the item.</li>
    <li>Hide test ratings before computing means and similarities; tune k on validation data.</li>
    <li>Implicit data: watched ≠ liked; use ranking metrics, not RMSE.</li>
  </ul>

  <h2 id="cf-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is collaborative filtering, and how does it differ from content-based filtering?</summary><div class="qa-body">Collaborative filtering predicts a user's preference from other users' interactions, using only the user × item matrix and no item features. Content-based filtering uses item features and the user's own history. CF can discover links nobody wrote down as features (people who love Dangal also love 3 Idiots: CF 4.744 versus content cosine −0.235), but it cannot handle brand-new items or users with no interactions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>User-based versus item-based CF: what is the difference?</summary><div class="qa-body">User-based CF finds users similar to the target user and averages their (centred) ratings of the target item. Item-based CF finds items similar to the target item, judged by the ratings they received, and averages the target user's own ratings of those items. Both are KNN methods; they differ in whether rows or columns of the matrix are compared.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must ratings be mean-centred before computing cosine similarity?</summary><div class="qa-body">Ratings are all positive, so raw rating vectors lie in the same corner of space and their cosine is never negative: Ben and Chen get 0.690 although they disagree completely. Subtracting each user's mean turns ratings into "above or below my usual", removes rating habits such as Esha's generosity, and lets opposite tastes get negative similarity (Ben–Chen −0.800).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between mean-centred cosine and Pearson correlation?</summary><div class="qa-body">Both are the cosine of centred vectors over co-rated items. Mean-centred cosine centres each user by their mean over all their ratings; Pearson centres by their mean over the co-rated items only. Pearson is the classic choice with large overlaps, but on sparse data it is ±1 whenever two items are shared and undefined with one, so centred cosine is usually more stable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through a user-based prediction.</summary><div class="qa-body">Take the users who rated the target film, keep the k most similar to the target user with positive similarity, convert their ratings to centred ratings, take the similarity-weighted average, and add the target user's mean. For Ben → 3 Idiots: neighbours Esha (1.0, +0.5) and Asha (0.953, +1.0), so 4 + (0.5 + 0.953)/1.953 = 4.744.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is adjusted cosine and why is it used in item-based CF?</summary><div class="qa-body">It is the cosine between two item columns over users who rated both, after subtracting each user's mean from their ratings. This removes user rating habits from the comparison of items. Centring by the item's mean instead would give Pearson between items, which leaves the user habits in. 3 Idiots versus Dangal over Asha and Esha gives 0.976.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do large e-commerce sites prefer item-based CF?</summary><div class="qa-body">Items are fewer than users and each item has many ratings, so item similarities are better supported; they change slowly, so they can be precomputed offline into top-k tables; serving is then a fast look-up and sum over the user's recent items; and explanations ("because you bought X") are natural. Amazon's item-to-item CF is the classic example.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two users share one rated item and get similarity 1.0. What do you do?</summary><div class="qa-body">Distrust it. Apply significance weighting s·min(n, β)/β or shrinkage s·n/(n + λ), or require a minimum overlap. With β = 3, Esha's 1.0 becomes 0.333 and Asha's well-supported opinion dominates Ben's prediction. At scale, significance weighting improved user-based RMSE from 0.777 to 0.746.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k, the number of neighbours?</summary><div class="qa-body">On a validation split, by trying a range of values. Small k is noisy because one odd neighbour decides; large k averages in weakly similar users, though with shrinkage and similarity weights the extra neighbours matter little. At scale, k = 1 gave RMSE 0.997 and the error flattened around 0.761 from k ≈ 20. Typical values are 20 to 50.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you evaluate a CF model offline, and what can go wrong?</summary><div class="qa-body">Hide some known ratings (random, per-user or, best, by time), fit everything on the rest, predict the hidden ones and report RMSE/MAE, coverage and top-N metrics. Pitfalls: computing means or similarities before hiding (leakage), tuning k on the test set, random splits that use the future, artefacts on tiny data, and forgetting the baseline comparison.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the scale experiment plain CF did not beat the baseline. Why, and what fixed it?</summary><div class="qa-body">The baseline μ + b<sub>u</sub> + b<sub>i</sub> already captures rater habits and item quality (0.771). Plain CF's similarities often rest on a few co-ratings, so the neighbours' votes add noise (0.777). Significance weighting (0.746) and centring on the full baseline instead of just the user mean (0.744) let CF add real signal on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the sparsity and scalability problems of neighbourhood CF?</summary><div class="qa-body">Sparsity: most pairs share few or no items (58.5% of film pairs had no common rater at 5% density), so similarities are unreliable or undefined, coverage drops and users with no shared items cannot be linked. Scalability: comparing all pairs is O(m²) in time and memory. Fixes include shrinkage, sparse products, computing only co-occurring pairs, top-k neighbour tables, approximate nearest-neighbour search and offline batch jobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CF change for implicit feedback?</summary><div class="qa-body">Use a 0/1 or confidence matrix, a binary similarity such as cosine |A∩B|/√(|A||B|) or Jaccard, score an item by the sum of its similarities to the user's items, down-weight popular items (IUF) and heavy users, and evaluate with ranking metrics such as hit rate@k. Beware that watched is not liked: implicit CF ranked K3G first for Ben, whom the ratings say would dislike it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is user-based CF related to K-Nearest Neighbors?</summary><div class="qa-body">It is KNN regression in which each user is a point described by their rating row, distance is one minus centred cosine on co-rated items, and the target is the rating of item i, averaged over the k nearest users who have that rating, weighted by similarity and corrected for each neighbour's mean. It shares KNN's bias–variance trade-off in k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do significance weighting, the damped mean and ridge regression have in common?</summary><div class="qa-body">They are all shrinkage towards a safe prior when evidence is thin. The damped mean pulls an item's average towards the global mean with m virtual ratings; significance weighting pulls a similarity towards zero until there are β co-ratings; ridge pulls coefficients towards zero with penalty λ. Each trades a little bias for a large cut in variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a user need to be excluded from their own neighbour list?</summary><div class="qa-body">A user's similarity to themselves is 1, the maximum, so they would always be their own top neighbour and the prediction would be built from their own ratings, which in evaluation means the hidden answer. Similarity matrices set the diagonal to zero or NaN, and NearestNeighbors.kneighbors returns the query point first when it is in the fitted data, so it must be skipped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does sparsity motivate matrix factorization?</summary><div class="qa-body">Neighbourhood CF can only compare users through items both rated, so in a nearly empty matrix most pairs are incomparable and the similarities that exist are noisy. Matrix factorization learns a short vector of latent factors for every user and item from all ratings at once, so any user can be scored against any item and information flows through shared factors rather than shared items.</div></details>
</main>
`
});
