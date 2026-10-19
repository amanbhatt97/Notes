// notes/ml/ml_dtree.js — Decision Trees
Object.assign(TOPIC_CONTENT, {
  "ml_dtree": `<main>
  <h1>Decision Trees</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Decision Trees</span></div>
  <p class="lead">A decision tree learns a flowchart of yes/no questions from a table of past examples, then answers a new row by walking down that flowchart. This note builds one completely by hand: entropy, information gain, gain ratio and Gini are each computed on small tables of numbers, a full tree is grown on the classic 14-day "play or not" dataset, then pruned, then rebuilt from scratch in Python and checked against scikit-learn. Every random forest and every gradient-boosting model you will meet later is made of these trees, so this is the foundation of the whole tree family.</p>

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

  <h2 id="dt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Decision Trees</div>
    <div class="mm-branches">
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
      <div class="rm-item rm-done" data-target="dt-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Tree of Questions</span><span class="rm-sub">Anatomy, rules, prediction</span></div></div>
      <div class="rm-item rm-done" data-target="dt-impurity"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Impurity</span><span class="rm-sub">A number for "how mixed"</span></div></div>
      <div class="rm-item rm-done" data-target="dt-entropy"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Entropy</span><span class="rm-sub">Surprise, log₂, 2- and 3-class by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-ig"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Information Gain</span><span class="rm-sub">A full tree built by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-gr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Gain Ratio</span><span class="rm-sub">Fixing IG's love of ID columns</span></div></div>
      <div class="rm-item rm-done" data-target="dt-gini"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gini Impurity</span><span class="rm-sub">And entropy vs Gini</span></div></div>
      <div class="rm-item rm-done" data-target="dt-error"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Misclassification Error</span><span class="rm-sub">Why not used for growing</span></div></div>
      <div class="rm-item rm-done" data-target="dt-algos"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">ID3 vs C4.5 vs CART</span><span class="rm-sub">The three classic algorithms</span></div></div>
      <div class="rm-item rm-done" data-target="dt-numeric"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Numeric Features</span><span class="rm-sub">Sort, midpoints, scan</span></div></div>
      <div class="rm-item rm-done" data-target="dt-cat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Categorical Features</span><span class="rm-sub">Binary groupings, one-hot effects</span></div></div>
      <div class="rm-item rm-done" data-target="dt-reg"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Regression Trees</span><span class="rm-sub">Variance reduction, mean vs median</span></div></div>
      <div class="rm-item rm-done" data-target="dt-overfit"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Overfitting &amp; Instability</span><span class="rm-sub">Memorising and high variance</span></div></div>
      <div class="rm-item rm-done" data-target="dt-pre"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Pre-Pruning</span><span class="rm-sub">Every stopping knob, measured</span></div></div>
      <div class="rm-item rm-done" data-target="dt-post"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Post-Pruning</span><span class="rm-sub">Reduced-error and cost-complexity</span></div></div>
      <div class="rm-item rm-done" data-target="dt-missing"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">C4.5, CART surrogates, sklearn NaN</span></div></div>
      <div class="rm-item rm-done" data-target="dt-geom"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Decision Boundaries</span><span class="rm-sub">Boxes and staircases</span></div></div>
      <div class="rm-item rm-done" data-target="dt-cost"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Time &amp; Memory Cost</span><span class="rm-sub">O(n·d·log n) train, O(depth) predict</span></div></div>
      <div class="rm-item rm-done" data-target="dt-mdi"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Feature Importance (MDI)</span><span class="rm-sub">Computed by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dt-sklearn"><span class="rm-num">19</span><div class="rm-text"><span class="rm-label">scikit-learn in Practice</span><span class="rm-sub">Every parameter, export_text, plot_tree</span></div></div>
      <div class="rm-item rm-done" data-target="dt-scratch"><span class="rm-num">20</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">ID3 and CART, matched to sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="dt-pros"><span class="rm-num">21</span><div class="rm-text"><span class="rm-label">Strengths &amp; Weaknesses</span><span class="rm-sub">When a single tree is right</span></div></div>
      <div class="rm-item rm-done" data-target="dt-compare"><span class="rm-num">22</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs linear, kNN, forests, boosting</span></div></div>
      <div class="rm-item rm-done" data-target="dt-traps"><span class="rm-num">23</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">24</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dt-idea"><span class="num">01</span>A Tree of Questions</h2>
  <h3>The need</h3>
  <p>Your college cricket team plays only on some evenings. The captain has kept a diary for 14 days: the weather (outlook), the temperature, the humidity, the wind, and whether the match was played. Tomorrow's forecast is "sunny, mild, normal humidity, strong wind". Will they play?</p>
  <p>A logistic regression would add up "sunny × weight + humid × weight + …" and draw one straight boundary. But the captain's real reasoning is not an addition. It is a chain of questions: "Is it overcast? Then we play. Is it sunny? Then it depends on humidity. Is it raining? Then it depends on the wind." Notice that humidity only matters on sunny days, and wind only matters on rainy days. That is an <strong>interaction</strong>, and a chain of questions captures it naturally.</p>
  <p>Here is the diary. It is the famous "PlayTennis" table from Ross Quinlan's 1986 paper that introduced ID3; we call it "play cricket". We will use it through most of this note, so it is worth a careful look.</p>
  <table class="tbl"><caption>The 14-day diary (9 Yes, 5 No)</caption>
    <tr><th>Day</th><th>Outlook</th><th>Temp</th><th>Humidity</th><th>Wind</th><th>Play</th></tr>
    <tr><td>D1</td><td>Sunny</td><td>Hot</td><td>High</td><td>Weak</td><td>No</td></tr>
    <tr><td>D2</td><td>Sunny</td><td>Hot</td><td>High</td><td>Strong</td><td>No</td></tr>
    <tr><td>D3</td><td>Overcast</td><td>Hot</td><td>High</td><td>Weak</td><td>Yes</td></tr>
    <tr><td>D4</td><td>Rain</td><td>Mild</td><td>High</td><td>Weak</td><td>Yes</td></tr>
    <tr><td>D5</td><td>Rain</td><td>Cool</td><td>Normal</td><td>Weak</td><td>Yes</td></tr>
    <tr><td>D6</td><td>Rain</td><td>Cool</td><td>Normal</td><td>Strong</td><td>No</td></tr>
    <tr><td>D7</td><td>Overcast</td><td>Cool</td><td>Normal</td><td>Strong</td><td>Yes</td></tr>
    <tr><td>D8</td><td>Sunny</td><td>Mild</td><td>High</td><td>Weak</td><td>No</td></tr>
    <tr><td>D9</td><td>Sunny</td><td>Cool</td><td>Normal</td><td>Weak</td><td>Yes</td></tr>
    <tr><td>D10</td><td>Rain</td><td>Mild</td><td>Normal</td><td>Weak</td><td>Yes</td></tr>
    <tr><td>D11</td><td>Sunny</td><td>Mild</td><td>Normal</td><td>Strong</td><td>Yes</td></tr>
    <tr><td>D12</td><td>Overcast</td><td>Mild</td><td>High</td><td>Strong</td><td>Yes</td></tr>
    <tr><td>D13</td><td>Overcast</td><td>Hot</td><td>Normal</td><td>Weak</td><td>Yes</td></tr>
    <tr><td>D14</td><td>Rain</td><td>Mild</td><td>High</td><td>Strong</td><td>No</td></tr>
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
  <p>The rules never overlap and together they cover every possible day, so every row gets exactly one answer. A tree is literally nested <code>if/else</code> code. The block below writes it by hand and checks it against the diary. <code>play.py</code> just holds the 14-row table as a pandas DataFrame called <code>df</code> (index D1…D14).</p>
  <div class="fx" data-lang="py">import pandas as pd
rows = [("Sunny","Hot","High","Weak","No"),      ("Sunny","Hot","High","Strong","No"),
        ("Overcast","Hot","High","Weak","Yes"),  ("Rain","Mild","High","Weak","Yes"),
        ("Rain","Cool","Normal","Weak","Yes"),   ("Rain","Cool","Normal","Strong","No"),
        ("Overcast","Cool","Normal","Strong","Yes"), ("Sunny","Mild","High","Weak","No"),
        ("Sunny","Cool","Normal","Weak","Yes"),  ("Rain","Mild","Normal","Weak","Yes"),
        ("Sunny","Mild","Normal","Strong","Yes"), ("Overcast","Mild","High","Strong","Yes"),
        ("Overcast","Hot","Normal","Weak","Yes"), ("Rain","Mild","High","Strong","No")]
df = pd.DataFrame(rows, columns=["Outlook", "Temp", "Humidity", "Wind", "Play"])
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
print(df.head(6))
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
  <div class="bridge"><b>What's still missing?</b> We drew a tree that works, but we chose its questions by looking at the answer. The machine needs a rule: at every node, which question should be asked? To compare questions, it first needs a number for "how mixed is this box".</div>

  <h2 id="dt-impurity"><span class="num">02</span>Impurity: Scoring a Mixed Group</h2>
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
  <div class="bridge"><b>What's still missing?</b> We have the recipe but not the ingredient. What exactly is entropy, why is there a logarithm in it, and why base 2?</div>

  <h2 id="dt-entropy"><span class="num">03</span>Entropy</h2>
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
  <div class="bridge"><b>What's still missing?</b> Entropy scores one box. To choose a question we need to score a split: how much entropy disappears when one box becomes several?</div>

  <h2 id="dt-ig"><span class="num">04</span>Information Gain: Building the Tree by Hand</h2>
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
  <div class="bridge"><b>What's still missing?</b> Information gain has a blind spot. What if a column has a different value on every row, like a customer ID or the date? Each value gets its own pure branch, so IG is as large as it can be, yet the column is useless for new rows.</div>

  <h2 id="dt-gr"><span class="num">05</span>Gain Ratio (C4.5): Fixing the Bias to Many Values</h2>
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
  <div class="bridge"><b>What's still missing?</b> Entropy needs a logarithm for every class at every candidate split. CART uses a cheaper score that behaves almost the same. What is it, and does the choice matter?</div>

  <h2 id="dt-gini"><span class="num">06</span>Gini Impurity</h2>
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
  <div class="bridge"><b>What's still missing?</b> There is an even simpler impurity: "what fraction of the box would I get wrong if I predicted the majority class?" It is exactly what we care about at the end (accuracy). Why don't trees grow with it?</div>

  <h2 id="dt-error"><span class="num">07</span>Misclassification Error: Why It Is Not Used for Growing</h2>
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
  <div class="bridge"><b>What's still missing?</b> We have three impurity scores and two ways of splitting (multiway, binary). Historically these were packaged into three named algorithms. Interviewers ask about them by name.</div>

  <h2 id="dt-algos"><span class="num">08</span>ID3 vs C4.5 vs CART</h2>
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
  <div class="bridge"><b>What's still missing?</b> The diary had only categories. Real tables are full of numbers: salary, age, monthly bill. A number has hundreds of possible cut-offs. Which ones does a tree try?</div>

  <h2 id="dt-numeric"><span class="num">09</span>Numeric Features: Finding the Best Threshold</h2>
  <h3>The need</h3>
  <p>A numeric column (monthly bill, age, salary) cannot get one branch per value: a bill of ₹4,512 would get its own branch, the ID-column problem again. Instead, C4.5 and CART ask a binary question <strong>"x ≤ t?"</strong>. The only job is to choose t.</p>
  <h3>Which thresholds are worth trying?</h3>
  <p>Between two neighbouring values in the sorted data, every t gives exactly the same split. If the bills are 35 and 40, then t = 36, 37.5 and 39.9 all send the same rows left. So with n distinct values there are only n − 1 different splits. By convention the tree uses the <strong>midpoint</strong> between neighbours, which places the boundary halfway between the two closest training rows (a fair guess for unseen values in the gap).</p>
  <div class="flow"><span>Sort rows by x (once)</span><span>Candidate t = midpoint of each neighbouring pair</span><span>Scan left to right, updating class counts</span><span>Score each t (weighted impurity)</span><span>Keep the best t</span></div>
  <h3>Worked by hand: 9 customers</h3>
  <p>Monthly bill (in ₹100s) and whether the customer churned (1) or stayed (0). The parent has 4 stays and 5 churns: Gini = 1 − (4/9)² − (5/9)² = 40/81 = 0.494.</p>
  <table class="tbl">
    <tr><th>Sorted bill</th><td>20</td><td>25</td><td>35</td><td>40</td><td>50</td><td>60</td><td>75</td><td>90</td><td>95</td></tr>
    <tr><th>Churn</th><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
<line x1="40" y1="70" x2="560" y2="70" stroke="currentColor"/>
<circle cx="60" cy="70" r="8" class="fg sg"/><circle cx="92" cy="70" r="8" class="fg sg"/><circle cx="156" cy="70" r="8" class="fg sg"/><circle cx="188" cy="70" r="8" class="fr sr"/><circle cx="252" cy="70" r="8" class="fg sg"/><circle cx="316" cy="70" r="8" class="fr sr"/><circle cx="412" cy="70" r="8" class="fr sr"/><circle cx="508" cy="70" r="8" class="fr sr"/><circle cx="540" cy="70" r="8" class="fr sr"/>
<text x="60" y="96" text-anchor="middle" font-size="11">20</text><text x="92" y="96" text-anchor="middle" font-size="11">25</text><text x="156" y="96" text-anchor="middle" font-size="11">35</text><text x="188" y="96" text-anchor="middle" font-size="11">40</text><text x="252" y="96" text-anchor="middle" font-size="11">50</text><text x="316" y="96" text-anchor="middle" font-size="11">60</text><text x="412" y="96" text-anchor="middle" font-size="11">75</text><text x="508" y="96" text-anchor="middle" font-size="11">90</text><text x="540" y="96" text-anchor="middle" font-size="11">95</text>
<g stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.5"><line x1="76" y1="40" x2="76" y2="82"/><line x1="124" y1="40" x2="124" y2="82"/><line x1="172" y1="40" x2="172" y2="82"/><line x1="220" y1="40" x2="220" y2="82"/><line x1="364" y1="40" x2="364" y2="82"/><line x1="460" y1="40" x2="460" y2="82"/><line x1="524" y1="40" x2="524" y2="82"/></g>
<line x1="284" y1="28" x2="284" y2="86" class="sb" stroke-width="3"/>
<text x="76" y="34" text-anchor="middle" class="tm" font-size="10">.417</text><text x="124" y="34" text-anchor="middle" class="tm" font-size="10">.317</text><text x="172" y="34" text-anchor="middle" class="tm" font-size="10">.185</text><text x="220" y="34" text-anchor="middle" class="tm" font-size="10">.344</text><text x="284" y="22" text-anchor="middle" class="tb" font-size="11.5">t = 55 → .178 best</text><text x="364" y="34" text-anchor="middle" class="tm" font-size="10">.296</text><text x="460" y="34" text-anchor="middle" class="tm" font-size="10">.381</text><text x="524" y="34" text-anchor="middle" class="tm" font-size="10">.444</text>
<text x="300" y="124" text-anchor="middle" class="tm" font-size="11.5">green = stayed, red = churned · dashed = candidate midpoints · numbers = weighted child Gini</text>
<text x="300" y="142" text-anchor="middle" class="tm" font-size="11.5">only cuts where the colour changes (37.5, 45, 55) can ever be the best</text>
</svg><figcaption>Eight candidate thresholds for nine sorted values. The best cut, at 55, leaves the right side pure.</figcaption></figure>
  <p>Two candidates by hand. <strong>t = 37.5</strong>: left {20, 25, 35} = [3 stay, 0 churn], Gini 0; right {40 … 95} = [1, 5], Gini 1 − (1/6)² − (5/6)² = 0.278. Weighted: (6/9)(0.278) = <strong>0.185</strong>. <strong>t = 55</strong>: left {20 … 50} = [4, 1], Gini 1 − 0.64 − 0.04 = 0.32; right {60 … 95} = [0, 4], Gini 0. Weighted: (5/9)(0.32) = <strong>0.178</strong>. Lower is better, so 55 wins by a hair.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
charge = np.array([60, 20, 90, 35, 40, 25, 75, 50, 95])    # monthly bill, in hundreds of rupees
churn  = np.array([ 1,  0,  1,  0,  1,  0,  1,  0,  1])
def gini(y):
    if len(y) == 0: return 0.0
    p = np.bincount(y, minlength=2) / len(y)
    return 1 - (p ** 2).sum()

order = np.argsort(charge)                          # step 1: sort once
xs, ys = charge[order], churn[order]
print("sorted x:", xs.tolist()); print("sorted y:", ys.tolist())
best = None
for i in range(1, len(xs)):                         # step 2: a cut between every neighbour pair
    thr = (xs[i - 1] + xs[i]) / 2                   # midpoint
    L, R = ys[:i], ys[i:]
    w = len(L) / len(ys) * gini(L) + len(R) / len(ys) * gini(R)
    print(f"x &lt;= {thr:5.1f}: left {np.bincount(L, minlength=2)} right {np.bincount(R, minlength=2)}"
          f"  weighted Gini {w:.3f}  gain {gini(ys) - w:.3f}")
    if best is None or w &lt; best[1]: best = (thr, w)
print("best threshold:", best[0])
t = DecisionTreeClassifier(max_depth=1).fit(charge.reshape(-1, 1), churn)
print("sklearn root threshold:", t.tree_.threshold[0])</div>
  <div class="fx" data-lang="text">sorted x: [20, 25, 35, 40, 50, 60, 75, 90, 95]
sorted y: [0, 0, 0, 1, 0, 1, 1, 1, 1]
x &lt;=  22.5: left [1 0] right [3 5]  weighted Gini 0.417  gain 0.077
x &lt;=  30.0: left [2 0] right [2 5]  weighted Gini 0.317  gain 0.176
x &lt;=  37.5: left [3 0] right [1 5]  weighted Gini 0.185  gain 0.309
x &lt;=  45.0: left [3 1] right [1 4]  weighted Gini 0.344  gain 0.149
x &lt;=  55.0: left [4 1] right [0 4]  weighted Gini 0.178  gain 0.316
x &lt;=  67.5: left [4 2] right [0 3]  weighted Gini 0.296  gain 0.198
x &lt;=  82.5: left [4 3] right [0 2]  weighted Gini 0.381  gain 0.113
x &lt;=  92.5: left [4 4] right [0 1]  weighted Gini 0.444  gain 0.049
best threshold: 55.0
sklearn root threshold: 55.0</div>
  <p>The scan evaluates every midpoint; 55.0 has the lowest weighted Gini (0.178), and sklearn's root threshold is exactly 55.0, the midpoint of 50 and 60. Notice the efficiency trick in the loop: after sorting once, moving the cut one step right moves exactly one row from the right group to the left group, so the class counts can be <strong>updated in O(1)</strong> instead of recounted. One feature at one node costs O(n log n) to sort plus O(n) to scan.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Only <strong>boundary points</strong> matter: a cut between two rows of the same class can never be optimal for entropy or Gini (Fayyad &amp; Irani, 1992). Here only 37.5, 45 and 55 sit between a stay and a churn, and the winner is one of them. Fast libraries go further and try only a few hundred <strong>histogram bin edges</strong> instead of every midpoint; see <a class="xref" data-note="ml_lightgbm">LightGBM</a>.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a numeric feature x_j with sorted distinct values v₁ &lt; v₂ &lt; … &lt; v_m in node S, the candidate splits are x_j ≤ tᵢ with tᵢ = (vᵢ + vᵢ₊₁) / 2, for i = 1…m−1. The chosen split maximises the impurity decrease over all features j and all candidates tᵢ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trees do not care about the <em>scale</em> of a number, only its <em>order</em>. Standardising, log-transforming or any other monotonic change leaves the tree's splits (and predictions) the same; only the threshold values printed change. So scaling is wasted work for trees (but harmless). A non-monotonic change, like taking x², does change the tree.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Numbers have a natural order, so "x ≤ t" makes sense. A category like city (Delhi, Mumbai, Pune, Chennai) has no order. How does a binary tree split it?</div>

  <h2 id="dt-cat"><span class="num">10</span>Categorical Features in CART</h2>
  <h3>All binary groupings</h3>
  <p>A CART split on a category sends some values left and the rest right. With k values there are 2^(k−1) − 1 different groupings (each value goes left or right: 2^k ways; divide by 2 because swapping left and right is the same split; subtract the useless "all on one side"). For k = 4 that is 7, for k = 10 it is 511, for k = 30 it is over 500 million. Trying all of them quickly becomes impossible.</p>
  <h3>The shortcut for two classes (Breiman's sorting trick)</h3>
  <p>For a two-class target (or a regression target), a theorem in the CART book (Breiman et al., 1984) saves the day: <strong>sort the categories by their share of class 1 (or by mean target), then the best grouping is one of the k − 1 "prefix" splits of that sorted list</strong>. It turns the category into an ordered number, and then it is just the numeric case. Let us check it by brute force.</p>
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
  <div class="bridge"><b>What's still missing?</b> So far every target was a class. What if the target is a number, like salary or house price? There are no classes to count, so entropy and Gini cannot be used.</div>

  <h2 id="dt-reg"><span class="num">11</span>Regression Trees</h2>
  <h3>Plain words</h3>
  <p>For a numeric target, "pure" means "all the numbers in the box are close to each other". The natural measure of spread is the <strong>variance</strong>: the average squared distance from the mean (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>). A regression tree chooses the split that most reduces the size-weighted variance of the children, and each leaf predicts the <strong>mean</strong> of its training rows.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Node impurity for regression: MSE(S) = (1/|S|) Σ_{i∈S} (yᵢ − ȳ_S)², which is the variance of y in S. <strong>Variance reduction</strong> = MSE(S) − (|S_L|/|S|) MSE(S_L) − (|S_R|/|S|) MSE(S_R). Leaf prediction ĉ = ȳ (the mean), because the mean is the constant that minimises squared error.</p>
  </div>
  <h3>Worked by hand: 6 employees</h3>
  <table class="tbl">
    <tr><th>Years of experience</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><th>Salary (lakh / year)</th><td>4</td><td>5</td><td>6</td><td>14</td><td>16</td><td>18</td></tr>
  </table>
  <p><strong>Parent.</strong> Mean = 63 / 6 = 10.5. Deviations −6.5, −5.5, −4.5, 3.5, 5.5, 7.5; squares 42.25, 30.25, 20.25, 12.25, 30.25, 56.25; sum 191.5; MSE = 191.5 / 6 = <strong>31.917</strong>.</p>
  <p><strong>Split at 3.5.</strong> Left {4, 5, 6}: mean 5, squared deviations 1 + 0 + 1 = 2, MSE 2/3 = 0.667. Right {14, 16, 18}: mean 16, squares 4 + 0 + 4 = 8, MSE 8/3 = 2.667. Weighted: 0.5 × 0.667 + 0.5 × 2.667 = <strong>1.667</strong>. Reduction = 31.917 − 1.667 = <strong>30.25</strong>.</p>
  <p><strong>Split at 2.5.</strong> Left {4, 5}: mean 4.5, MSE 0.25. Right {6, 14, 16, 18}: mean 13.5, squares 56.25 + 0.25 + 6.25 + 20.25 = 83, MSE 20.75. Weighted (2/6)(0.25) + (4/6)(20.75) = 13.917. Reduction 18.0, much worse.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
x = np.array([1, 2, 3, 4, 5, 6])              # years of experience
y = np.array([4, 5, 6, 14, 16, 18.])          # salary, lakh per year
def mse(v): return ((v - v.mean()) ** 2).mean() if len(v) else 0.0
print(f"parent: mean {y.mean():.2f}  MSE {mse(y):.3f}")
for i in range(1, len(x)):
    thr = (x[i - 1] + x[i]) / 2
    L, R = y[:i], y[i:]
    w = len(L) / len(y) * mse(L) + len(R) / len(y) * mse(R)
    print(f"x &lt;= {thr}: left mean {L.mean():5.2f} MSE {mse(L):6.3f} | right mean {R.mean():5.2f}"
          f" MSE {mse(R):6.3f} | weighted {w:6.3f}  reduction {mse(y) - w:6.3f}")
t = DecisionTreeRegressor(max_depth=1).fit(x.reshape(-1, 1), y)
print(export_text(t, feature_names=["years"]))
print("predict 2.5, 5.5 and 30 years:", t.predict([[2.5], [5.5], [30]]))</div>
  <div class="fx" data-lang="text">parent: mean 10.50  MSE 31.917
x &lt;= 1.5: left mean  4.00 MSE  0.000 | right mean 11.80 MSE 28.160 | weighted 23.467  reduction  8.450
x &lt;= 2.5: left mean  4.50 MSE  0.250 | right mean 13.50 MSE 20.750 | weighted 13.917  reduction 18.000
x &lt;= 3.5: left mean  5.00 MSE  0.667 | right mean 16.00 MSE  2.667 | weighted  1.667  reduction 30.250
x &lt;= 4.5: left mean  7.25 MSE 15.688 | right mean 17.00 MSE  1.000 | weighted 10.792  reduction 21.125
x &lt;= 5.5: left mean  9.00 MSE 24.800 | right mean 18.00 MSE  0.000 | weighted 20.667  reduction 11.250
|--- years &lt;= 3.50
|   |--- value: [5.00]
|--- years &gt;  3.50
|   |--- value: [16.00]

predict 2.5, 5.5 and 30 years: [ 5. 16. 16.]</div>
  <p>All five candidates are scored; 3.5 wins with reduction 30.25, and sklearn's depth-1 tree uses the same threshold with leaf values 5.0 and 16.0, the two means. The last line shows a key limit: 30 years of experience is far outside the data, yet the prediction is 16, the same as for 5 years. <strong>A regression tree cannot extrapolate</strong>: its output is always one of its leaf means, so it is a flat step function and never goes beyond the largest training target.</p>
  <figure class="viz"><svg viewBox="0 0 560 250" width="560">
<line x1="50" y1="220" x2="530" y2="220" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="220" stroke="currentColor"/>
<text x="42" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="42" y="124" text-anchor="end" class="tm" font-size="11">10</text><text x="42" y="44" text-anchor="end" class="tm" font-size="11">18</text>
<text x="80" y="236" text-anchor="middle" class="tm" font-size="11">1</text><text x="160" y="236" text-anchor="middle" class="tm" font-size="11">2</text><text x="240" y="236" text-anchor="middle" class="tm" font-size="11">3</text><text x="320" y="236" text-anchor="middle" class="tm" font-size="11">4</text><text x="400" y="236" text-anchor="middle" class="tm" font-size="11">5</text><text x="480" y="236" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="50" y1="115" x2="530" y2="115" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="525" y="110" text-anchor="end" class="tm" font-size="11">parent mean 10.5</text>
<polyline points="50,170 280,170 280,60 530,60" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="80" cy="180" r="5" class="fr sr"/><circle cx="160" cy="170" r="5" class="fr sr"/><circle cx="240" cy="160" r="5" class="fr sr"/><circle cx="320" cy="80" r="5" class="fr sr"/><circle cx="400" cy="60" r="5" class="fr sr"/><circle cx="480" cy="40" r="5" class="fr sr"/>
<text x="120" y="160" class="tb" font-size="11.5">leaf mean 5</text><text x="360" y="52" class="tb" font-size="11.5">leaf mean 16</text>
<text x="284" y="140" class="tm" font-size="11">x ≤ 3.5</text>
</svg><figcaption>A depth-1 regression tree is a step: one constant on each side of the threshold. Deeper trees make more, smaller steps, but always flat ones.</figcaption></figure>
  <h3>Other regression criteria: MAE gives the median</h3>
  <p>With <code>criterion="absolute_error"</code> the tree minimises the sum of |y − c| and the best constant in a leaf is the <strong>median</strong>, not the mean. That makes leaves robust to outliers.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
X = np.zeros((4, 1)); y = np.array([4, 5, 6, 40.])     # one leaf, one outlier (a CEO's salary)
for crit in ["squared_error", "absolute_error"]:
    t = DecisionTreeRegressor(criterion=crit).fit(X, y)
    print(f"{crit:15s} leaf value = {t.predict([[0]])[0]}")
print("mean", y.mean(), " median", np.median(y))
for c in [5.5, 13.75]:
    print(f"constant {c:5}: total |error| {np.abs(y - c).sum():6.2f}   total squared error {((y - c)**2).sum():7.2f}")</div>
  <div class="fx" data-lang="text">squared_error   leaf value = 13.75
absolute_error  leaf value = 5.5
mean 13.75  median 5.5
constant   5.5: total |error|  37.00   total squared error 1193.00
constant 13.75: total |error|  52.50   total squared error  920.75</div>
  <p>One leaf holds salaries 4, 5, 6 and an outlier 40. Squared error picks the mean 13.75, which is far from every real employee. Absolute error picks the median 5.5. The last two lines confirm each choice is optimal for its own loss: 5.5 has the smaller total absolute error (37 vs 52.5), 13.75 has the smaller total squared error (920.75 vs 1193).</p>
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
  <div class="bridge"><b>What's still missing?</b> We now know how to grow a tree on any kind of column and target. Left alone, the growing loop never stops until every leaf is pure. On real, noisy data that is a disaster.</div>

  <h2 id="dt-overfit"><span class="num">12</span>Overfitting and Instability</h2>
  <h3>The dataset for the big experiments</h3>
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
  <p>Why so fragile? The greedy search is <strong>hierarchical</strong>: an error or a small change at the top propagates to every node below. And two candidate splits often have nearly equal gain (like t = 37.5 vs 55 in section 09, 0.185 vs 0.178); a few rows more or less flips the winner, and with it the whole subtree.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Variance</strong> of a learning method: how much its predictions change when it is trained on a different sample from the same population. <strong>Bias</strong>: the error that remains even when averaged over many training samples. A deep tree has <strong>low bias, high variance</strong>; a stump has <strong>high bias, low variance</strong>. Expected squared error = bias² + variance + irreducible noise (see <a class="xref" data-note="ml_core">Core Concepts</a>).</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>High variance is bad for one tree but it is exactly what makes trees great team players: their mistakes are partly random, and random mistakes cancel in a vote. That single observation is the starting point of <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>, <a class="xref" data-note="ml_bagging">Bagging</a> and <a class="xref" data-note="ml_rf">Random Forest</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not present a single tree's top split as "the main driver" of a business outcome. A slightly different sample moves the threshold and reshuffles every question below. Use stable importance methods from <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We cannot fix variance inside a single tree (that is what ensembles are for), but we can stop it from memorising. The first family of tools stops growth early.</div>

  <h2 id="dt-pre"><span class="num">13</span>Stopping Rules (Pre-Pruning)</h2>
  <p><strong>Pre-pruning</strong> (early stopping) puts limits on growth, so a node becomes a leaf even if it is not pure. It is cheap (the tree never grows the extra nodes) and is what you will do most of the time.</p>
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
  <div class="bridge"><b>What's still missing?</b> Stopping rules guess in advance which splits will not pay off. The more principled route is to grow the full tree, then cut back the branches that do not earn their place.</div>

  <h2 id="dt-post"><span class="num">14</span>Post-Pruning</h2>
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
  <h3>Worked by hand: the weakest-link sequence</h3>
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
  <p>sklearn measures R(t) with the node's impurity weighted by its share of rows, R(t) = (n_t / N) · Gini(t), not with error counts. Everything else is identical. Here is a check on the 9-customer bill data from section 09: compute g(t) from the fitted tree's internals and compare with <code>cost_complexity_pruning_path</code>.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
charge = np.array([[60], [20], [90], [35], [40], [25], [75], [50], [95]])
churn  = np.array([ 1,    0,    1,    0,    1,    0,    1,    0,    1])
clf = DecisionTreeClassifier(random_state=0).fit(charge, churn)
print(export_text(clf, feature_names=["charge"]))
s = clf.tree_
N = s.weighted_n_node_samples[0]
R = s.impurity * s.weighted_n_node_samples / N          # sklearn's R(t) = (n_t / N) * Gini(t)
def leaves(i):
    l, r = s.children_left[i], s.children_right[i]
    return [i] if l == -1 else leaves(l) + leaves(r)
for i in range(s.node_count):
    if s.children_left[i] != -1:
        L = leaves(i)
        g = (R[i] - R[L].sum()) / (len(L) - 1)
        print(f"node {i}: R(t)={R[i]:.4f}  R(T_t)={R[L].sum():.4f}  leaves {len(L)}  g(t)={g:.4f}")
print("sklearn path alphas:", np.round(clf.cost_complexity_pruning_path(charge, churn).ccp_alphas, 4))</div>
  <div class="fx" data-lang="text">|--- charge &lt;= 55.00
|   |--- charge &lt;= 37.50
|   |   |--- class: 0
|   |--- charge &gt;  37.50
|   |   |--- charge &lt;= 45.00
|   |   |   |--- class: 1
|   |   |--- charge &gt;  45.00
|   |   |   |--- class: 0
|--- charge &gt;  55.00
|   |--- class: 1

node 0: R(t)=0.4938  R(T_t)=0.0000  leaves 4  g(t)=0.1646
node 1: R(t)=0.1778  R(T_t)=0.0000  leaves 3  g(t)=0.0889
node 3: R(t)=0.1111  R(T_t)=0.0000  leaves 2  g(t)=0.1111
sklearn path alphas: [0.     0.0889 0.316 ]</div>
  <p>Node 1 (the "charge ≤ 55" side) has g = 0.0889, smaller than node 3's 0.1111, so the whole left branch, including node 3, is pruned first, at α = 0.0889, exactly sklearn's second alpha. After that the root's branch has leaves node 1 (R = 0.1778) and node 6 (R = 0), so g(root) = (0.4938 − 0.1778) / 1 = 0.316, sklearn's third alpha. Notice the lesson: a parent can be the weakest link before its own child; you must recompute g after every prune.</p>
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
  <div class="bridge"><b>What's still missing?</b> Real tables have holes: customers who did not fill in their income, sensors that dropped a reading. Our split formulas assumed every value is known.</div>

  <h2 id="dt-missing"><span class="num">15</span>Missing Values</h2>
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
  <p><strong>Worked.</strong> The primary split is "bill ≤ 55". Which split on <code>tenure</code> (months with the company) best mimics it?</p>
  <table class="tbl">
    <tr><th>bill</th><td>20</td><td>25</td><td>35</td><td>40</td><td>50</td><td>60</td><td>75</td><td>90</td><td>95</td><td>30</td></tr>
    <tr><th>tenure</th><td>48</td><td>36</td><td>40</td><td>30</td><td>12</td><td>14</td><td>6</td><td>3</td><td>8</td><td>24</td></tr>
    <tr><th>primary: left?</th><td>L</td><td>L</td><td>L</td><td>L</td><td>L</td><td>R</td><td>R</td><td>R</td><td>R</td><td>L</td></tr>
    <tr><th>"tenure &gt; 10": left?</th><td>L</td><td>L</td><td>L</td><td>L</td><td>L</td><td><strong>L ✗</strong></td><td>R</td><td>R</td><td>R</td><td>L</td></tr>
  </table>
  <p>"tenure &gt; 10" agrees with the primary on 9 of 10 rows (90%). The fallback "send everyone to the bigger side" agrees on only 60%. A surrogate is kept only if it beats that baseline. Long-tenure customers tend to be on cheap plans here, so tenure carries information about the missing bill.</p>
  <div class="fx" data-lang="py">import numpy as np
charge = np.array([20, 25, 35, 40, 50, 60, 75, 90, 95, 30])
tenure = np.array([48, 36, 40, 30, 12, 14,  6,  3,  8, 24])    # months with the company
primary_left = charge &lt;= 55                                  # the split the tree chose
print("primary goes left:", primary_left.astype(int).tolist())
baseline = max(primary_left.mean(), 1 - primary_left.mean())  # "send everyone to the bigger side"
print(f"majority-side baseline agreement: {baseline:.0%}")
vals = np.sort(np.unique(tenure))
for thr in (vals[:-1] + vals[1:]) / 2:
    for name, go_left in [(f"tenure &gt;  {thr:4.1f}", tenure &gt; thr), (f"tenure &lt;= {thr:4.1f}", tenure &lt;= thr)]:
        agree = np.mean(go_left == primary_left)
        if agree &gt;= 0.8:
            print(f"surrogate '{name}' agrees on {agree:.0%} of rows")</div>
  <div class="fx" data-lang="text">primary goes left: [1, 1, 1, 1, 1, 0, 0, 0, 0, 1]
majority-side baseline agreement: 60%
surrogate 'tenure &gt;   7.0' agrees on 80% of rows
surrogate 'tenure &gt;  10.0' agrees on 90% of rows
surrogate 'tenure &gt;  13.0' agrees on 80% of rows
surrogate 'tenure &gt;  19.0' agrees on 90% of rows
surrogate 'tenure &gt;  27.0' agrees on 80% of rows</div>
  <p>Two thresholds tie at 90%; CART would keep the first as surrogate 1 and the other as a lower-ranked backup. Surrogates are used by R's <code>rpart</code>; sklearn does not implement them. A bonus: surrogate agreement shows which columns are near-substitutes, which <code>rpart</code> reports as part of variable importance.</p>
  <h3>sklearn: learn a direction for NaN</h3>
  <p>Since version 1.3, sklearn's trees (with the default <code>splitter="best"</code>) accept <code>NaN</code>. At each split, the tree evaluates the threshold twice: once with all NaN rows sent left and once sent right, and keeps the better. If no NaN reached that node during training, NaN rows at prediction time go to the child that had more training rows.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
# income in lakh; NaN = the customer refused to say. Refusers behave like low earners here.
income = np.array([[3], [4], [5], [np.nan], [np.nan], [12], [15], [18], [20], [np.nan]])
defaults = np.array([1,   1,   1,   1,        1,        0,    0,    0,    0,    1])
t = DecisionTreeClassifier(random_state=0).fit(income, defaults)
print(export_text(t, feature_names=["income"]))
print("root threshold:", t.tree_.threshold[0], " NaN goes left?", bool(t.tree_.missing_go_to_left[0]))
print("predict [NaN], [4], [16]:", t.predict([[np.nan], [4], [16]]))
# no NaN seen during training -&gt; NaN at predict time follows the child with more training rows
X2 = np.array([[3], [4], [5], [6], [12], [15]]); y2 = np.array([1, 1, 1, 1, 0, 0])
t2 = DecisionTreeClassifier(random_state=0).fit(X2, y2)
print("trained without NaN, predict [NaN]:", t2.predict([[np.nan]]))</div>
  <div class="fx" data-lang="text">|--- income &lt;= 8.50
|   |--- class: 1
|--- income &gt;  8.50
|   |--- class: 0

root threshold: 8.5  NaN goes left? True
predict [NaN], [4], [16]: [1 1 0]
trained without NaN, predict [NaN]: [1]</div>
  <p>The customers who refused to state their income all defaulted, so the tree learnt "NaN goes left" with the low earners; a new refuser is predicted to default. Missingness itself became a signal. In the second model no NaN was seen in training, so NaN follows the bigger child (4 rows on the left), giving class 1.</p>
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
  <div class="bridge"><b>What's still missing?</b> We know how a tree splits. What does the resulting model look like in the feature space, and what kinds of patterns does that shape struggle with?</div>

  <h2 id="dt-geom"><span class="num">16</span>Decision Boundaries: Boxes and Staircases</h2>
  <p>Every split is "one column ≤ one number". In a plot of two features, that is a straight cut parallel to an axis. Repeated cuts chop the plane into <strong>axis-aligned rectangles</strong> (boxes in higher dimensions), and each leaf owns one box.</p>
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
  <div class="bridge"><b>What's still missing?</b> We have seen what a tree computes. How long does it take, and how does that grow with more rows and columns? This decides whether a single tree, or 1,000 of them in a forest, is practical.</div>

  <h2 id="dt-cost"><span class="num">17</span>Time and Memory Cost</h2>
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
  <p>One comparison per level: O(depth), about O(log n) for a balanced tree and O(n) in the worst case. It does not depend on d at all; a tree ignores columns it never asks about.</p>
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
  <div class="bridge"><b>What's still missing?</b> Managers ask "which columns matter most?". A tree records how much each split helped, which gives a quick answer, with a catch.</div>

  <h2 id="dt-mdi"><span class="num">18</span>Feature Importance from the Tree (MDI)</h2>
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
X = pd.get_dummies(df.drop(columns="Play")).astype(int); y = df["Play"]
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
  <div class="bridge"><b>What's still missing?</b> We have every concept. Now the practical toolbox: every parameter of sklearn's trees, and how to print, draw and inspect a fitted tree.</div>

  <h2 id="dt-sklearn"><span class="num">19</span>scikit-learn in Practice</h2>
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
X = pd.get_dummies(df.drop(columns="Play")).astype(int)   # one 0/1 column per category
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
  <div class="bridge"><b>What's still missing?</b> Using a library is not the same as understanding it. The best test of understanding is to write the algorithm yourself and get the same answer.</div>

  <h2 id="dt-scratch"><span class="num">20</span>From Scratch: ID3 and CART</h2>
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

X, y = df.drop(columns="Play"), df["Play"]
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
  <div class="bridge"><b>What's still missing?</b> With the full picture in hand, when should you actually use a single tree, and when should you reach for something else?</div>

  <h2 id="dt-pros"><span class="num">21</span>Strengths and Weaknesses</h2>
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

  <h2 id="dt-compare"><span class="num">22</span>Comparisons</h2>
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

  <h2 id="dt-traps"><span class="num">23</span>Common Mistakes</h2>
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

  <h2 id="dt-qa"><span class="num">24</span>Questions &amp; Answers</h2>
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
</main>
`
});
