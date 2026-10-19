// notes/ml/ml_recsys.js — Recommendation Systems: Basics & Content-Based
Object.assign(TOPIC_CONTENT, {
  "ml_recsys": `<main>
<h1>Recommendation Systems: Basics &amp; Content-Based</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Basics &amp; Content-Based</span></div>
  <p class="lead">A recommender picks the few items worth showing one person out of a catalogue far too big to scroll. This note opens the Recommendation Systems group and builds the foundations on one running example, a small streaming app called CineCity with five users and six films: what a recommender must output, explicit vs implicit feedback, the user × item interaction matrix and why it is almost empty, the popularity baseline (and why a damped average beats a plain one), and the first personalised method, content-based filtering: item profiles from tags and TF-IDF, user profiles, cosine similarity worked by hand, a per-user model, a hold-out check at scale, and the strengths and weaknesses that lead straight into collaborative filtering.</p>

  <h2 id="rs-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 236" width="680">
<defs><marker id="rs-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="6" width="190" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Recommendation Systems</text>
<line x1="300" y1="40" x2="95" y2="78" stroke="currentColor" marker-end="url(#rs-a0)"/><line x1="320" y1="40" x2="262" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rs-a0)"/><line x1="360" y1="40" x2="425" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rs-a0)"/><line x1="380" y1="40" x2="590" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rs-a0)"/>
<rect x="10" y="80" width="170" height="58" rx="8" class="fg sg" stroke-width="3"/><text x="95" y="100" text-anchor="middle" font-size="12" font-weight="700">1 Basics &amp; Content-Based</text><text x="95" y="116" text-anchor="middle" class="tm" font-size="10">problem, data, popularity,</text><text x="95" y="130" text-anchor="middle" class="tg" font-size="10">features · YOU ARE HERE</text>
<rect x="185" y="80" width="155" height="58" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="262" y="102" text-anchor="middle" font-size="12">2 Collaborative Filtering</text><text x="262" y="120" text-anchor="middle" class="tm" font-size="10">learn from other users</text>
<rect x="345" y="80" width="160" height="58" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="425" y="102" text-anchor="middle" font-size="12">3 Matrix Factorization</text><text x="425" y="120" text-anchor="middle" class="tm" font-size="10">hidden taste vectors</text>
<rect x="510" y="80" width="160" height="58" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="98" text-anchor="middle" font-size="12">4 Ranking, Evaluation</text><text x="590" y="113" text-anchor="middle" font-size="12">&amp; Cold Start</text><text x="590" y="129" text-anchor="middle" class="tm" font-size="10">top-k lists, metrics, new users</text>
<line x1="180" y1="109" x2="183" y2="109" stroke="currentColor" marker-end="url(#rs-a0)"/><line x1="340" y1="109" x2="343" y2="109" stroke="currentColor" marker-end="url(#rs-a0)"/><line x1="505" y1="109" x2="508" y2="109" stroke="currentColor" marker-end="url(#rs-a0)"/>
<text x="95" y="160" text-anchor="middle" class="tm" font-size="10">needs item features</text><text x="262" y="160" text-anchor="middle" class="tm" font-size="10">fails when users share nothing</text><text x="425" y="160" text-anchor="middle" class="tm" font-size="10">predicts every cell</text><text x="590" y="160" text-anchor="middle" class="tm" font-size="10">turns scores into lists</text>
<path d="M95,170 Q340,234 590,170" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#rs-a0)"/><text x="340" y="222" text-anchor="middle" class="tm" font-size="10.5">content features return in note 4 to rescue brand-new items (cold start) and in hybrids</text>
</svg><figcaption>The Recommendation Systems group. Read left to right: each note's weakness is the next note's reason to exist.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a>, <a class="xref" data-note="ml_clustering">Clustering: The Idea &amp; Distances</a> and <a class="xref" data-note="nlp">NLP Foundations</a></b><span>We can measure how alike two rows are (cosine, Euclidean), predict from the nearest ones, and turn text into TF-IDF vectors. Left open: what if the "rows" are people and films, the labels are mostly missing, and the job is not to classify but to choose ten things out of a million?</span></li>
    <li><b>This note adds: the recommendation problem and its first two answers</b><span>The data (explicit and implicit feedback in a sparse user × item matrix), the non-personalised baseline every model must beat (popularity, done properly with a damped mean), and the first personalised method, content-based filtering: describe films by features, describe a person by the films they liked, and recommend by cosine similarity.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_cf">Collaborative Filtering</a></b><span>Content-based filtering can only recommend "more of the same features". Collaborative filtering ignores features and learns from what similar people did. Then <a class="xref" data-note="ml_mf">Matrix Factorization</a> compresses the whole matrix into short taste vectors, and <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a> turns scores into ranked lists, measures them properly and handles brand-new users and items.</span></li>
  </ol>
  <p><strong>Reading order:</strong> this note → Collaborative Filtering → Matrix Factorization → Ranking, Evaluation &amp; Cold Start. All four use the same CineCity ratings, so numbers can be compared across notes.</p>

  <h2 id="rs-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>The recommendation problem</b><span>Q: CineCity has thousands of films and room for ten on a phone screen. Which ten for this person? → Give every (user, film) pair a score and show the top few unseen films. But a score built from what?</span></li>
    <li><b>Feedback: explicit vs implicit</b><span>Q: what tells us what someone likes? → Ratings (rare but clear, with real dislikes) and plays, finishes, clicks (plentiful, but "no record" is not a dislike). But how do we hold millions of these signals?</span></li>
    <li><b>Interaction matrix &amp; sparsity</b><span>Q: how do we organise the signals? → A users × films table. Ours is 19 of 30 cells (63%) filled; real ones are below 1% filled and most activity sits on a few popular films. So what do we put in all those blanks?</span></li>
    <li><b>Popularity baseline</b><span>Q: what is the simplest guess for a blank? → The film's average rating, damped toward the global mean so one lucky 5 (Lagaan) cannot top the chart: 5.0 → 3.974. But every user gets the same list…</span></li>
    <li><b>Item profiles (features, TF-IDF)</b><span>Q: to personalise, how do we describe a film so films can be compared? → A vector of tags, re-weighted by TF-IDF so a tag on almost every film ("drama", in 5 of 6) counts less. But which films does Ben want?</span></li>
    <li><b>User profiles</b><span>Q: how do we describe Ben in the same terms? → A weighted average of the films he rated, liked ones pulling up and disliked ones pulling down: [0.5, 0.5, −0.5, −0.5]. But how do we compare a person with a film?</span></li>
    <li><b>Cosine similarity</b><span>Q: how close is each unseen film to Ben's taste? → The angle between the vectors: Lagaan 0.265, K3G −0.116, 3 Idiots −0.235. But is this actually better than popularity?</span></li>
    <li><b>Hold-out check</b><span>Q: does it beat the baseline on data it has not seen? → At scale, content-based RMSE 0.801 vs 0.918 for the damped popularity mean. So where does it still fail?</span></li>
    <li><b>Strengths &amp; weaknesses</b><span>Q: what can content-based filtering not do? → It handles brand-new films (Chhichhore scores 0.140 for Ben with zero ratings) but never leaves its own features: 3 Idiots scores −0.235 for Ben though the two users who share his love of Dangal rated it 4 and 5. How do we use other people's taste?</span></li>
    <li><b>Hybrids and the family</b><span>Q: how do real systems combine the pieces? → Switch, blend or cascade popularity, content and collaborative signals. The "other people" signal is the next note: <a class="xref" data-note="ml_cf">Collaborative Filtering</a>.</span></li>
  </ol>

  <h2 id="rs-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Recommenders: Basics &amp; Content-Based</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The problem</div>
        <ul>
          <li><b>Goal</b>: score (user, item) pairs, show the top-N unseen items</li>
          <li><b>Two framings</b>: rating prediction (regression) · top-N ranking</li>
          <li>Proxy (clicks, ratings) vs business goal (watch time, retention)</li>
          <li>Running example: CineCity, 5 users × 6 films, 19 ratings</li>
          <li>💡 a good shopkeeper: your history, similar items, people like you</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data</div>
        <ul>
          <li><b>Explicit</b>: ratings; rare, clear dislikes</li>
          <li><b>Implicit</b>: plays, finishes, clicks; plentiful, positive-only; weight events (play 1, finish 3)</li>
          <li><b>Interaction matrix</b> R (users × items); density = filled / total = 19/30 = 0.633</li>
          <li>Real: 0.35% filled; top 1% of items hold 42% of activity (long tail)</li>
          <li><b>CSR</b> storage: data, indices, indptr; 4.2 MB vs 0.8 GB dense</li>
          <li>⚠ missing ≠ dislike; missing is not at random</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Popularity baseline</div>
        <ul>
          <li>Count, mean, or <b>damped mean</b> (Σr + m·μ)/(n + m)</li>
          <li>Lagaan: one 5 → mean 5.0, damped (m = 3) 3.974</li>
          <li>Same list for everyone, minus what they saw</li>
          <li>Rare films: film mean RMSE 1.010, damped 0.975</li>
          <li>Hard to beat on accuracy; zero personalisation</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Item profiles</div>
        <ul>
          <li>One-hot tags [sports, drama, romance, comedy]</li>
          <li><b>TF-IDF</b>: idf = ln((1+N)/(1+df)) + 1; drama 1.154, comedy 1.847</li>
          <li>L2-normalise: Dangal → [0.804, 0.595, 0, 0]</li>
          <li>Text: TfidfVectorizer on descriptions; embeddings for meaning</li>
          <li>Item-item "more like this": Dangal → Chak De 1.0, Lagaan 0.779</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">User profile &amp; scoring</div>
        <ul>
          <li>Profile = Σ wⱼ·itemⱼ / Σ|wⱼ|, wⱼ = rating − user mean</li>
          <li>Ben: weights +1, +1, −2 → [0.5, 0.5, −0.5, −0.5]</li>
          <li><b>Cosine</b> = a·b / (‖a‖‖b‖): Lagaan 0.265, K3G −0.116, 3 Idiots −0.235</li>
          <li>Rating: weighted average of the k most similar rated films (Ben → Lagaan 5.0)</li>
          <li>Per-user ridge on features: Lagaan 4.04</li>
          <li>Scale: RMSE 0.801 vs popularity 0.918</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pros, cons, next</div>
        <ul>
          <li>✔ new items (Chhichhore 0.140), explainable, no other users needed, niche tastes</li>
          <li>✘ over-specialised (3 Idiots −0.235), new users, feature quality, no notion of "good"</li>
          <li>Hybrids: switching, weighted, cascade, feature-combination</li>
          <li>→ <a class="xref" data-note="ml_cf">Collaborative Filtering</a> uses other people</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rs-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="rs-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Recommendation Problem</span><span class="rm-sub">CineCity: 5 users, 6 films</span></div></div>
      <div class="rm-item rm-done" data-target="rs-feedback"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Explicit vs Implicit Feedback</span><span class="rm-sub">Ratings, plays, finishes</span></div></div>
      <div class="rm-item rm-done" data-target="rs-matrix"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Interaction Matrix &amp; Sparsity</span><span class="rm-sub">Density, CSR, the long tail</span></div></div>
      <div class="rm-item rm-done" data-target="rs-pop"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Popularity Baseline</span><span class="rm-sub">Count, mean, damped mean</span></div></div>
      <div class="rm-item rm-done" data-target="rs-items"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Item Profiles &amp; TF-IDF</span><span class="rm-sub">Tags, text, embeddings</span></div></div>
      <div class="rm-item rm-done" data-target="rs-profile"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">User Profiles</span><span class="rm-sub">Averages, weights, per-user models</span></div></div>
      <div class="rm-item rm-done" data-target="rs-cosine"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scoring with Cosine</span><span class="rm-sub">By hand, then for every user</span></div></div>
      <div class="rm-item rm-done" data-target="rs-check"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Does It Beat Popularity?</span><span class="rm-sub">Hold-out RMSE at scale</span></div></div>
      <div class="rm-item rm-done" data-target="rs-proscons"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Strengths &amp; Weaknesses</span><span class="rm-sub">New items yes, surprises no</span></div></div>
      <div class="rm-item rm-done" data-target="rs-family"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Hybrids &amp; the Family</span><span class="rm-sub">How the group fits together</span></div></div>
      <div class="rm-item rm-done" data-target="rs-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every quantity on CineCity</span></div></div>
      <div class="rm-item rm-done" data-target="rs-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Popularity vs content vs CF vs MF</span></div></div>
      <div class="rm-item rm-done" data-target="rs-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="rs-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="rs-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rs-problem"><span class="num">01</span>The Recommendation Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Earlier notes predicted one label for one row. A streaming app has a different job: thousands of films, millions of users, ten slots on a screen. What exactly should a model output, and from what data?</p>
  </div>
  <h3>Too much choice, too little screen</h3>
  <p>Open any streaming app, shop or music service. The catalogue holds far more items than anyone could browse, and the screen has room for perhaps ten. Without help, everyone sees the same "top 10" and most good items are never found. A <strong>recommender system</strong> guesses which few items <em>this</em> person is most likely to enjoy and fills the slots with them.</p>
  <div class="flow"><span>Huge catalogue</span><span>Score every (user, item) pair</span><span>Drop items already seen</span><span>Show the top N</span><span>Log what happens</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A good bookshop owner in College Street, Kolkata. He remembers what you bought, knows which books are alike, and notices what readers like you enjoyed. This group of notes turns those three habits into algorithms: this note does "books like the ones you bought" (content-based), the next does "readers like you" (collaborative filtering).</p>
  </div>
  <h3>The running example: CineCity</h3>
  <p>CineCity is a small streaming app. Five users have rated some of six films on a 1–5 scale. Every concept in this note (and in the next one) is computed on this one table.</p>
  <table class="tbl">
    <tr><th>Film</th><th>Short name</th><th>Genre tags</th></tr>
    <tr><td>Dangal</td><td>Dangal</td><td>sports, drama</td></tr>
    <tr><td>Chak De! India</td><td>Chak De</td><td>sports, drama</td></tr>
    <tr><td>Lagaan</td><td>Lagaan</td><td>sports, drama, romance</td></tr>
    <tr><td>Dilwale Dulhania Le Jayenge</td><td>DDLJ</td><td>romance, comedy</td></tr>
    <tr><td>Kabhi Khushi Kabhie Gham</td><td>K3G</td><td>drama, romance</td></tr>
    <tr><td>3 Idiots</td><td>3 Idiots</td><td>drama, comedy</td></tr>
  </table>
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
  <p>Read the table like a person would. Asha and Ben love the sports films and dislike DDLJ. Chen and Dia are the opposite: romance fans who rate Dangal or Chak De low. Esha rates almost everything high. Ben, our main character, has rated only three films; three are blank: Lagaan, K3G and 3 Idiots. The whole group of notes is about one question: <strong>which of those three should CineCity show Ben first, and what would he rate them?</strong></p>
  <h3>Two ways to frame the task</h3>
  <table class="tbl">
    <tr><th></th><th>Rating prediction</th><th>Top-N recommendation</th></tr>
    <tr><td>Output</td><td>a number r̂(u, i) for a blank cell, e.g. Ben → Lagaan ≈ 4.5</td><td>an ordered list of N unseen items for user u</td></tr>
    <tr><td>Like</td><td>regression</td><td>ranking</td></tr>
    <tr><td>Measured by</td><td>RMSE, MAE on hidden ratings</td><td>precision@k, recall@k, NDCG (in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>)</td></tr>
    <tr><td>Data it needs</td><td>explicit ratings</td><td>any feedback, usually implicit</td></tr>
  </table>
  <p>The two are linked: sort a user's predicted ratings and you have a top-N list. But a model can be good at one and bad at the other (getting a 2-star film's rating exactly right does not help the list), which is why modern systems optimise rankings directly. We start with predicted scores because they are easier to compute and check by hand.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>recommender system</strong> learns a scoring function s(u, i) over users u and items i and shows each user the top-N items by score, excluding items they already consumed. The <strong>proxy</strong> it optimises (ratings, clicks) stands in for the <strong>business goal</strong> (watch time, purchases, retention); the two can disagree.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Optimising the proxy alone. A model that maximises clicks can learn to show clickbait thumbnails that people abandon after a minute. Always check the business metric in an A/B test (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feedback.</b> We want a score for every (user, film) pair. The 19 star ratings are one kind of evidence, but most apps have very few ratings and lots of plays and clicks. What kinds of evidence exist, and how trustworthy is each?</div>

  <h2 id="rs-feedback"><span class="num">02</span>Explicit vs Implicit Feedback</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Only 19 ratings exist, and most users never rate anything. What other traces of taste does CineCity record, and what do they really mean?</p>
  </div>
  <h3>Two kinds of signal</h3>
  <table class="tbl">
    <tr><th></th><th>Explicit feedback</th><th>Implicit feedback</th></tr>
    <tr><td>What</td><td>ratings, likes, thumbs up/down, reviews</td><td>plays, finishes, watch time, clicks, add-to-cart, purchases, skips</td></tr>
    <tr><td>Volume</td><td>rare: few people bother to rate</td><td>plentiful: every action is logged</td></tr>
    <tr><td>Negatives</td><td>clear: 1 star means "disliked"</td><td><strong>missing</strong>: no record may mean "never saw it"</td></tr>
    <tr><td>Scale</td><td>bounded (1–5)</td><td>counts and durations: a <em>confidence</em>, not a preference</td></tr>
    <tr><td>Typical model target</td><td>predict the rating (regression)</td><td>predict "will interact" or rank (classification / ranking)</td></tr>
  </table>
  <h3>From an event log to a matrix, by hand</h3>
  <p>Implicit feedback starts life as an <strong>event log</strong>: one row per action. CineCity logs two events: <code>play</code> (pressed play) and <code>finish</code> (watched to the end). Finishing says much more than pressing play, so give play weight 1 and finish weight 3, then add up the weights per (user, film) cell. Asha played Dangal and finished it: 1 + 3 = 4. She played 3 Idiots, finished it, and played it again: 1 + 3 + 1 = 5. She played DDLJ and gave up: 1.</p>
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
  <p><code>map(weight)</code> turns each event name into its weight; <code>pivot_table(..., aggfunc="sum")</code> makes users the rows and films the columns and adds repeated events in the same cell; <code>reindex</code> keeps all six films even if nobody touched one. Only 10 of 30 cells are non-zero, fewer than the 19 ratings, because this week's log is short.</p>
  <p>Compare it with the ratings. Ben's DDLJ cell is 1 (played, abandoned) and he rated DDLJ 2: the abandoned play was really a negative signal, but in the implicit matrix it looks like a weak positive. Dia's Dangal cell is 0: she simply never pressed play, so we know <em>nothing</em> about her opinion. Implicit data mixes "dislike", "never seen" and "not yet" into the same zero.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper who only sees what you pick up, never what you looked at and put back. Picking up a packet twice is a strong hint you like it. Never picking something up could mean you dislike it or that it was on a shelf you never walked past.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Explicit feedback</strong>: a user's deliberate statement of preference (a rating). <strong>Implicit feedback</strong>: behaviour from which preference is inferred (plays, clicks, purchases); its values express <em>confidence</em> that the user likes the item and are only positive. Data is <strong>missing not at random (MNAR)</strong> when whether a cell is observed depends on its value: people mostly watch, and rate, films they expect to like.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating every 0 in an implicit matrix as a dislike. Most zeros are films the user never saw. Use <em>impressions</em> (shown but not clicked) as negatives when you have them, or give zeros a small weight; implicit-feedback matrix factorization does exactly this with confidence weights (<a class="xref" data-note="ml_mf">Matrix Factorization</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The interaction matrix.</b> Both kinds of feedback end up as a users × films table. How big and how empty is that table in real life, and how do we store and compute with it?</div>

  <h2 id="rs-matrix"><span class="num">03</span>The Interaction Matrix &amp; Sparsity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>CineCity's table is small and two-thirds full. A real app has millions of users and items. What does that table look like, and what makes it hard?</p>
  </div>
  <h3>Density and sparsity by hand</h3>
  <p>The <strong>interaction matrix</strong> R has one row per user and one column per item; cell r<sub>ui</sub> holds the feedback of user u on item i, or is blank. Its <strong>density</strong> is the share of filled cells: CineCity has 5 + 3 + 3 + 4 + 4 = 19 ratings in 5 × 6 = 30 cells, so density = 19/30 = 0.633 and <strong>sparsity</strong> = 1 − 0.633 = 0.367. That is wildly unrealistic: a real user touches a few hundred items out of millions. MovieLens-100K, the classic teaching dataset, is about 6% full; Netflix Prize data was about 1%; e-commerce click data is often below 0.01%.</p>
  <h3>Storing only what is known: CSR</h3>
  <p>A dense matrix stores every blank. <strong>Compressed sparse row (CSR)</strong> stores three short arrays: <code>data</code> (the known values, row by row), <code>indices</code> (the column of each value) and <code>indptr</code> (where each row starts in <code>data</code>). By hand for CineCity: Asha's 5 ratings are positions 0–4 (columns 0, 1, 3, 4, 5), Ben's 3 are positions 5–7 (columns 0, 1, 3), and so on, so indptr = [0, 5, 8, 11, 15, 19].</p>
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
  <p>To read Ben's row, look up indptr[1] = 5 and indptr[2] = 8: his ratings are data[5:8] = 5, 5, 2 in columns 0, 1, 3 (Dangal, Chak De, DDLJ). Nothing is stored for his blanks. Row slicing and matrix–vector products touch only the stored values, which is why every recommender library uses sparse matrices.</p>
  <h3>The same table at real scale: sparse and long-tailed</h3>
  <p>Simulate 20,000 users and 5,000 items, with item popularity following Zipf's law (the r-th most popular item is about 1/r as popular as the first), as real catalogues do:</p>
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
  <p>Only 0.35% of cells are filled, so a dense matrix (0.8 GB) would be 99.65% wasted, while CSR needs about 4 MB. And activity is concentrated: the top 1% of items take 42% of all interactions and the top 20% take 80%. The rest is the <strong>long tail</strong>: thousands of items with few interactions each. A recommender that only knows the head shows everyone the same hits; the commercial value of personalisation is mostly in the tail.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
<line x1="50" y1="160" x2="580" y2="160" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="160" stroke="currentColor"/>
<path d="M52,24 L60,70 L70,96 L85,115 L105,128 L135,138 L180,145 L250,150 L350,154 L460,156 L578,157" fill="none" class="sb" stroke-width="2.5"/>
<rect x="52" y="20" width="58" height="140" class="fb" opacity="0.25"/>
<text x="81" y="40" text-anchor="middle" font-size="10.5">head</text><text x="81" y="54" text-anchor="middle" class="tm" font-size="10">top 20% of items</text><text x="81" y="68" text-anchor="middle" class="tb" font-size="10">80% of activity</text>
<text x="360" y="120" text-anchor="middle" font-size="11">long tail: most items, few interactions each</text>
<text x="315" y="185" text-anchor="middle" class="tm" font-size="10.5">items sorted from most to least popular →</text>
<text x="20" y="95" text-anchor="middle" class="tm" font-size="10.5" transform="rotate(-90 20 95)">interactions</text>
</svg><figcaption>Zipf-shaped popularity: a short head with most of the activity, and a long tail where personalisation matters most.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>interaction (utility) matrix</strong> R ∈ ℝ<sup>|U|×|I|</sup> has r<sub>ui</sub> = feedback of user u on item i, or unknown. <strong>Density</strong> = |observed cells| / (|U|·|I|); <strong>sparsity</strong> = 1 − density. <strong>Long tail</strong>: the many low-popularity items in a heavy-tailed (often Zipf-like) popularity distribution.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling <code>.toarray()</code> or <code>.fillna(0)</code> on a real interaction matrix. 1 crore users × 10 lakh items as float64 is 80 TB. Keep it sparse end to end, and remember that a filled-in 0 silently claims "rating 0", which no user ever gave.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Popularity.</b> We now hold the data, but Ben's three blanks are still blanks. What is the simplest sensible number to put in them, the baseline any clever model must beat?</div>

  <h2 id="rs-pop"><span class="num">04</span>The Popularity Baseline</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With no idea who Ben is, what would we guess he rates Lagaan, K3G and 3 Idiots? And which film should a brand-new user see first?</p>
  </div>
  <h3>Three ways to measure "popular"</h3>
  <p>The simplest recommender ignores the user entirely and ranks items by a popularity score, then hides what each user has already seen. Three candidate scores, by hand on CineCity:</p>
  <table class="tbl">
    <tr><th>Film</th><th>ratings n</th><th>sum</th><th>mean = sum/n</th><th>damped, m = 3: (sum + 3 × 3.632)/(n + 3)</th></tr>
    <tr><td>Dangal</td><td>4</td><td>5 + 5 + 2 + 5 = 17</td><td>4.250</td><td>(17 + 10.895)/7 = <strong>3.985</strong></td></tr>
    <tr><td>Chak De</td><td>3</td><td>4 + 5 + 1 = 10</td><td>3.333</td><td>(10 + 10.895)/6 = 3.482</td></tr>
    <tr><td>Lagaan</td><td>1</td><td>5</td><td><strong>5.000</strong></td><td>(5 + 10.895)/4 = 3.974</td></tr>
    <tr><td>DDLJ</td><td>4</td><td>1 + 2 + 5 + 4 = 12</td><td>3.000</td><td>(12 + 10.895)/7 = 3.271</td></tr>
    <tr><td>K3G</td><td>4</td><td>1 + 5 + 5 + 3 = 14</td><td>3.500</td><td>(14 + 10.895)/7 = 3.556</td></tr>
    <tr><td>3 Idiots</td><td>3</td><td>4 + 2 + 5 = 11</td><td>3.667</td><td>(11 + 10.895)/6 = 3.649</td></tr>
  </table>
  <p><strong>Count</strong> (how many people rated it) favours films that are watched a lot, liked or not: DDLJ ties for first with 4 ratings although its mean is the lowest. <strong>Mean rating</strong> puts Lagaan first on the strength of a single 5 from Esha, who rates everything high. Neither is right. The fix is the <strong>damped mean</strong> (also called the Bayesian average): pretend every film starts with m extra "virtual" ratings equal to the global mean μ, here μ = 69/19 = 3.632 and m = 3. A film with many ratings barely moves; a film with one rating is pulled most of the way back to 3.632. Lagaan drops from 5.000 to 3.974, just behind Dangal's 3.985.</p>
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
  <p>The code reproduces every column. With m = 2 Lagaan would still edge Dangal (4.088 vs 4.044), with m = 3 it drops to second: m is a knob that says "how many ratings before I trust a film's own average". IMDb's Top 250 uses exactly this formula with m in the tens of thousands.</p>
  <h3>Why the damped mean works</h3>
  <p>Rewrite it as a weighted average of the film's own mean x̄ and the global mean μ:</p>
  <p style="text-align:center">(Σr + mμ)/(n + m) = (n/(n + m))·x̄ + (m/(n + m))·μ</p>
  <p>For Lagaan, n/(n + m) = 1/4: trust its own mean 25%, the global mean 75%. For Dangal, 4/7 = 57%. This is <strong>shrinkage</strong>: an estimate from little data is noisy, so shrink it toward a safer value. It is the same idea as ridge regularisation (<a class="xref" data-note="ml_regularization">Regularization</a>) and as Bayesian estimation with a prior worth m observations (<a class="xref" data-note="st_probability">Probability</a>). We will meet it again in the next note as "significance weighting" of similarities.</p>
  <h3>The popularity recommender</h3>
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
  <p>Every user gets the same ranking (Dangal, Lagaan, 3 Idiots, K3G, Chak De, DDLJ) with their own films removed. Ben is offered Lagaan then 3 Idiots; so is Chen, although Chen is a romance fan who gave Dangal a 2. Asha has only one unseen film. That is the definition of non-personalised.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The "bestsellers" table at the front of a bookshop. It is a good guess for a stranger and a terrible guess for a regular whose taste you know.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>popularity baseline</strong> scores every item by a user-independent statistic. The <strong>damped (Bayesian) mean</strong> of item i is (Σ<sub>u</sub> r<sub>ui</sub> + m·μ)/(n<sub>i</sub> + m), where n<sub>i</sub> is its number of ratings, μ the global mean and m ≥ 0 the prior strength. Its user-aware cousin, the <strong>baseline predictor</strong> r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub>, adds a damped user offset b<sub>u</sub> (strict or generous rater) to the item offset b<sub>i</sub>; it appears in the next two notes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Dismissing popularity because it is "dumb". On accuracy metrics it is often embarrassingly hard to beat, especially for users with little history, and it is what a brand-new user should see. Always report it next to your model; if your model does not clearly win, something is wrong.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Item profiles.</b> Popularity says nothing about Ben. To personalise, we need to know <em>what</em> Ben liked about Dangal and Chak De. Step one is describing every film as numbers that can be compared.</div>

  <h2 id="rs-items"><span class="num">05</span>Item Profiles: Features &amp; TF-IDF</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben loved Dangal and Chak De. To find "more like these" we must be able to say how alike two films are. How do we turn a film into a vector?</p>
  </div>
  <h3>Step 1: one-hot genre tags</h3>
  <p>The simplest <strong>item profile</strong> is a 0/1 vector of tags. Use four tags: [sports, drama, romance, comedy].</p>
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
  <p>Dangal and Chak De have identical vectors [1, 1, 0, 0]. Count how many films carry each tag (the <strong>document frequency</strong>, df): sports 3, drama 5, romance 3, comedy 2. "Drama" is on five of the six films, so sharing it says almost nothing; sharing "comedy" (only two films) says much more.</p>
  <h3>Step 2: TF-IDF weighting, by hand</h3>
  <p>TF-IDF, borrowed from search engines (<a class="xref" data-note="nlp">NLP Foundations</a>), multiplies each tag by how rare it is. Term frequency (tf) is 1 if the film has the tag. Inverse document frequency (idf) is large for rare tags. The textbook form is idf = log(N/df) with N = 6 films: drama = ln(6/5) = 0.182, comedy = ln(6/2) = 1.099. scikit-learn uses a smoothed form that never reaches zero:</p>
  <p style="text-align:center">idf(t) = ln((1 + N)/(1 + df(t))) + 1</p>
  <table class="tbl">
    <tr><th>Tag</th><th>df</th><th>ln(7/(1 + df)) + 1</th></tr>
    <tr><td>sports</td><td>3</td><td>ln(7/4) + 1 = 0.5596 + 1 = 1.5596</td></tr>
    <tr><td>drama</td><td>5</td><td>ln(7/6) + 1 = 0.1542 + 1 = 1.1542</td></tr>
    <tr><td>romance</td><td>3</td><td>1.5596</td></tr>
    <tr><td>comedy</td><td>2</td><td>ln(7/3) + 1 = 0.8473 + 1 = 1.8473</td></tr>
  </table>
  <p>Dangal becomes [1.5596, 1.1542, 0, 0]. Finally <strong>L2-normalise</strong> (divide by the length) so long tag lists do not dominate: length = √(1.5596² + 1.1542²) = √(2.4324 + 1.3322) = √3.7646 = 1.9403, so Dangal = [0.804, 0.595, 0, 0]. Lagaan [1.5596, 1.1542, 1.5596, 0] has length √6.1968 = 2.4893 → [0.627, 0.464, 0.627, 0].</p>
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
  <p>Every row matches the hand values and sklearn's <code>TfidfTransformer</code> exactly. Notice how drama, the common tag, now carries less weight than the rarer tag in every film that has both (3 Idiots: drama 0.530, comedy 0.848).</p>
  <h3>Step 3: text descriptions and "more like this"</h3>
  <p>Hand tags are coarse. Most catalogues also have text: a synopsis, cast, keywords. <code>TfidfVectorizer</code> does tokenising, stop-word removal and TF-IDF in one step, giving a sparse film × word matrix. Item-to-item cosine similarity on it powers "more like this" rows.</p>
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
  <p>Both representations agree that Chak De and Lagaan are most like Dangal and DDLJ least. But the text similarities are tiny (0.129) because six one-line synopses share only a few words ("sports", "drama"). Word-count features cannot tell that "wrestling" and "hockey" are both sports. That is why modern systems use <strong>embeddings</strong>: a pretrained language or image model maps each synopsis or poster to a dense vector in which similar meanings are nearby (<a class="xref" data-note="nlp">NLP Foundations</a>, <a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>). The recipe that follows stays the same whatever the vectors are.</p>
  <h3>Other features</h3>
  <ul>
    <li><strong>Categorical</strong>: language, director, studio → one-hot (or hashed for huge vocabularies; <a class="xref" data-note="ml_features">Feature Engineering</a>).</li>
    <li><strong>Numeric</strong>: year, runtime, price → scale them first, or one column with large numbers swamps the cosine.</li>
    <li><strong>Embeddings</strong>: text, image, audio models; also learned item embeddings from interaction data (<a class="xref" data-note="ml_mf">Matrix Factorization</a>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>item profile</strong> is a feature vector xᵢ describing item i. With <strong>TF-IDF</strong>, the weight of feature t in item i is tf(t, i) · idf(t), idf(t) = ln((1 + N)/(1 + df(t))) + 1 in sklearn's smoothed form (log(N/df) in the textbook form), followed by L2 normalisation so ‖xᵢ‖ = 1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing feature types without scaling or weighting. One-hot genres (0/1) next to "year" (≈ 2000) make every film look alike except by year. Scale numeric columns, and decide consciously how much each feature group should count.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: User profiles.</b> Films are now vectors. But a recommendation compares a film with a <em>person</em>. How do we put Ben in the same space?</div>

  <h2 id="rs-profile"><span class="num">06</span>User Profiles</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can describe Lagaan as [0.627, 0.464, 0.627, 0]. What vector describes Ben, built only from his three ratings: Dangal 5, Chak De 5, DDLJ 2?</p>
  </div>
  <h3>Three recipes, by hand on plain tags</h3>
  <p>A <strong>user profile</strong> is a vector in the same feature space as the items, summarising what the user likes. Using plain 0/1 tags first, so the arithmetic is easy:</p>
  <table class="tbl">
    <tr><th>Recipe</th><th>Weights on Dangal, Chak De, DDLJ</th><th>Computation</th><th>Profile [sports, drama, romance, comedy]</th></tr>
    <tr><td>1. Average of liked films (rating ≥ 4)</td><td>keep Dangal, Chak De</td><td>([1,1,0,0] + [1,1,0,0])/2</td><td>[1, 1, 0, 0]</td></tr>
    <tr><td>2. Rating-weighted average</td><td>5, 5, 2 (sum 12)</td><td>(5·[1,1,0,0] + 5·[1,1,0,0] + 2·[0,0,1,1])/12</td><td>[0.833, 0.833, 0.167, 0.167]</td></tr>
    <tr><td>3. Mean-centred weights</td><td>5 − 4, 5 − 4, 2 − 4 = +1, +1, −2</td><td>(1·[1,1,0,0] + 1·[1,1,0,0] − 2·[0,0,1,1])/(1 + 1 + 2)</td><td>[0.5, 0.5, −0.5, −0.5]</td></tr>
  </table>
  <p>Recipe 1 throws away the dislike. Recipe 2 is worse: a 2-star rating still <em>adds</em> romance and comedy, because every rating is positive. Recipe 3 subtracts Ben's own average (4) first, so a rating above his usual pulls the profile toward that film and a rating below pushes it away. This is the same mean-centring that collaborative filtering depends on in the next note. (Historically it is the <strong>Rocchio</strong> method from information retrieval: move the query toward relevant documents and away from irrelevant ones.)</p>
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
  <h3>The profile as a model: one regression per user</h3>
  <p>A profile is a hand-made summary. The alternative is to <em>learn</em> how much Ben likes each feature: fit a small regression of his ratings on the film vectors, one model per user. With three ratings and four features it is underdetermined, so ridge regularisation (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>) keeps the weights small:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Ridge
Xb, yb = W.loc[ben.index].values, ben.values
model = Ridge(alpha=1.0).fit(Xb, yb)
print("Ben's weight per tag:", {t: round(float(c), 3) for t, c in zip(tags, model.coef_)},
      " intercept", round(float(model.intercept_), 3))
print("predicted ratings:", {f: round(float(p), 2) for f, p in zip(unseen, model.predict(W.loc[unseen].values))})</div>
  <div class="fx" data-lang="text">Ben's weight per tag: {'sports': 0.689, 'drama': 0.51, 'romance': -0.553, 'comedy': -0.655}  intercept 3.714
predicted ratings: {'Lagaan': 4.04, 'K3G': 3.57, '3 Idiots': 3.43}</div>
  <p>The learned weights have the same signs as the centred profile: + for sports and drama, − for romance and comedy. Predicted ratings: Lagaan 4.04, K3G 3.57, 3 Idiots 3.43. The intercept 3.714 is close to Ben's mean and, with three ratings, ridge pulls everything toward it. A per-user model can capture interactions and calibrated ratings, and can be any classifier (logistic regression on "liked / not", naive Bayes on text) but it needs enough ratings per user; with few, the simple profile is as good.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>user profile</strong> of u is p<sub>u</sub> = Σ<sub>j∈I<sub>u</sub></sub> w<sub>uj</sub> x<sub>j</sub> / Σ<sub>j</sub> |w<sub>uj</sub>|, with I<sub>u</sub> the items u rated, x<sub>j</sub> their profiles and w<sub>uj</sub> = r<sub>uj</sub> − r̄<sub>u</sub> (mean-centred; other choices: 1 for liked items, or r<sub>uj</sub>). The <strong>model-based</strong> alternative fits r<sub>uj</sub> ≈ θ<sub>u</sub>·x<sub>j</sub> + b<sub>u</sub> per user with regularisation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Averaging raw ratings or all watched items into the profile. Everything a user touched pulls the profile toward it, including the films they hated. Centre ratings, or use only clearly positive interactions for implicit data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cosine similarity.</b> Ben is now a vector in the same space as the films. How do we turn "Ben's vector" and "Lagaan's vector" into one score?</div>

  <h2 id="rs-cosine"><span class="num">07</span>Scoring with Cosine Similarity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben = [0.5, 0.5, −0.5, −0.5]; Lagaan = [1, 1, 1, 0]. How similar are they, as one number, and which unseen film should come first?</p>
  </div>
  <h3>Cosine by hand</h3>
  <p><strong>Cosine similarity</strong> is the dot product divided by both lengths: the cosine of the angle between the vectors (<a class="xref" data-note="ml_clustering">Clustering: The Idea &amp; Distances</a>). 1 = same direction, 0 = nothing in common, −1 = opposite.</p>
  <p style="text-align:center">cos(p, x) = (p · x) / (‖p‖ ‖x‖)</p>
  <p>Ben's centred profile has length √(4 × 0.25) = 1. With plain tags:</p>
  <table class="tbl">
    <tr><th>Unseen film</th><th>vector</th><th>p · x</th><th>‖x‖</th><th>cosine</th></tr>
    <tr><td>Lagaan</td><td>[1, 1, 1, 0]</td><td>0.5 + 0.5 − 0.5 + 0 = 0.5</td><td>√3 = 1.732</td><td>0.5 / (1 × 1.732) = <strong>0.289</strong></td></tr>
    <tr><td>K3G</td><td>[0, 1, 1, 0]</td><td>0 + 0.5 − 0.5 = 0</td><td>√2 = 1.414</td><td>0</td></tr>
    <tr><td>3 Idiots</td><td>[0, 1, 0, 1]</td><td>0.5 − 0.5 = 0</td><td>1.414</td><td>0</td></tr>
  </table>
  <p>With the "liked average" profile [1, 1, 0, 0] instead, the scores would be Lagaan 2/(√2·√3) = 0.816, K3G and 3 Idiots 1/(√2·√2) = 0.5: the same order, but K3G (a romance Ben has reason to dislike) would look half-good.</p>
  <div class="fx" data-lang="py">def cos(a, b): return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
unseen = R.columns[R.loc["Ben"].isna()]
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
  <p>Why cosine and not the raw dot product or Euclidean distance? The dot product grows with vector length, so a film with many tags (Lagaan has three) wins just for having more tags. Euclidean distance on the liked-average profile gives the same order here, but it is sensitive to vector lengths too, and it cannot express "opposite" the way a negative cosine can. Cosine looks only at direction: <em>what mix</em> of features, not how many.</p>
  <h3>Now with TF-IDF vectors</h3>
  <p>Build the same centred profile from the TF-IDF film vectors: sports = (0.804 + 0.804)/4 = 0.402, drama = (0.595 + 0.595)/4 = 0.297, romance = −2 × 0.645/4 = −0.323, comedy = −2 × 0.764/4 = −0.382. Its length is √0.5 = 0.707. Cosine with Lagaan [0.627, 0.464, 0.627, 0]: dot = 0.402 × 0.627 + 0.297 × 0.464 − 0.323 × 0.627 = 0.252 + 0.138 − 0.202 = 0.188, divided by 0.707 × 1 = <strong>0.265</strong>. With 3 Idiots [0, 0.530, 0, 0.848]: dot = 0.158 − 0.324 = −0.166 → <strong>−0.235</strong>.</p>
  <div class="fx" data-lang="py">p_c_w = (W.loc[ben.index].T @ w) / w.abs().sum()      # centred profile, built from TF-IDF film vectors
scores = W.loc[unseen] @ p_c_w / (np.linalg.norm(W.loc[unseen], axis=1) * np.linalg.norm(p_c_w))
print("Ben's TF-IDF profile:", p_c_w.round(3).to_dict())
print("cosine to unseen films:", scores.sort_values(ascending=False).round(3).to_dict())</div>
  <div class="fx" data-lang="text">Ben's TF-IDF profile: {'sports': 0.402, 'drama': 0.297, 'romance': -0.323, 'comedy': -0.382}
cosine to unseen films: {'Lagaan': 0.265, 'K3G': -0.116, '3 Idiots': -0.235}</div>
  <p>TF-IDF separates the three films that plain tags tied: K3G and 3 Idiots are now negative, and 3 Idiots, with the rare "comedy" tag Ben disliked in DDLJ, is last. Ben's content-based list: <strong>Lagaan, K3G, 3 Idiots</strong>.</p>
  <h3>Every user's list</h3>
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
  <p>Each list is now personal: Chen (romance fan) is offered 3 Idiots first and Chak De last; Esha gets Chak De. Compare with popularity in section 04, which gave Ben and Chen the identical list. Note that the scores are similarities, not ratings: Asha's 0.054 does not mean she will rate Lagaan badly.</p>
  <h3>From similarity to a predicted rating</h3>
  <p>If we need a rating, use item-to-item content similarity: predict Ben's rating of a film as the similarity-weighted average of his ratings on the k most similar films he has rated. For Lagaan with k = 2, the most similar rated films are Dangal (0.779) and Chak De (0.779), both rated 5: (0.779 × 5 + 0.779 × 5)/(0.779 + 0.779) = <strong>5.0</strong>.</p>
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
  <p>This is K-nearest neighbours regression (<a class="xref" data-note="ml_knn">K-Nearest Neighbors</a>) where "nearest" is measured in feature space and the training set is one user's own ratings.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A friend who knows you love sports dramas suggests another sports drama. Good guess. But he will never suggest a college comedy, because nothing about it looks like a sports drama.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Content-based filtering</strong> scores item i for user u by s(u, i) = cos(p<sub>u</sub>, x<sub>i</sub>), or predicts r̂<sub>ui</sub> = Σ<sub>j∈N<sub>k</sub>(i)</sub> sim(i, j) r<sub>uj</sub> / Σ<sub>j</sub> |sim(i, j)| over the k items rated by u most similar in feature space. It uses only item features and the target user's own history.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to remove already-seen items before taking the top N. The films most similar to Ben's profile are Dangal and Chak De, which he has already watched. Filter seen (and unavailable) items first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A hold-out check.</b> Content-based scores look sensible on five users. But "looks sensible" is not evidence. Does it actually predict ratings it has not seen better than popularity does?</div>

  <h2 id="rs-check"><span class="num">08</span>Does It Beat Popularity?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>CineCity's 19 ratings are too few to measure anything. On a realistic amount of data, does content-based filtering predict hidden ratings better than the popularity baseline, and for which films does the damped mean matter?</p>
  </div>
  <h3>The hold-out idea</h3>
  <p>Hide some known ratings, train on the rest, predict the hidden ones, and measure the error with RMSE (root mean squared error; <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>). This is the train/test split of <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a> applied to cells of a matrix. The details (random vs time-based vs per-user splits) are in the next note.</p>
  <h3>CineCity at scale</h3>
  <p>We simulate a bigger CineCity: 1,000 users and 1,000 films. Every film has genre tags plus two hidden traits that no tag records (think star power or a director's style). Every user has a taste for both, some users rate generously, some films are better than others, popularity is long-tailed, and people mostly watch films they expect to like. Then we hide a random 20% of ratings.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import Ridge
def make_ratings(n_users=1000, n_items=1000, per_user=50, seed=0):
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
print(f"{big.user.nunique()} users, {big.item.nunique()} films rated, {len(big):,} ratings, "
      f"density {len(big) / 1e6:.4f}")
test = np.random.default_rng(1).random(len(big)) &lt; 0.2        # hide 20% of ratings
tr, te = big[~test], big[test]
y = te.rating.values
def rmse(p): return np.sqrt(np.mean((np.asarray(p) - y) ** 2))

mu = tr.rating.mean()
ist = tr.groupby("item").rating.agg(["sum", "count"])
n_tr = ist["count"].reindex(te.item).fillna(0).values
item_mean = (ist["sum"] / ist["count"]).reindex(te.item).fillna(mu).values
damped5 = ((ist["sum"] + 5 * mu) / (ist["count"] + 5)).reindex(te.item).fillna(mu).values

Wb = TfidfTransformer().fit_transform(big_tags).toarray()     # TF-IDF film profiles
user_mean, models = {}, {}
for u, g in tr.groupby("user"):                               # one small ridge model per user
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
  <div class="fx" data-lang="text">1000 users, 1000 films rated, 50,186 ratings, density 0.0502
predictor                       RMSE all  RMSE rare films
global mean                        1.007            1.048
film mean (popularity)             0.921            1.010
damped film mean, m=5              0.918            0.975
user mean                          0.859            0.952
content-based (per-user ridge)     0.801            0.833
test ratings: 10,004, of which on rare films (&lt;5 training ratings): 78</div>
  <p>Read the table from top to bottom. The global mean (1.007) knows nothing. The film mean (0.921) helps, but on <strong>rare films</strong> (fewer than 5 training ratings) it barely beats the global mean (1.010 vs 1.048) because an average of two or three ratings is noisy, while the damped mean is the best popularity score there (0.975): exactly the Lagaan effect from section 04. The user mean (0.859) is better still, because people differ more than films in how they use the scale. Content-based filtering, a user mean plus a ridge model on each user's TF-IDF tags, is clearly best at 0.801, and keeps its lead on rare films (0.833), because it needs no ratings of a film to score it.</p>
  <p>It does not reach the noise floor, though: the tags explain the genre part of taste and nothing of the hidden traits. That missing part is what the next note's collaborative filtering can learn from other users, since it never needs to know what the traits are.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RMSE</strong> = √(mean of (r̂ − r)²) over held-out ratings; <strong>MAE</strong> = mean of |r̂ − r|. A <strong>hold-out</strong> (offline) evaluation hides known interactions and checks how well they are recovered; an online evaluation (A/B test) measures what real users do.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Evaluating on the same ratings you used to build the profiles. Every method looks brilliant on its own training cells. Split first, build profiles and statistics only from the training part.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Strengths and weaknesses.</b> Content-based filtering wins on accuracy here. What can it do that nothing else can, and what can it never do, whatever the data size?</div>

  <h2 id="rs-proscons"><span class="num">09</span>Strengths &amp; Weaknesses</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Content-based filtering beat popularity. But it only knows features. What happens with a brand-new film, a brand-new user, and a film Ben would love whose features look wrong?</p>
  </div>
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
  <h3>Strengths</h3>
  <ul>
    <li><strong>New items work immediately.</strong> Chhichhore (sports, drama, comedy) has zero ratings, yet it already scores 0.140 for Ben and −0.434 for Dia. Collaborative methods cannot score it at all until people rate it (the <em>item cold-start</em> problem, <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>).</li>
    <li><strong>No other users needed.</strong> Works for the first user of a new app and for niche tastes nobody shares.</li>
    <li><strong>Explainable.</strong> "Because you liked Dangal and Chak De (sports)" is a reason a user can read and a regulator can audit.</li>
    <li><strong>Privacy-friendly.</strong> It uses only the user's own history.</li>
  </ul>
  <h3>Weaknesses</h3>
  <ul>
    <li><strong>Over-specialisation (filter bubble).</strong> 3 Idiots scores −0.235 for Ben, last on his list, because its features (drama, comedy) match his dislike of DDLJ. Yet Asha and Esha, the two other users who rated Dangal 5, rated 3 Idiots 4 and 5. Content can only recommend more of what Ben has already seen; it never surprises (no <em>serendipity</em>).</li>
    <li><strong>New users.</strong> A user with no ratings has no profile. Content-based filtering needs an onboarding quiz or a popularity fallback.</li>
    <li><strong>Only as good as the features.</strong> Dangal and Chak De have the same tags (similarity 1.0), but their mean ratings are 4.25 and 3.33. Tags describe <em>what</em> a film is, not <em>how good</em> it is, and they miss the hidden traits (section 08).</li>
    <li><strong>Feature engineering cost.</strong> Tags must be created, kept consistent, and extended for every new item type; text features miss meaning without embeddings.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A music app that learned you like Arijit Singh and now plays only Arijit Singh. It never learns that people with your exact taste are all listening to a new indie band.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Over-specialisation</strong>: recommending only items similar in features to the user's history. <strong>Serendipity</strong>: recommending relevant items the user would not have found or expected. <strong>Cold start</strong>: too little interaction history for a user or item.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Judging a recommender only by accuracy on held-out ratings. A content-based list of five near-identical sports films can score well and still bore Ben. Diversity, novelty and coverage are measured in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Hybrids and the family.</b> Popularity serves strangers, content serves new items, and neither uses the most valuable signal: what people with similar taste did. How do real systems put the pieces together?</div>

  <h2 id="rs-family"><span class="num">10</span>Hybrids &amp; the Recommender Family</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have two methods with opposite strengths. How do production systems combine them, and where do the remaining notes of this group come in?</p>
  </div>
  <h3>The family of methods</h3>
  <table class="tbl">
    <tr><th>Family</th><th>Uses</th><th>Ben's top pick</th><th>Note</th></tr>
    <tr><td>Popularity</td><td>counts / damped means</td><td>Lagaan (3.974)</td><td>this note</td></tr>
    <tr><td>Content-based</td><td>item features + Ben's history</td><td>Lagaan (cos 0.265)</td><td>this note</td></tr>
    <tr><td>Collaborative filtering (neighbourhood)</td><td>the rating matrix only: similar users or items</td><td>3 Idiots (4.744)</td><td><a class="xref" data-note="ml_cf">Collaborative Filtering</a></td></tr>
    <tr><td>Matrix factorization</td><td>the rating matrix, compressed to taste vectors</td><td>(see note)</td><td><a class="xref" data-note="ml_mf">Matrix Factorization</a></td></tr>
    <tr><td>Learning to rank, two-stage systems</td><td>all of the above as features</td><td>(see note)</td><td><a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a></td></tr>
  </table>
  <p>The 4.744 for 3 Idiots is computed by hand in the next note: Ben's most similar users rated it above their own averages. It is the film content-based filtering ranked last.</p>
  <h3>Four ways to build a hybrid</h3>
  <table class="tbl">
    <tr><th>Hybrid type</th><th>How</th><th>CineCity example</th></tr>
    <tr><td><strong>Switching</strong></td><td>choose a method per situation</td><td>new user Farhan with 0 ratings → popularity (Dangal, Lagaan); after he rates Dangal 5 → content-based</td></tr>
    <tr><td><strong>Weighted</strong></td><td>blend scores: s = α·s₁ + (1 − α)·s₂ (after putting them on one scale)</td><td>0.5 × content + 0.5 × collaborative score, α tuned on a hold-out</td></tr>
    <tr><td><strong>Cascade</strong></td><td>one method shortlists, the next reorders</td><td>content retrieves "sports or drama", collaborative filtering ranks the shortlist</td></tr>
    <tr><td><strong>Feature combination</strong></td><td>one model with all signals as inputs</td><td>a gradient-boosted ranker with tags, popularity and CF scores as features (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>)</td></tr>
  </table>
  <p>Large systems (YouTube, Netflix, Flipkart) are feature-combination hybrids inside a two-stage pipeline: cheap retrieval from several sources, then one ranking model that sees everything (<a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>hybrid recommender</strong> combines two or more recommendation methods (switching, weighted, cascade, feature combination, or meta-level) to offset each method's weaknesses, typically content or popularity for cold users and items and collaborative signals for warm ones.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Blending scores on different scales: cosine (−1 to 1), predicted ratings (1 to 5) and counts (0 to thousands). Convert each to ranks or standardise them before a weighted blend, or the method with the biggest numbers silently wins.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have built a dozen quantities on one table. How does each one grow out of the previous, and which answers which question?</div>

  <h2 id="rs-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Feedback, matrix, density, damped mean, TF-IDF, profile, cosine, RMSE: separate facts, or one pipeline?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="rs-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">feedback</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="10">ratings · plays (1) · finish (3)</text>
<line x1="160" y1="32" x2="193" y2="32" stroke="currentColor" marker-end="url(#rs-a9)"/>
<rect x="195" y="10" width="170" height="44" rx="7" class="fb sb"/><text x="280" y="29" text-anchor="middle" font-size="11.5" font-weight="700">interaction matrix R</text><text x="280" y="45" text-anchor="middle" class="tm" font-size="10">19/30 filled · CSR · long tail</text>
<line x1="280" y1="54" x2="120" y2="96" stroke="currentColor" marker-end="url(#rs-a9)"/><line x1="320" y1="54" x2="430" y2="96" stroke="currentColor" marker-end="url(#rs-a9)"/>
<rect x="10" y="98" width="220" height="44" rx="7" class="ft st"/><text x="120" y="117" text-anchor="middle" font-size="11.5" font-weight="700">popularity: damped mean</text><text x="120" y="133" text-anchor="middle" class="tm" font-size="10">(Σr + mμ)/(n + m): Lagaan 5.0 → 3.974</text>
<rect x="390" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="465" y="29" text-anchor="middle" font-size="11.5" font-weight="700">item features</text><text x="465" y="45" text-anchor="middle" class="tm" font-size="10">tags · text · embeddings</text>
<line x1="465" y1="54" x2="520" y2="96" stroke="currentColor" marker-end="url(#rs-a9)"/>
<rect x="320" y="98" width="160" height="44" rx="7" class="ft st"/><text x="400" y="117" text-anchor="middle" font-size="11.5" font-weight="700">ratings − user mean</text><text x="400" y="133" text-anchor="middle" class="tm" font-size="10">Ben: +1, +1, −2</text>
<rect x="490" y="98" width="180" height="44" rx="7" class="ft st"/><text x="580" y="117" text-anchor="middle" font-size="11.5" font-weight="700">TF-IDF item profiles</text><text x="580" y="133" text-anchor="middle" class="tm" font-size="10">idf · L2-norm: Dangal [.804 .595 0 0]</text>
<line x1="400" y1="142" x2="470" y2="176" stroke="currentColor" marker-end="url(#rs-a9)"/><line x1="580" y1="142" x2="510" y2="176" stroke="currentColor" marker-end="url(#rs-a9)"/>
<rect x="380" y="178" width="220" height="44" rx="7" class="fg sg"/><text x="490" y="197" text-anchor="middle" font-size="11.5" font-weight="700">user profile</text><text x="490" y="213" text-anchor="middle" class="tm" font-size="10">Σ w·x / Σ|w| = [.402 .297 −.323 −.382]</text>
<line x1="490" y1="222" x2="490" y2="254" stroke="currentColor" marker-end="url(#rs-a9)"/>
<rect x="380" y="256" width="220" height="44" rx="7" class="fg sg"/><text x="490" y="275" text-anchor="middle" font-size="11.5" font-weight="700">cosine score → top-N</text><text x="490" y="291" text-anchor="middle" class="tm" font-size="10">Lagaan .265 · K3G −.116 · 3 Idiots −.235</text>
<line x1="120" y1="142" x2="200" y2="254" stroke="currentColor" marker-end="url(#rs-a9)"/><line x1="380" y1="278" x2="312" y2="278" stroke="currentColor" marker-end="url(#rs-a9)"/>
<rect x="90" y="256" width="220" height="44" rx="7" class="fr sr"/><text x="200" y="275" text-anchor="middle" font-size="11.5" font-weight="700">hold-out RMSE</text><text x="200" y="291" text-anchor="middle" class="tm" font-size="10">popularity .918 vs content .801</text>
<text x="340" y="322" text-anchor="middle" class="tm" font-size="10.5">gap left: other users' taste (3 Idiots) → Collaborative Filtering</text>
</svg><figcaption>Two pipelines grow from one matrix. Popularity uses only column statistics. Content-based filtering mean-centres Ben's row, combines it with TF-IDF item profiles into a user profile, and scores unseen films by cosine. Both are judged by the same hold-out RMSE.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the CineCity running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>CineCity value</th><th>Weak spot</th><th>Use when</th></tr>
    <tr><td>Explicit feedback</td><td>user statements</td><td>what do they say they like?</td><td>19 ratings, 1–5</td><td>rare, biased toward watched films</td><td>rating prediction</td></tr>
    <tr><td>Implicit feedback</td><td>event log × weights</td><td>what do they do?</td><td>Asha 3 Idiots: 1 + 3 + 1 = 5</td><td>no negatives</td><td>almost always available</td></tr>
    <tr><td>Interaction matrix</td><td>feedback per (user, item)</td><td>how do we hold it?</td><td>5 × 6, density 0.633</td><td>almost empty in reality</td><td>always (sparse)</td></tr>
    <tr><td>Damped mean</td><td>column sum, count, global mean</td><td>what is a safe guess?</td><td>Lagaan 5.0 → 3.974</td><td>same for everyone</td><td>new users, baseline</td></tr>
    <tr><td>TF-IDF item profile</td><td>tags × idf, L2-normalised</td><td>how do films compare?</td><td>Dangal [0.804, 0.595, 0, 0]</td><td>needs good features</td><td>"more like this", new items</td></tr>
    <tr><td>Centred weights</td><td>rating − user mean</td><td>liked or disliked, for this user?</td><td>Ben +1, +1, −2</td><td>noisy with few ratings</td><td>profiles (and CF next)</td></tr>
    <tr><td>User profile</td><td>weighted average of item profiles</td><td>what does Ben like?</td><td>[0.402, 0.297, −0.323, −0.382]</td><td>no profile for new users</td><td>content-based scoring</td></tr>
    <tr><td>Cosine similarity</td><td>dot / lengths</td><td>how close is a film to Ben?</td><td>Lagaan 0.265, 3 Idiots −0.235</td><td>ignores quality</td><td>ranking candidates</td></tr>
    <tr><td>Content kNN rating</td><td>item similarities × Ben's ratings</td><td>what would Ben rate it?</td><td>Lagaan 5.0</td><td>needs similar rated films</td><td>rating prediction</td></tr>
    <tr><td>Per-user ridge</td><td>features → ratings, one model per user</td><td>learned taste weights?</td><td>Lagaan 4.04</td><td>needs many ratings per user</td><td>active users</td></tr>
    <tr><td>Hold-out RMSE</td><td>hidden ratings</td><td>does it work?</td><td>0.918 (pop) vs 0.801 (content)</td><td>offline ≠ online</td><td>every model comparison</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a recommender fills the blanks of a sparse user × item matrix; popularity fills them from the item's column, content-based filtering from the user's own row translated into item features.</strong> Neither looks at other users' rows, and that is exactly what the next note adds.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> How do these methods stack up, side by side, against the methods of the next notes?</div>

  <h2 id="rs-compare"><span class="num">12</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When should you reach for popularity, content-based filtering, collaborative filtering or matrix factorization?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Popularity</th><th>Content-based</th><th><a class="xref" data-note="ml_cf">Collaborative filtering</a></th><th><a class="xref" data-note="ml_mf">Matrix factorization</a></th></tr>
    <tr><td>Uses</td><td>item statistics</td><td>item features + own history</td><td>the rating matrix (neighbours)</td><td>the rating matrix (latent factors)</td></tr>
    <tr><td>Personalised</td><td>no</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>New item</td><td>after a few ratings</td><td><strong>immediately</strong></td><td>no</td><td>no (unless features added)</td></tr>
    <tr><td>New user</td><td><strong>yes</strong></td><td>after a few ratings</td><td>after a few ratings</td><td>after a few ratings</td></tr>
    <tr><td>Surprises (serendipity)</td><td>no</td><td>no</td><td>yes</td><td>yes</td></tr>
    <tr><td>Explainable</td><td>"trending"</td><td>"because you liked X (sports)"</td><td>"people like you liked X"</td><td>hard</td></tr>
    <tr><td>Needs</td><td>nothing</td><td>good features</td><td>overlapping ratings</td><td>enough ratings to fit factors</td></tr>
    <tr><td>Ben's top pick</td><td>Lagaan</td><td>Lagaan</td><td>3 Idiots</td><td>see that note</td></tr>
  </table>
  <p>Rule of thumb: start with popularity as the baseline and fallback, add content-based filtering when items have rich features or arrive constantly (news, jobs, classifieds), add collaborative methods once you have lots of overlapping interactions, and combine them in a hybrid.</p>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_cf">Collaborative Filtering</a>.</b> Content-based filtering put 3 Idiots last for Ben, but the users who share his taste loved it. The next note learns directly from such people, with no features at all.</div>

  <h2 id="rs-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: every 0 is a dislike</span><p>In implicit data most zeros are "never seen". Use impressions as negatives or give zeros low confidence.</p></div>
  <div class="callout trap"><span class="label">Trap: ranking by raw mean rating</span><p>One 5-star rating put Lagaan on top. Use a damped mean (Σr + mμ)/(n + m) or a minimum count.</p></div>
  <div class="callout trap"><span class="label">Trap: densifying the matrix</span><p><code>.toarray()</code> or <code>.fillna(0)</code> on real data explodes memory and fakes 0 ratings. Stay sparse.</p></div>
  <div class="callout trap"><span class="label">Trap: un-centred profiles</span><p>Averaging raw ratings lets a 2-star film add its features to the profile. Subtract the user's mean.</p></div>
  <div class="callout trap"><span class="label">Trap: dot product instead of cosine</span><p>Items with more tags win just for being longer vectors. Normalise (cosine, or L2-normalised TF-IDF).</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring common tags</span><p>"Drama" on 5 of 6 films makes everything look alike. Weight features by rarity (TF-IDF).</p></div>
  <div class="callout trap"><span class="label">Trap: recommending what they already have</span><p>Filter seen, bought and unavailable items before taking the top N.</p></div>
  <div class="callout trap"><span class="label">Trap: no baseline</span><p>Report popularity next to every model. On sparse data it is often hard to beat.</p></div>
  <div class="callout trap"><span class="label">Trap: accuracy only</span><p>A list of near-identical items can score well and still bore users. Track diversity and coverage too.</p></div>

  <h2 id="rs-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: CineCity, 5 users × 6 films, 19 ratings (1–5). Ben rated Dangal 5, Chak De 5, DDLJ 2 and has not seen Lagaan, K3G, 3 Idiots.</p>
  <table class="tbl">
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>user mean</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>·</td><td>1</td><td>1</td><td>4</td><td>3.0</td></tr>
    <tr><td>Ben</td><td>5</td><td>5</td><td>·</td><td>2</td><td>·</td><td>·</td><td>4.0</td></tr>
    <tr><td>Chen</td><td>2</td><td>·</td><td>·</td><td>5</td><td>5</td><td>·</td><td>4.0</td></tr>
    <tr><td>Dia</td><td>·</td><td>1</td><td>·</td><td>4</td><td>5</td><td>2</td><td>3.0</td></tr>
    <tr><td>Esha</td><td>5</td><td>·</td><td>5</td><td>·</td><td>3</td><td>5</td><td>4.5</td></tr>
    <tr><td>tags</td><td>sports, drama</td><td>sports, drama</td><td>sports, drama, romance</td><td>romance, comedy</td><td>drama, romance</td><td>drama, comedy</td><td></td></tr>
  </table>
  <h3>The question ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>CineCity answer</th><th>Weakness → next</th></tr>
    <tr><td>Recommendation problem</td><td>which N items for this user?</td><td>score every pair, top-N unseen</td><td>scores from what data?</td></tr>
    <tr><td>Explicit / implicit feedback</td><td>what signals of taste exist?</td><td>ratings; plays (1), finishes (3)</td><td>how to store them?</td></tr>
    <tr><td>Interaction matrix</td><td>how to hold the signals?</td><td>density 19/30; real &lt; 1%; CSR</td><td>what goes in the blanks?</td></tr>
    <tr><td>Popularity (damped mean)</td><td>simplest safe guess?</td><td>Lagaan 5.0 → 3.974; Dangal 3.985</td><td>same list for all</td></tr>
    <tr><td>Item profiles, TF-IDF</td><td>how to compare films?</td><td>Dangal [0.804, 0.595, 0, 0]</td><td>what does Ben want?</td></tr>
    <tr><td>User profile</td><td>how to describe Ben?</td><td>weights +1, +1, −2 → [0.402, 0.297, −0.323, −0.382]</td><td>how to compare person and film?</td></tr>
    <tr><td>Cosine</td><td>how close is a film to Ben?</td><td>Lagaan 0.265, K3G −0.116, 3 Idiots −0.235</td><td>is it really better?</td></tr>
    <tr><td>Hold-out check</td><td>does it beat popularity?</td><td>RMSE 0.801 vs 0.918</td><td>where does it fail?</td></tr>
    <tr><td>Strengths / weaknesses</td><td>what can't it do?</td><td>new film Chhichhore 0.140; 3 Idiots missed</td><td>use other users → CF</td></tr>
    <tr><td>Hybrids</td><td>how to combine?</td><td>switch, blend, cascade, features</td><td>→ Collaborative Filtering</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and meaning</th></tr>
    <tr><td>Density</td><td>|observed| / (|U|·|I|)</td><td>share of filled cells; sparsity = 1 − density</td></tr>
    <tr><td>Damped mean</td><td>(Σr<sub>ui</sub> + mμ)/(n<sub>i</sub> + m) = (n/(n+m))x̄ + (m/(n+m))μ</td><td>n<sub>i</sub> ratings of item i, μ global mean, m prior strength (virtual ratings)</td></tr>
    <tr><td>IDF (sklearn)</td><td>ln((1 + N)/(1 + df)) + 1</td><td>N items, df items having the feature; textbook: log(N/df)</td></tr>
    <tr><td>TF-IDF profile</td><td>xᵢ = tf · idf, then xᵢ / ‖xᵢ‖</td><td>rare features weigh more; L2 makes length 1</td></tr>
    <tr><td>User profile</td><td>p<sub>u</sub> = Σ w<sub>uj</sub> x<sub>j</sub> / Σ |w<sub>uj</sub>|, w<sub>uj</sub> = r<sub>uj</sub> − r̄<sub>u</sub></td><td>items j rated by u; likes pull, dislikes push</td></tr>
    <tr><td>Cosine</td><td>cos(a, b) = a·b / (‖a‖‖b‖)</td><td>angle only; −1 opposite, 0 unrelated, 1 same</td></tr>
    <tr><td>Content kNN rating</td><td>r̂<sub>ui</sub> = Σ sim(i, j) r<sub>uj</sub> / Σ |sim(i, j)|</td><td>over the k items u rated most similar to i</td></tr>
    <tr><td>RMSE / MAE</td><td>√mean((r̂ − r)²) / mean|r̂ − r|</td><td>on held-out ratings only</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Popularity</b><p>Use for brand-new users, as a fallback, and as the baseline every model must beat. Avoid as the only method for known users.</p><small>Always damp the mean</small></div>
    <div><b>Content-based</b><p>Use when items have rich features, arrive constantly (news, jobs) or must be explained; works for new items and lone users.</p><small>Weak: no surprises, new users</small></div>
    <div><b>Implicit data</b><p>Use whenever available (it is plentiful); weight events by strength; treat zeros as unknown.</p><small>Ratings are rarer but have real negatives</small></div>
    <div><b>Hybrid</b><p>Combine: popularity for strangers, content for new items, collaborative signals for everyone with history.</p><small>Put scores on one scale first</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Zeros treated as dislikes; raw means for tiny counts; densifying a sparse matrix; un-centred profiles that add disliked features; dot product instead of cosine; common features not down-weighted; recommending seen items; no popularity baseline; judging by accuracy alone.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Film with one rating of 5; global mean 3.632; m = 3. Damped mean?</td><td>(5 + 3 × 3.632)/4 = 3.974</td></tr>
    <tr><td>N = 6 films, a tag on 5 of them. sklearn idf?</td><td>ln(7/6) + 1 = 1.154</td></tr>
    <tr><td>Ben rated 5, 5, 2. Centred weights?</td><td>mean 4 → +1, +1, −2</td></tr>
    <tr><td>Profile [0.5, 0.5, −0.5, −0.5], film [1, 1, 1, 0]: cosine?</td><td>0.5 / (1 × √3) = 0.289</td></tr>
    <tr><td>Name two things content-based filtering cannot do.</td><td>Recommend outside the user's features (no serendipity); serve a user with no history</td></tr>
  </table>

  <h2 id="rs-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explicit vs implicit feedback: differences, and which is more common in industry?</summary><div class="qa-body">Explicit = ratings and likes: rare but with clear negatives and a bounded scale. Implicit = plays, clicks, purchases, watch time: plentiful but positive-only, and a missing record may mean "never seen". Implicit is far more common; weight events by strength (CineCity: play 1, finish 3) and treat values as confidence, not preference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the density of CineCity's rating matrix, and why does sparsity matter?</summary><div class="qa-body">19 known ratings in 5 × 6 = 30 cells: 0.633. Real matrices are below 1% (our 20,000 × 5,000 simulation: 0.35%), so dense storage wastes almost everything (0.8 GB vs 4.2 MB in CSR), most user pairs share few items, and most items sit in a long tail with few interactions. Every method must work with mostly-missing data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a plain average rating a bad popularity score? What do you use instead?</summary><div class="qa-body">An item with one or two ratings gets an extreme, noisy average: Lagaan's single 5 put it first. Use the damped (Bayesian) mean (Σr + mμ)/(n + m): with μ = 3.632 and m = 3, Lagaan becomes 3.974, just below Dangal's 3.985. It is shrinkage toward the global mean, weight n/(n + m) on the item's own mean.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the TF-IDF vector of Dangal (tags sports, drama) given df sports = 3, drama = 5, N = 6.</summary><div class="qa-body">idf (sklearn) = ln(7/4) + 1 = 1.5596 and ln(7/6) + 1 = 1.1542. Vector [1.5596, 1.1542, 0, 0], length √3.7646 = 1.9403, normalised [0.804, 0.595, 0, 0]. Drama is common, so it gets less weight than sports.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build a user profile, and why mean-centre?</summary><div class="qa-body">Weighted average of the profiles of items the user rated, with weights = rating − user's mean, divided by the sum of absolute weights. Ben's 5, 5, 2 (mean 4) become +1, +1, −2, so DDLJ's romance and comedy are subtracted: [0.5, 0.5, −0.5, −0.5] on plain tags. Without centring every rating is positive and a disliked film still adds its features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why cosine similarity rather than the dot product or Euclidean distance?</summary><div class="qa-body">The dot product grows with vector length, so items with many features win regardless of fit. Cosine divides by both lengths and measures only direction (the mix of features), and it can be negative for opposite tastes. For Ben's profile: Lagaan 0.289 on plain tags, 0.265 with TF-IDF.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the strengths and weaknesses of content-based filtering with an example of each.</summary><div class="qa-body">Strengths: new items score immediately (Chhichhore, zero ratings, 0.140 for Ben), no other users needed, explainable, private. Weaknesses: over-specialisation (3 Idiots −0.235 for Ben although users who share his taste rated it 4 and 5), no profile for new users, depends on feature quality (Dangal and Chak De identical by tags but rated 4.25 vs 3.33 on average).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you check that a content-based recommender beats popularity?</summary><div class="qa-body">Hide a random share (or the latest part) of ratings, build profiles and popularity statistics from the rest only, predict the hidden ratings and compare RMSE/MAE, and for top-N lists compare ranking metrics. In our 1,000 × 1,000 simulation: damped popularity 0.918, user mean 0.859, content-based 0.801. Confirm with an A/B test before shipping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A news site gets 5,000 new articles a day. Which family do you start with, and why?</summary><div class="qa-body">Content-based (text embeddings or TF-IDF of the article plus category), because articles are new and short-lived: collaborative methods have no interactions for them until it is too late. Add popularity (trending) for new users and collaborative signals for reranking as clicks arrive; a hybrid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four common hybrid designs?</summary><div class="qa-body">Switching (popularity for new users, content once they rate), weighted (blend normalised scores), cascade (one method shortlists, another reorders), and feature combination (one model, often a gradient-boosted ranker, with all signals as features). Large systems use the last inside a retrieval-then-ranking pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is content-based rating prediction related to K-Nearest Neighbors?</summary><div class="qa-body">It is KNN regression on one user's own ratings: the "points" are the films Ben rated, distance is cosine in feature space, and the prediction is the similarity-weighted average of the k nearest films' ratings (Lagaan → Dangal 0.779, Chak De 0.779 → 5.0). Collaborative filtering in the next note is KNN too, but over users or items described by ratings instead of features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: where else have you met the damped mean's idea?</summary><div class="qa-body">It is shrinkage: an estimate from few data points is pulled toward a prior. Ridge regression shrinks coefficients toward 0, Laplace smoothing in Naive Bayes adds virtual counts, target encoding with smoothing in feature engineering blends a category mean with the global mean, and Bayesian estimation with a prior worth m observations gives exactly (Σr + mμ)/(n + m). The next note applies it to similarities (significance weighting).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does content-based filtering not need the other users' rows, and why is that both its strength and its limit?</summary><div class="qa-body">Its score uses only item features and the target user's own row, so it works for a lone user and for items nobody has rated. But for the same reason it cannot learn that people who love Dangal also love 3 Idiots, a link nobody wrote down as a feature. Collaborative filtering uses exactly those other rows.</div></details>
</main>
`
});
