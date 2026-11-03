// notes/ml/ml_recsys.js — Recommendation Systems: Basics & Content-Based
Object.assign(TOPIC_CONTENT, {
  "ml_recsys": `<main>
<h1>Recommendation Systems: Basics &amp; Content-Based</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Basics &amp; Content-Based</span></div>
  <p class="lead">A recommender system chooses the few items worth showing one particular person out of a catalogue far too large for anyone to browse: the ten films on a streaming app's home screen, the "you may also like" row in a shop, the next song in a playlist. It matters because the screen is tiny and the catalogue is huge, so what gets shown largely decides what gets watched, bought or ignored. This note builds the foundations: what a recommender must output, the kinds of data it learns from, the simplest baseline every model must beat (popularity), and the first personalised method, content-based filtering, which describes items by their features and recommends items that resemble what a person already liked. One small running example carries the whole note, and the next three notes too: a streaming app called CineCity, where five friends have rated some of six films and we want to know which of the three films he has not seen to show Ben first.</p>

  <h2 id="rs-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recommenders: Basics &amp; Content-Based</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The problem and the data</div>
        <ul>
          <li>Score every (user, item) pair; show the top N unseen items</li>
          <li><b>Explicit</b> feedback (ratings): rare, has dislikes; <b>implicit</b> (plays, clicks): plentiful, positive only</li>
          <li>Users × items <b>interaction matrix</b>: almost empty (real data &lt; 1% filled), long-tailed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Popularity baseline</div>
        <ul>
          <li>Same list for everyone, minus what they have seen</li>
          <li><b>Damped mean</b> (Σr + m·μ)/(n + m): one lucky 5 cannot top the chart</li>
          <li>Hard to beat; the fallback for brand-new users</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Content-based filtering</div>
        <ul>
          <li><b>Item profile</b>: feature vector (tags, TF-IDF, embeddings)</li>
          <li><b>User profile</b>: average of rated items, weights = rating − user mean</li>
          <li>Score = <b>cosine</b>(user profile, item profile)</li>
          <li>Or KNN on the user's own ratings, or one ridge model per user</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Strengths and limits</div>
        <ul>
          <li>✔ New items, lone users, explainable</li>
          <li>✘ Never surprises (filter bubble), no profile for new users, only as good as features</li>
          <li>Hybrids combine popularity, content and collaborative signals</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rs-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Recommendation Problem</span><span class="rm-sub">what a recommender outputs, and CineCity</span></div></div>
      <div class="rm-item rm-done" data-target="rs-feedback"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Explicit and Implicit Feedback</span><span class="rm-sub">ratings versus plays and clicks</span></div></div>
      <div class="rm-item rm-done" data-target="rs-matrix"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Interaction Matrix and Sparsity</span><span class="rm-sub">an almost empty table, stored sparsely</span></div></div>
      <div class="rm-item rm-done" data-target="rs-pop"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Popularity Baseline</span><span class="rm-sub">counts, means and the damped mean</span></div></div>
      <div class="rm-item rm-done" data-target="rs-items"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Item Profiles and TF-IDF</span><span class="rm-sub">turning a film into a vector</span></div></div>
      <div class="rm-item rm-done" data-target="rs-profile"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">User Profiles</span><span class="rm-sub">turning a person into the same kind of vector</span></div></div>
      <div class="rm-item rm-done" data-target="rs-cosine"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scoring with Cosine Similarity</span><span class="rm-sub">how close each film is to Ben's taste</span></div></div>
      <div class="rm-item rm-done" data-target="rs-check"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Does It Beat Popularity?</span><span class="rm-sub">a hold-out test at realistic scale</span></div></div>
      <div class="rm-item rm-done" data-target="rs-limits"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Strengths, Weaknesses and Hybrids</span><span class="rm-sub">what content can and cannot do</span></div></div>
      <div class="rm-item rm-done" data-target="rs-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">zeros, raw means, un-centred profiles</span></div></div>
      <div class="rm-item rm-done" data-target="rs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, comparison table</span></div></div>
      <div class="rm-item rm-done" data-target="rs-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on recommenders</span></div></div>
    </div>
  </div>

  <h2 id="rs-problem"><span class="num">01</span>The Recommendation Problem</h2>
  <p>The earlier notes in this track predicted one label for one row: will this customer churn, what will this flat sell for. A streaming app has a different job. It has thousands of films, millions of users, and room for about ten films on a phone screen. Without help, everyone would see the same "top 10" and most good films would never be found. A <strong>recommender system</strong> is a model that guesses which few items each person is most likely to enjoy and fills the limited slots with them.</p>
  <p>Think of a good bookshop owner who has known you for years. He remembers what you bought, he knows which books are alike, and he notices what readers with your taste enjoyed. He uses all three habits to put the right book in your hand. This group of notes turns those habits into algorithms. This note does "books like the ones you bought" (content-based filtering); the next note, <a class="xref" data-note="ml_cf">Collaborative Filtering</a>, does "readers like you".</p>
  <p>Here is the running example. CineCity is a small streaming app. Five friends, Asha, Ben, Chen, Dia and Esha, have rated some of six films on a scale of 1 to 5 stars: Dangal, Chak De! India ("Chak De"), Lagaan, Dilwale Dulhania Le Jayenge ("DDLJ"), Kabhi Khushi Kabhie Gham ("K3G") and 3 Idiots. A blank cell means the person has not rated that film. We store the table as a pandas DataFrame with <code>NaN</code> for the blanks:</p>
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
filled = int(R.notna().values.sum())
print(f"filled {filled} of {R.size} cells -&gt; density {filled / R.size:.3f}, sparsity {1 - filled / R.size:.3f}")
print("ratings per user:", R.notna().sum(axis=1).to_dict())</div>
  <div class="fx" data-lang="text">     Dangal Chak De Lagaan DDLJ  K3G 3 Idiots
Asha    5.0     4.0      .  1.0  1.0      4.0
Ben     5.0     5.0      .  2.0    .        .
Chen    2.0       .      .  5.0  5.0        .
Dia       .     1.0      .  4.0  5.0      2.0
Esha    5.0       .    5.0    .  3.0      5.0
filled 19 of 30 cells -&gt; density 0.633, sparsity 0.367
ratings per user: {'Asha': 5, 'Ben': 3, 'Chen': 3, 'Dia': 4, 'Esha': 4}</div>
  <p>Read the table the way a person would. Asha and Ben love the two sports films (Dangal and Chak De) and dislike DDLJ. Chen and Dia are the opposite: romance fans who rate Dangal or Chak De low. Esha rates almost everything high. Ben, who will be our main character, has rated only three films, so three cells in his row are blank: Lagaan, K3G and 3 Idiots. The last two printed lines count the filled cells: 19 of 30, so 63% of the table is known, and each user has rated between three and five films. The whole group of notes keeps asking one question: which of Ben's three blanks should CineCity show him first, and what would he rate them?</p>
  <p>There are two ways to state the task precisely. In <strong>rating prediction</strong>, the model outputs a number r̂<sub>ui</sub> (read "r-hat for user u and item i") for each blank cell, for example "Ben would rate Lagaan about 4.5"; this is a regression problem, and it is judged by how close the predicted ratings are to real ones. In <strong>top-N recommendation</strong>, the model outputs an ordered list of the N unseen items most worth showing; this is a ranking problem, and it is judged by whether the items the person later chose appear near the top of the list. The two are linked, because sorting a user's predicted ratings gives a list, but they are not the same: getting a 2-star film's predicted rating exactly right does nothing for the list, since that film would never be shown anyway.</p>
  <table class="tbl">
    <tr><th></th><th>Rating prediction</th><th>Top-N recommendation</th></tr>
    <tr><td>Output</td><td>a number r̂<sub>ui</sub> for a blank cell</td><td>an ordered list of N unseen items for user u</td></tr>
    <tr><td>Kind of problem</td><td>regression</td><td>ranking</td></tr>
    <tr><td>Measured by</td><td>RMSE, MAE on hidden ratings</td><td>precision@k, recall@k, NDCG</td></tr>
    <tr><td>Typical data</td><td>explicit ratings</td><td>any feedback, usually plays and clicks</td></tr>
  </table>
  <p>So, in general, a recommender learns a scoring function s(u, i) for every user u and item i, removes the items the user has already consumed, and shows the top N by score. We start with predicted scores because they are easier to compute and check by hand; turning scores into well-ordered lists, and measuring those lists, is the subject of <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>. One warning belongs here at the start. The thing a recommender is trained on (ratings, clicks) is only a <strong>proxy</strong> for what the business wants (watch time, purchases, people staying subscribed), and the two can disagree: a model that maximises clicks can learn to show clickbait thumbnails that people abandon after a minute. The real goal is always checked with an <a class="xref" data-note="st_abtesting">A/B test</a>.</p>

  <h2 id="rs-feedback"><span class="num">02</span>Explicit and Implicit Feedback</h2>
  <p>To score a (user, film) pair we need evidence of what each person likes. Our 19 star ratings are one kind of evidence, but in a real app very few people bother to rate anything. What every app does record is behaviour: who pressed play, who watched to the end, who clicked, who bought. These two kinds of evidence behave so differently that they need different names.</p>
  <p><strong>Explicit feedback</strong> is a person's deliberate statement of preference: a star rating, a thumbs up or down, a review. It is rare, but it is clear, and it includes real dislikes: a 1-star rating means "I did not like this". <strong>Implicit feedback</strong> is behaviour from which preference is inferred: plays, completed views, watch time, clicks, add-to-cart, purchases, skips. It is plentiful, because every action is logged, but it has no clear negatives: a film with no record might be disliked, or might simply never have been seen. Its numbers (how many plays, how many minutes) measure <em>confidence</em> that the person likes the item, not how much they like it.</p>
  <p>Think of a shopkeeper who can see only what you pick up, never what you looked at and put back. Picking up the same packet twice is a strong hint that you like it. Never picking something up could mean you dislike it, or that it sat on a shelf you never walked past.</p>
  <p>Implicit feedback arrives as an <strong>event log</strong>, one row per action. CineCity logs two events, "play" (pressed play) and "finish" (watched to the end). Finishing says much more than pressing play, so we give play a weight of 1 and finish a weight of 3, and add up the weights for each (user, film) pair. By hand: Asha played Dangal and finished it, 1 + 3 = 4; she played 3 Idiots, finished it and played it again, 1 + 3 + 1 = 5; she played DDLJ and gave up, 1. The code does the same for this week's whole log:</p>
  <div class="fx" data-lang="py">log = pd.DataFrame([
    ("Asha", "Dangal", "play"), ("Asha", "Dangal", "finish"), ("Asha", "3 Idiots", "play"),
    ("Asha", "3 Idiots", "finish"), ("Asha", "3 Idiots", "play"), ("Asha", "DDLJ", "play"),
    ("Ben", "Dangal", "play"), ("Ben", "Dangal", "finish"), ("Ben", "Chak De", "play"),
    ("Ben", "Chak De", "finish"), ("Ben", "DDLJ", "play"),
    ("Chen", "DDLJ", "play"), ("Chen", "DDLJ", "finish"), ("Chen", "K3G", "play"), ("Chen", "K3G", "finish"),
    ("Dia", "K3G", "play"), ("Dia", "K3G", "finish"), ("Esha", "Lagaan", "play"), ("Esha", "Lagaan", "finish")],
    columns=["user", "film", "event"])
weight = {"play": 1, "finish": 3}                  # finishing a film says more than pressing play
log["w"] = log["event"].map(weight)
M = (log.pivot_table(index="user", columns="film", values="w", aggfunc="sum", fill_value=0)
        .reindex(index=users, columns=films, fill_value=0))
print(M)
print("non-zero cells:", int((M.values &gt; 0).sum()), "of", M.size)</div>
  <div class="fx" data-lang="text">film  Dangal  Chak De  Lagaan  DDLJ  K3G  3 Idiots
user                                              
Asha       4        0       0     1    0         5
Ben        4        4       0     1    0         0
Chen       0        0       0     4    4         0
Dia        0        0       0     0    4         0
Esha       0        0       4     0    0         0
non-zero cells: 10 of 30</div>
  <p><code>map(weight)</code> turns each event name into its weight, <code>pivot_table(..., aggfunc="sum")</code> puts users in rows and films in columns and adds repeated events in the same cell, and <code>reindex</code> keeps all six films even if nobody touched one. Asha's row shows the hand numbers: Dangal 4, DDLJ 1, 3 Idiots 5.</p>
  <p>Now compare this table with the ratings. Ben's DDLJ cell is 1 (he played it and abandoned it), and in the ratings he gave DDLJ a 2. The abandoned play was really a negative signal, yet in the implicit table it looks like a weak positive. Dia's Dangal cell is 0 because she never pressed play, so we know nothing about her opinion. The implicit table mixes "disliked", "never seen" and "not yet" into the same zero. There is a deeper problem too: people mostly watch, and rate, films they expect to like, so which cells are filled depends on the values that would be in them. Data like this is called <strong>missing not at random</strong> (MNAR), and it is why no model should treat an empty cell as a dislike. When an app also logs <strong>impressions</strong> (films that were shown but not clicked), those are much better negatives than empty cells.</p>
  <table class="tbl">
    <tr><th></th><th>Explicit feedback</th><th>Implicit feedback</th></tr>
    <tr><td>Examples</td><td>ratings, likes, thumbs, reviews</td><td>plays, finishes, watch time, clicks, purchases, skips</td></tr>
    <tr><td>Volume</td><td>rare</td><td>plentiful</td></tr>
    <tr><td>Negatives</td><td>clear (1 star = disliked)</td><td>missing (0 may mean "never saw it")</td></tr>
    <tr><td>Value means</td><td>how much they liked it</td><td>how confident we are they like it</td></tr>
    <tr><td>Typical model target</td><td>predict the rating</td><td>predict "will interact", or rank</td></tr>
  </table>

  <h2 id="rs-matrix"><span class="num">03</span>The Interaction Matrix and Sparsity</h2>
  <p>Both kinds of feedback end up in the same shape: a table with one row per user and one column per item. This is the <strong>interaction matrix</strong> (also called the utility matrix), written R, where the cell r<sub>ui</sub> holds the feedback of user u on item i, or is blank. Every method in this group of notes is a different way of filling in R's blanks.</p>
  <p>The share of cells that are filled is the matrix's <strong>density</strong>, and the share that are blank is its <strong>sparsity</strong>. CineCity has 5 + 3 + 3 + 4 + 4 = 19 ratings in 5 × 6 = 30 cells, so its density is 19/30 = 0.633 and its sparsity 0.367. That is wildly unrealistic. A real user touches a few hundred items out of millions, so real matrices are nearly empty: the classic MovieLens-100K teaching dataset is about 6% full, the Netflix Prize data about 1%, and shop click data often below 0.01%.</p>
  <p>Storing such a matrix as an ordinary table would waste almost all of the memory on blanks. Instead, libraries use a <strong>sparse matrix</strong> format that stores only the known values. The most common is <strong>compressed sparse row</strong> (CSR), which keeps three short arrays: <code>data</code> holds the known values row by row, <code>indices</code> holds the column number of each value, and <code>indptr</code> says where each row starts inside <code>data</code>. By hand for CineCity: Asha's five ratings occupy positions 0 to 4 (columns 0, 1, 3, 4, 5), Ben's three occupy positions 5 to 7 (columns 0, 1, 3), and so on, so <code>indptr</code> = [0, 5, 8, 11, 15, 19].</p>
  <div class="fx" data-lang="py">from scipy.sparse import csr_matrix
X = csr_matrix(R.fillna(0).values)                 # store only the 19 known ratings
print("data   :", X.data.astype(int).tolist())
print("indices:", X.indices.tolist())
print("indptr :", X.indptr.tolist())
start, end = X.indptr[1], X.indptr[2]                # Ben is row 1
print("Ben's row: positions", start, "to", end - 1, "-&gt;",
      {films[j]: int(v) for j, v in zip(X.indices[start:end], X.data[start:end])})</div>
  <div class="fx" data-lang="text">data   : [5, 4, 1, 1, 4, 5, 5, 2, 2, 5, 5, 1, 4, 5, 2, 5, 5, 3, 5]
indices: [0, 1, 3, 4, 5, 0, 1, 3, 0, 3, 4, 1, 3, 4, 5, 0, 2, 4, 5]
indptr : [0, 5, 8, 11, 15, 19]
Ben's row: positions 5 to 7 -&gt; {'Dangal': 5, 'Chak De': 5, 'DDLJ': 2}</div>
  <p>To read Ben's row, the code looks up <code>indptr[1]</code> = 5 and <code>indptr[2]</code> = 8, so his ratings are <code>data[5:8]</code> = 5, 5, 2, in columns 0, 1 and 3 (Dangal, Chak De, DDLJ). Nothing at all is stored for his blanks. Row look-ups and matrix–vector products only touch the stored values, which is why every recommender library works with sparse matrices.</p>
  <p>To see what a realistic matrix looks like, we simulate 20,000 users and 5,000 items. Real popularity is very uneven, and a good model for it is <strong>Zipf's law</strong>: the item ranked r-th by popularity is about 1/r as popular as the most popular one, so the second item gets half as much attention as the first, the tenth a tenth.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
n_users, n_items, n_events = 20_000, 5_000, 400_000
pop = 1 / np.arange(1, n_items + 1) ** 1.0          # Zipf: item r is 1/r as popular as item 1
pop /= pop.sum()
items = rng.choice(n_items, size=n_events, p=pop)
users_ = rng.integers(0, n_users, n_events)
pairs = np.unique(users_ * n_items + items)         # distinct (user, item) pairs
density = len(pairs) / (n_users * n_items)
counts = np.bincount(pairs % n_items, minlength=n_items)
top = np.sort(counts)[::-1]
print(f"{n_users:,} users x {n_items:,} items, {len(pairs):,} distinct interactions")
print(f"density {density:.5f}  ({density * 100:.2f}% of cells filled)")
print(f"dense float64 matrix would need {n_users * n_items * 8 / 1e9:.1f} GB; CSR needs about "
      f"{len(pairs) * 12 / 1e6:.1f} MB")
print(f"top 1% of items hold {top[:n_items // 100].sum() / top.sum():.1%} of interactions; "
      f"top 20% hold {top[:n_items // 5].sum() / top.sum():.1%}")
print(f"items with fewer than 5 users: {(counts &lt; 5).sum():,} ({(counts &lt; 5).mean():.0%})")</div>
  <div class="fx" data-lang="text">20,000 users x 5,000 items, 348,147 distinct interactions
density 0.00348  (0.35% of cells filled)
dense float64 matrix would need 0.8 GB; CSR needs about 4.2 MB
top 1% of items hold 42.3% of interactions; top 20% hold 79.9%
items with fewer than 5 users: 39 (1%)</div>
  <p>Only 0.35% of the cells are filled. A dense table of 8-byte numbers would need 0.8 GB, 99.65% of it blanks, while CSR needs about 4 MB. The activity is also very concentrated: the top 1% of items receive 42% of all interactions and the top 20% receive 80%. The rest of the catalogue is the <strong>long tail</strong>: thousands of items with only a few interactions each.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
<line x1="50" y1="160" x2="580" y2="160" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="160" stroke="currentColor"/>
<path d="M52,24 L60,70 L70,96 L85,115 L105,128 L135,138 L180,145 L250,150 L350,154 L460,156 L578,157" fill="none" class="sb" stroke-width="2.5"/>
<rect x="52" y="20" width="58" height="140" class="fb" opacity="0.25"/>
<text x="81" y="40" text-anchor="middle" font-size="10.5">head</text><text x="81" y="54" text-anchor="middle" class="tm" font-size="10">top 20% of items</text><text x="81" y="68" text-anchor="middle" class="tb" font-size="10">80% of activity</text>
<text x="360" y="120" text-anchor="middle" font-size="11">long tail: most items, few interactions each</text>
<text x="315" y="185" text-anchor="middle" class="tm" font-size="10.5">items sorted from most to least popular →</text>
<text x="20" y="95" text-anchor="middle" class="tm" font-size="10.5" transform="rotate(-90 20 95)">interactions</text>
</svg><figcaption>Zipf-shaped popularity: a short head with most of the activity, and a long tail where personalisation matters most.</figcaption></figure>
  <p>The figure sorts items from most to least popular. The shaded head on the left, a fifth of the items, carries four-fifths of the activity; the curve then flattens into a tail that stretches across most of the catalogue. A recommender that only knows the head shows everyone the same hits. The tail is where personal taste differs most and where good recommendations add the most value, and it is also where data is thinnest, which is the central difficulty of this whole field. One practical warning follows: never call <code>.toarray()</code> or <code>.fillna(0)</code> on a real interaction matrix. Ten million users by one million items as 8-byte numbers is 80 TB, and a filled-in 0 silently claims "this user rated it zero", which nobody ever did.</p>

  <h2 id="rs-pop"><span class="num">04</span>The Popularity Baseline</h2>
  <p>Before personalising anything, we need the simplest sensible way to fill a blank, so that every cleverer model has something to beat. The simplest recommender ignores who the user is: it gives every film one <strong>popularity score</strong>, ranks films by it, and hides from each user the films they have already seen. The question is which score. There are three natural candidates, and computing them by hand on CineCity shows why the obvious two fail.</p>
  <table class="tbl">
    <tr><th>Film</th><th>ratings n</th><th>sum</th><th>mean = sum/n</th><th>damped mean, m = 3: (sum + 3 × 3.632)/(n + 3)</th></tr>
    <tr><td>Dangal</td><td>4</td><td>5 + 5 + 2 + 5 = 17</td><td>4.250</td><td>(17 + 10.895)/7 = 3.985</td></tr>
    <tr><td>Chak De</td><td>3</td><td>4 + 5 + 1 = 10</td><td>3.333</td><td>(10 + 10.895)/6 = 3.482</td></tr>
    <tr><td>Lagaan</td><td>1</td><td>5</td><td>5.000</td><td>(5 + 10.895)/4 = 3.974</td></tr>
    <tr><td>DDLJ</td><td>4</td><td>1 + 2 + 5 + 4 = 12</td><td>3.000</td><td>(12 + 10.895)/7 = 3.271</td></tr>
    <tr><td>K3G</td><td>4</td><td>1 + 5 + 5 + 3 = 14</td><td>3.500</td><td>(14 + 10.895)/7 = 3.556</td></tr>
    <tr><td>3 Idiots</td><td>3</td><td>4 + 2 + 5 = 11</td><td>3.667</td><td>(11 + 10.895)/6 = 3.649</td></tr>
  </table>
  <p>Ranking by <em>count</em> (how many people rated a film) rewards films that are watched a lot, whether or not they are liked: DDLJ ties for first place with four ratings although its average is the lowest. Ranking by <em>mean rating</em> puts Lagaan first on the strength of a single 5 from Esha, who rates almost everything high. Neither is right. A film with one rating has an average that is mostly luck.</p>
  <p>The fix is the <strong>damped mean</strong>, also called the Bayesian average. Pretend every film starts with m extra "virtual" ratings, each equal to the global mean μ (the average of all ratings, here 69/19 = 3.632). Its formula is (Σr + m·μ)/(n + m), where Σr is the film's sum of ratings and n its number of ratings. A film with many ratings barely moves; a film with one rating is pulled most of the way back to the global mean. With m = 3, Lagaan drops from 5.000 to 3.974, just behind Dangal's 3.985. Think of a new restaurant with a single five-star review: a sensible diner treats it as "probably about average, maybe a bit better" until more reviews arrive. The code reproduces the table and tries two values of m:</p>
  <div class="fx" data-lang="py">mu = np.nanmean(R.values)
stats = pd.DataFrame({"n": R.notna().sum(axis=0), "sum": R.sum(axis=0), "mean": R.mean(axis=0)})
for m in [2, 3]:
    stats[f"damped m={m}"] = (stats["sum"] + m * mu) / (stats["n"] + m)
print(f"global mean = {np.nansum(R.values):.0f} / {R.notna().sum().sum()} = {mu:.3f}")
print(stats.round(3))
print("rank by count :", stats["n"].sort_values(ascending=False, kind="stable").index.tolist())
print("rank by mean  :", stats["mean"].sort_values(ascending=False, kind="stable").index.tolist())
print("rank by damped:", stats["damped m=3"].sort_values(ascending=False, kind="stable").index.tolist())</div>
  <div class="fx" data-lang="text">global mean = 69 / 19 = 3.632
          n   sum   mean  damped m=2  damped m=3
Dangal    4  17.0  4.250       4.044       3.985
Chak De   3  10.0  3.333       3.453       3.482
Lagaan    1   5.0  5.000       4.088       3.974
DDLJ      4  12.0  3.000       3.211       3.271
K3G       4  14.0  3.500       3.544       3.556
3 Idiots  3  11.0  3.667       3.653       3.649
rank by count : ['Dangal', 'DDLJ', 'K3G', 'Chak De', '3 Idiots', 'Lagaan']
rank by mean  : ['Lagaan', 'Dangal', '3 Idiots', 'K3G', 'Chak De', 'DDLJ']
rank by damped: ['Dangal', 'Lagaan', '3 Idiots', 'K3G', 'Chak De', 'DDLJ']</div>
  <p>Every column matches the hand table. The three ranking lines show the three scores disagreeing: count puts Dangal and DDLJ first, the plain mean puts Lagaan first, and the damped mean puts Dangal first and Lagaan second. With m = 2, Lagaan would still edge Dangal (4.088 against 4.044), so m is a knob that says how many ratings a film needs before we trust its own average. IMDb's Top 250 chart uses exactly this formula, with m in the tens of thousands.</p>
  <p>Why does this work? Rewrite the damped mean as a weighted average of the film's own mean x̄ and the global mean μ: (Σr + mμ)/(n + m) = (n/(n + m))·x̄ + (m/(n + m))·μ. For Lagaan, n/(n + m) = 1/4, so we trust its own average 25% and the global mean 75%; for Dangal, 4/7 = 57%. This idea is called <strong>shrinkage</strong>: an estimate based on little data is noisy, so we pull it towards a safer value, and pull less as evidence grows. It is the same idea as ridge regularisation in <a class="xref" data-note="ml_regularization">Regularization</a>, and we will meet it again in the next note as "significance weighting" of similarities.</p>
  <p>Now the recommender itself: for each user, take the films they have not rated and sort them by damped mean.</p>
  <div class="fx" data-lang="py">def top_n_popular(user, score, n=2):
    unseen = R.columns[R.loc[user].isna()]           # never recommend what they already rated
    return score[unseen].sort_values(ascending=False, kind="stable").head(n).round(3).to_dict()
for u in users:
    print(f"{u:5s} -&gt;", top_n_popular(u, stats["damped m=3"]))</div>
  <div class="fx" data-lang="text">Asha  -&gt; {'Lagaan': 3.974}
Ben   -&gt; {'Lagaan': 3.974, '3 Idiots': 3.649}
Chen  -&gt; {'Lagaan': 3.974, '3 Idiots': 3.649}
Dia   -&gt; {'Dangal': 3.985, 'Lagaan': 3.974}
Esha  -&gt; {'Chak De': 3.482, 'DDLJ': 3.271}</div>
  <p>Every user receives the same ranking (Dangal, Lagaan, 3 Idiots, K3G, Chak De, DDLJ) with their own films removed. Ben is offered Lagaan then 3 Idiots; so is Chen, although Chen is a romance fan who gave Dangal a 2. Asha has only one unseen film left. That is what <strong>non-personalised</strong> means. Think of the "bestsellers" table at the front of a bookshop: a good guess for a stranger, a poor guess for a regular whose taste you know.</p>
  <p>Do not dismiss popularity as "dumb". On accuracy metrics it is often embarrassingly hard to beat, especially for users with little history, and it is exactly what a brand-new user should see. Every model in this group will be reported next to it. A slightly richer version, the <strong>baseline predictor</strong> r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub>, adds a damped user offset b<sub>u</sub> (is this person a strict or a generous rater?) to a damped item offset b<sub>i</sub> (is this film generally liked?); it appears in the next two notes as the reference every model must beat.</p>

  <h2 id="rs-items"><span class="num">05</span>Item Profiles and TF-IDF</h2>
  <p>Popularity says nothing about Ben. Ben loved Dangal and Chak De, so to personalise we want "more films like those". That requires a way to say how alike two films are, and for that each film must become a list of numbers that can be compared. A film's feature vector is called its <strong>item profile</strong>.</p>
  <p>The simplest item profile is a 0/1 vector of genre tags. We use four tags in the order [sports, drama, romance, comedy], so Dangal, a sports drama, becomes [1, 1, 0, 0]. We also count how many films carry each tag; this count is called the tag's <strong>document frequency</strong> (df), a name borrowed from search engines, where the "documents" are web pages.</p>
  <div class="fx" data-lang="py">tags = ["sports", "drama", "romance", "comedy"]
F = pd.DataFrame([[1, 1, 0, 0],    # Dangal
                  [1, 1, 0, 0],    # Chak De
                  [1, 1, 1, 0],    # Lagaan
                  [0, 0, 1, 1],    # DDLJ
                  [0, 1, 1, 0],    # K3G
                  [0, 1, 0, 1]],   # 3 Idiots
                 index=films, columns=tags)
print(F)
print("document frequency:", F.sum(axis=0).to_dict())</div>
  <div class="fx" data-lang="text">          sports  drama  romance  comedy
Dangal         1      1        0       0
Chak De        1      1        0       0
Lagaan         1      1        1       0
DDLJ           0      0        1       1
K3G            0      1        1       0
3 Idiots       0      1        0       1
document frequency: {'sports': 3, 'drama': 5, 'romance': 3, 'comedy': 2}</div>
  <p>Dangal and Chak De have identical vectors [1, 1, 0, 0]. The document frequencies are sports 3, drama 5, romance 3, comedy 2. "Drama" is on five of the six films, so two films sharing it tells us almost nothing; two films sharing "comedy", which only two films have, tells us much more. Plain 0/1 vectors treat both tags as equally informative, which is wrong.</p>
  <p>The standard fix is <strong>TF-IDF</strong> weighting, from <a class="xref" data-note="nlp">NLP Foundations</a>. Each tag's weight in a film is its <em>term frequency</em> (tf, here simply 1 if the film has the tag) multiplied by its <em>inverse document frequency</em> (idf), which is large for rare tags and small for common ones. The textbook idf is log(N/df), where N is the number of films: with N = 6, drama gets ln(6/5) = 0.182 and comedy ln(6/2) = 1.099. scikit-learn uses a smoothed version that never reaches zero, idf(t) = ln((1 + N)/(1 + df(t))) + 1, which gives sports and romance ln(7/4) + 1 = 1.5596, drama ln(7/6) + 1 = 1.1542 and comedy ln(7/3) + 1 = 1.8473. Dangal becomes [1.5596, 1.1542, 0, 0].</p>
  <p>Finally each vector is <strong>L2-normalised</strong>, divided by its length, so that a film with many tags does not dominate simply by having more numbers. Dangal's length is √(1.5596² + 1.1542²) = √3.7646 = 1.9403, so Dangal = [0.804, 0.595, 0, 0]. Lagaan [1.5596, 1.1542, 1.5596, 0] has length √6.1968 = 2.4893 and becomes [0.627, 0.464, 0.627, 0]. The code computes both idf versions, builds the normalised table, and checks it against scikit-learn's <code>TfidfTransformer</code>:</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import TfidfTransformer
N = len(F)
df = F.sum(axis=0)
idf_plain = np.log(N / df)
idf_sk = np.log((1 + N) / (1 + df)) + 1              # sklearn's smoothed idf
print("idf  log(N/df)          :", idf_plain.round(3).to_dict())
print("idf  ln((1+N)/(1+df))+1 :", idf_sk.round(4).to_dict())
W = F * idf_sk                                       # tf (0/1) x idf
W = W.div(np.sqrt((W ** 2).sum(axis=1)), axis=0)          # L2-normalise each film
print(W.round(3))
sk = TfidfTransformer().fit_transform(F.values).toarray()
print("matches sklearn TfidfTransformer:", np.allclose(sk, W.values))</div>
  <div class="fx" data-lang="text">idf  log(N/df)          : {'sports': 0.693, 'drama': 0.182, 'romance': 0.693, 'comedy': 1.099}
idf  ln((1+N)/(1+df))+1 : {'sports': 1.5596, 'drama': 1.1542, 'romance': 1.5596, 'comedy': 1.8473}
          sports  drama  romance  comedy
Dangal     0.804  0.595    0.000   0.000
Chak De    0.804  0.595    0.000   0.000
Lagaan     0.627  0.464    0.627   0.000
DDLJ       0.000  0.000    0.645   0.764
K3G        0.000  0.595    0.804   0.000
3 Idiots   0.000  0.530    0.000   0.848
matches sklearn TfidfTransformer: True</div>
  <p>Every row matches the hand values and scikit-learn's result exactly. In every film that has both a common and a rarer tag, the common one now weighs less: 3 Idiots has drama 0.530 and comedy 0.848, and K3G has drama 0.595 and romance 0.804.</p>
  <p>Hand-made tags are coarse. Most catalogues also have text: a synopsis, the cast, keywords. <code>TfidfVectorizer</code> splits text into words, drops common "stop words" such as "a" and "the", and applies TF-IDF in one step, producing a sparse film × word matrix. The cosine similarity between two films' rows (explained in section 07; for now read it as "1 = same direction, 0 = nothing in common") powers "more like this" rows:</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
desc = {"Dangal":   "a father trains his daughters in wrestling sports drama village",
        "Chak De":  "a coach builds a women hockey team sports drama",
        "Lagaan":   "villagers play cricket against british officers sports drama romance",
        "DDLJ":     "two young travellers fall in love in europe romance family wedding",
        "K3G":      "a rich family splits over a marriage family drama romance",
        "3 Idiots": "three engineering college friends question the system comedy drama"}
vec = TfidfVectorizer(stop_words="english")
T = vec.fit_transform(desc.values())                  # 6 films x vocabulary, sparse
print("vocabulary size:", len(vec.vocabulary_), " matrix:", T.shape, " non-zeros:", T.nnz)
S_text = pd.DataFrame(cosine_similarity(T), index=films, columns=films)
print("more like Dangal:", S_text["Dangal"].drop("Dangal").sort_values(ascending=False).round(3).to_dict())
S_tags = pd.DataFrame(cosine_similarity(W), index=films, columns=films)
print("tag TF-IDF, more like Dangal:", S_tags["Dangal"].drop("Dangal").sort_values(ascending=False).round(3).to_dict())</div>
  <div class="fx" data-lang="text">vocabulary size: 33  matrix: (6, 33)  non-zeros: 42
more like Dangal: {'Chak De': 0.129, 'Lagaan': 0.124, '3 Idiots': 0.048, 'K3G': 0.043, 'DDLJ': 0.0}
tag TF-IDF, more like Dangal: {'Chak De': 1.0, 'Lagaan': 0.779, 'K3G': 0.354, '3 Idiots': 0.315, 'DDLJ': 0.0}</div>
  <p>Both representations agree that Chak De and Lagaan are most like Dangal and DDLJ least, but the text similarities are tiny (Chak De 0.129) because six one-line synopses share only a few words, mainly "sports" and "drama". Word counts cannot tell that "wrestling" and "hockey" are both sports. This is why modern systems describe items with <strong>embeddings</strong>: a pretrained language or image model maps each synopsis or poster to a dense vector in which similar meanings sit close together (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>). Other features slot in the same way: categorical ones such as language or director are one-hot encoded (<a class="xref" data-note="ml_features">Feature Engineering</a>), and numeric ones such as year or runtime must be scaled first, or a column with values near 2000 will swamp every 0/1 tag and make all films look alike except by year. Whatever the vectors are, the recipe in the next two sections stays the same.</p>

  <h2 id="rs-profile"><span class="num">06</span>User Profiles</h2>
  <p>Films are now vectors, but a recommendation compares a film with a <em>person</em>. To compare them we need to describe Ben in the same four numbers: how much he likes sports, drama, romance and comedy. A vector that summarises a user's taste in the same feature space as the items is called a <strong>user profile</strong>. We build it only from Ben's three ratings, Dangal 5, Chak De 5 and DDLJ 2. Using plain 0/1 tags first, so the arithmetic is easy, there are three natural recipes:</p>
  <table class="tbl">
    <tr><th>Recipe</th><th>Weights on Dangal, Chak De, DDLJ</th><th>Computation</th><th>Profile [sports, drama, romance, comedy]</th></tr>
    <tr><td>1. Average of liked films (rating ≥ 4)</td><td>keep Dangal, Chak De</td><td>([1,1,0,0] + [1,1,0,0])/2</td><td>[1, 1, 0, 0]</td></tr>
    <tr><td>2. Rating-weighted average</td><td>5, 5, 2 (sum 12)</td><td>(5·[1,1,0,0] + 5·[1,1,0,0] + 2·[0,0,1,1])/12</td><td>[0.833, 0.833, 0.167, 0.167]</td></tr>
    <tr><td>3. Mean-centred weights</td><td>5 − 4, 5 − 4, 2 − 4 = +1, +1, −2</td><td>(1·[1,1,0,0] + 1·[1,1,0,0] − 2·[0,0,1,1])/(1 + 1 + 2)</td><td>[0.5, 0.5, −0.5, −0.5]</td></tr>
  </table>
  <p>Recipe 1 simply throws away the dislike. Recipe 2 is worse than it looks: every rating is positive, so the 2-star DDLJ still <em>adds</em> romance and comedy to Ben's profile. Recipe 3 first subtracts Ben's own average rating (4) from each rating, which is called <strong>mean-centring</strong>. Now a rating above his usual pulls the profile towards that film's features and a rating below his usual pushes it away, so DDLJ's romance and comedy become negative. We divide by the sum of the absolute weights so the profile stays on the same scale. Think of a friend describing your taste: "loves sports films, can't stand romcoms" is far more useful than "has watched sports films and romcoms". (In information retrieval this is the Rocchio method: move a query towards relevant documents and away from irrelevant ones.) Mean-centring is the single most important trick in this group of notes; collaborative filtering depends on it too.</p>
  <div class="fx" data-lang="py">ben = R.loc["Ben"].dropna()                           # Dangal 5, Chak De 5, DDLJ 2
print("Ben rated:", ben.to_dict(), " his mean:", ben.mean())
liked = ben[ben &gt;= 4].index
p_avg = F.loc[liked].mean()                          # 1) average of liked films
p_wt = (F.loc[ben.index].T @ ben) / ben.sum()        # 2) rating-weighted average
w = ben - ben.mean()                                 # 3) centred weights: +1, +1, -2
p_c = (F.loc[ben.index].T @ w) / w.abs().sum()
print(pd.DataFrame({"liked avg": p_avg, "rating-weighted": p_wt.round(3), "centred": p_c}).T)</div>
  <div class="fx" data-lang="text">Ben rated: {'Dangal': 5.0, 'Chak De': 5.0, 'DDLJ': 2.0}  his mean: 4.0
                 sports  drama  romance  comedy
liked avg         1.000  1.000    0.000   0.000
rating-weighted   0.833  0.833    0.167   0.167
centred           0.500  0.500   -0.500  -0.500</div>
  <p>The three printed rows match the table. In general, the centred profile of user u is p<sub>u</sub> = Σ<sub>j</sub> w<sub>uj</sub> x<sub>j</sub> / Σ<sub>j</sub> |w<sub>uj</sub>|, summing over the items j that u rated, where x<sub>j</sub> is item j's profile and w<sub>uj</sub> = r<sub>uj</sub> − r̄<sub>u</sub> is the rating minus the user's mean. For implicit data, where there are no low ratings, the usual choice is to average only clearly positive interactions (finished, bought).</p>
  <p>A profile is a hand-made summary. The alternative is to <em>learn</em> how much Ben likes each feature by fitting a small regression of his ratings on the film vectors, one model per user. With three ratings and four features the regression has more unknowns than equations, so we use <a class="xref" data-note="ml_ridge_lasso">ridge regression</a>, whose penalty keeps the weights small and the answer unique:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Ridge
Xb, yb = W.loc[ben.index].values, ben.values
unseen = R.columns[R.loc["Ben"].isna()]                  # Lagaan, K3G, 3 Idiots
model = Ridge(alpha=1.0).fit(Xb, yb)
print("Ben's weight per tag:", {t: round(float(c), 3) for t, c in zip(tags, model.coef_)},
      " intercept", round(float(model.intercept_), 3))
print("predicted ratings:", {f: round(float(p), 2) for f, p in zip(unseen, model.predict(W.loc[unseen].values))})</div>
  <div class="fx" data-lang="text">Ben's weight per tag: {'sports': 0.689, 'drama': 0.51, 'romance': -0.553, 'comedy': -0.655}  intercept 3.714
predicted ratings: {'Lagaan': 4.04, 'K3G': 3.57, '3 Idiots': 3.43}</div>
  <p>The learned weights have the same signs as the centred profile: positive for sports (0.689) and drama (0.51), negative for romance (−0.553) and comedy (−0.655). The predicted ratings for Ben's blanks are Lagaan 4.04, K3G 3.57 and 3 Idiots 3.43, with Lagaan first. The intercept, 3.714, sits close to Ben's mean, because with only three ratings the ridge penalty keeps every prediction near it. A per-user model has real advantages: it outputs calibrated ratings, can be any model (logistic regression on "liked / not liked", naive Bayes on text) and can capture combinations of features. But it needs a reasonable number of ratings per user; with few, the simple profile does just as well.</p>

  <h2 id="rs-cosine"><span class="num">07</span>Scoring with Cosine Similarity</h2>
  <p>Ben is now the vector [0.5, 0.5, −0.5, −0.5] and each film is a vector in the same space. We need one number that says how well a film matches his taste. The standard choice is <strong>cosine similarity</strong>: the cosine of the angle between the two vectors, computed as their dot product divided by the product of their lengths, cos(p, x) = (p · x) / (‖p‖ ‖x‖) (see <a class="xref" data-note="ml_clustering">Clustering: The Idea &amp; Distances</a>). It is 1 when the vectors point the same way, 0 when they share nothing, and −1 when they point in opposite directions. Think of two people pointing at places on a map: cosine asks whether they point in the same direction, not how far they reach.</p>
  <p>By hand with plain tags. Ben's centred profile has length √(4 × 0.25) = 1.</p>
  <table class="tbl">
    <tr><th>Unseen film</th><th>vector</th><th>p · x</th><th>‖x‖</th><th>cosine</th></tr>
    <tr><td>Lagaan</td><td>[1, 1, 1, 0]</td><td>0.5 + 0.5 − 0.5 + 0 = 0.5</td><td>√3 = 1.732</td><td>0.5 / (1 × 1.732) = 0.289</td></tr>
    <tr><td>K3G</td><td>[0, 1, 1, 0]</td><td>0 + 0.5 − 0.5 + 0 = 0</td><td>√2 = 1.414</td><td>0</td></tr>
    <tr><td>3 Idiots</td><td>[0, 1, 0, 1]</td><td>0 + 0.5 + 0 − 0.5 = 0</td><td>√2 = 1.414</td><td>0</td></tr>
  </table>
  <p>The code repeats this and adds two alternatives, the "liked average" profile [1, 1, 0, 0] and Euclidean distance, to show why cosine on a centred profile is the right choice:</p>
  <div class="fx" data-lang="py">def cos(a, b): return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
rows = []
for f in unseen:
    x = F.loc[f].values.astype(float)
    rows.append([f, x @ p_c.values, np.linalg.norm(x), cos(p_avg.values, x), cos(p_c.values, x),
                 np.linalg.norm(p_avg.values - x)])
print(pd.DataFrame(rows, columns=["film", "dot(centred)", "|film|", "cos(liked avg)", "cos(centred)",
                                  "euclid(liked avg)"]).round(3).to_string(index=False))</div>
  <div class="fx" data-lang="text">    film  dot(centred)  |film|  cos(liked avg)  cos(centred)  euclid(liked avg)
  Lagaan           0.5   1.732           0.816         0.289              1.000
     K3G           0.0   1.414           0.500         0.000              1.414
3 Idiots           0.0   1.414           0.500         0.000              1.414</div>
  <p>With the centred profile, Lagaan scores 0.289 and the other two 0. With the liked-average profile the order is the same, but K3G scores 0.5, "half good", although it is a romance Ben has reason to dislike: without centring the profile cannot express dislike. The <code>dot(centred)</code> and <code>|film|</code> columns show why we divide by lengths: the raw dot product grows with the vector's length, so a film with many tags (Lagaan has three) would win just for having more tags. Euclidean distance gives the same order here, but it is also sensitive to lengths and cannot express "opposite" the way a negative cosine can. Cosine looks only at direction: <em>which mix</em> of features, not <em>how many</em>.</p>
  <p>Now the same with the TF-IDF film vectors from section 05, which separate the films more finely. Ben's centred profile becomes sports (0.804 + 0.804)/4 = 0.402, drama (0.595 + 0.595)/4 = 0.297, romance −2 × 0.645/4 = −0.323 and comedy −2 × 0.764/4 = −0.382, with length 0.707. The cosine with Lagaan [0.627, 0.464, 0.627, 0] is (0.402 × 0.627 + 0.297 × 0.464 − 0.323 × 0.627)/(0.707 × 1) = 0.188/0.707 = 0.265, and with 3 Idiots [0, 0.530, 0, 0.848] it is (0.158 − 0.324)/0.707 = −0.235.</p>
  <div class="fx" data-lang="py">p_c_w = (W.loc[ben.index].T @ w) / w.abs().sum()      # centred profile, built from TF-IDF film vectors
scores = W.loc[unseen] @ p_c_w / (np.linalg.norm(W.loc[unseen], axis=1) * np.linalg.norm(p_c_w))
print("Ben's TF-IDF profile:", p_c_w.round(3).to_dict())
print("cosine to unseen films:", scores.sort_values(ascending=False).round(3).to_dict())</div>
  <div class="fx" data-lang="text">Ben's TF-IDF profile: {'sports': 0.402, 'drama': 0.297, 'romance': -0.323, 'comedy': -0.382}
cosine to unseen films: {'Lagaan': 0.265, 'K3G': -0.116, '3 Idiots': -0.235}</div>
  <p>TF-IDF breaks the tie that plain tags left: K3G is now slightly negative (−0.116), and 3 Idiots, which carries the rare "comedy" tag that Ben disliked in DDLJ, is last at −0.235. Ben's content-based list is Lagaan, K3G, 3 Idiots. The same function gives every user a personal list:</p>
  <div class="fx" data-lang="py">def content_recs(user, V, n=3):
    r = R.loc[user].dropna()
    wts = r - r.mean()                                # liked &gt; 0, disliked &lt; 0
    if (wts == 0).all(): wts = r                      # a user who rates everything the same
    prof = (V.loc[r.index].T @ wts) / wts.abs().sum()
    cand = R.columns[R.loc[user].isna()]
    s = cosine_similarity([prof], V.loc[cand])[0]
    return {c: round(float(v), 3) for c, v in sorted(zip(cand, s), key=lambda t: -t[1])[:n]}
for u in users:
    print(f"{u:5s} -&gt;", content_recs(u, W))</div>
  <div class="fx" data-lang="text">Asha  -&gt; {'Lagaan': 0.054}
Ben   -&gt; {'Lagaan': 0.265, 'K3G': -0.116, '3 Idiots': -0.235}
Chen  -&gt; {'3 Idiots': 0.14, 'Lagaan': -0.158, 'Chak De': -0.694}
Dia   -&gt; {'Lagaan': 0.056, 'Dangal': -0.57}
Esha  -&gt; {'Chak De': 0.422, 'DDLJ': -0.206}</div>
  <p>Each list is now personal. Chen, the romance fan, is offered 3 Idiots first and Chak De last; Esha is offered Chak De. Compare section 04, where popularity gave Ben and Chen the identical list. The line <code>if (wts == 0).all()</code> handles a user who gave every film the same rating, whose centred weights would all be zero. Remember that these scores are similarities, not ratings: Asha's 0.054 for Lagaan does not mean she will rate it badly, only that it is the best match among her one unseen film.</p>
  <p>If we need an actual predicted rating, we can compare films with films instead. Predict Ben's rating of a film as the similarity-weighted average of his own ratings of the k most similar films he has rated, using the TF-IDF film-to-film cosine. For Lagaan with k = 2, the most similar films Ben rated are Dangal (0.779) and Chak De (0.779), both rated 5, so the prediction is (0.779 × 5 + 0.779 × 5)/(0.779 + 0.779) = 5.0.</p>
  <div class="fx" data-lang="py">S_item = pd.DataFrame(cosine_similarity(W), index=films, columns=films)
def content_predict(Rm, u, f, k=2):
    r = Rm.loc[u].dropna()
    sims = S_item.loc[f, r.index]
    sims = sims[sims &gt; 0].sort_values(ascending=False).head(k)  # the k most similar films u has rated
    if sims.sum() == 0: return np.nanmean(Rm.values)
    return (sims * r[sims.index]).sum() / sims.sum()
print("Ben -&gt; Lagaan:", round(content_predict(R, "Ben", "Lagaan"), 3),
      " sims used:", S_item.loc["Lagaan", ["Dangal", "Chak De", "DDLJ"]].round(3).to_dict())</div>
  <div class="fx" data-lang="text">Ben -&gt; Lagaan: 5.0  sims used: {'Dangal': 0.779, 'Chak De': 0.779, 'DDLJ': 0.404}</div>
  <p>The prediction is 5.0, and the printed similarities show why DDLJ (0.404) was left out: with k = 2 only the two closest films vote. This is exactly <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> regression, where "nearest" is measured in feature space and the training set is one user's own ratings. In general, content-based filtering scores item i for user u either by s(u, i) = cos(p<sub>u</sub>, x<sub>i</sub>), or by the KNN prediction r̂<sub>ui</sub> = Σ<sub>j</sub> sim(i, j)·r<sub>uj</sub> / Σ<sub>j</sub> |sim(i, j)| over the k items u rated that are most similar to i. Either way it uses only item features and the target user's own history; it never looks at other users. One practical step must never be forgotten: remove films the user has already seen before taking the top N, because the films most similar to Ben's profile are Dangal and Chak De, which he has already watched.</p>

  <h2 id="rs-check"><span class="num">08</span>Does It Beat Popularity?</h2>
  <p>Content-based scores look sensible on five users, but "looks sensible" is not evidence, and 19 ratings are far too few to measure anything. The honest test is a <strong>hold-out evaluation</strong>: hide some ratings we know, build every model from the rest, predict the hidden ones, and measure the error with <strong>RMSE</strong>, the root mean squared error √(mean of (r̂ − r)²), as in <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>. It is the train/test split of <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a> applied to cells of the matrix. Everything (means, profiles, models) must be built from the training cells only, or the hidden ratings leak into the predictions.</p>
  <p>For enough data we simulate a bigger CineCity, which the next three notes reuse so their numbers can be compared. It has 1,000 users and 1,000 films. Every film has random genre tags plus two <em>hidden traits</em> that no tag records (think of star power or a director's style), and every user has a taste for the genres and for the hidden traits. Some users rate generously and some films are simply better, popularity follows Zipf's law, and people mostly watch popular films they expect to like, so the missing cells are not random. The rating is a base of 3.4 plus the user and film offsets plus the taste match plus noise, rounded and clipped to 1–5:</p>
  <div class="fx" data-lang="py">def make_ratings(n_users=1000, n_items=1000, per_user=50, seed=0):
    """CineCity at scale: films have genre tags plus 2 hidden traits that no tag records."""
    rng = np.random.default_rng(seed)
    tags = np.zeros((n_items, 4), int)                          # sports, drama, romance, comedy
    for i in range(n_items):
        tags[i, rng.choice(4, rng.integers(1, 3), replace=False)] = 1
    taste = rng.normal(0, 1, (n_users, 4))                      # each user's liking for each genre
    hid_u, hid_i = rng.normal(0, 1, (n_users, 2)), rng.normal(0, 1, (n_items, 2))
    bu, bi = rng.normal(0, 0.4, n_users), rng.normal(0, 0.4, n_items)   # generous raters, good films
    pop = 1 / np.arange(1, n_items + 1)                         # Zipf popularity
    fit = 0.9 * taste @ (tags / tags.sum(1, keepdims=True)).T + 0.8 * hid_u @ hid_i.T / np.sqrt(2)
    rows = []
    for u in range(n_users):
        p = pop * np.exp(1.5 * fit[u]); p /= p.sum()            # people watch popular films they'll like
        for i in rng.choice(n_items, max(3, rng.poisson(per_user)), replace=False, p=p):
            s = 3.4 + bu[u] + bi[i] + fit[u, i] + rng.normal(0, 0.6)
            rows.append((u, i, int(np.clip(np.rint(s), 1, 5))))
    return pd.DataFrame(rows, columns=["user", "item", "rating"]), tags, hid_i

big, big_tags, hidden = make_ratings()
print(f"{big.user.nunique()} users, {big.item.nunique()} films, {len(big):,} ratings, "
      f"density {len(big) / 1e6:.4f}, mean rating {big.rating.mean():.2f}")</div>
  <div class="fx" data-lang="text">1000 users, 1000 films, 50,186 ratings, density 0.0502, mean rating 4.14</div>
  <p>About 50 ratings per user, 5% density, and a high average rating of 4.14, because people choose films they expect to like. Now we hide a random 20% of the ratings and compare five predictors: the global mean, each film's mean (popularity), the damped film mean, each user's mean, and content-based filtering, which here is the user's mean plus a small ridge model per user on TF-IDF tag vectors (the per-user model from section 06). We also report RMSE separately on "rare" films with fewer than five training ratings.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Ridge
from sklearn.feature_extraction.text import TfidfTransformer
test = np.random.default_rng(1).random(len(big)) &lt; 0.2       # hide a random 20% of ratings
tr, te = big[~test], big[test]
y = te.rating.values
def rmse(p): return np.sqrt(np.mean((np.asarray(p) - y) ** 2))

mu = tr.rating.mean()                                          # every statistic from TRAIN only
ist = tr.groupby("item").rating.agg(["sum", "count"])
n_tr = ist["count"].reindex(te.item).fillna(0).values
item_mean = (ist["sum"] / ist["count"]).reindex(te.item).fillna(mu).values
damped5 = ((ist["sum"] + 5 * mu) / (ist["count"] + 5)).reindex(te.item).fillna(mu).values

Wb = TfidfTransformer().fit_transform(big_tags).toarray()      # TF-IDF film profiles
user_mean, models = {}, {}
for u, g in tr.groupby("user"):                                # one small ridge model per user
    user_mean[u] = g.rating.mean()
    models[u] = Ridge(alpha=1.0).fit(Wb[g.item.values], g.rating.values - user_mean[u])
um = np.array([user_mean[u] for u in te.user])
content = np.clip(um + np.array([models[u].predict(Wb[[i]])[0] for u, i in zip(te.user, te.item)]), 1, 5)

rare = n_tr &lt; 5
print(f"{'predictor':31s} {'RMSE all':&gt;8s} {'RMSE rare films':&gt;16s}")
for name, p in [("global mean", np.full(len(y), mu)), ("film mean (popularity)", item_mean),
                ("damped film mean, m=5", damped5), ("user mean", um),
                ("content-based (per-user ridge)", content)]:
    print(f"{name:31s} {rmse(p):8.3f} {np.sqrt(np.mean((p - y)[rare] ** 2)):16.3f}")
print(f"test ratings: {len(y):,}, of which on rare films (&lt;5 training ratings): {rare.sum()}")</div>
  <div class="fx" data-lang="text">predictor                       RMSE all  RMSE rare films
global mean                        1.007            1.048
film mean (popularity)             0.921            1.010
damped film mean, m=5              0.918            0.975
user mean                          0.859            0.952
content-based (per-user ridge)     0.801            0.833
test ratings: 10,004, of which on rare films (&lt;5 training ratings): 78</div>
  <p>Read the table from top to bottom. The global mean (1.007) knows nothing. The film mean (0.921) helps, but on rare films it barely beats the global mean (1.010 against 1.048), because an average of two or three ratings is noisy; the damped mean is the best popularity score there (0.975), which is the Lagaan effect from section 04 at scale. The user mean (0.859) is better still, because people differ more than films in how they use the rating scale. Content-based filtering is clearly best at 0.801, and it keeps its lead on rare films (0.833), because it needs no ratings of a film to score it.</p>
  <p>It does not reach the level the noise in the simulation allows, though. The tags explain the genre part of taste and nothing of the hidden traits, and content-based filtering has no way to discover traits that no feature records. That missing part is exactly what collaborative filtering can learn from other users, since it never needs to know what the traits are.</p>

  <h2 id="rs-limits"><span class="num">09</span>Strengths, Weaknesses and Hybrids</h2>
  <p>Content-based filtering won the accuracy test, but its design gives it fixed strengths and fixed blind spots that no amount of data changes. Three small experiments on CineCity show them: a brand-new film, Chhichhore (tagged sports, drama and comedy), that nobody has rated; Ben's score for 3 Idiots compared with what similar users did; and two films with identical tags.</p>
  <div class="fx" data-lang="py">new = pd.Series([1, 1, 0, 1], index=tags)                    # Chhichhore: sports, drama, comedy; 0 ratings
w_new = new * idf_sk; w_new /= np.linalg.norm(w_new)
for u in ["Ben", "Dia"]:
    r = R.loc[u].dropna(); wts = r - r.mean()
    prof = (W.loc[r.index].T @ wts) / wts.abs().sum()
    print(f"{u}: cosine to brand-new Chhichhore = {cos(prof.values, w_new.values):.3f}")
print("content score of 3 Idiots for Ben:", round(float(scores["3 Idiots"]), 3))
print("but Asha and Esha, who also gave Dangal a 5, rated 3 Idiots:",
      R.loc[["Asha", "Esha"], "3 Idiots"].astype(int).to_dict())
print("Dangal vs Chak De, tag similarity:", round(S_item.loc["Dangal", "Chak De"], 3),
      "| their mean ratings:", R[["Dangal", "Chak De"]].mean().round(2).to_dict())</div>
  <div class="fx" data-lang="text">Ben: cosine to brand-new Chhichhore = 0.140
Dia: cosine to brand-new Chhichhore = -0.434
content score of 3 Idiots for Ben: -0.235
but Asha and Esha, who also gave Dangal a 5, rated 3 Idiots: {'Asha': 4, 'Esha': 5}
Dangal vs Chak De, tag similarity: 1.0 | their mean ratings: {'Dangal': 4.25, 'Chak De': 3.33}</div>
  <p>The first strength is that <strong>new items work immediately</strong>. Chhichhore has zero ratings, yet it already scores 0.140 for Ben and −0.434 for Dia, because its tags are enough. Methods that learn only from ratings cannot score it at all until people rate it; this is the <strong>item cold-start problem</strong>, covered in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>. Content-based filtering also needs no other users, so it works for the first user of a new app and for niche tastes nobody shares; it is <strong>explainable</strong> ("because you liked Dangal and Chak De, which are sports films"), which users understand and auditors can check; and it is private, since it uses only the user's own history.</p>
  <p>The weaknesses are just as structural. The biggest is <strong>over-specialisation</strong>, often called the filter bubble: content can only recommend more of what the user has already seen. 3 Idiots scores −0.235 for Ben, last on his list, because its features (drama, comedy) look like the DDLJ he disliked. Yet Asha and Esha, the two other users who rated Dangal 5, rated 3 Idiots 4 and 5. People with Ben's taste love it, but no tag says so, and content-based filtering will never surprise Ben with it. Recommending relevant items a user would not have found or expected is called <strong>serendipity</strong>, and content-based filtering has almost none. Second, a <strong>new user</strong> with no ratings has no profile, so an onboarding quiz or a popularity fallback is needed. Third, the method is <strong>only as good as the features</strong>: Dangal and Chak De have identical tags (similarity 1.0), yet their average ratings are 4.25 and 3.33, because tags describe what a film is, not how good it is, and they miss the hidden traits of section 08. Finally, good features cost effort: tags must be created and kept consistent for every new item, and text features miss meaning without embeddings. Think of a music app that learned you like one singer and now plays only that singer; it never notices that people with your exact taste have all moved on to a new band.</p>
  <p>Because popularity, content and collaborative signals have opposite strengths, real systems combine them in a <strong>hybrid recommender</strong>. There are four common designs:</p>
  <table class="tbl">
    <tr><th>Hybrid type</th><th>How it works</th><th>CineCity example</th></tr>
    <tr><td>Switching</td><td>choose one method per situation</td><td>new user with 0 ratings → popularity; after he rates Dangal 5 → content-based</td></tr>
    <tr><td>Weighted</td><td>blend scores, s = α·s₁ + (1 − α)·s₂, after putting them on one scale</td><td>0.5 × content + 0.5 × collaborative score, α tuned on a hold-out</td></tr>
    <tr><td>Cascade</td><td>one method shortlists, the next reorders</td><td>content retrieves sports or drama films, collaborative filtering ranks the shortlist</td></tr>
    <tr><td>Feature combination</td><td>one model with every signal as an input</td><td>a <a class="xref" data-note="ml_gbm">gradient-boosted</a> ranker with tags, popularity and collaborative scores as features</td></tr>
  </table>
  <p>The weighted design has a trap: cosine scores run from −1 to 1, predicted ratings from 1 to 5 and counts from 0 to thousands, so blending them raw lets the method with the biggest numbers silently win. Convert each to ranks or standardise them first. Large systems (YouTube, Netflix, Flipkart) are feature-combination hybrids inside a two-stage pipeline: several cheap sources retrieve candidates, then one ranking model sees all the signals. The table below places the methods of this group side by side; the collaborative entries are explained in the next two notes.</p>
  <table class="tbl">
    <tr><th></th><th>Popularity</th><th>Content-based</th><th>Collaborative filtering</th><th>Matrix factorization</th></tr>
    <tr><td>Uses</td><td>item statistics</td><td>item features + own history</td><td>the rating matrix (neighbours)</td><td>the rating matrix (learned factors)</td></tr>
    <tr><td>Personalised</td><td>no</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>New item</td><td>after a few ratings</td><td>immediately</td><td>no</td><td>no (unless features are added)</td></tr>
    <tr><td>New user</td><td>yes</td><td>after a few ratings</td><td>after a few ratings</td><td>after a few ratings</td></tr>
    <tr><td>Surprises</td><td>no</td><td>no</td><td>yes</td><td>yes</td></tr>
    <tr><td>Explanation</td><td>"trending"</td><td>"because it is a sports film"</td><td>"people like you liked it"</td><td>hard</td></tr>
  </table>
  <p>The next note, <a class="xref" data-note="ml_cf">Collaborative Filtering</a>, starts exactly where content-based filtering fails: it ignores features completely and predicts Ben's 3 Idiots rating from the people who agree with him, and it ranks 3 Idiots first.</p>

  <h2 id="rs-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most damaging mistake with implicit data is treating every zero as a dislike. Most zeros are films the user never saw, and data is missing not at random, so a model trained to predict 0 for them learns that people hate everything they have not watched. Treat zeros as "unknown": use logged impressions as negatives when you have them, or give zeros a small weight, which is what implicit-feedback matrix factorization does (<a class="xref" data-note="ml_mf">Matrix Factorization</a>).</p>
  <p>The second is ranking items by their raw mean rating. A single lucky 5 put Lagaan at the top of the chart. Use the damped mean (Σr + mμ)/(n + m), or at least a minimum number of ratings. A related memory mistake is densifying the matrix with <code>.toarray()</code> or <code>.fillna(0)</code>: on real data it explodes memory and invents 0-star ratings. Keep matrices sparse end to end.</p>
  <p>Profiles go wrong in two ways. Averaging raw ratings or every watched item lets a disliked film add its features to the profile; the rating-weighted profile gave Ben romance 0.167 although he rated DDLJ 2. Subtract the user's mean first. And scoring by the raw dot product instead of cosine lets films with more tags win for being longer vectors; normalise. Here is the dot-product mistake and its fix on CineCity's plain tags, where Lagaan has three tags and 3 Idiots two:</p>
  <div class="fx" data-lang="py">import numpy as np
profile = np.array([1.0, 1.0, 0.0, 0.0])            # Ben's liked-average profile: sports, drama
lagaan, idiots = np.array([1, 1, 1, 0]), np.array([0, 1, 0, 1])
print("dot   :", profile @ lagaan, profile @ idiots)
cos = lambda a, b: a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
print("cosine:", round(cos(profile, lagaan), 3), round(cos(profile, idiots), 3))
big = np.array([1, 1, 1, 1])                        # a film tagged with everything
print("film with all 4 tags -&gt; dot", profile @ big, " cosine", round(cos(profile, big), 3))</div>
  <div class="fx" data-lang="text">dot   : 2.0 1.0
cosine: 0.816 0.5
film with all 4 tags -&gt; dot 2.0  cosine 0.707</div>
  <p>With the dot product, a film tagged with every genre ties Lagaan at 2.0 for Ben, although half its tags are things he has no interest in; cosine drops it to 0.707, below Lagaan's 0.816, because it measures the match in direction rather than the number of tags. Ignoring how common a feature is causes a similar distortion: "drama" on five of six films makes everything look alike, which TF-IDF fixes by weighting tags by rarity.</p>
  <p>Finally, three process mistakes: recommending items the user already has (filter seen, bought and unavailable items before taking the top N); reporting a model without a popularity baseline next to it, when on sparse data popularity is often hard to beat; and judging only by accuracy, when a list of five near-identical sports films can score well and still bore the user. Diversity and coverage are measured in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>

  <h2 id="rs-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The running example</h3>
  <table class="tbl">
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>user mean</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>·</td><td>1</td><td>1</td><td>4</td><td>3.0</td></tr>
    <tr><td>Ben</td><td>5</td><td>5</td><td>·</td><td>2</td><td>·</td><td>·</td><td>4.0</td></tr>
    <tr><td>Chen</td><td>2</td><td>·</td><td>·</td><td>5</td><td>5</td><td>·</td><td>4.0</td></tr>
    <tr><td>Dia</td><td>·</td><td>1</td><td>·</td><td>4</td><td>5</td><td>2</td><td>3.0</td></tr>
    <tr><td>Esha</td><td>5</td><td>·</td><td>5</td><td>·</td><td>3</td><td>5</td><td>4.5</td></tr>
    <tr><td>tags</td><td>sports, drama</td><td>sports, drama</td><td>sports, drama, romance</td><td>romance, comedy</td><td>drama, romance</td><td>drama, comedy</td><td></td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Recommender system</b>: learns a score s(u, i) for every user–item pair and shows each user the top N unseen items.</li>
    <li><b>Explicit feedback</b>: deliberate ratings, rare, with real dislikes. <b>Implicit feedback</b>: plays, clicks, purchases; plentiful, positive only, a confidence not a rating.</li>
    <li><b>Missing not at random</b>: whether a cell is filled depends on its value (people watch what they expect to like).</li>
    <li><b>Interaction matrix</b> R: users × items; <b>density</b> = filled / total (CineCity 19/30 = 0.633; real data &lt; 1%).</li>
    <li><b>Long tail</b>: the many items with few interactions in a Zipf-shaped popularity curve.</li>
    <li><b>Damped (Bayesian) mean</b>: an item's average shrunk towards the global mean by m virtual ratings.</li>
    <li><b>Item profile</b>: feature vector of an item (tags, TF-IDF, embeddings). <b>User profile</b>: weighted average of rated items' profiles.</li>
    <li><b>Content-based filtering</b>: recommend items whose features match the user's own history.</li>
    <li><b>Over-specialisation / serendipity</b>: only "more of the same"; serendipity = relevant and unexpected.</li>
    <li><b>Hybrid</b>: switching, weighted, cascade or feature-combination mix of methods.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>CineCity value</th></tr>
    <tr><td>Damped mean</td><td>(Σr<sub>ui</sub> + mμ)/(n<sub>i</sub> + m) = (n/(n+m))x̄ + (m/(n+m))μ</td><td>Lagaan 5.0 → 3.974 (μ = 3.632, m = 3)</td></tr>
    <tr><td>IDF (sklearn)</td><td>ln((1 + N)/(1 + df)) + 1; textbook log(N/df)</td><td>drama 1.154, comedy 1.847</td></tr>
    <tr><td>TF-IDF profile</td><td>x = tf · idf, then x / ‖x‖</td><td>Dangal [0.804, 0.595, 0, 0]</td></tr>
    <tr><td>User profile</td><td>p<sub>u</sub> = Σ w<sub>uj</sub> x<sub>j</sub> / Σ|w<sub>uj</sub>|, w<sub>uj</sub> = r<sub>uj</sub> − r̄<sub>u</sub></td><td>Ben weights +1, +1, −2</td></tr>
    <tr><td>Cosine</td><td>a·b / (‖a‖‖b‖)</td><td>Ben: Lagaan 0.265, K3G −0.116, 3 Idiots −0.235</td></tr>
    <tr><td>Content KNN rating</td><td>r̂<sub>ui</sub> = Σ sim(i, j) r<sub>uj</sub> / Σ|sim(i, j)| over k nearest rated items</td><td>Ben → Lagaan 5.0</td></tr>
    <tr><td>RMSE</td><td>√mean((r̂ − r)²) on held-out ratings</td><td>popularity 0.918, content 0.801</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfTransformer, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

X = csr_matrix(R.fillna(0).values)                       # sparse storage (toy only: never fillna on real data)
damped = (R.sum() + m * mu) / (R.notna().sum() + m)      # popularity baseline
W = TfidfTransformer().fit_transform(tag_matrix)         # item profiles from 0/1 tags
T = TfidfVectorizer(stop_words="english").fit_transform(descriptions)
r = R.loc[user].dropna(); w = r - r.mean()               # centred weights
profile = (W_df.loc[r.index].T @ w) / w.abs().sum()      # user profile
scores = cosine_similarity([profile], W_df.loc[unseen])  # score unseen items only</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A zero in implicit data is "unknown", not "disliked".</li>
    <li>Never rank by a raw mean of a few ratings; damp it.</li>
    <li>Centre ratings before building profiles; use cosine, not the raw dot product.</li>
    <li>Scale numeric features and down-weight common tags (TF-IDF).</li>
    <li>Filter already-seen items; always report the popularity baseline.</li>
    <li>Content-based filtering handles new items but not new users, and never surprises.</li>
  </ul>

  <h2 id="rs-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a recommender system do, and how is it different from ordinary classification?</summary><div class="qa-body">It scores every (user, item) pair and shows each user the few unseen items with the highest scores. Unlike classification, almost all the "labels" (the cells of the user × item matrix) are missing, the output is a short ordered list rather than one label per row, and the training signal (ratings, clicks) is a proxy for the business goal (watch time, retention). It can be framed as rating prediction (regression) or top-N recommendation (ranking).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between explicit and implicit feedback? Which is more common?</summary><div class="qa-body">Explicit feedback is a deliberate rating or like: rare, bounded, with real dislikes. Implicit feedback is behaviour such as plays, clicks and purchases: plentiful but positive-only, and a missing record may simply mean "never seen". Implicit feedback is far more common in industry; its values are treated as confidence that the user likes the item, and events are weighted by strength (finishing a film counts more than pressing play).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "missing not at random" mean for recommender data?</summary><div class="qa-body">Whether a cell is observed depends on its value: people mostly watch and rate items they expect to like, so the known ratings skew high and the blanks are skewed towards items users would dislike or never consider. Treating blanks as random, or as zeros, gives biased models and biased evaluation. Logged impressions (shown but not chosen) and propensity weighting help correct it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the interaction matrix sparse, and what are the consequences?</summary><div class="qa-body">Each user interacts with a tiny fraction of the catalogue, so real matrices are often well below 1% filled (0.35% in our 20,000 × 5,000 simulation). Consequences: dense storage is impossible (0.8 GB versus 4 MB in CSR), most pairs of users share few items, and most items sit in a long tail with very little data. Every method must work with mostly-missing data and with sparse matrix formats.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a plain average rating a bad popularity score, and what do you use instead?</summary><div class="qa-body">An item with one or two ratings gets an extreme, noisy average; a single 5 put Lagaan first. Use the damped (Bayesian) mean (Σr + mμ)/(n + m), which adds m virtual ratings at the global mean μ: with μ = 3.632 and m = 3, Lagaan falls to 3.974, just below Dangal's 3.985. It is a weighted average of the item's mean (weight n/(n + m)) and the global mean, so trust grows with evidence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should a popularity baseline always be reported?</summary><div class="qa-body">Because it is often surprisingly hard to beat on accuracy metrics, especially for users with little history, and it is what brand-new users see anyway. If a sophisticated model does not clearly beat popularity on the same split, something is wrong with the model, the features or the evaluation. Popularity also reveals how much of a metric comes simply from recommending well-known items.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is TF-IDF and why use it for item profiles?</summary><div class="qa-body">TF-IDF weights each feature (word, tag) by how often it appears in the item (term frequency) times how rare it is across all items (inverse document frequency). A tag on almost every item, like "drama" on five of six films, says little about similarity, so it gets a low weight; a rare tag gets a high weight. Vectors are then L2-normalised so items with many features do not dominate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build a user profile in content-based filtering, and why mean-centre the ratings?</summary><div class="qa-body">Take a weighted average of the profiles of the items the user rated, with weight = rating minus the user's mean, divided by the sum of absolute weights. Ratings are all positive, so without centring a disliked item still adds its features to the profile. Ben's 5, 5, 2 (mean 4) become +1, +1, −2, so DDLJ's romance and comedy are subtracted and the profile can express dislike.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use cosine similarity rather than the dot product or Euclidean distance?</summary><div class="qa-body">The dot product grows with vector length, so items with many features win regardless of fit; Euclidean distance is also affected by lengths. Cosine divides by both lengths and measures only direction, the mix of features, and it can be negative for opposite tastes. Ben's centred profile scores Lagaan 0.289 with plain tags, and an item tagged with every genre would tie Lagaan on dot product but fall well below it on cosine.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can content-based filtering predict an actual rating rather than a similarity?</summary><div class="qa-body">Either with KNN on the user's own ratings: find the k items the user rated that are most similar in feature space and take the similarity-weighted average of their ratings (Ben → Lagaan from Dangal and Chak De, both 5, gives 5.0). Or with a per-user model: regress the user's ratings on item features, typically with ridge because there are few ratings per user (Ben → Lagaan 4.04).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the main strengths of content-based filtering?</summary><div class="qa-body">It scores new items immediately from their features (Chhichhore, with no ratings, scores 0.140 for Ben), needs no other users so it works for niche tastes and new systems, gives readable explanations ("because you liked sports films"), and uses only the user's own data. It is the natural choice when items arrive constantly, such as news articles or job posts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are its main weaknesses?</summary><div class="qa-body">Over-specialisation: it only recommends items resembling the user's history, so no serendipity (3 Idiots scored −0.235 for Ben although users who share his taste rated it 4 and 5). No profile for brand-new users. It is limited by feature quality: tags describe what an item is, not how good it is (Dangal and Chak De have identical tags but different average ratings), and they miss properties nobody tagged. Building and maintaining features also costs effort.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you check that a content-based recommender beats popularity?</summary><div class="qa-body">Hide a random share (or better, the most recent part) of the interactions, build profiles and popularity statistics from the rest only, predict the hidden ones and compare RMSE or ranking metrics. On our 1,000 × 1,000 simulation, damped popularity scored RMSE 0.918, the user mean 0.859 and content-based 0.801. Confirm with an A/B test before shipping, because offline accuracy is only a proxy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A news site publishes 5,000 new articles a day. Which recommender family do you start with?</summary><div class="qa-body">Content-based filtering on article text (TF-IDF or embeddings) plus category, because articles are new and short-lived, so collaborative methods have no interactions for them until they are already stale. Add popularity ("trending") for new users and use collaborative signals from early clicks to re-rank: a hybrid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the common ways to build a hybrid recommender?</summary><div class="qa-body">Switching (popularity for new users, content or collaborative once they have history), weighted (blend normalised scores), cascade (one method shortlists, another reorders), and feature combination (one model, often a gradient-boosted ranker, with every signal as input). Scores must be put on a common scale before blending. Large systems use feature combination inside a retrieval-then-ranking pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is shrinkage, and where does it appear in recommenders?</summary><div class="qa-body">Shrinkage pulls an estimate based on little data towards a safer prior value, trading a little bias for a large cut in variance. The damped mean shrinks an item's average towards the global mean; damped user and item biases in the baseline predictor do the same; collaborative filtering shrinks similarities computed from few shared ratings towards zero; and matrix factorization's L2 penalty shrinks factors. Ridge regression is the same idea for coefficients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you avoid filling the blanks of a rating matrix with zeros?</summary><div class="qa-body">A zero claims "this user rated it zero stars", which nobody did, so models learn that unseen items are hated and similarities mix "agrees with me" with "has rated many of the same items". On real data it also destroys sparsity and memory (tens of terabytes). Work with the observed cells only, or centre first so that a zero means "average", or use confidence weighting for implicit data.</div></details>
</main>
`
});
