// notes/ml/ml_adaboost.js — AdaBoost
Object.assign(TOPIC_CONTENT, {
  "ml_adaboost": `<main>
<h1>AdaBoost</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>AdaBoost</span></div>
  <p class="lead">AdaBoost (Adaptive Boosting, Freund &amp; Schapire, 1995) was the first boosting algorithm that worked well in practice. It trains tiny trees one after another. After each tree it makes the rows that tree got wrong <strong>heavier</strong>, so the next tree is forced to look at them. Every tree also gets a vote whose size depends on how accurate it was. This note builds every formula from scratch, traces three full rounds by hand on the running example of the whole tree group (the captain's 14-day cricket diary: will we play today?), shows where the formulas come from (the exponential loss), and then covers multiclass (SAMME), regression (AdaBoost.R2), its weakness with noisy labels, and sklearn.</p>

  <h2 id="ada-where" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 760 372" width="760"><defs><marker id="ada-wa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><line x1="380" y1="38" x2="380" y2="60" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="380" y1="92" x2="110" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><text x="239" y="111" text-anchor="end" class="tm" font-size="11">parallel</text><line x1="380" y1="92" x2="400" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><text x="396" y="111" text-anchor="start" class="tm" font-size="11">sequential</text><line x1="380" y1="92" x2="670" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><text x="531" y="111" text-anchor="start" class="tm" font-size="11">blend</text><line x1="110" y1="152" x2="110" y2="178" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="110" y1="210" x2="110" y2="236" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="400" y1="152" x2="400" y2="178" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="400" y1="210" x2="400" y2="236" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="400" y1="268" x2="270" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="400" y1="268" x2="400" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><line x1="400" y1="268" x2="530" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#ada-wa)"/><rect x="305" y="8" width="150" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="380" y="27" text-anchor="middle" font-size="12.5">Decision Trees</text><rect x="300" y="62" width="160" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="380" y="81" text-anchor="middle" font-size="12.5">Ensemble Learning</text><rect x="45" y="122" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="141" text-anchor="middle" font-size="12.5">Bagging</text><rect x="315" y="122" width="170" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="141" text-anchor="middle" font-size="12.5">How Boosting Works</text><rect x="595" y="122" width="150" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="670" y="141" text-anchor="middle" font-size="12.5">Stacking &amp; Voting</text><rect x="45" y="180" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="199" text-anchor="middle" font-size="12.5">Random Forest</text><rect x="45" y="238" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="257" text-anchor="middle" font-size="12.5">Extra Trees</text><rect x="330" y="180" width="140" height="30" rx="7" class="fg sg" stroke-width="2.5"/><text x="400" y="199" text-anchor="middle" font-size="12.5" font-weight="700">AdaBoost</text><rect x="320" y="238" width="160" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="257" text-anchor="middle" font-size="12.5">Gradient Boosting</text><rect x="215" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="270" y="319" text-anchor="middle" font-size="12.5">XGBoost</text><rect x="345" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="319" text-anchor="middle" font-size="12.5">LightGBM</text><rect x="475" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="530" y="319" text-anchor="middle" font-size="12.5">CatBoost</text><rect x="20" y="344" width="720" height="24" rx="6" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/><text x="380" y="360" text-anchor="middle" class="tm" font-size="11.5">used by every model above: Feature Importance &amp; SHAP · Tuning &amp; Production</text></svg><figcaption>The tree-based family. AdaBoost (green) is the first concrete boosting algorithm, the parent of gradient boosting.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_boosting">How Boosting Works</a></b><span>That note set the plan: build weak models one after another, each one fixing what the team still gets wrong, and add them up (F = F₀ + Σ ν·h). It left one question open: <em>how exactly</em> do we tell the next weak model "focus on these mistakes"?</span></li>
    <li><b>This note: AdaBoost</b><span>The first answer. Keep a weight on every row. Raise the weight of rows the team gets wrong, lower it for rows it gets right, and train the next stump on the weighted rows. Give each stump a say α that depends on its weighted error. Later it was shown that this is exactly the greedy minimiser of one particular loss, the exponential loss.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_gbm">Gradient Boosting</a></b><span>The exponential loss is also AdaBoost's weakness: a mislabeled row gets an exponentially growing weight. Gradient boosting keeps the "add a small tree each round" plan but lets you plug in <em>any</em> loss (log-loss, Huber, …) by fitting each tree to the negative gradient. XGBoost, LightGBM and CatBoost are all built on that.</span></li>
  </ol>
  <p>Before this note you should know: a decision tree and a stump (<a class="xref" data-note="ml_dtree">Decision Trees</a>), why combining models helps (<a class="xref" data-note="ml_ensembles">Ensemble Learning</a>), the boosting plan (<a class="xref" data-note="ml_boosting">How Boosting Works</a>), and natural logs and derivatives (<a class="xref" data-note="m_calculus">Calculus</a>).</p>

    <h2 id="ada-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Numbers are from the running example: predicting Play / No play on the 14 days of the captain's cricket diary with one-question stumps.</p>
  <ol class="story">
    <li><b>Row weights</b><span>Q: for a yes/no target there is no residual to subtract, so how do we tell the next stump what the team got wrong? → Give every day a weight and make the days the team gets wrong heavier. But how do we judge a stump when days count differently?</span></li>
    <li><b>±1 labels, stumps, weighted error ε</b><span>Q: how good is a stump on weighted days? → ε = total weight of the days it gets wrong. With equal weights "Sunny? → No play" and "Humidity high? → No play" tie at 4/14 = 0.286; after round 1's reweighting the first is 0.500 and the second 0.275. But how much say should a stump get, and how much should the weights move?</span></li>
    <li><b>The algorithm: α and the update</b><span>Q: how big a vote, how big a reweighting? → α = ½·ln((1−ε)/ε) = 0.4581; wrong days ×e^α = 1.58, right days ×e^−α = 0.63, then normalise, so the wrong days hold exactly 50%. Does it actually fix mistakes?</span></li>
    <li><b>The full hand trace</b><span>Q: what happens over several rounds? → Sunny?, then Humidity high?, then Rain?: training errors 4 → 4 → 2, each stump useful only because the weights forced it onto new days. But why these particular formulas?</span></li>
    <li><b>The exponential loss</b><span>Q: what is AdaBoost optimising? → Σ e^{−y·F}: α is its exact minimiser (loss 0.9035 = Z₁ at α = 0.4581) and training error ≤ ∏ Z = 0.7107 after 3 rounds, falling exponentially. Does real code behave like the formulas?</span></li>
    <li><b>From scratch vs sklearn</b><span>Q: is our 30-line version the real thing? → On 20,000 churn rows it matches sklearn's predictions exactly (sklearn's α is 2× ours). But it only handles two classes…</span></li>
    <li><b>SAMME (multiclass)</b><span>Q: what if there are K classes? → Add ln(K−1) to α so "useful" means better than random among K. And numeric targets?</span></li>
    <li><b>AdaBoost.R2 (regression)</b><span>Q: what is "wrong" for a number? → A loss in [0, 1]; on diary turnout the first stump has L̄ = 1/3, β = 0.5. But all versions share one weakness…</span></li>
    <li><b>Noise sensitivity</b><span>Q: what happens to a day whose label is simply wrong? → Its weight keeps growing: a mislabelled D13 goes 0.071 → 0.181 and becomes the heaviest day. So how should it be used in practice?</span></li>
    <li><b>sklearn &amp; the knobs</b><span>Q: which settings matter? → Base-tree depth most of all: stumps never get more than 12 of 14 diary days right (no interactions), depth 2 gets 14/14; on churn 0.65 → 0.85. How does it compare with its siblings?</span></li>
    <li><b>AdaBoost vs its siblings</b><span>Q: when would you pick it? → Rarely today: gradient boosting keeps the plan but swaps the exponential loss for any loss, which is the next note.</span></li>
  </ol>

<h2 id="ada-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">AdaBoost</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>Rows have weights</b> — start equal, 1/n each</li>
          <li><b>Weak learner</b> — usually a stump (depth-1 tree) trained on the weighted rows</li>
          <li><b>Hard rows get heavier</b> — so the next stump must fix them</li>
          <li><b>Each stump gets a say α</b> — accurate stumps vote louder</li>
          <li>💡 A teacher who re-sets the next test with more of the questions the class failed</li>
          <li><b>Diary</b>: Sunny? (ε 0.286, α 0.458) → Humidity high? (0.275, 0.485) → Rain? (0.263, 0.514); errors 4 → 4 → 2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The formulas</div>
        <ul>
          <li><b>Labels</b> — y ∈ {−1, +1}; stump h(x) ∈ {−1, +1}</li>
          <li><b>Weighted error</b> — ε = Σ wᵢ over wrong rows (weights sum to 1)</li>
          <li><b>Say</b> — α = ½·ln((1−ε)/ε): 0 at ε=0.5, grows as ε → 0</li>
          <li><b>Update</b> — wᵢ ← wᵢ·e^(−α·yᵢ·h(xᵢ)), then divide by Z</li>
          <li><b>Shortcut</b> — wrong rows: w/(2ε); right rows: w/(2(1−ε))</li>
          <li><b>After update</b> — wrong rows hold exactly 50% of the weight</li>
          <li><b>Final</b> — H(x) = sign(Σ αₘ hₘ(x))</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why (theory)</div>
        <ul>
          <li><b>Exponential loss</b> — Σ e^(−y·F(x)); AdaBoost = forward stagewise minimiser of it</li>
          <li><b>Weights</b> = e^(−y·F) of the team so far</li>
          <li><b>α</b> = the exact line-search step for that loss</li>
          <li><b>Normaliser</b> Z = 2√(ε(1−ε)) &lt; 1</li>
          <li><b>Training error ≤ ∏ Zₘ</b> → falls exponentially if every ε &lt; ½ − γ</li>
          <li><b>Probability</b> — p(y=1|x) = 1/(1+e^(−2F))</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants</div>
        <ul>
          <li><b>SAMME</b> — K classes: α = ln((1−ε)/ε) + ln(K−1); needs ε &lt; 1 − 1/K</li>
          <li><b>SAMME.R</b> — used class probabilities; removed from recent sklearn</li>
          <li><b>AdaBoost.R2</b> — regression: loss/max loss, β = L̄/(1−L̄), weighted median</li>
          <li><b>Real / Gentle / LogitBoost</b> — softer losses (2000)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Strengths &amp; weaknesses</div>
        <ul>
          <li>✔ Simple, few knobs (n_estimators, learning_rate, base depth)</li>
          <li>✔ Stumps → readable additive model; works with any weighted learner</li>
          <li>⚠ <b>Label noise / outliers</b> — wrong rows' weight grows exponentially</li>
          <li>⚠ Stumps cannot model interactions; use depth 2–6</li>
          <li>⚠ Sequential → no parallel trees; slower than modern GBM libraries</li>
          <li>⚠ Usually beaten by gradient boosting on tabular data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">sklearn</div>
        <ul>
          <li><code>AdaBoostClassifier(estimator, n_estimators=50, learning_rate=1.0)</code></li>
          <li><b>learning_rate</b> multiplies every α (shrinkage)</li>
          <li><b>estimator_weights_</b> = 2× our α (SAMME convention), same predictions</li>
          <li><b>staged_score / staged_predict</b> — curves to pick n_estimators</li>
          <li>sklearn stumps split by <b>weighted Gini</b>, not weighted error</li>
          <li><code>AdaBoostRegressor(loss="linear"|"square"|"exponential")</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ada-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ada-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea</span><span class="rm-sub">Make the hard days heavier</span></div></div>
      <div class="rm-item rm-done" data-target="ada-blocks"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Building Blocks</span><span class="rm-sub">±1 labels, stumps, weights, ε</span></div></div>
      <div class="rm-item rm-done" data-target="ada-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Algorithm, Line by Line</span><span class="rm-sub">α, the weight update, normalising</span></div></div>
      <div class="rm-item rm-done" data-target="ada-trace"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Full Hand Trace</span><span class="rm-sub">14 days, 3 rounds, every number</span></div></div>
      <div class="rm-item rm-done" data-target="ada-exp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why These Formulas</span><span class="rm-sub">Exponential loss, error bound, probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="ada-code"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">From Scratch vs sklearn</span><span class="rm-sub">30 lines, identical predictions</span></div></div>
      <div class="rm-item rm-done" data-target="ada-samme"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multiclass: SAMME</span><span class="rm-sub">Why + ln(K−1)</span></div></div>
      <div class="rm-item rm-done" data-target="ada-r2"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Regression: AdaBoost.R2</span><span class="rm-sub">Loss in [0,1], β, weighted median</span></div></div>
      <div class="rm-item rm-done" data-target="ada-noise"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Noise Sensitivity</span><span class="rm-sub">Why wrong labels take over</span></div></div>
      <div class="rm-item rm-done" data-target="ada-sk"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">sklearn &amp; the Knobs</span><span class="rm-sub">Depth, learning rate, rounds</span></div></div>
      <div class="rm-item rm-done" data-target="ada-cmp"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">AdaBoost vs Its Siblings</span><span class="rm-sub">Tree, forest, gradient boosting</span></div></div>
      <div class="rm-item rm-done" data-target="ada-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loss, every formula</span></div></div>
      <div class="rm-item rm-done" data-target="ada-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in practice</span></div></div>
      <div class="rm-item rm-done" data-target="ada-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ada-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ada-idea"><span class="num">01</span>The Idea: Make the Hard Rows Heavier</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><a class="xref" data-note="ml_boosting">How Boosting Works</a> fitted each new stump to the residuals y − F of a number. For a yes/no question such as "will we play today?" there is no residual to subtract. How can we tell the next stump which days the team still gets wrong?</p>
  </div>
  <p><strong>The need.</strong> A stump (a tree with one question, like "Sunny?" or "is HumPct ≤ 82.5?") is a weak model: on most data it is only a bit better than guessing. <a class="xref" data-note="ml_boosting">How Boosting Works</a> showed that many weak models trained <em>one after another</em>, each fixing the team's remaining mistakes, can add up to a strong one. But a stump has no idea what "the team's mistakes" are. It just fits the data you give it. So we need a way to change the data so that the next stump automatically cares about the mistakes.</p>
  <p><strong>AdaBoost's answer, in plain words.</strong> Give every training row a weight, like a price tag on how much it matters. At the start every row has the same weight. Train a stump that does well on the weighted rows. Then look at which rows it got wrong and make them heavier, and make the rows it got right lighter. Train the next stump on the new weights: being wrong on a heavy row is now expensive, so it will try hard to get those rows right. Repeat. At the end, every stump votes, and a stump that was more accurate gets a bigger vote.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A coaching teacher preparing a class for JEE. After mock test 1, she sees the class keeps failing rotational-motion questions. Mock test 2 has many more rotational-motion questions and fewer of the easy ones. After test 2 the weak spot is now thermodynamics, so test 3 is heavy on that. Each test is set to the class's current weak spots. At the end, she trusts the advice of tests that were good predictors (her "α") more than the others.</p>
  </div>
  <h3>The running example: will we play today?</h3>
  <p>The whole tree group follows one small table: a college cricket captain's diary of 14 days, D1–D14 (Quinlan's classic PlayTennis table). For each day he noted the outlook, humidity and wind, and whether the match was played. AdaBoost needs the two classes as numbers −1 and +1 (section 02 explains why), so Play = Yes becomes y = +1 and No becomes y = −1:</p>
<div class="fx" data-lang="py">import numpy as np
from play import df                                   # the captain's 14-day cricket diary
y = np.where(df.Play == "Yes", 1, -1)                 # AdaBoost labels: Yes = +1, No = -1
print(df[["Outlook", "Humidity", "Wind", "Play"]].assign(y=y).T.to_string())
print("Yes days:", (y == 1).sum(), " No days:", (y == -1).sum())</div>
  <div class="fx" data-lang="text">             D1      D2        D3    D4      D5      D6        D7     D8      D9     D10     D11       D12       D13     D14
Outlook   Sunny   Sunny  Overcast  Rain    Rain    Rain  Overcast  Sunny   Sunny    Rain   Sunny  Overcast  Overcast    Rain
Humidity   High    High      High  High  Normal  Normal    Normal   High  Normal  Normal  Normal      High    Normal    High
Wind       Weak  Strong      Weak  Weak    Weak  Strong    Strong   Weak    Weak    Weak  Strong    Strong      Weak  Strong
Play         No      No       Yes   Yes     Yes      No       Yes     No     Yes     Yes     Yes       Yes       Yes      No
y            -1      -1         1     1       1      -1         1     -1       1       1       1         1         1      -1
Yes days: 9  No days: 5</div>
  <p>Our weak learner is a stump that asks one of the five yes/no questions the diary allows (Overcast? Sunny? Rain? Humidity high? Wind strong?) and says "Play" for one answer and "No play" for the other. No single question gets all 14 days right. Watch AdaBoost make three of them work together.</p>
  <div class="flow"><span>All rows weight 1/n</span><span>Train stump on weighted rows</span><span>Weighted error ε → say α</span><span>Wrong rows heavier, right rows lighter</span><span>Repeat M times</span><span>Final: sign(Σ α·stump)</span></div>
  <p>Three things to notice before the formulas:</p>
  <ul>
    <li>The data never changes; only the weights do. The stumps differ because the weights differ.</li>
    <li>Nothing is averaged equally, unlike bagging. Each stump's vote α is earned.</li>
    <li>The process is <em>adaptive</em> (the "Ada" in the name): how much a row's weight moves depends on how good the current stump is. A very accurate stump moves the weights a lot; a near-useless one barely moves them.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>AdaBoost</strong> is a boosting algorithm for classification that maintains a distribution (weights summing to 1) over the training rows, trains a weak learner on that distribution each round, gives the learner a vote αₘ computed from its weighted error, and multiplies the weights of misclassified rows by e^{αₘ} and of correct rows by e^{−αₘ} before renormalising. The final classifier is the sign of the α-weighted sum of the weak learners.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Building blocks.</b> "Make wrong days heavier" is a plan, not an algorithm. How heavy? How big a vote? To answer that we first need four small pieces: ±1 labels, stumps, weights and weighted error.</div>

  <h2 id="ada-blocks"><span class="num">02</span>Building Blocks: ±1 Labels, Stumps, Weights, Weighted Error</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If days carry different weights, how do we score a stump? And how do we write "right" and "wrong" so the formulas stay short?</p>
  </div>
  <h3>Labels as −1 and +1</h3>
  <p>AdaBoost writes the two classes as <strong>y = +1</strong> and <strong>y = −1</strong> (instead of 1 and 0), and every stump also outputs +1 or −1. This one choice makes all the formulas short, because of a small trick:</p>
  <table class="tbl">
    <tr><th>True label y</th><th>Stump says h(x)</th><th>y · h(x)</th><th>Meaning</th></tr>
    <tr><td>+1</td><td>+1</td><td>+1</td><td>right</td></tr>
    <tr><td>−1</td><td>−1</td><td>+1</td><td>right</td></tr>
    <tr><td>+1</td><td>−1</td><td>−1</td><td>wrong</td></tr>
    <tr><td>−1</td><td>+1</td><td>−1</td><td>wrong</td></tr>
  </table>
  <p>So <strong>y·h(x) = +1 means right and −1 means wrong</strong>. One multiplication replaces an if-statement. More generally, for the team's score F(x) (a real number whose sign is the prediction), the product <strong>y·F(x) is called the margin</strong>: positive means the team is right, and the bigger it is, the more confidently right.</p>
  <h3>The weak learner: a decision stump</h3>
  <p>A <strong>stump</strong> is a decision tree with one split (depth 1): "if feature j ≤ t then predict a, else predict b". On one numeric feature with n distinct values there are n − 1 possible cut-offs (midpoints) and two directions, so finding the best stump is a quick search. It is <em>weak</em> on purpose: high bias, very low variance, and fast. AdaBoost works with any classifier that can take row weights, but stumps (or depth 2–6 trees) are the standard choice. See <a class="xref" data-note="ml_dtree">Decision Trees</a> for how a tree picks a split. On the diary's word columns a stump is simply one yes/no question, such as "Sunny?", with one prediction per answer: 5 questions × 2 directions = 10 candidate stumps.</p>
  <h3>Row weights and weighted error</h3>
  <p>Every row i carries a weight wᵢ ≥ 0, and the weights sum to 1, so they act like a probability distribution over rows. The <strong>weighted error</strong> of a stump is simply the total weight of the rows it gets wrong:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ε = Σᵢ wᵢ · 1[h(xᵢ) ≠ yᵢ]</strong> (with Σ wᵢ = 1). With equal weights 1/n it is the ordinary error rate. With unequal weights, missing a heavy row costs more than missing a light one.</p>
  </div>
  <p><strong>Worked by hand: choosing a stump on weighted days.</strong> Take the weights AdaBoost gives the diary after round 1 (section 04): the four days that the first stump got wrong (D6, D9, D11, D14) weigh 0.125 each, the other ten weigh 0.05 each. For each question, use the better direction, add up the weights of the days it gets wrong, and compare with plain counting:</p>
  <table class="tbl">
    <tr><th>stump</th><th>wrong days</th><th>plain error (count)</th><th>ε (weighted)</th></tr>
    <tr><td>Sunny? yes → No play</td><td>D6, D9, D11, D14</td><td>4/14</td><td>4 × 0.125 = 0.500</td></tr>
    <tr><td>Humidity high? yes → No play</td><td>D3, D4, D12, D6</td><td>4/14</td><td>3 × 0.05 + 0.125 = <strong>0.275</strong></td></tr>
    <tr><td>Rain? yes → No play</td><td>D4, D5, D10 (rain, played), D1, D2, D8 (not rain, not played)</td><td>6/14</td><td>6 × 0.05 = 0.300</td></tr>
    <tr><td>Wind strong? yes → No play</td><td>D7, D11, D12, D1, D8</td><td>5/14</td><td>4 × 0.05 + 0.125 = 0.325</td></tr>
    <tr><td>Overcast? yes → Play</td><td>D4, D5, D9, D10, D11 (not overcast, played)</td><td>5/14</td><td>3 × 0.05 + 2 × 0.125 = 0.400</td></tr>
  </table>
  <p>With plain counting "Sunny?" and "Humidity high?" tie at 4 mistakes each, exactly as they did in round 1. With the weights, "Sunny?" is now a coin flip (0.500), because every day it gets wrong is a heavy day, while "Humidity high?" misses mostly light days (0.275) and wins. <em>This is the whole mechanism</em>: the weights change which stump looks best, so the next stump cannot simply repeat the last one.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn's <code>DecisionTreeClassifier(max_depth=1)</code> with <code>sample_weight</code> picks the split with the lowest <em>weighted Gini impurity</em>, not the lowest weighted error. Usually they agree; sometimes they pick different stumps. AdaBoost's theory only needs ε &lt; 0.5, so both are fine, but a hand trace that minimises ε can differ from sklearn's run on some data. The hand trace on the diary (section 04) minimises ε directly, like the theory.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The algorithm.</b> We can now score a stump on weighted days. Next: turn ε into a vote α, and use α to update the weights.</div>

  <h2 id="ada-algo"><span class="num">03</span>The Algorithm, Line by Line</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how to score a stump on weighted days (ε). How much say should that stump get in the final vote, and exactly how much heavier should the days it got wrong become?</p>
  </div>
  <div class="callout def"><span class="label">AdaBoost (binary, discrete)</span>
    <p><strong>Input:</strong> rows (xᵢ, yᵢ), yᵢ ∈ {−1, +1}, i = 1…n; number of rounds M.<br>
    <strong>1.</strong> wᵢ = 1/n for every row.<br>
    <strong>2.</strong> For m = 1 … M:<br>
    &nbsp;&nbsp;(a) train a weak learner hₘ on the rows with weights w;<br>
    &nbsp;&nbsp;(b) εₘ = Σ wᵢ over rows where hₘ(xᵢ) ≠ yᵢ;<br>
    &nbsp;&nbsp;(c) if εₘ ≥ 0.5 stop (no better than chance); if εₘ = 0 keep hₘ alone and stop;<br>
    &nbsp;&nbsp;(d) αₘ = ½ · ln((1 − εₘ)/εₘ);<br>
    &nbsp;&nbsp;(e) wᵢ ← wᵢ · exp(−αₘ · yᵢ · hₘ(xᵢ));<br>
    &nbsp;&nbsp;(f) Zₘ = Σ wᵢ; wᵢ ← wᵢ / Zₘ.<br>
    <strong>3.</strong> Output H(x) = sign( Σₘ αₘ · hₘ(x) ).</p>
  </div>
  <h3>Step (d): the say α = ½·ln((1−ε)/ε)</h3>
  <p>Read it from the inside out. (1 − ε)/ε is the stump's <strong>odds of being right</strong> on the weighted rows: with ε = 0.3 it is right 0.7 and wrong 0.3, odds 0.7/0.3 = 2.33. Taking ln turns odds into <strong>log-odds</strong>, which is 0 for even odds and grows (slowly) as the odds grow. The ½ comes from the exponential loss (section 05). So: <em>a stump's vote is half the log-odds that it is right.</em></p>
  <table class="tbl">
    <tr><th>ε</th><th>odds (1−ε)/ε</th><th>ln(odds)</th><th>α = ½·ln</th><th>meaning</th></tr>
    <tr><td>0.50</td><td>1</td><td>0</td><td>0</td><td>coin flip: no say at all</td></tr>
    <tr><td>0.40</td><td>1.5</td><td>0.405</td><td>0.203</td><td>slightly useful</td></tr>
    <tr><td>0.30</td><td>2.333</td><td>0.847</td><td>0.424</td><td>useful</td></tr>
    <tr><td>0.20</td><td>4</td><td>1.386</td><td>0.693</td><td>good</td></tr>
    <tr><td>0.10</td><td>9</td><td>2.197</td><td>1.099</td><td>very good</td></tr>
    <tr><td>0.01</td><td>99</td><td>4.595</td><td>2.298</td><td>nearly perfect</td></tr>
    <tr><td>0</td><td>∞</td><td>∞</td><td>∞</td><td>perfect: it alone decides (guard against it)</td></tr>
    <tr><td>0.70</td><td>0.429</td><td>−0.847</td><td>−0.424</td><td>worse than chance: its vote is flipped</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 560 250" width="560"><line x1="60" y1="111.0" x2="520" y2="111.0" stroke="currentColor"/><line x1="60" y1="16" x2="60" y2="206" stroke="currentColor"/><text x="60" y="222" text-anchor="middle" class="tm" font-size="11">0</text><text x="106.0" y="222" text-anchor="middle" class="tm" font-size="11">0.1</text><text x="198.0" y="222" text-anchor="middle" class="tm" font-size="11">0.3</text><text x="290.0" y="222" text-anchor="middle" class="tm" font-size="11">0.5</text><text x="382.0" y="222" text-anchor="middle" class="tm" font-size="11">0.7</text><text x="474.0" y="222" text-anchor="middle" class="tm" font-size="11">0.9</text><text x="520.0" y="222" text-anchor="middle" class="tm" font-size="11">1.0</text><text x="52" y="191.0" text-anchor="end" class="tm" font-size="11">-2</text><text x="52" y="153.0" text-anchor="end" class="tm" font-size="11">-1</text><text x="52" y="115.0" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="77.0" text-anchor="end" class="tm" font-size="11">1</text><text x="52" y="39.0" text-anchor="end" class="tm" font-size="11">2</text><polyline points="64.6,23.7 66.1,29.1 67.6,33.4 69.1,36.9 70.6,39.9 72.1,42.4 73.6,44.7 75.2,46.8 76.7,48.7 78.2,50.4 79.7,51.9 81.2,53.4 82.7,54.8 84.2,56.1 85.7,57.3 87.2,58.4 88.7,59.5 90.2,60.6 91.7,61.6 93.2,62.5 94.8,63.4 96.3,64.3 97.8,65.1 99.3,65.9 100.8,66.7 102.3,67.5 103.8,68.2 105.3,68.9 106.8,69.6 108.3,70.3 109.8,70.9 111.3,71.6 112.8,72.2 114.4,72.8 115.9,73.4 117.4,74.0 118.9,74.5 120.4,75.1 121.9,75.6 123.4,76.2 124.9,76.7 126.4,77.2 127.9,77.7 129.4,78.2 130.9,78.7 132.4,79.1 134.0,79.6 135.5,80.1 137.0,80.5 138.5,81.0 140.0,81.4 141.5,81.8 143.0,82.2 144.5,82.7 146.0,83.1 147.5,83.5 149.0,83.9 150.5,84.3 152.0,84.7 153.6,85.1 155.1,85.4 156.6,85.8 158.1,86.2 159.6,86.6 161.1,86.9 162.6,87.3 164.1,87.6 165.6,88.0 167.1,88.3 168.6,88.7 170.1,89.0 171.6,89.4 173.2,89.7 174.7,90.1 176.2,90.4 177.7,90.7 179.2,91.0 180.7,91.4 182.2,91.7 183.7,92.0 185.2,92.3 186.7,92.6 188.2,92.9 189.7,93.2 191.2,93.6 192.8,93.9 194.3,94.2 195.8,94.5 197.3,94.8 198.8,95.1 200.3,95.4 201.8,95.6 203.3,95.9 204.8,96.2 206.3,96.5 207.8,96.8 209.3,97.1 210.8,97.4 212.4,97.6 213.9,97.9 215.4,98.2 216.9,98.5 218.4,98.8 219.9,99.0 221.4,99.3 222.9,99.6 224.4,99.9 225.9,100.1 227.4,100.4 228.9,100.7 230.4,100.9 232.0,101.2 233.5,101.5 235.0,101.7 236.5,102.0 238.0,102.3 239.5,102.5 241.0,102.8 242.5,103.0 244.0,103.3 245.5,103.6 247.0,103.8 248.5,104.1 250.0,104.3 251.6,104.6 253.1,104.8 254.6,105.1 256.1,105.4 257.6,105.6 259.1,105.9 260.6,106.1 262.1,106.4 263.6,106.6 265.1,106.9 266.6,107.1 268.1,107.4 269.6,107.6 271.2,107.9 272.7,108.1 274.2,108.4 275.7,108.6 277.2,108.9 278.7,109.1 280.2,109.4 281.7,109.6 283.2,109.9 284.7,110.1 286.2,110.4 287.7,110.6 289.2,110.9 290.8,111.1 292.3,111.4 293.8,111.6 295.3,111.9 296.8,112.1 298.3,112.4 299.8,112.6 301.3,112.9 302.8,113.1 304.3,113.4 305.8,113.6 307.3,113.9 308.8,114.1 310.4,114.4 311.9,114.6 313.4,114.9 314.9,115.1 316.4,115.4 317.9,115.6 319.4,115.9 320.9,116.1 322.4,116.4 323.9,116.6 325.4,116.9 326.9,117.2 328.4,117.4 330.0,117.7 331.5,117.9 333.0,118.2 334.5,118.4 336.0,118.7 337.5,119.0 339.0,119.2 340.5,119.5 342.0,119.7 343.5,120.0 345.0,120.3 346.5,120.5 348.0,120.8 349.6,121.1 351.1,121.3 352.6,121.6 354.1,121.9 355.6,122.1 357.1,122.4 358.6,122.7 360.1,123.0 361.6,123.2 363.1,123.5 364.6,123.8 366.1,124.1 367.6,124.4 369.2,124.6 370.7,124.9 372.2,125.2 373.7,125.5 375.2,125.8 376.7,126.1 378.2,126.4 379.7,126.6 381.2,126.9 382.7,127.2 384.2,127.5 385.7,127.8 387.2,128.1 388.8,128.4 390.3,128.8 391.8,129.1 393.3,129.4 394.8,129.7 396.3,130.0 397.8,130.3 399.3,130.6 400.8,131.0 402.3,131.3 403.8,131.6 405.3,131.9 406.8,132.3 408.4,132.6 409.9,133.0 411.4,133.3 412.9,133.7 414.4,134.0 415.9,134.4 417.4,134.7 418.9,135.1 420.4,135.4 421.9,135.8 423.4,136.2 424.9,136.6 426.4,136.9 428.0,137.3 429.5,137.7 431.0,138.1 432.5,138.5 434.0,138.9 435.5,139.3 437.0,139.8 438.5,140.2 440.0,140.6 441.5,141.0 443.0,141.5 444.5,141.9 446.0,142.4 447.6,142.9 449.1,143.3 450.6,143.8 452.1,144.3 453.6,144.8 455.1,145.3 456.6,145.8 458.1,146.4 459.6,146.9 461.1,147.5 462.6,148.0 464.1,148.6 465.6,149.2 467.2,149.8 468.7,150.4 470.2,151.1 471.7,151.7 473.2,152.4 474.7,153.1 476.2,153.8 477.7,154.5 479.2,155.3 480.7,156.1 482.2,156.9 483.7,157.7 485.2,158.6 486.8,159.5 488.3,160.4 489.8,161.4 491.3,162.5 492.8,163.6 494.3,164.7 495.8,165.9 497.3,167.2 498.8,168.6 500.3,170.1 501.8,171.6 503.3,173.3 504.8,175.2 506.4,177.3 507.9,179.6 509.4,182.1 510.9,185.1 512.4,188.6 513.9,192.9 515.4,198.3" fill="none" class="sb" stroke-width="2.4"/><circle cx="106.0" cy="69.3" r="4" class="fr sr"/><text x="114.0" y="63.3" font-size="11">ε=0.1: α=1.10</text><circle cx="198.0" cy="94.9" r="4" class="fr sr"/><text x="206.0" y="88.9" font-size="11">ε=0.3: α=0.42</text><circle cx="290.0" cy="111.0" r="4" class="fr sr"/><text x="298.0" y="105.0" font-size="11">ε=0.5: α=0.00</text><text x="290.0" y="246" text-anchor="middle" class="tm" font-size="11.5">weighted error ε of the stump</text><text x="253.2" y="160.4" class="tr" font-size="11">ε &gt; 0.5 → α &lt; 0 (vote flipped)</text></svg><figcaption>α = ½·ln((1−ε)/ε). A stump at coin-flip level (ε = 0.5) gets zero say. The better it is, the faster its say grows, and it heads to infinity as ε → 0.</figcaption></figure>
  <p>Two properties matter. First, α is <strong>symmetric</strong>: a stump with ε = 0.7 gets α = −0.424, which means "do the opposite of what it says", and the opposite of a 70%-wrong stump is a 70%-right stump. That is why stopping at ε ≥ 0.5 loses nothing: just flip the stump. Second, α grows <strong>without limit</strong> as ε → 0, so one perfect stump would outvote everything; implementations stop or cap there.</p>
  <h3>Step (e): the weight update</h3>
  <p>Using the y·h trick from section 02: for a <strong>right</strong> row y·h = +1, so the weight is multiplied by e^{−α} (smaller, since α &gt; 0). For a <strong>wrong</strong> row y·h = −1, so it is multiplied by e^{+α} (bigger). On the diary's first round (section 04) ε = 4/14 = 0.2857, so α = ½·ln(0.7143/0.2857) = ½·ln 2.5 = 0.4581: e^{−0.4581} = 0.6325 and e^{0.4581} = 1.5811. Right days lose about a third of their weight, wrong days gain more than half.</p>
  <h3>Step (f): normalising, and the 50/50 fact</h3>
  <p>After (e) the weights no longer sum to 1, so divide by their sum Zₘ. Something neat happens. Before the update, the wrong rows hold ε of the weight and the right rows hold 1 − ε. After multiplying:</p>
  <ul>
    <li>wrong rows hold ε · e^{α} = ε · √((1−ε)/ε) = √(ε(1−ε))</li>
    <li>right rows hold (1−ε) · e^{−α} = (1−ε) · √(ε/(1−ε)) = √(ε(1−ε))</li>
  </ul>
  <p>(using e^{α} = √((1−ε)/ε), which is just α = ½·ln((1−ε)/ε) undone). The two halves are <strong>equal</strong>. So Zₘ = 2√(εₘ(1−εₘ)), and after normalising <strong>the rows the last stump got wrong hold exactly 50% of the weight</strong>. In other words, on the new weights the last stump is a pure coin flip. The next stump cannot copy it; it must find something new. That is how AdaBoost forces diversity.</p>
  <div class="callout intu"><span class="label">Shortcut you can use by hand</span>
    <p>Because of the 50/50 fact, new weight = <strong>old weight / (2ε)</strong> for a wrong row and <strong>old weight / (2(1 − ε))</strong> for a right row. On the diary with ε = 4/14: wrong days (1/14)/(2 · 4/14) = 1/8 = 0.125, right days (1/14)/(2 · 10/14) = 1/20 = 0.05. No exponentials needed.</p>
  </div>
  <h3>Step 3: the final vote</h3>
  <p>F(x) = Σ αₘ hₘ(x) is a weighted sum of ±1 votes. Its sign is the class; its size is the confidence. On the diary after three rounds (section 04), day D3 (overcast, humid, calm) hears "not sunny → Play" (+1, α = 0.4581), "humid → No play" (−1, α = 0.4847) and "not rain → Play" (+1, α = 0.5144): F = 0.4581 − 0.4847 + 0.5144 = +0.488 → Play, but not by much.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not confuse the two kinds of weight. <strong>Row weights wᵢ</strong> say how much each training row matters to the <em>next</em> stump; they are thrown away after training. <strong>Learner weights αₘ</strong> say how much each stump's vote counts at prediction time; they are kept forever.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The full hand trace.</b> We have every formula. Does the loop really turn three weak stumps into a better team? Run it on all 14 days and check every number.</div>

  <h2 id="ada-trace"><span class="num">04</span>Full Hand Trace: 14 Days, 3 Rounds</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Formulas are one thing; watching them work is another. On the 14 diary days, which stumps get chosen, how do the weights move, and does the team really end up better than any single stump?</p>
  </div>
  <p>The 14 diary days, the five questions, and every number of three rounds. The code below prints everything; the tables walk through it by hand.</p>
<div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
     "Humidity high?": df.Humidity == "High", "Wind strong?": df.Wind == "Strong"}
Q = {k: v.values for k, v in Q.items()}                # the five yes/no questions
y = np.where(df.Play == "Yes", 1, -1)
days = np.array(df.index)
w = np.full(14, 1 / 14)                                # step 1: equal weights
F = np.zeros(14)
for m in range(1, 4):
    cands = []                                         # every stump: a question + what it says on "yes"
    for k, q in Q.items():
        for s in (+1, -1):
            h = np.where(q, s, -s)
            cands.append((w[h != y].sum(), k, s, h))
    print(f"--- round {m}: weighted error of every stump ('yes' answer -&gt; Play / No play)")
    for c in cands[::2]:
        print(f"  {c[1]:15s} yes-&gt;Play {c[0]:.3f}   yes-&gt;No play {1 - c[0]:.3f}")
    eps, k, s, h = min(cands, key=lambda c: c[0])      # smallest weighted error (first one wins ties)
    alpha = 0.5 * np.log((1 - eps) / eps)
    print(f"  chosen: {k} yes-&gt;{'Play' if s &gt; 0 else 'No play'}   wrong on {list(days[h != y])}")
    print(f"  eps = {eps:.4f}   alpha = 0.5*ln({1 - eps:.4f}/{eps:.4f}) = {alpha:.4f}")
    F += alpha * h
    w = w * np.exp(-alpha * y * h)                     # wrong rows x e^alpha, right rows x e^-alpha
    Z = w.sum(); w = w / Z
    print(f"  Z = {Z:.4f}; total weight on the rows it got wrong now = {w[h != y].sum():.3f}")
    print("  new weights:", " ".join(f"{d}:{v:.4f}" for d, v in zip(days, w)))
    print(f"  team after {m} round(s): F =", " ".join(f"{v:+.3f}" for v in F),
          f"  training errors {(np.sign(F) != y).sum()} ({list(days[np.sign(F) != y])})")</div>
  <div class="fx" data-lang="text">--- round 1: weighted error of every stump ('yes' answer -&gt; Play / No play)
  Overcast?       yes-&gt;Play 0.357   yes-&gt;No play 0.643
  Sunny?          yes-&gt;Play 0.714   yes-&gt;No play 0.286
  Rain?           yes-&gt;Play 0.571   yes-&gt;No play 0.429
  Humidity high?  yes-&gt;Play 0.714   yes-&gt;No play 0.286
  Wind strong?    yes-&gt;Play 0.643   yes-&gt;No play 0.357
  chosen: Sunny? yes-&gt;No play   wrong on ['D6', 'D9', 'D11', 'D14']
  eps = 0.2857   alpha = 0.5*ln(0.7143/0.2857) = 0.4581
  Z = 0.9035; total weight on the rows it got wrong now = 0.500
  new weights: D1:0.0500 D2:0.0500 D3:0.0500 D4:0.0500 D5:0.0500 D6:0.1250 D7:0.0500 D8:0.0500 D9:0.1250 D10:0.0500 D11:0.1250 D12:0.0500 D13:0.0500 D14:0.1250
  team after 1 round(s): F = -0.458 -0.458 +0.458 +0.458 +0.458 +0.458 +0.458 -0.458 -0.458 +0.458 -0.458 +0.458 +0.458 +0.458   training errors 4 (['D6', 'D9', 'D11', 'D14'])
--- round 2: weighted error of every stump ('yes' answer -&gt; Play / No play)
  Overcast?       yes-&gt;Play 0.400   yes-&gt;No play 0.600
  Sunny?          yes-&gt;Play 0.500   yes-&gt;No play 0.500
  Rain?           yes-&gt;Play 0.700   yes-&gt;No play 0.300
  Humidity high?  yes-&gt;Play 0.725   yes-&gt;No play 0.275
  Wind strong?    yes-&gt;Play 0.675   yes-&gt;No play 0.325
  chosen: Humidity high? yes-&gt;No play   wrong on ['D3', 'D4', 'D6', 'D12']
  eps = 0.2750   alpha = 0.5*ln(0.7250/0.2750) = 0.4847
  Z = 0.8930; total weight on the rows it got wrong now = 0.500
  new weights: D1:0.0345 D2:0.0345 D3:0.0909 D4:0.0909 D5:0.0345 D6:0.2273 D7:0.0345 D8:0.0345 D9:0.0862 D10:0.0345 D11:0.0862 D12:0.0909 D13:0.0345 D14:0.0862
  team after 2 round(s): F = -0.943 -0.943 -0.027 -0.027 +0.943 +0.943 +0.943 -0.943 +0.027 +0.943 +0.027 -0.027 +0.943 -0.027   training errors 4 (['D3', 'D4', 'D6', 'D12'])
--- round 3: weighted error of every stump ('yes' answer -&gt; Play / No play)
  Overcast?       yes-&gt;Play 0.332   yes-&gt;No play 0.668
  Sunny?          yes-&gt;Play 0.514   yes-&gt;No play 0.486
  Rain?           yes-&gt;Play 0.737   yes-&gt;No play 0.263
  Humidity high?  yes-&gt;Play 0.500   yes-&gt;No play 0.500
  Wind strong?    yes-&gt;Play 0.719   yes-&gt;No play 0.281
  chosen: Rain? yes-&gt;No play   wrong on ['D1', 'D2', 'D4', 'D5', 'D8', 'D10']
  eps = 0.2633   alpha = 0.5*ln(0.7367/0.2633) = 0.5144
  Z = 0.8809; total weight on the rows it got wrong now = 0.500
  new weights: D1:0.0655 D2:0.0655 D3:0.0617 D4:0.1726 D5:0.0655 D6:0.1543 D7:0.0234 D8:0.0655 D9:0.0585 D10:0.0655 D11:0.0585 D12:0.0617 D13:0.0234 D14:0.0585
  team after 3 round(s): F = -0.428 -0.428 +0.488 -0.541 +0.428 +0.428 +1.457 -0.428 +0.541 +0.428 +0.541 +0.488 +1.457 -0.541   training errors 2 (['D4', 'D6'])</div>
  <h3>Round 1</h3>
  <p>All weights are 1/14 = 0.0714, so each stump's ε is just (mistakes)/14. "Sunny? → No play" (wrong on D6, D9, D11, D14) and "Humidity high? → No play" (wrong on D3, D4, D6, D12) tie at 4/14 = 0.286; the code keeps the first one in its list, Sunny?.</p>
  <table class="tbl">
    <tr><th>quantity</th><th>by hand</th><th>value</th></tr>
    <tr><td>ε₁</td><td>4 × 1/14 (D6, D9, D11, D14)</td><td>0.2857</td></tr>
    <tr><td>α₁</td><td>½ · ln(10/4) = ½ · ln 2.5 = ½ · 0.9163</td><td>0.4581</td></tr>
    <tr><td>right days (10)</td><td>(1/14) · e^{−0.4581} = 0.0714 · 0.6325</td><td>0.04518</td></tr>
    <tr><td>wrong days (4)</td><td>(1/14) · e^{0.4581} = 0.0714 · 1.5811</td><td>0.11294</td></tr>
    <tr><td>Z₁</td><td>10 · 0.04518 + 4 · 0.11294 = 0.4518 + 0.4518</td><td>0.9035</td></tr>
    <tr><td>new right weight</td><td>0.04518 / 0.9035 (= (1/14) / (20/14))</td><td>0.0500</td></tr>
    <tr><td>new wrong weight</td><td>0.11294 / 0.9035 (= (1/14) / (8/14))</td><td>0.1250</td></tr>
  </table>
  <p>Check: 10 × 0.05 + 4 × 0.125 = 0.5 + 0.5 = 1. The four days the first stump got wrong now hold half of all the weight.</p>
  <h3>Round 2</h3>
  <p>"Sunny? → No play" now scores exactly 0.500 (the 50/50 fact), so it is useless. "Humidity high? → No play" misses D3, D4, D12 (light, 0.05) and D6 (heavy, 0.125): ε₂ = 0.275, the smallest (section 02 worked this table).</p>
  <table class="tbl">
    <tr><th>quantity</th><th>by hand</th><th>value</th></tr>
    <tr><td>stump 2</td><td>Humidity high? yes → No play, else Play; wrong on D3, D4, D6, D12</td><td></td></tr>
    <tr><td>ε₂</td><td>3 · 0.05 + 0.125</td><td>0.2750</td></tr>
    <tr><td>α₂</td><td>½ · ln(0.725 / 0.275) = ½ · ln 2.636</td><td>0.4847</td></tr>
    <tr><td>D3, D4, D12 (wrong, were 0.05)</td><td>0.05 / (2 · 0.275)</td><td>0.0909</td></tr>
    <tr><td>D6 (wrong again, was 0.125)</td><td>0.125 / 0.55</td><td>0.2273</td></tr>
    <tr><td>D9, D11, D14 (right now, were 0.125)</td><td>0.125 / (2 · 0.725)</td><td>0.0862</td></tr>
    <tr><td>the other 7 days (right twice)</td><td>0.05 / 1.45</td><td>0.0345</td></tr>
  </table>
  <p>D6 (rain, normal humidity, strong wind, no play) has been wrong twice and is now the heaviest day by far (0.227, more than three times its start). D9, D11, D14 were wrong in round 1 and right in round 2: up, then part of the way down.</p>
  <h3>Round 3</h3>
  <p>"Rain? → No play" is wrong on six days (D1, D2, D8: not rain and not played; D4, D5, D10: rain but played), more than any earlier stump. But five of them are the lightest days (0.0345) and only D4 is medium (0.0909): ε₃ = 5 · 0.0345 + 0.0909 = 0.2633, the smallest of all, so it gets the biggest say, α₃ = ½ · ln(0.7367/0.2633) = 0.5144. A stump with more mistakes wins because its mistakes are on days the team already handles well.</p>
  <figure class="viz"><svg viewBox="0 0 700 440" width="700"><text x="130" y="16" text-anchor="middle" class="tm" font-size="10.5">D1</text><text x="170" y="16" text-anchor="middle" class="tm" font-size="10.5">D2</text><text x="210" y="16" text-anchor="middle" class="tm" font-size="10.5">D3</text><text x="250" y="16" text-anchor="middle" class="tm" font-size="10.5">D4</text><text x="290" y="16" text-anchor="middle" class="tm" font-size="10.5">D5</text><text x="330" y="16" text-anchor="middle" class="tm" font-size="10.5">D6</text><text x="370" y="16" text-anchor="middle" class="tm" font-size="10.5">D7</text><text x="410" y="16" text-anchor="middle" class="tm" font-size="10.5">D8</text><text x="450" y="16" text-anchor="middle" class="tm" font-size="10.5">D9</text><text x="490" y="16" text-anchor="middle" class="tm" font-size="10.5">D10</text><text x="530" y="16" text-anchor="middle" class="tm" font-size="10.5">D11</text><text x="570" y="16" text-anchor="middle" class="tm" font-size="10.5">D12</text><text x="610" y="16" text-anchor="middle" class="tm" font-size="10.5">D13</text><text x="650" y="16" text-anchor="middle" class="tm" font-size="10.5">D14</text><text x="8" y="56" font-size="11.5">start</text><line x1="112" y1="52" x2="652" y2="52" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="130" y="56" text-anchor="middle" font-size="9.5">−</text><text x="130" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="170" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="170" y="56" text-anchor="middle" font-size="9.5">−</text><text x="170" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="210" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="210" y="56" text-anchor="middle" font-size="9.5">+</text><text x="210" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="250" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="250" y="56" text-anchor="middle" font-size="9.5">+</text><text x="250" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="290" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="290" y="56" text-anchor="middle" font-size="9.5">+</text><text x="290" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="330" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="330" y="56" text-anchor="middle" font-size="9.5">−</text><text x="330" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="330" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="370" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="370" y="56" text-anchor="middle" font-size="9.5">+</text><text x="370" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="410" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="410" y="56" text-anchor="middle" font-size="9.5">−</text><text x="410" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="450" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="450" y="56" text-anchor="middle" font-size="9.5">+</text><text x="450" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="450" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="490" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="490" y="56" text-anchor="middle" font-size="9.5">+</text><text x="490" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="530" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="530" y="56" text-anchor="middle" font-size="9.5">+</text><text x="530" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="530" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="570" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="570" y="56" text-anchor="middle" font-size="9.5">+</text><text x="570" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="610" cy="52" r="9.8" class="fb sb" stroke-width="1.5"/><text x="610" y="56" text-anchor="middle" font-size="9.5">+</text><text x="610" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="650" cy="52" r="9.8" class="fr sr" stroke-width="1.5"/><text x="650" y="56" text-anchor="middle" font-size="9.5">−</text><text x="650" y="83" text-anchor="middle" class="tm" font-size="8.5">0.071</text><circle cx="650" cy="52" r="13.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><text x="390" y="102" text-anchor="middle" class="tg" font-size="10.5">stump 1: Sunny? → No play (dashed rings = days it gets wrong)</text><text x="8" y="160" font-size="11.5">after round 1</text><line x1="112" y1="156" x2="652" y2="156" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="156" r="8.2" class="fr sr" stroke-width="1.5"/><text x="130" y="160" text-anchor="middle" font-size="9.5">−</text><text x="130" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="170" cy="156" r="8.2" class="fr sr" stroke-width="1.5"/><text x="170" y="160" text-anchor="middle" font-size="9.5">−</text><text x="170" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="210" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="210" y="160" text-anchor="middle" font-size="9.5">+</text><text x="210" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="210" cy="156" r="12.2" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="250" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="250" y="160" text-anchor="middle" font-size="9.5">+</text><text x="250" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="250" cy="156" r="12.2" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="290" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="290" y="160" text-anchor="middle" font-size="9.5">+</text><text x="290" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="330" cy="156" r="13.0" class="fr sr" stroke-width="1.5"/><text x="330" y="160" text-anchor="middle" font-size="9.5">−</text><text x="330" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><circle cx="330" cy="156" r="17.0" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="370" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="370" y="160" text-anchor="middle" font-size="9.5">+</text><text x="370" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="410" cy="156" r="8.2" class="fr sr" stroke-width="1.5"/><text x="410" y="160" text-anchor="middle" font-size="9.5">−</text><text x="410" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="450" cy="156" r="13.0" class="fb sb" stroke-width="1.5"/><text x="450" y="160" text-anchor="middle" font-size="9.5">+</text><text x="450" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><circle cx="490" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="490" y="160" text-anchor="middle" font-size="9.5">+</text><text x="490" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="530" cy="156" r="13.0" class="fb sb" stroke-width="1.5"/><text x="530" y="160" text-anchor="middle" font-size="9.5">+</text><text x="530" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><circle cx="570" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="570" y="160" text-anchor="middle" font-size="9.5">+</text><text x="570" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="570" cy="156" r="12.2" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="610" cy="156" r="8.2" class="fb sb" stroke-width="1.5"/><text x="610" y="160" text-anchor="middle" font-size="9.5">+</text><text x="610" y="187" text-anchor="middle" class="tm" font-size="8.5">0.050</text><circle cx="650" cy="156" r="13.0" class="fr sr" stroke-width="1.5"/><text x="650" y="160" text-anchor="middle" font-size="9.5">−</text><text x="650" y="187" text-anchor="middle" class="tm" font-size="8.5">0.125</text><text x="390" y="206" text-anchor="middle" class="tg" font-size="10.5">stump 2: Humidity high? → No play (dashed rings = days it gets wrong)</text><text x="8" y="264" font-size="11.5">after round 2</text><line x1="112" y1="260" x2="652" y2="260" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="260" r="6.8" class="fr sr" stroke-width="1.5"/><text x="130" y="264" text-anchor="middle" font-size="9.5">−</text><text x="130" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="130" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="170" cy="260" r="6.8" class="fr sr" stroke-width="1.5"/><text x="170" y="264" text-anchor="middle" font-size="9.5">−</text><text x="170" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="170" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="210" cy="260" r="11.1" class="fb sb" stroke-width="1.5"/><text x="210" y="264" text-anchor="middle" font-size="9.5">+</text><text x="210" y="291" text-anchor="middle" class="tm" font-size="8.5">0.091</text><circle cx="250" cy="260" r="11.1" class="fb sb" stroke-width="1.5"/><text x="250" y="264" text-anchor="middle" font-size="9.5">+</text><text x="250" y="291" text-anchor="middle" class="tm" font-size="8.5">0.091</text><circle cx="250" cy="260" r="15.1" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="290" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="290" y="264" text-anchor="middle" font-size="9.5">+</text><text x="290" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="290" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="330" cy="260" r="17.5" class="fr sr" stroke-width="1.5"/><text x="330" y="264" text-anchor="middle" font-size="9.5">−</text><text x="330" y="291" text-anchor="middle" class="tm" font-size="8.5">0.227</text><circle cx="370" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="370" y="264" text-anchor="middle" font-size="9.5">+</text><text x="370" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="410" cy="260" r="6.8" class="fr sr" stroke-width="1.5"/><text x="410" y="264" text-anchor="middle" font-size="9.5">−</text><text x="410" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="410" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="450" cy="260" r="10.8" class="fb sb" stroke-width="1.5"/><text x="450" y="264" text-anchor="middle" font-size="9.5">+</text><text x="450" y="291" text-anchor="middle" class="tm" font-size="8.5">0.086</text><circle cx="490" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="490" y="264" text-anchor="middle" font-size="9.5">+</text><text x="490" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="490" cy="260" r="10.8" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="530" cy="260" r="10.8" class="fb sb" stroke-width="1.5"/><text x="530" y="264" text-anchor="middle" font-size="9.5">+</text><text x="530" y="291" text-anchor="middle" class="tm" font-size="8.5">0.086</text><circle cx="570" cy="260" r="11.1" class="fb sb" stroke-width="1.5"/><text x="570" y="264" text-anchor="middle" font-size="9.5">+</text><text x="570" y="291" text-anchor="middle" class="tm" font-size="8.5">0.091</text><circle cx="610" cy="260" r="6.8" class="fb sb" stroke-width="1.5"/><text x="610" y="264" text-anchor="middle" font-size="9.5">+</text><text x="610" y="291" text-anchor="middle" class="tm" font-size="8.5">0.034</text><circle cx="650" cy="260" r="10.8" class="fr sr" stroke-width="1.5"/><text x="650" y="264" text-anchor="middle" font-size="9.5">−</text><text x="650" y="291" text-anchor="middle" class="tm" font-size="8.5">0.086</text><text x="390" y="310" text-anchor="middle" class="tg" font-size="10.5">stump 3: Rain? → No play (dashed rings = days it gets wrong)</text><text x="8" y="368" font-size="11.5">after round 3</text><line x1="112" y1="364" x2="652" y2="364" stroke="currentColor" stroke-opacity="0.2"/><circle cx="130" cy="364" r="9.4" class="fr sr" stroke-width="1.5"/><text x="130" y="368" text-anchor="middle" font-size="9.5">−</text><text x="130" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="170" cy="364" r="9.4" class="fr sr" stroke-width="1.5"/><text x="170" y="368" text-anchor="middle" font-size="9.5">−</text><text x="170" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="210" cy="364" r="9.1" class="fb sb" stroke-width="1.5"/><text x="210" y="368" text-anchor="middle" font-size="9.5">+</text><text x="210" y="395" text-anchor="middle" class="tm" font-size="8.5">0.062</text><circle cx="250" cy="364" r="15.3" class="fb sb" stroke-width="1.5"/><text x="250" y="368" text-anchor="middle" font-size="9.5">+</text><text x="250" y="395" text-anchor="middle" class="tm" font-size="8.5">0.173</text><circle cx="290" cy="364" r="9.4" class="fb sb" stroke-width="1.5"/><text x="290" y="368" text-anchor="middle" font-size="9.5">+</text><text x="290" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="330" cy="364" r="14.4" class="fr sr" stroke-width="1.5"/><text x="330" y="368" text-anchor="middle" font-size="9.5">−</text><text x="330" y="395" text-anchor="middle" class="tm" font-size="8.5">0.154</text><circle cx="370" cy="364" r="5.6" class="fb sb" stroke-width="1.5"/><text x="370" y="368" text-anchor="middle" font-size="9.5">+</text><text x="370" y="395" text-anchor="middle" class="tm" font-size="8.5">0.023</text><circle cx="410" cy="364" r="9.4" class="fr sr" stroke-width="1.5"/><text x="410" y="368" text-anchor="middle" font-size="9.5">−</text><text x="410" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="450" cy="364" r="8.9" class="fb sb" stroke-width="1.5"/><text x="450" y="368" text-anchor="middle" font-size="9.5">+</text><text x="450" y="395" text-anchor="middle" class="tm" font-size="8.5">0.059</text><circle cx="490" cy="364" r="9.4" class="fb sb" stroke-width="1.5"/><text x="490" y="368" text-anchor="middle" font-size="9.5">+</text><text x="490" y="395" text-anchor="middle" class="tm" font-size="8.5">0.065</text><circle cx="530" cy="364" r="8.9" class="fb sb" stroke-width="1.5"/><text x="530" y="368" text-anchor="middle" font-size="9.5">+</text><text x="530" y="395" text-anchor="middle" class="tm" font-size="8.5">0.059</text><circle cx="570" cy="364" r="9.1" class="fb sb" stroke-width="1.5"/><text x="570" y="368" text-anchor="middle" font-size="9.5">+</text><text x="570" y="395" text-anchor="middle" class="tm" font-size="8.5">0.062</text><circle cx="610" cy="364" r="5.6" class="fb sb" stroke-width="1.5"/><text x="610" y="368" text-anchor="middle" font-size="9.5">+</text><text x="610" y="395" text-anchor="middle" class="tm" font-size="8.5">0.023</text><circle cx="650" cy="364" r="8.9" class="fr sr" stroke-width="1.5"/><text x="650" y="368" text-anchor="middle" font-size="9.5">−</text><text x="650" y="395" text-anchor="middle" class="tm" font-size="8.5">0.059</text></svg><figcaption>The 14 diary days in four snapshots. Circle area = day weight (number under each circle); blue + = played, red − = not played. Dashed rings mark the days the next stump gets wrong; they grow in the next snapshot while the others shrink. D6 grows twice.</figcaption></figure>
  <h3>The final vote</h3>
  <p>h₁ = −1 if Sunny else +1; h₂ = −1 if humidity high else +1; h₃ = −1 if Rain else +1. F = 0.4581·h₁ + 0.4847·h₂ + 0.5144·h₃. Days with the same outlook and humidity get the same F:</p>
  <table class="tbl">
    <tr><th>days</th><th>Outlook, Humidity</th><th>true</th><th>h₁</th><th>h₂</th><th>h₃</th><th>F = Σ α·h</th><th>vote</th><th>right?</th></tr>
    <tr><td>D1, D2, D8</td><td>Sunny, High</td><td>No</td><td>−1</td><td>−1</td><td>+1</td><td>−0.458 − 0.485 + 0.514 = −0.428</td><td>No</td><td>✔</td></tr>
    <tr><td>D9, D11</td><td>Sunny, Normal</td><td>Yes</td><td>−1</td><td>+1</td><td>+1</td><td>−0.458 + 0.485 + 0.514 = +0.541</td><td>Yes</td><td>✔</td></tr>
    <tr><td>D3, D12</td><td>Overcast, High</td><td>Yes</td><td>+1</td><td>−1</td><td>+1</td><td>+0.458 − 0.485 + 0.514 = +0.488</td><td>Yes</td><td>✔</td></tr>
    <tr><td>D7, D13</td><td>Overcast, Normal</td><td>Yes</td><td>+1</td><td>+1</td><td>+1</td><td>+1.457</td><td>Yes</td><td>✔</td></tr>
    <tr><td>D14</td><td>Rain, High</td><td>No</td><td>+1</td><td>−1</td><td>−1</td><td>+0.458 − 0.485 − 0.514 = −0.541</td><td>No</td><td>✔</td></tr>
    <tr><td>D4</td><td>Rain, High</td><td>Yes</td><td>+1</td><td>−1</td><td>−1</td><td>−0.541</td><td>No</td><td>✘</td></tr>
    <tr><td>D5, D10</td><td>Rain, Normal</td><td>Yes</td><td>+1</td><td>+1</td><td>−1</td><td>+0.458 + 0.485 − 0.514 = +0.428</td><td>Yes</td><td>✔</td></tr>
    <tr><td>D6</td><td>Rain, Normal</td><td>No</td><td>+1</td><td>+1</td><td>−1</td><td>+0.428</td><td>Yes</td><td>✘</td></tr>
  </table>
  <p>Each stump alone gets 8 to 10 of the 14 days right. Together, after three rounds, 12 are right; the code's last line shows the training errors going 4 → 4 → 2. The two days still wrong, D4 and D6, are rainy days decided by the <em>wind</em> (D4 calm and played, D6 windy and not), and they share their outlook and humidity with days of the opposite label. More rounds bring in "Wind strong?", but a sum of one-question stumps can never get every day right: the true rule "rain <em>and</em> windy → no play" is an interaction, and stumps add up separate effects (section 10 shows depth-2 trees fixing it).</p>
  <div class="bridge"><b>What this still can't tell us → next: The exponential loss.</b> The formulas work on the diary, but they look invented: why ½·ln, why e^{±α}? They fall out of minimising one specific loss, and that view is what later led to gradient boosting.</div>

  <h2 id="ada-exp"><span class="num">05</span>Why These Formulas: the Exponential Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The trace showed the formulas work, but they look invented: why ½·ln((1−ε)/ε)? Why multiply by e^{±α}? Is AdaBoost secretly minimising something?</p>
  </div>
  <p>For five years AdaBoost worked without anyone fully knowing <em>what it was optimising</em>. In 2000, Friedman, Hastie and Tibshirani showed it is exactly <strong>forward stagewise additive modelling</strong> (see <a class="xref" data-note="ml_boosting">How Boosting Works</a>) with the <strong>exponential loss</strong>:</p>
  <div class="callout def"><span class="label">Exponential loss</span>
    <p><strong>L(y, F(x)) = e^{−y·F(x)}</strong>. With margin y·F: a row that is confidently right (margin +2) costs e^{−2} = 0.14; a row on the fence (margin 0) costs 1; a row confidently wrong (margin −2) costs e^{2} = 7.4. The loss of the whole training set is Σᵢ e^{−yᵢF(xᵢ)}.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 290" width="600"><line x1="60" y1="240" x2="560" y2="240" stroke="currentColor"/><line x1="360.0" y1="20" x2="360.0" y2="240" stroke="currentColor" stroke-opacity="0.4"/><text x="60.0" y="256" text-anchor="middle" class="tm" font-size="11">-3</text><text x="160.0" y="256" text-anchor="middle" class="tm" font-size="11">-2</text><text x="260.0" y="256" text-anchor="middle" class="tm" font-size="11">-1</text><text x="360.0" y="256" text-anchor="middle" class="tm" font-size="11">0</text><text x="460.0" y="256" text-anchor="middle" class="tm" font-size="11">1</text><text x="560.0" y="256" text-anchor="middle" class="tm" font-size="11">2</text><text x="52" y="200.0" text-anchor="end" class="tm" font-size="11">2</text><line x1="60" y1="196.0" x2="560" y2="196.0" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="156.0" text-anchor="end" class="tm" font-size="11">4</text><line x1="60" y1="152.0" x2="560" y2="152.0" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="112.0" text-anchor="end" class="tm" font-size="11">6</text><line x1="60" y1="108.0" x2="560" y2="108.0" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="68.0" text-anchor="end" class="tm" font-size="11">8</text><line x1="60" y1="63.99999999999999" x2="560" y2="63.99999999999999" stroke="currentColor" stroke-opacity="0.1"/><text x="52" y="24.0" text-anchor="end" class="tm" font-size="11">10</text><line x1="60" y1="20.0" x2="560" y2="20.0" stroke="currentColor" stroke-opacity="0.1"/><polyline points="60.0,218.0 61.7,218.0 63.3,218.0 65.0,218.0 66.7,218.0 68.4,218.0 70.0,218.0 71.7,218.0 73.4,218.0 75.1,218.0 76.7,218.0 78.4,218.0 80.1,218.0 81.7,218.0 83.4,218.0 85.1,218.0 86.8,218.0 88.4,218.0 90.1,218.0 91.8,218.0 93.4,218.0 95.1,218.0 96.8,218.0 98.5,218.0 100.1,218.0 101.8,218.0 103.5,218.0 105.2,218.0 106.8,218.0 108.5,218.0 110.2,218.0 111.8,218.0 113.5,218.0 115.2,218.0 116.9,218.0 118.5,218.0 120.2,218.0 121.9,218.0 123.5,218.0 125.2,218.0 126.9,218.0 128.6,218.0 130.2,218.0 131.9,218.0 133.6,218.0 135.3,218.0 136.9,218.0 138.6,218.0 140.3,218.0 141.9,218.0 143.6,218.0 145.3,218.0 147.0,218.0 148.6,218.0 150.3,218.0 152.0,218.0 153.6,218.0 155.3,218.0 157.0,218.0 158.7,218.0 160.3,218.0 162.0,218.0 163.7,218.0 165.4,218.0 167.0,218.0 168.7,218.0 170.4,218.0 172.0,218.0 173.7,218.0 175.4,218.0 177.1,218.0 178.7,218.0 180.4,218.0 182.1,218.0 183.7,218.0 185.4,218.0 187.1,218.0 188.8,218.0 190.4,218.0 192.1,218.0 193.8,218.0 195.5,218.0 197.1,218.0 198.8,218.0 200.5,218.0 202.1,218.0 203.8,218.0 205.5,218.0 207.2,218.0 208.8,218.0 210.5,218.0 212.2,218.0 213.8,218.0 215.5,218.0 217.2,218.0 218.9,218.0 220.5,218.0 222.2,218.0 223.9,218.0 225.6,218.0 227.2,218.0 228.9,218.0 230.6,218.0 232.2,218.0 233.9,218.0 235.6,218.0 237.3,218.0 238.9,218.0 240.6,218.0 242.3,218.0 243.9,218.0 245.6,218.0 247.3,218.0 249.0,218.0 250.6,218.0 252.3,218.0 254.0,218.0 255.7,218.0 257.3,218.0 259.0,218.0 260.7,218.0 262.3,218.0 264.0,218.0 265.7,218.0 267.4,218.0 269.0,218.0 270.7,218.0 272.4,218.0 274.0,218.0 275.7,218.0 277.4,218.0 279.1,218.0 280.7,218.0 282.4,218.0 284.1,218.0 285.8,218.0 287.4,218.0 289.1,218.0 290.8,218.0 292.4,218.0 294.1,218.0 295.8,218.0 297.5,218.0 299.1,218.0 300.8,218.0 302.5,218.0 304.1,218.0 305.8,218.0 307.5,218.0 309.2,218.0 310.8,218.0 312.5,218.0 314.2,218.0 315.9,218.0 317.5,218.0 319.2,218.0 320.9,218.0 322.5,218.0 324.2,218.0 325.9,218.0 327.6,218.0 329.2,218.0 330.9,218.0 332.6,218.0 334.2,218.0 335.9,218.0 337.6,218.0 339.3,218.0 340.9,218.0 342.6,218.0 344.3,218.0 346.0,218.0 347.6,218.0 349.3,218.0 351.0,218.0 352.6,218.0 354.3,218.0 356.0,218.0 357.7,218.0 359.3,218.0 361.0,240.0 362.7,240.0 364.3,240.0 366.0,240.0 367.7,240.0 369.4,240.0 371.0,240.0 372.7,240.0 374.4,240.0 376.1,240.0 377.7,240.0 379.4,240.0 381.1,240.0 382.7,240.0 384.4,240.0 386.1,240.0 387.8,240.0 389.4,240.0 391.1,240.0 392.8,240.0 394.4,240.0 396.1,240.0 397.8,240.0 399.5,240.0 401.1,240.0 402.8,240.0 404.5,240.0 406.2,240.0 407.8,240.0 409.5,240.0 411.2,240.0 412.8,240.0 414.5,240.0 416.2,240.0 417.9,240.0 419.5,240.0 421.2,240.0 422.9,240.0 424.5,240.0 426.2,240.0 427.9,240.0 429.6,240.0 431.2,240.0 432.9,240.0 434.6,240.0 436.3,240.0 437.9,240.0 439.6,240.0 441.3,240.0 442.9,240.0 444.6,240.0 446.3,240.0 448.0,240.0 449.6,240.0 451.3,240.0 453.0,240.0 454.6,240.0 456.3,240.0 458.0,240.0 459.7,240.0 461.3,240.0 463.0,240.0 464.7,240.0 466.4,240.0 468.0,240.0 469.7,240.0 471.4,240.0 473.0,240.0 474.7,240.0 476.4,240.0 478.1,240.0 479.7,240.0 481.4,240.0 483.1,240.0 484.7,240.0 486.4,240.0 488.1,240.0 489.8,240.0 491.4,240.0 493.1,240.0 494.8,240.0 496.5,240.0 498.1,240.0 499.8,240.0 501.5,240.0 503.1,240.0 504.8,240.0 506.5,240.0 508.2,240.0 509.8,240.0 511.5,240.0 513.2,240.0 514.8,240.0 516.5,240.0 518.2,240.0 519.9,240.0 521.5,240.0 523.2,240.0 524.9,240.0 526.6,240.0 528.2,240.0 529.9,240.0 531.6,240.0 533.2,240.0 534.9,240.0 536.6,240.0 538.3,240.0 539.9,240.0 541.6,240.0 543.3,240.0 544.9,240.0 546.6,240.0 548.3,240.0 550.0,240.0 551.6,240.0 553.3,240.0 555.0,240.0 556.7,240.0 558.3,240.0 560.0,240.0" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="260" y1="30" x2="282" y2="30" stroke="currentColor" stroke-width="2.5"/><text x="288" y="34" font-size="11.5">0-1 loss (counts mistakes)</text><polyline points="130.2,21.1 131.9,24.7 133.6,28.3 135.3,31.8 136.9,35.2 138.6,38.6 140.3,42.0 141.9,45.3 143.6,48.5 145.3,51.7 147.0,54.8 148.6,57.9 150.3,60.9 152.0,63.9 153.6,66.8 155.3,69.6 157.0,72.5 158.7,75.3 160.3,78.0 162.0,80.7 163.7,83.3 165.4,85.9 167.0,88.5 168.7,91.0 170.4,93.5 172.0,95.9 173.7,98.3 175.4,100.6 177.1,102.9 178.7,105.2 180.4,107.4 182.1,109.6 183.7,111.8 185.4,113.9 187.1,116.0 188.8,118.1 190.4,120.1 192.1,122.1 193.8,124.0 195.5,126.0 197.1,127.9 198.8,129.7 200.5,131.5 202.1,133.3 203.8,135.1 205.5,136.8 207.2,138.6 208.8,140.2 210.5,141.9 212.2,143.5 213.8,145.1 215.5,146.7 217.2,148.2 218.9,149.8 220.5,151.3 222.2,152.7 223.9,154.2 225.6,155.6 227.2,157.0 228.9,158.4 230.6,159.7 232.2,161.1 233.9,162.4 235.6,163.7 237.3,164.9 238.9,166.2 240.6,167.4 242.3,168.6 243.9,169.8 245.6,170.9 247.3,172.1 249.0,173.2 250.6,174.3 252.3,175.4 254.0,176.5 255.7,177.5 257.3,178.6 259.0,179.6 260.7,180.6 262.3,181.6 264.0,182.6 265.7,183.5 267.4,184.4 269.0,185.4 270.7,186.3 272.4,187.2 274.0,188.0 275.7,188.9 277.4,189.7 279.1,190.6 280.7,191.4 282.4,192.2 284.1,193.0 285.8,193.8 287.4,194.5 289.1,195.3 290.8,196.0 292.4,196.8 294.1,197.5 295.8,198.2 297.5,198.9 299.1,199.6 300.8,200.2 302.5,200.9 304.1,201.5 305.8,202.2 307.5,202.8 309.2,203.4 310.8,204.0 312.5,204.6 314.2,205.2 315.9,205.8 317.5,206.4 319.2,206.9 320.9,207.5 322.5,208.0 324.2,208.5 325.9,209.1 327.6,209.6 329.2,210.1 330.9,210.6 332.6,211.1 334.2,211.5 335.9,212.0 337.6,212.5 339.3,212.9 340.9,213.4 342.6,213.8 344.3,214.3 346.0,214.7 347.6,215.1 349.3,215.5 351.0,215.9 352.6,216.3 354.3,216.7 356.0,217.1 357.7,217.5 359.3,217.9 361.0,218.2 362.7,218.6 364.3,218.9 366.0,219.3 367.7,219.6 369.4,220.0 371.0,220.3 372.7,220.6 374.4,220.9 376.1,221.3 377.7,221.6 379.4,221.9 381.1,222.2 382.7,222.5 384.4,222.8 386.1,223.1 387.8,223.3 389.4,223.6 391.1,223.9 392.8,224.1 394.4,224.4 396.1,224.7 397.8,224.9 399.5,225.2 401.1,225.4 402.8,225.7 404.5,225.9 406.2,226.1 407.8,226.4 409.5,226.6 411.2,226.8 412.8,227.0 414.5,227.2 416.2,227.5 417.9,227.7 419.5,227.9 421.2,228.1 422.9,228.3 424.5,228.5 426.2,228.7 427.9,228.8 429.6,229.0 431.2,229.2 432.9,229.4 434.6,229.6 436.3,229.7 437.9,229.9 439.6,230.1 441.3,230.2 442.9,230.4 444.6,230.6 446.3,230.7 448.0,230.9 449.6,231.0 451.3,231.2 453.0,231.3 454.6,231.5 456.3,231.6 458.0,231.7 459.7,231.9 461.3,232.0 463.0,232.1 464.7,232.3 466.4,232.4 468.0,232.5 469.7,232.7 471.4,232.8 473.0,232.9 474.7,233.0 476.4,233.1 478.1,233.2 479.7,233.4 481.4,233.5 483.1,233.6 484.7,233.7 486.4,233.8 488.1,233.9 489.8,234.0 491.4,234.1 493.1,234.2 494.8,234.3 496.5,234.4 498.1,234.5 499.8,234.6 501.5,234.7 503.1,234.7 504.8,234.8 506.5,234.9 508.2,235.0 509.8,235.1 511.5,235.2 513.2,235.2 514.8,235.3 516.5,235.4 518.2,235.5 519.9,235.6 521.5,235.6 523.2,235.7 524.9,235.8 526.6,235.8 528.2,235.9 529.9,236.0 531.6,236.0 533.2,236.1 534.9,236.2 536.6,236.2 538.3,236.3 539.9,236.4 541.6,236.4 543.3,236.5 544.9,236.5 546.6,236.6 548.3,236.7 550.0,236.7 551.6,236.8 553.3,236.8 555.0,236.9 556.7,236.9 558.3,237.0 560.0,237.0" fill="none" class="sr" stroke-width="2.2"/><line x1="260" y1="47" x2="282" y2="47" class="sr" stroke-width="2.5"/><text x="288" y="51" font-size="11.5">exponential e^(−yF)  ← AdaBoost</text><polyline points="60.0,49.5 61.7,50.5 63.3,51.6 65.0,52.7 66.7,53.7 68.4,54.8 70.0,55.8 71.7,56.9 73.4,58.0 75.1,59.0 76.7,60.1 78.4,61.1 80.1,62.2 81.7,63.2 83.4,64.3 85.1,65.4 86.8,66.4 88.4,67.5 90.1,68.5 91.8,69.6 93.4,70.6 95.1,71.7 96.8,72.8 98.5,73.8 100.1,74.9 101.8,75.9 103.5,77.0 105.2,78.0 106.8,79.1 108.5,80.1 110.2,81.2 111.8,82.3 113.5,83.3 115.2,84.4 116.9,85.4 118.5,86.5 120.2,87.5 121.9,88.6 123.5,89.6 125.2,90.7 126.9,91.7 128.6,92.8 130.2,93.8 131.9,94.9 133.6,95.9 135.3,97.0 136.9,98.0 138.6,99.1 140.3,100.1 141.9,101.2 143.6,102.2 145.3,103.3 147.0,104.3 148.6,105.4 150.3,106.4 152.0,107.5 153.6,108.5 155.3,109.5 157.0,110.6 158.7,111.6 160.3,112.7 162.0,113.7 163.7,114.8 165.4,115.8 167.0,116.8 168.7,117.9 170.4,118.9 172.0,120.0 173.7,121.0 175.4,122.0 177.1,123.1 178.7,124.1 180.4,125.1 182.1,126.2 183.7,127.2 185.4,128.2 187.1,129.3 188.8,130.3 190.4,131.3 192.1,132.3 193.8,133.4 195.5,134.4 197.1,135.4 198.8,136.4 200.5,137.5 202.1,138.5 203.8,139.5 205.5,140.5 207.2,141.5 208.8,142.5 210.5,143.5 212.2,144.6 213.8,145.6 215.5,146.6 217.2,147.6 218.9,148.6 220.5,149.6 222.2,150.6 223.9,151.6 225.6,152.6 227.2,153.6 228.9,154.6 230.6,155.5 232.2,156.5 233.9,157.5 235.6,158.5 237.3,159.5 238.9,160.4 240.6,161.4 242.3,162.4 243.9,163.4 245.6,164.3 247.3,165.3 249.0,166.2 250.6,167.2 252.3,168.2 254.0,169.1 255.7,170.0 257.3,171.0 259.0,171.9 260.7,172.9 262.3,173.8 264.0,174.7 265.7,175.6 267.4,176.6 269.0,177.5 270.7,178.4 272.4,179.3 274.0,180.2 275.7,181.1 277.4,182.0 279.1,182.9 280.7,183.8 282.4,184.6 284.1,185.5 285.8,186.4 287.4,187.3 289.1,188.1 290.8,189.0 292.4,189.8 294.1,190.6 295.8,191.5 297.5,192.3 299.1,193.1 300.8,193.9 302.5,194.8 304.1,195.6 305.8,196.4 307.5,197.1 309.2,197.9 310.8,198.7 312.5,199.5 314.2,200.2 315.9,201.0 317.5,201.7 319.2,202.5 320.9,203.2 322.5,203.9 324.2,204.7 325.9,205.4 327.6,206.1 329.2,206.8 330.9,207.4 332.6,208.1 334.2,208.8 335.9,209.4 337.6,210.1 339.3,210.7 340.9,211.4 342.6,212.0 344.3,212.6 346.0,213.2 347.6,213.8 349.3,214.4 351.0,215.0 352.6,215.6 354.3,216.1 356.0,216.7 357.7,217.2 359.3,217.8 361.0,218.3 362.7,218.8 364.3,219.3 366.0,219.9 367.7,220.3 369.4,220.8 371.0,221.3 372.7,221.8 374.4,222.2 376.1,222.7 377.7,223.1 379.4,223.6 381.1,224.0 382.7,224.4 384.4,224.8 386.1,225.2 387.8,225.6 389.4,226.0 391.1,226.4 392.8,226.7 394.4,227.1 396.1,227.4 397.8,227.8 399.5,228.1 401.1,228.4 402.8,228.8 404.5,229.1 406.2,229.4 407.8,229.7 409.5,230.0 411.2,230.3 412.8,230.5 414.5,230.8 416.2,231.1 417.9,231.3 419.5,231.6 421.2,231.8 422.9,232.1 424.5,232.3 426.2,232.5 427.9,232.7 429.6,232.9 431.2,233.2 432.9,233.4 434.6,233.6 436.3,233.8 437.9,233.9 439.6,234.1 441.3,234.3 442.9,234.5 444.6,234.6 446.3,234.8 448.0,235.0 449.6,235.1 451.3,235.3 453.0,235.4 454.6,235.5 456.3,235.7 458.0,235.8 459.7,235.9 461.3,236.1 463.0,236.2 464.7,236.3 466.4,236.4 468.0,236.5 469.7,236.6 471.4,236.8 473.0,236.9 474.7,237.0 476.4,237.0 478.1,237.1 479.7,237.2 481.4,237.3 483.1,237.4 484.7,237.5 486.4,237.6 488.1,237.6 489.8,237.7 491.4,237.8 493.1,237.9 494.8,237.9 496.5,238.0 498.1,238.1 499.8,238.1 501.5,238.2 503.1,238.2 504.8,238.3 506.5,238.3 508.2,238.4 509.8,238.5 511.5,238.5 513.2,238.6 514.8,238.6 516.5,238.6 518.2,238.7 519.9,238.7 521.5,238.8 523.2,238.8 524.9,238.8 526.6,238.9 528.2,238.9 529.9,239.0 531.6,239.0 533.2,239.0 534.9,239.1 536.6,239.1 538.3,239.1 539.9,239.1 541.6,239.2 543.3,239.2 544.9,239.2 546.6,239.2 548.3,239.3 550.0,239.3 551.6,239.3 553.3,239.3 555.0,239.4 556.7,239.4 558.3,239.4 560.0,239.4" fill="none" class="sb" stroke-width="2.2"/><line x1="260" y1="64" x2="282" y2="64" class="sb" stroke-width="2.5"/><text x="288" y="68" font-size="11.5">log-loss log₂(1+e^(−2yF)) ← GBM</text><text x="310.0" y="284" text-anchor="middle" class="tm" font-size="11.5">margin y·F(x): negative = wrong side, positive = right side</text></svg><figcaption>Three losses as a function of the margin y·F(x). Both smooth losses sit above the 0-1 loss, so pushing them down pushes mistakes down. For a row on the wrong side (left), exponential loss explodes while log-loss grows only in a straight line: that is the whole story of AdaBoost's noise sensitivity.</figcaption></figure>
  <h3>The derivation, step by step</h3>
  <p>Suppose the team so far is F_{m−1}. We add one more stump h with a say α, and we want to choose both to make the total exponential loss as small as possible (the stagewise step):</p>
  <p><strong>1. Pull out the weights.</strong> Σᵢ e^{−yᵢ(F_{m−1}(xᵢ) + α h(xᵢ))} = Σᵢ e^{−yᵢF_{m−1}(xᵢ)} · e^{−α yᵢ h(xᵢ)}. The first factor does not depend on the new stump. Call it <strong>wᵢ = e^{−yᵢF_{m−1}(xᵢ)}</strong>. These are exactly AdaBoost's row weights: rows the team gets wrong (negative margin) have big wᵢ. So the loss is Σ wᵢ · e^{−α yᵢ h(xᵢ)}.</p>
  <p><strong>2. Split into right and wrong rows.</strong> Right rows have y·h = +1, wrong rows −1. With W = Σ wᵢ and ε = (weight of wrong rows)/W, the loss is W · [ (1−ε)·e^{−α} + ε·e^{α} ].</p>
  <p><strong>3. Best stump.</strong> For any fixed α &gt; 0, the bracket is (e^{α} − e^{−α})·ε + e^{−α}, which grows with ε. So the best stump is the one with the <strong>smallest weighted error</strong>. That is step (a)–(b).</p>
  <p><strong>4. Best α.</strong> Differentiate the bracket with respect to α and set to 0: −(1−ε)e^{−α} + ε e^{α} = 0 → e^{2α} = (1−ε)/ε → <strong>α = ½ · ln((1−ε)/ε)</strong>. That is step (d), and now you see where the ½ comes from: it is the square root hidden in e^{2α}.</p>
  <p><strong>5. Next weights.</strong> The new wᵢ for the following round is e^{−yᵢF_m(xᵢ)} = wᵢ · e^{−α yᵢ h(xᵢ)}. That is step (e). Normalising (f) only rescales all weights by the same number, which does not change which stump is best.</p>
  <p>Check it on round 1 of the diary trace: keep stump 1 (Sunny? → No play), try different α, and compute the average exponential loss over the 14 days.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
y = np.where(df.Play == "Yes", 1, -1)
h1 = np.where(df.Outlook == "Sunny", -1, 1)            # round-1 stump: Sunny? yes -&gt; No play
print(" alpha   mean of exp(-y * alpha * h1)")
for a in [0.0, 0.2, 0.4, 0.4581, 0.5, 0.7, 1.0]:
    print(f" {a:.4f}  {np.mean(np.exp(-y * a * h1)):.4f}")
eps = [4 / 14, 3 * 0.05 + 0.125, 5 * 0.05 / 1.45 + 0.05 / 0.55]   # the three rounds of the trace (exact)
Z = [2 * np.sqrt(e * (1 - e)) for e in eps]
print("Z per round:", [round(float(z), 4) for z in Z], " product:", round(float(np.prod(Z)), 4))
alphas = [0.5 * np.log((1 - e) / e) for e in eps]
h = [h1, np.where(df.Humidity == "High", -1, 1), np.where(df.Outlook == "Rain", -1, 1)]
F = sum(a * hh for a, hh in zip(alphas, h))
print("mean exp-loss after 3 rounds:", round(np.mean(np.exp(-y * F)), 4))
p = 1 / (1 + np.exp(-2 * F))
for d, f, pp, yy in zip(df.index, F, p, df.Play):
    if d in ("D3", "D6", "D9", "D14"):
        print(f"{d}: F {f:+.3f}  P(play) = 1/(1+e^(-2F)) = {pp:.2f}   actual {yy}")</div>
  <div class="fx" data-lang="text"> alpha   mean of exp(-y * alpha * h1)
 0.0000  1.0000
 0.2000  0.9338
 0.4000  0.9050
 0.4581  0.9035
 0.5000  0.9043
 0.7000  0.9301
 1.0000  1.0394
Z per round: [0.9035, 0.893, 0.8809]  product: 0.7107
mean exp-loss after 3 rounds: 0.7107
D3: F +0.488  P(play) = 1/(1+e^(-2F)) = 0.73   actual Yes
D6: F +0.428  P(play) = 1/(1+e^(-2F)) = 0.70   actual No
D9: F +0.541  P(play) = 1/(1+e^(-2F)) = 0.75   actual Yes
D14: F -0.541  P(play) = 1/(1+e^(-2F)) = 0.25   actual No</div>
  <p>The loss is smallest at α = 0.4581, exactly the formula, and its value there (0.9035) is Z₁. After three rounds the average loss is Z₁·Z₂·Z₃ = 0.9035 × 0.8930 × 0.8809 = 0.7107, which the code confirms by computing it directly from F.</p>
  <h3>The training error bound</h3>
  <p>Since e^{−y·F} ≥ 1 whenever y·F ≤ 0 (a mistake), the exponential loss is an upper bound on the 0-1 loss. And because each round multiplies the average loss by Zₘ:</p>
  <div class="callout def"><span class="label">Theorem (Freund &amp; Schapire)</span>
    <p><strong>training error ≤ (1/n) Σ e^{−yᵢF(xᵢ)} = ∏ₘ Zₘ = ∏ₘ 2√(εₘ(1−εₘ))</strong>. If every stump is at least a little better than chance, εₘ ≤ ½ − γ, then each Zₘ ≤ √(1 − 4γ²) ≤ e^{−2γ²}, so training error ≤ e^{−2Mγ²}: it falls <strong>exponentially</strong> in the number of rounds.</p>
  </div>
  <p>On the diary: after 3 rounds the bound says training error ≤ 0.7107, and the real training error is 2/14 = 0.143, well below it. Worked numbers for many rounds: suppose every stump only reaches ε = 0.4 (γ = 0.1). Then Z = 2√(0.4·0.6) = 0.9798 per round. After 100 rounds the bound is 0.9798¹⁰⁰ = 0.13; after 339 rounds it is below 0.001. With 1,000 rows, a training error below 1/1000 means zero mistakes. So stumps that are only 60% accurate can, together, fit every training row. That answered the big theory question "can weak learners be boosted into a strong one?" with a yes. (Fitting every <em>training</em> row is not the same as generalising; see section 09.)</p>
  <h3>Getting probabilities out</h3>
  <p>Minimising expected exponential loss at a point x gives F*(x) = ½ · ln( P(y=+1|x) / P(y=−1|x) ): half the log-odds. Turn it around: <strong>P(y = +1 | x) = 1 / (1 + e^{−2F(x)})</strong>. On the diary (last lines of the output above), D9 with F = +0.541 gets P(play) = 0.75, D14 with F = −0.541 gets 0.25, and D6 (truly No) gets 0.70: the team is wrong about it and fairly sure. These probabilities are often poorly calibrated in practice; calibrate them (see <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>) before using them as real chances.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>AdaBoost = "add stumps greedily to minimise Σ e^{−y·F}". Swap e^{−y·F} for log-loss and you get LogitBoost; swap it for any differentiable loss and fit each tree to the gradient and you get <a class="xref" data-note="ml_gbm">Gradient Boosting</a>. AdaBoost is the special case that started it all.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From scratch vs sklearn.</b> We have the algorithm and its reason, checked on 14 days. Does a real implementation on real-sized data do the same thing as the library everyone uses?</div>

  <h2 id="ada-code"><span class="num">06</span>From Scratch, and Matching sklearn</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our hand trace used 14 days and five questions. Does the same algorithm, written as real code for 20,000 rows and any numeric column, give exactly what sklearn's AdaBoostClassifier gives?</p>
  </div>
  <p>Fourteen days are too few to compare implementations seriously, so this section uses the group's larger dataset, the same idea at scale. All churn examples in the tree notes share one synthetic dataset (fake mobile-company customers; 1 = churned). Setup used by every churn block below:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)</div>
  <p>Now AdaBoost in about 30 lines. The weak learner is sklearn's stump (so we can compare like with like); everything else (weights, ε, α, update, vote) is ours. Labels are turned into −1/+1 inside <code>fit</code>.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import AdaBoostClassifier

class MyAdaBoost:
    def __init__(self, n_estimators=50, learning_rate=1.0, max_depth=1):
        self.M, self.lr, self.depth = n_estimators, learning_rate, max_depth

    def fit(self, X, y):                       # y in {0, 1}
        ys = np.where(y == 1, 1, -1)           # work with -1 / +1
        w = np.full(len(y), 1 / len(y))        # step 1: equal weights
        self.stumps, self.alphas = [], []
        for m in range(self.M):
            h = DecisionTreeClassifier(max_depth=self.depth, random_state=m)
            h.fit(X, ys, sample_weight=w)      # step 2: weak learner on weighted rows
            pred = h.predict(X)
            wrong = pred != ys
            eps = w[wrong].sum() / w.sum()     # step 3: weighted error
            if eps &lt;= 0 or eps &gt;= 0.5:         # perfect or useless: stop
                break
            alpha = self.lr * 0.5 * np.log((1 - eps) / eps)   # step 4: its say
            w = w * np.exp(-alpha * ys * pred) # step 5: wrong rows up, right rows down
            w = w / w.sum()                    #         normalise to sum 1
            self.stumps.append(h); self.alphas.append(alpha)
        return self

    def decision_function(self, X):            # F(x) = sum of alpha * h(x)
        return sum(a * h.predict(X) for a, h in zip(self.alphas, self.stumps))

    def predict(self, X):
        return (self.decision_function(X) &gt; 0).astype(int)

for lr in [1.0, 0.5]:
    mine = MyAdaBoost(n_estimators=200, learning_rate=lr).fit(Xtr, ytr)
    sk = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=200,
                            learning_rate=lr, random_state=0).fit(Xtr, ytr)
    print(f"learning_rate={lr}")
    print("  my alphas[:4]       ", np.round(mine.alphas[:4], 4))
    print("  sklearn weights[:4] ", np.round(sk.estimator_weights_[:4], 4),
          " ratio", np.round(sk.estimator_weights_[:4] / np.array(mine.alphas[:4]), 3))
    print("  same split feature in all 200 stumps:",
          all(a.tree_.feature[0] == b.tree_.feature[0] for a, b in zip(mine.stumps, sk.estimators_)))
    print(f"  val accuracy  mine {np.mean(mine.predict(Xva) == yva):.4f}  sklearn {sk.score(Xva, yva):.4f}"
          f"  predictions agree on {np.mean(mine.predict(Xva) == sk.predict(Xva)):.4f} of val rows")</div>
  <div class="fx" data-lang="text">learning_rate=1.0
  my alphas[:4]        [0.2053 0.0916 0.1068 0.1113]
  sklearn weights[:4]  [0.4107 0.1832 0.2136 0.2226]  ratio [2. 2. 2. 2.]
  same split feature in all 200 stumps: True
  val accuracy  mine 0.6487  sklearn 0.6487  predictions agree on 1.0000 of val rows
learning_rate=0.5
  my alphas[:4]        [0.1027 0.0314 0.0609 0.0465]
  sklearn weights[:4]  [0.2053 0.0629 0.1217 0.0929]  ratio [2. 2. 2. 2.]
  same split feature in all 200 stumps: True
  val accuracy  mine 0.6420  sklearn 0.6420  predictions agree on 1.0000 of val rows</div>
  <p>Read the output line by line:</p>
  <ul>
    <li><strong>sklearn's weights are exactly 2× ours.</strong> sklearn uses the SAMME formula (section 07), which for two classes is α = ln((1−ε)/ε) with no ½. Multiplying every α by 2 doubles F but never changes its sign, so predictions are identical. Its weight update multiplies only the wrong rows by e^{2α} and then normalises; ours multiplies wrong rows by e^{α} and right rows by e^{−α}. After normalising, those are the same distribution.</li>
    <li><strong>Same stumps, same predictions</strong> on every validation row, for both learning rates.</li>
    <li><strong>Stumps are weak here</strong>: 200 stumps reach only 0.649 on churn, because this data is full of interactions between columns, and a sum of one-question trees cannot express "A and B together". Section 10 fixes this with deeper trees.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to convert 0/1 labels to −1/+1 in a from-scratch AdaBoost. With y ∈ {0, 1}, y·h(x) is 0 for every row with y = 0, so their weights never change and the algorithm silently learns nonsense.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multiclass: SAMME.</b> Everything so far assumed two classes (Play / No play, churn / stay). What if there are ten?</div>

  <h2 id="ada-samme"><span class="num">07</span>Multiclass: SAMME</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Binary AdaBoost calls a stump useful when ε &lt; 0.5. With ten classes a random guess is wrong 90% of the time, so a stump that is wrong 80% of the time is actually good. How do the formulas change?</p>
  </div>
  <p><strong>The need.</strong> With K classes, a stump that guesses at random is wrong (K−1)/K of the time: 90% for 10 classes. A useful 10-class stump can easily have ε = 0.8 (it is right 20% of the time, twice as good as chance). But the binary rule α = ½·ln((1−ε)/ε) gives a <em>negative</em> α for any ε &gt; 0.5, so binary AdaBoost would throw it away or flip it. The binary rule's "better than chance" line is in the wrong place.</p>
  <p><strong>SAMME</strong> (Stagewise Additive Modeling using a Multi-class Exponential loss, Zhu et al., 2009) moves that line by adding one term:</p>
  <div class="callout def"><span class="label">SAMME</span>
    <p><strong>αₘ = ln((1 − εₘ)/εₘ) + ln(K − 1)</strong>. Weight update: wrong rows multiplied by e^{αₘ}, then normalise. Prediction: <strong>H(x) = argmax_k Σₘ αₘ · 1[hₘ(x) = k]</strong> (each stump votes for one class with weight αₘ; the class with the most total vote wins). α &gt; 0 exactly when (1−ε)/ε &gt; 1/(K−1), i.e. <strong>ε &lt; 1 − 1/K</strong>: better than random guessing among K classes.</p>
  </div>
  <p>Worked by hand:</p>
  <table class="tbl">
    <tr><th>K</th><th>ε</th><th>ln((1−ε)/ε)</th><th>+ ln(K−1)</th><th>SAMME α</th><th>comment</th></tr>
    <tr><td>2</td><td>0.2857 (diary round 1)</td><td>0.916</td><td>+ 0</td><td>0.916</td><td>2× the binary α 0.4581 (same predictions)</td></tr>
    <tr><td>3</td><td>0.60</td><td>−0.405</td><td>+ 0.693</td><td>0.288</td><td>60% wrong, but chance is 67% wrong: still useful</td></tr>
    <tr><td>3</td><td>0.67</td><td>−0.708</td><td>+ 0.693</td><td>≈ 0</td><td>right at chance level</td></tr>
    <tr><td>10</td><td>0.80</td><td>−1.386</td><td>+ 2.197</td><td>0.811</td><td>20% right vs 10% by chance: a good stump</td></tr>
  </table>
  <p>On the 10-class digits dataset (8×8 pixel images of 0–9):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
X, y = load_digits(return_X_y=True)                      # 10 classes, 1797 images of 8x8 pixels
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
K = 10
w = np.full(len(ytr), 1 / len(ytr))
stump = DecisionTreeClassifier(max_depth=1).fit(Xtr, ytr, sample_weight=w)
eps = w[stump.predict(Xtr) != ytr].sum()
print(f"first stump weighted error eps = {eps:.3f}  (random guessing: {1 - 1/K:.2f})")
print(f"binary formula 0.5*ln((1-eps)/eps)  = {0.5*np.log((1-eps)/eps):+.3f}")
print(f"SAMME  ln((1-eps)/eps) + ln(K-1)     = {np.log((1-eps)/eps) + np.log(K-1):+.3f}")
for depth, n in [(1, 300), (3, 300)]:
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=n,
                             learning_rate=0.5, random_state=0).fit(Xtr, ytr)
    one = DecisionTreeClassifier(max_depth=depth).fit(Xtr, ytr)
    print(f"depth {depth}: one tree test acc {one.score(Xte, yte):.3f}   AdaBoost SAMME ({len(ada.estimators_)} trees) {ada.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">first stump weighted error eps = 0.802  (random guessing: 0.90)
binary formula 0.5*ln((1-eps)/eps)  = -0.699
SAMME  ln((1-eps)/eps) + ln(K-1)     = +0.799
depth 1: one tree test acc 0.198   AdaBoost SAMME (300 trees) 0.861
depth 3: one tree test acc 0.476   AdaBoost SAMME (300 trees) 0.980</div>
  <p>The first stump is wrong 80.2% of the time, yet that is much better than the 90% of a random guess. The binary formula would give it α = −0.699 (reject); SAMME gives +0.799 (keep). 300 boosted stumps reach 86.1% on 10 classes, up from 19.8% for one stump; with depth-3 trees, 98.0%.</p>
  <p><strong>SAMME.R</strong> ("R" for real) used each tree's class <em>probabilities</em> instead of its hard vote, which usually converged faster. It was deprecated and has been removed from recent sklearn versions (this note uses sklearn 1.9, where <code>AdaBoostClassifier</code> no longer has an <code>algorithm</code> argument and always runs SAMME).</p>
  <div class="bridge"><b>What this still can't tell us → next: Regression: AdaBoost.R2.</b> Classes are handled. What if the target is a number, like the diary's turnout, where "right or wrong" makes no sense?</div>

  <h2 id="ada-r2"><span class="num">08</span>Regression: AdaBoost.R2</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>AdaBoost's weights are driven by "wrong". For a number such as the diary's turnout (how many players came) a prediction of 37 for a true 38 is neither right nor wrong. How can the idea work for regression?</p>
  </div>
  <p><strong>The need.</strong> "Right or wrong" does not exist for a number: a prediction of 31 for a true 30 is neither. AdaBoost.R2 (Drucker, 1997) replaces "wrong" with "how wrong, on a 0–1 scale".</p>
  <ol>
    <li>Train a regressor on the weighted rows (sklearn draws a weighted bootstrap sample for this).</li>
    <li>Absolute error per row eᵢ = |yᵢ − h(xᵢ)|, and D = the largest eᵢ.</li>
    <li>Scale to a loss in [0, 1]: <strong>linear</strong> Lᵢ = eᵢ/D, <strong>square</strong> Lᵢ = (eᵢ/D)², or <strong>exponential</strong> Lᵢ = 1 − e^{−eᵢ/D}.</li>
    <li>Average loss L̄ = Σ wᵢLᵢ. If L̄ ≥ 0.5, stop.</li>
    <li>β = L̄/(1 − L̄) (small when the model is good). Model weight = ln(1/β).</li>
    <li>New weight wᵢ ← wᵢ · β^{(1 − Lᵢ)}, then normalise. A row with Lᵢ = 0 is multiplied by β (shrinks most); a row with Lᵢ = 1 is multiplied by β⁰ = 1 (keeps its weight). So badly predicted rows gain share.</li>
    <li>Final prediction: the <strong>weighted median</strong> of all models' predictions, using the model weights ln(1/β). A median, not a mean, so one wild model cannot drag the answer.</li>
  </ol>
  <p>Worked on the diary: predict Turnout, one round with the stump "Humidity high?" (the best first question in <a class="xref" data-note="ml_boosting">How Boosting Works</a>), equal weights 1/14.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import AdaBoostRegressor
y = df.Turnout.values.astype(float)                    # regression target: players who came
humid = (df.Humidity == "High").values                 # the best first question (How Boosting Works)
w = np.full(14, 1 / 14)
pred = np.where(humid, y[humid].mean(), y[~humid].mean())   # stump: mean of each side
err = np.abs(y - pred); D = err.max()
L = err / D                                            # linear loss in [0, 1]
Lbar = np.sum(w * L); beta = Lbar / (1 - Lbar)
print("stump predictions", np.round(pred, 2).tolist())
print("abs errors       ", np.round(err, 2).tolist())
print(f"largest error D = {D:.2f} (day {df.index[err.argmax()]})")
print("L_i = err/D      ", np.round(L, 3).tolist())
print(f"Lbar = {Lbar:.4f}   beta = Lbar/(1-Lbar) = {beta:.4f}   model weight ln(1/beta) = {np.log(1 / beta):.4f}")
w = w * beta ** (1 - L); w /= w.sum()
print("new weights      ", np.round(w, 3).tolist())
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
m = AdaBoostRegressor(DecisionTreeRegressor(max_depth=2), n_estimators=50, random_state=0).fit(X, y)
print("AdaBoostRegressor (depth-2 trees, 50 rounds) predicts", np.round(m.predict(X), 1).tolist())</div>
  <div class="fx" data-lang="text">stump predictions [28.0, 28.0, 28.0, 28.0, 40.0, 40.0, 40.0, 28.0, 40.0, 40.0, 40.0, 28.0, 40.0, 28.0]
abs errors        [4.0, 8.0, 8.0, 4.0, 4.0, 18.0, 2.0, 2.0, 0.0, 6.0, 2.0, 10.0, 8.0, 8.0]
largest error D = 18.00 (day D6)
L_i = err/D       [0.222, 0.444, 0.444, 0.222, 0.222, 1.0, 0.111, 0.111, 0.0, 0.333, 0.111, 0.556, 0.444, 0.444]
Lbar = 0.3333   beta = Lbar/(1-Lbar) = 0.5000   model weight ln(1/beta) = 0.6931
new weights       [0.065, 0.076, 0.076, 0.065, 0.065, 0.112, 0.06, 0.06, 0.056, 0.07, 0.06, 0.082, 0.076, 0.076]
AdaBoostRegressor (depth-2 trees, 50 rounds) predicts [28.9, 22.0, 36.0, 29.7, 44.0, 22.0, 39.0, 28.9, 43.0, 44.0, 36.0, 38.0, 43.5, 22.0]</div>
  <p>By hand: the stump predicts the mean of each side, 28 for the 7 humid days and 40 for the 7 others. The largest error is D6 (22 players on a dry day, predicted 40, error 18), so D = 18 and D6 gets L = 1; D9 (40 vs 40) gets L = 0. L̄ = the average of the 14 losses = (4 + 8 + 8 + 4 + 4 + 18 + 2 + 2 + 0 + 6 + 2 + 10 + 8 + 8)/(14 × 18) = 84/252 = 1/3, so β = (1/3)/(2/3) = 0.5 and the model's weight is ln(1/0.5) = ln 2 = 0.693. Each day's weight is multiplied by 0.5^(1 − L): D6 (L = 1) keeps its weight, D9 (L = 0) is halved, so after normalising D6 rises from 0.0714 to 0.112 (the heaviest day) and D9 falls to 0.056. Fifty rounds of depth-2 trees then fit the turnouts much better (D6 is now predicted 22.0, exactly right). In practice AdaBoostRegressor is rarely the best choice today; gradient boosting with squared or Huber loss usually wins.</p>
  <div class="bridge"><b>What this still can't tell us → next: Noise sensitivity.</b> Every version of AdaBoost raises the weight of whatever it keeps getting wrong. What if a day is wrong because its label is a mistake?</div>

  <h2 id="ada-noise"><span class="num">09</span>Noise Sensitivity: Why Wrong Labels Take Over</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>AdaBoost's strength is that hard days get heavier. But a day whose label is simply wrong is the hardest day of all, forever. What does AdaBoost do with it?</p>
  </div>
  <p><strong>The problem.</strong> Real labels contain mistakes: a customer marked "churned" who actually just switched SIM within the family. No sensible model can get such a row right, because its features look like a stayer's. AdaBoost will keep getting it wrong, and every time it is wrong its weight is multiplied by e^{α} (by 1/(2ε) after normalising).</p>
  <p><strong>On the diary.</strong> Two cases, run for 20 rounds with the five-question stumps. First, D6 from the trace: a correct label, but one no sum of stumps can get right (rain and windy). Second, a real labelling mistake: suppose the captain wrote "No" for D13, an overcast day that was in fact played.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
Q = {"Overcast?": df.Outlook == "Overcast", "Sunny?": df.Outlook == "Sunny", "Rain?": df.Outlook == "Rain",
     "Humidity high?": df.Humidity == "High", "Wind strong?": df.Wind == "Strong"}
Q = {k: v.values for k, v in Q.items()}
def adaboost_weights(y, rounds):
    w = np.full(14, 1 / 14); hist = [w.copy()]
    for m in range(rounds):
        cands = [(w[np.where(q, s, -s) != y].sum(), np.where(q, s, -s)) for q in Q.values() for s in (1, -1)]
        eps, h = min(cands, key=lambda c: c[0])
        a = 0.5 * np.log((1 - eps) / eps)
        w = w * np.exp(-a * y * h); w /= w.sum(); hist.append(w.copy())
    return np.array(hist)
y = np.where(df.Play == "Yes", 1, -1)
y_bad = y.copy(); y_bad[12] = -1                       # D13 (overcast) wrongly written as "No"
for name, yy, d in [("clean diary, hard day D6", y, 5), ("D13 mislabelled as No", y_bad, 12)]:
    H = adaboost_weights(yy, 20)
    print(f"{name}: weight of D{d + 1} after rounds 0,1,2,5,10,20:",
          " ".join(f"{H[r, d]:.3f}" for r in [0, 1, 2, 5, 10, 20]),
          f"| heaviest day after 20 rounds: {df.index[H[20].argmax()]}")</div>
  <div class="fx" data-lang="text">clean diary, hard day D6: weight of D6 after rounds 0,1,2,5,10,20: 0.071 0.125 0.227 0.181 0.169 0.196 | heaviest day after 20 rounds: D4
D13 mislabelled as No: weight of D13 after rounds 0,1,2,5,10,20: 0.071 0.100 0.136 0.187 0.181 0.181 | heaviest day after 20 rounds: D13</div>
  <p>D6 goes from 0.071 to 0.227 after two rounds and stays near 0.17–0.20: AdaBoost keeps spending a fifth of its attention on a day it cannot fix. The mislabelled D13 climbs from 0.071 to 0.181 and ends as the <em>heaviest</em> day of all, 2.5 times a fair share. The same happens for any mislabelled row: every round that it stays wrong multiplies its weight by e^{α} (by 1/(2ε) after normalising). In loss terms: a row with margin −3 costs e^{3} = 20 under exponential loss but only log₂(1 + e^{6}) ≈ 8.7 under log-loss (see the loss picture in section 05). The exponential penalty for being confidently wrong is what makes AdaBoost chase outliers.</p>
  <p>At scale, on the churn data, flip 10% or 20% of the <em>training</em> labels at random (validation stays clean) and compare:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import AdaBoostClassifier, HistGradientBoostingClassifier
rng = np.random.default_rng(1)
for noise in [0.0, 0.1, 0.2]:
    flip = rng.random(len(ytr)) &lt; noise                  # extra wrong labels in TRAIN only
    yn = np.where(flip, 1 - ytr, ytr)
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=4), n_estimators=300,
                             learning_rate=0.5, random_state=0).fit(Xtr, yn)
    hgb = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.1, random_state=0,
                                         early_stopping=False).fit(Xtr, yn)
    rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0).fit(Xtr, yn)
    print(f"extra noise {noise:.0%}:  AdaBoost {ada.score(Xva, yva):.3f}   "
          f"GBM (log-loss) {hgb.score(Xva, yva):.3f}   RF {rf.score(Xva, yva):.3f}")
    if noise == 0.2:
        # where did AdaBoost put its weight? replay the weights with the fitted model
        w = np.full(len(yn), 1 / len(yn)); ys = np.where(yn == 1, 1, -1)
        for h, a in zip(ada.estimators_, ada.estimator_weights_):
            wrong = h.predict(Xtr) != yn
            w = w * np.exp(a * wrong); w /= w.sum()
        print(f"  after 300 rounds: flipped rows are {flip.mean():.0%} of rows "
              f"but hold {w[flip].sum():.0%} of AdaBoost's total weight")
        top = np.argsort(w)[::-1][:100]
        print(f"  of the 100 heaviest rows, {flip[top].sum()} are flipped labels")</div>
  <div class="fx" data-lang="text">extra noise 0%:  AdaBoost 0.828   GBM (log-loss) 0.872   RF 0.879
extra noise 10%:  AdaBoost 0.814   GBM (log-loss) 0.847   RF 0.874
extra noise 20%:  AdaBoost 0.772   GBM (log-loss) 0.812   RF 0.850
  after 300 rounds: flipped rows are 20% of rows but hold 28% of AdaBoost's total weight
  of the 100 heaviest rows, 88 are flipped labels</div>
  <p>All three get worse with noisier training labels. Both boosters lose about 0.06 at 20% flipped labels (AdaBoost 0.828 → 0.772, gradient boosting with log-loss 0.872 → 0.812, both run for a fixed 300 rounds with no early stopping), while the random forest loses only 0.029 (0.879 → 0.850). AdaBoost is the weakest at every noise level and ends 0.078 behind the forest. The last two lines show <em>why</em> AdaBoost suffers: after 300 rounds the flipped rows (20% of the data) hold 28% of the total weight, and of the 100 heaviest rows, 88 are flipped labels. The algorithm is spending its attention on exactly the rows it should ignore.</p>
  <div class="callout intu"><span class="label">The margin puzzle (and its limit)</span>
    <p>On clean data, AdaBoost's test error often keeps falling even after its training error hits zero, which seemed to contradict "more rounds = more overfitting". Schapire, Freund, Bartlett and Lee (1998) explained it with <strong>margins</strong>: extra rounds keep pushing y·F(x) further from 0 for the training rows, which makes the classifier more confident and more stable. But with label noise the noisy rows can only get positive margins by bending the model around them, and then extra rounds do overfit. Always check validation error, not training error, to choose the number of rounds.</p>
  </div>
  <p><strong>Remedies</strong>, from simplest:</p>
  <ul>
    <li>Fewer rounds, chosen by validation (<code>staged_score</code>), and a smaller <code>learning_rate</code>.</li>
    <li>Clean labels or drop obvious outliers before training.</li>
    <li>Use a loss that grows slower for confident mistakes: LogitBoost or <a class="xref" data-note="ml_gbm">Gradient Boosting</a> with log-loss (classification) or Huber loss (regression).</li>
    <li>Use bagging-type models (<a class="xref" data-note="ml_rf">Random Forest</a>), which never up-weight rows.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"AdaBoost never overfits" is a half-truth from early papers on clean benchmarks. With noisy labels it does, and noisy labels are the normal case in business data (churn, fraud, medical codes).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sklearn &amp; the knobs.</b> We know AdaBoost's mechanism and its weak spot. In practice, which settings decide whether it works: the base tree, the learning rate, the number of rounds?</div>

  <h2 id="ada-sk"><span class="num">10</span>sklearn &amp; the Knobs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what AdaBoost does inside. When you call sklearn's AdaBoostClassifier, which few settings decide whether it works, and how do you choose them?</p>
  </div>
  <table class="tbl">
    <tr><th>parameter</th><th>default</th><th>what it does</th><th>effect when raised</th></tr>
    <tr><td><code>estimator</code></td><td>stump: <code>DecisionTreeClassifier(max_depth=1)</code></td><td>the weak learner; any classifier that accepts <code>sample_weight</code></td><td>deeper trees: less bias, can model interactions, more variance per round</td></tr>
    <tr><td><code>n_estimators</code></td><td>50</td><td>maximum rounds (stops early if a learner is perfect)</td><td>lower bias; eventually overfits noisy data</td></tr>
    <tr><td><code>learning_rate</code></td><td>1.0</td><td>multiplies every α (shrinkage)</td><td>bigger steps; smaller values need more rounds but generalise a bit better</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>seeds the base learners (tie-breaking)</td><td>—</td></tr>
  </table>
  <p>Useful attributes: <code>estimators_</code>, <code>estimator_weights_</code> (the α's, SAMME scale), <code>estimator_errors_</code> (the ε's), <code>feature_importances_</code> (α-weighted average of the trees' impurity importances; see <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>), <code>staged_predict</code> / <code>staged_score</code> (the model after 1, 2, … rounds), <code>decision_function</code> (the vote F, normalised by Σα).</p>
  <p>The main knob in practice is how deep the base tree is. First on the diary, counting training days right after each round:</p>
<div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = (df.Play == "Yes").astype(int)
for depth in [1, 2]:
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=50, random_state=0).fit(X, y)
    curve = [round(s * 14) for s in ada.staged_score(X, y)]
    print(f"depth {depth}: days right after rounds 1,2,3,5,10,{len(curve)}:",
          [curve[i - 1] for i in [1, 2, 3, 5, 10, len(curve)]], "of 14")</div>
  <div class="fx" data-lang="text">depth 1: days right after rounds 1,2,3,5,10,50: [9, 10, 12, 12, 12, 11] of 14
depth 2: days right after rounds 1,2,3,5,10,50: [12, 12, 14, 14, 14, 14] of 14</div>
  <p>Stumps reach 12 of 14 days by round 3 and never more (later rounds even wobble between 12 and 11, as the weights keep shifting between the hard days): a sum of one-question stumps cannot express "rain <em>and</em> windy". Depth-2 trees can ask two questions in a row and get all 14 by round 3. The same lesson at scale, with the learning rate too:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import AdaBoostClassifier
for depth, n, lr in [(1, 500, 1.0), (1, 500, 0.5), (3, 500, 0.5), (6, 300, 0.5), (6, 300, 0.1)]:
    t0 = time.time()
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=n,
                             learning_rate=lr, random_state=0).fit(Xtr, ytr)
    curve = list(ada.staged_score(Xva, yva))
    print(f"depth={depth} lr={lr:3.1f}  val acc after 10/50/{n} rounds: "
          f"{curve[9]:.3f} {curve[49]:.3f} {curve[-1]:.3f}  best {max(curve):.3f} at round {int(np.argmax(curve))+1}"
          f"  train {ada.score(Xtr, ytr):.3f}  {time.time()-t0:.0f}s")</div>
  <div class="fx" data-lang="text">depth=1 lr=1.0  val acc after 10/50/500 rounds: 0.617 0.646 0.652  best 0.652 at round 289  train 0.668  14s
depth=1 lr=0.5  val acc after 10/50/500 rounds: 0.615 0.627 0.647  best 0.651 at round 437  train 0.663  13s
depth=3 lr=0.5  val acc after 10/50/500 rounds: 0.744 0.785 0.791  best 0.793 at round 436  train 0.812  33s
depth=6 lr=0.5  val acc after 10/50/300 rounds: 0.818 0.838 0.851  best 0.854 at round 98  train 0.916  39s
depth=6 lr=0.1  val acc after 10/50/300 rounds: 0.803 0.821 0.829  best 0.831 at round 274  train 0.852  42s</div>
  <p>How to read it (each line: validation accuracy after 10, 50 and all rounds, the best round, training accuracy, fit time):</p>
  <ul>
    <li><strong>Base-tree depth matters most.</strong> Stumps plateau at about 0.65 however many rounds you add (500 rounds: 0.652). Depth 3 reaches 0.79, depth 6 reaches 0.85. The churn pattern is made of interactions, and only deeper trees can express them.</li>
    <li><strong>Learning rate trades speed for smoothness.</strong> With depth 6, lr 0.5 peaks at round 98 (0.854) and then drifts slightly down (0.851 at 300) while training accuracy climbs to 0.916: mild overfitting. lr 0.1 is still improving at round 274 (0.831): it simply needs more rounds.</li>
    <li><strong>It is slow.</strong> Each round is a full weighted tree fit, one after another on one core; the depth-6 runs take about 40 seconds, where the histogram-based gradient-boosting libraries in <a class="xref" data-note="ml_boosting">How Boosting Works</a> fit 500 trees in 1–2 seconds with higher accuracy.</li>
  </ul>
  <p>A sensible AdaBoost recipe: depth 2–6 trees, learning_rate 0.1–0.5, a few hundred rounds, and choose the round count with <code>staged_score</code> on validation data (as above), not on the test set.</p>
  <div class="bridge"><b>What this still can't tell us → next: AdaBoost vs its siblings.</b> We can run AdaBoost well. Against a single tree, a random forest and gradient boosting, when is it the right choice?</div>

  <h2 id="ada-cmp"><span class="num">11</span>AdaBoost vs Its Siblings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>AdaBoost is one way to build a team of trees. How does it compare with a single tree, a random forest and gradient boosting, and when would you still choose it?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Single tree</th><th>Random Forest</th><th>AdaBoost</th><th>Gradient Boosting</th></tr>
    <tr><td>How trees are built</td><td>one, deep</td><td>many deep, in parallel, on bootstrap samples</td><td>many shallow, in sequence, on re-weighted rows</td><td>many shallow, in sequence, on gradients (pseudo-residuals)</td></tr>
    <tr><td>What it reduces</td><td>—</td><td>variance</td><td>bias (and some variance)</td><td>bias (and some variance)</td></tr>
    <tr><td>Loss</td><td>impurity</td><td>impurity</td><td>exponential only</td><td>any differentiable loss</td></tr>
    <tr><td>How it focuses on mistakes</td><td>—</td><td>does not</td><td>row weights e^{−yF}</td><td>targets = −∂L/∂F</td></tr>
    <tr><td>Combining</td><td>—</td><td>plain average / vote</td><td>α-weighted vote</td><td>sum with learning rate ν</td></tr>
    <tr><td>Label noise</td><td>overfits</td><td>robust</td><td>sensitive</td><td>moderate (log-loss, Huber)</td></tr>
    <tr><td>Overfits with more trees?</td><td>—</td><td>no</td><td>slowly, yes with noise</td><td>yes, needs early stopping</td></tr>
    <tr><td>Regression</td><td>yes</td><td>yes</td><td>AdaBoost.R2</td><td>native</td></tr>
    <tr><td>Diary, training days right (Play)</td><td>14/14 (full tree)</td><td>—</td><td>12/14 (stumps), 14/14 (depth 2)</td><td>—</td></tr>
    <tr><td>Churn val accuracy (this data)</td><td>≈ 0.77–0.81</td><td>≈ 0.88</td><td>0.65 (stumps) → 0.85 (depth 6)</td><td>see <a class="xref" data-note="ml_gbm">Gradient Boosting</a></td></tr>
    <tr><td>Use today</td><td>explanation, baselines</td><td>strong default, robust</td><td>teaching, face detection history, small clean data</td><td>the default for tabular data (via XGBoost / LightGBM / CatBoost)</td></tr>
  </table>
  <p>Historical note: AdaBoost with Haar-feature stumps was the heart of the Viola–Jones face detector (2001), the first real-time face detector used in cameras. Freund and Schapire received the Gödel Prize in 2003 for AdaBoost.</p>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met weights, ε, α, the update, the 50/50 fact, the exponential loss, SAMME, R2 and the noise problem. How do they hang together?</div>

    <h2 id="ada-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Weights, ε, α, e^{±α}, Z, the 50/50 fact, the error bound, probabilities, SAMME, R2, noise sensitivity: separate formulas, or one idea seen from different sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="ada-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="220" height="46" rx="7" class="fg sg" stroke-width="2"/><text x="340" y="27" text-anchor="middle" font-size="12" font-weight="700">exponential loss Σ e^{−y·F}</text><text x="340" y="44" text-anchor="middle" class="tm" font-size="10">minimised one stump at a time (FSAM)</text>
<line x1="270" y1="54" x2="105" y2="90" stroke="currentColor" marker-end="url(#ada-c9)"/><line x1="320" y1="54" x2="285" y2="90" stroke="currentColor" marker-end="url(#ada-c9)"/><line x1="360" y1="54" x2="465" y2="90" stroke="currentColor" marker-end="url(#ada-c9)"/><line x1="410" y1="54" x2="610" y2="90" stroke="currentColor" marker-end="url(#ada-c9)"/>
<rect x="10" y="92" width="190" height="50" rx="7" class="fb sb"/><text x="105" y="111" text-anchor="middle" font-size="11.5" font-weight="700">weights wᵢ = e^{−yᵢF}</text><text x="105" y="128" text-anchor="middle" class="tm" font-size="10">D6: 0.071 → 0.125 → 0.227</text>
<rect x="205" y="92" width="160" height="50" rx="7" class="fb sb"/><text x="285" y="111" text-anchor="middle" font-size="11.5" font-weight="700">best stump = min ε</text><text x="285" y="128" text-anchor="middle" class="tm" font-size="10">Sunny? 4/14 = 0.286</text>
<rect x="370" y="92" width="190" height="50" rx="7" class="fb sb"/><text x="465" y="111" text-anchor="middle" font-size="11.5" font-weight="700">α = ½·ln((1−ε)/ε)</text><text x="465" y="128" text-anchor="middle" class="tm" font-size="10">0.4581: loss min 0.9035 = Z₁</text>
<rect x="565" y="92" width="110" height="50" rx="7" class="fb sb"/><text x="620" y="111" text-anchor="middle" font-size="11.5" font-weight="700">P = 1/(1+e^{−2F})</text><text x="620" y="128" text-anchor="middle" class="tm" font-size="10">D9: 0.75</text>
<line x1="105" y1="142" x2="200" y2="176" stroke="currentColor" marker-end="url(#ada-c9)"/><line x1="465" y1="142" x2="380" y2="176" stroke="currentColor" marker-end="url(#ada-c9)"/>
<rect x="170" y="178" width="340" height="46" rx="7" class="ft st"/><text x="340" y="197" text-anchor="middle" font-size="11.5" font-weight="700">update: wrong ×e^α, right ×e^{−α}, ÷Z</text><text x="340" y="214" text-anchor="middle" class="tm" font-size="10">wrong days hold 50% → next stump must differ</text>
<line x1="250" y1="224" x2="110" y2="256" stroke="currentColor" marker-end="url(#ada-c9)"/><line x1="340" y1="224" x2="340" y2="256" stroke="currentColor" marker-end="url(#ada-c9)"/><line x1="430" y1="224" x2="570" y2="256" stroke="currentColor" marker-end="url(#ada-c9)"/>
<rect x="10" y="258" width="200" height="46" rx="7" class="fg sg"/><text x="110" y="277" text-anchor="middle" font-size="11.5" font-weight="700">error ≤ ∏ Zₘ</text><text x="110" y="294" text-anchor="middle" class="tm" font-size="10">diary: 0.7107 ≥ 2/14</text>
<rect x="240" y="258" width="200" height="46" rx="7" class="fr sr"/><text x="340" y="277" text-anchor="middle" font-size="11.5" font-weight="700">noise: wrong labels grow</text><text x="340" y="294" text-anchor="middle" class="tm" font-size="10">mislabelled D13 → heaviest</text>
<rect x="470" y="258" width="200" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="570" y="277" text-anchor="middle" font-size="11.5" font-weight="700">variants change the loss</text><text x="570" y="294" text-anchor="middle" class="tm" font-size="10">SAMME (+ln(K−1)), R2, GBM</text>
</svg><figcaption>Every AdaBoost formula is one consequence of minimising the exponential loss greedily: the weights are the loss of each row so far, the best stump minimises weighted error, α is the exact step, the update is the new loss, and the bound and probabilities follow. Its exponential shape is also the source of the noise problem, which is why later algorithms change the loss.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same 14 diary days (Play / No play, five-question stumps)</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the diary</th><th>When to use / watch</th></tr>
    <tr><td>±1 labels, margin y·F</td><td>class coding</td><td>right or wrong in one product?</td><td>Yes = +1 (9 days), No = −1 (5)</td><td>always convert 0/1 first</td></tr>
    <tr><td>Row weight wᵢ</td><td>e^{−yᵢF} of the team so far, normalised</td><td>which days matter now?</td><td>1/14 → D6 0.125 → 0.227</td><td>training only; thrown away after</td></tr>
    <tr><td>Weighted error ε</td><td>sum of weights of wrong days</td><td>how good is a stump on these weights?</td><td>round 2: Sunny? 0.500, Humidity? 0.275</td><td>must be &lt; 0.5 (binary)</td></tr>
    <tr><td>Say α</td><td>½·ln((1−ε)/ε)</td><td>how loud is its vote?</td><td>0.4581, 0.4847, 0.5144</td><td>kept forever; sklearn shows 2α</td></tr>
    <tr><td>Update + Z</td><td>×e^{∓α}, ÷ Z = 2√(ε(1−ε))</td><td>how much should weights move?</td><td>Z = 0.9035, 0.8930, 0.8809</td><td>shortcut: w/(2ε), w/(2(1−ε))</td></tr>
    <tr><td>50/50 fact</td><td>both halves = √(ε(1−ε))</td><td>why is the next stump different?</td><td>wrong days hold 0.500 after each round</td><td>AdaBoost's built-in diversity</td></tr>
    <tr><td>Vote F, H = sign F</td><td>Σ αₘ hₘ</td><td>what does the team say?</td><td>D3: +0.488 → Play; errors 4 → 4 → 2</td><td>stumps: additive, no interactions</td></tr>
    <tr><td>Exponential loss</td><td>Σ e^{−y·F}</td><td>what is being optimised?</td><td>0.7107 after 3 rounds</td><td>explains every formula; causes noise sensitivity</td></tr>
    <tr><td>Error bound</td><td>0-1 loss ≤ exp loss = ∏ Z</td><td>does training error fall?</td><td>2/14 = 0.143 ≤ 0.7107</td><td>theory: weak → strong</td></tr>
    <tr><td>Probability</td><td>F = ½ log-odds</td><td>how sure is the team?</td><td>D6: 0.70 (wrong, fairly sure)</td><td>calibrate before use</td></tr>
    <tr><td>SAMME / R2</td><td>same plan, other loss or K</td><td>multiclass? numbers?</td><td>K = 2: α = 0.916; turnout: L̄ 1/3, β 0.5</td><td>multiclass: SAMME; numbers: prefer GBM</td></tr>
    <tr><td>Noise sensitivity</td><td>exponential growth of wrong rows' weight</td><td>what about wrong labels?</td><td>mislabelled D13 ends heaviest (0.181)</td><td>noisy data: GBM with log-loss, or a forest</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>AdaBoost adds stumps one at a time to minimise Σ e^{−y·F}, and every formula (weights, ε, α, the update, the bound, the probabilities) is that minimisation written out.</strong> The exponential shape makes the hard days heavier, which is its power, and makes wrong labels heavier still, which is its weakness. Change the loss and you get <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing how the parts fit, which mistakes do people actually make with AdaBoost?</div>

<h2 id="ada-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how AdaBoost works and why. Which mistakes cost people the most when they implement or use it?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: 0/1 labels in a hand-written AdaBoost</span>
    <p>The formulas need y, h ∈ {−1, +1}. Convert first, or rows of class 0 never change weight.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mixing up the two weights</span>
    <p>Row weights wᵢ (temporary, for training the next learner) vs learner weights αₘ (permanent, for voting). Interviewers ask this.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a perfect or useless learner</span>
    <p>ε = 0 gives α = ∞ and a division by zero; ε ≥ 0.5 (binary) gives α ≤ 0. Every implementation must guard both: stop on ε = 0, stop or flip on ε ≥ 0.5.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: stumps on data with interactions</span>
    <p>A sum of stumps is an additive model: it cannot express "high usage AND short contract". On the churn data stumps plateau at 0.65; depth-6 trees reach 0.85. Try depths 1–6.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a strong base learner</span>
    <p>A fully grown tree gets ε ≈ 0 on the training rows in round 1, so α is huge and boosting stops: you just have one overfit tree. The base learner must be weak.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting AdaBoost on noisy labels</span>
    <p>Exponential loss lets mislabeled rows dominate the weights. Pick n_estimators on clean validation data; prefer gradient boosting or a forest when labels are noisy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading predict_proba as true probabilities</span>
    <p>AdaBoost's scores are pushed towards the extremes and are not calibrated. Use <code>CalibratedClassifierCV</code> if you need real probabilities (pricing, risk scores).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing α values across libraries</span>
    <p>sklearn's <code>estimator_weights_</code> are 2× the textbook α (SAMME convention). Same model, different scale.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note on one page, for revising.</div>

    <h2 id="ada-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's cricket diary, 14 days D1–D14, Play = Yes (+1, 9 days) or No (−1, 5 days); a stump asks one of Overcast? / Sunny? / Rain? / Humidity high? / Wind strong? and says Play for one answer, No play for the other.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on the diary</th><th>Weakness → next</th></tr>
    <tr><td>Row weights</td><td>how to point the next stump at mistakes without residuals?</td><td>all days start at 1/14</td><td>how to score a stump on weights?</td></tr>
    <tr><td>Weighted error ε</td><td>how good is a stump on these weights?</td><td>round 1 tie 4/14; round 2 Sunny? 0.500, Humidity? 0.275</td><td>how big a vote? how to reweight?</td></tr>
    <tr><td>α and the update</td><td>how loud, how much to move?</td><td>α₁ 0.4581; wrong ×1.58, right ×0.63; wrong days → 50%</td><td>does it work over rounds?</td></tr>
    <tr><td>Hand trace</td><td>what happens in practice?</td><td>Sunny?, Humidity high?, Rain?; errors 4 → 4 → 2</td><td>why these formulas?</td></tr>
    <tr><td>Exponential loss</td><td>what is optimised?</td><td>min 0.9035 at α = 0.4581; ∏Z = 0.7107</td><td>real code?</td></tr>
    <tr><td>From scratch</td><td>does code match sklearn?</td><td>churn: identical predictions, α ×2</td><td>only 2 classes</td></tr>
    <tr><td>SAMME</td><td>K classes?</td><td>α + ln(K−1); useful if ε &lt; 1 − 1/K</td><td>numbers?</td></tr>
    <tr><td>AdaBoost.R2</td><td>regression?</td><td>turnout: L̄ 1/3, β 0.5, weight ln 2 = 0.693</td><td>noise</td></tr>
    <tr><td>Noise</td><td>wrong labels?</td><td>mislabelled D13 → heaviest day (0.181)</td><td>which knobs help?</td></tr>
    <tr><td>Knobs</td><td>what matters?</td><td>stumps max 12/14, depth 2 14/14; churn 0.65 → 0.85</td><td>vs siblings → GBM</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><strong>AdaBoost</strong>: boosting for classification that keeps a weight distribution over rows, trains a weak learner on it each round, gives the learner a say α from its weighted error, and multiplies wrong rows' weights by e^{α}, right rows' by e^{−α}, then renormalises. Prediction: sign of Σ α·h.</li>
    <li><strong>Margin</strong>: y·F(x); positive = right, bigger = more confident.</li>
    <li><strong>Weighted error ε</strong>: total weight of the rows the learner gets wrong (weights sum to 1).</li>
    <li><strong>Row weight vs learner weight</strong>: wᵢ is temporary (for training the next learner); αₘ is permanent (for voting).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th><th>Diary value</th></tr>
    <tr><td>Weighted error</td><td>ε = Σ wᵢ·1[h(xᵢ) ≠ yᵢ]</td><td>wᵢ row weight, h stump</td><td>ε₁ = 4/14 = 0.2857</td></tr>
    <tr><td>Say</td><td>α = ½·ln((1−ε)/ε)</td><td>half the log-odds of being right</td><td>0.4581</td></tr>
    <tr><td>Update</td><td>wᵢ ← wᵢ·e^{−α·yᵢ·h(xᵢ)} / Z</td><td>yᵢ·h = +1 right, −1 wrong</td><td>wrong 1/14 → 0.125, right → 0.05</td></tr>
    <tr><td>Normaliser</td><td>Z = 2√(ε(1−ε))</td><td>sum of updated weights</td><td>0.9035</td></tr>
    <tr><td>Shortcut</td><td>wrong: w/(2ε); right: w/(2(1−ε))</td><td>from the 50/50 fact</td><td>D6: 0.125/0.55 = 0.227</td></tr>
    <tr><td>Final</td><td>H(x) = sign(Σ αₘ hₘ(x))</td><td>F = the sum</td><td>D3: +0.488</td></tr>
    <tr><td>Exponential loss</td><td>L = Σ e^{−yᵢF(xᵢ)}</td><td>minimised stagewise</td><td>mean 0.7107 after 3</td></tr>
    <tr><td>Bound</td><td>train error ≤ ∏ Zₘ ≤ e^{−2Mγ²}</td><td>εₘ ≤ ½ − γ</td><td>0.143 ≤ 0.7107</td></tr>
    <tr><td>Probability</td><td>P(y=+1|x) = 1/(1+e^{−2F})</td><td>F = ½ log-odds</td><td>D9: 0.75</td></tr>
    <tr><td>SAMME</td><td>α = ln((1−ε)/ε) + ln(K−1)</td><td>K classes</td><td>K = 2: 0.916</td></tr>
    <tr><td>R2</td><td>Lᵢ = eᵢ/D; β = L̄/(1−L̄); w ← w·β^{1−Lᵢ}</td><td>D largest error; weighted median</td><td>β = 0.5</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use AdaBoost</b><p>Small, clean data; a very simple model (weighted stumps); a base learner that accepts sample weights; teaching boosting.</p><small>Depth 2–6, lr 0.1–0.5, rounds by staged_score</small></div>
    <div><b>Avoid</b><p>Noisy labels or outliers (weights explode on them); big tabular data where gradient boosting libraries are faster and better.</p><small>GBM with log-loss, or a forest</small></div>
    <div><b>Stumps vs deeper</b><p>Stumps give an additive model; they cannot learn "rain and windy" (diary stuck at 12/14). Interactions need depth ≥ 2.</p><small>Churn: 0.65 → 0.85</small></div>
    <div><b>Probabilities</b><p>1/(1+e^{−2F}) exists but is poorly calibrated.</p><small>CalibratedClassifierCV</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>0/1 labels in hand-written code; confusing wᵢ with αₘ; ε = 0 (α infinite) or ε ≥ 0.5 not guarded; stumps on data with interactions; a strong base learner (one overfit tree); trusting it on noisy labels; reading predict_proba as real probabilities; comparing α across libraries (sklearn = 2α).</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>ε = 4/14. What is α, and the new weight of a wrong day that had 1/14?</td><td>½·ln 2.5 = 0.4581; (1/14)/(8/14) = 0.125</td></tr>
    <tr><td>After the update, what weighted error does the last stump have?</td><td>Exactly 0.5</td></tr>
    <tr><td>Why did round 3 pick a stump with six mistakes?</td><td>Its mistakes were on the lightest days, so its ε (0.263) was the smallest</td></tr>
    <tr><td>Which loss is AdaBoost minimising, and what does that cause with wrong labels?</td><td>Exponential loss; mislabelled rows get exponentially growing weight</td></tr>
    <tr><td>F = +0.541. What probability of Play?</td><td>1/(1+e^{−1.082}) = 0.75</td></tr>
  </table>

<h2 id="ada-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain AdaBoost in four sentences.</summary><div class="qa-body">Every training row gets a weight, equal at the start. Each round, a weak learner (usually a stump) is trained on the weighted rows and gets a say α = ½·ln((1−ε)/ε) based on its weighted error ε. Rows it got wrong are multiplied by e^{α}, rows it got right by e^{−α}, and the weights are renormalised, so the next learner focuses on the current mistakes. The final prediction is the sign of the α-weighted sum of all learners.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive α from the exponential loss.</summary><div class="qa-body">Adding αh to F gives loss Σ wᵢ e^{−α yᵢ h(xᵢ)} with wᵢ = e^{−yᵢF(xᵢ)}. Split into right and wrong rows: W[(1−ε)e^{−α} + εe^{α}]. Setting the derivative in α to zero: ε e^{α} = (1−ε) e^{−α}, so e^{2α} = (1−ε)/ε and α = ½·ln((1−ε)/ε).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What weighted error does the previous learner have on the new weights, and why does it matter?</summary><div class="qa-body">Exactly 0.5. After the update both the wrong rows and the right rows hold √(ε(1−ε)) of the (unnormalised) weight, so they are equal. The previous learner is a coin flip on the new distribution, so the next learner cannot repeat it and must find new information. It is AdaBoost's built-in diversity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A stump has ε = 0.7. What happens?</summary><div class="qa-body">α = ½·ln(0.3/0.7) = −0.42: its votes are flipped, and the flipped stump has error 0.3. In practice implementations stop when ε ≥ 0.5, because the learner can always be flipped or a better one found. In multiclass (SAMME) the threshold is ε &lt; 1 − 1/K instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does AdaBoost use weak learners? What if you use deep trees?</summary><div class="qa-body">Boosting reduces bias by combining many simple, low-variance learners. A fully grown tree reaches ε ≈ 0 on training data, so α → ∞ and there is nothing left for later rounds: you get one overfit tree. Moderately deep trees (2–6) are fine and often better than stumps when features interact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is AdaBoost sensitive to label noise?</summary><div class="qa-body">It minimises the exponential loss e^{−y·F}, which grows exponentially for rows on the wrong side. A mislabeled row stays wrong, its weight is multiplied by e^{α} every round, and soon it dominates the distribution so learners bend to fit it. Log-loss grows only linearly for confident mistakes, which is why gradient boosting with log-loss (or a random forest) is more robust.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the training error bound say?</summary><div class="qa-body">Training error ≤ ∏ Zₘ = ∏ 2√(εₘ(1−εₘ)). If every learner has εₘ ≤ ½ − γ, the bound is ≤ e^{−2Mγ²}: training error falls exponentially with rounds. It proves weak learners can be boosted into a strong learner on the training set; it says nothing directly about test error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is SAMME different from binary AdaBoost?</summary><div class="qa-body">α = ln((1−ε)/ε) + ln(K−1), weights of wrong rows × e^{α}, prediction = class with the largest total α-vote. The ln(K−1) term moves the "useful" threshold from ε &lt; 0.5 to ε &lt; 1 − 1/K, because random guessing among K classes is wrong (K−1)/K of the time. For K = 2 it equals 2× binary α, giving the same predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does AdaBoost.R2 adapt the idea to regression?</summary><div class="qa-body">Errors are scaled to a loss in [0, 1] (linear, square or exponential, divided by the largest error), the average weighted loss L̄ gives β = L̄/(1−L̄), weights are multiplied by β^{1−Lᵢ} (well-predicted rows shrink most), each model gets weight ln(1/β), and the final prediction is the weighted median of the models' predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>sklearn's estimator_weights_ are twice your hand-computed α. Is sklearn wrong?</summary><div class="qa-body">No. sklearn uses the SAMME formula, which for K = 2 is ln((1−ε)/ε), exactly 2 × ½·ln((1−ε)/ε). All α's scale by the same factor, F doubles, its sign does not change, and the weight distribution after normalising is the same. Predictions are identical (the from-scratch comparison in section 06 shows 100% agreement).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does learning_rate do in AdaBoostClassifier?</summary><div class="qa-body">It multiplies every α (shrinkage), so each learner both votes less and moves the weights less. Smaller values need more rounds but usually generalise a little better; it trades off directly against n_estimators. The same idea is the learning rate ν in gradient boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get a probability from AdaBoost, and should you trust it?</summary><div class="qa-body">The exponential-loss minimiser is F = ½·log-odds, so p = 1/(1+e^{−2F}). In practice the scores are badly calibrated (pushed to the extremes), so calibrate with Platt scaling or isotonic regression on held-out data before using them as probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does AdaBoost relate to gradient boosting?</summary><div class="qa-body">Both are forward stagewise additive models. AdaBoost is the special case with exponential loss, where the stagewise step turns into "reweight rows by e^{−yF} and fit a classifier". Gradient boosting generalises it: for any differentiable loss, fit a regression tree to the negative gradient and line-search the step. Gradient boosting with exponential loss behaves like AdaBoost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: bagging also resamples or reweights rows. What is the difference?</summary><div class="qa-body">Bagging draws rows at random, independently of any model, and trains models in parallel; it averages away variance. AdaBoost chooses weights deterministically from the previous learners' mistakes and trains in sequence; it removes bias. Bagging is robust to noisy labels; AdaBoost is not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you still pick AdaBoost today?</summary><div class="qa-body">Rarely as the final model on tabular data, where gradient boosting libraries usually win. It is reasonable for small, clean datasets, when you want a very simple model (a weighted list of stumps), when your base learner is not a tree but accepts sample weights, and in interviews as the clearest way to explain boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does AdaBoost need row weights when How Boosting Works just fitted residuals?</summary><div class="qa-body">Residuals y − F only make sense for numbers. For a yes/no label the team's "remaining error" has to be expressed differently: AdaBoost keeps the labels and changes how much each row counts. The weights are exactly e^{−y·F}, the exponential loss of each row so far, so they play the role residuals play for squared error. Gradient boosting later unified both as "fit the negative gradient".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip normalising the weights (step f)?</summary><div class="qa-body">The stump chosen and the α computed would still be right if ε is computed as a share of the total weight, because normalising only rescales. But with ε taken as a plain sum of unnormalised weights, ε drifts (the total shrinks by Z &lt; 1 each round), α is wrong, and you lose the clean 50/50 fact that guarantees the next stump differs. On the diary the totals would be 0.9035, then 0.8068, then 0.7107.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: on the diary, why can no number of stumps get D4 and D6 both right, and what fixes it?</summary><div class="qa-body">D4 and D6 are both rainy; D4 is humid and calm (played), D6 normal and windy (not played). The true rule is "rain and windy → no play", an interaction. A sum of stumps adds one number per answer of each question and cannot make the wind matter only when it rains. Depth-2 trees can (14/14 by round 3). The same limit gave the turnout floor of 58.56 in How Boosting Works.</div></details>
</main>
`
});
