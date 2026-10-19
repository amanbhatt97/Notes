// notes/ml/ml_splits.js — Train/Val/Test & Cross-Validation
Object.assign(TOPIC_CONTENT, {
  "ml_splits": `<main>
  <h1>Train/Val/Test &amp; Cross-Validation</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Train/Val/Test &amp; Cross-Validation</span></div>
  <p class="lead">A model's score on the rows it learned from tells you almost nothing; a lookup table scores perfectly on its own rows and a deep tree scores 100% even on random labels. This note is about measuring honestly. It shows the memorisation problem with numbers, gives the train, validation and test sets their separate jobs, works out how big each should be, and covers every way to split: stratified, by group, by time. Then cross-validation: k-fold computed fully by hand, stratified k-fold, leave-one-out (with its one-fit shortcut), repeated CV, time-series CV and nested CV, plus how noisy CV is and how to choose k. It ends with every scikit-learn splitter and scoring function you will use. The running example is the same one as in <a class="xref" data-note="ml_intro">What is Machine Learning</a>: <strong>ten flats in Pune</strong>, whose price we predict from their area. Every split and every CV scheme is first worked on those ten flats, then shown at scale.</p>

  <h2 id="ms-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 120" width="660">
<defs><marker id="ms-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="14" text-anchor="middle" class="tm" font-size="11.5">Foundations group</text>
<rect x="5" y="26" width="84" height="40" rx="7" class="fs" stroke="currentColor"/><text x="47" y="50" text-anchor="middle" font-size="11.5">What is ML</text>
<rect x="99" y="22" width="110" height="48" rx="7" class="fb sb" stroke-width="3"/><text x="154" y="42" text-anchor="middle" font-size="12" font-weight="700">Splits &amp; CV</text><text x="154" y="59" text-anchor="middle" font-size="10" class="tb">YOU ARE HERE</text>
<rect x="219" y="26" width="84" height="40" rx="7" class="fs" stroke="currentColor"/><text x="261" y="44" text-anchor="middle" font-size="11">Bias &amp;</text><text x="261" y="58" text-anchor="middle" font-size="11">Variance</text>
<rect x="313" y="26" width="84" height="40" rx="7" class="fs" stroke="currentColor"/><text x="355" y="44" text-anchor="middle" font-size="11">Loss &amp;</text><text x="355" y="58" text-anchor="middle" font-size="11">Grad. Descent</text>
<rect x="407" y="26" width="76" height="40" rx="7" class="fs" stroke="currentColor"/><text x="445" y="50" text-anchor="middle" font-size="11">Regularize</text>
<rect x="493" y="26" width="70" height="40" rx="7" class="fs" stroke="currentColor"/><text x="528" y="50" text-anchor="middle" font-size="11">Features</text>
<rect x="573" y="26" width="82" height="40" rx="7" class="fs" stroke="currentColor"/><text x="614" y="44" text-anchor="middle" font-size="11">Pipelines &amp;</text><text x="614" y="58" text-anchor="middle" font-size="11">Leakage</text>
<g stroke="currentColor" marker-end="url(#ms-fa)"><line x1="89" y1="46" x2="97" y2="46"/><line x1="209" y1="46" x2="217" y2="46"/><line x1="303" y1="46" x2="311" y2="46"/><line x1="397" y1="46" x2="405" y2="46"/><line x1="483" y1="46" x2="491" y2="46"/><line x1="563" y1="46" x2="571" y2="46"/></g>
<path d="M154 70 C 154 100, 600 100, 614 70" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ms-fa)"/>
<text x="384" y="112" text-anchor="middle" class="tm" font-size="10.5">CV inside pipelines keeps every later step honest</text>
</svg><figcaption>The Foundations chain with this note highlighted. The dashed arrow: Pipelines &amp; Leakage returns to CV to make preprocessing part of each fold.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_intro">What is Machine Learning</a></b><span>Learning means searching for the rule with the lowest error on past examples. On our ten flats the search found price = 6 × area + 10, with MSE 4.6, but on the same flats it learned from. The first end-to-end model locked two flats away and compared candidates with "5-fold CV", without explaining either. The open question: how do we know a learned rule will work on flats it has never seen?</span></li>
    <li><b>This note adds: honest measurement</b><span>Why scores on training rows lie; the three roles of train, validation and test; how to split (ratios, stratified, grouped, by time); and cross-validation in all its forms, each computed by hand on the ten flats first and then with scikit-learn.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a></b><span>With honest train and validation scores in hand (the lookup table: train 0, held-out 17.0; the line: train 2.17, held-out 1.28), the next question is how to read them: a big gap means overfitting (variance), two high errors mean underfitting (bias). Learning and validation curves are built from the splits of this note. Later, <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> puts preprocessing inside each fold, <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a> runs hyperparameter search on CV, and <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> uses the time-series CV defined here.</span></li>
  </ol>

  <h2 id="ms-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Every number is computed on the same ten flats.</p>
  <ol class="story">
    <li><b>Hold-out set</b><span>Q: is a score on the rows the model learned from honest? → No. A lookup table scores MAE 0 on its 8 training flats and 17.0 on the 2 held back; the line scores 2.17 and 1.28. Only held-out rows tell them apart. But we also need to <em>choose</em> between models: can the same held-out rows do both jobs?</span></li>
    <li><b>Train / validation / test</b><span>Q: how do we choose and still report honestly? → Fit on train, choose on validation, score once on test. On 2 validation flats the no-intercept line won (val MAE 0.52) and then scored 3.96 on test, against 1.28 for the line with an intercept. Was 2 flats simply too few?</span></li>
    <li><b>Split ratios</b><span>Q: how big must each part be? → A score from n rows has noise ∝ 1/√n. Over all 45 possible 2-flat test sets the same line scores anywhere from 1.01 to 4.30. Think in counts, not percentages. But even a big enough random split can get the class mix wrong…</span></li>
    <li><b>Stratified split</b><span>Q: what if the rare class misses the test set? → Split each class separately. With 4 fast sellers in 10 flats, a plain 2-flat test set has no fast seller 1 time in 3; stratified always has exactly 1. But this assumes every flat is independent…</span></li>
    <li><b>Group split</b><span>Q: what if rows share an entity the model will meet fresh? → Keep each group (locality) on one side. Random 5-fold says MAE 1.13; "price a flat in a new locality" says 2.86. And rows can also depend on each other through time…</span></li>
    <li><b>Time split</b><span>Q: what if the order of rows matters? → Train on the past, test on the future: listed Jan–Aug trains, Sep–Oct tests (MAE 3.11). But any single split wastes rows and depends on luck…</span></li>
    <li><b>k-fold CV</b><span>Q: can every row be used for both training and validation? → k folds, each validated once: the mean predictor scores 18.0 ± 11.1, the line 2.01 ± 0.43. But plain folds can get the class mix wrong when the file is sorted…</span></li>
    <li><b>Stratified k-fold</b><span>Q: how do we keep classes balanced in every fold? → Deal each class out separately: 2 fast sellers per fold instead of 4 and 0. Why not take k as large as possible?</span></li>
    <li><b>Leave-one-out</b><span>Q: what if k = n? → Ten fits of nine flats: mean predictor 16.0 (= (10/9) × 14.4), and for the line one fit is enough: eᵢ / (1 − hᵢᵢ), LOOCV MSE 7.25 vs training 4.6. But shuffled k-fold still depends on which flats share a fold…</span></li>
    <li><b>Repeated CV</b><span>Q: how do we remove the luck of the partition? → Average many shuffles: single runs ranged 2.32–2.71, 20 repeats give 2.57. But shuffling is wrong when order matters…</span></li>
    <li><b>Time-series CV</b><span>Q: how do we cross-validate ordered data? → Several cut-offs, always training on the past: expanding, sliding, with a gap. Now we tune on CV; but is the winner's CV score honest?</span></li>
    <li><b>Nested CV</b><span>Q: how do we score a model whose settings were tuned on the same folds? → An outer loop around the tuning: kNN on the flats, best_score_ 4.83 vs nested 6.53. Which k should all these use, and how noisy are they?</span></li>
    <li><b>CV variance and choosing k</b><span>Q: is CV biased or noisy, and which k? → Small k trains on less (2.64 at k = 2 vs 2.52 at k = 10); partition noise vanishes at LOO; default 5 or 10. Then: which sklearn function does each of these?</span></li>
    <li><b>scikit-learn APIs</b><span>Q: how do we do it all in code? → train_test_split, the splitter classes, cross_val_score / cross_validate / cross_val_predict, and the defaults that bite (cv=5 never shuffles).</span></li>
  </ol>

  <h2 id="ms-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Train/Val/Test &amp; Cross-Validation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Why hold out</div>
        <ul>
          <li><b>Training score is optimistic</b> — flats: lookup table train MAE 0, held-out 17.0; line 2.17 vs 1.28</li>
          <li>Unlimited tree: train 1.000, test 0.730; random labels: train 1.000, test 0.497</li>
          <li><b>Generalisation error</b> = expected error on new rows from the same source</li>
          <li>💡 Mock tests vs the board exam</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Three roles</div>
        <ul>
          <li><b>Train</b> fits parameters · <b>validation</b> picks hyperparameters/models · <b>test</b> final score, once</li>
          <li>Flats: 2 validation flats picked the no-intercept line (0.52) → test 3.96</li>
          <li><b>Selection bias</b>: best of 50 coin-flip models: val 0.585, test 0.487</li>
          <li><b>SE of accuracy</b> = √(p(1−p)/n): n=100 → ±0.03; n=1000 → ±0.0095</li>
          <li>45 possible 2-flat test sets: MAE 1.01 … 4.30 · ratios 60/20/20 · 80/10/10 · 98/1/1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · How to split</div>
        <ul>
          <li><b>Stratified</b> — 4 fast sellers in 10: P(0 in a 2-flat test) = 15/45 = 0.333; stratified always 1</li>
          <li>Regression: stratify on quantile bins (test-mean SD 4.61 → 1.79)</li>
          <li><b>Group</b> — new locality: KFold 1.13 vs GroupKFold 2.86; scans: 1.00 vs 0.66</li>
          <li><b>Time</b> — train past, test future: shuffled MAE 5.2 vs chronological 14.8</li>
          <li><b>Gap/embargo</b> between train and test when labels overlap in time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Cross-validation</div>
        <ul>
          <li><b>k-fold</b>: k parts, each validates once; CV = mean of k scores</li>
          <li>By hand on flats: mean predictor folds 29.375, 15.625, 0.625, 13.75, 30.625 → 18.0; line 2.01</li>
          <li><b>Stratified k-fold</b>: sorted export KFold [4,0] fast sellers vs [2,2]</li>
          <li><b>LOOCV</b> k = n; mean predictor (10/9)|y − ȳ| → 16.0; linear: eᵢ/(1−hᵢᵢ), h_A = 0.3455</li>
          <li><b>Repeated</b>: flats 2.32–2.71 per shuffle → 2.57 averaged</li>
          <li><b>Time-series CV</b>: expanding / sliding window, gap, test_size</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Nested CV &amp; choosing k</div>
        <ul>
          <li><b>Nested</b>: inner CV tunes, outer CV scores the whole tuning procedure</li>
          <li>Flats kNN: best_score_ 4.83 vs nested 6.53; noise data: 0.58 vs 0.50</li>
          <li>Fits = outer × (candidates × inner + 1) = 5 × (4×4 + 1) = 85</li>
          <li><b>Bias</b>: trains on (k−1)/k of data → pessimistic; flats 2.64 (k=2) → 2.52 (k=10)</li>
          <li><b>Variance</b>: LOO fine for stable models, worst for trees (SD 0.109)</li>
          <li>Default <b>k = 5 or 10</b>; fold SD is not a true standard error</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · scikit-learn</div>
        <ul>
          <li><code>train_test_split(test_size, stratify, shuffle, random_state)</code></li>
          <li><code>KFold</code>, <code>StratifiedKFold</code>, <code>GroupKFold</code>, <code>StratifiedGroupKFold</code>, <code>TimeSeriesSplit</code>, <code>LeaveOneOut</code>, <code>ShuffleSplit</code>, <code>Repeated*</code></li>
          <li><code>cross_val_score</code> one metric · <code>cross_validate</code> many + train scores + estimators</li>
          <li>⚠ <code>cv=5</code> on a classifier = StratifiedKFold <b>without shuffle</b></li>
          <li>⚠ <code>cross_val_predict</code> is for plots/stacking, not for the score</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ms-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ms-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Hold Out Data</span><span class="rm-sub">Ten flats: memorisation by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ms-roles"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Train, Validation, Test</span><span class="rm-sub">Three jobs, selection bias</span></div></div>
      <div class="rm-item rm-done" data-target="ms-ratio"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Split Ratios</span><span class="rm-sub">How noisy is a test score?</span></div></div>
      <div class="rm-item rm-done" data-target="ms-strat"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Stratified Splits</span><span class="rm-sub">Keep class shares equal</span></div></div>
      <div class="rm-item rm-done" data-target="ms-group"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Group-Aware Splits</span><span class="rm-sub">A new locality, one side only</span></div></div>
      <div class="rm-item rm-done" data-target="ms-time"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Time-Aware Splits</span><span class="rm-sub">Never train on the future</span></div></div>
      <div class="rm-item rm-done" data-target="ms-kfold"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">k-Fold CV by Hand</span><span class="rm-sub">10 flats, 5 folds, every number</span></div></div>
      <div class="rm-item rm-done" data-target="ms-skfold"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Stratified k-Fold</span><span class="rm-sub">Classes in every fold</span></div></div>
      <div class="rm-item rm-done" data-target="ms-loo"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Leave-One-Out</span><span class="rm-sub">k = n, and the one-fit shortcut</span></div></div>
      <div class="rm-item rm-done" data-target="ms-repeat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Repeated CV</span><span class="rm-sub">Average away the shuffle luck</span></div></div>
      <div class="rm-item rm-done" data-target="ms-tscv"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Time-Series CV</span><span class="rm-sub">Expanding, sliding, gap</span></div></div>
      <div class="rm-item rm-done" data-target="ms-nested"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Nested CV</span><span class="rm-sub">Honest score while tuning</span></div></div>
      <div class="rm-item rm-done" data-target="ms-choosek"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">CV Variance &amp; Choosing k</span><span class="rm-sub">Bias, variance, cost; simulated</span></div></div>
      <div class="rm-item rm-done" data-target="ms-api"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">scikit-learn APIs</span><span class="rm-sub">Every splitter and scorer</span></div></div>
      <div class="rm-item rm-done" data-target="ms-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ms-compare"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Choosing a Scheme</span><span class="rm-sub">Comparison table</span></div></div>
      <div class="rm-item rm-done" data-target="ms-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leaks and optimistic scores</span></div></div>
      <div class="rm-item rm-done" data-target="ms-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ms-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ms-why"><span class="num">01</span>Why Hold Out Data</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The previous note fitted price = 6 × area + 10 to ten flats and reported MSE 4.6. But that number was measured on the very flats the line was fitted to. Does a low error on the training rows say anything about the next flat listed?</p>
  </div>
  <h3>The need</h3>
  <p>Your teacher gives you 100 practice questions. You solve them again and again until you score 100/100. Does that prove you know the subject? No: you may simply remember those exact questions. The only fair check is a paper you have never seen. A model has the same problem, only worse: a flexible model can store its training rows perfectly.</p>
  <h3>The running example</h3>
  <p>The ten flats from <a class="xref" data-note="ml_intro">What is Machine Learning</a> (area x in hundreds of sq ft, price y in ₹ lakh; the extra columns are used later in this note):</p>
  <table class="tbl out"><caption>Ten flats sold in Pune</caption>
    <tr><th>Flat</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th></tr>
    <tr><td>Area x</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td></tr>
    <tr><td>Price y</td><td>38</td><td>49</td><td>53</td><td>56</td><td>67</td><td>68</td><td>73</td><td>83</td><td>87</td><td>96</td></tr>
    <tr><td>Locality</td><td>Hadapsar</td><td>Baner</td><td>Kothrud</td><td>Hadapsar</td><td>Baner</td><td>Kothrud</td><td>Hadapsar</td><td>Baner</td><td>Kothrud</td><td>Baner</td></tr>
    <tr><td>Listed</td><td>Mar</td><td>Jan</td><td>May</td><td>Feb</td><td>Aug</td><td>Apr</td><td>Jun</td><td>Sep</td><td>Jul</td><td>Oct</td></tr>
    <tr><td>Sold within 30 days?</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
  </table>
  <h3>By hand: a model that only remembers</h3>
  <p>Hold back two flats, C and I, and train on the other eight. Compare two models. The laziest possible "model" is a <strong>lookup table</strong>: store every training flat with its price; for an area seen before, return the stored price; for anything new, return the average training price. The other is the straight line.</p>
  <table class="tbl out"><caption>Training on 8 flats, scoring on the 2 held back</caption>
    <tr><th>Model</th><th>Training flats (A, B, D, E, F, G, H, J)</th><th>Held-out C (700 sq ft, ₹53 lakh)</th><th>Held-out I (1,300 sq ft, ₹87 lakh)</th></tr>
    <tr><td>Lookup table</td><td>returns each stored price: every miss 0, <strong>MAE 0</strong></td><td>area 7 never seen → average 530/8 = 66.25, miss 13.25</td><td>area 13 never seen → 66.25, miss 20.75</td></tr>
    <tr><td>Line (refitted on 8)</td><td>misses of about 2 each, <strong>MAE 2.17</strong></td><td>6.094 × 7 + 9.119 = 51.78, miss 1.22</td><td>6.094 × 13 + 9.119 = 88.34, miss 1.34</td></tr>
  </table>
  <p>On its training flats the lookup table is perfect (MAE 0) and beats the line (2.17). On the held-out flats it misses by (13.25 + 20.75) / 2 = 17.0 lakh, the line by (1.22 + 1.34) / 2 = 1.28. The pattern "bigger flat, higher price" was right there, but the lookup table never learned it; it only remembered. If you judged by training error you would ship the useless model.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

names = np.array(list("ABCDEFGHIJ"))
area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])         # 100 sq ft
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])     # ₹ lakh
test = np.isin(names, ["C", "I"])                              # two flats held back
tr_a, tr_p, te_a, te_p = area[~test], price[~test], area[test], price[test]

# Model 1: a lookup table. Seen area -&gt; stored price; unseen area -&gt; average training price
table = dict(zip(tr_a, tr_p))
def lookup(a):
    return np.array([table.get(v, tr_p.mean()) for v in a])
# Model 2: a straight line
line = LinearRegression().fit(tr_a.reshape(-1, 1), tr_p)

for name, f in [("lookup table", lookup), ("line", lambda a: line.predict(a.reshape(-1, 1)))]:
    print(f"{name:12s} train MAE {np.abs(tr_p - f(tr_a)).mean():5.2f}   "
          f"held-out MAE {np.abs(te_p - f(te_a)).mean():5.2f}   predictions for C, I: {f(te_a).round(2)}")</div>
  <div class="fx" data-lang="text">lookup table train MAE  0.00   held-out MAE 17.00   predictions for C, I: [66.25 66.25]
line         train MAE  2.17   held-out MAE  1.28   predictions for C, I: [51.78 88.34]</div>
  <h3>The same thing at scale, with a real model</h3>
  <p>A decision tree with no limits keeps splitting until every leaf is pure, so it can always reach 100% on its training rows. Below it is trained twice on 1,000 rows: on a real but noisy task (20% of labels flipped at random), and on labels that are pure coin flips, where there is nothing to learn at all.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# A real but noisy task: 1,000 customers, 10 columns, 20% of labels flipped at random
X, y = make_classification(n_samples=1000, n_features=10, n_informative=4,
                           flip_y=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
tree = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)      # no limits: grows until pure
print(f"real labels    leaves={tree.get_n_leaves()}  train acc={tree.score(X_tr, y_tr):.3f}  "
      f"test acc={tree.score(X_te, y_te):.3f}")

# Pure noise: labels have NOTHING to do with X, so nothing can be learned
rng = np.random.default_rng(0)
y_noise = rng.integers(0, 2, size=1000)
X_tr, X_te, y_tr, y_te = train_test_split(X, y_noise, test_size=0.3, random_state=0)
tree = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)
print(f"random labels  leaves={tree.get_n_leaves()}  train acc={tree.score(X_tr, y_tr):.3f}  "
      f"test acc={tree.score(X_te, y_te):.3f}")</div>
  <div class="fx" data-lang="text">real labels    leaves=109  train acc=1.000  test acc=0.730
random labels  leaves=152  train acc=1.000  test acc=0.497</div>
  <p>On the real task, training accuracy is 1.000 but test accuracy is 0.730: the tree learned something, plus 109 leaves' worth of noise. On random labels it still scores a perfect 1.000 on training rows, using 152 leaves to memorise them, while test accuracy is 0.497, a coin toss. <strong>The training score could not tell these two situations apart.</strong> Only the held-out rows could.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student who memorised last year's answer key gets full marks on last year's paper and fails this year's. The examiner's only defence is a paper the student has not seen. Held-out data is that unseen paper.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Training error</strong>: the average loss on the rows used to fit the model. <strong>Generalisation error</strong> (true, expected or out-of-sample error): the expected loss on new rows drawn from the same source. We can never compute it exactly; we <em>estimate</em> it with rows the model did not see. Training error is a biased (optimistic) estimate of it; a held-out error is an unbiased estimate, as long as the held-out rows played no part in any decision.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"No part in any decision" is stricter than it sounds. If you fitted a scaler, chose features, or picked between models using the held-out rows, they are no longer held out. That is the subject of section 02 and of <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Train, Validation, Test.</b> One held-out set is enough to score one fixed model. But we also need to <em>choose</em>: line or lookup table, intercept or not, which k. Can the same held-out flats do both jobs?</div>

  <h2 id="ms-roles"><span class="num">02</span>Train, Validation, Test: Three Jobs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 scored two fixed models on flats C and I. In practice we try many candidates and keep the best. If C and I decide the winner, can they still give an honest score of that winner?</p>
  </div>
  <h3>The three roles</h3>
  <ul>
    <li><strong>Training set</strong>: the model's parameters are fitted on these rows.</li>
    <li><strong>Validation set</strong> (dev set): used to compare models and choose hyperparameters. It is looked at many times.</li>
    <li><strong>Test set</strong> (hold-out set): locked away, used once at the very end to report the final score.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Train = textbook exercises. Validation = the mock exams you use to decide how to study. Test = the board exam. If you see the board paper early, your marks stop measuring what you know.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<rect x="20" y="30" width="364" height="36" class="fb sb"/><text x="202" y="53" text-anchor="middle">Train 70%</text>
<rect x="384" y="30" width="78" height="36" class="ft st"/><text x="423" y="53" text-anchor="middle">Val 15%</text>
<rect x="462" y="30" width="78" height="36" class="fr sr"/><text x="501" y="53" text-anchor="middle">Test 15%</text>
<text x="202" y="86" text-anchor="middle" class="tm">fit parameters</text><text x="423" y="86" text-anchor="middle" class="tm">choose, many times</text><text x="501" y="86" text-anchor="middle" class="tm">report, once</text>
<text x="20" y="18" class="tm">one dataset, three jobs</text>
<text x="20" y="110" class="tm">after choosing: refit on train + val, then score on test</text>
</svg><figcaption>Three sets with three jobs. The test set plays the role of the future, so no decision may depend on it.</figcaption></figure>
  <h3>By hand on the ten flats: 6 / 2 / 2</h3>
  <p>Lock C and I away as the test set. Of the other eight, D and H are the validation set, and A, B, E, F, G, J train. Three candidates: a line through the origin (the hyperparameter <code>fit_intercept=False</code>), a line with an intercept, and the 1-nearest-neighbour memoriser. By hand for 1-NN: D (area 8) is closest to E (area 9, ₹67 lakh), miss 56 − 67 = −11; H (12) is closest to G (11, ₹73 lakh), miss 10; validation MAE 10.5. For the line through the origin, k = Σxy / Σx² over the six training flats = 3914 / 559 = 7.002, so D → 56.01 (miss −0.01) and H → 84.02 (miss −1.02): validation MAE 0.52.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

names = np.array(list("ABCDEFGHIJ"))
X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)   # area, 100 sq ft
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])              # price, ₹ lakh
test = np.isin(names, ["C", "I"])          # locked away (same two flats as section 01)
val  = np.isin(names, ["D", "H"])          # validation: used to CHOOSE
train = ~test &amp; ~val                       # A, B, E, F, G, J: used to FIT

candidates = {"line, no intercept": LinearRegression(fit_intercept=False),
              "line with intercept": LinearRegression(fit_intercept=True),
              "1-nearest neighbour": KNeighborsRegressor(n_neighbors=1)}
for name, m in candidates.items():
    m.fit(X[train], y[train])
    tr = np.abs(y[train] - m.predict(X[train])).mean()
    va = np.abs(y[val] - m.predict(X[val])).mean()
    print(f"{name:20s} train MAE {tr:5.2f}   val MAE {va:5.2f}   val predictions {m.predict(X[val]).round(2)}")

# choose on validation, refit the winner on train + validation, use the test set ONCE
best = min(candidates, key=lambda n: np.abs(y[val] - candidates[n].predict(X[val])).mean())
final = candidates[best].fit(X[~test], y[~test])
print("chosen:", best, "  refit on 8 flats, coef", final.coef_.round(3),
      "  test MAE", np.abs(y[test] - final.predict(X[test])).mean().round(2))</div>
  <div class="fx" data-lang="text">line, no intercept   train MAE  3.67   val MAE  0.52   val predictions [56.01 84.02]
line with intercept  train MAE  2.49   val MAE  1.47   val predictions [58.15 82.21]
1-nearest neighbour  train MAE  0.00   val MAE 10.50   val predictions [67. 73.]
chosen: line, no intercept   refit on 8 flats, coef [6.986]   test MAE 3.96</div>
  <p>The validation set did its job mechanically: it ruled out the memoriser (train 0.00, validation 10.50) and picked the line <em>without</em> intercept (0.52 vs 1.47). Refitted on all eight non-test flats and scored once on C and I, the chosen model gives test MAE 3.96, while the line with intercept would have given 1.28 (section 01). The validation set chose wrongly. Nothing was leaked; two validation flats were simply too few: D and H happen to sit almost exactly on the line through the origin. Notice also that the test score (3.96) is far above the validation score that chose it (0.52). That is selection bias.</p>
  <h3>Why validation and test must be different: selection bias</h3>
  <p>Every score measured on a finite set contains luck. If you compare many candidates on the same validation set and keep the winner, you keep the candidate that was best <em>plus</em> the one with the luckiest draw. The winner's validation score is therefore too high. A fresh test set has not been used for picking, so it gives an unbiased score of the winner.</p>
  <p>The extreme case makes it obvious: 50 "models" that just flip coins. Each one's true accuracy is exactly 0.5.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(1)
y_val  = rng.integers(0, 2, 200)        # 200 validation rows
y_test = rng.integers(0, 2, 2000)       # 2,000 test rows

# 50 "models" that are pure coin flips: true accuracy of every one is 0.50
val_acc, test_acc = [], []
for m in range(50):
    val_acc.append((rng.integers(0, 2, 200) == y_val).mean())
    test_acc.append((rng.integers(0, 2, 2000) == y_test).mean())
best = int(np.argmax(val_acc))
print("mean validation acc of all 50:", round(np.mean(val_acc), 3))
print("best model's validation acc:  ", val_acc[best])
print("same model on the test set:   ", test_acc[best])</div>
  <div class="fx" data-lang="text">mean validation acc of all 50: 0.494
best model's validation acc:   0.585
same model on the test set:    0.487</div>
  <p>Averaged over all 50, validation accuracy is 0.494, close to the truth. But the best of 50 on validation scored 0.585, which looks like a real (if weak) model. On the test set it drops to 0.487: it was luck. With real models the effect is smaller but always in the same direction, and it grows with the number of candidates you compare and shrinks with the size of the validation set.</p>
  <h3>The same workflow at scale</h3>
  <p>A 70/15/15 split of the 569-row tumour data, choosing k for k-nearest-neighbours on validation. Two calls to <code>train_test_split</code>: first lock the test set away, then cut the rest. The second <code>test_size</code> is 0.15/0.85 because it is a share of the remaining 85%, and 0.15/0.85 × 85% = 15% of the original.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_breast_cancer(return_X_y=True)
# 1. lock the test set away FIRST (15%)
X_rest, X_test, y_rest, y_test = train_test_split(X, y, test_size=0.15, stratify=y, random_state=42)
# 2. split the rest into train and validation; 0.15/0.85 makes val 15% of the ORIGINAL data
X_tr, X_val, y_tr, y_val = train_test_split(X_rest, y_rest, test_size=0.15/0.85, stratify=y_rest, random_state=42)
print("rows:", len(X_tr), len(X_val), len(X_test))
print("share of class 1:", round(y_tr.mean(), 3), round(y_val.mean(), 3), round(y_test.mean(), 3))

# 3. choose a hyperparameter on VALIDATION
for k in [1, 5, 15, 51]:
    m = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k)).fit(X_tr, y_tr)
    print(f"k={k:2d}  train acc {m.score(X_tr, y_tr):.3f}  val acc {m.score(X_val, y_val):.3f}")

# 4. refit the chosen setting on train+val, then use the test set ONCE
final = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)).fit(X_rest, y_rest)
print("final test acc:", round(final.score(X_test, y_test), 3))</div>
  <div class="fx" data-lang="text">rows: 397 86 86
share of class 1: 0.627 0.628 0.628
k= 1  train acc 1.000  val acc 0.965
k= 5  train acc 0.975  val acc 0.977
k=15  train acc 0.967  val acc 0.977
k=51  train acc 0.942  val acc 0.965
final test acc: 0.965</div>
  <p>397 + 86 + 86 = 569. With <code>stratify</code>, the share of class 1 is 0.627–0.628 in all three parts. k = 1 scores a perfect 1.000 on training rows (each row is its own nearest neighbour) but not the best on validation, the memorisation story again. k = 5 and k = 15 tie at 0.977. With 86 validation rows, one row is worth 1/86 = 1.2 points, so the validation set simply cannot separate them; we take k = 5. The final model is refitted on train + validation (483 rows) and scored once: 0.965.</p>
  <h3>After choosing: refit</h3>
  <p>Once the setting is chosen, the validation rows have done their job. Refit the chosen model on train + validation so it learns from more data, then score the test set. After the test score is recorded, many teams refit once more on <em>all</em> rows for the production model; the test score then describes a model trained on slightly less data, which is a safe (slightly pessimistic) estimate.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hold-out validation</strong>: partition D into D_train, D_val, D_test. Fit θ on D_train for each candidate hyperparameter λ; pick λ* = argmin over λ of error on D_val; refit on D_train ∪ D_val; report the error on D_test. The reported number is an unbiased estimate of the generalisation error of the final model only if D_test was used exactly once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Check test, tweak, check test again. On our flats it is tempting to see test MAE 3.96, switch to the intercept line and report 1.28. That 1.28 is no longer a clean test score: the test set has become a second validation set and carries selection bias. If you must iterate after seeing the test score, get a fresh test set, or at least report that the number is no longer clean.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Split Ratios.</b> Two validation flats chose the wrong model. How many rows does a validation or test set need before its score can be trusted, and what share of the data should each part get?</div>

  <h2 id="ms-ratio"><span class="num">03</span>Split Ratios</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We split 6/2/2 and the 2 validation flats misled us. Every row held out is a row the model cannot learn from, yet too few held-out rows give a score that is mostly luck. How noisy is a score from n rows, and how should the data be divided?</p>
  </div>
  <h3>The trade-off</h3>
  <p>Every row you hold out is a row the model cannot learn from. Every row you train on is a row you cannot measure with. More training rows → a better model. More test rows → a more precise score of that model. The split is a balance between the two.</p>
  <h3>How lucky was our test set? All 45 of them</h3>
  <p>Ten flats can be split into 8 training and 2 test flats in C(10, 2) = 45 ways. Fit the line on each 8 and score the 2. Same model family, same data, only the luck of which two flats were held back changes:</p>
  <div class="fx" data-lang="py">import numpy as np
from itertools import combinations
from sklearn.linear_model import LinearRegression

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
names = "ABCDEFGHIJ"

# Every possible 2-flat test set (45 of them): fit the line on the other 8, score the 2
scores = {}
for a, b in combinations(range(10), 2):
    tr = [i for i in range(10) if i not in (a, b)]
    m = LinearRegression().fit(X[tr], y[tr])
    scores[names[a] + names[b]] = np.abs(y[[a, b]] - m.predict(X[[a, b]])).mean()
v = np.array(list(scores.values()))
print("test MAE over all 45 two-flat test sets: min %.2f  max %.2f  mean %.2f  SD %.2f" % (v.min(), v.max(), v.mean(), v.std()))
print("luckiest:", min(scores, key=scores.get), round(min(scores.values()), 2),
      "  unluckiest:", max(scores, key=scores.get), round(max(scores.values()), 2), "  ours (CI):", round(scores["CI"], 2))</div>
  <div class="fx" data-lang="text">test MAE over all 45 two-flat test sets: min 1.01  max 4.30  mean 2.51  SD 0.75
luckiest: HI 1.01   unluckiest: BE 4.3   ours (CI): 1.28</div>
  <p>The "true" held-out MAE of this line is somewhere near 2.5, but a single 2-flat test set reports anything from 1.01 (H and I held back) to 4.30 (B and E held back, the two flats that sold for ₹3 lakh above the line). Our C-and-I split happened to be on the lucky side at 1.28. A score from 2 rows is mostly luck.</p>
  <h3>How noisy is a test score? By hand</h3>
  <p>For accuracy there is a formula. Treat each test row as a coin that lands "correct" with probability p (the model's true accuracy). The measured accuracy is the average of n such coins, so its standard error is SE = √(p(1 − p) / n) (the binomial standard error from <a class="xref" data-note="st_probability">Probability</a>). A rough 95% range is p ± 1.96 SE. For an average error like MAE the same law holds with the spread of the per-row errors in place of √(p(1 − p)): SE = SD of the errors / √n.</p>
  <table class="tbl out"><caption>True accuracy p = 0.90</caption>
    <tr><th>Test rows n</th><th>p(1 − p)/n</th><th>SE</th><th>95% range of the measured accuracy</th></tr>
    <tr><td>50</td><td>0.09/50 = 0.0018</td><td>0.042</td><td>0.817 – 0.983</td></tr>
    <tr><td>100</td><td>0.09/100 = 0.0009</td><td>0.030</td><td>0.841 – 0.959</td></tr>
    <tr><td>1,000</td><td>0.00009</td><td>0.0095</td><td>0.881 – 0.919</td></tr>
    <tr><td>10,000</td><td>0.000009</td><td>0.003</td><td>0.894 – 0.906</td></tr>
  </table>
  <p>With 100 test rows a 90%-accurate model can easily measure as 85% or 95%. Two models 2 points apart cannot be told apart. The simulation below draws 2,000 test sets of each size and confirms the formula.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
true_acc = 0.90                                  # the model's real accuracy on all future rows
for n in [50, 100, 1000, 10000]:
    se = np.sqrt(true_acc * (1 - true_acc) / n)  # formula
    # simulate 2,000 different test sets of size n and measure accuracy on each
    measured = rng.binomial(n, true_acc, size=2000) / n
    print(f"n_test={n:5d}  formula SE={se:.4f}  simulated SD={measured.std():.4f}  "
          f"95% range ≈ {true_acc - 1.96*se:.3f} .. {true_acc + 1.96*se:.3f}")</div>
  <div class="fx" data-lang="text">n_test=   50  formula SE=0.0424  simulated SD=0.0428  95% range ≈ 0.817 .. 0.983
n_test=  100  formula SE=0.0300  simulated SD=0.0296  95% range ≈ 0.841 .. 0.959
n_test= 1000  formula SE=0.0095  simulated SD=0.0096  95% range ≈ 0.881 .. 0.919
n_test=10000  formula SE=0.0030  simulated SD=0.0030  95% range ≈ 0.894 .. 0.906</div>
  <p>Formula and simulation agree to the third decimal. Notice the square root: to halve the noise you need four times the test rows.</p>
  <h3>Rules of thumb</h3>
  <table class="tbl">
    <tr><th>Dataset size</th><th>Typical split</th><th>Reason</th></tr>
    <tr><td>Tiny (our ten flats)</td><td>No fixed validation set at all: <strong>cross-validation</strong> (section 07), ideally LOO</td><td>2 held-out rows gave MAE anywhere from 1.01 to 4.30</td></tr>
    <tr><td>Under ~1,000 rows</td><td>Test 20%, then <strong>CV</strong> on the rest instead of a fixed validation set</td><td>A single small validation set is too noisy; CV reuses every row</td></tr>
    <tr><td>1,000 – 100,000</td><td>60/20/20 or 70/15/15, or 80/20 + CV</td><td>Classic textbook ratios</td></tr>
    <tr><td>Millions</td><td>98/1/1 or 99.5/0.25/0.25</td><td>10,000 test rows already give SE ≈ 0.003; the rest is better spent on training</td></tr>
    <tr><td>Rare positives (fraud 0.1%)</td><td>Size by the <em>positives</em>: aim for hundreds of positives in test</td><td>Recall measured on 12 frauds is almost pure noise</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Think in absolute counts, not percentages. What matters for the precision of a score is how many rows (and how many rows of the rare class) are in the evaluation set, not what fraction of the data they are. 20% of ten flats is two flats, and two flats cannot measure anything.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Declaring a winner from a difference smaller than the noise. On 200 test rows (SE ≈ 0.02 near 90%), 0.91 vs 0.90 is a tie; on our 2 validation flats, 0.52 vs 1.47 was a tie too. Compare models on the same rows (paired) and look at CV fold-by-fold differences, or use a proper test (<a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Stratified Splits.</b> A random split can, by bad luck, also get the <em>mix</em> wrong. Only 4 of our 10 flats sold within 30 days. How often does a random test set get none of them?</div>

  <h2 id="ms-strat"><span class="num">04</span>Stratified Splits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 03 was about how many rows. But a test set of the right size can still have the wrong mix: if the portal wants to predict "sells within 30 days" and the test set contains no fast seller, recall cannot even be computed. How do we keep the class shares right in every part?</p>
  </div>
  <h3>The problem, by hand</h3>
  <p>Ten flats, 4 fast sellers (A, D, F, G: 40%), a 20% test set = 2 flats. A plain random split picks 2 flats out of 10 with no regard to labels. The chance that both come from the 6 slow sellers is the number of ways to choose 2 slow sellers over the number of ways to choose any 2:</p>
  <p style="text-align:center">P(0 fast sellers) = C(6,2) / C(10,2) = 15 / 45 = 0.333</p>
  <p>One split in three has a test set with no fast seller at all. P(exactly 1) = C(4,1)·C(6,1) / 45 = 24/45 = 0.533, and P(2) = C(4,2)/45 = 6/45 = 0.133, a test set that is 100% fast sellers.</p>
  <p><strong>Stratification</strong> splits each class separately in the same proportion: 20% of the 4 fast sellers = 0.8 → 1, 20% of the 6 slow sellers = 1.2 → 1. Every stratified test set has exactly 1 fast and 1 slow seller, and training keeps 3 and 5. The code checks this on our flats, then on 1,000 rows with 5% positives, then for a numeric target.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.model_selection import train_test_split

# Our ten flats: did each sell within 30 days? (A, D, F, G did: 4 of 10)
sold = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])
X = np.arange(10).reshape(-1, 1)                # row numbers stand in for the features
plain, strat = [], []
for seed in range(10):
    _, _, _, yte = train_test_split(X, sold, test_size=0.2, random_state=seed)
    plain.append(int(yte.sum()))
    _, _, _, yte = train_test_split(X, sold, test_size=0.2, random_state=seed, stratify=sold)
    strat.append(int(yte.sum()))
print("fast sellers in the 2-flat test set, 10 seeds")
print("plain     :", plain)
print("stratified:", strat)

# Bigger: 1,000 rows with 5% positives, 10 seeds, test_size=0.2 (expect 10 positives)
y = (np.arange(1000) &lt; 50).astype(int)
X = np.zeros((1000, 1))
plain = [int(train_test_split(X, y, test_size=0.2, random_state=s)[3].sum()) for s in range(10)]
strat = [int(train_test_split(X, y, test_size=0.2, random_state=s, stratify=y)[3].sum()) for s in range(10)]
print("1,000 rows, 5% positive -&gt; positives in test (expect 10)")
print("plain     :", plain)
print("stratified:", strat)

# Regression: stratify on quantile bins of the target
rng = np.random.default_rng(0)
price = rng.lognormal(mean=3, sigma=1, size=200)       # skewed target, a few huge values
bins = pd.qcut(price, q=5, labels=False)               # 5 equal-count bins -&gt; labels 0..4
print("overall mean price:", round(price.mean(), 2))
for name, s in [("plain ", None), ("binned", bins)]:
    test_means = [train_test_split(price, test_size=0.2, random_state=k, stratify=s)[1].mean()
                  for k in range(200)]                  # 200 different splits
    print(f"{name} split: test-set mean varies with SD {np.std(test_means):.2f}")</div>
  <div class="fx" data-lang="text">fast sellers in the 2-flat test set, 10 seeds
plain     : [0, 0, 0, 1, 1, 1, 0, 1, 1, 0]
stratified: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
1,000 rows, 5% positive -&gt; positives in test (expect 10)
plain     : [9, 10, 5, 10, 5, 7, 12, 8, 8, 14]
stratified: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
overall mean price: 31.14
plain  split: test-set mean varies with SD 4.61
binned split: test-set mean varies with SD 1.79</div>
  <p>Plain splits of the ten flats gave 0 or 1 fast seller, with 0 in 5 of 10 seeds (the hand calculation says 1 in 3 on average; 10 seeds is a small sample). Stratified: always 1. On 1,000 rows with 5% positives, plain test sets held anywhere from 5 to 14 positives against an expected 10; stratified always exactly 10. A test set with 5 positives instead of 10 would make a model's recall swing by 20 points per missed case.</p>
  <h3>Stratifying a numeric target</h3>
  <p><code>stratify</code> needs classes. For a skewed numeric target (prices, claim amounts), cut it into quantile bins and stratify on the bin number. Each part then gets its share of cheap, mid and expensive rows: for our flats, bins "under ₹55 lakh", "55–75", "over 75" would put one cheap, one middle and one expensive flat in a 3-flat test set. In the last block (200 skewed prices), the test-set mean price varied with SD 4.61 across 200 plain splits but only 1.79 with 5 bins.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>stratified split</strong> partitions each stratum (class, or bin of a numeric target) separately, so every part has (up to rounding) the same distribution of the stratifying variable as the full data. It reduces the variance of the estimate without adding bias.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Stratify by the label <em>and</em> group or time at the same time is not possible with <code>stratify=</code>. When rows are grouped, use <code>StratifiedGroupKFold</code>; when ordered by time, do not stratify at all, cut by date (sections 05–06). Also, a class with a single row makes <code>stratify</code> fail: it cannot be put on both sides.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Group-Aware Splits.</b> All splits so far assumed each flat is an independent case. What if several rows belong to the same locality, patient or customer, and production will meet that entity for the first time?</div>

  <h2 id="ms-group"><span class="num">05</span>Group-Aware Splits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Stratified and random splits treat rows as independent. But our flats come from three localities, and a model that has seen other Baner flats has an easy job pricing one more Baner flat. If the portal is about to launch in new localities, what does a random split actually measure?</p>
  </div>
  <h3>When rows are not independent</h3>
  <p>A hospital has 10 scans per patient. Shuffle the scans and split: almost every patient ends up with some scans in training and some in test. The model can then score well by <em>recognising the patient</em> instead of recognising the disease. In production every patient is new, so that ability is worthless. Our flats have the same structure on a small scale: flats in the same locality share a price level (Baner flats sold about ₹2 lakh above the line, Hadapsar flats about ₹2 lakh below).</p>
  <table class="tbl out"><caption>By hand: the ten flats, grouped by locality</caption>
    <tr><th>Flat</th><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>H</td><td>I</td><td>J</td></tr>
    <tr><th>Locality</th><td>Had</td><td>Ban</td><td>Kot</td><td>Had</td><td>Ban</td><td>Kot</td><td>Had</td><td>Ban</td><td>Kot</td><td>Ban</td></tr>
    <tr><th>Random split (C, I to test)</th><td>train</td><td>train</td><td><strong>test</strong></td><td>train</td><td>train</td><td>train</td><td>train</td><td>train</td><td><strong>test</strong></td><td>train</td></tr>
    <tr><th>Group split (Kothrud to test)</th><td>train</td><td>train</td><td><strong>test</strong></td><td>train</td><td>train</td><td><strong>test</strong></td><td>train</td><td>train</td><td><strong>test</strong></td><td>train</td></tr>
  </table>
  <p>In the random split, the test flats C and I come from Kothrud, but Kothrud flat F is in training, so the model has already seen Kothrud prices. In the group split, all three Kothrud flats are in test: the model meets Kothrud for the first time, as it would on launch day there. Below, the model is a line on area plus one 0/1 column per locality, so it can learn each locality's price level.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, GroupKFold, cross_val_score

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
loc = np.array(["Hadapsar", "Baner", "Kothrud", "Hadapsar", "Baner",
                "Kothrud", "Hadapsar", "Baner", "Kothrud", "Baner"])
# features: area + one 0/1 column per locality
X = np.c_[area, loc == "Baner", loc == "Kothrud", loc == "Hadapsar"].astype(float)
model = LinearRegression()

for i, (tr, va) in enumerate(GroupKFold(n_splits=3).split(X, price, groups=loc), 1):
    print(f"GroupKFold fold {i}: validate {sorted(set(loc[va].tolist()))} rows {va.tolist()}, "
          f"train localities {sorted(set(loc[tr].tolist()))}")
rows = -cross_val_score(model, X, price, cv=KFold(5, shuffle=True, random_state=0), scoring="neg_mean_absolute_error")
grps = -cross_val_score(model, X, price, cv=GroupKFold(3), groups=loc, scoring="neg_mean_absolute_error")
print("random rows (KFold 5)       MAE per fold", rows.round(2), " mean", rows.mean().round(2))
print("new localities (GroupKFold) MAE per fold", grps.round(2), " mean", grps.mean().round(2))</div>
  <div class="fx" data-lang="text">GroupKFold fold 1: validate ['Baner'] rows [1, 4, 7, 9], train localities ['Hadapsar', 'Kothrud']
GroupKFold fold 2: validate ['Kothrud'] rows [2, 5, 8], train localities ['Baner', 'Hadapsar']
GroupKFold fold 3: validate ['Hadapsar'] rows [0, 3, 6], train localities ['Baner', 'Kothrud']
random rows (KFold 5)       MAE per fold [2.   1.19 0.3  0.86 1.31]  mean 1.13
new localities (GroupKFold) MAE per fold [4.06 0.89 3.64]  mean 2.86</div>
  <p>Random 5-fold CV reports MAE 1.13 lakh: almost every validation flat had a neighbour from its own locality in training. Grouped CV (leave one locality out) reports 2.86: for a locality it has never seen, the model's locality column was all zeros in training, so it cannot know whether the new locality is a pricey Baner (fold 1, MAE 4.06) or a cheaper Hadapsar (fold 3, 3.64). Both numbers are correct; they answer different questions. 1.13 is "a new flat in a locality we already cover"; 2.86 is "a flat in a locality we are launching in".</p>
  <h3>How big the effect can be</h3>
  <p>A simulation: 40 patients, 10 scans each, half the patients sick. Each patient has a personal "look" (a random 20-number signature) and the disease adds a real signal to two columns. A 1-nearest-neighbour model is used because it is the purest "find the most similar row" learner.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import KFold, GroupKFold, cross_val_score

rng = np.random.default_rng(0)
n_patients, scans_each, d = 40, 10, 20
X, y, groups = [], [], []
for p in range(n_patients):
    sick = p % 2                                       # half the patients are sick
    signature = rng.normal(0, 1, d)                    # what makes THIS patient's scans look alike
    for s in range(scans_each):
        x = signature + rng.normal(0, 0.3, d)          # each scan = patient's look + small noise
        x[:2] += 1.5 * sick                            # a real real disease signal in 2 columns
        X.append(x); y.append(sick); groups.append(p)
X, y, groups = np.array(X), np.array(y), np.array(groups)
print("rows:", X.shape[0], " patients:", len(np.unique(groups)))

model = KNeighborsClassifier(n_neighbors=1)
row_cv = cross_val_score(model, X, y, cv=KFold(5, shuffle=True, random_state=0))
grp_cv = cross_val_score(model, X, y, cv=GroupKFold(5), groups=groups)
print("random rows split  (KFold)     :", row_cv.round(3), "mean", round(row_cv.mean(), 3))
print("split by patient   (GroupKFold):", grp_cv.round(3), "mean", round(grp_cv.mean(), 3))

# Does any patient appear on both sides?
tr, va = next(KFold(5, shuffle=True, random_state=0).split(X))
print("KFold fold 1: patients in both train and val =", len(set(groups[tr]) &amp; set(groups[va])))
tr, va = next(GroupKFold(5).split(X, y, groups))
print("GroupKFold fold 1: patients in both train and val =", len(set(groups[tr]) &amp; set(groups[va])))</div>
  <div class="fx" data-lang="text">rows: 400  patients: 40
random rows split  (KFold)     : [1. 1. 1. 1. 1.] mean 1.0
split by patient   (GroupKFold): [0.625 0.638 0.675 0.588 0.775] mean 0.66
KFold fold 1: patients in both train and val = 36
GroupKFold fold 1: patients in both train and val = 0</div>
  <p>Random-row K-fold reports a perfect 1.0: for every validation scan, the nearest training scan is another scan of the same patient, which carries the right label. In fold 1, 36 of the 40 patients were on both sides. Grouped K-fold puts every patient on one side only (0 shared) and reports the honest 0.66: the disease signal is real but much weaker than the leaked identity.</p>
  <h3>Which column is the group?</h3>
  <p>Ask: "in production, will the model see this entity for the first time?" If yes, that entity is the group. Typical groups: patient, customer or user id, household, device, store, the same flat sold twice, the same housing society, the same product photographed from several angles, all sentences from the same document, all frames from the same video.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>group split</strong> assigns whole groups (all rows sharing a group id) to one side, so no group appears in both training and evaluation. It estimates performance on <em>new groups</em>. sklearn: <code>GroupShuffleSplit</code> (one split), <code>GroupKFold</code>, <code>StratifiedGroupKFold</code>, <code>LeaveOneGroupOut</code>; all take <code>groups=</code> in <code>split</code> or <code>cross_val_score</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If production <em>does</em> see the same groups again (the portal keeps pricing flats in Baner, Kothrud and Hadapsar), a group split is too pessimistic. Then split by time instead: train on past listings, test on later ones. Match the split to the question production asks.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Time-Aware Splits.</b> Groups are one way rows depend on each other. Time is the other: our flats were listed from January to October, and prices can drift month to month. What happens if we shuffle rows that have an order?</div>

  <h2 id="ms-time"><span class="num">06</span>Time-Aware Splits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The portal will always train on past sales and price future listings. A shuffled split mixes months, so the model trains on flats listed <em>after</em> some of the test flats. Does that change the score, and how should the cut be made?</p>
  </div>
  <h3>The future cannot train the past</h3>
  <p>In production a model is trained on everything up to today and predicts tomorrow. On our flats the honest split is by listing month: listed January to August trains, September and October test.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

names = np.array(list("ABCDEFGHIJ"))
area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
month = np.array([3, 1, 5, 2, 8, 4, 6, 9, 7, 10])        # month listed: Jan = 1 ... Oct = 10

order = np.argsort(month)                                  # rows in the order they were listed
print("listing order:", "".join(names[order]))
train, test = order[:8], order[8:]                        # first 8 months train, last 2 test
m = LinearRegression().fit(area[train], price[train])
print("train = listed Jan-Aug:", "".join(names[train]), "  test = Sep-Oct:", "".join(names[test]))
print("chronological test MAE:", np.abs(price[test] - m.predict(area[test])).mean().round(2),
      "  predictions", m.predict(area[test]).round(2), "actual", price[test])</div>
  <div class="fx" data-lang="text">listing order: BDAFCGIEHJ
train = listed Jan-Aug: BDAFCGIE   test = Sep-Oct: HJ
chronological test MAE: 3.11   predictions [80.67 92.1 ] actual [83 96]</div>
  <p>Sorted by listing month the flats run B, D, A, F, C, G, I, E, H, J. Training on the first eight and testing on H and J gives MAE 3.11; both latest flats sold a little above the line (83 vs 80.67, 96 vs 92.10). Is that a rising market or luck? With two flats we cannot tell (section 03: any two flats give 1.01 to 4.30). What matters is the procedure: the chronological split is the only one that copies how the model will be used. When there <em>is</em> a trend, a shuffled split hides it, as the sales example at scale shows: two years of daily sales with an upward trend and a weekly cycle, and a random forest using the day number and weekday.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score, train_test_split
from sklearn.metrics import mean_absolute_error

rng = np.random.default_rng(0)
days = np.arange(730)                                     # two years, in order
sales = 100 + 0.2 * days + 15 * np.sin(2 * np.pi * days / 7) + rng.normal(0, 5, 730)
X = np.c_[days, days % 7]                                 # features: day number, weekday
model = RandomForestRegressor(n_estimators=50, random_state=0, n_jobs=1)

# Hold-out: shuffled vs chronological
Xa, Xb, ya, yb = train_test_split(X, sales, test_size=0.2, random_state=0)       # shuffled
print("shuffled hold-out MAE     :", round(mean_absolute_error(yb, model.fit(Xa, ya).predict(Xb)), 2))
cut = int(730 * 0.8)                                                              # first 80% -&gt; train
print("chronological hold-out MAE:", round(mean_absolute_error(sales[cut:], model.fit(X[:cut], sales[:cut]).predict(X[cut:])), 2))

# Cross-validation: shuffled KFold vs TimeSeriesSplit
kf = -cross_val_score(model, X, sales, cv=KFold(5, shuffle=True, random_state=0), scoring="neg_mean_absolute_error")
ts = -cross_val_score(model, X, sales, cv=TimeSeriesSplit(5), scoring="neg_mean_absolute_error")
print("KFold(shuffle) MAE per fold :", kf.round(1), "mean", round(kf.mean(), 1))
print("TimeSeriesSplit MAE per fold:", ts.round(1), "mean", round(ts.mean(), 1))</div>
  <div class="fx" data-lang="text">shuffled hold-out MAE     : 5.2
chronological hold-out MAE: 14.84
KFold(shuffle) MAE per fold : [5.1 4.8 4.8 4.9 4.4] mean 4.8
TimeSeriesSplit MAE per fold: [11.9 12.7 13.  15.1 13.2] mean 13.2</div>
  <p>The shuffled hold-out says MAE 5.2 cups; training on the first 80% of days and testing on the last 20% gives 14.84, almost three times worse. Shuffled 5-fold CV says 4.8; <code>TimeSeriesSplit</code> says 13.2. The shuffled numbers are not just optimistic, they are about the wrong task: a shuffled split predicts days sandwiched between known neighbours (interpolation), while forecasting goes beyond the last known day. Trees cannot extrapolate a trend beyond the last day they saw (see <a class="xref" data-note="ml_dtree">Decision Trees</a>), and only the time-ordered split reveals it.</p>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<text x="20" y="16" class="tm">shuffled: test days scattered among training days</text>
<g class="fb sb"><rect x="20" y="24" width="520" height="22"/></g>
<g class="fr sr"><rect x="60" y="24" width="12" height="22"/><rect x="130" y="24" width="12" height="22"/><rect x="215" y="24" width="12" height="22"/><rect x="300" y="24" width="12" height="22"/><rect x="390" y="24" width="12" height="22"/><rect x="470" y="24" width="12" height="22"/></g>
<text x="20" y="70" class="tm">chronological: train on the past, test on the future (with an optional gap)</text>
<rect x="20" y="78" width="400" height="22" class="fb sb"/><rect x="420" y="78" width="16" height="22" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><rect x="436" y="78" width="104" height="22" class="fr sr"/>
<text x="428" y="114" text-anchor="middle" class="tm" font-size="10">gap</text><text x="220" y="114" text-anchor="middle" class="tb" font-size="11">train</text><text x="488" y="114" text-anchor="middle" class="tr" font-size="11">test</text>
</svg><figcaption>Blue = training days, red = test days. Only the bottom layout matches how a forecast is used.</figcaption></figure>
  <h3>Gaps and embargoes</h3>
  <p>Sometimes rows close in time share information even after a time-ordered cut. A target "sales over the next 7 days" for Monday overlaps the target for Tuesday; a feature "average price in this locality over the last 3 months" for the first test flat uses months inside the training period. Leave a <strong>gap</strong> (also called an embargo or purge) between the last training row and the first test row, at least as long as the target window or the longest feature window. <code>TimeSeriesSplit(gap=…)</code> does this.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>temporal split</strong> uses a cut-off time t: rows with time ≤ t train, rows after t (optionally after t + gap) evaluate. It estimates performance of a model deployed at t on the period that follows. Never shuffle rows whose order carries information.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Time leaks hide in features, not just in the split: a "locality average price" column computed over the full year, or a scaler fitted on all dates. Compute every feature using only information available at prediction time (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>, <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: k-Fold Cross-Validation.</b> Every split so far is one cut, and section 03 showed one cut of ten flats is mostly luck while the held-out flats never train. Can every flat be used for both training and validation?</div>

  <h2 id="ms-kfold"><span class="num">07</span>k-Fold Cross-Validation by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A single split wastes data (the validation flats never train) and depends on luck (MAE 1.01 to 4.30 for the same line). With ten flats both problems are severe. Is there a way to use every flat for validation once and for training the rest of the time?</p>
  </div>
  <h3>The idea</h3>
  <p>Cut the data into k equal parts called <strong>folds</strong>. Train on k − 1 folds and score on the one left out. Repeat k times so each fold is left out exactly once. You get k scores; report their mean (the CV estimate) and their spread. Every row is used for validation once and for training k − 1 times.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a batsman on one match is mostly luck: the pitch, the bowlers. Judging him on five matches against five different teams is fairer. Each fold is one match, and every team (fold) gets to bowl once.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="20" y="16" class="tm">5-fold CV: green = validation fold, blue = training folds</text>
<rect x="20" y="26" width="400" height="18" class="fb sb"/><rect x="20" y="26" width="80" height="18" class="fg sg"/>
<rect x="20" y="50" width="400" height="18" class="fb sb"/><rect x="100" y="50" width="80" height="18" class="fg sg"/>
<rect x="20" y="74" width="400" height="18" class="fb sb"/><rect x="180" y="74" width="80" height="18" class="fg sg"/>
<rect x="20" y="98" width="400" height="18" class="fb sb"/><rect x="260" y="98" width="80" height="18" class="fg sg"/>
<rect x="20" y="122" width="400" height="18" class="fb sb"/><rect x="340" y="122" width="80" height="18" class="fg sg"/>
<g font-size="12"><text x="430" y="40">fold 1 → score₁</text><text x="430" y="64">fold 2 → score₂</text><text x="430" y="88">fold 3 → score₃</text><text x="430" y="112">fold 4 → score₄</text><text x="430" y="136">fold 5 → score₅</text></g>
</svg><figcaption>Each row of bars is one model. Five models, five scores; the CV estimate is their mean.</figcaption></figure>
  <h3>By hand: 10 flats, 5 folds</h3>
  <p>To keep the arithmetic exact, start with the simplest possible model, the baseline: predict the mean of the training prices for every flat. Training it means computing one average. The score is MAE, the average absolute miss. The ten prices total 670. Without shuffling, 5 folds of 2 flats are {A, B}, {C, D}, {E, F}, {G, H}, {I, J}. For each fold, the training mean is (670 − the two held-out prices) / 8.</p>
  <table class="tbl out"><caption>5-fold CV of the mean predictor, every number</caption>
    <tr><th>Fold</th><th>Validation y</th><th>Training mean</th><th>Absolute misses</th><th>Fold MAE</th></tr>
    <tr><td>1 (A, B)</td><td>38, 49</td><td>(670 − 87)/8 = 72.875</td><td>34.875, 23.875</td><td>29.375</td></tr>
    <tr><td>2 (C, D)</td><td>53, 56</td><td>(670 − 109)/8 = 70.125</td><td>17.125, 14.125</td><td>15.625</td></tr>
    <tr><td>3 (E, F)</td><td>67, 68</td><td>(670 − 135)/8 = 66.875</td><td>0.125, 1.125</td><td>0.625</td></tr>
    <tr><td>4 (G, H)</td><td>73, 83</td><td>(670 − 156)/8 = 64.25</td><td>8.75, 18.75</td><td>13.75</td></tr>
    <tr><td>5 (I, J)</td><td>87, 96</td><td>(670 − 183)/8 = 60.875</td><td>26.125, 35.125</td><td>30.625</td></tr>
  </table>
  <p>CV estimate = (29.375 + 15.625 + 0.625 + 13.75 + 30.625) / 5 = 90 / 5 = <strong>18.0</strong>. Spread: deviations from 18 are 11.375, −2.375, −17.375, −4.25, 12.625; squares 129.39, 5.64, 301.89, 18.06, 159.39 sum to 614.375; divided by 5 = 122.875; square root = 11.08. Report "MAE 18.0 ± 11.1 over 5 folds". The fold scores range from 0.625 (the two middle flats, close to any average) to 30.6, which shows how much one validation split could have misled us.</p>
  <p>Now the line. In each fold it is refitted on 8 flats (the slope stays near 6) and scores about 2 lakh. CV lets us compare the two <em>procedures</em> on all ten flats, not on one lucky pair:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import KFold, LeaveOneOut, cross_val_score
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)   # area of flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])              # price, total = 670

for i, (tr, va) in enumerate(KFold(n_splits=5).split(X), 1):
    m = y[tr].mean()                                 # "training" the mean predictor = one average
    line = LinearRegression().fit(X[tr], y[tr])
    print(f"fold {i}: val y {y[va].tolist()}  train mean {m:.3f}  mean-MAE {np.abs(y[va] - m).mean():.3f}"
          f"  | line {line.coef_[0]:.2f}x+{line.intercept_:.2f}  line-MAE {np.abs(y[va] - line.predict(X[va])).mean():.2f}")

for name, model in [("mean predictor", DummyRegressor(strategy="mean")), ("line", LinearRegression())]:
    s = -cross_val_score(model, X, y, cv=KFold(5), scoring="neg_mean_absolute_error")
    print(f"cross_val_score {name:14s}: {s.round(3)}  mean {s.mean():.3f}  std {s.std():.3f}")

loo = -cross_val_score(DummyRegressor(), X, y, cv=LeaveOneOut(), scoring="neg_mean_absolute_error")
print("LOOCV mean predictor: 10 fits, per-flat errors", loo.round(2).tolist())
print("LOOCV MAE", round(loo.mean(), 4), "  shortcut (10/9) x 144/10 =", round(10 / 9 * 144 / 10, 4))</div>
  <div class="fx" data-lang="text">fold 1: val y [38, 49]  train mean 72.875  mean-MAE 29.375  | line 6.06x+9.25  line-MAE 2.47
fold 2: val y [53, 56]  train mean 70.125  mean-MAE 15.625  | line 5.99x+10.26  line-MAE 1.49
fold 3: val y [67, 68]  train mean 66.875  mean-MAE 0.625  | line 6.03x+9.59  line-MAE 2.52
fold 4: val y [73, 83]  train mean 64.250  mean-MAE 13.750  | line 6.04x+9.87  line-MAE 1.98
fold 5: val y [87, 96]  train mean 60.875  mean-MAE 30.625  | line 5.85x+11.19  line-MAE 1.58
cross_val_score mean predictor: [29.375 15.625  0.625 13.75  30.625]  mean 18.000  std 11.085
cross_val_score line          : [2.47  1.493 2.515 1.979 1.577]  mean 2.007  std 0.430
LOOCV mean predictor: 10 fits, per-flat errors [32.22, 20.0, 15.56, 12.22, 0.0, 1.11, 6.67, 17.78, 22.22, 32.22]
LOOCV MAE 16.0   shortcut (10/9) x 144/10 = 16.0</div>
  <p>The loop reproduces the hand table line by line, and <code>cross_val_score</code> with <code>DummyRegressor(strategy="mean")</code> gives the same five scores, mean 18.0 and std 11.085. The line scores 2.007 ± 0.430: nine times better than the baseline, and much steadier fold to fold. Two sklearn details: scores are always "higher is better", so MAE comes back as <code>neg_mean_absolute_error</code> and we flip the sign; and NumPy's <code>std</code> divides by k (population SD), as in the hand calculation. The last two lines are leave-one-out, section 09.</p>
  <h3>What exactly does CV estimate?</h3>
  <p>Not the error of one particular fitted model. Each fold trains a different model on (k−1)/k of the data (the five fitted lines above all differ slightly). The CV mean estimates the expected error of <em>the procedure</em> "fit a line on about 8 flats from this source". That is why, after CV, you refit on all the data for the final model (price = 6 × area + 10): its error should be a little lower than the CV estimate, because it trains on more rows.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>k-fold cross-validation</strong>: partition the data into k disjoint folds F₁…F_k of near-equal size. For each j, fit on all rows except F_j and compute the score s_j on F_j. The CV estimate is CV(k) = (1/k) Σⱼ s_j (or, for MSE, the row-weighted average when folds differ in size). It is used to compare models and choose hyperparameters without a separate validation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>CV costs k fits. For a model that takes an hour to train, 10-fold CV takes 10 hours; inside a grid search of 50 settings, 500 hours. For big data and slow models, a single large validation set is the normal choice, and its noise is small anyway (section 03).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Stratified k-Fold.</b> Our folds had no classes. For "sold within 30 days?" plain folds can be badly unbalanced, especially when the file is sorted by label, which exports often are.</div>

  <h2 id="ms-skfold"><span class="num">08</span>Stratified k-Fold</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 04 fixed the class mix of one split. k-fold makes k splits, each of which can get the mix wrong, and if the file is sorted by label the folds will be lopsided every time. How do we keep the classes balanced in every fold?</p>
  </div>
  <p>The portal's export lists the four fast sellers first: A, D, F, G, then B, C, E, H, I, J. Two folds without shuffling: fold 1 = the first five rows = four fast sellers and B; fold 2 = the last five = all slow sellers. The model trained for fold 2 sees all four fast sellers, and fold 2's validation set has no fast seller to find. <strong>Stratified k-fold</strong> deals each class out separately: 4 fast sellers → 2 per fold, 6 slow sellers → 3 per fold. Each fold gets 2 fast and 3 slow, the same 40% as the whole.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import KFold, StratifiedKFold

# The portal's export lists the fast sellers first: A, D, F, G, then the other six
flats = np.array(list("ADFGBCEHIJ"))
y = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])        # sold within 30 days?
X = np.zeros((10, 1))
for name, cv in [("KFold          ", KFold(2)), ("StratifiedKFold", StratifiedKFold(2))]:
    for i, (tr, va) in enumerate(cv.split(X, y), 1):
        print(f"{name} fold {i}: val flats {''.join(flats[va])}  val labels {y[va].tolist()}")

y = np.array([1]*10 + [0]*90)                        # 100 rows, 10% positive, sorted
X = np.zeros((100, 1))
for name, cv in [("KFold(5)                ", KFold(5)),
                 ("KFold(5, shuffle)       ", KFold(5, shuffle=True, random_state=0)),
                 ("StratifiedKFold(5, shuf)", StratifiedKFold(5, shuffle=True, random_state=0))]:
    print(name, "positives per val fold:", [int(y[v].sum()) for _, v in cv.split(X, y)])</div>
  <div class="fx" data-lang="text">KFold           fold 1: val flats ADFGB  val labels [1, 1, 1, 1, 0]
KFold           fold 2: val flats CEHIJ  val labels [0, 0, 0, 0, 0]
StratifiedKFold fold 1: val flats ADBCE  val labels [1, 1, 0, 0, 0]
StratifiedKFold fold 2: val flats FGHIJ  val labels [1, 1, 0, 0, 0]
KFold(5)                 positives per val fold: [10, 0, 0, 0, 0]
KFold(5, shuffle)        positives per val fold: [3, 2, 4, 0, 1]
StratifiedKFold(5, shuf) positives per val fold: [2, 2, 2, 2, 2]</div>
  <p>The first block matches the hand assignment: StratifiedKFold took A, D (fast) and B, C, E (slow) for fold 1. On 100 sorted rows with 10% positives, plain KFold puts all 10 positives in fold 1 and none elsewhere: four folds cannot measure recall at all. Shuffling helps but still gives 0 to 4 positives per fold. Stratified gives exactly 2 every time.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>For classification, stratified k-fold is the safe default, and scikit-learn already uses it when you pass <code>cv=5</code> with a classifier. But it does <em>not</em> shuffle unless you ask (<code>StratifiedKFold(5, shuffle=True, random_state=…)</code>), so data ordered in some other way (by date, by locality) still lands fold by fold.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffling a time series inside StratifiedKFold to "balance the classes". If rows are ordered in time, stratification is the wrong tool; use time-series CV and accept unequal class shares per fold.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Leave-One-Out.</b> More folds means more training data per fold (8 flats with k = 5). Why not take k as large as possible: k = 10, one flat left out at a time?</div>

  <h2 id="ms-loo"><span class="num">09</span>Leave-One-Out CV</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With k = 5 each model trains on 8 of the 10 flats, so it is a little worse than the final model trained on all 10, and CV is a little pessimistic. With k = n each model trains on 9. Is that the best choice, and does it really cost n fits?</p>
  </div>
  <h3>By hand on the same 10 flats</h3>
  <p><strong>LOOCV</strong> is k-fold with k = n: train on n − 1 rows, predict the single left-out row, repeat n times. For the mean predictor there is a neat shortcut. Leaving out flat i, the training mean is (670 − yᵢ) / 9, so the miss is</p>
  <p style="text-align:center">yᵢ − (670 − yᵢ)/9 = (9yᵢ − 670 + yᵢ)/9 = (10/9)(yᵢ − 67)</p>
  <p>where 67 is the full mean. The values of |yᵢ − 67| are 29, 18, 14, 11, 0, 1, 6, 16, 20, 29, summing to 144. LOOCV MAE = (10/9) × 144 / 10 = <strong>16.0</strong>. Flat A (y = 38): miss = (10/9) × 29 = 32.22, matching the first per-flat error printed in section 07's output. The code there ran 10 separate fits and got 16.0, equal to the shortcut. (5-fold said 18.0: the mean of 8 flats is a slightly worse predictor than the mean of 9.)</p>
  <h3>The one-fit shortcut for linear regression</h3>
  <p>For ordinary least squares there is an exact shortcut, so LOOCV costs one fit instead of n. Fit once on all rows, get each residual eᵢ = yᵢ − ŷᵢ and each row's <strong>leverage</strong> hᵢᵢ (how much row i pulls the line towards itself, the diagonal of the hat matrix H = X(XᵀX)⁻¹Xᵀ). Then the leave-one-out residual is eᵢ / (1 − hᵢᵢ). The sum of their squares is called PRESS.</p>
  <p>For one feature with an intercept, hᵢᵢ = 1/n + (xᵢ − x̄)² / Σ(x − x̄)². For our flats x̄ = 9.5 and Σ(x − x̄)² = 82.5. Flat A (x = 5): h = 1/10 + 4.5²/82.5 = 0.1 + 0.2455 = 0.3455. The full-data residual of A is −2 (38 vs 40), so its leave-one-out residual is −2 / (1 − 0.3455) = −3.06. Flat E (x = 9) is in the middle: h = 0.1 + 0.25/82.5 = 0.103, so its residual 3 only grows to 3 / 0.897 = 3.34. End points have the most leverage, middle points the least.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_predict

x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)   # area of flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = x.reshape(-1, 1)

# Slow way: 10 separate fits, each leaving one flat out
slow = y - cross_val_predict(LinearRegression(), X, y, cv=LeaveOneOut())

# Fast way: ONE fit + the hat-matrix diagonal h_ii
A = np.c_[np.ones(10), x]                      # design matrix with intercept column
H = A @ np.linalg.inv(A.T @ A) @ A.T           # hat matrix: y_hat = H y
resid = y - LinearRegression().fit(X, y).predict(X)
fast = resid / (1 - np.diag(H))

print("residuals e_i  :", resid.round(3))
print("leverage h_ii  :", np.diag(H).round(4))
print("LOO residuals (10 fits):", slow.round(2))
print("e_i/(1-h_ii)   (1 fit) :", fast.round(2))
print("LOOCV MSE both ways:", round(np.mean(slow**2), 4), round(np.mean(fast**2), 4),
      "  training MSE:", round(np.mean(resid**2), 4))</div>
  <div class="fx" data-lang="text">residuals e_i  : [-2.  3.  1. -2.  3. -2. -3.  1. -1.  2.]
leverage h_ii  : [0.3455 0.2485 0.1758 0.1273 0.103  0.103  0.1273 0.1758 0.2485 0.3455]
LOO residuals (10 fits): [-3.06  3.99  1.21 -2.29  3.34 -2.23 -3.44  1.21 -1.33  3.06]
e_i/(1-h_ii)   (1 fit) : [-3.06  3.99  1.21 -2.29  3.34 -2.23 -3.44  1.21 -1.33  3.06]
LOOCV MSE both ways: 7.2549 7.2549   training MSE: 4.6</div>
  <p>The leverages match the hand values (0.3455 at the ends, 0.103 in the middle), and the 10-fit LOO residuals equal eᵢ / (1 − hᵢᵢ) from a single fit. LOOCV MSE is 7.25, against the training MSE of 4.6 from the previous note: the honest error is about 58% higher than the error on the flats the line was fitted to. A row with high leverage has its residual inflated the most, because removing it moves the line the most. The same idea gives fast LOOCV for ridge regression (<code>RidgeCV</code> uses it by default) and is behind Cook's distance in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>
  <h3>Pros and cons</h3>
  <table class="tbl">
    <tr><th>For LOOCV</th><th>Against LOOCV</th></tr>
    <tr><td>Each model trains on n − 1 rows: almost no pessimistic bias</td><td>n fits: impossible for large n or slow models (unless a shortcut exists)</td></tr>
    <tr><td>No randomness: the result is the same every run</td><td>The n training sets are nearly identical, so the n models are highly correlated; for unstable models the estimate can have high variance (section 13)</td></tr>
    <tr><td>Useful for tiny datasets (n &lt; 50), like our ten flats</td><td>Each "fold" has one row, so per-fold scores like AUC or recall cannot be computed; only per-row losses averaged</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leave-one-out CV</strong>: CV_LOO = (1/n) Σᵢ L(yᵢ, f₋ᵢ(xᵢ)), where f₋ᵢ is the model fitted without row i. For least squares, yᵢ − f₋ᵢ(xᵢ) = eᵢ / (1 − hᵢᵢ) exactly. <strong>Leave-p-out</strong> leaves out every subset of p rows, C(n, p) fits, and is almost never practical (section 03's 45 two-flat test sets were leave-2-out).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>LOOCV with a classifier and accuracy: each fold scores 0 or 1, and <code>cross_val_score(..., cv=LeaveOneOut(), scoring="roc_auc")</code> fails because one row has one class. Use <code>cross_val_predict</code> to collect the n out-of-fold predictions and compute AUC once on all of them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Repeated CV.</b> LOO has no randomness, but shuffled k-fold does: which flats share a fold changes with the seed, and so does the score. How much, and what can we do about it?</div>

  <h2 id="ms-repeat"><span class="num">10</span>Repeated CV</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Shuffled 5-fold CV of the line on our flats gives one number, but run it with another seed and the number changes. If two models differ by less than that wobble, which one is better?</p>
  </div>
  <p>A k-fold estimate has two sources of randomness: the dataset itself (which you cannot change) and the particular partition into folds (which you can average away). <strong>Repeated k-fold</strong> runs k-fold r times with different shuffles and averages all k × r scores.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, RepeatedKFold, cross_val_score

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)   # flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
line = LinearRegression()

# The same 5-fold CV of the line, with 8 different shuffles
means = [-cross_val_score(line, X, y, cv=KFold(5, shuffle=True, random_state=s),
                          scoring="neg_mean_absolute_error").mean() for s in range(8)]
print("5-fold CV MAE with 8 shuffles:", np.round(means, 3), " SD", round(np.std(means), 3))
rep = -cross_val_score(line, X, y, cv=RepeatedKFold(n_splits=5, n_repeats=20, random_state=0),
                       scoring="neg_mean_absolute_error")
print("RepeatedKFold(5 x 20):", len(rep), "fold scores, mean", rep.mean().round(3))</div>
  <div class="fx" data-lang="text">5-fold CV MAE with 8 shuffles: [2.588 2.661 2.634 2.553 2.322 2.513 2.713 2.316]  SD 0.139
RepeatedKFold(5 x 20): 100 fold scores, mean 2.566</div>
  <p>The same line on the same ten flats scores between 2.316 and 2.713 depending only on how the flats were dealt into folds (SD 0.139). Averaging 20 repeats (100 fits) gives 2.566. The same thing at scale, a logistic regression on 120 rows:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, RepeatedStratifiedKFold, cross_val_score

X, y = make_classification(n_samples=120, n_features=8, n_informative=3, flip_y=0.1, random_state=2)
model = LogisticRegression(max_iter=1000)

# One 5-fold CV, run with 8 different shuffles: the answer moves
means = [cross_val_score(model, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=s)).mean()
         for s in range(8)]
print("5-fold CV mean with 8 different shuffles:", np.round(means, 3))
print("spread of those means (SD):", round(np.std(means), 4))

# Repeated: 10 shuffles x 5 folds = 50 fits, averaged
rcv = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=0)
scores = cross_val_score(model, X, y, cv=rcv)
print("RepeatedStratifiedKFold(5 x 10):", len(scores), "scores, mean", round(scores.mean(), 3),
      " SD of single folds", round(scores.std(), 3))</div>
  <div class="fx" data-lang="text">5-fold CV mean with 8 different shuffles: [0.817 0.85  0.808 0.808 0.825 0.792 0.825 0.808]
spread of those means (SD): 0.0161
RepeatedStratifiedKFold(5 x 10): 50 scores, mean 0.813  SD of single folds 0.064</div>
  <p>On these 120 rows, the same model's 5-fold CV mean ranged from 0.792 to 0.850 just by reshuffling (SD 0.016). Any comparison between two models that differ by 0.02 could flip with the seed. Averaging 10 repeats (50 fits) gives 0.813, an estimate whose partition noise is roughly √10 ≈ 3 times smaller. The 0.064 is the spread of single-fold scores, which is much larger because each fold has only 24 rows.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Repeating removes the luck of the <em>partition</em>, not the luck of the <em>data</em>. Our ten flats are still one sample of Pune; repeated CV makes the estimate stable, not more correct about the world. Use it on small datasets and when comparing close models (with the same seeds for both models, so the comparison is paired).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating the 100 repeated scores as 100 independent measurements and computing a tiny standard error from them. They reuse the same ten flats over and over; the true uncertainty is far larger than SD/√100.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Time-Series CV.</b> Repeating means reshuffling, and section 06 showed shuffling is wrong for time-ordered data. What does cross-validation look like when the order must be kept?</div>

  <h2 id="ms-tscv"><span class="num">11</span>Time-Series CV</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 06 made one chronological cut (Jan–Aug train, Sep–Oct test), which is one lucky or unlucky pair of flats. k-fold averages many cuts but shuffles time. Can we have many cuts that all respect time?</p>
  </div>
  <p>Time-series CV uses several time cut-offs instead of one. Each split trains on everything before a cut-off and validates on the block right after it. Three variants:</p>
  <ul>
    <li><strong>Expanding window</strong> (default): training always starts at the beginning and grows. Uses all history; later folds have more data.</li>
    <li><strong>Sliding (rolling) window</strong>: training has a fixed maximum length and moves forward. Good when old data is no longer relevant (the market changed).</li>
    <li><strong>Gap</strong>: skip some rows between training and validation to stop overlapping targets or features from leaking (section 06).</li>
  </ul>
  <p>By hand, our ten flats in listing order B, D, A, F, C, G, I, E, H, J and <code>n_splits=3</code>: sklearn uses validation blocks of size n // (n_splits + 1) = 10 // 4 = 2. The three blocks are the last 6 rows in three pieces: positions 4–5 (C, G), 6–7 (I, E), 8–9 (H, J). Each trains on everything before its block: B D A F, then B D A F C G, then the first eight. With <code>gap=1</code>, drop the last training row each time: B D A, B D A F C, B D A F C G I. With <code>max_train_size=4</code>, keep only the most recent 4 training rows: B D A F, A F C G, C G I E.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.linear_model import LinearRegression

# The ten flats sorted by the month they were listed (Jan ... Oct)
flats = np.array(list("BDAFCGIEHJ"))
area  = np.array([6, 8, 5, 10, 7, 11, 13, 9, 12, 14]).reshape(-1, 1)
price = np.array([49, 56, 38, 68, 53, 73, 87, 67, 83, 96])

for title, cv in [("expanding (default)", TimeSeriesSplit(n_splits=3)),
                  ("with gap=1", TimeSeriesSplit(n_splits=3, gap=1)),
                  ("sliding, max_train_size=4", TimeSeriesSplit(n_splits=3, max_train_size=4))]:
    print(title)
    for tr, va in cv.split(area):
        m = LinearRegression().fit(area[tr], price[tr])
        mae = np.abs(price[va] - m.predict(area[va])).mean()
        print(f"   train {''.join(flats[tr]):8s} rows {tr.tolist()}  val {''.join(flats[va])} rows {va.tolist()}  line MAE {mae:.2f}")</div>
  <div class="fx" data-lang="text">expanding (default)
   train BDAF     rows [0, 1, 2, 3]  val CG rows [4, 5]  line MAE 1.15
   train BDAFCG   rows [0, 1, 2, 3, 4, 5]  val IE rows [6, 7]  line MAE 3.58
   train BDAFCGIE rows [0, 1, 2, 3, 4, 5, 6, 7]  val HJ rows [8, 9]  line MAE 3.11
with gap=1
   train BDA      rows [0, 1, 2]  val CG rows [4, 5]  line MAE 1.29
   train BDAFC    rows [0, 1, 2, 3, 4]  val IE rows [6, 7]  line MAE 3.09
   train BDAFCGI  rows [0, 1, 2, 3, 4, 5, 6]  val HJ rows [8, 9]  line MAE 3.74
sliding, max_train_size=4
   train BDAF     rows [0, 1, 2, 3]  val CG rows [4, 5]  line MAE 1.15
   train AFCG     rows [2, 3, 4, 5]  val IE rows [6, 7]  line MAE 3.29
   train CGIE     rows [4, 5, 6, 7]  val HJ rows [8, 9]  line MAE 3.30</div>
  <p>All three layouts match the hand reasoning. The line's validation MAE per cut-off (1.15, 3.58, 3.11 for the expanding window) is the time-respecting version of section 07's 2.01; it is higher partly because early folds train on only four flats. <code>test_size=…</code> overrides the default block size. In section 06 at scale, this splitter gave MAE 13.2 where shuffled K-fold gave a misleading 4.8.</p>
  <figure class="viz"><svg viewBox="0 0 560 140" width="560">
<text x="20" y="14" class="tm">expanding window</text><text x="300" y="14" class="tm">sliding window</text>
<rect x="20" y="22" width="60" height="16" class="fb sb"/><rect x="80" y="22" width="60" height="16" class="fg sg"/>
<rect x="20" y="44" width="120" height="16" class="fb sb"/><rect x="140" y="44" width="60" height="16" class="fg sg"/>
<rect x="20" y="66" width="180" height="16" class="fb sb"/><rect x="200" y="66" width="60" height="16" class="fg sg"/>
<rect x="300" y="22" width="60" height="16" class="fb sb"/><rect x="360" y="22" width="60" height="16" class="fg sg"/>
<rect x="340" y="44" width="80" height="16" class="fb sb"/><rect x="420" y="44" width="60" height="16" class="fg sg"/>
<rect x="400" y="66" width="80" height="16" class="fb sb"/><rect x="480" y="66" width="60" height="16" class="fg sg"/>
<line x1="20" y1="100" x2="540" y2="100" stroke="currentColor" marker-end="url(#ms-fa)"/><text x="280" y="118" text-anchor="middle" class="tm">time →</text>
<rect x="20" y="124" width="12" height="10" class="fb sb"/><text x="36" y="133" class="tm" font-size="11">train</text><rect x="80" y="124" width="12" height="10" class="fg sg"/><text x="96" y="133" class="tm" font-size="11">validate</text>
</svg><figcaption>Left: training grows from the start. Right: training keeps a fixed length and slides. In both, validation is always later than training.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Time-series cross-validation</strong> (rolling-origin evaluation, walk-forward validation): choose origins t₁ &lt; t₂ &lt; … &lt; t_k; for each, fit on rows with time ≤ tⱼ (within a window, minus a gap) and evaluate on the next h rows. Averaging over origins estimates the error of the forecasting procedure as it would have run in the past.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>TimeSeriesSplit</code> assumes the rows are already sorted by time and equally spaced, one row per time step. Our flats had to be sorted by listing month first; with many series (one per store) stacked together, rows for the same date are spread out, so split by date values yourself (or sort by date and use groups of dates) so that no store's future trains another store's past. <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> builds such splits.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Nested CV.</b> We now use CV to <em>choose</em> hyperparameters (the k of kNN, the intercept). But section 02 showed that choosing on a set makes its score optimistic. If CV picks the best of several settings, is the CV score of the winner honest?</div>

  <h2 id="ms-nested"><span class="num">12</span>Nested CV</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 02's 2 validation flats chose a model and then over-promised (0.52 on validation, 3.96 on test). CV with many folds is steadier, but the same selection bias applies: the best of several CV scores is the best skill plus the best luck. How do we score a model whose settings were picked on those same folds?</p>
  </div>
  <h3>Why: the tuning leak</h3>
  <p><code>GridSearchCV</code> scores each candidate setting with k-fold CV and reports the best mean as <code>best_score_</code>. That number is the maximum of many noisy estimates measured on the same folds: the selection bias of section 02 again. It describes how well the winner did on the folds that <em>chose</em> it, not how well it will do on new data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>144 students sit the same mock paper and the topper is chosen. The topper's mark is partly ability and partly luck on that paper. To know how good the topper really is, give a fresh paper, one that played no part in choosing. Nested CV is the fresh paper, repeated for every way of choosing.</p>
  </div>
  <p><strong>Nested CV</strong> wraps the whole tuning procedure in an outer CV loop. For each outer fold: hold it out, run the <em>entire</em> grid search (with its own inner CV) on the remaining rows only, take the winner, and score it on the held-out outer fold. The outer scores are honest because their rows never took part in tuning.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
<text x="20" y="16" class="tm" font-size="12">outer fold 1 of 3</text>
<rect x="20" y="24" width="380" height="24" class="fb sb"/><rect x="400" y="24" width="180" height="24" class="fr sr"/>
<text x="210" y="41" text-anchor="middle" font-size="12">outer train: used for tuning</text><text x="490" y="41" text-anchor="middle" font-size="12">outer test: score once</text>
<text x="20" y="72" class="tm" font-size="12">inside the outer train: 4-fold inner CV for each candidate k</text>
<g><rect x="20" y="80" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="20" y="80" width="95" height="14" class="fg sg"/>
<rect x="20" y="98" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="115" y="98" width="95" height="14" class="fg sg"/>
<rect x="20" y="116" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="210" y="116" width="95" height="14" class="fg sg"/>
<rect x="20" y="134" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="305" y="134" width="95" height="14" class="fg sg"/></g>
<text x="410" y="96" font-size="11.5">→ inner score per k</text><text x="410" y="114" font-size="11.5">→ pick best k</text><text x="410" y="132" font-size="11.5">→ refit on outer train</text><text x="410" y="150" font-size="11.5" class="tr">→ score on outer test</text>
<text x="20" y="166" class="tm" font-size="11">repeat for outer folds 2 and 3; the nested estimate is the mean of the 3 outer scores</text>
</svg><figcaption>Two loops. The inner loop chooses; the outer loop measures the choosing procedure on rows it never touched.</figcaption></figure>
  <h3>By hand on the ten flats: the bookkeeping</h3>
  <p>Tune k for k-nearest-neighbours on the flats, 4 candidates (k = 1, 2, 3, 4), inner 4-fold CV, outer 5-fold CV. Number of fits = outer folds × (candidates × inner folds + 1 refit) = 5 × (4 × 4 + 1) = 85. Each outer fold holds 2 flats; the inner search sees only the other 8.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import KFold, GridSearchCV, cross_val_score

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)   # flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
grid = {"n_neighbors": [1, 2, 3, 4]}
inner = KFold(4, shuffle=True, random_state=0)
outer = KFold(5, shuffle=True, random_state=1)
mae = "neg_mean_absolute_error"

gs = GridSearchCV(KNeighborsRegressor(), grid, cv=inner, scoring=mae).fit(X, y)
print("non-nested: inner CV MAE per k", (-gs.cv_results_["mean_test_score"]).round(2),
      " best k", gs.best_params_["n_neighbors"], " best_score_ MAE", round(-gs.best_score_, 2))

outer_scores = []
for i, (tr, te) in enumerate(outer.split(X), 1):
    g = GridSearchCV(KNeighborsRegressor(), grid, cv=inner, scoring=mae).fit(X[tr], y[tr])
    s = np.abs(y[te] - g.predict(X[te])).mean()
    outer_scores.append(s)
    print(f"outer fold {i}: test flats rows {te.tolist()}  inner MAE per k {(-g.cv_results_['mean_test_score']).round(2)}"
          f"  picked k={g.best_params_['n_neighbors']}  outer MAE {s:.2f}")
print("nested CV MAE:", round(np.mean(outer_scores), 2))
print("fits: non-nested 4 x 4 + 1 =", 4 * 4 + 1, "  nested 5 x 17 =", 5 * 17)</div>
  <div class="fx" data-lang="text">non-nested: inner CV MAE per k [6.79 4.83 5.31 6.51]  best k 2  best_score_ MAE 4.83
outer fold 1: test flats rows [2, 9]  inner MAE per k [8.62 5.5  7.12 8.34]  picked k=2  outer MAE 5.75
outer fold 2: test flats rows [4, 6]  inner MAE per k [ 7.25  7.19  6.5  11.  ]  picked k=3  outer MAE 7.17
outer fold 3: test flats rows [0, 3]  inner MAE per k [4.   6.12 6.5  9.22]  picked k=1  outer MAE 7.00
outer fold 4: test flats rows [1, 7]  inner MAE per k [ 7.12  7.56 10.5   9.09]  picked k=1  outer MAE 10.50
outer fold 5: test flats rows [5, 8]  inner MAE per k [9.12 7.06 8.71 9.5 ]  picked k=2  outer MAE 2.25
nested CV MAE: 6.53
fits: non-nested 4 x 4 + 1 = 17   nested 5 x 17 = 85</div>
  <table class="tbl out"><caption>Reading the output by hand</caption>
    <tr><th>Outer fold</th><th>Lowest inner MAE</th><th>Chosen k</th><th>Outer test MAE</th></tr>
    <tr><td>1 (C, J)</td><td>5.50</td><td>2</td><td>5.75</td></tr>
    <tr><td>2 (E, G)</td><td>6.50</td><td>3</td><td>7.17</td></tr>
    <tr><td>3 (A, D)</td><td>4.00</td><td>1</td><td>7.00</td></tr>
    <tr><td>4 (B, H)</td><td>7.12</td><td>1</td><td>10.50</td></tr>
    <tr><td>5 (F, I)</td><td>7.06</td><td>2</td><td>2.25</td></tr>
    <tr><td colspan="3"><strong>Nested estimate</strong></td><td><strong>(5.75 + 7.17 + 7.00 + 10.50 + 2.25)/5 = 6.53</strong></td></tr>
  </table>
  <p>Two lessons. First, the non-nested <code>best_score_</code> says kNN tuned this way misses by 4.83 lakh; the honest nested estimate is 6.53, a third worse. Second, each outer fold chose a <em>different</em> k (2, 3, 1, 1, 2): nested CV does not produce one hyperparameter value, it scores the procedure "tune k by 4-fold CV, then refit". (And kNN at 6.5 is far worse than the line's 2.0: with ten flats, averaging two neighbours throws away the clear straight-line pattern.) The same bookkeeping at scale, tuning k on the 569 tumours, 7 candidates, 4 inner and 3 outer folds, 3 × (7 × 4 + 1) = 87 fits:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_breast_cancer(return_X_y=True)
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
ks = [1, 3, 5, 7, 9, 15, 25]
grid = {"kneighborsclassifier__n_neighbors": ks}
inner = StratifiedKFold(4, shuffle=True, random_state=0)
outer = StratifiedKFold(3, shuffle=True, random_state=1)

# Nested CV written out as a loop, so every step is visible
outer_scores = []
for i, (tr, te) in enumerate(outer.split(X, y), 1):
    gs = GridSearchCV(pipe, grid, cv=inner, n_jobs=1).fit(X[tr], y[tr])   # inner loop sees tr only
    print(f"outer fold {i}: inner CV acc per k =", dict(zip(ks, gs.cv_results_["mean_test_score"].round(3).tolist())))
    k = gs.best_params_["kneighborsclassifier__n_neighbors"]
    score = gs.score(X[te], y[te])              # refit on all of tr with best k, score the unseen fold
    outer_scores.append(score)
    print(f"              picked k={k}, inner best {gs.best_score_:.3f} -&gt; outer acc {score:.3f}")
print("nested CV estimate:", round(np.mean(outer_scores), 3), "±", round(np.std(outer_scores), 3))

# The same thing in one line
print("one-liner:", cross_val_score(GridSearchCV(pipe, grid, cv=inner), X, y, cv=outer).round(3))</div>
  <div class="fx" data-lang="text">outer fold 1: inner CV acc per k = {1: 0.942, 3: 0.953, 5: 0.963, 7: 0.966, 9: 0.958, 15: 0.963, 25: 0.95}
              picked k=7, inner best 0.966 -&gt; outer acc 0.968
outer fold 2: inner CV acc per k = {1: 0.942, 3: 0.955, 5: 0.966, 7: 0.955, 9: 0.96, 15: 0.95, 25: 0.953}
              picked k=5, inner best 0.966 -&gt; outer acc 0.974
outer fold 3: inner CV acc per k = {1: 0.958, 3: 0.963, 5: 0.961, 7: 0.947, 9: 0.95, 15: 0.953, 25: 0.953}
              picked k=3, inner best 0.963 -&gt; outer acc 0.963
nested CV estimate: 0.968 ± 0.004
one-liner: [0.968 0.974 0.963]</div>
  <p>Here the outer folds chose k = 7, 5 and 3, and the honest estimate (0.968) is close to the inner best scores (0.963–0.966), because the candidates are few and similar and the data is large. The optimism becomes large when you search many settings on little data, as the next example shows.</p>
  <h3>The extreme case: pure noise</h3>
  <p>100 rows, 20 random columns, random labels. No model can beat 0.5. Search 144 SVM settings anyway.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.svm import SVC

rng = np.random.default_rng(0)
X, y = rng.normal(size=(100, 20)), rng.integers(0, 2, 100)   # pure noise: true accuracy = 0.5
grid = {"C": np.logspace(-2, 3, 12), "gamma": np.logspace(-4, 1, 12)}   # 144 settings
inner = StratifiedKFold(3, shuffle=True, random_state=0)
outer = StratifiedKFold(5, shuffle=True, random_state=1)

gs = GridSearchCV(SVC(), grid, cv=inner, n_jobs=1).fit(X, y)
print("best_score_ of the grid search (NOT honest):", round(gs.best_score_, 3))
nested = cross_val_score(GridSearchCV(SVC(), grid, cv=inner, n_jobs=1), X, y, cv=outer, n_jobs=1)
print("nested CV per outer fold:", nested.round(2), " mean", round(nested.mean(), 3))</div>
  <div class="fx" data-lang="text">best_score_ of the grid search (NOT honest): 0.58
nested CV per outer fold: [0.55 0.55 0.35 0.45 0.6 ]  mean 0.5</div>
  <p>The grid search's best score is 0.58: one of the 144 settings got lucky on the 3 inner folds, and <code>best_score_</code> reports that luck as skill. Nested CV gives 0.50, the truth, with outer folds scattered from 0.35 to 0.60 (20 rows each). Fits: non-nested 144 × 3 + 1 = 433; nested 5 × 433 = 2,165.</p>
  <h3>What do you deploy?</h3>
  <p>Nested CV is for <em>reporting</em> (and for comparing whole procedures, such as "tuned kNN" vs "line", or "tuned SVM" vs "tuned random forest"). The model you ship comes from running the inner procedure once on all the data: <code>GridSearchCV(...).fit(X, y)</code>, whose <code>best_estimator_</code> is refitted on everything (k = 2 for our flats). The nested score is the honest estimate of how that procedure performs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Nested cross-validation</strong>: an outer k_out-fold loop, each iteration running an inner k_in-fold model-selection procedure on the outer training part only and evaluating the selected, refitted model on the outer test fold. The mean outer score estimates the generalisation error of the full learning procedure, including hyperparameter selection. Cost ≈ k_out × (candidates × k_in + 1) fits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting <code>GridSearchCV.best_score_</code> as the model's accuracy. It is a selection score. Report nested CV, or the score on an untouched test set (a test set is simply nested CV with one outer fold).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CV Variance and Choosing k.</b> We have used k = 2, 3, 4, 5 and n without a principle. How noisy is a CV estimate, is it biased, and which k should you use?</div>

  <h2 id="ms-choosek"><span class="num">13</span>CV Variance and Choosing k</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On the flats, 5-fold CV of the mean predictor said 18.0 and LOO said 16.0; shuffled 5-fold CV of the line moved between 2.32 and 2.71 with the seed. Which number is "right", which way is CV wrong, and how should k be chosen?</p>
  </div>
  <h3>Bias: CV models train on less data</h3>
  <p>Each CV model trains on a fraction (k − 1)/k of the rows: k = 2 → 50%, k = 5 → 80%, k = 10 → 90%, LOO → (n−1)/n. A model trained on fewer rows is usually a bit worse, so CV is <strong>pessimistic</strong> about the final model trained on all n rows. The bias shrinks as k grows. On the flats:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, cross_val_score

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)   # flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
for k in [2, 5, 10]:
    runs = [-cross_val_score(LinearRegression(), X, y, cv=KFold(k, shuffle=True, random_state=s),
                             scoring="neg_mean_absolute_error").mean() for s in range(50)]
    print(f"k={k:2d}: each fit trains on {10 - 10 // k} flats   CV MAE averaged over 50 shuffles {np.mean(runs):.3f}"
          f"   spread across shuffles (SD) {np.std(runs):.3f}")</div>
  <div class="fx" data-lang="text">k= 2: each fit trains on 5 flats   CV MAE averaged over 50 shuffles 2.643   spread across shuffles (SD) 0.504
k= 5: each fit trains on 8 flats   CV MAE averaged over 50 shuffles 2.547   spread across shuffles (SD) 0.161
k=10: each fit trains on 9 flats   CV MAE averaged over 50 shuffles 2.516   spread across shuffles (SD) 0.000</div>
  <p>Lines fitted on 5 flats miss by 2.643 on average, on 8 flats 2.547, on 9 flats 2.516: the less a fold trains on, the more pessimistic the estimate. The spread across shuffles also shrinks with k, to exactly 0 at k = 10 (LOO has only one possible partition). The bias matters most when the learning curve is still steep (small data, like ours), little when more data no longer helps (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a> shows learning curves).</p>
  <h3>Variance: three sources</h3>
  <ul>
    <li><strong>Which rows you have</strong>: different datasets of the same size give different estimates. Dominant for small n, and no choice of k removes it.</li>
    <li><strong>The partition</strong>: which rows share a fold. Repeated CV averages it away (section 10). LOO has none.</li>
    <li><strong>Correlation between fold models</strong>: with large k the training sets overlap almost completely, so the k models are nearly the same model and their errors are correlated; averaging them helps less. For unstable learners (deep trees) this can make LOO noisier than 5- or 10-fold.</li>
  </ul>
  <h3>A simulation where the truth is known</h3>
  <p>Our ten flats cannot tell us the truth, because we have no more flats. So draw 200 small datasets of 40 rows from a large synthetic "world". For each, compute the true accuracy of a model trained on all 40 rows (scored on 20,000 world rows) and the CV estimates with k = 2, 5, 10, 40. Compare estimate with truth for a stable model (logistic regression) and an unstable one (an unpruned decision tree).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import KFold, LeaveOneOut, cross_val_score

# A big "world" we can sample from, so the TRUE accuracy is known
Xall, yall = make_classification(n_samples=40000, n_features=10, n_informative=4,
                                 flip_y=0.1, random_state=0)
X_world, y_world = Xall[20000:], yall[20000:]          # 20,000 rows to measure the truth
n, reps = 40, 200
schemes = {"k=2": KFold(2, shuffle=True, random_state=0), "k=5": KFold(5, shuffle=True, random_state=0),
           "k=10": KFold(10, shuffle=True, random_state=0), "LOO (k=40)": LeaveOneOut()}
for model in [LogisticRegression(max_iter=1000), DecisionTreeClassifier(random_state=0)]:
    rng = np.random.default_rng(0)
    est = {k: [] for k in schemes}; truth = []
    for r in range(reps):
        idx = rng.choice(20000, n, replace=False)          # one small dataset of 40 rows
        X, y = Xall[idx], yall[idx]
        truth.append(model.fit(X, y).score(X_world, y_world))   # truth for a model trained on all 40
        for name, cv in schemes.items():
            est[name].append(cross_val_score(model, X, y, cv=cv).mean())
    truth = np.array(truth)
    print(f"{type(model).__name__}: true accuracy (trained on 40 rows) = {truth.mean():.3f}")
    for name in schemes:
        e = np.array(est[name])
        print(f"   {name:11s} estimate {e.mean():.3f}  bias {e.mean() - truth.mean():+.3f}  "
              f"SD {e.std():.3f}  RMSE {np.sqrt(np.mean((e - truth)**2)):.3f}")</div>
  <div class="fx" data-lang="text">LogisticRegression: true accuracy (trained on 40 rows) = 0.644
   k=2         estimate 0.628  bias -0.015  SD 0.101  RMSE 0.102
   k=5         estimate 0.634  bias -0.010  SD 0.091  RMSE 0.091
   k=10        estimate 0.638  bias -0.006  SD 0.091  RMSE 0.091
   LOO (k=40)  estimate 0.643  bias -0.001  SD 0.087  RMSE 0.087
DecisionTreeClassifier: true accuracy (trained on 40 rows) = 0.654
   k=2         estimate 0.618  bias -0.036  SD 0.093  RMSE 0.112
   k=5         estimate 0.632  bias -0.022  SD 0.093  RMSE 0.102
   k=10        estimate 0.644  bias -0.010  SD 0.099  RMSE 0.106
   LOO (k=40)  estimate 0.646  bias -0.008  SD 0.109  RMSE 0.114</div>
  <p>Reading the table:</p>
  <ul>
    <li><strong>Bias</strong> is negative everywhere (pessimistic) and shrinks with k, exactly as on the flats: for logistic regression −0.015 → −0.010 → −0.006 → −0.001; for the tree −0.036 → −0.022 → −0.010 → −0.008. The tree, which gains more from extra rows, is hurt more by small k.</li>
    <li><strong>Variance</strong>: for the stable logistic regression, LOO has the lowest SD (0.087) and lowest RMSE. For the unstable tree, LOO has the highest SD (0.109), and k = 5 has the lowest RMSE (0.102). The folklore "LOO has high variance" is true for unstable models, not universally.</li>
    <li><strong>Scale</strong>: every SD is about 0.09–0.11, so with 40 rows <em>any</em> CV estimate is uncertain by ±0.2 accuracy (two SDs). k changes the third decimal; more data changes the first.</li>
  </ul>
  <h3>Why the fold SD is not a standard error</h3>
  <p>It is tempting to report the CV mean ± SD/√k as if the k fold scores were independent measurements. They are not: every pair of training sets shares (k−2)/k of the rows, so fold scores are correlated, and there is provably no unbiased estimator of the variance of k-fold CV from a single run (Bengio &amp; Grandvalet, 2004). Report the fold SD as a description of spread ("18.0 ± 11.1 over 5 folds"), and to compare two models look at the fold-by-fold <em>differences</em> on the same folds (the line beat the mean predictor in every one of the five folds), preferably over repeated CV, and treat small gaps with caution.</p>
  <h3>Rules for choosing k</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Choice</th></tr>
    <tr><td>Default</td><td>k = 5 or 10 (stratified for classification)</td></tr>
    <tr><td>Small data (a few hundred rows), close models</td><td>Repeated 5- or 10-fold</td></tr>
    <tr><td>Tiny data (n &lt; 50, our flats), stable model or cheap shortcut</td><td>LOOCV</td></tr>
    <tr><td>Slow model or huge data</td><td>k = 3, or one large validation set</td></tr>
    <tr><td>Hyperparameter search plus an honest report</td><td>Nested CV, or inner CV + untouched test set</td></tr>
    <tr><td>Grouped or time-ordered rows</td><td>Group or time-series CV; k limited by number of groups / time blocks (3 localities → at most 3 folds)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The error of a CV estimate decomposes like any estimator: MSE(CV) = bias² + variance. Larger k lowers the bias (more training data per fold) and raises the cost (k fits); its effect on the variance depends on the model's stability. The "one-standard-error rule" uses the spread too: among settings whose CV score is within one SD (or SE) of the best, pick the simplest.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing k by which value gives the best score. k is a property of the measuring instrument, not of the model; fix it before you look at results.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: scikit-learn APIs.</b> The ideas are complete. Now the toolbox: every scikit-learn function and splitter used above, their arguments, and the defaults that bite.</div>

  <h2 id="ms-api"><span class="num">14</span>scikit-learn APIs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have used train_test_split, KFold, StratifiedKFold, GroupKFold, TimeSeriesSplit, LeaveOneOut, RepeatedKFold, GridSearchCV and cross_val_score in passing. What are all their arguments, which other splitters exist, and which defaults silently change the answer?</p>
  </div>
  <h3>train_test_split</h3>
  <table class="tbl">
    <tr><th>Argument</th><th>Meaning</th><th>Default / note</th></tr>
    <tr><td><code>*arrays</code></td><td>Any number of same-length arrays (X, y, weights, ids); all split with the same rows</td><td>Returns train, test for each in order</td></tr>
    <tr><td><code>test_size</code>, <code>train_size</code></td><td>Float = share, int = number of rows</td><td>test_size 0.25 if both omitted</td></tr>
    <tr><td><code>stratify</code></td><td>Array of class labels (or bins) to keep proportional</td><td>None</td></tr>
    <tr><td><code>shuffle</code></td><td>Shuffle before splitting; <code>False</code> = take the last rows as test (time order)</td><td>True; stratify requires True</td></tr>
    <tr><td><code>random_state</code></td><td>Seed for a reproducible split</td><td>None = different every run</td></tr>
  </table>
  <h3>The splitter classes</h3>
  <table class="tbl">
    <tr><th>Splitter</th><th>What it does</th><th>Key arguments</th></tr>
    <tr><td><code>KFold</code></td><td>k folds in order (or shuffled)</td><td><code>n_splits=5, shuffle=False, random_state</code></td></tr>
    <tr><td><code>StratifiedKFold</code></td><td>k folds with equal class shares</td><td>same; needs y in <code>split</code></td></tr>
    <tr><td><code>GroupKFold</code></td><td>k folds of whole groups, balanced by size</td><td><code>groups=</code> in split; (shuffle option in recent versions)</td></tr>
    <tr><td><code>StratifiedGroupKFold</code></td><td>Whole groups, class shares as equal as possible</td><td>groups + y</td></tr>
    <tr><td><code>LeaveOneGroupOut</code> / <code>LeavePGroupsOut</code></td><td>Each group (or each set of p groups) is a fold</td><td>groups</td></tr>
    <tr><td><code>GroupShuffleSplit</code></td><td>Random train/test by groups, repeatable n times</td><td><code>n_splits, test_size</code></td></tr>
    <tr><td><code>TimeSeriesSplit</code></td><td>Expanding (or sliding) time folds</td><td><code>n_splits, max_train_size, test_size, gap</code></td></tr>
    <tr><td><code>LeaveOneOut</code> / <code>LeavePOut</code></td><td>k = n / all subsets of size p</td><td><code>p</code></td></tr>
    <tr><td><code>ShuffleSplit</code> / <code>StratifiedShuffleSplit</code></td><td>Independent random splits; rows may repeat across validation sets (Monte-Carlo CV)</td><td><code>n_splits, test_size</code></td></tr>
    <tr><td><code>RepeatedKFold</code> / <code>RepeatedStratifiedKFold</code></td><td>k-fold r times with new shuffles</td><td><code>n_splits, n_repeats</code></td></tr>
    <tr><td><code>PredefinedSplit</code></td><td>You give each row's fold number (−1 = always train)</td><td><code>test_fold</code></td></tr>
  </table>
  <p>On the ten flats, with locality as the group and "sold within 30 days" as the label, here is what the less familiar splitters produce:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import (GroupKFold, StratifiedGroupKFold, LeaveOneGroupOut,
                                     ShuffleSplit, PredefinedSplit)
flats = np.array(list("ABCDEFGHIJ"))
X = np.zeros((10, 1))
y = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])                         # sold within 30 days?
groups = np.array(["Had", "Ban", "Kot", "Had", "Ban", "Kot", "Had", "Ban", "Kot", "Ban"])  # locality

def show(name, cv, **kw):
    print(name)
    for tr, va in cv.split(X, y, **kw):
        print("   val flats", "".join(flats[va]), " localities", sorted(set(groups[va].tolist())),
              " fast sellers", int(y[va].sum()))

show("GroupKFold(3)", GroupKFold(3), groups=groups)
show("StratifiedGroupKFold(2)", StratifiedGroupKFold(2), groups=groups)
show("LeaveOneGroupOut", LeaveOneGroupOut(), groups=groups)
show("ShuffleSplit(3 draws, 20% val)", ShuffleSplit(n_splits=3, test_size=0.2, random_state=0))
show("PredefinedSplit (H, J = the latest listings)", PredefinedSplit(test_fold=[-1]*7 + [0, -1, 0]))</div>
  <div class="fx" data-lang="text">GroupKFold(3)
   val flats BEHJ  localities ['Ban']  fast sellers 0
   val flats CFI  localities ['Kot']  fast sellers 1
   val flats ADG  localities ['Had']  fast sellers 3
StratifiedGroupKFold(2)
   val flats BEHJ  localities ['Ban']  fast sellers 0
   val flats ACDFGI  localities ['Had', 'Kot']  fast sellers 4
LeaveOneGroupOut
   val flats BEHJ  localities ['Ban']  fast sellers 0
   val flats ADG  localities ['Had']  fast sellers 3
   val flats CFI  localities ['Kot']  fast sellers 1
ShuffleSplit(3 draws, 20% val)
   val flats CI  localities ['Kot']  fast sellers 0
   val flats DF  localities ['Had', 'Kot']  fast sellers 2
   val flats CD  localities ['Had', 'Kot']  fast sellers 1
PredefinedSplit (H, J = the latest listings)
   val flats HJ  localities ['Ban']  fast sellers 0</div>
  <p>The group splitters never break a locality apart. <code>StratifiedGroupKFold</code> tries to balance fast sellers too, but with whole localities to move it cannot: Baner has no fast seller and Hadapsar has three, so its two folds hold 0 and 4. When groups and classes are entangled like this, no splitter can satisfy both. <code>ShuffleSplit</code> draws each validation set independently, so flat C is validated twice and others never; that is fine for estimating, but it is not k-fold. <code>PredefinedSplit</code> is how you plug a fixed validation set (here "the two latest listings, H and J") into <code>GridSearchCV</code>.</p>
  <h3>cross_val_score, cross_validate, cross_val_predict</h3>
  <p>At scale, on the 569 tumours:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (train_test_split, check_cv, StratifiedKFold, cross_val_score,
                                     cross_validate, cross_val_predict)

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
y = 1 - y                                                   # 1 = malignant
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

# train_test_split: sizes can be fractions or counts; arrays/DataFrames are split together
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
print("split:", X_tr.shape, X_te.shape, " index kept:", X_te.index[:3].tolist())

# cv=5 with a classifier silently means StratifiedKFold(5) WITHOUT shuffling
print("cv=5 becomes:", check_cv(5, y_tr, classifier=True))

# cross_val_score: one metric, one number per fold
print("accuracy per fold:", cross_val_score(model, X_tr, y_tr, cv=5).round(3))

# cross_validate: several metrics, train scores, fit times, fitted models
cv = StratifiedKFold(5, shuffle=True, random_state=0)
res = cross_validate(model, X_tr, y_tr, cv=cv, scoring=["accuracy", "recall", "roc_auc"],
                     return_train_score=True, return_estimator=True, n_jobs=1)
print(sorted(res.keys()))
print(pd.DataFrame({k: res[k] for k in ["train_accuracy", "test_accuracy", "test_recall", "test_roc_auc"]}).round(3))
print("fold-1 model's first 2 coefs:", res["estimator"][0][-1].coef_[0][:2].round(2))

# cross_val_predict: one out-of-fold prediction per row (for plots / stacking, not for a score)
oof = cross_val_predict(model, X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]
print("out-of-fold P(malignant), first 5 rows:", oof[:5].round(3), " shape", oof.shape)</div>
  <div class="fx" data-lang="text">split: (455, 30) (114, 30)  index kept: [477, 558, 537]
cv=5 becomes: StratifiedKFold(n_splits=5, random_state=None, shuffle=False)
accuracy per fold: [0.989 0.989 0.989 0.978 0.989]
['estimator', 'fit_time', 'score_time', 'test_accuracy', 'test_recall', 'test_roc_auc', 'train_accuracy', 'train_recall', 'train_roc_auc']
   train_accuracy  test_accuracy  test_recall  test_roc_auc
0           0.995          0.989        0.971         0.994
1           0.989          0.989        1.000         1.000
2           0.992          0.956        0.882         0.976
3           0.995          0.978        0.941         0.987
4           0.992          1.000        1.000         1.000
fold-1 model's first 2 coefs: [0.47 0.63]
out-of-fold P(malignant), first 5 rows: [0.    0.    0.003 0.    1.   ]  shape (455,)</div>
  <ul>
    <li><code>train_test_split</code> on DataFrames keeps the original row index (477, 558, 537…), useful for tracing rows back.</li>
    <li><code>cv=5</code> with a classifier was turned into <code>StratifiedKFold(n_splits=5, shuffle=False)</code> (for a regressor it would be <code>KFold(5)</code>, also unshuffled). Pass a splitter object when you want shuffling or groups.</li>
    <li><code>cross_val_score</code>: one metric, an array of k scores.</li>
    <li><code>cross_validate</code>: a dict with <code>test_&lt;metric&gt;</code> for each scoring name, <code>train_&lt;metric&gt;</code> if <code>return_train_score=True</code> (compare with test to spot overfitting: train 0.989–0.995 vs test 0.956–1.000 here, a small gap), <code>fit_time</code>, <code>score_time</code>, and the k fitted models if <code>return_estimator=True</code>.</li>
    <li><code>cross_val_predict</code>: one out-of-fold prediction per row, each made by the model that did not train on that row (on our flats, LOO's "slow way" in section 09 used exactly this). Use it for confusion matrices, calibration plots, residual plots and stacking features (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>). Do not compute "the CV score" from it: pooled predictions from different models are not the same as averaging fold scores, and sklearn's docs warn against it.</li>
  </ul>
  <table class="tbl">
    <tr><th>Common argument</th><th>Meaning</th></tr>
    <tr><td><code>cv</code></td><td>int (k folds, stratified for classifiers), a splitter object, or an iterable of (train, test) index arrays</td></tr>
    <tr><td><code>scoring</code></td><td>A name (<code>"accuracy"</code>, <code>"roc_auc"</code>, <code>"neg_mean_absolute_error"</code>, <code>"r2"</code>…), a list or dict of names, or a callable from <code>make_scorer</code>. Losses are negated so higher is always better</td></tr>
    <tr><td><code>groups</code></td><td>Group labels, passed through to group splitters</td></tr>
    <tr><td><code>n_jobs</code></td><td>Folds in parallel; <code>None</code>/1 = one core</td></tr>
    <tr><td><code>error_score</code></td><td>What to record if a fit fails (<code>np.nan</code> by default, or <code>"raise"</code>)</td></tr>
    <tr><td><code>params</code></td><td>Extra fit parameters such as <code>sample_weight</code>, routed to the estimator</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Preprocessing outside the CV loop. <code>StandardScaler().fit_transform(X)</code> followed by <code>cross_val_score(model, X_scaled, y)</code> lets every validation fold influence the scaling. Put the preprocessing in a <code>Pipeline</code> and pass the pipeline to CV, so each fold fits its own scaler on its own training part (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We now have a dozen schemes and numbers. How are they built from each other, and which one answers which question?</div>

  <h2 id="ms-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Hold-out, validation, test, stratified, group, time, k-fold, LOO, repeated, time-series and nested CV: a list of separate recipes, or one idea applied under different constraints?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 340" width="680">
<defs><marker id="ms-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="8" width="200" height="44" rx="7" class="fb sb"/><text x="340" y="27" text-anchor="middle" font-size="11.5" font-weight="700">score on unseen rows</text><text x="340" y="43" text-anchor="middle" class="tm" font-size="10">train MAE 0 vs held-out 17.0</text>
<line x1="300" y1="52" x2="120" y2="84" stroke="currentColor" marker-end="url(#ms-c9)"/><line x1="340" y1="52" x2="340" y2="84" stroke="currentColor" marker-end="url(#ms-c9)"/><line x1="380" y1="52" x2="560" y2="84" stroke="currentColor" marker-end="url(#ms-c9)"/>
<rect x="20" y="86" width="200" height="44" rx="7" class="fb sb"/><text x="120" y="105" text-anchor="middle" font-size="11.5" font-weight="700">which rows? (the split)</text><text x="120" y="121" text-anchor="middle" class="tm" font-size="10">stratify · group · time</text>
<rect x="240" y="86" width="200" height="44" rx="7" class="fb sb"/><text x="340" y="105" text-anchor="middle" font-size="11.5" font-weight="700">how many rows? (ratio)</text><text x="340" y="121" text-anchor="middle" class="tm" font-size="10">2 flats: MAE 1.01 … 4.30</text>
<rect x="460" y="86" width="200" height="44" rx="7" class="fb sb"/><text x="560" y="105" text-anchor="middle" font-size="11.5" font-weight="700">choose vs report</text><text x="560" y="121" text-anchor="middle" class="tm" font-size="10">train · validation · test</text>
<line x1="340" y1="130" x2="340" y2="164" stroke="currentColor" marker-end="url(#ms-c9)"/><line x1="120" y1="130" x2="250" y2="164" stroke="currentColor" marker-end="url(#ms-c9)"/>
<rect x="200" y="166" width="280" height="44" rx="7" class="ft st"/><text x="340" y="185" text-anchor="middle" font-size="11.5" font-weight="700">k-fold CV: every row validates once</text><text x="340" y="201" text-anchor="middle" class="tm" font-size="10">mean 18.0 vs line 2.01</text>
<line x1="230" y1="210" x2="80" y2="244" stroke="currentColor" marker-end="url(#ms-c9)"/><line x1="290" y1="210" x2="230" y2="244" stroke="currentColor" marker-end="url(#ms-c9)"/><line x1="370" y1="210" x2="400" y2="244" stroke="currentColor" marker-end="url(#ms-c9)"/><line x1="450" y1="210" x2="570" y2="244" stroke="currentColor" marker-end="url(#ms-c9)"/>
<rect x="10" y="246" width="140" height="44" rx="7" class="fg sg"/><text x="80" y="265" text-anchor="middle" font-size="11" font-weight="700">stratified / group</text><text x="80" y="281" text-anchor="middle" class="tm" font-size="10">2.86 for a new locality</text>
<rect x="160" y="246" width="140" height="44" rx="7" class="fg sg"/><text x="230" y="265" text-anchor="middle" font-size="11" font-weight="700">LOO (k = n)</text><text x="230" y="281" text-anchor="middle" class="tm" font-size="10">eᵢ/(1−hᵢᵢ): MSE 7.25</text>
<rect x="320" y="246" width="160" height="44" rx="7" class="fg sg"/><text x="400" y="265" text-anchor="middle" font-size="11" font-weight="700">repeated · time-series</text><text x="400" y="281" text-anchor="middle" class="tm" font-size="10">2.57 avg · past → future</text>
<rect x="500" y="246" width="170" height="44" rx="7" class="fr sr"/><text x="585" y="265" text-anchor="middle" font-size="11" font-weight="700">nested CV</text><text x="585" y="281" text-anchor="middle" class="tm" font-size="10">best_score_ 4.83 → 6.53</text>
<line x1="560" y1="130" x2="585" y2="244" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ms-c9)"/>
<text x="340" y="320" text-anchor="middle" class="tm" font-size="10.5">choosing k trades bias (fewer training rows: 2.64 at k = 2) against cost and variance (SD 0.50 → 0 at LOO)</text>
</svg><figcaption>One idea, "score on rows the model did not learn from", answered three ways: which rows (stratified, group, time), how many (ratios), and for which purpose (choose on validation, report on test). k-fold CV reuses every row; its variants inherit the split rules; nested CV applies the choose-vs-report rule to CV itself.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same ten flats</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our flats</th><th>When to use</th></tr>
    <tr><td>Hold-out set</td><td>rows kept out of fit</td><td>is the training score honest?</td><td>lookup 0 → 17.0; line 2.17 → 1.28</td><td>always, before trusting any score</td></tr>
    <tr><td>Train / val / test</td><td>three disjoint hold-outs</td><td>how to choose and still report honestly?</td><td>val chose no-intercept (0.52) → test 3.96</td><td>medium/large data</td></tr>
    <tr><td>Split ratio, SE</td><td>noise ∝ 1/√n</td><td>how big must each part be?</td><td>45 two-flat test sets: 1.01–4.30</td><td>sizing a test set; counts, not %</td></tr>
    <tr><td>Stratified split</td><td>split each class separately</td><td>is the class mix right?</td><td>P(no fast seller) 0.333 → 0</td><td>classification, rare classes</td></tr>
    <tr><td>Group split</td><td>whole groups to one side</td><td>will it work on new entities?</td><td>KFold 1.13 vs GroupKFold 2.86</td><td>repeated entities, new in production</td></tr>
    <tr><td>Time split</td><td>cut at a date</td><td>will it work on the future?</td><td>Jan–Aug → Sep–Oct: 3.11</td><td>any ordered data</td></tr>
    <tr><td>k-fold CV</td><td>k hold-outs covering all rows</td><td>a stable score using every row?</td><td>mean 18.0 ± 11.1; line 2.01 ± 0.43</td><td>default for small/medium data</td></tr>
    <tr><td>Stratified k-fold</td><td>k-fold + stratification</td><td>classes in every fold?</td><td>[4, 0] → [2, 2] fast sellers</td><td>any classification CV</td></tr>
    <tr><td>LOOCV</td><td>k-fold with k = n</td><td>least pessimistic estimate?</td><td>mean 16.0; line MSE 7.25 (train 4.6)</td><td>tiny data, linear shortcut</td></tr>
    <tr><td>Repeated CV</td><td>k-fold over many shuffles</td><td>remove partition luck?</td><td>2.32–2.71 → 2.57</td><td>small data, close comparisons</td></tr>
    <tr><td>Time-series CV</td><td>several time cut-offs</td><td>CV without shuffling time?</td><td>1.15, 3.58, 3.11</td><td>forecasting, ordered rows</td></tr>
    <tr><td>Nested CV</td><td>CV around a tuned CV</td><td>honest score after tuning?</td><td>best_score_ 4.83 vs nested 6.53</td><td>reporting a tuned model</td></tr>
    <tr><td>Choice of k</td><td>bias vs variance vs cost</td><td>which k?</td><td>2.64 (k=2), 2.55 (k=5), 2.52 (k=10)</td><td>5 or 10 by default</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a score is honest only if the rows it is measured on played no part in fitting or choosing, and were picked the way production will meet new data.</strong> Every scheme is that rule plus a constraint: too few rows (CV, LOO, repeats), wrong mix (stratify), shared entities (group), order (time), tuning (nested).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing a Scheme.</b> Side by side, which scheme fits which data, and at what cost?</div>

  <h2 id="ms-compare"><span class="num">16</span>Choosing a Scheme: Comparison</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given a new dataset, which of the schemes should we reach for first, and what does each cost in fits, bias and variance?</p>
  </div>
  <table class="tbl">
    <tr><th>Scheme</th><th>Fits</th><th>Uses data</th><th>Bias</th><th>Variance</th><th>Use when</th></tr>
    <tr><td>Single hold-out</td><td>1</td><td>Validation rows never train</td><td>Pessimistic if val is large</td><td>High for small n</td><td>Large data, slow models</td></tr>
    <tr><td>Train/val/test</td><td>1 per candidate + 1</td><td>Three disjoint parts</td><td>Test unbiased if used once</td><td>Depends on sizes</td><td>Standard for medium/large data</td></tr>
    <tr><td>k-fold (5–10)</td><td>k</td><td>Every row validates once</td><td>Small</td><td>Moderate</td><td>Default for small/medium data</td></tr>
    <tr><td>Stratified k-fold</td><td>k</td><td>Same, class shares equal</td><td>Small</td><td>Lower than k-fold for classification</td><td>Any classification</td></tr>
    <tr><td>Repeated k-fold</td><td>k × r</td><td>Same, averaged over shuffles</td><td>Small</td><td>Lower (partition noise removed)</td><td>Small data, close comparisons</td></tr>
    <tr><td>LOOCV</td><td>n (1 with a shortcut)</td><td>n − 1 rows per fit</td><td>Smallest</td><td>Low for stable, high for unstable models</td><td>Tiny data; linear models with PRESS</td></tr>
    <tr><td>Group k-fold</td><td>k</td><td>Whole groups per fold</td><td>Honest for new groups</td><td>Higher (fewer effective units)</td><td>Repeated measures per entity</td></tr>
    <tr><td>Time-series CV</td><td>k</td><td>Past trains, future validates</td><td>Honest for forecasting</td><td>Higher (early folds small)</td><td>Any time-ordered data</td></tr>
    <tr><td>Nested CV</td><td>k_out × (c × k_in + 1)</td><td>Outer folds never tune</td><td>Honest incl. tuning</td><td>Moderate</td><td>Reporting a tuned model, comparing procedures</td></tr>
  </table>
  <div class="flow"><span>Rows ordered in time?</span><span>yes → time-series split / CV (with gap)</span><span>no → rows grouped by an entity?</span><span>yes → group split / GroupKFold</span><span>no → classification? stratified : plain; k = 5–10</span><span>tuning? → nested CV or untouched test</span></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing the right scheme is half the job; the other half is not breaking it by accident. Which mistakes inflate scores most often?</div>

  <h2 id="ms-traps"><span class="num">17</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every scheme in this note can be quietly broken so that it reports a better score than the model deserves. What are the usual ways, and what did each look like on our flats or at scale?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reporting a training or best_score_ number</span>
    <p>Training error measures memory (the lookup table: 0); <code>best_score_</code> measures luck plus skill on the folds that chose (4.83 vs an honest 6.53). Report a held-out or nested score.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using the test set more than once</span>
    <p>Every look that changes a decision turns it into validation data. Decide with CV, test once, and say so if you broke the rule.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting a tiny validation set</span>
    <p>Two validation flats picked the wrong line (0.52 vs 1.47, then 3.96 on test). With little data, use CV, not one small validation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shuffling time series</span>
    <p>Shuffled CV on sales gave MAE 4.8 vs an honest 13.2. Keep time order; add a gap when targets or features span windows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: same entity on both sides</span>
    <p>Scans of the same patient or flats of the same locality in train and test: 1.00 vs an honest 0.66; 1.13 vs 2.86 for a new locality. Split by group when production meets new groups.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: preprocessing before splitting</span>
    <p>Scaling, imputing, selecting features or target-encoding on the full data leaks validation information into training. Fit them inside each fold via a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: duplicates across splits</span>
    <p>Exact or near-duplicate rows (the same flat listed twice, augmented copies of one image) split across train and test inflate scores the same way groups do. Deduplicate first, or group duplicates together.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting cv=5 to shuffle</span>
    <p>An integer cv never shuffles. If the file is ordered (by label, date or locality), the folds inherit that order: the sorted flats export gave folds with 4 and 0 fast sellers. Pass <code>StratifiedKFold(5, shuffle=True, random_state=0)</code> explicitly.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading too much into small differences</span>
    <p>CV estimates move with the seed alone (2.32–2.71 for the same line on the same flats; ±0.02 accuracy on a few hundred rows). Use repeated CV, compare fold by fold, and prefer the simpler model when scores are within noise.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet, then <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</b> We can now measure honestly: the line's LOOCV MSE is 7.25 against a training MSE of 4.6. But <em>why</em> is the held-out error higher, why did the lookup table collapse, and what should we change when the gap is large or both errors are high?</div>

  <h2 id="ms-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: ten flats, area x (100 sq ft) and price y (₹ lakh): A (5, 38), B (6, 49), C (7, 53), D (8, 56), E (9, 67), F (10, 68), G (11, 73), H (12, 83), I (13, 87), J (14, 96). Localities: Hadapsar A, D, G; Baner B, E, H, J; Kothrud C, F, I. Listed B, D, A, F, C, G, I, E, H, J (Jan → Oct). Sold within 30 days: A, D, F, G.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our flats</th><th>Weakness → next</th></tr>
    <tr><td>Hold-out</td><td>is the training score honest?</td><td>lookup 0 / 17.0; line 2.17 / 1.28</td><td>need to choose too</td></tr>
    <tr><td>Train/val/test</td><td>choose and still report?</td><td>val picked no-intercept (0.52) → test 3.96</td><td>2 val flats too few</td></tr>
    <tr><td>Ratios / SE</td><td>how big?</td><td>45 two-flat tests: 1.01–4.30</td><td>mix can be wrong</td></tr>
    <tr><td>Stratified</td><td>right class mix?</td><td>P(0 fast) 0.333 → always 1</td><td>rows not independent</td></tr>
    <tr><td>Group</td><td>new entities?</td><td>1.13 vs 2.86 (new locality)</td><td>order matters too</td></tr>
    <tr><td>Time</td><td>the future?</td><td>Jan–Aug → Sep–Oct: 3.11</td><td>one cut is luck, wastes rows</td></tr>
    <tr><td>k-fold</td><td>every row for both jobs?</td><td>mean 18.0 ± 11.1; line 2.01</td><td>sorted classes</td></tr>
    <tr><td>Stratified k-fold</td><td>classes in each fold?</td><td>[4,0] → [2,2]</td><td>why not k = n?</td></tr>
    <tr><td>LOO</td><td>k = n?</td><td>mean 16.0; line MSE 7.25 (one fit)</td><td>partition luck in k-fold</td></tr>
    <tr><td>Repeated</td><td>remove partition luck?</td><td>2.32–2.71 → 2.57</td><td>can't shuffle time</td></tr>
    <tr><td>Time-series CV</td><td>CV for ordered rows?</td><td>3 cut-offs: 1.15, 3.58, 3.11</td><td>tuning on CV is optimistic</td></tr>
    <tr><td>Nested</td><td>honest after tuning?</td><td>4.83 → 6.53</td><td>which k? how noisy?</td></tr>
    <tr><td>Choosing k</td><td>bias vs variance</td><td>2.64 / 2.55 / 2.52 for k = 2 / 5 / 10</td><td>which API?</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Training error / generalisation error</td><td>Average loss on the rows used to fit / expected loss on new rows from the same source. Training error is optimistic; a held-out error is unbiased only if those rows played no part in any decision.</td></tr>
    <tr><td>Train / validation / test set</td><td>Fit parameters / compare models and choose hyperparameters (looked at many times) / report the final score once.</td></tr>
    <tr><td>Selection bias</td><td>The best of many noisy scores is too high (best of 50 coin flips: 0.585 on validation, 0.487 on test).</td></tr>
    <tr><td>Stratified split</td><td>Each class (or target bin) split separately so every part keeps the same mix.</td></tr>
    <tr><td>Group split</td><td>All rows of an entity on one side; estimates performance on new entities.</td></tr>
    <tr><td>Temporal split, gap</td><td>Train before a cut-off, test after it; a gap removes rows whose targets or features overlap the cut.</td></tr>
    <tr><td>k-fold CV</td><td>k folds, each validated once; the mean estimates the error of the training procedure on (k−1)/k of the data.</td></tr>
    <tr><td>LOOCV, leverage</td><td>k = n. Leverage hᵢᵢ = how strongly row i pulls the fitted line towards itself.</td></tr>
    <tr><td>Repeated CV</td><td>k-fold over several shuffles, averaged: removes partition noise, not data noise.</td></tr>
    <tr><td>Time-series CV</td><td>Several origins; train on the past (expanding or sliding window, optional gap), validate on the next block.</td></tr>
    <tr><td>Nested CV</td><td>Outer CV scores the whole inner tuning procedure; deploy the inner procedure refitted on all data.</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and our numbers</th></tr>
    <tr><td>MAE</td><td>(1/n) Σ |yᵢ − ŷᵢ|</td><td>lookup on C, I: (13.25 + 20.75)/2 = 17.0</td></tr>
    <tr><td>SE of accuracy</td><td>√(p(1 − p)/n)</td><td>p true accuracy, n test rows: 0.9, 100 → 0.030</td></tr>
    <tr><td>Stratification chance</td><td>P(0 positives) = C(N−P, t) / C(N, t)</td><td>N rows, P positives, t test rows: C(6,2)/C(10,2) = 15/45</td></tr>
    <tr><td>k-fold CV</td><td>CV(k) = (1/k) Σⱼ sⱼ</td><td>sⱼ score on fold j: (29.375 + 15.625 + 0.625 + 13.75 + 30.625)/5 = 18.0</td></tr>
    <tr><td>Mean-predictor fold</td><td>training mean = (total − held-out) / (n − |fold|)</td><td>(670 − 87)/8 = 72.875</td></tr>
    <tr><td>LOO, mean predictor</td><td>miss = (n/(n−1)) (yᵢ − ȳ)</td><td>(10/9) × 144/10 = 16.0</td></tr>
    <tr><td>Leverage (one feature)</td><td>hᵢᵢ = 1/n + (xᵢ − x̄)² / Σ(x − x̄)²</td><td>A: 0.1 + 20.25/82.5 = 0.3455</td></tr>
    <tr><td>LOO residual (OLS)</td><td>eᵢ / (1 − hᵢᵢ)</td><td>A: −2 / 0.6545 = −3.06; LOOCV MSE 7.25</td></tr>
    <tr><td>TimeSeriesSplit block</td><td>n // (n_splits + 1)</td><td>10 // 4 = 2 rows per validation block</td></tr>
    <tr><td>Nested CV cost</td><td>k_out × (candidates × k_in + 1)</td><td>5 × (4 × 4 + 1) = 85 fits</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Single hold-out / train-val-test</b><p>Large data or slow models; the test set is touched once. Avoid on tiny data: 2 flats cannot score a model.</p><small>70/15/15 medium, 98/1/1 huge</small></div>
    <div><b>k-fold (stratified for classes)</b><p>The default for small and medium data, k = 5 or 10, shuffled with a fixed seed. Avoid for ordered or grouped rows.</p><small>cv=5 does not shuffle</small></div>
    <div><b>LOO / repeated</b><p>LOO for tiny data and linear models (one-fit shortcut); repeated k-fold for small data and close comparisons. Avoid LOO for unstable models and per-fold metrics like AUC.</p><small>Repeats remove partition luck only</small></div>
    <div><b>Group / time / nested</b><p>Group CV when production meets new entities; time-series CV for anything ordered; nested CV whenever a tuned score is reported.</p><small>Match the split to production</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Reporting training error or <code>best_score_</code>; peeking at the test set repeatedly; trusting a tiny validation set; shuffling time series; the same entity on both sides; preprocessing before the split; duplicates across splits; assuming <code>cv=5</code> shuffles; calling a difference smaller than the seed-to-seed wobble a win; treating fold SD as a standard error.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Mean predictor, fold = flats G and H (73, 83), total 670: training mean and fold MAE?</td><td>(670 − 156)/8 = 64.25; misses 8.75 and 18.75 → 13.75</td></tr>
    <tr><td>10 rows, 4 positive, 2-row test set: P(no positive) without stratifying?</td><td>C(6,2)/C(10,2) = 15/45 = 0.333</td></tr>
    <tr><td>Flat J (x = 14) has residual 2: its leave-one-out residual?</td><td>h = 0.1 + 20.25/82.5 = 0.3455 → 2 / 0.6545 = 3.06</td></tr>
    <tr><td>The portal will launch in a new city area. Which CV?</td><td>GroupKFold by locality (1.13 vs honest 2.86 on our flats)</td></tr>
    <tr><td>GridSearchCV best_score_ 4.83, nested 6.53. Which do you report, and which model do you deploy?</td><td>Report 6.53; deploy GridSearchCV refitted on all data (its best_estimator_)</td></tr>
  </table>

  <h2 id="ms-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A lookup table scores MAE 0 on its 8 training flats. An unlimited decision tree scores 1.000 on its training rows. What can you conclude?</summary><div class="qa-body">Nothing about their quality. The lookup table missed the held-out flats by 17.0 lakh (the line: 1.28). The tree scored 1.000 both on a real task (test 0.730) and on random labels (test 0.497). Training scores measure how well a model stored the rows; only held-out rows measure generalisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we need a validation set and a separate test set?</summary><div class="qa-body">Validation is used many times to choose models and hyperparameters, so the winner's validation score is inflated by selection (best of 50 coin flips: 0.585 on validation, 0.487 on test; on the flats the chosen line scored 0.52 on validation and 3.96 on test). The test set, used once after all choices, gives an unbiased score of the final model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model is 90% accurate on a 100-row test set. Roughly how precise is that?</summary><div class="qa-body">SE = √(0.9 × 0.1 / 100) = 0.03, so a 95% range of about 0.84–0.96. A 2-point difference between two models is within noise; you would need about 1,000+ test rows to resolve it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>10 flats, 4 fast sellers, 2-flat test set. Probability a plain random split has no fast seller in test? With stratification?</summary><div class="qa-body">C(6,2)/C(10,2) = 15/45 = 0.333. With stratification, exactly 1 fast seller every time (20% of 4 rounds to 1), so the probability is 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute 5-fold CV MAE by hand for the flat prices 38, 49, 53, 56, 67, 68, 73, 83, 87, 96 with a mean predictor, folds in order.</summary><div class="qa-body">Training means (670 − pair)/8 = 72.875, 70.125, 66.875, 64.25, 60.875. Fold MAEs 29.375, 15.625, 0.625, 13.75, 30.625. CV = 90/5 = 18.0; population SD = √(614.375/5) = 11.08.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a k-fold CV score estimate: the error of the final model?</summary><div class="qa-body">Strictly, the expected error of the procedure "train this model type on (k−1)/k × n rows from this source". The final model trains on all n rows, so its error is usually slightly lower: CV is mildly pessimistic, less so for larger k (flats: 2.64 at k = 2, 2.52 at k = 10).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the LOOCV shortcut for linear regression and compute the leverage of flat A (x = 5) among x = 5 … 14.</summary><div class="qa-body">LOO residual = eᵢ / (1 − hᵢᵢ) from one fit. hᵢᵢ = 1/n + (xᵢ − x̄)²/Σ(x − x̄)² = 1/10 + 4.5²/82.5 = 0.1 + 0.2455 = 0.3455. A's residual −2 becomes −3.06; over all ten, LOOCV MSE 7.25.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is LOOCV always the best because it has the least bias?</summary><div class="qa-body">No. It costs n fits, cannot compute per-fold AUC/recall, and its fold models are nearly identical, so for unstable models its variance is high. In the simulation the unpruned tree had SD 0.109 with LOO vs 0.093 with 5-fold, and the best RMSE at k = 5. For stable logistic regression, LOO was best.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use GroupKFold, and what happens if you do not?</summary><div class="qa-body">When several rows share an entity (patient, user, locality) that will be new in production. Otherwise the model recognises the entity: random-row CV said 1.13 lakh on the flats vs 2.86 for an unseen locality, and 1.00 vs 0.66 in the scan simulation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>TimeSeriesSplit(n_splits=3) on the ten flats in listing order: list the validation blocks. What does gap=1 change?</summary><div class="qa-body">Blocks of 10//4 = 2: train rows 0–3 / val 4–5 (C, G); train 0–5 / val 6–7 (I, E); train 0–7 / val 8–9 (H, J). gap=1 removes the last training row before each block: train 0–2, 0–4, 0–6.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain nested CV, its cost, and why best_score_ is optimistic.</summary><div class="qa-body">Outer folds hold out data; on each outer training part the full grid search with inner CV picks a setting, which is refitted and scored on the outer fold. Cost = k_out × (candidates × k_in + 1) (flats: 5 × 17 = 85). best_score_ is the maximum of many noisy CV scores on the same folds, so it includes the luck of the winner: 4.83 vs nested 6.53 on the flats, 0.58 vs 0.50 on pure noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After nested CV, which model do you deploy?</summary><div class="qa-body">The one from running the inner procedure on all data: GridSearchCV(...).fit(X, y).best_estimator_. Nested CV gives the honest score of that procedure; the outer folds may each have chosen different hyperparameters (k = 2, 3, 1, 1, 2 on the flats; 7, 5, 3 on the tumours).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does cv=5 mean in cross_val_score for a classifier, and why can it surprise you?</summary><div class="qa-body">StratifiedKFold(5) without shuffling (KFold(5) for regressors). If the rows are ordered by date or locality, folds follow that order. Pass a shuffled splitter object explicitly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the validation set need the test set, and why does CV need nesting? (the same idea twice)</summary><div class="qa-body">Any set used to choose becomes optimistic for the chosen model, because the winner is the best skill plus the best luck on that set. The test set is the fresh paper for hold-out validation; the outer loop of nested CV is the fresh paper for CV-based tuning. On the flats: validation 0.52 → test 3.96; best_score_ 4.83 → nested 6.53.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip stratification, grouping or time order? Give one number for each.</summary><div class="qa-body">Skip stratification: a third of 2-flat test sets have no fast seller, so recall is undefined. Skip grouping: CV says 1.13 for flats in localities it has seen while a new locality costs 2.86. Skip time order: shuffled CV on trending sales says 4.8 instead of 13.2. In each case the score answers a different, easier question than production asks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should a scaler be inside the pipeline passed to cross_val_score? (connection: Pipelines &amp; Leakage)</summary><div class="qa-body">Fitting it on all rows first lets validation folds influence the means and SDs used in training, a leak. Inside a pipeline each fold fits its own scaler on its training part only. <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> shows cases where the leak inflates scores a lot (target encoding, feature selection).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Train score 0.99, CV score 0.75. Train 0.76, CV 0.75. What does each pattern mean? (connection: Bias, Variance)</summary><div class="qa-body">A big train-CV gap means high variance (overfitting), like the lookup table (train MAE 0, held-out 17.0): regularise, simplify, or get more data. Both poor and close means high bias (underfitting): use a more flexible model or better features. <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a> turns these into learning and validation curves, both computed with the CV tools of this note.</div></details>
</main>
`
});
