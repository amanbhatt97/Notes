// notes/ml/ml_mf.js — Matrix Factorization
Object.assign(TOPIC_CONTENT, {
  "ml_mf": `<main>
  <h1>Matrix Factorization</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Matrix Factorization</span></div>
  <p class="lead">Matrix factorization (MF) describes every user and every item by a short list of hidden numbers, so that one dot product predicts any rating, even for pairs that share no history. This note builds it completely on the running example of the whole Recommendation Systems group, <strong>CineCity</strong>: five friends, six films, 19 ratings, and the question the previous two notes kept asking, <strong>what should we show Ben among Lagaan, K3G and 3 Idiots?</strong> Along the way: the latent-factor idea worked by hand, the objective on observed cells with L2 regularisation, an SGD update for one rating by hand, an ALS step for Ben by hand, global/user/item biases, choosing k and λ on held-out ratings of the simulated 1,000 × 1,000 CineCity (where MF beats every neighbourhood method of the CF note and its factors recover the two hidden traits no genre tag records), true SVD versus Funk-SVD, implicit-feedback ALS with confidence weights, the embeddings view and the step to two-tower models, plus from-scratch numpy code for every piece with its real output.</p>

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
<text x="340" y="165" text-anchor="middle" class="tm" font-size="10.5">same CineCity throughout: Asha, Ben, Chen, Dia, Esha × Dangal, Chak De, Lagaan, DDLJ, K3G, 3 Idiots</text>
<text x="340" y="185" text-anchor="middle" class="tm" font-size="10.5">CF compares rows/columns directly → MF compresses them into k hidden numbers each → ranking turns scores into lists</text>
</svg><figcaption>Matrix factorization is the third note of the Recommendation Systems group: the model-based answer to the sparsity problem that neighbourhood CF leaves open.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_cf">Collaborative Filtering</a></b><span>We predicted Ben's blanks from neighbours: users who rated the same films (Asha and Esha) or films rated by the same users. User-based CF said 3 Idiots 4.74, Lagaan 4.50, K3G 2.26. Left open: similarity needs overlap. Lagaan has a single rater (Esha), who shares only Dangal with Ben; in the simulated 1,000 × 1,000 CineCity 58.5% of film pairs share no rater at all, so neighbourhoods are tiny, noisy or missing. And CF cannot say <em>why</em> 3 Idiots, which has no sports tag, behaves like the sports dramas: the simulator hid two traits ("star power", "director style") that no tag records.</span></li>
    <li><b>This note adds: a learned model of the whole matrix</b><span>Every user and every film gets k hidden numbers (latent factors), trained so that their dot product matches every known rating. Information flows through the shared factors, so any user can be scored on any film. We learn how to train it (SGD, ALS), make it honest (regularisation, held-out error), add biases, handle clicks instead of stars (implicit ALS) and read the factors as embeddings, which on the simulated CineCity turn out to contain the hidden traits.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a></b><span>MF gives a score for every (user, film) pair (Ben: 3 Idiots 4.76, Lagaan 4.62, K3G 1.77). But users see a short ordered list, not scores; brand-new users and films have no factors yet; and accuracy on ratings is not the business goal. The next note builds Ben's actual row from these scores, measures lists (precision@k, NDCG), and handles cold start and feedback loops. Background: <a class="xref" data-note="ml_recsys">Recommendation Systems: Basics</a> for the matrix, the event log and the content-based scores.</span></li>
  </ol>

  <h2 id="mf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Latent factors</b><span>Q: how can we score Ben's blanks when neighbours barely overlap? → Give every user and film k hidden "taste sliders"; rating ≈ user vector · film vector. With hand-picked sliders Ben (2.5, 0.5) · 3 Idiots (1.5, 0.5) = 4.0, Lagaan 5.25, K3G 2.25. But who picks the sliders?</span></li>
    <li><b>The objective</b><span>Q: how do we score a set of factors? → Squared error on the 19 observed ratings only, plus λ times the size of all factors: 4.359 + 5.463 = 9.822 for our hand sliders. Filling blanks with 0 instead drags Ben → Lagaan to 1.49. But how do we lower this loss?</span></li>
    <li><b>SGD</b><span>Q: how do we improve the factors step by step? → For one rating, compute the error and nudge both vectors along the gradient: Ben → Dangal error 3.25 → 1.89 in one step. Loop over all ratings: train RMSE 0.16, Ben → Lagaan 4.89, 3 Idiots 4.70, K3G 2.03. But it needs a learning rate and many passes…</span></li>
    <li><b>ALS</b><span>Q: is there a step with no learning rate? → Freeze the films and each user becomes a tiny ridge regression with an exact answer; then swap. Ben's solve gives (2.469, 0.976). Converges in a handful of sweeps, parallel. But the uncentred factors read Ben's 2 for DDLJ as "some romance liking" (K3G 3.19), and they waste effort on who rates high…</span></li>
    <li><b>Biases</b><span>Q: how do we separate "Ben rates high" from "Ben likes this"? → prediction = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub>: K3G = 3.63 + 0.08 − 0.30 − 1.64 = 1.77, 3 Idiots 4.76, Lagaan 4.62. But train RMSE 0.088 with 34 numbers for 19 ratings looks too good…</span></li>
    <li><b>Held-out tuning of k and λ</b><span>Q: is the model memorising, and does it beat CF? → On the simulated CineCity with the CF note's 20% test set: global mean 1.007, biases 0.766, best CF 0.744, MF 0.699 at k = 4, λ = 0.05; λ = 0 overfits (0.789 at k = 10). But isn't this just SVD from linear algebra?</span></li>
    <li><b>SVD vs Funk-SVD</b><span>Q: why not use the classic SVD? → It needs every cell filled; mean-filling gives test RMSE ≈ 0.835, worse than the biases alone. Plain ALS fitted on observed cells only reaches 0.654. "Funk-SVD" is SVD in name only. But most real data is clicks and plays, not stars…</span></li>
    <li><b>Implicit ALS</b><span>Q: how do we factorize plays, where a blank is "unknown", not "disliked"? → Fit preference p = 1/0 on every cell, weighted by confidence c = 1 + α·plays: Ben's solve gives (0.448, 0.287), Lagaan first. At scale: hit rate@10 0.282 vs popularity 0.190. But what are these vectors, and how do they feed a real system?</span></li>
    <li><b>Embeddings &amp; two-tower</b><span>Q: what do the factors mean and how are they used? → They are embeddings: 3 Idiots' nearest film is Lagaan (cosine 0.98) although it has no sports tag; at scale the film vectors recover the two hidden traits (R² 0.62 and 0.70) that tags cannot (0.01); a new user is folded in from two ratings; a two-tower network replaces ID lookups with feature towers. Next note: turning scores into ranked lists.</span></li>
  </ol>

  <h2 id="mf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Matrix Factorization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea</div>
        <ul>
          <li><b>R ≈ P Qᵀ</b>: m × n sparse matrix ≈ (m × k)(k × n), k small</li>
          <li><b>r̂<sub>ui</sub> = p<sub>u</sub> · q<sub>i</sub></b>: Ben (2.5, 0.5) · 3 Idiots (1.5, 0.5) = 4.0</li>
          <li>Factors are learned, not named; often readable ("underdog drama" vs "romance")</li>
          <li>k(m + n) numbers instead of m·n cells: Netflix k = 50 → 24.9 M vs 8.5 B</li>
          <li>💡 Taste sliders on a mixing desk</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Objective</div>
        <ul>
          <li><b>L = Σ<sub>observed</sub> (r − p·q)² + λ(Σ‖p‖² + Σ‖q‖²)</b></li>
          <li>Observed cells only: hand sliders SSE 4.359 + penalty 5.463</li>
          <li>λ: stops memorising, fixes scale ambiguity (P·c, Q/c)</li>
          <li>Non-convex jointly, convex in P with Q fixed</li>
          <li>⚠ Zero-filled SVD: Ben → Lagaan 1.49</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training</div>
        <ul>
          <li><b>SGD</b>: e = r − p·q; p += η(e q − λp); q += η(e p − λq)</li>
          <li>By hand: Ben → Dangal error 3.25 → 1.89 in one step</li>
          <li><b>ALS</b>: p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; Ben (2.469, 0.976)</li>
          <li>SGD: simple, any loss; ALS: no learning rate, parallel, implicit-friendly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Biases &amp; tuning</div>
        <ul>
          <li><b>r̂ = μ + b<sub>u</sub> + b<sub>i</sub> + p·q</b>; μ = 3.632, b<sub>Ben</sub> = +0.368 by hand</li>
          <li>Shrink: b<sub>i</sub> = Σ resid / (n<sub>i</sub> + λ<sub>b</sub>); Lagaan (1 rating) 0.5 → 0.167</li>
          <li>Held-out RMSE: mean 1.007 → biases 0.766 → CF 0.744 → MF 0.699</li>
          <li>λ U-shape (k = 10): 0 → 0.789, 0.05 → 0.720, 0.2 → 0.767</li>
          <li>Tune k, λ, epochs on held-out ratings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SVD &amp; implicit</div>
        <ul>
          <li><b>SVD</b> R = UΣVᵀ: best rank-k for a FULL matrix (Eckart–Young)</li>
          <li>Mean-filled SVD test RMSE 0.835 vs ALS on observed cells 0.654</li>
          <li><b>Implicit ALS</b>: p<sub>ui</sub> = [plays &gt; 0], c<sub>ui</sub> = 1 + α·plays, all cells</li>
          <li>x<sub>u</sub> = (YᵀC<sub>u</sub>Y + λI)⁻¹YᵀC<sub>u</sub>p<sub>u</sub>; trick YᵀY + Yᵀ(C<sub>u</sub> − I)Y</li>
          <li>⚠ an abandoned play is still a "play" (Ben's DDLJ)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Embeddings</div>
        <ul>
          <li>p<sub>u</sub>, q<sub>i</sub> live in one space; cosine(3 Idiots, Lagaan) = 0.98</li>
          <li>At scale: hidden traits recovered, R² 0.62 / 0.70 (tags: 0.01)</li>
          <li>Axes only defined up to rotation/sign</li>
          <li>Fold-in a new user: one ridge solve with Q frozen</li>
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
      <div class="rm-item rm-done" data-target="mf-tune"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Overfitting, k and λ</span><span class="rm-sub">Held-out ratings at scale</span></div></div>
      <div class="rm-item rm-done" data-target="mf-svd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SVD vs Funk-SVD</span><span class="rm-sub">Why "SVD" is a misnomer</span></div></div>
      <div class="rm-item rm-done" data-target="mf-implicit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Implicit Feedback ALS</span><span class="rm-sub">Preference and confidence</span></div></div>
      <div class="rm-item rm-done" data-target="mf-embed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Embeddings &amp; Two-Tower</span><span class="rm-sub">Factors as vectors, hidden traits</span></div></div>
      <div class="rm-item rm-done" data-target="mf-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One dot product, many tools</span></div></div>
      <div class="rm-item rm-done" data-target="mf-compare"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs CF, content, SVD, two-tower</span></div></div>
      <div class="rm-item rm-done" data-target="mf-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="mf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mf-idea"><span class="num">01</span>Latent Factors: The Idea</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Neighbourhood CF predicts Ben's blanks from users or films that overlap with Ben. Lagaan has one rater, Esha, who shares a single film with Ben; on a real catalogue most pairs share nothing, so there are no reliable neighbours. Can we predict a rating without needing any overlap between this user and other users?</p>
  </div>
  <h3>The running example</h3>
  <p>CineCity, exactly as in the previous two notes: five friends rated some of six films from 1 to 5 stars. A dot (·) means "not rated". Our question for the whole note: <strong>what should we show Ben among Lagaan, K3G and 3 Idiots?</strong></p>
  <table class="tbl"><caption>Ratings matrix R (5 users × 6 films, 19 of 30 cells known)</caption>
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>user mean</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>·</td><td>1</td><td>1</td><td>4</td><td>3.00</td></tr>
    <tr><td>Ben</td><td>5</td><td>5</td><td><strong>?</strong></td><td>2</td><td><strong>?</strong></td><td><strong>?</strong></td><td>4.00</td></tr>
    <tr><td>Chen</td><td>2</td><td>·</td><td>·</td><td>5</td><td>5</td><td>·</td><td>4.00</td></tr>
    <tr><td>Dia</td><td>·</td><td>1</td><td>·</td><td>4</td><td>5</td><td>2</td><td>3.00</td></tr>
    <tr><td>Esha</td><td>5</td><td>·</td><td>5</td><td>·</td><td>3</td><td>5</td><td>4.50</td></tr>
  </table>
  <p>By eye there are two kinds of film: Dangal, Chak De, Lagaan and 3 Idiots (underdog stories: a wrestling family, a hockey team, a village cricket team, three engineering students against the system) and DDLJ and K3G (family romances). And two kinds of viewer: Asha, Ben and Esha love the first kind, Chen and Dia the second. The genre tags of the Basics note only half see this: 3 Idiots is tagged drama and comedy, not sports, so content-based filtering ranked it <em>last</em> for Ben (cosine −0.235), while Asha and Esha, who share Ben's taste, gave it 4 and 5. Ben gave Dangal and Chak De 5 and DDLJ 2, so we expect high Lagaan and 3 Idiots and a low K3G. Every section of this note will refine that guess.</p>
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
  <p><code>M = R &gt; 0</code> is the mask of known cells; every formula in this note uses it to ignore blanks. The global mean μ = 69 / 19 = 3.632 and the five user means will come back when we add biases (section 05).</p>
  <h3>Describe everything by a few hidden numbers</h3>
  <p>The plain-words idea: if we could describe every film by "how much of an underdog drama is it, how romantic is it" and every user by "how much do I enjoy underdog dramas, how much do I enjoy romance", then a rating would be simply the sum of (enjoyment × amount) over the two qualities. That sum is a <strong>dot product</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sound mixing desk with two sliders. Each film is a recording with a certain amount of bass and treble; each listener has a personal volume for bass and treble. How much a listener enjoys a recording is (bass in it × their bass liking) + (treble in it × their treble liking). Nobody labels the sliders in advance: training discovers what each slider means from the ratings alone.</p>
  </div>
  <p><strong>By hand.</strong> Pick the sliders ourselves (column 1 = underdog drama, column 2 = romance). Lagaan gets a little romance (it has the romance tag); 3 Idiots a bit less underdog than the sports films:</p>
  <table class="tbl"><caption>Hand-picked factors, k = 2</caption>
    <tr><th>Film</th><th>q<sub>i</sub> (underdog, romance)</th><th></th><th>User</th><th>p<sub>u</sub> (underdog, romance)</th></tr>
    <tr><td>Dangal</td><td>(2, 0)</td><td></td><td>Asha</td><td>(2.25, 0.5)</td></tr>
    <tr><td>Chak De</td><td>(2, 0)</td><td></td><td>Ben</td><td>(2.5, 0.5)</td></tr>
    <tr><td>Lagaan</td><td>(2, 0.5)</td><td></td><td>Chen</td><td>(1, 2.5)</td></tr>
    <tr><td>DDLJ</td><td>(0, 2)</td><td></td><td>Dia</td><td>(0.5, 2.25)</td></tr>
    <tr><td>K3G</td><td>(0.5, 2)</td><td></td><td>Esha</td><td>(2.5, 1)</td></tr>
    <tr><td>3 Idiots</td><td>(1.5, 0.5)</td><td></td><td></td><td></td></tr>
  </table>
  <ul>
    <li>Ben → 3 Idiots = 2.5 × 1.5 + 0.5 × 0.5 = 3.75 + 0.25 = <strong>4.0</strong>.</li>
    <li>Ben → Lagaan = 2.5 × 2 + 0.5 × 0.5 = 5 + 0.25 = <strong>5.25</strong> (above the 5-star maximum: nothing in a dot product knows about the scale; we clip when we show it).</li>
    <li>Ben → K3G = 2.5 × 0.5 + 0.5 × 2 = 1.25 + 1 = <strong>2.25</strong>.</li>
    <li>Ben → DDLJ = 0 + 0.5 × 2 = 1 (he really gave 2: the sliders are not perfect).</li>
  </ul>
  <p>Doing this for every pair is a matrix product: stack the user vectors as rows of P (5 × 2) and the film vectors as rows of Q (6 × 2); then <strong>R̂ = P Qᵀ</strong> is a full 5 × 6 table, blanks included.</p>
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
  <h3>Why so few numbers can work</h3>
  <p>P and Q hold k(m + n) = 2 × (5 + 6) = 22 numbers, versus m × n = 30 cells (19 known). At Netflix Prize scale (480,189 users, 17,770 films, 1.18% of cells rated) with k = 50 that is 50 × 497,959 ≈ 24.9 million numbers instead of 8.53 billion cells. It works because tastes are not random: every user's row is roughly a mix of a few "taste profiles", so the full matrix is close to <strong>low rank</strong>. The factors are that small set of profiles. And because every rating Ben gave updates the same Ben vector, and every rating of Lagaan by anyone updates the same Lagaan vector, information reaches Ben → Lagaan even though Esha, its only rater, barely overlaps with Ben.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Matrix factorization</strong> (for recommendation): approximate the user × item matrix R (m × n) by P Qᵀ, with P ∈ ℝ<sup>m×k</sup>, Q ∈ ℝ<sup>n×k</sup> and k ≪ min(m, n), fitted on the observed cells only. The prediction is r̂<sub>ui</sub> = p<sub>u</sub> · q<sub>i</sub> = Σ<sub>f=1..k</sub> p<sub>uf</sub> q<sub>if</sub>. Each of the k dimensions is a <strong>latent factor</strong>: a hidden property learned from data, not given.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Expecting the learned factors to be named "underdog drama" and "romance". Here we picked them by hand. A trained model finds directions that explain the ratings; they are often interpretable but can be any rotation or sign flip of the "nice" ones (section 09).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The objective.</b> Our hand sliders say Lagaan 5.25, 3 Idiots 4.0, K3G 2.25, but they were guesses: Ben → DDLJ came out 1 instead of 2, Asha → K3G 2.125 instead of 1. We need one number that says how good a set of factors is, so a computer can search for better ones.</div>

  <h2 id="mf-obj"><span class="num">02</span>The Objective</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given any P and Q, how do we score them? Which cells should count, and what stops the model from fitting the known ratings perfectly and predicting nonsense for the blanks?</p>
  </div>
  <h3>Squared error on observed cells</h3>
  <p>Compare the prediction with the truth only where the truth exists. With e<sub>ui</sub> = r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>, the hand sliders give:</p>
  <table class="tbl"><caption>Errors of the hand sliders (observed cells only)</caption>
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>Σ e²</th></tr>
    <tr><td>Asha</td><td>5 − 4.5 = 0.5</td><td>4 − 4.5 = −0.5</td><td>·</td><td>1 − 1 = 0</td><td>1 − 2.125 = −1.125</td><td>4 − 3.625 = 0.375</td><td>0.25 + 0.25 + 1.265625 + 0.140625 = 1.90625</td></tr>
    <tr><td>Ben</td><td>5 − 5 = 0</td><td>5 − 5 = 0</td><td>·</td><td>2 − 1 = 1</td><td>·</td><td>·</td><td>1</td></tr>
    <tr><td>Chen</td><td>2 − 2 = 0</td><td>·</td><td>·</td><td>5 − 5 = 0</td><td>5 − 5.5 = −0.5</td><td>·</td><td>0.25</td></tr>
    <tr><td>Dia</td><td>·</td><td>1 − 1 = 0</td><td>·</td><td>4 − 4.5 = −0.5</td><td>5 − 4.75 = 0.25</td><td>2 − 1.875 = 0.125</td><td>0.25 + 0.0625 + 0.015625 = 0.328125</td></tr>
    <tr><td>Esha</td><td>5 − 5 = 0</td><td>·</td><td>5 − 5.5 = −0.5</td><td>·</td><td>3 − 3.25 = −0.25</td><td>5 − 4.25 = 0.75</td><td>0.25 + 0.0625 + 0.5625 = 0.875</td></tr>
    <tr><td colspan="7"><strong>SSE</strong> over the 19 known ratings</td><td><strong>4.359375</strong></td></tr>
  </table>
  <h3>Adding the L2 penalty</h3>
  <p>With 22 free numbers and only 19 ratings, the model could fit every known rating exactly and still say anything about the blanks. So we add a cost for large factors, λ times the sum of all squared entries (L2 regularisation, see <a class="xref" data-note="ml_regularization">Regularization</a>). With λ = 0.1: ‖P‖² = (5.0625 + 0.25) + (6.25 + 0.25) + (1 + 6.25) + (0.25 + 5.0625) + (6.25 + 1) = 31.625, ‖Q‖² = 4 + 4 + 4.25 + 4 + 4.25 + 2.5 = 23, penalty = 0.1 × 54.625 = 5.4625. Loss = 4.359 + 5.463 = <strong>9.822</strong>.</p>
  <p style="text-align:center">L(P, Q) = Σ<sub>(u,i) observed</sub> (r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>)² + λ ( Σ<sub>u</sub> ‖p<sub>u</sub>‖² + Σ<sub>i</sub> ‖q<sub>i</sub>‖² )</p>
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
  <p>The printed table is P Qᵀ, the hand predictions, blanks included (Ben's row: 5, 5, 5.25, 1, 2.25, 4). The masked error <code>(R - pred) * M</code> zeroes the blanks so they add nothing; SSE 4.359375 and penalty 5.4625 match the hand table.</p>
  <h3>Two more jobs the penalty does</h3>
  <p><strong>It fixes the scale.</strong> Double every user vector and halve every film vector: every dot product, so every prediction and the SSE, is unchanged. Without a penalty these are equally good, and training can drift to huge or tiny numbers. With the penalty: 0.1 × (4 × 31.625 + 23 / 4) = 0.1 × (126.5 + 5.75) = 13.23, much worse than 5.46, so the penalty prefers balanced sizes.</p>
  <p><strong>It shrinks users and films with few ratings.</strong> Lagaan has one rating (Esha's 5): one squared-error term pulls its vector and the same penalty pulls it to 0, so its vector stays small and its predictions stay modest: a sensible default when we know little.</p>
  <h3>The wrong way: fill the blanks with zeros</h3>
  <p>Classic linear algebra gives the best rank-2 approximation of a <em>full</em> matrix (the SVD, section 07). Treating blanks as 0 stars makes the matrix full, but now the model is trained to predict 0 for every unseen film:</p>
  <div class="fx" data-lang="py"># WRONG: treat every blank as a rating of 0, then take the best rank-2 fit (plain SVD)
U, s, Vt = np.linalg.svd(R, full_matrices=False)
R2 = (U[:, :2] * s[:2]) @ Vt[:2]
print("zero-filled SVD, Ben -&gt;", {films[i]: float(R2[1, i].round(2)) for i in (2, 4, 5)})
print("zero-filled SVD, Chen -&gt; Lagaan =", R2[2, 2].round(2))</div>
  <div class="fx" data-lang="text">zero-filled SVD, Ben -&gt; {'Lagaan': 1.49, 'K3G': 0.84, '3 Idiots': 2.68}
zero-filled SVD, Chen -&gt; Lagaan = 0.31</div>
  <p>Ben → Lagaan collapses to 1.49, K3G to 0.84 (below the 1-star minimum) and Chen → Lagaan to 0.31, because "not rated" was read as "rated 0". Lagaan, with ten zeros and one 5 in its column, looks like a film everybody hates. The fix is the masked loss above: blanks contribute nothing.</p>
  <h3>The shape of the problem</h3>
  <p>The prediction p·q multiplies two unknowns, so L is <strong>not convex</strong> in (P, Q) together: there are many equally good solutions (any rotation of the factors) and possibly poor local minima. But if Q is frozen, L is an ordinary ridge regression in P, which is convex with an exact solution, and vice versa. Section 03 exploits the gradient; section 04 exploits the "convex in one half" structure.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regularised MF objective</strong>: minimise Σ<sub>(u,i)∈Ω</sub> (r<sub>ui</sub> − p<sub>u</sub>·q<sub>i</sub>)² + λ(Σ‖p<sub>u</sub>‖² + Σ‖q<sub>i</sub>‖²), where Ω is the set of observed cells and λ ≥ 0 is chosen on held-out data. Some libraries scale the penalty per rating (λ n<sub>u</sub>‖p<sub>u</sub>‖², "weighted-λ" in ALS-WR) so heavy users are not under-regularised.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Including blank cells as zeros in an explicit-rating loss (plain SVD, sklearn TruncatedSVD on the raw matrix). It predicts "everyone hates everything unseen". For explicit ratings, mask the blanks; for implicit data, use confidence weighting (section 08).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SGD.</b> We can score any P, Q (9.822 for our guesses), but we still chose them by hand. How does a computer move P and Q downhill on this loss?</div>

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
  <p>Take Ben → Dangal = 5, with small starting vectors p = (1, 0.5), q = (1.5, 0.5), η = 0.1, λ = 0.1.</p>
  <table class="tbl"><caption>One SGD step on Ben → Dangal</caption>
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
  <h3>The full loop</h3>
  <p>Start with small random vectors (all zeros would never move: e q = 0 when q = 0), shuffle the 19 ratings each epoch, apply the update to each one.</p>
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
  <p>The loss drops from 282.5 to 3.73 within 10 epochs. Ben's blanks: Lagaan <strong>4.89</strong>, 3 Idiots <strong>4.70</strong>, K3G <strong>2.03</strong>: the model learned that Ben's vector points the same way as the underdog dramas, and the order matches what CF found (3 Idiots and Lagaan high, K3G low). The tuple assignment <code>P[u], Q[i] = (..., ...)</code> computes both right-hand sides before assigning, so the Q update uses the old P[u], exactly as in the hand step.</p>
  <p>A surprise: the loss at epoch 100 (3.192) is slightly <em>higher</em> than at epoch 50 (3.159). With a constant learning rate, SGD never settles exactly; it keeps jittering around the minimum because each step follows one rating, not the whole loss. Real implementations decay the learning rate or stop early on validation error.</p>
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
  <p>Freeze the hand-picked film vectors. Ben rated Dangal (2, 0) → 5, Chak De (2, 0) → 5, DDLJ (0, 2) → 2; λ = 0.1.</p>
  <ul>
    <li>Q<sub>B</sub>ᵀQ<sub>B</sub> = sum of q qᵀ: [[4, 0], [0, 0]] + [[4, 0], [0, 0]] + [[0, 0], [0, 4]] = [[8, 0], [0, 4]]; add λI → <strong>[[8.1, 0], [0, 4.1]]</strong>.</li>
    <li>Q<sub>B</sub>ᵀr<sub>B</sub> = 5 × (2, 0) + 5 × (2, 0) + 2 × (0, 2) = <strong>(20, 4)</strong>.</li>
    <li>The matrix is diagonal (Ben's films are pure "underdog" or pure "romance"), so the inverse is just 1/8.1 and 1/4.1: p<sub>Ben</sub> = (20/8.1, 4/4.1) = <strong>(2.469, 0.976)</strong>.</li>
    <li>Ben → Lagaan = 2.469 × 2 + 0.976 × 0.5 = 4.938 + 0.488 = <strong>5.426</strong>; 3 Idiots = 3.704 + 0.488 = <strong>4.192</strong>; K3G = 1.235 + 1.951 = <strong>3.186</strong>.</li>
  </ul>
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
  <p>Ben's fitted ratings are (4.94, 4.94, 1.95) against his real (5, 5, 2): almost exact, shrunk slightly by λ. Notice K3G: the solve gave Ben a romance weight of 0.976 because the only way to produce his "2" for DDLJ is a positive romance slider. In an uncentred model a low rating still counts as some liking. Section 05 fixes that.</p>
  <h3>Alternate</h3>
  <p>Solve every user with Q frozen, then every film with P frozen (the mirror formula q<sub>i</sub> = (P<sub>i</sub>ᵀP<sub>i</sub> + λI)⁻¹P<sub>i</sub>ᵀr<sub>i</sub>), and repeat. Each half-step gives the exact minimum for that half, so the loss can never increase.</p>
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
  <p>Train RMSE is 0.186 by sweep 5 and 0.159 by sweep 10; Ben → Lagaan <strong>4.42</strong>, 3 Idiots <strong>4.58</strong>, K3G <strong>1.78</strong>, close to SGD. Look at the film vectors: Dangal (−1.27, −0.20), Chak De (−1.08, 0.05), 3 Idiots (−0.93, 0.35) and Lagaan (−0.83, 0.50) point one way, DDLJ (0.01, 1.17) and K3G (0.11, 1.33) another. The two kinds of film were found without being told, and 3 Idiots sits among the sports films although no tag says so (section 09 explains the negative signs). The loss keeps falling (16.39 → 11.19) while RMSE moves little: ALS is still rebalancing the sizes of P and Q to lower the penalty.</p>
  <table class="tbl"><caption>SGD vs ALS</caption>
    <tr><th></th><th>SGD</th><th>ALS</th></tr>
    <tr><td>Update</td><td>small step per rating</td><td>exact ridge solve per user / item</td></tr>
    <tr><td>Learning rate</td><td>needed, sensitive</td><td>none</td></tr>
    <tr><td>Cost</td><td>O(|Ω|k) per epoch</td><td>O(|Ω|k² + (m + n)k³) per sweep</td></tr>
    <tr><td>Parallel</td><td>awkward (shared vectors)</td><td>easy: users independent given Q</td></tr>
    <tr><td>Our toy (Ben)</td><td>Lagaan 4.89, 3 Idiots 4.70, K3G 2.03; ~10–50 epochs</td><td>4.42, 4.58, 1.78; ~5–10 sweeps</td></tr>
    <tr><td>Best for</td><td>explicit ratings, custom losses, biases, streaming</td><td>implicit data with all cells (section 08), Spark</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Alternating least squares</strong>: block coordinate descent on the MF loss. Fix Q and set each p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; fix P and set each q<sub>i</sub> = (P<sub>i</sub>ᵀP<sub>i</sub> + λI)⁻¹P<sub>i</sub>ᵀr<sub>i</sub>; repeat. Monotone in the loss; converges to a stationary point (not guaranteed global).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting λI. A user or film with fewer ratings than k makes the matrix singular: Lagaan has one rater, so P<sub>Lagaan</sub>ᵀP<sub>Lagaan</sub> is a 2 × 2 matrix of rank 1, and without λI its solve fails or explodes. The λI term is what makes every solve well defined.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Biases.</b> Both methods spend factor capacity on something simple: Esha and Ben rate everything high (means 4.50 and 4.00) while Asha and Dia are strict (3.00), and the uncentred factors even read Ben's 2 for DDLJ as liking. Can we model "who rates high" and "what is liked by everyone" separately, so the factors only need to capture taste?</div>

  <h2 id="mf-bias"><span class="num">05</span>Biases: Global, User, Item</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A dot product has to explain everything: Ben's generosity, K3G's general reception and Ben's dislike of romance. Can we pull the first two out into simple numbers?</p>
  </div>
  <h3>Baseline predictor by hand</h3>
  <p>The simplest model with no taste at all: r̂ = μ + b<sub>u</sub> + b<sub>i</sub>. The global mean μ = 69/19 = 3.632. A user bias says how far a user's average sits from μ; an item bias says how far a film's ratings sit from what its raters usually give.</p>
  <table class="tbl"><caption>User biases b<sub>u</sub> = user mean − μ</caption>
    <tr><th>User</th><th>mean</th><th>b<sub>u</sub></th></tr>
    <tr><td>Asha</td><td>3.00</td><td>−0.632 (strict)</td></tr>
    <tr><td>Ben</td><td>4.00</td><td><strong>+0.368</strong></td></tr>
    <tr><td>Chen</td><td>4.00</td><td>+0.368</td></tr>
    <tr><td>Dia</td><td>3.00</td><td>−0.632 (strict)</td></tr>
    <tr><td>Esha</td><td>4.50</td><td>+0.868 (the most generous)</td></tr>
  </table>
  <p>Now the leftovers r − μ − b<sub>u</sub> = r − user mean, averaged per film:</p>
  <table class="tbl"><caption>Item biases b<sub>i</sub> = mean of (r − user mean) over the film's raters</caption>
    <tr><th>Film</th><th>leftovers</th><th>b<sub>i</sub></th><th>shrunk, λ<sub>b</sub> = 2</th></tr>
    <tr><td>Dangal</td><td>Asha 5 − 3 = 2, Ben 5 − 4 = 1, Chen 2 − 4 = −2, Esha 5 − 4.5 = 0.5</td><td>1.5/4 = +0.375</td><td>1.5/6 = +0.25</td></tr>
    <tr><td>Chak De</td><td>Asha +1, Ben +1, Dia −2</td><td>0/3 = 0</td><td>0</td></tr>
    <tr><td>Lagaan</td><td>Esha +0.5 (one rating)</td><td>0.5/1 = +0.5</td><td>0.5/3 = +0.167</td></tr>
    <tr><td>DDLJ</td><td>Asha −2, Ben −2, Chen +1, Dia +1</td><td>−2/4 = −0.5</td><td>−2/6 = −0.333</td></tr>
    <tr><td>K3G</td><td>Asha −2, Chen +1, Dia +2, Esha −1.5</td><td>−0.5/4 = −0.125</td><td>−0.5/6 = −0.083</td></tr>
    <tr><td>3 Idiots</td><td>Asha +1, Dia −1, Esha +0.5</td><td>0.5/3 = +0.167</td><td>0.5/5 = +0.1</td></tr>
  </table>
  <p>Baseline Ben → Lagaan = 3.632 + 0.368 + 0.5 = <strong>4.5</strong>, 3 Idiots = 4 + 0.167 = <strong>4.167</strong>, K3G = 4 − 0.125 = <strong>3.875</strong>. The baseline says "generous rater, well-received films". It ranks Lagaan first on the strength of a single 5 from Esha, and it has no idea Ben dislikes romance: K3G gets 3.875. That is exactly the job left for the factors. The <strong>shrunk</strong> version divides by n<sub>i</sub> + λ<sub>b</sub> instead of n<sub>i</sub>: Lagaan, with 1 rating, moves two thirds of the way to 0 (0.5 → 0.167); Dangal, with 4, only a third (0.375 → 0.25). Few ratings, little trust.</p>
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
  <p>Biases alone cut train RMSE from 1.563 (predict μ for everything) to 1.396. Cheap, and still the standard baseline every recommender must beat.</p>
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
for i in (2, 4, 5):
    print(f"Ben -&gt; {films[i]:8s} = mu {mu_:.2f} {bu_[1]:+.2f} {bi_[i]:+.2f} {Pb[1] @ Qb_[i]:+.2f} = {full[1, i]:.2f}")</div>
  <div class="fx" data-lang="text">user bias [-0.55  0.08  0.08 -0.54  0.6 ]   item bias [ 0.08 -0.22  0.54 -0.45 -0.3   0.14]
train RMSE 0.088
Ben -&gt; Lagaan   = mu 3.63 +0.08 +0.54 +0.37 = 4.62
Ben -&gt; K3G      = mu 3.63 +0.08 -0.30 -1.64 = 1.77
Ben -&gt; 3 Idiots = mu 3.63 +0.08 +0.14 +0.91 = 4.76</div>
  <p>Read each answer piece by piece. K3G: start from the average 3.63, add 0.08 because Ben rates a little high, subtract 0.30 because K3G gets mixed ratings, then subtract 1.64 because Ben's taste vector points away from K3G's: <strong>1.77</strong>. 3 Idiots: 3.63 + 0.08 + 0.14 + 0.91 = <strong>4.76</strong>. Lagaan: 3.63 + 0.08 + 0.54 + 0.37 = <strong>4.62</strong>. Every term is explainable, and the ranking 3 Idiots &gt; Lagaan ≫ K3G agrees with user-based CF (4.74, 4.50, 2.26). The learned user biases are smaller than the hand ones (Ben +0.08 vs +0.368) because λ shrinks them and the factors explain part of the deviation.</p>
  <p>Two warnings. First, Lagaan's learned bias (+0.54) comes from a single rating; λ = 0.05 hardly shrinks it, and the shrunk hand estimate (0.167) is more believable. Second, train RMSE 0.088: the model has 1 + 5 + 6 + 22 = 34 numbers for 19 ratings; it can nearly memorise. A tiny train error tells us nothing about the blanks.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Baseline (bias) predictor</strong> b<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub>. <strong>Biased MF</strong> r̂<sub>ui</sub> = μ + b<sub>u</sub> + b<sub>i</sub> + p<sub>u</sub>·q<sub>i</sub>, minimising Σ<sub>Ω</sub>(r<sub>ui</sub> − r̂<sub>ui</sub>)² + λ(b<sub>u</sub>² + b<sub>i</sub>² + ‖p<sub>u</sub>‖² + ‖q<sub>i</sub>‖²). The factors model the <em>interaction</em> left after the main effects.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ranking by the full prediction for top-k lists and forgetting what the biases do there: b<sub>u</sub> is the same for all of a user's films, so it cannot change their order; b<sub>i</sub> pushes generally liked films up for everyone, which is a source of popularity bias (see <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>). And a bias learned from one rating (Lagaan) needs shrinking.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Held-out tuning.</b> Train RMSE 0.088 cannot be trusted, and 19 ratings are too few to hold any out. How do we know whether k and λ are right, and whether MF really beats the baseline and the CF methods of the previous note on ratings it has not seen?</div>

  <h2 id="mf-tune"><span class="num">06</span>Overfitting, k and λ: Held-Out Evaluation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Nineteen ratings are too few to hold any out. How do we measure MF honestly, choose k (number of factors) and λ (penalty), and find out whether it beats what we already had?</p>
  </div>
  <p>Hide some known ratings, train on the rest, and measure RMSE on the hidden ones (the same idea as <a class="xref" data-note="ml_splits">train/validation/test splits</a>). For enough data we use the <strong>simulated CineCity</strong> of the previous two notes: 1,000 users × 1,000 films, each film with genre tags plus two hidden traits no tag records, users with tastes for both, generous and strict raters, long-tail popularity, 50,186 ratings. We hide exactly the same 20% as the CF note did, so every number below can be compared with its table (best neighbourhood CF 0.744) and with content-based filtering in the Basics note (0.801).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student who memorises the answers to last year's paper scores 100% on it. To know whether they learnt the subject, give them questions they have not seen.</p>
  </div>
  <div class="fx" data-lang="py"># the simulated CineCity from the previous notes: 1,000 users x 1,000 films, genre tags + 2 hidden traits
def make_ratings(n_users=1000, n_items=1000, per_user=50, seed=0):
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
    return np.array(rows), tags, hid_i                      # hid_i kept only to check MF later

big, big_tags, hidden = make_ratings()
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
  <p>Each line trains biased MF (the section 05 code) for 60 epochs on 40,182 ratings and scores the 10,004 hidden ones. Read it as a ladder of models:</p>
  <ul>
    <li><strong>Global mean</strong> 1.007 → <strong>biases</strong> 0.766 → <strong>MF</strong> 0.699 (k = 4, λ = 0.05). For comparison on the same test set: content-based 0.801, the damped baseline 0.771, the best neighbourhood CF 0.744. MF is the first model in the group to clearly beat the bias baseline, because it can use the two hidden traits that no tag records and that neighbourhoods only see through noisy overlaps.</li>
    <li><strong>λ is a U-shape</strong> (k = 10): λ = 0 has the lowest train RMSE (0.373) but test 0.789; λ = 0.05 gives test 0.720; λ = 0.2 shrinks so hard that train RMSE is 0.721 and test 0.767, back at the bias baseline. The classic bias-variance trade-off (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>).</li>
    <li><strong>k</strong> (λ = 0.05): k = 1 → 0.753, k = 2 → 0.729, k = 4 → 0.699, then k = 6 → 0.716, k = 10 → 0.720, k = 20 → 0.737. Train RMSE keeps falling as k grows (0.674 → 0.339); test is best at k = 4. The simulator's taste structure has rank 6 (four genre tastes plus two hidden traits), but with about 40 training ratings per user the weakest directions cost more in noise than they explain. Extra factors fit noise.</li>
  </ul>
  <p>In practice: pick λ and k with a validation set (or k-fold over ratings), use early stopping on validation RMSE for SGD, and report the final number on a separate test set. Here we tuned on the test set itself to keep the code short; a real comparison needs a third split. For deployment, split by <strong>time</strong> (train on the past, test on the future), so the model is never trained on a user's future to predict their past.</p>
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
  <p><strong>By hand</strong>, the filled, centred CineCity matrix (each user's mean subtracted; blanks become 0 = "exactly average"):</p>
  <table class="tbl"><caption>Mean-filled, row-centred R</caption>
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th></tr>
    <tr><td>Asha (3.00)</td><td>2</td><td>1</td><td>0 (filled)</td><td>−2</td><td>−2</td><td>1</td></tr>
    <tr><td>Ben (4.00)</td><td>1</td><td>1</td><td>0 (filled)</td><td>−2</td><td>0 (filled)</td><td>0 (filled)</td></tr>
    <tr><td>Chen (4.00)</td><td>−2</td><td>0 (filled)</td><td>0 (filled)</td><td>1</td><td>1</td><td>0 (filled)</td></tr>
    <tr><td>Dia (3.00)</td><td>0 (filled)</td><td>−2</td><td>0 (filled)</td><td>1</td><td>2</td><td>−1</td></tr>
    <tr><td>Esha (4.50)</td><td>0.5</td><td>0 (filled)</td><td>0.5</td><td>0 (filled)</td><td>−1.5</td><td>0.5</td></tr>
  </table>
  <div class="fx" data-lang="py"># classic SVD needs a FULL matrix, so first fill blanks with each user's mean
def svd_impute(Rm, k):
    Mk = Rm &gt; 0
    um = np.array([Rm[u, Mk[u]].mean() for u in range(Rm.shape[0])])
    F = np.where(Mk, Rm, um[:, None]) - um[:, None]    # filled, then centred per user
    U, s, Vt = np.linalg.svd(F, full_matrices=False)
    return um[:, None] + (U[:, :k] * s[:k]) @ Vt[:k], s  # rank-k approximation, means added back

S2, sv = svd_impute(R, 2)
print("toy: singular values", sv.round(2))
print("toy, mean-filled SVD k=2: Ben -&gt;", {films[i]: float(S2[1, i].round(2)) for i in (2, 4, 5)})
for k in [2, 6]:
    print(f"simulated CineCity, mean-filled SVD k={k}:  test RMSE {rmse(svd_impute(Rtr, k)[0]):.3f}")
for lam in [1, 5]:
    Pa, Qa = train_als(Rtr, k=6, lam=lam, iters=15)
    print(f"simulated CineCity, ALS k=6 lam={lam} on raw ratings:  test RMSE {rmse(Pa @ Qa.T):.3f}")
Mk = Rtr &gt; 0                                         # same ALS, but on ratings minus the global mean
Pc, Qc = train_als(np.where(Mk, Rtr - mu_b, 0), k=6, lam=1, iters=15, M=Mk)
print(f"simulated CineCity, ALS k=6 lam=1 on ratings - mu: test RMSE {rmse(mu_b + Pc @ Qc.T):.3f}")</div>
  <div class="fx" data-lang="text">toy: singular values [5.45 2.34 1.87 0.43 0.36]
toy, mean-filled SVD k=2: Ben -&gt; {'Lagaan': 3.99, 'K3G': 3.35, '3 Idiots': 4.17}
simulated CineCity, mean-filled SVD k=2:  test RMSE 0.836
simulated CineCity, mean-filled SVD k=6:  test RMSE 0.834
simulated CineCity, ALS k=6 lam=1 on raw ratings:  test RMSE 0.654
simulated CineCity, ALS k=6 lam=5 on raw ratings:  test RMSE 0.697
simulated CineCity, ALS k=6 lam=1 on ratings - mu: test RMSE 0.706</div>
  <p>The singular values 5.45, 2.34, 1.87, 0.43, 0.36 say the first two patterns hold (5.45² + 2.34²)/39 = 35.19/39 ≈ 90% of the variation (39 is the sum of all squared entries in the table): the toy really is close to rank 2. But mean-filled SVD predicts Ben → Lagaan 3.99, K3G 3.35, 3 Idiots 4.17, all pulled toward Ben's mean 4.00, because his three blanks were treated as observed "exactly 4.00". It barely separates K3G from the others.</p>
  <p>On the simulated CineCity, mean-filled SVD scores test RMSE 0.836 (k = 2) and 0.834 (k = 6): worse than the biases alone (0.766). Fitting only the observed cells changes everything: plain ALS (section 04, no biases) reaches <strong>0.654</strong> with k = 6, λ = 1, and 0.697 with λ = 5.</p>
  <p>A surprise worth keeping: plain ALS on the raw ratings beats our biased SGD model (0.699), and subtracting the global mean first makes the same ALS <em>worse</em> (0.706). Two things are going on. ALS solves every step exactly and is fully converged after 15 sweeps, while 60 epochs of SGD with a small learning rate are not. And in this simulation most ratings sit near the 5-star ceiling (people watch films they expect to like, and scores are clipped at 5), so "generous rater × crowd-pleaser" behaves more like a product than a sum; uncentred factors can represent a product, additive biases cannot. The lesson is not "never use biases": biases + factors is the strong default, and the held-out number decides on your data.</p>
  <h3>What "Funk-SVD" really is</h3>
  <table class="tbl">
    <tr><th></th><th>True (truncated) SVD</th><th>"SVD" in recommenders (Funk-SVD / biased MF)</th></tr>
    <tr><td>Input</td><td>full matrix (blanks must be filled)</td><td>observed cells only</td></tr>
    <tr><td>Factors</td><td>orthonormal U, V and singular values Σ</td><td>any P, Q; no orthogonality, no Σ</td></tr>
    <tr><td>Fitted by</td><td>exact linear algebra, unique</td><td>SGD or ALS on a non-convex loss, many solutions</td></tr>
    <tr><td>Regularised</td><td>no</td><td>yes, λ</td></tr>
    <tr><td>Biases</td><td>no</td><td>usually μ + b<sub>u</sub> + b<sub>i</sub></td></tr>
    <tr><td>Our numbers</td><td>Ben → K3G 3.35; test RMSE ≈ 0.835</td><td>Ben → K3G 1.77; test RMSE 0.699 (ALS 0.654)</td></tr>
  </table>
  <p>Simon Funk's 2006 Netflix Prize blog post called his SGD method "SVD" because the result looks like a low-rank factorization; the name stuck. Extensions: <strong>SVD++</strong> adds an implicit term (the films a user chose to rate say something even before the stars), <strong>timeSVD++</strong> lets biases drift over time, and <strong>NMF</strong> (non-negative MF) forces all factors ≥ 0, so each user is an additive mix of parts, which is easier to read but usually a little less accurate.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Truncated SVD</strong>: A<sub>k</sub> = Σ<sub>j≤k</sub> s<sub>j</sub> u<sub>j</sub> v<sub>j</sub>ᵀ, the best rank-k approximation in Frobenius norm of a fully observed A. <strong>Funk-SVD</strong>: regularised MF fitted by SGD on observed entries only; a factorization, but not a singular value decomposition.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saying "we used SVD" in an interview without saying which. If it was numpy/scipy SVD or sklearn TruncatedSVD on a filled matrix, the imputation choice dominates the result; if it was Surprise's SVD, it is biased MF with SGD.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Implicit feedback.</b> Everything so far used stars. Most real logs only have plays, clicks and purchases (CineCity's own event log of plays and finishes, from the Basics note), and there a blank is not "unknown rating" but "probably not interested, or never saw it". How do we factorize that?</div>

  <h2 id="mf-implicit"><span class="num">08</span>Implicit Feedback: Weighted ALS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With plays instead of stars, there are no negative examples at all; every known cell is positive. If we fit only the known cells, the model can predict "loves it" everywhere. If we fit blanks as 0, we call every unseen film a dislike. What is in between?</p>
  </div>
  <h3>Preference and confidence</h3>
  <p>Hu, Koren and Volinsky (2008) split each cell into two numbers:</p>
  <ul>
    <li><strong>Preference</strong> p<sub>ui</sub> = 1 if the user interacted at all, else 0. This is the target.</li>
    <li><strong>Confidence</strong> c<sub>ui</sub> = 1 + α r<sub>ui</sub>, where r<sub>ui</sub> counts plays (or minutes, purchases, weighted events). Strong engagement → we are very sure of the 1; zero → a weak "probably 0" with weight 1.</li>
  </ul>
  <p style="text-align:center">L = Σ<sub>all u, i</sub> c<sub>ui</sub> (p<sub>ui</sub> − x<sub>u</sub>·y<sub>i</sub>)² + λ(Σ‖x<sub>u</sub>‖² + Σ‖y<sub>i</sub>‖²)</p>
  <p>Every cell counts now, so there is no masking, and the loss is a <em>weighted</em> ridge regression for each user given Y: x<sub>u</sub> = (YᵀC<sub>u</sub>Y + λI)⁻¹ YᵀC<sub>u</sub>p<sub>u</sub>, with C<sub>u</sub> = diag(c<sub>u1</sub>, …, c<sub>un</sub>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A librarian notices which books you borrow. A book you borrowed five times is clearly yours; one you never borrowed is probably not, but maybe you never saw it on the shelf. She trusts the first fact strongly and the second only weakly.</p>
  </div>
  <h3>Ben's update by hand</h3>
  <p>Use CineCity's event log from the Basics note, where play = 1 and finish = 3, summed per film. Ben played and finished Dangal (4) and Chak De (4) and pressed play on DDLJ without finishing (1); nothing else. With α = 2: p<sub>Ben</sub> = (1, 1, 0, 1, 0, 0), c<sub>Ben</sub> = (9, 9, 1, 3, 1, 1). Freeze the hand film vectors Y = Q.</p>
  <ul>
    <li>YᵀC<sub>Ben</sub>Y = Σ c<sub>i</sub> y<sub>i</sub>y<sub>i</sub>ᵀ = 9[[4, 0], [0, 0]] + 9[[4, 0], [0, 0]] + 1[[4, 1], [1, 0.25]] + 3[[0, 0], [0, 4]] + 1[[0.25, 1], [1, 4]] + 1[[2.25, 0.75], [0.75, 0.25]] = [[78.5, 2.75], [2.75, 16.5]]; + λI → <strong>[[78.6, 2.75], [2.75, 16.6]]</strong>.</li>
    <li>YᵀC<sub>Ben</sub>p<sub>Ben</sub> = 9(2, 0) + 9(2, 0) + 3(0, 2) = <strong>(36, 6)</strong> (the unplayed films have p = 0 and drop out here, but they did count in the matrix above).</li>
    <li>det = 78.6 × 16.6 − 2.75² = 1304.76 − 7.5625 = 1297.20; x<sub>Ben</sub> = (16.6 × 36 − 2.75 × 6, −2.75 × 36 + 78.6 × 6)/1297.20 = (581.1, 372.6)/1297.20 = <strong>(0.448, 0.287)</strong>.</li>
    <li>Scores for unplayed films: Lagaan 2 × 0.448 + 0.5 × 0.287 = 1.040; 3 Idiots 1.5 × 0.448 + 0.5 × 0.287 = 0.816; K3G 0.5 × 0.448 + 2 × 0.287 = 0.798. Lagaan ranks first, but K3G is almost level with 3 Idiots.</li>
  </ul>
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
  <p>The scores are not ratings; they estimate preference (near 1 = likely to play) and are only used to <em>rank</em> films for a user. Why is K3G so close? Ben's abandoned DDLJ play counts as a preference with confidence 3, so his vector gets a romance component (0.287) that the stars (DDLJ = 2) would never have given him.</p>
  <h3>The full algorithm, and the speed trick</h3>
  <p>Forming YᵀC<sub>u</sub>Y over all n films for every user would cost O(n k²) per user. But C<sub>u</sub> − I is zero except on the films the user played, so YᵀC<sub>u</sub>Y = <strong>YᵀY + Yᵀ(C<sub>u</sub> − I)Y</strong>: compute YᵀY once per sweep, then add a correction over just that user's played films (and YᵀC<sub>u</sub>p<sub>u</sub> only needs those films too, since p = 0 elsewhere). This is what makes implicit ALS run on millions of users (Spark MLlib's <code>ALS(implicitPrefs=True)</code>, the <code>implicit</code> Python library).</p>
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
    print(f"{name:5s} -&gt;", {films[i]: float(S[u, i].round(2)) for i in order[:3]})

# the same at scale: every simulated rating = "watched"; hide one watched film per user
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
  <div class="fx" data-lang="text">[[ 0.99  0.88  0.3   1.06  0.11  0.9 ]
 [ 0.98  0.88  0.29  1.05  0.12  0.89]
 [ 0.35  0.32 -0.66  0.92  0.99  0.32]
 [-0.06 -0.05 -0.75  0.45  0.9  -0.06]
 [ 0.29  0.26  0.84 -0.23 -0.91  0.27]]
Asha  -&gt; {'Chak De': 0.88, 'Lagaan': 0.3, 'K3G': 0.11}
Ben   -&gt; {'3 Idiots': 0.89, 'Lagaan': 0.29, 'K3G': 0.12}
Chen  -&gt; {'Dangal': 0.35, 'Chak De': 0.32, '3 Idiots': 0.32}
Dia   -&gt; {'DDLJ': 0.45, 'Chak De': -0.05, '3 Idiots': -0.06}
Esha  -&gt; {'Dangal': 0.29, '3 Idiots': 0.27, 'Chak De': 0.26}
popularity                     hit rate@10 = 0.190
implicit ALS k=16 alpha= 5       hit rate@10 = 0.282
implicit ALS k=16 alpha=20       hit rate@10 = 0.237
implicit ALS k=32 alpha=20       hit rate@10 = 0.220</div>
  <p>On the five friends, Ben's top unplayed film is now 3 Idiots (0.89), then Lagaan (0.29), with K3G last (0.12): trained vectors fix what the frozen hand vectors could not. Lagaan sits low because in this log only Esha played it, and Esha played nothing else, so Lagaan's vector is learned from one isolated user. Dia's list shows the central limitation of implicit data: everything she has not played scores near or below zero, and DDLJ (0.45) only because Chen, who shares K3G with her, played it. You lose dislikes, so use signals that mean engagement (completion, long watch time, repeat purchase), not just "started".</p>
  <p><strong>At scale.</strong> Treat every simulated rating as a play, hide one watched film per user (the same films the CF note hid) and ask whether it lands in the top 10. Popularity gets 0.190; implicit ALS with k = 16, α = 5 gets <strong>0.282</strong>, ahead of the CF note's item-based CF (0.269) and close to its best user-based CF (0.301). Larger α (20) or k (32) is worse here, probably because with binary plays a very high α makes every play count as a near-certain preference and the blanks almost nothing. These are hit rates of a ranked list, the subject of the next note.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Implicit ALS</strong> (weighted matrix factorization): minimise Σ<sub>u,i</sub> c<sub>ui</sub>(p<sub>ui</sub> − x<sub>u</sub>ᵀy<sub>i</sub>)² + λ(Σ‖x<sub>u</sub>‖² + Σ‖y<sub>i</sub>‖²) with p<sub>ui</sub> = 𝟙[r<sub>ui</sub> &gt; 0] and c<sub>ui</sub> = 1 + α r<sub>ui</sub> (or 1 + α log(1 + r<sub>ui</sub>/ε)). Solved by ALS with x<sub>u</sub> = (YᵀY + Yᵀ(C<sub>u</sub> − I)Y + λI)⁻¹YᵀC<sub>u</sub>p<sub>u</sub>. Hyperparameters: k, λ, α.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Evaluating implicit models with RMSE. The target is 0/1 preference and almost all cells are 0; RMSE rewards predicting 0. Evaluate with ranking metrics on held-out interactions (hit rate, precision@k, recall@k, NDCG). The alternative training approach, sampling unplayed films as negatives and learning "played &gt; not played" (BPR), is covered in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Embeddings.</b> We now have trained vectors for every user and film. What exactly are they, did they find the hidden traits the simulator planted, can we use them beyond predicting one cell, and how do they connect to the neural recommenders used in industry?</div>

  <h2 id="mf-embed"><span class="num">09</span>The Embeddings View &amp; Two-Tower Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The factors were tools for predicting ratings. Are they useful on their own: for "films like this one", for explaining <em>why</em> 3 Idiots suits Ben, for a user who joined five minutes ago, for searching millions of films fast?</p>
  </div>
  <h3>Users and films in one space</h3>
  <p>Each user and film is now a point in the same k-dimensional space, an <strong>embedding</strong> (see <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>). A user is close (high dot product) to films they will like; similar films are close to each other.</p>
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
</svg><figcaption>The explicit-ALS embeddings from section 04, with factor 1 sign-flipped (which changes no prediction). The four underdog dramas, 3 Idiots included, cluster to the right and Asha, Ben and Esha point at them; DDLJ and K3G point up, towards Chen and Dia. With no biases in this model, factor 2 also carries part of "how high this user rates", which is why every user sits above zero on it. Films sit close to the origin because their vectors are shorter than the users' vectors.</figcaption></figure>
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
print("Farhan's vector", p_new.round(2), " predicted:", dict(zip(films, (Q_als @ p_new).round(2).tolist())))

# at scale: do the learned film vectors contain the 2 hidden traits that no genre tag records?
def r2(target, feats):                                   # R^2 of a least-squares fit with intercept
    A = np.c_[np.ones(len(feats)), feats]
    coef = np.linalg.lstsq(A, target, rcond=None)[0]
    return 1 - np.var(target - A @ coef) / np.var(target)
n_rated = (Rtr &gt; 0).sum(0)
for name, keep in [("films with &gt;= 20 ratings", n_rated &gt;= 20), ("films with &lt; 20 ratings ", n_rated &lt; 20)]:
    print(f"{name} ({keep.sum():3d}):  R^2 hidden trait 1 from MF vectors {r2(hidden[keep, 0], Q4[keep]):.2f}, "
          f"trait 2 {r2(hidden[keep, 1], Q4[keep]):.2f};  from genre tags {r2(hidden[keep, 0], big_tags[keep]):.2f}, "
          f"{r2(hidden[keep, 1], big_tags[keep]):.2f}")</div>
  <div class="fx" data-lang="text">user vectors: {'Asha': [-3.9, 1.01], 'Ben': [-4.3, 1.7], 'Chen': [-2.18, 4.07], 'Dia': [-0.8, 3.64], 'Esha': [-4.39, 2.66]}
most like 3 Idiots: [('Lagaan', 0.98), ('Chak De', 0.95), ('Dangal', 0.87)]
most like DDLJ    : [('K3G', 1.0), ('Lagaan', 0.51), ('3 Idiots', 0.34)]
Farhan's vector [-3.81  0.78]  predicted: {'Dangal': 4.7, 'Chak De': 4.15, 'Lagaan': 3.56, 'DDLJ': 0.88, 'K3G': 0.61, '3 Idiots': 3.81}
films with &gt;= 20 ratings (501):  R^2 hidden trait 1 from MF vectors 0.62, trait 2 0.70;  from genre tags 0.01, 0.01
films with &lt; 20 ratings  (499):  R^2 hidden trait 1 from MF vectors 0.28, trait 2 0.31;  from genre tags 0.01, 0.01</div>
  <h3>What the vectors are for</h3>
  <ul>
    <li><strong>Similar items</strong>: cosine between film vectors. 3 Idiots' nearest films are Lagaan (0.98), Chak De (0.95) and Dangal (0.87); DDLJ's is K3G (1.00 to two decimals). This is item-item similarity learned through all users at once. Content-based filtering could not find it (with no sports tag, 3 Idiots came last for Ben by tags), and neighbourhood CF could only compare 3 Idiots and Lagaan through Esha, the one user who rated both.</li>
    <li><strong>Fold-in</strong>: a new user Farhan rates Dangal 5 and DDLJ 1. Keep Q frozen and do one ALS user-solve: his vector (−3.81, 0.78) sits next to Asha's (−3.90, 1.01), and he gets 3 Idiots 3.81, Lagaan 3.56, K3G 0.61. No retraining needed; this is the cheapest cold-start fix once a user has a few ratings.</li>
    <li><strong>Retrieval</strong>: a user's top-k films are the k largest dot products p<sub>u</sub>·q<sub>i</sub>. With millions of films that is a maximum-inner-product search, served by approximate nearest-neighbour indexes (<a class="xref" data-note="vectordb">Vector Databases</a>).</li>
  </ul>
  <h3>What MF found that CF could not: the hidden traits</h3>
  <p>The simulator gave every film two hidden traits ("star power", "director style") that drive ratings but appear in no tag. Neighbourhood CF used them only implicitly, through whichever co-ratings happened to exist. Does MF's film matrix Q (biased MF, k = 4, from section 06) actually <em>contain</em> them? The last lines of the code regress each hidden trait on the four learned film coordinates:</p>
  <ul>
    <li>For the 501 films with at least 20 training ratings, a straight-line fit on the MF vectors explains <strong>62% and 70%</strong> of the variance of the two hidden traits. The genre tags explain 1%: the traits really are invisible to content.</li>
    <li>For the 499 rarer films the MF vectors still explain 28% and 31%: fewer ratings, noisier vectors, which is the long-tail weakness that the next note's cold-start methods address.</li>
  </ul>
  <p>Nobody told MF that these traits exist. It recovered them because they are what makes rows of the rating matrix similar, which is the whole story of this group in one result: content sees tags, CF sees overlaps, MF sees the low-dimensional structure behind both.</p>
  <h3>Why the axes have no fixed meaning</h3>
  <p>For any invertible k × k matrix T, (PT)(QT⁻ᵀ)ᵀ = PQᵀ: the predictions are identical. With the L2 penalty the solution is pinned down only up to rotations and sign flips (T orthogonal). That is why our trained factor 1 came out negative for the underdog dramas, why the hidden traits had to be found with a regression (a rotation of the four coordinates) rather than by reading one coordinate, and why "factor 1 = underdog drama" is something we read off afterwards, not something the model promises. Cosines and dot products are unaffected; individual coordinates are not stable across retrains.</p>
  <h3>Dot product vs cosine</h3>
  <p>For recommendation, the dot product is what the model was trained on, and the vector's length carries meaning (a long film vector = strongly liked by its audience, often popular). For "similar items" cosine is usually better, because it ignores popularity and compares direction only. Ben's vector is longer than Asha's (4.62 vs 4.03), so his predicted ratings are more extreme in both directions.</p>
  <h3>From MF to two-tower models</h3>
  <p>MF looks up a user vector by user ID and a film vector by film ID. A <strong>two-tower</strong> model replaces each lookup with a small neural network (<a class="xref" data-note="dl_foundations">Deep Learning Foundations</a>): the user tower turns user features (ID, history, country, device, time) into a vector, the item tower turns item features (ID, genre tags, text, image embedding) into a vector, and the score is still their dot product. MF is exactly a two-tower model whose inputs are one-hot IDs and whose towers are a single linear layer. The gain: a new film with a description but no plays still gets a vector from the item tower, and the item vectors can be precomputed and indexed for fast retrieval. Two-tower models are usually trained on implicit data with sampled or in-batch negatives (a softmax over the true item and other items in the batch), which is a ranking loss, so the details live in the next note.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Embedding</strong>: a learned dense vector for a discrete object (user, item, word). <strong>Fold-in</strong>: computing a new user's (or item's) vector by solving its regression with the other side frozen. <strong>Two-tower model</strong>: score(u, i) = f<sub>θ</sub>(user features) · g<sub>φ</sub>(item features), with f and g neural networks; generalises MF to features and cold items.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing embeddings from two different training runs (or two different models) coordinate by coordinate. Because of the rotation freedom, vector (0.93, 0.35) in one run and in another run can mean different things. Only compare vectors from the same run, or align them first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have built the full MF toolkit. Before comparing it with its siblings, let us see how each piece grew from the one before, all on Ben's three blanks.</div>

  <h2 id="mf-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Latent factors, the masked loss, SGD, ALS, biases, λ and k, SVD, implicit ALS, embeddings: separate tricks, or one idea growing?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="mf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="160" height="46" rx="7" class="fb sb"/><text x="90" y="29" text-anchor="middle" font-size="11.5" font-weight="700">dot product p·q</text><text x="90" y="46" text-anchor="middle" class="tm" font-size="10">Ben→3 Idiots 4.0 (hand)</text>
<line x1="170" y1="33" x2="203" y2="33" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="205" y="10" width="200" height="46" rx="7" class="fb sb"/><text x="305" y="29" text-anchor="middle" font-size="11.5" font-weight="700">masked loss + λ‖·‖²</text><text x="305" y="46" text-anchor="middle" class="tm" font-size="10">4.359 + 5.463 = 9.822</text>
<line x1="405" y1="33" x2="438" y2="33" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="440" y="10" width="230" height="46" rx="7" class="fr sr"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">vs zero-filled / mean-filled SVD</text><text x="555" y="46" text-anchor="middle" class="tm" font-size="10">Lagaan 1.49 / 3.99; test RMSE 0.835</text>
<line x1="260" y1="56" x2="140" y2="92" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="350" y1="56" x2="450" y2="92" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="30" y="94" width="220" height="46" rx="7" class="ft st"/><text x="140" y="113" text-anchor="middle" font-size="11.5" font-weight="700">SGD: gradient per rating</text><text x="140" y="130" text-anchor="middle" class="tm" font-size="10">error 3.25 → 1.89; K3G 2.03</text>
<rect x="340" y="94" width="230" height="46" rx="7" class="ft st"/><text x="455" y="113" text-anchor="middle" font-size="11.5" font-weight="700">ALS: ridge solve per user/item</text><text x="455" y="130" text-anchor="middle" class="tm" font-size="10">Ben (2.469, 0.976); K3G 1.78</text>
<line x1="140" y1="140" x2="250" y2="174" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="455" y1="140" x2="560" y2="174" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="150" y="176" width="220" height="46" rx="7" class="fg sg"/><text x="260" y="195" text-anchor="middle" font-size="11.5" font-weight="700">+ biases μ + b_u + b_i</text><text x="260" y="212" text-anchor="middle" class="tm" font-size="10">K3G 3.63 + 0.08 − 0.30 − 1.64 = 1.77</text>
<rect x="440" y="176" width="230" height="46" rx="7" class="fg sg"/><text x="555" y="195" text-anchor="middle" font-size="11.5" font-weight="700">implicit: confidence weights</text><text x="555" y="212" text-anchor="middle" class="tm" font-size="10">c = 1 + α·plays; Ben (0.448, 0.287)</text>
<line x1="260" y1="222" x2="200" y2="254" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="60" y="256" width="250" height="46" rx="7" class="fv"/><text x="185" y="275" text-anchor="middle" font-size="11.5" font-weight="700">held-out RMSE picks k, λ</text><text x="185" y="292" text-anchor="middle" class="tm" font-size="10">1.007 → 0.766 → CF 0.744 → MF 0.699</text>
<line x1="555" y1="222" x2="480" y2="254" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="310" y1="279" x2="358" y2="279" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="360" y="256" width="310" height="46" rx="7" class="fv"/><text x="515" y="275" text-anchor="middle" font-size="11.5" font-weight="700">embeddings → hidden traits, fold-in, ANN</text><text x="515" y="292" text-anchor="middle" class="tm" font-size="10">cos(3 Idiots, Lagaan) 0.98; traits R² 0.62 / 0.70</text>
</svg><figcaption>Everything grows out of one dot product. Scoring it on observed cells gives the loss; the gradient of that loss gives SGD and its "convex in one half" structure gives ALS; separating main effects gives biases; changing what a cell means gives implicit ALS; held-out error chooses the size; and the trained vectors are embeddings that carry the hidden traits and feed retrieval and ranking.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Ben's blanks / our number</th><th>Sensitive to</th><th>Use when</th></tr>
    <tr><td>Latent factors</td><td>dot product of two k-vectors</td><td>how to score any pair?</td><td>Lagaan 5.25, 3 Idiots 4.0, K3G 2.25 (hand sliders)</td><td>choice of k</td><td>always (the model itself)</td></tr>
    <tr><td>Masked L2 loss</td><td>squared error on Ω + λ‖·‖²</td><td>how good are P, Q?</td><td>9.822</td><td>λ, what counts as observed</td><td>explicit ratings</td></tr>
    <tr><td>Zero-filled SVD</td><td>SVD on blanks = 0</td><td>(what not to do)</td><td>Lagaan 1.49, K3G 0.84</td><td>sparsity</td><td>never for ratings</td></tr>
    <tr><td>SGD</td><td>gradient of one rating's loss</td><td>how to descend?</td><td>4.89, 4.70, 2.03</td><td>learning rate, epochs</td><td>explicit, custom losses</td></tr>
    <tr><td>ALS</td><td>ridge regression with one side frozen</td><td>exact step, no learning rate?</td><td>one step 5.43, 4.19, 3.19; trained 4.42, 4.58, 1.78</td><td>λ (conditioning)</td><td>parallel, implicit</td></tr>
    <tr><td>Bias baseline</td><td>means: μ, user mean − μ, leftover mean</td><td>who rates high, what is liked?</td><td>4.5, 4.167, 3.875</td><td>few ratings (shrink: Lagaan)</td><td>baseline, always add</td></tr>
    <tr><td>Biased MF</td><td>baseline + dot product</td><td>taste beyond the main effects?</td><td>4.62, 4.76, 1.77</td><td>overfitting (train 0.088)</td><td>explicit ratings</td></tr>
    <tr><td>Held-out RMSE</td><td>hidden ratings (simulated CineCity)</td><td>which k, λ? beats CF?</td><td>0.699 at k = 4, λ = 0.05 (CF 0.744)</td><td>split type (time!)</td><td>always for tuning</td></tr>
    <tr><td>Mean-filled SVD</td><td>exact SVD after imputing</td><td>is classical SVD enough?</td><td>3.99, 4.17, 3.35; RMSE ≈ 0.835</td><td>imputation</td><td>dense data, quick baseline</td></tr>
    <tr><td>Implicit ALS</td><td>ALS + preference/confidence on all cells</td><td>how to use plays?</td><td>hand: Lagaan 1.04 first; trained: 3 Idiots 0.89; HR@10 0.282</td><td>α, signal quality</td><td>clicks, plays, purchases</td></tr>
    <tr><td>Embeddings</td><td>trained P, Q rows</td><td>similar items, hidden traits, new users?</td><td>cos 0.98; R² 0.62 / 0.70; Farhan → 3 Idiots 3.81</td><td>rotation (coordinates)</td><td>retrieval, similar-items</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>predict every cell with a dot product of two short learned vectors, and fit those vectors only where you have evidence, with a penalty for size.</strong> SGD and ALS are two ways to fit it; biases and implicit confidence change what is being fitted; held-out error decides how big; and the vectors themselves become the embeddings, carrying traits nobody labelled, that the rest of a recommender system is built on.</p>
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
    <tr><td>Hidden traits (no tag)</td><td>invisible</td><td>only through overlaps</td><td>recovered (R² 0.62 / 0.70)</td><td>same factor form (not measured here)</td><td>if features or IDs carry them</td></tr>
    <tr><td>New item</td><td>yes (features)</td><td>no</td><td>no (needs ratings)</td><td>no</td><td>yes (item tower)</td></tr>
    <tr><td>New user</td><td>after a few likes</td><td>after a few ratings</td><td>fold-in after a few ratings</td><td>fold-in</td><td>yes (user features)</td></tr>
    <tr><td>Explainable</td><td>"because it is a sports drama"</td><td>"people like you liked"</td><td>weakly (biases are readable)</td><td>weakly</td><td>no</td></tr>
    <tr><td>Scale</td><td>easy</td><td>O(pairs) similarities</td><td>O(|Ω|k) per epoch</td><td>O(|Ω|k² + (m+n)k³)</td><td>GPU training, ANN serving</td></tr>
    <tr><td>Ben: Lagaan, K3G, 3 Idiots</td><td>0.265, −0.116, −0.235 (Lagaan first, 3 Idiots last)</td><td>4.50, 2.26, 4.74</td><td>4.62, 1.77, 4.76</td><td>3 Idiots first</td><td>—</td></tr>
    <tr><td>Simulated CineCity, test RMSE</td><td>0.801</td><td>0.744 (best variant)</td><td>0.699 (ALS 0.654)</td><td>HR@10 0.282</td><td>—</td></tr>
  </table>
  <table class="tbl"><caption>Which factorization?</caption>
    <tr><th>Method</th><th>Data</th><th>Missing cells</th><th>Strength</th><th>Weakness</th></tr>
    <tr><td>Truncated SVD</td><td>dense, full</td><td>must be imputed</td><td>exact, unique, fast</td><td>imputation biases it (RMSE ≈ 0.835 here)</td></tr>
    <tr><td>Funk-SVD / biased MF (SGD)</td><td>explicit ratings</td><td>ignored</td><td>accurate, simple, interpretable biases</td><td>learning rate, non-convex, slow to converge</td></tr>
    <tr><td>ALS (explicit)</td><td>explicit ratings</td><td>ignored</td><td>no learning rate, parallel, converges fast (0.654 here)</td><td>k³ solves; biases need extra care</td></tr>
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
    <p>Zero-filled SVD predicted Ben → Lagaan 1.49, K3G 0.84 and Chen → Lagaan 0.31. Mask the loss for explicit data; use confidence weights for implicit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging by training error</span>
    <p>Biased MF reached train RMSE 0.088 with 34 numbers for 19 ratings. On the simulated CineCity (k = 10) λ = 0 had the best train RMSE (0.373) and a worse test RMSE (0.789) than λ = 0.05 (0.720). Always tune on held-out ratings.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no biases, or biases from one rating</span>
    <p>Without μ + b<sub>u</sub> + b<sub>i</sub>, factors waste capacity on "Esha rates everything high" and read a 2-star rating as liking (the ALS step gave K3G 3.19). Biases alone took test RMSE from 1.007 to 0.766 and are the baseline every model must beat. But shrink them: Lagaan's bias rests on one rating.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: zero initialisation</span>
    <p>With P = Q = 0 every gradient e·q and e·p is zero, so nothing moves. Use small random values.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: RMSE for implicit data or for top-k quality</span>
    <p>Implicit targets are 0/1 and mostly 0; ranking quality needs hit rate, precision@k or NDCG, measured on a time-based split.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading meaning into coordinates</span>
    <p>Factors are defined up to rotation and sign (our factor 1 came out negative; the hidden traits had to be found by regression on all four coordinates). Compare cosines and dot products, not coordinates across runs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting cold start</span>
    <p>MF has no vector for a user or film with no interactions, and weak vectors for films with few (hidden-trait R² fell from 0.62 to 0.28 for rarely rated films). Fold-in after a few ratings, content features or a two-tower model for brand-new items, popularity as the last fallback.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: implicit "plays" that mean nothing</span>
    <p>Ben's abandoned DDLJ play counted as a preference and pulled K3G level with 3 Idiots in the hand step. Use engagement signals (completion, watch time), and treat quick abandons as weak or negative.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note condensed for quick review.</div>

  <h2 id="mf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: CineCity, ratings 1–5 of five users on six films (· = blank). Goal: what to show Ben among Lagaan, K3G and 3 Idiots. At scale: the simulated 1,000 × 1,000 CineCity with genre tags and two hidden traits, the CF note's 20% test set.</p>
  <table class="tbl">
    <tr><th></th><th>Dangal</th><th>Chak De</th><th>Lagaan</th><th>DDLJ</th><th>K3G</th><th>3 Idiots</th><th>mean</th></tr>
    <tr><td>Asha</td><td>5</td><td>4</td><td>·</td><td>1</td><td>1</td><td>4</td><td>3.00</td></tr>
    <tr><td>Ben</td><td>5</td><td>5</td><td>?</td><td>2</td><td>?</td><td>?</td><td>4.00</td></tr>
    <tr><td>Chen</td><td>2</td><td>·</td><td>·</td><td>5</td><td>5</td><td>·</td><td>4.00</td></tr>
    <tr><td>Dia</td><td>·</td><td>1</td><td>·</td><td>4</td><td>5</td><td>2</td><td>3.00</td></tr>
    <tr><td>Esha</td><td>5</td><td>·</td><td>5</td><td>·</td><td>3</td><td>5</td><td>4.50</td></tr>
  </table>
  <table class="tbl"><caption>Ben's three blanks through the whole group</caption>
    <tr><th>Method</th><th>Lagaan</th><th>K3G</th><th>3 Idiots</th></tr>
    <tr><td>Content-based (Basics note, cosine)</td><td>0.265</td><td>−0.116</td><td>−0.235</td></tr>
    <tr><td>User-based CF (CF note)</td><td>4.50</td><td>2.26</td><td>4.74</td></tr>
    <tr><td>Hand sliders</td><td>5.25</td><td>2.25</td><td>4.0</td></tr>
    <tr><td>SGD / ALS (no biases)</td><td>4.89 / 4.42</td><td>2.03 / 1.78</td><td>4.70 / 4.58</td></tr>
    <tr><td>Bias baseline</td><td>4.5</td><td>3.875</td><td>4.167</td></tr>
    <tr><td><strong>Biased MF</strong></td><td><strong>4.62</strong></td><td><strong>1.77</strong></td><td><strong>4.76</strong></td></tr>
  </table>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>Latent factors</td><td>score a pair with no overlap?</td><td>Ben (2.5, 0.5) · 3 Idiots (1.5, 0.5) = 4.0</td><td>who picks the sliders?</td></tr>
    <tr><td>Objective</td><td>how good are P, Q?</td><td>SSE 4.359 + λ‖·‖² 5.463 = 9.822</td><td>how to minimise?</td></tr>
    <tr><td>SGD</td><td>step downhill per rating?</td><td>error 3.25 → 1.89; Ben 4.89 / 2.03 / 4.70</td><td>learning rate, many passes</td></tr>
    <tr><td>ALS</td><td>exact step?</td><td>Ben (2.469, 0.976); trained 4.42 / 1.78 / 4.58</td><td>factors waste effort on rating level</td></tr>
    <tr><td>Biases</td><td>who rates high, what is liked?</td><td>baseline 4.5 / 3.875 / 4.167; biased MF 4.62 / 1.77 / 4.76</td><td>train RMSE 0.088: memorising?</td></tr>
    <tr><td>Held-out tuning</td><td>which k, λ? beats CF?</td><td>1.007 → 0.766 → CF 0.744 → MF 0.699 (k = 4)</td><td>isn't this just SVD?</td></tr>
    <tr><td>SVD vs Funk</td><td>why not classical SVD?</td><td>mean-filled RMSE ≈ 0.835; ALS on observed 0.654</td><td>what about clicks?</td></tr>
    <tr><td>Implicit ALS</td><td>factorize plays?</td><td>Ben (0.448, 0.287), Lagaan first; HR@10 0.282</td><td>what are the vectors for?</td></tr>
    <tr><td>Embeddings</td><td>similar items, hidden traits, new users?</td><td>cos(3 Idiots, Lagaan) 0.98; R² 0.62 / 0.70 vs tags 0.01</td><td>lists, cold start → next note</td></tr>
  </table>
  <h3>Definitions</h3>
  <div class="cards">
    <div><b>Matrix factorization</b><p>Approximate the m × n user–item matrix by P Qᵀ with k ≪ m, n, fitted on observed cells; r̂<sub>ui</sub> = p<sub>u</sub>·q<sub>i</sub>.</p><small>k(m + n) numbers instead of m·n</small></div>
    <div><b>Latent factor</b><p>One of the k hidden dimensions, learned from data. Often readable (underdog drama / romance) but only defined up to rotation and sign.</p><small>Coordinates are not stable across runs</small></div>
    <div><b>Funk-SVD</b><p>Regularised MF fitted with SGD on observed ratings; not a true SVD (no orthogonality, no Σ).</p><small>"SVD" in Surprise</small></div>
    <div><b>ALS</b><p>Alternately solve every user's and every item's ridge regression exactly with the other side frozen.</p><small>No learning rate; parallel</small></div>
    <div><b>Biases</b><p>μ = global mean, b<sub>u</sub> = user's offset, b<sub>i</sub> = item's offset; the factors then model only the interaction.</p><small>Strong baseline by itself; shrink rare items</small></div>
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
    <div><b>Use ALS</b><p>Large explicit or implicit data, parallel hardware, no wish to tune a learning rate.</p><small>Converged fast here: 0.654</small></div>
    <div><b>Use implicit ALS</b><p>Plays, clicks, purchases at scale; you want candidate lists, not star predictions.</p><small>Evaluate with ranking metrics</small></div>
    <div><b>Use classical SVD</b><p>Only when the matrix is (nearly) full, or as a quick baseline after imputation.</p><small>Imputation dominates</small></div>
    <div><b>Go beyond MF</b><p>Many new items, rich features, context (time, device): two-tower or feature-based rankers.</p><small>MF IDs cannot cover cold items</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Blanks as zeros; trusting train RMSE; no biases or unshrunk biases from one rating; zero initialisation; RMSE on implicit data; reading coordinates as fixed meanings; no cold-start path; counting abandoned plays as preference.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>p = (2.5, 0.5), q = (1.5, 0.5). Prediction?</td><td>3.75 + 0.25 = 4.0</td></tr>
    <tr><td>One SGD step: p = (1, 0.5), q = (1.5, 0.5), r = 5, η = λ = 0.1. New p?</td><td>e = 3.25; p + 0.1(3.25q − 0.1p) = (1.4775, 0.6575)</td></tr>
    <tr><td>Ben's mean 4.00, μ = 3.632. b<sub>Ben</sub>? Lagaan's shrunk bias from one leftover of 0.5 with λ<sub>b</sub> = 2?</td><td>+0.368; 0.5/(1 + 2) = 0.167</td></tr>
    <tr><td>Why is ALS's per-user step exact? Ben's with Q<sub>B</sub>ᵀQ<sub>B</sub> + λI = diag(8.1, 4.1), Q<sub>B</sub>ᵀr = (20, 4)?</td><td>With Q frozen the loss is ridge regression in p<sub>u</sub>; p = (20/8.1, 4/4.1) = (2.469, 0.976)</td></tr>
    <tr><td>Implicit: engagement 4, α = 2. Preference and confidence?</td><td>p = 1, c = 1 + 2 × 4 = 9</td></tr>
  </table>

  <h2 id="mf-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain matrix factorization for recommendation in three sentences.</summary><div class="qa-body">Represent every user and item by a k-dimensional vector so that a rating is approximately their dot product, R ≈ PQᵀ. Fit the vectors on the observed ratings only, with an L2 penalty, using SGD or ALS. The trained model fills every blank, and similar users and items end up with similar vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why train only on observed cells? What happens otherwise?</summary><div class="qa-body">Blanks are unknown, not zero. Filling them with 0 and fitting (plain SVD) teaches the model that unseen films are hated: on CineCity Ben → Lagaan fell to 1.49 and K3G to 0.84. Mean-filling is better but still biased: every blank is pulled to the user's mean (Ben: 3.99, 3.35, 4.17) and test RMSE ≈ 0.835, worse than the biases alone (0.766).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the SGD update for one rating.</summary><div class="qa-body">ℓ = (r − p·q)² + λ(‖p‖² + ‖q‖²). ∂ℓ/∂p = −2eq + 2λp, ∂ℓ/∂q = −2ep + 2λq, with e = r − p·q. Step against the gradient, absorbing 2 into η: p ← p + η(eq − λp), q ← q + η(ep − λq), using the old p in the q update. On Ben → Dangal the error went 3.25 → 1.89.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does ALS work and why is it popular at scale?</summary><div class="qa-body">With Q fixed, each user's loss is a ridge regression with closed form p<sub>u</sub> = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr<sub>u</sub>; then fix P and solve items; repeat. No learning rate, the loss never increases, users (and items) are independent so it parallelises (Spark), and it extends naturally to implicit data where all cells count. On the simulated CineCity it also converged to the best test RMSE we saw (0.654).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why add user and item biases?</summary><div class="qa-body">Ratings mix "how this user rates in general", "how this item is received in general" and taste. Biases capture the first two with one number each, so the factors model only the interaction. On CineCity: b<sub>Ben</sub> = +0.368 by hand; the baseline alone gave K3G 3.875 (no idea Ben dislikes romance), and the factor term (−1.64) brings it to 1.77. Without biases the ALS step read Ben's 2 for DDLJ as romance liking (K3G 3.19). On the simulated CineCity biases alone took RMSE 1.007 → 0.766.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k and λ?</summary><div class="qa-body">On held-out ratings (validation set or k-fold over ratings, ideally a time split). On the simulated CineCity test RMSE was U-shaped in λ at k = 10 (0.789 at 0, 0.720 at 0.05, 0.767 at 0.2) and best at k = 4 (0.699), while train RMSE kept falling with k (0.339 at k = 20). Use early stopping for SGD.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Funk-SVD an SVD?</summary><div class="qa-body">No. True SVD factors a full matrix into orthonormal U, V and singular values, exactly and uniquely. Funk-SVD fits arbitrary P, Q on observed cells only with regularisation and SGD; no orthogonality, no Σ, many equivalent solutions. It is called SVD because it is a low-rank factorization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain implicit ALS: what are preference and confidence?</summary><div class="qa-body">Preference p<sub>ui</sub> = 1 if the user interacted, else 0; confidence c<sub>ui</sub> = 1 + α·count. The loss sums c(p − x·y)² over all cells, so unseen items are weak negatives and heavy interactions are strong positives. Solved with weighted ALS using YᵀC<sub>u</sub>Y = YᵀY + Yᵀ(C<sub>u</sub> − I)Y so each user costs only their own interactions. Ben (engagement 4, 4, 0, 1, 0, 0; α = 2) got x = (0.448, 0.287) from frozen hand vectors, Lagaan first; at scale implicit ALS reached hit rate@10 0.282 vs popularity 0.190.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user signs up and rates two films. How do you recommend without retraining?</summary><div class="qa-body">Fold-in: keep item vectors Q fixed and solve the user's ridge regression on the two ratings, p = (Q<sub>u</sub>ᵀQ<sub>u</sub> + λI)⁻¹Q<sub>u</sub>ᵀr. Farhan (Dangal 5, DDLJ 1) got a vector next to Asha's and 3 Idiots 3.81, Lagaan 3.56, K3G 0.61. With zero ratings, fall back to popularity or features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't we interpret factor 1 as "underdog drama" reliably?</summary><div class="qa-body">For any invertible T, (PT)(QT⁻ᵀ)ᵀ = PQᵀ, so predictions do not pin down the axes; with L2 the solution is still free up to rotations and sign flips. Our ALS factor 1 came out negative, and the simulator's hidden traits were spread over all four coordinates, so we found them by regression, not by reading one axis. Compare dot products and cosines, not coordinates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does MF see that content-based filtering and neighbourhood CF could not?</summary><div class="qa-body">Content sees only tags, so 3 Idiots (drama, comedy) came last for Ben, and on the simulated CineCity tags explain 1% of the hidden traits. Neighbourhood CF sees the traits only through co-ratings, which are missing for most film pairs (58.5% share no rater). MF compresses every row and column into k numbers learned from all ratings at once: 3 Idiots lands next to Lagaan (cosine 0.98), the film vectors explain 62% and 70% of the two hidden traits, and test RMSE drops from CF's best 0.744 to 0.699. See <a class="xref" data-note="ml_recsys">Basics</a> and <a class="xref" data-note="ml_cf">Collaborative Filtering</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is MF related to neighbourhood collaborative filtering?</summary><div class="qa-body">Both use only the interaction matrix. Neighbourhood CF computes similarities directly from co-rated items and needs overlap; MF compresses each row and column into k numbers, so information flows through shared factors even without overlap. Cosine between learned item vectors (DDLJ–K3G 1.00, 3 Idiots–Lagaan 0.98) is a smoothed item-item similarity. Both agree on Ben's order: 3 Idiots, Lagaan, then K3G far below.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is MF related to PCA and ridge regression?</summary><div class="qa-body">PCA is the SVD of a centred, full data matrix: the best low-rank approximation over all cells. MF is the same low-rank idea fitted only on observed cells with a penalty. Each ALS half-step is literally ridge regression (with the frozen factors as features), which is why λI keeps it well defined even for Lagaan with one rating.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does MF lead to two-tower models and to the ranking stage?</summary><div class="qa-body">MF is a two-tower model with one-hot ID inputs and linear towers. Replacing the lookups with neural towers over features gives vectors for new items and users. The item vectors are indexed for approximate nearest-neighbour retrieval; the retrieved candidates are then ordered by a ranker and judged with list metrics. The next note starts exactly there: Ben's biased-MF scores (3 Idiots 4.76, Lagaan 4.62, K3G 1.77) become the retrieval stage of his row in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your MF has great RMSE but users don't click its top-10. Why?</summary><div class="qa-body">RMSE weights all known ratings equally, mostly mid-range ones, while users only see the top few; ratings come from films people chose to watch (missing not at random, as in the simulated CineCity where people watch popular films they expect to like); popular items dominate via b<sub>i</sub>; the split may be random rather than by time. Optimise and evaluate for ranking (BPR, precision@k, NDCG) and confirm with an A/B test.</div></details>
</main>
`
});
