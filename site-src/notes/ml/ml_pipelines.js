// notes/ml/ml_pipelines.js — Pipelines & Data Leakage
Object.assign(TOPIC_CONTENT, {
  "ml_pipelines": `<main>
  <h1>Pipelines &amp; Data Leakage</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Pipelines &amp; Data Leakage</span></div>
  <p class="lead">Data leakage is when information that will not exist at prediction time sneaks into training, so validation scores look great and the model fails in production. This note shows the five classic leaks with real, measured numbers (preprocessing before the split, target encoding before the split, time leakage, duplicate rows, features from the future), then builds the cure step by step: what fit, transform and fit_transform really do, scikit-learn's Pipeline and ColumnTransformer, pipelines inside cross-validation and grid search (with the step__param naming), custom transformers, saving a pipeline, and train/serve skew, the production cousin of leakage. The running example is the Foundations group's <strong>ten flats in Pune</strong> (A–J, area 5 … 14 hundred sq ft, price 38 … 96 ₹ lakh, three localities, listing months, flat G's blank age): every leak is first shown on those ten rows, small enough to check by hand, and then measured at scale.</p>

  <h2 id="pl-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 250" width="660">
<defs><marker id="pip-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="18" text-anchor="middle" class="tm" font-size="11">Machine Learning › Foundations</text>
<rect x="20" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="90" y="61" text-anchor="middle" font-size="12.5">What is ML</text>
<rect x="180" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="250" y="61" text-anchor="middle" font-size="12.5">Splits &amp; CV</text>
<rect x="340" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="410" y="61" text-anchor="middle" font-size="12.5">Bias &amp; Variance</text>
<rect x="500" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="570" y="61" text-anchor="middle" font-size="12.5">Loss &amp; Grad. Descent</text>
<rect x="500" y="114" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="570" y="141" text-anchor="middle" font-size="12.5">Regularization</text>
<rect x="340" y="114" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="410" y="141" text-anchor="middle" font-size="12.5">Feature Engineering</text>
<rect x="180" y="114" width="140" height="44" rx="8" class="fb sb" stroke-width="3"/>
<text x="250" y="134" text-anchor="middle" font-size="12.5" font-weight="700">Pipelines &amp; Leakage</text>
<text x="250" y="150" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<line x1="160" y1="56" x2="178" y2="56" stroke="currentColor" marker-end="url(#pip-fa)"/>
<line x1="320" y1="56" x2="338" y2="56" stroke="currentColor" marker-end="url(#pip-fa)"/>
<line x1="480" y1="56" x2="498" y2="56" stroke="currentColor" marker-end="url(#pip-fa)"/>
<line x1="570" y1="78" x2="570" y2="112" stroke="currentColor" marker-end="url(#pip-fa)"/>
<line x1="500" y1="136" x2="482" y2="136" stroke="currentColor" marker-end="url(#pip-fa)"/>
<line x1="340" y1="136" x2="322" y2="136" stroke="currentColor" marker-end="url(#pip-fa)"/>
<text x="330" y="186" text-anchor="middle" class="tm" font-size="11">then every model group uses all seven ideas</text>
<rect x="40" y="196" width="130" height="34" rx="7" class="ft st"/><text x="105" y="217" text-anchor="middle" font-size="12">Regression</text>
<rect x="190" y="196" width="130" height="34" rx="7" class="ft st"/><text x="255" y="217" text-anchor="middle" font-size="12">Classification</text>
<rect x="340" y="196" width="130" height="34" rx="7" class="ft st"/><text x="405" y="217" text-anchor="middle" font-size="12">Trees</text>
<rect x="490" y="196" width="130" height="34" rx="7" class="ft st"/><text x="555" y="217" text-anchor="middle" font-size="12">Evaluation</text>
</svg><figcaption>The Foundations group. Pipelines &amp; Leakage closes the group: it packages the feature steps and the regularized model into one object that can be cross-validated honestly and shipped.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_features">Feature Engineering</a> and <a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a></b><span>Feature engineering gave you a dozen steps that learn from data: scalers learn means, imputers learn medians, encoders learn categories and target averages. Cross-validation gave you an honest score, but only if the held-out fold is truly unseen. Doing the steps once on the whole table and then cross-validating breaks that promise, and nothing warns you: on the flats, a locality mean computed on all ten rows reported LOOCV MSE 1.68 where the honest figure is 3.69.</span></li>
    <li><b>This note adds: leakage, measured, and the object that prevents it</b><span>Five leaks with numbers (noise scoring 0.85, a test AUC of 0.90 that is really 0.71, a forecast error that doubles under an honest split, 99% accuracy on unrelated labels). On the ten flats the same five leaks appear in miniature: a noise column that "beats" the mean, a sale-price column that turns LOOCV 7.25 into 0.80, relisted flats scoring a perfect 0.00. Then the Pipeline: one object that learns every step from training rows only, inside every CV fold and grid-search candidate, and is saved and served as a unit.</span></li>
    <li><b>Leads to: every model note, and production</b><span>From here on, every model in <a class="xref" data-note="ml_regression">Regression</a>, <a class="xref" data-note="ml_classification">Classification</a> and the <a class="xref" data-note="ml_trees">Tree family</a> is trained and tuned inside a pipeline; <a class="xref" data-note="ml_regression">Regression</a> starts by fitting the flats' line, 6 × area + 10, as exactly such a pipeline. Deployment, monitoring and train/serve skew continue in <a class="xref" data-note="mlops_deploy">Model Deployment</a> and <a class="xref" data-note="sd_monitoring">Monitoring</a>; time-series leakage in depth in <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>.</span></li>
  </ol>
  <p>You should know what a train/validation/test split and k-fold CV are (<a class="xref" data-note="ml_splits">Splits &amp; CV</a>), and the common transformers (scalers, imputers, one-hot and target encoding) from <a class="xref" data-note="ml_features">Feature Engineering</a>. Each is re-explained in a line where it matters.</p>

  <h2 id="pl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Every step is applied to the ten flats.</p>
  <ol class="story">
    <li><b>Leakage</b><span>Q: when is a validation score a lie? → When training or evaluation used information that will not exist at prediction time. A "final sale price" column takes the flats' LOOCV MSE from 7.25 to 0.80, and none of it is real. But which everyday steps leak?</span></li>
    <li><b>Preprocessing before the split</b><span>Q: can a scaler or selector leak? → A scaler fit with the bungalow included makes it look ordinary (z 2.79 instead of 18.11); a column picked from 300 noise columns using all ten prices "beats" the mean (162.7 vs 372.3) and honestly scores 788.9. And encoders that use the label?</span></li>
    <li><b>Target encoding before the split</b><span>Q: what if the step reads the target itself? → Each flat's own price sits inside its locality mean (J: 73.75 with itself, 66.33 without): LOOCV 1.68 that is honestly 3.69. And if the rows have an order in time?</span></li>
    <li><b>Time leakage</b><span>Q: can the future train the past? → A locality mean over the whole year scores 2.24 in forward-chaining, the as-of mean 29.04, worse than area alone (6.91). And if the same flat appears twice?</span></li>
    <li><b>Duplicates and groups</b><span>Q: what if one entity sits on both sides of the split? → Flats scraped twice: 4-NN scores 0.00 leaving out a listing, 33.79 leaving out a flat. And columns that are written after the outcome?</span></li>
    <li><b>Features from the future</b><span>Q: is every column known at prediction time? → Final sale price is not: weight 0.861 on it, LOOCV 0.80. How do we catch leaks we did not think of?</span></li>
    <li><b>Detecting leakage</b><span>Q: can we test for leaks? → Shuffle the prices: selection-before-CV still beats the mean in 20 of 20 shuffles. But the check is weak on ten rows (naive encoding: 7 of 20, like honest). Prevention must be structural. Where does it start?</span></li>
    <li><b>fit vs transform</b><span>Q: what exactly learns? → fit learns mean_ 8.5, scale_ 2.291 on A–H; transform maps I, J to 1.964, 2.400; fit_transform on I, J gives the bug [−1, 1]. Who enforces the rule in every fold?</span></li>
    <li><b>Pipeline</b><span>Q: one object that learns only from training rows? → The spy shows each fold fit on eight flats and only transform the other two; refit on all ten predicts K–N as 48.4, 62.2, 71.8, 91.6. But columns need different steps…</span></li>
    <li><b>ColumnTransformer</b><span>Q: numbers, text and blanks in one table? → Impute + scale area and age (medians 950, 7), one-hot locality, drop the listing id: (10, 5); Wakad becomes zeros. How do we tune those choices?</span></li>
    <li><b>CV and grid search</b><span>Q: tune preprocessing and model together, honestly? → step__param keys: 16 candidates × 10 LOO folds = 160 fits + 1; best 1.41, nested 1.63. What if sklearn lacks a step?</span></li>
    <li><b>Custom transformers</b><span>Q: how do we add our own learnt step? → A clipper that learns hi_ = 13.55 from training flats predicts the bungalow at 92.4 instead of 310. How do we ship the whole thing?</span></li>
    <li><b>Saving</b><span>Q: how do we serve exactly what was validated? → joblib the fitted pipeline + metadata (2,923 bytes); reloaded predictions identical. But serving can still feed it differently…</span></li>
    <li><b>Train/serve skew</b><span>Q: what if production computes features differently? → Area in sq ft predicts ₹5,208 lakh, "baner" loses the Baner premium; guards (median ratio 94.7, unknown category) catch both. Everything learnt from data, in one object, scored honestly → <a class="xref" data-note="ml_regression">Regression</a>.</span></li>
  </ol>

  <h2 id="pl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Pipelines &amp; Data Leakage</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Leakage</div>
        <ul>
          <li><b>Definition</b> — info unavailable at prediction time used in training/evaluation</li>
          <li><b>Contamination</b> — a step learnt from validation/test rows</li>
          <li><b>Target leakage</b> — a feature that encodes the answer</li>
          <li>The one question: "would I know this value, at this moment, in production?"</li>
          <li>💡 A leaked exam paper: 95% marks, zero knowledge</li>
          <li>Flats: "final sale price" → LOOCV 0.80 vs honest 7.25</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Five leaks, measured</div>
        <ul>
          <li><b>Preprocessing before split</b>: scaler +0.0004 (tiny) · feature selection on noise 0.85 vs 0.48</li>
          <li><b>Target encoding before split</b>: test AUC 0.902 vs honest 0.711</li>
          <li><b>Time</b>: random KFold MAE 6.2 vs time split 13.4; centred rolling mean peeks ahead</li>
          <li><b>Duplicates / groups</b>: unrelated labels 0.991 (random) vs 0.482 (GroupKFold)</li>
          <li><b>Future feature</b>: refund_issued → 0.984; honest 0.832 (&lt; always-no 0.861)</li>
          <li>Flats: noise column 162.7 vs 788.9 · locality mean 1.68 vs 3.69 · year mean 2.24 vs as-of 29.04 · relisted 0.00 vs 33.79</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · fit / transform</div>
        <ul>
          <li><b>fit</b> learns (mean_, statistics_, categories_, coef_) · <b>transform</b> applies · <b>fit_transform</b> = both</li>
          <li>Train [2,4,6] → mean 4, scale 1.633; test 8 → 2.449</li>
          <li>⚠ fit_transform on test re-learns: [8, 10] → [−1, 1]</li>
          <li>Rule: fit on training rows only, transform everything else</li>
          <li>Flats A–H → mean 8.5, scale 2.291; I, J → 1.964, 2.400</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Pipeline &amp; ColumnTransformer</div>
        <ul>
          <li><b>Pipeline</b>([("name", step), …]): fit = fit_transform each step then fit the last; predict = transform each then predict</li>
          <li>make_pipeline auto-names (lowercase class) · pipe["scale"], pipe[-1], pipe[:-1]</li>
          <li><b>ColumnTransformer</b>: (name, transformer, columns); remainder="drop"/"passthrough"; make_column_selector</li>
          <li>get_feature_names_out → num__income, cat__city_Pune …</li>
          <li>Flats: area + age (medians 950, 7) + locality one-hot → (10, 5)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · CV, tuning, custom</div>
        <ul>
          <li>cross_val_score(pipe) refits every step per fold (Spy: fit on 20, transform 10)</li>
          <li>Grid keys <b>step__param</b>, nested pre__num__impute__strategy; swap steps; "passthrough"</li>
          <li>14 candidates × 5 folds = 70 fits + 1 refit · nested CV for an honest tuned score</li>
          <li><b>Custom</b>: FunctionTransformer (stateless) or BaseEstimator + TransformerMixin; __init__ stores params; fit sets attr_ and returns self</li>
          <li>Flats grid: 16 candidates × 10 = 160 fits + 1; best 1.41, nested 1.63 · clipper hi_ 13.55</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Shipping</div>
        <ul>
          <li><b>joblib.dump</b> the whole fitted pipeline + version metadata; ⚠ never load untrusted pickles</li>
          <li>Pin the sklearn version; skops / ONNX for safer or cross-language serving</li>
          <li><b>Train/serve skew</b>: different code or units at serving (income in thousands → accuracy 0.758 → 0.464)</li>
          <li>Fix: serve the same pipeline object, schema checks, log features, monitor drift</li>
          <li>Flats: area sent in sq ft → ₹5,208 lakh; "baner" → Baner premium lost</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pl-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pl-leak"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Leakage Is</span><span class="rm-sub">Definition and the two families</span></div></div>
      <div class="rm-item rm-done" data-target="pl-pre"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Preprocessing Before the Split</span><span class="rm-sub">Scaling and selection, measured</span></div></div>
      <div class="rm-item rm-done" data-target="pl-te"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Target Encoding Before the Split</span><span class="rm-sub">0.902 that is really 0.711</span></div></div>
      <div class="rm-item rm-done" data-target="pl-time"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Time Leakage</span><span class="rm-sub">Random splits and centred windows</span></div></div>
      <div class="rm-item rm-done" data-target="pl-dup"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Duplicates &amp; Groups</span><span class="rm-sub">Memorising the patient</span></div></div>
      <div class="rm-item rm-done" data-target="pl-future"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Features From the Future</span><span class="rm-sub">Target leakage</span></div></div>
      <div class="rm-item rm-done" data-target="pl-detect"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Detecting Leakage</span><span class="rm-sub">Warning signs and checks</span></div></div>
      <div class="rm-item rm-done" data-target="pl-fitapi"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">fit vs transform</span><span class="rm-sub">And fit_transform</span></div></div>
      <div class="rm-item rm-done" data-target="pl-pipe"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Pipeline</span><span class="rm-sub">Step by step, traced</span></div></div>
      <div class="rm-item rm-done" data-target="pl-ct"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ColumnTransformer</span><span class="rm-sub">Different steps per column</span></div></div>
      <div class="rm-item rm-done" data-target="pl-cv"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">CV &amp; Grid Search</span><span class="rm-sub">step__param, nested CV</span></div></div>
      <div class="rm-item rm-done" data-target="pl-custom"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Custom Transformers</span><span class="rm-sub">Stateless and stateful</span></div></div>
      <div class="rm-item rm-done" data-target="pl-save"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Saving Pipelines</span><span class="rm-sub">joblib, versions, safety</span></div></div>
      <div class="rm-item rm-done" data-target="pl-skew"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Train/Serve Skew</span><span class="rm-sub">Leakage's production cousin</span></div></div>
      <div class="rm-item rm-done" data-target="pl-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pl-compare"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Comparisons &amp; Checklist</span><span class="rm-sub">Leak types and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="pl-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="pl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pl-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pl-leak"><span class="num">01</span>What Leakage Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every Foundations note scored the flats' line honestly: area alone gives leave-one-out MSE 7.25. Suppose the portal's table also had a column "final sale price" and the score dropped to 0.80. Better model, or broken measurement? And how would we tell before launch, rather than after?</p>
  </div>
  <h3>The need</h3>
  <p>A model's validation score is a forecast of how it will do on tomorrow's data. That forecast is only honest if the validation rows played exactly the role tomorrow's rows will play: unseen during training, and described only by information available at prediction time. Leakage is any way that promise gets broken. Nothing crashes; the numbers just look better than they should, and the gap shows up after launch.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school's exam paper leaks the day before. Everyone scores 95%. The marks are real numbers, correctly added, and they say nothing about what anyone knows. The leak is invisible on the mark sheet; it only shows up when the same students sit a fresh paper.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Data leakage</strong>: using, during training or model selection, information that would not be available when the model makes real predictions. Two families: <strong>train–test contamination</strong> (a step learns from rows that should be unseen, e.g. a scaler, encoder or feature selector fit before the split) and <strong>target leakage</strong> (a feature that is a consequence of, or computed from, the target, e.g. "refund issued" for churn).</p>
  </div>
  <p>The single most useful question, asked of every column and every preprocessing step: <strong>"At the moment I make this prediction in production, would I know this value, computed this way?"</strong> If the answer is no, or "only partly", you have a leak.</p>
  <table class="tbl">
    <tr><th>Leak</th><th>What goes wrong</th><th>Typical example</th><th>Fix</th></tr>
    <tr><td>Preprocessing before split</td><td>a learnt step sees validation/test rows</td><td>scaler, imputer, selector, PCA, SMOTE on all rows</td><td>Pipeline inside CV</td></tr>
    <tr><td>Target encoding before split</td><td>a row's own label sits inside its feature</td><td>category churn rate on all rows</td><td>out-of-fold TargetEncoder in a pipeline</td></tr>
    <tr><td>Time</td><td>the future trains the past</td><td>random split of a time series; centred rolling mean</td><td>time-based splits; past-only windows</td></tr>
    <tr><td>Duplicates / groups</td><td>the same entity on both sides of the split</td><td>several visits per patient; oversampled copies</td><td>dedupe; GroupKFold; resample after split</td></tr>
    <tr><td>Future feature</td><td>a column recorded after the outcome</td><td>refund_issued, account_closed_date, final_diagnosis</td><td>as-of feature snapshots</td></tr>
    <tr><td>Test-set reuse</td><td>many decisions tuned on the test set</td><td>"try 50 models, report the best test score"</td><td>untouched test set; nested CV</td></tr>
  </table>

  <h3>The one question, on the portal's columns</h3>
  <p>A model that prices a flat <em>at the moment it is listed</em>. Ask of every column: would I know this value, computed this way, at listing time?</p>
  <table class="tbl">
    <tr><th>Column</th><th>Known at listing?</th><th>Verdict</th></tr>
    <tr><td>area, locality, bedrooms, age, listing date, description</td><td>yes (G's age is blank, and that is also what production will see)</td><td>safe</td></tr>
    <tr><td>locality mean price over the whole year</td><td>only partly: it includes flats listed later, and this flat's own price</td><td>leak (time + target), Leaks 2 and 3</td></tr>
    <tr><td>days on market, sold within 30 days</td><td>no: filled when the flat sells</td><td>leak (future)</td></tr>
    <tr><td>final sale price</td><td>no: negotiated at the deal</td><td>leak (future, nearly the target itself)</td></tr>
    <tr><td>listing id</td><td>yes, but meaningless</td><td>drop (a model can memorise it)</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Leak 1, preprocessing before the split.</b> The definition says what leaks; it does not say how often ordinary, harmless-looking code does it. Does a scaler fit on all rows really matter, and what about a feature selector?</div>


  <h2 id="pl-pre"><span class="num">02</span>Leak 1: Preprocessing Before the Split</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A scaler or a feature selector does not look at the test score, so how could fitting it on all rows change the score? On the flats, what does the bungalow do to a scaler that has seen it, and what does a selector do with 300 random columns and ten prices?</p>
  </div>
  <h3>The mechanism, by hand</h3>
  <p>Training rows x = 2, 4, 6; one test row x = 30, an unusual value. Done properly, the scaler learns from training rows: mean 4, std √((4 + 0 + 4)/3) = 1.633. The test row becomes (30 − 4)/1.633 = 15.92: the model is told, correctly, that this row is wildly unlike anything it trained on. Done leakily, the scaler learns from all four rows: mean = 42/4 = 10.5, std = 11.347. Now the test row becomes (30 − 10.5)/11.347 = 1.72, a perfectly ordinary-looking value, and the training rows themselves moved (−0.75, −0.57, −0.40). The test row reshaped the training data before training began.</p>
  <div class="fx" data-lang="py">import numpy as np

train, test = np.array([2., 4., 6.]), np.array([30.])
m, s = train.mean(), train.std()                       # learnt from training rows only
print(f"proper: mean={m:.2f} std={s:.3f}  train z={((train - m) / s).round(2)}  test z={((test - m) / s).round(2)}")
allx = np.r_[train, test]
m2, s2 = allx.mean(), allx.std()                       # learnt from ALL rows (leaky)
print(f"leaky : mean={m2:.2f} std={s2:.3f}  train z={((train - m2) / s2).round(2)}  test z={((test - m2) / s2).round(2)}")</div>
  <div class="fx" data-lang="text">proper: mean=4.00 std=1.633  train z=[-1.22  0.    1.22]  test z=[15.92]
leaky : mean=10.50 std=11.347  train z=[-0.75 -0.57 -0.4 ]  test z=[1.72]</div>
  <h3>On the flats</h3>
  <p>Train on flats A–H (areas 5 … 12, mean 8.5, std √(42/8) = 2.291). The 5,000 sq ft bungalow (area 50) arrives later. Properly scaled it sits (50 − 8.5)/2.291 = 18.11 standard deviations out: the model is warned it has never seen anything like it. Fit the scaler with the bungalow included and the mean jumps to 118/9 = 13.11, the std to 13.22, and the bungalow becomes an unremarkable 2.79, while flat A moved from −1.53 to −0.61 before training even began.</p>
  <div class="fx" data-lang="py">import numpy as np

area = np.arange(5, 15, dtype=float)                 # flats A..J, area in 100 sq ft
train, test = area[:8], np.array([50.])              # train on A..H; the bungalow arrives later
m, s = train.mean(), train.std()                     # learnt from training flats only
print(f"proper: mean={m:.2f} std={s:.3f}  bungalow z={(test[0] - m) / s:.2f}  flat A z={(train[0] - m) / s:.2f}")
allx = np.r_[train, test]
m2, s2 = allx.mean(), allx.std()                     # learnt from training flats AND the bungalow
print(f"leaky : mean={m2:.2f} std={s2:.3f}  bungalow z={(test[0] - m2) / s2:.2f}  flat A z={(train[0] - m2) / s2:.2f}")</div>
  <div class="fx" data-lang="text">proper: mean=8.50 std=2.291  bungalow z=18.11  flat A z=-1.53
leaky : mean=13.11 std=13.220  bungalow z=2.79  flat A z=-0.61</div>
  <h3>How big is it? Unsupervised vs supervised steps</h3>
  <p>The honest answer is: it depends on whether the step looks at the labels. Below, (a) measures the scaler leak on real data over 20 different 5-fold splits, and (b) the same "fit on everything, then cross-validate" mistake with a feature selector on pure noise.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# (a) unsupervised step (scaler) fit on all rows: real data, 20 different 5-fold splits
X, y = load_breast_cancer(return_X_y=True)
gaps = []
for seed in range(20):
    cv = StratifiedKFold(5, shuffle=True, random_state=seed)
    leaky = cross_val_score(KNeighborsClassifier(), StandardScaler().fit_transform(X), y, cv=cv).mean()
    proper = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier()), X, y, cv=cv).mean()
    gaps.append(leaky - proper)
print(f"scaler leak on breast cancer: mean inflation {np.mean(gaps):+.4f} (range {min(gaps):+.4f} to {max(gaps):+.4f})")

# (b) supervised step (feature selection) fit on all rows: pure noise, honest answer is 0.5
rng = np.random.default_rng(0)
Xn = rng.normal(size=(100, 5000)); yn = rng.integers(0, 2, 100)
X_sel = SelectKBest(f_classif, k=20).fit_transform(Xn, yn)          # looked at every label
print("selection before CV:", cross_val_score(LogisticRegression(), X_sel, yn, cv=5).mean().round(3))
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print("selection inside CV:", cross_val_score(pipe, Xn, yn, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">scaler leak on breast cancer: mean inflation +0.0004 (range -0.0018 to +0.0053)
selection before CV: 0.85
selection inside CV: 0.48</div>
  <p>(a) The scaler leak is tiny here: +0.0004 accuracy on average, sometimes negative. A scaler learns only a mean and a standard deviation per column, from 569 rows; one fold's worth of extra rows barely moves them. (b) The feature selector is a different story. Among 5,000 random columns, a few match 100 random labels by chance. Selecting the 20 best using <em>all</em> labels, including those of every future validation fold, then cross-validating, reports 85% accuracy on data with nothing to learn. Inside a pipeline, the selector is refit on each training fold, and the score falls to the honest 0.48.</p>
  <h3>The flats version of (b)</h3>
  <p>Ten prices and 300 random columns that have nothing to do with them. Predicting each flat by the mean of the other nine gives LOOCV MSE 372.3 (that is (10/9)² × 301.6, the price variance). Now pick the one noise column most correlated with price using all ten prices, then run LOOCV:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_score
from sklearn.pipeline import make_pipeline

price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
rng = np.random.default_rng(0)
noise = rng.normal(size=(10, 300))                   # 300 random columns: none has anything to do with price
loo = dict(cv=LeaveOneOut(), scoring="neg_mean_squared_error")
mean_only = np.mean([(price[i] - np.delete(price, i).mean()) ** 2 for i in range(10)])
print(f"predict the mean of the other nine (LOOCV MSE): {mean_only:.1f}")
best = SelectKBest(f_regression, k=1).fit(noise, price)             # looked at all ten prices
col = best.get_support(indices=True)[0]
print(f"column picked using all ten prices: #{col}, correlation with price {np.corrcoef(noise[:, col], price)[0, 1]:+.2f}")
leaky = -cross_val_score(LinearRegression(), noise[:, [col]], price, **loo).mean()
print(f"selection BEFORE LOOCV: {leaky:.1f}")
pipe = make_pipeline(SelectKBest(f_regression, k=1), LinearRegression())   # re-selects inside each fold
print(f"selection INSIDE LOOCV: {-cross_val_score(pipe, noise, price, **loo).mean():.1f}")</div>
  <div class="fx" data-lang="text">predict the mean of the other nine (LOOCV MSE): 372.3
column picked using all ten prices: #149, correlation with price -0.77
selection BEFORE LOOCV: 162.7
selection INSIDE LOOCV: 788.9</div>
  <p>Among 300 random columns, one correlates −0.77 with ten prices by pure chance. Chosen with every price in view, it "beats" the mean (162.7 vs 372.3). Inside a pipeline, each fold re-selects using only its nine training prices; the chosen column then means nothing for the held-out flat, and the honest score, 788.9, is worse than predicting the mean.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The size of a contamination leak grows with how much the step learns about the <em>labels</em> and with how many rows it can memorise. Unsupervised steps with few parameters (scaling, mean imputation) usually leak a little; supervised steps (feature selection, target encoding, SMOTE, choosing bins by target) or steps that store rows (KNN imputer) can leak enormously. Since you cannot easily tell in advance, the rule is absolute: every learnt step goes inside the pipeline. Then you never have to measure.</p>
  </div>
  <div class="flow"><span>Wrong: fit steps on ALL rows</span><span>split / CV</span><span>train model</span><span>score inflated</span></div>
  <div class="flow"><span>Right: split / CV first</span><span>fit steps + model on training fold</span><span>transform held-out fold with training statistics</span><span>honest score</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"I only scaled, it's unsupervised, so it's fine" is the habit that later becomes "I only selected features" or "I only applied SMOTE" on a project where it matters. Also: a tiny leak still corrupts the comparison between models when they are close, which is exactly when you need the score to be honest.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Leak 2, target encoding before the split.</b> A selector peeks at the labels indirectly. Some steps are built out of the label: target encoding replaces a category with its average target. How much does that leak, and why is "split first" still not enough?</div>


  <h2 id="pl-te"><span class="num">03</span>Leak 2: Target Encoding Before the Split</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Locality is a strong feature for the flats, and target encoding turns it into one number: the locality's average price. Computed on all ten flats, that average contains the very price we are trying to predict. How much does that flatter the score?</p>
  </div>
  <h3>The mechanism, by hand</h3>
  <p>Target encoding replaces a category with the average target of that category (<a class="xref" data-note="ml_features">Feature Engineering</a>). Take a merchant with 4 transactions, labels (fraud = 1, 0, 0, 0). Encoded on all rows, every one of its rows gets 1/4 = 0.25. Now ask what each row's feature would be without its own label (the leave-one-out mean): the fraud row's other three rows average 0/3 = 0; each normal row's other three average 1/3 = 0.333. So including the row's own label raised the fraud row's feature from 0 to 0.25 and lowered each normal row's from 0.333 to 0.25. Across many small merchants that systematic nudge (fraud rows pushed up, normal rows pushed down) is a signal made of the labels themselves. A merchant with a single transaction is worse: its feature is exactly its label.</p>
  <h3>On the flats</h3>
  <p>Baner holds B, E, H, J with prices 49, 67, 83, 96: mean 73.75. Every Baner flat gets 73.75, but each flat's own price is inside it. Without itself, B's locality mean would be (67 + 83 + 96)/3 = 82, J's (49 + 67 + 83)/3 = 66.33. The cheap flat B is nudged down toward its own price (82 → 73.75), the expensive J up (66.33 → 73.75). The feature has learnt a little of each answer.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, LeaveOneOut, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import TargetEncoder

df = pd.DataFrame({"flat": list("ABCDEFGHIJ"), "area": np.arange(5, 15), "locality": list("HBKHBKHBKB"),
                   "price": [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})
baner = df[df.locality == "B"].copy()
baner["naive_enc"] = baner.price.mean()                                   # every Baner flat gets 73.75
baner["without_itself"] = [(baner.price.sum() - p) / 3 for p in baner.price]   # leave-one-out mean
print(baner[["flat", "price", "naive_enc", "without_itself"]].round(2).to_string(index=False))

df["loc_naive"] = df.locality.map(df.groupby("locality").price.mean())    # computed on ALL ten flats
loo = dict(cv=LeaveOneOut(), scoring="neg_mean_squared_error")
naive = -cross_val_score(LinearRegression(), df[["area", "loc_naive"]], df.price, **loo).mean()
honest = [-cross_val_score(make_pipeline(
              ColumnTransformer([("te", TargetEncoder(smooth=2, cv=KFold(3, shuffle=True, random_state=s),
                                                      target_type="continuous"), ["locality"])],
                                remainder="passthrough"), LinearRegression()),
              df[["area", "locality"]], df.price, **loo).mean() for s in range(20)]
print(f"LOOCV MSE, locality mean computed before the split: {naive:.2f}")
print(f"LOOCV MSE, TargetEncoder inside the pipeline     : median {np.median(honest):.2f} over 20 inner shuffles")</div>
  <div class="fx" data-lang="text">flat  price  naive_enc  without_itself
   B     49      73.75           82.00
   E     67      73.75           76.00
   H     83      73.75           70.67
   J     96      73.75           66.33
LOOCV MSE, locality mean computed before the split: 1.68
LOOCV MSE, TargetEncoder inside the pipeline     : median 3.69 over 20 inner shuffles</div>
  <p>Computed on all ten flats, the locality mean gives LOOCV MSE 1.68. Inside the pipeline, the encoder is refit on each fold's nine training flats (and cross-fitted again within them), so the held-out flat's price never touches its own feature: median 3.69 over 20 shuffles of that inner split. The 1.68 was a leaky measurement, not a better model.</p>
  <h3>Measured</h3>
  <p>3,000 transactions over 800 merchants (about 4 each). Fraud depends only on the amount; the merchant is irrelevant.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import TargetEncoder

rng = np.random.default_rng(0)
n = 3000
df = pd.DataFrame({"merchant": rng.choice([f"m{i}" for i in range(800)], n),   # ~4 rows per merchant
                   "amount": rng.lognormal(7, 1, n)})
df["fraud"] = (rng.random(n) &lt; 1 / (1 + np.exp(-(np.log(df.amount) - 9)))).astype(int)  # depends on amount only

# LEAKY: encode with merchant fraud rate computed on ALL rows, then split
leak = df.copy()
leak["merchant_rate"] = leak.groupby("merchant").fraud.transform("mean")
tr, te = train_test_split(leak, test_size=0.3, random_state=0, stratify=leak.fraud)
m = HistGradientBoostingClassifier(random_state=0).fit(tr[["amount", "merchant_rate"]], tr.fraud)
print("leaky  test AUC:", round(roc_auc_score(te.fraud, m.predict_proba(te[["amount", "merchant_rate"]])[:, 1]), 3))

# PROPER: split first; TargetEncoder learns (cross-fitted) from training rows only
tr, te = train_test_split(df, test_size=0.3, random_state=0, stratify=df.fraud)
pipe = make_pipeline(make_column_transformer((TargetEncoder(cv=StratifiedKFold(5, shuffle=True, random_state=0)), ["merchant"]), remainder="passthrough"),
                     HistGradientBoostingClassifier(random_state=0))
pipe.fit(tr[["merchant", "amount"]], tr.fraud)
print("proper test AUC:", round(roc_auc_score(te.fraud, pipe.predict_proba(te[["merchant", "amount"]])[:, 1]), 3))
only_amount = HistGradientBoostingClassifier(random_state=0).fit(tr[["amount"]], tr.fraud)
print("amount alone   :", round(roc_auc_score(te.fraud, only_amount.predict_proba(te[["amount"]])[:, 1]), 3))</div>
  <div class="fx" data-lang="text">leaky  test AUC: 0.902
proper test AUC: 0.711
amount alone   : 0.723</div>
  <p>Encoding before the split gives a test AUC of 0.902 for a column that carries no real information. The honest pipeline (split first, cross-fitted <code>TargetEncoder</code> learnt from training rows only) gives 0.711, about the same as the amount alone (0.723; the useless merchant column even costs a little). The leaky version's test rows were encoded with their own labels, so even the "untouched" test set was contaminated.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Splitting first is necessary but not sufficient: if you compute the merchant rate on the training rows and use it as a training feature, each training row still sees its own label, and the model learns to trust the feature too much. That is why <code>TargetEncoder.fit_transform</code> uses internal cross-fitting (each training fold encoded from the other folds), while <code>transform</code> on new rows uses all training rows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Leak 3, time leakage.</b> Both leaks so far came from one row's information reaching another through a shared statistic. Time adds a direction: listings arrive month by month. What goes wrong when tomorrow's listings help describe today's?</div>


  <h2 id="pl-time"><span class="num">04</span>Leak 3: Time Leakage</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The flats were listed one per month, January (B) to October (J). A model in production prices each flat the day it is listed, knowing only earlier listings. What happens to a score when a feature quietly uses the whole year?</p>
  </div>
  <h3>Two ways the future gets in</h3>
  <p><strong>Random splits on time-ordered data.</strong> If rows from July are in training and rows from June in validation, the model can interpolate between yesterday and tomorrow, which it will never be able to do when forecasting. <strong>Features computed with future rows.</strong> A centred rolling mean at day t averages days t−3 … t+3, so it contains three days the forecaster cannot have seen.</p>
  <p>By hand with a 3-day centred mean on sales 10, 12, 11, 30, 13: at day 3 it is (12 + 11 + 30)/3 = 17.67, already "knowing" about the day-4 spike of 30. The honest past-only version at day 3 uses days 1–2: (10 + 12)/2 = 11.</p>
  <h3>On the flats: a whole-year average vs an as-of average</h3>
  <p>In listing order the flats are B, D, A, F, C, G, I, E, H, J. Two versions of "locality's typical price": over the <em>whole year</em> (Baner 73.75 even for B in January, though H and J are listed in September and October), and <em>as of</em> listing time (the mean of the same locality's earlier listings; for the first listing in a locality, a prior of ₹60 lakh, last year's city average). Score both honestly with forward chaining: train on everything listed so far, predict the next listing.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

df = pd.DataFrame({"flat": list("ABCDEFGHIJ"), "area": np.arange(5, 15), "locality": list("HBKHBKHBKB"),
                   "listed": [3, 1, 5, 2, 8, 4, 6, 9, 7, 10],          # listing month (Jan = 1)
                   "price": [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})
df = df.sort_values("listed").reset_index(drop=True)                    # time order: B D A F C G I E H J
PRIOR = 60.0                                   # last year's city-wide average: known in January
# whole-year feature: locality's mean price over ALL listings of the year, including later ones
df["loc_year"] = df.locality.map(df.groupby("locality").price.mean())
# as-of feature: mean price of the SAME locality's flats listed EARLIER; none yet -&gt; the prior
prev = [df.loc[:i - 1] for i in range(len(df))]
df["loc_asof"] = [p[p.locality == l].price.mean() if (p.locality == l).any() else PRIOR
                  for p, l in zip(prev, df.locality)]
print(df[["flat", "listed", "locality", "price", "loc_year", "loc_asof"]].round(2).to_string(index=False))

def forward_mse(col):                         # train on everything listed so far, predict the next listing
    errs = []
    for i in range(4, len(df)):               # start once four flats have been listed
        tr, te = df.loc[:i - 1], df.loc[[i]]
        m = LinearRegression().fit(tr[["area", col]], tr.price)
        errs.append((m.predict(te[["area", col]])[0] - te.price.iloc[0]) ** 2)
    return np.mean(errs)
for col in ["loc_year", "loc_asof"]:
    print(f"forward-chaining MSE, area + {col:8s}: {forward_mse(col):.2f}")
e = [(LinearRegression().fit(df.loc[:i - 1, ["area"]], df.price[:i]).predict(df.loc[[i], ["area"]])[0] - df.price[i]) ** 2
     for i in range(4, len(df))]
print(f"forward-chaining MSE, area only      : {np.mean(e):.2f}")</div>
  <div class="fx" data-lang="text">flat  listed locality  price  loc_year  loc_asof
   B       1        B     49     73.75     60.00
   D       2        H     56     55.67     60.00
   A       3        H     38     55.67     56.00
   F       4        K     68     69.33     60.00
   C       5        K     53     69.33     68.00
   G       6        H     73     55.67     47.00
   I       7        K     87     69.33     60.50
   E       8        B     67     73.75     49.00
   H       9        B     83     73.75     58.00
   J      10        B     96     73.75     66.33
forward-chaining MSE, area + loc_year: 2.24
forward-chaining MSE, area + loc_asof: 29.04
forward-chaining MSE, area only      : 6.91</div>
  <p>The whole-year feature looks excellent (2.24) because it contains later prices, including the flat's own. The as-of version, the only one that exists in production, scores 29.04: with one or two earlier listings per locality it is noisy, and the model is better off with area alone (6.91). The leaky feature did not just inflate a score; it would have led us to ship a feature that makes the model worse.</p>
  <h3>Measured</h3>
  <p>Two years of daily sales: a wandering trend, a weekly cycle and noise. Three feature sets, each scored with a shuffled 5-fold split and with <code>TimeSeriesSplit</code> (train on the past, validate on the next block; <a class="xref" data-note="ml_splits">Splits &amp; CV</a>).</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score

rng = np.random.default_rng(0)
n = 730                                                       # two years of daily sales
t = np.arange(n)
sales = 200 + np.cumsum(rng.normal(0, 3, n)) + 20 * np.sin(2 * np.pi * t / 7) + rng.normal(0, 5, n)
df = pd.DataFrame({"t": t, "dow": t % 7, "sales": sales})
df["roll7_centered"] = df.sales.rolling(7, center=True, min_periods=1).mean()   # uses 3 FUTURE days
df["roll7_past"] = df.sales.shift(1).rolling(7, min_periods=1).mean()           # only the past
df = df.dropna()
rf = RandomForestRegressor(n_estimators=100, random_state=0, n_jobs=1)
def mae(cols, cv):
    return -cross_val_score(rf, df[cols], df.sales, cv=cv, scoring="neg_mean_absolute_error").mean()
rand, time = KFold(5, shuffle=True, random_state=0), TimeSeriesSplit(5)
print(f"[t, dow]            random KFold MAE {mae(['t', 'dow'], rand):5.1f}   time split MAE {mae(['t', 'dow'], time):5.1f}")
print(f"[dow, roll7_center] random KFold MAE {mae(['dow', 'roll7_centered'], rand):5.1f}   time split MAE {mae(['dow', 'roll7_centered'], time):5.1f}")
print(f"[dow, roll7_past]   random KFold MAE {mae(['dow', 'roll7_past'], rand):5.1f}   time split MAE {mae(['dow', 'roll7_past'], time):5.1f}")</div>
  <div class="fx" data-lang="text">[t, dow]            random KFold MAE   6.2   time split MAE  13.4
[dow, roll7_center] random KFold MAE   4.8   time split MAE   7.5
[dow, roll7_past]   random KFold MAE   6.7   time split MAE   9.6</div>
  <ul>
    <li><strong>[t, dow]</strong> with a random split: MAE 6.2. The forest looks up neighbouring days on both sides. With a time split, MAE 13.4: it must extrapolate a trend it has not seen, and cannot. The random-split score was a fantasy.</li>
    <li><strong>Centred rolling mean</strong>: even under the honest time split it scores 7.5, because the feature itself contains future sales.</li>
    <li><strong>Past-only rolling mean</strong> (<code>shift(1)</code> then <code>rolling</code>): 9.6 under the time split. This is the realistic number.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Time leakage hides in many places: random splits, centred windows, aggregates over the whole history ("customer's lifetime spend" including future purchases), features joined from a table that was updated after the event, and scalers fit on the full period. Use as-of joins, past-only windows and forward-chaining splits, and leave a gap between training and validation when labels arrive late (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Leak 4, duplicates and groups.</b> Time leaks put the future into the past. A different leak puts the same thing on both sides of the split. What if a flat is listed twice?</div>


  <h2 id="pl-dup"><span class="num">05</span>Leak 4: Duplicates and Groups</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Portals relist flats and scrapers run twice. If flat E appears as two identical listings and one lands in training and the other in validation, is the model predicting E's price or looking it up?</p>
  </div>
  <h3>The mechanism, by hand</h3>
  <p>200 patients, 4 visits each, the visits nearly identical (same person, tiny measurement noise). The diagnosis is random: it has nothing to do with the measurements. In a random 5-fold split, take a visit in the test fold (160 of 800 rows). The chance that all 3 of its sibling visits also landed in the test fold is (159/799) × (158/798) × (157/797) ≈ 0.0078. So about 99.2% of test visits have at least one near-identical twin in training, carrying the same label. A model that just finds the nearest twin will score about 99%, while knowing nothing about disease.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import KFold, GroupKFold, cross_val_score

rng = np.random.default_rng(0)
patients, visits = 200, 4
base = rng.normal(size=(patients, 10))                   # each patient's own "fingerprint"
label = rng.integers(0, 2, patients)                     # diagnosis: unrelated to the features!
X = np.repeat(base, visits, axis=0) + rng.normal(0, 0.05, (patients * visits, 10))  # near-duplicate visits
y = np.repeat(label, visits)
groups = np.repeat(np.arange(patients), visits)
rf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=1)
print("random KFold      :", cross_val_score(rf, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean().round(3))
print("GroupKFold patient:", cross_val_score(rf, X, y, cv=GroupKFold(5), groups=groups).mean().round(3))</div>
  <div class="fx" data-lang="text">random KFold      : 0.991
GroupKFold patient: 0.482</div>
  <p>Random KFold: 0.991, as the hand calculation predicted. <code>GroupKFold</code> keeps every patient's visits in the same fold, so the test patients are genuinely new: 0.482, the coin-flip truth.</p>
  <h3>On the flats: scraped twice</h3>
  <p>Every flat appears as two identical listings: 20 rows, 10 flats. Leave out one <em>listing</em> and its twin is still in training, at distance 0; a nearest-neighbour model copies the twin's price. Leave out one <em>flat</em> (both listings) and it has to predict from other flats.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneGroupOut, LeaveOneOut, cross_val_score
from sklearn.neighbors import KNeighborsRegressor

area = np.arange(5, 15, dtype=float)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
# the portal was scraped twice: every flat appears as two listings (same area, same price)
X, y = np.repeat(area, 2)[:, None], np.repeat(price, 2)
flat = np.repeat(np.array(list("ABCDEFGHIJ")), 2)              # which flat each listing belongs to
mse = dict(scoring="neg_mean_squared_error")
for name, model in [("4-NN (distance-weighted)", KNeighborsRegressor(4, weights="distance")),
                    ("straight line           ", LinearRegression())]:
    rand = -cross_val_score(model, X, y, cv=LeaveOneOut(), **mse).mean()
    grp = -cross_val_score(model, X, y, cv=LeaveOneGroupOut(), groups=flat, **mse).mean()
    print(f"{name}: leave-one-LISTING-out MSE {abs(rand):6.2f}   leave-one-FLAT-out MSE {grp:6.2f}")</div>
  <div class="fx" data-lang="text">4-NN (distance-weighted): leave-one-LISTING-out MSE   0.00   leave-one-FLAT-out MSE  33.79
straight line           : leave-one-LISTING-out MSE   5.64   leave-one-FLAT-out MSE   7.25</div>
  <p>The memorising 4-NN model scores a perfect 0.00 when a listing's twin is in training, and 33.79 when the whole flat is held out. The straight line barely memorises: 5.64 vs 7.25, and 7.25 is exactly the honest LOOCV of area alone on the ten distinct flats. The more a model can memorise, the more a group leak flatters it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Group leakage</strong>: rows that share an entity (patient, customer, device, house, image of the same object, sentence from the same document) end up on both sides of a split, so the model can recognise the entity instead of learning the pattern. Fix: split by entity (<code>GroupKFold</code>, <code>GroupShuffleSplit</code>, <code>StratifiedGroupKFold</code>), and remove exact and near duplicates before splitting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>You create duplicates yourself when you oversample or apply SMOTE before splitting (<a class="xref" data-note="ml_features">Feature Engineering</a>), or augment images before splitting (<a class="xref" data-note="ml_regularization">Regularization</a>). Copies of one minority row in both train and test inflate recall. Resample or augment only the training fold.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Leak 5, features from the future.</b> So far, splitting correctly fixes each leak. The last kind survives any split: a column whose value is written after the outcome. How does that look in a table that seems perfectly ordinary?</div>


  <h2 id="pl-future"><span class="num">06</span>Leak 5: Features From the Future (Target Leakage)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The portal's table has a "final sale price" column, filled when the deal closes, usually a few percent below the asking price. It is available for every flat in the historical data. Can we use it to predict the asking price of a new listing?</p>
  </div>
  <p>A telecom company wants to predict churn early enough to offer a discount. Its customer table has a column <code>refund_issued</code>, and most customers who leave get a refund. That column predicts churn almost perfectly, because it is written <em>after</em> the customer has left. At the moment the model must act, it is always empty.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
n = 2000
df = pd.DataFrame({"tenure": rng.integers(1, 60, n), "tickets": rng.poisson(2, n)})
p = 1 / (1 + np.exp(-(-1.5 - 0.04 * df.tenure + 0.35 * df.tickets)))
df["churn"] = (rng.random(n) &lt; p).astype(int)
df["refund_issued"] = df.churn &amp; (rng.random(n) &lt; 0.9)          # only known AFTER the customer left
for cols in [["tenure", "tickets", "refund_issued"], ["tenure", "tickets"]]:
    Xtr, Xte, ytr, yte = train_test_split(df[cols], df.churn, random_state=0, stratify=df.churn)
    rf = RandomForestClassifier(n_estimators=100, random_state=0, n_jobs=1).fit(Xtr, ytr)
    top = pd.Series(rf.feature_importances_, cols).idxmax()
    print(f"{'+'.join(cols):30s} test acc {rf.score(Xte, yte):.3f}   top feature: {top}")
print("always 'no churn' acc:", round(1 - df.churn.mean(), 3))</div>
  <div class="fx" data-lang="text">tenure+tickets+refund_issued   test acc 0.984   top feature: refund_issued
tenure+tickets                 test acc 0.832   top feature: tenure
always 'no churn' acc: 0.861</div>
  <p>With the leaky column: 98.4% test accuracy and <code>refund_issued</code> is the top feature by far. Without it: 83.2%, which is actually <em>below</em> always predicting "no churn" (86.1%). A random split did not catch this: the leak is in the column's meaning, not in how rows were split. Painful, and much better learnt before launch than after.</p>
  <h3>On the flats</h3>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_score

df = pd.DataFrame({"flat": list("ABCDEFGHIJ"), "area": np.arange(5, 15),
                   "price": [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})          # asking price: the target
discount = np.array([3, 2, 4, 1, 3, 2, 5, 2, 3, 2]) / 100                       # negotiated off at the deal
df["final_price"] = (df.price * (1 - discount)).round(1)                       # written AFTER the flat sells
print(df[["flat", "area", "price", "final_price"]].T.to_string(header=False))
loo = dict(cv=LeaveOneOut(), scoring="neg_mean_squared_error")
for cols in [["area", "final_price"], ["area"]]:
    mse = -cross_val_score(LinearRegression(), df[cols], df.price, **loo).mean()
    w = LinearRegression().fit(df[cols], df.price).coef_
    print(f"{' + '.join(cols):19s} LOOCV MSE {mse:5.2f}   weights {np.round(w, 3).tolist()}")</div>
  <div class="fx" data-lang="text">flat            A     B     C     D     E     F     G     H     I     J
area            5     6     7     8     9    10    11    12    13    14
price          38    49    53    56    67    68    73    83    87    96
final_price  36.9  48.0  50.9  55.4  65.0  66.6  69.4  81.3  84.4  94.1
area + final_price  LOOCV MSE  0.80   weights [0.962, 0.861]
area                LOOCV MSE  7.25   weights [6.0]</div>
  <p>With the sale price as a feature, LOOCV MSE falls from 7.25 to 0.80, and the model leans on it (weight 0.861 per lakh) more than on area (0.962 per 100 sq ft, down from 6.0). Leave-one-out did not catch it: every held-out flat also has its sale price filled in, because the historical table was built after the sales. For a new listing the column is empty. Ask when each column is filled, not only whether it is in the table.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Classic future features: anything with "final", "closed", "resolved", "outcome", "total" or a timestamp after the prediction date; a doctor's treatment code when predicting the diagnosis that caused it; "number of payments made" when predicting who will stop paying. Ask the data owner when and how each column is filled, and build training rows from <strong>as-of snapshots</strong>: the features exactly as they stood at prediction time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Detecting leakage.</b> Five leaks, five stories, each found because we knew where to look. In a new project you do not know where to look. Are there checks that flag a leak you did not anticipate?</div>


  <h2 id="pl-detect"><span class="num">07</span>Detecting Leakage</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A score that is too good is suspicious, but "too good" is a judgement. Is there a mechanical test, one that runs the whole procedure on data where the right answer is known to be "nothing to learn"?</p>
  </div>
  <div class="cards">
    <div><b>Too good to be true</b><p>A score far above published baselines or domain intuition (98% churn accuracy) is a leak until proven otherwise.</p><small>Compare with a simple baseline first</small></div>
    <div><b>One dominant feature</b><p>A single column with most of the importance, or one that alone gives near-perfect AUC.</p><small>Ask when and how it is filled</small></div>
    <div><b>Validation ≫ production</b><p>A big drop after launch, or between a random split and a time/group split.</p><small>Re-score with the honest split</small></div>
    <div><b>Code smell</b><p><code>fit</code> or <code>fit_transform</code> called before <code>train_test_split</code>; global <code>df.groupby(...).transform(...)</code> features; <code>rolling(center=True)</code>.</p><small>Grep for it in review</small></div>
  </div>
  <p>Two systematic checks. <strong>Shuffle the labels</strong> and run the full pipeline: the score must drop to chance (0.5 AUC); if it stays high, something in the features or preprocessing is carrying label information. <strong>Adversarial validation</strong>: train a classifier to tell training rows from test (or production) rows; if it succeeds easily, look at which features it uses: they are either drifting or leaking time or identity.</p>

  <h3>The shuffled-label check on the flats</h3>
  <p>Shuffle the ten prices (they no longer belong to any flat), run each procedure, and count how often it beats "predict the mean" (372.3, the same for every shuffle). An honest procedure should win only by luck.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, LeaveOneOut, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import TargetEncoder

loc = pd.DataFrame({"locality": list("HBKHBKHBKB")})
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
noise = np.random.default_rng(0).normal(size=(10, 300))               # the 300 random columns from Leak 1
loo = dict(cv=LeaveOneOut(), scoring="neg_mean_squared_error")
def score(model, X, y): return -cross_val_score(model, X, y, **loo).mean()

def select_before(y):                    # pick the best noise column with ALL labels, then LOOCV
    col = SelectKBest(f_regression, k=1).fit(noise, y).get_support()
    return score(LinearRegression(), noise[:, col], y)
def select_inside(y):
    return score(make_pipeline(SelectKBest(f_regression, k=1), LinearRegression()), noise, y)
def te_naive(y):                         # locality mean computed on ALL rows
    return score(LinearRegression(), loc.locality.map(pd.Series(y).groupby(loc.locality).mean()).to_frame(), y)
def te_inside(y):
    te = TargetEncoder(smooth=2, cv=KFold(3, shuffle=True, random_state=0), target_type="continuous")
    return score(make_pipeline(ColumnTransformer([("te", te, ["locality"])]), LinearRegression()), loc, y)

rng = np.random.default_rng(1)
shuffles = [rng.permutation(price) for _ in range(20)]                # prices no longer belong to any flat
base = [np.mean([(y[i] - np.delete(y, i).mean()) ** 2 for i in range(10)]) for y in shuffles]
print(f"shuffled prices: 'predict the mean' LOOCV MSE = {np.median(base):.1f} (median of 20)")
for name, f in [("selection before LOOCV", select_before), ("selection in pipeline ", select_inside),
                ("naive locality mean   ", te_naive), ("TargetEncoder in pipe ", te_inside)]:
    s = [f(y) for y in shuffles]
    wins = sum(a &lt; b for a, b in zip(s, base))
    print(f"  {name}: median MSE {np.median(s):6.1f}   beats the mean in {wins:2d} of 20 shuffles")</div>
  <div class="fx" data-lang="text">shuffled prices: 'predict the mean' LOOCV MSE = 372.3 (median of 20)
  selection before LOOCV: median MSE  133.9   beats the mean in 20 of 20 shuffles
  selection in pipeline : median MSE  523.0   beats the mean in  7 of 20 shuffles
  naive locality mean   : median MSE  412.8   beats the mean in  7 of 20 shuffles
  TargetEncoder in pipe : median MSE  458.6   beats the mean in  7 of 20 shuffles</div>
  <p>Selection before the split wins all 20 times on labels that mean nothing: an unmistakable alarm. The honest pipeline wins 7 times out of 20, by chance. But naive locality encoding also wins only 7 times: on ten flats, with three or four per locality, the check is too weak to catch it, though the leak still turned 3.69 into 1.68. The checks catch big leaks; small ones on small data need prevention by construction.</p>
  <div class="bridge"><b>What this still can't tell us → next: fit vs transform.</b> Detection is a safety net with holes. We need a way of writing preprocessing that makes contamination impossible by construction instead of relying on discipline. It starts with being precise about what fit and transform each do.</div>


  <h2 id="pl-fitapi"><span class="num">08</span>fit vs transform vs fit_transform</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every leak so far came from a step learning from rows it should only have been applied to. What exactly does a step "learn", where is it stored, and which call is allowed on which rows?</p>
  </div>
  <p>Every scikit-learn step has the same contract:</p>
  <ul>
    <li><strong>fit(X, y)</strong>: look at these rows and <em>learn</em> something. Store it in attributes ending with an underscore: <code>mean_</code>, <code>scale_</code>, <code>statistics_</code>, <code>categories_</code>, <code>coef_</code>. Returns the fitted object.</li>
    <li><strong>transform(X)</strong>: <em>apply</em> what was learnt to any rows, without learning anything new.</li>
    <li><strong>fit_transform(X, y)</strong>: fit then transform on the same rows (sometimes faster). Meant for training rows only.</li>
    <li><strong>predict(X)</strong>: the model's version of transform, at the end of a pipeline.</li>
  </ul>
  <p>By hand: training rows 2, 4, 6 → mean 4, std 1.633. Test rows 8 and 10 → (8 − 4)/1.633 = 2.449 and (10 − 4)/1.633 = 3.674. Both test rows are correctly described as "far above anything in training".</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler

Xtr = np.array([[2.], [4.], [6.]]); Xte = np.array([[8.], [10.]])
sc = StandardScaler()
sc.fit(Xtr)                                   # learn: mean_ = 4, scale_ = 1.633
print("fit -&gt; mean_", sc.mean_, "scale_", sc.scale_.round(3))
print("transform(train):", sc.transform(Xtr).ravel().round(3))
print("transform(test) :", sc.transform(Xte).ravel().round(3))         # uses TRAIN statistics
print("fit_transform(train) same as fit then transform:", np.allclose(StandardScaler().fit_transform(Xtr), sc.transform(Xtr)))
print("BUG fit_transform(test):", StandardScaler().fit_transform(Xte).ravel())   # re-learns from test</div>
  <div class="fx" data-lang="text">fit -&gt; mean_ [4.] scale_ [1.633]
transform(train): [-1.225  0.     1.225]
transform(test) : [2.449 3.674]
fit_transform(train) same as fit then transform: True
BUG fit_transform(test): [-1.  1.]</div>
  <p>The last line is the classic bug: calling <code>fit_transform</code> on the test set re-learns mean 9 and std 1 from the two test rows, so 8 and 10 become −1 and 1, as if they were ordinary. The model's view of the test data is now different from its view of the training data (and at serving time, a batch of one row would become 0, or NaN). This is both a leak (test statistics used) and a skew (different transformation for different data).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rule of thumb you can say in an interview: "fit and fit_transform touch training data only; everything else gets transform or predict". Then add: "and I don't apply that rule by hand; I put the steps in a Pipeline, which applies it for me".</p>
  </div>
  <h3>On the flats</h3>
  <p>Train on A–H (mean 8.5, std 2.291); flats I and J arrive later: (13 − 8.5)/2.291 = 1.964 and (14 − 8.5)/2.2913 = 2.400, both correctly "larger than any training flat".</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler

Xtr = np.arange(5, 13, dtype=float)[:, None]          # flats A..H: areas 5..12 (training)
Xte = np.array([[13.], [14.]])                         # flats I, J arrive later
sc = StandardScaler().fit(Xtr)                         # learn mean_ and scale_ from A..H only
print("fit -&gt; mean_", sc.mean_, "scale_", sc.scale_.round(3))
print("transform(I, J)        :", sc.transform(Xte).ravel().round(3))          # uses the TRAINING statistics
print("BUG fit_transform(I, J):", StandardScaler().fit_transform(Xte).ravel())  # re-learns from I and J
print("BUG on one live row J  :", StandardScaler().fit_transform([[14.]]).ravel())</div>
  <div class="fx" data-lang="text">fit -&gt; mean_ [8.5] scale_ [2.291]
transform(I, J)        : [1.964 2.4  ]
BUG fit_transform(I, J): [-1.  1.]
BUG on one live row J  : [0.]</div>
  <p>fit_transform on I and J re-learns mean 13.5 and std 0.5 and calls them −1 and +1: the larger flat J now looks average. On a single live listing it always returns 0, whatever the area.</p>
  <div class="bridge"><b>What this still can't tell us → next: the Pipeline.</b> The rule is simple, but applying it by hand in every fold, every grid candidate and at serving time is where it breaks. Is there an object that applies it for us?</div>


  <h2 id="pl-pipe"><span class="num">09</span>The Pipeline, Step by Step</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Cross-validation on the flats runs five or ten fits. Each fit must re-learn the scaler, the encoder and the imputer from its own training flats only, and prediction must reuse what was learnt. How do we make that automatic rather than a matter of care?</p>
  </div>
  <h3>What it is</h3>
  <p>A <strong>Pipeline</strong> is a list of named steps: any number of transformers followed by one final estimator. It behaves like a single model. <code>pipe.fit(X, y)</code> calls <code>fit_transform</code> on each transformer in order, passing the output to the next, then <code>fit</code> on the final estimator. <code>pipe.predict(X)</code> calls <code>transform</code> on each transformer (never fit) and then <code>predict</code>.</p>
  <figure class="viz"><svg viewBox="0 0 660 230" width="660">
<defs><marker id="pip-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="10" y="22" font-size="12.5" font-weight="700">pipe.fit(X_train, y_train)</text>
<rect x="10" y="34" width="90" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="55" y="58" text-anchor="middle" font-size="12">X_train</text>
<rect x="130" y="34" width="150" height="40" rx="7" class="fb sb"/><text x="205" y="52" text-anchor="middle" font-size="12">imputer</text><text x="205" y="67" text-anchor="middle" class="tb" font-size="10.5">fit_transform</text>
<rect x="310" y="34" width="150" height="40" rx="7" class="fb sb"/><text x="385" y="52" text-anchor="middle" font-size="12">scaler</text><text x="385" y="67" text-anchor="middle" class="tb" font-size="10.5">fit_transform</text>
<rect x="490" y="34" width="150" height="40" rx="7" class="fg sg"/><text x="565" y="52" text-anchor="middle" font-size="12">model</text><text x="565" y="67" text-anchor="middle" class="tg" font-size="10.5">fit</text>
<line x1="100" y1="54" x2="128" y2="54" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="280" y1="54" x2="308" y2="54" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="460" y1="54" x2="488" y2="54" stroke="currentColor" marker-end="url(#pip-a2)"/>
<text x="205" y="92" text-anchor="middle" class="tm" font-size="10.5">learns statistics_ (medians)</text><text x="385" y="92" text-anchor="middle" class="tm" font-size="10.5">learns mean_, scale_</text><text x="565" y="92" text-anchor="middle" class="tm" font-size="10.5">learns coef_</text>
<line x1="205" y1="98" x2="205" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pip-a2)"/><line x1="385" y1="98" x2="385" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pip-a2)"/><line x1="565" y1="98" x2="565" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pip-a2)"/>
<text x="10" y="132" font-size="12.5" font-weight="700">pipe.predict(X_new)</text>
<rect x="10" y="144" width="90" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="55" y="168" text-anchor="middle" font-size="12">X_new</text>
<rect x="130" y="144" width="150" height="40" rx="7" class="ft st"/><text x="205" y="162" text-anchor="middle" font-size="12">imputer</text><text x="205" y="177" text-anchor="middle" class="tm" font-size="10.5">transform only</text>
<rect x="310" y="144" width="150" height="40" rx="7" class="ft st"/><text x="385" y="162" text-anchor="middle" font-size="12">scaler</text><text x="385" y="177" text-anchor="middle" class="tm" font-size="10.5">transform only</text>
<rect x="490" y="144" width="150" height="40" rx="7" class="ft st"/><text x="565" y="162" text-anchor="middle" font-size="12">model</text><text x="565" y="177" text-anchor="middle" class="tm" font-size="10.5">predict</text>
<line x1="100" y1="164" x2="128" y2="164" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="280" y1="164" x2="308" y2="164" stroke="currentColor" marker-end="url(#pip-a2)"/><line x1="460" y1="164" x2="488" y2="164" stroke="currentColor" marker-end="url(#pip-a2)"/>
<text x="330" y="214" text-anchor="middle" class="tm" font-size="11">dashed arrows: what was learnt in fit is reused, unchanged, at prediction time</text>
</svg><figcaption>One Pipeline, two calls. fit learns every step from the training rows only; predict reuses those learnt numbers on new rows. Because cross-validation and grid search call fit on training folds, every step is automatically re-learnt per fold.</figcaption></figure>
  <h3>Traced with a spy step</h3>
  <p>To see exactly which rows each step is fitted on, put a do-nothing "spy" transformer at the front that prints every call. 30 rows; first a plain fit on 20 and predict on 10, then 3-fold cross-validation of the same pipeline.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

class Spy(BaseEstimator, TransformerMixin):
    """Passes data through unchanged, but reports every fit / transform call."""
    def fit(self, X, y=None):
        print(f"  Spy.fit       on {len(X)} rows")
        return self
    def transform(self, X):
        print(f"  Spy.transform on {len(X)} rows")
        return X

rng = np.random.default_rng(0)
X = rng.normal(size=(30, 3)); y = (X[:, 0] &gt; 0).astype(int)
pipe = Pipeline([("spy", Spy()), ("scale", StandardScaler()), ("clf", LogisticRegression())])
print("pipe.fit(X[:20]):"); pipe.fit(X[:20], y[:20])
print("pipe.predict(X[20:]):"); pipe.predict(X[20:])
print("cross_val_score, 3 folds:")
s = cross_val_score(pipe, X, y, cv=3)
print("steps:", list(pipe.named_steps), " pipe[-1] is", type(pipe[-1]).__name__, " learnt mean_:", pipe["scale"].mean_.round(2))</div>
  <div class="fx" data-lang="text">pipe.fit(X[:20]):
  Spy.fit       on 20 rows
  Spy.transform on 20 rows
pipe.predict(X[20:]):
  Spy.transform on 10 rows
cross_val_score, 3 folds:
  Spy.fit       on 20 rows
  Spy.transform on 20 rows
  Spy.transform on 10 rows
  Spy.fit       on 20 rows
  Spy.transform on 20 rows
  Spy.transform on 10 rows
  Spy.fit       on 20 rows
  Spy.transform on 20 rows
  Spy.transform on 10 rows
steps: ['spy', 'scale', 'clf']  pipe[-1] is LogisticRegression  learnt mean_: [0.02 0.01 0.2 ]</div>
  <p>Read the trace. <code>fit</code> on 20 rows: the spy is fit and transforms those 20 (that is <code>fit_transform</code>). <code>predict</code> on 10 rows: transform only, no fit. In 3-fold CV, each round fits on its 20 training rows and only transforms its 10 held-out rows: the held-out fold never reaches a <code>fit</code>. <code>cross_val_score</code> works on clones, so the original <code>pipe</code> keeps what it learnt from <code>X[:20]</code> (that is the <code>mean_</code> printed). Steps can be reached by name (<code>pipe["scale"]</code>, <code>pipe.named_steps</code>) or position (<code>pipe[-1]</code> is the model, <code>pipe[:-1]</code> the preprocessing).</p>
  <h3>The same spy on the flats</h3>
  <p>Five folds over A–J in order; the spy prints the letters of the flats each call sees.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

class Spy(BaseEstimator, TransformerMixin):
    """Passes data through unchanged, but reports which flats each call sees."""
    def fit(self, X, y=None):
        print(f"  fit       on {''.join(X.index)}")
        return self
    def transform(self, X):
        print(f"  transform on {''.join(X.index)}")
        return X

X = pd.DataFrame({"area": np.arange(5., 15.)}, index=list("ABCDEFGHIJ"))
y = pd.Series([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.], index=X.index)
pipe = Pipeline([("spy", Spy()), ("scale", StandardScaler()), ("model", LinearRegression())])
print("5-fold cross_val_score:")
mse = -cross_val_score(pipe, X, y, cv=KFold(5), scoring="neg_mean_squared_error")
print("fold MSEs:", mse.round(2).tolist(), " mean", mse.mean().round(2))
print("pipe.fit(all ten flats):"); pipe.fit(X, y)
new = pd.DataFrame({"area": [6.4, 8.7, 10.3, 13.6]}, index=list("KLMN"))
print("pipe.predict(new flats K..N):"); p = pipe.predict(new)
print("predictions:", p.round(1).tolist(), "| learnt mean_", pipe["scale"].mean_, "| slope per raw unit",
      round(pipe["model"].coef_[0] / pipe["scale"].scale_[0], 3))</div>
  <div class="fx" data-lang="text">5-fold cross_val_score:
  fit       on CDEFGHIJ
  transform on CDEFGHIJ
  transform on AB
  fit       on ABEFGHIJ
  transform on ABEFGHIJ
  transform on CD
  fit       on ABCDGHIJ
  transform on ABCDGHIJ
  transform on EF
  fit       on ABCDEFIJ
  transform on ABCDEFIJ
  transform on GH
  fit       on ABCDEFGH
  transform on ABCDEFGH
  transform on IJ
fold MSEs: [6.95, 2.66, 6.72, 5.75, 4.44]  mean 5.31
pipe.fit(all ten flats):
  fit       on ABCDEFGHIJ
  transform on ABCDEFGHIJ
pipe.predict(new flats K..N):
  transform on KLMN
predictions: [48.4, 62.2, 71.8, 91.6] | learnt mean_ [9.5] | slope per raw unit 6.0</div>
  <p>Each round fits on eight flats and only transforms the two held out (A, B; then C, D; …). Refit on all ten flats, the scaler's mean_ is 9.5 and the slope in raw units is exactly 6, the least-squares line 6 × area + 10 from earlier notes. The new flats K–N (6.4, 8.7, 10.3, 13.6) are only transformed: 6 × 6.4 + 10 = 48.4, … , 6 × 13.6 + 10 = 91.6.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>sklearn Pipeline</strong>: <code>Pipeline([("name", transformer), …, ("name", estimator)])</code>. All steps but the last must have fit and transform; the last needs fit (and predict, transform or score). <code>make_pipeline(a, b, c)</code> builds one with automatic names (the lowercase class name: <code>standardscaler</code>, <code>logisticregression</code>). A step can be set to <code>"passthrough"</code> to switch it off. The pipeline exposes the final step's methods (<code>predict_proba</code>, <code>score</code>, <code>classes_</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Steps that change the number of rows (resampling, outlier removal) cannot live in a sklearn <code>Pipeline</code>, because <code>transform</code> must return one output row per input row (at prediction time you cannot drop or duplicate rows). Use <code>imbalanced-learn</code>'s Pipeline, which applies samplers only during fit, or use class weights.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ColumnTransformer.</b> A pipeline is a single chain, but the portal's table has numbers, a text category, a blank age and an id column, each needing different steps. How does one pipeline handle columns that need different treatment?</div>


  <h2 id="pl-ct"><span class="num">10</span>ColumnTransformer</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The flats' raw table has area in sq ft, a locality name, an age with one blank, a listing id and a description. A single scaler cannot run on all of it. How do we send each column to its own steps and still get one fitted object?</p>
  </div>
  <h3>Different columns, different steps</h3>
  <p>Real tables mix numbers and categories. Numbers need imputing and scaling; categories need imputing and one-hot encoding; an ID column should be dropped. <code>ColumnTransformer</code> takes a list of (name, transformer, columns) triples, applies each transformer to its columns, and stacks the outputs side by side. Each transformer can itself be a Pipeline.</p>
  <h3>On the flats first</h3>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

flats = pd.DataFrame({
    "listing_id": [f"PN-{i}" for i in range(101, 111)],
    "area_sqft": np.arange(500., 1500., 100.),
    "locality": ["Hadapsar", "Baner", "Kothrud"] * 3 + ["Baner"],
    "age": [12, 3, 8, 15, 5, 10, np.nan, 2, 7, 4],                       # flat G's age is blank
    "description": ["near metro"] * 10})
print(flats.head(3).to_string())
num = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
cat = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
pre = ColumnTransformer([("num", num, ["area_sqft", "age"]), ("cat", cat, ["locality"])],
                        remainder="drop")                                 # listing_id, description dropped
pre.set_output(transform="pandas")
Z = pre.fit_transform(flats)
print("output shape:", Z.shape, "| learnt medians:", pre.named_transformers_["num"]["impute"].statistics_.tolist())
print(Z.round(3).loc[[0, 6]].to_string())
new = pd.DataFrame({"listing_id": ["PN-201"], "area_sqft": [870.], "locality": ["Wakad"],
                    "age": [np.nan], "description": ["corner flat"]})
print(pre.transform(new).round(3).to_string())</div>
  <div class="fx" data-lang="text">  listing_id  area_sqft  locality   age description
0     PN-101      500.0  Hadapsar  12.0  near metro
1     PN-102      600.0     Baner   3.0  near metro
2     PN-103      700.0   Kothrud   8.0  near metro
output shape: (10, 5) | learnt medians: [950.0, 7.0]
   num__area_sqft  num__age  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0          -1.567     1.205                  0.0                     1.0                    0.0
6           0.522    -0.077                  0.0                     1.0                    0.0
   num__area_sqft  num__age  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0          -0.279    -0.077                  0.0                     0.0                    0.0</div>
  <p>By hand: the median area of 500 … 1,400 is 950 and the median of the nine known ages (2, 3, 4, 5, 7, 8, 10, 12, 15) is 7, so G's blank becomes 7 before scaling (−0.077). Flat A's area: (500 − 950)/287.2 = −1.567. Output: 2 numeric + 3 localities = 5 columns; the listing id and description are dropped by <code>remainder="drop"</code>. A new Wakad listing with no age gets the training median and all-zero locality columns: nothing crashes, nothing is re-learnt. The same at scale, with 1,000 synthetic loan applicants:</p>
  <p>The data (generated by a small helper, <code>make_loans</code>, 1,000 synthetic loan applicants): income (10% missing), age, loan, city, job (5% missing), applicant_id, and the target <code>default</code>. The helper is saved as <code>loans.py</code> next to the scripts:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

def make_loans(n=1000, seed=0):
    """Synthetic loan applicants: numeric + categorical columns with holes, target = default."""
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "income": rng.lognormal(10.8, 0.5, n).round(-2),
        "age": rng.integers(21, 65, n).astype(float),
        "loan": rng.lognormal(12, 0.6, n).round(-3),
        "city": rng.choice(["Pune", "Delhi", "Mumbai", "Jaipur"], n, p=[0.3, 0.3, 0.3, 0.1]),
        "job": rng.choice(["salaried", "self", "student"], n, p=[0.6, 0.3, 0.1]),
        "applicant_id": np.arange(100000, 100000 + n)})
    z = (np.log(df.loan) - np.log(df.income)) * 1.6 - 0.03 * (df.age - 40) + (df.job == "student") * 1.0 + (df.city == "Jaipur") * 0.6 - 2.4
    df["default"] = (rng.random(n) &lt; 1 / (1 + np.exp(-z))).astype(int)
    df.loc[rng.random(n) &lt; 0.1, "income"] = np.nan          # 10% missing income
    df.loc[rng.random(n) &lt; 0.05, "job"] = np.nan             # 5% missing job
    return df</div>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from loans import make_loans          # 1,000 synthetic applicants (helper shown in the text)

df = make_loans()
X, y = df.drop(columns="default"), df["default"]
print(X.head(3).to_string()); print("missing per column:", X.isna().sum().to_dict())

num = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
cat = Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))])
pre = ColumnTransformer([("num", num, ["income", "age", "loan"]),
                         ("cat", cat, make_column_selector(dtype_include=object))],
                        remainder="drop")              # applicant_id is dropped
Z = pre.fit_transform(X)
print("output shape:", Z.shape)
print(pre.get_feature_names_out())
print("learnt medians:", pre.named_transformers_["num"]["impute"].statistics_.tolist())</div>
  <div class="fx" data-lang="text">    income   age      loan   city       job  applicant_id
0  52200.0  57.0  339000.0  Delhi   student        100000
1  45900.0  58.0   72000.0   Pune   student        100001
2  67500.0  58.0  294000.0  Delhi  salaried        100002
missing per column: {'income': 121, 'age': 0, 'loan': 0, 'city': 0, 'job': 42, 'applicant_id': 0}
output shape: (1000, 10)
['num__income' 'num__age' 'num__loan' 'cat__city_Delhi' 'cat__city_Jaipur'
 'cat__city_Mumbai' 'cat__city_Pune' 'cat__job_salaried' 'cat__job_self'
 'cat__job_student']
learnt medians: [47500.0, 44.0, 154000.0]</div>
  <p>Count the output columns by hand: 3 numeric (income, age, loan) + 4 cities + 3 jobs = 10, matching the shape (1000, 10). The applicant_id was dropped because <code>remainder="drop"</code> (the default) discards columns not listed; <code>remainder="passthrough"</code> would keep them unchanged. <code>make_column_selector(dtype_include=object)</code> picks the text columns by type, so new text columns are handled automatically. Names are prefixed with the step name (<code>num__</code>, <code>cat__</code>), and the medians learnt for imputation are stored inside the fitted step.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Columns listed by position (<code>[0, 1, 2]</code>) silently break when the input column order changes in production. Select by name on a DataFrame. And make sure every column is either listed or deliberately dropped; a forgotten new column is silently discarded by the default remainder.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: pipelines inside CV and grid search.</b> We now have one object for the whole preparation. But its choices (mean or median, locality in or out, how much ridge) were picked by us. How do we tune them together without leaking, and how do we name a parameter three levels deep?</div>


  <h2 id="pl-cv"><span class="num">11</span>Pipelines Inside Cross-Validation and Grid Search</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On the flats we could try mean vs median imputation, locality on or off, and four ridge strengths: 16 combinations. Each must be scored with every step re-learnt per fold. How does grid search reach inside the pipeline, and is the winner's score honest?</p>
  </div>
  <h3>Parameter names: step__param</h3>
  <p>Grid search needs to address a hyperparameter deep inside the pipeline. The rule: join the names along the path with double underscores. In <code>Pipeline([("pre", ColumnTransformer([("num", Pipeline([("impute", SimpleImputer()), …])), …])), ("clf", LogisticRegression())])</code>:</p>
  <ul>
    <li><code>clf__C</code>: the C of the step named clf.</li>
    <li><code>pre__num__impute__strategy</code>: pre → its transformer num → its step impute → parameter strategy.</li>
    <li><code>pre__num__log</code>: the whole step; set it to <code>"passthrough"</code> to try the pipeline without it.</li>
    <li><code>clf</code>: the whole model; give a list of estimators to compare model types in one search.</li>
  </ul>
  <p>Count the work by hand. Grid 1: 2 strategies × 2 log options × 3 values of C = 12 candidates. Grid 2: 1 model × 2 leaf sizes = 2. Total 14 candidates; with 5-fold CV, 14 × 5 = 70 pipeline fits, plus 1 refit of the winner on all training rows.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler
from loans import make_loans

df = make_loans()
X, y = df.drop(columns=["default", "applicant_id"]), df["default"]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

num = Pipeline([("impute", SimpleImputer()), ("log", FunctionTransformer(np.log1p)), ("scale", StandardScaler())])
cat = Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))])
pre = ColumnTransformer([("num", num, ["income", "age", "loan"]),
                         ("cat", cat, make_column_selector(dtype_include=object))])
pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])

grid = [
    {"pre__num__impute__strategy": ["mean", "median"],          # reach 3 levels deep
     "pre__num__log": [FunctionTransformer(np.log1p), "passthrough"],   # switch a step off
     "clf__C": [0.1, 1, 10]},
    {"clf": [RandomForestClassifier(n_estimators=200, random_state=0, n_jobs=1)],   # swap the model
     "clf__min_samples_leaf": [5, 20]},
]
gs = GridSearchCV(pipe, grid, cv=5, scoring="roc_auc", n_jobs=1).fit(Xtr, ytr)
print("candidates tried:", len(gs.cv_results_["params"]))
print("best CV AUC:", round(gs.best_score_, 3))
print("best params:", {k: (type(v).__name__ if hasattr(v, "fit") else v) for k, v in gs.best_params_.items()})
print("test AUC of refit best pipeline:", round(gs.score(Xte, yte), 3))
nested = cross_val_score(GridSearchCV(pipe, grid[0], cv=3, scoring="roc_auc", n_jobs=1),
                         Xtr, ytr, cv=3, scoring="roc_auc")
print("nested CV AUC (outer 3 x inner 3):", nested.round(3), "mean", nested.mean().round(3))</div>
  <div class="fx" data-lang="text">candidates tried: 14
best CV AUC: 0.792
best params: {'clf__C': 10, 'pre__num__impute__strategy': 'mean', 'pre__num__log': 'FunctionTransformer'}
test AUC of refit best pipeline: 0.831
nested CV AUC (outer 3 x inner 3): [0.755 0.802 0.796] mean 0.785</div>
  <p>Every one of the 70 fits re-learnt the imputer means/medians, the scaler and the one-hot categories on its own 4 training folds. The best combination (mean imputation, log kept, C = 10, CV AUC 0.792) is refit on all training rows; its test AUC is 0.831.</p>
  <h3>Why nested CV</h3>
  <p><code>best_score_</code> is the best of 14 CV scores, so it is optimistic (you picked the luckiest). For an honest estimate of "tune, then deploy", wrap the whole search in an outer CV: each outer training fold runs its own inner grid search, and the outer held-out fold scores the winner it never saw. By hand for the last line: 3 outer folds × (12 candidates × 3 inner folds + 1 refit) = 3 × 37 = 111 fits. The nested estimate here is 0.785, slightly below the 0.792 that the search reported for itself. Details in <a class="xref" data-note="ml_splits">Splits &amp; CV</a>.</p>
  <h3>On the flats</h3>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV, LeaveOneOut, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

flats = pd.DataFrame({"area_sqft": np.arange(500., 1500., 100.),
                      "locality": ["Hadapsar", "Baner", "Kothrud"] * 3 + ["Baner"],
                      "age": [12, 3, 8, 15, 5, 10, np.nan, 2, 7, 4]})
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
pre = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer()), ("scale", StandardScaler())]), ["area_sqft", "age"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])])
pipe = Pipeline([("pre", pre), ("model", Ridge())])
grid = {"model__alpha": [0.01, 0.1, 1, 10],                         # ridge strength
        "pre__num__impute__strategy": ["mean", "median"],            # three levels deep
        "pre__cat": [OneHotEncoder(handle_unknown="ignore"), "drop"]}  # locality on or off
gs = GridSearchCV(pipe, grid, cv=LeaveOneOut(), scoring="neg_mean_squared_error", n_jobs=1).fit(flats, price)
res = pd.DataFrame(gs.cv_results_)
res["locality"] = ["drop" if p == "drop" else "one-hot" for p in res.param_pre__cat]
res["mse"] = -res.mean_test_score
print("candidates:", len(res), "| fits:", len(res) * 10, "+ 1 refit")
print(res.sort_values("mse")[["param_model__alpha", "param_pre__num__impute__strategy", "locality", "mse"]]
      .head(4).round(2).to_string(index=False))
print("best LOOCV MSE (best_score_):", round(-gs.best_score_, 2))
nested = -cross_val_score(GridSearchCV(pipe, grid, cv=3, scoring="neg_mean_squared_error", n_jobs=1),
                          flats, price, cv=LeaveOneOut(), scoring="neg_mean_squared_error")
print("nested (outer LOO x inner 3-fold) MSE:", nested.mean().round(2))</div>
  <div class="fx" data-lang="text">candidates: 16 | fits: 160 + 1 refit
 param_model__alpha param_pre__num__impute__strategy locality  mse
               0.01                           median  one-hot 1.41
               0.01                             mean  one-hot 1.44
               0.10                           median  one-hot 1.63
               0.10                             mean  one-hot 1.64
best LOOCV MSE (best_score_): 1.41
nested (outer LOO x inner 3-fold) MSE: 1.63</div>
  <p>4 alphas × 2 strategies × 2 locality options = 16 candidates; with leave-one-out, 16 × 10 = 160 fits, plus 1 refit. Locality on is in every top row (it is the feature that matters), the lightest ridge wins, and median beats mean narrowly. The winner's own score, 1.41, is the best of 16 noisy estimates; nested CV (10 outer folds, each running its own 3-fold search: 10 × (16 × 3 + 1) = 490 fits) gives 1.63, the honest score of "tune, then deploy".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A grid over a pipeline gets expensive fast (multiply every list length, then by the number of folds). Start coarse, use <code>RandomizedSearchCV</code> for many parameters, cache slow transformers with <code>Pipeline(memory=…)</code>, and keep <code>n_jobs</code> sensible on a shared machine. Never tune on the test set; that is leakage through model selection.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: custom transformers.</b> Grid search can tune any step sklearn ships. Real projects need steps sklearn does not ship: clip area at a learnt cap, group rare localities. How do we write one that behaves inside pipelines, clones and searches?</div>


  <h2 id="pl-custom"><span class="num">12</span>Custom Transformers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The flats' model has never seen anything like the bungalow. Clipping area at a cap learnt from training flats would keep its prediction in range, but the cap must be learnt inside each fold, like any other statistic. How do we write a step that learns, and plays by the pipeline's rules?</p>
  </div>
  <h3>Stateless: FunctionTransformer</h3>
  <p>If a step learns nothing (a log, a ratio, a date split), wrap a function: <code>FunctionTransformer(func)</code>. It fits instantly and calls <code>func</code> on every transform.</p>
  <h3>Stateful: a class</h3>
  <p>If the step must learn from training rows (which categories are frequent, which quantiles to clip at), write a class. The rules that make it work with clone, Pipeline, cross-validation and grid search:</p>
  <ol>
    <li>Inherit <code>BaseEstimator</code> (gives <code>get_params</code>/<code>set_params</code>) and <code>TransformerMixin</code> (gives <code>fit_transform</code>).</li>
    <li><code>__init__</code> only stores its arguments under the same names. No validation, no computation: <code>clone</code> rebuilds the object from <code>get_params()</code>.</li>
    <li><code>fit(X, y=None)</code> learns, stores results in attributes ending with "_", and returns <code>self</code>.</li>
    <li><code>transform(X)</code> uses only those learnt attributes, and returns one row per input row.</li>
    <li>Optional: <code>get_feature_names_out</code> so names flow through <code>ColumnTransformer</code>; <code>check_is_fitted</code> for a clear error.</li>
  </ol>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.utils.validation import check_is_fitted
from sklearn.preprocessing import FunctionTransformer

# 1) stateless: a plain function is enough
ratio = FunctionTransformer(lambda d: d.assign(loan_to_income=d["loan"] / d["income"]))
print(ratio.fit_transform(pd.DataFrame({"loan": [300.], "income": [100.]})))

# 2) stateful: learns something in fit, so it must be a class
class RareGrouper(BaseEstimator, TransformerMixin):
    """Replace categories seen fewer than min_count times in TRAINING data by 'other'."""
    def __init__(self, min_count=2):
        self.min_count = min_count                 # hyperparameter: store as given, no logic here
    def fit(self, X, y=None):
        X = pd.DataFrame(X)
        self.keep_ = {c: sorted(X[c].value_counts()[lambda s: s &gt;= self.min_count].index) for c in X}
        self.feature_names_in_ = np.array(X.columns, dtype=object)
        return self                                # always return self
    def transform(self, X):
        check_is_fitted(self, "keep_")             # clear error if used before fit
        X = pd.DataFrame(X).copy()
        for c, keep in self.keep_.items():
            X[c] = X[c].where(X[c].isin(keep), "other")
        return X
    def get_feature_names_out(self, input_features=None):
        return self.feature_names_in_

train = pd.DataFrame({"city": ["Pune", "Pune", "Delhi", "Delhi", "Agra"]})
rg = RareGrouper(min_count=2).fit(train)
print("learnt:", rg.keep_)
print(rg.transform(pd.DataFrame({"city": ["Pune", "Agra", "Goa"]}))["city"].tolist())
print("get_params:", rg.get_params(), "| clone-able, so GridSearchCV can tune rg__min_count")
try:
    RareGrouper().transform(train)
except Exception as e:
    print(type(e).__name__)</div>
  <div class="fx" data-lang="text">    loan  income  loan_to_income
0  300.0   100.0             3.0
learnt: {'city': ['Delhi', 'Pune']}
['Pune', 'other', 'other']
get_params: {'min_count': 2} | clone-able, so GridSearchCV can tune rg__min_count
NotFittedError</div>
  <p>The grouper learnt from training data that Pune and Delhi appear at least twice; Agra (once) and Goa (never seen) both become "other" at transform time, using the training decision, not the new data's counts. Because <code>min_count</code> is a constructor parameter visible to <code>get_params</code>, a grid search can tune it as <code>step__min_count</code>. Calling transform before fit raises <code>NotFittedError</code> instead of a confusing crash.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing statistics inside <code>transform</code> (for example, frequencies of the batch being transformed) re-creates the fit_transform-on-test bug: a single production row would always look "rare". All learning goes in <code>fit</code>. And a <code>lambda</code> inside <code>FunctionTransformer</code> cannot be saved with pickle or joblib (only cloudpickle handles it); use named, importable functions in pipelines you will save.</p>
  </div>
  <h3>On the flats: a learnt clipper</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin, clone
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.utils.validation import check_is_fitted

def to_hundreds(X):                       # stateless: a named function (saveable, unlike a lambda)
    return np.asarray(X, dtype=float) / 100

class QuantileClipper(BaseEstimator, TransformerMixin):
    """Clip each column to the [low, high] quantiles learnt from TRAINING rows."""
    def __init__(self, low=0.05, high=0.95):
        self.low, self.high = low, high              # store as given: no logic in __init__
    def fit(self, X, y=None):
        X = np.asarray(X, dtype=float)
        self.lo_, self.hi_ = np.quantile(X, self.low, axis=0), np.quantile(X, self.high, axis=0)
        return self                                  # always return self
    def transform(self, X):
        check_is_fitted(self, "lo_")
        return np.clip(np.asarray(X, dtype=float), self.lo_, self.hi_)

sqft = np.arange(500., 1500., 100.)[:, None]                 # the ten flats, as the portal stores them
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
pipe = make_pipeline(FunctionTransformer(to_hundreds), QuantileClipper(), LinearRegression()).fit(sqft, price)
clip = pipe["quantileclipper"]
print("learnt from the ten flats: lo_", clip.lo_, "hi_", clip.hi_)
print("bungalow 5,000 sq ft -&gt; clipped to", clip.transform(to_hundreds([[5000.]])).ravel(),
      "-&gt; predicted", pipe.predict([[5000.]]).round(1))
plain = make_pipeline(FunctionTransformer(to_hundreds), LinearRegression()).fit(sqft, price)
print("without the clipper, predicted", plain.predict([[5000.]]).round(1))
print("get_params:", clip.get_params(), "| clone keeps params, drops learnt state:",
      clone(clip).get_params() == clip.get_params(), hasattr(clone(clip), "lo_"))
try:
    QuantileClipper().transform(sqft)
except Exception as e:
    print(type(e).__name__)</div>
  <div class="fx" data-lang="text">learnt from the ten flats: lo_ [5.45] hi_ [13.55]
bungalow 5,000 sq ft -&gt; clipped to [13.55] -&gt; predicted [92.4]
without the clipper, predicted [310.]
get_params: {'high': 0.95, 'low': 0.05} | clone keeps params, drops learnt state: True False
NotFittedError</div>
  <p>A stateless <code>FunctionTransformer</code> converts sq ft to hundreds (a named function, so the pipeline can be saved). The clipper learns the 5th and 95th percentiles of training areas, 5.45 and 13.55, in <code>fit</code>, and only applies them in <code>transform</code>. The bungalow is predicted at ₹92.4 lakh instead of 310: clipping trades a wild extrapolation for a capped one. Its real price, 400, shows that neither is right; the honest answer is "outside what this model knows", which a range check should flag. <code>clone</code> keeps the parameters and drops the learnt <code>lo_</code>/<code>hi_</code>, which is what makes it safe inside CV.</p>
  <div class="bridge"><b>What this still can't tell us → next: saving pipelines.</b> The pipeline now holds everything learnt: medians, scaler statistics, categories, caps, weights. How do we move that exact object from the notebook to a server?</div>


  <h2 id="pl-save"><span class="num">13</span>Saving Pipelines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The tuned flats pipeline lives in a Python session. A pricing service needs it tomorrow, on another machine. What must be saved so the server computes exactly what was validated, and what can go wrong when it is loaded?</p>
  </div>
  <p>Save the <strong>whole fitted pipeline</strong>, not just the model: the imputer medians, scaler statistics, category lists and model weights are all part of "the model". Saving only the final estimator forces someone to re-implement preprocessing at serving time, which is how train/serve skew is born.</p>
  <div class="fx" data-lang="py">import os, tempfile, joblib, sklearn
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X, y)
path = os.path.join(tempfile.mkdtemp(), "model.joblib")
joblib.dump({"pipeline": pipe, "sklearn_version": sklearn.__version__,
             "features": X.shape[1], "trained_on_rows": len(X)}, path)
print(f"saved {os.path.getsize(path):,} bytes")
bundle = joblib.load(path)                                  # ONLY load files you trust
same = np.array_equal(bundle["pipeline"].predict_proba(X), pipe.predict_proba(X))
print("version", bundle["sklearn_version"], "| predictions identical after reload:", same)</div>
  <div class="fx" data-lang="text">saved 2,376 bytes
version 1.9.1 | predictions identical after reload: True</div>
  <p>Store metadata with it (library versions, training date, feature list, data snapshot, CV score) so you can tell later what produced the file. Reloaded predictions are identical.</p>
  <h3>On the flats</h3>
  <div class="fx" data-lang="py">import os, tempfile, joblib, sklearn
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

flats = pd.DataFrame({"area": np.arange(5., 15.), "locality": ["Hadapsar", "Baner", "Kothrud"] * 3 + ["Baner"]})
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
pipe = make_pipeline(ColumnTransformer([("num", StandardScaler(), ["area"]),
                                        ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])]),
                     Ridge(alpha=0.01)).fit(flats, price)
path = os.path.join(tempfile.mkdtemp(), "flats_price.joblib")
joblib.dump({"pipeline": pipe, "sklearn_version": sklearn.__version__, "features": list(flats.columns),
             "trained_on": "flats A-J", "target": "asking price, Rs lakh"}, path)
print(f"saved {os.path.getsize(path):,} bytes")
bundle = joblib.load(path)                                  # ONLY load files you trust
new = pd.DataFrame({"area": [6.4, 8.7, 10.3, 13.6], "locality": ["Baner", "Kothrud", "Hadapsar", "Wakad"]})
a, b = pipe.predict(new), bundle["pipeline"].predict(new)
print("predictions K..N:", a.round(1).tolist(), "| identical after reload:", np.array_equal(a, b))
print("version", bundle["sklearn_version"], "| features", bundle["features"])</div>
  <div class="fx" data-lang="text">saved 2,923 bytes
predictions K..N: [51.5, 61.8, 68.9, 90.4] | identical after reload: True
version 1.9.1 | features ['area', 'locality']</div>
  <p>One file holds the column transformer (scaler statistics, the three localities) and the ridge weights, plus the metadata needed to reproduce it. The reloaded pipeline gives identical predictions for K–N; flat N, listed in Wakad, gets no locality premium because the saved encoder ignores unknown categories, a behaviour that was decided at training time and travels with the file.</p>
  <table class="tbl">
    <tr><th>Format</th><th>Pros</th><th>Cons</th></tr>
    <tr><td>joblib / pickle</td><td>one line; saves anything Python</td><td><strong>loading runs arbitrary code</strong>: never load untrusted files; needs the same library versions</td></tr>
    <tr><td>skops (<code>skops.io</code>)</td><td>safer: inspects types before loading</td><td>extra dependency; sklearn-focused</td></tr>
    <tr><td>ONNX (<code>skl2onnx</code>)</td><td>language-independent, fast runtimes</td><td>not every transformer converts</td></tr>
    <tr><td>Model registry (MLflow)</td><td>versions, metadata, stage transitions</td><td>infrastructure (<a class="xref" data-note="mlops_mlflow">MLflow</a>)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A pickle made with one scikit-learn version may fail, or worse, load and behave differently under another. Pin versions in the serving environment (requirements file or container image) to the ones recorded in the metadata, and re-run a few stored predictions after loading as a smoke test.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: train/serve skew.</b> Saving guarantees the model is the same. It does not guarantee the input is: the serving code still builds the row it passes in. What happens when serving computes a feature differently?</div>


  <h2 id="pl-skew"><span class="num">14</span>Train/Serve Skew</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The saved flats pipeline expects area in hundreds of sq ft and localities spelled as in training. The mobile app sends square feet and lower-case names. Nothing crashes. What does the model say, and how would anyone notice?</p>
  </div>
  <h3>What it is</h3>
  <p><strong>Train/serve skew</strong> is a difference between the features the model was trained on and the features it receives in production, caused by the system rather than by the world changing. Typical causes: the serving team re-implements preprocessing in another language; units differ (rupees vs thousands); a step is skipped; categories are spelled differently; a feature is computed from a fresher or staler table than in training; or a scaler is refit on the live batch. It is the production twin of leakage: leakage makes offline scores too optimistic, skew makes online behaviour different from what was tested.</p>
  <h3>Measured</h3>
  <p>A loan-default pipeline (log → scale → logistic regression) trained on 3,000 applicants. 1,000 more arrive "live". Then two realistic serving bugs:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler

rng = np.random.default_rng(0)
n = 4000
income = rng.lognormal(10.8, 0.6, n)                  # rupees per month
loan = rng.lognormal(12, 0.6, n)
default = (rng.random(n) &lt; 1 / (1 + np.exp(-(2 * (np.log(loan) - np.log(income)) - 2.5)))).astype(int)
X = np.c_[income, loan]
pipe = make_pipeline(FunctionTransformer(np.log), StandardScaler(), LogisticRegression())
pipe.fit(X[:3000], default[:3000])
Xlive, ylive = X[3000:], default[3000:]
print(f"offline accuracy on held-out rows        : {accuracy_score(ylive, pipe.predict(Xlive)):.3f}")

# Skew 1: the serving team re-implemented the features and sends income in THOUSANDS
served = Xlive.copy(); served[:, 0] = served[:, 0] / 1000
print(f"live accuracy, income sent in thousands  : {accuracy_score(ylive, pipe.predict(served)):.3f}")
# Skew 2: the serving code skipped the log step and called the rest of the pipeline
print(f"live accuracy, log step skipped          : {accuracy_score(ylive, pipe[1:].predict(Xlive)):.3f}")

# A cheap guard: compare live feature statistics with training ones
train_med, live_med = np.median(X[:3000], axis=0), np.median(served, axis=0)
print("median ratio live/train per feature:", (live_med / train_med).round(3).tolist(), "-&gt; alert if far from 1")</div>
  <div class="fx" data-lang="text">offline accuracy on held-out rows        : 0.758
live accuracy, income sent in thousands  : 0.464
live accuracy, log step skipped          : 0.557
median ratio live/train per feature: [0.001, 1.016] -&gt; alert if far from 1</div>
  <p>By hand for the first bug: an income of ₹50,000 has log 10.82, close to the training mean of the logs (10.78, std 0.60). Sent as 50 (thousands), its log is 3.91, which the scaler turns into (3.91 − 10.78)/0.60 ≈ −11.5 standard deviations: an applicant poorer than anyone ever seen. The model flags every applicant as a defaulter, and accuracy collapses from 0.758 to 0.464 (the share of real defaulters). Skipping the log step does almost as much damage (0.557). Nothing crashed; no error was logged. The cheap guard at the bottom compares live and training medians per feature: a ratio of 0.001 for income is an alarm.</p>
  <div class="cards">
    <div><b>One object</b><p>Serve the same fitted pipeline that was validated; never re-implement preprocessing.</p><small>joblib/ONNX artefact + pinned versions</small></div>
    <div><b>Shared feature code</b><p>One feature definition used by training and serving (a feature store, or one library).</p><small>Removes "two implementations" skew</small></div>
    <div><b>Schema checks</b><p>Validate column names, types, units, ranges and allowed categories at the serving boundary.</p><small>Reject or alert on violations</small></div>
    <div><b>Log and compare</b><p>Log served features; compare their distributions with training (medians, PSI) and replay logged rows offline.</p><small>Catches skew and drift (<a class="xref" data-note="sd_monitoring">Monitoring</a>)</small></div>
  </div>
  <h3>On the flats</h3>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

flats = pd.DataFrame({"area": np.arange(5., 15.), "locality": ["Hadapsar", "Baner", "Kothrud"] * 3 + ["Baner"]})
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96.])
pipe = make_pipeline(ColumnTransformer([("num", StandardScaler(), ["area"]),
                                        ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"])]),
                     Ridge(alpha=0.01)).fit(flats, price)
live = pd.DataFrame({"area": [9.], "locality": ["Baner"]})            # a flat just like E (true price 67)
print(f"same pipeline, correct input           : {pipe.predict(live)[0]:7.1f}")
print(f"skew 1: area sent in sq ft (900)        : {pipe.predict(live.assign(area=900.))[0]:7.1f}")
print(f"skew 2: locality spelled 'baner'        : {pipe.predict(live.assign(locality='baner'))[0]:7.1f}")
# skew 3: the serving team re-implemented scaling and refit it on the live batch of one row
z = StandardScaler().fit_transform(live[["area"]])                    # always 0 for a single row
onehot = pipe[0].named_transformers_["cat"].transform(live[["locality"]]).toarray()
print(f"skew 3: scaler refit on the live row    : {pipe[-1].predict(np.c_[z, onehot])[0]:7.1f}")
# cheap guards at the serving boundary
batch = pd.DataFrame({"area": [900., 1100., 750.], "locality": ["baner", "Kothrud", "Baner"]})
known = pipe[0].named_transformers_["cat"].categories_[0]
print("guard: median area ratio live/train =", round(batch.area.median() / flats.area.median(), 1),
      "| unknown localities:", sorted(set(batch.locality) - set(known)))</div>
  <div class="fx" data-lang="text">same pipeline, correct input           :    66.5
skew 1: area sent in sq ft (900)        :  5208.3
skew 2: locality spelled 'baner'        :    63.8
skew 3: scaler refit on the live row    :    69.4
guard: median area ratio live/train = 94.7 | unknown localities: ['baner']</div>
  <p>A flat like E (area 9, Baner) is priced at 66.5. Sent as 900 sq ft, it becomes (900 − 9.5)/2.872 ≈ 310 standard deviations of area and ₹5,208 lakh. Spelled "baner", it is an unknown category, gets all-zero locality columns and loses the Baner premium (63.8). A serving team that re-implements scaling and refits it on the single live row always gets z = 0, as if every flat were 950 sq ft (69.4). The guard at the bottom catches the first two before any prediction is trusted: a live/train median ratio of 94.7 and an unknown locality.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Skew vs drift</strong>: <strong>skew</strong> is a mismatch created by the pipeline (training and serving compute features differently); fix the code. <strong>Data drift</strong> is the world changing (new customer mix, inflation); the code is right but the data moved, so retrain or recalibrate. <strong>Concept drift</strong>: the relationship between features and target changed. All three show up as "live performance below offline performance" and are told apart by logging features and comparing them with training.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Fourteen sections: five leaks, two checks, and the machinery that prevents them from notebook to server. How do they fit into one picture, and which one answers which question?</div>


  <h2 id="pl-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Leaks, checks, fit/transform, Pipeline, ColumnTransformer, grid search, custom steps, saving, skew: a list of separate tips, or one path from a raw table to a served prediction where each idea guards one place a leak can enter?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="pl-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">raw table</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="9.5">as-of columns only</text>
<line x1="160" y1="33" x2="198" y2="33" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="200" y="10" width="150" height="46" rx="7" class="fb sb"/><text x="275" y="29" text-anchor="middle" font-size="11.5" font-weight="700">split FIRST</text><text x="275" y="45" text-anchor="middle" class="tm" font-size="9.5">time / group aware</text>
<line x1="350" y1="33" x2="388" y2="33" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="390" y="10" width="280" height="46" rx="7" class="fb sb"/><text x="530" y="29" text-anchor="middle" font-size="11.5" font-weight="700">GridSearchCV (nested for the score)</text><text x="530" y="45" text-anchor="middle" class="tm" font-size="9.5">step__param · 16 candidates × 10 folds</text>
<line x1="530" y1="56" x2="530" y2="84" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="200" y="86" width="470" height="92" rx="8" class="fg sg" fill-opacity="0.35"/>
<text x="435" y="103" text-anchor="middle" font-size="11.5" font-weight="700">Pipeline: fit on training rows, transform the rest</text>
<rect x="212" y="112" width="140" height="56" rx="6" class="ft st"/><text x="282" y="131" text-anchor="middle" font-size="10.5" font-weight="700">ColumnTransformer</text><text x="282" y="146" text-anchor="middle" class="tm" font-size="9.5">impute · scale · one-hot</text><text x="282" y="159" text-anchor="middle" class="tm" font-size="9.5">target-encode (cross-fit)</text>
<line x1="352" y1="140" x2="368" y2="140" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="370" y="112" width="130" height="56" rx="6" class="ft st"/><text x="435" y="131" text-anchor="middle" font-size="10.5" font-weight="700">custom steps</text><text x="435" y="146" text-anchor="middle" class="tm" font-size="9.5">clipper, rare grouper</text><text x="435" y="159" text-anchor="middle" class="tm" font-size="9.5">learn in fit only</text>
<line x1="500" y1="140" x2="516" y2="140" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="518" y="112" width="140" height="56" rx="6" class="ft st"/><text x="588" y="131" text-anchor="middle" font-size="10.5" font-weight="700">model</text><text x="588" y="146" text-anchor="middle" class="tm" font-size="9.5">ridge, alpha tuned</text><text x="588" y="159" text-anchor="middle" class="tm" font-size="9.5">best 1.41 · nested 1.63</text>
<line x1="435" y1="178" x2="435" y2="206" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="200" y="208" width="200" height="44" rx="7" class="fb sb"/><text x="300" y="226" text-anchor="middle" font-size="11.5" font-weight="700">save the whole object</text><text x="300" y="241" text-anchor="middle" class="tm" font-size="9.5">joblib + versions + features</text>
<line x1="400" y1="230" x2="468" y2="230" stroke="currentColor" marker-end="url(#pl-c9)"/>
<rect x="470" y="208" width="200" height="44" rx="7" class="fb sb"/><text x="570" y="226" text-anchor="middle" font-size="11.5" font-weight="700">serve the same object</text><text x="570" y="241" text-anchor="middle" class="tm" font-size="9.5">schema + range guards, logging</text>
<rect x="10" y="80" width="170" height="240" rx="8" class="fr sr" fill-opacity="0.35"/>
<text x="95" y="98" text-anchor="middle" font-size="11" font-weight="700">where leaks enter (flats)</text>
<text x="20" y="120" font-size="10">future column → 0.80 vs 7.25</text>
<text x="20" y="142" font-size="10">scaler / selector on all</text>
<text x="30" y="156" font-size="10">rows → 162.7 vs 788.9</text>
<text x="20" y="178" font-size="10">target mean → 1.68 vs 3.69</text>
<text x="20" y="200" font-size="10">whole-year mean → 2.24</text>
<text x="30" y="214" font-size="10">(as-of 29.04)</text>
<text x="20" y="236" font-size="10">relisted → 0.00 vs 33.79</text>
<text x="20" y="258" font-size="10">fit_transform on live rows</text>
<text x="20" y="280" font-size="10">sq ft at serving → 5,208</text>
<text x="20" y="302" class="tm" font-size="9.5">check: shuffled labels</text>
<line x1="180" y1="120" x2="198" y2="40" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pl-c9)"/>
<line x1="180" y1="160" x2="210" y2="140" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pl-c9)"/>
<line x1="180" y1="280" x2="468" y2="246" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pl-c9)"/>
<text x="435" y="290" text-anchor="middle" class="tm" font-size="10.5">every learnt number (median, mean_, categories_, cap, weight)</text>
<text x="435" y="306" text-anchor="middle" class="tm" font-size="10.5">is learnt once per training fold and reused unchanged everywhere else</text>
</svg><figcaption>One path. Columns are checked for "known at prediction time", the split comes first and matches production (time, groups), every learnt step lives inside one Pipeline that grid search refits per fold, and the same fitted object is saved and served behind input guards. The red panel lists where each leak entered on the ten flats; each box on the path is the place that blocks it.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the ten flats</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our flats</th><th>When to use</th></tr>
    <tr><td>Leakage (the one question)</td><td>"known at prediction time, computed this way?"</td><td>is this score honest?</td><td>final sale price: LOOCV 0.80 vs honest 7.25</td><td>every column, every step</td></tr>
    <tr><td>Steps inside the split</td><td>fit on training rows only</td><td>can a step see held-out rows?</td><td>bungalow z 18.11 (leaky 2.79); noise column 788.9 (leaky 162.7)</td><td>every learnt step</td></tr>
    <tr><td>Out-of-fold target encoding</td><td>cross-fitting + smoothing</td><td>can a row see its own label?</td><td>1.68 leaky vs 3.69 honest (median)</td><td>many categories</td></tr>
    <tr><td>Time-aware split, as-of features</td><td>forward chaining, past-only windows</td><td>does the future train the past?</td><td>year mean 2.24 vs as-of 29.04; area only 6.91</td><td>anything with timestamps</td></tr>
    <tr><td>Group split, dedupe</td><td>entity ids</td><td>is one entity on both sides?</td><td>4-NN 0.00 vs 33.79; line 5.64 vs 7.25</td><td>repeated entities, relistings</td></tr>
    <tr><td>Shuffled-label check</td><td>permuted target</td><td>does the procedure invent signal?</td><td>selection before CV wins 20 of 20; naive encoding 7 of 20 (missed)</td><td>before trusting any score</td></tr>
    <tr><td>fit / transform</td><td>attributes ending in _</td><td>what is learnt, what is applied?</td><td>A–H: 8.5, 2.291; I, J → 1.964, 2.400; bug [−1, 1]</td><td>always</td></tr>
    <tr><td>Pipeline</td><td>named chain of steps</td><td>one object for CV and serving?</td><td>5-fold mean 5.31; K–N 48.4 … 91.6</td><td>always</td></tr>
    <tr><td>ColumnTransformer</td><td>per-column pipelines</td><td>different steps per column?</td><td>(10, 5); medians 950, 7; Wakad → zeros</td><td>mixed tables</td></tr>
    <tr><td>Grid search + nested CV</td><td>step__param keys, outer loop</td><td>tune everything together, honestly?</td><td>16 × 10 + 1 fits; best 1.41, nested 1.63</td><td>any tuning</td></tr>
    <tr><td>Custom transformer</td><td>BaseEstimator + TransformerMixin</td><td>a learnt step sklearn lacks?</td><td>clipper hi_ 13.55; bungalow 92.4 not 310</td><td>domain steps</td></tr>
    <tr><td>Saving</td><td>joblib + metadata</td><td>ship exactly what was validated?</td><td>2,923 bytes; identical K–N predictions</td><td>deployment</td></tr>
    <tr><td>Skew guards</td><td>schema, ranges, statistics</td><td>does serving compute the same features?</td><td>sq ft → 5,208.3; ratio 94.7; "baner" unknown</td><td>production</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a score is honest only if every number the model uses was learnt from rows and columns that will exist at prediction time, and a Pipeline makes that true by construction, from cross-validation to the server.</strong> On the flats, five different leaks each produced a better-looking number (0.80, 162.7, 1.68, 2.24, 0.00) and each honest replacement was worse; the pipeline is what makes the honest number the only one you can compute.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons and Checklist.</b> The picture shows where each leak enters. Side by side, how big was each leak, did a random split catch it, and what is the fix? And what should be checked before any score is trusted?</div>

  <h2 id="pl-compare"><span class="num">16</span>Comparisons and Checklist</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each leak was measured once at scale and once on the flats. Laid side by side, which ones are large, which ones does an ordinary random split catch, and which single fix covers each?</p>
  </div>
  <h3>The five leaks side by side</h3>
  <table class="tbl">
    <tr><th>Leak</th><th>Leaky score</th><th>Honest score</th><th>Caught by a random split?</th><th>Fix</th></tr>
    <tr><td>Selection before CV (noise)</td><td>0.85 acc</td><td>0.48</td><td>no (it is the cause)</td><td>selector inside the pipeline</td></tr>
    <tr><td>Scaler before CV</td><td>+0.0004 acc</td><td>–</td><td>no</td><td>scaler inside the pipeline</td></tr>
    <tr><td>Target encoding before split</td><td>0.902 AUC</td><td>0.711</td><td>no</td><td>cross-fitted TargetEncoder in the pipeline</td></tr>
    <tr><td>Random split on time series</td><td>MAE 6.2</td><td>13.4</td><td>no (it is the cause)</td><td>TimeSeriesSplit, past-only features</td></tr>
    <tr><td>Near-duplicate visits</td><td>0.991 acc</td><td>0.482</td><td>no (it is the cause)</td><td>GroupKFold, dedupe</td></tr>
    <tr><td>Future feature</td><td>0.984 acc</td><td>0.832</td><td>no</td><td>as-of features; domain review</td></tr>
  </table>
  <h3>The same leaks on the ten flats</h3>
  <table class="tbl">
    <tr><th>Leak</th><th>Leaky LOOCV MSE</th><th>Honest</th><th>Fix</th></tr>
    <tr><td>Noise column selected with all prices</td><td>162.7</td><td>788.9 (mean: 372.3)</td><td>selector inside the pipeline</td></tr>
    <tr><td>Locality mean on all flats</td><td>1.68</td><td>3.69 (median)</td><td>TargetEncoder inside the pipeline</td></tr>
    <tr><td>Whole-year locality mean (forward chaining)</td><td>2.24</td><td>29.04 (area alone 6.91)</td><td>as-of features; drop if noisy</td></tr>
    <tr><td>Relisted flats, 4-NN</td><td>0.00</td><td>33.79</td><td>group split by flat; dedupe</td></tr>
    <tr><td>Final sale price</td><td>0.80</td><td>7.25</td><td>remove; as-of snapshots</td></tr>
  </table>
  <h3>Hand-rolled preprocessing vs Pipeline</h3>
  <table class="tbl">
    <tr><th></th><th>Steps by hand</th><th>Pipeline + ColumnTransformer</th></tr>
    <tr><td>Contamination in CV</td><td>easy to cause, invisible</td><td>impossible by construction</td></tr>
    <tr><td>Tuning preprocessing</td><td>manual loops</td><td>grid keys <code>step__param</code></td></tr>
    <tr><td>Serving</td><td>re-implement every step (skew risk)</td><td>one saved object</td></tr>
    <tr><td>Unseen categories, NaN</td><td>custom code</td><td>handled by the fitted steps</td></tr>
    <tr><td>Row-changing steps (SMOTE)</td><td>possible</td><td>needs imbalanced-learn's Pipeline</td></tr>
  </table>
  <h3>Before trusting a score</h3>
  <ol>
    <li>Is the split the same shape as production (time order, new entities)?</li>
    <li>Is every learnt step inside the pipeline that is cross-validated?</li>
    <li>For every feature: known at prediction time, computed the same way?</li>
    <li>Duplicates and entities checked across the split?</li>
    <li>Test set touched exactly once, at the end?</li>
    <li>Shuffled-label run gives chance-level scores?</li>
  </ol>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The tables say what to do. Most leaks, though, come from a handful of everyday code habits and interview slips. Which ones?</div>


  <h2 id="pl-traps"><span class="num">17</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each trap below is a line of code that looks reasonable and runs without error. Which ones produced the flats' fake numbers, and what does the safe version look like?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fit before split</span>
    <p><code>StandardScaler().fit_transform(X)</code>, <code>SelectKBest(...).fit(X, y)</code>, <code>SMOTE().fit_resample(X, y)</code> on the full table before <code>train_test_split</code> or CV. Move them into the pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fit_transform on test or live data</span>
    <p>Re-learns statistics from the new rows ([8, 10] became [−1, 1]); a single live row becomes 0. Only <code>transform</code>/<code>predict</code> on anything but training data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: global groupby features</span>
    <p><code>df.groupby("user").amount.transform("mean")</code> over all rows uses other rows' (and future) data, and for target columns it is target leakage. Compute aggregates inside the training fold or as-of the prediction time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: random splits for time or grouped data</span>
    <p>Use TimeSeriesSplit or GroupKFold. A random split rewarded memorisation (0.991 on unrelated labels) and interpolation (MAE 6.2 vs 13.4).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tuning on the test set</span>
    <p>Every decision made by looking at test scores leaks a little of the test set into the model. Tune with CV on training data; nested CV for an honest tuned estimate.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong grid key</span>
    <p><code>{"C": [...]}</code> on a pipeline raises "Invalid parameter". It must be <code>{"clf__C": [...]}</code>, with the step name and a double underscore. <code>pipe.get_params().keys()</code> lists every valid key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: saving only the model</span>
    <p>The scaler means, medians and category lists are part of the model. Save the fitted pipeline with version metadata.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unpinned versions and untrusted pickles</span>
    <p>Pickles may misbehave across library versions, and loading one runs code. Pin versions; load only your own artefacts; consider skops or ONNX.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a feature built from the whole history</span>
    <p>A locality average over the whole year looked excellent on the flats (2.24) and its honest as-of version made the model worse (29.04 vs 6.91 for area alone). Build features as of the prediction moment, then check they still help.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting a shuffled-label pass on tiny data</span>
    <p>The check caught selection before CV (20 of 20) but not naive locality encoding on ten flats (7 of 20, same as honest). Passing it is not proof; prevention by pipeline is.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet, then <a class="xref" data-note="ml_regression">Regression</a>.</b> The Foundations group ends here with everything a model needs: an honest split, a sense of bias and variance, a loss and an optimiser, a penalty, engineered features, and a pipeline that keeps them all honest. What do actual model families do with that, starting with the line the flats have been fitting all along?</div>

  <h2 id="pl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: ten flats A–J, area 5 … 14 (hundred sq ft), price 38, 49, 53, 56, 67, 68, 73, 83, 87, 96 (₹ lakh), locality Hadapsar (A, D, G), Baner (B, E, H, J), Kothrud (C, F, I), listed one per month B, D, A, F, C, G, I, E, H, J; least-squares line 6 × area + 10; area-only LOOCV MSE 7.25.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our flats</th><th>Weakness → next</th></tr>
    <tr><td>Leakage</td><td>when is a score a lie?</td><td>final sale price: 0.80 vs 7.25</td><td>which steps leak?</td></tr>
    <tr><td>Preprocessing</td><td>can unsupervised / supervised steps leak?</td><td>bungalow z 2.79 vs 18.11; noise 162.7 vs 788.9</td><td>steps built from y</td></tr>
    <tr><td>Target encoding</td><td>own label in own feature?</td><td>J 73.75 vs 66.33; 1.68 vs 3.69</td><td>order in time</td></tr>
    <tr><td>Time</td><td>future trains past?</td><td>year mean 2.24; as-of 29.04; area 6.91</td><td>same entity twice</td></tr>
    <tr><td>Groups</td><td>entity on both sides?</td><td>4-NN 0.00 vs 33.79</td><td>columns written later</td></tr>
    <tr><td>Future features</td><td>known at prediction time?</td><td>sale price weight 0.861; 0.80</td><td>unknown unknowns</td></tr>
    <tr><td>Detection</td><td>can we test for leaks?</td><td>shuffle: 20/20 vs 7/20 (and 7/20 missed)</td><td>prevention needed</td></tr>
    <tr><td>fit / transform</td><td>what is learnt?</td><td>8.5, 2.291 → 1.964, 2.400; bug [−1, 1]</td><td>enforcing it everywhere</td></tr>
    <tr><td>Pipeline</td><td>one honest object?</td><td>fit on 8, transform 2; K–N 48.4 … 91.6</td><td>mixed columns</td></tr>
    <tr><td>ColumnTransformer</td><td>per-column steps?</td><td>(10, 5); medians 950, 7</td><td>tuning choices</td></tr>
    <tr><td>Grid / nested CV</td><td>tune honestly?</td><td>161 fits; 1.41 vs nested 1.63</td><td>missing steps</td></tr>
    <tr><td>Custom transformer</td><td>our own learnt step?</td><td>hi_ 13.55; bungalow 92.4</td><td>shipping it</td></tr>
    <tr><td>Saving</td><td>same object in production?</td><td>2,923 bytes; identical</td><td>inputs can differ</td></tr>
    <tr><td>Skew</td><td>same features at serving?</td><td>sq ft → 5,208.3; guard ratio 94.7</td><td>→ model families</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Data leakage</td><td>Using, in training or model selection, information not available at prediction time.</td></tr>
    <tr><td>Train–test contamination</td><td>A learnt step (scaler, selector, encoder, imputer, sampler) fitted on rows that should be unseen.</td></tr>
    <tr><td>Target leakage</td><td>A feature that is a consequence of the target or recorded after it (final sale price).</td></tr>
    <tr><td>As-of feature</td><td>A feature computed only from data that existed at the prediction moment.</td></tr>
    <tr><td>Group leakage</td><td>The same entity (flat, patient, customer) in both training and validation.</td></tr>
    <tr><td>fit / transform / fit_transform</td><td>Learn and store attributes ending in _ / apply them / both on the same (training) rows.</td></tr>
    <tr><td>Pipeline</td><td>Named chain of transformers ending in an estimator; fit = fit_transform each step then fit the last; predict = transform each then predict.</td></tr>
    <tr><td>ColumnTransformer</td><td>Applies (name, transformer, columns) triples and stacks the outputs; remainder drops or passes the rest.</td></tr>
    <tr><td>step__param</td><td>Grid-search key naming a parameter along the path of step names (pre__num__impute__strategy).</td></tr>
    <tr><td>Nested CV</td><td>An outer CV around the whole search, giving an honest score for "tune, then deploy".</td></tr>
    <tr><td>Train/serve skew vs drift</td><td>Serving computes features differently (fix the code) vs the world changed (retrain).</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and our numbers</th></tr>
    <tr><td>Scale with training statistics</td><td>z = (x − mean_train)/std_train</td><td>bungalow (50 − 8.5)/2.291 = 18.11; leaky (50 − 13.11)/13.22 = 2.79</td></tr>
    <tr><td>Predict-the-mean LOOCV MSE</td><td>(n/(n − 1))² × variance (÷ n)</td><td>(10/9)² × 301.6 = 372.3</td></tr>
    <tr><td>Leave-one-out category mean</td><td>(sum_c − y_i)/(n_c − 1)</td><td>J: (295 − 96)/3 = 66.33 vs 73.75 with itself</td></tr>
    <tr><td>Smoothed target encoding</td><td>(n_c · mean_c + m · global)/(n_c + m)</td><td>Baner, m = 2: (4 × 73.75 + 2 × 67)/6 = 71.5</td></tr>
    <tr><td>Chance all duplicates follow a test row</td><td>Π over siblings of (test − 1 − j)/(N − 1 − j)</td><td>(159/799)(158/798)(157/797) ≈ 0.0078</td></tr>
    <tr><td>Grid fits</td><td>candidates × folds + 1</td><td>16 × 10 + 1 = 161</td></tr>
    <tr><td>Nested fits</td><td>outer × (candidates × inner + 1)</td><td>10 × (16 × 3 + 1) = 490</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Pipeline</b><p>Always, as soon as any step learns from data; it is also the serving artefact.</p><small>imbalanced-learn's Pipeline for samplers</small></div>
    <div><b>Group / time split</b><p>Repeated entities or timestamps: GroupKFold, TimeSeriesSplit, forward chaining.</p><small>Random KFold only for independent rows</small></div>
    <div><b>Nested CV</b><p>When you report the score of a tuned model.</p><small>Not needed to pick the final hyperparameters</small></div>
    <div><b>Shuffled-label check</b><p>Cheap alarm for big leaks in the whole procedure.</p><small>Weak on tiny data; not a proof of honesty</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>fit or fit_transform before the split; fit_transform on test or live rows; global groupby / whole-history features; random splits for time or grouped data; tuning on the test set; grid keys without step__; saving only the model; lambdas in saved pipelines; unpinned versions and untrusted pickles; serving code that re-implements features.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Scaler fit on A–H (mean 8.5, std 2.291): transform flat J (14).</td><td>5.5/2.2913 = 2.400</td></tr>
    <tr><td>Baner prices 49, 67, 83, 96: B's locality mean without itself?</td><td>(67 + 83 + 96)/3 = 82</td></tr>
    <tr><td>4 alphas × 2 imputers × 2 locality options, leave-one-out on ten flats: how many fits?</td><td>16 × 10 + 1 = 161</td></tr>
    <tr><td>Every flat scraped twice: which CV splitter?</td><td>Group by flat: LeaveOneGroupOut / GroupKFold</td></tr>
    <tr><td>Live area arrives as 900 instead of 9: leakage, skew or drift? What catches it?</td><td>Skew; a schema/range check or live/train median ratio (94.7)</td></tr>
  </table>

  <h2 id="pl-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is data leakage? Name its two families.</summary><div class="qa-body">Using information during training or model selection that will not be available at prediction time, so offline scores are inflated. Train–test contamination: a learnt step (scaler, selector, encoder, SMOTE) sees validation/test rows. Target leakage: a feature encodes the answer or comes from after the outcome (refund_issued for churn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature selection before cross-validation inflate scores so much, while scaling barely does?</summary><div class="qa-body">The selector uses the labels: among thousands of noise columns it picks those that match all labels by chance, including the future validation labels, so CV on the selected columns finds "signal" (0.85 on pure noise vs 0.48 inside a pipeline). A scaler learns only a mean and std per column without labels, so including one more fold barely changes it (+0.0004). Both are contamination; put both in the pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain by hand why naive target encoding leaks.</summary><div class="qa-body">A row's own label is included in its category mean. Merchant with labels (1, 0, 0, 0): every row gets 0.25, but leaving each row out gives 0 for the fraud row and 0.333 for the others, so including itself pushed the fraud row up and normal rows down. With few rows per category this systematic nudge is label information. Fix: out-of-fold (cross-fitted) encoding plus smoothing, learnt on training rows only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is a random split wrong for time series? What else leaks time?</summary><div class="qa-body">The model trains on days after the validation days and can interpolate, which it cannot do when forecasting (MAE 6.2 random vs 13.4 with TimeSeriesSplit). Other time leaks: centred rolling windows, whole-history aggregates, tables updated after the event, scalers fit on the full period. Use forward-chaining splits, past-only (shifted) features, as-of joins and a gap for delayed labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Patients have 4 visits each. Why can random KFold score 99% on random labels?</summary><div class="qa-body">A test visit almost always has a near-identical sibling visit in training (probability ≈ 1 − (159/799)(158/798)(157/797) ≈ 99.2%), with the same label, so the model recognises the patient. GroupKFold by patient gives the honest 0.48.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between fit, transform and fit_transform?</summary><div class="qa-body">fit learns parameters (mean_, statistics_, categories_, coef_) from data; transform applies the learnt parameters without learning; fit_transform does both on the same rows. Use fit/fit_transform on training rows only; transform (or predict) everything else. fit_transform on test re-learns from test: [8, 10] → [−1, 1] instead of [2.449, 3.674].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly happens when you call fit and predict on a Pipeline?</summary><div class="qa-body">fit: for each transformer in order, fit_transform on the current data and pass the result on; then fit the final estimator. predict: for each transformer, transform only; then the final estimator's predict. So nothing in predict learns, and CV/grid search, which call fit on training folds, re-learn every step per fold (the spy showed fit on 20 rows, transform on the 10 held-out rows).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tune C of a LogisticRegression and the imputer strategy inside a ColumnTransformer in a pipeline?</summary><div class="qa-body">Join names with double underscores: <code>clf__C</code> and <code>pre__num__impute__strategy</code> (pipeline step "pre" → transformer "num" → step "impute" → parameter). Whole steps can be swapped (<code>"clf": [LogisticRegression(), RandomForestClassifier()]</code>) or disabled (<code>"passthrough"</code>). <code>pipe.get_params().keys()</code> lists valid names.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many fits does a grid of 12 + 2 candidates with 5-fold CV need? And nested 3×3 CV over 12 candidates?</summary><div class="qa-body">14 × 5 = 70, plus 1 refit = 71. Nested: each of 3 outer folds runs 12 × 3 inner fits + 1 refit = 37, so 111 fits. The nested estimate (0.785) is the honest score of "tune then deploy"; best_score_ (0.792) is optimistic because it is the maximum of 14 noisy estimates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the rules for writing a custom sklearn transformer?</summary><div class="qa-body">Inherit BaseEstimator and TransformerMixin; __init__ just stores its arguments under the same names (no logic), so get_params/clone work; fit learns from training data, stores attributes ending in "_", returns self; transform uses only learnt attributes and returns one row per input; optionally get_feature_names_out and check_is_fitted. Stateless logic can be a FunctionTransformer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't SMOTE be a step in a normal sklearn Pipeline, and what do you do?</summary><div class="qa-body">A sklearn transformer must return one row per input row, at fit and at predict time; SMOTE adds rows and must not run at prediction. Use imbalanced-learn's Pipeline, which applies samplers only during fit (so inside CV it resamples only the training fold), or use class weights instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you save a model for serving, and what are the risks?</summary><div class="qa-body">joblib.dump the entire fitted pipeline with metadata (library versions, features, training data snapshot, scores). Risks: pickles execute code on load (never load untrusted files), and they can break or change behaviour across library versions (pin versions, smoke-test predictions after loading). Alternatives: skops for safer loading, ONNX for language-independent serving, a model registry for versioning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is train/serve skew, and how is it different from data drift?</summary><div class="qa-body">Skew is a mismatch created by the system: serving computes features differently from training (re-implemented code, units, skipped steps, refit scalers). Example: income sent in thousands turned every applicant into a predicted defaulter (accuracy 0.758 → 0.464). Drift is the world changing while the code is correct. Prevent skew by serving the same pipeline object and shared feature code, validating schemas, logging served features and comparing them with training statistics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your validation AUC is 0.99 on a hard problem. Walk through how you would look for leakage.</summary><div class="qa-body">Check feature importances for one dominant column and ask when it is filled; re-score with a split that mirrors production (time-based, group-based); grep for fit before the split, global groupby aggregates and centred windows; check duplicates across train and validation; run the pipeline with shuffled labels (should give 0.5); try adversarial validation to see which features distinguish train from test; compare with a simple baseline and domain expectations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the flats, a "final sale price" column cuts LOOCV MSE from 7.25 to 0.80. Why is this not good news, and why did leave-one-out not catch it?</summary><div class="qa-body">The column is written when the deal closes, after the listing the model must price, so it is empty in production; the model leaned on it (weight 0.861) instead of area. Leave-one-out did not help because the historical table was assembled after the sales: every held-out flat also has its sale price filled in. Splits catch rows leaking into rows; only "when is this column filled?" catches columns from the future.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Scale the bungalow (area 50) with a scaler fit on flats A–H, and with one fit on A–H plus the bungalow. What changed and why does it matter?</summary><div class="qa-body">Training statistics: mean 8.5, std 2.291 → z = 41.5/2.291 = 18.11, an extreme warning. With the bungalow inside the fit: mean 13.11, std 13.22 → z = 2.79, ordinary-looking, and flat A moved from −1.53 to −0.61. The held-out row reshaped the training data and hid its own novelty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did the whole-year locality mean score 2.24 in forward chaining, and what does the as-of score of 29.04 teach?</summary><div class="qa-body">The whole-year mean includes listings made after the predicted one, and the predicted flat's own price, so it carries future and target information. The as-of mean uses only earlier listings, which is all production will have; with one or two per locality it is noisy, and it made the model worse than area alone (6.91). A leaky feature can lead you to ship a feature that hurts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection (Splits &amp; CV): cross-validation already holds out data. Why is that not enough, and what does the pipeline add?</summary><div class="qa-body">CV holds out <em>rows</em> from the model's fit, but steps run before CV (a scaler, a selector, a locality mean) have already seen those rows. The pipeline moves every learnt step inside the fold, so held-out rows reach only transform. And the split itself must mirror production: forward chaining for time, groups for repeated flats (<a class="xref" data-note="ml_splits">Splits &amp; CV</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection (Feature Engineering): which feature steps learn from data, and what happens to each inside a cross-validated pipeline?</summary><div class="qa-body">Imputers learn fill values (median age 7), scalers mean_ and scale_, encoders categories_ (and target encoders category means, cross-fitted), binners edges, vectorizers vocabularies, selectors which columns to keep, clippers caps. Inside the pipeline, each is refit on every training fold and only applied to the held-out fold; outside it, each is a potential leak (naive locality mean: 1.68 instead of 3.69) (<a class="xref" data-note="ml_features">Feature Engineering</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection (Regularization → Regression): how is ridge's alpha chosen on the flats, and what score do you report?</summary><div class="qa-body">As a pipeline parameter, model__alpha, searched together with preprocessing choices (16 candidates, 161 fits); the best LOOCV MSE is 1.41 with alpha 0.01 and locality one-hot. That best score is optimistic; the nested estimate, 1.63, is what you report. Every model in <a class="xref" data-note="ml_regression">Regression</a> and later notes is trained and tuned this way (<a class="xref" data-note="ml_regularization">Regularization</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do regularization tuning and feature engineering connect to pipelines?</summary><div class="qa-body">Regularized models need scaled features, and λ (alpha, C) must be chosen by CV (<a class="xref" data-note="ml_regularization">Regularization</a>); feature steps such as imputers, encoders and selectors learn from data (<a class="xref" data-note="ml_features">Feature Engineering</a>). Putting scaler, feature steps and model in one pipeline lets GridSearchCV tune clf__C or model__alpha together with preprocessing choices, with every step re-learnt per fold, and ships the result as one object.</div></details>
</main>
`
});
