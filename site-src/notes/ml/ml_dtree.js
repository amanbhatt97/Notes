// notes/ml/ml_dtree.js — Decision Trees
Object.assign(TOPIC_CONTENT, {
  "ml_dtree": `<main>
  <h1>Decision Trees</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Decision Trees</span></div>
  <p class="lead">A decision tree learns a flowchart of yes/no questions from a table of past examples, then answers a new row by walking down that flowchart. This note builds one completely by hand: entropy, information gain, gain ratio and Gini are each computed on small tables of numbers, a full tree is grown on the classic 14-day "play or not" dataset, the captain's cricket diary that runs through this whole note (and the whole tree family), then pruned, then rebuilt from scratch in Python and checked against scikit-learn. Every concept, from entropy to pruning and missing values, is computed on those same 14 days. Every random forest and every gradient-boosting model you will meet later is made of these trees, so this is the foundation of the whole tree family.</p>

  <h2 id="dt-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <p><strong>Came from.</strong> In <a class="xref" data-note="ml_regression">Regression</a> and <a class="xref" data-note="ml_classification">Classification</a> you met linear and logistic regression. They multiply each column by a weight and add the results, which draws a straight line (or flat surface) through the data. Three problems were left open. Real rules bend ("plays if it is warm, but not if it is also humid"). Columns interact (humidity matters only on sunny days). And you had to scale numbers and turn text categories into numbers before the model could start.</p>
  <p><strong>What this note adds.</strong> A model that asks questions one column at a time. It handles bends and interactions on its own, needs no scaling, works on numbers and categories, and you can read its rules aloud to a manager. You will learn exactly how it chooses each question (entropy, information gain, gain ratio, Gini, variance reduction), how it handles numeric columns, categories and missing values, and how to stop it from memorising (pre-pruning and post-pruning).</p>
  <p><strong>Leads to.</strong> A single tree has one big weakness: train it on slightly different rows and you get a quite different tree (high variance). <a class="xref" data-note="ml_ensembles">Ensemble Learning</a> explains why combining many trees fixes this; <a class="xref" data-note="ml_bagging">Bagging</a> and <a class="xref" data-note="ml_rf">Random Forest</a> average many deep trees; <a class="xref" data-note="ml_boosting">Boosting</a> and <a class="xref" data-note="ml_gbm">Gradient Boosting</a> add up many small regression trees. The map of the whole family is in <a class="xref" data-note="ml_trees">The Tree Family</a>.</p>
  <figure class="viz"><svg viewBox="0 0 640 250" width="640">
<defs><marker id="dt-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="15" width="180" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="110" y="34" text-anchor="middle" font-size="13">Linear / logistic</text><text x="110" y="50" text-anchor="middle" class="tm" font-size="11">straight boundaries</text>
<line x1="200" y1="37" x2="242" y2="37" stroke="currentColor" marker-end="url(#dt-fa)"/>
<rect x="245" y="10" width="170" height="54" rx="8" class="fb sb" stroke-width="3"/>
<text x="330" y="33" text-anchor="middle" font-size="14" font-weight="700">Decision Tree</text><text x="330" y="51" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE</text>
<line x1="330" y1="64" x2="330" y2="96" stroke="currentColor" marker-end="url(#dt-fa)"/>
<text x="338" y="84" class="tm" font-size="11">weakness: high variance</text>
<rect x="245" y="98" width="170" height="40" rx="8" class="fs" stroke="currentColor"/>
<text x="330" y="123" text-anchor="middle" font-size="13">Ensembles</text>
<line x1="290" y1="138" x2="150" y2="176" stroke="currentColor" marker-end="url(#dt-fa)"/>
<line x1="330" y1="138" x2="330" y2="176" stroke="currentColor" marker-end="url(#dt-fa)"/>
<line x1="370" y1="138" x2="510" y2="176" stroke="currentColor" marker-end="url(#dt-fa)"/>
<rect x="60" y="178" width="180" height="44" rx="8" class="fb sb" fill-opacity="0.4"/>
<text x="150" y="197" text-anchor="middle" font-size="12.5">Bagging · Random Forest</text><text x="150" y="213" text-anchor="middle" class="tm" font-size="11">average deep trees</text>
<rect x="250" y="178" width="160" height="44" rx="8" class="ft st"/>
<text x="330" y="197" text-anchor="middle" font-size="12.5">Boosting · GBM</text><text x="330" y="213" text-anchor="middle" class="tm" font-size="11">add small regression trees</text>
<rect x="420" y="178" width="180" height="44" rx="8" class="fg sg"/>
<text x="510" y="197" text-anchor="middle" font-size="12.5">Importance &amp; SHAP</text><text x="510" y="213" text-anchor="middle" class="tm" font-size="11">explain many trees</text>
<text x="320" y="244" text-anchor="middle" class="tm" font-size="11">Every box below "Decision Tree" is built out of the trees in this note.</text>
</svg><figcaption>The decision tree is the root of the tree family. Everything after it either combines many trees or explains them.</figcaption></figure>

  <h2 id="dt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers are from the running example, the captain's 14-day cricket diary (9 days played, 5 not).</p>
  <ol class="story">
    <li><b>A tree of questions</b><span>Q: how can a model reason like the captain, one question at a time? → A flowchart: root question, branches, leaves with answers. Five if-else rules fit all 14 days, and the new day (Sunny, Normal humidity, Strong wind) walks Outlook → Humidity → Yes. But we chose those questions by looking at the answer. How does a machine choose?</span></li>
    <li><b>Impurity</b><span>Q: how do we score "how mixed" a box of days is? → A number that is 0 for a pure box and largest for a 50/50 box; a good question lowers the size-weighted impurity of its children (the gain). But which formula?</span></li>
    <li><b>Entropy</b><span>Q: what is a principled measure of mixedness? → Average surprise in bits, −Σ p log₂ p: the diary's 9/5 box holds 0.940 bits. But entropy scores one box; it does not yet pick a question.</span></li>
    <li><b>Information gain</b><span>Q: which question first? → The one that removes the most entropy: Outlook 0.247 beats Humidity 0.152, Wind 0.048, Temp 0.029. Recursing inside Sunny and Rain gives the whole tree by hand. But IG adores many-valued columns: a Day column gets the maximum 0.940.</span></li>
    <li><b>Gain ratio</b><span>Q: how do we stop IG favouring ID-like columns? → Divide by the split's own entropy: Day falls from 0.940 to 0.247, Outlook 0.156. It softens the bias but cannot rescue an ID column, and every candidate still needs logarithms.</span></li>
    <li><b>Gini impurity</b><span>Q: is there a cheaper score that behaves the same? → 1 − Σp², the chance two random days disagree: 0.459 at the root, same ranking of columns; the binary split Overcast-vs-rest gains 0.102. But why not simply count mistakes?</span></li>
    <li><b>Misclassification error</b><span>Q: why not grow by accuracy? → Because it is flat: Overcast-vs-rest leaves 5 of 14 days wrong before and after, gain 0, although Gini sees 0.102. Good for pruning, useless for growing.</span></li>
    <li><b>ID3, C4.5, CART</b><span>Q: how do these choices fit together historically? → ID3 = IG + multiway; C4.5 = gain ratio + thresholds + missing values + pruning; CART = Gini/MSE + binary splits + cost-complexity. But the diary so far had only categories.</span></li>
    <li><b>Numeric thresholds</b><span>Q: how do we split a number like the humidity reading? → Sort, try every midpoint, keep the best: HumPct ≤ 82.5 (weighted Gini 0.367, IG 0.152). But categories have no order for "≤".</span></li>
    <li><b>Categorical groupings</b><span>Q: how does a binary tree split Outlook's three values? → Try the 2^(k−1) − 1 = 3 groupings, or sort by play-rate and try k − 1 = 2: {Sunny, Rain} | {Overcast} wins (0.102). But what if the target is a number, not a class?</span></li>
    <li><b>Regression trees</b><span>Q: how do we predict the turnout? → Minimise the children's variance; each leaf predicts its mean: HumPct ≤ 82.5 gives leaves 40 and 28 (MSE 91.4 → 55.4). But left alone, any tree keeps splitting until every leaf is pure.</span></li>
    <li><b>Overfitting &amp; instability</b><span>Q: what happens when it keeps growing? → It memorises (train 1.000 vs validation 0.773 on 20,000 customers), and it is shaky: drop day D3 and the root flips to Humidity. How do we stop the memorising?</span></li>
    <li><b>Pre-pruning</b><span>Q: can we stop growth early? → Limits: max_depth, min_samples_leaf (5 lifts validation from 0.773 to 0.806), min_impurity_decrease … But a limit can stop just before a great split (the horizon effect).</span></li>
    <li><b>Post-pruning</b><span>Q: can we grow fully, then cut back in a principled way? → Cost-complexity R(T) + α|T|, weakest link first: on the diary tree the whole tree goes at α = 0.089; α is chosen by cross-validation. But real readings go missing.</span></li>
    <li><b>Missing values</b><span>Q: what if a humidity reading is missing? → C4.5 sends fractions of the day down every branch, CART uses a surrogate (Humidity = High mimics HumPct ≤ 82.5 on all 14 days), sklearn learns a side for NaN. What shapes can all these splits draw?</span></li>
    <li><b>Decision boundaries</b><span>Q: what does a tree look like in feature space? → Axis-aligned boxes; a diagonal rule needs a staircase. How expensive is all this?</span></li>
    <li><b>Cost</b><span>Q: how fast is training and prediction? → Train about O(n·d·log n); predict O(depth), 2 comparisons on the diary tree. Which columns did the tree rely on?</span></li>
    <li><b>MDI importance</b><span>Q: which columns matter most? → Sum each column's weighted impurity drops: Humidity 0.37, Wind 0.37, Outlook only 0.26 though it is the root. But MDI is biased to many-valued columns.</span></li>
    <li><b>scikit-learn and from scratch</b><span>Q: how do we use it, and do we truly understand it? → Every parameter of DecisionTreeClassifier; ID3 in 40 lines reproduces the hand-built tree, and a 40-line CART matches sklearn on all 5,000 test rows. Then: when is one tree the right tool, and when do we need many?</span></li>
  </ol>

  <h2 id="dt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Decision Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Running example: the diary</div>
        <ul>
          <li>14 days, 9 played / 5 not; Outlook, Temp, Humidity, Wind; plus HumPct, TempC, Turnout</li>
          <li>Root H 0.940, Gini 0.459 · IG: Outlook 0.247, Humidity 0.152, Wind 0.048, Temp 0.029</li>
          <li>Tree: Overcast → Yes; Sunny → Humidity; Rain → Wind (5 rules, 0 errors)</li>
          <li>HumPct ≤ 82.5 (Gini 0.367) · turnout leaves 40 / 28 · drop D3 → root Humidity</li>
          <li>MDI: Humidity 0.37, Wind 0.37, Outlook 0.26</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Anatomy &amp; prediction</div>
        <ul>
          <li><b>Root</b> — first question · <b>internal node</b> — a later question · <b>leaf</b> — an answer</li>
          <li><b>Branch</b> — one answer to a question · <b>depth</b> — questions from root to the deepest leaf</li>
          <li>Each root→leaf path = one <b>if-and-and-then</b> rule</li>
          <li><b>Predict</b> — walk down by the row's values; leaf gives majority class (or class shares as probability) / mean value</li>
          <li>💡 A doctor's checklist: the first question rules out the most</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Impurity (how mixed)</div>
        <ul>
          <li><b>Entropy</b> H = −Σ pᵢ log₂ pᵢ — average surprise in bits; 0 pure, 1 for 50/50, log₂k max</li>
          <li><b>Gini</b> = 1 − Σ pᵢ² — chance two random picks disagree; 0.5 max for 2 classes</li>
          <li><b>Misclassification</b> = 1 − max pᵢ — fine for pruning, bad for growing (flat, not strictly concave)</li>
          <li>Gini ≈ entropy (first-order Taylor); sklearn default Gini (no log)</li>
          <li>Regression: <b>variance / MSE</b> (leaf = mean), MAE (leaf = median)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing a split</div>
        <ul>
          <li><b>Gain</b> = impurity(parent) − Σ (nₖ/n)·impurity(childₖ)</li>
          <li><b>Information gain</b> = gain with entropy (= mutual information)</li>
          <li>Play dataset root: Outlook 0.247 · Humidity 0.152 · Wind 0.048 · Temp 0.029</li>
          <li>IG loves many-valued columns (ID column IG = 0.940) → <b>gain ratio</b> = IG / SplitInfo</li>
          <li><b>Numeric</b>: sort, try midpoints between neighbours, one linear scan</li>
          <li><b>Categorical</b> (CART): 2^(k−1)−1 binary groupings; 2 classes → sort by rate, k−1 tries</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Algorithms</div>
        <ul>
          <li><b>ID3</b> (1986) — entropy/IG, multiway, categorical only, no pruning</li>
          <li><b>C4.5</b> (1993) — gain ratio, numeric thresholds, fractional rows for missing, pessimistic pruning</li>
          <li><b>CART</b> (1984) — Gini / MSE, always binary, surrogates for missing, cost-complexity pruning</li>
          <li>sklearn = optimised CART (no surrogates, no categorical splits; NaN supported)</li>
          <li>All are <b>greedy, top-down, recursive</b>: best split now, never look back</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Overfitting &amp; pruning</div>
        <ul>
          <li>Unlimited tree: train 1.000, val 0.773, 1,413 leaves (memorised)</li>
          <li><b>Pre-pruning</b>: max_depth, min_samples_split, min_samples_leaf, min_impurity_decrease, max_leaf_nodes, max_features</li>
          <li><b>Reduced-error pruning</b>: cut a branch if validation errors do not rise</li>
          <li><b>Cost-complexity</b>: R_α(T) = R(T) + α|T|; weakest link g(t) = (R(t) − R(T_t)) / (|T_t| − 1); pick α by CV</li>
          <li>⚠ High variance: small data change → different tree → ensembles</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practical facts</div>
        <ul>
          <li><b>Missing</b>: C4.5 fractional rows · CART surrogate splits · sklearn learns a NaN direction</li>
          <li><b>Boundaries</b> are axis-aligned boxes → diagonals need staircases; add x1 − x2</li>
          <li><b>Cost</b>: train ≈ O(n·d·log n), predict O(depth)</li>
          <li><b>MDI importance</b> = weighted impurity drops per feature; biased to many-valued features</li>
          <li>No scaling needed; can't extrapolate; leaf values are constants</li>
          <li>⚠ Not unique: two correct trees can disagree on unseen rows</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain of questions</span></div></div>
      <div class="rm-item rm-done" data-target="dt-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Tree of Questions</span><span class="rm-sub">The diary, anatomy, rules, prediction</span></div></div>
      <div class="rm-item rm-done" data-target="dt-impurity"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Impurity</span><span class="rm-sub">A number for "how mixed"</span></div></div>
      <div class="rm-item rm-done" data-target="dt-entropy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Entropy</span><span class="rm-sub">Surprise, log₂, 2- and 3-class by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-ig"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Information Gain</span><span class="rm-sub">A full tree built by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-gr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Gain Ratio</span><span class="rm-sub">Fixing IG's love of ID columns</span></div></div>
      <div class="rm-item rm-done" data-target="dt-gini"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gini Impurity</span><span class="rm-sub">And entropy vs Gini</span></div></div>
      <div class="rm-item rm-done" data-target="dt-error"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Misclassification Error</span><span class="rm-sub">Why not used for growing</span></div></div>
      <div class="rm-item rm-done" data-target="dt-algos"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">ID3 vs C4.5 vs CART</span><span class="rm-sub">The three classic algorithms</span></div></div>
      <div class="rm-item rm-done" data-target="dt-numeric"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Numeric Features</span><span class="rm-sub">Humidity: sort, midpoints, scan</span></div></div>
      <div class="rm-item rm-done" data-target="dt-cat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Categorical Features</span><span class="rm-sub">Binary groupings, one-hot effects</span></div></div>
      <div class="rm-item rm-done" data-target="dt-reg"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Regression Trees</span><span class="rm-sub">Turnout: variance reduction, mean vs median</span></div></div>
      <div class="rm-item rm-done" data-target="dt-overfit"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Overfitting &amp; Instability</span><span class="rm-sub">Memorising and high variance</span></div></div>
      <div class="rm-item rm-done" data-target="dt-pre"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Pre-Pruning</span><span class="rm-sub">Every stopping knob, measured</span></div></div>
      <div class="rm-item rm-done" data-target="dt-post"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Post-Pruning</span><span class="rm-sub">Reduced-error and cost-complexity</span></div></div>
      <div class="rm-item rm-done" data-target="dt-missing"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">C4.5, CART surrogates, sklearn NaN</span></div></div>
      <div class="rm-item rm-done" data-target="dt-geom"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Decision Boundaries</span><span class="rm-sub">Boxes and staircases</span></div></div>
      <div class="rm-item rm-done" data-target="dt-cost"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Time &amp; Memory Cost</span><span class="rm-sub">O(n·d·log n) train, O(depth) predict</span></div></div>
      <div class="rm-item rm-done" data-target="dt-mdi"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Feature Importance (MDI)</span><span class="rm-sub">Computed by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-sklearn"><span class="rm-num">19</span><div class="rm-text"><span class="rm-label">scikit-learn in Practice</span><span class="rm-sub">Every parameter, export_text, plot_tree</span></div></div>
      <div class="rm-item rm-done" data-target="dt-scratch"><span class="rm-num">20</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">ID3 and CART, matched to sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="dt-connect"><span class="rm-num">21</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table, one diary</span></div></div>
      <div class="rm-item rm-done" data-target="dt-pros"><span class="rm-num">22</span><div class="rm-text"><span class="rm-label">Strengths &amp; Weaknesses</span><span class="rm-sub">When a single tree is right</span></div></div>
      <div class="rm-item rm-done" data-target="dt-compare"><span class="rm-num">23</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs linear, kNN, forests, boosting</span></div></div>
      <div class="rm-item rm-done" data-target="dt-traps"><span class="rm-num">24</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">25</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dt-idea"><span class="num">01</span>A Tree of Questions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Linear and logistic regression add up weighted columns and draw one straight boundary. The captain decides differently: one question at a time, and the next question depends on the last answer. What kind of model reasons like that, and what are its parts called?</p>
  </div>
  <h3>The need</h3>
  <p>Your college cricket team plays only on some evenings. The captain has kept a diary for 14 days: the weather (outlook), the temperature, the humidity, the wind, and whether the match was played. Tomorrow's forecast is "sunny, mild, normal humidity, strong wind". Will they play?</p>
  <p>A logistic regression would add up "sunny × weight + humid × weight + …" and draw one straight boundary. But the captain's real reasoning is not an addition. It is a chain of questions: "Is it overcast? Then we play. Is it sunny? Then it depends on humidity. Is it raining? Then it depends on the wind." Notice that humidity only matters on sunny days, and wind only matters on rainy days. That is an <strong>interaction</strong>, and a chain of questions captures it naturally.</p>
  <p>Here is the diary, the <strong>running example of this note and of the whole tree family</strong>. It is the famous "PlayTennis" table from Ross Quinlan's 1986 paper that introduced ID3; we call it "play cricket". The captain also wrote down three numbers (humidity in %, temperature in °C, and the turnout: how many club members came to the ground). Sections 01–08 use the four weather categories; the numbers join in section 09 (thresholds) and section 11 (predicting a number). Every concept in this note is computed on these 14 days, so it is worth a careful look.</p>
  <table class="tbl"><caption>The 14-day diary (9 Yes, 5 No)</caption>
    <tr><th>Day</th><th>Outlook</th><th>Temp</th><th>Humidity</th><th>Wind</th><th>Play</th><th>HumPct</th><th>TempC</th><th>Turnout</th></tr>
    <tr><td>D1</td><td>Sunny</td><td>Hot</td><td>High</td><td>Weak</td><td>No</td><td>85</td><td>29</td><td>24</td></tr>
    <tr><td>D2</td><td>Sunny</td><td>Hot</td><td>High</td><td>Strong</td><td>No</td><td>90</td><td>27</td><td>20</td></tr>
    <tr><td>D3</td><td>Overcast</td><td>Hot</td><td>High</td><td>Weak</td><td>Yes</td><td>86</td><td>28</td><td>36</td></tr>
    <tr><td>D4</td><td>Rain</td><td>Mild</td><td>High</td><td>Weak</td><td>Yes</td><td>96</td><td>21</td><td>32</td></tr>
    <tr><td>D5</td><td>Rain</td><td>Cool</td><td>Normal</td><td>Weak</td><td>Yes</td><td>80</td><td>20</td><td>44</td></tr>
    <tr><td>D6</td><td>Rain</td><td>Cool</td><td>Normal</td><td>Strong</td><td>No</td><td>70</td><td>18</td><td>22</td></tr>
    <tr><td>D7</td><td>Overcast</td><td>Cool</td><td>Normal</td><td>Strong</td><td>Yes</td><td>65</td><td>18</td><td>42</td></tr>
    <tr><td>D8</td><td>Sunny</td><td>Mild</td><td>High</td><td>Weak</td><td>No</td><td>95</td><td>22</td><td>26</td></tr>
    <tr><td>D9</td><td>Sunny</td><td>Cool</td><td>Normal</td><td>Weak</td><td>Yes</td><td>70</td><td>21</td><td>40</td></tr>
    <tr><td>D10</td><td>Rain</td><td>Mild</td><td>Normal</td><td>Weak</td><td>Yes</td><td>80</td><td>24</td><td>46</td></tr>
    <tr><td>D11</td><td>Sunny</td><td>Mild</td><td>Normal</td><td>Strong</td><td>Yes</td><td>70</td><td>24</td><td>38</td></tr>
    <tr><td>D12</td><td>Overcast</td><td>Mild</td><td>High</td><td>Strong</td><td>Yes</td><td>90</td><td>22</td><td>38</td></tr>
    <tr><td>D13</td><td>Overcast</td><td>Hot</td><td>Normal</td><td>Weak</td><td>Yes</td><td>75</td><td>27</td><td>48</td></tr>
    <tr><td>D14</td><td>Rain</td><td>Mild</td><td>High</td><td>Strong</td><td>No</td><td>91</td><td>22</td><td>20</td></tr>
  </table>
  <p>By section 04 we will have computed, by hand, that the best tree for this table is the one drawn below. For now, just learn the names of its parts.</p>

  <h3>Anatomy of a tree</h3>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<line x1="330" y1="52" x2="140" y2="128" stroke="currentColor"/><line x1="330" y1="52" x2="330" y2="128" stroke="currentColor"/><line x1="330" y1="52" x2="520" y2="128" stroke="currentColor"/>
<line x1="140" y1="158" x2="75" y2="228" stroke="currentColor"/><line x1="140" y1="158" x2="205" y2="228" stroke="currentColor"/>
<line x1="520" y1="158" x2="455" y2="228" stroke="currentColor"/><line x1="520" y1="158" x2="585" y2="228" stroke="currentColor"/>
<rect x="260" y="18" width="140" height="36" rx="8" class="fb sb"/><text x="330" y="35" text-anchor="middle" font-size="13" font-weight="700">Outlook?</text><text x="330" y="49" text-anchor="middle" class="tm" font-size="10.5">14 days: 9 Yes / 5 No</text>
<text x="215" y="86" class="tm" font-size="11.5">Sunny</text><text x="336" y="96" class="tm" font-size="11.5">Overcast</text><text x="420" y="86" class="tm" font-size="11.5">Rain</text>
<rect x="72" y="126" width="136" height="34" rx="8" class="fb sb"/><text x="140" y="142" text-anchor="middle" font-size="13" font-weight="700">Humidity?</text><text x="140" y="155" text-anchor="middle" class="tm" font-size="10.5">5 days: 2 Yes / 3 No</text>
<rect x="275" y="126" width="110" height="34" rx="8" class="fg sg"/><text x="330" y="142" text-anchor="middle" font-size="13" font-weight="700">Yes</text><text x="330" y="155" text-anchor="middle" class="tm" font-size="10.5">4 Yes / 0 No</text>
<rect x="452" y="126" width="136" height="34" rx="8" class="fb sb"/><text x="520" y="142" text-anchor="middle" font-size="13" font-weight="700">Wind?</text><text x="520" y="155" text-anchor="middle" class="tm" font-size="10.5">5 days: 3 Yes / 2 No</text>
<text x="85" y="198" class="tm" font-size="11.5">High</text><text x="180" y="198" class="tm" font-size="11.5">Normal</text><text x="462" y="198" class="tm" font-size="11.5">Weak</text><text x="560" y="198" class="tm" font-size="11.5">Strong</text>
<rect x="30" y="228" width="90" height="34" rx="8" class="fr sr"/><text x="75" y="244" text-anchor="middle" font-size="13" font-weight="700">No</text><text x="75" y="257" text-anchor="middle" class="tm" font-size="10.5">0 / 3</text>
<rect x="160" y="228" width="90" height="34" rx="8" class="fg sg"/><text x="205" y="244" text-anchor="middle" font-size="13" font-weight="700">Yes</text><text x="205" y="257" text-anchor="middle" class="tm" font-size="10.5">2 / 0</text>
<rect x="410" y="228" width="90" height="34" rx="8" class="fg sg"/><text x="455" y="244" text-anchor="middle" font-size="13" font-weight="700">Yes</text><text x="455" y="257" text-anchor="middle" class="tm" font-size="10.5">3 / 0</text>
<rect x="540" y="228" width="90" height="34" rx="8" class="fr sr"/><text x="585" y="244" text-anchor="middle" font-size="13" font-weight="700">No</text><text x="585" y="257" text-anchor="middle" class="tm" font-size="10.5">0 / 2</text>
<text x="410" y="30" class="tb" font-size="11.5">← root node (depth 0)</text>
<text x="8" y="120" class="tb" font-size="11.5">internal node</text><text x="8" y="134" class="tb" font-size="11.5">(depth 1)</text>
<text x="392" y="176" class="tg" font-size="11.5">leaf (depth 1)</text>
<text x="215" y="280" class="tg" font-size="11.5">leaves at depth 2 → tree depth = 2</text>
<text x="226" y="110" class="tr" font-size="11.5">branch = one answer</text>
</svg><figcaption>The tree learnt from the diary. Blue boxes ask a question, green and red boxes give an answer. Small numbers are the Yes / No counts of the training days that reach each box.</figcaption></figure>
  <table class="tbl">
    <tr><th>Part</th><th>Plain meaning</th><th>In the picture</th></tr>
    <tr><td><strong>Root node</strong></td><td>The first question; all training rows start here</td><td>Outlook?</td></tr>
    <tr><td><strong>Internal (decision) node</strong></td><td>Any question below the root; it sees only the rows sent to it</td><td>Humidity?, Wind?</td></tr>
    <tr><td><strong>Branch (edge)</strong></td><td>One possible answer to a question, leading to a child</td><td>Sunny / Overcast / Rain</td></tr>
    <tr><td><strong>Leaf (terminal node)</strong></td><td>No more questions; holds the answer</td><td>the 5 Yes/No boxes</td></tr>
    <tr><td><strong>Parent / child</strong></td><td>A node and the nodes directly under it</td><td>Outlook is the parent of Humidity</td></tr>
    <tr><td><strong>Depth of a node</strong></td><td>Number of questions asked to reach it (root = 0)</td><td>Humidity = 1, its leaves = 2</td></tr>
    <tr><td><strong>Depth of the tree</strong></td><td>Depth of the deepest leaf; the most questions any row will face</td><td>2</td></tr>
    <tr><td><strong>Split</strong></td><td>The act of dividing a node's rows by one question</td><td>3-way split on Outlook</td></tr>
    <tr><td><strong>Subtree</strong></td><td>A node plus everything under it</td><td>Wind? with its two leaves</td></tr>
  </table>
  <p>Notice the counts. The root holds all 14 days, mixed 9/5. After one question, the Overcast box is perfectly clean (4/0), while Sunny and Rain are still mixed. After a second question every box is clean. Learning a tree means <strong>choosing questions that make the boxes clean as fast as possible</strong>. Sections 02–07 turn "clean" into a number.</p>

  <h3>Rules as if-else paths</h3>
  <p>Every path from the root to a leaf is one rule, joined by AND. The tree above is exactly these five rules:</p>
  <ul>
    <li>IF Outlook = Overcast THEN Yes</li>
    <li>IF Outlook = Sunny AND Humidity = High THEN No</li>
    <li>IF Outlook = Sunny AND Humidity = Normal THEN Yes</li>
    <li>IF Outlook = Rain AND Wind = Strong THEN No</li>
    <li>IF Outlook = Rain AND Wind = Weak THEN Yes</li>
  </ul>
  <p>The rules never overlap and together they cover every possible day, so every row gets exactly one answer. A tree is literally nested <code>if/else</code> code. The block below writes it by hand and checks it against the diary. <code>play.py</code> just holds the diary as a pandas DataFrame called <code>df</code> (index D1…D14), all eight columns.</p>
  <div class="fx" data-lang="py">import pandas as pd
rows = [  # Outlook,   Temp,  Humidity, Wind,    Play, HumPct, TempC, Turnout
    ("Sunny",    "Hot",  "High",   "Weak",   "No",  85,  29, 24),
    ("Sunny",    "Hot",  "High",   "Strong", "No",  90,  27, 20),
    ("Overcast", "Hot",  "High",   "Weak",   "Yes", 86,  28, 36),
    ("Rain",     "Mild", "High",   "Weak",   "Yes", 96,  21, 32),
    ("Rain",     "Cool", "Normal", "Weak",   "Yes", 80,  20, 44),
    ("Rain",     "Cool", "Normal", "Strong", "No",  70,  18, 22),
    ("Overcast", "Cool", "Normal", "Strong", "Yes", 65,  18, 42),
    ("Sunny",    "Mild", "High",   "Weak",   "No",  95,  22, 26),
    ("Sunny",    "Cool", "Normal", "Weak",   "Yes", 70,  21, 40),
    ("Rain",     "Mild", "Normal", "Weak",   "Yes", 80,  24, 46),
    ("Sunny",    "Mild", "Normal", "Strong", "Yes", 70,  24, 38),
    ("Overcast", "Mild", "High",   "Strong", "Yes", 90,  22, 38),
    ("Overcast", "Hot",  "Normal", "Weak",   "Yes", 75,  27, 48),
    ("Rain",     "Mild", "High",   "Strong", "No",  91,  22, 20)]
df = pd.DataFrame(rows, columns=["Outlook", "Temp", "Humidity", "Wind", "Play", "HumPct", "TempC", "Turnout"])
df.index = [f"D{i}" for i in range(1, 15)]</div>
  <div class="fx" data-lang="py">from play import df

def play_cricket(outlook, humidity, wind):
    if outlook == "Overcast":                 # root question
        return "Yes"                          # leaf (depth 1)
    elif outlook == "Sunny":
        if humidity == "High":                # internal node (depth 1)
            return "No"                       # leaf (depth 2)
        else:
            return "Yes"
    else:                                     # outlook == "Rain"
        if wind == "Strong":
            return "No"
        else:
            return "Yes"

df["Rule"] = [play_cricket(r.Outlook, r.Humidity, r.Wind) for r in df.itertuples()]
print(df[["Outlook", "Temp", "Humidity", "Wind", "Play", "Rule"]].head(6))
print("rules agree with all 14 days:", (df.Rule == df.Play).all())
print("new day (Sunny, Normal, Strong):", play_cricket("Sunny", "Normal", "Strong"))</div>
  <div class="fx" data-lang="text">     Outlook  Temp Humidity    Wind Play Rule
D1     Sunny   Hot     High    Weak   No   No
D2     Sunny   Hot     High  Strong   No   No
D3  Overcast   Hot     High    Weak  Yes  Yes
D4      Rain  Mild     High    Weak  Yes  Yes
D5      Rain  Cool   Normal    Weak  Yes  Yes
D6      Rain  Cool   Normal  Strong   No   No
rules agree with all 14 days: True
new day (Sunny, Normal, Strong): Yes</div>
  <p>The function returns the same answer as the diary on all 14 days. For tomorrow (sunny, normal humidity, strong wind) it walks Outlook → Sunny → Humidity → Normal → <strong>Yes</strong>. Temperature was never asked: the tree decided it was not needed. A tree does its own <strong>feature selection</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank's loan officer with a printed flowchart: "Salary above ₹50,000? → Existing loans? → Credit score above 700?" Each new applicant walks the same flowchart. The machine's job is to <em>write</em> that flowchart from thousands of past applicants.</p>
  </div>

  <h3>How prediction works</h3>
  <div class="flow"><span>Start at the root</span><span>Read the row's value for the node's column</span><span>Follow the matching branch</span><span>Repeat until a leaf</span><span>Return the leaf's answer</span></div>
  <p>What a leaf returns depends on the task:</p>
  <table class="tbl">
    <tr><th>Task</th><th>Leaf stores</th><th>predict()</th><th>predict_proba()</th></tr>
    <tr><td>Classification</td><td>class counts of training rows in the leaf, e.g. [No 4, Yes 1]</td><td>majority class → No</td><td>shares → [0.8, 0.2]</td></tr>
    <tr><td>Regression</td><td>the training targets in the leaf, e.g. salaries 4, 5, 6</td><td>their mean → 5.0</td><td>–</td></tr>
  </table>
  <p>Only the columns on the row's path are read, so a prediction costs one comparison per level: O(depth). With a depth-20 tree that is 20 comparisons, which is why trees are very fast at prediction time.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>decision tree</strong> is a model that splits the feature space into non-overlapping regions R₁…R_J (the leaves), using a sequence of tests on one feature at a time, and predicts a constant c_j in each region: f(x) = Σⱼ c_j · 𝟙[x ∈ R_j]. For classification c_j is the majority class (or the class shares); for regression c_j is the mean target of the training rows in R_j.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Tree" in ML is drawn upside down: the root is at the top and the leaves at the bottom. And the word "depth" counts edges, not boxes: a tree with one question (a <strong>decision stump</strong>) has depth 1, not 2.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Impurity.</b> We drew a tree that works, but we chose its questions by looking at the answer. The machine needs a rule: at every node, which question should be asked? To compare questions, it first needs a number for "how mixed is this box".</div>

  <h2 id="dt-impurity"><span class="num">02</span>Impurity: Scoring a Mixed Group</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We drew a tree that fits the diary, but we picked its questions by eye. To let a machine pick, it must compare candidate questions with a number. What number says how mixed a box of days is, and how much a question improves it?</p>
  </div>
  <h3>Why a number for "mixed"</h3>
  <p>Look at two possible first questions for the diary. "Outlook?" gives boxes of 2Y/3N, 4Y/0N, 3Y/2N. "Wind?" gives 6Y/2N and 3Y/3N. Which is better? Your eye says Outlook, because one box is perfectly clean. But for thousands of rows and hundreds of columns the computer needs a <strong>score</strong>. That score is called <strong>impurity</strong>: 0 when a box holds only one class, largest when the classes are evenly mixed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bag of laddoos and barfis. A bag of only laddoos is "pure": you know what you will pull out. A bag of half and half is "impure": you cannot guess. Impurity measures how badly you would guess.</p>
  </div>
  <h3>What a good impurity score must do</h3>
  <p>For two classes with p = share of "Yes", any sensible impurity function i(p) should satisfy:</p>
  <ol>
    <li><strong>Zero when pure</strong>: i(0) = i(1) = 0.</li>
    <li><strong>Largest at a 50/50 mix</strong>: i(0.5) is the maximum.</li>
    <li><strong>Symmetric</strong>: i(p) = i(1 − p); the names of the classes do not matter.</li>
    <li><strong>Strictly concave</strong> (curved like a dome, not a tent): this one is subtle and important. It guarantees that any split that changes the class mix in the children shows a positive gain. Section 07 shows what goes wrong without it.</li>
  </ol>
  <p>Three functions are used in practice. You will compute each by hand.</p>
  <table class="tbl">
    <tr><th>Name</th><th>Formula (k classes, shares pᵢ)</th><th>Pure</th><th>50/50 (2 classes)</th><th>Used by</th></tr>
    <tr><td>Entropy</td><td>−Σ pᵢ log₂ pᵢ</td><td>0</td><td>1.0</td><td>ID3, C4.5, sklearn <code>criterion="entropy"</code></td></tr>
    <tr><td>Gini</td><td>1 − Σ pᵢ²</td><td>0</td><td>0.5</td><td>CART, sklearn default</td></tr>
    <tr><td>Misclassification error</td><td>1 − max pᵢ</td><td>0</td><td>0.5</td><td>pruning, not growing</td></tr>
  </table>
  <h3>The gain of a split</h3>
  <p>A split replaces one box (the parent) with several smaller boxes (the children). We want the children to be, on average, much purer than the parent. "On average" must weight each child by how many rows it holds: a pure child with 1 row is worth less than a pure child with 100 rows.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gain</strong> (impurity decrease) of splitting node S into children S₁…S_m:<br>Δi = i(S) − Σₖ (|Sₖ| / |S|) · i(Sₖ)<br>where |S| is the number of rows in S. The first term is the parent's impurity, the second is the <strong>weighted average impurity of the children</strong>. With entropy as i, Δi is called <strong>information gain</strong>.</p>
  </div>
  <h3>The growing algorithm (all classic trees share it)</h3>
  <div class="fx" data-lang="text">grow(node rows S):
    if S is pure, or too small, or too deep:   make a leaf (majority class / mean)
    for every column, for every possible question on it:
        compute gain = i(S) - weighted i(children)
    pick the question with the largest gain
    split S by it, and call grow() on each child</div>
  <p>This is <strong>greedy</strong> (it takes the best question now, never reconsiders), <strong>top-down</strong> (root first) and <strong>recursive</strong> (each child is a smaller copy of the same problem). It is also called <strong>recursive partitioning</strong>. Greedy is a compromise: finding the truly smallest tree that fits the data is NP-complete (Hyafil &amp; Rivest, 1976), so every practical algorithm settles for "best next question".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Greedy can miss good trees. The classic case is XOR: y = 1 when exactly one of x₁, x₂ is 1. Alone, neither column changes the class mix at all (gain 0 for both), so a greedy tree may stop at the root, even though a depth-2 tree is perfect. Fixes: do not stop on zero gain (sklearn's default), or add an engineered column like x₁ XOR x₂.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Entropy.</b> We have the recipe but not the ingredient. What exactly is entropy, why is there a logarithm in it, and why base 2?</div>

  <h2 id="dt-entropy"><span class="num">03</span>Entropy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Impurity needs a concrete formula: 0 for a pure box, largest for an even mix, and a sound reason behind it. The diary's root box holds 9 Yes and 5 No days. Exactly how mixed is that?</p>
  </div>
  <h3>The need</h3>
  <p>We want a score that is 0 for a pure box and largest for an even mix. Entropy, borrowed from Claude Shannon's information theory (1948), is the most famous one. It answers a concrete question: <em>on average, how surprised will I be when I pull one row out of this box and look at its class?</em> A pure box never surprises you. A 50/50 box surprises you every time.</p>
  <h3>Step 1: surprise of one outcome</h3>
  <p>If something has probability p, how surprised are you when it happens? We want: certain events (p = 1) give 0 surprise; rare events give a lot. And if two independent things happen together, the surprises should <strong>add</strong> (two coin heads should be twice as surprising as one). Probabilities of independent events multiply (½ × ½ = ¼), and the only function that turns multiplication into addition is the logarithm. So:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Surprise</strong> (self-information) of an outcome with probability p: s(p) = log₂(1/p) = −log₂ p, measured in <strong>bits</strong>.</p>
  </div>
  <table class="tbl">
    <tr><th>p</th><th>1/p</th><th>surprise −log₂ p</th><th>Plain meaning</th></tr>
    <tr><td>1</td><td>1</td><td>0 bits</td><td>The sun rose. No news.</td></tr>
    <tr><td>1/2</td><td>2</td><td>1 bit</td><td>A fair coin: one yes/no question settles it</td></tr>
    <tr><td>1/4</td><td>4</td><td>2 bits</td><td>One of 4 equal options: 2 yes/no questions</td></tr>
    <tr><td>1/8</td><td>8</td><td>3 bits</td><td>One of 8: 3 questions (2³ = 8)</td></tr>
    <tr><td>0.01</td><td>100</td><td>6.64 bits</td><td>A 1-in-100 event: big news</td></tr>
  </table>
  <p><strong>Why base 2?</strong> Because then surprise counts "how many yes/no questions you would need". With 8 equally likely suspects, 3 well-chosen yes/no questions find the culprit, and log₂ 8 = 3. Using natural log (ln) instead gives units called "nats"; every value is just multiplied by ln 2 ≈ 0.693, so the <em>ranking</em> of splits never changes. Only the scale does.</p>
  <h3>Step 2: entropy = average surprise</h3>
  <p>A box has several classes with shares p₁, p₂, …. Pull one row out at random. With probability pᵢ you see class i and get surprise −log₂ pᵢ. The <strong>average</strong> surprise is:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Entropy</strong> of a set S with class shares p₁…p_k:<br>H(S) = −Σᵢ pᵢ log₂ pᵢ<br>with the convention 0 · log₂ 0 = 0 (a class that does not appear adds nothing; mathematically p·log p → 0 as p → 0). Range: 0 (pure) to log₂ k (all k classes equally common).</p>
  </div>
  <h3>Worked by hand: two classes</h3>
  <p><strong>The whole diary, [9 Yes, 5 No].</strong> Shares 9/14 = 0.643 and 5/14 = 0.357.</p>
  <table class="tbl">
    <tr><th>Class</th><th>p</th><th>log₂ p</th><th>−p · log₂ p</th></tr>
    <tr><td>Yes</td><td>0.643</td><td>−0.637</td><td>0.410</td></tr>
    <tr><td>No</td><td>0.357</td><td>−1.485</td><td>0.530</td></tr>
    <tr><td colspan="3"><strong>H = sum</strong></td><td><strong>0.940 bits</strong></td></tr>
  </table>
  <p>(To get log₂ on a calculator: log₂ x = ln x / ln 2. For example ln 0.643 = −0.442, divided by 0.693 gives −0.637.)</p>
  <p><strong>A cleaner box, [8, 2].</strong> p = 0.8 and 0.2. log₂ 0.8 = −0.322, log₂ 0.2 = −2.322. H = 0.8 × 0.322 + 0.2 × 2.322 = 0.258 + 0.464 = <strong>0.722</strong>.</p>
  <p><strong>Even mix, [5, 5].</strong> H = 0.5 × 1 + 0.5 × 1 = <strong>1.000</strong>, the maximum for two classes.</p>
  <p><strong>Pure, [10, 0].</strong> H = 1 × log₂ 1 + 0 = <strong>0</strong>. No surprise ever.</p>
  <h3>Worked by hand: three classes</h3>
  <p>A box of 12 customers: 6 "stays", 3 "downgrades", 3 "leaves". Shares 0.5, 0.25, 0.25.</p>
  <table class="tbl">
    <tr><th>Class</th><th>p</th><th>−log₂ p (surprise)</th><th>p × surprise</th></tr>
    <tr><td>stay</td><td>0.50</td><td>1</td><td>0.50</td></tr>
    <tr><td>downgrade</td><td>0.25</td><td>2</td><td>0.50</td></tr>
    <tr><td>leave</td><td>0.25</td><td>2</td><td>0.50</td></tr>
    <tr><td colspan="3"><strong>H</strong></td><td><strong>1.50 bits</strong></td></tr>
  </table>
  <p>With three classes entropy can go above 1. Its maximum is log₂ 3 = 1.585 (a [4, 4, 4] box). With four equal classes it is log₂ 4 = 2: you need exactly two yes/no questions to identify one of four equally likely classes.</p>
  <h3>The curve of entropy against p</h3>
  <figure class="viz"><svg viewBox="0 0 540 260" width="540">
<line x1="60" y1="220" x2="490" y2="220" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="220" stroke="currentColor"/>
<line x1="60" y1="30" x2="480" y2="30" stroke="currentColor" stroke-opacity="0.15"/><line x1="60" y1="125" x2="480" y2="125" stroke="currentColor" stroke-opacity="0.15"/>
<text x="52" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="129" text-anchor="end" class="tm" font-size="11">0.5</text><text x="52" y="34" text-anchor="end" class="tm" font-size="11">1.0</text>
<text x="60" y="236" text-anchor="middle" class="tm" font-size="11">0</text><text x="165" y="236" text-anchor="middle" class="tm" font-size="11">0.25</text><text x="270" y="236" text-anchor="middle" class="tm" font-size="11">0.5</text><text x="375" y="236" text-anchor="middle" class="tm" font-size="11">0.75</text><text x="480" y="236" text-anchor="middle" class="tm" font-size="11">1</text>
<text x="270" y="254" text-anchor="middle" class="tm" font-size="12">p = share of class "Yes" in the box</text>
<polyline points="60,220 81,166 102,131 123,104 144,83 165,66 186,53 207,43 228,36 249,31 270,30 291,31 312,36 333,43 354,53 375,66 396,83 417,104 438,131 459,166 480,220" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="330" cy="42" r="4" class="fr sr"/><text x="338" y="58" class="tr" font-size="11.5">[9,5]: p=0.643, H=0.940</text>
<circle cx="396" cy="83" r="4" class="fr sr"/><text x="404" y="98" class="tr" font-size="11.5">[8,2]: H=0.722</text>
<circle cx="270" cy="30" r="4" class="fg sg"/><text x="270" y="18" text-anchor="middle" class="tg" font-size="11.5">50/50: H = 1 (max)</text>
<text x="78" y="205" class="tm" font-size="11.5">pure: H = 0</text>
</svg><figcaption>Two-class entropy H(p) = −p log₂ p − (1−p) log₂(1−p). Zero at both ends, peak 1 bit at p = 0.5, symmetric, and a smooth dome (strictly concave).</figcaption></figure>
  <p>Notice the shape near the ends: it is steep. Moving a box from 100% pure to 90% pure raises entropy from 0 to 0.469, almost half the way to the maximum. Entropy punishes "a little bit of mixing" heavily. Gini (section 06) is gentler there.</p>
  <h3>Check it in code</h3>
  <p>The function turns counts into shares, drops zero shares (the 0 · log 0 = 0 rule), and sums −p log₂ p. The second loop prints the surprise of "Yes" and the entropy for several shares.</p>
  <div class="fx" data-lang="py">import numpy as np
def entropy(counts):
    p = np.array(counts) / sum(counts)       # counts -&gt; shares
    p = p[p &gt; 0]                             # 0 * log 0 is taken as 0
    return float(-(p * np.log2(p)).sum()) + 0.0   # +0.0 turns -0.0 into 0.0

for c in [[5, 5], [8, 2], [9, 5], [10, 0], [4, 4, 4, 4]]:
    print(c, round(entropy(c), 3))
print("3 classes [6,3,3]:", round(entropy([6, 3, 3]), 3), " max for 3 classes:", round(np.log2(3), 3))
for p in [0.01, 0.1, 0.25, 0.5, 0.75, 0.9]:
    print(f"p={p:&lt;4}  surprise(yes)={-np.log2(p):.2f} bits   H={entropy([p, 1-p]):.3f}")</div>
  <div class="fx" data-lang="text">[5, 5] 1.0
[8, 2] 0.722
[9, 5] 0.94
[10, 0] 0.0
[4, 4, 4, 4] 2.0
3 classes [6,3,3]: 1.5  max for 3 classes: 1.585
p=0.01  surprise(yes)=6.64 bits   H=0.081
p=0.1   surprise(yes)=3.32 bits   H=0.469
p=0.25  surprise(yes)=2.00 bits   H=0.811
p=0.5   surprise(yes)=1.00 bits   H=1.000
p=0.75  surprise(yes)=0.42 bits   H=0.811
p=0.9   surprise(yes)=0.15 bits   H=0.469</div>
  <p>Every number matches the hand tables. Look at the last block: when p = 0.01 a "Yes" is very surprising (6.64 bits), but it almost never happens, so the <em>average</em> surprise H is only 0.081. Entropy is high only when surprising outcomes are also common, which means "mixed".</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Entropy is the average number of yes/no questions you would need to guess the class of a random row from the box. A pure box needs 0 questions. A tree's job is to ask questions about the <em>features</em> so that, at the leaves, you need 0 more questions about the <em>class</em>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Three common slips. (1) Forgetting 0 · log 0 = 0: <code>np.log2(0)</code> gives −inf and the sum becomes nan. (2) Thinking entropy is at most 1: that is only for two classes; with k classes the maximum is log₂ k. (3) Mixing bases: <code>scipy.stats.entropy</code> uses natural log unless you pass <code>base=2</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Information Gain.</b> Entropy scores one box. To choose a question we need to score a split: how much entropy disappears when one box becomes several?</div>

  <h2 id="dt-ig"><span class="num">04</span>Information Gain: Building the Tree by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Entropy scores one box: the diary's root holds 0.940 bits. A question turns one box into several. How much entropy does each of the four questions remove, and which should be the root?</p>
  </div>
  <h3>The idea in plain words</h3>
  <p>Before the question, the class of a random day has 0.940 bits of uncertainty. After you learn the answer to a question (say, the outlook), some uncertainty remains inside each branch. <strong>Information gain is the uncertainty that the question removed.</strong></p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Information gain</strong> of attribute A on set S:<br>IG(S, A) = H(S) − Σ_{v ∈ values(A)} (|S_v| / |S|) · H(S_v)<br>where S_v is the subset of rows with A = v. The second term is the <strong>conditional entropy</strong> H(Y | A). So IG = H(Y) − H(Y | A), which in information theory is the <strong>mutual information</strong> between the attribute and the class.</p>
  </div>
  <p>ID3's rule is simply: at every node, split on the attribute with the largest IG. Let us do it for all four attributes at the root. H(S) = 0.940 from the previous section.</p>
  <h3>Root level: all four attributes</h3>
  <p><strong>Outlook</strong> (3 values):</p>
  <table class="tbl">
    <tr><th>Value</th><th>Days</th><th>Yes / No</th><th>H(S_v)</th><th>weight |S_v|/14</th><th>weight × H</th></tr>
    <tr><td>Sunny</td><td>D1 D2 D8 D9 D11</td><td>2 / 3</td><td>0.971</td><td>5/14 = 0.357</td><td>0.347</td></tr>
    <tr><td>Overcast</td><td>D3 D7 D12 D13</td><td>4 / 0</td><td>0</td><td>4/14 = 0.286</td><td>0</td></tr>
    <tr><td>Rain</td><td>D4 D5 D6 D10 D14</td><td>3 / 2</td><td>0.971</td><td>5/14 = 0.357</td><td>0.347</td></tr>
    <tr><td colspan="5">weighted child entropy</td><td>0.694</td></tr>
    <tr><td colspan="5"><strong>IG(Outlook) = 0.940 − 0.694</strong></td><td><strong>0.247</strong></td></tr>
  </table>
  <p>(H of [2, 3] = −0.4 log₂ 0.4 − 0.6 log₂ 0.6 = 0.4 × 1.322 + 0.6 × 0.737 = 0.529 + 0.442 = 0.971.)</p>
  <p><strong>Temp</strong> (3 values):</p>
  <table class="tbl">
    <tr><th>Value</th><th>Yes / No</th><th>H</th><th>weight</th><th>weight × H</th></tr>
    <tr><td>Hot</td><td>2 / 2</td><td>1.000</td><td>4/14</td><td>0.286</td></tr>
    <tr><td>Mild</td><td>4 / 2</td><td>0.918</td><td>6/14</td><td>0.394</td></tr>
    <tr><td>Cool</td><td>3 / 1</td><td>0.811</td><td>4/14</td><td>0.232</td></tr>
    <tr><td colspan="4"><strong>IG(Temp) = 0.940 − 0.911</strong></td><td><strong>0.029</strong></td></tr>
  </table>
  <p><strong>Humidity</strong> (2 values):</p>
  <table class="tbl">
    <tr><th>Value</th><th>Yes / No</th><th>H</th><th>weight</th><th>weight × H</th></tr>
    <tr><td>High</td><td>3 / 4</td><td>0.985</td><td>7/14</td><td>0.493</td></tr>
    <tr><td>Normal</td><td>6 / 1</td><td>0.592</td><td>7/14</td><td>0.296</td></tr>
    <tr><td colspan="4"><strong>IG(Humidity) = 0.940 − 0.788</strong></td><td><strong>0.152</strong></td></tr>
  </table>
  <p><strong>Wind</strong> (2 values):</p>
  <table class="tbl">
    <tr><th>Value</th><th>Yes / No</th><th>H</th><th>weight</th><th>weight × H</th></tr>
    <tr><td>Weak</td><td>6 / 2</td><td>0.811</td><td>8/14</td><td>0.464</td></tr>
    <tr><td>Strong</td><td>3 / 3</td><td>1.000</td><td>6/14</td><td>0.429</td></tr>
    <tr><td colspan="4"><strong>IG(Wind) = 0.940 − 0.892</strong></td><td><strong>0.048</strong></td></tr>
  </table>
  <table class="tbl out"><caption>Root decision</caption>
    <tr><th>Attribute</th><th>IG</th></tr>
    <tr><td><strong>Outlook</strong></td><td><strong>0.247 ← largest, becomes the root</strong></td></tr>
    <tr><td>Humidity</td><td>0.152</td></tr>
    <tr><td>Wind</td><td>0.048</td></tr>
    <tr><td>Temp</td><td>0.029</td></tr>
  </table>
  <p>Outlook wins. Its Overcast branch is already pure (4 Yes), so it becomes a leaf "Yes" straight away. Sunny and Rain are still mixed, so we <strong>recurse</strong>: repeat the same search inside each, using only the rows in that branch and only the attributes not yet used on this path.</p>
  <h3>Level 2, Sunny branch (D1, D2, D8, D9, D11: 2 Yes / 3 No, H = 0.971)</h3>
  <table class="tbl">
    <tr><th>Attribute</th><th>Branches (Yes / No)</th><th>weighted child H</th><th>IG</th></tr>
    <tr><td><strong>Humidity</strong></td><td>High: D1 D2 D8 → 0/3 (H 0) · Normal: D9 D11 → 2/0 (H 0)</td><td>0</td><td><strong>0.971</strong></td></tr>
    <tr><td>Temp</td><td>Hot: 0/2 (H 0) · Mild: 1/1 (H 1) · Cool: 1/0 (H 0)</td><td>2/5 × 1 = 0.400</td><td>0.571</td></tr>
    <tr><td>Wind</td><td>Weak: D1 D8 D9 → 1/2 (H 0.918) · Strong: D2 D11 → 1/1 (H 1)</td><td>3/5 × 0.918 + 2/5 × 1 = 0.951</td><td>0.020</td></tr>
  </table>
  <p>Humidity removes <em>all</em> the remaining uncertainty (IG equals the node's whole entropy, 0.971). Both children are pure, so both become leaves: High → No, Normal → Yes.</p>
  <h3>Level 2, Rain branch (D4, D5, D6, D10, D14: 3 Yes / 2 No, H = 0.971)</h3>
  <table class="tbl">
    <tr><th>Attribute</th><th>Branches (Yes / No)</th><th>weighted child H</th><th>IG</th></tr>
    <tr><td><strong>Wind</strong></td><td>Weak: D4 D5 D10 → 3/0 · Strong: D6 D14 → 0/2</td><td>0</td><td><strong>0.971</strong></td></tr>
    <tr><td>Humidity</td><td>High: D4 D14 → 1/1 (H 1) · Normal: D5 D6 D10 → 2/1 (H 0.918)</td><td>0.4 + 0.551 = 0.951</td><td>0.020</td></tr>
    <tr><td>Temp</td><td>Mild: D4 D10 D14 → 2/1 (H 0.918) · Cool: D5 D6 → 1/1 (H 1)</td><td>0.551 + 0.4 = 0.951</td><td>0.020</td></tr>
  </table>
  <p>Wind wins and again gives two pure leaves: Weak → Yes, Strong → No. Every leaf is now pure, so the recursion stops. The finished tree is exactly the one drawn in section 01. We built it with nothing but counting and logarithms.</p>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
<rect x="10" y="10" width="190" height="150" rx="8" class="fs" stroke="currentColor"/>
<text x="105" y="32" text-anchor="middle" font-size="12.5" font-weight="700">Step 1: root</text>
<text x="20" y="56" font-size="11.5">H(S) = 0.940</text><text x="20" y="76" class="tb" font-size="11.5">Outlook   0.247 ✓</text><text x="20" y="94" font-size="11.5">Humidity  0.152</text><text x="20" y="112" font-size="11.5">Wind      0.048</text><text x="20" y="130" font-size="11.5">Temp      0.029</text><text x="20" y="150" class="tm" font-size="10.5">Overcast pure → leaf</text>
<rect x="225" y="10" width="190" height="150" rx="8" class="fs" stroke="currentColor"/>
<text x="320" y="32" text-anchor="middle" font-size="12.5" font-weight="700">Step 2: Sunny (5)</text>
<text x="235" y="56" font-size="11.5">H = 0.971</text><text x="235" y="76" class="tb" font-size="11.5">Humidity  0.971 ✓</text><text x="235" y="94" font-size="11.5">Temp      0.571</text><text x="235" y="112" font-size="11.5">Wind      0.020</text><text x="235" y="150" class="tm" font-size="10.5">both children pure</text>
<rect x="440" y="10" width="190" height="150" rx="8" class="fs" stroke="currentColor"/>
<text x="535" y="32" text-anchor="middle" font-size="12.5" font-weight="700">Step 3: Rain (5)</text>
<text x="450" y="56" font-size="11.5">H = 0.971</text><text x="450" y="76" class="tb" font-size="11.5">Wind      0.971 ✓</text><text x="450" y="94" font-size="11.5">Humidity  0.020</text><text x="450" y="112" font-size="11.5">Temp      0.020</text><text x="450" y="150" class="tm" font-size="10.5">both children pure → done</text>
</svg><figcaption>The whole ID3 run on the diary: three searches, three winners, five pure leaves.</figcaption></figure>
  <h3>Check it in code</h3>
  <p><code>entropy</code> works on a column of labels. <code>info_gain</code> groups the rows by the attribute, weights each group's entropy by its size, and subtracts from the parent. The last loop repeats the search inside the Sunny and Rain branches.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df                      # the 14-day table above
def entropy(labels):
    p = labels.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0

def info_gain(data, attr, target="Play"):
    H_parent = entropy(data[target])
    weighted = 0.0
    for value, part in data.groupby(attr):
        w = len(part) / len(data)        # share of rows that go to this branch
        weighted += w * entropy(part[target])
    return H_parent - weighted

print(f"H(S) = {entropy(df['Play']):.3f}")
for a in ["Outlook", "Temp", "Humidity", "Wind"]:
    print(f"IG(S, {a:8s}) = {info_gain(df, a):.3f}")
for v in ["Sunny", "Rain"]:
    sub = df[df.Outlook == v]
    print(f"--- Outlook = {v}: {sub.Play.value_counts().to_dict()}  H = {entropy(sub.Play):.3f}")
    for a in ["Temp", "Humidity", "Wind"]:
        print(f"IG(S_{v}, {a:8s}) = {info_gain(sub, a):.3f}")</div>
  <div class="fx" data-lang="text">H(S) = 0.940
IG(S, Outlook ) = 0.247
IG(S, Temp    ) = 0.029
IG(S, Humidity) = 0.152
IG(S, Wind    ) = 0.048
--- Outlook = Sunny: {'No': 3, 'Yes': 2}  H = 0.971
IG(S_Sunny, Temp    ) = 0.571
IG(S_Sunny, Humidity) = 0.971
IG(S_Sunny, Wind    ) = 0.020
--- Outlook = Rain: {'Yes': 3, 'No': 2}  H = 0.971
IG(S_Rain, Temp    ) = 0.020
IG(S_Rain, Humidity) = 0.020
IG(S_Rain, Wind    ) = 0.971</div>
  <p>Every value matches the hand tables: 0.247 / 0.029 / 0.152 / 0.048 at the root, 0.971 for Humidity under Sunny and for Wind under Rain.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The game "20 questions" (or "guess the film" at a family party). A good player first asks "Is it Hindi?", which cuts the possibilities roughly in half, not "Is it Sholay?", which almost always gets "no" and teaches nothing. Information gain picks the question whose answer teaches you the most, on average.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the weights. If you average the child entropies without weighting by size, a tiny pure child (1 row) counts as much as a big mixed one, and you will pick silly splits. Always multiply by |S_v| / |S|. Also: IG is computed with the <em>node's</em> rows and entropy, not the whole dataset's.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gain Ratio.</b> Information gain has a blind spot. What if a column has a different value on every row, like a customer ID or the date? Each value gets its own pure branch, so IG is as large as it can be, yet the column is useless for new rows.</div>

  <h2 id="dt-gr"><span class="num">05</span>Gain Ratio (C4.5): Fixing the Bias to Many Values</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Information gain chose Outlook for the diary. But it rewards any column that cuts the data into many tiny pure groups. What happens if the diary has a Day column, and how did C4.5 fix it?</p>
  </div>
  <h3>The problem, shown with numbers</h3>
  <p>Add one more column to the diary: <strong>Day</strong> (D1, D2, …, D14). It has 14 different values, so splitting on it gives 14 branches of one day each. Every branch is pure (H = 0), the weighted child entropy is 0, and</p>
  <p style="text-align:center">IG(Day) = 0.940 − 0 = <strong>0.940</strong>, the largest gain possible.</p>
  <p>ID3 would put "Day" at the root. The tree would be perfect on the 14 training days and useless on day 15, because day 15 matches none of the branches. The same thing happens, more quietly, with any column that has many values: pin codes, product IDs, timestamps, customer names. More branches means smaller groups, and small groups look pure by chance.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher who "predicts" marks by roll number. On last term's marksheet roll number 17 got 82, so the teacher writes "roll 17 → 82". Perfect recall of the past, zero insight for a new student.</p>
  </div>
  <h3>The fix: divide by the split's own entropy</h3>
  <p>Quinlan's C4.5 (1993) penalises splits that break the data into many small pieces. It measures "how many pieces, how evenly" with the entropy of the <strong>branch sizes</strong> (ignoring the class), called <strong>split information</strong>:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SplitInfo(S, A)</strong> = −Σ_v (|S_v| / |S|) · log₂(|S_v| / |S|) — the entropy of the attribute's own value distribution.<br><strong>GainRatio(S, A)</strong> = IG(S, A) / SplitInfo(S, A).<br>A split into m equal branches has SplitInfo = log₂ m, so many-way splits are divided by a bigger number.</p>
  </div>
  <h3>Worked by hand</h3>
  <table class="tbl">
    <tr><th>Attribute</th><th>Branch sizes</th><th>SplitInfo</th><th>IG</th><th>GainRatio</th></tr>
    <tr><td>Day</td><td>1,1,…,1 (14)</td><td>log₂ 14 = 3.807</td><td>0.940</td><td>0.940 / 3.807 = 0.247</td></tr>
    <tr><td>Outlook</td><td>5, 4, 5</td><td>2 × (5/14 × 1.485) + 4/14 × 1.807 = 1.577</td><td>0.247</td><td>0.247 / 1.577 = 0.156</td></tr>
    <tr><td>Temp</td><td>4, 6, 4</td><td>1.557</td><td>0.029</td><td>0.019</td></tr>
    <tr><td>Humidity</td><td>7, 7</td><td>1.000</td><td>0.152</td><td>0.152</td></tr>
    <tr><td>Wind</td><td>8, 6</td><td>0.985</td><td>0.048</td><td>0.049</td></tr>
  </table>
  <p>Read it carefully, because the honest result is surprising. Gain ratio cut Day's score from 0.940 to 0.247, a big penalty, but Day <strong>still wins</strong> (0.247 &gt; 0.156). And among the real attributes, Outlook (3 values) now beats Humidity (2 values) by only 0.156 vs 0.152, where IG had it 0.247 vs 0.152. Gain ratio shrinks the advantage of many values; it does not make an ID column harmless.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def entropy(labels):
    p = labels.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def info_gain(data, attr, target="Play"):
    return entropy(data[target]) - sum(len(g) / len(data) * entropy(g[target])
                                       for _, g in data.groupby(attr))
def split_info(data, attr):
    return entropy(data[attr])           # entropy of the branch sizes, not of the label

d = df.copy()
d["Day"] = d.index                       # an ID column: 14 different values
print(f"{'attribute':9s} {'IG':&gt;6s} {'SplitInfo':&gt;9s} {'GainRatio':&gt;9s}")
for a in ["Day", "Outlook", "Temp", "Humidity", "Wind"]:
    ig, si = info_gain(d, a), split_info(d, a)
    print(f"{a:9s} {ig:6.3f} {si:9.3f} {ig/si:9.3f}")
avg = np.mean([info_gain(d, a) for a in ["Day", "Outlook", "Temp", "Humidity", "Wind"]])
print(f"average IG = {avg:.3f}")</div>
  <div class="fx" data-lang="text">attribute     IG SplitInfo GainRatio
Day        0.940     3.807     0.247
Outlook    0.247     1.577     0.156
Temp       0.029     1.557     0.019
Humidity   0.152     1.000     0.152
Wind       0.048     0.985     0.049
average IG = 0.283</div>
  <p>C4.5 adds one more rule because gain ratio has its own weakness: when SplitInfo is tiny (almost all rows take one value), the ratio blows up even for a useless attribute. So C4.5 first keeps only attributes whose IG is <strong>at least the average IG</strong>, then picks the best gain ratio among them. With Day included the average is 0.283 and only Day passes, so C4.5 too would split on Day. Without Day the average of the four real attributes is (0.247 + 0.029 + 0.152 + 0.048) / 4 = 0.119; Outlook and Humidity pass, and Outlook wins on gain ratio. Same tree as ID3.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>No split criterion can rescue an identifier column. The real fix is human: drop IDs, raw timestamps and free-text columns before training, or turn them into meaningful features (day of week, account age). Gain ratio is a softener for columns that are genuinely informative but have many values.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn has no gain ratio. CART (and sklearn) avoid the multiway-split problem differently: every split is <strong>binary</strong>, so a 14-value column cannot make 14 branches in one go. But a binary tree can still chop an ID-like numeric column into many tiny leaves over several levels. That is the "high-cardinality bias" you will see again in MDI importance (section 18).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gini Impurity.</b> Entropy needs a logarithm for every class at every candidate split. CART uses a cheaper score that behaves almost the same. What is it, and does the choice matter?</div>

  <h2 id="dt-gini"><span class="num">06</span>Gini Impurity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Entropy and gain ratio need a logarithm for every class at every candidate split. CART, and sklearn by default, use a cheaper score. What is it, does it pick the same root on the diary, and does the choice matter?</p>
  </div>
  <h3>Plain meaning</h3>
  <p>Reach into the box and pull out one row, put it back, and pull out another. <strong>Gini impurity is the chance that the two rows have different classes.</strong> A pure box: the two always match, Gini = 0. A 50/50 box: they differ half the time, Gini = 0.5.</p>
  <h3>Deriving the formula</h3>
  <p>Two draws with replacement are the same class i with probability pᵢ × pᵢ. Adding over classes, P(same) = Σ pᵢ². So P(different) = 1 − Σ pᵢ². A second reading gives the same number: label each row by drawing a random class with the box's shares; you are wrong with probability Σ pᵢ (1 − pᵢ) = Σ pᵢ − Σ pᵢ² = 1 − Σ pᵢ².</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gini impurity</strong>: G(S) = 1 − Σᵢ pᵢ² = Σᵢ pᵢ(1 − pᵢ). Range 0 to 1 − 1/k (0.5 for two classes, 0.667 for three). <strong>Gini gain</strong> = G(parent) − Σₖ (nₖ/n) G(childₖ). (Not the same thing as the "Gini coefficient" of economics or the "Gini = 2·AUC − 1" of credit scoring.)</p>
  </div>
  <h3>Worked by hand</h3>
  <table class="tbl">
    <tr><th>Box</th><th>shares</th><th>Σ p²</th><th>Gini = 1 − Σ p²</th><th>(entropy, for comparison)</th></tr>
    <tr><td>[5, 5]</td><td>0.5, 0.5</td><td>0.25 + 0.25 = 0.50</td><td>0.500</td><td>1.000</td></tr>
    <tr><td>[8, 2]</td><td>0.8, 0.2</td><td>0.64 + 0.04 = 0.68</td><td>0.320</td><td>0.722</td></tr>
    <tr><td>[9, 5]</td><td>0.643, 0.357</td><td>(81 + 25) / 196 = 0.541</td><td>0.459</td><td>0.940</td></tr>
    <tr><td>[10, 0]</td><td>1, 0</td><td>1</td><td>0</td><td>0</td></tr>
    <tr><td>[6, 3, 3]</td><td>0.5, 0.25, 0.25</td><td>0.25 + 0.0625 + 0.0625 = 0.375</td><td>0.625</td><td>1.500</td></tr>
  </table>
  <h3>The diary root with Gini</h3>
  <p>Gini of the whole diary: 1 − (9/14)² − (5/14)² = 1 − 106/196 = <strong>0.459</strong>. For Outlook: Sunny [2, 3] has Gini 1 − 0.16 − 0.36 = 0.48, Overcast is 0, Rain [3, 2] is 0.48. Weighted: (5/14)(0.48) + 0 + (5/14)(0.48) = 0.343. Gini gain = 0.459 − 0.343 = <strong>0.116</strong>.</p>
  <p>CART only makes <strong>binary</strong> splits, so for Outlook it compares the three ways to cut three values into two groups. "Overcast vs {Sunny, Rain}": left [4, 0] Gini 0, right [5, 5] Gini 0.5; weighted (10/14)(0.5) = 0.357; gain 0.459 − 0.357 = <strong>0.102</strong>.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def gini(labels):
    p = labels.value_counts(normalize=True).values
    return 1 - (p ** 2).sum()
def gini_gain(data, groups, target="Play"):
    return gini(data[target]) - sum(len(g) / len(data) * gini(g[target]) for g in groups)

for c in [[5, 5], [8, 2], [9, 5], [10, 0], [6, 3, 3]]:
    p = np.array(c) / sum(c)
    print(c, f"Gini = {1 - (p**2).sum():.3f}")
print(f"Gini(S) = {gini(df.Play):.3f}")
for a in ["Outlook", "Temp", "Humidity", "Wind"]:          # multiway, like ID3
    print(f"multiway Gini gain {a:8s} {gini_gain(df, [g for _, g in df.groupby(a)]):.3f}")
for left in [["Overcast"], ["Sunny"], ["Rain"]]:             # CART: binary groupings of Outlook
    m = df.Outlook.isin(left)
    print(f"binary  {str(left):12s} vs rest: Gini gain {gini_gain(df, [df[m], df[~m]]):.3f}")</div>
  <div class="fx" data-lang="text">[5, 5] Gini = 0.500
[8, 2] Gini = 0.320
[9, 5] Gini = 0.459
[10, 0] Gini = 0.000
[6, 3, 3] Gini = 0.625
Gini(S) = 0.459
multiway Gini gain Outlook  0.116
multiway Gini gain Temp     0.019
multiway Gini gain Humidity 0.092
multiway Gini gain Wind     0.031
binary  ['Overcast'] vs rest: Gini gain 0.102
binary  ['Sunny']    vs rest: Gini gain 0.066
binary  ['Rain']     vs rest: Gini gain 0.002</div>
  <p>The ranking of attributes is the same as with information gain (Outlook &gt; Humidity &gt; Wind &gt; Temp). As a binary CART split, "Overcast vs rest" (0.102) beats Humidity (0.092), so a CART tree also starts with Outlook, but only peels off Overcast first. You will see exactly that root in sklearn's output in section 19.</p>
  <h3>Entropy vs Gini: the curves</h3>
  <figure class="viz"><svg viewBox="0 0 560 270" width="560">
<line x1="60" y1="220" x2="490" y2="220" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="220" stroke="currentColor"/>
<line x1="60" y1="30" x2="480" y2="30" stroke="currentColor" stroke-opacity="0.15"/><line x1="60" y1="125" x2="480" y2="125" stroke="currentColor" stroke-opacity="0.15"/>
<text x="52" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="129" text-anchor="end" class="tm" font-size="11">0.5</text><text x="52" y="34" text-anchor="end" class="tm" font-size="11">1.0</text>
<text x="60" y="236" text-anchor="middle" class="tm" font-size="11">0</text><text x="270" y="236" text-anchor="middle" class="tm" font-size="11">0.5</text><text x="480" y="236" text-anchor="middle" class="tm" font-size="11">1</text>
<text x="270" y="254" text-anchor="middle" class="tm" font-size="12">p = share of class 1</text>
<polyline points="60,220 81,166 102,131 123,104 144,83 165,66 186,53 207,43 228,36 249,31 270,30 291,31 312,36 333,43 354,53 375,66 396,83 417,104 438,131 459,166 480,220" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="60,220 81,184 102,152 123,123 144,98 165,78 186,60 207,47 228,38 249,32 270,30 291,32 312,38 333,47 354,60 375,78 396,98 417,123 438,152 459,184 480,220" fill="none" class="sg" stroke-width="2" stroke-dasharray="6 4"/>
<polyline points="60,220 81,202 102,186 123,172 144,159 165,149 186,140 207,134 228,129 249,126 270,125 291,126 312,129 333,134 354,140 375,149 396,159 417,172 438,186 459,202 480,220" fill="none" class="sg" stroke-width="2.5"/>
<polyline points="60,220 270,125 480,220" fill="none" class="sr" stroke-width="2"/>
<text x="495" y="40" class="tb" font-size="11.5">entropy</text>
<text x="495" y="58" class="tg" font-size="11.5">2 × Gini (dashed)</text>
<text x="495" y="130" class="tg" font-size="11.5">Gini</text>
<text x="495" y="148" class="tr" font-size="11.5">error 1 − max p</text>
</svg><figcaption>Entropy (blue), Gini (green) and misclassification error (red) for two classes. Scaled to the same peak (dashed), Gini almost lies on top of entropy. The error curve is a tent made of two straight lines.</figcaption></figure>
  <p>The dashed curve is Gini doubled so that both peak at 1. It nearly coincides with entropy; the only visible gap is near the ends, where entropy is steeper. That is not luck. Using natural logs, entropy is −Σ pᵢ ln pᵢ. Near a pure box (pᵢ close to 1), ln pᵢ ≈ pᵢ − 1 (the first-order Taylor expansion, see <a class="xref" data-note="m_calculus">Calculus</a>), so −Σ pᵢ ln pᵢ ≈ Σ pᵢ (1 − pᵢ) = Gini. Gini is a polynomial stand-in for entropy.</p>
  <h3>Does the choice matter in practice?</h3>
  <p>The code fits a depth-10 tree on the 20,000-row churn dataset used across this tree family (set up in section 12) with each criterion, timing the fit.</p>
  <div class="fx" data-lang="py">from common import *
res = {}
for crit in ["gini", "entropy"]:
    times = []
    for _ in range(5):
        t0 = time.perf_counter()
        t = DecisionTreeClassifier(criterion=crit, max_depth=10, random_state=0).fit(Xtr, ytr)
        times.append(time.perf_counter() - t0)
    res[crit] = t.predict(Xva)
    print(f"{crit:8s} fit {min(times)*1000:5.0f} ms  root '{Xtr.columns[t.tree_.feature[0]]} &lt;= {t.tree_.threshold[0]:.2f}'"
          f"  leaves {t.get_n_leaves()}  val {t.score(Xva, yva):.3f}")
print(f"same validation prediction on {np.mean(res['gini'] == res['entropy']):.1%} of rows")</div>
  <div class="fx" data-lang="text">gini     fit   606 ms  root 'f5 &lt;= 0.31'  leaves 399  val 0.807
entropy  fit   613 ms  root 'f5 &lt;= 0.31'  leaves 399  val 0.806
same validation prediction on 90.3% of rows</div>
  <p>Same root question, same number of leaves, validation accuracy within 0.001. Lower down the trees differ a little (about 1 in 10 validation rows get a different answer), but neither is better. Entropy is slightly slower because of the logarithms. Raileanu &amp; Stoffel (2004) found the two disagree on only about 2% of split choices.</p>
  <table class="tbl">
    <tr><th></th><th>Entropy / information gain</th><th>Gini</th></tr>
    <tr><td>Meaning</td><td>average surprise, bits</td><td>chance two random rows disagree</td></tr>
    <tr><td>Max (2 classes)</td><td>1</td><td>0.5</td></tr>
    <tr><td>Cost</td><td>a log per class per candidate</td><td>squares only, a bit faster</td></tr>
    <tr><td>Near pure boxes</td><td>steeper: punishes a little mixing more</td><td>gentler</td></tr>
    <tr><td>Rule-of-thumb tendency</td><td>slightly more balanced splits</td><td>tends to isolate the most frequent class in its own branch</td></tr>
    <tr><td>Used by</td><td>ID3, C4.5, C5.0; sklearn <code>"entropy"</code> / <code>"log_loss"</code> (identical)</td><td>CART, sklearn default, most forests</td></tr>
    <tr><td>Results</td><td colspan="2">Almost always the same accuracy; tune depth / pruning instead of the criterion</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not compare raw numbers across criteria. "Gini gain 0.102" and "information gain 0.247" are on different scales; only the <em>ranking</em> of splits within one criterion matters. Likewise <code>min_impurity_decrease=0.01</code> means a different amount of pruning for Gini than for entropy.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Misclassification Error.</b> There is an even simpler impurity: "what fraction of the box would I get wrong if I predicted the majority class?" It is exactly what we care about at the end (accuracy). Why don't trees grow with it?</div>

  <h2 id="dt-error"><span class="num">07</span>Misclassification Error: Why It Is Not Used for Growing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We care about accuracy in the end. So why grow the tree with entropy or Gini instead of simply counting how many diary days each split gets wrong?</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Misclassification error</strong> of a box: E(S) = 1 − maxᵢ pᵢ, the share of rows that disagree with the box's majority class.</p>
  </div>
  <p>It sounds perfect. But look at its curve above: a tent of two straight lines. Inside each half the function is <strong>linear</strong>, and a linear function of an average equals the average of the function. So whenever both children keep the same majority class as the parent, the weighted child error equals the parent error exactly, and the gain is 0, even if the split is very useful. Three splits make it concrete:</p>
  <table class="tbl">
    <tr><th>Split (counts [class A, class B])</th><th>error gain</th><th>Gini gain</th><th>entropy gain</th></tr>
    <tr><td>A: [400, 400] → [300, 100] | [100, 300]</td><td>0.250</td><td>0.125</td><td>0.189</td></tr>
    <tr><td>B: [400, 400] → [200, 400] | [200, 0]</td><td>0.250</td><td>0.167</td><td>0.311</td></tr>
    <tr><td>C: [7, 3] → [4, 0] | [3, 3]</td><td><strong>0.000</strong></td><td>0.120</td><td>0.281</td></tr>
  </table>
  <p><strong>Split A vs B</strong> (the classic example from <em>The Elements of Statistical Learning</em>). Both leave 200 of 800 rows on the wrong side, so error cannot tell them apart. But B creates a <em>pure</em> child of 200 rows that needs no further work, while A leaves two mixed children. Gini and entropy both prefer B. By hand for B: parent Gini 0.5; left [200, 400] Gini 1 − (1/3)² − (2/3)² = 0.444, weight 600/800; right pure. Weighted 0.75 × 0.444 = 0.333, gain 0.167.</p>
  <p><strong>Split C</strong>. Parent error 3/10 = 0.3. Left [4, 0] error 0, right [3, 3] error 0.5. Weighted: 0.4 × 0 + 0.6 × 0.5 = 0.3. Gain <strong>0</strong>. The tree would stop here, although the split carved out a pure group and set up a perfect next split. Gini says 0.42 → 0.30, gain 0.12.</p>
  <p><strong>On the diary this is not a made-up case.</strong> The binary split "Overcast vs rest" turns [9 Yes, 5 No] into [4, 0] | [5, 5]. Parent error 5/14 = 0.357 (predict Yes, the 5 No days are wrong). Children: 0 for the pure Overcast box, 0.5 for the [5, 5] box, weighted (4/14)·0 + (10/14)·0.5 = 0.357. Error gain <strong>0</strong>. Yet Gini gain is 0.102 (section 06) and it is exactly the split sklearn puts at the root (section 19): it isolates 4 certain days and leaves an even box that the next question (Humidity) cleans up.</p>
  <div class="fx" data-lang="py">import numpy as np
def shares(c): return np.array(c) / sum(c)
def error(c):   return 1 - shares(c).max()
def gini(c):    return 1 - (shares(c) ** 2).sum()
def entropy(c):
    p = shares(c); p = p[p &gt; 0]
    return float(-(p * np.log2(p)).sum()) + 0.0
def weighted(f, kids):
    n = sum(sum(k) for k in kids)
    return sum(sum(k) / n * f(k) for k in kids)

cases = {"A: [300,100] | [100,300]": ([400, 400], [[300, 100], [100, 300]]),
         "B: [200,400] | [200,0]  ": ([400, 400], [[200, 400], [200, 0]]),
         "C: [4,0] | [3,3]        ": ([7, 3],     [[4, 0], [3, 3]])}
for name, (parent, kids) in cases.items():
    print(name, " ".join(f"{f.__name__} gain {f(parent) - weighted(f, kids):.3f}"
                         for f in (error, gini, entropy)))</div>
  <div class="fx" data-lang="text">A: [300,100] | [100,300] error gain 0.250 gini gain 0.125 entropy gain 0.189
B: [200,400] | [200,0]   error gain 0.250 gini gain 0.167 entropy gain 0.311
C: [4,0] | [3,3]         error gain 0.000 gini gain 0.120 entropy gain 0.281</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Growing is a search that needs a <em>sensitive</em> signal, one that rewards "more pure than before" even when the majority vote has not changed yet. Strictly concave impurities (entropy, Gini) give that signal; the flat pieces of the error curve do not. Misclassification error is still the right thing to measure <em>after</em> growing, so classic pruning methods (reduced-error pruning, cost-complexity pruning in Breiman's book) use it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn does not offer <code>criterion="error"</code> for this reason. If an interviewer asks "why not just maximise accuracy at each split?", the answer is: because accuracy is piecewise linear in the class shares, many useful splits score zero, and the greedy search would stall.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ID3 vs C4.5 vs CART.</b> We have three impurity scores and two ways of splitting (multiway, binary). Historically these were packaged into three named algorithms. Interviewers ask about them by name.</div>

  <h2 id="dt-algos"><span class="num">08</span>ID3 vs C4.5 vs CART</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We now have three impurity scores, gain and gain ratio, and two shapes of split (one branch per value, or always two). Which combinations became the named algorithms that interviewers ask about, and what does sklearn actually implement?</p>
  </div>
  <p>All three grow trees greedily, top-down, with the loop from section 02. They differ in the score, the shape of splits and the extras.</p>
  <table class="tbl">
    <tr><th></th><th>ID3 (Quinlan 1986)</th><th>C4.5 (Quinlan 1993)</th><th>CART (Breiman et al. 1984)</th><th>sklearn (CART, optimised)</th></tr>
    <tr><td>Split criterion</td><td>information gain</td><td>gain ratio (with "≥ average IG" filter)</td><td>Gini (classification), MSE (regression); "twoing" option</td><td>gini, entropy / log_loss; squared_error, friedman_mse, absolute_error, poisson</td></tr>
    <tr><td>Split shape</td><td>multiway (one branch per value)</td><td>multiway for categorical, binary for numeric</td><td>always binary</td><td>always binary</td></tr>
    <tr><td>Numeric features</td><td>no (must be binned first)</td><td>yes: threshold A ≤ t</td><td>yes: threshold A ≤ t</td><td>yes (only numbers accepted)</td></tr>
    <tr><td>Categorical features</td><td>yes, natively</td><td>yes, natively</td><td>yes: best grouping of values into two sets</td><td>no: you must encode (one-hot / ordinal)</td></tr>
    <tr><td>Regression</td><td>no</td><td>no (M5 is the regression cousin)</td><td>yes</td><td>yes</td></tr>
    <tr><td>Missing values</td><td>no</td><td>fractional rows (weights)</td><td>surrogate splits</td><td>learns a direction for NaN (since 1.3)</td></tr>
    <tr><td>Pruning</td><td>none (grows until pure)</td><td>pessimistic error pruning (no validation set; uses an upper confidence bound on the training error, CF = 25%), subtree raising</td><td>cost-complexity pruning, α chosen by cross-validation</td><td>pre-pruning params + <code>ccp_alpha</code></td></tr>
    <tr><td>Attribute reuse on a path</td><td>categorical used at most once</td><td>categorical once; numeric many times</td><td>any feature many times</td><td>many times</td></tr>
    <tr><td>Output</td><td>tree</td><td>tree or rule set (C4.5rules)</td><td>tree</td><td>tree</td></tr>
  </table>
  <p>Relatives worth one line each: <strong>C5.0</strong> is the faster commercial successor of C4.5 (boosting, smaller trees). <strong>CHAID</strong> uses chi-square tests to choose multiway splits and is popular in marketing segmentation. <strong>Conditional inference trees</strong> (R's <code>ctree</code>) use permutation tests to choose the column, which removes the bias towards many-valued columns.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why did binary splits win? A binary split on a 50-value column does not shatter the data into 50 tiny groups in one step, so it is less biased to many values. Binary trees can still express any multiway split as a few binary ones. And numeric features naturally give binary questions (x ≤ t). Every modern library (sklearn, XGBoost, LightGBM, CatBoost) grows binary trees.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"sklearn implements C4.5 if I set criterion='entropy'" is wrong. It is still CART: binary splits, no gain ratio, no fractional missing handling, no pessimistic pruning. Only the impurity function changes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Numeric Features.</b> The diary had only categories. Real tables are full of numbers: salary, age, monthly bill. A number has hundreds of possible cut-offs. Which ones does a tree try?</div>

  <h2 id="dt-numeric"><span class="num">09</span>Numeric Features: Finding the Best Threshold</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every split so far was on a category. The captain's humidity reading is a number (65 to 96%), and a number has many possible cut-offs. Which cut-offs does a tree try, and which one wins on the diary?</p>
  </div>
  <h3>The need</h3>
  <p>A numeric column (humidity, monthly bill, age, salary) cannot get one branch per value: a humidity of 86% or a bill of ₹4,512 would get its own branch, the ID-column problem again. Instead, C4.5 and CART ask a binary question <strong>"x ≤ t?"</strong>. The only job is to choose t.</p>
  <h3>Which thresholds are worth trying?</h3>
  <p>Between two neighbouring values in the sorted data, every t gives exactly the same split. If two neighbouring humidity readings are 80 and 85, then t = 81, 82.5 and 84.9 all send the same days left. So with n distinct values there are only n − 1 different splits. By convention the tree uses the <strong>midpoint</strong> between neighbours, which places the boundary halfway between the two closest training rows (a fair guess for unseen values in the gap).</p>
  <div class="flow"><span>Sort rows by x (once)</span><span>Candidate t = midpoint of each neighbouring pair</span><span>Scan left to right, updating class counts</span><span>Score each t (weighted impurity)</span><span>Keep the best t</span></div>
  <h3>Worked by hand: the diary's humidity reading</h3>
  <p>The captain wrote down the humidity in % (column HumPct in <code>play.py</code>; the "High" days read 85–96, the "Normal" days 65–80). Sorted, with Y = played and N = not played:</p>
  <table class="tbl">
    <tr><th>Sorted HumPct</th><td>65</td><td>70</td><td>70</td><td>70</td><td>75</td><td>80</td><td>80</td><td>85</td><td>86</td><td>90</td><td>90</td><td>91</td><td>95</td><td>96</td></tr>
    <tr><th>Played</th><td>Y</td><td>N</td><td>Y</td><td>Y</td><td>Y</td><td>Y</td><td>Y</td><td>N</td><td>Y</td><td>N</td><td>Y</td><td>N</td><td>N</td><td>Y</td></tr>
  </table>
  <p>14 days but only 10 distinct values, so there are 9 candidate midpoints. The parent is [9 Y, 5 N] with Gini 0.459 (section 06).</p>
  <figure class="viz"><svg viewBox="0 0 620 175" width="620">
<line x1="40" y1="96" x2="580" y2="96" stroke="currentColor"/>
<circle cx="70.9" cy="96" r="7" class="fg sg"/>
<circle cx="148.0" cy="96" r="7" class="fr sr"/>
<circle cx="148.0" cy="79" r="7" class="fg sg"/>
<circle cx="148.0" cy="62" r="7" class="fg sg"/>
<circle cx="225.1" cy="96" r="7" class="fg sg"/>
<circle cx="302.3" cy="96" r="7" class="fg sg"/>
<circle cx="302.3" cy="79" r="7" class="fg sg"/>
<circle cx="379.4" cy="96" r="7" class="fr sr"/>
<circle cx="394.9" cy="96" r="7" class="fg sg"/>
<circle cx="456.6" cy="96" r="7" class="fr sr"/>
<circle cx="456.6" cy="79" r="7" class="fg sg"/>
<circle cx="472.0" cy="96" r="7" class="fr sr"/>
<circle cx="533.7" cy="96" r="7" class="fr sr"/>
<circle cx="549.1" cy="96" r="7" class="fg sg"/>
<text x="70.9" y="116" text-anchor="middle" font-size="10.5">65</text>
<text x="148.0" y="116" text-anchor="middle" font-size="10.5">70</text>
<text x="225.1" y="116" text-anchor="middle" font-size="10.5">75</text>
<text x="302.3" y="116" text-anchor="middle" font-size="10.5">80</text>
<text x="379.4" y="116" text-anchor="middle" font-size="10.5">85</text>
<text x="394.9" y="116" text-anchor="middle" font-size="10.5">86</text>
<text x="456.6" y="116" text-anchor="middle" font-size="10.5">90</text>
<text x="472.0" y="116" text-anchor="middle" font-size="10.5">91</text>
<text x="533.7" y="116" text-anchor="middle" font-size="10.5">95</text>
<text x="549.1" y="116" text-anchor="middle" font-size="10.5">96</text>
<g stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.5">
<line x1="109.4" y1="30" x2="109.4" y2="104"/>
<line x1="186.6" y1="30" x2="186.6" y2="104"/>
<line x1="263.7" y1="30" x2="263.7" y2="104"/>
<line x1="387.1" y1="30" x2="387.1" y2="104"/>
<line x1="425.7" y1="30" x2="425.7" y2="104"/>
<line x1="464.3" y1="30" x2="464.3" y2="104"/>
<line x1="502.9" y1="30" x2="502.9" y2="104"/>
<line x1="541.4" y1="30" x2="541.4" y2="104"/>
</g>
<line x1="340.9" y1="18" x2="340.9" y2="108" class="sb" stroke-width="3"/>
<text x="109.4" y="26" text-anchor="middle" class="tm" font-size="9.5">.440</text>
<text x="186.6" y="26" text-anchor="middle" class="tm" font-size="9.5">.450</text>
<text x="263.7" y="26" text-anchor="middle" class="tm" font-size="9.5">.432</text>
<text x="340.9" y="12" text-anchor="middle" class="tb" font-size="11">t = 82.5 → .367 best</text>
<text x="387.1" y="26" text-anchor="middle" class="tm" font-size="9.5">.429</text>
<text x="425.7" y="26" text-anchor="middle" class="tm" font-size="9.5">.394</text>
<text x="464.3" y="26" text-anchor="middle" class="tm" font-size="9.5">.407</text>
<text x="502.9" y="26" text-anchor="middle" class="tm" font-size="9.5">.452</text>
<text x="541.4" y="26" text-anchor="middle" class="tm" font-size="9.5">.440</text>
<text x="310" y="142" text-anchor="middle" class="tm" font-size="11">green = played, red = not · dashed = candidate cuts · numbers = weighted Gini</text>
<text x="310" y="162" text-anchor="middle" class="tm" font-size="11">cuts at 77.5 and 93 sit between days of one class only: they can never be best</text>
</svg><figcaption>Nine candidate thresholds for ten distinct humidity values. The best cut, at 82.5, separates exactly the Normal days from the High days.</figcaption></figure>
  <p>Two candidates by hand. <strong>t = 82.5</strong>: left = the 7 days at or below 80 = [6 Y, 1 N], Gini 1 − (6/7)² − (1/7)² = 0.245; right = the 7 days from 85 up = [3 Y, 4 N], Gini 1 − (3/7)² − (4/7)² = 0.490. Weighted: 0.5 × 0.245 + 0.5 × 0.490 = <strong>0.367</strong>, a gain of 0.092. <strong>t = 88.0</strong>: left 9 days [7 Y, 2 N], Gini 1 − (7/9)² − (2/9)² = 0.346; right 5 days [2 Y, 3 N], Gini 0.480. Weighted (9/14)(0.346) + (5/14)(0.480) = 0.222 + 0.171 = <strong>0.394</strong>. Lower is better, so 82.5 wins.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
from play import df
x = df.HumPct.values                                 # humidity reading, %
y = (df.Play == "Yes").astype(int).values            # 1 = played
def gini(v):
    if len(v) == 0: return 0.0
    p = v.mean()
    return 1 - p ** 2 - (1 - p) ** 2
def entropy(v):
    p = v.mean()
    return 0.0 if p in (0, 1) else -(p * np.log2(p) + (1 - p) * np.log2(1 - p))

order = np.argsort(x, kind="stable")                 # step 1: sort once
xs, ys = x[order], y[order]
print("sorted x:", xs.tolist())
print("played:  ", ys.tolist())
vals = np.unique(xs)
for t in (vals[:-1] + vals[1:]) / 2:                 # step 2: midpoints between distinct values
    L, R = ys[xs &lt;= t], ys[xs &gt; t]
    wg = len(L) / 14 * gini(L) + len(R) / 14 * gini(R)
    we = len(L) / 14 * entropy(L) + len(R) / 14 * entropy(R)
    print(f"x &lt;= {t:4.1f}: left [{L.sum()} Y, {len(L) - L.sum()} N] right [{R.sum()} Y, {len(R) - R.sum()} N]"
          f"  weighted Gini {wg:.3f}  Gini gain {gini(ys) - wg:.3f}  IG {entropy(ys) - we:.3f}")
t = DecisionTreeClassifier(max_depth=1).fit(df[["HumPct"]], df.Play)
print("sklearn root threshold:", t.tree_.threshold[0])</div>
  <div class="fx" data-lang="text">sorted x: [65, 70, 70, 70, 75, 80, 80, 85, 86, 90, 90, 91, 95, 96]
played:   [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1]
x &lt;= 67.5: left [1 Y, 0 N] right [8 Y, 5 N]  weighted Gini 0.440  Gini gain 0.020  IG 0.048
x &lt;= 72.5: left [3 Y, 1 N] right [6 Y, 4 N]  weighted Gini 0.450  Gini gain 0.009  IG 0.015
x &lt;= 77.5: left [4 Y, 1 N] right [5 Y, 4 N]  weighted Gini 0.432  Gini gain 0.027  IG 0.045
x &lt;= 82.5: left [6 Y, 1 N] right [3 Y, 4 N]  weighted Gini 0.367  Gini gain 0.092  IG 0.152
x &lt;= 85.5: left [6 Y, 2 N] right [3 Y, 3 N]  weighted Gini 0.429  Gini gain 0.031  IG 0.048
x &lt;= 88.0: left [7 Y, 2 N] right [2 Y, 3 N]  weighted Gini 0.394  Gini gain 0.066  IG 0.102
x &lt;= 90.5: left [8 Y, 3 N] right [1 Y, 2 N]  weighted Gini 0.407  Gini gain 0.052  IG 0.079
x &lt;= 93.0: left [8 Y, 4 N] right [1 Y, 1 N]  weighted Gini 0.452  Gini gain 0.007  IG 0.010
x &lt;= 95.5: left [8 Y, 5 N] right [1 Y, 0 N]  weighted Gini 0.440  Gini gain 0.020  IG 0.048
sklearn root threshold: 82.5</div>
  <p>The scan scores every midpoint; 82.5 has the lowest weighted Gini (0.367) and also the largest information gain, 0.152. That is exactly the IG of the categorical Humidity column in section 04, because "HumPct ≤ 82.5" separates the Normal days from the High days perfectly: the number contains the category. sklearn's root threshold is exactly 82.5, the midpoint of 80 and 85. Notice the efficiency trick in the loop: after sorting once, moving the cut one step right moves only the rows with the next value from the right group to the left group, so the class counts can be <strong>updated in O(1)</strong> per row instead of recounted. One feature at one node costs O(n log n) to sort plus O(n) to scan.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Only <strong>boundary points</strong> matter: a cut between two values that hold rows of only one and the same class can never be optimal for entropy or Gini (Fayyad &amp; Irani, 1992). On the diary, 77.5 (between 75 and 80, all played) and 93 (between 91 and 95, all not played) can be skipped without scoring them, and the winner 82.5 sits where the class changes (80: played, 85: not). Fast libraries go further and try only a few hundred <strong>histogram bin edges</strong> instead of every midpoint; see <a class="xref" data-note="ml_lightgbm">LightGBM</a>.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a numeric feature x_j with sorted distinct values v₁ &lt; v₂ &lt; … &lt; v_m in node S, the candidate splits are x_j ≤ tᵢ with tᵢ = (vᵢ + vᵢ₊₁) / 2, for i = 1…m−1. The chosen split maximises the impurity decrease over all features j and all candidates tᵢ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trees do not care about the <em>scale</em> of a number, only its <em>order</em>. Standardising, log-transforming or any other monotonic change leaves the tree's splits (and predictions) the same; only the threshold values printed change. So scaling is wasted work for trees (but harmless). A non-monotonic change, like taking x², does change the tree.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Categorical Features.</b> Numbers have a natural order, so "x ≤ t" makes sense. A category like city (Delhi, Mumbai, Pune, Chennai) has no order. How does a binary tree split it?</div>

  <h2 id="dt-cat"><span class="num">10</span>Categorical Features in CART</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Humidity has a natural order, so "HumPct ≤ 82.5" makes sense. Outlook (Sunny, Overcast, Rain) has no order. How does a tree that only makes two-way splits divide three unordered values, and how does that scale to many values?</p>
  </div>
  <h3>All binary groupings</h3>
  <p>A CART split on a category sends some values left and the rest right. With k values there are 2^(k−1) − 1 different groupings (each value goes left or right: 2^k ways; divide by 2 because swapping left and right is the same split; subtract the useless "all on one side"). For k = 4 that is 7, for k = 10 it is 511, for k = 30 it is over 500 million. Trying all of them quickly becomes impossible.</p>
  <p><strong>On the diary.</strong> Outlook has k = 3 values, so there are 2² − 1 = 3 groupings, and section 06 already scored them with Gini: {Overcast} vs {Sunny, Rain} gains <strong>0.102</strong>, {Sunny} vs rest 0.066, {Rain} vs rest 0.002. CART keeps the first.</p>
  <h3>The shortcut for two classes (Breiman's sorting trick)</h3>
  <p>For a two-class target (or a regression target), a theorem in the CART book (Breiman et al., 1984) saves the day: <strong>sort the categories by their share of class 1 (or by mean target), then the best grouping is one of the k − 1 "prefix" splits of that sorted list</strong>. It turns the category into an ordered number, and then it is just the numeric case.</p>
  <p><strong>On the diary.</strong> Play-rates: Sunny 2/5 = 0.4, Rain 3/5 = 0.6, Overcast 4/4 = 1.0. Sorted: Sunny, Rain, Overcast. The k − 1 = 2 prefix splits are {Sunny} | {Rain, Overcast} (gain 0.066) and {Sunny, Rain} | {Overcast} (gain 0.102). The better one is the grouping brute force found, with 2 tries instead of 3. With more values the saving grows quickly; here is a 4-value check by brute force.</p>
  <table class="tbl"><caption>40 customers in 4 cities (parent: 16 churn, 24 stay, Gini 0.48)</caption>
    <tr><th>City</th><th>churn</th><th>stay</th><th>churn rate</th></tr>
    <tr><td>Delhi</td><td>8</td><td>2</td><td>0.8</td></tr>
    <tr><td>Mumbai</td><td>2</td><td>8</td><td>0.2</td></tr>
    <tr><td>Pune</td><td>5</td><td>5</td><td>0.5</td></tr>
    <tr><td>Chennai</td><td>1</td><td>9</td><td>0.1</td></tr>
  </table>
  <p>By hand for the grouping {Delhi, Pune} vs {Mumbai, Chennai}: left = 13 churn / 7 stay, Gini 1 − 0.65² − 0.35² = 0.455; right = 3 / 17, Gini 1 − 0.15² − 0.85² = 0.255. Both have 20 rows, so weighted = 0.5 × 0.455 + 0.5 × 0.255 = 0.355. Gain = 0.48 − 0.355 = <strong>0.125</strong>.</p>
  <div class="fx" data-lang="py">import numpy as np
from itertools import combinations
counts = {"Delhi": (8, 2), "Mumbai": (2, 8), "Pune": (5, 5), "Chennai": (1, 9)}   # (churn, stay)
def gini(c, s):
    n = c + s
    return 0.0 if n == 0 else 1 - (c / n) ** 2 - (s / n) ** 2
def split_gain(left):
    L = [sum(counts[k][i] for k in left) for i in (0, 1)]
    R = [sum(counts[k][i] for k in counts if k not in left) for i in (0, 1)]
    n = sum(L) + sum(R)
    return gini(16, 24) - sum(L) / n * gini(*L) - sum(R) / n * gini(*R)

cities = list(counts)
seen = []
for r in range(1, len(cities)):
    for left in combinations(cities, r):
        right = tuple(c for c in cities if c not in left)
        if right in seen: continue                 # {A}|{B} is the same split as {B}|{A}
        seen.append(left)
        print(f"{'{'+', '.join(left)+'}':26s} vs rest  gain {split_gain(left):.4f}")
print("all binary partitions:", len(seen), "= 2^(k-1) - 1 =", 2 ** (len(cities) - 1) - 1)
order = sorted(cities, key=lambda c: counts[c][0] / sum(counts[c]))   # sort by churn rate
print("sorted by churn rate:", order)
for i in range(1, len(order)):
    print(f"ordered split {order[:i]} | {order[i:]}  gain {split_gain(tuple(order[:i])):.4f}")</div>
  <div class="fx" data-lang="text">{Delhi}                    vs rest  gain 0.1067
{Mumbai}                   vs rest  gain 0.0267
{Pune}                     vs rest  gain 0.0067
{Chennai}                  vs rest  gain 0.0600
{Delhi, Mumbai}            vs rest  gain 0.0200
{Delhi, Pune}              vs rest  gain 0.1250
{Delhi, Chennai}           vs rest  gain 0.0050
all binary partitions: 7 = 2^(k-1) - 1 = 7
sorted by churn rate: ['Chennai', 'Mumbai', 'Pune', 'Delhi']
ordered split ['Chennai'] | ['Mumbai', 'Pune', 'Delhi']  gain 0.0600
ordered split ['Chennai', 'Mumbai'] | ['Pune', 'Delhi']  gain 0.1250
ordered split ['Chennai', 'Mumbai', 'Pune'] | ['Delhi']  gain 0.1067</div>
  <p>Brute force over all 7 groupings finds {Delhi, Pune} vs rest (0.125) as the best. Sorting cities by churn rate gives Chennai (0.1), Mumbai (0.2), Pune (0.5), Delhi (0.8), and the best of only 3 prefix splits is {Chennai, Mumbai} | {Pune, Delhi}: the same grouping, the same 0.125, with 3 tries instead of 7. For 30 cities: 29 tries instead of 536,870,911. (For three or more classes there is no exact shortcut; libraries use heuristics.)</p>
  <h3>What sklearn does: you must encode</h3>
  <p>sklearn's trees accept only numbers, so you choose an encoding, and that choice changes the shape of the tree.</p>
  <div class="cards">
    <div><b>One-hot</b><p>One 0/1 column per value. Each split can only peel off <em>one</em> value ("city = Pune?"). Grouping 8 risky cities needs about 8 levels.</p><small>Deep, lopsided trees; many columns</small></div>
    <div><b>Ordinal (arbitrary codes)</b><p>Delhi = 0, Mumbai = 1, … Splits "code ≤ 2.5" group neighbours in a meaningless order; it takes several cuts to collect the right values.</p><small>Compact but order is fake</small></div>
    <div><b>Ordered by target rate</b><p>Replace each value by its churn rate in the training data (target encoding). Now one cut groups all risky cities: the Breiman trick by hand.</p><small>Best shape; risk of target leakage</small></div>
  </div>
  <p>The experiment: 20 cities, 8 of them risky (70% churn vs 20%). Train on half, test on the other half, with and without a depth limit of 2.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
n, k = 4000, 20
city = rng.integers(0, k, n)                         # 20 cities, coded 0..19 in random order
risky = np.isin(city, [1, 4, 6, 9, 12, 13, 17, 19])  # 8 "risky" cities churn more
y = (rng.random(n) &lt; np.where(risky, 0.7, 0.2)).astype(int)
df = pd.DataFrame({"city": city.astype(str), "y": y})
tr, te = train_test_split(df, test_size=0.5, random_state=0)

def fit(Xtr, Xte, name):
    for d in [None, 2]:
        t = DecisionTreeClassifier(max_depth=d, min_samples_leaf=20, random_state=0).fit(Xtr, tr.y)
        print(f"{name:22s} max_depth={str(d):4s} depth {t.get_depth():2d}  leaves {t.get_n_leaves():2d}"
              f"  test acc {t.score(Xte, te.y):.3f}")

oh_tr = pd.get_dummies(tr.city); oh_te = pd.get_dummies(te.city).reindex(columns=oh_tr.columns, fill_value=0)
fit(oh_tr, oh_te, "one-hot")
fit(tr[["city"]].astype(int), te[["city"]].astype(int), "ordinal (arbitrary)")
rate = tr.groupby("city").y.mean()                    # churn rate per city, TRAIN rows only
fit(tr.city.map(rate).to_frame(), te.city.map(rate).to_frame(), "ordered by churn rate")</div>
  <div class="fx" data-lang="text">one-hot                max_depth=None depth 19  leaves 20  test acc 0.758
one-hot                max_depth=2    depth  2  leaves  3  test acc 0.626
ordinal (arbitrary)    max_depth=None depth 11  leaves 20  test acc 0.758
ordinal (arbitrary)    max_depth=2    depth  2  leaves  3  test acc 0.621
ordered by churn rate  max_depth=None depth  6  leaves 19  test acc 0.758
ordered by churn rate  max_depth=2    depth  2  leaves  4  test acc 0.758</div>
  <p>With no depth limit all three reach the same test accuracy (0.758), but one-hot needs a depth-19 tree, ordinal 11, the ordered encoding only 6. With <code>max_depth=2</code> the difference becomes accuracy: one-hot can isolate only 2 cities and drops to 0.626, arbitrary codes to 0.621, while the ordered encoding still separates risky from safe (0.758). In real trees, depth is always limited (by you, or by min_samples_leaf), so encoding matters.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Target encoding computed on the same rows the tree trains on leaks the answer, worst for rare categories (a city with one customer gets rate 0 or 1). Compute the rates on training folds only (out-of-fold) or with smoothing. <a class="xref" data-note="ml_catboost">CatBoost</a> was built around solving exactly this; <a class="xref" data-note="ml_lightgbm">LightGBM</a> has native categorical splits that use the sorting trick internally.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Regression Trees.</b> So far every target was a class. What if the target is a number, like salary or house price? There are no classes to count, so entropy and Gini cannot be used.</div>

  <h2 id="dt-reg"><span class="num">11</span>Regression Trees</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Play is a class, so we counted Yes and No. The captain's turnout column is a number (20 to 48 members). There are no classes to count, so entropy and Gini do not apply. How does a tree predict a number?</p>
  </div>
  <h3>Plain words</h3>
  <p>For a numeric target, "pure" means "all the numbers in the box are close to each other". The natural measure of spread is the <strong>variance</strong>: the average squared distance from the mean (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>). A regression tree chooses the split that most reduces the size-weighted variance of the children, and each leaf predicts the <strong>mean</strong> of its training rows.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Node impurity for regression: MSE(S) = (1/|S|) Σ_{i∈S} (yᵢ − ȳ_S)², which is the variance of y in S. <strong>Variance reduction</strong> = MSE(S) − (|S_L|/|S|) MSE(S_L) − (|S_R|/|S|) MSE(S_R). Leaf prediction ĉ = ȳ (the mean), because the mean is the constant that minimises squared error.</p>
  </div>
  <h3>Worked by hand: predicting the turnout</h3>
  <p>The captain also counted how many club members came to the ground each evening (Turnout in <code>play.py</code>): 24, 20, 36, 32, 44, 22, 42, 26, 40, 46, 38, 38, 48, 20 for D1–D14. Can the humidity reading predict it?</p>
  <p><strong>Parent.</strong> Sum 476, mean 476 / 14 = 34. Squared deviations from 34: 100, 196, 4, 4, 100, 144, 64, 64, 36, 144, 16, 16, 196, 196; total 1280; MSE = 1280 / 14 = <strong>91.43</strong>.</p>
  <p><strong>Split at 82.5</strong> (Normal vs High humidity). Left, the 7 days at or below 80: 44, 22, 42, 40, 46, 38, 48; mean 280 / 7 = 40; squared deviations 16 + 324 + 4 + 0 + 36 + 4 + 64 = 448; MSE 64. Right, the 7 humid days: 24, 20, 36, 32, 26, 38, 20; mean 196 / 7 = 28; squared deviations 16 + 64 + 64 + 16 + 4 + 100 + 64 = 328; MSE 46.86. Weighted: 0.5 × 64 + 0.5 × 46.86 = <strong>55.43</strong>. Reduction = 91.43 − 55.43 = <strong>36.0</strong>.</p>
  <p><strong>Split at 88.0.</strong> Left 9 days, mean 37.78, MSE 75.06; right 5 days (20, 38, 20, 26, 32), mean 27.2, MSE 48.96. Weighted (9/14)(75.06) + (5/14)(48.96) = 65.74. Reduction 25.7, worse.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
from play import df
x = df.HumPct.values                                 # humidity, %
y = df.Turnout.values.astype(float)                  # members who came to the ground
def mse(v): return ((v - v.mean()) ** 2).mean() if len(v) else 0.0
print(f"parent: mean {y.mean():.2f}  MSE {mse(y):.3f}")
vals = np.unique(x)
for t in (vals[:-1] + vals[1:]) / 2:
    L, R = y[x &lt;= t], y[x &gt; t]
    w = len(L) / len(y) * mse(L) + len(R) / len(y) * mse(R)
    print(f"x &lt;= {t:4.1f}: left n={len(L):2d} mean {L.mean():5.2f} MSE {mse(L):6.2f} | right n={len(R):2d}"
          f" mean {R.mean():5.2f} MSE {mse(R):6.2f} | weighted {w:6.2f}  reduction {mse(y) - w:5.2f}")
t = DecisionTreeRegressor(max_depth=1).fit(df[["HumPct"]], y)
print(export_text(t, feature_names=["HumPct"]))
print("predict humidity 50, 85 and 100:", t.predict(np.array([[50], [85], [100]])))</div>
  <div class="fx" data-lang="text">parent: mean 34.00  MSE 91.429
x &lt;= 67.5: left n= 1 mean 42.00 MSE   0.00 | right n=13 mean 33.38 MSE  93.16 | weighted  86.51  reduction  4.92
x &lt;= 72.5: left n= 4 mean 35.50 MSE  62.75 | right n=10 mean 33.40 MSE 101.64 | weighted  90.53  reduction  0.90
x &lt;= 77.5: left n= 5 mean 38.00 MSE  75.20 | right n= 9 mean 31.78 MSE  86.62 | weighted  82.54  reduction  8.89
x &lt;= 82.5: left n= 7 mean 40.00 MSE  64.00 | right n= 7 mean 28.00 MSE  46.86 | weighted  55.43  reduction 36.00
x &lt;= 85.5: left n= 8 mean 38.00 MSE  84.00 | right n= 6 mean 28.67 MSE  51.56 | weighted  70.10  reduction 21.33
x &lt;= 88.0: left n= 9 mean 37.78 MSE  75.06 | right n= 5 mean 27.20 MSE  48.96 | weighted  65.74  reduction 25.69
x &lt;= 90.5: left n=11 mean 36.18 MSE  87.60 | right n= 3 mean 26.00 MSE  24.00 | weighted  73.97  reduction 17.45
x &lt;= 93.0: left n=12 mean 34.83 MSE 100.31 | right n= 2 mean 29.00 MSE   9.00 | weighted  87.26  reduction  4.17
x &lt;= 95.5: left n=13 mean 34.15 MSE  98.13 | right n= 1 mean 32.00 MSE   0.00 | weighted  91.12  reduction  0.31
|--- HumPct &lt;= 82.50
|   |--- value: [40.00]
|--- HumPct &gt;  82.50
|   |--- value: [28.00]

predict humidity 50, 85 and 100: [40. 28. 28.]</div>
  <p>All nine candidates are scored; 82.5 wins with a reduction of 36.0, and sklearn's depth-1 tree uses the same threshold with leaf values 40 and 28, the two means. The same cut won for the class Play in section 09: humidity drives both whether they play and how many come. The last line shows a key limit: a humidity of 100% is outside the diary, yet the prediction is 28, the same as for 85%; and 50% gets 40, the same as 65%. <strong>A regression tree cannot extrapolate</strong>: its output is always one of its leaf means, so it is a flat step function and never goes above the largest (or below the smallest) leaf mean it learnt.</p>
  <figure class="viz"><svg viewBox="0 0 600 265" width="600">
<line x1="60" y1="225" x2="560" y2="225" stroke="currentColor"/><line x1="60" y1="25" x2="60" y2="225" stroke="currentColor"/>
<text x="54" y="202.0" text-anchor="end" class="tm" font-size="10.5">20</text>
<text x="54" y="147.9" text-anchor="end" class="tm" font-size="10.5">30</text>
<text x="54" y="93.9" text-anchor="end" class="tm" font-size="10.5">40</text>
<text x="54" y="39.8" text-anchor="end" class="tm" font-size="10.5">50</text>
<text x="100.5" y="240" text-anchor="middle" class="tm" font-size="10.5">65</text>
<text x="168.1" y="240" text-anchor="middle" class="tm" font-size="10.5">70</text>
<text x="235.7" y="240" text-anchor="middle" class="tm" font-size="10.5">75</text>
<text x="303.2" y="240" text-anchor="middle" class="tm" font-size="10.5">80</text>
<text x="370.8" y="240" text-anchor="middle" class="tm" font-size="10.5">85</text>
<text x="438.4" y="240" text-anchor="middle" class="tm" font-size="10.5">90</text>
<text x="505.9" y="240" text-anchor="middle" class="tm" font-size="10.5">95</text>
<text x="310.0" y="257" text-anchor="middle" class="tm" font-size="11">humidity HumPct (%)</text>
<text x="14" y="125.0" class="tm" font-size="11" transform="rotate(-90 14 125.0)" text-anchor="middle">turnout</text>
<line x1="60" y1="122.3" x2="560" y2="122.3" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="556" y="117.3" text-anchor="end" class="tm" font-size="10.5">parent mean 34</text>
<polyline points="60,89.9 337.0,89.9 337.0,154.7 560,154.7" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="370.8" cy="176.4" r="4.5" class="fr sr"/>
<circle cx="438.4" cy="198.0" r="4.5" class="fr sr"/>
<circle cx="384.3" cy="111.5" r="4.5" class="fr sr"/>
<circle cx="519.5" cy="133.1" r="4.5" class="fr sr"/>
<circle cx="303.2" cy="68.2" r="4.5" class="fr sr"/>
<circle cx="168.1" cy="187.2" r="4.5" class="fr sr"/>
<circle cx="100.5" cy="79.1" r="4.5" class="fr sr"/>
<circle cx="505.9" cy="165.5" r="4.5" class="fr sr"/>
<circle cx="168.1" cy="89.9" r="4.5" class="fr sr"/>
<circle cx="303.2" cy="57.4" r="4.5" class="fr sr"/>
<circle cx="168.1" cy="100.7" r="4.5" class="fr sr"/>
<circle cx="438.4" cy="100.7" r="4.5" class="fr sr"/>
<circle cx="235.7" cy="46.6" r="4.5" class="fr sr"/>
<circle cx="451.9" cy="198.0" r="4.5" class="fr sr"/>
<text x="114.1" y="81.9" class="tb" font-size="11">leaf mean 40</text>
<text x="384.3" y="170.7" class="tb" font-size="11">leaf mean 28</text>
<text x="341.0" y="35.8" class="tm" font-size="10.5">HumPct ≤ 82.5</text>
<text x="178.1" y="191.2" class="tm" font-size="10">D6 (22)</text>
</svg><figcaption>A depth-1 regression tree on the diary is a step: mean 40 for the seven normal-humidity days, mean 28 for the seven humid ones. Deeper trees make more, smaller steps, but always flat ones. D6, the low point at 70%, pulls the left mean down.</figcaption></figure>
  <h3>Other regression criteria: MAE gives the median</h3>
  <p>With <code>criterion="absolute_error"</code> the tree minimises the sum of |y − c| and the best constant in a leaf is the <strong>median</strong>, not the mean. That makes leaves robust to outliers. The normal-humidity leaf has one: D6, a cold, windy, rainy evening when only 22 members came.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from play import df
leaf = df[df.HumPct &lt;= 82.5].Turnout.values.astype(float)   # the normal-humidity leaf
print("turnouts in the leaf:", leaf.tolist())
X = np.zeros((len(leaf), 1))                                # one leaf: no split possible
for crit in ["squared_error", "absolute_error"]:
    t = DecisionTreeRegressor(criterion=crit).fit(X, leaf)
    print(f"{crit:15s} leaf value = {t.predict([[0]])[0]}")
print("mean", leaf.mean(), " median", np.median(leaf))
for c in [40, 42]:
    print(f"constant {c}: total |error| {np.abs(leaf - c).sum():5.1f}   total squared error {((leaf - c)**2).sum():6.1f}")</div>
  <div class="fx" data-lang="text">turnouts in the leaf: [44.0, 22.0, 42.0, 40.0, 46.0, 38.0, 48.0]
squared_error   leaf value = 40.0
absolute_error  leaf value = 42.0
mean 40.0  median 42.0
constant 40: total |error|  40.0   total squared error  448.0
constant 42: total |error|  38.0   total squared error  476.0</div>
  <p>The leaf holds 44, 22, 42, 40, 46, 38, 48. Squared error picks the mean 40, pulled down by D6 alone; absolute error picks the median 42, which does not care how far below the others D6 is. The last two lines confirm each choice is optimal for its own loss: 42 has the smaller total absolute error (38 vs 40), 40 the smaller total squared error (448 vs 476).</p>
  <table class="tbl">
    <tr><th>sklearn criterion</th><th>Impurity</th><th>Leaf value</th><th>When</th></tr>
    <tr><td><code>squared_error</code> (default)</td><td>variance / MSE</td><td>mean</td><td>usual choice</td></tr>
    <tr><td><code>friedman_mse</code></td><td>MSE with Friedman's improvement score for splits</td><td>mean</td><td>used inside gradient boosting</td></tr>
    <tr><td><code>absolute_error</code></td><td>mean absolute deviation from the median</td><td>median</td><td>outliers in y; much slower</td></tr>
    <tr><td><code>poisson</code></td><td>Poisson deviance</td><td>mean (must be &gt; 0)</td><td>counts: claims, visits, calls</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Remember regression trees even if you only care about classification. <a class="xref" data-note="ml_gbm">Gradient Boosting</a> builds <em>every</em> model, including classifiers, out of small regression trees that predict residuals (gradients). <a class="xref" data-note="ml_xgboost">XGBoost</a> changes only how a leaf's value and the split score are computed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not use a single regression tree (or a random forest) for a target with a trend, like sales growing every month: predictions flatten at the last leaf's level. Add a trend feature that a linear model handles, model the change instead of the level, or use a linear model. <a class="xref" data-note="ml_rf">Random Forest</a> demonstrates the same limit.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Overfitting &amp; Instability.</b> We now know how to grow a tree on any kind of column and target. Left alone, the growing loop never stops until every leaf is pure. On real, noisy data that is a disaster.</div>

  <h2 id="dt-overfit"><span class="num">12</span>Overfitting and Instability</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The growing loop never stops by itself until every leaf is pure. On the 14 diary days that looked harmless (five clean rules). What happens on noisy, realistic data, and how much does the tree change when the data changes a little?</p>
  </div>
  <h3>On the diary: one day changes the tree</h3>
  <p>Remove one day at a time from the diary and choose the root again with information gain:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, a):
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(a))
cats = ["Outlook", "Temp", "Humidity", "Wind"]
for day in df.index:                                  # remove ONE day, re-choose the root
    d = df.drop(day)
    g = {a: IG(d, a) for a in cats}
    root = max(g, key=g.get)
    if root != "Outlook":
        print(f"without {day:3s} ({df.Outlook[day]}, {df.Humidity[day]}, {df.Play[day]}): root = {root}"
              f"  IG Humidity {g['Humidity']:.3f} vs Outlook {g['Outlook']:.3f}")
print("for the other 11 days removed, the root stays Outlook")</div>
  <div class="fx" data-lang="text">without D3  (Overcast, High, Yes): root = Humidity  IG Humidity 0.219 vs Outlook 0.214
without D6  (Rain, Normal, No): root = Humidity  IG Humidity 0.360 vs Outlook 0.267
without D12 (Overcast, High, Yes): root = Humidity  IG Humidity 0.219 vs Outlook 0.214
for the other 11 days removed, the root stays Outlook</div>
  <p>Removing D3 (an overcast, humid day when they played) leaves Outlook with 0.214 and Humidity with 0.219: Humidity becomes the root, and every question below it changes. Removing D6 or D12 does the same. Three of the fourteen days each flip the root on their own. The data barely changed (13 of 14 days are identical), but the model did. That is <strong>instability</strong>, and it comes from two splits with nearly equal gain at the top of a greedy search.</p>
  <h3>The same idea at scale: the churn dataset</h3>
  <p>Small tables are good for hand calculation, but overfitting only shows on realistic data. From here on the "churn" code blocks share the dataset used across the whole tree family, so their numbers can be compared with <a class="xref" data-note="ml_rf">Random Forest</a>, <a class="xref" data-note="ml_gbm">Gradient Boosting</a> and the rest.</p>
  <div class="callout def"><span class="label">The churn dataset (file common.py)</span>
    <p>20,000 fake customers. 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixes of those, 4 are useless), plus two pure-noise columns: <code>row_noise</code> (20,000 different random values) and <code>coin_noise</code> (random 0/1). 5% of labels are flipped at random, so even a perfect model cannot pass about 0.95. Split: 12,000 train / 3,000 validation / 5,000 test.</p>
  </div>
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
  <h3>Watching a tree memorise</h3>
  <p>Grow trees of increasing depth and score each on the rows it learnt from (train) and on rows it never saw (validation). The last two lines inspect the fully grown tree: <code>apply</code> returns the leaf each training row lands in, and <code>bincount</code> counts rows per leaf.</p>
  <div class="fx" data-lang="py">from common import *
for d in [1, 3, 6, 10, 15, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr)
    print(f"max_depth={str(d):5s} depth={t.get_depth():2d} leaves={t.get_n_leaves():5d}"
          f"  train {t.score(Xtr, ytr):.3f}  val {t.score(Xva, yva):.3f}")
full = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)
sizes = np.bincount(full.apply(Xtr))                    # rows that land in each node
leaf_sizes = sizes[sizes &gt; 0]
print(f"full tree: {np.mean(leaf_sizes &lt;= 2):.0%} of its leaves hold 1 or 2 training rows")</div>
  <div class="fx" data-lang="text">max_depth=1     depth= 1 leaves=    2  train 0.601  val 0.597
max_depth=3     depth= 3 leaves=    8  train 0.684  val 0.690
max_depth=6     depth= 6 leaves=   61  train 0.781  val 0.767
max_depth=10    depth=10 leaves=  399  train 0.876  val 0.807
max_depth=15    depth=15 leaves= 1024  train 0.960  val 0.786
max_depth=None  depth=31 leaves= 1413  train 1.000  val 0.773
full tree: 53% of its leaves hold 1 or 2 training rows</div>
  <figure class="viz"><svg viewBox="0 0 580 250" width="580">
<line x1="50" y1="210" x2="560" y2="210" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="210" stroke="currentColor"/>
<text x="44" y="204" text-anchor="end" class="tm" font-size="11">0.6</text><text x="44" y="124" text-anchor="end" class="tm" font-size="11">0.8</text><text x="44" y="44" text-anchor="end" class="tm" font-size="11">1.0</text>
<line x1="50" y1="120" x2="560" y2="120" stroke="currentColor" stroke-opacity="0.15"/>
<polyline points="70,200 160,166 250,128 340,90 430,56 520,40" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="70,201 160,164 250,133 340,117 430,126 520,131" fill="none" class="sr" stroke-width="2.5"/>
<circle cx="340" cy="117" r="5" class="fg sg"/>
<text x="70" y="226" text-anchor="middle" class="tm" font-size="11">1</text><text x="160" y="226" text-anchor="middle" class="tm" font-size="11">3</text><text x="250" y="226" text-anchor="middle" class="tm" font-size="11">6</text><text x="340" y="226" text-anchor="middle" class="tm" font-size="11">10</text><text x="430" y="226" text-anchor="middle" class="tm" font-size="11">15</text><text x="520" y="226" text-anchor="middle" class="tm" font-size="11">None (31)</text>
<text x="300" y="244" text-anchor="middle" class="tm" font-size="12">max_depth</text>
<text x="470" y="34" text-anchor="end" class="tb" font-size="12">train → 1.000</text><text x="455" y="152" class="tr" font-size="12">validation 0.773</text>
<text x="340" y="104" text-anchor="middle" class="tg" font-size="12">best 0.807</text>
<text x="110" y="120" class="tm" font-size="11">underfit</text><text x="460" y="96" class="tm" font-size="11">overfit</text>
</svg><figcaption>Train accuracy (blue) climbs to 1.000; validation accuracy (red) peaks at depth 10 and then falls.</figcaption></figure>
  <p>Depth 1 (a single question) <strong>underfits</strong>: 0.60 on both sets. Depth 10 is the sweet spot: validation 0.807. Beyond it, train keeps rising to a perfect 1.000 while validation falls to 0.773. The unlimited tree is 31 levels deep with 1,413 leaves, and 53% of those leaves hold only one or two training customers. A leaf with one customer is a rule like "bill 41.3–41.5, tenure 17, age 33 → churn": it describes one person, not a pattern. That is <strong>overfitting</strong>: the tree memorised its training rows, including the 5% of flipped labels.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Preparing for an exam with last year's paper. Learning the chapters is a depth-10 tree. Memorising "question 7, answer (c)" is the 1,413-leaf tree: 100% on last year's paper, useless on this year's.</p>
  </div>
  <h3>Instability: a small change, a different tree</h3>
  <p>Overfitting has a twin. Give five analysts five slightly different samples (a random 80% of the same 12,000 rows each) and let each grow a full tree.</p>
  <div class="fx" data-lang="py">from common import *
rng = np.random.default_rng(1)
preds = []
for k in range(5):
    idx = rng.choice(len(Xtr), size=len(Xtr)*8//10, replace=False)   # a different 80% of the rows
    t = DecisionTreeClassifier(random_state=0).fit(Xtr.iloc[idx], ytr[idx])
    s = t.tree_; L = s.children_left[0]                    # node 0 = first question, L = its "yes" child
    name = lambda i: f"{Xtr.columns[s.feature[i]]} &lt;= {s.threshold[i]:.2f}"
    p = t.predict(Xva); preds.append(p)
    print(f"tree {k+1}: 1st q '{name(0)}'  2nd q '{name(L)}'  leaves {t.get_n_leaves()}  val {np.mean(p == yva):.3f}")
P = np.array(preds)                                        # 5 trees x 3000 validation rows
print(f"rows where the 5 trees do not all agree: {np.mean(P.min(0) != P.max(0)):.1%}")
vote = (P.mean(0) &gt; 0.5).astype(int)                       # majority vote of the 5 trees
print(f"majority vote of the 5 trees: val {np.mean(vote == yva):.3f}")</div>
  <div class="fx" data-lang="text">tree 1: 1st q 'f5 &lt;= 0.31'  2nd q 'f3 &lt;= -0.63'  leaves 1142  val 0.779
tree 2: 1st q 'f5 &lt;= 0.31'  2nd q 'f6 &lt;= -1.03'  leaves 1162  val 0.774
tree 3: 1st q 'f5 &lt;= 0.30'  2nd q 'f3 &lt;= -0.53'  leaves 1143  val 0.776
tree 4: 1st q 'f5 &lt;= 0.05'  2nd q 'f6 &lt;= -1.13'  leaves 1153  val 0.791
tree 5: 1st q 'f5 &lt;= -0.09'  2nd q 'f6 &lt;= -1.13'  leaves 1172  val 0.779
rows where the 5 trees do not all agree: 50.0%
majority vote of the 5 trees: val 0.840</div>
  <p>All five trees choose <code>f5</code> for the first question, but at different thresholds (0.31, 0.30, 0.05, −0.09). Because the first cut moved, a different set of rows reaches the second question, so the second question changes (f3 for some, f6 for others), and everything below changes after that. Each tree scores about 0.78, but they disagree on half of the validation customers. When they simply vote, accuracy jumps to 0.840, higher than any single tree.</p>
  <p>Why so fragile? The greedy search is <strong>hierarchical</strong>: an error or a small change at the top propagates to every node below. And two candidate splits often have nearly equal gain (like Humidity 0.219 vs Outlook 0.214 on the diary without D3); a few rows more or less flips the winner, and with it the whole subtree.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Variance</strong> of a learning method: how much its predictions change when it is trained on a different sample from the same population. <strong>Bias</strong>: the error that remains even when averaged over many training samples. A deep tree has <strong>low bias, high variance</strong>; a stump has <strong>high bias, low variance</strong>. Expected squared error = bias² + variance + irreducible noise (see <a class="xref" data-note="ml_core">Core Concepts</a>).</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>High variance is bad for one tree but it is exactly what makes trees great team players: their mistakes are partly random, and random mistakes cancel in a vote. That single observation is the starting point of <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>, <a class="xref" data-note="ml_bagging">Bagging</a> and <a class="xref" data-note="ml_rf">Random Forest</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not present a single tree's top split as "the main driver" of a business outcome. A slightly different sample moves the threshold and reshuffles every question below. Use stable importance methods from <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pre-Pruning.</b> We cannot fix variance inside a single tree (that is what ensembles are for), but we can stop it from memorising. The first family of tools stops growth early.</div>

  <h2 id="dt-pre"><span class="num">13</span>Stopping Rules (Pre-Pruning)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An unlimited tree memorises: 1,413 leaves, half of them holding one or two customers. Ensembles will fix the shakiness later, but within one tree, can we simply stop growth before it starts memorising, and which stopping rule works best?</p>
  </div>
  <p><strong>Pre-pruning</strong> (early stopping) puts limits on growth, so a node becomes a leaf even if it is not pure. It is cheap (the tree never grows the extra nodes) and is what you will do most of the time. On the diary, <code>max_depth=1</code> keeps only the Outlook question: Sunny → No, Overcast → Yes, Rain → Yes, right on 10 of the 14 days; <code>min_samples_leaf=3</code> would forbid the two-day leaves under Sunny (D9, D11) and Rain (D6, D14).</p>
  <table class="tbl">
    <tr><th>Parameter (sklearn)</th><th>Stops a split when…</th><th>Effect of raising it</th><th>Typical range</th></tr>
    <tr><td><code>max_depth</code></td><td>the node is already this deep</td><td>(lowering it) fewer, coarser regions; strongest single knob</td><td>3–15</td></tr>
    <tr><td><code>min_samples_split</code></td><td>the node has fewer rows than this</td><td>small nodes are not split further</td><td>2–100 or a fraction like 0.01</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>a child would get fewer rows than this</td><td>every leaf is backed by enough data; smooths probabilities; best general-purpose knob</td><td>1–100 or ~0.5–1% of n</td></tr>
    <tr><td><code>min_weight_fraction_leaf</code></td><td>a child's share of total sample weight would be below this</td><td>same as above but respects <code>sample_weight</code></td><td>0–0.05</td></tr>
    <tr><td><code>min_impurity_decrease</code></td><td>the weighted impurity drop (n_t/N)·Δi is below this</td><td>only "worth it" splits survive; scale depends on criterion</td><td>1e-4 – 1e-2</td></tr>
    <tr><td><code>max_leaf_nodes</code></td><td>the tree already has this many leaves</td><td>grows <em>best-first</em> (largest gain anywhere) instead of depth-first</td><td>8–512</td></tr>
    <tr><td><code>max_features</code></td><td>(does not stop) each split may only look at a random subset of columns</td><td>more randomness, faster; mostly useful inside forests</td><td>None, "sqrt", 0.3–0.8</td></tr>
  </table>
  <p>Each knob, measured on the churn data (one parameter changed at a time, everything else default):</p>
  <div class="fx" data-lang="py">from common import *
def show(**kw):
    t = DecisionTreeClassifier(random_state=0, **kw).fit(Xtr, ytr)
    k, v = list(kw.items())[0]
    print(f"{k}={str(v):6s} depth {t.get_depth():2d} leaves {t.get_n_leaves():5d}"
          f"  train {t.score(Xtr, ytr):.3f}  val {t.score(Xva, yva):.3f}")
for v in [1, 5, 20, 50, 200]:          show(min_samples_leaf=v)
for v in [2, 20, 100, 400]:            show(min_samples_split=v)
for v in [0.0, 0.0005, 0.001, 0.005]:  show(min_impurity_decrease=v)
for v in [8, 32, 128, 512]:            show(max_leaf_nodes=v)
for v in [None, "sqrt", 0.5]:          show(max_features=v)</div>
  <div class="fx" data-lang="text">min_samples_leaf=1      depth 31 leaves  1413  train 1.000  val 0.773
min_samples_leaf=5      depth 28 leaves   889  train 0.926  val 0.806
min_samples_leaf=20     depth 22 leaves   371  train 0.854  val 0.799
min_samples_leaf=50     depth 18 leaves   171  train 0.813  val 0.790
min_samples_leaf=200    depth 13 leaves    46  train 0.748  val 0.742
min_samples_split=2      depth 31 leaves  1413  train 1.000  val 0.773
min_samples_split=20     depth 28 leaves   788  train 0.921  val 0.788
min_samples_split=100    depth 27 leaves   271  train 0.837  val 0.803
min_samples_split=400    depth 23 leaves    83  train 0.774  val 0.773
min_impurity_decrease=0.0    depth 31 leaves  1413  train 1.000  val 0.773
min_impurity_decrease=0.0005 depth 14 leaves   112  train 0.835  val 0.803
min_impurity_decrease=0.001  depth 11 leaves    58  train 0.804  val 0.788
min_impurity_decrease=0.005  depth  5 leaves    13  train 0.724  val 0.727
max_leaf_nodes=8      depth  4 leaves     8  train 0.691  val 0.694
max_leaf_nodes=32     depth  9 leaves    32  train 0.779  val 0.772
max_leaf_nodes=128    depth 14 leaves   128  train 0.847  val 0.809
max_leaf_nodes=512    depth 21 leaves   512  train 0.932  val 0.805
max_features=None   depth 31 leaves  1413  train 1.000  val 0.773
max_features=sqrt   depth 29 leaves  1988  train 1.000  val 0.752
max_features=0.5    depth 29 leaves  1588  train 1.000  val 0.778</div>
  <ul>
    <li><strong>min_samples_leaf = 5</strong> alone lifts validation from 0.773 to 0.806 and cuts leaves from 1,413 to 889. Forbidding tiny leaves removes most of the memorising. Too large (200) and the tree underfits (0.742).</li>
    <li><strong>min_samples_split</strong> is weaker: a node of 100 rows may still produce a 1-row leaf. Best 0.803 at 100.</li>
    <li><strong>min_impurity_decrease = 0.0005</strong>: only 112 leaves and 0.803. A compact tree with nearly the best score.</li>
    <li><strong>max_leaf_nodes = 128</strong> gives the best line of the table, 0.809, because best-first growth spends its 128 leaves where the gains are largest.</li>
    <li><strong>max_features</strong> does not prune at all: every tree still reaches train 1.000. With "sqrt", each split sees only 3 random columns, the tree makes worse choices and grows bigger (1,988 leaves, 0.752). In a single tree that is harmful; in a <a class="xref" data-note="ml_rf">Random Forest</a> that randomness is the whole point.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A company's rule "no team smaller than 5 people" (<code>min_samples_leaf</code>) vs "no more than 4 levels of management" (<code>max_depth</code>). The first prevents silly one-person departments anywhere; the second caps the hierarchy but still allows a one-person team at level 4.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pre-pruning has a "horizon effect": a split that looks useless now may enable a great split below it (the XOR case and split C in section 07). A strict <code>min_impurity_decrease</code> stops right there and never sees the good split. Post-pruning avoids this by growing first and judging later. Also: tune these with cross-validation, never on the test set.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Post-Pruning.</b> Stopping rules guess in advance which splits will not pay off. The more principled route is to grow the full tree, then cut back the branches that do not earn their place.</div>

  <h2 id="dt-post"><span class="num">14</span>Post-Pruning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Stopping rules guess in advance which splits will not pay off, and can stop just before a good one. Can we instead grow the full tree and then cut back the branches that do not earn their place, with one principled knob?</p>
  </div>
  <h3>Reduced-error pruning (REP)</h3>
  <p>The simplest post-pruning (Quinlan, 1987). Keep a <strong>validation set</strong> aside. Starting from the bottom, for each internal node ask: "if I replaced this whole subtree with one leaf (predicting the node's training majority), would the validation errors go up?" If not, prune it. Repeat until no prune helps.</p>
  <p>A worked example: a churn tree with root A splitting into B and C, each with two leaves. 70 validation customers pass through it.</p>
  <table class="tbl">
    <tr><th>Node</th><th>Validation rows reaching it (churn / stay)</th><th>Errors of its subtree (leaves as they are)</th><th>Errors if made a leaf (training majority)</th><th>Decision</th></tr>
    <tr><td>B1 leaf → Churn</td><td>12 / 4</td><td>4</td><td>–</td><td></td></tr>
    <tr><td>B2 leaf → Stay</td><td>6 / 8</td><td>6</td><td>–</td><td></td></tr>
    <tr><td><strong>B</strong> (majority Churn)</td><td>18 / 12</td><td>4 + 6 = 10</td><td>12 (all stays wrong)</td><td>12 &gt; 10 → <strong>keep</strong></td></tr>
    <tr><td>C1 leaf → Churn</td><td>2 / 3</td><td>3</td><td>–</td><td></td></tr>
    <tr><td>C2 leaf → Stay</td><td>4 / 31</td><td>4</td><td>–</td><td></td></tr>
    <tr><td><strong>C</strong> (majority Stay)</td><td>6 / 34</td><td>3 + 4 = 7</td><td>6 (all churns wrong)</td><td>6 ≤ 7 → <strong>prune</strong></td></tr>
    <tr><td><strong>A</strong> root (majority Stay)</td><td>24 / 46</td><td>10 + 6 = 16 (after pruning C)</td><td>24</td><td>keep</td></tr>
  </table>
  <p>C's two leaves made 7 validation errors; a single "Stay" leaf makes only 6. The split under C was fitting training noise, so it goes. Under B the split genuinely helps (10 vs 12), so it stays. Result: one fewer split and one fewer validation error.</p>
  <p>REP is easy to explain and fast, but it spends data: the validation set is not used for growing, which hurts on small datasets, and the result depends on which rows happened to land in validation.</p>
  <h3>Cost-complexity pruning (CART's weakest-link pruning)</h3>
  <p>Breiman's idea: a tree should pay a price for every leaf it keeps. Define, for any subtree T of the full tree:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>R_α(T) = R(T) + α · |T|</strong><br>R(T) = training error of T (in the CART book, the misclassification rate; in sklearn, the total weighted impurity of the leaves, Σ_leaves (n_t/N)·i(t)). |T| = number of leaves. α ≥ 0 = the price per leaf. For each α there is one smallest subtree T(α) that minimises R_α. α = 0 keeps the full tree; a huge α leaves only the root.</p>
  </div>
  <p><strong>Which branch goes first? The weakest link.</strong> Look at an internal node t with its branch T_t. Kept, the branch costs R(T_t) + α|T_t|. Pruned to a single leaf, it costs R(t) + α. They are equal when</p>
  <p style="text-align:center"><strong>g(t) = (R(t) − R(T_t)) / (|T_t| − 1)</strong></p>
  <p>In words: <em>error saved by the branch, per extra leaf it uses</em>. A branch with small g(t) saves little error for its many leaves; it is the "weakest link". Pruning always cuts the node with the smallest g(t), and that g becomes the next α on the path. Repeating gives a nested sequence of ever-smaller trees T₀ ⊃ T₁ ⊃ … ⊃ root, with increasing α₁ &lt; α₂ &lt; …. Then cross-validation picks the best α.</p>
  <h3>First, on the diary tree</h3>
  <p>Take the tree built in section 04 and count training errors (N = 14 days). Every leaf is pure, so the full tree makes 0 errors: R(T) = 0 with |T| = 5 leaves. If a node were turned into a leaf it would predict its majority and get these days wrong: the root (9 Yes / 5 No) → 5 errors; the Sunny node (2 / 3, predicts No) → 2; the Rain node (3 / 2, predicts Yes) → 2.</p>
  <table class="tbl">
    <tr><th>Node</th><th>R(t) as a leaf</th><th>R(T_t) of its branch</th><th>|T_t| leaves</th><th>g(t)</th></tr>
    <tr><td>Sunny (Humidity)</td><td>2/14 = 0.143</td><td>0</td><td>2</td><td>0.143 / 1 = 0.143</td></tr>
    <tr><td>Rain (Wind)</td><td>2/14 = 0.143</td><td>0</td><td>2</td><td>0.143 / 1 = 0.143</td></tr>
    <tr><td>root (Outlook)</td><td>5/14 = 0.357</td><td>0</td><td>5</td><td>0.357 / 4 = <strong>0.089 ← smallest</strong></td></tr>
  </table>
  <p>Surprise: the weakest link is the <em>root</em>. The whole tree spends 4 extra leaves to save 5 errors, only 0.089 per leaf, while each second-level branch saves 0.143 for its one extra leaf. So the path has a single step: for α &lt; 0.089 keep the full tree; for α ≥ 0.089 the best subtree is the root alone ("always say Yes", 5 errors). Check at α = 0.1: full tree 0 + 5 × 0.1 = 0.5, root 0.357 + 0.1 = 0.457, the root wins. With only 14 days, a small price per leaf already wipes out the tree; cross-validation decides whether that is wise.</p>
  <h3>A bigger tree: the weakest-link sequence</h3>
  <p>A tree grown on N = 100 training customers. Each box shows (stay / churn) and how many training rows it would get wrong as a leaf.</p>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="320" y1="50" x2="170" y2="100" stroke="currentColor"/><line x1="320" y1="50" x2="470" y2="100" stroke="currentColor"/>
<line x1="170" y1="140" x2="95" y2="190" stroke="currentColor"/><line x1="170" y1="140" x2="245" y2="190" stroke="currentColor"/>
<line x1="470" y1="140" x2="395" y2="190" stroke="currentColor"/><line x1="470" y1="140" x2="545" y2="190" stroke="currentColor"/>
<line x1="545" y1="226" x2="490" y2="250" stroke="currentColor"/><line x1="545" y1="226" x2="600" y2="250" stroke="currentColor"/>
<rect x="250" y="12" width="140" height="40" rx="7" class="fb sb"/><text x="320" y="29" text-anchor="middle" font-size="12" font-weight="700">t1  60 / 40</text><text x="320" y="45" text-anchor="middle" class="tm" font-size="10.5">leaf err 40 · g = 0.0625</text>
<rect x="100" y="100" width="140" height="40" rx="7" class="fb sb"/><text x="170" y="117" text-anchor="middle" font-size="12" font-weight="700">t2  46 / 14</text><text x="170" y="133" text-anchor="middle" class="tm" font-size="10.5">leaf err 14 · g = 0.040</text>
<rect x="400" y="100" width="140" height="40" rx="7" class="fb sb"/><text x="470" y="117" text-anchor="middle" font-size="12" font-weight="700">t3  14 / 26</text><text x="470" y="133" text-anchor="middle" class="tm" font-size="10.5">leaf err 14 · g = 0.045</text>
<rect x="45" y="190" width="100" height="36" rx="7" class="fg sg"/><text x="95" y="206" text-anchor="middle" font-size="12">t4  38 / 2</text><text x="95" y="220" text-anchor="middle" class="tm" font-size="10.5">err 2</text>
<rect x="195" y="190" width="100" height="36" rx="7" class="fr sr"/><text x="245" y="206" text-anchor="middle" font-size="12">t5  8 / 12</text><text x="245" y="220" text-anchor="middle" class="tm" font-size="10.5">err 8</text>
<rect x="345" y="190" width="100" height="36" rx="7" class="fr sr"/><text x="395" y="206" text-anchor="middle" font-size="12">t6  3 / 22</text><text x="395" y="220" text-anchor="middle" class="tm" font-size="10.5">err 3</text>
<rect x="485" y="190" width="120" height="36" rx="7" class="fb sb"/><text x="545" y="206" text-anchor="middle" font-size="12" font-weight="700">t7  11 / 4</text><text x="545" y="220" text-anchor="middle" class="tr" font-size="10.5">err 4 · g = 0.020</text>
<rect x="445" y="250" width="90" height="34" rx="7" class="fg sg"/><text x="490" y="265" text-anchor="middle" font-size="12">t8  9 / 0</text><text x="490" y="278" text-anchor="middle" class="tm" font-size="10.5">err 0</text>
<rect x="555" y="250" width="80" height="34" rx="7" class="fr sr"/><text x="595" y="265" text-anchor="middle" font-size="12">t9  2 / 4</text><text x="595" y="278" text-anchor="middle" class="tm" font-size="10.5">err 2</text>
</svg><figcaption>Full tree T₀: 5 leaves (green = predicts stay, red = predicts churn), 15 training errors, R(T₀) = 0.15. Blue boxes are internal nodes with their first-round g(t).</figcaption></figure>
  <p><strong>Round 1.</strong> Compute g for every internal node (errors divided by N = 100):</p>
  <table class="tbl">
    <tr><th>Node</th><th>R(t) as a leaf</th><th>R(T_t) of its branch</th><th>|T_t| leaves</th><th>g(t) = (R(t) − R(T_t)) / (|T_t| − 1)</th></tr>
    <tr><td>t7</td><td>0.04</td><td>t8 + t9 = 0 + 0.02 = 0.02</td><td>2</td><td>0.02 / 1 = <strong>0.020 ← smallest</strong></td></tr>
    <tr><td>t2</td><td>0.14</td><td>t4 + t5 = 0.10</td><td>2</td><td>0.04 / 1 = 0.040</td></tr>
    <tr><td>t3</td><td>0.14</td><td>t6 + t8 + t9 = 0.05</td><td>3</td><td>0.09 / 2 = 0.045</td></tr>
    <tr><td>t1</td><td>0.40</td><td>all 5 leaves = 0.15</td><td>5</td><td>0.25 / 4 = 0.0625</td></tr>
  </table>
  <p>Prune t7: α₁ = 0.02. T₁ has 4 leaves (t4, t5, t6, t7) and R = (2 + 8 + 3 + 4) / 100 = 0.17.</p>
  <p><strong>Round 2.</strong> t3's branch is now t6 + t7 = 0.07 with 2 leaves: g(t3) = (0.14 − 0.07) / 1 = 0.07. t2 is still 0.04. t1: (0.40 − 0.17) / 3 = 0.0767. Smallest is t2: α₂ = 0.04. T₂ has leaves t2, t6, t7; R = 0.21.</p>
  <p><strong>Round 3.</strong> g(t3) = 0.07, g(t1) = (0.40 − 0.21) / 2 = 0.095. Prune t3: α₃ = 0.07. T₃ = root with leaves t2, t3; R = 0.28.</p>
  <p><strong>Round 4.</strong> g(t1) = (0.40 − 0.28) / 1 = 0.12. α₄ = 0.12, only the root remains.</p>
  <table class="tbl out"><caption>The pruning path</caption>
    <tr><th>α range</th><th>Best subtree</th><th>leaves</th><th>R(T)</th></tr>
    <tr><td>0 ≤ α &lt; 0.02</td><td>T₀ (full)</td><td>5</td><td>0.15</td></tr>
    <tr><td>0.02 ≤ α &lt; 0.04</td><td>T₁</td><td>4</td><td>0.17</td></tr>
    <tr><td>0.04 ≤ α &lt; 0.07</td><td>T₂</td><td>3</td><td>0.21</td></tr>
    <tr><td>0.07 ≤ α &lt; 0.12</td><td>T₃</td><td>2</td><td>0.28</td></tr>
    <tr><td>α ≥ 0.12</td><td>root only</td><td>1</td><td>0.40</td></tr>
  </table>
  <p>Check one: at α = 0.05, R_α is 0.15 + 5(0.05) = 0.40 for T₀, 0.17 + 0.20 = 0.37 for T₁, <strong>0.21 + 0.15 = 0.36</strong> for T₂, 0.28 + 0.10 = 0.38 for T₃, 0.40 + 0.05 = 0.45 for the root. T₂ wins, as the table says. The code repeats the procedure mechanically:</p>
  <div class="fx" data-lang="py"># the hand-worked tree: node -&gt; (errors if this node were a leaf, its children)
tree = {"t1": (40, ["t2", "t3"]), "t2": (14, ["t4", "t5"]), "t3": (14, ["t6", "t7"]),
        "t4": (2, []), "t5": (8, []), "t6": (3, []), "t7": (4, ["t8", "t9"]),
        "t8": (0, []), "t9": (2, [])}
N = 100
def leaves(t):  return [t] if not tree[t][1] else sum((leaves(c) for c in tree[t][1]), [])
def R_leaf(t):  return tree[t][0] / N                       # R(t): error if t were a leaf
def R_sub(t):   return sum(R_leaf(l) for l in leaves(t))    # R(T_t): error of the branch under t
def internal(t):                                            # internal nodes still in the tree
    kids = tree[t][1]
    return [t] + sum((internal(c) for c in kids), []) if kids else []

while tree["t1"][1]:                                        # until only the root is left
    g = {t: (R_leaf(t) - R_sub(t)) / (len(leaves(t)) - 1) for t in internal("t1")}
    print("  g(t): " + ", ".join(f"{t}={v:.4f}" for t, v in sorted(g.items())))
    weakest = min(g, key=g.get)                             # the weakest link
    tree[weakest] = (tree[weakest][0], [])                  # prune: it becomes a leaf
    print(f"alpha = {g[weakest]:.2f}: prune {weakest} -&gt; {len(leaves('t1'))} leaves, R(T) = {R_sub('t1'):.2f}")</div>
  <div class="fx" data-lang="text">  g(t): t1=0.0625, t2=0.0400, t3=0.0450, t7=0.0200
alpha = 0.02: prune t7 -&gt; 4 leaves, R(T) = 0.17
  g(t): t1=0.0767, t2=0.0400, t3=0.0700
alpha = 0.04: prune t2 -&gt; 3 leaves, R(T) = 0.21
  g(t): t1=0.0950, t3=0.0700
alpha = 0.07: prune t3 -&gt; 2 leaves, R(T) = 0.28
  g(t): t1=0.1200
alpha = 0.12: prune t1 -&gt; 1 leaves, R(T) = 0.40</div>
  <h3>The same formula inside sklearn</h3>
  <p>sklearn measures R(t) with the node's impurity weighted by its share of rows, R(t) = (n_t / N) · Gini(t), not with error counts. Everything else is identical. Here is a check on the diary: sklearn's full CART tree on the one-hot categories, g(t) computed from the fitted tree's internals and compared with <code>cost_complexity_pruning_path</code>.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int); y = df.Play
clf = DecisionTreeClassifier(random_state=0).fit(X, y)              # full CART tree, Gini
print(export_text(clf, feature_names=list(X.columns)))
s = clf.tree_
N = s.weighted_n_node_samples[0]
R = s.impurity * s.weighted_n_node_samples / N                       # sklearn's R(t) = (n_t / N) * Gini(t)
def leaves(i):
    l, r = s.children_left[i], s.children_right[i]
    return [i] if l == -1 else leaves(l) + leaves(r)
for i in range(s.node_count):
    if s.children_left[i] != -1:
        L = leaves(i)
        g = (R[i] - R[L].sum()) / (len(L) - 1)
        print(f"node {i:2d} {X.columns[s.feature[i]]:16s} R(t)={R[i]:.4f}  R(T_t)={R[L].sum():.4f}"
              f"  leaves {len(L)}  g(t)={g:.4f}")
print("sklearn path alphas:", np.round(clf.cost_complexity_pruning_path(X, y).ccp_alphas, 4))</div>
  <div class="fx" data-lang="text">|--- Outlook_Overcast &lt;= 0.50
|   |--- Humidity_Normal &lt;= 0.50
|   |   |--- Outlook_Rain &lt;= 0.50
|   |   |   |--- class: No
|   |   |--- Outlook_Rain &gt;  0.50
|   |   |   |--- Wind_Strong &lt;= 0.50
|   |   |   |   |--- class: Yes
|   |   |   |--- Wind_Strong &gt;  0.50
|   |   |   |   |--- class: No
|   |--- Humidity_Normal &gt;  0.50
|   |   |--- Wind_Weak &lt;= 0.50
|   |   |   |--- Temp_Cool &lt;= 0.50
|   |   |   |   |--- class: Yes
|   |   |   |--- Temp_Cool &gt;  0.50
|   |   |   |   |--- class: No
|   |   |--- Wind_Weak &gt;  0.50
|   |   |   |--- class: Yes
|--- Outlook_Overcast &gt;  0.50
|   |--- class: Yes

node  0 Outlook_Overcast R(t)=0.4592  R(T_t)=0.0000  leaves 7  g(t)=0.0765
node  1 Humidity_Normal  R(t)=0.3571  R(T_t)=0.0000  leaves 6  g(t)=0.0714
node  2 Outlook_Rain     R(t)=0.1143  R(T_t)=0.0000  leaves 3  g(t)=0.0571
node  4 Wind_Strong      R(t)=0.0714  R(T_t)=0.0000  leaves 2  g(t)=0.0714
node  7 Wind_Weak        R(t)=0.1143  R(T_t)=0.0000  leaves 3  g(t)=0.0571
node  8 Temp_Cool        R(t)=0.0714  R(T_t)=0.0000  leaves 2  g(t)=0.0714
sklearn path alphas: [0.     0.0571 0.0571 0.1153]</div>
  <p>Read the g column. Nodes 2 (Outlook_Rain, among the humid non-overcast days) and 7 (Wind_Weak, among the normal-humidity non-overcast days) tie for the smallest g = 0.0571: each branch has 3 pure leaves and removes R = 0.1143, so 0.1143 / 2 per extra leaf. Both are pruned at α = 0.0571, which is why sklearn lists 0.0571 twice. Now recompute: the root's branch has 3 leaves left (node 2, node 7 and the Overcast leaf) with R = 0.1143 + 0.1143 + 0 = 0.2286, so g(root) = (0.4592 − 0.2286) / 2 = 0.1153, smaller than node 1's (0.3571 − 0.2286) / 1 = 0.1286. The root goes next, at α = 0.1153, sklearn's last alpha. The lesson, seen twice on the diary: a parent can be the weakest link before its own child, so g must be recomputed after every prune.</p>
  <h3>Choosing α by cross-validation</h3>
  <p>The path gives the candidate α values; cross-validation picks one. On the churn data:</p>
  <div class="fx" data-lang="py">from common import *
from sklearn.model_selection import cross_val_score
path = DecisionTreeClassifier(random_state=0).cost_complexity_pruning_path(Xtr, ytr)
alphas, imp = path.ccp_alphas, path.impurities         # alpha_k and R(T_k) of each pruned tree
print(f"{len(alphas)} trees on the path; first alphas {np.round(alphas[:3], 6)}, last {alphas[-1]:.4f}")
cands = np.unique(np.quantile(alphas, np.linspace(0.5, 0.995, 12)))   # try 12 alphas
cv = [cross_val_score(DecisionTreeClassifier(ccp_alpha=a, random_state=0), Xtr, ytr, cv=5).mean()
      for a in cands]
for a, s in zip(cands, cv):
    print(f"alpha {a:.6f}  5-fold CV acc {s:.3f}")
best = cands[int(np.argmax(cv))]
t = DecisionTreeClassifier(ccp_alpha=best, random_state=0).fit(Xtr, ytr)
print(f"chosen alpha {best:.6f}: leaves {t.get_n_leaves()}  val {t.score(Xva, yva):.3f}  test {t.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">784 trees on the path; first alphas [0.0e+00 7.5e-05 7.5e-05], last 0.0213
alpha 0.000165  5-fold CV acc 0.780
alpha 0.000196  5-fold CV acc 0.787
alpha 0.000218  5-fold CV acc 0.791
alpha 0.000232  5-fold CV acc 0.792
alpha 0.000254  5-fold CV acc 0.796
alpha 0.000278  5-fold CV acc 0.796
alpha 0.000318  5-fold CV acc 0.797
alpha 0.000376  5-fold CV acc 0.796
alpha 0.000464  5-fold CV acc 0.799
alpha 0.000704  5-fold CV acc 0.790
alpha 0.001250  5-fold CV acc 0.772
alpha 0.007361  5-fold CV acc 0.692
chosen alpha 0.000464: leaves 147  val 0.808  test 0.800</div>
  <p>The full tree has a path of 784 nested subtrees. Trying 12 α values spread over the upper half of the path, 5-fold CV accuracy rises from 0.780 to a peak of 0.799 at α ≈ 0.00046 and then falls as the tree gets too small (0.692 at α = 0.0074). The chosen tree has 147 leaves instead of 1,413, and scores 0.808 on validation and 0.800 on the untouched test set.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Breiman also suggested the <strong>1-SE rule</strong>: instead of the α with the best CV score, take the largest α (smallest tree) whose CV score is within one standard error of the best. The standard error is the standard deviation of the 5 fold scores divided by √5. Here the next larger candidate (α ≈ 0.0007, CV 0.790, fewer leaves) is 0.009 below the peak, so it would be chosen only if that standard error is at least 0.009; the idea is that a simpler tree with statistically the same accuracy is preferable. Pre-pruning and CCP give similar accuracy in practice (0.80–0.81 here); CCP gives a principled sequence instead of a grid of guesses.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not pick α from the path with the training data (bigger trees always have lower R) and do not pick it on the test set. Also, <code>ccp_alpha</code> values are on the impurity scale: 0.001 means very different pruning on different datasets and criteria. Always generate candidates with <code>cost_complexity_pruning_path</code> on your own training data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Missing Values.</b> Real tables have holes: customers who did not fill in their income, sensors that dropped a reading. Our split formulas assumed every value is known.</div>

  <h2 id="dt-missing"><span class="num">15</span>Missing Values</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every formula so far assumed every reading is known. What if the captain forgot to write down the outlook one day, or the hygrometer failed? How is the gain computed during training, and which branch does such a day take when predicting?</p>
  </div>
  <p>A missing value causes two problems. <strong>While training</strong>: how do you compute the gain of "Outlook?" when some days have no outlook recorded? <strong>While predicting</strong>: which branch does a row go down if the node asks about the missing column? The three classic answers are very different.</p>
  <h3>C4.5: fractional rows</h3>
  <p>Quinlan's idea: a row with an unknown value is split into <em>pieces</em> and sent down every branch, each piece weighted by how common that branch is among rows where the value is known.</p>
  <p><strong>Training, worked.</strong> Erase D12's outlook (it was Overcast, Play = Yes). Now 13 days have a known outlook: 8 Yes / 5 No.</p>
  <ol>
    <li>Compute the gain on known rows only. H(known) = H(8, 5) = 0.961. Branches: Sunny [2 Y, 3 N], Overcast [3, 0], Rain [3, 2]. Weighted child entropy = (5/13)(0.971) + 0 + (5/13)(0.971) = 0.747. Gain on known rows = 0.214.</li>
    <li>Scale it by F, the fraction of rows where the value is known: F = 13/14 = 0.929. IG = 0.929 × 0.214 = <strong>0.199</strong>. (An attribute that is often missing is trusted less.)</li>
    <li>Split information treats "unknown" as an extra branch: sizes 5, 3, 5, 1 → SplitInfo = <strong>1.809</strong>, gain ratio = 0.199 / 1.809 = <strong>0.110</strong>.</li>
    <li>Send D12 down all three branches with weights 5/13, 3/13, 5/13 (0.385, 0.231, 0.385). Below, it counts as 0.385 of a row in Sunny, and so on.</li>
  </ol>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def H(counts):
    p = np.array(counts, float) / sum(counts); p = p[p &gt; 0]
    return float(-(p * np.log2(p)).sum()) + 0.0
d = df.copy()
d.loc["D12", "Outlook"] = None                       # one Outlook value is unknown
known = d[d.Outlook.notna()]
F = len(known) / len(d)                              # fraction of rows where Outlook is known
H_known = H(known.Play.value_counts())
branches = {v: g.Play.value_counts().reindex(["Yes", "No"], fill_value=0).tolist()
            for v, g in known.groupby("Outlook")}
print("branches (Yes, No):", branches)
cond = sum(sum(c) / len(known) * H(c) for c in branches.values())
ig = F * (H_known - cond)
sizes = [sum(c) for c in branches.values()] + [len(d) - len(known)]   # "unknown" is its own branch here
print(f"H(known) = {H_known:.3f}  weighted child H = {cond:.3f}  F = {F:.3f}")
print(f"IG = F * ({H_known:.3f} - {cond:.3f}) = {ig:.3f}   SplitInfo = {H(sizes):.3f}   GainRatio = {ig / H(sizes):.3f}")
w = {v: sum(c) / len(known) for v, c in branches.items()}
print("D12 is sent down every branch with weight:", {k: round(v, 3) for k, v in w.items()})</div>
  <div class="fx" data-lang="text">branches (Yes, No): {'Overcast': [3, 0], 'Rain': [3, 2], 'Sunny': [2, 3]}
H(known) = 0.961  weighted child H = 0.747  F = 0.929
IG = F * (0.961 - 0.747) = 0.199   SplitInfo = 1.809   GainRatio = 0.110
D12 is sent down every branch with weight: {'Overcast': 0.231, 'Rain': 0.385, 'Sunny': 0.385}</div>
  <p>These are exactly the numbers in Quinlan's own book (<em>C4.5: Programs for Machine Learning</em>, 1993, chapter 3), which uses this example.</p>
  <p><strong>Predicting, worked.</strong> A new day: Outlook unknown, Humidity = High, Wind = Weak. Using the tree from section 04, where the training days split 5 / 4 / 5 at the root, the row goes down all three branches:</p>
  <table class="tbl">
    <tr><th>Branch</th><th>weight</th><th>where it lands</th><th>P(Yes) there</th><th>weight × P(Yes)</th></tr>
    <tr><td>Sunny</td><td>5/14</td><td>Humidity = High → No leaf</td><td>0</td><td>0</td></tr>
    <tr><td>Overcast</td><td>4/14</td><td>Yes leaf</td><td>1</td><td>0.286</td></tr>
    <tr><td>Rain</td><td>5/14</td><td>Wind = Weak → Yes leaf</td><td>1</td><td>0.357</td></tr>
    <tr><td colspan="4"><strong>P(Yes)</strong></td><td><strong>0.643 → predict Yes</strong></td></tr>
  </table>
  <h3>CART: surrogate splits</h3>
  <p>Breiman's idea: at each node, besides the best split (the <strong>primary</strong>), store a ranked list of backup splits on <em>other</em> columns that send rows the same way as the primary as often as possible. If a row is missing the primary column, use the first surrogate it has a value for. Training on a node simply uses the rows where that column is known.</p>
  <p><strong>Worked on the diary.</strong> Suppose the tree's primary split is "HumPct ≤ 82.5" (left = the 7 normal-humidity days). Which split on another column best mimics it, for a day whose humidity reading is missing?</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
primary = (df.HumPct &lt;= 82.5).values                  # the split the tree chose: True = left
print("primary goes left:", primary.astype(int).tolist())
print(f"majority-side baseline agreement: {max(primary.mean(), 1 - primary.mean()):.0%}")
cands = {}
for col in ["Outlook", "Temp", "Humidity", "Wind"]:  # category = value  vs  the rest
    for v in sorted(df[col].unique())[: -1 if df[col].nunique() == 2 else None]:
        cands[f"{col} = {v}"] = (df[col] == v).values     # (for 2 values, one test is enough)
vals = np.unique(df.TempC)
for t in (vals[:-1] + vals[1:]) / 2:                  # numeric: TempC &lt;= t
    cands[f"TempC &lt;= {t}"] = (df.TempC &lt;= t).values
agree = {k: max(np.mean(g == primary), np.mean(~g == primary)) for k, g in cands.items()}
for k in sorted(agree, key=agree.get, reverse=True)[:4]:
    print(f"surrogate '{k}' agrees on {agree[k]:.0%} of days")</div>
  <div class="fx" data-lang="text">primary goes left: [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0]
majority-side baseline agreement: 50%
surrogate 'Humidity = High' agrees on 100% of days
surrogate 'Temp = Cool' agrees on 79% of days
surrogate 'TempC &lt;= 20.5' agrees on 71% of days
surrogate 'TempC &lt;= 21.5' agrees on 71% of days</div>
  <p>The categorical Humidity column agrees on all 14 days (High goes right, Normal goes left): the captain's two humidity columns carry the same information, so it is a perfect surrogate. Next come Temp = Cool (79%: all four cool evenings were normal-humidity days, but three normal days were mild or hot) and TempC ≤ 20.5 (71%). The fallback "send everyone to the bigger side" agrees on only 50% here (a 7–7 tie). A surrogate is kept only if it beats that baseline. Surrogates are used by R's <code>rpart</code>; sklearn does not implement them. A bonus: surrogate agreement shows which columns are near-substitutes, which <code>rpart</code> reports as part of variable importance.</p>
  <h3>sklearn: learn a direction for NaN</h3>
  <p>Since version 1.3, sklearn's trees (with the default <code>splitter="best"</code>) accept <code>NaN</code>. At each split, the tree evaluates the threshold twice: once with all NaN rows sent left and once sent right, and keeps the better. If no NaN reached that node during training, NaN rows at prediction time go to the child that had more training rows.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = df[["HumPct"]].astype(float).copy()
X.loc[["D6", "D14"], "HumPct"] = np.nan               # the hygrometer failed on two stormy evenings
t = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, df.Play)
print(export_text(t, feature_names=["HumPct"], show_weights=True))
print("root threshold:", t.tree_.threshold[0], " NaN goes left?", bool(t.tree_.missing_go_to_left[0]))
new = pd.DataFrame({"HumPct": [np.nan, 70, 90]})
print("predict NaN, 70, 90:", t.predict(new))
t2 = DecisionTreeClassifier(max_depth=1, random_state=0).fit(df[["HumPct"]].astype(float), df.Play)
print("trained without NaN, children sizes", t2.tree_.n_node_samples[1:].tolist(),
      "-&gt; predict NaN:", t2.predict(new.iloc[:1]))</div>
  <div class="fx" data-lang="text">|--- HumPct &lt;= 82.50
|   |--- weights: [0.00, 6.00] class: Yes
|--- HumPct &gt;  82.50
|   |--- weights: [5.00, 3.00] class: No

root threshold: 82.5  NaN goes left? False
predict NaN, 70, 90: ['No' 'Yes' 'No']
trained without NaN, children sizes [7, 7] -&gt; predict NaN: ['No']</div>
  <p>The hygrometer failed on D6 and D14, two stormy evenings when no match was played. The tree still finds the cut 82.5 among the 12 known readings, and it learns "NaN goes right", together with the humid days: the right leaf holds the 6 known humid days [3 No, 3 Yes] plus D6 and D14, so [5 No, 3 Yes]. A new evening with a missing reading is predicted "No": missingness itself became a signal. In the second model no NaN was seen in training, so a NaN follows the child that had more training rows; here both children hold 7 days, and sklearn sent it right ("No").</p>
  <table class="tbl">
    <tr><th>Method</th><th>Training</th><th>Prediction</th><th>Where</th></tr>
    <tr><td>C4.5 fractional rows</td><td>gain on known rows × F; unknown rows split by weights</td><td>go down all branches, combine probabilities</td><td>C4.5, C5.0</td></tr>
    <tr><td>CART surrogates</td><td>gain on known rows; store backup splits</td><td>first available surrogate, else majority side</td><td>rpart (R)</td></tr>
    <tr><td>Learned NaN direction</td><td>try NaN-left and NaN-right per split</td><td>follow the learned side</td><td>sklearn ≥ 1.3, <a class="xref" data-note="ml_xgboost">XGBoost</a> ("default direction"), LightGBM</td></tr>
    <tr><td>Impute + indicator</td><td>fill with median / "missing" category, add an is_missing column</td><td>same filling</td><td>any model; <code>SimpleImputer(add_indicator=True)</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mean-imputing and dropping the information that a value was missing can destroy a strong signal ("refused to give income" often predicts default). Keep missingness visible: native NaN support, a missing indicator, or a separate category. And compute imputation values on training rows only.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Decision Boundaries.</b> We know how a tree splits. What does the resulting model look like in the feature space, and what kinds of patterns does that shape struggle with?</div>

  <h2 id="dt-geom"><span class="num">16</span>Decision Boundaries: Boxes and Staircases</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how a tree chooses each split. Put all the splits together: what shape does the finished model draw in feature space, and which patterns does that shape struggle with?</p>
  </div>
  <p>Every split is "one column ≤ one number". In a plot of two features, that is a straight cut parallel to an axis. On the diary, "HumPct ≤ 82.5" is a vertical line in a (humidity, temperature) plot, and a later "TempC ≤ 20.5" inside one side adds a horizontal segment on that side only. Repeated cuts chop the plane into <strong>axis-aligned rectangles</strong> (boxes in higher dimensions), and each leaf owns one box.</p>
  <figure class="viz"><svg viewBox="0 0 640 260" width="640">
<rect x="30" y="20" width="240" height="200" fill="none" stroke="currentColor"/>
<rect x="30" y="20" width="96" height="200" class="fg" fill-opacity="0.7"/>
<rect x="126" y="20" width="144" height="80" class="fr" fill-opacity="0.7"/>
<rect x="126" y="100" width="72" height="120" class="fg" fill-opacity="0.7"/>
<rect x="198" y="100" width="72" height="120" class="fr" fill-opacity="0.7"/>
<line x1="126" y1="20" x2="126" y2="220" class="sb" stroke-width="2.5"/><line x1="126" y1="100" x2="270" y2="100" class="sb" stroke-width="2"/><line x1="198" y1="100" x2="198" y2="220" class="sb" stroke-width="1.5"/>
<text x="126" y="236" text-anchor="middle" class="tb" font-size="11">x₁ = 40 (split 1)</text><text x="276" y="104" class="tb" font-size="11">x₂ = 60 (split 2)</text><text x="198" y="250" text-anchor="middle" class="tb" font-size="11">x₁ = 70 (split 3)</text>
<text x="78" y="125" text-anchor="middle" font-size="12">leaf A</text><text x="198" y="64" text-anchor="middle" font-size="12">leaf B</text><text x="162" y="165" text-anchor="middle" font-size="12">C</text><text x="234" y="165" text-anchor="middle" font-size="12">D</text>
<text x="150" y="14" text-anchor="middle" class="tm" font-size="11.5">3 splits → 4 boxes</text>
<rect x="360" y="20" width="240" height="200" fill="none" stroke="currentColor"/>
<polygon points="360,220 600,20 600,220" class="fr" fill-opacity="0.35"/>
<polyline points="360,220 360,190 396,190 396,160 432,160 432,130 468,130 468,100 504,100 504,70 540,70 540,40 576,40 576,20 600,20" fill="none" class="sb" stroke-width="2.5"/>
<line x1="360" y1="220" x2="600" y2="20" stroke="currentColor" stroke-dasharray="5 4"/>
<text x="480" y="14" text-anchor="middle" class="tm" font-size="11.5">true rule x₁ &gt; x₂ (dashed) vs tree (blue)</text>
<text x="540" y="200" text-anchor="middle" font-size="12">x₁ &gt; x₂</text><text x="410" y="60" text-anchor="middle" font-size="12">x₁ &lt; x₂</text>
</svg><figcaption>Left: a tree with 3 splits owns 4 rectangles. Right: a diagonal boundary can only be approximated by a staircase of many small boxes.</figcaption></figure>
  <p>This shape is perfect for rules like "income above 40 and age below 60", and terrible for <strong>diagonal</strong> rules like "approve if income &gt; EMI", where the boundary is x₁ = x₂. The tree must build a staircase, and every step costs splits and data.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
rng = np.random.default_rng(0)
X = rng.random((2000, 2)) * 100                    # x1 = income, x2 = loan EMI capacity, say
y = (X[:, 0] &gt; X[:, 1]).astype(int)                # the true rule is a diagonal line
Xte = rng.random((2000, 2)) * 100; yte = (Xte[:, 0] &gt; Xte[:, 1]).astype(int)
for d in [2, 4, 8, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X, y)
    print(f"raw x1, x2      max_depth={str(d):4s} leaves {t.get_n_leaves():3d}  test acc {t.score(Xte, yte):.3f}")
diff = lambda A: np.c_[A, A[:, 0] - A[:, 1]]       # add one engineered column: x1 - x2
t = DecisionTreeClassifier(random_state=0).fit(diff(X), y)
print(f"with x1 - x2    leaves {t.get_n_leaves():3d}  test acc {t.score(diff(Xte), yte):.3f}")</div>
  <div class="fx" data-lang="text">raw x1, x2      max_depth=2    leaves   4  test acc 0.884
raw x1, x2      max_depth=4    leaves  16  test acc 0.963
raw x1, x2      max_depth=8    leaves  42  test acc 0.983
raw x1, x2      max_depth=None leaves  43  test acc 0.984
with x1 - x2    leaves   2  test acc 1.000</div>
  <p>On raw x₁, x₂ a depth-2 tree gets 0.884; even an unlimited tree with 43 leaves reaches only 0.984, and its staircase is still wrong near the diagonal. Add one column, x₁ − x₂, and a single split "x₁ − x₂ ≤ 0" is perfect: 2 leaves, 1.000. Logistic regression would have found this diagonal immediately; that is the main way linear models beat trees.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Trees are <strong>axis-aligned</strong>: they are invariant to monotonic changes of each single feature (no scaling needed), but not to rotations of the feature space. Feature engineering (ratios, differences, sums) "rotates" the problem into the tree's favour. Oblique trees (splits on a·x ≤ t) exist but are rare in practice; ensembles of many staircases (<a class="xref" data-note="ml_rf">Random Forest</a>, <a class="xref" data-note="ml_gbm">Gradient Boosting</a>) smooth the steps instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Outside the range of the training data the boxes simply extend forever with a constant prediction. A tree has no idea that "more income" should keep meaning "safer" beyond the largest income it saw. Monotonic constraints (<code>monotonic_cst</code> in sklearn ≥ 1.4) can enforce the direction inside the data range, but not create a trend outside it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Time &amp; Memory Cost.</b> We have seen what a tree computes. How long does it take, and how does that grow with more rows and columns? This decides whether a single tree, or 1,000 of them in a forest, is practical.</div>

  <h2 id="dt-cost"><span class="num">17</span>Time and Memory Cost</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Trees try every column and every cut-off at every node. Is that affordable on 160,000 rows, or on 1,000 trees in a forest? How do training and prediction time grow?</p>
  </div>
  <h3>Training: O(n · d · log n) in the textbook</h3>
  <p>Build it up from the pieces you already know, with n rows and d features:</p>
  <ol>
    <li><strong>One feature, one node with m rows</strong>: sort O(m log m), then one left-to-right scan with running class counts O(m) (section 09).</li>
    <li><strong>All features, one node</strong>: d times that, O(d · m log m).</li>
    <li><strong>One whole level of the tree</strong>: the nodes on a level hold disjoint rows, at most n in total, so a level costs O(d · n log n).</li>
    <li><strong>All levels</strong>: a reasonably balanced tree has depth about log₂ n, so sorting at every node gives O(d · n · log² n). If features are <strong>pre-sorted once</strong> at the start (as in the original CART and older sklearn) and the order is reused, each level is only O(d · n) and the total is O(d · n · log n), the figure quoted in most books.</li>
    <li><strong>Worst case</strong>: a very unbalanced tree (each split peels off one row) has depth n, making it O(d · n² ) or worse. <code>max_depth</code> and <code>min_samples_leaf</code> also protect the running time.</li>
  </ol>
  <h3>Prediction: O(depth)</h3>
  <p>One comparison per level: O(depth), about O(log n) for a balanced tree and O(n) in the worst case. The diary tree has depth 2, so any day needs at most 2 questions. It does not depend on d at all; a tree ignores columns it never asks about.</p>
  <h3>Memory: O(number of nodes)</h3>
  <p>A binary tree with L leaves has L − 1 internal nodes, 2L − 1 in total, and L ≤ n. Each node stores a feature index, a threshold, two child pointers and a value. The 1,413-leaf churn tree has 2,825 nodes, a few hundred KB.</p>
  <h3>Measured</h3>
  <div class="fx" data-lang="py">import numpy as np, time
from sklearn.datasets import make_classification
from sklearn.tree import DecisionTreeClassifier
Xb, yb = make_classification(n_samples=160000, n_features=14, n_informative=6, random_state=7)

def fit_seconds(n):
    t0 = time.perf_counter()
    DecisionTreeClassifier(max_depth=12, random_state=0).fit(Xb[:n], yb[:n])
    return time.perf_counter() - t0

prev = None
for n in [10000, 20000, 40000, 80000, 160000]:
    s = min(fit_seconds(n) for _ in range(3))           # best of 3 runs
    print(f"n = {n:6d}  fit {s*1000:5.0f} ms" + (f"   x{s/prev:.2f} vs half the rows" if prev else ""))
    prev = s
t = DecisionTreeClassifier(max_depth=12, random_state=0).fit(Xb, yb)
t0 = time.perf_counter(); t.predict(Xb); s = time.perf_counter() - t0
print(f"predict 160000 rows: {s*1000:.0f} ms  = {s/160000*1e6:.2f} microseconds per row (depth {t.get_depth()})")</div>
  <div class="fx" data-lang="text">n =  10000  fit   423 ms
n =  20000  fit   992 ms   x2.35 vs half the rows
n =  40000  fit  1821 ms   x1.84 vs half the rows
n =  80000  fit  3640 ms   x2.00 vs half the rows
n = 160000  fit  7102 ms   x1.95 vs half the rows
predict 160000 rows: 33 ms  = 0.20 microseconds per row (depth 12)</div>
  <p>Doubling the rows multiplies the fit time by roughly 2 each time (1.8 to 2.4 in this run, with timing noise), the signature of n log n, where the log factor adds only a few percent per doubling; an n² algorithm would multiply by 4. Prediction is a fraction of a microsecond per row because each row needs only 12 comparisons. Your times will differ with the machine; the ratios are the point.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Prediction is O(log n)" assumes a balanced tree. An unpruned tree on messy data can be 30+ levels deep (our churn tree is 31, while log₂ 12,000 ≈ 13.6). Quote O(depth) and mention the balanced case as a special case. For forests, multiply by the number of trees.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feature Importance (MDI).</b> Managers ask "which columns matter most?". A tree records how much each split helped, which gives a quick answer, with a catch.</div>

  <h2 id="dt-mdi"><span class="num">18</span>Feature Importance from the Tree (MDI)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A manager asks which weather columns matter most for whether the team plays. Is the root question the answer, or is there a number that adds up what each column contributed across all its splits?</p>
  </div>
  <h3>The idea</h3>
  <p>Every split removed some impurity, and it did so using one feature. Add up, for each feature, all the impurity it removed, weighted by how many rows reached the node. Normalise so the totals sum to 1. This is <strong>Mean Decrease in Impurity</strong> (MDI), also called Gini importance, and it is what <code>feature_importances_</code> returns.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MDI(f)</strong> = Σ over internal nodes t that split on f of (n_t / N) · [i(t) − (n_L / n_t) i(L) − (n_R / n_t) i(R)], then divided by the sum over all features. n_t, n_L, n_R are row counts in the node and its children; N is the total training rows.</p>
  </div>
  <h3>By hand on the diary tree (entropy, ID3)</h3>
  <table class="tbl">
    <tr><th>Node</th><th>feature</th><th>n_t / N</th><th>IG at the node</th><th>weighted drop</th></tr>
    <tr><td>root</td><td>Outlook</td><td>14/14 = 1</td><td>0.247</td><td>0.247</td></tr>
    <tr><td>Sunny</td><td>Humidity</td><td>5/14 = 0.357</td><td>0.971</td><td>0.347</td></tr>
    <tr><td>Rain</td><td>Wind</td><td>5/14 = 0.357</td><td>0.971</td><td>0.347</td></tr>
    <tr><td colspan="4">total (= H(S) = 0.940, because all leaves are pure)</td><td>0.940</td></tr>
  </table>
  <p>Normalised: Outlook 0.247 / 0.940 = <strong>0.26</strong>, Humidity <strong>0.37</strong>, Wind <strong>0.37</strong>, Temp 0. Surprise: the root feature is <em>not</em> the most important. The root split removed less uncertainty than the two second-level splits did together; position in the tree is not importance.</p>
  <h3>Checking sklearn's formula</h3>
  <p>Now the same computation on sklearn's depth-2 entropy tree for the diary (one-hot encoded), reading each node's impurity and row counts from <code>tree_</code>:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int); y = df["Play"]
clf = DecisionTreeClassifier(criterion="entropy", max_depth=2, random_state=0).fit(X, y)
s = clf.tree_
N = s.weighted_n_node_samples[0]
raw = np.zeros(X.shape[1])
for t in range(s.node_count):
    L, R = s.children_left[t], s.children_right[t]
    if L == -1: continue                                  # leaves do not split
    n_t, n_L, n_R = s.weighted_n_node_samples[[t, L, R]]
    drop = n_t / N * (s.impurity[t] - n_L / n_t * s.impurity[L] - n_R / n_t * s.impurity[R])
    print(f"node {t}: {X.columns[s.feature[t]]:16s} n={n_t:.0f}  weighted impurity drop {drop:.3f}")
    raw[s.feature[t]] += drop
ours = raw / raw.sum()
nz = ours &gt; 0
print("ours:   ", {c: round(float(v), 3) for c, v in zip(X.columns[nz], ours[nz])})
print("sklearn:", {c: round(float(v), 3) for c, v in zip(X.columns[nz], clf.feature_importances_[nz])})</div>
  <div class="fx" data-lang="text">node 0: Outlook_Overcast n=14  weighted impurity drop 0.226
node 1: Humidity_Normal  n=10  weighted impurity drop 0.199
ours:    {'Outlook_Overcast': 0.532, 'Humidity_Normal': 0.468}
sklearn: {'Outlook_Overcast': 0.532, 'Humidity_Normal': 0.468}</div>
  <p>Root: 14 rows, entropy drop 0.940 → 0.714 = 0.226, weight 1. Node 1: 10 rows [5 No, 5 Yes], entropy 1 → 0.722 = 0.278, weight 10/14, gives 0.199. Normalised 0.226 / 0.425 = 0.532 and 0.468, identical to <code>feature_importances_</code>.</p>
  <h3>The catch: bias toward many-valued features</h3>
  <div class="fx" data-lang="py">from common import *
for d in [6, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr)
    imp = pd.Series(t.feature_importances_, index=Xtr.columns).sort_values(ascending=False)
    print(f"max_depth={d}: top 4 " + ", ".join(f"{k} {v:.3f}" for k, v in imp.head(4).items()))
    print(f"   row_noise {imp['row_noise']:.3f} (rank {list(imp.index).index('row_noise') + 1})"
          f"   coin_noise {imp['coin_noise']:.3f} (rank {list(imp.index).index('coin_noise') + 1})")</div>
  <div class="fx" data-lang="text">max_depth=6: top 4 f5 0.198, f8 0.171, f4 0.151, f7 0.130
   row_noise 0.001 (rank 9)   coin_noise 0.000 (rank 14)
max_depth=None: top 4 f8 0.140, f5 0.130, f4 0.122, f7 0.109
   row_noise 0.030 (rank 11)   coin_noise 0.005 (rank 14)</div>
  <p>In the pruned depth-6 tree, the noise columns get almost nothing. In the fully grown tree, <code>row_noise</code> (pure noise, but 20,000 distinct values) collects 0.030 importance, six times more than <code>coin_noise</code> (also pure noise, but only 2 values). A column with many values offers many thresholds, so deep in the tree, among a handful of rows, some threshold always "helps" by chance. MDI is computed on <em>training</em> data, so it rewards this memorising.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never rank features for a business decision with MDI of a deep tree. Use permutation importance on validation data, drop-column importance, or SHAP, and prune or ensemble first. All of these are worked through in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>. Also, two correlated columns split the importance between them, so each may look unimportant.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: scikit-learn in Practice.</b> We have every concept. Now the practical toolbox: every parameter of sklearn's trees, and how to print, draw and inspect a fitted tree.</div>

  <h2 id="dt-sklearn"><span class="num">19</span>scikit-learn in Practice</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have every concept and have computed each one by hand on the diary. How do they map onto the parameters, attributes and methods of sklearn's DecisionTreeClassifier, and how do we print, draw and inspect a fitted tree?</p>
  </div>
  <h3>Every constructor parameter</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th><th>Section</th></tr>
    <tr><td><code>criterion</code></td><td>"gini" / "squared_error"</td><td>impurity: gini, entropy, log_loss (= entropy) · squared_error, friedman_mse, absolute_error, poisson</td><td>03, 06, 11</td></tr>
    <tr><td><code>splitter</code></td><td>"best"</td><td>"best" tries all thresholds; "random" draws one random threshold per feature and keeps the best of those (the Extra-Trees idea)</td><td><a class="xref" data-note="ml_extratrees">Extra Trees</a></td></tr>
    <tr><td><code>max_depth</code></td><td>None</td><td>maximum depth</td><td>13</td></tr>
    <tr><td><code>min_samples_split</code></td><td>2</td><td>minimum rows to split a node (int or fraction)</td><td>13</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>1</td><td>minimum rows in each child (int or fraction)</td><td>13</td></tr>
    <tr><td><code>min_weight_fraction_leaf</code></td><td>0.0</td><td>minimum share of total sample weight per leaf</td><td>13</td></tr>
    <tr><td><code>max_features</code></td><td>None</td><td>columns considered per split: int, fraction, "sqrt", "log2"</td><td>13, <a class="xref" data-note="ml_rf">RF</a></td></tr>
    <tr><td><code>max_leaf_nodes</code></td><td>None</td><td>cap on leaves; switches to best-first growth</td><td>13</td></tr>
    <tr><td><code>min_impurity_decrease</code></td><td>0.0</td><td>minimum weighted impurity drop for a split</td><td>13</td></tr>
    <tr><td><code>ccp_alpha</code></td><td>0.0</td><td>cost-complexity pruning strength</td><td>14</td></tr>
    <tr><td><code>class_weight</code> (classifier only)</td><td>None</td><td>dict or "balanced": weights rows of rare classes up inside the impurity counts, for imbalanced data</td><td><a class="xref" data-note="ml_tree_tuning">Tuning</a></td></tr>
    <tr><td><code>monotonic_cst</code></td><td>None</td><td>per feature: +1 increasing, −1 decreasing, 0 free (sklearn ≥ 1.4; no multiclass, no NaN)</td><td>16</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>seed: features are shuffled at every split, so ties between equally good splits are broken randomly; set it for reproducible trees</td><td>20</td></tr>
  </table>
  <h3>After fitting</h3>
  <table class="tbl">
    <tr><th>Attribute / method</th><th>Gives</th></tr>
    <tr><td><code>predict(X)</code> / <code>predict_proba(X)</code></td><td>class (or mean) / class shares of the leaf</td></tr>
    <tr><td><code>apply(X)</code></td><td>id of the leaf each row lands in (useful for leaf-based features and segment analysis)</td></tr>
    <tr><td><code>decision_path(X)</code></td><td>sparse matrix of nodes each row visits: the row's rule</td></tr>
    <tr><td><code>get_depth()</code>, <code>get_n_leaves()</code></td><td>size of the tree</td></tr>
    <tr><td><code>feature_importances_</code></td><td>MDI (section 18)</td></tr>
    <tr><td><code>cost_complexity_pruning_path(X, y)</code></td><td>the α sequence and impurities (section 14)</td></tr>
    <tr><td><code>tree_</code></td><td>low-level arrays: <code>feature</code>, <code>threshold</code>, <code>children_left/right</code> (−1 = leaf), <code>impurity</code>, <code>n_node_samples</code>, <code>value</code>, <code>missing_go_to_left</code></td></tr>
    <tr><td><code>export_text</code>, <code>plot_tree</code>, <code>export_graphviz</code></td><td>text, matplotlib and Graphviz drawings</td></tr>
  </table>
  <h3>A complete example on the diary</h3>
  <p>The categories are one-hot encoded (one 0/1 column per value) because sklearn needs numbers. A depth-2 entropy tree keeps the output short. <code>show_weights=True</code> prints the class counts in each leaf, in the order of <code>classes_</code> (No, Yes).</p>
  <div class="fx" data-lang="py">import pandas as pd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)   # one 0/1 column per category
y = df["Play"]
clf = DecisionTreeClassifier(criterion="entropy", max_depth=2, random_state=0).fit(X, y)
print(export_text(clf, feature_names=list(X.columns), show_weights=True))
print("classes:", clf.classes_, " depth:", clf.get_depth(), " leaves:", clf.get_n_leaves())
day = X.loc[["D1", "D3", "D10"]]
print("predict:      ", clf.predict(day))
print("predict_proba:\\n", clf.predict_proba(day).round(3))
print("leaf id (apply):", clf.apply(day))
print("nodes visited by D1:", clf.decision_path(day).toarray()[0].nonzero()[0])
plt.figure(figsize=(9, 4))
plot_tree(clf, feature_names=list(X.columns), class_names=list(clf.classes_), filled=True)
plt.savefig("play_tree.png", dpi=120, bbox_inches="tight")</div>
  <div class="fx" data-lang="text">|--- Outlook_Overcast &lt;= 0.50
|   |--- Humidity_Normal &lt;= 0.50
|   |   |--- weights: [4.00, 1.00] class: No
|   |--- Humidity_Normal &gt;  0.50
|   |   |--- weights: [1.00, 4.00] class: Yes
|--- Outlook_Overcast &gt;  0.50
|   |--- weights: [0.00, 4.00] class: Yes

classes: ['No' 'Yes']  depth: 2  leaves: 3
predict:       ['No' 'Yes' 'Yes']
predict_proba:
 [[0.8 0.2]
 [0.  1. ]
 [0.2 0.8]]
leaf id (apply): [2 4 3]
nodes visited by D1: [0 1 2]</div>
  <p>Reading the output:</p>
  <ul>
    <li>The root is "Outlook_Overcast ≤ 0.5", the binary version of Outlook that section 06 predicted ("Overcast vs rest" beats Humidity). The second question is Humidity_Normal.</li>
    <li>The left-left leaf holds [4 No, 1 Yes]: with depth 2 it is not pure. So D1 (sunny, high humidity) gets <code>predict_proba</code> [0.8, 0.2]: probabilities are simply the leaf's class shares. D10 (rain, normal) lands in [1, 4] → [0.2, 0.8].</li>
    <li><code>apply</code> gives leaf ids 2, 4, 3; ids are node numbers in depth-first order (0 = root, 1 = its left child, 2 = left-left, 3 = left-right, 4 = root's right child).</li>
    <li><code>decision_path</code> shows D1 visits nodes 0 → 1 → 2.</li>
    <li><code>plot_tree(..., filled=True)</code> saves a picture: one box per node showing the question, the entropy, the number of samples, the class counts and the majority class, coloured by class with stronger colour for purer nodes.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Probabilities from a single deep tree are terrible: almost every leaf is pure, so <code>predict_proba</code> returns only 0s and 1s. That breaks ROC curves, thresholds and expected-cost decisions (see <a class="xref" data-note="ml_evaluation">Model Evaluation</a>). Use <code>min_samples_leaf</code> of at least 20–50, calibrate, or use an ensemble whose averaged probabilities are smoother.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Scratch.</b> Using a library is not the same as understanding it. The best test of understanding is to write the algorithm yourself and get the same answer.</div>

  <h2 id="dt-scratch"><span class="num">20</span>From Scratch: ID3 and CART</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Calling a library is not the same as understanding it. Can we write ID3 ourselves and get the hand-built diary tree, and write a CART that makes exactly sklearn's predictions?</p>
  </div>
  <h3>ID3 in 40 lines</h3>
  <p>Three functions carry the whole algorithm. <code>entropy</code> and <code>info_gain</code> are the formulas of sections 03–04. <code>id3</code> is the recursive loop of section 02: stop if the node is pure or no attributes are left; otherwise compute IG for each remaining attribute, split on the best, and call itself on every branch. A node is stored as a dict holding its attribute, a fallback majority class (for values never seen in training), and one child per value. <code>predict</code> walks down the dicts.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df

def entropy(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0

def info_gain(X, y, attr):
    weighted = sum(len(y_v) / len(y) * entropy(y_v) for _, y_v in y.groupby(X[attr]))
    return entropy(y) - weighted

def id3(X, y, attrs, depth=0):
    majority = y.mode()[0]
    if y.nunique() == 1 or not attrs:          # stop: pure node, or no questions left
        return majority
    gains = {a: info_gain(X, y, a) for a in attrs}
    best = max(gains, key=gains.get)           # the question with the largest IG
    print("  " * depth + f"split on {best}  (IG {gains[best]:.3f}, n={len(y)})")
    node = {"attr": best, "majority": majority, "kids": {}}
    for value in sorted(X[best].unique()):
        rows = X[best] == value
        node["kids"][value] = id3(X[rows], y[rows], [a for a in attrs if a != best], depth + 1)
    return node

def predict(node, row):
    while isinstance(node, dict):
        node = node["kids"].get(row[node["attr"]], node["majority"])   # unseen value -&gt; majority
    return node

def show(node, indent=""):
    for value, kid in node["kids"].items():
        if isinstance(kid, dict):
            print(f"{indent}{node['attr']} = {value}:"); show(kid, indent + "    ")
        else:
            print(f"{indent}{node['attr']} = {value}: {kid}")

X, y = df[["Outlook", "Temp", "Humidity", "Wind"]], df["Play"]
tree = id3(X, y, list(X.columns))
show(tree)
pred = X.apply(lambda r: predict(tree, r), axis=1)
print("training accuracy:", (pred == y).mean())</div>
  <div class="fx" data-lang="text">split on Outlook  (IG 0.247, n=14)
  split on Wind  (IG 0.971, n=5)
  split on Humidity  (IG 0.971, n=5)
Outlook = Overcast: Yes
Outlook = Rain:
    Wind = Strong: No
    Wind = Weak: Yes
Outlook = Sunny:
    Humidity = High: No
    Humidity = Normal: Yes
training accuracy: 1.0</div>
  <p>The printed trace is our hand calculation: Outlook at the root (IG 0.247, 14 rows), then Wind under Rain and Humidity under Sunny (IG 0.971 each, 5 rows). Overcast was pure, so it became a leaf without any print. The tree fits all 14 days.</p>
  <h3>Matching sklearn on the diary</h3>
  <p>Continuing in the same session, fit sklearn's entropy tree on the one-hot diary and compare both models on every one of the 3 × 3 × 2 × 2 = 36 possible days.</p>
  <div class="fx" data-lang="py">import itertools
from sklearn.tree import DecisionTreeClassifier
Xoh = pd.get_dummies(X).astype(int)                        # sklearn needs numbers: one-hot
sk = DecisionTreeClassifier(criterion="entropy", random_state=0).fit(Xoh, y)
print(f"training rows: ours {(pred == y).mean():.0%}, sklearn {sk.score(Xoh, y):.0%}")
grid = pd.DataFrame(list(itertools.product(*[sorted(X[c].unique()) for c in X.columns])),
                    columns=X.columns)                     # every possible day: 3*3*2*2 = 36
ours = grid.apply(lambda r: predict(tree, r), axis=1).values
theirs = sk.predict(pd.get_dummies(grid).astype(int)[Xoh.columns])
print(f"all {len(grid)} possible days: same answer on {(ours == theirs).sum()}")
print(grid[ours != theirs].assign(ours=ours[ours != theirs], sklearn=theirs[ours != theirs]))</div>
  <div class="fx" data-lang="text">training rows: ours 100%, sklearn 100%
all 36 possible days: same answer on 33
   Outlook  Temp Humidity    Wind ours sklearn
18    Rain   Hot   Normal  Strong   No     Yes
22    Rain  Mild   Normal  Strong   No     Yes
26   Sunny  Cool   Normal  Strong  Yes      No</div>
  <p>Both are perfect on the 14 training days and agree on 33 of 36 possible days. The 3 disagreements are days that never appear in the diary. Our ID3 tree splits on Outlook first and sends every rainy day to Wind, so a rainy, strong-wind day is "No". sklearn's binary tree grouped Sunny and Rain together and asked Humidity_Normal next, then learnt from D6 (rain, cool, normal, strong → No) and D11 (sunny, mild, normal, strong → Yes) that, among normal-humidity days, "strong wind and cool" means No. Both explanations fit the 14 days perfectly; they generalise differently. That is the <strong>inductive bias</strong> of multiway vs binary splitting, and another face of instability.</p>
  <h3>A CART that matches sklearn exactly</h3>
  <p>To get identical predictions we must build what sklearn builds: binary splits on numeric features, Gini, midpoint thresholds, the same stopping rule. This version uses the running-count trick of section 09 with numpy: <code>np.cumsum</code> over the one-hot class labels gives the class counts left of every cut in one shot, so each feature costs one sort and one vectorised scan.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier

def gini_from_counts(c):                             # c = [count class 0, count class 1]
    n = c.sum(axis=-1, keepdims=True)
    return 1 - ((c / n) ** 2).sum(axis=-1)

def best_split(X, y):
    best = (0.0, None, None)                          # (gain, feature, threshold)
    total = np.bincount(y, minlength=2)
    parent = gini_from_counts(total)
    for f in range(X.shape[1]):
        order = np.argsort(X[:, f], kind="stable"); xs, ys = X[order, f], y[order]
        left = np.cumsum(np.eye(2, dtype=int)[ys], axis=0)[:-1]   # class counts left of each cut
        right = total - left
        nl = np.arange(1, len(ys)); nr = len(ys) - nl
        w = (nl * gini_from_counts(left) + nr * gini_from_counts(right)) / len(ys)
        w[xs[1:] == xs[:-1]] = np.inf                 # no cut between two equal values
        i = int(np.argmin(w))
        if parent - w[i] &gt; best[0]:
            best = (parent - w[i], f, (xs[i] + xs[i + 1]) / 2)    # midpoint threshold
    return best

def build(X, y, depth, max_depth):
    gain, f, thr = best_split(X, y) if depth &lt; max_depth else (0, None, None)
    if f is None:                                     # pure, or depth limit reached
        return int(np.bincount(y, minlength=2).argmax())
    m = X[:, f] &lt;= thr
    return (f, thr, build(X[m], y[m], depth + 1, max_depth), build(X[~m], y[~m], depth + 1, max_depth))

def predict_one(node, x):
    while isinstance(node, tuple):                    # internal node = (feature, thr, left, right)
        f, thr, left, right = node
        node = left if x[f] &lt;= thr else right
    return node

from common import Xtr, ytr, Xte, yte                  # the churn data
A  = Xtr.to_numpy(np.float32)[:3000]; b = ytr[:3000]  # sklearn works in float32 too
At = Xte.to_numpy(np.float32)
ours = build(A, b, 0, max_depth=5)
sk = DecisionTreeClassifier(max_depth=5, random_state=0).fit(A, b)
p_ours = np.array([predict_one(ours, x) for x in At])
print(f"root: ours f{ours[0]} &lt;= {ours[1]:.4f} | sklearn f{sk.tree_.feature[0]} &lt;= {sk.tree_.threshold[0]:.4f}")
print(f"test accuracy: ours {np.mean(p_ours == yte):.3f}, sklearn {sk.score(At, yte):.3f}")
print(f"identical predictions on {np.mean(p_ours == sk.predict(At)):.1%} of {len(yte)} test rows")</div>
  <div class="fx" data-lang="text">root: ours f5 &lt;= 0.2556 | sklearn f5 &lt;= 0.2556
test accuracy: ours 0.696, sklearn 0.696
identical predictions on 100.0% of 5000 test rows</div>
  <p>Trained on 3,000 churn rows with max_depth 5, our tree picks the same root question (f5 ≤ 0.2556), has the same test accuracy, and makes the <strong>same prediction on all 5,000 test rows</strong>. Two details were needed: convert X to float32 (sklearn stores features as float32, so midpoints must be computed from the same rounded values), and never cut between two equal values. When two features give exactly the same gain (for example, two columns that are monotone transforms of each other), sklearn breaks the tie by its random feature order, and a from-scratch version may pick the other one; that is the only remaining source of differences.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Everything sklearn adds on top of these 40 lines is engineering: Cython speed, sample weights, multi-output, NaN handling, best-first growth, pruning. The algorithm itself, "try every feature and every midpoint, keep the largest impurity drop, recurse", fits on a single screen. Interviewers often ask you to write <code>best_split</code> on a whiteboard.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have every piece, from one question to a pruned, missing-value-proof tree that matches sklearn. One picture and one table should now show how each piece was built from the previous one.</div>

  <h2 id="dt-connect"><span class="num">21</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Entropy, information gain, gain ratio, Gini, error, thresholds, groupings, variance reduction, pruning, surrogates, MDI: twenty sections of separate facts, or one machine in which every part is built from the one before?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 760 410" width="760">
<defs><marker id="dt-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">class shares p</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">root: 9 Yes, 5 No</text>
<line x1="180" y1="32" x2="198" y2="32" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="200" y="10" width="170" height="44" rx="7" class="fb sb"/><text x="285" y="29" text-anchor="middle" font-size="11.5" font-weight="700">impurity</text><text x="285" y="45" text-anchor="middle" class="tm" font-size="10">H 0.940 · Gini 0.459</text>
<line x1="370" y1="32" x2="388" y2="32" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="390" y="10" width="170" height="44" rx="7" class="fb sb"/><text x="475" y="29" text-anchor="middle" font-size="11.5" font-weight="700">gain of a split</text><text x="475" y="45" text-anchor="middle" class="tm" font-size="10">IG Outlook 0.247</text>
<line x1="560" y1="32" x2="578" y2="32" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="580" y="10" width="170" height="44" rx="7" class="fb sb"/><text x="665" y="29" text-anchor="middle" font-size="11.5" font-weight="700">gain ratio</text><text x="665" y="45" text-anchor="middle" class="tm" font-size="10">÷ SplitInfo: Day 0.247</text>
<line x1="285" y1="54" x2="285" y2="90" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="200" y="92" width="170" height="44" rx="7" class="fr sr"/><text x="285" y="111" text-anchor="middle" font-size="11.5" font-weight="700">misclassification</text><text x="285" y="127" text-anchor="middle" class="tm" font-size="10">flat (gain 0): prune only</text>
<line x1="475" y1="54" x2="475" y2="90" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="390" y="92" width="360" height="44" rx="7" class="ft st"/><text x="570" y="111" text-anchor="middle" font-size="11.5" font-weight="700">search every column, every split</text><text x="570" y="127" text-anchor="middle" class="tm" font-size="10">categories · numbers (sort + midpoints) · numeric target</text>
<line x1="450" y1="136" x2="105" y2="172" stroke="currentColor" marker-end="url(#dt-ca)"/>
<line x1="570" y1="136" x2="330" y2="172" stroke="currentColor" marker-end="url(#dt-ca)"/>
<line x1="690" y1="136" x2="570" y2="172" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="10" y="174" width="190" height="44" rx="7" class="ft st"/><text x="105" y="193" text-anchor="middle" font-size="11.5" font-weight="700">categorical split</text><text x="105" y="209" text-anchor="middle" class="tm" font-size="10">{Sunny,Rain} | {Overcast}</text>
<rect x="235" y="174" width="190" height="44" rx="7" class="ft st"/><text x="330" y="193" text-anchor="middle" font-size="11.5" font-weight="700">numeric threshold</text><text x="330" y="209" text-anchor="middle" class="tm" font-size="10">HumPct ≤ 82.5 (Gini .367)</text>
<rect x="460" y="174" width="220" height="44" rx="7" class="ft st"/><text x="570" y="193" text-anchor="middle" font-size="11.5" font-weight="700">variance reduction</text><text x="570" y="209" text-anchor="middle" class="tm" font-size="10">turnout MSE 91.4 → 55.4</text>
<line x1="330" y1="218" x2="330" y2="254" stroke="currentColor" marker-end="url(#dt-ca)"/>
<line x1="105" y1="218" x2="250" y2="254" stroke="currentColor" marker-end="url(#dt-ca)"/>
<line x1="570" y1="218" x2="410" y2="254" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="200" y="256" width="260" height="44" rx="7" class="fg sg"/><text x="330" y="275" text-anchor="middle" font-size="11.5" font-weight="700">greedy recursion = the tree</text><text x="330" y="291" text-anchor="middle" class="tm" font-size="10">5 rules, 0 errors on 14 days</text>
<line x1="460" y1="278" x2="498" y2="278" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="500" y="256" width="250" height="44" rx="7" class="fr sr"/><text x="625" y="275" text-anchor="middle" font-size="11.5" font-weight="700">overfitting · instability</text><text x="625" y="291" text-anchor="middle" class="tm" font-size="10">drop D3 → root Humidity</text>
<line x1="625" y1="300" x2="625" y2="336" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="500" y="338" width="250" height="44" rx="7" class="fg sg"/><text x="625" y="357" text-anchor="middle" font-size="11.5" font-weight="700">pruning: limits, R + α|T|</text><text x="625" y="373" text-anchor="middle" class="tm" font-size="10">diary tree: root pruned at α 0.089</text>
<line x1="200" y1="278" x2="140" y2="336" stroke="currentColor" marker-end="url(#dt-ca)"/>
<rect x="10" y="338" width="460" height="44" rx="7" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="240" y="357" text-anchor="middle" font-size="11" font-weight="700">missing values · boxes · cost · MDI · sklearn · from scratch</text><text x="240" y="373" text-anchor="middle" class="tm" font-size="10">surrogate Humidity 100% · depth 2 · MDI Humidity .37 Wind .37</text>
</svg><figcaption>Everything in this note grows from one quantity, the impurity of a box of days. Gain compares a box with its children; the split search applies gain to categories, numbers and numeric targets; greedy recursion turns the best splits into a tree; the tree's memorising and instability call for pruning (and, in the next notes, for ensembles). Small grey numbers are the diary.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same 14 days</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the diary</th><th>Use when</th></tr>
    <tr><td>Tree of questions</td><td>nested if-else on one column at a time</td><td>how does the model predict?</td><td>5 rules; new day → Outlook → Humidity → Yes</td><td>always: the model itself</td></tr>
    <tr><td>Impurity</td><td>class shares p in a box</td><td>how mixed is a box?</td><td>[9 Yes, 5 No]</td><td>inside every split</td></tr>
    <tr><td>Entropy</td><td>average surprise −Σ p log₂ p</td><td>how mixed, in bits?</td><td>0.940</td><td>ID3, C4.5, <code>criterion="entropy"</code></td></tr>
    <tr><td>Information gain</td><td>parent entropy − weighted child entropy</td><td>which question first?</td><td>Outlook 0.247, Humidity 0.152, Wind 0.048, Temp 0.029</td><td>categorical multiway trees</td></tr>
    <tr><td>Gain ratio</td><td>IG ÷ entropy of branch sizes</td><td>how to curb many-valued columns?</td><td>Day 0.247, Outlook 0.156, Humidity 0.152</td><td>C4.5</td></tr>
    <tr><td>Gini</td><td>1 − Σ p² (chance two days disagree)</td><td>a cheaper impurity?</td><td>0.459; Overcast-vs-rest gain 0.102</td><td>CART, sklearn default</td></tr>
    <tr><td>Misclassification error</td><td>1 − max p</td><td>why not grow by accuracy?</td><td>Overcast-vs-rest: error gain 0</td><td>pruning only</td></tr>
    <tr><td>Numeric threshold</td><td>sort + midpoints + gain</td><td>how to cut a number?</td><td>HumPct ≤ 82.5, weighted Gini 0.367, IG 0.152</td><td>every numeric column</td></tr>
    <tr><td>Categorical grouping</td><td>sort values by play-rate + prefix splits</td><td>how to split unordered values in two?</td><td>{Sunny, Rain} | {Overcast}, 2 tries instead of 3</td><td>CART with categories</td></tr>
    <tr><td>Variance reduction</td><td>MSE of parent − weighted MSE of children</td><td>how to predict a number?</td><td>turnout 91.43 → 55.43; leaves 40 and 28</td><td>regression trees, every gradient booster</td></tr>
    <tr><td>Instability</td><td>the same greedy search on slightly changed data</td><td>how shaky is one tree?</td><td>without D3: Humidity 0.219 &gt; Outlook 0.214</td><td>reason for ensembles</td></tr>
    <tr><td>Pre-pruning</td><td>limits on depth, leaf size, gain</td><td>how to stop early?</td><td>max_depth 1: 10 of 14 days right</td><td>default practice</td></tr>
    <tr><td>Cost-complexity pruning</td><td>R(T) + α·|T|, weakest link g(t)</td><td>how to cut back in a principled way?</td><td>root weakest at α 0.089; sklearn path 0.0571, 0.1153</td><td>one interpretable tree</td></tr>
    <tr><td>Missing values</td><td>fractions / surrogates / learned NaN side</td><td>what if a reading is missing?</td><td>surrogate Humidity = High 100%; NaN → right ("No")</td><td>real data</td></tr>
    <tr><td>MDI importance</td><td>weighted impurity drops per column</td><td>which columns matter?</td><td>Humidity 0.37, Wind 0.37, Outlook 0.26</td><td>quick look; use permutation/SHAP for decisions</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a decision tree greedily picks, at every node, the question that most lowers the size-weighted impurity of the children, and recurses.</strong> Entropy, Gini and variance are just choices of impurity; thresholds and groupings are just ways to list candidate questions; pruning, missing-value rules and importance are all bookkeeping on the same impurity numbers. The greedy, top-down search is what makes trees fast and readable, and also what makes them shaky.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Strengths &amp; Weaknesses.</b> With the whole machine in view, when is one tree the right tool, and when should you reach for something else?</div>

  <h2 id="dt-pros"><span class="num">22</span>Strengths and Weaknesses</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how a tree works and how it fails. Weighing readability, speed and preparation against variance and coarse probabilities, when is a single tree the right model?</p>
  </div>
  <div class="cards">
    <div><b>Readable</b><p>The model is a set of if-then rules you can print, show to a regulator, or code into SQL.</p><small>Only while the tree is small (≲ 30 leaves)</small></div>
    <div><b>Little preparation</b><p>No scaling; robust to outliers in X (only order matters); handles mixed types; recent versions handle NaN.</p><small>Categoricals still need encoding in sklearn</small></div>
    <div><b>Non-linear and interactions</b><p>Bends and "humidity matters only when sunny" come for free, without crafting interaction terms.</p><small>Each interaction costs data</small></div>
    <div><b>Fast to predict</b><p>O(depth) comparisons; tiny memory; easy to deploy anywhere.</p><small>Microseconds per row</small></div>
    <div><b>Feature selection built in</b><p>Columns that never help are never used.</p><small>But MDI is biased</small></div>
    <div><b>Building block</b><p>The base learner of random forests and every gradient-boosting library.</p><small>Most important use today</small></div>
  </div>
  <div class="cards">
    <div><b>High variance</b><p>Small data changes give a different tree; accuracy below ensembles (0.81 vs about 0.88 for a forest on our churn data).</p><small>Fix: bagging / random forest</small></div>
    <div><b>Overfits easily</b><p>Unlimited growth memorises noise.</p><small>Fix: pre-/post-pruning</small></div>
    <div><b>Axis-aligned</b><p>Diagonal or additive patterns need staircases.</p><small>Fix: engineered features, ensembles</small></div>
    <div><b>No extrapolation</b><p>Constant outside the training range; poor for trends.</p><small>Fix: linear terms, model differences</small></div>
    <div><b>Coarse probabilities</b><p>Leaf shares; often 0 or 1 for deep trees.</p><small>Fix: bigger leaves, calibration</small></div>
    <div><b>Greedy</b><p>Not the optimal tree; can miss XOR-type patterns.</p><small>Fix: deeper search is NP-hard; ensembles help</small></div>
  </div>
  <p><strong>Use a single tree when</strong>: the rules must be explained or audited (credit policy, triage protocols), you need a quick baseline or a data-exploration tool ("which segments behave differently?"), or the deployment target is tiny. <strong>Otherwise</strong> use an ensemble: <a class="xref" data-note="ml_rf">Random Forest</a> as a robust default, <a class="xref" data-note="ml_gbm">Gradient Boosting</a> / <a class="xref" data-note="ml_xgboost">XGBoost</a> / <a class="xref" data-note="ml_lightgbm">LightGBM</a> for the best accuracy on tables.</p>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Strengths are relative. How does a tree compare with linear models and k-nearest neighbours, and with the ensembles built from it?</div>

  <h2 id="dt-compare"><span class="num">23</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A single tree has clear strengths and weaknesses. Side by side with the other single models, and with its own descendants (forests and boosting), where exactly does it win and lose?</p>
  </div>
  <h3>Against other single models</h3>
  <table class="tbl">
    <tr><th></th><th>Decision tree</th><th>Logistic / linear regression</th><th>k-nearest neighbours</th></tr>
    <tr><td>Boundary shape</td><td>axis-aligned boxes</td><td>one straight line / plane</td><td>any shape, follows the data</td></tr>
    <tr><td>Interactions</td><td>automatic</td><td>must add them by hand</td><td>automatic</td></tr>
    <tr><td>Feature scaling</td><td>not needed</td><td>needed for regularised / gradient fits</td><td>essential</td></tr>
    <tr><td>Categoricals</td><td>natively in C4.5/CART; encode in sklearn</td><td>one-hot</td><td>awkward (distances)</td></tr>
    <tr><td>Missing values</td><td>several native methods</td><td>impute</td><td>impute</td></tr>
    <tr><td>Interpretability</td><td>rules (small trees)</td><td>coefficients</td><td>"similar to these rows"</td></tr>
    <tr><td>Extrapolation</td><td>none (flat)</td><td>yes (linear trend)</td><td>none</td></tr>
    <tr><td>Bias / variance</td><td>low bias, high variance (deep)</td><td>high bias, low variance</td><td>depends on k</td></tr>
    <tr><td>Training / prediction</td><td>O(n d log n) / O(depth)</td><td>O(n d) per pass / O(d)</td><td>none / O(n d) per query</td></tr>
  </table>
  <h3>Against its descendants</h3>
  <table class="tbl">
    <tr><th></th><th>Single tree</th><th><a class="xref" data-note="ml_bagging">Bagging</a> / <a class="xref" data-note="ml_rf">Random Forest</a></th><th><a class="xref" data-note="ml_boosting">Boosting</a> (<a class="xref" data-note="ml_gbm">GBM</a>, XGBoost, …)</th></tr>
    <tr><td>Trees</td><td>1</td><td>hundreds, independent, deep</td><td>hundreds, sequential, shallow</td></tr>
    <tr><td>Main effect</td><td>–</td><td>cuts variance by averaging</td><td>cuts bias by correcting errors</td></tr>
    <tr><td>Accuracy on tables</td><td>baseline</td><td>strong</td><td>usually strongest</td></tr>
    <tr><td>Interpretability</td><td>read the rules</td><td>needs importance / SHAP</td><td>needs importance / SHAP</td></tr>
    <tr><td>Tree type used</td><td>classification or regression</td><td>same as the task</td><td>regression trees (even for classification)</td></tr>
  </table>
  <h3>The three impurity scores</h3>
  <table class="tbl">
    <tr><th></th><th>Entropy</th><th>Gini</th><th>Misclassification</th><th>Variance (MSE)</th></tr>
    <tr><td>Task</td><td>classification</td><td>classification</td><td>classification</td><td>regression</td></tr>
    <tr><td>Formula</td><td>−Σ p log₂ p</td><td>1 − Σ p²</td><td>1 − max p</td><td>mean (y − ȳ)²</td></tr>
    <tr><td>Strictly concave</td><td>yes</td><td>yes</td><td>no (piecewise linear)</td><td>–</td></tr>
    <tr><td>Use for growing</td><td>yes</td><td>yes (default)</td><td>no</td><td>yes (default)</td></tr>
    <tr><td>Use for pruning</td><td>possible</td><td>sklearn's CCP</td><td>REP, classic CCP</td><td>sklearn's CCP</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing the comparisons is half the job; the other half is avoiding the mistakes people make with trees in code and in interviews.</div>

  <h2 id="dt-traps"><span class="num">24</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes with decision trees cost the most, in projects and in interviews, and which section of this note prevents each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unweighted child impurity</span>
    <p>Averaging the children's entropy or Gini without weighting by size. A 1-row pure child then counts as much as a 1,000-row mixed child. Always use Σ (nₖ/n) · i(childₖ).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ID columns and timestamps</span>
    <p>Information gain (and MDI) love columns with many distinct values. An ID, phone number or exact timestamp can top the split list and the importance chart while being useless on new rows. Drop or transform them; gain ratio only softens the problem.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging by training accuracy</span>
    <p>A fully grown tree scores 100% on its training data almost by construction. Always compare train and validation (or CV) scores, and tune depth / leaf size / α on validation folds, never on the test set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "the root feature is the most important"</span>
    <p>In the diary tree, the root (Outlook) has MDI 0.26, below Humidity and Wind (0.37 each). And the root itself can change with a small change in data. Use proper importance methods.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scaling features for a tree</span>
    <p>Harmless but useless: splits depend only on order. Spend the time on meaningful features (ratios, differences) instead, which change what the tree can express.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: arbitrary integer codes for categories</span>
    <p>Coding cities as 0, 1, 2, … imposes a fake order. It works with enough depth but wastes splits; under a depth limit it loses accuracy (0.621 vs 0.758 in section 10). Prefer one-hot for few values, out-of-fold target encoding for many, or a library with native categorical support.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting leaf probabilities</span>
    <p>Deep-tree probabilities are mostly 0 and 1. Do not use them for risk scores without larger leaves or calibration.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting extrapolation</span>
    <p>A regression tree predicts at most the largest leaf mean it learnt. Forecasting a growing quantity with a tree flattens the forecast.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: entropy above 1 "is a bug"</span>
    <p>Only for two classes is the maximum 1 bit. With k classes it is log₂ k (1.585 for 3). Gini's maximum is 1 − 1/k.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting random_state</span>
    <p>sklearn shuffles features at every split, so when two splits tie, different seeds give different trees. Set <code>random_state</code> for reproducible results and explanations.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page for revision.</div>

  <h2 id="dt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's 14-day cricket diary. Outlook (Sunny / Overcast / Rain), Temp (Hot / Mild / Cool), Humidity (High / Normal), Wind (Weak / Strong) → Play (9 Yes, 5 No); plus HumPct (65–96), TempC and Turnout (20–48, mean 34).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on the diary</th><th>Weakness → next</th></tr>
    <tr><td>Tree of questions</td><td>reason one question at a time?</td><td>5 rules, 0 errors</td><td>who chooses the questions? → impurity</td></tr>
    <tr><td>Impurity</td><td>score "how mixed"?</td><td>[9, 5] box</td><td>which formula? → entropy</td></tr>
    <tr><td>Entropy</td><td>principled mixedness?</td><td>0.940 bits</td><td>scores one box → gain</td></tr>
    <tr><td>Information gain</td><td>which question first?</td><td>Outlook 0.247 → full tree by hand</td><td>loves ID columns (Day 0.940) → gain ratio</td></tr>
    <tr><td>Gain ratio</td><td>curb many-valued columns?</td><td>Day 0.247, Outlook 0.156</td><td>logs are slow → Gini</td></tr>
    <tr><td>Gini</td><td>cheaper impurity?</td><td>0.459; Overcast-vs-rest 0.102</td><td>why not accuracy? → error</td></tr>
    <tr><td>Misclassification</td><td>grow by accuracy?</td><td>Overcast-vs-rest gain 0</td><td>flat → prune with it only</td></tr>
    <tr><td>ID3 / C4.5 / CART</td><td>how are choices packaged?</td><td>sklearn = CART, binary</td><td>only categories so far → numbers</td></tr>
    <tr><td>Numeric threshold</td><td>split a number?</td><td>HumPct ≤ 82.5, Gini 0.367</td><td>categories have no order → groupings</td></tr>
    <tr><td>Categorical grouping</td><td>split unordered values in two?</td><td>{Sunny, Rain} | {Overcast}</td><td>numeric target? → regression</td></tr>
    <tr><td>Regression tree</td><td>predict a number?</td><td>turnout leaves 40 / 28, MSE 91.4 → 55.4</td><td>grows until pure → overfitting</td></tr>
    <tr><td>Overfitting / instability</td><td>what if it keeps growing?</td><td>drop D3 → root Humidity; churn 1.000 vs 0.773</td><td>stop memorising → pre-pruning</td></tr>
    <tr><td>Pre-pruning</td><td>stop early?</td><td>depth 1: 10/14 right</td><td>horizon effect → post-pruning</td></tr>
    <tr><td>Post-pruning (CCP)</td><td>cut back by a rule?</td><td>root weakest at α 0.089</td><td>readings go missing → missing values</td></tr>
    <tr><td>Missing values</td><td>a reading is missing?</td><td>surrogate Humidity 100%; NaN → right</td><td>what shapes? → boundaries</td></tr>
    <tr><td>Boundaries, cost, MDI</td><td>shape, speed, which columns?</td><td>boxes; depth 2; Humidity .37, Wind .37, Outlook .26</td><td>one tree is shaky → ensembles</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and diary value</th></tr>
    <tr><td>Entropy</td><td>H(S) = −Σᵢ pᵢ log₂ pᵢ</td><td>pᵢ share of class i in S; 0 · log 0 = 0; max log₂ k. Diary 0.940</td></tr>
    <tr><td>Gini</td><td>G(S) = 1 − Σᵢ pᵢ²</td><td>chance two random rows disagree; max 1 − 1/k. Diary 0.459</td></tr>
    <tr><td>Misclassification</td><td>E(S) = 1 − maxᵢ pᵢ</td><td>share disagreeing with the majority. Diary 5/14 = 0.357</td></tr>
    <tr><td>Gain</td><td>Δi = i(S) − Σₖ (|Sₖ|/|S|) i(Sₖ)</td><td>|Sₖ| rows in child k; with entropy = information gain. Outlook 0.247</td></tr>
    <tr><td>Split information</td><td>SplitInfo = −Σᵥ (|Sᵥ|/|S|) log₂(|Sᵥ|/|S|)</td><td>entropy of branch sizes. Outlook (5, 4, 5): 1.577</td></tr>
    <tr><td>Gain ratio</td><td>GR = IG / SplitInfo</td><td>Outlook 0.247 / 1.577 = 0.156</td></tr>
    <tr><td>Threshold candidates</td><td>tᵢ = (vᵢ + vᵢ₊₁)/2</td><td>vᵢ sorted distinct values; m values → m − 1 cuts. HumPct: 9 cuts</td></tr>
    <tr><td>Category groupings</td><td>2^(k−1) − 1 (all); k − 1 after sorting by rate</td><td>k values of the column. Outlook: 3, or 2</td></tr>
    <tr><td>Regression impurity</td><td>MSE(S) = (1/|S|) Σ (yᵢ − ȳ)²; leaf = ȳ (MAE → median)</td><td>Turnout: 91.43; leaves 40 and 28</td></tr>
    <tr><td>Cost-complexity</td><td>R_α(T) = R(T) + α|T|</td><td>R training error (sklearn: Σ (n_t/N)·impurity), |T| leaves, α price per leaf</td></tr>
    <tr><td>Weakest link</td><td>g(t) = (R(t) − R(T_t)) / (|T_t| − 1)</td><td>error saved per extra leaf; prune the smallest; diary root 0.357/4 = 0.089</td></tr>
    <tr><td>MDI</td><td>Σ over splits on f of (n_t/N)·Δi(t), normalised</td><td>Outlook 0.247/0.940 = 0.26; Humidity, Wind 0.347/0.940 = 0.37</td></tr>
    <tr><td>Cost</td><td>train ≈ O(n·d·log n); predict O(depth)</td><td>n rows, d columns</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a single tree</b><p>The rules must be read or audited; a quick baseline; finding segments; tiny deployment targets.</p><small>Prune it: depth, min_samples_leaf, ccp_alpha</small></div>
    <div><b>Avoid a single tree</b><p>When accuracy matters most, probabilities are needed, the pattern is diagonal or additive, or the target has a trend.</p><small>Random forest, boosting, linear models</small></div>
    <div><b>Entropy or Gini?</b><p>Almost always the same tree; Gini is a bit faster and the sklearn default.</p><small>Tune depth / pruning instead</small></div>
    <div><b>Categories</b><p>One-hot for few values, out-of-fold target encoding for many, or native support (LightGBM, CatBoost).</p><small>Arbitrary codes waste splits</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Unweighted child impurity; ID columns topping the gain list; judging by training accuracy; calling the root "the most important feature"; scaling features for a tree (useless); arbitrary integer codes; trusting 0/1 leaf probabilities; expecting extrapolation; entropy above 1 is not a bug for k &gt; 2 classes; forgetting random_state.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Entropy of [2 Yes, 3 No]?</td><td>−0.4 log₂ 0.4 − 0.6 log₂ 0.6 = 0.971</td></tr>
    <tr><td>IG of Humidity on the diary (High [3, 4], Normal [6, 1])?</td><td>0.940 − (0.5 × 0.985 + 0.5 × 0.592) = 0.152</td></tr>
    <tr><td>Gini of [6 Yes, 1 No]?</td><td>1 − (6/7)² − (1/7)² = 0.245</td></tr>
    <tr><td>Turnout 44, 22, 42, 40, 46, 38, 48 in one leaf: value with squared error, with absolute error?</td><td>mean 40; median 42</td></tr>
    <tr><td>Why can a split with zero error gain still be the best split?</td><td>Error is piecewise linear: Overcast-vs-rest keeps 5 wrong days but creates a pure box; Gini gain 0.102</td></tr>
  </table>

  <h2 id="dt-qa"><span class="num">25</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Define entropy and compute it for a node with 9 positives and 5 negatives.</summary><div class="qa-body">Entropy H = −Σ pᵢ log₂ pᵢ is the average surprise (in bits) of a randomly drawn row's class. Shares 9/14 = 0.643 and 5/14 = 0.357: H = 0.643 × 0.637 + 0.357 × 1.485 = 0.410 + 0.530 = 0.940 bits. It is 0 for a pure node and 1 for a 50/50 two-class node.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is information gain, and why is it equal to mutual information?</summary><div class="qa-body">IG(S, A) = H(S) − Σ_v (|S_v|/|S|) H(S_v): parent entropy minus the size-weighted entropy of the children. The second term is the conditional entropy H(Y | A), so IG = H(Y) − H(Y | A), which is the definition of the mutual information I(Y; A): how much knowing A reduces uncertainty about Y.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does information gain favour attributes with many values, and how does C4.5 fix it?</summary><div class="qa-body">More values means smaller branches, and small groups are pure by chance; an ID column gives one pure row per branch and the maximum possible IG (0.940 on the diary). C4.5 divides by SplitInfo, the entropy of the branch sizes (log₂ 14 = 3.807 for the ID), giving the gain ratio, and only considers attributes whose IG is at least average. It softens the bias but an ID column can still win, so IDs should be dropped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gini vs entropy: what is the difference, and which should I use?</summary><div class="qa-body">Gini = 1 − Σ p² (chance two random rows disagree), entropy = −Σ p log₂ p (average surprise). Scaled to the same peak they almost coincide; Gini is a first-order Taylor approximation of entropy (ln p ≈ p − 1). Gini needs no logarithm so it is a bit faster and is sklearn's default; in practice accuracy is the same (0.807 vs 0.806 on our churn data). Tune depth and pruning instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't trees grow using misclassification error?</summary><div class="qa-body">Error = 1 − max p is piecewise linear, not strictly concave. When both children keep the parent's majority class, the weighted child error equals the parent error, so useful splits get gain 0 (e.g. [7,3] → [4,0] | [3,3]) and different splits tie (the [400,400] example). Entropy and Gini reward any increase in purity. Error is still used for pruning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a tree choose a threshold for a numeric feature, and what does it cost?</summary><div class="qa-body">Sort the values, consider the midpoint between each pair of neighbouring distinct values (only class-boundary points can win), and scan left to right updating class counts in O(1) per step, scoring weighted impurity. Cost per feature per node: O(m log m) sort + O(m) scan. Histogram-based libraries replace this with a few hundred bin edges.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare ID3, C4.5 and CART.</summary><div class="qa-body">ID3: information gain, multiway splits, categorical only, no pruning, no missing handling. C4.5: gain ratio, numeric thresholds, fractional rows for missing values, pessimistic error pruning. CART: Gini (or MSE for regression), always binary splits, surrogate splits for missing values, cost-complexity pruning with CV. sklearn implements an optimised CART (without surrogates or categorical splits, with NaN direction learning).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a regression tree split and predict? What changes with MAE?</summary><div class="qa-body">It chooses the split that maximises variance (MSE) reduction: MSE(parent) − weighted MSE(children). Each leaf predicts the mean of its rows (the constant minimising squared error). With absolute error the leaf predicts the median, which is robust to outliers (5.5 vs 13.75 for salaries 4, 5, 6, 40). Predictions form a step function and cannot extrapolate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain cost-complexity pruning and the weakest link.</summary><div class="qa-body">Minimise R_α(T) = R(T) + α|T|: error plus a price α per leaf. For each internal node, g(t) = (R(t) − R(T_t)) / (|T_t| − 1) is the error saved per extra leaf; prune the node with the smallest g (the weakest link), set α to that g, recompute, repeat. This gives a nested sequence of subtrees for increasing α; pick α by cross-validation (optionally the 1-SE rule). In sklearn: <code>cost_complexity_pruning_path</code> then <code>ccp_alpha</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pre-pruning vs post-pruning: trade-offs?</summary><div class="qa-body">Pre-pruning (max_depth, min_samples_leaf, min_impurity_decrease, max_leaf_nodes) is cheap and simple but suffers from the horizon effect: a weak split that enables a strong one below is never made. Post-pruning (reduced-error, cost-complexity, pessimistic) grows fully then cuts, which sees those combinations but costs more training time and, for REP, a validation set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do decision trees handle missing values?</summary><div class="qa-body">C4.5: compute gain on known rows and scale by the known fraction; send rows with unknown values down every branch with fractional weights, and at prediction combine the branch probabilities. CART: surrogate splits on other columns that mimic the primary split, ranked by agreement. sklearn ≥ 1.3 and XGBoost: learn at each split which side NaNs go to. Otherwise impute and add a missing indicator.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the time complexities of training and prediction?</summary><div class="qa-body">Training is about O(n · d · log n) for a balanced tree with presorted features (O(d · n log² n) if sorting at every node; worse for very unbalanced trees). Prediction is O(depth), about O(log n) when balanced, independent of the number of features. Memory is O(nodes) ≤ 2n − 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are single trees called "high variance", and how does that lead to random forests?</summary><div class="qa-body">Small changes in the training data move the top thresholds, which changes which rows reach every lower node, so the whole tree changes (five 80% samples gave five different trees, each about 0.78, agreeing on only half the rows). Their errors are partly random, so averaging many trees cancels them: five votes gave 0.840. Bagging trains trees on bootstrap samples; random forests also randomise the columns at each split to make trees less alike.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gradient boosting is used for classification. Why does it use regression trees?</summary><div class="qa-body">Each boosting round fits a tree to the negative gradient of the loss (for log loss, y − p), which is a real number per row, not a class. So every tree is a regression tree with variance-reduction splits and numeric leaf values that are added to the running log-odds. Knowing regression trees well (section 11) is the prerequisite for GBM, XGBoost and LightGBM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your tree's top feature is a customer ID-like column with high MDI. What happened and what do you do?</summary><div class="qa-body">MDI is computed on training data and favours high-cardinality features: many thresholds let the tree carve tiny pure leaves by chance (row_noise got 6× the importance of coin_noise in our test). Check with permutation importance on validation data or SHAP; drop or transform identifier columns; prune the tree (min_samples_leaf, ccp_alpha) so it cannot memorise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does information gain need gain ratio, and why does CART need it much less?</summary><div class="qa-body">IG rewards splits into many small groups because small groups look pure by chance: a Day column on the diary gets the maximum 0.940. Gain ratio divides by the entropy of the branch sizes (log₂ 14 = 3.807 for Day), cutting it to 0.247. CART only makes binary splits, so a column cannot shatter the data into 14 branches in one step; the bias still exists (MDI of deep trees, many-valued columns) but is milder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks if you grow a tree with misclassification error instead of entropy or Gini? Show it on the diary.</summary><div class="qa-body">Error is piecewise linear in the class shares, so a split that keeps the same majority on both sides scores exactly zero. On the diary, Overcast vs rest turns [9, 5] into [4, 0] | [5, 5]: 5 wrong days before and after, error gain 0. Gini gain is 0.102 and sklearn picks this split at the root, because it creates a pure box and sets up the Humidity split. With error the greedy search would stall.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the diary, why do HumPct ≤ 82.5 and the category Humidity give exactly the same information gain (0.152)?</summary><div class="qa-body">All High days read 85–96% and all Normal days 65–80%, so the cut 82.5 sends exactly the Normal days left and the High days right. Same groups, same class counts ([6, 1] and [3, 4]), same gain. The numeric search found the category's boundary by itself, and the categorical column is a perfect surrogate for the numeric split.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does removing day D3 teach about trees, and which later notes build on it?</summary><div class="qa-body">Without D3, Humidity (0.219) beats Outlook (0.214) at the root, so one day out of 14 changes the whole tree: high variance, because the top two splits are nearly tied and the search is greedy and hierarchical. Pruning cannot fix this without adding bias. <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>, <a class="xref" data-note="ml_bagging">Bagging</a> and <a class="xref" data-note="ml_rf">Random Forest</a> turn it into a strength by averaging many such trees.</div></details>
</main>
`
});
