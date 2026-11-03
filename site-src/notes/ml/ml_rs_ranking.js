// notes/ml/ml_rs_ranking.js — Ranking, Evaluation & Cold Start
Object.assign(TOPIC_CONTENT, {
  "ml_rs_ranking": `<main>
<h1>Ranking, Evaluation &amp; Cold Start</h1>
  <div class="where"><span>Machine Learning</span><span>Recommendation Systems</span><span>Ranking, Evaluation &amp; Cold Start</span></div>
  <p class="lead">The earlier notes in this group produced a score for every (user, film) pair. But nobody sees scores: a person sees a short ordered row of films on a screen, chosen in about a tenth of a second from a catalogue of millions. This note covers everything between the score and the screen: how real systems build that row in stages, how models are trained to get the <em>order</em> right rather than each number, how to measure the quality of a ranked list, how to evaluate honestly offline and then with live users, what to show people and films that have no history yet, and how a deployed recommender distorts the very data it learns from. These are the questions interviewers ask most about recommenders, because they decide whether a good model actually helps users. The running example is still CineCity: we follow one row, Ben's Friday-night row, from start to finish, using the five friends and films from the earlier notes plus four more films from CineCity's catalogue, and we use the simulated 1,000 × 1,000 CineCity when we need realistic numbers.</p>

  <h2 id="rk-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ranking, Evaluation &amp; Cold Start</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Building the row</div>
        <ul>
          <li><b>Retrieval</b> (cheap, high recall) → <b>ranking</b> (rich model) → <b>re-ranking</b> (rules)</li>
          <li>A ranker cannot recover what retrieval dropped</li>
          <li><b>Learning to rank</b>: pointwise, pairwise (RankNet, BPR), listwise (LambdaMART)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measuring a row</div>
        <ul>
          <li>P@k, R@k, hit rate: count hits</li>
          <li>MAP, MRR, <b>NDCG</b>: reward early and strong hits</li>
          <li>Coverage, diversity, novelty: guardrails beyond accuracy</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Evaluating honestly</div>
        <ul>
          <li>Offline: time split, full-catalogue ranking, beat popularity</li>
          <li>Sampled metrics inflate (0.180 → 0.556)</li>
          <li>Online: A/B test (z-test), guardrails, interleaving</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cold start and loops</div>
        <ul>
          <li>New user: popularity → onboarding → fold-in</li>
          <li>New item: content vector, two-tower, exploration (UCB)</li>
          <li>Feedback loops and position bias: explore, rates not counts, IPS</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rk-pipe"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Retrieval, Ranking, Re-ranking</span><span class="rm-sub">building Ben's row in three stages</span></div></div>
      <div class="rm-item rm-done" data-target="rk-ltr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Learning to Rank</span><span class="rm-sub">pointwise, pairwise and listwise losses</span></div></div>
      <div class="rm-item rm-done" data-target="rk-bpr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Bayesian Personalized Ranking</span><span class="rm-sub">learning order from plays only</span></div></div>
      <div class="rm-item rm-done" data-target="rk-prec"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Precision, Recall and Hit Rate</span><span class="rm-sub">counting the good films in a row</span></div></div>
      <div class="rm-item rm-done" data-target="rk-order"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">MAP, MRR and NDCG</span><span class="rm-sub">metrics where position matters</span></div></div>
      <div class="rm-item rm-done" data-target="rk-beyond"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Coverage, Diversity and Novelty</span><span class="rm-sub">what accuracy cannot see</span></div></div>
      <div class="rm-item rm-done" data-target="rk-offline"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Offline Evaluation</span><span class="rm-sub">splits, baselines, the sampled-metric trap</span></div></div>
      <div class="rm-item rm-done" data-target="rk-online"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Online Evaluation</span><span class="rm-sub">A/B tests and interleaving</span></div></div>
      <div class="rm-item rm-done" data-target="rk-cold"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Cold Start</span><span class="rm-sub">new users, new films, exploration</span></div></div>
      <div class="rm-item rm-done" data-target="rk-bias"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Popularity Bias and Feedback Loops</span><span class="rm-sub">when the system shapes its own data</span></div></div>
      <div class="rm-item rm-done" data-target="rk-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">leaks, sampled metrics, no baseline</span></div></div>
      <div class="rm-item rm-done" data-target="rk-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">metrics table, formulas, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="rk-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on ranking</span></div></div>
    </div>
  </div>

  <h2 id="rk-pipe"><span class="num">01</span>Retrieval, Ranking, Re-ranking</h2>
  <p>Matrix factorization gives a score for every (user, film) pair. A real catalogue has millions of films, a request must be answered in about 100 milliseconds, and the screen has a handful of slots. The question for this section is how we get from "a score for everything" to "this row, now".</p>
  <p>First the running example. The earlier notes used the six films the five friends rated. CineCity's catalogue has four more films that other members rated, so a trained model has vectors for them too: Bhaag Milkha Bhaag (written "Bhaag Milkha"), Mary Kom, Jab We Met and Swades. Each film gets one main genre (sports, romance or drama) and a popularity, the number of CineCity's 1,000 members who watched it last month. Each friend has already seen the films they rated. To be able to judge rows later, we also write down what each friend actually watched in the following week, with a grade: 3 = loved, 2 = liked, 1 = ok.</p>
  <table class="tbl">
    <tr><th>Film</th><th>Genre</th><th>Watchers / 1,000</th><th>Film</th><th>Genre</th><th>Watchers / 1,000</th></tr>
    <tr><td>Dangal</td><td>sports</td><td>600</td><td>Bhaag Milkha</td><td>sports</td><td>300</td></tr>
    <tr><td>DDLJ</td><td>romance</td><td>500</td><td>Lagaan</td><td>sports</td><td>250</td></tr>
    <tr><td>3 Idiots</td><td>drama</td><td>450</td><td>Jab We Met</td><td>romance</td><td>200</td></tr>
    <tr><td>Chak De</td><td>sports</td><td>400</td><td>Mary Kom</td><td>sports</td><td>150</td></tr>
    <tr><td>K3G</td><td>romance</td><td>350</td><td>Swades</td><td>drama</td><td>100</td></tr>
  </table>
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
  <p>Ben has rated Dangal, Chak De and DDLJ, so he has seven unseen films: the three open films from the earlier notes (Lagaan, K3G, 3 Idiots) plus the four new ones. Next week he watched Lagaan (grade 3, loved), Mary Kom (2) and Swades (1); Lagaan is the film that content-based filtering, collaborative filtering and matrix factorization all ranked near the top for him.</p>
  <p>Why not simply score all films with the best possible model? A rich ranking model with hundreds of features might take 0.1 ms per film; with 100 million films that is 10⁸ × 0.1 ms = 10,000 seconds per request. A dot product of two 64-number vectors, on the other hand, is about a hundred multiply-adds and can be searched with an index. So the work is split into stages, each seeing fewer items and spending more on each. <strong>Retrieval</strong> (or candidate generation) is a fast stage that selects a few hundred to a few thousand items likely to be relevant; its job is not to miss good items, so it is judged by recall. <strong>Ranking</strong> is a slower, feature-rich model that orders those candidates precisely. <strong>Re-ranking</strong> adjusts the final list for goals the ranker does not model: diversity, freshness, business rules. Think of hiring: HR skims 10,000 CVs in seconds each, managers interview 50, and a final panel picks 5 with the team's balance in mind. The skim must not throw away good people; the panel must get the order right.</p>
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
  <p>Reading the figure left to right: a catalogue of millions is cut to about a thousand candidates by cheap vector search over MF or two-tower embeddings; a gradient-boosted or neural ranker orders those; and rules shape the final row. Now Ben's row by hand. Stage 1 keeps the five unseen films with the highest biased-MF predictions (the three open films carry the MF note's numbers, 3 Idiots 4.76, Lagaan 4.62, K3G 1.77; the four new films get theirs from the same model trained on all members). Stage 2 is a richer model that uses popularity, recency, "it is Friday night" and past clicks to estimate the probability that Ben watches each candidate tonight. Stage 3 applies one rule: at most two films of the same genre in the top three.</p>
  <table class="tbl">
    <tr><th>Film</th><th>1. Retrieval score (MF)</th><th>kept?</th><th>2. Ranker P(watch tonight)</th><th>ranked</th><th>3. Final row</th></tr>
    <tr><td>3 Idiots</td><td>4.76</td><td>yes</td><td>0.30</td><td>4</td><td>3 (pulled up)</td></tr>
    <tr><td>Lagaan</td><td>4.62</td><td>yes</td><td>0.55</td><td>2</td><td>2</td></tr>
    <tr><td>Bhaag Milkha</td><td>4.5</td><td>yes</td><td>0.62</td><td>1</td><td>1</td></tr>
    <tr><td>Mary Kom</td><td>4.4</td><td>yes</td><td>0.48</td><td>3</td><td>4 (pushed down)</td></tr>
    <tr><td>Jab We Met</td><td>2.6</td><td>yes</td><td>0.22</td><td>5</td><td>5</td></tr>
    <tr><td>Swades</td><td>2.4</td><td>no</td><td>—</td><td>—</td><td>—</td></tr>
    <tr><td>K3G</td><td>1.77</td><td>no</td><td>—</td><td>—</td><td>—</td></tr>
  </table>
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
  <p>The ranker moves the trending Bhaag Milkha to the top and drops 3 Idiots to fourth. The re-ranking rule then sees three sports films (Bhaag Milkha, Lagaan, Mary Kom) in the top three, so Mary Kom slips below 3 Idiots. The function <code>rerank</code> walks down the ranked list and takes the first film that does not break the genre rule; once the top three are filled, any film is allowed. The last printed line is the most important lesson of this section: Ben went on to watch Swades, but it was dropped at retrieval (MF score 2.4, sixth of seven), so no ranker or re-ranker could ever show it. Retrieval recall for Ben is 2 of 3. A great ranker cannot fix a bad retriever, which is why retrieval recall is measured separately and real systems merge several retrieval sources (embeddings, item-item CF, "trending", "continue watching") so one blind spot does not empty the row.</p>
  <p>At catalogue scale the same three stages look like this, with 100,000 films and 16-number embeddings. Retrieval is one matrix–vector product plus <code>np.argpartition</code>, which finds the 1,000 largest scores without sorting all 100,000 (linear time instead of n log n); in production it is an approximate nearest-neighbour index such as FAISS, ScaNN or HNSW (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>) that only searches promising regions of the vector space.</p>
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
  <p>The ranking score adds a freshness bonus 2e<sup>−age/30</sup> to the similarity, a stand-in for a heavy model, computed only on the 1,000 candidates. Before re-ranking, genres 4 and 1 each held three of the top 10; after capping each genre at two, no genre has more than two.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Goal</th><th>Typical tools</th><th>Measured by</th></tr>
    <tr><td>Retrieval</td><td>do not miss good items</td><td>two-tower or MF embeddings + ANN, item-item CF, trending lists; several sources merged</td><td>recall@1000 of the candidates</td></tr>
    <tr><td>Ranking</td><td>order the candidates precisely</td><td>LightGBM (LambdaMART) or deep models with user, item, context and cross features</td><td>NDCG@k, per-user AUC</td></tr>
    <tr><td>Re-ranking</td><td>business and user goals</td><td>diversity (MMR), freshness, de-duplication, sponsored slots, fairness, boosts for new items</td><td>diversity, coverage, guardrails</td></tr>
  </table>

  <h2 id="rk-ltr"><span class="num">02</span>Learning to Rank</h2>
  <p>The ranker's probabilities above were simply given. How is a ranking model trained so that it gets the order right? Training a scoring function so that sorting by it gives good lists is called <strong>learning to rank</strong> (LTR), and there are three families of loss. Here is the data for one example: Ben was shown five films and clicked Lagaan and Mary Kom (y = 1); he skipped Bhaag Milkha, 3 Idiots and Jab We Met (y = 0). The ranker's current probabilities p, and their logits s = ln(p/(1 − p)), which serve as scores, are:</p>
  <table class="tbl">
    <tr><th>Film</th><th>clicked y</th><th>p</th><th>score s</th><th>pointwise loss −[y ln p + (1 − y) ln(1 − p)]</th></tr>
    <tr><td>Bhaag Milkha</td><td>0</td><td>0.62</td><td>0.490</td><td>−ln 0.38 = 0.968</td></tr>
    <tr><td>Lagaan</td><td>1</td><td>0.55</td><td>0.201</td><td>−ln 0.55 = 0.598</td></tr>
    <tr><td>Mary Kom</td><td>1</td><td>0.48</td><td>−0.080</td><td>−ln 0.48 = 0.734</td></tr>
    <tr><td>3 Idiots</td><td>0</td><td>0.30</td><td>−0.847</td><td>−ln 0.70 = 0.357</td></tr>
    <tr><td>Jab We Met</td><td>0</td><td>0.22</td><td>−1.266</td><td>−ln 0.78 = 0.248</td></tr>
  </table>
  <p>A <strong>pointwise</strong> loss treats each film as a separate example: an ordinary classification ("clicked?") or regression ("what grade?"), here the log loss averaged over the five films, 2.905/5 = 0.581. It is the simplest and most common approach, and any classifier works, but it does not directly care about order. A <strong>pairwise</strong> loss turns each (clicked, not clicked) pair into an example and learns that the clicked film should score higher. The classic one is the <strong>RankNet</strong> loss ln(1 + e<sup>−(s<sub>i</sub> − s<sub>j</sub>)</sup>) for a pair where i should rank above j: small when s<sub>i</sub> is well above s<sub>j</sub>, large when it is below. Ben's data gives 2 × 3 = 6 pairs:</p>
  <table class="tbl">
    <tr><th>Pair (should be above)</th><th>s<sub>i</sub> − s<sub>j</sub></th><th>RankNet loss</th></tr>
    <tr><td>Lagaan &gt; Bhaag Milkha</td><td>0.201 − 0.490 = −0.289</td><td>ln(1 + e<sup>0.289</sup>) = 0.848 (wrong order)</td></tr>
    <tr><td>Lagaan &gt; 3 Idiots</td><td>+1.048</td><td>0.301</td></tr>
    <tr><td>Lagaan &gt; Jab We Met</td><td>+1.466</td><td>0.208</td></tr>
    <tr><td>Mary Kom &gt; Bhaag Milkha</td><td>−0.570</td><td>1.018 (wrong order)</td></tr>
    <tr><td>Mary Kom &gt; 3 Idiots</td><td>+0.767</td><td>0.381</td></tr>
    <tr><td>Mary Kom &gt; Jab We Met</td><td>+1.186</td><td>0.267</td></tr>
  </table>
  <p>The two biggest losses are exactly the two mis-ordered pairs, both involving Bhaag Milkha. A pairwise model does not care whether Bhaag Milkha's probability is "right", only that it should sit below the films Ben chose. That fits implicit feedback well: we do not know Bhaag Milkha is bad, only that Ben preferred two other films at that moment.</p>
  <p>A <strong>listwise</strong> loss treats the whole list as one example. <strong>ListNet</strong> turns the scores into "probability of being ranked first" with a softmax, e<sup>s</sup>/Σe<sup>s</sup>: e<sup>s</sup> = 1.632, 1.223, 0.923, 0.429, 0.282 (sum 4.489), giving 0.364, 0.272, 0.206, 0.096, 0.063. The target spreads probability equally over the clicked films (0.5 each), and the loss is the cross-entropy −0.5 ln 0.272 − 0.5 ln 0.206 = 1.441. <strong>LambdaRank</strong>, and its tree version <strong>LambdaMART</strong>, keep the pairwise gradient but multiply it by how much swapping the pair would change NDCG, a list metric explained in section 05 that rewards relevant items near the top. With binary relevance the current order (Bhaag Milkha, Lagaan, Mary Kom, 3 Idiots, Jab We Met) has DCG = 1/log₂3 + 1/log₂4 = 1.131 against an ideal of 1.631. Swapping Lagaan (position 2) with Bhaag Milkha (position 1) raises DCG to 1.5, a change |ΔNDCG| = 0.226; swapping Mary Kom (position 3) with Bhaag Milkha raises it to 1.631, |ΔNDCG| = 0.307. The RankNet gradient sizes for the two pairs, 1/(1 + e<sup>s<sub>i</sub>−s<sub>j</sub></sup>), are 0.572 and 0.639, so the "lambdas" are 0.572 × 0.226 = 0.129 and 0.639 × 0.307 = 0.196. The pair whose fix helps the top of the list more gets the bigger push.</p>
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
  <p>The code reproduces every hand number: mean log loss 0.581, the six RankNet losses with 0.848 and 1.018 for the two wrong pairs, the softmax and cross-entropy 1.441, and the two |ΔNDCG| values 0.226 and 0.307.</p>
  <p>Does the choice of loss matter in practice? We generate 400 synthetic users with 20 candidates each and a grade from 0 to 3 for each candidate, train on 300 users and test on 100, and compare two pointwise LightGBM models with LightGBM's LambdaMART ranker (<a class="xref" data-note="ml_lightgbm">LightGBM</a>). <code>LGBMRanker(objective="lambdarank")</code> needs a <code>group</code> argument, the number of rows per user in order, so it knows which rows compete with each other. We run everything twice: once with clean features, and once where feature 0 also carries a per-user shift that moves all of a user's candidates together, like "how active is this user today", or the user bias b<sub>u</sub> inside a biased-MF prediction.</p>
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
  <p>With clean features the three models are close (NDCG@5 between 0.837 and 0.843): pointwise is a strong, simple default. With the per-user shift the pointwise models drop to 0.725 and 0.714 while LambdaMART stays at 0.838. A pointwise model must explain absolute labels, so a shift that changes every candidate of a user equally confuses it; a listwise model only compares candidates within the same user, so such shifts cancel out. Random order scores 0.311, a reminder to always report a baseline. One practical warning: never shuffle rows or split one user's candidates across train and test, and pass correct group sizes, or the ranker compares films that were never shown together. Pointwise still has one advantage: it produces calibrated probabilities, which matter when scores are mixed with other objectives, as in ads.</p>

  <h2 id="rk-bpr"><span class="num">03</span>Bayesian Personalized Ranking</h2>
  <p>Learning to rank needs negatives: films that were shown and skipped. Often we only have plays, where every logged item is a positive and nothing is a recorded dislike. How can a factor model learn order from that? <strong>Bayesian Personalized Ranking</strong> (BPR, Rendle and colleagues, 2009) makes one assumption: a user prefers a film they played, i, over a film they did not play, j. Each training step samples a triple (u, i, j), with j drawn from the user's unplayed films, and pushes up the score gap x<sub>uij</sub> = x<sub>ui</sub> − x<sub>uj</sub>, where x<sub>ui</sub> = p<sub>u</sub>·q<sub>i</sub> is the matrix-factorization score. The loss is −ln σ(x<sub>uij</sub>) + λ‖Θ‖², where σ is the sigmoid and Θ all the parameters; it is the RankNet idea applied to MF scores. Think of a sommelier who is never told "this wine is a 7"; she is only told "the guest chose this one over that one", again and again, and learns to put the chosen kind of wine ahead.</p>
  <p>Since the derivative of ln σ(x) is 1 − σ(x), write g = 1 − σ(x<sub>uij</sub>). The SGD updates are p<sub>u</sub> += η(g(q<sub>i</sub> − q<sub>j</sub>) − λp<sub>u</sub>), q<sub>i</sub> += η(g·p<sub>u</sub> − λq<sub>i</sub>) and q<sub>j</sub> += η(−g·p<sub>u</sub> − λq<sub>j</sub>). When the pair is already well ordered, σ ≈ 1 and g ≈ 0, so nothing moves: effort goes to the mistakes. One step by hand, with Ben's hand vector from the MF note, p = (2.5, 0.5), who played Chak De, q<sub>i</sub> = (2, 0), with η = 0.1 and λ = 0.01. We try two different sampled negatives to see what the sampler can hand us:</p>
  <table class="tbl">
    <tr><th>Step</th><th>j = K3G (0.5, 2)</th><th>j = Lagaan (2, 0.5)</th></tr>
    <tr><td>x<sub>ui</sub>, x<sub>uj</sub></td><td>5, 1.25 + 1 = 2.25</td><td>5, 5 + 0.25 = 5.25</td></tr>
    <tr><td>x<sub>uij</sub>, σ, loss</td><td>2.75, 0.9399, 0.0620</td><td>−0.25, 0.4378, 0.8259</td></tr>
    <tr><td>g = 1 − σ</td><td>0.0601 (almost nothing to fix)</td><td>0.5622</td></tr>
    <tr><td>new p<sub>u</sub></td><td>(2.5065, 0.4875)</td><td>(2.4975, 0.4714)</td></tr>
    <tr><td>after one step</td><td>gap 2.86, loss 0.056</td><td>gap 0.49, loss 0.477</td></tr>
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
  <p>With K3G, a romance Ben would not enjoy, the pair is already well ordered: σ ≈ 0.94, g ≈ 0.06, and the step barely changes anything. With Lagaan the model sees a "mistake" (Lagaan scores above the played Chak De), pushes hard (g ≈ 0.56), and one step moves the gap from −0.25 to +0.49 and the loss from 0.826 to 0.477, moving Lagaan <em>away</em> from Ben. But Lagaan is exactly the film Ben went on to love. It was unplayed because he had not got to it yet, not because he disliked it. This is the price of BPR's assumption: some sampled negatives are <strong>false negatives</strong>. Over thousands of triples the true signal wins on average, but it is why unplayed films must never be read as dislikes.</p>
  <p>What does BPR optimise? The fraction of (played, unplayed) pairs that a user's scores put in the right order is that user's <strong>AUC</strong>, the probability that a random positive outranks a random negative (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>). BPR maximises a smooth version of it, with ln σ in place of a 0/1 step. Its weakness is AUC's weakness: every pair counts the same, wherever it sits in the list, while users only see the top. Uniformly sampled negatives are also mostly obscure films that are easy to beat, so learning slows; practical variants sample harder negatives (popular unplayed films, or the model's own top-ranked mistakes, as in WARP). Section 07 trains full BPR-MF on the simulated CineCity.</p>

  <h2 id="rk-prec"><span class="num">04</span>Precision, Recall and Hit Rate</h2>
  <p>We can now produce rows. RMSE judged predicted stars, but users see a row of k films, so we need numbers that judge a row. Treat the films each user actually watched next week as <strong>relevant</strong> and count how many made it into the top k of their row. Here are all five rows, Ben's from section 01 and the others built the same way, never including a film the user already rated (✓ marks a hit):</p>
  <table class="tbl">
    <tr><th>User</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>relevant</th></tr>
    <tr><td>Asha</td><td>Lagaan ✓</td><td>Bhaag Milkha</td><td>Swades</td><td>Jab We Met</td><td>Mary Kom</td><td>Lagaan</td></tr>
    <tr><td>Ben</td><td>Bhaag Milkha</td><td>Lagaan ✓</td><td>3 Idiots</td><td>Mary Kom ✓</td><td>Jab We Met</td><td>Lagaan, Mary Kom, Swades</td></tr>
    <tr><td>Chen</td><td>Bhaag Milkha</td><td>3 Idiots</td><td>Chak De</td><td>Jab We Met ✓</td><td>Swades ✓</td><td>Jab We Met, Swades</td></tr>
    <tr><td>Dia</td><td>Bhaag Milkha</td><td>Dangal</td><td>Swades</td><td>Lagaan</td><td>Mary Kom</td><td>Jab We Met</td></tr>
    <tr><td>Esha</td><td>Bhaag Milkha</td><td>Chak De ✓</td><td>Mary Kom</td><td>Swades</td><td>DDLJ</td><td>Chak De</td></tr>
  </table>
  <p><strong>Precision@k</strong> is the number of hits in the top k divided by k: "how much of what I showed was good?" For Ben, P@3 = 1/3 = 0.333 and P@5 = 2/5 = 0.40. <strong>Recall@k</strong> is the number of hits in the top k divided by the number of relevant films: "how much of what was good did I show?" For Ben, 2/3 = 0.667; Swades was missed because it was lost at retrieval. <strong>Hit rate@k</strong> is 1 if the top k contains at least one relevant film and 0 otherwise, averaged over users: Asha, Ben, Chen and Esha have a hit and Dia does not, so 4/5 = 0.80. Think of fishing with a net of size k: precision is the share of your catch that is the fish you wanted, recall is the share of the wanted fish in the lake that you caught, and a bigger net raises recall and usually lowers precision.</p>
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
  <p>Asha's and Esha's recall is perfect (one of one) while their precision@5 is only 0.20: with a single relevant film, precision@5 can never exceed 1/5, so precision has a ceiling of |relevant|/k that differs from user to user. Dia scores zero on everything: her only relevant film, Jab We Met, never appeared, and her row is four sports films although she rated Chak De 1. Averaged over the five users, P@5 is 0.24 and R@5 is 0.733. All three metrics share one blind spot: they do not notice where in the row the hit sits. Ben's Lagaan at slot 2 counts the same as it would at slot 5, although users mostly look at the first slots.</p>

  <h2 id="rk-order"><span class="num">05</span>MAP, MRR and NDCG</h2>
  <p>We want metrics that reward a row for putting the best films first. <strong>Average precision</strong> (AP) walks down the row and, at every hit, writes down the precision so far; it then averages those numbers over min(|relevant|, k). For Ben the hits are at positions 2 (precision so far 1/2) and 4 (2/4), so AP@5 = (0.5 + 0.5)/min(3, 5) = 0.333. Asha's single hit is at position 1, so her AP is 1.0; Chen's hits at 4 and 5 give (1/4 + 2/5)/2 = 0.325; Dia's is 0; Esha's hit at 2 gives 0.5. <strong>MAP</strong>, mean average precision, is the average over users: (1 + 0.333 + 0.325 + 0 + 0.5)/5 = 0.432.</p>
  <p>When one good result is enough, as in "play something now" or a search for a known title, only the first hit matters. The <strong>reciprocal rank</strong> is 1 divided by the position of the first hit: Asha 1, Ben 1/2, Chen 1/4, Dia 0, Esha 1/2. <strong>MRR</strong>, the mean reciprocal rank, is (1 + 0.5 + 0.25 + 0 + 0.5)/5 = 0.45.</p>
  <p><strong>NDCG</strong>, normalised discounted cumulative gain, is the standard ranking metric because it handles both position and grades. Each hit contributes a <em>gain</em> (1 for binary relevance, or its grade) divided by log₂(position + 1), so slot 1 counts fully, slot 2 counts 0.631, slot 4 0.431 and slot 5 0.387. Summing gives the DCG; dividing by the best possible DCG (all relevant films in the top slots, best grade first) normalises it to between 0 and 1. Think of a newspaper: a big story on the front page is worth more than the same story on page 5, and a front page full of minor stories is worth less than one with the big story.</p>
  <table class="tbl">
    <tr><th>pos</th><th>Ben's film</th><th>hit?</th><th>grade</th><th>discount 1/log₂(pos + 1)</th></tr>
    <tr><td>1</td><td>Bhaag Milkha</td><td>no</td><td>0</td><td>1.000</td></tr>
    <tr><td>2</td><td>Lagaan</td><td>yes</td><td>3</td><td>0.631</td></tr>
    <tr><td>3</td><td>3 Idiots</td><td>no</td><td>0</td><td>0.500</td></tr>
    <tr><td>4</td><td>Mary Kom</td><td>yes</td><td>2</td><td>0.431</td></tr>
    <tr><td>5</td><td>Jab We Met</td><td>no</td><td>0</td><td>0.387</td></tr>
  </table>
  <p>Binary NDCG@5 for Ben: DCG = 0.631 + 0.431 = 1.062, ideal = 1 + 0.631 + 0.5 = 2.131, NDCG = 0.498. Graded: DCG = 3 × 0.631 + 2 × 0.431 = 2.754, and the ideal order of grades 3, 2, 1 gives 3 + 2 × 0.631 + 1 × 0.5 = 4.762, so NDCG = 0.578. For Chen, binary NDCG is (0.431 + 0.387)/1.631 = 0.501 but graded is (3 × 0.431 + 1 × 0.387)/(3 + 0.631) = 0.462.</p>
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
  <p>The code matches every hand number, and the from-scratch NDCG equals scikit-learn's <code>ndcg_score</code> (0.578), which takes true grades and scores over the whole catalogue with linear gains. Notice the reversal between Ben and Chen: binary NDCG says Chen's row (0.501) is slightly better than Ben's (0.498), but graded NDCG says Ben's is much better (0.578 against 0.462), because Ben's loved film sits at slot 2 while Chen's loved film sits at slot 4. Grades can change conclusions. Definitions also vary between libraries and papers: AP's denominator may be |relevant|, min(|relevant|, k) or the number of hits; NDCG's gain may be the grade or 2<sup>grade</sup> − 1, which rewards top grades even more; and users with no relevant items are handled differently. Numbers from two tools are often not comparable, so always state the exact definition.</p>

  <h2 id="rk-beyond"><span class="num">06</span>Coverage, Diversity and Novelty</h2>
  <p>Every metric so far would be happy if every user got the same few safe films, as long as some were watched. Bhaag Milkha is already in all five rows, and Dia's row is four sports films. Accuracy metrics look at one user and one row at a time; a second family looks at the system as a whole. <strong>Catalogue coverage</strong> is the share of the catalogue that appears in at least one row. <strong>Intra-list diversity</strong> (ILD) is the average dissimilarity over pairs of films in one row; here "dissimilar" means a different main genre. <strong>Novelty</strong> measures how unknown the shown films are, as the average self-information −log₂(popularity), so a film watched by half the members contributes 1 bit and one watched by 10% contributes 3.3 bits. <strong>Serendipity</strong> means relevant <em>and</em> unexpected, for example a relevant film outside the genres the user already watches; it is hard to measure offline and is usually approximated as relevance × unexpectedness. Think of a restaurant that only serves its bestseller: each plate might get good reviews, but regulars get bored, most of the kitchen's dishes are never ordered, and nobody discovers the chef's best work.</p>
  <p>By hand for Ben: his row has 10 pairs, of which three are same-genre (Bhaag Milkha–Lagaan, Bhaag Milkha–Mary Kom, Lagaan–Mary Kom), so ILD = 7/10 = 0.7. His novelty is the mean of −log₂ 0.3 = 1.737 (Bhaag Milkha), 2.000 (Lagaan), 1.152 (3 Idiots), 2.737 (Mary Kom) and 2.322 (Jab We Met), which is 1.990 bits.</p>
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
  <p>Our rows show 9 of the 10 films (90% coverage); K3G is never shown, and Bhaag Milkha alone takes 5 of the 25 slots. Asha's row has the highest novelty (2.424 bits) because she has already seen the five most popular films, so her row is made of rarer ones. Chen's row is the least novel (1.971) but the most varied (0.8); Dia's is the least varied (0.4). These numbers do not say which row is better; they say what kind of system we are running, and they tend to move against accuracy when a model leans on popular films. They are guardrails reported next to NDCG, not goals by themselves: random rows have perfect coverage and high novelty. To choose the trade-off explicitly, re-rank with <strong>MMR</strong> (maximal marginal relevance), which picks films one at a time by score minus λ times their similarity to the films already chosen.</p>

  <h2 id="rk-offline"><span class="num">07</span>Offline Evaluation</h2>
  <p>So far the "next week" truth was hand-made. With real interaction logs, a protocol is needed that gives honest numbers before a model meets any user. It has four parts. Split by <strong>time</strong>: train on everything before a cut-off and test on what happened after, or, per user, <strong>leave-last-out</strong>, holding out each user's most recent interaction; a random split lets the model learn from a user's future to predict their past (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>). <strong>Rank the full catalogue</strong> for each test user, minus what they already interacted with in training. Compute list metrics and beyond-accuracy metrics on those rows. And compare with <strong>baselines</strong>: random and, above all, most-popular, which is shockingly hard to beat on many datasets.</p>
  <p>We apply this to the simulated CineCity from the earlier notes, treating every rating as a play, with the order in which the simulator drew each user's films as their viewing order (people start with popular films they will like and reach rarer ones later). We hold out each user's last film, train on the other 49,186 plays, and compare random, popularity, item-based CF from <a class="xref" data-note="ml_cf">Collaborative Filtering</a>, implicit ALS from <a class="xref" data-note="ml_mf">Matrix Factorization</a>, and BPR-MF. With one held-out film per user, HR@10 is the share of users whose next film is in their top 10, and NDCG@10 also rewards placing it high. At the end we try the shortcut many papers use: ranking the held-out film against only 100 random unplayed films instead of the whole catalogue.</p>
  <div class="fx" data-lang="py"># the simulated CineCity from the previous notes: 1,000 users x 1,000 films, every rating = a play
df, tags, hidden = make_ratings()                           # the simulator from the Basics note
seqs = [g.item.values for _, g in df.groupby("user")]       # each user's films in the order watched
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
X_als, Y_als = implicit_als(Xtr, k=16, alpha=5.0, lam=1.0, iters=10)   # from the MF note
evaluate(X_als @ Y_als.T, "implicit ALS")
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
  <p>Random scores 0.011, about 10 in 1,000. Popularity scores 0.106, but it shows the same few films to everyone (coverage 3%). Item-based CF (0.159), implicit ALS (0.177) and BPR-MF (0.180) all beat it, and spread their rows over far more of the catalogue (11%, 34% and 39%). Implicit ALS is slightly ahead on NDCG (0.096 against 0.092) while BPR is slightly ahead on HR; with 1,000 users the two are within noise of each other. The line <code>S[u, s] = -np.inf</code> inside <code>evaluate</code> removes already-played films before taking the top 10.</p>
  <p>Compare this with the CF note, which hid a <em>random</em> film per user on the same data: popularity scored 0.190 there and only 0.106 here. A time split is harder and more honest, because a user's next film is usually less popular than the ones already watched, so "recommend the blockbusters" helps less. The last line shows the <strong>sampled-metric trap</strong>: ranking against 100 sampled negatives gives 0.394 for popularity and 0.556 for BPR-MF, inflated numbers that are not comparable with full-ranking ones and can even change which model looks best (Krichene and Rendle, 2020). Rank the full catalogue whenever you can.</p>
  <p>There is a deeper problem that no split fixes. Test interactions exist only for films the old system chose to show (or that users found by search). A new model that recommends different films is judged on data that never gave those films a chance, and "no interaction" is read as "not relevant" even when the film was never seen: the logs are missing not at random. <strong>Off-policy</strong> (counterfactual) evaluation re-weights logged outcomes by 1 over the probability that the old system showed them, the inverse propensity scoring of section 10, which requires the old system's probabilities to have been logged.</p>

  <h2 id="rk-online"><span class="num">08</span>Online Evaluation</h2>
  <p>Offline metrics are proxies computed on biased logs. To know whether a new ranker really makes people watch more, we must test it on live users. An <strong>A/B test</strong> randomly splits users into two groups: group A (control) sees rows from the old ranker and group B (treatment) from the new one. Because the split is random, the groups are alike in everything except the ranker, so a difference in outcomes is caused by the ranker (<a class="xref" data-note="st_abtesting">A/B Testing</a>, <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>). Think of a clinical trial: patients are assigned a drug or a placebo by coin flip, so any difference in recovery is due to the drug.</p>
  <p>By hand: 20,000 row impressions per group; control gets 1,000 clicks (5.0%) and treatment 1,100 (5.5%). Is the 0.5-point difference real or luck? The <strong>two-proportion z-test</strong> compares it with its standard error. The pooled click rate is p = 2,100/40,000 = 0.0525. The standard error of the difference is √(p(1 − p)(1/20,000 + 1/20,000)) = √(0.0525 × 0.9475 × 0.0001) = 0.00223. So z = (0.055 − 0.050)/0.00223 = 2.24, and the two-sided p-value is about 0.025, below 0.05: unlikely to be luck. The 95% confidence interval for the difference, 0.005 ± 1.96 × 0.00223, runs from +0.06 to +0.94 percentage points.</p>
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
  <p>The code confirms z = 2.242, p = 0.025 and the interval [0.0006, 0.0094]. Recommender A/B tests have their own pitfalls. Choose the metric carefully: clicks are easy to move with clickbait, while the business wants watch time, retention or revenue, so pick one primary metric and several <strong>guardrails</strong> (latency, unsubscribes, diversity, complaints) that must not get worse. Beware the <strong>novelty effect</strong>: users click on anything new for the first days, so run the test long enough, often two weeks or more. Randomise <em>users</em>, not requests, so each person sees one consistent system. Do not peek at the p-value every day and stop at the first p &lt; 0.05, which inflates false positives; fix the sample size in advance or use sequential methods. And expect interference: both groups share the same catalogue and stock, so one group's behaviour can affect the other.</p>
  <p><strong>Interleaving</strong> is a faster alternative for comparing two rankers. Each user sees one list that mixes the two rankers' results (in team-draft interleaving the rankers take turns picking their next film), and we count whose films get clicked. Because every user compares both rankers directly, far fewer users are needed to detect a winner; it is used to shortlist candidates before a full A/B test. Finally, an offline NDCG win that loses the A/B test is not a paradox: the logs reflect the old system, clicks are a proxy, and position bias distorts both.</p>

  <h2 id="rk-cold"><span class="num">09</span>Cold Start</h2>
  <p>Every collaborative method needs history. A user who signed up a minute ago, or "Chhichhore" released today, has none: no MF vector, no clicks, no place in any row. This is the <strong>cold-start problem</strong>, and it appears in three forms: a new user, a new item, and a whole new system. Think of a new student joining mid-year: the teacher knows nothing yet, so she starts with what works for most students, asks a few questions on day one and adjusts after the first test; and when a new textbook arrives she reads its contents before any student has used it.</p>
  <table class="tbl">
    <tr><th>Case</th><th>Strategies, from least to most information</th></tr>
    <tr><td>New user</td><td>popular or trending films (by country, language, device); context (time, entry page, referral); an onboarding quiz ("pick 3 genres"); fold-in an MF vector after a few plays; session-based models on the first clicks</td></tr>
    <tr><td>New item</td><td>content features → a vector in the same space (content-based, or a two-tower item tower); borrow the mean vector of similar items; reserved exploration slots until it has data</td></tr>
    <tr><td>New system</td><td>editorial rules and popularity; log impressions from day one; add CF and MF once data exists</td></tr>
  </table>
  <p>A new film by hand. Chhichhore arrives with tags sports, drama and comedy and no plays (the Basics note already scored it by content: cosine 0.140 to Ben's tag profile). We borrow the factor vectors, from the MF note's hand sliders, of the known films that share at least two of its tags: Dangal (2, 0), Chak De (2, 0), Lagaan (2, 0.5) and 3 Idiots (1.5, 0.5). Their mean, (1.875, 0.25), becomes Chhichhore's starting vector, and Ben → Chhichhore = 2.5 × 1.875 + 0.5 × 0.25 = 4.81. Chhichhore can enter Ben's candidates on day one, and high, because it sits next to the underdog dramas he loves. A two-tower model does the same thing with a learned network on title, synopsis, cast and poster instead of a simple average. For new users, a <strong>switching hybrid</strong> changes strategy as it learns more:</p>
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
  <p>With nothing known, the function shows the most popular films (Dangal, DDLJ, 3 Idiots). After the onboarding answer "romance" it shows popular romances (DDLJ, K3G, Jab We Met). After two plays, Lagaan and Dangal, it switches to the favourite genre and shows the other sports films (Chak De, Bhaag Milkha, Mary Kom). <code>dict.fromkeys</code> removes duplicates while keeping order, and played films are filtered out. Real systems blend these smoothly, weighting the collaborative score by how many interactions the user has, rather than switching hard.</p>
  <p>A content vector gets a new film into the candidates, but the ranker still has no click data for it, so it will rarely be shown, and without being shown it will never get clicks. The way out is deliberate <strong>exploration</strong>: showing uncertain items to learn about them. A <strong>multi-armed bandit</strong> gives uncertain items a bonus; the classic rule, UCB1 (upper confidence bound), scores each film by its mean click-through rate plus c√(ln N/n), where n is the film's number of impressions and N the total. By hand: Chhichhore has 2 clicks in 10 shows, Bhaag Milkha 270 clicks in 1,000, N = 1,010 and c = 1. Chhichhore scores 0.20 + √(6.918/10) = 0.20 + 0.832 = 1.03; Bhaag Milkha scores 0.27 + √(6.918/1,000) = 0.27 + 0.083 = 0.35. Chhichhore gets the exploration slot until its uncertainty shrinks. <strong>Thompson sampling</strong>, which draws a click rate from each film's Beta posterior and shows the highest draw, does the same job and is common in production. Simpler still is <strong>ε-greedy</strong>: show a random film in a small fraction ε of slots.</p>

  <h2 id="rk-bias"><span class="num">10</span>Popularity Bias and Feedback Loops</h2>
  <p>A recommender learns from clicks, but users can only click what they were shown, and what they were shown was chosen by the previous model. Its own outputs shape its future training data; this is a <strong>feedback loop</strong>. Think of a bookshop that only puts last month's bestsellers at the front: other books are never picked up, so never become bestsellers, so never reach the front, and a brilliant new author stays on the back shelf forever.</p>
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
  <p>Follow the arrows: recommendations lead to clicks, clicks are logged as training data, the model is retrained, and the retrained model recommends again. The return arrow is the problem: a film that is never shown gets no clicks, so the model never learns it is good, so it is never shown. The result is <strong>popularity bias</strong>, where popular items are recommended more than their real appeal justifies and the long tail is ignored. A small simulation of CineCity's "new releases" shelf makes it concrete: 50 films with hidden true click probabilities between 5% and 30%. Each round we show 5 films and record clicks, for 3,000 rounds, under three strategies, and then ask how many films were ever shown and how many of the truly best 5 each strategy ends up ranking in its top 5:</p>
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
  <p>Ranking by total clicks with no exploration locks onto whatever got lucky early: only 16 of the 50 films were ever shown, and none of the true best five were found. Adding 10% random rounds shows every film, but still finds none of the best, because ranking by <em>total</em> clicks always favours the films that were shown most, so the exploration data is drowned. Ranking by the smoothed click <em>rate</em> (c + 1)/(s + 5) while exploring 10% of the time finds three of the best five. Both fixes are needed: explore, and correct for exposure.</p>
  <p>Exposure bias also exists inside a single row. Slot 1 is looked at far more than slot 5, so films shown at the top collect clicks just for being at the top; this is <strong>position bias</strong>. Suppose a test that randomised the order measured the probability of a slot being looked at as 0.9, 0.6, 0.4, 0.3 and 0.2 for slots 1 to 5. Bhaag Milkha was shown in slot 1 100 times with 27 clicks (naive click rate 0.27); Swades was shown in slot 5 100 times with 9 clicks (0.09). <strong>Inverse propensity scoring</strong> (IPS) weights each click by 1 over the probability that it was seen (its <em>propensity</em>): Bhaag Milkha 0.27/0.9 = 0.30, Swades 0.09/0.2 = 0.45.</p>
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
  <p>Once we account for how rarely anyone looked at slot 5, Swades is the more appealing film, the same Swades that retrieval dropped from Ben's row in section 01. IPS is unbiased but has high variance when propensities are tiny (one click at P = 0.01 counts 100 times), so propensities are clipped or the estimate is self-normalised. The full toolbox against feedback loops: exploration (ε-greedy, UCB, Thompson sampling) with a small budget of 5–10% of traffic; ranking by rates rather than counts and using IPS weights in training and off-policy evaluation; training with the slot position as a feature and then fixing it to slot 1 at serving time, so the model learns appeal separately from position; re-ranking for diversity, long-tail exposure or calibrated genre shares; logging impressions, not only clicks, so you know what was seen and ignored; and monitoring coverage, novelty and the share of slots taken by the top 1% of items over time. Calling exploration "wasted traffic" is the mistake to avoid: without it the model can never learn about anything it is not already showing.</p>

  <h2 id="rk-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The simplest mistake is forgetting to remove what the user has already seen before taking the top N. Scoring all six of CineCity's original films for Ben with the MF note's hand vectors shows what happens:</p>
  <div class="fx" data-lang="py">scores = {f: float(p_ben @ v) for f, v in q.items()}         # hand MF vectors, Ben = (2.5, 0.5)
top3 = lambda films: sorted(films, key=scores.get, reverse=True)[:3]
print("top 3, nothing filtered:", top3(scores))
print("top 3, seen removed    :", top3([f for f in scores if f not in seen["Ben"]]))</div>
  <div class="fx" data-lang="text">top 3, nothing filtered: ['Lagaan', 'Dangal', 'Chak De']
top 3, seen removed    : ['Lagaan', '3 Idiots', 'K3G']</div>
  <p>Without filtering, two of Ben's top three are Dangal and Chak De, films he rated months ago; the row wastes two of three slots. With seen films removed, he gets Lagaan, 3 Idiots and K3G. In evaluation the same mistake inflates or deflates metrics, which is why every evaluation above sets already-played films to −∞.</p>
  <p>Judging retrieval and ranking together is the second mistake. Swades was lost at retrieval, and no ranker could have helped; measure candidate recall separately from ranking NDCG, and merge several retrieval sources. The third is a random train/test split, which trains on a user's future; use a time split or leave-last-out. The fourth is sampled metrics: ranking against 100 negatives inflated BPR-MF's HR@10 from 0.180 to 0.556 and popularity's from 0.106 to 0.394, and can reorder models. The fifth is reporting no popularity baseline: popularity scored about ten times random on the simulated CineCity, and many published "improvements" lose to a well-tuned popularity or item-KNN baseline.</p>
  <p>Metric definitions are a quieter trap: AP denominators and NDCG gains differ between tools, and binary and graded NDCG even reversed Ben's and Chen's rows, so state the definition. Accuracy-only dashboards miss narrowing systems (Bhaag Milkha in every row, Dia's all-sports row); track coverage, diversity and novelty as guardrails. Trusting offline wins without an A/B test, or peeking at the A/B test daily, leads to shipping noise. And building no cold-start or exploration path means new films never shown never get data; give them content vectors and exploration slots, and log propensities from day one.</p>

  <h2 id="rk-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The five rows and their metrics (k = 5)</h3>
  <table class="tbl">
    <tr><th>User</th><th>Relevant (grade)</th><th>P@5</th><th>R@5</th><th>AP@5</th><th>RR</th><th>NDCG@5 graded</th><th>ILD</th><th>Novelty</th></tr>
    <tr><td>Asha</td><td>Lagaan (3)</td><td>0.20</td><td>1.00</td><td>1.000</td><td>1.00</td><td>1.000</td><td>0.7</td><td>2.424</td></tr>
    <tr><td>Ben</td><td>Lagaan (3), Mary Kom (2), Swades (1)</td><td>0.40</td><td>0.667</td><td>0.333</td><td>0.50</td><td>0.578</td><td>0.7</td><td>1.990</td></tr>
    <tr><td>Chen</td><td>Jab We Met (3), Swades (1)</td><td>0.40</td><td>1.00</td><td>0.325</td><td>0.25</td><td>0.462</td><td>0.8</td><td>1.971</td></tr>
    <tr><td>Dia</td><td>Jab We Met (2)</td><td>0.00</td><td>0.00</td><td>0.000</td><td>0.00</td><td>0.000</td><td>0.4</td><td>2.107</td></tr>
    <tr><td>Esha</td><td>Chak De (3)</td><td>0.20</td><td>1.00</td><td>0.500</td><td>0.50</td><td>0.631</td><td>0.7</td><td>2.024</td></tr>
    <tr><td>Mean</td><td>HR@5 0.80, coverage 90%</td><td>0.24</td><td>0.733</td><td>MAP 0.432</td><td>MRR 0.45</td><td>0.534</td><td></td><td></td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><b>Retrieval / ranking / re-ranking</b>: cheap high-recall candidate selection, a rich model to order candidates, then rules for diversity, freshness and business goals.</li>
    <li><b>Learning to rank</b>: pointwise (per item), pairwise (per ordered pair: RankNet, BPR), listwise (per list: ListNet, LambdaMART).</li>
    <li><b>BPR</b>: −ln σ(x<sub>ui</sub> − x<sub>uj</sub>) on (played, sampled unplayed) triples with MF scores; a smoothed per-user AUC.</li>
    <li><b>Order-aware metrics</b>: AP averages precision at each hit; RR uses the first hit; NDCG discounts graded gains by log₂(pos + 1).</li>
    <li><b>Beyond accuracy</b>: coverage, intra-list diversity, novelty (−log₂ popularity), serendipity.</li>
    <li><b>Offline vs online</b>: time split + full ranking + baselines on logs; randomised A/B test or interleaving on live users.</li>
    <li><b>Cold start</b>: too little history; popularity, onboarding, fold-in, content vectors, two-tower, exploration.</li>
    <li><b>Feedback loop / position bias / IPS</b>: the model's choices create its data; top slots get clicks regardless; weight outcomes by 1/propensity.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Ben / example</th></tr>
    <tr><td>RankNet</td><td>ln(1 + e<sup>−(s<sub>i</sub> − s<sub>j</sub>)</sup>)</td><td>Lagaan below Bhaag Milkha: 0.848</td></tr>
    <tr><td>LambdaRank weight</td><td>|ΔNDCG<sub>ij</sub>| / (1 + e<sup>s<sub>i</sub> − s<sub>j</sub></sup>)</td><td>0.129 and 0.196</td></tr>
    <tr><td>BPR</td><td>−ln σ(p<sub>u</sub>·q<sub>i</sub> − p<sub>u</sub>·q<sub>j</sub>) + λ‖Θ‖²; g = 1 − σ</td><td>gap −0.25 → 0.49</td></tr>
    <tr><td>P@k, R@k</td><td>|top-k ∩ Rel| / k, |top-k ∩ Rel| / |Rel|</td><td>0.40, 0.667</td></tr>
    <tr><td>AP@k</td><td>Σ<sub>hits</sub> P@pos / min(|Rel|, k)</td><td>0.333</td></tr>
    <tr><td>NDCG@k</td><td>Σ gain<sub>pos</sub>/log₂(pos + 1) ÷ ideal</td><td>0.578 (binary 0.498)</td></tr>
    <tr><td>Novelty</td><td>mean of −log₂ pop(i)</td><td>1.990 bits</td></tr>
    <tr><td>Two-proportion z</td><td>(p̂<sub>B</sub> − p̂<sub>A</sub>) / √(p̂(1 − p̂)(1/n<sub>A</sub> + 1/n<sub>B</sub>))</td><td>z = 2.24, p = 0.025</td></tr>
    <tr><td>UCB1</td><td>mean + c√(ln N / n)</td><td>Chhichhore 1.03 vs 0.35</td></tr>
    <tr><td>IPS</td><td>(1/n) Σ outcome / propensity</td><td>Swades 0.09 → 0.45</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import ndcg_score
ranker = lgb.LGBMRanker(objective="lambdarank", n_estimators=200)
ranker.fit(X_train, y_train, group=rows_per_user)       # rows sorted by user, groups intact
ndcg_score(true_grades, scores, k=5)                    # 2-D arrays: one row per user

cand = np.argpartition(-user_vec @ item_vecs.T, 1000)[:1000]   # retrieval without a full sort
scores[seen_mask] = -np.inf                             # never recommend what was played</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A ranker cannot recover what retrieval dropped; measure candidate recall.</li>
    <li>Time split or leave-last-out; filter training items; rank the full catalogue.</li>
    <li>Always report random and popularity baselines.</li>
    <li>State metric definitions (AP denominator, NDCG gain).</li>
    <li>Coverage, diversity and novelty are guardrails, not goals.</li>
    <li>A/B: user-level randomisation, fixed sample size, guardrails, long enough for novelty to fade.</li>
    <li>Explore, rank by rates not counts, log impressions and propensities.</li>
  </ul>

  <h2 id="rk-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why do large recommenders use retrieval, ranking and re-ranking stages?</summary><div class="qa-body">Scoring millions of items per request with a rich model is far too slow (10⁸ × 0.1 ms = 10,000 s). Retrieval cheaply narrows to hundreds or thousands with high recall (embeddings plus approximate nearest-neighbour search, item-item CF, rules); ranking spends rich features on those for precision; re-ranking applies diversity, freshness and business rules. Each stage has its own metric: recall for retrieval, NDCG for ranking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pointwise, pairwise and listwise learning to rank: what is the difference?</summary><div class="qa-body">Pointwise scores each item alone with a classification or regression loss. Pairwise learns which of two items should be higher (RankNet, RankSVM, BPR). Listwise optimises a whole-list quantity (ListNet's softmax cross-entropy, or LambdaMART, which scales pair gradients by |ΔNDCG|). With clean features they performed similarly (NDCG@5 0.837–0.843); with a per-user feature shift pointwise fell to 0.714 while LambdaMART stayed at 0.838, because listwise only compares items within a user.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does LambdaMART focus on the top of the list?</summary><div class="qa-body">It starts from the RankNet pairwise gradient and multiplies it, for each pair, by the change in NDCG that swapping the two items would cause. Pairs whose order matters near the top produce large |ΔNDCG| and get large updates; pairs at the bottom get small ones. The "MART" part means the model is gradient-boosted trees, as in LightGBM's lambdarank objective.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain BPR. What assumption does it make, and what can go wrong?</summary><div class="qa-body">BPR assumes a user prefers an item they interacted with over one they did not. It samples triples (u, i, j) with j unplayed and minimises −ln σ(x<sub>ui</sub> − x<sub>uj</sub>) plus a penalty, with MF scores, which maximises a smoothed per-user AUC. Sampled negatives can be false negatives, items the user would love but has not reached (Ben's Lagaan), and uniform negatives are mostly easy, so harder-negative sampling is common.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define precision@k, recall@k and hit rate@k.</summary><div class="qa-body">Precision@k is the number of relevant items in the top k divided by k; recall@k is that number divided by the total number of relevant items; hit rate@k is 1 if any relevant item is in the top k, averaged over users. Ben's row: P@5 = 0.40, R@5 = 0.667. None of them care where in the top k the hits are.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute AP@5 and NDCG@5 for hits at positions 2 and 4 with three relevant items.</summary><div class="qa-body">AP@5 = (1/2 + 2/4)/min(3, 5) = 0.333. Binary NDCG@5 = (1/log₂3 + 1/log₂5)/(1 + 1/log₂3 + 1/log₂4) = (0.631 + 0.431)/2.131 = 0.498. With grades 3 and 2 for the hits and an ideal of 3, 2, 1, graded NDCG = (3 × 0.631 + 2 × 0.431)/(3 + 2 × 0.631 + 0.5) = 0.578.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use MRR instead of NDCG?</summary><div class="qa-body">When one good result is enough and later ones barely matter: "play something now", searching for a known title, question answering. MRR looks only at the first relevant item; NDCG rewards every relevant item by position and grade, which suits browsing rows where several good items add value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is per-user AUC related to NDCG and BPR?</summary><div class="qa-body">Per-user AUC is the share of (relevant, irrelevant) pairs ordered correctly, and BPR optimises a smooth version of it. AUC is position-blind: a mistake at the bottom counts as much as one at the top. NDCG, and LambdaMART which optimises towards it, concentrate on the top positions users actually see.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why track coverage, diversity and novelty if they are not accuracy?</summary><div class="qa-body">Accuracy metrics are satisfied by showing everyone the same safe hits (Bhaag Milkha took 5 of 25 slots; Dia's row was four sports films, ILD 0.4). Coverage, intra-list diversity and novelty reveal a narrowing system, bored users and an ignored long tail, which hurt retention and suppliers over time. They are guardrails traded off against NDCG, for example with MMR re-ranking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe a sound offline evaluation protocol for a recommender.</summary><div class="qa-body">Split by time or leave each user's last interaction out; rank the full catalogue minus training items; report HR or recall@k, NDCG@k and beyond-accuracy metrics; compare with random and popularity baselines; tune on a validation period and report on a later test period. On the simulated CineCity: random 0.011, popularity 0.106, item CF 0.159, implicit ALS 0.177, BPR-MF 0.180 HR@10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is wrong with sampled evaluation metrics?</summary><div class="qa-body">Ranking the held-out item against, say, 100 random negatives instead of the whole catalogue makes the task much easier, so numbers are inflated (BPR-MF 0.180 → 0.556, popularity 0.106 → 0.394), are not comparable with full-ranking numbers, and can change which model looks best. Use full ranking, or correct the sampled estimate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Control CTR 5.0%, treatment 5.5%, 20,000 impressions each. Is it significant?</summary><div class="qa-body">Pooled p = 0.0525; SE = √(0.0525 × 0.9475 × 2/20,000) = 0.00223; z = 0.005/0.00223 = 2.24, p ≈ 0.025, so yes at the 5% level. The 95% interval for the difference is about +0.06 to +0.94 percentage points. Before shipping, check guardrails and that the effect survives the novelty period.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model wins offline on NDCG but loses the A/B test. What could explain it?</summary><div class="qa-body">The logs only contain what the old system showed (selection bias); clicks are a proxy for the business metric; position bias in the logs; less diversity bores users; leakage or a random split offline; sampled metrics; novelty effects; or extra latency from the new model. Offline metrics estimate, the A/B test decides.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is interleaving and why use it?</summary><div class="qa-body">Each user sees a single list that mixes results from two rankers (for example team-draft, where the rankers take turns picking), and the ranker whose items get more clicks wins. Because every user compares both rankers, it needs far fewer users than an A/B test to detect a difference. It is used to shortlist candidates, followed by a full A/B test on the business metric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a brand-new film and a brand-new user?</summary><div class="qa-body">For a film: build a vector from content (the mean vector of similar films, as Chhichhore got (1.875, 0.25) and Ben → Chhichhore 4.81, or a two-tower item tower) and give it guaranteed exploration (UCB: 1.03 against Bhaag Milkha's 0.35). For a user: popularity by context, an onboarding quiz, then fold-in an MF vector after a few interactions, blending towards collaborative scores as history grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a feedback loop in recommenders, and how do you mitigate it?</summary><div class="qa-body">The model trains on clicks its own recommendations caused, so shown items gain clicks and unshown ones are never learned. In simulation, ranking by clicks showed 16 of 50 films and found none of the best 5; exploration alone still found none because counts drowned it; smoothed rates plus 10% exploration found 3. Mitigate with exploration, rates or IPS instead of counts, position-aware training, diversity re-ranking, and logging impressions and propensities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is position bias and how does inverse propensity scoring correct it?</summary><div class="qa-body">Higher slots get more attention, so items shown there collect clicks regardless of quality. IPS divides each click by the probability that the slot was examined, measured for example by randomising order: Swades in slot 5 with naive CTR 0.09 and examination probability 0.2 becomes 0.45, above Bhaag Milkha's 0.30 from slot 1. IPS is unbiased but high-variance when propensities are tiny, so they are clipped or self-normalised.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is exploration worth "wasting" traffic on?</summary><div class="qa-body">Without exploration the model only gets data about items it already shows, so it can never discover that an unshown item is good and quality slowly decays into a popularity loop. A small budget (5–10%) of ε-greedy, UCB or Thompson-sampling slots, with logged propensities, keeps learning about new and long-tail items and also produces the data needed for unbiased off-policy evaluation.</div></details>
</main>
`
});
