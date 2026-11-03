// notes/ml/ml_mf.js — Matrix Factorization
Object.assign(TOPIC_CONTENT, {
  "ml_mf": `<main>
<h1>Matrix Factorization</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Matrix Factorization</span></div>
  <p class="lead">Matrix factorization (MF) describes every user and every item by a short list of hidden numbers, learned from the ratings, so that one dot product predicts any rating, even for a user and a film that share no history with each other. It is the model-based answer to the weakness that ended <a class="xref" data-note="ml_cf">Collaborative Filtering</a>: neighbourhood methods need overlapping ratings, and in real, nearly empty matrices most pairs overlap in nothing. MF won much of the Netflix Prize, it is still a strong baseline in industry, and its learned vectors are the "embeddings" on which modern retrieval systems are built. We build it on the same running example as the previous two notes, CineCity's five friends and six films, still asking which of Lagaan, K3G and 3 Idiots to show Ben, and then test it on the simulated 1,000 × 1,000 CineCity, where its vectors turn out to recover two hidden traits that no genre tag records.</p>

  <h2 id="mf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Matrix Factorization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The model</div>
        <ul>
          <li>R ≈ P Qᵀ: each user and item gets k <b>latent factors</b></li>
          <li>r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub></li>
          <li>k(m + n) numbers instead of m·n cells</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fitting</div>
        <ul>
          <li>Loss on <b>observed cells only</b> + λ(‖p‖² + ‖q‖²)</li>
          <li><b>SGD</b>: e = r − p·q; p += η(eq − λp), q += η(ep − λq)</li>
          <li><b>ALS</b>: freeze one side, solve ridge exactly: p = (QᵀQ + λI)⁻¹Qᵀr</li>
          <li>Tune k, λ on held-out ratings (k = 4, λ = 0.05: RMSE 0.699)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants</div>
        <ul>
          <li>True SVD needs a full matrix; "Funk-SVD" is regularised MF</li>
          <li><b>Implicit ALS</b>: preference 1/0 on all cells, confidence 1 + α·count</li>
          <li>SVD++, NMF, BPR-MF, two-tower networks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The vectors</div>
        <ul>
          <li><b>Embeddings</b>: similar films get similar vectors (3 Idiots ~ Lagaan 0.98)</li>
          <li>Recover hidden traits tags cannot see</li>
          <li><b>Fold-in</b> a new user with one ridge solve</li>
          <li>Axes defined only up to rotation and sign</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mf-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Latent Factors</span><span class="rm-sub">taste sliders, and why few numbers suffice</span></div></div>
      <div class="rm-item rm-done" data-target="mf-obj"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Objective</span><span class="rm-sub">squared error on known cells, plus a penalty</span></div></div>
      <div class="rm-item rm-done" data-target="mf-sgd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Training with SGD</span><span class="rm-sub">one rating at a time, downhill</span></div></div>
      <div class="rm-item rm-done" data-target="mf-als"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Alternating Least Squares</span><span class="rm-sub">exact solves, no learning rate</span></div></div>
      <div class="rm-item rm-done" data-target="mf-bias"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Biases</span><span class="rm-sub">separating rating habits from taste</span></div></div>
      <div class="rm-item rm-done" data-target="mf-tune"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Choosing k and λ</span><span class="rm-sub">held-out ratings at scale</span></div></div>
      <div class="rm-item rm-done" data-target="mf-svd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SVD versus Funk-SVD</span><span class="rm-sub">why the classic SVD is not used directly</span></div></div>
      <div class="rm-item rm-done" data-target="mf-implicit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Implicit Feedback: Weighted ALS</span><span class="rm-sub">preference and confidence</span></div></div>
      <div class="rm-item rm-done" data-target="mf-embed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Embeddings and Two-Tower Models</span><span class="rm-sub">what the vectors mean and how they are used</span></div></div>
      <div class="rm-item rm-done" data-target="mf-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">zero-filling, zero init, train error</span></div></div>
      <div class="rm-item rm-done" data-target="mf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, Ben's numbers, method table</span></div></div>
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on MF</span></div></div>
    </div>
  </div>

  <h2 id="mf-idea"><span class="num">01</span>Latent Factors</h2>
  <p>Neighbourhood CF predicts Ben's blanks from users or films that overlap with Ben. Lagaan has a single rater, Esha, who shares only one film with Ben; on a real catalogue most pairs share nothing at all, so there are no reliable neighbours to ask. We want a way to predict a rating that does not depend on this user and that user having rated the same films. Here is CineCity once more, now as a numpy array with 0 for "not rated", and a boolean mask <code>M</code> of the known cells:</p>
  <div class="fx" data-lang="py">import numpy as np
users = ["Asha", "Ben", "Chen", "Dia", "Esha"]
films = ["Dangal", "Chak De", "Lagaan", "DDLJ", "K3G", "3 Idiots"]
R = np.array([[5, 4, 0, 1, 1, 4],                # Asha
              [5, 5, 0, 2, 0, 0],                # Ben
              [2, 0, 0, 5, 5, 0],                # Chen
              [0, 1, 0, 4, 5, 2],                # Dia
              [5, 0, 5, 0, 3, 5]], float)        # Esha     (0 = not rated)
M = R &gt; 0                                        # mask of observed cells
print("observed ratings:", M.sum(), "of", R.size, f"(density {M.mean():.3f})")
print("global mean mu =", R[M].sum(), "/", M.sum(), "=", round(R[M].mean(), 3))
for u, name in enumerate(users):
    print(f"{name:5s} rated {M[u].sum()}  mean {R[u, M[u]].mean():.2f}")
print("Ben's blanks:", [films[i] for i in range(6) if not M[1, i]])</div>
  <div class="fx" data-lang="text">observed ratings: 19 of 30 (density 0.633)
global mean mu = 69.0 / 19 = 3.632
Asha  rated 5  mean 3.00
Ben   rated 3  mean 4.00
Chen  rated 3  mean 4.00
Dia   rated 4  mean 3.00
Esha  rated 4  mean 4.50
Ben's blanks: ['Lagaan', 'K3G', '3 Idiots']</div>
  <p>Every formula in this note uses the mask to ignore blanks. The global mean μ = 69/19 = 3.632 and the user means (Ben 4.00, Esha 4.50, Asha and Dia 3.00) will come back when we add biases in section 05.</p>
  <p>Looking at the table by eye, there seem to be two kinds of film: Dangal, Chak De, Lagaan and 3 Idiots, which are all underdog stories (a wrestling family, a hockey team, a village cricket team, three students against the system), and DDLJ and K3G, which are family romances. And there seem to be two kinds of viewer: Asha, Ben and Esha love the first kind, Chen and Dia the second. The genre tags of the Basics note only half see this, because 3 Idiots is tagged drama and comedy, not sports.</p>
  <p>Suppose we could describe every film by two numbers, "how much of an underdog drama is it" and "how romantic is it", and every user by two numbers, "how much do I enjoy underdog dramas" and "how much do I enjoy romance". A rating would then be the sum, over the two qualities, of (amount in the film × the user's liking for it). That sum is a <strong>dot product</strong>. Think of a sound mixing desk with two sliders: each recording has a certain amount of bass and treble, each listener has a personal liking for bass and treble, and how much a listener enjoys a recording is (bass × bass liking) + (treble × treble liking). The hidden qualities are called <strong>latent factors</strong>: "latent" because nobody labels them in advance; training discovers what each slider means from the ratings alone.</p>
  <p>To see the idea work, pick the sliders by hand: column 1 is "underdog drama", column 2 is "romance". Lagaan gets a little romance (it carries the romance tag); 3 Idiots a bit less underdog than the sports films.</p>
  <table class="tbl">
    <tr><th>Film</th><th>q<sub>i</sub> (underdog, romance)</th><th>User</th><th>p<sub>u</sub> (underdog, romance)</th></tr>
    <tr><td>Dangal</td><td>(2, 0)</td><td>Asha</td><td>(2.25, 0.5)</td></tr>
    <tr><td>Chak De</td><td>(2, 0)</td><td>Ben</td><td>(2.5, 0.5)</td></tr>
    <tr><td>Lagaan</td><td>(2, 0.5)</td><td>Chen</td><td>(1, 2.5)</td></tr>
    <tr><td>DDLJ</td><td>(0, 2)</td><td>Dia</td><td>(0.5, 2.25)</td></tr>
    <tr><td>K3G</td><td>(0.5, 2)</td><td>Esha</td><td>(2.5, 1)</td></tr>
    <tr><td>3 Idiots</td><td>(1.5, 0.5)</td><td></td><td></td></tr>
  </table>
  <p>Now Ben → 3 Idiots = 2.5 × 1.5 + 0.5 × 0.5 = 4.0; Ben → Lagaan = 2.5 × 2 + 0.5 × 0.5 = 5.25 (above the 5-star maximum, because nothing in a dot product knows about the scale; predictions are clipped when shown); Ben → K3G = 2.5 × 0.5 + 0.5 × 2 = 2.25; and Ben → DDLJ = 0 + 0.5 × 2 = 1, although he really gave 2, so the hand sliders are not perfect. Doing this for every pair is one matrix product: stack the user vectors as the rows of P (5 × 2) and the film vectors as the rows of Q (6 × 2), and R̂ = P Qᵀ is a complete 5 × 6 table, blanks included.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
<rect x="20" y="40" width="150" height="110" class="fs" stroke="currentColor"/>
<text x="95" y="30" text-anchor="middle" font-size="12">R (5 users × 6 films)</text>
<text x="95" y="90" text-anchor="middle" class="tm" font-size="11">19 known, 11 blank</text>
<text x="95" y="108" text-anchor="middle" class="tm" font-size="11">Ben → Lagaan, K3G, 3 Idiots = ?</text>
<text x="200" y="100" text-anchor="middle" font-size="20">≈</text>
<rect x="230" y="40" width="50" height="110" class="fb sb"/>
<text x="255" y="30" text-anchor="middle" font-size="12" font-weight="700">P</text>
<text x="255" y="100" text-anchor="middle" font-size="11">5×2</text>
<text x="305" y="100" text-anchor="middle" font-size="16">×</text>
<rect x="330" y="70" width="150" height="50" class="ft st"/>
<text x="405" y="60" text-anchor="middle" font-size="12" font-weight="700">Qᵀ</text>
<text x="405" y="100" text-anchor="middle" font-size="11">2×6</text>
<text x="500" y="85" class="tm" font-size="11">k = 2</text><text x="500" y="101" class="tm" font-size="11">latent</text><text x="500" y="117" class="tm" font-size="11">factors</text>
<text x="20" y="172" class="tm" font-size="11">r̂(u, i) = p_u · q_i: one row of P times one column of Qᵀ, defined for every cell</text>
</svg><figcaption>A sparse table is approximated by two thin, full ones. Their product fills every blank.</figcaption></figure>
  <p>The figure shows the shapes. The sparse 5 × 6 matrix on the left is approximated by a tall, thin P (one row of k = 2 numbers per user) times a short, wide Qᵀ (one column per film). Any cell of the product, including Ben's three blanks, is one row of P times one column of Qᵀ. That is <strong>matrix factorization</strong>: approximate the user × item matrix R (m × n) by P Qᵀ, with P of size m × k, Q of size n × k and k much smaller than m and n, fitted on the observed cells only, so that r̂<sub>ui</sub> = p<sub>u</sub> · q<sub>i</sub>.</p>
  <p>Why should so few numbers be enough? P and Q hold k(m + n) = 2 × (5 + 6) = 22 numbers here, against 30 cells. At Netflix Prize scale (480,189 users, 17,770 films, about 1% of cells rated), k = 50 needs about 25 million numbers instead of 8.5 billion cells. It works because tastes are not random: each person's row is roughly a mix of a few "taste profiles", so the full matrix is close to <strong>low rank</strong>, and the factors are that small set of profiles. And here is the key difference from neighbourhood CF: every rating Ben gives updates the same Ben vector, and every rating of Lagaan by anyone updates the same Lagaan vector, so information reaches Ben → Lagaan even though Esha, Lagaan's only rater, barely overlaps with Ben. A trained model will not name its factors "underdog drama" and "romance"; it finds whatever directions explain the ratings, which are often readable but can be any rotation or sign flip of the "nice" ones (section 09).</p>

  <h2 id="mf-obj"><span class="num">02</span>The Objective</h2>
  <p>Our hand sliders were guesses. To let a computer search for better ones we need a single number that says how good a given P and Q are. The natural choice is the squared error between prediction and truth, counted <em>only where the truth exists</em>. With the error e<sub>ui</sub> = r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>, the hand sliders give, for example, Asha → K3G: 1 − 2.125 = −1.125 and Ben → DDLJ: 2 − 1 = 1. Summing the squared errors over all 19 known cells gives the <strong>sum of squared errors</strong> (SSE).</p>
  <p>With 22 free numbers and only 19 ratings, a model could fit every known rating exactly and still predict nonsense for the blanks. So we add a cost for large factors: λ times the sum of all squared entries of P and Q. This is <strong>L2 regularisation</strong> (<a class="xref" data-note="ml_regularization">Regularization</a>), and λ (lambda) sets its strength. The full objective is</p>
  <p>L(P, Q) = Σ<sub>(u,i) observed</sub> (r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>)² + λ ( Σ<sub>u</sub> ‖p<sub>u</sub>‖² + Σ<sub>i</sub> ‖q<sub>i</sub>‖² )</p>
  <p>By hand with λ = 0.1: ‖P‖² = 5.3125 + 6.5 + 7.25 + 5.3125 + 7.25 = 31.625 and ‖Q‖² = 4 + 4 + 4.25 + 4 + 4.25 + 2.5 = 23, so the penalty is 0.1 × 54.625 = 5.4625.</p>
  <div class="fx" data-lang="py"># hand-picked sliders: column 0 = "underdog drama", column 1 = "romance"
Q = np.array([[2.0, 0.0],    # Dangal
              [2.0, 0.0],    # Chak De
              [2.0, 0.5],    # Lagaan
              [0.0, 2.0],    # DDLJ
              [0.5, 2.0],    # K3G
              [1.5, 0.5]])   # 3 Idiots
P = np.array([[2.25, 0.5],   # Asha
              [2.5, 0.5],    # Ben
              [1.0, 2.5],    # Chen
              [0.5, 2.25],   # Dia
              [2.5, 1.0]])   # Esha
pred = P @ Q.T
print(pred)
err = (R - pred) * M                          # errors on observed cells only
sse = (err ** 2).sum()
lam = 0.1
reg = lam * ((P ** 2).sum() + (Q ** 2).sum())
print("SSE on 19 ratings =", sse, "  penalty =", round(reg, 4), "  loss =", round(sse + reg, 4))
print("Ben -&gt;", {films[i]: float(pred[1, i]) for i in (2, 4, 5)})</div>
  <div class="fx" data-lang="text">[[4.5   4.5   4.75  1.    2.125 3.625]
 [5.    5.    5.25  1.    2.25  4.   ]
 [2.    2.    3.25  5.    5.5   2.75 ]
 [1.    1.    2.125 4.5   4.75  1.875]
 [5.    5.    5.5   2.    3.25  4.25 ]]
SSE on 19 ratings = 4.359375   penalty = 5.4625   loss = 9.8219
Ben -&gt; {'Lagaan': 5.25, 'K3G': 2.25, '3 Idiots': 4.0}</div>
  <p>The printed table is P Qᵀ, the hand predictions for every cell (Ben's row: 5, 5, 5.25, 1, 2.25, 4). The line <code>err = (R - pred) * M</code> multiplies by the mask so blank cells contribute nothing. The SSE over the 19 ratings is 4.359, the penalty 5.463, and the loss 9.822. Training will search for the P and Q with the lowest loss.</p>
  <p>The penalty does two more jobs. It <em>fixes the scale</em>: double every user vector and halve every film vector, and every dot product, so every prediction and the SSE, is unchanged; without a penalty these are equally good and training can drift to huge or tiny numbers, but the penalty prefers balanced sizes (for this doubled-and-halved pair it would be 13.23 instead of 5.46). And it <em>shrinks users and films with few ratings</em>: Lagaan has one rating, so one error term pulls its vector while the penalty pulls it towards zero, and its predictions stay modest, a sensible default when we know little.</p>
  <p>Why insist on "observed cells only"? Linear algebra already offers the best low-rank approximation of a <em>full</em> matrix, the singular value decomposition (section 07). The tempting shortcut is to fill the blanks with 0 so the matrix is full and apply it:</p>
  <div class="fx" data-lang="py"># WRONG: treat every blank as a rating of 0, then take the best rank-2 fit (plain SVD)
U, s, Vt = np.linalg.svd(R, full_matrices=False)
R2 = (U[:, :2] * s[:2]) @ Vt[:2]
print("zero-filled SVD, Ben -&gt;", {films[i]: float(R2[1, i].round(2)) for i in (2, 4, 5)})
print("zero-filled SVD, Chen -&gt; Lagaan =", R2[2, 2].round(2))</div>
  <div class="fx" data-lang="text">zero-filled SVD, Ben -&gt; {'Lagaan': 1.49, 'K3G': 0.84, '3 Idiots': 2.68}
zero-filled SVD, Chen -&gt; Lagaan = 0.31</div>
  <p>Ben → Lagaan collapses to 1.49, K3G to 0.84 (below the 1-star minimum) and Chen → Lagaan to 0.31. "Not rated" was read as "rated 0", so Lagaan, with four zeros and one 5 in its column, looks like a film everybody hates. The masked loss avoids this entirely.</p>
  <p>One property of the loss shapes the training methods. The prediction p·q multiplies two unknowns, so L is <strong>not convex</strong> in P and Q together: there are many equally good solutions (any rotation of the factors) and possibly poor local minima. But if Q is frozen, L is an ordinary ridge regression in P, which is convex and has an exact solution, and the same holds the other way round. SGD (next section) follows the gradient; ALS (section 04) exploits the "convex in one half" structure.</p>

  <h2 id="mf-sgd"><span class="num">03</span>Training with SGD</h2>
  <p>We have a loss; now we need to move P and Q downhill on it. Take one observed rating and its share of the loss, ℓ = (r − p·q)² + λ(‖p‖² + ‖q‖²). With e = r − p·q, <a class="xref" data-note="m_calculus">calculus</a> gives the gradients ∂ℓ/∂p = −2e·q + 2λp and ∂ℓ/∂q = −2e·p + 2λq. Stepping against the gradient, and folding the 2 into the learning rate η (eta), gives the update rules</p>
  <p>p ← p + η (e·q − λp)     q ← q + η (e·p − λq)</p>
  <p>In words: if we predicted too low (e &gt; 0), move the user vector towards the film vector and the film vector towards the user vector, by an amount proportional to the error, and always shrink both a little (the λ term). Applying this to one rating at a time, in random order, is <strong>stochastic gradient descent</strong> (SGD; see <a class="xref" data-note="ml_loss_gd">gradient descent</a>). Think of a shop assistant who guesses a customer's reaction to a film, sees the real reaction, and adjusts both her picture of the customer and her picture of the film a little; after thousands of customers, both pictures are good.</p>
  <p>One step by hand on Ben → Dangal = 5, with small starting vectors p = (1, 0.5), q = (1.5, 0.5), η = 0.1 and λ = 0.1:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Calculation</th><th>Result</th></tr>
    <tr><td>Prediction</td><td>1 × 1.5 + 0.5 × 0.5</td><td>1.75</td></tr>
    <tr><td>Error e</td><td>5 − 1.75</td><td>3.25</td></tr>
    <tr><td>e·q − λp</td><td>(4.875 − 0.1, 1.625 − 0.05)</td><td>(4.775, 1.575)</td></tr>
    <tr><td>new p</td><td>(1, 0.5) + 0.1 × (4.775, 1.575)</td><td>(1.4775, 0.6575)</td></tr>
    <tr><td>e·p − λq (old p)</td><td>(3.25 − 0.15, 1.625 − 0.05)</td><td>(3.1, 1.575)</td></tr>
    <tr><td>new q</td><td>(1.5, 0.5) + 0.1 × (3.1, 1.575)</td><td>(1.81, 0.6575)</td></tr>
    <tr><td>New prediction</td><td>1.4775 × 1.81 + 0.6575 × 0.6575</td><td>3.107</td></tr>
  </table>
  <div class="fx" data-lang="py"># one SGD step on one rating: Ben -&gt; Dangal = 5
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
  <p>One step cut the error from 3.25 to 1.89. Note that the q update uses the <em>old</em> p; using the new p would be a slightly different, still valid, algorithm. The full loop starts from small random vectors (all zeros would never move, because e·q = 0 when q = 0; section 10 shows it), shuffles the 19 ratings every epoch, and applies the update to each:</p>
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
print("Ben -&gt;", {films[i]: float((P_sgd[1] @ Q_sgd[i]).round(2)) for i in (2, 4, 5)})</div>
  <div class="fx" data-lang="text">epoch    1  loss 282.463  train RMSE 3.854
epoch   10  loss   3.729  train RMSE 0.244
epoch   50  loss   3.159  train RMSE 0.162
epoch  100  loss   3.192  train RMSE 0.170
epoch  400  loss   3.124  train RMSE 0.159
[[4.72 4.19 4.24 1.03 0.94 3.93]
 [5.16 4.77 4.89 2.01 2.03 4.7 ]
 [2.   2.69 2.97 4.66 5.19 3.55]
 [0.19 1.06 1.32 4.16 4.71 2.  ]
 [4.95 4.77 4.94 2.85 2.99 4.92]]
Ben -&gt; {'Lagaan': 4.89, 'K3G': 2.03, '3 Idiots': 4.7}</div>
  <p>The loss falls from 282.5 after the first epoch to 3.73 by epoch 10. Ben's blanks come out as Lagaan 4.89, 3 Idiots 4.70 and K3G 2.03, the same order neighbourhood CF found, with no overlap needed. The line <code>P[u], Q[i] = (..., ...)</code> computes both right-hand sides before assigning, so the Q update uses the old P[u], exactly as in the hand step. Notice also that the loss at epoch 100 (3.192) is slightly higher than at epoch 50 (3.159): with a constant learning rate SGD never settles exactly, because each step follows one rating, not the whole loss. Real implementations decay the learning rate or stop early when the error on held-out ratings stops improving. A learning rate that is too large makes the factors explode (p·q grows quadratically); one too small needs thousands of epochs. Each epoch costs O(|Ω|·k), where |Ω| is the number of known ratings. SGD for MF was popularised by Simon Funk during the Netflix Prize in 2006.</p>

  <h2 id="mf-als"><span class="num">04</span>Alternating Least Squares</h2>
  <p>SGD needs a learning rate, many passes, and it visits ratings one at a time, which is hard to spread across machines. Section 02 noted that the loss becomes a simple ridge regression once one side is frozen. <strong>Alternating least squares</strong> (ALS) uses exactly that: freeze the film vectors and solve every user's best vector exactly, then freeze the user vectors and solve every film's, and repeat.</p>
  <p>With Q fixed, Ben's part of the loss is Σ<sub>i rated by Ben</sub> (r<sub>Ben,i</sub> − p·q<sub>i</sub>)² + λ‖p‖². That is ridge regression: the vectors of the films he rated are the rows of the design matrix, his ratings are the targets and p is the coefficient vector. Its exact solution is p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹ Q<sub>u</sub>ᵀ r<sub>u</sub>, where Q<sub>u</sub> holds only the rows of the films user u rated and r<sub>u</sub> their ratings.</p>
  <p>By hand, freezing the hand-picked film vectors with λ = 0.1. Ben rated Dangal (2, 0) → 5, Chak De (2, 0) → 5 and DDLJ (0, 2) → 2. Then Q<sub>B</sub>ᵀQ<sub>B</sub> is the sum of q qᵀ over his three films, [[4, 0], [0, 0]] + [[4, 0], [0, 0]] + [[0, 0], [0, 4]] = [[8, 0], [0, 4]], and adding λI gives [[8.1, 0], [0, 4.1]]. Q<sub>B</sub>ᵀr<sub>B</sub> = 5 × (2, 0) + 5 × (2, 0) + 2 × (0, 2) = (20, 4). The matrix is diagonal, so its inverse is just 1/8.1 and 1/4.1, and p<sub>Ben</sub> = (20/8.1, 4/4.1) = (2.469, 0.976).</p>
  <div class="fx" data-lang="py"># ALS half-step for Ben: freeze the hand-picked film vectors Q, solve Ben's vector exactly
lam = 0.1
rated = M[1]                                   # Dangal, Chak De, DDLJ
Qb, rb = Q[rated], R[1, rated]
A = Qb.T @ Qb + lam * np.eye(2)
b = Qb.T @ rb
print("Q_B^T Q_B + lam*I =", A.tolist())
print("Q_B^T r_B         =", b.tolist())
p_ben = np.linalg.solve(A, b)
print("Ben's new vector  =", p_ben.round(3))
print("Ben -&gt;", {films[i]: float(round(p_ben @ Q[i], 3)) for i in (2, 4, 5)},
      "  fitted:", (Qb @ p_ben).round(2), "vs", rb)</div>
  <div class="fx" data-lang="text">Q_B^T Q_B + lam*I = [[8.1, 0.0], [0.0, 4.1]]
Q_B^T r_B         = [20.0, 4.0]
Ben's new vector  = [2.469 0.976]
Ben -&gt; {'Lagaan': 5.426, 'K3G': 3.186, '3 Idiots': 4.192}   fitted: [4.94 4.94 1.95] vs [5. 5. 2.]</div>
  <p>Ben's fitted ratings are 4.94, 4.94 and 1.95 against his real 5, 5 and 2: almost exact, shrunk slightly by λ. But look at K3G: 3.186. The solve gave Ben a romance weight of 0.976, because the only way to produce his "2" for DDLJ, whose vector is pure romance, is a positive romance slider. In a model without an offset, a low rating still counts as <em>some</em> liking. Section 05 fixes that. Now alternate: solve every user with Q frozen, then every film with P frozen using the mirror formula q<sub>i</sub> = (P<sub>i</sub>ᵀP<sub>i</sub> + λI)⁻¹P<sub>i</sub>ᵀr<sub>i</sub>, and repeat. Each half-step gives the exact minimum for that half, so the loss can never go up.</p>
  <div class="fx" data-lang="py">def train_als(R, k=2, lam=0.1, iters=10, seed=0, log=(), M=None):
    rng = np.random.default_rng(seed)
    M = R &gt; 0 if M is None else M                 # which cells are observed
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
print("Ben -&gt;", {films[i]: float((P_als[1] @ Q_als[i]).round(2)) for i in (2, 4, 5)})
print("film vectors:", dict(zip(films, Q_als.round(2).tolist())))</div>
  <div class="fx" data-lang="text">iter  1  loss 53.804  train RMSE 1.105
iter  2  loss 28.141  train RMSE 0.494
iter  3  loss 21.768  train RMSE 0.302
iter  5  loss 16.390  train RMSE 0.186
iter 10  loss 11.191  train RMSE 0.159
[[4.77 4.26 3.75 1.15 0.9  3.98]
 [5.14 4.73 4.42 1.95 1.78 4.58]
 [1.97 2.57 3.85 4.73 5.17 3.43]
 [0.28 1.05 2.49 4.25 4.76 2.  ]
 [5.06 4.88 4.98 3.07 3.04 5.  ]]
Ben -&gt; {'Lagaan': 4.42, 'K3G': 1.78, '3 Idiots': 4.58}
film vectors: {'Dangal': [-1.27, -0.2], 'Chak De': [-1.08, 0.05], 'Lagaan': [-0.83, 0.5], 'DDLJ': [0.01, 1.17], 'K3G': [0.11, 1.33], '3 Idiots': [-0.93, 0.35]}</div>
  <p>Train RMSE is 0.186 after five sweeps and 0.159 after ten; Ben's blanks are Lagaan 4.42, 3 Idiots 4.58 and K3G 1.78, close to SGD. The film vectors are the interesting part: Dangal (−1.27, −0.20), Chak De (−1.08, 0.05), 3 Idiots (−0.93, 0.35) and Lagaan (−0.83, 0.50) point one way, DDLJ (0.01, 1.17) and K3G (0.11, 1.33) another. ALS found the two kinds of film without being told, and it placed 3 Idiots among the sports films although no tag says so (the negative signs are explained in section 09). The loss keeps falling (16.39 → 11.19) while RMSE barely moves, because ALS is still rebalancing the sizes of P and Q to lower the penalty. The λI term is essential: Lagaan has one rater, so P<sub>Lagaan</sub>ᵀP<sub>Lagaan</sub> is a 2 × 2 matrix of rank 1, and without λI its solve would fail or explode.</p>
  <table class="tbl">
    <tr><th></th><th>SGD</th><th>ALS</th></tr>
    <tr><td>Update</td><td>small step per rating</td><td>exact ridge solve per user / item</td></tr>
    <tr><td>Learning rate</td><td>needed, sensitive</td><td>none</td></tr>
    <tr><td>Cost</td><td>O(|Ω|k) per epoch</td><td>O(|Ω|k² + (m + n)k³) per sweep</td></tr>
    <tr><td>Parallel</td><td>awkward (shared vectors)</td><td>easy: users are independent given Q</td></tr>
    <tr><td>Ben: Lagaan, K3G, 3 Idiots</td><td>4.89, 2.03, 4.70 (10–50 epochs)</td><td>4.42, 1.78, 4.58 (5–10 sweeps)</td></tr>
    <tr><td>Best for</td><td>explicit ratings, custom losses, streaming updates</td><td>implicit data with all cells (section 08), Spark</td></tr>
  </table>

  <h2 id="mf-bias"><span class="num">05</span>Biases</h2>
  <p>A plain dot product has to explain everything at once: that Ben rates high in general, that K3G is received with mixed feelings by everyone, and that Ben in particular dislikes romance. The first two are simple facts that do not need taste sliders. Pulling them out into separate numbers lets the factors concentrate on taste. The simplest model with no taste at all is the <strong>baseline predictor</strong> r̂ = μ + b<sub>u</sub> + b<sub>i</sub>: the global mean, plus a <strong>user bias</strong> b<sub>u</sub> (how far this user's ratings sit from the global mean), plus an <strong>item bias</strong> b<sub>i</sub> (how far this film's ratings sit from what its raters usually give).</p>
  <p>By hand: b<sub>u</sub> = user mean − μ, so Asha and Dia −0.632 (strict), Ben and Chen +0.368, Esha +0.868 (the most generous). Then b<sub>i</sub> is the average of the leftovers r − μ − b<sub>u</sub> = r − user mean over the film's raters. Dangal's leftovers are Asha 5 − 3 = 2, Ben 1, Chen −2 and Esha 0.5, so b<sub>Dangal</sub> = 1.5/4 = +0.375. Lagaan has one leftover, Esha's +0.5, so b<sub>Lagaan</sub> = +0.5. A bias from one rating deserves little trust, so we also compute a <strong>shrunk</strong> version that divides by n<sub>i</sub> + λ<sub>b</sub> instead of n<sub>i</sub>, exactly the damped-mean idea: with λ<sub>b</sub> = 2, Lagaan's bias becomes 0.5/3 = 0.167, while Dangal's only drops to 1.5/6 = 0.25.</p>
  <div class="fx" data-lang="py">mu = R[M].mean()
bu = np.array([R[u, M[u]].mean() - mu for u in range(5)])             # user bias = user mean - mu
resid = np.where(M, R - mu - bu[:, None], np.nan)                     # what is left after mu + b_u
bi = np.nanmean(resid, axis=0)                                        # item bias = mean leftover
print("mu =", round(mu, 3))
print("user bias b_u:", {n: float(v) for n, v in zip(users, bu.round(3))})
print("item bias b_i:", {n: float(v) for n, v in zip(films, bi.round(3))})
print("baseline Ben -&gt;", {films[i]: float(round(mu + bu[1] + bi[i], 3)) for i in (2, 4, 5)})
# shrunk item bias: divide by (n_i + lam_b) instead of n_i, so items with few ratings stay near 0
lam_b = 2
bi_shrunk = np.nansum(resid, axis=0) / ((~np.isnan(resid)).sum(0) + lam_b)
print("shrunk item bias (lam_b = 2):", {n: float(v) for n, v in zip(films, bi_shrunk.round(3))})
base = mu + bu[:, None] + bi[None, :]
print("baseline train RMSE:", round(np.sqrt(((R - base)[M] ** 2).mean()), 3),
      "  global-mean-only RMSE:", round(np.sqrt(((R - mu)[M] ** 2).mean()), 3))</div>
  <div class="fx" data-lang="text">mu = 3.632
user bias b_u: {'Asha': -0.632, 'Ben': 0.368, 'Chen': 0.368, 'Dia': -0.632, 'Esha': 0.868}
item bias b_i: {'Dangal': 0.375, 'Chak De': 0.0, 'Lagaan': 0.5, 'DDLJ': -0.5, 'K3G': -0.125, '3 Idiots': 0.167}
baseline Ben -&gt; {'Lagaan': 4.5, 'K3G': 3.875, '3 Idiots': 4.167}
shrunk item bias (lam_b = 2): {'Dangal': 0.25, 'Chak De': 0.0, 'Lagaan': 0.167, 'DDLJ': -0.333, 'K3G': -0.083, '3 Idiots': 0.1}
baseline train RMSE: 1.396   global-mean-only RMSE: 1.563</div>
  <p>The baseline says Ben → Lagaan 4.5, 3 Idiots 4.167 and K3G 3.875: "generous rater, well-received films". It ranks Lagaan first on the strength of one 5, and it has no idea Ben dislikes romance, giving K3G 3.875. That is exactly the job left for the factors. Even so, biases alone cut the training RMSE from 1.563 (predicting μ everywhere) to 1.396, and the baseline is the standard reference every recommender must beat.</p>
  <p><strong>Biased MF</strong> adds the factors on top: r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub>, trained with SGD on the squared error plus λ(b<sub>u</sub>² + b<sub>i</sub>² + ‖p<sub>u</sub>‖² + ‖q<sub>i</sub>‖²). The gradient of the error with respect to a bias is just −e, so the bias updates are b<sub>u</sub> ← b<sub>u</sub> + η(e − λb<sub>u</sub>) and b<sub>i</sub> ← b<sub>i</sub> + η(e − λb<sub>i</sub>), and p and q update as before. This is the model that carried much of the Netflix Prize, and libraries such as Surprise call it simply "SVD".</p>
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
for i in (2, 4, 5):
    print(f"Ben -&gt; {films[i]:8s} = mu {mu_:.2f} {bu_[1]:+.2f} {bi_[i]:+.2f} {Pb[1] @ Qb_[i]:+.2f} = {full[1, i]:.2f}")</div>
  <div class="fx" data-lang="text">user bias [-0.55  0.08  0.08 -0.54  0.6 ]   item bias [ 0.08 -0.22  0.54 -0.45 -0.3   0.14]
train RMSE 0.088
Ben -&gt; Lagaan   = mu 3.63 +0.08 +0.54 +0.37 = 4.62
Ben -&gt; K3G      = mu 3.63 +0.08 -0.30 -1.64 = 1.77
Ben -&gt; 3 Idiots = mu 3.63 +0.08 +0.14 +0.91 = 4.76</div>
  <p>Read each prediction term by term. K3G: start from the average 3.63, add 0.08 because Ben rates a little high, subtract 0.30 because K3G gets mixed ratings, then subtract 1.64 because Ben's taste vector points away from K3G's: 1.77. 3 Idiots: 3.63 + 0.08 + 0.14 + 0.91 = 4.76. Lagaan: 3.63 + 0.08 + 0.54 + 0.37 = 4.62. Every term is explainable, and the ranking 3 Idiots, Lagaan, then K3G far below agrees with user-based CF (4.74, 4.50, 2.26). The learned user biases are smaller than the hand ones (Ben +0.08 against +0.368) because λ shrinks them and the factors explain part of the deviation.</p>
  <p>Two warnings. Lagaan's learned bias (+0.54) still rests on a single rating, and λ = 0.05 hardly shrinks it; the shrunk hand estimate (0.167) is more believable. And the training RMSE of 0.088 means almost nothing: the model has 1 + 5 + 6 + 22 = 34 numbers for 19 ratings, so it can nearly memorise them. A tiny training error tells us nothing about the blanks. Note also that b<sub>u</sub> is the same for all of a user's films, so it cannot change their order in a top-N list, while b<sub>i</sub> lifts generally liked films for everyone, which is one source of popularity bias in recommendations.</p>

  <h2 id="mf-tune"><span class="num">06</span>Choosing k and λ</h2>
  <p>Nineteen ratings are too few to hold any out, so to measure MF honestly and choose k (the number of factors) and λ (the penalty strength) we use the simulated CineCity of the previous two notes: 1,000 users × 1,000 films, each film with genre tags plus two hidden traits no tag records, 50,186 ratings. We hide exactly the same 20% that the CF note hid, so every number can be compared with its table (best neighbourhood CF 0.744) and with content-based filtering (0.801). Think of a student who memorises last year's paper: 100% on it says nothing about whether she learnt the subject, so we test on questions she has not seen. Each line below trains biased MF (the section 05 code) for 60 epochs on 40,182 ratings and scores the 10,004 hidden ones:</p>
  <div class="fx" data-lang="py">df, big_tags, hidden = make_ratings()                       # the simulator from the Basics note
big = df.values                                             # rows of (user, film, rating)
test = np.random.default_rng(1).random(len(big)) &lt; 0.2      # the same 20% hidden as in the CF note
nU = nI = 1000
Rtr = np.zeros((nU, nI)); Rtr[big[~test, 0], big[~test, 1]] = big[~test, 2]
tu, ti, y = big[test, 0], big[test, 1], big[test, 2]
print(f"{len(big):,} ratings; train {(Rtr &gt; 0).sum():,}, test {len(y):,}")

def rmse(pred): return np.sqrt(np.mean((np.clip(pred[tu, ti], 1, 5) - y) ** 2))
def biased_mf(k, lam, epochs=60):
    m, b1, b2, P_, Q_ = train_biased_sgd(Rtr, k=k, lam=lam, epochs=epochs)
    pred = m + b1[:, None] + b2[None, :] + P_ @ Q_.T
    train = np.sqrt(np.mean((pred[Rtr &gt; 0] - Rtr[Rtr &gt; 0]) ** 2))
    return pred, train, P_, Q_
mu_b = Rtr[Rtr &gt; 0].mean()
print(f"global mean only        test RMSE {rmse(np.full((nU, nI), mu_b)):.3f}")
print(f"biases only (k=0)       test RMSE {rmse(biased_mf(0, 0.05)[0]):.3f}")
runs = {}
for k, lam in [(10, 0.0), (10, 0.05), (10, 0.2), (1, 0.05), (2, 0.05), (4, 0.05), (6, 0.05), (20, 0.05)]:
    runs[k, lam] = biased_mf(k, lam)
    print(f"MF k={k:&lt;2}, lam={lam:&lt;4}      train RMSE {runs[k, lam][1]:.3f}  test RMSE {rmse(runs[k, lam][0]):.3f}")
pred4, _, P4, Q4 = runs[4, 0.05]                            # the model we keep</div>
  <div class="fx" data-lang="text">50,186 ratings; train 40,182, test 10,004
global mean only        test RMSE 1.007
biases only (k=0)       test RMSE 0.766
MF k=10, lam=0.0       train RMSE 0.373  test RMSE 0.789
MF k=10, lam=0.05      train RMSE 0.432  test RMSE 0.720
MF k=10, lam=0.2       train RMSE 0.721  test RMSE 0.767
MF k=1 , lam=0.05      train RMSE 0.674  test RMSE 0.753
MF k=2 , lam=0.05      train RMSE 0.620  test RMSE 0.729
MF k=4 , lam=0.05      train RMSE 0.535  test RMSE 0.699
MF k=6 , lam=0.05      train RMSE 0.502  test RMSE 0.716
MF k=20, lam=0.05      train RMSE 0.339  test RMSE 0.737</div>
  <p>Read it as a ladder of models. The global mean scores 1.007 and the biases alone 0.766. MF with k = 4 and λ = 0.05 reaches 0.699, clearly below the bias baseline, the best neighbourhood CF (0.744) and content-based filtering (0.801). MF wins because it can use the two hidden traits, which tags cannot see and which neighbourhoods only glimpse through noisy overlaps.</p>
  <p>The λ rows (k = 10) show the classic U-shape of the <a class="xref" data-note="ml_core">bias–variance trade-off</a>. With λ = 0 the training RMSE is lowest (0.373) but the test RMSE is 0.789, worse than the biases alone: the model memorises. λ = 0.05 gives 0.720. λ = 0.2 shrinks so hard that the training RMSE rises to 0.721 and the test RMSE (0.767) is back at the bias baseline. The k rows (λ = 0.05) tell the same story: k = 1 gives 0.753, k = 2 0.729, k = 4 0.699, then k = 6 0.716 and k = 20 0.737, while training RMSE keeps falling as k grows (0.674 down to 0.339). The simulator's true taste structure has six dimensions (four genre tastes and two hidden traits), but with about 40 training ratings per user the weakest directions cost more in noise than they explain. Extra factors fit noise.</p>
  <p>In practice k and λ (sometimes separate λ for biases and factors), the learning rate and the number of epochs are chosen on a validation set or by k-fold over ratings, SGD is stopped early when validation RMSE stops falling, and the final number is reported on a separate test set; here we tuned on the test set only to keep the code short. For a deployed system the split should be by time, training on the past and testing on the future. And remember that a better RMSE does not guarantee better top-10 lists; that is measured with ranking metrics in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>

  <h2 id="mf-svd"><span class="num">07</span>SVD versus Funk-SVD</h2>
  <p>Biased MF is often called "SVD", yet the SVD of linear algebra is something different. Any full matrix A (m × n) can be written exactly as A = U Σ Vᵀ, the <strong>singular value decomposition</strong>: U's columns are orthonormal "user patterns", V's columns are orthonormal "item patterns", and Σ is a diagonal of <strong>singular values</strong> s₁ ≥ s₂ ≥ … ≥ 0 that say how much each pattern matters (see <a class="xref" data-note="m_linalg">Linear Algebra</a>; <a class="xref" data-note="ml_pca">PCA</a> is the SVD of a centred data matrix). Keeping only the top k patterns gives A<sub>k</sub> = U<sub>k</sub>Σ<sub>k</sub>V<sub>k</sub>ᵀ, and the Eckart–Young theorem says no rank-k matrix has a smaller squared error over all cells. So why build our own training loop?</p>
  <p>The catch is "over all cells". Our matrix has blanks, and section 02 showed what filling them with zeros does. The better classical patch is to fill each blank with that user's mean, centre each row (so filled cells become 0, meaning "exactly average"), take the SVD, keep k patterns, and add the means back:</p>
  <div class="fx" data-lang="py"># classic SVD needs a FULL matrix, so first fill blanks with each user's mean
def svd_impute(Rm, k):
    Mk = Rm &gt; 0
    um = np.array([Rm[u, Mk[u]].mean() for u in range(Rm.shape[0])])
    F = np.where(Mk, Rm, um[:, None]) - um[:, None]    # filled, then centred per user
    U, s, Vt = np.linalg.svd(F, full_matrices=False)
    return um[:, None] + (U[:, :k] * s[:k]) @ Vt[:k], s  # rank-k approximation, means added back

S2, sv = svd_impute(R, 2)
print("toy: singular values", sv.round(2))
print("toy, mean-filled SVD k=2: Ben -&gt;", {films[i]: float(S2[1, i].round(2)) for i in (2, 4, 5)})</div>
  <div class="fx" data-lang="text">toy: singular values [5.45 2.34 1.87 0.43 0.36]
toy, mean-filled SVD k=2: Ben -&gt; {'Lagaan': 3.99, 'K3G': 3.35, '3 Idiots': 4.17}</div>
  <p>The singular values 5.45, 2.34, 1.87, 0.43 and 0.36 say the first two patterns hold (5.45² + 2.34²)/39 ≈ 90% of the variation (39 is the sum of all squared entries of the centred table), so the toy matrix really is close to rank 2. But mean-filled SVD predicts Ben → Lagaan 3.99, K3G 3.35 and 3 Idiots 4.17, all pulled towards Ben's mean of 4.00, because his three blanks were treated as observed ratings of exactly 4.00. It barely separates K3G from the others. At scale:</p>
  <div class="fx" data-lang="py">for k in [2, 6]:
    print(f"simulated CineCity, mean-filled SVD k={k}:  test RMSE {rmse(svd_impute(Rtr, k)[0]):.3f}")
for lam in [1, 5]:
    Pa, Qa = train_als(Rtr, k=6, lam=lam, iters=15)
    print(f"simulated CineCity, ALS k=6 lam={lam} on raw ratings:  test RMSE {rmse(Pa @ Qa.T):.3f}")
Mk = Rtr &gt; 0                                         # same ALS, but on ratings minus the global mean
Pc, Qc = train_als(np.where(Mk, Rtr - mu_b, 0), k=6, lam=1, iters=15, M=Mk)
print(f"simulated CineCity, ALS k=6 lam=1 on ratings - mu: test RMSE {rmse(mu_b + Pc @ Qc.T):.3f}")</div>
  <div class="fx" data-lang="text">simulated CineCity, mean-filled SVD k=2:  test RMSE 0.836
simulated CineCity, mean-filled SVD k=6:  test RMSE 0.834
simulated CineCity, ALS k=6 lam=1 on raw ratings:  test RMSE 0.654
simulated CineCity, ALS k=6 lam=5 on raw ratings:  test RMSE 0.697
simulated CineCity, ALS k=6 lam=1 on ratings - mu: test RMSE 0.706</div>
  <p>Mean-filled SVD scores 0.836 with k = 2 and 0.834 with k = 6, worse than the biases alone (0.766). Fitting only the observed cells changes everything: plain ALS from section 04, with no biases, reaches 0.654 with k = 6 and λ = 1 (0.697 with λ = 5). That is even better than our biased SGD model (0.699), and subtracting the global mean first makes the same ALS slightly worse (0.706). Two things explain this surprise. ALS solves every step exactly and is fully converged after 15 sweeps, while 60 epochs of SGD with a small learning rate are not. And in this simulation most ratings sit near the 5-star ceiling (people watch films they expect to like, and scores are clipped at 5), so "generous rater × crowd-pleaser" behaves more like a product than a sum, which uncentred factors can represent and additive biases cannot. The lesson is not "never use biases"; biases plus factors is the strong default, and the held-out number decides on your data.</p>
  <table class="tbl">
    <tr><th></th><th>True (truncated) SVD</th><th>"SVD" in recommenders (Funk-SVD, biased MF)</th></tr>
    <tr><td>Input</td><td>a full matrix (blanks must be filled)</td><td>observed cells only</td></tr>
    <tr><td>Factors</td><td>orthonormal U, V and singular values Σ</td><td>any P, Q; no orthogonality, no Σ</td></tr>
    <tr><td>Fitted by</td><td>exact linear algebra, unique</td><td>SGD or ALS on a non-convex loss, many solutions</td></tr>
    <tr><td>Regularised / biases</td><td>no / no</td><td>yes (λ) / usually μ + b<sub>u</sub> + b<sub>i</sub></td></tr>
    <tr><td>Our numbers</td><td>Ben → K3G 3.35; test RMSE ≈ 0.835</td><td>Ben → K3G 1.77; test RMSE 0.699 (ALS 0.654)</td></tr>
  </table>
  <p>Funk's 2006 blog post called his SGD method "SVD" because the result looks like a low-rank factorization, and the name stuck. So in an interview, "we used SVD" needs a follow-up: numpy or scikit-learn's <code>TruncatedSVD</code> on a filled matrix (where the imputation dominates the result), or Surprise's SVD, which is biased MF trained by SGD. Several extensions are worth knowing by name. <strong>SVD++</strong> adds an implicit term, because the set of films a user chose to rate says something even before the stars. <strong>timeSVD++</strong> lets biases drift over time. <strong>NMF</strong> (non-negative matrix factorization) forces all factors to be ≥ 0, so each user is an additive mix of parts, which is easier to read but usually a little less accurate.</p>

  <h2 id="mf-implicit"><span class="num">08</span>Implicit Feedback: Weighted ALS</h2>
  <p>Everything so far used stars. Most real logs only have plays, clicks and purchases, like CineCity's event log from the Basics note. With such data every known cell is positive, so two naive approaches both fail. If we fit only the known cells, the model can simply predict "loves it" everywhere. If we fit every blank as 0, we call every unseen film a dislike, although most were simply never seen. Hu, Koren and Volinsky (2008) found the middle ground by splitting each cell into two numbers. The <strong>preference</strong> p<sub>ui</sub> is 1 if the user interacted with the item at all and 0 otherwise; this is the target. The <strong>confidence</strong> c<sub>ui</sub> = 1 + α·r<sub>ui</sub>, where r<sub>ui</sub> counts plays (or minutes, or weighted events), says how sure we are about that target: strong engagement means we are very sure of the 1, and zero engagement gives a weak "probably 0" with weight 1. The loss now covers <em>every</em> cell:</p>
  <p>L = Σ<sub>all u, i</sub> c<sub>ui</sub> (p<sub>ui</sub> − x<sub>u</sub>·y<sub>i</sub>)² + λ(Σ‖x<sub>u</sub>‖² + Σ‖y<sub>i</sub>‖²)</p>
  <p>(implicit-feedback papers write the user and item vectors as x and y). For a user, with Y frozen, it is a weighted ridge regression with the solution x<sub>u</sub> = (YᵀC<sub>u</sub>Y + λI)⁻¹ YᵀC<sub>u</sub>p<sub>u</sub>, where C<sub>u</sub> is a diagonal matrix of the user's confidences. Think of a librarian who notices which books you borrow: a book you borrowed five times is clearly yours; one you never borrowed probably is not, but maybe you never saw it on the shelf, so she trusts the first fact strongly and the second only weakly.</p>
  <p>By hand, using the event-log weights (play 1, finish 3). Ben played and finished Dangal (4) and Chak De (4) and pressed play on DDLJ without finishing (1). With α = 2, p<sub>Ben</sub> = (1, 1, 0, 1, 0, 0) and c<sub>Ben</sub> = (9, 9, 1, 3, 1, 1). Freezing the hand film vectors as Y: YᵀC<sub>Ben</sub>Y = Σ c<sub>i</sub> y<sub>i</sub>y<sub>i</sub>ᵀ = [[78.5, 2.75], [2.75, 16.5]], plus λI → [[78.6, 2.75], [2.75, 16.6]]; YᵀC<sub>Ben</sub>p<sub>Ben</sub> = 9(2, 0) + 9(2, 0) + 3(0, 2) = (36, 6). The unplayed films drop out of this second sum because their p is 0, but they did count in the matrix. Solving gives x<sub>Ben</sub> = (0.448, 0.287).</p>
  <div class="fx" data-lang="py"># implicit view: the engagement weights from the Basics note's event log (play = 1, finish = 3)
plays = np.array([[4, 0, 0, 1, 0, 5],            # Asha
                  [4, 4, 0, 1, 0, 0],            # Ben
                  [0, 0, 0, 4, 4, 0],            # Chen
                  [0, 0, 0, 0, 4, 0],            # Dia
                  [0, 0, 4, 0, 0, 0]], float)    # Esha
alpha, lam = 2.0, 0.1
pref = (plays &gt; 0).astype(float)                 # p_ui: 1 if any interaction, else 0
conf = 1 + alpha * plays                         # c_ui: how sure we are about p_ui
print("Ben  p =", pref[1], "  c =", conf[1])
Cb = np.diag(conf[1])
A = Q.T @ Cb @ Q + lam * np.eye(2)               # every film counts, weighted by confidence
b = Q.T @ Cb @ pref[1]
print("Y^T C Y + lam*I =", A.round(4).tolist())
print("Y^T C p         =", b.tolist())
x_ben = np.linalg.solve(A, b)
print("Ben's vector =", x_ben.round(3), "  scores:", dict(zip(films, (Q @ x_ben).round(3).tolist())))</div>
  <div class="fx" data-lang="text">Ben  p = [1. 1. 0. 1. 0. 0.]   c = [9. 9. 1. 3. 1. 1.]
Y^T C Y + lam*I = [[78.6, 2.75], [2.75, 16.6]]
Y^T C p         = [36.0, 6.0]
Ben's vector = [0.448 0.287]   scores: {'Dangal': 0.896, 'Chak De': 0.896, 'Lagaan': 1.04, 'DDLJ': 0.574, 'K3G': 0.798, '3 Idiots': 0.816}</div>
  <p>The scores are not ratings; they estimate preference (near 1 means "likely to play") and are used only to rank films for a user. Lagaan scores 1.04, then 3 Idiots 0.816, with K3G close behind at 0.798. Why is K3G so close? Ben's abandoned DDLJ play counts as a preference with confidence 3, so his vector gets a romance component (0.287) that his stars (DDLJ = 2) would never have given him.</p>
  <p>Solving every user this way would cost O(n·k²) per user, because Y<sup>T</sup>C<sub>u</sub>Y sums over all n films. The speed trick: C<sub>u</sub> − I is zero except on the films the user played, so YᵀC<sub>u</sub>Y = YᵀY + Yᵀ(C<sub>u</sub> − I)Y. Compute YᵀY once per sweep, then add a correction over just that user's played films. This is what lets implicit ALS run on millions of users (Spark MLlib's <code>ALS(implicitPrefs=True)</code>, the <code>implicit</code> library).</p>
  <div class="fx" data-lang="py">def implicit_als(plays, k=2, alpha=2.0, lam=0.1, iters=15, seed=0):
    rng = np.random.default_rng(seed)
    conf = 1 + alpha * plays                      # preference is 1 exactly where plays &gt; 0
    X = rng.normal(0, 0.1, (plays.shape[0], k)); Y = rng.normal(0, 0.1, (plays.shape[1], k))
    I = np.eye(k)
    for _ in range(iters):
        YtY = Y.T @ Y                             # shared part, computed once per sweep
        for u in range(plays.shape[0]):
            nz = plays[u] &gt; 0                     # only the user's own interactions add a correction
            cu = conf[u, nz]                      # Y^T C_u Y = Y^T Y + Y^T (C_u - I) Y
            A = YtY + Y[nz].T @ ((cu - 1)[:, None] * Y[nz]) + lam * I
            X[u] = np.linalg.solve(A, Y[nz].T @ cu)
        XtX = X.T @ X
        for i in range(plays.shape[1]):
            nz = plays[:, i] &gt; 0
            ci = conf[nz, i]
            A = XtX + X[nz].T @ ((ci - 1)[:, None] * X[nz]) + lam * I
            Y[i] = np.linalg.solve(A, X[nz].T @ ci)
    return X, Y

X_, Y_ = implicit_als(plays)
S = X_ @ Y_.T
print(S.round(2))
for u, name in enumerate(users):
    unplayed = [i for i in range(6) if plays[u, i] == 0]
    order = sorted(unplayed, key=lambda i: -S[u, i])
    print(f"{name:5s} -&gt;", {films[i]: float(S[u, i].round(2)) for i in order[:3]})</div>
  <div class="fx" data-lang="text">[[ 0.99  0.88  0.3   1.06  0.11  0.9 ]
 [ 0.98  0.88  0.29  1.05  0.12  0.89]
 [ 0.35  0.32 -0.66  0.92  0.99  0.32]
 [-0.06 -0.05 -0.75  0.45  0.9  -0.06]
 [ 0.29  0.26  0.84 -0.23 -0.91  0.27]]
Asha  -&gt; {'Chak De': 0.88, 'Lagaan': 0.3, 'K3G': 0.11}
Ben   -&gt; {'3 Idiots': 0.89, 'Lagaan': 0.29, 'K3G': 0.12}
Chen  -&gt; {'Dangal': 0.35, 'Chak De': 0.32, '3 Idiots': 0.32}
Dia   -&gt; {'DDLJ': 0.45, 'Chak De': -0.05, '3 Idiots': -0.06}
Esha  -&gt; {'Dangal': 0.29, '3 Idiots': 0.27, 'Chak De': 0.26}</div>
  <p>With trained vectors, Ben's top unplayed film is 3 Idiots (0.89), then Lagaan (0.29), with K3G last (0.12): training fixes what the frozen hand vectors could not. Lagaan sits low because in this week's log only Esha played it, and Esha played nothing else, so Lagaan's vector is learned from one isolated user. Dia's list shows the central limitation of implicit data: everything she has not played scores near or below zero, and DDLJ appears (0.45) only because Chen, who shares K3G with her, played it. Dislikes are invisible, so use signals that mean engagement (completion, long watch time, repeat purchase), not just "started". At scale we treat every simulated rating as a play, hide one watched film per user (the same films the CF note hid) and check whether it lands in that user's top 10:</p>
  <div class="fx" data-lang="py"># the same at scale: every simulated rating = "watched"; hide one watched film per user
Xw = np.zeros((nU, nI)); Xw[big[:, 0], big[:, 1]] = 1
rng = np.random.default_rng(2)
held = np.array([rng.choice(np.flatnonzero(Xw[u])) for u in range(nU)])   # same films as in the CF note
Xtr = Xw.copy(); Xtr[np.arange(nU), held] = 0
def hit_rate(scores, k=10):
    scores = scores.astype(float).copy()
    scores[Xtr == 1] = -np.inf                                  # never recommend what was watched
    top = np.argpartition(-scores, k, axis=1)[:, :k]
    return np.mean([held[u] in top[u] for u in range(nU)])
print(f"popularity                     hit rate@10 = {hit_rate(np.tile(Xtr.sum(0), (nU, 1))):.3f}")
for k, alpha in [(16, 5), (16, 20), (32, 20)]:
    Xa, Ya = implicit_als(Xtr, k=k, alpha=alpha, lam=1.0, iters=10)
    print(f"implicit ALS k={k:2d} alpha={alpha:2d}       hit rate@10 = {hit_rate(Xa @ Ya.T):.3f}")</div>
  <div class="fx" data-lang="text">popularity                     hit rate@10 = 0.190
implicit ALS k=16 alpha= 5       hit rate@10 = 0.282
implicit ALS k=16 alpha=20       hit rate@10 = 0.237
implicit ALS k=32 alpha=20       hit rate@10 = 0.220</div>
  <p>Popularity finds the hidden film 19.0% of the time; implicit ALS with k = 16 and α = 5 reaches 28.2%, ahead of item-based CF in the CF note (26.9%) and close to its best user-based CF (30.1%). Larger α (20) or k (32) is worse here: with binary plays, a very high α makes every play a near-certain preference and the blanks almost weightless, so the model overfits the plays. Implicit models must be judged with ranking metrics like this, never RMSE: the targets are 0/1 and almost all are 0, so RMSE rewards predicting 0. The alternative training approach, sampling unplayed films as negatives and learning "played ranks above not played" (BPR), is in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>

  <h2 id="mf-embed"><span class="num">09</span>Embeddings and Two-Tower Models</h2>
  <p>The factors were introduced as tools for predicting ratings, but they are useful on their own. Every user and film is now a point in the same k-dimensional space; a learned dense vector like this is called an <strong>embedding</strong> (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>). A user is close, in the sense of a high dot product, to films they will like, and similar films are close to each other. The code reads off the explicit-ALS vectors from section 04, finds each film's nearest films by cosine, and adds a brand-new user:</p>
  <div class="fx" data-lang="py"># the trained explicit ALS vectors ARE embeddings: users and films in one 2-D space
print("user vectors:", dict(zip(users, P_als.round(2).tolist())))
Qn = Q_als / np.linalg.norm(Q_als, axis=1, keepdims=True)
sim = Qn @ Qn.T                                          # film-film cosine in factor space
for i in [5, 3]:
    order = [j for j in np.argsort(-sim[i]) if j != i]
    print(f"most like {films[i]:8s}:", [(films[j], round(float(sim[i, j]), 2)) for j in order[:3]])

# fold in a brand-new user: Farhan rates Dangal 5 and DDLJ 1; Q stays frozen
lam = 0.1
idx, r_new = np.array([0, 3]), np.array([5.0, 1.0])
Qe = Q_als[idx]
p_new = np.linalg.solve(Qe.T @ Qe + lam * np.eye(2), Qe.T @ r_new)
print("Farhan's vector", p_new.round(2), " predicted:", dict(zip(films, (Q_als @ p_new).round(2).tolist())))</div>
  <div class="fx" data-lang="text">user vectors: {'Asha': [-3.9, 1.01], 'Ben': [-4.3, 1.7], 'Chen': [-2.18, 4.07], 'Dia': [-0.8, 3.64], 'Esha': [-4.39, 2.66]}
most like 3 Idiots: [('Lagaan', 0.98), ('Chak De', 0.95), ('Dangal', 0.87)]
most like DDLJ    : [('K3G', 1.0), ('Lagaan', 0.51), ('3 Idiots', 0.34)]
Farhan's vector [-3.81  0.78]  predicted: {'Dangal': 4.7, 'Chak De': 4.15, 'Lagaan': 3.56, 'DDLJ': 0.88, 'K3G': 0.61, '3 Idiots': 3.81}</div>
  <figure class="viz"><svg viewBox="0 0 560 320" width="560">
<line x1="40" y1="270" x2="540" y2="270" stroke="currentColor"/><line x1="70" y1="300" x2="70" y2="15" stroke="currentColor"/>
<text x="300" y="312" text-anchor="middle" class="tm" font-size="11">factor 1 (sign-flipped) → "underdog drama"</text>
<text x="22" y="150" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 22 150)">factor 2 → "romance" (plus rating level)</text>
<circle cx="146.2" cy="282.0" r="5" class="fb sb"/><text x="155" y="293" font-size="10.5">Dangal (1.27, −0.20)</text>
<circle cx="134.8" cy="267.0" r="5" class="fb sb"/><text x="160" y="272" font-size="10.5">Chak De (1.08, 0.05)</text>
<circle cx="125.8" cy="249.0" r="5" class="fb sb"/><text x="160" y="253" font-size="10.5" font-weight="700">3 Idiots (0.93, 0.35)</text>
<circle cx="119.8" cy="240.0" r="5" class="fb sb"/><text x="160" y="236" font-size="10.5">Lagaan (0.83, 0.50)</text>
<circle cx="69.4" cy="199.8" r="5" class="fr sr"/><text x="78" y="205" font-size="10.5">DDLJ (−0.01, 1.17)</text>
<circle cx="63.4" cy="190.2" r="5" class="fr sr"/><text x="72" y="184" font-size="10.5">K3G (−0.11, 1.33)</text>
<rect x="299" y="204.4" width="10" height="10" class="fg sg"/><text x="314" y="213" font-size="11">Asha (3.90, 1.01)</text>
<rect x="323" y="163" width="10" height="10" class="fg sg"/><text x="338" y="172" font-size="11" font-weight="700">Ben (4.30, 1.70)</text>
<rect x="328.4" y="105.4" width="10" height="10" class="fg sg"/><text x="343" y="114" font-size="11">Esha (4.39, 2.66)</text>
<rect x="195.8" y="20.8" width="10" height="10" class="ft st"/><text x="211" y="30" font-size="11">Chen (2.18, 4.07)</text>
<rect x="113" y="46.6" width="10" height="10" class="ft st"/><text x="128" y="55" font-size="11">Dia (0.80, 3.64)</text>
<line x1="70" y1="270" x2="328" y2="168" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="70" y1="270" x2="125.8" y2="249" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="400" y="240" class="tm" font-size="10.5">circles = films, squares = users</text>
<text x="400" y="256" class="tm" font-size="10.5">ALS vectors, factor 1 × −1 (1 unit = 60 px)</text>
<text x="400" y="272" class="tm" font-size="10.5">Ben and 3 Idiots point the same way</text>
</svg><figcaption>The explicit-ALS embeddings from section 04, with factor 1 sign-flipped (which changes no prediction). Circles are films, squares are users.</figcaption></figure>
  <p>The figure plots these vectors with factor 1 sign-flipped, which changes no prediction because flipping both P's and Q's first column leaves every dot product the same. The four underdog dramas, 3 Idiots included, cluster to the right along factor 1, and Asha, Ben and Esha lie far out in that direction; DDLJ and K3G sit up along factor 2, towards Chen and Dia. The dashed lines show that Ben's vector and 3 Idiots' vector point the same way, which is why their dot product is high. Because this model has no biases, factor 2 also carries part of "how high this user rates", so every user sits above zero on it. Films sit close to the origin because their vectors are shorter than the users'.</p>
  <p>The vectors serve three purposes. <strong>Similar items</strong>: the cosine between film vectors gives a learned item–item similarity. 3 Idiots' nearest films are Lagaan (0.98), Chak De (0.95) and Dangal (0.87), and DDLJ's is K3G (1.00 to two decimals). Content-based filtering could not find this (3 Idiots has no sports tag), and neighbourhood CF could only compare 3 Idiots and Lagaan through Esha, the one user who rated both. <strong>Fold-in</strong>: a new user, Farhan, rates Dangal 5 and DDLJ 1. Keep Q frozen and do one ALS user-solve; his vector (−3.81, 0.78) lands next to Asha's (−3.90, 1.01), and he is offered 3 Idiots 3.81, Lagaan 3.56 and K3G 0.61, with no retraining. This is the cheapest cold-start fix once a user has a few ratings. <strong>Retrieval</strong>: a user's best films are the largest dot products p<sub>u</sub>·q<sub>i</sub>; with millions of films this is a maximum-inner-product search served by approximate nearest-neighbour indexes. For "similar items", cosine is usually better than the dot product, because a film vector's length mostly reflects how strongly its audience likes it (often its popularity), and cosine compares direction only.</p>
  <p>Did MF actually find the two hidden traits that the simulator planted and no tag records? We take the film matrix Q of biased MF with k = 4 from section 06 and regress each hidden trait on the four learned coordinates, comparing with a regression on the genre tags:</p>
  <div class="fx" data-lang="py"># at scale: do the learned film vectors contain the 2 hidden traits that no genre tag records?
def r2(target, feats):                                   # R^2 of a least-squares fit with intercept
    A = np.c_[np.ones(len(feats)), feats]
    coef = np.linalg.lstsq(A, target, rcond=None)[0]
    return 1 - np.var(target - A @ coef) / np.var(target)
n_rated = (Rtr &gt; 0).sum(0)
for name, keep in [("films with &gt;= 20 ratings", n_rated &gt;= 20), ("films with &lt; 20 ratings ", n_rated &lt; 20)]:
    print(f"{name} ({keep.sum():3d}):  R^2 hidden trait 1 from MF vectors {r2(hidden[keep, 0], Q4[keep]):.2f}, "
          f"trait 2 {r2(hidden[keep, 1], Q4[keep]):.2f};  from genre tags {r2(hidden[keep, 0], big_tags[keep]):.2f}, "
          f"{r2(hidden[keep, 1], big_tags[keep]):.2f}")</div>
  <div class="fx" data-lang="text">films with &gt;= 20 ratings (501):  R^2 hidden trait 1 from MF vectors 0.62, trait 2 0.70;  from genre tags 0.01, 0.01
films with &lt; 20 ratings  (499):  R^2 hidden trait 1 from MF vectors 0.28, trait 2 0.31;  from genre tags 0.01, 0.01</div>
  <p>For the 501 films with at least 20 training ratings, a straight-line fit on the MF vectors explains 62% and 70% of the variance of the two hidden traits; the genre tags explain 1%, so the traits really are invisible to content. For the 499 rarer films the MF vectors still explain 28% and 31%: fewer ratings give noisier vectors, which is the long-tail weakness that cold-start methods address. Nobody told MF that these traits exist. It recovered them because they are what makes rows of the rating matrix similar. That one result summarises this group of notes: content sees tags, neighbourhood CF sees overlaps, and MF sees the low-dimensional structure behind both.</p>
  <p>Why did the traits need a regression rather than reading one coordinate? Because the axes have no fixed meaning. For any invertible k × k matrix T, (PT)(QT⁻ᵀ)ᵀ = PQᵀ, so the predictions are identical; with the L2 penalty the solution is still free up to rotations and sign flips. That is why our trained factor 1 came out negative for the underdog dramas and why "factor 1 = underdog drama" is something we read off afterwards, not something the model promises. Dot products and cosines are unaffected, but individual coordinates are not stable across retrains, so never compare embeddings from two different runs coordinate by coordinate.</p>
  <p>Finally, the bridge to modern systems. MF looks up a user vector by user ID and a film vector by film ID. A <strong>two-tower model</strong> replaces each look-up with a small neural network (<a class="xref" data-note="dl_foundations">Deep Learning Foundations</a>): the user tower turns user features (ID, history, country, device, time) into a vector, the item tower turns item features (ID, tags, text, image embedding) into a vector, and the score is still their dot product. MF is exactly a two-tower model whose inputs are one-hot IDs and whose towers are a single linear layer. The gain is that a new film with a description but no plays still gets a vector from the item tower, and the item vectors can be precomputed and indexed for fast retrieval. Two-tower models are usually trained on implicit data with sampled or in-batch negatives, which is a ranking loss, so the details continue in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>
  <table class="tbl">
    <tr><th></th><th>Content-based</th><th>Neighbourhood CF</th><th>Biased MF</th><th>Implicit ALS</th><th>Two-tower</th></tr>
    <tr><td>Needs</td><td>item features</td><td>overlapping ratings</td><td>ratings, any overlap pattern</td><td>interaction counts</td><td>interactions + features</td></tr>
    <tr><td>Sparse data</td><td>unaffected</td><td>poor</td><td>good</td><td>good</td><td>good</td></tr>
    <tr><td>Hidden traits</td><td>invisible</td><td>only through overlaps</td><td>recovered (R² 0.62 / 0.70)</td><td>same factor form</td><td>if features or IDs carry them</td></tr>
    <tr><td>New item / new user</td><td>yes / after a few likes</td><td>no / after a few ratings</td><td>no / fold-in</td><td>no / fold-in</td><td>yes / yes</td></tr>
    <tr><td>Simulated CineCity</td><td>RMSE 0.801</td><td>RMSE 0.744</td><td>RMSE 0.699 (ALS 0.654)</td><td>HR@10 0.282</td><td>—</td></tr>
  </table>

  <h2 id="mf-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The first mistake is treating blanks as zero ratings, by running plain SVD or <code>TruncatedSVD</code> on the raw matrix. Zero-filled SVD predicted Ben → Lagaan 1.49, K3G 0.84 and Chen → Lagaan 0.31, because "not rated" became "hated". For explicit ratings, mask the loss to the observed cells; for implicit data, use confidence weighting.</p>
  <p>The second is initialising the factors to zero. The gradient for p is proportional to q and the gradient for q to p, so if both start at zero, nothing ever moves:</p>
  <div class="fx" data-lang="py">def fit_one(p, q, r=5.0, lr=0.1, lam=0.1, steps=100):    # SGD on a single rating (Ben -&gt; Dangal = 5)
    for _ in range(steps):
        e = r - p @ q
        p, q = p + lr * (e * q - lam * p), q + lr * (e * p - lam * q)
    return p, q
p, q = fit_one(np.zeros(2), np.zeros(2))                  # zero initialisation
print("start at zeros   :", p, q, " prediction", p @ q)
rng = np.random.default_rng(0)
p, q = fit_one(rng.normal(0, 0.1, 2), rng.normal(0, 0.1, 2))
print("small random init:", p.round(3), q.round(3), " prediction", round(p @ q, 3))</div>
  <div class="fx" data-lang="text">start at zeros   : [0. 0.] [0. 0.]  prediction 0.0
small random init: [ 2.212 -0.079] [ 2.212 -0.079]  prediction 4.9</div>
  <p>Starting at zeros, a hundred SGD steps on Ben → Dangal = 5 leave both vectors at exactly zero and the prediction at 0.0. Starting from small random values, the same steps reach a prediction of 4.9 (slightly below 5 because λ keeps the vectors short). Initialise with small random numbers, not zeros and not large values, which can make SGD explode.</p>
  <p>The third is judging by training error. Biased MF reached a training RMSE of 0.088 with 34 numbers for 19 ratings, and at scale λ = 0 had the best training RMSE (0.373) and a worse test RMSE (0.789) than λ = 0.05 (0.720). Always tune k, λ and the number of epochs on held-out ratings. Related: leaving out biases, which makes the factors waste capacity on "Esha rates everything high" and read a 2-star rating as liking (the ALS step gave K3G 3.19), or trusting a bias learned from one rating (Lagaan) without shrinking it.</p>
  <p>The remaining mistakes are about how the model is used. Evaluating implicit models, or top-N quality, with RMSE: implicit targets are 0/1 and mostly 0, and ranking quality needs hit rate, precision@k or NDCG on a time-based split. Reading meaning into individual coordinates or comparing them across training runs: factors are defined only up to rotation and sign. Forgetting cold start: MF has no vector for a user or film with no interactions and weak vectors for films with few (the hidden-trait R² fell from 0.62 to 0.28 for rarely rated films), so plan fold-in, content features or a two-tower model, and popularity as the last fallback. And counting every play as preference: Ben's abandoned DDLJ play pulled K3G level with 3 Idiots in the hand step, so use engagement signals and treat quick abandons as weak or negative.</p>

  <h2 id="mf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Ben's three blanks across the group</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Lagaan</th><th>K3G</th><th>3 Idiots</th></tr>
    <tr><td>Content-based (cosine)</td><td>0.265</td><td>−0.116</td><td>−0.235</td></tr>
    <tr><td>User-based CF</td><td>4.50</td><td>2.26</td><td>4.74</td></tr>
    <tr><td>Hand sliders</td><td>5.25</td><td>2.25</td><td>4.0</td></tr>
    <tr><td>SGD / ALS (no biases)</td><td>4.89 / 4.42</td><td>2.03 / 1.78</td><td>4.70 / 4.58</td></tr>
    <tr><td>Bias baseline</td><td>4.5</td><td>3.875</td><td>4.167</td></tr>
    <tr><td>Biased MF</td><td>4.62</td><td>1.77</td><td>4.76</td></tr>
    <tr><td>Mean-filled SVD</td><td>3.99</td><td>3.35</td><td>4.17</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Matrix factorization</b>: approximate the m × n user–item matrix by P Qᵀ with k ≪ m, n, fitted on observed cells; r̂<sub>ui</sub> = p<sub>u</sub>·q<sub>i</sub>.</li>
    <li><b>Latent factor</b>: one of the k hidden dimensions learned from data; readable sometimes, defined only up to rotation and sign.</li>
    <li><b>SGD</b>: update p and q after each rating along the negative gradient. <b>ALS</b>: alternately solve each user's and item's ridge regression exactly.</li>
    <li><b>Biases</b>: μ global mean, b<sub>u</sub> user offset, b<sub>i</sub> item offset; factors model what is left.</li>
    <li><b>Funk-SVD</b>: regularised MF fitted by SGD on observed cells; not a true SVD.</li>
    <li><b>Implicit ALS</b>: fit preference (interacted or not) on all cells, weighted by confidence 1 + α·count.</li>
    <li><b>Embedding</b>: a learned dense vector; <b>fold-in</b>: solve a new user's vector with Q frozen.</li>
    <li><b>Two-tower model</b>: neural user and item towers on features, scored by dot product; MF is the one-hot, linear special case.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Prediction</td><td>r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub></td></tr>
    <tr><td>Loss</td><td>Σ<sub>Ω</sub>(r<sub>ui</sub> − r̂<sub>ui</sub>)² + λ(b<sub>u</sub>² + b<sub>i</sub>² + ‖p<sub>u</sub>‖² + ‖q<sub>i</sub>‖²), Ω = observed cells</td></tr>
    <tr><td>SGD</td><td>e = r − r̂; p ← p + η(e·q − λp); q ← q + η(e·p − λq); b ← b + η(e − λb)</td></tr>
    <tr><td>ALS</td><td>p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub></td></tr>
    <tr><td>Shrunk item bias</td><td>b<sub>i</sub> = Σ<sub>u</sub>(r<sub>ui</sub> − μ − b<sub>u</sub>) / (n<sub>i</sub> + λ<sub>b</sub>)</td></tr>
    <tr><td>Implicit ALS</td><td>x<sub>u</sub> = (YᵀY + Yᵀ(C<sub>u</sub> − I)Y + λI)⁻¹YᵀC<sub>u</sub>p<sub>u</sub>; p = 𝟙[r &gt; 0], c = 1 + αr</td></tr>
    <tr><td>Truncated SVD</td><td>A<sub>k</sub> = U<sub>k</sub>Σ<sub>k</sub>V<sub>k</sub>ᵀ, best rank k for a full matrix</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">M = R &gt; 0                                              # mask of observed cells
err = (R - P @ Q.T) * M                                # loss only on known cells
e = r - P[u] @ Q[i]                                    # one SGD step
P[u], Q[i] = P[u] + lr * (e * Q[i] - lam * P[u]), Q[i] + lr * (e * P[u] - lam * Q[i])
Qu = Q[M[u]]                                           # one ALS user solve
P[u] = np.linalg.solve(Qu.T @ Qu + lam * np.eye(k), Qu.T @ R[u, M[u]])</div>
  <h3>Scale results (simulated CineCity, same 20% test set)</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Test RMSE</th></tr>
    <tr><td>global mean / biases only</td><td>1.007 / 0.766</td></tr>
    <tr><td>content-based / best neighbourhood CF</td><td>0.801 / 0.744</td></tr>
    <tr><td>biased MF k = 4, λ = 0.05 (λ = 0 at k = 10: 0.789)</td><td>0.699</td></tr>
    <tr><td>mean-filled SVD / ALS k = 6, λ = 1</td><td>≈ 0.835 / 0.654</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Mask the loss: blanks are unknown, not zero.</li>
    <li>Initialise small and random, never zeros.</li>
    <li>Tune k, λ, epochs on held-out data; train RMSE is meaningless.</li>
    <li>Add biases, and shrink those learned from few ratings.</li>
    <li>λI keeps ALS solves well defined for items with fewer ratings than k.</li>
    <li>Implicit models: ranking metrics, not RMSE; engagement signals, not raw plays.</li>
    <li>Coordinates are not stable across runs; compare dot products and cosines.</li>
  </ul>

  <h2 id="mf-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain matrix factorization for recommendation in three sentences.</summary><div class="qa-body">Represent every user and every item by a k-dimensional vector so that a rating is approximately their dot product, R ≈ PQᵀ. Fit the vectors on the observed ratings only, with an L2 penalty, using SGD or ALS. The trained model scores every blank, and similar users and items end up with similar vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does MF handle sparse data better than neighbourhood CF?</summary><div class="qa-body">Neighbourhood CF can only compare users or items through shared ratings, which are missing for most pairs in a sparse matrix. MF learns one vector per user and per item from all of that user's or item's ratings, so any user can be scored against any item and information flows through shared factors rather than shared items. On the simulated CineCity it improved RMSE from CF's best 0.744 to 0.699.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why train only on observed cells? What happens otherwise?</summary><div class="qa-body">Blanks are unknown, not zero. Filling them with 0 and fitting (plain SVD) teaches the model that unseen items are hated: Ben → Lagaan fell to 1.49. Filling with the user's mean is better but pulls every blank towards that mean (Ben 3.99, 3.35, 4.17) and scored RMSE ≈ 0.835 at scale, worse than biases alone (0.766).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the SGD update for one rating.</summary><div class="qa-body">ℓ = (r − p·q)² + λ(‖p‖² + ‖q‖²). With e = r − p·q, ∂ℓ/∂p = −2e·q + 2λp and ∂ℓ/∂q = −2e·p + 2λq. Step against the gradient and absorb the 2 into η: p ← p + η(e·q − λp), q ← q + η(e·p − λq), using the old p in the q update. On Ben → Dangal one step cut the error from 3.25 to 1.89.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does ALS work, and why is it popular at scale?</summary><div class="qa-body">With the item vectors fixed, each user's loss is a ridge regression with the closed form p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; then fix the users and solve the items; repeat. There is no learning rate, the loss never increases, users (and items) are independent within a half-step so it parallelises well (Spark), and it extends naturally to implicit data where every cell counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SGD or ALS: when would you choose each?</summary><div class="qa-body">SGD is simple, works with any differentiable loss and extra terms (biases, side features, time effects) and can update online, but needs a tuned learning rate and many epochs. ALS needs no learning rate, converges in a few sweeps, parallelises across users and items, and handles implicit data with all cells efficiently, but each step costs k³ solves and custom losses are harder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why add user and item biases?</summary><div class="qa-body">Ratings mix how a user rates in general, how an item is received in general, and taste. Biases capture the first two with one number each, so the factors model only the interaction. Without them, factors waste capacity on rating habits and read a low rating as some liking (the uncentred ALS step gave Ben K3G 3.19). On the simulated CineCity, biases alone took RMSE from 1.007 to 0.766.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does λ do in MF, and what happens if it is zero?</summary><div class="qa-body">It penalises large factors, which stops the model from memorising the training ratings, shrinks vectors of users and items with few ratings, fixes the scale ambiguity between P and Q, and keeps ALS solves well defined. With λ = 0 at k = 10 the training RMSE was lowest (0.373) but the test RMSE was 0.789, worse than biases alone; λ = 0.05 gave 0.720.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k?</summary><div class="qa-body">On held-out ratings, trying a range. Training error keeps falling as k grows, but test error has a minimum: at scale k = 4 was best (0.699), with k = 1 at 0.753 and k = 20 at 0.737. More factors capture more structure but, with limited ratings per user, the weakest directions fit noise. Larger datasets support larger k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Funk-SVD a singular value decomposition?</summary><div class="qa-body">No. A true SVD factors a full matrix exactly and uniquely into orthonormal U and V and singular values Σ. Funk-SVD fits arbitrary P and Q on observed cells only, with regularisation and SGD; there is no orthogonality, no Σ, and many equivalent solutions. It is called SVD only because the result is a low-rank factorization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain implicit ALS: what are preference and confidence?</summary><div class="qa-body">Preference p<sub>ui</sub> = 1 if the user interacted with the item, else 0; confidence c<sub>ui</sub> = 1 + α·count. The loss sums c·(p − x·y)² over all cells, so unseen items are weak negatives and heavily used items strong positives. It is solved with weighted ALS using YᵀC<sub>u</sub>Y = YᵀY + Yᵀ(C<sub>u</sub> − I)Y, so each user costs only their own interactions. At scale it reached hit rate@10 0.282 against popularity's 0.190.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should implicit-feedback models not be evaluated with RMSE?</summary><div class="qa-body">The targets are 0/1 preferences and almost all cells are 0, so a model predicting near 0 everywhere gets a small RMSE while recommending nothing useful. What matters is whether the items the user actually interacts with next appear near the top of their list, so use hit rate, precision@k, recall@k or NDCG on held-out interactions, ideally split by time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user signs up and rates two films. How do you recommend without retraining?</summary><div class="qa-body">Fold-in: keep the item vectors fixed and solve the new user's ridge regression on the two ratings, p = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr. Farhan (Dangal 5, DDLJ 1) got a vector next to Asha's and was offered 3 Idiots 3.81, Lagaan 3.56, K3G 0.61. With zero ratings, fall back to popularity, onboarding questions or features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you reliably interpret factor 1 as a named concept?</summary><div class="qa-body">For any invertible T, (PT)(QT⁻ᵀ)ᵀ = PQᵀ, so the predictions do not pin down the axes; with L2 the solution is still free up to rotations and sign flips. Our ALS factor 1 came out negative, and the simulator's hidden traits were spread across all four coordinates, so they had to be found by regression. Compare dot products and cosines, not coordinates, and never across runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is MF related to PCA and ridge regression?</summary><div class="qa-body">PCA is the SVD of a centred, fully observed data matrix: the best low-rank approximation over all cells. MF uses the same low-rank idea but fits only the observed cells, with a penalty. Each ALS half-step is literally a ridge regression with the frozen factors as features, which is why the λI term keeps it well defined even for an item with one rating.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does MF lead to two-tower models?</summary><div class="qa-body">MF is a two-tower model whose inputs are one-hot IDs and whose towers are single linear layers. Replacing the ID look-ups with neural networks over user and item features gives vectors for new items and users, which MF cannot. The item vectors are indexed for approximate nearest-neighbour retrieval, and the retrieved candidates are then ordered by a ranker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your MF model has great RMSE but users do not click its top-10. Why might that be?</summary><div class="qa-body">RMSE weights all known ratings equally, mostly mid-range ones, while users only see the top few; ratings are missing not at random, since people rate what they chose to watch; item biases push popular items for everyone; and a random split leaks the future. Optimise and evaluate for ranking (BPR, precision@k, NDCG) on a time split, and confirm with an A/B test.</div></details>
</main>
`
});
