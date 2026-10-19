// notes/ml/ml_intro.js — What is Machine Learning
Object.assign(TOPIC_CONTENT, {
  "ml_intro": `<main>
  <h1>What is Machine Learning</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>What is Machine Learning</span></div>
  <p class="lead">Machine learning is a way of building software where you do not write the rule yourself: you show the computer many past examples with their answers, and it searches for the rule that makes the fewest mistakes. This note opens the whole Machine Learning track. It shows, with numbers you can check by hand, how a learned rule differs from a hand-written one, defines every word you will meet in later notes (feature, label, sample, parameter, hyperparameter, training, inference), walks through the three kinds of learning and the full life of a real project from problem framing to monitoring, builds a first complete model in scikit-learn, and ends with the map of all nine groups of the track and the order to read them in.</p>

  <h2 id="mi-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: Statistics and Mathematics</b><span>You have met averages and spread in <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>, chance in <a class="xref" data-note="st_probability">Probability</a>, slopes in <a class="xref" data-note="m_calculus">Calculus</a> and vectors in <a class="xref" data-note="m_linalg">Linear Algebra</a>. Those tools describe data you already have. What they leave open is the practical question every company asks: "given what we saw in the past, what will happen for this <em>new</em> customer, email or day?"</span></li>
    <li><b>This note adds: the idea of learning from examples</b><span>What "learning" means in code (search for the rule with the lowest error on past examples), the vocabulary, the three learning types, the end-to-end workflow, a first working model, and the map of the whole track.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a></b><span>A model that scores well on the rows it learned from has proved nothing. The very next note shows how to hold data back and measure honestly, which every later note depends on.</span></li>
  </ol>
  <p>This is also the first note of the <strong>Foundations</strong> group. The seven Foundations notes are the toolkit that every model in the track uses. Read them in this order; each one solves a problem the previous one leaves open.</p>
  <figure class="viz"><svg viewBox="0 0 660 210" width="660">
<defs><marker id="mi-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="12">Foundations: the toolkit every later model uses</text>
<rect x="10" y="30" width="150" height="50" rx="8" class="fb sb" stroke-width="3"/><text x="85" y="51" text-anchor="middle" font-size="12.5" font-weight="700">What is ML</text><text x="85" y="69" text-anchor="middle" font-size="10.5" class="tb">YOU ARE HERE</text>
<rect x="180" y="30" width="140" height="50" rx="8" class="fs" stroke="currentColor"/><text x="250" y="51" text-anchor="middle" font-size="12.5">Splits &amp; CV</text><text x="250" y="69" text-anchor="middle" font-size="10.5" class="tm">measure honestly</text>
<rect x="340" y="30" width="150" height="50" rx="8" class="fs" stroke="currentColor"/><text x="415" y="51" text-anchor="middle" font-size="12.5">Bias &amp; Variance</text><text x="415" y="69" text-anchor="middle" font-size="10.5" class="tm">why models fail</text>
<rect x="510" y="30" width="140" height="50" rx="8" class="fs" stroke="currentColor"/><text x="580" y="51" text-anchor="middle" font-size="12.5">Loss &amp; GD</text><text x="580" y="69" text-anchor="middle" font-size="10.5" class="tm">how models learn</text>
<line x1="160" y1="55" x2="178" y2="55" stroke="currentColor" marker-end="url(#mi-fa)"/><line x1="320" y1="55" x2="338" y2="55" stroke="currentColor" marker-end="url(#mi-fa)"/><line x1="490" y1="55" x2="508" y2="55" stroke="currentColor" marker-end="url(#mi-fa)"/>
<path d="M580 80 L580 105 L120 105 L120 128" fill="none" stroke="currentColor" marker-end="url(#mi-fa)"/>
<rect x="40" y="130" width="160" height="50" rx="8" class="fs" stroke="currentColor"/><text x="120" y="151" text-anchor="middle" font-size="12.5">Regularization</text><text x="120" y="169" text-anchor="middle" font-size="10.5" class="tm">fight overfitting</text>
<rect x="250" y="130" width="160" height="50" rx="8" class="fs" stroke="currentColor"/><text x="330" y="151" text-anchor="middle" font-size="12.5">Feature Engineering</text><text x="330" y="169" text-anchor="middle" font-size="10.5" class="tm">better inputs</text>
<rect x="460" y="130" width="170" height="50" rx="8" class="fs" stroke="currentColor"/><text x="545" y="151" text-anchor="middle" font-size="12.5">Pipelines &amp; Leakage</text><text x="545" y="169" text-anchor="middle" font-size="10.5" class="tm">keep it all honest</text>
<line x1="200" y1="155" x2="248" y2="155" stroke="currentColor" marker-end="url(#mi-fa)"/><line x1="410" y1="155" x2="458" y2="155" stroke="currentColor" marker-end="url(#mi-fa)"/>
<text x="330" y="202" text-anchor="middle" class="tm" font-size="11">After Foundations: Regression → Classification → Trees → Evaluation, then the unsupervised and applied groups (map in section 07).</text>
</svg><figcaption>The Foundations group. This note is the entry point; each arrow is "the previous note leaves this problem open".</figcaption></figure>
  <table class="tbl">
    <tr><th>Foundations note</th><th>Question it answers</th><th>Problem it leaves for the next</th></tr>
    <tr><td><strong>What is ML</strong> (this note)</td><td>What does "learning from data" mean? What are the words and steps?</td><td>How do I know the learned rule works on new rows?</td></tr>
    <tr><td><a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a></td><td>How to measure performance honestly</td><td>Why is the train score high and the validation score low?</td></tr>
    <tr><td><a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a></td><td>Under- vs overfitting, the bias-variance trade-off</td><td>How does a model actually find its numbers?</td></tr>
    <tr><td><a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a></td><td>What "wrong" means as a number and how to minimise it</td><td>Minimising training loss too hard overfits</td></tr>
    <tr><td><a class="xref" data-note="ml_regularization">Regularization</a></td><td>Penalties that keep models simple</td><td>The model is only as good as its inputs</td></tr>
    <tr><td><a class="xref" data-note="ml_features">Feature Engineering</a></td><td>Scaling, encoding, missing values, imbalance</td><td>Preprocessing can leak test information</td></tr>
    <tr><td><a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a></td><td>Bundling every step so CV stays honest</td><td>Ready for real models: <a class="xref" data-note="ml_regression">Linear Regression</a></td></tr>
  </table>

  <h2 id="mi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">What is Machine Learning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Rules vs learning</div>
        <ul>
          <li><b>Rules-based</b> — rules + data → program → answers; a person writes every rule</li>
          <li><b>ML</b> — data + answers → training → the rule (the <b>model</b>)</li>
          <li>Loan example: manager's "≥ 50k" rule = 3 errors; learned cut-off 38k = 1 error</li>
          <li><b>Learning = search</b>: try candidate rules, keep the one with the lowest error</li>
          <li><b>Mitchell</b>: improves at task T, measured by P, with experience E</li>
          <li>⚠ Skip ML when one clear rule works, or there is no data / no measurable target</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Vocabulary</div>
        <ul>
          <li><b>Sample</b> (row) · <b>feature</b> (input column, X) · <b>label / target</b> (y)</li>
          <li><b>X</b> shape (n_samples, n_features); <b>y</b> shape (n_samples,)</li>
          <li><b>Parameter</b> — learned by fit (w, b, thresholds); sklearn ends them with <code>_</code></li>
          <li><b>Hyperparameter</b> — set by you before fit (k, depth, alpha); tuned on validation</li>
          <li><b>Training</b> = <code>fit</code> · <b>inference</b> = <code>predict</code> on new rows</li>
          <li><b>Parametric</b> (fixed number of weights) vs <b>non-parametric</b> (kNN keeps the data)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · How it learns</div>
        <ul>
          <li><b>Loss</b> — one number for "how wrong"; MSE = mean((y − ŷ)²)</li>
          <li>Tea stall: rule A MSE 203.2, B 3.2, C 153.2 → keep B</li>
          <li><b>Least squares</b> w = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² = −1250/250 = −5, b = 260</li>
          <li><b>Optimisation</b> — formula or gradient descent finds the minimum</li>
          <li><b>Goal = generalisation</b>, not a low training loss</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Types of learning</div>
        <ul>
          <li><b>Supervised</b> (X, y): <b>regression</b> (number), <b>classification</b> (class)</li>
          <li><b>Unsupervised</b> (X only): clustering, dimensionality reduction, anomalies</li>
          <li><b>Reinforcement</b>: agent, action, reward; explore vs exploit</li>
          <li><b>Semi-supervised</b>: few labels + many unlabelled; self-training 0.844 → 0.884</li>
          <li><b>Self-supervised</b>: labels made from the data (next word, masked word)</li>
          <li>Also: batch vs online; instance-based vs model-based</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · The workflow</div>
        <ul>
          <li><b>Frame</b> → <b>data/EDA</b> → <b>features</b> → <b>split</b> → <b>baseline</b> → <b>train/tune</b> → <b>evaluate</b> → <b>deploy</b> → <b>monitor</b> → loop</li>
          <li>Framing in money: call a customer if p(churn) &gt; 200 / (0.5 × 3000) = 0.133</li>
          <li><b>Baseline first</b>: majority class = 62.6% on tumours, recall 0</li>
          <li><b>Drift</b>: covariate P(X), label P(y), concept P(y|X)</li>
          <li><b>PSI</b> = Σ(a − e)·ln(a/e); worked 0.151 = moderate shift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · The ML track map</div>
        <ul>
          <li><b>1 Foundations</b> → <b>2 Regression</b> → <b>3 Classification</b> → <b>4 Trees</b> → <b>5 Evaluation</b></li>
          <li><b>6 Clustering</b> · <b>7 Dimensionality Reduction</b> (unsupervised)</li>
          <li><b>8 Time Series</b> · <b>9 Recommender Systems</b> (applied)</li>
          <li>Then: deep learning, NLP, vector databases</li>
          <li>💡 First model end to end: split → baseline → CV → refit → test once → save</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mi-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Rules vs Learning</span><span class="rm-sub">A loan rule written vs learned, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mi-vocab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Key Vocabulary</span><span class="rm-sub">Features, labels, parameters, hyperparameters</span></div></div>
      <div class="rm-item rm-done" data-target="mi-learn"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How a Model Learns</span><span class="rm-sub">Loss, search, least squares by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mi-types"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Types of Learning</span><span class="rm-sub">Supervised, unsupervised, RL, semi/self</span></div></div>
      <div class="rm-item rm-done" data-target="mi-flow"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Workflow</span><span class="rm-sub">Framing to monitoring, PSI by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mi-first"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">First Model End to End</span><span class="rm-sub">scikit-learn, tested</span></div></div>
      <div class="rm-item rm-done" data-target="mi-track"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The ML Track Map</span><span class="rm-sub">All nine groups and the reading order</span></div></div>
      <div class="rm-item rm-done" data-target="mi-compare"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">ML vs rules, statistics, AI, deep learning</span></div></div>
      <div class="rm-item rm-done" data-target="mi-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps beginners and interviews hit</span></div></div>
      <div class="rm-item rm-done" data-target="mi-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mi-what"><span class="num">01</span>Rules vs Learning</h2>
  <h3>The need</h3>
  <p>A small finance company gives personal loans. Every month a few hundred people apply. Someone has to decide: approve or decline? Approving a person who will not repay loses money. Declining a person who would have repaid loses a customer. The company has a record of past loans: what each applicant earned and whether they repaid.</p>
  <p>There are two ways to build the "approve or decline" software. A person can <strong>write the rule</strong>. Or the computer can <strong>learn the rule</strong> from the past records. This section does both, on the same 8 customers, so you can see exactly what "learning" adds.</p>
  <table class="tbl out"><caption>8 past loans (income in ₹ thousand per month)</caption>
    <tr><th>Customer</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
    <tr><td>Income</td><td>15</td><td>22</td><td>28</td><td>35</td><td>41</td><td>47</td><td>55</td><td>62</td></tr>
    <tr><td>Repaid?</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>
  </table>
  <p>Customer 7 earned well but did not repay (perhaps a job loss). Real data always has a few cases like this that no simple rule explains.</p>

  <h3>Way 1: a person writes the rule</h3>
  <p>The branch manager, from experience, says: "approve anyone earning ₹50k or more". Check it on the 8 past customers. The rule says "approve" for customers 7 and 8 only.</p>
  <table class="tbl out"><caption>Manager's rule: approve if income ≥ 50</caption>
    <tr><th>Customer</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
    <tr><td>Rule says</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
    <tr><td>Truth</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>
    <tr><td>Mistake?</td><td></td><td></td><td></td><td></td><td>✗</td><td>✗</td><td>✗</td><td></td></tr>
  </table>
  <p>Three mistakes out of eight. Customers 5 and 6 were good customers turned away, and customer 7 was approved and defaulted. The manager's number came from a gut feeling, not from these records.</p>

  <h3>Way 2: the computer learns the rule, by hand</h3>
  <p>Keep the same <em>shape</em> of rule ("approve if income ≥ t") but let the data choose t. Which values of t are worth trying? Only the gaps between neighbouring incomes matter: any t between 35 and 41 gives exactly the same decisions. So try the midpoints of neighbours, plus one value below everyone and one above everyone.</p>
  <table class="tbl out"><caption>Every candidate cut-off and its number of mistakes</caption>
    <tr><th>Cut-off t</th><th>Approved customers</th><th>Mistakes (which)</th><th>Errors</th></tr>
    <tr><td>14.0</td><td>all 8</td><td>1, 2, 3, 4, 7 approved but did not repay</td><td>5</td></tr>
    <tr><td>18.5</td><td>2–8</td><td>2, 3, 4, 7</td><td>4</td></tr>
    <tr><td>25.0</td><td>3–8</td><td>3, 4, 7</td><td>3</td></tr>
    <tr><td>31.5</td><td>4–8</td><td>4, 7</td><td>2</td></tr>
    <tr><td><strong>38.0</strong></td><td><strong>5–8</strong></td><td><strong>7 only</strong></td><td><strong>1</strong></td></tr>
    <tr><td>44.0</td><td>6–8</td><td>5 declined, 7</td><td>2</td></tr>
    <tr><td>51.0</td><td>7, 8</td><td>5, 6 declined, 7</td><td>3</td></tr>
    <tr><td>58.5</td><td>8</td><td>5, 6 declined</td><td>2</td></tr>
    <tr><td>63.0</td><td>none</td><td>5, 6, 8 declined</td><td>3</td></tr>
  </table>
  <p>The winner is t = 38: approve if income ≥ ₹38k, with one mistake (customer 7, whom no income cut-off can get right). That is the whole idea of machine learning in one table: <strong>choose a family of possible rules, score each one on past examples, keep the best</strong>. Nobody typed "38". The data chose it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new shopkeeper is told by the owner "give credit to anyone who looks well dressed" (a written rule). After a year she has her own notebook of who paid back and who did not, and she notices that a steady salary above a certain level is what really matters. She did not get a better rule from a book; she got it from her notebook. The notebook is the training data, and her updated habit is the model.</p>
  </div>

  <h3>The same search in code</h3>
  <p>The code below does three things: scores the manager's rule, repeats the hand search over every cut-off, and then asks scikit-learn's depth-1 decision tree (a "stump", one question only) to do the same search. A stump is exactly "approve if income ≥ t" with t learned; how it scores cut-offs is covered in <a class="xref" data-note="ml_dtree">Decision Trees</a>.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier

income = np.array([15, 22, 28, 35, 41, 47, 55, 62])   # monthly income, ₹ thousand
repaid = np.array([ 0,  0,  0,  0,  1,  1,  0,  1])   # 1 = repaid the loan

# 1) Rules-based: a person writes the rule
def manager_rule(x):
    return (x &gt;= 50).astype(int)
print("manager rule errors:", int((manager_rule(income) != repaid).sum()))

# 2) Machine learning: try every cut-off, keep the one with fewest mistakes
s = np.sort(income)
cuts = np.r_[s[0] - 1, (s[:-1] + s[1:]) / 2, s[-1] + 1]
for t in cuts:
    errors = int(((income &gt;= t).astype(int) != repaid).sum())
    print(f"cut-off {t:5.1f} -&gt; errors {errors}")
best = min(cuts, key=lambda t: ((income &gt;= t).astype(int) != repaid).sum())
print("learned rule: approve if income &gt;=", best)

# 3) The same search, done by a library model (a depth-1 decision tree)
stump = DecisionTreeClassifier(max_depth=1, criterion="entropy").fit(income.reshape(-1, 1), repaid)
print("sklearn stump threshold:", stump.tree_.threshold[0])
print("new applicants 30k, 45k -&gt;", stump.predict([[30], [45]]))</div>
  <div class="fx" data-lang="text">manager rule errors: 3
cut-off  14.0 -&gt; errors 5
cut-off  18.5 -&gt; errors 4
cut-off  25.0 -&gt; errors 3
cut-off  31.5 -&gt; errors 2
cut-off  38.0 -&gt; errors 1
cut-off  44.0 -&gt; errors 2
cut-off  51.0 -&gt; errors 3
cut-off  58.5 -&gt; errors 2
cut-off  63.0 -&gt; errors 3
learned rule: approve if income &gt;= 38.0
sklearn stump threshold: 38.0
new applicants 30k, 45k -&gt; [0 1]</div>
  <p>The error table matches the hand table row for row. The library found the same cut-off, 38.0, and now answers new applicants: ₹30k is declined (0), ₹45k approved (1). <code>fit</code> was the search; <code>predict</code> applies the result.</p>
  <figure class="viz"><svg viewBox="0 0 620 160" width="620">
<defs><marker id="mi-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="10" y="18" font-weight="700">Rules-based program</text>
<rect x="10" y="32" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="50" y="52" text-anchor="middle">Rules</text>
<rect x="10" y="84" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="50" y="104" text-anchor="middle">Data</text>
<rect x="125" y="58" width="80" height="30" rx="5" class="fb sb"/><text x="165" y="78" text-anchor="middle">Program</text>
<rect x="225" y="58" width="75" height="30" rx="5" class="fg sg"/><text x="262" y="78" text-anchor="middle">Answers</text>
<line x1="90" y1="47" x2="123" y2="66" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="90" y1="99" x2="123" y2="80" stroke="currentColor" marker-end="url(#mi-ah)"/>
<line x1="205" y1="73" x2="223" y2="73" stroke="currentColor" marker-end="url(#mi-ah)"/>
<text x="10" y="145" class="tm">a person writes "approve if income ≥ 50"</text>
<line x1="315" y1="10" x2="315" y2="150" stroke="currentColor" opacity="0.2"/>
<text x="330" y="18" font-weight="700">Machine learning</text>
<rect x="330" y="32" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="370" y="52" text-anchor="middle">Data</text>
<rect x="330" y="84" width="80" height="30" rx="5" class="fs" stroke="currentColor"/><text x="370" y="104" text-anchor="middle">Answers</text>
<rect x="440" y="58" width="70" height="30" rx="5" class="ft st"/><text x="475" y="78" text-anchor="middle">Train</text>
<rect x="535" y="58" width="75" height="30" rx="5" class="fv" stroke="currentColor"/><text x="572" y="78" text-anchor="middle">Model</text>
<line x1="410" y1="47" x2="438" y2="66" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="410" y1="99" x2="438" y2="80" stroke="currentColor" marker-end="url(#mi-ah)"/>
<line x1="510" y1="73" x2="533" y2="73" stroke="currentColor" marker-end="url(#mi-ah)"/>
<text x="330" y="145" class="tm">the data picks "approve if income ≥ 38"</text>
</svg><figcaption>Classic code turns rules + data into answers. Machine learning turns data + past answers into the rule (the model), which is then used like a program.</figcaption></figure>

  <h3>The formal definition</h3>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Machine learning</strong> (Tom Mitchell, 1997): a program <em>learns</em> from experience E with respect to a task T and a performance measure P if its performance at T, measured by P, improves with E. In the loan example: T = approve or decline an applicant, E = the 8 past loans, P = number of wrong decisions (it fell from 3 for the hand rule to 1). In symbols: find a function f so that f(x) ≈ y for new pairs (x, y) drawn from the same source as the examples.</p>
  </div>
  <p>Three things are always present, even in the largest models: a <strong>family of candidate rules</strong> (here: all cut-offs; in a neural network: all settings of millions of weights), a <strong>score</strong> for how wrong a candidate is on the examples (here: mistakes), and a <strong>search method</strong> (here: try all; usually something smarter, like the gradient descent of <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>).</p>

  <h3>When to use ML and when to write rules</h3>
  <table class="tbl">
    <tr><th>Use ML when…</th><th>Write rules when…</th></tr>
    <tr><td>The rule is unknown or too complex to write (spam, fraud, faces, speech)</td><td>A clear rule exists and is stable ("age &lt; 18 → reject", tax slabs)</td></tr>
    <tr><td>You have many past examples with the correct answer, or a way to get them</td><td>There is no data, or no way to tell a right answer from a wrong one</td></tr>
    <tr><td>The pattern drifts and the system must keep adapting (new fraud tricks)</td><td>Every decision must be exactly explainable or legally fixed</td></tr>
    <tr><td>Some mistakes are acceptable and cheaper than a human checking every case</td><td>A single mistake is unacceptable (safety interlocks)</td></tr>
  </table>
  <div class="callout pred"><span class="label">Example</span>
    <p>Spam filter. A rule "contains FREE → spam" breaks the day spammers write "FR33" and also blocks the HR email "free lunch on Friday". A model trained on 50,000 labelled emails weighs hundreds of weak signals (words, links, sender history) at once and is retrained as tricks change. Hand rules still sit alongside it for hard policy ("block this sender").</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"ML is always better than rules." It is not. If the manager's rule had been right (repayment really depended on a known policy), the learned rule could only match it, and would cost data, monitoring and explanation work. Also notice: learning picked the best rule <em>of the shape we allowed</em>. If repayment depends on income and existing debt, no single income cut-off can find it. The choice of rule family (the model type) is your decision, and later groups of the track are mostly about which family to choose.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We used words like "feature", "label" and "model" loosely. Every later note uses them precisely, and interviewers check that you know the difference between a parameter and a hyperparameter.</div>

  <h2 id="mi-vocab"><span class="num">02</span>Key Vocabulary</h2>
  <h3>Samples, features, labels</h3>
  <p>Picture a spreadsheet. Each <strong>row</strong> is one thing you have seen: one past loan, one email, one day of sales. Each <strong>column</strong> is one fact about it. One special column is the answer you want to predict next time.</p>
  <table class="tbl">
    <tr><th>Word (and synonyms)</th><th>Plain meaning</th><th>Loan example</th><th>Tea-stall example</th></tr>
    <tr><td><strong>Sample</strong> (row, example, instance, observation, record)</td><td>One case</td><td>One past applicant</td><td>One day</td></tr>
    <tr><td><strong>Feature</strong> (input, predictor, attribute, independent variable, column of X)</td><td>A fact known <em>before</em> the answer</td><td>Income</td><td>Temperature</td></tr>
    <tr><td><strong>Label</strong> (target, output, response, dependent variable, y)</td><td>The answer to predict</td><td>Repaid? (0/1)</td><td>Cups of tea sold</td></tr>
    <tr><td><strong>Dataset</strong></td><td>All rows together</td><td>The 8 loans</td><td>The 5 days</td></tr>
    <tr><td><strong>Model</strong> (hypothesis, estimator in sklearn)</td><td>The learned rule f</td><td>"approve if income ≥ 38"</td><td>"cups = 260 − 5 × temp"</td></tr>
    <tr><td><strong>Prediction</strong> (ŷ, "y-hat")</td><td>The model's answer for a row</td><td>Approve / decline</td><td>120 cups</td></tr>
  </table>
  <h3>The feature matrix X and the label vector y</h3>
  <p>Libraries want the inputs as a table of numbers called <strong>X</strong> with shape <code>(n_samples, n_features)</code>: one row per sample, one column per feature. Capital X because it is a matrix (2-D). The answers go in <strong>y</strong>, lowercase because it is a vector (1-D), with shape <code>(n_samples,)</code>. Row i of X goes with entry i of y. For the tea stall, 5 days and 1 feature: X is 5 × 1 and y has 5 entries. Even a single feature must be 2-D, which is why the code writes <code>[[20], [25], …]</code> and not <code>[20, 25, …]</code>.</p>
  <h3>Parameters vs hyperparameters</h3>
  <p>This pair is the most-asked vocabulary question. Both are "settings" of a model; the difference is <strong>who sets them and when</strong>.</p>
  <table class="tbl">
    <tr><th></th><th>Parameter</th><th>Hyperparameter</th></tr>
    <tr><td>Set by</td><td>The training algorithm, from the data</td><td>You, before training starts</td></tr>
    <tr><td>Loan stump</td><td>The cut-off 38</td><td>"use only one question" (max_depth = 1)</td></tr>
    <tr><td>Tea line</td><td>Slope w = −5, intercept b = 260</td><td>Whether to fit an intercept at all</td></tr>
    <tr><td>k-nearest neighbours</td><td>None in the usual sense: the stored rows are the model</td><td>k, the number of neighbours</td></tr>
    <tr><td>Neural network</td><td>Millions of weights</td><td>Layers, learning rate, epochs</td></tr>
    <tr><td>Chosen how</td><td><code>fit</code> minimises a loss on the training rows</td><td>Try several values, compare on <em>validation</em> data (<a class="xref" data-note="ml_splits">next note</a>)</td></tr>
    <tr><td>In sklearn</td><td>Attributes ending in <code>_</code> after fit: <code>coef_</code>, <code>intercept_</code>, <code>tree_</code></td><td>Constructor arguments: <code>KNeighborsRegressor(n_neighbors=2)</code>; read with <code>get_params()</code></td></tr>
  </table>
  <p>Check one prediction by hand before running code. kNN with k = 2 for a 28 °C day: the two closest past days are 25 °C (137 cups) and 30 °C (112 cups). Their average is (137 + 112) / 2 = 124.5 cups.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

X = np.array([[20], [25], [30], [35], [40]])   # feature matrix: 5 samples x 1 feature
y = np.array([158, 137, 112, 83, 60])          # label vector: one answer per sample
print("X shape:", X.shape, " y shape:", y.shape)

lin = LinearRegression(fit_intercept=True)     # hyperparameter: chosen by YOU, before training
print("hyperparameters:", lin.get_params())
lin.fit(X, y)                                  # training learns the parameters
print("parameters learned:", "coef_ =", lin.coef_, " intercept_ =", round(lin.intercept_, 6))

knn = KNeighborsRegressor(n_neighbors=2)       # hyperparameter k = 2
knn.fit(X, y)                                  # "training" = remember the rows
print("kNN stored", knn.n_samples_fit_, "rows; 28 °C -&gt;", knn.predict([[28]]))</div>
  <div class="fx" data-lang="text">X shape: (5, 1)  y shape: (5,)
hyperparameters: {'copy_X': True, 'fit_intercept': True, 'n_jobs': None, 'positive': False, 'tol': 1e-06}
parameters learned: coef_ = [-5.]  intercept_ = 260.0
kNN stored 5 rows; 28 °C -&gt; [124.5]</div>
  <p>Read the output top to bottom. X is 5 rows × 1 column, y has 5 entries. <code>get_params()</code> lists the hyperparameters, all of which existed before any data was seen. After <code>fit</code>, the learned parameters appear as <code>coef_ = -5</code> and <code>intercept_ = 260</code>. The kNN model learned no numbers at all: it stored the 5 rows and answers 124.5, exactly the hand result.</p>
  <h3>Training and inference</h3>
  <p><strong>Training</strong> (fitting, learning) is the one-off, expensive step: search for the parameters using labelled rows. <strong>Inference</strong> (prediction, scoring, serving) is applying the fixed model to new rows, usually many times and fast. In production they often run on different machines and schedules: a model is trained weekly on a big machine, then serves thousands of predictions a second from a small one.</p>
  <h3>Parametric vs non-parametric</h3>
  <p>A <strong>parametric</strong> model has a fixed number of parameters no matter how much data you give it: a straight line has 2, whether trained on 5 days or 5 million. A <strong>non-parametric</strong> model grows with the data: kNN stores every row, a decision tree can add more leaves. Parametric models are small and fast but assume a shape; non-parametric models assume less but need more data and memory.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parameters</strong> θ are the numbers inside f that training estimates from data. <strong>Hyperparameters</strong> are the choices that define the family of f and the training procedure; they are fixed during a single fit and selected by comparing fits on held-out data. <strong>Training</strong> = computing θ from (X, y). <strong>Inference</strong> = computing ŷ = f(x; θ) for a new x.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tuning a hyperparameter on the training score. A kNN with k = 1 always scores perfectly on its own training rows (each row's nearest neighbour is itself), so the training score would always pick k = 1. Hyperparameters must be chosen on data the model did not fit.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> "Search for the rule with the lowest error" worked for 9 cut-offs. A line has two numbers that can take any value, so we cannot try them all. We need a precise "how wrong" score and a smarter search.</div>

  <h2 id="mi-learn"><span class="num">03</span>How a Model Learns</h2>
  <h3>Step 1: a score for "how wrong" (the loss)</h3>
  <p>A tea stall near a college records five days: hotter days sell fewer cups.</p>
  <table class="tbl out"><caption>Tea stall data</caption>
    <tr><th>Temperature x (°C)</th><td>20</td><td>25</td><td>30</td><td>35</td><td>40</td></tr>
    <tr><th>Cups sold y</th><td>158</td><td>137</td><td>112</td><td>83</td><td>60</td></tr>
  </table>
  <p>For numbers, the usual "how wrong" score is the <strong>mean squared error</strong>: for each day, take the miss (actual − predicted), square it so misses in both directions count and big misses count more, then average. MSE = (1/n) Σ (yᵢ − ŷᵢ)². Score three candidate lines by hand:</p>
  <table class="tbl out"><caption>Three candidate rules, scored by hand</caption>
    <tr><th>Rule</th><th>Predictions for 20, 25, 30, 35, 40</th><th>Misses y − ŷ</th><th>Squared</th><th>MSE</th></tr>
    <tr><td>A: 200 − 3x</td><td>140, 125, 110, 95, 80</td><td>18, 12, 2, −12, −20</td><td>324, 144, 4, 144, 400</td><td>1016 / 5 = 203.2</td></tr>
    <tr><td><strong>B: 260 − 5x</strong></td><td>160, 135, 110, 85, 60</td><td>−2, 2, 2, −2, 0</td><td>4, 4, 4, 4, 0</td><td><strong>16 / 5 = 3.2</strong></td></tr>
    <tr><td>C: 280 − 6x</td><td>160, 130, 100, 70, 40</td><td>−2, 7, 12, 13, 20</td><td>4, 49, 144, 169, 400</td><td>766 / 5 = 153.2</td></tr>
  </table>
  <p>Rule B is far better. But is it the <em>best</em> of all possible lines? There are infinitely many lines, so we cannot score them all.</p>
  <h3>Step 2: search smartly (least squares by hand)</h3>
  <p>For a straight line and squared error, calculus gives the best line directly (derived in <a class="xref" data-note="ml_regression">Linear Regression</a>): slope w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², intercept b = ȳ − w·x̄. In words: the slope is "how x and y move together" divided by "how much x moves on its own".</p>
  <table class="tbl out"><caption>Least squares by hand (x̄ = 150/5 = 30, ȳ = 550/5 = 110)</caption>
    <tr><th>x</th><th>y</th><th>x − x̄</th><th>y − ȳ</th><th>(x − x̄)(y − ȳ)</th><th>(x − x̄)²</th></tr>
    <tr><td>20</td><td>158</td><td>−10</td><td>48</td><td>−480</td><td>100</td></tr>
    <tr><td>25</td><td>137</td><td>−5</td><td>27</td><td>−135</td><td>25</td></tr>
    <tr><td>30</td><td>112</td><td>0</td><td>2</td><td>0</td><td>0</td></tr>
    <tr><td>35</td><td>83</td><td>5</td><td>−27</td><td>−135</td><td>25</td></tr>
    <tr><td>40</td><td>60</td><td>10</td><td>−50</td><td>−500</td><td>100</td></tr>
    <tr><td colspan="4"><strong>Sum</strong></td><td><strong>−1250</strong></td><td><strong>250</strong></td></tr>
  </table>
  <p>w = −1250 / 250 = −5 cups per degree. b = 110 − (−5)(30) = 260. So rule B, with MSE 3.2, is the best possible line: no other line has a lower MSE on these five days. For a 28 °C day the model predicts 260 − 5 × 28 = 120 cups.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

temp = np.array([20, 25, 30, 35, 40])        # X: temperature in °C
cups = np.array([158, 137, 112, 83, 60])     # y: cups of tea sold that day

# three candidate rules, scored by mean squared error (MSE)
for name, b, w in [("A", 200, -3), ("B", 260, -5), ("C", 280, -6)]:
    pred = b + w * temp
    print(f"rule {name}: cups = {b} + ({w})*temp  preds={pred.tolist()}  MSE={np.mean((cups - pred)**2):.1f}")

# least squares by formula
w = np.sum((temp - temp.mean()) * (cups - cups.mean())) / np.sum((temp - temp.mean())**2)
b = cups.mean() - w * temp.mean()
print("formula:  w =", w, " b =", b)

model = LinearRegression().fit(temp.reshape(-1, 1), cups)    # training
print("sklearn:  w =", model.coef_[0].round(6), " b =", model.intercept_.round(6))
print("28 °C -&gt;", model.predict([[28]]).round(1))            # inference</div>
  <div class="fx" data-lang="text">rule A: cups = 200 + (-3)*temp  preds=[140, 125, 110, 95, 80]  MSE=203.2
rule B: cups = 260 + (-5)*temp  preds=[160, 135, 110, 85, 60]  MSE=3.2
rule C: cups = 280 + (-6)*temp  preds=[160, 130, 100, 70, 40]  MSE=153.2
formula:  w = -5.0  b = 260.0
sklearn:  w = -5.0  b = 260.0
28 °C -&gt; [120.]</div>
  <p>The three hand MSEs, the formula and sklearn all agree: w = −5, b = 260, and 120 cups at 28 °C. Most models have no neat formula, so they search with <strong>gradient descent</strong>: start somewhere, check which way the loss goes down, take a small step, repeat. That is the subject of <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>.</p>
  <h3>Step 3: the real goal is new data (generalisation)</h3>
  <p>A low loss on the five recorded days is not the point. The owner cares about tomorrow. A rule that does well on rows it has never seen is said to <strong>generalise</strong>. A flexible enough model can drive the training loss to zero by memorising (a curve through all five points exactly) and still be useless tomorrow. Measuring generalisation honestly is the job of <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>; understanding why models fail to generalise is <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  <div class="flow"><span>Choose a family of rules (model type)</span><span>Define a loss (how wrong)</span><span>Search for the lowest training loss (fit)</span><span>Check on unseen data (generalisation)</span></div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every algorithm in this track is these four boxes with different choices. Linear regression: lines + squared loss + a formula. Logistic regression: S-curves + log-loss + gradient descent. Decision trees: boxes + impurity + greedy splitting. k-means: k centres + within-cluster distance + alternating updates. Once you see the boxes, a new algorithm is just new answers to four questions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Equating "the model fit the data well" with "the model is good". Fit is measured on the rows used for training, so it is always optimistic. Quote a score only from rows the model never saw.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Both examples had the answer for every row. Many real problems have no answers at all, only a few, or only a reward that arrives later. That gives the different types of learning.</div>

  <h2 id="mi-types"><span class="num">04</span>Types of Learning</h2>
  <p>Think of three ways you learnt as a child: with a teacher who checked your answers, by sorting a pile of things into groups on your own, and by trial and error, like learning to ride a bicycle. Machine learning has the same three main types, plus two in-between types that matter a lot today.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<rect x="245" y="10" width="150" height="34" rx="8" class="fv" stroke="currentColor"/><text x="320" y="32" text-anchor="middle" font-weight="700">Machine Learning</text>
<g stroke="currentColor"><line x1="280" y1="44" x2="110" y2="70"/><line x1="320" y1="44" x2="320" y2="70"/><line x1="360" y1="44" x2="530" y2="70"/></g>
<rect x="20" y="70" width="180" height="36" rx="7" class="fb sb"/><text x="110" y="86" text-anchor="middle" font-weight="700">Supervised</text><text x="110" y="100" text-anchor="middle" class="tm" font-size="11">labels (X, y)</text>
<rect x="230" y="70" width="180" height="36" rx="7" class="ft st"/><text x="320" y="86" text-anchor="middle" font-weight="700">Unsupervised</text><text x="320" y="100" text-anchor="middle" class="tm" font-size="11">X only</text>
<rect x="440" y="70" width="180" height="36" rx="7" class="fg sg"/><text x="530" y="86" text-anchor="middle" font-weight="700">Reinforcement</text><text x="530" y="100" text-anchor="middle" class="tm" font-size="11">actions + rewards</text>
<g stroke="currentColor"><line x1="80" y1="106" x2="60" y2="128"/><line x1="140" y1="106" x2="160" y2="128"/><line x1="290" y1="106" x2="270" y2="128"/><line x1="350" y1="106" x2="370" y2="128"/></g>
<rect x="10" y="128" width="100" height="40" rx="6" class="fs" stroke="currentColor"/><text x="60" y="145" text-anchor="middle" font-size="12">Regression</text><text x="60" y="160" text-anchor="middle" class="tm" font-size="10.5">a number</text>
<rect x="115" y="128" width="100" height="40" rx="6" class="fs" stroke="currentColor"/><text x="165" y="145" text-anchor="middle" font-size="12">Classification</text><text x="165" y="160" text-anchor="middle" class="tm" font-size="10.5">a class</text>
<rect x="220" y="128" width="100" height="40" rx="6" class="fs" stroke="currentColor"/><text x="270" y="145" text-anchor="middle" font-size="12">Clustering</text><text x="270" y="160" text-anchor="middle" class="tm" font-size="10.5">groups</text>
<rect x="325" y="128" width="100" height="40" rx="6" class="fs" stroke="currentColor"/><text x="375" y="145" text-anchor="middle" font-size="12">Dim. reduction</text><text x="375" y="160" text-anchor="middle" class="tm" font-size="10.5">fewer columns</text>
<rect x="440" y="128" width="180" height="40" rx="6" class="fs" stroke="currentColor"/><text x="530" y="145" text-anchor="middle" font-size="12">Policy learning</text><text x="530" y="160" text-anchor="middle" class="tm" font-size="10.5">games, robots, bidding</text>
<rect x="110" y="186" width="420" height="34" rx="7" class="fr sr" fill-opacity="0.5"/><text x="320" y="202" text-anchor="middle" font-size="12">In between: semi-supervised (few labels) · self-supervised (labels made from data)</text><text x="320" y="215" text-anchor="middle" class="tm" font-size="10.5">use cheap unlabelled data to help</text>
</svg><figcaption>The family tree of learning types. The type is decided by what the data gives you: answers, no answers, or rewards.</figcaption></figure>

  <h3>Supervised learning: regression and classification</h3>
  <p>Every training row comes with the right answer. The model learns the mapping X → y. Both examples so far were supervised.</p>
  <ul>
    <li><strong>Regression</strong>: y is a number on a scale. Tea cups (120), house price, delivery time, tomorrow's demand. Group 2 of the track.</li>
    <li><strong>Classification</strong>: y is one of a fixed set of classes. Repaid or not, spam or not, which of 10 digits. Two classes is <em>binary</em>; more is <em>multiclass</em>; several yes/no answers per row (a movie can be both "comedy" and "romance") is <em>multilabel</em>. Group 3 of the track.</li>
  </ul>
  <p>A quick test: could the answer be "halfway between" two answers? 120.5 cups makes sense (regression); "halfway between spam and not spam" does not (classification). Note that classifiers usually output a <em>probability</em> (0.83 chance of spam) and a cut-off turns it into a class, covered in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>

  <h3>Unsupervised learning: structure without answers</h3>
  <p>Only X, no y. The model looks for structure: groups of similar rows (<strong>clustering</strong>), a smaller set of columns that keeps most of the information (<strong>dimensionality reduction</strong>), or rows that do not fit the usual pattern (<strong>anomaly detection</strong>).</p>
  <p>By hand: six customers, (visits per month, spend in ₹ hundreds): (2,3), (3,2), (2,2), (9,8), (8,9), (9,9). Nobody labelled them, but plotting them shows two tight groups. The centre of each group is the average of its members: group 1 = ((2+3+2)/3, (3+2+2)/3) = (2.33, 2.33), group 2 = ((9+8+9)/3, (8+9+9)/3) = (8.67, 8.67). The business can now name them: "occasional" and "loyal".</p>
  <p>The code below runs k-means (the standard clustering algorithm, <a class="xref" data-note="ml_kmeans">K-Means</a>) on those six customers, then shows semi-supervised learning, which is explained after the output.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.model_selection import train_test_split

# Unsupervised: 6 customers, (visits per month, spend in ₹ hundred). No labels.
X = np.array([[2, 3], [3, 2], [2, 2], [9, 8], [8, 9], [9, 9]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print("cluster of each customer:", km.labels_)
print("cluster centres:\n", km.cluster_centers_.round(2))

# Semi-supervised: digits, only 50 of 1,347 training images keep their label
Xd, yd = load_digits(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(Xd, yd, test_size=0.25, stratify=yd, random_state=0)
rng = np.random.default_rng(0)
y_partial = np.full_like(ytr, -1)                    # -1 means "no label"
keep = rng.choice(len(ytr), 50, replace=False)
y_partial[keep] = ytr[keep]

sup = LogisticRegression(C=0.1, max_iter=2000).fit(Xtr[keep], ytr[keep])   # 50 rows only
semi = SelfTrainingClassifier(LogisticRegression(C=0.1, max_iter=2000),
                              threshold=0.7).fit(Xtr, y_partial)            # 50 + 1,297 unlabelled
print("labelled rows:", (y_partial != -1).sum(), "of", len(ytr))
print("supervised, 50 labels only   test acc:", round(sup.score(Xte, yte), 3))
print("self-training, 50 + unlabelled test acc:", round(semi.score(Xte, yte), 3))
print("rows given a pseudo-label:", int((semi.labeled_iter_ &gt; 0).sum()))</div>
  <div class="fx" data-lang="text">cluster of each customer: [1 1 1 0 0 0]
cluster centres:
 [[8.67 8.67]
 [2.33 2.33]]
labelled rows: 50 of 1347
supervised, 50 labels only   test acc: 0.844
self-training, 50 + unlabelled test acc: 0.884
rows given a pseudo-label: 1279</div>
  <p>K-means put the first three customers in one cluster and the last three in the other, with the same centres we computed by hand. The cluster numbers 0 and 1 are arbitrary names; there is no "right answer" to compare with, which is why judging clusters needs its own tools (<a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>).</p>

  <h3>Reinforcement learning (brief)</h3>
  <p>No labelled answers at all. An <strong>agent</strong> takes an <strong>action</strong> in an <strong>environment</strong>, receives a <strong>reward</strong>, and learns a <strong>policy</strong> (which action to take in which situation) that maximises total reward over time. The hard part is the <strong>explore-exploit</strong> dilemma: keep doing what has paid best so far, or try something else that might be better?</p>
  <table class="tbl out"><caption>By hand: a tea stall agent trying two prices, keeping the running average profit (₹) of each</caption>
    <tr><th>Day</th><th>Why this action</th><th>Price</th><th>Profit (reward)</th><th>Average for ₹10</th><th>Average for ₹15</th></tr>
    <tr><td>1</td><td>explore</td><td>₹10</td><td>500</td><td>500</td><td>–</td></tr>
    <tr><td>2</td><td>explore</td><td>₹15</td><td>450</td><td>500</td><td>450</td></tr>
    <tr><td>3</td><td>exploit (500 &gt; 450)</td><td>₹10</td><td>560</td><td>(500+560)/2 = 530</td><td>450</td></tr>
    <tr><td>4</td><td>explore again</td><td>₹15</td><td>630</td><td>530</td><td>(450+630)/2 = 540</td></tr>
    <tr><td>5</td><td>exploit (540 &gt; 530)</td><td>₹15</td><td>600</td><td>530</td><td>(450+630+600)/3 = 560</td></tr>
  </table>
  <p>Had the agent never explored again after day 3, it would have stuck with ₹10 forever on the evidence of one unlucky day. Full RL adds states (the best price may depend on weather) and delayed rewards (a move in chess pays off 30 moves later). It powers game-playing agents, robotics, ad bidding, and RLHF, the step that tunes large language models from human preferences. It is outside this track's scope.</p>
  <figure class="viz"><svg viewBox="0 0 420 120" width="420">
<defs><marker id="mi-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="70" y="65" text-anchor="middle">Agent</text>
<rect x="300" y="40" width="110" height="40" rx="6" class="ft st"/><text x="355" y="65" text-anchor="middle">Environment</text>
<path d="M120 50 C 180 15, 240 15, 298 50" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/><text x="210" y="22" text-anchor="middle">action (set price)</text>
<path d="M300 72 C 240 108, 180 108, 122 72" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/><text x="210" y="114" text-anchor="middle" class="tg">reward (profit) + new state</text>
</svg><figcaption>The reinforcement learning loop: no answer key, only rewards for the actions actually taken.</figcaption></figure>

  <h3>Semi-supervised learning</h3>
  <p>Labels cost money: a doctor must read each scan, a lawyer each contract. Often you have a few labelled rows and a mountain of unlabelled ones. <strong>Semi-supervised</strong> methods use both. The simplest is <strong>self-training</strong>: train on the labelled rows, predict the unlabelled ones, add the predictions the model is very sure about (probability above a threshold) as if they were labels ("pseudo-labels"), retrain, repeat.</p>
  <p>In the code above, the handwritten-digits data has 1,347 training images but we kept only 50 labels. A logistic regression trained on the 50 scores 0.844 on the test images. Self-training with a 0.7 confidence threshold pseudo-labelled 1,279 of the unlabelled images and reached 0.884: four points gained from data nobody labelled.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Self-training can also confirm its own mistakes: a confident wrong pseudo-label becomes training data and pulls the model further the wrong way. Always compare against the labelled-only model on a labelled test set, as done here.</p>
  </div>

  <h3>Self-supervised learning</h3>
  <p>The labels are made from the data itself, so no human labels anything. Take the sentence "I drink chai every morning". Hide a word and ask the model to fill it in: input "I drink ___ every morning", answer "chai" (BERT-style masked word). Or cut it and ask for the next word: input "I drink chai every", answer "morning" (GPT-style). One sentence gives several training pairs for free; the internet gives billions. Images work the same way: two random crops of one photo should get similar codes (contrastive learning). The model learned this way is then <em>fine-tuned</em> with a small labelled set. This is why large language models became possible (see <a class="xref" data-note="nlp">NLP</a> and <a class="xref" data-note="dl_attention">Attention</a>).</p>

  <h3>Other ways to slice ML</h3>
  <table class="tbl">
    <tr><th>Axis</th><th>One side</th><th>Other side</th></tr>
    <tr><td>How data arrives</td><td><strong>Batch (offline)</strong>: train on the full dataset, redeploy periodically</td><td><strong>Online</strong>: update the model row by row as data streams in (<code>partial_fit</code> in sklearn)</td></tr>
    <tr><td>How it generalises</td><td><strong>Instance-based</strong>: compare new rows to stored examples (kNN)</td><td><strong>Model-based</strong>: compress the data into parameters (a line, a tree)</td></tr>
    <tr><td>Size of the model</td><td><strong>Parametric</strong>: fixed number of parameters</td><td><strong>Non-parametric</strong>: grows with data</td></tr>
    <tr><td>What it outputs</td><td><strong>Discriminative</strong>: models P(y | x) directly (logistic regression)</td><td><strong>Generative</strong>: models how x arises for each class, P(x | y) (Naive Bayes, GMM)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Supervised</strong>: learn f: X → y from labelled pairs; regression if y is continuous, classification if y is categorical. <strong>Unsupervised</strong>: learn structure in X alone (clusters, low-dimensional representation, density). <strong>Reinforcement</strong>: learn a policy π(action | state) maximising expected cumulative reward from interaction. <strong>Semi-supervised</strong>: few labelled + many unlabelled rows. <strong>Self-supervised</strong>: a supervised task whose labels are generated automatically from the inputs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Predicting a rating 1–5 stars is classification because the values are whole numbers." It depends on the loss you care about: predicting 4 when the truth is 5 is less wrong than predicting 1, so it is usually treated as regression (or ordinal regression). The type follows the meaning of the answer, not its data type. Likewise, a zip code stored as a number is a category.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have the ideas but not the job. Fitting the model is maybe a tenth of a real project. What happens before and after <code>fit</code>?</div>

  <h2 id="mi-flow"><span class="num">05</span>The ML Workflow End to End</h2>
  <p>Think of running a tiffin service. You decide what to cook and for whom, buy and check vegetables, prepare, cook, taste, deliver, and keep listening to customers because tastes change. An ML project has the same shape, and it never really ends: monitoring sends you back to the start.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
<defs><marker id="mi-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<g text-anchor="middle" font-size="12.5">
<rect x="10" y="20" width="120" height="36" rx="5" class="fv" stroke="currentColor"/><text x="70" y="43">1 Frame problem</text>
<rect x="160" y="20" width="120" height="36" rx="5" class="fs" stroke="currentColor"/><text x="220" y="43">2 Data &amp; EDA</text>
<rect x="310" y="20" width="120" height="36" rx="5" class="fs" stroke="currentColor"/><text x="370" y="43">3 Features</text>
<rect x="460" y="20" width="130" height="36" rx="5" class="fb sb"/><text x="525" y="38">4 Split, baseline,</text><text x="525" y="51">train, tune</text>
<rect x="460" y="104" width="130" height="36" rx="5" class="fb sb"/><text x="525" y="127">5 Evaluate (test once)</text>
<rect x="310" y="104" width="120" height="36" rx="5" class="fg sg"/><text x="370" y="127">6 Deploy</text>
<rect x="160" y="104" width="120" height="36" rx="5" class="fr sr"/><text x="220" y="127">7 Monitor</text>
</g>
<g stroke="currentColor" marker-end="url(#mi-ah3)">
<line x1="130" y1="38" x2="158" y2="38"/><line x1="280" y1="38" x2="308" y2="38"/><line x1="430" y1="38" x2="458" y2="38"/>
<line x1="525" y1="56" x2="525" y2="102"/><line x1="460" y1="122" x2="432" y2="122"/><line x1="310" y1="122" x2="282" y2="122"/>
<path d="M160 122 L70 122 L70 58" fill="none" stroke-dasharray="4 3"/>
</g>
<text x="76" y="100" class="tr" font-size="11">drift → retrain / reframe</text>
</svg><figcaption>The ML life cycle. The dashed arrow is what separates real projects from course exercises: after launch you watch, and go back.</figcaption></figure>

  <h3>1. Problem framing</h3>
  <p>Before any data, answer in writing: <strong>what decision</strong> will the model change, <strong>what exactly</strong> is predicted (the target definition), <strong>for which unit</strong> (customer, order, day), <strong>how far ahead</strong> (horizon), <strong>what counts as success</strong> in money or time, and <strong>what a mistake of each kind costs</strong>. Many projects fail here: the model is accurate but predicts something nobody can act on.</p>
  <p>Worked example. A telecom company wants to reduce churn (customers leaving). Framing: "Every Monday, for each active prepaid customer, predict the probability they make no recharge in the next 30 days; the retention team calls those above a cut-off and offers a ₹200 discount." Suppose a call with an offer saves the customer half the time, and a saved customer is worth ₹3,000. For a customer with churn probability p:</p>
  <p style="text-align:center">expected gain of calling = p × 0.5 × 3000 − 200 = 1500·p − 200</p>
  <p>It pays to call when 1500·p − 200 &gt; 0, that is p &gt; 200 / 1500 = 0.133. So the model does not need to be sure; a 20% churn risk is already worth a call. This number will set the decision threshold later (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>) and tells you that <em>probabilities</em>, not just yes/no answers, are needed.</p>
  <h3>2. Data collection and exploratory analysis (EDA)</h3>
  <p>Gather the rows, then look before modelling: how many rows and columns, missing values, impossible values (age −3), duplicates, how rare the positive class is, how values change over time, and whether the data you will have <em>at prediction time</em> matches the training columns. A feature that is filled in only after the customer has churned (say "reason for leaving") must not be used: that is leakage (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  <h3>3. Features</h3>
  <p>Turn raw data into model inputs: scale numbers, encode categories, fill gaps, build ratios and counts ("recharges in the last 7 days"). Good features usually help more than a fancier algorithm. See <a class="xref" data-note="ml_features">Feature Engineering</a>.</p>
  <h3>4. Split, baseline, train and tune</h3>
  <p>Lock away a test set first (<a class="xref" data-note="ml_splits">next note</a>). Build a <strong>baseline</strong>: the simplest possible predictor, such as "always predict the most common class" or "always predict the average". Then try real models in order of complexity (linear/logistic, then trees and boosting), compare them with cross-validation, and tune hyperparameters on validation folds.</p>
  <div class="callout pred"><span class="label">Example</span>
    <p>Baseline in numbers. If 95 of 100 loans are repaid, "always approve" is 95% accurate. A model with 94% accuracy is then worse than doing nothing, however clever it looks. You only know that if you computed the baseline.</p>
  </div>
  <h3>5. Evaluate</h3>
  <p>Score the chosen model once on the locked test set, with metrics that match the costs from step 1 (recall if misses are expensive, precision if false alarms are). See <a class="xref" data-note="ml_evaluation">Classification Metrics</a> and <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>. Also check slices: is it equally good for new and old customers, for each region?</p>
  <h3>6. Deploy</h3>
  <p>Put the model where decisions happen. <strong>Batch</strong>: score all customers every night and write results to a table (churn lists). <strong>Online</strong>: an API answers each request in milliseconds (fraud check at payment). <strong>Edge</strong>: the model runs on the phone (keyboard suggestions). Save the full pipeline (preprocessing + model) as one versioned file so training and serving compute features identically, and roll out carefully: shadow mode (predict but do not act), then a small share of traffic, ideally as an A/B test (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</p>
  <h3>7. Monitor</h3>
  <p>The world changes after launch. A food-delivery time model trained in winter fails in the monsoon: roads flood and the same 3 km takes 40 minutes, not 15. Three kinds of change, using P(·) to mean "how something is spread out":</p>
  <table class="tbl">
    <tr><th>Shift</th><th>What changes</th><th>Plain words</th><th>Example</th><th>How you notice</th></tr>
    <tr><td><strong>Covariate (data) drift</strong></td><td>P(X)</td><td>Different inputs, same rule</td><td>More orders from far areas</td><td>Input statistics (PSI)</td></tr>
    <tr><td><strong>Label (prior) shift</strong></td><td>P(y)</td><td>An answer becomes more or less common</td><td>Fraud rate doubles in festival season</td><td>Prediction averages, late labels</td></tr>
    <tr><td><strong>Concept drift</strong></td><td>P(y | X)</td><td>Same inputs now mean a different answer</td><td>Flooded roads: same distance, longer time</td><td>Only fresh labels show it</td></tr>
  </table>
  <p>The <strong>Population Stability Index</strong> (PSI) is the standard one-number check for input drift. Cut a feature into bins using the training data, record each bin's share at training time (e) and now (a), and add up (a − e) × ln(a / e). Both factors have the same sign, so every term is ≥ 0, and bins that changed a lot dominate.</p>
  <table class="tbl out"><caption>PSI by hand for "delivery distance", 4 bins</caption>
    <tr><th>Bin</th><th>Training share e</th><th>This week a</th><th>a − e</th><th>ln(a/e)</th><th>Term</th></tr>
    <tr><td>0–2 km</td><td>0.40</td><td>0.25</td><td>−0.15</td><td>ln 0.625 = −0.470</td><td>0.0705</td></tr>
    <tr><td>2–4 km</td><td>0.30</td><td>0.30</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>4–6 km</td><td>0.20</td><td>0.25</td><td>0.05</td><td>ln 1.25 = 0.223</td><td>0.0112</td></tr>
    <tr><td>6+ km</td><td>0.10</td><td>0.20</td><td>0.10</td><td>ln 2 = 0.693</td><td>0.0693</td></tr>
    <tr><td colspan="5"><strong>PSI</strong></td><td><strong>0.151</strong></td></tr>
  </table>
  <p>Common rule of thumb: PSI &lt; 0.1 stable, 0.1–0.25 moderate shift (investigate), &gt; 0.25 major shift (likely retrain). 0.151 says orders are getting longer: investigate. The code checks both hand calculations from this section.</p>
  <div class="fx" data-lang="py">import numpy as np

# Problem framing: is it worth calling a customer with churn probability p?
offer_cost, saved_value, success = 200, 3000, 0.5
for p in [0.05, 0.10, 0.20, 0.50]:
    gain = p * success * saved_value - offer_cost
    print(f"p={p:.3f}  expected gain of calling = ₹{gain:7.1f}")
print("break-even p =", round(offer_cost / (success * saved_value), 4))

# Monitoring: Population Stability Index of one input column
expected = np.array([0.40, 0.30, 0.20, 0.10])   # share per bin at training time
actual   = np.array([0.25, 0.30, 0.25, 0.20])   # share per bin this week
terms = (actual - expected) * np.log(actual / expected)
print("PSI terms:", terms.round(4), " PSI =", round(terms.sum(), 4))</div>
  <div class="fx" data-lang="text">p=0.050  expected gain of calling = ₹ -125.0
p=0.100  expected gain of calling = ₹  -50.0
p=0.200  expected gain of calling = ₹  100.0
p=0.500  expected gain of calling = ₹  550.0
break-even p = 0.1333
PSI terms: [0.0705 0.     0.0112 0.0693]  PSI = 0.151</div>
  <p>Calling a 5% or 10% risk customer loses money on average; a 20% risk customer gains ₹100. The break-even is 0.1333, as derived. The PSI terms match the table: 0.0705 + 0 + 0.0112 + 0.0693 = 0.151.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Concept drift is the dangerous one: inputs look normal, so PSI stays green while accuracy falls. You need real outcomes (even if they arrive weeks late) tracked over a rolling window, and an alert on that metric. Also, PSI with an empty bin divides by zero; libraries add a tiny number to every share.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spending 90% of the effort on step 4. Real projects fail at the ends: a badly framed target (step 1), training data that does not look like live data (step 2), or a silent decline nobody watches (step 7). A simple model that is well framed and monitored beats a clever one that is not.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Enough description. Let us run steps 2 to 6 for real on a medical dataset, in one script, and read every line of the output.</div>

  <h2 id="mi-first"><span class="num">06</span>A First Model, End to End</h2>
  <p>The task: from 30 measurements of a breast tumour taken from a scan, predict whether it is malignant (cancer) or benign. Missing a cancer is the worst mistake, so besides <strong>accuracy</strong> (share of all answers that were right) we track <strong>recall</strong>: of all real cancers, the share the model caught. Both are explained fully in <a class="xref" data-note="ml_evaluation">Classification Metrics</a>.</p>
  <div class="flow"><span>Look at the data</span><span>Lock a test set</span><span>Baseline + candidates, 5-fold CV</span><span>Refit winner</span><span>Test once</span><span>Inspect, save, reload</span></div>
  <p>New tools used, each in one line: <code>StratifiedKFold</code> + <code>cross_val_score</code> score a model on 5 different train/validation cuts of the training data (<a class="xref" data-note="ml_splits">next note</a>); <code>DummyClassifier</code> is the baseline; <code>make_pipeline(StandardScaler(), LogisticRegression())</code> chains "rescale every column to mean 0, SD 1" and "logistic regression" so they always run together (<a class="xref" data-note="ml_pipelines">Pipelines</a>, <a class="xref" data-note="ml_classification">Logistic Regression</a>); <code>RandomForestClassifier</code> is an average of 200 decision trees (<a class="xref" data-note="ml_rf">Random Forest</a>); <code>joblib</code> saves a fitted model to a file.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, joblib
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.dummy import DummyClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score, confusion_matrix

# 1. Data: 569 tumours, 30 measurements each
X, y = load_breast_cancer(return_X_y=True, as_frame=True)
y = 1 - y                                     # make 1 = malignant (the case we must catch)
print(X.shape, "malignant share:", round(y.mean(), 3))
print("missing values:", int(X.isna().sum().sum()))
print(X[["mean radius", "mean texture", "mean area"]].describe().loc[["mean", "std", "min", "max"]].round(1))

# 2. Lock the test set away first
X_tr, X_test, y_tr, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
print("train", X_tr.shape, "test", X_test.shape)

# 3. Candidates, compared by 5-fold cross-validation on the TRAINING part only
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
models = {
    "baseline": DummyClassifier(strategy="most_frequent"),
    "logreg":   make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "forest":   RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=1),
}
for name, m in models.items():
    acc = cross_val_score(m, X_tr, y_tr, cv=cv, scoring="accuracy", n_jobs=1)
    rec = cross_val_score(m, X_tr, y_tr, cv=cv, scoring="recall", n_jobs=1)
    print(f"{name:9s} CV acc {acc.mean():.3f} ± {acc.std():.3f}   recall {rec.mean():.3f}")

# 4. Refit the winner on all training rows, then touch the test set ONCE
best = models["logreg"].fit(X_tr, y_tr)
pred = best.predict(X_test)
print("TEST accuracy", round(accuracy_score(y_test, pred), 3), " recall", round(recall_score(y_test, pred), 3))
print("confusion matrix [[TN FP] [FN TP]]:\n", confusion_matrix(y_test, pred))
print("P(malignant), first 3 test rows:", best.predict_proba(X_test.iloc[:3])[:, 1].round(3))

# 5. What did it learn? (coefficients on standardised features)
coef = pd.Series(best[-1].coef_[0], index=X.columns)
top = coef.abs().sort_values(ascending=False).index[:3]
print(pd.DataFrame({"coef": coef[top].round(2), "odds_x": np.exp(coef[top]).round(2)}))

# 6. Save, reload, predict one new row (deployment in miniature)
joblib.dump(best, "tumour_model.joblib")
loaded = joblib.load("tumour_model.joblib")
print("reloaded model, row 0:", loaded.predict(X_test.iloc[[0]]), loaded.predict_proba(X_test.iloc[[0]]).round(3))</div>
  <div class="fx" data-lang="text">(569, 30) malignant share: 0.373
missing values: 0
      mean radius  mean texture  mean area
mean         14.1          19.3      654.9
std           3.5           4.3      351.9
min           7.0           9.7      143.5
max          28.1          39.3     2501.0
train (455, 30) test (114, 30)
baseline  CV acc 0.626 ± 0.000   recall 0.000
logreg    CV acc 0.978 ± 0.010   recall 0.959
forest    CV acc 0.958 ± 0.013   recall 0.935
TEST accuracy 0.965  recall 0.929
confusion matrix [[TN FP] [FN TP]]:
 [[71  1]
 [ 3 39]]
P(malignant), first 3 test rows: [0.    1.    0.043]
                coef  odds_x
worst texture   1.43    4.20
radius error    1.23    3.43
worst symmetry  1.06    2.89
reloaded model, row 0: [0] [[1. 0.]]</div>
  <p>Reading the output block by block:</p>
  <ul>
    <li><strong>Data</strong>: 569 rows, 30 features, 37.3% malignant, no missing values. The columns are on very different scales (mean area in the hundreds, texture around 19), which is why the logistic model gets a scaler and the forest does not need one.</li>
    <li><strong>Split</strong>: 455 rows for training, 114 locked away. <code>stratify=y</code> keeps 37% malignant in both parts.</li>
    <li><strong>Baseline</strong>: always saying "benign" is right 62.6% of the time and catches zero cancers (recall 0.000). Its spread is 0.000 because stratified folds all have the same class mix, so "always benign" scores the same in each. Any real model must beat 0.626 accuracy and, more importantly, recall 0.</li>
    <li><strong>Candidates</strong>: logistic regression 0.978 ± 0.010 with recall 0.959; the forest 0.958 ± 0.013 with recall 0.935. The ± is the spread over the 5 folds. Logistic regression wins on both, so it is chosen <em>before</em> looking at the test set.</li>
    <li><strong>Test, once</strong>: accuracy 0.965 = (71 + 39) / 114; recall 0.929 = 39 / (39 + 3). The confusion matrix shows 1 false alarm and 3 missed cancers. Slightly below the CV estimate, as is normal: the test set is a fresh, small sample (114 rows; one row = 0.9 points).</li>
    <li><strong>Probabilities</strong>: <code>predict_proba</code> gives a chance per row (0.043 = 4.3% malignant). For cancer screening you might flag anything above 0.1, catching more cancers at the cost of more false alarms; that is a business choice (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</li>
    <li><strong>What it learned</strong>: on standardised features, +1 SD of "worst texture" multiplies the odds of malignancy by e^1.43 ≈ 4.2 (odds ratios, <a class="xref" data-note="ml_classification">Logistic Regression</a>).</li>
    <li><strong>Save and reload</strong>: the reloaded pipeline gives the same answer. The scaler's means and SDs travel inside the file, so serving uses exactly the training preprocessing.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The order is the lesson: look, lock the test set, baseline, compare candidates on CV, choose, refit, test once, save. Every later note adds detail to one of these steps but never changes the order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trying the forest, then logistic regression, then a tuned forest, each time checking the <em>test</em> score and keeping the best. After a few rounds the test score is no longer an honest estimate: you have tuned on it. Decide with CV; touch the test set once.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> You have seen one model and one workflow. The track covers many model families and problem types. Where does each one fit, and in what order should you read them?</div>

  <h2 id="mi-track"><span class="num">07</span>The Map of the ML Track</h2>
  <p>The track has nine groups. The first five form the supervised spine that most jobs use daily; groups 6 and 7 cover learning without labels; groups 8 and 9 are applied problem types that reuse everything before them.</p>
  <figure class="viz"><svg viewBox="0 0 680 430" width="680">
<defs><marker id="mi-tm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="170" y="10" width="340" height="54" rx="9" class="fb sb" stroke-width="3"/>
<text x="340" y="32" text-anchor="middle" font-size="14" font-weight="700">1 · Foundations</text>
<text x="340" y="50" text-anchor="middle" font-size="11" class="tb">you are here · splits · bias-variance · loss · features · leakage</text>
<text x="175" y="92" text-anchor="middle" font-size="11" class="tm" font-weight="700">SUPERVISED (labels)</text>
<text x="510" y="92" text-anchor="middle" font-size="11" class="tm" font-weight="700">UNSUPERVISED (no labels)</text>
<rect x="20" y="100" width="145" height="48" rx="8" class="fs" stroke="currentColor"/><text x="92" y="120" text-anchor="middle" font-size="13">2 · Regression</text><text x="92" y="137" text-anchor="middle" font-size="10.5" class="tm">predict a number</text>
<rect x="185" y="100" width="145" height="48" rx="8" class="fs" stroke="currentColor"/><text x="257" y="120" text-anchor="middle" font-size="13">3 · Classification</text><text x="257" y="137" text-anchor="middle" font-size="10.5" class="tm">predict a class</text>
<rect x="20" y="178" width="310" height="48" rx="8" class="ft st"/><text x="175" y="198" text-anchor="middle" font-size="13">4 · Tree-Based Models</text><text x="175" y="215" text-anchor="middle" font-size="10.5" class="tm">trees → random forest → gradient boosting</text>
<rect x="20" y="256" width="310" height="48" rx="8" class="fg sg"/><text x="175" y="276" text-anchor="middle" font-size="13">5 · Model Evaluation</text><text x="175" y="293" text-anchor="middle" font-size="10.5" class="tm">metrics · thresholds · calibration</text>
<rect x="360" y="100" width="145" height="48" rx="8" class="fs" stroke="currentColor"/><text x="432" y="120" text-anchor="middle" font-size="13">6 · Clustering</text><text x="432" y="137" text-anchor="middle" font-size="10.5" class="tm">find groups</text>
<rect x="515" y="100" width="145" height="48" rx="8" class="fs" stroke="currentColor"/><text x="587" y="120" text-anchor="middle" font-size="13">7 · Dim. Reduction</text><text x="587" y="137" text-anchor="middle" font-size="10.5" class="tm">fewer columns, plots</text>
<text x="510" y="190" text-anchor="middle" font-size="11" class="tm" font-weight="700">APPLIED PROBLEMS</text>
<rect x="360" y="200" width="145" height="48" rx="8" class="fv" stroke="currentColor"/><text x="432" y="220" text-anchor="middle" font-size="13">8 · Time Series</text><text x="432" y="237" text-anchor="middle" font-size="10.5" class="tm">forecast the future</text>
<rect x="515" y="200" width="145" height="48" rx="8" class="fv" stroke="currentColor"/><text x="587" y="220" text-anchor="middle" font-size="13">9 · Recommenders</text><text x="587" y="237" text-anchor="middle" font-size="10.5" class="tm">who likes what</text>
<rect x="170" y="350" width="340" height="44" rx="9" class="fs" stroke="currentColor" stroke-dasharray="5 3"/><text x="340" y="369" text-anchor="middle" font-size="12.5">Beyond this track</text><text x="340" y="385" text-anchor="middle" font-size="10.5" class="tm">deep learning · NLP · vector databases</text>
<g stroke="currentColor" fill="none" marker-end="url(#mi-tm)">
<line x1="250" y1="64" x2="100" y2="98"/><line x1="300" y1="64" x2="257" y2="98"/><line x1="380" y1="64" x2="432" y2="98"/><line x1="440" y1="64" x2="580" y2="98"/>
<line x1="165" y1="124" x2="183" y2="124"/>
<line x1="175" y1="148" x2="175" y2="176"/>
<line x1="175" y1="226" x2="175" y2="254"/>
<line x1="505" y1="124" x2="513" y2="124"/>
<line x1="330" y1="200" x2="358" y2="220"/>
<line x1="587" y1="148" x2="587" y2="198"/>
<line x1="432" y1="148" x2="432" y2="198" stroke-dasharray="3 3"/>
<line x1="175" y1="304" x2="250" y2="348"/>
<line x1="470" y1="248" x2="420" y2="348"/>
</g>
<text x="300" y="186" font-size="10" class="tm" transform="rotate(32 300 186)">lag features + boosting</text>
<text x="595" y="175" font-size="10" class="tm">matrix factorization</text>
<text x="20" y="330" font-size="10.5" class="tm">Evaluation applies to every supervised group; read it after Trees,</text>
<text x="20" y="344" font-size="10.5" class="tm">but dip into it any time a note mentions precision, AUC or RMSE.</text>
</svg><figcaption>The ML track. Solid arrows are "uses ideas from". Read Foundations first, then the supervised spine 2 → 5, then the unsupervised pair, then the applied groups.</figcaption></figure>
  <h3>Reading order and what each group answers</h3>
  <table class="tbl">
    <tr><th>#</th><th>Group (first note)</th><th>Notes in order</th><th>Question it answers</th><th>Needs</th></tr>
    <tr><td>1</td><td><strong>Foundations</strong></td><td>What is ML · <a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a> · <a class="xref" data-note="ml_core">Bias, Variance</a> · <a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a> · <a class="xref" data-note="ml_regularization">Regularization</a> · <a class="xref" data-note="ml_features">Feature Engineering</a> · <a class="xref" data-note="ml_pipelines">Pipelines &amp; Leakage</a></td><td>How learning works and how to do it honestly</td><td>Basic statistics, Python</td></tr>
    <tr><td>2</td><td><strong>Regression</strong> (<a class="xref" data-note="ml_regression">Linear Regression</a>)</td><td>Linear Regression · <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> · <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> · <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>Predict a number, and explain each input's effect</td><td>Group 1, <a class="xref" data-note="m_linalg">Linear Algebra</a></td></tr>
    <tr><td>3</td><td><strong>Classification</strong> (<a class="xref" data-note="ml_classification">Logistic Regression</a>)</td><td>Logistic Regression · <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> · <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> · <a class="xref" data-note="ml_svm">Support Vector Machines</a></td><td>Predict a class and its probability</td><td>Groups 1–2, <a class="xref" data-note="st_probability">Probability</a></td></tr>
    <tr><td>4</td><td><strong>Tree-Based Models</strong> (<a class="xref" data-note="ml_trees">The Tree Family</a>)</td><td><a class="xref" data-note="ml_dtree">Decision Trees</a> → ensembles: <a class="xref" data-note="ml_bagging">Bagging</a>, <a class="xref" data-note="ml_rf">Random Forest</a>, <a class="xref" data-note="ml_boosting">Boosting</a>, <a class="xref" data-note="ml_gbm">Gradient Boosting</a>, <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a>, <a class="xref" data-note="ml_catboost">CatBoost</a> → <a class="xref" data-note="ml_tree_explain">SHAP</a>, <a class="xref" data-note="ml_tree_tuning">Tuning</a></td><td>The strongest models for tables of data</td><td>Groups 1–3</td></tr>
    <tr><td>5</td><td><strong>Model Evaluation</strong> (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>)</td><td>Classification Metrics · <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> · <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a></td><td>Is the model good enough, and where to set the cut-off?</td><td>Groups 1–3</td></tr>
    <tr><td>6</td><td><strong>Clustering</strong> (<a class="xref" data-note="ml_clustering">The Idea &amp; Distances</a>)</td><td>The Idea · <a class="xref" data-note="ml_kmeans">K-Means</a> · <a class="xref" data-note="ml_hierarchical">Hierarchical</a> · <a class="xref" data-note="ml_dbscan">DBSCAN</a> · <a class="xref" data-note="ml_gmm">GMM</a> · <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a></td><td>Which rows belong together, with no labels?</td><td>Group 1</td></tr>
    <tr><td>7</td><td><strong>Dimensionality Reduction</strong> (<a class="xref" data-note="ml_dimred">Curse of Dimensionality</a>)</td><td>Curse &amp; Feature Selection · <a class="xref" data-note="ml_pca">PCA</a> · <a class="xref" data-note="ml_tsne">t-SNE</a> · <a class="xref" data-note="ml_umap">UMAP</a></td><td>How to shrink many columns and visualise data</td><td>Group 1, <a class="xref" data-note="m_linalg">Linear Algebra</a></td></tr>
    <tr><td>8</td><td><strong>Time Series</strong> (<a class="xref" data-note="ml_timeseries">Basics</a>)</td><td>Basics · <a class="xref" data-note="ml_arima">ARIMA</a> · <a class="xref" data-note="ml_ets_prophet">Exponential Smoothing &amp; Prophet</a> · <a class="xref" data-note="ml_ts_ml">ML Forecasting</a></td><td>Forecast values that depend on time</td><td>Groups 1–5</td></tr>
    <tr><td>9</td><td><strong>Recommender Systems</strong> (<a class="xref" data-note="ml_recsys">Basics &amp; Content-Based</a>)</td><td>Basics · <a class="xref" data-note="ml_cf">Collaborative Filtering</a> · <a class="xref" data-note="ml_mf">Matrix Factorization</a> · <a class="xref" data-note="ml_rs_ranking">Ranking &amp; Cold Start</a></td><td>Which item to show which user</td><td>Groups 1, 5, 7</td></tr>
  </table>
  <h3>Which note answers my question?</h3>
  <table class="tbl">
    <tr><th>If you are asking…</th><th>Go to</th></tr>
    <tr><td>"My training score is great but test is poor"</td><td><a class="xref" data-note="ml_core">Bias, Variance</a>, <a class="xref" data-note="ml_regularization">Regularization</a>, <a class="xref" data-note="ml_pipelines">Leakage</a></td></tr>
    <tr><td>"Which model for a table of customer data?"</td><td>Baseline with <a class="xref" data-note="ml_classification">Logistic Regression</a>, then <a class="xref" data-note="ml_gbm">Gradient Boosting</a> / <a class="xref" data-note="ml_lightgbm">LightGBM</a></td></tr>
    <tr><td>"Accuracy is 99% but the model is useless"</td><td><a class="xref" data-note="ml_evaluation">Classification Metrics</a> (imbalance)</td></tr>
    <tr><td>"Why did the model predict this?"</td><td><a class="xref" data-note="ml_regression">coefficients</a>, <a class="xref" data-note="ml_tree_explain">SHAP</a></td></tr>
    <tr><td>"Segment our customers"</td><td><a class="xref" data-note="ml_kmeans">K-Means</a>, <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a></td></tr>
    <tr><td>"Forecast next month's sales"</td><td><a class="xref" data-note="ml_timeseries">Time Series Basics</a>, <a class="xref" data-note="ml_ts_ml">ML Forecasting</a></td></tr>
    <tr><td>"Images, text, audio"</td><td><a class="xref" data-note="dl_foundations">Deep Learning</a>, <a class="xref" data-note="nlp">NLP</a></td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Every note in groups 2–9 is the four boxes of section 03 with different choices: a family of rules, a loss, a search, an honest check. When a new note feels long, find those four boxes in it first.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Interviews often ask how ML relates to the neighbouring words: statistics, AI, deep learning, data science. A side-by-side table settles it.</div>

  <h2 id="mi-compare"><span class="num">08</span>Comparisons</h2>
  <h3>ML vs neighbouring fields</h3>
  <table class="tbl">
    <tr><th></th><th>Rules-based software</th><th>Classical statistics</th><th>Machine learning</th><th>Deep learning</th></tr>
    <tr><td>Main goal</td><td>Execute known logic</td><td>Understand and test relationships (inference)</td><td>Predict well on new data</td><td>Predict from raw signals (pixels, text, audio)</td></tr>
    <tr><td>Who makes the rule</td><td>A person</td><td>A person picks the model form; data fits it</td><td>Data, within a family you choose</td><td>Data, including the features themselves</td></tr>
    <tr><td>Typical output</td><td>A decision</td><td>Coefficients, p-values, intervals</td><td>Predictions and scores</td><td>Predictions, embeddings</td></tr>
    <tr><td>Judged by</td><td>Correctness against the spec</td><td>Valid assumptions, significance</td><td>Held-out error</td><td>Held-out error</td></tr>
    <tr><td>Data needed</td><td>None</td><td>Small to medium</td><td>Medium (hundreds to millions of rows)</td><td>Large</td></tr>
    <tr><td>Example</td><td>Tax calculator</td><td>"Does the drug lower blood pressure?"</td><td>Churn score per customer</td><td>Speech to text</td></tr>
  </table>
  <p><strong>Artificial intelligence</strong> is the widest circle: any machine behaviour that looks intelligent, including hand-written rules and search (chess engines). <strong>Machine learning</strong> is the part of AI that learns from data. <strong>Deep learning</strong> is the part of ML that uses many-layered neural networks. <strong>Data science</strong> overlaps all of them with analysis, statistics and communication. Linear regression belongs to both statistics and ML; the difference is mostly the question asked (why? vs what next?).</p>
  <h3>The learning types side by side</h3>
  <table class="tbl">
    <tr><th>Type</th><th>Data given</th><th>Learns</th><th>Feedback</th><th>Examples</th><th>Track group</th></tr>
    <tr><td>Supervised</td><td>(X, y)</td><td>X → y</td><td>Right answer per row</td><td>Price, churn, spam</td><td>2, 3, 4, 5, 8</td></tr>
    <tr><td>Unsupervised</td><td>X</td><td>Structure in X</td><td>None</td><td>Segments, PCA, anomalies</td><td>6, 7</td></tr>
    <tr><td>Semi-supervised</td><td>Few (X, y) + many X</td><td>X → y</td><td>Some answers</td><td>Medical scans, tickets</td><td>(technique)</td></tr>
    <tr><td>Self-supervised</td><td>X, labels made from X</td><td>Representations</td><td>Automatic</td><td>GPT, BERT, image embeddings</td><td>Deep learning</td></tr>
    <tr><td>Reinforcement</td><td>Interaction</td><td>Policy</td><td>Delayed reward</td><td>Games, robots, bidding</td><td>Outside track</td></tr>
  </table>

  <h2 id="mi-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: scoring on the training rows</span>
    <p>A model evaluated on the rows it learned from looks better than it is; a kNN with k = 1 or a deep tree scores 100%. Always quote held-out scores (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no baseline</span>
    <p>"95% accuracy" means nothing until you know the majority class is 95%. Compute the dummy score first, every time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: features that will not exist at prediction time</span>
    <p>Using "reason for leaving" to predict churn, or tomorrow's sales to predict today's. The model looks brilliant offline and fails live. Ask of every column: "will I know this at the moment I need the prediction?"</p>
  </div>
  <div class="callout trap"><span class="label">Trap: confusing parameters and hyperparameters</span>
    <p>Parameters come from <code>fit</code>; hyperparameters you set. Tuning hyperparameters on the training score always picks the most complex option.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: type of learning from the data type</span>
    <p>A numeric-looking target (zip code, star rating) is not automatically regression, and a target with two numbers (0/1) is classification. Decide by what a "near miss" means.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: treating deployment as the finish line</span>
    <p>Without monitoring of inputs (PSI) and outcomes (rolling metrics), drift is discovered by angry users. Plan retraining before launch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: picking the model family last</span>
    <p>Learning only finds the best rule <em>inside the family you allowed</em>. An income-only cut-off can never use debt. If the family is wrong, no amount of data fixes it; this is underfitting, the "bias" in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  </div>

  <h2 id="mi-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one sentence, how is machine learning different from ordinary programming?</summary><div class="qa-body">In ordinary programming a person writes the rule and the computer applies it; in ML the person supplies examples with answers and a family of possible rules, and the computer searches for the rule with the lowest error, which is then applied like a program.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State Mitchell's definition and apply it to the loan example.</summary><div class="qa-body">A program learns from experience E for task T and measure P if its performance at T, measured by P, improves with E. T = approve/decline, E = 8 past loans, P = wrong decisions; it went from 3 (hand rule ≥ 50) to 1 (learned rule ≥ 38).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are only midpoints between sorted incomes tried as cut-offs?</summary><div class="qa-body">Any cut-off between two neighbouring incomes splits the customers the same way, so it makes the same mistakes. One value per gap (the midpoint) plus one below and one above all values covers every distinct rule. Decision trees use exactly this trick for numeric features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Parameter vs hyperparameter: define both and give two examples of each.</summary><div class="qa-body">Parameters are learned by fit from the data: linear-regression coefficients, tree split thresholds. Hyperparameters are set before fit and define the model family or training: k in kNN, max_depth of a tree, regularisation strength alpha, learning rate. Parameters minimise training loss; hyperparameters are chosen on validation data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the least-squares line for x = 20, 25, 30, 35, 40 and y = 158, 137, 112, 83, 60.</summary><div class="qa-body">x̄ = 30, ȳ = 110. Σ(x−x̄)(y−ȳ) = −480 −135 + 0 −135 −500 = −1250; Σ(x−x̄)² = 250. w = −5, b = 110 + 150 = 260. MSE = (4+4+4+4+0)/5 = 3.2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Classify each as regression, binary, multiclass or multilabel: house price; fraud yes/no; digit 0–9; tags on a news article.</summary><div class="qa-body">Regression; binary classification; multiclass classification; multilabel classification (an article can have several tags at once).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Supervised vs unsupervised vs semi-supervised vs self-supervised vs reinforcement?</summary><div class="qa-body">Supervised: labelled pairs, learn X → y. Unsupervised: X only, find structure. Semi-supervised: few labels plus many unlabelled rows (self-training gave 0.844 → 0.884 on digits with 50 labels). Self-supervised: labels built from the data itself (next or masked word). Reinforcement: an agent learns a policy from rewards of its own actions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the stages of an ML project. Where do projects most often fail?</summary><div class="qa-body">Frame → data/EDA → features → split, baseline, train/tune → evaluate → deploy → monitor, looping back. Most failures are at the ends: a target nobody can act on or that leaks the answer, training data unlike live data, and no monitoring after launch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An offer costs ₹200, saves a churner half the time, and a saved customer is worth ₹3,000. Above which churn probability should you call?</summary><div class="qa-body">Expected gain = p × 0.5 × 3000 − 200 = 1500p − 200 &gt; 0 → p &gt; 0.133. This links framing to the decision threshold in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>, and is why calibrated probabilities matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Covariate shift, label shift, concept drift: define each and say which input monitoring cannot catch.</summary><div class="qa-body">Covariate: P(X) changes, rule same. Label: P(y) changes. Concept: P(y|X) changes, the same inputs mean a different answer. Concept drift can leave inputs unchanged, so only tracking real outcomes catches it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute PSI for training shares (0.5, 0.5) and current shares (0.3, 0.7). Is it a problem?</summary><div class="qa-body">(0.3−0.5)·ln(0.6) = (−0.2)(−0.511) = 0.102; (0.7−0.5)·ln(1.4) = (0.2)(0.336) = 0.067. PSI = 0.169: moderate shift, investigate (between 0.1 and 0.25).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The majority-class baseline scored 0.626 accuracy and recall 0 on the tumour data. What does that tell you?</summary><div class="qa-body">Any model must beat 0.626 accuracy to be useful at all, and accuracy alone hides that the baseline finds no cancers. It is why the note tracks recall and why <a class="xref" data-note="ml_evaluation">Classification Metrics</a> covers more than accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why was the model chosen on cross-validation and not on the test set? (connection: next note)</summary><div class="qa-body">The test set must stand in for unseen future data. Any choice made by looking at it makes its score optimistic. CV on the training part compares candidates; the test set is touched once at the end. <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a> shows how big the optimism can get.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did the logistic model need a StandardScaler but the random forest did not? (connection: features)</summary><div class="qa-body">Logistic regression adds up weight × value and penalises large weights; with columns on wildly different scales (area ~650 vs smoothness ~0.1) the penalty treats them unequally and the solver converges slowly. Trees only ask "is this column ≤ t?", which does not change if a column is rescaled. More in <a class="xref" data-note="ml_features">Feature Engineering</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four ingredients common to every learning algorithm? Name them for k-means.</summary><div class="qa-body">A family of candidate rules, a loss, a search method, and an honest check on unseen data. k-means: k centres; total squared distance of points to their centre; alternate assign-points / move-centres; and (with no labels) internal cluster scores and business checks.</div></details>
</main>
`
});
