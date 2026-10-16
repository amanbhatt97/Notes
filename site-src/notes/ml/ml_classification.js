// ml/ml_classification.js — Classification
Object.assign(TOPIC_CONTENT, {
  "ml_classification": `<main>
  <h1>Classification</h1>
  <p class="lead">Classification predicts a category: spam or not, loan default or not, which disease. This note covers the four classic methods: logistic regression (a line through log-odds), Naive Bayes (counting with Bayes' rule), KNN (ask the neighbours) and SVM (the widest gap, bent by kernels). Each gets the idea, one key formula and a real sklearn run. At the end, all of them run on one dataset. Builds on regression and basic probability.</p>

  <h2 id="mcl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classification</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Logistic regression</div>
        <ul>
          <li><b>Model</b> — P(y=1|x) = σ(wᵀx + b), σ(z) = 1/(1 + e⁻ᶻ)</li>
          <li><b>Log-odds</b> — log(p/(1−p)) = wᵀx + b; linear in log-odds</li>
          <li><b>Loss</b> — cross-entropy (log loss) = negative log-likelihood; no closed form</li>
          <li><b>Coefficient</b> — +1 unit multiplies odds by e^w (odds ratio)</li>
          <li><b>Boundary</b> — wᵀx + b = 0: a straight line / hyperplane</li>
          <li>⚠ Not a probability change: +1 log-odds moves p by 0.23 at p=0.5, 0.03 at p=0.02</li>
          <li>⚠ 0.5 threshold is arbitrary; pick from the PR curve</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Naive Bayes</div>
        <ul>
          <li><b>Rule</b> — P(y|x) ∝ P(y)·Π P(xᵢ|y)</li>
          <li><b>Naive</b> — features independent given the class</li>
          <li><b>Gaussian</b> — continuous features (wine: 0.966 CV)</li>
          <li><b>Multinomial</b> — word counts; repeats matter</li>
          <li><b>Bernoulli</b> — word present/absent; absences count too</li>
          <li><b>Smoothing</b> — alpha=1 (Laplace) avoids zero probabilities</li>
          <li>💡 Each SMS word is a separate clue; only the winning class must be right</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">KNN</div>
        <ul>
          <li><b>How</b> — majority vote of the k nearest training points</li>
          <li><b>Lazy</b> — no training; O(n·d) per prediction; 💡 ask nearby flats their rent</li>
          <li><b>k</b> — small = jagged/high variance; large = smooth/high bias; pick by CV</li>
          <li>⚠ <b>Scale first</b> — wine: 0.691 raw → 0.949 scaled</li>
          <li>⚠ <b>Curse of dimensionality</b> — nearest/farthest ratio 0.01 at d=2, 0.90 at d=1000</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SVM</div>
        <ul>
          <li><b>Goal</b> — widest margin; margin = 2/‖w‖; 💡 widest road between two villages</li>
          <li><b>Support vectors</b> — the points on/inside the margin; only they define the boundary</li>
          <li><b>C</b> — high C: narrow margin, few errors; low C: wide margin, more errors</li>
          <li>Moons: C=0.01 → 416 SVs, C=100 → 88 SVs</li>
          <li><b>Scale</b> — kernel SVM O(n²–n³); &gt;100k rows use LinearSVC / logistic</li>
          <li>⚠ Needs feature scaling; <code>probability=True</code> is slow Platt scaling</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kernels</div>
        <ul>
          <li><b>Lift</b> — map to a space where a flat cut works (x → x²); 💡 lift the middle coins</li>
          <li><b>Trick</b> — K(a,b) = φ(a)·φ(b) computed without building φ</li>
          <li><b>RBF</b> — exp(−γ‖a−b‖²); γ high = wiggly/overfit (train .983, test .811)</li>
          <li><b>Poly</b> — (γa·b + r)^d; explicit interactions</li>
          <li>Circles: linear 0.547 → RBF / poly 1.000</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li><b>Baseline</b> — logistic: fast, explainable, calibrated</li>
          <li><b>Text, tiny data</b> — Naive Bayes</li>
          <li><b>Small, low-d, odd shapes</b> — KNN or RBF SVM</li>
          <li><b>Tabular, real money</b> — gradient boosting usually wins</li>
          <li>Moons test acc: logistic 0.844, KNN-15 0.889, RBF 0.872, tree 0.883</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mcl-logit"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Logistic Regression</span><span class="rm-sub">Sigmoid, log-odds, boundary</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-nb"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Naive Bayes</span><span class="rm-sub">Gaussian, Multinomial, Bernoulli</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-knn"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">K-Nearest Neighbours</span><span class="rm-sub">Distance, k, scaling</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-svm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Support Vector Machines</span><span class="rm-sub">Margin, support vectors, C</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-kernel"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Kernels</span><span class="rm-sub">Lifting into a new space</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-cmp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Boundaries Compared</span><span class="rm-sub">One dataset, eight models</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-choose"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When to Use Each</span><span class="rm-sub">Decision table</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mcl-logit"><span class="num">01</span>Logistic Regression</h2>
  <p>Logistic regression gives the probability of "yes" for a yes/no question: will this customer default on an EMI? Why not plain linear regression? It can output −0.3 or 1.4, which are not probabilities. Logistic regression computes a linear score, then squashes it into 0–1 with the sigmoid.</p>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
<line x1="40" y1="190" x2="525" y2="190" stroke="currentColor"/><line x1="280" y1="15" x2="280" y2="195" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="40" y1="105" x2="525" y2="105" stroke="currentColor" stroke-dasharray="2 4"/>
<text x="34" y="194" text-anchor="end" class="tm" font-size="11">0</text><text x="34" y="109" text-anchor="end" class="tm" font-size="11">0.5</text><text x="34" y="24" text-anchor="end" class="tm" font-size="11">1</text>
<text x="40" y="207" text-anchor="middle" class="tm" font-size="11">−6</text><text x="160" y="207" text-anchor="middle" class="tm" font-size="11">−3</text><text x="280" y="207" text-anchor="middle" class="tm" font-size="11">0</text><text x="400" y="207" text-anchor="middle" class="tm" font-size="11">3</text><text x="520" y="207" text-anchor="middle" class="tm" font-size="11">6</text>
<polyline points="40,190 60,189 80,189 100,188 120,187 140,185 160,182 180,177 200,170 220,159 240,144 260,126 280,105 300,84 320,66 340,51 360,40 380,33 400,28 420,25 440,23 460,22 480,21 500,21 520,20" fill="none" class="sb" stroke-width="2.5"/>
<line x1="280" y1="105" x2="320" y2="105" class="sg" stroke-width="3"/><line x1="320" y1="105" x2="320" y2="66" class="sg" stroke-width="3"/>
<text x="328" y="96" class="tg" font-size="12">z 0→1: p 0.50→0.73</text>
<line x1="120" y1="187" x2="160" y2="187" class="sr" stroke-width="3"/><line x1="160" y1="187" x2="160" y2="182" class="sr" stroke-width="3"/>
<text x="50" y="150" class="tr" font-size="12">z −4→−3: p 0.02→0.05</text>
<text x="272" y="34" text-anchor="end" font-size="12">boundary: wᵀx + b = 0</text>
<text x="525" y="222" text-anchor="end" class="tm" font-size="12">z = wᵀx + b (log-odds)</text>
</svg><figcaption>The sigmoid squashes any score into a probability. The same +1 step in log-odds moves p a lot in the middle, barely at the ends.</figcaption></figure>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>log(p / (1 − p)) = wᵀx + b</strong>, so p = σ(wᵀx + b). Trained by minimising log loss <code>−Σ[y·log p + (1−y)·log(1−p)]</code>, which is maximum likelihood. No closed form: solvers like lbfgs iterate.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fan regulator, not an on/off switch. Evidence adds up in a straight line (turning the knob). The sigmoid turns it into a speed between 0 and full.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score, log_loss
X, y = load_breast_cancer(return_X_y=True, as_frame=True)     # y=1 benign
X = X[["mean radius", "mean texture", "worst concave points", "worst smoothness"]]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0)).fit(Xtr, ytr)
p = clf.predict_proba(Xte)[:, 1]
print(f"acc {accuracy_score(yte, p &gt; 0.5):.3f}  AUC {roc_auc_score(yte, p):.3f}  logloss {log_loss(yte, p):.3f}")
lr = clf[-1]
print(pd.DataFrame({"coef (per 1 SD)": lr.coef_[0], "odds ratio": np.exp(lr.coef_[0])},
                   index=X.columns).round(2))</div>
  <div class="fx" data-lang="text">acc 0.930  AUC 0.984  logloss 0.153
                      coef (per 1 SD)  odds ratio
mean radius                     -3.03        0.05
mean texture                    -1.17        0.31
worst concave points            -2.45        0.09
worst smoothness                -0.83        0.44</div>
  <p>How to read it: one standard deviation more of mean radius multiplies the odds of <em>benign</em> by 0.05. So the odds of malignant go up about 20 times.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never say "w increases probability by w". It changes <em>log-odds</em> by w; the probability change depends on where you start (0.23 at p = 0.5, 0.03 at p = 0.02). Also, the boundary is linear: logistic can't learn circles or XOR unless you add features.</p>
  </div>
  <div class="cards">
    <div><b>C</b><p>Inverse regularisation (C = 1/λ). Smaller C = stronger L2 shrinkage.</p><small>Default 1.0</small></div>
    <div><b>class_weight="balanced"</b><p>Up-weights the rare class in the loss.</p><small>Imbalanced targets</small></div>
    <div><b>Threshold</b><p>Use <code>predict_proba</code> and pick a cut-off from the precision–recall curve.</p><small>0.5 is rarely right</small></div>
  </div>

  <h2 id="mcl-nb"><span class="num">02</span>Naive Bayes</h2>
  <p>Naive Bayes counts how often each word (or feature value) appears in each class, then multiplies these chances. Why use it: it trains in one pass, needs very little data and is hard to beat as a quick text baseline.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An SMS says "free", "prize", "claim". You have seen "free" mostly in spam, "prize" mostly in spam. Each clue pushes your guess separately; you never ask how the clues relate. That "treat each clue alone" shortcut is the naive part.</p>
  </div>
  <div class="flow"><span>Prior P(spam)</span><span>× P(word₁ | spam)</span><span>× P(word₂ | spam) …</span><span>Compare with ham</span><span>Bigger wins</span></div>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>P(y | x) ∝ P(y) · Π P(xᵢ | y)</strong>. "Naive" = assume features are independent given the class, so the joint likelihood becomes a simple product of per-feature counts.</p>
  </div>
  <div class="cards">
    <div><b>GaussianNB</b><p>Each feature ~ normal per class (mean, variance).</p><small>Continuous features, sensors</small></div>
    <div><b>MultinomialNB</b><p>Word <em>counts</em>; a word seen 3 times counts 3 times.</p><small>Text with counts / TF-IDF</small></div>
    <div><b>BernoulliNB</b><p>Word present or absent; missing words are evidence too.</p><small>Short texts, binary flags</small></div>
  </div>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, BernoulliNB, GaussianNB
from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
train = ["win a free prize now", "free cash offer win", "claim your free prize",
         "cheap offer buy now", "meeting moved to monday", "see you at lunch",
         "project update attached", "can we meet monday"]
y = [1, 1, 1, 1, 0, 0, 0, 0]                                   # 1 = spam
vec = CountVectorizer(); X = vec.fit_transform(train)
mnb = MultinomialNB(alpha=1).fit(X, y); bnb = BernoulliNB(alpha=1).fit(X, y)
for msg in ["free lunch monday", "free free free lunch monday", "project prize"]:
    x = vec.transform([msg])
    print(f"{msg:28s} P(spam) multinomial={mnb.predict_proba(x)[0,1]:.2f}  "
          f"bernoulli={bnb.predict_proba(x)[0,1]:.2f}")
Xw, yw = load_wine(return_X_y=True)
print(f"GaussianNB on wine CV acc {cross_val_score(GaussianNB(), Xw, yw, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">free lunch monday            P(spam) multinomial=0.38  bernoulli=0.29
free free free lunch monday  P(spam) multinomial=0.90  bernoulli=0.29
project prize                P(spam) multinomial=0.59  bernoulli=0.51
GaussianNB on wine CV acc 0.966</div>
  <p>Repeating "free" three times pushes Multinomial from 0.38 to 0.90. Bernoulli does not change, because "present" is just present.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A word never seen in a class gets P = 0, and the whole product becomes 0. Laplace smoothing (<code>alpha=1</code>) adds 1 to every word count to stop this. Also, NB probabilities are often too extreme: trust which class wins, not the exact number.</p>
  </div>
  <p>Words are clearly not independent, so why does it work? Only the <em>winning class</em> must be right, not the exact probability. Errors from many features partly cancel. And the simple model cannot overfit small data.</p>

  <h2 id="mcl-knn"><span class="num">03</span>K-Nearest Neighbours</h2>
  <p>KNN finds the k training points closest to the new point and takes a majority vote. Why: no formula to fit, so it can follow any boundary shape. How: compute distance to every stored point, sort, vote among the top k.</p>
  <figure class="viz"><svg viewBox="0 0 520 230" width="520">
<circle cx="150" cy="110" r="40" fill="none" class="sg" stroke-width="2"/>
<circle cx="150" cy="110" r="80" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
<circle cx="170" cy="95" r="6" class="fr sr"/><circle cx="135" cy="130" r="6" class="fr sr"/><circle cx="125" cy="95" r="6" class="fb sb"/>
<circle cx="210" cy="140" r="6" class="fb sb"/><circle cx="90" cy="80" r="6" class="fb sb"/><circle cx="160" cy="180" r="6" class="fb sb"/><circle cx="100" cy="170" r="6" class="fr sr"/>
<circle cx="245" cy="55" r="6" class="fr sr"/><circle cx="40" cy="150" r="6" class="fb sb"/><circle cx="265" cy="190" r="6" class="fr sr"/><circle cx="60" cy="30" r="6" class="fb sb"/>
<path d="M150 102 L152 108 L158 108 L153 112 L155 118 L150 114 L145 118 L147 112 L142 108 L148 108 Z" stroke="currentColor" fill="currentColor"/>
<text x="196" y="80" class="tg" font-size="12">k=3</text><text x="222" y="108" class="tm" font-size="12">k=7</text>
<text x="300" y="70" font-size="14">k = 3 → <tspan class="tr">red</tspan> (2 vs 1)</text>
<text x="300" y="100" font-size="14">k = 7 → <tspan class="tb">blue</tspan> (4 vs 3)</text>
<text x="300" y="140" class="tm" font-size="12">distance = √Σ(aᵢ − bᵢ)²</text>
<text x="300" y="162" class="tm" font-size="12">answer depends on k</text>
<text x="300" y="184" class="tm" font-size="12">and on feature scales</text>
</svg><figcaption>The star takes the majority label of its k nearest points. Change k and the answer can flip.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Guessing a flat's rent by asking the k nearest flats in your society. Ask only 1: one odd flat fools you. Ask 500: you are averaging the whole city.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.neighbors import KNeighborsClassifier
X, y = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
for k in [1, 5, 15, 51, 151]:
    s = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(k)), Xtr, ytr, cv=5).mean()
    print(f"k={k:&lt;4d} CV acc {s:.3f}")
Xw, yw = load_wine(return_X_y=True)                     # proline 278-1680, hue 0.48-1.71
print(f"KNN raw     CV acc {cross_val_score(KNeighborsClassifier(5), Xw, yw, cv=5).mean():.3f}")
print(f"KNN scaled  CV acc {cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(5)), Xw, yw, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">k=1    CV acc 0.895
k=5    CV acc 0.921
k=15   CV acc 0.907
k=51   CV acc 0.898
k=151  CV acc 0.869
KNN raw     CV acc 0.691
KNN scaled  CV acc 0.949</div>
  <p>k = 5 wins here. k = 1 copies noise; k = 151 blurs the two classes together. Without scaling, proline (values in hundreds) drowns out hue (values near 1), and accuracy drops by 26 points.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Curse of dimensionality: with 1,000 random points, nearest ÷ farthest distance is 0.01 at d = 2 but 0.90 at d = 1000. Everything is "equally far", so "nearest" means little. Reduce dimensions (PCA, feature selection) before KNN.</p>
  </div>
  <p>KNN is a <strong>lazy learner</strong> (it does no work while training). <code>fit</code> just stores the data. Each prediction scans all of it: O(n·d). Speed-ups: KD/ball trees for few dimensions, approximate-NN indexes (FAISS) at scale.</p>

  <h2 id="mcl-svm"><span class="num">04</span>Support Vector Machines</h2>
  <p>An SVM draws the boundary that keeps the widest possible gap (the <strong>margin</strong>) from both classes. Why: a wide gap means small changes in new data will not flip the answer. Only the points nearest the gap, the <strong>support vectors</strong>, decide where it goes.</p>
  <figure class="viz"><svg viewBox="0 0 540 270" width="540">
<line x1="40" y1="260" x2="300" y2="0" stroke="currentColor" stroke-width="2.5"/>
<line x1="0" y1="250" x2="250" y2="0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="90" y1="260" x2="350" y2="0" stroke="currentColor" stroke-dasharray="5 4"/>
<circle cx="80" cy="120" r="6" class="fb sb"/><circle cx="110" cy="80" r="6" class="fb sb"/><circle cx="60" cy="150" r="6" class="fb sb"/><circle cx="50" cy="90" r="6" class="fb sb"/><circle cx="140" cy="110" r="6" class="fb sb"/><circle cx="100" cy="150" r="6" class="fb sb"/>
<circle cx="220" cy="200" r="6" class="fr sr"/><circle cx="260" cy="150" r="6" class="fr sr"/><circle cx="200" cy="150" r="6" class="fr sr"/><circle cx="240" cy="230" r="6" class="fr sr"/><circle cx="300" cy="120" r="6" class="fr sr"/><circle cx="160" cy="190" r="6" class="fr sr"/>
<circle cx="140" cy="110" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="100" cy="150" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="200" cy="150" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="160" cy="190" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<line x1="125" y1="125" x2="175" y2="175" class="sg" stroke-width="2"/>
<text x="360" y="60" font-size="13">solid: wᵀx + b = 0</text>
<text x="360" y="84" font-size="13">dashed: wᵀx + b = ±1</text>
<text x="360" y="108" class="tg" font-size="13">margin = 2 / ‖w‖</text>
<text x="360" y="132" font-size="13">ringed: support vectors</text>
<text x="360" y="170" class="tm" font-size="12">delete any other point:</text>
<text x="360" y="188" class="tm" font-size="12">the boundary doesn't move</text>
</svg><figcaption>SVM picks the separating line with the widest empty street. Only the points touching the street matter.</figcaption></figure>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>min ½‖w‖² + C·Σ max(0, 1 − yᵢ(wᵀxᵢ + b))</strong>. First term widens the margin; the hinge term charges for points on the wrong side of their kerb. C sets the exchange rate.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Building the widest possible road between two villages. Only the houses right at the roadside (the support vectors) decide where the road can go. Houses far inside the villages do not matter.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.svm import SVC
for C in [0.01, 1, 100]:
    p = make_pipeline(StandardScaler(), SVC(C=C)).fit(Xtr, ytr)      # moons, RBF kernel
    print(f"C={C:&lt;5} SVs={p[-1].n_support_.sum():3d}/{len(Xtr)}  "
          f"train {p.score(Xtr, ytr):.3f}  test {p.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">C=0.01  SVs=416/420  train 0.871  test 0.861
C=1     SVs=123/420  train 0.902  test 0.872
C=100   SVs= 88/420  train 0.929  test 0.889</div>
  <p>Low C allows many mistakes, so the margin is wide and almost every point becomes a support vector. High C punishes mistakes, so the margin is narrow with fewer support vectors. Here C = 100 still does best on test; on noisier data it would overfit. Tune C and γ together with CV.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Kernel SVM training is O(n²)–O(n³): fine up to tens of thousands of rows, painful beyond ~100k. Use <code>LinearSVC</code> or logistic regression at scale. Always scale features, and remember <code>probability=True</code> adds slow, extra cross-validated Platt scaling.</p>
  </div>

  <h2 id="mcl-kernel"><span class="num">05</span>Kernels: Lifting the Data</h2>
  <p>Some data cannot be split by any straight line. A <strong>kernel</strong> lets the SVM work as if you added extra features (like x²), where a straight cut does work. The cut looks curved back in the original space.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>₹1 coins sit in the middle of a table, ₹5 coins around them. No ruler on the table can separate them. Lift the middle coins up a little, and a flat sheet slides between the two groups.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 540 240" width="540">
<line x1="15" y1="130" x2="245" y2="130" stroke="currentColor"/>
<circle cx="35" cy="130" r="6" class="fr sr"/><circle cx="55" cy="130" r="6" class="fr sr"/><circle cx="95" cy="130" r="6" class="fb sb"/><circle cx="115" cy="130" r="6" class="fb sb"/><circle cx="145" cy="130" r="6" class="fb sb"/><circle cx="165" cy="130" r="6" class="fb sb"/><circle cx="205" cy="130" r="6" class="fr sr"/><circle cx="225" cy="130" r="6" class="fr sr"/>
<text x="130" y="100" text-anchor="middle" font-size="13">1-D: no single cut works</text>
<text x="130" y="160" text-anchor="middle" class="tm" font-size="12">x</text>
<text x="270" y="135" font-size="20">→</text>
<line x1="295" y1="220" x2="525" y2="220" stroke="currentColor"/><line x1="410" y1="40" x2="410" y2="225" stroke="currentColor"/>
<polyline points="305,61 320,103 335,139 350,168 365,191 380,207 395,217 410,220 425,217 440,207 455,191 470,168 485,139 500,103 515,61" fill="none" stroke="currentColor" stroke-dasharray="2 3"/>
<circle cx="315" cy="89" r="6" class="fr sr"/><circle cx="335" cy="139" r="6" class="fr sr"/><circle cx="375" cy="202" r="6" class="fb sb"/><circle cx="395" cy="217" r="6" class="fb sb"/><circle cx="425" cy="217" r="6" class="fb sb"/><circle cx="445" cy="202" r="6" class="fb sb"/><circle cx="485" cy="139" r="6" class="fr sr"/><circle cx="505" cy="89" r="6" class="fr sr"/>
<line x1="295" y1="172" x2="525" y2="172" class="sg" stroke-width="2.5"/>
<text x="416" y="52" class="tm" font-size="12">x²</text>
<text x="298" y="192" class="tg" font-size="12">flat cut</text>
</svg><figcaption>Add the feature x², and the inner points sit low, the outer ones high. A straight cut in the lifted space is a curved boundary back in x.</figcaption></figure>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>K(a, b) = φ(a)·φ(b)</strong>. SVM only ever needs dot products between points, so a kernel computes them in the lifted space without building φ. RBF: <code>K = exp(−γ‖a − b‖²)</code> (an infinite-dimensional lift). Polynomial: <code>K = (γ a·b + r)^d</code>.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.datasets import make_circles
Xc, yc = make_circles(n_samples=400, noise=0.1, factor=0.4, random_state=0)
for n, m in [("linear", SVC(kernel="linear")), ("poly d=2", SVC(kernel="poly", degree=2)), ("rbf", SVC())]:
    print(f"{n:9s} CV acc {cross_val_score(m, Xc, yc, cv=5).mean():.3f}")
Z = np.c_[Xc, (Xc**2).sum(1)]                           # lift by hand: add r² = x1² + x2²
print(f"linear on lifted [x1,x2,x1²+x2²] CV acc {cross_val_score(SVC(kernel='linear'), Z, yc, cv=5).mean():.3f}")
for g in [0.1, 1, 100]:                                  # back on moons
    p = make_pipeline(StandardScaler(), SVC(gamma=g)).fit(Xtr, ytr)
    print(f"gamma={g:&lt;4} train {p.score(Xtr, ytr):.3f}  test {p.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">linear    CV acc 0.547
poly d=2  CV acc 1.000
rbf       CV acc 1.000
linear on lifted [x1,x2,x1²+x2²] CV acc 1.000
gamma=0.1  train 0.881  test 0.850
gamma=1    train 0.912  test 0.878
gamma=100  train 0.983  test 0.811</div>
  <p>Adding r² by hand does what the kernel does on its own. γ controls RBF's reach. Large γ means each point affects only a tiny bubble around it. The boundary then wraps single points and overfits.</p>

  <h2 id="mcl-cmp"><span class="num">06</span>Decision Boundaries Compared</h2>
  <p>A <strong>decision boundary</strong> is the line where the model switches its answer. Its shape tells you what a model can and cannot learn. Here all models get the same "two moons" data.</p>
  <figure class="viz"><svg viewBox="0 0 560 280" width="560">
<defs><clipPath id="mcl-clip"><rect x="10" y="10" width="400" height="260"/></clipPath></defs>
<rect x="10" y="10" width="400" height="260" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<polyline clip-path="url(#mcl-clip)" points="410,69 401,74 390,76 379,78 370,83 361,87 352,92 340,94 331,98 320,100 311,105 302,109 293,114 282,116 271,118 262,122 253,127 244,131 232,133 221,136 212,140 203,144 194,149 183,151 174,155 163,158 154,162 145,166 136,171 125,173 113,175 104,180 95,184 86,188 75,191 64,193 55,197 46,202 37,206 26,208 17,213" fill="none" class="sb" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="345,10 343,21 338,30 334,39 329,47 325,56 320,65 316,74 309,81 300,85 293,92 286,98 286,111 295,116 302,122 311,118 325,118 331,125 322,129 311,131 304,133 295,133 284,136 275,131 264,133 257,140 257,149 271,149 280,144 289,149 298,144 307,149 307,158 300,164 295,160 304,155 293,153 284,158 280,166 271,171 259,173 248,175 239,171 226,171 217,175 208,171 199,166 192,160 199,153 206,160 212,166 219,169 228,164 235,166 246,169 257,171 259,160 248,158 235,158 226,153 228,147 221,140 212,136 199,136 194,140 208,140 206,147 197,147 190,140 179,138 179,125 185,118 192,120 197,125 206,125 208,118 199,114 185,114 176,118 165,116 158,118 163,122 163,131 152,129 145,122 136,127 131,136 118,136 109,140 113,144 120,151 131,153 138,160 147,164 140,171 129,169 125,160 113,158 102,160 107,169 102,177 113,180 125,182 120,191 116,199 111,208 107,217 100,224 93,230 84,235 77,241 68,246 62,252 53,257 46,263 37,268" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="104,109 118,109 113,105 102,107" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="122,105 131,100 143,98 134,94 125,94 120,103" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="158,83 172,83 172,74 163,78 158,83" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="358,10 352,17 343,21 336,28 329,34 322,41 318,50 316,61 313,72 311,83 309,94 309,107 304,116 300,125 295,133 289,140 280,144 271,149 257,149 248,153 239,149 226,149 214,147 203,144 192,142 181,140 167,140 154,140 143,142 134,147 125,151 118,158 113,166 109,175 107,186 102,195 102,208 98,217 98,230 93,239 89,248 84,257 80,266" fill="none" class="sg" stroke-width="2"/>
<path d="M255 99h0M231 199h0M95 62h0M110 114h0M253 83h0M122 99h0M113 61h0M184 89h0M270 154h0M226 111h0M80 93h0M259 111h0M194 46h0M241 176h0M85 171h0M97 91h0M112 13h0M211 118h0M120 92h0M198 91h0M132 100h0M270 125h0M110 56h0M138 20h0M103 59h0M179 67h0M233 146h0M38 78h0M227 66h0M216 64h0M79 125h0M244 87h0M60 171h0M185 83h0M290 177h0M221 86h0M162 53h0M109 65h0M176 77h0M194 84h0M131 103h0M196 75h0M281 150h0M117 142h0M212 83h0M96 105h0M54 133h0M80 114h0M229 144h0M216 105h0M138 95h0M165 84h0M174 97h0M48 152h0M166 23h0M87 168h0M62 175h0M95 81h0M193 107h0M100 51h0M90 141h0M257 84h0M243 187h0M202 82h0M177 40h0M251 91h0M248 131h0M251 97h0M253 69h0M41 83h0M200 38h0M147 79h0M122 94h0M91 47h0M247 191h0M99 168h0M167 108h0M284 145h0M99 89h0M198 68h0M111 134h0M178 56h0M234 55h0M158 103h0M248 100h0M92 131h0M220 100h0M115 43h0M135 89h0M91 167h0M197 44h0" class="sb" stroke-width="5" stroke-linecap="round" stroke-opacity="0.75"/>
<path d="M137 79h0M228 208h0M342 135h0M191 238h0M321 223h0M147 185h0M253 251h0M224 243h0M210 189h0M263 245h0M205 200h0M240 236h0M309 176h0M279 126h0M149 151h0M227 175h0M247 198h0M298 183h0M146 171h0M260 182h0M267 212h0M289 211h0M259 250h0M249 251h0M159 166h0M378 135h0M326 209h0M321 189h0M203 212h0M196 128h0M287 210h0M211 99h0M258 237h0M342 161h0M337 175h0M173 202h0M341 190h0M232 212h0M215 174h0M262 229h0M116 139h0M220 187h0M328 198h0M335 186h0M349 172h0M186 166h0M375 159h0M340 173h0M267 198h0M188 224h0M123 94h0M163 126h0M275 223h0M202 86h0M276 130h0M180 197h0M255 125h0M335 198h0M108 148h0M232 194h0M207 132h0M239 234h0M160 91h0M238 247h0M168 165h0M326 143h0M213 227h0M234 214h0M343 176h0M365 81h0M206 204h0M237 217h0M176 111h0M386 125h0M201 168h0M195 231h0M230 219h0M345 155h0M260 225h0M197 207h0M407 141h0M336 177h0M145 154h0M367 122h0M306 162h0M166 175h0M152 113h0M293 237h0" class="sr" stroke-width="5" stroke-linecap="round" stroke-opacity="0.75"/>
<line x1="425" y1="40" x2="455" y2="40" class="sb" stroke-width="2"/><text x="462" y="44" font-size="12">logistic</text>
<line x1="425" y1="64" x2="455" y2="64" class="sr" stroke-width="2"/><text x="462" y="68" font-size="12">KNN k=1</text>
<line x1="425" y1="88" x2="455" y2="88" class="sg" stroke-width="2"/><text x="462" y="92" font-size="12">RBF SVM</text>
<circle cx="440" cy="120" r="4" class="fb sb"/><text x="462" y="124" font-size="12">class 0</text>
<circle cx="440" cy="142" r="4" class="fr sr"/><text x="462" y="146" font-size="12">class 1</text>
<text x="425" y="190" class="tm" font-size="11">real boundaries,</text><text x="425" y="206" class="tm" font-size="11">180 test points</text>
</svg><figcaption>Same moons data: logistic can only draw a straight line, KNN-1 traces every noisy point, RBF bends smoothly.</figcaption></figure>
  <div class="fx" data-lang="py">X, y = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
models = {"Logistic": LogisticRegression(), "GaussianNB": GaussianNB(),
          "KNN k=1": KNeighborsClassifier(1), "KNN k=15": KNeighborsClassifier(15),
          "SVM linear": SVC(kernel="linear"), "SVM poly d=3": SVC(kernel="poly", degree=3, coef0=1),
          "SVM RBF": SVC(), "Tree depth=None": DecisionTreeClassifier(random_state=0)}
for n, m in models.items():
    p = make_pipeline(StandardScaler(), m).fit(Xtr, ytr)
    print(f"{n:16s} {p.score(Xtr, ytr):.3f}  {p.score(Xte, yte):.3f}")</div>
  <table class="tbl out"><caption>Accuracy on moons (noise 0.3), real output</caption>
    <tr><th>Model</th><th>Train</th><th>Test</th><th>Boundary shape</th></tr>
    <tr><td>Logistic</td><td>0.874</td><td>0.844</td><td>Straight line</td></tr>
    <tr><td>GaussianNB</td><td>0.871</td><td>0.856</td><td>Quadratic (ellipse pieces)</td></tr>
    <tr><td>KNN k=1</td><td>1.000</td><td>0.878</td><td>Jagged, memorises</td></tr>
    <tr><td>KNN k=15</td><td>0.931</td><td><strong>0.889</strong></td><td>Smooth curve</td></tr>
    <tr><td>SVM linear</td><td>0.876</td><td>0.856</td><td>Straight line</td></tr>
    <tr><td>SVM poly d=3</td><td>0.898</td><td>0.878</td><td>Cubic curve</td></tr>
    <tr><td>SVM RBF</td><td>0.902</td><td>0.872</td><td>Smooth curve</td></tr>
    <tr><td>Decision tree (no limit)</td><td>1.000</td><td>0.883</td><td>Axis-aligned staircase</td></tr>
  </table>
  <p>Linear models stop near 0.85 because the true boundary is curved. A perfect train score (KNN-1, full tree) is memorising, not learning. With only 180 test points, differences under about 3 points are just noise.</p>

  <h2 id="mcl-choose"><span class="num">07</span>When to Use Each</h2>
  <table class="tbl">
    <tr><th>Model</th><th>Wins when</th><th>Fails when</th><th>Typical use</th></tr>
    <tr><td>Logistic regression</td><td>Need explainability, calibrated probabilities, fast baseline</td><td>Curved boundaries, interactions (unless engineered)</td><td>Credit scoring, first baseline</td></tr>
    <tr><td>Naive Bayes</td><td>Text, tiny data, need speed</td><td>Correlated continuous features; need good probabilities</td><td>Spam filters, quick text baselines</td></tr>
    <tr><td>KNN</td><td>Small, low-dimensional data, irregular boundary</td><td>High d, large n (slow predictions), unscaled data</td><td>Similarity search, recommenders</td></tr>
    <tr><td>SVM (RBF)</td><td>Medium n (&lt; ~50k), clear margins, non-linear</td><td>Huge n, need probabilities</td><td>Bioinformatics, small image sets (pre-DL)</td></tr>
    <tr><td>Gradient boosting</td><td>Tabular data, accuracy matters</td><td>Strict linear model required by regulation</td><td>Most production tabular tasks</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scale-sensitive: KNN, SVM, regularised logistic. Scale-insensitive: Naive Bayes (Gaussian fits each feature separately) and trees. Put the scaler in a <code>Pipeline</code> so CV folds don't leak.</p>
  </div>

  <h2 id="mcl-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a logistic regression coefficient of 0.7 mean?</summary><div class="qa-body">A one-unit increase in that feature adds 0.7 to the log-odds, i.e. multiplies the odds by e^0.7 ≈ 2.01. It is not a fixed change in probability: that depends on where on the sigmoid you start.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is logistic regression called a linear classifier if the sigmoid is non-linear?</summary><div class="qa-body">The boundary is where p = 0.5, i.e. σ(wᵀx + b) = 0.5, i.e. wᵀx + b = 0: a hyperplane. The sigmoid only maps the linear score to a probability. It can't separate XOR or circles without added features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why train logistic regression with log loss instead of MSE?</summary><div class="qa-body">Log loss is the negative log-likelihood of a Bernoulli model, so minimising it is maximum likelihood. It's convex in w (one global minimum) and heavily punishes confident wrong answers. MSE through a sigmoid is non-convex and gives tiny gradients when predictions are confidently wrong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gaussian vs Multinomial vs Bernoulli Naive Bayes: which for what?</summary><div class="qa-body">Gaussian: continuous features. Multinomial: counts (word frequencies, TF-IDF); repeats raise evidence. Bernoulli: binary presence flags; absent words also count as evidence, good for short texts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Naive Bayes work even though features are clearly dependent?</summary><div class="qa-body">Classification only needs the right class to have the highest score, not correct probabilities. Errors across many features partly cancel, and the strong assumption acts as regularisation on small data. Its probabilities, though, are usually over-confident.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k in KNN, and what happens at the extremes?</summary><div class="qa-body">Cross-validate. k = 1: zero training error, jagged boundary, high variance. k ≈ n: predicts the majority class everywhere, high bias. Odd k avoids ties in binary problems. On moons, k = 5 scored best (0.921 CV).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you scale features for KNN and SVM?</summary><div class="qa-body">Both rely on distances or dot products. A feature measured in hundreds (wine proline) dominates one measured in ones (hue). On wine, KNN went from 0.691 to 0.949 CV accuracy after StandardScaler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are support vectors, and what does C control?</summary><div class="qa-body">The training points on or inside the margin (or misclassified). Only they determine the boundary. C trades margin width for training errors: small C = wide, tolerant margin with many SVs (416 at C = 0.01); large C = narrow, strict margin with fewer SVs (88 at C = 100) and higher overfitting risk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the kernel trick in two sentences.</summary><div class="qa-body">SVM's optimisation and predictions use only dot products between points, so replace each dot product with a kernel K(a, b) that equals φ(a)·φ(b) in a richer feature space. You get a non-linear boundary without ever computing φ; RBF even corresponds to an infinite-dimensional φ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RBF SVM: train 0.98, test 0.81. Which knob, which direction?</summary><div class="qa-body">Overfitting: γ is too large (each point's influence too local) and/or C too large. Lower γ first (here γ = 100 → 1 took test from 0.811 to 0.878), then tune C with a grid or random search over both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 2 million rows and 50 features. Would you use a kernel SVM or KNN?</summary><div class="qa-body">Neither by default. Kernel SVM training is O(n²) or worse; KNN predictions scan all rows. Start with logistic regression (or LinearSVC) as a baseline, then gradient boosting. If you need neighbours, use an approximate-NN index.</div></details>
</main>`
});
