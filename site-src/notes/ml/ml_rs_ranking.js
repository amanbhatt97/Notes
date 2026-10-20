// notes/ml/ml_rs_ranking.js — Ranking, Evaluation & Cold Start
Object.assign(TOPIC_CONTENT, {
  "ml_rs_ranking": `<main>
  <h1>Ranking, Evaluation &amp; Cold Start</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Ranking, Evaluation &amp; Cold Start</span></div>
  <p class="lead">A recommender's output is not a predicted rating; it is a short ordered row on a screen. This note follows one row from start to finish, <strong>Ben's Friday-night row</strong> built from CineCity, the same five friends and films as the other recommender notes (the six rated films plus four more from CineCity's catalogue), and answers everything that happens after the model scores: the retrieval → ranking → re-ranking pipeline, learning to rank (pointwise, pairwise, listwise, BPR) with every loss computed by hand, all the list metrics by hand (precision@k, recall@k, hit rate, MAP, MRR, NDCG, coverage, diversity, novelty), offline evaluation done right, online A/B tests, cold start for new users and new films, and the popularity bias and feedback loops that a deployed recommender creates for itself.</p>

  <h2 id="rk-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680">
<defs><marker id="rk-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="8" width="190" height="34" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="30" text-anchor="middle" font-size="12">Recommendation Systems</text>
<line x1="300" y1="42" x2="90" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rk-a0)"/><line x1="320" y1="42" x2="255" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rk-a0)"/><line x1="350" y1="42" x2="425" y2="78" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rk-a0)"/><line x1="380" y1="42" x2="590" y2="78" stroke="currentColor" marker-end="url(#rk-a0)"/>
<rect x="10" y="80" width="160" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="102" text-anchor="middle" font-size="12">Basics &amp; Content-Based</text><text x="90" y="120" text-anchor="middle" class="tm" font-size="10">matrix, popularity, features</text>
<rect x="180" y="80" width="150" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="255" y="102" text-anchor="middle" font-size="12">Collaborative Filtering</text><text x="255" y="120" text-anchor="middle" class="tm" font-size="10">neighbours</text>
<rect x="340" y="80" width="170" height="54" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="425" y="102" text-anchor="middle" font-size="12">Matrix Factorization</text><text x="425" y="120" text-anchor="middle" class="tm" font-size="10">a score for every pair</text>
<rect x="520" y="80" width="155" height="54" rx="8" class="fg sg" stroke-width="3"/><text x="597" y="102" text-anchor="middle" font-size="12" font-weight="700">Ranking, Eval &amp; Cold Start</text><text x="597" y="120" text-anchor="middle" class="tg" font-size="10.5">YOU ARE HERE</text>
<line x1="170" y1="107" x2="178" y2="107" stroke="currentColor" marker-end="url(#rk-a0)"/><line x1="330" y1="107" x2="338" y2="107" stroke="currentColor" marker-end="url(#rk-a0)"/><line x1="510" y1="107" x2="518" y2="107" stroke="currentColor" marker-end="url(#rk-a0)"/>
<text x="340" y="165" text-anchor="middle" class="tm" font-size="10.5">earlier notes produce scores; this note turns scores into a row, measures the row, and keeps it healthy</text>
<text x="340" y="185" text-anchor="middle" class="tm" font-size="10.5">running example: Ben's Friday-night row of 5 films from a 10-film catalogue</text>
</svg><figcaption>The last note of the Recommendation Systems group: from a score for every pair to a list that people actually see.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_mf">Matrix Factorization</a></b><span>MF (and <a class="xref" data-note="ml_cf">collaborative filtering</a>, <a class="xref" data-note="ml_recsys">content-based filtering</a>) gives a score for any (user, film) pair; we judged it by RMSE on held-out ratings. Left open: users see a short ordered list, not scores; scoring millions of films per request is too slow; RMSE says nothing about the top of the list; and a user or film with no history has no vector. Running example: still CineCity. Ben rated Dangal 5, Chak De 5 and DDLJ 2; the open question since the Basics note has been what to show him among Lagaan, K3G and 3 Idiots. Biased MF answered with scores (3 Idiots 4.76, Lagaan 4.62, K3G 1.77). Here we add the four other films in CineCity's catalogue (Bhaag Milkha Bhaag, Mary Kom, Jab We Met, Swades), so a row of 5 has something to choose from, and at scale we reuse the simulated 1,000 × 1,000 CineCity.</span></li>
    <li><b>This note adds: everything between the score and the screen</b><span>A three-stage pipeline that is fast enough, models trained to order rather than to predict (learning to rank, BPR), metrics that judge a ranked list, an honest offline protocol and an online A/B test, strategies for cold start, and protection against the feedback loops a live recommender creates.</span></li>
    <li><b>Leads to: experiments and systems</b><span>The group ends here. The A/B testing ideas continue in <a class="xref" data-note="st_abtesting">A/B Testing</a>; fast retrieval over embeddings in <a class="xref" data-note="vectordb">Vector Databases</a>; and the full serving architecture in <a class="xref" data-note="sd_cases">ML System Design: Case Studies</a> and <a class="xref" data-note="sd_experiments">Shadow, Canary &amp; A/B Infrastructure</a>. Classification metrics such as AUC from <a class="xref" data-note="ml_evaluation">Classification Metrics</a> reappear here in list form.</span></li>
  </ol>

  <h2 id="rk-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Retrieval → ranking → re-ranking</b><span>Q: how do we turn scores into a row fast enough? → A cheap stage keeps a few candidates (Ben: 5 of 7), a rich model orders them, rules fix the final row: [Bhaag Milkha, Lagaan, 3 Idiots, Mary Kom, Jab We Met]. But how is the ranking model trained to <em>order</em>?</span></li>
    <li><b>Learning to rank</b><span>Q: what loss teaches order? → Pointwise (log loss 0.581), pairwise (RankNet: Lagaan below Bhaag Milkha costs 0.848), listwise (LambdaMART weights that swap by |ΔNDCG| 0.226). LambdaMART held NDCG@5 0.838 where pointwise fell to 0.714. But for plays-only data, which pairs do we even have?</span></li>
    <li><b>BPR</b><span>Q: how do we learn order from implicit data with no negatives? → Assume "played &gt; not played", sample a negative, push x<sub>ui</sub> − x<sub>uj</sub> up: Chak De vs Lagaan −0.25 → 0.49 in one step (and Lagaan is a film Ben would love: a false negative). Now we have rows. How good is a row?</span></li>
    <li><b>Precision@k, recall@k, hit rate</b><span>Q: how many good films did the row contain? → Ben P@5 = 0.40, R@5 = 0.67; hit rate 4 of 5 users. But a hit at slot 1 and at slot 5 count the same…</span></li>
    <li><b>AP/MAP, MRR, NDCG</b><span>Q: does position (and how much he liked it) matter? → Ben AP@5 0.333, RR 0.5, NDCG@5 0.578 (graded); MAP 0.432, MRR 0.45. But a row can score well and still be three films of one genre…</span></li>
    <li><b>Coverage, diversity, novelty</b><span>Q: is the system useful beyond accuracy? → Coverage 90%, Ben's diversity 0.7, novelty 1.99 bits; Bhaag Milkha fills 5 of 25 slots. But how do we compute any of these honestly from logs?</span></li>
    <li><b>Offline evaluation</b><span>Q: what split, which baseline, which candidates? → On the simulated CineCity, leave each user's last film out, rank all 1,000, beat popularity: HR@10 random 0.011, popularity 0.106, item-CF 0.159, implicit ALS 0.177, BPR-MF 0.180. But logs only show what the old system chose to show…</span></li>
    <li><b>Online evaluation</b><span>Q: does it work on real users? → A/B test: CTR 5.0% → 5.5%, z = 2.24, p = 0.025. But what about users and films with no history at all?</span></li>
    <li><b>Cold start</b><span>Q: what do we show a new user or a new film? → Popularity, onboarding, fold-in; content vectors (Chhichhore → Ben 4.81); exploration. But showing only what already does well has a cost…</span></li>
    <li><b>Popularity bias &amp; feedback loops</b><span>Q: does the system distort its own training data? → Yes: rank-by-clicks showed 16 of 50 films and found 0 of the 5 best; smoothed CTR + 10% exploration found 3. Position bias hid Swades (corrected CTR 0.45 vs Bhaag Milkha 0.30).</span></li>
  </ol>

  <h2 id="rk-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ranking, Evaluation &amp; Cold Start</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Pipeline</div>
        <ul>
          <li><b>Retrieval</b>: cheap, high recall (MF/two-tower + ANN, CF, rules)</li>
          <li><b>Ranking</b>: rich model on hundreds of candidates (GBM/DNN)</li>
          <li><b>Re-ranking</b>: diversity, freshness, business rules</li>
          <li>Ben: 7 → 5 → ordered → max 2 per genre in top 3</li>
          <li>⚠ Swades lost at retrieval: no ranker can bring it back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Learning to rank</div>
        <ul>
          <li><b>Pointwise</b>: per item, log loss 0.581</li>
          <li><b>Pairwise</b>: RankNet ln(1 + e<sup>−(s<sub>i</sub>−s<sub>j</sub>)</sup>); 0.848 for a wrong pair</li>
          <li><b>Listwise</b>: ListNet softmax CE 1.441; LambdaMART λ = |ΔNDCG| × pair gradient</li>
          <li><b>BPR</b>: −ln σ(x<sub>ui</sub> − x<sub>uj</sub>), sampled negatives; ≈ per-user AUC</li>
          <li>Per-user shift: pointwise 0.714 vs LambdaMART 0.838 NDCG@5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Accuracy metrics</div>
        <ul>
          <li><b>P@k</b> = hits/k; <b>R@k</b> = hits/|relevant|; <b>HR@k</b> = any hit</li>
          <li><b>AP@k</b> = Σ P@hit / min(|rel|, k); <b>MAP</b> = mean over users</li>
          <li><b>RR</b> = 1/rank of first hit; <b>MRR</b> = mean</li>
          <li><b>NDCG@k</b> = Σ gain/log₂(pos + 1) ÷ ideal</li>
          <li>Ben: 0.40, 0.67, AP 0.333, RR 0.5, NDCG 0.578</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond accuracy</div>
        <ul>
          <li><b>Coverage</b>: share of catalogue ever shown (90%)</li>
          <li><b>Diversity (ILD)</b>: share of dissimilar pairs in a list (Ben 0.7)</li>
          <li><b>Novelty</b>: mean −log₂ popularity (Ben 1.99 bits)</li>
          <li><b>Serendipity</b>: relevant AND unexpected</li>
          <li>Bhaag Milkha in every row: 5 of 25 slots</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Offline vs online</div>
        <ul>
          <li>Time split / leave-last-out; filter seen; full-catalogue ranking</li>
          <li>Always beat random and popularity: HR@10 .011 / .106 / BPR .180</li>
          <li>⚠ Sampled metrics inflate (0.180 → 0.556)</li>
          <li><b>A/B</b>: z = 2.24, p = 0.025; guardrails, novelty effect</li>
          <li>Interleaving: faster, more sensitive comparisons</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cold start &amp; loops</div>
        <ul>
          <li>New user: popularity → quiz → fold-in after a few plays</li>
          <li>New item: content vector (Chhichhore (1.875, 0.25)), two-tower, exploration slots</li>
          <li>UCB = mean + c√(ln N / n): Chhichhore 1.03 beats Bhaag Milkha 0.35</li>
          <li>Feedback loop: 16/50 shown, 0/5 best found</li>
          <li>Position bias → IPS: Swades 0.09 → 0.45</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rk-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="rk-pipe"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Retrieval → Ranking → Re-ranking</span><span class="rm-sub">Ben's row in three stages</span></div></div>
      <div class="rm-item rm-done" data-target="rk-ltr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Learning to Rank</span><span class="rm-sub">Pointwise, pairwise, listwise</span></div></div>
      <div class="rm-item rm-done" data-target="rk-bpr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">BPR</span><span class="rm-sub">Ranking from implicit data</span></div></div>
      <div class="rm-item rm-done" data-target="rk-prec"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Precision, Recall, Hit Rate</span><span class="rm-sub">Counting hits</span></div></div>
      <div class="rm-item rm-done" data-target="rk-order"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">MAP, MRR, NDCG</span><span class="rm-sub">Position matters</span></div></div>
      <div class="rm-item rm-done" data-target="rk-beyond"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Coverage, Diversity, Novelty</span><span class="rm-sub">Beyond accuracy</span></div></div>
      <div class="rm-item rm-done" data-target="rk-offline"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Offline Evaluation</span><span class="rm-sub">Splits, baselines, traps</span></div></div>
      <div class="rm-item rm-done" data-target="rk-online"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Online Evaluation</span><span class="rm-sub">A/B tests by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rk-cold"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Cold Start</span><span class="rm-sub">New users, new films</span></div></div>
      <div class="rm-item rm-done" data-target="rk-bias"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Popularity Bias &amp; Feedback Loops</span><span class="rm-sub">Exploration, IPS</span></div></div>
      <div class="rm-item rm-done" data-target="rk-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One row, many questions</span></div></div>
      <div class="rm-item rm-done" data-target="rk-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Metrics and LTR styles</span></div></div>
      <div class="rm-item rm-done" data-target="rk-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="rk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="rk-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rk-pipe"><span class="num">01</span>Retrieval → Ranking → Re-ranking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Matrix factorization gives a score for every (user, film) pair. A real catalogue has millions of films and a request must be answered in about 100 ms, and the screen shows only a handful of slots. How do we get from "a score for everything" to "this row, now"?</p>
  </div>
  <h3>The running example</h3>
  <p>Still CineCity, the same five friends. The ratings matrix of the earlier notes showed the six films they rated; CineCity's catalogue has four more that other members rated, so MF has vectors for them too: <strong>Bhaag Milkha Bhaag</strong> (written "Bhaag Milkha" below), <strong>Mary Kom</strong>, <strong>Jab We Met</strong> and <strong>Swades</strong>. Each film gets one main genre (sports, romance or drama) for the re-ranking rule. Popularity is how many of CineCity's 1,000 members watched each film last month. The ratings matrix tells us what each friend has already seen; the hidden "truth" is what each watched and rated in the <em>following</em> week, with a grade 3 = loved, 2 = liked, 1 = ok.</p>
  <table class="tbl"><caption>Catalogue (main genre, watchers per 1,000 members)</caption>
    <tr><th>Film</th><th>Genre</th><th>Watchers / 1,000</th><th>Film</th><th>Genre</th><th>Watchers / 1,000</th></tr>
    <tr><td>Dangal</td><td>sports</td><td>600</td><td>Bhaag Milkha</td><td>sports</td><td>300</td></tr>
    <tr><td>DDLJ</td><td>romance</td><td>500</td><td>Lagaan</td><td>sports</td><td>250</td></tr>
    <tr><td>3 Idiots</td><td>drama</td><td>450</td><td>Jab We Met</td><td>romance</td><td>200</td></tr>
    <tr><td>Chak De</td><td>sports</td><td>400</td><td>Mary Kom</td><td>sports</td><td>150</td></tr>
    <tr><td>K3G</td><td>romance</td><td>350</td><td>Swades</td><td>drama</td><td>100</td></tr>
  </table>
  <table class="tbl"><caption>Already seen, and next week's truth (graded)</caption>
    <tr><th>User</th><th>Already seen (from the ratings matrix)</th><th>Watched next week (grade)</th></tr>
    <tr><td>Asha</td><td>Dangal, Chak De, DDLJ, K3G, 3 Idiots</td><td>Lagaan (3)</td></tr>
    <tr><td><strong>Ben</strong></td><td>Dangal, Chak De, DDLJ</td><td><strong>Lagaan (3), Mary Kom (2), Swades (1)</strong></td></tr>
    <tr><td>Chen</td><td>Dangal, DDLJ, K3G</td><td>Jab We Met (3), Swades (1)</td></tr>
    <tr><td>Dia</td><td>Chak De, DDLJ, K3G, 3 Idiots</td><td>Jab We Met (2)</td></tr>
    <tr><td>Esha</td><td>Dangal, Lagaan, K3G, 3 Idiots</td><td>Chak De (3)</td></tr>
  </table>
  <p>Ben's three open films from the earlier notes (Lagaan, K3G, 3 Idiots) are now joined by the four extra films: seven candidates for a row of five. He did watch Lagaan, the film content-based filtering, CF and MF all ranked near the top for him.</p>
  <div class="fx" data-lang="py">import numpy as np
# CineCity's catalogue: the 6 films of the ratings matrix + 4 more rated by other members
genre = {"Dangal": "sports", "Chak De": "sports", "Lagaan": "sports", "Bhaag Milkha": "sports",
         "Mary Kom": "sports", "DDLJ": "romance", "K3G": "romance", "Jab We Met": "romance",
         "3 Idiots": "drama", "Swades": "drama"}
watchers = {"Dangal": 600, "DDLJ": 500, "3 Idiots": 450, "Chak De": 400, "K3G": 350,
            "Bhaag Milkha": 300, "Lagaan": 250, "Jab We Met": 200, "Mary Kom": 150, "Swades": 100}  # of 1,000
seen = {"Asha": {"Dangal", "Chak De", "DDLJ", "K3G", "3 Idiots"},    # rated in the ratings matrix
        "Ben":  {"Dangal", "Chak De", "DDLJ"},
        "Chen": {"Dangal", "DDLJ", "K3G"},
        "Dia":  {"Chak De", "DDLJ", "K3G", "3 Idiots"},
        "Esha": {"Dangal", "Lagaan", "K3G", "3 Idiots"}}
# what each user really watched and rated next week (graded relevance: 3 loved, 2 liked, 1 ok)
truth = {"Asha": {"Lagaan": 3},
         "Ben":  {"Lagaan": 3, "Mary Kom": 2, "Swades": 1},
         "Chen": {"Jab We Met": 3, "Swades": 1},
         "Dia":  {"Jab We Met": 2},
         "Esha": {"Chak De": 3}}
print("catalogue:", len(genre), "films;  Ben has not seen:",
      [f for f in genre if f not in seen["Ben"]])</div>
  <div class="fx" data-lang="text">catalogue: 10 films;  Ben has not seen: ['Lagaan', 'Bhaag Milkha', 'Mary Kom', 'K3G', 'Jab We Met', '3 Idiots', 'Swades']</div>
  <h3>Why one model cannot score everything</h3>
  <p>A good ranking model with hundreds of features might take 0.1 ms per film. With 100 million films: 10<sup>8</sup> × 0.1 ms = 10,000 seconds per request. Impossible. A dot product of two 64-number vectors, on the other hand, is about a hundred multiply-adds and can be searched with an index. So the work is split into stages: each stage sees fewer items but spends more on each.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring: HR skims 10,000 CVs in seconds each, interviews 50, and a final panel picks 5 with diversity in mind. The skim must not throw away good people (recall); the panel must get the order right (precision).</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
<defs><marker id="rk-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="5" y="20" width="110" height="110" class="fs" stroke="currentColor"/>
<text x="60" y="65" text-anchor="middle" font-size="12">Catalogue</text><text x="60" y="83" text-anchor="middle" class="tm" font-size="10.5">10 M films</text><text x="60" y="100" text-anchor="middle" class="tm" font-size="10.5">(Ben: 7 unseen)</text>
<rect x="150" y="35" width="120" height="80" class="fb sb"/>
<text x="210" y="58" text-anchor="middle" font-size="12">Retrieval</text><text x="210" y="76" text-anchor="middle" class="tm" font-size="10.5">MF/two-tower + ANN</text><text x="210" y="94" text-anchor="middle" class="tm" font-size="10.5">→ ~1,000 (Ben: 5)</text>
<rect x="305" y="45" width="120" height="60" class="fv"/>
<text x="365" y="68" text-anchor="middle" font-size="12">Ranking</text><text x="365" y="86" text-anchor="middle" class="tm" font-size="10.5">GBM / DNN → order</text>
<rect x="460" y="52" width="130" height="46" class="fg sg"/>
<text x="525" y="72" text-anchor="middle" font-size="12">Re-ranking</text><text x="525" y="88" text-anchor="middle" class="tm" font-size="10.5">rules → final row</text>
<line x1="117" y1="75" x2="147" y2="75" stroke="currentColor" marker-end="url(#rk-a1)"/>
<line x1="272" y1="75" x2="302" y2="75" stroke="currentColor" marker-end="url(#rk-a1)"/>
<line x1="427" y1="75" x2="457" y2="75" stroke="currentColor" marker-end="url(#rk-a1)"/>
<text x="150" y="150" class="tm" font-size="10.5">cheap, high recall</text><text x="330" y="150" class="tm" font-size="10.5">costly, high precision</text><text x="480" y="150" class="tm" font-size="10.5">business goals</text>
</svg><figcaption>Each stage sees fewer items but spends more compute on each. Total budget: about 100 ms.</figcaption></figure>
  <h3>Ben's row by hand</h3>
  <table class="tbl"><caption>The three stages for Ben's 7 unseen films</caption>
    <tr><th>Film</th><th>1. Retrieval score (biased-MF prediction)</th><th>kept?</th><th>2. Ranker P(watch tonight)</th><th>ranked order</th><th>3. Final row</th></tr>
    <tr><td>3 Idiots</td><td>4.76</td><td>yes</td><td>0.30</td><td>4</td><td>3 (pulled up)</td></tr>
    <tr><td>Lagaan</td><td>4.62</td><td>yes</td><td>0.55</td><td>2</td><td>2</td></tr>
    <tr><td>Bhaag Milkha</td><td>4.5</td><td>yes</td><td>0.62</td><td>1</td><td>1</td></tr>
    <tr><td>Mary Kom</td><td>4.4</td><td>yes</td><td>0.48</td><td>3</td><td>4 (pushed down)</td></tr>
    <tr><td>Jab We Met</td><td>2.6</td><td>yes</td><td>0.22</td><td>5</td><td>5</td></tr>
    <tr><td>Swades</td><td>2.4</td><td><strong>no</strong></td><td>—</td><td>—</td><td>—</td></tr>
    <tr><td>K3G</td><td>1.77</td><td>no</td><td>—</td><td>—</td><td>—</td></tr>
  </table>
  <p>Stage 1 keeps the top 5 MF scores. The three films from the earlier notes carry the biased-MF predictions of the MF note (3 Idiots 4.76, Lagaan 4.62, K3G 1.77); the four extra films get theirs from the same model trained on all CineCity members. Stage 2 is a richer model (popularity, recency, "Friday night", past clicks) that moves the trending Bhaag Milkha to the top and drops 3 Idiots to fourth. Stage 3 applies a rule, "at most 2 films of one genre in the top 3": Bhaag Milkha, Lagaan and Mary Kom are all sports, so Mary Kom drops below 3 Idiots.</p>
  <div class="fx" data-lang="py"># Ben's Friday-night row, built in three stages
retrieval = {"3 Idiots": 4.76, "Lagaan": 4.62, "Bhaag Milkha": 4.5, "Mary Kom": 4.4,
             "Jab We Met": 2.6, "Swades": 2.4, "K3G": 1.77}       # biased-MF predictions, unseen films
cands = sorted(retrieval, key=retrieval.get, reverse=True)[:5]     # stage 1: keep the best 5
print("retrieved:", cands)
p_watch = {"Bhaag Milkha": 0.62, "Lagaan": 0.55, "Mary Kom": 0.48,
           "3 Idiots": 0.30, "Jab We Met": 0.22}                   # stage 2: ranker's P(watch tonight)
ranked = sorted(cands, key=p_watch.get, reverse=True)
print("ranked:   ", ranked)

def rerank(lst, top=3, max_same=2):                                # stage 3: at most 2 per genre in the top 3
    out, rest = [], list(lst)
    while rest:
        for f in rest:
            if len(out) &gt;= top or sum(genre[g] == genre[f] for g in out) &lt; max_same:
                out.append(f); rest.remove(f); break
    return out
row = rerank(ranked)
print("final row:", row)
print("relevant films dropped at retrieval:", [f for f in truth["Ben"] if f not in cands])</div>
  <div class="fx" data-lang="text">retrieved: ['3 Idiots', 'Lagaan', 'Bhaag Milkha', 'Mary Kom', 'Jab We Met']
ranked:    ['Bhaag Milkha', 'Lagaan', 'Mary Kom', '3 Idiots', 'Jab We Met']
final row: ['Bhaag Milkha', 'Lagaan', '3 Idiots', 'Mary Kom', 'Jab We Met']
relevant films dropped at retrieval: ['Swades']</div>
  <p>The last line is the most important lesson of this section: Swades was going to be watched by Ben, but it was dropped at retrieval (MF score 2.4, sixth of seven), so no ranker or re-ranker could ever show it. Retrieval recall for Ben is 2/3. <code>rerank</code> walks down the ranked list and takes the first film that does not break the genre rule, once the top 3 are filled any film is allowed.</p>
  <h3>The same at catalogue scale</h3>
  <p>CineCity's 10 films (or even its simulated 1,000) need none of this, so picture the catalogue grown to 100,000 films with 16-number embeddings: retrieval is one matrix-vector product plus <code>np.argpartition</code>, which finds the 1,000 largest scores without sorting all 100,000 (O(n) instead of O(n log n)). In production this is an approximate nearest-neighbour index (FAISS, ScaNN, HNSW; see <a class="xref" data-note="vectordb">Vector Databases</a>) that searches only promising regions of the vector space.</p>
  <div class="fx" data-lang="py"># the same three stages at catalogue scale: 100,000 films
rng = np.random.default_rng(7)
n_items, dim = 100_000, 16
item_vec = rng.normal(size=(n_items, dim)).astype(np.float32)   # item embeddings (MF / two-tower)
g_id     = rng.integers(0, 5, n_items)                          # 5 genres
age_days = rng.integers(0, 365, n_items)
user_vec = rng.normal(size=dim).astype(np.float32)

sim = item_vec @ user_vec                                       # stage 1: one dot product per item
cand = np.argpartition(-sim, 1000)[:1000]                       # best 1,000 without a full sort
score = sim[cand] + 2.0 * np.exp(-age_days[cand] / 30)          # stage 2: richer score on 1,000 only
ranked_big = cand[np.argsort(-score)][:50]
final, per = [], {}
for it in ranked_big:                                           # stage 3: at most 2 per genre
    if per.get(g_id[it], 0) &lt; 2:
        final.append(it); per[g_id[it]] = per.get(g_id[it], 0) + 1
    if len(final) == 10: break
print("retrieved", len(cand), "of", n_items, "-&gt; ranked 50 -&gt; final", len(final))
print("genres of top 10 before re-rank:", g_id[ranked_big[:10]].tolist())
print("genres of top 10 after  re-rank:", g_id[final].tolist())</div>
  <div class="fx" data-lang="text">retrieved 1000 of 100000 -&gt; ranked 50 -&gt; final 10
genres of top 10 before re-rank: [1, 4, 3, 4, 2, 4, 3, 0, 1, 1]
genres of top 10 after  re-rank: [1, 4, 3, 4, 2, 3, 0, 1, 2, 0]</div>
  <p>The ranking score adds a freshness bonus 2e<sup>−age/30</sup> (a stand-in for a heavy model); re-ranking caps each genre at 2 of the final 10. Before re-ranking genres 4 and 1 each had three of the top 10; after, no genre has more than 2.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Goal</th><th>Typical tools</th><th>Measured by</th></tr>
    <tr><td>Retrieval / candidate generation</td><td>don't miss good items</td><td>two-tower or MF embeddings + ANN, item-item CF, "trending", "continue watching"; several sources merged</td><td>recall@1000 of the candidates</td></tr>
    <tr><td>Ranking</td><td>order candidates precisely</td><td>LightGBM (LambdaMART) or deep models with user, item, context and cross features; predicts P(click), watch time</td><td>NDCG@k, AUC per user</td></tr>
    <tr><td>Re-ranking</td><td>business and user goals</td><td>diversity (MMR), freshness, dedupe, remove bought, sponsored slots, fairness, cold-item boosts</td><td>diversity, coverage, guardrails</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Candidate generation (retrieval)</strong>: a fast stage that selects a few hundred to a few thousand items likely to be relevant, optimised for recall. <strong>Ranking</strong>: a slower, feature-rich model that orders those candidates, optimised for the top of the list. <strong>Re-ranking</strong>: rule- or objective-based adjustment of the final list for goals the ranker does not model (diversity, freshness, business constraints).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A great ranker cannot fix a bad retriever: if the best item is not among the candidates, it is gone (Swades). Measure retrieval recall separately, and use several retrieval sources so one blind spot does not empty the row.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Learning to rank.</b> The ranker's probabilities (0.62, 0.55, …) were given to us. How is a ranking model trained so that it gets the <em>order</em> right, rather than each probability?</div>

  <h2 id="rk-ltr"><span class="num">02</span>Learning to Rank</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model trained to predict each film's click on its own does not directly care about order. Which loss functions teach a model to put the right films first?</p>
  </div>
  <p>Ben was shown 5 films and clicked Lagaan and Mary Kom (y = 1); Bhaag Milkha, 3 Idiots and Jab We Met were not clicked (y = 0). The ranker's current probabilities and their logits s = ln(p / (1 − p)):</p>
  <table class="tbl">
    <tr><th>Film</th><th>clicked y</th><th>p</th><th>logit s</th><th>pointwise loss −[y ln p + (1−y) ln(1−p)]</th></tr>
    <tr><td>Bhaag Milkha</td><td>0</td><td>0.62</td><td>0.490</td><td>−ln 0.38 = 0.968</td></tr>
    <tr><td>Lagaan</td><td>1</td><td>0.55</td><td>0.201</td><td>−ln 0.55 = 0.598</td></tr>
    <tr><td>Mary Kom</td><td>1</td><td>0.48</td><td>−0.080</td><td>−ln 0.48 = 0.734</td></tr>
    <tr><td>3 Idiots</td><td>0</td><td>0.30</td><td>−0.847</td><td>−ln 0.70 = 0.357</td></tr>
    <tr><td>Jab We Met</td><td>0</td><td>0.22</td><td>−1.266</td><td>−ln 0.78 = 0.248</td></tr>
  </table>
  <div class="cards">
    <div><b>Pointwise</b><p>Each film is a separate example: classification (clicked?) or regression (grade). Loss = mean log loss = 2.905 / 5 = <strong>0.581</strong>.</p><small>Simplest, most common; any classifier works</small></div>
    <div><b>Pairwise</b><p>Each (clicked, not clicked) pair is an example: learn s<sub>i</sub> &gt; s<sub>j</sub>. RankNet loss ln(1 + e<sup>−(s<sub>i</sub> − s<sub>j</sub>)</sup>).</p><small>RankNet, RankSVM, BPR</small></div>
    <div><b>Listwise</b><p>The whole list is one example: optimise a list quality such as NDCG, or a softmax over the list.</p><small>ListNet, LambdaRank, LambdaMART</small></div>
  </div>
  <h3>Pairwise by hand</h3>
  <p>2 clicked × 3 not clicked = 6 pairs. A pair costs little when the clicked film already scores well above the other, and a lot when it is below:</p>
  <table class="tbl">
    <tr><th>Pair (should be above)</th><th>s<sub>i</sub> − s<sub>j</sub></th><th>RankNet loss ln(1 + e<sup>−(s<sub>i</sub>−s<sub>j</sub>)</sup>)</th></tr>
    <tr><td>Lagaan &gt; Bhaag Milkha</td><td>0.201 − 0.490 = −0.289</td><td>ln(1 + e<sup>0.289</sup>) = ln 2.335 = <strong>0.848</strong> (wrong order)</td></tr>
    <tr><td>Lagaan &gt; 3 Idiots</td><td>+1.048</td><td>0.301</td></tr>
    <tr><td>Lagaan &gt; Jab We Met</td><td>+1.466</td><td>0.208</td></tr>
    <tr><td>Mary Kom &gt; Bhaag Milkha</td><td>−0.570</td><td><strong>1.018</strong> (wrong order)</td></tr>
    <tr><td>Mary Kom &gt; 3 Idiots</td><td>+0.767</td><td>0.381</td></tr>
    <tr><td>Mary Kom &gt; Jab We Met</td><td>+1.186</td><td>0.267</td></tr>
  </table>
  <p>The two biggest losses are exactly the two mis-ordered pairs, both involving Bhaag Milkha. A pairwise model does not care whether Bhaag Milkha's probability is "right", only that it should be below the films Ben chose. That matches implicit feedback well: we do not know Bhaag Milkha is bad, only that Ben preferred two others at that moment.</p>
  <h3>Listwise by hand</h3>
  <p><strong>ListNet</strong> turns the scores into a probability of being ranked first with a softmax: e<sup>s</sup> = 1.632, 1.223, 0.923, 0.429, 0.282 (sum 4.489) → 0.364, 0.272, 0.206, 0.096, 0.063. The target splits the probability over the clicked films (0.5, 0.5). Cross-entropy = −0.5 ln 0.272 − 0.5 ln 0.206 = 0.5 × (1.302 + 1.580) = <strong>1.441</strong>.</p>
  <p><strong>LambdaRank / LambdaMART</strong> keeps the pairwise gradient but multiplies it by how much swapping the pair would change NDCG (section 05). Current order by score: Bhaag Milkha, Lagaan, Mary Kom, 3 Idiots, Jab We Met. With binary relevance, DCG = 1/log₂3 + 1/log₂4 = 0.631 + 0.5 = 1.131; ideal = 1 + 0.631 = 1.631.</p>
  <ul>
    <li>Swap Lagaan (pos 2) with Bhaag Milkha (pos 1): DCG becomes 1 + 0.5 = 1.5, |ΔNDCG| = (1.5 − 1.131)/1.631 = <strong>0.226</strong>.</li>
    <li>Swap Mary Kom (pos 3) with Bhaag Milkha (pos 1): DCG becomes 1 + 0.631 = 1.631, |ΔNDCG| = 0.5/1.631 = <strong>0.307</strong>.</li>
    <li>RankNet gradient sizes 1/(1 + e<sup>s<sub>i</sub>−s<sub>j</sub></sup>): 0.572 and 0.639. Lambdas: 0.572 × 0.226 = 0.129 and 0.639 × 0.307 = 0.196. The pair whose fix helps the top of the list more gets the bigger push.</li>
  </ul>
  <div class="fx" data-lang="py"># the ranker's scores for Ben's 5 shown films; he clicked Lagaan and Mary Kom
shown = ["Bhaag Milkha", "Lagaan", "Mary Kom", "3 Idiots", "Jab We Met"]
p = np.array([0.62, 0.55, 0.48, 0.30, 0.22]); y = np.array([0, 1, 1, 0, 0])
s = np.log(p / (1 - p))                                        # scores as logits
print("logits:", s.round(3))
point = -(y * np.log(p) + (1 - y) * np.log(1 - p))
print("pointwise log loss per film:", point.round(3), " mean", point.mean().round(3))
pairs = [(i, j) for i in range(5) for j in range(5) if y[i] == 1 and y[j] == 0]
for i, j in pairs:
    print(f"  pair {shown[i]:12s} &gt; {shown[j]:12s} s_i - s_j = {s[i] - s[j]:+.3f}  "
          f"RankNet loss {np.log1p(np.exp(-(s[i] - s[j]))):.3f}")
soft = np.exp(s) / np.exp(s).sum()                             # ListNet: softmax over the list
target = y / y.sum()
print("softmax:", soft.round(3), " listwise cross-entropy", round(-(target * np.log(soft)).sum(), 3))
def dcg(rel_in_order): return sum(r / np.log2(k + 2) for k, r in enumerate(rel_in_order))
order = list(np.argsort(-s)); ideal = dcg(sorted(y, reverse=True))
base = dcg(y[order]) / ideal
for i, j in [(1, 0), (2, 0)]:                                  # swap a clicked film with Bhaag Milkha
    o = order.copy(); a, b = o.index(i), o.index(j); o[a], o[b] = o[b], o[a]
    print(f"swap {shown[i]} and {shown[j]}: |delta NDCG| = {abs(dcg(y[o]) / ideal - base):.3f}")</div>
  <div class="fx" data-lang="text">logits: [ 0.49   0.201 -0.08  -0.847 -1.266]
pointwise log loss per film: [0.968 0.598 0.734 0.357 0.248]  mean 0.581
  pair Lagaan       &gt; Bhaag Milkha s_i - s_j = -0.289  RankNet loss 0.848
  pair Lagaan       &gt; 3 Idiots     s_i - s_j = +1.048  RankNet loss 0.301
  pair Lagaan       &gt; Jab We Met   s_i - s_j = +1.466  RankNet loss 0.208
  pair Mary Kom     &gt; Bhaag Milkha s_i - s_j = -0.570  RankNet loss 1.018
  pair Mary Kom     &gt; 3 Idiots     s_i - s_j = +0.767  RankNet loss 0.381
  pair Mary Kom     &gt; Jab We Met   s_i - s_j = +1.186  RankNet loss 0.267
softmax: [0.364 0.272 0.206 0.096 0.063]  listwise cross-entropy 1.441
swap Lagaan and Bhaag Milkha: |delta NDCG| = 0.226
swap Mary Kom and Bhaag Milkha: |delta NDCG| = 0.307</div>
  <h3>Does it matter? LightGBM's LambdaMART vs pointwise</h3>
  <p>400 synthetic users with 20 candidates each and a grade 0–3 per candidate (top 2 of each user's list are grade 3, next 3 grade 2, next 5 grade 1). <a class="xref" data-note="ml_lightgbm">LightGBM</a>'s <code>LGBMRanker(objective="lambdarank")</code> needs <code>group</code>: the number of rows per user, in order, so it knows which rows compete with each other. We run it twice: once with clean features, once where feature 0 also carries a per-user shift (like "how active is this user today", or the user bias b<sub>u</sub> inside a biased-MF prediction, which moves all of a user's candidates together: every one of Ben's predictions carries his +0.08).</p>
  <div class="fx" data-lang="py"># learning to rank at scale: 400 users x 20 candidates each, graded relevance 0-3
import lightgbm as lgb
from sklearn.metrics import ndcg_score
rng = np.random.default_rng(0)
n_q, n_c = 400, 20
Xr = rng.normal(size=(n_q * n_c, 6))
latent = Xr[:, 0] + 0.8 * Xr[:, 1] * Xr[:, 2] + 0.5 * np.sin(3 * Xr[:, 3]) + rng.normal(0, 0.7, n_q * n_c)
yr = np.zeros(n_q * n_c, int)
for q in range(n_q):                                     # within each user: top 2 -&gt; 3, next 3 -&gt; 2, next 5 -&gt; 1
    sl = slice(q * n_c, (q + 1) * n_c)
    order = np.argsort(-latent[sl])
    lab = np.zeros(n_c, int); lab[order[:2]] = 3; lab[order[2:5]] = 2; lab[order[5:10]] = 1
    yr[sl] = lab
Xs = Xr.copy()                                           # same data, but feature 0 also carries a per-user shift
Xs[:, 0] += np.repeat(rng.normal(0, 2, n_q), n_c)         # (e.g. "how active is this user today")
tr = np.arange(n_q * n_c) &lt; 300 * n_c                    # first 300 users train, last 100 test
groups = [n_c] * 300
common = dict(n_estimators=200, learning_rate=0.05, num_leaves=15, n_jobs=1, verbose=-1, random_state=0)
Yt = yr[~tr].reshape(100, n_c)
def fit_all(X):
    return {"pointwise (regress grade)": lgb.LGBMRegressor(**common).fit(X[tr], yr[tr]),
            "pointwise (classify grade&gt;=2)": lgb.LGBMClassifier(**common).fit(X[tr], yr[tr] &gt;= 2),
            "listwise LambdaMART": lgb.LGBMRanker(objective="lambdarank", **common).fit(X[tr], yr[tr], group=groups)}
for label, X in [("clean features", Xr), ("per-user shifted feature", Xs)]:
    print(label)
    for name, m in fit_all(X).items():
        sc = m.predict_proba(X[~tr])[:, 1] if hasattr(m, "predict_proba") else m.predict(X[~tr])
        print(f"  {name:30s} test NDCG@5 = {ndcg_score(Yt, sc.reshape(100, n_c), k=5):.3f}")
print(f"  {'random order':30s} test NDCG@5 = {ndcg_score(Yt, rng.random((100, n_c)), k=5):.3f}")</div>
  <div class="fx" data-lang="text">clean features
  pointwise (regress grade)      test NDCG@5 = 0.837
  pointwise (classify grade&gt;=2)  test NDCG@5 = 0.839
  listwise LambdaMART            test NDCG@5 = 0.843
per-user shifted feature
  pointwise (regress grade)      test NDCG@5 = 0.725
  pointwise (classify grade&gt;=2)  test NDCG@5 = 0.714
  listwise LambdaMART            test NDCG@5 = 0.838
  random order                   test NDCG@5 = 0.311</div>
  <p>With clean features the three models are close (0.837–0.843): pointwise is a strong, simple default. With the per-user shift, pointwise models drop to 0.725 and 0.714 while LambdaMART stays at 0.838. A pointwise model must explain absolute labels and gets confused by a shift that changes every candidate of a user equally; a listwise model only compares candidates <em>within</em> a user, so such shifts cancel out. Random order scores 0.311: always report a baseline.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Learning to rank (LTR)</strong>: training a scoring function f(user, item, context) so that sorting by f gives good lists. <strong>Pointwise</strong>: loss on each item alone. <strong>Pairwise</strong>: loss on ordered pairs, e.g. RankNet ℓ = ln(1 + e<sup>−(s<sub>i</sub>−s<sub>j</sub>)</sup>). <strong>Listwise</strong>: loss on whole lists, e.g. ListNet softmax cross-entropy, or LambdaMART: gradient-boosted trees whose pair gradients are scaled by |ΔNDCG|.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffling rows or splitting a user's candidates across train and test, or passing wrong <code>group</code> sizes: the ranker then compares films that were never shown together. Keep each user's (or each request's) candidates together and sorted by group.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: BPR.</b> LTR needs shown-and-skipped items as negatives. Often we only have plays: every logged item is a positive. How can a factor model learn order from that?</div>

  <h2 id="rk-bpr"><span class="num">03</span>BPR: Bayesian Personalized Ranking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With implicit data there are no recorded dislikes. How do we build pairs to learn from, and how do we train MF vectors to order films instead of predicting ratings?</p>
  </div>
  <p>BPR (Rendle et al., 2009) makes one assumption: a user prefers a film they played (i) over a film they did not play (j). For each training step sample a triple (u, i, j) with j drawn from the unplayed films, and push the score difference x<sub>uij</sub> = x<sub>ui</sub> − x<sub>uj</sub> up, where x<sub>ui</sub> = p<sub>u</sub>·q<sub>i</sub> as in <a class="xref" data-note="ml_mf">Matrix Factorization</a>.</p>
  <p style="text-align:center">maximise Σ<sub>(u,i,j)</sub> ln σ(x<sub>ui</sub> − x<sub>uj</sub>) − λ‖Θ‖² &nbsp;&nbsp;⇔&nbsp;&nbsp; minimise −ln σ(x<sub>uij</sub>) + λ‖Θ‖²</p>
  <p>Since d/dx ln σ(x) = 1 − σ(x), with g = 1 − σ(x<sub>uij</sub>) the SGD updates are p<sub>u</sub> += η(g(q<sub>i</sub> − q<sub>j</sub>) − λp<sub>u</sub>), q<sub>i</sub> += η(g p<sub>u</sub> − λq<sub>i</sub>), q<sub>j</sub> += η(−g p<sub>u</sub> − λq<sub>j</sub>). When the pair is already well ordered, σ ≈ 1, g ≈ 0, and nothing moves: effort goes to the mistakes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sommelier is never told "this wine is a 7". She is only told "the guest chose this one over that one", again and again, and learns to put the chosen kind of wine ahead.</p>
  </div>
  <h3>One step by hand</h3>
  <p>Ben's hand vector from the MF note is p = (2.5, 0.5) (axes: underdog drama, romance). In the implicit view he played Chak De, q<sub>i</sub> = (2, 0). η = 0.1, λ = 0.01. We sample two different unplayed films to see what the sampler can hand us.</p>
  <table class="tbl"><caption>One BPR step for (Ben, Chak De, j)</caption>
    <tr><th>Step</th><th>j = K3G (0.5, 2)</th><th>j = Lagaan (2, 0.5)</th></tr>
    <tr><td>x<sub>ui</sub>, x<sub>uj</sub></td><td>5 + 0 = 5; 1.25 + 1 = 2.25</td><td>5; 5 + 0.25 = 5.25</td></tr>
    <tr><td>x<sub>uij</sub>, σ, loss</td><td>2.75, 0.9399, −ln 0.9399 = 0.0620</td><td>−0.25, 0.4378, −ln 0.4378 = 0.8259</td></tr>
    <tr><td>g = 1 − σ</td><td>0.0601 (almost nothing to fix)</td><td>0.5622</td></tr>
    <tr><td>new p<sub>u</sub></td><td>(2.5, 0.5) + 0.1 × (0.0601 × (1.5, −2) − 0.01 × (2.5, 0.5)) = (2.5065, 0.4875)</td><td>(2.5, 0.5) + 0.1 × (0.5622 × (0, −0.5) − 0.01 × (2.5, 0.5)) = (2.4975, 0.4714)</td></tr>
    <tr><td>new q<sub>i</sub> (Chak De)</td><td>(2.0130, 0.0030)</td><td>(2.0 + 0.1 × (0.5622 × 2.5 − 0.02), 0.1 × 0.5622 × 0.5) = (2.1385, 0.0281)</td></tr>
    <tr><td>new q<sub>j</sub></td><td>(0.4845, 1.9950)</td><td>(2.0 − 0.1 × (0.5622 × 2.5 + 0.02), 0.5 − 0.1 × (0.5622 × 0.5 + 0.005)) = (1.8575, 0.4714)</td></tr>
    <tr><td>after one step</td><td>x<sub>uij</sub> 2.86, loss 0.056</td><td>x<sub>uij</sub> 0.49, loss 0.477</td></tr>
  </table>
  <div class="fx" data-lang="py"># one BPR step: Ben (u) played Chak De (i); sample an unplayed film j
sig = lambda x: 1 / (1 + np.exp(-x))
q = {"Chak De": np.array([2.0, 0.0]), "K3G": np.array([0.5, 2.0]),
     "Lagaan": np.array([2.0, 0.5])}                              # hand vectors from the MF note
lr, lam = 0.1, 0.01
for j_name in ["K3G", "Lagaan"]:
    pu, qi, qj = np.array([2.5, 0.5]), q["Chak De"], q[j_name]
    x = pu @ qi - pu @ qj
    print(f"j = {j_name}: x_ui - x_uj = {pu @ qi} - {pu @ qj} = {x}   sigma = {sig(x):.4f}   loss = {-np.log(sig(x)):.4f}")
    g = 1 - sig(x)                                    # d/dx of ln sigma(x)
    pu, qi, qj = (pu + lr * (g * (qi - qj) - lam * pu),
                  qi + lr * (g * pu - lam * qi),
                  qj + lr * (-g * pu - lam * qj))
    x2 = pu @ qi - pu @ qj
    print(f"  g = {g:.4f}  p_u {pu.round(4)}  q_i {qi.round(4)}  q_j {qj.round(4)}")
    print(f"  after one step: x_ui - x_uj = {x2:.4f}   loss = {-np.log(sig(x2)):.4f}")</div>
  <div class="fx" data-lang="text">j = K3G: x_ui - x_uj = 5.0 - 2.25 = 2.75   sigma = 0.9399   loss = 0.0620
  g = 0.0601  p_u [2.5065 0.4875]  q_i [2.013 0.003]  q_j [0.4845 1.995 ]
  after one step: x_ui - x_uj = 2.8603   loss = 0.0557
j = Lagaan: x_ui - x_uj = 5.0 - 5.25 = -0.25   sigma = 0.4378   loss = 0.8259
  g = 0.5622  p_u [2.4975 0.4714]  q_i [2.1385 0.0281]  q_j [1.8575 0.4714]
  after one step: x_ui - x_uj = 0.4931   loss = 0.4767</div>
  <p>With K3G (a romance Ben would not enjoy) the pair is already well ordered: σ ≈ 0.94, g ≈ 0.06, and the step barely moves anything. Effort goes to mistakes. With Lagaan the model sees a "mistake" (Lagaan scores above the played Chak De), pushes hard (g ≈ 0.56), and one step moves the gap from −0.25 to +0.49 and the loss from 0.826 to 0.477: Lagaan moves away from Ben. But Lagaan is exactly the film Ben went on to love (grade 3 next week). It was unplayed because he had not got to it yet, not because he disliked it. This is the price of BPR's assumption "played &gt; unplayed": some sampled negatives are false negatives. Over thousands of triples the true signal wins on average, but this is why unplayed films must never be read as dislikes when evaluating.</p>
  <h3>What BPR optimises</h3>
  <p>The fraction of (played, unplayed) pairs a user's scores put in the right order is that user's AUC (from <a class="xref" data-note="ml_evaluation">Classification Metrics</a>: the probability a random positive outranks a random negative). BPR maximises a smooth version of it, ln σ instead of a 0/1 step. So BPR is a pairwise LTR loss for implicit MF. Its weakness is the same as AUC's: every pair counts equally, wherever it sits in the list. Practical variants sample harder negatives (popular unplayed films, or the model's own top-ranked mistakes, as in WARP) to focus on the top of the list. Section 07 trains full BPR-MF on the simulated CineCity and evaluates it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>BPR</strong>: for triples (u, i, j) with i ∈ played(u), j ∉ played(u), minimise Σ −ln σ(x<sub>ui</sub> − x<sub>uj</sub>) + λ‖Θ‖², usually by SGD with uniformly sampled j. With x<sub>ui</sub> = p<sub>u</sub>·q<sub>i</sub> it is called BPR-MF. Equivalent to maximising a smoothed per-user AUC.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Uniform negatives are mostly obscure films that are easy to beat, so training "learns" little after a while; and an unplayed film may be one the user would love but never saw. Use more epochs or harder negatives, and never treat sampled negatives as true dislikes when evaluating.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Precision and recall.</b> We can now train models that produce rows. How do we say, with a number, how good Ben's row [Bhaag Milkha, Lagaan, 3 Idiots, Mary Kom, Jab We Met] was?</div>

  <h2 id="rk-prec"><span class="num">04</span>Precision@k, Recall@k, Hit Rate</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>RMSE judged predicted stars. Users see a row of k films. What is the simplest score for a row, given the films the user actually went on to watch?</p>
  </div>
  <p>Treat the films each user watched next week as "relevant" and count how many made it into the top k of their row. The five final rows (Ben's from section 01; the others built the same way, never including a film the user already rated):</p>
  <table class="tbl"><caption>Rows (top 5) and hits</caption>
    <tr><th>User</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>relevant</th></tr>
    <tr><td>Asha</td><td><strong>Lagaan ✓</strong></td><td>Bhaag Milkha</td><td>Swades</td><td>Jab We Met</td><td>Mary Kom</td><td>Lagaan</td></tr>
    <tr><td>Ben</td><td>Bhaag Milkha</td><td><strong>Lagaan ✓</strong></td><td>3 Idiots</td><td><strong>Mary Kom ✓</strong></td><td>Jab We Met</td><td>Lagaan, Mary Kom, Swades</td></tr>
    <tr><td>Chen</td><td>Bhaag Milkha</td><td>3 Idiots</td><td>Chak De</td><td><strong>Jab We Met ✓</strong></td><td><strong>Swades ✓</strong></td><td>Jab We Met, Swades</td></tr>
    <tr><td>Dia</td><td>Bhaag Milkha</td><td>Dangal</td><td>Swades</td><td>Lagaan</td><td>Mary Kom</td><td>Jab We Met</td></tr>
    <tr><td>Esha</td><td>Bhaag Milkha</td><td><strong>Chak De ✓</strong></td><td>Mary Kom</td><td>Swades</td><td>DDLJ</td><td>Chak De</td></tr>
  </table>
  <ul>
    <li><strong>Precision@k</strong> = hits in top k / k: "how much of what I showed was good?" Ben: P@3 = 1/3 = 0.333, P@5 = 2/5 = <strong>0.40</strong>.</li>
    <li><strong>Recall@k</strong> = hits in top k / number of relevant films: "how much of what was good did I show?" Ben: 2/3 = <strong>0.667</strong> (Swades was missed: lost at retrieval).</li>
    <li><strong>Hit rate@k</strong> = 1 if at least one hit, else 0, averaged over users: Asha, Ben, Chen, Esha yes; Dia no → 4/5 = <strong>0.80</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">recs = {"Asha": ["Lagaan", "Bhaag Milkha", "Swades", "Jab We Met", "Mary Kom"],
        "Ben":  row,                                   # the row built in section 01
        "Chen": ["Bhaag Milkha", "3 Idiots", "Chak De", "Jab We Met", "Swades"],
        "Dia":  ["Bhaag Milkha", "Dangal", "Swades", "Lagaan", "Mary Kom"],
        "Esha": ["Bhaag Milkha", "Chak De", "Mary Kom", "Swades", "DDLJ"]}
assert all(not (set(recs[u]) &amp; seen[u]) for u in recs)  # never re-recommend what was rated
def hits(rec, rel, k):      return [f for f in rec[:k] if f in rel]
def precision_at_k(rec, rel, k): return len(hits(rec, rel, k)) / k
def recall_at_k(rec, rel, k):    return len(hits(rec, rel, k)) / len(rel)
for u in recs:
    r, t = recs[u], truth[u]
    print(f"{u:5s} hits@5 {hits(r, t, 5)}  P@3 {precision_at_k(r, t, 3):.3f}  "
          f"P@5 {precision_at_k(r, t, 5):.2f}  R@5 {recall_at_k(r, t, 5):.3f}")
print("hit rate@5 =", np.mean([len(hits(recs[u], truth[u], 5)) &gt; 0 for u in recs]))
print("mean P@5 =", np.mean([precision_at_k(recs[u], truth[u], 5) for u in recs]).round(3),
      " mean R@5 =", np.mean([recall_at_k(recs[u], truth[u], 5) for u in recs]).round(3))</div>
  <div class="fx" data-lang="text">Asha  hits@5 ['Lagaan']  P@3 0.333  P@5 0.20  R@5 1.000
Ben   hits@5 ['Lagaan', 'Mary Kom']  P@3 0.333  P@5 0.40  R@5 0.667
Chen  hits@5 ['Jab We Met', 'Swades']  P@3 0.000  P@5 0.40  R@5 1.000
Dia   hits@5 []  P@3 0.000  P@5 0.00  R@5 0.000
Esha  hits@5 ['Chak De']  P@3 0.333  P@5 0.20  R@5 1.000
hit rate@5 = 0.8
mean P@5 = 0.24  mean R@5 = 0.733</div>
  <p>Asha's and Esha's recall is perfect (1 of 1) while their precision@5 is only 0.20: with one relevant film, precision@5 can never exceed 1/5. Dia scores 0 on everything: her only relevant film, Jab We Met, never appeared (her row is four sports films, although she rated Chak De 1). Averaged over the five users: P@5 0.24, R@5 0.733.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Fishing with a net of size k. Precision: what share of your catch is the fish you wanted. Recall: what share of the wanted fish in the lake you caught. A bigger net (larger k) raises recall and usually lowers precision.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a user with recommended list L and relevant set Rel: <strong>P@k</strong> = |L<sub>1..k</sub> ∩ Rel| / k; <strong>R@k</strong> = |L<sub>1..k</sub> ∩ Rel| / |Rel|; <strong>HR@k</strong> = 𝟙[|L<sub>1..k</sub> ∩ Rel| ≥ 1]. Report the mean over users (users with no relevant items are usually excluded from recall).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing P@k across users or datasets with very different numbers of relevant items: the ceiling is min(1, |Rel|/k). And none of these three notice <em>where</em> in the row the hit sits: a hit at slot 1 counts the same as at slot 5.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MAP, MRR, NDCG.</b> Ben's Lagaan sits at slot 2 and Chen's loved Jab We Met at slot 4. Users mostly look at the first slots, and Ben loved Lagaan but only liked Mary Kom. We need metrics that reward early hits and strong relevance.</div>

  <h2 id="rk-order"><span class="num">05</span>Order-Aware Metrics: MAP, MRR, NDCG</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Precision and recall ignore position and grade. How do we reward a row that puts the best film first?</p>
  </div>
  <h3>Average precision (AP) and MAP</h3>
  <p>Walk down the row; at every hit, write down the precision so far; average those numbers over min(|Rel|, k).</p>
  <table class="tbl"><caption>Ben, k = 5 (relevant: Lagaan, Mary Kom, Swades)</caption>
    <tr><th>pos</th><th>film</th><th>hit?</th><th>precision so far</th><th>discount 1/log₂(pos + 1)</th><th>grade</th></tr>
    <tr><td>1</td><td>Bhaag Milkha</td><td>no</td><td>–</td><td>1.000</td><td>0</td></tr>
    <tr><td>2</td><td>Lagaan</td><td>yes</td><td>1/2 = 0.50</td><td>0.631</td><td>3</td></tr>
    <tr><td>3</td><td>3 Idiots</td><td>no</td><td>–</td><td>0.500</td><td>0</td></tr>
    <tr><td>4</td><td>Mary Kom</td><td>yes</td><td>2/4 = 0.50</td><td>0.431</td><td>2</td></tr>
    <tr><td>5</td><td>Jab We Met</td><td>no</td><td>–</td><td>0.387</td><td>0</td></tr>
  </table>
  <p>Ben's AP@5 = (0.50 + 0.50) / min(3, 5) = <strong>0.333</strong>. Asha: hit at 1 → 1/1 = <strong>1.000</strong>. Chen: hits at 4 and 5 → (1/4 + 2/5)/2 = <strong>0.325</strong>. Dia: <strong>0</strong>. Esha: hit at 2 → (1/2)/1 = <strong>0.500</strong>. <strong>MAP@5</strong> = (1 + 0.333 + 0.325 + 0 + 0.5)/5 = 2.158/5 = <strong>0.432</strong>.</p>
  <h3>Reciprocal rank and MRR</h3>
  <p>When one good result is enough (a search, "play something"), only the first hit matters: RR = 1 / position of the first hit. Asha 1, Ben 1/2, Chen 1/4, Dia 0, Esha 1/2. <strong>MRR</strong> = (1 + 0.5 + 0.25 + 0 + 0.5)/5 = <strong>0.45</strong>.</p>
  <h3>NDCG</h3>
  <p>Discounted cumulative gain adds each hit's gain divided by log₂(position + 1), so slot 1 counts fully, slot 2 counts 0.631, slot 5 only 0.387. Normalising by the best possible DCG (all relevant films in the top slots, best grade first) gives NDCG between 0 and 1.</p>
  <ul>
    <li><strong>Binary</strong> (gain 1 per hit): DCG = 0.631 + 0.431 = 1.062; ideal = 1 + 0.631 + 0.5 = 2.131; NDCG@5 = <strong>0.498</strong>.</li>
    <li><strong>Graded</strong> (gain = grade): DCG = 3 × 0.631 + 2 × 0.431 = 1.893 + 0.861 = 2.754; ideal order 3, 2, 1: 3 + 2 × 0.631 + 1 × 0.5 = 4.762; NDCG@5 = 2.754 / 4.762 = <strong>0.578</strong>.</li>
    <li>Chen, binary: (1/log₂5 + 1/log₂6)/(1 + 0.631) = (0.431 + 0.387)/1.631 = <strong>0.501</strong>; graded: (3 × 0.431 + 1 × 0.387)/(3 + 0.631) = 1.679/3.631 = <strong>0.462</strong>.</li>
    <li>Esha (one relevant film at slot 2): 0.631/1 = <strong>0.631</strong>, binary and graded alike. Mean graded NDCG@5 over the five users = (1 + 0.578 + 0.462 + 0 + 0.631)/5 = <strong>0.534</strong>.</li>
  </ul>
  <p>Notice the reversal: binary NDCG says Chen's row (0.501) is slightly better than Ben's (0.498), graded NDCG says Ben's is much better (0.578 vs 0.462), because Chen's <em>loved</em> film (Jab We Met) sits at slot 4 while Ben's (Lagaan) sits at slot 2. Grades change conclusions.</p>
  <div class="fx" data-lang="py">def ap_at_k(rec, rel, k):
    n_hit, s = 0, 0.0
    for pos, f in enumerate(rec[:k], 1):
        if f in rel:
            n_hit += 1; s += n_hit / pos                 # precision at this hit
    return s / min(len(rel), k)
def rr(rec, rel):
    return next((1 / pos for pos, f in enumerate(rec, 1) if f in rel), 0.0)
def ndcg_at_k(rec, rel, k):                           # rel = {film: grade}; linear gain
    dcg = sum(rel.get(f, 0) / np.log2(pos + 1) for pos, f in enumerate(rec[:k], 1))
    ideal = sorted(rel.values(), reverse=True)[:k]
    idcg = sum(g / np.log2(pos + 1) for pos, g in enumerate(ideal, 1))
    return dcg / idcg
for u in recs:
    r, t = recs[u], truth[u]
    binary = {f: 1 for f in t}
    print(f"{u:5s} AP@5 {ap_at_k(r, t, 5):.3f}  RR {rr(r, t):.2f}  "
          f"NDCG@5 binary {ndcg_at_k(r, binary, 5):.3f}  graded {ndcg_at_k(r, t, 5):.3f}")
print("MAP@5 =", round(np.mean([ap_at_k(recs[u], truth[u], 5) for u in recs]), 4),
      " MRR =", round(np.mean([rr(recs[u], truth[u]) for u in recs]), 4),
      " mean NDCG@5 =", round(np.mean([ndcg_at_k(recs[u], truth[u], 5) for u in recs]), 3))
# check Ben's graded NDCG against sklearn: scores = reverse rank, true grades over the catalogue
from sklearn.metrics import ndcg_score
cat = list(genre)
y_true = [[truth["Ben"].get(f, 0) for f in cat]]
y_score = [[5 - recs["Ben"].index(f) if f in recs["Ben"] else -1 for f in cat]]
print("sklearn ndcg_score for Ben, k=5:", round(ndcg_score(y_true, y_score, k=5), 3))</div>
  <div class="fx" data-lang="text">Asha  AP@5 1.000  RR 1.00  NDCG@5 binary 1.000  graded 1.000
Ben   AP@5 0.333  RR 0.50  NDCG@5 binary 0.498  graded 0.578
Chen  AP@5 0.325  RR 0.25  NDCG@5 binary 0.501  graded 0.462
Dia   AP@5 0.000  RR 0.00  NDCG@5 binary 0.000  graded 0.000
Esha  AP@5 0.500  RR 0.50  NDCG@5 binary 0.631  graded 0.631
MAP@5 = 0.4317  MRR = 0.45  mean NDCG@5 = 0.534
sklearn ndcg_score for Ben, k=5: 0.578</div>
  <p>The from-scratch NDCG matches sklearn's <code>ndcg_score</code> (0.578), which takes true grades and scores over the whole catalogue and uses linear gains. Some papers use the exponential gain 2<sup>grade</sup> − 1 instead, which rewards top grades even more; always say which.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>AP@k</strong> = (1/min(|Rel|, k)) Σ<sub>pos ≤ k, hit</sub> P@pos; <strong>MAP</strong> = mean AP over users. <strong>RR</strong> = 1/rank of first relevant; <strong>MRR</strong> = mean RR. <strong>DCG@k</strong> = Σ<sub>pos=1..k</sub> gain<sub>pos</sub> / log₂(pos + 1); <strong>NDCG@k</strong> = DCG@k / IDCG@k, where IDCG uses the ideal ordering of the user's relevant grades.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Different libraries define AP's denominator differently (|Rel|, min(|Rel|, k), or number of hits) and NDCG's gain (linear or exponential) and handle users with no relevant items differently. Numbers from two papers or two tools are often not comparable; state the exact definition.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Beyond accuracy.</b> Every one of these metrics would be happy if every user got the same few safe films, as long as some of them were watched. Bhaag Milkha is already in all five rows, and Dia's row is four sports films. Is the system serving the catalogue and the users well?</div>

  <h2 id="rk-beyond"><span class="num">06</span>Coverage, Diversity, Novelty</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Accuracy metrics look at one user and one row at a time. How do we notice rows that are all the same genre, a system that ignores most of its catalogue, or one that only ever recommends what everyone already knows?</p>
  </div>
  <ul>
    <li><strong>Catalogue coverage</strong>: share of the catalogue that appears in at least one row. Our rows show 9 of 10 films = <strong>90%</strong>; K3G is never shown. Bhaag Milkha alone takes 5 of the 25 slots.</li>
    <li><strong>Intra-list diversity (ILD)</strong>: average dissimilarity over pairs in one row; here "dissimilar" = different main genre. Ben's row has 10 pairs; same-genre pairs: Bhaag Milkha–Lagaan, Bhaag Milkha–Mary Kom, Lagaan–Mary Kom (sports) = 3, so ILD = 7/10 = <strong>0.7</strong>. Dia's row (four sports films and Swades) has 6 same-genre pairs: ILD 0.4.</li>
    <li><strong>Novelty</strong>: how unknown the shown films are, as the mean self-information −log₂(popularity). Ben: Bhaag Milkha −log₂ 0.3 = 1.737, Lagaan −log₂ 0.25 = 2.000, 3 Idiots −log₂ 0.45 = 1.152, Mary Kom −log₂ 0.15 = 2.737, Jab We Met −log₂ 0.2 = 2.322 → mean 9.948/5 = <strong>1.990 bits</strong>.</li>
    <li><strong>Serendipity</strong>: relevant <em>and</em> unexpected (for example relevant films outside the genres the user already watches). Hard to measure offline; usually approximated as relevance × unexpectedness.</li>
    <li><strong>Personalisation</strong> (inter-list diversity): how different users' rows are from each other, e.g. 1 − average overlap between pairs of rows.</li>
  </ul>
  <div class="fx" data-lang="py">shown_films = set(f for r in recs.values() for f in r)
print(f"catalogue coverage = {len(shown_films)}/{len(genre)} = {len(shown_films) / len(genre):.0%};"
      f"  never shown: {sorted(set(genre) - shown_films)}")
slots = [f for r in recs.values() for f in r]
print("Bhaag Milkha takes", slots.count("Bhaag Milkha"), "of", len(slots), "slots")
def ild(lst):                                          # intra-list diversity: share of pairs with different genres
    pairs = [(a, b) for i, a in enumerate(lst) for b in lst[i + 1:]]
    return np.mean([genre[a] != genre[b] for a, b in pairs])
def novelty(lst):                                      # mean self-information of the films shown
    return np.mean([-np.log2(watchers[f] / 1000) for f in lst])
for u in recs:
    print(f"{u:5s} diversity {ild(recs[u]):.1f}   novelty {novelty(recs[u]):.3f} bits")
print("Ben novelty terms:", {f: round(float(-np.log2(watchers[f] / 1000)), 3) for f in recs["Ben"]})</div>
  <div class="fx" data-lang="text">catalogue coverage = 9/10 = 90%;  never shown: ['K3G']
Bhaag Milkha takes 5 of 25 slots
Asha  diversity 0.7   novelty 2.424 bits
Ben   diversity 0.7   novelty 1.990 bits
Chen  diversity 0.8   novelty 1.971 bits
Dia   diversity 0.4   novelty 2.107 bits
Esha  diversity 0.7   novelty 2.024 bits
Ben novelty terms: {'Bhaag Milkha': 1.737, 'Lagaan': 2.0, '3 Idiots': 1.152, 'Mary Kom': 2.737, 'Jab We Met': 2.322}</div>
  <p>Asha's row has the highest novelty (2.424 bits): she has already seen the five most popular films, so her row is Swades (watched by 10%), Mary Kom, Jab We Met, Lagaan and Bhaag Milkha. Chen's is the lowest (1.971), carried down by 3 Idiots and Chak De, but it is also the most varied (0.8); Dia's is the least varied (0.4). These numbers do not say which row is better; they say what kind of system we are running, and they move in the opposite direction to accuracy when the model leans on popular films.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant that only ever serves its bestseller might get good reviews for each plate, but regulars get bored, most of the kitchen's dishes are never ordered, and nobody discovers the chef's best work. Coverage, diversity and novelty are the menu-level view.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Coverage</strong> = |∪<sub>u</sub> L<sub>u</sub>| / |catalogue|. <strong>ILD(L)</strong> = (2 / (k(k − 1))) Σ<sub>i&lt;j</sub> d(L<sub>i</sub>, L<sub>j</sub>) for a dissimilarity d (genre mismatch, 1 − cosine of embeddings). <strong>Novelty(L)</strong> = (1/k) Σ −log₂ pop(i), pop = share of users who interacted with i. <strong>Serendipity</strong>: relevance of recommendations that a simple (e.g. popularity) baseline would not have made.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Maximising diversity or novelty on its own: random rows have perfect coverage and high novelty. These are guardrails and trade-off axes reported next to NDCG, not goals by themselves. Re-ranking methods such as MMR (score − λ × similarity to films already chosen) let you choose the trade-off explicitly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Offline evaluation.</b> We computed all metrics on five hand-made rows with a known "truth". With real logs, how do we split the data, which candidates do we rank, and what must a model beat, so the numbers mean something?</div>

  <h2 id="rk-offline"><span class="num">07</span>Offline Evaluation Done Right</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our "next week" truth was hand-made. With real interaction logs, what is the protocol that gives honest metric values for a recommender before it ever meets a user?</p>
  </div>
  <h3>The protocol</h3>
  <ol>
    <li><strong>Split by time.</strong> Train on everything before a cut-off, test on what happened after. Per-user version: <em>leave-last-out</em> (hold out each user's most recent interaction). A random split lets the model learn from a user's future to predict their past (see <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</li>
    <li><strong>Rank the full catalogue</strong> for each test user, minus what they already interacted with in training (we never re-recommend Ben's Dangal).</li>
    <li><strong>Compute list metrics</strong> (HR@k, NDCG@k, …) and beyond-accuracy metrics on those rows.</li>
    <li><strong>Compare with baselines</strong>: random and, above all, most-popular. Popularity is shockingly hard to beat on many datasets.</li>
  </ol>
  <p>The same simulated CineCity as in the three previous notes: 1,000 users × 1,000 films, genre tags plus two hidden traits, 50,186 ratings. Here every rating counts as a play, and the order in which the simulator drew each user's films is their viewing order (people start with popular films they will like and reach rarer ones later). Hold out each user's <em>last</em> film, train on the other 49,186 plays, and compare the baselines with the models of the previous notes: item-based CF from <a class="xref" data-note="ml_cf">Collaborative Filtering</a>, implicit ALS from <a class="xref" data-note="ml_mf">Matrix Factorization</a>, and BPR-MF (section 03).</p>
  <div class="fx" data-lang="py"># the simulated CineCity from the previous notes: 1,000 users x 1,000 films, every rating = a play
def make_ratings(n_users=1000, n_items=1000, per_user=50, seed=0):
    rng = np.random.default_rng(seed)
    tags = np.zeros((n_items, 4), int)                      # sports, drama, romance, comedy
    for i in range(n_items):
        tags[i, rng.choice(4, rng.integers(1, 3), replace=False)] = 1
    taste = rng.normal(0, 1, (n_users, 4))
    hid_u, hid_i = rng.normal(0, 1, (n_users, 2)), rng.normal(0, 1, (n_items, 2))
    bu, bi = rng.normal(0, 0.4, n_users), rng.normal(0, 0.4, n_items)
    pop = 1 / np.arange(1, n_items + 1)                     # Zipf popularity
    fit = 0.9 * taste @ (tags / tags.sum(1, keepdims=True)).T + 0.8 * hid_u @ hid_i.T / np.sqrt(2)
    seqs = []
    for u in range(n_users):
        p = pop * np.exp(1.5 * fit[u]); p /= p.sum()        # watch popular films you will like
        seqs.append(rng.choice(n_items, max(3, rng.poisson(per_user)), replace=False, p=p))
        for i in seqs[-1]: rng.normal(0, 0.6)               # (the rating noise draw; keeps data identical)
    return seqs, tags

seqs, tags = make_ratings()                                 # each user's films in the order watched
nU, nI = 1000, 1000
train = [s[:-1] for s in seqs]; test_item = np.array([s[-1] for s in seqs])   # leave the LAST play out
print(f"{sum(map(len, seqs)):,} plays; train {sum(map(len, train)):,}, one held-out film per user")

def bpr(train, nI, k=32, lr=0.05, lam=0.01, epochs=20, seed=0):
    rng = np.random.default_rng(seed)
    P = rng.normal(0, 0.1, (len(train), k)); Q = rng.normal(0, 0.1, (nI, k))
    pairs = np.array([(u, i) for u, s in enumerate(train) for i in s])
    played = [set(s) for s in train]
    for _ in range(epochs):
        for u, i in pairs[rng.permutation(len(pairs))]:
            j = rng.integers(nI)
            while j in played[u]: j = rng.integers(nI)  # uniform negative sampling
            x = P[u] @ (Q[i] - Q[j]); g = 1 / (1 + np.exp(x))   # g = 1 - sigma(x)
            P[u], Q[i], Q[j] = (P[u] + lr * (g * (Q[i] - Q[j]) - lam * P[u]),
                                Q[i] + lr * (g * P[u] - lam * Q[i]),
                                Q[j] + lr * (-g * P[u] - lam * Q[j]))
    return P @ Q.T

def evaluate(S, name, K=10):
    S = S.astype(float).copy()
    for u, s in enumerate(train): S[u, s] = -np.inf  # never re-recommend what was played
    top = np.argsort(-S, axis=1)[:, :K]
    rank = np.array([np.where(top[u] == test_item[u])[0][0] + 1 if test_item[u] in top[u] else 0
                     for u in range(nU)])
    hr = (rank &gt; 0).mean(); ndcg = np.mean([1 / np.log2(r + 1) if r else 0 for r in rank])
    cov = len(np.unique(top)) / nI
    print(f"{name:22s} HR@{K} {hr:.3f}  NDCG@{K} {ndcg:.3f}  coverage {cov:.0%}")
    return S

Xtr = np.zeros((nU, nI))
for u, s in enumerate(train): Xtr[u, s] = 1
counts = Xtr.sum(0)
rng = np.random.default_rng(1)
evaluate(rng.random((nU, nI)), "random")
evaluate(np.tile(counts, (nU, 1)) + rng.random((nU, nI)) * 1e-3, "popularity")
S_ib = (Xtr.T @ Xtr) / np.sqrt(np.outer(counts, counts) + 1e-9); np.fill_diagonal(S_ib, 0)
evaluate(Xtr @ S_ib, "item-based CF (cosine)")
def implicit_als(plays, k=16, alpha=5.0, lam=1.0, iters=10, seed=0):   # from the MF note
    rng = np.random.default_rng(seed)
    conf = 1 + alpha * plays
    X = rng.normal(0, 0.1, (plays.shape[0], k)); Y = rng.normal(0, 0.1, (plays.shape[1], k))
    I = np.eye(k)
    for _ in range(iters):
        YtY = Y.T @ Y
        for u in range(plays.shape[0]):
            nz = plays[u] &gt; 0; cu = conf[u, nz]
            X[u] = np.linalg.solve(YtY + Y[nz].T @ ((cu - 1)[:, None] * Y[nz]) + lam * I, Y[nz].T @ cu)
        XtX = X.T @ X
        for i in range(plays.shape[1]):
            nz = plays[:, i] &gt; 0; ci = conf[nz, i]
            Y[i] = np.linalg.solve(XtX + X[nz].T @ ((ci - 1)[:, None] * X[nz]) + lam * I, X[nz].T @ ci)
    return X @ Y.T
evaluate(implicit_als(Xtr), "implicit ALS")
S_bpr = evaluate(bpr(train, nI), "BPR-MF")

# the "sampled metric" shortcut: rank the held-out film against only 100 random unplayed films
def sampled_hr(S, K=10, n_neg=100, seed=0):
    r = np.random.default_rng(seed); hit = []
    for u in range(nU):
        pool = np.setdiff1d(np.arange(nI), np.append(train[u], test_item[u]))
        neg = r.choice(pool, n_neg, replace=False)
        hit.append((S[u, neg] &gt; S[u, test_item[u]]).sum() &lt; K)   # fewer than K negatives beat it
    return np.mean(hit)
S_pop = np.tile(counts, (nU, 1)).astype(float)
print(f"sampled HR@10 (100 negatives): popularity {sampled_hr(S_pop):.3f}   BPR-MF {sampled_hr(S_bpr):.3f}")</div>
  <div class="fx" data-lang="text">50,186 plays; train 49,186, one held-out film per user
random                 HR@10 0.011  NDCG@10 0.004  coverage 100%
popularity             HR@10 0.106  NDCG@10 0.054  coverage 3%
item-based CF (cosine) HR@10 0.159  NDCG@10 0.076  coverage 11%
implicit ALS           HR@10 0.177  NDCG@10 0.096  coverage 34%
BPR-MF                 HR@10 0.180  NDCG@10 0.092  coverage 39%
sampled HR@10 (100 negatives): popularity 0.394   BPR-MF 0.556</div>
  <p>With one held-out film per user, HR@10 is the share of users whose next film was in their top 10, and NDCG@10 additionally rewards putting it high. Random: 0.011 (about 10 in 1,000). Popularity: 0.106, but it shows the same few films to everyone (coverage 3%). Item-based CF 0.159, implicit ALS 0.177 and BPR-MF 0.180 all beat it, and spread their rows over far more of the catalogue (11%, 34%, 39%). The setting <code>S[u, s] = -np.inf</code> removes already-played films before taking the top 10.</p>
  <p>Compare with the CF note, which hid a <em>random</em> film per user on the same data: popularity scored 0.190 there and 0.106 here. A time split is harder and more honest: the next film is usually less popular than the ones already watched, so "recommend the blockbusters" helps less. Implicit ALS beats BPR on NDCG (0.096 vs 0.092) while BPR is slightly ahead on HR; with 1,000 users the two are within noise of each other.</p>
  <p><strong>The sampled-metric trap.</strong> Many papers rank the held-out film against only 100 random unplayed films instead of the whole catalogue. The same models then score 0.394 and 0.556: inflated (popularity looks almost four times better), and not comparable with full-ranking numbers. Worse, sampled metrics can change <em>which</em> model looks best (Krichene and Rendle, 2020). Rank the full catalogue whenever you can.</p>
  <h3>The deeper problem: logs come from the old system</h3>
  <p>Test interactions only exist for films the old system showed (or users found by search). A new model that recommends different films is judged on data that never gave those films a chance, and "no interaction" is treated as "not relevant" even when the film was never seen (missing not at random). Counterfactual (off-policy) evaluation re-weights logged outcomes by 1 / probability the old system showed them (inverse propensity scoring, section 10), which needs the logging policy's probabilities to be recorded.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leave-last-out</strong>: hold out each user's most recent interaction as test. <strong>Full ranking evaluation</strong>: rank all items not seen in training. <strong>Sampled evaluation</strong>: rank the test item among n sampled negatives (biased; avoid or correct). <strong>Off-policy evaluation</strong>: estimating a new policy's online metric from logs of an old policy, e.g. with IPS.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random splits, forgetting to filter training items, sampled metrics, tuning on the test set, and not reporting the popularity baseline. Any one of these can make a weak model look strong.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Online evaluation.</b> Even a careful offline win is an estimate built on the old system's data and on a stand-in target (next play). Does the new ranker actually make real users watch more?</div>

  <h2 id="rk-online"><span class="num">08</span>Online Evaluation: A/B Tests and Interleaving</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Offline metrics are proxies on biased logs. How do we measure, on live users, whether the new ranker really is better, and be sure the difference is not luck?</p>
  </div>
  <p>An <strong>A/B test</strong> randomly splits users: group A sees the old row (control), group B the new ranker (treatment). Randomisation makes the groups alike in everything except the ranker, so a difference in outcomes is caused by the ranker (details in <a class="xref" data-note="st_abtesting">A/B Testing</a> and <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>).</p>
  <h3>By hand</h3>
  <p>20,000 row impressions per group. Control: 1,000 clicks (5.0%). Treatment: 1,100 clicks (5.5%).</p>
  <ul>
    <li>Pooled click rate p = 2,100 / 40,000 = 0.0525.</li>
    <li>Standard error of the difference = √(p(1 − p)(1/20,000 + 1/20,000)) = √(0.0525 × 0.9475 × 0.0001) = √0.00000497 = 0.00223.</li>
    <li>z = (0.055 − 0.050) / 0.00223 = <strong>2.24</strong>; two-sided p-value ≈ 0.025 &lt; 0.05: unlikely to be luck.</li>
    <li>95% interval for the difference (unpooled SE): 0.005 ± 1.96 × 0.00223 = [0.0006, 0.0094], i.e. +0.06 to +0.94 percentage points.</li>
  </ul>
  <div class="fx" data-lang="py"># A/B test: old row (control) vs new ranker (treatment), 20,000 impressions each
from scipy.stats import norm
clicks_a, n_a = 1000, 20000
clicks_b, n_b = 1100, 20000
pa, pb = clicks_a / n_a, clicks_b / n_b
pool = (clicks_a + clicks_b) / (n_a + n_b)
se = np.sqrt(pool * (1 - pool) * (1 / n_a + 1 / n_b))
z = (pb - pa) / se
print(f"CTR A {pa:.3%}  B {pb:.3%}  lift {pb / pa - 1:+.1%}")
print(f"pooled p {pool:.4f}  SE {se:.5f}  z {z:.3f}  two-sided p-value {2 * norm.sf(abs(z)):.4f}")
lo, hi = (pb - pa) - 1.96 * np.sqrt(pa * (1 - pa) / n_a + pb * (1 - pb) / n_b), \\
         (pb - pa) + 1.96 * np.sqrt(pa * (1 - pa) / n_a + pb * (1 - pb) / n_b)
print(f"95% CI for the difference: [{lo:.4f}, {hi:.4f}]")</div>
  <div class="fx" data-lang="text">CTR A 5.000%  B 5.500%  lift +10.0%
pooled p 0.0525  SE 0.00223  z 2.242  two-sided p-value 0.0250
95% CI for the difference: [0.0006, 0.0094]</div>
  <h3>What makes recommender A/B tests tricky</h3>
  <ul>
    <li><strong>Choose the right metric.</strong> Clicks are easy to move (clickbait); the business wants watch time, retention, revenue. Pick one primary metric and several <strong>guardrails</strong> (latency, unsubscribes, diversity, complaints) that must not get worse.</li>
    <li><strong>Novelty effect.</strong> Users click on anything new for the first days; run long enough (often 2+ weeks) to see the settled effect.</li>
    <li><strong>Unit of randomisation.</strong> Randomise users, not requests, so a user sees one consistent system; analyse per user.</li>
    <li><strong>Interference.</strong> Both groups share the same catalogue and stock (and, in marketplaces, the same sellers), so one group's behaviour can affect the other.</li>
    <li><strong>Interleaving.</strong> Show each user one list that mixes the two rankers' results (team-draft: the rankers take turns picking), then count which ranker's films get clicked. Each user compares both, so it needs far fewer users to detect a winner; use it to shortlist, then confirm with a full A/B test.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>A/B test</strong>: a randomised controlled experiment comparing a treatment with a control on a pre-registered primary metric, with a significance test and confidence interval. <strong>Two-proportion z-test</strong>: z = (p̂<sub>B</sub> − p̂<sub>A</sub>) / √(p̂(1 − p̂)(1/n<sub>A</sub> + 1/n<sub>B</sub>)). <strong>Interleaving</strong>: within-user comparison of two rankers via a merged list.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Peeking at the p-value every day and stopping at the first p &lt; 0.05 inflates false positives; fix the sample size in advance (or use sequential methods). And an offline NDCG win that loses the A/B test is not a paradox: logs reflect the old system, clicks are a proxy, and position bias distorts both.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Cold start.</b> Every method so far needs history. A user who signed up a minute ago, or "Chhichhore" released today, has none: no MF vector, no clicks, no place in any row. What do we show them?</div>

  <h2 id="rk-cold"><span class="num">09</span>Cold Start</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Collaborative models learn only from interactions. What do we recommend to a brand-new user, and how does a brand-new film ever get recommended?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new student joins mid-year. The teacher knows nothing yet, so she starts with what works for most students, asks a few questions on day one, and adjusts after the first test. And when a new textbook arrives, she reads its contents before any student has used it.</p>
  </div>
  <table class="tbl">
    <tr><th>Case</th><th>Strategies (from least to most information)</th></tr>
    <tr><td><strong>New user</strong></td><td>popular / trending (by country, language, device); context (time, entry page, referral); onboarding quiz ("pick 3 genres"); fold-in an MF vector after a few plays (<a class="xref" data-note="ml_mf">MF note</a>); session-based models on the first clicks</td></tr>
    <tr><td><strong>New item</strong></td><td>content features → a vector in the same space (content-based, or a two-tower item tower); borrow the mean vector of similar items; reserved exploration slots / bandits until it has data</td></tr>
    <tr><td><strong>New system</strong></td><td>editorial rules and popularity; log impressions from day one; add CF/MF once data exists</td></tr>
  </table>
  <h3>A new film by hand: "Chhichhore"</h3>
  <p>Chhichhore arrives today with tags sports, drama and comedy and no plays (the Basics note already scored it by content: cosine 0.140 to Ben's tag profile). Borrow the factor vectors of known films that share at least two of its tags, from the MF note's hand sliders: Dangal (2, 0), Chak De (2, 0), Lagaan (2, 0.5) and 3 Idiots (1.5, 0.5). Their mean (7.5/4, 1/4) = (1.875, 0.25) becomes Chhichhore's starting vector. Ben (2.5, 0.5) → Chhichhore = 2.5 × 1.875 + 0.5 × 0.25 = 4.6875 + 0.125 = <strong>4.81</strong>: Chhichhore can enter Ben's candidates on day one, and high, because it sits next to the "underdog drama" films he loves. A two-tower model does the same thing with a learned network from title, synopsis, cast and poster instead of a simple average.</p>
  <h3>A new user: a switching hybrid</h3>
  <div class="fx" data-lang="py"># hand factor vectors from the MF note (underdog drama, romance)
q = {"Dangal": np.array([2.0, 0.0]), "Chak De": np.array([2.0, 0.0]), "Lagaan": np.array([2.0, 0.5]),
     "DDLJ": np.array([0.0, 2.0]), "K3G": np.array([0.5, 2.0]), "3 Idiots": np.array([1.5, 0.5])}
tags6 = {"Dangal": {"sports", "drama"}, "Chak De": {"sports", "drama"}, "Lagaan": {"sports", "drama", "romance"},
         "DDLJ": {"romance", "comedy"}, "K3G": {"drama", "romance"}, "3 Idiots": {"drama", "comedy"}}
p_ben = np.array([2.5, 0.5])
# NEW ITEM: "Chhichhore" arrives with no plays, only its tags -&gt; borrow the mean vector of films
# that share at least 2 of its tags
new_tags = {"sports", "drama", "comedy"}
alike = [f for f in q if len(tags6[f] &amp; new_tags) &gt;= 2]
q_new = np.mean([q[f] for f in alike], axis=0)
print("films sharing 2+ tags:", alike)
print("Chhichhore vector from content =", q_new, "  Ben -&gt; Chhichhore =", p_ben @ q_new)

# NEW USER: a hybrid that switches strategy by how much we know
popular = sorted(watchers, key=watchers.get, reverse=True)
def recommend(history, quiz=None, k=3):
    if len(history) &gt;= 2:                         # warm enough: fold-in / CF (here: favourite genre)
        fav = max(set(genre[f] for f in history), key=lambda g: sum(genre[f] == g for f in history))
        cands, src = [f for f in popular if genre[f] == fav], f"history ({fav})"
    elif quiz:                                    # onboarding answers
        cands, src = [f for f in popular if genre[f] in quiz], f"quiz {quiz}"
    else:                                         # nothing known
        cands, src = popular, "popularity"
    out = [f for f in cands + popular if f not in history]
    return src, list(dict.fromkeys(out))[:k]      # de-duplicate, keep order
print("brand-new user:  ", *recommend([]))
print("answered quiz:   ", *recommend([], quiz=["romance"]))
print("two plays later: ", *recommend(["Lagaan", "Dangal"]))</div>
  <div class="fx" data-lang="text">films sharing 2+ tags: ['Dangal', 'Chak De', 'Lagaan', '3 Idiots']
Chhichhore vector from content = [1.875 0.25 ]   Ben -&gt; Chhichhore = 4.8125
brand-new user:   popularity ['Dangal', 'DDLJ', '3 Idiots']
answered quiz:    quiz ['romance'] ['DDLJ', 'K3G', 'Jab We Met']
two plays later:  history (sports) ['Chak De', 'Bhaag Milkha', 'Mary Kom']</div>
  <p>The function switches strategy by what it knows: nothing → the most popular films; quiz answers → popular films in those genres; two plays → films of the favourite genre, topped up from the popular list. <code>dict.fromkeys</code> removes duplicates while keeping order, and already-played films are filtered out. A newcomer (call him Farhan, as in the MF note's fold-in) first sees Dangal, DDLJ, 3 Idiots; after answering "romance" he sees DDLJ, K3G, Jab We Met; after playing Lagaan and Dangal he gets the other sports films Chak De, Bhaag Milkha, Mary Kom. Real systems blend these smoothly (for example weight CF by how many interactions the user has) rather than switching hard.</p>
  <h3>Exploration for new films: a bandit by hand</h3>
  <p>Chhichhore has a content vector, but the ranker has no click data for it. A multi-armed bandit gives uncertain items a bonus. UCB1 scores each film by mean CTR + c√(ln N / n), where n is the film's impressions and N the total. Chhichhore: 2 clicks in 10 shows; Bhaag Milkha: 270 clicks in 1,000 shows; N = 1,010, c = 1. Chhichhore: 0.20 + √(6.918/10) = 0.20 + 0.832 = <strong>1.03</strong>. Bhaag Milkha: 0.27 + √(6.918/1,000) = 0.27 + 0.083 = <strong>0.35</strong>. Chhichhore gets the exploration slot until its uncertainty shrinks. Thompson sampling (draw a CTR from each film's Beta posterior, show the highest draw) does the same job and is common in production.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cold start</strong>: a user, item or whole system with too little interaction history for collaborative methods. <strong>Hybrid recommender</strong>: combines several methods (CF, content, popularity), by switching, weighting or feeding one into another. <strong>Exploration</strong>: deliberately showing uncertain items to learn about them (ε-greedy, UCB, Thompson sampling).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Letting new items enter only through CF: they are never shown, so never clicked, so never get a CF vector. New items need a content path or reserved exploration slots from day one, and new users need a sensible default instead of an empty row.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Popularity bias and feedback loops.</b> Popularity fallbacks, Bhaag Milkha in every row, a ranker trained on what the last ranker showed: does the system slowly train itself to show only what it already shows?</div>

  <h2 id="rk-bias"><span class="num">10</span>Popularity Bias &amp; Feedback Loops</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A recommender learns from clicks, but users can only click what they were shown, and that was chosen by the previous model. What does this do over time, and how do we correct for it?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<defs><marker id="rk-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="120" height="40" class="fb sb"/><text x="70" y="65" text-anchor="middle" font-size="12">Recommend</text>
<rect x="160" y="40" width="120" height="40" class="ft st"/><text x="220" y="65" text-anchor="middle" font-size="12">Users click</text>
<rect x="310" y="40" width="120" height="40" class="fv"/><text x="370" y="65" text-anchor="middle" font-size="12">Log as training</text>
<rect x="440" y="40" width="110" height="40" class="fr sr"/><text x="495" y="65" text-anchor="middle" font-size="12">Retrain</text>
<line x1="132" y1="60" x2="157" y2="60" stroke="currentColor" marker-end="url(#rk-a3)"/>
<line x1="282" y1="60" x2="307" y2="60" stroke="currentColor" marker-end="url(#rk-a3)"/>
<line x1="432" y1="60" x2="437" y2="60" stroke="currentColor" marker-end="url(#rk-a3)"/>
<path d="M495,82 Q495,118 280,118 Q70,118 70,84" fill="none" stroke="currentColor" marker-end="url(#rk-a3)"/>
<text x="280" y="140" text-anchor="middle" class="tm" font-size="11">unshown films get no clicks → never learned → never shown</text>
</svg><figcaption>The model learns from data its own past choices created. Popular films get shown more, so get more clicks, so get shown even more.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bookshop that only puts last month's bestsellers at the front. Other books are never picked up, so never become bestsellers, so never reach the front. A brilliant new author stays on the back shelf forever.</p>
  </div>
  <h3>Simulation</h3>
  <p>CineCity's "new releases" shelf: 50 films with hidden true click probabilities between 5% and 30%. Each round we show 5 films and record clicks. Three strategies, 3,000 rounds each: how many films were ever shown, and how many of the truly best 5 does each end up ranking in its top 5?</p>
  <div class="fx" data-lang="py">def simulate(score, eps, rounds=3000, n=50, seed=1):
    rng = np.random.default_rng(seed)
    appeal = rng.uniform(0.05, 0.3, n)                # true click probability (unknown to us)
    clicks, shows = np.zeros(n), np.zeros(n)
    for _ in range(rounds):
        if rng.random() &lt; eps: slate = rng.choice(n, 5, replace=False)              # explore
        else: slate = np.argsort(-score(clicks, shows) + rng.random(n) * 1e-9)[:5]  # exploit
        shows[slate] += 1
        clicks[slate] += rng.random(5) &lt; appeal[slate]
    top5 = np.argsort(-score(clicks, shows))[:5]
    return (shows &gt; 0).sum(), len(set(top5) &amp; set(np.argsort(-appeal)[:5]))
popularity = lambda c, s: c                           # rank by total clicks
ctr        = lambda c, s: (c + 1) / (s + 5)           # smoothed click rate
for name, f, eps in [("popularity, no explore", popularity, 0.0),
                     ("popularity, 10% explore", popularity, 0.1),
                     ("smoothed CTR, 10% explore", ctr, 0.1)]:
    ever, found = simulate(f, eps)
    print(f"{name:26s} films ever shown {ever:2d}/50   true top-5 found {found}/5")</div>
  <div class="fx" data-lang="text">popularity, no explore     films ever shown 16/50   true top-5 found 0/5
popularity, 10% explore    films ever shown 50/50   true top-5 found 0/5
smoothed CTR, 10% explore  films ever shown 50/50   true top-5 found 3/5</div>
  <p>Ranking by total clicks with no exploration locks onto whatever got lucky early: only 16 films were ever shown and none of the true best 5 were found. Adding 10% random rounds shows every film, but still finds none of the best, because ranking by <em>total</em> clicks always favours films that were shown most; exploration data is drowned. Ranking by smoothed click <em>rate</em> (c + 1)/(s + 5) and exploring 10% finds 3 of the best 5. Both fixes are needed: explore, and correct for exposure.</p>
  <h3>Position bias and inverse propensity scoring</h3>
  <p>Within a row, slot 1 is looked at far more than slot 5, so films shown on top collect clicks just for being on top. Suppose a randomisation test measured the probability of a slot being examined: 0.9, 0.6, 0.4, 0.3, 0.2 for slots 1–5. Bhaag Milkha was shown in slot 1 100 times with 27 clicks (naive CTR 0.27); Swades in slot 5 100 times with 9 clicks (0.09). Weight each click by 1 / P(examined): Bhaag Milkha 0.27 / 0.9 = <strong>0.30</strong>; Swades 0.09 / 0.2 = <strong>0.45</strong>. Once you account for how rarely anyone looked at slot 5, Swades is the more appealing film, the same Swades that retrieval dropped from Ben's row.</p>
  <div class="fx" data-lang="py"># position bias: how likely a user even LOOKS at each slot (measured once by randomising the order)
exam = {1: 0.9, 2: 0.6, 3: 0.4, 4: 0.3, 5: 0.2}
log = {"Bhaag Milkha": (1, 100, 27),   # film: (slot it was shown in, impressions, clicks)
       "Swades":       (5, 100, 9)}
for film, (slot, n, c) in log.items():
    naive = c / n
    ips = sum([1 / exam[slot]] * c) / n          # each click weighted by 1 / P(examined)
    print(f"{film:12s} slot {slot}  naive CTR {naive:.2f}   position-corrected CTR {ips:.2f}")</div>
  <div class="fx" data-lang="text">Bhaag Milkha slot 1  naive CTR 0.27   position-corrected CTR 0.30
Swades       slot 5  naive CTR 0.09   position-corrected CTR 0.45</div>
  <p>This is <strong>inverse propensity scoring</strong> (IPS): weight each logged outcome by 1 / the probability that it was exposed. It is unbiased but high-variance when propensities are tiny (one click at P = 0.01 counts 100 times), so propensities are clipped or the estimate self-normalised.</p>
  <h3>The toolbox</h3>
  <ul>
    <li><strong>Exploration</strong>: ε-greedy slots, UCB, Thompson sampling (section 09).</li>
    <li><strong>Correct for exposure</strong>: rank by rates, not counts; IPS weights in training and off-policy evaluation.</li>
    <li><strong>Position as a feature</strong>: train with the slot as an input, then set it to a fixed value (e.g. slot 1) at serving time, so the model learns appeal separately from position.</li>
    <li><strong>Re-rank</strong> for diversity, long-tail exposure or calibrated genre shares (show genres in the proportions the user actually watches).</li>
    <li><strong>Log impressions</strong>, not only clicks, so you know what was seen and ignored and can compute propensities.</li>
    <li><strong>Monitor</strong> coverage, novelty and the share of slots taken by the top 1% of items over time.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feedback loop</strong>: the model's outputs shape its future training data. <strong>Popularity bias</strong>: popular items are recommended more than their real appeal justifies, and the long tail is ignored. <strong>Position bias</strong>: higher slots get more clicks regardless of relevance. <strong>IPS</strong>: estimate = (1/n) Σ outcome<sub>t</sub> / propensity<sub>t</sub>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling exploration "wasted traffic". Without it the model can never learn about anything it is not already showing, and quality slowly decays. Budget a small share (5–10%), log its propensities, and measure its long-run value.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have followed Ben's row from scores to a live, self-correcting system. How do all these pieces fit into one picture?</div>

  <h2 id="rk-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pipeline, LTR, BPR, eight metrics, offline and online tests, cold start, bias corrections: how does each grow out of the one before?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 340" width="680">
<defs><marker id="rk-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="46" rx="7" class="fb sb"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">scores (MF, CF, content)</text><text x="105" y="46" text-anchor="middle" class="tm" font-size="10">previous notes</text>
<line x1="200" y1="33" x2="233" y2="33" stroke="currentColor" marker-end="url(#rk-a9)"/>
<rect x="235" y="10" width="210" height="46" rx="7" class="fb sb"/><text x="340" y="29" text-anchor="middle" font-size="11.5" font-weight="700">retrieve → rank → re-rank</text><text x="340" y="46" text-anchor="middle" class="tm" font-size="10">Ben: 7 → 5 → row; Swades lost</text>
<line x1="445" y1="33" x2="478" y2="33" stroke="currentColor" marker-end="url(#rk-a9)"/>
<rect x="480" y="10" width="190" height="46" rx="7" class="ft st"/><text x="575" y="29" text-anchor="middle" font-size="11.5" font-weight="700">LTR losses &amp; BPR</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">pairs, |ΔNDCG|, ln σ(x_uij)</text>
<line x1="340" y1="56" x2="340" y2="90" stroke="currentColor" marker-end="url(#rk-a9)"/><line x1="575" y1="56" x2="420" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#rk-a9)"/>
<rect x="150" y="92" width="380" height="46" rx="7" class="fg sg"/><text x="340" y="111" text-anchor="middle" font-size="11.5" font-weight="700">a row + what the user watched next</text><text x="340" y="128" text-anchor="middle" class="tm" font-size="10">hits = row ∩ relevant: Ben {Lagaan @2, Mary Kom @4}</text>
<line x1="210" y1="138" x2="100" y2="172" stroke="currentColor" marker-end="url(#rk-a9)"/><line x1="340" y1="138" x2="340" y2="172" stroke="currentColor" marker-end="url(#rk-a9)"/><line x1="470" y1="138" x2="575" y2="172" stroke="currentColor" marker-end="url(#rk-a9)"/>
<rect x="10" y="174" width="190" height="46" rx="7" class="fv"/><text x="105" y="193" text-anchor="middle" font-size="11.5" font-weight="700">count: P@k, R@k, HR</text><text x="105" y="210" text-anchor="middle" class="tm" font-size="10">0.40, 0.67, yes</text>
<rect x="235" y="174" width="210" height="46" rx="7" class="fv"/><text x="340" y="193" text-anchor="middle" font-size="11.5" font-weight="700">+ position, grade: AP, RR, NDCG</text><text x="340" y="210" text-anchor="middle" class="tm" font-size="10">0.333, 0.5, 0.578</text>
<rect x="480" y="174" width="190" height="46" rx="7" class="fv"/><text x="575" y="193" text-anchor="middle" font-size="11.5" font-weight="700">across rows: coverage, ILD, novelty</text><text x="575" y="210" text-anchor="middle" class="tm" font-size="10">90%, 0.7, 1.99 bits</text>
<line x1="340" y1="220" x2="340" y2="254" stroke="currentColor" marker-end="url(#rk-a9)"/>
<rect x="150" y="256" width="380" height="36" rx="7" class="ft st"/><text x="340" y="279" text-anchor="middle" font-size="11.5">offline protocol (time split, full ranking, popularity baseline) → online A/B</text>
<line x1="230" y1="292" x2="150" y2="306" stroke="currentColor" marker-end="url(#rk-a9)"/><line x1="450" y1="292" x2="530" y2="306" stroke="currentColor" marker-end="url(#rk-a9)"/>
<rect x="10" y="308" width="300" height="28" rx="7" class="fr sr"/><text x="160" y="327" text-anchor="middle" font-size="10.5">no history → cold start: popularity, content vector, bandits</text>
<rect x="370" y="308" width="300" height="28" rx="7" class="fr sr"/><text x="520" y="327" text-anchor="middle" font-size="10.5">logs biased by own choices → exploration, IPS</text>
</svg><figcaption>Scores become a row through the pipeline; LTR and BPR train the stages to order. The row plus the user's next actions gives hits; counting hits gives precision and recall, weighting them by position and grade gives AP, RR and NDCG, and looking across rows gives coverage, diversity and novelty. An honest protocol and an A/B test turn these into decisions, while cold start and bias corrections keep the data that feeds everything healthy.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Ben's row, the five friends and the simulated CineCity</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our number</th><th>Order-aware?</th><th>Use when</th></tr>
    <tr><td>3-stage pipeline</td><td>cheap score → rich score → rules</td><td>how to serve fast?</td><td>7 → 5 → row; retrieval recall 2/3</td><td>—</td><td>any large catalogue</td></tr>
    <tr><td>Pointwise loss</td><td>log loss per item</td><td>train a ranker simply</td><td>0.581</td><td>no</td><td>default, calibrated scores needed</td></tr>
    <tr><td>Pairwise (RankNet)</td><td>sigmoid of score difference</td><td>train order directly</td><td>0.848 for Lagaan &lt; Bhaag Milkha</td><td>pairs</td><td>implicit preferences</td></tr>
    <tr><td>LambdaMART</td><td>pair gradient × |ΔNDCG|</td><td>focus on the top</td><td>0.226 vs 0.307; NDCG 0.838</td><td>yes</td><td>GBM rankers, per-user shifts</td></tr>
    <tr><td>BPR</td><td>pairwise loss on MF scores</td><td>order from plays only</td><td>Chak De vs Lagaan: −0.25 → 0.49 (a false negative)</td><td>pairs (AUC)</td><td>implicit MF</td></tr>
    <tr><td>P@k / R@k / HR</td><td>hits ∩ top k</td><td>how many good items?</td><td>0.40 / 0.667 / 0.80</td><td>no</td><td>simple dashboards</td></tr>
    <tr><td>AP / MAP</td><td>precision at each hit</td><td>early hits?</td><td>0.333 / 0.432</td><td>yes</td><td>binary relevance</td></tr>
    <tr><td>RR / MRR</td><td>1 / first hit rank</td><td>first good item?</td><td>0.5 / 0.45</td><td>yes</td><td>one-answer tasks</td></tr>
    <tr><td>NDCG</td><td>gain / log₂(pos + 1), normalised</td><td>early and strong hits?</td><td>0.578 graded (0.498 binary)</td><td>yes, graded</td><td>standard ranking metric</td></tr>
    <tr><td>Coverage / ILD / novelty</td><td>union of rows; pair dissimilarity; −log₂ pop</td><td>catalogue, variety, discovery</td><td>90% / 0.7 / 1.99</td><td>no</td><td>guardrails</td></tr>
    <tr><td>Offline protocol</td><td>time split + full ranking + baselines</td><td>honest estimate?</td><td>HR@10 random .011 / popularity .106 / BPR .180</td><td>—</td><td>before every launch</td></tr>
    <tr><td>A/B test</td><td>randomisation + z-test</td><td>real effect?</td><td>z = 2.24, p = 0.025</td><td>—</td><td>final decision</td></tr>
    <tr><td>Cold start</td><td>popularity, content vectors, bandits</td><td>no history?</td><td>Ben → Chhichhore 4.81; UCB 1.03</td><td>—</td><td>new users/items</td></tr>
    <tr><td>Bias correction</td><td>exploration, rates, IPS</td><td>self-made data?</td><td>0/5 → 3/5; Swades 0.45</td><td>—</td><td>every live system</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a recommender is judged by the short ordered row it shows, so train for order, measure the row with position-aware metrics plus guardrails, prove it online, and protect the data the row itself creates.</strong></p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Side by side: which metric and which LTR style to pick for which job?</div>

  <h2 id="rk-compare"><span class="num">12</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Faced with a real recommender, which metric do we report and which ranking loss do we train?</p>
  </div>
  <table class="tbl"><caption>Metrics</caption>
    <tr><th>Metric</th><th>Question</th><th>Order-aware</th><th>Graded</th><th>Range</th><th>Ben</th><th>Watch out</th></tr>
    <tr><td>RMSE (MF note)</td><td>how close are predicted stars?</td><td>no</td><td>yes</td><td>0 → ∞, lower better</td><td>—</td><td>says little about top-k</td></tr>
    <tr><td>Precision@k</td><td>share of shown that is good</td><td>no</td><td>no</td><td>0–1</td><td>0.40</td><td>ceiling |Rel|/k</td></tr>
    <tr><td>Recall@k</td><td>share of good that is shown</td><td>no</td><td>no</td><td>0–1</td><td>0.667</td><td>grows with k</td></tr>
    <tr><td>Hit rate@k</td><td>any good item shown?</td><td>no</td><td>no</td><td>0/1 per user</td><td>1</td><td>coarse</td></tr>
    <tr><td>AP / MAP</td><td>good items early?</td><td>yes</td><td>no</td><td>0–1</td><td>0.333</td><td>denominator varies</td></tr>
    <tr><td>MRR</td><td>first good item early?</td><td>yes (first only)</td><td>no</td><td>0–1</td><td>0.5</td><td>ignores later hits</td></tr>
    <tr><td>NDCG@k</td><td>strong items early?</td><td>yes</td><td>yes</td><td>0–1</td><td>0.578</td><td>gain/denominator conventions</td></tr>
    <tr><td>AUC (per user)</td><td>positives above negatives?</td><td>pairs, position-blind</td><td>no</td><td>0.5 random – 1</td><td>—</td><td>bottom pairs count as much as top</td></tr>
    <tr><td>Coverage / diversity / novelty</td><td>healthy catalogue and rows?</td><td>no</td><td>—</td><td>0–1 / 0–1 / bits</td><td>— / 0.7 / 1.99</td><td>random scores high</td></tr>
  </table>
  <table class="tbl"><caption>Learning-to-rank styles</caption>
    <tr><th></th><th>Pointwise</th><th>Pairwise</th><th>Listwise</th></tr>
    <tr><td>Example unit</td><td>one item</td><td>(better, worse) pair</td><td>a whole list</td></tr>
    <tr><td>Loss</td><td>log loss / MSE</td><td>RankNet, hinge (RankSVM), BPR</td><td>ListNet, LambdaRank/LambdaMART, softmax CE</td></tr>
    <tr><td>Matches the goal</td><td>loosely</td><td>order, but position-blind</td><td>top-of-list quality</td></tr>
    <tr><td>Calibrated probabilities</td><td>yes (useful for ads, mixing objectives)</td><td>no</td><td>no</td></tr>
    <tr><td>Per-user shifts</td><td>hurt (0.714)</td><td>cancel</td><td>cancel (0.838)</td></tr>
    <tr><td>Tools</td><td>any classifier, LGBMClassifier</td><td>BPR-MF, RankNet</td><td>LGBMRanker, XGBoost rank:ndcg</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> What goes wrong most often?</div>

  <h2 id="rk-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors make a ranking system look good on paper and fail in front of users?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging retrieval and ranking together</span>
    <p>Swades was lost at retrieval; no ranker could help. Measure candidate recall separately from ranking NDCG.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: random train/test split</span>
    <p>It trains on a user's future. Use a time split or leave-last-out, and filter training items from the candidate list.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sampled metrics</span>
    <p>Ranking against 100 negatives inflated BPR-MF's HR@10 from 0.180 to 0.556 (popularity from 0.106 to 0.394) and can reorder models. Rank the full catalogue.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no popularity baseline</span>
    <p>Popularity scored about 10× random on the simulated CineCity; many published "improvements" lose to a well-tuned popularity or item-kNN baseline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mixing metric definitions</span>
    <p>AP denominators and NDCG gains differ between tools; binary and graded NDCG even reversed Ben and Chen. State the definition.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: accuracy only</span>
    <p>Bhaag Milkha in every row and Dia's all-sports row look fine on NDCG. Track coverage, diversity and novelty as guardrails.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting offline wins</span>
    <p>Logs reflect the old system and position bias; ship only after an A/B test on the business metric, run long enough to pass the novelty effect, without peeking.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no cold-start or exploration path</span>
    <p>New films never shown never get data. Content vectors, exploration slots and logged propensities from day one.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note condensed for quick review.</div>

  <h2 id="rk-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: CineCity's 10-film catalogue (sports: Dangal 600, Chak De 400, Bhaag Milkha 300, Lagaan 250, Mary Kom 150 watchers per 1,000; romance: DDLJ 500, K3G 350, Jab We Met 200; drama: 3 Idiots 450, Swades 100). Ben has rated Dangal 5, Chak De 5, DDLJ 2; next week he watched Lagaan (3), Mary Kom (2), Swades (1). At scale: the simulated 1,000 × 1,000 CineCity, each user's last film held out.</p>
  <table class="tbl"><caption>The five rows and their metrics (k = 5)</caption>
    <tr><th>User</th><th>Row</th><th>Relevant (grade)</th><th>P@5</th><th>R@5</th><th>AP@5</th><th>RR</th><th>NDCG@5 graded</th><th>ILD</th><th>Novelty</th></tr>
    <tr><td>Asha</td><td>Lagaan, Bhaag Milkha, Swades, Jab We Met, Mary Kom</td><td>Lagaan (3)</td><td>0.20</td><td>1.00</td><td>1.000</td><td>1.00</td><td>1.000</td><td>0.7</td><td>2.424</td></tr>
    <tr><td>Ben</td><td>Bhaag Milkha, Lagaan, 3 Idiots, Mary Kom, Jab We Met</td><td>Lagaan (3), Mary Kom (2), Swades (1)</td><td>0.40</td><td>0.667</td><td>0.333</td><td>0.50</td><td>0.578</td><td>0.7</td><td>1.990</td></tr>
    <tr><td>Chen</td><td>Bhaag Milkha, 3 Idiots, Chak De, Jab We Met, Swades</td><td>Jab We Met (3), Swades (1)</td><td>0.40</td><td>1.00</td><td>0.325</td><td>0.25</td><td>0.462</td><td>0.8</td><td>1.971</td></tr>
    <tr><td>Dia</td><td>Bhaag Milkha, Dangal, Swades, Lagaan, Mary Kom</td><td>Jab We Met (2)</td><td>0.00</td><td>0.00</td><td>0.000</td><td>0.00</td><td>0.000</td><td>0.4</td><td>2.107</td></tr>
    <tr><td>Esha</td><td>Bhaag Milkha, Chak De, Mary Kom, Swades, DDLJ</td><td>Chak De (3)</td><td>0.20</td><td>1.00</td><td>0.500</td><td>0.50</td><td>0.631</td><td>0.7</td><td>2.024</td></tr>
    <tr><td colspan="3"><strong>Mean</strong> (HR@5 0.80, coverage 90%)</td><td>0.24</td><td>0.733</td><td>MAP 0.432</td><td>MRR 0.45</td><td>0.534</td><td></td><td></td></tr>
  </table>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>Pipeline</td><td>scores → row, fast?</td><td>7 → 5 → ranked → genre rule</td><td>how is the ranker trained?</td></tr>
    <tr><td>LTR</td><td>which loss teaches order?</td><td>pointwise 0.581; pair 0.848; |ΔNDCG| 0.226/0.307</td><td>implicit data has no negatives</td></tr>
    <tr><td>BPR</td><td>order from plays?</td><td>Chak De vs K3G g = 0.06; vs Lagaan −0.25 → 0.49</td><td>how good is a row?</td></tr>
    <tr><td>P@k, R@k, HR</td><td>how many hits?</td><td>0.40, 0.667, 0.80</td><td>position ignored</td></tr>
    <tr><td>AP, RR, NDCG</td><td>early, strong hits?</td><td>0.333, 0.5, 0.578</td><td>same safe films everywhere</td></tr>
    <tr><td>Beyond accuracy</td><td>catalogue and variety?</td><td>90%, 0.7, 1.99 bits</td><td>how to evaluate on logs?</td></tr>
    <tr><td>Offline protocol</td><td>honest estimate?</td><td>HR@10 .011 / .106 / CF .159 / iALS .177 / BPR .180</td><td>logs biased, proxy target</td></tr>
    <tr><td>A/B test</td><td>real effect?</td><td>z 2.24, p 0.025</td><td>needs history</td></tr>
    <tr><td>Cold start</td><td>no history?</td><td>Chhichhore (1.875, 0.25) → 4.81; UCB 1.03 vs 0.35</td><td>self-reinforcing data</td></tr>
    <tr><td>Bias &amp; loops</td><td>is data distorted?</td><td>0/5 vs 3/5; Swades 0.09 → 0.45</td><td>(end of group)</td></tr>
  </table>
  <h3>Definitions</h3>
  <div class="cards">
    <div><b>Retrieval / ranking / re-ranking</b><p>Cheap high-recall candidate selection, then a rich model to order the candidates, then rules for diversity, freshness and business goals.</p><small>A ranker cannot recover what retrieval dropped</small></div>
    <div><b>Learning to rank</b><p>Training a scorer so that sorting gives good lists: pointwise (per item), pairwise (per ordered pair), listwise (per list, e.g. LambdaMART).</p><small>LGBMRanker needs group sizes</small></div>
    <div><b>BPR</b><p>Pairwise loss −ln σ(x<sub>ui</sub> − x<sub>uj</sub>) on (played, unplayed) triples with MF scores; a smoothed per-user AUC.</p><small>Negatives are sampled</small></div>
    <div><b>Order-aware metrics</b><p>AP averages precision at each hit; RR uses the first hit; NDCG sums graded gains discounted by log₂(pos + 1), divided by the ideal.</p><small>State gain and denominator</small></div>
    <div><b>Beyond-accuracy</b><p>Coverage of the catalogue, intra-list diversity, novelty (−log₂ popularity), serendipity, personalisation.</p><small>Guardrails, not goals</small></div>
    <div><b>Offline vs online</b><p>Offline: time split, full ranking, baselines, on logged data. Online: randomised A/B test or interleaving on the business metric.</p><small>Offline wins can vanish online</small></div>
    <div><b>Cold start</b><p>Too little history for collaborative methods: popularity, context, onboarding, fold-in, content vectors, two-tower, exploration.</p><small>Plan it from day one</small></div>
    <div><b>Feedback loop / IPS</b><p>The model's choices create its training data; correct with exploration, rates instead of counts, and inverse propensity weights.</p><small>Log impressions and propensities</small></div>
  </div>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Pointwise log loss</td><td>−[y ln p + (1 − y) ln(1 − p)]</td><td>y clicked; p predicted probability</td></tr>
    <tr><td>RankNet</td><td>ln(1 + e<sup>−(s<sub>i</sub> − s<sub>j</sub>)</sup>)</td><td>i should rank above j; s scores</td></tr>
    <tr><td>LambdaRank weight</td><td>λ<sub>ij</sub> = |ΔNDCG<sub>ij</sub>| / (1 + e<sup>s<sub>i</sub> − s<sub>j</sub></sup>)</td><td>ΔNDCG of swapping i and j</td></tr>
    <tr><td>BPR</td><td>−ln σ(p<sub>u</sub>·q<sub>i</sub> − p<sub>u</sub>·q<sub>j</sub>) + λ‖Θ‖²; g = 1 − σ</td><td>i played, j sampled unplayed</td></tr>
    <tr><td>P@k, R@k</td><td>|top-k ∩ Rel| / k, |top-k ∩ Rel| / |Rel|</td><td>Rel relevant set</td></tr>
    <tr><td>AP@k</td><td>Σ<sub>hits</sub> P@pos / min(|Rel|, k)</td><td>pos position of each hit</td></tr>
    <tr><td>RR</td><td>1 / rank of first hit</td><td>0 if none</td></tr>
    <tr><td>NDCG@k</td><td>Σ gain<sub>pos</sub>/log₂(pos + 1) ÷ ideal</td><td>gain = grade (or 2<sup>grade</sup> − 1)</td></tr>
    <tr><td>Novelty</td><td>mean of −log₂ pop(i)</td><td>pop share of users who used i</td></tr>
    <tr><td>Two-proportion z</td><td>(p̂<sub>B</sub> − p̂<sub>A</sub>) / √(p̂(1 − p̂)(1/n<sub>A</sub> + 1/n<sub>B</sub>))</td><td>p̂ pooled rate</td></tr>
    <tr><td>UCB1</td><td>mean + c√(ln N / n)</td><td>n item's shows; N total</td></tr>
    <tr><td>IPS</td><td>(1/n) Σ outcome / propensity</td><td>propensity = P(shown/examined)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>NDCG@k</b><p>Default for ranked lists, especially with grades (ratings, watch time buckets).</p><small>Not for "one answer" tasks: MRR</small></div>
    <div><b>Recall@k at retrieval</b><p>For candidate generators with large k (100–1,000).</p><small>Order inside the candidates does not matter yet</small></div>
    <div><b>Pointwise LTR</b><p>When you need calibrated probabilities (ads, mixing objectives) or a quick strong baseline.</p><small>Weak under per-user shifts</small></div>
    <div><b>LambdaMART / BPR</b><p>When order is the goal; BPR for implicit MF, LambdaMART for feature-based rankers.</p><small>Keep groups intact</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Retrieval misses blamed on the ranker; random splits; unfiltered training items; sampled metrics; missing popularity baseline; mixed metric definitions; accuracy-only dashboards; trusting offline wins or peeking at A/B tests; no cold-start or exploration path; ranking by raw counts.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Row hits at positions 2 and 4, 3 relevant. AP@5?</td><td>(1/2 + 2/4)/3 = 0.333</td></tr>
    <tr><td>Binary hits at 2 and 4, 3 relevant. NDCG@5?</td><td>(0.631 + 0.431)/(1 + 0.631 + 0.5) = 0.498</td></tr>
    <tr><td>First hit at rank 4. RR?</td><td>0.25</td></tr>
    <tr><td>BPR: x<sub>ui</sub> = 5, x<sub>uj</sub> = 5.25. Loss?</td><td>−ln σ(−0.25) = 0.826</td></tr>
    <tr><td>Slot-5 examination 0.2, CTR there 0.09. Corrected CTR?</td><td>0.09 / 0.2 = 0.45</td></tr>
  </table>

  <h2 id="rk-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why do large recommenders use retrieval, ranking and re-ranking stages?</summary><div class="qa-body">Scoring millions of items per request with a rich model is far too slow (10<sup>8</sup> × 0.1 ms = 10,000 s). Retrieval cheaply narrows to hundreds or thousands with high recall (embeddings + ANN, CF, rules); ranking spends rich features on those for precision; re-ranking applies diversity, freshness and business rules. Each stage is measured with its own metric (recall@K for retrieval, NDCG for ranking).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pointwise, pairwise and listwise learning to rank: what is the difference and when does it matter?</summary><div class="qa-body">Pointwise scores each item alone (log loss), pairwise learns which of two items should be higher (RankNet, BPR), listwise optimises a list measure (LambdaMART weights pair gradients by |ΔNDCG|). With clean features they were close (0.837–0.843 NDCG@5); with a per-user feature shift pointwise fell to 0.714 while LambdaMART stayed at 0.838, because listwise only compares items within a user.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain BPR and do one update.</summary><div class="qa-body">Assume played &gt; unplayed; sample (u, i, j); minimise −ln σ(x<sub>ui</sub> − x<sub>uj</sub>) + λ‖Θ‖² with MF scores. With g = 1 − σ: p<sub>u</sub> += η(g(q<sub>i</sub> − q<sub>j</sub>) − λp<sub>u</sub>), q<sub>i</sub> += η(g p<sub>u</sub> − λq<sub>i</sub>), q<sub>j</sub> += η(−g p<sub>u</sub> − λq<sub>j</sub>). Ben/Chak De/Lagaan with the MF note's hand vectors: gap −0.25, loss 0.826 → gap 0.49, loss 0.477; with K3G as the negative the pair is already right (g = 0.06) and almost nothing moves. It maximises a smoothed per-user AUC, and its sampled negatives can be false negatives (Ben went on to love Lagaan).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Row [Bhaag Milkha, Lagaan, 3 Idiots, Mary Kom, Jab We Met]; relevant Lagaan (3), Mary Kom (2), Swades (1). Compute P@5, R@5, AP@5, RR, NDCG@5.</summary><div class="qa-body">Hits at 2 and 4. P@5 = 0.40; R@5 = 0.667; AP@5 = (1/2 + 2/4)/3 = 0.333; RR = 0.5; graded NDCG@5 = (3 × 0.631 + 2 × 0.431)/(3 + 2 × 0.631 + 0.5) = 2.754/4.762 = 0.578 (binary 0.498).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use MRR instead of NDCG?</summary><div class="qa-body">When one good result is enough and later ones barely matter: "play something now", search for a known title, question answering. MRR looks only at the first hit; NDCG rewards every hit by position and grade, which suits browsing rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why track coverage, diversity and novelty if they are not accuracy?</summary><div class="qa-body">Accuracy metrics are satisfied by showing everyone the same safe blockbusters (Bhaag Milkha took 5 of 25 slots; Dia's row was four sports films, ILD 0.4). Coverage (90%), intra-list diversity (Ben 0.7) and novelty (Ben 1.99 bits) reveal a narrowing system, user boredom and an ignored long tail, which hurt retention and suppliers over time. They are guardrails traded off against NDCG.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe a sound offline evaluation protocol for a recommender.</summary><div class="qa-body">Time-based split or leave-last-out; rank the full catalogue minus training items; report HR/recall@k, NDCG@k and beyond-accuracy metrics; compare with random and popularity baselines; tune on a validation period, report on a later test period. On the simulated CineCity with each user's last film held out: random 0.011, popularity 0.106, item-CF 0.159, implicit ALS 0.177, BPR-MF 0.180 HR@10. Avoid sampled negatives (they inflated 0.180 to 0.556).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Control CTR 5.0%, treatment 5.5%, 20,000 impressions each. Significant?</summary><div class="qa-body">Pooled p = 0.0525; SE = √(0.0525 × 0.9475 × 2/20,000) = 0.00223; z = 0.005/0.00223 = 2.24; p ≈ 0.025, so yes at 5%. 95% CI for the difference ≈ [0.06, 0.94] percentage points. Also check guardrails and the novelty effect before shipping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model wins offline on NDCG but loses the A/B test. Possible reasons?</summary><div class="qa-body">Logs only contain what the old system showed (selection bias); clicks are a proxy for the business metric; position bias in the logs; less diversity bores users; leakage or a random split offline; sampled metrics; a novelty effect favouring the old system's habits; latency added by the new model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a brand-new film and a brand-new user?</summary><div class="qa-body">Film: a vector from content (mean of similar films, e.g. Chhichhore (1.875, 0.25) from Dangal, Chak De, Lagaan and 3 Idiots → Ben 4.81, or a two-tower item tower) and guaranteed exploration (UCB: Chhichhore 0.20 + 0.83 = 1.03 beats Bhaag Milkha 0.35). User: popularity by context, an onboarding quiz, then fold-in an MF vector after a few interactions; blend toward CF as history grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a feedback loop in recommenders and how do you mitigate it?</summary><div class="qa-body">The model trains on clicks its own recommendations caused, so shown items gain clicks and unshown ones are never learned. In simulation, rank-by-clicks showed 16 of 50 films and found 0 of the best 5; exploration alone still found 0 (counts drown it); smoothed rates + 10% exploration found 3. Mitigate with exploration, rates or IPS instead of counts, position-aware training, diversity re-ranking, and logging impressions and propensities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do NDCG and BPR relate to ROC AUC from classification metrics?</summary><div class="qa-body">Per-user AUC is the share of (relevant, irrelevant) pairs ordered correctly; BPR optimises a smooth version of it, and RankNet is the same pairwise idea. AUC is position-blind: a mistake at the bottom counts as much as at the top. NDCG (and LambdaMART, which scales pair gradients by |ΔNDCG|) concentrates on the top positions users actually see. See <a class="xref" data-note="ml_evaluation">Classification Metrics</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note use the MF note?</summary><div class="qa-body">MF (or a two-tower model) supplies the retrieval scores and embeddings searched with ANN; BPR is MF trained with a pairwise ranking loss instead of squared error; fold-in solves the warm-up of new users; the RMSE used in MF is replaced by ranking metrics because users see lists. See <a class="xref" data-note="ml_mf">Matrix Factorization</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is this the place where A/B testing enters the ML track?</summary><div class="qa-body">Recommenders act on users and change the data they later learn from, so offline metrics on logs cannot settle whether a change is better. Only a randomised experiment isolates the causal effect on the business metric. The statistics (z-test, power, sample size, peeking) are in <a class="xref" data-note="st_abtesting">A/B Testing</a>.</div></details>
</main>
`
});
