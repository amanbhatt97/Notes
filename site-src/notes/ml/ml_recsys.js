// ml/ml_recsys.js — Recommendation Systems
Object.assign(TOPIC_CONTENT, {
  "ml_recsys": `<main>
  <h1>Recommendation Systems</h1>
  <p class="lead">How Netflix, Amazon and Spotify pick what to show you: from similarity-based filtering to matrix factorization and two-stage ranking, plus how to evaluate them. Builds on vectors, cosine similarity and classification.</p>

  <h2 id="rs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recommendation Systems</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Problem &amp; feedback</div>
        <ul>
          <li><b>Goal</b> — rank a huge catalog into few slots that move a business metric</li>
          <li><b>Proxy vs true</b> — optimise clicks/ratings; business wants watch time, revenue, retention</li>
          <li><b>Explicit</b> — ratings, likes; scarce, clear negatives</li>
          <li><b>Implicit</b> — clicks, views, purchases; plentiful, no true negatives</li>
          <li>⚠ No click ≠ dislike; use shown-not-clicked or low-confidence negatives</li>
          <li>💡 A bookshop clerk: your history + similar books + people like you</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Content-based</div>
        <ul>
          <li><b>How</b> — user profile = mean of liked item features; cosine to every item</li>
          <li><b>Features</b> — genre, tags, text/image embeddings</li>
          <li><b>Pros</b> — handles new items, explainable, no other users needed</li>
          <li><b>Cons</b> — over-specialised, no serendipity, needs good features</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Collaborative filtering</div>
        <ul>
          <li><b>Idea</b> — users who agreed before agree again; only the interaction matrix</li>
          <li><b>User-user</b> — similar users' ratings; tastes drift, slow at scale</li>
          <li><b>Item-item</b> — similar items to what you rated; stable, precomputable (Amazon)</li>
          <li><b>Predict</b> — μᵤ + Σ sim·(r − μᵤ) / Σ|sim| over top-k neighbours</li>
          <li>⚠ <b>Mean-centre first</b> — raw cosine all positive; toy: 2.22 → 4.0</li>
          <li>⚠ Sparse overlap gives fake sim = 1; require min overlap / shrink</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrix factorization</div>
        <ul>
          <li><b>R ≈ P·Qᵀ</b> — users × k and items × k latent factors</li>
          <li><b>Loss</b> — squared error on observed cells + λ(‖P‖² + ‖Q‖²)</li>
          <li><b>SGD</b> — per-rating gradient step (Funk SVD, Netflix Prize)</li>
          <li><b>ALS</b> — fix Q, ridge-solve P; fix P, solve Q; parallel (Spark)</li>
          <li><b>Biases</b> — add global + user + item bias terms</li>
          <li><b>Two-tower</b> — neural MF from features; gives cold items a vector</li>
          <li>💡 Hidden sliders ("how sci-fi") learned unprompted</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cold start</div>
        <ul>
          <li><b>New user</b> — popularity, onboarding quiz, context (geo, device), fast updates</li>
          <li><b>New item</b> — content features / two-tower embedding, exploration slots</li>
          <li><b>New system</b> — rules + popularity; log impressions from day one</li>
          <li><b>Hybrid</b> — content for cold, CF for warm, popularity as fallback</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two-stage system</div>
        <ul>
          <li><b>Retrieval</b> — millions → ~1,000; recall; two-tower + ANN (FAISS), CF, trending</li>
          <li><b>Ranking</b> — ~1,000 → 50; precision; GBM/DNN with rich + cross features</li>
          <li><b>Re-rank</b> — diversity, freshness, dedupe, business rules</li>
          <li><b>LTR</b> — pointwise (logloss), pairwise (BPR, RankNet), listwise (LambdaMART)</li>
          <li>💡 Recruiter skim → interviews → final panel</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluation</div>
        <ul>
          <li><b>Split</b> — by time; hold out later interactions</li>
          <li><b>P@k</b> — hits/k; <b>R@k</b> — hits/|relevant|</li>
          <li><b>AP@k</b> — mean precision at each hit; <b>MAP</b> = mean over users</li>
          <li><b>NDCG</b> — Σ rel/log₂(rank+1) ÷ ideal; graded relevance</li>
          <li><b>Coverage</b> — share of catalog recommended; <b>diversity</b> — dissimilarity within a list</li>
          <li>Toy: hits at ranks 1,3 of {A,C,F} → P@5 0.40, R@5 0.67, AP 0.556</li>
          <li>⚠ Offline ≠ online; A/B test decides</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bias &amp; feedback loops</div>
        <ul>
          <li><b>Popularity bias</b> — popular items over-shown, long tail starved</li>
          <li><b>Feedback loop</b> — model trains on its own exposure; rich get richer</li>
          <li><b>Fixes</b> — exploration (ε-greedy, bandits), rank by rate not count, IPS weighting, diversity re-rank, log impressions</li>
          <li>Sim: greedy popularity found 0/5 best items; CTR + 10% explore found 3/5</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rs-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem &amp; Feedback</span><span class="rm-sub">Business goal, explicit vs implicit</span></div></div>
      <div class="rm-item rm-done" data-target="rs-content"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Content-Based Filtering</span><span class="rm-sub">Items like ones you liked</span></div></div>
      <div class="rm-item rm-done" data-target="rs-cf"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Collaborative Filtering</span><span class="rm-sub">User-user and item-item</span></div></div>
      <div class="rm-item rm-done" data-target="rs-mf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrix Factorization</span><span class="rm-sub">ALS in 15 lines of numpy</span></div></div>
      <div class="rm-item rm-done" data-target="rs-cold"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Cold Start</span><span class="rm-sub">New users, new items</span></div></div>
      <div class="rm-item rm-done" data-target="rs-stage"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Two-Stage Ranking Systems</span><span class="rm-sub">Retrieval → ranking → re-rank</span></div></div>
      <div class="rm-item rm-done" data-target="rs-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Evaluation</span><span class="rm-sub">P@k, R@k, MAP, NDCG, coverage</span></div></div>
      <div class="rm-item rm-done" data-target="rs-bias"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Popularity Bias &amp; Feedback Loops</span><span class="rm-sub">The rich get richer</span></div></div>
      <div class="rm-item rm-done" data-target="rs-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="rs-problem"><span class="num">01</span>The Problem &amp; Feedback</h2>
  <div class="flow"><span>Huge catalog</span><span>Limited screen slots</span><span>Pick the few most likely to engage</span><span>Business metric moves</span></div>
  <p>A recommender predicts, for a user, which items they'll engage with, then ranks them. Offline you optimise a proxy (clicks, ratings); the business cares about watch time, revenue, retention.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A good bookshop clerk. They remember what you bought (history), know which books go together (similarity), and notice what people like you enjoyed (collaboration).</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Explicit feedback</th><th>Implicit feedback</th></tr>
    <tr><td>What</td><td>Ratings, likes, thumbs</td><td>Clicks, views, watch time, purchases</td></tr>
    <tr><td>Volume</td><td>Scarce (few users rate)</td><td>Abundant</td></tr>
    <tr><td>Negatives</td><td>Clear (1 star)</td><td><strong>Missing</strong>: no click ≠ dislike; maybe never seen</td></tr>
    <tr><td>Typical task</td><td>Predict the rating (regression)</td><td>Rank items / predict interaction (classification)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating every unclicked item as a negative. Most were never shown. Sample negatives from items the user was actually exposed to, or weight them low (as implicit ALS does with confidence weights).</p>
  </div>

  <h2 id="rs-content"><span class="num">02</span>Content-Based Filtering</h2>
  <div class="flow"><span>Item features (genre, text, embeddings)</span><span>User profile = average of liked items</span><span>Cosine(profile, each item)</span><span>Top-k</span></div>
  <div class="cards">
    <div><b>Strengths</b><p>Works for brand-new items with features. Explainable: "because you watched X".</p><small>No other users needed</small></div>
    <div><b>Weaknesses</b><p>Over-specialised: sci-fi fans only get sci-fi. Needs good features.</p><small>No serendipity</small></div>
  </div>
  <p>Modern versions embed item text or images with a pretrained model and use nearest-neighbour search on the vectors.</p>

  <h2 id="rs-cf"><span class="num">03</span>Collaborative Filtering</h2>
  <p>Use only the user × item interaction matrix: "people who agreed with you before will agree again". No item features needed.</p>
  <table class="tbl out"><caption>Toy ratings matrix R (· = not rated)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>1</td><td>·</td><td>2</td></tr>
    <tr><td>Ben</td><td>4</td><td><strong>?</strong></td><td>1</td><td>1</td><td>·</td></tr>
    <tr><td>Chen</td><td>1</td><td>1</td><td>5</td><td>4</td><td>·</td></tr>
    <tr><td>Dia</td><td>·</td><td>2</td><td>4</td><td>5</td><td>3</td></tr>
  </table>
  <div class="cards">
    <div><b>User-user</b><p>Find users similar to Ben; average their ratings of the item.</p><small>Users change taste; many users → slow</small></div>
    <div><b>Item-item</b><p>Find items similar to the target among what Ben rated; weight his ratings.</p><small>Amazon's classic; item similarities are stable, precomputable</small></div>
  </div>
  <h3>Item-item, raw cosine</h3>
  <div class="fx" data-lang="py">import numpy as np
R = np.array([[5,4,1,0,2],
              [4,0,1,1,0],
              [1,1,5,4,0],
              [0,2,4,5,3]], float)          # rows = users, cols = items, 0 = missing
def cos(a, b): return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
S = np.array([[cos(R[:, i], R[:, j]) for j in range(5)] for i in range(5)])
rated = np.where(R[1] &gt; 0)[0]               # what Ben rated
w = S[1, rated]                              # their similarity to Interstellar
print(w.round(2), "pred =", round(w @ R[1, rated] / w.sum(), 2))</div>
  <div class="fx" data-lang="text">[0.71 0.57 0.47] pred = 2.22</div>
  <p>Ben loves Inception and dislikes the romances, so 2.22 is wrong. Raw ratings are all positive, so every cosine is positive and the disliked items still vote.</p>
  <h3>Fix: mean-centre first (adjusted cosine)</h3>
  <div class="fx" data-lang="py">mask = R &gt; 0
mu = R.sum(1) / mask.sum(1)                       # each user's average rating
C = np.where(mask, R - mu[:, None], 0)            # "above/below my usual"
S = np.array([[cos(C[:, i], C[:, j]) for j in range(5)] for i in range(5)])
w = S[1, rated]
pos = w &gt; 0                                       # keep similar neighbours only
pred = mu[1] + w[pos] @ C[1, rated][pos] / np.abs(w[pos]).sum()
print(mu.round(2), w.round(2), round(pred, 2))</div>
  <div class="fx" data-lang="text">[3.   2.   2.75 3.5 ] [ 0.61 -0.83 -0.81] 4.0</div>
  <table class="tbl out"><caption>Adjusted item-item similarity (selected)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th></tr>
    <tr><td>Inception</td><td>1.00</td><td>0.61</td><td>-0.93</td><td>-0.57</td></tr>
    <tr><td>Interstellar</td><td>0.61</td><td>1.00</td><td>-0.83</td><td>-0.81</td></tr>
    <tr><td>Notebook</td><td>-0.93</td><td>-0.83</td><td>1.00</td><td>0.65</td></tr>
  </table>
  <p>Now sci-fi vs romance is negative, and Ben gets 4.0 for Interstellar. User-user cosine on the same matrix: Asha–Ben 0.73, Chen–Dia 0.87 (the two taste clusters).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Neighbourhood CF on sparse data: two users who share one rated item can get similarity 1.0. Require a minimum overlap or shrink similarities toward 0.</p>
  </div>

  <h2 id="rs-mf"><span class="num">04</span>Matrix Factorization</h2>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560">
<rect x="20" y="30" width="150" height="120" class="fs" stroke="currentColor"/>
<text x="95" y="20" text-anchor="middle">R  (users × items)</text>
<text x="95" y="95" text-anchor="middle" class="tm">4 × 5, sparse</text>
<text x="200" y="95" text-anchor="middle">≈</text>
<rect x="230" y="30" width="50" height="120" class="fb sb"/>
<text x="255" y="20" text-anchor="middle" class="tb">P</text>
<text x="255" y="95" text-anchor="middle">4×2</text>
<text x="300" y="95" text-anchor="middle">×</text>
<rect x="320" y="60" width="150" height="50" class="ft st"/>
<text x="395" y="50" text-anchor="middle">Qᵀ</text>
<text x="395" y="90" text-anchor="middle">2×5</text>
<text x="20" y="166" class="tm">rating(u,i) ≈ P[u] · Q[i]  (user vector · item vector)</text>
<text x="490" y="80" class="tm">k = 2</text><text x="490" y="96" class="tm">latent</text><text x="490" y="112" class="tm">factors</text>
</svg><figcaption>Compress the sparse matrix into two thin dense ones. Their product fills in the blanks.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Describe every film by a few sliders ("how sci-fi", "how romantic") and every user by how much they like each slider. Nobody names the sliders; training discovers them.</p>
  </div>
  <p>Loss: squared error on <em>observed</em> cells only, plus L2 regularisation (λ). Two ways to minimise it:</p>
  <div class="cards">
    <div><b>SGD</b><p>Loop over observed ratings, nudge P[u] and Q[i] along the gradient.</p><small>Funk SVD (Netflix Prize)</small></div>
    <div><b>ALS</b><p>Fix Q, solve P exactly (ridge regression); fix P, solve Q; repeat.</p><small>Parallel; Spark MLlib, implicit-feedback ALS</small></div>
  </div>
  <div class="fx" data-lang="py">M = R &gt; 0                          # observed mask
k, lam = 2, 0.1
rng = np.random.default_rng(0)
P = rng.normal(0, 0.5, (4, k))     # user factors
Q = rng.normal(0, 0.5, (5, k))     # item factors
I = np.eye(k)
for it in range(15):
    for u in range(4):             # fix Q -&gt; ridge solve for each user
        Qu = Q[M[u]]
        P[u] = np.linalg.solve(Qu.T @ Qu + lam*I, Qu.T @ R[u, M[u]])
    for i in range(5):             # fix P -&gt; ridge solve for each item
        Pi = P[M[:, i]]
        Q[i] = np.linalg.solve(Pi.T @ Pi + lam*I, Pi.T @ R[M[:, i], i])
    if it in (0, 1, 4, 14):
        print(f"iter {it+1:2d}  train RMSE {np.sqrt(np.mean((R - P @ Q.T)[M]**2)):.3f}")</div>
  <div class="fx" data-lang="text">iter  1  train RMSE 0.439
iter  2  train RMSE 0.284
iter  5  train RMSE 0.253
iter 15  train RMSE 0.251</div>
  <table class="tbl out"><caption>P @ Q.T  (bold = filled-in blanks)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th></tr>
    <tr><td>Asha</td><td>5.0</td><td>3.9</td><td>1.0</td><td><strong>1.5</strong></td><td>2.0</td></tr>
    <tr><td>Ben</td><td>3.9</td><td><strong>3.1</strong></td><td>0.8</td><td>1.2</td><td><strong>1.6</strong></td></tr>
    <tr><td>Chen</td><td>1.0</td><td>1.0</td><td>4.5</td><td>4.4</td><td><strong>2.6</strong></td></tr>
    <tr><td>Dia</td><td><strong>2.4</strong></td><td>2.0</td><td>4.5</td><td>4.5</td><td>3.0</td></tr>
  </table>
  <p>Learned item factors: Inception [-0.15, -1.56], Notebook [-1.50, 0.05]. One axis became "sci-fi", the other "romance", unprompted.</p>
  <div class="callout intu"><span class="label">Production upgrades</span>
    <p>Add user and item <strong>biases</strong> (some users rate high; some films are loved by all). Two-tower neural nets generalise MF: each tower turns features into the vector, so new items get a vector too.</p>
  </div>

  <h2 id="rs-cold"><span class="num">05</span>Cold Start</h2>
  <p>CF needs history. A new user or item has none, so its row/column is empty.</p>
  <table class="tbl">
    <tr><th>Case</th><th>Strategies</th></tr>
    <tr><td><strong>New user</strong></td><td>Popular / trending items; onboarding quiz ("pick 3 genres"); context (location, device, referrer); update quickly from first clicks</td></tr>
    <tr><td><strong>New item</strong></td><td>Content features → content-based or two-tower item vector; boost exposure with exploration slots; borrow from similar items' embeddings</td></tr>
    <tr><td><strong>New system</strong></td><td>Start with rules and popularity, log impressions from day one, add CF when data arrives</td></tr>
  </table>
  <div class="callout intu"><span class="label">Hybrid is the default</span>
    <p>Real systems blend: content features for cold items, CF for warm ones, popularity as the fallback.</p>
  </div>

  <h2 id="rs-stage"><span class="num">06</span>Two-Stage Ranking Systems</h2>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<defs><marker id="rs-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="5" y="20" width="110" height="110" class="fs" stroke="currentColor"/>
<text x="60" y="65" text-anchor="middle">Catalog</text><text x="60" y="85" text-anchor="middle" class="tm">10M items</text>
<rect x="150" y="35" width="110" height="80" class="fb sb"/>
<text x="205" y="60" text-anchor="middle">Retrieval</text><text x="205" y="78" text-anchor="middle" class="tm">ANN, CF, rules</text><text x="205" y="96" text-anchor="middle" class="tm">→ ~1,000</text>
<rect x="295" y="48" width="110" height="54" class="fv"/>
<text x="350" y="70" text-anchor="middle">Ranking</text><text x="350" y="88" text-anchor="middle" class="tm">GBM / DNN → 50</text>
<rect x="440" y="58" width="110" height="34" class="fg sg"/>
<text x="495" y="79" text-anchor="middle">Re-rank → 10</text>
<line x1="117" y1="75" x2="147" y2="75" stroke="currentColor" marker-end="url(#rs-ar2)"/>
<line x1="262" y1="75" x2="292" y2="75" stroke="currentColor" marker-end="url(#rs-ar2)"/>
<line x1="407" y1="75" x2="437" y2="75" stroke="currentColor" marker-end="url(#rs-ar2)"/>
<text x="150" y="145" class="tm">cheap, high recall</text><text x="350" y="145" class="tm">costly, high precision</text>
</svg><figcaption>Each stage sees fewer items but spends more compute per item. Budget: ~100 ms total.</figcaption></figure>
  <table class="tbl">
    <tr><th>Stage</th><th>Goal</th><th>Typical tools</th></tr>
    <tr><td>Retrieval / candidate generation</td><td>Don't miss good items (recall)</td><td>Two-tower embeddings + approximate nearest-neighbour (FAISS), item-item CF, "trending", "continue watching"</td></tr>
    <tr><td>Ranking</td><td>Order candidates precisely</td><td>LightGBM or deep model with user, item, context and cross features; predicts P(click), watch time</td></tr>
    <tr><td>Re-ranking</td><td>Business rules</td><td>Diversity, freshness, dedupe, remove already-bought, sponsored slots, fairness</td></tr>
  </table>
  <h3>Learning to rank</h3>
  <div class="cards">
    <div><b>Pointwise</b><p>Predict a score per item (logloss on click).</p><small>Simplest; most common</small></div>
    <div><b>Pairwise</b><p>Learn "A above B" for pairs.</p><small>RankNet, BPR</small></div>
    <div><b>Listwise</b><p>Optimise the whole list's metric, e.g. NDCG.</p><small>LambdaMART (LGBMRanker)</small></div>
  </div>

  <h2 id="rs-eval"><span class="num">07</span>Evaluation</h2>
  <p>Hold out each user's <em>later</em> interactions (time split), recommend top-k, and compare with what they actually engaged with.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Question it answers</th><th>Order-aware?</th></tr>
    <tr><td><strong>Precision@k</strong></td><td>What fraction of my k recs were relevant?</td><td>No</td></tr>
    <tr><td><strong>Recall@k</strong></td><td>What fraction of the relevant items did I find?</td><td>No</td></tr>
    <tr><td><strong>AP@k / MAP</strong></td><td>Average precision at each hit; MAP = mean over users</td><td>Yes</td></tr>
    <tr><td><strong>NDCG@k</strong></td><td>Hits discounted by 1/log₂(rank+1), divided by the ideal</td><td>Yes; supports graded relevance</td></tr>
    <tr><td><strong>Coverage</strong></td><td>Share of catalog ever recommended</td><td>Beyond-accuracy</td></tr>
    <tr><td><strong>Diversity</strong></td><td>How different are items within one list?</td><td>Beyond-accuracy</td></tr>
  </table>
  <div class="fx" data-lang="py">def precision_at_k(rec, rel, k): return len(set(rec[:k]) &amp; rel) / k
def recall_at_k(rec, rel, k):    return len(set(rec[:k]) &amp; rel) / len(rel)
def ap_at_k(rec, rel, k):
    hits, s = 0, 0.0
    for i, item in enumerate(rec[:k], 1):
        if item in rel: hits += 1; s += hits / i      # precision at each hit
    return s / min(len(rel), k)
def ndcg_at_k(rec, rel, k):
    dcg  = sum(1/np.log2(i+1) for i, item in enumerate(rec[:k], 1) if item in rel)
    idcg = sum(1/np.log2(i+1) for i in range(1, min(len(rel), k)+1))
    return dcg / idcg

recs  = {"u1": ["A","B","C","D","E"], "u2": ["B","F","A","G","H"]}
truth = {"u1": {"A","C","F"},          "u2": {"G"}}
for u in recs:
    r, t = recs[u], truth[u]
    print(u, f"P@5={precision_at_k(r,t,5):.2f} R@5={recall_at_k(r,t,5):.2f} "
             f"AP@5={ap_at_k(r,t,5):.3f} NDCG@5={ndcg_at_k(r,t,5):.3f}")
print("MAP@5 =", round(np.mean([ap_at_k(recs[u], truth[u], 5) for u in recs]), 3))

shown = set(sum(recs.values(), []))                 # catalog = A..J (10 items)
print(f"coverage = {len(shown)}/10 = {len(shown)/10:.0%}")
genre = {"A":"scifi","B":"scifi","C":"scifi","D":"drama","E":"scifi",
         "F":"comedy","G":"drama","H":"comedy"}
def ild(lst):                                       # share of pairs with different genres
    pairs = [(a, b) for i, a in enumerate(lst) for b in lst[i+1:]]
    return np.mean([genre[a] != genre[b] for a, b in pairs])
for u in recs: print(u, "diversity =", round(ild(recs[u]), 2))</div>
  <div class="fx" data-lang="text">u1 P@5=0.40 R@5=0.67 AP@5=0.556 NDCG@5=0.704
u2 P@5=0.20 R@5=1.00 AP@5=0.250 NDCG@5=0.431
MAP@5 = 0.403
coverage = 8/10 = 80%
u1 diversity = 0.4
u2 diversity = 0.8</div>
  <ul>
    <li>u1 AP: hits at ranks 1 and 3 → (1/1 + 2/3) / 3 = 0.556.</li>
    <li>u2 has perfect recall but its only hit sits at rank 4, so NDCG and AP punish it.</li>
    <li>Coverage: 8 of 10 catalog items appeared in someone's list. Diversity: share of item pairs in a list with different genres.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: offline ≠ online</span>
    <p>Logged data only contains what the old system showed. Offline wins often don't survive; the final judge is an A/B test on the business metric.</p>
  </div>

  <h2 id="rs-bias"><span class="num">08</span>Popularity Bias &amp; Feedback Loops</h2>
  <figure class="viz"><svg viewBox="0 0 560 145" width="560">
<defs><marker id="rs-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs>
<rect x="10" y="40" width="120" height="40" class="fb sb"/><text x="70" y="65" text-anchor="middle">Recommend</text>
<rect x="160" y="40" width="120" height="40" class="ft st"/><text x="220" y="65" text-anchor="middle">Users click</text>
<rect x="310" y="40" width="120" height="40" class="fv"/><text x="370" y="65" text-anchor="middle">Log as training</text>
<rect x="440" y="40" width="110" height="40" class="fr sr"/><text x="495" y="65" text-anchor="middle">Retrain</text>
<line x1="132" y1="60" x2="157" y2="60" stroke="currentColor" marker-end="url(#rs-ar3)"/>
<line x1="282" y1="60" x2="307" y2="60" stroke="currentColor" marker-end="url(#rs-ar3)"/>
<line x1="432" y1="60" x2="437" y2="60" stroke="currentColor" marker-end="url(#rs-ar3)"/>
<path d="M495,82 Q495,118 280,118 Q70,118 70,84" fill="none" stroke="currentColor" marker-end="url(#rs-ar3)"/>
<text x="280" y="138" text-anchor="middle" class="tm">unshown items get no clicks → never learned → never shown</text>
</svg><figcaption>The model trains on data its own past choices created. Popular items get more exposure, so more clicks, so more exposure.</figcaption></figure>
  <p>Simulation: 50 items with hidden true click rates; each round shows 5. Compare a "most clicked" policy with smoothed CTR plus 10% random exploration.</p>
  <div class="fx" data-lang="py">def simulate(score, eps, rounds=3000, n=50, seed=1):
    rng = np.random.default_rng(seed)
    appeal = rng.uniform(0.05, 0.3, n)              # true click probability (unknown)
    clicks, shows = np.zeros(n), np.zeros(n)
    for _ in range(rounds):
        if rng.random() &lt; eps: slate = rng.choice(n, 5, replace=False)          # explore
        else: slate = np.argsort(-score(clicks, shows) + rng.random(n)*1e-9)[:5]  # exploit
        shows[slate] += 1
        clicks[slate] += rng.random(5) &lt; appeal[slate]
    top5 = np.argsort(-score(clicks, shows))[:5]
    return (shows &gt; 0).sum(), len(set(top5) &amp; set(np.argsort(-appeal)[:5]))
popularity = lambda c, s: c                      # "most clicked"
ctr        = lambda c, s: (c + 1) / (s + 5)      # smoothed click rate
for name, f, eps in [("popularity, no explore", popularity, 0.0),
                     ("smoothed CTR, 10% explore", ctr, 0.1)]:
    seen, hit = simulate(f, eps)
    print(f"{name:26s} items ever shown={seen:2d}/50  true top-5 found={hit}/5")</div>
  <div class="fx" data-lang="text">popularity, no explore     items ever shown=16/50  true top-5 found=0/5
smoothed CTR, 10% explore  items ever shown=50/50  true top-5 found=3/5</div>
  <p>The greedy popularity loop locked onto early winners and never found a single truly-best item.</p>
  <ul>
    <li><strong>Exploration</strong>: ε-greedy slots, Thompson sampling / bandits.</li>
    <li><strong>Normalise by exposure</strong>: rank by rate, not raw count; inverse propensity weighting in training.</li>
    <li><strong>Re-rank for diversity / long tail</strong>; track coverage and novelty on dashboards.</li>
    <li><strong>Log impressions</strong>, not just clicks, so you know what was seen and ignored.</li>
  </ul>

  <h2 id="rs-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Content-based vs collaborative filtering: when does each win?</summary><div class="qa-body">Content-based wins for new items with good features and when you need explanations. CF wins when there's rich interaction history: it finds non-obvious links ("people who buy X also buy Y") without any features. Most systems are hybrids.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is item-item CF usually preferred over user-user at scale?</summary><div class="qa-body">There are usually fewer items than users, item similarities change slowly so they can be precomputed offline, and each item has many ratings so its similarities are more reliable. User tastes drift, and user vectors are sparse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why mean-centre ratings before computing cosine similarity?</summary><div class="qa-body">Raw ratings are all positive, so every cosine is positive and disliked items still pull predictions toward themselves. Centring by each user's mean turns ratings into "above/below my usual", giving negative similarities for opposite tastes. In the toy example the prediction went from 2.22 to 4.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain matrix factorization in two sentences, and what ALS does.</summary><div class="qa-body">Approximate the sparse user×item matrix as the product of a user-factor matrix and an item-factor matrix, so each rating ≈ dot product of two k-dim vectors; train on observed cells with L2. ALS alternates: fix item factors and solve each user exactly as ridge regression, then fix users and solve items, repeating until convergence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a brand-new item with no interactions?</summary><div class="qa-body">Use its content (text, image, category) to get an embedding via a content model or a two-tower item tower, place it among similar items, and give it guaranteed exploration impressions so it collects data fast. Then let CF take over.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do large recommenders use a retrieval stage and a ranking stage?</summary><div class="qa-body">Scoring millions of items with a heavy model per request is too slow. Retrieval cheaply narrows to ~hundreds with high recall (embeddings + ANN, CF, heuristics); the ranking model then spends rich features and compute on just those, optimising precision within the latency budget.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs = [A,B,C,D,E], relevant = {A,C,F}. Compute P@5, R@5 and AP@5.</summary><div class="qa-body">Hits: A (rank 1), C (rank 3). P@5 = 2/5 = 0.40. R@5 = 2/3 = 0.67. AP@5 = (1/1 + 2/3) / 3 = 0.556 (divide by min(|relevant|, k) = 3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your new model wins offline on NDCG but loses the A/B test. Possible reasons?</summary><div class="qa-body">Offline data is biased by the old policy's exposure; the proxy (click) doesn't match the business metric (retention, revenue); position bias in logs; less diversity causing fatigue; leakage in the offline split (random instead of time-based).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a feedback loop in recommenders and how do you mitigate it?</summary><div class="qa-body">The model trains on interactions its own recommendations caused, so shown items gain clicks and unshown items are never learned: popularity snowballs. Mitigate with exploration (ε-greedy, bandits), exposure-normalised targets or inverse propensity weighting, diversity re-ranking, and logging impressions.</div></details>
</main>`
});
