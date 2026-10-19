// notes/ml/ml_mf.js — Matrix Factorization
Object.assign(TOPIC_CONTENT, {
  "ml_mf": `<main>
  <h1>Matrix Factorization</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Matrix Factorization</span></div>
  <p class="lead">Matrix factorization (MF) describes every user and every item by a short list of hidden numbers, so that one dot product predicts any rating, even for pairs that share no history. This note builds it completely on one running example, the same four friends and five films used across the recommender notes, with one question to answer: <strong>what will Ben give Interstellar?</strong> Along the way: the latent-factor idea worked by hand, the objective on observed cells with L2 regularisation, an SGD update for one rating by hand, an ALS step for one user by hand, global/user/item biases, choosing k and λ on held-out ratings, true SVD versus Funk-SVD, implicit-feedback ALS with confidence weights, the embeddings view and the step to two-tower models, plus from-scratch numpy code for every piece with its real output.</p>

  <h2 id="mf-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680">
<defs><marker id="mf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="8" width="190" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="30" text-anchor="middle" font-size="12">Recommendation Systems</text>
<line x1="300" y1="42" x2="90" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#mf-a0)"/><line x1="320" y1="42" x2="255" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#mf-a0)"/><line x1="350" y1="42" x2="425" y2="78" stroke="currentColor" marker-end="url(#mf-a0)"/><line x1="380" y1="42" x2="590" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#mf-a0)"/>
<rect x="10" y="80" width="160" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="102" text-anchor="middle" font-size="12">Basics &amp; Content-Based</text><text x="90" y="120" text-anchor="middle" class="tm" font-size="10">matrix, popularity, item features</text>
<rect x="180" y="80" width="150" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="255" y="102" text-anchor="middle" font-size="12">Collaborative Filtering</text><text x="255" y="120" text-anchor="middle" class="tm" font-size="10">neighbours by similarity</text>
<rect x="340" y="80" width="170" height="54" rx="8" class="fg sg" stroke-width="3"/><text x="425" y="102" text-anchor="middle" font-size="13" font-weight="700">Matrix Factorization</text><text x="425" y="120" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<rect x="520" y="80" width="150" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="102" text-anchor="middle" font-size="12">Ranking, Eval &amp; Cold Start</text><text x="595" y="120" text-anchor="middle" class="tm" font-size="10">top-k lists, NDCG, new users</text>
<line x1="170" y1="107" x2="178" y2="107" stroke="currentColor" marker-end="url(#mf-a0)"/><line x1="330" y1="107" x2="338" y2="107" stroke="currentColor" marker-end="url(#mf-a0)"/><line x1="510" y1="107" x2="518" y2="107" stroke="currentColor" marker-end="url(#mf-a0)"/>
<text x="340" y="165" text-anchor="middle" class="tm" font-size="10.5">same 4 users × 5 films throughout: Asha, Ben, Chen, Dia × Inception, Interstellar, Notebook, Titanic, Toy Story</text>
<text x="340" y="185" text-anchor="middle" class="tm" font-size="10.5">CF compares rows/columns directly → MF compresses them into k hidden numbers each → ranking turns scores into lists</text>
</svg><figcaption>Matrix factorization is the third note of the Recommendation Systems group: the model-based answer to the sparsity problem that neighbourhood CF leaves open.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_cf">Collaborative Filtering</a></b><span>We predicted a missing rating from neighbours: users who rated the same films, or films rated by the same users. Left open: similarity needs overlap. With real data about 99% empty, most pairs of users share nothing, so neighbourhoods are tiny, noisy or missing, and comparing every pair is slow. (The previous two notes worked on CineCity, five users × six films with 19 ratings; this note uses an even smaller 4 × 5 cinema with the same users Asha, Ben, Chen and Dia, so that every SGD step, ALS solve and bias can be computed by hand. The questions are the same: predict Ben's blanks and discover the hidden traits behind the ratings.)</span></li>
    <li><b>This note adds: a learned model of the whole matrix</b><span>Every user and every film gets k hidden numbers (latent factors), trained so that their dot product matches every known rating. Information flows through the shared factors, so any user can be scored on any film. We learn how to train it (SGD, ALS), make it honest (regularisation, held-out error), add biases, handle clicks instead of stars (implicit ALS) and read the factors as embeddings.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a></b><span>MF gives a score for every (user, film) pair. But users see a short ordered list, not scores; brand-new users and films have no factors yet; and accuracy on ratings is not the business goal. The next note turns scores into ranked lists, measures lists (precision@k, NDCG), and handles cold start and feedback loops. Background: <a class="xref" data-note="ml_recsys">Recommendation Systems: Basics</a> for the matrix and feedback types.</span></li>
  </ol>

  <h2 id="mf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Latent factors</b><span>Q: how can we predict Ben → Interstellar when neighbours barely overlap? → Give every user and film k hidden "taste sliders"; rating ≈ user vector · film vector. With hand-picked sliders Ben (2, 0.5) · Interstellar (1.5, 0.5) = 3.25. But who picks the sliders?</span></li>
    <li><b>The objective</b><span>Q: how do we score a set of factors? → Squared error on the 15 observed ratings only, plus λ times the size of all factors: 4.953 + 3.931 = 8.884 for our hand sliders. Filling blanks with 0 instead drags Ben → Interstellar to 1.69. But how do we lower this loss?</span></li>
    <li><b>SGD</b><span>Q: how do we improve the factors step by step? → For one rating, compute the error and nudge both vectors along the gradient: Asha → Inception error 3.25 → 1.89 in one step. Loop over all ratings: train RMSE 0.26, Ben → Interstellar 3.04. But it needs a learning rate and many passes…</span></li>
    <li><b>ALS</b><span>Q: is there a step with no learning rate? → Freeze the films and each user becomes a tiny ridge regression with an exact answer; then swap. Ben's solve gives (1.894, 0.260). Converges in a handful of sweeps, parallel. But Ben is a strict rater, and the factors waste effort learning that…</span></li>
    <li><b>Biases</b><span>Q: how do we separate "Ben rates low" from "Ben dislikes this"? → prediction = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub>: 2.87 − 0.57 − 0.29 + 1.11 ≈ 3.11. But train RMSE 0.076 with 27 numbers for 15 ratings looks too good…</span></li>
    <li><b>Held-out tuning of k and λ</b><span>Q: is the model memorising? → Hide 20% of ratings in a bigger cinema: test RMSE global mean 1.087, biases 0.982, MF 0.766 at k = 3, λ = 0.1, and worse with λ = 0 or too large. But isn't this just SVD from linear algebra?</span></li>
    <li><b>SVD vs Funk-SVD</b><span>Q: why not use the classic SVD? → It needs every cell filled; mean-filling gives test RMSE ≈ 1.02 versus 0.77 for MF trained on observed cells only. "Funk-SVD" is SVD in name only. But most real data is clicks and plays, not stars…</span></li>
    <li><b>Implicit ALS</b><span>Q: how do we factorize plays, where a blank is "unknown", not "disliked"? → Fit preference p = 1/0 on every cell, weighted by confidence c = 1 + α·plays: Ben's solve gives (0.440, 0.391). But what are these vectors, and how do they feed a real system?</span></li>
    <li><b>Embeddings &amp; two-tower</b><span>Q: what do the factors mean and how are they used? → They are embeddings: Inception and Interstellar have cosine 1.00; a new user can be folded in from two ratings; a two-tower network replaces ID lookups with feature towers. Next note: turning scores into ranked lists.</span></li>
  </ol>

  <h2 id="mf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Matrix Factorization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea</div>
        <ul>
          <li><b>R ≈ P Qᵀ</b>: m × n sparse matrix ≈ (m × k)(k × n), k small</li>
          <li><b>r̂<sub>ui</sub> = p<sub>u</sub> · q<sub>i</sub></b>: Ben (2, 0.5) · Interstellar (1.5, 0.5) = 3.25</li>
          <li>Factors are learned, not named; often readable (sci-fi vs romance)</li>
          <li>k(m + n) numbers instead of m·n cells: Netflix k = 50 → 24.9 M vs 8.5 B</li>
          <li>💡 Taste sliders on a mixing desk</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Objective</div>
        <ul>
          <li><b>L = Σ<sub>observed</sub> (r − p·q)² + λ(Σ‖p‖² + Σ‖q‖²)</b></li>
          <li>Observed cells only: hand sliders SSE 4.953 + penalty 3.931</li>
          <li>λ: stops memorising, fixes scale ambiguity (P·c, Q/c)</li>
          <li>Non-convex jointly, convex in P with Q fixed</li>
          <li>⚠ Zero-filled SVD: Ben → Interstellar 1.69</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training</div>
        <ul>
          <li><b>SGD</b>: e = r − p·q; p += η(e q − λp); q += η(e p − λq)</li>
          <li>By hand: error 3.25 → 1.89 in one step</li>
          <li><b>ALS</b>: p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; Ben (1.894, 0.260)</li>
          <li>SGD: simple, any loss; ALS: no learning rate, parallel, implicit-friendly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Biases &amp; tuning</div>
        <ul>
          <li><b>r̂ = μ + b<sub>u</sub> + b<sub>i</sub> + p·q</b>; μ = 2.867, b<sub>Ben</sub> = −0.867 by hand</li>
          <li>Shrink: b<sub>i</sub> = Σ resid / (n<sub>i</sub> + λ<sub>b</sub>)</li>
          <li>Held-out RMSE: mean 1.087 → biases 0.982 → MF 0.766</li>
          <li>λ U-shape: 0 → 0.815, 0.05 → 0.768, 0.5 → 0.978</li>
          <li>Tune k, λ, epochs on held-out ratings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SVD &amp; implicit</div>
        <ul>
          <li><b>SVD</b> R = UΣVᵀ: best rank-k for a FULL matrix (Eckart–Young)</li>
          <li>Mean-filled SVD test RMSE 1.02 vs Funk-SVD 0.77</li>
          <li><b>Implicit ALS</b>: p<sub>ui</sub> = [plays &gt; 0], c<sub>ui</sub> = 1 + α·plays, all cells</li>
          <li>x<sub>u</sub> = (YᵀC<sub>u</sub>Y + λI)⁻¹YᵀC<sub>u</sub>p<sub>u</sub>; trick YᵀY + Yᵀ(C<sub>u</sub> − I)Y</li>
          <li>⚠ a 1-star watch is still a "play"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Embeddings</div>
        <ul>
          <li>p<sub>u</sub>, q<sub>i</sub> live in one space; cosine(Inception, Interstellar) = 1.00</li>
          <li>Axes only defined up to rotation/sign</li>
          <li>Fold-in a new user: one ridge solve with Q frozen</li>
          <li>Top-k = biggest dot products → ANN search</li>
          <li><b>Two-tower</b>: towers on features instead of ID lookups; MF = two-tower with one-hot inputs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mf-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Latent Factors</span><span class="rm-sub">Taste sliders by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mf-obj"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Objective</span><span class="rm-sub">Observed cells + L2</span></div></div>
      <div class="rm-item rm-done" data-target="mf-sgd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Training with SGD</span><span class="rm-sub">One rating by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mf-als"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Alternating Least Squares</span><span class="rm-sub">Ben's ridge solve by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mf-bias"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Biases</span><span class="rm-sub">Global, user, item</span></div></div>
      <div class="rm-item rm-done" data-target="mf-tune"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Overfitting, k and λ</span><span class="rm-sub">Held-out ratings</span></div></div>
      <div class="rm-item rm-done" data-target="mf-svd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SVD vs Funk-SVD</span><span class="rm-sub">Why "SVD" is a misnomer</span></div></div>
      <div class="rm-item rm-done" data-target="mf-implicit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Implicit Feedback ALS</span><span class="rm-sub">Preference and confidence</span></div></div>
      <div class="rm-item rm-done" data-target="mf-embed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Embeddings &amp; Two-Tower</span><span class="rm-sub">Factors as vectors</span></div></div>
      <div class="rm-item rm-done" data-target="mf-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One dot product, many tools</span></div></div>
      <div class="rm-item rm-done" data-target="mf-compare"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs CF, content, SVD, two-tower</span></div></div>
      <div class="rm-item rm-done" data-target="mf-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="mf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mf-idea"><span class="num">01</span>Latent Factors: The Idea</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Neighbourhood CF predicts Ben → Interstellar from users or films that overlap with Ben. On a real catalogue most pairs share nothing, so there are no reliable neighbours. Can we predict a rating without needing any overlap between this user and other users?</p>
  </div>
  <h3>The running example</h3>
  <p>Four friends rated some of five films from 1 to 5 stars. A dot (·) means "not rated". Our question for the whole note: <strong>what will Ben give Interstellar?</strong></p>
  <table class="tbl"><caption>Ratings matrix R (4 users × 5 films, 15 of 20 cells known)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th><th>user mean</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>1</td><td>·</td><td>2</td><td>3.00</td></tr>
    <tr><td>Ben</td><td>4</td><td><strong>?</strong></td><td>1</td><td>1</td><td>·</td><td>2.00</td></tr>
    <tr><td>Chen</td><td>1</td><td>1</td><td>5</td><td>4</td><td>·</td><td>2.75</td></tr>
    <tr><td>Dia</td><td>·</td><td>2</td><td>4</td><td>5</td><td>3</td><td>3.50</td></tr>
  </table>
  <p>By eye there are two kinds of film (sci-fi: Inception, Interstellar; romance: Notebook, Titanic; Toy Story in between) and two kinds of viewer (Asha and Ben like sci-fi; Chen and Dia like romance). Ben gave Inception 4 and both romances 1, so we expect a fairly high Interstellar rating, but Ben also gives low marks in general (mean 2.00). Every section of this note will refine that guess.</p>
  <div class="fx" data-lang="py">import numpy as np
users = ["Asha", "Ben", "Chen", "Dia"]
films = ["Inception", "Interstellar", "Notebook", "Titanic", "Toy Story"]
R = np.array([[5, 4, 1, 0, 2],
              [4, 0, 1, 1, 0],
              [1, 1, 5, 4, 0],
              [0, 2, 4, 5, 3]], float)        # 0 = not rated
M = R &gt; 0                                     # mask of observed cells
print("observed ratings:", M.sum(), "of", R.size, f"(density {M.mean():.0%})")
print("global mean mu =", round(R[M].mean(), 3))
for u, name in enumerate(users):
    print(f"{name:5s} rated {M[u].sum()}  mean {R[u, M[u]].mean():.2f}")</div>
  <div class="fx" data-lang="text">observed ratings: 15 of 20 (density 75%)
global mean mu = 2.867
Asha  rated 4  mean 3.00
Ben   rated 3  mean 2.00
Chen  rated 4  mean 2.75
Dia   rated 4  mean 3.50</div>
  <p><code>M = R &gt; 0</code> is the mask of known cells; every formula in this note uses it to ignore blanks. The global mean μ = 43 / 15 = 2.867 and the four user means will come back when we add biases (section 05).</p>
  <h3>Describe everything by a few hidden numbers</h3>
  <p>The plain-words idea: if we could describe every film by "how sci-fi is it, how romantic is it" and every user by "how much do I enjoy sci-fi, how much do I enjoy romance", then a rating would be simply the sum of (enjoyment × amount) over the two qualities. That sum is a <strong>dot product</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sound mixing desk with two sliders. Each film is a recording with a certain amount of bass and treble; each listener has a personal volume for bass and treble. How much a listener enjoys a recording is (bass in it × their bass liking) + (treble in it × their treble liking). Nobody labels the sliders in advance: training discovers what each slider means from the ratings alone.</p>
  </div>
  <p><strong>By hand.</strong> Pick the sliders ourselves (column 1 = sci-fi, column 2 = romance):</p>
  <table class="tbl"><caption>Hand-picked factors, k = 2</caption>
    <tr><th>Film</th><th>q<sub>i</sub> (sci-fi, romance)</th><th></th><th>User</th><th>p<sub>u</sub> (sci-fi, romance)</th></tr>
    <tr><td>Inception</td><td>(2, 0)</td><td></td><td>Asha</td><td>(2.5, 0.5)</td></tr>
    <tr><td>Interstellar</td><td>(1.5, 0.5)</td><td></td><td>Ben</td><td>(2, 0.5)</td></tr>
    <tr><td>Notebook</td><td>(0, 2)</td><td></td><td>Chen</td><td>(0.5, 2.5)</td></tr>
    <tr><td>Titanic</td><td>(0.5, 2)</td><td></td><td>Dia</td><td>(0.5, 2.25)</td></tr>
    <tr><td>Toy Story</td><td>(1, 1)</td><td></td><td></td><td></td></tr>
  </table>
  <ul>
    <li>Ben → Interstellar = 2 × 1.5 + 0.5 × 0.5 = 3 + 0.25 = <strong>3.25</strong>.</li>
    <li>Ben → Notebook = 2 × 0 + 0.5 × 2 = 1 (he really gave 1 ✓).</li>
    <li>Chen → Titanic = 0.5 × 0.5 + 2.5 × 2 = 0.25 + 5 = 5.25 (he gave 4: the sliders are not perfect).</li>
  </ul>
  <p>Doing this for every pair is a matrix product: stack the user vectors as rows of P (4 × 2) and the film vectors as rows of Q (5 × 2); then <strong>R̂ = P Qᵀ</strong> is a full 4 × 5 table, blanks included.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
<rect x="20" y="40" width="150" height="110" class="fs" stroke="currentColor"/>
<text x="95" y="30" text-anchor="middle" font-size="12">R (4 users × 5 films)</text>
<text x="95" y="90" text-anchor="middle" class="tm" font-size="11">15 known, 5 blank</text>
<text x="95" y="108" text-anchor="middle" class="tm" font-size="11">Ben → Interstellar = ?</text>
<text x="200" y="100" text-anchor="middle" font-size="20">≈</text>
<rect x="230" y="40" width="50" height="110" class="fb sb"/>
<text x="255" y="30" text-anchor="middle" font-size="12" font-weight="700">P</text>
<text x="255" y="100" text-anchor="middle" font-size="11">4×2</text>
<text x="305" y="100" text-anchor="middle" font-size="16">×</text>
<rect x="330" y="70" width="150" height="50" class="ft st"/>
<text x="405" y="60" text-anchor="middle" font-size="12" font-weight="700">Qᵀ</text>
<text x="405" y="100" text-anchor="middle" font-size="11">2×5</text>
<text x="500" y="85" class="tm" font-size="11">k = 2</text><text x="500" y="101" class="tm" font-size="11">latent</text><text x="500" y="117" class="tm" font-size="11">factors</text>
<text x="20" y="172" class="tm" font-size="11">r̂(u, i) = p_u · q_i: one row of P times one column of Qᵀ, defined for every cell</text>
</svg><figcaption>A sparse table is approximated by two thin, full ones. Their product fills every blank.</figcaption></figure>
  <h3>Why so few numbers can work</h3>
  <p>P and Q hold k(m + n) = 2 × (4 + 5) = 18 numbers, versus m × n = 20 cells. At Netflix Prize scale (480,189 users, 17,770 films, 1.18% of cells rated) with k = 50 that is 50 × 497,959 ≈ 24.9 million numbers instead of 8.53 billion cells. It works because tastes are not random: every user's row is roughly a mix of a few "taste profiles", so the full matrix is close to <strong>low rank</strong>. The factors are that small set of profiles. And because every rating Ben gave updates the same Ben vector, and every rating of Interstellar by anyone updates the same Interstellar vector, information reaches Ben → Interstellar even though no neighbour links them directly.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Matrix factorization</strong> (for recommendation): approximate the user × item matrix R (m × n) by P Qᵀ, with P ∈ ℝ<sup>m×k</sup>, Q ∈ ℝ<sup>n×k</sup> and k ≪ min(m, n), fitted on the observed cells only. The prediction is r̂<sub>ui</sub> = p<sub>u</sub> · q<sub>i</sub> = Σ<sub>f=1..k</sub> p<sub>uf</sub> q<sub>if</sub>. Each of the k dimensions is a <strong>latent factor</strong>: a hidden property learned from data, not given.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Expecting the learned factors to be named "sci-fi" and "romance". Here we picked them by hand. A trained model finds directions that explain the ratings; they are often interpretable but can be any rotation or sign flip of the "nice" ones (section 09).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The objective.</b> Our hand sliders give 3.25, but they were guesses: Chen → Titanic came out 5.25 instead of 4. We need one number that says how good a set of factors is, so a computer can search for better ones.</div>

  <h2 id="mf-obj"><span class="num">02</span>The Objective</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given any P and Q, how do we score them? Which cells should count, and what stops the model from fitting the known ratings perfectly and predicting nonsense for the blanks?</p>
  </div>
  <h3>Squared error on observed cells</h3>
  <p>Compare the prediction with the truth only where the truth exists. With e<sub>ui</sub> = r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>, the hand sliders give:</p>
  <table class="tbl"><caption>Errors of the hand sliders (observed cells only)</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th><th>Σ e²</th></tr>
    <tr><td>Asha</td><td>5 − 5 = 0</td><td>4 − 4 = 0</td><td>1 − 1 = 0</td><td>·</td><td>2 − 3 = −1</td><td>1</td></tr>
    <tr><td>Ben</td><td>4 − 4 = 0</td><td>·</td><td>1 − 1 = 0</td><td>1 − 2 = −1</td><td>·</td><td>1</td></tr>
    <tr><td>Chen</td><td>1 − 1 = 0</td><td>1 − 2 = −1</td><td>5 − 5 = 0</td><td>4 − 5.25 = −1.25</td><td>·</td><td>1 + 1.5625 = 2.5625</td></tr>
    <tr><td>Dia</td><td>·</td><td>2 − 1.875 = 0.125</td><td>4 − 4.5 = −0.5</td><td>5 − 4.75 = 0.25</td><td>3 − 2.75 = 0.25</td><td>0.015625 + 0.25 + 0.0625 + 0.0625 = 0.390625</td></tr>
    <tr><td colspan="6"><strong>SSE</strong> over the 15 known ratings</td><td><strong>4.953125</strong></td></tr>
  </table>
  <h3>Adding the L2 penalty</h3>
  <p>With 18 free numbers and only 15 ratings, the model could fit every known rating exactly and still say anything about the blanks. So we add a cost for large factors, λ times the sum of all squared entries (L2 regularisation, see <a class="xref" data-note="ml_regularization">Regularization</a>). With λ = 0.1: ‖P‖² = (6.25 + 0.25) + (4 + 0.25) + (0.25 + 6.25) + (0.25 + 5.0625) = 22.5625, ‖Q‖² = 4 + 2.5 + 4 + 4.25 + 2 = 16.75, penalty = 0.1 × 39.3125 = 3.93125. Loss = 4.953 + 3.931 = <strong>8.884</strong>.</p>
  <p style="text-align:center">L(P, Q) = Σ<sub>(u,i) observed</sub> (r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>)² + λ ( Σ<sub>u</sub> ‖p<sub>u</sub>‖² + Σ<sub>i</sub> ‖q<sub>i</sub>‖² )</p>
  <div class="fx" data-lang="py"># hand-picked sliders: column 0 = "sci-fi", column 1 = "romance"
Q = np.array([[2.0, 0.0],    # Inception
              [1.5, 0.5],    # Interstellar
              [0.0, 2.0],    # Notebook
              [0.5, 2.0],    # Titanic
              [1.0, 1.0]])   # Toy Story
P = np.array([[2.5, 0.5],    # Asha
              [2.0, 0.5],    # Ben
              [0.5, 2.5],    # Chen
              [0.5, 2.25]])  # Dia
pred = P @ Q.T
print(pred)
err = (R - pred) * M                          # errors on observed cells only
sse = (err ** 2).sum()
lam = 0.1
reg = lam * ((P ** 2).sum() + (Q ** 2).sum())
print("SSE on 15 ratings =", sse, "  penalty =", round(reg, 4), "  loss =", round(sse + reg, 4))
print("Ben -&gt; Interstellar =", pred[1, 1])</div>
  <div class="fx" data-lang="text">[[5.    4.    1.    2.25  3.   ]
 [4.    3.25  1.    2.    2.5  ]
 [1.    2.    5.    5.25  3.   ]
 [1.    1.875 4.5   4.75  2.75 ]]
SSE on 15 ratings = 4.953125   penalty = 3.9312   loss = 8.8844
Ben -&gt; Interstellar = 3.25</div>
  <p>The printed table is P Qᵀ, the hand predictions, blanks included (Ben → Interstellar = 3.25, Asha → Titanic = 2.25). The masked error <code>(R - pred) * M</code> zeroes the blanks so they add nothing; SSE 4.953125 and penalty 3.93125 match the hand table.</p>
  <h3>Two more jobs the penalty does</h3>
  <p><strong>It fixes the scale.</strong> Double every user vector and halve every film vector: every dot product, so every prediction and the SSE, is unchanged. Without a penalty these are equally good, and training can drift to huge or tiny numbers. With the penalty: 0.1 × (4 × 22.5625 + 16.75 / 4) = 0.1 × (90.25 + 4.1875) = 9.44, much worse than 3.93, so the penalty prefers balanced sizes.</p>
  <p><strong>It shrinks users and films with few ratings.</strong> A user with one rating has one squared-error term pulling their vector and the same penalty pulling it to 0, so their vector stays small and their predictions stay near average: a sensible default when we know little.</p>
  <h3>The wrong way: fill the blanks with zeros</h3>
  <p>Classic linear algebra gives the best rank-2 approximation of a <em>full</em> matrix (the SVD, section 07). Treating blanks as 0 stars makes the matrix full, but now the model is trained to predict 0 for every unseen film:</p>
  <div class="fx" data-lang="py"># WRONG: treat every blank as a rating of 0, then take the best rank-2 fit (plain SVD)
U, s, Vt = np.linalg.svd(R, full_matrices=False)
R2 = (U[:, :2] * s[:2]) @ Vt[:2]
print("zero-filled SVD, Ben -&gt; Interstellar =", R2[1, 1].round(2))
print("zero-filled SVD, Asha -&gt; Titanic     =", R2[0, 3].round(2))</div>
  <div class="fx" data-lang="text">zero-filled SVD, Ben -&gt; Interstellar = 1.69
zero-filled SVD, Asha -&gt; Titanic     = 0.29</div>
  <p>Ben → Interstellar collapses to 1.69 and Asha → Titanic to 0.29, below the 1-star minimum, because "not rated" was read as "rated 0". The fix is the masked loss above: blanks contribute nothing.</p>
  <h3>The shape of the problem</h3>
  <p>The prediction p·q multiplies two unknowns, so L is <strong>not convex</strong> in (P, Q) together: there are many equally good solutions (any rotation of the factors) and possibly poor local minima. But if Q is frozen, L is an ordinary ridge regression in P, which is convex with an exact solution, and vice versa. Section 03 exploits the gradient; section 04 exploits the "convex in one half" structure.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regularised MF objective</strong>: minimise Σ<sub>(u,i)∈Ω</sub> (r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>)² + λ(Σ‖p<sub>u</sub>‖² + Σ‖q<sub>i</sub>‖²), where Ω is the set of observed cells and λ ≥ 0 is chosen on held-out data. Some libraries scale the penalty per rating (λ n<sub>u</sub>‖p<sub>u</sub>‖², "weighted-λ" in ALS-WR) so heavy users are not under-regularised.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Including blank cells as zeros in an explicit-rating loss (plain SVD, sklearn TruncatedSVD on the raw matrix). It predicts "everyone hates everything unseen". For explicit ratings, mask the blanks; for implicit data, use confidence weighting (section 08).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SGD.</b> We can score any P, Q (8.884 for our guesses), but we still chose them by hand. How does a computer move P and Q downhill on this loss?</div>

  <h2 id="mf-sgd"><span class="num">03</span>Training with SGD</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have a loss. How do we change the factors so it goes down, without writing down the whole matrix at once?</p>
  </div>
  <h3>The gradient for one rating</h3>
  <p>Look at one observed rating and its share of the loss: ℓ = (r − p·q)² + λ(‖p‖² + ‖q‖²) (the per-rating share of the penalty). With e = r − p·q, calculus (<a class="xref" data-note="m_calculus">Calculus</a>) gives</p>
  <p style="text-align:center">∂ℓ/∂p = −2e q + 2λp &nbsp;&nbsp;&nbsp; ∂ℓ/∂q = −2e p + 2λq</p>
  <p>Stepping against the gradient, and folding the 2 into the learning rate η:</p>
  <p style="text-align:center"><strong>p ← p + η (e q − λ p)</strong> &nbsp;&nbsp;&nbsp; <strong>q ← q + η (e p − λ q)</strong></p>
  <p>In words: if we predicted too low (e &gt; 0), move the user vector towards the film vector and the film vector towards the user vector, by an amount proportional to the error; and always shrink both a little (the λ term). This is <a class="xref" data-note="ml_loss_gd">gradient descent</a> one rating at a time: stochastic gradient descent (SGD).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop assistant guesses a customer's reaction to a film, sees the real reaction, then adjusts both their picture of the customer and their picture of the film a little. After thousands of customers, both pictures are good.</p>
  </div>
  <h3>One step by hand</h3>
  <p>Take Asha → Inception = 5, with starting vectors p = (1, 0.5), q = (1.5, 0.5), η = 0.1, λ = 0.1.</p>
  <table class="tbl"><caption>One SGD step on Asha → Inception</caption>
    <tr><th>Step</th><th>Calculation</th><th>Result</th></tr>
    <tr><td>Prediction</td><td>1 × 1.5 + 0.5 × 0.5</td><td>1.75</td></tr>
    <tr><td>Error e</td><td>5 − 1.75</td><td>3.25</td></tr>
    <tr><td>e q − λ p</td><td>(4.875 − 0.1, 1.625 − 0.05)</td><td>(4.775, 1.575)</td></tr>
    <tr><td>new p</td><td>(1, 0.5) + 0.1 × (4.775, 1.575)</td><td>(1.4775, 0.6575)</td></tr>
    <tr><td>e p − λ q (old p!)</td><td>(3.25 − 0.15, 1.625 − 0.05)</td><td>(3.1, 1.575)</td></tr>
    <tr><td>new q</td><td>(1.5, 0.5) + 0.1 × (3.1, 1.575)</td><td>(1.81, 0.6575)</td></tr>
    <tr><td>New prediction</td><td>1.4775 × 1.81 + 0.6575 × 0.6575</td><td>2.674 + 0.432 = 3.107</td></tr>
  </table>
  <p>One step cut the error from 3.25 to 1.89. Note that the q update uses the <em>old</em> p; updating p first and then using the new p would be a slightly different (still valid) algorithm.</p>
  <div class="fx" data-lang="py"># one SGD step on one rating: Asha -&gt; Inception = 5
p, q = np.array([1.0, 0.5]), np.array([1.5, 0.5])
lr, lam = 0.1, 0.1
e = 5 - p @ q
print("before: pred", p @ q, " error", e)
p_new = p + lr * (e * q - lam * p)
q_new = q + lr * (e * p - lam * q)            # uses the OLD p
print("p_new", p_new.round(4), " q_new", q_new.round(4))
print("after:  pred", round(p_new @ q_new, 4), " error", round(5 - p_new @ q_new, 4))</div>
  <div class="fx" data-lang="text">before: pred 1.75  error 3.25
p_new [1.4775 0.6575]  q_new [1.81   0.6575]
after:  pred 3.1066  error 1.8934</div>
  <h3>The full loop</h3>
  <p>Start with small random vectors (all zeros would never move: e q = 0 when q = 0), shuffle the 15 ratings each epoch, apply the update to each one.</p>
  <div class="fx" data-lang="py">def train_sgd(R, k=2, lr=0.05, lam=0.05, epochs=400, seed=0, log=()):
    rng = np.random.default_rng(seed)
    P = rng.normal(0, 0.5, (R.shape[0], k))
    Q = rng.normal(0, 0.5, (R.shape[1], k))
    us, its = np.nonzero(R)                       # the observed (u, i) pairs
    for ep in range(1, epochs + 1):
        for n in rng.permutation(len(us)):        # shuffle every epoch
            u, i = us[n], its[n]
            e = R[u, i] - P[u] @ Q[i]
            P[u], Q[i] = (P[u] + lr * (e * Q[i] - lam * P[u]),
                          Q[i] + lr * (e * P[u] - lam * Q[i]))
        if ep in log:
            err = (R - P @ Q.T)[R &gt; 0]
            loss = (err ** 2).sum() + lam * ((P ** 2).sum() + (Q ** 2).sum())
            print(f"epoch {ep:4d}  loss {loss:7.3f}  train RMSE {np.sqrt((err ** 2).mean()):.3f}")
    return P, Q

P_sgd, Q_sgd = train_sgd(R, log=(1, 10, 50, 100, 400))
print((P_sgd @ Q_sgd.T).round(2))
print("Ben -&gt; Interstellar =", (P_sgd[1] @ Q_sgd[1]).round(2))</div>
  <div class="fx" data-lang="text">epoch    1  loss 150.721  train RMSE 3.168
epoch   10  loss   5.160  train RMSE 0.483
epoch   50  loss   2.868  train RMSE 0.270
epoch  100  loss   2.781  train RMSE 0.255
epoch  400  loss   2.833  train RMSE 0.264
[[4.93 3.87 1.   1.48 1.98]
 [3.87 3.04 0.78 1.16 1.55]
 [1.   0.95 4.48 4.36 2.58]
 [2.37 2.01 4.32 4.35 2.91]]
Ben -&gt; Interstellar = 3.04</div>
  <p>The loss drops from 150.7 to 2.87 within 50 epochs. Ben → Interstellar = <strong>3.04</strong>: the model learned that Ben's vector points the same way as Inception's and Interstellar's. The tuple assignment <code>P[u], Q[i] = (..., ...)</code> computes both right-hand sides before assigning, so the Q update uses the old P[u], exactly as in the hand step.</p>
  <p>A surprise: the loss at epoch 400 (2.833) is slightly <em>higher</em> than at epoch 100 (2.781). With a constant learning rate, SGD never settles exactly; it keeps jittering around the minimum because each step follows one rating, not the whole loss. Real implementations decay the learning rate or stop early on validation error.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SGD for MF</strong> (Funk, 2006): for each observed (u, i) in random order, e = r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>; p<sub>u</sub> ← p<sub>u</sub> + η(e q<sub>i</sub> − λ p<sub>u</sub>); q<sub>i</sub> ← q<sub>i</sub> + η(e p<sub>u</sub> − λ q<sub>i</sub>). Cost per epoch O(|Ω| k). Hyperparameters: k, η, λ, number of epochs, initial scale.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Too large a learning rate makes the factors explode (the product p·q grows quadratically); too small needs thousands of epochs. Initialise with small random values (not zeros, not large), and watch held-out RMSE per epoch.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ALS.</b> SGD works but needs a learning rate, many passes and visits ratings one at a time, which is hard to spread across machines. Is there an update that jumps straight to the best vector?</div>

  <h2 id="mf-als"><span class="num">04</span>Alternating Least Squares (ALS)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 02 noted that the loss is a simple ridge regression once one side is frozen. Can we use that to compute each user's best vector exactly, with no learning rate?</p>
  </div>
  <h3>Freeze the films, solve the user</h3>
  <p>If Q is fixed, Ben's part of the loss is Σ<sub>i rated by Ben</sub> (r<sub>Ben,i</sub> − p·q<sub>i</sub>)² + λ‖p‖². That is <a class="xref" data-note="ml_ridge_lasso">ridge regression</a>: the film vectors he rated are the rows of the design matrix, his ratings are the targets, and p is the coefficient vector. Its exact solution:</p>
  <p style="text-align:center"><strong>p<sub>u</sub> = (Q<sub>u</sub>ᵀ Q<sub>u</sub> + λI)⁻¹ Q<sub>u</sub>ᵀ r<sub>u</sub></strong></p>
  <p>where Q<sub>u</sub> holds only the rows of films user u rated, and r<sub>u</sub> their ratings.</p>
  <h3>Ben's solve by hand</h3>
  <p>Freeze the hand-picked film vectors. Ben rated Inception (2, 0) → 4, Notebook (0, 2) → 1, Titanic (0.5, 2) → 1; λ = 0.1.</p>
  <ul>
    <li>Q<sub>B</sub>ᵀQ<sub>B</sub> = sum of q qᵀ: [[4, 0], [0, 0]] + [[0, 0], [0, 4]] + [[0.25, 1], [1, 4]] = [[4.25, 1], [1, 8]]; add λI → <strong>[[4.35, 1], [1, 8.1]]</strong>.</li>
    <li>Q<sub>B</sub>ᵀr<sub>B</sub> = 4 × (2, 0) + 1 × (0, 2) + 1 × (0.5, 2) = <strong>(8.5, 4)</strong>.</li>
    <li>Determinant = 4.35 × 8.1 − 1 × 1 = 34.235. Inverse = (1/34.235) [[8.1, −1], [−1, 4.35]].</li>
    <li>p<sub>Ben</sub> = (8.1 × 8.5 − 4, −8.5 + 4.35 × 4) / 34.235 = (64.85, 8.9) / 34.235 = <strong>(1.894, 0.260)</strong>.</li>
    <li>Ben → Interstellar = 1.894 × 1.5 + 0.260 × 0.5 = 2.841 + 0.130 = <strong>2.971</strong>.</li>
  </ul>
  <div class="fx" data-lang="py"># ALS half-step for Ben: freeze the hand-picked item vectors Q, solve Ben's vector exactly
lam = 0.1
rated = M[1]                                   # Inception, Notebook, Titanic
Qb, rb = Q[rated], R[1, rated]
A = Qb.T @ Qb + lam * np.eye(2)
b = Qb.T @ rb
print("Q_B^T Q_B + lam*I =", A.tolist())
print("Q_B^T r_B         =", b.tolist())
p_ben = np.linalg.solve(A, b)
print("Ben's new vector  =", p_ben.round(3))
print("Ben -&gt; Interstellar =", round(p_ben @ Q[1], 3), "  fitted:", (Qb @ p_ben).round(2), "vs", rb)</div>
  <div class="fx" data-lang="text">Q_B^T Q_B + lam*I = [[4.35, 1.0], [1.0, 8.1]]
Q_B^T r_B         = [8.5, 4.0]
Ben's new vector  = [1.894 0.26 ]
Ben -&gt; Interstellar = 2.971   fitted: [3.79 0.52 1.47] vs [4. 1. 1.]</div>
  <p>Ben's fitted ratings are (3.79, 0.52, 1.47) against his real (4, 1, 1): the best a straight-line fit through these three frozen film vectors can do, shrunk slightly by λ.</p>
  <h3>Alternate</h3>
  <p>Solve every user with Q frozen, then every film with P frozen (the mirror formula q<sub>i</sub> = (P<sub>i</sub>ᵀP<sub>i</sub> + λI)⁻¹P<sub>i</sub>ᵀr<sub>i</sub>), and repeat. Each half-step gives the exact minimum for that half, so the loss can never increase.</p>
  <div class="fx" data-lang="py">def train_als(R, k=2, lam=0.1, iters=10, seed=0, log=()):
    rng = np.random.default_rng(seed)
    M = R &gt; 0
    P = rng.normal(0, 0.5, (R.shape[0], k))
    Q = rng.normal(0, 0.5, (R.shape[1], k))
    I = np.eye(k)
    for it in range(1, iters + 1):
        for u in range(R.shape[0]):               # freeze Q: one small ridge regression per user
            Qu = Q[M[u]]
            P[u] = np.linalg.solve(Qu.T @ Qu + lam * I, Qu.T @ R[u, M[u]])
        for i in range(R.shape[1]):               # freeze P: one small ridge regression per item
            Pi = P[M[:, i]]
            Q[i] = np.linalg.solve(Pi.T @ Pi + lam * I, Pi.T @ R[M[:, i], i])
        if it in log:
            err = (R - P @ Q.T)[M]
            loss = (err ** 2).sum() + lam * ((P ** 2).sum() + (Q ** 2).sum())
            print(f"iter {it:2d}  loss {loss:6.3f}  train RMSE {np.sqrt((err ** 2).mean()):.3f}")
    return P, Q

P_als, Q_als = train_als(R, log=(1, 2, 3, 5, 10))
print((P_als @ Q_als.T).round(2))
print("Ben -&gt; Interstellar =", (P_als[1] @ Q_als[1]).round(2))
print("item vectors:", Q_als.round(2).tolist())</div>
  <div class="fx" data-lang="text">iter  1  loss 13.704  train RMSE 0.439
iter  2  loss 10.109  train RMSE 0.284
iter  3  loss  8.999  train RMSE 0.259
iter  5  loss  7.762  train RMSE 0.253
iter 10  loss  6.237  train RMSE 0.251
[[5.04 3.96 1.01 1.49 2.  ]
 [3.9  3.07 0.82 1.19 1.57]
 [1.01 0.97 4.53 4.42 2.61]
 [2.37 2.03 4.46 4.5  2.98]]
Ben -&gt; Interstellar = 3.07
item vectors: [[-0.12, -1.38], [-0.15, -1.07], [-1.38, 0.04], [-1.33, -0.1], [-0.74, -0.38]]</div>
  <p>Train RMSE is 0.253 by sweep 5 and barely changes after; Ben → Interstellar = <strong>3.07</strong>, close to SGD's 3.04. Look at the film vectors: Inception (−0.12, −1.38) and Interstellar (−0.15, −1.07) point the same way, Notebook (−1.38, 0.04) and Titanic (−1.33, −0.10) another way. The two genres were found without being told, though with negative signs (section 09 explains why that is fine). The loss keeps falling (7.76 → 6.24) while RMSE is flat: ALS is still rebalancing the sizes of P and Q to lower the penalty, without changing the predictions much.</p>
  <table class="tbl"><caption>SGD vs ALS</caption>
    <tr><th></th><th>SGD</th><th>ALS</th></tr>
    <tr><td>Update</td><td>small step per rating</td><td>exact ridge solve per user / item</td></tr>
    <tr><td>Learning rate</td><td>needed, sensitive</td><td>none</td></tr>
    <tr><td>Cost</td><td>O(|Ω|k) per epoch</td><td>O(|Ω|k² + (m + n)k³) per sweep</td></tr>
    <tr><td>Parallel</td><td>awkward (shared vectors)</td><td>easy: users independent given Q</td></tr>
    <tr><td>Our toy</td><td>Ben → Interstellar 3.04, ~50+ epochs</td><td>3.07, ~5 sweeps</td></tr>
    <tr><td>Best for</td><td>explicit ratings, custom losses, biases, streaming</td><td>implicit data with all cells (section 08), Spark</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Alternating least squares</strong>: block coordinate descent on the MF loss. Fix Q and set each p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; fix P and set each q<sub>i</sub> = (P<sub>i</sub>ᵀP<sub>i</sub> + λI)⁻¹P<sub>i</sub>ᵀr<sub>i</sub>; repeat. Monotone in the loss; converges to a stationary point (not guaranteed global).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting λI. A user with fewer ratings than k (or with ratings only on parallel film vectors) makes Q<sub>u</sub>ᵀQ<sub>u</sub> singular and the solve fails or explodes. The λI term is what makes every solve well defined.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Biases.</b> Both methods spend factor capacity on something simple: Ben gives everyone low marks (mean 2.00) and Dia gives high ones (3.50). Can we model "who rates high" and "what is liked by everyone" separately, so the factors only need to capture taste?</div>

  <h2 id="mf-bias"><span class="num">05</span>Biases: Global, User, Item</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A dot product has to explain everything: Ben's harshness, Interstellar's general reception and Ben's sci-fi taste. Can we pull the first two out into simple numbers?</p>
  </div>
  <h3>Baseline predictor by hand</h3>
  <p>The simplest model with no taste at all: r̂ = μ + b<sub>u</sub> + b<sub>i</sub>. The global mean μ = 43/15 = 2.867. A user bias says how far a user's average sits from μ; an item bias says how far a film's ratings sit from what its raters usually give.</p>
  <table class="tbl"><caption>User biases b<sub>u</sub> = user mean − μ</caption>
    <tr><th>User</th><th>mean</th><th>b<sub>u</sub></th></tr>
    <tr><td>Asha</td><td>3.00</td><td>+0.133</td></tr>
    <tr><td>Ben</td><td>2.00</td><td><strong>−0.867</strong> (a strict rater)</td></tr>
    <tr><td>Chen</td><td>2.75</td><td>−0.117</td></tr>
    <tr><td>Dia</td><td>3.50</td><td>+0.633</td></tr>
  </table>
  <p>Now the leftovers r − μ − b<sub>u</sub> = r − user mean, averaged per film:</p>
  <table class="tbl"><caption>Item biases b<sub>i</sub> = mean of (r − user mean) over the film's raters</caption>
    <tr><th>Film</th><th>leftovers</th><th>b<sub>i</sub></th><th>shrunk, λ<sub>b</sub> = 2</th></tr>
    <tr><td>Inception</td><td>Asha 5 − 3 = 2, Ben 4 − 2 = 2, Chen 1 − 2.75 = −1.75</td><td>2.25/3 = +0.75</td><td>2.25/5 = +0.45</td></tr>
    <tr><td>Interstellar</td><td>Asha +1, Chen −1.75, Dia −1.5</td><td>−2.25/3 = −0.75</td><td>−0.45</td></tr>
    <tr><td>Notebook</td><td>Asha −2, Ben −1, Chen +2.25, Dia +0.5</td><td>−0.25/4 = −0.0625</td><td>−0.25/6 = −0.042</td></tr>
    <tr><td>Titanic</td><td>Ben −1, Chen +1.25, Dia +1.5</td><td>1.75/3 = +0.583</td><td>+0.35</td></tr>
    <tr><td>Toy Story</td><td>Asha −1, Dia −0.5</td><td>−1.5/2 = −0.75</td><td>−1.5/4 = −0.375</td></tr>
  </table>
  <p>Baseline Ben → Interstellar = 2.867 − 0.867 − 0.75 = <strong>1.25</strong>. The baseline says "strict rater, unpopular film". It has no idea Ben is a sci-fi fan; that is exactly the job left for the factors. The <strong>shrunk</strong> version divides by n<sub>i</sub> + λ<sub>b</sub> instead of n<sub>i</sub>: a film with 2 ratings (Toy Story) moves halfway to 0 (−0.75 → −0.375), a film with 4 only a third of the way. Few ratings, little trust.</p>
  <div class="fx" data-lang="py">mu = R[M].mean()
bu = np.array([R[u, M[u]].mean() - mu for u in range(4)])             # user bias = user mean - mu
resid = np.where(M, R - mu - bu[:, None], np.nan)                     # what is left after mu + b_u
bi = np.nanmean(resid, axis=0)                                        # item bias = mean leftover
print("mu =", round(mu, 3))
print("user bias b_u:", {n: float(v) for n, v in zip(users, bu.round(3))})
print("item bias b_i:", {n: float(v) for n, v in zip(films, bi.round(3))})
print("baseline Ben -&gt; Interstellar = mu + b_Ben + b_Int =", round(mu + bu[1] + bi[1], 3))
# shrunk item bias: divide by (n_i + lam_b) instead of n_i, so items with few ratings stay near 0
lam_b = 2
bi_shrunk = np.nansum(resid, axis=0) / ((~np.isnan(resid)).sum(0) + lam_b)
print("shrunk item bias (lam_b = 2):", {n: float(v) for n, v in zip(films, bi_shrunk.round(3))})
base = mu + bu[:, None] + bi[None, :]
print("baseline train RMSE:", round(np.sqrt(((R - base)[M] ** 2).mean()), 3),
      "  global-mean-only RMSE:", round(np.sqrt(((R - mu)[M] ** 2).mean()), 3))</div>
  <div class="fx" data-lang="text">mu = 2.867
user bias b_u: {'Asha': 0.133, 'Ben': -0.867, 'Chen': -0.117, 'Dia': 0.633}
item bias b_i: {'Inception': 0.75, 'Interstellar': -0.75, 'Notebook': -0.062, 'Titanic': 0.583, 'Toy Story': -0.75}
baseline Ben -&gt; Interstellar = mu + b_Ben + b_Int = 1.25
shrunk item bias (lam_b = 2): {'Inception': 0.45, 'Interstellar': -0.45, 'Notebook': -0.042, 'Titanic': 0.35, 'Toy Story': -0.375}
baseline train RMSE: 1.371   global-mean-only RMSE: 1.586</div>
  <p>Biases alone cut train RMSE from 1.586 (predict μ for everything) to 1.371. Cheap, and still the standard baseline every recommender must beat.</p>
  <h3>Biased MF</h3>
  <p style="text-align:center"><strong>r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub> · q<sub>i</sub></strong></p>
  <p>Trained with SGD on the same squared error plus λ(b<sub>u</sub>² + b<sub>i</sub>² + ‖p<sub>u</sub>‖² + ‖q<sub>i</sub>‖²). The gradient of the error with respect to a bias is just −e, so the updates are b<sub>u</sub> ← b<sub>u</sub> + η(e − λb<sub>u</sub>) and b<sub>i</sub> ← b<sub>i</sub> + η(e − λb<sub>i</sub>); p and q update as before. This is the model that won much of the Netflix Prize, usually just called "SVD" in libraries (Surprise's <code>SVD</code>, for example).</p>
  <div class="fx" data-lang="py">def train_biased_sgd(R, k=2, lr=0.02, lam=0.05, epochs=300, seed=0):
    rng = np.random.default_rng(seed)
    nu, ni = R.shape
    us, its = np.nonzero(R)
    mu = R[R &gt; 0].mean()
    bu, bi = np.zeros(nu), np.zeros(ni)
    P = rng.normal(0, 0.1, (nu, k)); Q = rng.normal(0, 0.1, (ni, k))
    for ep in range(epochs):
        for n in rng.permutation(len(us)):
            u, i = us[n], its[n]
            e = R[u, i] - (mu + bu[u] + bi[i] + P[u] @ Q[i])
            bu[u] += lr * (e - lam * bu[u])
            bi[i] += lr * (e - lam * bi[i])
            P[u], Q[i] = (P[u] + lr * (e * Q[i] - lam * P[u]),
                          Q[i] + lr * (e * P[u] - lam * Q[i]))
    return mu, bu, bi, P, Q

mu_, bu_, bi_, Pb, Qb_ = train_biased_sgd(R)
full = mu_ + bu_[:, None] + bi_[None, :] + Pb @ Qb_.T
print("user bias", bu_.round(2), "  item bias", bi_.round(2))
print("train RMSE", round(np.sqrt(((R - full)[M] ** 2).mean()), 3))
print(f"Ben -&gt; Interstellar = mu {mu_:.2f} {bu_[1]:+.2f} {bi_[1]:+.2f} {Pb[1] @ Qb_[1]:+.2f} = {full[1, 1]:.2f}")</div>
  <div class="fx" data-lang="text">user bias [ 0.01 -0.57 -0.11  0.36]   item bias [ 0.23 -0.29  0.01  0.17 -0.47]
train RMSE 0.076
Ben -&gt; Interstellar = mu 2.87 -0.57 -0.29 +1.11 = 3.11</div>
  <p>Read the answer piece by piece: start from the average 2.87, subtract 0.57 because Ben is strict, subtract 0.29 because Interstellar gets lukewarm ratings, then add 1.11 because Ben's taste vector lines up with Interstellar's: <strong>3.11</strong> (the parts sum to 3.12 before rounding). Every term is explainable. The learned biases are smaller than the hand ones (Ben −0.57 vs −0.867) because λ shrinks them and the factors explain part of the deviation.</p>
  <p>Now the warning: train RMSE 0.076. The model has 1 + 4 + 5 + 18 = 28 numbers for 15 ratings; it can nearly memorise. A tiny train error tells us nothing about the blanks.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Baseline (bias) predictor</strong> b<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub>. <strong>Biased MF</strong> r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub>, minimising Σ<sub>Ω</sub>(r<sub>ui</sub> − r̂<sub>ui</sub>)² + λ(b<sub>u</sub>² + b<sub>i</sub>² + ‖p<sub>u</sub>‖² + ‖q<sub>i</sub>‖²). The factors model the <em>interaction</em> left after the main effects.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ranking by the full prediction for top-k lists and forgetting what the biases do there: b<sub>u</sub> is the same for all of a user's films, so it cannot change their order; b<sub>i</sub> pushes generally liked films up for everyone, which is a source of popularity bias (see <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Held-out tuning.</b> Train RMSE 0.076 cannot be trusted. How do we know whether k = 2 and λ = 0.05 are right, and whether MF beats the plain baseline on ratings it has not seen?</div>

  <h2 id="mf-tune"><span class="num">06</span>Overfitting, k and λ: Held-Out Evaluation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Fifteen ratings are too few to hold any out. How do we measure MF honestly and choose k (number of factors) and λ (penalty)?</p>
  </div>
  <p>Hide some known ratings, train on the rest, and measure RMSE on the hidden ones (the same idea as <a class="xref" data-note="ml_splits">train/validation/test splits</a>). To have enough data, we build a bigger cinema in exactly the same way as our toy: 300 users, 80 films, 3 hidden tastes, user and film biases, rating noise, about 20% of cells rated, 20% of those hidden as a test set.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student who memorises the answers to last year's paper scores 100% on it. To know whether they learnt the subject, give them questions they have not seen.</p>
  </div>
  <div class="fx" data-lang="py"># a bigger cinema built the same way: 300 users x 80 films, 3 hidden tastes, ~20% of cells rated
rng = np.random.default_rng(42)
nu, ni, k_true = 300, 80, 3
Pt = rng.normal(0, 0.7, (nu, k_true)); Qt = rng.normal(0, 0.7, (ni, k_true))
true = 3.2 + rng.normal(0, 0.4, nu)[:, None] + rng.normal(0, 0.4, ni)[None, :] + Pt @ Qt.T
obs = rng.random((nu, ni)) &lt; 0.20
noisy = np.clip(np.round(true + rng.normal(0, 0.5, (nu, ni))), 1, 5)
test = obs &amp; (rng.random((nu, ni)) &lt; 0.2)               # hide 20% of the known ratings
Rtr = np.where(obs &amp; ~test, noisy, 0.0)
print("train ratings", int((Rtr &gt; 0).sum()), " test ratings", int(test.sum()))

def rmse(pred, mask): return np.sqrt(((noisy - pred)[mask] ** 2).mean())
mu_b = Rtr[Rtr &gt; 0].mean()
print(f"global mean only       test RMSE {rmse(np.full((nu, ni), mu_b), test):.3f}")
m0, bu0, bi0, P0, Q0 = train_biased_sgd(Rtr, k=0, lam=0.1, epochs=60)
print(f"biases only (k=0)      test RMSE {rmse(m0 + bu0[:, None] + bi0[None, :], test):.3f}")
for lam in [0.0, 0.05, 0.2, 0.5]:
    m, b1, b2, P_, Q_ = train_biased_sgd(Rtr, k=3, lam=lam, epochs=60)
    pred = m + b1[:, None] + b2[None, :] + P_ @ Q_.T
    print(f"MF k=3, lam={lam:&lt;4}      train RMSE {rmse(pred, Rtr &gt; 0):.3f}  test RMSE {rmse(pred, test):.3f}")
for k in [1, 2, 3, 5, 10]:
    m, b1, b2, P_, Q_ = train_biased_sgd(Rtr, k=k, lam=0.1, epochs=60)
    pred = m + b1[:, None] + b2[None, :] + P_ @ Q_.T
    print(f"MF k={k:&lt;2}, lam=0.1      train RMSE {rmse(pred, Rtr &gt; 0):.3f}  test RMSE {rmse(pred, test):.3f}")</div>
  <div class="fx" data-lang="text">train ratings 3854  test ratings 949
global mean only       test RMSE 1.087
biases only (k=0)      test RMSE 0.982
MF k=3, lam=0.0       train RMSE 0.451  test RMSE 0.815
MF k=3, lam=0.05      train RMSE 0.465  test RMSE 0.768
MF k=3, lam=0.2       train RMSE 0.590  test RMSE 0.809
MF k=3, lam=0.5       train RMSE 0.870  test RMSE 0.978
MF k=1 , lam=0.1      train RMSE 0.723  test RMSE 0.930
MF k=2 , lam=0.1      train RMSE 0.618  test RMSE 0.854
MF k=3 , lam=0.1      train RMSE 0.495  test RMSE 0.766
MF k=5 , lam=0.1      train RMSE 0.458  test RMSE 0.788
MF k=10, lam=0.1      train RMSE 0.396  test RMSE 0.792</div>
  <p>Read it top to bottom as a ladder of models:</p>
  <ul>
    <li><strong>Global mean</strong> 1.087 → <strong>biases</strong> 0.982 → <strong>MF</strong> 0.766. The taste factors are worth far more than the biases here.</li>
    <li><strong>λ is a U-shape</strong> (k = 3): λ = 0 has the lowest train RMSE (0.451) but test 0.815; λ = 0.05 gives test 0.768; λ = 0.5 shrinks so hard that train RMSE is 0.870 and test 0.978, almost back to the baseline. The classic bias-variance trade-off (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>).</li>
    <li><strong>k</strong> (λ = 0.1): k = 1 → 0.930, k = 2 → 0.854, k = 3 → 0.766, then k = 5 → 0.788 and k = 10 → 0.792. Train RMSE keeps falling as k grows; test is best at the true number of tastes (3). Extra factors fit noise.</li>
  </ul>
  <p>In practice: pick λ and k with a validation set (or k-fold over ratings), use early stopping on validation RMSE for SGD, and report the final number on a separate test set. For deployment, split by <strong>time</strong> (train on the past, test on the future), so the model is never trained on a user's future to predict their past.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RMSE</strong> on held-out ratings = √(mean of (r − r̂)² over the test cells). The standard rating-prediction metric (Netflix Prize). Hyperparameters of MF: k, λ (sometimes separate λ for biases and factors), learning rate and epochs (SGD) or sweeps (ALS), initial scale.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing k by train error ("more factors always help") or reporting train RMSE. Also: a random split of ratings leaks the future in real systems. And a better RMSE does not guarantee better top-10 lists; that is measured with ranking metrics in the next note.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SVD vs Funk-SVD.</b> This model is often called "SVD", yet the SVD from linear algebra needs a full matrix. What is the real SVD, why not just use it, and how does it relate to what we built?</div>

  <h2 id="mf-svd"><span class="num">07</span>SVD vs Funk-SVD</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Linear algebra already has a perfect tool for "best low-rank approximation": the singular value decomposition. Why did we invent our own training loop?</p>
  </div>
  <h3>The real SVD</h3>
  <p>Any full matrix A (m × n) can be written A = U Σ Vᵀ: U's columns are orthonormal "user patterns", V's are orthonormal "item patterns", Σ is a diagonal of singular values s<sub>1</sub> ≥ s<sub>2</sub> ≥ … ≥ 0 saying how much each pattern matters (see <a class="xref" data-note="m_linalg">Linear Algebra</a> and <a class="xref" data-note="ml_pca">PCA</a>, which is SVD of a centred data matrix). Keeping the top k gives A<sub>k</sub> = U<sub>k</sub>Σ<sub>k</sub>V<sub>k</sub>ᵀ, and the Eckart–Young theorem says no rank-k matrix has smaller squared error <em>over all cells</em>. Set P = U<sub>k</sub>Σ<sub>k</sub><sup>1/2</sup> and Q = V<sub>k</sub>Σ<sub>k</sub><sup>1/2</sup> and you have a factorization.</p>
  <p>The catch is "over all cells". Our matrix has blanks. Section 02 showed what zeros do. The better classical patch: fill each blank with that user's mean, centre each row, take the SVD, add the means back.</p>
  <p><strong>By hand</strong>, the filled, centred toy matrix (each user's mean subtracted; blanks become 0 = "exactly average"):</p>
  <table class="tbl"><caption>Mean-filled, row-centred R</caption>
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th></tr>
    <tr><td>Asha (3.00)</td><td>2</td><td>1</td><td>−2</td><td>0 (filled)</td><td>−1</td></tr>
    <tr><td>Ben (2.00)</td><td>2</td><td>0 (filled)</td><td>−1</td><td>−1</td><td>0 (filled)</td></tr>
    <tr><td>Chen (2.75)</td><td>−1.75</td><td>−1.75</td><td>2.25</td><td>1.25</td><td>0 (filled)</td></tr>
    <tr><td>Dia (3.50)</td><td>0 (filled)</td><td>−1.5</td><td>0.5</td><td>1.5</td><td>−0.5</td></tr>
  </table>
  <div class="fx" data-lang="py"># classic SVD needs a FULL matrix, so first fill blanks with each user's mean
def svd_impute(Rm, k):
    Mk = Rm &gt; 0
    um = np.array([Rm[u, Mk[u]].mean() for u in range(Rm.shape[0])])
    F = np.where(Mk, Rm, um[:, None]) - um[:, None]    # filled, then centred per user
    U, s, Vt = np.linalg.svd(F, full_matrices=False)
    return um[:, None] + (U[:, :k] * s[:k]) @ Vt[:k], s  # rank-k approximation, means added back

S2, sv = svd_impute(R, 2)
print("toy: singular values", sv.round(2), "  Ben -&gt; Interstellar (k=2) =", S2[1, 1].round(2))
for k in [2, 3, 5]:
    print(f"bigger cinema, mean-filled SVD k={k}:  test RMSE {rmse(svd_impute(Rtr, k)[0], test):.3f}")
for lam in [1, 5]:
    Pa, Qa = train_als(Rtr, k=3, lam=lam, iters=15)
    print(f"bigger cinema, ALS k=3 lam={lam} (no biases): test RMSE {rmse(Pa @ Qa.T, test):.3f}")</div>
  <div class="fx" data-lang="text">toy: singular values [5.21 2.2  1.29 0.3 ]   Ben -&gt; Interstellar (k=2) = 2.62
bigger cinema, mean-filled SVD k=2:  test RMSE 1.035
bigger cinema, mean-filled SVD k=3:  test RMSE 1.022
bigger cinema, mean-filled SVD k=5:  test RMSE 1.009
bigger cinema, ALS k=3 lam=1 (no biases): test RMSE 0.872
bigger cinema, ALS k=3 lam=5 (no biases): test RMSE 0.905</div>
  <p>The singular values 5.21, 2.20, 1.29, 0.30 say the first two patterns hold (5.21² + 2.20²)/(5.21² + 2.20² + 1.29² + 0.30²) ≈ 31.98/33.73 = 95% of the variation: the toy really is close to rank 2. But mean-filled SVD predicts Ben → Interstellar = 2.62, pulled toward Ben's mean because his blank was treated as an observed "exactly 2.00". On the bigger cinema its test RMSE is about 1.02 (k = 2–5), worse than the biases-only baseline (0.982) and far behind biased MF trained on observed cells (0.766). Plain ALS without biases (0.872) sits in between.</p>
  <h3>What "Funk-SVD" really is</h3>
  <table class="tbl">
    <tr><th></th><th>True (truncated) SVD</th><th>"SVD" in recommenders (Funk-SVD / biased MF)</th></tr>
    <tr><td>Input</td><td>full matrix (blanks must be filled)</td><td>observed cells only</td></tr>
    <tr><td>Factors</td><td>orthonormal U, V and singular values Σ</td><td>any P, Q; no orthogonality, no Σ</td></tr>
    <tr><td>Fitted by</td><td>exact linear algebra, unique</td><td>SGD or ALS on a non-convex loss, many solutions</td></tr>
    <tr><td>Regularised</td><td>no</td><td>yes, λ</td></tr>
    <tr><td>Biases</td><td>no</td><td>usually μ + b<sub>u</sub> + b<sub>i</sub></td></tr>
    <tr><td>Our numbers</td><td>Ben → Interstellar 2.62; test RMSE ≈ 1.02</td><td>3.11; test RMSE 0.766</td></tr>
  </table>
  <p>Simon Funk's 2006 Netflix Prize blog post called his SGD method "SVD" because the result looks like a low-rank factorization; the name stuck. Extensions: <strong>SVD++</strong> adds an implicit term (the films a user chose to rate say something even before the stars), <strong>timeSVD++</strong> lets biases drift over time, and <strong>NMF</strong> (non-negative MF) forces all factors ≥ 0, so each user is an additive mix of parts, which is easier to read but usually a little less accurate.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Truncated SVD</strong>: A<sub>k</sub> = Σ<sub>j≤k</sub> s<sub>j</sub> u<sub>j</sub> v<sub>j</sub>ᵀ, the best rank-k approximation in Frobenius norm of a fully observed A. <strong>Funk-SVD</strong>: regularised MF fitted by SGD on observed entries only; a factorization, but not a singular value decomposition.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saying "we used SVD" in an interview without saying which. If it was numpy/scipy SVD or sklearn TruncatedSVD on a filled matrix, the imputation choice dominates the result; if it was Surprise's SVD, it is biased MF with SGD.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Implicit feedback.</b> Everything so far used stars. Most real logs only have plays, clicks and purchases, and there a blank is not "unknown rating" but "probably not interested, or never saw it". How do we factorize that?</div>

  <h2 id="mf-implicit"><span class="num">08</span>Implicit Feedback: Weighted ALS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With plays instead of stars, there are no negative examples at all; every known cell is positive. If we fit only the known cells, the model can predict "loves it" everywhere. If we fit blanks as 0, we call every unseen film a dislike. What is in between?</p>
  </div>
  <h3>Preference and confidence</h3>
  <p>Hu, Koren and Volinsky (2008) split each cell into two numbers:</p>
  <ul>
    <li><strong>Preference</strong> p<sub>ui</sub> = 1 if the user interacted at all, else 0. This is the target.</li>
    <li><strong>Confidence</strong> c<sub>ui</sub> = 1 + α r<sub>ui</sub>, where r<sub>ui</sub> counts plays (or minutes, purchases). Many plays → we are very sure of the 1; zero plays → a weak "probably 0" with weight 1.</li>
  </ul>
  <p style="text-align:center">L = Σ<sub>all u, i</sub> c<sub>ui</sub> (p<sub>ui</sub> − x<sub>u</sub>·y<sub>i</sub>)² + λ(Σ‖x<sub>u</sub>‖² + Σ‖y<sub>i</sub>‖²)</p>
  <p>Every cell counts now, so there is no masking, and the loss is a <em>weighted</em> ridge regression for each user given Y: x<sub>u</sub> = (YᵀC<sub>u</sub>Y + λI)⁻¹ YᵀC<sub>u</sub>p<sub>u</sub>, with C<sub>u</sub> = diag(c<sub>u1</sub>, …, c<sub>un</sub>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A librarian notices which books you borrow. A book you borrowed five times is clearly yours; one you never borrowed is probably not, but maybe you never saw it on the shelf. She trusts the first fact strongly and the second only weakly.</p>
  </div>
  <h3>Ben's update by hand</h3>
  <p>Re-read the same matrix as play counts: Ben played Inception 4 times, Notebook 1, Titanic 1, never Interstellar or Toy Story. With α = 2: p<sub>Ben</sub> = (1, 0, 1, 1, 0), c<sub>Ben</sub> = (9, 1, 3, 3, 1). Freeze the hand film vectors Y = Q.</p>
  <ul>
    <li>YᵀC<sub>Ben</sub>Y = Σ c<sub>i</sub> y<sub>i</sub>y<sub>i</sub>ᵀ = 9[[4, 0], [0, 0]] + 1[[2.25, 0.75], [0.75, 0.25]] + 3[[0, 0], [0, 4]] + 3[[0.25, 1], [1, 4]] + 1[[1, 1], [1, 1]] = [[40, 4.75], [4.75, 25.25]]; + λI → <strong>[[40.1, 4.75], [4.75, 25.35]]</strong>.</li>
    <li>YᵀC<sub>Ben</sub>p<sub>Ben</sub> = 9(2, 0) + 3(0, 2) + 3(0.5, 2) = <strong>(19.5, 12)</strong> (the unplayed films have p = 0 and drop out here, but they did count in the matrix above).</li>
    <li>det = 40.1 × 25.35 − 4.75² = 1016.535 − 22.5625 = 993.97; x<sub>Ben</sub> = (25.35 × 19.5 − 4.75 × 12, −4.75 × 19.5 + 40.1 × 12)/993.97 = (437.325, 388.575)/993.97 = <strong>(0.440, 0.391)</strong>.</li>
    <li>Scores for unplayed films: Interstellar 1.5 × 0.440 + 0.5 × 0.391 = 0.855; Toy Story 0.440 + 0.391 = 0.831. Interstellar ranks first.</li>
  </ul>
  <div class="fx" data-lang="py"># implicit view: read the same numbers as PLAY COUNTS; a blank = never played
plays = R.copy()
alpha, lam = 2.0, 0.1
pref = (plays &gt; 0).astype(float)                 # p_ui: 1 if played at all, else 0
conf = 1 + alpha * plays                         # c_ui: how sure we are about p_ui
print("Ben  p =", pref[1], "  c =", conf[1])
Cb = np.diag(conf[1])
A = Q.T @ Cb @ Q + lam * np.eye(2)               # every film counts, weighted by confidence
b = Q.T @ Cb @ pref[1]
print("Y^T C Y + lam*I =", A.round(4).tolist())
print("Y^T C p         =", b.tolist())
x_ben = np.linalg.solve(A, b)
print("Ben's vector =", x_ben.round(3), "  scores:", dict(zip(films, (Q @ x_ben).round(3).tolist())))</div>
  <div class="fx" data-lang="text">Ben  p = [1. 0. 1. 1. 0.]   c = [9. 1. 3. 3. 1.]
Y^T C Y + lam*I = [[40.1, 4.75], [4.75, 25.35]]
Y^T C p         = [19.5, 12.0]
Ben's vector = [0.44  0.391]   scores: {'Inception': 0.88, 'Interstellar': 0.855, 'Notebook': 0.782, 'Titanic': 1.002, 'Toy Story': 0.831}</div>
  <p>The scores are not ratings; they estimate preference (near 1 = likely to play) and are only used to <em>rank</em> films for a user.</p>
  <h3>The full algorithm, and the speed trick</h3>
  <p>Forming YᵀC<sub>u</sub>Y over all n films for every user would cost O(n k²) per user. But C<sub>u</sub> − I is zero except on the films the user played, so YᵀC<sub>u</sub>Y = <strong>YᵀY + Yᵀ(C<sub>u</sub> − I)Y</strong>: compute YᵀY once per sweep, then add a correction over just that user's played films. This is what makes implicit ALS run on millions of users (Spark MLlib's <code>ALS(implicitPrefs=True)</code>, the <code>implicit</code> Python library).</p>
  <div class="fx" data-lang="py">def implicit_als(plays, k=2, alpha=2.0, lam=0.1, iters=15, seed=0):
    rng = np.random.default_rng(seed)
    pref, conf = (plays &gt; 0).astype(float), 1 + alpha * plays
    X = rng.normal(0, 0.1, (plays.shape[0], k)); Y = rng.normal(0, 0.1, (plays.shape[1], k))
    I = np.eye(k)
    for _ in range(iters):
        YtY = Y.T @ Y                             # shared part, computed once per sweep
        for u in range(plays.shape[0]):
            cu = conf[u]                          # Y^T C_u Y = Y^T Y + Y^T (C_u - I) Y
            A = YtY + Y.T @ ((cu - 1)[:, None] * Y) + lam * I
            X[u] = np.linalg.solve(A, Y.T @ (cu * pref[u]))
        XtX = X.T @ X
        for i in range(plays.shape[1]):
            ci = conf[:, i]
            A = XtX + X.T @ ((ci - 1)[:, None] * X) + lam * I
            Y[i] = np.linalg.solve(A, X.T @ (ci * pref[:, i]))
    return X, Y

X, Y = implicit_als(plays)
S = X @ Y.T
print(S.round(2))
for u, name in enumerate(users):
    unplayed = [i for i in range(5) if plays[u, i] == 0]
    best = max(unplayed, key=lambda i: S[u, i])
    print(f"{name:5s} unplayed: {[films[i] for i in unplayed]} -&gt; recommend {films[best]} ({S[u, best]:.2f})")</div>
  <div class="fx" data-lang="text">[[ 0.91  1.02  0.98  0.91  0.98]
 [ 0.99  0.49  0.93  0.96 -0.17]
 [ 1.03  0.75  1.03  1.01  0.31]
 [ 0.92  1.03  0.99  0.91  0.99]]
Asha  unplayed: ['Titanic'] -&gt; recommend Titanic (0.91)
Ben   unplayed: ['Interstellar', 'Toy Story'] -&gt; recommend Interstellar (0.49)
Chen  unplayed: ['Toy Story'] -&gt; recommend Toy Story (0.31)
Dia   unplayed: ['Inception'] -&gt; recommend Inception (0.92)</div>
  <p>Ben's top unplayed film is Interstellar (0.49) and Toy Story is pushed below zero, the right order. But look at Asha → Titanic 0.91: high, even though Asha clearly dislikes romance in star terms. In the implicit view her 1-star Notebook is a <em>play</em>, so it counts as preference, and because almost everyone in our tiny table played almost everything, the model mostly learns "who plays what". This is the central limitation of implicit data: you lose dislikes, so use signals that mean engagement (completion, long watch time, repeat purchase), not just "started".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Implicit ALS</strong> (weighted matrix factorization): minimise Σ<sub>u,i</sub> c<sub>ui</sub>(p<sub>ui</sub> − x<sub>u</sub>ᵀy<sub>i</sub>)² + λ(Σ‖x<sub>u</sub>‖² + Σ‖y<sub>i</sub>‖²) with p<sub>ui</sub> = 𝟙[r<sub>ui</sub> &gt; 0] and c<sub>ui</sub> = 1 + α r<sub>ui</sub> (or 1 + α log(1 + r<sub>ui</sub>/ε)). Solved by ALS with x<sub>u</sub> = (YᵀY + Yᵀ(C<sub>u</sub> − I)Y + λI)⁻¹YᵀC<sub>u</sub>p<sub>u</sub>. Hyperparameters: k, λ, α.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Evaluating implicit models with RMSE. The target is 0/1 preference and almost all cells are 0; RMSE rewards predicting 0. Evaluate with ranking metrics on held-out interactions (precision@k, recall@k, NDCG). The alternative training approach, sampling unplayed films as negatives and learning "played &gt; not played" (BPR), is covered in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Embeddings.</b> We now have trained vectors for every user and film. What exactly are they, can we use them beyond predicting one cell, and how do they connect to the neural recommenders used in industry?</div>

  <h2 id="mf-embed"><span class="num">09</span>The Embeddings View &amp; Two-Tower Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The factors were tools for predicting ratings. Are they useful on their own: for "films like this one", for a user who joined five minutes ago, for searching millions of films fast?</p>
  </div>
  <h3>Users and films in one space</h3>
  <p>Each user and film is now a point in the same k-dimensional space, an <strong>embedding</strong> (see <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>). A user is close (high dot product) to films they will like; similar films are close to each other.</p>
  <figure class="viz"><svg viewBox="0 0 560 320" width="560">
<line x1="60" y1="280" x2="530" y2="280" stroke="currentColor"/><line x1="60" y1="280" x2="60" y2="20" stroke="currentColor"/>
<text x="295" y="312" text-anchor="middle" class="tm" font-size="11">factor 1 (sign-flipped) → "romance"</text>
<text x="22" y="150" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 22 150)">factor 2 (sign-flipped) → "sci-fi"</text>
<circle cx="67.2" cy="197.2" r="5" class="fb sb"/><text x="75.2" y="193.2" font-size="10.5">Inception (0.12, 1.38)</text>
<circle cx="69.0" cy="215.8" r="5" class="fb sb"/><text x="79.0" y="225.8" font-size="10.5">Interstellar (0.15, 1.07)</text>
<circle cx="142.8" cy="282.4" r="5" class="fr sr"/><text x="152.8" y="294.4" font-size="10.5">Notebook (1.38, −0.04)</text>
<circle cx="139.8" cy="274.0" r="5" class="fr sr"/><text x="149.8" y="268.0" font-size="10.5">Titanic (1.33, 0.10)</text>
<circle cx="104.4" cy="257.2" r="5" class="fv"/><text x="114.4" y="251.2" font-size="10.5">Toy Story (0.74, 0.38)</text>
<rect x="105.4" y="60.2" width="10" height="10" class="fg sg"/><text x="120.4" y="69.2" font-size="11">Asha (0.84, 3.58)</text>
<rect x="95.8" y="108.8" width="10" height="10" class="fg sg"/><text x="110.8" y="117.8" font-size="11" font-weight="700">Ben (0.68, 2.77)</text>
<rect x="252.39999999999998" y="248.6" width="10" height="10" class="ft st"/><text x="267.4" y="257.6" font-size="11">Chen (3.29, 0.44)</text>
<rect x="251.2" y="189.2" width="10" height="10" class="ft st"/><text x="266.2" y="198.2" font-size="11">Dia (3.27, 1.43)</text>
<line x1="60" y1="280" x2="100.8" y2="113.8" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="60" y1="280" x2="69.0" y2="215.8" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="360" y="40" class="tm" font-size="10.5">circles = films, squares = users</text>
<text x="360" y="56" class="tm" font-size="10.5">ALS vectors × −1 (1 unit = 60 px)</text>
<text x="360" y="72" class="tm" font-size="10.5">Ben and Interstellar point the same way</text>
</svg><figcaption>The explicit-ALS embeddings from section 04, with both axes sign-flipped (which changes no prediction). Sci-fi films and sci-fi fans point up; romance films and romance fans point right. Films sit close to the origin because their vectors are shorter than the users' vectors.</figcaption></figure>
  <div class="fx" data-lang="py"># the trained explicit ALS vectors ARE embeddings: users and films in one 2-D space
print("user vectors:", dict(zip(users, P_als.round(2).tolist())))
Qn = Q_als / np.linalg.norm(Q_als, axis=1, keepdims=True)
sim = Qn @ Qn.T                                          # item-item cosine in factor space
for i in [0, 2]:
    order = [j for j in np.argsort(-sim[i]) if j != i]
    print(f"most like {films[i]:9s}:", [(films[j], round(float(sim[i, j]), 2)) for j in order[:2]])

# fold in a brand-new user: Esha rates Inception 5 and Titanic 1; Q stays frozen
lam = 0.1
idx, r_new = np.array([0, 3]), np.array([5.0, 1.0])
Qe = Q_als[idx]
p_esha = np.linalg.solve(Qe.T @ Qe + lam * np.eye(2), Qe.T @ r_new)
print("Esha's vector", p_esha.round(2), " predicted:", dict(zip(films, (Q_als @ p_esha).round(2).tolist())))</div>
  <div class="fx" data-lang="text">user vectors: {'Asha': [-0.84, -3.58], 'Ben': [-0.68, -2.77], 'Chen': [-3.29, -0.44], 'Dia': [-3.27, -1.43]}
most like Inception: [('Interstellar', 1.0), ('Toy Story', 0.53)]
most like Notebook : [('Titanic', 0.99), ('Toy Story', 0.87)]
Esha's vector [-0.48 -3.4 ]  predicted: {'Inception': 4.75, 'Interstellar': 3.72, 'Notebook': 0.52, 'Titanic': 0.99, 'Toy Story': 1.66}</div>
  <p>Three uses, all from the same vectors:</p>
  <ul>
    <li><strong>Similar items</strong>: cosine between film vectors. Inception's nearest film is Interstellar (cosine 1.00 to two decimals), Notebook's is Titanic (0.99). This is item-item similarity learned through all users at once, not from raw co-ratings.</li>
    <li><strong>Fold-in</strong>: a new user Esha rates Inception 5 and Titanic 1. Keep Q frozen and do one ALS user-solve: her vector (−0.48, −3.40) sits next to Asha's and Ben's, and she gets Interstellar 3.72, Notebook 0.52. No retraining needed; this is the cheapest cold-start fix once a user has a few ratings.</li>
    <li><strong>Retrieval</strong>: a user's top-k films are the k largest dot products p<sub>u</sub>·q<sub>i</sub>. With millions of films that is a maximum-inner-product search, served by approximate nearest-neighbour indexes (<a class="xref" data-note="vectordb">Vector Databases</a>).</li>
  </ul>
  <h3>Why the axes have no fixed meaning</h3>
  <p>For any invertible k × k matrix T, (PT)(QT⁻ᵀ)ᵀ = PQᵀ: the predictions are identical. With the L2 penalty the solution is pinned down only up to rotations and sign flips (T orthogonal). That is why our trained factors came out negative and why "factor 1 = romance" is something we read off afterwards, not something the model promises. Cosines and dot products are unaffected; individual coordinates are not stable across retrains.</p>
  <h3>Dot product vs cosine</h3>
  <p>For recommendation, the dot product is what the model was trained on, and the vector's length carries meaning (a long film vector = strongly liked by its audience, often popular). For "similar items" cosine is usually better, because it ignores popularity and compares direction only. Asha's vector is longer than Ben's (3.68 vs 2.85), so her predicted ratings are more extreme in both directions.</p>
  <h3>From MF to two-tower models</h3>
  <p>MF looks up a user vector by user ID and a film vector by film ID. A <strong>two-tower</strong> model replaces each lookup with a small neural network (<a class="xref" data-note="dl_foundations">Deep Learning Foundations</a>): the user tower turns user features (ID, history, country, device, time) into a vector, the item tower turns item features (ID, genre, text, image embedding) into a vector, and the score is still their dot product. MF is exactly a two-tower model whose inputs are one-hot IDs and whose towers are a single linear layer. The gain: a new film with a description but no plays still gets a vector from the item tower, and the item vectors can be precomputed and indexed for fast retrieval. Two-tower models are usually trained on implicit data with sampled or in-batch negatives (a softmax over the true item and other items in the batch), which is a ranking loss, so the details live in the next note.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Embedding</strong>: a learned dense vector for a discrete object (user, item, word). <strong>Fold-in</strong>: computing a new user's (or item's) vector by solving its regression with the other side frozen. <strong>Two-tower model</strong>: score(u, i) = f<sub>θ</sub>(user features) · g<sub>φ</sub>(item features), with f and g neural networks; generalises MF to features and cold items.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing embeddings from two different training runs (or two different models) coordinate by coordinate. Because of the rotation freedom, vector (0.12, 1.38) in one run and in another run can mean different things. Only compare vectors from the same run, or align them first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have built the full MF toolkit. Before comparing it with its siblings, let us see how each piece grew from the one before, all on Ben and Interstellar.</div>

  <h2 id="mf-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Latent factors, the masked loss, SGD, ALS, biases, λ and k, SVD, implicit ALS, embeddings: separate tricks, or one idea growing?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="mf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="160" height="46" rx="7" class="fb sb"/><text x="90" y="29" text-anchor="middle" font-size="11.5" font-weight="700">dot product p·q</text><text x="90" y="46" text-anchor="middle" class="tm" font-size="10">Ben→Interstellar 3.25 (hand)</text>
<line x1="170" y1="33" x2="203" y2="33" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="205" y="10" width="200" height="46" rx="7" class="fb sb"/><text x="305" y="29" text-anchor="middle" font-size="11.5" font-weight="700">masked loss + λ‖·‖²</text><text x="305" y="46" text-anchor="middle" class="tm" font-size="10">4.953 + 3.931 = 8.884</text>
<line x1="405" y1="33" x2="438" y2="33" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="440" y="10" width="230" height="46" rx="7" class="fr sr"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">vs zero-filled / mean-filled SVD</text><text x="555" y="46" text-anchor="middle" class="tm" font-size="10">1.69 / 2.62; test RMSE ≈ 1.02</text>
<line x1="260" y1="56" x2="140" y2="92" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="350" y1="56" x2="450" y2="92" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="30" y="94" width="220" height="46" rx="7" class="ft st"/><text x="140" y="113" text-anchor="middle" font-size="11.5" font-weight="700">SGD: gradient per rating</text><text x="140" y="130" text-anchor="middle" class="tm" font-size="10">error 3.25 → 1.89; Ben 3.04</text>
<rect x="340" y="94" width="230" height="46" rx="7" class="ft st"/><text x="455" y="113" text-anchor="middle" font-size="11.5" font-weight="700">ALS: ridge solve per user/item</text><text x="455" y="130" text-anchor="middle" class="tm" font-size="10">Ben (1.894, 0.260); Ben 3.07</text>
<line x1="140" y1="140" x2="250" y2="174" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="455" y1="140" x2="560" y2="174" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="150" y="176" width="220" height="46" rx="7" class="fg sg"/><text x="260" y="195" text-anchor="middle" font-size="11.5" font-weight="700">+ biases μ + b_u + b_i</text><text x="260" y="212" text-anchor="middle" class="tm" font-size="10">2.87 − 0.57 − 0.29 + 1.11 ≈ 3.11</text>
<rect x="440" y="176" width="230" height="46" rx="7" class="fg sg"/><text x="555" y="195" text-anchor="middle" font-size="11.5" font-weight="700">implicit: confidence weights</text><text x="555" y="212" text-anchor="middle" class="tm" font-size="10">c = 1 + α·plays; Ben (0.440, 0.391)</text>
<line x1="260" y1="222" x2="200" y2="254" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="60" y="256" width="250" height="46" rx="7" class="fv"/><text x="185" y="275" text-anchor="middle" font-size="11.5" font-weight="700">held-out RMSE picks k, λ</text><text x="185" y="292" text-anchor="middle" class="tm" font-size="10">1.087 → 0.982 → 0.766</text>
<line x1="555" y1="222" x2="480" y2="254" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="310" y1="279" x2="358" y2="279" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="360" y="256" width="310" height="46" rx="7" class="fv"/><text x="515" y="275" text-anchor="middle" font-size="11.5" font-weight="700">embeddings → fold-in, ANN, two-tower</text><text x="515" y="292" text-anchor="middle" class="tm" font-size="10">cos(Inception, Interstellar) 1.00 → ranking note</text>
</svg><figcaption>Everything grows out of one dot product. Scoring it on observed cells gives the loss; the gradient of that loss gives SGD and its "convex in one half" structure gives ALS; separating main effects gives biases; changing what a cell means gives implicit ALS; held-out error chooses the size; and the trained vectors are embeddings that feed retrieval and ranking.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Ben → Interstellar / our number</th><th>Sensitive to</th><th>Use when</th></tr>
    <tr><td>Latent factors</td><td>dot product of two k-vectors</td><td>how to score any pair?</td><td>3.25 (hand sliders)</td><td>choice of k</td><td>always (the model itself)</td></tr>
    <tr><td>Masked L2 loss</td><td>squared error on Ω + λ‖·‖²</td><td>how good are P, Q?</td><td>8.884</td><td>λ, what counts as observed</td><td>explicit ratings</td></tr>
    <tr><td>Zero-filled SVD</td><td>SVD on blanks = 0</td><td>(what not to do)</td><td>1.69</td><td>sparsity</td><td>never for ratings</td></tr>
    <tr><td>SGD</td><td>gradient of one rating's loss</td><td>how to descend?</td><td>3.04</td><td>learning rate, epochs</td><td>explicit, custom losses</td></tr>
    <tr><td>ALS</td><td>ridge regression with one side frozen</td><td>exact step, no learning rate?</td><td>2.971 (one step), 3.07</td><td>λ (conditioning)</td><td>parallel, implicit</td></tr>
    <tr><td>Bias baseline</td><td>means: μ, user mean − μ, leftover mean</td><td>who rates high, what is liked?</td><td>1.25</td><td>few ratings (shrink)</td><td>baseline, always add</td></tr>
    <tr><td>Biased MF</td><td>baseline + dot product</td><td>taste beyond the main effects?</td><td>3.11</td><td>overfitting (train 0.076)</td><td>explicit ratings</td></tr>
    <tr><td>Held-out RMSE</td><td>hidden ratings</td><td>which k, λ?</td><td>0.766 at k = 3, λ = 0.1</td><td>split type (time!)</td><td>always for tuning</td></tr>
    <tr><td>Mean-filled SVD</td><td>exact SVD after imputing</td><td>is classical SVD enough?</td><td>2.62; RMSE ≈ 1.02</td><td>imputation</td><td>dense data, quick baseline</td></tr>
    <tr><td>Implicit ALS</td><td>ALS + preference/confidence on all cells</td><td>how to use plays?</td><td>score 0.855 (hand), 0.49 (trained)</td><td>α, signal quality</td><td>clicks, plays, purchases</td></tr>
    <tr><td>Embeddings</td><td>trained P, Q rows</td><td>similar items, new users, fast search?</td><td>cos 1.00; Esha → Interstellar 3.72</td><td>rotation (coordinates)</td><td>retrieval, similar-items</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>predict every cell with a dot product of two short learned vectors, and fit those vectors only where you have evidence, with a penalty for size.</strong> SGD and ALS are two ways to fit it; biases and implicit confidence change what is being fitted; held-out error decides how big; and the vectors themselves become the embeddings that the rest of a recommender system is built on.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Where does MF stand against neighbourhood CF, content-based filtering, classical SVD and two-tower networks?</div>

  <h2 id="mf-compare"><span class="num">11</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When should you choose matrix factorization over the other recommender methods, and when not?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th><a class="xref" data-note="ml_recsys">Content-based</a></th><th><a class="xref" data-note="ml_cf">Neighbourhood CF</a></th><th>MF (Funk / biased)</th><th>Implicit ALS</th><th>Two-tower</th></tr>
    <tr><td>Needs</td><td>item features</td><td>overlapping ratings</td><td>ratings (any overlap pattern)</td><td>interaction counts</td><td>interactions + features</td></tr>
    <tr><td>Learns</td><td>nothing (or a profile)</td><td>nothing; computes similarities</td><td>user and item vectors</td><td>user and item vectors</td><td>two networks</td></tr>
    <tr><td>Sparsity</td><td>unaffected</td><td>poor: needs common items</td><td>good: shares through factors</td><td>good</td><td>good</td></tr>
    <tr><td>New item</td><td>yes (features)</td><td>no</td><td>no (needs ratings)</td><td>no</td><td>yes (item tower)</td></tr>
    <tr><td>New user</td><td>after a few likes</td><td>after a few ratings</td><td>fold-in after a few ratings</td><td>fold-in</td><td>yes (user features)</td></tr>
    <tr><td>Explainable</td><td>"because it is sci-fi"</td><td>"people like you liked"</td><td>weakly (biases are readable)</td><td>weakly</td><td>no</td></tr>
    <tr><td>Scale</td><td>easy</td><td>O(pairs) similarities</td><td>O(|Ω|k) per epoch</td><td>O(|Ω|k² + (m+n)k³)</td><td>GPU training, ANN serving</td></tr>
    <tr><td>Our toy</td><td>—</td><td>neighbour-based guess</td><td>Ben → Interstellar 3.11</td><td>Interstellar ranked first</td><td>—</td></tr>
  </table>
  <table class="tbl"><caption>Which factorization?</caption>
    <tr><th>Method</th><th>Data</th><th>Missing cells</th><th>Strength</th><th>Weakness</th></tr>
    <tr><td>Truncated SVD</td><td>dense, full</td><td>must be imputed</td><td>exact, unique, fast</td><td>imputation biases it (RMSE ≈ 1.02 here)</td></tr>
    <tr><td>Funk-SVD / biased MF (SGD)</td><td>explicit ratings</td><td>ignored</td><td>accurate, simple, interpretable biases</td><td>learning rate, non-convex</td></tr>
    <tr><td>ALS (explicit)</td><td>explicit ratings</td><td>ignored</td><td>no learning rate, parallel</td><td>k³ solves; biases need extra care</td></tr>
    <tr><td>Implicit ALS</td><td>plays, clicks</td><td>weak 0s with weight 1</td><td>uses all cells efficiently</td><td>no dislikes; RMSE meaningless</td></tr>
    <tr><td>NMF</td><td>non-negative counts</td><td>usually filled</td><td>parts-based, readable</td><td>slightly less accurate</td></tr>
    <tr><td>BPR-MF</td><td>implicit</td><td>sampled as negatives</td><td>optimises ranking directly</td><td>sampling choices (next note)</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> We know when to use MF. What goes wrong in practice and in interviews?</div>

  <h2 id="mf-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors turn a correct MF idea into a bad recommender?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: blanks as zero ratings</span>
    <p>Zero-filled SVD predicted Ben → Interstellar 1.69 and Asha → Titanic 0.29. Mask the loss for explicit data; use confidence weights for implicit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging by training error</span>
    <p>Biased MF reached train RMSE 0.076 with 28 numbers for 15 ratings. In the bigger cinema λ = 0 had the best train RMSE and a worse test RMSE than λ = 0.05. Always tune on held-out ratings.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no biases</span>
    <p>Without μ + b<sub>u</sub> + b<sub>i</sub>, factors waste capacity on "Ben rates low". Biases alone took test RMSE from 1.087 to 0.982 and are the baseline every model must beat.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: zero initialisation</span>
    <p>With P = Q = 0 every gradient e·q and e·p is zero, so nothing moves. Use small random values.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: RMSE for implicit data or for top-k quality</span>
    <p>Implicit targets are 0/1 and mostly 0; ranking quality needs precision@k or NDCG, measured on a time-based split.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading meaning into coordinates</span>
    <p>Factors are defined up to rotation and sign (ours came out negative). Compare cosines and dot products, not coordinates across runs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting cold start</span>
    <p>MF has no vector for a user or film with no interactions. Fold-in after a few ratings, content features or a two-tower model for brand-new items, popularity as the last fallback.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: implicit "plays" that mean nothing</span>
    <p>Asha's 1-star Notebook counted as a play and made Titanic look good for her. Use engagement signals (completion, watch time), and treat quick abandons as weak or negative.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note condensed for quick review.</div>

  <h2 id="mf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: ratings 1–5 of four users on five films (· = blank). Goal: predict Ben → Interstellar.</p>
  <table class="tbl">
    <tr><th></th><th>Inception</th><th>Interstellar</th><th>Notebook</th><th>Titanic</th><th>Toy Story</th><th>mean</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>1</td><td>·</td><td>2</td><td>3.00</td></tr>
    <tr><td>Ben</td><td>4</td><td>?</td><td>1</td><td>1</td><td>·</td><td>2.00</td></tr>
    <tr><td>Chen</td><td>1</td><td>1</td><td>5</td><td>4</td><td>·</td><td>2.75</td></tr>
    <tr><td>Dia</td><td>·</td><td>2</td><td>4</td><td>5</td><td>3</td><td>3.50</td></tr>
  </table>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>Latent factors</td><td>score a pair with no overlap?</td><td>Ben (2, 0.5) · Interstellar (1.5, 0.5) = 3.25</td><td>who picks the sliders?</td></tr>
    <tr><td>Objective</td><td>how good are P, Q?</td><td>SSE 4.953 + λ‖·‖² 3.931 = 8.884</td><td>how to minimise?</td></tr>
    <tr><td>SGD</td><td>step downhill per rating?</td><td>error 3.25 → 1.89; Ben 3.04</td><td>learning rate, many passes</td></tr>
    <tr><td>ALS</td><td>exact step?</td><td>Ben (1.894, 0.260) → 2.971; trained 3.07</td><td>factors waste effort on rating scale</td></tr>
    <tr><td>Biases</td><td>who rates high, what is liked?</td><td>baseline 1.25; biased MF 3.11</td><td>train RMSE 0.076: memorising?</td></tr>
    <tr><td>Held-out tuning</td><td>which k, λ? is it real?</td><td>1.087 → 0.982 → 0.766 (k = 3)</td><td>isn't this just SVD?</td></tr>
    <tr><td>SVD vs Funk</td><td>why not classical SVD?</td><td>mean-filled 2.62, RMSE ≈ 1.02</td><td>what about clicks?</td></tr>
    <tr><td>Implicit ALS</td><td>factorize plays?</td><td>Ben (0.440, 0.391); Interstellar first</td><td>what are the vectors for?</td></tr>
    <tr><td>Embeddings</td><td>similar items, new users, scale?</td><td>cos 1.00; Esha → Interstellar 3.72</td><td>lists, cold start → next note</td></tr>
  </table>
  <h3>Definitions</h3>
  <div class="cards">
    <div><b>Matrix factorization</b><p>Approximate the m × n user–item matrix by P Qᵀ with k ≪ m, n, fitted on observed cells; r̂<sub>ui</sub> = p<sub>u</sub>·q<sub>i</sub>.</p><small>k(m + n) numbers instead of m·n</small></div>
    <div><b>Latent factor</b><p>One of the k hidden dimensions, learned from data. Often readable (sci-fi/romance) but only defined up to rotation and sign.</p><small>Coordinates are not stable across runs</small></div>
    <div><b>Funk-SVD</b><p>Regularised MF fitted with SGD on observed ratings; not a true SVD (no orthogonality, no Σ).</p><small>"SVD" in Surprise</small></div>
    <div><b>ALS</b><p>Alternately solve every user's and every item's ridge regression exactly with the other side frozen.</p><small>No learning rate; parallel</small></div>
    <div><b>Biases</b><p>μ = global mean, b<sub>u</sub> = user's offset, b<sub>i</sub> = item's offset; the factors then model only the interaction.</p><small>Strong baseline by itself</small></div>
    <div><b>Implicit ALS</b><p>Fit preference (played or not) on every cell, weighted by confidence 1 + α·count.</p><small>Hu, Koren &amp; Volinsky 2008</small></div>
    <div><b>Embedding / fold-in</b><p>Trained vectors used for similarity and search; a new user's vector is one ridge solve with Q frozen.</p><small>Cheap partial cold-start fix</small></div>
    <div><b>Two-tower</b><p>Neural user and item towers on features, scored by dot product; MF is the one-hot, linear special case.</p><small>Handles new items with features</small></div>
  </div>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Prediction</td><td>r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub></td><td>μ global mean; b<sub>u</sub>, b<sub>i</sub> biases; p<sub>u</sub>, q<sub>i</sub> ∈ ℝ<sup>k</sup></td></tr>
    <tr><td>Loss</td><td>Σ<sub>Ω</sub>(r<sub>ui</sub> − r̂<sub>ui</sub>)² + λ(b<sub>u</sub>² + b<sub>i</sub>² + ‖p<sub>u</sub>‖² + ‖q<sub>i</sub>‖²)</td><td>Ω observed cells; λ penalty strength</td></tr>
    <tr><td>SGD</td><td>e = r − r̂; p ← p + η(e q − λp); q ← q + η(e p − λq); b ← b + η(e − λb)</td><td>η learning rate; use old p in the q update</td></tr>
    <tr><td>ALS (explicit)</td><td>p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub></td><td>Q<sub>u</sub> rows of items u rated; r<sub>u</sub> their ratings</td></tr>
    <tr><td>Shrunk bias</td><td>b<sub>i</sub> = Σ<sub>u</sub>(r<sub>ui</sub> − μ − b<sub>u</sub>) / (n<sub>i</sub> + λ<sub>b</sub>)</td><td>n<sub>i</sub> ratings of item i</td></tr>
    <tr><td>Implicit loss</td><td>Σ<sub>all</sub> c<sub>ui</sub>(p<sub>ui</sub> − x<sub>u</sub>·y<sub>i</sub>)² + λ(‖X‖² + ‖Y‖²)</td><td>p = 𝟙[r &gt; 0]; c = 1 + αr</td></tr>
    <tr><td>Implicit ALS</td><td>x<sub>u</sub> = (YᵀY + Yᵀ(C<sub>u</sub> − I)Y + λI)⁻¹YᵀC<sub>u</sub>p<sub>u</sub></td><td>C<sub>u</sub> = diag(c<sub>u·</sub>)</td></tr>
    <tr><td>Truncated SVD</td><td>A<sub>k</sub> = U<sub>k</sub>Σ<sub>k</sub>V<sub>k</sub>ᵀ</td><td>best rank-k for a FULL matrix (Eckart–Young)</td></tr>
    <tr><td>RMSE</td><td>√(mean over test cells of (r − r̂)²)</td><td>held-out ratings only</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use biased MF</b><p>Explicit ratings, sparse matrix, need accurate scores and a readable baseline.</p><small>Tune k, λ on a time split</small></div>
    <div><b>Use implicit ALS</b><p>Plays, clicks, purchases at scale; you want candidate lists, not star predictions.</p><small>Evaluate with ranking metrics</small></div>
    <div><b>Use classical SVD</b><p>Only when the matrix is (nearly) full, or as a quick baseline after imputation.</p><small>Imputation dominates</small></div>
    <div><b>Go beyond MF</b><p>Many new items, rich features, context (time, device): two-tower or feature-based rankers.</p><small>MF IDs cannot cover cold items</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Blanks as zeros; trusting train RMSE; no biases; zero initialisation; RMSE on implicit data; reading coordinates as fixed meanings; no cold-start path; counting abandoned plays as preference.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>p = (2, 0.5), q = (1.5, 0.5). Prediction?</td><td>3 + 0.25 = 3.25</td></tr>
    <tr><td>One SGD step: p = (1, 0.5), q = (1.5, 0.5), r = 5, η = λ = 0.1. New p?</td><td>e = 3.25; p + 0.1(3.25q − 0.1p) = (1.4775, 0.6575)</td></tr>
    <tr><td>Ben's mean 2.00, μ = 2.867. b<sub>Ben</sub>?</td><td>−0.867</td></tr>
    <tr><td>Why is ALS's per-user step exact?</td><td>With Q frozen the loss is ridge regression in p<sub>u</sub>: closed form (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub></td></tr>
    <tr><td>Implicit: 4 plays, α = 2. Preference and confidence?</td><td>p = 1, c = 1 + 2 × 4 = 9</td></tr>
  </table>

  <h2 id="mf-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain matrix factorization for recommendation in three sentences.</summary><div class="qa-body">Represent every user and item by a k-dimensional vector so that a rating is approximately their dot product, R ≈ PQᵀ. Fit the vectors on the observed ratings only, with an L2 penalty, using SGD or ALS. The trained model fills every blank, and similar users and items end up with similar vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why train only on observed cells? What happens otherwise?</summary><div class="qa-body">Blanks are unknown, not zero. Filling them with 0 and fitting (plain SVD) teaches the model that unseen films are hated: on our toy Ben → Interstellar fell to 1.69 and Asha → Titanic to 0.29. Mean-filling is better but still biased (2.62, test RMSE ≈ 1.02 vs 0.766).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the SGD update for one rating.</summary><div class="qa-body">ℓ = (r − p·q)² + λ(‖p‖² + ‖q‖²). ∂ℓ/∂p = −2eq + 2λp, ∂ℓ/∂q = −2ep + 2λq, with e = r − p·q. Step against the gradient, absorbing 2 into η: p ← p + η(eq − λp), q ← q + η(ep − λq), using the old p in the q update. On Asha → Inception the error went 3.25 → 1.89.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does ALS work and why is it popular at scale?</summary><div class="qa-body">With Q fixed, each user's loss is a ridge regression with closed form p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; then fix P and solve items; repeat. No learning rate, the loss never increases, users (and items) are independent so it parallelises (Spark), and it extends naturally to implicit data where all cells count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why add user and item biases?</summary><div class="qa-body">Ratings mix "how this user rates in general", "how this item is received in general" and taste. Biases capture the first two with one number each, so the factors model only the interaction. On our toy: Ben −0.867 by hand (strict), Interstellar −0.75; baseline 1.25, and the factor term adds the sci-fi taste to reach ≈ 3.11. On the bigger cinema biases alone took RMSE 1.087 → 0.982.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k and λ?</summary><div class="qa-body">On held-out ratings (validation set or k-fold over ratings, ideally a time split). In our bigger cinema test RMSE was U-shaped in λ (0.815 at 0, 0.768 at 0.05, 0.978 at 0.5) and best at k = 3, the true number of tastes, while train RMSE kept falling with k. Use early stopping for SGD.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Funk-SVD an SVD?</summary><div class="qa-body">No. True SVD factors a full matrix into orthonormal U, V and singular values, exactly and uniquely. Funk-SVD fits arbitrary P, Q on observed cells only with regularisation and SGD; no orthogonality, no Σ, many equivalent solutions. It is called SVD because it is a low-rank factorization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain implicit ALS: what are preference and confidence?</summary><div class="qa-body">Preference p<sub>ui</sub> = 1 if the user interacted, else 0; confidence c<sub>ui</sub> = 1 + α·count. The loss sums c(p − x·y)² over all cells, so unseen items are weak negatives and heavy interactions are strong positives. Solved with weighted ALS using YᵀC<sub>u</sub>Y = YᵀY + Yᵀ(C<sub>u</sub> − I)Y so each user costs only their own interactions. Ben (counts 4, 0, 1, 1, 0; α = 2) got x = (0.440, 0.391) from frozen hand vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user signs up and rates two films. How do you recommend without retraining?</summary><div class="qa-body">Fold-in: keep item vectors Q fixed and solve the user's ridge regression on the two ratings, p = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr. Our Esha (Inception 5, Titanic 1) got a vector next to Asha's and Ben's and Interstellar 3.72. With zero ratings, fall back to popularity or features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't we interpret factor 1 as "romance" reliably?</summary><div class="qa-body">For any invertible T, (PT)(QT⁻ᵀ)ᵀ = PQᵀ, so predictions do not pin down the axes; with L2 the solution is still free up to rotations and sign flips. Our ALS factors came out negative. Interpretation is something we read off one run; compare dot products and cosines, not coordinates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is MF related to neighbourhood collaborative filtering?</summary><div class="qa-body">Both use only the interaction matrix. Neighbourhood CF computes similarities directly from co-rated items and needs overlap; MF compresses each row and column into k numbers, so information flows through shared factors even without overlap. Cosine between learned item vectors (Inception–Interstellar 1.00) is a smoothed item-item similarity. See <a class="xref" data-note="ml_cf">Collaborative Filtering</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is MF related to PCA and ridge regression?</summary><div class="qa-body">PCA is the SVD of a centred, full data matrix: the best low-rank approximation over all cells. MF is the same low-rank idea fitted only on observed cells with a penalty. Each ALS half-step is literally ridge regression (with the frozen factors as features), which is why λI keeps it well defined.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does MF lead to two-tower models and to the ranking stage?</summary><div class="qa-body">MF is a two-tower model with one-hot ID inputs and linear towers. Replacing the lookups with neural towers over features gives vectors for new items and users. The item vectors are indexed for approximate nearest-neighbour retrieval; the retrieved candidates are then ordered by a ranker and judged with list metrics, in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your MF has great RMSE but users don't click its top-10. Why?</summary><div class="qa-body">RMSE weights all known ratings equally, mostly mid-range ones, while users only see the top few; ratings come from films people chose to watch (missing not at random); popular items dominate via b<sub>i</sub>; the split may be random rather than by time. Optimise and evaluate for ranking (BPR, precision@k, NDCG) and confirm with an A/B test.</div></details>
</main>
`
});
