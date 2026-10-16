// ml/ml_trees.js — Tree-Based Models
Object.assign(TOPIC_CONTENT, {
  "ml_trees": `<main>
  <h1>Tree-Based Models</h1>
  <p class="lead">The strongest family of classic ML for table data (rows and columns, like an Excel sheet). A decision tree asks yes/no questions. A random forest averages hundreds of trees. Gradient boosting (XGBoost, LightGBM, CatBoost) builds trees one after another, each fixing the last one's mistakes. Every number below comes from real runs on one 20,000-row dataset.</p>

  <h2 id="mt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tree-Based Models</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Decision tree (CART)</div>
        <ul>
          <li><b>How</b> — greedily pick the (feature, threshold) that most reduces impurity; recurse</li>
          <li><b>Gini</b> — 1 − Σpᵢ²; 0 = pure, 0.5 = 50/50 (binary)</li>
          <li><b>Entropy</b> — −Σpᵢlog₂pᵢ; info gain = parent − weighted children</li>
          <li>Worked: [4/6] → [4/1] + [0/5]: Gini 0.48 → 0.16, gain 0.32</li>
          <li><b>Regression trees</b> — split to minimise MSE; leaf = mean</li>
          <li>No scaling needed; handles interactions; axis-aligned boundaries</li>
          <li>💡 Doctor's checklist: ask the question that rules out most first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Overfitting &amp; pruning</div>
        <ul>
          <li><b>Unlimited tree</b> — 1413 leaves, train 1.000, val 0.773</li>
          <li><b>Pre-pruning</b> — max_depth, min_samples_leaf, min_impurity_decrease</li>
          <li><b>Post-pruning</b> — cost-complexity: Error + α·|leaves|; ccp_alpha via CV</li>
          <li>Best: depth 10 → val 0.807; ccp_alpha 3e-4 → val 0.815 (280 leaves)</li>
          <li>⚠ Single trees are unstable: small data change → different tree</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Random forest</div>
        <ul>
          <li><b>Bagging</b> — each tree on a bootstrap sample (~63% unique rows)</li>
          <li><b>Feature subsampling</b> — √d features tried per split → decorrelates trees</li>
          <li><b>Var</b> = ρσ² + (1−ρ)σ²/n; more trees kill the 2nd term, low ρ lowers the floor</li>
          <li>1 tree val 0.770 → 100 trees 0.880; parallel, little tuning</li>
          <li><b>OOB</b> — free validation on the ~37% left out; sanity check only</li>
          <li>💡 Average of 100 independent laddoo-count guesses beats one guess</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Feature importance</div>
        <ul>
          <li><b>Impurity (MDI)</b> — total impurity drop per feature; free, on train</li>
          <li>⚠ <b>Bias</b> — favours high-cardinality: noise with 20k values 0.036 vs binary noise 0.005</li>
          <li><b>Permutation</b> — shuffle a column on validation, measure score drop; noise ≈ 0</li>
          <li>⚠ Correlated features share/split importance under both</li>
          <li><b>SHAP</b> — per-prediction, signed, additive; for explanations</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Boosting</div>
        <ul>
          <li><b>Idea</b> — F_m = F_{m−1} + η·h_m; each small tree fits current residuals</li>
          <li><b>Gradient</b> — h fits −∂L/∂F; for MSE that's exactly y − F</li>
          <li>Hand demo: MSE 2450 → 1005 → 411 → 233 with 3 stumps</li>
          <li><b>Bagging vs boosting</b> — parallel, cuts variance vs sequential, cuts bias</li>
          <li>⚠ Fits noise if run too long → early stopping is mandatory</li>
          <li>💡 ODI chase: each pair works only on the runs still needed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">XGBoost / LightGBM / CatBoost</div>
        <ul>
          <li><b>XGBoost</b> — 2nd-order (gradient + Hessian), leaf weight −G/(H+λ), level-wise</li>
          <li><b>LightGBM</b> — histogram bins, leaf-wise growth, GOSS, EFB; fastest</li>
          <li><b>CatBoost</b> — ordered boosting + ordered target stats for categoricals; symmetric trees; good defaults</li>
          <li>Here: all ≈ 0.87 acc / 0.935 AUC in 2–4 s; RF 0.877 too</li>
          <li>⚠ Leaf-wise overfits small data: cap num_leaves, raise min_child_samples</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tuning &amp; early stopping</div>
        <ul>
          <li><b>Order</b> — fix lr ≈ 0.05 + early stopping → depth/num_leaves → min_child → subsample/colsample → reg → lower lr</li>
          <li><b>lr vs trees</b> — 0.3: 68 trees, 0.874→0.851; 0.03: 1154 trees, 0.874</li>
          <li><b>Early stopping</b> — val loss min at round 204 (0.308); at 3000 it's 0.752</li>
          <li><b>Imbalance</b> — scale_pos_weight = neg/pos, or tune threshold</li>
          <li><b>Monotone constraints</b> — force +/− direction (price, risk)</li>
          <li>Use Optuna / random search, not full grid</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mt-split"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How a Tree Splits</span><span class="rm-sub">Gini vs entropy, worked split</span></div></div>
      <div class="rm-item rm-done" data-target="mt-prune"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Overfitting &amp; Pruning</span><span class="rm-sub">Depth, ccp_alpha</span></div></div>
      <div class="rm-item rm-done" data-target="mt-rf"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Random Forest</span><span class="rm-sub">Bagging + feature subsampling</span></div></div>
      <div class="rm-item rm-done" data-target="mt-imp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Feature Importance</span><span class="rm-sub">The cardinality bias trap</span></div></div>
      <div class="rm-item rm-done" data-target="mt-boost"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Boosting Intuition</span><span class="rm-sub">Fit the residuals, repeat</span></div></div>
      <div class="rm-item rm-done" data-target="mt-gbm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">XGBoost, LightGBM, CatBoost</span><span class="rm-sub">What each adds, real runs</span></div></div>
      <div class="rm-item rm-done" data-target="mt-tune"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Hyperparameters &amp; Tuning</span><span class="rm-sub">What to turn, in what order</span></div></div>
      <div class="rm-item rm-done" data-target="mt-es"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Early Stopping</span><span class="rm-sub">Stop when validation turns</span></div></div>
      <div class="rm-item rm-done" data-target="mt-prod"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Production Concerns</span><span class="rm-sub">Imbalance, monotone, custom loss</span></div></div>
      <div class="rm-item rm-done" data-target="mt-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mt-split"><span class="num">01</span>How a Tree Splits (CART)</h2>
  <p>A decision tree asks one yes/no question at a time until it can give an answer. Why use it: easy to read, no scaling needed, and it handles curved patterns and feature combinations on its own. How: try every feature and every cut-off, keep the question that leaves the "purest" groups, repeat inside each group. CART is the standard algorithm for this.</p>
  <figure class="viz"><svg viewBox="0 0 560 210" width="560">
<defs><marker id="mt-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="40" y="10" width="270" height="50" rx="6" class="fs" stroke="currentColor"/>
<text x="175" y="31" text-anchor="middle" font-size="13">10 customers: 4 churn / 6 stay</text>
<text x="175" y="50" text-anchor="middle" class="tm" font-size="12">Gini 0.480 · contract = monthly?</text>
<line x1="150" y1="60" x2="95" y2="120" stroke="currentColor" marker-end="url(#mt-ah)"/><line x1="210" y1="60" x2="265" y2="120" stroke="currentColor" marker-end="url(#mt-ah)"/>
<text x="105" y="88" class="tm" font-size="12">yes</text><text x="245" y="88" class="tm" font-size="12">no</text>
<rect x="10" y="122" width="150" height="48" rx="6" class="fr sr" fill-opacity="0.25"/>
<text x="85" y="142" text-anchor="middle" font-size="13">4 churn / 1 stay</text><text x="85" y="161" text-anchor="middle" class="tm" font-size="12">Gini 0.320</text>
<rect x="200" y="122" width="150" height="48" rx="6" class="fg sg" fill-opacity="0.25"/>
<text x="275" y="142" text-anchor="middle" font-size="13">0 churn / 5 stay</text><text x="275" y="161" text-anchor="middle" class="tm" font-size="12">Gini 0 (pure)</text>
<text x="340" y="30" font-size="12">weighted child Gini</text>
<text x="340" y="50" font-size="12">= 0.5·0.32 + 0.5·0 = 0.16</text>
<text x="340" y="74" class="tg" font-size="12">gain = 0.48 − 0.16 = 0.32</text>
<text x="370" y="110" class="tm" font-size="12">rival split "age &lt; 30":</text>
<text x="370" y="128" class="tm" font-size="12">[2/2] + [2/4] → gain 0.013</text>
<text x="370" y="160" class="tb" font-size="13">tree picks "contract"</text>
<text x="10" y="200" class="tm" font-size="12">Try every feature × cut-off, keep the biggest drop, repeat in each child.</text>
</svg><figcaption>One split, worked by hand: the question that leaves the purest children wins.</figcaption></figure>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>Gini = 1 − Σpᵢ²</strong> (chance two random picks disagree). <strong>Entropy = −Σpᵢlog₂pᵢ</strong>. Gain = impurity(parent) − Σ (nₖ/n)·impurity(childₖ).</p>
  </div>
  <div class="fx" data-lang="py">def gini(c): p = np.array(c)/sum(c); return 1 - (p**2).sum()
def ent(c):  p = np.array(c)/sum(c); p = p[p &gt; 0]; return -(p*np.log2(p)).sum()
parent = [4, 6]                                         # [churn, stay]
splits = {"contract = monthly": ([4, 1], [0, 5]), "age &lt; 30": ([2, 2], [2, 4])}
print(f"parent  gini {gini(parent):.3f}  entropy {ent(parent):.3f}")
for n, (l, r) in splits.items():
    wl, wr = sum(l)/10, sum(r)/10                       # share of rows in each child
    g = wl*gini(l) + wr*gini(r); e = wl*ent(l) + wr*ent(r)
    print(f"{n:20s} Gini gain {gini(parent)-g:.3f} | info gain {ent(parent)-e:.3f}")</div>
  <div class="fx" data-lang="text">parent  gini 0.480  entropy 0.971
contract = monthly   Gini gain 0.320 | info gain 0.610
age &lt; 30             Gini gain 0.013 | info gain 0.020</div>
  <p><strong>Impurity</strong> means how mixed a group is. Gini and entropy are two ways to measure it, and they almost always pick the same split. Gini (sklearn default) has no log, so it is a bit faster. Regression trees do the same search but reduce MSE, and each leaf predicts the average.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's checklist: "Fever? → Cough? → Get a test." A good doctor asks first the question that rules out the most diseases. The tree does the same with features.</p>
  </div>

  <h2 id="mt-prune"><span class="num">02</span>Overfitting &amp; Pruning</h2>
  <figure class="viz"><svg viewBox="0 0 560 235" width="560">
<line x1="50" y1="200" x2="530" y2="200" stroke="currentColor"/><line x1="50" y1="15" x2="50" y2="200" stroke="currentColor"/>
<text x="44" y="184" text-anchor="end" class="tm" font-size="11">0.6</text><text x="44" y="104" text-anchor="end" class="tm" font-size="11">0.8</text><text x="44" y="24" text-anchor="end" class="tm" font-size="11">1.0</text>
<line x1="50" y1="100" x2="530" y2="100" stroke="currentColor" stroke-opacity="0.15"/>
<polyline points="80,180 180,146 280,108 380,70 480,20" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="80,181 180,144 280,113 380,97 480,111" fill="none" class="sr" stroke-width="2.5"/>
<circle cx="380" cy="97" r="5" class="fg sg"/>
<text x="80" y="217" text-anchor="middle" class="tm" font-size="11">1</text><text x="180" y="217" text-anchor="middle" class="tm" font-size="11">3</text><text x="280" y="217" text-anchor="middle" class="tm" font-size="11">6</text><text x="380" y="217" text-anchor="middle" class="tm" font-size="11">10</text><text x="480" y="217" text-anchor="middle" class="tm" font-size="11">None</text>
<text x="290" y="232" text-anchor="middle" class="tm" font-size="12">max_depth</text>
<text x="398" y="40" text-anchor="end" class="tb" font-size="12">train → 1.000</text><text x="425" y="150" class="tr" font-size="12">validation 0.773</text>
<text x="380" y="132" text-anchor="middle" class="tg" font-size="12">sweet spot 0.807</text>
</svg><figcaption>Deeper trees keep improving on training data and start losing on validation after depth ~10.</figcaption></figure>
  <p>With no limits, a tree keeps splitting until every leaf is pure. It remembers the training data perfectly but does badly on new data. <strong>Pruning</strong> means limiting or cutting back the tree. Two ways:</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rule like "a customer named Ravi from Pune who called on a Tuesday will churn" fits one person, not a pattern. Deep branches make such rules; pruning removes them.</p>
  </div>
  <div class="cards">
    <div><b>Pre-pruning</b><p>Stop early: <code>max_depth</code>, <code>min_samples_leaf</code>, <code>min_impurity_decrease</code>.</p><small>Cheap, the usual choice</small></div>
    <div><b>Post-pruning</b><p>Grow fully, then cut subtrees that don't pay for themselves: minimise Error + α·|leaves|.</p><small><code>ccp_alpha</code>, choose α by CV</small></div>
  </div>
  <div class="fx" data-lang="py">for d in [1, 3, 6, 10, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr)
    print(f"max_depth={str(d):5s} leaves={t.get_n_leaves():5d}  train {t.score(Xtr,ytr):.3f}  val {t.score(Xva,yva):.3f}")
for a in [0, 1e-4, 3e-4, 1e-3, 3e-3]:
    t = DecisionTreeClassifier(ccp_alpha=a, random_state=0).fit(Xtr, ytr)   # same print</div>
  <div class="fx" data-lang="text">max_depth=1     leaves=    2  train 0.601  val 0.597
max_depth=3     leaves=    8  train 0.684  val 0.690
max_depth=6     leaves=   61  train 0.781  val 0.767
max_depth=10    leaves=  399  train 0.876  val 0.807
max_depth=None  leaves= 1413  train 1.000  val 0.773
ccp_alpha=0      leaves= 1413  train 1.000  val 0.773
ccp_alpha=0.0001 leaves= 1142  train 0.988  val 0.782
ccp_alpha=0.0003 leaves=  280  train 0.891  val 0.815
ccp_alpha=0.001  leaves=   58  train 0.804  val 0.788
ccp_alpha=0.003  leaves=   26  train 0.770  val 0.765</div>
  <div class="callout def"><span class="label">The dataset</span>
    <p><code>make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2, n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)</code> + two pure-noise columns (<code>row_noise</code>: 20,000 unique values; <code>coin_noise</code>: 0/1). Split 12,000 train / 3,000 val / 5,000 test. Logistic regression scores only 0.596: the signal is non-linear.</p>
  </div>

  <h2 id="mt-rf"><span class="num">03</span>Random Forest</h2>
  <p>A random forest trains many trees on slightly different data and averages their answers. Why: one deep tree changes a lot if the data changes a little (high variance). Averaging many different trees cancels out their individual mistakes.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<defs><marker id="mt-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="75" width="90" height="50" rx="6" class="fs" stroke="currentColor"/><text x="55" y="97" text-anchor="middle" font-size="12">training</text><text x="55" y="113" text-anchor="middle" font-size="12">data</text>
<rect x="150" y="15" width="120" height="40" rx="6" class="fb sb" fill-opacity="0.25"/><text x="210" y="39" text-anchor="middle" font-size="12">bootstrap 1</text>
<rect x="150" y="80" width="120" height="40" rx="6" class="fb sb" fill-opacity="0.25"/><text x="210" y="104" text-anchor="middle" font-size="12">bootstrap 2</text>
<rect x="150" y="145" width="120" height="40" rx="6" class="fb sb" fill-opacity="0.25"/><text x="210" y="169" text-anchor="middle" font-size="12">bootstrap …500</text>
<line x1="100" y1="90" x2="148" y2="40" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="100" y1="100" x2="148" y2="100" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="100" y1="110" x2="148" y2="160" stroke="currentColor" marker-end="url(#mt-ah2)"/>
<rect x="300" y="15" width="150" height="40" rx="6" class="ft st" fill-opacity="0.25"/><text x="375" y="32" text-anchor="middle" font-size="12">tree 1</text><text x="375" y="48" text-anchor="middle" class="tm" font-size="10">splits try {f2,f7,f9}</text>
<rect x="300" y="80" width="150" height="40" rx="6" class="ft st" fill-opacity="0.25"/><text x="375" y="97" text-anchor="middle" font-size="12">tree 2</text><text x="375" y="113" text-anchor="middle" class="tm" font-size="10">splits try {f0,f5,f8}</text>
<rect x="300" y="145" width="150" height="40" rx="6" class="ft st" fill-opacity="0.25"/><text x="375" y="162" text-anchor="middle" font-size="12">tree 500</text><text x="375" y="178" text-anchor="middle" class="tm" font-size="10">splits try {f1,f4,f5}</text>
<line x1="270" y1="35" x2="298" y2="35" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="270" y1="100" x2="298" y2="100" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="270" y1="165" x2="298" y2="165" stroke="currentColor" marker-end="url(#mt-ah2)"/>
<rect x="480" y="75" width="70" height="50" rx="6" class="fg sg" fill-opacity="0.25"/><text x="515" y="97" text-anchor="middle" font-size="12">vote /</text><text x="515" y="113" text-anchor="middle" font-size="12">average</text>
<line x1="450" y1="35" x2="478" y2="90" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="450" y1="100" x2="478" y2="100" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="450" y1="165" x2="478" y2="110" stroke="currentColor" marker-end="url(#mt-ah2)"/>
</svg><figcaption>Two sources of randomness: each tree sees different rows (bootstrap) and each split sees a random few features. Different trees make different mistakes, which cancel in the vote.</figcaption></figure>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>Var(average of n trees) = ρσ² + (1 − ρ)σ²/n</strong>. Adding trees shrinks only the second term. The floor ρσ² falls only if trees are less correlated (ρ), which is what feature subsampling buys.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ask 100 people to guess the number of laddoos in a box, and the average is usually close. But if all 100 copy one friend's guess, the average is only as good as that friend. Random rows and random features stop the trees from "copying" each other.</p>
  </div>
  <div class="fx" data-lang="py">for n, mf in [(1, None), (100, None), (100, "sqrt"), (300, "sqrt")]:
    rf = RandomForestClassifier(n_estimators=n, max_features=mf, oob_score=(n &gt; 1),
                                n_jobs=-1, random_state=0).fit(Xtr, ytr)
    ...   # print train / val / OOB accuracy and fit time</div>
  <div class="fx" data-lang="text">trees=  1 max_features=None  train 0.907  val 0.770  OOB   -    0.3s
trees=100 max_features=None  train 1.000  val 0.879  OOB 0.861  11.7s
trees=100 max_features=sqrt  train 1.000  val 0.880  OOB 0.858  4.3s
trees=300 max_features=sqrt  train 1.000  val 0.879  OOB 0.864  8.4s</div>
  <p>One tree to 100 trees: +11 points. Trying √d features per split gave the same accuracy here, 2.7× faster. It helps most when one strong feature would otherwise sit at the top of every tree. More than ~300 trees adds little. Train accuracy 1.000 is normal for a forest and is not a warning by itself.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>OOB score (each tree judged on the ~37% rows it never saw) is free, but it ignores preprocessing fitted outside the forest and can be noisy on small data. Use it as a sanity check; select models on a proper validation set or CV.</p>
  </div>

  <h2 id="mt-imp"><span class="num">04</span>Feature Importance</h2>
  <p>Feature importance tells you which columns the model leans on most. Why it matters: business teams ask "what drives churn?", and you use it to drop useless columns. There are two common ways to measure it, and they can disagree badly.</p>
  <div class="fx" data-lang="py">from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr, ytr)
perm = permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=-1)
df = pd.DataFrame({"impurity (MDI)": rf.feature_importances_,
                   "permutation (val)": perm.importances_mean}, index=Xtr.columns)</div>
  <table class="tbl out"><caption>Real output (selected rows, sorted by MDI)</caption>
    <tr><th>feature</th><th>impurity (MDI)</th><th>permutation (val)</th><th>MDI rank</th><th>perm rank</th></tr>
    <tr><td>f5 (signal)</td><td>0.139</td><td>0.193</td><td>1</td><td>1</td></tr>
    <tr><td>f8 (signal)</td><td>0.113</td><td>0.106</td><td>2</td><td>2</td></tr>
    <tr><td>f2 (signal)</td><td>0.093</td><td>0.051</td><td>6</td><td>8</td></tr>
    <tr><td>f11 (useless)</td><td>0.037</td><td>0.000</td><td>10</td><td>14</td></tr>
    <tr><td><strong>row_noise</strong> (random, 20k values)</td><td><strong>0.036</strong></td><td>0.004</td><td>11</td><td>9</td></tr>
    <tr><td><strong>coin_noise</strong> (random, 2 values)</td><td><strong>0.005</strong></td><td>0.001</td><td>14</td><td>13</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Both noise columns are random garbage. Still, MDI gives the one with 20,000 values 7× the importance of the 0/1 one. More unique values means more cut-offs to try, so more chances of a lucky split on training data. Permutation importance on validation data puts both near 0. Never report raw MDI as "what drives the model" without checking.</p>
  </div>
  <table class="tbl">
    <tr><th>Method</th><th>Measures</th><th>Watch out</th></tr>
    <tr><td>Split count / impurity (MDI, "gain")</td><td>How much training impurity a feature removed</td><td>High-cardinality bias, computed on train</td></tr>
    <tr><td>Permutation</td><td>Validation score drop when a column is shuffled</td><td>Correlated features share credit (shuffle one, the twin covers)</td></tr>
    <tr><td>SHAP (TreeExplainer)</td><td>Each feature's signed contribution to each prediction; sums to prediction − baseline</td><td>Slower; explains the model, not causality</td></tr>
  </table>

  <h2 id="mt-boost"><span class="num">05</span>Boosting Intuition</h2>
  <p>Boosting builds small trees one after another. Each new tree looks only at what the model still gets wrong (the residuals) and corrects part of it. Why: many weak, simple trees added this way become one very strong model.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<defs><marker id="mt-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="46" rx="6" class="fs" stroke="currentColor"/><text x="65" y="40" text-anchor="middle" font-size="12">F₀ = mean</text><text x="65" y="57" text-anchor="middle" class="tm" font-size="11">170 for all</text>
<rect x="150" y="20" width="110" height="46" rx="6" class="ft st" fill-opacity="0.25"/><text x="205" y="40" text-anchor="middle" font-size="12">+ 0.5·tree₁</text><text x="205" y="57" text-anchor="middle" class="tm" font-size="11">size ≤ 95?</text>
<rect x="290" y="20" width="110" height="46" rx="6" class="ft st" fill-opacity="0.25"/><text x="345" y="40" text-anchor="middle" font-size="12">+ 0.5·tree₂</text><text x="345" y="57" text-anchor="middle" class="tm" font-size="11">size ≤ 75?</text>
<rect x="430" y="20" width="110" height="46" rx="6" class="ft st" fill-opacity="0.25"/><text x="485" y="40" text-anchor="middle" font-size="12">+ 0.5·tree₃</text><text x="485" y="57" text-anchor="middle" class="tm" font-size="11">size ≤ 115?</text>
<line x1="120" y1="43" x2="148" y2="43" stroke="currentColor" marker-end="url(#mt-ah3)"/><line x1="260" y1="43" x2="288" y2="43" stroke="currentColor" marker-end="url(#mt-ah3)"/><line x1="400" y1="43" x2="428" y2="43" stroke="currentColor" marker-end="url(#mt-ah3)"/>
<text x="135" y="14" text-anchor="middle" class="tm" font-size="10">fit residuals</text><text x="275" y="14" text-anchor="middle" class="tm" font-size="10">fit residuals</text><text x="415" y="14" text-anchor="middle" class="tm" font-size="10">fit residuals</text>
<line x1="10" y1="180" x2="550" y2="180" stroke="currentColor"/>
<rect x="40" y="90" width="50" height="90" class="fr sr" fill-opacity="0.5"/><rect x="180" y="143" width="50" height="37" class="fr sr" fill-opacity="0.5"/><rect x="320" y="165" width="50" height="15" class="fr sr" fill-opacity="0.5"/><rect x="460" y="171" width="50" height="9" class="fr sr" fill-opacity="0.5"/>
<text x="65" y="86" text-anchor="middle" font-size="12">MSE 2450</text><text x="205" y="139" text-anchor="middle" font-size="12">1005</text><text x="345" y="161" text-anchor="middle" font-size="12">411</text><text x="485" y="167" text-anchor="middle" font-size="12">233</text>
<text x="280" y="197" text-anchor="middle" class="tm" font-size="11">training error after each step (8 flat prices, depth-1 trees, learning rate 0.5)</text>
</svg><figcaption>Each new small tree is trained on what the model still gets wrong; adding a shrunken copy of it chips the error down.</figcaption></figure>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>F_m(x) = F_{m−1}(x) + η · h_m(x)</strong>, where h_m is fitted to the negative gradient −∂L/∂F. For squared error that is just the residual y − F, hence "fitting residuals". Other losses (log loss, MAE, custom) give "pseudo-residuals".</p>
  </div>
  <div class="fx" data-lang="py">x = np.array([50, 60, 70, 80, 90, 100, 110, 120])[:, None]       # flat size (sq m)
y = np.array([100, 120, 130, 160, 170, 210, 220, 250], float)   # price (₹ lakh)
F = np.full(len(y), y.mean()); lr = 0.5
print("start: predict mean", y.mean(), " MSE", round(((y-F)**2).mean(), 1))
for m in range(1, 4):
    r = y - F                                                     # residuals
    t = DecisionTreeRegressor(max_depth=1).fit(x, r)              # stump on residuals
    F += lr * t.predict(x)
    print(f"tree {m}: split size &lt;= {t.tree_.threshold[0]:.0f}  leaf values "
          f"{t.tree_.value[1:,0,0].round(1)}  MSE {((y-F)**2).mean():.1f}")</div>
  <div class="fx" data-lang="text">start: predict mean 170.0  MSE 2450.0
tree 1: split size &lt;= 95  leaf values [-34.   56.7]  MSE 1005.0
tree 2: split size &lt;= 75  leaf values [-36.3  21.8]  MSE 410.9
tree 3: split size &lt;= 115  leaf values [-5.8 40.8]  MSE 232.9</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chasing 250 in an ODI. The openers make 120. The next pair works only on the 130 still needed, then the next pair on what is left. The learning rate is playing safe: take part of the remaining target each time instead of hitting out and getting bowled.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Bagging (random forest)</th><th>Boosting (GBM)</th></tr>
    <tr><td>Trees built</td><td>Independently, in parallel</td><td>Sequentially, each on the last one's errors</td></tr>
    <tr><td>Each tree</td><td>Deep, low bias, high variance</td><td>Shallow (depth 3–8), weak learner</td></tr>
    <tr><td>Mainly reduces</td><td>Variance</td><td>Bias (and variance via shrinkage, subsampling)</td></tr>
    <tr><td>Too many trees</td><td>Harmless, just slower</td><td>Overfits → needs early stopping</td></tr>
    <tr><td>Tuning effort</td><td>Low</td><td>Moderate–high</td></tr>
  </table>

  <h2 id="mt-gbm"><span class="num">06</span>XGBoost, LightGBM, CatBoost</h2>
  <p>All three are gradient boosting libraries. They use the same idea as above and add tricks for speed, regularisation and categorical columns. In practice they give similar accuracy, so knowing what each one adds matters more than picking a "winner".</p>
  <table class="tbl">
    <tr><th></th><th>XGBoost</th><th>LightGBM</th><th>CatBoost</th></tr>
    <tr><td>Key idea</td><td>2nd-order Taylor: uses gradient g and Hessian h; L1/L2 on leaf weights</td><td>Histogram bins (≤255), GOSS (keep large-gradient rows, sample small), EFB (bundle sparse features)</td><td>Ordered boosting: a row's residual uses only models trained on rows "before" it → no target leakage</td></tr>
    <tr><td>Tree growth</td><td>Level-wise (depth-first by level), <code>max_depth</code></td><td>Leaf-wise (best leaf anywhere), <code>num_leaves</code></td><td>Symmetric (oblivious) trees: same split per level</td></tr>
    <tr><td>Categoricals</td><td>Native support (<code>enable_categorical</code>) or encode</td><td>Native (<code>categorical_feature</code>)</td><td>Best-in-class: ordered target statistics</td></tr>
    <tr><td>Strength</td><td>Mature, robust, GPU, everywhere</td><td>Fastest on large data, low memory</td><td>Great defaults, many categoricals, small data</td></tr>
    <tr><td>Watch out</td><td>Slower than LightGBM on big data</td><td>Leaf-wise overfits small data</td><td>Slower training per tree</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key formula (XGBoost leaf)</span>
    <p><strong>w* = −G / (H + λ)</strong>, with G, H the sums of gradients and Hessians in the leaf. Split gain = ½[G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ)] − γ. Curvature acts like a per-leaf step size; λ and γ regularise.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 520 140" width="520">
<g stroke="currentColor"><line x1="120" y1="25" x2="70" y2="65"/><line x1="120" y1="25" x2="170" y2="65"/><line x1="70" y1="65" x2="45" y2="105"/><line x1="70" y1="65" x2="95" y2="105"/><line x1="170" y1="65" x2="145" y2="105"/><line x1="170" y1="65" x2="195" y2="105"/>
<line x1="380" y1="25" x2="330" y2="55"/><line x1="380" y1="25" x2="430" y2="55"/><line x1="430" y1="55" x2="400" y2="85"/><line x1="430" y1="55" x2="460" y2="85"/><line x1="460" y1="85" x2="440" y2="115"/><line x1="460" y1="85" x2="485" y2="115"/></g>
<g class="fb sb"><circle cx="120" cy="25" r="7"/><circle cx="70" cy="65" r="7"/><circle cx="170" cy="65" r="7"/><circle cx="45" cy="105" r="7"/><circle cx="95" cy="105" r="7"/><circle cx="145" cy="105" r="7"/><circle cx="195" cy="105" r="7"/></g>
<g class="ft st"><circle cx="380" cy="25" r="7"/><circle cx="330" cy="55" r="7"/><circle cx="430" cy="55" r="7"/><circle cx="400" cy="85" r="7"/><circle cx="460" cy="85" r="7"/><circle cx="440" cy="115" r="7"/><circle cx="485" cy="115" r="7"/></g>
<text x="120" y="134" text-anchor="middle" font-size="12">level-wise (XGBoost)</text>
<text x="400" y="134" text-anchor="middle" font-size="12">leaf-wise (LightGBM)</text>
</svg><figcaption>Same number of leaves; leaf-wise goes deep where the loss drops most. Lower loss per leaf, more overfitting risk on small data.</figcaption></figure>
  <div class="fx" data-lang="py">m = xgb.XGBClassifier(n_estimators=2000, learning_rate=0.05, max_depth=6, subsample=0.8,
                      colsample_bytree=0.8, early_stopping_rounds=50, eval_metric="logloss")
m.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False)
m = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, num_leaves=31, subsample=0.8,
                       subsample_freq=1, colsample_bytree=0.8, verbose=-1)
m.fit(Xtr, ytr, eval_set=[(Xva, yva)], callbacks=[lgb.early_stopping(50, verbose=False)])
m = CatBoostClassifier(iterations=2000, learning_rate=0.05, depth=6, early_stopping_rounds=50, verbose=False)
m.fit(Xtr, ytr, eval_set=(Xva, yva))</div>
  <table class="tbl out"><caption>Test set, 5,000 rows (xgboost 3.4.1, lightgbm 4.7.0, catboost 1.2.10, sklearn 1.9.1; 2 threads, shared machine)</caption>
    <tr><th>Model</th><th>Test acc</th><th>AUC</th><th>Trees</th><th>Fit time</th></tr>
    <tr><td>Random forest (300)</td><td>0.877</td><td>0.936</td><td>300</td><td>6.1 s</td></tr>
    <tr><td>sklearn GradientBoosting (depth 3, no ES)</td><td>0.836</td><td>0.908</td><td>300</td><td>15.6 s</td></tr>
    <tr><td>HistGradientBoosting (ES)</td><td>0.867</td><td>0.934</td><td>487</td><td>2.6 s</td></tr>
    <tr><td>XGBoost (ES)</td><td>0.872</td><td>0.935</td><td>441</td><td>2.5 s</td></tr>
    <tr><td>LightGBM (ES)</td><td>0.874</td><td>0.936</td><td>533</td><td>2.1 s</td></tr>
    <tr><td>CatBoost (ES)</td><td>0.873</td><td><strong>0.938</strong></td><td>822</td><td>4.2 s</td></tr>
    <tr><td>CatBoost, pure defaults (500 iters)</td><td>0.873</td><td>0.937</td><td>500</td><td>2.6 s</td></tr>
  </table>
  <p>The three libraries are within 0.003 AUC of each other, and the random forest ties them on this data. Histogram-based learners are about 6× faster than classic sklearn GBM. Good features and correct validation matter more than the library.</p>

  <h2 id="mt-tune"><span class="num">07</span>Hyperparameters &amp; Tuning</h2>
  <p><strong>Hyperparameters</strong> are settings you choose before training, like tree depth or learning rate. Why tune them: defaults are decent, but the right tree size and learning rate can add a few points. Tune a few knobs in a fixed order, not everything at once.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>XGBoost / LightGBM / CatBoost</th><th>Effect</th><th>Typical</th></tr>
    <tr><td>Learning rate</td><td><code>learning_rate</code></td><td>Smaller = more trees, usually better</td><td>0.01–0.1</td></tr>
    <tr><td>Number of trees</td><td><code>n_estimators</code> / <code>iterations</code></td><td>Set high; let early stopping choose</td><td>1000–5000</td></tr>
    <tr><td>Tree size</td><td><code>max_depth</code> / <code>num_leaves</code> / <code>depth</code></td><td>Interaction order, main complexity knob</td><td>depth 4–8, leaves 15–127</td></tr>
    <tr><td>Leaf size</td><td><code>min_child_weight</code> / <code>min_child_samples</code></td><td>Bigger = smoother, less overfit</td><td>5–100</td></tr>
    <tr><td>Row / column sampling</td><td><code>subsample</code>, <code>colsample_bytree</code></td><td>Randomness like RF; decorrelates trees</td><td>0.6–0.9</td></tr>
    <tr><td>Regularisation</td><td><code>reg_lambda</code>, <code>reg_alpha</code>, <code>gamma</code> / <code>l2_leaf_reg</code></td><td>Shrink leaf weights; min gain to split</td><td>0–10</td></tr>
  </table>
  <div class="flow"><span>lr 0.05 + early stopping</span><span>depth / num_leaves</span><span>min_child_*</span><span>subsample / colsample</span><span>reg_lambda / alpha</span><span>lower lr, retrain</span></div>
  <div class="fx" data-lang="py">for lr in [0.3, 0.1, 0.03]:
    m = lgb.LGBMClassifier(n_estimators=5000, learning_rate=lr, num_leaves=31, verbose=-1)
    m.fit(Xtr, ytr, eval_set=[(Xva, yva)], callbacks=[lgb.early_stopping(100, verbose=False)])
for nl in [4, 15, 63, 255]:
    m = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, num_leaves=nl, verbose=-1)
    ...   # same fit</div>
  <div class="fx" data-lang="text">lr=0.3   best trees    68  test acc 0.851
lr=0.1   best trees   216  test acc 0.869
lr=0.03  best trees  1154  test acc 0.874
num_leaves=4    best trees  3476  train acc 0.913  test acc 0.851
num_leaves=15   best trees  1116  train acc 0.966  test acc 0.864
num_leaves=63   best trees   418  train acc 0.996  test acc 0.877
num_leaves=255  best trees   124  train acc 1.000  test acc 0.873</div>
  <p>A smaller learning rate needs more trees: 10× smaller lr needed about 17× more trees and gave +2.3 points. Tiny trees (4 leaves) cannot capture feature combinations. Huge trees (255 leaves) memorise faster than they learn.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Don't grid-search learning rate together with everything else; it interacts with all knobs. Fix it, tune the rest with random search or Optuna on a validation set (or CV), then lower it for the final model.</p>
  </div>

  <h2 id="mt-es"><span class="num">08</span>Early Stopping</h2>
  <p>Early stopping watches the loss on a validation set after every new tree and stops when it has not improved for N rounds. Why: boosting never stops improving on training data; after some point it is only learning noise.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Revising for boards with mock tests. After a point, mugging the same guide again raises your score on that guide but not on new papers. Stop when the mock-test score stops going up.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 235" width="560">
<line x1="50" y1="200" x2="515" y2="200" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="200" stroke="currentColor"/>
<text x="44" y="204" text-anchor="end" class="tm" font-size="11">0</text><text x="44" y="152" text-anchor="end" class="tm" font-size="11">0.2</text><text x="44" y="101" text-anchor="end" class="tm" font-size="11">0.4</text><text x="44" y="50" text-anchor="end" class="tm" font-size="11">0.6</text>
<text x="50" y="216" text-anchor="middle" class="tm" font-size="11">1</text><text x="234" y="216" text-anchor="middle" class="tm" font-size="11">400</text><text x="418" y="216" text-anchor="middle" class="tm" font-size="11">800</text><text x="510" y="216" text-anchor="middle" class="tm" font-size="11">1000</text>
<text x="280" y="232" text-anchor="middle" class="tm" font-size="12">boosting round (LightGBM, lr 0.1, 63 leaves)</text>
<polyline points="50,32 51,56 53,72 54,84 56,94 57,101 58,107 60,112 61,116 62,119 64,123 68,131 73,136 78,141 82,145 87,149 91,153 96,156 110,164 124,171 137,176 143,178 151,180 165,183 179,186 193,189 207,191 220,192 234,194 248,195 262,196 276,197 289,197 303,198 317,198 331,198 345,199 359,199 372,199 386,199 400,199 414,200 428,200 441,200 455,200 469,200 483,200 497,200 510,200" fill="none" class="sb" stroke-width="2"/>
<polyline points="50,32 51,55 53,70 54,81 56,89 57,95 58,100 60,103 61,106 62,108 64,110 68,114 73,115 78,116 82,116 87,117 91,118 96,118 110,119 124,120 137,120 143,121 151,121 165,120 179,119 193,119 207,118 220,116 234,115 248,113 262,113 276,111 289,110 303,109 317,107 331,105 345,104 359,102 372,100 386,98 400,97 414,95 428,93 441,90 455,89 469,87 483,85 497,83 510,80" fill="none" class="sr" stroke-width="2"/>
<line x1="143" y1="25" x2="143" y2="200" class="sg" stroke-dasharray="4 3" stroke-width="2"/>
<text x="150" y="40" class="tg" font-size="12">best round 204: val 0.308</text>
<text x="400" y="72" class="tr" font-size="12">validation ↑ 0.465</text>
<text x="400" y="190" class="tb" font-size="12">train → 0.000</text>
<text x="56" y="30" class="tm" font-size="11">log loss</text>
</svg><figcaption>Training loss keeps falling; validation loss bottoms out at round 204 and then climbs as the model fits noise.</figcaption></figure>
  <div class="fx" data-lang="py">m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.1, num_leaves=63, verbose=-1)
m.fit(Xtr, ytr, eval_set=[(Xtr, ytr), (Xva, yva)], eval_names=["train", "val"])
va = m.evals_result_["val"]["binary_logloss"]                    # loss per round
# production version: callbacks=[lgb.early_stopping(50)] stops ~50 rounds after the best</div>
  <div class="fx" data-lang="text">round   10  train logloss 0.449  val logloss 0.464
round   50  train logloss 0.250  val logloss 0.332
round  100  train logloss 0.173  val logloss 0.317
round  204  train logloss 0.086  val logloss 0.308
round  500  train logloss 0.013  val logloss 0.347
round 1000  train logloss 0.000  val logloss 0.465
round 3000  train logloss 0.000  val logloss 0.752
best round (min val loss): 204</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The early-stopping set is now part of model selection. Report final performance on a separate test set (as above), or the score is optimistic. For the final fit on all data, reuse the best round count (scaled up a little for the extra rows).</p>
  </div>

  <h2 id="mt-prod"><span class="num">09</span>Production Concerns</h2>
  <p>Real projects add a few problems that toy examples hide: rare classes (fraud is 1 in 1,000), business rules the model must respect, and costs that are not symmetric.</p>
  <div class="cards">
    <div><b>Class imbalance</b><p><code>scale_pos_weight = n_neg / n_pos</code> (XGBoost) or <code>class_weight</code>. Distorts probabilities; alternatively train unweighted and move the threshold using the PR curve.</p><small>Monitor AUC-PR, not accuracy</small></div>
    <div><b>Monotone constraints</b><p><code>monotone_constraints</code>: +1 / −1 per feature forces the prediction to only rise / fall with it.</p><small>Price vs demand, debt vs risk, temperature vs load</small></div>
    <div><b>Custom loss</b><p>Pass a function returning gradient and Hessian per row (XGBoost <code>obj=</code>, LightGBM <code>objective=</code>).</p><small>Asymmetric costs, MAPE-like losses</small></div>
    <div><b>Categoricals</b><p>CatBoost raw; LightGBM <code>categorical_feature</code>. Naive target encoding leaks the row's own label.</p><small>CatBoost's ordered stats avoid it</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trees cannot go beyond the range they saw. A forest trained on flat prices up to ₹1 crore never predicts ₹2 crore, because a leaf only predicts an average of training rows. For growing targets, predict the change, or add a linear part.</p>
  </div>

  <h2 id="mt-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A node has 4 positives and 6 negatives. What's its Gini? A split gives [4/1] and [0/5]. What's the gain?</summary><div class="qa-body">Gini = 1 − (0.4² + 0.6²) = 0.48. Children: 1 − (0.8² + 0.2²) = 0.32 and 0. Weighted = 0.5·0.32 + 0.5·0 = 0.16. Gain = 0.48 − 0.16 = 0.32.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging reduce variance? Give the formula.</summary><div class="qa-body">Var(mean of n trees) = ρσ² + (1 − ρ)σ²/n. More trees shrink the second term; the floor ρσ² depends on correlation between trees. Bootstrap rows and random feature subsets per split lower ρ. Bias stays about the same as one deep tree, which is already low.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Impurity-based importance ranks a customer-ID-like column highly. What's going on?</summary><div class="qa-body">MDI is computed on training data and favours features with many unique values: more thresholds means more chances to find a split that looks good by luck. In our run, random noise with 20,000 values got 7× the MDI of random binary noise. Check with permutation importance on validation data (both ≈ 0) or SHAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does each tree in gradient boosting fit?</summary><div class="qa-body">The negative gradient of the loss with respect to the current prediction, −∂L/∂F, evaluated per row. For squared error that equals the residual y − F. The tree's output is scaled by the learning rate and added to the ensemble.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does XGBoost use the Hessian?</summary><div class="qa-body">It takes a second-order Taylor expansion of the loss, so each leaf's optimal weight has a closed form w* = −G/(H + λ) and split gain is computed from G and H sums. The Hessian is curvature: where the loss is sharply curved, steps are smaller. This gives better steps per tree than gradient-only boosting and makes regularisation (λ, γ) explicit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>XGBoost vs LightGBM vs CatBoost: when would you pick each?</summary><div class="qa-body">LightGBM: large data, need speed (histograms, leaf-wise growth, GOSS). CatBoost: many categorical features or small data, want good results with defaults (ordered boosting, ordered target stats). XGBoost: mature all-rounder, wide deployment support. On our data all three were within 0.003 AUC, so pick by data shape and ops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest vs gradient boosting: which do you try first?</summary><div class="qa-body">RF as a fast, robust baseline that barely needs tuning and handles noise well. Then boosting with early stopping, which usually wins on large, clean tabular data with interactions. If boosting doesn't beat RF meaningfully on validation (here it didn't: 0.874 vs 0.877), RF's simplicity wins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tune a gradient boosting model, and in what order?</summary><div class="qa-body">Fix learning rate ≈ 0.05 with many trees and early stopping. Tune tree size (max_depth / num_leaves), then min_child_weight / min_child_samples, then subsample and colsample_bytree, then L1/L2 regularisation. Use random search or Optuna. Finally lower the learning rate and let early stopping pick more trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is early stopping mandatory for boosting but not for random forest?</summary><div class="qa-body">Boosting keeps fitting the remaining errors, which eventually are noise: validation log loss went 0.308 (round 204) → 0.752 (round 3000) while training loss reached 0. RF trees are independent; adding more only averages more and cannot overfit further.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does CatBoost's ordered boosting prevent?</summary><div class="qa-body">Target leakage: in standard boosting a row's residual is computed by a model that already saw that row's label, so residuals are optimistic. CatBoost uses random permutations and computes each row's residual (and categorical target statistics) only from rows earlier in the order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are monotone constraints and when do you use them?</summary><div class="qa-body">A per-feature +1 / −1 setting that forces predictions to only increase / decrease as that feature increases, all else fixed; enforced when choosing splits. Use when domain knowledge demands a direction (risk rises with debt, demand falls with price) so the model can't learn noisy reversals.</div></details>
</main>`
});
