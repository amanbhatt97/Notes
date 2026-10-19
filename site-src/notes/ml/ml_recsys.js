// ml/ml_recsys.js — Recommendation Systems
Object.assign(TOPIC_CONTENT, {
  "ml_recsys": `<main>
  <h1>Recommendation Systems</h1>
  <p class="lead">How Netflix, Amazon, Flipkart and Spotify choose the few things to show you out of millions: content-based filtering, collaborative filtering, matrix factorization, two-stage ranking, and how to measure all of it. Builds on vectors, cosine similarity and classification.</p>

  <h2 id="rs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recommendation Systems</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Problem &amp; feedback</div>
        <ul>
          <li><b>Goal</b> — pick a few items from a huge catalog for a few screen slots</li>
          <li><b>Stand-in vs real goal</b> — we optimise clicks/ratings; business wants watch time, revenue, retention</li>
          <li><b>Explicit</b> — ratings, likes; rare, clear dislikes</li>
          <li><b>Implicit</b> — clicks, views, purchases; plenty, but no true dislikes; weight events (view 1, purchase 5)</li>
          <li><b>Interaction matrix</b> — users × items, mostly empty (sparse)</li>
          <li>⚠ No click ≠ dislike (maybe never seen); use shown-but-not-clicked as negatives</li>
          <li>💡 A good bookshop owner: your history + similar books + people like you</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Content-based</div>
        <ul>
          <li><b>How</b> — user profile = average features of liked items; cosine to every item</li>
          <li><b>Features</b> — genre, tags, text/image embeddings</li>
          <li><b>Pros</b> — works for new items, easy to explain, no other users needed</li>
          <li><b>Cons</b> — same type again and again, no surprises, needs good features</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Collaborative filtering</div>
        <ul>
          <li><b>Idea</b> — people who agreed before will agree again; uses only the user × item table</li>
          <li><b>User-user</b> — ratings of similar users; tastes change, slow at scale</li>
          <li><b>Item-item</b> — items similar to what you rated; stable, can precompute (Amazon)</li>
          <li><b>Predict</b> — μᵤ + Σ sim·(r − μᵤ) / Σ|sim| over top-k neighbours</li>
          <li>⚠ <b>Mean-centre first</b> — raw cosine is always positive; toy: 2.22 → 4.0</li>
          <li>⚠ One shared item can give fake sim = 1; need a minimum overlap</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrix factorization</div>
        <ul>
          <li><b>R ≈ P·Qᵀ</b> — each user and item gets a short vector of k hidden factors</li>
          <li><b>Rating</b> = user vector · item vector (dot product)</li>
          <li><b>Loss</b> — squared error on known cells only + λ(‖P‖² + ‖Q‖²)</li>
          <li><b>SGD</b> — small step per rating (Funk SVD, Netflix Prize)</li>
          <li><b>ALS</b> — fix Q, solve P by ridge; fix P, solve Q; runs in parallel (Spark)</li>
          <li><b>Biases</b> — global + user + item · <b>Two-tower</b> — neural MF from features; new items get a vector</li>
          <li>⚠ More parameters than ratings → train RMSE 0.025 means overfit, not success</li>
          <li>💡 Hidden sliders ("how sci-fi", "how romantic") found by training</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cold start</div>
        <ul>
          <li><b>New user</b> — popular items, onboarding quiz, context (city, device), learn fast from first clicks</li>
          <li><b>New item</b> — content features / two-tower vector, guaranteed exploration slots</li>
          <li><b>New system</b> — rules + popularity; log impressions from day one</li>
          <li><b>Hybrid</b> — CF for warm, quiz/content for cold, popularity as backup and top-up</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two-stage system</div>
        <ul>
          <li><b>Retrieval</b> — millions → ~1,000; aim = don't miss (recall); two-tower + ANN (FAISS), CF, trending</li>
          <li><b>Ranking</b> — ~1,000 → 50; aim = right order (precision); GBM/DNN with rich features</li>
          <li><b>Re-rank</b> — diversity (max 2 per genre), freshness, dedupe, business rules</li>
          <li><b>LTR</b> — pointwise (logloss), pairwise (BPR, RankNet), listwise (LambdaMART)</li>
          <li>💡 Job hiring: CV skim → interviews → final panel</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluation</div>
        <ul>
          <li><b>Split</b> — by time; hold out later interactions</li>
          <li><b>P@k</b> — hits/k · <b>R@k</b> — hits/|relevant|</li>
          <li><b>AP@k</b> — mean precision at each hit · <b>MAP</b> = mean over users</li>
          <li><b>NDCG</b> — Σ rel/log₂(rank+1) ÷ ideal; hits near the top count more</li>
          <li><b>Coverage</b> — share of catalog ever shown · <b>diversity</b> — how different items in a list are</li>
          <li>Toy: hits at ranks 1, 3 of {A,C,F} → P@5 0.40, R@5 0.67, AP 0.556, NDCG 0.704</li>
          <li>⚠ Offline ≠ online; the A/B test decides</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bias &amp; feedback loops</div>
        <ul>
          <li><b>Popularity bias</b> — popular items shown too much, long tail ignored</li>
          <li><b>Position bias</b> — top slots get clicks just for being on top</li>
          <li><b>Feedback loop</b> — model trains on what it showed; rich get richer</li>
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
      <div class="rm-item rm-done" data-target="rs-mf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrix Factorization</span><span class="rm-sub">ALS and SGD in numpy</span></div></div>
      <div class="rm-item rm-done" data-target="rs-cold"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Cold Start</span><span class="rm-sub">New users, new items</span></div></div>
      <div class="rm-item rm-done" data-target="rs-stage"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Two-Stage Ranking Systems</span><span class="rm-sub">Retrieval → ranking → re-rank</span></div></div>
      <div class="rm-item rm-done" data-target="rs-eval"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Evaluation</span><span class="rm-sub">P@k, R@k, MAP, NDCG, coverage</span></div></div>
      <div class="rm-item rm-done" data-target="rs-bias"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Popularity Bias &amp; Feedback Loops</span><span class="rm-sub">The rich get richer</span></div></div>
      <div class="rm-item rm-done" data-target="rs-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Fake negatives, leaky splits, wrong metric</span></div></div>
      <div class="rm-item rm-done" data-target="rs-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="rs-problem"><span class="num">01</span>The Problem &amp; Feedback</h2>
  <p>Open Hotstar or Amazon. The catalog has millions of items, but your phone screen has room for maybe 10. Without help you would see the same "top 10" list as everyone else, or you would have to search and scroll forever. Most people give up and leave. A <strong>recommender system</strong> guesses which few items <em>you</em> are most likely to engage with, and puts them in those slots.</p>
  <div class="flow"><span>Huge catalog</span><span>Limited screen slots</span><span>Pick the few most likely to engage</span><span>Business metric moves</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A good bookshop owner in College Street, Kolkata. He remembers what you bought (your history), knows which books go together (item similarity), and notices what readers like you enjoyed (collaboration). The three families of methods on this page copy those three habits.</p>
  </div>
  <p>The model needs a signal of what people like. There are two kinds:</p>
  <table class="tbl">
    <tr><th></th><th>Explicit feedback</th><th>Implicit feedback</th></tr>
    <tr><td>What</td><td>Ratings, likes, thumbs</td><td>Clicks, views, watch time, add-to-cart, purchases</td></tr>
    <tr><td>Volume</td><td>Rare (few users bother to rate)</td><td>Plenty (every action is logged)</td></tr>
    <tr><td>Negatives</td><td>Clear (1 star)</td><td><strong>Missing</strong>: no click ≠ dislike; maybe never seen</td></tr>
    <tr><td>Typical task</td><td>Predict the rating (regression)</td><td>Rank items / predict interaction (classification)</td></tr>
  </table>
  <p>Most real systems run on implicit feedback, which starts life as an <strong>event log</strong>: one row per action. To learn from it we turn it into an <strong>interaction matrix</strong>: one row per user, one column per item, and a number in each cell saying how strongly they engaged. Different events get different weights, because buying says more than glancing.</p>
  <p><strong>Worked example.</strong> Asha viewed Dangal, viewed Lagaan, then bought Dangal. With view = 1 and purchase = 5, her Dangal cell is 1 + 5 = 6 and her Lagaan cell is 1. Chen viewed PK twice, so his PK cell is 2. The code builds the same table with pandas:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
log = pd.DataFrame({
    "user":  ["asha", "asha", "asha", "ben", "ben", "chen", "chen", "chen"],
    "item":  ["Dangal", "Lagaan", "Dangal", "Lagaan", "3 Idiots", "PK", "3 Idiots", "PK"],
    "event": ["view", "view", "purchase", "view", "view", "view", "view", "view"]})
weight = {"view": 1, "purchase": 5}                 # a purchase says more than a view
log["w"] = log["event"].map(weight)
M = log.pivot_table(index="user", columns="item", values="w", aggfunc="sum", fill_value=0)
print(M)
print("filled cells:", (M.values &gt; 0).sum(), "of", M.size)</div>
  <div class="fx" data-lang="text">item  3 Idiots  Dangal  Lagaan  PK
user                              
asha         0       6       1   0
ben          1       0       1   0
chen         1       0       0   2
filled cells: 6 of 12</div>
  <p><code>map(weight)</code> turns each event name into its weight. <code>pivot_table</code> makes users the rows and items the columns, and <code>aggfunc="sum"</code> adds up repeated events in the same cell. <code>fill_value=0</code> puts 0 where there was no interaction. Here half the cells are filled. In real life it is more like 0.01%: a user touches a few hundred items out of millions. A table that is almost all empty is called <strong>sparse</strong>, and handling sparsity is the core difficulty of recommenders.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Recommender system</strong>: a model that scores (user, item) pairs and shows each user the top-scoring items. <strong>Proxy (stand-in) metric</strong>: what we can measure offline, such as clicks or ratings. The business goal (watch time, revenue, retention) is what we actually want; the two can disagree.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating every 0 in the matrix as a dislike. Most of those items were never shown to the user. Take negatives from items the user actually saw and skipped, or give zeros a low weight (implicit-feedback ALS does this with "confidence" weights).</p>
  </div>
  <p>Where you meet this: home feeds (YouTube, Instagram), "customers also bought" (Amazon, Flipkart), playlists (Spotify), restaurant lists (Zomato, Swiggy), job matches (LinkedIn), and ads. In ML interviews, "design a recommender for X" is one of the most common system-design questions.</p>

  <h2 id="rs-content"><span class="num">02</span>Content-Based Filtering</h2>
  <p>The simplest useful idea: if you liked something, show more things that look like it. We do not need any other users for this, just a description of each item. That description can be hand tags (genre, language, actors) or a vector produced by a text or image model.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A friend who knows you love spicy Andhra food suggests another Andhra restaurant. Good guess, but he will never suggest the Thai place you might also love, because nothing about it looks "Andhra".</p>
  </div>
  <div class="flow"><span>Item features (genre, text, embeddings)</span><span>User profile = average of liked items</span><span>Cosine(profile, each item)</span><span>Top-k unseen items</span></div>
  <p><strong>Worked example.</strong> Each film gets four 0/1 tags: [sports, drama, romance, comedy]. Dangal = [1,1,0,0], Lagaan = [1,1,1,0]. The user liked both, so the profile is their average: [1, 1, 0.5, 0]. Now compare the profile with each film using <strong>cosine similarity</strong>: the dot product divided by both lengths, which measures the angle between two vectors (1 = same direction, 0 = nothing in common). For Chak De = [1,1,0,0]: dot = 1 + 1 + 0 + 0 = 2; lengths √2 = 1.414 and √2.25 = 1.5; cosine = 2 / (1.414 × 1.5) = <strong>0.94</strong>. For DDLJ = [0,0,1,0]: dot = 0.5; cosine = 0.5 / (1 × 1.5) = <strong>0.33</strong>.</p>
  <div class="fx" data-lang="py">items = ["Dangal", "Chak De", "Lagaan", "DDLJ", "Kabhi Khushi", "3 Idiots"]
#              sports drama romance comedy
F = np.array([[1, 1, 0, 0],          # Dangal
              [1, 1, 0, 0],          # Chak De
              [1, 1, 1, 0],          # Lagaan
              [0, 0, 1, 0],          # DDLJ
              [0, 1, 1, 0],          # Kabhi Khushi
              [0, 1, 0, 1]], float)  # 3 Idiots
liked = [0, 2]                                        # Dangal and Lagaan
profile = F[liked].mean(axis=0)
norm = np.linalg.norm
scores = F @ profile / (norm(F, axis=1) * norm(profile))   # cosine with every item
print("profile:", profile)
for i in np.argsort(-scores):
    if i not in liked:                                 # don't recommend what they saw
        print(f"{items[i]:13s} {scores[i]:.2f}")</div>
  <div class="fx" data-lang="text">profile: [1.  1.  0.5 0. ]
Chak De       0.94
Kabhi Khushi  0.71
3 Idiots      0.47
DDLJ          0.33</div>
  <p><code>F[liked].mean(axis=0)</code> averages the rows of liked films column by column to get the profile. <code>F @ profile</code> computes the dot product with every film at once; dividing by <code>norm(F, axis=1) * norm(profile)</code> turns it into cosine. <code>np.argsort(-scores)</code> lists films from highest to lowest score, and we skip the ones already liked. Chak De (a sports drama) wins, matching the hand calculation. DDLJ, a pure romance, is last.</p>
  <div class="cards">
    <div><b>Strengths</b><p>Works for a brand-new item the moment it has features. Easy to explain: "because you watched Dangal".</p><small>No other users needed</small></div>
    <div><b>Weaknesses</b><p>Too narrow: sports fans only get sports. Only as good as the features.</p><small>No happy surprises</small></div>
  </div>
  <p>Modern versions replace hand tags with <strong>embeddings</strong>: a pretrained model turns each item's title, description or poster into a vector of a few hundred numbers, and similar items get nearby vectors. The recipe stays the same: average, cosine, top-k.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Content-based filtering</strong>: recommending items whose features are similar to items the user liked, using only item features and that user's own history.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to remove already-seen items, so the top recommendations are things the user just watched. Also: popular tags like "drama" dominate the profile; weighting tags by rarity (TF-IDF) fixes this.</p>
  </div>

  <h2 id="rs-cf"><span class="num">03</span>Collaborative Filtering</h2>
  <p>Content-based filtering can't tell that people who buy a phone also buy a screen guard: nothing in their descriptions says so. But the purchase logs say so loudly. <strong>Collaborative filtering (CF)</strong> uses only the user × item table, with no item features at all: "people who agreed with you before will agree again". It finds links nobody wrote down.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You and a classmate liked the same five films. When she loves a sixth one, you will probably like it too, even if neither of you can say why.</p>
  </div>
  <p>We use this toy table of ratings from 1 to 5. Our job: predict Ben's rating for Interstellar.</p>
  <table class="tbl out"><caption>Toy ratings matrix R (· = not rated)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>1</td><td>·</td><td>2</td></tr>
    <tr><td>Ben</td><td>4</td><td><strong>?</strong></td><td>1</td><td>1</td><td>·</td></tr>
    <tr><td>Chen</td><td>1</td><td>1</td><td>5</td><td>4</td><td>·</td></tr>
    <tr><td>Dia</td><td>·</td><td>2</td><td>4</td><td>5</td><td>3</td></tr>
  </table>
  <p>By eye: Asha and Ben are sci-fi people, Chen and Dia are romance people. Ben gave Inception a 4 and the romances a 1. So he should like Interstellar. Two ways to turn that into maths:</p>
  <div class="cards">
    <div><b>User-user</b><p>Find users like Ben; average their ratings of Interstellar.</p><small>Tastes change; many users → slow</small></div>
    <div><b>Item-item</b><p>Among films Ben rated, find ones like Interstellar; weight his ratings by similarity.</p><small>Amazon's classic; item similarities are stable, can be precomputed</small></div>
  </div>
  <h3>Item-item, raw cosine</h3>
  <p>Each item is a column of ratings (0 for missing). Similarity of Inception [5,4,1,0] and Interstellar [4,0,1,2]: dot = 20 + 0 + 1 + 0 = 21; lengths √42 = 6.48 and √21 = 4.58; cosine = 21 / 29.7 = <strong>0.71</strong>. The prediction is a similarity-weighted average of Ben's own ratings.</p>
  <div class="fx" data-lang="py">R = np.array([[5,4,1,0,2],
              [4,0,1,1,0],
              [1,1,5,4,0],
              [0,2,4,5,3]], float)          # rows = users, cols = items, 0 = missing
def cos(a, b): return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
S = np.array([[cos(R[:, i], R[:, j]) for j in range(5)] for i in range(5)])
rated = np.where(R[1] &gt; 0)[0]               # what Ben rated: Inception, Notebook, Titanic
w = S[1, rated]                              # their similarity to Interstellar
print(w.round(2), "pred =", round(w @ R[1, rated] / w.sum(), 2))</div>
  <div class="fx" data-lang="text">[0.71 0.57 0.47] pred = 2.22</div>
  <p><code>S</code> is the 5 × 5 item-item similarity table. <code>np.where(R[1] &gt; 0)</code> finds the columns Ben rated. The prediction is (0.71×4 + 0.57×1 + 0.47×1) / (0.71 + 0.57 + 0.47) = 2.22. That is wrong: Ben clearly likes sci-fi. The problem: ratings are all positive numbers, so every cosine is positive, and the romances Ben hated still get a strong vote.</p>
  <h3>Fix: mean-centre first (adjusted cosine)</h3>
  <p>Subtract each user's average rating. Now a rating means "above or below my usual". Ben's average is (4+1+1)/3 = 2, so his ratings become Inception +2, Notebook −1, Titanic −1. Sci-fi and romance columns now point in opposite directions, and their cosine turns negative.</p>
  <div class="fx" data-lang="py">mask = R &gt; 0
mu = R.sum(1) / mask.sum(1)                       # each user's average rating
C = np.where(mask, R - mu[:, None], 0)            # "above/below my usual"
S = np.array([[cos(C[:, i], C[:, j]) for j in range(5)] for i in range(5)])
w = S[1, rated]
pos = w &gt; 0                                       # keep similar neighbours only
pred = mu[1] + w[pos] @ C[1, rated][pos] / np.abs(w[pos]).sum()
print(mu.round(2), w.round(2), round(pred, 2))</div>
  <div class="fx" data-lang="text">[3.   2.   2.75 3.5 ] [ 0.61 -0.83 -0.81] 4.0</div>
  <p><code>mu</code> holds the four user averages. <code>mu[:, None]</code> turns it into a column so each row subtracts its own mean. <code>C</code> keeps 0 for missing cells. The new similarities to Interstellar are +0.61 (Inception), −0.83 (Notebook), −0.81 (Titanic). We keep only positive neighbours (<code>pos</code>), so the prediction is Ben's mean plus his centred Inception rating: 2 + 0.61×2 / 0.61 = <strong>4.0</strong>. Much more sensible.</p>
  <table class="tbl out"><caption>Adjusted item-item similarity (selected)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th></tr>
    <tr><td>Inception</td><td>1.00</td><td>0.61</td><td>-0.93</td><td>-0.57</td></tr>
    <tr><td>Interstellar</td><td>0.61</td><td>1.00</td><td>-0.83</td><td>-0.81</td></tr>
    <tr><td>Notebook</td><td>-0.93</td><td>-0.83</td><td>1.00</td><td>0.65</td></tr>
  </table>
  <h3>User-user on the same table</h3>
  <p>Same idea, but compare rows (users) instead of columns (items):</p>
  <div class="fx" data-lang="py">U_raw = np.array([[cos(R[u], R[v]) for v in range(4)] for u in range(4)])
U = np.array([[cos(C[u], C[v]) for v in range(4)] for u in range(4)])
print("raw:     Asha-Ben", U_raw[0, 1].round(2), " Chen-Dia", U_raw[2, 3].round(2),
      " Asha-Chen", U_raw[0, 2].round(2))
print("centred: Asha-Ben", U[0, 1].round(2), " Chen-Dia", U[2, 3].round(2),
      " Asha-Chen", U[0, 2].round(2))
others = [0, 2, 3]                                   # users who rated Interstellar
sims = U[1, others]
keep = sims &gt; 0
pred_uu = mu[1] + sims[keep] @ C[others, 1][keep] / np.abs(sims[keep]).sum()
print("user-user prediction for Ben:", round(pred_uu, 2))</div>
  <div class="fx" data-lang="text">raw:     Asha-Ben 0.73  Chen-Dia 0.87  Asha-Chen 0.31
centred: Asha-Ben 0.77  Chen-Dia 0.7  Asha-Chen -0.86
user-user prediction for Ben: 3.0</div>
  <p>Raw cosine already finds the two taste groups (Asha–Ben 0.73, Chen–Dia 0.87), but it still calls Asha and Chen 0.31 similar, though they disagree on everything. Centred, Asha–Chen becomes −0.86: opposite tastes. For the prediction, the users who rated Interstellar are Asha, Chen and Dia; only Asha is positively similar to Ben. Asha rated it 4 against her mean of 3, so +1. Prediction = Ben's mean 2 + 1 = <strong>3.0</strong>. User-user says 3.0, item-item says 4.0: different neighbours, different evidence. With 4 users this is noisy either way; at scale item-item is usually more stable.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Collaborative filtering</strong>: predicting a user's interest from the interactions of many users, without item features. <strong>Neighbourhood CF prediction</strong>: r̂<sub>u,i</sub> = μ<sub>u</sub> + Σ sim · (r − μ<sub>u</sub>) / Σ |sim|, over the top-k most similar neighbours.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>On sparse data, two users who share just one rated item can get similarity 1.0 from a single coincidence. Require a minimum overlap (say 5 common items), or shrink similarities toward 0 when overlap is small.</p>
  </div>

  <h2 id="rs-mf"><span class="num">04</span>Matrix Factorization</h2>
  <p>Neighbourhood CF breaks when the table is very sparse: if Ben and Asha share no rated films, their similarity can't even be computed. With millions of users and items, most pairs share nothing. We need a way to share information across <em>all</em> users and items at once.</p>
  <p>The idea: describe every film by a few hidden numbers, and every user by a few hidden numbers, so that multiplying a user's numbers with a film's numbers gives the rating. Then any user can be compared with any film, even with no overlap.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Describe every film by a few sliders ("how sci-fi", "how romantic") and every user by how much they enjoy each slider. Nobody names the sliders; training discovers them from the ratings alone.</p>
  </div>
  <div class="callout pred"><span class="label">Worked example</span>
    <p>Ben = [sci-fi 0.9, romance 0.1]. Interstellar = [sci-fi 5, romance 1]. Predicted rating = 0.9×5 + 0.1×1 = 4.6. The Notebook = [0.5, 5] → 0.9×0.5 + 0.1×5 = 0.95. A sci-fi user and a sci-fi film give a big dot product; a mismatch gives a small one.</p>
  </div>
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
</svg><figcaption>Squeeze the sparse table into two thin, full ones. Multiplying them back fills in the blanks.</figcaption></figure>
  <p>Training means finding P (one row per user) and Q (one row per item) so that P[u]·Q[i] is close to every <em>known</em> rating. We measure "close" with squared error on known cells only, and add a penalty λ(‖P‖² + ‖Q‖²) that keeps the numbers small, so the model doesn't memorise. That penalty is called <strong>L2 regularisation</strong>. Two ways to minimise it:</p>
  <div class="cards">
    <div><b>ALS</b><p>Fix Q, and each user's best vector is a small ridge regression with an exact answer. Then fix P and solve each item. Repeat.</p><small>Runs in parallel; Spark MLlib, implicit-feedback ALS</small></div>
    <div><b>SGD</b><p>Go through known ratings one by one; nudge P[u] and Q[i] a little toward reducing that rating's error.</p><small>Funk SVD (Netflix Prize)</small></div>
  </div>
  <p>ALS (Alternating Least Squares) on our toy table with k = 2 factors and λ = 0.1. The code prints the training error after a few rounds:</p>
  <div class="fx" data-lang="py">M = R &gt; 0                          # observed mask
k, lam = 2, 0.1
rng = np.random.default_rng(0)
P = rng.normal(0, 0.5, (4, k))     # user factors, random start
Q = rng.normal(0, 0.5, (5, k))     # item factors, random start
I = np.eye(k)
for it in range(15):
    for u in range(4):             # fix Q -&gt; ridge solve for each user
        Qu = Q[M[u]]
        P[u] = np.linalg.solve(Qu.T @ Qu + lam*I, Qu.T @ R[u, M[u]])
    for i in range(5):             # fix P -&gt; ridge solve for each item
        Pi = P[M[:, i]]
        Q[i] = np.linalg.solve(Pi.T @ Pi + lam*I, Pi.T @ R[M[:, i], i])
    if it in (0, 1, 4, 14):
        print(f"iter {it+1:2d}  train RMSE {np.sqrt(np.mean((R - P @ Q.T)[M]**2)):.3f}")
print((P @ Q.T).round(1))
print("item factors:", Q.round(2).tolist())</div>
  <div class="fx" data-lang="text">iter  1  train RMSE 0.439
iter  2  train RMSE 0.284
iter  5  train RMSE 0.253
iter 15  train RMSE 0.251
[[5.  3.9 1.  1.5 2. ]
 [3.9 3.1 0.8 1.2 1.6]
 [1.  1.  4.5 4.4 2.6]
 [2.4 2.  4.5 4.5 3. ]]
item factors: [[-0.15, -1.56], [-0.18, -1.22], [-1.5, 0.05], [-1.44, -0.12], [-0.81, -0.44]]</div>
  <p>Inside the loop, <code>Q[M[u]]</code> keeps only the items user u rated. <code>np.linalg.solve(Qu.T @ Qu + lam*I, Qu.T @ r)</code> is the ridge-regression formula: the best user vector given those item vectors. The item loop does the mirror. The error falls fast and settles near 0.25 within 5 rounds. <code>P @ Q.T</code> fills every blank: Ben → Interstellar 3.1, Chen → Toy Story 2.6. Look at the item factors: Inception [−0.15, −1.56] and Interstellar [−0.18, −1.22] are close, Notebook [−1.50, 0.05] and Titanic [−1.44, −0.12] are close. One axis became "romance", the other "sci-fi", without being told.</p>
  <h3>SGD with biases</h3>
  <p>Some users rate everything high, and some films everyone loves. Making the dot product explain that wastes factors. So production MF adds a global average μ, a user bias b<sub>u</sub> and an item bias b<sub>i</sub>: prediction = μ + b<sub>u</sub> + b<sub>i</sub> + P[u]·Q[i]. Here we train it with SGD (stochastic gradient descent): for each known rating, compute the error e, then move each parameter a small step (learning rate <code>lr</code>) in the direction that shrinks e.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
users, items_idx = np.nonzero(R)                   # the 14 known ratings
mu_all = R[R &gt; 0].mean()                           # global average
bu, bi = np.zeros(4), np.zeros(5)                  # user and item biases
P = rng.normal(0, 0.1, (4, 2)); Q = rng.normal(0, 0.1, (5, 2))
lr, lam = 0.05, 0.02
for epoch in range(300):
    for n in rng.permutation(len(users)):          # visit ratings in random order
        u, i = users[n], items_idx[n]
        e = R[u, i] - (mu_all + bu[u] + bi[i] + P[u] @ Q[i])   # error on this rating
        bu[u] += lr * (e - lam * bu[u])
        bi[i] += lr * (e - lam * bi[i])
        P[u], Q[i] = P[u] + lr * (e * Q[i] - lam * P[u]), Q[i] + lr * (e * P[u] - lam * Q[i])
full = mu_all + bu[:, None] + bi[None, :] + P @ Q.T
print("global mean", round(mu_all, 2), " train RMSE", round(np.sqrt(np.mean((R - full)[M] ** 2)), 3))
print("user bias", bu.round(2)); print("item bias", bi.round(2))
print("Ben -&gt; Interstellar", round(full[1, 1], 2), "  Chen -&gt; Toy Story", round(full[2, 4], 2))</div>
  <div class="fx" data-lang="text">global mean 2.87  train RMSE 0.025
user bias [ 0.02 -0.57 -0.09  0.34]
item bias [ 0.23 -0.3   0.01  0.19 -0.47]
Ben -&gt; Interstellar 3.14   Chen -&gt; Toy Story 2.74</div>
  <p>The biases are readable: Ben rates 0.57 below average (a strict rater), Dia 0.34 above; Toy Story is the least liked film. The update line for <code>P[u], Q[i]</code> updates both at once so each uses the other's <em>old</em> value. Now the warning: train RMSE 0.025 is not a triumph. The model has 4×2 + 5×2 + 9 = 27 numbers to fit 14 ratings, so it can memorise them. On real data you always check error on <em>held-out</em> ratings, and raise λ until that stops improving.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Matrix factorization</strong>: approximating the user × item matrix R by P·Qᵀ with k ≪ (users, items), trained on observed cells only. <strong>Latent factor</strong>: one of the k hidden dimensions. <strong>Two-tower model</strong>: a neural version where one network turns user features into the user vector and another turns item features into the item vector, so even new items get a vector.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating missing cells as 0 ratings in the loss (e.g. running plain SVD on the filled matrix). The model then learns that "most films are rated 0". Train on known cells only, or use implicit ALS with low confidence weights on zeros.</p>
  </div>

  <h2 id="rs-cold"><span class="num">05</span>Cold Start</h2>
  <p>CF and MF learn from history. A user who signed up a minute ago has an empty row. A film released today has an empty column. They get no vector, no neighbours, nothing. This is the <strong>cold-start problem</strong>, and every real system must handle it, because new users are exactly the ones you are trying to keep.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new student joins mid-year. The teacher knows nothing yet, so she starts with what works for most students, asks a few questions on day one, and adjusts after the first test.</p>
  </div>
  <table class="tbl">
    <tr><th>Case</th><th>Strategies</th></tr>
    <tr><td><strong>New user</strong></td><td>Popular / trending items; onboarding quiz ("pick 3 genres"); context (city, language, device, where they came from); learn fast from first clicks</td></tr>
    <tr><td><strong>New item</strong></td><td>Content features → content-based or two-tower item vector; give it exploration slots; borrow vectors from similar items</td></tr>
    <tr><td><strong>New system</strong></td><td>Start with rules and popularity, log impressions from day one, add CF when data arrives</td></tr>
  </table>
  <p><strong>Worked example.</strong> A <strong>hybrid</strong> recommender picks a strategy per user: if the user has history, use item-item neighbours of what they watched; else if they answered the onboarding quiz, use those picks; else fall back to "popular this week". In every case it removes already-watched items and tops up from the popular list if there are not enough.</p>
  <div class="fx" data-lang="py">history = {"asha": ["Dangal", "Lagaan"], "ben": ["3 Idiots"]}     # warm users
popular = ["3 Idiots", "Dangal", "PK", "Lagaan", "DDLJ"]          # most watched this week
similar = {"Dangal": ["Chak De", "Lagaan"], "Lagaan": ["Chak De", "Swades"],
           "3 Idiots": ["PK", "Munna Bhai"]}                       # item-item CF neighbours

def recommend(user, k=3, quiz=None):
    seen = set(history.get(user, []))
    if seen:                                    # warm user: neighbours of what they watched
        cands, source = [s for it in history[user] for s in similar.get(it, [])], "item-item CF"
    elif quiz:                                  # new user who answered the onboarding quiz
        cands, source = quiz, "onboarding quiz"
    else:                                       # brand-new user: popularity fallback
        cands, source = popular, "popular"
    out = []
    for c in cands + popular:                   # popular list tops up short lists
        if c not in seen and c not in out:
            out.append(c)
    return source, out[:k]

for u, quiz in [("asha", None), ("ben", None), ("new1", None), ("new2", ["Chak De", "Dangal"])]:
    print(u, *recommend(u, quiz=quiz))</div>
  <div class="fx" data-lang="text">asha item-item CF ['Chak De', 'Swades', '3 Idiots']
ben item-item CF ['PK', 'Munna Bhai', 'Dangal']
new1 popular ['3 Idiots', 'Dangal', 'PK']
new2 onboarding quiz ['Chak De', 'Dangal', '3 Idiots']</div>
  <p>Trace Asha: she watched Dangal and Lagaan, so the candidates are Chak De, Lagaan, Chak De, Swades. Lagaan is seen, the second Chak De is a duplicate, so we get Chak De and Swades, then the popular list tops up with 3 Idiots (Dangal is seen). <code>new1</code> has nothing, so gets the popular list. <code>new2</code> gets the quiz picks plus a top-up. The <code>seen</code> set check is what stops us recommending what they just watched.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cold start</strong>: a user, item or whole system with too little interaction history for collaborative methods. <strong>Hybrid recommender</strong>: one that combines several methods (CF, content, popularity), by switching between them or blending their scores.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Showing new items only through CF means they never get shown, so never get clicks, so never get a CF vector. New items need a content-based path or reserved exploration slots from day one.</p>
  </div>

  <h2 id="rs-stage"><span class="num">06</span>Two-Stage Ranking Systems</h2>
  <p>YouTube has hundreds of millions of videos and must reply in about 100 milliseconds. A good ranking model with hundreds of features might take 0.1 ms per item. 100 million items × 0.1 ms = 10,000 seconds. Impossible. So the work is split: a cheap stage narrows millions to about a thousand, and a costly stage orders that short list carefully.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring: HR skims 10,000 CVs in seconds each, interviews 50, and a final panel picks 5. Each round sees fewer people but spends more time on each. The skim must not throw away good people (recall); the panel must pick the best order (precision).</p>
  </div>
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
</svg><figcaption>Each stage sees fewer items but spends more compute on each. Total budget: ~100 ms.</figcaption></figure>
  <table class="tbl">
    <tr><th>Stage</th><th>Goal</th><th>Typical tools</th></tr>
    <tr><td>Retrieval / candidate generation</td><td>Don't miss good items (recall)</td><td>Two-tower embeddings + approximate nearest-neighbour search (FAISS), item-item CF, "trending", "continue watching"</td></tr>
    <tr><td>Ranking</td><td>Order candidates precisely</td><td>LightGBM or deep model with user, item, context and cross features; predicts P(click), watch time</td></tr>
    <tr><td>Re-ranking</td><td>Business rules</td><td>Diversity, freshness, dedupe, remove already-bought, sponsored slots, fairness</td></tr>
  </table>
  <p>A toy version of all three stages with 100,000 items. Retrieval scores each item with one dot product between a user vector and an item vector (as a two-tower model would give) and keeps the best 1,000. Ranking adds a freshness bonus, standing in for a heavy model. Re-ranking allows at most 2 items per genre in the final 10.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(7)
n_items, dim = 100_000, 16
item_vec = rng.normal(size=(n_items, dim)).astype(np.float32)   # from a two-tower model
genre    = rng.integers(0, 5, n_items)                          # 5 genres
age_days = rng.integers(0, 365, n_items)                        # how old each item is
user_vec = rng.normal(size=dim).astype(np.float32)

sim = item_vec @ user_vec                           # stage 1: one dot product per item
cand = np.argpartition(-sim, 1000)[:1000]           # best 1,000, unordered, O(n)
print("retrieved", len(cand), "of", n_items)

score = sim[cand] + 2.0 * np.exp(-age_days[cand] / 30)   # stage 2: richer score, 1,000 only
ranked = cand[np.argsort(-score)][:50]

final, per_genre = [], {}                           # stage 3: max 2 per genre
for it in ranked:
    g = genre[it]
    if per_genre.get(g, 0) &lt; 2:
        final.append(it); per_genre[g] = per_genre.get(g, 0) + 1
    if len(final) == 10: break
print("top-10 genres before re-rank:", genre[ranked[:10]].tolist())
print("top-10 genres after  re-rank:", genre[final].tolist())</div>
  <div class="fx" data-lang="text">retrieved 1000 of 100000
top-10 genres before re-rank: [1, 4, 3, 4, 2, 4, 3, 0, 1, 1]
top-10 genres after  re-rank: [1, 4, 3, 4, 2, 3, 0, 1, 2, 0]</div>
  <p><code>np.argpartition(-sim, 1000)[:1000]</code> finds the 1,000 highest scores without sorting all 100,000, which is faster than a full sort. In production this step uses an <strong>ANN</strong> (approximate nearest neighbour) index like FAISS, which finds the top vectors among billions in milliseconds by searching only promising regions. The ranking score <code>2.0 * np.exp(-age_days / 30)</code> gives new items a bonus that halves roughly every 3 weeks. Before re-ranking, genres 4 and 1 each take three of the top 10; after, each genre has at most 2, so the user sees more variety.</p>
  <h3>Learning to rank</h3>
  <p>How is the ranking model trained? <strong>Learning to rank (LTR)</strong> has three styles. Example: for one user, A was clicked and B was shown but skipped.</p>
  <div class="cards">
    <div><b>Pointwise</b><p>Predict a score per item on its own: A → 1, B → 0 (logloss on click).</p><small>Simplest; most common</small></div>
    <div><b>Pairwise</b><p>Learn only "A should be above B". Loss is low when score(A) − score(B) is large.</p><small>RankNet, BPR</small></div>
    <div><b>Listwise</b><p>Optimise the whole list's quality, e.g. NDCG, directly.</p><small>LambdaMART (LightGBM's LGBMRanker)</small></div>
  </div>
  <p>Pairwise suits implicit data well: we don't know if B is "bad", only that A was preferred over it in that moment. BPR (Bayesian Personalised Ranking) uses exactly this: loss = −log σ(score(A) − score(B)), where σ is the sigmoid.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Candidate generation (retrieval)</strong>: a fast stage that selects a few hundred to a few thousand items likely to be relevant. <strong>Ranking</strong>: a slower, feature-rich model that orders those candidates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A great ranker cannot fix a bad retriever: if the best item is not among the 1,000 candidates, it is gone. Measure retrieval by recall@1000 separately from the ranker.</p>
  </div>

  <h2 id="rs-eval"><span class="num">07</span>Evaluation</h2>
  <p>Rating-prediction error (RMSE) was the Netflix Prize metric, but users never see predicted ratings. They see a short ordered list and mostly look at the top few. So we evaluate the list: hide each user's <em>later</em> interactions (a time split), make a top-k list from the earlier data, and check how many hidden items it found and how high they were placed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Google search where the right answer is on page 2 is nearly as bad as not finding it. A recommender that puts your favourite film in slot 9 of a row only 4 slots wide has the same problem. Position matters.</p>
  </div>
  <p><strong>Worked example.</strong> We recommended [A, B, C, D, E]; the user later engaged with {A, C, F}. Hits at rank 1 (A) and rank 3 (C).</p>
  <table class="tbl out"><caption>Step by step for u1, k = 5</caption>
    <tr><th>rank</th><th>item</th><th>hit?</th><th>precision so far</th><th>discount 1/log₂(rank+1)</th></tr>
    <tr><td>1</td><td>A</td><td>yes</td><td>1/1 = 1.00</td><td>1.000</td></tr>
    <tr><td>2</td><td>B</td><td>no</td><td>–</td><td>0.631</td></tr>
    <tr><td>3</td><td>C</td><td>yes</td><td>2/3 = 0.67</td><td>0.500</td></tr>
    <tr><td>4</td><td>D</td><td>no</td><td>–</td><td>0.431</td></tr>
    <tr><td>5</td><td>E</td><td>no</td><td>–</td><td>0.387</td></tr>
  </table>
  <ul>
    <li><strong>Precision@5</strong> = hits / k = 2/5 = 0.40. <strong>Recall@5</strong> = hits / relevant = 2/3 = 0.67 (F was never recommended).</li>
    <li><strong>AP@5</strong> (average precision) = mean of "precision so far" at each hit, divided by min(|relevant|, k): (1.00 + 0.67) / 3 = 0.556.</li>
    <li><strong>NDCG@5</strong>: DCG = sum of discounts at hits = 1 + 0.5 = 1.5. The ideal list puts all 3 relevant items at ranks 1–3: 1 + 0.631 + 0.5 = 2.131. NDCG = 1.5 / 2.131 = 0.704.</li>
  </ul>
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
  <p>u1 matches the hand calculation. u2 has perfect recall (its one relevant item G was found) but G sits at rank 4, so AP = 1/4 = 0.25 and NDCG = 0.431: order-aware metrics punish late hits. <strong>MAP</strong> is the mean AP over users. <code>set(rec[:k]) &amp; rel</code> counts hits as a set intersection. <strong>Coverage</strong>: 8 of 10 catalog items appeared in someone's list. <strong>Diversity</strong> (<code>ild</code>, intra-list diversity) is the share of item pairs within one list that have different genres: u1's list is mostly sci-fi (0.4), u2's is mixed (0.8).</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Question it answers</th><th>Order-aware?</th></tr>
    <tr><td><strong>Precision@k</strong></td><td>What fraction of my k recs were relevant?</td><td>No</td></tr>
    <tr><td><strong>Recall@k</strong></td><td>What fraction of the relevant items did I find?</td><td>No</td></tr>
    <tr><td><strong>AP@k / MAP</strong></td><td>Average precision at each hit; MAP = mean over users</td><td>Yes</td></tr>
    <tr><td><strong>NDCG@k</strong></td><td>Hits discounted by 1/log₂(rank+1), divided by the ideal</td><td>Yes; supports graded relevance</td></tr>
    <tr><td><strong>Coverage</strong></td><td>Share of catalog ever recommended</td><td>Beyond-accuracy</td></tr>
    <tr><td><strong>Diversity</strong></td><td>How different are items within one list?</td><td>Beyond-accuracy</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>NDCG@k</strong> (normalised discounted cumulative gain) = DCG@k / ideal DCG@k, where DCG@k = Σ rel<sub>i</sub> / log₂(i + 1) over the top k positions. 1.0 means the best possible order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: offline ≠ online</span>
    <p>Logged data only contains what the old system showed, so a new model that recommends different items can't be fairly judged on it. Offline wins often vanish live. The final judge is an A/B test on the business metric (watch time, orders, retention).</p>
  </div>

  <h2 id="rs-bias"><span class="num">08</span>Popularity Bias &amp; Feedback Loops</h2>
  <p>A recommender learns from clicks. But users can only click what they were shown, and what they were shown was chosen by the previous model. So the model is grading its own homework. Items it showed get clicks and look good; items it never showed get no clicks and look bad, even if they are great. Over time the same few items take over.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bookshop that only puts last month's bestsellers at the front. Other books never get picked up, so they never become bestsellers, so they never reach the front. A new author with a brilliant book stays on the back shelf forever.</p>
  </div>
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
</svg><figcaption>The model learns from data its own past choices created. Popular items get shown more, so more clicks, so shown even more.</figcaption></figure>
  <p><strong>Simulation.</strong> 50 items, each with a hidden true click probability between 5% and 30%. Each round we show 5 items and record clicks. Strategy 1 always shows the 5 items with the most clicks so far. Strategy 2 ranks by smoothed click <em>rate</em> (clicks per show) and spends 10% of rounds showing random items. After 3,000 rounds: how many items were ever shown, and how many of the truly best 5 does each strategy rank in its top 5?</p>
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
  <p><code>eps</code> is the exploration share: with probability ε a round shows random items (<em>explore</em>), otherwise the current best (<em>exploit</em>). The tiny random number added in the exploit line just breaks ties. The popularity strategy locked onto whatever got lucky early: it showed only 16 items ever and found none of the true best 5. The CTR strategy, with <code>(c + 1) / (s + 5)</code> so items with few shows are not judged on one lucky click, saw all 50 items and found 3 of the best 5.</p>
  <ul>
    <li><strong>Exploration</strong>: ε-greedy slots, Thompson sampling / multi-armed bandits.</li>
    <li><strong>Adjust for exposure</strong>: rank by click rate, not raw count; inverse propensity scoring (IPS), which up-weights clicks on items that were rarely shown.</li>
    <li><strong>Position bias</strong>: top slots get clicks for being on top; model position as a feature in training and set it to a fixed value at serving time.</li>
    <li><strong>Re-rank for diversity / long tail</strong>; track coverage and novelty on dashboards.</li>
    <li><strong>Log impressions</strong>, not just clicks, so you know what was seen and ignored.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feedback loop</strong>: the model's own outputs shape its future training data. <strong>Popularity bias</strong>: popular items are recommended more than their real appeal justifies, and the long tail (the many less-known items) is ignored.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling exploration "wasted traffic". Without it the model can never learn about anything it is not already showing, and quality slowly decays. Budget a small share (5–10%) and measure its long-run value.</p>
  </div>

  <h2 id="rs-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: every 0 is a dislike</span>
    <p>Most unclicked items were never seen. Use shown-but-skipped as negatives, or low-confidence weights on zeros.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: random train/test split</span>
    <p>Hiding random interactions lets the model train on a user's future to predict their past. Split by time: train on everything before a date, test on what happened after.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: raw cosine on ratings</span>
    <p>All-positive ratings make every similarity positive (our toy: 2.22 instead of 4.0). Mean-centre per user first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tiny overlaps</span>
    <p>Two users sharing one item can get similarity 1.0. Require minimum overlap or shrink.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging MF by training error</span>
    <p>Our SGD model hit train RMSE 0.025 with 27 parameters for 14 ratings: memorised. Always report held-out error.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: recommending what they already have</span>
    <p>Filter seen or bought items (and items out of stock) before showing the list.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: accuracy only</span>
    <p>A list of 10 near-identical items can score well and still bore users. Track coverage and diversity next to NDCG.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting offline wins</span>
    <p>Logged data reflects the old model's choices and position bias. Ship only after an A/B test on the business metric.</p>
  </div>

  <h2 id="rs-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explicit vs implicit feedback: differences, and which is more common?</summary><div class="qa-body">Explicit = ratings and likes: rare but with clear negatives. Implicit = clicks, views, purchases: plentiful but with no true negatives (no click may mean never seen). Implicit is far more common in industry; weight events by strength (purchase &gt; view) and take negatives from impressions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Content-based vs collaborative filtering: when does each win?</summary><div class="qa-body">Content-based wins for new items with good features and when you need explanations. CF wins when there is lots of interaction history: it finds hidden links ("people who buy X also buy Y") without any features. Most systems mix both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is item-item CF usually preferred over user-user at scale?</summary><div class="qa-body">Usually there are fewer items than users. Item similarities change slowly, so they can be computed offline. Each item has many ratings, so its similarities are more reliable. User tastes change, and each user has rated few items.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why mean-centre ratings before computing cosine similarity?</summary><div class="qa-body">Raw ratings are all positive, so every cosine is positive and disliked items still pull the prediction. Subtracting each user's mean turns ratings into "above/below my usual", so opposite tastes get negative similarity. In the toy example the prediction went from 2.22 to 4.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain matrix factorization in two sentences, and what ALS does.</summary><div class="qa-body">Write the sparse user×item table as user-factors × item-factors, so each rating ≈ dot product of two short vectors; train on known cells with L2. ALS takes turns: fix item vectors and solve each user exactly as ridge regression, then fix users and solve items, and repeat until it settles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why add user and item biases to matrix factorization?</summary><div class="qa-body">Some users rate everything high or low, and some items are liked by everyone. Biases capture those effects with one number each, so the latent factors are free to model actual taste. In our toy, Ben's bias was −0.57 (strict rater).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a brand-new item with no interactions?</summary><div class="qa-body">Use its content (text, image, category) to get a vector from a content model or a two-tower item tower, place it near similar items, and give it guaranteed exploration slots so it collects data fast. Then let CF take over.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do large recommenders use a retrieval stage and a ranking stage?</summary><div class="qa-body">Scoring millions of items with a heavy model per request is too slow. Retrieval cheaply narrows to a few hundred with high recall (embeddings + ANN, CF, simple rules). The ranking model then spends rich features and compute on just those, for precision within the time budget.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pointwise, pairwise, listwise learning to rank: what is the difference?</summary><div class="qa-body">Pointwise predicts each item's score alone (e.g. click logloss). Pairwise learns which of two items should rank higher (RankNet, BPR). Listwise optimises a whole-list metric like NDCG (LambdaMART). Pairwise and listwise match the real goal (order) more closely; pointwise is simplest and most common.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs = [A,B,C,D,E], relevant = {A,C,F}. Compute P@5, R@5, AP@5 and NDCG@5.</summary><div class="qa-body">Hits: A (rank 1), C (rank 3). P@5 = 2/5 = 0.40. R@5 = 2/3 = 0.67. AP@5 = (1/1 + 2/3) / 3 = 0.556. NDCG@5 = (1 + 0.5) / (1 + 0.631 + 0.5) = 0.704.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your new model wins offline on NDCG but loses the A/B test. Possible reasons?</summary><div class="qa-body">Offline data only reflects what the old system showed; the stand-in (click) doesn't match the business metric (retention, revenue); position bias in logs (top items get clicked just for being on top); less variety makes users bored; leakage in the offline split (random instead of by time).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a feedback loop in recommenders and how do you mitigate it?</summary><div class="qa-body">The model trains on clicks its own recommendations caused, so shown items gain clicks and unshown items are never learned: popularity snowballs. Fix with exploration (ε-greedy, bandits), click rates instead of counts or inverse propensity weighting, diversity re-ranking, and logging impressions.</div></details>
</main>`
});
